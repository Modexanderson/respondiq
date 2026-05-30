import { Bot, User } from "lucide-react";

interface Props {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function ChatMessage({ role, content, sources }: Props) {
  const isBot = role === "assistant";

  return (
    <div className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isBot ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
        }`}
      >
        {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isBot
            ? "bg-gray-100 text-gray-800"
            : "bg-blue-600 text-white"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {sources && sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
            Sources: {sources.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}
