import { getJobByIdQuery, getJobsQuery } from "@cograde/firebase/admin/queries";
import { db } from "@cograde/firebase/server";
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
        200: {
          description: "Job already exists",
          content: {
            "application/json": {
              schema: z.object({
                status: z.string(),
                jobId: z.string(),
                message: z.string(),
              }),
            },
          },
        },
        201: {
          description: "Job created",
          content: {
            "application/json": {
              schema: z.object({
                status: z.string(),
                jobId: z.string(),
                message: z.string(),
              }),
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: z.object({
                error: z.string(),
                code: z.string(),
              }),
            },
          },
        },
        500: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: z.object({
                error: z.string(),
                code: z.string(),
              }),
            },
          },
        },
      },
      tags: ["jobs"],
    }),
    async (c) => {
      try {
        const { id, url } = c.req.valid("json");
        const job = await getJobByIdQuery(db, id);

        if (job) {
          return c.json(
            {
              status: "exists",
              jobId: job.id,
              message: "Job already exists",
            },
            200
          );
        }

        const newJob = await imageProcessing.trigger({ id, inputUrl: url });

        return c.json(
          {
            status: "created",
            jobId: id,
            message: "Job created successfully",
          },
          201
        );
      } catch (error) {
        console.error("Error creating job:", error);
        return c.json(
          {
            error: "Internal server error",
            code: "INTERNAL_ERROR",
          },
          500
        );
      }
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
      const jobs = await getJobsQuery(db, {
        limit: 30,
        orderBy: "createdAt",
        orderDirection: "desc",
      });

      return c.json({ data: jobs });
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
      const id = c.req.param("id");

      const job = await getJobByIdQuery(db, id);

      return c.json({ data: job });
    }
  );

export const jobsRoute = app;
