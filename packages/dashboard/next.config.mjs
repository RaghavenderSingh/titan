/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      // Auth routes that should BE proxied to the backend
      {
        source: "/api/auth/login",
        destination: "http://api-server:3001/api/auth/login",
      },
      {
        source: "/api/auth/register",
        destination: "http://api-server:3001/api/auth/register",
      },
      {
        source: "/api/auth/oauth/callback",
        destination: "http://api-server:3001/api/auth/oauth/callback",
      },
      // General API routes to proxy
      {
        source: "/api/projects/:path*",
        destination: "http://api-server:3001/api/projects/:path*",
      },
      {
        source: "/api/deployments/:path*",
        destination: "http://api-server:3001/api/deployments/:path*",
      },
      {
        source: "/api/csrf-token",
        destination: "http://api-server:3001/api/csrf-token",
      },
    ];
  },
};

export default nextConfig;
