import * as assert from "assert";
import { sendEmail } from "../services/emailService.ts";
import { emailConfig } from "../config/emailConfig.ts";

// Test SMTP configuration (update these values in your .env)
const testConfig = {
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!,
  },
};

describe("Email Service", () => {
  it("should connect to SMTP server", async () => {
    const testEmail = {
      from: testConfig.auth.user,
      to: testConfig.auth.user, // Send to self for testing
      subject: "Test Connection",
      text: "SMTP Connection Test",
    };

    await assert.doesNotReject(sendEmail(testConfig, testEmail), "Should establish SMTP connection");
  });

  it("should reject invalid credentials", async () => {
    const invalidConfig = { ...testConfig, auth: { user: "bad", pass: "wrong" } };

    await assert.rejects(
      sendEmail(invalidConfig, {
        from: "invalid@test.com",
        to: "test@example.com",
        subject: "Test",
        text: "Should fail",
      }),
      /Authentication failed/
    );
  });
});
