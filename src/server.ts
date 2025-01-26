import * as http from "http";
import { IncomingMessage, ServerResponse } from "http";
import { createLogger } from "./utils/logger.ts";
import { Router } from "./routes/router.ts";
import "./routes/index.ts";
import { setCorsHeaders } from "./config/cors.ts";

const logger = createLogger("Server");
const port: number = 3000;

console.clear();
logger.info("Starting server...");

const router = new Router();

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    await router.handle(req, res);
  } catch (error) {
    logger.error(`Request handling error: ${error}`);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
});

server.listen(port, () => {
  logger.info(`Server is running on http://127.0.0.1:${port}`);
});
