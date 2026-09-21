/* Geometry figure builders (triangles, polygons, angle fans, parallel lines, circles) */
(function (root) {
  'use strict';
  const SPM = root.SPM;
  const S = SPM.svg;
  const rad = (d) => (d * Math.PI) / 180;
  const F = (SPM.figs = {});
  SPM.NTS = { en: '(Diagram not drawn to scale.)', ms: '(Rajah tidak dilukis mengikut skala.)' };

  /** fit points into a w×h box with padding, keeping aspect; returns mapped points */
  function fit(pts, w, h, pad) {
    const xs = pts.map((p) => p[0]),
      ys = pts.map((p) => p[1]);
    const minx = Math.min(...xs),
      maxx = Math.max(...xs),
      miny = Math.min(...ys),
      maxy = Math.max(...ys);
    const sc = Math.min((w - 2 * pad) / (maxx - minx || 1), (h - 2 * pad) / (maxy - miny || 1));
    const ox = (w - (maxx - minx) * sc) / 2 - minx * sc;
    const oy = (h - (maxy - miny) * sc) / 2 - miny * sc;
    return pts.map((p) => [p[0] * sc + ox, p[1] * sc + oy]);
  }
  F.fit = fit;

  /** centroid of points */
  const cen = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
  F.cen = cen;
  const unit = (dx, dy) => {
    const l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  };

  /**
   * Generic polygon figure.
   * o = { pts:[[x,y]...] (any coordinates, y down), names:['A',...], angles:{i:'label'}, right:[i], ticks:{ 'i-j': k },
   *       sides:{ 'i-j': 'label' }, parallel:{ 'i-j': k }, extra:(pts)=>svg, w,h, arcR }
   */
  F.polygon = (o) => {
    const w = o.w || 280,
      h = o.h || 190;
    const P = fit(o.pts, w, h, 30);
    const n = P.length;
    const C = cen(P);
    let out = S.poly(P);
    for (let i = 0; i < n; i++) {
      const prev = P[(i + n - 1) % n],
        next = P[(i + 1) % n];
      if (o.names) out += S.outLabel(P[i], C, o.names[i], 13);
      if (o.right && o.right.includes(i)) out += S.rightAngle(P[i], prev, next, 9);
      else if (o.angles && o.angles[i] !== undefined && o.angles[i] !== null) out += S.arc(P[i], prev, next, o.arcR || 20, o.angles[i], { gap: 13 });
    }
    for (const [key, k] of Object.entries(o.ticks || {})) {
      const [a, b] = key.split('-').map(Number);
      out += S.tick(P[a], P[b], k);
    }
    for (const [key, lab] of Object.entries(o.sides || {})) {
      const [a, b] = key.split('-').map(Number);
      out += S.sideLabel(P[a], P[b], C, lab, 11);
    }
    if (o.extra) out += o.extra(P, C);
    return S.wrap(w, h, out, 'polygon');
  };

  /**
   * Triangle from two base angles (degrees) – A bottom-left, B bottom-right, C apex.
   * o = { a, b, names:['A','B','C'], angles:{A:'x',B:'',C:''}, right:'A'|'B'|'C', ticks:{AB:1,AC:2..}, sides:{AB:'5 cm'},
   *       ext:{ from:'A', at:'B', label:'x' } (extend the side from→at beyond `at`), w,h }
   */
  F.triangle = (o) => {
    const w = o.w || 280,
      h = o.h || 180;
    const a = o.a === undefined ? 55 : o.a,
      b = o.b === undefined ? 65 : o.b;
    const c = 180 - a - b;
    const W = 200;
    const AC = (W * Math.sin(rad(b))) / Math.sin(rad(c));
    let A = [0, 0],
      B = [W, 0],
      Cc = [AC * Math.cos(rad(a)), -AC * Math.sin(rad(a))];
    let pts = [A, B, Cc];
    let extPt = null;
    const idx = { A: 0, B: 1, C: 2 };
    let all = pts.slice();
    if (o.ext) {
      const from = pts[idx[o.ext.from]],
        at = pts[idx[o.ext.at]];
      const u = unit(at[0] - from[0], at[1] - from[1]);
      extPt = [at[0] + u[0] * 70, at[1] + u[1] * 70];
      all.push(extPt);
    }
    const M = fit(all, w, h, 26);
    const [PA, PB, PC] = M;
    const P = [PA, PB, PC];
    const names = o.names || ['A', 'B', 'C'];
    const cc = cen(P);
    let out = S.poly(P);
    if (o.ext) {
      const at = P[idx[o.ext.at]];
      out += S.line(at[0], at[1], M[3][0], M[3][1]);
    }
    for (let i = 0; i < 3; i++) out += S.outLabel(P[i], cc, names[i], 13);
    const key = ['A', 'B', 'C'];
    for (let i = 0; i < 3; i++) {
      const v = P[i],
        p1 = P[(i + 1) % 3],
        p2 = P[(i + 2) % 3];
      if (o.right === key[i]) out += S.rightAngle(v, p1, p2, 10);
      else if (o.angles && o.angles[key[i]]) out += S.arc(v, p1, p2, 22, o.angles[key[i]], { gap: 14 });
    }
    if (o.ext && o.ext.label) {
      const at = P[idx[o.ext.at]];
      const other = P.find((_, i) => key[i] !== o.ext.at && key[i] !== o.ext.from);
      out += S.arc(at, M[3], other, 24, o.ext.label, { gap: 14 });
    }
    const sideIdx = { AB: [0, 1], BC: [1, 2], AC: [0, 2], CA: [0, 2], BA: [0, 1], CB: [1, 2] };
    for (const [k, t] of Object.entries(o.ticks || {})) out += S.tick(P[sideIdx[k][0]], P[sideIdx[k][1]], t);
    for (const [k, t] of Object.entries(o.sides || {})) out += S.sideLabel(P[sideIdx[k][0]], P[sideIdx[k][1]], cc, t, 12);
    return S.wrap(w, h, out, 'triangle');
  };

  /** Straight-line/angle-at-a-point fan.
   * o = { rays:[deg…] (maths orientation, counter-clockwise), labels:{ 'i': text } for sector from ray i to ray i+1 (cyclic),
   *       full:[i…] rays drawn as full lines through centre, len, w,h } */
  F.fan = (o) => {
    const w = o.w || 250,
      h = o.h || 200;
    const half = o.half !== undefined ? o.half : o.rays.includes(0) && o.rays.includes(180) && o.rays.every((d) => d >= 0 && d <= 180);
    const cx = w / 2,
      cy = half ? h - 26 : h / 2,
      len = half ? Math.min(w / 2 - 24, h - 46) : Math.min(w, h) / 2 - 16;
    let out = '';
    const dirs = o.rays.map((d) => [Math.cos(rad(d)), -Math.sin(rad(d))]);
    o.rays.forEach((d, i) => {
      out += S.line(cx, cy, cx + dirs[i][0] * len, cy + dirs[i][1] * len);
      if (o.through && o.through.includes(i)) out += S.line(cx, cy, cx - dirs[i][0] * len, cy - dirs[i][1] * len);
      if (o.names && o.names[i]) out += S.text(cx + dirs[i][0] * (len + 10), cy + dirs[i][1] * (len + 10), o.names[i], { i: true });
    });
    out += S.dot(cx, cy, 2);
    const nR = o.rays.length;
    for (const [k, lab] of Object.entries(o.labels || {})) {
      const i = Number(k);
      const a1 = o.rays[i],
        a2 = o.rays[(i + 1) % nR] + (o.rays[(i + 1) % nR] <= a1 ? 360 : 0);
      const span = a2 - a1;
      const mid = a1 + span / 2;
      const rr = o.arcR || 26;
      const p1 = [cx + rr * Math.cos(rad(a1)), cy - rr * Math.sin(rad(a1))],
        p2 = [cx + rr * Math.cos(rad(a2)), cy - rr * Math.sin(rad(a2))];
      const large = span > 180 ? 1 : 0;
      out += `<path d="M${p1[0].toFixed(1)},${p1[1].toFixed(1)} A${rr},${rr} 0 ${large} 0 ${p2[0].toFixed(1)},${p2[1].toFixed(1)}" stroke-width="1"/>`;
      const lr = rr + (span < 40 ? 20 : 14) + Math.max(0, String(lab).length - 4) * 3.4;
      out += S.text(cx + lr * Math.cos(rad(mid)), cy - lr * Math.sin(rad(mid)), lab, { s: 12 });
    }
    return S.wrap(w, h, out, 'angles');
  };

  /**
   * Two parallel lines cut by a transversal.
   * o = { t: transversal angle (deg from horizontal, 20..160), marks:[{at:'U'|'L', pos:'ne'|'nw'|'sw'|'se', label}], names:true }
   * pos: ne = above-right of the intersection, nw = above-left, sw = below-left, se = below-right
   */
  F.parallel = (o) => {
    const w = o.w || 300,
      h = o.h || 190;
    const yU = 60,
      yL = h - 60;
    const t = o.t;
    const dy = yL - yU;
    const dx = dy / Math.tan(rad(t)) * -1; // moving down the transversal
    const xU = w / 2 - dx / 2;
    const xL = xU + dx;
    let out = '';
    const dl = o.lowerAngle || 0; // direction of the lower line (0 = parallel to the upper line)
    const ca = Math.cos(rad(dl)), sa = -Math.sin(rad(dl));
    const xL0 = xL;
    out += S.line(20, yU, w - 20, yU);
    out += S.line(xL0 - ca * (xL0 - 20), yL - sa * (xL0 - 20), xL0 + ca * (w - 20 - xL0), yL + sa * (w - 20 - xL0));
    if (!dl) for (const y of [yU, yL]) out += S.poly([[w - 60, y - 5], [w - 52, y], [w - 60, y + 5]], { open: true, w: 1.1 });
    const ext = 46;
    const ux = Math.cos(rad(t)),
      uy = -Math.sin(rad(t)); // direction of the transversal going "up"
    out += S.line(xU + ux * ext, yU + uy * ext, xL - ux * ext, yL - uy * ext);
    const cs = { U: [xU, yU], L: [xL, yL] };
    const dirsU = { ne: [0, t], nw: [t, 180], sw: [180, 180 + t], se: [180 + t, 360] };
    const dirsL = { ne: [dl, t], nw: [t, 180 + dl], sw: [180 + dl, 180 + t], se: [180 + t, 360 + dl] };
    for (const m of o.marks || []) {
      const c = cs[m.at];
      const [a1, a2] = (m.at === 'U' ? dirsU : dirsL)[m.pos];
      const r = 20;
      const p1 = [c[0] + r * Math.cos(rad(a1)), c[1] - r * Math.sin(rad(a1))],
        p2 = [c[0] + r * Math.cos(rad(a2)), c[1] - r * Math.sin(rad(a2))];
      out += `<path d="M${p1[0].toFixed(1)},${p1[1].toFixed(1)} A${r},${r} 0 0 0 ${p2[0].toFixed(1)},${p2[1].toFixed(1)}" stroke-width="1"/>`;
      const mid = (a1 + a2) / 2;
      const lr = 34 + (a2 - a1 < 50 ? 6 : 0) + Math.max(0, String(m.label).length - 4) * 3.4;
      out += S.text(c[0] + lr * Math.cos(rad(mid)), c[1] - lr * Math.sin(rad(mid)), m.label, { s: 12 });
    }
    if (o.names) {
      out += S.text(12, yU - 10, 'P', { i: true }) + S.text(w - 12, yU - 10, 'Q', { i: true });
      out += S.text(12, yL - 10, 'R', { i: true }) + S.text(w - 12, yL - 10, 'S', { i: true });
    }
    return S.wrap(w, h, out, 'parallel lines');
  };
  /** size of a marked sector for parallel figure with transversal angle t */
  F.parSize = (pos, t) => (pos === 'ne' || pos === 'sw' ? t : 180 - t);

  /** Circle figure with centre O and optional named points on the circumference (angles in degrees, ccw from east).
   *  o = { pts:{A:deg,...}, chords:['AB','BC'], radii:['OA'], tangents:[{at:'A', len}], showO:true, w, h, r, extra(m) } */
  F.circle = (o) => {
    const w = o.w || 240,
      h = o.h || 220;
    const r = o.r || 78;
    const cx = w / 2,
      cy = h / 2;
    const P = {};
    for (const [k, d] of Object.entries(o.pts || {})) P[k] = [cx + r * Math.cos(rad(d)), cy - r * Math.sin(rad(d))];
    P.O = [cx, cy];
    let out = S.circle(cx, cy, r);
    for (const c of o.chords || []) out += S.line(P[c[0]][0], P[c[0]][1], P[c[1]][0], P[c[1]][1], { dash: false });
    for (const c of o.radii || []) out += S.line(P[c[0]][0], P[c[0]][1], P[c[1]][0], P[c[1]][1]);
    for (const [k, p] of Object.entries(P)) {
      if (k === 'O') {
        if (o.showO !== false) out += S.dot(cx, cy, 2.5) + S.text(cx + 9, cy + 9, 'O', { i: true });
        continue;
      }
      out += S.dot(p[0], p[1], 2.5);
      const u = unit(p[0] - cx, p[1] - cy);
      out += S.text(p[0] + u[0] * 12, p[1] + u[1] * 12, k, { i: true });
    }
    if (o.extra) out += o.extra(P, { cx, cy, r });
    return S.wrap(w, h, out, 'circle');
  };
})(typeof window !== 'undefined' ? window : globalThis);
