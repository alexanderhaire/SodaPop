"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbeddingFromText = generateEmbeddingFromText;
exports.ensureItemEmbedding = ensureItemEmbedding;
exports.averageUserPreferenceEmbedding = averageUserPreferenceEmbedding;
exports.findSimilarItems = findSimilarItems;
exports.getRecommendedItems = getRecommendedItems;
const openai_1 = __importDefault(require("openai"));
// Import JS models with require to avoid typing issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Item = require("../models/item");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const User = require("../models/user");
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
async function generateEmbeddingFromText(text) {
    const res = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });
    return res.data[0].embedding;
}
async function ensureItemEmbedding(itemId) {
    const item = await Item.findById(itemId);
    if (!item)
        return null;
    if (Array.isArray(item.embedding) && item.embedding.length > 0) {
        return item.embedding;
    }
    const embedding = await generateEmbeddingFromText(item.name);
    item.embedding = embedding;
    await item.save();
    return embedding;
}
async function averageUserPreferenceEmbedding(wallet) {
    const user = await User.findOne({ walletAddress: wallet }).lean();
    if (!user || !user.interactions)
        return null;
    const interactedIds = Object.entries(user.interactions)
        .filter(([, d]) => (d.favorited || 0) > 0 || (d.purchased || 0) > 0)
        .map(([id]) => id);
    if (interactedIds.length === 0)
        return null;
    const items = await Item.find({ _id: { $in: interactedIds } }).lean();
    const embeddings = items
        .map((i) => i.embedding)
        .filter((e) => Array.isArray(e) && e.length > 0);
    if (embeddings.length === 0)
        return null;
    const dims = embeddings[0].length;
    const avg = new Array(dims).fill(0);
    embeddings.forEach((vec) => {
        for (let i = 0; i < dims; i++)
            avg[i] += vec[i];
    });
    for (let i = 0; i < dims; i++)
        avg[i] /= embeddings.length;
    return avg;
}
function cosineSimilarity(a, b) {
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length && i < b.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    if (!na || !nb)
        return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
async function findSimilarItems(embedding, topN) {
    const items = await Item.find({ embedding: { $exists: true } }).lean();
    const scored = items.map((item) => ({
        item,
        score: cosineSimilarity(embedding, item.embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topN).map((s) => s.item);
}
async function getRecommendedItems(wallet, topN = 5) {
    const userEmbedding = await averageUserPreferenceEmbedding(wallet);
    if (!userEmbedding)
        return [];
    return findSimilarItems(userEmbedding, topN);
}
