import express, { RequestHandler } from 'express';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { userModel } from './db';
import { JWT_PASSWORD } from './conf';
import mongoose from 'mongoose';

// Define a custom type for the User with Passport that matches your Mongoose model
interface User {
  _id: mongoose.Types.ObjectId; // Change from string to ObjectId
  username: string;
  email?: string;
  googleId?: string;
  password?: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      _id: mongoose.Types.ObjectId; // Change from string to ObjectId
      username: string;
      email?: string;
      googleId?: string;
      password?: string;
    }
  }
}

const router = express.Router();

// Regular sign-up route
router.post('/signup', async (req: ExpressRequest, res: ExpressResponse) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  try {
    const newUser = await userModel.create({
      username: username,
      password: password,
      email: email
    });

    const token = jwt.sign({
      id: newUser._id,
    }, JWT_PASSWORD);

    res.json({
      token: `Bearer ${token}`,
      message: 'User created successfully',
    });
  } catch (e) {
    res.status(411).json({
      message: 'User already exists',
    });
  }
});

// Regular sign-in route
router.post('/signin', async (req: ExpressRequest, res: ExpressResponse) => {
  const { username, password } = req.body;
  const existingUser = await userModel.findOne({
    username,
    password
  });

  if (existingUser) {
    const token = jwt.sign({
      id: existingUser._id,
    }, JWT_PASSWORD);

    res.json({
      token: `Bearer ${token}`,
    });
  } else {
    res.status(401).json({
      message: 'Invalid username or password',
    });
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/signin' }),
  (req: ExpressRequest, res: ExpressResponse) => {
    // Generate JWT token for the authenticated user
    const token = jwt.sign({
      id: (req.user as Express.User)._id,
    }, JWT_PASSWORD);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
  }
);

// User info route
router.get('/me', (async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    // Extract userId from token
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, JWT_PASSWORD) as { id: string };
    const user = await userModel.findById(decoded.id).select('username email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}) as RequestHandler);

export default router;