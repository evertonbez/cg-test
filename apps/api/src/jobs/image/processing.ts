import z from "zod";
import { job } from "../../core/job.ts";
import { imageProcessingQueue } from "../../queues/queues.ts";

export const imageProcessing = job(
  "image-processing",
  z.object({
    url: z.url(),
  }),
  {
    queue: imageProcessingQueue,
  },
  async (data, ctx) => {
    console.log("Processing image", data);
  }
);
