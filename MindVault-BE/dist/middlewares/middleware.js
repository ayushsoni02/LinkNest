"use strict";
// import jwt, { decode } from 'jsonwebtoken';
// import { JWT_PASSWORD } from './conf';
// import { NextFunction, Request, Response } from 'express';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
// export const userMiddleware = async (req:Request, res:Response, next:NextFunction) => {
//     const header = req.headers['authorization'];
//     const decoded = jwt.verify(header as string, JWT_PASSWORD);
//     if(decoded){
//          // @ts-ignore
//          req.userId = decoded.id;
//          next();
//     }else{
//         res.status(403).json({
//             message: 'you are not logged in',
//         });
//     }
// };
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const ACCESS_TOKEN_SECRET = (_a = process.env.ACCESS_TOKEN_SECRET) !== null && _a !== void 0 ? _a : '';
if (!ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not configured');
}
const userMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: 'Unauthorized: No token provided' });
            return;
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader;
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
        if (decoded && typeof decoded === "object" && decoded._id) {
            user_model_1.userModel.findById(decoded._id)
                .then(user => {
                if (!user) {
                    res.status(401).json({ message: 'Unauthorized: User not found' });
                    return;
                }
                // @ts-ignore
                req.user = user;
                next();
            })
                .catch(err => {
                console.error("User fetch error:", err);
                res.status(500).json({ message: 'Internal server error' });
            });
        }
        else {
            res.status(401).json({ message: 'Unauthorized: Invalid token structure' });
        }
    }
    catch (error) {
        console.error("JWT Error:", error);
        res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
    }
};
exports.userMiddleware = userMiddleware;
