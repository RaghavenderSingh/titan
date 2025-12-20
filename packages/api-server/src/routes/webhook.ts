import { Router } from "express";
import { handleGitHubWebhook } from "../controllers/webhook.controller";

const router = Router();

router.post("/github", handleGitHubWebhook);

export { router as webhookRouter };
