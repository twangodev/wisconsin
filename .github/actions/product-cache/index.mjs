import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

// Keep the Node action thin: Bun stages the pinned engine, which owns encrypted
// transport, authenticated restoration and main-only publication.
const project = realpathSync(process.env.GITHUB_WORKSPACE ?? process.cwd());
const require = createRequire(import.meta.url);
const child = spawnSync(
  "bun",
  [require.resolve("@twango/twiki/cli"), "prepare", "--json"],
  { cwd: project, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
);
if (child.error || child.status !== 0)
  throw new Error("Unable to prepare the pinned Twiki engine");
const prepared = JSON.parse(child.stdout);
if (
  prepared.workDir !== path.join(project, ".twiki/site") ||
  !prepared.env ||
  typeof prepared.env !== "object" ||
  Object.entries(prepared.env).some(
    ([key, value]) => !key.startsWith("TWIKI_") || typeof value !== "string",
  )
)
  throw new Error("Unexpected Twiki staging metadata");
Object.assign(process.env, prepared.env, { TWIKI_SITE_DIR: prepared.workDir });
await import("@twango/twiki/actions/product-cache");
