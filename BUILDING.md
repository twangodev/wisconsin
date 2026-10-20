# Publishing the notes

The publishing engine lives in [twangodev/twiki](https://github.com/twangodev/twiki).
This repository owns course content, publication policies, site branding, and
Cloudflare resource configuration in `twiki.config.json`.

```sh
bun install --frozen-lockfile
bun run dev
bun run check
bun run build
bun run preview
```

Use Bun 1.4+ and Node 22.12+. Worksheet previews also need R, knitr, and car when
verified cached previews are unavailable. Engine state, build outputs, and caches
are generated under `.twiki/`; source notes and submodule pointers stay unchanged.

`bun run deploy` uploads the existing Cloudflare build using environment-provided
credentials. Production deployment remains in GitHub Actions after checks pass.
The engine dependency is pinned to an exact npm version; update it deliberately and
validate the resulting publication before deploying.

The content homepage remains `content/index.md`. Commit course edits in their
submodule before updating this repository's pointer.
