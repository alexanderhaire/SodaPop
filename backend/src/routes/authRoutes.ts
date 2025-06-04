// File: backend/src/routes/authRoutes.ts

import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

const router = Router();

/**
 * POST /api/auth/login
 * Dummy login endpoint that always issues a JWT for any username/password.
 * In a real app, you’d validate against your users collection.
 */
router.post("/login", (req: Request, res: Response) => {
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
