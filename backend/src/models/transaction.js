// Place this into: ~/SodaPop/backend/src/models/transaction.js

const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  horseId: { type: mongoose.Schema.Types.ObjectId, ref: "Horse", required: true },
  shares: { type: Number, required: true },
  amount: { type: Number, required: true },
  txHash: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", TransactionSchema);

