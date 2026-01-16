"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
const auth_1 = __importDefault(require("./auth"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const passport_2 = require("./passport");
const metadataExtractor_1 = require("./metadataExtractor");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Session setup for Passport
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
// Initialize Passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
(0, passport_2.configurePassport)();
// Auth routes
app.use('/api/v1/auth', auth_1.default);
// Metadata Extraction Endpoint (fast, no AI)
app.post('/api/v1/extract', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url } = req.body;
        if (!url) {
            res.status(400).json({ message: 'URL is required' });
            return;
        }
        // Extract metadata with high speed
        const metadata = yield (0, metadataExtractor_1.extractMetadata)(url);
        res.json({ metadata });
    }
    catch (error) {
        console.error('Extract error:', error);
        res.status(500).json({ message: error.message || 'Metadata extraction failed' });
    }
}));
// Content CRUD Endpoints
app.post('/api/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    yield db_1.ContentModel.create({
        link,
        type,
        title,
        tags,
        description,
        image,
        nestId,
        //@ts-ignore
        userId: req.userId,
    });
    res.json({
        message: 'Content created successfully',
    });
}));
app.get('/api/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const content = yield db_1.ContentModel.find({
        userId: userId,
    })
        .populate("nestId", "name description")
        .populate("userId", "username")
        .sort({ createdAt: -1 });
    res.json({
        content
    });
}));
app.delete('/api/v1/content', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    yield db_1.ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId,
    });
    res.json({
        message: 'Content deleted successfully',
    });
}));
app.post('/api/v1/brain/share', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        const existingLink = yield db_1.linkModel.findOne({
            //@ts-ignore
            userId: req.userId,
        });
        if (existingLink) {
            res.json({
                hash: existingLink.hash,
            });
            return;
        }
        const hash = (0, utils_1.random)(10);
        yield db_1.linkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: hash,
        });
        res.json({
            hash,
        });
    }
    else {
        yield db_1.linkModel.deleteOne({
            //@ts-ignore
            userId: req.userId,
        });
        res.json({
            message: "Removed Link",
        });
    }
}));
app.get('/api/v1/brain/:shareLink', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.linkModel.findOne({
        hash,
    });
    if (!link) {
        res.status(404).json({
            message: 'Link not found',
        });
        return;
    }
    const content = yield db_1.ContentModel.find({
        userId: link.userId,
    });
    const user = yield db_1.userModel.findOne({
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
    });
}));
app.delete('/api/v1/content/:id', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.params.id;
    try {
        yield db_1.ContentModel.deleteOne({
            _id: contentId,
            // @ts-ignore
            userId: req.userId
        });
        res.json({ message: 'Content deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to delete content' });
    }
}));
// Nest CRUD endpoints
app.post('/api/v1/nests', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        // @ts-ignore
        const userId = req.userId;
        if (!name) {
            res.status(400).json({ message: 'Nest name is required' });
            return;
        }
        const nest = yield db_1.NestModel.create({
            name,
            description,
            userId
        });
        res.json({ nest });
    }
    catch (err) {
        console.error('Create nest error:', err);
        res.status(500).json({ message: 'Failed to create nest' });
    }
}));
app.get('/api/v1/nests', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.userId;
        const nests = yield db_1.NestModel.find({ userId }).sort({ createdAt: -1 });
        res.json({ nests });
    }
    catch (err) {
        console.error('Get nests error:', err);
        res.status(500).json({ message: 'Failed to fetch nests' });
    }
}));
app.delete('/api/v1/nests/:id', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nestId = req.params.id;
        // @ts-ignore
        const userId = req.userId;
        yield db_1.NestModel.deleteOne({ _id: nestId, userId });
        // Unassign all content from this nest
        yield db_1.ContentModel.updateMany({ nestId: nestId }, { nestId: null });
        res.json({ message: 'Nest deleted successfully' });
    }
    catch (err) {
        console.error('Delete nest error:', err);
        res.status(500).json({ message: 'Failed to delete nest' });
    }
}));
// rename nest
app.put('/api/v1/nests/:id', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nestId = req.params.id;
        const { name } = req.body;
        // @ts-ignore
        const userId = req.userId;
        if (!name) {
            res.status(400).json({ message: 'Nest name is required' });
            return;
        }
        yield db_1.NestModel.updateOne({ _id: nestId, userId }, { name });
        res.json({ message: 'Nest renamed successfully' });
    }
    catch (err) {
        console.error('Rename nest error:', err);
        res.status(500).json({ message: 'Failed to rename nest' });
    }
}));
app.put('/api/v1/content/:id', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contentId = req.params.id;
        const { nestId, tags } = req.body;
        // @ts-ignore
        const userId = req.userId;
        const updateData = {};
        if (nestId !== undefined)
            updateData.nestId = nestId;
        if (tags !== undefined)
            updateData.tags = tags;
        yield db_1.ContentModel.updateOne({ _id: contentId, userId }, updateData);
        res.json({ message: 'Content updated successfully' });
    }
    catch (err) {
        console.error('Update content error:', err);
        res.status(500).json({ message: 'Failed to update content' });
    }
}));
app.get('/ping', (req, res) => {
    res.send({ status: 'ok' });
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
