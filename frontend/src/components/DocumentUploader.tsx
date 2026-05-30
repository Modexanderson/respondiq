import { useState, useCallback } from "react";
import { Upload, FileText, Globe, Type, X, Loader2 } from "lucide-react";
import { uploadDocument, addTextDocument, scrapeUrl } from "../services/api";

interface Props {
  chatbotId: string;
  onUpload: () => void;
}

export default function DocumentUploader({ chatbotId, onUpload }: Props) {
  const [tab, setTab] = useState<"file" | "url" | "text">("file");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // URL state
  const [url, setUrl] = useState("");

  // Text state
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  const handleFileDrop = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setUploading(true);
      setError("");
      try {
        for (const file of Array.from(files)) {
          await uploadDocument(chatbotId, file);
        }
        onUpload();
      } catch (err: any) {
        setError(err.response?.data?.detail || "Upload failed");
      }
      setUploading(false);
    },
    [chatbotId, onUpload]
  );

  const handleScrape = async () => {
    if (!url.trim()) return;
    setUploading(true);
    setError("");
    try {
      await scrapeUrl(chatbotId, url);
      setUrl("");
      onUpload();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Scrape failed");
    }
    setUploading(false);
  };

  const handleAddText = async () => {
    if (!textTitle.trim() || !textContent.trim()) return;
    setUploading(true);
    setError("");
    try {
      await addTextDocument(chatbotId, textTitle, textContent);
      setTextTitle("");
      setTextContent("");
      onUpload();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add text");
    }
    setUploading(false);
  };

  const tabs = [
    { id: "file" as const, icon: FileText, label: "Upload File" },
    { id: "url" as const, icon: Globe, label: "Scrape URL" },
    { id: "text" as const, icon: Type, label: "Add Text" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex gap-2 mb-4">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              setError("");
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === id
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}

      {tab === "file" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFileDrop(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
          }`}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-xs text-gray-400">
                PDF, TXT, DOCX, CSV, MD (max 10 MB)
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.docx,.csv,.md,.json"
                onChange={(e) => handleFileDrop(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700"
              >
                Choose Files
              </label>
            </>
          )}
        </div>
      )}

      {tab === "url" && (
        <div className="space-y-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/about"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleScrape}
            disabled={uploading || !url.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            Scrape URL
          </button>
        </div>
      )}

      {tab === "text" && (
        <div className="space-y-3">
          <input
            type="text"
            value={textTitle}
            onChange={(e) => setTextTitle(e.target.value)}
            placeholder="Title (e.g., FAQ, Product Info)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste your content here..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={handleAddText}
            disabled={uploading || !textTitle.trim() || !textContent.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />}
            Add Text
          </button>
        </div>
      )}
    </div>
  );
}
