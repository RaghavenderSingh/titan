"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { projectsAPI } from "@/lib/api";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { BorderBeam } from "@/components/ui/border-beam";
import { 
  Plus, 
  Github, 
  ExternalLink, 
  MoreVertical, 
  Search, 
  Grid, 
  List as ListIcon, 
  ChevronRight,
  Filter,
  ArrowUpDown,
  Laptop,
  Clock,
  Zap,
  LayoutGrid,
  Menu,
  MoreHorizontal,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Project {
  id: string;
  name: string;
  repoUrl: string;
  framework: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const filtered = projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.repoUrl.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  const fetchProjects = async () => {
    try {
      const { data } = await projectsAPI.list();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 md:px-6 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Projects</h1>
          <p className="text-white/40 text-sm">
            Manage and scale your applications with high-performance edge
            networking.
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button className="rounded-lg gap-2 bg-white text-black hover:bg-white/90 font-bold">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-12 h-14 bg-muted/20 border-border/40 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-border/40 hover:bg-muted/30">
                <Filter className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-border/40 hover:bg-muted/30">
                <ArrowUpDown className="h-5 w-5" />
            </Button>
            <div className="h-14 w-px bg-border/40 mx-2 hidden md:block" />
            <div className="flex items-center bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                <Button 
                    variant={viewMode === "grid" ? "secondary" : "ghost"} 
                    size="icon" 
                    className="h-11 w-11 rounded-xl shadow-sm transition-all"
                    onClick={() => setViewMode("grid")}
                >
                    <LayoutGrid className="h-5 w-5" />
                </Button>
                <Button 
                    variant={viewMode === "list" ? "secondary" : "ghost"} 
                    size="icon" 
                    className="h-11 w-11 rounded-xl shadow-sm transition-all"
                    onClick={() => setViewMode("list")}
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="py-40 text-center rounded-[3rem] border-2 border-dashed border-border/40 bg-muted/5 flex flex-col items-center">
             <div className="w-24 h-24 bg-background rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-border">
                <Search className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <h3 className="text-3xl font-bold mb-3 tracking-tight">No projects found</h3>
            <p className="text-muted-foreground text-lg mb-10">Start by creating your first deployment.</p>
            <Link href="/dashboard/new">
                <Button variant="outline" className="rounded-2xl px-10 h-14 font-black border-border hover:bg-background shadow-xl">
                    Create a Project
                </Button>
            </Link>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
            {filteredProjects.map((project) => (
              viewMode === "grid" ? (
                <div
                    key={project.id}
                    className="group relative rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md overflow-hidden transition-all hover:shadow-[0_40px_80px_rgba(0,0,0,0.3)] hover:-translate-y-3"
                >
                    <BorderBeam className="opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="p-10">
                        <div className="flex items-start justify-between mb-10">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-2xl group-hover:scale-110 transition-transform">
                                {project.name[0].toUpperCase()}
                            </div>
                            <div className="flex gap-3">
                                <Link href={`/dashboard/projects/${project.id}`} className="p-3 text-muted-foreground hover:text-foreground transition-all rounded-2xl bg-muted/30 border border-transparent hover:border-border hover:scale-110">
                                    <ExternalLink className="w-5 h-5" />
                                </Link>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-3 text-muted-foreground hover:text-foreground transition-all rounded-2xl bg-muted/30 border border-transparent hover:border-border hover:scale-110">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-2xl border-border bg-background/80 backdrop-blur-xl p-2 min-w-[180px] shadow-2xl">
                                        <DropdownMenuItem className="rounded-xl px-4 py-3 font-bold group">
                                            Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl px-4 py-3 font-bold text-destructive">
                                            Delete Project
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <h3 className="text-3xl font-black mb-5 group-hover:text-primary transition-colors tracking-tighter">
                            {project.name}
                        </h3>
                        
                        <div className="flex flex-col gap-4 mb-10">
                            <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20 w-fit">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Running</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-muted-foreground text-sm font-bold flex items-center gap-3 group/url">
                                    <Globe className="w-4 h-4" />
                                    <span className="group-hover/url:text-foreground transition-colors">{project.name.toLowerCase()}.deply.app</span>
                                </p>
                                <p className="text-muted-foreground text-sm font-bold flex items-center gap-3">
                                    <Github className="w-4 h-4" />
                                    <span className="truncate max-w-[200px]">{project.repoUrl.replace('https://github.com/', '')}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-10 py-8 bg-muted/30 border-t border-border mt-auto flex justify-between items-center group-hover:bg-muted/50 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1.5 rounded-xl bg-background border border-border text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 shadow-sm">
                                {project.framework || 'WEB'}
                            </div>
                        </div>
                        <Link href={`/dashboard/projects/${project.id}`} className="text-xs font-black text-primary group-hover:translate-x-3 transition-transform flex items-center gap-2 italic">
                            OVERVIEW
                            <ChevronRight className="w-4 h-4 stroke-[4]" />
                        </Link>
                    </div>
                </div>
              ) : (
                <div 
                    key={project.id}
                    className="group flex flex-col md:flex-row items-center justify-between p-8 rounded-[2rem] border border-border bg-card/40 backdrop-blur-md hover:bg-muted/10 transition-all hover:shadow-xl"
                >
                    <div className="flex items-center gap-8 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center text-primary text-2xl font-black border border-primary/20">
                            {project.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-black tracking-tight mb-1">{project.name}</h3>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground font-bold">
                                <span className="flex items-center gap-2 ring-emerald-500/20 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-tighter">
                                    <Zap className="h-3 w-3 fill-emerald-500" />
                                    Running
                                </span>
                                <span className="flex items-center gap-2 truncate opacity-70 group-hover:opacity-100 transition-opacity">
                                    <Github className="h-4 w-4" />
                                    {project.repoUrl.split('/').pop()}
                                </span>
                                <span className="flex items-center gap-2 opacity-70">
                                    <Clock className="h-4 w-4" />
                                    Updated 2h ago
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 mt-6 md:mt-0">
                        <div className="px-3 py-1.5 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {project.framework || 'WEB'}
                        </div>
                        <Link href={`/dashboard/projects/${project.id}`}>
                            <Button className="rounded-xl px-10 h-12 font-black shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all">
                                View
                            </Button>
                        </Link>
                    </div>
                </div>
              )
            ))}
          </div>
        )}
      </main>
  );
}
