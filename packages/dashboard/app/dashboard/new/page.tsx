"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { projectsAPI } from "@/lib/api";
import { getGitHubRepositories, Repository, detectFramework, FRAMEWORKS } from "@/lib/github";
import Link from "next/link";
import { 
  Plus, 
  Github, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Lock, 
  Globe, 
  Settings2,
  Terminal,
  CloudUpload,
  RefreshCw,
  Layout,
  Zap,
  Loader2,
  Star,
  GitBranch,
  History,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BorderBeam } from "@/components/ui/border-beam";

export default function NewProjectPage() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [detectedFrameworks, setDetectedFrameworks] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: "",
    repoUrl: "",
    framework: "nextjs",
    buildCommand: "npm run build",
    installCommand: "npm install",
  });
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRepos();
  }, []);

  useEffect(() => {
    const filtered = repos.filter(repo => 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRepos(filtered);
  }, [searchQuery, repos]);

  const fetchRepos = async () => {
    try {
      setLoadingRepos(true);
      const data = await getGitHubRepositories(session!.accessToken as string);
      setRepos(data);
      setFilteredRepos(data);
      detectFrameworksForList(data);
    } catch (error) {
      console.error("Failed to fetch repos:", error);
    } finally {
      setLoadingRepos(false);
    }
  };

  const detectFrameworksForList = async (repositoryList: Repository[]) => {
    repositoryList.slice(0, 5).forEach(async (repo) => {
      try {
        const detected = await detectFramework(
          session!.accessToken as string,
          repo.full_name.split("/")[0],
          repo.name
        );
        setDetectedFrameworks(prev => ({ ...prev, [repo.full_name]: detected.name }));
      } catch (err) {}
    });
  };

  const handleSelectRepo = async (repo: Repository) => {
    setSelectedRepo(repo);
    setStep(2);
    setDetecting(true);

    try {
      const detected = await detectFramework(
        session!.accessToken as string,
        repo.full_name.split("/")[0],
        repo.name
      );

      setFormData({
        name: repo.name,
        repoUrl: repo.clone_url,
        framework: detected.id,
        buildCommand: detected.buildCommand,
        installCommand: detected.installCommand,
      });
    } catch (error) {
      console.error("Framework detection failed:", error);
      setFormData({
        ...formData,
        name: repo.name,
        repoUrl: repo.clone_url,
      });
    } finally {
      setDetecting(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await projectsAPI.create(formData);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setCreating(false);
    }
  };

  const getLanguageColor = (lang: string | null) => {
    if (!lang) return "bg-muted text-muted-foreground";
    const colors: Record<string, string> = {
      TypeScript: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      JavaScript: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      HTML: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      CSS: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      Vue: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    };
    return colors[lang] || "bg-muted text-muted-foreground border-border/50";
  };

  if (step === 1) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-1.5 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-white/70" />
          </Link>
          <h1 className="text-xl font-bold text-white">Import Project</h1>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRepos}
              className="gap-2 text-white/50 hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${loadingRepos ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-black mb-3 text-white">Connect GitHub</h2>
                    <p className="text-white/40 text-lg font-medium">Select a repository to deploy to the edge.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                    <Input
                        placeholder="Search repositories..."
                        className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-1 focus-visible:ring-white/20 text-white placeholder:text-white/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4">
              {loadingRepos ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
                ))
              ) : filteredRepos.length > 0 ? (
                filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="group relative flex items-center justify-between p-7 rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-all hover:scale-[1.01] hover:shadow-xl"
                  >
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                            {repo.private ? <Lock className="h-6 w-6 text-indigo-400" /> : <Globe className="h-6 w-6 text-blue-400" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1.5">
                                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{repo.name}</h3>
                                {repo.private && (
                                    <span className="px-2 py-0.5 rounded-lg bg-white/10 text-[10px] font-black uppercase tracking-tighter text-white/40 border border-white/5">Private</span>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                {detectedFrameworks[repo.full_name] ? (
                                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                        <Zap className="h-3 w-3 fill-emerald-500" />
                                        {detectedFrameworks[repo.full_name]}
                                    </span>
                                ) : (
                                    <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${getLanguageColor(repo.language)}`}>
                                        {repo.language || "Unknown"}
                                    </span>
                                )}
                                <span className="text-xs text-white/40 font-medium flex items-center gap-1.5">
                                    <History className="h-3 w-3" />
                                    Updated {new Date(repo.updated_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                    </div>
                    <Button 
                        onClick={() => handleSelectRepo(repo)}
                        className="rounded-xl px-8 h-12 bg-white text-black font-bold shadow-lg shadow-white/5 hover:bg-white/90 hover:scale-105 transition-all"
                    >
                        Import
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-32 text-center rounded-[3rem] border-2 border-dashed border-white/10 bg-white/[0.02]">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Search className="h-10 w-10 text-white/20" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No repositories found</h3>
                    <p className="text-white/40 font-medium">Try searching with a different name.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => {
            setSelectedRepo(null);
            setStep(1);
          }}
          className="p-1.5 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-white/70" />
        </button>
        <h1 className="text-xl font-bold text-white">Configure Project</h1>
        <div className="ml-auto px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
            Step 2 of 2
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="max-w-6xl mx-auto mb-16">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-500/30">
                    {selectedRepo?.name[0].toUpperCase()}
                </div>
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">{selectedRepo?.name}</h2>
                    <p className="text-white/40 font-mono text-sm">{selectedRepo?.full_name}</p>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section className="relative overflow-hidden p-10 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-sm transition-all hover:border-white/20">
                <BorderBeam className="opacity-40" />
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Settings2 className="h-5 w-5 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Build Settings</h2>
                    </div>
                    {detecting ? (
                      <div className="flex items-center gap-2.5 text-xs font-bold text-white/40 animate-pulse px-4 py-2 bg-white/5 rounded-full">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm">
                        <Zap className="h-3.5 w-3.5 fill-emerald-500" />
                        Optimized
                      </div>
                    )}
                </div>
                
                <div className="grid gap-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-sm font-black uppercase tracking-widest text-white/40 ml-1">Project Name</label>
                            <Input 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold text-white focus:bg-black transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-black uppercase tracking-widest text-white/40 ml-1">Framework</label>
                            <div className="relative">
                                <Layout className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                                <select 
                                    value={formData.framework}
                                    onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                                    className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-lg font-bold text-white appearance-none focus:bg-black focus:outline-none transition-all"
                                >
                                    {Object.values(FRAMEWORKS).map((f) => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 p-8 rounded-3xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                            <Terminal className="h-5 w-5 text-white/40" />
                            <h3 className="font-bold text-lg text-white">Execution Environment</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Install Command</label>
                                <Input 
                                    placeholder="npm install"
                                    value={formData.installCommand}
                                    onChange={(e) => setFormData({ ...formData, installCommand: e.target.value })}
                                    className="h-12 bg-black/50 border-white/10 rounded-xl font-mono text-sm text-white"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Build Command</label>
                                <Input 
                                    placeholder="npm run build"
                                    value={formData.buildCommand}
                                    onChange={(e) => setFormData({ ...formData, buildCommand: e.target.value })}
                                    className="h-12 bg-black/50 border-white/10 rounded-xl font-mono text-sm text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
          </div>

          <div className="space-y-10">
            <section className="p-8 rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    Deployment Stack
                </h3>
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <GitBranch className="h-5 w-5 text-white/40" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Continuous Deployment</p>
                            <p className="text-xs text-white/40 mt-1">Automatic builds on every push to <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white font-bold">{selectedRepo?.default_branch}</span></p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <Cpu className="h-5 w-5 text-white/40" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Edge Network</p>
                            <p className="text-xs text-white/40 mt-1">Deployed globally to 100+ points of presence.</p>
                        </div>
                    </div>
                </div>
                <div className="pt-8 mt-8 border-t border-white/10">
                    <Button 
                        type="submit" 
                        disabled={creating || detecting}
                        className="w-full h-16 rounded-[1.25rem] bg-white text-black text-lg font-black tracking-tight gap-3 shadow-2xl shadow-white/5 hover:bg-white/90 hover:scale-[1.02] transition-all"
                    >
                        {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <CloudUpload className="h-6 w-6" />}
                        {creating ? "Deploying..." : "Deploy Project"}
                    </Button>
                    <p className="text-center text-[10px] text-white/30 font-bold uppercase tracking-widest mt-6">
                        Estimated build time: &lt; 2m
                    </p>
                </div>
            </section>

            <div className="p-8 rounded-[2rem] border border-white/10 bg-white/[0.01]">
                <div className="flex items-center gap-3 mb-4">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <h4 className="font-bold text-white">Pro Tip</h4>
                </div>
                <p className="text-sm text-white/40 font-medium leading-relaxed">
                    You can override environment variables in the project settings after the initial deployment.
                </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

