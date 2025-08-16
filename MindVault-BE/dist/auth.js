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
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const conf_1 = require("./conf");
const router = express_1.default.Router();
// Regular sign-up route
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    try {
        const newUser = yield db_1.userModel.create({
            username: username,
            password: password,
            email: email
        });
        const token = jsonwebtoken_1.default.sign({
            id: newUser._id,
        }, conf_1.JWT_PASSWORD);
        res.json({
            token: `Bearer ${token}`,
            message: 'User created successfully',
        });
    }
    catch (e) {
        res.status(411).json({
            message: 'User already exists',
        });
    }
}));
// Regular sign-in route
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const existingUser = yield db_1.userModel.findOne({
        username,
        password
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({
            id: existingUser._id,
        }, conf_1.JWT_PASSWORD);
        res.json({
            token: `Bearer ${token}`,
        });
    }
    else {
        res.status(401).json({
            message: 'Invalid username or password',
        });
    }
}));
// Google OAuth routes
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email']
}));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false, failureRedirect: '/signin' }), (req, res) => {
    // Generate JWT token for the authenticated user
    const token = jsonwebtoken_1.default.sign({
        id: req.user._id,
    }, conf_1.JWT_PASSWORD);
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
});
// User info route
router.get('/me', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract userId from token
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, conf_1.JWT_PASSWORD);
        const user = yield db_1.userModel.findById(decoded.id).select('username email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})));
exports.default = router;
