import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
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
