import express from "express";
import cors from "cors";

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(cors({ origin: true }));
app.options("*", cors({ origin: true })); // avoid 405 on preflight

app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Record newly-minted token so Spotlight can display it
app.post("/api/tokens/record", async (req, res) => {
  try {
    const { network, owner, mint, signature, metadata } = req.body ?? {};
    if (!mint || !signature) {
      return res.status(400).json({ ok: false, error: "mint and signature required" });
    }
    console.log("[recordToken]", { network, owner, mint, signature, name: metadata?.name });
    // TODO: persist to DB if desired
    return res.json({ ok: true, mint, signature });
  } catch (err) {
    console.error("record-token error", err);
    return res.status(500).json({ ok: false, error: "internal" });
  }
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, "0.0.0.0", () => console.log(`[api] listening on :${PORT}`));
