import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ContentModel, linkModel, userModel, NestModel } from './db';
import dotenv from 'dotenv';
import { JWT_PASSWORD } from './conf';

dotenv.config();
import { userMiddleware } from './middleware';
import { random, sanitizeString } from './utils';
import { generateLinkDigest, generateTextEmbedding, genai } from './services/aiService';
import authRoutes from "./auth";
import cors from "cors";

import passport from 'passport';
import session from 'express-session';
import { configurePassport } from './passport';
import { extractMetadata } from './metadataExtractor';

const app = express();
app.use(express.json());
app.use(cors());

// Session setup for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Auth routes
app.use('/api/v1/auth', authRoutes);

// Metadata Extraction Endpoint (fast, no AI)
app.post('/api/v1/extract', userMiddleware, async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            res.status(400).json({ message: 'URL is required' });
            return;
        }

        // Extract metadata with high speed
        const metadata = await extractMetadata(url);

        res.json({ metadata });
    } catch (error: any) {
        console.error('Extract error:', error);
        res.status(500).json({ message: error.message || 'Metadata extraction failed' });
    }
});

// Content CRUD Endpoints
app.post('/api/v1/content', userMiddleware, async (req, res) => {
    try {
        const type = req.body.type;
        const link = req.body.link;
        // Sanitize string inputs (1000 for title, 5000 for description to prevent DB bloat/limits)
        const title = sanitizeString(req.body.title, 1000);
        const tags = req.body.tags || [];
        const description = sanitizeString(req.body.description, 5000);
        const image = req.body.image;
        const nestId = req.body.nestId || null;
        // @ts-ignore
        const userId = req.userId;
        console.log("Creating content for user:", userId);
        console.log("Payload:", { type, link, title, tags, nestId });

        // AI Summarization Pipeline
        const contextString = type === 'youtube' 
            ? `Video Title: ${title}\nDescription: ${description}`
            : (description || title);
            
        console.log("Generating AI Digest...");
        const aiDigest = await generateLinkDigest(contextString);
        console.log("AI Digest Complete.");

        console.log("Generating Vector Embeddings...");
        const textContext = `${title} ${description} ${aiDigest.summary}`.substring(0, 2000);
        const vectorArray = await generateTextEmbedding(textContext);
        console.log("Vector Embeddings Generated.");

        await ContentModel.create({
            link,
            type,
            title,
            tags,
            description,
            image,
            nestId,
            userId,
            aiSummary: aiDigest.summary,
            aiKeyPoints: aiDigest.keyPoints,
            embedding: vectorArray
        });

        res.json({
            message: 'Content created successfully',
            aiSummary: aiDigest.summary,
            aiKeyPoints: aiDigest.keyPoints
        });
    } catch (err: any) {
        console.error('Save content error in DB transaction:', err);
        res.status(500).json({ 
            message: 'Failed to save content. It may contain invalid characters or exceed length limits.',
            error: err.message
        });
    }
});

app.get('/api/v1/content', userMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId,
    })
        .populate("nestId", "name description")
        .populate("userId", "username")
        .sort({ createdAt: -1 });

    res.json({
        content
    });
});

app.delete('/api/v1/content', async (req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId,
    })

    res.json({
        message: 'Content deleted successfully',
    });
});

app.post('/api/v1/brain/share', userMiddleware, async (req, res) => {
    const share = req.body.share;

    if (share) {
        const existingLink = await linkModel.findOne({
            //@ts-ignore
            userId: req.userId,
        });

        if (existingLink) {
            res.json({
                hash: existingLink.hash,
            })
            return;
        }

        const hash = random(10);
        await linkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: hash,
        })
        res.json({
            hash,
        })
    } else {
        await linkModel.deleteOne({
            //@ts-ignore
            userId: req.userId,
        });

        res.json({
            message: "Removed Link",
        });
    }

});

app.get('/api/v1/brain/:shareLink', async (req, res) => {
    const hash = req.params.shareLink;
    const link = await linkModel.findOne({
        hash,
    })

    if (!link) {
        res.status(404).json({
            message: 'Link not found',
        });
        return;
    }

    const content = await ContentModel.find({
        userId: link.userId,
    })

    const user = await userModel.findOne({
        _id: link.userId
    });

    if (!user) {
        res.status(404).json({
            message: 'User not found',
        });
        return;
    }
    res.json({
        username: user.username,
        content: content,
    })
});

app.delete('/api/v1/content/:id', userMiddleware, async (req, res) => {
    const contentId = req.params.id;
    try {
        await ContentModel.deleteOne({
            _id: contentId,
            // @ts-ignore
            userId: req.userId
        });
        res.json({ message: 'Content deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete content' });
    }
});

