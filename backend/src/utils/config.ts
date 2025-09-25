import dotenv from "dotenv";

dotenv.config();

const getString = (value?: string | null, fallback = "") =>
  (value ?? "").trim() || fallback;

export const PORT = Number(process.env.PORT) || 4000;
export const OPENAI_API_KEY = getString(process.env.OPENAI_API_KEY);
export const SOLANA_RPC_URL = getString(
  process.env.SOLANA_RPC_URL,
  "https://api.devnet.solana.com",
);

export const JWT_SECRET = getString(
  process.env.JWT_SECRET,
  "replace_with_strong_secret",
);
export const JWT_EXPIRES_IN = getString(process.env.JWT_EXPIRES_IN, "1h");
export const SMTP_HOST = getString(process.env.SMTP_HOST);
export const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
export const SMTP_USER = getString(process.env.SMTP_USER);
export const SMTP_PASS = getString(process.env.SMTP_PASS);
export const ALERT_EMAIL = getString(process.env.ALERT_EMAIL);
export const MONGO_URI = getString(process.env.MONGO_URI);
