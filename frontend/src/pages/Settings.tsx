import { useAuth } from "../hooks/useAuth";
import { User, Mail, Crown } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function Settings() {
  const { user, profile } = useAuth();

  const planColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-600",
    pro: "bg-blue-100 text-blue-700",
    business: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img src={user.photoURL} className="w-16 h-16 rounded-full" alt="" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {user?.displayName || profile?.displayName || "User"}
                </h2>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Current Plan</span>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  planColors[profile?.plan || "free"] || planColors.free
                }`}
              >
                {profile?.plan || "free"}
              </span>
              {profile?.plan === "free" && (
                <p className="text-xs text-gray-400 mt-2">
                  Free plan: 1 chatbot, 50 messages/month. Upgrade for more.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
