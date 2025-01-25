import { IncomingMessage, ServerResponse } from "http";

export const homeController = (req: IncomingMessage, res: ServerResponse): void => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Welcome to the home page!");
};
