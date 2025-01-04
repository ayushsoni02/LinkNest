import jwt, { decode } from 'jsonwebtoken';
import { JWT_PASSWORD } from './conf';
import { NextFunction, Request, Response } from 'express';


export const userMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    const header = req.headers['authorization'];
    const decoded = jwt.verify(header as string, JWT_PASSWORD);
    if(decoded){
         // @ts-ignore
         req.userId = decoded.id;
         next();
    }else{
        res.status(403).json({
            message: 'you are not logged in',
        });
    }
}; 