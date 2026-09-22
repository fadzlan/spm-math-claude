/* Lazy-loads the "variety pack" generators (js/data/x*.js, several MB together) so the page paints and
 * becomes interactive from the small base files (core/svg/figs/f*.js, well under 1 MB) without waiting on them.
 * The base topics (from f*.js) already work on their own; the packs only add more question templates via
 * SPM.extend, so it's safe to attach them a moment later. `SPM.packsReady` resolves once every pack has been
 * tried (a failed one is skipped, not fatal); app.js awaits it before the first `SPM.generate()` call.
 */
(function (root) {
  'use strict';
  const SPM = (root.SPM = root.SPM || {});
  const PACKS = [
    'x1a', 'x1b', 'x1c', 'x1d', 'x1e', 'x1f', 'x1g',
    'x2a', 'x2b', 'x2c', 'x2d', 'x2e', 'x2f', 'x2g',
    'x3a', 'x3b', 'x3c', 'x3d',
    'x4a', 'x4b', 'x4c', 'x4d', 'x4e', 'x4f',
    'x5a', 'x5b', 'x5c', 'x5d',
  ];

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

  SPM.packsLoaded = false;
  SPM.packsReady = Promise.all(PACKS.map((p) => loadScript(`js/data/${p}.js`))).then(() => {
    SPM.packsLoaded = true;
  });
})(typeof window !== 'undefined' ? window : globalThis);
