"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { projectsAPI, deploymentsAPI } from "@/lib/api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  History, 
  Settings, 
  Zap, 
  Globe, 
  GitBranch, 
  MessageSquare,
  ChevronRight,
  MoreVertical,
  MoreHorizontal,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Terminal,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

interface Deployment {
  id: string;
  commitSha: string;
  commitMessage: string;
  branch: string;
  status: string;
  deploymentUrl: string;
  createdAt: string;
  buildLogs?: string;
}

interface Project {
  id: string;
  name: string;
  repoUrl: string;
  framework: string;
  buildConfig: {
    buildCommand: string;
    installCommand: string;
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "deployments" | "settings">("overview");
  const [deploying, setDeploying] = useState(false);

  const [deployForm, setDeployForm] = useState({
    branch: "main",
    commitMessage: "",
  });

  useEffect(() => {
    fetchProject();
    fetchDeployments();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const { data } = await projectsAPI.get(params.id as string);
      setProject(data);
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeployments = async () => {
    try {
      const { data } = await deploymentsAPI.listByProject(params.id as string);
      setDeployments(data);
    } catch (error) {
      console.error("Failed to fetch deployments:", error);
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);

    try {
      await deploymentsAPI.create({
        projectId: params.id,
        branch: deployForm.branch,
        commitSha: `manual-${Date.now()}`,
        commitMessage: deployForm.commitMessage || "Manual deployment",
      });

      setDeployForm({ branch: "main", commitMessage: "" });
      await fetchDeployments();
    } catch (error) {
      console.error("Failed to deploy:", error);
    } finally {
      setDeploying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "building": return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />;
      case "queued": return <Clock className="h-4 w-4 text-blue-500" />;
      case "error": return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "building": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "queued": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "error": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Project not found</h1>
          <Link href="/dashboard">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const latestDeployment = deployments[0];

  return (
    <>
      <main className="container mx-auto px-4 md:px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard/projects"
            className="group p-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-white to-zinc-200 rounded-xl flex items-center justify-center shadow-lg shadow-white/5 ring-1 ring-white/10">
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-black translate-y-[0.5px]" />
            </div>
            <div className="space-y-0.5">
                <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                    <span>{project.repoUrl.replace('https://github.com/', '')}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-zinc-600" />
                    <span className="uppercase tracking-wider">{project.framework}</span>
                </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-9 px-4 rounded-lg border-white/10 bg-white/5 text-xs font-medium hover:bg-white/10 text-white"
          >
            Visit
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="border-b border-white/10 mb-8">
        <nav className="flex items-center gap-1 p-1 bg-white/5 rounded-full w-fit">
          {["overview", "deployments", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize
                ${activeTab === tab 
                    ? "text-white shadow-lg shadow-black/20" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              {activeTab === tab && (
                <div className="absolute inset-0 bg-white/10 rounded-full border border-white/5" />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </nav>
      </div>
        {activeTab === "overview" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="relative rounded-[2rem] border border-white/5 bg-black/40 overflow-hidden group hover:border-white/10 transition-colors duration-500">
                           <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                           <div className="p-8 flex flex-col md:flex-row justify-between gap-10 relative z-10">
                                <div className="space-y-8 flex-1">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Production Environment
                                        </div>
                                        <h2 className="text-3xl font-bold tracking-tight text-white">Production Deployment</h2>
                                        <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
                                            The latest deployment for your production environment is live and healthy.
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                                        <div className="group/item">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 group-hover/item:text-zinc-300 transition-colors">Deployment URL</p>
                                            <a href={latestDeployment?.deploymentUrl} target="_blank" className="text-sm font-medium flex items-center gap-2 text-zinc-200 hover:text-white transition-colors group-hover/item:text-emerald-400 w-fit">
                                                <div className="truncate max-w-[180px]">
                                                    {latestDeployment?.deploymentUrl?.replace('https://', '') || "Not deployed yet"}
                                                </div>
                                                <ExternalLink className="h-3 w-3 shrink-0 opacity-50 group-hover/item:opacity-100 transition-opacity" />
                                            </a>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Status</p>
                                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(latestDeployment?.status || 'idle')} bg-transparent border`}>
                                                {getStatusIcon(latestDeployment?.status || 'idle')}
                                                {latestDeployment?.status || "Inactive"}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Source</p>
                                            <div className="flex items-center gap-2 text-zinc-300">
                                                <div className="p-1 rounded bg-white/5">
                                                    <Github className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-sm font-medium">{project.repoUrl.split('/').pop()}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Branch</p>
                                            <div className="flex items-center gap-2 text-zinc-300">
                                                <div className="p-1 rounded bg-white/5">
                                                    <GitBranch className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-sm font-medium">{latestDeployment?.branch || "main"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-[360px] aspect-square shrink-0 border border-white/5 bg-black/50 relative overflow-hidden group/preview shadow-2xl rounded-xl">
                                    <img 
                                        src={`https://api.microlink.io/?url=${encodeURIComponent(latestDeployment?.deploymentUrl || 'https://deploy.app')}&screenshot=true&embed=screenshot.url&colorScheme=dark&viewport.width=1024&viewport.height=1024`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105 opacity-80 group-hover/preview:opacity-100"
                                        alt="Deployment Preview"
                                    />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-500">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-wider transform translate-y-2 group-hover/preview:translate-y-0 transition-transform duration-300">
                                            <ExternalLink className="h-3 w-3" />
                                            Visit Deployment
                                        </div>
                                    </div>
                                </div>
                           </div>
                        </section>

                        <section className="rounded-[2rem] border border-white/5 bg-black/20 p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                    <Terminal className="h-4 w-4" />
                                    Deployment Console
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-mono text-emerald-500 uppercase">Live</span>
                                </div>
                            </div>
                            <div className="bg-black/80 rounded-xl p-6 font-mono text-xs border border-white/5 space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar shadow-inner shadow-black/50">
                                <div className="flex gap-3 text-zinc-500 border-b border-white/5 pb-2 mb-2">
                                    <span>$</span>
                                    <span>deply-cli build --production</span>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-emerald-400 flex items-center gap-2">
                                        <span className="opacity-50">✓</span> Detected framework: <span className="text-white">{project.framework}</span>
                                    </p>
                                    <p className="text-blue-400 flex items-center gap-2">
                                        <span className="opacity-50">→</span> Running build: <span className="text-white">{project.buildConfig.buildCommand}</span>
                                    </p>
                                    <p className="text-zinc-400 flex items-center gap-2 pt-1">
                                        <span className="opacity-50">ℹ</span> Build completed successfully in <span className="text-white">45.2s</span>
                                    </p>
                                    <p className="text-emerald-400 flex items-center gap-2">
                                        <span className="opacity-50">✓</span> Uploading to edge cache...
                                    </p>
                                    <p className="text-emerald-400 flex items-center gap-2 font-bold pt-1">
                                        <span className="opacity-50">✓</span> Deployment ready!
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="rounded-[2rem] border border-white/5 bg-black/40 p-8 hover:border-white/10 transition-colors duration-500">
                            <h3 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-wider">Recent Activity</h3>
                            <div className="space-y-8 relative">
                                <div className="absolute top-2 left-4 bottom-2 w-px bg-white/10" />
                                {deployments.slice(0, 3).map((dep, i) => (
                                    <div key={dep.id} className="flex gap-4 relative">
                                        <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 bg-black ${
                                            dep.status === 'ready' ? 'border-emerald-500/20 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
                                            dep.status === 'building' ? 'border-amber-500/20 text-amber-500' : 
                                            dep.status === 'error' ? 'border-red-500/20 text-red-500' :
                                            'border-white/10 text-zinc-500'
                                        }`}>
                                            {getStatusIcon(dep.status)}
                                        </div>
                                        <div className="pt-1">
                                            <p className="text-sm font-bold leading-none mb-1.5 text-zinc-200">{dep.commitMessage || "New deployment"}</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(dep.createdAt))} ago
                                                </p>
                                                <span className="w-0.5 h-0.5 rounded-full bg-zinc-700" />
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                                                    {dep.commitSha?.substring(0, 7)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/5">
                                <Link href="/dashboard/deployments" className="block w-full">
                                    <Button variant="ghost" className="w-full rounded-xl h-12 font-bold text-xs uppercase tracking-widest hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent hover:border-white/5 transition-all">
                                        View All Activity
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-white/5 bg-black/40 p-8">
                            <h3 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-wider">Quick Actions</h3>
                            <div className="grid gap-4">
                                <Button className="h-14 rounded-2xl font-bold gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-all text-sm uppercase tracking-wider bg-white text-black hover:bg-zinc-100">
                                    <Play className="h-4 w-4 fill-current" />
                                    New Deployment
                                </Button>
                                <Button variant="outline" className="h-14 rounded-2xl font-bold border-white/10 bg-white/5 hover:bg-white/10 text-sm uppercase tracking-wider text-zinc-300 hover:text-white hover:border-white/20 transition-all">
                                    <Settings className="h-4 w-4" />
                                    Project Settings
                                </Button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        )}

        {activeTab === "deployments" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black tracking-tighter">All Deployments</h2>
                    <Button variant="outline" className="rounded-xl font-bold border-border bg-muted/10 h-10 px-6">
                        Export Logs
                    </Button>
                </div>
                
                <div className="rounded-[2rem] border border-border bg-card/20 overflow-hidden backdrop-blur-sm">
                    <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-border bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <div className="col-span-1">Status</div>
                        <div className="col-span-4">Commit</div>
                        <div className="col-span-2">Branch</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Execution</div>
                        <div className="col-span-1"></div>
                    </div>
                    <div className="divide-y divide-border">
                        {deployments.length === 0 ? (
                            <div className="p-20 text-center">
                                <p className="text-muted-foreground font-bold italic">No deployments found.</p>
                            </div>
                        ) : (
                            deployments.map((dep) => (
                                <div key={dep.id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-muted/10 transition-colors group">
                                    <div className="col-span-1">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${getStatusColor(dep.status)}`}>
                                            {getStatusIcon(dep.status)}
                                        </div>
                                    </div>
                                    <div className="col-span-4 min-w-0">
                                        <p className="font-bold truncate text-sm mb-0.5 group-hover:text-primary transition-colors cursor-pointer">{dep.commitMessage || "New deployment"}</p>
                                        <p className="font-mono text-[10px] text-muted-foreground opacity-70 uppercase tracking-widest">{dep.commitSha.slice(0, 7)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="px-2 py-1 rounded-lg bg-muted text-[10px] font-black uppercase tracking-tighter border border-border/50 text-muted-foreground">
                                            {dep.branch}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs font-bold whitespace-nowrap">{formatDistanceToNow(new Date(dep.createdAt))} ago</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs font-bold text-muted-foreground">Production</p>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-muted">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl border-border bg-background/80 backdrop-blur-xl p-1.5 min-w-[160px]">
                                                <DropdownMenuItem className="rounded-lg font-bold text-xs uppercase tracking-widest px-3 py-2.5">
                                                    View Logs
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-lg font-bold text-xs uppercase tracking-widest px-3 py-2.5">
                                                    Redeploy
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

        {activeTab === "settings" && (
             <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter mb-2">Build & Output Settings</h2>
                        <p className="text-muted-foreground font-bold">Configure how your project is built and served.</p>
                    </div>
                    
                    <div className="grid gap-6">
                        <div className="rounded-[2rem] border border-border bg-card/40 p-10 space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Build Command</label>
                                    <div className="relative">
                                        <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            defaultValue={project.buildConfig.buildCommand}
                                            className="h-14 pl-12 bg-muted/20 border-border/40 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary font-mono text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Install Command</label>
                                    <div className="relative">
                                        <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            defaultValue={project.buildConfig.installCommand}
                                            className="h-14 pl-12 bg-muted/20 border-border/40 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-border flex justify-end">
                                <Button className="rounded-xl px-10 h-12 font-black shadow-lg shadow-primary/10">
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter mb-2 text-destructive">Danger Zone</h2>
                        <p className="text-muted-foreground font-bold">Irreversible actions that affect your production infrastructure.</p>
                    </div>
                    <div className="rounded-[2rem] border border-destructive/20 bg-destructive/5 p-10 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div>
                            <h4 className="text-xl font-black mb-1">Delete this Project</h4>
                            <p className="text-muted-foreground text-sm font-bold">The project will be permanently removed, including all active deployments and edge domains.</p>
                        </div>
                        <Button variant="destructive" className="rounded-xl px-10 h-12 font-black shadow-xl shadow-destructive/10 whitespace-nowrap">
                            Delete Project
                        </Button>
                    </div>
                </section>
             </div>
        )}
      </main>

    </>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

