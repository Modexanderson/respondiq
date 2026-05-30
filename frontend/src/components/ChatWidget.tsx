import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import ChatMessage from "./ChatMessage";
import type { ChatbotTheme } from "../types";
import { API_BASE } from "../services/api";

interface Props {
  apiKey: string;
  theme: ChatbotTheme;
  name: string;
  preview?: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function ChatWidget({ apiKey, theme, name, preview }: Props) {
  const [open, setOpen] = useState(preview || false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setStreaming(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat/${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          conversation_id: conversationId,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let botResponse = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "meta") {
              setConversationId(data.conversation_id);
            } else if (data.type === "token") {
              botResponse += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: botResponse,
                };
                return updated;
              });
            } else if (data.type === "done") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  sources: data.sources,
                };
                return updated;
              });
            }
          } catch {
            // skip invalid JSON
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    }

    setStreaming(false);
  };

  const position = theme.position === "bottom-left" ? "left-5" : "right-5";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 ${position} w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-50`}
        style={{ backgroundColor: theme.primary_color }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div
      className={`${preview ? "relative" : `fixed bottom-5 ${position} z-50`} w-[380px] h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200`}
      style={{ backgroundColor: theme.bg_color }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: theme.primary_color }}
      >
        <div className="flex items-center gap-2">
          {theme.avatar ? (
            <img src={theme.avatar} className="w-8 h-8 rounded-full" alt="" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="text-white font-semibold text-sm">{name}</span>
        </div>
        {!preview && (
          <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            {theme.welcome_message}
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} sources={msg.sources} />
        ))}
        {streaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex gap-1 px-4">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.1s]" />
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={theme.placeholder}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ color: theme.text_color }}
            disabled={streaming}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="p-2 rounded-lg text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: theme.primary_color }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-400 mt-1.5">
          Powered by Respondiq
        </p>
      </div>
    </div>
  );
}
