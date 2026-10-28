import { afterEach, expect, test } from "bun:test";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { currentCacheFiles, transportCache } from "./compiler-cache";

const temporary: string[] = [];
afterEach(() => {
  for (const directory of temporary.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "wisconsin-cache-test-"));
  temporary.push(root);
  const cache = path.join(root, "cache");
  const write = (file: string, value: unknown = {}) => {
    mkdirSync(path.dirname(path.join(cache, file)), { recursive: true });
    writeFileSync(path.join(cache, file), JSON.stringify(value));
  };
  for (const name of [
    "stage1-current",
    "history-current",
    ...["public", "full"].flatMap((edition) => [
      `social-titles-current-${edition}`,
      `content-files-current-${edition}`,
      `search-current-${edition}`,
      `course-files-current-${edition}`,
    ]),
  ])
    write(`${name}.json`, []);
  const identity = "a".repeat(64);
  const app = `application/${identity}/kit/types/src/routes/[...slug]/$types.d.ts`;
  write("application-current.json", { schema: 1, identity, files: [app] });
  write(app, "application");
  for (const edition of ["public", "full"]) {
    const body = `content/${edition}/bodies/${identity}.json`;
    write(body, { edition });
    write(`content-current-${edition}.json`, { edition });
    write(`content-files-current-${edition}.json`, [
      body,
      `content-current-${edition}.json`,
    ]);
    const search = `search/${edition}/${identity}/files/pagefind.js`;
    write(search, "index");
    write(`search-current-${edition}.json`, [search]);
    const course = `course-files/${edition}/fa26-cs577.json`;
    write(course, { course: "fa26-cs577" });
    write(`course-files-current-${edition}.json`, [course]);
  }
  return { root, cache, write, app, identity };
}

test("selects portable current generations and omits obsolete output and local file stamps", () => {
  const f = fixture();
  const stale = `application/${"b".repeat(64)}/kit/worker.js`;
  f.write(stale);
  f.write("deployment-hashes.json");
  f.write(`content/full/bodies/${"b".repeat(64)}.json`);
  const files = currentCacheFiles(f.cache);
  expect(files).toContain(f.app);
  expect(files).toContain(`content/full/bodies/${f.identity}.json`);
  expect(files).toContain(`search/public/${f.identity}/files/pagefind.js`);
  expect(files).toContain("course-files/full/fa26-cs577.json");
  expect(files).not.toContain(stale);
  expect(files).not.toContain("deployment-hashes.json");
  expect(files).not.toContain(`content/full/bodies/${"b".repeat(64)}.json`);
});

test("rejects unsafe manifests and redirected cache files", () => {
  const f = fixture();
  f.write("search-current-public.json", [
    `search/public/${f.identity}/../../outside`,
  ]);
  rmSync(path.join(f.cache, f.app));
  symlinkSync(
    path.join(f.cache, "stage1-current.json"),
    path.join(f.cache, f.app),
  );
  const files = currentCacheFiles(f.cache);
  expect(files).not.toContain("search-current-public.json");
  expect(files).not.toContain(f.app);
  expect(files.every((file) => !file.includes(".."))).toBe(true);
});

test("encrypted archive restores the selected generations on a fresh runner", () => {
  const f = fixture();
  const encrypted = path.join(f.root, "compiler-cache.gpg");
  const output = path.join(f.root, "output");
  const restored = path.join(f.root, "fresh");
  expect(
    transportCache("save", f.cache, encrypted, "test-only-key", output),
  ).toBe(true);
  expect(readFileSync(output, "utf8")).toBe("ready=true\n");
  expect(transportCache("restore", restored, encrypted, "test-only-key")).toBe(
    true,
  );
  for (const file of currentCacheFiles(f.cache))
    expect(readFileSync(path.join(restored, file))).toEqual(
      readFileSync(path.join(f.cache, file)),
    );
}, 15000);

test("missing secrets, corrupt archives, and wrong keys leave existing cache data intact", () => {
  const f = fixture();
  const encrypted = path.join(f.root, "compiler-cache.gpg");
  expect(transportCache("restore", f.cache, encrypted, undefined)).toBe(false);
  expect(transportCache("save", f.cache, encrypted, "test-only-key")).toBe(
    true,
  );
  expect(transportCache("restore", f.cache, encrypted, "wrong-key")).toBe(
    false,
  );
  writeFileSync(encrypted, "corrupt");
  expect(transportCache("restore", f.cache, encrypted, "test-only-key")).toBe(
    false,
  );
  expect(JSON.parse(readFileSync(path.join(f.cache, f.app), "utf8"))).toBe(
    "application",
  );
}, 15000);
