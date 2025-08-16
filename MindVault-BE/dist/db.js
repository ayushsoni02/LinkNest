"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkModel = exports.tagModel = exports.ContentModel = exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
require('dotenv').config();
const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
    throw new Error("MONGO_URL is not defined in the environment variables");
}
mongoose_1.default.connect(mongoUrl);
const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: String,
    googleId: { type: String, unique: true, sparse: true },
});
exports.userModel = mongoose_1.default.model('users', UserSchema);
const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{ type: mongoose_1.default.Types.ObjectId, ref: 'Tag' }],
    type: String,
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'users', required: true }
});
exports.ContentModel = mongoose_1.default.model('contents', ContentSchema);
const tagSchema = new Schema({
    title: String,
});
exports.tagModel = mongoose_1.default.model('tags', tagSchema);
const LinkSchema = new Schema({
    hash: String,
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'User', required: true },
});
exports.linkModel = mongoose_1.default.model('links', LinkSchema);
