import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Same file list as Vite; values from disk only (no process.env), in merge order. */
function loadViteEnvFromFiles(mode: string, dir: string): Record<string, string> {
  const names = [".env", ".env.local", `.env.${mode}`, `.env.${mode}.local`];
  const merged: Record<string, string> = {};
  for (const name of names) {
    const fp = path.join(dir, name);
    let st: fs.Stats | undefined;
    try {
      st = fs.statSync(fp);
    } catch {
      continue;
    }
    if (!st.isFile()) continue;
    const parsed = parseEnvLines(fs.readFileSync(fp, "utf-8"));
    Object.assign(merged, parsed);
  }
  return Object.fromEntries(
    Object.entries(merged).filter(([k]) => k.startsWith("VITE_")),
  );
}

function parseEnvLines(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (let line of content.split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("export ")) line = line.slice(7).trim();
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/**
 * Monorepo root (deploysheild/) may hold VITE_* keys; frontend folder overrides.
 * Vite's loadEnv lets empty process.env VITE_* override .env — we prefer .env unless
 * the shell value is non-empty (CI / explicit exports).
 */
export default defineConfig(({ mode }) => {
  const feDir = __dirname;
  const repoRoot = path.resolve(feDir, "..");
  const fromFiles = {
    ...loadViteEnvFromFiles(mode, repoRoot),
    ...loadViteEnvFromFiles(mode, feDir),
  };
  const fromLoadEnv = { ...loadEnv(mode, repoRoot, "VITE_"), ...loadEnv(mode, feDir, "VITE_") };
  const mergedVite: Record<string, string> = { ...fromFiles };
  for (const [key, value] of Object.entries(fromLoadEnv)) {
    if (!key.startsWith("VITE_")) continue;
    const v = value ?? "";
    if (v.trim() !== "") mergedVite[key] = v;
  }

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
