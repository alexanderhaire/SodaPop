import path from "node:path";
import express from "express";
import cors from "cors";

const app = express();

// ---------- Logging (see requests in Railway logs) ----------
app.use((req, _res, next) => {
  console.log(`[req] ${req.method} ${req.url}`);
  next();
});

// ---------- Core middleware ----------
app.use(express.json({ limit: "5mb" }));
app.use(cors({ origin: true }));
app.options("*", cors({ origin: true })); // handle all preflight

// ---------- Health ----------
app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ---------- Spotlight record endpoint ----------
app.post("/api/tokens/record", async (req, res) => {
  try {
    const { network, owner, mint, signature, metadata } = req.body ?? {};
    if (!mint || !signature) {
      return res
        .status(400)
        .json({ ok: false, error: "mint and signature required" });
    }
    console.log("[recordToken]", {
      network,
      owner,
      mint,
      signature,
      name: metadata?.name,
    });
    // TODO: persist to DB; returning ok is enough for Spotlight sync
    return res.json({ ok: true, mint, signature });
  } catch (err) {
    console.error("record-token error", err);
    return res.status(500).json({ ok: false, error: "internal" });
  }
});

// ---------- Diagnostics: list mounted routes ----------
app.get("/api/_diag/routes", (_req, res) => {
  const routes: any[] = [];
  const walk = (stack: any[], base = "") => {
    for (const layer of stack) {
      if (layer.route) {
        const path = base + (layer.route.path || "");
        const methods = Object.keys(layer.route.methods || {}).join(",");
        routes.push({ path, methods });
      } else if (layer.name === "router" && layer.handle?.stack) {
        walk(layer.handle.stack, base + (layer.regexp?.fast_slash ? "" : ""));
      }
    }
  };
  // @ts-ignore
  walk(app._router.stack);
  res.json({ routes });
});

// ---------- Serve SPA (frontend build) ----------
const distDir = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(distDir));
// SPA fallback (anything not /api goes to index.html)
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, "0.0.0.0", () => console.log(`[api] listening on :${PORT}`));
