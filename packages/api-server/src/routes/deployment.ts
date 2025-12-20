import { Router } from "express";
import {
  createDeployments,
  getDeployment,
  getDeploymentByProject,
  cancelDeployments,
} from "../controllers/deployment.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.post("/", createDeployments);
router.get("/:deploymentId", getDeployment);
router.get("/project/:projectId", getDeploymentByProject);
router.post("/:deploymentId/cancel", cancelDeployments);

export { router as deploymentRouter };