// Public Nest Fetch Endpoint
app.get('/api/v1/public/nests/:shareToken', async (req: any, res: any) => {
    try {
        const { shareToken } = req.params;

        // 1. Fetch the target nest using the token slug
        const nest = await NestModel.findOne({ shareToken });
        if (!nest) {
            return res.status(404).json({ message: "Shared workspace collection not found." });
        }

        // 2. Strict Security Boundary Check
        if (!nest.isPublic) {
            return res.status(403).json({ message: "This workspace has been set to private by the owner." });
        }

        // 3. Extract all content items mapped to this specific Nest ID
        const contents = await ContentModel.find({ nestId: nest._id })
            .select('-embedding') // Strip heavy high-dimensional vector arrays to optimize payload velocity
            .lean();

        // 4. Return stripped response optimized for public read-only views
        return res.status(200).json({
            nest: {
                name: nest.name,
                isPublic: nest.isPublic,
                shareToken: nest.shareToken
            },
            contents
        });

    } catch (error: any) {
        console.error("Public Nest Extraction Failure:", error.message);
        return res.status(500).json({ message: "Internal server processing drop encountered." });
    }
});

// Nest CRUD endpoints
app.post('/api/v1/nests/duplicate', userMiddleware, async (req: any, res: any) => {
    try {
        const { shareToken } = req.body;
        const activeUserId = req.userId;

        // 1. Fetch source public nest context
        const sourceNest = await NestModel.findOne({ shareToken, isPublic: true });
        if (!sourceNest) {
            return res.status(404).json({ message: "Source shared collection is private or missing." });
        }

        // 2. Generate a fresh duplicate Nest container mapped to the active user
        const clonedNest = await NestModel.create({
            name: `${sourceNest.name} (Cloned)`,
            userId: activeUserId,
            isPublic: false, // Default to private for the duplicating user
        });

        // 3. Query all content assets attached to the source Nest
        const sourceContents = await ContentModel.find({ nestId: sourceNest._id });

        if (sourceContents.length > 0) {
            // 4. Map assets to the new user context, preserving titles, descriptions, and vector embeddings
            const duplicatedPayloads = sourceContents.map(item => ({
                userId: activeUserId,
                nestId: clonedNest._id,
                type: item.type,
                link: item.link,
                title: item.title,
                description: item.description,
                aiSummary: item.aiSummary,
                aiKeyPoints: item.aiKeyPoints,
                embedding: item.embedding || [], // Maintain embeddings so RAG works instantly out-of-the-box
                tags: item.tags,
                image: item.image
            }));

            await ContentModel.insertMany(duplicatedPayloads);
        }

        return res.status(201).json({
            message: "Nest cloned successfully to your MindVault!",
            newNestId: clonedNest._id
        });

    } catch (error: any) {
        console.error("Duplication Loop Failure:", error.message);
        return res.status(500).json({ message: "Cloning transaction broken." });
    }
});

app.patch('/api/v1/nests/:id/toggle-public', userMiddleware, async (req: any, res: any) => {
    try {
        const nestId = req.params.id;
        const userId = req.userId;
        const { isPublic } = req.body;

        const nest = await NestModel.findOneAndUpdate(
            { _id: nestId, userId },
            { isPublic },
            { new: true }
        );

        if (!nest) {
            return res.status(404).json({ message: "Nest not found or unauthorized." });
        }

        return res.status(200).json({
            message: `Nest is now ${nest.isPublic ? 'public' : 'private'}`,
            nest
        });
    } catch (error: any) {
        console.error("Toggle Public Failure:", error.message);
        return res.status(500).json({ message: "Failed to toggle public state." });
    }
});

app.post('/api/v1/nests', userMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body;
        // @ts-ignore
        const userId = req.userId;

        if (!name) {
            res.status(400).json({ message: 'Nest name is required' });
            return;
        }

        const nest = await NestModel.create({
            name,
            description,
            userId
        });

        res.json({ nest });
    } catch (err) {
        console.error('Create nest error:', err);
        res.status(500).json({ message: 'Failed to create nest' });
    }
});

app.get('/api/v1/nests', userMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const nests = await NestModel.find({ userId }).sort({ createdAt: -1 });
        res.json({ nests });
    } catch (err) {
        console.error('Get nests error:', err);
        res.status(500).json({ message: 'Failed to fetch nests' });
    }
});

app.delete('/api/v1/nests/:id', userMiddleware, async (req, res) => {
    try {
        const nestId = req.params.id;
        // @ts-ignore
        const userId = req.userId;

        await NestModel.deleteOne({ _id: nestId, userId });

        // Unassign all content from this nest
        await ContentModel.updateMany(
            { nestId: nestId },
            { nestId: null }
        );

        res.json({ message: 'Nest deleted successfully' });
    } catch (err) {
        console.error('Delete nest error:', err);
        res.status(500).json({ message: 'Failed to delete nest' });
    }
});

// rename nest
app.put('/api/v1/nests/:id', userMiddleware, async (req, res) => {
    try {
        const nestId = req.params.id;
        const { name } = req.body;
        // @ts-ignore
        const userId = req.userId;

        if (!name) {
            res.status(400).json({ message: 'Nest name is required' });
            return;
        }

        await NestModel.updateOne(
            { _id: nestId, userId },
            { name }
        );

        res.json({ message: 'Nest renamed successfully' });
    } catch (err) {
        console.error('Rename nest error:', err);
        res.status(500).json({ message: 'Failed to rename nest' });
    }
});

