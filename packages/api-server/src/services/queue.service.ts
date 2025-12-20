import { Queue } from "bullmq";
import Redis from "ioredis";
import type { BuildJob } from "../types";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const buildQueue = new Queue("build-queue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 1000,
      age: 7 * 24 * 3600,
    },
  },
});

export async function addBuildJob(job: BuildJob) {
  return buildQueue.add("build", job, {
    jobId: job.deploymentId,
    priority: 1,
  });
}

export async function removeJob(deploymentId: string) {
  const job = await buildQueue.getJob(deploymentId);
  if (job) {
    await job.remove();
  }
}

export async function getJobStatus(deploymentId: string) {
  const job = await buildQueue.getJob(deploymentId);
  if (!job) return null;

  return {
    id: job.id,
    state: await job.getState(),
    failedReason: job.failedReason,
  };
}
