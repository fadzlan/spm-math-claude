/* Inline-SVG figure helpers. All figures are generated from the same numbers as the question,
 * are monochrome-friendly (they print in black and white) and follow the page colour theme
 * through `currentColor`. */
(function (root) {
  'use strict';
  const SPM = root.SPM;
  const { n, round } = SPM;
  let uid = 0;

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const f2 = (v) => (Math.round(v * 100) / 100).toString();

  /* ---------------------------------------------------------- primitives */
  const S = {};
  S.wrap = (w, h, inner, alt) =>
    `<svg class="fig" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f2(w)} ${f2(h)}" width="${f2(w)}" height="${f2(h)}" role="img"` +
    ` aria-label="${esc(alt || 'figure')}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"` +
    ` font-family="'Latin Modern Roman','Times New Roman',serif" font-size="13">${inner}</svg>`;
  S.line = (x1, y1, x2, y2, o) => {
    o = o || {};
    return `<line x1="${f2(x1)}" y1="${f2(y1)}" x2="${f2(x2)}" y2="${f2(y2)}"${o.dash ? ' stroke-dasharray="4 3"' : ''}${o.w ? ` stroke-width="${o.w}"` : ''}${o.cls ? ` class="${o.cls}"` : ''}${o.op ? ` stroke-opacity="${o.op}"` : ''}/>`;
  };
  S.circle = (cx, cy, r, o) => {
    o = o || {};
    return `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(r)}"${o.fill ? ` fill="${o.fill}"` : ''}${o.op ? ` fill-opacity="${o.op}"` : ''}${o.dash ? ' stroke-dasharray="4 3"' : ''}${o.stroke ? ` stroke="${o.stroke}"` : ''}${o.w ? ` stroke-width="${o.w}"` : ''}/>`;
  };
  S.dot = (cx, cy, r) => `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${r || 3}" fill="currentColor" stroke="none"/>`;
  S.rect = (x, y, w, h, o) => {
    o = o || {};
    return `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}"${o.fill ? ` fill="${o.fill}"` : ''}${o.op ? ` fill-opacity="${o.op}"` : ''}${o.dash ? ' stroke-dasharray="4 3"' : ''}${o.stroke ? ` stroke="${o.stroke}"` : ''}${o.rx ? ` rx="${o.rx}"` : ''}/>`;
  };
  S.poly = (pts, o) => {
    o = o || {};
    const p = pts.map((q) => f2(q[0]) + ',' + f2(q[1])).join(' ');
    return o.open
      ? `<polyline points="${p}"${o.dash ? ' stroke-dasharray="4 3"' : ''}${o.w ? ` stroke-width="${o.w}"` : ''}/>`
      : `<polygon points="${p}"${o.fill ? ` fill="${o.fill}"` : ''}${o.op ? ` fill-opacity="${o.op}"` : ''}${o.dash ? ' stroke-dasharray="4 3"' : ''}${o.w ? ` stroke-width="${o.w}"` : ''}/>`;
  };
  S.path = (d, o) => {
    o = o || {};
    return `<path d="${d}"${o.fill ? ` fill="${o.fill}"` : ''}${o.op ? ` fill-opacity="${o.op}"` : ''}${o.dash ? ' stroke-dasharray="4 3"' : ''}${o.stroke ? ` stroke="${o.stroke}"` : ''}${o.w ? ` stroke-width="${o.w}"` : ''}/>`;
  };
  /** text; o.a = 'start'|'middle'|'end', o.i = italic, o.s = size, o.b = bold */
  S.text = (x, y, str, o) => {
    o = o || {};
    return `<text x="${f2(x)}" y="${f2(y)}" text-anchor="${o.a || 'middle'}" dominant-baseline="${o.base || 'central'}" fill="currentColor" stroke="none"${o.i ? ' font-style="italic"' : ''}${o.b ? ' font-weight="bold"' : ''}${o.s ? ` font-size="${o.s}"` : ''}${o.rot ? ` transform="rotate(${o.rot} ${f2(x)} ${f2(y)})"` : ''}>${esc(str)}</text>`;
  };
  /** stacked fraction label centred at x,y */
  S.fracText = (x, y, nu, de, o) => {
    o = o || {};
    const s = o.s || 12;
    const w = Math.max(String(nu).length, String(de).length) * s * 0.6 + 4;
    return (
      S.text(x, y - s * 0.62, nu, { s }) +
      `<line x1="${f2(x - w / 2)}" y1="${f2(y)}" x2="${f2(x + w / 2)}" y2="${f2(y)}" stroke-width="1"/>` +
      S.text(x, y + s * 0.68, de, { s })
    );
  };
  /** label which may be a string or {n,d} (stacked fraction) */
  S.label = (x, y, v, o) => (v && typeof v === 'object' ? S.fracText(x, y, v.n, v.d, o) : S.text(x, y, v, o));
  /** arrow head at (x2,y2) pointing from (x1,y1) */
  S.arrow = (x1, y1, x2, y2, o) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const L = 7;
    const p1 = [x2 - L * Math.cos(a - 0.4), y2 - L * Math.sin(a - 0.4)];
    const p2 = [x2 - L * Math.cos(a + 0.4), y2 - L * Math.sin(a + 0.4)];
    return S.line(x1, y1, x2, y2, o) + `<polygon points="${f2(x2)},${f2(y2)} ${f2(p1[0])},${f2(p1[1])} ${f2(p2[0])},${f2(p2[1])}" fill="currentColor" stroke="none"/>`;
  };
  /** right-angle marker at vertex P between directions to A and B */
  S.rightAngle = (P, A, B, size) => {
    size = size || 9;
    const ua = unit(A[0] - P[0], A[1] - P[1]);
    const ub = unit(B[0] - P[0], B[1] - P[1]);
    const p1 = [P[0] + ua[0] * size, P[1] + ua[1] * size];
    const p3 = [P[0] + ub[0] * size, P[1] + ub[1] * size];
    const p2 = [p1[0] + ub[0] * size, p1[1] + ub[1] * size];
    return S.poly([p1, p2, p3], { open: true, w: 1 });
  };
  const unit = (dx, dy) => {
    const l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  };
  /** angle arc at P from direction to A towards direction to B (shortest way), radius r */
  S.arc = (P, A, B, r, label, o) => {
    o = o || {};
    const a1 = Math.atan2(A[1] - P[1], A[0] - P[0]);
    let a2 = Math.atan2(B[1] - P[1], B[0] - P[0]);
    let d = a2 - a1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    a2 = a1 + d;
    const x1 = P[0] + r * Math.cos(a1),
      y1 = P[1] + r * Math.sin(a1),
      x2 = P[0] + r * Math.cos(a2),
      y2 = P[1] + r * Math.sin(a2);
    const large = Math.abs(d) > Math.PI ? 1 : 0;
    const sweep = d > 0 ? 1 : 0;
    let out = `<path d="M${f2(x1)},${f2(y1)} A${f2(r)},${f2(r)} 0 ${large} ${sweep} ${f2(x2)},${f2(y2)}" stroke-width="1"/>`;
    if (label !== undefined && label !== null && label !== '') {
      const mid = a1 + d / 2;
      const lr = r + (o.gap === undefined ? 12 : o.gap);
      out += S.text(P[0] + lr * Math.cos(mid), P[1] + lr * Math.sin(mid), label, { s: o.s || 12 });
    }
    return out;
  };
  /** small tick marks across a segment (equal-length marks) */
  S.tick = (A, B, k) => {
    k = k || 1;
    const mx = (A[0] + B[0]) / 2,
      my = (A[1] + B[1]) / 2;
    const u = unit(B[0] - A[0], B[1] - A[1]);
    const nx = -u[1],
      ny = u[0];
    let out = '';
    for (let i = 0; i < k; i++) {
      const off = (i - (k - 1) / 2) * 4;
      const cx = mx + u[0] * off,
        cy = my + u[1] * off;
      out += S.line(cx - nx * 4, cy - ny * 4, cx + nx * 4, cy + ny * 4, { w: 1 });
    }
    return out;
  };
  S.pointLabel = (P, str, dx, dy, o) => S.text(P[0] + dx, P[1] + dy, str, Object.assign({ i: true }, o || {}));
  /** place a label pushed outward from centre C away by `d` */
  S.outLabel = (P, C, str, d) => {
    const u = unit(P[0] - C[0], P[1] - C[1]);
    return S.text(P[0] + u[0] * (d || 12), P[1] + u[1] * (d || 12), str, { i: true });
  };
  /** label at the middle of segment, pushed off to the side away from C */
  S.sideLabel = (A, B, C, str, d) => {
    const mx = (A[0] + B[0]) / 2,
      my = (A[1] + B[1]) / 2;
    const u = unit(mx - C[0], my - C[1]);
    return S.text(mx + u[0] * (d || 12), my + u[1] * (d || 12), str);
  };
  S.dim = (x1, y1, x2, y2) => S.line(x1, y1, x2, y2, { w: 0.8 });

  /* -------------------------------------------------------- number lines */
  /**
   * o = { min, max, step, labels: 'all' | array of values | fn(v)->label|null, points:[{v,label,hollow}],
   *       width, fmt: fn(v)->string|{n,d}, arrowL, arrowR, vertical }
   */
  S.numberLine = (o) => {
    const W = o.width || 360;
    const pad = 22;
    const H = o.points && o.points.length ? 62 : 50;
    const y0 = o.points && o.points.length ? 36 : 22;
    const span = o.max - o.min;
    const sx = (v) => pad + ((v - o.min) / span) * (W - 2 * pad);
    const fmt = o.fmt || ((v) => n(v));
    let out = S.arrow(pad - 14, y0, W - pad + 14, y0);
    out += S.arrow(pad + 14, y0, pad - 14, y0).replace(/^/, '');
    const nt = Math.round(span / o.step);
    for (let i = 0; i <= nt; i++) {
      const v = round(o.min + i * o.step, 8);
      const x = sx(v);
      out += S.line(x, y0 - 4, x, y0 + 4, { w: 1 });
      let lab;
      if (o.labels === 'all' || o.labels === undefined) lab = fmt(v);
      else if (Array.isArray(o.labels)) lab = o.labels.some((q) => Math.abs(q - v) < 1e-9) ? fmt(v) : null;
      else if (typeof o.labels === 'function') lab = o.labels(v);
      if (lab !== null && lab !== undefined) out += S.label(x, y0 + (lab && typeof lab === 'object' ? 20 : 16), lab, { s: 11 });
    }
    for (const p of o.points || []) {
      const x = sx(p.v);
      out += S.circle(x, y0, 3.6, { fill: p.hollow ? 'var(--bg,#fff)' : 'currentColor' });
      if (p.label) out += S.text(x, y0 - 15, p.label, { i: true, b: true });
      if (p.ray) out += S.arrow(x + (p.ray > 0 ? 4 : -4), y0 - 9, x + p.ray * 34, y0 - 9);
    }
    return S.wrap(W, H + 6, out, 'number line');
  };

  /* --------------------------------------------------- Cartesian plane */
  /**
   * o = { x:[min,max], y:[min,max], scale, pts:[{x,y,l,dx,dy,hollow}], polys:[{p:[[x,y]...], open, dash, fill}],
   *       segs:[{a,b,dash}], lines:[{m,c,dash}], vlines:[x], curves:[{f, from,to, dash}],
   *       labelStep, grid, noNumbers, extra: (m)=>svgstring }
   */
  S.plane = (o) => {
    const sc = o.scale || 22;
    const [x0, x1] = o.x;
    const [y0, y1] = o.y;
    const padL = 22,
      padR = 20,
      padT = 16,
      padB = 22;
    const W = (x1 - x0) * sc + padL + padR;
    const H = (y1 - y0) * sc + padT + padB;
    const sx = (x) => padL + (x - x0) * sc;
    const sy = (y) => padT + (y1 - y) * sc;
    let out = '';
    if (o.grid !== false) {
      for (let x = Math.ceil(x0); x <= x1; x++) out += S.line(sx(x), sy(y0), sx(x), sy(y1), { w: 0.5, op: 0.25 });
      for (let y = Math.ceil(y0); y <= y1; y++) out += S.line(sx(x0), sy(y), sx(x1), sy(y), { w: 0.5, op: 0.25 });
    }
    // axes through origin if within window else at border
    const ax = x0 <= 0 && x1 >= 0 ? 0 : x0;
    const ay = y0 <= 0 && y1 >= 0 ? 0 : y0;
    out += S.arrow(sx(x0) - 4, sy(ay), sx(x1) + 12, sy(ay), { w: 1.2 });
    out += S.arrow(sx(ax), sy(y0) + 4, sx(ax), sy(y1) - 12, { w: 1.2 });
    out += S.text(sx(x1) + 12, sy(ay) + 10, 'x', { i: true, s: 12 });
    out += S.text(sx(ax) + 9, sy(y1) - 12, 'y', { i: true, s: 12 });
    if (!o.noNumbers) {
      const st = o.labelStep || 1;
      for (let x = Math.ceil(x0); x <= x1; x++)
        if (x !== 0 && x % st === 0) out += S.text(sx(x), sy(ay) + 11, n(x), { s: 10 });
      for (let y = Math.ceil(y0); y <= y1; y++)
        if (y !== 0 && y % st === 0) out += S.text(sx(ax) - 9, sy(y), n(y), { s: 10 });
      if (ax === 0 && ay === 0) out += S.text(sx(0) - 8, sy(0) + 10, 'O', { s: 10 });
    }
    for (const c of o.curves || []) {
      const from = c.from === undefined ? x0 : c.from;
      const to = c.to === undefined ? x1 : c.to;
      let seg = [];
      const flush = () => {
        if (seg.length > 1) out += S.poly(seg, { open: true, dash: c.dash, w: 1.6 });
        seg = [];
      };
      for (let x = from; x <= to + 1e-9; x += (to - from) / 160) {
        const y = c.f(x);
        if (Number.isFinite(y) && y >= y0 - 0.3 && y <= y1 + 0.3) seg.push([sx(x), sy(y)]);
        else flush();
      }
      flush();
    }
    // linear inequalities: boundary lines (dashed when strict) and the shaded feasible region
    if (o.ineqs && o.ineqs.length) {
      const win = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      const clipHalf = (poly, q) => {
        const f = (p) => q.a * p[0] + q.b * p[1] - q.c;
        const keep = (v) => (q.op[0] === '>' ? v >= -1e-9 : v <= 1e-9);
        const res = [];
        for (let i = 0; i < poly.length; i++) {
          const A = poly[i], B = poly[(i + 1) % poly.length];
          const fa = f(A), fb = f(B);
          if (keep(fa)) res.push(A);
          if ((fa > 1e-9 && fb < -1e-9) || (fa < -1e-9 && fb > 1e-9)) {
            const t = fa / (fa - fb);
            res.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]);
          }
        }
        return res;
      };
      if (o.shade) {
        let poly = win;
        for (const q of o.ineqs) poly = clipHalf(poly, q);
        if (poly.length > 2) out += S.poly(poly.map((p) => [sx(p[0]), sy(p[1])]), { fill: 'currentColor', op: 0.18, w: 0.1 });
      }
      for (const q of o.ineqs) {
        const pts2 = [];
        if (q.b !== 0) for (const x of [x0, x1]) { const y = (q.c - q.a * x) / q.b; if (y >= y0 - 1e-9 && y <= y1 + 1e-9) pts2.push([x, y]); }
        if (q.a !== 0) for (const y of [y0, y1]) { const x = (q.c - q.b * y) / q.a; if (x >= x0 - 1e-9 && x <= x1 + 1e-9) pts2.push([x, y]); }
        if (pts2.length >= 2) out += S.line(sx(pts2[0][0]), sy(pts2[0][1]), sx(pts2[1][0]), sy(pts2[1][1]), { dash: q.op.length === 1, w: 1.6 });
      }
    }
    for (const l of o.lines || []) {
      // y = m x + c, clipped to the window
      const ptsX = [x0, x1].map((x) => [x, l.m * x + l.c]);
      let a = ptsX[0],
        b = ptsX[1];
      const clip = (p, q) => {
        // clip p towards q into y-range
        if (p[1] > y1) return [p[0] + ((y1 - p[1]) / (q[1] - p[1])) * (q[0] - p[0]), y1];
        if (p[1] < y0) return [p[0] + ((y0 - p[1]) / (q[1] - p[1])) * (q[0] - p[0]), y0];
        return p;
      };
      a = clip(a, b);
      b = clip(b, a);
      out += S.line(sx(a[0]), sy(a[1]), sx(b[0]), sy(b[1]), { dash: l.dash, w: 1.6 });
      if (l.label) out += S.text(sx(b[0]) - 14, sy(b[1]) + 8, l.label, { i: true, s: 11 });
    }
    for (const v of o.vlines || []) out += S.line(sx(v.x === undefined ? v : v.x), sy(y0), sx(v.x === undefined ? v : v.x), sy(y1), { dash: v.dash, w: 1.6 });
    for (const p of o.polys || []) {
      out += S.poly(p.p.map((q) => [sx(q[0]), sy(q[1])]), { open: p.open, dash: p.dash, fill: p.fill ? 'currentColor' : undefined, op: p.fill ? 0.15 : undefined, w: p.w });
    }
    for (const sg of o.segs || []) out += S.line(sx(sg.a[0]), sy(sg.a[1]), sx(sg.b[0]), sy(sg.b[1]), { dash: sg.dash, w: 1.4 });
    for (const p of o.pts || []) {
      out += p.hollow ? S.circle(sx(p.x), sy(p.y), 3.2, { fill: 'var(--bg,#fff)' }) : S.dot(sx(p.x), sy(p.y), 3);
      if (p.l) out += S.text(sx(p.x) + (p.dx === undefined ? 9 : p.dx), sy(p.y) + (p.dy === undefined ? -9 : p.dy), p.l, { i: true, s: 12 });
    }
    if (o.extra) out += o.extra({ sx, sy });
    return S.wrap(W, H, out, 'Cartesian plane');
  };

  /* ----------------------------------------------- generic x–y graph axes */
  /**
   * Graph with independent scaling (for data graphs).
   * o = { w, h, xr:[min,max,step], yr:[min,max,step], xlabel, ylabel, xlabels:fn|null, grid, series:[{pts, type:'line'|'dots'|'step'|'poly', dash}], extra(m) }
   */
  S.graph = (o) => {
    const W = o.w || 320,
      H = o.h || 220;
    const pl = 44,
      pr = 16,
      pt = 14,
      pb = 38;
    const [xa, xb, xs] = o.xr;
    const [ya, yb, ys] = o.yr;
    const sx = (x) => pl + ((x - xa) / (xb - xa)) * (W - pl - pr);
    const sy = (y) => H - pb - ((y - ya) / (yb - ya)) * (H - pt - pb);
    let out = '';
    if (o.grid !== false) {
      for (let y = ya; y <= yb + 1e-9; y += ys) out += S.line(sx(xa), sy(y), sx(xb), sy(y), { w: 0.5, op: 0.3 });
      for (let x = xa; x <= xb + 1e-9; x += xs) out += S.line(sx(x), sy(ya), sx(x), sy(yb), { w: 0.5, op: 0.3 });
    }
    out += S.line(sx(xa), sy(ya), sx(xb), sy(ya)) + S.line(sx(xa), sy(ya), sx(xa), sy(yb));
    for (let y = ya; y <= yb + 1e-9; y += ys) out += S.text(sx(xa) - 6, sy(y), n(round(y, 4)), { a: 'end', s: 10 }) + S.line(sx(xa) - 3, sy(y), sx(xa), sy(y), { w: 1 });
    for (let x = xa; x <= xb + 1e-9; x += xs) {
      const lab = o.xlabels === undefined ? n(round(x, 4)) : o.xlabels ? o.xlabels(x) : null;
      if (lab !== null) out += S.text(sx(x), sy(ya) + 11, lab, { s: 10 }) + S.line(sx(x), sy(ya), sx(x), sy(ya) + 3, { w: 1 });
    }
    if (o.xlabel) out += S.text((sx(xa) + sx(xb)) / 2, H - 8, o.xlabel, { s: 11 });
    if (o.ylabel) out += S.text(10, (sy(ya) + sy(yb)) / 2, o.ylabel, { s: 11, rot: -90 });
    for (const s of o.series || []) {
      const P = s.pts.map((p) => [sx(p[0]), sy(p[1])]);
      if (s.type === 'dots') for (const p of P) out += S.dot(p[0], p[1], 2.8);
      else if (s.type === 'bars') {
        const bw = ((W - pl - pr) / (xb - xa)) * (s.width || 1) ;
        for (const p of s.pts) out += S.rect(sx(p[0]) - bw / 2, sy(p[1]), bw, sy(ya) - sy(p[1]), { fill: 'currentColor', op: 0.12 });
      } else out += S.poly(P, { open: true, dash: s.dash, w: 1.6 });
      if (s.dotsToo) for (const p of P) out += S.dot(p[0], p[1], 2.5);
    }
    if (o.extra) out += o.extra({ sx, sy });
    return S.wrap(W, H, out, 'graph');
  };

  /* ------------------------------------------------------------- Venn */
  /**
   * o = { sets:2|3, names:['A','B','C'], shade:[regionKeys], elems:{regionKey:[labels]}, xi:'ξ', counts:{key: number|string}, w,h }
   * region keys: for 2 sets: 'A','B','AB','0' ; for 3 sets: 'A','B','C','AB','AC','BC','ABC','0'
   *  – 'A' means in A only, 'AB' in A and B only, '0' outside all sets.
   */
  S.venn = (o) => {
    const k = o.sets || 2;
    const W = o.w || (k === 2 ? 260 : 270),
      H = o.h || (k === 2 ? 150 : 200);
    const id = 'v' + ++uid;
    const names = o.names || ['A', 'B', 'C'];
    let C, R;
    if (k === 2) {
      R = 46;
      C = [[W / 2 - 30, H / 2 + 6], [W / 2 + 30, H / 2 + 6]];
    } else {
      R = 47;
      C = [[W / 2 - 28, H / 2 - 22], [W / 2 + 28, H / 2 - 22], [W / 2, H / 2 + 26]];
    }
    const letters = 'ABC'.slice(0, k);
    let defs = '';
    for (let i = 0; i < k; i++) {
      defs += `<clipPath id="${id}c${i}"><circle cx="${f2(C[i][0])}" cy="${f2(C[i][1])}" r="${R}"/></clipPath>`;
    }
    // masks for "outside of set i" (white everywhere, black inside)
    for (let i = 0; i < k; i++)
      defs += `<mask id="${id}m${i}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${f2(C[i][0])}" cy="${f2(C[i][1])}" r="${R}" fill="#000"/></mask>`;
    const regions = k === 2 ? ['A', 'B', 'AB', '0'] : ['A', 'B', 'C', 'AB', 'AC', 'BC', 'ABC', '0'];
    const region = (key) => {
      const inn = key === '0' ? [] : key.split('').map((ch) => letters.indexOf(ch));
      const outt = [];
      for (let i = 0; i < k; i++) if (!inn.includes(i)) outt.push(i);
      let inner = `<rect x="0" y="0" width="${W}" height="${H}" fill="currentColor" fill-opacity="0.2" stroke="none"`;
      if (key === '0') {
        // outside all: mask with all circles removed
        return `<g mask="url(#${id}mm)"><rect x="3" y="3" width="${W - 6}" height="${H - 6}" fill="currentColor" fill-opacity="0.2" stroke="none"/></g>`;
      }
      // nest clip-paths for the sets we are inside, masks for those we are outside of
      let g = inner + '/>';
      for (const i of outt) g = `<g mask="url(#${id}m${i})">${g}</g>`;
      for (const i of inn) g = `<g clip-path="url(#${id}c${i})">${g}</g>`;
      return g;
    };
    defs += `<mask id="${id}mm"><rect width="${W}" height="${H}" fill="#fff"/>` + C.map((c) => `<circle cx="${f2(c[0])}" cy="${f2(c[1])}" r="${R}" fill="#000"/>`).join('') + '</mask>';
    let out = `<defs>${defs}</defs>`;
    for (const key of o.shade || []) out += region(key);
    out += S.rect(3, 3, W - 6, H - 6);
    out += S.text(14, 14, o.xi || 'ξ', { i: true, s: 13 });
    for (let i = 0; i < k; i++) out += S.circle(C[i][0], C[i][1], R);
    // set names
    const nameAt =
      k === 2
        ? [[C[0][0] - R + 2, C[0][1] - R - 4], [C[1][0] + R - 2, C[1][1] - R - 4]]
        : [[C[0][0] - R + 4, C[0][1] - R + 2], [C[1][0] + R - 4, C[1][1] - R + 2], [C[2][0], C[2][1] + R + 8]];
    if (o.showNames !== false) for (let i = 0; i < k; i++) out += S.text(nameAt[i][0], nameAt[i][1], names[i], { i: true, b: true, s: 13 });
    // region label anchor positions
    let pos;
    if (k === 2) pos = { A: [C[0][0] - 24, C[0][1]], B: [C[1][0] + 24, C[1][1]], AB: [W / 2, C[0][1]], '0': [W - 22, H - 16] };
    else
      pos = {
        A: [C[0][0] - 20, C[0][1] - 12], B: [C[1][0] + 20, C[1][1] - 12], C: [C[2][0], C[2][1] + 22],
        AB: [W / 2, C[0][1] - 18], AC: [C[0][0] + 2, C[2][1] - 4], BC: [C[1][0] - 2, C[2][1] - 4], ABC: [W / 2, C[0][1] + 16], '0': [W - 22, H - 16],
      };
    for (const key of regions) {
      const items = (o.elems && o.elems[key]) || null;
      const cnt = o.counts && o.counts[key] !== undefined ? o.counts[key] : null;
      const p = pos[key];
      if (items && items.length) {
        // lay elements in rows of ≤3
        const rows = [];
        for (let i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3));
        const lh = 12;
        rows.forEach((row, ri) => {
          out += S.text(p[0], p[1] + (ri - (rows.length - 1) / 2) * lh, row.join('  '), { s: 11 });
        });
      } else if (cnt !== null) out += S.text(p[0], p[1], String(cnt), { s: 12 });
    }
    return S.wrap(W, H, out, 'Venn diagram');
  };

  /* ------------------------------------------------------------- charts */
  /** vertical bar chart. o = { cats:[str], vals:[num], ymax, ystep, xlabel, ylabel, w, h } */
  S.bar = (o) => {
    const W = o.w || 320,
      H = o.h || 200;
    const pl = 40,
      pr = 12,
      pt = 12,
      pb = 34;
    const ymin = o.ymin || 0;
    const ymax = o.ymax;
    const ys = o.ystep;
    const sy = (y) => H - pb - ((y - ymin) / (ymax - ymin)) * (H - pt - pb);
    let out = '';
    for (let y = ymin; y <= ymax + 1e-9; y += ys) {
      out += S.line(pl, sy(y), W - pr, sy(y), { w: 0.5, op: 0.3 });
      out += S.text(pl - 5, sy(y), n(round(y, 4)), { a: 'end', s: 10 });
    }
    out += S.line(pl, sy(ymin), W - pr, sy(ymin)) + S.line(pl, sy(ymin), pl, sy(ymax));
    const k = o.cats.length;
    const bw = ((W - pl - pr) / k) * 0.6;
    o.cats.forEach((c, i) => {
      const cx = pl + ((i + 0.5) * (W - pl - pr)) / k;
      out += S.rect(cx - bw / 2, sy(o.vals[i]), bw, sy(ymin) - sy(o.vals[i]), { fill: 'currentColor', op: 0.18 });
      out += S.text(cx, sy(ymin) + 12, c, { s: 10 });
      if (o.showValues) out += S.text(cx, sy(o.vals[i]) - 7, n(o.vals[i]), { s: 10 });
    });
    if (o.title) out += S.text(W / 2, 8, o.title, { s: 11, b: true });
    if (o.xlabel) out += S.text((pl + W - pr) / 2, H - 7, o.xlabel, { s: 11 });
    if (o.ylabel) out += S.text(9, (pt + H - pb) / 2, o.ylabel, { s: 11, rot: -90 });
    return S.wrap(W, H, out, 'bar chart');
  };

  /** pie chart. o = { slices:[{v, label}], r, showPct, showAngles, showValues } */
  S.pie = (o) => {
    const r = o.r || 70;
    const W = o.w || r * 2 + 120,
      H = r * 2 + 40;
    const cx = W / 2,
      cy = H / 2;
    const tot = o.slices.reduce((s, x) => s + x.v, 0);
    let a = -Math.PI / 2;
    let out = '';
    const shades = [0.08, 0.2, 0.34, 0.5, 0.14, 0.28, 0.42, 0.6];
    o.slices.forEach((s, i) => {
      const da = (s.v / tot) * Math.PI * 2;
      const x1 = cx + r * Math.cos(a),
        y1 = cy + r * Math.sin(a),
        x2 = cx + r * Math.cos(a + da),
        y2 = cy + r * Math.sin(a + da);
      const large = da > Math.PI ? 1 : 0;
      out += S.path(`M${f2(cx)},${f2(cy)} L${f2(x1)},${f2(y1)} A${r},${r} 0 ${large} 1 ${f2(x2)},${f2(y2)} Z`, { fill: 'currentColor', op: shades[i % shades.length] });
      const mid = a + da / 2;
      const lx = cx + (r + 22) * Math.cos(mid),
        ly = cy + (r + 22) * Math.sin(mid);
      let txt = s.label || '';
      if (o.showPct) txt += (txt ? ' ' : '') + n(round((s.v / tot) * 100, 1)) + '%';
      if (o.showAngles) txt += (txt ? ' ' : '') + n(round((s.v / tot) * 360, 1)) + '°';
      if (o.showValues) txt += (txt ? ' ' : '') + n(s.v);
      if (txt) out += S.text(lx, ly, txt, { s: 11 });
      a += da;
    });
    out += S.circle(cx, cy, r);
    return S.wrap(W, H, out, 'pie chart');
  };


  /* ---------------------------------------------- one-set / nested Venn */
  const rows = (cx, cy, items, per, lh, size) => {
    if (!items || !items.length) return '';
    const r = [];
    for (let i = 0; i < items.length; i += per) r.push(items.slice(i, i + per));
    return r.map((row, i) => S.text(cx, cy + (i - (r.length - 1) / 2) * lh, row.join('  '), { s: size || 12 })).join('');
  };
  /** one set A inside the universal set. o = { name:'A', inA:[...], out:[...], shade:'A'|'out'|null, xi } */
  S.venn1 = (o) => {
    const W = o.w || 270,
      H = o.h || 160;
    const id = 'v' + ++uid;
    const cx = 105,
      cy = H / 2 + 4,
      R = 48;
    let out = `<defs><clipPath id="${id}c"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath><mask id="${id}m"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#000"/></mask></defs>`;
    if (o.shade === 'A') out += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="currentColor" fill-opacity="0.2" stroke="none"/>`;
    if (o.shade === 'out') out += `<g mask="url(#${id}m)"><rect x="3" y="3" width="${W - 6}" height="${H - 6}" fill="currentColor" fill-opacity="0.2" stroke="none"/></g>`;
    out += S.rect(3, 3, W - 6, H - 6) + S.text(14, 15, o.xi || 'ξ', { i: true, s: 13 }) + S.circle(cx, cy, R);
    out += S.text(cx - R + 4, cy - R + 2, o.name || 'A', { i: true, b: true, s: 13 });
    out += rows(cx, cy + 4, o.inA, 3, 14);
    out += rows(205, cy, o.out, 2, 15);
    return S.wrap(W, H, out, 'Venn diagram');
  };
  /** A inside B inside universal set. o = { names:['A','B'], inner:[...] (in A), mid:[...] (in B only), out:[...] } */
  S.vennNested = (o) => {
    const W = o.w || 290,
      H = o.h || 175;
    const cx = 112,
      cy = H / 2 + 2;
    let out = S.rect(3, 3, W - 6, H - 6) + S.text(14, 15, o.xi || 'ξ', { i: true, s: 13 });
    out += S.circle(cx, cy, 68) + S.circle(cx - 8, cy + 14, 34);
    const nm = o.names || ['A', 'B'];
    out += S.text(cx + 50, cy - 60, nm[1], { i: true, b: true, s: 13 }) + S.text(cx - 34, cy - 14, nm[0], { i: true, b: true, s: 13 });
    out += rows(cx - 8, cy + 18, o.inner, 3, 14);
    out += rows(cx + 24, cy - 26, o.mid, 2, 14);
    out += rows(232, cy, o.out, 2, 15);
    return S.wrap(W, H, out, 'Venn diagram');
  };

  SPM.svg = S;
})(typeof window !== 'undefined' ? window : globalThis);
