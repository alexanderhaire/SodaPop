import { useState } from "react";
import axios from "../utils/axiosConfig";
import { useWallet } from "@solana/wallet-adapter-react";

const SodaBot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const { publicKey } = useWallet();
  const address = publicKey?.toBase58();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post("/sodabot", {
        prompt: input,
        userAddress: address,
      });
      const botMessage = { from: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ SodaBot failed to reply." },
      ]);
    }
  };

  return (
    <div className="border rounded p-4 w-full max-w-md mx-auto bg-white">
      <div className="mb-4 h-48 overflow-y-auto border p-2 bg-gray-50 rounded">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm mb-1 ${msg.from === "bot" ? "text-purple-700" : "text-gray-800"}`}
          >
            <strong>{msg.from === "bot" ? "SodaBot" : "You"}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Ask SodaBot..."
        className="w-full border p-2 rounded mb-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={handleSend}
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition"
      >
        Send
      </button>
    </div>
  );
};

export default SodaBot;
