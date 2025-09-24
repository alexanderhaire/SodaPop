import mongoose, { Document, Model } from "mongoose";

export interface HoldingDocument extends Document {
  wallet: string;
  mint: string;
  amount: mongoose.Types.Decimal128;
}

const HoldingSchema = new mongoose.Schema<HoldingDocument>(
  {
    wallet: { type: String, required: true },
    mint: {
      type: String,
      required: true,
      ref: "Token",
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: () => mongoose.Types.Decimal128.fromString("0"),
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
    collection: "holdings",
  }
);

HoldingSchema.index({ wallet: 1, mint: 1 }, { unique: true });

export const HoldingModel: Model<HoldingDocument> =
  mongoose.models.Holding ||
  mongoose.model<HoldingDocument>("Holding", HoldingSchema);
