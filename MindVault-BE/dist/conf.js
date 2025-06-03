"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_PASSWORD = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.JWT_PASSWORD) {
    throw new Error("JWT_PASSWORD is not defined in environment variables");
}
exports.JWT_PASSWORD = process.env.JWT_PASSWORD;
