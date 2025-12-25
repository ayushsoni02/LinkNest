import express, { RequestHandler } from 'express';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { userModel } from './db';
import { JWT_PASSWORD } from './conf';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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

  const hashpassword = bcrypt.hashSync(password, 10);

  try {
    const newUser = await userModel.create({
      username: username,
      password: hashpassword,
      email: email
    });

    const token = jwt.sign({
      id: newUser._id,
    }, JWT_PASSWORD, { expiresIn: '24h' });

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
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const existingUser = await userModel.findOne({ username });

    // Check if user exists and has a password
    if (!existingUser || !existingUser.password) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    if (isPasswordValid) {
      const token = jwt.sign(
        { id: existingUser._id },
        process.env.JWT_SECRET || JWT_PASSWORD, // Make sure to use environment variable
        { expiresIn: '24h' } // Add token expiration
      );

      res.json({
        token: `Bearer ${token}`,
        user: {
          id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email
        }
      });
      return;
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
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
    }, JWT_PASSWORD, { expiresIn: '24h' });

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