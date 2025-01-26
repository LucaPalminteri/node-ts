import { IncomingMessage, ServerResponse } from "http";
import { sendEmail } from "../services/emailService.ts";
import { emailConfig } from "../config/emailConfig.ts";
import { createLogger } from "../utils/logger.ts";

const logger = createLogger("EmailController");

export const emailController = (req: IncomingMessage, res: ServerResponse) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk.toString()));

  req.on("end", async () => {
    try {
      const { to, subject, text, html } = JSON.parse(body);

      await sendEmail(emailConfig, {
        from: emailConfig.auth.user,
        to,
        subject,
        text,
        html,
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      logger.error(`Error: ${error}`);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to send email" }));
    }
  });
};
