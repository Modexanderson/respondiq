import { useOutletContext } from "react-router-dom";
import ThemeEditor from "../components/ThemeEditor";
import ChatWidget from "../components/ChatWidget";
import { updateChatbot } from "../services/api";
import type { Chatbot, ChatbotTheme } from "../types";

export default function Customize() {
  const { chatbot, setChatbot } = useOutletContext<{
    chatbot: Chatbot;
    setChatbot: (c: Chatbot) => void;
  }>();

  const handleThemeChange = async (theme: ChatbotTheme) => {
    setChatbot({ ...chatbot, theme });
    // Auto-save theme changes
    try {
      await updateChatbot(chatbot.id, { theme });
    } catch {
      // silent fail for preview
    }
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Customize Widget</h2>
        <p className="text-sm text-gray-500 mb-6">
          Adjust colors, messages, and positioning to match your brand.
        </p>
        <ThemeEditor theme={chatbot.theme} onChange={handleThemeChange} />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
        <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-center min-h-[560px]">
          <ChatWidget
            apiKey={chatbot.apiKey}
            theme={chatbot.theme}
            name={chatbot.name}
            preview
          />
        </div>
      </div>
    </div>
  );
}
