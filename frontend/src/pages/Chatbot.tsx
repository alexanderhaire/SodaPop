// File: frontend/src/pages/Chatbot.tsx
// Place this into: ~/SodaPop/frontend/src/pages/Chatbot.tsx

import React, { useState } from "react";
import api from "../utils/api";
import { getToken } from "../utils/authToken";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const Chatbot: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const token = getToken();
    const res = await api.post<{ reply: { role: string; content: string } }>(
      "/chat/message",
      {
        message: { role: "user", content: userMsg.text },
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    const botMsg: Message = { sender: "bot", text: res.data.reply.content };
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div className="chatbot">
      <div className="messages">
        {messages.map((m, idx) => (
          <div key={idx} className={m.sender}>
            {m.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask SodaBot..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chatbot;
