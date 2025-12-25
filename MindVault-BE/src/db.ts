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

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
    type: String,
    userId: { type: mongoose.Types.ObjectId, ref: 'users', required: true }
});

export const ContentModel = mongoose.model('contents', ContentSchema);

// const tagSchema = new Schema({

//     title:String,
// });

// export const tagModel = mongoose.model('tags', tagSchema);

const LinkSchema = new Schema({
    hash: String,
    userId: { type: mongoose.Types.ObjectId, ref: 'users', required: true },
});

export const linkModel = mongoose.model('links', LinkSchema);

