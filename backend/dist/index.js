"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./controllers/auth"));
const portfolio_1 = __importDefault(require("./controllers/portfolio"));
const chat_1 = __importDefault(require("./controllers/chat"));
const sodabot_1 = __importDefault(require("./routes/sodabot"));
const marketplaceController_1 = __importDefault(require("./controllers/marketplaceController"));
const items_1 = __importDefault(require("./routes/items"));
const leaderboard_1 = __importDefault(require("./controllers/leaderboard"));
const events_1 = __importDefault(require("./routes/events"));
const marketData_1 = __importDefault(require("./routes/marketData"));
const upload_1 = __importDefault(require("./routes/upload"));
const config_1 = require("./utils/config");
const eventMonitor_1 = require("./jobs/eventMonitor");
dotenv_1.default.config();
// Connect to MongoDB if a URI is provided
if (config_1.MONGO_URI) {
    mongoose_1.default
        .connect(config_1.MONGO_URI)
        .then(() => console.log("✅ Connected to MongoDB"))
        .catch((err) => console.error("Mongo connection error:", err));
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get("/healthz", (_req, res) => {
    res.status(200).send("ok");
});
app.get("/api/health", (_req, res) => {
    res.json({ status: "OK" });
});
// (Optional) Hello endpoint
app.get("/api/hello", (_req, res) => {
    res.json({ message: "Hello from SodaPop backend!" });
});
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log("Auth header received:", authHeader);
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
// File upload endpoint (unprotected)
app.use("/api/upload", upload_1.default);
// Mount portfolio routes (protected)
app.use("/api", requireAuth, portfolio_1.default);
// Mount chat routes (protected)
app.use("/api/chat", requireAuth, chat_1.default);
// Item creation routes (protected)
app.use("/api/items", requireAuth, items_1.default);
// Marketplace endpoints (protected)
app.use("/api/marketplace", requireAuth, marketplaceController_1.default);
// Events endpoint (protected)
app.use("/api", requireAuth, events_1.default);
// Market data endpoint (unprotected)
app.use("/api", marketData_1.default);
// Leaderboard endpoint (unprotected)
app.use("/api/leaderboard", leaderboard_1.default);
// SodaBot chat endpoint (unprotected)
app.use("/api/sodabot", sodabot_1.default);
const port = config_1.PORT;
const host = "0.0.0.0";
app.listen(port, host, () => {
    console.log(`🚀 Backend listening on port ${port}`);
});
// Start background cron jobs
(0, eventMonitor_1.startEventMonitor)();
