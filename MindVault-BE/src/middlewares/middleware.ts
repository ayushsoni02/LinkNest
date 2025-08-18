// import jwt, { decode } from 'jsonwebtoken';
// import { JWT_PASSWORD } from './conf';
// import { NextFunction, Request, Response } from 'express';


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



import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { userModel } from '../models/user.model';


const ACCESS_TOKEN_SECRET: string = process.env.ACCESS_TOKEN_SECRET ?? '';
if (!ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is not configured');
}

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
    }

     const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;


  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as jwt.JwtPayload;


    if (decoded && typeof decoded === "object" && decoded._id) {
      userModel.findById(decoded._id)
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
    } else {
      res.status(401).json({ message: 'Unauthorized: Invalid token structure' });
    }

  } catch (error) {
    console.error("JWT Error:", error);
    res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
};

