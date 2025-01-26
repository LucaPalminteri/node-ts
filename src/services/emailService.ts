import { connect } from "tls";
import { createLogger } from "../utils/logger.ts";
import { renderTemplate } from "../utils/template.ts";

const logger = createLogger("EmailService");

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  variables?: Record<string, string>;
}

export async function sendEmail(config: EmailConfig, options: EmailOptions) {
  return new Promise(async (resolve, reject) => {
    const socket = connect({
      host: config.host,
      port: config.port,
      rejectUnauthorized: false,
    });

    let buffer = "";
    let state = "CONNECT";

    let htmlContent = options.html || "";
    let textContent = options.text || "";

    if (options.template) {
      try {
        htmlContent = await renderTemplate(options.template, options.variables || {});

        // Generate text version if not provided
        textContent =
          options.text ||
          htmlContent
            .replace(/<[^>]+>/g, "")
            .replace(/\s\s+/g, " ")
            .trim();
      } catch (error) {
        logger.error(`Template processing failed: ${error}`);
        reject(error);
        return;
      }
    }

    const sendCommand = (cmd: string) => {
      logger.debug(`C: ${cmd}`);
      socket.write(cmd + "\r\n");
    };

    const processResponse = (response: string) => {
      const code = parseInt(response.substring(0, 3));
      logger.debug(`Processing code: ${code}`);

      switch (state) {
        case "CONNECT":
          if (code === 220) {
            sendCommand(`EHLO ${config.host}`);
            state = "EHLO_SENT";
          }
          break;

        case "EHLO_SENT":
          if (code === 250) {
            sendCommand("AUTH LOGIN");
            state = "AUTH_INITIATED";
          }
          break;

        case "AUTH_INITIATED":
          if (response.includes("334 VXNlcm5hbWU6")) {
            sendCommand(Buffer.from(config.auth.user).toString("base64"));
            state = "USER_SENT";
          }
          break;

        case "USER_SENT":
          if (response.includes("334 UGFzc3dvcmQ6")) {
            sendCommand(Buffer.from(config.auth.pass).toString("base64"));
            state = "PASS_SENT";
          }
          break;

        case "PASS_SENT":
          if (code === 235) {
            sendCommand(`MAIL FROM: <${options.from}>`);
            state = "MAIL_FROM_SENT";
          }
          break;

        case "MAIL_FROM_SENT":
          if (code === 250) {
            sendCommand(`RCPT TO: <${options.to}>`);
            state = "RCPT_TO_SENT";
          }
          break;

        case "RCPT_TO_SENT":
          if (code === 250) {
            sendCommand("DATA");
            state = "DATA_SENT";
          }
          break;

        case "DATA_SENT":
          if (code === 354) {
            const message = [
              `From: <${options.from}>`,
              `To: <${options.to}>`,
              `Subject: ${options.subject}`,
              `MIME-Version: 1.0`,
              `Content-Type: multipart/alternative; boundary="BOUNDARY"`,
              "",
              "--BOUNDARY",
              "Content-Type: text/plain; charset=utf-8",
              "",
              textContent,
              "",
              "--BOUNDARY",
              "Content-Type: text/html; charset=utf-8",
              "",
              htmlContent,
              "--BOUNDARY--",
              ".",
            ].join("\r\n");

            sendCommand(message);
            state = "MESSAGE_SENT";
          }
          break;

        case "MESSAGE_SENT":
          if (code === 250) {
            sendCommand("QUIT");
            state = "QUIT_SENT";
          }
          break;

        case "QUIT_SENT":
          if (code === 221) {
            logger.info("Email sent successfully");
            resolve(true);
          }
          break;

        default:
          logger.error(`Unexpected state: ${state}`);
          reject(new Error("Invalid SMTP state"));
          break;
      }
    };

    socket.on("data", (data) => {
      buffer += data.toString();
      logger.debug(`S: ${data.toString().trim()}`);

      while (buffer.includes("\r\n")) {
        const lineEnd = buffer.indexOf("\r\n");
        const line = buffer.substring(0, lineEnd);
        buffer = buffer.substring(lineEnd + 2);
        processResponse(line);
      }
    });

    socket.on("end", () => logger.info("Connection closed"));
  });
}
