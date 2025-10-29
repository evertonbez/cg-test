import app from "./app.ts";
import config from "./config.ts";
import { createHttpServer } from "./server/http.ts";
import { workerService } from "./workers/index.ts";

const server = createHttpServer(app);

await Promise.all([workerService.initialize()]);

server.listen(config.port);
