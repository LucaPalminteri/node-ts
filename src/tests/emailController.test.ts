import { IncomingMessage, ServerResponse } from "http";
import * as assert from "assert";
import { emailController } from "../controllers/emailController.ts";

function mockEmailRequest(
  method: string,
  body: string
): [IncomingMessage, ServerResponse & { body: string; statusCode: number }] {
  const req = new IncomingMessage({} as any);
  req.method = method;

  const res = {
    writeHead: (statusCode: number) => {
      res.statusCode = statusCode;
    },
    end: (data: string) => {
      res.body = data;
    },
    body: "",
    statusCode: 200,
  } as unknown as ServerResponse & { body: string; statusCode: number };

  // Simulate data stream for POST requests
  if (method === "POST") {
    process.nextTick(() => {
      req.emit("data", Buffer.from(body));
      req.emit("end");
    });
  }

  return [req, res];
}

try {
  // Test valid email request
  const [validReq, validRes] = mockEmailRequest(
    "POST",
    JSON.stringify({
      to: "test@example.com",
      subject: "Test Email",
      text: "This is a test message",
    })
  );

  emailController(validReq, validRes);

  process.nextTick(() => {
    assert.strictEqual(validRes.statusCode, 200, "Should return 200 status");
    assert.deepStrictEqual(JSON.parse(validRes.body), { success: true }, "Should return success response");
    console.log("Valid email request test passed.");
  });
} catch (error) {
  console.error("Valid email request test failed.");
  throw error;
}

try {
  // Test invalid JSON
  const [invalidReq, invalidRes] = mockEmailRequest("POST", "{invalid-json");

  emailController(invalidReq, invalidRes);

  process.nextTick(() => {
    assert.strictEqual(invalidRes.statusCode, 500, "Should return 500 status");
    assert.match(invalidRes.body, /Failed to send email/, "Should return error message");
    console.log("Invalid JSON test passed.");
  });
} catch (error) {
  console.error("Invalid JSON test failed.");
  throw error;
}

try {
  // Test missing required fields
  const [missingFieldsReq, missingFieldsRes] = mockEmailRequest("POST", JSON.stringify({ subject: "No recipient" }));

  emailController(missingFieldsReq, missingFieldsRes);

  process.nextTick(() => {
    assert.strictEqual(missingFieldsRes.statusCode, 500, "Should return 500 status");
    assert.match(missingFieldsRes.body, /Failed to send email/, "Should return error message");
    console.log("Missing fields test passed.");
  });
} catch (error) {
  console.error("Missing fields test failed.");
  throw error;
}
