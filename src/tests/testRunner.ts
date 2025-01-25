import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readdirSync } from "fs";

const { clear, log } = console;

clear();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testsDir = join(__dirname);
let totalTests = 0;
let passedTests = 0;

log("Running tests...\n");

const files = readdirSync(testsDir);

await Promise.all(
  files.map(async (file) => {
    if (file.endsWith(".test.ts")) {
      console.log(`Executing ${file}...`);
      try {
        await import(join(testsDir, file));
        passedTests++;
        log(`✅ ${file} passed`);
      } catch (error) {
        console.error(`❌ ${file} failed: ${error.message}`);
      }
      totalTests++;
    }
  })
);

log(`\nTest Results: ${passedTests}/${totalTests} passed.`);
