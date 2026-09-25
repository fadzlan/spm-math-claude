/* Variety pack x2d: Form 2 Ch6 (3-D shapes) and Ch7 (coordinates). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, fx, Fr, rm, poly } = SPM;
  const T = SPM.L, S = SPM.svg;
  const W = SPM.lines;
  const rad = (d) => (d * Math.PI) / 180;
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const f1 = (v) => Math.round(v * 10) / 10;
  const cm = (v) => n(v) + ' cm';

  /* ================= pi conventions and answers in terms of pi ================= */
  const PI = {
    exact: T('Leave your answer in terms of $\\pi$.', 'Tinggalkan jawapan anda dalam sebutan $\\pi$.'),
    r22: T('Use $\\pi = \\frac{22}{7}$.', 'Gunakan $\\pi = \\frac{22}{7}$.'),
    p3142: T('Use $\\pi = 3.142$ and give the answer correct to 2 decimal places.', 'Gunakan $\\pi = 3.142$ dan berikan jawapan betul kepada 2 tempat perpuluhan.'),
  };
  const piK = (r, w) => r.pick(w || ['exact', 'r22', 'p3142']);
  const rFor = (k, r, lo, hi) => (k === 'r22' ? r.pick([7, 14, 21, 3.5, 10.5]) : r.int(lo || 3, hi || 12));
  /** the value (num/den)*pi in the chosen convention, as maths text (no unit) */
  function pv(k, num, den) {
    den = den || 1;
    if (k === 'exact') {
      const f = Fr.make(Math.round(num * 1e6), Math.round(den * 1e6));
      return (f.d === 1 ? (f.n === 1 ? '' : n(f.n)) : `\\dfrac{${f.n}}{${f.d}}`) + '\\pi';
    }
    const v = (num / den) * (k === 'r22' ? 22 / 7 : 3.142);
    if (k === 'r22') need(Math.abs(v * 100 - Math.round(v * 100)) < 1e-6);
    return n(round(v, 2));
  }
  const pnum = (k, num, den) => (k === 'exact' ? (num / (den || 1)) * Math.PI : (num / (den || 1)) * (k === 'r22' ? 22 / 7 : 3.142));
  const U2 = '\\ \\text{cm}^2', U3 = '\\ \\text{cm}^3', U1 = '\\ \\text{cm}';
  const pa = (k, num, den, u) => T(`$${pv(k, num, den)}${u || ''}$`);
  const num2 = (x) => n(round(x, 2));
  const twoDp = (x) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

  /* ================= figure toolkit ================= */
  const vs = (v, mx) => 40 + (70 * v) / mx;
  function mk(inner, pts, pad) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs), y0 = Math.min(...ys);
    const W = Math.max(...xs) - x0 + 2 * pad, H = Math.max(...ys) - y0 + 2 * pad;
    return S.wrap(W, H, `<g transform="translate(${f1(pad - x0)},${f1(pad - y0)})">${inner}</g>`, 'figure');
  }
  const tx = (x, y, t, o) => S.text(x, y, t, Object.assign({ s: 11 }, o || {}));
  const eLab = (a, b, c, t, d, o) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    let nx = dy / l, ny = -dx / l;
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if ((m[0] - c[0]) * nx + (m[1] - c[1]) * ny < 0) (nx = -nx), (ny = -ny);
    return tx(m[0] + nx * (d || 12), m[1] + ny * (d || 12), t, o);
  };
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const ln = (a, b, dash) => S.line(a[0], a[1], b[0], b[1], dash ? { dash: true } : undefined);
  const ptp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const fullE = (cx, y, R, ry) => S.path(`M${f1(cx - R)},${y} A${f1(R)},${f1(ry)} 0 0 1 ${f1(cx + R)},${y} A${f1(R)},${f1(ry)} 0 0 1 ${f1(cx - R)},${y}`);
  const frontE = (cx, y, R, ry) => S.path(`M${f1(cx - R)},${y} A${f1(R)},${f1(ry)} 0 0 0 ${f1(cx + R)},${y}`);
  const backE = (cx, y, R, ry) => S.path(`M${f1(cx - R)},${y} A${f1(R)},${f1(ry)} 0 0 1 ${f1(cx + R)},${y}`, { dash: true });
  const rightMark = (x, y, s, dx, dy) => S.path(`M${f1(x)},${f1(y + dy * s)} L${f1(x + dx * s)},${f1(y + dy * s)} L${f1(x + dx * s)},${f1(y)}`, { w: 0.9 });

  /** right prism in oblique projection; poly = front face (screen coords, y down), (ox,oy) = receding offset.
   *  labs: [{k:'f'|'b'|'l', i, t}] (front edge i / back edge i / lateral edge at vertex i) */
  function prismSvg(poly, ox, oy, labs) {
    const k = poly.length, back = poly.map((p) => [p[0] + ox, p[1] - oy]);
    const c = [avg(poly.map((p) => p[0])), avg(poly.map((p) => p[1]))];
    const fv = poly.map((a, i) => {
      const b = poly[(i + 1) % k];
      let nx = b[1] - a[1], ny = a[0] - b[0];
      if (nx * ((a[0] + b[0]) / 2 - c[0]) + ny * ((a[1] + b[1]) / 2 - c[1]) < 0) (nx = -nx), (ny = -ny);
      return nx * ox - ny * oy > 1e-6;
    });
    let s = S.poly(poly);
    for (let i = 0; i < k; i++) {
      const j = (i + 1) % k;
      s += ln(back[i], back[j], !fv[i]);
      s += ln(poly[i], back[i], !(fv[(i + k - 1) % k] || fv[i]));
    }
    const c2 = [avg(poly.concat(back).map((p) => p[0])), avg(poly.concat(back).map((p) => p[1]))];
    for (const l of (labs || []).filter((x) => x.t)) {
      const j = (l.i + 1) % k;
      const seg = l.k === 'f' ? [poly[l.i], poly[j]] : l.k === 'b' ? [back[l.i], back[j]] : [poly[l.i], back[l.i]];
      s += eLab(seg[0], seg[1], c2, l.t, 12, { i: /^[a-z]$/.test(l.t) });
    }
    return mk(s, poly.concat(back), 26);
  }
  const rectPoly = (W, H) => [[0, H], [W, H], [W, 0], [0, 0]];
  function cuboidFig(l, w, h, lab) {
    const mx = Math.max(l, w, h), W = vs(l, mx), H = vs(h, mx), d = 0.5 * vs(w, mx);
    const t = lab || [cm(l), cm(w), cm(h)];
    return prismSvg(rectPoly(W, H), d * 0.85, d * 0.6, [{ k: 'f', i: 0, t: t[0] }, { k: 'l', i: 1, t: t[1] }, { k: 'f', i: 3, t: t[2] }]);
  }
  /** right triangular prism, right angle at bottom-left: legs a (horizontal), b (vertical), length L */
  function triPrismFig(a, b, L, lab, iso) {
    const mx = Math.max(a, b, L), W = vs(a, mx), H = vs(b, mx), d = 0.5 * vs(L, mx);
    const poly = iso ? [[0, H], [W, H], [W / 2, 0]] : [[0, H], [W, H], [0, 0]];
    const t = lab || [cm(a), cm(b), cm(L)];
    const labs = [{ k: 'f', i: 0, t: t[0] }, { k: 'l', i: 1, t: t[2] }];
    if (t[1] && !iso) labs.push({ k: 'f', i: 2, t: t[1] });
    return prismSvg(poly, d * 0.85, d * 0.6, labs);
  }
  const regPoly = (nn, R, sq, rot) => Array.from({ length: nn }, (_, i) => {
    const a = rad(90 + (360 * (i + (rot === undefined ? 0.5 : rot))) / nn);
    return [R * Math.cos(a), R * sq * Math.sin(a)];
  });
  /** upright prism / pyramid on a (squashed) base polygon; sx = sideways lean of the top (0 = right solid) */
  function upSvg(base, H, sx, isPyr, o) {
    o = o || {};
    const k = base.length, c = [avg(base.map((p) => p[0])), avg(base.map((p) => p[1]))];
    const top = isPyr ? [[c[0] + sx, c[1] - H]] : base.map((p) => [p[0] + sx, p[1] - H]);
    const fv = base.map((a, i) => {
      const b = base[(i + 1) % k];
      let nx = b[1] - a[1], ny = a[0] - b[0];
      if (nx * ((a[0] + b[0]) / 2 - c[0]) + ny * ((a[1] + b[1]) / 2 - c[1]) < 0) (nx = -nx), (ny = -ny);
      return ny / Math.hypot(nx, ny) > 0.05;
    });
    let s = '';
    for (let i = 0; i < k; i++) {
      const j = (i + 1) % k;
      s += ln(base[i], base[j], !fv[i]);
      if (!isPyr) s += ln(top[i], top[j]);
      s += ln(base[i], isPyr ? top[0] : top[i], !(fv[(i + k - 1) % k] || fv[i]));
    }
    const tc = isPyr ? top[0] : [c[0] + sx, c[1] - H];
    if (o.axis) {
      s += ln(c, tc, true) + S.dot(c[0], c[1], 1.6);
      if (!sx && o.mark !== false) s += rightMark(c[0], c[1], 6, 1, -1);
    }
    const all = base.concat(top);
    const cc = [avg(all.map((p) => p[0])), avg(all.map((p) => p[1]))];
    for (const l of o.labs || []) s += eLab(base[l.i], base[(l.i + 1) % k], c, l.t, 11, { i: /^[a-z]$/.test(l.t) });
    if (o.h) {
      s += S.line(tc[0], tc[1], tc[0], c[1], { dash: true }) + tx(tc[0] + 8, (tc[1] + c[1]) / 2, o.h, { a: 'start', i: /^[a-z]$/.test(o.h) });
      if (isPyr) s += rightMark(tc[0], c[1], 6, 1, -1);
    }
    if (o.slant) {
      const m = mid(base[o.slant.i], base[(o.slant.i + 1) % k]);
      s += ln(tc, m, true) + tx((tc[0] + m[0]) / 2 - 10, (tc[1] + m[1]) / 2 + 4, o.slant.t, { a: 'end', i: /^[a-z]$/.test(o.slant.t) });
    }
    return mk(s, all, 26);
  }
  /** oblique / right cylinder or cone (axis leans by sx) */
  function roundSvg(kind, R, H, sx) {
    const ry = 0.32 * R, tp = [sx, -H];
    let s = frontE(0, 0, R, ry) + backE(0, 0, R, ry);
    if (kind === 'cyl') s += fullE(sx, -H, R, ry) + S.line(-R, 0, sx - R, -H) + S.line(R, 0, sx + R, -H);
    else s += S.line(-R, 0, sx, -H) + S.line(R, 0, sx, -H);
    s += ln([0, 0], tp, true) + S.dot(0, 0, 1.6) + S.dot(tp[0], tp[1], 1.6);
    if (!sx) s += rightMark(0, 0, 7, 1, -1);
    return mk(s, [[-R, ry], [R, ry], [sx - R, -H - ry], [sx + R, -H - ry]], 22);
  }
  /** vertical stack of coaxial parts on one radius R: [{t:'cyl',h}|{t:'cone',h}|{t:'hemi'}|{t:'hemiB'}], bottom to top (px).
   *  o.dims: [{a: index|'all', t}], o.rad: {t, y:'base'|'top'|index (top of part), d}, o.axis: {i, t}, o.slant: {t, i} */
  function stackSvg(parts, R, o) {
    o = o || {};
    const ry = 0.32 * R;
    let s = '', cur = 0, minY = 0, maxY = ry;
    const spans = [];
    parts.forEach((p, i) => {
      const last = i === parts.length - 1;
      if (i === 0 && p.t !== 'hemiB') s += frontE(0, 0, R, ry) + backE(0, 0, R, ry);
      if (p.t === 'hemiB') {
        s += S.path(`M${-R},0 A${R},${R} 0 0 0 ${R},0`);
        spans.push([R, 0]);
        maxY = R;
        if (!last) s += frontE(0, 0, R, ry);
        return;
      }
      if (p.t === 'cyl') {
        s += S.line(-R, cur, -R, cur - p.h) + S.line(R, cur, R, cur - p.h);
        spans.push([cur, cur - p.h]);
        cur -= p.h;
        s += last ? fullE(0, cur, R, ry) : frontE(0, cur, R, ry);
      } else if (p.t === 'cone') {
        s += S.line(-R, cur, 0, cur - p.h) + S.line(R, cur, 0, cur - p.h);
        spans.push([cur, cur - p.h]);
        cur -= p.h;
      } else {
        s += S.path(`M${-R},${cur} A${R},${R} 0 0 1 ${R},${cur}`);
        spans.push([cur, cur - R]);
        cur -= R;
      }
      minY = cur - (p.t === 'cyl' && last ? ry : 0);
    });
    const pts = [[-R, minY], [R, maxY]];
    const X = R + 16;
    for (const d of o.dims || []) {
      const [y0, y1] = d.a === 'all' ? [spans[0][0], cur] : spans[d.a];
      s += S.line(X, y0, X, y1, { w: 0.9 }) + S.line(X - 3, y0, X + 3, y0, { w: 0.9 }) + S.line(X - 3, y1, X + 3, y1, { w: 0.9 });
      s += tx(X + 5, (y0 + y1) / 2, d.t, { a: 'start', i: /^[a-z]$/.test(d.t) });
      pts.push([X + 40, y0]);
    }
    if (o.rad) {
      const y = o.rad.y === 'base' ? 0 : o.rad.y === 'top' ? cur : spans[o.rad.y][1];
      const x0 = o.rad.d ? -R : 0;
      s += S.line(x0, y, R, y, { dash: true }) + S.dot(0, y, 1.6);
      s += tx(o.rad.d ? 0 : R / 2, y + (o.rad.d ? -8 : 9), o.rad.t, { i: /^[a-z]$/.test(o.rad.t) });
    }
    if (o.axis) {
      const [y0, y1] = spans[o.axis.i];
      s += S.line(0, y0, 0, y1, { dash: true }) + tx(6, (y0 + y1) / 2, o.axis.t, { a: 'start', i: /^[a-z]$/.test(o.axis.t) });
    }
    if (o.slant) {
      const [y0, y1] = spans[o.slant.i];
      const p = [R, y0], q = parts[o.slant.i].t === 'cone' ? [0, y1] : [R, y1];
      s += tx((p[0] + q[0]) / 2 + 12, (p[1] + q[1]) / 2, o.slant.t, { a: 'start', i: /^[a-z]$/.test(o.slant.t) });
    }
    return mk(s, pts, 24);
  }
  function sphereSvg(R, rt, d) {
    let s = S.circle(0, 0, R) + frontE(0, 0, R, 0.3 * R) + backE(0, 0, R, 0.3 * R);
    if (rt) s += S.line(d ? -R : 0, 0, R, 0, { dash: true }) + S.dot(0, 0, 1.6) + tx(d ? 0 : R / 2, -8, rt, { i: /^[a-z]$/.test(rt) });
    return mk(s, [[-R, -R], [R, R]], 22);
  }

  /* ---------- nets (drawn to scale) ---------- */
  const kfit = (w, h, mw, mh) => Math.min((mw || 230) / w, (mh || 150) / h);
  const rc = (x0, y0, x1, y1, dash) => S.poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], dash ? { dash: true } : undefined);
  /** cuboid net (cross shape). labs {l,w,h}: edge labels; miss: name of a face drawn dashed with '?' */
  function cuboidNet(l, w, h, labs, miss) {
    const k = kfit(2 * l + 2 * w, h + 2 * w);
    const F = { left: [0, w, w, w + h], front: [w, w + l, w, w + h], right: [w + l, 2 * w + l, w, w + h], back: [2 * w + l, 2 * w + 2 * l, w, w + h], top: [w, w + l, 0, w], bottom: [w, w + l, w + h, 2 * w + h] };
    let s = '';
    for (const [nm, f] of Object.entries(F)) {
      s += rc(f[0] * k, f[2] * k, f[1] * k, f[3] * k, nm === miss);
      if (nm === miss) s += tx(((f[0] + f[1]) / 2) * k, ((f[2] + f[3]) / 2) * k, '?', { s: 16 });
    }
    labs = labs || {};
    if (labs.l) s += tx((w + l / 2) * k, -9, labs.l);
    if (labs.w) s += tx(w * k - 6, (w / 2) * k, labs.w, { a: 'end' });
    if (labs.h) s += tx(-6, (w + h / 2) * k, labs.h, { a: 'end' });
    return mk(s, [[0, 0], [(2 * l + 2 * w) * k, (2 * w + h) * k], [-30, 0]], 20);
  }
  function cylNet(r, h, labs) {
    labs = labs || {};
    const W = 2 * Math.PI * r, k = kfit(W, h + 4 * r, 240, 170);
    const cx = (W / 2) * k;
    let s = rc(0, 0, W * k, h * k) + S.circle(cx, -r * k, r * k) + S.circle(cx, (h + r) * k, r * k);
    if (labs.r) s += S.line(cx, -r * k, cx + r * k, -r * k, { dash: true }) + S.dot(cx, -r * k, 1.6) + tx(cx + (r * k) / 2, -r * k - 8, labs.r);
    if (labs.w) s += tx(cx, (h / 2) * k, labs.w);
    if (labs.h) s += tx(-6, (h / 2) * k, labs.h, { a: 'end' });
    return mk(s, [[0, -2 * r * k], [W * k, (h + 2 * r) * k], [-30, 0]], 18);
  }
  /** cone net: sector (radius l, angle th) + base circle of radius r */
  function coneNet(r, l, th, labs) {
    labs = labs || {};
    const half = rad(th / 2), sx = l * Math.sin(half), sy = l * Math.cos(half);
    const k = kfit(2 * Math.max(r, th >= 180 ? l : sx), l + 2 * r - Math.min(0, sy), 230, 190);
    const P = (x, y) => `${f1(x * k)},${f1(y * k)}`;
    let s = S.path(`M0,0 L${P(-sx, sy)} A${f1(l * k)},${f1(l * k)} 0 ${th > 180 ? 1 : 0} 0 ${P(sx, sy)} Z`) + S.circle(0, (l + r) * k, r * k);
    if (labs.l) s += tx(-sx * k * 0.5 - 8, sy * k * 0.5, labs.l, { a: 'end' });
    if (labs.th) s += tx(0, Math.min(sy, l * 0.35) * k * 0.9 + 4, labs.th, { s: 11 });
    if (labs.r) s += S.line(0, (l + r) * k, r * k, (l + r) * k, { dash: true }) + S.dot(0, (l + r) * k, 1.6) + tx((r * k) / 2, (l + r) * k - 8, labs.r);
    const R = Math.max(r, th >= 180 ? l : sx);
    return mk(s, [[-R * k, Math.min(0, sy) * k], [R * k, (l + 2 * r) * k]], 24);
  }
  const regV = (nn, R, cx, cy, up) =>
    Array.from({ length: nn }, (_, i) => {
      const a = rad((up ? -90 : 90) + 180 / nn + (360 * i) / nn);
      return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
    });
  /** net of a regular n-gonal pyramid: base polygon (side s) with n isosceles triangles of slant height l */
  function pyrNet(nn, side, l, labs) {
    labs = labs || {};
    const Rr = side / (2 * Math.sin(Math.PI / nn)), ap = side / (2 * Math.tan(Math.PI / nn));
    const ext = ap + l, k = kfit(2 * Math.max(Rr, ext), 2 * Math.max(Rr, ext), 230, 190);
    const B = regV(nn, Rr * k, 0, 0, false);
    let s = S.poly(B), pts = B.slice();
    const bi = B.map((a, i) => mid(a, B[(i + 1) % nn])[1]).reduce((bb, y, i, arr) => (y > arr[bb] ? i : bb), 0);
    B.forEach((a, i) => {
      const b = B[(i + 1) % nn], m = mid(a, b), d = Math.hypot(m[0], m[1]);
      const apex = [m[0] + (m[0] / d) * l * k, m[1] + (m[1] / d) * l * k];
      s += S.poly([a, b, apex]);
      pts.push(apex);
      if (i === bi && labs.s) s += eLab(a, b, [0, 0], labs.s, -11);
      if (i === 0) {
        if (labs.l) { const q = ptp(m, apex, 0.6); s += ln(m, apex, true) + tx(q[0] + (m[0] > 0.5 * k ? 10 : m[0] < -0.5 * k ? -10 : 0), q[1] + (Math.abs(m[0]) <= 0.5 * k ? (m[1] > 0 ? 10 : -10) * 0 : 0) + (Math.abs(m[0]) <= 0.5 * k ? 0 : -8), labs.l); }
      }
    });
    return mk(s, pts, 26);
  }
  /** point above the base (0,0)-(base,0) of a triangle whose left side is a, right side is b */
  const triApex = (base, a, b) => {
    const x = (base * base + a * a - b * b) / (2 * base), y2 = a * a - x * x;
    need(y2 > 1e-9);
    return [x, Math.sqrt(y2)];
  };
  /** net of a triangular prism (sides p,q,s of the triangle, length L): three rectangles in a row + two triangles */
  function triPrismNet(p, q, sd, L, labs) {
    labs = labs || {};
    const tp = triApex(q, p, sd), tb = triApex(sd, q, p);
    const tot = p + q + sd, k = kfit(tot, L + tp[1] + tb[1], 250, 170);
    const Y0 = tp[1] * k, X = [0, p * k, (p + q) * k, tot * k];
    let s = '';
    for (let i = 0; i < 3; i++) s += rc(X[i], Y0, X[i + 1], Y0 + L * k);
    s += S.poly([[X[1], Y0], [X[2], Y0], [X[1] + tp[0] * k, Y0 - tp[1] * k]]);
    const yb = Y0 + L * k;
    s += S.poly([[X[2], yb], [X[3], yb], [X[2] + tb[0] * k, yb + tb[1] * k]]);
    if (labs.L) s += tx(-6, Y0 + (L * k) / 2, labs.L, { a: 'end' });
    if (labs.p) s += tx(X[1] / 2, yb + 9, labs.p);
    if (labs.q) s += tx((X[1] + X[2]) / 2, yb + 9, labs.q);
    if (labs.s) s += tx((X[2] + X[3]) / 2, Y0 - 9, labs.s);
    return mk(s, [[-24, 0], [tot * k, (L + tp[1] + tb[1]) * k + 18]], 16);
  }
  /** net of a regular n-gonal prism: strip of n rectangles (side x L) + two polygons */
  function polyPrismNet(nn, side, L, labs) {
    labs = labs || {};
    const ap = side / (2 * Math.tan(Math.PI / nn)), Rr = side / (2 * Math.sin(Math.PI / nn));
    const H = L + 2 * (ap + Rr), k = kfit(Math.max(nn * side, 2 * Rr), H, 250, 190);
    const s0 = side * k, Y0 = (ap + Rr) * k;
    let s = '';
    for (let i = 0; i < nn; i++) s += rc(i * s0, Y0, (i + 1) * s0, Y0 + L * k);
    const cx = s0 / 2;
    s += S.poly(regV(nn, Rr * k, cx, Y0 - ap * k, false)) + S.poly(regV(nn, Rr * k, cx, Y0 + L * k + ap * k, true));
    if (labs.L) s += tx(-6, Y0 + (L * k) / 2, labs.L, { a: 'end' });
    if (labs.s) s += tx(s0 * 1.5, Y0 + L * k + 9, labs.s);
    return mk(s, [[-24, 0], [Math.max(nn * side, 2 * Rr) * k, (L + 2 * (ap + Rr)) * k]], 16);
  }
  /** rolling a cube over a hexomino: does it fold into a cube? cells = [[c,r],…] */
  function foldsToCube(cells) {
    const key = (c) => c[0] + ',' + c[1];
    const has = new Map(cells.map((c) => [key(c), c]));
    const seen = new Map();
    const roll = (st, dc, dr) => {
      const o = Object.assign({}, st);
      if (dc === 1) Object.assign(o, { b: st.e, e: st.t, t: st.w, w: st.b });
      else if (dc === -1) Object.assign(o, { b: st.w, w: st.t, t: st.e, e: st.b });
      else if (dr === -1) Object.assign(o, { b: st.n, n: st.t, t: st.s, s: st.b });
      else Object.assign(o, { b: st.s, s: st.t, t: st.n, n: st.b });
      return o;
    };
    const start = cells[0], q = [[start, { b: 0, t: 1, n: 2, s: 3, e: 4, w: 5 }]];
    seen.set(key(start), 0);
    while (q.length) {
      const [c, st] = q.pop();
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nb = [c[0] + dc, c[1] + dr];
        if (!has.has(key(nb)) || seen.has(key(nb))) continue;
        const ns = roll(st, dc, dr);
        seen.set(key(nb), ns.b);
        q.push([nb, ns]);
      }
    }
    return new Set(seen.values()).size === 6 && seen.size === 6;
  }
  function randHexo(r) {
    const cells = [[0, 0]];
    while (cells.length < 6) {
      const c = r.pick(cells), d = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      const nb = [c[0] + d[0], c[1] + d[1]];
      if (!cells.some((x) => x[0] === nb[0] && x[1] === nb[1])) cells.push(nb);
    }
    const mc = Math.min(...cells.map((c) => c[0])), mr = Math.min(...cells.map((c) => c[1]));
    return cells.map((c) => [c[0] - mc, c[1] - mr]);
  }
  const hexoKey = (cells) => cells.map((c) => c.join(',')).sort().join(';');
  /** several nets side by side, each labelled A, B, … ; s = square size */
  function netsRow(list, s) {
    s = s || 17;
    let x = 0, out = '', pts = [];
    list.forEach((cells, i) => {
      const w = Math.max(...cells.map((c) => c[0])) + 1, h = Math.max(...cells.map((c) => c[1])) + 1;
      for (const c of cells) out += rc(x + c[0] * s, c[1] * s, x + (c[0] + 1) * s, (c[1] + 1) * s);
      out += tx(x + (w * s) / 2, h * s + 14, 'ABCD'[i], { s: 13, b: true });
      pts.push([x, 0], [x + w * s, h * s + 20]);
      x += w * s + 26;
    });
    return mk(out, pts, 10);
  }
  const gridFig = (cells, s) => netsRow([cells], s || 22);

  /* ================================================================= 6.1 */
  const art = (s) => (/^[aeiou]/i.test(s) ? 'an ' : 'a ') + s;
  const POL = { 3: ['triangular', 'segi tiga'], 4: ['square', 'segi empat sama'], 5: ['pentagonal', 'segi lima'], 6: ['hexagonal', 'segi enam'], 7: ['heptagonal', 'segi tujuh'], 8: ['octagonal', 'segi lapan'], 9: ['nonagonal', 'segi sembilan'], 10: ['decagonal', 'segi sepuluh'], 11: ['11-sided', '11 sisi'], 12: ['dodecagonal', 'segi dua belas'] };
  const BAS = { 3: ['triangle', 'segi tiga'], 4: ['square', 'segi empat sama'], 5: ['pentagon', 'segi lima'], 6: ['hexagon', 'segi enam'], 8: ['octagon', 'segi lapan'] };
  const QN = { F: ['faces', 'permukaan'], E: ['edges', 'tepi'], V: ['vertices', 'bucu'] };
  const mkPrism = (nn) => ({ k: 'prism', n: nn, F: nn + 2, E: 3 * nn, V: 2 * nn, en: nn === 4 ? 'cuboid' : `${POL[nn][0]} prism`, ms: nn === 4 ? 'kuboid' : `prisma ${POL[nn][1]}` });
  const mkPyr = (nn) => ({ k: 'pyr', n: nn, F: nn + 1, E: 2 * nn, V: nn + 1, en: nn === 3 ? 'triangular pyramid' : nn === 4 ? 'square-based pyramid' : `${POL[nn][0]} pyramid`, ms: `piramid tapak ${POL[nn][1]}` });
  const CUBE = { k: 'prism', n: 4, F: 6, E: 12, V: 8, en: 'cube', ms: 'kubus', cube: true };
  const CYL = { k: 'cyl', en: 'cylinder', ms: 'silinder' }, CONE = { k: 'cone', en: 'cone', ms: 'kon' }, SPH = { k: 'sph', en: 'sphere', ms: 'sfera' };
  const PRI = [3, 4, 5, 6, 8].map(mkPrism), PYR = [3, 4, 5, 6, 8].map(mkPyr);
  const POLYH = PRI.concat([CUBE], PYR), CURV = [CYL, CONE, SPH], ALLS = POLYH.concat(CURV);
  const nameOf = (s) => T(s.en, s.ms);
  /** counting rules for a prism / pyramid on an n-sided base */
  const FML = { prism: { F: 'n + 2', E: '3n', V: '2n' }, pyr: { F: 'n + 1', E: '2n', V: 'n + 1' } };
  const FSUB = { prism: { F: (m) => `${m} + 2`, E: (m) => `3 \\times ${m}`, V: (m) => `2 \\times ${m}` }, pyr: { F: (m) => `${m} + 1`, E: (m) => `2 \\times ${m}`, V: (m) => `${m} + 1` } };
  /** one working line: how the F/E/V count of a prism/pyramid follows from its base */
  const fevLine = (s, q) => T(`${SPM.cap(QN[q][0])} of a ${s.k === 'prism' ? 'prism' : 'pyramid'} $= ${FML[s.k][q]}$; the base has ${s.n} sides, so $${FSUB[s.k][q](s.n)} = ${s[q]}$.`, `${SPM.cap(QN[q][1])} ${s.k === 'prism' ? 'prisma' : 'piramid'} $= ${FML[s.k][q]}$; tapaknya mempunyai ${s.n} sisi, maka $${FSUB[s.k][q](s.n)} = ${s[q]}$.`);
  const solidFig = (s) => {
    if (s.cube) return cuboidFig(8, 8, 8, ['', '', '']);
    if (s.k === 'prism') return s.n === 4 ? cuboidFig(12, 6, 8, ['', '', '']) : upSvg(regPoly(s.n, 46, 0.32), 66, 0, false, {});
    if (s.k === 'pyr') return upSvg(regPoly(s.n, 46, 0.32, s.n === 4 ? 0 : 0.5), 84, 0, true, {});
    if (s.k === 'cyl') return stackSvg([{ t: 'cyl', h: 70 }], 34, {});
    if (s.k === 'cone') return stackSvg([{ t: 'cone', h: 76 }], 34, {});
    return sphereSvg(42);
  };
  /** oblique / right solid figure: kind 'prism'|'pyr'|'cyl'|'cone' */
  const leanFig = (kind, nn, lean) => {
    const sx = lean ? 34 : 0;
    if (kind === 'cyl' || kind === 'cone') return roundSvg(kind, 34, 74, sx);
    return upSvg(regPoly(nn, 46, 0.32, nn === 4 ? 0 : 0.5), 74, sx, kind === 'pyr', { axis: true });
  };
  const propsOf = (s) => {
    if (s.k === 'cyl') return [T('two flat circular faces and one curved surface', 'dua permukaan rata berbentuk bulatan dan satu permukaan melengkung'), T('a curved surface and two identical circular ends', 'satu permukaan melengkung dan dua hujung bulat yang sama')];
    if (s.k === 'cone') return [T('one flat circular face, one curved surface and one vertex', 'satu permukaan rata berbentuk bulatan, satu permukaan melengkung dan satu bucu'), T('a circular base and a curved surface that narrows to a single point', 'tapak bulat dan satu permukaan melengkung yang mengecil kepada satu titik')];
    if (s.k === 'sph') return [T('one curved surface and no edges or vertices', 'satu permukaan melengkung tanpa tepi atau bucu'), T('every point on its surface the same distance from the centre', 'setiap titik pada permukaannya berjarak sama dari pusat')];
    if (s.cube) return [T('six identical square faces', 'enam permukaan segi empat sama yang sama saiz'), T('12 equal edges and 8 vertices', '12 tepi yang sama panjang dan 8 bucu')];
    if (s.k === 'prism' && s.n === 4) return [T('six rectangular faces, opposite faces being equal', 'enam permukaan segi empat tepat, permukaan bertentangan adalah sama'), T('8 vertices, 12 edges and only rectangular faces', '8 bucu, 12 tepi dan hanya permukaan segi empat tepat')];
    if (s.k === 'prism') return [T(`two parallel ${BAS[s.n][0]} faces joined by ${s.n} rectangular faces`, `dua permukaan ${BAS[s.n][1]} yang selari disambung oleh ${s.n} permukaan segi empat tepat`), T(`${s.F} faces, ${s.V} vertices and a ${BAS[s.n][0]} at each end`, `${s.F} permukaan, ${s.V} bucu dan ${BAS[s.n][1]} pada setiap hujung`)];
    return [T(`a ${BAS[s.n][0]} base and ${s.n} triangular faces that meet at one vertex`, `tapak ${BAS[s.n][1]} dan ${s.n} permukaan segi tiga yang bertemu pada satu bucu`), T(`${s.F} faces and ${s.V} vertices, with a ${BAS[s.n][0]} for its base`, `${s.F} permukaan dan ${s.V} bucu, dengan tapak berbentuk ${BAS[s.n][1]}`)];
  };
  const kindOf = (s) => (s.k === 'prism' ? T('prism', 'prisma') : s.k === 'pyr' ? T('pyramid', 'piramid') : T('neither a prism nor a pyramid', 'bukan prisma dan bukan piramid'));
  const OBJ = [
    ['a tin of sardines', 'tin sardin', CYL], ['an ice-cream cone', 'kon aiskrim', CONE], ['a football', 'bola sepak', SPH], ['a die', 'dadu', CUBE],
    ['a shoe box', 'kotak kasut', PRI[1]], ['a camping tent with a rectangular floor and triangular ends', 'khemah perkhemahan yang berlantai segi empat tepat dan berhujung segi tiga', PRI[0]],
    ['the Great Pyramid of Giza', 'Piramid Agung Giza', PYR[1]], ['a party hat', 'topi parti', CONE], ['a marble', 'guli', SPH], ['a round water tank', 'tangki air bulat', CYL],
    ['a tissue box', 'kotak tisu', PRI[1]], ['a Rubik\'s cube', 'kubus Rubik', CUBE], ['an unsharpened hexagonal pencil (without the tip)', 'pensel segi enam yang belum diasah (tanpa hujung)', PRI[3]],
    ['a bowling ball', 'bola boling', SPH], ['a bar of soap', 'seketul sabun', PRI[1]], ['a paper cone used to hold roasted peanuts', 'kon kertas untuk mengisi kacang goreng', CONE],
  ];
  const cell = (v) => `<b>${v}</b>`;

  const g61e = [
    /* count faces / edges / vertices */
    (r) => {
      const s = r.pick(POLYH), q = r.pick(['F', 'E', 'V']);
      return { q: T(`How many ${QN[q][0]} does ${art(s.en)} have?`, `Berapakah bilangan ${QN[q][1]} bagi ${s.ms}?`), a: T(`${s[q]}`), fig: r.chance(0.5) ? solidFig(s) : undefined, w: W(fevLine(s, q)), sp: 'xs' };
    },
    (r) => {
      const s = r.pick(POLYH), q = r.pick(['F', 'E', 'V']);
      return { q: T(`Count the ${QN[q][0]} of the solid shown. (Dashed lines are hidden edges.)`, `Kira bilangan ${QN[q][1]} bagi pepejal yang ditunjukkan. (Garis putus-putus ialah tepi tersembunyi.)`), fig: solidFig(s), a: T(`${s[q]}`), w: W(T(`Count carefully in the diagram — the dashed lines are hidden edges.`, `Kira dengan teliti dalam rajah — garis putus-putus ialah tepi tersembunyi.`), fevLine(s, q)), sp: 'xs' };
    },
    /* identify from a description */
    (r) => {
      const s = r.pick(ALLS), p = r.pick(propsOf(s)), f = r.int(0, 1);
      return { q: f ? T(`Which solid has ${p.en}?`, `Pepejal manakah yang mempunyai ${p.ms}?`) : T(`Name the solid described: it has ${p.en}.`, `Namakan pepejal yang diperihalkan: ia mempunyai ${p.ms}.`), a: nameOf(s), w: W(T(`Check each solid against the description: only ${art(s.en)} has ${p.en}.`, `Semak setiap pepejal dengan perihalan itu: hanya ${s.ms} yang mempunyai ${p.ms}.`)), sp: 'xs' };
    },
    /* real objects */
    (r) => {
      const o = r.pick(OBJ);
      return { q: T(`Which solid has the shape of ${o[0]}?`, `Pepejal manakah yang mempunyai bentuk ${o[1]}?`), a: nameOf(o[2]), w: W(T(`Picture the surfaces of ${o[0]}: they match ${art(o[2].en)}.`, `Bayangkan permukaan ${o[1]}: ia sepadan dengan ${o[2].ms}.`)), sp: 'xs' };
    },
    /* prism, pyramid or neither */
    (r) => {
      const s = r.pick(ALLS);
      return { q: T(`Is ${art(s.en)} a prism, a pyramid, or neither?`, `Adakah ${s.ms} sebuah prisma, piramid atau bukan kedua-duanya?`), a: T(`${SPM.cap(kindOf(s).en)}`, `${SPM.cap(kindOf(s).ms)}`), w: W(T(`A prism has two identical parallel bases joined by flat side faces; a pyramid has one base and side faces meeting at an apex; anything with a curved surface is neither.`, `Prisma mempunyai dua tapak yang sama dan selari disambung oleh permukaan sisi yang rata; piramid mempunyai satu tapak dan permukaan sisi yang bertemu di puncak; apa-apa yang mempunyai permukaan melengkung bukan kedua-duanya.`), T(`${SPM.cap(art(s.en))}: ${kindOf(s).en}.`, `${SPM.cap(s.ms)}: ${kindOf(s).ms}.`)), sp: 'xs' };
    },
    /* true / false */
    (r) => {
      const s = r.pick(POLYH), q = r.pick(['F', 'E', 'V']), ok = r.chance();
      const v = ok ? s[q] : s[q] + r.pick([-2, -1, 1, 2]);
      need(v > 0);
      return { q: T(`True or false: ${art(s.en)} has ${v} ${QN[q][0]}.`, `Betul atau salah: ${s.ms} mempunyai ${v} ${QN[q][1]}.`), a: ok ? T('True', 'Betul') : T(`False; it has ${s[q]} ${QN[q][0]}.`, `Salah; ia mempunyai ${s[q]} ${QN[q][1]}.`), w: W(fevLine(s, q), T(`The statement says ${v}, so it is ${ok ? 'true' : 'false'}.`, `Pernyataan itu menyebut ${v}, maka ia ${ok ? 'betul' : 'salah'}.`)), sp: 'xs' };
    },
    /* curved solids */
    (r) => {
      const s = r.pick(CURV), t = { cyl: [2, 1, 0], cone: [1, 1, 1], sph: [0, 1, 0] }[s.k];
      return { q: T(`State the number of flat faces, curved surfaces and vertices of ${art(s.en)}.`, `Nyatakan bilangan permukaan rata, permukaan melengkung dan bucu bagi ${s.ms}.`), a: T(`${t[0]} flat, ${t[1]} curved, ${t[2]} vertices`, `${t[0]} rata, ${t[1]} melengkung, ${t[2]} bucu`), w: W(T(`Cylinder: 2 flat circular faces, 1 curved surface, no vertex. Cone: 1 flat face, 1 curved surface, 1 vertex. Sphere: 1 curved surface only.`, `Silinder: 2 permukaan bulat yang rata, 1 permukaan melengkung, tiada bucu. Kon: 1 permukaan rata, 1 permukaan melengkung, 1 bucu. Sfera: 1 permukaan melengkung sahaja.`)), sp: 's' };
    },
    (r) => {
      const xs = r.sample(ALLS, 5);
      const cv = xs.filter((s) => CURV.includes(s));
      need(cv.length >= 1 && cv.length <= 3);
      return { q: T(`Which of these solids have a curved surface: ${xs.map((s) => s.en).join(', ')}?`, `Antara pepejal berikut, yang manakah mempunyai permukaan melengkung: ${xs.map((s) => s.ms).join(', ')}?`), a: T(cv.map((s) => s.en).join(', '), cv.map((s) => s.ms).join(', ')), w: W(T(`Only the cylinder, the cone and the sphere have a curved surface; every prism and pyramid is made of flat faces only.`, `Hanya silinder, kon dan sfera mempunyai permukaan melengkung; setiap prisma dan piramid hanya terdiri daripada permukaan rata.`)), sp: 's' };
    },
    null,
    /* complete the table */
    (r) => {
      const ss = r.sample(POLYH, 3), ks = ['F', 'E', 'V'];
      const blank = new Set();
      while (blank.size < 4) blank.add(r.int(0, 8));
      need([0, 1, 2].every((i) => [0, 1, 2].filter((j) => blank.has(i * 3 + j)).length <= 2));
      const rows = ss.map((s, i) => [s.en].concat(ks.map((k, j) => (blank.has(i * 3 + j) ? '?' : String(s[k])))));
      const rowsM = ss.map((s, i) => [s.ms].concat(ks.map((k, j) => (blank.has(i * 3 + j) ? '?' : String(s[k])))));
      const miss = [...blank].sort((a, b) => a - b).map((c) => `${QN[ks[c % 3]][0]} of ${ss[Math.floor(c / 3)].en} = ${ss[Math.floor(c / 3)][ks[c % 3]]}`);
      const missM = [...blank].sort((a, b) => a - b).map((c) => `${QN[ks[c % 3]][1]} ${ss[Math.floor(c / 3)].ms} = ${ss[Math.floor(c / 3)][ks[c % 3]]}`);
      const mt = (rr, h) => SPM.table(rr, { head: h, rowHead: true });
      return { q: T(`Replace each ? with the correct number.<br>${mt(rows, ['Solid', 'Faces', 'Edges', 'Vertices'])}`, `Gantikan setiap ? dengan nombor yang betul.<br>${mt(rowsM, ['Pepejal', 'Permukaan', 'Tepi', 'Bucu'])}`), a: T(miss.join('; '), missM.join('; ')), w: W(T(`Prism: $F = n + 2$, $E = 3n$, $V = 2n$. Pyramid: $F = n + 1$, $E = 2n$, $V = n + 1$.`, `Prisma: $F = n + 2$, $E = 3n$, $V = 2n$. Piramid: $F = n + 1$, $E = 2n$, $V = n + 1$.`), ...[...blank].sort((a, b) => a - b).map((c) => fevLine(ss[Math.floor(c / 3)], ks[c % 3]))), sp: 'm' };
    },
  ];
  g61e[8] = (r) => {
    const s = r.pick(ALLS);
    return { q: r.chance() ? T('Name the solid shown.', 'Namakan pepejal yang ditunjukkan.') : T('What is the name of the solid in the figure?', 'Apakah nama pepejal dalam rajah?'), fig: solidFig(s), a: nameOf(s), w: W(POLYH.includes(s) ? T(`It has ${s.F} faces, ${s.E} edges and ${s.V} vertices, with ${s.k === 'prism' ? `two ${BAS[s.n][0]} bases` : `${art(BAS[s.n][0])} base and side faces meeting at an apex`}.`, `Ia mempunyai ${s.F} permukaan, ${s.E} tepi dan ${s.V} bucu, dengan ${s.k === 'prism' ? `dua tapak ${BAS[s.n][1]}` : `tapak ${BAS[s.n][1]} dan permukaan sisi yang bertemu di puncak`}.`) : T(`It has a curved surface, so it is neither a prism nor a pyramid.`, `Ia mempunyai permukaan melengkung, maka ia bukan prisma dan bukan piramid.`), nameOf(s)), sp: 'xs' };
  };

  const g61m = [
    /* find the base from a count */
    (r) => {
      const nn = r.int(3, 12), pr = r.chance(), q = r.pick(['F', 'E', 'V']);
      const s = pr ? mkPrism(nn) : mkPyr(nn), oth = r.pick(['F', 'E', 'V'].filter((x) => x !== q));
      const nm = pr ? T('prism', 'prisma') : T('pyramid', 'piramid');
      return { q: T(`A ${nm.en} has ${s[q]} ${QN[q][0]}. How many sides does its base have, and how many ${QN[oth][0]} does it have?`, `Sebuah ${nm.ms} mempunyai ${s[q]} ${QN[q][1]}. Berapakah bilangan sisi tapaknya, dan berapakah bilangan ${QN[oth][1]} yang dimilikinya?`), a: T(`Base: ${nn} sides; ${s[oth]} ${QN[oth][0]}`, `Tapak: ${nn} sisi; ${s[oth]} ${QN[oth][1]}`), w: T(pr ? { F: `faces $= n + 2$`, E: `edges $= 3n$`, V: `vertices $= 2n$` }[q] : { F: `faces $= n + 1$`, E: `edges $= 2n$`, V: `vertices $= n + 1$` }[q], pr ? { F: `permukaan $= n + 2$`, E: `tepi $= 3n$`, V: `bucu $= 2n$` }[q] : { F: `permukaan $= n + 1$`, E: `tepi $= 2n$`, V: `bucu $= n + 1$` }[q]), sp: 's' };
    },
    /* compare two polyhedra */
    (r) => {
      const [x, y] = r.sample(POLYH, 2), q = r.pick(['F', 'E', 'V']);
      need(x[q] !== y[q]);
      const big = x[q] > y[q] ? x : y;
      return { q: T(`Compare ${art(x.en)} with ${art(y.en)}. Which has more ${QN[q][0]}, and by how many?`, `Bandingkan ${x.ms} dengan ${y.ms}. Yang manakah mempunyai lebih banyak ${QN[q][1]}, dan berapa banyak lebihnya?`), a: T(`The ${big.en} has more (${x[q]} and ${y[q]} ${QN[q][0]}); difference $= ${Math.abs(x[q] - y[q])}$`, `${SPM.cap(big.ms)} lebih banyak (${x[q]} dan ${y[q]} ${QN[q][1]}); beza $= ${Math.abs(x[q] - y[q])}$`), w: W(fevLine(x, q), fevLine(y, q), `$${Math.max(x[q], y[q])} - ${Math.min(x[q], y[q])} = ${Math.abs(x[q] - y[q])}$`), sp: 's' };
    },
    /* sort into prisms, pyramids, others */
    (r) => {
      const xs = r.sample(ALLS, 6);
      const g = (k) => xs.filter((s) => (k === 'p' ? s.k === 'prism' : k === 'y' ? s.k === 'pyr' : s.k !== 'prism' && s.k !== 'pyr'));
      const fmt = (a, l) => (a.length ? a.map((s) => s[l]).join(', ') : '-');
      return { q: T(`Sort these solids into prisms, pyramids and others: ${xs.map((s) => s.en).join(', ')}.`, `Asingkan pepejal berikut kepada prisma, piramid dan lain-lain: ${xs.map((s) => s.ms).join(', ')}.`), a: T(`Prisms: ${fmt(g('p'), 'en')}; pyramids: ${fmt(g('y'), 'en')}; others: ${fmt(g('o'), 'en')}`, `Prisma: ${fmt(g('p'), 'ms')}; piramid: ${fmt(g('y'), 'ms')}; lain-lain: ${fmt(g('o'), 'ms')}`), w: W(T(`A prism has two identical parallel bases joined by flat side faces; a pyramid has one base and an apex; a cylinder, cone or sphere has a curved surface, so it is neither.`, `Prisma mempunyai dua tapak yang sama dan selari disambung oleh permukaan sisi yang rata; piramid mempunyai satu tapak dan satu puncak; silinder, kon atau sfera mempunyai permukaan melengkung, maka ia bukan kedua-duanya.`)), sp: 'm' };
    },
    /* odd one out */
    (r) => {
      const grp = r.pick([['prism', PRI.concat([CUBE]), 'prisms', 'prisma'], ['pyramid', PYR, 'pyramids', 'piramid'], ['curved', CURV, 'solids with a curved surface', 'pepejal berpermukaan melengkung']]);
      const other = grp[0] === 'curved' ? r.pick(POLYH) : r.pick(ALLS.filter((s) => (grp[0] === 'prism' ? s.k !== 'prism' : s.k !== 'pyr')));
      need(grp[0] !== 'curved' || true);
      const three = r.sample(grp[1], 3);
      need(!three.includes(other));
      if (grp[0] !== 'curved') need(other.k !== (grp[0] === 'prism' ? 'prism' : 'pyr'));
      const opts = r.shuffle(three.concat([other]));
      const kind = grp[0] === 'curved' ? T('has all flat faces', 'mempunyai semua permukaan rata') : T(`is not a ${grp[0]}`, `bukan ${grp[3]}`);
      return { q: T(`Three of these solids are alike. Which one is the odd one out? ${opts.map((s) => s.en).join(', ')}.`, `Tiga daripada pepejal ini serupa. Yang manakah berbeza? ${opts.map((s) => s.ms).join(', ')}.`), a: T(`${other.en} (it ${kind.en})`, `${other.ms} (ia ${kind.ms})`), w: W(T(`Three of the four ${grp[0] === 'curved' ? 'have a curved surface' : `are ${grp[2]}`}.`, `Tiga daripada empat itu ${grp[0] === 'curved' ? 'mempunyai permukaan melengkung' : `ialah ${grp[3]}`}.`), T(`${SPM.cap(other.en)} ${kind.en}, so it is the odd one out.`, `${SPM.cap(other.ms)} ${kind.ms}, maka ia yang berbeza.`)), sp: 's' };
    },
    /* right or oblique from the figure */
    (r) => {
      const kind = r.pick(['prism', 'pyr', 'cyl', 'cone']), lean = r.chance(), nn = r.pick([3, 5, 6]);
      const nm = { prism: ['prism', 'prisma'], pyr: ['pyramid', 'piramid'], cyl: ['cylinder', 'silinder'], cone: ['cone', 'kon'] }[kind];
      return { q: T(`The figure shows a ${nm[0]}. State whether it is a right ${nm[0]} or an oblique ${nm[0]}, and give a reason.`, `Rajah menunjukkan sebuah ${nm[1]}. Nyatakan sama ada ia ${nm[1]} tegak atau ${nm[1]} condong, dan berikan satu sebab.`), fig: leanFig(kind, nn, lean), a: lean ? T(`Oblique: the axis leans, it is not perpendicular to the base.`, `Condong: paksi condong, tidak serenjang dengan tapak.`) : T(`Right: the axis is perpendicular to the base (right-angle mark).`, `Tegak: paksi serenjang dengan tapak (tanda sudut tegak).`), w: W(T(`In a right solid the axis (or the line to the apex) is perpendicular to the base; in an oblique solid it leans.`, `Dalam pepejal tegak, paksi (atau garis ke puncak) serenjang dengan tapak; dalam pepejal condong, ia condong.`), T(lean ? `In the figure the axis is not perpendicular to the base.` : `In the figure the axis is perpendicular to the base.`, lean ? `Dalam rajah, paksi tidak serenjang dengan tapak.` : `Dalam rajah, paksi serenjang dengan tapak.`)), sp: 's' };
    },
    /* MCQ: which statement is true */
    (r) => {
      const s = r.pick(POLYH), q = r.pick(['F', 'E', 'V']);
      const bad = [];
      for (const x of r.shuffle(['F', 'E', 'V'])) if (bad.length < 3) bad.push([x, x === q ? s[x] + r.pick([-2, -1, 1, 2]) : s[x] + r.pick([-2, -1, 1, 2, 3])]);
      const keep = r.shuffle([[q, s[q]]].concat(bad.filter((b) => b[0] !== q).slice(0, 2), [[q === 'F' ? 'E' : 'F', s[q === 'F' ? 'E' : 'F'] + r.pick([1, 2, -1])]]));
      need(keep.every((k) => k[1] > 0) && new Set(keep.map((k) => k[0] + k[1])).size === 4);
      const idx = keep.findIndex((k) => k[0] === q && k[1] === s[q]);
      const L = 'ABCD';
      const opts = (l) => keep.map((k, i) => `(${L[i]}) ${l === 0 ? `${k[1]} ${QN[k[0]][0]}` : `${k[1]} ${QN[k[0]][1]}`}`).join('&emsp;');
      return { q: T(`Which of the following describes ${art(s.en)}?<br>${opts(0)}`, `Antara berikut, yang manakah menerangkan ${s.ms}?<br>${opts(1)}`), a: T(`(${L[idx]}) ${s[q]} ${QN[q][0]}`, `(${L[idx]}) ${s[q]} ${QN[q][1]}`), w: W(fevLine(s, q), T(`Only option (${L[idx]}) matches.`, `Hanya pilihan (${L[idx]}) yang menepatinya.`)), sp: 'xs' };
    },
    /* lateral faces */
    (r) => {
      const s = r.pick(PRI.concat(PYR, [CUBE])), pr = s.k === 'prism';
      const lat = s.k === 'prism' ? s.n : s.n;
      const nm = pr ? (s.n === 4 ? T('rectangles', 'segi empat tepat') : T('rectangles', 'segi empat tepat')) : T('triangles', 'segi tiga');
      const shape = (pr ? (s.cube ? T('squares', 'segi empat sama') : s.n === 4 ? T('rectangles', 'segi empat tepat') : T(`${BAS[s.n][0]}s`, BAS[s.n][1])) : T(BAS[s.n][0], BAS[s.n][1]));
      return { q: T(`${SPM.cap(art(s.en))} has how many ${pr ? 'side faces' : 'triangular faces'}? What is the shape of its ${pr ? 'two ends (bases)' : 'base'}?`, `Berapakah bilangan ${pr ? 'permukaan sisi' : 'permukaan segi tiga'} bagi ${s.ms}? Apakah bentuk ${pr ? 'dua hujung (tapak)nya' : 'tapaknya'}?`), a: T(`${lat} ${pr ? 'rectangular ' : 'triangular '}faces; ${pr ? 'ends' : 'base'}: ${s.cube ? 'squares' : s.n === 4 && pr ? 'rectangles' : BAS[s.n][0]}`, `${lat} permukaan ${pr ? 'segi empat tepat' : 'segi tiga'}; ${pr ? 'hujung' : 'tapak'}: ${s.cube ? 'segi empat sama' : s.n === 4 && pr ? 'segi empat tepat' : BAS[s.n][1]}`), w: W(T(pr ? `A prism has one side face for each side of its base: ${s.n}.` : `A pyramid has one triangular face for each side of its base: ${s.n}.`, pr ? `Prisma mempunyai satu permukaan sisi bagi setiap sisi tapaknya: ${s.n}.` : `Piramid mempunyai satu permukaan segi tiga bagi setiap sisi tapaknya: ${s.n}.`), T(pr ? `Its two ends are the bases, each ${s.cube ? 'a square' : s.n === 4 ? 'a rectangle' : art(BAS[s.n][0])}.` : `Its base is ${art(BAS[s.n][0])}.`, pr ? `Dua hujungnya ialah tapak, setiap satu ${s.cube ? 'segi empat sama' : s.n === 4 ? 'segi empat tepat' : BAS[s.n][1]}.` : `Tapaknya ialah ${BAS[s.n][1]}.`)), sp: 's' };
    },
    /* properties of right solids */
    (r) => {
      const bank = [
        [T('right prism', 'prisma tegak'), T('Its side faces are rectangles perpendicular to the base.', 'Permukaan sisinya ialah segi empat tepat yang serenjang dengan tapak.')],
        [T('right pyramid', 'piramid tegak'), T('Its apex is directly above the centre of the base.', 'Puncaknya berada tepat di atas pusat tapak.')],
        [T('right cylinder', 'silinder tegak'), T('The line joining the centres of the two circular ends is perpendicular to them.', 'Garis yang menyambungkan pusat dua hujung bulat serenjang dengan hujung itu.')],
        [T('right cone', 'kon tegak'), T('The line from the vertex to the centre of the base is perpendicular to the base.', 'Garis dari bucu ke pusat tapak serenjang dengan tapak.')],
      ];
      const b = r.pick(bank);
      return { q: T(`State the property that makes a solid a ${b[0].en}, rather than an oblique one.`, `Nyatakan sifat yang menjadikan sesuatu pepejal sebagai ${b[0].ms}, dan bukan pepejal condong.`), a: b[1], w: W(T(`“Right” always means the axis (or the line from the apex to the centre of the base) is perpendicular to the base.`, `“Tegak” sentiasa bermaksud paksi (atau garis dari puncak ke pusat tapak) serenjang dengan tapak.`), b[1]), sp: 's' };
    },
    /* object with a solid shape */
    (r) => {
      const o = r.pick(OBJ.filter((x) => x[2].k === 'prism' || x[2].k === 'pyr')), q = r.pick(['F', 'E', 'V']);
      return { q: T(`${SPM.cap(o[0])} has the shape of ${art(o[2].en)}. How many ${QN[q][0]} does it have?`, `${SPM.cap(o[1])} berbentuk ${o[2].ms}. Berapakah bilangan ${QN[q][1]} yang dimilikinya?`), a: T(`${o[2][q]}`), w: W(T(`${SPM.cap(o[0])} is ${art(o[2].en)}.`, `${SPM.cap(o[1])} ialah ${o[2].ms}.`), fevLine(o[2], q)), sp: 'xs' };
    },
    /* three counts from a figure */
    (r) => {
      const s = r.pick(POLYH);
      return { q: T('For the solid in the figure, state the number of faces, edges and vertices, and say whether it is a prism or a pyramid.', 'Bagi pepejal dalam rajah, nyatakan bilangan permukaan, tepi dan bucu, dan nyatakan sama ada ia prisma atau piramid.'), fig: solidFig(s), a: T(`${s.F} faces, ${s.E} edges, ${s.V} vertices; ${kindOf(s).en}`, `${s.F} permukaan, ${s.E} tepi, ${s.V} bucu; ${kindOf(s).ms}`), w: W(fevLine(s, 'F'), fevLine(s, 'E'), fevLine(s, 'V'), T(s.k === 'prism' ? `It has two identical parallel bases, so it is a prism.` : `It has one base with side faces meeting at an apex, so it is a pyramid.`, s.k === 'prism' ? `Ia mempunyai dua tapak yang sama dan selari, maka ia prisma.` : `Ia mempunyai satu tapak dengan permukaan sisi yang bertemu di puncak, maka ia piramid.`)), sp: 's' };
    },
  ];

  const g61a = [
    /* equations in n */
    (r) => {
      const nn = r.int(3, 10), pr = r.chance();
      const s = pr ? mkPrism(nn) : mkPyr(nn);
      const ex = r.pick([['F', 'V', '+'], ['F', 'E', '+'], ['E', 'V', '+'], ['E', 'F', '-'], ['E', 'V', '-'], ['F', 'V', '-']]);
      const val = ex[2] === '+' ? s[ex[0]] + s[ex[1]] : s[ex[0]] - s[ex[1]];
      need(val > 0);
      // the base must be identifiable: solve by trial over n and demand a single answer
      const f = (m) => { const t = pr ? mkPrism(m) : mkPyr(m); return ex[2] === '+' ? t[ex[0]] + t[ex[1]] : t[ex[0]] - t[ex[1]]; };
      need([3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((m) => f(m) === val).length === 1);
      const nm = pr ? T('prism', 'prisma') : T('pyramid', 'piramid');
      const word = ex[2] === '+' ? T('sum', 'jumlah') : T('difference', 'beza');
      const wt = ex[2] === '+' ? T('the sum of', 'jumlah') : T('the number of', 'bilangan');
      return { q: ex[2] === '+' ? T(`For a ${nm.en}, the total number of ${QN[ex[0]][0]} and ${QN[ex[1]][0]} is ${val}. How many sides does its base have?`, `Bagi sebuah ${nm.ms}, jumlah bilangan ${QN[ex[0]][1]} dan ${QN[ex[1]][1]} ialah ${val}. Berapakah bilangan sisi tapaknya?`) : T(`A ${nm.en} has ${val} more ${QN[ex[0]][0]} than ${QN[ex[1]][0]}. How many sides does its base have?`, `Sebuah ${nm.ms} mempunyai ${val} ${QN[ex[0]][1]} lebih banyak daripada ${QN[ex[1]][1]}. Berapakah bilangan sisi tapaknya?`), a: T(`${nn} sides`, `${nn} sisi`), w: W(T(`Prism: $F = n + 2$, $E = 3n$, $V = 2n$. Pyramid: $F = n + 1$, $E = 2n$, $V = n + 1$.`, `Prisma: $F = n + 2$, $E = 3n$, $V = 2n$. Piramid: $F = n + 1$, $E = 2n$, $V = n + 1$.`), `$(${FML[s.k][ex[0]]}) ${ex[2]} (${FML[s.k][ex[1]]}) = ${val}$`, `$n = ${nn}$`), sp: 's' };
    },
    /* is it possible? */
    (r) => {
      const pr = r.chance(), q = r.pick(['F', 'E', 'V']);
      const val = (m) => (pr ? { F: m + 2, E: 3 * m, V: 2 * m }[q] : { F: m + 1, E: 2 * m, V: m + 1 }[q]);
      const yes = r.chance(), m = r.int(3, 12);
      let N = val(m);
      if (!yes) N += r.pick([1, 2]);
      const poss = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].some((k) => val(k) === N) || (N >= val(3) && [...Array(30).keys()].some((k) => k >= 3 && val(k) === N));
      need(N >= 6 && poss === yes);
      const nm = pr ? T('prism', 'prisma') : T('pyramid', 'piramid');
      const why = pr ? { F: [`faces $= n + 2$, so $n = ${N - 2}$`, `permukaan $= n + 2$, maka $n = ${N - 2}$`], E: [`edges $= 3n$, so $n = ${N / 3}$; it must be a multiple of 3`, `tepi $= 3n$, maka $n = ${N / 3}$; ia mesti gandaan 3`], V: [`vertices $= 2n$, so $n = ${N / 2}$; it must be even`, `bucu $= 2n$, maka $n = ${N / 2}$; ia mesti genap`] }[q] : { F: [`faces $= n + 1$, so $n = ${N - 1}$`, `permukaan $= n + 1$, maka $n = ${N - 1}$`], E: [`edges $= 2n$, so $n = ${N / 2}$; it must be even`, `tepi $= 2n$, maka $n = ${N / 2}$; ia mesti genap`], V: [`vertices $= n + 1$, so $n = ${N - 1}$`, `bucu $= n + 1$, maka $n = ${N - 1}$`] }[q];
      return { q: T(`Can a ${nm.en} have exactly ${N} ${QN[q][0]}? Explain.`, `Bolehkah sebuah ${nm.ms} mempunyai tepat ${N} ${QN[q][1]}? Jelaskan.`), a: yes ? T(`Yes: ${why[0]}.`, `Boleh: ${why[1]}.`) : T(`No: the ${QN[q][0]} of a ${nm.en} follow a pattern (${why[0].split(',')[0]}), and ${N} does not fit it.`, `Tidak boleh: ${QN[q][1]} bagi ${nm.ms} mengikut satu pola (${why[1].split(',')[0]}), dan ${N} tidak sepadan.`), w: W(T(`Write the count as a formula in $n$ and solve.`, `Tulis bilangan itu sebagai rumus dalam $n$ dan selesaikan.`), T(why[0], why[1]), T(yes ? `$n$ comes out as a whole number of at least $3$, so the solid exists.` : `$n$ does not come out as a whole number of at least $3$, so no such solid exists.`, yes ? `$n$ ialah nombor bulat sekurang-kurangnya $3$, maka pepejal itu wujud.` : `$n$ bukan nombor bulat sekurang-kurangnya $3$, maka pepejal itu tidak wujud.`)), sp: 's' };
    },
    /* spot the error */
    (r) => {
      const s = r.pick(POLYH.filter((x) => !x.cube)), q = r.pick(['F', 'E', 'V']);
      const claim = s[q] + r.pick([-2, -1, 1, 2]);
      need(claim > 0);
      const pr = s.k === 'prism';
      const how = pr ? { F: [`${s.n} side faces + 2 bases`, `${s.n} permukaan sisi + 2 tapak`], E: [`${s.n} edges on each of 2 bases + ${s.n} joining edges`, `${s.n} tepi pada setiap 2 tapak + ${s.n} tepi penyambung`], V: [`${s.n} vertices on each of 2 bases`, `${s.n} bucu pada setiap 2 tapak`] }[q] : { F: [`${s.n} triangular faces + 1 base`, `${s.n} permukaan segi tiga + 1 tapak`], E: [`${s.n} base edges + ${s.n} sloping edges`, `${s.n} tepi tapak + ${s.n} tepi condong`], V: [`${s.n} base vertices + 1 apex`, `${s.n} bucu tapak + 1 puncak`] }[q];
      const nm = pr ? s.n : s.n;
      return { q: T(`A student says that ${art(s.en)} has ${claim} ${QN[q][0]}. Is the student correct? If not, give the correct number and show how it is counted.`, `Seorang murid berkata bahawa ${s.ms} mempunyai ${claim} ${QN[q][1]}. Adakah murid itu betul? Jika tidak, berikan bilangan yang betul dan tunjukkan cara mengiranya.`), a: T(`Incorrect. ${s[q]} ${QN[q][0]}: ${how[0]}.`, `Tidak betul. ${s[q]} ${QN[q][1]}: ${how[1]}.`), w: W(T(`Count them properly: ${how[0]}.`, `Kira dengan betul: ${how[1]}.`), `$${s[q]} \\ne ${claim}$`), sp: 's' };
    },
    /* identify from three clues */
    (r) => {
      const s = r.pick(POLYH.filter((x) => !x.cube));
      const all = POLYH.filter((x) => !x.cube);
      const types = r.sample(['kind', 'base', 'F', 'E', 'V'], 3);
      const ok = (x) => types.every((t) => (t === 'kind' ? x.k === s.k : t === 'base' ? x.n === s.n : x[t] === s[t]));
      need(all.filter(ok).length === 1);
      const en = types.map((t) => (t === 'kind' ? (s.k === 'prism' ? 'it has two identical parallel bases joined by rectangles' : 'its side faces are triangles meeting at one vertex') : t === 'base' ? (s.k === 'prism' ? `its bases are ${s.n === 4 ? 'rectangles' : BAS[s.n][0] + 's'}` : `its base is ${art(BAS[s.n][0])}`) : `it has ${s[t]} ${QN[t][0]}`));
      const ms = types.map((t) => (t === 'kind' ? (s.k === 'prism' ? 'ia mempunyai dua tapak yang sama dan selari disambung oleh segi empat tepat' : 'permukaan sisinya ialah segi tiga yang bertemu pada satu bucu') : t === 'base' ? `${s.k === 'prism' ? 'tapaknya' : 'tapaknya'} berbentuk ${s.k === 'prism' && s.n === 4 ? 'segi empat tepat' : BAS[s.n][1]}` : `ia mempunyai ${s[t]} ${QN[t][1]}`));
      return { q: T(`A solid has these properties: (i) ${en[0]}; (ii) ${en[1]}; (iii) ${en[2]}. Name the solid.`, `Sebuah pepejal mempunyai sifat berikut: (i) ${ms[0]}; (ii) ${ms[1]}; (iii) ${ms[2]}. Namakan pepejal itu.`), a: nameOf(s), w: W(T(`The three clues together fix the type of solid and the number of sides of its base.`, `Ketiga-tiga petunjuk itu menentukan jenis pepejal dan bilangan sisi tapaknya.`), T(`${s.k === 'prism' ? 'Two parallel bases' : 'One base and an apex'} with ${s.n} sides: ${s.en}.`, `${s.k === 'prism' ? 'Dua tapak selari' : 'Satu tapak dan satu puncak'} dengan ${s.n} sisi: ${s.ms}.`)), sp: 's' };
    },
    /* composite solids: count surfaces */
    (r) => {
      const nn = r.pick([3, 4, 5, 6]);
      const c = r.pick([
        { en: 'A cone is joined to the top of a cylinder of the same radius.', ms: 'Sebuah kon disambung pada bahagian atas sebuah silinder yang sama jejarinya.', a: ['1 flat surface, 2 curved surfaces, 1 vertex', '1 permukaan rata, 2 permukaan melengkung, 1 bucu'], fig: stackSvg([{ t: 'cyl', h: 50 }, { t: 'cone', h: 44 }], 30, {}) },
        { en: 'A hemisphere is joined to the top of a cylinder of the same radius.', ms: 'Sebuah hemisfera disambung pada bahagian atas sebuah silinder yang sama jejarinya.', a: ['1 flat surface, 2 curved surfaces, no vertices', '1 permukaan rata, 2 permukaan melengkung, tiada bucu'], fig: stackSvg([{ t: 'cyl', h: 50 }, { t: 'hemi' }], 30, {}) },
        { en: 'The flat face of a solid hemisphere is joined to the base of a cone of the same radius.', ms: 'Permukaan rata sebuah hemisfera pepejal disambung pada tapak sebuah kon yang sama jejarinya.', a: ['no flat surfaces, 2 curved surfaces, 1 vertex', 'tiada permukaan rata, 2 permukaan melengkung, 1 bucu'], fig: stackSvg([{ t: 'hemiB' }, { t: 'cone', h: 60 }], 30, {}) },
      ]);
            const pr = nn === 4 ? CUBE : PRI[[3, 4, 5, 6, 8].indexOf(nn)], py = PYR[[3, 4, 5, 6, 8].indexOf(nn)];
      if (r.chance(0.5)) {
        return { q: T(`${c.en} For the combined solid, state the number of flat surfaces, curved surfaces and vertices.`, `${c.ms} Bagi pepejal gabungan itu, nyatakan bilangan permukaan rata, permukaan melengkung dan bucu.`), fig: c.fig, a: T(c.a[0], c.a[1]), w: W(T(`Count only what is left on the outside: the two surfaces that are joined together disappear inside.`, `Kira hanya apa yang tinggal di bahagian luar: dua permukaan yang dicantumkan hilang di dalam.`), T(c.a[0], c.a[1])), sp: 's' };
      }
      return { q: T(`${SPM.cap(art(py.en))} is placed on top of ${art(pr.en)} so that the base of the pyramid exactly covers the top face. Find the number of faces, edges and vertices of the combined solid.`, `${SPM.cap(py.ms)} diletakkan di atas ${pr.ms} supaya tapak piramid itu tepat menutupi permukaan atasnya. Cari bilangan permukaan, tepi dan bucu bagi pepejal gabungan itu.`), a: T(`${2 * nn + 1} faces, ${4 * nn} edges, ${2 * nn + 1} vertices`, `${2 * nn + 1} permukaan, ${4 * nn} tepi, ${2 * nn + 1} bucu`), w: T(`Faces: ${nn + 2} $-$ 1 (covered base) $+$ ${nn} $=$ ${2 * nn + 1}`, `Permukaan: ${nn + 2} $-$ 1 (tapak ditutup) $+$ ${nn} $=$ ${2 * nn + 1}`), sp: 's' };
    },
    /* same base: prism vs pyramid */
    (r) => {
      const nn = r.int(3, 12), q = r.pick(['F', 'E', 'V']);
      const a1 = mkPrism(nn)[q], a2 = mkPyr(nn)[q];
      return { q: T(`A prism and a pyramid both have a base with ${nn} sides. How many ${QN[q][0]} does each have, and what is the difference between the two numbers?`, `Sebuah prisma dan sebuah piramid masing-masing mempunyai tapak dengan ${nn} sisi. Berapakah bilangan ${QN[q][1]} bagi setiap satu, dan apakah beza antara kedua-dua nombor itu?`), a: T(`Prism: ${a1}; pyramid: ${a2}; difference: ${Math.abs(a1 - a2)}`, `Prisma: ${a1}; piramid: ${a2}; beza: ${Math.abs(a1 - a2)}`), w: W(T(`Prism: $${FML.prism[q]} = ${FSUB.prism[q](nn)} = ${a1}$`, `Prisma: $${FML.prism[q]} = ${FSUB.prism[q](nn)} = ${a1}$`), T(`Pyramid: $${FML.pyr[q]} = ${FSUB.pyr[q](nn)} = ${a2}$`, `Piramid: $${FML.pyr[q]} = ${FSUB.pyr[q](nn)} = ${a2}$`), `$${Math.max(a1, a2)} - ${Math.min(a1, a2)} = ${Math.abs(a1 - a2)}$`), sp: 's' };
    },
    /* explain */
    (r) => {
      const bank = [
        [T('Explain why the number of vertices of a prism is always an even number.', 'Terangkan mengapa bilangan bucu sebuah prisma sentiasa nombor genap.'), T('A prism has two identical bases, each with the same number of vertices, so the total is $2n$, which is even.', 'Prisma mempunyai dua tapak yang sama, setiap satu dengan bilangan bucu yang sama, maka jumlahnya $2n$, iaitu nombor genap.')],
        [T('Explain why the number of edges of a prism is always a multiple of 3.', 'Terangkan mengapa bilangan tepi sebuah prisma sentiasa gandaan 3.'), T('Each base has $n$ edges and there are $n$ joining edges, so the total is $n + n + n = 3n$.', 'Setiap tapak mempunyai $n$ tepi dan terdapat $n$ tepi penyambung, maka jumlahnya $n + n + n = 3n$.')],
        [T('Explain why the number of edges of a pyramid is always even.', 'Terangkan mengapa bilangan tepi sebuah piramid sentiasa genap.'), T('The base has $n$ edges and $n$ more edges join the vertices to the apex, so there are $2n$ edges.', 'Tapak mempunyai $n$ tepi dan $n$ tepi lagi menyambungkan bucu tapak ke puncak, maka terdapat $2n$ tepi.')],
        [T('Explain why a cylinder is not a prism, although it has two parallel identical bases.', 'Terangkan mengapa silinder bukan prisma walaupun ia mempunyai dua tapak yang sama dan selari.'), T('A prism has flat polygon faces only; a cylinder has circular bases and a curved surface.', 'Prisma hanya mempunyai permukaan poligon yang rata; silinder mempunyai tapak bulat dan satu permukaan melengkung.')],
        [T('Explain why a sphere cannot be classified as a prism or a pyramid.', 'Terangkan mengapa sfera tidak boleh dikelaskan sebagai prisma atau piramid.'), T('It has no flat faces, edges or vertices; a prism or pyramid has flat polygon faces.', 'Ia tidak mempunyai permukaan rata, tepi atau bucu; prisma atau piramid mempunyai permukaan poligon yang rata.')],
        [T('A pyramid and a prism each have 7 faces. How many sides does the base of each have?', 'Sebuah piramid dan sebuah prisma masing-masing mempunyai 7 permukaan. Berapakah bilangan sisi tapak bagi setiap satu?'), T('Pyramid: $n + 1 = 7$, so $n = 6$. Prism: $n + 2 = 7$, so $n = 5$.', 'Piramid: $n + 1 = 7$, maka $n = 6$. Prisma: $n + 2 = 7$, maka $n = 5$.')],
      ];
      const b = r.pick(bank);
      return { q: b[0], a: b[1], w: W(T(`Use the counting rules: a prism has two identical bases with $n$ vertices and $n$ edges each, plus $n$ joining edges; a pyramid has one base and one apex.`, `Guna peraturan pengiraan: prisma mempunyai dua tapak yang sama dengan $n$ bucu dan $n$ tepi setiap satu, serta $n$ tepi penyambung; piramid mempunyai satu tapak dan satu puncak.`), b[1]), sp: 'm' };
    },
    /* student claims about right and oblique solids */
    (r) => {
      const bank = [
        [T('"A cylinder that looks slanted is still a right cylinder because its bases are circles."', '"Silinder yang kelihatan condong tetap silinder tegak kerana tapaknya bulat."'), T('Incorrect. In a right cylinder the axis is perpendicular to the bases; a slanted cylinder is oblique.', 'Tidak betul. Dalam silinder tegak, paksi serenjang dengan tapak; silinder yang condong ialah silinder condong.')],
        [T('"The side faces of a right prism are rectangles."', '"Permukaan sisi prisma tegak ialah segi empat tepat."'), T('Correct. The lateral edges are perpendicular to the bases.', 'Betul. Tepi sisi serenjang dengan tapak.')],
        [T('"The side faces of an oblique prism are all rectangles."', '"Permukaan sisi prisma condong semuanya segi empat tepat."'), T('Incorrect. Some or all of them are parallelograms.', 'Tidak betul. Sebahagian atau semuanya ialah segi empat selari.')],
        [T('"In a right pyramid the apex is directly above the centre of the base."', '"Dalam piramid tegak, puncak berada tepat di atas pusat tapak."'), T('Correct. That is what makes the pyramid a right pyramid.', 'Betul. Itulah yang menjadikan piramid itu piramid tegak.')],
        [T('"A cone is oblique if its vertex is not above the centre of the circular base."', '"Kon adalah condong jika bucunya tidak berada di atas pusat tapak bulat."'), T('Correct. The axis then leans and is not perpendicular to the base.', 'Betul. Paksinya condong dan tidak serenjang dengan tapak.')],
        [T('"We can only use the formulae for surface area and volume of solids in Form 2 for right solids, not oblique ones."', '"Formula luas permukaan dan isi padu dalam Tingkatan 2 hanya digunakan untuk pepejal tegak, bukan pepejal condong."'), T('Correct. Form 2 calculations are for right solids only.', 'Betul. Pengiraan Tingkatan 2 hanya untuk pepejal tegak.')],
      ];
      const b = r.pick(bank);
      return { q: T(`Is this statement correct? Explain briefly.<br>${b[0].en}`, `Adakah pernyataan ini betul? Jelaskan secara ringkas.<br>${b[0].ms}`), a: b[1], w: W(T(`“Right” means the axis is perpendicular to the base; otherwise the solid is oblique, and only right solids are used in the Form 2 formulae.`, `“Tegak” bermaksud paksi serenjang dengan tapak; jika tidak, pepejal itu condong, dan hanya pepejal tegak digunakan dalam rumus Tingkatan 2.`), b[1]), sp: 's' };
    },
    /* multi-part with the figure */
    (r) => {
      const s = r.pick(POLYH.filter((x) => !x.cube));
      const lean = r.chance(0.35);
      const fig = lean ? leanFig(s.k, s.n, true) : solidFig(s);
      return { q: T(`Study the solid in the figure.<br>${SPM.parts([T('Name the solid.', 'Namakan pepejal itu.'), T('State the number of faces, edges and vertices.', 'Nyatakan bilangan permukaan, tepi dan bucu.'), T('Is it a right solid or an oblique solid? Give a reason.', 'Adakah ia pepejal tegak atau pepejal condong? Berikan sebab.')]).en}`, `Kaji pepejal dalam rajah.<br>${SPM.parts([T('Name the solid.', 'Namakan pepejal itu.'), T('State the number of faces, edges and vertices.', 'Nyatakan bilangan permukaan, tepi dan bucu.'), T('Is it a right solid or an oblique solid? Give a reason.', 'Adakah ia pepejal tegak atau pepejal condong? Berikan sebab.')]).ms}`), fig, a: SPM.parts([nameOf(s), T(`${s.F} faces, ${s.E} edges, ${s.V} vertices`, `${s.F} permukaan, ${s.E} tepi, ${s.V} bucu`), lean ? T('Oblique: the axis is not perpendicular to the base.', 'Condong: paksi tidak serenjang dengan tapak.') : T('It is drawn as a right solid: the side edges are perpendicular to the base.', 'Ia dilukis sebagai pepejal tegak: tepi sisi serenjang dengan tapak.')]), w: W(nameOf(s), fevLine(s, 'F'), fevLine(s, 'E'), fevLine(s, 'V'), T(lean ? `The axis leans, so the solid is oblique.` : `The side edges are perpendicular to the base, so it is a right solid.`, lean ? `Paksinya condong, maka pepejal itu condong.` : `Tepi sisinya serenjang dengan tapak, maka ia pepejal tegak.`)), sp: 'm' };
    },
  ];
  SPM.extend('F2-6.1', { e: g61e, m: g61m, a: g61a });

  /* ================================================================= 6.2 */
  const P = SPM.parts;
  const labelFig = (svg, t) => svg.replace('</svg>', S.text(11, 12, t, { s: 14, b: true }) + '</svg>');
  /** the shapes a net is made of */
  const shapesOf = (s) => {
    if (s.k === 'cyl') return [T('two circles and one rectangle', 'dua bulatan dan satu segi empat tepat'), 3];
    if (s.k === 'cone') return [T('one circle and one sector', 'satu bulatan dan satu sektor'), 2];
    if (s.cube) return [T('six identical squares', 'enam segi empat sama yang serupa'), 6];
    if (s.k === 'prism' && s.n === 4) return [T('six rectangles', 'enam segi empat tepat'), 6];
    if (s.k === 'prism') return [T(`two ${BAS[s.n][0]}s and ${s.n} rectangles`, `dua ${BAS[s.n][1]} dan ${s.n} segi empat tepat`), s.n + 2];
    return [T(`one ${BAS[s.n][0]} and ${s.n} triangles`, `satu ${BAS[s.n][1]} dan ${s.n} segi tiga`), s.n + 1];
  };
  /** a net figure for any solid of the 6.1 bank */
  const netOf = (s, r) => {
    if (s.k === 'cyl') return cylNet(r.pick([3, 4, 5]), r.pick([8, 10, 12]), {});
    if (s.k === 'cone') { const c = r.pick([[3, 5], [4, 5], [6, 10], [5, 10]]); return coneNet(c[0], c[1], (360 * c[0]) / c[1], {}); }
    if (s.cube) return cuboidNet(4, 4, 4, {});
    if (s.k === 'prism' && s.n === 4) return cuboidNet(r.pick([6, 7, 8]), r.pick([3, 4]), r.pick([3, 4, 5]), {});
    if (s.k === 'prism') return s.n === 3 ? triPrismNet(3, 4, 5, r.pick([8, 10]), {}) : polyPrismNet(s.n, 3, r.pick([7, 9]), {});
    return pyrNet(s.n, 4, s.n === 3 ? 5 : r.pick([5, 6]), {});
  };
  const NETS = ALLS.filter((s) => s.k !== 'sph');
  const CONES = (() => {
    const o = [];
    for (let l = 6; l <= 30; l++) for (const th of [60, 72, 90, 120, 144, 150, 180, 216, 240, 270, 288]) if ((l * th) % 360 === 0 && l > (l * th) / 360) o.push([(l * th) / 360, l, th]);
    return o;
  })();
  const cubeFace = (cells, letters) => {
    const s = 26;
    let out = '';
    cells.forEach((c, i) => (out += rc(c[0] * s, c[1] * s, (c[0] + 1) * s, (c[1] + 1) * s) + tx((c[0] + 0.5) * s, (c[1] + 0.5) * s, letters[i], { s: 13, b: true })));
    return mk(out, [[0, 0], [(Math.max(...cells.map((c) => c[0])) + 1) * s, (Math.max(...cells.map((c) => c[1])) + 1) * s]], 10);
  };
  const cubeOpp = (cells) => {
    // physical face ids by rolling, opposite pairs (0,1),(2,3),(4,5)
    const key = (c) => c[0] + ',' + c[1], has = new Set(cells.map(key)), face = new Map();
    const roll = (st, dc, dr) => {
      const o = Object.assign({}, st);
      if (dc === 1) Object.assign(o, { b: st.e, e: st.t, t: st.w, w: st.b });
      else if (dc === -1) Object.assign(o, { b: st.w, w: st.t, t: st.e, e: st.b });
      else if (dr === -1) Object.assign(o, { b: st.n, n: st.t, t: st.s, s: st.b });
      else Object.assign(o, { b: st.s, s: st.t, t: st.n, n: st.b });
      return o;
    };
    const st0 = { b: 0, t: 1, n: 2, s: 3, e: 4, w: 5 };
    face.set(key(cells[0]), 0);
    const q = [[cells[0], st0]];
    while (q.length) {
      const [c, st] = q.pop();
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nb = [c[0] + dc, c[1] + dr];
        if (!has.has(key(nb)) || face.has(key(nb))) continue;
        const ns = roll(st, dc, dr);
        face.set(key(nb), ns.b);
        q.push([nb, ns]);
      }
    }
    return cells.map((c) => face.get(key(c)));
  };
  const validHexo = (r, want) => {
    for (let i = 0; i < 400; i++) { const h = randHexo(r); if (foldsToCube(h) === want) return h; }
    throw SPM.REJECT;
  };

  const g62e = [
    /* name the solid from its net (figure) */
    (r) => {
      const s = r.pick(NETS);
      const q = r.pick([T('The figure shows a net. Name the solid that can be made from it.', 'Rajah menunjukkan satu jaring-jaring. Namakan pepejal yang boleh dibentuk daripadanya.'), T('Which solid is formed when this net is folded?', 'Pepejal manakah yang terbentuk apabila jaring-jaring ini dilipat?'), T('Name the solid that has this net.', 'Namakan pepejal yang mempunyai jaring-jaring ini.')]);
      return { q, fig: netOf(s, r), a: nameOf(s), w: W(T(`The net is made of ${shapesOf(s)[0].en}, which fold into ${art(s.en)}.`, `Jaring-jaring itu terdiri daripada ${shapesOf(s)[0].ms}, yang dilipat menjadi ${s.ms}.`)), sp: 'xs' };
    },
    /* from the list of shapes to the solid */
    (r) => {
      const s = r.pick(NETS);
      return { q: T(`A net is made up of ${shapesOf(s)[0].en}. Which solid does it fold into?`, `Satu jaring-jaring terdiri daripada ${shapesOf(s)[0].ms}. Pepejal manakah yang terbentuk apabila dilipat?`), a: nameOf(s), w: W(T(`Those shapes are exactly the faces of ${art(s.en)}.`, `Bentuk itu ialah permukaan bagi ${s.ms}.`), nameOf(s)), sp: 'xs' };
    },
    /* from the solid to the shapes */
    (r) => {
      const s = r.pick(NETS);
      return { q: T(`Which shapes make up the net of ${art(s.en)}?`, `Bentuk-bentuk manakah yang membentuk jaring-jaring bagi ${s.ms}?`), a: shapesOf(s)[0], w: W(T(`Unfold ${art(s.en)}: it has ${shapesOf(s)[1]} shapes altogether.`, `Buka ${s.ms}: ia mempunyai ${shapesOf(s)[1]} bentuk kesemuanya.`), shapesOf(s)[0]), sp: 'xs' };
    },
    /* how many shapes in the net */
    (r) => {
      const s = r.pick(NETS);
      return { q: T(`How many separate shapes are there in the net of ${art(s.en)}?`, `Berapakah bilangan bentuk berasingan dalam jaring-jaring bagi ${s.ms}?`), a: T(`${shapesOf(s)[1]}`), w: shapesOf(s)[0], sp: 'xs' };
    },
    /* cutting open an object */
    (r) => {
      const o = r.pick(OBJ.filter((x) => x[2].k !== 'sph' && x[2] !== PYR[1]));
      return { q: T(`${SPM.cap(o[0])} is cut open along some of its edges and laid flat to form a net. Name the solid and state which shapes appear in the net.`, `${SPM.cap(o[1])} dibuka dengan menggunting pada sesetengah tepinya dan dibentangkan untuk membentuk jaring-jaring. Namakan pepejal itu dan nyatakan bentuk yang terdapat dalam jaring-jaring itu.`), a: T(`${o[2].en}: ${shapesOf(o[2])[0].en}`, `${o[2].ms}: ${shapesOf(o[2])[0].ms}`), w: W(T(`${SPM.cap(o[0])} has the shape of ${art(o[2].en)}.`, `${SPM.cap(o[1])} berbentuk ${o[2].ms}.`), T(`Unfolding it gives ${shapesOf(o[2])[0].en}.`, `Membukanya memberi ${shapesOf(o[2])[0].ms}.`)), sp: 's' };
    },
    /* match three nets */
    (r) => {
      const ss = r.sample(NETS.filter((s) => s.k !== 'prism' || s.n !== 4), 3);
      const perm = r.shuffle([0, 1, 2]);
      const figs = perm.map((i, j) => labelFig(netOf(ss[i], r), 'ABC'[j]));
      const names = r.shuffle(ss);
      return { q: T(`Match each net (A, B, C) with its solid: ${names.map((s) => s.en).join(', ')}.`, `Padankan setiap jaring-jaring (A, B, C) dengan pepejalnya: ${names.map((s) => s.ms).join(', ')}.`), fig: figs, a: T(perm.map((i, j) => `${'ABC'[j]}: ${ss[i].en}`).join('; '), perm.map((i, j) => `${'ABC'[j]}: ${ss[i].ms}`).join('; ')), w: W(T(`Count the shapes in each net and look at the base.`, `Kira bentuk dalam setiap jaring-jaring dan lihat tapaknya.`), ...ss.map((s) => T(`${s.en}: ${shapesOf(s)[0].en}`, `${s.ms}: ${shapesOf(s)[0].ms}`))), sp: 's' };
    },
    /* which of four arrangements is the net of a cube */
    (r) => {
      const good = validHexo(r, true), bad = [];
      const keys = new Set([hexoKey(good)]);
      while (bad.length < 3) { const h = randHexo(r); if (!foldsToCube(h) && !keys.has(hexoKey(h))) { bad.push(h); keys.add(hexoKey(h)); } }
      const at = r.int(0, 3), list = bad.slice();
      list.splice(at, 0, good);
      const q = r.pick([T('Which of the arrangements of six squares can be folded to form a cube?', 'Antara susunan enam petak segi empat sama berikut, yang manakah boleh dilipat untuk membentuk kubus?'), T('Only one of the four shapes is the net of a cube. Which one?', 'Hanya satu daripada empat bentuk ini ialah jaring-jaring kubus. Yang manakah?')]);
      return { q, fig: netsRow(list, 16), a: T(`${'ABCD'[at]}`), w: W(T(`A cube net must have six squares that cover the six faces without overlapping. Fold each arrangement in your head, keeping one square as the base.`, `Jaring-jaring kubus mesti mempunyai enam segi empat sama yang menutupi enam permukaan tanpa bertindih. Lipat setiap susunan dalam fikiran, dengan mengekalkan satu segi empat sama sebagai tapak.`), T(`Only ${'ABCD'[at]} works; in the others two squares land on the same face.`, `Hanya ${'ABCD'[at]} berjaya; dalam yang lain, dua segi empat sama jatuh pada permukaan yang sama.`)), sp: 'xs' };
    },
    /* yes / no for one arrangement */
    (r) => {
      const want = r.chance(), h = validHexo(r, want);
      return { q: T('Can the arrangement of six squares shown be folded to make a cube? Answer Yes or No.', 'Bolehkah susunan enam segi empat sama yang ditunjukkan dilipat untuk membentuk kubus? Jawab Ya atau Tidak.'), fig: gridFig(h, 22), a: want ? T('Yes', 'Ya') : T('No: two squares would overlap and a face would be missing.', 'Tidak: dua segi empat sama akan bertindih dan satu permukaan tidak ada.'), w: W(T(`Fold the arrangement in your head, keeping one square as the base.`, `Lipat susunan itu dalam fikiran, dengan mengekalkan satu segi empat sama sebagai tapak.`), T(want ? `The six squares cover the six faces exactly, so the answer is Yes.` : `Two squares land on the same face and one face is left open, so the answer is No.`, want ? `Enam segi empat sama itu menutupi enam permukaan dengan tepat, maka jawapannya Ya.` : `Dua segi empat sama jatuh pada permukaan yang sama dan satu permukaan terbuka, maka jawapannya Tidak.`)), sp: 'xs' };
    },
    /* missing face of a cuboid net */
    (r) => {
      const l = r.int(5, 9), w = r.int(3, l - 1), h = r.int(2, 6);
      need(new Set([l, w, h]).size === 3);
      const miss = r.pick(['top', 'bottom', 'front', 'back', 'left', 'right']);
      const d = { top: [l, w], bottom: [l, w], front: [l, h], back: [l, h], left: [w, h], right: [w, h] }[miss];
      return { q: T('The figure shows a net of a cuboid with one face missing (dashed). State the length and width of the missing face.', 'Rajah menunjukkan jaring-jaring sebuah kuboid dengan satu permukaan tiada (garis putus-putus). Nyatakan panjang dan lebar permukaan yang tiada itu.'), fig: cuboidNet(l, w, h, { l: cm(l), w: cm(w), h: cm(h) }, miss), a: T(`${cm(d[0])} by ${cm(d[1])}`, `${cm(d[0])} kali ${cm(d[1])}`), w: W(T(`Opposite faces of a cuboid are identical, so the missing face is a copy of the face opposite it.`, `Permukaan bertentangan sebuah kuboid adalah sama, maka permukaan yang tiada itu ialah salinan permukaan yang bertentangan dengannya.`), T(`Its two sides are ${cm(d[0])} and ${cm(d[1])}.`, `Dua sisinya ialah ${cm(d[0])} dan ${cm(d[1])}.`)), sp: 's' };
    },
  ];

  const g62m = [
    /* cylinder net: rectangle */
    (r) => {
      const k = piK(r), rr = rFor(k, r, 2, 10), h = r.int(4, 20);
      const v = r.int(0, 3);
      const rect = `${pv(k, 2 * rr)}`;
      if (v === 0) return { q: T(`A closed cylinder has radius ${n(rr)} cm and height ${h} cm. Its net has two circles and a rectangle. Find the length and width of the rectangle. ${PI[k].en}`, `Sebuah silinder tertutup berjejari ${n(rr)} cm dan tinggi ${h} cm. Jaring-jaringnya mempunyai dua bulatan dan satu segi empat tepat. Cari panjang dan lebar segi empat tepat itu. ${PI[k].ms}`), fig: cylNet(rr, h, { r: cm(rr), h: cm(h) }), a: T(`Length $${rect}\\ \\text{cm}$, width ${h} cm`, `Panjang $${rect}\\ \\text{cm}$, lebar ${h} cm`), w: T('Length = circumference $= 2\\pi r$', 'Panjang = lilitan $= 2\\pi r$'), sp: 's' };
      if (v === 1) return { q: T(`The rectangle in the net of a cylinder measures $${rect}$ cm by ${h} cm. Find the radius of the circular base. ${PI[k].en}`, `Segi empat tepat dalam jaring-jaring sebuah silinder berukuran $${rect}$ cm kali ${h} cm. Cari jejari tapak bulat itu. ${PI[k].ms}`), a: T(`${n(rr)} cm`), w: T(`$2\\pi r = ${rect}$`), sp: 's' };
      if (v === 2) return { q: T(`Find the area of the rectangle in the net of a cylinder with radius ${n(rr)} cm and height ${h} cm. ${PI[k].en}`, `Cari luas segi empat tepat dalam jaring-jaring sebuah silinder berjejari ${n(rr)} cm dan tinggi ${h} cm. ${PI[k].ms}`), a: pa(k, 2 * rr * h, 1, U2), w: W(T('The rectangle is as long as the circumference of the base and as wide as the height:', 'Segi empat tepat itu sepanjang lilitan tapak dan selebar tinggi:'), `$2\\pi r \\times h = 2 \\times ${piT(k)} \\times ${n(rr)} \\times ${h}$`, `$= ${pv(k, 2 * rr * h)}${U2}$`), sp: 's' };
      const ctx = r.pick([[T('tin of sardines', 'tin sardin'), 'a'], [T('paint can', 'tin cat'), 'a'], [T('can of drink', 'tin minuman'), 'a']]);
      return { q: T(`A paper label covers the curved surface of a ${ctx[0].en} exactly, with no overlap. The label is $${rect}$ cm long and ${h} cm wide. Find the diameter of the ${ctx[0].en}. ${PI[k].en}`, `Satu label kertas menutupi permukaan melengkung sebuah ${ctx[0].ms} dengan tepat tanpa bertindih. Label itu panjangnya $${rect}$ cm dan lebarnya ${h} cm. Cari diameter ${ctx[0].ms} itu. ${PI[k].ms}`), a: T(`${n(2 * rr)} cm`), w: T(`$\\pi d = ${rect}$`), sp: 's' };
    },
    /* cone net: sector and circle */
    (r) => {
      const c = r.pick(CONES), [rr, l, th] = c, k = piK(r, ['exact', 'r22', 'p3142']);
      const v = r.int(0, 4);
      const fig = coneNet(rr, l, th, { l: cm(l), r: cm(rr), th: v === 0 ? '?' : `${th}°` });
      if (v === 0) return { q: T(`The net of a cone has a circular base of radius ${rr} cm and a sector of radius ${l} cm. Find the angle of the sector.`, `Jaring-jaring sebuah kon mempunyai tapak bulat berjejari ${rr} cm dan satu sektor berjejari ${l} cm. Cari sudut sektor itu.`), fig: coneNet(rr, l, th, { l: cm(l), r: cm(rr) }), a: T(`$${th}^\\circ$`), w: T(`$\\dfrac{\\theta}{360} \\times 2\\pi(${l}) = 2\\pi(${rr})$`), sp: 's' };
      if (v === 1) return { q: T(`The sector in the net of a cone has radius ${l} cm and angle $${th}^\\circ$. Find the radius of the circular base. `, `Sektor dalam jaring-jaring sebuah kon berjejari ${l} cm dan bersudut $${th}^\\circ$. Cari jejari tapak bulat itu.`), fig, a: T(`${rr} cm`), w: T(`$${th}/360 \\times ${l}$`), sp: 's' };
      if (v === 2) return { q: T(`In the net of a cone, the circular base has radius ${rr} cm and the sector has angle $${th}^\\circ$. Find the slant height of the cone, that is, the radius of the sector.`, `Dalam jaring-jaring sebuah kon, tapak bulat berjejari ${rr} cm dan sektor bersudut $${th}^\\circ$. Cari tinggi condong kon itu, iaitu jejari sektor itu.`), a: T(`${l} cm`), w: T(`$l = \\dfrac{360 \\times ${rr}}{${th}}$`), sp: 's' };
      if (v === 3) return { q: T(`Find the length of the arc of the sector in the net of a cone with base radius ${rr} cm and slant height ${l} cm. ${PI[k].en}`, `Cari panjang lengkok sektor dalam jaring-jaring sebuah kon berjejari tapak ${rr} cm dan tinggi condong ${l} cm. ${PI[k].ms}`), fig: coneNet(rr, l, th, { l: cm(l), r: cm(rr) }), a: pa(k, 2 * rr, 1, U1), w: T('Arc length = circumference of the base', 'Panjang lengkok = lilitan tapak'), sp: 's' };
      return { q: T(`Find the area of the sector in the net of a cone with base radius ${rr} cm and slant height ${l} cm. ${PI[k].en}`, `Cari luas sektor dalam jaring-jaring sebuah kon berjejari tapak ${rr} cm dan tinggi condong ${l} cm. ${PI[k].ms}`), a: pa(k, rr * l, 1, U2), w: T('$\\pi r l$'), sp: 's' };
    },
    /* cuboid net */
    (r) => {
      const l = r.int(4, 10), w = r.int(2, 6), h = r.int(2, 8), v = r.int(0, 3);
      need(new Set([l, w, h]).size === 3);
      const fig = cuboidNet(l, w, h, { l: cm(l), w: cm(w), h: cm(h) });
      if (v === 0) return { q: T('The figure shows the net of a cuboid. Find the total area of the net.', 'Rajah menunjukkan jaring-jaring sebuah kuboid. Cari jumlah luas jaring-jaring itu.'), fig, a: T(`$${2 * (l * w + l * h + w * h)}${U2}$`), w: T(`$2(${l * w} + ${l * h} + ${w * h})$`), sp: 's' };
      if (v === 1) return { q: T('The net of a cuboid is shown. Find the length and the width of the smallest rectangle that can contain the whole net.', 'Jaring-jaring sebuah kuboid ditunjukkan. Cari panjang dan lebar segi empat tepat terkecil yang boleh memuatkan seluruh jaring-jaring itu.'), fig, a: T(`${cm(2 * l + 2 * w)} by ${cm(h + 2 * w)}`, `${cm(2 * l + 2 * w)} kali ${cm(h + 2 * w)}`), w: T(`$2l + 2w$ by $h + 2w$`), sp: 's' };
      if (v === 2) { const miss = r.pick(['top', 'bottom', 'front', 'back', 'left', 'right']); const d = { top: [l, w], bottom: [l, w], front: [l, h], back: [l, h], left: [w, h], right: [w, h] }[miss]; return { q: T('One face of the net of a cuboid is missing (dashed). Find its area and the total area of the complete net.', 'Satu permukaan jaring-jaring sebuah kuboid tiada (garis putus-putus). Cari luasnya dan jumlah luas jaring-jaring yang lengkap.'), fig: cuboidNet(l, w, h, { l: cm(l), w: cm(w), h: cm(h) }, miss), a: T(`${d[0] * d[1]} cm², ${2 * (l * w + l * h + w * h)} cm²`), w: W(T(`Opposite faces of a cuboid are identical, so the missing face matches the one opposite it: ${cm(d[0])} by ${cm(d[1])}.`, `Permukaan bertentangan kuboid adalah sama, maka permukaan yang tiada itu sepadan dengan yang bertentangan dengannya: ${cm(d[0])} kali ${cm(d[1])}.`), `$${d[0]} \\times ${d[1]} = ${d[0] * d[1]}$`, `$2(${l * w} + ${l * h} + ${w * h}) = ${2 * (l * w + l * h + w * h)}$`), sp: 's' }; }
      const a = r.int(3, 9);
      return { q: T(`The net of a cube has edges of ${a} cm. Find the total area of the net and the length and width of the smallest rectangle that can contain the net when the six squares are in the usual cross shape.`, `Jaring-jaring sebuah kubus mempunyai tepi ${a} cm. Cari jumlah luas jaring-jaring itu serta panjang dan lebar segi empat tepat terkecil yang boleh memuatkan jaring-jaring itu apabila enam segi empat sama disusun dalam bentuk silang biasa.`), fig: cuboidNet(a, a, a, { l: cm(a) }), a: T(`${6 * a * a} cm²; ${4 * a} cm by ${3 * a} cm`, `${6 * a * a} cm²; ${4 * a} cm kali ${3 * a} cm`), w: W(T(`A cube has six identical square faces.`, `Kubus mempunyai enam permukaan segi empat sama yang serupa.`), `$6 \\times ${a}^2 = ${6 * a * a}$`, T(`The cross-shaped net is 4 squares across and 3 squares down: $4 \\times ${a} = ${4 * a}$ and $3 \\times ${a} = ${3 * a}$.`, `Jaring-jaring berbentuk palang itu 4 petak melintang dan 3 petak menegak: $4 \\times ${a} = ${4 * a}$ dan $3 \\times ${a} = ${3 * a}$.`)), sp: 's' };
    },
    /* triangular prism net */
    (r) => {
      const [a, b, c] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [4, 3, 5], [9, 12, 15]]), L = r.int(6, 14);
      const fig = triPrismNet(a, b, c, L, { L: cm(L), p: cm(a), q: cm(b), s: cm(c) });
      const v = r.int(0, 2);
      if (v === 0) return { q: T('The net of a right triangular prism is shown. The triangle has sides in cm as marked. Find the area of each of the three rectangles.', 'Jaring-jaring sebuah prisma tegak segi tiga ditunjukkan. Sisi segi tiga dalam cm seperti yang ditandakan. Cari luas setiap satu daripada tiga segi empat tepat itu.'), fig, a: T(`${a * L} cm², ${b * L} cm², ${c * L} cm²`), w: W(T(`Each rectangle is ${L} cm long and as wide as one side of the triangle.`, `Setiap segi empat tepat panjangnya ${L} cm dan lebarnya sama dengan satu sisi segi tiga.`), `$${a} \\times ${L} = ${a * L}$`, `$${b} \\times ${L} = ${b * L}$`, `$${c} \\times ${L} = ${c * L}$`), sp: 's' };
      if (v === 1) return { q: T('Find the total area of the net of the right triangular prism shown. (The triangles have a right angle between the sides marked with the two shorter lengths.)', 'Cari jumlah luas jaring-jaring prisma tegak segi tiga yang ditunjukkan. (Segi tiga itu bersudut tegak di antara dua sisi yang lebih pendek.)'), fig, a: T(`$${a * b + L * (a + b + c)}${U2}$`), w: T(`$2 \\times \\frac12 \\times ${a} \\times ${b} + ${L}(${a} + ${b} + ${c})$`), sp: 'm' };
      return { q: T(`The net of a right triangular prism has three rectangles measuring ${L} cm by ${a} cm, ${L} cm by ${b} cm and ${L} cm by ${c} cm, and two triangles. State the length of the prism and the three sides of the triangle.`, `Jaring-jaring sebuah prisma tegak segi tiga mempunyai tiga segi empat tepat berukuran ${L} cm kali ${a} cm, ${L} cm kali ${b} cm dan ${L} cm kali ${c} cm, serta dua segi tiga. Nyatakan panjang prisma itu dan tiga sisi segi tiga itu.`), a: T(`Length ${L} cm; sides ${a} cm, ${b} cm, ${c} cm`, `Panjang ${L} cm; sisi ${a} cm, ${b} cm, ${c} cm`), w: W(T(`The length shared by all three rectangles is the length of the prism.`, `Panjang yang dikongsi oleh ketiga-tiga segi empat tepat ialah panjang prisma.`), T(`Length $= ${L}$ cm; the triangle has sides ${a} cm, ${b} cm and ${c} cm.`, `Panjang $= ${L}$ cm; segi tiga itu bersisi ${a} cm, ${b} cm dan ${c} cm.`)), sp: 's' };
    },
    /* square pyramid net */
    (r) => {
      const a = r.pick([4, 6, 8, 10, 12]), l = r.int(Math.floor(a / 2) + 2, a + 5), v = r.int(0, 2);
      const fig = pyrNet(4, a, l, { s: cm(a), l: cm(l) });
      if (v === 0) return { q: T('The figure shows the net of a right square-based pyramid. Find the area of one triangular face and the total area of the net.', 'Rajah menunjukkan jaring-jaring sebuah piramid tegak tapak segi empat sama. Cari luas satu permukaan segi tiga dan jumlah luas jaring-jaring itu.'), fig, a: T(`${n((a * l) / 2)} cm², ${a * a + 2 * a * l} cm²`), w: T(`$a^2 + 4 \\times \\frac12 a l$`), sp: 's' };
      if (v === 1) return { q: T(`The net of a right square-based pyramid has a total area of ${a * a + 2 * a * l} cm². The base has sides of ${a} cm. Find the height of each triangular face, measured from its base.`, `Jaring-jaring sebuah piramid tegak tapak segi empat sama mempunyai jumlah luas ${a * a + 2 * a * l} cm². Tapaknya bersisi ${a} cm. Cari tinggi setiap permukaan segi tiga, diukur dari tapaknya.`), a: T(`${l} cm`), w: T(`$${a}^2 + 2(${a})l = ${a * a + 2 * a * l}$`), sp: 'm' };
      return { q: T(`Find the perimeter of the base and the total area of the four triangles in the net of a right square-based pyramid with base side ${a} cm and triangle height ${l} cm.`, `Cari perimeter tapak dan jumlah luas empat segi tiga dalam jaring-jaring sebuah piramid tegak tapak segi empat sama dengan sisi tapak ${a} cm dan tinggi segi tiga ${l} cm.`), a: T(`${4 * a} cm; ${2 * a * l} cm²`), w: W(T(`The base is a square of side ${a} cm, and there are four identical triangles.`, `Tapaknya ialah segi empat sama bersisi ${a} cm, dan terdapat empat segi tiga yang serupa.`), `$4 \\times ${a} = ${4 * a}$ cm`, `$4 \\times \\dfrac{1}{2} \\times ${a} \\times ${l} = ${2 * a * l}$`), sp: 's' };
    },
    /* opposite faces on a cube net */
    (r) => {
      const h = validHexo(r, true), ids = cubeOpp(h), letters = r.shuffle(['A', 'B', 'C', 'D', 'E', 'F']);
      const t = r.int(0, 5), opp = ids.findIndex((id, i) => id === (ids[t] ^ 1) && i !== t);
      return { q: T(`The figure shows the net of a cube with faces marked ${letters.slice().sort().join(', ')}. When the net is folded, which face is opposite face ${letters[t]}?`, `Rajah menunjukkan jaring-jaring sebuah kubus dengan permukaan bertanda ${letters.slice().sort().join(', ')}. Apabila jaring-jaring dilipat, permukaan manakah bertentangan dengan permukaan ${letters[t]}?`), fig: cubeFace(h, letters), a: T(`${letters[opp]}`), w: W(T(`Fold the net one square at a time. Two faces are opposite when they never touch along an edge and end up on either side of the cube.`, `Lipat jaring-jaring itu satu petak pada satu masa. Dua permukaan bertentangan apabila ia tidak pernah bersentuhan pada tepi dan berakhir di dua belah kubus.`), T(`Face ${letters[t]} ends up opposite face ${letters[opp]}.`, `Permukaan ${letters[t]} berakhir bertentangan dengan permukaan ${letters[opp]}.`)), sp: 'xs' };
    },
    /* check a proposed net */
    (r) => {
      const ok = r.chance(), v = r.int(0, 2);
      if (v === 0) {
        const k = r.pick(['r22', 'p3142']), rr = k === 'r22' ? r.pick([3.5, 7, 10.5]) : r.int(3, 9), h = r.int(6, 15);
        const good = 2 * rr * (k === 'r22' ? 22 / 7 : 3.142), Lr = ok ? good : round(good + r.pick([-4, -3, 3, 4]), 3);
        need(Lr > 0);
        return { q: T(`A student draws the net of a cylinder: a rectangle ${n(Lr)} cm by ${h} cm with a circle of radius ${n(rr)} cm attached to each long side. Can it be folded into a closed cylinder? Show your working. ${PI[k].en.replace(' and give the answer correct to 2 decimal places', '')}`, `Seorang murid melukis jaring-jaring sebuah silinder: satu segi empat tepat ${n(Lr)} cm kali ${h} cm dengan satu bulatan berjejari ${n(rr)} cm dicantumkan pada setiap sisi panjang. Bolehkah ia dilipat menjadi silinder tertutup? Tunjukkan langkah kerja anda. ${PI[k].ms.replace(' dan berikan jawapan betul kepada 2 tempat perpuluhan', '')}`), fig: cylNet(rr, h, { r: cm(rr), w: cm(Lr), h: cm(h) }), a: ok ? T(`Yes: $2\\pi r = ${n(round(good, 3))}$ equals the length of the rectangle.`, `Boleh: $2\\pi r = ${n(round(good, 3))}$ sama dengan panjang segi empat tepat.`) : T(`No: $2\\pi r = ${n(round(good, 3))}$ cm, but the rectangle is ${n(Lr)} cm long.`, `Tidak: $2\\pi r = ${n(round(good, 3))}$ cm, tetapi panjang segi empat tepat ialah ${n(Lr)} cm.`), w: W(T(`The rectangle has to wrap exactly once round the circle, so its length must equal the circumference of the circle.`, `Segi empat tepat itu mesti membalut tepat sekali mengelilingi bulatan, maka panjangnya mesti sama dengan lilitan bulatan itu.`), `$2\\pi r = ${n(round(good, 3))}$`, T(ok ? `This is the same as the ${n(Lr)} cm length of the rectangle, so it can be folded.` : `The rectangle is ${n(Lr)} cm long, which is different, so it cannot be folded.`, ok ? `Ini sama dengan panjang segi empat tepat ${n(Lr)} cm, maka ia boleh dilipat.` : `Segi empat tepat itu panjangnya ${n(Lr)} cm, yang berbeza, maka ia tidak boleh dilipat.`)), sp: 'm' };
      }
      if (v === 1) {
        const [rr, l, th] = r.pick(CONES), th2 = ok ? th : th + r.pick([-24, -12, 12, 24]);
        need(th2 > 10 && th2 < 350);
        return { q: T(`A net has a sector of radius ${l} cm and angle $${th2}^\\circ$ and a circle of radius ${rr} cm touching the arc. Can it be folded into a cone? Explain.`, `Satu jaring-jaring mempunyai sektor berjejari ${l} cm dan bersudut $${th2}^\\circ$ serta satu bulatan berjejari ${rr} cm yang bersentuhan dengan lengkok. Bolehkah ia dilipat menjadi kon? Jelaskan.`), fig: coneNet(rr, l, th2, { l: cm(l), r: cm(rr), th: `${th2}°` }), a: ok ? T(`Yes: $\\dfrac{${th2}}{360} \\times ${l} = ${rr}$, so the arc equals the circumference of the base.`, `Boleh: $\\dfrac{${th2}}{360} \\times ${l} = ${rr}$, maka panjang lengkok sama dengan lilitan tapak.`) : T(`No: the base radius needed is $\\dfrac{${th2}}{360} \\times ${l} = ${n(round((th2 / 360) * l, 2))}$ cm, not ${rr} cm.`, `Tidak: jejari tapak yang diperlukan ialah $\\dfrac{${th2}}{360} \\times ${l} = ${n(round((th2 / 360) * l, 2))}$ cm, bukan ${rr} cm.`), w: W(T(`The arc of the sector has to match the circumference of the base circle, which means $\\dfrac{\\theta}{360} \\times l = r$.`, `Lengkok sektor mesti sepadan dengan lilitan bulatan tapak, iaitu $\\dfrac{\\theta}{360} \\times l = r$.`), `$\\dfrac{${th2}}{360} \\times ${l} = ${n(round((th2 * l) / 360, 3))}$`, T(ok ? `This equals the base radius ${rr} cm, so the net folds into a cone.` : `The base radius is ${rr} cm, which is different, so it does not fold into a cone.`, ok ? `Ini sama dengan jejari tapak ${rr} cm, maka jaring-jaring itu membentuk kon.` : `Jejari tapak ialah ${rr} cm, yang berbeza, maka ia tidak membentuk kon.`)), sp: 'm' };
      }
      const l = r.int(5, 9), w = r.int(3, 6), h = r.int(2, 5);
      need(w !== l);
      const wOk = ok ? w : w + r.pick([1, 2]);
      return { q: T(`In a net of a cuboid, the top face is ${l} cm by ${w} cm and it is joined to the front face along a ${l} cm edge. The front face is ${l} cm by ${h} cm. The bottom face is ${l} cm by ${wOk} cm and is joined to the front face along its ${l} cm edge. Will the bottom face fit the cuboid? Explain.`, `Dalam jaring-jaring sebuah kuboid, permukaan atas ${l} cm kali ${w} cm dan bercantum dengan permukaan hadapan di sepanjang tepi ${l} cm. Permukaan hadapan ${l} cm kali ${h} cm. Permukaan bawah ${l} cm kali ${wOk} cm dan bercantum dengan permukaan hadapan di sepanjang tepi ${l} cm. Adakah permukaan bawah itu sesuai dengan kuboid itu? Jelaskan.`), a: ok ? T(`Yes: top and bottom faces must be identical, ${l} cm by ${w} cm.`, `Ya: permukaan atas dan bawah mesti sama, ${l} cm kali ${w} cm.`) : T(`No: the bottom face must be identical to the top face (${l} cm by ${w} cm), not ${wOk} cm wide.`, `Tidak: permukaan bawah mesti sama dengan permukaan atas (${l} cm kali ${w} cm), bukan selebar ${wOk} cm.`), w: W(T(`In a cuboid, opposite faces are identical, so the bottom face must be exactly the same size as the top face.`, `Dalam kuboid, permukaan bertentangan adalah sama, maka permukaan bawah mesti sama saiz dengan permukaan atas.`), T(ok ? `Top ${l} cm by ${w} cm, bottom ${l} cm by ${wOk} cm — the same, so it fits.` : `Top ${l} cm by ${w} cm, bottom ${l} cm by ${wOk} cm — different, so it does not fit.`, ok ? `Atas ${l} cm kali ${w} cm, bawah ${l} cm kali ${wOk} cm — sama, maka ia muat.` : `Atas ${l} cm kali ${w} cm, bawah ${l} cm kali ${wOk} cm — berbeza, maka ia tidak muat.`)), sp: 'm' };
    },
    /* from the net back to the solid: counting */
    (r) => {
      const pr = r.chance(), nn = r.int(3, 9), q = r.pick(['F', 'E', 'V']);
      const s = pr ? mkPrism(nn) : mkPyr(nn);
      const nm = pr ? T('prism', 'prisma') : T('pyramid', 'piramid');
      return { q: T(`The net of a ${nm.en} has ${nn} ${pr ? 'rectangles' : 'triangles'}. How many ${QN[q][0]} does the solid have?`, `Jaring-jaring sebuah ${nm.ms} mempunyai ${nn} ${pr ? 'segi empat tepat' : 'segi tiga'}. Berapakah bilangan ${QN[q][1]} bagi pepejal itu?`), a: T(`${s[q]}`), w: W(T(`${nn} ${pr ? 'rectangles' : 'triangles'} means the base has ${nn} sides.`, `${nn} ${pr ? 'segi empat tepat' : 'segi tiga'} bermakna tapaknya mempunyai ${nn} sisi.`), fevLine(s, q)), sp: 's' };
    },
  ];

  const g62a = [
    /* cone from r and h: net dimensions */
    (r) => {
      const [rr, h, l] = r.pick([[3, 4, 5], [6, 8, 10], [9, 12, 15], [12, 16, 20], [4, 3, 5], [8, 6, 10], [12, 9, 15]]), k = piK(r);
      const th = (360 * rr) / l;
      return { q: T(`A cone has base radius ${rr} cm and height ${h} cm. Its net is a circle and a sector. Find (a) the radius of the sector, (b) the angle of the sector, (c) the total area of the net. ${PI[k].en}`, `Sebuah kon berjejari tapak ${rr} cm dan tinggi ${h} cm. Jaring-jaringnya ialah satu bulatan dan satu sektor. Cari (a) jejari sektor, (b) sudut sektor, (c) jumlah luas jaring-jaring. ${PI[k].ms}`), a: P([T(`${l} cm`), T(`$${n(th)}^\\circ$`), pa(k, rr * l + rr * rr, 1, U2)]), w: T(`$l = \\sqrt{${rr}^2 + ${h}^2}$; $\\theta = 360 \\times \\frac{${rr}}{${l}}$; area $= \\pi r l + \\pi r^2$`), sp: 'l' };
    },
    /* sector to cone */
    (r) => {
      const [rr, l, th] = r.pick(CONES), k = piK(r);
      const h2 = l * l - rr * rr, h = Math.sqrt(h2);
      const v = r.int(0, 1);
      if (v === 0) {
        need(Number.isInteger(h));
        return { q: T(`A sector of radius ${l} cm and angle $${th}^\\circ$ is cut from a circular piece of paper and its straight edges are joined to make a cone without a base. Find (a) the base radius of the cone, (b) the height of the cone, (c) the area of paper used. ${PI[k].en}`, `Satu sektor berjejari ${l} cm dan bersudut $${th}^\\circ$ digunting daripada sekeping kertas bulat dan tepi lurusnya dicantumkan untuk membentuk kon tanpa tapak. Cari (a) jejari tapak kon itu, (b) tinggi kon itu, (c) luas kertas yang digunakan. ${PI[k].ms}`), a: P([T(`${rr} cm`), T(`${n(h)} cm`), pa(k, rr * l, 1, U2)]), w: T(`$r = \\frac{${th}}{360} \\times ${l}$; $h = \\sqrt{${l}^2 - ${rr}^2}$`), sp: 'l' };
      }
      const ctx = r.pick([[T('party hat', 'topi parti'), 'topi'], [T('paper funnel', 'corong kertas'), 'corong'], [T('paper cup', 'cawan kertas'), 'cawan']]);
      return { q: T(`A ${ctx[0].en} in the shape of a cone is made from a sector of paper of radius ${l} cm and angle $${th}^\\circ$. (a) Find the circumference of its circular opening. (b) Find the radius of the opening. ${PI[k].en}`, `Sebuah ${ctx[0].ms} berbentuk kon dibuat daripada satu sektor kertas berjejari ${l} cm dan bersudut $${th}^\\circ$. (a) Cari lilitan bukaan bulatnya. (b) Cari jejari bukaan itu. ${PI[k].ms}`), a: P([pa(k, (2 * l * th) / 360, 1, U1), T(`${rr} cm`)]), w: T('Arc length of the sector = circumference of the opening', 'Panjang lengkok sektor = lilitan bukaan'), sp: 'm' };
    },
    /* ratio r : l from angle */
    (r) => {
      const th = r.pick([72, 90, 120, 144, 150, 180, 216, 240, 270, 288]);
      const g = SPM.gcd(th, 360), a = th / g, b = 360 / g;
      return { q: T(`In the net of a cone, the angle of the sector is $${th}^\\circ$. Find the ratio of the base radius $r$ to the slant height $l$ of the cone, in its simplest form.`, `Dalam jaring-jaring sebuah kon, sudut sektor ialah $${th}^\\circ$. Cari nisbah jejari tapak $r$ kepada tinggi condong $l$ kon itu, dalam bentuk termudah.`), a: T(`$r : l = ${a} : ${b}$`), w: T(`$\\dfrac{r}{l} = \\dfrac{\\theta}{360}$`), sp: 's' };
    },
    /* rolling a rectangle two ways */
    (r) => {
      const a = r.int(1, 4), b = r.int(1, 4);
      need(a !== b);
      const L = 22 * a, W = 22 * b;
      const r1 = 3.5 * a, r2 = 3.5 * b, V1 = (22 / 7) * r1 * r1 * W, V2 = (22 / 7) * r2 * r2 * L;
      const useL = V1 > V2 ? L : W;
      return { q: T(`A rectangular sheet ${L} cm by ${W} cm is rolled up, without overlap, to form the curved surface of a cylinder. It can be rolled in two ways. Find the radius of the cylinder each way and state which way gives the larger volume. Use $\\pi = \\frac{22}{7}$.`, `Sekeping kepingan segi empat tepat ${L} cm kali ${W} cm digulung tanpa bertindih untuk membentuk permukaan melengkung sebuah silinder. Ia boleh digulung dengan dua cara. Cari jejari silinder bagi setiap cara dan nyatakan cara yang memberi isi padu lebih besar. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`Circumference ${L} cm: $r = ${n(r1)}$ cm, height ${W} cm, $V = ${n(round(V1, 2))}\\ \\text{cm}^3$. Circumference ${W} cm: $r = ${n(r2)}$ cm, height ${L} cm, $V = ${n(round(V2, 2))}\\ \\text{cm}^3$. The larger volume is obtained when ${useL} cm is the circumference.`, `Lilitan ${L} cm: $r = ${n(r1)}$ cm, tinggi ${W} cm, $V = ${n(round(V1, 2))}\\ \\text{cm}^3$. Lilitan ${W} cm: $r = ${n(r2)}$ cm, tinggi ${L} cm, $V = ${n(round(V2, 2))}\\ \\text{cm}^3$. Isi padu lebih besar diperoleh apabila ${useL} cm dijadikan lilitan.`), w: SPM.lines(T(`Rolling the sheet turns one side into the circumference and the other into the height.`, `Menggulung kepingan itu menjadikan satu sisi sebagai lilitan dan satu lagi sebagai tinggi.`), `$2 \\times \\dfrac{22}{7} \\times r = ${L} \\Rightarrow r = ${n(r1)}$`, `$2 \\times \\dfrac{22}{7} \\times r = ${W} \\Rightarrow r = ${n(r2)}$`, `$V = \\dfrac{22}{7} \\times ${n(r1)}^2 \\times ${W} = ${n(round(V1, 2))}$`, `$V = \\dfrac{22}{7} \\times ${n(r2)}^2 \\times ${L} = ${n(round(V2, 2))}$`, T(`The larger volume comes from taking ${useL} cm as the circumference — the wider roll wins, because the volume depends on $r^2$.`, `Isi padu yang lebih besar diperoleh apabila ${useL} cm diambil sebagai lilitan — gulungan yang lebih lebar menang, kerana isi padu bergantung pada $r^2$.`)), sp: 'l' };
    },
    /* cuboid net from the overall size */
    (r) => {
      const l = r.int(4, 9), w = r.int(2, 5), h = r.int(2, 6);
      need(new Set([l, w, h]).size === 3);
      return { q: T(`The net of a cuboid fits exactly inside a rectangle ${2 * l + 2 * w} cm by ${h + 2 * w} cm. The front face is ${l} cm long. Find the width and the height of the cuboid, and its total surface area.`, `Jaring-jaring sebuah kuboid muat tepat di dalam satu segi empat tepat ${2 * l + 2 * w} cm kali ${h + 2 * w} cm. Panjang permukaan hadapan ialah ${l} cm. Cari lebar dan tinggi kuboid itu, dan jumlah luas permukaannya.`), fig: cuboidNet(l, w, h, { l: `${l} cm` }), a: T(`Width ${w} cm, height ${h} cm, area ${2 * (l * w + l * h + w * h)} cm²`, `Lebar ${w} cm, tinggi ${h} cm, luas ${2 * (l * w + l * h + w * h)} cm²`), w: T(`$2l + 2w = ${2 * l + 2 * w}$ gives $w$; $h + 2w = ${h + 2 * w}$ gives $h$`), sp: 'l' };
    },
    /* how many of four are cube nets */
    (r) => {
      const list = [];
      for (let i = 0; i < 4; i++) list.push(randHexo(r));
      const keys = new Set(list.map(hexoKey));
      need(keys.size === 4);
      const c = list.filter(foldsToCube).length, who = list.map((h, i) => (foldsToCube(h) ? 'ABCD'[i] : '')).filter(Boolean);
      return { q: T('How many of the four arrangements of six squares can be folded into a cube? State which ones.', 'Berapakah bilangan susunan enam segi empat sama di bawah yang boleh dilipat menjadi kubus? Nyatakan yang mana.'), fig: netsRow(list, 16), a: c ? T(`${c}: ${who.join(', ')}`) : T('None', 'Tiada'), w: W(T(`Fold each arrangement in your head, keeping one square as the base, and check that the six squares cover the six faces without overlapping.`, `Lipat setiap susunan dalam fikiran, dengan mengekalkan satu segi empat sama sebagai tapak, dan semak bahawa enam petak itu menutupi enam permukaan tanpa bertindih.`), c ? T(`${who.join(', ')} fold into a cube; the others overlap.`, `${who.join(', ')} boleh dilipat menjadi kubus; yang lain bertindih.`) : T(`None of them works — every one has two squares landing on the same face.`, `Tiada satu pun berjaya — setiap satu mempunyai dua petak yang jatuh pada permukaan yang sama.`)), sp: 's' };
    },
    /* volume from a triangular prism net */
    (r) => {
      const [a, b, c] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]), L = r.int(5, 12);
      return { q: T('The figure shows the net of a right triangular prism. Find the volume of the prism.', 'Rajah menunjukkan jaring-jaring sebuah prisma tegak segi tiga. Cari isi padu prisma itu.'), fig: triPrismNet(a, b, c, L, { L: cm(L), p: cm(a), q: cm(b), s: cm(c) }), a: T(`$${a * b * L / 2}${U3}$`), w: T(`The triangle is right-angled (${a}, ${b}, ${c}); $V = \\frac12 \\times ${a} \\times ${b} \\times ${L}$`, `Segi tiga itu bersudut tegak (${a}, ${b}, ${c}); $V = \\frac12 \\times ${a} \\times ${b} \\times ${L}$`), sp: 'm' };
    },
    /* area of a labelled net (mixed solids) */
    (r) => {
      const t = r.int(0, 2);
      if (t === 0) {
        const k = piK(r), rr = rFor(k, r, 2, 8), h = r.int(5, 15);
        return { q: T(`The figure shows the net of a closed cylinder. Find its total area. ${PI[k].en}`, `Rajah menunjukkan jaring-jaring sebuah silinder tertutup. Cari jumlah luasnya. ${PI[k].ms}`), fig: cylNet(rr, h, { r: cm(rr), h: cm(h) }), a: pa(k, 2 * rr * h + 2 * rr * rr, 1, U2), w: T('$2\\pi r h + 2\\pi r^2$'), sp: 'm' };
      }
      if (t === 1) {
        const [rr, l] = r.pick([[3, 5], [4, 5], [5, 13], [6, 10], [8, 17], [7, 25]]), k = piK(r);
        const th = round((360 * rr) / l, 1);
        return { q: T(`The net of a cone is a circle of radius ${rr} cm and a sector of radius ${l} cm. Find the total area of the net. ${PI[k].en}`, `Jaring-jaring sebuah kon ialah satu bulatan berjejari ${rr} cm dan satu sektor berjejari ${l} cm. Cari jumlah luas jaring-jaring itu. ${PI[k].ms}`), fig: coneNet(rr, l, (360 * rr) / l, { l: cm(l), r: cm(rr) }), a: pa(k, rr * l + rr * rr, 1, U2), w: T(`Sector area $= \\pi r l$ (its angle is about $${n(th)}^\\circ$); circle area $= \\pi r^2$`, `Luas sektor $= \\pi r l$ (sudutnya kira-kira $${n(th)}^\\circ$); luas bulatan $= \\pi r^2$`), sp: 'm' };
      }
      const nn = r.pick([5, 6]), sd = r.pick([4, 6]), L = r.int(6, 12);
      const ap = sd / (2 * Math.tan(Math.PI / nn)), A = nn * sd * ap; // base area (both bases): 2 * (1/2 * perimeter * apothem)
      return { q: T(`The figure shows the net of a regular ${BAS[nn][0]}-based prism whose base has sides of ${sd} cm and whose length is ${L} cm. Find the total area of its rectangular faces and the perimeter of one base.`, `Rajah menunjukkan jaring-jaring sebuah prisma tegak yang tapaknya ${BAS[nn][1]} sekata bersisi ${sd} cm dan panjangnya ${L} cm. Cari jumlah luas permukaan segi empat tepatnya dan perimeter satu tapak.`), fig: polyPrismNet(nn, sd, L, { L: cm(L), s: cm(sd) }), a: T(`${nn * sd * L} cm²; ${nn * sd} cm`), w: T(`${nn} rectangles, each ${sd} cm by ${L} cm`, `${nn} segi empat tepat, setiap satu ${sd} cm kali ${L} cm`), sp: 'm' };
    },
    /* cylinder net options */
    (r) => {
      const opts = [];
      for (let i = 0; i < 3; i++) { const rr = r.pick([3.5, 7, 10.5]), h = r.int(8, 20), good = r.chance(0.34); opts.push({ rr, h, L: good ? 44 * rr / 7 : 44 * rr / 7 + r.pick([-2, -1, 1, 2, 3]), good }); }
      const nGood = opts.filter((o) => o.good).length;
      need(nGood === 1);
      const idx = opts.findIndex((o) => o.good);
      const txt = (l) => opts.map((o, i) => `(${'ABC'[i]}) ${l === 0 ? `a rectangle ${n(o.L)} cm by ${o.h} cm and two circles of radius ${n(o.rr)} cm` : `segi empat tepat ${n(o.L)} cm kali ${o.h} cm dan dua bulatan berjejari ${n(o.rr)} cm`}`).join('<br>');
      return { q: T(`Which of these sets of shapes can be assembled into the net of a closed cylinder? Use $\\pi = \\frac{22}{7}$.<br>${txt(0)}`, `Antara set bentuk berikut, yang manakah boleh disusun menjadi jaring-jaring sebuah silinder tertutup? Gunakan $\\pi = \\frac{22}{7}$.<br>${txt(1)}`), a: T(`(${'ABC'[idx]}): the length ${n(opts[idx].L)} cm equals the circumference $2\\pi(${n(opts[idx].rr)})$.`, `(${'ABC'[idx]}): panjang ${n(opts[idx].L)} cm sama dengan lilitan $2\\pi(${n(opts[idx].rr)})$.`), w: W(T(`The rectangle must wrap exactly round the circles, so its length must equal $2\\pi r$.`, `Segi empat tepat itu mesti membalut tepat mengelilingi bulatan, maka panjangnya mesti sama dengan $2\\pi r$.`), ...opts.map((o, i) => T(`(${'ABC'[i]}) $2 \\times \\dfrac{22}{7} \\times ${n(o.rr)} = ${n(round((44 * o.rr) / 7, 3))}$, but the rectangle is ${n(o.L)} cm long.`, `(${'ABC'[i]}) $2 \\times \\dfrac{22}{7} \\times ${n(o.rr)} = ${n(round((44 * o.rr) / 7, 3))}$, tetapi segi empat tepat itu panjangnya ${n(o.L)} cm.`)), T(`Only (${'ABC'[idx]}) matches.`, `Hanya (${'ABC'[idx]}) yang sepadan.`)), sp: 'm' };
    },
  ];

  /* ---- extra 6.2 families: real objects and costing ---- */
  const CYLO = [['tin of biscuits', 'tin biskut'], ['paint can', 'tin cat'], ['drum of cooking oil', 'dram minyak masak'], ['can of drink', 'tin minuman'], ['jar of honey', 'balang madu'], ['tin of condensed milk', 'tin susu pekat'], ['tube of crackers', 'tiub keropok'], ['tin of sardines', 'tin sardin'], ['tin of coconut milk', 'tin santan']];
  const CONEO = [['party hat', 'topi parti'], ['paper funnel', 'corong kertas'], ['traffic cone cover', 'penutup kon lalu lintas'], ['lampshade', 'penudung lampu'], ['ice-cream cone sleeve', 'sarung kon aiskrim'], ['paper cup', 'cawan kertas']];
  const BOXO = [['gift box', 'kotak hadiah'], ['shoe box', 'kotak kasut'], ['cereal box', 'kotak bijirin'], ['pizza box', 'kotak piza'], ['toy box', 'kotak mainan'], ['tissue box', 'kotak tisu']];
  const openBoxNet = (L, W, x, labs) => {
    const k = kfit(L, W, 230, 160), p = [[x, 0], [L - x, 0], [L - x, x], [L, x], [L, W - x], [L - x, W - x], [L - x, W], [x, W], [x, W - x], [0, W - x], [0, x], [x, x]].map((q) => [q[0] * k, q[1] * k]);
    let s = S.poly(p);
    const I = [[x, x], [L - x, x], [L - x, W - x], [x, W - x]].map((q) => [q[0] * k, q[1] * k]);
    s += S.poly(I, { dash: true });
    s += tx((L * k) / 2, -9, labs.L) + tx(-6, (W * k) / 2, labs.W, { a: 'end' }) + tx((x * k) / 2, (x * k) / 2, labs.x, { s: 10 });
    return mk(s, [[-30, -6], [L * k, W * k]], 16);
  };
  g62m.push(
    /* objects with a curved surface: labels, wrapping, sheet metal */
    (r) => {
      const o = r.pick(CYLO), k = piK(r), rr = rFor(k, r, 2, 8), h = r.int(6, 20), v = r.int(0, 3);
      const L = pv(k, 2 * rr);
      const nm = T(o[0], o[1]);
      if (v === 0) return { q: T(`A paper label wraps exactly once around the curved surface of a ${o[0]}. It is $${L}$ cm long and ${h} cm wide. Find the radius of the ${o[0]}. ${PI[k].en}`, `Satu label kertas membalut permukaan melengkung sebuah ${o[1]} tepat sekali. Panjangnya $${L}$ cm dan lebarnya ${h} cm. Cari jejari ${o[1]} itu. ${PI[k].ms}`), a: T(`${n(rr)} cm`), w: T(`$2\\pi r = ${L}$`), sp: 's' };
      if (v === 1) return { q: T(`A ${o[0]} has radius ${n(rr)} cm and height ${h} cm. Find the area of the label that covers its curved surface exactly. ${PI[k].en}`, `Sebuah ${o[1]} berjejari ${n(rr)} cm dan tinggi ${h} cm. Cari luas label yang menutupi permukaan melengkungnya dengan tepat. ${PI[k].ms}`), a: pa(k, 2 * rr * h, 1, U2), w: T('Area of the rectangle in the net $= 2\\pi r \\times h$'), sp: 's' };
      if (v === 2) return { q: T(`The net of a closed ${o[0]} is cut from a sheet of metal. The ${o[0]} has diameter ${n(2 * rr)} cm and height ${h} cm. Find the area of the net. ${PI[k].en}`, `Jaring-jaring sebuah ${o[1]} tertutup dipotong daripada kepingan logam. ${SPM.cap(o[1])} itu berdiameter ${n(2 * rr)} cm dan tinggi ${h} cm. Cari luas jaring-jaring itu. ${PI[k].ms}`), a: pa(k, 2 * rr * h + 2 * rr * rr, 1, U2), w: T('$2\\pi r^2 + 2\\pi r h$'), sp: 'm' };
      return { q: T(`Aini wants to wrap a strip of ribbon once around a ${o[0]} of diameter ${n(2 * rr)} cm and then cut the ribbon. How long must the ribbon be at least? ${PI[k].en}`, `Aini ingin melilit seutas reben sekali di sekeliling sebuah ${o[1]} berdiameter ${n(2 * rr)} cm. Berapakah panjang reben yang paling kurang diperlukan? ${PI[k].ms}`), a: pa(k, 2 * rr, 1, U1), w: T('Length = circumference $= \\pi d$'), sp: 's' };
    },
    /* cone objects */
    (r) => {
      const o = r.pick(CONEO), [rr, l, th] = r.pick(CONES), k = piK(r), v = r.int(0, 3);
      if (v === 0) return { q: T(`A ${o[0]} is made from a sector of paper of radius ${l} cm and angle $${th}^\\circ$. Find the radius of its circular opening.`, `Sebuah ${o[1]} dibuat daripada satu sektor kertas berjejari ${l} cm dan bersudut $${th}^\\circ$. Cari jejari bukaan bulatnya.`), a: T(`${rr} cm`), w: T(`$\\dfrac{${th}}{360} \\times ${l}$`), sp: 's' };
      if (v === 1) return { q: T(`A ${o[0]} has a circular opening of radius ${rr} cm and a slant height of ${l} cm. Find the angle of the sector of paper needed to make it.`, `Sebuah ${o[1]} mempunyai bukaan bulat berjejari ${rr} cm dan tinggi condong ${l} cm. Cari sudut sektor kertas yang diperlukan untuk membuatnya.`), a: T(`$${th}^\\circ$`), w: T(`$\\theta = 360 \\times \\dfrac{${rr}}{${l}}$`), sp: 's' };
      if (v === 2) return { q: T(`The sector of paper used for a ${o[0]} has radius ${l} cm and angle $${th}^\\circ$. Find the area of paper used. ${PI[k].en}`, `Sektor kertas yang digunakan untuk sebuah ${o[1]} berjejari ${l} cm dan bersudut $${th}^\\circ$. Cari luas kertas yang digunakan. ${PI[k].ms}`), a: pa(k, rr * l, 1, U2), w: T(`Area $= \\dfrac{${th}}{360} \\times \\pi(${l})^2$`), sp: 's' };
      return { q: T(`A ${o[0]} is formed by joining the straight edges of a sector of angle $${th}^\\circ$. The edge of the opening is ${pv(k, 2 * rr)} cm long. Find the radius of the sector. ${PI[k].en}`, `Sebuah ${o[1]} dibentuk dengan mencantumkan tepi lurus satu sektor bersudut $${th}^\\circ$. Tepi bukaannya panjangnya ${pv(k, 2 * rr)} cm. Cari jejari sektor itu. ${PI[k].ms}`), a: T(`${l} cm`), w: T(`Arc length $= 2\\pi r$, so $\\dfrac{${th}}{360} \\times 2\\pi l = ${pv(k, 2 * rr)}$`), sp: 'm' };
    },
    /* cuboid boxes cut from card */
    (r) => {
      const o = r.pick(BOXO), l = r.int(6, 14), w = r.int(3, 8), h = r.int(2, 8);
      need(new Set([l, w, h]).size === 3);
      const v = r.int(0, 2), net = 2 * (l * w + l * h + w * h), box = (2 * l + 2 * w) * (h + 2 * w);
      if (v === 0) return { q: T(`A ${o[0]} is a closed cuboid ${l} cm by ${w} cm by ${h} cm. Find the area of card needed for its net (ignore flaps).`, `Sebuah ${o[1]} ialah kuboid tertutup ${l} cm kali ${w} cm kali ${h} cm. Cari luas kad yang diperlukan untuk jaring-jaringnya (abaikan lipatan).`), a: T(`${net} cm²`), w: W(T(`A closed cuboid has three pairs of identical faces.`, `Kuboid tertutup mempunyai tiga pasang permukaan yang sama.`), `$2(${l} \\times ${w} + ${l} \\times ${h} + ${w} \\times ${h}) = ${net}$`), sp: 's' };
      if (v === 1) return { q: T(`The net of a ${o[0]} measuring ${l} cm by ${w} cm by ${h} cm is cut from a rectangular card ${2 * l + 2 * w} cm by ${h + 2 * w} cm. Find the area of the card that is wasted.`, `Jaring-jaring sebuah ${o[1]} berukuran ${l} cm kali ${w} cm kali ${h} cm dipotong daripada sekeping kad segi empat tepat ${2 * l + 2 * w} cm kali ${h + 2 * w} cm. Cari luas kad yang terbuang.`), fig: cuboidNet(l, w, h, { l: cm(l), w: cm(w), h: cm(h) }), a: T(`${box - net} cm²`), w: T(`$${2 * l + 2 * w} \\times ${h + 2 * w} - ${net}$`), sp: 'm' };
      return { q: T(`The net of a ${o[0]} has an area of ${net} cm². Two of its dimensions are ${l} cm and ${w} cm. Find the third dimension.`, `Jaring-jaring sebuah ${o[1]} mempunyai luas ${net} cm². Dua daripada dimensinya ialah ${l} cm dan ${w} cm. Cari dimensi yang ketiga.`), a: T(`${h} cm`), w: T(`$2(${l * w} + ${l}h + ${w}h) = ${net}$`), sp: 'm' };
    },
    /* die with opposite faces adding to 7 */
    (r) => {
      const h = validHexo(r, true), ids = cubeOpp(h), pairs = r.shuffle([[1, 6], [2, 5], [3, 4]]).map((p) => r.shuffle(p));
      const num = ids.map((id) => pairs[id >> 1][id & 1]);
      const t = r.int(0, 5), shown = num.map((v, i) => (i === t ? '?' : String(v)));
      return { q: T('The net of a die is shown. On a die the numbers on opposite faces add up to 7. Find the number that should replace ?.', 'Jaring-jaring sebuah dadu ditunjukkan. Pada dadu, nombor pada permukaan yang bertentangan berjumlah 7. Cari nombor yang patut menggantikan ?.'), fig: cubeFace(h, shown), a: T(`${num[t]}`), w: W(T(`Fold the net to see which face ends up opposite ?.`, `Lipat jaring-jaring itu untuk melihat permukaan yang berakhir bertentangan dengan ?.`), T(`Its opposite face shows ${7 - num[t]}, and $7 - ${7 - num[t]} = ${num[t]}$.`, `Permukaan bertentangannya menunjukkan ${7 - num[t]}, dan $7 - ${7 - num[t]} = ${num[t]}$.`)), sp: 'xs' };
    },
  );
  g62a.push(
    /* costs of cans */
    (r) => {
      const o = r.pick(CYLO), h = r.int(6, 20), N = r.pick([100, 200, 500, 1000]), price = r.pick([0.2, 0.25, 0.5, 0.8]);
      const rr = r.pick([3.5, 7, 10.5]), A = (22 / 7) * (2 * rr * h + 2 * rr * rr);
      const cost = (A * N * price) / 100;
      need(Math.abs(cost * 100 - Math.round(cost * 100)) < 1e-6);
      return { q: T(`A closed ${o[0]} has radius ${n(rr)} cm and height ${h} cm. The metal sheet for its net costs ${rm(price)} per 100 cm². Find the cost of the sheet for ${N} such ${o[0]}s, ignoring waste. Use $\\pi = \\frac{22}{7}$.`, `Sebuah ${o[1]} tertutup berjejari ${n(rr)} cm dan tinggi ${h} cm. Kepingan logam untuk jaring-jaringnya berharga ${rm(price)} per 100 cm². Cari kos kepingan itu untuk ${N} ${o[1]} yang sama, abaikan bahan terbuang. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(rm(cost)), w: T(`Net area $= 2\\pi r h + 2\\pi r^2 = ${n(round(A, 2))}\\ \\text{cm}^2$`), sp: 'l' };
    },
    /* cost of cones */
    (r) => {
      const o = r.pick(CONEO), c = r.pick(CONES.filter((x) => x[0] % 7 === 0)), N = r.pick([20, 50, 100, 200]), price = r.pick([0.1, 0.2, 0.25, 0.5]);
      const A = (22 / 7) * c[0] * c[1], cost = (A * N * price) / 100;
      need(Math.abs(cost * 100 - Math.round(cost * 100)) < 1e-6);
      return { q: T(`A ${o[0]} is made from a sector of paper of radius ${c[1]} cm and angle $${c[2]}^\\circ$. Paper costs ${rm(price)} per 100 cm². Find the base radius of the ${o[0]} and the cost of the paper for ${N} of them. Use $\\pi = \\frac{22}{7}$.`, `Sebuah ${o[1]} dibuat daripada satu sektor kertas berjejari ${c[1]} cm dan bersudut $${c[2]}^\\circ$. Kertas berharga ${rm(price)} per 100 cm². Cari jejari tapak ${o[1]} itu dan kos kertas untuk ${N} buah. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${c[0]} cm; ${rm(cost)}`), w: T(`Area of one sector $= \\pi r l = ${n(round(A, 2))}\\ \\text{cm}^2$`), sp: 'l' };
    },
    /* open box from a card */
    (r) => {
      const x = r.int(2, 5), L = r.int(2 * x + 4, 2 * x + 14), W = r.int(2 * x + 2, L);
      const l = L - 2 * x, w = W - 2 * x;
      need(l > x && w > 0);
      const v = r.int(0, 1);
      const parts = SPM.parts([T('the length, width and height of the open box', 'panjang, lebar dan tinggi kotak terbuka itu'), T('the volume of the box', 'isi padu kotak itu'), T('the area of card actually used in the box', 'luas kad yang sebenarnya digunakan pada kotak itu')]);
      return { q: T(`A rectangular card ${L} cm by ${W} cm has a square of side ${x} cm cut from each corner. The sides are folded up along the dashed lines to make an open box. Find:${parts.en}`, `Sekeping kad segi empat tepat ${L} cm kali ${W} cm dipotong satu segi empat sama bersisi ${x} cm pada setiap sudutnya. Sisi-sisinya dilipat ke atas di sepanjang garis putus-putus untuk membentuk kotak terbuka. Cari:${parts.ms}`), fig: openBoxNet(L, W, x, { L: cm(L), W: cm(W), x: cm(x) }), a: SPM.parts([T(`${cm(l)} by ${cm(w)} by ${cm(x)}`, `${cm(l)} kali ${cm(w)} kali ${cm(x)}`), T(`${l * w * x} cm³`), T(`${L * W - 4 * x * x} cm²`)]), w: SPM.lines(T(`Cutting a ${x} cm square from each corner takes $2 \\times ${x} = ${2 * x}$ cm off each side, and folding up gives a height of ${x} cm.`, `Memotong segi empat sama ${x} cm pada setiap sudut mengurangkan setiap sisi sebanyak $2 \\times ${x} = ${2 * x}$ cm, dan melipatnya memberi tinggi ${x} cm.`), `$${L} - ${2 * x} = ${l}$, $${W} - ${2 * x} = ${w}$`, `$V = ${l} \\times ${w} \\times ${x} = ${l * w * x}$`, `$${L} \\times ${W} - 4 \\times ${x}^2 = ${L * W - 4 * x * x}$`), sp: 'l' };
    },
    /* a sector removed from a circle */
    (r) => {
      const c = r.pick([[9, 15, 216], [12, 15, 288], [6, 10, 216], [12, 20, 216], [16, 20, 288], [3, 5, 216], [15, 25, 216]]), k = piK(r), R = c[1], rem = c[2];
      const h = Math.sqrt(R * R - c[0] * c[0]);
      need(Number.isInteger(h));
      return { q: T(`A sector of angle $${360 - rem}^\\circ$ is cut out of a circular piece of paper of radius ${R} cm, and the remaining part is rolled into a cone without a base. Find (a) the base radius, (b) the height, (c) the curved surface area of the cone. ${PI[k].en}`, `Satu sektor bersudut $${360 - rem}^\\circ$ dipotong daripada sekeping kertas bulat berjejari ${R} cm, dan bahagian yang tinggal digulung menjadi kon tanpa tapak. Cari (a) jejari tapak, (b) tinggi, (c) luas permukaan melengkung kon itu. ${PI[k].ms}`), a: P([T(`${c[0]} cm`), T(`${n(h)} cm`), pa(k, c[0] * R, 1, U2)]), w: T(`Remaining angle $= ${rem}^\\circ$; $r = \\dfrac{${rem}}{360} \\times ${R}$; $h = \\sqrt{${R}^2 - ${c[0]}^2}$`), sp: 'l' };
    },
    /* tent: isosceles triangular prism */
    (r) => {
      const [hw, ht, sl] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [4, 3, 5]]), L = r.int(4, 12), price = r.pick([2, 3, 5]);
      const withFloor = r.chance();
      const A = ht * hw + 2 * sl * L + (withFloor ? 2 * hw * L : 0);
      const fl = withFloor ? T('including the floor', 'termasuk lantai') : T('without a floor', 'tanpa lantai');
      return { q: T(`A tent is in the shape of a triangular prism ${L} m long. Each end is an isosceles triangle with base ${2 * hw} m and height ${ht} m. Find the area of canvas needed (${fl.en}), and the cost at ${rm(price)} per m².`, `Sebuah khemah berbentuk prisma segi tiga yang panjangnya ${L} m. Setiap hujung ialah segi tiga sama kaki dengan tapak ${2 * hw} m dan tinggi ${ht} m. Cari luas kanvas yang diperlukan (${fl.ms}), dan kosnya pada harga ${rm(price)} per m².`), a: T(`${A} m²; ${rm(A * price)}`), w: T(`Slant side $= \\sqrt{${hw}^2 + ${ht}^2} = ${sl}$; ends $= 2 \\times \\frac12 \\times ${2 * hw} \\times ${ht}$`, `Sisi condong $= \\sqrt{${hw}^2 + ${ht}^2} = ${sl}$; hujung $= 2 \\times \\frac12 \\times ${2 * hw} \\times ${ht}$`), sp: 'l' };
    },
  );

  g62a.push(
    /* reasoning about nets */
    (r) => {
      const bank = [
        ['"The net of a cone is a circle and a triangle."', '"Jaring-jaring kon ialah satu bulatan dan satu segi tiga."', 'Incorrect. The curved surface of a cone opens out into a sector, not a triangle.', 'Tidak betul. Permukaan melengkung kon terbuka menjadi sektor, bukan segi tiga.'],
        ['"The rectangle in the net of a cylinder has length equal to the height of the cylinder."', '"Segi empat tepat dalam jaring-jaring silinder mempunyai panjang yang sama dengan tinggi silinder."', 'Incorrect. One side equals the height and the other side equals the circumference of the base, $2\\pi r$.', 'Tidak betul. Satu sisi sama dengan tinggi dan sisi yang lain sama dengan lilitan tapak, $2\\pi r$.'],
        ['"A net of a square-based pyramid needs one square and four identical rectangles."', '"Jaring-jaring piramid tapak segi empat sama memerlukan satu segi empat sama dan empat segi empat tepat yang sama."', 'Incorrect. The four side faces are triangles.', 'Tidak betul. Empat permukaan sisi ialah segi tiga.'],
        ['"Any arrangement of six squares joined edge to edge folds into a cube."', '"Sebarang susunan enam segi empat sama yang bercantum tepi ke tepi boleh dilipat menjadi kubus."', 'Incorrect. For example, a 2 by 3 block of squares makes overlapping faces when folded.', 'Tidak betul. Contohnya, blok 2 kali 3 segi empat sama menghasilkan permukaan yang bertindih apabila dilipat.'],
        ['"The two circles in the net of a cylinder must touch the rectangle along an edge of length $2\\pi r$."', '"Dua bulatan dalam jaring-jaring silinder mesti bersentuhan dengan segi empat tepat di sepanjang tepi yang panjangnya $2\\pi r$."', 'Correct. Each circle has circumference $2\\pi r$, which equals the length of the rectangle.', 'Betul. Setiap bulatan mempunyai lilitan $2\\pi r$, yang sama dengan panjang segi empat tepat.'],
        ['"A larger sector angle gives a cone with a larger base radius, if the slant height stays the same."', '"Sudut sektor yang lebih besar menghasilkan kon dengan jejari tapak yang lebih besar, jika tinggi condong tidak berubah."', 'Correct. $r = \\dfrac{\\theta}{360} \\times l$, so $r$ increases when $\\theta$ increases.', 'Betul. $r = \\dfrac{\\theta}{360} \\times l$, maka $r$ bertambah apabila $\\theta$ bertambah.'],
        ['"The net of a triangular prism always has three rectangles and two triangles."', '"Jaring-jaring prisma segi tiga sentiasa mempunyai tiga segi empat tepat dan dua segi tiga."', 'Correct for a right triangular prism: one rectangle for each side of the triangle, and two triangular bases.', 'Betul untuk prisma tegak segi tiga: satu segi empat tepat bagi setiap sisi segi tiga, dan dua tapak segi tiga.'],
        ['"The net of a cuboid is made of three pairs of identical rectangles."', '"Jaring-jaring kuboid terdiri daripada tiga pasang segi empat tepat yang sama."', 'Correct. Opposite faces of a cuboid are identical, so there are three pairs.', 'Betul. Permukaan bertentangan sebuah kuboid adalah sama, maka terdapat tiga pasang.'],
      ];
      const b = r.pick(bank);
      return { q: T(`Is this statement correct? Give a reason.<br>${b[0]}`, `Adakah pernyataan ini betul? Berikan satu sebab.<br>${b[1]}`), a: T(b[2], b[3]), w: W(T(`Check the statement against what each net really contains: a cone opens out into a sector and a circle; a cylinder into a rectangle of length $2\\pi r$ and two circles; a pyramid into a base and triangles; a cuboid into three pairs of identical rectangles.`, `Semak pernyataan itu dengan kandungan sebenar setiap jaring-jaring: kon terbuka menjadi satu sektor dan satu bulatan; silinder menjadi satu segi empat tepat sepanjang $2\\pi r$ dan dua bulatan; piramid menjadi satu tapak dan segi tiga; kuboid menjadi tiga pasang segi empat tepat yang sama.`), T(b[2], b[3])), sp: 's' };
    },
    /* reverse: from the area of the net */
    (r) => {
      const t = r.int(0, 3), k = piK(r, ['exact', 'r22', 'p3142']);
      if (t === 0) {
        const rr = rFor(k, r, 2, 8), h = r.int(4, 15);
        const A = 2 * rr * h + 2 * rr * rr;
        return { q: T(`The total area of the net of a closed cylinder of radius ${n(rr)} cm is $${pv(k, A)}\\ \\text{cm}^2$. Find the height of the cylinder. ${PI[k].en}`, `Jumlah luas jaring-jaring sebuah silinder tertutup berjejari ${n(rr)} cm ialah $${pv(k, A)}\\ \\text{cm}^2$. Cari tinggi silinder itu. ${PI[k].ms}`), a: T(`${h} cm`), w: T(`$2\\pi r h + 2\\pi r^2 = ${pv(k, A)}$`), sp: 'm' };
      }
      if (t === 1) {
        const [rr, l] = r.pick([[3, 5], [4, 5], [5, 13], [6, 10], [8, 17], [7, 25], [9, 15]]);
        return { q: T(`The total area of the net of a cone with base radius ${rr} cm is $${pv(k, rr * l + rr * rr)}\\ \\text{cm}^2$. Find the slant height of the cone. ${PI[k].en}`, `Jumlah luas jaring-jaring sebuah kon berjejari tapak ${rr} cm ialah $${pv(k, rr * l + rr * rr)}\\ \\text{cm}^2$. Cari tinggi condong kon itu. ${PI[k].ms}`), a: T(`${l} cm`), w: T(`$\\pi r l + \\pi r^2$`), sp: 'm' };
      }
      if (t === 2) {
        const l = r.int(4, 10), w = r.int(3, 8), h = r.int(2, 9);
        need(w !== l && h !== w && h !== l);
        return { q: T(`The total area of the net of a closed cuboid is ${2 * (l * w + l * h + w * h)} cm². The cuboid is ${l} cm long and ${w} cm wide. Find its height.`, `Jumlah luas jaring-jaring sebuah kuboid tertutup ialah ${2 * (l * w + l * h + w * h)} cm². Kuboid itu panjangnya ${l} cm dan lebarnya ${w} cm. Cari tingginya.`), a: T(`${h} cm`), w: T(`$2(${l * w} + ${l}h + ${w}h) = ${2 * (l * w + l * h + w * h)}$`), sp: 'm' };
      }
      const a = r.pick([4, 6, 8, 10]), l = r.int(a / 2 + 2, a + 6);
      return { q: T(`The net of a right square-based pyramid has a total area of ${a * a + 2 * a * l} cm². The side of the square base is ${a} cm. Find the height of each triangular face measured from its base, and the area of the four triangles.`, `Jaring-jaring sebuah piramid tegak tapak segi empat sama mempunyai jumlah luas ${a * a + 2 * a * l} cm². Sisi tapak segi empat sama itu ${a} cm. Cari tinggi setiap permukaan segi tiga diukur dari tapaknya, dan jumlah luas empat segi tiga itu.`), a: T(`${l} cm; ${2 * a * l} cm²`), w: W(T(`The net is one square base plus four identical triangles.`, `Jaring-jaring itu ialah satu tapak segi empat sama dan empat segi tiga yang serupa.`), `$${a}^2 + 4 \\times \\dfrac{1}{2} \\times ${a} \\times l = ${a * a + 2 * a * l}$`, `$${2 * a}l = ${2 * a * l}$`, `$l = ${l}$ cm`, `$2 \\times ${a} \\times ${l} = ${2 * a * l}$`), sp: 'm' };
    },
  );

  g62a.push(
    /* comparing cone nets */
    (r) => {
      const l = r.pick([10, 12, 15, 20, 24]), t = r.int(0, 3);
      const ths = r.sample([60, 90, 120, 150, 180, 240, 270], 2);
      const [t1, t2] = ths;
      need(t !== 3 || (l * t1) % 180 === 0);
      const g = SPM.gcd(t1, t2);
      if (t === 0) return { q: T(`Two cones are made from sectors of the same radius ${l} cm. The sector angles are $${t1}^\\circ$ and $${t2}^\\circ$. Write the ratio of their base radii in its simplest form.`, `Dua kon dibuat daripada sektor yang sama jejarinya, iaitu ${l} cm. Sudut sektor ialah $${t1}^\\circ$ dan $${t2}^\\circ$. Tulis nisbah jejari tapak kedua-dua kon itu dalam bentuk termudah.`), a: T(`$${t1 / g} : ${t2 / g}$`), w: T('$r = \\dfrac{\\theta}{360} l$, so $r$ is proportional to $\\theta$'), sp: 's' };
      if (t === 1) return { q: T(`Two cone nets have sectors of radius ${l} cm with angles $${t1}^\\circ$ and $${t2}^\\circ$. Which cone has the larger curved surface area? Find the ratio of the two curved surface areas.`, `Dua jaring-jaring kon mempunyai sektor berjejari ${l} cm dengan sudut $${t1}^\\circ$ dan $${t2}^\\circ$. Kon yang manakah mempunyai luas permukaan melengkung yang lebih besar? Cari nisbah kedua-dua luas itu.`), a: T(`The cone with the ${t1 > t2 ? t1 : t2}° sector; ratio $${t1 / g} : ${t2 / g}$`, `Kon dengan sektor ${t1 > t2 ? t1 : t2}°; nisbah $${t1 / g} : ${t2 / g}$`), w: T('Sector area $= \\dfrac{\\theta}{360}\\pi l^2$'), sp: 's' };
      if (t === 2) return { q: T(`A sector of angle $${t1}^\\circ$ is cut from a circle of radius ${l} cm. What fraction of the circle is the sector, and what fraction of the circle's area remains?`, `Satu sektor bersudut $${t1}^\\circ$ dipotong daripada sebuah bulatan berjejari ${l} cm. Apakah pecahan bulatan yang diwakili oleh sektor itu, dan apakah pecahan luas bulatan yang tinggal?`), a: T(`$${Fr.tex(Fr.make(t1, 360))}$; $${Fr.tex(Fr.make(360 - t1, 360))}$`), w: W(T('A full circle is $360^\\circ$, so the sector is that fraction of it:', 'Bulatan penuh ialah $360^\\circ$, jadi sektor itu ialah pecahan tersebut daripadanya:'), `$\\dfrac{${t1}}{360} = ${Fr.tex(Fr.make(t1, 360))}$`, T('The rest of the circle is what is left:', 'Bahagian bulatan yang tinggal ialah bakinya:'), `$\\dfrac{360 - ${t1}}{360} = \\dfrac{${360 - t1}}{360} = ${Fr.tex(Fr.make(360 - t1, 360))}$`), sp: 's' };
      return { q: T(`The sector in the net of a cone has radius ${l} cm and the base radius of the cone is ${l * t1 / 360} cm. Find the fraction of a full circle that the sector forms, and the angle of the sector.`, `Sektor dalam jaring-jaring sebuah kon berjejari ${l} cm dan jejari tapak kon itu ialah ${l * t1 / 360} cm. Cari pecahan bulatan penuh yang dibentuk oleh sektor itu, dan sudut sektor itu.`), a: T(`$${Fr.tex(Fr.make(t1, 360))}$; $${t1}^\\circ$`), w: T('Fraction $= \\dfrac{r}{l}$'), sp: 's' };
    },
  );
  SPM.extend('F2-6.2', { e: g62e, m: g62m, a: g62a });

  /* ================================================================= 6.3 */
  const px = (h, r) => Math.max(26, Math.min(96, (34 * h) / r));
  const coneF = (r, l, h) => stackSvg([{ t: 'cone', h: px(h, r) }], 34, { rad: { t: cm(r), y: 'base' }, slant: { t: cm(l), i: 0 }, axis: h ? { t: cm(h), i: 0 } : undefined });
  const cylF = (r, h) => stackSvg([{ t: 'cyl', h: px(h, r) }], 34, { dims: [{ a: 0, t: cm(h) }], rad: { t: cm(r), y: 'top' } });
  /** A + c*pi in the chosen convention, with unit u */
  const pm = (k, A, c, u) => {
    if (!A) return pa(k, c, 1, u);
    if (k === 'exact') return T(`$(${n(A)} + ${pv('exact', c)})${u}$`);
    pv(k, c);
    return T(`$${n(round(A + pnum(k, c), 2))}${u}$`);
  };
  const TRI = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25], [10, 24, 26]];
  const cuboidFace = (l, w, h) => 2 * (l * w + l * h + w * h);
  const UM2 = U2.replace('cm', 'm');
  const R = (p) => (p.dia ? [`diameter ${n(2 * p.r)} cm`, `berdiameter ${n(2 * p.r)} cm`] : [`radius ${n(p.r)} cm`, `berjejari ${n(p.r)} cm`]);
  const conePick = (r, k) => (k === 'r22' ? { r: 7, h: 24, l: 25 } : ((t) => ({ r: t[0], h: t[1], l: t[2] }))(r.pick(TRI)));

  /* solids: N = noun, gen = random dimensions, D = dimension phrase; asks: [level, English template, Malay template, area = [A, c] (A + c pi), working] */
  const SB = {
    cyl: { N: ['cylinder', 'silinder'], gen: (r, k) => ({ r: rFor(k, r, 2, 10), h: r.int(4, 16), dia: r.chance(0.4), nn: r.pick([['cylinder', 'silinder'], ['drum', 'dram'], ['tin', 'tin'], ['water tank', 'tangki air']]) }), D: (p) => [`${R(p)[0]} and height ${p.h} cm`, `${R(p)[1]} dan tinggi ${p.h} cm`],
      asks: [['e', 'Find the curved surface area of a {N} of {D}.', 'Cari luas permukaan melengkung sebuah {N} {D}.', (p) => [0, 2 * p.r * p.h], '$2\\pi r h$', undefined, '2 \\times {pi} \\times {r} \\times {h}'],
        ['e', 'Find the total surface area of a closed {N} of {D}.', 'Cari jumlah luas permukaan sebuah {N} tertutup {D}.', (p) => [0, 2 * p.r * p.h + 2 * p.r * p.r], '$2\\pi r h + 2\\pi r^2$', undefined, '2 \\times {pi} \\times {r} \\times {h} + 2 \\times {pi} \\times {r}^2'],
        ['e', 'A {N} of {D} is open at the top. Find the total area of its curved surface and its base.', 'Sebuah {N} {D} terbuka di bahagian atas. Cari jumlah luas permukaan melengkung dan tapaknya.', (p) => [0, 2 * p.r * p.h + p.r * p.r], '$2\\pi r h + \\pi r^2$', undefined, '2 \\times {pi} \\times {r} \\times {h} + {pi} \\times {r}^2'],
        ['e', 'Find the area of one circular end of a {N} of {D}.', 'Cari luas satu hujung bulat sebuah {N} {D}.', (p) => [0, p.r * p.r], '$\\pi r^2$', undefined, '{pi} \\times {r}^2'],
        ['m', 'Find the ratio of the curved surface area to the total surface area of a closed {N} of {D}, in its simplest form.', 'Cari nisbah luas permukaan melengkung kepada jumlah luas permukaan sebuah {N} tertutup {D}, dalam bentuk termudah.', null]] },
    cone: { N: ['cone', 'kon'], gen: (r, k) => Object.assign(conePick(r, k), { dia: r.chance(0.3), nn: r.pick([['cone', 'kon'], ['cone', 'kon'], ['party hat', 'topi parti'], ['funnel', 'corong']]) }), D: (p) => [`${R(p)[0]} and slant height ${p.l} cm`, `${R(p)[1]} dan tinggi condong ${p.l} cm`], DH: (p) => [`${R(p)[0]} and perpendicular height ${p.h} cm`, `${R(p)[1]} dan tinggi tegak ${p.h} cm`],
      asks: [['e', 'Find the curved surface area of a {N} of {D}.', 'Cari luas permukaan melengkung sebuah {N} {D}.', (p) => [0, p.r * p.l], '$\\pi r l$', undefined, '{pi} \\times {r} \\times {l}'],
        ['e', 'Find the area of the circular base of a {N} of {D}.', 'Cari luas tapak bulat sebuah {N} {D}.', (p) => [0, p.r * p.r], '$\\pi r^2$', undefined, '{pi} \\times {r}^2'],
        ['e', 'Find the total surface area of a {N} of {D}.', 'Cari jumlah luas permukaan sebuah {N} {D}.', (p) => [0, p.r * p.l + p.r * p.r], '$\\pi r l + \\pi r^2$', undefined, '{pi} \\times {r} \\times {l} + {pi} \\times {r}^2'],
        ['m', 'Find the total surface area of a {N} of {D}.', 'Cari jumlah luas permukaan sebuah {N} {D}.', (p) => [0, p.r * p.l + p.r * p.r], '$\\pi r l + \\pi r^2$', true, '{pi} \\times {r} \\times {l} + {pi} \\times {r}^2'],
        ['m', 'Find the curved surface area of a {N} of {D}.', 'Cari luas permukaan melengkung sebuah {N} {D}.', (p) => [0, p.r * p.l], '$\\pi r l$', true, '{pi} \\times {r} \\times {l}']] },
    sph: { N: ['sphere', 'sfera'], gen: (r, k) => ({ r: rFor(k, r, 2, 10), dia: r.chance(0.5), nn: r.pick([['sphere', 'sfera'], ['ball', 'bola'], ['globe', 'glob'], ['balloon', 'belon']]) }), D: (p) => [R(p)[0], R(p)[1]],
      asks: [['e', 'Find the surface area of a {N} of {D}.', 'Cari luas permukaan sebuah {N} {D}.', (p) => [0, 4 * p.r * p.r], '$4\\pi r^2$', undefined, '4 \\times {pi} \\times {r}^2'],
        ['m', 'A {N} of {D} is cut into two equal halves. Find the total surface area of one half (a solid hemisphere).', 'Sebuah {N} {D} dipotong kepada dua bahagian yang sama. Cari jumlah luas permukaan satu bahagian (hemisfera pepejal).', (p) => [0, 3 * p.r * p.r], '$2\\pi r^2 + \\pi r^2$', undefined, '2 \\times {pi} \\times {r}^2 + {pi} \\times {r}^2'],
        ['m', 'A {N} of {D} is cut into two equal halves. By how much does the total surface area increase? Give the increase in the same form.', 'Sebuah {N} {D} dipotong kepada dua bahagian yang sama. Berapakah pertambahan jumlah luas permukaan? Berikan pertambahan dalam bentuk yang sama.', (p) => [0, 2 * p.r * p.r], T('Cutting makes two new flat circular faces, with total area $2\\pi r^2$.', 'Pemotongan menghasilkan dua permukaan rata bulat baharu, dengan jumlah luas $2\\pi r^2$.'), undefined, '2 \\times {pi} \\times {r}^2']] },
    hemi: { N: ['hemisphere', 'hemisfera'], gen: (r, k) => ({ r: rFor(k, r, 2, 10), dia: r.chance(0.5) }), D: (p) => [R(p)[0], R(p)[1]],
      asks: [['e', 'Find the curved surface area of a {N} of {D}.', 'Cari luas permukaan melengkung sebuah {N} {D}.', (p) => [0, 2 * p.r * p.r], '$2\\pi r^2$', undefined, '2 \\times {pi} \\times {r}^2'],
        ['e', 'Find the total surface area of a solid {N} of {D}.', 'Cari jumlah luas permukaan sebuah {N} pepejal {D}.', (p) => [0, 3 * p.r * p.r], '$2\\pi r^2 + \\pi r^2$', undefined, '2 \\times {pi} \\times {r}^2 + {pi} \\times {r}^2'],
        ['m', 'A thin hollow bowl in the shape of a {N} of {D} is open at the top. Find the total area of its outer and inner curved surfaces, ignoring the thickness of the rim.', 'Sebuah mangkuk nipis berongga berbentuk {N} {D} terbuka di bahagian atas. Cari jumlah luas permukaan melengkung luar dan dalam, abaikan ketebalan bibirnya.', (p) => [0, 4 * p.r * p.r], T('Inner and outer curved surfaces: $2 \\times 2\\pi r^2$.', 'Permukaan melengkung dalam dan luar: $2 \\times 2\\pi r^2$.'), undefined, '2 \\times 2 \\times {pi} \\times {r}^2']] },
  };
  const piT = (k) => (k === 'exact' ? '\\pi' : k === 'r22' ? '\\dfrac{22}{7}' : '3.142');
  const subIn = (t, p, k) => t.replace(/\{pi\}/g, piT(k)).replace(/\{r\}/g, n(p.r)).replace(/\{h\}/g, n(p.h)).replace(/\{l\}/g, n(p.l));
  const fwd = (key, lv) => (r) => {
    const s = SB[key], k = piK(r), p = s.gen(r, k), A = r.pick(s.asks.filter((x) => x[0] === lv));
    const useH = A[5] === true, DD = (useH ? s.DH : s.D)(p), N = p.nn || s.N;
    const fig = key === 'cone' && r.chance(0.5) ? (useH ? coneF(p.r, p.l, p.h) : coneF(p.r, p.l, Math.sqrt(p.l * p.l - p.r * p.r))) : key === 'cyl' && r.chance(0.4) ? cylF(p.r, p.h) : undefined;
    const sub = (t, i) => t.replace('{N}', N[i]).replace('{D}', DD[i]);
    if (!A[3]) {
      const x = 2 * p.h, y = 2 * p.h + 2 * p.r, g = SPM.gcd(x, y);
      return { q: T(sub(A[1], 0), sub(A[2], 1)), a: T(`$${x / g} : ${y / g}$`), w: W(T('Curved surface area $= 2\\pi r h$; total surface area $= 2\\pi r h + 2\\pi r^2$.', 'Luas permukaan melengkung $= 2\\pi r h$; jumlah luas permukaan $= 2\\pi r h + 2\\pi r^2$.'), T('Divide both by $2\\pi r$, so the ratio is $h : (h + r)$.', 'Bahagi kedua-duanya dengan $2\\pi r$, jadi nisbahnya ialah $h : (h + r)$.'), `$${n(p.h)} : ${n(p.h + p.r)} = ${x} : ${y} = ${x / g} : ${y / g}$`), sp: 'm' };
    }
    const [a0, c0] = A[3](p);
    const ansT = pa(k, c0, 1, U2);
    const steps = [];
    if (p.dia) steps.push(T(`The diameter is $${n(2 * p.r)}$ cm, so the radius is $r = ${n(p.r)}$ cm.`, `Diameternya ialah $${n(2 * p.r)}$ cm, jadi jejarinya ialah $r = ${n(p.r)}$ cm.`));
    if (useH) steps.push(T(`Slant height: $l^2 = r^2 + h^2 = ${n(p.r)}^2 + ${n(p.h)}^2 = ${p.r * p.r + p.h * p.h}$, so $l = ${n(p.l)}$ cm.`, `Tinggi condong: $l^2 = r^2 + h^2 = ${n(p.r)}^2 + ${n(p.h)}^2 = ${p.r * p.r + p.h * p.h}$, jadi $l = ${n(p.l)}$ cm.`));
    steps.push(A[4]);
    if (A[6]) steps.push(`$= ${subIn(A[6], p, k)}$`);
    steps.push(`$= ${pv(k, c0, 1)}${U2}$`);
    return { q: T(`${sub(A[1], 0)} ${PI[k].en}`, `${sub(A[2], 1)} ${PI[k].ms}`), fig, a: ansT, w: W(...steps), sp: 's' };
  };

  /* cuboids, prisms, pyramids */
  const g63e = [fwd('cyl', 'e'), fwd('cone', 'e'), fwd('sph', 'e'), fwd('hemi', 'e'),
    /* cuboid / cube */
    (r) => {
      const l = r.int(3, 12), w = r.int(2, 9), h = r.int(2, 10), t = r.int(0, 5);
      need(new Set([l, w, h]).size === 3);
      const o = r.pick(BOXO);
      if (t === 0) return { q: T('The figure shows a cuboid. Find its total surface area.', 'Rajah menunjukkan sebuah kuboid. Cari jumlah luas permukaannya.'), fig: cuboidFig(l, w, h), a: T(`$${cuboidFace(l, w, h)}${U2}$`), w: W(T('A cuboid has three pairs of identical faces:', 'Kuboid mempunyai tiga pasang muka yang serupa:'), '$A = 2(lw + lh + wh)$', `$= 2(${l} \\times ${w} + ${l} \\times ${h} + ${w} \\times ${h}) = 2(${l * w} + ${l * h} + ${w * h})$`, `$= 2(${l * w + l * h + w * h}) = ${cuboidFace(l, w, h)}$`), sp: 's' };
      if (t === 1) return { q: T(`Find the total surface area of a cube of edge ${l} cm.`, `Cari jumlah luas permukaan sebuah kubus bersisi ${l} cm.`), a: T(`$${6 * l * l}${U2}$`), w: W(T('A cube has $6$ identical square faces:', 'Kubus mempunyai $6$ muka segi empat sama yang serupa:'), `$A = 6a^2 = 6 \\times ${l}^2 = 6 \\times ${l * l}$`, `$= ${6 * l * l}$`), sp: 's' };
      if (t === 2) return { q: T(`A ${o[0]} is a closed cuboid ${l} cm long, ${w} cm wide and ${h} cm high. Find the area of wrapping paper needed to cover it exactly, with no overlap.`, `${SPM.cap(o[1])} ialah kuboid tertutup dengan panjang ${l} cm, lebar ${w} cm dan tinggi ${h} cm. Cari luas kertas pembungkus yang diperlukan untuk menutupinya dengan tepat tanpa bertindih.`), a: T(`$${cuboidFace(l, w, h)}${U2}$`), w: W(T('A cuboid has three pairs of identical faces:', 'Kuboid mempunyai tiga pasang muka yang serupa:'), '$A = 2(lw + lh + wh)$', `$= 2(${l} \\times ${w} + ${l} \\times ${h} + ${w} \\times ${h}) = 2(${l * w} + ${l * h} + ${w * h})$`, `$= 2(${l * w + l * h + w * h}) = ${cuboidFace(l, w, h)}$`), sp: 's' };
      if (t === 3) return { q: T(`Find the sum of the areas of the top face and the bottom face of a cuboid ${l} cm long, ${w} cm wide and ${h} cm high.`, `Cari jumlah luas permukaan atas dan permukaan bawah sebuah kuboid yang panjangnya ${l} cm, lebarnya ${w} cm dan tingginya ${h} cm.`), a: T(`${2 * l * w} cm²`), w: W(T('The top and the bottom are both length $\\times$ width:', 'Permukaan atas dan bawah kedua-duanya panjang $\\times$ lebar:'), `$2 \\times ${l} \\times ${w} = ${2 * l * w}$`), sp: 's' };
      if (t === 4) return { q: T(`A fish tank with no top is ${l * 5} cm long, ${w * 5} cm wide and ${h * 5} cm high. Find the area of glass needed to make it.`, `Sebuah akuarium tanpa penutup panjangnya ${l * 5} cm, lebarnya ${w * 5} cm dan tingginya ${h * 5} cm. Cari luas kaca yang diperlukan untuk membuatnya.`), a: T(`${25 * (l * w + 2 * l * h + 2 * w * h)} cm²`), w: W(T('With no top there are one base and four sides:', 'Tanpa penutup terdapat satu tapak dan empat sisi:'), '$A = lw + 2lh + 2wh$', `$= ${5 * l} \\times ${5 * w} + 2 \\times ${5 * l} \\times ${5 * h} + 2 \\times ${5 * w} \\times ${5 * h}$`, `$= ${25 * l * w} + ${50 * l * h} + ${50 * w * h} = ${25 * (l * w + 2 * l * h + 2 * w * h)}$`), sp: 's' };
      return { q: T(`Find the area of the largest face of a cuboid ${l} cm long, ${w} cm wide and ${h} cm high, and the total surface area of the cuboid.`, `Cari luas permukaan terbesar sebuah kuboid yang panjangnya ${l} cm, lebarnya ${w} cm dan tingginya ${h} cm, dan jumlah luas permukaan kuboid itu.`), a: T(`${[l * w, l * h, w * h].sort((x, y) => y - x)[0]} cm²; ${cuboidFace(l, w, h)} cm²`), w: W(T(`The three different faces are $${l} \\times ${w} = ${l * w}$, $${l} \\times ${h} = ${l * h}$ and $${w} \\times ${h} = ${w * h}$.`, `Tiga muka yang berlainan ialah $${l} \\times ${w} = ${l * w}$, $${l} \\times ${h} = ${l * h}$ dan $${w} \\times ${h} = ${w * h}$.`), T(`The largest is $${[l * w, l * h, w * h].sort((x, y) => y - x)[0]}\\ \\text{cm}^2$.`, `Yang terbesar ialah $${[l * w, l * h, w * h].sort((x, y) => y - x)[0]}\\ \\text{cm}^2$.`), `$A = 2(${l * w} + ${l * h} + ${w * h}) = ${cuboidFace(l, w, h)}$`), sp: 's' };
    },
    /* cube reverse */
    (r) => {
      const a = r.int(2, 12), t = r.int(0, 2);
      if (t === 0) return { q: T(`The total surface area of a cube is ${6 * a * a} cm². Find the length of one edge.`, `Jumlah luas permukaan sebuah kubus ialah ${6 * a * a} cm². Cari panjang satu tepi kubus itu.`), a: T(`${a} cm`), w: W(T('A cube has $6$ equal square faces:', 'Kubus mempunyai $6$ muka segi empat sama yang sama besar:'), `$6a^2 = ${6 * a * a}$`, `$a^2 = ${6 * a * a} \\div 6 = ${a * a}$`, `$a = \\sqrt{${a * a}} = ${a}$`, T(`The edge is ${a} cm.`, `Panjang tepinya ialah ${a} cm.`)), sp: 's' };
      if (t === 1) return { q: T(`Each face of a cube has an area of ${a * a} cm². Find the total surface area of the cube.`, `Setiap permukaan sebuah kubus mempunyai luas ${a * a} cm². Cari jumlah luas permukaan kubus itu.`), a: T(`${6 * a * a} cm²`), w: W(T('A cube has $6$ identical faces, so multiply the area of one face by $6$:', 'Kubus mempunyai $6$ muka yang serupa, jadi darabkan luas satu muka dengan $6$:'), `$6 \\times ${a * a} = ${6 * a * a}$`), sp: 's' };
      return { q: T(`The edge of a cube is ${a} cm. How many times as large as the area of one face is its total surface area?`, `Sisi sebuah kubus ialah ${a} cm. Berapa kalikah jumlah luas permukaannya berbanding luas satu permukaan?`), a: T('6 times', '6 kali'), w: W(T(`One face: $${a}^2 = ${a * a}\\ \\text{cm}^2$; total: $6 \\times ${a * a} = ${6 * a * a}\\ \\text{cm}^2$.`, `Satu muka: $${a}^2 = ${a * a}\\ \\text{cm}^2$; jumlah: $6 \\times ${a * a} = ${6 * a * a}\\ \\text{cm}^2$.`), T('A cube always has $6$ identical faces, so the answer is $6$ whatever the edge is.', 'Kubus sentiasa mempunyai $6$ muka yang serupa, jadi jawapannya ialah $6$ tidak kira panjang tepinya.')), sp: 'xs' };
    },
    /* formula recall */
    (r) => {
      const bank = [
        [T('the curved surface area of a cylinder', 'luas permukaan melengkung silinder'), '2\\pi r h', ['\\pi r^2 h', '\\pi r h', '2\\pi r^2']],
        [T('the surface area of a sphere', 'luas permukaan sfera'), '4\\pi r^2', ['\\frac43 \\pi r^3', '2\\pi r^2', '\\pi r^2']],
        [T('the curved surface area of a cone', 'luas permukaan melengkung kon'), '\\pi r l', ['\\pi r^2 h', '\\pi r h', '2\\pi r l']],
        [T('the total surface area of a closed cylinder', 'jumlah luas permukaan silinder tertutup'), '2\\pi r h + 2\\pi r^2', ['2\\pi r h + \\pi r^2', '\\pi r^2 h', '2\\pi r^2 h']],
        [T('the total surface area of a cone', 'jumlah luas permukaan kon'), '\\pi r l + \\pi r^2', ['\\pi r l', '\\pi r h + \\pi r^2', '\\frac13 \\pi r^2 h']],
        [T('the total surface area of a solid hemisphere', 'jumlah luas permukaan hemisfera pepejal'), '3\\pi r^2', ['2\\pi r^2', '4\\pi r^2', '\\pi r^2']],
      ];
      const b = r.pick(bank), ops = r.shuffle([b[1]].concat(b[2])), i = ops.indexOf(b[1]);
      const list = ops.map((o, j) => `(${'ABCD'[j]}) $${o}$`).join('&emsp;');
      return { q: T(`Which expression gives ${b[0].en}? ${list}`, `Ungkapan manakah yang memberi ${b[0].ms}? ${list}`), a: T(`(${'ABCD'[i]}) $${b[1]}$`), w: W(T(`The formula for ${b[0].en} is $${b[1]}$.`, `Rumus bagi ${b[0].ms} ialah $${b[1]}$.`), T(`That is option (${'ABCD'[i]}); the others are formulas for a different quantity.`, `Itu ialah pilihan (${'ABCD'[i]}); yang lain ialah rumus bagi kuantiti yang berlainan.`)), sp: 'xs' };
    },
  ];

  const g63m = [fwd('cyl', 'm'), fwd('cone', 'm'), fwd('sph', 'm'), fwd('hemi', 'm'),
    /* right triangular prism */
    (r) => {
      const [a, b, c] = r.pick(TRI), L = r.int(5, 15), t = r.int(0, 3);
      const fig = triPrismFig(a, b, L, [cm(a), cm(b), cm(L)]);
      const A = a * b + L * (a + b + c);
      if (t === 0) return { q: T(`The figure shows a right prism whose cross-section is a right-angled triangle with legs ${a} cm and ${b} cm. The prism is ${L} cm long. Find its total surface area.`, `Rajah menunjukkan sebuah prisma tegak yang keratan rentasnya segi tiga bersudut tegak dengan sisi tegak ${a} cm dan ${b} cm. Panjang prisma itu ${L} cm. Cari jumlah luas permukaannya.`), fig, a: T(`$${A}${U2}$`), w: T(`Hypotenuse $= ${c}$; $2 \\times \\frac12 ab + L(a + b + c)$`, `Hipotenus $= ${c}$; $2 \\times \\frac12 ab + L(a + b + c)$`), sp: 'm' };
      if (t === 1) return { q: T(`A right triangular prism of length ${L} cm has a base that is a right-angled triangle with sides ${a} cm, ${b} cm and ${c} cm. Find the area of (a) the two triangular ends, (b) the three rectangular faces.`, `Sebuah prisma tegak segi tiga dengan panjang ${L} cm mempunyai tapak segi tiga bersudut tegak dengan sisi ${a} cm, ${b} cm dan ${c} cm. Cari luas (a) dua hujung segi tiga, (b) tiga permukaan segi empat tepat.`), a: P([T(`${a * b} cm²`), T(`${L * (a + b + c)} cm²`)]), w: W(T(`(a) Two triangles: $2 \\times \\dfrac{1}{2} \\times ${a} \\times ${b} = ${a * b}$`, `(a) Dua segi tiga: $2 \\times \\dfrac{1}{2} \\times ${a} \\times ${b} = ${a * b}$`), T(`(b) Three rectangles, each ${L} cm long: $${L}(${a} + ${b} + ${c}) = ${L} \\times ${a + b + c} = ${L * (a + b + c)}$`, `(b) Tiga segi empat tepat, setiap satu sepanjang ${L} cm: $${L}(${a} + ${b} + ${c}) = ${L} \\times ${a + b + c} = ${L * (a + b + c)}$`)), sp: 'm' };
      if (t === 2) { const price = r.pick([2, 3, 4, 5]); return { q: T(`A wooden wedge is a right triangular prism with legs ${a} cm and ${b} cm and length ${L} cm. The whole surface is painted; paint costs RM${price} per 1 000 cm². Find the cost of painting 100 wedges.`, `Sebuah baji kayu ialah prisma tegak segi tiga dengan sisi tegak ${a} cm dan ${b} cm serta panjang ${L} cm. Seluruh permukaannya dicat; cat berharga RM${price} bagi setiap 1 000 cm². Cari kos mengecat 100 baji.`), a: T(rm((A * 100 * price) / 1000)), w: T(`Area of one wedge $= ${A}$ cm²`, `Luas satu baji $= ${A}$ cm²`), sp: 'l' }; }
      return { q: T(`The total surface area of a right triangular prism is ${A} cm². Its cross-section is a right-angled triangle with sides ${a} cm, ${b} cm and ${c} cm. Find the length of the prism.`, `Jumlah luas permukaan sebuah prisma tegak segi tiga ialah ${A} cm². Keratan rentasnya segi tiga bersudut tegak dengan sisi ${a} cm, ${b} cm dan ${c} cm. Cari panjang prisma itu.`), fig: triPrismFig(a, b, L, [cm(a), cm(b), '?']), a: T(`${L} cm`), w: T(`$${a * b} + L(${a + b + c}) = ${A}$`), sp: 'm' };
    },
    /* square pyramid */
    (r) => {
      const [hw, h, l] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [4, 3, 5], [8, 6, 10], [12, 5, 13]]);
      const a = 2 * hw, t = r.int(0, 3), A = a * a + 2 * a * l;
      const fig = upSvg(regPoly(4, 46, 0.32, 0), 80, 0, true, { h: t === 1 ? cm(h) : undefined, slant: t !== 1 ? { i: 3, t: cm(l) } : undefined, labs: [{ i: 0, t: cm(a) }] });
      if (t === 0) return { q: T(`The figure shows a right pyramid with a square base of side ${a} cm and slant height ${l} cm. Find its total surface area.`, `Rajah menunjukkan sebuah piramid tegak dengan tapak segi empat sama bersisi ${a} cm dan tinggi condong ${l} cm. Cari jumlah luas permukaannya.`), fig, a: T(`$${A}${U2}$`), w: T(`$${a}^2 + 4 \\times \\frac12 \\times ${a} \\times ${l}$`), sp: 'm' };
      if (t === 1) return { q: T(`A right pyramid has a square base of side ${a} cm and a perpendicular height of ${h} cm. Find the slant height of a triangular face and the total surface area of the pyramid.`, `Sebuah piramid tegak mempunyai tapak segi empat sama bersisi ${a} cm dan tinggi tegak ${h} cm. Cari tinggi condong satu permukaan segi tiga dan jumlah luas permukaan piramid itu.`), fig, a: T(`${l} cm; ${A} cm²`), w: T(`$l^2 = ${h}^2 + ${hw}^2$`), sp: 'm' };
      if (t === 2) return { q: T(`The roof of a pavilion is a right pyramid with a square base of side ${a} m and slant height ${l} m. Find the area of roofing needed to cover the four sloping faces.`, `Bumbung sebuah pondok ialah piramid tegak dengan tapak segi empat sama bersisi ${a} m dan tinggi condong ${l} m. Cari luas bahan bumbung yang diperlukan untuk menutupi empat permukaan condong.`), a: T(`${2 * a * l} m²`), w: T(`$4 \\times \\frac12 \\times ${a} \\times ${l}$`), sp: 'm' };
      return { q: T(`The total surface area of a right square-based pyramid with base side ${a} cm is ${A} cm². Find its slant height and its perpendicular height.`, `Jumlah luas permukaan sebuah piramid tegak tapak segi empat sama bersisi ${a} cm ialah ${A} cm². Cari tinggi condong dan tinggi tegaknya.`), a: T(`Slant height ${l} cm; height ${h} cm`, `Tinggi condong ${l} cm; tinggi tegak ${h} cm`), w: T(`$${a}^2 + 2(${a})l = ${A}$; then $h^2 = l^2 - ${hw}^2$`), sp: 'm' };
    },
    /* reverse: find a dimension from the area */
    (r) => {
      const k = piK(r), t = r.int(0, 4);
      if (t === 0) { const rr = rFor(k, r, 2, 8), h = r.int(4, 15); return { q: T(`The curved surface area of a cylinder of radius ${n(rr)} cm is $${pv(k, 2 * rr * h)}\\ \\text{cm}^2$. Find its height. ${PI[k].en}`, `Luas permukaan melengkung sebuah silinder berjejari ${n(rr)} cm ialah $${pv(k, 2 * rr * h)}\\ \\text{cm}^2$. Cari tingginya. ${PI[k].ms}`), a: T(`${h} cm`), w: T(`$2\\pi r h = ${pv(k, 2 * rr * h)}$`), sp: 's' }; }
      if (t === 1) { const rr = r.int(2, 10), kk = r.pick(['exact', 'p3142']); return { q: T(`The surface area of a sphere is $${pv(kk, 4 * rr * rr)}\\ \\text{cm}^2$. Find its radius. ${PI[kk].en}`, `Luas permukaan sebuah sfera ialah $${pv(kk, 4 * rr * rr)}\\ \\text{cm}^2$. Cari jejarinya. ${PI[kk].ms}`), a: T(`${rr} cm`), w: T(`$4\\pi r^2 = ${pv(kk, 4 * rr * rr)}$`), sp: 's' }; }
      if (t === 2) { const [rr, l] = r.pick([[3, 5], [4, 5], [5, 13], [6, 10], [7, 25], [9, 15]]); return { q: T(`The curved surface area of a cone of base radius ${rr} cm is $${pv(k, rr * l)}\\ \\text{cm}^2$. Find its slant height. ${PI[k].en}`, `Luas permukaan melengkung sebuah kon berjejari tapak ${rr} cm ialah $${pv(k, rr * l)}\\ \\text{cm}^2$. Cari tinggi condongnya. ${PI[k].ms}`), a: T(`${l} cm`), w: T(`$\\pi r l = ${pv(k, rr * l)}$`), sp: 's' }; }
      if (t === 3) { const rr = rFor(k, r, 2, 8), h = r.int(3, 14); return { q: T(`The curved surface area of a cylinder is $${pv(k, 2 * rr * h)}\\ \\text{cm}^2$ and its height is ${h} cm. Find its diameter. ${PI[k].en}`, `Luas permukaan melengkung sebuah silinder ialah $${pv(k, 2 * rr * h)}\\ \\text{cm}^2$ dan tingginya ${h} cm. Cari diameternya. ${PI[k].ms}`), a: T(`${n(2 * rr)} cm`), w: T(`$2\\pi r h = ${pv(k, 2 * rr * h)}$`), sp: 's' }; }
      const l = r.int(4, 12), w = r.int(3, 9), h = r.int(2, 10);
      need(new Set([l, w, h]).size === 3);
      return { q: T(`The total surface area of a cuboid is ${cuboidFace(l, w, h)} cm². Its length is ${l} cm and its width is ${w} cm. Find its height.`, `Jumlah luas permukaan sebuah kuboid ialah ${cuboidFace(l, w, h)} cm². Panjangnya ${l} cm dan lebarnya ${w} cm. Cari tingginya.`), a: T(`${h} cm`), w: T(`$2(${l * w} + ${l}h + ${w}h) = ${cuboidFace(l, w, h)}$`), sp: 'm' };
    },
    /* painting and cost */
    (r) => {
      const k = r.pick(['r22', 'p3142']), rr = k === 'r22' ? r.pick([7, 14, 3.5]) : r.pick([5, 10, 20]), h = r.int(1, 4) * 100, t = r.int(0, 2);
      const area = (2 * pnum(k, rr * h)) / 10000, price = r.pick([8, 12, 15, 20]);
      const obj = r.pick([[T('a cylindrical pillar (curved surface only)', 'sebuah tiang silinder (permukaan melengkung sahaja)')], [T('a cylindrical water pipe (outside only)', 'sebuah paip air silinder (bahagian luar sahaja)')], [T('the curved wall of a cylindrical oil drum', 'dinding melengkung sebuah dram minyak silinder')]])[0];
      if (t === 0) return { q: T(`${SPM.cap(obj.en)} has radius ${n(rr)} cm and height ${h / 100} m. Find the area to be painted, in m². ${PI[k].en}`, `${SPM.cap(obj.ms)} berjejari ${n(rr)} cm dan tinggi ${h / 100} m. Cari luas yang perlu dicat, dalam m². ${PI[k].ms}`), a: T(`${n(round(area, 4))} m²`), w: T(`$2\\pi r h = ${n(round(2 * pnum(k, rr * h), 2))}\\ \\text{cm}^2$`), sp: 'm' };
      if (t === 1) return { q: T(`Paint costs RM${price} per m². Find the cost of painting ${obj.en} of radius ${n(rr)} cm and height ${h / 100} m. ${PI[k].en}`, `Cat berharga RM${price} per m². Cari kos mengecat ${obj.ms} berjejari ${n(rr)} cm dan tinggi ${h / 100} m. ${PI[k].ms}`), a: T(`RM${n(round(area * price, 2))}`), w: T(`Area $= ${n(round(area, 4))}\\ \\text{m}^2$`), sp: 'm' };
      const l = r.int(8, 15) / 5, w = r.int(4, 10) / 5, hh = r.int(3, 8) / 5;
      need(new Set([l, w, hh]).size === 3);
      return { q: T(`A closed cuboid tank measures ${n(l)} m by ${n(w)} m by ${n(hh)} m. The outside is painted, and one litre of paint covers 5 m². How many litres are needed at least?`, `Sebuah tangki kuboid tertutup berukuran ${n(l)} m kali ${n(w)} m kali ${n(hh)} m. Bahagian luarnya dicat, dan satu liter cat menutupi 5 m². Berapakah bilangan liter cat yang paling kurang diperlukan?`), a: T(`${Math.ceil(round(cuboidFace(l, w, hh) / 5, 6))} litres (area ${n(round(cuboidFace(l, w, hh), 2))} m²)`, `${Math.ceil(round(cuboidFace(l, w, hh) / 5, 6))} liter (luas ${n(round(cuboidFace(l, w, hh), 2))} m²)`), w: W(T('Total surface area of a closed cuboid $= 2(lw + lh + wh)$:', 'Jumlah luas permukaan kuboid tertutup $= 2(lw + lh + wh)$:'), `$2(${n(l)} \\times ${n(w)} + ${n(l)} \\times ${n(hh)} + ${n(w)} \\times ${n(hh)}) = ${n(round(cuboidFace(l, w, hh), 2))}$`, `$${n(round(cuboidFace(l, w, hh), 2))} \\div 5 = ${n(round(cuboidFace(l, w, hh) / 5, 3))}$`, T(`Paint is bought in whole litres, so ${Math.ceil(round(cuboidFace(l, w, hh) / 5, 6))} litres are needed.`, `Cat dibeli dalam liter penuh, jadi ${Math.ceil(round(cuboidFace(l, w, hh) / 5, 6))} liter diperlukan.`)), sp: 'm' };
    },
    /* spot the error */
    (r) => {
      const rr = r.int(3, 9), h = r.int(4, 12), [tr, tl, tt] = r.pick(TRI);
      const bank = [
        [T(`A student finds the total surface area of a closed cylinder (radius ${rr} cm, height ${h} cm) as $2\\pi(${rr})(${h})$. What has been forgotten? Find the correct answer.`, `Seorang murid mencari jumlah luas permukaan silinder tertutup (jejari ${rr} cm, tinggi ${h} cm) sebagai $2\\pi(${rr})(${h})$. Apakah yang tertinggal? Cari jawapan yang betul.`), T(`The two circular ends. Correct: $${pv('exact', 2 * rr * h + 2 * rr * rr)}\\ \\text{cm}^2$.`, `Dua hujung bulat. Betul: $${pv('exact', 2 * rr * h + 2 * rr * rr)}\\ \\text{cm}^2$.`), W(T('A closed cylinder also has two circular ends, each of area $\\pi r^2$.', 'Silinder tertutup juga mempunyai dua hujung bulat, setiap satu berluas $\\pi r^2$.'), `$2\\pi r h + 2\\pi r^2 = 2\\pi(${rr})(${h}) + 2\\pi(${rr})^2$`, `$= ${pv('exact', 2 * rr * h)} + ${pv('exact', 2 * rr * rr)} = ${pv('exact', 2 * rr * h + 2 * rr * rr)}$`)],
        [T(`For a cone with radius ${tr} cm, height ${tl} cm and slant height ${tt} cm, a student writes the curved surface area as $\\pi(${tr})(${tl})$. What mistake was made? Find the correct answer.`, `Bagi sebuah kon berjejari ${tr} cm, tinggi ${tl} cm dan tinggi condong ${tt} cm, seorang murid menulis luas permukaan melengkung sebagai $\\pi(${tr})(${tl})$. Apakah kesilapannya? Cari jawapan yang betul.`), T(`The perpendicular height was used instead of the slant height. Correct: $${pv('exact', tr * tt)}\\ \\text{cm}^2$.`, `Tinggi tegak digunakan dan bukan tinggi condong. Betul: $${pv('exact', tr * tt)}\\ \\text{cm}^2$.`), W(T('The curved surface area of a cone uses the slant height $l$, not the perpendicular height $h$.', 'Luas permukaan melengkung kon menggunakan tinggi condong $l$, bukan tinggi tegak $h$.'), `$\\pi r l = \\pi(${tr})(${tt}) = ${pv('exact', tr * tt)}$`)],
        [T(`A student finds the surface area of a sphere of diameter ${2 * rr} cm as $4\\pi(${2 * rr})^2$. What is wrong? Find the correct answer.`, `Seorang murid mencari luas permukaan sfera berdiameter ${2 * rr} cm sebagai $4\\pi(${2 * rr})^2$. Apakah yang salah? Cari jawapan yang betul.`), T(`The diameter was used instead of the radius. Correct: $${pv('exact', 4 * rr * rr)}\\ \\text{cm}^2$.`, `Diameter digunakan dan bukan jejari. Betul: $${pv('exact', 4 * rr * rr)}\\ \\text{cm}^2$.`), W(T(`The radius is half the diameter: $r = ${2 * rr} \\div 2 = ${rr}$.`, `Jejari ialah separuh diameter: $r = ${2 * rr} \\div 2 = ${rr}$.`), `$4\\pi r^2 = 4\\pi(${rr})^2 = ${pv('exact', 4 * rr * rr)}$`)],
        [T(`A student says the total surface area of a solid hemisphere of radius ${rr} cm is $2\\pi(${rr})^2$. What has been left out? Find the correct answer.`, `Seorang murid berkata jumlah luas permukaan sebuah hemisfera pepejal berjejari ${rr} cm ialah $2\\pi(${rr})^2$. Apakah yang tertinggal? Cari jawapan yang betul.`), T(`The flat circular face. Correct: $${pv('exact', 3 * rr * rr)}\\ \\text{cm}^2$.`, `Permukaan rata yang bulat. Betul: $${pv('exact', 3 * rr * rr)}\\ \\text{cm}^2$.`), W(T('A solid hemisphere has the curved surface $2\\pi r^2$ and the flat circle $\\pi r^2$.', 'Hemisfera pepejal mempunyai permukaan melengkung $2\\pi r^2$ dan bulatan rata $\\pi r^2$.'), `$2\\pi(${rr})^2 + \\pi(${rr})^2 = 3\\pi(${rr})^2 = ${pv('exact', 3 * rr * rr)}$`)],
        [T(`A student finds the total surface area of a cuboid ${tr} cm by ${tl} cm by ${tt} cm as $${tr} \\times ${tl} \\times ${tt}$. What is wrong? Find the correct answer.`, `Seorang murid mencari jumlah luas permukaan sebuah kuboid ${tr} cm kali ${tl} cm kali ${tt} cm sebagai $${tr} \\times ${tl} \\times ${tt}$. Apakah yang salah? Cari jawapan yang betul.`), T(`That is the volume. Correct: $${cuboidFace(tr, tl, tt)}\\ \\text{cm}^2$.`, `Itu ialah isi padu. Betul: $${cuboidFace(tr, tl, tt)}\\ \\text{cm}^2$.`), W(T('Multiplying the three edges gives the volume; the surface area is $2(lw + lh + wh)$.', 'Mendarab ketiga-tiga tepi memberi isi padu; luas permukaan ialah $2(lw + lh + wh)$.'), `$2(${tr} \\times ${tl} + ${tr} \\times ${tt} + ${tl} \\times ${tt}) = 2(${tr * tl} + ${tr * tt} + ${tl * tt}) = ${cuboidFace(tr, tl, tt)}$`)],
        [T(`A student uses $\\pi r^2 h$ to find the curved surface area of a cylinder with radius ${rr} cm and height ${h} cm. What is wrong? Find the correct answer.`, `Seorang murid menggunakan $\\pi r^2 h$ untuk mencari luas permukaan melengkung sebuah silinder berjejari ${rr} cm dan tinggi ${h} cm. Apakah yang salah? Cari jawapan yang betul.`), T(`That is the formula for volume. Correct: $${pv('exact', 2 * rr * h)}\\ \\text{cm}^2$.`, `Itu ialah formula isi padu. Betul: $${pv('exact', 2 * rr * h)}\\ \\text{cm}^2$.`), W(T('$\\pi r^2 h$ is the volume of a cylinder; the curved surface area is $2\\pi r h$.', '$\\pi r^2 h$ ialah isi padu silinder; luas permukaan melengkung ialah $2\\pi r h$.'), `$2\\pi(${rr})(${h}) = ${pv('exact', 2 * rr * h)}$`)],
        [T(`A student adds the area of the base to the curved surface area of an open-topped cylinder (radius ${rr} cm, height ${h} cm) and the area of a top circle as well. What is wrong? Find the correct area of the open cylinder.`, `Seorang murid menambah luas tapak dan luas satu bulatan atas kepada luas permukaan melengkung sebuah silinder terbuka di atas (jejari ${rr} cm, tinggi ${h} cm). Apakah yang salah? Cari luas silinder terbuka yang betul.`), T(`There is no top, so only one circle is added. Correct: $${pv('exact', 2 * rr * h + rr * rr)}\\ \\text{cm}^2$.`, `Tiada bahagian atas, maka hanya satu bulatan ditambah. Betul: $${pv('exact', 2 * rr * h + rr * rr)}\\ \\text{cm}^2$.`), W(T('An open-topped cylinder has only one circle: the base.', 'Silinder terbuka di atas mempunyai satu bulatan sahaja: tapaknya.'), `$2\\pi r h + \\pi r^2 = 2\\pi(${rr})(${h}) + \\pi(${rr})^2 = ${pv('exact', 2 * rr * h + rr * rr)}$`)],
      ];
      const b = r.pick(bank);
      return { q: b[0], a: b[1], w: b[2], sp: 'm' };
    },
    /* stacked cubes and exposed faces; unit conversion */
    (r) => {
      const a = r.int(2, 8), t = r.int(0, 4), m = r.int(3, 6);
      if (t === 0) return { q: T(`Two identical cubes of edge ${a} cm are joined face to face to form a cuboid. Find the total surface area of the cuboid.`, `Dua kubus yang sama, bersisi ${a} cm, dicantumkan permukaan ke permukaan untuk membentuk sebuah kuboid. Cari jumlah luas permukaan kuboid itu.`), a: T(`${10 * a * a} cm²`), w: T(`$12a^2 - 2a^2$`), sp: 's' };
      if (t === 1) return { q: T(`A cube of edge ${a} cm rests on the floor. The bottom is not painted. Find the area painted.`, `Sebuah kubus bersisi ${a} cm terletak di atas lantai. Bahagian bawahnya tidak dicat. Cari luas yang dicat.`), a: T(`${5 * a * a} cm²`), w: W(T('Only 5 of the 6 faces are painted, because the bottom rests on the floor:', 'Hanya 5 daripada 6 muka dicat, kerana bahagian bawah terletak di atas lantai:'), `$5 \\times ${a}^2 = 5 \\times ${a * a} = ${5 * a * a}$`), sp: 's' };
      if (t === 2) return { q: T(`${m} identical cubes of edge ${a} cm are placed in a row, face to face, to make a long cuboid. Find its total surface area.`, `${m} kubus yang sama, bersisi ${a} cm, disusun sebaris, permukaan ke permukaan, untuk membentuk sebuah kuboid panjang. Cari jumlah luas permukaannya.`), a: T(`${(4 * m + 2) * a * a} cm²`), w: T(`$2(${m}a^2 + ${m}a^2 + a^2)$`), sp: 's' };
      if (t === 3) { const l = r.pick([1.2, 1.5, 2, 2.5]), w = r.pick([40, 50, 60, 80]), h = r.pick([30, 35, 45]); return { q: T(`A closed box measures ${n(l)} m by ${w} cm by ${h} cm. Find its total surface area in m².`, `Sebuah kotak tertutup berukuran ${n(l)} m kali ${w} cm kali ${h} cm. Cari jumlah luas permukaannya dalam m².`), a: T(`${n(round(cuboidFace(l, w / 100, h / 100), 4))} m²`), w: T(`Change all lengths to metres: ${n(l)} m, ${n(w / 100)} m, ${n(h / 100)} m`, `Tukarkan semua panjang kepada meter: ${n(l)} m, ${n(w / 100)} m, ${n(h / 100)} m`), sp: 'm' }; }
      return { q: T(`A cube of edge ${2 * a} cm is cut into 8 identical small cubes. Find the total surface area of all the small cubes together and compare it with the surface area of the original cube.`, `Sebuah kubus bersisi ${2 * a} cm dipotong menjadi 8 kubus kecil yang sama. Cari jumlah luas permukaan semua kubus kecil itu dan bandingkan dengan luas permukaan kubus asal.`), a: T(`${48 * a * a} cm² compared with ${24 * a * a} cm²; it doubles`, `${48 * a * a} cm² berbanding ${24 * a * a} cm²; ia menjadi dua kali ganda`), w: W(T(`Each small cube has edge $${a}$ cm, so its surface area is $6 \\times ${a}^2 = ${6 * a * a}$.`, `Setiap kubus kecil bersisi $${a}$ cm, jadi luas permukaannya ialah $6 \\times ${a}^2 = ${6 * a * a}$.`), `$8 \\times ${6 * a * a} = ${48 * a * a}$`, T(`The original cube has surface area $6 \\times ${2 * a}^2 = ${24 * a * a}$.`, `Kubus asal mempunyai luas permukaan $6 \\times ${2 * a}^2 = ${24 * a * a}$.`), `$${48 * a * a} \\div ${24 * a * a} = 2$`), sp: 'm' };
    },
  ];

  /* composite solids: each has parts described in words, an exposed area [A, c] (A + c pi), and a figure */
  const CO = [
    { id: 'cylcone', par: (r, k) => { const c = conePick(r, k); return { r: c.r, l: c.l, h: c.h, H: r.int(4, 12) }; },
      en: (p) => `a cone of radius ${p.r} cm and slant height ${p.l} cm placed on top of a cylinder of the same radius and height ${p.H} cm`, ms: (p) => `sebuah kon berjejari ${p.r} cm dan tinggi condong ${p.l} cm diletakkan di atas sebuah silinder yang sama jejarinya dan tinggi ${p.H} cm`,
      ex: (p) => [0, p.r * p.l + 2 * p.r * p.H + p.r * p.r], fig: (p) => stackSvg([{ t: 'cyl', h: 48 }, { t: 'cone', h: 44 }], 30, { rad: { t: cm(p.r), y: 0 }, dims: [{ a: 0, t: cm(p.H) }], slant: { t: cm(p.l), i: 1 } }), free: 'H', ok: 'curved surface of the cone, curved surface of the cylinder and the base of the cylinder', okM: 'permukaan melengkung kon, permukaan melengkung silinder dan tapak silinder' },
    { id: 'cylhemi', par: (r, k) => ({ r: rFor(k, r, 2, 8), H: r.int(4, 12) }),
      en: (p) => `a hemisphere of radius ${n(p.r)} cm joined to the top of a cylinder of the same radius and height ${p.H} cm`, ms: (p) => `sebuah hemisfera berjejari ${n(p.r)} cm disambung pada bahagian atas sebuah silinder yang sama jejarinya dan tinggi ${p.H} cm`,
      ex: (p) => [0, 2 * p.r * p.r + 2 * p.r * p.H + p.r * p.r], fig: (p) => stackSvg([{ t: 'cyl', h: 48 }, { t: 'hemi' }], 30, { rad: { t: cm(p.r), y: 0 }, dims: [{ a: 0, t: cm(p.H) }] }), free: 'H', ok: 'the curved surface of the hemisphere, the curved surface of the cylinder and the base of the cylinder', okM: 'permukaan melengkung hemisfera, permukaan melengkung silinder dan tapak silinder' },
    { id: 'conehemi', par: (r, k) => { const c = k === 'r22' ? { r: 7, l: 25 } : r.pick([{ r: 3, l: 5 }, { r: 4, l: 5 }, { r: 6, l: 10 }, { r: 5, l: 13 }, { r: 9, l: 15 }]); return c; },
      en: (p) => `a hemisphere of radius ${p.r} cm joined to the base of a cone of slant height ${p.l} cm and the same radius`, ms: (p) => `sebuah hemisfera berjejari ${p.r} cm disambung pada tapak sebuah kon yang bertinggi condong ${p.l} cm dan sama jejarinya`,
      ex: (p) => [0, 2 * p.r * p.r + p.r * p.l], fig: (p) => stackSvg([{ t: 'hemiB' }, { t: 'cone', h: px(Math.sqrt(p.l * p.l - p.r * p.r), p.r) * 0.9 }], 34, { rad: { t: cm(p.r), y: 0 }, slant: { t: cm(p.l), i: 1 } }), ok: 'the curved surface of the hemisphere and the curved surface of the cone', okM: 'permukaan melengkung hemisfera dan permukaan melengkung kon' },
    { id: 'rocket', par: (r, k) => { const c = k === 'r22' ? { r: 7, l: 25 } : r.pick([{ r: 3, l: 5 }, { r: 6, l: 10 }, { r: 4, l: 5 }, { r: 5, l: 13 }]); return Object.assign(c, { H: r.int(3, 10) }); },
      en: (p) => `a cylinder of radius ${p.r} cm and height ${p.H} cm with a hemisphere of the same radius joined to the bottom and a cone of slant height ${p.l} cm joined to the top`, ms: (p) => `sebuah silinder berjejari ${p.r} cm dan tinggi ${p.H} cm dengan hemisfera yang sama jejarinya bersambung pada bahagian bawah dan sebuah kon bertinggi condong ${p.l} cm bersambung pada bahagian atas`,
      ex: (p) => [0, 2 * p.r * p.r + 2 * p.r * p.H + p.r * p.l], fig: (p) => stackSvg([{ t: 'hemiB' }, { t: 'cyl', h: 50 }, { t: 'cone', h: 44 }], 30, { rad: { t: cm(p.r), y: 1 }, dims: [{ a: 1, t: cm(p.H) }], slant: { t: cm(p.l), i: 2 } }), free: 'H', ok: 'the hemisphere, the curved surface of the cylinder and the cone', okM: 'hemisfera, permukaan melengkung silinder dan kon' },
    { id: 'cubedent', par: (r, k) => { const rr = rFor(k, r, 2, 5); return { r: rr, a: r.int(2 * Math.ceil(rr) + 1, 2 * Math.ceil(rr) + 6) }; },
      en: (p) => `a cube of edge ${p.a} cm with a hemispherical hollow of radius ${n(p.r)} cm scooped out of the middle of its top face`, ms: (p) => `sebuah kubus bersisi ${p.a} cm dengan satu lekuk hemisfera berjejari ${n(p.r)} cm dikorek di tengah permukaan atasnya`,
      ex: (p) => [6 * p.a * p.a, p.r * p.r], ok: 'the six faces of the cube, with a circle removed, plus the inside of the hollow', okM: 'enam permukaan kubus, dengan satu bulatan dibuang, ditambah bahagian dalam lekuk' },
    { id: 'cuboidhole', par: (r, k) => { const rr = rFor(k, r, 1, 3); const h = r.int(Math.floor(rr) + 3, Math.floor(rr) + 10); return { r: rr, l: r.int(2 * Math.ceil(rr) + 2, 2 * Math.ceil(rr) + 8), w: r.int(2 * Math.ceil(rr) + 2, 2 * Math.ceil(rr) + 8), h }; },
      en: (p) => `a cuboid ${p.l} cm by ${p.w} cm by ${p.h} cm with a cylindrical hole of radius ${n(p.r)} cm drilled right through it from the top face to the bottom face`, ms: (p) => `sebuah kuboid ${p.l} cm kali ${p.w} cm kali ${p.h} cm dengan satu lubang silinder berjejari ${n(p.r)} cm digerudi menembusinya dari permukaan atas ke permukaan bawah`,
      ex: (p) => [cuboidFace(p.l, p.w, p.h), 2 * p.r * p.h - 2 * p.r * p.r], free: 'h', ok: 'the six faces of the cuboid, with two circles removed, plus the inside of the hole', okM: 'enam permukaan kuboid, dengan dua bulatan dibuang, ditambah bahagian dalam lubang' },
    { id: 'cylconehole', par: (r, k) => { const t = k === 'r22' ? [7, 24, 25] : r.pick([[3, 4, 5], [6, 8, 10], [4, 3, 5], [5, 12, 13]]); return { r: t[0], l: t[2], H: r.int(t[1] + 2, t[1] + 8) }; },
      en: (p) => `a cylinder of radius ${p.r} cm and height ${p.H} cm with a conical hollow of the same radius and slant height ${p.l} cm cut into its top`, ms: (p) => `sebuah silinder berjejari ${p.r} cm dan tinggi ${p.H} cm dengan satu lekuk kon yang sama jejarinya dan tinggi condong ${p.l} cm dipotong pada bahagian atasnya`,
      ex: (p) => [0, p.r * p.r + 2 * p.r * p.H + p.r * p.l], free: 'H', ok: 'the base, the curved surface of the cylinder and the inside of the conical hollow', okM: 'tapak, permukaan melengkung silinder dan bahagian dalam lekuk kon' },
    { id: 'house', par: (r) => { const t = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]); return { hw: t[0], ht: t[1], sl: t[2], L: r.int(t[0] * 2 + 2, t[0] * 2 + 10), W: r.int(3, 7) }; },
      en: (p) => `a house model: a cuboid ${2 * p.hw} cm wide, ${p.L} cm long and ${p.W} cm high with a triangular prism roof on top (the roof has ends that are isosceles triangles of base ${2 * p.hw} cm and height ${p.ht} cm and is ${p.L} cm long)`, ms: (p) => `model rumah: sebuah kuboid selebar ${2 * p.hw} cm, sepanjang ${p.L} cm dan setinggi ${p.W} cm dengan bumbung prisma segi tiga di atasnya (hujung bumbung ialah segi tiga sama kaki dengan tapak ${2 * p.hw} cm dan tinggi ${p.ht} cm dan bumbung itu sepanjang ${p.L} cm)`,
      ex: (p) => [2 * p.hw * p.L + 2 * (2 * p.hw + p.L) * p.W + 2 * (0.5 * 2 * p.hw * p.ht) + 2 * p.sl * p.L, 0], ok: 'the base, four walls, two triangular gable ends and two sloping roof faces', okM: 'tapak, empat dinding, dua hujung segi tiga dan dua permukaan condong bumbung' },
    { id: 'stepped', par: (r, k) => { const rr = rFor(k, r, 3, 8); return { R: rr, r: rr / 2, h1: r.int(3, 8), h2: r.int(3, 8) }; },
      en: (p) => `two solid cylinders joined end to end on the same axis: the lower one has radius ${n(p.R)} cm and height ${p.h1} cm and the upper one has radius ${n(p.r)} cm and height ${p.h2} cm`, ms: (p) => `dua silinder pepejal disambung hujung ke hujung pada paksi yang sama: yang bawah berjejari ${n(p.R)} cm dan tinggi ${p.h1} cm manakala yang atas berjejari ${n(p.r)} cm dan tinggi ${p.h2} cm`,
      ex: (p) => [0, 2 * p.R * p.h1 + 2 * p.R * p.R + 2 * p.r * p.h2], ok: 'the lower cylinder closed at both ends (its top is a ring plus the covered circle) and the curved surface of the upper cylinder', okM: 'silinder bawah tertutup pada kedua-dua hujung dan permukaan melengkung silinder atas', note: 'upper end circle equals exposed area' },
  ];
  const eq2 = (k, A, c) => (k === 'exact' ? `${A ? n(A) + ' + ' : ''}${pv('exact', c)}` : n(round(A + pnum(k, c), 2)));
  const coFig = (c, p) => (c.fig ? c.fig(p) : undefined);
  const g63a = [
    /* composite: total exposed surface area */
    (r) => {
      const c = r.pick(CO.filter((x) => x.id !== 'stepped' && x.id !== 'house')), k = piK(r), p = c.par(r, k);
      const [A, cc] = c.ex(p);
      return { q: T(`A solid is made of ${c.en(p)}. Find the total surface area of the solid. ${PI[k].en}`, `Sebuah pepejal dibuat daripada ${c.ms(p)}. Cari jumlah luas permukaan pepejal itu. ${PI[k].ms}`), fig: coFig(c, p), a: pm(k, A, cc, U2), w: T(`The exposed surfaces are ${c.ok}.`, `Permukaan yang terdedah ialah ${c.okM}.`), sp: 'l' };
    },
    /* composite: how much paint / which surfaces */
    (r) => {
      const c = r.pick(CO.filter((x) => ['cylcone', 'cylhemi', 'rocket', 'conehemi'].includes(x.id))), k = r.pick(['r22', 'p3142']), p = c.par(r, k);
      const [A, cc] = c.ex(p);
      const price = r.pick([0.4, 0.5, 0.8, 1.2]);
      const area = A + pnum(k, cc), cost = (area * price) / 100;
      return { q: T(`A solid is made of ${c.en(p)}. Its whole outer surface is painted, and paint costs ${rm(price)} per 100 cm². Find the cost of painting the solid. ${PI[k].en}`, `Sebuah pepejal dibuat daripada ${c.ms(p)}. Seluruh permukaan luarnya dicat, dan cat berharga ${rm(price)} per 100 cm². Cari kos mengecat pepejal itu. ${PI[k].ms}`), fig: coFig(c, p), a: T(rm(round(cost, 2), 2)), w: T(`Area $= ${n(round(area, 2))}\\ \\text{cm}^2$`), sp: 'l' };
    },
    /* composite: find the free dimension from the total surface area */
    (r) => {
      const c = r.pick(CO.filter((x) => x.free)), k = piK(r), p = c.par(r, k), f = c.free;
      const [A, cc] = c.ex(p);
      const ph = Object.assign({}, p, { [f]: 'h' });
      return { q: T(`A solid is made of ${c.en(ph)}. Its total surface area is $${eq2(k, A, cc)}\\ \\text{cm}^2$. Find the value of $h$. ${PI[k].en}`, `Sebuah pepejal dibuat daripada ${c.ms(ph)}. Jumlah luas permukaannya ialah $${eq2(k, A, cc)}\\ \\text{cm}^2$. Cari nilai $h$. ${PI[k].ms}`), fig: coFig(c, p), a: T(`$h = ${p[f]}$ cm`), w: T(`The exposed surfaces are ${c.ok}.`, `Permukaan yang terdedah ialah ${c.okM}.`), sp: 'l' };
    },
    /* the house model and stepped cylinders */
    (r) => {
      const c = r.pick(CO.filter((x) => x.id === 'house' || x.id === 'stepped')), k = c.id === 'house' ? 'exact' : piK(r), p = c.par(r, k);
      const [A, cc] = c.ex(p);
      return { q: T(`A solid is made of ${c.en(p)}. Find the total exposed surface area of the solid.${c.id === 'house' ? '' : ' ' + PI[k].en}`, `Sebuah pepejal dibuat daripada ${c.ms(p)}. Cari jumlah luas permukaan terdedah pepejal itu.${c.id === 'house' ? '' : ' ' + PI[k].ms}`), a: c.id === 'house' ? T(`${n(A)} cm²`) : pm(k, A, cc, U2), w: T(`The exposed surfaces are ${c.ok}.`, `Permukaan yang terdedah ialah ${c.okM}.`), sp: 'l' };
    },
    /* two-rate costing */
    (r) => {
      const k = r.pick(['r22', 'p3142']), rr = k === 'r22' ? r.pick([7, 3.5, 14]) : r.pick([5, 10]), h = r.int(2, 6) * 10, p1 = r.pick([0.4, 0.5, 0.8, 1]), p2 = r.pick([1, 1.5, 2, 3]);
      const curved = pnum(k, 2 * rr * h), ends = pnum(k, 2 * rr * rr), cost = (curved * p1 + ends * p2) / 100;
      return { q: T(`A closed cylindrical container has radius ${n(rr)} cm and height ${h} cm. The curved surface is covered with a label costing ${rm(p1)} per 100 cm² and the two circular ends are covered with foil costing ${rm(p2)} per 100 cm². Find the total cost. ${PI[k].en}`, `Sebuah bekas silinder tertutup berjejari ${n(rr)} cm dan tinggi ${h} cm. Permukaan melengkungnya ditutup dengan label berharga ${rm(p1)} per 100 cm² dan dua hujung bulatnya ditutup dengan kerajang berharga ${rm(p2)} per 100 cm². Cari jumlah kos. ${PI[k].ms}`), a: T(`RM${fx(cost, 2)}`), w: T(`Curved: $${n(round(curved, 2))}\\ \\text{cm}^2$; ends: $${n(round(ends, 2))}\\ \\text{cm}^2$`), sp: 'l' };
    },
    /* unknown dimension from a total surface area */
    (r) => {
      const k = piK(r), t = r.int(0, 2);
      if (t === 0) { const rr = rFor(k, r, 2, 8), h = r.int(3, 14); return { q: T(`The total surface area of a closed cylinder of radius ${n(rr)} cm is $${pv(k, 2 * rr * h + 2 * rr * rr)}\\ \\text{cm}^2$. Find its height. ${PI[k].en}`, `Jumlah luas permukaan sebuah silinder tertutup berjejari ${n(rr)} cm ialah $${pv(k, 2 * rr * h + 2 * rr * rr)}\\ \\text{cm}^2$. Cari tingginya. ${PI[k].ms}`), a: T(`${h} cm`), w: T(`$2\\pi r(r + h) = ${pv(k, 2 * rr * h + 2 * rr * rr)}$`), sp: 'm' }; }
      if (t === 1) { const [rr, l] = r.pick([[3, 5], [4, 5], [5, 13], [6, 10], [9, 15], [8, 17]]); return { q: T(`A cone has base radius ${rr} cm and total surface area $${pv(k, rr * l + rr * rr)}\\ \\text{cm}^2$. Find its slant height and its perpendicular height. ${PI[k].en}`, `Sebuah kon berjejari tapak ${rr} cm dan jumlah luas permukaan $${pv(k, rr * l + rr * rr)}\\ \\text{cm}^2$. Cari tinggi condong dan tinggi tegaknya. ${PI[k].ms}`), a: T(`Slant height ${l} cm; height ${n(round(Math.sqrt(l * l - rr * rr), 2))} cm`, `Tinggi condong ${l} cm; tinggi tegak ${n(round(Math.sqrt(l * l - rr * rr), 2))} cm`), w: T(`$\\pi r l + \\pi r^2$ gives $l$; then $h^2 = l^2 - r^2$`), sp: 'm' }; }
      const rr = r.int(2, 9), m = r.pick([2, 3, 4]), kk = r.pick(['exact', 'p3142']);
      return { q: T(`The height of a closed cylinder is ${m} times its radius. Its total surface area is $${pv(kk, 2 * rr * rr * (m + 1))}\\ \\text{cm}^2$. Find the radius and the height. ${PI[kk].en}`, `Tinggi sebuah silinder tertutup ialah ${m} kali jejarinya. Jumlah luas permukaannya ialah $${pv(kk, 2 * rr * rr * (m + 1))}\\ \\text{cm}^2$. Cari jejari dan tingginya. ${PI[kk].ms}`), a: T(`Radius ${rr} cm; height ${m * rr} cm`, `Jejari ${rr} cm; tinggi ${m * rr} cm`), w: T(`$2\\pi r(r + ${m}r) = ${2 * (m + 1)}\\pi r^2$`), sp: 'm' };
    },
    /* scaling */
    (r) => {
      const t = r.int(0, 3), m = r.pick([2, 3, 4]);
      if (t === 0) return { q: T(`The edge of a cube is multiplied by ${m}. By what factor does its total surface area change?`, `Sisi sebuah kubus didarabkan dengan ${m}. Berapakah faktor perubahan jumlah luas permukaannya?`), a: T(`It is multiplied by ${m * m}.`, `Ia didarabkan dengan ${m * m}.`), w: W(T(`The new edge is $${m}a$, so each face has area $(${m}a)^2 = ${m * m}a^2$.`, `Tepi baharu ialah $${m}a$, jadi setiap muka berluas $(${m}a)^2 = ${m * m}a^2$.`), `$6(${m}a)^2 = ${m * m} \\times 6a^2$`, T(`So the total surface area is multiplied by $${m * m}$.`, `Jadi jumlah luas permukaan didarabkan dengan $${m * m}$.`)), sp: 's' };
      if (t === 1) return { q: T(`The radius of a sphere is multiplied by ${m}. By what factor does its surface area change?`, `Jejari sebuah sfera didarabkan dengan ${m}. Berapakah faktor perubahan luas permukaannya?`), a: T(`It is multiplied by ${m * m}.`, `Ia didarabkan dengan ${m * m}.`), w: W(`$4\\pi(${m}r)^2 = 4\\pi \\times ${m * m}r^2 = ${m * m} \\times 4\\pi r^2$`, T(`So the surface area is multiplied by $${m * m}$.`, `Jadi luas permukaan didarabkan dengan $${m * m}$.`), T('Any area scales by the square of the length factor.', 'Sebarang luas berskala dengan kuasa dua faktor panjang.')), sp: 's' };
      if (t === 2) return { q: T(`The radius of a cylinder is multiplied by ${m} but its height stays the same. By what factor does the curved surface area change? Does the total surface area also change by this factor? Explain.`, `Jejari sebuah silinder didarabkan dengan ${m} tetapi tingginya kekal. Berapakah faktor perubahan luas permukaan melengkung? Adakah jumlah luas permukaan juga berubah dengan faktor ini? Jelaskan.`), a: T(`Curved surface area $\\times ${m}$. No: the circular ends change by a factor of ${m * m}, so the total does not change by exactly ${m}.`, `Luas permukaan melengkung $\\times ${m}$. Tidak: hujung bulat berubah dengan faktor ${m * m}, maka jumlahnya tidak berubah tepat ${m} kali.`), w: W(`$2\\pi(${m}r)h = ${m} \\times 2\\pi r h$`, T(`The curved surface area is multiplied by $${m}$, because only $r$ appears once in it.`, `Luas permukaan melengkung didarabkan dengan $${m}$, kerana $r$ muncul sekali sahaja di dalamnya.`), `$2\\pi(${m}r)^2 = ${m * m} \\times 2\\pi r^2$`, T(`The two ends are multiplied by $${m * m}$, so the total is not multiplied by exactly $${m}$.`, `Dua hujungnya didarabkan dengan $${m * m}$, jadi jumlahnya tidak didarabkan tepat dengan $${m}$.`)), sp: 'm' };
      const p = r.pick([10, 20, 50]);
      return { q: T(`The radius of a sphere is increased by ${p}%. Find the percentage increase in its surface area.`, `Jejari sebuah sfera ditambah ${p}%. Cari peratus pertambahan luas permukaannya.`), a: T(`${n(round(((1 + p / 100) ** 2 - 1) * 100, 2))}%`), w: W(T(`The new radius is $${n(1 + p / 100)}r$.`, `Jejari baharu ialah $${n(1 + p / 100)}r$.`), `$4\\pi(${n(1 + p / 100)}r)^2 = ${n(round((1 + p / 100) ** 2, 4))} \\times 4\\pi r^2$`, T(`Increase $= (${n(round((1 + p / 100) ** 2, 4))} - 1) \\times 100$% $= ${n(round(((1 + p / 100) ** 2 - 1) * 100, 2))}$%`, `Pertambahan $= (${n(round((1 + p / 100) ** 2, 4))} - 1) \\times 100$% $= ${n(round(((1 + p / 100) ** 2 - 1) * 100, 2))}$%`)), sp: 'm' };
    },
  ];

  /* compare two solids; quadratic for the radius */
  const CMP = [['cyl', 'the curved surface area of a cylinder of radius {r} cm and height {h} cm', 'luas permukaan melengkung sebuah silinder berjejari {r} cm dan tinggi {h} cm', (r, h) => 2 * r * h],
    ['sph', 'the surface area of a sphere of radius {r} cm', 'luas permukaan sebuah sfera berjejari {r} cm', (r) => 4 * r * r],
    ['cone', 'the curved surface area of a cone of radius {r} cm and slant height {h} cm', 'luas permukaan melengkung sebuah kon berjejari {r} cm dan tinggi condong {h} cm', (r, h) => r * h],
    ['hemi', 'the total surface area of a solid hemisphere of radius {r} cm', 'jumlah luas permukaan sebuah hemisfera pepejal berjejari {r} cm', (r) => 3 * r * r],
    ['cyl2', 'the total surface area of a closed cylinder of radius {r} cm and height {h} cm', 'jumlah luas permukaan sebuah silinder tertutup berjejari {r} cm dan tinggi {h} cm', (r, h) => 2 * r * h + 2 * r * r]];
  g63a.push(
    (r) => {
      const [x, y] = r.sample(CMP, 2), k = piK(r), r1 = rFor(k, r, 2, 9), r2 = rFor(k, r, 2, 9), h1 = r.int(3, 12), h2 = r.int(3, 12);
      const v1 = x[3](r1, h1), v2 = y[3](r2, h2);
      need(v1 !== v2);
      const f = (t, rr, h) => t.replace('{r}', n(rr)).replace('{h}', h);
      const big = v1 > v2;
      return { q: T(`Compare ${f(x[1], r1, h1)} with ${f(y[1], r2, h2)}. Which is larger and by how much? ${PI[k].en}`, `Bandingkan ${f(x[2], r1, h1)} dengan ${f(y[2], r2, h2)}. Yang manakah lebih besar dan berapakah bezanya? ${PI[k].ms}`), a: T(`The first is larger by $${pv(k, Math.abs(v1 - v2))}\\ \\text{cm}^2$.`.replace('first', big ? 'first' : 'second'), `${big ? 'Yang pertama' : 'Yang kedua'} lebih besar sebanyak $${pv(k, Math.abs(v1 - v2))}\\ \\text{cm}^2$.`), w: T(`First: $${pv(k, v1)}$; second: $${pv(k, v2)}$`, `Pertama: $${pv(k, v1)}$; kedua: $${pv(k, v2)}$`), sp: 'l' };
    },
    (r) => {
      const t = r.int(0, 1), rr = r.int(2, 9);
      if (t === 0) { const l = r.int(rr + 1, rr + 8); return { q: T(`A cone has slant height ${l} cm and its total surface area is $${pv('exact', rr * l + rr * rr)}\\ \\text{cm}^2$. Form an equation in $r$ and solve it by factorisation to find the base radius $r$.`, `Sebuah kon mempunyai tinggi condong ${l} cm dan jumlah luas permukaannya ialah $${pv('exact', rr * l + rr * rr)}\\ \\text{cm}^2$. Bentukkan satu persamaan dalam $r$ dan selesaikan dengan pemfaktoran untuk mencari jejari tapak $r$.`), a: T(`$r = ${rr}$ cm`), w: T(`$r^2 + ${l}r - ${rr * l + rr * rr} = 0$, so $(r - ${rr})(r + ${rr + l}) = 0$; $r > 0$`, `$r^2 + ${l}r - ${rr * l + rr * rr} = 0$, maka $(r - ${rr})(r + ${rr + l}) = 0$; $r > 0$`), sp: 'l' }; }
      const h = r.int(3, 12); return { q: T(`A closed cylinder has height ${h} cm and total surface area $${pv('exact', 2 * rr * rr + 2 * rr * h)}\\ \\text{cm}^2$. Form an equation in $r$ and solve it by factorisation to find the radius.`, `Sebuah silinder tertutup mempunyai tinggi ${h} cm dan jumlah luas permukaan $${pv('exact', 2 * rr * rr + 2 * rr * h)}\\ \\text{cm}^2$. Bentukkan satu persamaan dalam $r$ dan selesaikan dengan pemfaktoran untuk mencari jejari.`), a: T(`$r = ${rr}$ cm`), w: T(`$r^2 + ${h}r - ${rr * rr + rr * h} = 0$, so $(r - ${rr})(r + ${rr + h}) = 0$`, `$r^2 + ${h}r - ${rr * rr + rr * h} = 0$, maka $(r - ${rr})(r + ${rr + h}) = 0$`), sp: 'l' };
    },
  );
  SPM.extend('F2-6.3', { e: g63e, m: g63m, a: g63a });

  /* ================================================================= 6.4 */
  const CONES2 = TRI.concat([[4, 3, 5], [8, 6, 10], [12, 5, 13], [15, 8, 17], [12, 9, 15]]);
  const conePick2 = (r, k) => (k === 'r22' ? { r: 7, h: 24, l: 25 } : ((t) => ({ r: t[0], h: t[1], l: t[2] }))(r.pick(CONES2)));
  const rBig = (k, r, lo, hi) => (k === 'r22' ? r.pick([10.5, 21]) : r.int(lo, hi));
  /** value A + (num/den) pi, sign-aware; exact keeps pi */
  const pmv = (k, A, num, den, u) => {
    den = den || 1;
    if (!A) return pa(k, num, den, u);
    if (k === 'exact') return T(`$(${n(A)} ${num < 0 ? '-' : '+'} ${pv('exact', Math.abs(num), den)})${u}$`);
    pv(k, num, den);
    return T(`$${n(round(A + pnum(k, num, den), 2))}${u}$`);
  };
  const eqv = (k, A, num, den) => (k === 'exact' ? `${A ? n(A) + (num < 0 ? ' - ' : ' + ') : ''}${pv('exact', Math.abs(num), den)}` : n(round(A + pnum(k, num, den), 2)));
  const VB = {
    cyl: { N: ['cylinder', 'silinder'], gen: (r, k) => ({ r: rFor(k, r, 2, 10), h: r.int(3, 16), dia: r.chance(0.4), nn: r.pick([['cylinder', 'silinder'], ['drum', 'dram'], ['tin', 'tin'], ['water tank', 'tangki air']]) }), D: (p) => [`${R(p)[0]} and height ${p.h} cm`, `${R(p)[1]} dan tinggi ${p.h} cm`],
      asks: [['e', 'Find the volume of a {N} of {D}.', 'Cari isi padu sebuah {N} {D}.', (p) => [p.r * p.r * p.h, 1], '$V = \\pi r^2 h$'],
        ['e', 'The area of the circular base of a {N} of {D} is needed first. Find (a) the area of the base, (b) the volume.', 'Luas tapak bulat sebuah {N} {D} diperlukan dahulu. Cari (a) luas tapak, (b) isi padu.', null, ''],
        ['m', 'A {N} of {D} is three-quarters full of water. Find the volume of the water.', 'Sebuah {N} {D} diisi tiga perempat penuh dengan air. Cari isi padu air itu.', (p) => [3 * p.r * p.r * p.h, 4], '$\\frac34 \\times \\pi r^2 h$'],
        ['m', 'A {N} of {D} is cut into two equal halves along its axis. Find the volume of one half.', 'Sebuah {N} {D} dipotong kepada dua bahagian yang sama sepanjang paksinya. Cari isi padu satu bahagian.', (p) => [p.r * p.r * p.h, 2], '$\\frac12 \\pi r^2 h$'],
        ['m', 'A {N} of {D} is filled to the brim with water. Find the volume of water, in cm³, and its capacity in litres. ($1\\ \\text{litre} = 1000\\ \\text{cm}^3$)', 'Sebuah {N} {D} diisi penuh dengan air. Cari isi padu air, dalam cm³, dan muatannya dalam liter. ($1\\ \\text{liter} = 1000\\ \\text{cm}^3$)', null, '']] },
    cone: { N: ['cone', 'kon'], gen: (r, k) => Object.assign(conePick2(r, k), { dia: r.chance(0.3), nn: r.pick([['cone', 'kon'], ['cone', 'kon'], ['party hat', 'topi parti'], ['funnel', 'corong']]) }), D: (p) => [`${R(p)[0]} and perpendicular height ${p.h} cm`, `${R(p)[1]} dan tinggi tegak ${p.h} cm`], DL: (p) => [`${R(p)[0]} and slant height ${p.l} cm`, `${R(p)[1]} dan tinggi condong ${p.l} cm`],
      asks: [['e', 'Find the volume of a {N} of {D}.', 'Cari isi padu sebuah {N} {D}.', (p) => [p.r * p.r * p.h, 3], '$V = \\frac13 \\pi r^2 h$'],
        ['m', 'Find the volume of a {N} of {D}.', 'Cari isi padu sebuah {N} {D}.', (p) => [p.r * p.r * p.h, 3], '$h = \\sqrt{l^2 - r^2}$; $V = \\frac13 \\pi r^2 h$', true],
        ['m', 'A {N} of {D} is filled with water. Find the volume of water in cm³.', 'Sebuah {N} {D} diisi dengan air. Cari isi padu air dalam cm³.', (p) => [p.r * p.r * p.h, 3], '$\\frac13 \\pi r^2 h$']] },
    sph: { N: ['sphere', 'sfera'], gen: (r, k) => ({ r: rBig(k, r, 2, 9), dia: r.chance(0.5), nn: r.pick([['sphere', 'sfera'], ['ball', 'bola'], ['globe', 'glob'], ['balloon', 'belon']]) }), D: (p) => [R(p)[0], R(p)[1]],
      asks: [['e', 'Find the volume of a {N} of {D}.', 'Cari isi padu sebuah {N} {D}.', (p) => [4 * p.r ** 3, 3], '$V = \\frac43 \\pi r^3$'],
        ['e', 'Find the volume of air needed to fill a hollow {N} of {D}.', 'Cari isi padu udara yang diperlukan untuk memenuhi sebuah {N} berongga {D}.', (p) => [4 * p.r ** 3, 3], '$\\frac43 \\pi r^3$'],
        ['m', 'A solid {N} of {D} is cut into two equal halves. Find the volume of one half.', 'Sebuah {N} pepejal {D} dipotong kepada dua bahagian yang sama. Cari isi padu satu bahagian.', (p) => [2 * p.r ** 3, 3], '$\\frac12 \\times \\frac43 \\pi r^3$']] },
    hemi: { N: ['hemisphere', 'hemisfera'], gen: (r, k) => ({ r: rBig(k, r, 2, 9), dia: r.chance(0.5), nn: r.pick([['hemisphere', 'hemisfera'], ['hemispherical bowl', 'mangkuk hemisfera'], ['hemispherical dome', 'kubah hemisfera']]) }), D: (p) => [R(p)[0], R(p)[1]],
      asks: [['e', 'Find the volume of a {N} of {D}.', 'Cari isi padu sebuah {N} {D}.', (p) => [2 * p.r ** 3, 3], '$V = \\frac23 \\pi r^3$'],
        ['m', 'A {N} of {D} is three-quarters full of water. Find the volume of the water.', 'Sebuah {N} {D} diisi tiga perempat penuh dengan air. Cari isi padu air itu.', (p) => [p.r ** 3, 2], '$\\frac34 \\times \\frac23 \\pi r^3$'],
        ['m', 'A {N} of {D} is filled to the brim with water. Find the volume of water it can hold.', 'Sebuah {N} {D} diisi penuh dengan air. Cari isi padu air yang boleh dimuatkan.', (p) => [2 * p.r ** 3, 3], '$\\frac23 \\pi r^3$']] },
  };
  const fwv = (key, lv) => (r) => {
    const s = VB[key], k = piK(r), p = s.gen(r, k), A = r.pick(s.asks.filter((x) => x[0] === lv)), useL = A[5] === true;
    const DD = (useL ? s.DL : s.D)(p), N = p.nn || s.N;
    const sub = (t, i) => t.replace('{N}', N[i]).replace('{D}', DD[i]);
    const fig = key === 'cone' && r.chance(0.5) ? coneF(p.r, p.l, p.h) : key === 'cyl' && r.chance(0.4) ? cylF(p.r, p.h) : undefined;
    const q = T(`${sub(A[1], 0)} ${PI[k].en}`, `${sub(A[2], 1)} ${PI[k].ms}`);
    if (!A[3]) {
      if (A[1].includes('(a) the area of the base')) return { q, a: P([pa(k, p.r * p.r, 1, U2), pa(k, p.r * p.r * p.h, 1, U3)]), w: T('$\\pi r^2$; then $\\pi r^2 \\times h$'), sp: 's' };
      const V = pnum(k, p.r * p.r * p.h);
      const L = round(V / 1000, 3);
      return { q, a: T(`$${pv(k, p.r * p.r * p.h)}${U3}$; ${n(L)} litres`, `$${pv(k, p.r * p.r * p.h)}${U3}$; ${n(L)} liter`), w: W('$V = \\pi r^2 h$', `$= ${piT(k)} \\times ${n(p.r)}^2 \\times ${n(p.h)} = ${pv(k, p.r * p.r * p.h)}${U3}$`, T(`$1000\\ \\text{cm}^3 = 1$ litre, so $${n(round(V, 2))} \\div 1000 = ${n(L)}$ litres.`, `$1000\\ \\text{cm}^3 = 1$ liter, jadi $${n(round(V, 2))} \\div 1000 = ${n(L)}$ liter.`)), sp: 's' };
    }
    const [num, den] = A[3](p);
    return { q, fig, a: pa(k, num, den, U3), w: T(A[4]), sp: 's' };
  };
  const cuboidV = (l, w, h) => l * w * h;
  const UL = (v) => n(round(v / 1000, 3));

  const g64e = [fwv('cyl', 'e'), fwv('cone', 'e'), fwv('sph', 'e'), fwv('hemi', 'e'),
    /* cuboids, cubes, prisms */
    (r) => {
      const l = r.int(3, 12), w = r.int(2, 9), h = r.int(2, 10), t = r.int(0, 5);
      need(new Set([l, w, h]).size === 3);
      const o = r.pick(BOXO);
      if (t === 0) return { q: T('The figure shows a cuboid. Find its volume.', 'Rajah menunjukkan sebuah kuboid. Cari isi padunya.'), fig: cuboidFig(l, w, h), a: T(`$${l * w * h}${U3}$`), w: W(T('Volume of a cuboid $=$ length $\\times$ width $\\times$ height:', 'Isi padu kuboid $=$ panjang $\\times$ lebar $\\times$ tinggi:'), `$V = ${l} \\times ${w} \\times ${h} = ${l * w * h}$`), sp: 's' };
      if (t === 1) return { q: T(`Find the volume of a cube of edge ${l} cm.`, `Cari isi padu sebuah kubus bersisi ${l} cm.`), a: T(`$${l ** 3}${U3}$`), w: W(T('All the edges of a cube are equal:', 'Semua tepi kubus adalah sama:'), `$V = a^3 = ${l}^3 = ${l ** 3}$`), sp: 's' };
      if (t === 2) return { q: T(`A ${o[0]} is a cuboid ${l} cm long, ${w} cm wide and ${h} cm high. How much can it hold, in cm³?`, `${SPM.cap(o[1])} ialah kuboid dengan panjang ${l} cm, lebar ${w} cm dan tinggi ${h} cm. Berapakah isi padu yang boleh dimuatkan, dalam cm³?`), a: T(`$${l * w * h}${U3}$`), w: W(T('The amount it holds is its volume:', 'Jumlah yang boleh dimuatkan ialah isi padunya:'), `$V = ${l} \\times ${w} \\times ${h} = ${l * w * h}$`), sp: 's' };
      if (t === 3) return { q: T(`The base of a cuboid has an area of ${l * w} cm² and the cuboid is ${h} cm high. Find its volume.`, `Luas tapak sebuah kuboid ialah ${l * w} cm² dan tinggi kuboid itu ${h} cm. Cari isi padunya.`), a: T(`${l * w * h} cm³`), w: W(T('Volume $=$ area of the base $\\times$ height:', 'Isi padu $=$ luas tapak $\\times$ tinggi:'), `$V = ${l * w} \\times ${h} = ${l * w * h}$`), sp: 's' };
      if (t === 4) return { q: T(`A prism has a cross-section of area ${l * w} cm² and is ${h} cm long. Find its volume.`, `Sebuah prisma mempunyai keratan rentas berluas ${l * w} cm² dan panjangnya ${h} cm. Cari isi padunya.`), a: T(`${l * w * h} cm³`), w: W(T('Volume of a prism $=$ area of the cross-section $\\times$ length:', 'Isi padu prisma $=$ luas keratan rentas $\\times$ panjang:'), `$V = ${l * w} \\times ${h} = ${l * w * h}$`), sp: 's' };
      return { q: T(`A cube has a volume of ${l ** 3} cm³. Find the length of one edge.`, `Sebuah kubus mempunyai isi padu ${l ** 3} cm³. Cari panjang satu tepinya.`), a: T(`${l} cm`), w: W(`$a^3 = ${l ** 3}$`, `$a = \\sqrt[3]{${l ** 3}} = ${l}$`, T(`The edge is ${l} cm.`, `Panjang tepinya ialah ${l} cm.`)), sp: 's' };
    },
    /* triangular prism */
    (r) => {
      const b = r.int(3, 12), h = r.int(2, 10), L = r.int(4, 14), t = r.int(0, 1);
      need(b * h % 2 === 0);
      if (t === 0) return { q: T(`A prism has a triangular cross-section with base ${b} cm and height ${h} cm, and length ${L} cm. Find its volume.`, `Sebuah prisma mempunyai keratan rentas segi tiga dengan tapak ${b} cm dan tinggi ${h} cm, dan panjang ${L} cm. Cari isi padunya.`), fig: triPrismFig(b, h, L, [cm(b), cm(h), cm(L)]), a: T(`${(b * h * L) / 2} cm³`), w: W(T('Area of the triangular cross-section:', 'Luas keratan rentas segi tiga:'), `$\\dfrac{1}{2} \\times ${b} \\times ${h} = ${(b * h) / 2}$`, T('Volume $=$ area of cross-section $\\times$ length:', 'Isi padu $=$ luas keratan rentas $\\times$ panjang:'), `$V = ${(b * h) / 2} \\times ${L} = ${(b * h * L) / 2}$`), sp: 's' };
      return { q: T(`A chocolate box is a right prism whose ends are right-angled triangles with perpendicular sides ${b} cm and ${h} cm. The box is ${L} cm long. Find the volume of the box.`, `Sebuah kotak coklat ialah prisma tegak yang hujungnya segi tiga bersudut tegak dengan sisi serenjang ${b} cm dan ${h} cm. Kotak itu panjangnya ${L} cm. Cari isi padu kotak itu.`), a: T(`${(b * h * L) / 2} cm³`), w: W(T('The cross-section is a right-angled triangle:', 'Keratan rentasnya ialah segi tiga bersudut tegak:'), `$\\dfrac{1}{2} \\times ${b} \\times ${h} = ${(b * h) / 2}$`, T('Volume $=$ area of cross-section $\\times$ length:', 'Isi padu $=$ luas keratan rentas $\\times$ panjang:'), `$V = ${(b * h) / 2} \\times ${L} = ${(b * h * L) / 2}$`), sp: 's' };
    },
    /* capacity conversions */
    (r) => {
      const l = r.pick([20, 25, 40, 50, 60, 80]), w = r.pick([10, 20, 25, 30, 40]), h = r.pick([10, 20, 25, 30, 50]), t = r.int(0, 2);
      const V = l * w * h;
      if (t === 0) return { q: T(`A rectangular tank measures ${l} cm by ${w} cm by ${h} cm. Find its capacity in litres. ($1\\ \\text{litre} = 1000\\ \\text{cm}^3$)`, `Sebuah tangki segi empat tepat berukuran ${l} cm kali ${w} cm kali ${h} cm. Cari muatannya dalam liter. ($1\\ \\text{liter} = 1000\\ \\text{cm}^3$)`), a: T(`${UL(V)} litres`, `${UL(V)} liter`), w: W(`$V = ${l} \\times ${w} \\times ${h} = ${V}\\ \\text{cm}^3$`, T('Divide by $1000$ to change $\\text{cm}^3$ into litres:', 'Bahagi dengan $1000$ untuk menukar $\\text{cm}^3$ kepada liter:'), `$${V} \\div 1000 = ${UL(V)}$`), sp: 's' };
      if (t === 1) return { q: T(`Convert ${UL(V)} litres to cm³ and to m³.`, `Tukarkan ${UL(V)} liter kepada cm³ dan m³.`), a: T(`${V} cm³; ${n(V / 1e6)} m³`), w: W(T('$1$ litre $= 1000\\ \\text{cm}^3$:', '$1$ liter $= 1000\\ \\text{cm}^3$:'), `$${UL(V)} \\times 1000 = ${V}$`, T('$1\\ \\text{m}^3 = 1000000\\ \\text{cm}^3$:', '$1\\ \\text{m}^3 = 1000000\\ \\text{cm}^3$:'), `$${V} \\div 1000000 = ${n(V / 1e6)}$`), sp: 's' };
      return { q: T(`A fish tank holds ${UL(V)} litres of water. Its base is ${l} cm by ${w} cm. Find the height of the water when it is full.`, `Sebuah akuarium boleh memuatkan ${UL(V)} liter air. Tapaknya ${l} cm kali ${w} cm. Cari tinggi air apabila akuarium itu penuh.`), a: T(`${h} cm`), w: T(`$${V} \\div (${l} \\times ${w})$`), sp: 's' };
    },
    /* formula recall */
    (r) => {
      const bank = [
        [T('the volume of a cylinder', 'isi padu silinder'), '\\pi r^2 h', ['2\\pi r h', '\\frac13 \\pi r^2 h', '\\pi r h']],
        [T('the volume of a cone', 'isi padu kon'), '\\frac13 \\pi r^2 h', ['\\pi r^2 h', '\\frac13 \\pi r l', '\\frac13 \\pi r h']],
        [T('the volume of a sphere', 'isi padu sfera'), '\\frac43 \\pi r^3', ['4\\pi r^2', '\\frac43 \\pi r^2', '\\frac13 \\pi r^3']],
        [T('the volume of a pyramid', 'isi padu piramid'), '\\frac13 \\times \\text{base area} \\times h', ['\\text{base area} \\times h', '\\frac12 \\times \\text{base area} \\times h', '\\frac13 \\times \\text{base area} \\times l']],
        [T('the volume of a prism', 'isi padu prisma'), '\\text{area of cross-section} \\times \\text{length}', ['\\frac13 \\times \\text{area of cross-section} \\times \\text{length}', '\\text{perimeter} \\times \\text{length}', '2 \\times \\text{area of cross-section}']],
      ];
      const b = r.pick(bank), ops = r.shuffle([b[1]].concat(b[2])), i = ops.indexOf(b[1]);
      const list = ops.map((o, j) => `(${'ABCD'[j]}) $${o}$`).join('&emsp;');
      return { q: T(`Which expression gives ${b[0].en}? ${list}`, `Ungkapan manakah yang memberi ${b[0].ms}? ${list}`), a: T(`(${'ABCD'[i]}) $${b[1]}$`), w: W(T(`The formula for ${b[0].en} is $${b[1]}$.`, `Rumus bagi ${b[0].ms} ialah $${b[1]}$.`), T(`That is option (${'ABCD'[i]}); the others are formulas for a different quantity.`, `Itu ialah pilihan (${'ABCD'[i]}); yang lain ialah rumus bagi kuantiti yang berlainan.`)), sp: 'xs' };
    },
  ];

  const g64m = [fwv('cyl', 'm'), fwv('cone', 'm'), fwv('sph', 'm'), fwv('hemi', 'm'),
    /* pyramids */
    (r) => {
      const a = r.int(3, 12), w = r.int(2, 10), h = r.pick([3, 6, 9, 12]), t = r.int(0, 3);
      need(a !== w);
      const sq = t !== 1, V = ((sq ? a * a : a * w) * h) / 3;
      need(Number.isInteger(V) || t === 3);
      const fig = upSvg(regPoly(4, 46, 0.32, 0), 80, 0, true, { h: cm(h), labs: [{ i: 0, t: cm(a) }] });
      if (t === 0) return { q: T(`The figure shows a right pyramid with a square base of side ${a} cm and height ${h} cm. Find its volume.`, `Rajah menunjukkan sebuah piramid tegak dengan tapak segi empat sama bersisi ${a} cm dan tinggi ${h} cm. Cari isi padunya.`), fig, a: T(`${n(V)} cm³`), w: T(`$\\frac13 \\times ${a}^2 \\times ${h}$`), sp: 's' };
      if (t === 1) return { q: T(`A right pyramid has a rectangular base ${a} cm by ${w} cm and a height of ${h} cm. Find its volume.`, `Sebuah piramid tegak mempunyai tapak segi empat tepat ${a} cm kali ${w} cm dan tinggi ${h} cm. Cari isi padunya.`), a: T(`${n(V)} cm³`), w: T(`$\\frac13 \\times ${a * w} \\times ${h}$`), sp: 's' };
      if (t === 2) { const [hw, ht, l] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]); return { q: T(`A right pyramid has a square base of side ${2 * hw} cm and slant height ${l} cm. Find the perpendicular height and the volume of the pyramid.`, `Sebuah piramid tegak mempunyai tapak segi empat sama bersisi ${2 * hw} cm dan tinggi condong ${l} cm. Cari tinggi tegak dan isi padu piramid itu.`), a: T(`${ht} cm; ${n((4 * hw * hw * ht) / 3)} cm³`), w: T(`$h^2 = ${l}^2 - ${hw}^2$`), sp: 'm' }; }
      return { q: T(`A right pyramid has a square base and a volume of ${(a * a * h) / 3} cm³. Its height is ${h} cm. Find the length of a side of the base.`, `Sebuah piramid tegak mempunyai tapak segi empat sama dan isi padu ${(a * a * h) / 3} cm³. Tingginya ${h} cm. Cari panjang sisi tapak itu.`), a: T(`${a} cm`), w: T(`$\\frac13 a^2 (${h}) = ${(a * a * h) / 3}$`), sp: 'm' };
    },
    /* reverse problems */
    (r) => {
      const k = piK(r), t = r.int(0, 4);
      if (t === 0) { const rr = rFor(k, r, 2, 8), h = r.int(3, 15); return { q: T(`The volume of a cylinder of radius ${n(rr)} cm is $${pv(k, rr * rr * h)}\\ \\text{cm}^3$. Find its height. ${PI[k].en}`, `Isi padu sebuah silinder berjejari ${n(rr)} cm ialah $${pv(k, rr * rr * h)}\\ \\text{cm}^3$. Cari tingginya. ${PI[k].ms}`), a: T(`${h} cm`), w: T(`$\\pi r^2 h = ${pv(k, rr * rr * h)}$`), sp: 's' }; }
      if (t === 1) { const rr = r.int(2, 9), h = r.int(3, 12), kk = r.pick(['exact', 'p3142']); return { q: T(`A cylinder of height ${h} cm has a volume of $${pv(kk, rr * rr * h)}\\ \\text{cm}^3$. Find its radius. ${PI[kk].en}`, `Sebuah silinder setinggi ${h} cm mempunyai isi padu $${pv(kk, rr * rr * h)}\\ \\text{cm}^3$. Cari jejarinya. ${PI[kk].ms}`), a: T(`${rr} cm`), w: T(`$r^2 = ${rr * rr}$`), sp: 's' }; }
      if (t === 2) { const c = conePick2(r, k), h = c.h; return { q: T(`A cone of base radius ${c.r} cm has a volume of $${pv(k, c.r * c.r * h, 3)}\\ \\text{cm}^3$. Find its perpendicular height. ${PI[k].en}`, `Sebuah kon berjejari tapak ${c.r} cm mempunyai isi padu $${pv(k, c.r * c.r * h, 3)}\\ \\text{cm}^3$. Cari tinggi tegaknya. ${PI[k].ms}`), a: T(`${h} cm`), w: T(`$\\frac13 \\pi r^2 h$`), sp: 'm' }; }
      if (t === 3) { const rr = r.int(2, 9), kk = r.pick(['exact', 'p3142']); return { q: T(`The volume of a sphere is $${pv(kk, 4 * rr ** 3, 3)}\\ \\text{cm}^3$. Find its radius. ${PI[kk].en}`, `Isi padu sebuah sfera ialah $${pv(kk, 4 * rr ** 3, 3)}\\ \\text{cm}^3$. Cari jejarinya. ${PI[kk].ms}`), a: T(`${rr} cm`), w: T(`$\\frac43 \\pi r^3$, so $r^3 = ${rr ** 3}$`), sp: 'm' }; }
      const l = r.int(4, 12), w = r.int(3, 9), h = r.int(2, 10);
      need(new Set([l, w, h]).size === 3);
      return { q: T(`The volume of a cuboid is ${l * w * h} cm³. Its base is ${l} cm by ${w} cm. Find its height.`, `Isi padu sebuah kuboid ialah ${l * w * h} cm³. Tapaknya ${l} cm kali ${w} cm. Cari tingginya.`), a: T(`${h} cm`), w: W(T('Volume $=$ base area $\\times$ height, so height $=$ volume $\\div$ base area:', 'Isi padu $=$ luas tapak $\\times$ tinggi, jadi tinggi $=$ isi padu $\\div$ luas tapak:'), `$${l} \\times ${w} = ${l * w}$`, `$${l * w * h} \\div ${l * w} = ${h}$`), sp: 's' };
    },
    /* spot the error */
    (r) => {
      const rr = r.int(3, 9), h = r.int(3, 4) * 3, [tr, th, tl] = r.pick(TRI);
      const bank = [
        [T(`A student finds the volume of a cone (radius ${rr} cm, height ${h} cm) as $\\pi(${rr})^2(${h})$. What is wrong? Find the correct volume.`, `Seorang murid mencari isi padu sebuah kon (jejari ${rr} cm, tinggi ${h} cm) sebagai $\\pi(${rr})^2(${h})$. Apakah yang salah? Cari isi padu yang betul.`), T(`The factor $\\frac13$ was forgotten. Correct: $${pv('exact', rr * rr * h, 3)}\\ \\text{cm}^3$.`, `Faktor $\\frac13$ tertinggal. Betul: $${pv('exact', rr * rr * h, 3)}\\ \\text{cm}^3$.`), W(T('The volume of a cone is $\\dfrac{1}{3}\\pi r^2 h$; $\\pi r^2 h$ is the volume of a cylinder.', 'Isi padu kon ialah $\\dfrac{1}{3}\\pi r^2 h$; $\\pi r^2 h$ ialah isi padu silinder.'), `$\\dfrac{1}{3}\\pi(${rr})^2(${h}) = ${pv('exact', rr * rr * h, 3)}$`)],
        [T(`A student finds the volume of a cylinder of diameter ${2 * rr} cm and height ${h} cm as $\\pi(${2 * rr})^2(${h})$. What is wrong? Find the correct volume.`, `Seorang murid mencari isi padu sebuah silinder berdiameter ${2 * rr} cm dan tinggi ${h} cm sebagai $\\pi(${2 * rr})^2(${h})$. Apakah yang salah? Cari isi padu yang betul.`), T(`The diameter was used as the radius. Correct: $${pv('exact', rr * rr * h)}\\ \\text{cm}^3$.`, `Diameter digunakan sebagai jejari. Betul: $${pv('exact', rr * rr * h)}\\ \\text{cm}^3$.`), W(T(`The radius is half the diameter: $r = ${2 * rr} \\div 2 = ${rr}$.`, `Jejari ialah separuh diameter: $r = ${2 * rr} \\div 2 = ${rr}$.`), `$\\pi(${rr})^2(${h}) = ${pv('exact', rr * rr * h)}$`)],
        [T(`A cone has radius ${tr} cm, perpendicular height ${th} cm and slant height ${tl} cm. A student calculates the volume as $\\frac13\\pi(${tr})^2(${tl})$. What is wrong? Find the correct volume.`, `Sebuah kon berjejari ${tr} cm, tinggi tegak ${th} cm dan tinggi condong ${tl} cm. Seorang murid mengira isi padu sebagai $\\frac13\\pi(${tr})^2(${tl})$. Apakah yang salah? Cari isi padu yang betul.`), T(`The slant height was used instead of the perpendicular height. Correct: $${pv('exact', tr * tr * th, 3)}\\ \\text{cm}^3$.`, `Tinggi condong digunakan dan bukan tinggi tegak. Betul: $${pv('exact', tr * tr * th, 3)}\\ \\text{cm}^3$.`), W(T('The volume of a cone uses the perpendicular height, not the slant height.', 'Isi padu kon menggunakan tinggi tegak, bukan tinggi condong.'), `$\\dfrac{1}{3}\\pi(${tr})^2(${th}) = ${pv('exact', tr * tr * th, 3)}$`)],
        [T(`A student says a tank of volume ${tr * th * 10} cm³ can hold ${tr * th * 10} litres. What is wrong? State the correct capacity.`, `Seorang murid berkata sebuah tangki berisi padu ${tr * th * 10} cm³ boleh memuatkan ${tr * th * 10} liter. Apakah yang salah? Nyatakan muatan yang betul.`), T(`$1000\\ \\text{cm}^3 = 1$ litre, so the capacity is ${n((tr * th * 10) / 1000)} litres.`, `$1000\\ \\text{cm}^3 = 1$ liter, maka muatannya ialah ${n((tr * th * 10) / 1000)} liter.`), W(T('$1000\\ \\text{cm}^3 = 1$ litre, so divide by $1000$:', '$1000\\ \\text{cm}^3 = 1$ liter, jadi bahagi dengan $1000$:'), `$${tr * th * 10} \\div 1000 = ${n((tr * th * 10) / 1000)}$`, T(`The capacity is ${n((tr * th * 10) / 1000)} litres.`, `Muatannya ialah ${n((tr * th * 10) / 1000)} liter.`))],
        [T(`A student finds the volume of a sphere of radius ${rr} cm as $\\frac43\\pi(${rr})^2$. What is wrong? Find the correct volume.`, `Seorang murid mencari isi padu sebuah sfera berjejari ${rr} cm sebagai $\\frac43\\pi(${rr})^2$. Apakah yang salah? Cari isi padu yang betul.`), T(`The radius should be cubed. Correct: $${pv('exact', 4 * rr ** 3, 3)}\\ \\text{cm}^3$.`, `Jejari sepatutnya dikuasa tiga. Betul: $${pv('exact', 4 * rr ** 3, 3)}\\ \\text{cm}^3$.`), W(T('The volume of a sphere is $\\dfrac{4}{3}\\pi r^3$, so the radius is cubed:', 'Isi padu sfera ialah $\\dfrac{4}{3}\\pi r^3$, jadi jejarinya dikuasa tiga:'), `$\\dfrac{4}{3}\\pi(${rr})^3 = ${pv('exact', 4 * rr ** 3, 3)}$`)],
        [T(`A student finds the volume of a pyramid with a square base of side ${rr} cm and height ${h} cm as ${rr * rr * h} cm³. What is wrong? Find the correct volume.`, `Seorang murid mencari isi padu sebuah piramid bertapak segi empat sama bersisi ${rr} cm dan tinggi ${h} cm sebagai ${rr * rr * h} cm³. Apakah yang salah? Cari isi padu yang betul.`), T(`The factor $\\frac13$ was forgotten. Correct: ${(rr * rr * h) / 3} cm³.`, `Faktor $\\frac13$ tertinggal. Betul: ${(rr * rr * h) / 3} cm³.`), W(T('The volume of a pyramid is $\\dfrac{1}{3} \\times$ base area $\\times$ height:', 'Isi padu piramid ialah $\\dfrac{1}{3} \\times$ luas tapak $\\times$ tinggi:'), `$\\dfrac{1}{3} \\times ${rr}^2 \\times ${h} = \\dfrac{1}{3} \\times ${rr * rr * h} = ${(rr * rr * h) / 3}$`)],
      ];
      const b = r.pick(bank);
      return { q: b[0], a: b[1], w: b[2], sp: 'm' };
    },
    /* water charges, capacity of tanks */
    (r) => {
      const k = r.pick(['r22', 'p3142']), rr = k === 'r22' ? r.pick([7, 14, 3.5]) : r.pick([5, 10, 20]), h = r.int(1, 4) * 100, t = r.int(0, 2);
      const V = pnum(k, rr * rr * h);
      const o = r.pick(CYLO);
      if (t === 0) return { q: T(`A cylindrical water tank has a radius of ${n(rr)} cm and a height of ${h / 100} m. Find its capacity in litres. ${PI[k].en}`, `Sebuah tangki air silinder berjejari ${n(rr)} cm dan tinggi ${h / 100} m. Cari muatannya dalam liter. ${PI[k].ms}`), a: T(`${n(round(V / 1000, 2))} litres`, `${n(round(V / 1000, 2))} liter`), w: T(`$V = ${n(round(V, 2))}\\ \\text{cm}^3$`), sp: 'm' };
      if (t === 1) { const price = r.pick([0.4, 0.5, 0.8, 1.2]); return { q: T(`Water is charged at ${rm(price)} per m³. Find the cost of filling a cylindrical tank of radius ${n(rr)} cm and height ${h / 100} m with water. ${PI[k].en}`, `Air dicaj pada kadar ${rm(price)} per m³. Cari kos mengisi sebuah tangki silinder berjejari ${n(rr)} cm dan tinggi ${h / 100} m dengan air. ${PI[k].ms}`), a: T(rm(round((V / 1e6) * price, 2), 2)), w: T(`$V = ${n(round(V / 1e6, 4))}\\ \\text{m}^3$`), sp: 'm' }; }
      return { q: T(`A ${o[0]} is a cylinder of radius ${n(rr)} cm and height ${h / 10} cm. How many litres of liquid can it hold? ${PI[k].en}`, `Sebuah ${o[1]} berbentuk silinder berjejari ${n(rr)} cm dan tinggi ${h / 10} cm. Berapa liter cecair yang boleh dimuatkannya? ${PI[k].ms}`), a: T(`${n(round(V / 10000, 3))} litres`, `${n(round(V / 10000, 3))} liter`), w: W(`$V = \\pi r^2 h = ${piT(k)} \\times ${n(rr)}^2 \\times ${n(h / 10)} = ${n(round(V / 10, 2))}\\ \\text{cm}^3$`, T('Divide by $1000$ to change $\\text{cm}^3$ into litres:', 'Bahagi dengan $1000$ untuk menukar $\\text{cm}^3$ kepada liter:'), `$${n(round(V / 10, 2))} \\div 1000 = ${n(round(V / 10000, 3))}$`), sp: 'm' };
    },
    /* comparing volumes / ratios */
    (r) => {
      const t = r.int(0, 3), m = r.pick([2, 3, 4]);
      if (t === 0) return { q: T(`The edge of a cube is multiplied by ${m}. By what factor does its volume change?`, `Sisi sebuah kubus didarabkan dengan ${m}. Berapakah faktor perubahan isi padunya?`), a: T(`It is multiplied by ${m ** 3}.`, `Ia didarabkan dengan ${m ** 3}.`), w: T(`$(${m}a)^3 = ${m ** 3}a^3$`), sp: 's' };
      if (t === 1) return { q: T(`The radius of a cylinder is multiplied by ${m} and its height stays the same. By what factor does its volume change?`, `Jejari sebuah silinder didarabkan dengan ${m} dan tingginya kekal. Berapakah faktor perubahan isi padunya?`), a: T(`It is multiplied by ${m * m}.`, `Ia didarabkan dengan ${m * m}.`), w: W(`$\\pi(${m}r)^2h = \\pi \\times ${m * m}r^2 \\times h = ${m * m} \\times \\pi r^2 h$`, T(`The radius is squared in the formula, so the volume is multiplied by $${m}^2 = ${m * m}$.`, `Jejari dikuasa duakan dalam rumus, jadi isi padu didarabkan dengan $${m}^2 = ${m * m}$.`)), sp: 's' };
      if (t === 2) return { q: T(`A cone and a cylinder have the same base radius and the same height. Find the ratio of the volume of the cone to the volume of the cylinder.`, `Sebuah kon dan sebuah silinder mempunyai jejari tapak dan tinggi yang sama. Cari nisbah isi padu kon kepada isi padu silinder.`), a: T('$1 : 3$'), w: T('$\\frac13 \\pi r^2 h : \\pi r^2 h$'), sp: 's' };
      return { q: T(`A sphere and a cylinder have the same radius $r$, and the height of the cylinder is $2r$. Find the ratio of the volume of the sphere to the volume of the cylinder.`, `Sebuah sfera dan sebuah silinder mempunyai jejari $r$ yang sama, dan tinggi silinder itu ialah $2r$. Cari nisbah isi padu sfera kepada isi padu silinder.`), a: T('$2 : 3$'), w: T('$\\frac43 \\pi r^3 : 2\\pi r^3$'), sp: 'm' };
    },
    /* pouring into a cuboid tank */
    (r) => {
      const l = r.pick([20, 25, 30, 40]), w = r.pick([10, 20, 25]), d = r.int(4, 12), k = 'r22', rr = r.pick([7, 3.5, 14]), h = r.int(5, 20);
      const V = (22 / 7) * rr * rr * h, H = V / (l * w);
      need(Math.abs(H * 100 - Math.round(H * 100)) < 1e-6);
      return { q: T(`Water in a full cylindrical jar of radius ${n(rr)} cm and height ${h} cm is poured into an empty rectangular tank with a base ${l} cm by ${w} cm. Find the depth of water in the tank. Use $\\pi = \\frac{22}{7}$.`, `Air dalam sebuah balang silinder penuh berjejari ${n(rr)} cm dan tinggi ${h} cm dituang ke dalam sebuah tangki segi empat tepat kosong yang tapaknya ${l} cm kali ${w} cm. Cari kedalaman air dalam tangki itu. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${n(round(H, 2))} cm`), w: T(`$${n(round(V, 2))} \\div (${l} \\times ${w})$`), sp: 'm' };
    },
  ];

  /* composite volumes (uses the CO table of 6.3) */
  const CV = {
    cylcone: (p) => [0, 3 * p.r * p.r * p.H + p.r * p.r * p.h, 3], cylhemi: (p) => [0, 3 * p.r * p.r * p.H + 2 * p.r ** 3, 3], conehemi: (p) => { const h = Math.sqrt(p.l * p.l - p.r * p.r); need(Number.isInteger(h)); return [0, p.r * p.r * h + 2 * p.r ** 3, 3]; },
    rocket: (p) => { const h = Math.sqrt(p.l * p.l - p.r * p.r); need(Number.isInteger(h)); return [0, 2 * p.r ** 3 + 3 * p.r * p.r * p.H + p.r * p.r * h, 3]; },
    cubedent: (p) => [p.a ** 3, -2 * p.r ** 3, 3], cuboidhole: (p) => [p.l * p.w * p.h, -p.r * p.r * p.h, 1],
    cylconehole: (p) => { const h = Math.sqrt(p.l * p.l - p.r * p.r); need(Number.isInteger(h)); return [0, 3 * p.r * p.r * p.H - p.r * p.r * h, 3]; },
    house: (p) => [2 * p.hw * p.L * p.W + p.hw * p.ht * p.L, 0, 1], stepped: (p) => [0, p.R * p.R * p.h1 + p.r * p.r * p.h2, 1],
  };
  const VOK = { cylcone: 'the cone and the cylinder', cylhemi: 'the hemisphere and the cylinder', conehemi: 'the hemisphere and the cone', rocket: 'the hemisphere, the cylinder and the cone', cubedent: 'the cube minus the hemispherical hollow', cuboidhole: 'the cuboid minus the cylindrical hole', cylconehole: 'the cylinder minus the conical hollow', house: 'the cuboid and the triangular prism roof', stepped: 'the two cylinders' };
  const VOM = { cylcone: 'kon dan silinder', cylhemi: 'hemisfera dan silinder', conehemi: 'hemisfera dan kon', rocket: 'hemisfera, silinder dan kon', cubedent: 'kubus tolak lekuk hemisfera', cuboidhole: 'kuboid tolak lubang silinder', cylconehole: 'silinder tolak lekuk kon', house: 'kuboid dan bumbung prisma segi tiga', stepped: 'dua silinder' };
  const g64a = [
    (r) => {
      const c = r.pick(CO), k = c.id === 'house' ? 'exact' : piK(r), p = c.par(r, k);
      const [A, num, den] = CV[c.id](p);
      return { q: T(`A solid is made of ${c.en(p)}. Find the volume of the solid.${c.id === 'house' ? '' : ' ' + PI[k].en}`, `Sebuah pepejal dibuat daripada ${c.ms(p)}. Cari isi padu pepejal itu.${c.id === 'house' ? '' : ' ' + PI[k].ms}`), fig: coFig(c, p), a: c.id === 'house' ? T(`${n(A)} cm³`) : pmv(k, A, num, den, U3), w: T(`Add or subtract the volumes of ${VOK[c.id]}.`, `Tambah atau tolak isi padu ${VOM[c.id]}.`), sp: 'l' };
    },
    /* find the free dimension from the volume */
    (r) => {
      const c = r.pick(CO.filter((x) => x.free && x.id !== 'cuboidhole')), k = piK(r), p = c.par(r, k), f = c.free;
      const [A, num, den] = CV[c.id](p);
      const ph = Object.assign({}, p, { [f]: 'h' });
      return { q: T(`A solid is made of ${c.en(ph)}. Its volume is $${eqv(k, A, num, den)}\\ \\text{cm}^3$. Find the value of $h$. ${PI[k].en}`, `Sebuah pepejal dibuat daripada ${c.ms(ph)}. Isi padunya ialah $${eqv(k, A, num, den)}\\ \\text{cm}^3$. Cari nilai $h$. ${PI[k].ms}`), fig: coFig(c, p), a: T(`$h = ${p[f]}$ cm`), w: T(`Volume of ${VOK[c.id]} $= ${eqv(k, A, num, den)}$`, `Isi padu ${VOM[c.id]} $= ${eqv(k, A, num, den)}$`), sp: 'l' };
    },
    /* recasting */
    (r) => {
      const t = r.int(0, 4);
      if (t === 0) { const R1 = r.int(2, 5), m = r.pick([2, 3, 4]); return { q: T(`A solid metal sphere of radius ${R1 * m} cm is melted and recast into small spheres of radius ${R1} cm. How many small spheres can be made?`, `Sebuah sfera logam pepejal berjejari ${R1 * m} cm dicairkan dan dituang semula menjadi sfera kecil berjejari ${R1} cm. Berapakah bilangan sfera kecil yang boleh dibuat?`), a: T(`${m ** 3}`), w: T(`$\\left(\\dfrac{${R1 * m}}{${R1}}\\right)^3$`), sp: 'm' }; }
      if (t === 1) { const rr = r.pick([3, 6, 9]), h = r.pick([2, 4, 5]), m = r.int(3, 8); return { q: T(`A solid metal cylinder of radius ${rr} cm and height ${h * m * 3} cm is melted and recast into solid cones of the same radius and height ${h * 3} cm. How many cones can be made?`, `Sebuah silinder logam pepejal berjejari ${rr} cm dan tinggi ${h * m * 3} cm dicairkan dan dituang semula menjadi kon pepejal berjejari sama dan tinggi ${h * 3} cm. Berapakah bilangan kon yang boleh dibuat?`), a: T(`${m * 3}`), w: T(`$\\dfrac{\\pi r^2 (${h * m * 3})}{\\frac13 \\pi r^2 (${h * 3})}$`), sp: 'm' }; }
      if (t === 2) { const a = r.int(2, 5), m = r.pick([1, 2, 3]); const rr = a; return { q: T(`A solid cube of edge ${2 * a} cm is melted and recast into a solid cylinder of base radius ${rr} cm. Find the height of the cylinder, in terms of $\\pi$ (as a fraction).`, `Sebuah kubus pepejal bersisi ${2 * a} cm dicairkan dan dituang semula menjadi sebuah silinder pepejal berjejari tapak ${rr} cm. Cari tinggi silinder itu dalam sebutan $\\pi$ (sebagai pecahan).`), a: T(`$\\dfrac{${8 * a * a * a}}{${a * a}\\pi}\\ \\text{cm} = \\dfrac{${8 * a}}{\\pi}\\ \\text{cm}$`), w: T(`$${2 * a}^3 = \\pi(${rr})^2 h$`), sp: 'm' }; }
      if (t === 3) { const R1 = r.pick([2, 3, 4]), m = r.pick([1, 2]); const nn = r.pick([8, 27, 64]); const rr = Math.cbrt(nn) * R1; return { q: T(`${nn} identical small solid metal balls, each of radius ${R1} cm, are melted to make one large solid ball. Find the radius of the large ball.`, `${nn} bebola logam pepejal kecil yang sama, setiap satu berjejari ${R1} cm, dicairkan untuk membentuk satu bebola pepejal yang besar. Cari jejari bebola besar itu.`), a: T(`${rr} cm`), w: T(`$${nn} \\times \\frac43\\pi(${R1})^3 = \\frac43\\pi R^3$`), sp: 'm' }; }
      const l = r.pick([6, 8, 10]), w = r.pick([4, 5, 6]), h = r.pick([3, 5]), nn = r.pick([2, 3, 5]);
      return { q: T(`A rectangular block of wax ${l} cm by ${w} cm by ${h * nn} cm is melted and recast into ${nn} identical cuboids each ${l} cm by ${w} cm. Find the height of each cuboid.`, `Seketul lilin segi empat tepat ${l} cm kali ${w} cm kali ${h * nn} cm dicairkan dan dituang semula menjadi ${nn} kuboid yang sama, setiap satu ${l} cm kali ${w} cm. Cari tinggi setiap kuboid itu.`), a: T(`${h} cm`), w: W(T('The total volume does not change when the wax is recast:', 'Jumlah isi padu tidak berubah apabila lilin itu dituang semula:'), `$${l} \\times ${w} \\times ${h * nn} = ${l * w * h * nn}\\ \\text{cm}^3$`, T(`This is shared between ${nn} cuboids, so each has volume $${l * w * h * nn} \\div ${nn} = ${l * w * h}$.`, `Ini dikongsi antara ${nn} kuboid, jadi setiap satu berisi padu $${l * w * h} \\div ${nn}$... `.slice(0, 0) + `Ini dikongsi antara ${nn} kuboid, jadi setiap satu berisi padu $${l * w * h * nn} \\div ${nn} = ${l * w * h}$.`), `$${l * w * h} \\div (${l} \\times ${w}) = ${l * w * h} \\div ${l * w} = ${h}$`), sp: 'm' };
    },
    /* pouring between containers */
    (r) => {
      const R1 = r.pick([7, 14]), r2 = r.pick([3.5, 7, 10.5]), h = r.int(10, 30), t = r.int(0, 1);
      need(R1 !== r2);
      const V = (22 / 7) * R1 * R1 * h, d = V / ((22 / 7) * r2 * r2);
      need(Math.abs(d * 100 - Math.round(d * 100)) < 1e-6);
      if (t === 0) return { q: T(`Water from a full cylindrical tank of radius ${R1} cm and height ${h} cm is poured into an empty cylindrical jar of radius ${n(r2)} cm. Find the height of water in the jar. Use $\\pi = \\frac{22}{7}$.`, `Air dari sebuah tangki silinder penuh berjejari ${R1} cm dan tinggi ${h} cm dituang ke dalam sebuah balang silinder kosong berjejari ${n(r2)} cm. Cari tinggi air dalam balang itu. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${n(round(d, 2))} cm`), w: T(`$\\pi(${R1})^2(${h}) = \\pi(${n(r2)})^2 H$`), sp: 'm' };
      const p = r.pick([25, 40, 50, 75]);
      return { q: T(`A cylindrical tank of radius ${R1} cm and height ${h} cm is ${p}% full of water. Find the volume of water in litres. Use $\\pi = \\frac{22}{7}$.`, `Sebuah tangki silinder berjejari ${R1} cm dan tinggi ${h} cm diisi ${p}% air. Cari isi padu air dalam liter. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${n(round((V * p) / 100000, 3))} litres`, `${n(round((V * p) / 100000, 3))} liter`), w: T(`$V = ${n(round(V, 2))}\\ \\text{cm}^3$`), sp: 'm' };
    },
    /* percentage filled and flow rate */
    (r) => {
      const t = r.int(0, 2);
      if (t === 0) { const l = r.pick([40, 50, 60, 80]), w = r.pick([20, 25, 30, 40]), h = r.pick([20, 25, 30, 40]), d = r.pick([5, 10, 15]); need(d < h); return { q: T(`A rectangular tank measures ${l} cm by ${w} cm by ${h} cm. It contains water to a depth of ${d} cm. What percentage of the tank is filled? How many more litres are needed to fill it?`, `Sebuah tangki segi empat tepat berukuran ${l} cm kali ${w} cm kali ${h} cm. Ia mengandungi air sedalam ${d} cm. Berapakah peratus tangki yang terisi? Berapa liter lagi diperlukan untuk memenuhinya?`), a: T(`${n(round((d / h) * 100, 2))}%; ${UL(l * w * (h - d))} litres`, `${n(round((d / h) * 100, 2))}%; ${UL(l * w * (h - d))} liter`), w: W(T('The base area is the same at every depth, so the percentage filled is the ratio of the depths:', 'Luas tapak sama pada setiap kedalaman, jadi peratus yang terisi ialah nisbah kedalaman:'), `$\\dfrac{${d}}{${h}} \\times 100 = ${n(round((d / h) * 100, 2))}$%`, T('The empty part is still $' + (h - d) + '$ cm deep:', 'Bahagian kosong masih sedalam $' + (h - d) + '$ cm:'), `$${l} \\times ${w} \\times ${h - d} = ${l * w * (h - d)}\\ \\text{cm}^3 = ${UL(l * w * (h - d))}$`), sp: 'm' }; }
      if (t === 1) { const l = r.pick([50, 60, 80, 100]), w = r.pick([40, 50, 60]), h = r.pick([30, 40, 50]), f = r.pick([10, 12, 15, 20, 25]); const V = (l * w * h) / 1000; need(Math.abs((V / f) * 60 - Math.round((V / f) * 60)) < 1e-6); return { q: T(`Water flows into an empty rectangular tank ${l} cm by ${w} cm by ${h} cm at ${f} litres per minute. How long does it take to fill the tank, in minutes and seconds?`, `Air mengalir ke dalam sebuah tangki segi empat tepat kosong ${l} cm kali ${w} cm kali ${h} cm pada kadar ${f} liter seminit. Berapa lamakah masa untuk memenuhi tangki itu, dalam minit dan saat?`), a: T(`${Math.floor((V / f) * 60 / 60)} min ${round(((V / f) * 60) % 60, 0)} s`, `${Math.floor((V / f) * 60 / 60)} min ${round(((V / f) * 60) % 60, 0)} s`), w: T(`${n(V)} litres $\\div ${f}$`), sp: 'm' }; }
      const rr = r.pick([7, 14]), h = r.pick([10, 20, 30, 50]), f = r.pick([2, 3, 4, 5]);
      const V = (22 / 7) * rr * rr * h / 1000;
      need(Math.abs(V * 1000 - Math.round(V * 1000)) < 1e-6);
      return { q: T(`Water flows into an empty cylindrical container of radius ${rr} cm and height ${h} cm at ${f} litres per minute. How long does it take, in seconds, to fill it? Use $\\pi = \\frac{22}{7}$.`, `Air mengalir ke dalam sebuah bekas silinder kosong berjejari ${rr} cm dan tinggi ${h} cm pada kadar ${f} liter seminit. Berapa lamakah, dalam saat, untuk memenuhinya? Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${n(round((V / f) * 60, 2))} s`), w: T(`$V = ${n(round(V * 1000, 2))}\\ \\text{cm}^3 = ${n(round(V, 3))}$ litres`), sp: 'm' };
    },
  ];

  /* one solid inside another; hollow pipes; cones from sectors; capacities of composite containers */
  const INS = [
    { en: (r) => `a sphere of radius ${n(r)} cm fits exactly inside a cube (the sphere touches all six faces)`, ms: (r) => `sebuah sfera berjejari ${n(r)} cm muat tepat di dalam sebuah kubus (sfera menyentuh kesemua enam permukaan)`, V: (r) => [8 * r ** 3, -4 * r ** 3, 3], o: (r) => [8 * r ** 3, 0, 1], i: (r) => [0, 4 * r ** 3, 3], sp: 'empty space', spM: 'ruang kosong' },
    { en: (r) => `a cylinder of radius ${n(r)} cm and height ${n(2 * r)} cm fits exactly inside a cube (the cylinder touches all six faces)`, ms: (r) => `sebuah silinder berjejari ${n(r)} cm dan tinggi ${n(2 * r)} cm muat tepat di dalam sebuah kubus (silinder menyentuh kesemua enam permukaan)`, V: (r) => [8 * r ** 3, -2 * r ** 3, 1], o: (r) => [8 * r ** 3, 0, 1], i: (r) => [0, 2 * r ** 3, 1] },
    { en: (r) => `a sphere of radius ${n(r)} cm fits exactly inside a cylinder (the sphere touches the curved surface and both circular ends)`, ms: (r) => `sebuah sfera berjejari ${n(r)} cm muat tepat di dalam sebuah silinder (sfera menyentuh permukaan melengkung dan kedua-dua hujung bulat)`, V: (r) => [0, 2 * r ** 3, 3], o: (r) => [0, 2 * r ** 3, 1], i: (r) => [0, 4 * r ** 3, 3] },
    { en: (r) => `a cone of radius ${n(r)} cm and height ${n(2 * r)} cm is inside a cylinder of the same radius and height`, ms: (r) => `sebuah kon berjejari ${n(r)} cm dan tinggi ${n(2 * r)} cm berada di dalam sebuah silinder yang sama jejari dan tingginya`, V: (r) => [0, 4 * r ** 3, 3], o: (r) => [0, 2 * r ** 3, 1], i: (r) => [0, 2 * r ** 3, 3] },
    { en: (r) => `a hemisphere of radius ${n(r)} cm sits inside a cylinder of the same radius and height ${n(r)} cm`, ms: (r) => `sebuah hemisfera berjejari ${n(r)} cm berada di dalam sebuah silinder yang sama jejarinya dan tinggi ${n(r)} cm`, V: (r) => [0, r ** 3, 3], o: (r) => [0, r ** 3, 1], i: (r) => [0, 2 * r ** 3, 3] },
  ];
  const HEX = [[6, 10, 216], [8, 10, 288], [9, 15, 216], [12, 15, 288], [12, 20, 216], [16, 20, 288], [15, 25, 216], [20, 25, 288], [3, 5, 216], [4, 5, 288]];
  g64a.push(
    (r) => {
      const c = r.pick(INS), k = piK(r), rr = rBig(k, r, 2, 6) === 10.5 ? 10.5 : k === 'r22' ? r.pick([7, 3.5]) : r.int(2, 6), t = r.int(0, 1);
      const [A, num, den] = c.V(rr);
      if (t === 0) return { q: T(`In a toy box, ${c.en(rr)}. Find the volume of the space not occupied by the inner solid. ${PI[k].en}`, `Dalam sebuah kotak mainan, ${c.ms(rr)}. Cari isi padu ruang yang tidak diisi oleh pepejal di dalam. ${PI[k].ms}`), a: pmv(k, A, num, den, U3), w: T('Outer volume minus inner volume', 'Isi padu luar tolak isi padu dalam'), sp: 'l' };
      const kk = k === 'exact' ? 'p3142' : k;
      const O = c.o(rr), I = c.i(rr);
      const ov = O[0] + pnum(kk, O[1], O[2]), iv = I[0] + pnum(kk, I[1], I[2]);
      return { q: T(`In a toy box, ${c.en(rr)}. What percentage of the volume of the outer solid is occupied by the inner solid, correct to 1 decimal place? ${PI[kk].en.replace(' and give the answer correct to 2 decimal places', '')}`, `Dalam sebuah kotak mainan, ${c.ms(rr)}. Berapakah peratus isi padu pepejal luar yang diisi oleh pepejal di dalam, betul kepada 1 tempat perpuluhan? ${PI[kk].ms.replace(' dan berikan jawapan betul kepada 2 tempat perpuluhan', '')}`), a: T(`${fx((iv / ov) * 100, 1)}%`), w: T(`Inner volume $= ${n(round(iv, 2))}$; outer volume $= ${n(round(ov, 2))}$`, `Isi padu dalam $= ${n(round(iv, 2))}$; isi padu luar $= ${n(round(ov, 2))}$`), sp: 'l' };
    },
    /* hollow pipes */
    (r) => {
      const k = piK(r), [R2, r2] = k === 'r22' ? r.pick([[14, 7], [10.5, 7], [7, 3.5], [21, 14]]) : r.pick([[5, 3], [6, 4], [8, 5], [10, 6], [7, 4], [9, 6]]), h = r.int(5, 40), t = r.int(0, 2), nm = r.pick([['pipe', 'paip'], ['tube', 'tiub'], ['hollow cylinder', 'silinder berongga']]);
      const V = (R2 * R2 - r2 * r2) * h;
      const base = `A metal ${nm[0]} of length ${h} cm has an outer radius of ${n(R2)} cm and an inner radius of ${n(r2)} cm.`, baseM = `${SPM.cap(nm[1])} logam sepanjang ${h} cm mempunyai jejari luar ${n(R2)} cm dan jejari dalam ${n(r2)} cm.`;
      if (t === 0) return { q: T(`${base} Find the volume of the metal used. ${PI[k].en}`, `${baseM} Cari isi padu logam yang digunakan. ${PI[k].ms}`), a: pa(k, V, 1, U3), w: T('$\\pi R^2 h - \\pi r^2 h$'), sp: 'm' };
      if (t === 1) return { q: T(`${base} Find the volume of liquid the ${nm[0]} can hold when it is closed at both ends by thin covers. ${PI[k].en}`, `${baseM} Cari isi padu cecair yang boleh dimuatkan apabila kedua-dua hujungnya ditutup dengan penutup nipis. ${PI[k].ms}`), a: pa(k, r2 * r2 * h, 1, U3), w: T('Inner cylinder: $\\pi r^2 h$'), sp: 'm' };
      return { q: T(`A metal ${nm[0]} of length ${h} cm and outer radius ${n(R2)} cm contains $${pv(k, V)}\\ \\text{cm}^3$ of metal. Find its inner radius. ${PI[k].en}`, `${SPM.cap(nm[1])} logam sepanjang ${h} cm dan berjejari luar ${n(R2)} cm mengandungi $${pv(k, V)}\\ \\text{cm}^3$ logam. Cari jejari dalamnya. ${PI[k].ms}`), a: T(`${n(r2)} cm`), w: T(`$${n(R2)}^2 - r^2 = ${n(V / h)}$`), sp: 'm' };
    },
    /* cone made from a sector */
    (r) => {
      const [rr, l, th] = r.pick(HEX), h = Math.sqrt(l * l - rr * rr), k = piK(r), nm = r.pick([['party hat', 'topi parti'], ['paper cone', 'kon kertas'], ['funnel', 'corong']]);
      return { q: T(`A sector of radius ${l} cm and angle $${th}^\\circ$ is cut from a piece of paper and its straight edges are joined to make a ${nm[0]} in the shape of a cone. Find (a) the base radius, (b) the height, (c) the volume of the cone. ${PI[k].en}`, `Satu sektor berjejari ${l} cm dan bersudut $${th}^\\circ$ dipotong daripada sekeping kertas dan tepi lurusnya dicantumkan untuk membuat ${nm[1]} berbentuk kon. Cari (a) jejari tapak, (b) tinggi, (c) isi padu kon itu. ${PI[k].ms}`), a: P([T(`${rr} cm`), T(`${h} cm`), pa(k, rr * rr * h, 3, U3)]), w: T(`$r = \\dfrac{${th}}{360} \\times ${l}$; $h = \\sqrt{${l}^2 - ${rr}^2}$`), sp: 'l' };
    },
    /* capacity of a composite container, in litres */
    (r) => {
      const c = r.pick(CO.filter((x) => ['cylcone', 'cylhemi', 'rocket', 'conehemi', 'stepped'].includes(x.id))), k = r.pick(['r22', 'p3142']), p = c.par(r, k);
      const [A, num, den] = CV[c.id](p);
      const L = (A + pnum(k, num, den)) / 1000;
      return { q: T(`A container is made of ${c.en(p)}. Find its capacity in litres, correct to 2 decimal places. ${PI[k].en.replace(' and give the answer correct to 2 decimal places', '')} ($1\\ \\text{litre} = 1000\\ \\text{cm}^3$)`, `Sebuah bekas dibuat daripada ${c.ms(p)}. Cari muatannya dalam liter, betul kepada 2 tempat perpuluhan. ${PI[k].ms.replace(' dan berikan jawapan betul kepada 2 tempat perpuluhan', '')} ($1\\ \\text{liter} = 1000\\ \\text{cm}^3$)`), fig: coFig(c, p), a: T(`${fx(L, 2)} litres`, `${fx(L, 2)} liter`), w: T(`Volume $= ${n(round(A + pnum(k, num, den), 2))}\\ \\text{cm}^3$`), sp: 'l' };
    },
    /* cube with a pyramid, depth of liquid */
    (r) => {
      const a = r.int(3, 9), h = r.pick([3, 6, 9]), t = r.int(0, 1), V = a ** 3 + (a * a * h) / 3;
      const en = `a cube of edge ${a} cm with a right pyramid of height ${t ? 'h' : h} cm on top of it, the base of the pyramid being the top face of the cube`, ms = `sebuah kubus bersisi ${a} cm dengan piramid tegak setinggi ${t ? 'h' : h} cm di atasnya, tapak piramid itu ialah permukaan atas kubus`;
      if (t === 0) return { q: T(`A solid is made of ${en}. Find the volume of the solid.`, `Sebuah pepejal dibuat daripada ${ms}. Cari isi padu pepejal itu.`), a: T(`${n(V)} cm³`), w: T(`$${a}^3 + \\frac13 \\times ${a}^2 \\times ${h}$`), sp: 'm' };
      return { q: T(`A solid is made of ${en}. The volume of the solid is ${n(V)} cm³. Find $h$.`, `Sebuah pepejal dibuat daripada ${ms}. Isi padu pepejal itu ialah ${n(V)} cm³. Cari $h$.`), a: T(`$h = ${h}$ cm`), w: T(`$${a}^3 + \\frac13 \\times ${a}^2 h = ${n(V)}$`), sp: 'm' };
    },
    /* filling a tank by volume and depth */
    (r) => {
      const rr = r.pick([7, 14]), h = r.pick([20, 25, 40, 50]), t = r.int(0, 1);
      const cap = ((22 / 7) * rr * rr * h) / 1000;
      need(twoDp(cap * 100));
      const f = r.pick([2, 4, 5]);
      if (t === 0) return { q: T(`A cylindrical tank of radius ${rr} cm contains ${n(round(cap, 3))} litres of water. Find the depth of the water. Use $\\pi = \\frac{22}{7}$.`, `Sebuah tangki silinder berjejari ${rr} cm mengandungi ${n(round(cap, 3))} liter air. Cari kedalaman air itu. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${h} cm`), w: T(`$${n(round(cap * 1000, 2))} \\div (\\pi \\times ${rr}^2)$`), sp: 'm' };
      return { q: T(`Water flows at ${f} litres per minute into an empty cylindrical tank of radius ${rr} cm. Find the depth of water after 5 minutes. Use $\\pi = \\frac{22}{7}$.`, `Air mengalir pada kadar ${f} liter seminit ke dalam sebuah tangki silinder kosong berjejari ${rr} cm. Cari kedalaman air selepas 5 minit. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${n(round((f * 5000) / ((22 / 7) * rr * rr), 2))} cm`), w: T(`$${f * 5000}\\ \\text{cm}^3 \\div \\pi r^2$`), sp: 'm' };
    },
  );
  SPM.extend('F2-6.4', { e: g64e, m: g64m, a: g64a });

  /* ================================================================= 7.2 distance */
  const RT = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [15, 20, 25]];
  const d2 = (A, B) => (A[0] - B[0]) ** 2 + (A[1] - B[1]) ** 2;
  const dd = (A, B) => Math.sqrt(d2(A, B));
  const dp2 = (x) => n(round(x, 2));
  const rtPair = (r, lo, hi) => {
    const t = r.pick(RT), s = r.pick([[1, 1], [1, -1], [-1, 1], [-1, -1]]), sw = r.chance();
    const A = [r.int(lo, hi), r.int(lo, hi)], dx = (sw ? t[1] : t[0]) * s[0], dy = (sw ? t[0] : t[1]) * s[1];
    return { A, B: [A[0] + dx, A[1] + dy], t };
  };
  const inWin = (P, m) => P.every((p) => Math.abs(p[0]) <= m && Math.abs(p[1]) <= m);
  const PFm = (P, m, o) => PF(P, Object.assign({ x: [-m, m], y: [-m, m], scale: m > 10 ? 12 : 16 }, o || {}));
  const bk = (v) => (v < 0 ? `(${n(v)})` : n(v));
  /** the three standard distance-formula lines from A to B (ending at the surd) */
  const distW = (A, B) => {
    const dx = B[0] - A[0], dy = B[1] - A[1];
    return [T('Use $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$:', 'Gunakan $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$:'),
      `$d = \\sqrt{(${n(B[0])} - ${bk(A[0])})^2 + (${n(B[1])} - ${bk(A[1])})^2}$`,
      `$= \\sqrt{(${bk(dx)})^2 + (${bk(dy)})^2} = \\sqrt{${dx * dx} + ${dy * dy}} = \\sqrt{${d2(A, B)}}$`];
  };

  const g72e = [
    /* horizontal / vertical distance */
    (r) => {
      const A = [r.int(-8, 8), r.int(-8, 8)], d = r.int(2, 12), hz = r.chance(), pos = r.chance();
      const B = hz ? [A[0] + (pos ? d : -d), A[1]] : [A[0], A[1] + (pos ? d : -d)];
      const stems = [T(`Find the distance between $A = ${pt(A)}$ and $B = ${pt(B)}$.`, `Cari jarak antara $A = ${pt(A)}$ dan $B = ${pt(B)}$.`), T(`How long is the line segment joining $P = ${pt(A)}$ and $Q = ${pt(B)}$?`, `Berapakah panjang tembereng garis yang menyambungkan $P = ${pt(A)}$ dan $Q = ${pt(B)}$?`), T(`Points $C = ${pt(A)}$ and $D = ${pt(B)}$ lie on the same ${hz ? 'horizontal' : 'vertical'} line. Find $CD$.`, `Titik $C = ${pt(A)}$ dan $D = ${pt(B)}$ terletak pada garis ${hz ? 'mengufuk' : 'mencancang'} yang sama. Cari $CD$.`)];
      return { q: r.pick(stems), a: T(`${d} units`, `${d} unit`), w: W(T(hz ? 'The two points have the same $y$-coordinate, so the distance is the difference of the $x$-coordinates:' : 'The two points have the same $x$-coordinate, so the distance is the difference of the $y$-coordinates:', hz ? 'Kedua-dua titik mempunyai koordinat-$y$ yang sama, jadi jaraknya ialah beza koordinat-$x$:' : 'Kedua-dua titik mempunyai koordinat-$x$ yang sama, jadi jaraknya ialah beza koordinat-$y$:'), hz ? `$|${n(B[0])} - ${bk(A[0])}| = ${d}$` : `$|${n(B[1])} - ${bk(A[1])}| = ${d}$`, T(`The distance is ${d} units.`, `Jaraknya ialah ${d} unit.`)), sp: 's' };
    },
    /* read from the grid */
    (r) => {
      const A = [r.int(1, 7), r.int(1, 7)], d = r.int(2, 6), hz = r.chance(), B = hz ? [A[0] + d, A[1]] : [A[0], A[1] + d];
      return { q: T('The diagram shows two points $A$ and $B$ on a grid. Find the length of $AB$.', 'Rajah menunjukkan dua titik $A$ dan $B$ pada grid. Cari panjang $AB$.'), fig: PF1([A, B], { segs: [{ a: A, b: B }] }), a: T(`${d} units`, `${d} unit`), w: W(T(hz ? 'Both points are on the same horizontal line, so count the difference in the $x$-coordinates:' : 'Both points are on the same vertical line, so count the difference in the $y$-coordinates:', hz ? 'Kedua-dua titik pada garis mengufuk yang sama, jadi kira beza koordinat-$x$:' : 'Kedua-dua titik pada garis mencancang yang sama, jadi kira beza koordinat-$y$:'), hz ? `$AB = ${B[0]} - ${A[0]} = ${d}$` : `$AB = ${B[1]} - ${A[1]} = ${d}$`), sp: 's' };
    },
    /* context: distance along a row or column */
    (r) => {
      const c = r.pick(CTX), it = r.pick(c.it), it2 = r.pick(c.it.filter((x) => x !== it)), a = r.int(-6, 4), b = r.int(-6, 6), d = r.int(3, 9), hz = r.chance();
      const P = [a, b], Q = hz ? [a + d, b] : [a, b + d];
      return { q: T(`On a map, ${it[0]} is at $${pt(P)}$ and ${it2[0]} is at $${pt(Q)}$, where 1 unit represents 1 ${c.u[0].replace(/s$/, '')}. How far apart are they?`, `Pada satu peta, ${it[1]} berada di $${pt(P)}$ dan ${it2[1]} berada di $${pt(Q)}$, dengan 1 unit mewakili 1 ${c.u[1]}. Berapakah jarak antara kedua-duanya?`), a: T(`${d} ${c.u[0]}`, `${d} ${c.u[1]}`), w: W(T(hz ? 'Only the $x$-coordinate changes, so subtract the $x$-coordinates:' : 'Only the $y$-coordinate changes, so subtract the $y$-coordinates:', hz ? 'Hanya koordinat-$x$ yang berubah, jadi tolak koordinat-$x$:' : 'Hanya koordinat-$y$ yang berubah, jadi tolak koordinat-$y$:'), hz ? `$${n(Q[0])} - ${bk(P[0])} = ${d}$` : `$${n(Q[1])} - ${bk(P[1])} = ${d}$`, T(`They are ${d} ${c.u[0]} apart.`, `Jaraknya ialah ${d} ${c.u[1]}.`)), sp: 's' };
    },
    /* from the origin, and finding a point */
    (r) => {
      const k = r.int(2, 12), t = r.int(0, 5), A = [r.int(-6, 6), r.int(-6, 6)];
      if (t === 0) return { q: T(`Find the distance from the origin to the point $(${k}, 0)$.`, `Cari jarak dari asalan ke titik $(${k}, 0)$.`), a: T(`${k} units`, `${k} unit`), w: W(T('The point is on the $x$-axis, so the distance is the difference of the $x$-coordinates:', 'Titik itu pada paksi-$x$, jadi jaraknya ialah beza koordinat-$x$:'), `$${k} - 0 = ${k}$`), sp: 'xs' };
      if (t === 1) return { q: T(`Find the distance from the origin to the point $(0, -${k})$.`, `Cari jarak dari asalan ke titik $(0, -${k})$.`), a: T(`${k} units`, `${k} unit`), w: W(T('The point is on the $y$-axis, so the distance is the size of the $y$-coordinate:', 'Titik itu pada paksi-$y$, jadi jaraknya ialah nilai mutlak koordinat-$y$:'), `$|-${k} - 0| = ${k}$`), sp: 'xs' };
      const dirs = [[T('to the right of', 'di sebelah kanan'), [k, 0]], [T('to the left of', 'di sebelah kiri'), [-k, 0]], [T('above', 'di atas'), [0, k]], [T('below', 'di bawah'), [0, -k]]];
      const dr = dirs[t - 2];
      return { q: T(`The point $B$ is ${k} units ${dr[0].en} $A = ${pt(A)}$ on the same line. Write down the coordinates of $B$.`, `Titik $B$ berada ${k} unit ${dr[0].ms} $A = ${pt(A)}$ pada garis yang sama. Tuliskan koordinat $B$.`), a: T(`$${pt([A[0] + dr[1][0], A[1] + dr[1][1]])}$`), w: W(T(`Moving ${dr[0].en} $A$ changes only the $${dr[1][0] !== 0 ? 'x' : 'y'}$-coordinate.`, `Bergerak ${dr[0].ms} $A$ hanya mengubah koordinat-$${dr[1][0] !== 0 ? 'x' : 'y'}$.`), dr[1][0] !== 0 ? `$x = ${A[0]} ${dr[1][0] < 0 ? '-' : '+'} ${k} = ${A[0] + dr[1][0]}$, $y = ${A[1]}$` : `$x = ${A[0]}$, $y = ${A[1]} ${dr[1][1] < 0 ? '-' : '+'} ${k} = ${A[1] + dr[1][1]}$`, `$B = ${pt([A[0] + dr[1][0], A[1] + dr[1][1]])}$`), sp: 's' };
    },
    /* rectangle and square on the plane */
    (r) => {
      const x = r.int(-7, 0), y = r.int(-7, 0), w = r.int(2, 8), h = r.int(2, 8), sq = r.chance(), hh = sq ? w : h;
      const P = [[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]], t = r.int(0, 1);
      need(sq || w !== h);
      return { q: t ? T(`${sq ? 'A square' : 'A rectangle'} has vertices ${P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', ')}. Find the length of $AB$ and of $BC$.`, `${sq ? 'Sebuah segi empat sama' : 'Sebuah segi empat tepat'} mempunyai bucu ${P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', ')}. Cari panjang $AB$ dan $BC$.`) : T(`Find the perimeter of the ${sq ? 'square' : 'rectangle'} with vertices ${P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', ')}.`, `Cari perimeter ${sq ? 'segi empat sama' : 'segi empat tepat'} dengan bucu ${P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', ')}.`), fig: PFm(P, 8, { polys: [{ p: P }] }), a: t ? T(`$AB = ${w}$, $BC = ${hh}$`) : T(`${2 * (w + hh)} units`, `${2 * (w + hh)} unit`), w: W(T(`$A$ and $B$ have the same $y$-coordinate, so $AB = ${x + w} - ${bk(x)} = ${w}$.`, `$A$ dan $B$ mempunyai koordinat-$y$ yang sama, jadi $AB = ${x + w} - ${bk(x)} = ${w}$.`), T(`$B$ and $C$ have the same $x$-coordinate, so $BC = ${y + hh} - ${bk(y)} = ${hh}$.`, `$B$ dan $C$ mempunyai koordinat-$x$ yang sama, jadi $BC = ${y + hh} - ${bk(y)} = ${hh}$.`), ...(t ? [] : [T('Perimeter $= 2(AB + BC)$:', 'Perimeter $= 2(AB + BC)$:'), `$2(${w} + ${hh}) = ${2 * (w + hh)}$`])), sp: 's' };
    },
    /* missing coordinate on a horizontal / vertical line */
    (r) => {
      const A = [r.int(-6, 6), r.int(-6, 6)], d = r.int(2, 9), hz = r.chance(), pos = r.chance();
      const B = hz ? [A[0] + (pos ? d : -d), A[1]] : [A[0], A[1] + (pos ? d : -d)];
      return { q: hz ? T(`$A = ${pt(A)}$ and $B = (k, ${A[1]})$ with $k ${pos ? '>' : '<'} ${A[0]}$. Given that $AB = ${d}$ units, find $k$.`, `$A = ${pt(A)}$ dan $B = (k, ${A[1]})$ dengan $k ${pos ? '>' : '<'} ${A[0]}$. Diberi $AB = ${d}$ unit, cari $k$.`) : T(`$A = ${pt(A)}$ and $B = (${A[0]}, k)$ with $k ${pos ? '>' : '<'} ${A[1]}$. Given that $AB = ${d}$ units, find $k$.`, `$A = ${pt(A)}$ dan $B = (${A[0]}, k)$ dengan $k ${pos ? '>' : '<'} ${A[1]}$. Diberi $AB = ${d}$ unit, cari $k$.`), a: T(`$k = ${hz ? B[0] : B[1]}$`), w: W(T(hz ? 'The $y$-coordinates are equal, so $AB$ is horizontal and $AB = |k - x_A|$.' : 'The $x$-coordinates are equal, so $AB$ is vertical and $AB = |k - y_A|$.', hz ? 'Koordinat-$y$ adalah sama, jadi $AB$ mengufuk dan $AB = |k - x_A|$.' : 'Koordinat-$x$ adalah sama, jadi $AB$ mencancang dan $AB = |k - y_A|$.'), `$|k - ${bk(hz ? A[0] : A[1])}| = ${d}$`, T(`Since $k ${pos ? '>' : '<'} ${hz ? A[0] : A[1]}$, take $k = ${bk(hz ? A[0] : A[1])} ${pos ? '+' : '-'} ${d} = ${hz ? B[0] : B[1]}$.`, `Oleh sebab $k ${pos ? '>' : '<'} ${hz ? A[0] : A[1]}$, ambil $k = ${bk(hz ? A[0] : A[1])} ${pos ? '+' : '-'} ${d} = ${hz ? B[0] : B[1]}$.`)), sp: 's' };
    },
  ];

  const g72m = [
    /* Pythagorean distances */
    (r) => {
      const { A, B, t } = rtPair(r, -8, 4), tp = r.int(0, 3);
      need(inWin([A, B], 12));
      const stems = [
        [T(`Find the distance between $P = ${pt(A)}$ and $Q = ${pt(B)}$.`, `Cari jarak antara $P = ${pt(A)}$ dan $Q = ${pt(B)}$.`), null],
        [T(`The diagram shows the points $A$ and $B$. Find the length of $AB$.`, `Rajah menunjukkan titik $A$ dan $B$. Cari panjang $AB$.`), PFm([A, B], 12, { segs: [{ a: A, b: B }] })],
        [T(`Use the distance formula to find the length of the line segment from $${pt(A)}$ to $${pt(B)}$.`, `Gunakan rumus jarak untuk mencari panjang tembereng garis dari $${pt(A)}$ ke $${pt(B)}$.`), null],
        [T(`Show that the distance between the points $${pt(A)}$ and $${pt(B)}$ is ${t[2]} units.`, `Tunjukkan bahawa jarak antara titik $${pt(A)}$ dan $${pt(B)}$ ialah ${t[2]} unit.`), null],
      ];
      return { q: stems[tp][0], fig: stems[tp][1] || undefined, a: T(`${t[2]} units`, `${t[2]} unit`), w: W(...distW(A, B), T(`$= ${t[2]}$ units`, `$= ${t[2]}$ unit`)), sp: 's' };
    },
    /* from the origin */
    (r) => {
      const t = r.pick(RT), s = [r.sign(), r.sign()], P = [t[0] * s[0], t[1] * s[1]], v = r.int(0, 2);
      if (v === 0) return { q: T(`Find the distance of the point $${pt(P)}$ from the origin.`, `Cari jarak titik $${pt(P)}$ dari asalan.`), a: T(`${t[2]} units`, `${t[2]} unit`), w: W(...distW([0, 0], P), T(`$= ${t[2]}$ units`, `$= ${t[2]}$ unit`)), sp: 's' };
      if (v === 1) return { q: T(`Is the point $${pt(P)}$ exactly ${t[2]} units from the origin? Show your working.`, `Adakah titik $${pt(P)}$ tepat ${t[2]} unit dari asalan? Tunjukkan langkah kerja anda.`), a: T(`Yes: $\\sqrt{${P[0] ** 2} + ${P[1] ** 2}} = \\sqrt{${t[2] ** 2}} = ${t[2]}$`, `Ya: $\\sqrt{${P[0] ** 2} + ${P[1] ** 2}} = \\sqrt{${t[2] ** 2}} = ${t[2]}$`), w: W(...distW([0, 0], P), T(`$= ${t[2]}$, so yes, the point is exactly ${t[2]} units from the origin.`, `$= ${t[2]}$, jadi ya, titik itu tepat ${t[2]} unit dari asalan.`)), sp: 's' };
      const Q = [r.nz(-9, 9), r.nz(-9, 9)];
      need(d2(P, [0, 0]) !== d2(Q, [0, 0]));
      const near = d2(P, [0, 0]) < d2(Q, [0, 0]) ? P : Q;
      return { q: T(`Which of the points $${pt(P)}$ and $${pt(Q)}$ is nearer to the origin? Give the two distances (to 2 decimal places where necessary).`, `Antara titik $${pt(P)}$ dan $${pt(Q)}$, yang manakah lebih dekat dengan asalan? Berikan kedua-dua jarak (betul kepada 2 tempat perpuluhan jika perlu).`), a: T(`$${pt(near)}$ is nearer: ${dp2(dd(P, [0, 0]))} and ${dp2(dd(Q, [0, 0]))} units`, `$${pt(near)}$ lebih dekat: ${dp2(dd(P, [0, 0]))} dan ${dp2(dd(Q, [0, 0]))} unit`), w: W(`$\\sqrt{${P[0] ** 2} + ${P[1] ** 2}} = \\sqrt{${d2(P, [0, 0])}} = ${dp2(dd(P, [0, 0]))}$`, `$\\sqrt{${Q[0] ** 2} + ${Q[1] ** 2}} = \\sqrt{${d2(Q, [0, 0])}} = ${dp2(dd(Q, [0, 0]))}$`, T(`$${d2(near, [0, 0])}$ is the smaller squared distance, so $${pt(near)}$ is nearer.`, `$${d2(near, [0, 0])}$ ialah kuasa dua jarak yang lebih kecil, jadi $${pt(near)}$ lebih dekat.`)), sp: 's' };
    },
    /* context: straight-line distance on a map */
    (r) => {
      const c = r.pick(CTX), it = r.pick(c.it), it2 = r.pick(c.it.filter((x) => x !== it)), { A, B, t } = rtPair(r, -6, 3);
      need(inWin([A, B], 10));
      const how = c.d === COMP ? T('in a straight line', 'secara garis lurus') : T('directly', 'secara terus');
      return { q: T(`On a map drawn on a coordinate grid (1 unit = 1 ${c.u[0].replace(/s$/, '')}), ${it[0]} is at $${pt(A)}$ and ${it2[0]} is at $${pt(B)}$. Find the distance between them ${how.en}.`, `Pada satu peta yang dilukis pada grid koordinat (1 unit = 1 ${c.u[1]}), ${it[1]} berada di $${pt(A)}$ dan ${it2[1]} berada di $${pt(B)}$. Cari jarak antara kedua-duanya ${how.ms}.`), a: T(`${t[2]} ${c.u[0]}`, `${t[2]} ${c.u[1]}`), w: W(...distW(A, B), T(`$= ${t[2]}$, so the distance is ${t[2]} ${c.u[0]}.`, `$= ${t[2]}$, jadi jaraknya ialah ${t[2]} ${c.u[1]}.`)), sp: 's' };
    },
    /* perimeter of a right-angled triangle on the grid */
    (r) => {
      const t = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]), x = r.int(-6, 0), y = r.int(-6, 0), sx = r.sign(), sy = r.sign();
      const A = [x, y], B = [x + sx * t[0], y], C = [x, y + sy * t[1]];
      const nm = r.pick([['triangle', 'segi tiga'], ['triangular field', 'padang segi tiga']]);
      return { q: T(`The vertices of a ${nm[0]} are $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C)}$. Find its perimeter.`, `Bucu sebuah ${nm[1]} ialah $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C)}$. Cari perimeternya.`), fig: PFm([A, B, C], 12, { polys: [{ p: [A, B, C] }] }), a: T(`${t[0] + t[1] + t[2]} units`, `${t[0] + t[1] + t[2]} unit`), w: T(`$AB = ${t[0]}$, $AC = ${t[1]}$, $BC = ${t[2]}$`), sp: 'm' };
    },
    /* answer to 2 dp */
    (r) => {
      const A = [r.int(-7, 7), r.int(-7, 7)], B = [r.int(-7, 7), r.int(-7, 7)];
      need(!Number.isInteger(dd(A, B)) && A[0] !== B[0] && A[1] !== B[1]);
      const tp = r.int(0, 1);
      return { q: tp ? T(`A ship sails in a straight line from $${pt(A)}$ to $${pt(B)}$ on a chart where 1 unit is 1 km. How far does it sail, correct to 2 decimal places?`, `Sebuah kapal belayar secara garis lurus dari $${pt(A)}$ ke $${pt(B)}$ pada satu carta dengan 1 unit ialah 1 km. Berapa jauhkah ia belayar, betul kepada 2 tempat perpuluhan?`) : T(`Find the distance between $${pt(A)}$ and $${pt(B)}$, correct to 2 decimal places.`, `Cari jarak antara $${pt(A)}$ dan $${pt(B)}$, betul kepada 2 tempat perpuluhan.`), a: T(`${dp2(dd(A, B))} ${tp ? 'km' : 'units'}`, `${dp2(dd(A, B))} ${tp ? 'km' : 'unit'}`), w: T(`$\\sqrt{${d2(A, B)}}$`), sp: 's' };
    },
    /* write the expression / find AB squared */
    (r) => {
      const A = [r.int(-8, 8), r.int(-8, 8)], B = [r.int(-8, 8), r.int(-8, 8)], t = r.int(0, 1);
      need(A[0] !== B[0] && A[1] !== B[1]);
      if (t === 0) return { q: T(`For $A = ${pt(A)}$ and $B = ${pt(B)}$, calculate $AB^2$.`, `Bagi $A = ${pt(A)}$ dan $B = ${pt(B)}$, hitung $AB^2$.`), a: T(`$AB^2 = ${d2(A, B)}$`), w: T(`$(${B[0]} - ${A[0] < 0 ? `(${A[0]})` : A[0]})^2 + (${B[1]} - ${A[1] < 0 ? `(${A[1]})` : A[1]})^2$`), sp: 's' };
      return { q: T(`A student calculates the distance between $${pt(A)}$ and $${pt(B)}$ as $|${A[0]} - ${B[0]}| + |${A[1]} - ${B[1]}|$. What is wrong? Find the correct distance to 2 decimal places.`, `Seorang murid mengira jarak antara $${pt(A)}$ dan $${pt(B)}$ sebagai $|${A[0]} - ${B[0]}| + |${A[1]} - ${B[1]}|$. Apakah yang salah? Cari jarak yang betul kepada 2 tempat perpuluhan.`), a: T(`The differences were added instead of squared, added and square-rooted. Correct: ${dp2(dd(A, B))} units.`, `Beza ditambah dan bukan dikuasa dua, ditambah dan diambil punca kuasa dua. Betul: ${dp2(dd(A, B))} unit.`), w: W(T('That sum is the distance along the grid lines, not the straight-line distance.', 'Hasil tambah itu ialah jarak mengikut garis grid, bukan jarak garis lurus.'), ...distW(A, B), T(`$= ${dp2(dd(A, B))}$ units`, `$= ${dp2(dd(A, B))}$ unit`)), sp: 's' };
    },
  ];

  const g72a = [
    /* classify a triangle */
    (r) => {
      const kind = r.int(0, 2), tp = r.int(0, 1);
      let A, B, C;
      if (kind === 0) { const t = r.pick(RT); A = [r.int(-6, 0), r.int(-6, 0)]; B = [A[0] + t[0], A[1]]; C = [A[0], A[1] + t[1]]; if (r.chance()) [B, C] = [B, [A[0] + t[0], A[1] + t[1]]]; }
      else if (kind === 1) { const a = r.int(2, 5), h = r.int(2, 6), x = r.int(-6, 0), y = r.int(-6, 0); A = [x, y]; B = [x + 2 * a, y]; C = [x + a, y + h]; }
      else { A = [r.int(-6, 0), r.int(-6, 0)]; B = [A[0] + r.int(2, 7), A[1] + r.int(-2, 2)]; C = [A[0] + r.int(-2, 4), A[1] + r.int(3, 8)]; }
      const L = [d2(A, B), d2(B, C), d2(A, C)], s = L.slice().sort((x, y) => x - y);
      const right = s[0] + s[1] === s[2], iso = s[0] === s[1] || s[1] === s[2];
      need(A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]) !== 0);
      const desc = (l) => (right && iso ? (l ? 'isosceles and right-angled' : 'segi tiga sama kaki dan bersudut tegak') : right ? (l ? 'right-angled' : 'bersudut tegak') : iso ? (l ? 'isosceles' : 'sama kaki') : (l ? 'scalene (no equal sides, no right angle)' : 'tak sama sisi (tiada sisi sama, tiada sudut tegak)'));
      const wk = T(`$AB^2 = ${L[0]}$, $BC^2 = ${L[1]}$, $AC^2 = ${L[2]}$`);
      if (tp === 0) return { q: T(`The vertices of a triangle are $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C)}$. By finding the lengths of the sides, state whether the triangle is isosceles, right-angled, both, or neither.`, `Bucu sebuah segi tiga ialah $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C)}$. Dengan mencari panjang sisi, nyatakan sama ada segi tiga itu sama kaki, bersudut tegak, kedua-duanya, atau bukan kedua-duanya.`), fig: PFm([A, B, C], 12, { polys: [{ p: [A, B, C] }] }), a: T(`${cap1(desc(true))}`, `${cap1(desc(false))}`), w: wk, sp: 'l' };
      return { q: T(`Show whether the triangle with vertices $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C)}$ has a right angle, using Pythagoras' theorem on the squares of its side lengths.`, `Tunjukkan sama ada segi tiga dengan bucu $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C)}$ mempunyai sudut tegak, dengan menggunakan teorem Pythagoras pada kuasa dua panjang sisinya.`), a: right ? T(`Yes: $${s[0]} + ${s[1]} = ${s[2]}$, so it is right-angled.`, `Ya: $${s[0]} + ${s[1]} = ${s[2]}$, maka ia bersudut tegak.`) : T(`No: $${s[0]} + ${s[1]} = ${s[0] + s[1]} \\neq ${s[2]}$.`, `Tidak: $${s[0]} + ${s[1]} = ${s[0] + s[1]} \\neq ${s[2]}$.`), w: wk, sp: 'l' };
    },
    /* perimeter of a quadrilateral */
    (r) => {
      const t = r.pick([[3, 4, 5], [6, 8, 10]]), x = r.int(-6, -1), y = r.int(-6, -1), kind = r.int(0, 1);
      const A = [x, y], B = [x + t[0], y], C = [x + t[0], y + t[1]], D = kind === 0 ? [x, y + t[1]] : [x - 2, y + t[1]];
      const per = kind === 0 ? 2 * (t[0] + t[1]) : t[0] + t[1] + dd(C, D) + dd(D, A);
      return { q: T(`The vertices of a ${kind === 0 ? 'rectangle' : 'quadrilateral'} $ABCD$ are $A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ and $D = ${pt(D)}$. Find its perimeter${kind ? ', correct to 2 decimal places' : ''}.`, `Bucu ${kind === 0 ? 'sebuah segi empat tepat' : 'sebuah sisi empat'} $ABCD$ ialah $A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ dan $D = ${pt(D)}$. Cari perimeternya${kind ? ', betul kepada 2 tempat perpuluhan' : ''}.`), fig: PFm([A, B, C, D], 12, { polys: [{ p: [A, B, C, D] }] }), a: T(`${dp2(per)} units`, `${dp2(per)} unit`), w: T(`$AB = ${t[0]}$, $BC = ${t[1]}$, $CD = ${dp2(dd(C, D))}$, $DA = ${dp2(dd(D, A))}$`), sp: 'l' };
    },
    /* unknown coordinate from a distance (extension) */
    (r) => {
      const t = r.pick(RT), tp = r.int(0, 2), A = [r.int(-5, 5), r.int(-5, 5)];
      if (tp === 0) return { q: T(`The distance between $A = ${pt(A)}$ and $B = (k, ${A[1] + t[0]})$ is ${t[2]} units. Find the two possible values of $k$.`, `Jarak antara $A = ${pt(A)}$ dan $B = (k, ${A[1] + t[0]})$ ialah ${t[2]} unit. Cari dua nilai $k$ yang mungkin.`), a: T(`$k = ${A[0] + t[1]}$ or $k = ${A[0] - t[1]}$`, `$k = ${A[0] + t[1]}$ atau $k = ${A[0] - t[1]}$`), w: T(`$(k - ${A[0] < 0 ? `(${A[0]})` : A[0]})^2 + ${t[0]}^2 = ${t[2]}^2$`), sp: 'l' };
      if (tp === 1) return { q: T(`A point $P = (${A[0]}, y)$ is ${t[2]} units from $Q = ${pt([A[0] + t[1], A[1]])}$. Find the possible values of $y$.`, `Titik $P = (${A[0]}, y)$ berjarak ${t[2]} unit dari $Q = ${pt([A[0] + t[1], A[1]])}$. Cari nilai $y$ yang mungkin.`), a: T(`$y = ${A[1] + t[0]}$ or $y = ${A[1] - t[0]}$`, `$y = ${A[1] + t[0]}$ atau $y = ${A[1] - t[0]}$`), w: W(T('Use the squared distance:', 'Gunakan kuasa dua jarak:'), `$(${n(A[0])} - ${bk(A[0] + t[1])})^2 + (y - ${bk(A[1])})^2 = ${t[2]}^2$`, `$${t[1] * t[1]} + (y - ${bk(A[1])})^2 = ${t[2] * t[2]}$`, `$(y - ${bk(A[1])})^2 = ${t[0] * t[0]}$, so $y - ${bk(A[1])} = \\pm ${t[0]}$`, `$y = ${A[1] + t[0]}$ or $y = ${A[1] - t[0]}$`), sp: 'l' };
      const a = r.int(1, 6), b = t[0], k1 = a + t[1], k2 = a - t[1];
      return { q: T(`A point on the $x$-axis is ${t[2]} units from $A = (${a}, ${b})$. Find its coordinates.`, `Satu titik pada paksi-$x$ berjarak ${t[2]} unit dari $A = (${a}, ${b})$. Cari koordinatnya.`), a: T(`$(${k1}, 0)$ or $(${k2}, 0)$`, `$(${k1}, 0)$ atau $(${k2}, 0)$`), w: T(`$(k - ${a})^2 + ${b}^2 = ${t[2]}^2$`), sp: 'l' };
    },
    /* collinear by distances and by determinant */
    (r) => {
      const dx = r.int(1, 4), dy = r.int(-3, 3), A = [r.int(-6, 0), r.int(-6, 0)], k1 = r.int(1, 3), k2 = r.int(1, 3);
      const B = [A[0] + k1 * dx, A[1] + k1 * dy], C = [B[0] + k2 * dx, B[1] + k2 * dy];
      const tp = r.int(0, 1), bad = r.chance(), C2 = bad ? [C[0], C[1] + 1] : C;
      const det = (B[0] - A[0]) * (C2[1] - A[1]) - (B[1] - A[1]) * (C2[0] - A[0]);
      if (tp === 0) return { q: T(`Use the determinant $(x_2 - x_1)(y_3 - y_1) - (y_2 - y_1)(x_3 - x_1)$ to decide whether $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C2)}$ are collinear.`, `Gunakan penentu $(x_2 - x_1)(y_3 - y_1) - (y_2 - y_1)(x_3 - x_1)$ untuk menentukan sama ada $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C2)}$ adalah segaris.`), a: det === 0 ? T('The value is 0, so they are collinear.', 'Nilainya 0, maka ia segaris.') : T(`The value is ${det}, not 0, so they are not collinear.`, `Nilainya ${det}, bukan 0, maka ia tidak segaris.`), w: W(`$(${n(B[0])} - ${bk(A[0])})(${n(C2[1])} - ${bk(A[1])}) - (${n(B[1])} - ${bk(A[1])})(${n(C2[0])} - ${bk(A[0])})$`, `$= (${bk(B[0] - A[0])})(${bk(C2[1] - A[1])}) - (${bk(B[1] - A[1])})(${bk(C2[0] - A[0])}) = ${(B[0] - A[0]) * (C2[1] - A[1])} - ${bk((B[1] - A[1]) * (C2[0] - A[0]))} = ${det}$`, det === 0 ? T('The determinant is $0$, so the three points lie on one straight line.', 'Penentunya $0$, jadi ketiga-tiga titik terletak pada satu garis lurus.') : T('The determinant is not $0$, so the three points are not collinear.', 'Penentunya bukan $0$, jadi ketiga-tiga titik itu tidak segaris.')), sp: 'm' };
      return { q: T(`Points $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C2)}$: find $AB$, $BC$ and $AC$ (to 2 decimal places) and state whether $AB + BC = AC$. Are the three points collinear?`, `Titik $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C2)}$: cari $AB$, $BC$ dan $AC$ (betul kepada 2 tempat perpuluhan) dan nyatakan sama ada $AB + BC = AC$. Adakah ketiga-tiga titik itu segaris?`), a: T(`$AB = ${dp2(dd(A, B))}$, $BC = ${dp2(dd(B, C2))}$, $AC = ${dp2(dd(A, C2))}$; ${det === 0 ? 'AB + BC = AC, collinear' : 'AB + BC is not equal to AC, not collinear'}`, `$AB = ${dp2(dd(A, B))}$, $BC = ${dp2(dd(B, C2))}$, $AC = ${dp2(dd(A, C2))}$; ${det === 0 ? 'AB + BC = AC, segaris' : 'AB + BC tidak sama dengan AC, tidak segaris'}`), w: W(`$AB = \\sqrt{${d2(A, B)}} = ${dp2(dd(A, B))}$`, `$BC = \\sqrt{${d2(B, C2)}} = ${dp2(dd(B, C2))}$`, `$AC = \\sqrt{${d2(A, C2)}} = ${dp2(dd(A, C2))}$`, `$AB + BC = ${dp2(dd(A, B) + dd(B, C2))}$`, det === 0 ? T(`This equals $AC$, so $B$ lies on the segment $AC$ and the points are collinear.`, `Ini sama dengan $AC$, jadi $B$ terletak pada tembereng $AC$ dan titik-titik itu segaris.`) : T(`This is not equal to $AC = ${dp2(dd(A, C2))}$, so the points are not collinear.`, `Ini tidak sama dengan $AC = ${dp2(dd(A, C2))}$, jadi titik-titik itu tidak segaris.`)), sp: 'l' };
    },
    /* equidistant point on an axis */
    (r) => {
      const k = r.int(-4, 5), a = r.int(-5, 5), b = r.nz(-5, 5), c = r.int(-5, 5), tp = r.int(0, 1);
      // choose B so that (k,0) is equidistant from A=(a,b) and B=(c,e): (k-a)^2+b^2 = (k-c)^2+e^2
      const e2 = (k - a) ** 2 + b * b - (k - c) ** 2;
      need(e2 > 0 && Number.isInteger(Math.sqrt(e2)) && a !== c);
      const e = Math.sqrt(e2), A = [a, b], B = [c, e * r.sign()];
      if (tp === 1) { const q = k; return { q: T(`The point $P = (k, 0)$ is equally far from $A = ${pt(A)}$ and $B = ${pt(B)}$. Find $k$.`, `Titik $P = (k, 0)$ berjarak sama daripada $A = ${pt(A)}$ dan $B = ${pt(B)}$. Cari $k$.`), a: T(`$k = ${q}$`), w: W(T('Equal distances means equal squared distances:', 'Jarak yang sama bermakna kuasa dua jarak yang sama:'), `$(k ${a < 0 ? '+' : '-'} ${Math.abs(a)})^2 + ${b * b} = (k ${c < 0 ? '+' : '-'} ${Math.abs(c)})^2 + ${e2}$`, T('Expand and cancel $k^2$:', 'Kembangkan dan hapuskan $k^2$:'), `$${poly([[-2 * a, 'k'], [a * a + b * b, '']])} = ${poly([[-2 * c, 'k'], [c * c + e2, '']])}$`, `$${poly([[2 * (c - a), 'k']])} = ${c * c + e2 - a * a - b * b}$`, `$k = ${q}$`), sp: 'l' }; }
      return { q: T(`Show that the point $P = (${k}, 0)$ is equidistant from $A = ${pt(A)}$ and $B = ${pt(B)}$.`, `Tunjukkan bahawa titik $P = (${k}, 0)$ berjarak sama daripada $A = ${pt(A)}$ dan $B = ${pt(B)}$.`), a: T(`$PA^2 = ${(k - a) ** 2 + b * b}$ and $PB^2 = ${(k - c) ** 2 + e2}$, so $PA = PB$.`, `$PA^2 = ${(k - a) ** 2 + b * b}$ dan $PB^2 = ${(k - c) ** 2 + e2}$, maka $PA = PB$.`), w: W(`$PA^2 = (${n(k)} - ${bk(a)})^2 + (${bk(0)} - ${bk(b)})^2 = ${(k - a) ** 2} + ${b * b} = ${(k - a) ** 2 + b * b}$`, `$PB^2 = (${n(k)} - ${bk(c)})^2 + (${bk(0)} - ${bk(B[1])})^2 = ${(k - c) ** 2} + ${e2} = ${(k - c) ** 2 + e2}$`, T('The squared distances are equal, so $PA = PB$ and $P$ is equidistant from $A$ and $B$.', 'Kuasa dua jaraknya sama, jadi $PA = PB$ dan $P$ berjarak sama daripada $A$ dan $B$.')), sp: 'l' };
    },
    /* straight line versus along the grid */
    (r) => {
      const { A, B, t } = rtPair(r, -6, 3);
      need(inWin([A, B], 10));
      const c = r.pick(CTX);
      const along = Math.abs(B[0] - A[0]) + Math.abs(B[1] - A[1]);
      return { q: T(`A robot at $${pt(A)}$ must reach $${pt(B)}$. It can move only parallel to the axes (1 unit = 1 ${c.u[0].replace(/s$/, '')}), but a bird can fly straight. How much shorter is the bird's path?`, `Sebuah robot di $${pt(A)}$ mesti sampai ke $${pt(B)}$. Ia hanya boleh bergerak selari dengan paksi (1 unit = 1 ${c.u[1]}), tetapi seekor burung boleh terbang lurus. Berapa lebih pendekkah laluan burung itu?`), a: T(`${along - t[2]} ${c.u[0]} (robot ${along}, bird ${t[2]})`, `${along - t[2]} ${c.u[1]} (robot ${along}, burung ${t[2]})`), w: W(T(`Along the grid: $|${n(B[0])} - ${bk(A[0])}| + |${n(B[1])} - ${bk(A[1])}| = ${Math.abs(B[0] - A[0])} + ${Math.abs(B[1] - A[1])} = ${along}$`, `Mengikut grid: $|${n(B[0])} - ${bk(A[0])}| + |${n(B[1])} - ${bk(A[1])}| = ${Math.abs(B[0] - A[0])} + ${Math.abs(B[1] - A[1])} = ${along}$`), ...distW(A, B), T(`$= ${t[2]}$, so the bird flies ${t[2]} ${c.u[0]}.`, `$= ${t[2]}$, jadi burung itu terbang ${t[2]} ${c.u[1]}.`), `$${along} - ${t[2]} = ${along - t[2]}$`), sp: 'l' };
    },
    /* kite, rhombus, parallelogram tests */
    (r) => {
      const t = r.pick([[3, 4, 5], [6, 8, 10]]), c = [r.int(-4, 3), r.int(-4, 3)], a = t[0], b = t[1], tp = r.int(0, 1);
      const P = [[c[0] + a, c[1]], [c[0], c[1] + b], [c[0] - a, c[1]], [c[0], c[1] - b]];
      if (tp === 0) return { q: T(`Show that $A = ${pt(P[0])}$, $B = ${pt(P[1])}$, $C = ${pt(P[2])}$ and $D = ${pt(P[3])}$ are the vertices of a rhombus by finding the four side lengths.`, `Tunjukkan bahawa $A = ${pt(P[0])}$, $B = ${pt(P[1])}$, $C = ${pt(P[2])}$ dan $D = ${pt(P[3])}$ ialah bucu-bucu sebuah rombus dengan mencari empat panjang sisi.`), fig: PFm(P, 12, { polys: [{ p: P }] }), a: T(`$AB = BC = CD = DA = ${t[2]}$ units, so $ABCD$ is a rhombus.`, `$AB = BC = CD = DA = ${t[2]}$ unit, maka $ABCD$ ialah rombus.`), w: W(T(`Each side joins two points that differ by $${a}$ horizontally and $${b}$ vertically.`, `Setiap sisi menyambung dua titik yang berbeza $${a}$ mengufuk dan $${b}$ mencancang.`), `$\\sqrt{${a}^2 + ${b}^2} = \\sqrt{${a * a} + ${b * b}} = \\sqrt{${a * a + b * b}} = ${t[2]}$`, T(`So $AB = BC = CD = DA = ${t[2]}$ units and $ABCD$ is a rhombus.`, `Jadi $AB = BC = CD = DA = ${t[2]}$ unit dan $ABCD$ ialah rombus.`)), sp: 'l' };
      const K = [P[0], P[1], P[2], [c[0], c[1] - b - 2]];
      const s1 = d2(K[0], K[1]), s2 = d2(K[1], K[2]), s3 = d2(K[2], K[3]), s4 = d2(K[3], K[0]);
      need(s3 === s4 && s1 === s2 && s1 !== s3);
      return { q: T(`Show that the quadrilateral with vertices $A = ${pt(K[0])}$, $B = ${pt(K[1])}$, $C = ${pt(K[2])}$ and $D = ${pt(K[3])}$ is a kite by finding the four side lengths.`, `Tunjukkan bahawa sisi empat dengan bucu $A = ${pt(K[0])}$, $B = ${pt(K[1])}$, $C = ${pt(K[2])}$ dan $D = ${pt(K[3])}$ ialah lelayang dengan mencari empat panjang sisi.`), a: T(`$AB = BC = ${t[2]}$ and $CD = DA = ${dp2(Math.sqrt(s3))}$: two pairs of adjacent equal sides.`, `$AB = BC = ${t[2]}$ dan $CD = DA = ${dp2(Math.sqrt(s3))}$: dua pasang sisi bersebelahan yang sama panjang.`), w: W(`$AB = \\sqrt{${s1}} = ${t[2]}$, $BC = \\sqrt{${s2}} = ${t[2]}$`, `$CD = \\sqrt{${s3}} = ${dp2(Math.sqrt(s3))}$, $DA = \\sqrt{${s4}} = ${dp2(Math.sqrt(s4))}$`, T('Two pairs of adjacent sides are equal but all four are not, so the quadrilateral is a kite.', 'Dua pasang sisi bersebelahan adalah sama panjang tetapi bukan keempat-empatnya, jadi sisi empat itu ialah lelayang.')), sp: 'l' };
    },
  ];

  g72m.push(
    /* diagonals of a rectangle */
    (r) => {
      const t = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]), x = r.int(-7, -1), y = r.int(-7, -1), w = t[0], h = t[1], k = r.int(0, 1);
      const P = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      return { q: k ? T(`$ABCD$ is a rectangle with $A = ${pt(P[0])}$, $B = ${pt(P[1])}$, $C = ${pt(P[2])}$ and $D = ${pt(P[3])}$. Find the lengths of the diagonals $AC$ and $BD$. What do you notice?`, `$ABCD$ ialah sebuah segi empat tepat dengan $A = ${pt(P[0])}$, $B = ${pt(P[1])}$, $C = ${pt(P[2])}$ dan $D = ${pt(P[3])}$. Cari panjang pepenjuru $AC$ dan $BD$. Apakah yang anda perhatikan?`) : T(`A rectangular field has corners at ${P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', ')} (1 unit = 1 m). Find the length of the diagonal path $AC$.`, `Sebuah padang segi empat tepat mempunyai penjuru di ${P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', ')} (1 unit = 1 m). Cari panjang laluan pepenjuru $AC$.`), fig: PFm(P, 12, { polys: [{ p: P }], segs: [{ a: P[0], b: P[2] }, { a: P[1], b: P[3] }] }), a: k ? T(`$AC = BD = ${t[2]}$ units: the diagonals of a rectangle are equal.`, `$AC = BD = ${t[2]}$ unit: pepenjuru segi empat tepat adalah sama panjang.`) : T(`${t[2]} m`), w: W(T(`The diagonal spans ${w} across and ${h} up:`, `Pepenjuru itu merentas ${w} dan naik ${h}:`), `$AC = \\sqrt{${w}^2 + ${h}^2} = \\sqrt{${w * w} + ${h * h}} = \\sqrt{${w * w + h * h}} = ${t[2]}$`, k ? T(`$BD$ spans the same distances, so $AC = BD = ${t[2]}$: the diagonals of a rectangle are equal.`, `$BD$ merentas jarak yang sama, jadi $AC = BD = ${t[2]}$: pepenjuru segi empat tepat adalah sama panjang.`) : T(`The diagonal path is ${t[2]} m long.`, `Laluan pepenjuru itu sepanjang ${t[2]} m.`)), sp: 's' };
    },
    /* map scale */
    (r) => {
      const { A, B, t } = rtPair(r, -6, 3), sc = r.pick([2, 5, 10]), u = r.pick([['km', 'km'], ['m', 'm'], ['cm', 'cm']]), hz = r.chance();
      need(inWin([A, B], 10));
      const P = hz ? [A, [A[0] + t[2], A[1]]] : [A, B], dist = hz ? t[2] : t[2];
      return { q: T(`On a coordinate map, 1 unit represents ${sc} ${u[0]}. Two places are at $${pt(P[0])}$ and $${pt(P[1])}$. Find the actual distance between them in ${u[0]}.`, `Pada satu peta koordinat, 1 unit mewakili ${sc} ${u[1]}. Dua tempat berada di $${pt(P[0])}$ dan $${pt(P[1])}$. Cari jarak sebenar antara kedua-duanya dalam ${u[1]}.`), a: T(`${dist * sc} ${u[0]}`, `${dist * sc} ${u[1]}`), w: W(T(`On the map the two places are ${dist} units apart.`, `Pada peta, kedua-dua tempat berjarak ${dist} unit.`), T(`Each unit is ${sc} ${u[0]}:`, `Setiap unit ialah ${sc} ${u[1]}:`), `$${dist} \\times ${sc} = ${dist * sc}$`), sp: 's' };
    },
  );
  g72a.push(
    /* a journey in two legs */
    (r) => {
      const c = r.pick(CTX), it = r.pick(c.it), a = rtPair(r, -6, 2), t2 = r.pick(RT), s2 = [r.sign(), r.sign()];
      const B = a.B, C = [B[0] + t2[0] * s2[0], B[1] + t2[1] * s2[1]];
      need(inWin([a.A, B, C], 12));
      const tot = a.t[2] + t2[2], strt = dd(a.A, C);
      return { q: T(`${cap1(it[0])} travels from $${pt(a.A)}$ to $${pt(B)}$ and then straight on to $${pt(C)}$ (1 unit = 1 ${c.u[0].replace(/s$/, '')}). Find the total distance travelled, and the straight-line distance from the start to the end (to 2 decimal places).`, `${cap1(it[1])} bergerak dari $${pt(a.A)}$ ke $${pt(B)}$ dan kemudian terus ke $${pt(C)}$ (1 unit = 1 ${c.u[1]}). Cari jumlah jarak yang dilalui, dan jarak garis lurus dari permulaan ke penghujung (betul kepada 2 tempat perpuluhan).`), fig: PFm([a.A, B, C], 12, { segs: [{ a: a.A, b: B }, { a: B, b: C }] }), a: T(`${tot} ${c.u[0]}; ${dp2(strt)} ${c.u[0]}`, `${tot} ${c.u[1]}; ${dp2(strt)} ${c.u[1]}`), w: W(`$AB = \\sqrt{${d2(a.A, B)}} = ${a.t[2]}$, $BC = \\sqrt{${d2(B, C)}} = ${t2[2]}$`, `$AB + BC = ${a.t[2]} + ${t2[2]} = ${tot}$`, T('The straight-line distance is $AC$:', 'Jarak garis lurus ialah $AC$:'), `$AC = \\sqrt{${d2(a.A, C)}} = ${dp2(strt)}$`), sp: 'l' };
    },
    /* points on a circle about the origin */
    (r) => {
      const t = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]), s = () => [r.sign(), r.sign()];
      const P = [[t[0] * s()[0], t[1] * s()[1]], [t[1] * s()[0], t[0] * s()[1]], [0, t[2] * r.sign()]];
      const pr = r.chance();
      return { q: T(`Show that the points ${P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', ')} are all the same distance from the origin. What is this distance?`, `Tunjukkan bahawa titik ${P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', ')} semuanya berjarak sama dari asalan. Apakah jarak itu?`), fig: PFm(P, 18), a: T(`$OA = OB = OC = ${t[2]}$ units`, `$OA = OB = OC = ${t[2]}$ unit`), w: W(`$OA = \\sqrt{(${bk(P[0][0])})^2 + (${bk(P[0][1])})^2} = \\sqrt{${P[0][0] ** 2} + ${P[0][1] ** 2}} = \\sqrt{${t[2] ** 2}} = ${t[2]}$`, `$OB = \\sqrt{${P[1][0] ** 2} + ${P[1][1] ** 2}} = ${t[2]}$`, `$OC = \\sqrt{0 + ${P[2][1] ** 2}} = ${t[2]}$`, T(`All three points are ${t[2]} units from the origin, so they lie on a circle of radius ${t[2]}.`, `Ketiga-tiga titik berjarak ${t[2]} unit dari asalan, jadi ia terletak pada bulatan berjejari ${t[2]}.`)), sp: 'l' };
    },
    /* perimeter with irrational sides */
    (r) => {
      const A = [r.int(-6, 2), r.int(-6, 2)], B = [A[0] + r.int(2, 7), A[1] + r.int(-3, 3)], C = [A[0] + r.int(-3, 5), A[1] + r.int(3, 8)];
      need(A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]) !== 0);
      const p = dd(A, B) + dd(B, C) + dd(A, C);
      return { q: T(`Find the perimeter of the triangle with vertices $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C)}$, correct to 2 decimal places.`, `Cari perimeter segi tiga dengan bucu $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C)}$, betul kepada 2 tempat perpuluhan.`), fig: PFm([A, B, C], 12, { polys: [{ p: [A, B, C] }] }), a: T(`${dp2(p)} units`, `${dp2(p)} unit`), w: W(`$AB = \\sqrt{${d2(A, B)}} = ${dp2(dd(A, B))}$`, `$BC = \\sqrt{${d2(B, C)}} = ${dp2(dd(B, C))}$`, `$AC = \\sqrt{${d2(A, C)}} = ${dp2(dd(A, C))}$`, T(`Perimeter $= AB + BC + AC = ${dp2(p)}$ units (to 2 decimal places).`, `Perimeter $= AB + BC + AC = ${dp2(p)}$ unit (betul kepada 2 tempat perpuluhan).`)), sp: 'l' };
    },
    /* right angle and area */
    (r) => {
      const t = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]), B = [r.int(-5, 2), r.int(-5, 2)], sw = r.chance();
      const u = sw ? [t[0], t[1]] : [t[1], t[0]];
      const tilt = r.chance();
      const A = [B[0] + u[0], B[1]], C = [B[0], B[1] + u[1]];
      return { q: T(`The vertices of triangle $ABC$ are $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C)}$. Show that the triangle is right-angled and find its area.`, `Bucu segi tiga $ABC$ ialah $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C)}$. Tunjukkan bahawa segi tiga itu bersudut tegak dan cari luasnya.`), a: T(`$AB^2 + BC^2 = ${u[0] ** 2} + ${u[1] ** 2} = ${t[2] ** 2} = AC^2$; area $= ${(t[0] * t[1]) / 2}$ square units`, `$AB^2 + BC^2 = ${u[0] ** 2} + ${u[1] ** 2} = ${t[2] ** 2} = AC^2$; luas $= ${(t[0] * t[1]) / 2}$ unit persegi`), w: W(T(`$AB$ is horizontal with $AB = ${u[0]}$; $BC$ is vertical with $BC = ${u[1]}$.`, `$AB$ mengufuk dengan $AB = ${u[0]}$; $BC$ mencancang dengan $BC = ${u[1]}$.`), `$AC^2 = ${u[0]}^2 + ${u[1]}^2 = ${t[2] ** 2}$`, `$AB^2 + BC^2 = ${u[0] ** 2} + ${u[1] ** 2} = ${t[2] ** 2} = AC^2$`, T('By the converse of Pythagoras\' theorem the angle at $B$ is a right angle.', 'Mengikut akas teorem Pythagoras, sudut di $B$ ialah sudut tegak.'), T(`Area $= \\dfrac{1}{2} \\times ${u[0]} \\times ${u[1]} = ${(t[0] * t[1]) / 2}$ square units.`, `Luas $= \\dfrac{1}{2} \\times ${u[0]} \\times ${u[1]} = ${(t[0] * t[1]) / 2}$ unit persegi.`)), sp: 'l' };
    },
  );

  g72e.push(
    (r) => {
      const y = r.int(-6, 6), x = r.int(-8, -2), d1 = r.int(2, 6), d2_ = r.int(2, 6), t = r.int(0, 3);
      const A = [x, y], B = [x + d1, y], C = [x + d1 + d2_, y], V = [r.int(-6, 6), r.int(-7, -2)];
      const forms = [
        [T(`The points $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C)}$ lie on a horizontal line. Find $AC$.`, `Titik $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C)}$ terletak pada satu garis mengufuk. Cari $AC$.`), T(`${d1 + d2_} units`, `${d1 + d2_} unit`)],
        [T(`For $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C)}$, which is longer, $AB$ or $BC$? Give both lengths.`, `Bagi $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C)}$, yang manakah lebih panjang, $AB$ atau $BC$? Berikan kedua-dua panjang.`), d1 === d2_ ? T(`They are equal: ${d1} units each.`, `Kedua-duanya sama: ${d1} unit setiap satu.`) : T(`${d1 > d2_ ? 'AB' : 'BC'} is longer: $AB = ${d1}$, $BC = ${d2_}$.`, `${d1 > d2_ ? 'AB' : 'BC'} lebih panjang: $AB = ${d1}$, $BC = ${d2_}$.`)],
        [T(`Is $B = ${pt(B)}$ the midpoint of $A = ${pt(A)}$ and $C = ${pt(C)}$? Compare the lengths $AB$ and $BC$.`, `Adakah $B = ${pt(B)}$ titik tengah $A = ${pt(A)}$ dan $C = ${pt(C)}$? Bandingkan panjang $AB$ dan $BC$.`), d1 === d2_ ? T(`Yes: $AB = BC = ${d1}$.`, `Ya: $AB = BC = ${d1}$.`) : T(`No: $AB = ${d1}$ but $BC = ${d2_}$.`, `Tidak: $AB = ${d1}$ tetapi $BC = ${d2_}$.`)],
        [T(`A vertical pole stands at $P = ${pt([V[0], 0])}$ on the $x$-axis and a bird is at $Q = ${pt([V[0], -V[1]])}$. Find the distance $PQ$, and the distance from $P$ to the point $${pt([V[0], V[1]])}$.`, `Sebatang tiang mencancang berdiri di $P = ${pt([V[0], 0])}$ pada paksi-$x$ dan seekor burung berada di $Q = ${pt([V[0], -V[1]])}$. Cari jarak $PQ$, dan jarak dari $P$ ke titik $${pt([V[0], V[1]])}$.`), T(`${-V[1]} units and ${-V[1]} units`, `${-V[1]} unit dan ${-V[1]} unit`)],
      ];
      const fw = [
        W(T('All three points have the same $y$-coordinate, so add the horizontal steps:', 'Ketiga-tiga titik mempunyai koordinat-$y$ yang sama, jadi tambah langkah mengufuk:'), `$AC = ${C[0]} - ${bk(A[0])} = ${d1 + d2_}$`),
        W(`$AB = ${B[0]} - ${bk(A[0])} = ${d1}$`, `$BC = ${C[0]} - ${bk(B[0])} = ${d2_}$`, d1 === d2_ ? T('The two lengths are equal.', 'Kedua-dua panjang adalah sama.') : T(`$${Math.max(d1, d2_)} > ${Math.min(d1, d2_)}$, so $${d1 > d2_ ? 'AB' : 'BC'}$ is longer.`, `$${Math.max(d1, d2_)} > ${Math.min(d1, d2_)}$, jadi $${d1 > d2_ ? 'AB' : 'BC'}$ lebih panjang.`)),
        W(`$AB = ${B[0]} - ${bk(A[0])} = ${d1}$, $BC = ${C[0]} - ${bk(B[0])} = ${d2_}$`, d1 === d2_ ? T('The two parts are equal, so $B$ is the midpoint of $AC$.', 'Kedua-dua bahagian adalah sama, jadi $B$ ialah titik tengah $AC$.') : T('The two parts are different, so $B$ is not the midpoint of $AC$.', 'Kedua-dua bahagian berbeza, jadi $B$ bukan titik tengah $AC$.')),
        W(T('Both pairs of points share the same $x$-coordinate, so use the difference of the $y$-coordinates:', 'Setiap pasangan titik berkongsi koordinat-$x$ yang sama, jadi gunakan beza koordinat-$y$:'), `$PQ = |${-V[1]} - 0| = ${-V[1]}$`, `$|${V[1]} - 0| = ${-V[1]}$`, T(`Both distances are ${-V[1]} units: the two points are the same distance above and below the axis.`, `Kedua-dua jarak ialah ${-V[1]} unit: kedua-dua titik berjarak sama di atas dan di bawah paksi.`)),
      ];
      return { q: forms[t][0], a: forms[t][1], w: fw[t], sp: 's' };
    },
  );

  g72a.push((r) => {
    const t = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]), A = [r.int(-7, -1), r.int(-7, -1)], p = t[0], q = t[1], tp = r.int(0, 2);
    const B = [A[0] + p, A[1] + q], C = [B[0] - q, B[1] + p], D = [A[0] - q, A[1] + p], P = [A, B, C, D];
    const diag = dd(A, C);
    if (tp === 0) return { q: T(`$A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ and $D = ${pt(D)}$. By finding the four sides, show that $ABCD$ is a rhombus.`, `$A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ dan $D = ${pt(D)}$. Dengan mencari empat sisi, tunjukkan bahawa $ABCD$ ialah rombus.`), fig: PFm(P, 14, { polys: [{ p: P }] }), a: T(`All four sides are ${t[2]} units.`, `Kesemua empat sisi ialah ${t[2]} unit.`), w: W(T(`Each side spans $${p}$ and $${q}$ in the two directions (in some order).`, `Setiap sisi merentangi $${p}$ dan $${q}$ dalam dua arah (dalam susunan tertentu).`), `$\\sqrt{${p}^2 + ${q}^2} = \\sqrt{${p * p} + ${q * q}} = \\sqrt{${p * p + q * q}} = ${t[2]}$`, T(`All four sides are ${t[2]} units, so $ABCD$ is a rhombus.`, `Kesemua empat sisi ialah ${t[2]} unit, jadi $ABCD$ ialah rombus.`)), sp: 'l' };
    if (tp === 1) return { q: T(`Show that $A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ and $D = ${pt(D)}$ form a square by showing that all four sides and both diagonals are suitable. Give the diagonals correct to 2 decimal places.`, `Tunjukkan bahawa $A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ dan $D = ${pt(D)}$ membentuk sebuah segi empat sama dengan menunjukkan bahawa keempat-empat sisi dan kedua-dua pepenjuru memenuhi syarat. Berikan pepenjuru betul kepada 2 tempat perpuluhan.`), fig: PFm(P, 14, { polys: [{ p: P }] }), a: T(`Sides all ${t[2]}; $AC = BD = ${dp2(diag)}$: equal sides and equal diagonals, so it is a square.`, `Semua sisi ${t[2]}; $AC = BD = ${dp2(diag)}$: sisi sama dan pepenjuru sama, maka ia ialah segi empat sama.`), w: W(`$\\sqrt{${p}^2 + ${q}^2} = \\sqrt{${p * p + q * q}} = ${t[2]}$, so every side is ${t[2]} units.`, `$AC = \\sqrt{${d2(A, C)}} = ${dp2(diag)}$, $BD = \\sqrt{${d2(B, D)}} = ${dp2(dd(B, D))}$`, T('Four equal sides with equal diagonals make a square (equal sides alone would only give a rhombus).', 'Empat sisi sama dengan pepenjuru sama membentuk segi empat sama (sisi sama sahaja hanya memberi rombus).')), sp: 'l' };
    return { q: T(`Find the area of the square $ABCD$ with $A = ${pt(A)}$ and $B = ${pt(B)}$ as adjacent vertices.`, `Cari luas segi empat sama $ABCD$ dengan $A = ${pt(A)}$ dan $B = ${pt(B)}$ sebagai bucu bersebelahan.`), a: T(`${t[2] * t[2]} square units`, `${t[2] * t[2]} unit persegi`), w: T(`$AB^2 = ${p * p + q * q}$`), sp: 'm' };
  });

  g72m.push((r) => {
    const A = [r.int(-8, 8), r.int(-8, 8)], B = [r.int(-8, 8), r.int(-8, 8)];
    need(A[0] !== B[0] && A[1] !== B[1]);
    const dist = dd(A, B), exact = Number.isInteger(dist);
    return { q: T(`Two hikers start together at $${pt(A)}$. One walks to $${pt(B)}$. A GPS reports the straight-line distance walked, rounded to the nearest whole unit. What does the GPS show?`, `Dua pendaki bermula bersama di $${pt(A)}$. Seorang berjalan ke $${pt(B)}$. Satu GPS melaporkan jarak garis lurus yang dilalui, dibundarkan kepada unit bulat terdekat. Apakah yang dipaparkan oleh GPS itu?`), a: T(`${Math.round(dist)} units`, `${Math.round(dist)} unit`), w: T(`$\\sqrt{${d2(A, B)}} = ${dp2(dist)}$`), sp: 's' };
  });
  SPM.extend('F2-7.2', { e: g72e, m: g72m, a: g72a });

  /* ================================================================= 7.3 midpoint */
  const mid2 = (A, B) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const evenPt = (r, lo, hi) => [r.step(lo, hi, 2), r.step(lo, hi, 2)];
  /** the standard midpoint lines for A and B (ends at the midpoint) */
  const midW = (A, B) => {
    const M = mid2(A, B);
    return [T('Use $M = \\left(\\dfrac{x_1 + x_2}{2}, \\dfrac{y_1 + y_2}{2}\\right)$:', 'Gunakan $M = \\left(\\dfrac{x_1 + x_2}{2}, \\dfrac{y_1 + y_2}{2}\\right)$:'),
      `$M = \\left(\\dfrac{${n(A[0])} + ${bk(B[0])}}{2}, \\dfrac{${n(A[1])} + ${bk(B[1])}}{2}\\right) = \\left(\\dfrac{${n(A[0] + B[0])}}{2}, \\dfrac{${n(A[1] + B[1])}}{2}\\right)$`,
      `$= ${pt(M)}$`];
  };
  /** the standard "other endpoint" lines: B = 2M - A */
  const endW = (A, M) => {
    const B = [2 * M[0] - A[0], 2 * M[1] - A[1]];
    return [T('If $M$ is the midpoint then the other endpoint is $2M - A$:', 'Jika $M$ ialah titik tengah maka hujung yang satu lagi ialah $2M - A$:'),
      `$x = 2(${n(M[0])}) - ${bk(A[0])} = ${n(2 * M[0])} - ${bk(A[0])} = ${n(B[0])}$`,
      `$y = 2(${n(M[1])}) - ${bk(A[1])} = ${n(2 * M[1])} - ${bk(A[1])} = ${n(B[1])}$`,
      `$${pt(B)}$`];
  };

  const g73e = [
    /* basic midpoint, positive integers */
    (r) => {
      const A = evenPt(r, 0, 10), B = evenPt(r, 0, 10);
      need(A[0] !== B[0] || A[1] !== B[1]);
      const M = mid2(A, B), stems = [T(`Find the midpoint of $A = ${pt(A)}$ and $B = ${pt(B)}$.`, `Cari titik tengah bagi $A = ${pt(A)}$ dan $B = ${pt(B)}$.`), T(`$P = ${pt(A)}$ and $Q = ${pt(B)}$ are two points. Find the coordinates of the midpoint of $PQ$.`, `$P = ${pt(A)}$ dan $Q = ${pt(B)}$ ialah dua titik. Cari koordinat titik tengah $PQ$.`), T(`Find the coordinates of the point exactly halfway between $${pt(A)}$ and $${pt(B)}$.`, `Cari koordinat titik yang tepat di antara $${pt(A)}$ dan $${pt(B)}$.`)];
      return { q: r.pick(stems), a: T(`$${pt(M)}$`), w: W(...midW(A, B)), sp: 's' };
    },
    /* read from a grid */
    (r) => {
      const A = evenPt(r, 0, 8), B = evenPt(r, 0, 8);
      need(A[0] !== B[0] && A[1] !== B[1]);
      const M = mid2(A, B);
      return { q: T('The diagram shows points $A$ and $B$. Find the coordinates of the midpoint of $AB$.', 'Rajah menunjukkan titik $A$ dan $B$. Cari koordinat titik tengah $AB$.'), fig: PF1([A, B], { segs: [{ a: A, b: B }] }), a: T(`$${pt(M)}$`), w: W(...midW(A, B)), sp: 's' };
    },
    /* formula recall */
    (r) => {
      const opts = ['\\left(\\dfrac{x_1+x_2}{2}, \\dfrac{y_1+y_2}{2}\\right)', '(x_2-x_1, y_2-y_1)', '\\left(\\dfrac{x_1-x_2}{2}, \\dfrac{y_1-y_2}{2}\\right)', '(x_1+x_2, y_1+y_2)'];
      const sh = r.shuffle(opts), i = sh.indexOf(opts[0]);
      const list = sh.map((o, j) => `(${'ABCD'[j]}) $${o}$`).join('&emsp;');
      return { q: T(`Which formula gives the midpoint of $(x_1, y_1)$ and $(x_2, y_2)$? ${list}`, `Formula manakah memberi titik tengah bagi $(x_1, y_1)$ dan $(x_2, y_2)$? ${list}`), a: T(`(${'ABCD'[i]})`), w: W(T('The midpoint is the average of the two $x$-coordinates and the average of the two $y$-coordinates.', 'Titik tengah ialah purata dua koordinat-$x$ dan purata dua koordinat-$y$.'), '$\\left(\\dfrac{x_1+x_2}{2}, \\dfrac{y_1+y_2}{2}\\right)$', T(`That is option (${'ABCD'[i]}); the others subtract instead of adding, or leave out the division by $2$.`, `Itu ialah pilihan (${'ABCD'[i]}); yang lain menolak dan bukan menambah, atau tertinggal pembahagian dengan $2$.`)), sp: 'xs' };
    },
    /* midpoint on an axis */
    (r) => {
      const a = r.step(-8, 8, 2), b = r.step(1, 8, 1), hz = r.chance();
      const A = hz ? [a, b] : [b, a], B = hz ? [a, -b] : [-b, a];
      const M = mid2(A, B);
      return { q: T(`Find the midpoint of $${pt(A)}$ and $${pt(B)}$. What do you notice about its position?`, `Cari titik tengah bagi $${pt(A)}$ dan $${pt(B)}$. Apakah yang anda perhatikan tentang kedudukannya?`), a: T(`$${pt(M)}$; it lies on the ${hz ? '$x$-axis' : '$y$-axis'}`, `$${pt(M)}$; ia terletak pada ${hz ? 'paksi-$x$' : 'paksi-$y$'}`), w: W(...midW(A, B), T(hz ? 'The two $y$-coordinates cancel, so the midpoint lies on the $x$-axis.' : 'The two $x$-coordinates cancel, so the midpoint lies on the $y$-axis.', hz ? 'Kedua-dua koordinat-$y$ saling menghapus, jadi titik tengah terletak pada paksi-$x$.' : 'Kedua-dua koordinat-$x$ saling menghapus, jadi titik tengah terletak pada paksi-$y$.')), sp: 's' };
    },
    /* midpoint with the origin */
    (r) => {
      const A = evenPt(r, -8, 8);
      need(A[0] !== 0 || A[1] !== 0);
      return { q: T(`Find the midpoint of the origin and the point $${pt(A)}$.`, `Cari titik tengah bagi asalan dan titik $${pt(A)}$.`), a: T(`$${pt([A[0] / 2, A[1] / 2])}$`), w: W(T('The origin is $(0, 0)$:', 'Asalan ialah $(0, 0)$:'), ...midW([0, 0], A)), sp: 's' };
    },
    /* halfway on a number-line-style context */
    (r) => {
      const c = r.pick(CTX), it = r.pick(c.it), it2 = r.pick(c.it.filter((x) => x !== it)), A = evenPt(r, -8, 6), B = evenPt(r, -8, 6);
      need(A[0] !== B[0] || A[1] !== B[1]);
      const M = mid2(A, B);
      return { q: T(`${cap1(it[0])} is at $${pt(A)}$ and ${it2[0]} is at $${pt(B)}$, with 1 unit representing 1 ${c.u[0].replace(/s$/, '')}. A new rest point is to be built exactly halfway between them. Find its coordinates.`, `${cap1(it[1])} berada di $${pt(A)}$ dan ${it2[1]} berada di $${pt(B)}$, dengan 1 unit mewakili 1 ${c.u[1]}. Satu tempat rehat baharu akan dibina tepat di antara kedua-duanya. Cari koordinatnya.`), a: T(`$${pt(M)}$`), w: W(T('Exactly halfway means the midpoint:', 'Tepat di tengah-tengah bermakna titik tengah:'), ...midW(A, B)), sp: 's' };
    },
  ];

  const g73m = [
    /* mixed signs and halves */
    (r) => {
      const A = [r.nz(-9, 9), r.nz(-9, 9)], B = [r.nz(-9, 9), r.nz(-9, 9)];
      const M = mid2(A, B);
      return { q: T(`Find the midpoint of $P = ${pt(A)}$ and $Q = ${pt(B)}$.`, `Cari titik tengah bagi $P = ${pt(A)}$ dan $Q = ${pt(B)}$.`), a: T(`$${pt(M)}$`), w: W(...midW(A, B)), sp: 's' };
    },
    /* midpoint of a side of a shape shown on the grid */
    (r) => {
      const A = [r.nz(-7, 7), r.nz(-7, 7)], B = [r.nz(-7, 7), r.nz(-7, 7)];
      need(A[0] !== B[0] && A[1] !== B[1]);
      const M = mid2(A, B);
      return { q: T(`$A = ${pt(A)}$ and $B = ${pt(B)}$ are two vertices of a shape. Find the midpoint of side $AB$.`, `$A = ${pt(A)}$ dan $B = ${pt(B)}$ ialah dua bucu sebuah bentuk. Cari titik tengah sisi $AB$.`), fig: PFm([A, B], 10, { segs: [{ a: A, b: B }] }), a: T(`$${pt(M)}$`), w: W(...midW(A, B)), sp: 's' };
    },
    /* verify a claimed midpoint */
    (r) => {
      const A = [r.nz(-8, 8), r.nz(-8, 8)], B = [r.nz(-8, 8), r.nz(-8, 8)], ok = r.chance();
      const M0 = mid2(A, B), M = ok ? M0 : [M0[0] + r.pick([-1, 1]), M0[1]];
      return { q: T(`A student claims that $${pt(M)}$ is the midpoint of $${pt(A)}$ and $${pt(B)}$. Is this correct?`, `Seorang murid mendakwa bahawa $${pt(M)}$ ialah titik tengah bagi $${pt(A)}$ dan $${pt(B)}$. Adakah ini betul?`), a: ok ? T(`Yes: the midpoint is $${pt(M0)}$.`, `Ya: titik tengahnya ialah $${pt(M0)}$.`) : T(`No: the midpoint is $${pt(M0)}$, not $${pt(M)}$.`, `Tidak: titik tengahnya ialah $${pt(M0)}$, bukan $${pt(M)}$.`), w: W(...midW(A, B), ok ? T(`This is the same as $${pt(M)}$, so the claim is correct.`, `Ini sama dengan $${pt(M)}$, jadi dakwaan itu betul.`) : T(`This is not $${pt(M)}$, so the claim is wrong.`, `Ini bukan $${pt(M)}$, jadi dakwaan itu salah.`)), sp: 's' };
    },
    /* find endpoint given midpoint (reverse) */
    (r) => {
      const A = [r.nz(-6, 6), r.nz(-6, 6)], M = [r.int(-5, 5), r.int(-5, 5)];
      const B = [2 * M[0] - A[0], 2 * M[1] - A[1]];
      return { q: T(`$M = ${pt(M)}$ is the midpoint of $AB$ and $A = ${pt(A)}$. Find the coordinates of $B$.`, `$M = ${pt(M)}$ ialah titik tengah $AB$ dan $A = ${pt(A)}$. Cari koordinat $B$.`), a: T(`$B = ${pt(B)}$`), w: W(...endW(A, M)), sp: 'm' };
    },
    /* midpoint with fractional / decimal coordinates */
    (r) => {
      const A = [r.step(-9, 9, 2), r.nz(-9, 9)], B = [r.step(-9, 9, 2), r.nz(-9, 9)];
      need(A[0] !== B[0] && (A[1] + B[1]) % 2 !== 0);
      const M = mid2(A, B);
      return { q: T(`Find the midpoint of $${pt(A)}$ and $${pt(B)}$.`, `Cari titik tengah bagi $${pt(A)}$ dan $${pt(B)}$.`), a: T(`$\\left(${M[0]}, \\dfrac{${A[1] + B[1]}}{2}\\right)$`), w: W(T('Use $M = \\left(\\dfrac{x_1 + x_2}{2}, \\dfrac{y_1 + y_2}{2}\\right)$:', 'Gunakan $M = \\left(\\dfrac{x_1 + x_2}{2}, \\dfrac{y_1 + y_2}{2}\\right)$:'), `$M = \\left(\\dfrac{${A[0]} + ${bk(B[0])}}{2}, \\dfrac{${A[1]} + ${bk(B[1])}}{2}\\right) = \\left(\\dfrac{${A[0] + B[0]}}{2}, \\dfrac{${A[1] + B[1]}}{2}\\right)$`, `$= \\left(${M[0]}, \\dfrac{${A[1] + B[1]}}{2}\\right)$`, T('The second coordinate is not a whole number, so leave it as a fraction.', 'Koordinat kedua bukan nombor bulat, jadi biarkan ia sebagai pecahan.')), sp: 's' };
    },
    /* three collinear points, middle one */
    (r) => {
      const m = r.pick([1, 2, -1, -2, 0.5]), c = r.int(-3, 3), x0 = r.int(-4, 0), d = r.int(1, 3) * 2;
      const A = [x0, m * x0 + c], C = [x0 + d, m * (x0 + d) + c];
      need(Number.isInteger(A[1]) && Number.isInteger(C[1]));
      const B = mid2(A, C);
      return { q: T(`$B$ is the midpoint of $A = ${pt(A)}$ and $C = ${pt(C)}$. Find the coordinates of $B$ and verify that it also lies on the line through $A$ and $C$.`, `$B$ ialah titik tengah bagi $A = ${pt(A)}$ dan $C = ${pt(C)}$. Cari koordinat $B$ dan sahkan bahawa ia juga terletak pada garis yang melalui $A$ dan $C$.`), a: T(`$B = ${pt(B)}$; it satisfies $y = ${poly([[m, 'x'], [c, '']])}$.`, `$B = ${pt(B)}$; ia memenuhi $y = ${poly([[m, 'x'], [c, '']])}$.`), w: W(...midW(A, C), T(`The line through $A$ and $C$ is $y = ${poly([[m, 'x'], [c, '']])}$. At $x = ${n(B[0])}$ it gives $y = ${n(B[1])}$, the $y$-coordinate of $B$.`, `Garis yang melalui $A$ dan $C$ ialah $y = ${poly([[m, 'x'], [c, '']])}$. Pada $x = ${n(B[0])}$ ia memberi $y = ${n(B[1])}$, iaitu koordinat-$y$ bagi $B$.`)), sp: 'm' };
    },
    /* which of two segments has the given midpoint */
    (r) => {
      const M = [r.int(-4, 4), r.int(-4, 4)], A = [r.nz(-7, 7), r.nz(-7, 7)];
      const B = [2 * M[0] - A[0], 2 * M[1] - A[1]];
      const C = [r.nz(-7, 7), r.nz(-7, 7)], D = [r.nz(-7, 7), r.nz(-7, 7)];
      need(mid2(C, D)[0] !== M[0] || mid2(C, D)[1] !== M[1]);
      const opts = r.shuffle([[A, B], [C, D]]);
      const i = opts.findIndex((p) => p[0] === A);
      return { q: T(`Which of the following segments has midpoint $${pt(M)}$? (${'AB'[0]}) $${pt(opts[0][0])}$ to $${pt(opts[0][1])}$&emsp;(${'AB'[1]}) $${pt(opts[1][0])}$ to $${pt(opts[1][1])}$`, `Segmen manakah yang mempunyai titik tengah $${pt(M)}$? (${'AB'[0]}) $${pt(opts[0][0])}$ ke $${pt(opts[0][1])}$&emsp;(${'AB'[1]}) $${pt(opts[1][0])}$ ke $${pt(opts[1][1])}$`), a: T(`(${'AB'[i]})`), w: W(`$\\left(\\dfrac{${n(opts[0][0][0])} + ${bk(opts[0][1][0])}}{2}, \\dfrac{${n(opts[0][0][1])} + ${bk(opts[0][1][1])}}{2}\\right) = ${pt(mid2(opts[0][0], opts[0][1]))}$`, `$\\left(\\dfrac{${n(opts[1][0][0])} + ${bk(opts[1][1][0])}}{2}, \\dfrac{${n(opts[1][0][1])} + ${bk(opts[1][1][1])}}{2}\\right) = ${pt(mid2(opts[1][0], opts[1][1]))}$`, T(`Only (${'AB'[i]}) has midpoint $${pt(M)}$.`, `Hanya (${'AB'[i]}) mempunyai titik tengah $${pt(M)}$.`)), sp: 's' };
    },
  ];

  const g73a = [
    /* endpoint reverse in a word context */
    (r) => {
      const A = [r.nz(-6, 6), r.nz(-6, 6)], M = [r.int(-5, 5), r.int(-5, 5)], c = r.pick(CTX), it = r.pick(c.it), it2 = r.pick(c.it.filter((x) => x !== it));
      const B = [2 * M[0] - A[0], 2 * M[1] - A[1]];
      return { q: T(`A straight path runs from ${it[0]} at $${pt(A)}$ through a rest point at $${pt(M)}$, which is its midpoint, to ${it2[0]}. Find the coordinates of ${it2[0]}.`, `Satu laluan lurus bermula dari ${it[1]} di $${pt(A)}$ melalui satu tempat rehat di $${pt(M)}$, iaitu titik tengahnya, ke ${it2[1]}. Cari koordinat ${it2[1]}.`), a: T(`$${pt(B)}$`), w: W(...endW(A, M)), sp: 'm' };
    },
    /* parallelogram diagonals bisect each other */
    (r) => {
      const A = [r.int(-6, 0), r.int(-6, 0)], u = [r.int(2, 6), r.int(-2, 2)], v = [r.int(-2, 2), r.int(2, 6)];
      need(u[0] * v[1] - u[1] * v[0] !== 0);
      const B = [A[0] + u[0], A[1] + u[1]], D = [A[0] + v[0], A[1] + v[1]], C = [B[0] + v[0], B[1] + v[1]];
      const M = mid2(A, C);
      const t = r.int(0, 1);
      if (t === 0) return { q: T(`$ABCD$ is a parallelogram with $A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ and $D = ${pt(D)}$. Find the midpoint of diagonal $AC$ and the midpoint of diagonal $BD$. What do you notice?`, `$ABCD$ ialah segi empat selari dengan $A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ dan $D = ${pt(D)}$. Cari titik tengah pepenjuru $AC$ dan titik tengah pepenjuru $BD$. Apakah yang anda perhatikan?`), fig: PFm([A, B, C, D], 14, { polys: [{ p: [A, B, D, C] }] }), a: T(`Both are $${pt(M)}$: the diagonals of a parallelogram bisect each other.`, `Kedua-duanya ialah $${pt(M)}$: pepenjuru segi empat selari saling membahagi dua sama.`), w: W(T('Midpoint of $AC$:', 'Titik tengah $AC$:'), ...midW(A, C).slice(1), T('Midpoint of $BD$:', 'Titik tengah $BD$:'), ...midW(B, D).slice(1), T('The two midpoints are the same, so the diagonals bisect each other.', 'Kedua-dua titik tengah adalah sama, jadi pepenjuru itu saling membahagi dua sama.')), sp: 'm' };
      return { q: T(`Three vertices of a parallelogram $ABCD$ are $A = ${pt(A)}$, $B = ${pt(B)}$ and $D = ${pt(D)}$. Using the fact that the diagonals of a parallelogram bisect each other, find $C$.`, `Tiga bucu segi empat selari $ABCD$ ialah $A = ${pt(A)}$, $B = ${pt(B)}$ dan $D = ${pt(D)}$. Dengan menggunakan fakta bahawa pepenjuru segi empat selari saling membahagi dua sama, cari $C$.`), a: T(`$C = ${pt(C)}$`), w: W(T('The diagonals bisect each other, so $AC$ and $BD$ have the same midpoint $M$:', 'Pepenjuru saling membahagi dua sama, jadi $AC$ dan $BD$ mempunyai titik tengah $M$ yang sama:'), ...midW(B, D).slice(1), T('Then $C = 2M - A$:', 'Kemudian $C = 2M - A$:'), `$x = 2(${n(M[0])}) - ${bk(A[0])} = ${n(C[0])}$`, `$y = 2(${n(M[1])}) - ${bk(A[1])} = ${n(C[1])}$`, `$C = ${pt(C)}$`), sp: 'm' };
    },
    /* circle centre from diameter (extension) */
    (r) => {
      const A = [r.nz(-7, 7), r.nz(-7, 7)], B = [r.nz(-7, 7), r.nz(-7, 7)];
      need(A[0] !== B[0] && A[1] !== B[1]);
      const O = mid2(A, B), rr = dd(A, B) / 2, t = r.int(0, 1);
      if (t === 0) return { q: T(`$AB$ is a diameter of a circle, with $A = ${pt(A)}$ and $B = ${pt(B)}$. Find the coordinates of the centre of the circle.`, `$AB$ ialah diameter sebuah bulatan, dengan $A = ${pt(A)}$ dan $B = ${pt(B)}$. Cari koordinat pusat bulatan itu.`), a: T(`$${pt(O)}$`), w: W(T('The centre of a circle is the midpoint of any diameter:', 'Pusat bulatan ialah titik tengah mana-mana diameter:'), ...midW(A, B).slice(1)), sp: 'm' };
      return { q: T(`$AB$ is a diameter of a circle, with $A = ${pt(A)}$ and $B = ${pt(B)}$. Find the coordinates of the centre and the radius of the circle, correct to 2 decimal places if needed.`, `$AB$ ialah diameter sebuah bulatan, dengan $A = ${pt(A)}$ dan $B = ${pt(B)}$. Cari koordinat pusat dan jejari bulatan itu, betul kepada 2 tempat perpuluhan jika perlu.`), a: T(`Centre $${pt(O)}$; radius ${dp2(rr)} units`, `Pusat $${pt(O)}$; jejari ${dp2(rr)} unit`), w: W(T('The centre is the midpoint of the diameter:', 'Pusat ialah titik tengah diameter:'), ...midW(A, B).slice(1), T('The radius is half the diameter:', 'Jejari ialah separuh diameter:'), ...distW(A, B), `$= ${dp2(dd(A, B))}$`, `$r = ${dp2(dd(A, B))} \\div 2 = ${dp2(rr)}$`), sp: 'l' };
    },
    /* midpoint combined with distance from midpoint to a vertex */
    (r) => {
      const t = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]), A = [r.int(-6, 0), r.int(-6, 0)], B = [A[0] + t[0], A[1] + t[1]];
      const M = mid2(A, B), C = [r.nz(-7, 7), r.nz(-7, 7)];
      need(C[0] !== M[0] && C[1] !== M[1]);
      const dist = dd(M, C), tp = r.int(0, 1);
      if (tp === 0) return { q: T(`$M$ is the midpoint of $A = ${pt(A)}$ and $B = ${pt(B)}$. Find the coordinates of $M$ and the distance from $M$ to $C = ${pt(C)}$, correct to 2 decimal places.`, `$M$ ialah titik tengah bagi $A = ${pt(A)}$ dan $B = ${pt(B)}$. Cari koordinat $M$ dan jarak dari $M$ ke $C = ${pt(C)}$, betul kepada 2 tempat perpuluhan.`), a: T(`$M = ${pt(M)}$; $MC = ${dp2(dist)}$ units`, `$M = ${pt(M)}$; $MC = ${dp2(dist)}$ unit`), w: W(...midW(A, B), ...distW(M, C), T(`$= ${dp2(dist)}$ units`, `$= ${dp2(dist)}$ unit`)), sp: 'l' };
      return { q: T(`In triangle $ABC$, $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C)}$. $M$ is the midpoint of $AB$. Find the length of the median $CM$, correct to 2 decimal places.`, `Dalam segi tiga $ABC$, $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C)}$. $M$ ialah titik tengah $AB$. Cari panjang median $CM$, betul kepada 2 tempat perpuluhan.`), fig: PFm([A, B, C], 12, { polys: [{ p: [A, B, C] }], segs: [{ a: M, b: C, dash: true }] }), a: T(`$M = ${pt(M)}$; $CM = ${dp2(dist)}$ units`, `$M = ${pt(M)}$; $CM = ${dp2(dist)}$ unit`), w: W(T('First find $M$, the midpoint of $AB$:', 'Cari $M$ dahulu, iaitu titik tengah $AB$:'), ...midW(A, B).slice(1), T('Then find $CM$:', 'Kemudian cari $CM$:'), ...distW(M, C), T(`$= ${dp2(dist)}$ units`, `$= ${dp2(dist)}$ unit`)), sp: 'l' };
    },
    /* trapezium / midsegment reasoning */
    (r) => {
      const A = [r.int(-7, -1), r.int(-6, -1)], B = [A[0] + r.int(6, 10), A[1]], h = r.int(2, 5), off = r.int(1, 3);
      const D = [A[0] + off, A[1] + h], C = [B[0] - off - r.int(0, 2), A[1] + h];
      const M1 = mid2(A, D), M2 = mid2(B, C);
      return { q: T(`$ABCD$ is a trapezium with $A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ and $D = ${pt(D)}$, where $AB \\parallel DC$. $M$ and $N$ are the midpoints of $AD$ and $BC$. Find $M$ and $N$, and show that $MN$ is parallel to $AB$ (both have the same $y$-coordinate change... `.slice(0, 0) + `$ABCD$ is a trapezium with $A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ and $D = ${pt(D)}$, where $AB \\parallel DC$. $M$ and $N$ are the midpoints of $AD$ and $BC$ respectively. Find the coordinates of $M$ and $N$.`, `$ABCD$ ialah trapezium dengan $A = ${pt(A)}$, $B = ${pt(B)}$, $C = ${pt(C)}$ dan $D = ${pt(D)}$, dengan $AB \\parallel DC$. $M$ dan $N$ masing-masing ialah titik tengah $AD$ dan $BC$. Cari koordinat $M$ dan $N$.`), fig: PFm([A, B, C, D], 12, { polys: [{ p: [A, B, C, D] }] }), a: T(`$M = ${pt(M1)}$, $N = ${pt(M2)}$`), w: W(`$M = \\left(\\dfrac{${n(A[0])} + ${bk(D[0])}}{2}, \\dfrac{${n(A[1])} + ${bk(D[1])}}{2}\\right) = ${pt(M1)}$`, `$N = \\left(\\dfrac{${n(B[0])} + ${bk(C[0])}}{2}, \\dfrac{${n(B[1])} + ${bk(C[1])}}{2}\\right) = ${pt(M2)}$`, T('$M$ and $N$ have the same $y$-coordinate, so $MN$ is horizontal, parallel to $AB$ and $DC$.', '$M$ dan $N$ mempunyai koordinat-$y$ yang sama, jadi $MN$ mengufuk, selari dengan $AB$ dan $DC$.')), sp: 'm' };
    },
  ];

  g73m.push(
    /* midpoint used with a context (place names) */
    (r) => {
      const c = r.pick(CTX), it = r.pick(c.it), it2 = r.pick(c.it.filter((x) => x !== it)), A = [r.nz(-8, 8), r.nz(-8, 8)], B = [r.nz(-8, 8), r.nz(-8, 8)];
      const M = mid2(A, B);
      return { q: T(`${cap1(it[0])} is at $${pt(A)}$ and ${it2[0]} is at $${pt(B)}$ (1 unit = 1 ${c.u[0].replace(/s$/, '')}). A new signpost is placed exactly midway between them. Find its coordinates.`, `${cap1(it[1])} berada di $${pt(A)}$ dan ${it2[1]} berada di $${pt(B)}$ (1 unit = 1 ${c.u[1]}). Satu papan tanda baharu diletakkan tepat di tengah-tengah antara kedua-duanya. Cari koordinatnya.`), a: T(`$${pt(M)}$`), w: W(T('Exactly midway means the midpoint:', 'Tepat di tengah-tengah bermakna titik tengah:'), ...midW(A, B).slice(1)), sp: 'm' };
    },
    /* midpoint used to find distance from midpoint to origin */
    (r) => {
      const A = [r.nz(-8, 8), r.nz(-8, 8)], B = [r.nz(-8, 8), r.nz(-8, 8)];
      const M = mid2(A, B), dO = Math.sqrt(M[0] ** 2 + M[1] ** 2);
      return { q: T(`Find the midpoint $M$ of $${pt(A)}$ and $${pt(B)}$, and the distance of $M$ from the origin, correct to 2 decimal places.`, `Cari titik tengah $M$ bagi $${pt(A)}$ dan $${pt(B)}$, dan jarak $M$ dari asalan, betul kepada 2 tempat perpuluhan.`), a: T(`$M = ${pt(M)}$; distance ${n(round(dO, 2))} units`, `$M = ${pt(M)}$; jarak ${n(round(dO, 2))} unit`), w: W(...midW(A, B), T('Then find the distance from $M$ to the origin:', 'Kemudian cari jarak dari $M$ ke asalan:'), `$OM = \\sqrt{(${bk(M[0])})^2 + (${bk(M[1])})^2} = \\sqrt{${n(round(M[0] ** 2 + M[1] ** 2, 4))}} = ${n(round(dO, 2))}$`), sp: 'm' };
    },
    /* find the endpoint using an alternative unknown letter and context */
    (r) => {
      const A = [r.nz(-7, 7), r.nz(-7, 7)], M = [r.int(-6, 6), r.int(-6, 6)], t = r.int(0, 1);
      const B = [2 * M[0] - A[0], 2 * M[1] - A[1]];
      if (t === 0) return { q: T(`Given that $${pt(M)}$ is the midpoint of the points $${pt(A)}$ and $(p, q)$, find the values of $p$ and $q$.`, `Diberi $${pt(M)}$ ialah titik tengah bagi titik $${pt(A)}$ dan $(p, q)$, cari nilai $p$ dan $q$.`), a: T(`$p = ${B[0]}$, $q = ${B[1]}$`), w: W(T(`The midpoint formula gives $\\dfrac{${n(A[0])} + p}{2} = ${n(M[0])}$ and $\\dfrac{${n(A[1])} + q}{2} = ${n(M[1])}$.`, `Rumus titik tengah memberi $\\dfrac{${n(A[0])} + p}{2} = ${n(M[0])}$ dan $\\dfrac{${n(A[1])} + q}{2} = ${n(M[1])}$.`), `$p = 2(${n(M[0])}) - ${bk(A[0])} = ${n(B[0])}$`, `$q = 2(${n(M[1])}) - ${bk(A[1])} = ${n(B[1])}$`), sp: 'm' };
      return { q: T(`$N = ${pt(M)}$ is the midpoint of $XY$. If $X = ${pt(A)}$, find the coordinates of $Y$.`, `$N = ${pt(M)}$ ialah titik tengah $XY$. Jika $X = ${pt(A)}$, cari koordinat $Y$.`), a: T(`$Y = ${pt(B)}$`), w: W(...endW(A, M)), sp: 'm' };
    },
    /* spot the error in a midpoint calculation */
    (r) => {
      const A = [r.nz(-8, 8), r.nz(-8, 8)], B = [r.nz(-8, 8), r.nz(-8, 8)];
      const M0 = mid2(A, B), bad = [A[0] - B[0], A[1] - B[1]].map((v) => v / 2);
      need(bad[0] !== M0[0] || bad[1] !== M0[1]);
      return { q: T(`A student finds the midpoint of $${pt(A)}$ and $${pt(B)}$ by calculating $\\left(\\dfrac{${A[0]} - ${B[0]}}{2}, \\dfrac{${A[1]} - ${B[1]}}{2}\\right)$. What mistake was made? Find the correct midpoint.`, `Seorang murid mencari titik tengah bagi $${pt(A)}$ dan $${pt(B)}$ dengan mengira $\\left(\\dfrac{${A[0]} - ${B[0]}}{2}, \\dfrac{${A[1]} - ${B[1]}}{2}\\right)$. Apakah kesilapannya? Cari titik tengah yang betul.`), a: T(`The coordinates should be added, not subtracted. Correct: $${pt(M0)}$.`, `Koordinat patut ditambah, bukan ditolak. Betul: $${pt(M0)}$.`), w: W(T('The midpoint formula adds the coordinates; subtracting gives half the difference instead.', 'Rumus titik tengah menambah koordinat; menolak memberi separuh beza sebaliknya.'), ...midW(A, B).slice(1)), sp: 'm' };
    },
    /* midpoint of a diagonal of a square/rectangle shown on the grid */
    (r) => {
      const x = r.int(-7, 0), y = r.int(-7, 0), w = r.int(2, 7), h = r.int(2, 7);
      const P = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      const M = mid2(P[0], P[2]);
      return { q: T(`A rectangle has vertices ${P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', ')}. Find the midpoint of the diagonal $AC$.`, `Sebuah segi empat tepat mempunyai bucu ${P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', ')}. Cari titik tengah pepenjuru $AC$.`), fig: PFm(P, 10, { polys: [{ p: P }], segs: [{ a: P[0], b: P[2], dash: true }] }), a: T(`$${pt(M)}$`), w: W(T(`The diagonal joins $A = ${pt(P[0])}$ and $C = ${pt(P[2])}$:`, `Pepenjuru itu menyambung $A = ${pt(P[0])}$ dan $C = ${pt(P[2])}$:`), ...midW(P[0], P[2]).slice(1)), sp: 'm' };
    },
  );

  g73e.push(
    (r) => {
      const A = evenPt(r, -8, 8), d = r.int(2, 8) * 2, hz = r.chance();
      const B = hz ? [A[0] + d, A[1]] : [A[0], A[1] + d];
      const M = mid2(A, B);
      return { q: T(`$A = ${pt(A)}$ and $B = ${pt(B)}$ lie on a ${hz ? 'horizontal' : 'vertical'} line. Find the midpoint of $AB$ without using the midpoint formula, just by looking at the two points.`, `$A = ${pt(A)}$ dan $B = ${pt(B)}$ terletak pada satu garis ${hz ? 'mengufuk' : 'mencancang'}. Cari titik tengah $AB$ tanpa menggunakan formula titik tengah, hanya dengan melihat kedua-dua titik.`), a: T(`$${pt(M)}$`), w: W(T(hz ? 'The $y$-coordinates are the same, so only the $x$-coordinate has to be halved:' : 'The $x$-coordinates are the same, so only the $y$-coordinate has to be halved:', hz ? 'Koordinat-$y$ adalah sama, jadi hanya koordinat-$x$ perlu dicari nilai tengahnya:' : 'Koordinat-$x$ adalah sama, jadi hanya koordinat-$y$ perlu dicari nilai tengahnya:'), hz ? `$\\dfrac{${n(A[0])} + ${bk(B[0])}}{2} = ${n(M[0])}$` : `$\\dfrac{${n(A[1])} + ${bk(B[1])}}{2} = ${n(M[1])}$`, `$${pt(M)}$`), sp: 's' };
    },
  );

  g73a.push(
    /* circle centre used to find another diameter's endpoint */
    (r) => {
      const A = [r.nz(-7, 7), r.nz(-7, 7)], B = [r.nz(-7, 7), r.nz(-7, 7)];
      need(A[0] !== B[0] && A[1] !== B[1]);
      const O = mid2(A, B), C = [r.nz(-7, 7), r.nz(-7, 7)];
      need(C[0] !== A[0] || C[1] !== A[1]);
      const D = [2 * O[0] - C[0], 2 * O[1] - C[1]];
      return { q: T(`$AB$ is a diameter of a circle with $A = ${pt(A)}$ and $B = ${pt(B)}$. Another diameter is $CD$, where $C = ${pt(C)}$. Find the centre of the circle and the coordinates of $D$.`, `$AB$ ialah diameter sebuah bulatan dengan $A = ${pt(A)}$ dan $B = ${pt(B)}$. Diameter lain ialah $CD$, dengan $C = ${pt(C)}$. Cari pusat bulatan itu dan koordinat $D$.`), a: T(`Centre $${pt(O)}$; $D = ${pt(D)}$`, `Pusat $${pt(O)}$; $D = ${pt(D)}$`), w: W(T('The centre is the midpoint of the diameter $AB$:', 'Pusat ialah titik tengah diameter $AB$:'), ...midW(A, B).slice(1), T('Every diameter has the same midpoint, so $D = 2O - C$:', 'Setiap diameter mempunyai titik tengah yang sama, jadi $D = 2O - C$:'), `$x = 2(${n(O[0])}) - ${bk(C[0])} = ${n(D[0])}$`, `$y = 2(${n(O[1])}) - ${bk(C[1])} = ${n(D[1])}$`, `$D = ${pt(D)}$`), sp: 'l' };
    },
  );

  g73e.push(
    (r) => {
      const A = evenPt(r, 0, 10), M = evenPt(r, 0, 10);
      need(A[0] !== M[0] || A[1] !== M[1]);
      const B = [2 * M[0] - A[0], 2 * M[1] - A[1]];
      need(B[0] >= 0 && B[1] >= 0 && B[0] <= 12 && B[1] <= 12);
      return { q: T(`$M = ${pt(M)}$ is the midpoint of $A = ${pt(A)}$ and $B$. Find $B$.`, `$M = ${pt(M)}$ ialah titik tengah bagi $A = ${pt(A)}$ dan $B$. Cari $B$.`), a: T(`$B = ${pt(B)}$`), w: W(...endW(A, M)), sp: 's' };
    },
  );
  g73m.push(
    (r) => {
      const A = [r.nz(-8, 8), r.nz(-8, 8)], B = [r.nz(-8, 8), r.nz(-8, 8)];
      need(A[0] !== B[0] && A[1] !== B[1]);
      const M = mid2(A, B), opts = r.shuffle([M, [M[0] + 1, M[1]], [M[0], M[1] + 1], [(A[0] + B[0]), (A[1] + B[1])]]);
      need(new Set(opts.map(pt)).size === 4);
      const i = opts.findIndex((o) => o === M);
      return { q: T(`Which of the following is the midpoint of $${pt(A)}$ and $${pt(B)}$? ${opts.map((o, j) => `(${'ABCD'[j]}) $${pt(o)}$`).join('&emsp;')}`, `Antara berikut, yang manakah titik tengah bagi $${pt(A)}$ dan $${pt(B)}$? ${opts.map((o, j) => `(${'ABCD'[j]}) $${pt(o)}$`).join('&emsp;')}`), a: T(`(${'ABCD'[i]})`), w: W(...midW(A, B), T(`That is option (${'ABCD'[i]}).`, `Itu ialah pilihan (${'ABCD'[i]}).`)), sp: 'xs' };
    },
  );

  g73m.push(
    (r) => {
      const t = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]), A = [r.int(-6, 0), r.int(-6, 0)], B = [A[0] + t[0], A[1] + t[1]];
      const M = mid2(A, B), dist = t[2] / 2;
      return { q: T(`Find the midpoint $M$ of $A = ${pt(A)}$ and $B = ${pt(B)}$, and show that $AM = MB$ by finding both lengths.`, `Cari titik tengah $M$ bagi $A = ${pt(A)}$ dan $B = ${pt(B)}$, dan tunjukkan bahawa $AM = MB$ dengan mencari kedua-dua panjang.`), a: T(`$M = ${pt(M)}$; $AM = MB = ${n(dist)}$ units`, `$M = ${pt(M)}$; $AM = MB = ${n(dist)}$ unit`), w: W(...midW(A, B), `$AM = \\sqrt{${n(d2(A, M))}} = ${n(dist)}$`, `$MB = \\sqrt{${n(d2(M, B))}} = ${n(dist)}$`, T('The two halves are equal, as they must be for a midpoint.', 'Kedua-dua bahagian adalah sama, sebagaimana yang sepatutnya bagi titik tengah.')), sp: 'm' };
    },
  );

  g73e.push(
    (r) => {
      const A = evenPt(r, -8, 8), B = evenPt(r, -8, 8);
      need(A[0] !== B[0] || A[1] !== B[1]);
      const M = mid2(A, B);
      return { q: T(`Two friends start at $${pt(A)}$ and $${pt(B)}$ and walk towards each other at the same speed. At which point do they meet?`, `Dua orang kawan bermula di $${pt(A)}$ dan $${pt(B)}$ dan berjalan ke arah satu sama lain dengan kelajuan yang sama. Di titik manakah mereka bertemu?`), a: T(`$${pt(M)}$`), w: W(T('Walking at the same speed, they cover the same distance, so they meet at the midpoint:', 'Berjalan pada kelajuan yang sama, mereka melalui jarak yang sama, jadi mereka bertemu di titik tengah:'), ...midW(A, B).slice(1)), sp: 's' };
    },
  );
  g73a.push(
    (r) => {
      const A = [r.nz(-7, 7), r.nz(-7, 7)], B = [r.nz(-7, 7), r.nz(-7, 7)], C = [r.nz(-7, 7), r.nz(-7, 7)];
      need(A[0] !== B[0] && A[1] !== B[1] && B[0] !== C[0] && B[1] !== C[1] && A[0] !== C[0] && A[1] !== C[1]);
      const M1 = mid2(A, B), M2 = mid2(B, C);
      return { q: T(`$P$ and $Q$ are the midpoints of $AB$ and $BC$ respectively, where $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C)}$. Find the coordinates of $P$ and $Q$, and the length of $PQ$, correct to 2 decimal places.`, `$P$ dan $Q$ masing-masing ialah titik tengah $AB$ dan $BC$, dengan $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C)}$. Cari koordinat $P$ dan $Q$, dan panjang $PQ$, betul kepada 2 tempat perpuluhan.`), fig: PFm([A, B, C], 12, { polys: [{ p: [A, B, C] }] }), a: T(`$P = ${pt(M1)}$, $Q = ${pt(M2)}$; $PQ = ${dp2(dd(M1, M2))}$ units`, `$P = ${pt(M1)}$, $Q = ${pt(M2)}$; $PQ = ${dp2(dd(M1, M2))}$ unit`), w: W(`$P = \\left(\\dfrac{${n(A[0])} + ${bk(B[0])}}{2}, \\dfrac{${n(A[1])} + ${bk(B[1])}}{2}\\right) = ${pt(M1)}$`, `$Q = \\left(\\dfrac{${n(B[0])} + ${bk(C[0])}}{2}, \\dfrac{${n(B[1])} + ${bk(C[1])}}{2}\\right) = ${pt(M2)}$`, ...distW(M1, M2), T(`$= ${dp2(dd(M1, M2))}$ units`, `$= ${dp2(dd(M1, M2))}$ unit`)), sp: 'l' };
    },
  );

  g73m.push(
    (r) => {
      const A = [r.nz(-8, 8), r.nz(-8, 8)], B = [r.nz(-8, 8), r.nz(-8, 8)];
      need(A[0] !== B[0] && A[1] !== B[1]);
      const M = mid2(A, B), qd = QD(...M);
      return { q: T(`Find the midpoint of $A = ${pt(A)}$ and $B = ${pt(B)}$ and state the quadrant in which it lies.`, `Cari titik tengah bagi $A = ${pt(A)}$ dan $B = ${pt(B)}$ dan nyatakan sukuan tempat ia terletak.`), a: T(`$${pt(M)}$; quadrant ${QR[qd] || 'none (on an axis)'}`, `$${pt(M)}$; sukuan ${QR[qd] || 'tiada (pada paksi)'}`), w: W(...midW(A, B), qd ? T(`The signs of $${pt(M)}$ put it in quadrant ${QR[qd]}.`, `Tanda bagi $${pt(M)}$ meletakkannya dalam sukuan ${QR[qd]}.`) : T(`One coordinate of $${pt(M)}$ is $0$, so it lies on an axis and not in any quadrant.`, `Satu koordinat bagi $${pt(M)}$ ialah $0$, jadi ia terletak pada paksi dan bukan dalam mana-mana sukuan.`)), sp: 'm' };
    },
  );

  g73a.push(
    (r) => {
      const M = [r.int(-6, 6), r.int(-6, 6)], Q = [r.nz(-7, 7), r.nz(-7, 7)];
      const P = [2 * M[0] - Q[0], 2 * M[1] - Q[1]];
      const per = r.pick(['weeks', 'minggu']);
      return { q: T(`A straight road connects two towns $P$ and $Q$. A rest stop $R = ${pt(M)}$ is exactly midway. If $Q = ${pt(Q)}$, find the coordinates of $P$.`, `Satu jalan lurus menghubungkan dua bandar $P$ dan $Q$. Satu tempat rehat $R = ${pt(M)}$ berada tepat di tengah-tengah. Jika $Q = ${pt(Q)}$, cari koordinat $P$.`), a: T(`$P = ${pt(P)}$`), w: W(...endW(Q, M)), sp: 'm' };
    },
  );

  g73e.push(
    (r) => {
      const a = r.step(-8, 8, 2), b = r.step(-8, 8, 2);
      need(a !== 0 || b !== 0);
      const A = [a, b], B = [-a, -b];
      return { q: T(`$A = ${pt(A)}$ and $B = ${pt(B)}$. Find the midpoint of $AB$ and identify it by name.`, `$A = ${pt(A)}$ dan $B = ${pt(B)}$. Cari titik tengah $AB$ dan namakannya.`), a: T('$(0, 0)$, the origin', '$(0, 0)$, asalan'), w: W(...midW(A, B), T('The two points are opposite each other about $(0, 0)$, so the midpoint is the origin.', 'Kedua-dua titik bertentangan antara satu sama lain terhadap $(0, 0)$, jadi titik tengahnya ialah asalan.')), sp: 's' };
    },
  );

  g73m.push(
    (r) => {
      const A = [r.nz(-8, 8), r.nz(-8, 8)], B = [r.nz(-8, 8), r.nz(-8, 8)];
      need(A[0] !== B[0] && A[1] !== B[1]);
      const M = mid2(A, B);
      return { q: T(`Two roads meet the coordinate grid at $A = ${pt(A)}$ and $B = ${pt(B)}$. A bridge is to be built at the midpoint of $AB$. State the coordinates where the bridge should be built.`, `Dua jalan bertemu grid koordinat di $A = ${pt(A)}$ dan $B = ${pt(B)}$. Sebuah jambatan akan dibina di titik tengah $AB$. Nyatakan koordinat tempat jambatan itu patut dibina.`), a: T(`$${pt(M)}$`), w: W(...midW(A, B)), sp: 'm' };
    },
  );

  g73a.push(
    (r) => {
      const A = [r.nz(-7, 7), r.nz(-7, 7)], B = [r.nz(-7, 7), r.nz(-7, 7)];
      need(A[0] !== B[0] && A[1] !== B[1]);
      const M = mid2(A, B);
      const dAB = dd(A, B), dMto = dd(M, A);
      return { q: T(`$M$ is the midpoint of $A = ${pt(A)}$ and $B = ${pt(B)}$. Find $M$, then find $AM$ and $AB$, and verify that $AM = \\dfrac12 AB$ (correct to 2 decimal places if needed).`, `$M$ ialah titik tengah bagi $A = ${pt(A)}$ dan $B = ${pt(B)}$. Cari $M$, kemudian cari $AM$ dan $AB$, dan sahkan bahawa $AM = \\dfrac12 AB$ (betul kepada 2 tempat perpuluhan jika perlu).`), a: T(`$M = ${pt(M)}$; $AM = ${dp2(dMto)}$, $AB = ${dp2(dAB)}$, and $AM = \\dfrac12 AB$.`, `$M = ${pt(M)}$; $AM = ${dp2(dMto)}$, $AB = ${dp2(dAB)}$, dan $AM = \\dfrac12 AB$.`), w: W(...midW(A, B), `$AM = \\sqrt{${n(round(d2(A, M), 4))}} = ${dp2(dMto)}$`, `$AB = \\sqrt{${n(d2(A, B))}} = ${dp2(dAB)}$`, `$\\dfrac{1}{2} \\times ${dp2(dAB)} = ${dp2(dAB / 2)}$`, T('This is $AM$, so the midpoint really does halve the segment.', 'Ini ialah $AM$, jadi titik tengah memang membahagi dua tembereng itu.')), sp: 'l' };
    },
  );

  g73e.push(
    (r) => {
      const A = evenPt(r, 0, 12), B = evenPt(r, 0, 12), tp = r.int(0, 1);
      need(A[0] !== B[0] || A[1] !== B[1]);
      const M = mid2(A, B);
      return { q: tp === 0 ? T(`Given the points $A = ${pt(A)}$ and $B = ${pt(B)}$, calculate $\\dfrac{x_1+x_2}{2}$ and $\\dfrac{y_1+y_2}{2}$, and hence write down the midpoint of $AB$.`, `Diberi titik $A = ${pt(A)}$ dan $B = ${pt(B)}$, kira $\\dfrac{x_1+x_2}{2}$ dan $\\dfrac{y_1+y_2}{2}$, dan seterusnya tuliskan titik tengah $AB$.`) : T(`Add the $x$-coordinates of $A = ${pt(A)}$ and $B = ${pt(B)}$ and divide by 2; do the same for the $y$-coordinates. What point have you found?`, `Tambah koordinat-$x$ bagi $A = ${pt(A)}$ dan $B = ${pt(B)}$ dan bahagi dengan 2; buat perkara yang sama untuk koordinat-$y$. Apakah titik yang anda perolehi?`), a: T(`$${pt(M)}$, the midpoint of $AB$`, `$${pt(M)}$, titik tengah $AB$`), w: W(`$\\dfrac{${n(A[0])} + ${bk(B[0])}}{2} = \\dfrac{${n(A[0] + B[0])}}{2} = ${n(M[0])}$`, `$\\dfrac{${n(A[1])} + ${bk(B[1])}}{2} = \\dfrac{${n(A[1] + B[1])}}{2} = ${n(M[1])}$`, T(`The two answers are the coordinates of the midpoint: $${pt(M)}$.`, `Kedua-dua jawapan itu ialah koordinat titik tengah: $${pt(M)}$.`)), sp: 's' };
    },
  );

  g73m.push(
    (r) => {
      const A = [r.nz(-8, 8), r.nz(-8, 8)], B = [r.nz(-8, 8), r.nz(-8, 8)];
      need(A[0] !== B[0] && A[1] !== B[1]);
      const M = mid2(A, B);
      return { q: T(`A surveyor marks two points $A = ${pt(A)}$ and $B = ${pt(B)}$ on a plan. A stake is to be placed at the midpoint of $AB$. Find where the stake should go.`, `Seorang juruukur menandakan dua titik $A = ${pt(A)}$ dan $B = ${pt(B)}$ pada satu pelan. Sebatang pancang akan diletakkan di titik tengah $AB$. Cari kedudukan pancang itu.`), a: T(`$${pt(M)}$`), w: W(...midW(A, B)), sp: 'm' };
    },
  );
  SPM.extend('F2-7.3', { e: g73e, m: g73m, a: g73a });

  /* ================================================================= 7.x coordinates */
  const pt = (p) => `(${n(p[0])}, ${n(p[1])})`;
  const QD = (x, y) => (x > 0 && y > 0 ? 1 : x < 0 && y > 0 ? 2 : x < 0 && y < 0 ? 3 : x > 0 && y < 0 ? 4 : 0);
  const QR = ['', 'I', 'II', 'III', 'IV'];
  const qtxt = (p) => (p[0] === 0 && p[1] === 0 ? T('the origin', 'asalan') : p[1] === 0 ? T('on the $x$-axis', 'pada paksi-$x$') : p[0] === 0 ? T('on the $y$-axis', 'pada paksi-$y$') : T(`in quadrant ${QR[QD(p[0], p[1])]}`, `dalam sukuan ${QR[QD(p[0], p[1])]}`));
  const LET = 'ABCDEFGH';
  const PF = (pts, o) => S.plane(Object.assign({ x: [-6, 6], y: [-6, 6], scale: 20, pts: pts.map((p, i) => ({ x: p[0], y: p[1], l: LET[i] })) }, o || {}));
  const PF1 = (pts, o) => PF(pts, Object.assign({ x: [0, 9], y: [0, 9], scale: 24 }, o || {}));
  const jn = (a, l) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + (l ? ' dan ' : ' and ') + a[a.length - 1]);
  const distinctPts = (r, k, lo, hi) => {
    const P = [];
    while (P.length < k) { const p = [r.int(lo, hi), r.int(lo, hi)]; if (!P.some((q) => q[0] === p[0] || q[1] === p[1])) P.push(p); }
    return P;
  };
  const listAns = (P) => T(P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', '));

  const g71e = [
    /* read points on a first-quadrant grid */
    (r) => {
      const k = r.int(1, 3), P = distinctPts(r, k, 1, 8);
      const stems = [T('Write down the coordinates of the points marked on the grid.', 'Tuliskan koordinat titik yang ditandakan pada grid.'), T('State the coordinates of each point shown in the diagram.', 'Nyatakan koordinat bagi setiap titik yang ditunjukkan dalam rajah.'), T('Read from the graph the $x$-coordinate and the $y$-coordinate of each marked point.', 'Baca daripada graf koordinat-$x$ dan koordinat-$y$ bagi setiap titik yang ditandakan.')];
      return { q: r.pick(stems), fig: PF1(P), a: listAns(P), w: W(T('For each point read how far across (the $x$-coordinate), then how far up (the $y$-coordinate):', 'Bagi setiap titik baca berapa jauh merentas (koordinat-$x$), kemudian berapa jauh ke atas (koordinat-$y$):'), T(P.map((q2, i) => `$${LET[i]}$: ${q2[0]} across, ${q2[1]} up, so $${LET[i]} = ${pt(q2)}$`).join('; '), P.map((q2, i) => `$${LET[i]}$: ${q2[0]} merentas, ${q2[1]} ke atas, jadi $${LET[i]} = ${pt(q2)}$`).join('; '))), sp: 's' };
    },
    /* distance from the axes */
    (r) => {
      const p = [r.int(1, 9), r.int(1, 9)], t = r.int(0, 2);
      need(p[0] !== p[1]);
      if (t === 0) return { q: T(`The point $P = ${pt(p)}$ is plotted on a Cartesian plane. How many units is $P$ from the $y$-axis?`, `Titik $P = ${pt(p)}$ diplot pada satah Cartes. Berapakah jarak $P$ dari paksi-$y$?`), a: T(`${p[0]} units`, `${p[0]} unit`), w: W(T('The distance from the $y$-axis is the $x$-coordinate:', 'Jarak dari paksi-$y$ ialah koordinat-$x$:'), `$${p[0]}$`), sp: 'xs' };
      if (t === 1) return { q: T(`How many units is the point $${pt(p)}$ above the $x$-axis?`, `Berapakah unit titik $${pt(p)}$ berada di atas paksi-$x$?`), a: T(`${p[1]} units`, `${p[1]} unit`), w: W(T('The height above the $x$-axis is the $y$-coordinate:', 'Ketinggian di atas paksi-$x$ ialah koordinat-$y$:'), `$${p[1]}$`), sp: 'xs' };
      return { q: T(`For the point $${pt(p)}$, state (a) the $x$-coordinate, (b) the $y$-coordinate, and say which one is measured along the horizontal axis.`, `Bagi titik $${pt(p)}$, nyatakan (a) koordinat-$x$, (b) koordinat-$y$, dan nyatakan yang mana diukur di sepanjang paksi mengufuk.`), a: T(`(a) ${p[0]} (b) ${p[1]}; the $x$-coordinate`, `(a) ${p[0]} (b) ${p[1]}; koordinat-$x$`), w: W(T(`In $${pt(p)}$ the first number is the $x$-coordinate and the second is the $y$-coordinate.`, `Dalam $${pt(p)}$ nombor pertama ialah koordinat-$x$ dan yang kedua ialah koordinat-$y$.`), T(`So $x = ${p[0]}$ and $y = ${p[1]}$; the $x$-coordinate is the one measured along the horizontal axis.`, `Jadi $x = ${p[0]}$ dan $y = ${p[1]}$; koordinat-$x$ ialah yang diukur di sepanjang paksi mengufuk.`)), sp: 's' };
    },
    /* moving from the origin */
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), t = r.int(0, 3);
      const forms = [
        [T(`Starting at the origin, move ${a} units to the right and then ${b} units up. State the coordinates of the point reached.`, `Bermula dari asalan, bergerak ${a} unit ke kanan dan kemudian ${b} unit ke atas. Nyatakan koordinat titik yang dicapai.`)],
        [T(`A point is ${b} units above the $x$-axis and ${a} units to the right of the $y$-axis. Write down its coordinates.`, `Satu titik berada ${b} unit di atas paksi-$x$ dan ${a} unit di sebelah kanan paksi-$y$. Tuliskan koordinatnya.`)],
        [T(`On a map, the school gate is at the origin. The library is ${a} blocks east and ${b} blocks north of the gate. Write down the coordinates of the library.`, `Pada satu peta, pintu sekolah berada di asalan. Perpustakaan terletak ${a} blok ke timur dan ${b} blok ke utara dari pintu itu. Tuliskan koordinat perpustakaan.`)],
        [T(`In a game, a treasure is buried ${b} steps north and ${a} steps east of the starting flag, which is at $(0, 0)$. Give the coordinates of the treasure.`, `Dalam satu permainan, harta karun ditanam ${b} langkah ke utara dan ${a} langkah ke timur dari bendera permulaan yang berada di $(0, 0)$. Berikan koordinat harta karun itu.`)],
      ];
      return { q: forms[t][0], a: T(`$${pt([a, b])}$`), w: W(T(`Counting from $(0, 0)$: the first number moves along the $x$-axis and the second along the $y$-axis, so $x = ${a}$ and $y = ${b}$.`, `Mengira dari $(0, 0)$: nombor pertama bergerak di sepanjang paksi-$x$ dan yang kedua di sepanjang paksi-$y$, jadi $x = ${a}$ dan $y = ${b}$.`), `$${pt([a, b])}$`), sp: 'xs' };
    },
    /* axes and origin */
    (r) => {
      const k = r.int(2, 9), t = r.int(0, 5);
      const forms = [
        [T(`On which axis does the point $(0, ${k})$ lie?`, `Pada paksi manakah titik $(0, ${k})$ terletak?`), T('The $y$-axis', 'Paksi-$y$')],
        [T(`On which axis does the point $(${k}, 0)$ lie?`, `Pada paksi manakah titik $(${k}, 0)$ terletak?`), T('The $x$-axis', 'Paksi-$x$')],
        [T('What are the coordinates of the origin?', 'Apakah koordinat asalan?'), T('$(0, 0)$')],
        [T(`A point lies on the $x$-axis and is ${k} units from the origin (to the right). Write down its coordinates.`, `Satu titik terletak pada paksi-$x$ dan berjarak ${k} unit dari asalan (ke kanan). Tuliskan koordinatnya.`), T(`$(${k}, 0)$`)],
        [T(`A point lies on the $y$-axis and is ${k} units above the origin. Write down its coordinates.`, `Satu titik terletak pada paksi-$y$ dan berada ${k} unit di atas asalan. Tuliskan koordinatnya.`), T(`$(0, ${k})$`)],
        [T('What is the $y$-coordinate of every point on the $x$-axis?', 'Apakah koordinat-$y$ bagi setiap titik pada paksi-$x$?'), T('$0$')],
      ];
      const fw = [
        T('A point $(0, k)$ has $x = 0$, and every point with $x = 0$ lies on the $y$-axis.', 'Titik $(0, k)$ mempunyai $x = 0$, dan setiap titik dengan $x = 0$ terletak pada paksi-$y$.'),
        T('A point $(k, 0)$ has $y = 0$, and every point with $y = 0$ lies on the $x$-axis.', 'Titik $(k, 0)$ mempunyai $y = 0$, dan setiap titik dengan $y = 0$ terletak pada paksi-$x$.'),
        T('The origin is where the two axes cross, so both coordinates are $0$.', 'Asalan ialah tempat kedua-dua paksi bersilang, jadi kedua-dua koordinatnya $0$.'),
        T(`On the $x$-axis the $y$-coordinate is $0$, and ${k} units to the right gives $x = ${k}$.`, `Pada paksi-$x$ koordinat-$y$ ialah $0$, dan ${k} unit ke kanan memberi $x = ${k}$.`),
        T(`On the $y$-axis the $x$-coordinate is $0$, and ${k} units above the origin gives $y = ${k}$.`, `Pada paksi-$y$ koordinat-$x$ ialah $0$, dan ${k} unit di atas asalan memberi $y = ${k}$.`),
        T('A point on the $x$-axis is neither above nor below it, so its $y$-coordinate is $0$.', 'Titik pada paksi-$x$ tidak berada di atas atau di bawahnya, jadi koordinat-$y$nya ialah $0$.'),
      ];
      return { q: forms[t][0], a: forms[t][1], w: W(fw[t]), sp: 'xs' };
    },
    /* compare two points */
    (r) => {
      const P = distinctPts(r, 2, 1, 9), t = r.int(0, 3);
      const forms = [
        [T(`Which of the points $${pt(P[0])}$ and $${pt(P[1])}$ is further to the right?`, `Antara titik $${pt(P[0])}$ dan $${pt(P[1])}$, yang manakah lebih ke kanan?`), P[0][0] > P[1][0] ? P[0] : P[1]],
        [T(`Which of the points $${pt(P[0])}$ and $${pt(P[1])}$ is higher above the $x$-axis?`, `Antara titik $${pt(P[0])}$ dan $${pt(P[1])}$, yang manakah lebih tinggi di atas paksi-$x$?`), P[0][1] > P[1][1] ? P[0] : P[1]],
        [T(`Which of the points $${pt(P[0])}$ and $${pt(P[1])}$ is nearer to the $y$-axis?`, `Antara titik $${pt(P[0])}$ dan $${pt(P[1])}$, yang manakah lebih dekat dengan paksi-$y$?`), P[0][0] < P[1][0] ? P[0] : P[1]],
        [T(`Which of the points $${pt(P[0])}$ and $${pt(P[1])}$ is nearer to the $x$-axis?`, `Antara titik $${pt(P[0])}$ dan $${pt(P[1])}$, yang manakah lebih dekat dengan paksi-$x$?`), P[0][1] < P[1][1] ? P[0] : P[1]],
      ];
      const cw = [
        T(`The $x$-coordinates are $${P[0][0]}$ and $${P[1][0]}$; further right means the larger $x$, which is $${Math.max(P[0][0], P[1][0])}$.`, `Koordinat-$x$ ialah $${P[0][0]}$ dan $${P[1][0]}$; lebih ke kanan bermakna $x$ yang lebih besar, iaitu $${Math.max(P[0][0], P[1][0])}$.`),
        T(`The $y$-coordinates are $${P[0][1]}$ and $${P[1][1]}$; higher means the larger $y$, which is $${Math.max(P[0][1], P[1][1])}$.`, `Koordinat-$y$ ialah $${P[0][1]}$ dan $${P[1][1]}$; lebih tinggi bermakna $y$ yang lebih besar, iaitu $${Math.max(P[0][1], P[1][1])}$.`),
        T(`The distance from the $y$-axis is the $x$-coordinate; the smaller of $${P[0][0]}$ and $${P[1][0]}$ is $${Math.min(P[0][0], P[1][0])}$.`, `Jarak dari paksi-$y$ ialah koordinat-$x$; yang lebih kecil antara $${P[0][0]}$ dan $${P[1][0]}$ ialah $${Math.min(P[0][0], P[1][0])}$.`),
        T(`The distance from the $x$-axis is the $y$-coordinate; the smaller of $${P[0][1]}$ and $${P[1][1]}$ is $${Math.min(P[0][1], P[1][1])}$.`, `Jarak dari paksi-$x$ ialah koordinat-$y$; yang lebih kecil antara $${P[0][1]}$ dan $${P[1][1]}$ ialah $${Math.min(P[0][1], P[1][1])}$.`),
      ];
      return { q: forms[t][0], a: T(`$${pt(forms[t][1])}$`), w: W(cw[t], `$${pt(forms[t][1])}$`), sp: 'xs' };
    },
    /* same x or same y */
    (r) => {
      const a = r.int(1, 8), b = r.int(1, 8), c = r.int(1, 8), d = r.int(1, 8), t = r.int(0, 2);
      need(b !== d && a !== c);
      if (t === 0) return { q: T(`The points $A = ${pt([a, b])}$ and $B = ${pt([a, d])}$ have the same $x$-coordinate. Is the line $AB$ horizontal or vertical?`, `Titik $A = ${pt([a, b])}$ dan $B = ${pt([a, d])}$ mempunyai koordinat-$x$ yang sama. Adakah garis $AB$ mengufuk atau mencancang?`), a: T('Vertical', 'Mencancang'), w: W(T(`Both points are at $x = ${a}$, so one is directly above the other.`, `Kedua-dua titik berada pada $x = ${a}$, jadi satu berada tepat di atas yang lain.`), T('A line joining them is therefore vertical.', 'Oleh itu garis yang menyambungkannya adalah mencancang.')), sp: 'xs' };
      if (t === 1) return { q: T(`The points $C = ${pt([a, b])}$ and $D = ${pt([c, b])}$ have the same $y$-coordinate. Is the line $CD$ horizontal or vertical?`, `Titik $C = ${pt([a, b])}$ dan $D = ${pt([c, b])}$ mempunyai koordinat-$y$ yang sama. Adakah garis $CD$ mengufuk atau mencancang?`), a: T('Horizontal', 'Mengufuk'), w: W(T(`Both points are at $y = ${b}$, so they are at the same height.`, `Kedua-dua titik berada pada $y = ${b}$, jadi ia berada pada ketinggian yang sama.`), T('A line joining them is therefore horizontal.', 'Oleh itu garis yang menyambungkannya adalah mengufuk.')), sp: 'xs' };
      return { q: T(`The rectangle $OABC$ has $O$ at the origin, $A = ${pt([a, 0])}$ on the $x$-axis and $C = ${pt([0, b])}$ on the $y$-axis. Write down the coordinates of $B$.`, `Segi empat tepat $OABC$ mempunyai $O$ di asalan, $A = ${pt([a, 0])}$ pada paksi-$x$ dan $C = ${pt([0, b])}$ pada paksi-$y$. Tuliskan koordinat $B$.`), fig: PF1([[0, 0], [a, 0], [a, b], [0, b]], { polys: [{ p: [[0, 0], [a, 0], [a, b], [0, b]] }] }), a: T(`$${pt([a, b])}$`), w: W(T(`$B$ is directly above $A$, so it has the same $x$-coordinate: $x = ${a}$.`, `$B$ berada tepat di atas $A$, jadi koordinat-$x$nya sama: $x = ${a}$.`), T(`$B$ is directly to the right of $C$, so it has the same $y$-coordinate: $y = ${b}$.`, `$B$ berada tepat di kanan $C$, jadi koordinat-$y$nya sama: $y = ${b}$.`), `$${pt([a, b])}$`), sp: 's' };
    },
    /* multiple choice: identify the point */
    (r) => {
      const P = distinctPts(r, 1, 1, 8)[0];
      const opts = r.shuffle([P, [P[1], P[0]], [P[0], P[1] + 1], [P[0] + 1, P[1]]]);
      need(new Set(opts.map(pt)).size === 4);
      const i = opts.findIndex((o) => o === P);
      return { q: T(`Which of the following are the coordinates of point $A$ in the diagram? ${opts.map((o, j) => `(${'ABCD'[j]}) $${pt(o)}$`).join('&emsp;')}`, `Antara berikut, yang manakah koordinat titik $A$ dalam rajah? ${opts.map((o, j) => `(${'ABCD'[j]}) $${pt(o)}$`).join('&emsp;')}`), fig: PF1([P]), a: T(`(${'ABCD'[i]}) $${pt(P)}$`), w: W(T(`Read across to $${P[0]}$, then up to $${P[1]}$, so $A = ${pt(P)}$.`, `Baca merentas ke $${P[0]}$, kemudian ke atas ke $${P[1]}$, jadi $A = ${pt(P)}$.`), T(`That is option (${'ABCD'[i]}); the other options swap the two numbers or are one unit out.`, `Itu ialah pilihan (${'ABCD'[i]}); pilihan lain menukar susunan dua nombor itu atau tersasar satu unit.`)), sp: 'xs' };
    },
  ];

  const g71m = [
    /* quadrant of a point */
    (r) => {
      const k = r.int(1, 3), P = Array.from({ length: k }, () => [r.nz(-9, 9), r.nz(-9, 9)]), t = r.int(0, 1);
      if (t === 0) return { q: T(`State the quadrant in which ${k > 1 ? 'each of the points' : 'the point'} ${jn(P.map((p) => `$${pt(p)}$`))} ${k > 1 ? 'lies' : 'lies'}.`, `Nyatakan sukuan tempat ${k > 1 ? 'setiap titik' : 'titik'} ${jn(P.map((p) => `$${pt(p)}$`), 1)} terletak.`), a: T(P.map((p) => `$${pt(p)}$: quadrant ${QR[QD(...p)]}`).join('; '), P.map((p) => `$${pt(p)}$: sukuan ${QR[QD(...p)]}`).join('; ')), w: W(T('The signs of the two coordinates give the quadrant: $(+, +)$ is I, $(-, +)$ is II, $(-, -)$ is III and $(+, -)$ is IV.', 'Tanda kedua-dua koordinat memberi sukuan: $(+, +)$ ialah I, $(-, +)$ ialah II, $(-, -)$ ialah III dan $(+, -)$ ialah IV.'), T(P.map((p) => `$${pt(p)}$ is $(${p[0] > 0 ? '+' : '-'}, ${p[1] > 0 ? '+' : '-'})$: quadrant ${QR[QD(...p)]}`).join('; '), P.map((p) => `$${pt(p)}$ ialah $(${p[0] > 0 ? '+' : '-'}, ${p[1] > 0 ? '+' : '-'})$: sukuan ${QR[QD(...p)]}`).join('; '))), sp: 's' };
      const p = P[0];
      return { q: T(`A point has ${p[0] > 0 ? 'a positive' : 'a negative'} $x$-coordinate and ${p[1] > 0 ? 'a positive' : 'a negative'} $y$-coordinate. In which quadrant does it lie?`, `Satu titik mempunyai koordinat-$x$ ${p[0] > 0 ? 'positif' : 'negatif'} dan koordinat-$y$ ${p[1] > 0 ? 'positif' : 'negatif'}. Dalam sukuan manakah ia terletak?`), a: T(`Quadrant ${QR[QD(...p)]}`, `Sukuan ${QR[QD(...p)]}`), w: W(T('The signs of the two coordinates give the quadrant: $(+, +)$ is I, $(-, +)$ is II, $(-, -)$ is III and $(+, -)$ is IV.', 'Tanda kedua-dua koordinat memberi sukuan: $(+, +)$ ialah I, $(-, +)$ ialah II, $(-, -)$ ialah III dan $(+, -)$ ialah IV.'), T(`Here the signs are $(${p[0] > 0 ? '+' : '-'}, ${p[1] > 0 ? '+' : '-'})$, so the point is in quadrant ${QR[QD(...p)]}.`, `Di sini tandanya ialah $(${p[0] > 0 ? '+' : '-'}, ${p[1] > 0 ? '+' : '-'})$, jadi titik itu berada dalam sukuan ${QR[QD(...p)]}.`)), sp: 'xs' };
    },
    /* read points from a four-quadrant grid */
    (r) => {
      const k = r.int(2, 4), P = [];
      while (P.length < k) { const p = [r.nz(-5, 5), r.nz(-5, 5)]; if (!P.some((q) => q[0] === p[0] || q[1] === p[1])) P.push(p); }
      return { q: T('Write down the coordinates of each marked point and state the quadrant in which it lies.', 'Tuliskan koordinat setiap titik yang ditandakan dan nyatakan sukuan tempat ia terletak.'), fig: PF(P), a: T(P.map((p, i) => `$${LET[i]} = ${pt(p)}$ (quadrant ${QR[QD(...p)]})`).join('; '), P.map((p, i) => `$${LET[i]} = ${pt(p)}$ (sukuan ${QR[QD(...p)]})`).join('; ')), w: W(T('Read each point across then up; left and down count as negative.', 'Baca setiap titik merentas kemudian ke atas; ke kiri dan ke bawah dikira negatif.'), T('The signs of the two coordinates give the quadrant: $(+, +)$ is I, $(-, +)$ is II, $(-, -)$ is III and $(+, -)$ is IV.', 'Tanda kedua-dua koordinat memberi sukuan: $(+, +)$ ialah I, $(-, +)$ ialah II, $(-, -)$ ialah III dan $(+, -)$ ialah IV.'), T(P.map((p, i) => `$${LET[i]} = ${pt(p)}$: quadrant ${QR[QD(...p)]}`).join('; '), P.map((p, i) => `$${LET[i]} = ${pt(p)}$: sukuan ${QR[QD(...p)]}`).join('; '))), sp: 's' };
    },
    /* reflections */
    (r) => {
      const p = [r.nz(-7, 7), r.nz(-7, 7)], t = r.int(0, 2);
      const [nm, im2] = [[T('in the $x$-axis', 'pada paksi-$x$'), [p[0], -p[1]]], [T('in the $y$-axis', 'pada paksi-$y$'), [-p[0], p[1]]], [T('in the origin (a half-turn about $O$)', 'pada asalan (putaran separuh pusingan pada $O$)'), [-p[0], -p[1]]]][t];
      return { q: T(`The point $P = ${pt(p)}$ is reflected ${nm.en}. State the coordinates of its image $P'$.`, `Titik $P = ${pt(p)}$ dipantulkan ${nm.ms}. Nyatakan koordinat imejnya $P'$.`), a: T(`$${pt(im2)}$`), w: W(T(t === 0 ? 'A reflection in the $x$-axis keeps the $x$-coordinate and changes the sign of the $y$-coordinate.' : t === 1 ? 'A reflection in the $y$-axis keeps the $y$-coordinate and changes the sign of the $x$-coordinate.' : 'A half-turn about the origin changes the sign of both coordinates.', t === 0 ? 'Pantulan pada paksi-$x$ mengekalkan koordinat-$x$ dan menukar tanda koordinat-$y$.' : t === 1 ? 'Pantulan pada paksi-$y$ mengekalkan koordinat-$y$ dan menukar tanda koordinat-$x$.' : 'Putaran separuh pusingan pada asalan menukar tanda kedua-dua koordinat.'), `$${pt(p)} \\to ${pt(im2)}$`), sp: 's' };
    },
    /* movements with all directions */
    (r) => {
      const s = [r.nz(-5, 5), r.nz(-5, 5)], a = r.int(1, 6), b = r.int(1, 6), h = r.chance(), v = r.chance();
      const E = [s[0] + (h ? a : -a), s[1] + (v ? b : -b)];
      return { q: T(`A drone takes off from the point $${pt(s)}$ and flies ${a} units ${h ? 'east' : 'west'} and then ${b} units ${v ? 'north' : 'south'}. Find its final coordinates and the quadrant it is in.`, `Sebuah dron berlepas dari titik $${pt(s)}$ dan terbang ${a} unit ke ${h ? 'timur' : 'barat'} dan kemudian ${b} unit ke ${v ? 'utara' : 'selatan'}. Cari koordinat akhirnya dan sukuan tempat ia berada.`), a: T(`$${pt(E)}$, ${qtxt(E).en}`, `$${pt(E)}$, ${qtxt(E).ms}`), w: W(T(`${h ? 'East' : 'West'} changes the $x$-coordinate, ${v ? 'north' : 'south'} changes the $y$-coordinate.`, `${h ? 'Timur' : 'Barat'} mengubah koordinat-$x$, ${v ? 'utara' : 'selatan'} mengubah koordinat-$y$.`), `$x = ${n(s[0])} ${h ? '+' : '-'} ${a} = ${n(E[0])}$, $y = ${n(s[1])} ${v ? '+' : '-'} ${b} = ${n(E[1])}$`, T(`$${pt(E)}$ is ${qtxt(E).en}.`, `$${pt(E)}$ ${qtxt(E).ms}.`)), sp: 's' };
    },
    /* axes or quadrants */
    (r) => {
      const a = r.nz(-6, 6), b = r.nz(-6, 6);
      const pts = r.shuffle([[a, 0], [0, b], [a, b], [-a, -b]]);
      return { q: T(`For each point, say whether it lies on an axis or in a quadrant: ${pts.map((p, i) => `(${'abcd'[i]}) $${pt(p)}$`).join(' ')}`, `Bagi setiap titik, nyatakan sama ada ia terletak pada paksi atau dalam sukuan: ${pts.map((p, i) => `(${'abcd'[i]}) $${pt(p)}$`).join(' ')}`), a: T(pts.map((p, i) => `(${'abcd'[i]}) ${qtxt(p).en}`).join('; '), pts.map((p, i) => `(${'abcd'[i]}) ${qtxt(p).ms}`).join('; ')), w: W(T('A point lies on an axis when one of its coordinates is $0$; otherwise the two signs give the quadrant.', 'Satu titik terletak pada paksi apabila salah satu koordinatnya $0$; jika tidak, kedua-dua tandanya memberi sukuan.'), T(pts.map((p, i) => `(${'abcd'[i]}) $${pt(p)}$: ${qtxt(p).en}`).join('; '), pts.map((p, i) => `(${'abcd'[i]}) $${pt(p)}$: ${qtxt(p).ms}`).join('; '))), sp: 's' };
    },
    /* distances from both axes */
    (r) => {
      const p = [r.nz(-9, 9), r.nz(-9, 9)];
      need(Math.abs(p[0]) !== Math.abs(p[1]));
      return { q: T(`Find the distance of the point $${pt(p)}$ from (a) the $x$-axis, (b) the $y$-axis.`, `Cari jarak titik $${pt(p)}$ dari (a) paksi-$x$, (b) paksi-$y$.`), a: T(`(a) ${Math.abs(p[1])} units (b) ${Math.abs(p[0])} units`, `(a) ${Math.abs(p[1])} unit (b) ${Math.abs(p[0])} unit`), w: W(T('The distance from the $x$-axis is $|y|$, and the distance from the $y$-axis is $|x|$:', 'Jarak dari paksi-$x$ ialah $|y|$, dan jarak dari paksi-$y$ ialah $|x|$:'), `$\\text{(a)}\\ |${p[1]}| = ${Math.abs(p[1])}$`, `$\\text{(b)}\\ |${p[0]}| = ${Math.abs(p[0])}$`), sp: 's' };
    },
    /* fourth vertex of a rectangle */
    (r) => {
      const x1 = r.int(-6, 1), x2 = x1 + r.int(2, 6), y1 = r.int(-6, 1), y2 = y1 + r.int(2, 6);
      const V = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], gap = r.int(0, 3);
      const known = V.filter((_, i) => i !== gap);
      return { q: T(`Three vertices of a rectangle with sides parallel to the axes are ${known.map((p) => `$${pt(p)}$`).join(', ')}. Find the fourth vertex.`, `Tiga bucu sebuah segi empat tepat dengan sisi selari dengan paksi ialah ${known.map((p) => `$${pt(p)}$`).join(', ')}. Cari bucu yang keempat.`), fig: PF(known), a: T(`$${pt(V[gap])}$`), w: W(T('In a rectangle with sides parallel to the axes only two different $x$-values and two different $y$-values occur.', 'Dalam segi empat tepat yang sisinya selari dengan paksi, hanya dua nilai $x$ dan dua nilai $y$ yang berbeza wujud.'), T(`Here the $x$-values are $${x1}$ and $${x2}$, and the $y$-values are $${y1}$ and $${y2}$.`, `Di sini nilai $x$ ialah $${x1}$ dan $${x2}$, dan nilai $y$ ialah $${y1}$ dan $${y2}$.`), T(`The combination that is missing is $${pt(V[gap])}$.`, `Gabungan yang tiada ialah $${pt(V[gap])}$.`)), sp: 's' };
    },
    /* patterns of points */
    (r) => {
      const m = r.pick([1, 2, 3, -1, -2]), c = r.int(-3, 3), s = r.int(-2, 1), t = r.int(0, 1);
      const P = [s, s + 1, s + 2].map((x) => [x, m * x + c]);
      const nx = s + 3, k = s + 5;
      if (t === 0) return { q: T(`The points ${P.map((p) => `$${pt(p)}$`).join(', ')} follow a pattern. Write down the next point in the pattern.`, `Titik ${P.map((p) => `$${pt(p)}$`).join(', ')} mengikut satu pola. Tuliskan titik seterusnya dalam pola itu.`), a: T(`$${pt([nx, m * nx + c])}$`), w: W(T(`Each step the $x$-coordinate increases by $1$ and the $y$-coordinate changes by $${m}$.`, `Setiap langkah koordinat-$x$ bertambah $1$ dan koordinat-$y$ berubah sebanyak $${m}$.`), `$x = ${P[2][0]} + 1 = ${nx}$, $y = ${P[2][1]} ${m < 0 ? '-' : '+'} ${Math.abs(m)} = ${m * nx + c}$`, `$${pt([nx, m * nx + c])}$`), sp: 's' };
      return { q: T(`The points ${P.map((p) => `$${pt(p)}$`).join(', ')} lie on a straight line and follow a pattern. Find the $y$-coordinate of the point on the line whose $x$-coordinate is ${k}.`, `Titik ${P.map((p) => `$${pt(p)}$`).join(', ')} terletak pada satu garis lurus dan mengikut satu pola. Cari koordinat-$y$ titik pada garis itu yang koordinat-$x$nya ialah ${k}.`), a: T(`${m * k + c}`), w: W(T(`The $y$-coordinate changes by $${m}$ each time $x$ increases by $1$, so the line is $y = ${poly([[m, 'x'], [c, '']])}$.`, `Koordinat-$y$ berubah sebanyak $${m}$ setiap kali $x$ bertambah $1$, jadi garisnya ialah $y = ${poly([[m, 'x'], [c, '']])}$.`), `$y = ${m}(${k})${c === 0 ? '' : (c < 0 ? ' - ' : ' + ') + Math.abs(c)} = ${m * k + c}$`), sp: 's' };
    },
  ];

  const g71a = [
    /* collinear: missing coordinate */
    (r) => {
      const m = r.pick([1, 2, 3, -1, -2, 0.5]), c = r.int(-4, 4), xs = r.sample([-3, -2, -1, 0, 1, 2, 3, 4], 3).sort((x, y) => x - y), k = r.int(5, 9);
      need(Number.isInteger(m * xs[0] + c) && Number.isInteger(m * xs[1] + c) && Number.isInteger(m * xs[2] + c) && Number.isInteger(m * k + c));
      const P = xs.map((x) => [x, m * x + c]);
      const t = r.int(0, 2);
      const det = (a, b, cc) => (b[0] - a[0]) * (cc[1] - a[1]) - (b[1] - a[1]) * (cc[0] - a[0]);
      if (t === 0) return { q: T(`The points ${P.map((p) => `$${pt(p)}$`).join(', ')} and $(${k}, q)$ lie on the same straight line. Find $q$.`, `Titik ${P.map((p) => `$${pt(p)}$`).join(', ')} dan $(${k}, q)$ terletak pada garis lurus yang sama. Cari $q$.`), a: T(`$q = ${m * k + c}$`), w: W(T(`Gradient $= \\dfrac{${n(P[1][1])} - ${bk(P[0][1])}}{${n(P[1][0])} - ${bk(P[0][0])}} = ${n(m)}$, so the line is $y = ${poly([[m, 'x'], [c, '']])}$.`, `Kecerunan $= \\dfrac{${n(P[1][1])} - ${bk(P[0][1])}}{${n(P[1][0])} - ${bk(P[0][0])}} = ${n(m)}$, jadi garisnya ialah $y = ${poly([[m, 'x'], [c, '']])}$.`), `$q = ${n(m)}(${k})${c === 0 ? '' : (c < 0 ? ' - ' : ' + ') + Math.abs(c)} = ${n(m * k + c)}$`), sp: 'm' };
      if (t === 1) return { q: T(`Show that the points ${P.map((p) => `$${pt(p)}$`).join(', ')} are collinear by using the condition $(x_2 - x_1)(y_3 - y_1) - (y_2 - y_1)(x_3 - x_1) = 0$.`, `Tunjukkan bahawa titik ${P.map((p) => `$${pt(p)}$`).join(', ')} adalah segaris dengan menggunakan syarat $(x_2 - x_1)(y_3 - y_1) - (y_2 - y_1)(x_3 - x_1) = 0$.`), a: T(`$(${P[1][0] - P[0][0]})(${P[2][1] - P[0][1]}) - (${P[1][1] - P[0][1]})(${P[2][0] - P[0][0]}) = 0$, so the points are collinear.`, `$(${P[1][0] - P[0][0]})(${P[2][1] - P[0][1]}) - (${P[1][1] - P[0][1]})(${P[2][0] - P[0][0]}) = 0$, maka titik-titik itu segaris.`), w: W(`$(${n(P[1][0])} - ${bk(P[0][0])})(${n(P[2][1])} - ${bk(P[0][1])}) - (${n(P[1][1])} - ${bk(P[0][1])})(${n(P[2][0])} - ${bk(P[0][0])})$`, `$= (${bk(P[1][0] - P[0][0])})(${bk(P[2][1] - P[0][1])}) - (${bk(P[1][1] - P[0][1])})(${bk(P[2][0] - P[0][0])}) = ${(P[1][0] - P[0][0]) * (P[2][1] - P[0][1])} - ${bk((P[1][1] - P[0][1]) * (P[2][0] - P[0][0]))} = 0$`, T('The value is $0$, so the three points lie on one straight line.', 'Nilainya $0$, jadi ketiga-tiga titik terletak pada satu garis lurus.')), sp: 'm' };
      const bad = [P[0], P[1], [P[2][0], P[2][1] + r.pick([-2, -1, 1, 2])]];
      need(det(...bad) !== 0);
      return { q: T(`Are the points ${bad.map((p) => `$${pt(p)}$`).join(', ')} on the same straight line? Give a reason.`, `Adakah titik ${bad.map((p) => `$${pt(p)}$`).join(', ')} terletak pada garis lurus yang sama? Berikan sebab.`), a: T(`No: the determinant is $${det(...bad)} \\neq 0$.`, `Tidak: penentu ialah $${det(...bad)} \\neq 0$.`), w: W(T('Three points are collinear only when $(x_2 - x_1)(y_3 - y_1) - (y_2 - y_1)(x_3 - x_1) = 0$:', 'Tiga titik segaris hanya apabila $(x_2 - x_1)(y_3 - y_1) - (y_2 - y_1)(x_3 - x_1) = 0$:'), `$(${bk(bad[1][0] - bad[0][0])})(${bk(bad[2][1] - bad[0][1])}) - (${bk(bad[1][1] - bad[0][1])})(${bk(bad[2][0] - bad[0][0])}) = ${det(...bad)}$`, T('This is not $0$, so the three points are not on one straight line.', 'Ini bukan $0$, jadi ketiga-tiga titik itu tidak terletak pada satu garis lurus.')), sp: 'm' };
    },
    /* the point lies on an axis: solve for k */
    (r) => {
      const a = r.pick([2, 3, 4]), c = r.pick([1, 2, 3]), t = r.int(0, 1);
      if (t === 0) { const kk = r.int(-4, 5), bb = -a * kk, dd = r.int(-6, 6); const y = c * kk + dd; need(bb !== 0 && y !== 0); return { q: T(`The point $(${a}k ${bb < 0 ? '-' : '+'} ${Math.abs(bb)}, ${c}k ${dd < 0 ? '-' : '+'} ${Math.abs(dd)})$ lies on the $y$-axis. Find $k$ and the coordinates of the point.`, `Titik $(${a}k ${bb < 0 ? '-' : '+'} ${Math.abs(bb)}, ${c}k ${dd < 0 ? '-' : '+'} ${Math.abs(dd)})$ terletak pada paksi-$y$. Cari $k$ dan koordinat titik itu.`), a: T(`$k = ${kk}$; $(0, ${y})$`), w: W(T('A point on the $y$-axis has $x = 0$:', 'Titik pada paksi-$y$ mempunyai $x = 0$:'), `$${a}k ${bb < 0 ? '-' : '+'} ${Math.abs(bb)} = 0$`, `$${a}k = ${-bb}$`, `$k = ${kk}$`, `$y = ${c}(${kk}) ${dd < 0 ? '-' : '+'} ${Math.abs(dd)} = ${y}$`, T(`The point is $(0, ${y})$.`, `Titik itu ialah $(0, ${y})$.`)), sp: 'm' }; }
      const kk = r.int(-4, 5), dd = -c * kk, bb = r.int(-6, 6); const x = a * kk + bb; need(dd !== 0 && x !== 0);
      return { q: T(`The point $(${a}k ${bb < 0 ? '-' : '+'} ${Math.abs(bb)}, ${c}k ${dd < 0 ? '-' : '+'} ${Math.abs(dd)})$ lies on the $x$-axis. Find $k$ and the coordinates of the point.`, `Titik $(${a}k ${bb < 0 ? '-' : '+'} ${Math.abs(bb)}, ${c}k ${dd < 0 ? '-' : '+'} ${Math.abs(dd)})$ terletak pada paksi-$x$. Cari $k$ dan koordinat titik itu.`), a: T(`$k = ${kk}$; $(${x}, 0)$`), w: W(T('A point on the $x$-axis has $y = 0$:', 'Titik pada paksi-$x$ mempunyai $y = 0$:'), `$${c}k ${dd < 0 ? '-' : '+'} ${Math.abs(dd)} = 0$`, `$${c}k = ${-dd}$`, `$k = ${kk}$`, `$x = ${a}(${kk}) ${bb < 0 ? '-' : '+'} ${Math.abs(bb)} = ${x}$`, T(`The point is $(${x}, 0)$.`, `Titik itu ialah $(${x}, 0)$.`)), sp: 'm' };
    },
    /* parallelogram and square: fourth vertex */
    (r) => {
      const A = [r.int(-5, 0), r.int(-5, 0)], u = [r.int(2, 6), r.int(-2, 2)], v = [r.int(-2, 2), r.int(2, 6)];
      need(u[0] * v[1] - u[1] * v[0] !== 0);
      const B = [A[0] + u[0], A[1] + u[1]], D = [A[0] + v[0], A[1] + v[1]], C = [B[0] + v[0], B[1] + v[1]];
      const fig = PF([A, B, D].map((p) => p), { x: [-8, 8], y: [-8, 8], scale: 17 });
      return { q: T(`$A = ${pt(A)}$, $B = ${pt(B)}$ and $D = ${pt(D)}$ are three vertices of a parallelogram $ABCD$. Find the coordinates of $C$.`, `$A = ${pt(A)}$, $B = ${pt(B)}$ dan $D = ${pt(D)}$ ialah tiga bucu sebuah segi empat selari $ABCD$. Cari koordinat $C$.`), a: T(`$C = ${pt(C)}$`), w: W(T('The diagonals of a parallelogram bisect each other, so $AC$ and $BD$ have the same midpoint; this gives $C = B + D - A$.', 'Pepenjuru segi empat selari saling membahagi dua sama, jadi $AC$ dan $BD$ mempunyai titik tengah yang sama; ini memberi $C = B + D - A$.'), `$x = ${n(B[0])} + ${bk(D[0])} - ${bk(A[0])} = ${n(C[0])}$`, `$y = ${n(B[1])} + ${bk(D[1])} - ${bk(A[1])} = ${n(C[1])}$`, `$C = ${pt(C)}$`), sp: 'm' };
    },
    /* area of shapes on the grid */
    (r) => {
      const x1 = r.int(-6, 0), y1 = r.int(-6, 0), w = r.int(2, 8), h = r.int(2, 8), t = r.int(0, 2);
      const P = [[x1, y1], [x1 + w, y1], [x1 + w, y1 + h], [x1, y1 + h]];
      if (t === 0) return { q: T(`The vertices of a rectangle are ${P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', ')}. Find its perimeter and its area.`, `Bucu sebuah segi empat tepat ialah ${P.map((p, i) => `$${LET[i]} = ${pt(p)}$`).join(', ')}. Cari perimeter dan luasnya.`), fig: PF(P, { polys: [{ p: P }], x: [-8, 8], y: [-8, 8], scale: 17 }), a: T(`Perimeter ${2 * (w + h)} units; area ${w * h} square units`, `Perimeter ${2 * (w + h)} unit; luas ${w * h} unit persegi`), w: W(T(`$AB$ is horizontal with length $${w}$ and $BC$ is vertical with length $${h}$.`, `$AB$ mengufuk dengan panjang $${w}$ dan $BC$ mencancang dengan panjang $${h}$.`), `$P = 2(${w} + ${h}) = ${2 * (w + h)}$`, `$A = ${w} \\times ${h} = ${w * h}$`), sp: 'm' };
      if (t === 1) return { q: T(`A triangle has vertices $A = ${pt(P[0])}$, $B = ${pt(P[1])}$ and $C = ${pt(P[2])}$. Find the area of triangle $ABC$.`, `Sebuah segi tiga mempunyai bucu $A = ${pt(P[0])}$, $B = ${pt(P[1])}$ dan $C = ${pt(P[2])}$. Cari luas segi tiga $ABC$.`), fig: PF(P.slice(0, 3), { polys: [{ p: P.slice(0, 3) }], x: [-8, 8], y: [-8, 8], scale: 17 }), a: T(`${(w * h) / 2} square units`, `${(w * h) / 2} unit persegi`), w: W(T(`$AB$ is horizontal ($${w}$ units) and $BC$ is vertical ($${h}$ units), so the angle at $B$ is a right angle.`, `$AB$ mengufuk ($${w}$ unit) dan $BC$ mencancang ($${h}$ unit), jadi sudut di $B$ ialah sudut tegak.`), `$\\dfrac{1}{2} \\times ${w} \\times ${h} = ${(w * h) / 2}$`), sp: 'm' };
      return { q: T(`A square has one side from $${pt(P[0])}$ to $${pt([P[0][0] + w, P[0][1]])}$. Find the coordinates of the other two vertices if the square lies above this side, and the area of the square.`, `Sebuah segi empat sama mempunyai satu sisi dari $${pt(P[0])}$ ke $${pt([P[0][0] + w, P[0][1]])}$. Cari koordinat dua bucu yang lain jika segi empat sama itu terletak di atas sisi ini, dan luas segi empat sama itu.`), a: T(`$${pt([P[0][0] + w, P[0][1] + w])}$ and $${pt([P[0][0], P[0][1] + w])}$; area ${w * w} square units`, `$${pt([P[0][0] + w, P[0][1] + w])}$ dan $${pt([P[0][0], P[0][1] + w])}$; luas ${w * w} unit persegi`), w: W(T(`The given side is horizontal and $${w}$ units long, so every side of the square is $${w}$ units.`, `Sisi yang diberi mengufuk dan sepanjang $${w}$ unit, jadi setiap sisi segi empat sama itu ialah $${w}$ unit.`), T(`Going $${w}$ units up from each end gives $${pt([P[0][0] + w, P[0][1] + w])}$ and $${pt([P[0][0], P[0][1] + w])}$.`, `Naik $${w}$ unit dari setiap hujung memberi $${pt([P[0][0] + w, P[0][1] + w])}$ dan $${pt([P[0][0], P[0][1] + w])}$.`), `$${w}^2 = ${w * w}$`), sp: 'm' };
    },
    /* true or false statements */
    (r) => {
      const bank = [
        ['The point $(-3, 0)$ lies in quadrant II.', 'Titik $(-3, 0)$ terletak dalam sukuan II.', false, 'It lies on the $x$-axis, so it is not in any quadrant.', 'Ia terletak pada paksi-$x$, maka ia tidak berada dalam mana-mana sukuan.', 'A point is in a quadrant only when neither coordinate is $0$; here $y = 0$.', 'Titik berada dalam sukuan hanya apabila tiada koordinatnya $0$; di sini $y = 0$.'],
        ['Every point in quadrant III has a negative $x$-coordinate and a negative $y$-coordinate.', 'Setiap titik dalam sukuan III mempunyai koordinat-$x$ negatif dan koordinat-$y$ negatif.', true, 'This is the definition of quadrant III.', 'Ini ialah takrif sukuan III.', 'Quadrant III is the bottom-left region, where $x < 0$ and $y < 0$.', 'Sukuan III ialah kawasan kiri bawah, dengan $x < 0$ dan $y < 0$.'],
        ['The points $(2, 5)$ and $(5, 2)$ are the same point.', 'Titik $(2, 5)$ dan $(5, 2)$ ialah titik yang sama.', false, 'The order matters: the first number is the $x$-coordinate.', 'Susunan penting: nombor pertama ialah koordinat-$x$.', '$(2, 5)$ is 2 across and 5 up, while $(5, 2)$ is 5 across and 2 up.', '$(2, 5)$ ialah 2 merentas dan 5 ke atas, manakala $(5, 2)$ ialah 5 merentas dan 2 ke atas.'],
        ['The origin lies on both the $x$-axis and the $y$-axis.', 'Asalan terletak pada kedua-dua paksi-$x$ dan paksi-$y$.', true, 'Its coordinates are $(0, 0)$.', 'Koordinatnya ialah $(0, 0)$.', 'The origin is the point where the two axes meet, so it lies on both of them.', 'Asalan ialah titik pertemuan kedua-dua paksi, jadi ia terletak pada kedua-duanya.'],
        ['A point with a positive $x$-coordinate and a negative $y$-coordinate lies in quadrant II.', 'Titik yang mempunyai koordinat-$x$ positif dan koordinat-$y$ negatif terletak dalam sukuan II.', false, 'It lies in quadrant IV.', 'Ia terletak dalam sukuan IV.', '$x > 0$ with $y < 0$ is the bottom-right region; quadrant II is $x < 0$ with $y > 0$.', '$x > 0$ dengan $y < 0$ ialah kawasan kanan bawah; sukuan II ialah $x < 0$ dengan $y > 0$.'],
        ['All points on the $y$-axis have an $x$-coordinate of 0.', 'Semua titik pada paksi-$y$ mempunyai koordinat-$x$ bernilai 0.', true, 'Points on the $y$-axis are $(0, y)$.', 'Titik pada paksi-$y$ ialah $(0, y)$.', 'The $y$-axis is the vertical line $x = 0$.', 'Paksi-$y$ ialah garis mencancang $x = 0$.'],
        ['The point $(-4, -4)$ is in the same quadrant as $(4, 4)$.', 'Titik $(-4, -4)$ berada dalam sukuan yang sama dengan $(4, 4)$.', false, 'They are in quadrants III and I.', 'Kedua-duanya berada dalam sukuan III dan I.', '$(-4, -4)$ has both coordinates negative, while $(4, 4)$ has both positive.', '$(-4, -4)$ mempunyai kedua-dua koordinat negatif, manakala $(4, 4)$ mempunyai kedua-duanya positif.'],
        ['The line through $(1, 3)$ and $(6, 3)$ is horizontal.', 'Garis yang melalui $(1, 3)$ dan $(6, 3)$ adalah mengufuk.', true, 'Both points have $y = 3$.', 'Kedua-dua titik mempunyai $y = 3$.', 'Two points at the same height are joined by a horizontal line.', 'Dua titik pada ketinggian yang sama disambungkan oleh garis mengufuk.'],
      ];
      const b = r.pick(bank);
      return { q: T(`True or false? Explain. ${b[0]}`, `Betul atau salah? Jelaskan. ${b[1]}`), a: b[2] ? T(`True. ${b[3]}`, `Betul. ${b[4]}`) : T(`False. ${b[3]}`, `Salah. ${b[4]}`), w: W(T(b[5], b[6]), T(`So the statement is ${b[2] ? 'true' : 'false'}: ${b[3]}`, `Jadi pernyataan itu ${b[2] ? 'betul' : 'salah'}: ${b[4]}`)), sp: 's' };
    },
    /* which quadrants can a point be in? */
    (r) => {
      const t = r.int(0, 3), k = r.int(1, 5);
      const forms = [
        [T(`The product of the coordinates of a point is positive. In which quadrants can the point lie?`, `Hasil darab koordinat sebuah titik ialah positif. Dalam sukuan manakah titik itu boleh terletak?`), T('Quadrants I and III', 'Sukuan I dan III')],
        [T(`The product of the coordinates of a point is negative. In which quadrants can the point lie?`, `Hasil darab koordinat sebuah titik ialah negatif. Dalam sukuan manakah titik itu boleh terletak?`), T('Quadrants II and IV', 'Sukuan II dan IV')],
        [T(`A point $(a, b)$ has $a < 0$ and $b > 0$. In which quadrant does the point $(b, a)$ lie?`, `Titik $(a, b)$ mempunyai $a < 0$ dan $b > 0$. Dalam sukuan manakah titik $(b, a)$ terletak?`), T('Quadrant IV', 'Sukuan IV')],
        [T(`A point $P(a, b)$ lies in quadrant III. In which quadrant does the point $(-a, b)$ lie?`, `Titik $P(a, b)$ terletak dalam sukuan III. Dalam sukuan manakah titik $(-a, b)$ terletak?`), T('Quadrant IV', 'Sukuan IV')],
      ];
      const qw = [
        T('A positive product means the two coordinates have the same sign: both positive (quadrant I) or both negative (quadrant III).', 'Hasil darab positif bermakna kedua-dua koordinat bertanda sama: kedua-duanya positif (sukuan I) atau kedua-duanya negatif (sukuan III).'),
        T('A negative product means the two coordinates have opposite signs: $(-, +)$ is quadrant II and $(+, -)$ is quadrant IV.', 'Hasil darab negatif bermakna kedua-dua koordinat bertanda bertentangan: $(-, +)$ ialah sukuan II dan $(+, -)$ ialah sukuan IV.'),
        T('With $a < 0$ and $b > 0$, the point $(b, a)$ is $(+, -)$, which is quadrant IV.', 'Dengan $a < 0$ dan $b > 0$, titik $(b, a)$ ialah $(+, -)$, iaitu sukuan IV.'),
        T('In quadrant III both $a < 0$ and $b < 0$, so $-a > 0$ and $(-a, b)$ is $(+, -)$: quadrant IV.', 'Dalam sukuan III, $a < 0$ dan $b < 0$, jadi $-a > 0$ dan $(-a, b)$ ialah $(+, -)$: sukuan IV.'),
      ];
      return { q: forms[t][0], a: forms[t][1], w: W(qw[t]), sp: 's' };
    },
  ];

  /* ---- contexts: places and movements on a coordinate grid ---- */
  const CP = { east: ['to the east', 'ke timur'], west: ['to the west', 'ke barat'], north: ['to the north', 'ke utara'], south: ['to the south', 'ke selatan'], right: ['to the right', 'ke kanan'], left: ['to the left', 'ke kiri'], up: ['upwards', 'ke atas'], down: ['downwards', 'ke bawah'] };
  const COMP = ['east', 'west', 'north', 'south'], GRID = ['right', 'left', 'up', 'down'];
  const CTX = [
    { o: ['the town hall', 'dewan bandar'], u: ['km', 'km'], d: COMP, it: [['the hospital', 'hospital'], ['the market', 'pasar'], ['the bus station', 'stesen bas'], ['the stadium', 'stadium']] },
    { o: ['the school gate', 'pintu pagar sekolah'], u: ['blocks', 'blok'], d: COMP, it: [['the library', 'perpustakaan'], ['the canteen', 'kantin'], ['the hall', 'dewan'], ['the field', 'padang']] },
    { o: ['the starting flag', 'bendera permulaan'], u: ['paces', 'langkah'], d: COMP, it: [['the treasure chest', 'peti harta'], ['the old well', 'perigi lama'], ['the big rock', 'batu besar']] },
    { o: ['the launch pad', 'pad pelancaran'], u: ['metres', 'meter'], d: COMP, it: [['the drone', 'dron'], ['the landing marker', 'penanda pendaratan']] },
    { o: ['its starting square', 'petak permulaan'], u: ['squares', 'petak'], d: GRID, it: [['the robot', 'robot'], ['the charging station', 'stesen pengecasan'], ['the obstacle', 'halangan']] },
    { o: ['the centre spot of the pitch', 'titik tengah padang'], u: ['metres', 'meter'], d: GRID, it: [['the corner flag', 'bendera penjuru'], ['the referee', 'pengadil'], ['the ball', 'bola']] },
    { o: ['the centre of the screen', 'pusat skrin'], u: ['units', 'unit'], d: GRID, it: [['the coin', 'syiling'], ['the character', 'watak'], ['the enemy', 'musuh']] },
    { o: ['the farmhouse', 'rumah ladang'], u: ['metres', 'meter'], d: COMP, it: [['the barn', 'reban'], ['the well', 'perigi'], ['the fish pond', 'kolam ikan'], ['the oil palm nursery', 'tapak semaian kelapa sawit']] },
    { o: ['the lighthouse', 'rumah api'], u: ['nautical miles', 'batu nautika'], d: COMP, it: [['the ship', 'kapal'], ['the fishing boat', 'bot nelayan'], ['the buoy', 'pelampung']] },
    { o: ['the teacher\'s desk', 'meja guru'], u: ['metres', 'meter'], d: ['right', 'left', 'up', 'down'], it: [['the projector', 'projektor'], ['the bookshelf', 'rak buku'], ['the door', 'pintu']] },
  ];
  const phr = (c, a, b, sx, sy) => {
    const dx = CP[c.d[sx > 0 ? 0 : 1]], dy = CP[c.d[sy > 0 ? 2 : 3]];
    return [`${Math.abs(a)} ${c.u[0]} ${dx[0]} and ${Math.abs(b)} ${c.u[0]} ${dy[0]}`, `${Math.abs(a)} ${c.u[1]} ${dx[1]} dan ${Math.abs(b)} ${c.u[1]} ${dy[1]}`];
  };
  const cap1 = (s) => s[0].toUpperCase() + s.slice(1);
  const QW = (c, i) => (c.d === COMP ? [['north-east', 'timur laut'], ['north-west', 'barat laut'], ['south-west', 'barat daya'], ['south-east', 'tenggara']][i - 1] : [['the upper right', 'bahagian kanan atas'], ['the upper left', 'bahagian kiri atas'], ['the lower left', 'bahagian kiri bawah'], ['the lower right', 'bahagian kanan bawah']][i - 1]);
  const ctxTask = (lv) => (r) => {
    const c = r.pick(CTX), it = r.pick(c.it), it2 = r.pick(c.it.filter((x) => x !== it)), O = c.o;
    const a = r.int(2, 9), b = r.int(2, 9), sx = lv === 'e' ? 1 : r.sign(), sy = lv === 'e' ? 1 : r.sign();
    const P = [sx * a, sy * b], ph = phr(c, a, b, sx, sy), unit = c.u;
    const t = r.int(0, 2), v = r.int(0, 1);
    if (lv === 'e') {
      if (t === 0) return { q: v ? T(`${cap1(O[0])} is at the origin $(0, 0)$. ${cap1(it[0])} is ${ph[0]}. Write down the coordinates of ${it[0]}.`, `${cap1(O[1])} berada di asalan $(0, 0)$. ${cap1(it[1])} terletak ${ph[1]}. Tuliskan koordinat ${it[1]}.`) : T(`Taking ${O[0]} as the origin (1 unit = 1 ${unit[0].replace(/s$/, '')}), state the coordinates of ${it[0]}, which is ${ph[0]}.`, `Dengan mengambil ${O[1]} sebagai asalan (1 unit = 1 ${unit[1]}), nyatakan koordinat ${it[1]} yang terletak ${ph[1]}.`), a: T(`$${pt(P)}$`), w: W(T(`${cap1(CP[c.d[0]][0])} is the positive $x$-direction and ${CP[c.d[2]][0]} is the positive $y$-direction.`, `${cap1(CP[c.d[0]][1])} ialah arah-$x$ positif dan ${CP[c.d[2]][1]} ialah arah-$y$ positif.`), T(`So $x = ${a}$ and $y = ${b}$.`, `Jadi $x = ${a}$ dan $y = ${b}$.`), `$${pt(P)}$`), sp: 's' };
      if (t === 1) return { q: v ? T(`With ${O[0]} at the origin, ${it[0]} is at $${pt(P)}$. How far is ${it[0]} ${CP[c.d[0]][0]} of ${O[0]} and how far ${CP[c.d[2]][0]}?`, `Dengan ${O[1]} di asalan, ${it[1]} berada di $${pt(P)}$. Berapa jauhkah ${it[1]} ${CP[c.d[0]][1]} dari ${O[1]} dan berapa jauh ${CP[c.d[2]][1]}?`) : T(`${cap1(it[0])} is at $${pt(P)}$ on a grid where ${O[0]} is at $(0, 0)$. Describe its position from ${O[0]} using the directions ${CP[c.d[0]][0]} and ${CP[c.d[2]][0]}.`, `${cap1(it[1])} berada di $${pt(P)}$ pada satu grid dengan ${O[1]} di $(0, 0)$. Huraikan kedudukannya dari ${O[1]} menggunakan arah ${CP[c.d[0]][1]} dan ${CP[c.d[2]][1]}.`), a: T(`${a} ${unit[0]} ${CP[c.d[0]][0]}, ${b} ${unit[0]} ${CP[c.d[2]][0]}`, `${a} ${unit[1]} ${CP[c.d[0]][1]}, ${b} ${unit[1]} ${CP[c.d[2]][1]}`), w: W(T(`The $x$-coordinate $${P[0]}$ measures the distance ${CP[c.d[0]][0]}, and the $y$-coordinate $${P[1]}$ measures the distance ${CP[c.d[2]][0]}.`, `Koordinat-$x$ $${P[0]}$ mengukur jarak ${CP[c.d[0]][1]}, dan koordinat-$y$ $${P[1]}$ mengukur jarak ${CP[c.d[2]][1]}.`), T(`So it is ${a} ${unit[0]} ${CP[c.d[0]][0]} and ${b} ${unit[0]} ${CP[c.d[2]][0]}.`, `Jadi ia ${a} ${unit[1]} ${CP[c.d[0]][1]} dan ${b} ${unit[1]} ${CP[c.d[2]][1]}.`)), sp: 's' };
      const e = r.int(2, 6);
      return { q: T(`${cap1(it[0])} is at $${pt(P)}$. ${cap1(it2[0])} is ${e} ${unit[0]} ${CP[c.d[2]][0]} of ${it[0]}. Write down the coordinates of ${it2[0]}.`, `${cap1(it[1])} berada di $${pt(P)}$. ${cap1(it2[1])} terletak ${e} ${unit[1]} ${CP[c.d[2]][1]} dari ${it[1]}. Tuliskan koordinat ${it2[1]}.`), a: T(`$${pt([P[0], P[1] + e])}$`), w: W(T(`Moving ${CP[c.d[2]][0]} changes only the $y$-coordinate:`, `Bergerak ${CP[c.d[2]][1]} hanya mengubah koordinat-$y$:`), `$x = ${P[0]}$, $y = ${P[1]} + ${e} = ${P[1] + e}$`, `$${pt([P[0], P[1] + e])}$`), sp: 's' };
    }
    if (lv === 'm') {
      if (t === 0) return { q: T(`${cap1(O[0])} is at the origin. ${cap1(it[0])} is ${ph[0]}. Write down the coordinates of ${it[0]} and state the quadrant it is in.`, `${cap1(O[1])} berada di asalan. ${cap1(it[1])} terletak ${ph[1]}. Tuliskan koordinat ${it[1]} dan nyatakan sukuan tempat ia berada.`), a: T(`$${pt(P)}$; quadrant ${QR[QD(...P)]}`, `$${pt(P)}$; sukuan ${QR[QD(...P)]}`), w: W(T(`${cap1(CP[c.d[sx > 0 ? 0 : 1]][0])} gives $x = ${P[0]}$ and ${CP[c.d[sy > 0 ? 2 : 3]][0]} gives $y = ${P[1]}$.`, `${cap1(CP[c.d[sx > 0 ? 0 : 1]][1])} memberi $x = ${P[0]}$ dan ${CP[c.d[sy > 0 ? 2 : 3]][1]} memberi $y = ${P[1]}$.`), T(`The signs $(${P[0] > 0 ? '+' : '-'}, ${P[1] > 0 ? '+' : '-'})$ put it in quadrant ${QR[QD(...P)]}.`, `Tanda $(${P[0] > 0 ? '+' : '-'}, ${P[1] > 0 ? '+' : '-'})$ meletakkannya dalam sukuan ${QR[QD(...P)]}.`)), sp: 's' };
      if (t === 1) return { q: T(`${cap1(it[0])} is at $${pt(P)}$ where ${O[0]} is the origin. In which direction from ${O[0]} does it lie: ${QW(c, 1)[0]}, ${QW(c, 2)[0]}, ${QW(c, 3)[0]} or ${QW(c, 4)[0]}?`, `${cap1(it[1])} berada di $${pt(P)}$ dengan ${O[1]} sebagai asalan. Ke arah manakah ia terletak dari ${O[1]}: ${QW(c, 1)[1]}, ${QW(c, 2)[1]}, ${QW(c, 3)[1]} atau ${QW(c, 4)[1]}?`), a: T(`${cap1(QW(c, QD(...P))[0])}`, `${cap1(QW(c, QD(...P))[1])}`), w: W(T(`$${pt(P)}$ has $x ${P[0] > 0 ? '>' : '<'} 0$ and $y ${P[1] > 0 ? '>' : '<'} 0$, so it is in quadrant ${QR[QD(...P)]}.`, `$${pt(P)}$ mempunyai $x ${P[0] > 0 ? '>' : '<'} 0$ dan $y ${P[1] > 0 ? '>' : '<'} 0$, jadi ia berada dalam sukuan ${QR[QD(...P)]}.`), T(`That direction from the origin is ${QW(c, QD(...P))[0]}.`, `Arah itu dari asalan ialah ${QW(c, QD(...P))[1]}.`)), sp: 's' };
      const s = [r.nz(-5, 5), r.nz(-5, 5)], e = r.int(2, 6), f = r.int(2, 6), h = r.chance(), w = r.chance(), E = [s[0] + (h ? e : -e), s[1] + (w ? f : -f)];
      return { q: T(`${cap1(it[0])} is at $${pt(s)}$. It moves ${e} ${unit[0]} ${CP[c.d[h ? 0 : 1]][0]} and then ${f} ${unit[0]} ${CP[c.d[w ? 2 : 3]][0]}. Find its new coordinates and say in which quadrant it is now.`, `${cap1(it[1])} berada di $${pt(s)}$. Ia bergerak ${e} ${unit[1]} ${CP[c.d[h ? 0 : 1]][1]} dan kemudian ${f} ${unit[1]} ${CP[c.d[w ? 2 : 3]][1]}. Cari koordinat barunya dan nyatakan sukuan tempat ia berada sekarang.`), a: T(`$${pt(E)}$; ${qtxt(E).en}`, `$${pt(E)}$; ${qtxt(E).ms}`), w: W(T(`${cap1(CP[c.d[h ? 0 : 1]][0])} changes the $x$-coordinate and ${CP[c.d[w ? 2 : 3]][0]} changes the $y$-coordinate.`, `${cap1(CP[c.d[h ? 0 : 1]][1])} mengubah koordinat-$x$ dan ${CP[c.d[w ? 2 : 3]][1]} mengubah koordinat-$y$.`), `$x = ${n(s[0])} ${h ? '+' : '-'} ${e} = ${n(E[0])}$, $y = ${n(s[1])} ${w ? '+' : '-'} ${f} = ${n(E[1])}$`, T(`$${pt(E)}$ is ${qtxt(E).en}.`, `$${pt(E)}$ ${qtxt(E).ms}.`)), sp: 's' };
    }
    /* advanced */
    const A = [r.nz(-6, 6), r.nz(-6, 6)], B = [r.nz(-6, 6), r.nz(-6, 6)];
    need(A[0] !== B[0] && A[1] !== B[1]);
    if (t === 0) return { q: T(`${cap1(it[0])} is at $${pt(A)}$ and ${it2[0]} is at $${pt(B)}$. ${cap1(it[0])} first travels parallel to the $x$-axis and then parallel to the $y$-axis to reach ${it2[0]}. Find the coordinates of the point where it turns and the total distance travelled in ${unit[0]}.`, `${cap1(it[1])} berada di $${pt(A)}$ dan ${it2[1]} berada di $${pt(B)}$. ${cap1(it[1])} bergerak dahulu selari dengan paksi-$x$ dan kemudian selari dengan paksi-$y$ untuk sampai ke ${it2[1]}. Cari koordinat titik ia membelok dan jumlah jarak yang dilalui dalam ${unit[1]}.`), fig: PF([A, B], { x: [-8, 8], y: [-8, 8], scale: 17, segs: [{ a: A, b: [B[0], A[1]] }, { a: [B[0], A[1]], b: B }] }), a: T(`$${pt([B[0], A[1]])}$; ${Math.abs(B[0] - A[0]) + Math.abs(B[1] - A[1])} ${unit[0]}`, `$${pt([B[0], A[1]])}$; ${Math.abs(B[0] - A[0]) + Math.abs(B[1] - A[1])} ${unit[1]}`), w: W(T(`Moving parallel to the $x$-axis changes only $x$, so the turning point keeps $y = ${n(A[1])}$ and takes $x = ${n(B[0])}$.`, `Bergerak selari dengan paksi-$x$ hanya mengubah $x$, jadi titik belokan mengekalkan $y = ${n(A[1])}$ dan mengambil $x = ${n(B[0])}$.`), `$${pt([B[0], A[1]])}$`, `$|${n(B[0])} - ${bk(A[0])}| + |${n(B[1])} - ${bk(A[1])}| = ${Math.abs(B[0] - A[0])} + ${Math.abs(B[1] - A[1])} = ${Math.abs(B[0] - A[0]) + Math.abs(B[1] - A[1])}$`), sp: 'm' };
    if (t === 1) { const y = A[1]; return { q: T(`${cap1(it[0])} is at $${pt(A)}$ and ${it2[0]} is at $${pt([B[0], y])}$. Find how far apart they are, and which of the two is ${CP[c.d[0]][0]} of the other.`, `${cap1(it[1])} berada di $${pt(A)}$ dan ${it2[1]} berada di $${pt([B[0], y])}$. Cari jarak antara kedua-duanya, dan yang manakah berada ${CP[c.d[0]][1]} daripada yang satu lagi.`), a: T(`${Math.abs(B[0] - A[0])} ${unit[0]}; ${B[0] > A[0] ? it2[0] : it[0]} is further ${CP[c.d[0]][0]}`, `${Math.abs(B[0] - A[0])} ${unit[1]}; ${B[0] > A[0] ? it2[1] : it[1]} lebih jauh ${CP[c.d[0]][1]}`), w: W(T('Both places have the same $y$-coordinate, so use the difference of the $x$-coordinates:', 'Kedua-dua tempat mempunyai koordinat-$y$ yang sama, jadi gunakan beza koordinat-$x$:'), `$|${n(B[0])} - ${bk(A[0])}| = ${Math.abs(B[0] - A[0])}$`, T(`${cap1(B[0] > A[0] ? it2[0] : it[0])} has the larger $x$-coordinate, so it is further ${CP[c.d[0]][0]}.`, `${cap1(B[0] > A[0] ? it2[1] : it[1])} mempunyai koordinat-$x$ yang lebih besar, jadi ia lebih jauh ${CP[c.d[0]][1]}.`)), sp: 'm' }; }
    return { q: T(`${cap1(it[0])} is ${ph[0]}, and ${it2[0]} is ${phr(c, B[0], B[1], Math.sign(B[0]), Math.sign(B[1]))[0]}. (${cap1(O[0])} is the origin.) Write down the coordinates of both places and state whether they are in the same quadrant.`, `${cap1(it[1])} terletak ${ph[1]}, dan ${it2[1]} terletak ${phr(c, B[0], B[1], Math.sign(B[0]), Math.sign(B[1]))[1]}. (${cap1(O[1])} ialah asalan.) Tuliskan koordinat kedua-dua tempat itu dan nyatakan sama ada ia berada dalam sukuan yang sama.`), a: T(`$${pt(P)}$ and $${pt(B)}$; ${QD(...P) === QD(...B) ? 'same quadrant' : 'different quadrants'}`, `$${pt(P)}$ dan $${pt(B)}$; ${QD(...P) === QD(...B) ? 'sukuan yang sama' : 'sukuan berbeza'}`), w: W(T(`Reading each direction as a signed distance gives $${pt(P)}$ and $${pt(B)}$.`, `Membaca setiap arah sebagai jarak bertanda memberi $${pt(P)}$ dan $${pt(B)}$.`), T(`$${pt(P)}$ is in quadrant ${QR[QD(...P)]} and $${pt(B)}$ is in quadrant ${QR[QD(...B)]}, so they are ${QD(...P) === QD(...B) ? 'in the same quadrant' : 'in different quadrants'}.`, `$${pt(P)}$ berada dalam sukuan ${QR[QD(...P)]} dan $${pt(B)}$ berada dalam sukuan ${QR[QD(...B)]}, jadi ia ${QD(...P) === QD(...B) ? 'dalam sukuan yang sama' : 'dalam sukuan yang berbeza'}.`)), sp: 's' };
  };
  g71e.push(ctxTask('e'), ctxTask('e'), ctxTask('e'));
  g71m.push(ctxTask('m'), ctxTask('m'), ctxTask('m'));
  g71a.push(ctxTask('a'), ctxTask('a'));

  /* shapes read from the grid, ordering and counting */
  const SHP = [['triangle', 'segi tiga', 3], ['square', 'segi empat sama', 4], ['rectangle', 'segi empat tepat', 4], ['parallelogram', 'segi empat selari', 4], ['kite', 'lelayang', 4], ['trapezium', 'trapezium', 4], ['rhombus', 'rombus', 4]];
  const shapePts = (nm, r, lo, hi) => {
    const x = r.int(lo, hi - 6), y = r.int(lo, hi - 6), w = r.int(2, 5), h = r.int(2, 5);
    switch (nm) {
      case 'triangle': return [[x, y], [x + w + 1, y], [x + r.int(0, w), y + h]];
      case 'square': return [[x, y], [x + w, y], [x + w, y + w], [x, y + w]];
      case 'rectangle': need(w !== h); return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      case 'parallelogram': return [[x, y], [x + w, y], [x + w + 1, y + h], [x + 1, y + h]];
      case 'kite': return [[x + w, y], [x + 2 * w, y + h], [x + w, y + h + 2], [x, y + h]];
      case 'trapezium': return [[x, y], [x + w + 2, y], [x + w, y + h], [x + 1, y + h]];
      default: return [[x + w, y], [x + 2 * w, y + h], [x + w, y + 2 * h], [x, y + h]];
    }
  };
  const shapeQ = (lv) => (r) => {
    const s = r.pick(SHP.filter((x) => (lv === 'e' ? x[2] === 3 || x[0] === 'square' || x[0] === 'rectangle' : true))), P = shapePts(s[0], r, lv === 'e' ? 1 : -5, lv === 'e' ? 9 : 5);
    const stems = [T(`The diagram shows a ${s[0]}. Write down the coordinates of its vertices.`, `Rajah menunjukkan sebuah ${s[1]}. Tuliskan koordinat bucu-bucunya.`), T(`A ${s[0]} is drawn on a grid. State the coordinates of each vertex and say how many of the vertices lie above the $x$-axis.`, `Sebuah ${s[1]} dilukis pada grid. Nyatakan koordinat setiap bucu dan nyatakan berapa bucu yang berada di atas paksi-$x$.`)];
    const i = lv === 'e' ? 0 : r.int(0, 1);
    return { q: stems[i], fig: lv === 'e' ? PF1(P, { polys: [{ p: P }] }) : PF(P, { polys: [{ p: P }], x: [-8, 8], y: [-8, 8], scale: 17 }), a: T(P.map((p, j) => `$${LET[j]} = ${pt(p)}$`).join(', ') + (i ? `; ${P.filter((p) => p[1] > 0).length} above the $x$-axis` : ''), P.map((p, j) => `$${LET[j]} = ${pt(p)}$`).join(', ') + (i ? `; ${P.filter((p) => p[1] > 0).length} di atas paksi-$x$` : '')), w: W(T('Read each vertex across first, then up:', 'Baca setiap bucu merentas dahulu, kemudian ke atas:'), T(P.map((p, j) => `$${LET[j]} = ${pt(p)}$`).join(', '), P.map((p, j) => `$${LET[j]} = ${pt(p)}$`).join(', ')), ...(i ? [T(`A vertex is above the $x$-axis when its $y$-coordinate is positive: ${P.filter((p) => p[1] > 0).length} of them.`, `Bucu berada di atas paksi-$x$ apabila koordinat-$y$nya positif: ${P.filter((p) => p[1] > 0).length} daripadanya.`)] : [])), sp: 's' };
  };
  g71e.push(shapeQ('e'));
  g71m.push(shapeQ('m'));
  g71m.push(
    /* ordering and counting */
    (r) => {
      const P = []; while (P.length < 6) { const p = [r.int(-7, 7), r.int(-7, 7)]; if (!P.some((q) => q[0] === p[0] || q[1] === p[1] || Math.abs(q[0]) === Math.abs(p[0]))) P.push(p); }
      const t = r.int(0, 5), list = P.map((p) => `$${pt(p)}$`).join(', ');
      if (t < 4) { const qd = t + 1, cnt = P.filter((p) => QD(...p) === qd); return { q: T(`How many of the points ${list} lie in quadrant ${QR[qd]}? Write them down.`, `Berapakah bilangan titik ${list} yang terletak dalam sukuan ${QR[qd]}? Tuliskannya.`), a: T(cnt.length ? `${cnt.length}: ${cnt.map((p) => `$${pt(p)}$`).join(', ')}` : 'None', cnt.length ? `${cnt.length}: ${cnt.map((p) => `$${pt(p)}$`).join(', ')}` : 'Tiada'), w: W(T(`Quadrant ${QR[qd]} needs $x ${qd === 1 || qd === 4 ? '>' : '<'} 0$ and $y ${qd === 1 || qd === 2 ? '>' : '<'} 0$.`, `Sukuan ${QR[qd]} memerlukan $x ${qd === 1 || qd === 4 ? '>' : '<'} 0$ dan $y ${qd === 1 || qd === 2 ? '>' : '<'} 0$.`), cnt.length ? T(`The points that satisfy this are ${cnt.map((p) => `$${pt(p)}$`).join(', ')}.`, `Titik yang memenuhinya ialah ${cnt.map((p) => `$${pt(p)}$`).join(', ')}.`) : T('None of the points satisfies this.', 'Tiada titik yang memenuhinya.')), sp: 's' }; }
      if (t === 4) { const s = P.slice().sort((a, b) => a[0] - b[0]); return { q: T(`Arrange the points ${list} in order, from the point furthest to the left to the point furthest to the right.`, `Susun titik ${list} mengikut tertib, dari titik yang paling kiri ke titik yang paling kanan.`), a: T(s.map((p) => `$${pt(p)}$`).join(', ')), w: W(T('Further left means a smaller $x$-coordinate, so sort by $x$:', 'Lebih ke kiri bermakna koordinat-$x$ yang lebih kecil, jadi susun mengikut $x$:'), `$${s.map((p) => n(p[0])).join(' < ')}$`), sp: 's' }; }
      const s = P.slice().sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]));
      need(new Set(P.map((p) => Math.abs(p[1]))).size === 6);
      return { q: T(`Arrange the points ${list} in order of their distance from the $x$-axis, nearest first.`, `Susun titik ${list} mengikut jarak dari paksi-$x$, yang paling dekat dahulu.`), a: T(s.map((p) => `$${pt(p)}$`).join(', ')), w: W(T('The distance from the $x$-axis is $|y|$, so sort these values:', 'Jarak dari paksi-$x$ ialah $|y|$, jadi susun nilai ini:'), `$${s.map((p) => Math.abs(p[1])).join(' < ')}$`), sp: 's' };
    },
    /* lines x = k and y = k */
    (r) => {
      const k = r.nz(-6, 6), t = r.int(0, 3), xs = r.sample([-5, -3, -2, 0, 1, 2, 4, 5], 3);
      if (t === 0) return { q: T(`Write down the coordinates of three points on the line $x = ${k}$. What kind of line is it?`, `Tuliskan koordinat tiga titik pada garis $x = ${k}$. Apakah jenis garis itu?`), a: T(`For example $(${k}, 0)$, $(${k}, 2)$, $(${k}, -3)$; a vertical line`, `Contohnya $(${k}, 0)$, $(${k}, 2)$, $(${k}, -3)$; garis mencancang`), w: W(T(`Every point on $x = ${k}$ has $x$-coordinate $${k}$, while the $y$-coordinate can be anything.`, `Setiap titik pada $x = ${k}$ mempunyai koordinat-$x$ $${k}$, manakala koordinat-$y$ boleh apa sahaja.`), `$(${k}, 0)$, $(${k}, 2)$, $(${k}, -3)$`, T('All such points are one above another, so the line is vertical.', 'Semua titik sedemikian berada satu di atas yang lain, jadi garis itu mencancang.')), sp: 's' };
      if (t === 1) return { q: T(`Write down the coordinates of three points on the line $y = ${k}$. What kind of line is it?`, `Tuliskan koordinat tiga titik pada garis $y = ${k}$. Apakah jenis garis itu?`), a: T(`For example $(0, ${k})$, $(2, ${k})$, $(-3, ${k})$; a horizontal line`, `Contohnya $(0, ${k})$, $(2, ${k})$, $(-3, ${k})$; garis mengufuk`), w: W(T(`Every point on $y = ${k}$ has $y$-coordinate $${k}$, while the $x$-coordinate can be anything.`, `Setiap titik pada $y = ${k}$ mempunyai koordinat-$y$ $${k}$, manakala koordinat-$x$ boleh apa sahaja.`), `$(0, ${k})$, $(2, ${k})$, $(-3, ${k})$`, T('All such points are at the same height, so the line is horizontal.', 'Semua titik sedemikian berada pada ketinggian yang sama, jadi garis itu mengufuk.')), sp: 's' };
      const pts = xs.map((x, i) => (i === 1 ? [x, k + 1] : [x, k]));
      const P = t === 2 ? pts : pts.map((p) => [p[1], p[0]]);
      const on = P.filter((p) => (t === 2 ? p[1] === k : p[0] === k));
      return { q: T(`Which of the points ${P.map((p) => `$${pt(p)}$`).join(', ')} lie on the line $${t === 2 ? 'y' : 'x'} = ${k}$?`, `Antara titik ${P.map((p) => `$${pt(p)}$`).join(', ')}, yang manakah terletak pada garis $${t === 2 ? 'y' : 'x'} = ${k}$?`), a: T(on.map((p) => `$${pt(p)}$`).join(', ')), w: W(T(`A point lies on $${t === 2 ? 'y' : 'x'} = ${k}$ exactly when its $${t === 2 ? 'y' : 'x'}$-coordinate is $${k}$.`, `Satu titik terletak pada $${t === 2 ? 'y' : 'x'} = ${k}$ tepat apabila koordinat-$${t === 2 ? 'y' : 'x'}$nya ialah $${k}$.`), T(`That is true for ${on.map((p) => `$${pt(p)}$`).join(', ')}.`, `Itu betul bagi ${on.map((p) => `$${pt(p)}$`).join(', ')}.`)), sp: 's' };
    },
    /* position from distances to the axes */
    (r) => {
      const a = r.int(1, 8), b = r.int(1, 8), sx = r.sign(), sy = r.sign();
      const nx = sx > 0 ? ['to the right of the $y$-axis', 'di sebelah kanan paksi-$y$'] : ['to the left of the $y$-axis', 'di sebelah kiri paksi-$y$'], ny = sy > 0 ? ['above the $x$-axis', 'di atas paksi-$x$'] : ['below the $x$-axis', 'di bawah paksi-$x$'];
      return { q: T(`A point is ${a} units ${nx[0]} and ${b} units ${ny[0]}. Write down its coordinates.`, `Satu titik berada ${a} unit ${nx[1]} dan ${b} unit ${ny[1]}. Tuliskan koordinatnya.`), a: T(`$${pt([sx * a, sy * b])}$`), w: W(T(`Being ${nx[0]} makes $x$ ${sx > 0 ? 'positive' : 'negative'}; being ${ny[0]} makes $y$ ${sy > 0 ? 'positive' : 'negative'}.`, `Berada ${nx[1]} menjadikan $x$ ${sx > 0 ? 'positif' : 'negatif'}; berada ${ny[1]} menjadikan $y$ ${sy > 0 ? 'positif' : 'negatif'}.`), `$x = ${n(sx * a)}$, $y = ${n(sy * b)}$`, `$${pt([sx * a, sy * b])}$`), sp: 's' };
    },
  );
  g71a.push(
    /* complete the table */
    (r) => {
      const P = [[r.nz(-6, 6), r.nz(-6, 6)], [r.nz(-6, 6), r.nz(-6, 6)], [r.nz(-6, 6), r.nz(-6, 6)]], t = r.int(0, 1);
      const rows = P.map((p, i) => (t === 0 ? [`$${LET[i]}$`, `$${p[0]}$`, `$${p[1]}$`, '?'] : [`$${LET[i]}$`, '?', '?', QR[QD(...p)]]));
      const head = ['Point', '$x$', '$y$', 'Quadrant'], headM = ['Titik', '$x$', '$y$', 'Sukuan'];
      const tb = (h) => SPM.table(rows, { head: h });
      if (t === 0) return { q: T(`Complete the last column of the table.<br>${tb(head).replace(/<td>\$-?\d+\$<\/td><td>\$-?\d+\$<\/td>/g, (m) => m)}`, `Lengkapkan lajur terakhir jadual itu.<br>${tb(headM)}`), a: T(P.map((p, i) => `${LET[i]}: ${QR[QD(...p)]}`).join('; ')), w: W(T('Use the signs of $x$ and $y$: $(+, +)$ is I, $(-, +)$ is II, $(-, -)$ is III and $(+, -)$ is IV.', 'Gunakan tanda $x$ dan $y$: $(+, +)$ ialah I, $(-, +)$ ialah II, $(-, -)$ ialah III dan $(+, -)$ ialah IV.'), T(P.map((p, i) => `${LET[i]}: $(${p[0] > 0 ? '+' : '-'}, ${p[1] > 0 ? '+' : '-'})$, quadrant ${QR[QD(...p)]}`).join('; '), P.map((p, i) => `${LET[i]}: $(${p[0] > 0 ? '+' : '-'}, ${p[1] > 0 ? '+' : '-'})$, sukuan ${QR[QD(...p)]}`).join('; '))), sp: 's' };
      const sx = (p) => (p[0] > 0 ? 'positive' : 'negative'), sy = (p) => (p[1] > 0 ? 'positive' : 'negative');
      return { q: T(`The table shows the quadrant of three points. For each point, state whether its $x$-coordinate and $y$-coordinate are positive or negative.<br>${tb(head)}`, `Jadual menunjukkan sukuan bagi tiga titik. Bagi setiap titik, nyatakan sama ada koordinat-$x$ dan koordinat-$y$ positif atau negatif.<br>${tb(headM)}`), a: T(P.map((p, i) => `${LET[i]}: $x$ ${sx(p)}, $y$ ${sy(p)}`).join('; '), P.map((p, i) => `${LET[i]}: $x$ ${p[0] > 0 ? 'positif' : 'negatif'}, $y$ ${p[1] > 0 ? 'positif' : 'negatif'}`).join('; ')), w: W(T('Quadrant I is $(+, +)$, II is $(-, +)$, III is $(-, -)$ and IV is $(+, -)$.', 'Sukuan I ialah $(+, +)$, II ialah $(-, +)$, III ialah $(-, -)$ dan IV ialah $(+, -)$.'), T(P.map((p, i) => `${LET[i]}: quadrant ${QR[QD(...p)]}, so $(${p[0] > 0 ? '+' : '-'}, ${p[1] > 0 ? '+' : '-'})$`).join('; '), P.map((p, i) => `${LET[i]}: sukuan ${QR[QD(...p)]}, jadi $(${p[0] > 0 ? '+' : '-'}, ${p[1] > 0 ? '+' : '-'})$`).join('; '))), sp: 's' };
    },
    /* symmetry */
    (r) => {
      const a = r.int(1, 7), b = r.int(1, 7), t = r.int(0, 2);
      need(a !== b);
      if (t === 0) return { q: T(`The points $A = ${pt([a, b])}$ and $B$ are symmetrical about the $y$-axis. Write down the coordinates of $B$, and find the length of $AB$.`, `Titik $A = ${pt([a, b])}$ dan $B$ adalah simetri pada paksi-$y$. Tuliskan koordinat $B$, dan cari panjang $AB$.`), a: T(`$B = ${pt([-a, b])}$; $AB = ${2 * a}$ units`, `$B = ${pt([-a, b])}$; $AB = ${2 * a}$ unit`), w: W(T('Symmetry about the $y$-axis changes the sign of the $x$-coordinate and keeps the $y$-coordinate:', 'Simetri pada paksi-$y$ menukar tanda koordinat-$x$ dan mengekalkan koordinat-$y$:'), `$B = ${pt([-a, b])}$`, T(`$A$ and $B$ are at the same height, so $AB = ${a} + ${a} = ${2 * a}$.`, `$A$ dan $B$ berada pada ketinggian yang sama, jadi $AB = ${a} + ${a} = ${2 * a}$.`)), sp: 's' };
      if (t === 1) return { q: T(`The points $A = ${pt([a, b])}$ and $C$ are symmetrical about the $x$-axis. Write down the coordinates of $C$, and find the length of $AC$.`, `Titik $A = ${pt([a, b])}$ dan $C$ adalah simetri pada paksi-$x$. Tuliskan koordinat $C$, dan cari panjang $AC$.`), a: T(`$C = ${pt([a, -b])}$; $AC = ${2 * b}$ units`, `$C = ${pt([a, -b])}$; $AC = ${2 * b}$ unit`), w: W(T('Symmetry about the $x$-axis changes the sign of the $y$-coordinate and keeps the $x$-coordinate:', 'Simetri pada paksi-$x$ menukar tanda koordinat-$y$ dan mengekalkan koordinat-$x$:'), `$C = ${pt([a, -b])}$`, T(`$A$ and $C$ are on the same vertical line, so $AC = ${b} + ${b} = ${2 * b}$.`, `$A$ dan $C$ berada pada garis mencancang yang sama, jadi $AC = ${b} + ${b} = ${2 * b}$.`)), sp: 's' };
      return { q: T(`The points $A = ${pt([a, b])}$, $B = ${pt([-a, b])}$, $C = ${pt([-a, -b])}$ and $D$ form a rectangle. Write down the coordinates of $D$ and find the area of the rectangle.`, `Titik $A = ${pt([a, b])}$, $B = ${pt([-a, b])}$, $C = ${pt([-a, -b])}$ dan $D$ membentuk sebuah segi empat tepat. Tuliskan koordinat $D$ dan cari luas segi empat tepat itu.`), fig: PF([[a, b], [-a, b], [-a, -b]], { x: [-8, 8], y: [-8, 8], scale: 17 }), a: T(`$D = ${pt([a, -b])}$; area ${4 * a * b} square units`, `$D = ${pt([a, -b])}$; luas ${4 * a * b} unit persegi`), w: W(T(`$D$ must be directly below $A$ and directly right of $C$, so $D = ${pt([a, -b])}$.`, `$D$ mesti tepat di bawah $A$ dan tepat di kanan $C$, jadi $D = ${pt([a, -b])}$.`), T(`The width is $${a} + ${a} = ${2 * a}$ and the height is $${b} + ${b} = ${2 * b}$.`, `Lebarnya ialah $${a} + ${a} = ${2 * a}$ dan tingginya ialah $${b} + ${b} = ${2 * b}$.`), `$${2 * a} \\times ${2 * b} = ${4 * a * b}$`), sp: 's' };
    },
  );
  SPM.extend('F2-7.1', { e: g71e, m: g71m, a: g71a });
})();
