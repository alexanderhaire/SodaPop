import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../utils/config";

const userStore: Record<string, { passwordHash: string }> = {};
const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) return res.status(400).json({ error: "Username and password are required." });
  if (userStore[username]) return res.status(409).json({ error: "Username already taken." });
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    userStore[username] = { passwordHash };
    return res.status(201).json({ message: "User registered." });
  } catch {
    return res.status(500).json({ error: "Registration failed." });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) return res.status(400).json({ error: "Username and password are required." });
  const user = userStore[username];
  if (!user) return res.status(401).json({ error: "Invalid credentials." });
  try {
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials." });
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token });
  } catch {
    return res.status(500).json({ error: "Login failed." });
  }
});

export default router;
