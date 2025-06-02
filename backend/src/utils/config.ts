import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL || "";
export const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
