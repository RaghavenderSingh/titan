import { prisma } from "../lib/prisma";
import type { createProjectDto } from "../types";

export async function createProject(userId: string, data: createProjectDto) {
  const project = await prisma.project.create({
    data: {
      name: data.name,
      repoUrl: data.repoUrl,
      framework: data.framework,
      userId,
      buildConfig: {
        create: {
          buildCommand: data.buildCommand || "npm run build",
          installCommand: data.installCommand || "npm install",
          envVars: data.envVars || {},
        },
      },
    },
    include: {
      buildConfig: true,
    },
  });
  return project;
}

export async function getProjectsByUser(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    include: {
      deployments: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      buildConfig: true,
    },
  });
}

export async function getProjectById(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      buildConfig: true,
      deployments: {
        orderBy: { createdAt: "desc" },
      },
      domains: true,
    },
  });
}

export async function deleteProject(projectId: string, userId: string) {
  return prisma.project.delete({
    where: { id: projectId, userId },
  });
}

export async function updateBuildConfig(
  projectId: string,
  userId: string,
  config: Partial<createProjectDto>
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found");

  return prisma.buildConfig.update({
    where: { projectId },
    data: {
      buildCommand: config.buildCommand,
      installCommand: config.installCommand,
      envVars: config.envVars,
    },
  });
}
