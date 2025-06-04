// File: frontend/src/pages/Chatbot.tsx
// Place this into: ~/SodaPop/frontend/src/pages/Chatbot.tsx

import React, { useState } from "react";
import api from "../utils/api";

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
    const res = await api.post<{ reply: string }>("/chat", {
      userId: "replace_with_logged_in_user_id",
      message: userMsg.text,
    });
    const botMsg: Message = { sender: "bot", text: res.data.reply };
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
