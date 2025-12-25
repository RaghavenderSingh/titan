import { Octokit } from "@octokit/rest";

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  default_branch: string;
  updated_at: string;
  language: string | null;
  private: boolean;
}

export interface FrameworkConfig {
  id: string;
  name: string;
  buildCommand: string;
  installCommand: string;
}

export const FRAMEWORKS: Record<string, FrameworkConfig> = {
  nextjs: {
    id: "nextjs",
    name: "Next.js",
    buildCommand: "npm run build",
    installCommand: "npm install",
  },
  react: {
    id: "react",
    name: "React (Vite)",
    buildCommand: "npm run build",
    installCommand: "npm install",
  },
  vue: {
    id: "vue",
    name: "Vue.js",
    buildCommand: "npm run build",
    installCommand: "npm install",
  },
  svelte: {
    id: "svelte",
    name: "SvelteKit",
    buildCommand: "npm run build",
    installCommand: "npm install",
  },
  astro: {
    id: "astro",
    name: "Astro",
    buildCommand: "npm run build",
    installCommand: "npm install",
  },
  remix: {
    id: "remix",
    name: "Remix",
    buildCommand: "npm run build",
    installCommand: "npm install",
  },
  angular: {
    id: "angular",
    name: "Angular",
    buildCommand: "npm run build",
    installCommand: "npm install",
  },
  static: {
    id: "static",
    name: "Static HTML",
    buildCommand: "",
    installCommand: "",
  },
  turborepo: {
    id: "turborepo",
    name: "Turborepo",
    buildCommand: "npx turbo build",
    installCommand: "npm install",
  },
  nx: {
    id: "nx",
    name: "Nx Monorepo",
    buildCommand: "npx nx build",
    installCommand: "npm install",
  },
  pnpm: {
    id: "pnpm",
    name: "pnpm Monorepo",
    buildCommand: "pnpm build",
    installCommand: "pnpm install",
  },
  lerna: {
    id: "lerna",
    name: "Lerna Monorepo",
    buildCommand: "npx lerna run build",
    installCommand: "npm install",
  },
  monorepo: {
    id: "monorepo",
    name: "Monorepo",
    buildCommand: "npm run build",
    installCommand: "npm install",
  },
  bun: {
    id: "bun",
    name: "Bun App",
    buildCommand: "bun run build",
    installCommand: "bun install",
  },
};

export async function getGitHubRepositories(
  accessToken: string
): Promise<Repository[]> {
  const octokit = new Octokit({ auth: accessToken });

  try {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });

    return data as Repository[];
  } catch (error) {
    console.error("Failed to fetch repositories:", error);
    throw error;
  }
}

export async function getGitHubUser(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken });

  try {
    const { data } = await octokit.users.getAuthenticated();
    return data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
}

export async function getRepoFileContent(
  accessToken: string,
  owner: string,
  repo: string,
  path: string
): Promise<string | any | null> {
  const octokit = new Octokit({ auth: accessToken });

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    if (Array.isArray(data)) {
      return data;
    }

    if ("content" in data) {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function detectFramework(
  accessToken: string,
  owner: string,
  repo: string
): Promise<FrameworkConfig> {
  const [packageJsonContent, turboJsonContent, nxJsonContent, pnpmWorkspaceContent, lernaJsonContent, packagesDir, bunLockB, bunLock] = await Promise.all([
    getRepoFileContent(accessToken, owner, repo, "package.json"),
    getRepoFileContent(accessToken, owner, repo, "turbo.json"),
    getRepoFileContent(accessToken, owner, repo, "nx.json"),
    getRepoFileContent(accessToken, owner, repo, "pnpm-workspace.yaml"),
    getRepoFileContent(accessToken, owner, repo, "lerna.json"),
    getRepoFileContent(accessToken, owner, repo, "packages"),
    getRepoFileContent(accessToken, owner, repo, "bun.lockb"),
    getRepoFileContent(accessToken, owner, repo, "bun.lock"),
  ]);

  if (turboJsonContent) return FRAMEWORKS.turborepo;
  if (nxJsonContent) return FRAMEWORKS.nx;
  if (pnpmWorkspaceContent) return FRAMEWORKS.pnpm;
  if (lernaJsonContent) return FRAMEWORKS.lerna;
  if (Array.isArray(packagesDir)) return FRAMEWORKS.monorepo;

  if (!packageJsonContent) {
    return FRAMEWORKS.static;
  }

  try {
    const pkg = JSON.parse(packageJsonContent);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const scripts = pkg.scripts || {};

    if (pkg.workspaces || scripts.turbo || scripts.lerna || scripts.nx) return FRAMEWORKS.monorepo;
    
    if (deps.next || scripts.dev?.includes('next') || scripts.build?.includes('next')) return FRAMEWORKS.nextjs;
    if (deps['@sveltejs/kit'] || deps.svelte) return FRAMEWORKS.svelte;
    if (deps.astro || scripts.dev?.includes('astro')) return FRAMEWORKS.astro;
    if (deps['@remix-run/react'] || deps['@remix-run/dev']) return FRAMEWORKS.remix;
    if (deps['@angular/core']) return FRAMEWORKS.angular;
    if (deps.vue) return FRAMEWORKS.vue;
    if (deps.vite && (deps.react || deps.reactDOM)) return FRAMEWORKS.react;
    if (deps.react) return FRAMEWORKS.react;
    if (bunLockB || bunLock || scripts.dev?.includes('bun') || pkg.module?.endsWith('.ts')) return FRAMEWORKS.bun;

    return FRAMEWORKS.static;
  } catch (error) {
    return FRAMEWORKS.static;
  }
}






