import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { userModel } from './db';
import { random } from './utils';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
// Define the User interface to match your Mongoose model
interface User {
  _id: mongoose.Types.ObjectId;
  username: string;
  email?: string;
  googleId?: string;
  password?: string;
}

export const configurePassport = () => {
  // Serialize user to the session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      done(null, user as unknown as Express.User);
    } catch (error) {
      done(error, null);
    }
  });

  // Configure Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find existing user or create a new one
          let user = await userModel.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user as unknown as Express.User);
          }

          // Check if a user with this email already exists
          if (profile.emails && profile.emails.length > 0) {
            const email = profile.emails[0].value;
            user = await userModel.findOne({ email });

            if (user) {
              // Update existing user with Google ID
              user.googleId = profile.id;
              await user.save();
              return done(null, user as unknown as Express.User);
            }
          }

          // Create a new user
          const newUser = await userModel.create({
            username: profile.displayName || `user_${random(8)}`,
            email: profile.emails?.[0]?.value,
            googleId: profile.id,
            password: random(32) // Random password for Google users
          });

          return done(null, newUser as unknown as Express.User);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
};