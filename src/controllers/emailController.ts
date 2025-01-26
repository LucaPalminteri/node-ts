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
      const data = JSON.parse(body);

      if (!data.to || !data.subject) {
        throw new Error("Missing required fields: 'to' and 'subject' are mandatory");
      }

      await sendEmail(emailConfig, {
        from: emailConfig.auth.user,
        // to: data.to,
        // subject: data.subject,
        //text: data.text, // Optional plain text fallback
        //html: data.html, // Optional direct HTML content
        // template: data.template, // Template name if using
        // variables: data.variables, // Template variables
        to: "lucapalminteri022@gmail.com",
        subject: "Welcome!",
        template: "welcome",
        variables: {
          name: "John Doe",
          verificationLink: "https://example.com/verify",
        },
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      logger.error(`Email error: ${error}`);
      const errorMessage = error instanceof Error ? error.message : "Failed to send email";
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: errorMessage,
          details: error instanceof Error ? error.stack : undefined,
        })
      );
    }
  });
};
