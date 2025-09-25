import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// preflight so browsers don't get 405 on OPTIONS
app.options("/api/tokens/record", cors());

app.post("/api/tokens/record", async (req, res) => {
  try {
    const { network, owner, mint, signature, metadata } = req.body || {};
    if (!mint || !signature) {
      return res
        .status(400)
        .json({ ok: false, error: "mint and signature required" });
    }

    // TODO: persist to your DB (Spotlight feed)
    // await db.tokens.insert({ network, owner, mint, signature, metadata, createdAt: new Date() });

    return res.json({ ok: true, mint, signature });
  } catch (e) {
    console.error("record-token error", e);
    return res.status(500).json({ ok: false, error: "internal" });
  }
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`[api] listening on :${PORT}`));
