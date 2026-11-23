import type { NextConfig } from "next"

const apiServer = process.env.API_SERVER_URL || "http://localhost:5000"

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // Route every /api request to Express before Next's own route handlers,
      // so the browser sees same-origin URLs and the auth cookie keeps working.
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${apiServer}/api/:path*`,
        },
      ],
    }
  },
}

export default nextConfig
