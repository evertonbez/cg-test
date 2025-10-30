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

export const imageDeploy = job(
  "image-deploy",
  z.object({
    imageId: z.string(),
  }),
  {
    queue: imageProcessingQueue,
  },
  async (data, ctx) => {
    console.log("Deploying image", data);
    return {
      status: "deployed",
    };
  }
);
