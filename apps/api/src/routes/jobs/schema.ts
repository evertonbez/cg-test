import { z } from "@hono/zod-openapi";

export const CreateJobSchema = z
  .object({
    url: z.url(),
  })
  .openapi("CreateJobSchema");
