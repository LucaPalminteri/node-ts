import { homeRoutes } from "./homeRoutes.ts";
import { aboutRoutes } from "./aboutRoutes.ts";
import { apiRoutes } from "./apiRoutes.ts";

export const routes = {
  ...homeRoutes,
  ...aboutRoutes,
  ...apiRoutes,
};
