import express from "express";
import { generateTitleAndDescription } from "../services/visionService";
const router = express.Router();

// Analyze image and return defaults
router.post("/describe", async (req, res) => {
  try {
    const { image } = req.body as { image: string };
    if (!image) {
      res.status(400).json({ error: "Image is required" });
      return;
    }
    const result = await generateTitleAndDescription(image);
    res.json(result);
  } catch (err) {
    console.error("Vision describe error:", err);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

// POST /api/items
router.post("/", async (req, res) => {
  try {
    let {
      itemType,
      description,
      image,
      pricingMode,
      sharePrice,
      totalShares,
      horseName,
      trackLocation,
      streamUrl,
      legalContractUri,
    } = req.body as any;
    if ((!itemType || !description) && image) {
      const generated = await generateTitleAndDescription(image);
      if (!itemType) itemType = generated.title;
      if (!description) description = generated.description;
    }
    const data = {
      itemType,
      description,
      image,
      pricingMode,
      sharePrice,
      totalShares,
      horseName,
      trackLocation,
      streamUrl,
      legalContractUri,
    };
    console.log("📩 New item submitted:", data);
    res.status(201).json({ message: "Item received", data });
  } catch (err) {
    console.error("Create item error:", err);
    res.status(500).json({ error: "Failed to process item" });
  }
});

export default router;
