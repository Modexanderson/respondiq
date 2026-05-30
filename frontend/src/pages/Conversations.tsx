import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MessageSquare, User, Loader2 } from "lucide-react";
import { getConversations } from "../services/api";
import ChatMessage from "../components/ChatMessage";
import type { Conversation } from "../types";

export default function Conversations() {
  const { id } = useParams<{ id: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getConversations(id)
      .then((res) => setConversations(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversations</h2>

      {conversations.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3" />
          <p>No conversations yet. Chat messages will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Conversation list */}
          <div className="col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                    selected?.id === conv.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {conv.visitorName || conv.visitorId?.slice(0, 8) || "Visitor"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conv.messages?.[conv.messages.length - 1]?.content?.slice(0, 50) || "..."}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {conv.messages?.length || 0} messages
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation detail */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-4 max-h-[600px] overflow-y-auto">
            {selected ? (
              <div className="space-y-4">
                {selected.messages?.map((msg, i) => (
                  <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Select a conversation to view
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
