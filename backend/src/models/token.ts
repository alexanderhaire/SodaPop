import mongoose, { Document, Model } from "mongoose";

export interface TokenDocument extends Document {
  mint: string;
  name: string;
  symbol: string;
  imageUrl?: string | null;
  creatorWallet: string;
  tx: string;
  createdAt: Date;
  decimals?: number;
}

const TokenSchema = new mongoose.Schema<TokenDocument>(
  {
    mint: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    imageUrl: { type: String, default: null },
    creatorWallet: { type: String, required: true },
    tx: { type: String, required: true },
    decimals: { type: Number, default: 9 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "tokens",
  }
);

TokenSchema.index({ createdAt: -1 });

export const TokenModel: Model<TokenDocument> =
  mongoose.models.Token || mongoose.model<TokenDocument>("Token", TokenSchema);

export type TokenLean = ReturnType<typeof TokenModel["hydrate"]> extends infer Doc
  ? Doc extends Document
    ? Doc & { createdAt: Date }
    : never
  : never;
