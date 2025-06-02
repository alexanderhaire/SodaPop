// frontend/src/components/ChatWindow.tsx

import React, { useState, useRef, useEffect } from "react";
import { VStack, HStack, Box, Input, Button, Text } from "@chakra-ui/react";
import axios from "axios";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const ChatWindow: React.FC = () => {
  // 1) Initialize messages with a single “system” message
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", content: "You are a knowledgeable DeFi assistant." },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  // 2) Scroll to bottom whenever `messages` changes
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // 3) sendMessage will append the user’s message and then call the backend
  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // a) Add the user message to state immediately
    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsSending(true);

    try {
      // b) Post the *new* user message to /api/chat/message
      //     We send only the last user message, and the server will re‐send the
      //     entire chat history (system + past user + past assistant) behind the scenes.
      //     (On the backend, you can choose to reconstruct the full history from a request
      //     body that includes only the “latest” user message. Here, the stub expects “message”.)

      const response = await axios.post("/api/chat/message", {
        message: userMsg,
      });

      // c) The backend returns { reply: { role: "assistant", content: "..." } }
      const botReply: ChatMessage = response.data.reply;

      // d) Append that reply to our chat state
      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error("ChatWindow send error:", err);

      // e) If anything goes wrong, show a fallback assistant‐bubble
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong on chat. Please try again later.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Allow “Enter” (without Shift) to send a message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <VStack
      spacing={2}
      align="stretch"
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      overflow="hidden"
      height="100%"
    >
      {/* Messages container */}
      <Box
        ref={containerRef}
        flex={1}
        overflowY="auto"
        p={3}
        bg="gray.50"
        minH="0" // allows flex height to work
      >
        {messages.map((msg, idx) => (
          <HStack
            key={idx}
            justify={
              msg.role === "user"
                ? "flex-end"
                : msg.role === "assistant"
                ? "flex-start"
                : "center"
            }
            mb={2}
          >
            <Box
              maxW="70%"
              p={2}
              bg={
                msg.role === "system"
                  ? "gray.200"
                  : msg.role === "user"
                  ? "blue.500"
                  : "gray.300"
              }
              color={msg.role === "user" ? "white" : "black"}
              borderRadius="md"
            >
              <Text whiteSpace="pre-wrap">
                {msg.content}
              </Text>
            </Box>
          </HStack>
        ))}
      </Box>

      {/* Input area */}
      <HStack p={2} borderTop="1px" borderColor="gray.200">
        <Input
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          isDisabled={isSending}
        />
        <Button
          colorScheme="blue"
          onClick={sendMessage}
          isLoading={isSending}
        >
          Send
        </Button>
      </HStack>
    </VStack>
  );
};

export default ChatWindow;
