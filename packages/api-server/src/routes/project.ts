import { Router } from "express";
import {
  createProject,
  getProjects,
  getProject,
  deleteProject,
  updateBuildConfig,
} from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:projectId", getProject);
router.delete("/:projectId", deleteProject);
router.patch("/:projectId/config", updateBuildConfig);

export { router as projectRouter };
