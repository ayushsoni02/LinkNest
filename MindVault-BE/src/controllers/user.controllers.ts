import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler';
import { userModel } from '../models/user.model';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';

//const JWT_PASSWORD = process.env.JWT_SECRET || 'your-secret-key';

const generateAccessAndRefreshTokens = async (userId: string) => {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        throw new ApiError(400, "All fields are required");
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    const existingUser = await userModel.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const newUser = await userModel.create({
        username,
        password,
        email
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newUser._id as string);

    const userResponse = {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
    };

    res.status(201).json(
        new ApiResponse(201, { user: userResponse, accessToken, refreshToken }, "User created successfully")
    );
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await userModel.findOne({ email }).select('+password');
    
    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id as string);

    const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
    };

    res.status(200).json(
        new ApiResponse(200, { user: userResponse, accessToken, refreshToken }, "Login successful")
    );
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body as { refreshToken: string };

    if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required");
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh-secret') as JwtPayload;

        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            throw new ApiError(401, "Refresh token has expired");
        }

        const user = await userModel.findById(decoded._id);

        if (!user || user.refreshToken !== refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const accessToken = user.generateAccessToken();

        return res.status(200).json(
            new ApiResponse(200, { accessToken }, "Access token refreshed successfully")
        );
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
});

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    if (!user) {
        throw new ApiError(401, "User not authenticated");
    }

    res.status(200).json(
        new ApiResponse(200, user, "User profile retrieved successfully")
    );
});

export {
    registerUser,
    loginUser,
    getCurrentUser,
    refreshAccessToken
};