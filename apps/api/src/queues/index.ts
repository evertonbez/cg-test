import { Queue } from "bullmq";
import { queueRegistry } from "./base.ts";
import { queues } from "./queues.ts";

export async function initializeAllQueues(): Promise<void> {
  console.info("Initializing all queues...");

  for (const [_, config] of Object.entries(queues)) {
    const queue = new Queue(config.name, config.options);
    queueRegistry.registerQueue(config.name, queue);
    console.info("Queue initialized", { queueName: config.name });
  }

  console.info("All queues initialized", {
    queueCount: queueRegistry.getAllQueues().length,
    queueNames: queueRegistry.getAllQueues().map((q) => q.name),
  });
}

export function getAllQueues() {
  return queueRegistry.getAllQueues();
}

export * from "./base.ts";
export { queues } from "./queues.ts";
