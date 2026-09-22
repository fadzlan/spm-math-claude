# Performance plan

Based on a HAR capture (`spm-math-claude-2.har`, 2026-09-22) of the site loaded over Tailscale from
`http://malachite:8282/site/`, served by `python3 -m http.server`.

## Findings

| Milestone | Time |
|---|---|
| HTML received | 0.9 s |
| DOMContentLoaded (22 blocking scripts, ~1 MB) | 14.7 s |
| All 28 variety packs (`js/data/x*.js`, 5.6 MB) received | ~83 s |
| First worksheet rendered (KaTeX fonts requested) | ~85 s |

- **Link:** ~300 ms RTT, ~80 KB/s aggregate throughput (likely a DERP-relayed Tailscale path).
- **Server:** HTTP/1.0, one request per connection, no compression, no `Cache-Control`/`ETag`. Every visit
  re-downloads 6.9 MB.
- **Blocking scripts:** 22 synchronous `<script>` tags. With the browser's 6-connection limit, later scripts
  queued for up to 7 s before starting.
- **Packs gate the first render:** `packs.js` requests all 28 packs at once, and `generate()` in `app.js`
  awaits `SPM.packsReady` (all packs) before producing *any* worksheet. Some packs queued for 38 s. The
  "loading" state is the norm, not the rare case.
- **Compressibility:** gzip -9 cuts the data files from 6.3 MB to 1.6 MB and KaTeX from 273 KB to 76 KB (~4×).

## Constraints

- The site has **no build step** and must keep working when opened via `file://` (see README and
  `tools/browser-test.js`). No `fetch()` of data files and no bundler. Anything generated has to be a
  plain `.js` file checked into `site/`.
- `npm run check` and `npm run test:browser` must pass.

## Steps

### 1. Load only the packs the selected topics need (largest win)

- Add a generator script (`tools/pack-manifest.js`, `npm run manifest`) that scans `site/js/data/x*.js` for
  `SPM.extend('<topic>', …)` calls and writes `site/js/pack-manifest.js`, which assigns
  `SPM.packManifest = { '<topic>': ['x1a', …], … }`.
- `npm run check` fails if the manifest is stale.
- `packs.js` exposes `SPM.ensurePacks(keys)`. It loads only the packs mapped to those topic keys, memoises
  each pack's promise, and resolves even when a pack fails (as it does today).
- `app.js` `generate()` awaits `SPM.ensurePacks(state.keys)` instead of all packs, and shows the loading state
  only when something is actually outstanding.
- After the first worksheet renders, prefetch the remaining packs in the background with low concurrency
  (2 at a time) so they don't compete with requests the user is waiting on. `SPM.packsReady`/`packsLoaded`
  keep meaning "all packs attempted" for existing callers and tests.

**Expected:** a single-topic worksheet needs ~0.2 MB of packs instead of 5.6 MB.

### 2. Compressing, keep-alive static server

- Add `tools/serve.js` (`npm run serve`), a dependency-free Node server for `site/`. It provides:
  - HTTP/1.1 keep-alive
  - gzip for text types (cached in memory per file mtime)
  - `ETag`/`Last-Modified` with 304s
  - `Cache-Control: no-cache` (always revalidate, since there are no hashed filenames)
  - correct MIME types
- It binds to the Tailscale IP like `vite.config.js` (`SPM_HOST` override) on port 8282 (`SPM_PORT` override).
- Serves the repo root so the existing `/site/` URL keeps working, and redirects `/` to `/site/`.

**Expected:** ~4× less data. Repeat visits transfer only 304s.

### 3. Non-blocking scripts and an early font request

- Mark the static `<script>` tags in `index.html` `defer` (the order is preserved). The small inline
  theme script stays synchronous.
- Preload `vendor/katex/fonts/KaTeX_Main-Regular.woff2` (`as="font" type="font/woff2" crossorigin`). The
  preload is added from the inline head script and skipped on `file://`, where Chrome blocks CORS-mode font
  fetches (this showed up as a console error in `tools/browser-test.js`).

## Status (2026-09-22)

Steps 1–3 are implemented. `npm run check` and `npm run test:browser` pass. Still to do: switch the live
server from `python3 -m http.server` to `npm run serve`, and capture a new HAR to compare.

**Expected:** the HTML parses and paints without waiting on ~1 MB of script.

### 4. Network (manual, optional)

- Run `tailscale status` / `tailscale ping malachite`. If the path is "via DERP", a direct connection
  would improve every number above.

## Out of scope

- Bundling or minifying the app's own JS, and hashed filenames with long `max-age`. Both need a build step,
  which the project deliberately avoids. Revisit if steps 1–3 aren't enough.

## Verification

- `npm run check` and `npm run test:browser` pass.
- Capture a new HAR over Tailscale and compare it against the milestones table above.
