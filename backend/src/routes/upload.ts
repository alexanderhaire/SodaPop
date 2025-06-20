import express, { Request, Response } from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), (req: Request, res: Response): void => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    res.json({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
