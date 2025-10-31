import type { Timestamp } from "firebase/firestore";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { useState } from "react";

export interface Steps {
  transform: "pending" | "started" | "done" | "error";
  download: "pending" | "started" | "done" | "error";
  upload: "pending" | "started" | "done" | "error";
}

export interface UpdatedAt {
  type: string;
  seconds: number;
  nanoseconds: number;
}

export interface Job {
  id: string;
  status: "pending" | "started" | "done" | "error";
  outputUrl?: string;
  steps: Steps;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  inputUrl: string;
  errorMessage?: string;
  progress?: number;
}

interface JobItemProps {
  job: Job;
}

const JobItem = ({ job }: JobItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "done":
        return "text-emerald-400";
      case "error":
        return "text-red-400";
      case "started":
        return "text-blue-400";
      case "pending":
        return "text-yellow-400";
      default:
        return "text-neutral-400";
    }
  };

  const getStatusBg = (status: Job["status"]) => {
    switch (status) {
      case "done":
        return "bg-emerald-500/10 border-emerald-500/30";
      case "error":
        return "bg-red-500/10 border-red-500/30";
      case "started":
        return "bg-blue-500/10 border-blue-500/30";
      case "pending":
        return "bg-yellow-500/10 border-yellow-500/30";
      default:
        return "bg-neutral-500/10 border-neutral-500/30";
    }
  };

  const getStatusIcon = (status: Job["status"]) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case "started":
        return <Zap className="h-5 w-5 text-blue-400 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: Job["status"]) => {
    switch (status) {
      case "done":
        return "Concluído";
      case "error":
        return "Erro";
      case "started":
        return "Processando";
      case "pending":
        return "Pendente";
      default:
        return "Desconhecido";
    }
  };

  const truncateUrl = (url: string, maxLength = 50) => {
    return url.length > maxLength ? url.substring(0, maxLength) + "..." : url;
  };

  return (
    <div
      className={`rounded-lg border transition-all ${getStatusBg(job.status)}`}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getStatusIcon(job.status)}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-200 truncate">
                {job.id}
              </span>
              <span
                className={`text-xs font-semibold ${getStatusColor(
                  job.status,
                )}`}
              >
                {getStatusLabel(job.status)}
              </span>
            </div>
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {truncateUrl(job.inputUrl)}
            </p>
          </div>
        </div>

        {/* Progress and Toggle */}
        <div className="flex items-center gap-2 ml-2">
          <div className="w-12 text-right">
            <span className="text-xs font-medium text-neutral-300">
              {/* {Math.round(job.progress)}% */}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-neutral-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          )}
        </div>
      </button>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              job.status === "done"
                ? "bg-emerald-500"
                : job.status === "error"
                  ? "bg-red-500"
                  : "bg-linear-to-r from-blue-500 to-cyan-500"
            }`}
            style={{ width: `${Math.min(job.progress ?? 0, 100)}%` }}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-current/20 px-4 py-3 space-y-3">
          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-neutral-500">Criado em</p>
              <p className="text-neutral-300 font-medium">
                {job.createdAt.toDate().toLocaleString("pt-BR")}
              </p>
            </div>
            {job.updatedAt && (
              <div>
                <p className="text-neutral-500">Atualizado em</p>
                <p className="text-neutral-300 font-medium">
                  {job.updatedAt.toDate().toLocaleString("pt-BR")}
                </p>
              </div>
            )}
          </div>

          {/* Input URL */}
          <div>
            <p className="text-xs text-neutral-500 mb-1">
              URL da Imagem de Entrada
            </p>
            <a
              href={job.inputUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 break-all"
            >
              {job.inputUrl}
            </a>
          </div>

          {/* Error Message */}
          {job.errorMessage && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2">
              <p className="text-xs text-red-200">
                <strong>Erro:</strong> {job.errorMessage}
              </p>
            </div>
          )}

          {/* Output Image */}
          {job.outputUrl && job.status === "done" && (
            <div>
              <p className="text-xs text-neutral-500 mb-2">Imagem Processada</p>
              <div className="flex">
                <div className="rounded-md overflow-hidden border border-neutral-600 bg-neutral-800 p-4">
                  {/* biome-ignore lint: Necessário exibir imagem processada */}
                  <img
                    src={job.outputUrl}
                    alt="Processed output"
                    className="h-64 object-cover aspect-auto"
                  />
                </div>
              </div>
              <a
                href={job.outputUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
              >
                Ver em tamanho completo →
              </a>
            </div>
          )}

          {/* Status Info */}
          <div className="rounded-md border border-neutral-600 bg-neutral-800/50 p-2">
            <p className="text-xs text-neutral-400">
              <strong>Status:</strong> {getStatusLabel(job.status)} (
              {job.progress ?? 100}% concluído)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobItem;
