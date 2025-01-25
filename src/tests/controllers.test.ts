import { IncomingMessage, ServerResponse } from "http";
import * as assert from "assert";
import { homeController } from "../controllers/homeController.ts";
import { aboutController } from "../controllers/aboutController.ts";

function mockResponse(): [IncomingMessage, ServerResponse & { body: string }] {
  const req = {} as IncomingMessage;

  const res = {
    writeHead: (statusCode: number, headers: Record<string, string>) => {
      res.statusCode = statusCode;
    },
    end: (body: string) => {
      res.body = body;
    },
    body: "",
    statusCode: 200,
    headers: {} as Record<string, string>,
  } as unknown as ServerResponse & { body: string };

  return [req, res];
}

try {
  const [req, res] = mockResponse();
  homeController(req, res);

  assert.strictEqual(res.statusCode, 200, "homeController should respond with status 200");
  assert.strictEqual(res.body, "Welcome to the home page!", "homeController should respond with the correct message");
  console.log("homeController() test passed.");
} catch (error) {
  console.error("homeController() test failed.");
  throw error;
}

try {
  const [req, res] = mockResponse();
  aboutController(req, res);

  assert.strictEqual(res.statusCode, 200, "aboutController should respond with status 200");
  assert.strictEqual(res.body, "This is the about page.", "aboutController should respond with the correct message");
  console.log("aboutController() test passed.");
} catch (error) {
  console.error("aboutController() test failed.");
  throw error;
}
