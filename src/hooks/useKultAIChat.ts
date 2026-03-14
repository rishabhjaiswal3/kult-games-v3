import { useEffect, useRef, useState } from "react";

import { streamKultAIReply } from "@/lib/kultAiChat";

export interface KultAIMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  state?: "streaming" | "complete" | "error";
}

const createMessageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const useKultAIChat = () => {
  const [messages, setMessages] = useState<KultAIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWaitingForFirstChunk, setIsWaitingForFirstChunk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const sendMessage = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || isStreaming) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMessageId = createMessageId();
    const aiMessageId = createMessageId();

    setError(null);
    setInput("");
    setIsStreaming(true);
    setIsWaitingForFirstChunk(true);
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", text },
      { id: aiMessageId, role: "ai", text: "", state: "streaming" },
    ]);

    try {
      await streamKultAIReply({
        query: text,
        signal: controller.signal,
        onChunk: (chunk) => {
          setIsWaitingForFirstChunk(false);
          setMessages((prev) =>
            prev.map((message) =>
              message.id === aiMessageId
                ? { ...message, text: `${message.text}${chunk}`, state: "streaming" }
                : message,
            ),
          );
        },
      });

      setMessages((prev) =>
        prev.map((message) =>
          message.id === aiMessageId
            ? {
                ...message,
                text:
                  message.text.trim() ||
                  "I don't have enough information to answer that right now.",
                state: "complete",
              }
            : message,
        ),
      );
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }

      const nextError =
        err instanceof Error
          ? err.message
          : "KULT AI is unavailable right now. Make sure the inference service is running.";

      setError(nextError);
      setIsWaitingForFirstChunk(false);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === aiMessageId
            ? {
                ...message,
                text:
                  "KULT AI could not reach the inference service. Start `zero-g/inference` on port 8000 and try again.",
                state: "error",
              }
            : message,
        ),
      );
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setIsStreaming(false);
      setIsWaitingForFirstChunk(false);
    }
  };

  const clearMessages = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setError(null);
    setIsStreaming(false);
    setIsWaitingForFirstChunk(false);
  };

  return {
    clearMessages,
    error,
    input,
    isStreaming,
    isWaitingForFirstChunk,
    messages,
    sendMessage,
    setInput,
  };
};
