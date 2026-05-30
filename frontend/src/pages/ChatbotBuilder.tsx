import { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink, Outlet } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Bot, FileText, Palette, Code, BarChart3, MessageSquare } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ModelSelector from "../components/ModelSelector";
import { getChatbot, updateChatbot } from "../services/api";
import type { Chatbot } from "../types";

export default function ChatbotBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [model, setModel] = useState("claude-haiku");

  useEffect(() => {
    if (!id) return;
    getChatbot(id)
      .then((res) => {
        const bot = res.data;
        setChatbot(bot);
        setName(bot.name);
        setDescription(bot.description);
        setSystemPrompt(bot.systemPrompt);
        setModel(bot.model);
      })
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const res = await updateChatbot(id, {
        name,
        description,
        system_prompt: systemPrompt,
        model,
      });
      setChatbot(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Save failed");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!chatbot) return null;

  const tabs = [
    { to: `/chatbot/${id}`, icon: Bot, label: "General", end: true },
    { to: `/chatbot/${id}/knowledge`, icon: FileText, label: "Knowledge Base" },
    { to: `/chatbot/${id}/customize`, icon: Palette, label: "Customize" },
    { to: `/chatbot/${id}/embed`, icon: Code, label: "Embed" },
    { to: `/chatbot/${id}/analytics`, icon: BarChart3, label: "Analytics" },
    { to: `/chatbot/${id}/conversations`, icon: MessageSquare, label: "Conversations" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-1.5 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: chatbot.theme?.primary_color || "#1e40af" }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">{chatbot.name}</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-8">
          <nav className="flex gap-1">
            {tabs.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-8 max-w-4xl mx-auto">
          <Outlet context={{ chatbot, setChatbot, name, setName, description, setDescription, systemPrompt, setSystemPrompt, model, setModel }} />
        </div>
      </main>
    </div>
  );
}

// General tab (default)
export function ChatbotGeneral() {
  const { name, setName, description, setDescription, systemPrompt, setSystemPrompt, model, setModel } =
    useOutletContext<any>();

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Chatbot Name</label>
        <input
          type="text"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          placeholder="What does this chatbot do?"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSystemPrompt(e.target.value)}
          rows={5}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="You are a helpful assistant for..."
        />
        <p className="text-xs text-gray-400 mt-1">
          Instructions that shape how your chatbot responds. Be specific about tone, behavior, and boundaries.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">AI Model</label>
        <ModelSelector value={model} onChange={setModel} />
      </div>
    </div>
  );
}

// Need this for useOutletContext
import { useOutletContext } from "react-router-dom";
