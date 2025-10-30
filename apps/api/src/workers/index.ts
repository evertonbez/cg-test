import { Worker } from "bullmq";
import { initializeBullBoard } from "../app.ts";
import redisConnection from "../config/redis.ts";
import { initializeAllQueues, queues } from "../queues/index.ts";
import { createWorkerHandlers } from "./handler.ts";

class WorkerService {
  private activeWorkers: Worker[] = [];

  async initialize() {
    await initializeAllQueues();

    initializeBullBoard();

    const workerHandlers = createWorkerHandlers();

    for (const [queueName, handler] of Object.entries(workerHandlers)) {
      const worker = new Worker(queueName, handler, {
        connection: redisConnection,
        concurrency: this.getOptimalConcurrency(queueName),
        removeOnComplete: { count: 10, age: 1 * 3600 },
        removeOnFail: { count: 25, age: 3 * 24 * 3600 },
      });

      this.setupWorkerEventHandlers(worker, queueName);
      this.activeWorkers.push(worker);
    }
  }

  async shutdown() {
    console.log("Shutting down worker service...");
  }

  private setupWorkerEventHandlers(worker: Worker, queueName: string) {
    worker.on("error", (error) => {
      console.error("Worker error:", error, { queueName });
    });

    worker.on("completed", () => {
      console.log("Worker completed", { queueName });
    });

    worker.on("active", () => {
      console.log("Worker active", { queueName });
    });

    worker.on("ready", () => {
      console.log("Worker ready", { queueName });
    });

    worker.on("closing", () => {
      console.log("Worker closing", { queueName });
    });
  }

  private getOptimalConcurrency(queueName: string): number {
    const queueConfig = Object.values(queues).find(
      (config) => config.name === queueName
    );
    return queueConfig?.concurrency ?? 5;
  }
}

export const workerService = new WorkerService();
