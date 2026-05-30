import { Cpu, Zap, Brain } from "lucide-react";

const models = [
  {
    id: "claude-haiku",
    name: "Claude Haiku",
    description: "Fast & affordable",
    icon: Zap,
    color: "text-green-600",
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    description: "Best quality",
    icon: Brain,
    color: "text-blue-600",
  },
  {
    id: "ollama-local",
    name: "Ollama Local",
    description: "Free, runs locally",
    icon: Cpu,
    color: "text-purple-600",
  },
];

interface Props {
  value: string;
  onChange: (model: string) => void;
}

export default function ModelSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {models.map(({ id, name, description, icon: Icon, color }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            value === id
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <Icon className={`w-6 h-6 mb-2 ${color}`} />
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </button>
      ))}
    </div>
  );
}
