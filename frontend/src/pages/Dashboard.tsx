import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Bot, MessageSquare, Users, Loader2, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { listChatbots, createChatbot, deleteChatbot } from "../services/api";
import type { Chatbot } from "../types";

export default function Dashboard() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchChatbots = async () => {
    try {
      const res = await listChatbots();
      setChatbots(res.data);
    } catch {
      // handled
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChatbots();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await createChatbot({ name: "New Chatbot" });
      navigate(`/chatbot/${res.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create chatbot");
    }
    setCreating(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this chatbot and all its data?")) return;
    await deleteChatbot(id);
    setChatbots((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Chatbots</h1>
              <p className="text-gray-500 text-sm mt-1">
                Create and manage AI chatbots for your business
              </p>
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              New Chatbot
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : chatbots.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No chatbots yet</h2>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                Create your first AI chatbot, upload your documents, and embed it on your website in minutes.
              </p>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Create Your First Chatbot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chatbots.map((bot) => (
                <div
                  key={bot.id}
                  onClick={() => navigate(`/chatbot/${bot.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: bot.theme?.primary_color || "#1e40af" }}
                    >
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, bot.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{bot.name}</h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                    {bot.description || "No description"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {bot.messageCount || 0} msgs
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {bot.conversationCount || 0} chats
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
