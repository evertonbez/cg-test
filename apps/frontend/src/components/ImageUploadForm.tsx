import {
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

interface ImageUploadFormProps {
  onSubmit: (url: string) => Promise<void>;
}

const ImageUploadForm = ({ onSubmit }: ImageUploadFormProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const validateUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!url.trim()) {
      setFeedback({
        type: "error",
        message: "Por favor, insira uma URL de imagem",
      });
      return;
    }

    if (!validateUrl(url)) {
      setFeedback({
        type: "error",
        message: "URL inválida. Por favor, insira uma URL válida",
      });
      return;
    }

    setLoading(true);
    setFeedback({ type: null, message: "" });

    try {
      await onSubmit(url);
      setFeedback({
        type: "success",
        message: "Job criado com sucesso! Verifique a lista de jobs.",
      });
      setUrl("");

      setTimeout(() => {
        setFeedback({ type: null, message: "" });
      }, 3000);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erro ao criar job. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 backdrop-blur-sm">
      <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Submit Image</h2>
        <p className="mt-1 text-sm text-slate-400">
          Enter an image URL to start processing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        {/* URL Input */}
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-slate-200"
          >
            Image URL
          </label>
          <div className="relative mt-2">
            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-md border border-slate-600 bg-slate-800 py-2 pl-10 pr-4 text-white placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              disabled={loading}
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Suporte para JPG, PNG, GIF, WebP
          </p>
        </div>

        {/* Feedback Messages */}
        {feedback.type === "success" && (
          <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-200">{feedback.message}</p>
          </div>
        )}

        {feedback.type === "error" && (
          <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-200">{feedback.message}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Submit Image"
          )}
        </button>

        {/* Info Box */}
        <div className="rounded-md border border-slate-700 bg-slate-800/50 p-3">
          <p className="text-xs text-slate-300">
            ℹ️ Your image will be processed asynchronously. You can track the
            progress on the jobs list on the right.
          </p>
        </div>
      </form>
    </div>
  );
};

export default ImageUploadForm;
