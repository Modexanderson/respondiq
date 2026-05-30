import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  apiKey: string;
}

export default function EmbedCode({ apiKey }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const widgetUrl = import.meta.env.VITE_WIDGET_URL || "https://respondiq.web.app";

  const snippets = [
    {
      id: "script",
      label: "HTML / Any Website",
      code: `<!-- Respondiq Chat Widget -->\n<script src="${widgetUrl}/widget.js" data-key="${apiKey}" async></script>`,
    },
    {
      id: "wordpress",
      label: "WordPress",
      code: `<!-- Add to your theme's footer.php or use "Insert Headers and Footers" plugin -->\n<script src="${widgetUrl}/widget.js" data-key="${apiKey}" async></script>`,
    },
    {
      id: "react",
      label: "React / Next.js",
      code: `// Add to your layout component or _app.tsx
useEffect(() => {
  const script = document.createElement("script");
  script.src = "${widgetUrl}/widget.js";
  script.setAttribute("data-key", "${apiKey}");
  script.async = true;
  document.body.appendChild(script);
  return () => { document.body.removeChild(script); };
}, []);`,
    },
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      {snippets.map(({ id, label, code }) => (
        <div key={id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <button
              onClick={() => copyToClipboard(code, id)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              {copied === id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-xs text-gray-800 overflow-x-auto font-mono">
            {code}
          </pre>
        </div>
      ))}

      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Your API Key</p>
        <code className="text-xs bg-blue-100 px-2 py-1 rounded">{apiKey}</code>
        <p className="mt-2 text-xs text-blue-600">
          Keep this key private. It identifies your chatbot for widget connections.
        </p>
      </div>
    </div>
  );
}
