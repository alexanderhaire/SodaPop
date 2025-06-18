// File: backend/src/routes/authRoutes.ts
// @ts-nocheck

import express from "express";
import * as jwt from "jsonwebtoken";

const router = express.Router();

/**
 * POST /api/auth/login
 * Dummy login endpoint that always issues a JWT for any username/password.
 * In a real app, you’d validate against your users collection.
 */
router.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  // Dummy payload—replace with your real user ID, etc.
  const payload = { sub: username };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  res.json({ token });
});

export default router;
