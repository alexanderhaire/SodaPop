import express, { Request, Response } from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const router = express.Router();

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function ensureUploadsDirExists(): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      ensureUploadsDirExists();
      cb(null, UPLOADS_DIR);
    } catch (err) {
      cb(err as Error, UPLOADS_DIR);
    }
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || "";
    const randomName = crypto.randomBytes(16).toString("hex");
    const filename = `${Date.now()}-${randomName}${extension}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req: Request, res: Response): void => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const forwardedProto = req.get("x-forwarded-proto");
    const forwardedHost = req.get("x-forwarded-host");
    const protocol = forwardedProto?.split(",")[0]?.trim() || req.protocol;
    const host = forwardedHost ?? req.get("host");
    const publicPath = `/uploads/${file.filename}`;
    const absoluteUrl = host ? `${protocol}://${host}${publicPath}` : publicPath;

    res.json({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: absoluteUrl,
      previewUrl: absoluteUrl,
      path: publicPath,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
