"use strict";
// import jwt, { decode } from 'jsonwebtoken';
// import { JWT_PASSWORD } from './conf';
// import { NextFunction, Request, Response } from 'express';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
const conf_1 = require("./conf");
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
        const decoded = jsonwebtoken_1.default.verify(token, conf_1.JWT_PASSWORD);
        if (decoded && typeof decoded === "object") {
            // @ts-ignore
            req.userId = decoded.id;
            next(); // continue to next middleware
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
