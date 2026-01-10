import mongoose from "mongoose";
const Schema = mongoose.Schema;
require('dotenv').config()



const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
    throw new Error("MONGO_URL is not defined in the environment variables");
}
mongoose.connect(mongoUrl);


const UserSchema = new Schema({

    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true },
});

export const userModel = mongoose.model('users', UserSchema);

const NestSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    userId: { type: mongoose.Types.ObjectId, ref: 'users', required: true },
    createdAt: { type: Date, default: Date.now }
});

export const NestModel = mongoose.model('nests', NestSchema);

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
    nestId: { type: mongoose.Types.ObjectId, ref: 'nests', default: null },
    userId: { type: mongoose.Types.ObjectId, ref: 'users', required: true },
    createdAt: { type: Date, default: Date.now }
});


export const ContentModel = mongoose.model('contents', ContentSchema);

const LinkSchema = new Schema({
    hash: String,
    userId: { type: mongoose.Types.ObjectId, ref: 'users', required: true },
});

export const linkModel = mongoose.model('links', LinkSchema);

