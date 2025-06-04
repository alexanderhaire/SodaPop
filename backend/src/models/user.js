// Place this into: ~/SodaPop/backend/src/models/user.js

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true, unique: true },
  kycStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
