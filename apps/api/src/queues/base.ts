import { Queue, type QueueOptions } from "bullmq";
import redisConnection from "../config/redis.ts";

export const createBaseQueueOptions = (
  overrides: Partial<QueueOptions> = {}
): QueueOptions => ({
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: { count: 50, age: 24 * 3600 },
    removeOnFail: { count: 50, age: 7 * 24 * 3600 },
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
  ...overrides,
});

export class QueueRegistry {
  private static instance: QueueRegistry;
  private queues: Map<string, Queue> = new Map();

  static getInstance(): QueueRegistry {
    if (!QueueRegistry.instance) {
      QueueRegistry.instance = new QueueRegistry();
    }
    return QueueRegistry.instance;
  }

  registerQueue(name: string, queue: Queue): void {
    this.queues.set(name, queue);
  }

  getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  getAllQueues(): Queue[] {
    return Array.from(this.queues.values());
  }

  async closeAll(): Promise<void> {
    console.info("Closing all queues...");
    const queues = this.getAllQueues();
    await Promise.all(queues.map((queue) => queue.close()));
    console.info("All queues closed");
  }
}

export const queueRegistry = QueueRegistry.getInstance();
