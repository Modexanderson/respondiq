import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FileText, Trash2, Loader2 } from "lucide-react";
import DocumentUploader from "../components/DocumentUploader";
import { listDocuments, deleteDocument } from "../services/api";
import type { Document } from "../types";

export default function KnowledgeBase() {
  const { id } = useParams<{ id: string }>();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    if (!id) return;
    try {
      const res = await listDocuments(id);
      setDocs(res.data);
    } catch {
      // handled
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [id]);

  const handleDelete = async (docId: string) => {
    if (!id || !confirm("Remove this document from the knowledge base?")) return;
    await deleteDocument(id, docId);
    setDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Knowledge Base</h2>
        <p className="text-sm text-gray-500">
          Upload documents, scrape websites, or add text. Your chatbot will use this data to answer questions.
        </p>
      </div>

      <DocumentUploader chatbotId={id!} onUpload={fetchDocs} />

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No documents yet. Upload files or add text to train your chatbot.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-md">
                    {doc.filename}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatSize(doc.sizeBytes)} &middot; {doc.chunks} chunks
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-1.5 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
