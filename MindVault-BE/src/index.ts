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
    const type = req.body.type;
    const link = req.body.link;
    const title = req.body.title;
    const tags = req.body.tags || [];
    const description = req.body.description;
    const image = req.body.image;
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
        description,
        image,
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

app.get('/ping', (req, res) => {
    res.send({ status: 'ok' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
