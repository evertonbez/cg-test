import { useFirestoreRealtime } from "@/hooks/use-firestore-realtime";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import type { Job } from "./job-item";
import JobItem from "./job-item";

const JobsList = () => {
  const { data, loading } = useFirestoreRealtime<Job>("jobs");

  const sortedJobs = useMemo(() => {
    if (!data) return [];
    return [...data].sort(
      (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime(),
    );
  }, [data]);

  const stats = useMemo(() => {
    if (!sortedJobs)
      return { total: 0, processing: 0, completed: 0, failed: 0 };

    return {
      total: sortedJobs.length,
      processing: sortedJobs.filter((j) => j.status === "started").length,
      completed: sortedJobs.filter((j) => j.status === "done").length,
      failed: sortedJobs.filter((j) => j.status === "error").length,
    };
  }, [sortedJobs]);

  const render = useMemo(() => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p className="text-slate-400">Loading jobs...</p>
        </div>
      );
    }
    if (sortedJobs && sortedJobs.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm">
            No jobs yet. Submit an image to get started!
          </p>
        </div>
      );
    }
    if (sortedJobs && sortedJobs.length > 0) {
      return (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {sortedJobs.map((job) => (
            <JobItem key={job.id} job={job} />
          ))}
        </div>
      );
    }
  }, [loading, sortedJobs]);

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b rounded-t-lg border-neutral-700 bg-linear-to-r from-neutral-800 to-neutral-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Jobs Queue</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Real-time processing status
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                ) : (
                  stats.total
                )}
              </p>
              <p className="text-xs text-neutral-400">Total</p>
            </div>
            <div className="h-10 w-px bg-neutral-700" />
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-400">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                ) : (
                  stats.processing
                )}
              </p>
              <p className="text-xs text-neutral-400">Processing</p>
            </div>
            <div className="h-10 w-px bg-neutral-700" />
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-400">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                ) : (
                  stats.completed
                )}
              </p>
              <p className="text-xs text-neutral-400">Completed</p>
            </div>
            <div className="h-10 w-px bg-neutral-700" />
            <div className="text-right">
              <p className="text-2xl font-bold text-red-400">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                ) : (
                  stats.failed
                )}
              </p>
              <p className="text-xs text-neutral-400">Failed</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">{render}</div>
    </div>
  );
};

export default JobsList;
