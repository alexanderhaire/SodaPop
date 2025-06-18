// Item model definition

const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  tokenId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  purchasePrice: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["training", "racing", "retired", "claimed"],
    default: "training",
  },
  totalShares: { type: Number, required: true },
  sharesSold: { type: Number, default: 0 },
});

module.exports = mongoose.model("Item", ItemSchema);
