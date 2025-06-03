// frontend/src/components/ChatWindow.tsx

import React, { useState, useRef, useEffect } from "react";
import { VStack, HStack, Box, Input, Button, Text } from "@chakra-ui/react";
import axios from "axios";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", content: "You are a knowledgeable DeFi assistant." },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsSending(true);

    try {
      const response = await axios.post("/api/chat/message", {
        message: userMsg,
      });

      const botReply: ChatMessage = response.data.reply;
      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error("ChatWindow send error:", err);
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
      <Box
        ref={containerRef}
        flex={1}
        overflowY="auto"
        p={3}
        bg="gray.50"
        minH="0"
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
                  ? "gray.300"
                  : msg.role === "user"
                  ? "blue.500"
                  : "gray.200"
              }
              color={msg.role === "user" ? "white" : "black"}
              borderRadius="md"
            >
              <Text whiteSpace="pre-wrap">{msg.content}</Text>
            </Box>
          </HStack>
        ))}
      </Box>

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
