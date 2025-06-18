import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  wallet: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ChatMessage", ChatMessageSchema);
