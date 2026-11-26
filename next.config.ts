import type { NextConfig } from "next"

// A trailing slash would produce /api/... with a double slash, which Next
// normalizes into a 308 redirect loop. Strip it from any configured URL.
const apiServer = (
  process.env.API_SERVER_URL || "http://localhost:5000"
).replace(/\/+$/, "")

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
