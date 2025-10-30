import { db } from "@cograde/firebase/server";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { downloadImage, validateImage } from "../../utils.ts";
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
        const { url } = c.req.valid("json");

        const image = await downloadImage(url);

        if (!image) {
          return c.json(
            { error: "Erro ao baixar a imagem", code: "IMAGE_DOWNLOAD_ERROR" },
            400
          );
        }

        const sizeValidation = await validateImage({
          data: image.data,
          contentType: image.contentType,
          contentLength: image.contentLength,
        });

        if (!sizeValidation.isValid) {
          return c.json(
            {
              error: sizeValidation.error || "Erro ao validar a imagem",
              code: "IMAGE_VALIDATION_ERROR",
            },
            400
          );
        }

        return c.json(
          {
            status: "started",
            jobId: "unknown",
            message: "Job de processamento de imagem criado com sucesso",
          },
          201
        );
      } catch (error) {
        console.error("Erro ao criar job:", error);
        return c.json(
          {
            error: "Erro interno do servidor",
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
      const jobsCollection = db.collection("jobs");

      const query = jobsCollection.orderBy("createdAt", "desc").limit(10);
      const snapshot = await query.get();

      const jobs = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));

      return c.json({ jobs });
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
