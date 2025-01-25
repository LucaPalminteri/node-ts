import { IncomingMessage, ServerResponse } from "http";
import { getApiMessage } from "../services/apiService.ts";
import { createLogger } from "../utils/logger.ts";

const logger = createLogger("ApiController");

export const apiController = (req: IncomingMessage, res: ServerResponse) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  try {
    const data = getApiMessage();
    logger.debug(`Data fetched: ${JSON.stringify(data)}`);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
    logger.info("Response sent successfully");
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};
