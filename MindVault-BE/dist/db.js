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
exports.linkModel = exports.ContentModel = exports.NestModel = exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
require('dotenv').config();
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Hide credentials in logs, but verify the variable exists
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is missing from environment variables");
        }
        yield mongoose_1.default.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of hanging
        });
        console.log("✅ MongoDB Connected Successfully");
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("❌ MongoDB Connection Failed:", message);
        // DO NOT let the process crash; Render will keep trying to restart it
        console.log("Retrying connection in 5 seconds...");
        setTimeout(connectDB, 5000);
    }
});
connectDB();
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true },
});
exports.userModel = mongoose_1.default.model('users', UserSchema);
const NestSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'users', required: true },
    createdAt: { type: Date, default: Date.now }
});
exports.NestModel = mongoose_1.default.model('nests', NestSchema);
const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [String],
    type: String,
    summary: String,
    aiMetadata: {
        model: String,
        tokensUsed: Number,
        processingTime: Number,
        extractedContentLength: Number
    },
    extractedContent: String,
    nestId: { type: mongoose_1.default.Types.ObjectId, ref: 'nests', default: null },
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'users', required: true },
    createdAt: { type: Date, default: Date.now }
});
exports.ContentModel = mongoose_1.default.model('contents', ContentSchema);
const LinkSchema = new Schema({
    hash: String,
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'users', required: true },
});
exports.linkModel = mongoose_1.default.model('links', LinkSchema);
