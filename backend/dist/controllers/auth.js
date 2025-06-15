"use strict";
// backend/src/controllers/auth.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../utils/config");
const userStore = {};
const router = (0, express_1.Router)();
router.post("/register", async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: "Username and password are required." });
        return;
    }
    if (userStore[username]) {
        res.status(409).json({ error: "Username already taken." });
        return;
    }
    try {
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        userStore[username] = { passwordHash };
        res.status(201).json({ message: "User registered." });
    }
    catch {
        res.status(500).json({ error: "Registration failed." });
    }
});
router.post("/login", async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: "Username and password are required." });
        return;
    }
    const user = userStore[username];
    if (!user) {
        res.status(401).json({ error: "Invalid credentials." });
        return;
    }
    try {
        const match = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!match) {
            res.status(401).json({ error: "Invalid credentials." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ username }, config_1.JWT_SECRET, { expiresIn: config_1.JWT_EXPIRES_IN });
        res.json({ token });
    }
    catch {
        res.status(500).json({ error: "Login failed." });
    }
});
exports.default = router;
