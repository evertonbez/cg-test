import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { basicAuth } from "hono/basic-auth";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { getAllQueues } from "./queues/index.ts";
import { jobsRoute } from "./routes/jobs/index.ts";

const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
    }
  },
});

app.use("*", requestId());
app.use(secureHeaders());
app.use(logger());

const basePath = "/admin";

app.use(
  "/admin",
  basicAuth({
    username: "admin",
    password: "password",
  })
);

app.use(
  "/admin/*",
  basicAuth({
    username: "admin",
    password: "password",
  })
);

export function initializeBullBoard() {
  const queues = getAllQueues();

  if (queues.length === 0) {
    console.warn("No queues found when initializing BullBoard");
    return;
  }

  const serverAdapter = new HonoAdapter(serveStatic);
  serverAdapter.setBasePath(basePath);

  createBullBoard({
    queues: queues.map((queue) => new BullMQAdapter(queue)),
    serverAdapter,
  });

  app.route(basePath, serverAdapter.registerPlugin());

  console.log(
    `BullBoard initialized with ${queues.length} queues:`,
    queues.map((q) => q.name)
  );
}

app.get("/health", async (c) => {
  try {
    return c.json({ status: "ok" }, 200);
  } catch (error) {
    return c.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Health check failed",
      },
      500
    );
  }
});

app.route("/api/jobs", jobsRoute);

app.doc("/openapi", {
  openapi: "3.1.0",
  info: {
    version: "0.0.1",
    title: "Cograde API",
    description: "Cograde challenge API.",
  },
});

app.get(
  "/",
  Scalar({ url: "/openapi", pageTitle: "Cograde API", theme: "saturn" })
);

export default app;
