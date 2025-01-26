import { emailController } from "../controllers/emailController.ts";
import { Router } from "./router.ts";

const router = new Router();

router.post("/api/send-email", emailController);

export { router };
