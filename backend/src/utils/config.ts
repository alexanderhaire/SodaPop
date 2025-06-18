import dotenv from "dotenv";
dotenv.config();

export const PORT = Number(process.env.PORT) || 4000;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL || "";
export const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

export const JWT_SECRET = process.env.JWT_SECRET || "replace_with_strong_secret";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
export const MONGO_URI = process.env.MONGO_URI || "";
