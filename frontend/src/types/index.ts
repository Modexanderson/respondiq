export interface ChatbotTheme {
  primary_color: string;
  bg_color: string;
  text_color: string;
  position: string;
  welcome_message: string;
  placeholder: string;
  avatar: string | null;
  size: string;
}

export interface Chatbot {
  id: string;
  userId: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  theme: ChatbotTheme;
  apiKey: string;
  messageCount: number;
  conversationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  chunks: number;
  uploadedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
}

export interface Conversation {
  id: string;
  visitorId: string;
  visitorName?: string;
  visitorEmail?: string;
  messages: ChatMessage[];
  satisfaction?: "positive" | "negative" | null;
  startedAt: string;
  lastMessageAt: string;
}

export interface Analytics {
  totalMessages: number;
  totalConversations: number;
  messagesToday: number;
  popularQuestions: { question: string; count: number }[];
  satisfaction: { positive: number; negative: number };
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan: string;
}
