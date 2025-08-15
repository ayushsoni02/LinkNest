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
const path_1 = __importDefault(require("path"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const passport_2 = require("./passport");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'build')));
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
// app.post('/api/v1/signup', async (req, res) => {
//     const username = req.body.username;
//     const password = req.body.password;
//     const email = req.body.email;
//     try {
//       const newUser = await userModel.create({
//             username: username,
//             password: password,
//             email: email
//         })
//         const token = jwt.sign({
//             id: newUser._id,
//         }, JWT_PASSWORD);
//         // console.log(token);
//            res.json({
//            token: `Bearer ${token}`,
//            message: 'User created successfully',
//             });
//     } catch (e) {
//         res.status(411).json({
//             message: 'User already exists',
//         })
//     }
// });
// app.post('/api/v1/signin', async (req, res) => {
//     const { username, password } = req.body;
//     const existingUser = await userModel.findOne({
//         username,
//         password
//     });
//     if (existingUser) {
//         const token = jwt.sign({
//             id: existingUser._id,
//         }, JWT_PASSWORD);
//         res.json({
//           token: `Bearer ${token}`,
//         });
//     } else {
//         res.status(401).json({
//             message: 'Invalid username or password',
//         });
//     }
// });
app.post('/api/v1/content', middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.body.type;
    const link = req.body.link;
    yield db_1.ContentModel.create({
        link,
        type,
        title: req.body.title,
        //@ts-ignore
        userId: req.userId,
        tags: [],
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
    }).populate("userId", "username");
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
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'build', 'index.html'));
});
app.get('/ping', (req, res) => {
    res.send({ status: 'ok' });
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
