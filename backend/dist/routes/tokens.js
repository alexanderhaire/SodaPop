"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordLaunchedToken = void 0;
exports.recordToken = recordToken;
exports.getSpotlight = getSpotlight;
exports.getPortfolio = getPortfolio;
const mongoose_1 = __importDefault(require("mongoose"));
const holding_1 = require("../models/holding");
const token_1 = require("../models/token");
const decimalToString = (value) => {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value === "string") {
        return value;
    }
    try {
        return value.toString();
    }
    catch (err) {
        console.warn("[tokens] Unable to convert Decimal128 to string", err);
        return undefined;
    }
};
const normalizeCreatedAt = (createdAt) => {
    if (createdAt instanceof Date) {
        return createdAt.toISOString();
    }
    if (typeof createdAt === "string") {
        return new Date(createdAt).toISOString();
    }
    if (typeof createdAt === "number") {
        return new Date(createdAt).toISOString();
    }
    return new Date().toISOString();
};
const serializeToken = (token, options = {}) => {
    const creatorAmount = decimalToString(options.creatorAmount) ?? "0";
    const walletAmount = decimalToString(options.walletAmount);
    const viewerWallet = options.viewerWallet?.toLowerCase();
    return {
        mint: token.mint,
        name: token.name,
        symbol: token.symbol,
        imageUrl: token.imageUrl ?? null,
        creatorWallet: token.creatorWallet,
        tx: token.tx,
        decimals: token.decimals ?? 9,
        createdAt: normalizeCreatedAt(token.createdAt),
        creatorAmount,
        amount: walletAmount ?? (options.viewerWallet ? "0" : undefined),
        isCreator: viewerWallet
            ? token.creatorWallet.toLowerCase() === viewerWallet
            : undefined,
    };
};
const parseAmount = (raw) => {
    if (raw === undefined || raw === null) {
        return "0";
    }
    if (typeof raw === "bigint") {
        if (raw < 0n) {
            throw new Error("amount must be non-negative");
        }
        return raw.toString(10);
    }
    const asString = typeof raw === "number" ? raw.toString(10) : String(raw);
    try {
        const normalized = BigInt(asString);
        if (normalized < 0n) {
            throw new Error("amount must be non-negative");
        }
        return normalized.toString(10);
    }
    catch (err) {
        throw new Error("amount must be a base-10 integer string");
    }
};
async function recordToken(req, res) {
    try {
        const z = (await Promise.resolve().then(() => __importStar(require("zod")))).z;
        const BodySchema = z.object({
            mint: z.string().min(32),
            tx: z.string().min(32),
            name: z.string().min(1),
            symbol: z.string().min(1),
            imageUrl: z.string().min(1).optional(),
            creatorWallet: z.string().min(32),
            ata: z.string().min(32),
            amount: z.union([z.string(), z.number(), z.bigint()]).optional(),
            decimals: z.number().int().min(0).max(18).optional(),
        });
        const parsed = BodySchema.parse(req.body);
        const normalizedAmount = parseAmount(parsed.amount);
        const decimals = parsed.decimals ?? 9;
        await token_1.TokenModel.updateOne({ mint: parsed.mint }, {
            $set: {
                name: parsed.name,
                symbol: parsed.symbol,
                imageUrl: parsed.imageUrl ?? null,
                creatorWallet: parsed.creatorWallet,
                tx: parsed.tx,
                decimals,
            },
        }, { upsert: true });
        const increment = mongoose_1.default.Types.Decimal128.fromString(normalizedAmount);
        await holding_1.HoldingModel.updateOne({ wallet: parsed.creatorWallet, mint: parsed.mint }, {
            $inc: { amount: increment },
        }, { upsert: true });
        const token = await token_1.TokenModel.findOne({ mint: parsed.mint }).lean();
        const creatorHolding = await holding_1.HoldingModel.findOne({
            wallet: parsed.creatorWallet,
            mint: parsed.mint,
        }).lean();
        if (!token) {
            res.status(500).json({ error: "Token record not found after upsert" });
            return;
        }
        res.json(serializeToken(token, {
            creatorAmount: creatorHolding?.amount,
            walletAmount: creatorHolding?.amount,
            viewerWallet: parsed.creatorWallet,
        }));
    }
    catch (err) {
        console.error("[tokens] Failed to record launched token", err);
        if (err && typeof err === "object" && "issues" in err) {
            res.status(400).json({ error: "Invalid token payload" });
            return;
        }
        if (err instanceof Error && err.message.includes("amount")) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(500).json({ error: "Failed to record launched token" });
    }
}
exports.recordLaunchedToken = recordToken;
async function getSpotlight(_req, res) {
    try {
        const tokens = await token_1.TokenModel.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        if (tokens.length === 0) {
            res.json([]);
            return;
        }
        const creatorHoldings = await holding_1.HoldingModel.find({
            wallet: { $in: tokens.map((token) => token.creatorWallet) },
            mint: { $in: tokens.map((token) => token.mint) },
        }).lean();
        const holdingMap = new Map();
        for (const holding of creatorHoldings) {
            const key = `${holding.wallet}:${holding.mint}`;
            holdingMap.set(key, holding.amount);
        }
        const payload = tokens.map((token) => serializeToken(token, {
            creatorAmount: holdingMap.get(`${token.creatorWallet}:${token.mint}`),
        }));
        res.json(payload);
    }
    catch (err) {
        console.error("[tokens] Failed to load spotlight tokens", err);
        res.status(500).json({ error: "Failed to load spotlight tokens" });
    }
}
async function getPortfolio(req, res) {
    try {
        const z = (await Promise.resolve().then(() => __importStar(require("zod")))).z;
        const QuerySchema = z.object({
            wallet: z.string().min(32),
        });
        const { wallet } = QuerySchema.parse(req.query);
        const holdings = await holding_1.HoldingModel.find({ wallet }).lean();
        const holdingsByMint = new Map();
        const positiveMints = new Set();
        for (const holding of holdings) {
            holdingsByMint.set(holding.mint, holding.amount);
            try {
                if (BigInt(holding.amount.toString()) > 0n) {
                    positiveMints.add(holding.mint);
                }
            }
            catch (err) {
                console.warn("[tokens] Unable to evaluate holding amount for mint %s", holding.mint, err);
            }
        }
        const tokens = await token_1.TokenModel.find({
            $or: [
                { creatorWallet: wallet },
                positiveMints.size > 0
                    ? { mint: { $in: Array.from(positiveMints) } }
                    : undefined,
            ].filter(Boolean),
        })
            .sort({ createdAt: -1 })
            .lean();
        if (tokens.length === 0) {
            res.json([]);
            return;
        }
        const creatorHoldings = await holding_1.HoldingModel.find({
            wallet: { $in: tokens.map((token) => token.creatorWallet) },
            mint: { $in: tokens.map((token) => token.mint) },
        }).lean();
        const creatorHoldingMap = new Map();
        for (const holding of creatorHoldings) {
            creatorHoldingMap.set(`${holding.wallet}:${holding.mint}`, holding.amount);
        }
        const results = tokens.map((token) => {
            const walletAmount = holdingsByMint.get(token.mint);
            const creatorAmount = creatorHoldingMap.get(`${token.creatorWallet}:${token.mint}`);
            return serializeToken(token, {
                creatorAmount,
                walletAmount,
                viewerWallet: wallet,
            });
        });
        results.sort((a, b) => {
            const amountA = a.amount ? BigInt(a.amount) : 0n;
            const amountB = b.amount ? BigInt(b.amount) : 0n;
            if (amountA !== amountB) {
                return amountB > amountA ? 1 : -1;
            }
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
        res.json(results);
    }
    catch (err) {
        console.error("[tokens] Failed to load portfolio", err);
        if (err && typeof err === "object" && "issues" in err) {
            res.status(400).json({ error: "Invalid wallet" });
            return;
        }
        res.status(500).json({ error: "Failed to load portfolio" });
    }
}
