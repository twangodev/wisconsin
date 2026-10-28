import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { compilerCacheFiles } from "../../node_modules/@twango/twiki/site/tooling/lib/cache-selection";

const safePath = (file: string) =>
  /^[\w.$+\[\]-]+(?:\/[\w.$+\[\]-]+)*$/.test(file) &&
  file.split("/").every((part) => part !== "." && part !== "..");

export function currentCacheFiles(cache: string) {
  const files = new Set(compilerCacheFiles(cache));
  const select = (manifest: string, pattern: RegExp, application = false) => {
    try {
      const saved = JSON.parse(
        readFileSync(path.join(cache, manifest), "utf8"),
      );
      const entries: unknown = application ? saved.files : saved;
      if (
        !Array.isArray(entries) ||
        !entries.every(
          (file) =>
            typeof file === "string" && safePath(file) && pattern.test(file),
        ) ||
        (application &&
          (saved.schema !== 1 ||
            !/^[a-f0-9]{64}$/.test(saved.identity) ||
            !entries.every((file) =>
              file.startsWith(`application/${saved.identity}/`),
            )))
      )
        throw new Error("Invalid manifest");
      files.add(manifest);
      for (const file of entries) files.add(file);
    } catch {
      console.log(`No valid ${manifest}; omitting its entries from cache save`);
    }
  };
  select("application-current.json", /^application\/[a-f0-9]{64}\//, true);
  for (const edition of ["public", "full"]) {
    select(
      `content-files-current-${edition}.json`,
      new RegExp(
        `^(?:content-current-${edition}\\.json|content/${edition}/(?:bodies|docs)/[a-f0-9]{64}\\.json)$`,
      ),
    );
    select(
      `search-current-${edition}.json`,
      new RegExp(`^search/${edition}/[a-f0-9]{64}/`),
    );
    select(
      `course-files-current-${edition}.json`,
      new RegExp(`^course-files/${edition}/[\\w-]+\\.json$`),
    );
  }
  const root = realpathSync(cache);
  return [...files]
    .filter((file) => {
      if (!safePath(file)) return false;
      const absolute = path.join(root, file);
      try {
        return (
          lstatSync(absolute).isFile() && realpathSync(absolute) === absolute
        );
      } catch {
        return false;
      }
    })
    .sort();
}

export function transportCache(
  mode: "restore" | "save",
  cache: string,
  encrypted: string,
  secret: string | undefined,
  output = process.env.GITHUB_OUTPUT,
) {
  if (!secret || (mode === "restore" && !existsSync(encrypted))) {
    console.log(
      mode === "restore"
        ? "No usable encrypted cache; building cold"
        : "No cache key; skipping cache save",
    );
    return false;
  }
  const temporary = mkdtempSync(path.join(tmpdir(), "wisconsin-cache-"));
  const archive = path.join(temporary, "cache.tar.gz");
  const status = path.join(temporary, "status");
  const run = (command: string, args: string[]) =>
    execFileSync(command, args, {
      env: { ...process.env, GNUPGHOME: temporary },
      input: command === "gpg" ? secret + "\n" : undefined,
      stdio: "pipe",
      maxBuffer: 32 * 1024 * 1024,
    });
  const gpg = [
    "--batch",
    "--yes",
    "--pinentry-mode",
    "loopback",
    "--no-symkey-cache",
    "--passphrase-fd",
    "0",
  ];
  try {
    if (mode === "restore") {
      run("gpg", [
        ...gpg,
        "--status-file",
        status,
        "--output",
        archive,
        "--decrypt",
        encrypted,
      ]);
      if (
        !readFileSync(status, "utf8").split("\n").includes("[GNUPG:] GOODMDC")
      )
        throw new Error("Cache integrity was not verified");
      const members = run("tar", ["-tzf", archive])
        .toString()
        .trimEnd()
        .split("\n");
      if (!members.every(safePath)) throw new Error("Unsafe cache archive");
      const staged = path.join(temporary, "unpacked");
      mkdirSync(staged);
      run("tar", [
        "-xzf",
        archive,
        "-C",
        staged,
        "--no-same-owner",
        "--no-same-permissions",
      ]);
      for (const member of members) {
        const file = path.join(staged, member);
        if (!lstatSync(file).isFile() || realpathSync(file) !== file)
          throw new Error("Cache entries must be regular files");
      }
      mkdirSync(cache, { recursive: true });
      cpSync(staged, cache, { recursive: true });
      console.log(
        "Compiler cache restored; the engine validates every stage before reuse",
      );
    } else {
      const files = currentCacheFiles(cache);
      if (!files.length) throw new Error("No current cache entries");
      const list = path.join(temporary, "files");
      writeFileSync(list, files.map((file) => file + "\0").join(""));
      run("tar", [
        "-czf",
        archive,
        "-C",
        cache,
        "--null",
        "--files-from",
        list,
      ]);
      mkdirSync(path.dirname(encrypted), { recursive: true });
      run("gpg", [
        ...gpg,
        "--symmetric",
        "--cipher-algo",
        "AES256",
        "--compress-algo",
        "none",
        "--output",
        encrypted,
        archive,
      ]);
      if (output) appendFileSync(output, "ready=true\n");
      const bytes = files.reduce(
        (sum, file) => sum + statSync(path.join(cache, file)).size,
        0,
      );
      console.log(
        `Compiler cache encrypted: ${files.length} current files, ${(bytes / 1024 ** 2).toFixed(1)} MiB before compression`,
      );
    }
    return true;
  } catch {
    console.log(
      mode === "restore"
        ? "Cache could not be verified; building cold"
        : "Cache encryption failed; skipping cache save",
    );
    return false;
  } finally {
    try {
      run("gpgconf", ["--kill", "gpg-agent"]);
    } catch {}
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  const mode = process.argv[2];
  if (mode !== "restore" && mode !== "save")
    throw new Error("Expected restore or save");
  const generated = path.resolve(".twiki/site/build/generated");
  transportCache(
    mode,
    path.join(generated, "cache"),
    path.join(generated, "compiler-cache.gpg"),
    process.env.BUILD_CACHE_KEY,
  );
}
