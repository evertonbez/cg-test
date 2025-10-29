import { createAdaptorServer } from "@hono/node-server";
import app from "./app.ts";

const server = createAdaptorServer({
  fetch: app.fetch,
  hostname: "0.0.0.0",
});

server.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
