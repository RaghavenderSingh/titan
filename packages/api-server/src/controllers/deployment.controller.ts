import type { Request, Response, NextFunction } from "express";
import {
  cancelDeployment,
  createDeployment,
  getDeploymentById,
  getDeploymentsByProject,
} from "../services/deployment.service";

export const createDeployments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, commitSha, branch, commitMessage } = req.body;
    if (!projectId || !commitSha || !branch) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const deployment = await createDeployment(
      projectId,
      commitSha,
      branch,
      commitMessage
    );
    res.status(201).json(deployment);
  } catch (error) {
    next(error);
  }
};

export const getDeployment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { deploymentId } = req.params;
    if (!deploymentId) {
      return res.status(400).json({ error: "Deployment ID required" });
    }
    const deployment = await getDeploymentById(deploymentId);
    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" });
    }
    res.json(deployment);
  } catch (error) {
    next(error); // Added next(error)
  }
};

export const getDeploymentByProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID required" });
    }

    const deployments = await getDeploymentsByProject(projectId);
    res.json(deployments);
  } catch (error) {
    next(error);
  }
};

export const cancelDeployments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { deploymentId } = req.params;
    if (!deploymentId) {
      return res.status(400).json({ error: "Deployment ID required" });
    }

    const deployment = await cancelDeployment(deploymentId);
    res.json(deployment);
  } catch (error) {
    next(error);
  }
};
