import { createBaseQueueOptions } from "./base.ts";

const QUEUES = {
  imageProcessing: {
    concurrency: 10,
    options: createBaseQueueOptions({
      defaultJobOptions: {
        removeOnComplete: { count: 50, age: 14 * 24 * 3600 },
        attempts: 3,
        priority: 2,
        backoff: { type: "exponential", delay: 5000 },
      },
    }),
  },
} as const;

function createJobQueue(name: keyof typeof QUEUES) {
  const config = QUEUES[name];
  const jobOptions = config.options.defaultJobOptions;
  return {
    name,
    concurrencyLimit: config.concurrency,
    priority: jobOptions?.priority ?? 1,
    removeOnComplete: (jobOptions?.removeOnComplete as any)?.count ?? 50,
    removeOnFail: (jobOptions?.removeOnFail as any)?.count ?? 50,
    attempts: jobOptions?.attempts ?? 3,
  };
}

export const imageProcessingQueue = createJobQueue("imageProcessing");

export const queues = {
  imageProcessing: { name: "imageProcessing", ...QUEUES.imageProcessing },
} as const;
