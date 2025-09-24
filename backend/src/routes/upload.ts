import express, { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
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

const buildRequestMeta = (req: Request, file?: Express.Multer.File) => ({
  method: req.method,
  originalUrl: req.originalUrl,
  requestId: req.get("x-request-id") ?? undefined,
  ip: req.ip,
  userAgent: req.get("user-agent") ?? undefined,
  filename: file?.originalname,
  mimetype: file?.mimetype,
  size: file?.size,
});

router.post("/", upload.single("file"), (req: Request, res: Response): void => {
  const start = process.hrtime.bigint();
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      console.warn("[upload] Request missing file payload", buildRequestMeta(req));
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    console.info("[upload] Processing file upload", buildRequestMeta(req, file));

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

    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.info("[upload] File upload completed", {
      ...buildRequestMeta(req, file),
      durationMs: Math.round(durationMs * 1000) / 1000,
      storedFilename: file.filename,
      publicPath,
    });
  } catch (err) {
    console.error("[upload] Unhandled upload error", {
      ...buildRequestMeta(req),
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    res.status(500).json({ error: "Upload failed" });
  }
});

router.all("/", (req: Request, res: Response) => {
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  console.warn("[upload] Unsupported method", buildRequestMeta(req));
  res.status(405).json({ error: "Method not allowed" });
});

router.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const isMulterError = err instanceof MulterError;
  const statusCode = isMulterError ? 400 : 500;
  const errorBody: Record<string, unknown> = { error: "Upload failed" };

  if (isMulterError) {
    errorBody.code = err.code;
    errorBody.message = err.message;
  }

  console.error("[upload] Middleware error", {
    ...buildRequestMeta(req),
    isMulterError,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(statusCode).json(errorBody);
});

export default router;
