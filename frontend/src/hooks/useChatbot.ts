import { useState, useEffect } from "react";
import { getChatbot } from "../services/api";
import type { Chatbot } from "../types";

export function useChatbot(id: string | undefined) {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getChatbot(id)
      .then((res) => setChatbot(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Failed to load chatbot"))
      .finally(() => setLoading(false));
  }, [id]);

  return { chatbot, setChatbot, loading, error };
}
