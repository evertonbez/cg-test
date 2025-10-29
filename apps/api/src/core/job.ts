import type { Job } from "bullmq";
import { Queue } from "bullmq";
import type { z } from "zod";
import { createBaseQueueOptions } from "../queues/base.ts";

export interface JobContext {
  job: Job;
}

interface JobOptions {
  queue: string | { name: string; [key: string]: any };
  priority?: number;
  attempts?: number;
  delay?: number;
  removeOnComplete?: number;
  removeOnFail?: number;
}

class JobRegistry {
  private static instance: JobRegistry;
  private jobs: Map<string, SimpleJob> = new Map();
  private jobQueues: Map<string, string> = new Map();
  private queues: Map<string, Queue> = new Map();

  static getInstance(): JobRegistry {
    if (!JobRegistry.instance) {
      JobRegistry.instance = new JobRegistry();
    }
    return JobRegistry.instance;
  }

  register(id: string, job: any, queueName: string) {
    this.jobs.set(id, job);
    this.jobQueues.set(id, queueName);
    return job;
  }

  get(id: string) {
    return this.jobs.get(id);
  }

  getAll() {
    return Array.from(this.jobs.values());
  }

  getQueue(jobId: string) {
    const queueName = this.jobQueues.get(jobId);
    if (!queueName) {
      throw new Error(
        `No queue found for job "${jobId}". Make sure the job has a queue property.`
      );
    }

    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, createBaseQueueOptions());
      this.queues.set(queueName, queue);
    }

    return this.queues.get(queueName)!;
  }

  async closeQueues() {
    for (const [name, queue] of this.queues) {
      await queue.close();
      console.log(`Closed queue: ${name}`);
    }
    this.queues.clear();
  }
}

const registry = JobRegistry.getInstance();

class SimpleJob<T = any> {
  constructor(
    public id: string,
    public schema: z.ZodSchema<T>,
    private handler: (payload: T, ctx: JobContext) => Promise<any>,
    private options: JobOptions
  ) {
    const queueName =
      typeof this.options.queue === "string"
        ? this.options.queue
        : this.options.queue.name;
    registry.register(this.id, this, queueName);
  }

  private validate(data: unknown): T {
    try {
      return this.schema.parse(data);
    } catch (error) {
      console.error("Job validation failed", { jobId: this.id, error });
      throw new Error(
        `Validation failed for ${this.id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async trigger(payload: T, options: Record<string, any> = {}) {
    const queue = registry.getQueue(this.id);
    const validated = this.validate(payload);
    const baseOptions = createBaseQueueOptions().defaultJobOptions || {};

    const job = await queue.add(this.id, validated, {
      priority: this.options.priority ?? baseOptions.priority ?? 1,
      attempts: this.options.attempts ?? baseOptions.attempts ?? 3,
      delay: this.options.delay ?? options.delay ?? 0,
      removeOnComplete:
        this.options.removeOnComplete !== undefined
          ? { count: this.options.removeOnComplete, age: 24 * 3600 }
          : baseOptions.removeOnComplete,
      removeOnFail:
        this.options.removeOnFail !== undefined
          ? { count: this.options.removeOnFail, age: 7 * 24 * 3600 }
          : baseOptions.removeOnFail,
      backoff: baseOptions.backoff,
      ...options,
    });

    console.log(`Job triggered: ${job.id} (${this.id})`);
    return job;
  }

  async execute(job: Job) {
    const validated = this.validate(job.data);
    console.info("Executing job", { jobId: job.id, type: this.id });

    try {
      const ctx: JobContext = {
        job,
      };

      const result = await this.handler(validated, ctx);
      console.info("Job completed", { jobId: job.id, type: this.id });
      return result;
    } catch (error) {
      console.error("Job failed", { jobId: job.id, type: this.id, error });
      throw error;
    }
  }
}

export function job<T = any>(
  id: string,
  schema: z.ZodSchema<T>,
  options: JobOptions,
  handler: (payload: T, ctx: JobContext) => Promise<any>
): SimpleJob<T> {
  return new SimpleJob(id, schema, handler, options);
}

export async function executeJob(jobId: string, job: Job) {
  const jobInstance = registry.get(jobId);
  if (!jobInstance) {
    throw new Error(`No job found for ${jobId}`);
  }
  return jobInstance.execute(job);
}

export async function closeQueues() {
  return registry.closeQueues();
}

export { registry as jobRegistry };
