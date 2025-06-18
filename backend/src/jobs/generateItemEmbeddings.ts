import mongoose from "mongoose";
import OpenAI from "openai";
import dotenv from "dotenv";
const Item = require("../models/item");
import { OPENAI_API_KEY } from "../utils/config";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function main() {
  await mongoose.connect(MONGO_URI);

  const items = await Item.find({ $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }] });
  if (!items.length) {
    console.log("No items require embeddings");
    await mongoose.disconnect();
    return;
  }

  const batchSize = 50;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const inputs = batch.map((it: any) => it.description || it.name || "");
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: inputs,
    });
    res.data.forEach((d, idx) => {
      batch[idx].embedding = d.embedding;
    });
    await Promise.all(batch.map((doc: any) => doc.save()));
    console.log(`Processed ${Math.min(i + batch.length, items.length)} / ${items.length}`);
  }

  await mongoose.disconnect();
  console.log("Done");
}

main().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
