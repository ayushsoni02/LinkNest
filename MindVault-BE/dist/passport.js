"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const db_1 = require("./db");
const utils_1 = require("./utils");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const configurePassport = () => {
    // Serialize user to the session
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    // Deserialize user from the session
    passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield db_1.userModel.findById(id);
            done(null, user);
        }
        catch (error) {
            done(error, null);
        }
    }));
    // Configure Google Strategy
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
        scope: ['profile', 'email'],
    }, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Find existing user or create a new one
            let user = yield db_1.userModel.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);
            }
            // Check if a user with this email already exists
            if (profile.emails && profile.emails.length > 0) {
                const email = profile.emails[0].value;
                user = yield db_1.userModel.findOne({ email });
                if (user) {
                    // Update existing user with Google ID
                    user.googleId = profile.id;
                    yield user.save();
                    return done(null, user);
                }
            }
            // Create a new user
            const newUser = yield db_1.userModel.create({
                username: profile.displayName || `user_${(0, utils_1.random)(8)}`,
                email: (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value,
                googleId: profile.id,
                password: (0, utils_1.random)(32) // Random password for Google users
            });
            return done(null, newUser);
        }
        catch (error) {
            return done(error);
        }
    })));
};
exports.configurePassport = configurePassport;
