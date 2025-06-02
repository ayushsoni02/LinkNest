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


// import jwt from 'jsonwebtoken';
// import { JWT_PASSWORD } from './conf';
// import { NextFunction, Request, Response } from 'express';

// export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const authHeader = req.headers['authorization'];

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       res.status(401).json({ message: 'Unauthorized: No token provided' });
//       return;
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, JWT_PASSWORD) as jwt.JwtPayload;

//     if (decoded && typeof decoded === "object") {
//       // @ts-ignore
//       req.userId = decoded.id;
//       next(); // continue to next middleware
//     } else {
//       res.status(401).json({ message: 'Unauthorized: Invalid token structure' });
//     }

//   } catch (error) {
//     console.error("JWT Error:", error);
//     res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
//   }
// };

