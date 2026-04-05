import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();

// Docker: standalone mode (supports API routes)
// Static deployment: export mode (uses remote API)
const isDocker = process.env.DOCKER_BUILD === "true";

const nextConfig: NextConfig = {
  output: isDocker ? "standalone" : "export",
  basePath: "/subtitle-translator",
  assetPrefix: "/subtitle-translator/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons"],
  },
};

export default withNextIntl(nextConfig);
