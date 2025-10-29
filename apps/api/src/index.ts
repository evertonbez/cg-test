import { serve } from "@hono/node-server";
import app from "./app.ts";
import config from "./config.ts";
import { workerService } from "./workers/index.ts";

// const server = createHttpServer(app);

await Promise.all([workerService.initialize()]);

serve({
  fetch: app.fetch,
  hostname: "0.0.0.0",
  port: config.port,
});

console.log(`Server running at http://localhost:${config.port}`);
