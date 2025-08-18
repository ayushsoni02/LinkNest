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
exports.refreshAccessToken = exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncHandler_1 = require("../utils/asyncHandler");
const user_model_1 = require("../models/user.model");
const apiError_1 = __importDefault(require("../utils/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
//const JWT_PASSWORD = process.env.JWT_SECRET || 'your-secret-key';
const generateAccessAndRefreshTokens = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.userModel.findById(userId);
        if (!user) {
            throw new apiError_1.default(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        yield user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new apiError_1.default(500, "Something went wrong while generating refresh and access tokens");
    }
});
const registerUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        throw new apiError_1.default(400, "All fields are required");
    }
    if (password.length < 6) {
        throw new apiError_1.default(400, "Password must be at least 6 characters long");
    }
    const existingUser = yield user_model_1.userModel.findOne({
        $or: [{ email }, { username }]
    });
    if (existingUser) {
        throw new apiError_1.default(409, "User already exists");
    }
    const newUser = yield user_model_1.userModel.create({
        username,
        password,
        email
    });
    const { accessToken, refreshToken } = yield generateAccessAndRefreshTokens(newUser._id);
    const userResponse = {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
    };
    res.status(201).json(new apiResponse_1.default(201, { user: userResponse, accessToken, refreshToken }, "User created successfully"));
}));
exports.registerUser = registerUser;
const loginUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new apiError_1.default(400, "Email and password are required");
    }
    const user = yield user_model_1.userModel.findOne({ email }).select('+password');
    if (!user) {
        throw new apiError_1.default(401, "Invalid credentials");
    }
    const isPasswordValid = yield user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new apiError_1.default(401, "Invalid credentials");
    }
    const { accessToken, refreshToken } = yield generateAccessAndRefreshTokens(user._id);
    const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
    };
    res.status(200).json(new apiResponse_1.default(200, { user: userResponse, accessToken, refreshToken }, "Login successful"));
}));
exports.loginUser = loginUser;
const refreshAccessToken = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new apiError_1.default(400, "Refresh token is required");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh-secret');
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            throw new apiError_1.default(401, "Refresh token has expired");
        }
        const user = yield user_model_1.userModel.findById(decoded._id);
        if (!user || user.refreshToken !== refreshToken) {
            throw new apiError_1.default(401, "Invalid refresh token");
        }
        const accessToken = user.generateAccessToken();
        return res.status(200).json(new apiResponse_1.default(200, { accessToken }, "Access token refreshed successfully"));
    }
    catch (error) {
        throw new apiError_1.default(401, "Invalid or expired refresh token");
    }
}));
exports.refreshAccessToken = refreshAccessToken;
const getCurrentUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        throw new apiError_1.default(401, "User not authenticated");
    }
    res.status(200).json(new apiResponse_1.default(200, user, "User profile retrieved successfully"));
}));
exports.getCurrentUser = getCurrentUser;
