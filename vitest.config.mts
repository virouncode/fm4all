import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, ViteUserConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()] as ViteUserConfig["plugins"],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
