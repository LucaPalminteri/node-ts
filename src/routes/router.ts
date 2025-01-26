import { IncomingMessage, ServerResponse } from "http";
import { createLogger } from "../utils/logger.ts";
import * as url from "url";

const logger = createLogger("Router");

type RouteHandler = (req: IncomingMessage, res: ServerResponse, params: Record<string, string>) => Promise<void> | void;

interface Route {
  method: string;
  path: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];
  private static _instance: Router;

  public constructor() {
    if (Router._instance) {
      return Router._instance;
    }
    Router._instance = this;
  }

  public static getInstance(): Router {
    if (!Router._instance) {
      Router._instance = new Router();
    }
    return Router._instance;
  }

  private addRoute(method: string, path: string, handler: RouteHandler) {
    const { regex, paramNames } = this.parsePath(path);
    this.routes.push({ method, path: regex, paramNames, handler });
  }

  private parsePath(path: string) {
    const paramNames: string[] = [];
    const parts = path
      .split("/")
      .map((part) => {
        if (part.startsWith(":")) {
          paramNames.push(part.slice(1));
          return "([^\\/]+)";
        }
        return part;
      })
      .filter(Boolean);

    const regex = new RegExp(`^/${parts.join("/")}/?$`);
    return { regex, paramNames };
  }

  private matchRoute(method: string, urlPath: string) {
    return this.routes.find((route) => {
      if (route.method !== method) return false;
      const match = urlPath.match(route.path);
      return match;
    });
  }

  private extractParams(route: Route, urlPath: string) {
    const match = urlPath.match(route.path);
    if (!match) return {};

    return route.paramNames.reduce((params, name, index) => {
      params[name] = match[index + 1];
      return params;
    }, {} as Record<string, string>);
  }

  async handle(req: IncomingMessage, res: ServerResponse) {
    const parsedUrl = url.parse(req.url || "/", true);
    const path = parsedUrl.pathname || "/";
    const method = req.method || "GET";

    const route = this.matchRoute(method, path);

    if (!route) {
      logger.warn(`Route not found: ${method} ${path}`);
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
      return;
    }

    try {
      const params = this.extractParams(route, path);
      await route.handler(req, res, params);
    } catch (error) {
      logger.error(`Route handler error: ${error}`);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      }
    }
  }

  get(path: string, handler: RouteHandler) {
    this.addRoute("GET", path, handler);
  }

  post(path: string, handler: RouteHandler) {
    this.addRoute("POST", path, handler);
  }

  put(path: string, handler: RouteHandler) {
    this.addRoute("PUT", path, handler);
  }

  delete(path: string, handler: RouteHandler) {
    this.addRoute("DELETE", path, handler);
  }

  patch(path: string, handler: RouteHandler) {
    this.addRoute("PATCH", path, handler);
  }
}
