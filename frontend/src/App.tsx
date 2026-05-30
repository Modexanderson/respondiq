import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChatbotBuilder, { ChatbotGeneral } from "./pages/ChatbotBuilder";
import KnowledgeBase from "./pages/KnowledgeBase";
import Customize from "./pages/Customize";
import Embed from "./pages/Embed";
import Analytics from "./pages/Analytics";
import Conversations from "./pages/Conversations";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chatbot/:id"
          element={
            <ProtectedRoute>
              <ChatbotBuilder />
            </ProtectedRoute>
          }
        >
          <Route index element={<ChatbotGeneral />} />
          <Route path="knowledge" element={<KnowledgeBase />} />
          <Route path="customize" element={<Customize />} />
          <Route path="embed" element={<Embed />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="conversations" element={<Conversations />} />
        </Route>

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
