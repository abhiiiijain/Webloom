import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const distEntry = join(backendRoot, "dist", "index.js");

if (existsSync(distEntry)) {
  process.exit(0);
}

console.log("dist/index.js missing — compiling TypeScript");
const result = spawnSync("npx", ["tsc", "-p", "tsconfig.json"], {
  cwd: backendRoot,
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
