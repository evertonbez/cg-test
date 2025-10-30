import { z } from "@hono/zod-openapi";

export const CreateJobSchema = z
  .object({
    id: z.string(),
    url: z.url(),
  })
  .openapi("CreateJobSchema");
