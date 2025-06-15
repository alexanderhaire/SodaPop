"use strict";
// src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = __importDefault(require("./controllers/auth"));
const portfolio_1 = __importDefault(require("./controllers/portfolio"));
const chat_1 = __importDefault(require("./controllers/chat"));
const config_1 = require("./utils/config");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "OK" });
});
// (Optional) Hello endpoint
app.get("/api/hello", (_req, res) => {
    res.json({ message: "Hello from SodaPop backend!" });
});
// Middleware to protect routes with JWT
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid token" });
    }
}
// Mount auth routes (unprotected)
app.use("/api/auth", auth_1.default);
// Mount portfolio routes (protected)
app.use("/api", requireAuth, portfolio_1.default);
// Mount chat routes (protected)
app.use("/api/chat", requireAuth, chat_1.default);
// Start server
app.listen(config_1.PORT, () => {
    console.log(`🚀 Backend listening on http://localhost:${config_1.PORT}`);
});
