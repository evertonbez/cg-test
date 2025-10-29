import app from "./app.ts";
import config from "./config.ts";
import { createHttpServer } from "./server/http.ts";

const server = createHttpServer(app);

await Promise.all([]);

server.listen(config.port);
