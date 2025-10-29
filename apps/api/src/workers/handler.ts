import type { Job, Processor } from "bullmq";
import { executeJob } from "../core/job.ts";
import { queues } from "../queues/queues.ts";

export function createWorkerHandlers(): Record<string, Processor> {
  const handlers: Record<string, Processor> = {};

  for (const [_, queueConfig] of Object.entries(queues)) {
    handlers[queueConfig.name] = async (job: Job) => {
      return executeJob(job.name, job);
    };
  }

  return handlers;
}
