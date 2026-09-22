/* Variety pack x4c: extra generators for F4-5 Network in Graph Theory (see tools/variety.js). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { need, retry } = SPM;
  const T = SPM.L, S = SPM.svg;
  const LET = 'ABCDEFGHIJ';
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  /* ===================================================== shared graph model
   * g = { nv, edges: [{a,b,w}], directed }. a===b is a loop. Two edges sharing
   * an unordered {a,b} are a multiple/parallel edge. Directed graphs in this
   * pack are always simple (no loop/multi) to keep the figure unambiguous. */
  function buildGraph(r, nv, o) {
    o = o || {};
    return retry(() => {
      const edges = [];
      const key = (a, b) => (a < b ? a + '_' + b : b + '_' + a);
      const used = new Set();
      for (let v = 1; v < nv; v++) {
        const u = r.int(0, v - 1);
        edges.push({ a: u, b: v });
        used.add(key(u, v));
      }
      const extra = o.extra || 0;
      let guard = 0;
      while (edges.length < nv - 1 + extra && guard++ < 120) {
        const a = r.int(0, nv - 1), b = r.int(0, nv - 1);
        if (a === b) continue;
        if (!o.multi && used.has(key(a, b))) continue;
        edges.push({ a, b });
        used.add(key(a, b));
      }
      need(edges.length === nv - 1 + extra);
      if (o.loop) edges.push({ a: r.int(0, nv - 1), b: undefined });
      if (o.loop) edges[edges.length - 1].b = edges[edges.length - 1].a;
      if (o.weighted !== false) {
        const lo = o.wlo || 2, hi = o.whi || 20;
        edges.forEach((e) => (e.w = r.int(lo, hi)));
      }
      if (o.directed) edges.forEach((e) => { if (r.chance()) { const t = e.a; e.a = e.b; e.b = t; } });
      return { nv, edges, directed: !!o.directed };
    });
  }
  function degree(g, v) {
    let d = 0;
    for (const e of g.edges) {
      if (e.a === e.b) { if (e.a === v) d += 2; } else if (e.a === v || e.b === v) d += 1;
    }
    return d;
  }
  const outDeg = (g, v) => g.edges.filter((e) => e.a === v).length;
  const inDeg = (g, v) => g.edges.filter((e) => e.b === v).length;
  function isSimple(g) {
    if (g.edges.some((e) => e.a === e.b)) return false;
    const seen = new Set();
    for (const e of g.edges) {
      const k = e.a < e.b ? e.a + '_' + e.b : e.b + '_' + e.a;
      if (seen.has(k)) return false;
      seen.add(k);
    }
    return true;
  }
  const hasLoop = (g) => g.edges.some((e) => e.a === e.b);
  function multiPairs(g) {
    const cnt = {};
    g.edges.forEach((e) => { if (e.a !== e.b) { const k = e.a < e.b ? e.a + '_' + e.b : e.b + '_' + e.a; cnt[k] = (cnt[k] || 0) + 1; } });
    return Object.keys(cnt).filter((k) => cnt[k] > 1);
  }
  function isConnected(g) {
    const adj = Array.from({ length: g.nv }, () => []);
    g.edges.forEach((e) => { adj[e.a].push(e.b); adj[e.b].push(e.a); });
    const seen = new Set([0]), stack = [0];
    while (stack.length) { const v = stack.pop(); for (const w of adj[v]) if (!seen.has(w)) { seen.add(w); stack.push(w); } }
    return seen.size === g.nv;
  }
  /* connected + |E| = |V|-1 + simple  <=>  tree (standard result: no separate cycle check needed) */
  const isTree = (g) => isSimple(g) && isConnected(g) && g.edges.length === g.nv - 1;

  function netFig(g, o) {
    o = o || {};
    const W = 260, H = 210, cx = W / 2, cy = H / 2, R = 76;
    const labels = o.labels || LET.slice(0, g.nv).split('');
    const P = Array.from({ length: g.nv }, (_, i) => [cx + R * Math.cos((2 * Math.PI * i) / g.nv - Math.PI / 2), cy + R * Math.sin((2 * Math.PI * i) / g.nv - Math.PI / 2)]);
    const groups = {};
    g.edges.forEach((e, k) => {
      if (e.a === e.b) return;
      const key = e.a < e.b ? e.a + '_' + e.b : e.b + '_' + e.a;
      (groups[key] = groups[key] || []).push(k);
    });
    let out = '';
    Object.keys(groups).forEach((key) => {
      const ks = groups[key];
      ks.forEach((k, i) => {
        const e = g.edges[k];
        const A = P[e.a], B = P[e.b];
        const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
        const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
        const off = (i - (ks.length - 1) / 2) * 18;
        const sa = [A[0] + ux * 9, A[1] + uy * 9], sb = [B[0] - ux * 9, B[1] - uy * 9];
        const bw = o.bold && o.bold.includes(k) ? 3 : 1.3;
        if (off === 0) out += g.directed ? S.arrow(sa[0], sa[1], sb[0], sb[1], { w: bw }) : S.line(sa[0], sa[1], sb[0], sb[1], { w: bw });
        else out += `<path d="M${sa[0].toFixed(1)},${sa[1].toFixed(1)} Q${(((A[0] + B[0]) / 2) + nx * off).toFixed(1)},${(((A[1] + B[1]) / 2) + ny * off).toFixed(1)} ${sb[0].toFixed(1)},${sb[1].toFixed(1)}" stroke-width="${bw}"/>`;
        if (o.weights !== false && e.w !== undefined) {
          const lx = (A[0] + B[0]) / 2 + nx * (off === 0 ? 11 : off), ly = (A[1] + B[1]) / 2 + ny * (off === 0 ? 11 : off);
          out += S.rect(lx - 9, ly - 7, 18, 14, { fill: 'var(--bg,#fff)', stroke: 'none' }) + S.text(lx, ly, String(e.w), { s: 11 });
        }
      });
    });
    g.edges.forEach((e) => {
      if (e.a !== e.b) return;
      const A = P[e.a], ang = (2 * Math.PI * e.a) / g.nv - Math.PI / 2;
      const lx = A[0] + 20 * Math.cos(ang), ly = A[1] + 20 * Math.sin(ang);
      out += S.circle(lx, ly, 11, { w: 1.3 });
      if (o.weights !== false && e.w !== undefined) {
        const wx = A[0] + 36 * Math.cos(ang), wy = A[1] + 36 * Math.sin(ang);
        out += S.rect(wx - 9, wy - 7, 18, 14, { fill: 'var(--bg,#fff)', stroke: 'none' }) + S.text(wx, wy, String(e.w), { s: 11 });
      }
    });
    P.forEach((p, i) => (out += S.circle(p[0], p[1], 9, { fill: 'var(--bg,#fff)' }) + S.text(p[0], p[1], labels[i], { s: 12, b: true })));
    return S.wrap(W, H, out, 'network');
  }
  const edgeListStr = (g, labels) => { labels = labels || LET; return g.edges.map((e) => labels[e.a] + labels[e.b]).join(', '); };
  function adjList(g) {
    const adj = Array.from({ length: g.nv }, () => []);
    g.edges.forEach((e, k) => { adj[e.a].push([e.b, e.w, k]); if (!g.directed && e.a !== e.b) adj[e.b].push([e.a, e.w, k]); });
    return adj;
  }
  function allPaths(g, a, b) {
    const adj = adjList(g), out = [];
    (function walk(v, seen, cost, p) {
      if (v === b && p.length > 1) { out.push({ path: p, cost }); return; }
      for (const [w, c] of adj[v]) if (!seen.has(w)) walk(w, new Set(seen).add(w), cost + (c || 0), p.concat(w));
    })(a, new Set([a]), 0, [a]);
    return out.sort((x, y) => x.cost - y.cost);
  }
  const pathStr = (p, labels) => { labels = labels || LET; return p.map((v) => labels[v]).join(' \\to '); };
  function cheapestConnect(g) {
    const parent = Array.from({ length: g.nv }, (_, i) => i);
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const order = g.edges.map((e, k) => [e.w, k]).sort((x, y) => x[0] - y[0]);
    const used = []; let cost = 0;
    for (const [w, k] of order) { const e = g.edges[k]; const pa = find(e.a), pb = find(e.b); if (pa !== pb) { parent[pa] = pb; used.push(k); cost += w; } }
    return { used, cost };
  }

  /* bilingual context banks: what a vertex / edge represents */
  const CTX = [
    { vs: 'town', vp: 'towns', vm: 'bandar', es: 'road', ep: 'roads', em: 'jalan', u: 'km', wlo: 4, whi: 30 },
    { vs: 'village', vp: 'villages', vm: 'kampung', es: 'footpath', ep: 'footpaths', em: 'denai', u: 'km', wlo: 1, whi: 12 },
    { vs: 'bus stop', vp: 'bus stops', vm: 'perhentian bas', es: 'bus route', ep: 'bus routes', em: 'laluan bas', u: 'min', wlo: 3, whi: 25 },
    { vs: 'house', vp: 'houses', vm: 'rumah', es: 'water pipe', ep: 'water pipes', em: 'paip air', u: 'm', wlo: 10, whi: 90 },
    { vs: 'computer', vp: 'computers', vm: 'komputer', es: 'network cable', ep: 'network cables', em: 'kabel rangkaian', u: 'm', wlo: 5, whi: 45 },
    { vs: 'airport', vp: 'airports', vm: 'lapangan terbang', es: 'flight route', ep: 'flight routes', em: 'laluan penerbangan', u: 'RM', wlo: 90, whi: 480 },
    { vs: 'delivery hub', vp: 'delivery hubs', vm: 'hab penghantaran', es: 'delivery route', ep: 'delivery routes', em: 'laluan penghantaran', u: 'km', wlo: 3, whi: 28 },
    { vs: 'school', vp: 'schools', vm: 'sekolah', es: 'road', ep: 'roads', em: 'jalan', u: 'km', wlo: 2, whi: 20 },
  ];
  const CTXD = [
    { vs: 'junction', vp: 'junctions', vm: 'simpang', es: 'one-way street', ep: 'one-way streets', em: 'jalan sehala' },
    { vs: 'user account', vp: 'user accounts', vm: 'akaun pengguna', es: 'follow link', ep: 'follow links', em: 'pautan ikut' },
    { vs: 'pipe joint', vp: 'pipe joints', vm: 'sambungan paip', es: 'flow link', ep: 'flow links', em: 'pautan aliran' },
    { vs: 'relay station', vp: 'relay stations', vm: 'stesen geganti', es: 'signal link', ep: 'signal links', em: 'pautan isyarat' },
    { vs: 'task', vp: 'tasks', vm: 'tugasan', es: 'prerequisite link', ep: 'prerequisite links', em: 'pautan prasyarat' },
  ];

  /* ===================================================================== 5.1  Graphs and networks */
  const g51e = [
    (r) => {
      const c = r.pick(CTX);
      const which = r.pick(['v', 'e']);
      return { q: T(
        `A network is drawn to show ${c.vp} connected by direct ${c.ep}. What does ${which === 'v' ? 'a vertex' : 'an edge'} represent in this network?`,
        `Satu rangkaian dilukis untuk menunjukkan ${c.vm} yang disambungkan oleh ${c.em} secara terus. Apakah yang diwakili oleh ${which === 'v' ? 'satu bucu' : 'satu tepi'} dalam rangkaian ini?`
      ), a: which === 'v' ? T(`a ${c.vs}`, `sebuah ${c.vm}`) : T(`a direct ${c.es} between two ${c.vp}`, `satu ${c.em} terus antara dua ${c.vm}`), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 6), g = buildGraph(r, nv, { extra: r.int(0, 2) }), c = r.pick(CTX);
      return { q: T(
        `The diagram is a network of ${c.vp} joined by direct ${c.ep}. State the number of vertices and the number of edges shown.`,
        `Rajah ialah rangkaian ${c.vm} yang disambungkan oleh ${c.em} secara terus. Nyatakan bilangan bucu dan bilangan tepi yang ditunjukkan.`
      ), fig: netFig(g, { weights: false }), a: T(`${nv} vertices, ${g.edges.length} edges`, `${nv} bucu, ${g.edges.length} tepi`), sp: 's' };
    },
    (r) => {
      const c = r.pick(CTX), stmt = r.pick([
        [T(`a vertex represents a ${c.es}`, `satu bucu mewakili sebuah ${c.em}`), false, T(`a vertex represents a ${c.vs}, not a ${c.es}`, `bucu mewakili sebuah ${c.vm}, bukan ${c.em}`)],
        [T(`an edge represents a direct ${c.es} between two ${c.vp}`, `satu tepi mewakili ${c.em} terus antara dua ${c.vm}`), true, T('this correctly describes what an edge represents', 'ini menerangkan dengan betul apa yang diwakili oleh tepi')],
        [T(`the length drawn for an edge always equals the actual ${c.u === 'RM' ? 'fare' : 'distance or time'}`, `panjang lukisan tepi sentiasa sama dengan ${c.u === 'RM' ? 'tambang' : 'jarak atau masa'} sebenar`), false, T('a schematic network is not drawn to scale; drawn length need not match the real value', 'rangkaian skematik tidak dilukis mengikut skala; panjang lukisan tidak semestinya sepadan dengan nilai sebenar')],
      ]);
      return { q: T(`True or false: in a network of ${c.vp} and ${c.ep}, ${stmt[0].en}. Justify your answer.`, `Benar atau palsu: dalam rangkaian ${c.vm} dan ${c.em}, ${stmt[0].ms}. Justifikasikan jawapan anda.`), a: T(`${stmt[1] ? 'True' : 'False'}: ${stmt[2].en}`, `${stmt[1] ? 'Benar' : 'Palsu'}: ${stmt[2].ms}`), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 6), g = buildGraph(r, nv, { extra: r.int(0, 2) }), v = r.int(0, nv - 1), c = r.pick(CTX);
      const nbrs = g.edges.filter((e) => e.a === v || e.b === v).map((e) => (e.a === v ? e.b : e.a)).sort();
      return { q: T(
        `The network shows ${c.vp} ${LET.slice(0, nv).split('').join(', ')} joined by ${c.ep}. Is ${LET[v]} directly connected to every other vertex? List the vertex/vertices (if any) that ${LET[v]} is NOT directly connected to.`,
        `Rangkaian menunjukkan ${c.vm} ${LET.slice(0, nv).split('').join(', ')} yang disambungkan oleh ${c.em}. Adakah ${LET[v]} bersambung terus dengan setiap bucu lain? Senaraikan bucu (jika ada) yang ${LET[v]} TIDAK bersambung terus dengannya.`
      ), fig: netFig(g, { weights: false }), a: (() => {
        const missing = range(0, nv - 1).filter((u) => u !== v && !nbrs.includes(u)).map((u) => LET[u]);
        return missing.length ? T(`No; not connected to ${missing.join(', ')}`, `Tidak; tidak bersambung dengan ${missing.join(', ')}`) : T('Yes, it is directly connected to every other vertex.', 'Ya, ia bersambung terus dengan setiap bucu lain.');
      })(), sp: 's' };
    },
    (r) => {
      const c = r.pick(CTX), opts = r.shuffle([
        T(`a ${c.vs}`, `sebuah ${c.vm}`),
        T(`the ${c.u === 'RM' ? 'fare' : 'distance'} between two ${c.vp}`, `${c.u === 'RM' ? 'tambang' : 'jarak'} antara dua ${c.vm}`),
        T(`a direct ${c.es} between two ${c.vp}`, `${c.em} terus antara dua ${c.vm}`),
      ]);
      const correctIdx = opts.findIndex((o) => o.en.indexOf('direct') === 0 || o.en.indexOf('a direct') === 0);
      return { q: T(
        `In a network of ${c.vp} joined by ${c.ep}, which option correctly describes what an EDGE represents?<br>(A) ${opts[0].en} &nbsp; (B) ${opts[1].en} &nbsp; (C) ${opts[2].en}`,
        `Dalam rangkaian ${c.vm} yang disambungkan oleh ${c.em}, pilihan manakah yang menerangkan dengan betul apa yang diwakili oleh TEPI?<br>(A) ${opts[0].ms} &nbsp; (B) ${opts[1].ms} &nbsp; (C) ${opts[2].ms}`
      ), a: T(`(${LET[correctIdx]}) ${opts[correctIdx].en}`, `(${LET[correctIdx]}) ${opts[correctIdx].ms}`), sp: 's' };
    },
  ];
  const g51m = [
    (r) => {
      const c = r.pick(CTX), nv = r.int(4, 5);
      const names = LET.slice(0, nv).split('');
      const links = retry(() => {
        const es = [];
        for (let v = 1; v < nv; v++) es.push([r.int(0, v - 1), v]);
        need(es.length === nv - 1);
        return es;
      });
      const g = { nv, edges: links.map(([a, b]) => ({ a, b })), directed: false };
      return { q: T(
        `A network of ${nv} ${c.vp}, ${names.join(', ')}, is described as follows: ${links.map(([a, b]) => `${c.vs} ${names[a]} is directly joined by a ${c.es} to ${c.vs} ${names[b]}`).join('; ')}. Draw the network.`,
        `Sebuah rangkaian ${nv} buah ${c.vm}, ${names.join(', ')}, diterangkan seperti berikut: ${links.map(([a, b]) => `${c.vm} ${names[a]} disambungkan terus dengan ${c.em} ke ${c.vm} ${names[b]}`).join('; ')}. Lukis rangkaian itu.`
      ), a: T(netFig(g, { weights: false }), netFig(g, { weights: false })), sp: 'l' };
    },
    (r) => {
      const nv = r.int(5, 6), g = buildGraph(r, nv, { extra: r.int(1, 2) }), c = r.pick(CTX);
      const most = range(0, nv - 1).map((v) => [v, g.edges.filter((e) => e.a === v || e.b === v).length]).sort((x, y) => y[1] - x[1]);
      return { q: T(
        `The network shows ${c.vp} joined by direct ${c.ep} (no distances given). Which vertex has the greatest number of edges joined to it, and how many?`,
        `Rangkaian menunjukkan ${c.vm} yang disambungkan oleh ${c.em} terus (tiada jarak diberikan). Bucu manakah yang mempunyai bilangan tepi terbanyak bersambung dengannya, dan berapakah bilangannya?`
      ), fig: netFig(g, { weights: false }), a: T(`${LET[most[0][0]]}, with ${most[0][1]} edges`, `${LET[most[0][0]]}, dengan ${most[0][1]} tepi`), sp: 's' };
    },
    (r) => {
      const c = r.pick(CTX), nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(0, 1) });
      const rows = range(0, nv - 1).map((i) => [LET[i], ...range(0, nv - 1).map((j) => (i === j ? '-' : g.edges.some((e) => (e.a === i && e.b === j) || (e.a === j && e.b === i)) ? '✓' : ''))]);
      return { q: T(
        `The table records which of ${nv} ${c.vp} are joined by a direct ${c.es} (a tick means yes). (a) How many vertices does the network have? (b) How many edges does the network have?<br>${SPM.table(rows, { head: ['', ...LET.slice(0, nv).split('')], rowHead: true })}`,
        `Jadual merekodkan ${c.vm} (daripada ${nv} buah) yang disambungkan oleh ${c.em} terus (tanda ✓ bermaksud ya). (a) Berapakah bilangan bucu rangkaian itu? (b) Berapakah bilangan tepi rangkaian itu?<br>${SPM.table(rows, { head: ['', ...LET.slice(0, nv).split('')], rowHead: true })}`
      ), a: T(`(a) ${nv} &nbsp; (b) ${g.edges.length}`, `(a) ${nv} &nbsp; (b) ${g.edges.length}`), sp: 's' };
    },
    (r) => {
      const c = r.pick(CTX), nv = r.int(4, 5), g = buildGraph(r, nv, { extra: 1 });
      return { q: T(
        `A network models ${nv} ${c.vp} linked by direct ${c.ep}. Explain, in terms of ${c.vp} and ${c.ep}, what the vertices and the edges of this network represent, then state how many of each are shown in the diagram.`,
        `Satu rangkaian memodelkan ${nv} buah ${c.vm} yang dihubungkan oleh ${c.em} secara terus. Terangkan, dari segi ${c.vm} dan ${c.em}, apakah yang diwakili oleh bucu dan tepi rangkaian ini, kemudian nyatakan bilangan setiap satu yang ditunjukkan dalam rajah.`
      ), fig: netFig(g, { weights: false }), a: T(`Each vertex represents a ${c.vs}; each edge represents a direct ${c.es} between two ${c.vp}. There are ${nv} vertices and ${g.edges.length} edges.`, `Setiap bucu mewakili sebuah ${c.vm}; setiap tepi mewakili ${c.em} terus antara dua ${c.vm}. Terdapat ${nv} bucu dan ${g.edges.length} tepi.`), sp: 'm' };
    },
    (r) => {
      const nv = r.int(4, 6), g = buildGraph(r, nv, { extra: r.int(0, 2) }), v = r.int(0, nv - 1), c = r.pick(CTX);
      const inc = g.edges.filter((e) => e.a === v || e.b === v).map((e) => LET[e.a] + LET[e.b]).sort();
      return { q: T(
        `The network shows ${c.vp} joined by direct ${c.ep}. List the edges (not just the vertices) that are joined to vertex ${LET[v]}.`,
        `Rangkaian menunjukkan ${c.vm} yang disambungkan oleh ${c.em} terus. Senaraikan tepi (bukan sekadar bucu) yang bersambung dengan bucu ${LET[v]}.`
      ), fig: netFig(g, { weights: false }), a: T(inc.length ? inc.join(', ') : 'none', inc.length ? inc.join(', ') : 'tiada'), sp: 's' };
    },
    (r) => {
      const nv = r.int(5, 6), g = buildGraph(r, nv, { extra: r.int(1, 2) }), c = r.pick(CTX);
      const [u, v] = r.shuffle(range(0, nv - 1)).slice(0, 2);
      const direct = g.edges.some((e) => (e.a === u && e.b === v) || (e.a === v && e.b === u));
      const mid = direct ? null : range(0, nv - 1).find((x) => x !== u && x !== v && g.edges.some((e) => (e.a === u && e.b === x) || (e.a === x && e.b === u)) && g.edges.some((e) => (e.a === v && e.b === x) || (e.a === x && e.b === v)));
      need(direct || mid !== undefined);
      return { q: T(
        `A route planner for the ${c.vp} network needs a journey from ${LET[u]} to ${LET[v]}. Is there a direct ${c.es} between them? If not, name one vertex that can be used as a single stop in between.`,
        `Perancang laluan bagi rangkaian ${c.vm} memerlukan perjalanan dari ${LET[u]} ke ${LET[v]}. Adakah terdapat ${c.em} terus antara kedua-duanya? Jika tidak, namakan satu bucu yang boleh digunakan sebagai perhentian tunggal di antaranya.`
      ), fig: netFig(g, { weights: false }), a: direct ? T(`Yes, ${LET[u]} and ${LET[v]} are directly connected.`, `Ya, ${LET[u]} dan ${LET[v]} bersambung terus.`) : T(`No; one possible stop is ${LET[mid]}.`, `Tidak; satu perhentian yang mungkin ialah ${LET[mid]}.`), sp: 's' };
    },
  ];
  const g51a = [
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: 2 }), c = r.pick(CTX);
      return { q: T(
        `Draw a network for this information: the vertices are ${LET.slice(0, nv).split('').join(', ')} (representing ${c.vp}) and the direct ${c.ep} are ${edgeListStr(g)}. State which vertex has the most edges joined to it.`,
        `Lukis satu rangkaian bagi maklumat ini: bucunya ialah ${LET.slice(0, nv).split('').join(', ')} (mewakili ${c.vm}) dan ${c.em} terus ialah ${edgeListStr(g)}. Nyatakan bucu yang mempunyai bilangan tepi terbanyak bersambung dengannya.`
      ), a: (() => { const ds = range(0, nv - 1).map((v) => degree(g, v)); const mx = Math.max(...ds); return T(`${netFig(g, { weights: false })} Most edges: ${range(0, nv - 1).filter((v) => ds[v] === mx).map((v) => LET[v]).join(', ')} (${mx} edges)`, `${netFig(g, { weights: false })} Tepi terbanyak: ${range(0, nv - 1).filter((v) => ds[v] === mx).map((v) => LET[v]).join(', ')} (${mx} tepi)`); })(), sp: 'l' };
    },
    (r) => {
      const nv = r.int(5, 6), extraA = r.int(1, 2), gA = buildGraph(r, nv, { extra: extraA }), c = r.pick(CTX);
      const gB = buildGraph(r, nv, { extra: extraA });
      need(edgeListStr(gA) !== edgeListStr(gB));
      return { q: T(
        `Two students each drew a network for the same ${nv} ${c.vp} P1: ${edgeListStr(gA)}; and P2: ${edgeListStr(gB)}. Explain, with reference to vertices and edges, whether the two networks are necessarily the same diagram even though both could be correct models.`,
        `Dua orang murid masing-masing melukis rangkaian bagi ${nv} buah ${c.vm} yang sama. P1: ${edgeListStr(gA)}; dan P2: ${edgeListStr(gB)}. Terangkan, dengan merujuk kepada bucu dan tepi, sama ada kedua-dua rangkaian itu semestinya rajah yang sama walaupun kedua-duanya boleh betul.`
      ), a: T(`No: the two edge lists are different, so the networks join different pairs of vertices even though both have ${nv} vertices; a network is defined by which vertices are joined, not by how it is drawn.`, `Tidak: kedua-dua senarai tepi berbeza, jadi rangkaian itu menyambungkan pasangan bucu yang berbeza walaupun kedua-duanya mempunyai ${nv} bucu; rangkaian ditakrifkan oleh bucu mana yang disambungkan, bukan oleh cara ia dilukis.`), sp: 'm' };
    },
  ];
  SPM.extend('F4-5.1', { e: g51e, m: g51m, a: g51a });

  /* ===================================================================== 5.2  Types and features of graphs */
  const REAL_SCEN = [
    { txt: ['road distances between towns', 'jarak jalan antara bandar-bandar'], dir: false, wt: true },
    { txt: ['which social media accounts follow which other accounts', 'akaun media sosial manakah mengikuti akaun lain'], dir: true, wt: false },
    { txt: ['the cost (RM) of a bus ticket between two towns', 'kos (RM) tiket bas antara dua bandar'], dir: false, wt: true },
    { txt: ['one-way streets in a town centre', 'jalan sehala di pusat bandar'], dir: true, wt: false },
    { txt: ['whether two students are friends on a school app (friendship is mutual)', 'sama ada dua murid berkawan pada aplikasi sekolah (persahabatan adalah dua hala)'], dir: false, wt: false },
    { txt: ['the flow direction of water between tanks', 'arah aliran air antara tangki'], dir: true, wt: false },
    { txt: ['the time (minutes) needed to walk between two buildings', 'masa (minit) untuk berjalan antara dua bangunan'], dir: false, wt: true },
  ];
  const g52e = [
    (r) => {
      const nv = r.int(4, 6), g = buildGraph(r, nv, { extra: r.int(1, 3) }), v = r.int(0, nv - 1), c = r.pick(CTX);
      return { q: T(`The network shows ${c.vp} joined by direct ${c.ep}. Find the degree of vertex ${LET[v]}.`, `Rangkaian menunjukkan ${c.vm} yang disambungkan oleh ${c.em} terus. Cari darjah bucu ${LET[v]}.`), fig: netFig(g, { weights: false }), a: T(`${degree(g, v)}`), sp: 'xs' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(1, 2), loop: true });
      const v = r.pick(g.edges.filter((e) => e.a === e.b).map((e) => e.a));
      return { q: T(`In the diagram, a loop is drawn at vertex ${LET[v]}. What is the degree contributed by this loop alone, and the total degree of ${LET[v]}?`, `Dalam rajah, satu gelung dilukis pada bucu ${LET[v]}. Apakah darjah yang disumbangkan oleh gelung ini sahaja, dan jumlah darjah bucu ${LET[v]}?`), fig: netFig(g, { weights: false }), a: T(`Loop contributes 2; total degree of ${LET[v]} = ${degree(g, v)}`, `Gelung menyumbang 2; jumlah darjah bucu ${LET[v]} = ${degree(g, v)}`), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 6), which = r.pick(['simple', 'loop', 'multi']);
      const g = which === 'simple' ? buildGraph(r, nv, { extra: r.int(0, 2), weighted: false }) : which === 'loop' ? buildGraph(r, nv, { extra: r.int(0, 1), loop: true, weighted: false }) : buildGraph(r, nv, { extra: 0, weighted: false });
      if (which === 'multi') g.edges.push({ a: g.edges[0].a, b: g.edges[0].b });
      return { q: T('Look at the network diagram. Does it contain a loop, does it contain a multiple/parallel edge, or is it a simple graph? State which, and name the vertex or vertices involved.', 'Lihat rajah rangkaian itu. Adakah ia mengandungi gelung, adakah ia mengandungi tepi berganda/selari, atau adakah ia graf ringkas? Nyatakan yang manakah, dan namakan bucu yang terlibat.'), fig: netFig(g, { weights: false }), a: (() => {
        if (hasLoop(g)) { const v = g.edges.find((e) => e.a === e.b).a; return T(`Loop at vertex ${LET[v]}`, `Gelung pada bucu ${LET[v]}`); }
        const mp = multiPairs(g);
        if (mp.length) { const [a, b] = mp[0].split('_').map(Number); return T(`Multiple edges between ${LET[a]} and ${LET[b]}`, `Tepi berganda antara ${LET[a]} dan ${LET[b]}`); }
        return T('Simple graph (no loops, no repeated edges)', 'Graf ringkas (tiada gelung, tiada tepi berulang)');
      })(), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(1, 2), directed: true, weighted: false });
      return { q: T('Is the diagram a directed graph or an undirected graph? Give a reason based on the diagram.', 'Adakah rajah itu graf berarah atau graf tak berarah? Berikan sebab berdasarkan rajah.'), fig: netFig(g, { weights: false }), a: T('Directed graph: every edge is drawn with an arrowhead showing a one-way connection.', 'Graf berarah: setiap tepi dilukis dengan kepala anak panah yang menunjukkan sambungan sehala.'), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 6), weighted = r.chance(), g = buildGraph(r, nv, { extra: r.int(1, 2), weighted }), c = r.pick(CTX);
      return { q: T(`The diagram shows a network of ${c.vp}. Is this a weighted graph or an unweighted graph?`, `Rajah menunjukkan rangkaian ${c.vm}. Adakah ini graf berpemberat atau graf tak berpemberat?`), fig: netFig(g), a: weighted ? T(`Weighted: every edge has a number (${c.u}) attached to it.`, `Berpemberat: setiap tepi mempunyai nombor (${c.u}) padanya.`) : T('Unweighted: the edges have no numbers attached.', 'Tak berpemberat: tepi tidak mempunyai sebarang nombor padanya.'), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(1, 2), directed: true, weighted: false }), v = r.int(0, nv - 1);
      return { q: T(`In the directed graph, how many edges point away FROM vertex ${LET[v]}?`, `Dalam graf berarah itu, berapakah bilangan tepi yang menuju KELUAR daripada bucu ${LET[v]}?`), fig: netFig(g, { weights: false }), a: T(`${outDeg(g, v)}`), sp: 'xs' };
    },
  ];
  const g52m = [
    (r) => {
      const c = r.pick([
        [T('vertices A, B, C; edges AB, BC, CA', 'bucu A, B, C; tepi AB, BC, CA'), true, T('No loops and no repeated edges.', 'Tiada gelung dan tiada tepi berulang.')],
        [T('vertices A, B, C; edges AB, BC, BC, CA', 'bucu A, B, C; tepi AB, BC, BC, CA'), false, T('The edge BC is repeated (multiple edges).', 'Tepi BC berulang (tepi berganda).')],
        [T('vertices A, B, C; edges AB, BC, CC', 'bucu A, B, C; tepi AB, BC, CC'), false, T('CC is a loop.', 'CC ialah satu gelung.')],
        [T('vertices P, Q, R, S; edges PQ, QR, RS, SP, PR', 'bucu P, Q, R, S; tepi PQ, QR, RS, SP, PR'), true, T('No loops and no repeated edges.', 'Tiada gelung dan tiada tepi berulang.')],
      ]);
      return { q: T(`A graph has ${c[0].en}. Is it a simple graph? Give a reason.`, `Sebuah graf mempunyai ${c[0].ms}. Adakah ia graf ringkas? Berikan sebab.`), a: T(`${c[1] ? 'Yes. ' : 'No. '}${c[2].en}`, `${c[1] ? 'Ya. ' : 'Tidak. '}${c[2].ms}`), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: 2, directed: true, weighted: false });
      const v = r.int(0, nv - 1);
      return { q: T(`In the directed graph, find the number of edges leaving vertex ${LET[v]} and the number of edges entering it.`, `Dalam graf berarah, cari bilangan tepi yang keluar dari bucu ${LET[v]} dan bilangan tepi yang masuk ke bucu itu.`), fig: netFig(g, { directed: true, weights: false }), a: T(`Out: ${outDeg(g, v)}; in: ${inDeg(g, v)}`, `Keluar: ${outDeg(g, v)}; masuk: ${inDeg(g, v)}`), sp: 's' };
    },
    (r) => {
      const s = r.pick(REAL_SCEN);
      return { q: T(`A network is to be built to record ${s.txt[0]}. Does this situation need a directed graph, a weighted graph, both, or neither? Explain briefly.`, `Satu rangkaian akan dibina untuk merekodkan ${s.txt[1]}. Adakah situasi ini memerlukan graf berarah, graf berpemberat, kedua-duanya, atau tiada satu pun? Terangkan secara ringkas.`), a: (() => {
        const parts = [];
        if (s.dir) parts.push(T('directed, because the connection has a one-way sense', 'berarah, kerana sambungan itu mempunyai makna sehala'));
        else parts.push(T('undirected, because the connection works the same way both ways', 'tak berarah, kerana sambungan itu berfungsi sama dalam kedua-dua arah'));
        if (s.wt) parts.push(T('weighted, because a numeric quantity must be recorded on each edge', 'berpemberat, kerana suatu kuantiti berangka mesti direkodkan pada setiap tepi'));
        else parts.push(T('unweighted, because no numeric quantity needs to be recorded', 'tak berpemberat, kerana tiada kuantiti berangka perlu direkodkan'));
        return T(parts.map((p) => p.en).join('; '), parts.map((p) => p.ms).join('; '));
      })(), sp: 'm' };
    },
    (r) => {
      const nv = r.int(4, 5), g1 = buildGraph(r, nv, { extra: r.int(0, 1), weighted: false }), c = r.pick(CTX);
      const g2 = { nv, edges: g1.edges.map((e) => ({ a: e.a, b: e.b })).concat([{ a: r.int(0, nv - 1), b: undefined }]) };
      g2.edges[g2.edges.length - 1].b = g2.edges[g2.edges.length - 1].a;
      const loopV = g2.edges[g2.edges.length - 1].a;
      return { q: T(`Two networks of the same ${nv} ${c.vp} are shown: Network 1 has edges ${edgeListStr(g1)}; Network 2 has the same edges plus a loop at ${LET[loopV]}. In the context of ${c.vp} and ${c.ep}, suggest what a loop at ${LET[loopV]} could mean.`, `Dua rangkaian bagi ${nv} buah ${c.vm} yang sama ditunjukkan: Rangkaian 1 mempunyai tepi ${edgeListStr(g1)}; Rangkaian 2 mempunyai tepi yang sama ditambah satu gelung pada ${LET[loopV]}. Dalam konteks ${c.vm} dan ${c.em}, cadangkan apakah maksud gelung pada ${LET[loopV]}.`), a: T(`A route that starts and ends at the same ${c.vs} ${LET[loopV]} (for example, a circular route or a local link that returns to itself).`, `Satu ${c.em} yang bermula dan berakhir pada ${c.vm} ${LET[loopV]} yang sama (contohnya, laluan bulatan atau pautan tempatan yang kembali kepada dirinya sendiri).`), sp: 'm' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(1, 2), weighted: false, multi: true });
      const dup = r.chance(0.7);
      if (dup) g.edges.push({ a: g.edges[0].a, b: g.edges[0].b });
      const rows = range(0, nv - 1).map((i) => [LET[i], ...range(0, nv - 1).map((j) => (i === j ? 0 : g.edges.filter((e) => (e.a === i && e.b === j) || (e.a === j && e.b === i)).length))]);
      return { q: T(`The table shows the number of direct edges between each pair of ${nv} vertices (0 = no edge). Does the graph have a multiple/parallel edge? If so, between which vertices?<br>${SPM.table(rows, { head: ['', ...LET.slice(0, nv).split('')], rowHead: true })}`, `Jadual menunjukkan bilangan tepi terus antara setiap pasangan ${nv} bucu (0 = tiada tepi). Adakah graf itu mempunyai tepi berganda/selari? Jika ada, antara bucu manakah?<br>${SPM.table(rows, { head: ['', ...LET.slice(0, nv).split('')], rowHead: true })}`), a: (() => {
        for (let i = 0; i < nv; i++) for (let j = i + 1; j < nv; j++) { const cnt = g.edges.filter((e) => (e.a === i && e.b === j) || (e.a === j && e.b === i)).length; if (cnt > 1) return T(`Yes, between ${LET[i]} and ${LET[j]} (${cnt} edges).`, `Ya, antara ${LET[i]} dan ${LET[j]} (${cnt} tepi).`); }
        return T('No, every pair has at most one edge.', 'Tidak, setiap pasangan mempunyai paling banyak satu tepi.');
      })(), sp: 's' };
    },
  ];
  const g52a = [
    (r) => {
      const nv = r.int(5, 6), g = buildGraph(r, nv, { extra: 2 }), c = r.pick(CTX);
      const ds = range(0, nv - 1).map((v) => degree(g, v));
      const mx = Math.max(...g.edges.map((e) => e.w)), me = g.edges.find((e) => e.w === mx);
      return { q: T(`The network is weighted (the numbers are ${c.u === 'RM' ? 'fares in RM' : c.u === 'min' ? 'times in minutes' : `distances in ${c.u}`} between ${c.vp}). List the degree of every vertex, and state which edge has the greatest weight.`, `Rangkaian ini berpemberat (nombor ialah ${c.u === 'RM' ? 'tambang dalam RM' : c.u === 'min' ? 'masa dalam minit' : `jarak dalam ${c.u}`} antara ${c.vm}). Senaraikan darjah setiap bucu, dan nyatakan tepi yang mempunyai pemberat terbesar.`), fig: netFig(g), a: T(`Degrees: ${ds.map((d, i) => LET[i] + ' = ' + d).join(', ')}; greatest weight ${LET[me.a]}${LET[me.b]} (${mx} ${c.u})`, `Darjah: ${ds.map((d, i) => LET[i] + ' = ' + d).join(', ')}; pemberat terbesar ${LET[me.a]}${LET[me.b]} (${mx} ${c.u})`), sp: 'm' };
    },
    (r) => {
      const nv = r.int(4, 6), g = buildGraph(r, nv, { extra: r.int(1, 2), directed: true, weighted: false });
      const ins = range(0, nv - 1).map((v) => inDeg(g, v)), outs = range(0, nv - 1).map((v) => outDeg(g, v));
      const src = range(0, nv - 1).filter((v) => ins[v] === 0);
      const sink = range(0, nv - 1).filter((v) => outs[v] === 0);
      return { q: T('In the directed graph, (a) list the in-degree and out-degree of every vertex, and (b) state whether any vertex has no edges entering it (nothing points to it) or no edges leaving it (it points to nothing).', 'Dalam graf berarah itu, (a) senaraikan darjah masuk dan darjah keluar setiap bucu, dan (b) nyatakan sama ada terdapat bucu yang tiada tepi masuk (tiada yang menuju kepadanya) atau tiada tepi keluar (ia tidak menuju ke mana-mana).'), fig: netFig(g, { weights: false }), a: T(`(a) ${range(0, nv - 1).map((v) => `${LET[v]}: in ${ins[v]}, out ${outs[v]}`).join('; ')}. (b) ${src.length ? `No edges in: ${src.map((v) => LET[v]).join(', ')}. ` : 'Every vertex has at least one edge in. '}${sink.length ? `No edges out: ${sink.map((v) => LET[v]).join(', ')}.` : 'Every vertex has at least one edge out.'}`, `(a) ${range(0, nv - 1).map((v) => `${LET[v]}: masuk ${ins[v]}, keluar ${outs[v]}`).join('; ')}. (b) ${src.length ? `Tiada tepi masuk: ${src.map((v) => LET[v]).join(', ')}. ` : 'Setiap bucu mempunyai sekurang-kurangnya satu tepi masuk. '}${sink.length ? `Tiada tepi keluar: ${sink.map((v) => LET[v]).join(', ')}.` : 'Setiap bucu mempunyai sekurang-kurangnya satu tepi keluar.'}`), sp: 'l' };
    },
    (r) => {
      const s = r.pick(REAL_SCEN), nv = r.int(4, 5);
      const g = buildGraph(r, nv, { extra: r.int(1, 2), directed: s.dir, weighted: s.wt, wlo: 2, whi: 30 });
      return { q: T(`A network is built to record ${s.txt[0]}. State, with a reason, whether it should use (i) directed or undirected edges, and (ii) weighted or unweighted edges. Then, for the diagram shown (built with your choices), find the degree${s.dir ? ' (in-degree and out-degree)' : ''} of vertex A.`, `Satu rangkaian dibina untuk merekodkan ${s.txt[1]}. Nyatakan, dengan sebab, sama ada ia perlu menggunakan (i) tepi berarah atau tak berarah, dan (ii) tepi berpemberat atau tak berpemberat. Kemudian, bagi rajah yang ditunjukkan (dibina mengikut pilihan anda), cari darjah${s.dir ? ' (darjah masuk dan darjah keluar)' : ''} bucu A.`), fig: netFig(g, { weights: s.wt }), a: T(`(i) ${s.dir ? 'Directed' : 'Undirected'}; (ii) ${s.wt ? 'Weighted' : 'Unweighted'}. Degree of A: ${s.dir ? `in ${inDeg(g, 0)}, out ${outDeg(g, 0)}` : degree(g, 0)}`, `(i) ${s.dir ? 'Berarah' : 'Tak berarah'}; (ii) ${s.wt ? 'Berpemberat' : 'Tak berpemberat'}. Darjah A: ${s.dir ? `masuk ${inDeg(g, 0)}, keluar ${outDeg(g, 0)}` : degree(g, 0)}`), sp: 'm' };
    },
    (r) => {
      const kind = r.pick(['simple-u', 'simple-w', 'dir-u', 'dir-w', 'loop', 'multi']);
      const nv = r.int(4, 5), c = r.pick(CTX);
      let g;
      if (kind === 'simple-u') g = buildGraph(r, nv, { extra: r.int(1, 2), weighted: false });
      else if (kind === 'simple-w') g = buildGraph(r, nv, { extra: r.int(1, 2), weighted: true });
      else if (kind === 'dir-u') g = buildGraph(r, nv, { extra: r.int(1, 2), directed: true, weighted: false });
      else if (kind === 'dir-w') g = buildGraph(r, nv, { extra: r.int(1, 2), directed: true, weighted: true });
      else if (kind === 'loop') { g = buildGraph(r, nv, { extra: r.int(0, 1), loop: true, weighted: false }); }
      else { g = buildGraph(r, nv, { extra: 0, weighted: false }); g.edges.push({ a: g.edges[0].a, b: g.edges[0].b }); }
      return { q: T(`The diagram is a network of ${c.vp}. State, with a reason for each: (i) is it simple, does it have a loop, or does it have a multiple edge; (ii) is it directed or undirected; (iii) is it weighted or unweighted?`, `Rajah ialah rangkaian ${c.vm}. Nyatakan, dengan sebab bagi setiap satu: (i) adakah ia ringkas, mempunyai gelung, atau mempunyai tepi berganda; (ii) adakah ia berarah atau tak berarah; (iii) adakah ia berpemberat atau tak berpemberat?`), fig: netFig(g, { weights: kind === 'simple-w' || kind === 'dir-w' }), a: (() => {
        const feat = hasLoop(g) ? T(`has a loop (at ${LET[g.edges.find((e) => e.a === e.b).a]})`, `mempunyai gelung (pada ${LET[g.edges.find((e) => e.a === e.b).a]})`) : multiPairs(g).length ? T('has a multiple edge', 'mempunyai tepi berganda') : T('simple', 'ringkas');
        const dir = g.directed ? T('directed (every edge has an arrowhead)', 'berarah (setiap tepi mempunyai kepala anak panah)') : T('undirected (no arrowheads)', 'tak berarah (tiada kepala anak panah)');
        const wt = kind === 'simple-w' || kind === 'dir-w' ? T('weighted (every edge has a number)', 'berpemberat (setiap tepi mempunyai nombor)') : T('unweighted (no numbers on the edges)', 'tak berpemberat (tiada nombor pada tepi)');
        return T(`(i) ${feat.en}; (ii) ${dir.en}; (iii) ${wt.en}`, `(i) ${feat.ms}; (ii) ${dir.ms}; (iii) ${wt.ms}`);
      })(), sp: 'm' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(1, 2), directed: true, weighted: true, wlo: 2, whi: 15 }), v = r.int(0, nv - 1), c = r.pick(CTX);
      const outE = g.edges.filter((e) => e.a === v);
      const tot = outE.reduce((s, e) => s + e.w, 0);
      return { q: T(`The directed, weighted network shows ${c.vp} where each edge weight is a ${c.u === 'RM' ? 'fare (RM)' : c.u === 'min' ? 'time (min)' : `distance (${c.u})`}. Find the out-degree of vertex ${LET[v]}, and the total weight of all edges leaving ${LET[v]}.`, `Rangkaian berarah dan berpemberat menunjukkan ${c.vm} dengan setiap pemberat tepi ialah ${c.u === 'RM' ? 'tambang (RM)' : c.u === 'min' ? 'masa (min)' : `jarak (${c.u})`}. Cari darjah keluar bucu ${LET[v]}, dan jumlah pemberat semua tepi yang keluar dari ${LET[v]}.`), fig: netFig(g), a: T(`Out-degree ${outE.length}; total weight ${tot} ${c.u}`, `Darjah keluar ${outE.length}; jumlah pemberat ${tot} ${c.u}`), sp: 's' };
    },
    (r) => {
      const s = r.pick(REAL_SCEN.filter((x) => x.dir)), nv = r.int(4, 5);
      const gGood = buildGraph(r, nv, { extra: r.int(1, 2), directed: true, weighted: false });
      const gBad = { nv: gGood.nv, edges: gGood.edges.map((e) => ({ a: e.a, b: e.b })), directed: false };
      return { q: T(`A network for "${s.txt[0]}" is drawn WITHOUT arrowheads (Network X, shown), even though the connections are one-way. Explain what information is lost by leaving out the arrowheads, and state whether $${LET[gGood.edges[0].a]} \\to ${LET[gGood.edges[0].b]}$ and $${LET[gGood.edges[0].b]} \\to ${LET[gGood.edges[0].a]}$ can be told apart in Network X.`, `Satu rangkaian bagi "${s.txt[1]}" dilukis TANPA kepala anak panah (Rangkaian X, ditunjukkan), walaupun sambungan itu bersifat sehala. Terangkan maklumat yang hilang apabila kepala anak panah ditinggalkan, dan nyatakan sama ada $${LET[gGood.edges[0].a]} \\to ${LET[gGood.edges[0].b]}$ dan $${LET[gGood.edges[0].b]} \\to ${LET[gGood.edges[0].a]}$ dapat dibezakan dalam Rangkaian X.`), fig: netFig(gBad, { weights: false }), a: T('The direction of each connection is lost; without arrowheads the diagram cannot show which way the connection goes, so the two directions cannot be told apart in Network X.', 'Arah setiap sambungan hilang; tanpa kepala anak panah, rajah tidak dapat menunjukkan ke arah mana sambungan itu, jadi kedua-dua arah tidak dapat dibezakan dalam Rangkaian X.'), sp: 'm' };
    },
  ];
  SPM.extend('F4-5.2', { e: g52e, m: g52m, a: g52a });

  /* ===================================================================== 5.3  Subgraphs and trees */
  function findCycle(g) {
    const adj = Array.from({ length: g.nv }, () => []);
    g.edges.forEach((e, k) => { adj[e.a].push([e.b, k]); adj[e.b].push([e.a, k]); });
    const parent = new Array(g.nv).fill(-1), visited = new Array(g.nv).fill(false);
    let cyc = null;
    (function dfs(u, pe) {
      visited[u] = true;
      for (const [v, k] of adj[u]) {
        if (k === pe) continue;
        if (visited[v]) { if (!cyc) { const path = [u]; let x = u; while (x !== v) { x = parent[x]; path.push(x); } cyc = path; } }
        else { parent[v] = u; dfs(v, k); }
      }
    })(0, -1);
    return cyc;
  }
  const g53e = [
    (r) => {
      const nv = r.int(4, 6), tree = r.chance(), c = r.pick(CTX);
      const g = tree ? buildGraph(r, nv, { extra: 0, weighted: false }) : buildGraph(r, nv, { extra: r.int(1, 2), weighted: false });
      return { q: T(`The diagram shows a network of ${c.vp}. Is this network a tree? Give a reason.`, `Rajah menunjukkan rangkaian ${c.vm}. Adakah rangkaian ini sebuah pokok? Berikan sebab.`), fig: netFig(g, { weights: false }), a: isTree(g) ? T(`Yes: it is connected and has no cycle (${nv} vertices, ${g.edges.length} edges).`, `Ya: ia bersambung dan tiada kitar (${nv} bucu, ${g.edges.length} tepi).`) : T(`No: it contains a cycle (${nv} vertices but ${g.edges.length} edges).`, `Tidak: ia mengandungi kitar (${nv} bucu tetapi ${g.edges.length} tepi).`), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 6), g = buildGraph(r, nv, { extra: 0, weighted: false });
      return { q: T('This network is a tree. How many edges does it have?', 'Rangkaian ini ialah sebuah pokok. Berapakah bilangan tepinya?'), fig: netFig(g, { weights: false }), a: T(`${g.edges.length}`), sp: 'xs' };
    },
    (r) => {
      const nv = r.int(5, 6), g = buildGraph(r, nv, { extra: r.int(1, 2), weighted: false }), c = r.pick(CTX);
      const sub = r.sample(range(0, nv - 1), r.int(3, nv - 1)).sort((x, y) => x - y);
      const subEdges = g.edges.filter((e) => sub.includes(e.a) && sub.includes(e.b));
      return { q: T(`The diagram shows a network of ${c.vp}. Is the set of vertices {${sub.map((v) => LET[v]).join(', ')}} together with all the marked (bold) edges between them a subgraph of the whole network? Give a reason.`, `Rajah menunjukkan rangkaian ${c.vm}. Adakah set bucu {${sub.map((v) => LET[v]).join(', ')}} berserta semua tepi (tebal) yang ditanda antaranya merupakan subgraf bagi keseluruhan rangkaian? Berikan sebab.`), fig: netFig(g, { weights: false, bold: subEdges.map((e) => g.edges.indexOf(e)) }), a: T('Yes: its vertices and edges are all taken from the original network.', 'Ya: semua bucu dan tepinya diambil daripada rangkaian asal.'), sp: 's' };
    },
    (r) => {
      const c = r.pick(CTX), stmts = [
        [T('every subgraph of a network must use every vertex of the original network', 'setiap subgraf bagi suatu rangkaian mesti menggunakan setiap bucu rangkaian asal'), false, T('a subgraph may use only some of the vertices (and edges) of the original network', 'subgraf boleh menggunakan hanya sebahagian bucu (dan tepi) rangkaian asal')],
        [T('a subgraph can only use edges that were already in the original network', 'subgraf hanya boleh menggunakan tepi yang telah sedia ada dalam rangkaian asal'), true, T('a subgraph is formed only from the vertices and edges already present in the network', 'subgraf dibentuk hanya daripada bucu dan tepi yang telah sedia ada dalam rangkaian')],
        [T('a tree is a type of subgraph that must contain a cycle', 'sebuah pokok ialah sejenis subgraf yang mesti mengandungi kitar'), false, T('a tree must be connected and must have NO cycle', 'sebuah pokok mesti bersambung dan mesti TIADA kitar')],
      ];
      const s = r.pick(stmts);
      return { q: T(`True or false, for a network of ${c.vp}: ${s[0].en}?`, `Benar atau palsu, bagi rangkaian ${c.vm}: ${s[0].ms}?`), a: T(`${s[1] ? 'True' : 'False'}: ${s[2].en}`, `${s[1] ? 'Benar' : 'Palsu'}: ${s[2].ms}`), sp: 's' };
    },
  ];
  const g53m = [
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: 2, weighted: false }), c = r.pick(CTX);
      return { q: T(`The network of ${c.vp} has a cycle. Remove edges to obtain a subgraph that is a tree containing all the vertices. Which edges do you keep?`, `Rangkaian ${c.vm} ini mempunyai kitar. Buang beberapa tepi untuk mendapatkan subgraf yang merupakan pokok yang mengandungi semua bucu. Tepi manakah yang anda kekalkan?`), fig: netFig(g, { weights: false }), a: (() => { const t = cheapestConnect({ nv, edges: g.edges.map((e) => ({ a: e.a, b: e.b, w: 1 })) }); return T(`One possible answer: ${t.used.map((k) => LET[g.edges[k].a] + LET[g.edges[k].b]).join(', ')} (${nv - 1} edges, connected, no cycle)`, `Satu jawapan yang mungkin: ${t.used.map((k) => LET[g.edges[k].a] + LET[g.edges[k].b]).join(', ')} (${nv - 1} tepi, bersambung, tiada kitar)`); })(), sp: 'm' };
    },
    (r) => {
      const nv = r.int(4, 6), g = buildGraph(r, nv, { extra: r.chance() ? 0 : r.int(1, 2), weighted: false }), c = r.pick(CTX);
      const conn = isConnected(g), tree = isTree(g);
      return { q: T(`For the network of ${c.vp} shown: (a) is it connected? (b) does it contain a cycle? (c) is it a tree?`, `Bagi rangkaian ${c.vm} yang ditunjukkan: (a) adakah ia bersambung? (b) adakah ia mengandungi kitar? (c) adakah ia sebuah pokok?`), fig: netFig(g, { weights: false }), a: T(`(a) ${conn ? 'Yes' : 'No'}; (b) ${g.edges.length >= nv ? 'Yes' : 'No'}; (c) ${tree ? 'Yes' : 'No'}`, `(a) ${conn ? 'Ya' : 'Tidak'}; (b) ${g.edges.length >= nv ? 'Ya' : 'Tidak'}; (c) ${tree ? 'Ya' : 'Tidak'}`), sp: 's' };
    },
    (r) => {
      const v = r.int(4, 7), e = v - r.pick([1, 2]);
      const treeCase = e === v - 1;
      return { q: T(`A network has ${v} vertices and ${e} edges. Is it definitely a tree? Explain your answer.`, `Sebuah rangkaian mempunyai ${v} bucu dan ${e} tepi. Adakah ia semestinya sebuah pokok? Terangkan jawapan anda.`), a: treeCase ? T(`Not necessarily just from the count: it is a tree only if it is also connected. If it is connected, then ${v} vertices and ${v - 1} edges must give a tree.`, `Bukan semestinya hanya daripada bilangan itu: ia sebuah pokok hanya jika ia juga bersambung. Jika ia bersambung, maka ${v} bucu dan ${v - 1} tepi mesti memberikan sebuah pokok.`) : T(`No: a tree with ${v} vertices must have exactly ${v - 1} edges, but this network has ${e}, so it cannot be a tree.`, `Tidak: sebuah pokok dengan ${v} bucu mesti mempunyai tepat ${v - 1} tepi, tetapi rangkaian ini mempunyai ${e}, jadi ia tidak boleh menjadi pokok.`), sp: 'm' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: 0, weighted: false }), c = r.pick(CTX), extraPair = retry(() => { const a = r.int(0, nv - 1), b = r.int(0, nv - 1); need(a !== b && !g.edges.some((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a))); return [a, b]; });
      const g2 = { nv, edges: g.edges.concat([{ a: extraPair[0], b: extraPair[1] }]), directed: false };
      return { q: T(`Network 1 is a tree of ${c.vp}. Network 2 adds one extra ${c.es}, ${LET[extraPair[0]]}${LET[extraPair[1]]}, to Network 1. Is Network 2 still a tree? Explain.`, `Rangkaian 1 ialah sebuah pokok bagi ${c.vm}. Rangkaian 2 menambah satu ${c.em} lagi, ${LET[extraPair[0]]}${LET[extraPair[1]]}, kepada Rangkaian 1. Adakah Rangkaian 2 masih sebuah pokok? Terangkan.`), fig: netFig(g2, { weights: false }), a: T(`No: adding an edge between two vertices already connected by the tree creates a cycle ${pathStr(findCycle(g2) || [extraPair[0], extraPair[1]])}, so Network 2 is no longer a tree.`, `Tidak: menambah satu tepi antara dua bucu yang telah bersambung dalam pokok itu mencipta satu kitar ${pathStr(findCycle(g2) || [extraPair[0], extraPair[1]])}, jadi Rangkaian 2 bukan lagi sebuah pokok.`), sp: 'm' };
    },
  ];
  const g53a = [
    (r) => {
      const nv = r.int(4, 6), g = buildGraph(r, nv, { extra: 1, weighted: false }), c = r.pick(CTX);
      const cyc = findCycle(g);
      return { q: T(`The network of ${c.vp} has exactly one cycle. (a) List the vertices on that cycle. (b) How many different trees (spanning all ${nv} vertices) can be obtained by removing exactly one edge from this network? Justify your count.`, `Rangkaian ${c.vm} ini mempunyai tepat satu kitar. (a) Senaraikan bucu pada kitar itu. (b) Berapakah bilangan pokok berbeza (merangkumi kesemua ${nv} bucu) yang boleh diperoleh dengan membuang tepat satu tepi daripada rangkaian ini? Justifikasikan jawapan anda.`), fig: netFig(g, { weights: false }), a: T(`(a) ${cyc.map((v) => LET[v]).join(', ')} (${cyc.length} vertices, ${cyc.length} edges on the cycle). (b) ${cyc.length}: removing any one of the ${cyc.length} cycle edges breaks the cycle and leaves a connected graph with ${nv - 1} edges, which is a tree; removing a non-cycle edge would disconnect the network.`, `(a) ${cyc.map((v) => LET[v]).join(', ')} (${cyc.length} bucu, ${cyc.length} tepi pada kitar). (b) ${cyc.length}: membuang mana-mana satu daripada ${cyc.length} tepi kitar itu memutuskan kitar dan meninggalkan graf bersambung dengan ${nv - 1} tepi, iaitu sebuah pokok; membuang tepi bukan-kitar akan memutuskan sambungan rangkaian.`), sp: 'l' };
    },
    (r) => {
      const nv = r.int(5, 6), g = buildGraph(r, nv, { extra: r.int(1, 2), weighted: false }), c = r.pick(CTX);
      const sub = r.sample(range(0, nv - 1), r.int(3, nv - 1)).sort((x, y) => x - y);
      const subEdges = g.edges.filter((e) => sub.includes(e.a) && sub.includes(e.b));
      const subG = { nv: sub.length, edges: subEdges.map((e) => ({ a: sub.indexOf(e.a), b: sub.indexOf(e.b) })) };
      const subTree = isTree(subG);
      return { q: T(`Consider only the vertices {${sub.map((v) => LET[v]).join(', ')}} of the ${c.vp} network and the edges between them. (a) Draw/describe this subgraph. (b) Is this subgraph a tree? Justify using connectivity and cycles.`, `Pertimbangkan hanya bucu {${sub.map((v) => LET[v]).join(', ')}} rangkaian ${c.vm} dan tepi antaranya. (a) Lukis/huraikan subgraf ini. (b) Adakah subgraf ini sebuah pokok? Justifikasikan menggunakan konektiviti dan kitar.`), fig: netFig(g, { weights: false, bold: subEdges.map((e) => g.edges.indexOf(e)) }), a: T(`(a) Vertices ${sub.map((v) => LET[v]).join(', ')}; edges ${subEdges.length ? subEdges.map((e) => LET[e.a] + LET[e.b]).join(', ') : 'none'}. (b) ${subTree ? `Yes: it is connected and has ${sub.length - 1} edges with no cycle.` : `No: ${isConnected(subG) ? 'it is connected but has a cycle (more than ' + (sub.length - 1) + ' edges).' : 'it is not connected (some of these vertices cannot reach each other using only these edges).'}`}`, `(a) Bucu ${sub.map((v) => LET[v]).join(', ')}; tepi ${subEdges.length ? subEdges.map((e) => LET[e.a] + LET[e.b]).join(', ') : 'tiada'}. (b) ${subTree ? `Ya: ia bersambung dan mempunyai ${sub.length - 1} tepi tanpa kitar.` : `Tidak: ${isConnected(subG) ? 'ia bersambung tetapi mempunyai kitar (lebih daripada ' + (sub.length - 1) + ' tepi).' : 'ia tidak bersambung (sesetengah bucu ini tidak dapat dicapai antara satu sama lain menggunakan tepi ini sahaja).'}`}`), sp: 'l' };
    },
  ];
  SPM.extend('F4-5.3', { e: g53e, m: g53m, a: g53a });

  /* ===================================================================== 5.4  Representing real information */
  const g54e2 = [
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(0, 1), weighted: false }), c = r.pick(CTX);
      const rows = range(0, nv - 1).map((i) => [LET[i], ...range(0, nv - 1).map((j) => (i === j ? '-' : g.edges.some((e) => (e.a === i && e.b === j) || (e.a === j && e.b === i)) ? 1 : 0))]);
      return { q: T(`The table shows which of ${nv} ${c.vp} are joined by a direct ${c.es} (1 = ${c.es}, 0 = none). Draw a network to represent this information.<br>${SPM.table(rows, { head: ['', ...LET.slice(0, nv).split('')], rowHead: true })}`, `Jadual menunjukkan ${c.vm} (daripada ${nv} buah) yang disambungkan oleh ${c.em} terus (1 = ada ${c.em}, 0 = tiada). Lukis rangkaian untuk mewakili maklumat ini.<br>${SPM.table(rows, { head: ['', ...LET.slice(0, nv).split('')], rowHead: true })}`), a: T(netFig(g, { weights: false }), netFig(g, { weights: false })), sp: 'xl' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(0, 1), weighted: false }), c = r.pick(CTX);
      const rows = range(0, nv - 1).map((i) => [LET[i], ...range(0, nv - 1).map((j) => (i === j ? '-' : g.edges.some((e) => (e.a === i && e.b === j) || (e.a === j && e.b === i)) ? '?' : ''))]);
      return { q: T(`The network diagram shows ${c.vp} joined by direct ${c.ep}. Complete the table (write 1 where two vertices are directly joined, leave blank otherwise) for the cells marked '?'.<br>${SPM.table(rows, { head: ['', ...LET.slice(0, nv).split('')], rowHead: true })}`, `Rajah rangkaian menunjukkan ${c.vm} yang disambungkan oleh ${c.em} terus. Lengkapkan jadual (tulis 1 jika dua bucu bersambung terus, biarkan kosong jika tidak) bagi sel yang bertanda '?'.<br>${SPM.table(rows, { head: ['', ...LET.slice(0, nv).split('')], rowHead: true })}`), fig: netFig(g, { weights: false }), a: (() => {
        const cells = [];
        for (let i = 0; i < nv; i++) for (let j = 0; j < nv; j++) if (i !== j && g.edges.some((e) => (e.a === i && e.b === j) || (e.a === j && e.b === i))) cells.push(`${LET[i]}${LET[j]} = 1`);
        return T(cells.join(', '));
      })(), sp: 'm' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(0, 1), weighted: false }), c = r.pick(CTX);
      const desc = edgeListStr(g);
      return { q: T(`A network of ${nv} ${c.vp} has the direct ${c.ep}: ${desc}. Draw the network.`, `Rangkaian ${nv} buah ${c.vm} mempunyai ${c.em} terus: ${desc}. Lukis rangkaian itu.`), a: T(netFig(g, { weights: false }), netFig(g, { weights: false })), sp: 'l' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(0, 1), weighted: false }), c = r.pick(CTX);
      const wrong = retry(() => { const a = r.int(0, nv - 1), b = r.int(0, nv - 1); need(a !== b && !g.edges.some((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a))); return [a, b]; });
      const trueEdges = edgeListStr(g);
      const badDesc = trueEdges + ', ' + LET[wrong[0]] + LET[wrong[1]];
      return { q: T(`A network of ${c.vp} is drawn in the diagram. A report claims the direct ${c.ep} are: ${badDesc}. Does the diagram match the report? If not, name the edge that is wrongly included.`, `Rangkaian ${c.vm} dilukis dalam rajah. Satu laporan mendakwa ${c.em} terus ialah: ${badDesc}. Adakah rajah itu sepadan dengan laporan? Jika tidak, namakan tepi yang tersalah dimasukkan.`), fig: netFig(g, { weights: false }), a: T(`No; the edge ${LET[wrong[0]]}${LET[wrong[1]]} is not in the diagram.`, `Tidak; tepi ${LET[wrong[0]]}${LET[wrong[1]]} tiada dalam rajah.`), sp: 's' };
    },
  ];
  const g54m2 = [
    (r) => {
      const nv = r.int(4, 5), c = r.pick(CTX), g = buildGraph(r, nv, { extra: r.int(0, 1), wlo: c.wlo, whi: c.whi });
      const desc = g.edges.map((e) => `${LET[e.a]}${LET[e.b]} = ${e.w} ${c.u}`).join(', ');
      return { q: T(`A network of ${nv} ${c.vp} has these direct ${c.ep}, with the ${c.u === 'RM' ? 'fare' : c.u === 'min' ? 'time' : 'distance'} in ${c.u} for each: ${desc}. Draw the weighted network.`, `Rangkaian ${nv} buah ${c.vm} mempunyai ${c.em} terus berikut, dengan ${c.u === 'RM' ? 'tambang' : c.u === 'min' ? 'masa' : 'jarak'} dalam ${c.u} bagi setiap satu: ${desc}. Lukis rangkaian berpemberat itu.`), a: T(netFig(g), netFig(g)), sp: 'xl' };
    },
    (r) => {
      const nv = r.int(4, 5), c = r.pick(CTX), g = buildGraph(r, nv, { extra: r.int(0, 1), wlo: c.wlo, whi: c.whi });
      const k = r.int(0, g.edges.length - 1), bad = g.edges[k].w + r.pick([-2, -1, 1, 2].filter((d) => g.edges[k].w + d > 0));
      const desc = g.edges.map((e, i) => `${LET[e.a]}${LET[e.b]} = ${i === k ? bad : e.w} ${c.u}`).join(', ');
      return { q: T(`The diagram shows a weighted network of ${c.vp}. A caption states: ${desc}. Compare the caption with the diagram and state which edge's weight is wrongly stated, with the correct value.`, `Rajah menunjukkan rangkaian berpemberat ${c.vm}. Satu keterangan menyatakan: ${desc}. Bandingkan keterangan itu dengan rajah dan nyatakan pemberat tepi manakah yang tersalah dinyatakan, berserta nilai yang betul.`), fig: netFig(g), a: T(`${LET[g.edges[k].a]}${LET[g.edges[k].b]} should be ${g.edges[k].w} ${c.u}, not ${bad} ${c.u}.`, `${LET[g.edges[k].a]}${LET[g.edges[k].b]} sepatutnya ${g.edges[k].w} ${c.u}, bukan ${bad} ${c.u}.`), sp: 's' };
    },
    (r) => {
      const s = r.pick(REAL_SCEN.filter((x) => x.dir)), nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(0, 1), directed: true, weighted: false });
      const gUndir = { nv, edges: g.edges.map((e) => ({ a: e.a, b: e.b })), directed: false };
      return { q: T(`A situation involves "${s.txt[0]}", which is one-way. A student draws the network WITHOUT arrowheads (shown). Explain why this network misrepresents the situation, and describe what should be added.`, `Satu situasi melibatkan "${s.txt[1]}", yang bersifat sehala. Seorang murid melukis rangkaian TANPA kepala anak panah (ditunjukkan). Terangkan mengapa rangkaian ini salah mewakili situasi itu, dan huraikan apa yang perlu ditambah.`), fig: netFig(gUndir, { weights: false }), a: T('It misrepresents the situation because it does not show which way each connection goes; arrowheads should be added to every edge to show the correct one-way direction.', 'Ia salah mewakili situasi itu kerana ia tidak menunjukkan ke arah mana setiap sambungan itu; kepala anak panah perlu ditambah pada setiap tepi untuk menunjukkan arah sehala yang betul.'), sp: 'm' };
    },
    (r) => {
      const nv = r.int(4, 5), c = r.pick(CTX), g = buildGraph(r, nv, { extra: r.int(0, 1), weighted: false, loop: true });
      const lv = g.edges.find((e) => e.a === e.b).a;
      const nonLoop = edgeListStr({ edges: g.edges.filter((e) => e.a !== e.b) });
      return { q: T(`A ${c.es} scheme includes a circular route that starts and ends at the same ${c.vs}, ${LET[lv]}, in addition to the direct connections listed: ${nonLoop}. Represent this fully as a network, including the circular route.`, `Skim ${c.em} merangkumi satu laluan bulatan yang bermula dan berakhir pada ${c.vm} yang sama, ${LET[lv]}, sebagai tambahan kepada sambungan terus yang disenaraikan: ${nonLoop}. Wakilkan ini sepenuhnya sebagai satu rangkaian, termasuk laluan bulatan itu.`), a: T(netFig(g, { weights: false }), netFig(g, { weights: false })), sp: 'l' };
    },
  ];
  SPM.extend('F4-5.4', { e: g54e2, m: g54m2 });

  /* ===================================================================== 5.5  Transport networks and maps */
  const PURP = [
    { en: 'finding how many times a passenger must change trains between two stations', ms: 'mengetahui berapa kali penumpang perlu bertukar kereta api antara dua stesen', best: 'net' },
    { en: 'estimating the true physical distance between two towns', ms: 'menganggarkan jarak fizikal sebenar antara dua buah bandar', best: 'map' },
    { en: 'locating a station relative to nearby landmarks', ms: 'mengesan kedudukan stesen berbanding mercu tanda berdekatan', best: 'map' },
    { en: 'seeing which stations are directly linked without a transfer', ms: 'melihat stesen yang disambungkan terus tanpa pertukaran', best: 'net' },
    { en: 'planning a bus route with the fewest stops', ms: 'merancang laluan bas dengan bilangan perhentian paling sedikit', best: 'net' },
    { en: 'understanding the true compass direction from one town to another', ms: 'memahami arah mata angin sebenar dari satu bandar ke bandar lain', best: 'map' },
    { en: 'reading the actual scaled size of a region', ms: 'membaca saiz sebenar berskala bagi sesuatu kawasan', best: 'map' },
    { en: 'seeing the route structure and transfer points clearly, without geographical clutter', ms: 'melihat struktur laluan dan titik pertukaran dengan jelas, tanpa kekusutan geografi', best: 'net' },
    { en: 'checking whether a road is straight or winding', ms: 'menyemak sama ada sesuatu jalan lurus atau berliku', best: 'map' },
    { en: 'listing every stop that a particular bus service passes through, in order', ms: 'menyenaraikan setiap perhentian yang dilalui oleh sesuatu perkhidmatan bas, mengikut turutan', best: 'net' },
  ];
  const g55e2 = [
    (r) => {
      const p = r.pick(PURP);
      return { q: T(`For the purpose of ${p.en}, is a schematic transport network diagram or a geographical map more suitable?`, `Bagi tujuan ${p.ms}, adakah rajah rangkaian pengangkutan skematik atau peta geografi lebih sesuai?`), a: p.best === 'net' ? T('A transport network diagram', 'Rajah rangkaian pengangkutan') : T('A geographical map', 'Peta geografi'), sp: 's' };
    },
    (r) => {
      const stmts = [
        [T('a transport network diagram is normally drawn to a fixed geographical scale', 'rajah rangkaian pengangkutan biasanya dilukis mengikut skala geografi yang tetap'), false],
        [T('a transport network diagram makes it easy to see which stations are directly connected', 'rajah rangkaian pengangkutan memudahkan kita melihat stesen yang bersambung terus'), true],
        [T('a geographical map always makes transfer points between routes easy to trace', 'peta geografi sentiasa memudahkan titik pertukaran antara laluan dikesan'), false],
        [T('the true compass direction between two places can normally be read from a geographical map', 'arah mata angin sebenar antara dua tempat biasanya boleh dibaca daripada peta geografi'), true],
      ];
      const s = r.pick(stmts);
      return { q: T(`True or false: ${s[0].en}.`, `Benar atau palsu: ${s[0].ms}.`), a: s[1] ? T('True') : T('False'), sp: 'xs' };
    },
    (r) => ({ q: T('State one feature that a geographical map shows but a schematic transport network diagram usually does not.', 'Nyatakan satu ciri yang ditunjukkan oleh peta geografi tetapi biasanya tidak ditunjukkan oleh rajah rangkaian pengangkutan skematik.'), a: T('True/scaled physical distance (or true compass direction, or real road shape/landmarks).', 'Jarak fizikal sebenar/berskala (atau arah mata angin sebenar, atau bentuk jalan/mercu tanda sebenar).'), sp: 's' }),
    (r) => ({ q: T('State one feature that a schematic transport network diagram shows clearly but a geographical map usually does not.', 'Nyatakan satu ciri yang ditunjukkan dengan jelas oleh rajah rangkaian pengangkutan skematik tetapi biasanya tidak ditunjukkan oleh peta geografi.'), a: T('Which stops/stations are directly connected and the route/transfer structure (without geographical clutter).', 'Perhentian/stesen yang disambungkan terus dan struktur laluan/pertukaran (tanpa kekusutan geografi).'), sp: 's' }),
    (r) => {
      const p = r.pick(PURP), opts = r.shuffle([T('a schematic transport network diagram'), T('a geographical map')]);
      const correct = p.best === 'net' ? T('a schematic transport network diagram') : T('a geographical map');
      const idx = opts[0].en === correct.en ? 0 : 1;
      return { q: T(`Which is better for ${p.en}: (A) ${opts[0].en} or (B) ${opts[1].en}?`, `Yang manakah lebih baik bagi ${p.ms}: (A) ${opts[0].en === 'a schematic transport network diagram' ? 'rajah rangkaian pengangkutan skematik' : 'peta geografi'} atau (B) ${opts[1].en === 'a schematic transport network diagram' ? 'rajah rangkaian pengangkutan skematik' : 'peta geografi'}?`), a: T(`(${LET[idx]}) ${correct.en}`, `(${LET[idx]}) ${idx === 0 ? (opts[0].en === 'a schematic transport network diagram' ? 'rajah rangkaian pengangkutan skematik' : 'peta geografi') : (opts[1].en === 'a schematic transport network diagram' ? 'rajah rangkaian pengangkutan skematik' : 'peta geografi')}`), sp: 's' };
    },
  ];
  const g55m2 = [
    (r) => {
      const p = r.pick(PURP);
      return { q: T(`A traveller wants help with: ${p.en}. Recommend a transport network diagram or a geographical map for this purpose, and give one reason.`, `Seorang pengembara memerlukan bantuan untuk: ${p.ms}. Cadangkan rajah rangkaian pengangkutan atau peta geografi bagi tujuan ini, dan berikan satu sebab.`), a: p.best === 'net' ? T('A transport network diagram, because it shows route structure and direct connections clearly, without unnecessary geographical detail.', 'Rajah rangkaian pengangkutan, kerana ia menunjukkan struktur laluan dan sambungan terus dengan jelas, tanpa perincian geografi yang tidak perlu.') : T('A geographical map, because it preserves true position, scale and/or direction, which a schematic diagram distorts.', 'Peta geografi, kerana ia mengekalkan kedudukan, skala dan/atau arah sebenar, yang mana rajah skematik mengherotkannya.'), sp: 'm' };
    },
    (r) => {
      const c = r.pick(CTX), nv = 4;
      const wShort = r.int(Math.round(c.whi * 0.7), c.whi), wLong = r.int(c.wlo, Math.max(c.wlo, Math.round(c.whi * 0.3)));
      need(wShort > wLong);
      const g = { nv, edges: [{ a: 0, b: 1, w: wShort }, { a: 1, b: 2, w: r.int(c.wlo, c.whi) }, { a: 2, b: 3, w: r.int(c.wlo, c.whi) }, { a: 3, b: 0, w: r.int(c.wlo, c.whi) }, { a: 0, b: 2, w: wLong }], directed: false };
      const what = c.u === 'RM' ? 'fare' : c.u === 'min' ? 'time' : 'distance';
      const whatMs = c.u === 'RM' ? 'tambang' : c.u === 'min' ? 'masa' : 'jarak';
      return { q: T(`In this schematic network of ${c.vp}, edge AB (between neighbouring vertices) is drawn shorter than edge AC (drawn across the diagram). Using the weights shown, which edge actually has the greater ${what}? Explain what this shows about reading a schematic network.`, `Dalam rangkaian skematik ${c.vm} ini, tepi AB (antara bucu bersebelahan) dilukis lebih pendek daripada tepi AC (dilukis merentasi rajah). Berdasarkan pemberat yang ditunjukkan, tepi manakah yang sebenarnya mempunyai ${whatMs} yang lebih besar? Terangkan apa yang ditunjukkan oleh ini tentang cara membaca rangkaian skematik.`), fig: netFig(g), a: T(`AB has the greater ${what} (${wShort} ${c.u}) even though it is drawn shorter than AC (${wLong} ${c.u}); a schematic network is not drawn to scale, so drawn length must not be used to judge the real ${what} — only the printed weight should be used.`, `AB mempunyai ${whatMs} yang lebih besar (${wShort} ${c.u}) walaupun ia dilukis lebih pendek daripada AC (${wLong} ${c.u}); rangkaian skematik tidak dilukis mengikut skala, jadi panjang lukisan tidak boleh digunakan untuk menilai ${whatMs} sebenar — hanya pemberat yang dicetak sepatutnya digunakan.`), sp: 'm' };
    },
    (r) => {
      const nv = r.int(4, 5), gA = buildGraph(r, nv, { extra: r.int(0, 1), weighted: false }), c = r.pick(CTX);
      const gB = buildGraph(r, nv, { extra: r.int(1, 2), weighted: false });
      const hopsA = allPaths(gA, 0, nv - 1).length ? allPaths(gA, 0, nv - 1)[0].path.length - 1 : null;
      const hopsB = allPaths(gB, 0, nv - 1).length ? allPaths(gB, 0, nv - 1)[0].path.length - 1 : null;
      need(hopsA !== null && hopsB !== null && hopsA !== hopsB);
      return { q: T(`Two candidate ${c.vp} networks connect the same points A to ${LET[nv - 1]}. Network 1: ${edgeListStr(gA)}. Network 2: ${edgeListStr(gB)}. For a passenger travelling from A to ${LET[nv - 1]}, which network needs fewer transfers (fewest edges used), and how many?`, `Dua rangkaian ${c.vm} calon menyambungkan titik yang sama A ke ${LET[nv - 1]}. Rangkaian 1: ${edgeListStr(gA)}. Rangkaian 2: ${edgeListStr(gB)}. Bagi seorang penumpang yang bermusafir dari A ke ${LET[nv - 1]}, rangkaian manakah yang memerlukan pertukaran yang lebih sedikit (bilangan tepi paling sedikit digunakan), dan berapakah bilangannya?`), a: hopsA < hopsB ? T(`Network 1, using ${hopsA} edge(s) (Network 2 needs ${hopsB}).`, `Rangkaian 1, menggunakan ${hopsA} tepi (Rangkaian 2 memerlukan ${hopsB}).`) : T(`Network 2, using ${hopsB} edge(s) (Network 1 needs ${hopsA}).`, `Rangkaian 2, menggunakan ${hopsB} tepi (Rangkaian 1 memerlukan ${hopsA}).`), sp: 'm' };
    },
    (r) => {
      const c = r.pick(CTX);
      return { q: T(`Give one advantage AND one limitation of using a schematic ${c.vs} network diagram instead of a geographical map when planning a journey through ${c.vp} connected by ${c.ep}.`, `Berikan satu kelebihan DAN satu batasan penggunaan rajah rangkaian skematik ${c.vm} berbanding peta geografi apabila merancang perjalanan melalui ${c.vm} yang disambungkan oleh ${c.em}.`), a: T('Advantage: it shows the route/connection structure and transfers clearly. Limitation: positions and edge lengths are distorted, so it cannot be used to judge true distance or direction.', 'Kelebihan: ia menunjukkan struktur laluan/sambungan dan pertukaran dengan jelas. Batasan: kedudukan dan panjang tepi diherotkan, jadi ia tidak boleh digunakan untuk menilai jarak atau arah sebenar.'), sp: 'm' };
    },
  ];
  const g55a2 = [
    (r) => {
      const c = r.pick(CTX.filter((x) => ['town', 'village', 'school', 'airport', 'delivery hub'].includes(x.vs))), p1 = r.pick(PURP.filter((x) => x.best === 'net')), p2 = r.pick(PURP.filter((x) => x.best === 'map'));
      return { q: T(`A ${c.vs} authority is deciding whether to publish a schematic network diagram or a geographical map of its ${c.ep}. (a) Which representation should it use for ${p1.en}? (b) Which should it use for ${p2.en}? (c) Explain, in general, why one representation cannot serve both purposes equally well.`, `Sebuah pihak berkuasa ${c.vm} sedang membuat keputusan sama ada untuk menerbitkan rajah rangkaian skematik atau peta geografi bagi ${c.em} mereka. (a) Perwakilan manakah patut digunakan bagi ${p1.ms}? (b) Perwakilan manakah patut digunakan bagi ${p2.ms}? (c) Terangkan, secara umum, mengapa satu perwakilan tidak dapat memenuhi kedua-dua tujuan itu dengan sama baik.`), a: T(`(a) A schematic network diagram. (b) A geographical map. (c) A network diagram is simplified to show connectivity clearly and so distorts true position/scale/direction, while a map preserves true position/scale/direction but can make route and transfer structure harder to see; each representation trades one kind of clarity for the other.`, `(a) Rajah rangkaian skematik. (b) Peta geografi. (c) Rajah rangkaian dipermudahkan untuk menunjukkan konektiviti dengan jelas dan oleh itu mengherotkan kedudukan/skala/arah sebenar, manakala peta mengekalkan kedudukan/skala/arah sebenar tetapi boleh menyukarkan struktur laluan dan pertukaran dilihat; setiap perwakilan menukar satu jenis kejelasan dengan yang lain.`), sp: 'l' };
    },
    (r) => {
      const c = r.pick(CTX), nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(1, 2), wlo: c.wlo, whi: c.whi });
      const ps = allPaths(g, 0, nv - 1);
      need(ps.length >= 2 && ps[0].cost < ps[1].cost);
      const fewestHops = ps.slice().sort((x, y) => x.path.length - y.path.length)[0];
      const cheapest = ps[0];
      return { q: T(`The weighted network shows ${c.vp} joined by ${c.ep} (weights in ${c.u}). (a) Which route from A to ${LET[nv - 1]} uses the fewest edges (fewest transfers)? (b) Which route has the least total ${c.u === 'RM' ? 'fare' : c.u === 'min' ? 'time' : 'distance'}? (c) Are these necessarily the same route? Explain using your answers.`, `Rangkaian berpemberat menunjukkan ${c.vm} yang disambungkan oleh ${c.em} (pemberat dalam ${c.u}). (a) Laluan manakah dari A ke ${LET[nv - 1]} yang menggunakan tepi paling sedikit (pertukaran paling sedikit)? (b) Laluan manakah yang mempunyai jumlah ${c.u === 'RM' ? 'tambang' : c.u === 'min' ? 'masa' : 'jarak'} paling rendah? (c) Adakah ini semestinya laluan yang sama? Terangkan menggunakan jawapan anda.`), fig: netFig(g), a: T(`(a) $${pathStr(fewestHops.path)}$ (${fewestHops.path.length - 1} edges). (b) $${pathStr(cheapest.path)}$ (${cheapest.cost} ${c.u}). (c) ${pathStr(fewestHops.path) === pathStr(cheapest.path) ? 'Yes, here they are the same route.' : 'No: the route with fewest transfers is not always the cheapest/shortest route, because a route with more edges can still have a lower total weight.'}`, `(a) $${pathStr(fewestHops.path)}$ (${fewestHops.path.length - 1} tepi). (b) $${pathStr(cheapest.path)}$ (${cheapest.cost} ${c.u}). (c) ${pathStr(fewestHops.path) === pathStr(cheapest.path) ? 'Ya, di sini kedua-duanya laluan yang sama.' : 'Tidak: laluan dengan pertukaran paling sedikit tidak semestinya laluan paling murah/pendek, kerana laluan dengan lebih banyak tepi masih boleh mempunyai jumlah pemberat yang lebih rendah.'}`), sp: 'l' };
    },
  ];
  SPM.extend('F4-5.5', { e: g55e2, m: g55m2, a: g55a2 });

  /* ===================================================================== 5.6  Optimal cost */
  const costWord = (u) => (u === 'RM' ? ['fare', 'tambang'] : u === 'min' ? ['time', 'masa'] : ['distance', 'jarak']);
  const g56e2 = [
    (r) => {
      const c = r.pick(CTX), nv = 4, g = buildGraph(r, nv, { extra: r.int(1, 2), wlo: c.wlo, whi: c.whi });
      const ps = allPaths(g, 0, nv - 1);
      need(ps.length >= 1);
      const p = r.pick(ps);
      const [w] = costWord(c.u);
      return { q: T(`The network shows ${c.vp} joined by ${c.ep}, with ${w} in ${c.u} marked on each edge. Find the total ${w} of the route $${pathStr(p.path)}$.`, `Rangkaian menunjukkan ${c.vm} yang disambungkan oleh ${c.em}, dengan ${costWord(c.u)[1]} dalam ${c.u} ditanda pada setiap tepi. Cari jumlah ${costWord(c.u)[1]} bagi laluan $${pathStr(p.path)}$.`), fig: netFig(g), a: T(`${p.cost} ${c.u}`), sp: 'xs' };
    },
    (r) => {
      const c = r.pick(CTX), nv = 4, g = buildGraph(r, nv, { extra: 1, wlo: c.wlo, whi: c.whi });
      const ps = allPaths(g, 0, nv - 1);
      need(ps.length >= 2 && ps[0].cost !== ps[1].cost);
      const [w] = costWord(c.u);
      return { q: T(`The network shows ${c.vp} with ${w} (${c.u}) on each edge. Between routes $${pathStr(ps[0].path)}$ and $${pathStr(ps[1].path)}$ from A to ${LET[nv - 1]}, which has the lower total ${w}?`, `Rangkaian menunjukkan ${c.vm} dengan ${costWord(c.u)[1]} (${c.u}) pada setiap tepi. Antara laluan $${pathStr(ps[0].path)}$ dan $${pathStr(ps[1].path)}$ dari A ke ${LET[nv - 1]}, yang manakah mempunyai jumlah ${costWord(c.u)[1]} yang lebih rendah?`), fig: netFig(g), a: T(`$${pathStr(ps[0].path)}$: ${ps[0].cost} ${c.u}; $${pathStr(ps[1].path)}$: ${ps[1].cost} ${c.u}. Lower: $${pathStr(ps[0].path)}$.`, `$${pathStr(ps[0].path)}$: ${ps[0].cost} ${c.u}; $${pathStr(ps[1].path)}$: ${ps[1].cost} ${c.u}. Lebih rendah: $${pathStr(ps[0].path)}$.`), sp: 'm' };
    },
    (r) => {
      const c = r.pick(CTX), [w] = costWord(c.u);
      const a1 = r.int(c.wlo, c.whi), a2 = r.int(c.wlo, c.whi), b1 = r.int(c.wlo, c.whi), b2 = r.int(c.wlo, c.whi);
      need(a1 + a2 !== b1 + b2);
      return { q: T(`Route P has two sections costing ${a1} ${c.u} and ${a2} ${c.u}. Route Q has two sections costing ${b1} ${c.u} and ${b2} ${c.u}. Which route has the lower total ${w}?`, `Laluan P mempunyai dua bahagian yang berkos ${a1} ${c.u} dan ${a2} ${c.u}. Laluan Q mempunyai dua bahagian yang berkos ${b1} ${c.u} dan ${b2} ${c.u}. Laluan manakah mempunyai jumlah ${costWord(c.u)[1]} yang lebih rendah?`), a: (a1 + a2 < b1 + b2) ? T(`P: ${a1 + a2} ${c.u} < Q: ${b1 + b2} ${c.u}. Route P.`, `P: ${a1 + a2} ${c.u} < Q: ${b1 + b2} ${c.u}. Laluan P.`) : T(`Q: ${b1 + b2} ${c.u} < P: ${a1 + a2} ${c.u}. Route Q.`, `Q: ${b1 + b2} ${c.u} < P: ${a1 + a2} ${c.u}. Laluan Q.`), sp: 's' };
    },
    (r) => {
      const c = r.pick(CTX), [w, wm] = costWord(c.u);
      const vals = r.sample(range(c.wlo, c.whi), 3);
      const mn = Math.min(...vals);
      return { q: T(`Three alternative routes between two ${c.vp} cost ${vals[0]} ${c.u}, ${vals[1]} ${c.u} and ${vals[2]} ${c.u} respectively. Which route should be chosen to minimise the total ${w}, and what is that ${w}?`, `Tiga laluan alternatif antara dua ${c.vm} berkos ${vals[0]} ${c.u}, ${vals[1]} ${c.u} dan ${vals[2]} ${c.u} masing-masing. Laluan manakah patut dipilih untuk meminimumkan jumlah ${wm}, dan berapakah ${wm} itu?`), a: T(`The route costing ${mn} ${c.u} (the smallest value).`, `Laluan yang berkos ${mn} ${c.u} (nilai terkecil).`), sp: 's' };
    },
    (r) => {
      const c = r.pick(CTX);
      return { q: T(`In an optimal-cost network problem, the weights represent ${c.u === 'RM' ? 'fares in RM' : c.u === 'min' ? 'times in minutes' : `distances in ${c.u}`}. What must you do to find the total cost of a route with several edges?`, `Dalam masalah kos optimum rangkaian, pemberat mewakili ${c.u === 'RM' ? 'tambang dalam RM' : c.u === 'min' ? 'masa dalam minit' : `jarak dalam ${c.u}`}. Apakah yang perlu anda lakukan untuk mencari jumlah kos bagi satu laluan dengan beberapa tepi?`), a: T('Add up the weights of every edge used along that route.', 'Tambahkan pemberat setiap tepi yang digunakan sepanjang laluan itu.'), sp: 's' };
    },
  ];
  const g56m2 = [
    (r) => {
      const c = r.pick(CTX), nv = 5, g = buildGraph(r, nv, { extra: r.int(2, 3), wlo: c.wlo, whi: c.whi });
      const ps = allPaths(g, 0, nv - 1);
      need(ps.length >= 3 && ps[0].cost < ps[1].cost);
      const [w] = costWord(c.u);
      return { q: T(`The network shows ${c.vp} with ${w} in ${c.u} on each edge. List all the routes from A to ${LET[nv - 1]} that do not visit any vertex twice, with their total ${w}. State which is cheapest, and by how much it beats the next cheapest.`, `Rangkaian menunjukkan ${c.vm} dengan ${costWord(c.u)[1]} dalam ${c.u} pada setiap tepi. Senaraikan semua laluan dari A ke ${LET[nv - 1]} yang tidak melawat mana-mana bucu dua kali, berserta jumlah ${costWord(c.u)[1]}. Nyatakan laluan yang paling murah, dan berapa banyak ia lebih murah daripada laluan kedua termurah.`), fig: netFig(g), a: T(`${ps.map((p) => `$${pathStr(p.path)}$: ${p.cost}`).join('; ')}. Cheapest: $${pathStr(ps[0].path)}$ (${ps[0].cost} ${c.u}), beating the next best by ${ps[1].cost - ps[0].cost} ${c.u}.`, `${ps.map((p) => `$${pathStr(p.path)}$: ${p.cost}`).join('; ')}. Paling murah: $${pathStr(ps[0].path)}$ (${ps[0].cost} ${c.u}), lebih murah ${ps[1].cost - ps[0].cost} ${c.u} berbanding pilihan kedua terbaik.`), sp: 'xl' };
    },
    (r) => {
      const c = r.pick(CTX), nv = 4;
      const [cr1, cr2] = r.shuffle([['distance', 'jarak', 'km', 3, 30], ['time', 'masa', 'min', 3, 40], ['fare', 'tambang', 'RM', 5, 80]]).slice(0, 2);
      const g = buildGraph(r, nv, { extra: r.int(1, 2), wlo: cr1[3], whi: cr1[4] });
      const g2 = { nv, edges: g.edges.map((e) => ({ a: e.a, b: e.b, w: r.int(cr2[3], cr2[4]) })), directed: false };
      const ps1 = allPaths(g, 0, nv - 1), ps2 = allPaths(g2, 0, nv - 1);
      need(ps1.length >= 2 && ps2.length >= 2);
      const same = pathStr(ps1[0].path) === pathStr(ps2[0].path);
      return { q: T(`The network of ${c.vp} joined by ${c.ep} is the same, but the cost can mean different things. Network 1 shows ${cr1[0]} in ${cr1[2]} (first figure); Network 2 shows ${cr2[0]} in ${cr2[2]} on the same edges (second figure). Find the cheapest route from A to ${LET[nv - 1]} under each criterion, and state whether the optimal route stays the same.`, `Rangkaian ${c.vm} yang disambungkan oleh ${c.em} adalah sama, tetapi kos boleh membawa maksud berbeza. Rangkaian 1 menunjukkan ${cr1[1]} dalam ${cr1[2]} (rajah pertama); Rangkaian 2 menunjukkan ${cr2[1]} dalam ${cr2[2]} pada tepi yang sama (rajah kedua). Cari laluan paling murah dari A ke ${LET[nv - 1]} bagi setiap kriteria, dan nyatakan sama ada laluan optimum kekal sama.`), fig: T(netFig(g) + netFig(g2), netFig(g) + netFig(g2)), a: T(`Network 1 (${cr1[0]}): $${pathStr(ps1[0].path)}$ (${ps1[0].cost} ${cr1[2]}). Network 2 (${cr2[0]}): $${pathStr(ps2[0].path)}$ (${ps2[0].cost} ${cr2[2]}). ${same ? 'The optimal route is the same under both criteria here.' : 'The optimal route changes: minimising one criterion does not automatically minimise the other.'}`, `Rangkaian 1 (${cr1[1]}): $${pathStr(ps1[0].path)}$ (${ps1[0].cost} ${cr1[2]}). Rangkaian 2 (${cr2[1]}): $${pathStr(ps2[0].path)}$ (${ps2[0].cost} ${cr2[2]}). ${same ? 'Laluan optimum adalah sama bagi kedua-dua kriteria di sini.' : 'Laluan optimum berubah: meminimumkan satu kriteria tidak semestinya meminimumkan kriteria yang lain.'}`), sp: 'l' };
    },
    (r) => {
      const c = r.pick(CTX), nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(1, 2), wlo: c.wlo, whi: c.whi });
      const t = cheapestConnect(g);
      return { q: T(`A company wants to connect all ${nv} ${c.vp} with ${c.ep} so that every ${c.vs} is linked (directly or indirectly) to every other. The weights show the ${costWord(c.u)[0]} (${c.u}) of each possible link. By comparing feasible choices, find a selection of links that connects everything at the least total ${costWord(c.u)[0]}, and state that cost.`, `Sebuah syarikat mahu menyambungkan kesemua ${nv} ${c.vm} dengan ${c.em} supaya setiap ${c.vm} bersambung (secara langsung atau tidak langsung) dengan setiap satu yang lain. Pemberat menunjukkan ${costWord(c.u)[1]} (${c.u}) bagi setiap kemungkinan sambungan. Dengan membandingkan pilihan yang boleh dilaksanakan, cari satu pilihan sambungan yang menyambungkan semuanya pada jumlah ${costWord(c.u)[1]} paling rendah, dan nyatakan kos itu.`), fig: netFig(g), a: T(`${t.used.map((k) => LET[g.edges[k].a] + LET[g.edges[k].b]).join(', ')}; total ${t.cost} ${c.u} (${nv - 1} links, every ${c.vs} connected, no unnecessary link).`, `${t.used.map((k) => LET[g.edges[k].a] + LET[g.edges[k].b]).join(', ')}; jumlah ${t.cost} ${c.u} (${nv - 1} sambungan, setiap ${c.vm} bersambung, tiada sambungan yang tidak perlu).`), sp: 'l' };
    },
    (r) => {
      const c = r.pick(CTX), nv = 4, g = buildGraph(r, nv, { extra: r.int(1, 2), wlo: c.wlo, whi: c.whi });
      const ps = allPaths(g, 0, nv - 1);
      need(ps.length >= 2);
      const claimIdx = r.chance() ? 0 : 1;
      const claim = ps[claimIdx];
      const isCheapest = claimIdx === 0;
      const [w] = costWord(c.u);
      return { q: T(`A student claims that $${pathStr(claim.path)}$ is the cheapest route from A to ${LET[nv - 1]} (total ${claim.cost} ${c.u}). List every route from A to ${LET[nv - 1]} with its total ${w}, and state whether the student is correct.`, `Seorang murid mendakwa $${pathStr(claim.path)}$ ialah laluan paling murah dari A ke ${LET[nv - 1]} (jumlah ${claim.cost} ${c.u}). Senaraikan setiap laluan dari A ke ${LET[nv - 1]} berserta jumlah ${costWord(c.u)[1]}, dan nyatakan sama ada murid itu betul.`), fig: netFig(g), a: T(`${ps.map((p) => `$${pathStr(p.path)}$: ${p.cost}`).join('; ')}. ${isCheapest ? 'Correct' : `Incorrect; the cheapest is $${pathStr(ps[0].path)}$ (${ps[0].cost} ${c.u})`}.`, `${ps.map((p) => `$${pathStr(p.path)}$: ${p.cost}`).join('; ')}. ${isCheapest ? 'Betul' : `Salah; yang paling murah ialah $${pathStr(ps[0].path)}$ (${ps[0].cost} ${c.u})`}.`), sp: 'l' };
    },
    (r) => {
      const c = r.pick(CTX), nv = 4, g = buildGraph(r, nv, { extra: r.int(1, 2), wlo: c.wlo, whi: c.whi });
      const ps = allPaths(g, 0, nv - 1);
      need(ps.length >= 2);
      const budget = ps[0].cost + r.int(0, Math.max(0, ps[1].cost - ps[0].cost - 1));
      const feasible = ps.some((p) => p.cost <= budget);
      const [w] = costWord(c.u);
      return { q: T(`The network shows ${c.vp} with ${w} (${c.u}) on each edge. A traveller has a budget of ${budget} ${c.u} for the journey from A to ${LET[nv - 1]}. List all routes with their total ${w}, and state whether the budget is enough for at least one route.`, `Rangkaian menunjukkan ${c.vm} dengan ${costWord(c.u)[1]} (${c.u}) pada setiap tepi. Seorang pengembara mempunyai bajet ${budget} ${c.u} untuk perjalanan dari A ke ${LET[nv - 1]}. Senaraikan semua laluan berserta jumlah ${costWord(c.u)[1]}, dan nyatakan sama ada bajet itu mencukupi untuk sekurang-kurangnya satu laluan.`), fig: netFig(g), a: T(`${ps.map((p) => `$${pathStr(p.path)}$: ${p.cost}`).join('; ')}. ${feasible ? `Yes, enough: $${pathStr(ps[0].path)}$ costs ${ps[0].cost} ${c.u} ≤ ${budget} ${c.u}.` : `No route fits within ${budget} ${c.u}.`}`, `${ps.map((p) => `$${pathStr(p.path)}$: ${p.cost}`).join('; ')}. ${feasible ? `Ya, mencukupi: $${pathStr(ps[0].path)}$ berkos ${ps[0].cost} ${c.u} ≤ ${budget} ${c.u}.` : `Tiada laluan yang muat dalam ${budget} ${c.u}.`}`), sp: 'l' };
    },
  ];
  const g56a2 = [
    (r) => {
      const c = r.pick(CTX), nv = r.int(5, 6), g = buildGraph(r, nv, { extra: r.int(2, 3), wlo: c.wlo, whi: c.whi });
      const ps = allPaths(g, 0, nv - 1);
      const limit = 3;
      need(ps.length >= 3 && ps.some((p) => p.path.length <= limit));
      const [w] = costWord(c.u);
      return { q: T(`The network shows ${c.vp} with ${w} (${c.u}) on each edge. (a) List every simple route from A to ${LET[nv - 1]} with its total ${w}. (b) State the cheapest route overall. (c) A new rule requires the route to use at most ${limit} vertices (at most 1 stop in between) — does the cheapest route from (b) still satisfy this, and if not, what is the cheapest route that does?`, `Rangkaian menunjukkan ${c.vm} dengan ${costWord(c.u)[1]} (${c.u}) pada setiap tepi. (a) Senaraikan setiap laluan ringkas dari A ke ${LET[nv - 1]} berserta jumlah ${costWord(c.u)[1]}. (b) Nyatakan laluan paling murah secara keseluruhan. (c) Satu peraturan baharu memerlukan laluan menggunakan paling banyak ${limit} bucu (paling banyak 1 perhentian di antaranya) — adakah laluan paling murah daripada (b) masih memenuhi ini, dan jika tidak, apakah laluan paling murah yang memenuhinya?`), fig: netFig(g), a: (() => {
        const ok = ps[0].path.length <= limit;
        const alt = ps.find((p) => p.path.length <= limit);
        return T(`(a) ${ps.map((p) => `$${pathStr(p.path)}$: ${p.cost}`).join('; ')}. (b) $${pathStr(ps[0].path)}$ (${ps[0].cost} ${c.u}). (c) ${ok ? `Yes, it uses ${ps[0].path.length} vertices.` : `No, it uses ${ps[0].path.length} vertices; the cheapest route within the limit is $${pathStr(alt.path)}$ (${alt.cost} ${c.u}).`}`, `(a) ${ps.map((p) => `$${pathStr(p.path)}$: ${p.cost}`).join('; ')}. (b) $${pathStr(ps[0].path)}$ (${ps[0].cost} ${c.u}). (c) ${ok ? `Ya, ia menggunakan ${ps[0].path.length} bucu.` : `Tidak, ia menggunakan ${ps[0].path.length} bucu; laluan paling murah dalam had itu ialah $${pathStr(alt.path)}$ (${alt.cost} ${c.u}).`}`);
      })(), sp: 'xl' };
    },
    (r) => {
      const c = r.pick(CTX), nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(1, 2), wlo: c.wlo, whi: c.whi });
      const t = cheapestConnect(g);
      const dropped = g.edges.map((e, k) => k).filter((k) => !t.used.includes(k));
      need(dropped.length >= 1);
      const dk = r.pick(dropped);
      const withExtra = t.cost + g.edges[dk].w;
      return { q: T(`Using the weighted network of ${c.vp} (${costWord(c.u)[0]} in ${c.u}), find the least total ${costWord(c.u)[0]} to connect all ${nv} ${c.vp}. Then explain why adding the extra link ${LET[g.edges[dk].a]}${LET[g.edges[dk].b]} (${g.edges[dk].w} ${c.u}) as well would raise the cost to ${withExtra} ${c.u} without providing any new connection.`, `Menggunakan rangkaian berpemberat ${c.vm} (${costWord(c.u)[1]} dalam ${c.u}), cari jumlah ${costWord(c.u)[1]} paling rendah untuk menyambungkan kesemua ${nv} ${c.vm}. Kemudian terangkan mengapa menambah sambungan tambahan ${LET[g.edges[dk].a]}${LET[g.edges[dk].b]} (${g.edges[dk].w} ${c.u}) juga akan menaikkan kos kepada ${withExtra} ${c.u} tanpa memberikan sebarang sambungan baharu.`), fig: netFig(g), a: T(`Least cost: ${t.used.map((k) => LET[g.edges[k].a] + LET[g.edges[k].b]).join(', ')}, total ${t.cost} ${c.u}. Adding ${LET[g.edges[dk].a]}${LET[g.edges[dk].b]} is unnecessary because ${LET[g.edges[dk].a]} and ${LET[g.edges[dk].b]} are already connected through the chosen links; the extra link only increases cost without connecting any new vertex.`, `Kos paling rendah: ${t.used.map((k) => LET[g.edges[k].a] + LET[g.edges[k].b]).join(', ')}, jumlah ${t.cost} ${c.u}. Menambah ${LET[g.edges[dk].a]}${LET[g.edges[dk].b]} adalah tidak perlu kerana ${LET[g.edges[dk].a]} dan ${LET[g.edges[dk].b]} telahpun bersambung melalui sambungan yang dipilih; sambungan tambahan itu hanya menaikkan kos tanpa menyambungkan sebarang bucu baharu.`), sp: 'l' };
    },
  ];
  SPM.extend('F4-5.6', { e: g56e2, m: g56m2, a: g56a2 });

  /* ===================================================================== 5.E  Formal graph results (enrichment) */
  const gEe2 = [
    (r) => {
      const nv = r.int(4, 6), g = buildGraph(r, nv, { extra: r.int(1, 3), weighted: false }), c = r.pick(CTX);
      const ds = range(0, nv - 1).map((v) => degree(g, v)), s = ds.reduce((a, b) => a + b, 0);
      const ph = r.pick([
        [T(`For the network of ${c.vp} shown, list the degree of every vertex, find the sum of all degrees, and compare it with twice the number of edges ($2 \\times ${g.edges.length}$).`, `Bagi rangkaian ${c.vm} yang ditunjukkan, senaraikan darjah setiap bucu, cari hasil tambah semua darjah, dan bandingkan dengan dua kali bilangan tepi ($2 \\times ${g.edges.length}$).`)],
        [T(`For the network of ${c.vp} shown, verify that the sum of the degrees of all vertices equals twice the number of edges.`, `Bagi rangkaian ${c.vm} yang ditunjukkan, sahkan bahawa hasil tambah darjah semua bucu adalah sama dengan dua kali bilangan tepi.`)],
      ]);
      return { q: T(`(Enrichment) ${ph[0].en}`, `(Pengayaan) ${ph[0].ms}`), fig: netFig(g, { weights: false }), a: T(`Degrees: ${ds.map((d, i) => LET[i] + '=' + d).join(', ')}; sum $= ${s}$; $2 \\times ${g.edges.length} = ${2 * g.edges.length}$. They are equal (the handshaking lemma).`, `Darjah: ${ds.map((d, i) => LET[i] + '=' + d).join(', ')}; hasil tambah $= ${s}$; $2 \\times ${g.edges.length} = ${2 * g.edges.length}$. Kedua-duanya sama (lema jabat tangan).`), sp: 'm' };
    },
    (r) => {
      const n2 = r.int(4, 9), c = r.pick(CTX);
      const ph = r.pick([
        [T(`A complete graph $K_{${n2}}$ has ${n2} vertices, each joined to every other vertex by exactly one edge. Find the degree of every vertex and the total number of edges.`, `Graf lengkap $K_{${n2}}$ mempunyai ${n2} bucu, setiap satu disambungkan kepada setiap bucu lain oleh tepat satu tepi. Cari darjah setiap bucu dan jumlah bilangan tepi.`)],
        [T(`A network of ${n2} ${c.vp} has a direct ${c.es} between every possible pair of ${c.vp} (this is the complete graph $K_{${n2}}$). State the degree of every vertex and find the total number of edges.`, `Rangkaian ${n2} buah ${c.vm} mempunyai ${c.em} terus antara setiap kemungkinan pasangan ${c.vm} (ini ialah graf lengkap $K_{${n2}}$). Nyatakan darjah setiap bucu dan cari jumlah bilangan tepi.`)],
      ]);
      return { q: T(`(Enrichment) ${ph[0].en}`, `(Pengayaan) ${ph[0].ms}`), a: T(`Degree of each vertex $= ${n2 - 1}$; number of edges $= \\dfrac{${n2}(${n2}-1)}{2} = ${(n2 * (n2 - 1)) / 2}$`), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 8), c = r.pick(CTX);
      const ph = r.pick([
        [T(`A network is a tree with ${nv} vertices. Using the rule "a tree has one fewer edge than vertices", state the number of edges.`, `Satu rangkaian ialah pokok dengan ${nv} bucu. Menggunakan peraturan "sebuah pokok mempunyai satu tepi kurang daripada bucu", nyatakan bilangan tepi.`)],
        [T(`A tree connects ${nv} ${c.vp} using ${c.ep}. Using the tree edge rule, state the number of ${c.ep} used.`, `Sebuah pokok menyambungkan ${nv} ${c.vm} menggunakan ${c.em}. Menggunakan peraturan tepi pokok, nyatakan bilangan ${c.em} yang digunakan.`)],
      ]);
      return { q: T(`(Enrichment) ${ph[0].en}`, `(Pengayaan) ${ph[0].ms}`), a: T(`${nv - 1}`), sp: 'xs' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(1, 2), directed: true, weighted: false }), c = r.pick(CTXD);
      const outs = range(0, nv - 1).map((v) => outDeg(g, v)), ins = range(0, nv - 1).map((v) => inDeg(g, v));
      const so = outs.reduce((a, b) => a + b, 0), si = ins.reduce((a, b) => a + b, 0);
      return { q: T(`(Enrichment) For the directed graph of ${c.vp} shown, find the sum of all out-degrees and the sum of all in-degrees. Compare both sums with the number of edges.`, `(Pengayaan) Bagi graf berarah ${c.vm} yang ditunjukkan, cari hasil tambah semua darjah keluar dan hasil tambah semua darjah masuk. Bandingkan kedua-dua hasil tambah dengan bilangan tepi.`), fig: netFig(g, { weights: false }), a: T(`Sum of out-degrees $= ${so}$; sum of in-degrees $= ${si}$; number of edges $= ${g.edges.length}$. All three are equal.`, `Hasil tambah darjah keluar $= ${so}$; hasil tambah darjah masuk $= ${si}$; bilangan tepi $= ${g.edges.length}$. Ketiga-tiganya sama.`), sp: 'm' };
    },
    (r) => {
      const nv = r.int(4, 6), g = buildGraph(r, nv, { extra: r.int(0, 2), weighted: false }), c = r.pick(CTX);
      const ds = range(0, nv - 1).map((v) => degree(g, v)).sort((a, b) => b - a);
      return { q: T(`(Enrichment) A network of ${nv} ${c.vp} is claimed to have degree sequence ${ds.join(', ')} (one value per vertex). One such network is shown. Verify that the sum of this sequence is even.`, `(Pengayaan) Satu rangkaian ${nv} buah ${c.vm} didakwa mempunyai jujukan darjah ${ds.join(', ')} (satu nilai bagi setiap bucu). Satu rangkaian sedemikian ditunjukkan. Sahkan bahawa hasil tambah jujukan ini adalah genap.`), fig: netFig(g, { weights: false }), a: T(`Sum $= ${ds.reduce((a, b) => a + b, 0)}$, which is even, as required for any graph's degree sequence.`, `Hasil tambah $= ${ds.reduce((a, b) => a + b, 0)}$, iaitu genap, seperti yang diperlukan bagi jujukan darjah mana-mana graf.`), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 8), c = r.pick(CTX);
      return { q: T(`(Enrichment) In a simple graph (no loops, no repeated edges) of ${nv} vertices representing ${c.vp}, what is the greatest possible degree a single vertex can have, and why?`, `(Pengayaan) Dalam graf ringkas (tiada gelung, tiada tepi berulang) dengan ${nv} bucu yang mewakili ${c.vm}, apakah darjah terbesar yang boleh dimiliki oleh satu bucu, dan mengapa?`), a: T(`${nv - 1}, because that vertex can be joined to at most every one of the other ${nv - 1} vertices (no loops or repeated edges allowed).`, `${nv - 1}, kerana bucu itu boleh disambungkan dengan paling banyak setiap satu daripada ${nv - 1} bucu lain (tiada gelung atau tepi berulang dibenarkan).`), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 6), g = buildGraph(r, nv, { extra: r.int(1, 2), weighted: false }), c = r.pick(CTX);
      const isComplete = g.edges.length === (nv * (nv - 1)) / 2 && isSimple(g);
      return { q: T(`(Enrichment) The diagram shows a network of ${nv} ${c.vp}. Is it a complete graph $K_{${nv}}$? Give a reason based on the number of edges.`, `(Pengayaan) Rajah menunjukkan rangkaian ${nv} buah ${c.vm}. Adakah ia graf lengkap $K_{${nv}}$? Berikan sebab berdasarkan bilangan tepi.`), fig: netFig(g, { weights: false }), a: isComplete ? T(`Yes: it has $\\dfrac{${nv}(${nv}-1)}{2} = ${g.edges.length}$ edges, so every pair of vertices is joined.`, `Ya: ia mempunyai $\\dfrac{${nv}(${nv}-1)}{2} = ${g.edges.length}$ tepi, jadi setiap pasangan bucu bersambung.`) : T(`No: $K_{${nv}}$ needs $\\dfrac{${nv}(${nv}-1)}{2} = ${(nv * (nv - 1)) / 2}$ edges, but this graph has only ${g.edges.length}.`, `Tidak: $K_{${nv}}$ memerlukan $\\dfrac{${nv}(${nv}-1)}{2} = ${(nv * (nv - 1)) / 2}$ tepi, tetapi graf ini hanya mempunyai ${g.edges.length}.`), sp: 's' };
    },
  ];
  const gEm2 = [
    (r) => {
      const nv = r.int(5, 6), g = buildGraph(r, nv, { extra: r.int(1, 2), weighted: false }), hide = r.int(0, nv - 1), c = r.pick(CTX);
      const ds = range(0, nv - 1).map((v) => degree(g, v));
      const known = ds.reduce((a, b) => a + b, 0) - ds[hide];
      return { q: T(`(Enrichment) A network of ${c.vp} has ${nv} vertices and ${g.edges.length} edges. The degrees of every vertex except ${LET[hide]} are: ${range(0, nv - 1).filter((v) => v !== hide).map((v) => `${LET[v]} = ${ds[v]}`).join(', ')}. Using the handshaking lemma (sum of degrees $= 2 \\times$ number of edges), find the degree of ${LET[hide]}.`, `(Pengayaan) Satu rangkaian ${c.vm} mempunyai ${nv} bucu dan ${g.edges.length} tepi. Darjah setiap bucu kecuali ${LET[hide]} ialah: ${range(0, nv - 1).filter((v) => v !== hide).map((v) => `${LET[v]} = ${ds[v]}`).join(', ')}. Menggunakan lema jabat tangan (hasil tambah darjah $= 2 \\times$ bilangan tepi), cari darjah ${LET[hide]}.`), a: T(`$2 \\times ${g.edges.length} - ${known} = ${2 * g.edges.length - known}$`), sp: 's' };
    },
    (r) => {
      const n2 = r.int(6, 15), grp = r.pick([['mathematics club', 'kelab matematik'], ['chess club', 'kelab catur'], ['class', 'kelas'], ['school committee', 'jawatankuasa sekolah'], ['badminton team', 'pasukan badminton']]);
      return { q: T(`(Enrichment) At a ${grp[0]} meeting, every one of the ${n2} members shakes hands with every other member exactly once. Modelling members as vertices of $K_{${n2}}$, find the total number of handshakes.`, `(Pengayaan) Pada satu mesyuarat ${grp[1]}, setiap seorang daripada ${n2} orang ahli berjabat tangan dengan setiap ahli lain tepat sekali. Dengan memodelkan ahli sebagai bucu $K_{${n2}}$, cari jumlah bilangan jabat tangan.`), a: T(`$\\dfrac{${n2}(${n2}-1)}{2} = ${(n2 * (n2 - 1)) / 2}$`), sp: 's' };
    },
    (r) => {
      const nv = r.int(5, 9), c = r.pick(CTX);
      return { q: T(`(Enrichment) A telecommunications company wants to connect ${nv} ${c.vp} using the minimum possible number of cables so that every ${c.vs} is connected (directly or indirectly), with no unnecessary cable. Using the rule that such a minimal connecting network is a tree, state the number of cables needed.`, `(Pengayaan) Sebuah syarikat telekomunikasi mahu menyambungkan ${nv} ${c.vm} menggunakan bilangan kabel paling minimum supaya setiap ${c.vm} bersambung (secara langsung atau tidak langsung), tanpa sebarang kabel yang tidak perlu. Menggunakan peraturan bahawa rangkaian penyambung minimum sebegini ialah sebuah pokok, nyatakan bilangan kabel yang diperlukan.`), a: T(`${nv - 1} (one fewer than the number of ${c.vp}, since a minimal connecting network is a tree)`, `${nv - 1} (satu kurang daripada bilangan ${c.vm}, kerana rangkaian penyambung minimum ialah sebuah pokok)`), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(1, 2), directed: true, weighted: false }), c = r.pick(CTXD);
      const so = range(0, nv - 1).reduce((s, v) => s + outDeg(g, v), 0);
      return { q: T(`(Enrichment) Explain, in general, why the sum of all out-degrees in a directed graph always equals the number of edges (not double). Illustrate using the directed graph of ${c.vp} shown, where the sum of out-degrees is ${so}.`, `(Pengayaan) Terangkan, secara umum, mengapa hasil tambah semua darjah keluar dalam graf berarah sentiasa sama dengan bilangan tepi (bukan dua kali ganda). Gambarkan menggunakan graf berarah ${c.vm} yang ditunjukkan, dengan hasil tambah darjah keluar ialah ${so}.`), fig: netFig(g, { weights: false }), a: T(`Each directed edge leaves exactly one vertex, so it is counted exactly once in the out-degree total; with ${g.edges.length} edges the sum of out-degrees is ${g.edges.length}, matching ${so} here.`, `Setiap tepi berarah keluar daripada tepat satu bucu, jadi ia dikira tepat sekali dalam jumlah darjah keluar; dengan ${g.edges.length} tepi, hasil tambah darjah keluar ialah ${g.edges.length}, sepadan dengan ${so} di sini.`), sp: 'm' };
    },
    (r) => {
      const which = r.pick(['mst', 'dij']);
      return which === 'mst'
        ? { q: T('(Enrichment, preview) A "minimum spanning tree" is a term used in later study. Based on its name, what problem do you think it solves for a weighted network?', '(Pengayaan, pratonton) "Pokok rentang minimum" ialah istilah yang digunakan dalam pembelajaran lanjutan. Berdasarkan namanya, apakah masalah yang anda fikir ia selesaikan bagi suatu rangkaian berpemberat?'), a: T('It finds a tree (connecting every vertex, no cycle) that has the smallest possible total weight among all such trees.', 'Ia mencari sebuah pokok (menyambungkan setiap bucu, tiada kitar) yang mempunyai jumlah pemberat paling kecil yang mungkin antara semua pokok sedemikian.'), sp: 's' }
        : { q: T("(Enrichment, preview) Dijkstra's algorithm is a named method studied beyond Form 4. Based on the optimal-cost ideas in this chapter, what problem do you think it is designed to solve?", "(Pengayaan, pratonton) Algoritma Dijkstra ialah satu kaedah bernama yang dipelajari selepas Tingkatan 4. Berdasarkan idea kos optimum dalam bab ini, apakah masalah yang anda fikir ia direka untuk selesaikan?"), a: T('It systematically finds the shortest/cheapest route from one starting vertex to every other vertex in a weighted network.', 'Ia mencari secara sistematik laluan paling pendek/murah dari satu bucu permulaan ke setiap bucu lain dalam rangkaian berpemberat.'), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 5), g = buildGraph(r, nv, { extra: r.int(1, 2), directed: true, weighted: false }), hide = r.int(0, nv - 1), c = r.pick(CTXD);
      const outs = range(0, nv - 1).map((v) => outDeg(g, v));
      const known = outs.reduce((a, b) => a + b, 0) - outs[hide];
      return { q: T(`(Enrichment) A directed graph of ${c.vp} has ${g.edges.length} edges in total. The out-degree of every vertex except ${LET[hide]} is: ${range(0, nv - 1).filter((v) => v !== hide).map((v) => `${LET[v]} = ${outs[v]}`).join(', ')}. Using the fact that the out-degrees of all vertices add up to the number of edges, find the out-degree of ${LET[hide]}.`, `(Pengayaan) Satu graf berarah ${c.vm} mempunyai jumlah ${g.edges.length} tepi. Darjah keluar setiap bucu kecuali ${LET[hide]} ialah: ${range(0, nv - 1).filter((v) => v !== hide).map((v) => `${LET[v]} = ${outs[v]}`).join(', ')}. Menggunakan fakta bahawa darjah keluar semua bucu berjumlah bilangan tepi, cari darjah keluar ${LET[hide]}.`), fig: netFig(g, { weights: false }), a: T(`${g.edges.length} - ${known} = ${g.edges.length - known}`), sp: 's' };
    },
  ];
  const gEa2 = [
    (r) => {
      const nv = r.int(5, 6), g = buildGraph(r, nv, { extra: r.int(1, 3), weighted: false }), c = r.pick(CTX);
      const ds = range(0, nv - 1).map((v) => degree(g, v)), s = ds.reduce((a, b) => a + b, 0);
      return { q: T(`(Enrichment) The diagram shows a network of ${c.vp}: (a) list the degree of every vertex; (b) find the sum of degrees; (c) explain, using the fact that every edge has exactly two ends, why this sum can never be an odd number, for ANY graph.`, `(Pengayaan) Rajah menunjukkan rangkaian ${c.vm}: (a) senaraikan darjah setiap bucu; (b) cari hasil tambah darjah; (c) terangkan, menggunakan fakta bahawa setiap tepi mempunyai tepat dua hujung, mengapa hasil tambah ini tidak boleh menjadi nombor ganjil, bagi MANA-MANA graf.`), fig: netFig(g, { weights: false }), a: T(`(a) ${ds.map((d, i) => LET[i] + '=' + d).join(', ')}. (b) ${s}. (c) Every edge adds exactly 1 to the degree of each of its two endpoints, so it adds exactly 2 to the total sum of degrees; adding a whole number of 2's can never give an odd total, so the sum of degrees is always even.`, `(a) ${ds.map((d, i) => LET[i] + '=' + d).join(', ')}. (b) ${s}. (c) Setiap tepi menambah tepat 1 kepada darjah setiap satu daripada dua hujungnya, jadi ia menambah tepat 2 kepada jumlah hasil tambah darjah; menambah beberapa nombor 2 tidak akan pernah memberikan jumlah ganjil, jadi hasil tambah darjah sentiasa genap.`), sp: 'l' };
    },
    (r) => {
      const nv = r.int(4, 7), c = r.pick(CTX);
      return { q: T(`(Enrichment) ${nv} ${c.vp} are each to be joined to every other by a direct ${c.es} (a complete graph $K_{${nv}}$). (a) State the degree of every vertex, with a reason. (b) Hence find the sum of all degrees. (c) Using the handshaking lemma, show this matches $2 \\times \\dfrac{${nv}(${nv}-1)}{2}$, the formula for the number of ${c.ep} needed.`, `(Pengayaan) ${nv} buah ${c.vm} masing-masing akan disambungkan kepada setiap satu yang lain oleh ${c.es} terus (graf lengkap $K_{${nv}}$). (a) Nyatakan darjah setiap bucu, berserta sebab. (b) Seterusnya cari hasil tambah semua darjah. (c) Menggunakan lema jabat tangan, tunjukkan ini sepadan dengan $2 \\times \\dfrac{${nv}(${nv}-1)}{2}$, formula bagi bilangan ${c.em} yang diperlukan.`), a: T(`(a) Each vertex has degree ${nv - 1}, because it is joined to every one of the other ${nv - 1} vertices. (b) Sum $= ${nv} \\times ${nv - 1} = ${nv * (nv - 1)}$. (c) $2 \\times \\dfrac{${nv}(${nv}-1)}{2} = ${nv}(${nv}-1) = ${nv * (nv - 1)}$, which matches the sum in (b).`, `(a) Setiap bucu mempunyai darjah ${nv - 1}, kerana ia disambungkan kepada setiap satu daripada ${nv - 1} bucu lain. (b) Hasil tambah $= ${nv} \\times ${nv - 1} = ${nv * (nv - 1)}$. (c) $2 \\times \\dfrac{${nv}(${nv}-1)}{2} = ${nv}(${nv}-1) = ${nv * (nv - 1)}$, yang sepadan dengan hasil tambah dalam (b).`), sp: 'l' };
    },
    (r) => {
      const nv = r.int(5, 7), g = buildGraph(r, nv, { extra: 0, weighted: false }), c = r.pick(CTX);
      return { q: T(`(Enrichment) A network of ${nv} ${c.vp} is a tree. (a) State the number of ${c.ep}, using the tree edge formula $|E| = |V| - 1$. (b) A cycle is now formed by adding one more ${c.es} between two ${c.vp} that were not already joined. State the new number of ${c.ep}, and explain why the network is no longer a tree.`, `(Pengayaan) Satu rangkaian ${nv} buah ${c.vm} ialah sebuah pokok. (a) Nyatakan bilangan ${c.em}, menggunakan formula tepi pokok $|E| = |V| - 1$. (b) Satu kitar kini dibentuk dengan menambah satu lagi ${c.em} antara dua ${c.vm} yang belum bersambung. Nyatakan bilangan ${c.em} yang baharu, dan terangkan mengapa rangkaian itu bukan lagi sebuah pokok.`), fig: netFig(g, { weights: false }), a: T(`(a) $|E| = ${nv} - 1 = ${nv - 1}$. (b) New number of edges $= ${nv}$; it is no longer a tree because it now has $|V|$ edges (one more than $|V|-1$), which creates a cycle, and a tree must have no cycle.`, `(a) $|E| = ${nv} - 1 = ${nv - 1}$. (b) Bilangan tepi baharu $= ${nv}$; ia bukan lagi sebuah pokok kerana ia kini mempunyai $|V|$ tepi (satu lebih daripada $|V|-1$), yang mencipta satu kitar, dan sebuah pokok mesti tiada kitar.`), sp: 'l' };
    },
    (r) => {
      const n2 = r.int(5, 8);
      return { q: T(`(Enrichment) In a complete graph $K_{${n2}}$, one vertex and all its edges are removed. (a) How many vertices remain? (b) Explain why the remaining graph is still complete (on the smaller vertex set). (c) Find the number of edges before and after the removal, and the number of edges removed.`, `(Pengayaan) Dalam graf lengkap $K_{${n2}}$, satu bucu berserta semua tepinya dibuang. (a) Berapakah bilangan bucu yang tinggal? (b) Terangkan mengapa graf yang tinggal masih lengkap (pada set bucu yang lebih kecil). (c) Cari bilangan tepi sebelum dan selepas pembuangan, dan bilangan tepi yang dibuang.`), a: T(`(a) ${n2 - 1}. (b) Every pair among the remaining ${n2 - 1} vertices was already joined in $K_{${n2}}$, and removing one vertex does not remove any edge between the others, so they remain pairwise joined. (c) Before: $\\dfrac{${n2}(${n2}-1)}{2} = ${(n2 * (n2 - 1)) / 2}$; after: $\\dfrac{${n2 - 1}(${n2 - 1}-1)}{2} = ${((n2 - 1) * (n2 - 2)) / 2}$; removed: ${(n2 * (n2 - 1)) / 2 - ((n2 - 1) * (n2 - 2)) / 2} (the degree of the removed vertex).`, `(a) ${n2 - 1}. (b) Setiap pasangan antara ${n2 - 1} bucu yang tinggal telahpun bersambung dalam $K_{${n2}}$, dan membuang satu bucu tidak membuang sebarang tepi antara bucu lain, jadi mereka kekal bersambung secara berpasangan. (c) Sebelum: $\\dfrac{${n2}(${n2}-1)}{2} = ${(n2 * (n2 - 1)) / 2}$; selepas: $\\dfrac{${n2 - 1}(${n2 - 1}-1)}{2} = ${((n2 - 1) * (n2 - 2)) / 2}$; dibuang: ${(n2 * (n2 - 1)) / 2 - ((n2 - 1) * (n2 - 2)) / 2} (darjah bucu yang dibuang).`), sp: 'l' };
    },
    (r) => {
      const nv = r.int(4, 6), c = r.pick(CTX), bad = r.chance();
      if (!bad) {
        const g = buildGraph(r, nv, { extra: r.int(0, 2), weighted: false });
        const ds = range(0, nv - 1).map((v) => degree(g, v)).sort((a, b) => b - a);
        const s = ds.reduce((a, b) => a + b, 0);
        return { q: T(`(Enrichment) A network of ${nv} ${c.vp} is claimed to have degree sequence ${ds.join(', ')}. Using the handshaking lemma, decide whether such a network is possible, and if so, exhibit one (the diagram shown).`, `(Pengayaan) Satu rangkaian ${nv} buah ${c.vm} didakwa mempunyai jujukan darjah ${ds.join(', ')}. Menggunakan lema jabat tangan, tentukan sama ada rangkaian sedemikian mungkin, dan jika ya, tunjukkan satu (rajah yang ditunjukkan).`), fig: netFig(g, { weights: false }), a: T(`Possible: the sum ${s} is even (as the handshaking lemma requires), and the network shown achieves it.`, `Mungkin: hasil tambah ${s} adalah genap (seperti yang dikehendaki oleh lema jabat tangan), dan rangkaian yang ditunjukkan mencapainya.`), sp: 'm' };
      }
      const g = buildGraph(r, nv, { extra: r.int(0, 2), weighted: false });
      const ds = range(0, nv - 1).map((v) => degree(g, v));
      const k = r.int(0, nv - 1);
      ds[k] += 1;
      const dsSorted = ds.slice().sort((a, b) => b - a), s = ds.reduce((a, b) => a + b, 0);
      return { q: T(`(Enrichment) A network of ${nv} ${c.vp} is claimed to have degree sequence ${dsSorted.join(', ')}. Using the handshaking lemma, decide whether such a network is possible.`, `(Pengayaan) Satu rangkaian ${nv} buah ${c.vm} didakwa mempunyai jujukan darjah ${dsSorted.join(', ')}. Menggunakan lema jabat tangan, tentukan sama ada rangkaian sedemikian mungkin.`), a: T(`Not possible: the sum is ${s}, which is odd. The handshaking lemma requires the sum of degrees of any graph to be even, so no such network can exist.`, `Tidak mungkin: hasil tambah ialah ${s}, iaitu ganjil. Lema jabat tangan memerlukan hasil tambah darjah mana-mana graf adalah genap, jadi rangkaian sedemikian tidak wujud.`), sp: 'm' };
    },
  ];
  SPM.extend('F4-5.E', { e: gEe2, m: gEm2, a: gEa2 });
})();
