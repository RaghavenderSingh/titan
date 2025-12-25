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
  ArrowLeft, 
  Lock, 
  Globe, 
  RefreshCw,
  Zap,
  Loader2,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ImportPage() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [detectedFrameworks, setDetectedFrameworks] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingRepos, setLoadingRepos] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (session?.accessToken) {
      fetchRepos();
    }
  }, [session]);

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

  const handleImport = (repo: Repository) => {
    router.push(`/dashboard/new?repo=${repo.full_name}`);
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Import Git Repository</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchRepos} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loadingRepos ? 'animate-spin' : ''}`} />
              Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <div>
                  <h2 className="text-4xl font-black mb-3">Select Repository</h2>
                  <p className="text-muted-foreground text-lg">Pick a project to deploy with automatic configuration.</p>
              </div>
              <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                      placeholder="Search repositories..."
                      className="pl-12 h-14 bg-muted/20 border-border/40 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
          </div>

          <div className="grid gap-4">
            {loadingRepos ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-3xl bg-muted/20 animate-pulse border border-border/50" />
              ))
            ) : filteredRepos.length > 0 ? (
              filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="group relative flex items-center justify-between p-7 rounded-[2rem] border border-border bg-card/40 backdrop-blur-sm hover:bg-muted/10 transition-all hover:scale-[1.01] hover:shadow-xl"
                >
                  <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                          {repo.private ? <Lock className="h-6 w-6 text-indigo-400" /> : <Globe className="h-6 w-6 text-blue-400" />}
                      </div>
                      <div>
                          <div className="flex items-center gap-3 mb-1.5">
                              <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{repo.name}</h3>
                              {repo.private && (
                                  <span className="px-2 py-0.5 rounded-lg bg-muted text-[10px] font-black uppercase tracking-tighter text-muted-foreground border border-border">Private</span>
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
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <History className="h-3 w-3" />
                                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                              </span>
                          </div>
                      </div>
                  </div>
                  <Button 
                      onClick={() => handleImport(repo)}
                      className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-105 transition-all"
                  >
                      Import
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-32 text-center rounded-[3rem] border-2 border-dashed border-border/40 bg-muted/5">
                  <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Search className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No repositories found</h3>
                  <p className="text-muted-foreground">Try searching with a different name.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

