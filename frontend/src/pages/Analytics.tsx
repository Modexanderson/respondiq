import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MessageSquare, Users, TrendingUp, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { getAnalytics } from "../services/api";
import type { Analytics as AnalyticsData } from "../types";

export default function Analytics() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getAnalytics(id)
      .then((res) => setData(res.data))
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

  if (!data) return <p className="text-gray-500">Failed to load analytics.</p>;

  const stats = [
    { label: "Total Messages", value: data.totalMessages, icon: MessageSquare, color: "bg-blue-50 text-blue-600" },
    { label: "Conversations", value: data.totalConversations, icon: Users, color: "bg-green-50 text-green-600" },
    { label: "Messages Today", value: data.messagesToday, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Satisfaction */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Satisfaction</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-green-500" />
              <span className="text-xl font-bold text-gray-900">{data.satisfaction.positive}</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsDown className="w-5 h-5 text-red-400" />
              <span className="text-xl font-bold text-gray-900">{data.satisfaction.negative}</span>
            </div>
          </div>
        </div>

        {/* Popular Questions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Popular Questions</h3>
          {data.popularQuestions.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <ul className="space-y-2">
              {data.popularQuestions.slice(0, 5).map(({ question, count }, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate max-w-[250px]">{question}</span>
                  <span className="text-gray-400 text-xs">{count}x</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
