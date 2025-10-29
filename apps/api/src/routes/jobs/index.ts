import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { imageProcessing } from "../../jobs/index.ts";
import { CreateJobSchema } from "./schema.ts";

const app = new OpenAPIHono()
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      summary: "Create a new image processing job",
      request: {
        body: {
          content: {
            "application/json": {
              schema: CreateJobSchema,
            },
          },
        },
      },
      responses: {
        201: {
          description: "Job created",
          content: {
            "application/json": {
              schema: z.object({
                status: z.string(),
              }),
            },
          },
        },
      },
      tags: ["jobs"],
    }),
    async (c) => {
      const job = await imageProcessing.trigger({
        url: "https://example.com/image.jpg",
      });

      return c.json(
        {
          status: "started",
        },
        201
      );
    }
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      summary: "Get all jobs",
      responses: {
        200: {
          description: "Jobs found",
        },
      },
      tags: ["jobs"],
    }),
    async (c) => {
      return c.json([]);
    }
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/{id}",
      summary: "Get a job by ID",
      responses: {
        200: {
          description: "Job found",
        },
      },
      tags: ["jobs"],
    }),
    async (c) => {
      return c.json({});
    }
  );

export const jobsRoute = app;
