import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function(): string {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET || 'access-secret',
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h'
        }
    );
};

userSchema.methods.generateRefreshToken = function(): string {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
        }
    );
};


export const userModel = mongoose.model<IUser>('users', userSchema);
