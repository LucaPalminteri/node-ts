import * as http from "http";
import { routes } from "./routes/index.ts";
import { IncomingMessage, ServerResponse } from "http";
import * as url from "url";
import { createLogger } from "./utils/logger.ts";

const logger = createLogger("Server");
const port: number = 3000;

console.clear();
logger.info("Starting server...");

interface Route {
  [key: string]: (req: IncomingMessage, res: ServerResponse) => void;
}

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  if (!req.url || !req.method) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad Request: No URL provided");
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path: string = parsedUrl.pathname || "/";
  const method = req.method;
  const routeKey = `${method} ${path}`;

  const routeHandler = (routes as Route)[routeKey];

  if (routeHandler) {
    routeHandler(req, res);
  } else {
    logger.warn(`Route not found: ${path}`);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(port, () => {
  logger.info(`Server is running on http://127.0.0.1:${port}`);
});
