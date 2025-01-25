import { IncomingMessage, ServerResponse } from "http";

export const aboutController = (req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("This is the about page.");
};
