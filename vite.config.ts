import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Monorepo root (deploysheild/) may hold VITE_* keys; frontend folder overrides. */
export default defineConfig(({ mode }) => {
  const feDir = __dirname;
  const repoRoot = path.resolve(feDir, "..");
  const fromParent = loadEnv(mode, repoRoot, "VITE_");
  const fromFrontend = loadEnv(mode, feDir, "VITE_");
  const mergedVite = { ...fromParent, ...fromFrontend };

  const defineEnv: Record<string, string> = {};
  for (const [key, value] of Object.entries(mergedVite)) {
    if (key.startsWith("VITE_")) {
      defineEnv[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    envDir: feDir,
    define: defineEnv,
  };
});
