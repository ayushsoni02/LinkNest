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
  avatarUrl?: string;
}

export const configurePassport = () => {
  // Serialize user to the session
  passport.serializeUser((user: any, done) => {
    done(null, user.id || user._id?.toString());
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
          // Step A: Existing OAuth Check
          let user = await userModel.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user as unknown as Express.User);
          }

          // Step B: Cross-Channel Identity Mapping
          if (profile.emails && profile.emails.length > 0) {
            const email = profile.emails[0].value;
            user = await userModel.findOne({ email });

            if (user) {
              // Link Google ID and update avatarUrl
              user.googleId = profile.id;
              if (profile.photos && profile.photos.length > 0) {
                user.avatarUrl = profile.photos[0].value;
              }
              await user.save();
              return done(null, user as unknown as Express.User);
            }
          }

          // Step C: New Profile Hydration
          // Generate a slugified username + random 4-digit string to ensure uniqueness
          const baseName = (profile.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
          const newUsername = `${baseName}_${random(4)}`;

          const newUser = await userModel.create({
            username: newUsername,
            email: profile.emails?.[0]?.value,
            googleId: profile.id,
            avatarUrl: profile.photos?.[0]?.value,
            // Password is now optional per schema, no need for random generation
          });

          return done(null, newUser as unknown as Express.User);
        } catch (error) {
          console.error("Passport Google Strategy Error:", error);
          return done(error as Error);
        }
      }
    )
  );
};