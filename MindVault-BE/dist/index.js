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
const aiService_1 = require("./aiService");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// app.use(express.static(path.join(__dirname, 'build')));
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
// Rate limiter for AI endpoints (5 requests per minute per user)
const aiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_PER_USER || '5'),
    message: 'Too many AI requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
// AI Analysis Endpoints
app.post('/api/v1/ai/analyze', middleware_1.userMiddleware, aiRateLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url } = req.body;
        if (!url) {
            res.status(400).json({ message: 'URL is required' });
            return;
        }
        // Analyze URL with AI
        const analysis = yield (0, aiService_1.analyzeURL)(url);
        res.json({ analysis });
    }
    catch (error) {
        console.error('AI analyze error:', error);
        res.status(500).json({ message: error.message || 'AI analysis failed' });
    }
}));
app.post('/api/v1/ai/batch-analyze', middleware_1.userMiddleware, aiRateLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const results = yield (0, aiService_1.batchAnalyzeURLs)(urls);
        res.json({ results });
    }
    catch (error) {
        console.error('Batch analyze error:', error);
        res.status(500).json({ message: error.message || 'Batch analysis failed' });
    }
}));
app.post('/api/v1/ai/suggest-nest', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, summary, tags } = req.body;
        // @ts-ignore
        const userId = req.userId;
        if (!title || !summary) {
            res.status(400).json({ message: 'Title and summary are required' });
            return;
        }
        // Get user's nests
        const nests = yield db_1.NestModel.find({ userId });
        // Suggest best nest
        const suggestedNestId = yield (0, aiService_1.suggestNest)({ title, summary, tags: tags || [] }, nests.map(n => ({
            _id: n._id.toString(),
            name: n.name,
            description: n.description || undefined
        })));
        res.json({ suggestedNestId });
    }
    catch (error) {
        console.error('Suggest nest error:', error);
        res.status(500).json({ message: error.message || 'Nest suggestion failed' });
    }
}));
app.post('/api/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    yield db_1.ContentModel.create({
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
//  "title":"talk about the trump",
//    "link":"google.com/cnw.pdf"
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
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });
app.get('/ping', (req, res) => {
    res.send({ status: 'ok' });
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
