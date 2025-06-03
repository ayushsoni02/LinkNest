import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_PASSWORD) {
  throw new Error("JWT_PASSWORD is not defined in environment variables");
}

export const JWT_PASSWORD = process.env.JWT_PASSWORD;