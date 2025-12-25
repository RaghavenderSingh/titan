"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { deploymentsAPI } from "@/lib/api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useDeploymentUpdates, useDeploymentLogs } from "@/lib/useSocket";
interface Deployment {
  id: string;
  projectId: string;
  commitSha: string;
  commitMessage: string;
  branch: string;
  status: string;
  buildLogs: string | null;
  deploymentUrl: string;
  createdAt: string;
  updatedAt: string;
  project: {
    name: string;
  };
}

export default function DeploymentLogsPage() {
  const params = useParams();
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  useEffect(() => {
    fetchDeployment();
  }, [params.id]);

  useEffect(() => {
    if (!autoRefresh) return;
    if (deployment?.status === "ready" || deployment?.status === "error") {
      setAutoRefresh(false);
      return;
    }

    const interval = setInterval(() => {
      fetchDeployment();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, deployment?.status]);
  useDeploymentUpdates(params.id as string, (data) => {
    if (data.deploymentId === params.id) {
      setDeployment((prev) => (prev ? { ...prev, status: data.status } : prev));
    }
  });

  useDeploymentLogs(params.id as string, (log) => {
    setLiveLogs((prev) => [...prev, log]);
  });
  const fetchDeployment = async () => {
    try {
      const { data } = await deploymentsAPI.get(params.id as string);
      setDeployment(data);
    } catch (error) {
      console.error("Failed to fetch deployment:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "building":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse";
      case "queued":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return "✓";
      case "building":
        return "⟳";
      case "queued":
        return "⋯";
      case "error":
        return "✗";
      default:
        return "?";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Deployment not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/dashboard/projects/${deployment.projectId}`}
            className="text-blue-600 hover:underline"
          >
            ← Back to {deployment.project.name}
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Deployment {deployment.commitSha.slice(0, 7)}
              </h1>
              <p className="text-gray-600">
                {deployment.commitMessage || "No message"}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg border-2 ${getStatusColor(
                deployment.status
              )}`}
            >
              <span className="text-2xl mr-2">
                {getStatusIcon(deployment.status)}
              </span>
              <span className="font-semibold uppercase">
                {deployment.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block">Branch</span>
              <span className="font-mono">{deployment.branch}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Commit</span>
              <span className="font-mono">
                {deployment.commitSha.slice(0, 7)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Created</span>
              <span>
                {formatDistanceToNow(new Date(deployment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Updated</span>
              <span>
                {formatDistanceToNow(new Date(deployment.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          {deployment.status === "ready" && (
            <div className="mt-4 pt-4 border-t">
              <a
                href={deployment.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Visit Deployment →
              </a>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Build Logs</h2>
            {(deployment.status === "building" ||
              deployment.status === "queued") && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                Auto-refreshing...
              </div>
            )}
          </div>
          <div className="p-6">
            {deployment.buildLogs || liveLogs.length > 0 ? (
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                {liveLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
                {deployment.buildLogs}
              </pre>
            ) : deployment.status === "queued" ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">⏳</div>
                <p>Deployment queued. Waiting to start...</p>
              </div>
            ) : deployment.status === "building" ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2 animate-spin">⟳</div>
                <p>Building... Logs will appear here</p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No build logs available</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
