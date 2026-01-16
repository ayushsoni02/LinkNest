import mongoose from "mongoose";
const Schema = mongoose.Schema;
require('dotenv').config()



const connectDB = async () => {
    try {
        // Hide credentials in logs, but verify the variable exists
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is missing from environment variables");
        }

        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of hanging
        });

        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("❌ MongoDB Connection Failed:", message);
        // DO NOT let the process crash; Render will keep trying to restart it
        console.log("Retrying connection in 5 seconds...");
        setTimeout(connectDB, 5000);
    }
};

connectDB();


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

