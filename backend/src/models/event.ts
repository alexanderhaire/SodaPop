import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  summary: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Event", EventSchema);
