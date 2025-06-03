// backend/src/controllers/auth.ts

import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../utils/config";

const userStore: Record<string, { passwordHash: string }> = {};
const router = Router();

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required." });
    return;
  }
  if (userStore[username]) {
    res.status(409).json({ error: "Username already taken." });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    userStore[username] = { passwordHash };
    res.status(201).json({ message: "User registered." });
  } catch {
    res.status(500).json({ error: "Registration failed." });
  }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body as { username?: string; password?: string };
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
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }

    const token = jwt.sign(
      { username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
    );
    res.json({ token });
  } catch {
    res.status(500).json({ error: "Login failed." });
  }
});

export default router;
