import dotenv from "dotenv";
dotenv.config();

export const PORT = Number(process.env.PORT) || 4000;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL || "";
export const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

export const JWT_SECRET = process.env.JWT_SECRET || "replace_with_strong_secret";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
export const SMTP_HOST = process.env.SMTP_HOST || "";
export const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
export const ALERT_EMAIL = process.env.ALERT_EMAIL || "";
