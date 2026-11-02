import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, type ViteUserConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: { "@": resolve(__dirname, "./src") },
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  // Cast hérité de l'ancienne config : @vitejs/plugin-react est typé contre
  // vite 7, vitest 3 contre vite 6.
  plugins: [tsconfigPaths(), react()] as ViteUserConfig["plugins"],
});
