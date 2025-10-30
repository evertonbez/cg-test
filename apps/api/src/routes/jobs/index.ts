import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { imageProcessing } from "../../jobs/image/processing.ts";
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

        const validateImage = async (
          imageUrl: string
        ): Promise<{ isValid: boolean; error?: string }> => {
          try {
            const response = await fetch(imageUrl, {
              method: "HEAD",
              signal: AbortSignal.timeout(20000),
            });

            if (!response.ok) {
              if (response.status === 404) {
                return { isValid: false, error: "Image not found (404)" };
              }
              return {
                isValid: false,
                error: `Error accessing image: ${response.status}`,
              };
            }

            const contentLength = response.headers.get("content-length");

            if (contentLength) {
              const sizeInBytes = parseInt(contentLength, 10);
              const maxSize = 10 * 1024 * 1024; // 10MB max size

              if (sizeInBytes > maxSize) {
                const sizeInMB = Math.round(sizeInBytes / 1024 / 1024);
                return {
                  isValid: false,
                  error: `Image too large: ${sizeInMB}MB. Maximum allowed size: 10MB`,
                };
              }
            }

            const contentType = response.headers.get("content-type");

            if (contentType && !contentType.startsWith("image/")) {
              return {
                isValid: false,
                error: "URL does not point to a valid image",
              };
            }

            return { isValid: true };
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
              return { isValid: false, error: "Timeout ao validar a imagem" };
            }
            return { isValid: false, error: "Erro ao validar a imagem" };
          }
        };

        const sizeValidation = await validateImage(url);

        if (!sizeValidation.isValid) {
          return c.json(
            {
              error: sizeValidation.error || "Erro ao validar a imagem",
              code: "IMAGE_VALIDATION_ERROR",
            },
            400
          );
        }

        const job = await imageProcessing.trigger({ url });

        return c.json(
          {
            status: "started",
            jobId: job.id || "unknown",
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
