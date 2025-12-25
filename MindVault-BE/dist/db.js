"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkModel = exports.ContentModel = exports.NestModel = exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
require('dotenv').config();
const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
    throw new Error("MONGO_URL is not defined in the environment variables");
}
mongoose_1.default.connect(mongoUrl);
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
