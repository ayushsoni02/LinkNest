import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ContentModel, linkModel, userModel, NestModel } from './db';
import dotenv from 'dotenv';
import { JWT_PASSWORD } from './conf';

dotenv.config();
import { userMiddleware } from './middleware';
import { random, sanitizeString } from './utils';
import { generateLinkDigest, generateTextEmbedding } from './services/aiService';
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

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
