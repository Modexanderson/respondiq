import type { ChatbotTheme } from "../types";

interface Props {
  theme: ChatbotTheme;
  onChange: (theme: ChatbotTheme) => void;
}

const positions = [
  { id: "bottom-right", label: "Bottom Right" },
  { id: "bottom-left", label: "Bottom Left" },
];

const sizes = [
  { id: "compact", label: "Compact" },
  { id: "standard", label: "Standard" },
  { id: "full", label: "Full" },
];

export default function ThemeEditor({ theme, onChange }: Props) {
  const update = (key: keyof ChatbotTheme, value: string) => {
    onChange({ ...theme, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.primary_color}
              onChange={(e) => update("primary_color", e.target.value)}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={theme.primary_color}
              onChange={(e) => update("primary_color", e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.bg_color}
              onChange={(e) => update("bg_color", e.target.value)}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={theme.bg_color}
              onChange={(e) => update("bg_color", e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.text_color}
              onChange={(e) => update("text_color", e.target.value)}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={theme.text_color}
              onChange={(e) => update("text_color", e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Welcome Message
        </label>
        <input
          type="text"
          value={theme.welcome_message}
          onChange={(e) => update("welcome_message", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Placeholder Text
        </label>
        <input
          type="text"
          value={theme.placeholder}
          onChange={(e) => update("placeholder", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position
          </label>
          <select
            value={theme.position}
            onChange={(e) => update("position", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
          >
            {positions.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <select
            value={theme.size}
            onChange={(e) => update("size", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
          >
            {sizes.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
