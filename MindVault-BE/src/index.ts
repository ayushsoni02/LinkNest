import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ContentModel, linkModel, userModel, NestModel } from './db';
import dotenv from 'dotenv';
import { JWT_PASSWORD } from './conf';

dotenv.config();
import { userMiddleware } from './middleware';
import { random } from './utils';
import authRoutes from "./auth";
import cors from "cors";
import path from "path";
import passport from 'passport';
import session from 'express-session';
import { configurePassport } from './passport';
import { analyzeURL, batchAnalyzeURLs, suggestNest } from './aiService';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(express.json());
app.use(cors());
// app.use(express.static(path.join(__dirname, 'build')));

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

// Rate limiter for AI endpoints (5 requests per minute per user)
const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_PER_USER || '5'),
    message: 'Too many AI requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// AI Analysis Endpoints
app.post('/api/v1/ai/analyze', userMiddleware, aiRateLimiter, async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            res.status(400).json({ message: 'URL is required' });
            return;
        }

        // Analyze URL with AI
        const analysis = await analyzeURL(url);

        res.json({ analysis });
    } catch (error: any) {
        console.error('AI analyze error:', error);
        res.status(500).json({ message: error.message || 'AI analysis failed' });
    }
});

app.post('/api/v1/ai/batch-analyze', userMiddleware, aiRateLimiter, async (req, res) => {
    try {
        const { urls } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            res.status(400).json({ message: 'URLs array is required' });
            return;
        }

        if (urls.length > 10) {
            res.status(400).json({ message: 'Maximum 10 URLs allowed per batch' });
            return;
        }

        // Batch analyze URLs
        const results = await batchAnalyzeURLs(urls);

        res.json({ results });
    } catch (error: any) {
        console.error('Batch analyze error:', error);
        res.status(500).json({ message: error.message || 'Batch analysis failed' });
    }
});

app.post('/api/v1/ai/suggest-nest', userMiddleware, async (req, res) => {
    try {
        const { title, summary, tags } = req.body;
        // @ts-ignore
        const userId = req.userId;

        if (!title || !summary) {
            res.status(400).json({ message: 'Title and summary are required' });
            return;
        }

        // Get user's nests
        const nests = await NestModel.find({ userId });

        // Suggest best nest
        const suggestedNestId = await suggestNest(
            { title, summary, tags: tags || [] },
            nests.map(n => ({
                _id: n._id.toString(),
                name: n.name,
                description: n.description || undefined
            }))
        );


        res.json({ suggestedNestId });
    } catch (error: any) {
        console.error('Suggest nest error:', error);
        res.status(500).json({ message: error.message || 'Nest suggestion failed' });
    }
});

app.post('/api/v1/content', userMiddleware, async (req, res) => {
    const type = req.body.type;
    const link = req.body.link;
    const title = req.body.title;
    const tags = req.body.tags || [];
    const summary = req.body.summary;
    const aiMetadata = req.body.aiMetadata;
    const extractedContent = req.body.extractedContent;
    const nestId = req.body.nestId || null;
    // @ts-ignore
    const userId = req.userId;
    console.log("Creating content for user:", userId);
    console.log("Payload:", { type, link, title, tags, nestId });

    await ContentModel.create({
        link,
        type,
        title,
        tags,
        summary,
        aiMetadata,
        extractedContent,
        nestId,
        //@ts-ignore
        userId: req.userId,
    })

    res.json({
        message: 'Content created successfully',
    });

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

//  "title":"talk about the trump",
//    "link":"google.com/cnw.pdf"

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

// Nest CRUD endpoints
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

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });


app.get('/ping', (req, res) => {
    res.send({ status: 'ok' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');

});
