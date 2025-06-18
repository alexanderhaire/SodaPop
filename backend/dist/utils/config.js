"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONGO_URI = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.PRIVATE_KEY = exports.ALCHEMY_API_URL = exports.OPENAI_API_KEY = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = Number(process.env.PORT) || 4000;
exports.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
exports.ALCHEMY_API_URL = process.env.ALCHEMY_API_URL || "";
exports.PRIVATE_KEY = process.env.PRIVATE_KEY || "";
exports.JWT_SECRET = process.env.JWT_SECRET || "replace_with_strong_secret";
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
exports.MONGO_URI = process.env.MONGO_URI || "";
