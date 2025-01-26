import { readFile } from "fs/promises";
import { createLogger } from "./logger.ts";

const logger = createLogger("TemplateEngine");

const partialsCache = new Map<string, string>();

async function loadTemplateContent(path: string): Promise<string> {
  try {
    return await readFile(`./src/templates/${path}.html`, "utf-8");
  } catch (error) {
    logger.error(`Template not found: ${path}`);
    throw new Error(`Template not found: ${path}`);
  }
}

export async function renderTemplate(
  templateName: string,
  variables: Record<string, string>,
  partials: string[] = ["header", "footer"]
): Promise<string> {
  try {
    // Load main template
    let content = await loadTemplateContent(`emails/${templateName}`);

    // Process partials first
    for (const partial of partials) {
      const partialContent = await loadTemplateContent(`common/${partial}`);
      const partialRegex = new RegExp(`{{>\\s*${partial}\\s*}}`, "g");
      content = content.replace(partialRegex, partialContent);
    }

    // Process variables
    return Object.entries(variables).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), value),
      content
    );
  } catch (error) {
    logger.error(`Template rendering failed: ${error}`);
    throw error;
  }
}
