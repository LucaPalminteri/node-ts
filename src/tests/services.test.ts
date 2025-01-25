import * as assert from "assert";
import { getApiMessage } from "../services/apiService.ts";

try {
  const result = getApiMessage();
  assert.deepStrictEqual(
    result,
    { message: "Hello from the API!" },
    "getApiMessage() should return the correct object"
  );
  console.log("getApiMessage() test passed.");
} catch (error) {
  console.error("getApiMessage() test failed.");
  throw error;
}
