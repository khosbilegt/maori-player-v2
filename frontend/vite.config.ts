import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  const isGitHubPages =
    process.env.GITHUB_REPOSITORY || process.env.GITHUB_ACTIONS;

  // Extract repository name from GITHUB_REPOSITORY or use default
  const repoName =
    process.env.GITHUB_REPOSITORY?.split("/")[1] || "maori-player";

  return {
    plugins: [react()],
    base: isProduction && isGitHubPages ? `/${repoName}/` : "/",
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },
    server: {
      port: 5173,
      host: true,
    },
  };
});
