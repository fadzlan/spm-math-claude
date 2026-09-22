// Dev server only – the site has no build step, so this just serves site/ as-is.
// Binds to this machine's Tailscale IPv4 address (from `tailscale ip -4`) so the site is reachable
// over the tailnet but not on other interfaces. Set SPM_HOST to override (e.g. SPM_HOST=127.0.0.1).
const { execSync } = require('child_process');

function tailscaleIp() {
  try {
    return execSync('tailscale ip -4', { encoding: 'utf8' }).trim().split('\n')[0];
  } catch (e) {
    throw new Error('Could not get the Tailscale IP (`tailscale ip -4` failed) – is Tailscale running? Or set SPM_HOST.');
  }
}

module.exports = {
  root: 'site',
  server: {
    host: process.env.SPM_HOST || tailscaleIp(),
    port: 5180, // not Vite's default 5173, which another project on this machine already uses
    strictPort: true,
  },
};
