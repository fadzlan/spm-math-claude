/* Lazy-loads the "variety pack" generators (js/data/x*.js, ~5.6 MB together) on demand, so the page paints and
 * becomes interactive from the small base files (core/svg/figs/f*.js, well under 1 MB) without waiting on them.
 * The base topics (from f*.js) already work on their own; the packs only add more question templates via
 * SPM.extend, so it's safe to attach them a moment later.
 *
 * - `SPM.ensurePacks(keys)` loads just the packs that extend those topic keys (per js/pack-manifest.js, generated
 *   by tools/pack-manifest.js) and resolves once each has been tried. It never rejects: a failed pack is skipped
 *   with a console error, not fatal. Every pack is requested at most once. app.js awaits it before each worksheet;
 *   `SPM.havePacks(keys)` says synchronously whether that wait would be a no-op.
 * - `SPM.prefetchAllPacks()` fetches the remaining packs in the background, two at a time so they don't crowd out
 *   requests the user is waiting on. app.js starts it once, after the first worksheet has rendered.
 * - `SPM.packsReady` resolves (and `SPM.packsLoaded` turns true) once every pack has been tried, by whichever route.
 * Nothing is loaded until one of these is called.
 */
(function (root) {
  'use strict';
  const SPM = (root.SPM = root.SPM || {});
  const manifest = () => SPM.packManifest || {};
  // every pack, in file order (read on use, so it doesn't matter which of the two scripts runs first)
  const allPacks = () => [...new Set([].concat(...Object.values(manifest())))].sort();
  const started = new Map(); // pack -> Promise<boolean>, resolved once the script has run (true) or failed (false)
  const tried = new Set(); // packs whose promise has resolved

  function loadScript(src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve(true);
      s.onerror = () => {
        console.error('SPM: failed to load', src);
        resolve(false);
      };
      document.body.appendChild(s);
    });
  }

  let markReady;
  SPM.packsLoaded = false;
  SPM.packsReady = new Promise((resolve) => (markReady = resolve));

  function loadPack(p) {
    if (!started.has(p)) {
      started.set(
        p,
        loadScript(`js/data/${p}.js`).then((ok) => {
          tried.add(p);
          const all = allPacks();
          if (!SPM.packsLoaded && all.every((q) => tried.has(q))) {
            SPM.packsLoaded = true;
            markReady();
          }
          return ok;
        })
      );
    }
    return started.get(p);
  }

  /** the packs that extend any of these topic keys */
  function packsFor(keys) {
    const m = manifest();
    return [...new Set([].concat(...(keys || []).map((k) => m[k] || [])))];
  }

  SPM.havePacks = (keys) => packsFor(keys).every((p) => tried.has(p));
  SPM.ensurePacks = (keys) => Promise.all(packsFor(keys).map(loadPack)).then(() => undefined);

  let prefetch = null;
  SPM.prefetchAllPacks = function () {
    if (!prefetch) {
      if (!SPM.packManifest) console.error('SPM: js/pack-manifest.js did not load; the variety packs are unavailable');
      const queue = allPacks();
      if (!queue.length) {
        // nothing to load at all (no manifest) still counts as "every pack tried"
        SPM.packsLoaded = true;
        markReady();
      }
      // a pack that's already in flight (requested by ensurePacks) is skipped here rather than waited on, so it
      // doesn't hold one of the two slots; packsReady still waits for it
      const worker = async () => {
        while (queue.length) {
          const p = queue.shift();
          if (!started.has(p)) await loadPack(p);
        }
      };
      prefetch = Promise.all([worker(), worker()]);
    }
    return SPM.packsReady;
  };
})(typeof window !== 'undefined' ? window : globalThis);
