import { useOutletContext } from "react-router-dom";
import EmbedCode from "../components/EmbedCode";
import type { Chatbot } from "../types";

export default function Embed() {
  const { chatbot } = useOutletContext<{ chatbot: Chatbot }>();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Embed Widget</h2>
      <p className="text-sm text-gray-500 mb-6">
        Copy the code snippet and paste it into your website to add the chat widget.
      </p>
      <EmbedCode apiKey={chatbot.apiKey} />
    </div>
  );
}
