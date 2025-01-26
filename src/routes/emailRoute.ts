import { emailController } from "../controllers/emailController.ts";

export const emailRoutes = {
  "POST /api/send-email": emailController,
};
