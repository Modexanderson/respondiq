import axios from "axios";
import { getToken } from "./firebase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
});

// Attach Firebase token to all requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Not authenticated — some endpoints don't need auth
  }
  return config;
});

// ── Auth ──
export const verifyAuth = () => api.post("/api/auth/verify");

// ── Chatbots ──
export const listChatbots = () => api.get("/api/chatbots");
export const createChatbot = (data: any) => api.post("/api/chatbots", data);
export const getChatbot = (id: string) => api.get(`/api/chatbots/${id}`);
export const updateChatbot = (id: string, data: any) => api.put(`/api/chatbots/${id}`, data);
export const deleteChatbot = (id: string) => api.delete(`/api/chatbots/${id}`);

// ── Documents ──
export const listDocuments = (chatbotId: string) =>
  api.get(`/api/chatbots/${chatbotId}/documents`);

export const uploadDocument = (chatbotId: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post(`/api/chatbots/${chatbotId}/documents`, form);
};

export const addTextDocument = (chatbotId: string, title: string, content: string) =>
  api.post(`/api/chatbots/${chatbotId}/documents/text`, { title, content });

export const deleteDocument = (chatbotId: string, docId: string) =>
  api.delete(`/api/chatbots/${chatbotId}/documents/${docId}`);

export const scrapeUrl = (chatbotId: string, url: string) =>
  api.post(`/api/chatbots/${chatbotId}/documents/scrape`, { url });

// ── Analytics ──
export const getAnalytics = (chatbotId: string) =>
  api.get(`/api/chatbots/${chatbotId}/analytics`);

export const getConversations = (chatbotId: string) =>
  api.get(`/api/chatbots/${chatbotId}/conversations`);

export { API_BASE };
