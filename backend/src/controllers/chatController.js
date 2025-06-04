// File: backend/src/controllers/chatController.js

const { getChatResponse } = require("../services/chatbot");

exports.chat = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const reply = await getChatResponse(userId, message);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