app.put('/api/v1/content/:id', userMiddleware, async (req, res) => {
    try {
        const contentId = req.params.id;
        const { nestId, tags } = req.body;
        // @ts-ignore
        const userId = req.userId;

        const updateData: any = {};
        if (nestId !== undefined) updateData.nestId = nestId;
        if (tags !== undefined) updateData.tags = tags;

        await ContentModel.updateOne(
            { _id: contentId, userId },
            updateData
        );

        res.json({ message: 'Content updated successfully' });
    } catch (err) {
        console.error('Update content error:', err);
        res.status(500).json({ message: 'Failed to update content' });
    }
});

const calculateCosineSimilarity = (vecA: number[], vecB: number[]) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        mA += vecA[i] * vecA[i];
        mB += vecB[i] * vecB[i];
    }
    if (mA === 0 || mB === 0) return 0;
    return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
};

app.post('/api/v1/nests/:nestId/chat', userMiddleware, async (req: any, res: any) => {
    try {
        const { nestId } = req.params;
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(404).json({ message: "Empty query string provided." });
        }

        // 1. Vectorize the incoming user question using our upgraded live model
        const queryVector = await generateTextEmbedding(message);

        // 2. Query all resource assets saved inside this specific Nest container
        const contextDocuments = await ContentModel.find({ nestId }).lean();

        if (!contextDocuments || contextDocuments.length === 0) {
            return res.status(200).json({
                answer: "This Nest workspace is currently empty. Please drop and save a few technical links first so I can analyze them and answer your questions!"
            });
        }

        // 3. Compute vector matrix similarity scores locally
        const scoredDocs = contextDocuments.map(doc => {
            const similarity = calculateCosineSimilarity(queryVector, doc.embedding || []);
            return { ...doc, similarityScore: similarity };
        });

        // 4. Sort by highest score and isolate top 3 matching chunks
        const highlyRelevantDocs = scoredDocs
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, 3);

        // 5. Synthesize context payload for the prompt window injection
        const contextualReferenceText = highlyRelevantDocs
            .map(d => `Source Title: ${d.title}\nSource Overview: ${d.description}\nAI Smart Digest: ${d.aiSummary}`)
            .join('\n\n---\n\n');

        // 6. Invoke gemini-2.5-flash with deep structural system grounding instructions
        const ragSystemPrompt = `You are an elite, institutional-grade technical AI tutor assisting a software engineer preparing for competitive system design and core CS interviews.
      Analyze the user's interview question by relying strictly on the following highly relevant reference insights extracted from their saved items inside this workspace Nest container.

      ---
      RELEVANT WORKSPACE CONTEXT:
      ${contextualReferenceText}
      ---

      USER INTERVIEW QUESTION:
      "${message}"

      INSTRUCTIONS:
      - Answer the question directly using professional, structured bullet points, clear hierarchy, and line breaks.
      - Base your primary architectural logic on the provided workspace context insights.
      - If the answer cannot be confidently inferred from the reference context, leverage your extensive system design expertise to deliver an advanced textbook-level response, but explicitly append a subtle note at the very end stating: '[Grounded baseline extensions applied; asset context was thin].'
      - Do not make up fake details or references that don't exist.`;

        // --- Phase 5: Hit the generation cascade with high-availability retry ---
        console.log("🧠 Transmitting contextual payload matrix to Gemini generation cascade...");
        
        const chatModelCascade = ['gemini-2.5-flash', 'gemini-1.5-flash']; // Alternate stable endpoints
        let finalResponseText = "";

        for (const modelName of chatModelCascade) {
            try {
                console.log(`🚀 Attempting RAG Response Synthesis via: [${modelName}]...`);
                const modelResponse = await genai.models.generateContent({
                    model: modelName,
                    contents: ragSystemPrompt
                });

                if (modelResponse && modelResponse.text) {
                    finalResponseText = modelResponse.text;
                    console.log(`✅ Success: RAG compilation completed using [${modelName}]!`);
                    break; // Break the cascade once we get a valid stream
                }
            } catch (cascadeError: any) {
                console.warn(`⚠️ Warning: Chat generation failed on [${modelName}]: ${cascadeError.message}`);
                if (modelName === chatModelCascade[chatModelCascade.length - 1]) {
                    throw new Error("All upstream text generation models are currently overloaded.");
                }
                // Continue loop to fallback seamlessly
                continue;
            }
        }

        return res.status(200).json({
            response: finalResponseText || "Context translation processed into temporary queue layout.",
            answer: finalResponseText || "Context translation processed into temporary queue layout.",
            sources: highlyRelevantDocs.map(d => ({ title: d.title, link: d.link }))
        });

    } catch (error: any) {
        console.error("❌ RAG In-Memory Calculation Matcher Failed:", error.message);
        return res.status(500).json({ message: "Internal server processing drop encountered inside the RAG loop." });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
