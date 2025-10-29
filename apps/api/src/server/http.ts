import { createAdaptorServer, type ServerType } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import config from "../config.ts";

const uncaughtException = "uncaughtException";
const unhandledRejection = "unhandledRejection";
const sigterm = "SIGTERM";
const sigint = "SIGINT";

function gracefulShutdown(httpServer: ServerType, opt: { timeout: number }) {
  const exitFn = async () => {
    console.log("Shutting down server...");
  };

  return (code: number, reason: string) => (err: unknown) => {
    if (err && err instanceof Error) {
      console.error(err.message, err.stack);
    } else {
      console.error(`The api will close because: ${reason} with ${code}`);
    }
    httpServer.close(exitFn);
    setTimeout(exitFn, opt.timeout).unref();
  };
}

export const createHttpServer = (app: OpenAPIHono) => {
  const httpServer = createAdaptorServer({
    fetch: app.fetch,
    hostname: "0.0.0.0",
    port: config.port,
  });

  httpServer.on("listening", () => {
    console.log(`Running HTTP server at: http://localhost:${config.port}`);
  });

  const exitHandler = gracefulShutdown(httpServer, { timeout: 500 });

  process.on(uncaughtException, exitHandler(1, "Unexpected Error Occurred"));
  process.on(unhandledRejection, exitHandler(1, "Unhandled Promise"));
  process.on(sigint, exitHandler(0, `Your operating system: ${sigint}`));
  process.on(sigterm, exitHandler(0, `Your operating system: ${sigterm}`));

  return httpServer;
};
