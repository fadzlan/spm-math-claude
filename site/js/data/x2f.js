/* Variety pack x2f: Form 2 Chapter 11 Isometric Transformations (topics 11.1 - 11.6). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, round } = SPM;
  const T = SPM.L, S = SPM.svg;

  /* ------------------------------------------------------------------ basics */
  const pt = (p) => `(${n(p[0])}, ${n(p[1])})`;
  const pts = (a) => a.map(pt).join(',\\ ');
  const tv = (v) => `\\begin{pmatrix} ${n(v[0])} \\\\ ${n(v[1])} \\end{pmatrix}`;
  const addv = (p, v) => [p[0] + v[0], p[1] + v[1]];
  const subv = (p, v) => [p[0] - v[0], p[1] - v[1]];
  const d2 = (p, q) => (p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]);
  const same = (p, q) => p[0] === q[0] && p[1] === q[1];
  const inb = (list, lim) => list.every((p) => Math.abs(p[0]) <= lim && Math.abs(p[1]) <= lim);
  const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
  const area2 = (P) => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s); };
  const u = (k) => (k === 1 ? '1 unit' : `${k} units`);
  const isq = (k) => Math.round(Math.sqrt(k)) ** 2 === k;
  const LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ABCD = 'ABCD';

  /** vertex-name sets by number of vertices */
  const NAMESETS = { 1: ['P', 'Q', 'R', 'A', 'B', 'K'], 2: ['AB', 'PQ', 'KL', 'RS'], 3: ['ABC', 'PQR', 'KLM', 'XYZ', 'DEF', 'LMN', 'RST', 'UVW'], 4: ['ABCD', 'PQRS', 'KLMN', 'WXYZ', 'EFGH'], 5: ['ABCDE', 'PQRST', 'KLMNO'], 6: ['ABCDEF', 'PQRSTU'] };
  const nm = (r, k) => r.pick(NAMESETS[k]).split('');

  /** movement described in words */
  const moveEN = (v) => {
    const a = [];
    if (v[0]) a.push(`${u(Math.abs(v[0]))} to the ${v[0] > 0 ? 'right' : 'left'}`);
    if (v[1]) a.push(`${u(Math.abs(v[1]))} ${v[1] > 0 ? 'upwards' : 'downwards'}`);
    return a.join(' and ');
  };
  const moveMS = (v) => {
    const a = [];
    if (v[0]) a.push(`${Math.abs(v[0])} unit ke ${v[0] > 0 ? 'kanan' : 'kiri'}`);
    if (v[1]) a.push(`${Math.abs(v[1])} unit ke ${v[1] > 0 ? 'atas' : 'bawah'}`);
    return a.join(' dan ');
  };
  const move = (v) => T(moveEN(v), moveMS(v));

  /** join bilingual pieces */
  const C = SPM.cat;
  /** pick a [en, ms] pair and wrap as bilingual */
  const pkT = (r, list) => { const x = r.pick(list); return T(x[0], x[1]); };
  /** multiple choice: correct L + list of wrong L -> { opts: L (html), ans: L } */
  const mcq = (r, correct, wrong) => {
    const all = r.shuffle([{ c: true, x: correct }].concat(wrong.map((x) => ({ c: false, x }))));
    const idx = all.findIndex((o) => o.c);
    const f = (k) => '<br>' + all.map((o, i) => `<b>${LET[i]}.</b> ${o.x[k]}`).join('&emsp; ');
    return { opts: T(f('en'), f('ms')), ans: T(`${LET[idx]}. ${correct.en}`, `${LET[idx]}. ${correct.ms}`), letter: LET[idx] };
  };
  const angEN = (d, dir) => `${d}° ${dir === 'cw' ? 'clockwise' : 'anticlockwise'}`;
  const dirL = (dir) => T(dir === 'cw' ? 'clockwise' : 'anticlockwise', dir === 'cw' ? 'ikut arah jam' : 'lawan arah jam');
  const turnL = (ang, dir) => T(`$${ang}^\\circ$ ${dir === 'cw' ? 'clockwise' : 'anticlockwise'}`, `$${ang}^\\circ$ ${dir === 'cw' ? 'ikut arah jam' : 'lawan arah jam'}`);

  /* ------------------------------------------------------- transformations */
  /** rotate p about c through ang (90/180/270) in direction dir ('cw' | 'ccw') */
  const rotate = (p, c, ang, dir) => {
    const a = dir === 'cw' ? (360 - ang) % 360 : ang % 360;
    const dx = p[0] - c[0], dy = p[1] - c[1];
    const [x, y] = a === 90 ? [-dy, dx] : a === 180 ? [-dx, -dy] : a === 270 ? [dy, -dx] : [dx, dy];
    return [c[0] + x, c[1] + y];
  };
  /** mirror lines: kind 'x' => x = k ; 'y' => y = k ; 'd1' => y = x + k ; 'd2' => y = -x + k */
  const mirror = (kind, k) => {
    const K = k || 0;
    if (kind === 'x') return { a: 1, b: 0, c: K, kind, k: K, eq: `x = ${n(K)}`, name: K === 0 ? T('the $y$-axis', 'paksi-$y$') : null };
    if (kind === 'y') return { a: 0, b: 1, c: K, kind, k: K, eq: `y = ${n(K)}`, name: K === 0 ? T('the $x$-axis', 'paksi-$x$') : null };
    if (kind === 'd1') return { a: -1, b: 1, c: K, kind, k: K, eq: `y = ${SPM.poly([[1, 'x'], [K, '']])}` };
    return { a: 1, b: 1, c: K, kind, k: K, eq: `y = ${SPM.poly([[-1, 'x'], [K, '']])}` };
  };
  const reflect = (p, l) => {
    const dd = (l.a * p[0] + l.b * p[1] - l.c) / (l.a * l.a + l.b * l.b);
    return [p[0] - 2 * dd * l.a, p[1] - 2 * dd * l.b];
  };
  const mline = (l) => (l.name ? l.name : T(`the line $${l.eq}$`, `garis $${l.eq}$`));
  const mlineEq = (l) => `$${l.eq}$`;

  /* -------------------------------------------------------------- shapes */
  const BASES = {
    tri: [[[0, 0], [3, 0], [0, 2]], [[0, 0], [4, 0], [1, 3]], [[0, 0], [4, 1], [2, 3]], [[0, 0], [3, 1], [1, 3]], [[0, 0], [2, 0], [3, 3]], [[0, 0], [4, 0], [4, 2]], [[0, 0], [3, 0], [1, 4]], [[0, 0], [2, 1], [0, 4]]],
    quad: [[[0, 0], [4, 0], [4, 2], [0, 2]], [[0, 0], [3, 0], [4, 2], [1, 2]], [[0, 0], [4, 0], [3, 2], [1, 2]], [[0, 0], [4, 1], [2, 3], [0, 2]], [[0, 0], [3, 0], [3, 3], [0, 3]], [[0, 0], [4, 0], [3, 3], [1, 2]], [[0, 0], [3, 1], [0, 3], [1, 1]]],
    pent: [[[0, 0], [4, 0], [4, 2], [2, 4], [0, 2]], [[0, 0], [3, 0], [3, 2], [2, 3], [0, 3]], [[0, 0], [3, 0], [4, 2], [2, 3], [0, 2]]],
    hex: [[[0, 0], [3, 0], [3, 1], [1, 1], [1, 3], [0, 3]], [[0, 0], [4, 0], [4, 1], [2, 1], [2, 2], [0, 2]], [[0, 0], [2, 0], [2, 1], [4, 1], [4, 2], [0, 2]]],
  };
  const dih = (p, t) => { const [x, y] = t & 4 ? [p[1], p[0]] : p; const q = t & 3; return q === 0 ? [x, y] : q === 1 ? [-y, x] : q === 2 ? [-x, -y] : [y, -x]; };
  /** random placed polygon (integer vertices). kind: tri | quad | pent | hex ; lim = max |coordinate| */
  const shape = (r, kind, lim) => retry(() => {
    const tt = r.int(0, 7);
    const base = r.pick(BASES[kind]).map((p) => dih(p, tt));
    const mx = Math.min(...base.map((p) => p[0])), my = Math.min(...base.map((p) => p[1]));
    const B = base.map((p) => [p[0] - mx, p[1] - my]);
    const w = Math.max(...B.map((p) => p[0])), h = Math.max(...B.map((p) => p[1]));
    need(w <= 2 * lim && h <= 2 * lim);
    const ox = r.int(-lim, lim - w), oy = r.int(-lim, lim - h);
    return B.map((p) => [p[0] + ox, p[1] + oy]);
  });
  /** random scalene triangle with integer vertices in [-lim, lim] */
  const scalene = (r, lim, span) => retry(() => {
    const s = span || 4;
    const ox = r.int(-lim, lim - s), oy = r.int(-lim, lim - s);
    const P = [0, 1, 2].map(() => [ox + r.int(0, s), oy + r.int(0, s)]);
    need(Math.abs(cross(P[0], P[1], P[2])) >= 5);
    const a = d2(P[0], P[1]), b = d2(P[1], P[2]), c = d2(P[0], P[2]);
    need(a !== b && b !== c && a !== c);
    return P;
  });
  const anyShape = (r, lim) => shape(r, r.pick(['tri', 'tri', 'quad', 'quad', 'pent', 'hex']), lim);
  const KIND_OF = { 3: 'tri', 4: 'quad', 5: 'pent', 6: 'hex' };
  const NOUN = {
    1: ['point', 'titik'], 2: ['line segment', 'tembereng garis'], 3: ['triangle', 'segi tiga'], 4: ['quadrilateral', 'sisi empat'], 5: ['pentagon', 'pentagon'], 6: ['hexagon', 'heksagon'],
  };
  const noun = (k) => T(NOUN[k][0], NOUN[k][1]);

  /* ------------------------------------------------------------- figures */
  const lineClip = (l, w) => {
    const [x0, x1, y0, y1] = w;
    const c = [];
    if (l.b !== 0) for (const x of [x0, x1]) { const y = (l.c - l.a * x) / l.b; if (y >= y0 - 1e-9 && y <= y1 + 1e-9) c.push([x, y]); }
    if (l.a !== 0) for (const y of [y0, y1]) { const x = (l.c - l.b * y) / l.a; if (x >= x0 - 1e-9 && x <= x1 + 1e-9) c.push([x, y]); }
    const out = [];
    for (const p of c) if (!out.some((q) => Math.abs(q[0] - p[0]) < 1e-6 && Math.abs(q[1] - p[1]) < 1e-6)) out.push(p);
    return out.length >= 2 ? [out[0], out[1]] : null;
  };
  const arcPts = (c, p, deg, dir) => {
    const R = Math.hypot(p[0] - c[0], p[1] - c[1]);
    const a0 = Math.atan2(p[1] - c[1], p[0] - c[0]);
    const out = [];
    const steps = Math.max(6, Math.round(deg / 6));
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (dir === 'cw' ? -1 : 1) * ((deg * Math.PI) / 180) * (i / steps);
      out.push([c[0] + R * Math.cos(a), c[1] + R * Math.sin(a)]);
    }
    return out;
  };
  /**
   * Grid figure. o = { items, axes (default true), win:[x0,x1,y0,y1], sc }
   * items: {t:'poly', p, names:[..], prime:"'"|'', style:'obj'|'img'|'plain', nolab}
   *        {t:'line', l:{a,b,c}, label, dash}   {t:'dot', p, l, dx, dy}   {t:'arrow', from, to, dash}
   *        {t:'turn', c, p, deg, dir}          {t:'text', p, s}
   */
  const render = (o) => {
    const items = o.items;
    const xs = [], ys = [];
    const acc = (p) => { xs.push(p[0]); ys.push(p[1]); };
    for (const it of items) {
      if (it.t === 'poly') it.p.forEach(acc);
      else if (it.t === 'dot' || it.t === 'text') acc(it.p);
      else if (it.t === 'arrow') { acc(it.from); acc(it.to); }
      else if (it.t === 'turn') { acc(it.c); arcPts(it.c, it.p, it.deg, it.dir).forEach(acc); }
    }
    const axes = o.axes !== false;
    let w = o.win;
    if (!w) {
      let x0 = Math.min(...xs) - 1, x1 = Math.max(...xs) + 1, y0 = Math.min(...ys) - 1, y1 = Math.max(...ys) + 1;
      if (axes) { x0 = Math.min(x0, -1); y0 = Math.min(y0, -1); x1 = Math.max(x1, 1); y1 = Math.max(y1, 1); }
      x0 = Math.floor(x0); y0 = Math.floor(y0); x1 = Math.ceil(x1); y1 = Math.ceil(y1);
      while (x1 - x0 < 6) { x0--; x1++; }
      while (y1 - y0 < 5) { y0--; y1++; }
      w = [x0, x1, y0, y1];
    }
    const [x0, x1, y0, y1] = w;
    const sc = o.sc || Math.max(11, Math.min(26, Math.floor(330 / (x1 - x0)), Math.floor(290 / (y1 - y0))));
    const pad = 16;
    const W = (x1 - x0) * sc + 2 * pad + (axes ? 8 : 0), H = (y1 - y0) * sc + 2 * pad + (axes ? 6 : 0);
    const sx = (x) => pad + (x - x0) * sc, sy = (y) => pad + (y1 - y) * sc;
    let out = '';
    for (let x = x0; x <= x1; x++) out += S.line(sx(x), sy(y0), sx(x), sy(y1), { w: 0.5, op: 0.22 });
    for (let y = y0; y <= y1; y++) out += S.line(sx(x0), sy(y), sx(x1), sy(y), { w: 0.5, op: 0.22 });
    if (axes) {
      out += S.arrow(sx(x0) - 2, sy(0), sx(x1) + 8, sy(0), { w: 1.2 }) + S.arrow(sx(0), sy(y0) + 2, sx(0), sy(y1) - 8, { w: 1.2 });
      out += S.text(sx(x1) + 8, sy(0) + 11, 'x', { i: true, s: 12 }) + S.text(sx(0) + 10, sy(y1) - 8, 'y', { i: true, s: 12 });
      const st = Math.max(x1 - x0, y1 - y0) > 14 ? 2 : 1;
      for (let x = x0; x <= x1; x++) if (x !== 0 && x % st === 0) out += S.text(sx(x), sy(0) + 10, n(x), { s: 10 });
      for (let y = y0; y <= y1; y++) if (y !== 0 && y % st === 0) out += S.text(sx(0) - 9, sy(y), n(y), { s: 10 });
      out += S.text(sx(0) - 8, sy(0) + 10, 'O', { s: 10 });
    } else out += S.rect(sx(x0), sy(y1), (x1 - x0) * sc, (y1 - y0) * sc, { stroke: 'currentColor' });
    for (const it of items) {
      if (it.t === 'poly' && it.p.length === 1) {
        const p = it.p[0];
        out += it.style === 'img' ? S.circle(sx(p[0]), sy(p[1]), 3.4, { fill: 'var(--bg,#fff)' }) : S.dot(sx(p[0]), sy(p[1]), 3);
        if (it.names && !it.nolab) out += S.text(sx(p[0]) + 10, sy(p[1]) - 10, it.names[0] + (it.prime || ''), { i: true, s: 12 });
      } else if (it.t === 'poly') {
        const P = it.p.map((p) => [sx(p[0]), sy(p[1])]);
        const st = it.style || 'obj';
        out += S.poly(P, { fill: st === 'plain' ? undefined : 'currentColor', op: st === 'obj' ? 0.2 : 0.06, dash: st === 'img', w: st === 'obj' ? 1.6 : 1.4 });
        const cx = P.reduce((s, q) => s + q[0], 0) / P.length, cy = P.reduce((s, q) => s + q[1], 0) / P.length;
        it.p.forEach((p, i) => {
          out += S.dot(P[i][0], P[i][1], 2.2);
          if (it.names && !it.nolab && it.names[i]) {
            const dx = P[i][0] - cx, dy = P[i][1] - cy, l = Math.hypot(dx, dy) || 1;
            out += S.text(P[i][0] + (dx / l) * 12, P[i][1] + (dy / l) * 12, it.names[i] + (it.prime || ''), { i: true, s: 12 });
          }
        });
      } else if (it.t === 'line') {
        const seg = lineClip(it.l, w);
        if (seg) {
          out += S.line(sx(seg[0][0]), sy(seg[0][1]), sx(seg[1][0]), sy(seg[1][1]), { w: 1.8, dash: it.dash });
          if (it.label) {
            const top = seg[0][1] >= seg[1][1] ? seg[0] : seg[1];
            const right = seg[0][0] >= seg[1][0] ? seg[0] : seg[1];
            const e = it.l.b === 0 ? top : right;
            out += S.text(sx(e[0]) + (it.l.b === 0 ? 12 : -14), sy(e[1]) + (it.l.b === 0 ? 10 : 12), it.label, { i: true, s: 12 });
          }
        }
      } else if (it.t === 'dot') {
        out += S.dot(sx(it.p[0]), sy(it.p[1]), 3);
        if (it.l) out += S.text(sx(it.p[0]) + (it.dx === undefined ? 9 : it.dx), sy(it.p[1]) + (it.dy === undefined ? -9 : it.dy), it.l, { i: true, s: 12 });
      } else if (it.t === 'arrow') {
        out += S.arrow(sx(it.from[0]), sy(it.from[1]), sx(it.to[0]), sy(it.to[1]), { dash: it.dash, w: 1.1 });
      } else if (it.t === 'turn') {
        const A = arcPts(it.c, it.p, it.deg, it.dir).map((p) => [sx(p[0]), sy(p[1])]);
        out += S.poly(A.slice(0, -1), { open: true, dash: true, w: 1.1 });
        out += S.arrow(A[A.length - 2][0], A[A.length - 2][1], A[A.length - 1][0], A[A.length - 1][1], { w: 1.1 });
      } else if (it.t === 'text') out += S.text(sx(it.p[0]), sy(it.p[1]), it.s, { i: true, s: 12 });
    }
    return S.wrap(W, H, out, 'grid diagram');
  };
  /** object (solid) + optional image (dashed) figure. o = { O, I, names, mirror, centre, arrows, axes, extra, noImgLab } */
  const fig = (o) => {
    const items = [];
    if (o.mirror) items.push({ t: 'line', l: o.mirror, label: o.mirrorLabel || o.mirror.figLabel });
    items.push({ t: 'poly', p: o.O, names: o.names, prime: '', style: 'obj', nolab: o.noObjLab });
    if (o.I) items.push({ t: 'poly', p: o.I, names: o.names, prime: "'", style: 'img', nolab: o.noImgLab });
    for (const a of o.arrows || []) items.push({ t: 'arrow', from: a[0], to: a[1], dash: true });
    if (o.centre) items.push({ t: 'dot', p: o.centre, l: o.centreLabel === undefined ? 'C' : o.centreLabel });
    for (const e of o.extra || []) items.push(e);
    return render({ items, axes: o.axes, win: o.win });
  };

  /** template filler: pair = [en, ms] with {key} placeholders; vars values are strings or {en,ms} */
  const fill = (pair, vars) => {
    const f = (k) => pair[k === 'en' ? 0 : 1].replace(/\{(\w+)\}/g, (_, key) => { const v = vars[key]; if (v === undefined) throw new Error('fill: missing ' + key); return typeof v === 'object' ? v[k] : v; });
    return T(f('en'), f('ms'));
  };
  const M = (s) => `$${s}$`;
  const vec = (r, lim, both) => retry(() => { const v = [r.int(-lim, lim), r.int(-lim, lim)]; need(v[0] !== 0 || v[1] !== 0); if (both) need(v[0] !== 0 && v[1] !== 0); return v; });
  const cap = (l) => T(SPM.cap(l.en), SPM.cap(l.ms));
  const nmL = (s) => s.map((c) => c);
  /** primed vertex names, e.g. A', B', C' */
  const primes = (names, k) => names.slice(0, k).map((c) => c + "'");
  /** "vertices A(1, 2), B(3, 4)" as maths */
  const vlist = (names, P) => P.map((p, i) => `${names[i]}${pt(p)}`).join(',\\ ');
  const plist = (names, P, pr) => P.map((p, i) => `${names[i]}${pr || ''}${pt(p)}`).join(',\\ ');
  const nameList = (names, k, pr) => names.slice(0, k).map((c) => `${c}${pr || ''}`).join(pr ? ',\\ ' : '');
  const SUBJ = [
    { a: T('a robot', 'sebuah robot'), the: T('the robot', 'robot itu') },
    { a: T('a drone', 'sebuah dron'), the: T('the drone', 'dron itu') },
    { a: T('a toy car', 'sebuah kereta mainan'), the: T('the toy car', 'kereta mainan itu') },
    { a: T('a ship', 'sebuah kapal'), the: T('the ship', 'kapal itu') },
    { a: T('a cursor on a computer screen', 'sebuah kursor pada skrin komputer'), the: T('the cursor', 'kursor itu') },
    { a: T('a chess piece', 'sebuah buah catur'), the: T('the piece', 'buah catur itu') },
    { a: T('a hot-air balloon', 'sebuah belon udara panas'), the: T('the balloon', 'belon itu') },
    { a: T('a crane hook', 'sebuah cangkuk kren'), the: T('the hook', 'cangkuk itu') },
    { a: T('a game token', 'sebuah token permainan'), the: T('the token', 'token itu') },
    { a: T('a lorry', 'sebuah lori'), the: T('the lorry', 'lori itu') },
  ];
  /** point set as a bilingual answer line */
  const ansPts = (names, P, pr) => T(`$${plist(names, P, pr)}$`);

  /* ------------------------------------------------ worked-solution helpers */
  const W = SPM.lines;
  const P2 = SPM.par;
  /** image = object + vector */
  const addSteps = (P, v, Q) => [
    T('Image $=$ object $+$ translation vector.', 'Imej $=$ objek $+$ vektor translasi.'),
    `$(${n(P[0])} + ${P2(v[0])},\\ ${n(P[1])} + ${P2(v[1])}) = ${pt(Q)}$`,
  ];
  /** object = image - vector */
  const subSteps = (Q, v, P) => [
    T('Object $=$ image $-$ translation vector.', 'Objek $=$ imej $-$ vektor translasi.'),
    `$(${n(Q[0])} - ${P2(v[0])},\\ ${n(Q[1])} - ${P2(v[1])}) = ${pt(P)}$`,
  ];
  /** the rule of a reflection in the mirror line l, as one bilingual line */
  const reflRule = (l) => {
    const k = l.k;
    if (l.kind === 'x') {
      return k === 0
        ? T('Reflection in the $y$-axis: $(x,\\ y) \\to (-x,\\ y)$.', 'Pantulan pada paksi-$y$: $(x,\\ y) \\to (-x,\\ y)$.')
        : T(`Reflection in $x = ${n(k)}$: $x' = 2(${n(k)}) - x$, and $y$ does not change.`, `Pantulan pada $x = ${n(k)}$: $x' = 2(${n(k)}) - x$, dan $y$ tidak berubah.`);
    }
    if (l.kind === 'y') {
      return k === 0
        ? T('Reflection in the $x$-axis: $(x,\\ y) \\to (x,\\ -y)$.', 'Pantulan pada paksi-$x$: $(x,\\ y) \\to (x,\\ -y)$.')
        : T(`Reflection in $y = ${n(k)}$: $y' = 2(${n(k)}) - y$, and $x$ does not change.`, `Pantulan pada $y = ${n(k)}$: $y' = 2(${n(k)}) - y$, dan $x$ tidak berubah.`);
    }
    if (l.kind === 'd1') {
      return k === 0
        ? T('Reflection in $y = x$ swaps the coordinates: $(x,\\ y) \\to (y,\\ x)$.', 'Pantulan pada $y = x$ menukar koordinat: $(x,\\ y) \\to (y,\\ x)$.')
        : T(`Reflection in $${l.eq}$: $(x,\\ y) \\to (y - ${P2(k)},\\ x + ${P2(k)})$.`, `Pantulan pada $${l.eq}$: $(x,\\ y) \\to (y - ${P2(k)},\\ x + ${P2(k)})$.`);
    }
    return k === 0
      ? T('Reflection in $y = -x$: $(x,\\ y) \\to (-y,\\ -x)$.', 'Pantulan pada $y = -x$: $(x,\\ y) \\to (-y,\\ -x)$.')
      : T(`Reflection in $${l.eq}$: $(x,\\ y) \\to (${P2(k)} - y,\\ ${P2(k)} - x)$.`, `Pantulan pada $${l.eq}$: $(x,\\ y) \\to (${P2(k)} - y,\\ ${P2(k)} - x)$.`);
  };
  /** "A(1, 2) \to A'(3, 4)" as a pure-maths step line */
  const mapLine = (a, b, na, nb) => `$${na || ''}${pt(a)} \\to ${nb || ''}${pt(b)}$`;
  /** all vertices mapped, one line each */
  const mapAll = (O, I, names, pr) => O.map((p, i) => mapLine(p, I[i], names[i], names[i] + (pr === undefined ? "'" : pr)));
  /** the coordinate rule of a rotation, measured from the centre */
  const rotMap = (a, d) => {
    const e = eqAD(a, d);
    if (e[0] === 180) return '(-x,\\ -y)';
    return e[1] === 'ccw' ? '(-y,\\ x)' : '(y,\\ -x)';
  };
  const rotRuleL = (a, d) => {
    const m = rotMap(a, d), e = eqAD(a, d);
    return e[0] === 180
      ? T(`A half-turn uses $(x,\\ y) \\to ${m}$, measured from the centre.`, `Separuh pusingan menggunakan $(x,\\ y) \\to ${m}$, diukur dari pusat.`)
      : T(`A $90^\\circ$ turn ${e[1] === 'cw' ? 'clockwise' : 'anticlockwise'} uses $(x,\\ y) \\to ${m}$, measured from the centre.`, `Putaran $90^\\circ$ ${e[1] === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} menggunakan $(x,\\ y) \\to ${m}$, diukur dari pusat.`);
  };
  /** full working for rotating one point about C */
  const rotSteps = (P, C, a, d, n1, n2) => {
    const Q = rotate(P, C, a, d), m = rotMap(a, d);
    if (isO(C)) return [rotRuleL(a, d), mapLine(P, Q, n1, n2)];
    const dd = [P[0] - C[0], P[1] - C[1]], rr = [Q[0] - C[0], Q[1] - C[1]];
    return [
      T(`Measure from the centre: $${pt(P)} - ${pt(C)} = ${pt(dd)}$`, `Ukur dari pusat: $${pt(P)} - ${pt(C)} = ${pt(dd)}$`),
      T(`Apply $(x,\\ y) \\to ${m}$: $${pt(dd)} \\to ${pt(rr)}$`, `Gunakan $(x,\\ y) \\to ${m}$: $${pt(dd)} \\to ${pt(rr)}$`),
      T(`Add the centre back: $${pt(rr)} + ${pt(C)} = ${pt(Q)}$`, `Tambah semula pusat: $${pt(rr)} + ${pt(C)} = ${pt(Q)}$`),
    ];
  };
  /** vector = image - object */
  const vecSteps = (P, Q, v) => [
    T('Translation vector $=$ image $-$ object.', 'Vektor translasi $=$ imej $-$ objek.'),
    `$\\begin{pmatrix} ${n(Q[0])} - ${P2(P[0])} \\\\ ${n(Q[1])} - ${P2(P[1])} \\end{pmatrix} = ${tv(v)}$`,
  ];

  /* =========================================================== 11.2 Translation */
  const E112 = [];
  const M112 = [];
  const A112 = [];

  /* ---- easy ---- */
  E112.push((r) => { // image of a point: many phrasings
    const P = [r.int(-5, 5), r.int(-5, 5)], v = vec(r, 4, r.chance(0.6)), Q = addv(P, v);
    need(inb([Q], 8));
    const forms = [
      ["Point $P$ has coordinates ${P}$. After a translation by ${v}$, what are the coordinates of $P'$?", "Titik $P$ mempunyai koordinat ${P}$. Selepas translasi ${v}$, apakah koordinat $P'$?"],
      ["The translation ${v}$ maps $P{P}$ onto $P'$. State the coordinates of $P'$.", "Translasi ${v}$ memetakan $P{P}$ ke $P'$. Nyatakan koordinat $P'$."],
      ["Write down the coordinates of the image when the point ${P}$ is shifted by the column vector ${v}$.", "Tulis koordinat imej apabila titik ${P}$ dianjak oleh vektor lajur ${v}$."],
      ["After the translation ${v}$, a point lands at $P'$. If the object point is ${P}$, what are the coordinates of $P'$?", "Selepas translasi ${v}$, satu titik mendarat di $P'$. Jika titik objek ialah ${P}$, apakah koordinat $P'$?"],
      ["$P{P}$ is moved by the vector ${v}$. Where is it now?", "$P{P}$ digerakkan oleh vektor ${v}$. Di manakah kedudukannya sekarang?"],
      ["The object point $A$ is ${P}$. Determine the image $A'$ under the translation ${v}$.", "Titik objek $A$ ialah ${P}$. Tentukan imej $A'$ di bawah translasi ${v}$."],
    ];
    return { q: fill(r.pick(forms), { P: `${pt(P)}`, v: tv(v) }), a: T(`$${pt(Q)}$`), w: W(...addSteps(P, v, Q)), sp: 's' };
  });
  E112.push((r) => { // moves described in words -> new position
    const P = [r.int(-5, 5), r.int(-5, 5)], v = vec(r, 5, false), Q = addv(P, v);
    need(inb([Q], 8));
    const s = r.pick(SUBJ);
    const forms = [
      ["{Sa} is at ${P}$ on a coordinate grid. It moves {mv}. Write down its new coordinates.", "{Sa} berada di ${P}$ pada satah koordinat. Ia bergerak {mv}. Tulis koordinat barunya."],
      ["On a grid, {sa} starts at ${P}$ and slides {mv} without turning. Where does it stop?", "Pada grid, {sa} bermula di ${P}$ dan menggelongsor {mv} tanpa berputar. Di manakah ia berhenti?"],
      ["A point ${P}$ is shifted {mv}. What is the position of its image?", "Titik ${P}$ dianjakkan {mv}. Apakah kedudukan imejnya?"],
    ];
    return { q: fill(r.pick(forms), { P: pt(P), mv: move(v), Sa: cap(s.a), sa: s.a }), a: T(`$${pt(Q)}$`), w: W(T(`Moving ${moveEN(v)} is the translation $${tv(v)}$.`, `Bergerak ${moveMS(v)} ialah translasi $${tv(v)}$.`), ...addSteps(P, v, Q)), sp: 's' };
  });
  E112.push((r) => { // words -> column vector, and vector -> words
    const v = vec(r, 6, r.chance(0.5));
    if (r.chance(0.55)) {
      const forms = [
        ["Write the column vector of a translation that moves every point {mv}.", "Tulis vektor lajur bagi translasi yang menggerakkan setiap titik {mv}."],
        ["An object is slid {mv}. Express this translation as a column vector.", "Sebuah objek digelongsorkan {mv}. Nyatakan translasi ini sebagai vektor lajur."],
        ["Give the translation vector for a movement of {mv}.", "Berikan vektor translasi bagi pergerakan {mv}."],
      ];
      return { q: fill(r.pick(forms), { mv: move(v) }), a: T(`$${tv(v)}$`), w: W(T('Horizontal movement on top (right is positive), vertical movement below (up is positive).', 'Pergerakan mengufuk di atas (kanan positif), pergerakan mencancang di bawah (atas positif).'), T(`${moveEN(v)} gives $${tv(v)}$.`, `${SPM.cap(moveMS(v))} memberikan $${tv(v)}$.`)), sp: 's' };
    }
    const forms = [
      ["Describe the translation ${v}$ in words.", "Huraikan translasi ${v}$ dengan perkataan."],
      ["What does the translation ${v}$ do to every point of an object? Answer in words.", "Apakah yang dilakukan translasi ${v}$ kepada setiap titik suatu objek? Jawab dengan perkataan."],
    ];
    return { q: fill(r.pick(forms), { v: tv(v) }), a: T(`Every point moves ${moveEN(v)}.`, `Setiap titik bergerak ${moveMS(v)}.`), w: W(T(`The top number $${n(v[0])}$ is the horizontal movement and the bottom number $${n(v[1])}$ is the vertical movement.`, `Nombor atas $${n(v[0])}$ ialah gerakan mengufuk dan nombor bawah $${n(v[1])}$ ialah gerakan mencancang.`), T(`So every point moves ${moveEN(v)}.`, `Maka setiap titik bergerak ${moveMS(v)}.`)), sp: 's' };
  });
  E112.push((r) => { // vector from P -> P'
    const P = [r.int(-5, 5), r.int(-5, 5)], v = vec(r, 5, false), Q = addv(P, v);
    need(inb([Q], 8));
    const forms = [
      ["$P{P}$ is mapped onto $P'{Q}$ by a translation. Write the translation as a column vector.", "$P{P}$ dipetakan ke $P'{Q}$ oleh satu translasi. Tulis translasi itu sebagai vektor lajur."],
      ["A translation takes the point ${P}$ to the point ${Q}$. What is its column vector?", "Satu translasi membawa titik ${P}$ ke titik ${Q}$. Apakah vektor lajurnya?"],
      ["Find the translation that maps ${P}$ onto ${Q}$.", "Cari translasi yang memetakan ${P}$ ke ${Q}$."],
      ["By how many units horizontally and vertically must ${P}$ be moved to reach ${Q}$? Write your answer as a column vector.", "Berapakah unit secara mengufuk dan mencancang titik ${P}$ perlu digerakkan untuk sampai ke ${Q}$? Tulis jawapan sebagai vektor lajur."],
    ];
    return { q: fill(r.pick(forms), { P: pt(P), Q: pt(Q) }), a: T(`$${tv(v)}$`), w: W(...vecSteps(P, Q, v)), sp: 's' };
  });
  E112.push((r) => { // object from image
    const P = [r.int(-5, 5), r.int(-5, 5)], v = vec(r, 5, false), Q = addv(P, v);
    need(inb([Q], 8));
    const forms = [
      ["The image of a point under the translation ${v}$ is ${Q}$. Find the coordinates of the object.", "Imej suatu titik di bawah translasi ${v}$ ialah ${Q}$. Cari koordinat objek itu."],
      ["Point $P'{Q}$ is the image of $P$ after a translation by ${v}$. What were the original coordinates of $P$?", "Titik $P'{Q}$ ialah imej bagi $P$ selepas translasi ${v}$. Apakah koordinat asal $P$?"],
      ["After moving by ${v}$, a point arrives at ${Q}$. Where did it start?", "Selepas bergerak sebanyak ${v}$, satu titik tiba di ${Q}$. Di manakah ia bermula?"],
    ];
    return { q: fill(r.pick(forms), { Q: pt(Q), v: tv(v) }), a: T(`$${pt(P)}$`), w: W(T('Work backwards from the image.', 'Kerja ke belakang daripada imej.'), ...subSteps(Q, v, P)), sp: 's' };
  });
  E112.push((r) => { // figure: read the translation
    const k = r.pick([3, 3, 4]);
    const O = shape(r, KIND_OF[k], 3), v = vec(r, 4, false);
    const I = O.map((p) => addv(p, v));
    need(inb(I, 7) && O.every((p) => !I.some((q) => same(p, q))));
    const names = nm(r, k);
    const forms = [
      ["The diagram shows {nn} ${o}$ and its image ${i}$ under a translation. Write the translation as a column vector.", "Rajah menunjukkan {nn} ${o}$ dan imejnya ${i}$ di bawah satu translasi. Tulis translasi itu sebagai vektor lajur."],
      ["In the diagram, the {nn} ${o}$ is mapped onto ${i}$ by a translation. By how many units is it moved horizontally and by how many vertically?", "Dalam rajah, {nn} ${o}$ dipetakan ke ${i}$ oleh satu translasi. Berapa unit ia digerakkan secara mengufuk dan secara mencancang?"],
      ["Shape ${o}$ (solid) is translated to ${i}$ (dashed). Read the grid and state the translation vector.", "Bentuk ${o}$ (penuh) ditranslasikan ke ${i}$ (putus-putus). Baca grid dan nyatakan vektor translasi."],
    ];
    return { q: fill(r.pick(forms), { nn: noun(k), o: names.join(''), i: names.map((c) => c + "'").join('') }), fig: fig({ O, I, names }), a: T(`$${tv(v)}$`), w: W(T(`Compare one vertex with its image: $${names[0]}${pt(O[0])} \\to ${names[0]}'${pt(I[0])}$`, `Bandingkan satu bucu dengan imejnya: $${names[0]}${pt(O[0])} \\to ${names[0]}'${pt(I[0])}$`), ...vecSteps(O[0], I[0], v)), sp: 's' };
  });
  E112.push((r) => { // figure: image of one vertex
    const k = r.pick([3, 4]);
    const O = shape(r, KIND_OF[k], 3), v = vec(r, 4, false);
    const I = O.map((p) => addv(p, v));
    need(inb(I, 7));
    const names = nm(r, k), j = r.int(0, k - 1);
    const forms = [
      ["The diagram shows {nn} ${o}$. It is translated by ${v}$. State the coordinates of ${p}$.", "Rajah menunjukkan {nn} ${o}$. Ia ditranslasikan oleh ${v}$. Nyatakan koordinat ${p}$."],
      ["Read the coordinates of ${x}$ from the diagram, then find its image ${p}$ under the translation ${v}$.", "Baca koordinat ${x}$ daripada rajah, kemudian cari imejnya ${p}$ di bawah translasi ${v}$."],
    ];
    return { q: fill(r.pick(forms), { nn: noun(k), o: names.join(''), v: tv(v), p: names[j] + "'", x: names[j] }), fig: fig({ O, names }), a: T(`$${names[j]}${pt(O[j])} \\to ${names[j]}'${pt(I[j])}$`), w: W(T(`Read the vertex from the diagram: $${names[j]}${pt(O[j])}$.`, `Baca bucu daripada rajah: $${names[j]}${pt(O[j])}$.`), ...addSteps(O[j], v, I[j])), sp: 's' };
  });
  E112.push((r) => { // true / false statements
    const bank = [
      ['Under a translation, an object and its image have the same size and shape.', 'Di bawah translasi, objek dan imejnya mempunyai saiz dan bentuk yang sama.', true, 'A translation is an isometry.', 'Translasi ialah isometri.'],
      ['Under a translation, the image is a mirror image of the object.', 'Di bawah translasi, imej ialah imej cermin bagi objek.', false, 'A translation does not flip the object; only a reflection does.', 'Translasi tidak membalikkan objek; hanya pantulan yang melakukannya.'],
      ['Every point of an object moves the same distance and in the same direction in a translation.', 'Setiap titik pada objek bergerak dengan jarak dan arah yang sama dalam translasi.', true, 'That is the definition of a translation.', 'Itulah takrif translasi.'],
      ['A translation turns the object through an angle about a fixed point.', 'Translasi memutarkan objek melalui suatu sudut pada satu titik tetap.', false, 'Turning about a point is a rotation.', 'Memutar pada satu titik ialah putaran.'],
      ['The translation $\\begin{pmatrix} 3 \\\\ 0 \\end{pmatrix}$ moves each point 3 units horizontally only.', 'Translasi $\\begin{pmatrix} 3 \\\\ 0 \\end{pmatrix}$ menggerakkan setiap titik 3 unit secara mengufuk sahaja.', true, 'The vertical component is 0.', 'Komponen mencancang ialah 0.'],
      ['The translation $\\begin{pmatrix} 2 \\\\ 5 \\end{pmatrix}$ moves each point 2 units up and 5 units to the right.', 'Translasi $\\begin{pmatrix} 2 \\\\ 5 \\end{pmatrix}$ menggerakkan setiap titik 2 unit ke atas dan 5 unit ke kanan.', false, 'The top number is the horizontal move: 2 units right and 5 units up.', 'Nombor atas ialah gerakan mengufuk: 2 unit ke kanan dan 5 unit ke atas.'],
      ['A negative top number in a translation vector means a move to the left.', 'Nombor atas yang negatif dalam vektor translasi bermaksud gerakan ke kiri.', true, 'Negative horizontal components point left.', 'Komponen mengufuk yang negatif menuju ke kiri.'],
      ['A negative bottom number in a translation vector means a move upwards.', 'Nombor bawah yang negatif dalam vektor translasi bermaksud gerakan ke atas.', false, 'Negative vertical components move downwards.', 'Komponen mencancang yang negatif bergerak ke bawah.'],
      ['The length of a line segment changes when it is translated.', 'Panjang tembereng garis berubah apabila ditranslasikan.', false, 'Lengths are preserved by a translation.', 'Panjang dikekalkan oleh translasi.'],
      ['A translation can be described completely by one column vector.', 'Translasi boleh diperihalkan sepenuhnya dengan satu vektor lajur.', true, 'The vector gives both distance and direction.', 'Vektor itu memberikan jarak dan arah.'],
      ['The translation $\\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix}$ moves every point.', 'Translasi $\\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix}$ menggerakkan setiap titik.', false, 'It leaves every point where it is.', 'Ia membiarkan setiap titik di tempatnya.'],
      ['Under a translation, a line segment and its image are parallel.', 'Di bawah translasi, tembereng garis dan imejnya adalah selari.', true, 'Directions are unchanged by a translation.', 'Arah tidak berubah oleh translasi.'],
    ];
    const b = r.pick(bank);
    return { q: T(`True or false? ${b[0]}`, `Benar atau palsu? ${b[1]}`), a: T(`${b[2] ? 'True' : 'False'}. ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}. ${b[4]}`), w: W(T('A translation slides every point the same distance in the same direction; the top number of the vector is the horizontal move and the bottom number the vertical move.', 'Translasi menggelongsorkan setiap titik dengan jarak dan arah yang sama; nombor atas vektor ialah gerakan mengufuk dan nombor bawah gerakan mencancang.'), T(`${b[2] ? 'True' : 'False'}: ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}: ${b[4]}`)), sp: 's' };
  });
  E112.push((r) => { // MCQ: which vector
    const P = [r.int(-4, 4), r.int(-4, 4)], v = vec(r, 4, true), Q = addv(P, v);
    need(inb([Q], 8));
    const c = T(`$${tv(v)}$`), wr = [[v[1], v[0]], [-v[0], -v[1]], [-v[0], v[1]]].filter((w) => !same(w, v));
    need(new Set(wr.map(String)).size === 3 && !wr.some((w) => same(w, v)));
    const m = mcq(r, c, wr.map((w) => T(`$${tv(w)}$`)));
    return { q: T(`Which column vector represents the translation that maps $${pt(P)}$ onto $${pt(Q)}$?${m.opts.en}`, `Vektor lajur yang manakah mewakili translasi yang memetakan $${pt(P)}$ ke $${pt(Q)}$?${m.opts.ms}`), a: m.ans, w: W(...vecSteps(P, Q, v), T(`So the answer is ${m.letter}.`, `Jadi jawapannya ialah ${m.letter}.`)), sp: 's' };
  });
  E112.push((r) => { // fill in the blank
    const v = vec(r, 6, true);
    const s1 = T(v[0] > 0 ? 'to the right' : 'to the left', v[0] > 0 ? 'ke kanan' : 'ke kiri'), s2 = T(v[1] > 0 ? 'up' : 'down', v[1] > 0 ? 'ke atas' : 'ke bawah');
    return { q: T(`Fill in the blanks: the translation $${tv(v)}$ moves each point ${Math.abs(v[0])} unit(s) ______ and ${Math.abs(v[1])} unit(s) ______. (Choose from: to the left, to the right, up, down.)`, `Isi tempat kosong: translasi $${tv(v)}$ menggerakkan setiap titik ${Math.abs(v[0])} unit ______ dan ${Math.abs(v[1])} unit ______. (Pilih daripada: ke kiri, ke kanan, ke atas, ke bawah.)`), a: T(`${s1.en}; ${s2.en}`, `${s1.ms}; ${s2.ms}`), w: W(T(`Top number $${n(v[0])}$: ${Math.abs(v[0])} unit(s) ${s1.en}.`, `Nombor atas $${n(v[0])}$: ${Math.abs(v[0])} unit ${s1.ms}.`), T(`Bottom number $${n(v[1])}$: ${Math.abs(v[1])} unit(s) ${s2.en}.`, `Nombor bawah $${n(v[1])}$: ${Math.abs(v[1])} unit ${s2.ms}.`)), sp: 's' };
  });
  E112.push((r) => { // table completion
    const v = vec(r, 4, false);
    const O = [0, 1, 2].map(() => [r.int(-4, 4), r.int(-4, 4)]);
    need(new Set(O.map(String)).size === 3);
    const I = O.map((p) => addv(p, v));
    need(inb(I, 8));
    const hide = r.chance() ? 'image' : 'object';
    const rows = O.map((p, i) => [`$${'PQR'[i]}$`, hide === 'image' ? `$${pt(p)}$` : '?', hide === 'image' ? '?' : `$${pt(I[i])}$`]);
    const head = hide === 'image' ? ['Point', 'Object', 'Image'] : ['Point', 'Object', 'Image'];
    const tbl = SPM.table(rows, { head: [T('Point', 'Titik').en, T('Object', 'Objek').en, T('Image', 'Imej').en] });
    const tblM = SPM.table(rows, { head: ['Titik', 'Objek', 'Imej'] });
    const ans = (hide === 'image' ? I : O).map((p, i) => `$${'PQR'[i]}${hide === 'image' ? "'" : ''}${pt(p)}$`).join(', ');
    return { q: T(`The table shows three points and their images under the translation $${tv(v)}$. Complete the missing ${hide === 'image' ? 'images' : 'objects'}.<br>${tbl}`, `Jadual menunjukkan tiga titik dan imejnya di bawah translasi $${tv(v)}$. Lengkapkan ${hide === 'image' ? 'imej' : 'objek'} yang tertinggal.<br>${tblM}`), a: T(ans), w: W(hide === 'image' ? T(`Image $=$ object $+$ $${tv(v)}$.`, `Imej $=$ objek $+$ $${tv(v)}$.`) : T(`Object $=$ image $-$ $${tv(v)}$.`, `Objek $=$ imej $-$ $${tv(v)}$.`), ...O.map((p, i) => `$${'PQR'[i]}${pt(p)} \\to ${'PQR'[i]}'${pt(I[i])}$`)), sp: 'm' };
  });
  E112.push((r) => { // grid counting: figure, units right/up
    const O = shape(r, r.pick(['tri', 'quad']), 3), v = vec(r, 5, true);
    const I = O.map((p) => addv(p, v));
    need(inb(I, 7));
    const names = nm(r, O.length);
    return { q: T(`Look at the diagram. Which vertex of the image corresponds to $${names[0]}$, and how many units to the ${v[0] > 0 ? 'right' : 'left'} and how many units ${v[1] > 0 ? 'up' : 'down'} has the shape moved?`, `Lihat rajah. Bucu imej yang manakah sepadan dengan $${names[0]}$, dan berapa unit bentuk itu telah bergerak ke ${v[0] > 0 ? 'kanan' : 'kiri'} dan berapa unit ke ${v[1] > 0 ? 'atas' : 'bawah'}?`), fig: fig({ O, I, names }), a: T(`${names[0]}'; ${u(Math.abs(v[0]))} ${v[0] > 0 ? 'right' : 'left'} and ${u(Math.abs(v[1]))} ${v[1] > 0 ? 'up' : 'down'}`, `${names[0]}'; ${Math.abs(v[0])} unit ke ${v[0] > 0 ? 'kanan' : 'kiri'} dan ${Math.abs(v[1])} unit ke ${v[1] > 0 ? 'atas' : 'bawah'}`), w: W(T(`Corresponding vertices keep the same order, so $${names[0]}$ maps onto $${names[0]}'$.`, `Bucu sepadan mengekalkan tertib yang sama, jadi $${names[0]}$ dipetakan ke $${names[0]}'$.`), T(`$${names[0]}${pt(O[0])} \\to ${names[0]}'${pt(I[0])}$`), ...vecSteps(O[0], I[0], v)), sp: 's' };
  });

  /* ---- medium ---- */
  M112.push((r) => { // shape image coordinates given vertex list
    const k = r.pick([3, 4, 5, 3, 4]);
    const O = shape(r, KIND_OF[k], 3), v = vec(r, 4, false), I = O.map((p) => addv(p, v));
    need(inb(I, 8));
    const names = nm(r, k);
    const forms = [
      ["{Nn} ${o}$ has vertices ${vl}$. Find the coordinates of its image under the translation ${v}$.", "{Nn} ${o}$ mempunyai bucu ${vl}$. Cari koordinat imejnya di bawah translasi ${v}$."],
      ["The {nn} ${o}$ is translated by ${v}$. List the coordinates of the vertices of the image, given ${vl}$.", "{Nn} ${o}$ ditranslasikan oleh ${v}$. Senaraikan koordinat bucu imej itu, diberi ${vl}$."],
      ["Copy the diagram and draw the image of {nn} ${o}$ under the translation ${v}$. Write the coordinates of the image vertices.", "Salin rajah dan lukis imej {nn} ${o}$ di bawah translasi ${v}$. Tulis koordinat bucu imej."],
    ];
    const f = r.pick(forms);
    return { q: fill(f, { nn: noun(k), Nn: cap(noun(k)), o: names.join(''), vl: vlist(names, O), v: tv(v) }), fig: fig({ O, names }), a: ansPts(names, I, "'"), w: W(T(`Add $${tv(v)}$ to every vertex.`, `Tambah $${tv(v)}$ kepada setiap bucu.`), ...O.map((p, i) => `$${names[i]}${pt(p)} \\to ${names[i]}'${pt(I[i])}$`)), sp: 'm' };
  });
  M112.push((r) => { // figure: find vector and state vertex
    const k = r.pick([3, 4, 5]);
    const O = shape(r, KIND_OF[k], 3), v = vec(r, 5, true), I = O.map((p) => addv(p, v));
    need(inb(I, 8));
    const names = nm(r, k), j = r.int(0, k - 1);
    const forms = [
      ["The diagram shows {nn} ${o}$ and its image under a translation. (a) Find the translation vector. (b) Write the coordinates of ${p}$.", "Rajah menunjukkan {nn} ${o}$ dan imejnya di bawah satu translasi. (a) Cari vektor translasi. (b) Tulis koordinat ${p}$."],
      ["A {nn} and its image are drawn on the grid. (a) Describe the translation by a column vector. (b) State the coordinates of the image of vertex ${x}$.", "{Nn} dan imejnya dilukis pada grid. (a) Huraikan translasi itu dengan vektor lajur. (b) Nyatakan koordinat imej bagi bucu ${x}$."],
    ];
    return { q: fill(r.pick(forms), { nn: noun(k), Nn: cap(noun(k)), o: names.join(''), p: names[j] + "'", x: names[j] }), fig: fig({ O, I, names, noImgLab: false }), a: T(`(a) $${tv(v)}$ (b) $${names[j]}'${pt(I[j])}$`), w: W(T(`(a) One vertex and its image: $${names[0]}${pt(O[0])} \\to ${names[0]}'${pt(I[0])}$`, `(a) Satu bucu dan imejnya: $${names[0]}${pt(O[0])} \\to ${names[0]}'${pt(I[0])}$`), ...vecSteps(O[0], I[0], v), T(`(b) $${names[j]}${pt(O[j])}$ maps onto $${names[j]}'${pt(I[j])}$.`, `(b) $${names[j]}${pt(O[j])}$ dipetakan ke $${names[j]}'${pt(I[j])}$.`)), sp: 'm' };
  });
  M112.push((r) => { // unknown components
    const a = r.int(-4, 4), b = r.int(-4, 4), v = vec(r, 4, false);
    const P = [a, b], Q = addv(P, v);
    const kind = r.pick(['obj', 'img', 'vec']);
    const L = (x) => x;
    if (kind === 'obj') return { q: T(`The translation $${tv(v)}$ maps $P(p,\\ ${b})$ onto $P'(${Q[0]},\\ q)$. Find $p$ and $q$.`, `Translasi $${tv(v)}$ memetakan $P(p,\\ ${b})$ ke $P'(${Q[0]},\\ q)$. Cari $p$ dan $q$.`), a: T(`$p = ${a},\\ q = ${Q[1]}$`), w: W(T('Add the vector to the object, coordinate by coordinate.', 'Tambah vektor kepada objek, koordinat demi koordinat.'), `$p + ${P2(v[0])} = ${n(Q[0])} \\Rightarrow p = ${n(a)}$`, `$q = ${n(b)} + ${P2(v[1])} = ${n(Q[1])}$`), sp: 's' };
    if (kind === 'img') return { q: T(`A translation $\\begin{pmatrix} h \\\\ k \\end{pmatrix}$ maps $A${pt(P)}$ onto $A'${pt(Q)}$. Find $h$ and $k$.`, `Translasi $\\begin{pmatrix} h \\\\ k \\end{pmatrix}$ memetakan $A${pt(P)}$ ke $A'${pt(Q)}$. Cari $h$ dan $k$.`), a: T(`$h = ${v[0]},\\ k = ${v[1]}$`), w: W(...vecSteps(P, Q, v), `$h = ${n(v[0])},\\ k = ${n(v[1])}$`), sp: 's' };
    return { q: T(`The point $B(m,\\ n)$ is mapped onto $B'${pt(Q)}$ by the translation $${tv(v)}$. Find the values of $m$ and $n$.`, `Titik $B(m,\\ n)$ dipetakan ke $B'${pt(Q)}$ oleh translasi $${tv(v)}$. Cari nilai $m$ dan $n$.`), a: T(`$m = ${a},\\ n = ${b}$`), w: W(...subSteps(Q, v, P), `$m = ${n(a)},\\ n = ${n(b)}$`), sp: 's' };
  });
  M112.push((r) => { // distance moved
    const tr = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 5, 13], [4, 3, 5]]);
    const v = [tr[0] * r.sign(), tr[1] * r.sign()];
    const P = [r.int(-3, 3), r.int(-3, 3)], Q = addv(P, v);
    const forms = [
      ["Every point is moved by the translation ${v}$. Calculate the distance between a point and its image.", "Setiap titik digerakkan oleh translasi ${v}$. Hitung jarak antara satu titik dengan imejnya."],
      ["Point $P{P}$ is translated to $P'{Q}$. Find the distance $PP'$.", "Titik $P{P}$ ditranslasikan ke $P'{Q}$. Cari jarak $PP'$."],
      ["A drone flies from ${P}$ to ${Q}$ (units in metres). Calculate the distance flown in a straight line.", "Sebuah dron terbang dari ${P}$ ke ${Q}$ (unit dalam meter). Hitung jarak penerbangan dalam garis lurus."],
    ];
    const f = r.pick(forms);
    return { q: fill(f, { v: tv(v), P: pt(P), Q: pt(Q) }), a: T(`$${tr[2]}$ units${f === forms[2] ? ' (metres)' : ''}`, `$${tr[2]}$ unit${f === forms[2] ? ' (meter)' : ''}`), w: W(T('Distance $= \\sqrt{(\\text{horizontal})^2 + (\\text{vertical})^2}$', 'Jarak $= \\sqrt{(\\text{mengufuk})^2 + (\\text{mencancang})^2}$'), `$= \\sqrt{${P2(v[0])}^2 + ${P2(v[1])}^2} = \\sqrt{${v[0] * v[0] + v[1] * v[1]}} = ${tr[2]}$`, T(`$${tr[2]}$ units`, `$${tr[2]}$ unit`)), sp: 's' };
  });
  M112.push((r) => { // derive vector from one pair and apply to another
    const P = [r.int(-4, 4), r.int(-4, 4)], v = vec(r, 4, false), Q = addv(P, v);
    const R = [r.int(-4, 4), r.int(-4, 4)];
    need(!same(P, R) && inb([addv(R, v), Q], 8));
    const forms = [
      ["A translation maps $A{P}$ to $A'{Q}$. Find the image of $B{R}$ under the same translation.", "Satu translasi memetakan $A{P}$ ke $A'{Q}$. Cari imej $B{R}$ di bawah translasi yang sama."],
      ["Under a translation, ${P}$ is sent to ${Q}$. Where is the point ${R}$ sent?", "Di bawah satu translasi, ${P}$ dihantar ke ${Q}$. Ke manakah titik ${R}$ dihantar?"],
      ["The vertex $K{P}$ of a shape moves to $K'{Q}$. Using the same translation, find the image of vertex $L{R}$.", "Bucu $K{P}$ suatu bentuk bergerak ke $K'{Q}$. Dengan translasi yang sama, cari imej bucu $L{R}$."],
    ];
    return { q: fill(r.pick(forms), { P: pt(P), Q: pt(Q), R: pt(R) }), a: T(`$${pt(addv(R, v))}$`), w: W(...vecSteps(P, Q, v), T(`Apply the same vector to $${pt(R)}$:`, `Gunakan vektor yang sama pada $${pt(R)}$:`), `$(${n(R[0])} + ${P2(v[0])},\\ ${n(R[1])} + ${P2(v[1])}) = ${pt(addv(R, v))}$`), sp: 'm' };
  });
  M112.push((r) => { // inverse translation
    const v = vec(r, 5, false), P = [r.int(-4, 4), r.int(-4, 4)];
    const Q = addv(P, v);
    need(inb([Q], 8));
    const forms = [
      ["The translation ${v}$ maps $P{P}$ onto $P'$. Write the translation that maps $P'$ back onto $P$.", "Translasi ${v}$ memetakan $P{P}$ ke $P'$. Tulis translasi yang memetakan $P'$ kembali ke $P$."],
      ["$P{P}$ is translated to $P'{Q}$. What translation returns $P'$ to $P$?", "$P{P}$ ditranslasikan ke $P'{Q}$. Apakah translasi yang mengembalikan $P'$ ke $P$?"],
      ["A shape is moved by ${v}$. Describe the translation that moves the image back to the original position.", "Sebuah bentuk digerakkan oleh ${v}$. Huraikan translasi yang menggerakkan imej kembali ke kedudukan asal."],
    ];
    return { q: fill(r.pick(forms), { v: tv(v), P: pt(P), Q: pt(Q) }), a: T(`$${tv([-v[0], -v[1]])}$`), w: W(T('The inverse translation undoes the movement.', 'Translasi songsang membatalkan pergerakan itu.'), T(`Change the sign of each component: $${tv([-v[0], -v[1]])}$`, `Tukar tanda setiap komponen: $${tv([-v[0], -v[1]])}$`)), sp: 's' };
  });
  M112.push((r) => { // segment
    const A = [r.int(-4, 4), r.int(-4, 4)], B = [A[0] + r.pick([-4, -3, 3, 4, 6]), A[1] + r.pick([-3, 0, 3, 4])];
    const v = vec(r, 4, false);
    need(!same(A, B) && inb([A, B, addv(A, v), addv(B, v)], 8));
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
    need(Math.abs(len - Math.round(len * 100) / 100) < 1e-9 || true);
    const forms = [
      ["Line segment $AB$ has endpoints $A{A}$ and $B{B}$. It is translated by ${v}$. Find the endpoints of $A'B'$.", "Tembereng garis $AB$ mempunyai titik hujung $A{A}$ dan $B{B}$. Ia ditranslasikan oleh ${v}$. Cari titik hujung $A'B'$."],
      ["The endpoints of a line segment are ${A}$ and ${B}$. Find the coordinates of the endpoints after the segment is shifted by the vector ${v}$.", "Titik hujung suatu tembereng garis ialah ${A}$ dan ${B}$. Cari koordinat titik hujung selepas tembereng itu dianjakkan oleh vektor ${v}$."],
    ];
    return { q: fill(r.pick(forms), { A: pt(A), B: pt(B), v: tv(v) }), a: T(`$A'${pt(addv(A, v))},\\ B'${pt(addv(B, v))}$`), w: W(T(`Translate each endpoint by $${tv(v)}$.`, `Translasikan setiap titik hujung oleh $${tv(v)}$.`), `$A${pt(A)} \\to A'${pt(addv(A, v))}$`, `$B${pt(B)} \\to B'${pt(addv(B, v))}$`, T('$A\'B\'$ has the same length as $AB$ and is parallel to it.', '$A\'B\'$ mempunyai panjang yang sama dengan $AB$ dan selari dengannya.')), sp: 's' };
  });
  M112.push((r) => { // parallelogram 4th vertex
    const A = [r.int(-4, 2), r.int(-4, 2)], v = [r.int(2, 4), r.int(-2, 2)], w = [r.int(-2, 2), r.int(2, 4)];
    const B = addv(A, v), D = addv(A, w), Cc = addv(B, w);
    need(Math.abs(v[0] * w[1] - v[1] * w[0]) >= 3 && inb([A, B, D, Cc], 8));
    const which = r.pick([0, 1, 2, 3]);
    const V = [A, B, Cc, D], letters = ['A', 'B', 'C', 'D'];
    const given = V.map((p, i) => (i === which ? null : `${letters[i]}${pt(p)}`)).filter(Boolean).join(',\\ ');
    const L1 = letters[(which + 1) % 4], L2 = letters[(which + 2) % 4], L3 = letters[(which + 3) % 4];
    // translation that maps L3 -> L2 equals the one mapping `which` -> L1 ; so V[which] = V[L1] - (V[L2] - V[L3])
    const tvv = subv(V[(which + 2) % 4], V[(which + 3) % 4]);
    const forms = [
      ["$ABCD$ is a parallelogram with vertices {g}. Find the coordinates of ${x}$.", "$ABCD$ ialah sebuah segi empat selari dengan bucu {g}. Cari koordinat ${x}$."],
      ["Three vertices of parallelogram $ABCD$ are {g}. Use a translation to find the fourth vertex ${x}$.", "Tiga bucu segi empat selari $ABCD$ ialah {g}. Gunakan translasi untuk mencari bucu keempat ${x}$."],
    ];
    const f = r.pick(forms);
    return { q: fill(f, { g: M(given), x: letters[which] }), a: T(`$${letters[which]}${pt(V[which])}$`), w: W(T('Opposite sides of a parallelogram are parallel and equal in length.', 'Sisi bertentangan segi empat selari adalah selari dan sama panjang.'), T(`The translation $${L3} \\to ${L2}$ is $${tv(tvv)}$, so it also maps $${letters[which]}$ onto $${L1}$.`, `Translasi $${L3} \\to ${L2}$ ialah $${tv(tvv)}$, jadi ia juga memetakan $${letters[which]}$ ke $${L1}$.`), T(`Reverse it to go from $${L1}$ back to $${letters[which]}$:`, `Songsangkannya untuk pergi dari $${L1}$ kembali ke $${letters[which]}$:`), `$(${n(V[(which + 1) % 4][0])} - ${P2(tvv[0])},\\ ${n(V[(which + 1) % 4][1])} - ${P2(tvv[1])}) = ${pt(V[which])}$`), sp: 'm' };
  });
  M112.push((r) => { // spot the error
    const P = [r.int(-4, 4), r.int(-4, 4)], v = vec(r, 4, true);
    const Q = addv(P, v);
    const errs = [
      { w: [P[0] - v[0], P[1] - v[1]], en: 'subtracted the vector instead of adding it', ms: 'menolak vektor dan bukannya menambah' },
      { w: [P[0] + v[1], P[1] + v[0]], en: 'swapped the horizontal and vertical components', ms: 'menukar komponen mengufuk dan mencancang' },
      { w: [P[0] + v[0], P[1]], en: 'forgot to apply the vertical component', ms: 'terlupa menggunakan komponen mencancang' },
      { w: [P[0] + v[0], P[1] - v[1]], en: 'moved the wrong way vertically (took up as down)', ms: 'bergerak ke arah yang salah secara mencancang (menganggap atas sebagai bawah)' },
    ];
    const e = r.pick(errs);
    need(!same(e.w, Q) && !same(e.w, P) || e.w !== null);
    need(!same(e.w, Q));
    return { q: T(`A student says the image of $P${pt(P)}$ under the translation $${tv(v)}$ is $${pt(e.w)}$. Is this correct? If not, state the mistake and give the correct image.`, `Seorang murid berkata imej $P${pt(P)}$ di bawah translasi $${tv(v)}$ ialah $${pt(e.w)}$. Adakah ini betul? Jika tidak, nyatakan kesilapan dan berikan imej yang betul.`), a: T(`Not correct: the student ${e.en}. The image is $${pt(Q)}$.`, `Tidak betul: murid itu ${e.ms}. Imej ialah $${pt(Q)}$.`), w: W(...addSteps(P, v, Q), T(`The student ${e.en}, which gives $${pt(e.w)}$.`, `Murid itu ${e.ms}, yang memberikan $${pt(e.w)}$.`)), sp: 'm' };
  });
  M112.push((r) => { // quadrant / axis
    const v = vec(r, 6, false), P = [r.nz(-5, 5), r.nz(-5, 5)], Q = addv(P, v);
    const kind = r.pick(['axisx', 'axisy', 'origin']);
    if (kind === 'axisx') return { q: T(`Find the translation of the form $\\begin{pmatrix} 0 \\\\ k \\end{pmatrix}$ that moves $A${pt(P)}$ onto the $x$-axis.`, `Cari translasi berbentuk $\\begin{pmatrix} 0 \\\\ k \\end{pmatrix}$ yang menggerakkan $A${pt(P)}$ ke atas paksi-$x$.`), a: T(`$${tv([0, -P[1]])}$`), w: W(T('A point lies on the $x$-axis when its $y$-coordinate is $0$.', 'Suatu titik terletak pada paksi-$x$ apabila koordinat-$y$nya ialah $0$.'), `$${n(P[1])} + k = 0 \\Rightarrow k = ${n(-P[1])}$`, `$${tv([0, -P[1]])}$`), sp: 's' };
    if (kind === 'axisy') return { q: T(`Find the translation of the form $\\begin{pmatrix} h \\\\ 0 \\end{pmatrix}$ that moves $A${pt(P)}$ onto the $y$-axis.`, `Cari translasi berbentuk $\\begin{pmatrix} h \\\\ 0 \\end{pmatrix}$ yang menggerakkan $A${pt(P)}$ ke atas paksi-$y$.`), a: T(`$${tv([-P[0], 0])}$`), w: W(T('A point lies on the $y$-axis when its $x$-coordinate is $0$.', 'Suatu titik terletak pada paksi-$y$ apabila koordinat-$x$nya ialah $0$.'), `$${n(P[0])} + h = 0 \\Rightarrow h = ${n(-P[0])}$`, `$${tv([-P[0], 0])}$`), sp: 's' };
    return { q: T(`What translation moves the point $A${pt(P)}$ onto the origin?`, `Apakah translasi yang menggerakkan titik $A${pt(P)}$ ke asalan?`), a: T(`$${tv([-P[0], -P[1]])}$`), w: W(T('The origin is $(0,\\ 0)$, so both coordinates must become $0$.', 'Asalan ialah $(0,\\ 0)$, jadi kedua-dua koordinat mesti menjadi $0$.'), `$(${n(P[0])} + ${P2(-P[0])},\\ ${n(P[1])} + ${P2(-P[1])}) = (0,\\ 0)$`, `$${tv([-P[0], -P[1]])}$`), sp: 's' };
  });
  M112.push((r) => { // MCQ image
    const P = [r.int(-4, 4), r.int(-4, 4)], v = vec(r, 4, true), Q = addv(P, v);
    const WR = [[P[0] - v[0], P[1] - v[1]], [P[0] + v[1], P[1] + v[0]], [P[0] + v[0], P[1] - v[1]], [P[0] - v[0], P[1] + v[1]]];
    const wr = WR.filter((w, i) => !same(w, Q) && WR.findIndex((x) => same(x, w)) === i).slice(0, 3);
    need(wr.length === 3);
    const m = mcq(r, T(`$${pt(Q)}$`), wr.map((w) => T(`$${pt(w)}$`)));
    return { q: T(`What is the image of $${pt(P)}$ under the translation $${tv(v)}$?${m.opts.en}`, `Apakah imej bagi $${pt(P)}$ di bawah translasi $${tv(v)}$?${m.opts.ms}`), a: m.ans, w: W(...addSteps(P, v, Q), T(`So the answer is ${m.letter}.`, `Jadi jawapannya ialah ${m.letter}.`)), sp: 's' };
  });
  M112.push((r) => { // word problem via a story; two steps (vector then new point)
    const s = r.pick(SUBJ), P = [r.int(-4, 3), r.int(-4, 3)], v = vec(r, 4, false), Q = addv(P, v);
    const R = [r.int(-4, 4), r.int(-4, 4)];
    need(inb([Q, addv(R, v)], 8) && !same(R, P));
    return { q: T(`${SPM.cap(s.a.en)} moves from $${pt(P)}$ to $${pt(Q)}$ on a grid. A second one starts at $${pt(R)}$ and makes exactly the same movement. (a) Write the movement as a column vector. (b) Where does the second one end up?`, `${SPM.cap(s.a.ms)} bergerak dari $${pt(P)}$ ke $${pt(Q)}$ pada satu grid. Satu lagi bermula di $${pt(R)}$ dan membuat pergerakan yang sama. (a) Tulis pergerakan itu sebagai vektor lajur. (b) Di manakah yang kedua itu berakhir?`), a: T(`(a) $${tv(v)}$ (b) $${pt(addv(R, v))}$`), w: W(T('(a) Vector $=$ image $-$ object:', '(a) Vektor $=$ imej $-$ objek:'), `$\\begin{pmatrix} ${n(Q[0])} - ${P2(P[0])} \\\\ ${n(Q[1])} - ${P2(P[1])} \\end{pmatrix} = ${tv(v)}$`, T('(b) Apply the same vector to the second starting point:', '(b) Gunakan vektor yang sama pada titik mula kedua:'), `$(${n(R[0])} + ${P2(v[0])},\\ ${n(R[1])} + ${P2(v[1])}) = ${pt(addv(R, v))}$`), sp: 'm' };
  });
  M112.push((r) => { // table with missing cells
    const v = vec(r, 4, false);
    const O = [0, 1, 2].map(() => [r.int(-4, 4), r.int(-4, 4)]);
    const I = O.map((p) => addv(p, v));
    need(new Set(O.map(String)).size === 3 && inb(I, 8));
    const rows = [[`$A$`, `$${pt(O[0])}$`, `$${pt(I[0])}$`], [`$B$`, `$${pt(O[1])}$`, '?'], [`$C$`, '?', `$${pt(I[2])}$`]];
    return { q: T(`The table shows three points and their images under one translation.<br>${SPM.table(rows, { head: ['Point', 'Object', 'Image'] })}Find the translation vector and complete the table.`, `Jadual menunjukkan tiga titik dan imejnya di bawah satu translasi.<br>${SPM.table(rows, { head: ['Titik', 'Objek', 'Imej'] })}Cari vektor translasi dan lengkapkan jadual.`), a: T(`$${tv(v)}$; $B'${pt(I[1])}$, $C${pt(O[2])}$`), w: W(T(`Use the complete row $A$: $${pt(O[0])} \\to ${pt(I[0])}$`, `Gunakan baris lengkap $A$: $${pt(O[0])} \\to ${pt(I[0])}$`), ...vecSteps(O[0], I[0], v), `$B' = (${n(O[1][0])} + ${P2(v[0])},\\ ${n(O[1][1])} + ${P2(v[1])}) = ${pt(I[1])}$`, `$C = (${n(I[2][0])} - ${P2(v[0])},\\ ${n(I[2][1])} - ${P2(v[1])}) = ${pt(O[2])}$`), sp: 'm' };
  });
  M112.push((r) => { // draw the image, then answer about a vertex
    const O = shape(r, r.pick(['tri', 'quad']), 2), names = nm(r, O.length);
    const v = [r.pick([-4, 4, 5, -5, 6, -6]), r.pick([-3, 3, 4, -4, 0])];
    const I = O.map((p) => addv(p, v));
    need(inb(I, 8));
    const key = (p) => (v[0] > 0 ? p[0] : -p[0]);
    const best = Math.max(...I.map(key));
    const idx = I.map((p, i) => (key(p) === best ? i : -1)).filter((i) => i >= 0);
    need(idx.length === 1);
    const j = idx[0];
    return { q: T(`Shape ${names.join('')} is translated by $${tv(v)}$. Copy the diagram and draw the image. Which vertex of the image is furthest to the ${v[0] > 0 ? 'right' : 'left'}, and what are its coordinates?`, `Bentuk ${names.join('')} ditranslasikan oleh $${tv(v)}$. Salin rajah dan lukis imejnya. Bucu imej yang manakah paling jauh ke ${v[0] > 0 ? 'kanan' : 'kiri'}, dan apakah koordinatnya?`), fig: fig({ O, names }), a: T(`$${names[j]}'${pt(I[j])}$`), w: W(T(`Add $${tv(v)}$ to every vertex.`, `Tambah $${tv(v)}$ kepada setiap bucu.`), ...O.map((p, i) => `$${names[i]}${pt(p)} \\to ${names[i]}'${pt(I[i])}$`), T(`The ${v[0] > 0 ? 'largest' : 'smallest'} image $x$-coordinate is $${n(I[j][0])}$, so the answer is $${names[j]}'${pt(I[j])}$.`, `Koordinat-$x$ imej yang ${v[0] > 0 ? 'terbesar' : 'terkecil'} ialah $${n(I[j][0])}$, jadi jawapannya ialah $${names[j]}'${pt(I[j])}$.`)), sp: 'm' };
  });

  /* ---- advanced 11.2 ---- */
  A112.push((r) => { // recover the object from the image (figure with image only, or listed)
    const k = r.pick([3, 4, 5]);
    const I = shape(r, KIND_OF[k], 4), v = vec(r, 5, true), O = I.map((p) => subv(p, v));
    need(inb(O, 8) && (O.some((p) => p[0] < 0) && O.some((p) => p[0] > 0) || O.some((p) => p[1] < 0) && O.some((p) => p[1] > 0)));
    const names = nm(r, k);
    const asFig = r.chance(0.5);
    const forms = asFig
      ? [["The diagram shows {nn} ${i}$, which is the image of ${o}$ under the translation ${v}$. Find the coordinates of the vertices of the object ${o}$.", "Rajah menunjukkan {nn} ${i}$, iaitu imej bagi ${o}$ di bawah translasi ${v}$. Cari koordinat bucu objek ${o}$."]]
      : [["{Nn} ${i}$ has vertices {il}. It is the image of ${o}$ under the translation ${v}$. Find the coordinates of ${o}$.", "{Nn} ${i}$ mempunyai bucu {il}. Ia ialah imej bagi ${o}$ di bawah translasi ${v}$. Cari koordinat ${o}$."],
        ["The image of a {nn} under the translation ${v}$ has vertices {il}. Work backwards to find the vertices of the original {nn} ${o}$.", "Imej sebuah {nn} di bawah translasi ${v}$ mempunyai bucu {il}. Kerja ke belakang untuk mencari bucu {nn} asal ${o}$."]];
    const items = [{ t: 'poly', p: I, names, prime: "'", style: 'img' }];
    return { q: fill(r.pick(forms), { nn: noun(k), Nn: cap(noun(k)), i: names.map((c) => c + "'").join(''), o: names.join(''), v: tv(v), il: M(plist(names, I, "'")) }), fig: asFig ? render({ items }) : undefined, a: ansPts(names, O), w: W(T(`Object $=$ image $-$ vector $${tv(v)}$.`, `Objek $=$ imej $-$ vektor $${tv(v)}$.`), ...I.map((p, i) => `$${names[i]}'${pt(p)} \\to ${names[i]}${pt(O[i])}$`)), sp: 'm' };
  });
  A112.push((r) => { // two unknown vector components + unknown point
    const v = vec(r, 4, true), A = [r.int(-4, 4), r.int(-4, 4)], B = [r.int(-4, 4), r.int(-4, 4)];
    need(!same(A, B) && inb([addv(A, v), addv(B, v)], 9));
    const A1 = addv(A, v), B1 = addv(B, v);
    return { q: T(`A translation $\\begin{pmatrix} h \\\\ k \\end{pmatrix}$ maps $A${pt(A)}$ onto $A'${pt(A1)}$ and $B(p,\\ q)$ onto $B'${pt(B1)}$. Find $h$, $k$, $p$ and $q$.`, `Translasi $\\begin{pmatrix} h \\\\ k \\end{pmatrix}$ memetakan $A${pt(A)}$ ke $A'${pt(A1)}$ dan $B(p,\\ q)$ ke $B'${pt(B1)}$. Cari $h$, $k$, $p$ dan $q$.`), a: T(`$h = ${v[0]},\\ k = ${v[1]},\\ p = ${B[0]},\\ q = ${B[1]}$`), w: W(...vecSteps(A, A1, v), `$h = ${n(v[0])},\\ k = ${n(v[1])}$`, T(`Then $B$ is $B'$ minus the vector:`, `Kemudian $B$ ialah $B'$ tolak vektor itu:`), `$(${n(B1[0])} - ${P2(v[0])},\\ ${n(B1[1])} - ${P2(v[1])}) = ${pt(B)}$`), sp: 'm' };
  });
  A112.push((r) => { // three part chain
    const P = [r.int(-5, 3), r.int(-5, 3)], v = vec(r, 4, true), Q = addv(P, v), R = [r.int(-4, 4), r.int(-4, 4)];
    need(inb([Q, addv(R, v)], 8) && !same(P, R));
    const forms = [
      [`(a) Find the vector of the translation that maps $P${pt(P)}$ onto $P'${pt(Q)}$. (b) Find the image of $R${pt(R)}$ under this translation. (c) Write the translation that maps $R'$ back onto $R$.`, `(a) Cari vektor translasi yang memetakan $P${pt(P)}$ ke $P'${pt(Q)}$. (b) Cari imej $R${pt(R)}$ di bawah translasi ini. (c) Tulis translasi yang memetakan $R'$ kembali ke $R$.`, `(a) $${tv(v)}$ (b) $${pt(addv(R, v))}$ (c) $${tv([-v[0], -v[1]])}$`, `(a) $${tv(v)}$ (b) $${pt(addv(R, v))}$ (c) $${tv([-v[0], -v[1]])}$`],
      [`(a) State the horizontal and vertical movement that takes $P${pt(P)}$ to $P'${pt(Q)}$. (b) Find the object point whose image is $R'${pt(R)}$ under the same translation. (c) Calculate the distance $PP'$, correct to 2 decimal places.`, `(a) Nyatakan gerakan mengufuk dan mencancang yang membawa $P${pt(P)}$ ke $P'${pt(Q)}$. (b) Cari titik objek yang imejnya ialah $R'${pt(R)}$ di bawah translasi yang sama. (c) Hitung jarak $PP'$, betul kepada 2 tempat perpuluhan.`, `(a) ${moveEN(v)} (b) $${pt(subv(R, v))}$ (c) $${n(round(Math.hypot(v[0], v[1]), 2))}$`, `(a) ${moveMS(v)} (b) $${pt(subv(R, v))}$ (c) $${n(round(Math.hypot(v[0], v[1]), 2))}$`],
    ];
    const f = r.pick(forms);
    const dist = Math.hypot(v[0], v[1]), dr = round(dist, 2);
    const w0 = W(
      T('(a) Translation vector $=$ image $-$ object.', '(a) Vektor translasi $=$ imej $-$ objek.'),
      `$\\begin{pmatrix} ${n(Q[0])} - ${P2(P[0])} \\\\ ${n(Q[1])} - ${P2(P[1])} \\end{pmatrix} = ${tv(v)}$`,
      `(b) $(${n(R[0])} + ${P2(v[0])},\\ ${n(R[1])} + ${P2(v[1])}) = ${pt(addv(R, v))}$`,
      T('(c) Reverse both signs to undo the translation.', '(c) Songsangkan kedua-dua tanda untuk membatalkan translasi itu.'),
      `$${tv([-v[0], -v[1]])}$`);
    const w1 = W(
      T(`(a) $${pt(P)} \\to ${pt(Q)}$, that is ${moveEN(v)}.`, `(a) $${pt(P)} \\to ${pt(Q)}$, iaitu ${moveMS(v)}.`),
      T('(b) Object $=$ image $-$ vector:', '(b) Objek $=$ imej $-$ vektor:'),
      `$(${n(R[0])} - ${P2(v[0])},\\ ${n(R[1])} - ${P2(v[1])}) = ${pt(subv(R, v))}$`,
      T('(c) $PP\' = \\sqrt{(\\text{horizontal})^2 + (\\text{vertical})^2}$', '(c) $PP\' = \\sqrt{(\\text{mengufuk})^2 + (\\text{mencancang})^2}$'),
      `$= \\sqrt{${P2(v[0])}^2 + ${P2(v[1])}^2} = \\sqrt{${v[0] * v[0] + v[1] * v[1]}} ${dist === dr ? '=' : '\\approx'} ${n(dr)}$`);
    return { q: T(f[0], f[1]), a: T(f[2], f[3]), w: f === forms[0] ? w0 : w1, sp: 'l' };
  });
  A112.push((r) => { // explain bank
    const bank = [
      ['Explain why no point is invariant under a translation whose vector is not $\\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix}$.', 'Terangkan mengapa tiada titik yang tak berubah di bawah translasi yang vektornya bukan $\\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix}$.', 'Every point moves the same non-zero distance in the same direction, so no point can stay where it is.', 'Setiap titik bergerak dengan jarak bukan sifar yang sama dan arah yang sama, jadi tiada titik yang kekal di tempatnya.'],
      ['Explain why the image of a triangle under a translation is congruent to the triangle.', 'Terangkan mengapa imej segi tiga di bawah translasi adalah kongruen dengan segi tiga itu.', 'Each vertex moves by the same vector, so all side lengths and angles are preserved; the image has the same size and shape.', 'Setiap bucu bergerak dengan vektor yang sama, jadi semua panjang sisi dan sudut dikekalkan; imej mempunyai saiz dan bentuk yang sama.'],
      ['Why is a translation described by only a column vector and not by a centre or a mirror line?', 'Mengapakah translasi diperihalkan hanya dengan vektor lajur dan bukan dengan pusat atau garis cermin?', 'Every point moves by the same distance in the same direction, and the vector states both; no fixed point or line is needed.', 'Setiap titik bergerak dengan jarak dan arah yang sama, dan vektor itu menyatakan kedua-duanya; tiada titik atau garis tetap diperlukan.'],
      ['A shape is translated. Explain why the image faces the same way as the object.', 'Sebuah bentuk ditranslasikan. Terangkan mengapa imej menghadap arah yang sama dengan objek.', 'A translation slides the shape without turning or flipping it, so its orientation is unchanged.', 'Translasi menggelongsorkan bentuk tanpa memutar atau membalikkannya, jadi orientasinya tidak berubah.'],
      ['The image of $A$ is $A\'$ and the image of $B$ is $B\'$ under a translation. Explain why $AA\'B\'B$ is a parallelogram (when $A$, $B$, $A\'$ are not collinear).', 'Imej $A$ ialah $A\'$ dan imej $B$ ialah $B\'$ di bawah satu translasi. Terangkan mengapa $AA\'B\'B$ ialah sebuah segi empat selari (apabila $A$, $B$, $A\'$ tidak segaris).', '$AA\'$ and $BB\'$ are equal and parallel (the same vector), so two opposite sides are equal and parallel.', '$AA\'$ dan $BB\'$ adalah sama dan selari (vektor yang sama), jadi dua sisi bertentangan adalah sama dan selari.'],
      ['Explain why translating by $\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ and then translating the image by $\\begin{pmatrix} -a \\\\ -b \\end{pmatrix}$ returns the shape to its original position.', 'Terangkan mengapa translasi $\\begin{pmatrix} a \\\\ b \\end{pmatrix}$ diikuti translasi $\\begin{pmatrix} -a \\\\ -b \\end{pmatrix}$ ke atas imej mengembalikan bentuk itu ke kedudukan asal.', 'The second movement undoes the first: the horizontal movements $a$ and $-a$ cancel, and so do $b$ and $-b$.', 'Gerakan kedua membatalkan gerakan pertama: gerakan mengufuk $a$ dan $-a$ saling batal, begitu juga $b$ dan $-b$.'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('Key idea: a translation moves every point by the same vector, so it does not turn, flip or resize the shape.', 'Idea utama: translasi menggerakkan setiap titik dengan vektor yang sama, jadi ia tidak memutar, membalikkan atau mengubah saiz bentuk itu.'), T(b[2], b[3])), sp: 'm' };
    const P = [r.int(-4, 4), r.int(-4, 4)], Q = [r.int(-4, 4), r.int(-4, 4)], v = vec(r, 4, false);
    need(!same(P, Q) && inb([addv(P, v), addv(Q, v)], 8));
    const P1 = addv(P, v), Q1 = addv(Q, v);
    const pq = subv(Q, P);
    return { q: T(`Points $P${pt(P)}$ and $Q${pt(Q)}$ are mapped to $P'${pt(P1)}$ and $Q'${pt(Q1)}$ by a translation. By writing as column vectors the movement from $P$ to $Q$ and the movement from $P'$ to $Q'$, show that $PQ$ and $P'Q'$ have the same length and are parallel.`, `Titik $P${pt(P)}$ dan $Q${pt(Q)}$ dipetakan kepada $P'${pt(P1)}$ dan $Q'${pt(Q1)}$ oleh satu translasi. Dengan menulis sebagai vektor lajur pergerakan dari $P$ ke $Q$ dan pergerakan dari $P'$ ke $Q'$, tunjukkan bahawa $PQ$ dan $P'Q'$ mempunyai panjang yang sama dan selari.`), a: T(`$P \\to Q$: $${tv(pq)}$ and $P' \\to Q'$: $${tv(subv(Q1, P1))}$. The column vectors are equal, so the segments are equal in length and parallel.`, `$P \\to Q$: $${tv(pq)}$ dan $P' \\to Q'$: $${tv(subv(Q1, P1))}$. Vektor lajur adalah sama, jadi tembereng itu sama panjang dan selari.`), w: W(T(`$P \\to Q$: $\\begin{pmatrix} ${n(Q[0])} - ${P2(P[0])} \\\\ ${n(Q[1])} - ${P2(P[1])} \\end{pmatrix} = ${tv(pq)}$`), T(`$P' \\to Q'$: $\\begin{pmatrix} ${n(Q1[0])} - ${P2(P1[0])} \\\\ ${n(Q1[1])} - ${P2(P1[1])} \\end{pmatrix} = ${tv(subv(Q1, P1))}$`), T('The two column vectors are equal, so $PQ$ and $P\'Q\'$ have the same length and the same direction, i.e. they are equal and parallel.', 'Kedua-dua vektor lajur adalah sama, jadi $PQ$ dan $P\'Q\'$ mempunyai panjang yang sama dan arah yang sama, iaitu sama dan selari.')), sp: 'l' };
  });
  A112.push((r) => { // t, 2t vector
    const t = r.nz(-3, 3), c = r.pick([2, 3, -1, -2]);
    const P = [r.int(-4, 4), r.int(-4, 4)], v = [t, c * t];
    const Q = addv(P, v);
    need(inb([Q], 9));
    const which = r.pick(['x', 'y']);
    const given = which === 'x' ? `$P'(x,\\ ${Q[1]})$` : `$P'(${Q[0]},\\ y)$`;
    const ansT = which === 'x' ? `$t = ${t},\\ x = ${Q[0]}$` : `$t = ${t},\\ y = ${Q[1]}$`;
    return { q: T(`The point $P${pt(P)}$ is mapped onto ${given} by the translation $\\begin{pmatrix} t \\\\ ${c === 1 ? '' : c === -1 ? '-' : c}t \\end{pmatrix}$. Find the value of $t$ and the missing coordinate.`, `Titik $P${pt(P)}$ dipetakan ke ${given} oleh translasi $\\begin{pmatrix} t \\\\ ${c === 1 ? '' : c === -1 ? '-' : c}t \\end{pmatrix}$. Cari nilai $t$ dan koordinat yang tidak diketahui.`), a: T(ansT), w: which === 'x'
      ? W(T('Use the known $y$-coordinate to form an equation in $t$.', 'Gunakan koordinat-$y$ yang diketahui untuk membentuk persamaan dalam $t$.'), `$${SPM.poly([[c, 't'], [P[1], '']])} = ${n(Q[1])}$`, `$t = ${n(t)}$`, T(`Then $x = ${n(P[0])} + ${P2(t)} = ${n(Q[0])}$`, `Maka $x = ${n(P[0])} + ${P2(t)} = ${n(Q[0])}$`))
      : W(T('Use the known $x$-coordinate to form an equation in $t$.', 'Gunakan koordinat-$x$ yang diketahui untuk membentuk persamaan dalam $t$.'), `$${SPM.poly([[1, 't'], [P[0], '']])} = ${n(Q[0])}$`, `$t = ${n(t)}$`, T(`Then $y = ${n(P[1])} + ${P2(c * t)} = ${n(Q[1])}$`, `Maka $y = ${n(P[1])} + ${P2(c * t)} = ${n(Q[1])}$`)), sp: 'm' };
  });
  A112.push((r) => { // drone flight three parts
    const s = r.pick(SUBJ), P = [r.int(-3, 3), r.int(-3, 3)], tr = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10]]);
    const v = [tr[0] * r.sign(), tr[1] * r.sign()], Q = addv(P, v);
    need(inb([Q], 9));
    return { q: T(`${SPM.cap(s.a.en)} on a map (1 unit = 100 m) moves from $A${pt(P)}$ to $B${pt(Q)}$ in one straight move. (a) Write the translation as a column vector. (b) Calculate the distance moved, in metres. (c) Write the translation that takes it back from $B$ to $A$.`, `${SPM.cap(s.a.ms)} pada sebuah peta (1 unit = 100 m) bergerak dari $A${pt(P)}$ ke $B${pt(Q)}$ dalam satu gerakan lurus. (a) Tulis translasi itu sebagai vektor lajur. (b) Hitung jarak yang digerakkan, dalam meter. (c) Tulis translasi yang membawanya kembali dari $B$ ke $A$.`), a: T(`(a) $${tv(v)}$ (b) $${tr[2] * 100}$ m (c) $${tv([-v[0], -v[1]])}$`), w: W(T('(a) Vector $=$ image $-$ object:', '(a) Vektor $=$ imej $-$ objek:'), `$\\begin{pmatrix} ${n(Q[0])} - ${P2(P[0])} \\\\ ${n(Q[1])} - ${P2(P[1])} \\end{pmatrix} = ${tv(v)}$`, T('(b) Distance $= \\sqrt{(\\text{horizontal})^2 + (\\text{vertical})^2}$', '(b) Jarak $= \\sqrt{(\\text{mengufuk})^2 + (\\text{mencancang})^2}$'), `$= \\sqrt{${P2(v[0])}^2 + ${P2(v[1])}^2} = ${tr[2]}$`, T(`$${tr[2]} \\times 100 = ${tr[2] * 100}$ m`), T('(c) Reverse both signs.', '(c) Songsangkan kedua-dua tanda.'), `$${tv([-v[0], -v[1]])}$`), sp: 'l' };
  });
  A112.push((r) => { // preserved measures
    const per = r.int(12, 40), ar = r.int(6, 40), ang = r.step(30, 110, 5);
    const forms = [
      [`Triangle $ABC$ has perimeter ${per} cm, area ${ar} cm² and $\\angle ABC = ${ang}^\\circ$. It is translated to $A'B'C'$. State the perimeter, area and $\\angle A'B'C'$ of the image, giving a reason.`, `Segi tiga $ABC$ mempunyai perimeter ${per} cm, luas ${ar} cm² dan $\\angle ABC = ${ang}^\\circ$. Ia ditranslasikan ke $A'B'C'$. Nyatakan perimeter, luas dan $\\angle A'B'C'$ bagi imej, dengan memberi sebab.`, `Perimeter ${per} cm, area ${ar} cm², $\\angle A'B'C' = ${ang}^\\circ$: a translation preserves lengths and angles, so the image is congruent to the triangle.`, `Perimeter ${per} cm, luas ${ar} cm², $\\angle A'B'C' = ${ang}^\\circ$: translasi mengekalkan panjang dan sudut, jadi imej kongruen dengan segi tiga itu.`],
      [`A rectangular plate with area ${ar * 2} cm² is translated by $\\begin{pmatrix} 4 \\\\ -3 \\end{pmatrix}$. What is the area of its image? Give a reason.`, `Sebuah plat segi empat tepat dengan luas ${ar * 2} cm² ditranslasikan oleh $\\begin{pmatrix} 4 \\\\ -3 \\end{pmatrix}$. Berapakah luas imejnya? Berikan sebab.`, `${ar * 2} cm²: a translation does not change size or shape.`, `${ar * 2} cm²: translasi tidak mengubah saiz atau bentuk.`],
    ];
    const f = r.pick(forms);
    return { q: T(f[0], f[1]), a: T(f[2], f[3]), w: W(T('A translation is an isometry: it slides the shape without turning, flipping or resizing it.', 'Translasi ialah isometri: ia menggelongsorkan bentuk tanpa memutar, membalikkan atau mengubah saiznya.'), T('So lengths, angles and areas stay exactly the same; the image is congruent to the object.', 'Jadi panjang, sudut dan luas kekal sama; imej adalah kongruen dengan objek.')), sp: 'm' };
  });
  A112.push((r) => { // which candidate shape is the translation image
    const base = r.pick([() => scalene(r, 2, 3), () => shape(r, 'hex', 2)])();
    const mx = Math.min(...base.map((p) => p[0])), my = Math.min(...base.map((p) => p[1]));
    const B0 = base.map((p) => [p[0] - mx, p[1] - my]);
    const w = Math.max(...B0.map((p) => p[0])) , h = Math.max(...B0.map((p) => p[1]));
    const norm = (P) => { const a = Math.min(...P.map((p) => p[0])), b = Math.min(...P.map((p) => p[1])); return P.map((p) => [p[0] - a, p[1] - b]); };
    const refl0 = norm(B0.map((p) => [-p[0], p[1]]));
    const rot0 = norm(B0.map((p) => [-p[1], p[0]]));
    const rot2 = norm(B0.map((p) => [-p[0], -p[1]]));
    const wrongKinds = r.shuffle([refl0, rot0, rot2]).slice(0, 2);
    const cand = r.shuffle([{ P: B0, tr: true }, { P: wrongKinds[0] }, { P: wrongKinds[1] }]);
    const slots = [[-9, 2], [-3, 2], [3, 2], [9, 2]].map((s) => s);
    const place = (P, s) => P.map((p) => [p[0] + s[0], p[1] - 2 + s[1] - 2 * 0]);
    const S0 = place(B0, [-9, 0]);
    const others = cand.map((c, i) => place(c.P, [-3 + 6 * i, 0]));
    const items = [];
    const lab = (P, s) => ({ t: 'text', p: [P.reduce((a, q) => a + q[0], 0) / P.length, Math.min(...P.map((q) => q[1])) - 1.2], s });
    items.push({ t: 'poly', p: S0, style: 'obj', nolab: true }); items.push(lab(S0, 'A'));
    others.forEach((P, i) => { items.push({ t: 'poly', p: P, style: 'obj', nolab: true }); items.push(lab(P, 'BCD'[i])); });
    const ti = cand.findIndex((c) => c.tr);
    return { q: T('Shape $A$ is transformed into one of the shapes $B$, $C$ or $D$ by a translation. Which one is it? Give a reason.', 'Bentuk $A$ ditransformasikan kepada salah satu bentuk $B$, $C$ atau $D$ oleh satu translasi. Yang manakah? Berikan sebab.'), fig: render({ items, axes: false, win: [-11, 13, -3, Math.max(h, w) + 2] }), a: T(`Shape $${'BCD'[ti]}$: it is the same shape in the same orientation, only moved; the others are turned or flipped.`, `Bentuk $${'BCD'[ti]}$: ia bentuk yang sama dengan orientasi yang sama, hanya digerakkan; yang lain diputar atau dibalikkan.`), w: W(T('A translation keeps the size and the orientation of a shape; only its position changes.', 'Translasi mengekalkan saiz dan orientasi sesuatu bentuk; hanya kedudukannya berubah.'), T(`Only $${'BCD'[ti]}$ faces the same way as $A$, so $${'BCD'[ti]}$ is the translation image.`, `Hanya $${'BCD'[ti]}$ menghadap arah yang sama dengan $A$, jadi $${'BCD'[ti]}$ ialah imej translasi itu.`)), sp: 'm' };
  });
  A112.push((r) => { // statements: which are true
    const bank = [
      ['A translation changes the orientation of the object.', 'Translasi mengubah orientasi objek.', false],
      ['A translation preserves lengths.', 'Translasi mengekalkan panjang.', true],
      ['Every point of the object moves the same distance.', 'Setiap titik pada objek bergerak dengan jarak yang sama.', true],
      ['The object and image are congruent.', 'Objek dan imej adalah kongruen.', true],
      ['There is one invariant point under a translation.', 'Terdapat satu titik tak berubah di bawah translasi.', false],
      ['The image is a mirror image.', 'Imej ialah imej cermin.', false],
      ['Corresponding lines of the object and image are parallel.', 'Garis sepadan bagi objek dan imej adalah selari.', true],
      ['The size of angles changes under a translation.', 'Saiz sudut berubah di bawah translasi.', false],
      ['Lines joining corresponding points are parallel to each other.', 'Garis yang menyambung titik sepadan adalah selari antara satu sama lain.', true],
      ['The image is larger than the object.', 'Imej lebih besar daripada objek.', false],
    ];
    const S4 = r.sample(bank, 4);
    need(S4.some((s) => s[2]) && S4.some((s) => !s[2]));
    const list = S4.map((s, i) => `<b>${'ABCD'[i]}.</b> ${s[0]}`).join('<br>'), listM = S4.map((s, i) => `<b>${'ABCD'[i]}.</b> ${s[1]}`).join('<br>');
    const ok = S4.map((s, i) => (s[2] ? 'ABCD'[i] : '')).join('');
    return { q: T(`Which of these statements about a translation are true?<br>${list}`, `Antara pernyataan berikut tentang translasi, yang manakah benar?<br>${listM}`), a: T(`${ok.split('').join(', ')} ${ok.length === 1 ? 'is' : 'are'} true; the others are false.`, `${ok.split('').join(', ')} benar; yang lain palsu.`), w: W(T('A translation slides every point the same distance in the same direction: lengths, angles and orientation are unchanged, object and image are congruent, and no point stays fixed.', 'Translasi menggelongsorkan setiap titik dengan jarak dan arah yang sama: panjang, sudut dan orientasi tidak berubah, objek dan imej adalah kongruen, dan tiada titik yang kekal.'), T(`Checking each statement against this rule: ${ok.split('').join(', ')} agree with it.`, `Menyemak setiap pernyataan dengan hukum ini: ${ok.split('').join(', ')} menepatinya.`)), sp: 'm' };
  });
  A112.push((r) => { // open construct
    const P = [r.int(-4, 4), r.int(-4, 4)];
    const kind = r.pick(['q2', 'q3', 'q4', 'q1']);
    const tgt = { q1: [1, 1], q2: [-1, 1], q3: [-1, -1], q4: [1, -1] }[kind];
    const nameEn = { q1: 'first', q2: 'second', q3: 'third', q4: 'fourth' }[kind], nameMs = { q1: 'pertama', q2: 'kedua', q3: 'ketiga', q4: 'keempat' }[kind];
    const Q = [tgt[0] * r.int(1, 3), tgt[1] * r.int(1, 3)];
    const v = subv(Q, P);
    return { q: T(`Give one translation (as a column vector) that maps $P${pt(P)}$ onto a point in the ${nameEn} quadrant. Show that your answer works.`, `Berikan satu translasi (sebagai vektor lajur) yang memetakan $P${pt(P)}$ ke satu titik dalam sukuan ${nameMs}. Tunjukkan bahawa jawapan anda berfungsi.`), a: T(`Many answers. For example $${tv(v)}$ maps $P$ to $${pt(Q)}$, which is in the ${nameEn} quadrant.`, `Terdapat banyak jawapan. Contohnya $${tv(v)}$ memetakan $P$ ke $${pt(Q)}$, yang berada dalam sukuan ${nameMs}.`), w: W(T(`Pick any target point in the ${nameEn} quadrant, for example $${pt(Q)}$.`, `Pilih mana-mana titik sasaran dalam sukuan ${nameMs}, contohnya $${pt(Q)}$.`), T('Vector $=$ target $-$ object:', 'Vektor $=$ sasaran $-$ objek:'), `$\\begin{pmatrix} ${n(Q[0])} - ${P2(P[0])} \\\\ ${n(Q[1])} - ${P2(P[1])} \\end{pmatrix} = ${tv(v)}$`, T(`Check: $(${n(P[0])} + ${P2(v[0])},\\ ${n(P[1])} + ${P2(v[1])}) = ${pt(Q)}$`, `Semak: $(${n(P[0])} + ${P2(v[0])},\\ ${n(P[1])} + ${P2(v[1])}) = ${pt(Q)}$`)), sp: 'm' };
  });
  A112.push((r) => { // spot the error: finding the object
    const g = r.girl(), Q = [r.int(-4, 4), r.int(-4, 4)], v = vec(r, 4, true), P = subv(Q, v);
    const wrong = addv(Q, v);
    need(inb([P, wrong], 9) && !same(P, wrong));
    return { q: T(`$P'${pt(Q)}$ is the image of $P$ under the translation $${tv(v)}$. ${g} writes: "$P = (${n(Q[0])} + ${SPM.par(v[0])},\\ ${n(Q[1])} + ${SPM.par(v[1])}) = ${pt(wrong)}$". Explain the mistake and find the correct coordinates of $P$.`, `$P'${pt(Q)}$ ialah imej bagi $P$ di bawah translasi $${tv(v)}$. ${g} menulis: "$P = (${n(Q[0])} + ${SPM.par(v[0])},\\ ${n(Q[1])} + ${SPM.par(v[1])}) = ${pt(wrong)}$". Terangkan kesilapan itu dan cari koordinat $P$ yang betul.`), a: T(`The vector was added to the image, but image = object + vector, so the object is image minus vector: $P = ${pt(P)}$.`, `Vektor ditambah kepada imej, sedangkan imej = objek + vektor, jadi objek ialah imej tolak vektor: $P = ${pt(P)}$.`), w: W(...subSteps(Q, v, P), T(`Check: $(${n(P[0])} + ${P2(v[0])},\\ ${n(P[1])} + ${P2(v[1])}) = ${pt(Q)}$`, `Semak: $(${n(P[0])} + ${P2(v[0])},\\ ${n(P[1])} + ${P2(v[1])}) = ${pt(Q)}$`)), sp: 'm' };
  });
  A112.push((r) => { // distance given, find vector
    const tr = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]]);
    const sx = r.sign(), sy = r.sign();
    const P = [r.int(-3, 3), r.int(-3, 3)];
    const which = r.pick([0, 1]);
    const v = [tr[which] * sx, tr[1 - which] * sy];
    const Q = addv(P, v);
    return { q: T(`A translation moves every point ${tr[2]} units. Its horizontal component is ${v[0]} and its vertical component is ${v[1] < 0 ? 'negative' : 'positive'}. Find the translation vector and the image of $A${pt(P)}$.`, `Satu translasi menggerakkan setiap titik sejauh ${tr[2]} unit. Komponen mengufuknya ialah ${v[0]} dan komponen mencancangnya ${v[1] < 0 ? 'negatif' : 'positif'}. Cari vektor translasi dan imej bagi $A${pt(P)}$.`), a: T(`$${tv(v)}$; $A'${pt(Q)}$`), w: W(T(`Let the vertical component be $k$: $${n(v[0])}^2 + k^2 = ${tr[2]}^2$.`, `Biar komponen mencancang ialah $k$: $${n(v[0])}^2 + k^2 = ${tr[2]}^2$.`), `$k^2 = ${tr[2] * tr[2]} - ${v[0] * v[0]} = ${v[1] * v[1]}$`, T(`$k = ${n(v[1])}$ (the ${v[1] < 0 ? 'negative' : 'positive'} root)`, `$k = ${n(v[1])}$ (punca ${v[1] < 0 ? 'negatif' : 'positif'})`), ...addSteps(P, v, Q)), sp: 'm' };
  });

  /* ============================================================= 11.3 Reflection */
  const E113 = [], M113 = [], A113 = [];
  const rpts = (P, l) => P.map((p) => reflect(p, l));
  const AX = () => [mirror('x', 0), mirror('y', 0)];
  /** random mirror line. kinds: 'axis' | 'par' (x=k, y=k) | 'diag' (y=x, y=-x) | 'diagk' (y=±x+k) */
  const rmirror = (r, kind) => {
    if (kind === 'axis') return r.pick(AX());
    if (kind === 'par') return mirror(r.pick(['x', 'y']), r.pick([-3, -2, -1, 1, 2, 3]));
    if (kind === 'diag') return mirror(r.pick(['d1', 'd2']), 0);
    if (kind === 'diagk') return mirror(r.pick(['d1', 'd2']), r.pick([-3, -2, -1, 1, 2, 3]));
    return mirror(r.pick(['x', 'y', 'd1', 'd2']), r.int(-2, 2));
  };
  const lname = (l) => (l.name ? l.name : T(`the line $${l.eq}$`, `garis $${l.eq}$`));
  const ldist = (p, l) => Math.abs(l.a * p[0] + l.b * p[1] - l.c) / Math.hypot(l.a, l.b);
  const oneSide = (S, l) => S.every((p) => l.a * p[0] + l.b * p[1] - l.c > 0) || S.every((p) => l.a * p[0] + l.b * p[1] - l.c < 0);
  /** a random shape with all vertices at least 1 unit from the mirror line, image inside the window */
  const shapeFor = (r, l, k, lim) => retry(() => {
    const O = shape(r, KIND_OF[k], lim);
    const I = rpts(O, l);
    need(inb(I, 8) && O.every((p) => ldist(p, l) >= 1) && oneSide(O, l));
    // object and image on opposite sides means no vertex overlap
    return O;
  });
  const cornerFig = (O, I, names, l, o) => fig(Object.assign({ O, I, names, mirror: l, mirrorLabel: l.kind === 'x' || l.kind === 'y' ? (l.k === 0 ? undefined : l.eq.replace(' = ', '=')) : l.eq.replace(' = ', '=') }, o || {}));

  /* ---- easy ---- */
  E113.push((r) => { // image of a point in an axis
    const P = [r.nz(-6, 6), r.nz(-6, 6)], l = r.pick(AX()), Q = reflect(P, l);
    const ax = l.kind === 'y' ? T('$x$-axis', 'paksi-$x$') : T('$y$-axis', 'paksi-$y$');
    const forms = [
      ["Point $P{P}$ is reflected in the {ax}. Write down the coordinates of its image $P'$.", "Titik $P{P}$ dipantulkan pada {ax}. Tulis koordinat imejnya $P'$."],
      ["What are the coordinates of the mirror image of ${P}$ when the {ax} is the mirror line?", "Apakah koordinat imej cermin bagi ${P}$ apabila {ax} ialah garis cermin?"],
      ["The point ${P}$ is reflected in the {ax}. Which coordinate changes sign, and what is the image?", "Titik ${P}$ dipantulkan pada {ax}. Koordinat yang manakah bertukar tanda, dan apakah imejnya?"],
    ];
    const f = r.pick(forms);
    const which = l.kind === 'y' ? T('the $y$-coordinate', 'koordinat-$y$') : T('the $x$-coordinate', 'koordinat-$x$');
    return { q: fill(f, { P: pt(P), ax }), a: f === forms[2] ? T(`${which.en} changes sign; $${pt(Q)}$`, `${which.ms} bertukar tanda; $${pt(Q)}$`) : T(`$${pt(Q)}$`), w: W(reflRule(l), mapLine(P, Q, 'P', "P'")), sp: 's' };
  });
  E113.push((r) => { // shape in an axis, with figure
    const k = r.pick([3, 4]), l = r.pick(AX());
    const O = shapeFor(r, l, k, 4), I = rpts(O, l), names = nm(r, k);
    const forms = [
      ["The diagram shows {nn} ${o}$. Find the coordinates of its image under a reflection in the {ax}.", "Rajah menunjukkan {nn} ${o}$. Cari koordinat imejnya di bawah pantulan pada {ax}."],
      ["Reflect the {nn} ${o}$ in the {ax}. Write the coordinates of ${i}$.", "Pantulkan {nn} ${o}$ pada {ax}. Tulis koordinat ${i}$."],
    ];
    const ax = l.kind === 'y' ? T('$x$-axis', 'paksi-$x$') : T('$y$-axis', 'paksi-$y$');
    return { q: fill(r.pick(forms), { nn: noun(k), o: names.join(''), i: names.map((c) => c + "'").join(''), ax }), fig: fig({ O, names }), a: ansPts(names, I, "'"), w: W(reflRule(l), ...mapAll(O, I, names)), sp: 'm' };
  });
  E113.push((r) => { // point in x = k or y = k
    const l = mirror(r.pick(['x', 'y']), r.pick([-3, -2, -1, 1, 2, 3]));
    const P = [r.int(-5, 5), r.int(-5, 5)];
    need(ldist(P, l) >= 1);
    const Q = reflect(P, l);
    need(inb([Q], 8));
    const forms = [
      ["Find the image of $P{P}$ when it is reflected in the line ${e}$.", "Cari imej bagi $P{P}$ apabila ia dipantulkan pada garis ${e}$."],
      ["The mirror line is ${e}$. Write the coordinates of the reflection of ${P}$.", "Garis cermin ialah ${e}$. Tulis koordinat pantulan bagi ${P}$."],
      ["${P}$ is reflected in the line ${e}$ to give $P'$. State the coordinates of $P'$.", "${P}$ dipantulkan pada garis ${e}$ untuk memberi $P'$. Nyatakan koordinat $P'$."],
    ];
    return { q: fill(r.pick(forms), { P: pt(P), e: l.eq }), fig: r.chance(0.4) ? fig({ O: [P], names: ['P'], mirror: l, mirrorLabel: l.eq.replace(' = ', '=') }) : undefined, a: T(`$${pt(Q)}$`), w: W(reflRule(l), T(`$P$ is ${u(ldist(P, l))} from the line, so $P'$ is the same distance on the other side.`, `$P$ berjarak ${n(ldist(P, l))} unit dari garis itu, jadi $P'$ berada pada jarak yang sama di sebelah yang lain.`), mapLine(P, Q, 'P', "P'")), sp: 's' };
  });
  E113.push((r) => { // distance to mirror line and image
    const l = mirror(r.pick(['x', 'y']), r.pick([-2, -1, 0, 1, 2, 3]));
    const P = [r.int(-5, 5), r.int(-5, 5)];
    need(ldist(P, l) >= 1 && inb([reflect(P, l)], 8));
    const d = ldist(P, l);
    const Q = reflect(P, l);
    const forms = [
      ["Point $P{P}$ is {d} units from the mirror line ${e}$. How far is its image $P'$ from the mirror line?", "Titik $P{P}$ berjarak {d} unit dari garis cermin ${e}$. Berapakah jarak imejnya $P'$ dari garis cermin?", `${d} units`, `${d} unit`],
      ["$P{P}$ is reflected in the line ${e}$. Find the distance $PP'$.", "$P{P}$ dipantulkan pada garis ${e}$. Cari jarak $PP'$.", `${2 * d} units`, `${2 * d} unit`],
    ];
    const f = r.pick(forms);
    return { q: fill([f[0], f[1]], { P: pt(P), d: n(d), e: l.eq }), a: T(f[2], f[3]), w: W(T('The mirror line is the perpendicular bisector of $PP\'$, so the image is the same distance from the line as the object, on the other side.', 'Garis cermin ialah pembahagi dua sama serenjang bagi $PP\'$, jadi imej berada pada jarak yang sama dari garis itu seperti objek, di sebelah yang lain.'), f === forms[0] ? T(`Image distance $=$ object distance $= ${n(d)}$ units.`, `Jarak imej $=$ jarak objek $= ${n(d)}$ unit.`) : T(`$PP' = 2 \\times ${n(d)} = ${n(2 * d)}$ units.`, `$PP' = 2 \\times ${n(d)} = ${n(2 * d)}$ unit.`)), sp: 's' };
  });
  E113.push((r) => { // point on the mirror line is invariant
    const l = mirror(r.pick(['x', 'y']), r.pick([-3, -2, -1, 0, 1, 2, 3]));
    const t = r.int(-4, 4);
    const P = l.kind === 'x' ? [l.k, t] : [t, l.k];
    const forms = [
      ["Find the image of $P{P}$ when it is reflected in the line ${e}$. What do you notice?", "Cari imej bagi $P{P}$ apabila ia dipantulkan pada garis ${e}$. Apakah yang anda perhatikan?"],
      ["The point ${P}$ lies on the mirror line ${e}$. Where is its image?", "Titik ${P}$ terletak pada garis cermin ${e}$. Di manakah imejnya?"],
    ];
    return { q: fill(r.pick(forms), { P: pt(P), e: l.eq }), a: T(`$${pt(P)}$: it lies on the mirror line, so it does not move (an invariant point).`, `$${pt(P)}$: ia terletak pada garis cermin, jadi ia tidak bergerak (titik tak berubah).`), w: W(reflRule(l), T(`$${pt(P)}$ satisfies $${l.eq}$, so its distance from the mirror line is $0$.`, `$${pt(P)}$ memenuhi $${l.eq}$, jadi jaraknya dari garis cermin ialah $0$.`), T('A point on the mirror line maps onto itself: it is an invariant point.', 'Titik pada garis cermin dipetakan kepada dirinya sendiri: ia titik tak berubah.')), sp: 's' };
  });
  E113.push((r) => { // T/F bank
    const bank = [
      ['Under a reflection, the object and its image are congruent.', 'Di bawah pantulan, objek dan imejnya adalah kongruen.', true, 'A reflection is an isometry.', 'Pantulan ialah isometri.'],
      ['A reflection turns the object through an angle about a fixed point.', 'Pantulan memutarkan objek melalui suatu sudut pada satu titik tetap.', false, 'That describes a rotation.', 'Itu memerihalkan putaran.'],
      ['Each point and its image are the same distance from the mirror line.', 'Setiap titik dan imejnya berjarak sama dari garis cermin.', true, 'The mirror line is the perpendicular bisector of the line joining a point and its image.', 'Garis cermin ialah pembahagi dua sama serenjang bagi garis yang menyambung titik dan imejnya.'],
      ['The image of a reflection is larger than the object.', 'Imej pantulan lebih besar daripada objek.', false, 'Size is preserved.', 'Saiz dikekalkan.'],
      ['A point on the mirror line is mapped onto itself.', 'Titik pada garis cermin dipetakan kepada dirinya sendiri.', true, 'It is an invariant point.', 'Ia ialah titik tak berubah.'],
      ['The line joining a point to its image is parallel to the mirror line.', 'Garis yang menyambung satu titik dengan imejnya adalah selari dengan garis cermin.', false, 'It is perpendicular to the mirror line.', 'Ia serenjang dengan garis cermin.'],
      ['The image is a mirror image of the object.', 'Imej ialah imej cermin bagi objek.', true, 'That is what reflection means.', 'Itulah maksud pantulan.'],
      ['Reflecting a point in the $x$-axis changes the sign of its $x$-coordinate.', 'Memantulkan titik pada paksi-$x$ menukar tanda koordinat-$x$nya.', false, 'It changes the sign of the $y$-coordinate.', 'Ia menukar tanda koordinat-$y$.'],
      ['Reflecting a point in the $y$-axis changes the sign of its $x$-coordinate.', 'Memantulkan titik pada paksi-$y$ menukar tanda koordinat-$x$nya.', true, 'The $y$-coordinate stays the same.', 'Koordinat-$y$ kekal sama.'],
      ['A reflection changes the lengths of the sides of a shape.', 'Pantulan mengubah panjang sisi suatu bentuk.', false, 'Lengths are preserved.', 'Panjang dikekalkan.'],
      ['If the image is reflected in the same mirror line again, it returns to the object.', 'Jika imej dipantulkan pada garis cermin yang sama sekali lagi, ia kembali ke objek.', true, 'Reflection is its own inverse.', 'Pantulan ialah songsangan bagi dirinya sendiri.'],
      ['A reflection can be described completely by a column vector.', 'Pantulan boleh diperihalkan sepenuhnya dengan vektor lajur.', false, 'A reflection needs a mirror line.', 'Pantulan memerlukan garis cermin.'],
    ];
    const b = r.pick(bank);
    return { q: T(`True or false? ${b[0]}`, `Benar atau palsu? ${b[1]}`), a: T(`${b[2] ? 'True' : 'False'}. ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}. ${b[4]}`), w: W(T('A reflection flips the shape over the mirror line: it is an isometry, the mirror line is the perpendicular bisector of the segment joining a point to its image, and points on the mirror line do not move.', 'Pantulan membalikkan bentuk pada garis cermin: ia isometri, garis cermin ialah pembahagi dua sama serenjang bagi tembereng yang menyambung satu titik dengan imejnya, dan titik pada garis cermin tidak bergerak.'), T(`${b[2] ? 'True' : 'False'}: ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}: ${b[4]}`)), sp: 's' };
  });
  E113.push((r) => { // which axis
    const P = [r.nz(-5, 5), r.nz(-5, 5)], l = r.pick(AX()), Q = reflect(P, l);
    const forms = [
      ["$P{P}$ is reflected onto $P'{Q}$. Is the mirror line the $x$-axis or the $y$-axis?", "$P{P}$ dipantulkan ke $P'{Q}$. Adakah garis cermin ialah paksi-$x$ atau paksi-$y$?"],
      ["The image of ${P}$ under a reflection is ${Q}$. Name the mirror line (the $x$-axis or the $y$-axis).", "Imej bagi ${P}$ di bawah suatu pantulan ialah ${Q}$. Namakan garis cermin (paksi-$x$ atau paksi-$y$)."],
    ];
    return { q: fill(r.pick(forms), { P: pt(P), Q: pt(Q) }), a: T(l.kind === 'y' ? 'The $x$-axis (the $y$-coordinate changes sign)' : 'The $y$-axis (the $x$-coordinate changes sign)', l.kind === 'y' ? 'Paksi-$x$ (koordinat-$y$ bertukar tanda)' : 'Paksi-$y$ (koordinat-$x$ bertukar tanda)'), w: W(T(`Compare the coordinates: $${pt(P)} \\to ${pt(Q)}$`, `Bandingkan koordinat: $${pt(P)} \\to ${pt(Q)}$`), l.kind === 'y' ? T('Only the $y$-coordinate changed sign, which is a reflection in the $x$-axis.', 'Hanya koordinat-$y$ bertukar tanda, iaitu pantulan pada paksi-$x$.') : T('Only the $x$-coordinate changed sign, which is a reflection in the $y$-axis.', 'Hanya koordinat-$x$ bertukar tanda, iaitu pantulan pada paksi-$y$.')), sp: 's' };
  });
  E113.push((r) => { // figure with mirror line drawn: read image vertex
    const k = r.pick([3, 4]), l = mirror(r.pick(['x', 'y']), r.pick([-2, -1, 0, 1, 2]));
    const O = shapeFor(r, l, k, 4), I = rpts(O, l), names = nm(r, k), j = r.int(0, k - 1);
    const forms = [
      ["The diagram shows {nn} ${o}$ and the mirror line ${e}$. Find the coordinates of ${p}$, the image of ${x}$.", "Rajah menunjukkan {nn} ${o}$ dan garis cermin ${e}$. Cari koordinat ${p}$, imej bagi ${x}$."],
      ["Reflect {nn} ${o}$ in the line shown (${e}$). State the coordinates of the image of vertex ${x}$.", "Pantulkan {nn} ${o}$ pada garis yang ditunjukkan (${e}$). Nyatakan koordinat imej bagi bucu ${x}$."],
    ];
    return { q: fill(r.pick(forms), { nn: noun(k), o: names.join(''), e: l.eq, p: names[j] + "'", x: names[j] }), fig: fig({ O, names, mirror: l, mirrorLabel: l.eq.replace(' = ', '=') }), a: T(`$${names[j]}'${pt(I[j])}$`), w: W(T(`Read the vertex from the diagram: $${names[j]}${pt(O[j])}$.`, `Baca bucu daripada rajah: $${names[j]}${pt(O[j])}$.`), reflRule(l), mapLine(O[j], I[j], names[j], names[j] + "'")), sp: 's' };
  });
  E113.push((r) => { // sentence completion
    const bank = [
      ['Fill in the blank: a mirror line is the perpendicular ______ of the line joining a point and its image.', 'Isi tempat kosong: garis cermin ialah ______ sama serenjang bagi garis yang menyambung satu titik dengan imejnya.', 'bisector', 'pembahagi dua'],
      ['Fill in the blank: a point on the mirror line is called an ______ point because it does not move.', 'Isi tempat kosong: titik pada garis cermin dipanggil titik ______ kerana ia tidak bergerak.', 'invariant', 'tak berubah'],
      ['Fill in the blank: a reflection is an ______ because it preserves lengths and angles.', 'Isi tempat kosong: pantulan ialah ______ kerana ia mengekalkan panjang dan sudut.', 'isometry', 'isometri'],
      ['Fill in the blank: the image formed by a reflection is a ______ image of the object.', 'Isi tempat kosong: imej yang terbentuk oleh pantulan ialah imej ______ bagi objek.', 'mirror', 'cermin'],
      ['Fill in the blank: reflecting a shape twice in the same line gives the ______ shape.', 'Isi tempat kosong: memantulkan suatu bentuk dua kali pada garis yang sama memberikan bentuk yang ______.', 'original', 'asal'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('Key words of a reflection: mirror line, perpendicular bisector, invariant point, isometry, mirror image, own inverse.', 'Kata kunci pantulan: garis cermin, pembahagi dua sama serenjang, titik tak berubah, isometri, imej cermin, songsangan sendiri.'), T(`The word that fits the sentence is "${b[2]}".`, `Perkataan yang sesuai dengan ayat itu ialah "${b[3]}".`)), sp: 's' };
  });
  E113.push((r) => { // table
    const l = r.pick(AX());
    const O = [0, 1, 2].map(() => [r.nz(-5, 5), r.nz(-5, 5)]);
    need(new Set(O.map(String)).size === 3);
    const I = rpts(O, l);
    const ax = l.kind === 'y' ? T('$x$-axis', 'paksi-$x$') : T('$y$-axis', 'paksi-$y$');
    const rows = O.map((p, i) => [`$${'ABC'[i]}$`, `$${pt(p)}$`, '?']);
    return { q: T(`Complete the table of images under a reflection in the ${ax.en}.<br>${SPM.table(rows, { head: ['Point', 'Object', 'Image'] })}`, `Lengkapkan jadual imej di bawah pantulan pada ${ax.ms}.<br>${SPM.table(rows, { head: ['Titik', 'Objek', 'Imej'] })}`), a: T(I.map((p, i) => `$${'ABC'[i]}'${pt(p)}$`).join(', ')), w: W(reflRule(l), ...mapAll(O, I, ['A', 'B', 'C'])), sp: 'm' };
  });
  E113.push((r) => { // letters/objects unchanged in a vertical mirror
    const sym = [['A'], ['H'], ['M'], ['O'], ['T'], ['U'], ['W'], ['X'], ['I'], ['V'], ['Y']], asym = ['F', 'G', 'J', 'L', 'P', 'R', 'S', 'Z', 'N', 'K', 'Q'];
    const c = r.pick(sym)[0], WR = r.sample(asym, 3);
    const m = mcq(r, T(c, c), WR.map((x) => T(x, x)));
    return { q: T(`A vertical mirror line is placed to the right of each capital letter. Which letter looks exactly the same as its image?${m.opts.en}`, `Satu garis cermin menegak diletakkan di sebelah kanan setiap huruf besar. Huruf yang manakah kelihatan sama seperti imejnya?${m.opts.ms}`), a: m.ans, w: W(T('A letter is unchanged by a vertical mirror exactly when it has a vertical line of symmetry.', 'Huruf tidak berubah oleh cermin menegak apabila ia mempunyai paksi simetri menegak.'), T(`The letter ${c} has one; the other three letters do not. Answer ${m.letter}.`, `Huruf ${c} mempunyainya; tiga huruf yang lain tidak. Jawapan ${m.letter}.`)), sp: 's' };
  });
  E113.push((r) => { // MCQ image in an axis
    const P = [r.nz(-5, 5), r.nz(-5, 5)], l = r.pick(AX()), Q = reflect(P, l);
    const cands = [[-P[0], -P[1]], [P[1], P[0]], reflect(P, l.kind === 'x' ? AX()[1] : AX()[0])];
    const wr = cands.filter((c, i) => !same(c, Q) && cands.findIndex((x) => same(x, c)) === i);
    need(wr.length === 3);
    const ax = l.kind === 'y' ? T('$x$-axis', 'paksi-$x$') : T('$y$-axis', 'paksi-$y$');
    const m = mcq(r, T(`$${pt(Q)}$`), wr.map((w) => T(`$${pt(w)}$`)));
    return { q: T(`What is the image of $${pt(P)}$ under a reflection in the ${ax.en}?${m.opts.en}`, `Apakah imej bagi $${pt(P)}$ di bawah pantulan pada ${ax.ms}?${m.opts.ms}`), a: m.ans, w: W(reflRule(l), mapLine(P, Q), T(`So the answer is ${m.letter}.`, `Jadi jawapannya ialah ${m.letter}.`)), sp: 's' };
  });
  E113.push((r) => { // which labelled point is the image (figure)
    const l = mirror(r.pick(['x', 'y']), r.pick([-1, 0, 1, 2]));
    const P = [r.int(-4, 4), r.int(-4, 4)];
    need(ldist(P, l) >= 1);
    const Q = reflect(P, l);
    const alt = [l.kind === 'x' ? [Q[0] + (Q[0] > P[0] ? 2 : -2), P[1]] : [P[0], Q[1] + (Q[1] > P[1] ? 2 : -2)], [-P[0], -P[1]], [P[1], P[0]], l.kind === 'x' ? [P[0], -P[1]] : [-P[0], P[1]]];
    const wr = [];
    for (const c of alt) if (!same(c, Q) && !same(c, P) && inb([c], 7) && !wr.some((w) => same(w, c))) wr.push(c);
    need(wr.length >= 3 && inb([Q], 7));
    const pts4 = r.shuffle([{ p: Q, ok: true }, { p: wr[0] }, { p: wr[1] }, { p: wr[2] }]);
    const items = [{ t: 'line', l, label: l.eq.replace(' = ', '=') }, { t: 'dot', p: P, l: 'P' }];
    pts4.forEach((o, i) => items.push({ t: 'dot', p: o.p, l: 'ABCD'[i] }));
    const win = [-8, 8, -8, 8];
    const ok = 'ABCD'[pts4.findIndex((o) => o.ok)];
    const forms = [
      ["The diagram shows the point $P$ and the mirror line ${e}$. Which of the points $A$, $B$, $C$ or $D$ is the image of $P$?", "Rajah menunjukkan titik $P$ dan garis cermin ${e}$. Antara titik $A$, $B$, $C$ atau $D$, yang manakah imej bagi $P$?"],
      ["Under a reflection in the line ${e}$, $P$ is mapped onto one of the marked points. Identify it.", "Di bawah pantulan pada garis ${e}$, $P$ dipetakan ke salah satu titik yang ditandakan. Kenal pasti titik itu."],
    ];
    return { q: fill(r.pick(forms), { e: l.eq }), fig: render({ items, win }), a: T(`Point $${ok}$: it is on the opposite side of the mirror line at the same distance as $P$ and on the same perpendicular line through $P$.`, `Titik $${ok}$: ia berada di sebelah bertentangan garis cermin pada jarak yang sama seperti $P$ dan pada garis serenjang yang sama melalui $P$.`), w: W(T(`$P${pt(P)}$ is ${n(ldist(P, l))} unit(s) from $${l.eq}$.`, `$P${pt(P)}$ berjarak ${n(ldist(P, l))} unit dari $${l.eq}$.`), T(`The image is the same distance on the other side, on the perpendicular through $P$: $${pt(Q)}$.`, `Imej berada pada jarak yang sama di sebelah yang lain, pada garis serenjang melalui $P$: $${pt(Q)}$.`), T(`That is point $${ok}$.`, `Itulah titik $${ok}$.`)), sp: 's' };
  });

  /* ---- medium ---- */
  M113.push((r) => { // shape in x=k / y=k
    const k = r.pick([3, 4, 5, 3, 4]), l = mirror(r.pick(['x', 'y']), r.pick([-3, -2, -1, 1, 2, 3]));
    const O = shapeFor(r, l, k, 4), I = rpts(O, l), names = nm(r, k);
    const forms = [
      ["{Nn} ${o}$ has vertices {vl}. Find the coordinates of its image under a reflection in the line ${e}$.", "{Nn} ${o}$ mempunyai bucu {vl}. Cari koordinat imejnya di bawah pantulan pada garis ${e}$."],
      ["The {nn} ${o}$ is reflected in ${e}$. Given {vl}, list the vertices of ${i}$.", "{Nn} ${o}$ dipantulkan pada ${e}$. Diberi {vl}, senaraikan bucu ${i}$."],
      ["Draw the mirror line ${e}$ and the image of {nn} ${o}$ under a reflection in it. State the coordinates of the image vertices.", "Lukis garis cermin ${e}$ dan imej {nn} ${o}$ di bawah pantulan padanya. Nyatakan koordinat bucu imej."],
    ];
    return { q: fill(r.pick(forms), { nn: noun(k), Nn: cap(noun(k)), o: names.join(''), i: names.map((c) => c + "'").join(''), vl: M(vlist(names, O)), e: l.eq }), fig: fig({ O, names }), a: ansPts(names, I, "'"), w: W(reflRule(l), ...mapAll(O, I, names)), sp: 'm' };
  });
  M113.push((r) => { // mirror line from a point and its image
    const l = rmirror(r, r.chance(0.35) ? 'axis' : 'par');
    const P = [r.int(-5, 5), r.int(-5, 5)], Q = reflect(P, l);
    need(!same(P, Q) && inb([Q], 8));
    const forms = [
      ["$P{P}$ is mapped onto $P'{Q}$ by a reflection. Find the equation of the mirror line.", "$P{P}$ dipetakan ke $P'{Q}$ oleh satu pantulan. Cari persamaan garis cermin."],
      ["Find the equation of the line of reflection that maps ${P}$ onto ${Q}$.", "Cari persamaan garis pantulan yang memetakan ${P}$ ke ${Q}$."],
      ["The image of ${P}$ in a mirror line is ${Q}$. Write the equation of the mirror line.", "Imej bagi ${P}$ dalam satu garis cermin ialah ${Q}$. Tulis persamaan garis cermin itu."],
    ];
    const mid = l.kind === 'x' ? `x = ${n((P[0] + Q[0]) / 2)}` : `y = ${n((P[1] + Q[1]) / 2)}`;
    return { q: fill(r.pick(forms), { P: pt(P), Q: pt(Q) }), a: T(`$${l.name ? (l.kind === 'x' ? 'x = 0' : 'y = 0') : l.eq}$`), w: W(T('The mirror line is the perpendicular bisector of $PP\'$.', 'Garis cermin ialah pembahagi dua sama serenjang bagi $PP\'$.'), T(`Midpoint of $PP'$: $${pt([(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2])}$`, `Titik tengah $PP'$: $${pt([(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2])}$`), T(`Only the $${l.kind === 'x' ? 'x' : 'y'}$-coordinate changed, so the mirror line is ${l.kind === 'x' ? 'vertical' : 'horizontal'}: $${mid}$.`, `Hanya koordinat-$${l.kind === 'x' ? 'x' : 'y'}$ berubah, jadi garis cermin itu ${l.kind === 'x' ? 'menegak' : 'mengufuk'}: $${mid}$.`)), sp: 's' };
  });
  M113.push((r) => { // mirror line from a figure
    const k = r.pick([3, 4]), l = mirror(r.pick(['x', 'y']), r.pick([-2, -1, 0, 1, 2]));
    const O = shapeFor(r, l, k, 4), I = rpts(O, l), names = nm(r, k);
    const forms = [
      ["The diagram shows {nn} ${o}$ and its image ${i}$ under a reflection. Write the equation of the mirror line.", "Rajah menunjukkan {nn} ${o}$ dan imejnya ${i}$ di bawah satu pantulan. Tulis persamaan garis cermin."],
      ["Shape ${o}$ is reflected to give ${i}$. Find the equation of the line of reflection.", "Bentuk ${o}$ dipantulkan untuk memberi ${i}$. Cari persamaan garis pantulan."],
    ];
    return { q: fill(r.pick(forms), { nn: noun(k), o: names.join(''), i: names.map((c) => c + "'").join('') }), fig: fig({ O, I, names }), a: T(`$${l.eq}$`), w: W(T('The mirror line is the perpendicular bisector of every object–image pair.', 'Garis cermin ialah pembahagi dua sama serenjang bagi setiap pasangan objek–imej.'), T(`Midpoint of $${names[0]}${pt(O[0])}$ and $${names[0]}'${pt(I[0])}$: $${pt([(O[0][0] + I[0][0]) / 2, (O[0][1] + I[0][1]) / 2])}$`, `Titik tengah $${names[0]}${pt(O[0])}$ dan $${names[0]}'${pt(I[0])}$: $${pt([(O[0][0] + I[0][0]) / 2, (O[0][1] + I[0][1]) / 2])}$`), T(`Every such midpoint lies on $${l.eq}$.`, `Setiap titik tengah itu terletak pada $${l.eq}$.`)), sp: 's' };
  });
  M113.push((r) => { // diagonal reflection y=x / y=-x
    const l = mirror(r.pick(['d1', 'd2']), 0);
    const k = r.pick([3, 4, 5]);
    const O = retry(() => { const S = shape(r, KIND_OF[k], 4); need(S.every((p) => ldist(p, l) >= 1) && oneSide(S, l)); return S; });
    const I = rpts(O, l), names = nm(r, O.length);
    const forms = [
      ["Reflect {nn} ${o}$ with vertices {vl} in the line ${e}$. Write down the vertices of the image.", "Pantulkan {nn} ${o}$ dengan bucu {vl} pada garis ${e}$. Tulis bucu imej."],
      ["The diagram shows {nn} ${o}$ and the mirror line ${e}$. Find the coordinates of the image of each vertex.", "Rajah menunjukkan {nn} ${o}$ dan garis cermin ${e}$. Cari koordinat imej bagi setiap bucu."],
    ];
    return { q: fill(r.pick(forms), { nn: noun(O.length), o: names.join(''), vl: M(vlist(names, O)), e: l.eq }), fig: fig({ O, names, mirror: l, mirrorLabel: l.eq.replace(' = ', '=') }), a: ansPts(names, I, "'"), w: W(reflRule(l), ...mapAll(O, I, names)), sp: 'm' };
  });
  M113.push((r) => { // unknown values
    const l = mirror(r.pick(['x', 'y']), r.int(-3, 3));
    const P = [r.int(-4, 4), r.int(-4, 4)], Q = reflect(P, l);
    need(!same(P, Q) && inb([Q], 8));
    const forms = l.kind === 'x'
      ? [[`The point $P(a,\\ ${P[1]})$ is reflected in the line $x = ${l.k}$ onto $P'(${Q[0]},\\ b)$. Find $a$ and $b$.`, `Titik $P(a,\\ ${P[1]})$ dipantulkan pada garis $x = ${l.k}$ ke $P'(${Q[0]},\\ b)$. Cari $a$ dan $b$.`, `$a = ${P[0]},\\ b = ${P[1]}$`],
         [`$A(${P[0]},\\ ${P[1]})$ is reflected in the line $x = k$ onto $A'(${Q[0]},\\ ${Q[1]})$. Find the value of $k$.`, `$A(${P[0]},\\ ${P[1]})$ dipantulkan pada garis $x = k$ ke $A'(${Q[0]},\\ ${Q[1]})$. Cari nilai $k$.`, `$k = ${l.k}$`]]
      : [[`The point $P(${P[0]},\\ a)$ is reflected in the line $y = ${l.k}$ onto $P'(b,\\ ${Q[1]})$. Find $a$ and $b$.`, `Titik $P(${P[0]},\\ a)$ dipantulkan pada garis $y = ${l.k}$ ke $P'(b,\\ ${Q[1]})$. Cari $a$ dan $b$.`, `$a = ${P[1]},\\ b = ${P[0]}$`],
         [`$A(${P[0]},\\ ${P[1]})$ is reflected in the line $y = k$ onto $A'(${Q[0]},\\ ${Q[1]})$. Find the value of $k$.`, `$A(${P[0]},\\ ${P[1]})$ dipantulkan pada garis $y = k$ ke $A'(${Q[0]},\\ ${Q[1]})$. Cari nilai $k$.`, `$k = ${l.k}$`]];
    const f = r.pick(forms);
    const kx = l.kind === 'x';
    const wA = W(reflRule(l), T(`The $${kx ? 'y' : 'x'}$-coordinate is unchanged.`, `Koordinat-$${kx ? 'y' : 'x'}$ tidak berubah.`), kx ? `$a = 2(${n(l.k)}) - ${P2(Q[0])} = ${n(P[0])},\\ b = ${n(P[1])}$` : `$a = 2(${n(l.k)}) - ${P2(Q[1])} = ${n(P[1])},\\ b = ${n(P[0])}$`);
    const wB = W(T('The mirror line passes through the midpoint of the object and its image.', 'Garis cermin melalui titik tengah objek dan imejnya.'), kx ? `$k = \\dfrac{${P2(P[0])} + ${P2(Q[0])}}{2} = ${n(l.k)}$` : `$k = \\dfrac{${P2(P[1])} + ${P2(Q[1])}}{2} = ${n(l.k)}$`);
    return { q: T(f[0], f[1]), a: T(f[2]), w: f === forms[0] ? wA : wB, sp: 's' };
  });
  M113.push((r) => { // invariant points among a list
    const l = rmirror(r, r.pick(['par', 'diag', 'diagk']));
    const on = [0, 1].map(() => { const t = r.int(-4, 4); return l.kind === 'x' ? [l.k, t] : l.kind === 'y' ? [t, l.k] : l.kind === 'd1' ? [t, t + l.k] : [t, -t + l.k]; });
    const off = [0, 1].map(() => [r.int(-4, 4), r.int(-4, 4)]);
    const all = r.shuffle(on.concat(off).map((p, i) => ({ p, on: i < 2 })));
    need(new Set(all.map((o) => o.p.join())).size === 4 && all.every((o) => o.on === (ldist(o.p, l) === 0)) && inb(all.map((o) => o.p), 7));
    const names = ['A', 'B', 'C', 'D'];
    const listed = all.map((o, i) => `${names[i]}${pt(o.p)}`).join(',\\ ');
    const inv = all.map((o, i) => (o.on ? names[i] : '')).filter(Boolean);
    return { q: T(`The mirror line is $${l.eq}$. Which of the points $${listed}$ are invariant under the reflection?`, `Garis cermin ialah $${l.eq}$. Antara titik $${listed}$, yang manakah tak berubah di bawah pantulan itu?`), a: T(`${inv.join(' and ')}: they lie on the mirror line.`, `${inv.join(' dan ')}: ia terletak pada garis cermin.`), w: W(T('A point is invariant under a reflection exactly when it lies on the mirror line (its distance from the line is $0$).', 'Suatu titik tak berubah di bawah pantulan apabila ia terletak pada garis cermin (jaraknya dari garis itu ialah $0$).'), T(`Test each point in $${l.eq}$: only ${inv.join(' and ')} satisfy it.`, `Uji setiap titik dalam $${l.eq}$: hanya ${inv.join(' dan ')} memenuhinya.`)), sp: 's' };
  });
  M113.push((r) => { // AA' distance
    const l = mirror(r.pick(['x', 'y']), r.int(-3, 3));
    const P = [r.int(-5, 5), r.int(-5, 5)];
    need(ldist(P, l) >= 1 && inb([reflect(P, l)], 8));
    const Q = reflect(P, l), d = ldist(P, l);
    const forms = [
      ["Point $A{P}$ is reflected in the line ${e}$ to give $A'$. Find the coordinates of $A'$ and the length of $AA'$.", "Titik $A{P}$ dipantulkan pada garis ${e}$ untuk memberi $A'$. Cari koordinat $A'$ dan panjang $AA'$."],
      ["A point at ${P}$ is reflected in ${e}$. Calculate the distance between the point and its image, and state the image.", "Satu titik di ${P}$ dipantulkan pada ${e}$. Hitung jarak antara titik dan imejnya, dan nyatakan imej itu."],
    ];
    return { q: fill(r.pick(forms), { P: pt(P), e: l.eq }), a: T(`$${pt(Q)}$; distance $= ${n(2 * d)}$ units`, `$${pt(Q)}$; jarak $= ${n(2 * d)}$ unit`), w: W(reflRule(l), mapLine(P, Q, 'A', "A'"), T(`$A$ is ${n(d)} unit(s) from the line, so $AA' = 2 \\times ${n(d)} = ${n(2 * d)}$ units.`, `$A$ berjarak ${n(d)} unit dari garis itu, jadi $AA' = 2 \\times ${n(d)} = ${n(2 * d)}$ unit.`)), sp: 's' };
  });
  M113.push((r) => { // MCQ mirror line
    const l = mirror(r.pick(['x', 'y']), r.pick([-2, -1, 1, 2, 3]));
    const P = [r.int(-4, 4), r.int(-4, 4)], Q = reflect(P, l);
    need(!same(P, Q) && inb([Q], 8));
    const wr = l.kind === 'x' ? [`y = ${l.k}`, `x = ${-l.k}`, `y = ${P[1]}`] : [`x = ${l.k}`, `y = ${-l.k}`, `x = ${P[0]}`];
    need(new Set([l.eq].concat(wr)).size === 4);
    const m = mcq(r, T(`$${l.eq}$`), wr.map((w) => T(`$${w}$`)));
    return { q: T(`Under a reflection, $P${pt(P)}$ is mapped onto $P'${pt(Q)}$. Which is the equation of the mirror line?${m.opts.en}`, `Di bawah satu pantulan, $P${pt(P)}$ dipetakan ke $P'${pt(Q)}$. Yang manakah persamaan garis cermin?${m.opts.ms}`), a: m.ans, w: W(T(`Midpoint of $PP'$: $${pt([(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2])}$`, `Titik tengah $PP'$: $${pt([(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2])}$`), T(`Only the $${l.kind === 'x' ? 'x' : 'y'}$-coordinate changed, so the mirror line is $${l.eq}$ — answer ${m.letter}.`, `Hanya koordinat-$${l.kind === 'x' ? 'x' : 'y'}$ berubah, jadi garis cermin ialah $${l.eq}$ — jawapan ${m.letter}.`)), sp: 's' };
  });
  M113.push((r) => { // spot the error
    const l = mirror(r.pick(['x', 'y']), r.pick([-2, -1, 1, 2]));
    const P = [r.int(-4, 4), r.int(-4, 4)];
    need(ldist(P, l) >= 1 && inb([reflect(P, l)], 8));
    const Q = reflect(P, l);
    const other = l.kind === 'x' ? [P[0], 2 * l.k - P[1]] : [2 * l.k - P[0], P[1]];
    const w1 = l.kind === 'x' ? [-P[0], P[1]] : [P[0], -P[1]];
    const w2 = l.kind === 'x' ? [l.k, P[1]] : [P[0], l.k];
    const errs = [
      { w: w1, en: 'reflected in the axis instead of the given line', ms: 'memantulkan pada paksi dan bukan pada garis yang diberi' },
      { w: other, en: 'changed the wrong coordinate (the mirror line is parallel to the other axis)', ms: 'menukar koordinat yang salah (garis cermin selari dengan paksi yang satu lagi)' },
      { w: w2, en: 'moved the point only as far as the mirror line instead of twice that distance', ms: 'menggerakkan titik hanya setakat garis cermin dan bukan dua kali jarak itu' },
    ];
    const e = r.pick(errs);
    need(!same(e.w, Q) && inb([e.w], 9));
    return { q: T(`A student writes that the image of $P${pt(P)}$ under a reflection in the line $${l.eq}$ is $${pt(e.w)}$. Is this correct? If not, describe the mistake and give the correct image.`, `Seorang murid menulis bahawa imej $P${pt(P)}$ di bawah pantulan pada garis $${l.eq}$ ialah $${pt(e.w)}$. Adakah ini betul? Jika tidak, huraikan kesilapan dan berikan imej yang betul.`), a: T(`Not correct. The student ${e.en}. The correct image is $${pt(Q)}$.`, `Tidak betul. Murid itu ${e.ms}. Imej yang betul ialah $${pt(Q)}$.`), w: W(reflRule(l), mapLine(P, Q, 'P', "P'"), T(`The student ${e.en}, which gives $${pt(e.w)}$.`, `Murid itu ${e.ms}, yang memberikan $${pt(e.w)}$.`)), sp: 'm' };
  });
  M113.push((r) => { // reconstruct object
    const k = r.pick([3, 4]), l = rmirror(r, r.pick(['par', 'axis']));
    const I = retry(() => { const S = shape(r, KIND_OF[k], 4); need(S.every((p) => ldist(p, l) >= 1) && oneSide(S, l)); return S; });
    const O = rpts(I, l), names = nm(r, k);
    need(inb(O, 8));
    const lt = l.name ? (l.kind === 'y' ? T('the $x$-axis', 'paksi-$x$') : T('the $y$-axis', 'paksi-$y$')) : T(`the line $${l.eq}$`, `garis $${l.eq}$`);
    const forms = [
      ["{Nn} ${i}$ with vertices {il} is the image of ${o}$ under a reflection in {lt}. Find the coordinates of the vertices of ${o}$.", "{Nn} ${i}$ dengan bucu {il} ialah imej bagi ${o}$ di bawah pantulan pada {lt}. Cari koordinat bucu ${o}$."],
      ["A reflection in {lt} maps {nn} ${o}$ onto {nn} ${i}$ with vertices {il}. Find the original vertices.", "Pantulan pada {lt} memetakan {nn} ${o}$ ke {nn} ${i}$ dengan bucu {il}. Cari bucu asal."],
    ];
    return { q: fill(r.pick(forms), { nn: noun(k), Nn: cap(noun(k)), i: names.map((c) => c + "'").join(''), o: names.join(''), il: M(plist(names, I, "'")), lt }), a: ansPts(names, O), w: W(T('A reflection is its own inverse, so reflect each image vertex in the same line.', 'Pantulan ialah songsangan bagi dirinya sendiri, jadi pantulkan setiap bucu imej pada garis yang sama.'), reflRule(l), ...I.map((p, i) => mapLine(p, O[i], names[i] + "'", names[i]))), sp: 'm' };
  });
  M113.push((r) => { // reflect twice
    const l = rmirror(r, 'par');
    const P = [r.int(-4, 4), r.int(-4, 4)];
    need(ldist(P, l) >= 1 && inb([reflect(P, l)], 8));
    const Q = reflect(P, l);
    return { q: T(`$P${pt(P)}$ is reflected in the line $${l.eq}$ to give $P'$. Then $P'$ is reflected in the same line to give $P''$. Find $P'$ and $P''$. What do you notice?`, `$P${pt(P)}$ dipantulkan pada garis $${l.eq}$ untuk memberi $P'$. Kemudian $P'$ dipantulkan pada garis yang sama untuk memberi $P''$. Cari $P'$ dan $P''$. Apakah yang anda perhatikan?`), a: T(`$P'${pt(Q)}$ and $P''${pt(P)}$: $P''$ coincides with $P$, since a reflection is its own inverse.`, `$P'${pt(Q)}$ dan $P''${pt(P)}$: $P''$ bertindih dengan $P$, kerana pantulan ialah songsangan bagi dirinya sendiri.`), w: W(reflRule(l), mapLine(P, Q, 'P', "P'"), mapLine(Q, P, "P'", "P''"), T('Reflecting twice in the same line brings every point back to its starting position.', 'Memantulkan dua kali pada garis yang sama mengembalikan setiap titik ke kedudukan asalnya.')), sp: 's' };
  });
  M113.push((r) => { // vertices on the mirror line
    const l = mirror(r.pick(['x', 'y']), r.pick([-1, 0, 1, 2]));
    const k = r.pick([3, 4]);
    const O = retry(() => { const S = shape(r, KIND_OF[k], 4); const on = S.filter((p) => ldist(p, l) === 0).length; need(on >= 1 && on < S.length); return S; });
    const I = rpts(O, l), names = nm(r, k);
    need(inb(I, 8));
    const inv = names.filter((_, i) => ldist(O[i], l) === 0);
    return { q: T(`The diagram shows ${noun(k).en} $${names.join('')}$ and the mirror line $${l.eq}$. Write the coordinates of the image and state which vertices are invariant.`, `Rajah menunjukkan ${noun(k).ms} $${names.join('')}$ dan garis cermin $${l.eq}$. Tulis koordinat imej dan nyatakan bucu yang tak berubah.`), fig: fig({ O, names, mirror: l, mirrorLabel: l.eq.replace(' = ', '=') }), a: T(`$${plist(names, I, "'")}$; invariant: ${inv.join(', ')}`, `$${plist(names, I, "'")}$; tak berubah: ${inv.join(', ')}`), w: W(reflRule(l), ...mapAll(O, I, names), T(`${inv.join(', ')} lie on the mirror line, so they are invariant (they map onto themselves).`, `${inv.join(', ')} terletak pada garis cermin, jadi ia tak berubah (dipetakan kepada dirinya sendiri).`)), sp: 'm' };
  });
  M113.push((r) => { // real life distances
    const bank = [
      ['A tree top is 6 m above the surface of a still lake. Its image in the water is a reflection in the water surface. How far below the surface does the image of the tree top appear?', 'Puncak sebatang pokok berada 6 m di atas permukaan tasik yang tenang. Imejnya dalam air ialah pantulan pada permukaan air. Berapa jauh di bawah permukaan imej puncak pokok itu kelihatan?', '6 m', '6 m'],
      ['A girl stands 2 m in front of a plane mirror. How far is she from her image?', 'Seorang gadis berdiri 2 m di hadapan sebuah cermin satah. Berapa jauhkah dia daripada imejnya?', '4 m', '4 m'],
      ['A lamp is 1.5 m from a wall mirror. How far behind the mirror does its image appear?', 'Sebuah lampu berada 1.5 m dari cermin dinding. Berapa jauh di belakang cermin imej lampu itu kelihatan?', '1.5 m', '1.5 m'],
      ['A bird is 4 m above the water. What is the distance between the bird and its reflection in the water?', 'Seekor burung berada 4 m di atas air. Berapakah jarak antara burung itu dengan pantulannya di dalam air?', '8 m', '8 m'],
      ['A student moves 1 m closer to a plane mirror. By how much does the distance between the student and the image change?', 'Seorang murid bergerak 1 m lebih dekat kepada cermin satah. Berapakah perubahan jarak antara murid dan imejnya?', 'It decreases by 2 m', 'Ia berkurang sebanyak 2 m'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('The mirror surface is the perpendicular bisector: the image is as far behind the mirror as the object is in front.', 'Permukaan cermin ialah pembahagi dua sama serenjang: imej berada di belakang cermin sejauh objek berada di hadapannya.'), T(`So the answer is ${b[2]}.`, `Jadi jawapannya ialah ${b[3]}.`)), sp: 's' };
  });
  M113.push((r) => { // midpoint reasoning
    const l = mirror(r.pick(['x', 'y']), r.int(-3, 3));
    const P = [r.int(-5, 5), r.int(-5, 5)];
    need(ldist(P, l) >= 1 && inb([reflect(P, l)], 8));
    const Q = reflect(P, l), mid = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
    return { q: T(`A reflection maps $A${pt(P)}$ onto $A'${pt(Q)}$. (a) Find the midpoint of $AA'$. (b) Hence write the equation of the mirror line.`, `Satu pantulan memetakan $A${pt(P)}$ ke $A'${pt(Q)}$. (a) Cari titik tengah $AA'$. (b) Seterusnya, tulis persamaan garis cermin.`), a: T(`(a) $${pt(mid)}$ (b) $${l.eq}$`), w: W(`(a) $\\left(\\dfrac{${P2(P[0])} + ${P2(Q[0])}}{2},\\ \\dfrac{${P2(P[1])} + ${P2(Q[1])}}{2}\\right) = ${pt(mid)}$`, T(`(b) The mirror line is the perpendicular bisector of $AA'$, so it passes through this midpoint; only the $${l.kind === 'x' ? 'x' : 'y'}$-coordinate changed, so it is $${l.eq}$.`, `(b) Garis cermin ialah pembahagi dua sama serenjang bagi $AA'$, jadi ia melalui titik tengah ini; hanya koordinat-$${l.kind === 'x' ? 'x' : 'y'}$ berubah, jadi ia ialah $${l.eq}$.`)), sp: 'm' };
  });
  M113.push((r) => { // table with missing cells
    const l = rmirror(r, 'par');
    const O = [0, 1, 2].map(() => [r.int(-4, 4), r.int(-4, 4)]);
    const I = rpts(O, l);
    need(new Set(O.map(String)).size === 3 && inb(I, 8) && O.every((p) => ldist(p, l) >= 1));
    const rows = [[`$A$`, `$${pt(O[0])}$`, `$${pt(I[0])}$`], [`$B$`, `$${pt(O[1])}$`, '?'], [`$C$`, '?', `$${pt(I[2])}$`]];
    return { q: T(`The table shows points and their images under one reflection.<br>${SPM.table(rows, { head: ['Point', 'Object', 'Image'] })}Find the equation of the mirror line and complete the table.`, `Jadual menunjukkan titik dan imejnya di bawah satu pantulan.<br>${SPM.table(rows, { head: ['Titik', 'Objek', 'Imej'] })}Cari persamaan garis cermin dan lengkapkan jadual.`), a: T(`$${l.eq}$; $B'${pt(I[1])}$, $C${pt(O[2])}$`), w: W(T(`Row $A$ is complete: $${pt(O[0])} \\to ${pt(I[0])}$.`, `Baris $A$ lengkap: $${pt(O[0])} \\to ${pt(I[0])}$.`), T(`The mirror line is the perpendicular bisector of that pair, so it is $${l.eq}$.`, `Garis cermin ialah pembahagi dua sama serenjang bagi pasangan itu, jadi ia ialah $${l.eq}$.`), reflRule(l), mapLine(O[1], I[1], 'B', "B'"), mapLine(I[2], O[2], "C'", 'C')), sp: 'm' };
  });


  /* ---- advanced 11.3 ---- */
  A113.push((r) => { // reconstruct object across a diagonal line (figure or list)
    const l = rmirror(r, r.pick(['diag', 'diagk']));
    const k = r.pick([3, 4]);
    const I = retry(() => { const S = shape(r, KIND_OF[k], 4); need(S.every((p) => ldist(p, l) >= 1) && oneSide(S, l)); return S; });
    const O = rpts(I, l), names = nm(r, k);
    need(inb(O, 8));
    const asFig = r.chance(0.5);
    const forms = asFig
      ? [["The diagram shows {nn} ${i}$ and the mirror line ${e}$. ${i}$ is the image of ${o}$ under the reflection. Find the coordinates of the vertices of ${o}$.", "Rajah menunjukkan {nn} ${i}$ dan garis cermin ${e}$. ${i}$ ialah imej bagi ${o}$ di bawah pantulan itu. Cari koordinat bucu ${o}$."]]
      : [["{Nn} ${i}$ with vertices {il} is the image of ${o}$ under a reflection in the line ${e}$. Find the coordinates of ${o}$.", "{Nn} ${i}$ dengan bucu {il} ialah imej bagi ${o}$ di bawah pantulan pada garis ${e}$. Cari koordinat ${o}$."],
         ["A reflection in ${e}$ maps ${o}$ onto ${i}$ where {il}. Determine the vertices of the object ${o}$.", "Pantulan pada ${e}$ memetakan ${o}$ ke ${i}$ dengan {il}. Tentukan bucu objek ${o}$."]];
    const items = [{ t: 'line', l, label: l.eq.replace(' = ', '=') }, { t: 'poly', p: I, names, prime: "'", style: 'img' }];
    const rule = l.kind === 'd1' ? T('Reflection in $y = x + k$: subtract $k$ from the $y$-coordinate, swap, then add $k$ back.', 'Pantulan pada $y = x + k$: tolak $k$ daripada koordinat-$y$, tukar tempat, kemudian tambah $k$.') : T('Use the fact that each object–image segment is perpendicular to the mirror line and bisected by it.', 'Gunakan hakikat bahawa setiap tembereng objek–imej serenjang dengan garis cermin dan dibahagi dua sama olehnya.');
    return { q: fill(r.pick(forms), { nn: noun(k), Nn: cap(noun(k)), i: names.map((c) => c + "'").join(''), o: names.join(''), il: M(plist(names, I, "'")), e: l.eq }), fig: asFig ? render({ items }) : undefined, a: ansPts(names, O), w: W(T('A reflection is its own inverse, so reflect each image vertex in the same line.', 'Pantulan ialah songsangan bagi dirinya sendiri, jadi pantulkan setiap bucu imej pada garis yang sama.'), rule, ...I.map((p, i) => mapLine(p, O[i], names[i] + "'", names[i]))), sp: 'm' };
  });
  A113.push((r) => { // find mirror line from two pairs (axis-parallel or diagonal)
    const l = rmirror(r, r.pick(['par', 'diagk', 'diag']));
    const P = [r.int(-4, 4), r.int(-4, 4)], Q = [r.int(-4, 4), r.int(-4, 4)];
    const P1 = reflect(P, l), Q1 = reflect(Q, l);
    need(!same(P, P1) && !same(Q, Q1) && !same(P, Q) && inb([P1, Q1], 8));
    const mid = [(P[0] + P1[0]) / 2, (P[1] + P1[1]) / 2], mid2 = [(Q[0] + Q1[0]) / 2, (Q[1] + Q1[1]) / 2];
    const forms = [
      ["A reflection maps $P{P}$ onto $P'{P1}$ and $Q{Q}$ onto $Q'{Q1}$. Find the equation of the mirror line and justify your answer using the midpoints.", "Satu pantulan memetakan $P{P}$ ke $P'{P1}$ dan $Q{Q}$ ke $Q'{Q1}$. Cari persamaan garis cermin dan berikan justifikasi menggunakan titik tengah."],
      ["Two points are reflected: ${P}$ goes to ${P1}$ and ${Q}$ goes to ${Q1}$. Determine the mirror line and show that it is the perpendicular bisector of each pair.", "Dua titik dipantulkan: ${P}$ ke ${P1}$ dan ${Q}$ ke ${Q1}$. Tentukan garis cermin dan tunjukkan bahawa ia ialah pembahagi dua sama serenjang bagi setiap pasangan."],
    ];
    return { q: fill(r.pick(forms), { P: pt(P), P1: pt(P1), Q: pt(Q), Q1: pt(Q1) }), a: T(`$${l.eq}$. The midpoints $${pt(mid)}$ and $${pt(mid2)}$ lie on this line, and each object–image segment is perpendicular to it.`, `$${l.eq}$. Titik tengah $${pt(mid)}$ dan $${pt(mid2)}$ terletak pada garis ini, dan setiap tembereng objek–imej serenjang dengannya.`), w: W(T('The mirror line is the perpendicular bisector of each object–image segment, so it passes through both midpoints.', 'Garis cermin ialah pembahagi dua sama serenjang bagi setiap tembereng objek–imej, jadi ia melalui kedua-dua titik tengah.'), T(`Midpoint of $PP'$: $${pt(mid)}$`, `Titik tengah $PP'$: $${pt(mid)}$`), T(`Midpoint of $QQ'$: $${pt(mid2)}$`, `Titik tengah $QQ'$: $${pt(mid2)}$`), T(`Both satisfy $${l.eq}$, and each segment is perpendicular to that line, so the mirror line is $${l.eq}$.`, `Kedua-duanya memenuhi $${l.eq}$, dan setiap tembereng serenjang dengan garis itu, jadi garis cermin ialah $${l.eq}$.`)), sp: 'l' };
  });
  A113.push((r) => { // mirror line not drawn: figure with object/image, diagonal
    const l = rmirror(r, r.pick(['diag', 'diagk', 'par']));
    const k = r.pick([3, 4]);
    const O = retry(() => { const S = shape(r, KIND_OF[k], 4); need(S.every((p) => ldist(p, l) >= 1) && oneSide(S, l)); return S; });
    const I = rpts(O, l), names = nm(r, k);
    need(inb(I, 8));
    return { q: T(`The diagram shows ${noun(k).en} $${names.join('')}$ and its image $${names.map((c) => c + "'").join('')}$ under a reflection. Find the equation of the mirror line and explain how you know.`, `Rajah menunjukkan ${noun(k).ms} $${names.join('')}$ dan imejnya $${names.map((c) => c + "'").join('')}$ di bawah satu pantulan. Cari persamaan garis cermin dan terangkan bagaimana anda tahu.`), fig: fig({ O, I, names }), a: T(`$${l.eq}$: it passes through the midpoints of $${names[0]}${names[0]}'$ and $${names[1]}${names[1]}'$ and is perpendicular to them.`, `$${l.eq}$: ia melalui titik tengah $${names[0]}${names[0]}'$ dan $${names[1]}${names[1]}'$ dan serenjang dengannya.`), w: W(T('The mirror line is the perpendicular bisector of each object–image segment.', 'Garis cermin ialah pembahagi dua sama serenjang bagi setiap tembereng objek–imej.'), T(`Midpoint of $${names[0]}${names[0]}'$: $${pt([(O[0][0] + I[0][0]) / 2, (O[0][1] + I[0][1]) / 2])}$`, `Titik tengah $${names[0]}${names[0]}'$: $${pt([(O[0][0] + I[0][0]) / 2, (O[0][1] + I[0][1]) / 2])}$`), T(`Midpoint of $${names[1]}${names[1]}'$: $${pt([(O[1][0] + I[1][0]) / 2, (O[1][1] + I[1][1]) / 2])}$`, `Titik tengah $${names[1]}${names[1]}'$: $${pt([(O[1][0] + I[1][0]) / 2, (O[1][1] + I[1][1]) / 2])}$`), T(`The line through these midpoints is $${l.eq}$.`, `Garis yang melalui titik tengah ini ialah $${l.eq}$.`)), sp: 'm' };
  });
  A113.push((r) => { // unknown k
    const kk = r.int(-3, 3), l = mirror(r.pick(['x', 'y']), kk);
    const A = [r.int(-5, 5), r.int(-5, 5)], B = [r.int(-5, 5), r.int(-5, 5)];
    need(ldist(A, l) >= 1 && ldist(B, l) >= 1 && inb([reflect(A, l), reflect(B, l)], 9));
    const A1 = reflect(A, l), B1 = reflect(B, l);
    const forms = [
      [`$A${pt(A)}$ is reflected onto $A'${pt(A1)}$ in the line ${l.kind === 'x' ? '$x' : '$y'} = k$. (a) Find $k$. (b) Find the image of $B${pt(B)}$ in the same line.`, `$A${pt(A)}$ dipantulkan ke $A'${pt(A1)}$ pada garis ${l.kind === 'x' ? '$x' : '$y'} = k$. (a) Cari $k$. (b) Cari imej $B${pt(B)}$ pada garis yang sama.`, `(a) $k = ${kk}$ (b) $${pt(B1)}$`],
      [`In a reflection in the line ${l.kind === 'x' ? '$x' : '$y'} = ${kk}$, $P(p,\\ q)$ maps onto $P'${pt(A1)}$. (a) Find $p$ and $q$. (b) Find the distance $PP'$.`, `Dalam pantulan pada garis ${l.kind === 'x' ? '$x' : '$y'} = ${kk}$, $P(p,\\ q)$ dipetakan ke $P'${pt(A1)}$. (a) Cari $p$ dan $q$. (b) Cari jarak $PP'$.`, `(a) $p = ${A[0]},\\ q = ${A[1]}$ (b) $${n(2 * ldist(A, l))}$ units`],
    ];
    const f = r.pick(forms);
    const dA = ldist(A, l);
    const wk = f === forms[0]
      ? W(T('The mirror line passes through the midpoint of $AA\'$.', 'Garis cermin melalui titik tengah $AA\'$.'), l.kind === 'x' ? `$k = \\dfrac{${P2(A[0])} + ${P2(A1[0])}}{2} = ${n(kk)}$` : `$k = \\dfrac{${P2(A[1])} + ${P2(A1[1])}}{2} = ${n(kk)}$`, reflRule(l), mapLine(B, B1, 'B', "B'"))
      : W(T('A reflection is its own inverse, so reflect $P\'$ in the same line to get $P$.', 'Pantulan ialah songsangan bagi dirinya sendiri, jadi pantulkan $P\'$ pada garis yang sama untuk mendapat $P$.'), reflRule(l), mapLine(A1, A, "P'", 'P'), T(`$P$ is ${n(dA)} unit(s) from the line, so $PP' = 2 \\times ${n(dA)} = ${n(2 * dA)}$ units.`, `$P$ berjarak ${n(dA)} unit dari garis itu, jadi $PP' = 2 \\times ${n(dA)} = ${n(2 * dA)}$ unit.`));
    return { q: T(f[0], f[1]), a: T(f[2], f[2].replace('units', 'unit')), w: wk, sp: 'm' };
  });
  A113.push((r) => { // explain bank
    const bank = [
      ['Explain why the mirror line must be the perpendicular bisector of the segment joining a point and its image.', 'Terangkan mengapa garis cermin mestilah pembahagi dua sama serenjang bagi tembereng yang menyambung satu titik dengan imejnya.', 'The point and its image are the same distance from the mirror line and lie on the same perpendicular to it, so the line cuts the segment in half at right angles.', 'Titik dan imejnya berjarak sama dari garis cermin dan terletak pada garis serenjang yang sama dengannya, jadi garis itu membahagi tembereng kepada dua bahagian sama pada sudut tegak.'],
      ['A triangle $ABC$ is labelled anticlockwise. After a reflection, is $A\'B\'C\'$ labelled clockwise or anticlockwise? Explain.', 'Segi tiga $ABC$ dilabel lawan arah jam. Selepas pantulan, adakah $A\'B\'C\'$ dilabel ikut arah jam atau lawan arah jam? Terangkan.', 'Clockwise. A reflection reverses the orientation (it produces a mirror image), so the order of the labels is reversed.', 'Ikut arah jam. Pantulan menyongsangkan orientasi (ia menghasilkan imej cermin), jadi susunan label disongsangkan.'],
      ['Explain why a reflection is an isometry.', 'Terangkan mengapa pantulan ialah isometri.', 'Every point moves to a point the same distance on the other side of the mirror line, so distances between points and the sizes of angles are unchanged.', 'Setiap titik bergerak ke titik yang berjarak sama di sebelah lain garis cermin, jadi jarak antara titik dan saiz sudut tidak berubah.'],
      ['Explain why points on the mirror line are invariant.', 'Terangkan mengapa titik pada garis cermin ialah tak berubah.', 'A point on the line is at distance 0 from it, so its image is also at distance 0, at the same place.', 'Titik pada garis itu berjarak 0 daripadanya, jadi imejnya juga berjarak 0, iaitu di tempat yang sama.'],
      ['A student says "a reflection in the $y$-axis changes the $y$-coordinate". Is she correct? Explain with an example.', 'Seorang murid berkata "pantulan pada paksi-$y$ mengubah koordinat-$y$". Adakah dia betul? Terangkan dengan satu contoh.', 'No. The image of $(3, 5)$ is $(-3, 5)$: the $x$-coordinate changes sign and the $y$-coordinate stays the same.', 'Tidak. Imej bagi $(3, 5)$ ialah $(-3, 5)$: koordinat-$x$ bertukar tanda dan koordinat-$y$ kekal sama.'],
      ['Why does the line joining a point and its image never pass through the mirror line at a slant?', 'Mengapa garis yang menyambung satu titik dengan imejnya tidak pernah menyilang garis cermin secara condong?', 'Because the mirror line is perpendicular to the segment joining a point and its image, the crossing is always at $90^\\circ$.', 'Kerana garis cermin serenjang dengan tembereng yang menyambung satu titik dengan imejnya, silangan itu sentiasa pada $90^\\circ$.'],
      ['Can a reflection map a shape onto itself? Give an example.', 'Bolehkah pantulan memetakan suatu bentuk ke atas dirinya sendiri? Berikan satu contoh.', 'Yes, when the mirror line is a line of symmetry of the shape, for example a diagonal of a square or the axis of an isosceles triangle.', 'Ya, apabila garis cermin ialah paksi simetri bagi bentuk itu, contohnya pepenjuru segi empat sama atau paksi segi tiga sama kaki.'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('Key facts: a reflection is an isometry, the mirror line is the perpendicular bisector of each object–image segment, points on the mirror line are invariant, and the orientation is reversed.', 'Fakta utama: pantulan ialah isometri, garis cermin ialah pembahagi dua sama serenjang bagi setiap tembereng objek–imej, titik pada garis cermin tak berubah, dan orientasi disongsangkan.'), T(b[2], b[3])), sp: 'm' };
  });
  A113.push((r) => { // image in y = x + k / y = -x + k
    const l = mirror(r.pick(['d1', 'd2']), r.pick([-3, -2, -1, 1, 2, 3]));
    const P = [r.int(-4, 4), r.int(-4, 4)];
    need(ldist(P, l) > 0 && inb([reflect(P, l)], 8));
    const Q = reflect(P, l);
    const forms = [
      ["Find the image of $P{P}$ under a reflection in the line ${e}$. Show that the midpoint of $PP'$ lies on the line.", "Cari imej bagi $P{P}$ di bawah pantulan pada garis ${e}$. Tunjukkan bahawa titik tengah $PP'$ terletak pada garis itu."],
      ["$P{P}$ is reflected in ${e}$. Find $P'$, and verify that $PP'$ is perpendicular to the mirror line.", "$P{P}$ dipantulkan pada ${e}$. Cari $P'$, dan sahkan bahawa $PP'$ serenjang dengan garis cermin."],
    ];
    const mid = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
    const dv = subv(Q, P);
    return { q: fill(r.pick(forms), { P: pt(P), e: l.eq }), a: T(`$P'${pt(Q)}$. The midpoint $${pt(mid)}$ satisfies $${l.eq}$; $PP'$ has direction $${tv(dv)}$, which is at right angles to the line.`, `$P'${pt(Q)}$. Titik tengah $${pt(mid)}$ memenuhi $${l.eq}$; $PP'$ mempunyai arah $${tv(dv)}$, yang serenjang dengan garis itu.`), w: W(reflRule(l), mapLine(P, Q, 'P', "P'"), T(`Midpoint of $PP'$: $${pt(mid)}$, and it satisfies $${l.eq}$.`, `Titik tengah $PP'$: $${pt(mid)}$, dan ia memenuhi $${l.eq}$.`), T(`$PP'$ has direction $${tv(dv)}$, which is at right angles to the mirror line.`, `$PP'$ mempunyai arah $${tv(dv)}$, yang bersudut tegak dengan garis cermin.`)), sp: 'm' };
  });
  A113.push((r) => { // statements true/false selection
    const bank = [
      ['The image has the same area as the object.', 'Imej mempunyai luas yang sama dengan objek.', true],
      ['Corresponding angles are equal in size.', 'Sudut sepadan adalah sama saiz.', true],
      ['The object and its image always overlap.', 'Objek dan imejnya sentiasa bertindih.', false],
      ['Every point on the mirror line is invariant.', 'Setiap titik pada garis cermin ialah tak berubah.', true],
      ['The mirror line is always the $x$-axis or the $y$-axis.', 'Garis cermin sentiasa paksi-$x$ atau paksi-$y$.', false],
      ['Corresponding points are equidistant from the mirror line.', 'Titik sepadan berjarak sama dari garis cermin.', true],
      ['Reflection reverses the orientation of the shape.', 'Pantulan menyongsangkan orientasi bentuk itu.', true],
      ['The image is smaller than the object when it is far from the mirror line.', 'Imej lebih kecil daripada objek apabila ia jauh dari garis cermin.', false],
      ['Reflecting twice in the same line returns the shape to its original position.', 'Memantulkan dua kali pada garis yang sama mengembalikan bentuk itu ke kedudukan asal.', true],
    ];
    const S4 = r.sample(bank, 4);
    need(S4.some((s) => s[2]) && S4.some((s) => !s[2]));
    const list = S4.map((s, i) => `<b>${'ABCD'[i]}.</b> ${s[0]}`).join('<br>'), listM = S4.map((s, i) => `<b>${'ABCD'[i]}.</b> ${s[1]}`).join('<br>');
    const ok = S4.map((s, i) => (s[2] ? 'ABCD'[i] : '')).join('');
    return { q: T(`Which of these statements about a reflection are true?<br>${list}`, `Antara pernyataan berikut tentang pantulan, yang manakah benar?<br>${listM}`), a: T(`${ok.split('').join(', ')} ${ok.length === 1 ? 'is' : 'are'} true; the others are false.`, `${ok.split('').join(', ')} benar; yang lain palsu.`), w: W(T('A reflection is an isometry that flips the shape over the mirror line: lengths, angles and areas are unchanged, the orientation is reversed, every point of the mirror line is invariant, and reflecting twice in the same line undoes it.', 'Pantulan ialah isometri yang membalikkan bentuk pada garis cermin: panjang, sudut dan luas tidak berubah, orientasi disongsangkan, setiap titik pada garis cermin tak berubah, dan memantulkan dua kali pada garis yang sama membatalkannya.'), T(`Checking each statement against this: ${ok.split('').join(', ')} agree with it.`, `Menyemak setiap pernyataan dengan ini: ${ok.split('').join(', ')} menepatinya.`)), sp: 'm' };
  });
  A113.push((r) => { // isometry check with lengths
    const l = rmirror(r, r.pick(['diag', 'par', 'axis']));
    const O = scalene(r, 3, 4);
    need(O.every((p) => ldist(p, l) >= 1) && oneSide(O, l));
    const I = rpts(O, l);
    need(inb(I, 9));
    const s2 = (P) => [d2(P[0], P[1]), d2(P[1], P[2]), d2(P[0], P[2])];
    const a = s2(O), b = s2(I);
    return { q: T(`Triangle $ABC$ with $A${pt(O[0])}$, $B${pt(O[1])}$, $C${pt(O[2])}$ is reflected in the line $${l.eq}$. Find $A'$, $B'$, $C'$, then show that $AB = A'B'$ by comparing $AB^2$ and $A'B'^2$.`, `Segi tiga $ABC$ dengan $A${pt(O[0])}$, $B${pt(O[1])}$, $C${pt(O[2])}$ dipantulkan pada garis $${l.eq}$. Cari $A'$, $B'$, $C'$, kemudian tunjukkan bahawa $AB = A'B'$ dengan membandingkan $AB^2$ dan $A'B'^2$.`), a: T(`$${plist(['A', 'B', 'C'], I, "'")}$; $AB^2 = ${a[0]}$ and $A'B'^2 = ${b[0]}$, so $AB = A'B'$.`, `$${plist(['A', 'B', 'C'], I, "'")}$; $AB^2 = ${a[0]}$ dan $A'B'^2 = ${b[0]}$, jadi $AB = A'B'$.`), w: W(reflRule(l), ...mapAll(O, I, ['A', 'B', 'C']), `$AB^2 = ${a[0]}$`, `$A'B'^2 = ${b[0]}$`, T('The two squares are equal, so $AB = A\'B\'$: the reflection keeps the length unchanged.', 'Kedua-dua kuasa dua itu sama, jadi $AB = A\'B\'$: pantulan mengekalkan panjang.')), sp: 'l' };
  });
  A113.push((r) => { // multi-part with axis
    const l = r.pick(AX());
    const k = 3;
    const O = shapeFor(r, l, k, 4), I = rpts(O, l), names = nm(r, k);
    const ax = l.kind === 'y' ? T('$x$-axis', 'paksi-$x$') : T('$y$-axis', 'paksi-$y$');
    const P = O[0];
    return { q: T(`Triangle $${names.join('')}$ has vertices $${vlist(names, O)}$. (a) Write the coordinates of its image under a reflection in the ${ax.en}. (b) State the length of $${names[0]}${names[0]}'$. (c) State the mirror line of the reflection that maps $${names[0]}'$ back onto $${names[0]}$.`, `Segi tiga $${names.join('')}$ mempunyai bucu $${vlist(names, O)}$. (a) Tulis koordinat imejnya di bawah pantulan pada ${ax.ms}. (b) Nyatakan panjang $${names[0]}${names[0]}'$. (c) Nyatakan garis cermin bagi pantulan yang memetakan $${names[0]}'$ kembali ke $${names[0]}$.`), a: T(`(a) $${plist(names, I, "'")}$ (b) ${2 * ldist(P, l)} units (c) the ${l.kind === 'y' ? '$x$-axis' : '$y$-axis'} again`, `(a) $${plist(names, I, "'")}$ (b) ${2 * ldist(P, l)} unit (c) ${l.kind === 'y' ? 'paksi-$x$' : 'paksi-$y$'} sekali lagi`), w: W(T('(a) Apply the rule to every vertex.', '(a) Gunakan hukum pada setiap bucu.'), reflRule(l), ...mapAll(O, I, names), T(`(b) $${names[0]}$ is ${n(ldist(P, l))} unit(s) from the axis, so $${names[0]}${names[0]}' = 2 \\times ${n(ldist(P, l))} = ${n(2 * ldist(P, l))}$ units.`, `(b) $${names[0]}$ berjarak ${n(ldist(P, l))} unit dari paksi itu, jadi $${names[0]}${names[0]}' = 2 \\times ${n(ldist(P, l))} = ${n(2 * ldist(P, l))}$ unit.`), T('(c) A reflection is its own inverse, so the same mirror line maps the image back onto the object.', '(c) Pantulan ialah songsangan bagi dirinya sendiri, jadi garis cermin yang sama memetakan imej kembali ke objek.')), sp: 'l' };
  });
  A113.push((r) => { // invariant point conditions
    const kk = r.int(-3, 3), l = mirror(r.pick(['d1', 'd2']), kk);
    const t = r.int(-3, 3);
    const yexp = l.kind === 'd1' ? SPM.poly([[1, 'm'], [kk, '']]) : SPM.poly([[-1, 'm'], [kk, '']]);
    const forms = r.chance()
      ? [[`The point $P(m,\\ ${yexp})$ is reflected in the line $${l.eq}$. Show that $P$ is invariant for every value of $m$.`, `Titik $P(m,\\ ${yexp})$ dipantulkan pada garis $${l.eq}$. Tunjukkan bahawa $P$ tak berubah bagi setiap nilai $m$.`, `The coordinates of $P$ satisfy $${l.eq}$ (substitute $x = m$ and get $y = ${yexp}$), so $P$ lies on the mirror line and its image is $P$ itself.`, `Koordinat $P$ memenuhi $${l.eq}$ (gantikan $x = m$ dan dapat $y = ${yexp}$), jadi $P$ terletak pada garis cermin dan imejnya ialah $P$ sendiri.`]]
      : [[`The point $P(${t},\\ k)$ is invariant under a reflection in the line $${l.eq}$. Find the value of $k$.`, `Titik $P(${t},\\ k)$ tak berubah di bawah pantulan pada garis $${l.eq}$. Cari nilai $k$.`, `$k = ${l.kind === 'd1' ? t + kk : -t + kk}$`, `$k = ${l.kind === 'd1' ? t + kk : -t + kk}$`]];
    const f = forms[0];
    const isShow = f[2].indexOf('$k =') !== 0;
    return { q: T(f[0], f[1]), a: T(f[2], f[3]), w: isShow
      ? W(T(`Substitute $x = m$ into $${l.eq}$: $y = ${yexp}$.`, `Gantikan $x = m$ ke dalam $${l.eq}$: $y = ${yexp}$.`), T(`So $P(m,\\ ${yexp})$ lies on the mirror line for every value of $m$.`, `Jadi $P(m,\\ ${yexp})$ terletak pada garis cermin bagi setiap nilai $m$.`), T('Every point on the mirror line is invariant, so the image of $P$ is $P$ itself.', 'Setiap titik pada garis cermin ialah tak berubah, jadi imej $P$ ialah $P$ sendiri.'))
      : W(T('A point is invariant only when it lies on the mirror line.', 'Suatu titik tak berubah hanya apabila ia terletak pada garis cermin.'), T(`Substitute $x = ${n(t)}$ into $${l.eq}$:`, `Gantikan $x = ${n(t)}$ ke dalam $${l.eq}$:`), `$k = ${l.kind === 'd1' ? n(t + kk) : n(-t + kk)}$`), sp: 's' };
  });
  A113.push((r) => { // 3 candidate points mirror-check
    const l = rmirror(r, 'diagk');
    const P = [r.int(-4, 4), r.int(-4, 4)];
    need(ldist(P, l) > 0);
    const Q = reflect(P, l);
    need(inb([Q], 8));
    const cands = [Q, [P[1], P[0]], [-P[1], -P[0]], [Q[0] + 1, Q[1]]].filter((c, i, arr) => arr.findIndex((x) => same(x, c)) === i);
    need(cands.length === 4);
    const sh = r.shuffle(cands.map((c, i) => ({ c, ok: i === 0 })));
    const list = sh.map((o, i) => `${'ABCD'[i]}${pt(o.c)}`).join(',\\ ');
    const ok = 'ABCD'[sh.findIndex((o) => o.ok)];
    return { q: T(`The point $P${pt(P)}$ is reflected in the line $${l.eq}$. Which of the points $${list}$ is its image? Justify by checking the midpoint.`, `Titik $P${pt(P)}$ dipantulkan pada garis $${l.eq}$. Antara titik $${list}$, yang manakah imejnya? Berikan justifikasi dengan menyemak titik tengah.`), a: T(`${ok}$${pt(Q)}$: the midpoint of $P$ and this point lies on $${l.eq}$ and the segment is perpendicular to it.`.replace(/^(\w)\$/, '$1 $'), `${ok}$${pt(Q)}$: titik tengah $P$ dan titik ini terletak pada $${l.eq}$ dan tembereng itu serenjang dengannya.`.replace(/^(\w)\$/, '$1 $')), w: W(reflRule(l), mapLine(P, Q, 'P', "P'"), T(`Midpoint of $P$ and $${pt(Q)}$ is $${pt([(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2])}$, which satisfies $${l.eq}$.`, `Titik tengah $P$ dan $${pt(Q)}$ ialah $${pt([(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2])}$, yang memenuhi $${l.eq}$.`), T(`So the image is point ${ok}.`, `Jadi imejnya ialah titik ${ok}.`)), sp: 'm' };
  });

  /* ============================================================== 11.4 Rotation */
  const E114 = [], M114 = [], A114 = [];
  const rotP = (P, C, a, d) => P.map((p) => rotate(p, C, a, d));
  const isO = (C) => C[0] === 0 && C[1] === 0;
  const centreT = (C) => (isO(C) ? T('the origin $O$', 'asalan $O$') : T(`the point $${pt(C)}$`, `titik $${pt(C)}$`));
  const centreV = (C, nameC) => (isO(C) ? T('the origin', 'asalan') : T(`$${nameC || 'C'}${pt(C)}$`, `$${nameC || 'C'}${pt(C)}$`));
  /** "90° clockwise" etc. For 180 the direction is irrelevant */
  const turnT = (a, d, opt) => (a === 180 ? T('$180^\\circ$ (a half-turn)', '$180^\\circ$ (separuh pusingan)') : turnL(a, d));
  const rotFull = (a, d, C) => (a === 180
    ? T(`A rotation of $180^\\circ$ about ${centreT(C).en}`, `Putaran $180^\\circ$ pada ${centreT(C).ms}`)
    : T(`A rotation of $${a}^\\circ$ ${d === 'cw' ? 'clockwise' : 'anticlockwise'} about ${centreT(C).en}`, `Putaran $${a}^\\circ$ ${d === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} pada ${centreT(C).ms}`));
  const rAD = (r, allow270) => { const a = r.pick(allow270 ? [90, 90, 180, 270] : [90, 90, 180]); return [a, r.pick(['cw', 'ccw'])]; };
  const eqAD = (a, d) => (a === 270 ? [90, d === 'cw' ? 'ccw' : 'cw'] : [a, d]);
  /** generate shape + rotation. centre: 'origin' | 'free' | 'vertex' */
  const rotSetup = (r, o) => retry(() => {
    const k = o.k || r.pick([3, 4]);
    const [a, d] = o.ang ? [o.ang, o.dir || r.pick(['cw', 'ccw'])] : rAD(r, o.allow270);
    let O = shape(r, KIND_OF[k], o.lim || 4);
    let C;
    if (o.centre === 'origin') C = [0, 0];
    else if (o.centre === 'vertex') C = O[r.int(0, k - 1)].slice();
    else C = [r.int(-3, 3), r.int(-3, 3)];
    if (o.centre !== 'vertex') need(O.every((p) => !same(p, C)));
    const I = rotP(O, C, a, d);
    need(inb(I, 8) && inb([C], 6));
    if (o.centre === 'origin' || o.centre === 'free') need(O.some((p, i) => !same(p, I[i])));
    return { O, I, C, a, d, k, names: nm(r, k) };
  });
  const figR = (s, o) => fig(Object.assign({ O: s.O, I: o && o.noImg ? undefined : s.I, names: s.names, centre: isO(s.C) ? undefined : s.C, centreLabel: 'C' }, o || {}));

  /* ---- easy ---- */
  E114.push((r) => { // point about the origin (quarter/half turn)
    const P = [r.nz(-5, 5), r.nz(-5, 5)], [a, d] = rAD(r, false), Q = rotate(P, [0, 0], a, d);
    const forms = [
      ["Find the image of $P{P}$ under a rotation of {t} about the origin.", "Cari imej bagi $P{P}$ di bawah putaran {t} pada asalan."],
      ["The point ${P}$ is turned through {t} about $O$. Write the coordinates of its image $P'$.", "Titik ${P}$ diputarkan melalui {t} pada $O$. Tulis koordinat imejnya $P'$."],
      ["$P{P}$ is rotated about the origin, {t}. What are the coordinates of $P'$?", "$P{P}$ diputarkan pada asalan, {t}. Apakah koordinat $P'$?"],
    ];
    const t = a === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(a, d);
    return { q: fill(r.pick(forms), { P: pt(P), t }), fig: r.chance(0.5) ? fig({ O: [P], names: ['P'] }) : undefined, a: T(`$${pt(Q)}$`), w: W(...rotSteps(P, [0, 0], a, d, 'P', "P'")), sp: 's' };
  });
  E114.push((r) => { // point about a marked centre C
    const C = [r.int(-3, 3), r.int(-3, 3)], P = [C[0] + r.nz(-3, 3), C[1] + r.nz(-3, 3)], [a, d] = rAD(r, false), Q = rotate(P, C, a, d);
    need(inb([P, Q], 8));
    const forms = [
      ["The point $P{P}$ is rotated about $C{C}$ through {t}. Find its image.", "Titik $P{P}$ diputarkan pada $C{C}$ melalui {t}. Cari imejnya."],
      ["A rotation about ${C}$ of {t} maps $P{P}$ to $P'$. Write down the coordinates of $P'$.", "Putaran pada ${C}$ sebanyak {t} memetakan $P{P}$ ke $P'$. Tulis koordinat $P'$."],
    ];
    const t = a === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(a, d);
    return { q: fill(r.pick(forms), { P: pt(P), C: pt(C), t }), fig: fig({ O: [P], names: ['P'], centre: C }), a: T(`$${pt(Q)}$`), w: W(rotRuleL(a, d), ...rotSteps(P, C, a, d, 'P', "P'")), sp: 's' };
  });
  E114.push((r) => { // half-turn: centre is the midpoint
    const C = [r.int(-3, 3), r.int(-3, 3)], P = [C[0] + r.nz(-4, 4), C[1] + r.nz(-4, 4)], Q = rotate(P, C, 180, 'cw');
    need(inb([P, Q], 8));
    const forms = [
      ["Point $P{P}$ is rotated $180^\\circ$ about $C{C}$. Find $P'$.", "Titik $P{P}$ diputarkan $180^\\circ$ pada $C{C}$. Cari $P'$."],
      ["A half-turn about the point $C{C}$ takes ${P}$ to $P'$. What are the coordinates of $P'$? (Hint: $C$ is the midpoint of $PP'$.)", "Separuh pusingan pada titik $C{C}$ membawa ${P}$ ke $P'$. Apakah koordinat $P'$? (Petunjuk: $C$ ialah titik tengah $PP'$.)"],
    ];
    return { q: fill(r.pick(forms), { P: pt(P), C: pt(C) }), a: T(`$${pt(Q)}$`), w: W(T('In a half-turn, $C$ is the midpoint of $PP\'$.', 'Dalam separuh pusingan, $C$ ialah titik tengah $PP\'$.'), ...rotSteps(P, C, 180, 'cw', 'P', "P'")), sp: 's' };
  });
  E114.push((r) => { // shape about the origin with figure
    const s = rotSetup(r, { centre: 'origin', lim: 4 });
    const forms = [
      ["The diagram shows {nn} ${o}$. Find the coordinates of its image under a rotation of {t} about the origin.", "Rajah menunjukkan {nn} ${o}$. Cari koordinat imejnya di bawah putaran {t} pada asalan."],
      ["{Nn} ${o}$ is turned through {t} about $O$. Write down the vertices of ${i}$.", "{Nn} ${o}$ diputarkan melalui {t} pada $O$. Tulis bucu ${i}$."],
    ];
    const t = s.a === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(s.a, s.d);
    return { q: fill(r.pick(forms), { nn: noun(s.k), Nn: cap(noun(s.k)), o: s.names.join(''), i: s.names.map((c) => c + "'").join(''), t }), fig: figR(s, { noImg: true }), a: ansPts(s.names, s.I, "'"), w: W(rotRuleL(s.a, s.d), ...mapAll(s.O, s.I, s.names)), sp: 'm' };
  });
  E114.push((r) => { // describe: P -> P' about origin (P on axis)
    const c = r.int(2, 6), [a, d] = eqAD(...r.pick([[90, 'ccw'], [90, 'cw'], [180, 'cw']]));
    const P = r.pick([[c, 0], [0, c]]), Q = rotate(P, [0, 0], a, d);
    const forms = [
      ["A rotation about the origin maps $P{P}$ onto $P'{Q}$. Through what angle and in which direction is $P$ turned?", "Satu putaran pada asalan memetakan $P{P}$ ke $P'{Q}$. Melalui sudut berapa dan ke arah mana $P$ diputarkan?"],
      ["Describe the rotation about $O$ that moves ${P}$ to ${Q}$ (a quarter-turn or a half-turn).", "Huraikan putaran pada $O$ yang menggerakkan ${P}$ ke ${Q}$ (suku pusingan atau separuh pusingan)."],
    ];
    return { q: fill(r.pick(forms), { P: pt(P), Q: pt(Q) }), fig: fig({ O: [P], I: [Q], names: ['P'] }), a: a === 180 ? T('$180^\\circ$ (a half-turn) about $O$', '$180^\\circ$ (separuh pusingan) pada $O$') : T(`$${a}^\\circ$ ${d === 'cw' ? 'clockwise' : 'anticlockwise'} about $O$`, `$${a}^\\circ$ ${d === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} pada $O$`), w: W(T(`Compare the coordinates: $${pt(P)} \\to ${pt(Q)}$`, `Bandingkan koordinat: $${pt(P)} \\to ${pt(Q)}$`), rotRuleL(a, d), a === 180 ? T('So it is a half-turn about $O$.', 'Jadi ia separuh pusingan pada $O$.') : T(`So it is a quarter-turn ${d === 'cw' ? 'clockwise' : 'anticlockwise'} about $O$.`, `Jadi ia suku pusingan ${d === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} pada $O$.`)), sp: 's' };
  });
  E114.push((r) => { // real life turns
    const bank = [
      ['The minute hand of a clock moves from 12 to 6. State the angle and direction of its rotation.', 'Jarum minit sebuah jam bergerak dari 12 ke 6. Nyatakan sudut dan arah putarannya.', '$180^\\circ$ clockwise', '$180^\\circ$ ikut arah jam'],
      ['The minute hand of a clock moves from 12 to 3. State the angle and direction of its rotation.', 'Jarum minit sebuah jam bergerak dari 12 ke 3. Nyatakan sudut dan arah putarannya.', '$90^\\circ$ clockwise', '$90^\\circ$ ikut arah jam'],
      ['A steering wheel is turned a quarter of a full turn to the left. Describe the rotation.', 'Sebuah stereng diputarkan satu perempat pusingan penuh ke kiri. Huraikan putaran itu.', '$90^\\circ$ anticlockwise', '$90^\\circ$ lawan arah jam'],
      ['A door opens through a right angle, turning about its hinges (seen from above, anticlockwise). Describe the rotation of the door.', 'Sebuah pintu dibuka melalui sudut tegak, berputar pada engselnya (dilihat dari atas, lawan arah jam). Huraikan putaran pintu itu.', '$90^\\circ$ anticlockwise about the hinge', '$90^\\circ$ lawan arah jam pada engsel'],
      ['A ceiling fan blade turns from pointing up to pointing down. State the angle of rotation.', 'Bilah kipas siling berputar dari menghala ke atas kepada menghala ke bawah. Nyatakan sudut putaran.', '$180^\\circ$', '$180^\\circ$'],
      ['A Ferris wheel car moves from the top of the wheel to the position level with the centre on the right (clockwise). Find the angle of rotation.', 'Sebuah kereta roda Ferris bergerak dari puncak roda ke kedudukan separas dengan pusat di sebelah kanan (ikut arah jam). Cari sudut putaran.', '$90^\\circ$ clockwise', '$90^\\circ$ ikut arah jam'],
      ['A compass needle turns from North to West. Describe the rotation.', 'Jarum kompas berputar dari Utara ke Barat. Huraikan putaran itu.', '$90^\\circ$ anticlockwise', '$90^\\circ$ lawan arah jam'],
      ['A tap handle is turned from pointing East to pointing West. State the angle of rotation.', 'Pemegang paip diputarkan dari menghala ke Timur kepada menghala ke Barat. Nyatakan sudut putaran.', '$180^\\circ$', '$180^\\circ$'],
      ['The hour hand of a clock moves from 12 to 3. Through what angle has it turned, and in which direction?', 'Jarum jam sebuah jam bergerak dari 12 ke 3. Melalui sudut berapa ia telah berputar, dan ke arah mana?', '$90^\\circ$ clockwise', '$90^\\circ$ ikut arah jam'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('A full turn is $360^\\circ$, a half-turn $180^\\circ$ and a quarter-turn $90^\\circ$; clockwise follows the hands of a clock.', 'Satu pusingan penuh ialah $360^\\circ$, separuh pusingan $180^\\circ$ dan suku pusingan $90^\\circ$; ikut arah jam mengikut jarum jam.'), T(`Here the turn is ${b[2]}.`, `Di sini putarannya ialah ${b[3]}.`)), sp: 's' };
  });
  E114.push((r) => { // TF bank
    const bank = [
      ['A rotation is defined by its centre, angle and direction.', 'Putaran ditakrifkan oleh pusat, sudut dan arahnya.', true, 'All three are needed to describe it fully.', 'Ketiga-tiganya diperlukan untuk memerihalkannya sepenuhnya.'],
      ['The centre of rotation does not move.', 'Pusat putaran tidak bergerak.', true, 'It is the invariant point.', 'Ia ialah titik tak berubah.'],
      ['Under a rotation, a shape changes size.', 'Di bawah putaran, bentuk berubah saiz.', false, 'Size is preserved; a rotation is an isometry.', 'Saiz dikekalkan; putaran ialah isometri.'],
      ['Each point and its image are the same distance from the centre of rotation.', 'Setiap titik dan imejnya berjarak sama dari pusat putaran.', true, 'Points move along circles with the centre as their centre.', 'Titik bergerak sepanjang bulatan yang berpusat di pusat putaran.'],
      ['A rotation of $180^\\circ$ clockwise is the same as $180^\\circ$ anticlockwise.', 'Putaran $180^\\circ$ ikut arah jam sama dengan $180^\\circ$ lawan arah jam.', true, 'A half-turn ends in the same place in either direction.', 'Separuh pusingan berakhir di tempat yang sama pada kedua-dua arah.'],
      ['A rotation of $90^\\circ$ clockwise is the same as $90^\\circ$ anticlockwise.', 'Putaran $90^\\circ$ ikut arah jam sama dengan $90^\\circ$ lawan arah jam.', false, 'They give different images (they differ by a half-turn).', 'Kedua-duanya memberi imej yang berbeza (ia berbeza sebanyak separuh pusingan).'],
      ['A rotation produces a mirror image of the object.', 'Putaran menghasilkan imej cermin bagi objek.', false, 'The image is not flipped; it is turned.', 'Imej tidak dibalikkan; ia diputarkan.'],
      ['The image of a line segment under a rotation has the same length.', 'Imej tembereng garis di bawah putaran mempunyai panjang yang sama.', true, 'Lengths are preserved.', 'Panjang dikekalkan.'],
      ['Anticlockwise is the direction opposite to the hands of a clock.', 'Lawan arah jam ialah arah yang bertentangan dengan jarum jam.', true, 'That is the meaning of anticlockwise.', 'Itulah maksud lawan arah jam.'],
      ['A rotation of $360^\\circ$ moves every point to a new position.', 'Putaran $360^\\circ$ menggerakkan setiap titik ke kedudukan baharu.', false, 'A full turn returns every point to where it began.', 'Satu pusingan penuh mengembalikan setiap titik ke tempat asalnya.'],
    ];
    const b = r.pick(bank);
    return { q: T(`True or false? ${b[0]}`, `Benar atau palsu? ${b[1]}`), a: T(`${b[2] ? 'True' : 'False'}. ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}. ${b[4]}`), w: W(T('A rotation is fully described by its centre, angle and direction; it is an isometry, the centre is the only invariant point, and every point keeps its distance from the centre.', 'Putaran diperihalkan sepenuhnya oleh pusat, sudut dan arahnya; ia isometri, pusat ialah satu-satunya titik tak berubah, dan setiap titik mengekalkan jaraknya dari pusat.'), T(`${b[2] ? 'True' : 'False'}: ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}: ${b[4]}`)), sp: 's' };
  });
  E114.push((r) => { // distances
    const C = [r.int(-3, 3), r.int(-3, 3)], tr = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]), P = [C[0] + tr[0] * r.sign(), C[1] + tr[1] * r.sign()];
    const [a, d] = rAD(r, false), Q = rotate(P, C, a, d);
    need(inb([P, Q], 12));
    const forms = [
      ["$P{P}$ is rotated about $C{C}$ and $CP = {r}$ units. What is the length $CP'$? Give a reason.", "$P{P}$ diputarkan pada $C{C}$ dan $CP = {r}$ unit. Berapakah panjang $CP'$? Berikan sebab."],
    ];
    return { q: fill(forms[0], { P: pt(P), C: pt(C), r: String(tr[2]) }), a: T(`$CP' = ${tr[2]}$ units: every point stays at the same distance from the centre.`, `$CP' = ${tr[2]}$ unit: setiap titik kekal pada jarak yang sama dari pusat.`), w: W(T('A rotation moves every point along a circle centred at the centre of rotation.', 'Putaran menggerakkan setiap titik sepanjang bulatan yang berpusat di pusat putaran.'), T(`So the radius does not change: $CP' = CP = ${tr[2]}$ units.`, `Jadi jejari tidak berubah: $CP' = CP = ${tr[2]}$ unit.`)), sp: 's' };
  });
  E114.push((r) => { // centre is invariant
    const C = [r.int(-4, 4), r.int(-4, 4)], [a, d] = rAD(r, false);
    const forms = [
      ["A rotation of {t} about $C{C}$ is applied to a shape. What is the image of the point $C$ itself?", "Putaran {t} pada $C{C}$ dikenakan pada satu bentuk. Apakah imej bagi titik $C$ itu sendiri?"],
      ["State the coordinates of the invariant point of the rotation of {t} about ${C}$.", "Nyatakan koordinat titik tak berubah bagi putaran {t} pada ${C}$."],
    ];
    const t = a === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(a, d);
    return { q: fill(r.pick(forms), { C: pt(C), t }), a: T(`$${pt(C)}$: the centre of rotation does not move.`, `$${pt(C)}$: pusat putaran tidak bergerak.`), w: W(T('Every point turns along a circle round the centre; the centre itself has radius $0$.', 'Setiap titik berputar sepanjang bulatan mengelilingi pusat; pusat itu sendiri mempunyai jejari $0$.'), T(`So $C${pt(C)}$ is the invariant point: its image is itself.`, `Jadi $C${pt(C)}$ ialah titik tak berubah: imejnya ialah dirinya sendiri.`)), sp: 's' };
  });
  E114.push((r) => { // MCQ image
    const P = [r.nz(-5, 5), r.nz(-5, 5)], [a, d] = [90, r.pick(['cw', 'ccw'])], Q = rotate(P, [0, 0], a, d);
    const wr = [rotate(P, [0, 0], 90, d === 'cw' ? 'ccw' : 'cw'), rotate(P, [0, 0], 180, 'cw'), [P[1], P[0]]].filter((w, i, arr) => !same(w, Q) && arr.findIndex((x) => same(x, w)) === i);
    need(wr.length === 3);
    const m = mcq(r, T(`$${pt(Q)}$`), wr.map((w) => T(`$${pt(w)}$`)));
    return { q: T(`What is the image of $${pt(P)}$ under a rotation of $90^\\circ$ ${d === 'cw' ? 'clockwise' : 'anticlockwise'} about the origin?${m.opts.en}`, `Apakah imej bagi $${pt(P)}$ di bawah putaran $90^\\circ$ ${d === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} pada asalan?${m.opts.ms}`), a: m.ans, w: W(...rotSteps(P, [0, 0], a, d, 'P', "P'"), T(`So the answer is ${m.letter}.`, `Jadi jawapannya ialah ${m.letter}.`)), sp: 's' };
  });
  E114.push((r) => { // fill in blank
    const bank = [
      ['Complete: to rotate a shape you need to know the centre, the ______ and the direction.', 'Lengkapkan: untuk memutarkan suatu bentuk, anda perlu tahu pusat, ______ dan arah.', 'angle', 'sudut'],
      ['Complete: a $90^\\circ$ rotation is also called a ______ turn.', 'Lengkapkan: putaran $90^\\circ$ juga dipanggil ______ pusingan.', 'quarter (one-quarter)', 'suku (satu perempat)'],
      ['Complete: a $180^\\circ$ rotation is also called a ______ turn.', 'Lengkapkan: putaran $180^\\circ$ juga dipanggil ______ pusingan.', 'half', 'separuh'],
      ['Complete: after a rotation, the object and image are ______ (same shape and size).', 'Lengkapkan: selepas putaran, objek dan imej adalah ______ (bentuk dan saiz yang sama).', 'congruent', 'kongruen'],
      ['Complete: the only point that does not move in a rotation is the ______ of rotation.', 'Lengkapkan: satu-satunya titik yang tidak bergerak dalam putaran ialah ______ putaran.', 'centre', 'pusat'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('A rotation needs three things: the centre, the angle and the direction. $90^\\circ$ is a quarter-turn, $180^\\circ$ a half-turn, and the image is congruent to the object.', 'Putaran memerlukan tiga perkara: pusat, sudut dan arah. $90^\\circ$ ialah suku pusingan, $180^\\circ$ separuh pusingan, dan imej kongruen dengan objek.'), T(`The word that fits is "${b[2]}".`, `Perkataan yang sesuai ialah "${b[3]}".`)), sp: 's' };
  });
  E114.push((r) => { // table half-turn about origin
    const O = [0, 1, 2].map(() => [r.nz(-5, 5), r.nz(-5, 5)]);
    need(new Set(O.map(String)).size === 3);
    const [a, d] = rAD(r, false);
    const I = rotP(O, [0, 0], a, d);
    const rows = O.map((p, i) => [`$${'ABC'[i]}$`, `$${pt(p)}$`, '?']);
    const t = a === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(a, d);
    return { q: T(`Complete the table for a rotation of ${t.en} about the origin.<br>${SPM.table(rows, { head: ['Point', 'Object', 'Image'] })}`, `Lengkapkan jadual bagi putaran ${t.ms} pada asalan.<br>${SPM.table(rows, { head: ['Titik', 'Objek', 'Imej'] })}`), a: T(I.map((p, i) => `$${'ABC'[i]}'${pt(p)}$`).join(', ')), w: W(rotRuleL(a, d), ...mapAll(O, I, ['A', 'B', 'C'])), sp: 'm' };
  });
  E114.push((r) => { // figure: which vertex corresponds
    const s = rotSetup(r, { centre: 'free', lim: 3 });
    const j = r.int(0, s.k - 1);
    return { q: T(`The diagram shows ${noun(s.k).en} $${s.names.join('')}$ and its image under a rotation about $C$. Which vertex of the image corresponds to $${s.names[j]}$? Is the image the same size as the object?`, `Rajah menunjukkan ${noun(s.k).ms} $${s.names.join('')}$ dan imejnya di bawah putaran pada $C$. Bucu imej yang manakah sepadan dengan $${s.names[j]}$? Adakah imej itu sama saiz dengan objek?`), fig: figR(s), a: T(`$${s.names[j]}'$; yes, a rotation preserves size and shape.`, `$${s.names[j]}'$; ya, putaran mengekalkan saiz dan bentuk.`), w: W(T('Corresponding vertices are named in the same order round the shape, so the image of a vertex carries the same letter with a dash.', 'Bucu sepadan dinamakan mengikut tertib yang sama mengelilingi bentuk, jadi imej sesuatu bucu membawa huruf yang sama dengan tanda kanta.'), T(`So the image of $${s.names[j]}$ is $${s.names[j]}'$.`, `Jadi imej $${s.names[j]}$ ialah $${s.names[j]}'$.`), T('A rotation is an isometry, so the image is congruent to the object — same size and shape.', 'Putaran ialah isometri, jadi imej kongruen dengan objek — saiz dan bentuk yang sama.')), sp: 's' };
  });


  /* ---- medium ---- */
  M114.push((r) => { // shape about a vertex
    const s = rotSetup(r, { centre: 'vertex', lim: 3, ang: r.pick([90, 90, 180]) });
    const ci = s.O.findIndex((p) => same(p, s.C)), cn = s.names[ci];
    const forms = [
      ["{Nn} ${o}$ has vertices {vl}. It is rotated {t} about vertex ${c}$. Find the coordinates of the image.", "{Nn} ${o}$ mempunyai bucu {vl}. Ia diputarkan {t} pada bucu ${c}$. Cari koordinat imej."],
      ["Rotate {nn} ${o}$ through {t} about its vertex ${c}$ (given {vl}). State the coordinates of ${i}$ and say which vertex is invariant.", "Putarkan {nn} ${o}$ melalui {t} pada bucunya ${c}$ (diberi {vl}). Nyatakan koordinat ${i}$ dan namakan bucu yang tak berubah."],
    ];
    const t = s.a === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(s.a, s.d);
    return { q: fill(r.pick(forms), { nn: noun(s.k), Nn: cap(noun(s.k)), o: s.names.join(''), i: s.names.map((c) => c + "'").join(''), c: cn, vl: M(vlist(s.names, s.O)), t }), fig: figR(s, { noImg: true, centre: undefined }), a: T(`$${plist(s.names, s.I, "'")}$; ${cn} is invariant`, `$${plist(s.names, s.I, "'")}$; ${cn} tak berubah`), w: W(T(`The centre is the vertex $${cn}${pt(s.C)}$, so it does not move.`, `Pusatnya ialah bucu $${cn}${pt(s.C)}$, jadi ia tidak bergerak.`), rotRuleL(s.a, s.d), ...mapAll(s.O, s.I, s.names)), sp: 'm' };
  });
  M114.push((r) => { // shape about marked centre
    const s = rotSetup(r, { centre: 'free', lim: 3, k: r.pick([3, 4, 5]) });
    const forms = [
      ["The diagram shows {nn} ${o}$ and the centre $C{C}$. Find the coordinates of the image under a rotation of {t} about $C$.", "Rajah menunjukkan {nn} ${o}$ dan pusat $C{C}$. Cari koordinat imej di bawah putaran {t} pada $C$."],
      ["Rotate {nn} ${o}$ through {t} about ${C}$ and write the coordinates of the image vertices.", "Putarkan {nn} ${o}$ melalui {t} pada ${C}$ dan tulis koordinat bucu imej."],
    ];
    const t = s.a === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(s.a, s.d);
    return { q: fill(r.pick(forms), { nn: noun(s.k), o: s.names.join(''), C: pt(s.C), t }), fig: figR(s, { noImg: true }), a: ansPts(s.names, s.I, "'"), w: W(...rotSteps(s.O[0], s.C, s.a, s.d, s.names[0], s.names[0] + "'"), T('Do the same for the other vertices:', 'Lakukan perkara yang sama bagi bucu yang lain:'), ...mapAll(s.O.slice(1), s.I.slice(1), s.names.slice(1))), sp: 'm' };
  });
  M114.push((r) => { // describe fully, centre marked
    const s = rotSetup(r, { centre: 'free', lim: 3 });
    const forms = [
      ["The diagram shows {nn} ${o}$ and its image ${i}$ under a rotation about $C{C}$. Describe the rotation fully.", "Rajah menunjukkan {nn} ${o}$ dan imejnya ${i}$ di bawah putaran pada $C{C}$. Huraikan putaran itu dengan lengkap."],
      ["${o}$ is mapped onto ${i}$ by a rotation with centre $C{C}$. State the angle and direction of the rotation.", "${o}$ dipetakan ke ${i}$ oleh putaran berpusat $C{C}$. Nyatakan sudut dan arah putaran itu."],
    ];
    return { q: fill(r.pick(forms), { nn: noun(s.k), o: s.names.join(''), i: s.names.map((c) => c + "'").join(''), C: pt(s.C) }), fig: figR(s), a: rotFull(s.a, s.d, s.C), w: W(T(`Take one vertex and its image: $${s.names[0]}${pt(s.O[0])} \\to ${s.names[0]}'${pt(s.I[0])}$`, `Ambil satu bucu dan imejnya: $${s.names[0]}${pt(s.O[0])} \\to ${s.names[0]}'${pt(s.I[0])}$`), T(`Measured from $C${pt(s.C)}$: $${pt([s.O[0][0] - s.C[0], s.O[0][1] - s.C[1]])} \\to ${pt([s.I[0][0] - s.C[0], s.I[0][1] - s.C[1]])}$`, `Diukur dari $C${pt(s.C)}$: $${pt([s.O[0][0] - s.C[0], s.O[0][1] - s.C[1]])} \\to ${pt([s.I[0][0] - s.C[0], s.I[0][1] - s.C[1]])}$`), rotRuleL(s.a, s.d), rotFull(s.a, s.d, s.C)), sp: 's' };
  });
  M114.push((r) => { // find the centre of a half-turn
    const C = [r.int(-3, 3), r.int(-3, 3)], P = [r.int(-5, 5), r.int(-5, 5)], Q = rotate(P, C, 180, 'cw');
    need(!same(P, Q) && inb([Q], 9));
    const forms = [
      ["A half-turn maps $A{P}$ onto $A'{Q}$. Find the centre of rotation.", "Satu separuh pusingan memetakan $A{P}$ ke $A'{Q}$. Cari pusat putaran."],
      ["Under a rotation of $180^\\circ$, ${P}$ is mapped to ${Q}$. Determine the centre of the rotation.", "Di bawah putaran $180^\\circ$, ${P}$ dipetakan ke ${Q}$. Tentukan pusat putaran itu."],
    ];
    return { q: fill(r.pick(forms), { P: pt(P), Q: pt(Q) }), a: T(`$${pt(C)}$`), w: W(T('In a half-turn the centre is the midpoint of the segment joining a point and its image.', 'Dalam separuh pusingan, pusat ialah titik tengah tembereng yang menyambung satu titik dengan imejnya.'), `$\\left(\\dfrac{${P2(P[0])} + ${P2(Q[0])}}{2},\\ \\dfrac{${P2(P[1])} + ${P2(Q[1])}}{2}\\right) = ${pt(C)}$`), sp: 's' };
  });
  M114.push((r) => { // MCQ describe
    const s = rotSetup(r, { centre: 'free', lim: 3, ang: 90 });
    const c = rotFull(90, s.d, s.C);
    const other = s.d === 'cw' ? 'ccw' : 'cw';
    const C2 = [s.C[0] + r.pick([-2, 2]), s.C[1] + r.pick([-1, 1])];
    const wr = [rotFull(90, other, s.C), rotFull(90, s.d, C2), rotFull(180, s.d, s.C)];
    const m = mcq(r, c, wr);
    return { q: T(`The diagram shows ${noun(s.k).en} $${s.names.join('')}$ mapped onto $${s.names.map((x) => x + "'").join('')}$. Which of the following describes the rotation?${m.opts.en}`, `Rajah menunjukkan ${noun(s.k).ms} $${s.names.join('')}$ dipetakan ke $${s.names.map((x) => x + "'").join('')}$. Antara yang berikut, yang manakah memerihalkan putaran itu?${m.opts.ms}`), fig: figR(s), a: m.ans, w: W(T(`Measured from $C${pt(s.C)}$: $${pt([s.O[0][0] - s.C[0], s.O[0][1] - s.C[1]])} \\to ${pt([s.I[0][0] - s.C[0], s.I[0][1] - s.C[1]])}$`, `Diukur dari $C${pt(s.C)}$: $${pt([s.O[0][0] - s.C[0], s.O[0][1] - s.C[1]])} \\to ${pt([s.I[0][0] - s.C[0], s.I[0][1] - s.C[1]])}$`), rotRuleL(90, s.d), T(`So the rotation is $90^\\circ$ ${s.d === 'cw' ? 'clockwise' : 'anticlockwise'} about $C${pt(s.C)}$ — answer ${m.letter}.`, `Jadi putaran itu ialah $90^\\circ$ ${s.d === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} pada $C${pt(s.C)}$ — jawapan ${m.letter}.`)), sp: 's' };
  });
  M114.push((r) => { // unknown coords
    const P = [r.int(1, 5), r.int(1, 5)], [a, d] = [90, r.pick(['cw', 'ccw'])], Q = rotate(P, [0, 0], a, d);
    const forms = [
      [`$P(a,\\ ${P[1]})$ is rotated $90^\\circ$ ${d === 'cw' ? 'clockwise' : 'anticlockwise'} about the origin onto $P'(b,\\ ${Q[1]})$. Find $a$ and $b$.`, `$P(a,\\ ${P[1]})$ diputarkan $90^\\circ$ ${d === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} pada asalan ke $P'(b,\\ ${Q[1]})$. Cari $a$ dan $b$.`, `$a = ${P[0]},\\ b = ${Q[0]}$`],
      [`Under a rotation of $90^\\circ$ ${d === 'cw' ? 'clockwise' : 'anticlockwise'} about the origin, $A(m,\\ n)$ maps onto $A'${pt(Q)}$. Find $m$ and $n$.`, `Di bawah putaran $90^\\circ$ ${d === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} pada asalan, $A(m,\\ n)$ dipetakan ke $A'${pt(Q)}$. Cari $m$ dan $n$.`, `$m = ${P[0]},\\ n = ${P[1]}$`],
    ];
    const f = r.pick(forms);
    const wk = f === forms[0]
      ? W(rotRuleL(90, d), T(`Apply it to $(a,\\ ${n(P[1])})$ and compare with $(b,\\ ${n(Q[1])})$.`, `Gunakannya pada $(a,\\ ${n(P[1])})$ dan bandingkan dengan $(b,\\ ${n(Q[1])})$.`), mapLine(P, Q), `$a = ${n(P[0])},\\ b = ${n(Q[0])}$`)
      : W(T('Work backwards: turn the image through the same angle in the opposite direction.', 'Kerja ke belakang: putarkan imej melalui sudut yang sama pada arah bertentangan.'), rotRuleL(90, d === 'cw' ? 'ccw' : 'cw'), mapLine(Q, P, "A'", 'A'), `$m = ${n(P[0])},\\ n = ${n(P[1])}$`);
    return { q: T(f[0], f[1]), a: T(f[2]), w: wk, sp: 's' };
  });
  M114.push((r) => { // reverse: find object
    const s = rotSetup(r, { centre: r.pick(['free', 'origin']), lim: 3, k: r.pick([3, 4]) });
    const forms = [
      ["{Nn} ${i}$ with vertices {il} is the image of ${o}$ under a rotation of {t} about {c}. Find the coordinates of ${o}$.", "{Nn} ${i}$ dengan bucu {il} ialah imej bagi ${o}$ di bawah putaran {t} pada {c}. Cari koordinat ${o}$."],
      ["A rotation of {t} about {c} maps ${o}$ to ${i}$ where {il}. Work backwards to find the object vertices.", "Putaran {t} pada {c} memetakan ${o}$ ke ${i}$ dengan {il}. Kerja ke belakang untuk mencari bucu objek."],
    ];
    const t = s.a === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(s.a, s.d);
    return { q: fill(r.pick(forms), { nn: noun(s.k), Nn: cap(noun(s.k)), i: s.names.map((c) => c + "'").join(''), o: s.names.join(''), il: M(plist(s.names, s.I, "'")), t, c: centreT(s.C) }), a: ansPts(s.names, s.O), w: W(T('A rotation is undone by turning through the same angle in the opposite direction.', 'Putaran dibatalkan dengan memutar melalui sudut yang sama pada arah bertentangan.'), rotRuleL(s.a, s.d === 'cw' ? 'ccw' : 'cw'), ...s.I.map((p, i) => mapLine(p, s.O[i], s.names[i] + "'", s.names[i]))), sp: 'm' };
  });
  M114.push((r) => { // inverse rotation description
    const C = [r.int(-3, 3), r.int(-3, 3)], [a, d] = rAD(r, false);
    const forms = [
      ["A rotation of {t} about {c} maps $P$ onto $P'$. Describe the rotation that maps $P'$ back onto $P$.", "Putaran {t} pada {c} memetakan $P$ ke $P'$. Huraikan putaran yang memetakan $P'$ kembali ke $P$."],
    ];
    const t = a === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(a, d);
    const back = a === 180 ? rotFull(180, d, C) : rotFull(a, d === 'cw' ? 'ccw' : 'cw', C);
    return { q: fill(forms[0], { t, c: centreT(C) }), a: back, w: W(T('The inverse rotation keeps the same centre and the same angle, with the direction reversed.', 'Putaran songsang mengekalkan pusat dan sudut yang sama, dengan arah disongsangkan.'), a === 180 ? T('For a half-turn both directions give the same image, so the same rotation takes $P\'$ back to $P$.', 'Bagi separuh pusingan kedua-dua arah memberikan imej yang sama, jadi putaran yang sama membawa $P\'$ kembali ke $P$.') : T('Reverse the direction of the turn.', 'Songsangkan arah putaran itu.'), back), sp: 's' };
  });
  M114.push((r) => { // CP = CP' distance
    const C = [r.int(-3, 3), r.int(-3, 3)], tr = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
    const P = [C[0] + tr[0] * r.sign(), C[1] + tr[1] * r.sign()], [a, d] = rAD(r, false), Q = rotate(P, C, a, d);
    need(inb([P, Q], 20));
    return { q: T(`$P${pt(P)}$ is rotated about $C${pt(C)}$ to $P'${pt(Q)}$. Show that $CP = CP'$ by calculating both distances.`, `$P${pt(P)}$ diputarkan pada $C${pt(C)}$ ke $P'${pt(Q)}$. Tunjukkan bahawa $CP = CP'$ dengan menghitung kedua-dua jarak.`), a: T(`$CP = \\sqrt{${Math.abs(P[0] - C[0])}^2 + ${Math.abs(P[1] - C[1])}^2} = ${tr[2]}$ and $CP' = \\sqrt{${Math.abs(Q[0] - C[0])}^2 + ${Math.abs(Q[1] - C[1])}^2} = ${tr[2]}$.`), w: W(T('A rotation moves every point along a circle centred at $C$, so the radius cannot change.', 'Putaran menggerakkan setiap titik sepanjang bulatan berpusat di $C$, jadi jejari tidak boleh berubah.'), `$CP = \\sqrt{${Math.abs(P[0] - C[0])}^2 + ${Math.abs(P[1] - C[1])}^2} = ${tr[2]}$`, `$CP' = \\sqrt{${Math.abs(Q[0] - C[0])}^2 + ${Math.abs(Q[1] - C[1])}^2} = ${tr[2]}$`, T('The two distances are equal, so $CP = CP\'$.', 'Kedua-dua jarak adalah sama, jadi $CP = CP\'$.')), sp: 'm' };
  });
  M114.push((r) => { // spot the error
    const C = [r.int(-3, 3), r.int(-3, 3)], P = [C[0] + r.nz(-3, 3), C[1] + r.nz(-3, 3)], d = r.pick(['cw', 'ccw']);
    const Q = rotate(P, C, 90, d);
    const errs = [
      { w: rotate(P, C, 90, d === 'cw' ? 'ccw' : 'cw'), en: 'turned in the wrong direction', ms: 'memutarkan pada arah yang salah' },
      { w: rotate(P, [0, 0], 90, d), en: 'used the origin as the centre instead of $C$', ms: 'menggunakan asalan sebagai pusat dan bukan $C$' },
      { w: rotate(P, C, 180, d), en: 'turned through $180^\\circ$ instead of $90^\\circ$', ms: 'memutarkan sebanyak $180^\\circ$ dan bukan $90^\\circ$' },
    ];
    const e = r.pick(errs);
    need(!same(e.w, Q) && inb([e.w, Q], 9));
    const t = turnL(90, d);
    return { q: T(`A student says that the image of $P${pt(P)}$ under a rotation of ${t.en} about $C${pt(C)}$ is $${pt(e.w)}$. Is the answer correct? If not, explain the mistake and find the correct image.`, `Seorang murid berkata bahawa imej $P${pt(P)}$ di bawah putaran ${t.ms} pada $C${pt(C)}$ ialah $${pt(e.w)}$. Adakah jawapan itu betul? Jika tidak, terangkan kesilapan dan cari imej yang betul.`), a: T(`Not correct: the student ${e.en}. The correct image is $${pt(Q)}$.`, `Tidak betul: murid itu ${e.ms}. Imej yang betul ialah $${pt(Q)}$.`), w: W(...rotSteps(P, C, 90, d, 'P', "P'"), T(`The student ${e.en}, which gives $${pt(e.w)}$.`, `Murid itu ${e.ms}, yang memberikan $${pt(e.w)}$.`)), sp: 'm' };
  });
  M114.push((r) => { // real-life coordinates
    const ctx = [
      { en: 'A Ferris wheel has its hub at the origin (units in metres). A seat is at $P{P}$. Find its position after the wheel turns {t}.', ms: 'Sebuah roda Ferris mempunyai hab di asalan (unit dalam meter). Sebuah tempat duduk berada di $P{P}$. Cari kedudukannya selepas roda itu berputar {t}.' },
      { en: 'The tip of a windmill blade is at $P{P}$ (hub at the origin, units in metres). Find the position of the tip after the blade turns {t}.', ms: 'Hujung bilah kincir angin berada di $P{P}$ (hab di asalan, unit dalam meter). Cari kedudukan hujung itu selepas bilah berputar {t}.' },
      { en: 'On a screen grid, an arrow icon has its tip at $P{P}$. It is rotated {t} about the origin. Where is the tip now?', ms: 'Pada grid skrin, ikon anak panah mempunyai hujung di $P{P}$. Ia diputarkan {t} pada asalan. Di manakah hujungnya sekarang?' },
    ];
    const [a, d] = rAD(r, false), P = [r.nz(-6, 6), r.nz(-6, 6)];
    const t = a === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(a, d);
    const c = r.pick(ctx);
    return { q: fill([c.en, c.ms], { P: pt(P), t }), a: T(`$${pt(rotate(P, [0, 0], a, d))}$`), w: W(...rotSteps(P, [0, 0], a, d, 'P', "P'")), sp: 's' };
  });
  M114.push((r) => { // angle PCP'
    const C = [r.int(-3, 3), r.int(-3, 3)], P = [C[0] + r.nz(-3, 3), C[1] + r.nz(-3, 3)], [a, d] = rAD(r, false), Q = rotate(P, C, a, d);
    need(inb([P, Q], 9));
    const forms = [
      [`$P${pt(P)}$ is mapped onto $P'${pt(Q)}$ by a rotation about $C${pt(C)}$. State the size of $\\angle PCP'$ and the direction of the rotation.`, `$P${pt(P)}$ dipetakan ke $P'${pt(Q)}$ oleh putaran pada $C${pt(C)}$. Nyatakan saiz $\\angle PCP'$ dan arah putaran itu.`],
    ];
    return { q: T(forms[0][0], forms[0][1]), fig: fig({ O: [P], I: [Q], names: ['P'], centre: C }), a: a === 180 ? T('$\\angle PCP\' = 180^\\circ$ (a half-turn)', '$\\angle PCP\' = 180^\\circ$ (separuh pusingan)') : T(`$\\angle PCP' = 90^\\circ$, ${d === 'cw' ? 'clockwise' : 'anticlockwise'}`, `$\\angle PCP' = 90^\\circ$, ${d === 'cw' ? 'ikut arah jam' : 'lawan arah jam'}`), w: W(T('The angle turned at the centre is the same for every point, so $\\angle PCP\'$ is the angle of the rotation.', 'Sudut yang diputarkan pada pusat adalah sama bagi setiap titik, jadi $\\angle PCP\'$ ialah sudut putaran itu.'), T(`Measured from $C${pt(C)}$: $${pt([P[0] - C[0], P[1] - C[1]])} \\to ${pt([Q[0] - C[0], Q[1] - C[1]])}$`, `Diukur dari $C${pt(C)}$: $${pt([P[0] - C[0], P[1] - C[1]])} \\to ${pt([Q[0] - C[0], Q[1] - C[1]])}$`), rotRuleL(a, d)), sp: 's' };
  });
  M114.push((r) => { // table: 90 rotation with unknown cells
    const [a, d] = [90, r.pick(['cw', 'ccw'])];
    const O = [0, 1, 2].map(() => [r.nz(-5, 5), r.nz(-5, 5)]);
    need(new Set(O.map(String)).size === 3);
    const I = rotP(O, [0, 0], a, d);
    const rows = [[`$A$`, `$${pt(O[0])}$`, `$${pt(I[0])}$`], [`$B$`, `$${pt(O[1])}$`, '?'], [`$C$`, '?', `$${pt(I[2])}$`]];
    const t = turnL(a, d);
    return { q: T(`The table shows points and their images under one rotation about the origin. The rotation is ${t.en}.<br>${SPM.table(rows, { head: ['Point', 'Object', 'Image'] })}Complete the table.`, `Jadual menunjukkan titik dan imejnya di bawah satu putaran pada asalan. Putaran itu ialah ${t.ms}.<br>${SPM.table(rows, { head: ['Titik', 'Objek', 'Imej'] })}Lengkapkan jadual.`), a: T(`$B'${pt(I[1])}$, $C${pt(O[2])}$`), w: W(rotRuleL(a, d), mapLine(O[1], I[1], 'B', "B'"), T('For $C$, work backwards (turn the image the other way):', 'Bagi $C$, kerja ke belakang (putarkan imej ke arah bertentangan):'), mapLine(I[2], O[2], "C'", 'C')), sp: 'm' };
  });
  M114.push((r) => { // offset from centre
    const C = [r.int(-3, 3), r.int(-3, 3)], a = r.int(1, 4), b = r.int(1, 4), sx = r.sign(), sy = r.sign();
    const P = [C[0] + sx * a, C[1] + sy * b], [an, d] = rAD(r, false), Q = rotate(P, C, an, d);
    need(inb([P, Q], 9));
    const dxE = `${a} unit${a === 1 ? '' : 's'} to the ${sx > 0 ? 'right' : 'left'} of $C$`, dxM = `${a} unit ke ${sx > 0 ? 'kanan' : 'kiri'} $C$`;
    const dyE = `${b} unit${b === 1 ? '' : 's'} ${sy > 0 ? 'above' : 'below'} $C$`, dyM = `${b} unit di ${sy > 0 ? 'atas' : 'bawah'} $C$`;
    const t = an === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(an, d);
    return { q: T(`The centre of rotation is $C${pt(C)}$. Point $P$ is ${dxE} and ${dyE}. Find the coordinates of the image of $P$ under a rotation of ${t.en} about $C$.`, `Pusat putaran ialah $C${pt(C)}$. Titik $P$ berada ${dxM} dan ${dyM}. Cari koordinat imej $P$ di bawah putaran ${t.ms} pada $C$.`), a: T(`$${pt(Q)}$`), w: W(T(`From the description, $P = ${pt(P)}$.`, `Daripada perihalan itu, $P = ${pt(P)}$.`), ...rotSteps(P, C, an, d, 'P', "P'")), sp: 's' };
  });


  /* ---- advanced 11.4 ---- */
  A114.push((r) => { // locate the centre from an object-image figure
    const s = rotSetup(r, { centre: 'free', lim: 3, k: r.pick([3, 4]), allow270: true });
    const [a, d] = eqAD(s.a, s.d);
    const forms = [
      ["The diagram shows {nn} ${o}$ and its image ${i}$ under a rotation. Find the centre of the rotation and describe the rotation fully.", "Rajah menunjukkan {nn} ${o}$ dan imejnya ${i}$ di bawah satu putaran. Cari pusat putaran dan huraikan putaran itu dengan lengkap."],
      ["${o}$ is mapped onto ${i}$ by a rotation whose centre is not marked. Use perpendicular bisectors of two pairs of corresponding points to find the centre, then state the angle and direction.", "${o}$ dipetakan ke ${i}$ oleh putaran yang pusatnya tidak ditandakan. Gunakan pembahagi dua sama serenjang bagi dua pasang titik sepadan untuk mencari pusat, kemudian nyatakan sudut dan arah."],
    ];
    return { q: fill(r.pick(forms), { nn: noun(s.k), o: s.names.join(''), i: s.names.map((c) => c + "'").join('') }), fig: fig({ O: s.O, I: s.I, names: s.names }), a: rotFull(a, d, s.C), w: W(T(`The centre of a rotation is equidistant from each point and its image, so it lies on the perpendicular bisector of $${s.names[0]}${s.names[0]}'$ and also on that of $${s.names[1]}${s.names[1]}'$.`, `Pusat putaran berjarak sama dari setiap titik dan imejnya, jadi ia terletak pada pembahagi dua sama serenjang bagi $${s.names[0]}${s.names[0]}'$ dan juga bagi $${s.names[1]}${s.names[1]}'$.`), T(`Drawing both bisectors gives the centre $${pt(s.C)}$.`, `Melukis kedua-dua pembahagi memberikan pusat $${pt(s.C)}$.`), T(`Measured from the centre: $${pt([s.O[0][0] - s.C[0], s.O[0][1] - s.C[1]])} \\to ${pt([s.I[0][0] - s.C[0], s.I[0][1] - s.C[1]])}$`, `Diukur dari pusat: $${pt([s.O[0][0] - s.C[0], s.O[0][1] - s.C[1]])} \\to ${pt([s.I[0][0] - s.C[0], s.I[0][1] - s.C[1]])}$`), rotRuleL(a, d), rotFull(a, d, s.C)), sp: 'l' };
  });
  A114.push((r) => { // recover the object; arbitrary centre
    const s = rotSetup(r, { centre: 'free', lim: 3, k: r.pick([3, 4]), allow270: true });
    const [a, d] = [s.a, s.d];
    const asFig = r.chance(0.5);
    const t = a === 270 ? T('$270^\\circ$ ' + (d === 'cw' ? 'clockwise' : 'anticlockwise'), '$270^\\circ$ ' + (d === 'cw' ? 'ikut arah jam' : 'lawan arah jam')) : (a === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(a, d));
    const forms = asFig
      ? [["The diagram shows {nn} ${i}$ and the point $C{C}$. ${i}$ is the image of ${o}$ under a rotation of {t} about $C$. Find the coordinates of ${o}$.", "Rajah menunjukkan {nn} ${i}$ dan titik $C{C}$. ${i}$ ialah imej bagi ${o}$ di bawah putaran {t} pada $C$. Cari koordinat ${o}$."]]
      : [["{Nn} ${i}$ has vertices {il}. It is the image of ${o}$ under a rotation of {t} about $C{C}$. Find the vertices of ${o}$.", "{Nn} ${i}$ mempunyai bucu {il}. Ia ialah imej bagi ${o}$ di bawah putaran {t} pada $C{C}$. Cari bucu ${o}$."],
         ["Reverse the rotation: the image ${i}$ is {il}, the centre is ${C}$ and the turn was {t}. What was the original {nn} ${o}$?", "Songsangkan putaran itu: imej ${i}$ ialah {il}, pusatnya ${C}$ dan putarannya {t}. Apakah {nn} asal ${o}$?"]];
    const items = [{ t: 'poly', p: s.I, names: s.names, prime: "'", style: 'img' }, { t: 'dot', p: s.C, l: 'C' }];
    return { q: fill(r.pick(forms), { nn: noun(s.k), Nn: cap(noun(s.k)), i: s.names.map((c) => c + "'").join(''), o: s.names.join(''), il: M(plist(s.names, s.I, "'")), C: pt(s.C), t }), fig: asFig ? render({ items }) : undefined, a: ansPts(s.names, s.O), w: W(T('Undo the rotation: turn each image vertex about $C$ through the same angle in the opposite direction.', 'Batalkan putaran: putarkan setiap bucu imej pada $C$ melalui sudut yang sama pada arah bertentangan.'), rotRuleL(a, d === 'cw' ? 'ccw' : 'cw'), ...s.I.map((p, i) => mapLine(p, s.O[i], s.names[i] + "'", s.names[i]))), sp: 'l' };
  });
  A114.push((r) => { // choose the centre among candidates
    const C = [r.int(-3, 3), r.int(-3, 3)], [a, d] = rAD(r, false);
    const P = [C[0] + r.nz(-3, 3), C[1] + r.nz(-3, 3)], Q = rotate(P, C, a, d);
    need(!same(P, Q) && inb([P, Q], 8));
    const cands = [C, [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], [P[0], Q[1]], [Q[0], P[1]]].filter((c, i, arr) => Number.isInteger(c[0]) && Number.isInteger(c[1]) && arr.findIndex((x) => same(x, c)) === i);
    need(cands.length === 4 && a === 90);
    const sh = r.shuffle(cands.map((c, i) => ({ c, ok: i === 0 })));
    const list = sh.map((o, i) => `${'ABCD'[i]}${pt(o.c)}`).join(',\\ ');
    const ok = sh.findIndex((o) => o.ok);
    const dd = (X, Y) => (X[0] - Y[0]) ** 2 + (X[1] - Y[1]) ** 2;
    return { q: T(`A rotation of $90^\\circ$ ${d === 'cw' ? 'clockwise' : 'anticlockwise'} maps $P${pt(P)}$ onto $P'${pt(Q)}$. Which of the points $${list}$ is the centre of rotation? Give a reason.`, `Putaran $90^\\circ$ ${d === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} memetakan $P${pt(P)}$ ke $P'${pt(Q)}$. Antara titik $${list}$, yang manakah pusat putaran? Berikan sebab.`), a: T(`${'ABCD'[ok]}: $CP^2 = ${dd(C, P)}$ and $CP'^2 = ${dd(C, Q)}$ are equal, and the turn from $CP$ to $CP'$ is $90^\\circ$ ${d === 'cw' ? 'clockwise' : 'anticlockwise'}.`, `${'ABCD'[ok]}: $CP^2 = ${dd(C, P)}$ dan $CP'^2 = ${dd(C, Q)}$ adalah sama, dan putaran dari $CP$ ke $CP'$ ialah $90^\\circ$ ${d === 'cw' ? 'ikut arah jam' : 'lawan arah jam'}.`), w: W(T('The centre must be the same distance from $P$ and from $P\'$, and the turn from $CP$ to $CP\'$ must be the stated quarter-turn.', 'Pusat mesti berjarak sama dari $P$ dan dari $P\'$, dan putaran dari $CP$ ke $CP\'$ mestilah suku pusingan yang dinyatakan.'), T(`For ${'ABCD'[ok]}: $CP^2 = ${dd(C, P)}$ and $CP'^2 = ${dd(C, Q)}$, which are equal.`, `Bagi ${'ABCD'[ok]}: $CP^2 = ${dd(C, P)}$ dan $CP'^2 = ${dd(C, Q)}$, yang sama.`), T(`Measured from it: $${pt([P[0] - C[0], P[1] - C[1]])} \\to ${pt([Q[0] - C[0], Q[1] - C[1]])}$, a $90^\\circ$ turn ${d === 'cw' ? 'clockwise' : 'anticlockwise'}.`, `Diukur daripadanya: $${pt([P[0] - C[0], P[1] - C[1]])} \\to ${pt([Q[0] - C[0], Q[1] - C[1]])}$, putaran $90^\\circ$ ${d === 'cw' ? 'ikut arah jam' : 'lawan arah jam'}.`), T(`So the centre is ${'ABCD'[ok]}.`, `Jadi pusatnya ialah ${'ABCD'[ok]}.`)), sp: 'm' };
  });
  A114.push((r) => { // solve for centre algebraically
    const C = [r.int(-3, 3), r.int(-3, 3)], d = r.pick(['cw', 'ccw']);
    const P = [C[0] + r.nz(-4, 4), C[1] + r.nz(-4, 4)], Q = rotate(P, C, 90, d);
    need(inb([P, Q], 9));
    const t = turnL(90, d);
    return { q: T(`Under a rotation of ${t.en} about an unknown centre $C(h,\\ k)$, $A${pt(P)}$ maps onto $A'${pt(Q)}$. Find $h$ and $k$.`, `Di bawah putaran ${t.ms} pada pusat yang tidak diketahui $C(h,\\ k)$, $A${pt(P)}$ dipetakan ke $A'${pt(Q)}$. Cari $h$ dan $k$.`), a: T(`$h = ${C[0]},\\ k = ${C[1]}$`), w: W(T('For a quarter-turn the centre satisfies $CA = CA\'$ and $\\angle ACA\' = 90^\\circ$.', 'Bagi suku pusingan, pusat memenuhi $CA = CA\'$ dan $\\angle ACA\' = 90^\\circ$.'), T('So $C$ lies on the perpendicular bisector of $AA\'$; the right angle then fixes which point of that line it is.', 'Jadi $C$ terletak pada pembahagi dua sama serenjang bagi $AA\'$; sudut tegak itu kemudian menentukan titik yang mana pada garis itu.'), T(`$h = ${n(C[0])},\\ k = ${n(C[1])}$`), T(`Check: measured from $C$, $${pt([P[0] - C[0], P[1] - C[1]])} \\to ${pt([Q[0] - C[0], Q[1] - C[1]])}$.`, `Semak: diukur dari $C$, $${pt([P[0] - C[0], P[1] - C[1]])} \\to ${pt([Q[0] - C[0], Q[1] - C[1]])}$.`)), sp: 'l' };
  });
  A114.push((r) => { // explain bank
    const bank = [
      ['Explain why the centre of a rotation lies on the perpendicular bisector of the segment joining any point to its image.', 'Terangkan mengapa pusat putaran terletak pada pembahagi dua sama serenjang bagi tembereng yang menyambung sebarang titik dengan imejnya.', 'The centre is the same distance from a point and from its image (both lie on a circle centred at the centre), and the set of points equidistant from two points is their perpendicular bisector.', 'Pusat berjarak sama dari suatu titik dan imejnya (kedua-duanya terletak pada bulatan yang berpusat di pusat itu), dan set titik yang berjarak sama dari dua titik ialah pembahagi dua sama serenjangnya.'],
      ['Explain why a rotation of $90^\\circ$ clockwise gives the same image as a rotation of $270^\\circ$ anticlockwise.', 'Terangkan mengapa putaran $90^\\circ$ ikut arah jam memberikan imej yang sama seperti putaran $270^\\circ$ lawan arah jam.', 'Turning $270^\\circ$ one way ends in the same position as turning $360^\\circ - 270^\\circ = 90^\\circ$ the other way.', 'Berputar $270^\\circ$ pada satu arah berakhir pada kedudukan yang sama seperti berputar $360^\\circ - 270^\\circ = 90^\\circ$ pada arah yang lain.'],
      ['Why is it enough to give only the angle when describing a half-turn, without stating the direction?', 'Mengapa memadai untuk memberi sudut sahaja apabila memerihalkan separuh pusingan, tanpa menyatakan arah?', 'A half-turn clockwise and a half-turn anticlockwise both end in the same position, so the direction makes no difference.', 'Separuh pusingan ikut arah jam dan lawan arah jam kedua-duanya berakhir pada kedudukan yang sama, jadi arah tidak membezakan.'],
      ['Explain why a rotation is an isometry.', 'Terangkan mengapa putaran ialah isometri.', 'Every point stays the same distance from the centre and the whole figure turns rigidly, so lengths and angles do not change and the image is congruent to the object.', 'Setiap titik kekal pada jarak yang sama dari pusat dan keseluruhan rajah berputar secara tegar, jadi panjang dan sudut tidak berubah dan imej kongruen dengan objek.'],
      ['How many invariant points does a rotation through $90^\\circ$ have? Explain.', 'Berapakah bilangan titik tak berubah bagi putaran melalui $90^\\circ$? Terangkan.', 'Exactly one, the centre. Every other point moves along a circle round the centre to a different position.', 'Tepat satu, iaitu pusat. Setiap titik lain bergerak sepanjang bulatan mengelilingi pusat ke kedudukan yang berbeza.'],
      ['Explain how a rotation differs from a reflection in what happens to the orientation of a shape.', 'Terangkan perbezaan putaran daripada pantulan dari segi orientasi suatu bentuk.', 'A rotation keeps the orientation (no mirror image), while a reflection reverses it.', 'Putaran mengekalkan orientasi (bukan imej cermin), manakala pantulan menyongsangkannya.'],
      ['A student says a translation is a rotation with a very far away centre. Is a rotation of $90^\\circ$ ever the same as a translation? Explain.', 'Seorang murid berkata translasi ialah putaran dengan pusat yang sangat jauh. Adakah putaran $90^\\circ$ pernah sama dengan translasi? Terangkan.', 'No. A rotation of $90^\\circ$ turns the shape so its sides point in new directions; a translation never changes direction.', 'Tidak. Putaran $90^\\circ$ memutarkan bentuk itu supaya sisinya menghala ke arah baharu; translasi tidak pernah mengubah arah.'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('Key facts: a rotation is an isometry, its centre is the only invariant point and is equidistant from each point and its image, and turning $x^\\circ$ one way gives the same image as turning $(360 - x)^\\circ$ the other way.', 'Fakta utama: putaran ialah isometri, pusatnya ialah satu-satunya titik tak berubah dan berjarak sama dari setiap titik dan imejnya, dan berputar $x^\\circ$ pada satu arah memberikan imej yang sama seperti berputar $(360 - x)^\\circ$ pada arah yang lain.'), T(b[2], b[3])), sp: 'm' };
  });
  A114.push((r) => { // true statements selection
    const bank = [
      ['The centre of rotation is the only invariant point.', 'Pusat putaran ialah satu-satunya titik tak berubah.', true],
      ['A rotation of $90^\\circ$ clockwise about $C$ maps every point to the same place as a rotation of $270^\\circ$ anticlockwise about $C$.', 'Putaran $90^\\circ$ ikut arah jam pada $C$ memetakan setiap titik ke tempat yang sama seperti putaran $270^\\circ$ lawan arah jam pada $C$.', true],
      ['The image is a mirror image of the object.', 'Imej ialah imej cermin bagi objek.', false],
      ['Lines joining corresponding points are all parallel.', 'Garis yang menyambung titik sepadan semuanya selari.', false],
      ['Object and image have the same area.', 'Objek dan imej mempunyai luas yang sama.', true],
      ['The centre of rotation must be a vertex of the shape.', 'Pusat putaran mestilah bucu bagi bentuk itu.', false],
      ['A point and its image are equidistant from the centre.', 'Satu titik dan imejnya berjarak sama dari pusat.', true],
      ['A rotation of $180^\\circ$ turns every line into a line parallel to itself.', 'Putaran $180^\\circ$ menjadikan setiap garis kepada garis yang selari dengan dirinya.', true],
      ['A rotation changes the length of the sides of a triangle.', 'Putaran mengubah panjang sisi segi tiga.', false],
    ];
    const S4 = r.sample(bank, 4);
    need(S4.some((s) => s[2]) && S4.some((s) => !s[2]));
    const list = S4.map((s, i) => `<b>${'ABCD'[i]}.</b> ${s[0]}`).join('<br>'), listM = S4.map((s, i) => `<b>${'ABCD'[i]}.</b> ${s[1]}`).join('<br>');
    const ok = S4.map((s, i) => (s[2] ? 'ABCD'[i] : '')).join('');
    return { q: T(`Which of these statements about rotations are true?<br>${list}`, `Antara pernyataan berikut tentang putaran, yang manakah benar?<br>${listM}`), a: T(`${ok.split('').join(', ')} ${ok.length === 1 ? 'is' : 'are'} true; the others are false.`, `${ok.split('').join(', ')} benar; yang lain palsu.`), w: W(T('A rotation is an isometry: lengths, angles, areas and orientation are kept. Only the centre is invariant, it need not be a vertex, and every point keeps its distance from it.', 'Putaran ialah isometri: panjang, sudut, luas dan orientasi dikekalkan. Hanya pusat yang tak berubah, ia tidak semestinya bucu, dan setiap titik mengekalkan jaraknya daripadanya.'), T(`Checking each statement against this: ${ok.split('').join(', ')} agree with it.`, `Menyemak setiap pernyataan dengan ini: ${ok.split('').join(', ')} menepatinya.`)), sp: 'm' };
  });
  A114.push((r) => { // time-based rotation (multi-turn)
    const P = [r.nz(-6, 6), r.nz(-6, 6)], t = r.int(1, 7), d = r.pick(['cw', 'ccw']);
    const total = 90 * t, eq = total % 360;
    const rate = r.pick([['a windmill blade', 'bilah kincir angin', 'each second', 'setiap saat']]);
    const Q = eq === 0 ? P : rotate(P, [0, 0], eq, d);
    const dirE = d === 'cw' ? 'clockwise' : 'anticlockwise', dirM = d === 'cw' ? 'ikut arah jam' : 'lawan arah jam';
    return { q: T(`The tip of a windmill blade is at $P${pt(P)}$ (hub at the origin, units in metres). The blade turns $90^\\circ$ ${dirE} each second. (a) Through what total angle does it turn in ${t} second${t === 1 ? '' : 's'}? (b) Find the position of the tip after ${t} second${t === 1 ? '' : 's'}.`, `Hujung bilah kincir angin berada di $P${pt(P)}$ (hab di asalan, unit dalam meter). Bilah itu berputar $90^\\circ$ ${dirM} setiap saat. (a) Berapakah jumlah sudut ia berputar dalam ${t} saat? (b) Cari kedudukan hujung selepas ${t} saat.`), a: T(`(a) $${total}^\\circ$ ${dirE}${total > 360 ? ` (equivalent to $${eq === 0 ? 360 : eq}^\\circ$)` : ''} (b) $${pt(Q)}$`, `(a) $${total}^\\circ$ ${dirM}${total > 360 ? ` (setara dengan $${eq === 0 ? 360 : eq}^\\circ$)` : ''} (b) $${pt(Q)}$`), w: W(`(a) $90^\\circ \\times ${t} = ${total}^\\circ$`, total > 360 ? T(`Take away one full turn: $${total}^\\circ - 360^\\circ = ${eq}^\\circ$, so the effective turn is $${eq === 0 ? 360 : eq}^\\circ$ ${dirE}.`, `Tolak satu pusingan penuh: $${total}^\\circ - 360^\\circ = ${eq}^\\circ$, jadi putaran berkesan ialah $${eq === 0 ? 360 : eq}^\\circ$ ${dirM}.`) : T(`(b) The effective turn is $${total}^\\circ$ ${dirE}.`, `(b) Putaran berkesan ialah $${total}^\\circ$ ${dirM}.`), eq === 0 ? T('A full turn brings the tip back to where it started.', 'Satu pusingan penuh membawa hujung itu kembali ke tempat asalnya.') : rotRuleL(eq, d), mapLine(P, Q, 'P', "P'")), sp: 'l' };
  });
  A114.push((r) => { // 180 with unknown centre & then another point
    const C = [r.int(-3, 3), r.int(-3, 3)], A = [r.int(-5, 5), r.int(-5, 5)], B = [r.int(-5, 5), r.int(-5, 5)];
    need(!same(A, rotate(A, C, 180, 'cw')) && inb([rotate(A, C, 180, 'cw'), rotate(B, C, 180, 'cw')], 10));
    const A1 = rotate(A, C, 180, 'cw'), B1 = rotate(B, C, 180, 'cw');
    return { q: T(`A half-turn maps $A${pt(A)}$ onto $A'${pt(A1)}$. (a) Find the centre of rotation. (b) Find the image of $B${pt(B)}$. (c) Explain why $AB$ and $A'B'$ are parallel.`, `Separuh pusingan memetakan $A${pt(A)}$ ke $A'${pt(A1)}$. (a) Cari pusat putaran. (b) Cari imej $B${pt(B)}$. (c) Terangkan mengapa $AB$ dan $A'B'$ adalah selari.`), a: T(`(a) $${pt(C)}$ (b) $${pt(B1)}$ (c) A half-turn turns every line through $180^\\circ$, so each line ends up parallel to its original direction.`, `(a) $${pt(C)}$ (b) $${pt(B1)}$ (c) Separuh pusingan memutarkan setiap garis sebanyak $180^\\circ$, jadi setiap garis menjadi selari dengan arah asalnya.`), w: W(T('(a) In a half-turn the centre is the midpoint of $AA\'$.', '(a) Dalam separuh pusingan, pusat ialah titik tengah $AA\'$.'), `$\\left(\\dfrac{${P2(A[0])} + ${P2(A1[0])}}{2},\\ \\dfrac{${P2(A[1])} + ${P2(A1[1])}}{2}\\right) = ${pt(C)}$`, T(`(b) $C$ is also the midpoint of $BB'$:`, `(b) $C$ juga titik tengah $BB'$:`), `$B' = (2(${n(C[0])}) - ${P2(B[0])},\\ 2(${n(C[1])}) - ${P2(B[1])}) = ${pt(B1)}$`, T('(c) A half-turn turns every line through $180^\\circ$, which leaves it pointing along its original direction, so $AB$ and $A\'B\'$ are parallel.', '(c) Separuh pusingan memutarkan setiap garis sebanyak $180^\\circ$, yang meninggalkannya menghala pada arah asalnya, jadi $AB$ dan $A\'B\'$ selari.')), sp: 'l' };
  });
  A114.push((r) => { // AA' squared / isosceles right triangle
    const P = [r.int(1, 5), r.int(1, 5)], d = r.pick(['cw', 'ccw']);
    const Q = rotate(P, [0, 0], 90, d);
    const oa2 = P[0] * P[0] + P[1] * P[1], aa2 = d2(P, Q);
    const t = turnL(90, d);
    return { q: T(`$A${pt(P)}$ is rotated ${t.en} about the origin $O$ to $A'${pt(Q)}$. Show that triangle $OAA'$ is right-angled and isosceles, and find $AA'^2$.`, `$A${pt(P)}$ diputarkan ${t.ms} pada asalan $O$ ke $A'${pt(Q)}$. Tunjukkan bahawa segi tiga $OAA'$ bersudut tegak dan sama kaki, dan cari $AA'^2$.`), fig: fig({ O: [P], I: [Q], names: ['A'], noImgLab: false, extra: [{ t: 'arrow', from: [0, 0], to: P }, { t: 'arrow', from: [0, 0], to: Q }] }), a: T(`$OA^2 = OA'^2 = ${oa2}$ so $OA = OA'$ (isosceles) and $\\angle AOA' = 90^\\circ$. $AA'^2 = ${oa2} + ${oa2} = ${aa2}$.`, `$OA^2 = OA'^2 = ${oa2}$ jadi $OA = OA'$ (sama kaki) dan $\\angle AOA' = 90^\\circ$. $AA'^2 = ${oa2} + ${oa2} = ${aa2}$.`), w: W(`$OA^2 = ${P[0]}^2 + ${P[1]}^2 = ${oa2}$`, `$OA'^2 = ${P2(Q[0])}^2 + ${P2(Q[1])}^2 = ${oa2}$`, T('The two are equal, so $OA = OA\'$ and triangle $OAA\'$ is isosceles.', 'Kedua-duanya sama, jadi $OA = OA\'$ dan segi tiga $OAA\'$ ialah sama kaki.'), T('The rotation is a quarter-turn, so $\\angle AOA\' = 90^\\circ$ and the triangle is right-angled at $O$.', 'Putarannya suku pusingan, jadi $\\angle AOA\' = 90^\\circ$ dan segi tiga itu bersudut tegak di $O$.'), `$AA'^2 = ${oa2} + ${oa2} = ${aa2}$`), sp: 'l' };
  });
  A114.push((r) => { // shape about a vertex, multi-part
    const s = rotSetup(r, { centre: 'vertex', lim: 3, k: 3, ang: r.pick([90, 180]) });
    const ci = s.O.findIndex((p) => same(p, s.C)), cn = s.names[ci];
    const other = (ci + 1) % 3;
    const t = s.a === 180 ? T('$180^\\circ$', '$180^\\circ$') : turnL(s.a, s.d);
    return { q: T(`Triangle $${s.names.join('')}$ has vertices $${vlist(s.names, s.O)}$. It is rotated ${t.en} about vertex ${cn}. (a) Write the coordinates of the image of the triangle. (b) Which vertex does not move? (c) Show that $${cn}${s.names[other]} = ${cn}${s.names[other]}'$ by calculating both squared lengths.`, `Segi tiga $${s.names.join('')}$ mempunyai bucu $${vlist(s.names, s.O)}$. Ia diputarkan ${t.ms} pada bucu ${cn}. (a) Tulis koordinat imej segi tiga itu. (b) Bucu yang manakah tidak bergerak? (c) Tunjukkan bahawa $${cn}${s.names[other]} = ${cn}${s.names[other]}'$ dengan menghitung kedua-dua panjang kuasa dua.`), fig: figR(s, { noImg: true, centre: undefined }), a: T(`(a) $${plist(s.names, s.I, "'")}$ (b) ${cn} (c) $${cn}${s.names[other]}^2 = ${d2(s.O[ci], s.O[other])}$ and $${cn}${s.names[other]}'^2 = ${d2(s.I[ci], s.I[other])}$`, `(a) $${plist(s.names, s.I, "'")}$ (b) ${cn} (c) $${cn}${s.names[other]}^2 = ${d2(s.O[ci], s.O[other])}$ dan $${cn}${s.names[other]}'^2 = ${d2(s.I[ci], s.I[other])}$`), w: W(T(`(a) The centre is the vertex $${cn}${pt(s.C)}$; measure each vertex from it.`, `(a) Pusatnya ialah bucu $${cn}${pt(s.C)}$; ukur setiap bucu daripadanya.`), rotRuleL(s.a, s.d), ...mapAll(s.O, s.I, s.names), T(`(b) ${cn} does not move, because it is the centre of rotation.`, `(b) ${cn} tidak bergerak, kerana ia pusat putaran.`), T(`(c) $${cn}${s.names[other]}^2 = ${d2(s.O[ci], s.O[other])}$ and $${cn}${s.names[other]}'^2 = ${d2(s.I[ci], s.I[other])}$, so the two lengths are equal.`, `(c) $${cn}${s.names[other]}^2 = ${d2(s.O[ci], s.O[other])}$ dan $${cn}${s.names[other]}'^2 = ${d2(s.I[ci], s.I[other])}$, jadi kedua-dua panjang itu sama.`)), sp: 'l' };
  });
  A114.push((r) => { // compass directions
    const C = [r.int(-3, 3), r.int(-3, 3)], k = r.int(2, 5);
    const dirs = [['East', 'Timur', [1, 0]], ['North', 'Utara', [0, 1]], ['West', 'Barat', [-1, 0]], ['South', 'Selatan', [0, -1]]];
    const i = r.int(0, 3), j = r.int(0, 3);
    need(i !== j);
    const step = (j - i + 4) % 4;
    const desc = step === 2 ? { a: 180, d: 'cw' } : step === 1 ? { a: 90, d: 'ccw' } : { a: 90, d: 'cw' };
    const P = [C[0] + dirs[i][2][0] * k, C[1] + dirs[i][2][1] * k], Q = [C[0] + dirs[j][2][0] * k, C[1] + dirs[j][2][1] * k];
    need(inb([P, Q], 9));
    return { q: T(`A point $P$ is ${k} units due ${dirs[i][0]} of the point $C${pt(C)}$. After a rotation about $C$, its image $P'$ is ${k} units due ${dirs[j][0]} of $C$. Describe the rotation fully and write the coordinates of $P$ and $P'$.`, `Satu titik $P$ berada ${k} unit ke ${dirs[i][1]} titik $C${pt(C)}$. Selepas putaran pada $C$, imejnya $P'$ berada ${k} unit ke ${dirs[j][1]} $C$. Huraikan putaran itu dengan lengkap dan tulis koordinat $P$ dan $P'$.`), a: T(`${rotFull(desc.a, desc.d, C).en}; $P${pt(P)}$, $P'${pt(Q)}$`, `${rotFull(desc.a, desc.d, C).ms}; $P${pt(P)}$, $P'${pt(Q)}$`), w: W(T(`${k} units due ${dirs[i][0]} of $C${pt(C)}$ gives $P${pt(P)}$.`, `${k} unit ke ${dirs[i][1]} $C${pt(C)}$ memberikan $P${pt(P)}$.`), T(`${k} units due ${dirs[j][0]} of $C$ gives $P'${pt(Q)}$.`, `${k} unit ke ${dirs[j][1]} $C$ memberikan $P'${pt(Q)}$.`), T(`Turning from ${dirs[i][0]} to ${dirs[j][0]} is ${step === 2 ? 'a half-turn' : step === 1 ? 'a quarter-turn anticlockwise' : 'a quarter-turn clockwise'}.`, `Berputar dari ${dirs[i][1]} ke ${dirs[j][1]} ialah ${step === 2 ? 'separuh pusingan' : step === 1 ? 'suku pusingan lawan arah jam' : 'suku pusingan ikut arah jam'}.`), rotFull(desc.a, desc.d, C)), sp: 'm' };
  });
  A114.push((r) => { // invariants under 360 & multiples
    const bank = [
      ['A rotation of $360^\\circ$ about a point $C$ is applied to a shape. Describe the image and explain.', 'Putaran $360^\\circ$ pada titik $C$ dikenakan pada suatu bentuk. Huraikan imej dan terangkan.', 'The image coincides with the object: a full turn returns every point to its starting position.', 'Imej bertindih dengan objek: satu pusingan penuh mengembalikan setiap titik ke kedudukan asalnya.'],
      ['A shape is rotated $450^\\circ$ clockwise about $C$. Find an equivalent rotation through an angle between $0^\\circ$ and $360^\\circ$.', 'Suatu bentuk diputarkan $450^\\circ$ ikut arah jam pada $C$. Cari putaran setara melalui sudut antara $0^\\circ$ dan $360^\\circ$.', '$450^\\circ - 360^\\circ = 90^\\circ$ clockwise about $C$', '$450^\\circ - 360^\\circ = 90^\\circ$ ikut arah jam pada $C$'],
      ['A shape is rotated $540^\\circ$ anticlockwise about $C$. Find an equivalent rotation through an angle between $0^\\circ$ and $360^\\circ$, and state its direction.', 'Suatu bentuk diputarkan $540^\\circ$ lawan arah jam pada $C$. Cari putaran setara melalui sudut antara $0^\\circ$ dan $360^\\circ$, dan nyatakan arahnya.', '$540^\\circ - 360^\\circ = 180^\\circ$ (a half-turn)', '$540^\\circ - 360^\\circ = 180^\\circ$ (separuh pusingan)'],
      ['A rotation of $270^\\circ$ anticlockwise about $C$ is equivalent to a rotation of what angle and direction with angle less than $180^\\circ$?', 'Putaran $270^\\circ$ lawan arah jam pada $C$ setara dengan putaran sudut dan arah apa dengan sudut kurang daripada $180^\\circ$?', '$90^\\circ$ clockwise about $C$', '$90^\\circ$ ikut arah jam pada $C$'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('A turn of $360^\\circ$ returns every point to its starting position, so $360^\\circ$ may be added or subtracted without changing the image.', 'Putaran $360^\\circ$ mengembalikan setiap titik ke kedudukan asalnya, jadi $360^\\circ$ boleh ditambah atau ditolak tanpa mengubah imej.'), T('Also, turning $x^\\circ$ one way gives the same image as turning $(360 - x)^\\circ$ the other way.', 'Selain itu, berputar $x^\\circ$ pada satu arah memberikan imej yang sama seperti berputar $(360 - x)^\\circ$ pada arah yang lain.'), T(b[2], b[3])), sp: 'm' };
  });

  /* ===================================================== 11.5 Rotational symmetry */
  const E115 = [], M115 = [], A115 = [];
  const deg = (k) => n(round(360 / k, 1));
  const degTex = (k) => `${deg(k)}^\\circ`;
  const divisors = (k) => { const d = []; for (let i = 1; i <= k; i++) if (k % i === 0) d.push(i); return d; };
  /** order of a cyclic sequence (colouring of k equal sectors) */
  const seqOrder = (seq) => {
    const k = seq.length;
    for (const d of divisors(k)) if (seq.every((v, i) => v === seq[(i + d) % k])) return k / d;
    return 1;
  };
  /* ---- figures made of repeated sectors ---- */
  const TONE = [0, 0.16, 0.42];
  const symFig = (o) => {
    const W = 190, H = 190, cx = 95, cy = 95, R = 78;
    const k = o.k, step = (2 * Math.PI) / k, a0 = o.rot === undefined ? Math.PI / 2 : o.rot;
    const pol = (rad, a) => [cx + rad * Math.cos(a), cy - rad * Math.sin(a)];
    const seq = o.seq || new Array(k).fill(1);
    const lim = o.only === undefined ? k : o.only;
    let out = '';
    for (let i = 0; i < lim; i++) {
      const a = a0 - i * step, tn = TONE[seq[i % seq.length]];
      const fo = tn === 0 ? undefined : 'currentColor';
      if (o.kind === 'pinwheel') out += S.poly([[cx, cy], pol(R, a), pol(R * 0.72, a + step * 0.62)], { fill: fo || undefined, op: tn || undefined });
      else if (o.kind === 'petals') out += S.poly([[cx, cy], pol(R * 0.55, a - step * 0.3), pol(R, a), pol(R * 0.55, a + step * 0.3)], { fill: fo, op: tn || undefined });
      else if (o.kind === 'sectors') {
        const p1 = pol(R, a - step / 2), p2 = pol(R, a + step / 2);
        out += S.path(`M${cx},${cy} L${p1[0].toFixed(1)},${p1[1].toFixed(1)} A${R},${R} 0 0 0 ${p2[0].toFixed(1)},${p2[1].toFixed(1)} Z`, { fill: fo, op: tn || undefined });
      } else if (o.kind === 'dots') {
        const p = pol(R * 0.8, a);
        out += S.circle(p[0], p[1], 7, { fill: seq[i % seq.length] === 2 ? 'currentColor' : seq[i % seq.length] === 1 ? 'var(--bg,#fff)' : 'currentColor' });
      } else if (o.kind === 'blades') { // a single blade shape: rounded triangle "fan blade"
        const pA = pol(R, a), pB = pol(R * 0.9, a + step * 0.35), pC = pol(R * 0.3, a + step * 0.5);
        out += S.poly([[cx, cy], pC, pB, pA], { fill: fo, op: tn || undefined });
      }
    }
    if (o.kind === 'ngon') out += S.poly(Array.from({ length: k }, (_, i) => pol(R, a0 - i * step)));
    if (o.kind === 'star') out += S.poly(Array.from({ length: 2 * k }, (_, i) => pol(i % 2 ? R * 0.45 : R, a0 - (i * step) / 2)));
    if (o.kind === 'sectors' || o.kind === 'ring') out += S.circle(cx, cy, R);
    if (o.centre !== false) out += S.dot(cx, cy, 2.2);
    return S.wrap(W, H, out, 'design');
  };
  const KINDS = [['pinwheel', 'pinwheel', 'kincir kertas'], ['petals', 'flower', 'bunga'], ['blades', 'fan', 'kipas'], ['star', 'star', 'bintang']];
  const OBJ = [ // en, ms, order (a/an prefix in the noun phrase)
    ['a ceiling fan with 3 identical blades', 'sebuah kipas siling dengan 3 bilah yang serupa', 3],
    ['a ceiling fan with 4 identical blades', 'sebuah kipas siling dengan 4 bilah yang serupa', 4],
    ['the recycling symbol with 3 arrows', 'simbol kitar semula dengan 3 anak panah', 3],
    ['a starfish with 5 arms', 'seekor tapak sulaiman dengan 5 lengan', 5],
    ['a frangipani (bunga kemboja) with 5 petals', 'bunga kemboja dengan 5 kelopak', 5],
    ['a hibiscus (bunga raya) with 5 petals', 'bunga raya dengan 5 kelopak', 5],
    ['a slice of star fruit (belimbing)', 'sekeping belimbing yang dihiris melintang', 5],
    ['a snowflake with 6 identical arms', 'kepingan salji dengan 6 lengan yang serupa', 6],
    ['a honeycomb cell', 'sel sarang lebah', 6],
    ['a hexagonal nut', 'nat heksagon', 6],
    ['a stop sign in the shape of a regular octagon', 'papan tanda berhenti berbentuk oktagon sekata', 8],
    ['a compass rose with 8 equal points', 'ros kompas dengan 8 hujung yang sama', 8],
    ['a pizza cut into 8 equal slices', 'piza yang dipotong kepada 8 keping sama besar', 8],
    ['a gear with 12 identical teeth', 'gear dengan 12 gigi yang serupa', 12],
    ['a toy windmill with 4 blades', 'kincir angin mainan dengan 4 bilah', 4],
    ['a bicycle wheel with 8 identical spokes', 'roda basikal dengan 8 jejari yang serupa', 8],
    ['a square floor tile', 'jubin lantai berbentuk segi empat sama', 4],
    ['a red cross with four equal arms', 'palang merah dengan empat lengan yang sama', 4],
    ['the 14-pointed star on the Malaysian flag', 'bintang 14 bucu pada Jalur Gemilang', 14],
    ['a rectangular table top', 'permukaan meja berbentuk segi empat tepat', 2],
    ['a sheet of A4 paper', 'sehelai kertas A4', 2],
    ['a rectangular door', 'pintu berbentuk segi empat tepat', 2],
    ['a rhombus-shaped signboard', 'papan tanda berbentuk rombus', 2],
    ['a triangular road warning sign (equilateral)', 'papan tanda amaran jalan berbentuk segi tiga sama sisi', 3],
    ['a butterfly with its wings open', 'seekor rama-rama dengan sayap terbuka', 1],
    ['a heart shape', 'bentuk hati', 1],
    ['a kite (a diamond with unequal diagonals)', 'layang-layang (berlian dengan pepenjuru tidak sama)', 1],
    ['a leaf', 'sehelai daun', 1],
    ['a pair of open scissors', 'sepasang gunting yang terbuka', 1],
    ['a crescent moon', 'bulan sabit', 1],
  ];
  const SHAPE = [ // en, ms, order, lines of symmetry
    ['equilateral triangle', 'segi tiga sama sisi', 3, 3], ['square', 'segi empat sama', 4, 4], ['rectangle (not a square)', 'segi empat tepat (bukan segi empat sama)', 2, 2],
    ['rhombus (not a square)', 'rombus (bukan segi empat sama)', 2, 2], ['parallelogram (not a rhombus)', 'segi empat selari (bukan rombus)', 2, 0], ['kite', 'layang-layang', 1, 1],
    ['isosceles triangle', 'segi tiga sama kaki', 1, 1], ['scalene triangle', 'segi tiga tak sama sisi', 1, 0], ['isosceles trapezium', 'trapezium sama kaki', 1, 1],
    ['regular pentagon', 'pentagon sekata', 5, 5], ['regular hexagon', 'heksagon sekata', 6, 6], ['regular octagon', 'oktagon sekata', 8, 8], ['regular decagon', 'dekagon sekata', 10, 10],
    ['regular nonagon', 'nonagon sekata', 9, 9], ['regular dodecagon', 'dodekagon sekata', 12, 12], ['right-angled trapezium', 'trapezium bersudut tegak', 1, 0],
  ];
  const LET2 = ['H', 'I', 'N', 'S', 'X', 'Z'], LET1 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'J', 'K', 'L', 'M', 'P', 'Q', 'R', 'T', 'U', 'V', 'W', 'Y'];
  const ORDK = [3, 4, 5, 6, 8, 9, 10, 12];
  const pkK = (r, list) => r.pick(list || ORDK);
  const art = (s) => (/^[aeiou]/i.test(s) ? 'an ' : 'a ') + s;
  const shT = (s) => T(art(s[0]), s[1]);

  /* ---- easy ---- */
  E115.push((r) => { // order of a real-life object
    const o = r.pick(OBJ);
    const forms = [
      ["State the order of rotational symmetry of {x}.", "Nyatakan peringkat simetri putaran bagi {x}."],
      ["How many times does {x} fit exactly onto itself during one complete turn about its centre?", "Berapa kali {x} tepat bertindih dengan dirinya sepanjang satu pusingan penuh pada pusatnya?"],
      ["{X} is turned about its centre. Write the order of its rotational symmetry (use 1 if it has none).", "{X} diputarkan pada pusatnya. Tulis peringkat simetri putarannya (guna 1 jika tiada)."],
    ];
    const f = r.pick(forms);
    return { q: fill(f, { x: T(o[0], o[1]), X: cap(T(o[0], o[1])) }), a: T(`${o[2]}`), w: W(T('The order of rotational symmetry is the number of positions in one full turn about the centre in which the object looks exactly the same.', 'Peringkat simetri putaran ialah bilangan kedudukan dalam satu pusingan penuh pada pusat yang menjadikan objek kelihatan serupa.'), o[2] === 1 ? T('This one only fits onto itself after a full $360^\\circ$ turn, so its order is 1.', 'Yang ini hanya bertindih dengan dirinya selepas satu pusingan penuh $360^\\circ$, jadi peringkatnya ialah 1.') : T(`It looks the same every $${degTex(o[2])}$, that is ${o[2]} times in a full turn, so the order is ${o[2]}.`, `Ia kelihatan sama setiap $${degTex(o[2])}$, iaitu ${o[2]} kali dalam satu pusingan penuh, jadi peringkatnya ialah ${o[2]}.`)), sp: 'xs' };
  });
  E115.push((r) => { // order of a named shape
    const s = r.pick(SHAPE);
    const forms = [
      ["Write down the order of rotational symmetry of {x}.", "Tulis peringkat simetri putaran bagi {x}."],
      ["Consider {x} turned about its centre. In how many positions during one full turn does it look exactly the same?", "Pertimbangkan {x} yang diputarkan pada pusatnya. Dalam berapa kedudukan sepanjang satu pusingan penuh ia kelihatan sama?"],
    ];
    return { q: fill(r.pick(forms), { x: shT(s) }), a: T(`${s[2]}`), w: W(T('The order counts the positions in one full turn where the shape looks exactly the same.', 'Peringkat mengira kedudukan dalam satu pusingan penuh yang menjadikan bentuk itu kelihatan serupa.'), T(`${SPM.cap(s[0])}: it fits onto itself every $${degTex(s[2])}$, so the order is ${s[2]}.`, `${SPM.cap(s[1])}: ia bertindih dengan dirinya setiap $${degTex(s[2])}$, jadi peringkatnya ialah ${s[2]}.`)), sp: 'xs' };
  });
  E115.push((r) => { // figure: count the order
    const kind = r.pick(KINDS), k = pkK(r, [3, 4, 5, 6, 8]);
    const forms = [
      ["The diagram shows a design made by repeating the same shape around a centre. State its order of rotational symmetry.", "Rajah menunjukkan reka bentuk yang dibuat dengan mengulang bentuk yang sama mengelilingi satu pusat. Nyatakan peringkat simetri putarannya."],
      ["Count the identical parts of the {n} in the diagram. What is its order of rotational symmetry?", "Kira bahagian yang serupa bagi {n} dalam rajah. Apakah peringkat simetri putarannya?"],
    ];
    return { q: fill(r.pick(forms), { n: T(kind[1], kind[2]) }), fig: symFig({ kind: kind[0], k }), a: T(`${k}`), w: W(T('The design fits onto itself once for each identical part arranged round the centre.', 'Reka bentuk itu bertindih dengan dirinya sekali bagi setiap bahagian serupa yang disusun mengelilingi pusat.'), T(`Counting the repeated parts gives ${k}, so the order is ${k} (a turn of $${degTex(k)}$ each time).`, `Mengira bahagian berulang memberikan ${k}, jadi peringkatnya ialah ${k} (putaran $${degTex(k)}$ setiap kali).`)), sp: 'xs' };
  });
  E115.push((r) => { // letters MCQ
    const c = r.pick(LET2), WR = r.sample(LET1, 3);
    const m = mcq(r, T(c, c), WR.map((x) => T(x, x)));
    return { q: T(`Which capital letter has rotational symmetry of order 2?${m.opts.en}`, `Huruf besar yang manakah mempunyai simetri putaran peringkat 2?${m.opts.ms}`), a: m.ans, w: W(T('A letter has rotational symmetry of order 2 when it looks the same after a half-turn ($180^\\circ$).', 'Huruf mempunyai simetri putaran peringkat 2 apabila ia kelihatan sama selepas separuh pusingan ($180^\\circ$).'), T(`Turning each option upside down, only ${c} is unchanged. Answer ${m.letter}.`, `Menerbalikkan setiap pilihan, hanya ${c} yang tidak berubah. Jawapan ${m.letter}.`)), sp: 's' };
  });
  E115.push((r) => { // letters: which has no rotational symmetry
    const c = r.pick(LET1), WR = r.sample(LET2, 3);
    const m = mcq(r, T(c, c), WR.map((x) => T(x, x)));
    return { q: T(`Which of these capital letters has no rotational symmetry (order 1)?${m.opts.en}`, `Antara huruf besar berikut, yang manakah tidak mempunyai simetri putaran (peringkat 1)?${m.opts.ms}`), a: m.ans, w: W(T('Order 1 means the letter looks the same only after a full turn.', 'Peringkat 1 bermakna huruf itu kelihatan sama hanya selepas satu pusingan penuh.'), T(`${c} does not look the same after a half-turn, while the other three do. Answer ${m.letter}.`, `${c} tidak kelihatan sama selepas separuh pusingan, manakala tiga yang lain ya. Jawapan ${m.letter}.`)), sp: 's' };
  });
  E115.push((r) => { // order -> smallest angle (direct)
    const k = pkK(r, [3, 4, 5, 6, 8, 10, 12]);
    const forms = [
      ["A shape has rotational symmetry of order {k}. What is the smallest angle it can be turned through to fit onto itself?", "Suatu bentuk mempunyai simetri putaran peringkat {k}. Apakah sudut terkecil yang boleh diputarkan supaya bentuk itu bertindih dengan dirinya?"],
      ["Calculate the angle of rotational symmetry of a design of order {k}.", "Hitung sudut simetri putaran bagi reka bentuk peringkat {k}."],
      ["Divide $360^\\circ$ by the order to find the smallest angle of rotation for a figure of order {k}.", "Bahagikan $360^\\circ$ dengan peringkat untuk mencari sudut putaran terkecil bagi rajah peringkat {k}."],
    ];
    return { q: fill(r.pick(forms), { k: String(k) }), a: T(`$${degTex(k)}$`), w: W(T('Smallest angle $= \\dfrac{360^\\circ}{\\text{order}}$', 'Sudut terkecil $= \\dfrac{360^\\circ}{\\text{peringkat}}$'), `$= \\dfrac{360^\\circ}{${k}} = ${degTex(k)}$`), sp: 's' };
  });
  E115.push((r) => { // angle -> order
    const k = pkK(r, [3, 4, 5, 6, 8, 9, 10, 12]);
    const forms = [
      ["The smallest angle through which a figure can be rotated to fit onto itself is ${a}$. What is its order of rotational symmetry?", "Sudut terkecil yang boleh diputarkan bagi rajah bertindih dengan dirinya ialah ${a}$. Apakah peringkat simetri putarannya?"],
      ["A design coincides with itself each time it is turned through ${a}$. How many times does it coincide in one full turn?", "Reka bentuk bertindih dengan dirinya setiap kali diputarkan melalui ${a}$. Berapa kali ia bertindih dalam satu pusingan penuh?"],
    ];
    return { q: fill(r.pick(forms), { a: degTex(k) }), a: T(`${k}`), w: W(T('Order $= \\dfrac{360^\\circ}{\\text{smallest angle}}$', 'Peringkat $= \\dfrac{360^\\circ}{\\text{sudut terkecil}}$'), `$= \\dfrac{360^\\circ}{${degTex(k)}} = ${k}$`), sp: 's' };
  });
  E115.push((r) => { // T/F bank
    const bank = [
      ['Every shape has rotational symmetry of order at least 1.', 'Setiap bentuk mempunyai simetri putaran sekurang-kurangnya peringkat 1.', true, 'A full turn of $360^\\circ$ always maps a shape onto itself.', 'Pusingan penuh $360^\\circ$ sentiasa memetakan bentuk kepada dirinya.'],
      ['A rectangle that is not a square has rotational symmetry of order 4.', 'Segi empat tepat yang bukan segi empat sama mempunyai simetri putaran peringkat 4.', false, 'Its order is 2 (a quarter-turn does not fit it onto itself).', 'Peringkatnya ialah 2 (suku pusingan tidak memadankannya dengan dirinya).'],
      ['A regular hexagon has rotational symmetry of order 6.', 'Heksagon sekata mempunyai simetri putaran peringkat 6.', true, 'A regular polygon with $n$ sides has order $n$.', 'Poligon sekata dengan $n$ sisi mempunyai peringkat $n$.'],
      ['A parallelogram has rotational symmetry of order 2.', 'Segi empat selari mempunyai simetri putaran peringkat 2.', true, 'It fits onto itself after a half-turn about its centre.', 'Ia bertindih dengan dirinya selepas separuh pusingan pada pusatnya.'],
      ['An isosceles triangle has rotational symmetry of order 3.', 'Segi tiga sama kaki mempunyai simetri putaran peringkat 3.', false, 'Only an equilateral triangle has order 3; an isosceles triangle has order 1.', 'Hanya segi tiga sama sisi yang mempunyai peringkat 3; segi tiga sama kaki mempunyai peringkat 1.'],
      ['The smallest angle of rotational symmetry of a square is $90^\\circ$.', 'Sudut simetri putaran terkecil bagi segi empat sama ialah $90^\\circ$.', true, '$360^\\circ \\div 4 = 90^\\circ$.', '$360^\\circ \\div 4 = 90^\\circ$.'],
      ['The letter H has rotational symmetry of order 2.', 'Huruf H mempunyai simetri putaran peringkat 2.', true, 'It looks the same after a half-turn.', 'Ia kelihatan sama selepas separuh pusingan.'],
      ['A shape with rotational symmetry of order 5 has a smallest angle of $50^\\circ$.', 'Bentuk dengan peringkat simetri putaran 5 mempunyai sudut terkecil $50^\\circ$.', false, '$360^\\circ \\div 5 = 72^\\circ$.', '$360^\\circ \\div 5 = 72^\\circ$.'],
      ['A shape can be turned about its centre and land exactly on itself several times in one full turn if its order is greater than 1.', 'Suatu bentuk boleh diputarkan pada pusatnya dan tepat bertindih dengan dirinya beberapa kali dalam satu pusingan penuh jika peringkatnya lebih daripada 1.', true, 'The order counts the number of times it coincides with itself.', 'Peringkat mengira bilangan kali ia bertindih dengan dirinya.'],
      ['The letter L has rotational symmetry of order 2.', 'Huruf L mempunyai simetri putaran peringkat 2.', false, 'It only fits onto itself after a full turn, so its order is 1.', 'Ia hanya bertindih dengan dirinya selepas satu pusingan penuh, jadi peringkatnya 1.'],
      ['The centre of rotational symmetry of a figure is the point about which it is turned.', 'Pusat simetri putaran bagi suatu rajah ialah titik yang menjadi pusat putaran rajah itu.', true, 'That is the definition.', 'Itulah takrifnya.'],
      ['A kite has rotational symmetry of order 2.', 'Layang-layang mempunyai simetri putaran peringkat 2.', false, 'A kite has no half-turn symmetry; its order is 1.', 'Layang-layang tidak mempunyai simetri separuh pusingan; peringkatnya 1.'],
    ];
    const b = r.pick(bank);
    return { q: T(`True or false? ${b[0]}`, `Benar atau palsu? ${b[1]}`), a: T(`${b[2] ? 'True' : 'False'}. ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}. ${b[4]}`), w: W(T('The order is the number of positions in one full turn where the figure looks the same, and the smallest angle is $360^\\circ \\div \\text{order}$.', 'Peringkat ialah bilangan kedudukan dalam satu pusingan penuh yang menjadikan rajah kelihatan sama, dan sudut terkecil ialah $360^\\circ \\div \\text{peringkat}$.'), T(`${b[2] ? 'True' : 'False'}: ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}: ${b[4]}`)), sp: 's' };
  });
  E115.push((r) => { // fill in
    const bank = [
      ['Complete: the number of times a figure fits onto itself in one full turn is called its ______ of rotational symmetry.', 'Lengkapkan: bilangan kali suatu rajah bertindih dengan dirinya dalam satu pusingan penuh dipanggil ______ simetri putarannya.', 'order', 'peringkat'],
      ['Complete: a figure with order 4 fits onto itself after every ____ degrees.', 'Lengkapkan: rajah peringkat 4 bertindih dengan dirinya setiap ____ darjah.', '90', '90'],
      ['Complete: a figure with order 2 fits onto itself after a ______ turn.', 'Lengkapkan: rajah peringkat 2 bertindih dengan dirinya selepas ______ pusingan.', 'half', 'separuh'],
      ['Complete: a figure that only fits onto itself after $360^\\circ$ has rotational symmetry of order ____.', 'Lengkapkan: rajah yang hanya bertindih dengan dirinya selepas $360^\\circ$ mempunyai simetri putaran peringkat ____.', '1', '1'],
      ['Complete: the smallest angle of rotational symmetry equals $360^\\circ$ divided by the ______.', 'Lengkapkan: sudut simetri putaran terkecil sama dengan $360^\\circ$ dibahagi dengan ______.', 'order', 'peringkat'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('Recall: the order counts the coincidences in one full turn, the smallest angle is $360^\\circ \\div \\text{order}$, order 2 means a half-turn, and order 1 means only a full turn works.', 'Ingat: peringkat mengira bilangan pertindihan dalam satu pusingan penuh, sudut terkecil ialah $360^\\circ \\div \\text{peringkat}$, peringkat 2 bermakna separuh pusingan, dan peringkat 1 bermakna hanya satu pusingan penuh berfungsi.'), T(`The word that fits is "${b[2]}".`, `Perkataan yang sesuai ialah "${b[3]}".`)), sp: 's' };
  });
  E115.push((r) => { // classify shapes: which have order > 1
    const pool = r.sample(SHAPE, 4);
    need(pool.some((s) => s[2] > 1) && pool.some((s) => s[2] === 1));
    const list = pool.map((s) => s[0]).join(', '), listM = pool.map((s) => s[1]).join(', ');
    const yes = pool.filter((s) => s[2] > 1);
    return { q: T(`Which of these shapes have rotational symmetry of order greater than 1: ${list}?`, `Antara bentuk berikut, yang manakah mempunyai simetri putaran peringkat lebih daripada 1: ${listM}?`), a: T(yes.map((s) => s[0]).join('; '), yes.map((s) => s[1]).join('; ')), w: W(T('Check each shape: does it coincide with itself before a full turn is complete?', 'Semak setiap bentuk: adakah ia bertindih dengan dirinya sebelum satu pusingan penuh selesai?'), T(pool.map((s) => `${s[0]}: order ${s[2]}`).join('; '), pool.map((s) => `${s[1]}: peringkat ${s[2]}`).join('; ')), T(`Order greater than 1: ${yes.map((s) => s[0]).join('; ')}.`, `Peringkat lebih daripada 1: ${yes.map((s) => s[1]).join('; ')}.`)), sp: 's' };
  });
  E115.push((r) => { // figure yes/no: rotational symmetry?
    const k = r.pick([4, 6, 6, 8]);
    const sym = r.chance();
    const kind = r.pick(['sectors', 'dots']);
    const on = kind === 'dots' ? 2 : 2, off = kind === 'dots' ? 1 : 0;
    const seq = Array.from({ length: k }, (_, i) => (sym ? (i % 2 === 0 ? on : off) : (i === 0 ? on : off)));
    const q = kind === 'dots'
      ? T(`The diagram shows a ring of ${k} equally spaced dots, some filled and some empty. Does the pattern have rotational symmetry of order greater than 1? Give a reason.`, `Rajah menunjukkan gelang ${k} titik berjarak sama, sebahagiannya berisi dan sebahagian lagi kosong. Adakah corak itu mempunyai simetri putaran peringkat lebih daripada 1? Berikan sebab.`)
      : T(`The diagram shows a circle divided into ${k} equal sectors, some shaded. Does the pattern have rotational symmetry of order greater than 1? Give a reason.`, `Rajah menunjukkan bulatan yang dibahagikan kepada ${k} sektor sama, sebahagiannya berlorek. Adakah corak itu mempunyai simetri putaran peringkat lebih daripada 1? Berikan sebab.`);
    return { q, fig: symFig({ kind, k, seq }), a: sym ? T(`Yes: the pattern repeats every 2 parts, so its order is ${k / 2}.`, `Ya: corak itu berulang setiap 2 bahagian, jadi peringkatnya ${k / 2}.`) : T('No: only one part is different, so only a full turn maps the pattern onto itself (order 1).', 'Tidak: hanya satu bahagian berbeza, jadi hanya satu pusingan penuh memetakan corak itu kepada dirinya (peringkat 1).'), w: W(T(`The design is made of ${k} equal parts, so one part is a turn of $${degTex(k)}$.`, `Reka bentuk terdiri daripada ${k} bahagian sama, jadi satu bahagian ialah putaran $${degTex(k)}$.`), sym ? T(`The colouring repeats every 2 parts, so a turn of 2 parts $= ${degTex(k / 2)}$ maps it onto itself: order ${k / 2}.`, `Pewarnaan berulang setiap 2 bahagian, jadi putaran 2 bahagian $= ${degTex(k / 2)}$ memetakannya kepada dirinya: peringkat ${k / 2}.`) : T('Only one part is different, so any turn less than a full turn moves it onto a part that is not the same: order 1.', 'Hanya satu bahagian berbeza, jadi sebarang putaran kurang daripada satu pusingan penuh menggerakkannya ke bahagian yang tidak sama: peringkat 1.')), sp: 's' };
  });
  E115.push((r) => { // times coincide list
    const k = pkK(r, [3, 4, 5, 6, 8]);
    const angs = Array.from({ length: k }, (_, i) => n(round((360 * (i + 1)) / k, 1)) + '^\\circ').join(',\\ ');
    return { q: T(`A design has rotational symmetry of order ${k}. Through which angles between $0^\\circ$ and $360^\\circ$ (including $360^\\circ$) does it fit onto itself?`, `Reka bentuk mempunyai simetri putaran peringkat ${k}. Melalui sudut yang manakah antara $0^\\circ$ dan $360^\\circ$ (termasuk $360^\\circ$) ia bertindih dengan dirinya?`), a: T(`$${angs}$`), w: W(T(`Order ${k} means it coincides every $360^\\circ \\div ${k} = ${degTex(k)}$.`, `Peringkat ${k} bermakna ia bertindih setiap $360^\\circ \\div ${k} = ${degTex(k)}$.`), T(`So list the multiples of $${degTex(k)}$ up to $360^\\circ$:`, `Jadi senaraikan gandaan $${degTex(k)}$ sehingga $360^\\circ$:`), `$${angs}$`), sp: 's' };
  });
  E115.push((r) => { // MCQ order of regular polygon
    const s = r.pick(SHAPE.filter((x) => x[2] >= 3 && x[0].startsWith('regular') || x[0] === 'square' || x[0] === 'equilateral triangle'));
    const wr = [s[2] + 1, s[2] * 2, s[2] - 1 > 0 ? s[2] - 1 : s[2] + 2].filter((v, i, a) => v !== s[2] && a.indexOf(v) === i);
    while (wr.length < 3) wr.push(s[2] + wr.length + 2);
    const m = mcq(r, T(`${s[2]}`, `${s[2]}`), wr.slice(0, 3).map((v) => T(`${v}`, `${v}`)));
    return { q: T(`What is the order of rotational symmetry of a ${s[0]}?${m.opts.en}`, `Apakah peringkat simetri putaran bagi ${s[1]}?${m.opts.ms}`), a: m.ans, w: W(T('A regular polygon with $n$ sides has rotational symmetry of order $n$.', 'Poligon sekata dengan $n$ sisi mempunyai simetri putaran peringkat $n$.'), T(`So a ${s[0]} has order ${s[2]}. Answer ${m.letter}.`, `Jadi ${s[1]} mempunyai peringkat ${s[2]}. Jawapan ${m.letter}.`)), sp: 's' };
  });


  /** order of rotational symmetry of a polygon given by its vertices (about the centroid of the vertices); tests 90 and 180 deg */
  const polyOrder = (P) => {
    const cx = P.reduce((s, p) => s + p[0], 0) / P.length, cy = P.reduce((s, p) => s + p[1], 0) / P.length;
    const has = (q) => P.some((p) => Math.abs(p[0] - q[0]) < 1e-9 && Math.abs(p[1] - q[1]) < 1e-9);
    const rot = (p, a) => (a === 90 ? [cx - (p[1] - cy), cy + (p[0] - cx)] : [2 * cx - p[0], 2 * cy - p[1]]);
    if (P.every((p) => has(rot(p, 90)))) return 4;
    if (P.every((p) => has(rot(p, 180)))) return 2;
    return 1;
  };
  const CPOLY = [ // en, ms, builder(h,k,a,b)
    { en: 'a rectangle', ms: 'sebuah segi empat tepat', f: (h, k, a, b) => [[h - a, k - b], [h + a, k - b], [h + a, k + b], [h - a, k + b]], ok: (a, b) => a !== b },
    { en: 'a square', ms: 'sebuah segi empat sama', f: (h, k, a) => [[h - a, k - a], [h + a, k - a], [h + a, k + a], [h - a, k + a]], ok: () => true },
    { en: 'a quadrilateral', ms: 'sebuah sisi empat', f: (h, k, a) => [[h + a, k], [h, k + a], [h - a, k], [h, k - a]], ok: () => true },
    { en: 'a quadrilateral', ms: 'sebuah sisi empat', f: (h, k, a, b) => [[h + a, k], [h, k + b], [h - a, k], [h, k - b]], ok: (a, b) => a !== b },
    { en: 'a kite', ms: 'sebuah layang-layang', f: (h, k, a, b) => [[h, k + b + 1], [h + a, k], [h, k - b], [h - a, k]], ok: () => true },
    { en: 'a triangle', ms: 'sebuah segi tiga', f: (h, k, a, b) => [[h - a, k], [h + a, k], [h, k + b]], ok: () => true },
    { en: 'a quadrilateral', ms: 'sebuah sisi empat', f: (h, k, a, b) => [[h - a - 1, k - b], [h + a - 1, k - b], [h + a + 1, k + b], [h - a + 1, k + b]], ok: () => true },
  ];
  const cpoly = (r) => retry(() => {
    const c = r.pick(CPOLY), h = r.int(-3, 3), k = r.int(-3, 3), a = r.int(1, 3), b = r.int(1, 3);
    need(c.ok(a, b));
    const P = c.f(h, k, a, b);
    need(inb(P, 9) && Math.abs(area2(P)) >= 4);
    return { c, P, ord: polyOrder(P) };
  });

  /* ---- medium ---- */
  M115.push((r) => { // regular polygon / order -> angle
    const k = pkK(r, [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20]);
    const forms = [
      ["Find the smallest angle of rotational symmetry of a regular polygon with {k} sides.", "Cari sudut simetri putaran terkecil bagi poligon sekata yang mempunyai {k} sisi."],
      ["A regular polygon with {k} sides is turned about its centre. Through what smallest positive angle does it look unchanged?", "Poligon sekata {k} sisi diputarkan pada pusatnya. Melalui sudut positif terkecil berapakah ia kelihatan tidak berubah?"],
      ["What fraction of a full turn is the smallest turn that maps a regular polygon with {k} sides onto itself, and how many degrees is this?", "Berapakah pecahan pusingan penuh bagi putaran terkecil yang memetakan poligon sekata {k} sisi kepada dirinya, dan berapa darjah?"],
    ];
    const f = r.pick(forms);
    return { q: fill(f, { k: String(k) }), a: f === forms[2] ? T(`$\\dfrac{1}{${k}}$ of a turn $= ${degTex(k)}$`) : T(`$${degTex(k)}$`), w: W(T(`A regular polygon with ${k} sides has rotational symmetry of order ${k}.`, `Poligon sekata dengan ${k} sisi mempunyai simetri putaran peringkat ${k}.`), `$360^\\circ \\div ${k} = ${degTex(k)}$`), sp: 's' };
  });
  M115.push((r) => { // angle -> order in a context
    const k = pkK(r, [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24]);
    const ctx = [
      ['A decorative plate pattern fits onto itself every ${a}$ as it is turned.', 'Corak pada pinggan hiasan bertindih dengan dirinya setiap ${a}$ apabila diputarkan.'],
      ['A logo is made by repeating one shape around a point; the logo looks unchanged each time it is turned by ${a}$.', 'Sebuah logo dibuat dengan mengulang satu bentuk mengelilingi satu titik; logo kelihatan tidak berubah setiap kali diputarkan sebanyak ${a}$.'],
      ['A rotating sprinkler head has identical nozzles spaced ${a}$ apart around a circle.', 'Kepala penyiram berputar mempunyai muncung yang serupa berjarak ${a}$ antara satu sama lain mengelilingi bulatan.'],
      ['A wheel has identical spokes with ${a}$ between neighbouring spokes.', 'Sebuah roda mempunyai jejari yang serupa dengan ${a}$ antara jejari bersebelahan.'],
    ];
    const c = r.pick(ctx);
    return { q: fill([c[0] + ' What is the order of rotational symmetry?', c[1] + ' Apakah peringkat simetri putarannya?'], { a: degTex(k) }), a: T(`${k}`), w: W(T('Order $= 360^\\circ \\div \\text{smallest angle}$', 'Peringkat $= 360^\\circ \\div \\text{sudut terkecil}$'), `$360^\\circ \\div ${degTex(k)} = ${k}$`), sp: 's' };
  });
  M115.push((r) => { // smallest angle of an object
    const o = r.pick(OBJ.filter((x) => x[2] > 1));
    const forms = [
      ["Find the smallest angle through which {x} can be turned so that it looks the same as before.", "Cari sudut terkecil yang boleh digunakan untuk memutarkan {x} supaya kelihatan sama seperti sebelumnya."],
      ["By what angle does {x} need to be turned, at least, to coincide with its original position? Work out the order first.", "Berapakah sudut minimum {x} perlu diputarkan supaya bertindih dengan kedudukan asalnya? Cari peringkat dahulu."],
    ];
    const f = r.pick(forms);
    return { q: fill(f, { x: T(o[0], o[1]) }), a: T(`Order ${o[2]}, so $${degTex(o[2])}$`, `Peringkat ${o[2]}, jadi $${degTex(o[2])}$`), w: W(T(`It looks the same in ${o[2]} positions during one full turn, so its order is ${o[2]}.`, `Ia kelihatan sama dalam ${o[2]} kedudukan sepanjang satu pusingan penuh, jadi peringkatnya ialah ${o[2]}.`), `$360^\\circ \\div ${o[2]} = ${degTex(o[2])}$`), sp: 's' };
  });
  M115.push((r) => { // which angles are symmetry angles
    const k = pkK(r, [3, 4, 5, 6, 8, 9, 10, 12]);
    const base = 360 / k;
    const yes = r.sample([1, 2, 3, 4, 5].filter((m) => m * base < 360).map((m) => m * base), 2);
    const cand = [base * r.pick([0.5, 1.5, 2.5]), base + 10, base - 5 > 0 ? base - 5 : base + 5].filter((v) => v % base !== 0 && v < 360);
    need(cand.length >= 2 && yes.length === 2);
    const list = r.shuffle(yes.concat(cand.slice(0, 2)).map((v) => round(v, 1)));
    need(new Set(list).size === 4);
    const good = list.filter((v) => Math.abs(v / base - Math.round(v / base)) < 1e-9);
    return { q: T(`A design has rotational symmetry of order ${k}. Which of these angles (in degrees) map the design onto itself: ${list.map((v) => '$' + n(v) + '^\\circ$').join(', ')}?`, `Sebuah reka bentuk mempunyai simetri putaran peringkat ${k}. Antara sudut berikut (dalam darjah), yang manakah memetakan reka bentuk itu kepada dirinya: ${list.map((v) => '$' + n(v) + '^\\circ$').join(', ')}?`), a: T(good.map((v) => `$${n(v)}^\\circ$`).join(', '), good.map((v) => `$${n(v)}^\\circ$`).join(', ')), w: W(T(`The smallest angle is $360^\\circ \\div ${k} = ${degTex(k)}$.`, `Sudut terkecil ialah $360^\\circ \\div ${k} = ${degTex(k)}$.`), T('A rotation maps the design onto itself only if its angle is a multiple of that smallest angle.', 'Putaran memetakan reka bentuk kepada dirinya hanya jika sudutnya gandaan sudut terkecil itu.'), T(`Multiples in the list: ${good.map((v) => '$' + n(v) + '^\\circ$').join(', ')}.`, `Gandaan dalam senarai: ${good.map((v) => '$' + n(v) + '^\\circ$').join(', ')}.`)), sp: 's' };
  });
  M115.push((r) => { // sectors figure: order & angle
    const k = r.pick([4, 6, 8, 9, 10, 12]);
    const per = r.pick(divisors(k).filter((d) => d >= 1 && d < k && d <= 4));
    const base = Array.from({ length: per }, (_, i) => (i === 0 ? 2 : r.pick([0, 1])));
    const seq = Array.from({ length: k }, (_, i) => base[i % per]);
    const ord = seqOrder(seq);
    const kind = r.pick(['sectors', 'pinwheel', 'petals']);
    const forms = [
      ["The diagram shows a design with {k} equal parts, coloured in a repeating pattern. State its order of rotational symmetry and the smallest angle of rotation.", "Rajah menunjukkan reka bentuk dengan {k} bahagian sama, diwarnakan dalam corak berulang. Nyatakan peringkat simetri putarannya dan sudut putaran terkecil."],
      ["A circular design has {k} equal parts with a repeating colour pattern (see the diagram). Find its order of rotational symmetry, and the smallest angle that fits it onto itself.", "Sebuah reka bentuk bulat mempunyai {k} bahagian sama dengan corak warna berulang (lihat rajah). Cari peringkat simetri putarannya, dan sudut terkecil yang memadankannya dengan dirinya."],
    ];
    return { q: fill(r.pick(forms), { k: String(k) }), fig: symFig({ kind, k, seq }), a: T(`Order ${ord}; smallest angle $${degTex(ord)}$`, `Peringkat ${ord}; sudut terkecil $${degTex(ord)}$`), w: W(T(`The design has ${k} equal parts and the colouring repeats every ${k / ord} of them.`, `Reka bentuk mempunyai ${k} bahagian sama dan pewarnaan berulang setiap ${k / ord} bahagian.`), T(`So the order is $${k} \\div ${k / ord} = ${ord}$.`, `Jadi peringkatnya ialah $${k} \\div ${k / ord} = ${ord}$.`), `$360^\\circ \\div ${ord} = ${degTex(ord)}$`), sp: 'm' };
  });
  M115.push((r) => { // ring of dots
    const k = r.pick([6, 8, 9, 10, 12]);
    const per = r.pick(divisors(k).filter((d) => d >= 2 && d < k && d <= 4));
    const base = Array.from({ length: per }, (_, i) => (i === 0 ? 2 : 1));
    const seq = Array.from({ length: k }, (_, i) => base[i % per]);
    const ord = seqOrder(seq);
    return { q: T(`The diagram shows a ring of ${k} equally spaced dots, some filled and some empty. What is the order of rotational symmetry of the pattern?`, `Rajah menunjukkan gelang ${k} titik berjarak sama, sebahagiannya berisi dan sebahagian lagi kosong. Apakah peringkat simetri putaran corak itu?`), fig: symFig({ kind: 'dots', k, seq }), a: T(`${ord}`), w: W(T(`There are ${k} dots and the filled/empty pattern repeats every ${k / ord} dots.`, `Terdapat ${k} titik dan corak berisi/kosong berulang setiap ${k / ord} titik.`), T(`So the order is $${k} \\div ${k / ord} = ${ord}$ (a turn of $${degTex(ord)}$).`, `Jadi peringkatnya ialah $${k} \\div ${k / ord} = ${ord}$ (putaran $${degTex(ord)}$).`)), sp: 's' };
  });
  M115.push((r) => { // coordinates: order of a polygon
    const s = cpoly(r);
    const names = nm(r, s.P.length);
    const forms = [
      ["The vertices of {nn} ${o}$ are {vl}. State the order of its rotational symmetry.", "Bucu {nn} ${o}$ ialah {vl}. Nyatakan peringkat simetri putarannya."],
      ["Plot the points {vl} and join them in order to make {nn} ${o}$. What is the order of rotational symmetry of the shape?", "Plot titik {vl} dan sambungkannya mengikut urutan untuk membentuk {nn} ${o}$. Apakah peringkat simetri putaran bentuk itu?"],
    ];
    const kind = T(s.c.en, s.c.ms);
    return { q: fill(r.pick(forms), { nn: kind, o: names.join(''), vl: M(vlist(names, s.P)) }), fig: fig({ O: s.P, names }), a: T(`${s.ord}`), w: W(T('The centre of the shape is the mean of the vertices; test turns about it.', 'Pusat bentuk ialah min bucu-bucunya; uji putaran padanya.'), s.ord === 4 ? T('A quarter-turn about the centre sends every vertex onto another vertex, so the order is 4.', 'Suku pusingan pada pusat menghantar setiap bucu ke bucu lain, jadi peringkatnya 4.') : s.ord === 2 ? T('A half-turn about the centre sends every vertex onto another vertex, but a quarter-turn does not: the order is 2.', 'Separuh pusingan pada pusat menghantar setiap bucu ke bucu lain, tetapi suku pusingan tidak: peringkatnya 2.') : T('Neither a half-turn nor a quarter-turn sends the vertices onto vertices, so only a full turn works: the order is 1.', 'Baik separuh pusingan mahupun suku pusingan tidak menghantar bucu ke bucu, jadi hanya satu pusingan penuh berfungsi: peringkatnya 1.')), sp: 's' };
  });
  M115.push((r) => { // table of shapes
    const pool = r.sample(SHAPE.filter((x) => x[2] < 13), 4);
    const rows = pool.map((s) => [s[0], '?', '?']);
    const rowsM = pool.map((s) => [s[1], '?', '?']);
    return { q: T(`Complete the table.<br>${SPM.table(rows, { head: ['Shape', 'Order of rotational symmetry', 'Smallest angle of rotation'] })}`, `Lengkapkan jadual.<br>${SPM.table(rowsM, { head: ['Bentuk', 'Peringkat simetri putaran', 'Sudut putaran terkecil'] })}`), a: T(pool.map((s) => `${s[0]}: ${s[2]}, ${s[2] === 1 ? '360' : deg(s[2])}°`).join('; '), pool.map((s) => `${s[1]}: ${s[2]}, ${s[2] === 1 ? '360' : deg(s[2])}°`).join('; ')), w: W(T('For each shape, count the positions in one full turn, then divide $360^\\circ$ by that order.', 'Bagi setiap bentuk, kira kedudukan dalam satu pusingan penuh, kemudian bahagikan $360^\\circ$ dengan peringkat itu.'), ...pool.map((s) => T(`${s[0]}: order ${s[2]}, $360^\\circ \\div ${s[2]} = ${s[2] === 1 ? '360' : deg(s[2])}^\\circ$`, `${s[1]}: peringkat ${s[2]}, $360^\\circ \\div ${s[2]} = ${s[2] === 1 ? '360' : deg(s[2])}^\\circ$`))), sp: 'm' };
  });
  M115.push((r) => { // misconception errors
    const bank = [
      ['A student says that a rectangle (not a square) has rotational symmetry of order 4 because it has 4 sides. Is the student right? Explain.', 'Seorang murid berkata segi empat tepat (bukan segi empat sama) mempunyai simetri putaran peringkat 4 kerana ia mempunyai 4 sisi. Adakah murid itu betul? Terangkan.', 'No. The order is the number of times the shape fits onto itself in a full turn, not the number of sides. A rectangle only does so after $180^\\circ$ and $360^\\circ$, so its order is 2.', 'Tidak. Peringkat ialah bilangan kali bentuk bertindih dengan dirinya dalam satu pusingan penuh, bukan bilangan sisi. Segi empat tepat hanya begitu selepas $180^\\circ$ dan $360^\\circ$, jadi peringkatnya 2.'],
      ['A student says a regular pentagon has rotational symmetry of order 5 and a smallest angle of $5^\\circ$. Find the mistake and give the correct angle.', 'Seorang murid berkata pentagon sekata mempunyai simetri putaran peringkat 5 dan sudut terkecil $5^\\circ$. Cari kesilapan dan berikan sudut yang betul.', 'The order 5 is correct but the angle is $360^\\circ \\div 5 = 72^\\circ$, not $5^\\circ$.', 'Peringkat 5 adalah betul tetapi sudutnya ialah $360^\\circ \\div 5 = 72^\\circ$, bukan $5^\\circ$.'],
      ['A student says an isosceles triangle has rotational symmetry of order 2 because it has a line of symmetry. Explain the mistake.', 'Seorang murid berkata segi tiga sama kaki mempunyai simetri putaran peringkat 2 kerana ia mempunyai satu paksi simetri. Terangkan kesilapan itu.', 'A line of symmetry is a different kind of symmetry (reflection). An isosceles triangle does not fit onto itself after a half-turn, so its order of rotational symmetry is 1.', 'Paksi simetri ialah jenis simetri yang berbeza (pantulan). Segi tiga sama kaki tidak bertindih dengan dirinya selepas separuh pusingan, jadi peringkat simetri putarannya ialah 1.'],
      ['A student calculates the smallest angle of rotational symmetry of a design of order 8 as $8 \\div 360$. What is the mistake and what is the correct angle?', 'Seorang murid menghitung sudut simetri putaran terkecil bagi reka bentuk peringkat 8 sebagai $8 \\div 360$. Apakah kesilapan itu dan apakah sudut yang betul?', 'The division is the wrong way round. The angle is $360^\\circ \\div 8 = 45^\\circ$.', 'Pembahagian itu terbalik. Sudutnya ialah $360^\\circ \\div 8 = 45^\\circ$.'],
      ['A student says that the letter S has no rotational symmetry because it has no lines of symmetry. Is this correct?', 'Seorang murid berkata huruf S tiada simetri putaran kerana ia tiada paksi simetri. Adakah ini betul?', 'No. The letter S looks the same after a half-turn, so it has rotational symmetry of order 2, even though it has no line of symmetry.', 'Tidak. Huruf S kelihatan sama selepas separuh pusingan, jadi ia mempunyai simetri putaran peringkat 2, walaupun ia tiada paksi simetri.'],
      ['A student says that a parallelogram (not a rhombus) has 2 lines of symmetry and so its order of rotational symmetry is 2. Is the reasoning correct?', 'Seorang murid berkata segi empat selari (bukan rombus) mempunyai 2 paksi simetri dan jadi peringkat simetri putarannya 2. Adakah alasan itu betul?', 'The order 2 is correct, but the reasoning is wrong: a parallelogram has no lines of symmetry. It has order 2 because it fits onto itself after a half-turn.', 'Peringkat 2 adalah betul, tetapi alasannya salah: segi empat selari tiada paksi simetri. Ia berperingkat 2 kerana bertindih dengan dirinya selepas separuh pusingan.'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('The order is the number of times the shape coincides with itself in one full turn — not the number of sides and not the number of lines of symmetry; the smallest angle is $360^\\circ \\div \\text{order}$.', 'Peringkat ialah bilangan kali bentuk bertindih dengan dirinya dalam satu pusingan penuh — bukan bilangan sisi dan bukan bilangan paksi simetri; sudut terkecil ialah $360^\\circ \\div \\text{peringkat}$.'), T(b[2], b[3])), sp: 'm' };
  });
  M115.push((r) => { // MCQ smallest angle
    const s = r.pick(SHAPE.filter((x) => x[2] >= 3));
    const ans = 360 / s[2];
    const wr = [180 / s[2], s[2] * 10, 360 - ans].map((v) => round(v, 1)).filter((v, i, a) => v !== round(ans, 1) && a.indexOf(v) === i);
    need(wr.length === 3);
    const m = mcq(r, T(`$${deg(s[2])}^\\circ$`), wr.map((v) => T(`$${n(v)}^\\circ$`)));
    return { q: T(`What is the smallest angle of rotational symmetry of ${shT(s).en}?${m.opts.en}`, `Apakah sudut simetri putaran terkecil bagi ${s[1]}?${m.opts.ms}`), a: m.ans, w: W(T(`${SPM.cap(s[0])} has rotational symmetry of order ${s[2]}.`, `${SPM.cap(s[1])} mempunyai simetri putaran peringkat ${s[2]}.`), `$360^\\circ \\div ${s[2]} = ${deg(s[2])}^\\circ$`, T(`So the answer is ${m.letter}.`, `Jadi jawapannya ialah ${m.letter}.`)), sp: 's' };
  });
  M115.push((r) => { // yes/no for a given angle
    const k = pkK(r, [3, 4, 5, 6, 8, 9, 10, 12]);
    const base = 360 / k;
    const yes = r.chance();
    const ang = yes ? base * r.int(2, Math.min(k - 1, 4)) : base * r.int(1, 3) + r.pick([base / 2, 10]);
    need(ang < 360 && Math.abs(ang / base - Math.round(ang / base)) < 1e-9 === yes);
    return { q: T(`A figure has rotational symmetry of order ${k}. Will it fit onto itself if it is rotated through $${n(round(ang, 1))}^\\circ$? Explain.`, `Sebuah rajah mempunyai simetri putaran peringkat ${k}. Adakah ia bertindih dengan dirinya jika diputarkan melalui $${n(round(ang, 1))}^\\circ$? Terangkan.`), a: yes ? T(`Yes, because $${n(round(ang, 1))}^\\circ$ is ${round(ang / base)} times the smallest angle $${degTex(k)}$.`, `Ya, kerana $${n(round(ang, 1))}^\\circ$ ialah ${round(ang / base)} kali sudut terkecil $${degTex(k)}$.`) : T(`No, because $${n(round(ang, 1))}^\\circ$ is not a multiple of the smallest angle $${degTex(k)}$.`, `Tidak, kerana $${n(round(ang, 1))}^\\circ$ bukan gandaan sudut terkecil $${degTex(k)}$.`), w: W(T(`Smallest angle $= 360^\\circ \\div ${k} = ${degTex(k)}$.`, `Sudut terkecil $= 360^\\circ \\div ${k} = ${degTex(k)}$.`), T('A rotation fits the figure onto itself only when its angle is a multiple of that smallest angle.', 'Putaran memadankan rajah dengan dirinya hanya apabila sudutnya gandaan sudut terkecil itu.'), yes ? T(`$${n(round(ang, 1))}^\\circ = ${round(ang / base)} \\times ${degTex(k)}$, so it does fit.`, `$${n(round(ang, 1))}^\\circ = ${round(ang / base)} \\times ${degTex(k)}$, jadi ia bertindih.`) : T(`$${n(round(ang, 1))}^\\circ$ is not a multiple of $${degTex(k)}$, so it does not fit.`, `$${n(round(ang, 1))}^\\circ$ bukan gandaan $${degTex(k)}$, jadi ia tidak bertindih.`)), sp: 's' };
  });
  M115.push((r) => { // petals angle between
    const k = pkK(r, [5, 6, 8, 9, 10, 12]);
    const c = r.pick([
      ['A flower has {k} identical petals evenly spaced round its centre. Find the angle between the centre-lines of two neighbouring petals.', 'Sekuntum bunga mempunyai {k} kelopak serupa yang berjarak sama mengelilingi pusatnya. Cari sudut antara garis pusat dua kelopak bersebelahan.'],
      ['A hand fan-shaped ornament has {k} identical blades round a centre. What is the angle between neighbouring blades?', 'Sebuah perhiasan berbentuk kipas mempunyai {k} bilah serupa mengelilingi satu pusat. Berapakah sudut antara bilah bersebelahan?'],
      ['A cake is cut into {k} equal slices. What is the angle at the centre of each slice, and what is the order of rotational symmetry of the cake?', 'Sebiji kek dipotong kepada {k} keping sama besar. Berapakah sudut pada pusat setiap keping, dan berapakah peringkat simetri putaran kek itu?'],
    ]);
    const asks2 = /order/.test(c[0]);
    return { q: fill(c, { k: String(k) }), a: asks2 ? T(`$${degTex(k)}$; order ${k}`, `$${degTex(k)}$; peringkat ${k}`) : T(`$${degTex(k)}$`), w: W(T(`The ${k} identical parts are evenly spaced round the centre, so they share the $360^\\circ$ equally.`, `${k} bahagian serupa itu berjarak sama mengelilingi pusat, jadi ia berkongsi $360^\\circ$ sama rata.`), `$360^\\circ \\div ${k} = ${degTex(k)}$`, ...(asks2 ? [T(`The order of rotational symmetry is also ${k}.`, `Peringkat simetri putarannya juga ${k}.`)] : [])), sp: 's' };
  });
  M115.push((r) => { // lines and order
    const s = r.pick(SHAPE);
    const forms = [
      ["State (a) the number of lines of symmetry and (b) the order of rotational symmetry of {x}.", "Nyatakan (a) bilangan paksi simetri dan (b) peringkat simetri putaran bagi {x}."],
    ];
    return { q: fill(forms[0], { x: shT(s) }), a: T(`(a) ${s[3]} (b) ${s[2]}`), w: W(T(`(a) ${SPM.cap(s[0])} has ${s[3]} line(s) of symmetry (fold lines that map it onto itself).`, `(a) ${SPM.cap(s[1])} mempunyai ${s[3]} paksi simetri (garis lipatan yang memetakannya kepada dirinya).`), T(`(b) It fits onto itself ${s[2]} time(s) in one full turn, so the order of rotational symmetry is ${s[2]}.`, `(b) Ia bertindih dengan dirinya ${s[2]} kali dalam satu pusingan penuh, jadi peringkat simetri putarannya ialah ${s[2]}.`)), sp: 's' };
  });
  M115.push((r) => { // polygon sides from smallest angle
    const k = pkK(r, [5, 6, 8, 9, 10, 12, 15, 18, 20, 24]);
    const forms = [
      ["The smallest angle of rotational symmetry of a regular polygon is ${a}$. How many sides does the polygon have?", "Sudut simetri putaran terkecil bagi suatu poligon sekata ialah ${a}$. Berapakah bilangan sisi poligon itu?"],
      ["A regular polygon fits onto itself when rotated through ${a}$, and through no smaller positive angle. Name the polygon by finding its number of sides.", "Poligon sekata bertindih dengan dirinya apabila diputarkan melalui ${a}$, dan tiada sudut positif yang lebih kecil. Namakan poligon itu dengan mencari bilangan sisinya."],
    ];
    return { q: fill(r.pick(forms), { a: degTex(k) }), a: T(`${k} sides`, `${k} sisi`), w: W(T('Order $= 360^\\circ \\div \\text{smallest angle}$, and a regular polygon of order $n$ has $n$ sides.', 'Peringkat $= 360^\\circ \\div \\text{sudut terkecil}$, dan poligon sekata peringkat $n$ mempunyai $n$ sisi.'), `$360^\\circ \\div ${degTex(k)} = ${k}$`), sp: 's' };
  });
  M115.push((r) => { // pinwheel: rotational but no reflection symmetry
    const k = pkK(r, [3, 4, 5, 6]);
    return { q: T(`The diagram shows a pinwheel design with ${k} identical blades. State (a) its order of rotational symmetry and (b) whether it has any line of symmetry.`, `Rajah menunjukkan reka bentuk kincir dengan ${k} bilah serupa. Nyatakan (a) peringkat simetri putarannya dan (b) sama ada ia mempunyai paksi simetri.`), fig: symFig({ kind: 'pinwheel', k }), a: T(`(a) ${k} (b) No: every blade is slanted the same way, so a mirror line would reverse the slant.`, `(a) ${k} (b) Tidak: setiap bilah condong ke arah yang sama, jadi garis cermin akan menyongsangkan kecondongan itu.`), w: W(T(`(a) The ${k} blades are identical and evenly spaced, so the design fits onto itself every $${degTex(k)}$: order ${k}.`, `(a) ${k} bilah itu serupa dan berjarak sama, jadi reka bentuk bertindih dengan dirinya setiap $${degTex(k)}$: peringkat ${k}.`), T('(b) A reflection would reverse the slant of every blade, so no mirror line maps the design onto itself: it has rotational symmetry but no line symmetry.', '(b) Pantulan akan menyongsangkan kecondongan setiap bilah, jadi tiada garis cermin memetakan reka bentuk kepada dirinya: ia mempunyai simetri putaran tetapi tiada simetri paksi.')), sp: 's' };
  });
  M115.push((r) => { // word symmetric under half turn
    const good = ['NOON', 'SOS', 'XOX', 'ZOZ', 'HIH', 'NON', 'SIS', 'HIHIH'], bad = ['MOM', 'DAD', 'TOT', 'BOB', 'MAM', 'ZAP', 'PIP', 'SUN'];
    const g = r.pick(good), b = r.sample(bad, 2);
    const list = r.shuffle([g].concat(b));
    return { q: T(`Which of these words, written in capital letters, looks the same when the page is turned upside down (a half-turn about its centre): ${list.join(', ')}?`, `Antara perkataan berikut, yang ditulis dalam huruf besar, yang manakah kelihatan sama apabila halaman diterbalikkan (separuh pusingan pada pusatnya): ${list.join(', ')}?`), a: T(`${g}: each letter looks the same after a half-turn and the order of the letters is reversed symmetrically.`, `${g}: setiap huruf kelihatan sama selepas separuh pusingan dan susunan huruf disongsangkan secara simetri.`), w: W(T('A word survives a half-turn only if every letter does (H, I, N, O, S, X, Z) and the word reads the same when its letters are taken in reverse order.', 'Perkataan kekal selepas separuh pusingan hanya jika setiap hurufnya begitu (H, I, N, O, S, X, Z) dan perkataan itu sama apabila hurufnya dibaca dari belakang.'), T(`Testing each option, only ${g} passes both tests.`, `Menguji setiap pilihan, hanya ${g} lulus kedua-dua ujian.`)), sp: 's' };
  });


  /* ---- advanced 11.5 ---- */
  A115.push((r) => { // complete a partial design
    const k = pkK(r, [4, 5, 6, 8, 9, 10, 12]);
    const m = r.int(1, Math.min(3, k - 2));
    const kind = r.pick(['pinwheel', 'petals', 'blades']);
    const forms = [
      ["The diagram shows {m} of the identical blades of a design that must have rotational symmetry of order {k}. How many more identical blades must be drawn, and what is the angle between neighbouring blades?", "Rajah menunjukkan {m} daripada bilah serupa sebuah reka bentuk yang mesti mempunyai simetri putaran peringkat {k}. Berapa bilah serupa lagi yang perlu dilukis, dan berapakah sudut antara bilah bersebelahan?"],
      ["Part of a design is drawn ({m} of its identical parts). To give it rotational symmetry of order exactly {k}, how many parts must be added? Through what angle is each part turned from the previous one?", "Sebahagian reka bentuk dilukis ({m} daripada bahagian serupanya). Untuk memberikannya simetri putaran peringkat tepat {k}, berapa bahagian yang perlu ditambah? Melalui sudut berapakah setiap bahagian diputarkan daripada yang sebelumnya?"],
    ];
    return { q: fill(r.pick(forms), { m: String(m), k: String(k) }), fig: symFig({ kind, k, only: m }), a: T(`${k - m} more blades; each is turned $${degTex(k)}$ from the previous one.`, `${k - m} bilah lagi; setiap bilah diputarkan $${degTex(k)}$ daripada yang sebelumnya.`), w: W(T(`Order ${k} needs ${k} identical parts altogether, and ${m} are already drawn.`, `Peringkat ${k} memerlukan ${k} bahagian serupa kesemuanya, dan ${m} telah dilukis.`), `$${k} - ${m} = ${k - m}$`, T(`Each part is turned $360^\\circ \\div ${k} = ${degTex(k)}$ from the previous one.`, `Setiap bahagian diputarkan $360^\\circ \\div ${k} = ${degTex(k)}$ daripada yang sebelumnya.`)), sp: 'm' };
  });
  A115.push((r) => { // longer colour pattern (order from period)
    const k = r.pick([6, 8, 9, 10, 12, 15]);
    const divs = divisors(k).filter((d) => d >= 2 && d < k);
    const per = r.pick(divs);
    const base = Array.from({ length: per }, (_, i) => (i === 0 ? 2 : r.pick([0, 1, 2])));
    const seq = Array.from({ length: k }, (_, i) => base[i % per]);
    const ord = seqOrder(seq);
    const kind = r.pick(['sectors', 'pinwheel']);
    const forms = [
      ["A design has {k} identical parts arranged round a centre, coloured with up to three tones as shown. Find its order of rotational symmetry and justify that no smaller positive turn maps it onto itself.", "Sebuah reka bentuk mempunyai {k} bahagian serupa yang disusun mengelilingi satu pusat, diwarnakan dengan sehingga tiga warna seperti ditunjukkan. Cari peringkat simetri putarannya dan justifikasikan bahawa tiada putaran positif yang lebih kecil memetakannya kepada dirinya."],
    ];
    return { q: fill(forms[0], { k: String(k) }), fig: symFig({ kind, k, seq }), a: T(`Order ${ord}: the colouring repeats every ${k / ord} parts, so the smallest turn is ${k / ord} part(s) $= ${degTex(ord)}$. A smaller turn would move at least one part onto a part of a different tone.`, `Peringkat ${ord}: pewarnaan berulang setiap ${k / ord} bahagian, jadi putaran terkecil ialah ${k / ord} bahagian $= ${degTex(ord)}$. Putaran yang lebih kecil akan menggerakkan sekurang-kurangnya satu bahagian ke atas bahagian yang berlainan warna.`), w: W(T(`Look for the shortest block of parts after which the colouring repeats: here it repeats every ${k / ord} of the ${k} parts.`, `Cari blok bahagian terpendek yang selepasnya pewarnaan berulang: di sini ia berulang setiap ${k / ord} daripada ${k} bahagian.`), T(`So the order is $${k} \\div ${k / ord} = ${ord}$ and the smallest turn is $${degTex(ord)}$.`, `Jadi peringkatnya ialah $${k} \\div ${k / ord} = ${ord}$ dan putaran terkecil ialah $${degTex(ord)}$.`), T('Any smaller turn would carry some part onto a part of a different tone, so no smaller angle works.', 'Sebarang putaran yang lebih kecil akan membawa sesetengah bahagian ke bahagian berlainan warna, jadi tiada sudut yang lebih kecil berfungsi.')), sp: 'm' };
  });
  A115.push((r) => { // combined designs: gcd
    const a = r.pick([2, 3, 4, 6, 8, 9, 12]), b = r.pick([2, 3, 4, 6, 8, 9, 12]);
    need(a !== b);
    const g = SPM.gcd(a, b);
    return { q: T(`A design of order ${a} and another design of order ${b} share the same centre and are turned together as one rigid piece. What is the smallest positive angle through which both designs fit onto themselves at the same time? Explain.`, `Sebuah reka bentuk peringkat ${a} dan sebuah lagi reka bentuk peringkat ${b} berkongsi pusat yang sama dan diputarkan bersama sebagai satu keping tegar. Berapakah sudut positif terkecil yang menyebabkan kedua-dua reka bentuk bertindih dengan diri masing-masing pada masa yang sama? Terangkan.`), a: T(`$${n(360 / g)}^\\circ$: the turn must be a multiple of $${degTex(a)}$ and of $${degTex(b)}$, and the smallest common multiple of these angles is $${n(360 / g)}^\\circ$ (so the pair together behaves like a design of order ${g}).`, `$${n(360 / g)}^\\circ$: putaran mestilah gandaan $${degTex(a)}$ dan $${degTex(b)}$, dan gandaan sepunya terkecil bagi sudut ini ialah $${n(360 / g)}^\\circ$ (jadi pasangan itu bersama-sama berkelakuan seperti reka bentuk peringkat ${g}).`), w: W(T(`The first design fits onto itself only for multiples of $360^\\circ \\div ${a} = ${degTex(a)}$.`, `Reka bentuk pertama bertindih dengan dirinya hanya bagi gandaan $360^\\circ \\div ${a} = ${degTex(a)}$.`), T(`The second needs multiples of $360^\\circ \\div ${b} = ${degTex(b)}$.`, `Yang kedua memerlukan gandaan $360^\\circ \\div ${b} = ${degTex(b)}$.`), T(`The smallest angle in both lists is $${n(360 / g)}^\\circ$, where ${g} is the highest common factor of ${a} and ${b}.`, `Sudut terkecil dalam kedua-dua senarai ialah $${n(360 / g)}^\\circ$, dengan ${g} ialah faktor sepunya terbesar bagi ${a} dan ${b}.`)), sp: 'l' };
  });
  A115.push((r) => { // fits after two angles -> order
    const k = r.pick([4, 5, 6, 8, 9, 10, 12, 15, 18, 20]);
    const base = 360 / k;
    const m1 = r.int(2, 5), m2 = r.int(2, 5);
    need(SPM.gcd(m1, m2) === 1 && m1 !== m2);
    const a1 = base * m1, a2 = base * m2;
    need(a1 < 360 && a2 < 360 && Number.isInteger(a1) && Number.isInteger(a2));
    return { q: T(`A design fits onto itself when rotated through $${a1}^\\circ$ and also when rotated through $${a2}^\\circ$. What is the smallest possible order of rotational symmetry of the design, and what is the corresponding angle?`, `Sebuah reka bentuk bertindih dengan dirinya apabila diputarkan melalui $${a1}^\\circ$ dan juga apabila diputarkan melalui $${a2}^\\circ$. Berapakah peringkat simetri putaran terkecil yang mungkin bagi reka bentuk itu, dan berapakah sudut yang sepadan?`), a: T(`The smallest angle of symmetry divides both $${a1}^\\circ$ and $${a2}^\\circ$, so it is their highest common factor $${n(SPM.gcd(a1, a2))}^\\circ$; order $= 360 \\div ${SPM.gcd(a1, a2)} = ${360 / SPM.gcd(a1, a2)}$.`, `Sudut simetri terkecil membahagi $${a1}^\\circ$ dan $${a2}^\\circ$, jadi ia ialah faktor sepunya terbesar $${n(SPM.gcd(a1, a2))}^\\circ$; peringkat $= 360 \\div ${SPM.gcd(a1, a2)} = ${360 / SPM.gcd(a1, a2)}$.`), w: W(T('Every symmetry angle is a multiple of the smallest one, so the smallest angle must divide both given angles.', 'Setiap sudut simetri ialah gandaan sudut terkecil, jadi sudut terkecil mesti membahagi kedua-dua sudut yang diberi.'), `$\\text{HCF}(${a1},\\ ${a2}) = ${SPM.gcd(a1, a2)}$`, `$360 \\div ${SPM.gcd(a1, a2)} = ${360 / SPM.gcd(a1, a2)}$`, T(`So the smallest possible order is ${360 / SPM.gcd(a1, a2)}, with smallest angle $${SPM.gcd(a1, a2)}^\\circ$.`, `Jadi peringkat terkecil yang mungkin ialah ${360 / SPM.gcd(a1, a2)}, dengan sudut terkecil $${SPM.gcd(a1, a2)}^\\circ$.`)), sp: 'l' };
  });
  A115.push((r) => { // coordinates: verify order with rotation of vertices
    const s = cpoly(r);
    const names = nm(r, s.P.length);
    const cx = s.P.reduce((a, p) => a + p[0], 0) / s.P.length, cy = s.P.reduce((a, p) => a + p[1], 0) / s.P.length;
    const M0 = [cx, cy];
    need(Number.isInteger(cx * 2) && Number.isInteger(cy * 2));
    const half = s.P.map((p) => [2 * cx - p[0], 2 * cy - p[1]]);
    const why = s.ord === 4
      ? T(`Turning $90^\\circ$ about $${pt(M0)}$ maps the vertex set onto itself (each vertex moves to the next one), and so does $180^\\circ$: the order is 4.`, `Putaran $90^\\circ$ pada $${pt(M0)}$ memetakan set bucu kepada dirinya (setiap bucu bergerak ke bucu seterusnya), begitu juga $180^\\circ$: peringkatnya 4.`)
      : s.ord === 2
        ? T(`A half-turn about $${pt(M0)}$ maps $${names[0]}$ to $${pt(half[0])}$, which is a vertex, and every other vertex likewise, but a quarter-turn does not map the vertices onto vertices: the order is 2.`, `Separuh pusingan pada $${pt(M0)}$ memetakan $${names[0]}$ ke $${pt(half[0])}$, iaitu satu bucu, dan setiap bucu lain juga begitu, tetapi suku pusingan tidak memetakan bucu ke bucu: peringkatnya 2.`)
        : T('No half-turn or quarter-turn about the centre maps the vertices onto vertices, so the shape only fits onto itself after a full turn: the order is 1.', 'Tiada separuh pusingan atau suku pusingan pada pusat yang memetakan bucu ke bucu, jadi bentuk itu hanya bertindih dengan dirinya selepas satu pusingan penuh: peringkatnya 1.');
    return { q: T(`The vertices of ${s.c.en} are ${'$' + vlist(names, s.P) + '$'}. By testing whether a half-turn and a quarter-turn about the centre of the shape map the vertices onto the vertices, find the order of rotational symmetry.`, `Bucu ${s.c.ms} ialah ${'$' + vlist(names, s.P) + '$'}. Dengan menguji sama ada separuh pusingan dan suku pusingan pada pusat bentuk itu memetakan bucu ke bucu, cari peringkat simetri putaran.`), fig: fig({ O: s.P, names }), a: T(`${s.ord}. ${why.en}`, `${s.ord}. ${why.ms}`), w: W(T(`Centre of the shape (the mean of the vertices): $${pt(M0)}$`, `Pusat bentuk (min bucu): $${pt(M0)}$`), T(`Half-turn about it: $${names[0]}${pt(s.P[0])} \\to ${pt(half[0])}$`, `Separuh pusingan padanya: $${names[0]}${pt(s.P[0])} \\to ${pt(half[0])}$`), why), sp: 'l' };
  });
  A115.push((r) => { // explain bank
    const bank = [
      ['Explain why no rotational symmetry angle can be smaller than $360^\\circ \\div \\text{order}$.', 'Terangkan mengapa tiada sudut simetri putaran boleh lebih kecil daripada $360^\\circ \\div \\text{peringkat}$.', 'The order is the number of times the figure fits onto itself in one full turn, and these positions are equally spaced. If a smaller turn worked, there would be more positions and the order would be larger.', 'Peringkat ialah bilangan kali rajah bertindih dengan dirinya dalam satu pusingan penuh, dan kedudukan ini berjarak sama. Jika putaran yang lebih kecil berfungsi, kedudukan akan lebih banyak dan peringkat akan lebih besar.'],
      ['Explain why a rectangle that is not a square has order 2 and not order 4.', 'Terangkan mengapa segi empat tepat yang bukan segi empat sama mempunyai peringkat 2 dan bukan peringkat 4.', 'After a quarter-turn the long sides would lie where the short sides were, so the rectangle does not coincide with itself; only the half-turn and full turn work.', 'Selepas suku pusingan, sisi panjang akan berada di tempat sisi pendek, jadi segi empat tepat tidak bertindih dengan dirinya; hanya separuh pusingan dan pusingan penuh yang berfungsi.'],
      ['A figure has rotational symmetry of order 6. Explain why it also fits onto itself after a rotation of $180^\\circ$.', 'Sebuah rajah mempunyai simetri putaran peringkat 6. Terangkan mengapa ia juga bertindih dengan dirinya selepas putaran $180^\\circ$.', '$180^\\circ = 3 \\times 60^\\circ$ is a multiple of the smallest angle $60^\\circ$, so it is also a symmetry turn.', '$180^\\circ = 3 \\times 60^\\circ$ ialah gandaan sudut terkecil $60^\\circ$, jadi ia juga putaran simetri.'],
      ['Why does every regular polygon with $n$ sides have rotational symmetry of order $n$?', 'Mengapakah setiap poligon sekata dengan $n$ sisi mempunyai simetri putaran peringkat $n$?', 'Turning it about its centre through $360^\\circ \\div n$ moves each vertex to the next vertex and the sides to the next sides, and this can be done $n$ times before the shape returns to where it started.', 'Memutarkannya pada pusat melalui $360^\\circ \\div n$ menggerakkan setiap bucu ke bucu seterusnya dan sisi ke sisi seterusnya, dan ini boleh dibuat $n$ kali sebelum bentuk kembali ke tempat asalnya.'],
      ['Give an example of a shape that has a line of symmetry but rotational symmetry of order 1, and an example with rotational symmetry of order 2 but no line of symmetry.', 'Berikan satu contoh bentuk yang mempunyai paksi simetri tetapi simetri putaran peringkat 1, dan satu contoh dengan simetri putaran peringkat 2 tetapi tiada paksi simetri.', 'An isosceles triangle (or a kite) has a line of symmetry but order 1. A parallelogram (or the letter S) has order 2 but no line of symmetry.', 'Segi tiga sama kaki (atau layang-layang) mempunyai paksi simetri tetapi peringkat 1. Segi empat selari (atau huruf S) mempunyai peringkat 2 tetapi tiada paksi simetri.'],
      ['A design has rotational symmetry of order 1. Does this mean that it is not symmetrical under any rotation at all? Explain.', 'Sebuah reka bentuk mempunyai simetri putaran peringkat 1. Adakah ini bermakna ia tidak simetri di bawah sebarang putaran? Terangkan.', 'Every figure maps onto itself after a full $360^\\circ$ turn, so order 1 means that this is the only such turn: there is no non-trivial rotational symmetry.', 'Setiap rajah dipetakan kepada dirinya selepas putaran penuh $360^\\circ$, jadi peringkat 1 bermakna itulah satu-satunya putaran: tiada simetri putaran bukan remeh.'],
      ['A student says that a figure with order 4 has no half-turn symmetry. Show that this is wrong.', 'Seorang murid berkata rajah peringkat 4 tiada simetri separuh pusingan. Tunjukkan bahawa ini salah.', 'The smallest angle is $90^\\circ$ and $180^\\circ = 2 \\times 90^\\circ$, so the figure also fits onto itself after a half-turn.', 'Sudut terkecil ialah $90^\\circ$ dan $180^\\circ = 2 \\times 90^\\circ$, jadi rajah itu juga bertindih dengan dirinya selepas separuh pusingan.'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('Key facts: the symmetry positions in one full turn are equally spaced, the smallest angle is $360^\\circ \\div \\text{order}$, every multiple of it is also a symmetry angle, and rotational symmetry is not the same as line symmetry.', 'Fakta utama: kedudukan simetri dalam satu pusingan penuh berjarak sama, sudut terkecil ialah $360^\\circ \\div \\text{peringkat}$, setiap gandaannya juga sudut simetri, dan simetri putaran bukan sama dengan simetri paksi.'), T(b[2], b[3])), sp: 'm' };
  });
  A115.push((r) => { // statements selection
    const bank = [
      ['A square has 4 lines of symmetry and rotational symmetry of order 4.', 'Segi empat sama mempunyai 4 paksi simetri dan simetri putaran peringkat 4.', true],
      ['A parallelogram that is not a rhombus has 2 lines of symmetry.', 'Segi empat selari yang bukan rombus mempunyai 2 paksi simetri.', false],
      ['The order of rotational symmetry of a regular polygon equals its number of sides.', 'Peringkat simetri putaran poligon sekata sama dengan bilangan sisinya.', true],
      ['A figure of order 5 fits onto itself after a rotation of $144^\\circ$.', 'Rajah peringkat 5 bertindih dengan dirinya selepas putaran $144^\\circ$.', true],
      ['A figure of order 5 fits onto itself after a rotation of $100^\\circ$.', 'Rajah peringkat 5 bertindih dengan dirinya selepas putaran $100^\\circ$.', false],
      ['A shape with rotational symmetry of order 3 must also have three lines of symmetry.', 'Bentuk dengan simetri putaran peringkat 3 mesti mempunyai tiga paksi simetri.', false],
      ['The letter Z has rotational symmetry of order 2.', 'Huruf Z mempunyai simetri putaran peringkat 2.', true],
      ['An equilateral triangle has rotational symmetry of order 3.', 'Segi tiga sama sisi mempunyai simetri putaran peringkat 3.', true],
      ['A rectangle has rotational symmetry of order 4.', 'Segi empat tepat mempunyai simetri putaran peringkat 4.', false],
      ['A kite has rotational symmetry of order 2.', 'Layang-layang mempunyai simetri putaran peringkat 2.', false],
    ];
    const S4 = r.sample(bank, 4);
    need(S4.some((s) => s[2]) && S4.some((s) => !s[2]));
    const list = S4.map((s, i) => `<b>${'ABCD'[i]}.</b> ${s[0]}`).join('<br>'), listM = S4.map((s, i) => `<b>${'ABCD'[i]}.</b> ${s[1]}`).join('<br>');
    const ok = S4.map((s, i) => (s[2] ? 'ABCD'[i] : '')).join('');
    return { q: T(`Which of these statements are true?<br>${list}`, `Antara pernyataan berikut, yang manakah benar?<br>${listM}`), a: T(`${ok.split('').join(', ')} ${ok.length === 1 ? 'is' : 'are'} true; the others are false.`, `${ok.split('').join(', ')} benar; yang lain palsu.`), w: W(T('Use these facts: a regular polygon with $n$ sides has order $n$ and $n$ lines of symmetry; a rectangle and a parallelogram have order 2; a kite has order 1; a rotation angle works only if it is a multiple of $360^\\circ \\div \\text{order}$; and rotational symmetry does not imply line symmetry.', 'Gunakan fakta ini: poligon sekata dengan $n$ sisi mempunyai peringkat $n$ dan $n$ paksi simetri; segi empat tepat dan segi empat selari mempunyai peringkat 2; layang-layang mempunyai peringkat 1; sudut putaran berfungsi hanya jika ia gandaan $360^\\circ \\div \\text{peringkat}$; dan simetri putaran tidak bermakna wujud simetri paksi.'), T(`Checking each statement against these: ${ok.split('').join(', ')} agree with them.`, `Menyemak setiap pernyataan dengan fakta ini: ${ok.split('').join(', ')} menepatinya.`)), sp: 'm' };
  });
  A115.push((r) => { // shaded regular polygon, alternating triangles
    const k = r.pick([6, 8, 9, 10, 12]);
    const per = r.pick(divisors(k).filter((d) => d >= 2 && d < k && d <= 4));
    const seq = Array.from({ length: k }, (_, i) => (i % per === 0 ? 2 : 0));
    const ord = seqOrder(seq);
    const name = { 6: ['hexagon', 'heksagon'], 8: ['octagon', 'oktagon'], 9: ['nonagon', 'nonagon'], 10: ['decagon', 'dekagon'], 12: ['dodecagon', 'dodekagon'] }[k];
    const every = T(`every ${per === 2 ? 'second' : per === 3 ? 'third' : 'fourth'} triangle`, `setiap segi tiga ${per === 2 ? 'kedua' : per === 3 ? 'ketiga' : 'keempat'}`);
    return { q: T(`A regular ${name[0]} is divided into ${k} identical triangles by lines from its centre to its vertices. ${SPM.cap(every.en)} is shaded, starting from one triangle. What is the order of rotational symmetry of the shaded pattern, and what is the smallest angle?`, `Sebuah ${name[1]} sekata dibahagikan kepada ${k} segi tiga serupa oleh garis dari pusatnya ke bucunya. ${SPM.cap(every.ms)} dilorek, bermula dari satu segi tiga. Apakah peringkat simetri putaran corak berlorek itu, dan apakah sudut terkecilnya?`), a: T(`Order ${ord}; smallest angle $${degTex(ord)}$`, `Peringkat ${ord}; sudut terkecil $${degTex(ord)}$`), w: W(T(`The ${k} triangles each subtend $360^\\circ \\div ${k} = ${degTex(k)}$ at the centre.`, `Setiap satu daripada ${k} segi tiga itu mencangkum $360^\\circ \\div ${k} = ${degTex(k)}$ pada pusat.`), T(`The shading repeats every ${per} triangles, so a turn of ${per} triangles maps the pattern onto itself.`, `Lorekan berulang setiap ${per} segi tiga, jadi putaran ${per} segi tiga memetakan corak kepada dirinya.`), T(`Order $= ${k} \\div ${per} = ${ord}$, smallest angle $= ${per} \\times ${degTex(k)} = ${degTex(ord)}$.`, `Peringkat $= ${k} \\div ${per} = ${ord}$, sudut terkecil $= ${per} \\times ${degTex(k)} = ${degTex(ord)}$.`)), sp: 'm' };
  });
  A115.push((r) => { // multi-part
    const k = pkK(r, [5, 6, 8, 9, 10, 12]);
    const angs = Array.from({ length: Math.min(3, k - 1) }, (_, i) => n(round((360 * (i + 1)) / k, 1)) + '^\\circ');
    return { q: T(`A regular polygon has rotational symmetry of order ${k}. (a) How many sides does it have? (b) What is its smallest angle of rotation? (c) List its first ${angs.length} positive rotation angles. (d) How many lines of symmetry does it have?`, `Sebuah poligon sekata mempunyai simetri putaran peringkat ${k}. (a) Berapakah bilangan sisinya? (b) Apakah sudut putaran terkecilnya? (c) Senaraikan ${angs.length} sudut putaran positif pertamanya. (d) Berapakah bilangan paksi simetrinya?`), a: T(`(a) ${k} (b) $${degTex(k)}$ (c) $${angs.join(',\\ ')}$ (d) ${k}`), w: W(T(`(a) A regular polygon of order ${k} has ${k} sides.`, `(a) Poligon sekata peringkat ${k} mempunyai ${k} sisi.`), `(b) $360^\\circ \\div ${k} = ${degTex(k)}$`, T(`(c) The rotation angles are the multiples of $${degTex(k)}$: $${angs.join(',\\ ')}$`, `(c) Sudut putarannya ialah gandaan $${degTex(k)}$: $${angs.join(',\\ ')}$`), T(`(d) A regular polygon with ${k} sides also has ${k} lines of symmetry.`, `(d) Poligon sekata dengan ${k} sisi juga mempunyai ${k} paksi simetri.`)), sp: 'l' };
  });
  A115.push((r) => { // fraction of a turn
    const k = pkK(r, [3, 4, 5, 6, 8, 9, 10, 12]);
    const m = r.int(2, k - 1);
    return { q: T(`A design has rotational symmetry of order ${k}. It is rotated ${m} times in succession through its smallest angle of rotational symmetry (each turn in the same direction). Through what total angle has it turned? Does it look the same as at the start? Explain.`, `Sebuah reka bentuk mempunyai simetri putaran peringkat ${k}. Ia diputarkan ${m} kali berturut-turut melalui sudut simetri putaran terkecilnya (setiap putaran pada arah yang sama). Melalui jumlah sudut berapakah ia telah berputar? Adakah ia kelihatan sama seperti pada mulanya? Terangkan.`), a: T(`$${m} \\times ${degTex(k)} = ${n(round(m * 360 / k, 1))}^\\circ$. Yes: each smallest turn fits the design onto itself, so any number of them does.`, `$${m} \\times ${degTex(k)} = ${n(round(m * 360 / k, 1))}^\\circ$. Ya: setiap putaran terkecil memadankan reka bentuk dengan dirinya, jadi sebarang bilangan putaran sedemikian juga berfungsi.`), w: W(T(`Smallest angle $= 360^\\circ \\div ${k} = ${degTex(k)}$.`, `Sudut terkecil $= 360^\\circ \\div ${k} = ${degTex(k)}$.`), `$${m} \\times ${degTex(k)} = ${n(round(m * 360 / k, 1))}^\\circ$`, T('Each single smallest turn already maps the design onto itself, so repeating it any number of times does too.', 'Setiap putaran terkecil tunggal sudah memetakan reka bentuk kepada dirinya, jadi mengulanginya berapa kali pun juga begitu.')), sp: 'm' };
  });
  A115.push((r) => { // order 7 etc with 1 dp
    const k = r.pick([7, 11, 13, 14]);
    return { q: T(`A regular polygon has ${k} sides. Find its smallest angle of rotational symmetry, correct to 1 decimal place, and explain why this angle is not a whole number of degrees.`, `Sebuah poligon sekata mempunyai ${k} sisi. Cari sudut simetri putaran terkecilnya, betul kepada 1 tempat perpuluhan, dan terangkan mengapa sudut ini bukan bilangan bulat darjah.`), a: T(`$360^\\circ \\div ${k} \\approx ${n(round(360 / k, 1))}^\\circ$; ${k} does not divide 360 exactly.`, `$360^\\circ \\div ${k} \\approx ${n(round(360 / k, 1))}^\\circ$; ${k} tidak membahagi 360 dengan tepat.`), w: W(T(`A regular polygon with ${k} sides has rotational symmetry of order ${k}.`, `Poligon sekata dengan ${k} sisi mempunyai simetri putaran peringkat ${k}.`), `$360^\\circ \\div ${k} \\approx ${n(round(360 / k, 1))}^\\circ$`, T(`${k} is not a factor of 360, so the division does not give a whole number of degrees.`, `${k} bukan faktor bagi 360, jadi pembahagian itu tidak memberikan bilangan bulat darjah.`)), sp: 's' };
  });

  /* ==================================================== 11.1 Transformations and isometries */
  const E111 = [], M111 = [], A111 = [];
  const TY = {
    translation: T('translation', 'translasi'), reflection: T('reflection', 'pantulan'), rotation: T('rotation', 'putaran'), enlargement: T('enlargement', 'pembesaran'),
  };
  const asymShape = (r, lim) => retry(() => (r.chance(0.6) ? scalene(r, lim, 3) : (() => { const t = r.int(0, 7); const b = (r.chance() ? BASES.hex[1] : BASES.hex[2]).map((p) => dih(p, t)); const mx = Math.min(...b.map((p) => p[0])), my = Math.min(...b.map((p) => p[1])); const B = b.map((p) => [p[0] - mx, p[1] - my]); const w = Math.max(...B.map((p) => p[0])), h = Math.max(...B.map((p) => p[1])); need(w <= 2 * lim && h <= 2 * lim); const ox = r.int(-lim, lim - w), oy = r.int(-lim, lim - h); return B.map((p) => [p[0] + ox, p[1] + oy]); })()));
  /** a random single isometry: returns { type, O, I, names, detail (bilingual, for description), ... } */
  const typeCase = (r, types, lim) => retry(() => {
    const type = r.pick(types), O = asymShape(r, lim || 3), names = nm(r, O.length);
    let I, det = {};
    if (type === 'translation') { const v = vec(r, 5, true); I = O.map((p) => addv(p, v)); det = { v, en: `the translation $${tv(v)}$`, ms: `translasi $${tv(v)}$` }; }
    else if (type === 'reflection') {
      const l = r.chance(0.5) ? r.pick(AX()) : mirror(r.pick(['x', 'y']), r.pick([-2, -1, 1, 2]));
      need(oneSide(O, l) && O.every((p) => ldist(p, l) >= 1));
      I = O.map((p) => reflect(p, l)); det = { l, en: `a reflection in ${l.name ? l.name.en : 'the line $' + l.eq + '$'}`, ms: `pantulan pada ${l.name ? l.name.ms : 'garis $' + l.eq + '$'}` };
    } else {
      const C = r.chance(0.5) ? [0, 0] : [r.int(-2, 2), r.int(-2, 2)], [a, d] = rAD(r, false);
      need(O.every((p) => !same(p, C)));
      I = O.map((p) => rotate(p, C, a, d)); det = { C, a, d, en: rotFull(a, d, C).en.replace(/^A r/, 'a r'), ms: rotFull(a, d, C).ms.replace(/^Putaran/, 'putaran') };
    }
    need(inb(I, 8) && O.every((p, i) => !same(p, I[i])) && O.every((p) => !I.some((q) => same(p, q))));
    return Object.assign({ type, O, I, names }, det);
  });
  const SCEN = [
    { t: 'translation', en: 'A lift moves straight up from the ground floor to the fifth floor.', ms: 'Sebuah lif bergerak lurus ke atas dari tingkat bawah ke tingkat lima.' },
    { t: 'translation', en: 'A drawer is pulled straight out of a desk.', ms: 'Sebuah laci ditarik lurus keluar dari sebuah meja.' },
    { t: 'translation', en: 'A sliding door is pushed open along its track.', ms: 'Pintu gelongsor ditolak terbuka di sepanjang landasnya.' },
    { t: 'translation', en: 'A book is pushed across a table without being turned.', ms: 'Sebuah buku ditolak melintasi meja tanpa diputar.' },
    { t: 'translation', en: 'A train travels along a straight track.', ms: 'Sebuah keretapi bergerak di sepanjang landasan yang lurus.' },
    { t: 'translation', en: 'A chess piece moves three squares straight forward.', ms: 'Sebuah buah catur bergerak tiga petak lurus ke hadapan.' },
    { t: 'translation', en: 'A picture on a computer screen is dragged 5 cm to the right.', ms: 'Sekeping gambar pada skrin komputer diseret 5 cm ke kanan.' },
    { t: 'translation', en: 'A box is carried straight up a conveyor belt.', ms: 'Sebuah kotak dibawa lurus ke atas pada tali sawat pengangkut.' },
    { t: 'translation', en: 'A lorry drives along a straight road (ignore the turning of its wheels).', ms: 'Sebuah lori dipandu di sepanjang jalan yang lurus (abaikan putaran rodanya).' },
    { t: 'reflection', en: 'Your image seen in a plane mirror.', ms: 'Imej anda yang dilihat dalam cermin satah.' },
    { t: 'reflection', en: 'The image of a tree in the still water of a lake.', ms: 'Imej sebatang pokok di dalam air tasik yang tenang.' },
    { t: 'reflection', en: 'A paper shape is folded along a line so that the two halves fit exactly on each other.', ms: 'Sekeping kertas berbentuk dilipat pada satu garis supaya kedua-dua bahagian bertindih tepat.' },
    { t: 'reflection', en: 'The left wing of a butterfly compared with its right wing.', ms: 'Sayap kiri seekor rama-rama dibandingkan dengan sayap kanannya.' },
    { t: 'reflection', en: 'A word printed on a glass window, read from the other side of the glass.', ms: 'Satu perkataan yang dicetak pada tingkap kaca, dibaca dari sebelah lain kaca itu.' },
    { t: 'reflection', en: 'A building seen in the glass wall of a neighbouring building.', ms: 'Sebuah bangunan yang kelihatan pada dinding kaca bangunan bersebelahan.' },
    { t: 'reflection', en: 'A cardboard triangle is flipped over onto its back, along one of its edges.', ms: 'Sebuah segi tiga kadbod dibalikkan ke bahagian belakangnya, pada salah satu tepinya.' },
    { t: 'rotation', en: 'The hands of a clock as time passes.', ms: 'Jarum jam apabila masa berlalu.' },
    { t: 'rotation', en: 'A Ferris wheel turning.', ms: 'Roda Ferris yang berputar.' },
    { t: 'rotation', en: 'A door swinging open on its hinges.', ms: 'Sebuah pintu terbuka berayun pada engselnya.' },
    { t: 'rotation', en: 'A ceiling fan spinning.', ms: 'Kipas siling yang berputar.' },
    { t: 'rotation', en: 'A steering wheel being turned.', ms: 'Stereng yang sedang diputarkan.' },
    { t: 'rotation', en: 'A tap handle turned to open the tap.', ms: 'Pemegang paip diputarkan untuk membuka paip.' },
    { t: 'rotation', en: 'A merry-go-round turning in a playground.', ms: 'Karusel yang berputar di taman permainan.' },
    { t: 'rotation', en: 'A bicycle pedal turning about the crank axle.', ms: 'Pedal basikal berputar pada gandar engkolnya.' },
    { t: 'rotation', en: 'A windmill blade turning in the wind.', ms: 'Bilah kincir angin berputar ditiup angin.' },
    { t: 'enlargement', en: 'A photograph is enlarged to twice its size.', ms: 'Sekeping gambar dibesarkan kepada dua kali ganda saiznya.' },
    { t: 'enlargement', en: 'A map is drawn at a scale of 1 : 50 000.', ms: 'Sebuah peta dilukis pada skala 1 : 50 000.' },
    { t: 'enlargement', en: 'A photocopier reduces a page to half of its size.', ms: 'Mesin fotostat mengecilkan sehelai kertas kepada separuh saiznya.' },
    { t: 'enlargement', en: 'A shape on a computer screen is zoomed in until it is three times as big.', ms: 'Satu bentuk pada skrin komputer dizum masuk sehingga menjadi tiga kali lebih besar.' },
    { t: 'enlargement', en: 'A rubber band is stretched to twice its length.', ms: 'Seutas gelang getah diregangkan kepada dua kali ganda panjangnya.' },
  ];
  const SCEN3 = SCEN.filter((s) => s.t !== 'enlargement');
  const scenText = (s) => T(s.en, s.ms);
  const isoOf = (t) => t !== 'enlargement';
  const PROP = { // property preserved? [translation, reflection, rotation]
    length: [T('lengths of sides', 'panjang sisi'), [true, true, true]],
    angle: [T('sizes of angles', 'saiz sudut'), [true, true, true]],
    area: [T('area', 'luas'), [true, true, true]],
    shape: [T('shape', 'bentuk'), [true, true, true]],
    orientation: [T('orientation (the way the shape faces)', 'orientasi (arah yang dihadapi bentuk)'), [true, false, false]],
    position: [T('position', 'kedudukan'), [false, false, false]],
  };
  const TYK = ['translation', 'reflection', 'rotation'];

  /* ---- easy ---- */
  E111.push((r) => { // classify a real-life scenario
    const s = r.pick(SCEN3);
    const forms = [
      ["Name the transformation (translation, reflection or rotation) shown by this situation: {s}", "Namakan transformasi (translasi, pantulan atau putaran) yang ditunjukkan oleh situasi ini: {s}"],
      ["{s} Which isometry describes the movement or image: translation, reflection or rotation?", "{s} Isometri manakah yang memerihalkan pergerakan atau imej itu: translasi, pantulan atau putaran?"],
      ["Is the following a translation, a reflection or a rotation? {s}", "Adakah yang berikut satu translasi, pantulan atau putaran? {s}"],
    ];
    return { q: fill(r.pick(forms), { s: scenText(s) }), a: TY[s.t], w: W(T('A slide with no turning is a translation, a flip over a line is a reflection, and a turn about a fixed point is a rotation.', 'Gelongsoran tanpa putaran ialah translasi, balikan pada satu garis ialah pantulan, dan putaran pada satu titik tetap ialah putaran.'), T(`This situation is a ${TY[s.t].en}.`, `Situasi ini ialah ${TY[s.t].ms}.`)), sp: 'xs' };
  });
  E111.push((r) => { // is it an isometry (scenario with all 4 types)
    const s = r.pick(SCEN);
    const forms = [
      ["Does this situation involve an isometry (a transformation that keeps size and shape)? {s} Give a reason.", "Adakah situasi ini melibatkan isometri (transformasi yang mengekalkan saiz dan bentuk)? {s} Berikan sebab."],
      ["{s} Is the object mapped onto an image of the same size and shape? Answer yes or no and say which transformation this is.", "{s} Adakah objek dipetakan kepada imej yang sama saiz dan bentuk? Jawab ya atau tidak dan nyatakan transformasi ini."],
    ];
    const iso = isoOf(s.t);
    return { q: fill(r.pick(forms), { s: scenText(s) }), a: iso ? T(`Yes: it is a ${TY[s.t].en}, which keeps size and shape.`, `Ya: ia ialah ${TY[s.t].ms}, yang mengekalkan saiz dan bentuk.`) : T('No: the size changes, so it is not an isometry (it is an enlargement or reduction).', 'Tidak: saiz berubah, jadi ia bukan isometri (ia ialah pembesaran atau pengecilan).'), w: W(T('An isometry keeps every length and angle, so the image is congruent to the object: translation, reflection and rotation are isometries, but an enlargement is not.', 'Isometri mengekalkan setiap panjang dan sudut, jadi imej kongruen dengan objek: translasi, pantulan dan putaran ialah isometri, tetapi pembesaran bukan.'), iso ? T(`This situation is a ${TY[s.t].en}, so the size and shape are kept.`, `Situasi ini ialah ${TY[s.t].ms}, jadi saiz dan bentuk dikekalkan.`) : T('Here the size changes, so the transformation is an enlargement or reduction, not an isometry.', 'Di sini saiz berubah, jadi transformasi itu ialah pembesaran atau pengecilan, bukan isometri.')), sp: 's' };
  });
  E111.push((r) => { // MCQ classification
    const s = r.pick(SCEN3);
    const wr = TYK.filter((t) => t !== s.t).map((t) => TY[t]).concat([TY.enlargement]).slice(0, 3);
    const m = mcq(r, TY[s.t], wr);
    return { q: T(`${s.en} This is an example of a:${m.opts.en}`, `${s.ms} Ini ialah contoh:${m.opts.ms}`), a: m.ans, w: W(T('Decide first whether the shape slides, flips over a line, turns about a point, or changes size.', 'Tentukan dahulu sama ada bentuk itu menggelongsor, membalik pada satu garis, berputar pada satu titik, atau berubah saiz.'), T(`Here it is a ${TY[s.t].en}, so the answer is ${m.letter}.`, `Di sini ia ialah ${TY[s.t].ms}, jadi jawapannya ialah ${m.letter}.`)), sp: 's' };
  });
  E111.push((r) => { // classify three at once
    const three = r.sample(SCEN, 3);
    const list = three.map((s, i) => `(${['i', 'ii', 'iii'][i]}) ${s.en}`).join('<br>'), listM = three.map((s, i) => `(${['i', 'ii', 'iii'][i]}) ${s.ms}`).join('<br>');
    return { q: T(`Match each situation with translation, reflection, rotation or enlargement.<br>${list}`, `Padankan setiap situasi dengan translasi, pantulan, putaran atau pembesaran.<br>${listM}`), a: T(three.map((s, i) => `(${['i', 'ii', 'iii'][i]}) ${TY[s.t].en}`).join('; '), three.map((s, i) => `(${['i', 'ii', 'iii'][i]}) ${TY[s.t].ms}`).join('; ')), w: W(T('Slide $=$ translation, flip $=$ reflection, turn $=$ rotation, change of size $=$ enlargement.', 'Gelongsor $=$ translasi, balik $=$ pantulan, putar $=$ putaran, perubahan saiz $=$ pembesaran.'), ...three.map((s, i) => T(`(${['i', 'ii', 'iii'][i]}) ${TY[s.t].en}`, `(${['i', 'ii', 'iii'][i]}) ${TY[s.t].ms}`))), sp: 'm' };
  });
  E111.push((r) => { // terms: object and image
    const c = typeCase(r, ['translation', 'reflection', 'rotation'], 3);
    const forms = [
      ["In the diagram, the solid shape ${o}$ is transformed onto the dashed shape ${i}$. Which shape is the object and which is the image?", "Dalam rajah, bentuk penuh ${o}$ ditransformasikan ke bentuk putus-putus ${i}$. Bentuk yang manakah objek dan yang manakah imej?"],
      ["A transformation maps shape ${o}$ (solid) onto shape ${i}$ (dashed). Name the object and name the image.", "Suatu transformasi memetakan bentuk ${o}$ (penuh) ke bentuk ${i}$ (putus-putus). Namakan objek dan namakan imej."],
    ];
    return { q: fill(r.pick(forms), { o: c.names.join(''), i: c.names.map((x) => x + "'").join('') }), fig: fig({ O: c.O, I: c.I, names: c.names }), a: T(`Object: $${c.names.join('')}$; image: $${c.names.map((x) => x + "'").join('')}$`, `Objek: $${c.names.join('')}$; imej: $${c.names.map((x) => x + "'").join('')}$`), w: W(T('The object is the original shape; the image is what it becomes after the transformation.', 'Objek ialah bentuk asal; imej ialah hasilnya selepas transformasi.'), T('In the diagram the solid shape is the object and the dashed shape, whose letters carry dashes, is the image.', 'Dalam rajah, bentuk penuh ialah objek dan bentuk putus-putus, yang hurufnya bertanda kanta, ialah imej.')), sp: 's' };
  });
  E111.push((r) => { // corresponding vertex
    const c = typeCase(r, TYK, 3), j = r.int(0, c.O.length - 1);
    const forms = [
      ["The diagram shows {nn} ${o}$ and its image under a transformation. Which point on the image corresponds to ${x}$?", "Rajah menunjukkan {nn} ${o}$ dan imejnya di bawah suatu transformasi. Titik yang manakah pada imej yang sepadan dengan ${x}$?"],
      ["Name the image of vertex ${x}$ in the diagram, where ${o}$ is the object.", "Namakan imej bagi bucu ${x}$ dalam rajah, dengan ${o}$ ialah objek."],
    ];
    return { q: fill(r.pick(forms), { nn: noun(c.O.length), o: c.names.join(''), x: c.names[j] }), fig: fig({ O: c.O, I: c.I, names: c.names }), a: T(`$${c.names[j]}'$`), w: W(T('Corresponding points carry the same letter, with a dash added on the image.', 'Titik sepadan membawa huruf yang sama, dengan tanda kanta ditambah pada imej.'), T(`So the image of $${c.names[j]}$ is $${c.names[j]}'$.`, `Jadi imej $${c.names[j]}$ ialah $${c.names[j]}'$.`)), sp: 'xs' };
  });
  E111.push((r) => { // identify the transformation from a figure (type only)
    const c = typeCase(r, TYK, 3);
    const forms = [
      ["The solid shape is mapped onto the dashed shape. Is the transformation a translation, a reflection or a rotation?", "Bentuk penuh dipetakan ke bentuk putus-putus. Adakah transformasi itu translasi, pantulan atau putaran?"],
      ["Look at the object ${o}$ and the image ${i}$. Name the isometry that maps ${o}$ onto ${i}$.", "Lihat objek ${o}$ dan imej ${i}$. Namakan isometri yang memetakan ${o}$ ke ${i}$."],
      ["Which of the three isometries (translation, reflection, rotation) has been used in the diagram?", "Antara tiga isometri (translasi, pantulan, putaran), yang manakah telah digunakan dalam rajah?"],
    ];
    return { q: fill(r.pick(forms), { o: c.names.join(''), i: c.names.map((x) => x + "'").join('') }), fig: fig({ O: c.O, I: c.I, names: c.names }), a: TY[c.type], w: W(T('Ask: is the shape only slid (translation), flipped over a line (reflection), or turned about a point (rotation)?', 'Tanya: adakah bentuk itu hanya digelongsor (translasi), dibalikkan pada satu garis (pantulan), atau diputar pada satu titik (putaran)?'), c.type === 'reflection' ? T('The image is a mirror image (the order of the letters is reversed).', 'Imej ialah imej cermin (susunan huruf disongsangkan).') : c.type === 'translation' ? T('The image is the same way round and every point moved the same way.', 'Imej menghadap arah yang sama dan setiap titik bergerak dengan cara yang sama.') : T('The image is turned but not flipped, and the vertices are not all displaced by the same vector.', 'Imej diputarkan tetapi tidak dibalikkan, dan bucunya tidak semuanya disesarkan oleh vektor yang sama.'), T(`So the transformation is a ${TY[c.type].en}.`, `Jadi transformasi itu ialah ${TY[c.type].ms}.`)), sp: 'xs' };
  });
  E111.push((r) => { // definitions MCQ
    const bank = [
      ['an isometry', 'isometri', 'a transformation that preserves lengths and angles, so the image is congruent to the object', 'transformasi yang mengekalkan panjang dan sudut, jadi imej kongruen dengan objek'],
      ['the image', 'imej', 'the shape obtained after a transformation', 'bentuk yang diperoleh selepas transformasi'],
      ['the object', 'objek', 'the original shape before a transformation', 'bentuk asal sebelum transformasi'],
      ['a translation', 'translasi', 'a transformation in which every point moves the same distance in the same direction', 'transformasi yang setiap titiknya bergerak dengan jarak dan arah yang sama'],
      ['a reflection', 'pantulan', 'a transformation that produces a mirror image in a line', 'transformasi yang menghasilkan imej cermin pada suatu garis'],
      ['a rotation', 'putaran', 'a transformation that turns every point through the same angle about a fixed point', 'transformasi yang memutarkan setiap titik melalui sudut yang sama pada satu titik tetap'],
    ];
    const b = r.pick(bank), others = bank.filter((x) => x !== b);
    const m = mcq(r, T(b[2], b[3]), r.sample(others, 3).map((x) => T(x[2], x[3])));
    return { q: T(`Which statement describes ${b[0]}?${m.opts.en}`, `Pernyataan yang manakah memerihalkan ${b[1]}?${m.opts.ms}`), a: m.ans, w: W(T(`Recall the definition of ${b[0]}.`, `Ingat takrif ${b[1]}.`), T(`It is ${b[2]}, so the answer is ${m.letter}.`, `Ia ialah ${b[3]}, jadi jawapannya ialah ${m.letter}.`)), sp: 's' };
  });
  E111.push((r) => { // preserved / not preserved
    const t = r.pick([0, 1, 2]), pk = r.pick(Object.keys(PROP));
    const p = PROP[pk], preserved = p[1][t], tn = TY[TYK[t]];
    let ans;
    if (preserved) ans = T('Yes, it is preserved.', 'Ya, ia dikekalkan.');
    else if (pk === 'position') ans = T('No: the image is in a different position from the object.', 'Tidak: imej berada pada kedudukan yang berbeza daripada objek.');
    else if (TYK[t] === 'reflection') ans = T('No: the image is a mirror image, so the orientation is reversed.', 'Tidak: imej ialah imej cermin, jadi orientasi disongsangkan.');
    else ans = T('No: the image is turned, so it faces a different way.', 'Tidak: imej diputarkan, jadi ia menghadap arah yang berbeza.');
    return { q: fill(["Is the {p} of a shape preserved (unchanged) by a {t}?", "Adakah {p} suatu bentuk dikekalkan (tidak berubah) oleh {t}?"], { p: p[0], t: tn }), a: ans, w: W(T('Every isometry preserves lengths, angles, area and shape. A translation also preserves orientation, while a reflection and a rotation change the way the shape faces; none of them preserves position.', 'Setiap isometri mengekalkan panjang, sudut, luas dan bentuk. Translasi juga mengekalkan orientasi, manakala pantulan dan putaran mengubah arah yang dihadapi bentuk; tiada satu pun mengekalkan kedudukan.'), ans), sp: 's' };
  });
  E111.push((r) => { // T/F
    const bank = [
      ['The image of an isometry is congruent to the object.', 'Imej bagi isometri kongruen dengan objek.', true, 'An isometry keeps lengths and angles.', 'Isometri mengekalkan panjang dan sudut.'],
      ['An enlargement is an isometry.', 'Pembesaran ialah isometri.', false, 'Its image has a different size.', 'Imejnya mempunyai saiz yang berbeza.'],
      ['Translation, reflection and rotation are all isometries.', 'Translasi, pantulan dan putaran semuanya ialah isometri.', true, 'They all preserve size and shape.', 'Semuanya mengekalkan saiz dan bentuk.'],
      ['After an isometry, a line of length 6 cm becomes a line of length 12 cm.', 'Selepas isometri, garis sepanjang 6 cm menjadi garis sepanjang 12 cm.', false, 'Lengths are unchanged: it stays 6 cm.', 'Panjang tidak berubah: ia kekal 6 cm.'],
      ['A transformation moves every point of a shape to a new position.', 'Transformasi menggerakkan setiap titik pada suatu bentuk ke kedudukan baharu.', true, 'This gives the image.', 'Ini menghasilkan imej.'],
      ['Under an isometry, an angle of $50^\\circ$ becomes an angle of $100^\\circ$.', 'Di bawah isometri, sudut $50^\\circ$ menjadi sudut $100^\\circ$.', false, 'Angles are unchanged.', 'Sudut tidak berubah.'],
      ['The object and the image are always in the same position.', 'Objek dan imej sentiasa berada di kedudukan yang sama.', false, 'A transformation moves the object.', 'Transformasi menggerakkan objek.'],
      ['Under an isometry, the area of a shape stays the same.', 'Di bawah isometri, luas suatu bentuk kekal sama.', true, 'The image is congruent to the object.', 'Imej kongruen dengan objek.'],
      ['Every point of the object has exactly one image point.', 'Setiap titik pada objek mempunyai tepat satu titik imej.', true, 'This is what corresponding points mean.', 'Inilah maksud titik sepadan.'],
      ['A reflection changes the size of a shape.', 'Pantulan mengubah saiz suatu bentuk.', false, 'It only produces a mirror image.', 'Ia hanya menghasilkan imej cermin.'],
      ['A rotation is an isometry.', 'Putaran ialah isometri.', true, 'It preserves lengths and angles.', 'Ia mengekalkan panjang dan sudut.'],
      ['A translation turns the shape upside down.', 'Translasi memusingkan bentuk itu terbalik.', false, 'A translation does not turn or flip the shape.', 'Translasi tidak memutar atau membalikkan bentuk.'],
    ];
    const b = r.pick(bank);
    return { q: T(`True or false? ${b[0]}`, `Benar atau palsu? ${b[1]}`), a: T(`${b[2] ? 'True' : 'False'}. ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}. ${b[4]}`), w: W(T('An isometry keeps lengths, angles and area, so the image is congruent to the object; translation, reflection and rotation are isometries, an enlargement is not.', 'Isometri mengekalkan panjang, sudut dan luas, jadi imej kongruen dengan objek; translasi, pantulan dan putaran ialah isometri, pembesaran bukan.'), T(`${b[2] ? 'True' : 'False'}: ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}: ${b[4]}`)), sp: 's' };
  });
  E111.push((r) => { // given measure -> image measure
    const t = r.pick(TYK), len = r.int(3, 15), ang = r.step(30, 120, 5);
    const forms = [
      [`Triangle $ABC$ is mapped onto triangle $A'B'C'$ by a ${TY[t].en}. If $AB = ${len}$ cm, find the length of $A'B'$.`, `Segi tiga $ABC$ dipetakan ke segi tiga $A'B'C'$ oleh ${TY[t].ms}. Jika $AB = ${len}$ cm, cari panjang $A'B'$.`, `$A'B' = ${len}$ cm`],
      [`A ${TY[t].en} maps $\\angle PQR = ${ang}^\\circ$ onto $\\angle P'Q'R'$. State the size of $\\angle P'Q'R'$.`, `${SPM.cap(TY[t].ms)} memetakan $\\angle PQR = ${ang}^\\circ$ ke $\\angle P'Q'R'$. Nyatakan saiz $\\angle P'Q'R'$.`, `$${ang}^\\circ$`],
      [`Under a ${TY[t].en}, a shape of area ${len * 2} cm² is mapped onto its image. What is the area of the image?`, `Di bawah ${TY[t].ms}, suatu bentuk berluas ${len * 2} cm² dipetakan ke imejnya. Berapakah luas imej?`, `${len * 2} cm²`],
    ];
    const f = r.pick(forms);
    return { q: T(f[0], f[1]), a: T(f[2]), w: W(T(`A ${TY[t].en} is an isometry, so lengths, angles and areas are unchanged.`, `${SPM.cap(TY[t].ms)} ialah isometri, jadi panjang, sudut dan luas tidak berubah.`), T(`The image therefore has the same measure as the object: ${f[2]}.`, `Oleh itu imej mempunyai ukuran yang sama dengan objek: ${f[2]}.`)), sp: 's' };
  });
  E111.push((r) => { // which is an isometry: MCQ from 4 operations
    const ops = [
      [T('sliding a shape 4 cm to the right', 'menggelongsorkan bentuk 4 cm ke kanan'), true], [T('flipping a shape over a line', 'membalikkan bentuk pada satu garis'), true], [T('turning a shape a quarter-turn about a point', 'memutarkan bentuk satu suku pusingan pada satu titik'), true],
      [T('doubling all the lengths of a shape', 'menggandakan semua panjang suatu bentuk'), false], [T('stretching a shape to twice its width only', 'meregangkan bentuk kepada dua kali ganda lebarnya sahaja'), false], [T('shrinking a shape to half its size', 'mengecilkan bentuk kepada separuh saiznya'), false],
    ];
    const good = r.pick(ops.filter((o) => o[1])), bad = r.sample(ops.filter((o) => !o[1]), 3);
    const m = mcq(r, good[0], bad.map((o) => o[0]));
    return { q: T(`Which of these operations is an isometry?${m.opts.en}`, `Antara operasi berikut, yang manakah isometri?${m.opts.ms}`), a: m.ans, w: W(T('An isometry must keep both the size and the shape: sliding, flipping and turning do, but doubling, stretching or shrinking do not.', 'Isometri mesti mengekalkan saiz dan bentuk: menggelongsor, membalik dan memutar mengekalkannya, tetapi menggandakan, meregang atau mengecilkan tidak.'), T(`So the answer is ${m.letter}: ${good[0].en}.`, `Jadi jawapannya ialah ${m.letter}: ${good[0].ms}.`)), sp: 's' };
  });
  E111.push((r) => { // fill blank
    const bank = [
      ['Complete: an isometry preserves the ______ and the angles of a shape.', 'Lengkapkan: isometri mengekalkan ______ dan sudut suatu bentuk.', 'lengths', 'panjang'],
      ['Complete: the image of an isometry is ______ to the object.', 'Lengkapkan: imej bagi isometri adalah ______ dengan objek.', 'congruent', 'kongruen'],
      ['Complete: a transformation maps an ______ onto an image.', 'Lengkapkan: suatu transformasi memetakan ______ ke atas imej.', 'object', 'objek'],
      ['Complete: the three isometries in this chapter are translation, reflection and ______.', 'Lengkapkan: tiga isometri dalam bab ini ialah translasi, pantulan dan ______.', 'rotation', 'putaran'],
      ['Complete: a transformation that changes the size of a shape is not an ______.', 'Lengkapkan: transformasi yang mengubah saiz suatu bentuk bukan ______.', 'isometry', 'isometri'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('Recall: a transformation maps an object onto an image, and an isometry preserves lengths and angles so that the image is congruent to the object.', 'Ingat: transformasi memetakan objek kepada imej, dan isometri mengekalkan panjang dan sudut supaya imej kongruen dengan objek.'), T(`The word that fits is "${b[2]}".`, `Perkataan yang sesuai ialah "${b[3]}".`)), sp: 's' };
  });
  E111.push((r) => { // sides of a shape given, is it isometry?
    const a = [r.int(3, 9), r.int(3, 9), r.int(3, 9)];
    const kind = r.pick(['same', 'double', 'diff']);
    const b = kind === 'same' ? r.shuffle(a) : kind === 'double' ? a.map((v) => v * 2) : [a[0], a[1] + 2, a[2]];
    const iso = kind === 'same';
    return { q: T(`Triangle $ABC$ has sides ${a.join(' cm, ')} cm. It is transformed to triangle $A'B'C'$ with sides ${b.join(' cm, ')} cm. Could the transformation be an isometry? Give a reason.`, `Segi tiga $ABC$ mempunyai sisi ${a.join(' cm, ')} cm. Ia ditransformasikan kepada segi tiga $A'B'C'$ dengan sisi ${b.join(' cm, ')} cm. Adakah transformasi itu boleh menjadi isometri? Berikan sebab.`), a: iso ? T('Yes: the side lengths are unchanged.', 'Ya: panjang sisi tidak berubah.') : T('No: the side lengths have changed.', 'Tidak: panjang sisi telah berubah.'), w: W(T('An isometry keeps every length, so the image must have exactly the same three side lengths (possibly listed in a different order).', 'Isometri mengekalkan setiap panjang, jadi imej mesti mempunyai tiga panjang sisi yang sama tepat (mungkin disenaraikan dalam susunan berbeza).'), T(`In order: ${a.slice().sort((x, y) => x - y).join(', ')} cm and ${b.slice().sort((x, y) => x - y).join(', ')} cm.`, `Mengikut tertib: ${a.slice().sort((x, y) => x - y).join(', ')} cm dan ${b.slice().sort((x, y) => x - y).join(', ')} cm.`), iso ? T('They are the same, so the transformation could be an isometry.', 'Kedua-duanya sama, jadi transformasi itu boleh menjadi isometri.') : T('They are different, so the transformation cannot be an isometry.', 'Kedua-duanya berbeza, jadi transformasi itu tidak boleh menjadi isometri.')), sp: 's' };
  });


  /* mapping rules for isometry tests */
  const sgnS = (v) => (v < 0 ? '- ' + Math.abs(v) : '+ ' + v);
  const mapRule = (r, wantIso) => {
    const a = r.nz(-4, 4), b = r.nz(-4, 4);
    const list = wantIso === true ? ['trans', 'rx', 'ry', 'ryx'] : wantIso === false ? ['enl2', 'enl3', 'sx', 'sy', 'shear', 'sumdiff'] : ['trans', 'rx', 'ry', 'ryx', 'enl2', 'enl3', 'sx', 'sy', 'shear', 'sumdiff'];
    const k = r.pick(list);
    switch (k) {
      case 'trans': return { k, iso: true, f: (p) => [p[0] + a, p[1] + b], sym: `(${SPM.poly([[1, 'x'], [a, '']])},\\ ${SPM.poly([[1, 'y'], [b, '']])})`, w: T(`every point is moved ${moveEN([a, b])}`, `setiap titik digerakkan ${moveMS([a, b])}`) };
      case 'rx': return { k, iso: true, f: (p) => [p[0], -p[1]], sym: '(x,\\ -y)', w: T('every point changes the sign of its $y$-coordinate (a reflection in the $x$-axis)', 'setiap titik menukar tanda koordinat-$y$nya (pantulan pada paksi-$x$)') };
      case 'ry': return { k, iso: true, f: (p) => [-p[0], p[1]], sym: '(-x,\\ y)', w: T('every point changes the sign of its $x$-coordinate (a reflection in the $y$-axis)', 'setiap titik menukar tanda koordinat-$x$nya (pantulan pada paksi-$y$)') };
      case 'ryx': return { k, iso: true, f: (p) => [p[1], p[0]], sym: '(y,\\ x)', w: T('the two coordinates of every point are swapped (a reflection in the line $y = x$)', 'dua koordinat setiap titik ditukar ganti (pantulan pada garis $y = x$)') };
      case 'enl2': return { k, iso: false, f: (p) => [2 * p[0], 2 * p[1]], sym: '(2x,\\ 2y)', w: T('both coordinates of every point are doubled', 'kedua-dua koordinat setiap titik digandakan') };
      case 'enl3': return { k, iso: false, f: (p) => [3 * p[0], 3 * p[1]], sym: '(3x,\\ 3y)', w: T('both coordinates of every point are multiplied by 3', 'kedua-dua koordinat setiap titik didarab dengan 3') };
      case 'sx': return { k, iso: false, f: (p) => [2 * p[0], p[1]], sym: '(2x,\\ y)', w: T('the $x$-coordinate of every point is doubled and the $y$-coordinate is unchanged', 'koordinat-$x$ setiap titik digandakan dan koordinat-$y$ tidak berubah') };
      case 'sy': return { k, iso: false, f: (p) => [p[0], 3 * p[1]], sym: '(x,\\ 3y)', w: T('the $y$-coordinate of every point is tripled and the $x$-coordinate is unchanged', 'koordinat-$y$ setiap titik ditigakan dan koordinat-$x$ tidak berubah') };
      case 'shear': return { k, iso: false, f: (p) => [p[0] + p[1], p[1]], sym: '(x + y,\\ y)', w: T('the $x$-coordinate of every point is increased by its $y$-coordinate', 'koordinat-$x$ setiap titik ditambah dengan koordinat-$y$nya') };
      default: return { k, iso: false, f: (p) => [p[0] + p[1], p[0] - p[1]], sym: '(x + y,\\ x - y)', w: T('each point $(x, y)$ is sent to $(x + y, x - y)$', 'setiap titik $(x, y)$ dihantar ke $(x + y, x - y)$') };
    }
  };

  /* ---- medium ---- */
  M111.push((r) => { // corresponding sides and angles
    const k = r.pick([3, 4, 4]), names = nm(r, k), O = shape(r, KIND_OF[k], 3);
    const c = typeCase(r, TYK, 3);
    const nmC = c.names, kk = c.O.length;
    const i = r.int(0, kk - 1), j = (i + 1) % kk, l = (i + kk - 1) % kk;
    const tn = TY[c.type];
    const forms = [
      [`Shape $${nmC.join('')}$ is mapped onto shape $${nmC.map((x) => x + "'").join('')}$ by a ${tn.en}. Which side of the image corresponds to $${nmC[i]}${nmC[j]}$, and which angle corresponds to $\\angle ${nmC[l]}${nmC[i]}${nmC[j]}$?`, `Bentuk $${nmC.join('')}$ dipetakan ke bentuk $${nmC.map((x) => x + "'").join('')}$ oleh ${tn.ms}. Sisi yang manakah pada imej yang sepadan dengan $${nmC[i]}${nmC[j]}$, dan sudut yang manakah sepadan dengan $\\angle ${nmC[l]}${nmC[i]}${nmC[j]}$?`],
      [`A ${tn.en} maps ${noun(kk).en} $${nmC.join('')}$ onto ${noun(kk).en} $${nmC.map((x) => x + "'").join('')}$. Name (a) the image of side $${nmC[i]}${nmC[j]}$ and (b) the image of $\\angle ${nmC[l]}${nmC[i]}${nmC[j]}$, and state how they compare with the originals.`, `${SPM.cap(tn.ms)} memetakan ${noun(kk).ms} $${nmC.join('')}$ ke ${noun(kk).ms} $${nmC.map((x) => x + "'").join('')}$. Namakan (a) imej sisi $${nmC[i]}${nmC[j]}$ dan (b) imej $\\angle ${nmC[l]}${nmC[i]}${nmC[j]}$, dan nyatakan perbandingannya dengan yang asal.`],
    ];
    const f = r.pick(forms);
    return { q: T(f[0], f[1]), fig: r.chance(0.5) ? fig({ O: c.O, I: c.I, names: nmC }) : undefined, a: T(`(a) $${nmC[i]}'${nmC[j]}'$ (b) $\\angle ${nmC[l]}'${nmC[i]}'${nmC[j]}'$; each is equal in size to the original.`, `(a) $${nmC[i]}'${nmC[j]}'$ (b) $\\angle ${nmC[l]}'${nmC[i]}'${nmC[j]}'$; setiap satunya sama saiz dengan yang asal.`), w: W(T('Corresponding parts carry the same letters in the same order, with dashes added on the image.', 'Bahagian sepadan membawa huruf yang sama dalam susunan yang sama, dengan tanda kanta ditambah pada imej.'), T(`(a) $${nmC[i]}${nmC[j]} \\to ${nmC[i]}'${nmC[j]}'$`, `(a) $${nmC[i]}${nmC[j]} \\to ${nmC[i]}'${nmC[j]}'$`), T(`(b) $\\angle ${nmC[l]}${nmC[i]}${nmC[j]} \\to \\angle ${nmC[l]}'${nmC[i]}'${nmC[j]}'$`, `(b) $\\angle ${nmC[l]}${nmC[i]}${nmC[j]} \\to \\angle ${nmC[l]}'${nmC[i]}'${nmC[j]}'$`), T(`A ${tn.en} is an isometry, so each is equal in size to the original.`, `${SPM.cap(tn.ms)} ialah isometri, jadi setiap satunya sama saiz dengan yang asal.`)), sp: 's' };
  });
  M111.push((r) => { // object measures -> image measures
    const t = r.pick(TYK), tn = TY[t];
    const AB = r.int(4, 12), BC = r.int(4, 12), AC = r.int(Math.abs(AB - BC) + 1, AB + BC - 1), ang = r.step(30, 100, 5);
    const forms = [
      [`Triangle $ABC$ has $AB = ${AB}$ cm, $BC = ${BC}$ cm and $AC = ${AC}$ cm. It is mapped onto triangle $A'B'C'$ by a ${tn.en}. Find the perimeter of $A'B'C'$.`, `Segi tiga $ABC$ mempunyai $AB = ${AB}$ cm, $BC = ${BC}$ cm dan $AC = ${AC}$ cm. Ia dipetakan ke segi tiga $A'B'C'$ oleh ${tn.ms}. Cari perimeter $A'B'C'$.`, `${AB + BC + AC} cm`, `${AB + BC + AC} cm`],
      [`In triangle $ABC$, $\\angle ABC = ${ang}^\\circ$ and $\\angle BCA = ${ang + 10}^\\circ$. After a ${tn.en} it becomes triangle $A'B'C'$. Find $\\angle B'A'C'$.`, `Dalam segi tiga $ABC$, $\\angle ABC = ${ang}^\\circ$ dan $\\angle BCA = ${ang + 10}^\\circ$. Selepas ${tn.ms} ia menjadi segi tiga $A'B'C'$. Cari $\\angle B'A'C'$.`, `$${180 - ang - (ang + 10)}^\\circ$`, `$${180 - ang - (ang + 10)}^\\circ$`],
      [`Rectangle $PQRS$ has $PQ = ${AB}$ cm and $QR = ${BC}$ cm. A ${tn.en} maps it onto $P'Q'R'S'$. State the lengths of $P'Q'$ and $Q'R'$ and the area of $P'Q'R'S'$.`, `Segi empat tepat $PQRS$ mempunyai $PQ = ${AB}$ cm dan $QR = ${BC}$ cm. ${SPM.cap(tn.ms)} memetakannya ke $P'Q'R'S'$. Nyatakan panjang $P'Q'$ dan $Q'R'$ dan luas $P'Q'R'S'$.`, `$P'Q' = ${AB}$ cm, $Q'R' = ${BC}$ cm, area $= ${AB * BC}$ cm²`, `$P'Q' = ${AB}$ cm, $Q'R' = ${BC}$ cm, luas $= ${AB * BC}$ cm²`],
    ];
    const f = r.pick(forms);
    if (f === forms[1]) need(180 - ang - (ang + 10) >= 20);
    const isoL = T(`A ${tn.en} is an isometry, so lengths, angles and areas do not change.`, `${SPM.cap(tn.ms)} ialah isometri, jadi panjang, sudut dan luas tidak berubah.`);
    const wk = f === forms[0]
      ? W(isoL, `$${AB} + ${BC} + ${AC} = ${AB + BC + AC}$`, T(`Perimeter of $A'B'C' = ${AB + BC + AC}$ cm.`, `Perimeter $A'B'C' = ${AB + BC + AC}$ cm.`))
      : f === forms[1]
        ? W(isoL, T('The angles of a triangle add up to $180^\\circ$.', 'Hasil tambah sudut segi tiga ialah $180^\\circ$.'), `$180^\\circ - ${ang}^\\circ - ${ang + 10}^\\circ = ${180 - ang - (ang + 10)}^\\circ$`, T(`$\\angle B'A'C' = ${180 - ang - (ang + 10)}^\\circ$`))
        : W(isoL, `$P'Q' = ${AB}$ cm, $Q'R' = ${BC}$ cm`, `$${AB} \\times ${BC} = ${AB * BC}$ cm²`);
    return { q: T(f[0], f[1]), a: T(f[2], f[3]), w: wk, sp: 's' };
  });
  M111.push((r) => { // coordinates: identify the isometry
    const type = r.pick(['translation', 'rx', 'ry', 'half']);
    const O = scalene(r, 3, 4), names = nm(r, 3);
    let I, ans;
    if (type === 'translation') { const v = vec(r, 4, true); I = O.map((p) => addv(p, v)); ans = T(`A translation $${tv(v)}$ (every vertex moves by the same vector)`, `Translasi $${tv(v)}$ (setiap bucu bergerak dengan vektor yang sama)`); }
    else if (type === 'rx') { I = O.map((p) => [p[0], -p[1]]); need(O.every((p) => p[1] !== 0)); ans = T('A reflection in the $x$-axis (the $y$-coordinates change sign)', 'Pantulan pada paksi-$x$ (koordinat-$y$ bertukar tanda)'); }
    else if (type === 'ry') { I = O.map((p) => [-p[0], p[1]]); need(O.every((p) => p[0] !== 0)); ans = T('A reflection in the $y$-axis (the $x$-coordinates change sign)', 'Pantulan pada paksi-$y$ (koordinat-$x$ bertukar tanda)'); }
    else { I = O.map((p) => [-p[0], -p[1]]); need(O.every((p) => p[0] !== 0 || p[1] !== 0)); ans = T('A rotation of $180^\\circ$ about the origin (both coordinates change sign)', 'Putaran $180^\\circ$ pada asalan (kedua-dua koordinat bertukar tanda)'); }
    need(inb(I, 9) && O.every((p, i) => !same(p, I[i])));
    const forms = [
      ["Triangle ${o}$ has vertices {ol} and its image ${i}$ has vertices {il}. Identify the isometry (translation, reflection or rotation) and describe it.", "Segi tiga ${o}$ mempunyai bucu {ol} dan imejnya ${i}$ mempunyai bucu {il}. Kenal pasti isometri (translasi, pantulan atau putaran) dan huraikannya."],
      ["The vertices of ${o}$ are {ol}; after one isometry they become {il}. Name the isometry and give its details.", "Bucu ${o}$ ialah {ol}; selepas satu isometri ia menjadi {il}. Namakan isometri itu dan berikan butirannya."],
    ];
    return { q: fill(r.pick(forms), { o: names.join(''), i: names.map((x) => x + "'").join(''), ol: M(vlist(names, O)), il: M(plist(names, I, "'")) }), fig: r.chance(0.5) ? fig({ O, I, names }) : undefined, a: ans, w: W(T('Compare each vertex with its image to see the pattern.', 'Bandingkan setiap bucu dengan imejnya untuk melihat coraknya.'), ...mapAll(O, I, names), ans), sp: 'm' };
  });
  M111.push((r) => { // rule test with two points
    const rule = mapRule(r);
    const A = [r.int(-4, 4), r.int(-4, 4)], B = [r.int(-4, 4), r.int(-4, 4)];
    const A1 = rule.f(A), B1 = rule.f(B);
    need(!same(A, B) && (rule.iso ? d2(A, B) === d2(A1, B1) : d2(A, B) !== d2(A1, B1)) && inb([A1, B1], 20));
    return { q: T(`A mapping sends every point $(x,\\ y)$ to $${rule.sym}$. Points $A${pt(A)}$ and $B${pt(B)}$ are mapped onto $A'$ and $B'$. Find $A'$ and $B'$, compare $AB^2$ with $A'B'^2$, and say whether the mapping is an isometry.`, `Satu pemetaan menghantar setiap titik $(x,\\ y)$ ke $${rule.sym}$. Titik $A${pt(A)}$ dan $B${pt(B)}$ dipetakan ke $A'$ dan $B'$. Cari $A'$ dan $B'$, bandingkan $AB^2$ dengan $A'B'^2$, dan nyatakan sama ada pemetaan itu isometri.`), a: T(`$A'${pt(A1)}$, $B'${pt(B1)}$; $AB^2 = ${d2(A, B)}$, $A'B'^2 = ${d2(A1, B1)}$. ${rule.iso ? `Equal: ${rule.w.en}, which is an isometry.` : `Not equal, so the mapping is not an isometry (${rule.w.en}).`}`, `$A'${pt(A1)}$, $B'${pt(B1)}$; $AB^2 = ${d2(A, B)}$, $A'B'^2 = ${d2(A1, B1)}$. ${rule.iso ? `Sama: ${rule.w.ms}, iaitu isometri.` : `Tidak sama, jadi pemetaan itu bukan isometri (${rule.w.ms}).`}`), w: W(T(`Apply the rule $(x,\\ y) \\to ${rule.sym}$ to each point.`, `Gunakan hukum $(x,\\ y) \\to ${rule.sym}$ pada setiap titik.`), mapLine(A, A1, 'A', "A'"), mapLine(B, B1, 'B', "B'"), `$AB^2 = ${d2(A, B)}$, $A'B'^2 = ${d2(A1, B1)}$`, rule.iso ? T(`They are equal: ${rule.w.en}, so distances are preserved and the mapping is an isometry.`, `Kedua-duanya sama: ${rule.w.ms}, jadi jarak dikekalkan dan pemetaan itu ialah isometri.`) : T(`They are different, so distances are not preserved and the mapping is not an isometry (${rule.w.en}).`, `Kedua-duanya berbeza, jadi jarak tidak dikekalkan dan pemetaan itu bukan isometri (${rule.w.ms}).`)), sp: 'm' };
  });


  M111.push((r) => { // candidate triangles for the image
    const a = [r.int(3, 9), r.int(3, 9), r.int(3, 9)];
    need(a[0] + a[1] > a[2] && a[1] + a[2] > a[0] && a[0] + a[2] > a[1] && new Set(a).size === 3);
    const good = r.shuffle(a);
    const bad1 = [a[0], a[1], a[2] + 2], bad2 = a.map((v) => v * 2);
    need(bad1[0] + bad1[1] > bad1[2]);
    const opts = r.shuffle([{ s: good, ok: true }, { s: bad1 }, { s: bad2 }]);
    const list = opts.map((o, i) => `<b>${'ABC'[i]}.</b> ${o.s.join(', ')} cm`).join('<br>');
    const ok = 'ABC'[opts.findIndex((o) => o.ok)];
    return { q: T(`Triangle $PQR$ has sides ${a.join(', ')} cm. Which of these triangles could be the image of $PQR$ under an isometry?<br>${list}`, `Segi tiga $PQR$ mempunyai sisi ${a.join(', ')} cm. Antara segi tiga berikut, yang manakah boleh menjadi imej $PQR$ di bawah suatu isometri?<br>${list}`), a: T(`${ok}: it has the same three side lengths (in any order); the others have different side lengths.`, `${ok}: ia mempunyai tiga panjang sisi yang sama (dalam sebarang susunan); yang lain mempunyai panjang sisi yang berbeza.`), w: W(T('An isometry keeps all three side lengths, so the image must have the same set of lengths.', 'Isometri mengekalkan ketiga-tiga panjang sisi, jadi imej mesti mempunyai set panjang yang sama.'), T(`$PQR$ in order: ${a.slice().sort((x, y) => x - y).join(', ')} cm.`, `$PQR$ mengikut tertib: ${a.slice().sort((x, y) => x - y).join(', ')} cm.`), ...opts.map((o, i) => T(`${'ABC'[i]}: ${o.s.slice().sort((x, y) => x - y).join(', ')} cm`, `${'ABC'[i]}: ${o.s.slice().sort((x, y) => x - y).join(', ')} cm`)), T(`Only ${ok} matches.`, `Hanya ${ok} sepadan.`)), sp: 's' };
  });
  M111.push((r) => { // table of properties
    const props = r.sample(Object.keys(PROP), 3);
    const rows = props.map((k) => [PROP[k][0].en, '?', '?', '?']), rowsM = props.map((k) => [PROP[k][0].ms, '?', '?', '?']);
    const ans = props.map((k) => `${PROP[k][0].en}: ${PROP[k][1].map((v) => (v ? 'yes' : 'no')).join(', ')}`).join('; ');
    const ansM = props.map((k) => `${PROP[k][0].ms}: ${PROP[k][1].map((v) => (v ? 'ya' : 'tidak')).join(', ')}`).join('; ');
    return { q: T(`Complete the table with "yes" if the property is preserved and "no" if it is not.<br>${SPM.table(rows, { head: ['Property', 'Translation', 'Reflection', 'Rotation'] })}`, `Lengkapkan jadual dengan "ya" jika sifat itu dikekalkan dan "tidak" jika tidak dikekalkan.<br>${SPM.table(rowsM, { head: ['Sifat', 'Translasi', 'Pantulan', 'Putaran'] })}`), a: T(ans, ansM), w: W(T('All three isometries preserve lengths, angles, area and shape; only a translation preserves orientation; and none of them preserves position.', 'Ketiga-tiga isometri mengekalkan panjang, sudut, luas dan bentuk; hanya translasi mengekalkan orientasi; dan tiada satu pun mengekalkan kedudukan.'), T(ans, ansM)), sp: 'm' };
  });
  M111.push((r) => { // reverse measures
    const t = r.pick(TYK), tn = TY[t], v = r.int(4, 16), ang = r.step(35, 125, 5);
    const forms = [
      [`A ${tn.en} maps trapezium $PQRS$ onto $P'Q'R'S'$. Given that $P'Q' = ${v}$ cm and $\\angle Q'R'S' = ${ang}^\\circ$, find $PQ$ and $\\angle QRS$.`, `${SPM.cap(tn.ms)} memetakan trapezium $PQRS$ ke $P'Q'R'S'$. Diberi $P'Q' = ${v}$ cm dan $\\angle Q'R'S' = ${ang}^\\circ$, cari $PQ$ dan $\\angle QRS$.`, `$PQ = ${v}$ cm, $\\angle QRS = ${ang}^\\circ$`],
      [`Triangle $A'B'C'$ is the image of triangle $ABC$ under a ${tn.en}. The area of $A'B'C'$ is ${v * 3} cm². What is the area of $ABC$?`, `Segi tiga $A'B'C'$ ialah imej segi tiga $ABC$ di bawah ${tn.ms}. Luas $A'B'C'$ ialah ${v * 3} cm². Berapakah luas $ABC$?`, `${v * 3} cm²`],
    ];
    const f = r.pick(forms);
    return { q: T(f[0], f[1]), a: T(f[2]), w: W(T(`A ${tn.en} is an isometry, so the object and the image have equal lengths, equal angles and equal areas.`, `${SPM.cap(tn.ms)} ialah isometri, jadi objek dan imej mempunyai panjang sama, sudut sama dan luas sama.`), T('So the object measures are simply read off from the image measures.', 'Jadi ukuran objek dibaca terus daripada ukuran imej.'), T(f[2])), sp: 's' };
  });
  M111.push((r) => { // spot the error
    const bank = [
      ['A student says: "A reflection changes the lengths of the sides, because the image looks different." Correct the statement.', 'Seorang murid berkata: "Pantulan mengubah panjang sisi, kerana imej kelihatan berbeza." Betulkan pernyataan itu.', 'A reflection preserves lengths. The image looks different only because it is a mirror image (orientation reversed).', 'Pantulan mengekalkan panjang. Imej kelihatan berbeza hanya kerana ia ialah imej cermin (orientasi disongsangkan).'],
      ['A student says: "A translation is not an isometry because the shape moves to a new place." Explain what is wrong.', 'Seorang murid berkata: "Translasi bukan isometri kerana bentuk itu bergerak ke tempat baharu." Terangkan apa yang salah.', 'An isometry only has to keep size and shape. Moving to a new place does not change lengths or angles, so a translation is an isometry.', 'Isometri hanya perlu mengekalkan saiz dan bentuk. Bergerak ke tempat baharu tidak mengubah panjang atau sudut, jadi translasi ialah isometri.'],
      ['A student says: "An enlargement is an isometry because the image has the same shape." Is this correct?', 'Seorang murid berkata: "Pembesaran ialah isometri kerana imej mempunyai bentuk yang sama." Adakah ini betul?', 'No. An isometry must keep the size as well as the shape. An enlargement changes the lengths, so it is not an isometry.', 'Tidak. Isometri mesti mengekalkan saiz dan juga bentuk. Pembesaran mengubah panjang, jadi ia bukan isometri.'],
      ['A student says: "After a rotation, the object and the image are always in the same position." Correct this.', 'Seorang murid berkata: "Selepas putaran, objek dan imej sentiasa berada di kedudukan yang sama." Betulkan ini.', 'A rotation moves every point except the centre, so the image is generally in a different position; only the centre stays in place.', 'Putaran menggerakkan setiap titik kecuali pusat, jadi imej biasanya berada di kedudukan yang berbeza; hanya pusat kekal di tempatnya.'],
      ['A student says: "The image of a triangle under a reflection has angles that are the reverse of the object\'s angles, so the angle sizes change." Is this correct?', 'Seorang murid berkata: "Imej segi tiga di bawah pantulan mempunyai sudut yang bertentangan dengan sudut objek, jadi saiz sudut berubah." Adakah ini betul?', 'No. Angle sizes are unchanged by a reflection; only the direction in which the vertices are labelled (clockwise or anticlockwise) is reversed.', 'Tidak. Saiz sudut tidak berubah oleh pantulan; hanya arah pelabelan bucu (ikut atau lawan arah jam) yang disongsangkan.'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('Check the definition: an isometry has to keep lengths and angle sizes, but it may still move the shape, turn it, or reverse its orientation.', 'Semak takrif: isometri perlu mengekalkan panjang dan saiz sudut, tetapi ia masih boleh menggerakkan bentuk, memutarnya, atau menyongsangkan orientasinya.'), T(b[2], b[3])), sp: 'm' };
  });
  M111.push((r) => { // properties that are preserved by all three
    const all = Object.keys(PROP);
    const pick4 = r.sample(all, 4);
    need(pick4.some((k) => PROP[k][1].every(Boolean)) && pick4.some((k) => !PROP[k][1].every(Boolean)));
    const keep = pick4.filter((k) => PROP[k][1].every(Boolean));
    return { q: T(`Which of these properties are preserved by every isometry (translation, reflection and rotation)? ${pick4.map((k) => PROP[k][0].en).join('; ')}.`, `Antara sifat berikut, yang manakah dikekalkan oleh setiap isometri (translasi, pantulan dan putaran)? ${pick4.map((k) => PROP[k][0].ms).join('; ')}.`), a: T(keep.map((k) => PROP[k][0].en).join('; '), keep.map((k) => PROP[k][0].ms).join('; ')), w: W(T('Check each property against all three isometries (translation, reflection, rotation).', 'Semak setiap sifat terhadap ketiga-tiga isometri (translasi, pantulan, putaran).'), ...pick4.map((k) => T(`${PROP[k][0].en}: ${PROP[k][1].map((v) => (v ? 'yes' : 'no')).join(', ')}`, `${PROP[k][0].ms}: ${PROP[k][1].map((v) => (v ? 'ya' : 'tidak')).join(', ')}`)), T(`Preserved by all three: ${keep.map((k) => PROP[k][0].en).join('; ')}.`, `Dikekalkan oleh ketiga-tiganya: ${keep.map((k) => PROP[k][0].ms).join('; ')}.`)), sp: 's' };
  });
  M111.push((r) => { // enlargement contrast
    const k = r.pick([2, 3, 4]), len = r.int(2, 8);
    const forms = [
      [`A triangle with $AB = ${len}$ cm is enlarged so that every length is multiplied by ${k}. Find the new length of $A'B'$ and state whether this transformation is an isometry.`, `Sebuah segi tiga dengan $AB = ${len}$ cm dibesarkan supaya setiap panjang didarab dengan ${k}. Cari panjang baharu $A'B'$ dan nyatakan sama ada transformasi ini isometri.`, `$A'B' = ${len * k}$ cm; not an isometry because the length changed.`, `$A'B' = ${len * k}$ cm; bukan isometri kerana panjang berubah.`],
      [`A square of side ${len} cm is transformed into a rectangle ${len} cm by ${len * k} cm. Is the transformation an isometry? Give a reason.`, `Sebuah segi empat sama bersisi ${len} cm ditransformasikan kepada segi empat tepat ${len} cm kali ${len * k} cm. Adakah transformasi itu isometri? Berikan sebab.`, `No: one pair of sides has changed from ${len} cm to ${len * k} cm, and the shape is different.`, `Tidak: sepasang sisi telah berubah daripada ${len} cm kepada ${len * k} cm, dan bentuknya berbeza.`],
    ];
    const f = r.pick(forms);
    return { q: T(f[0], f[1]), a: T(f[2], f[3]), w: W(T('An isometry keeps every length; if any length changes, the transformation is not an isometry.', 'Isometri mengekalkan setiap panjang; jika mana-mana panjang berubah, transformasi itu bukan isometri.'), T(f[2], f[3])), sp: 's' };
  });
  M111.push((r) => { // figure: describe (simple)
    const type = r.pick(['translation', 'rx', 'ry', 'half']);
    const O = asymShape(r, 3), names = nm(r, O.length);
    let I, ans;
    if (type === 'translation') { const v = vec(r, 4, true); I = O.map((p) => addv(p, v)); ans = T(`Translation $${tv(v)}$`, `Translasi $${tv(v)}$`); }
    else if (type === 'rx') { need(O.every((p) => p[1] !== 0) && oneSide(O, AX()[1])); I = O.map((p) => [p[0], -p[1]]); ans = T('Reflection in the $x$-axis', 'Pantulan pada paksi-$x$'); }
    else if (type === 'ry') { need(O.every((p) => p[0] !== 0) && oneSide(O, AX()[0])); I = O.map((p) => [-p[0], p[1]]); ans = T('Reflection in the $y$-axis', 'Pantulan pada paksi-$y$'); }
    else { need(O.every((p) => p[0] !== 0 || p[1] !== 0)); I = O.map((p) => [-p[0], -p[1]]); ans = T('Rotation of $180^\\circ$ about the origin', 'Putaran $180^\\circ$ pada asalan'); }
    need(inb(I, 8) && O.every((p) => !I.some((q) => same(p, q))));
    const forms = [
      ["The diagram shows the object ${o}$ and its image ${i}$. Name the isometry and describe it (give the vector, the mirror line, or the centre and angle).", "Rajah menunjukkan objek ${o}$ dan imejnya ${i}$. Namakan isometri dan huraikannya (berikan vektor, garis cermin, atau pusat dan sudut)."],
      ["Describe fully the single isometry that maps ${o}$ onto ${i}$ in the diagram.", "Huraikan dengan lengkap isometri tunggal yang memetakan ${o}$ ke ${i}$ dalam rajah."],
    ];
    return { q: fill(r.pick(forms), { o: names.join(''), i: names.map((x) => x + "'").join('') }), fig: fig({ O, I, names }), a: ans, w: W(T('Compare each vertex with its image: equal displacements for every vertex mean a translation, a mirror image means a reflection, and a turn without a flip means a rotation.', 'Bandingkan setiap bucu dengan imejnya: sesaran yang sama bagi setiap bucu bermakna translasi, imej cermin bermakna pantulan, dan putaran tanpa balikan bermakna putaran.'), ...mapAll(O, I, names), ans), sp: 's' };
  });
  M111.push((r) => { // scenarios: give property statement
    const s = r.pick(SCEN);
    const forms = [
      ["{s} State the transformation and say whether the size of the shape changes.", "{s} Nyatakan transformasi itu dan nyatakan sama ada saiz bentuk berubah."],
      ["{s} Name the transformation involved. Is the image congruent to the object?", "{s} Namakan transformasi yang terlibat. Adakah imej kongruen dengan objek?"],
    ];
    const iso = isoOf(s.t);
    return { q: fill(r.pick(forms), { s: scenText(s) }), a: iso ? T(`${SPM.cap(TY[s.t].en)}: the size does not change, and the image is congruent to the object.`, `${SPM.cap(TY[s.t].ms)}: saiz tidak berubah, dan imej kongruen dengan objek.`) : T('Enlargement or reduction: the size changes, so the image is similar (same shape) but not congruent to the object.', 'Pembesaran atau pengecilan: saiz berubah, jadi imej adalah serupa (bentuk sama) tetapi tidak kongruen dengan objek.'), w: W(T('Translation, reflection and rotation keep the size and shape (they are isometries); an enlargement or reduction changes the size.', 'Translasi, pantulan dan putaran mengekalkan saiz dan bentuk (ia isometri); pembesaran atau pengecilan mengubah saiz.'), iso ? T(`This situation is a ${TY[s.t].en}, so the image is congruent to the object.`, `Situasi ini ialah ${TY[s.t].ms}, jadi imej kongruen dengan objek.`) : T('Here the size changes, so the image is similar but not congruent.', 'Di sini saiz berubah, jadi imej serupa tetapi tidak kongruen.')), sp: 's' };
  });
  M111.push((r) => { // count corresponding pairs and equal sides
    const k = r.pick([3, 4, 5]);
    const t = r.pick(TYK), tn = TY[t];
    return { q: T(`A ${noun(k).en} is mapped onto its image by a ${tn.en}. How many pairs of corresponding vertices are there, and how many pairs of corresponding sides that are equal in length?`, `${SPM.cap(noun(k).ms)} dipetakan ke imejnya oleh ${tn.ms}. Berapakah bilangan pasangan bucu sepadan, dan berapakah bilangan pasangan sisi sepadan yang sama panjang?`), a: T(`${k} pairs of vertices and ${k} pairs of sides (all equal in length)`, `${k} pasangan bucu dan ${k} pasangan sisi (semuanya sama panjang)`), w: W(T(`${SPM.cap(noun(k).en)} has ${k} vertices and ${k} sides, and a transformation gives each one exactly one image.`, `${SPM.cap(noun(k).ms)} mempunyai ${k} bucu dan ${k} sisi, dan transformasi memberikan setiap satu tepat satu imej.`), T(`So there are ${k} pairs of corresponding vertices and ${k} pairs of corresponding sides.`, `Jadi terdapat ${k} pasangan bucu sepadan dan ${k} pasangan sisi sepadan.`), T(`A ${tn.en} is an isometry, so every pair of corresponding sides is equal in length.`, `${SPM.cap(tn.ms)} ialah isometri, jadi setiap pasangan sisi sepadan adalah sama panjang.`)), sp: 's' };
  });


  /* ---- advanced 11.1 ---- */
  A111.push((r) => { // full test of a mapping on a triangle
    const rule = mapRule(r);
    const O = scalene(r, 3, 4), names = nm(r, 3);
    const I = O.map(rule.f);
    need(inb(I, 16) && (rule.iso || [[0, 1], [1, 2], [0, 2]].some(([i, j]) => d2(O[i], O[j]) !== d2(I[i], I[j]))));
    const pairs = [[0, 1], [1, 2], [0, 2]];
    const row = pairs.map(([i, j]) => `${names[i]}${names[j]}^2 = ${d2(O[i], O[j])},\\ ${names[i]}'${names[j]}'^2 = ${d2(I[i], I[j])}`).join(';\\ ');
    const changed = pairs.some(([i, j]) => d2(O[i], O[j]) !== d2(I[i], I[j]));
    return { q: T(`The mapping $(x,\\ y) \\to ${rule.sym}$ is applied to triangle $${names.join('')}$ with vertices $${vlist(names, O)}$. Find the vertices of the image and, by comparing the squares of the three side lengths, decide whether the mapping is an isometry.`, `Pemetaan $(x,\\ y) \\to ${rule.sym}$ dikenakan pada segi tiga $${names.join('')}$ dengan bucu $${vlist(names, O)}$. Cari bucu imej dan, dengan membandingkan kuasa dua ketiga-tiga panjang sisi, tentukan sama ada pemetaan itu isometri.`), fig: fig({ O, names, axes: true }), a: T(`Image: $${plist(names, I, "'")}$. $${row}$. ${changed ? 'The side lengths change, so it is not an isometry.' : 'All three sides are unchanged, consistent with an isometry (' + rule.w.en + ').'}`, `Imej: $${plist(names, I, "'")}$. $${row}$. ${changed ? 'Panjang sisi berubah, jadi ia bukan isometri.' : 'Ketiga-tiga sisi tidak berubah, selaras dengan isometri (' + rule.w.ms + ').'}`), w: W(T(`Apply $(x,\\ y) \\to ${rule.sym}$ to each vertex.`, `Gunakan $(x,\\ y) \\to ${rule.sym}$ pada setiap bucu.`), ...mapAll(O, I, names), `$${row}$`, changed ? T('At least one squared side length changes, so distances are not preserved: the mapping is not an isometry.', 'Sekurang-kurangnya satu kuasa dua panjang sisi berubah, jadi jarak tidak dikekalkan: pemetaan itu bukan isometri.') : T(`All three squared side lengths are unchanged, consistent with an isometry (${rule.w.en}).`, `Ketiga-tiga kuasa dua panjang sisi tidak berubah, selaras dengan isometri (${rule.w.ms}).`)), sp: 'l' };
  });
  A111.push((r) => { // which candidate image is an isometry image
    const O = scalene(r, 3, 4), names = nm(r, 3);
    const v = vec(r, 4, false);
    const good = r.pick([O.map((p) => addv(p, v)), O.map((p) => [p[0], -p[1]]), O.map((p) => [-p[0], -p[1]])]);
    const badA = O.map((p) => [2 * p[0], 2 * p[1]]), badB = O.map((p) => [p[0] + p[1], p[1]]);
    const cands = r.shuffle([{ P: good, ok: true }, { P: badA }, { P: badB }]);
    const s2 = (P) => [d2(P[0], P[1]), d2(P[1], P[2]), d2(P[0], P[2])].join(', ');
    need(inb(cands.map((c) => c.P).flat(), 16) && s2(badA) !== s2(O) && s2(badB) !== s2(O) && s2(good) === s2(O));
    const list = cands.map((c, i) => `${'ABC'[i]}: ${plist(names, c.P, "'")}`).join(';\\ ');
    const ok = 'ABC'[cands.findIndex((c) => c.ok)];
    return { q: T(`Triangle $${names.join('')}$ has vertices $${vlist(names, O)}$. Three possible images are $${list}$. Only one of them is the image under an isometry. Identify it, using the squares of the side lengths to justify your choice.`, `Segi tiga $${names.join('')}$ mempunyai bucu $${vlist(names, O)}$. Tiga imej yang mungkin ialah $${list}$. Hanya satu daripadanya ialah imej di bawah isometri. Kenal pastinya, dengan menggunakan kuasa dua panjang sisi sebagai justifikasi.`), a: T(`${ok}. The squared side lengths of $${names.join('')}$ are ${s2(O)}; only ${ok} keeps them (${s2(cands.find((c) => c.ok).P)}), while the others give different values.`, `${ok}. Kuasa dua panjang sisi bagi $${names.join('')}$ ialah ${s2(O)}; hanya ${ok} mengekalkannya (${s2(cands.find((c) => c.ok).P)}), manakala yang lain memberi nilai yang berbeza.`), w: W(T('An isometry keeps every distance, so the three squared side lengths must be unchanged.', 'Isometri mengekalkan setiap jarak, jadi ketiga-tiga kuasa dua panjang sisi mesti tidak berubah.'), T(`Object: ${s2(O)}`, `Objek: ${s2(O)}`), ...cands.map((c, i) => T(`${'ABC'[i]}: ${s2(c.P)}`, `${'ABC'[i]}: ${s2(c.P)}`)), T(`Only ${ok} matches the object, so ${ok} is the isometric image.`, `Hanya ${ok} sepadan dengan objek, jadi ${ok} ialah imej isometri itu.`)), sp: 'l' };
  });
  A111.push((r) => { // equal sides but angles change (square -> rhombus)
    const sd = r.pick([[5, [3, 4]], [5, [4, 3]], [10, [6, 8]], [10, [8, 6]], [13, [5, 12]], [13, [12, 5]]]);
    const s = sd[0], [p, q] = sd[1];
    const ox = r.int(-3, 0), oy = r.int(-3, 0);
    need(ox + s + p <= 9 && oy + s <= 9);
    const A = [ox, oy], B = [ox + s, oy], Cc = [ox + s, oy + s], D = [ox, oy + s];
    const A1 = A, B1 = B, C1 = [ox + s + p, oy + q], D1 = [ox + p, oy + q];
    need(oy + q <= 9 && q > 0);
    const AC2 = d2(A, Cc), A1C1 = d2(A1, C1);
    return { q: T(`Square $ABCD$ has vertices $A${pt(A)}$, $B${pt(B)}$, $C${pt(Cc)}$, $D${pt(D)}$ and is mapped onto $A'B'C'D'$ with $A'${pt(A1)}$, $B'${pt(B1)}$, $C'${pt(C1)}$, $D'${pt(D1)}$. Show that all four sides keep the same length, but that the mapping is not an isometry.`, `Segi empat sama $ABCD$ mempunyai bucu $A${pt(A)}$, $B${pt(B)}$, $C${pt(Cc)}$, $D${pt(D)}$ dan dipetakan ke $A'B'C'D'$ dengan $A'${pt(A1)}$, $B'${pt(B1)}$, $C'${pt(C1)}$, $D'${pt(D1)}$. Tunjukkan bahawa keempat-empat sisi mengekalkan panjang yang sama, tetapi pemetaan itu bukan isometri.`), a: T(`$A'B'^2 = B'C'^2 = C'D'^2 = D'A'^2 = ${s * s}$, the same as for $ABCD$ (side ${s}). But the diagonals differ: $AC^2 = ${AC2}$ while $A'C'^2 = ${A1C1}$, so distances are not all preserved (the angles at $B'$ are no longer $90^\\circ$).`, `$A'B'^2 = B'C'^2 = C'D'^2 = D'A'^2 = ${s * s}$, sama seperti $ABCD$ (sisi ${s}). Tetapi pepenjurunya berbeza: $AC^2 = ${AC2}$ manakala $A'C'^2 = ${A1C1}$, jadi jarak tidak semuanya dikekalkan (sudut pada $B'$ tidak lagi $90^\\circ$).`), w: W(T(`Image sides: $A'B'^2 = ${d2(A1, B1)}$, $B'C'^2 = ${d2(B1, C1)}$, $C'D'^2 = ${d2(C1, D1)}$, $D'A'^2 = ${d2(D1, A1)}$ — all ${s * s}, so every side still has length ${s}.`, `Sisi imej: $A'B'^2 = ${d2(A1, B1)}$, $B'C'^2 = ${d2(B1, C1)}$, $C'D'^2 = ${d2(C1, D1)}$, $D'A'^2 = ${d2(D1, A1)}$ — semuanya ${s * s}, jadi setiap sisi masih berpanjang ${s}.`), `$AC^2 = ${AC2}$`, `$A'C'^2 = ${A1C1}$`, T('The diagonal changes, so not every distance is preserved and the mapping is not an isometry (the square has been pushed over into a rhombus).', 'Pepenjuru berubah, jadi bukan setiap jarak dikekalkan dan pemetaan itu bukan isometri (segi empat sama telah ditolak menjadi rombus).')), sp: 'l' };
  });
  A111.push((r) => { // explain bank
    const bank = [
      ['Explain why the image of a shape under an isometry is congruent to the shape.', 'Terangkan mengapa imej suatu bentuk di bawah isometri kongruen dengan bentuk itu.', 'An isometry preserves all lengths and angles, so the image has the same size and shape as the object, which is what congruent means.', 'Isometri mengekalkan semua panjang dan sudut, jadi imej mempunyai saiz dan bentuk yang sama dengan objek, dan itulah maksud kongruen.'],
      ['A transformation keeps all angles but doubles all lengths. Is it an isometry? Is the image congruent to the object? Explain.', 'Suatu transformasi mengekalkan semua sudut tetapi menggandakan semua panjang. Adakah ia isometri? Adakah imej kongruen dengan objek? Terangkan.', 'It is not an isometry because lengths change, and the image is not congruent (it is similar, with scale factor 2).', 'Ia bukan isometri kerana panjang berubah, dan imej tidak kongruen (ia serupa, dengan faktor skala 2).'],
      ['Reflection reverses orientation but is still an isometry. Explain why these two facts do not contradict each other.', 'Pantulan menyongsangkan orientasi tetapi masih ialah isometri. Terangkan mengapa kedua-dua fakta ini tidak bercanggah.', 'An isometry only has to preserve distances and angle sizes. A mirror image has all the same lengths and angle sizes; only the direction round the shape is reversed.', 'Isometri hanya perlu mengekalkan jarak dan saiz sudut. Imej cermin mempunyai semua panjang dan saiz sudut yang sama; hanya arah mengelilingi bentuk itu yang disongsangkan.'],
      ['Explain how you can tell from the labels whether a shape and its image are related by a reflection rather than a translation or rotation.', 'Terangkan bagaimana anda boleh tahu daripada label sama ada suatu bentuk dan imejnya dikaitkan oleh pantulan dan bukan translasi atau putaran.', 'If $A, B, C$ go clockwise, then $A\', B\', C\'$ go anticlockwise for a reflection (orientation reversed), but in the same sense for a translation or rotation.', 'Jika $A, B, C$ mengikut arah jam, maka $A\', B\', C\'$ mengikut lawan arah jam bagi pantulan (orientasi disongsangkan), tetapi pada arah yang sama bagi translasi atau putaran.'],
      ['A student claims that a shape and its image under a rotation always overlap. Give a counterexample.', 'Seorang murid mendakwa bahawa suatu bentuk dan imejnya di bawah putaran sentiasa bertindih. Berikan satu contoh yang menyangkal.', 'Rotate a small square through $90^\\circ$ about a centre far away from it: the image is in a completely different place and does not overlap the object.', 'Putarkan segi empat sama kecil melalui $90^\\circ$ pada pusat yang jauh daripadanya: imej berada di tempat yang sama sekali berbeza dan tidak bertindih dengan objek.'],
      ['Which of the three isometries has no invariant points (points that stay where they are)? Explain, and state how many invariant points the other two have.', 'Antara tiga isometri, yang manakah tiada titik tak berubah (titik yang kekal di tempatnya)? Terangkan, dan nyatakan bilangan titik tak berubah bagi dua yang lain.', 'A translation: every point moves. A reflection has infinitely many invariant points (all points on the mirror line) and a rotation has exactly one (its centre).', 'Translasi: setiap titik bergerak. Pantulan mempunyai banyak titik tak berubah (semua titik pada garis cermin) dan putaran mempunyai tepat satu (pusatnya).'],
      ['Explain why distances between points are unchanged by an isometry, and why this makes the image congruent.', 'Terangkan mengapa jarak antara titik tidak berubah oleh isometri, dan mengapa ini menjadikan imej kongruen.', 'Every isometry moves the whole plane rigidly (slide, flip or turn), so the distance between any two points stays the same, and a shape with all its distances equal is congruent to the original.', 'Setiap isometri menggerakkan seluruh satah secara tegar (gelongsor, balik atau putar), jadi jarak antara mana-mana dua titik kekal sama, dan bentuk yang semua jaraknya sama adalah kongruen dengan bentuk asal.'],
      ['A map is drawn at scale 1 : 1000. Explain why the map is not an isometric image of the land, even though it has the same shape.', 'Sebuah peta dilukis pada skala 1 : 1000. Terangkan mengapa peta itu bukan imej isometri bagi tanah itu, walaupun ia mempunyai bentuk yang sama.', 'Lengths on the map are 1000 times smaller than in reality. Isometries preserve lengths, so a scale drawing is similar, not congruent.', 'Panjang pada peta 1000 kali lebih kecil daripada yang sebenar. Isometri mengekalkan panjang, jadi lukisan berskala adalah serupa, bukan kongruen.'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('Key facts: an isometry preserves all distances and angle sizes, so the image is congruent to the object; a translation has no invariant point, a reflection has a whole line of them and a rotation exactly one; and a reflection reverses orientation.', 'Fakta utama: isometri mengekalkan semua jarak dan saiz sudut, jadi imej kongruen dengan objek; translasi tiada titik tak berubah, pantulan mempunyai satu garis penuh titik tak berubah dan putaran tepat satu; dan pantulan menyongsangkan orientasi.'), T(b[2], b[3])), sp: 'm' };
  });
  A111.push((r) => { // statements
    const bank = [
      ['All isometries preserve area.', 'Semua isometri mengekalkan luas.', true],
      ['A reflection has exactly one invariant point.', 'Pantulan mempunyai tepat satu titik tak berubah.', false],
      ['A rotation through $180^\\circ$ has one invariant point.', 'Putaran melalui $180^\\circ$ mempunyai satu titik tak berubah.', true],
      ['A non-zero translation has no invariant point.', 'Translasi bukan sifar tiada titik tak berubah.', true],
      ['Any two congruent triangles are related by an isometry.', 'Mana-mana dua segi tiga kongruen dikaitkan oleh suatu isometri.', true],
      ['A transformation that preserves angles must be an isometry.', 'Transformasi yang mengekalkan sudut mestilah isometri.', false],
      ['An enlargement with scale factor 1 is an isometry.', 'Pembesaran dengan faktor skala 1 ialah isometri.', true],
      ['The image under a reflection has the same orientation as the object.', 'Imej di bawah pantulan mempunyai orientasi yang sama seperti objek.', false],
      ['A translation preserves orientation.', 'Translasi mengekalkan orientasi.', true],
      ['Under an isometry, parallel lines stay parallel.', 'Di bawah isometri, garis selari kekal selari.', true],
    ];
    const S4 = r.sample(bank, 4);
    need(S4.some((s) => s[2]) && S4.some((s) => !s[2]));
    const list = S4.map((s, i) => `<b>${'ABCD'[i]}.</b> ${s[0]}`).join('<br>'), listM = S4.map((s, i) => `<b>${'ABCD'[i]}.</b> ${s[1]}`).join('<br>');
    const ok = S4.map((s, i) => (s[2] ? 'ABCD'[i] : '')).join('');
    return { q: T(`Which of these statements are true?<br>${list}`, `Antara pernyataan berikut, yang manakah benar?<br>${listM}`), a: T(`${ok.split('').join(', ')} ${ok.length === 1 ? 'is' : 'are'} true; the others are false.`, `${ok.split('').join(', ')} benar; yang lain palsu.`), w: W(T('Use these facts: every isometry preserves lengths, angles and area; a translation has no invariant point, a reflection a whole mirror line of them and a rotation exactly one; a reflection reverses orientation; and preserving angles alone is not enough, since an enlargement does that too.', 'Gunakan fakta ini: setiap isometri mengekalkan panjang, sudut dan luas; translasi tiada titik tak berubah, pantulan mempunyai satu garis cermin penuh titik tak berubah dan putaran tepat satu; pantulan menyongsangkan orientasi; dan mengekalkan sudut sahaja tidak memadai, kerana pembesaran juga berbuat demikian.'), T(`Checking each statement against these: ${ok.split('').join(', ')} agree with them.`, `Menyemak setiap pernyataan dengan fakta ini: ${ok.split('').join(', ')} menepatinya.`)), sp: 'm' };
  });
  A111.push((r) => { // solve for x with equal measures
    const tr = r.pick(TYK), tn = TY[tr];
    const x = r.int(2, 9), a = r.int(2, 4), b = r.int(1, 8);
    const c = r.int(1, 5); // AB = a x + b ; A'B' = (a+c) x + b - c x ... choose form a x + b = (a - 1) x + b + x? simple: a x + b = c x + d with x
    const cc = a + r.pick([1, 2]), dd = a * x + b - cc * x;
    need(dd > -30 && cc !== a);
    const kind = r.pick(['len', 'ang']);
    if (kind === 'len') {
      const L = a * x + b;
      need(L > 0 && dd !== 0);
      return { q: T(`A ${tn.en} maps $AB$ onto $A'B'$. $AB = (${a}x + ${b})$ cm and $A'B' = (${cc}x ${dd < 0 ? '-' : '+'} ${Math.abs(dd)})$ cm. Find $x$ and the length of $AB$.`, `${SPM.cap(tn.ms)} memetakan $AB$ ke $A'B'$. $AB = (${a}x + ${b})$ cm dan $A'B' = (${cc}x ${dd < 0 ? '-' : '+'} ${Math.abs(dd)})$ cm. Cari $x$ dan panjang $AB$.`), a: T(`${a}x + ${b} = ${cc}x ${dd < 0 ? '-' : '+'} ${Math.abs(dd)}$ gives $x = ${x}$; $AB = ${L}$ cm.`.replace(/^/, '$'), `${a}x + ${b} = ${cc}x ${dd < 0 ? '-' : '+'} ${Math.abs(dd)}$ memberi $x = ${x}$; $AB = ${L}$ cm.`.replace(/^/, '$')), w: W(T(`A ${tn.en} is an isometry, so $AB = A'B'$.`, `${SPM.cap(tn.ms)} ialah isometri, jadi $AB = A'B'$.`), `$${a}x + ${b} = ${cc}x ${dd < 0 ? '-' : '+'} ${Math.abs(dd)}$`, `$${b - dd} = ${cc - a}x$`, `$x = ${x}$`, T(`$AB = ${a}(${x}) + ${b} = ${L}$ cm`)), sp: 'm' };
    }
    const A0 = 10 * a + b * 2, Ang = a * x + b + 30;
    const ang1 = a * x + 20 + b, ang2 = cc * x + (a * x + 20 + b - cc * x);
    const d3 = ang1 - cc * x;
    need(ang1 < 170 && ang1 > 10 && Math.abs(d3) < 60 && d3 !== 0);
    return { q: T(`Under a ${tn.en}, $\\angle PQR = (${a}x + ${20 + b})^\\circ$ is mapped onto $\\angle P'Q'R' = (${cc}x ${d3 < 0 ? '-' : '+'} ${Math.abs(d3)})^\\circ$. Find the value of $x$ and the size of $\\angle PQR$.`, `Di bawah ${tn.ms}, $\\angle PQR = (${a}x + ${20 + b})^\\circ$ dipetakan ke $\\angle P'Q'R' = (${cc}x ${d3 < 0 ? '-' : '+'} ${Math.abs(d3)})^\\circ$. Cari nilai $x$ dan saiz $\\angle PQR$.`), a: T(`$x = ${x}$; $\\angle PQR = ${ang1}^\\circ$`), w: W(T(`A ${tn.en} is an isometry, so $\\angle PQR = \\angle P'Q'R'$.`, `${SPM.cap(tn.ms)} ialah isometri, jadi $\\angle PQR = \\angle P'Q'R'$.`), `$${a}x + ${20 + b} = ${cc}x ${d3 < 0 ? '-' : '+'} ${Math.abs(d3)}$`, `$${20 + b - d3} = ${cc - a}x$`, `$x = ${x}$`, `$\\angle PQR = ${a}(${x}) + ${20 + b} = ${ang1}^\\circ$`), sp: 'm' };
  });
  A111.push((r) => { // orientation & displacement -> type from coordinates
    const c = typeCase(r, TYK, 3);
    const names = c.names, k = names.length;
    const O = c.O, I = c.I;
    const sa = (P) => (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1]);
    const so = sa(O), si = sa(I);
    const disp = O.map((p, i) => subv(I[i], p));
    const allSame = disp.every((d) => same(d, disp[0]));
    const ans = c.type === 'reflection' ? T(`Reflection: the signed area changes from ${so} to ${si} (the sign reverses), so the orientation is reversed.`, `Pantulan: luas bertanda berubah daripada ${so} kepada ${si} (tanda disongsangkan), jadi orientasi disongsangkan.`)
      : c.type === 'translation' ? T(`Translation: the orientation is the same (signed area ${so} and ${si}) and every vertex has the same displacement $${tv(disp[0])}$.`, `Translasi: orientasi sama (luas bertanda ${so} dan ${si}) dan setiap bucu mempunyai sesaran yang sama $${tv(disp[0])}$.`)
        : T(`Rotation: the orientation is the same (signed area ${so} and ${si}) but the displacements of the vertices are different, so it is not a translation.`, `Putaran: orientasi sama (luas bertanda ${so} dan ${si}) tetapi sesaran bucu berbeza, jadi ia bukan translasi.`);
    need(c.type !== 'translation' ? !allSame : allSame);
    const l3 = names.slice(0, 3);
    return { q: T(`One isometry maps triangle $${l3.join('')}$ with vertices $${vlist(l3, O.slice(0, 3))}$ onto $${l3.map((x) => x + "'").join('')}$ with vertices $${plist(l3, I.slice(0, 3), "'")}$. Decide whether it is a translation, a reflection or a rotation. Justify by (i) comparing the displacements of the vertices and (ii) comparing the direction of the vertex order (clockwise or anticlockwise) before and after.`, `Satu isometri memetakan segi tiga $${l3.join('')}$ dengan bucu $${vlist(l3, O.slice(0, 3))}$ ke $${l3.map((x) => x + "'").join('')}$ dengan bucu $${plist(l3, I.slice(0, 3), "'")}$. Tentukan sama ada ia translasi, pantulan atau putaran. Justifikasikan dengan (i) membandingkan sesaran bucu dan (ii) membandingkan arah susunan bucu (ikut atau lawan arah jam) sebelum dan selepas.`), fig: fig({ O, I, names, axes: true }), a: ans, w: W(T(`(i) Displacements: ${names.slice(0, 3).map((c, i) => `$${c} \\to ${c}'$ is $${tv(disp[i])}$`).join(', ')}.`, `(i) Sesaran: ${names.slice(0, 3).map((c, i) => `$${c} \\to ${c}'$ ialah $${tv(disp[i])}$`).join(', ')}.`), T(`(ii) Signed area: ${so} before the transformation and ${si} after it.`, `(ii) Luas bertanda: ${so} sebelum transformasi dan ${si} selepasnya.`), ans), sp: 'l' };
  });
  A111.push((r) => { // invariant points summary
    const t = r.pick(TYK), tn = TY[t];
    const cnt = { translation: T('none', 'tiada'), reflection: T('infinitely many: every point on the mirror line', 'tak terhingga banyaknya: setiap titik pada garis cermin'), rotation: T('exactly one: the centre of rotation', 'tepat satu: pusat putaran') }[t];
    const cond = { translation: T('by a non-zero vector', 'oleh vektor bukan sifar'), reflection: T('in a mirror line', 'pada satu garis cermin'), rotation: T('through an angle that is not a multiple of $360^\\circ$', 'melalui sudut yang bukan gandaan $360^\\circ$') }[t];
    const forms = [
      [`How many invariant points does a ${tn.en} ${cond.en} have? Describe them.`, `Berapakah bilangan titik tak berubah bagi ${tn.ms} ${cond.ms}? Huraikan titik itu.`],
      [`A shape is transformed by a ${tn.en} ${cond.en}. Which points of the plane (if any) stay where they are?`, `Suatu bentuk ditransformasikan oleh ${tn.ms} ${cond.ms}. Titik manakah pada satah (jika ada) yang kekal di tempatnya?`],
    ];
    const f = r.pick(forms);
    return { q: T(f[0], f[1]), a: cnt, w: W(T('A point is invariant when the transformation leaves it exactly where it is.', 'Suatu titik tak berubah apabila transformasi meninggalkannya tepat di tempatnya.'), T(`For a ${tn.en} ${cond.en}, the invariant points are ${cnt.en}.`, `Bagi ${tn.ms} ${cond.ms}, titik tak berubahnya ialah ${cnt.ms}.`)), sp: 's' };
  });
  A111.push((r) => { // multi-part with a reflection: images, lengths, what changes
    const l = r.pick(AX());
    const O = scalene(r, 4, 4), names = nm(r, 3);
    need(oneSide(O, l) && O.every((p) => ldist(p, l) >= 1));
    const I = O.map((p) => reflect(p, l));
    const ax = l.kind === 'y' ? T('$x$-axis', 'paksi-$x$') : T('$y$-axis', 'paksi-$y$');
    const d0 = d2(O[0], O[1]);
    return { q: T(`Triangle $${names.join('')}$ has vertices $${vlist(names, O)}$. (a) Find the image under a reflection in the ${ax.en}. (b) Show that $${names[0]}${names[1]}^2 = ${names[0]}'${names[1]}'^2$. (c) State one property that is preserved and one that is not.`, `Segi tiga $${names.join('')}$ mempunyai bucu $${vlist(names, O)}$. (a) Cari imej di bawah pantulan pada ${ax.ms}. (b) Tunjukkan bahawa $${names[0]}${names[1]}^2 = ${names[0]}'${names[1]}'^2$. (c) Nyatakan satu sifat yang dikekalkan dan satu yang tidak.`), a: T(`(a) $${plist(names, I, "'")}$ (b) both equal ${d2(O[0], O[1])} and ${d2(I[0], I[1])}: ${d2(O[0], O[1]) === d2(I[0], I[1]) ? 'equal' : 'differ'} (c) lengths are preserved; orientation is not (the image is a mirror image).`, `(a) $${plist(names, I, "'")}$ (b) ${d2(O[0], O[1])} dan ${d2(I[0], I[1])}: sama (c) panjang dikekalkan; orientasi tidak (imej ialah imej cermin).`), w: W(T('(a) Apply the reflection rule to each vertex.', '(a) Gunakan hukum pantulan pada setiap bucu.'), reflRule(l), ...mapAll(O, I, names), T(`(b) $${names[0]}${names[1]}^2 = ${d2(O[0], O[1])}$ and $${names[0]}'${names[1]}'^2 = ${d2(I[0], I[1])}$ — equal.`, `(b) $${names[0]}${names[1]}^2 = ${d2(O[0], O[1])}$ dan $${names[0]}'${names[1]}'^2 = ${d2(I[0], I[1])}$ — sama.`), T('(c) Lengths (and angles and area) are preserved; the orientation is not, because the image is a mirror image.', '(c) Panjang (dan sudut dan luas) dikekalkan; orientasi tidak, kerana imej ialah imej cermin.')), sp: 'l' };
  });
  A111.push((r) => { // match four scenarios
    const four = r.sample(SCEN, 4);
    need(four.some((s) => s.t === 'enlargement') || true);
    const list = four.map((s, i) => `(${['i', 'ii', 'iii', 'iv'][i]}) ${s.en}`).join('<br>'), listM = four.map((s, i) => `(${['i', 'ii', 'iii', 'iv'][i]}) ${s.ms}`).join('<br>');
    const non = four.filter((s) => s.t === 'enlargement').map((s) => ['i', 'ii', 'iii', 'iv'][four.indexOf(s)]);
    return { q: T(`Name the transformation in each situation and state which of them (if any) are not isometries.<br>${list}`, `Namakan transformasi dalam setiap situasi dan nyatakan yang manakah (jika ada) bukan isometri.<br>${listM}`), a: T(`${four.map((s, i) => `(${['i', 'ii', 'iii', 'iv'][i]}) ${TY[s.t].en}`).join('; ')}. Not isometries: ${non.length ? non.map((x) => '(' + x + ')').join(', ') : 'none'}.`, `${four.map((s, i) => `(${['i', 'ii', 'iii', 'iv'][i]}) ${TY[s.t].ms}`).join('; ')}. Bukan isometri: ${non.length ? non.map((x) => '(' + x + ')').join(', ') : 'tiada'}.`), w: W(T('Slide $=$ translation, flip $=$ reflection, turn $=$ rotation, change of size $=$ enlargement (the only one that is not an isometry).', 'Gelongsor $=$ translasi, balik $=$ pantulan, putar $=$ putaran, perubahan saiz $=$ pembesaran (satu-satunya yang bukan isometri).'), ...four.map((s, i) => T(`(${['i', 'ii', 'iii', 'iv'][i]}) ${TY[s.t].en}${s.t === 'enlargement' ? ' — not an isometry' : ''}`, `(${['i', 'ii', 'iii', 'iv'][i]}) ${TY[s.t].ms}${s.t === 'enlargement' ? ' — bukan isometri' : ''}`))), sp: 'l' };
  });
  A111.push((r) => { // can an isometry map triangle sides
    const a = [r.int(3, 9), r.int(3, 9), r.int(3, 9)];
    need(a[0] + a[1] > a[2] && a[1] + a[2] > a[0] && a[0] + a[2] > a[1]);
    const yes = r.chance();
    const b = yes ? r.shuffle(a) : [a[0], a[1], a[2] + r.pick([1, 2])];
    need(yes || (b[0] + b[1] > b[2]));
    need(yes ? true : a.join() !== b.join() && b.slice().sort().join() !== a.slice().sort().join());
    return { q: T(`Triangle $XYZ$ has sides ${a.join(' cm, ')} cm and triangle $X'Y'Z'$ has sides ${b.join(' cm, ')} cm. Can an isometry map $XYZ$ onto $X'Y'Z'$? Explain your answer.`, `Segi tiga $XYZ$ mempunyai sisi ${a.join(' cm, ')} cm dan segi tiga $X'Y'Z'$ mempunyai sisi ${b.join(' cm, ')} cm. Bolehkah suatu isometri memetakan $XYZ$ ke $X'Y'Z'$? Terangkan jawapan anda.`), a: yes ? T('Yes: both triangles have the same three side lengths, so they are congruent and an isometry maps one onto the other.', 'Ya: kedua-dua segi tiga mempunyai tiga panjang sisi yang sama, jadi ia kongruen dan suatu isometri memetakan satu ke atas yang lain.') : T('No: the side lengths are not the same, so the triangles are not congruent and no isometry can map one onto the other.', 'Tidak: panjang sisi tidak sama, jadi segi tiga itu tidak kongruen dan tiada isometri yang boleh memetakan satu ke atas yang lain.'), w: W(T('An isometry maps a shape onto a congruent shape, so the two triangles must have exactly the same three side lengths.', 'Isometri memetakan suatu bentuk kepada bentuk yang kongruen, jadi kedua-dua segi tiga mesti mempunyai tiga panjang sisi yang sama tepat.'), T(`In order: ${a.slice().sort((x, y) => x - y).join(', ')} cm and ${b.slice().sort((x, y) => x - y).join(', ')} cm.`, `Mengikut tertib: ${a.slice().sort((x, y) => x - y).join(', ')} cm dan ${b.slice().sort((x, y) => x - y).join(', ')} cm.`), yes ? T('They match, so the triangles are congruent and such an isometry exists.', 'Kedua-duanya sepadan, jadi segi tiga itu kongruen dan isometri sedemikian wujud.') : T('They do not match, so no isometry can map one onto the other.', 'Kedua-duanya tidak sepadan, jadi tiada isometri yang boleh memetakan satu ke atas yang lain.')), sp: 'm' };
  });
  A111.push((r) => { // show translation from vectors
    const O = shape(r, r.pick(['quad', 'tri']), 3), names = nm(r, O.length), v = vec(r, 4, true);
    const I = O.map((p) => addv(p, v));
    need(inb(I, 8));
    const vs = O.map((p, i) => tv(subv(I[i], p)));
    return { q: T(`${SPM.cap(noun(O.length).en)} $${names.join('')}$ has vertices $${vlist(names, O)}$ and its image has vertices $${plist(names, I, "'")}$. Show that the mapping is a translation and state the vector.`, `${SPM.cap(noun(O.length).ms)} $${names.join('')}$ mempunyai bucu $${vlist(names, O)}$ dan imejnya mempunyai bucu $${plist(names, I, "'")}$. Tunjukkan bahawa pemetaan itu ialah translasi dan nyatakan vektornya.`), a: T(`Every vertex has the same displacement: ${names.map((c, i) => `$${c} \\to ${c}'$: $${vs[i]}$`).join(', ')}. So it is a translation by $${tv(v)}$.`, `Setiap bucu mempunyai sesaran yang sama: ${names.map((c, i) => `$${c} \\to ${c}'$: $${vs[i]}$`).join(', ')}. Jadi ia translasi oleh $${tv(v)}$.`), w: W(T('Find the displacement of every vertex (image minus object).', 'Cari sesaran setiap bucu (imej tolak objek).'), ...names.map((c, i) => T(`$${c} \\to ${c}'$: $${vs[i]}$`, `$${c} \\to ${c}'$: $${vs[i]}$`)), T(`All the displacements are equal, which is exactly what a translation does, so the mapping is the translation $${tv(v)}$.`, `Semua sesaran adalah sama, iaitu tepat apa yang dilakukan oleh translasi, jadi pemetaan itu ialah translasi $${tv(v)}$.`)), sp: 'l' };
  });

  /* ===================================================== 11.6 Congruency and similarity */
  const E116 = [], M116 = [], A116 = [];
  const CL = {
    cong: T('Congruent', 'Kongruen'), sim: T('Similar but not congruent', 'Serupa tetapi tidak kongruen'), none: T('Neither congruent nor similar', 'Tidak kongruen dan tidak serupa'),
  };
  const fr = (a, b) => SPM.Fr.make(a, b);
  const frT = (f) => SPM.Fr.tex(f);
  const sortN = (a) => a.slice().sort((x, y) => x - y);
  /** compare two lists of corresponding-length data (already sorted in matching order): returns {kind, k:Fr} */
  const cmpLists = (a, b) => {
    if (a.every((v, i) => v === b[i])) return { kind: 'cong', k: fr(1, 1) };
    const k = fr(b[0], a[0]);
    if (a.every((v, i) => SPM.Fr.eq(fr(b[i], v), k))) return { kind: 'sim', k };
    return { kind: 'none' };
  };
  const RL = [ // real-life congruent / similar / neither
    { c: 'cong', en: 'two 50 sen coins', ms: 'dua keping syiling 50 sen' },
    { c: 'cong', en: 'two floor tiles from the same box', ms: 'dua keping jubin lantai daripada kotak yang sama' },
    { c: 'cong', en: 'the two doors of a double door', ms: 'dua daun pintu bagi sebuah pintu dua daun' },
    { c: 'cong', en: 'two sheets of A4 paper', ms: 'dua helai kertas A4' },
    { c: 'cong', en: 'two prints of a photograph made at the same size', ms: 'dua salinan cetakan sekeping gambar pada saiz yang sama' },
    { c: 'cong', en: 'the front cover and the back cover of a textbook', ms: 'kulit hadapan dan kulit belakang sebuah buku teks' },
    { c: 'cong', en: 'two identical windows in a school building', ms: 'dua tingkap yang serupa dalam sebuah bangunan sekolah' },
    { c: 'sim', en: 'a photograph and its enlargement to twice the size', ms: 'sekeping gambar dan pembesarannya kepada dua kali ganda saiz' },
    { c: 'sim', en: 'a model car and the real car it copies', ms: 'sebuah kereta model dan kereta sebenar yang ditiru' },
    { c: 'sim', en: 'the school badge on a shirt and the same badge on a large banner', ms: 'lencana sekolah pada baju dan lencana yang sama pada sepanduk besar' },
    { c: 'sim', en: 'a small square and a large square', ms: 'sebuah segi empat sama yang kecil dan sebuah yang besar' },
    { c: 'sim', en: 'a room and its floor plan drawn to scale', ms: 'sebuah bilik dan pelan lantainya yang dilukis berskala' },
    { c: 'sim', en: 'a stamp and a poster of the same design', ms: 'sekeping setem dan poster yang mempunyai rekaan yang sama' },
    { c: 'sim', en: 'two equilateral triangles of different sizes', ms: 'dua segi tiga sama sisi yang berlainan saiz' },
    { c: 'none', en: 'a 4 cm by 6 cm photograph stretched to 8 cm by 6 cm', ms: 'gambar 4 cm kali 6 cm yang diregangkan kepada 8 cm kali 6 cm' },
    { c: 'none', en: 'a square and a rectangle that is not a square', ms: 'sebuah segi empat sama dan sebuah segi empat tepat yang bukan segi empat sama' },
    { c: 'none', en: 'a right-angled triangle and an equilateral triangle', ms: 'sebuah segi tiga bersudut tegak dan sebuah segi tiga sama sisi' },
    { c: 'none', en: 'a rectangle 2 cm by 8 cm and a rectangle 4 cm by 5 cm', ms: 'sebuah segi empat tepat 2 cm kali 8 cm dan sebuah segi empat tepat 4 cm kali 5 cm' },
    { c: 'none', en: 'a wide picture on a widescreen and the same picture squashed into a square frame', ms: 'gambar lebar pada skrin lebar dan gambar yang sama yang dihimpit dalam bingkai segi empat sama' },
  ];
  /* ---- figure: a row of triangles / rectangles drawn to a common scale ---- */
  const triPts = (p, q, r) => { const x = (p * p + r * r - q * q) / (2 * p), y = Math.sqrt(Math.max(r * r - x * x, 0)); return [[0, 0], [p, 0], [x, y]]; };
  const shapeRow = (specs, o) => {
    o = o || {};
    // specs: {pts, lab:[side labels], name, flip, rot}
    const placed = specs.map((s) => {
      let P = s.pts.map((p) => p.slice());
      if (s.flip) P = P.map((p) => [-p[0], p[1]]);
      for (let i = 0; i < (s.rot || 0); i++) P = P.map((p) => [-p[1], p[0]]);
      const mx = Math.min(...P.map((p) => p[0])), my = Math.min(...P.map((p) => p[1]));
      P = P.map((p) => [p[0] - mx, p[1] - my]);
      return { P, w: Math.max(...P.map((p) => p[0])), h: Math.max(...P.map((p) => p[1])), s };
    });
    const gapPx = 58, sumW = placed.reduce((a, q) => a + q.w, 0), maxH = Math.max(...placed.map((q) => q.h));
    const sc = Math.min(o.maxSc || 30, (310 - gapPx * (placed.length - 1)) / sumW, 150 / maxH);
    const W = sumW * sc + gapPx * (placed.length - 1) + 90, H = maxH * sc + 60;
    let x0 = 40, out = '';
    for (const q of placed) {
      const base = 20 + (maxH - q.h) * sc;
      const Q = q.P.map((p) => [x0 + p[0] * sc, base + (q.h - p[1]) * sc]);
      out += S.poly(Q, { fill: 'currentColor', op: 0.1 });
      const c = [Q.reduce((a, p) => a + p[0], 0) / Q.length, Q.reduce((a, p) => a + p[1], 0) / Q.length];
      (q.s.lab || []).forEach((t, i) => {
        if (!t) return;
        const A = Q[i], B = Q[(i + 1) % Q.length];
        const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        const ex = B[0] - A[0], ey = B[1] - A[1], el = Math.hypot(ex, ey) || 1;
        let nx = -ey / el, ny = ex / el;
        if ((mx - c[0]) * nx + (my - c[1]) * ny < 0) { nx = -nx; ny = -ny; }
        const d = 9 + 15 * Math.abs(nx) + 4 * Math.abs(ny);
        out += S.text(mx + nx * d, my + ny * d, t, { s: 11 });
      });
      if (q.s.name) out += S.text(x0 + (q.w * sc) / 2, base + q.h * sc + 26, q.s.name, { i: true, b: true, s: 13 });
      x0 += q.w * sc + gapPx;
    }
    return S.wrap(W, H, out, 'shapes');
  };
  const triSpec = (sides, name, o) => Object.assign({ pts: triPts(sides[0], sides[1], sides[2]), lab: [`${sides[0]} cm`, `${sides[1]} cm`, `${sides[2]} cm`], name }, o || {});
  const rectSpec = (w, h, name, o) => Object.assign({ pts: [[0, 0], [w, 0], [w, h], [0, h]], lab: [`${w} cm`, `${h} cm`, `${w} cm`, `${h} cm`].map((t, i) => (i < 2 ? t : '')), name }, o || {});
  const TRIS = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [4, 5, 6], [5, 6, 7], [6, 7, 9], [4, 6, 8], [7, 8, 9], [8, 15, 17], [5, 7, 9], [4, 7, 9], [6, 9, 11]];
  const cpFig = (r, base) => { // candidate figure for congruent / similar / other shapes
    const norm = (P) => { const a = Math.min(...P.map((p) => p[0])), b = Math.min(...P.map((p) => p[1])); return P.map((p) => [p[0] - a, p[1] - b]); };
    const B0 = norm(base);
    const t1 = r.pick([1, 2, 3, 4, 5, 6, 7]), t2 = r.pick([0, 1, 2, 3, 4, 5, 6, 7]), t3 = r.pick([0, 1, 2, 3, 4, 5, 6, 7]);
    const cong = norm(B0.map((p) => dih(p, t1)));
    const sim = norm(B0.map((p) => dih([p[0] * 2, p[1] * 2], t2)));
    const non = norm(B0.map((p) => dih([p[0] * 2, p[1]], t3)));
    return { B0, cong, sim, non };
  };


  const candItems = (parts) => {
    // parts: [{P, s}] placed in a row on a grid without axes
    let x = 0; const items = []; let maxH = 0;
    for (const q of parts) {
      const w = Math.max(...q.P.map((p) => p[0])), h = Math.max(...q.P.map((p) => p[1]));
      const P = q.P.map((p) => [p[0] + x, p[1]]);
      items.push({ t: 'poly', p: P, style: 'obj', nolab: true });
      items.push({ t: 'text', p: [x + w / 2, -1.1], s: q.s });
      x += w + 2; maxH = Math.max(maxH, h);
    }
    return { items, win: [-1, x - 1, -2, maxH + 1] };
  };

  /* ---- easy ---- */
  E116.push((r) => { // real-life classification (three categories)
    const it = r.pick(RL);
    const forms = [
      ["Are {x} congruent, similar but not congruent, or neither?", "Adakah {x} kongruen, serupa tetapi tidak kongruen, atau tidak kedua-duanya?"],
      ["Classify the pair as congruent, similar only, or neither: {x}.", "Kelaskan pasangan itu sebagai kongruen, serupa sahaja, atau tidak kedua-duanya: {x}."],
    ];
    const ans = it.c === 'cong' ? T('Congruent: same shape and same size.', 'Kongruen: bentuk dan saiz yang sama.') : it.c === 'sim' ? T('Similar but not congruent: same shape, different size.', 'Serupa tetapi tidak kongruen: bentuk yang sama, saiz berbeza.') : T('Neither: the shapes are not the same.', 'Tidak kedua-duanya: bentuknya tidak sama.');
    return { q: fill(r.pick(forms), { x: T(it.en, it.ms) }), a: ans, w: W(T('Congruent $=$ same shape and same size; similar $=$ same shape with all lengths in the same ratio; neither $=$ the shapes are not the same.', 'Kongruen $=$ bentuk dan saiz yang sama; serupa $=$ bentuk yang sama dengan semua panjang dalam nisbah yang sama; tidak kedua-duanya $=$ bentuknya tidak sama.'), ans), sp: 's' };
  });
  E116.push((r) => { // yes/no congruent for real-life items
    const it = r.pick(RL);
    return { q: T(`Do ${it.en} have exactly the same shape and size? Are they congruent?`, `Adakah ${it.ms} mempunyai bentuk dan saiz yang tepat sama? Adakah ia kongruen?`), a: it.c === 'cong' ? T('Yes: same shape and size, so they are congruent.', 'Ya: bentuk dan saiz yang sama, jadi ia kongruen.') : T(it.c === 'sim' ? 'No: the shape is the same but the sizes are different.' : 'No: the shapes are different.', it.c === 'sim' ? 'Tidak: bentuknya sama tetapi saiznya berbeza.' : 'Tidak: bentuknya berbeza.'), w: W(T('Congruent means exactly the same shape and exactly the same size.', 'Kongruen bermaksud bentuk yang tepat sama dan saiz yang tepat sama.'), it.c === 'cong' ? T('These two match in both shape and size, so they are congruent.', 'Kedua-duanya sepadan dari segi bentuk dan saiz, jadi ia kongruen.') : it.c === 'sim' ? T('These two have the same shape but different sizes, so they are similar only.', 'Kedua-duanya mempunyai bentuk yang sama tetapi saiz berbeza, jadi ia serupa sahaja.') : T('These two do not even have the same shape, so they are neither.', 'Kedua-duanya tidak mempunyai bentuk yang sama, jadi ia tidak kedua-duanya.')), sp: 's' };
  });
  E116.push((r) => { // T/F bank
    const bank = [
      ['Congruent shapes have the same shape and the same size.', 'Bentuk kongruen mempunyai bentuk dan saiz yang sama.', true, 'That is the definition of congruent.', 'Itulah takrif kongruen.'],
      ['Similar shapes always have the same size.', 'Bentuk serupa sentiasa mempunyai saiz yang sama.', false, 'Similar shapes have the same shape, but the sizes can differ.', 'Bentuk serupa mempunyai bentuk yang sama, tetapi saiznya boleh berbeza.'],
      ['Two squares of different sizes are similar.', 'Dua segi empat sama yang berlainan saiz adalah serupa.', true, 'They have the same shape.', 'Kedua-duanya mempunyai bentuk yang sama.'],
      ['Two squares with side 5 cm are congruent.', 'Dua segi empat sama bersisi 5 cm adalah kongruen.', true, 'They have the same shape and the same size.', 'Kedua-duanya mempunyai bentuk dan saiz yang sama.'],
      ['A square and a rectangle that is not a square are similar.', 'Segi empat sama dan segi empat tepat yang bukan segi empat sama adalah serupa.', false, 'Their side ratios are different, so the shapes are not the same.', 'Nisbah sisinya berbeza, jadi bentuknya tidak sama.'],
      ['Congruent shapes can be turned or flipped and still be congruent.', 'Bentuk kongruen boleh diputar atau dibalikkan dan masih kongruen.', true, 'Position and orientation do not matter for congruency.', 'Kedudukan dan orientasi tidak penting bagi kekongruenan.'],
      ['The image of a translation is congruent to the object.', 'Imej translasi kongruen dengan objek.', true, 'A translation preserves size and shape.', 'Translasi mengekalkan saiz dan bentuk.'],
      ['The image of a reflection is congruent to the object.', 'Imej pantulan kongruen dengan objek.', true, 'A reflection preserves size and shape.', 'Pantulan mengekalkan saiz dan bentuk.'],
      ['The image of a rotation is congruent to the object.', 'Imej putaran kongruen dengan objek.', true, 'A rotation preserves size and shape.', 'Putaran mengekalkan saiz dan bentuk.'],
      ['Two triangles with the same three side lengths are congruent.', 'Dua segi tiga dengan tiga panjang sisi yang sama adalah kongruen.', true, 'All corresponding sides are equal.', 'Semua sisi sepadan adalah sama.'],
      ['Two circles with different radii are congruent.', 'Dua bulatan dengan jejari berbeza adalah kongruen.', false, 'They are similar, but the sizes differ.', 'Kedua-duanya serupa, tetapi saiznya berbeza.'],
      ['All equilateral triangles are similar.', 'Semua segi tiga sama sisi adalah serupa.', true, 'All their angles are $60^\\circ$, so they have the same shape.', 'Semua sudutnya $60^\\circ$, jadi ia mempunyai bentuk yang sama.'],
    ];
    const b = r.pick(bank);
    return { q: T(`True or false? ${b[0]}`, `Benar atau palsu? ${b[1]}`), a: T(`${b[2] ? 'True' : 'False'}. ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}. ${b[4]}`), w: W(T('Congruent $=$ same shape and same size; similar $=$ same shape with all lengths in the same ratio; every congruent pair is also similar, with scale factor $1$.', 'Kongruen $=$ bentuk dan saiz yang sama; serupa $=$ bentuk yang sama dengan semua panjang dalam nisbah yang sama; setiap pasangan kongruen juga serupa, dengan faktor skala $1$.'), T(`${b[2] ? 'True' : 'False'}: ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}: ${b[4]}`)), sp: 's' };
  });
  E116.push((r) => { // triangles with sides: which pair are congruent (figure)
    const t1 = r.pick(TRIS), t2 = r.pick(TRIS.filter((t) => t !== t1 && t.join() !== t1.join()));
    const three = r.shuffle([{ s: t1, n: 'P' }, { s: t1, n: 'Q', flip: true, rot: r.int(1, 3) }, { s: t2, n: 'R', rot: r.int(0, 3) }]);
    const names = ['P', 'Q', 'R'].sort(() => 0);
    const spec = three.map((o, i) => triSpec(o.s, 'PQR'[i], { flip: o.flip, rot: o.rot }));
    const same2 = three.map((o, i) => (o.s === t1 ? 'PQR'[i] : null)).filter(Boolean);
    return { q: T('Which two of the triangles $P$, $Q$ and $R$ in the diagram are congruent?', 'Antara segi tiga $P$, $Q$ dan $R$ dalam rajah, yang manakah dua segi tiga yang kongruen?'), fig: shapeRow(spec), a: T(`$${same2.join('$ and $')}$: their three sides are equal (${t1.join(', ')} cm), even though one is turned or flipped.`, `$${same2.join('$ dan $')}$: ketiga-tiga sisinya sama (${t1.join(', ')} cm), walaupun satu diputar atau dibalikkan.`), w: W(T('Congruent triangles have the same three side lengths; turning or flipping a triangle does not change them.', 'Segi tiga kongruen mempunyai tiga panjang sisi yang sama; memutar atau membalikkan segi tiga tidak mengubahnya.'), T(`Two of the triangles have sides ${t1.join(', ')} cm; the other has ${t2.join(', ')} cm.`, `Dua daripada segi tiga itu mempunyai sisi ${t1.join(', ')} cm; yang satu lagi mempunyai ${t2.join(', ')} cm.`), T(`So $${same2.join('$ and $')}$ are the congruent pair.`, `Jadi $${same2.join('$ dan $')}$ ialah pasangan yang kongruen.`)), sp: 's' };
  });
  E116.push((r) => { // rectangles: which pairs congruent
    const w = r.int(2, 6), h = r.int(w + 1, 9);
    const other = [r.int(2, 5), r.int(6, 9)];
    need(!(other[0] === w && other[1] === h));
    const a = r.chance() ? [w, h] : [h, w];
    const three = r.shuffle([{ d: [w, h], n: 'A' }, { d: [h, w], n: 'B' }, { d: other, n: 'C' }]);
    const spec = three.map((o, i) => rectSpec(o.d[0], o.d[1], 'ABC'[i]));
    const same2 = three.map((o, i) => (o.d.slice().sort().join() === [w, h].sort().join() && o.d.join() !== other.join() ? 'ABC'[i] : null)).filter(Boolean);
    need(same2.length === 2);
    return { q: T('The diagram shows three rectangles. Which two are congruent? Give a reason.', 'Rajah menunjukkan tiga segi empat tepat. Yang manakah dua yang kongruen? Berikan sebab.'), fig: shapeRow(spec), a: T(`$${same2.join('$ and $')}$: both measure ${w} cm by ${h} cm (one is turned through a right angle).`, `$${same2.join('$ dan $')}$: kedua-duanya berukuran ${w} cm kali ${h} cm (satu diputarkan melalui sudut tegak).`), w: W(T('Congruent rectangles have the same pair of side lengths, even if one of them is turned.', 'Segi empat tepat kongruen mempunyai pasangan panjang sisi yang sama, walaupun salah satunya diputarkan.'), T(`Two of them measure ${w} cm by ${h} cm; the third measures ${other[0]} cm by ${other[1]} cm.`, `Dua daripadanya berukuran ${w} cm kali ${h} cm; yang ketiga berukuran ${other[0]} cm kali ${other[1]} cm.`), T(`So $${same2.join('$ and $')}$ are congruent.`, `Jadi $${same2.join('$ dan $')}$ adalah kongruen.`)), sp: 's' };
  });
  E116.push((r) => { // grid candidate figure: which is congruent
    const base = asymShape(r, 2);
    const c = cpFig(r, base);
    const cand = r.shuffle([{ P: c.cong, k: 'cong' }, { P: c.sim, k: 'sim' }, { P: c.non, k: 'none' }]);
    const parts = [{ P: c.B0, s: 'A' }].concat(cand.map((o, i) => ({ P: o.P, s: 'BCD'[i] })));
    const ci = 'BCD'[cand.findIndex((o) => o.k === 'cong')];
    const cf = candItems(parts);
    return { q: T('Which of the shapes $B$, $C$ and $D$ is congruent to shape $A$? Give a reason.', 'Antara bentuk $B$, $C$ dan $D$, yang manakah kongruen dengan bentuk $A$? Berikan sebab.'), fig: render({ items: cf.items, axes: false, win: cf.win }), a: T(`Shape $${ci}$: it has exactly the same size and shape as $A$ (it is only turned or flipped).`, `Bentuk $${ci}$: ia mempunyai saiz dan bentuk yang tepat sama seperti $A$ (ia hanya diputar atau dibalikkan).`), w: W(T('Congruent means the same size and the same shape, so count the grid squares across and up for each shape.', 'Kongruen bermaksud saiz dan bentuk yang sama, jadi kira petak grid melintang dan menegak bagi setiap bentuk.'), T(`Only shape $${ci}$ has the same measurements as $A$; the others are enlarged or stretched.`, `Hanya bentuk $${ci}$ mempunyai ukuran yang sama dengan $A$; yang lain dibesarkan atau diregangkan.`)), sp: 's' };
  });
  E116.push((r) => { // definition MCQ
    const bank = [
      ['congruent shapes', 'bentuk kongruen', 'the same shape and the same size', 'bentuk dan saiz yang sama'],
      ['similar shapes', 'bentuk serupa', 'the same shape, with all lengths in the same ratio', 'bentuk yang sama, dengan semua panjang dalam nisbah yang sama'],
    ];
    const b = r.pick(bank);
    const wrong = [['a different shape but the same size', 'bentuk yang berbeza tetapi saiz yang sama'], ['a different shape and a different size', 'bentuk dan saiz yang berbeza'], [b === bank[0] ? 'the same shape but always a different size' : 'the same size and the same shape', b === bank[0] ? 'bentuk yang sama tetapi saiz yang sentiasa berbeza' : 'saiz dan bentuk yang sama']];
    const m = mcq(r, T(b[2], b[3]), wrong.map((w) => T(w[0], w[1])));
    return { q: T(`${SPM.cap(b[0])} have:${m.opts.en}`, `${SPM.cap(b[1])} mempunyai:${m.opts.ms}`), a: m.ans, w: W(T('Congruent shapes have the same shape and the same size; similar shapes have the same shape with all lengths in the same ratio.', 'Bentuk kongruen mempunyai bentuk dan saiz yang sama; bentuk serupa mempunyai bentuk yang sama dengan semua panjang dalam nisbah yang sama.'), T(`So ${b[0]} have ${b[2]} — answer ${m.letter}.`, `Jadi ${b[1]} mempunyai ${b[3]} — jawapan ${m.letter}.`)), sp: 's' };
  });
  E116.push((r) => { // isometry images are congruent
    const t = r.pick(TYK), tn = TY[t];
    const forms = [
      [`A shape is moved by a ${tn.en}. Is the image congruent to the object? Give a reason.`, `Suatu bentuk digerakkan oleh ${tn.ms}. Adakah imej kongruen dengan objek? Berikan sebab.`],
      [`Triangle $ABC$ is mapped onto triangle $A'B'C'$ by a ${tn.en}. What can you say about the two triangles?`, `Segi tiga $ABC$ dipetakan ke segi tiga $A'B'C'$ oleh ${tn.ms}. Apakah yang boleh anda katakan tentang kedua-dua segi tiga itu?`],
    ];
    return { q: T(...r.pick(forms)), a: T('They are congruent: a ' + tn.en + ' is an isometry, so lengths and angles are preserved.', 'Kedua-duanya kongruen: ' + tn.ms + ' ialah isometri, jadi panjang dan sudut dikekalkan.'), w: W(T('An isometry preserves every length and every angle.', 'Isometri mengekalkan setiap panjang dan setiap sudut.'), T(`A ${tn.en} is an isometry, so the image has the same size and shape as the object: they are congruent.`, `${SPM.cap(tn.ms)} ialah isometri, jadi imej mempunyai saiz dan bentuk yang sama dengan objek: kedua-duanya kongruen.`)), sp: 's' };
  });
  E116.push((r) => { // fill in the blank
    const bank = [
      ['Complete: shapes that have the same shape and size are called ______.', 'Lengkapkan: bentuk yang mempunyai bentuk dan saiz yang sama dipanggil ______.', 'congruent', 'kongruen'],
      ['Complete: shapes that have the same shape but not necessarily the same size are called ______.', 'Lengkapkan: bentuk yang mempunyai bentuk yang sama tetapi tidak semestinya saiz yang sama dipanggil ______.', 'similar', 'serupa'],
      ['Complete: all congruent shapes are also ______.', 'Lengkapkan: semua bentuk kongruen juga ______.', 'similar', 'serupa'],
      ['Complete: the image of an isometry is ______ to the object.', 'Lengkapkan: imej bagi isometri adalah ______ dengan objek.', 'congruent', 'kongruen'],
      ['Complete: the vertices that match each other in two congruent shapes are called ______ vertices.', 'Lengkapkan: bucu yang sepadan antara dua bentuk kongruen dipanggil bucu ______.', 'corresponding', 'sepadan'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('Recall: congruent $=$ same shape and size, similar $=$ same shape, the image of an isometry is congruent to the object, and matching vertices are called corresponding vertices.', 'Ingat: kongruen $=$ bentuk dan saiz yang sama, serupa $=$ bentuk yang sama, imej bagi isometri kongruen dengan objek, dan bucu yang sepadan dipanggil bucu sepadan.'), T(`The word that fits is "${b[2]}".`, `Perkataan yang sesuai ialah "${b[3]}".`)), sp: 's' };
  });
  E116.push((r) => { // equal sides: congruent yes/no for two triangles
    const t1 = r.pick(TRIS), kind = r.pick(['same', 'diff']);
    const t2 = kind === 'same' ? r.shuffle(t1) : r.pick(TRIS.filter((t) => t.join() !== t1.join()));
    const forms = [
      [`Triangle $ABC$ has sides ${t1.join(' cm, ')} cm. Triangle $DEF$ has sides ${t2.join(' cm, ')} cm. Are the two triangles congruent?`, `Segi tiga $ABC$ mempunyai sisi ${t1.join(' cm, ')} cm. Segi tiga $DEF$ mempunyai sisi ${t2.join(' cm, ')} cm. Adakah kedua-dua segi tiga itu kongruen?`],
    ];
    return { q: T(...forms[0]), a: kind === 'same' ? T('Yes: the three side lengths are the same.', 'Ya: ketiga-tiga panjang sisi adalah sama.') : T('No: the side lengths are different.', 'Tidak: panjang sisi berbeza.'), w: W(T('Two triangles are congruent when all three pairs of corresponding sides are equal (SSS).', 'Dua segi tiga kongruen apabila ketiga-tiga pasangan sisi sepadan adalah sama (SSS).'), T(`In order of size: ${sortN(t1).join(', ')} cm and ${sortN(t2).join(', ')} cm.`, `Mengikut tertib saiz: ${sortN(t1).join(', ')} cm dan ${sortN(t2).join(', ')} cm.`), kind === 'same' ? T('They match, so the triangles are congruent.', 'Kedua-duanya sepadan, jadi segi tiga itu kongruen.') : T('They do not match, so the triangles are not congruent.', 'Kedua-duanya tidak sepadan, jadi segi tiga itu tidak kongruen.')), sp: 's' };
  });
  E116.push((r) => { // same measure of corresponding parts
    const len = r.int(3, 12), ang = r.step(30, 120, 5);
    const forms = [
      [`Triangle $PQR$ is congruent to triangle $XYZ$ with $P$ matching $X$, $Q$ matching $Y$ and $R$ matching $Z$. If $PQ = ${len}$ cm, what is $XY$?`, `Segi tiga $PQR$ kongruen dengan segi tiga $XYZ$ dengan $P$ sepadan dengan $X$, $Q$ dengan $Y$ dan $R$ dengan $Z$. Jika $PQ = ${len}$ cm, berapakah $XY$?`, `$XY = ${len}$ cm`],
      [`Triangle $PQR$ is congruent to triangle $XYZ$ with $P \\leftrightarrow X$, $Q \\leftrightarrow Y$, $R \\leftrightarrow Z$. If $\\angle Q = ${ang}^\\circ$, what is $\\angle Y$?`, `Segi tiga $PQR$ kongruen dengan segi tiga $XYZ$ dengan $P \\leftrightarrow X$, $Q \\leftrightarrow Y$, $R \\leftrightarrow Z$. Jika $\\angle Q = ${ang}^\\circ$, berapakah $\\angle Y$?`, `$\\angle Y = ${ang}^\\circ$`],
    ];
    const f = r.pick(forms);
    return { q: T(f[0], f[1]), a: T(f[2]), w: W(T('In congruent shapes the corresponding sides are equal and the corresponding angles are equal.', 'Dalam bentuk kongruen, sisi sepadan adalah sama dan sudut sepadan adalah sama.'), T('The matching is $P \\leftrightarrow X$, $Q \\leftrightarrow Y$, $R \\leftrightarrow Z$.', 'Padanannya ialah $P \\leftrightarrow X$, $Q \\leftrightarrow Y$, $R \\leftrightarrow Z$.'), T(f[2])), sp: 's' };
  });
  E116.push((r) => { // similar: ratio simple
    const a = r.int(2, 6), b = r.int(2, 6), k = r.pick([2, 3]);
    need(a !== b);
    return { q: T(`A rectangle measures ${a} cm by ${b} cm. A second rectangle measures ${a * k} cm by ${b * k} cm. Are the two rectangles congruent, similar or neither?`, `Sebuah segi empat tepat berukuran ${a} cm kali ${b} cm. Segi empat tepat kedua berukuran ${a * k} cm kali ${b * k} cm. Adakah kedua-dua segi empat tepat itu kongruen, serupa atau tidak kedua-duanya?`), a: T(`Similar but not congruent: every length is multiplied by ${k}.`, `Serupa tetapi tidak kongruen: setiap panjang didarab dengan ${k}.`), w: W(T('Compare the ratios of corresponding sides.', 'Bandingkan nisbah sisi sepadan.'), `$${a * k} : ${a} = ${k}$, $${b * k} : ${b} = ${k}$`, T(`Both ratios are ${k}, so the rectangles have the same shape: similar. Since ${k} is not 1 the sizes differ, so they are not congruent.`, `Kedua-dua nisbah ialah ${k}, jadi segi empat tepat itu mempunyai bentuk yang sama: serupa. Kerana ${k} bukan 1, saiznya berbeza, jadi ia tidak kongruen.`)), sp: 's' };
  });
  E116.push((r) => { // MCQ pair
    const opts = [
      ['two squares with sides 3 cm and 5 cm', 'dua segi empat sama bersisi 3 cm dan 5 cm', 'sim'], ['two circles with radius 4 cm', 'dua bulatan berjejari 4 cm', 'cong'], ['a square and a circle', 'sebuah segi empat sama dan sebuah bulatan', 'none'],
      ['two rectangles, each 6 cm by 2 cm', 'dua segi empat tepat, setiap satu 6 cm kali 2 cm', 'cong'], ['a rectangle 2 cm by 4 cm and a rectangle 4 cm by 8 cm', 'segi empat tepat 2 cm kali 4 cm dan segi empat tepat 4 cm kali 8 cm', 'sim'], ['a triangle and a square', 'sebuah segi tiga dan sebuah segi empat sama', 'none'],
    ];
    const kind = r.pick(['cong', 'sim']);
    const good = r.pick(opts.filter((o) => o[2] === kind)), bad = r.sample(opts.filter((o) => o[2] !== kind), 3);
    const m = mcq(r, T(good[0], good[1]), bad.map((o) => T(o[0], o[1])));
    return { q: kind === 'cong' ? T(`Which pair is congruent?${m.opts.en}`, `Pasangan yang manakah kongruen?${m.opts.ms}`) : T(`Which pair is similar but not congruent?${m.opts.en}`, `Pasangan yang manakah serupa tetapi tidak kongruen?${m.opts.ms}`), a: m.ans, w: W(T('Congruent $=$ same shape and same size; similar but not congruent $=$ same shape, different size.', 'Kongruen $=$ bentuk dan saiz yang sama; serupa tetapi tidak kongruen $=$ bentuk yang sama, saiz berbeza.'), T(`So the answer is ${m.letter}: ${good[0]}.`, `Jadi jawapannya ialah ${m.letter}: ${good[1]}.`)), sp: 's' };
  });


  /* ---- medium ---- */
  M116.push((r) => { // triangles by sides: three kinds
    const t = r.pick(TRIS), kind = r.pick(['cong', 'sim', 'none']);
    const k = r.pick([2, 3, 0.5].filter((v) => v >= 1 || t.every((x) => (x * v) % 1 === 0)));
    let b;
    if (kind === 'cong') b = r.shuffle(t);
    else if (kind === 'sim') b = t.map((v) => v * k);
    else b = r.pick([[t[0] + 1, t[1], t[2] + 1], [t[0], t[1] + 2, t[2] + 1], t.map((v, i) => (i === 0 ? v * 2 : v))]);
    need(b[0] + b[1] > b[2] && b[1] + b[2] > b[0] && b[0] + b[2] > b[1]);
    const cmp = cmpLists(sortN(t), sortN(b));
    need(cmp.kind === kind || kind === 'none' && cmp.kind === 'none');
    need(cmp.kind === kind);
    const forms = [
      ["Triangle $A$ has sides {a} cm and triangle $B$ has sides {b} cm. Compare corresponding sides and say whether the triangles are congruent, similar only, or neither.", "Segi tiga $A$ mempunyai sisi {a} cm dan segi tiga $B$ mempunyai sisi {b} cm. Bandingkan sisi sepadan dan nyatakan sama ada segi tiga itu kongruen, serupa sahaja, atau tidak kedua-duanya."],
      ["The sides of triangle $PQR$ are {a} cm and the sides of triangle $XYZ$ are {b} cm. Decide whether the two triangles are congruent, similar but not congruent, or neither, showing the ratios of corresponding sides.", "Sisi segi tiga $PQR$ ialah {a} cm dan sisi segi tiga $XYZ$ ialah {b} cm. Tentukan sama ada kedua-dua segi tiga itu kongruen, serupa tetapi tidak kongruen, atau tidak kedua-duanya, dengan menunjukkan nisbah sisi sepadan."],
    ];
    const ratios = sortN(t).map((v, i) => `${sortN(b)[i]}:${v}`).join(', ');
    return { q: fill(r.pick(forms), { a: t.join(', '), b: b.join(', ') }), a: kind === 'cong' ? T(`Congruent: the sides (in order of size) are ${sortN(t).join(', ')} in both triangles.`, `Kongruen: sisi (mengikut susunan saiz) ialah ${sortN(t).join(', ')} bagi kedua-dua segi tiga.`) : kind === 'sim' ? T(`Similar but not congruent: the ratios ${ratios} are all equal to $${n(SPM.Fr.val(cmp.k))}$.`, `Serupa tetapi tidak kongruen: nisbah ${ratios} semuanya sama dengan $${n(SPM.Fr.val(cmp.k))}$.`) : T(`Neither: the ratios ${ratios} are not all equal.`, `Tidak kedua-duanya: nisbah ${ratios} tidak semuanya sama.`), w: W(T('Put both sets of sides in order of size, then compare the ratios of corresponding sides.', 'Susun kedua-dua set sisi mengikut tertib saiz, kemudian bandingkan nisbah sisi sepadan.'), T(`${sortN(t).join(', ')} and ${sortN(b).join(', ')}`, `${sortN(t).join(', ')} dan ${sortN(b).join(', ')}`), T(`Ratios: ${ratios}.`, `Nisbah: ${ratios}.`), kind === 'cong' ? T('All the ratios are 1, so the triangles are congruent.', 'Semua nisbah ialah 1, jadi segi tiga itu kongruen.') : kind === 'sim' ? T(`All the ratios are equal to $${n(SPM.Fr.val(cmp.k))}$, so the triangles are similar but not congruent.`, `Semua nisbah bersamaan $${n(SPM.Fr.val(cmp.k))}$, jadi segi tiga itu serupa tetapi tidak kongruen.`) : T('The ratios are not all equal, so the triangles are neither congruent nor similar.', 'Nisbah tidak semuanya sama, jadi segi tiga itu bukan kongruen dan bukan serupa.')), sp: 's' };
  });
  M116.push((r) => { // rectangles
    const w = r.int(2, 6), h = r.int(w + 1, 9);
    const kind = r.pick(['cong', 'sim', 'none']);
    const k = r.pick([2, 3]);
    const b = kind === 'cong' ? r.shuffle([w, h]) : kind === 'sim' ? [w * k, h * k] : r.pick([[w * 2, h], [w + 2, h + 2], [w, h * 2 - 1]]);
    const cmp = cmpLists(sortN([w, h]), sortN(b));
    need(cmp.kind === kind);
    const forms = [
      ["Rectangle $P$ measures {a} cm by {b1} cm and rectangle $Q$ measures {c} cm by {d} cm. Are they congruent, similar but not congruent, or neither? Show your working.", "Segi empat tepat $P$ berukuran {a} cm kali {b1} cm dan segi empat tepat $Q$ berukuran {c} cm kali {d} cm. Adakah kongruen, serupa tetapi tidak kongruen, atau tidak kedua-duanya? Tunjukkan langkah kerja anda."],
      ["All four angles of both shapes are right angles. The sides of one rectangle are {a} cm and {b1} cm; the sides of the other are {c} cm and {d} cm. Classify the pair.", "Keempat-empat sudut bagi kedua-dua bentuk ialah sudut tegak. Sisi satu segi empat tepat ialah {a} cm dan {b1} cm; sisi yang satu lagi ialah {c} cm dan {d} cm. Kelaskan pasangan itu."],
    ];
    const rat = `${b[0]}:${w},\\ ${b[1]}:${h}`;
    return { q: fill(r.pick(forms), { a: String(w), b1: String(h), c: String(b[0]), d: String(b[1]) }), a: kind === 'cong' ? T('Congruent: the same two side lengths.', 'Kongruen: dua panjang sisi yang sama.') : kind === 'sim' ? T(`Similar but not congruent: the ratios of corresponding sides are equal (both ${k}).`, `Serupa tetapi tidak kongruen: nisbah sisi sepadan adalah sama (kedua-duanya ${k}).`) : T('Neither: all angles are equal but the ratios of the corresponding sides are different, so the shapes are not the same.', 'Tidak kedua-duanya: semua sudut sama tetapi nisbah sisi sepadan berbeza, jadi bentuknya tidak sama.'), w: W(T('All the angles are right angles, so only the ratios of the sides decide the answer.', 'Semua sudut ialah sudut tegak, jadi hanya nisbah sisi yang menentukan jawapan.'), T(`Sides in order: ${sortN([w, h]).join(', ')} and ${sortN(b).join(', ')}.`, `Sisi mengikut tertib: ${sortN([w, h]).join(', ')} dan ${sortN(b).join(', ')}.`), kind === 'cong' ? T('The two pairs are the same, so the rectangles are congruent.', 'Kedua-dua pasangan adalah sama, jadi segi empat tepat itu kongruen.') : kind === 'sim' ? T(`Each ratio is ${k}, so the rectangles are similar but not congruent.`, `Setiap nisbah ialah ${k}, jadi segi empat tepat itu serupa tetapi tidak kongruen.`) : T('The ratios are not equal, so the rectangles are neither congruent nor similar.', 'Nisbah tidak sama, jadi segi empat tepat itu bukan kongruen dan bukan serupa.')), sp: 's' };
  });
  M116.push((r) => { // rhombus: angle matters
    const s1 = r.int(3, 9), s2 = r.pick([s1, s1 * 2]);
    const a1 = r.pick([40, 50, 60, 70, 110, 120]);
    const a2 = r.chance(0.5) ? a1 : (a1 < 90 ? a1 + 20 : a1 - 20);
    const same_ang = a1 === a2 || a1 + a2 === 180;
    const kind = same_ang ? (s1 === s2 ? 'cong' : 'sim') : 'none';
    return { q: T(`Rhombus $A$ has side ${s1} cm and an angle of $${a1}^\\circ$. Rhombus $B$ has side ${s2} cm and an angle of $${a2}^\\circ$. Is $B$ congruent to $A$, similar but not congruent, or neither? Explain.`, `Rombus $A$ mempunyai sisi ${s1} cm dan satu sudut $${a1}^\\circ$. Rombus $B$ mempunyai sisi ${s2} cm dan satu sudut $${a2}^\\circ$. Adakah $B$ kongruen dengan $A$, serupa tetapi tidak kongruen, atau tidak kedua-duanya? Terangkan.`), a: kind === 'cong' ? T('Congruent: same side length and same angles.', 'Kongruen: panjang sisi dan sudut yang sama.') : kind === 'sim' ? T(`Similar but not congruent: the angles are the same and the side lengths are in the ratio 1 : ${s2 / s1}.`, `Serupa tetapi tidak kongruen: sudutnya sama dan panjang sisi dalam nisbah 1 : ${s2 / s1}.`) : T(s1 === s2 ? 'Neither: the sides are equal but the angles are different, so the shapes are different (equal sides alone are not enough).' : 'Neither: the angles are different, so the shapes are different.', s1 === s2 ? 'Tidak kedua-duanya: sisi sama tetapi sudut berbeza, jadi bentuknya berbeza (sisi yang sama sahaja tidak mencukupi).' : `Tidak kedua-duanya: sudutnya berbeza, jadi bentuknya berbeza.`), w: W(T('Two rhombuses have the same shape only when their angles match (the two angles of a rhombus add up to $180^\\circ$).', 'Dua rombus mempunyai bentuk yang sama hanya apabila sudutnya sepadan (dua sudut rombus berjumlah $180^\\circ$).'), T(`Angles $${a1}^\\circ$ and $${a2}^\\circ$: ${same_ang ? 'the same shape' : 'different shapes'}. Sides ${s1} cm and ${s2} cm.`, `Sudut $${a1}^\\circ$ dan $${a2}^\\circ$: ${same_ang ? 'bentuk yang sama' : 'bentuk yang berbeza'}. Sisi ${s1} cm dan ${s2} cm.`), kind === 'cong' ? T('Same shape and same size, so they are congruent.', 'Bentuk dan saiz yang sama, jadi kedua-duanya kongruen.') : kind === 'sim' ? T(`Same shape with sides in the ratio 1 : ${s2 / s1}, so similar but not congruent.`, `Bentuk yang sama dengan sisi dalam nisbah 1 : ${s2 / s1}, jadi serupa tetapi tidak kongruen.`) : T('The shapes are different, so they are neither congruent nor similar.', 'Bentuknya berbeza, jadi ia bukan kongruen dan bukan serupa.')), sp: 'm' };
  });
  M116.push((r) => { // similar: scale factor + missing length
    const a = r.int(2, 6), b = r.int(a + 1, 9), k = r.pick([2, 3, 4]);
    const forms = [
      [`Rectangle $ABCD$ ($AB = ${a}$ cm, $BC = ${b}$ cm) is similar to rectangle $PQRS$ with $PQ = ${a * k}$ cm. Find the scale factor from $ABCD$ to $PQRS$ and the length of $QR$.`, `Segi empat tepat $ABCD$ ($AB = ${a}$ cm, $BC = ${b}$ cm) serupa dengan segi empat tepat $PQRS$ dengan $PQ = ${a * k}$ cm. Cari faktor skala dari $ABCD$ ke $PQRS$ dan panjang $QR$.`, `Scale factor ${k}; $QR = ${b * k}$ cm`, `Faktor skala ${k}; $QR = ${b * k}$ cm`],
      [`A photograph 8 cm wide and ${a} cm tall is enlarged to a similar photograph ${8 * k} cm wide. How tall is the enlargement?`, `Sekeping gambar selebar 8 cm dan setinggi ${a} cm dibesarkan menjadi gambar serupa selebar ${8 * k} cm. Berapakah ketinggian gambar yang dibesarkan?`, `${a * k} cm`, `${a * k} cm`],
    ];
    const f = r.pick(forms);
    return { q: T(f[0], f[1]), a: T(f[2], f[3]), w: f === forms[0]
      ? W(T('In similar shapes every length is multiplied by the same scale factor.', 'Dalam bentuk serupa setiap panjang didarab dengan faktor skala yang sama.'), `$${a * k} \\div ${a} = ${k}$`, `$QR = ${b} \\times ${k} = ${b * k}$ cm`)
      : W(T('In similar shapes every length is multiplied by the same scale factor.', 'Dalam bentuk serupa setiap panjang didarab dengan faktor skala yang sama.'), `$${8 * k} \\div 8 = ${k}$`, `$${a} \\times ${k} = ${a * k}$ cm`), sp: 's' };
  });
  M116.push((r) => { // coordinates of triangle and image under a transformation -> classification
    const O = scalene(r, 3, 4), names = nm(r, 3);
    const kind = r.pick(['translation', 'reflection', 'rotation', 'enlargement']);
    let I, tn = TY[kind];
    if (kind === 'translation') { const v = vec(r, 4, true); I = O.map((p) => addv(p, v)); }
    else if (kind === 'reflection') { const l = mirror(r.pick(['x', 'y']), 0); I = O.map((p) => reflect(p, l)); }
    else if (kind === 'rotation') { const dd = r.pick(['cw', 'ccw']); I = O.map((p) => rotate(p, [0, 0], 90, dd)); }
    else { const k = r.pick([2, 3]); I = O.map((p) => [k * p[0], k * p[1]]); }
    need(inb(I, 12));
    const s2 = (P) => [d2(P[0], P[1]), d2(P[1], P[2]), d2(P[0], P[2])];
    const so = s2(O), si = s2(I);
    const cong = so.join() === si.join();
    const ans = cong ? T(`Congruent: the side lengths are unchanged (squares ${so.join(', ')}), because a ${tn.en} is an isometry.`, `Kongruen: panjang sisi tidak berubah (kuasa dua ${so.join(', ')}), kerana ${tn.ms} ialah isometri.`) : T(`Similar but not congruent: the squared side lengths change from ${so.join(', ')} to ${si.join(', ')} (all multiplied by the same factor), because an enlargement is not an isometry.`, `Serupa tetapi tidak kongruen: kuasa dua panjang sisi berubah daripada ${so.join(', ')} kepada ${si.join(', ')} (semuanya didarab dengan faktor yang sama), kerana pembesaran bukan isometri.`);
    return { q: T(`Triangle $${names.join('')}$ with vertices $${vlist(names, O)}$ is mapped onto $${names.map((x) => x + "'").join('')}$ with vertices $${plist(names, I, "'")}$ by ${art(tn.en)}. Compare the squares of the side lengths and state whether the two triangles are congruent, similar but not congruent, or neither.`, `Segi tiga $${names.join('')}$ dengan bucu $${vlist(names, O)}$ dipetakan ke $${names.map((x) => x + "'").join('')}$ dengan bucu $${plist(names, I, "'")}$ oleh ${tn.ms}. Bandingkan kuasa dua panjang sisi dan nyatakan sama ada kedua-dua segi tiga itu kongruen, serupa tetapi tidak kongruen, atau tidak kedua-duanya.`), a: ans, w: W(T('Compare the squared side lengths of the two triangles.', 'Bandingkan kuasa dua panjang sisi kedua-dua segi tiga.'), T(`Object: ${so.join(', ')}`, `Objek: ${so.join(', ')}`), T(`Image: ${si.join(', ')}`, `Imej: ${si.join(', ')}`), ans), sp: 'm' };
  });
  M116.push((r) => { // transformation -> congruent or similar (word)
    const kinds = [['translation', 'translasi', true], ['reflection', 'pantulan', true], ['rotation', 'putaran', true], ['enlargement with scale factor 2', 'pembesaran dengan faktor skala 2', false], ['enlargement with scale factor 3', 'pembesaran dengan faktor skala 3', false], ['enlargement with scale factor 1', 'pembesaran dengan faktor skala 1', true]];
    const k = r.pick(kinds);
    return { q: T(`A shape is transformed by ${art(k[0])}. Is the image congruent to the object, similar but not congruent, or neither?`, `Suatu bentuk ditransformasikan oleh ${k[1]}. Adakah imej kongruen dengan objek, serupa tetapi tidak kongruen, atau tidak kedua-duanya?`), a: k[2] ? T(k[0].includes('scale factor 1') ? 'Congruent: with scale factor 1 the image is the same size as the object (congruent is the special case of similar with scale factor 1).' : 'Congruent: it is an isometry, so lengths and angles are preserved.', k[0].includes('scale factor 1') ? 'Kongruen: dengan faktor skala 1 imej mempunyai saiz yang sama dengan objek (kongruen ialah kes khas serupa dengan faktor skala 1).' : 'Kongruen: ia ialah isometri, jadi panjang dan sudut dikekalkan.') : T('Similar but not congruent: the shape is the same but every length is multiplied by the scale factor.', 'Serupa tetapi tidak kongruen: bentuknya sama tetapi setiap panjang didarab dengan faktor skala.'), w: W(T('Translation, reflection and rotation are isometries, so the image is congruent; an enlargement with a scale factor other than 1 multiplies every length, so the image is only similar.', 'Translasi, pantulan dan putaran ialah isometri, jadi imej kongruen; pembesaran dengan faktor skala selain 1 mendarabkan setiap panjang, jadi imej hanya serupa.'), k[2] ? T(`Here the transformation is ${art(k[0])}, so the image is congruent to the object.`, `Di sini transformasinya ialah ${k[1]}, jadi imej kongruen dengan objek.`) : T(`Here the transformation is ${art(k[0])}, so the image is similar but not congruent.`, `Di sini transformasinya ialah ${k[1]}, jadi imej serupa tetapi tidak kongruen.`)), sp: 's' };
  });
  M116.push((r) => { // correspondence: triangle ABC ≅ PQR
    const names = nm(r, 3), other = r.pick(NAMESETS[3].filter((x) => x !== names.join(''))).split('');
    const j = r.int(0, 2), i2 = (j + 1) % 3, i3 = (j + 2) % 3;
    const forms = [
      [`Triangle $${names.join('')}$ is congruent to triangle $${other.join('')}$, with vertices matching in the order written. Which side of $${other.join('')}$ equals $${names[j]}${names[i2]}$, and which angle equals $\\angle ${names[i2]}$?`, `Segi tiga $${names.join('')}$ kongruen dengan segi tiga $${other.join('')}$, dengan bucu sepadan mengikut urutan yang ditulis. Sisi manakah bagi $${other.join('')}$ yang sama dengan $${names[j]}${names[i2]}$, dan sudut manakah yang sama dengan $\\angle ${names[i2]}$?`],
    ];
    return { q: T(...forms[0]), a: T(`$${other[j]}${other[i2]}$ and $\\angle ${other[i2]}$`), w: W(T('In congruent triangles the vertices written in matching order correspond, and corresponding sides and angles are equal.', 'Dalam segi tiga kongruen, bucu yang ditulis mengikut urutan yang sepadan adalah sepadan, dan sisi serta sudut sepadan adalah sama.'), T(`The vertices match in order: $${names.map((c, i) => c + ' \\leftrightarrow ' + other[i]).join(',\\ ')}$.`, `Bucu sepadan mengikut urutan: $${names.map((c, i) => c + ' \\leftrightarrow ' + other[i]).join(',\\ ')}$.`), T(`So $${names[j]}${names[i2]}$ corresponds to $${other[j]}${other[i2]}$, and $\\angle ${names[i2]}$ to $\\angle ${other[i2]}$.`, `Jadi $${names[j]}${names[i2]}$ sepadan dengan $${other[j]}${other[i2]}$, dan $\\angle ${names[i2]}$ dengan $\\angle ${other[i2]}$.`)), sp: 's' };
  });
  M116.push((r) => { // statement evaluation with reason
    const bank = [
      ['All rectangles are similar.', 'Semua segi empat tepat adalah serupa.', false, 'A 2 cm by 4 cm rectangle and a 2 cm by 3 cm rectangle have equal angles but different side ratios.', 'Segi empat tepat 2 cm kali 4 cm dan 2 cm kali 3 cm mempunyai sudut yang sama tetapi nisbah sisi yang berbeza.'],
      ['All squares are similar.', 'Semua segi empat sama adalah serupa.', true, 'Every square has four right angles and equal sides, so any two have the same shape.', 'Setiap segi empat sama mempunyai empat sudut tegak dan sisi yang sama, jadi mana-mana dua mempunyai bentuk yang sama.'],
      ['Two rhombuses with sides 5 cm are always congruent.', 'Dua rombus bersisi 5 cm sentiasa kongruen.', false, 'Their angles may be different.', 'Sudutnya mungkin berbeza.'],
      ['All circles are similar.', 'Semua bulatan adalah serupa.', true, 'They all have the same shape (only the radius differs).', 'Semuanya mempunyai bentuk yang sama (hanya jejari yang berbeza).'],
      ['Two triangles with the same area must be congruent.', 'Dua segi tiga dengan luas yang sama mestilah kongruen.', false, 'A 6 by 2 right-angled triangle and a 4 by 3 right-angled triangle have the same area but different shapes.', 'Segi tiga bersudut tegak 6 kali 2 dan 4 kali 3 mempunyai luas yang sama tetapi bentuk yang berbeza.'],
      ['If two shapes are congruent then they are also similar.', 'Jika dua bentuk kongruen maka ia juga serupa.', true, 'Congruent shapes have the same shape, with scale factor 1.', 'Bentuk kongruen mempunyai bentuk yang sama, dengan faktor skala 1.'],
      ['If two shapes are similar then they are congruent.', 'Jika dua bentuk serupa maka ia kongruen.', false, 'Similar shapes can have different sizes.', 'Bentuk serupa boleh mempunyai saiz yang berbeza.'],
      ['Two equilateral triangles are always similar.', 'Dua segi tiga sama sisi sentiasa serupa.', true, 'All angles are $60^\\circ$.', 'Semua sudut ialah $60^\\circ$.'],
      ['Two isosceles triangles are always similar.', 'Dua segi tiga sama kaki sentiasa serupa.', false, 'Their angles can differ, e.g. $50^\\circ, 50^\\circ, 80^\\circ$ and $70^\\circ, 70^\\circ, 40^\\circ$.', 'Sudutnya boleh berbeza, contohnya $50^\\circ, 50^\\circ, 80^\\circ$ dan $70^\\circ, 70^\\circ, 40^\\circ$.'],
    ];
    const b = r.pick(bank);
    return { q: T(`Is this statement true or false? Give a reason or a counterexample: "${b[0]}"`, `Adakah pernyataan ini benar atau palsu? Berikan sebab atau contoh yang menyangkal: "${b[1]}"`), a: T(`${b[2] ? 'True' : 'False'}. ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}. ${b[4]}`), w: W(T('Congruent $=$ same shape and same size; similar $=$ same shape, i.e. equal angles AND corresponding sides in the same ratio. For triangles equal angles are enough, but not for other polygons.', 'Kongruen $=$ bentuk dan saiz yang sama; serupa $=$ bentuk yang sama, iaitu sudut yang sama DAN sisi sepadan dalam nisbah yang sama. Bagi segi tiga, sudut yang sama memadai, tetapi tidak bagi poligon lain.'), T(`${b[2] ? 'True' : 'False'}: ${b[3]}`, `${b[2] ? 'Benar' : 'Palsu'}: ${b[4]}`)), sp: 'm' };
  });
  M116.push((r) => { // paper sizes / photos ratio
    const bank = [
      ['A4 paper measures 210 mm by 297 mm and A5 paper measures 148 mm by 210 mm.', 'Kertas A4 berukuran 210 mm kali 297 mm dan kertas A5 berukuran 148 mm kali 210 mm.'],
    ];
    const w = r.pick([4, 5, 6]), h = r.pick([6, 8, 9]), k = r.pick([2, 3]);
    const sim = r.chance();
    const w2 = w * k, h2 = sim ? h * k : h * k + r.pick([1, 2]);
    return { q: T(`A photograph measures ${w} cm by ${h} cm. It is printed as a poster measuring ${w2} cm by ${h2} cm. Are the photograph and the poster similar? Explain by comparing the ratios of corresponding sides.`, `Sekeping gambar berukuran ${w} cm kali ${h} cm. Ia dicetak sebagai poster berukuran ${w2} cm kali ${h2} cm. Adakah gambar dan poster itu serupa? Terangkan dengan membandingkan nisbah sisi sepadan.`), a: sim ? T(`Yes: ${w2} : ${w} = ${h2} : ${h} = ${k}, so they are similar (not congruent).`, `Ya: ${w2} : ${w} = ${h2} : ${h} = ${k}, jadi ia serupa (bukan kongruen).`) : T(`No: ${w2} : ${w} = ${k} but ${h2} : ${h} = ${n(round(h2 / h, 2))}, so the ratios differ and the poster is stretched (not similar).`, `Tidak: ${w2} : ${w} = ${k} tetapi ${h2} : ${h} = ${n(round(h2 / h, 2))}, jadi nisbahnya berbeza dan poster itu terherot (tidak serupa).`), w: W(T('Two shapes are similar when the ratios of corresponding sides are equal.', 'Dua bentuk serupa apabila nisbah sisi sepadan adalah sama.'), `$${w2} : ${w} = ${n(round(w2 / w, 2))}$`, `$${h2} : ${h} = ${n(round(h2 / h, 2))}$`, sim ? T('The two ratios are equal, so the poster is similar to the photograph (larger, so not congruent).', 'Kedua-dua nisbah adalah sama, jadi poster itu serupa dengan gambar (lebih besar, jadi tidak kongruen).') : T('The two ratios are different, so the poster has been stretched and is not similar to the photograph.', 'Kedua-dua nisbah berbeza, jadi poster itu telah diregangkan dan tidak serupa dengan gambar.')), sp: 'm' };
  });
  M116.push((r) => { // grid figure: classify candidates
    const base = asymShape(r, 2);
    const c = cpFig(r, base);
    const cand = r.shuffle([{ P: c.cong, k: 'cong' }, { P: c.sim, k: 'sim' }, { P: c.non, k: 'none' }]);
    const parts = [{ P: c.B0, s: 'A' }].concat(cand.map((o, i) => ({ P: o.P, s: 'BCD'[i] })));
    const cf = candItems(parts);
    const pos = { cong: 'BCD'[cand.findIndex((o) => o.k === 'cong')], sim: 'BCD'[cand.findIndex((o) => o.k === 'sim')], none: 'BCD'[cand.findIndex((o) => o.k === 'none')] };
    return { q: T('Compare each of the shapes $B$, $C$ and $D$ with shape $A$. State which is congruent to $A$, which is similar but not congruent, and which is neither.', 'Bandingkan setiap bentuk $B$, $C$ dan $D$ dengan bentuk $A$. Nyatakan yang manakah kongruen dengan $A$, yang manakah serupa tetapi tidak kongruen, dan yang manakah tidak kedua-duanya.'), fig: render({ items: cf.items, axes: false, win: cf.win }), a: T(`Congruent: $${pos.cong}$; similar but not congruent: $${pos.sim}$ (twice as long and twice as tall); neither: $${pos.none}$ (stretched in one direction only).`, `Kongruen: $${pos.cong}$; serupa tetapi tidak kongruen: $${pos.sim}$ (dua kali ganda panjang dan tinggi); tidak kedua-duanya: $${pos.none}$ (diregangkan pada satu arah sahaja).`), w: W(T('Compare each shape with $A$: the same size and shape means congruent; all lengths multiplied by the same factor means similar; stretched in one direction only means neither.', 'Bandingkan setiap bentuk dengan $A$: saiz dan bentuk yang sama bermakna kongruen; semua panjang didarab dengan faktor yang sama bermakna serupa; diregangkan pada satu arah sahaja bermakna tidak kedua-duanya.'), T(`$${pos.cong}$ matches $A$ exactly; $${pos.sim}$ has every length doubled; $${pos.none}$ is stretched in one direction only.`, `$${pos.cong}$ sepadan tepat dengan $A$; $${pos.sim}$ mempunyai setiap panjang digandakan; $${pos.none}$ diregangkan pada satu arah sahaja.`)), sp: 'm' };
  });
  M116.push((r) => { // triangles figure P,Q,R: classification of P vs Q
    const t = r.pick(TRIS), k = r.pick([2]);
    const third = r.pick(TRIS.filter((x) => x.join() !== t.join() && sortN(x).map((v, i) => v / sortN(t)[i]).some((v, i, a) => v !== a[0])));
    const sims = t.map((v) => v * k);
    need(third.every((v) => v <= 17));
    const three = r.shuffle([{ s: t, n: 0 }, { s: sims, n: 1 }, { s: third, n: 2 }]);
    const spec = three.map((o, i) => triSpec(o.s, 'PQR'[i], { rot: r.int(0, 3), flip: r.chance() }));
    const iP = three.findIndex((o) => o.n === 0), iQ = three.findIndex((o) => o.n === 1);
    return { q: T('Two of the three triangles in the diagram are similar. Which two are they, and are they congruent? Compare the ratios of corresponding sides.', 'Dua daripada tiga segi tiga dalam rajah adalah serupa. Yang manakah dua segi tiga itu, dan adakah ia kongruen? Bandingkan nisbah sisi sepadan.'), fig: shapeRow(spec, { maxSc: 18 }), a: T(`$${'PQR'[iP]}$ and $${'PQR'[iQ]}$ are similar (every side of the larger is ${k} times the side of the smaller) but not congruent.`, `$${'PQR'[iP]}$ dan $${'PQR'[iQ]}$ adalah serupa (setiap sisi yang lebih besar ialah ${k} kali sisi yang lebih kecil) tetapi tidak kongruen.`), w: W(T('Similar triangles have all three pairs of corresponding sides in the same ratio.', 'Segi tiga serupa mempunyai ketiga-tiga pasangan sisi sepadan dalam nisbah yang sama.'), T(`Sides ${t.join(', ')} cm and ${sims.join(', ')} cm: every ratio is ${k}.`, `Sisi ${t.join(', ')} cm dan ${sims.join(', ')} cm: setiap nisbah ialah ${k}.`), T(`The remaining triangle (${third.join(', ')} cm) does not fit that ratio.`, `Segi tiga yang tinggal (${third.join(', ')} cm) tidak menepati nisbah itu.`), T(`So $${'PQR'[iP]}$ and $${'PQR'[iQ]}$ are similar; the scale factor is ${k}, not 1, so they are not congruent.`, `Jadi $${'PQR'[iP]}$ dan $${'PQR'[iQ]}$ adalah serupa; faktor skalanya ${k}, bukan 1, jadi ia tidak kongruen.`)), sp: 'm' };
  });


  /* ---- advanced 11.6 ---- */
  A116.push((r) => { // congruent triangles: solve for x
    const x = r.int(2, 8), a = r.int(2, 4), b = r.int(1, 6), c = a + r.pick([1, 2]);
    const d = a * x + b - c * x;
    need(d !== 0 && Math.abs(d) < 25 && a * x + b > 0);
    const kind = r.pick(['len', 'ang']);
    if (kind === 'len') return { q: T(`Triangle $ABC$ is congruent to triangle $PQR$ with $A \\leftrightarrow P$, $B \\leftrightarrow Q$, $C \\leftrightarrow R$. $AB = (${a}x + ${b})$ cm and $PQ = (${c}x ${d < 0 ? '-' : '+'} ${Math.abs(d)})$ cm. Find $x$ and $AB$.`, `Segi tiga $ABC$ kongruen dengan segi tiga $PQR$ dengan $A \\leftrightarrow P$, $B \\leftrightarrow Q$, $C \\leftrightarrow R$. $AB = (${a}x + ${b})$ cm dan $PQ = (${c}x ${d < 0 ? '-' : '+'} ${Math.abs(d)})$ cm. Cari $x$ dan $AB$.`), a: T(`$x = ${x}$; $AB = ${a * x + b}$ cm`), w: W(T('Corresponding sides of congruent triangles are equal, so $AB = PQ$.', 'Sisi sepadan bagi segi tiga kongruen adalah sama, jadi $AB = PQ$.'), `$${a}x + ${b} = ${c}x ${d < 0 ? '-' : '+'} ${Math.abs(d)}$`, `$${b - d} = ${c - a}x$`, `$x = ${x}$`, `$AB = ${a}(${x}) + ${b} = ${a * x + b}$ cm`), sp: 'm' };
    const A1 = a * x + b + 20;
    const d3 = A1 - c * x;
    need(A1 < 160 && Math.abs(d3) < 70 && d3 !== 0);
    return { q: T(`Triangle $ABC$ is congruent to triangle $PQR$ with $A \\leftrightarrow P$, $B \\leftrightarrow Q$, $C \\leftrightarrow R$. $\\angle A = (${a}x + ${b + 20})^\\circ$ and $\\angle P = (${c}x ${d3 < 0 ? '-' : '+'} ${Math.abs(d3)})^\\circ$. Find $x$ and the size of $\\angle A$.`, `Segi tiga $ABC$ kongruen dengan segi tiga $PQR$ dengan $A \\leftrightarrow P$, $B \\leftrightarrow Q$, $C \\leftrightarrow R$. $\\angle A = (${a}x + ${b + 20})^\\circ$ dan $\\angle P = (${c}x ${d3 < 0 ? '-' : '+'} ${Math.abs(d3)})^\\circ$. Cari $x$ dan saiz $\\angle A$.`), a: T(`$x = ${x}$; $\\angle A = ${A1}^\\circ$`), w: W(T('Corresponding angles of congruent triangles are equal, so $\\angle A = \\angle P$.', 'Sudut sepadan bagi segi tiga kongruen adalah sama, jadi $\\angle A = \\angle P$.'), `$${a}x + ${b + 20} = ${c}x ${d3 < 0 ? '-' : '+'} ${Math.abs(d3)}$`, `$${b + 20 - d3} = ${c - a}x$`, `$x = ${x}$`, `$\\angle A = ${a}(${x}) + ${b + 20} = ${A1}^\\circ$`), sp: 'm' };
  });
  A116.push((r) => { // similar: missing sides
    const t = r.pick([[3, 4, 5], [4, 6, 8], [5, 12, 13], [6, 8, 10], [4, 5, 6], [6, 9, 12]]);
    const k = r.pick([2, 3, 1.5, 2.5].filter((v) => t.every((x) => Number.isInteger(x * v))));
    const b = t.map((v) => v * k);
    const known = r.int(0, 2);
    const forms = [
      [`Triangles $ABC$ and $PQR$ are similar with $AB = ${t[0]}$ cm, $BC = ${t[1]}$ cm, $CA = ${t[2]}$ cm and $PQ = ${b[0]}$ cm. Find the scale factor from $ABC$ to $PQR$, and the lengths of $QR$ and $RP$.`, `Segi tiga $ABC$ dan $PQR$ adalah serupa dengan $AB = ${t[0]}$ cm, $BC = ${t[1]}$ cm, $CA = ${t[2]}$ cm dan $PQ = ${b[0]}$ cm. Cari faktor skala dari $ABC$ ke $PQR$, dan panjang $QR$ dan $RP$.`, `Scale factor $${n(k)}$; $QR = ${b[1]}$ cm and $RP = ${b[2]}$ cm`, `Faktor skala $${n(k)}$; $QR = ${b[1]}$ cm dan $RP = ${b[2]}$ cm`],
      [`Triangle $DEF$ has sides ${b.join(' cm, ')} cm. It is similar to triangle $XYZ$ whose shortest side is ${t[0]} cm. Find the other two sides of $XYZ$ and state whether the triangles are congruent.`, `Segi tiga $DEF$ mempunyai sisi ${b.join(' cm, ')} cm. Ia serupa dengan segi tiga $XYZ$ yang sisi terpendeknya ${t[0]} cm. Cari dua sisi lain bagi $XYZ$ dan nyatakan sama ada segi tiga itu kongruen.`, `${t[1]} cm and ${t[2]} cm; not congruent (scale factor $${n(k)}$ is not 1)`, `${t[1]} cm dan ${t[2]} cm; tidak kongruen (faktor skala $${n(k)}$ bukan 1)`],
    ];
    const f = r.pick(forms);
    const simRule = T('In similar triangles all pairs of corresponding sides are in the same ratio (the scale factor).', 'Dalam segi tiga serupa, semua pasangan sisi sepadan berada dalam nisbah yang sama (faktor skala).');
    const wk = f === forms[0]
      ? W(simRule, `$${b[0]} \\div ${t[0]} = ${n(k)}$`, `$QR = ${t[1]} \\times ${n(k)} = ${b[1]}$ cm`, `$RP = ${t[2]} \\times ${n(k)} = ${b[2]}$ cm`)
      : W(simRule, `$${b[0]} \\div ${t[0]} = ${n(k)}$`, `$${b[1]} \\div ${n(k)} = ${t[1]}$ cm, $${b[2]} \\div ${n(k)} = ${t[2]}$ cm`, T(`The scale factor is $${n(k)}$, not 1, so the triangles are not congruent.`, `Faktor skalanya $${n(k)}$, bukan 1, jadi segi tiga itu tidak kongruen.`));
    return { q: T(f[0], f[1]), a: T(f[2], f[3]), w: wk, sp: 'm' };
  });
  A116.push((r) => { // similar rectangles: missing dimension equation
    const a = r.int(2, 6), b = r.int(a + 1, 10), k = r.pick([2, 3, 4]);
    return { q: T(`Rectangle $ABCD$ measures ${a} cm by ${b} cm. Rectangle $PQRS$ is similar to $ABCD$ and measures ${a * k} cm by $y$ cm. Find $y$ and the perimeters of both rectangles. What is the ratio of the perimeters?`, `Segi empat tepat $ABCD$ berukuran ${a} cm kali ${b} cm. Segi empat tepat $PQRS$ serupa dengan $ABCD$ dan berukuran ${a * k} cm kali $y$ cm. Cari $y$ dan perimeter kedua-dua segi empat tepat. Apakah nisbah perimeter?`), a: T(`$y = ${b * k}$; perimeters ${2 * (a + b)} cm and ${2 * (a + b) * k} cm; ratio $1 : ${k}$ (the same as the ratio of the sides)`, `$y = ${b * k}$; perimeter ${2 * (a + b)} cm dan ${2 * (a + b) * k} cm; nisbah $1 : ${k}$ (sama dengan nisbah sisi)`), w: W(T(`Scale factor $= ${a * k} \\div ${a} = ${k}$.`, `Faktor skala $= ${a * k} \\div ${a} = ${k}$.`), `$y = ${b} \\times ${k} = ${b * k}$`, `$2(${a} + ${b}) = ${2 * (a + b)}$ cm`, `$2(${a * k} + ${b * k}) = ${2 * (a + b) * k}$ cm`, T(`Ratio of perimeters $= ${2 * (a + b)} : ${2 * (a + b) * k} = 1 : ${k}$, the same as the ratio of the sides.`, `Nisbah perimeter $= ${2 * (a + b)} : ${2 * (a + b) * k} = 1 : ${k}$, sama dengan nisbah sisi.`)), sp: 'm' };
  });
  A116.push((r) => { // angle-based similarity: find missing angles
    const a1 = r.step(30, 80, 5), a2 = r.step(35, 85, 5);
    need(a1 + a2 < 150 && a1 !== a2);
    const a3 = 180 - a1 - a2;
    const forms = [
      [`Triangle $ABC$ has $\\angle A = ${a1}^\\circ$ and $\\angle B = ${a2}^\\circ$. Triangle $PQR$ has $\\angle P = ${a2}^\\circ$ and $\\angle Q = ${a3}^\\circ$. Are the two triangles similar? Find all the angles to justify your answer.`, `Segi tiga $ABC$ mempunyai $\\angle A = ${a1}^\\circ$ dan $\\angle B = ${a2}^\\circ$. Segi tiga $PQR$ mempunyai $\\angle P = ${a2}^\\circ$ dan $\\angle Q = ${a3}^\\circ$. Adakah kedua-dua segi tiga itu serupa? Cari semua sudut untuk menjustifikasikan jawapan anda.`],
    ];
    return { q: T(...forms[0]), a: T(`$\\angle C = ${a3}^\\circ$ and $\\angle R = ${a1}^\\circ$. Both triangles have angles $${a1}^\\circ, ${a2}^\\circ, ${a3}^\\circ$, so they are similar; without any side lengths we cannot tell whether they are congruent.`, `$\\angle C = ${a3}^\\circ$ dan $\\angle R = ${a1}^\\circ$. Kedua-dua segi tiga mempunyai sudut $${a1}^\\circ, ${a2}^\\circ, ${a3}^\\circ$, jadi ia serupa; tanpa sebarang panjang sisi kita tidak dapat menentukan sama ada ia kongruen.`), w: W(T('The angles of a triangle add up to $180^\\circ$.', 'Hasil tambah sudut segi tiga ialah $180^\\circ$.'), `$\\angle C = 180^\\circ - ${a1}^\\circ - ${a2}^\\circ = ${a3}^\\circ$`, `$\\angle R = 180^\\circ - ${a2}^\\circ - ${a3}^\\circ = ${a1}^\\circ$`, T(`Both triangles have angles $${a1}^\\circ, ${a2}^\\circ, ${a3}^\\circ$, so they are similar (equal angles are enough for triangles); with no side lengths given we cannot say whether they are congruent.`, `Kedua-dua segi tiga mempunyai sudut $${a1}^\\circ, ${a2}^\\circ, ${a3}^\\circ$, jadi ia serupa (sudut yang sama memadai bagi segi tiga); tanpa panjang sisi kita tidak dapat menentukan sama ada ia kongruen.`)), sp: 'm' };
  });
  A116.push((r) => { // three triangles table: find congruent and similar pairs
    const t = r.pick(TRIS), k = 2;
    const third = r.pick(TRIS.filter((x) => sortN(x).map((v, i) => v / sortN(t)[i]).some((v, i, a) => v !== a[0])));
    const list = r.shuffle([{ s: t, n: 'a' }, { s: r.shuffle(t), n: 'b' }, { s: t.map((v) => v * k), n: 'c' }, { s: third, n: 'd' }]).slice(0, 4);
    const rows = list.map((o, i) => [`$${'ABCD'[i]}$`, o.s.join(', ')]);
    const cong = [], sim = [];
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      const c = cmpLists(sortN(list[i].s), sortN(list[j].s));
      if (c.kind === 'cong') cong.push('ABCD'[i] + 'ABCD'[j]); else if (c.kind === 'sim') sim.push('ABCD'[i] + 'ABCD'[j]);
    }
    return { q: T(`The table gives the side lengths (cm) of four triangles.<br>${SPM.table(rows, { head: ['Triangle', 'Sides (cm)'] })}List every pair that is congruent and every pair that is similar but not congruent.`, `Jadual memberi panjang sisi (cm) bagi empat segi tiga.<br>${SPM.table(rows, { head: ['Segi tiga', 'Sisi (cm)'] })}Senaraikan setiap pasangan yang kongruen dan setiap pasangan yang serupa tetapi tidak kongruen.`), a: T(`Congruent: ${cong.length ? cong.join(', ') : 'none'}. Similar but not congruent: ${sim.length ? sim.join(', ') : 'none'}.`, `Kongruen: ${cong.length ? cong.join(', ') : 'tiada'}. Serupa tetapi tidak kongruen: ${sim.length ? sim.join(', ') : 'tiada'}.`), w: W(T('Sort each row by size, then compare pairs: identical lists mean congruent, lists in a constant ratio mean similar.', 'Susun setiap baris mengikut saiz, kemudian bandingkan pasangan: senarai yang serupa bermakna kongruen, senarai dalam nisbah tetap bermakna serupa.'), ...list.map((o, i) => T(`${'ABCD'[i]}: ${sortN(o.s).join(', ')}`, `${'ABCD'[i]}: ${sortN(o.s).join(', ')}`)), T(`Congruent: ${cong.length ? cong.join(', ') : 'none'}. Similar but not congruent: ${sim.length ? sim.join(', ') : 'none'}.`, `Kongruen: ${cong.length ? cong.join(', ') : 'tiada'}. Serupa tetapi tidak kongruen: ${sim.length ? sim.join(', ') : 'tiada'}.`)), sp: 'm' };
  });
  A116.push((r) => { // coordinates: incomplete information
    const off = [r.int(-3, 0), r.int(-4, 0)], k = r.pick([2, 3]);
    const O = [[0, 0], [3, 0], [0, 4]].map((p) => [p[0] + off[0], p[1] + off[1]]);
    const base = [r.int(-2, 2), r.int(-2, 2)];
    const I = [[0, 0], [3 * k, 0], [0, 4 * k]].map((p) => [p[0] + base[0], p[1] + base[1]]);
    need(inb(O, 6) && inb(I, 14));
    const names = ['A', 'B', 'C'];
    return { q: T(`Triangle $ABC$ has vertices $${vlist(names, O)}$. Triangle $PQR$ has vertices $P${pt(I[0])}$, $Q${pt(I[1])}$ and $R${pt(I[2])}$. Both triangles have a right angle at their first vertex. Show that the triangles are similar but not congruent and find the scale factor.`, `Segi tiga $ABC$ mempunyai bucu $${vlist(names, O)}$. Segi tiga $PQR$ mempunyai bucu $P${pt(I[0])}$, $Q${pt(I[1])}$ dan $R${pt(I[2])}$. Kedua-dua segi tiga mempunyai sudut tegak pada bucu pertamanya. Tunjukkan bahawa segi tiga itu serupa tetapi tidak kongruen dan cari faktor skala.`), a: T(`The legs of $ABC$ are 3 and 4 (hypotenuse 5); the legs of $PQR$ are ${3 * k} and ${4 * k} (hypotenuse ${5 * k}). The ratios ${3 * k} : 3 = ${4 * k} : 4 = ${5 * k} : 5 = ${k} are equal, so the triangles are similar; the sizes differ, so they are not congruent. Scale factor ${k}.`, `Sisi tegak $ABC$ ialah 3 dan 4 (hipotenus 5); sisi tegak $PQR$ ialah ${3 * k} dan ${4 * k} (hipotenus ${5 * k}). Nisbah ${3 * k} : 3 = ${4 * k} : 4 = ${5 * k} : 5 = ${k} adalah sama, jadi segi tiga itu serupa; saiznya berbeza, jadi ia tidak kongruen. Faktor skala ${k}.`), w: W(T('$ABC$: legs $3$ and $4$, so the hypotenuse is $\\sqrt{3^2 + 4^2} = 5$.', '$ABC$: kaki $3$ dan $4$, jadi hipotenusnya ialah $\\sqrt{3^2 + 4^2} = 5$.'), T(`$PQR$: legs $${3 * k}$ and $${4 * k}$, so the hypotenuse is $${5 * k}$.`, `$PQR$: kaki $${3 * k}$ dan $${4 * k}$, jadi hipotenusnya ialah $${5 * k}$.`), `$${3 * k} : 3 = ${4 * k} : 4 = ${5 * k} : 5 = ${k}$`, T(`All the ratios are equal, so the triangles are similar; the scale factor is ${k}, not 1, so they are not congruent.`, `Semua nisbah adalah sama, jadi segi tiga itu serupa; faktor skalanya ${k}, bukan 1, jadi ia tidak kongruen.`)), fig: render({ items: [{ t: 'poly', p: O, names, style: 'obj' }, { t: 'poly', p: I, names: ['P', 'Q', 'R'], style: 'plain' }], axes: true }), sp: 'l' };
  });
  A116.push((r) => { // explain bank
    const bank = [
      ['Explain why every pair of congruent shapes is also a pair of similar shapes, but not every pair of similar shapes is congruent.', 'Terangkan mengapa setiap pasangan bentuk kongruen juga pasangan bentuk serupa, tetapi tidak setiap pasangan bentuk serupa adalah kongruen.', 'Congruent shapes have the same shape with a scale factor of 1, so they are similar. Similar shapes with a scale factor other than 1 have different sizes, so they are not congruent.', 'Bentuk kongruen mempunyai bentuk yang sama dengan faktor skala 1, jadi ia serupa. Bentuk serupa dengan faktor skala selain 1 mempunyai saiz yang berbeza, jadi ia tidak kongruen.'],
      ['Explain why the image of a triangle under a reflection is congruent to the triangle, even though it is a mirror image.', 'Terangkan mengapa imej segi tiga di bawah pantulan kongruen dengan segi tiga itu, walaupun ia imej cermin.', 'A reflection preserves every length and every angle. Congruent means the same shape and size; flipping over does not change either.', 'Pantulan mengekalkan setiap panjang dan setiap sudut. Kongruen bermaksud bentuk dan saiz yang sama; membalikkan tidak mengubah kedua-duanya.'],
      ['A student says that two rectangles with the same perimeter are congruent. Give a counterexample.', 'Seorang murid berkata dua segi empat tepat dengan perimeter yang sama adalah kongruen. Berikan satu contoh yang menyangkal.', 'A 2 cm by 8 cm rectangle and a 5 cm by 5 cm square both have perimeter 20 cm but are different shapes; or 4 cm by 6 cm and 3 cm by 7 cm.', 'Segi empat tepat 2 cm kali 8 cm dan segi empat sama 5 cm kali 5 cm kedua-duanya mempunyai perimeter 20 cm tetapi bentuknya berbeza; atau 4 cm kali 6 cm dan 3 cm kali 7 cm.'],
      ['A student says that two shapes are similar if their corresponding angles are equal. Show with a rectangle example that this is not enough for every shape.', 'Seorang murid berkata dua bentuk adalah serupa jika sudut sepadannya sama. Tunjukkan dengan contoh segi empat tepat bahawa ini tidak mencukupi bagi setiap bentuk.', 'A 2 by 4 rectangle and a 2 by 3 rectangle have all angles $90^\\circ$, but the side ratios $2 : 2$ and $4 : 3$ are different, so they are not similar.', 'Segi empat tepat 2 kali 4 dan 2 kali 3 mempunyai semua sudut $90^\\circ$, tetapi nisbah sisi $2 : 2$ dan $4 : 3$ berbeza, jadi ia tidak serupa.'],
      ['Explain why an enlargement with scale factor 2 does not give a congruent image, but scale factor 1 does.', 'Terangkan mengapa pembesaran dengan faktor skala 2 tidak memberi imej kongruen, tetapi faktor skala 1 memberi imej kongruen.', 'With scale factor 2 every length doubles, so the size differs; with scale factor 1 every length stays the same, so the image has the same size and shape as the object.', 'Dengan faktor skala 2 setiap panjang digandakan, jadi saiz berbeza; dengan faktor skala 1 setiap panjang kekal sama, jadi imej mempunyai saiz dan bentuk yang sama dengan objek.'],
      ['Two squares have sides of 4 cm and 6 cm. Are they similar? Congruent? Explain using ratios of sides.', 'Dua segi empat sama mempunyai sisi 4 cm dan 6 cm. Adakah ia serupa? Kongruen? Terangkan dengan menggunakan nisbah sisi.', 'Similar: all squares have the same shape (the ratio of corresponding sides is 6 : 4 = 3 : 2 for every pair of sides). Not congruent: the sizes are different.', 'Serupa: semua segi empat sama mempunyai bentuk yang sama (nisbah sisi sepadan ialah 6 : 4 = 3 : 2 bagi setiap pasangan sisi). Tidak kongruen: saiznya berbeza.'],
      ['Explain why a photograph stretched to be wider but not taller is no longer similar to the original photograph.', 'Terangkan mengapa gambar yang diregangkan menjadi lebih lebar tetapi tidak lebih tinggi tidak lagi serupa dengan gambar asal.', 'The width is multiplied by a factor but the height is not, so the ratios of corresponding lengths are not the same and the shape has changed.', 'Lebar didarab dengan suatu faktor tetapi tinggi tidak, jadi nisbah panjang sepadan tidak sama dan bentuk telah berubah.'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('Congruent $=$ same shape and same size; similar $=$ same shape, i.e. equal angles AND corresponding sides in the same ratio. Congruence is similarity with scale factor $1$.', 'Kongruen $=$ bentuk dan saiz yang sama; serupa $=$ bentuk yang sama, iaitu sudut yang sama DAN sisi sepadan dalam nisbah yang sama. Kekongruenan ialah keserupaan dengan faktor skala $1$.'), T(b[2], b[3])), sp: 'm' };
  });
  A116.push((r) => { // statement selection
    const bank = [
      ['Two triangles with equal angles are similar.', 'Dua segi tiga dengan sudut yang sama adalah serupa.', true],
      ['Two rectangles with equal angles are similar.', 'Dua segi empat tepat dengan sudut yang sama adalah serupa.', false],
      ['Two rhombuses with equal sides are congruent.', 'Dua rombus dengan sisi yang sama adalah kongruen.', false],
      ['Any two regular hexagons are similar.', 'Mana-mana dua heksagon sekata adalah serupa.', true],
      ['Two similar shapes with scale factor 1 are congruent.', 'Dua bentuk serupa dengan faktor skala 1 adalah kongruen.', true],
      ['A translation of a shape gives a similar image with scale factor 1.', 'Translasi suatu bentuk memberi imej serupa dengan faktor skala 1.', true],
      ['Two triangles with the same perimeter are congruent.', 'Dua segi tiga dengan perimeter yang sama adalah kongruen.', false],
      ['Two circles of the same radius are congruent.', 'Dua bulatan berjejari sama adalah kongruen.', true],
      ['Congruent triangles have equal corresponding angles.', 'Segi tiga kongruen mempunyai sudut sepadan yang sama.', true],
    ];
    const S4 = r.sample(bank, 4);
    need(S4.some((s) => s[2]) && S4.some((s) => !s[2]));
    const list = S4.map((s, i) => `<b>${'ABCD'[i]}.</b> ${s[0]}`).join('<br>'), listM = S4.map((s, i) => `<b>${'ABCD'[i]}.</b> ${s[1]}`).join('<br>');
    const ok = S4.map((s, i) => (s[2] ? 'ABCD'[i] : '')).join('');
    return { q: T(`Which of these statements are true?<br>${list}`, `Antara pernyataan berikut, yang manakah benar?<br>${listM}`), a: T(`${ok.split('').join(', ')} ${ok.length === 1 ? 'is' : 'are'} true; the others are false.`, `${ok.split('').join(', ')} benar; yang lain palsu.`), w: W(T('Use these facts: equal angles are enough for triangles but not for other polygons; congruent means same shape and same size; a scale factor of $1$ gives congruence; and equal perimeters or equal areas do not force congruence.', 'Gunakan fakta ini: sudut yang sama memadai bagi segi tiga tetapi tidak bagi poligon lain; kongruen bermaksud bentuk dan saiz yang sama; faktor skala $1$ memberi kekongruenan; dan perimeter atau luas yang sama tidak menjamin kekongruenan.'), T(`Checking each statement against these: ${ok.split('').join(', ')} agree with them.`, `Menyemak setiap pernyataan dengan fakta ini: ${ok.split('').join(', ')} menepatinya.`)), sp: 'm' };
  });
  A116.push((r) => { // enlargement in coordinates: similar not congruent, scale factor
    const O = scalene(r, 3, 3), names = nm(r, 3), k = r.pick([2, 3]);
    const I = O.map((p) => [k * p[0], k * p[1]]);
    need(inb(I, 10));
    const s2 = (P) => [d2(P[0], P[1]), d2(P[1], P[2]), d2(P[0], P[2])];
    const a = s2(O), b = s2(I);
    return { q: T(`Triangle $${names.join('')}$ has vertices $${vlist(names, O)}$ and triangle $${names.map((x) => x + "'").join('')}$ has vertices $${plist(names, I, "'")}$. Find the squares of all three side lengths of each triangle, and use them to show that the triangles are similar but not congruent. State the scale factor.`, `Segi tiga $${names.join('')}$ mempunyai bucu $${vlist(names, O)}$ dan segi tiga $${names.map((x) => x + "'").join('')}$ mempunyai bucu $${plist(names, I, "'")}$. Cari kuasa dua ketiga-tiga panjang sisi bagi setiap segi tiga, dan gunakannya untuk menunjukkan bahawa segi tiga itu serupa tetapi tidak kongruen. Nyatakan faktor skala.`), a: T(`Squares: ${a.join(', ')} and ${b.join(', ')}. Each is ${k * k} times the corresponding one, so each side is ${k} times as long: similar, not congruent. Scale factor ${k}.`, `Kuasa dua: ${a.join(', ')} dan ${b.join(', ')}. Setiap satu ialah ${k * k} kali yang sepadan, jadi setiap sisi ialah ${k} kali lebih panjang: serupa, tidak kongruen. Faktor skala ${k}.`), w: W(T(`Squared side lengths of $${names.join('')}$: ${a.join(', ')}.`, `Kuasa dua panjang sisi $${names.join('')}$: ${a.join(', ')}.`), T(`Squared side lengths of the image: ${b.join(', ')}.`, `Kuasa dua panjang sisi imej: ${b.join(', ')}.`), T(`Each is ${k * k} times the corresponding one, so each side is $\\sqrt{${k * k}} = ${k}$ times as long.`, `Setiap satu ialah ${k * k} kali yang sepadan, jadi setiap sisi ialah $\\sqrt{${k * k}} = ${k}$ kali lebih panjang.`), T(`All three ratios are equal, so the triangles are similar; the scale factor ${k} is not 1, so they are not congruent.`, `Ketiga-tiga nisbah adalah sama, jadi segi tiga itu serupa; faktor skala ${k} bukan 1, jadi ia tidak kongruen.`)), fig: fig({ O, I, names, axes: true }), sp: 'l' };
  });
  A116.push((r) => { // scale factor 1 and congruent via enlargement idea
    const bank = [
      ['A shape is enlarged with scale factor 1. Describe the image and explain your answer in terms of similar and congruent shapes.', 'Suatu bentuk dibesarkan dengan faktor skala 1. Huraikan imej itu dan terangkan jawapan anda dari segi bentuk serupa dan kongruen.', 'The image is the same size as the object, so it is congruent to it. Congruency is the special case of similarity with scale factor 1.', 'Imej mempunyai saiz yang sama dengan objek, jadi ia kongruen dengannya. Kekongruenan ialah kes khas keserupaan dengan faktor skala 1.'],
      ['Two similar triangles have scale factor 1.5 from the smaller to the larger. The smaller has a side 8 cm. Find the corresponding side of the larger, and the scale factor from the larger to the smaller.', 'Dua segi tiga serupa mempunyai faktor skala 1.5 dari yang lebih kecil ke yang lebih besar. Yang lebih kecil mempunyai satu sisi 8 cm. Cari sisi sepadan bagi yang lebih besar, dan faktor skala dari yang lebih besar ke yang lebih kecil.', '$8 \\times 1.5 = 12$ cm; from larger to smaller the factor is $\\dfrac{1}{1.5} = \\dfrac{2}{3}$.', '$8 \\times 1.5 = 12$ cm; dari yang lebih besar ke yang lebih kecil faktornya ialah $\\dfrac{1}{1.5} = \\dfrac{2}{3}$.'],
      ['Shape $A$ is similar to shape $B$ with scale factor 3 from $A$ to $B$. Shape $B$ is similar to shape $C$ with scale factor $\\tfrac{1}{3}$ from $B$ to $C$. What can you say about $A$ and $C$?', 'Bentuk $A$ serupa dengan bentuk $B$ dengan faktor skala 3 dari $A$ ke $B$. Bentuk $B$ serupa dengan bentuk $C$ dengan faktor skala $\\tfrac{1}{3}$ dari $B$ ke $C$. Apakah yang boleh anda katakan tentang $A$ dan $C$?', '$A$ and $C$ have the same size and the same shape, so they are congruent.', '$A$ dan $C$ mempunyai saiz dan bentuk yang sama, jadi ia kongruen.'],
    ];
    const b = r.pick(bank);
    return { q: T(b[0], b[1]), a: T(b[2], b[3]), w: W(T('Similar means the same shape with all lengths in the same ratio; a scale factor of $1$ leaves every length unchanged, which is exactly congruence.', 'Serupa bermaksud bentuk yang sama dengan semua panjang dalam nisbah yang sama; faktor skala $1$ membiarkan setiap panjang tidak berubah, iaitu tepat kekongruenan.'), T(b[2], b[3])), sp: 'm' };
  });
  A116.push((r) => { // scale drawing: real-life
    const k = r.pick([100, 500, 1000, 50]);
    const real = r.pick([12, 18, 24, 30, 45, 60]);
    return { q: T(`A floor plan is drawn to a scale of 1 : ${k}. A room is ${real} m long in real life. Is the plan congruent or similar to the room? Find the length of the room on the plan in cm.`, `Pelan lantai dilukis pada skala 1 : ${k}. Sebuah bilik panjangnya ${real} m dalam kehidupan sebenar. Adakah pelan itu kongruen atau serupa dengan bilik itu? Cari panjang bilik itu pada pelan dalam cm.`), a: T(`Similar (same shape, different size). Length on plan $= ${real} \\times 100 \\div ${k} = ${n(round(real * 100 / k, 2))}$ cm.`, `Serupa (bentuk sama, saiz berbeza). Panjang pada pelan $= ${real} \\times 100 \\div ${k} = ${n(round(real * 100 / k, 2))}$ cm.`), w: W(T('A scale drawing keeps the shape but changes the size, so the plan is similar to the room, not congruent.', 'Lukisan berskala mengekalkan bentuk tetapi mengubah saiz, jadi pelan itu serupa dengan bilik, bukan kongruen.'), `$${real}$ m $= ${real * 100}$ cm`, `$${real * 100} \\div ${k} = ${n(round(real * 100 / k, 2))}$ cm`), sp: 'm' };
  });
  A116.push((r) => { // reasoning with congruent quadrilaterals
    const w = r.int(3, 8), h = r.int(2, w - 1);
    const forms = [
      [`Rectangle $ABCD$ is ${w} cm long and ${h} cm wide. Rectangle $EFGH$ is ${h} cm long and ${w} cm wide. Are they congruent? Explain in terms of a transformation that maps one onto the other.`, `Segi empat tepat $ABCD$ panjangnya ${w} cm dan lebarnya ${h} cm. Segi empat tepat $EFGH$ panjangnya ${h} cm dan lebarnya ${w} cm. Adakah kedua-duanya kongruen? Terangkan dari segi transformasi yang memetakan satu ke atas yang lain.`, `Yes: a rotation of $90^\\circ$ maps a ${w} cm by ${h} cm rectangle onto a ${h} cm by ${w} cm rectangle, and a rotation is an isometry, so the rectangles are congruent.`, `Ya: putaran $90^\\circ$ memetakan segi empat tepat ${w} cm kali ${h} cm ke segi empat tepat ${h} cm kali ${w} cm, dan putaran ialah isometri, jadi segi empat tepat itu kongruen.`],
    ];
    return { q: T(forms[0][0], forms[0][1]), a: T(forms[0][2], forms[0][3]), w: W(T('Two shapes are congruent when one can be mapped exactly onto the other by an isometry.', 'Dua bentuk kongruen apabila satu boleh dipetakan tepat ke atas yang lain oleh suatu isometri.'), T(`A quarter-turn swaps length and width, mapping the ${w} cm by ${h} cm rectangle onto the ${h} cm by ${w} cm rectangle.`, `Suku pusingan menukar panjang dan lebar, memetakan segi empat tepat ${w} cm kali ${h} cm ke segi empat tepat ${h} cm kali ${w} cm.`), T('A rotation is an isometry, so the two rectangles are congruent.', 'Putaran ialah isometri, jadi kedua-dua segi empat tepat itu kongruen.')), sp: 'm' };
  });

  SPM.extend('F2-11.1', { e: E111, m: M111, a: A111 });

  SPM.extend('F2-11.3', { e: E113, m: M113, a: A113 });

  SPM.extend('F2-11.4', { e: E114, m: M114, a: A114 });

  SPM.extend('F2-11.5', { e: E115, m: M115, a: A115 });

  SPM.extend('F2-11.6', { e: E116, m: M116, a: A116 });

  SPM.extend('F2-11.2', { e: E112, m: M112, a: A112 });

})();
