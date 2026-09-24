/* Variety pack x1d: Form 1 Chapter 6 "Linear Equations" (F1-6.1 … F1-6.7). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, Fr, poly, lin, rm } = SPM;
  const T = SPM.L, S = SPM.svg;
  const Q = (a, b) => Fr.make(a, b === undefined ? 1 : b);
  const F_ = (v) => (typeof v === 'number' ? Q(v) : v);
  const tx = Fr.tex;
  const ABC = 'ABCD';
  const eq2 = (a, b, c) => `${poly([[a, 'x'], [b, 'y']])} = ${c}`;
  const sg = (v) => (v < 0 ? '-' : '+');
  const ab = Math.abs;
  const cx = (f) => (f.d === 1 && f.n === 1 ? '' : f.d === 1 && f.n === -1 ? '-' : tx(f));
  const I = SPM.bank;
  const yes = (b) => (b ? T('Yes', 'Ya') : T('No', 'Tidak'));

  /* ---- shared: equation objects  L = p1 x + q1 ,  R = p2 x + q2  (exact fractions), solved independently ---- */
  const side = (p) => {
    need(p[0].d === 1 && p[1].d === 1);
    return poly([[p[0].n, 'x'], [p[1].n, '']]);
  };
  const EO = (L, R, tex) => {
    const l = [F_(L[0]), F_(L[1])], rr = [F_(R[0]), F_(R[1])];
    const dp = Fr.sub(l[0], rr[0]), dq = Fr.sub(rr[1], l[1]);
    need(dp.n !== 0);
    return { tex: tex || `${side(l)} = ${side(rr)}`, l, r: rr, dp, dq, x: Fr.div(dq, dp) };
  };
  const ev = (e, v) => {
    const V = F_(v);
    return [Fr.add(Fr.mul(e.l[0], V), e.l[1]), Fr.add(Fr.mul(e.r[0], V), e.r[1])];
  };
  const wk = (e) => T(`Collect terms: $${cx(e.dp)}x = ${tx(e.dq)}$`, `Kumpulkan sebutan: $${cx(e.dp)}x = ${tx(e.dq)}$`);
  const xans = (e) => T(`$x = ${tx(e.x)}$`);
  const X = (r, o) => (o && o.pos ? r.int(2, 12) : r.nz(-8, 12));
  const K = {
    add: (r, o) => { const x = X(r, o), b = r.nz(-9, 9); return EO([1, b], [0, x + b]); },
    mul: (r, o) => { const x = X(r, o), a = r.int(2, 9); return EO([a, 0], [0, a * x]); },
    div: (r, o) => { const a = r.int(2, 6), k = X(r, o); return EO([Q(1, a), 0], [0, k], `\\dfrac{x}{${a}} = ${k}`); },
    two: (r, o) => { const x = X(r, o), a = r.int(2, 8), b = r.nz(-9, 9); return EO([a, b], [0, o && o.frac ? r.int(-12, 20) : a * x + b]); },
    brk: (r, o) => { const x = X(r, o), a = r.int(2, 6), b = r.nz(-6, 6), c = o && o.frac ? r.int(-12, 30) : a * (x + b); return EO([a, a * b], [0, c], `${a}(${lin(1, b)}) = ${c}`); },
    brkc: (r, o) => { const x = X(r, o), a = r.int(2, 6), b = r.nz(-6, 6), c = r.nz(-9, 9), d = a * (x + b) + c; return EO([a, a * b + c], [0, d], `${a}(${lin(1, b)}) ${sg(c)} ${ab(c)} = ${d}`); },
    divb: (r, o) => { const a = r.int(2, 5), k = X(r, o), b = r.nz(-8, 8); return EO([Q(1, a), b], [0, k + b], `\\dfrac{x}{${a}} ${sg(b)} ${ab(b)} = ${k + b}`); },
    divb2: (r, o) => { const a = r.int(2, 5), c = r.int(1, 8), b = r.nz(-6, 9), x = a * c - b; need(ab(x) <= 15); return EO([Q(1, a), Q(b, a)], [0, c], `\\dfrac{${lin(1, b)}}{${a}} = ${c}`); },
    both: (r, o) => { const x = X(r, o), a = r.int(2, 8), c = r.nz(-5, 7), b = r.int(-9, 9); need(a !== c); const d = o && o.frac ? r.int(-12, 15) : (a - c) * x + b; need(ab(d) <= 20); return EO([a, b], [c, d]); },
    brkb: (r, o) => { const x = X(r, o), a = r.int(2, 6), b = r.nz(-6, 6), c = r.int(1, 8); need(a !== c); const d = a * (x + b) - c * x; need(ab(d) <= 20); return EO([a, a * b], [c, d], `${a}(${lin(1, b)}) = ${lin(c, d)}`); },
    neg: (r, o) => { const x = X(r, o), a = r.int(1, 6), b = r.nz(-12, 15), c = o && o.frac ? r.int(-12, 15) : b - a * x; return EO([-a, b], [0, c], `${b} - ${a === 1 ? '' : a}x = ${c}`); },
    fr3: (r) => { const x = X(r), a = r.int(2, 6), b = r.nz(-9, 9), c = r.int(2, 5), t = a * x + b; need(t % c === 0); return EO([Q(a, c), Q(b, c)], [0, t / c], `\\dfrac{${lin(a, b)}}{${c}} = ${t / c}`); },
    frac2: (r) => { const a = r.int(2, 5), b = r.int(2, 6), s = r.pick([1, -1]); need(a !== b); const k = r.nz(-4, 5), x = SPM.lcm(a, b) * k, c = x / a + (s * x) / b; return EO([Fr.add(Q(1, a), Q(s, b)), 0], [0, c], `\\dfrac{x}{${a}} ${sg(s)} \\dfrac{x}{${b}} = ${c}`); },
    fr4: (r) => { const x = r.nz(-4, 8), p = r.pick([2, 3, 4]), q = r.pick([3, 5, 6]), b = r.int(1, 6), c = r.int(1, 4); need(p !== q); const num = q * (x + b) - p * c * x; need(num % p === 0); const d = num / p; need(ab(d) < 12 && d !== 0); return EO([Q(1, p), Q(b, p)], [Q(c, q), Q(d, q)], `\\dfrac{x + ${b}}{${p}} = \\dfrac{${lin(c, d)}}{${q}}`); },
    brk2: (r) => { const x = X(r), a = r.int(2, 6), c = r.int(2, 6), b = r.nz(-5, 6); need(a !== c); const m = a * (x + b); need(m % c === 0); const d = m / c - x; need(ab(d) <= 12 && d !== 0); return EO([a, a * b], [c, c * d], `${a}(${lin(1, b)}) = ${c}(${lin(1, d)})`); },
  };
  const eqn = (r, kind, o) => {
    const e = K[kind](r, o || {});
    if (o && o.frac) need(e.x.d > 1 && e.x.d <= 8 && ab(e.x.n) <= 40);
    else need(e.x.d === 1 && ab(e.x.n) <= 30);
    if (o && o.pos) need(e.x.n > 0);
    return e;
  };
  const EASYK = ['add', 'mul', 'div', 'two'], MEDK = ['brk', 'brkc', 'divb', 'divb2', 'both', 'neg', 'fr3', 'frac2'], ADVK = ['fr4', 'brk2', 'brkb', 'both', 'neg'];
  const opts = (r, correct, wrong, k) => {
    const ws = [...new Set(wrong.filter((w) => w !== correct))].slice(0, (k || 4) - 1);
    need(ws.length === (k || 4) - 1);
    const all = r.shuffle([correct].concat(ws));
    const i = all.indexOf(correct);
    return { list: all.map((o, j) => `(${ABC[j]}) $${o}$`).join('&emsp;'), key: ABC[i], val: correct, all };
  };
  const mcqA = (o) => T(`(${o.key}) $${o.val}$`);

  /* ---- worked solutions (W = SPM.lines); every step is computed from the generator's own values ---- */
  const W = SPM.lines;
  /** coefficient in front of a letter: 1 -> '', -1 -> '-' */
  const cn = (k) => (k === 1 ? '' : k === -1 ? '-' : n(k));
  /** "a - b" written with the right sign (integers) */
  const dif = (a, b) => (b === 0 ? n(a) : `${n(a)} ${b < 0 ? '+' : '-'} ${n(ab(b))}`);
  /** "a - b = c" (or just "c" when b === 0) */
  const redu = (a, b) => (b === 0 ? n(a - b) : `${dif(a, b)} = ${n(a - b)}`);
  /** a value substituted in place of a letter that follows a coefficient: always bracketed, so `3x` becomes `3(2)` */
  const br = (v) => `(${n(v)})`;
  /** full solving steps for an EO: clear fractions / expand brackets -> collect -> divide */
  const stepsW = (e, V) => {
    V = V || 'x';
    const out = [];
    let D = [e.l[0], e.l[1], e.r[0], e.r[1]].reduce((k, f) => SPM.lcm(k, f.d), 1);
    /* also clear the denominators that are written in the equation itself (x/2 + x/6 = 8 has denominators 2 and 6) */
    for (const m of e.tex.match(/\\dfrac\{[^{}]*\}\{\d+\}/g) || []) D = SPM.lcm(D, +m.replace(/^.*\}\{(\d+)\}$/, '$1'));
    const L = [Fr.mul(e.l[0], Q(D)).n, Fr.mul(e.l[1], Q(D)).n], R = [Fr.mul(e.r[0], Q(D)).n, Fr.mul(e.r[1], Q(D)).n];
    const plain = `${poly([[L[0], V], [L[1], '']])} = ${poly([[R[0], V], [R[1], '']])}`;
    if (D > 1) out.push(T(`Multiply both sides by $${D}$: $${plain}$`, `Darab kedua-dua belah dengan $${D}$: $${plain}$`));
    else if (/\(/.test(e.tex)) out.push(T(`Expand and simplify: $${plain}$`, `Kembang dan permudahkan: $${plain}$`));
    const dp = L[0] - R[0], dq = R[1] - L[1], xr = Fr.make(dq, dp);
    const shown = D > 1 || /\(/.test(e.tex);
    const collected = L[1] === 0 && R[0] === 0 && (shown || e.tex.replace(/x/g, V) === plain);
    if (!collected) {
      const rhs = L[1] === 0 ? n(dq) : `${dif(R[1], L[1])} = ${n(dq)}`;
      out.push(T(`Collect like terms: $${cn(dp)}${V} = ${rhs}$`, `Kumpulkan sebutan serupa: $${cn(dp)}${V} = ${rhs}$`));
    }
    if (dp === 1) { if (collected) out.push(T(`$${V} = ${n(dq)}$`)); }
    else if (dp === -1) out.push(T(`Multiply both sides by $-1$: $${V} = ${n(-dq)}$`, `Darab kedua-dua belah dengan $-1$: $${V} = ${n(-dq)}$`));
    else { const show = dp > 0 && `\\dfrac{${n(dq)}}{${n(dp)}}` !== tx(xr) ? `\\dfrac{${n(dq)}}{${n(dp)}} = ` : ''; out.push(T(`Divide both sides by $${n(dp)}$: $${V} = ${show}${tx(xr)}$`, `Bahagi kedua-dua belah dengan $${n(dp)}$: $${V} = ${show}${tx(xr)}$`)); }
    if (!out.length) out.push(T(`$${V} = ${tx(e.x)}$`));
    return out;
  };
  /** "p x + q" with the value t put in place of x */
  const sideSub = (p, t) => {
    const c0 = p[0], c1 = p[1];
    const T1 = typeof t === 'number' ? n(t) : tx(t), neg = typeof t === 'number' ? t < 0 : Fr.cmp(t, Q(0)) < 0;
    const T0 = neg ? `(${T1})` : T1, TB = `(${T1})`;
    const K = (f) => (f.d === 1 ? n(ab(f.n)) : tx(Fr.make(ab(f.n), f.d)));
    let s;
    if (c0.n === 0) s = '';
    else if (c0.d === 1) s = ab(c0.n) === 1 ? `${c0.n < 0 ? '-' : ''}${T0}` : `${c0.n < 0 ? '-' : ''}${n(ab(c0.n))}${TB}`;
    else if (ab(c0.n) === 1) s = `${c0.n < 0 ? '-' : ''}\\dfrac{${T1}}{${c0.d}}`;
    else s = `${c0.n < 0 ? '-' : ''}\\dfrac{${ab(c0.n)} \\times ${T1}}{${c0.d}}`;
    if (c1.n === 0) return s || '0';
    if (!s) return `${c1.n < 0 ? '-' : ''}${K(c1)}`;
    if (c0.n < 0 && c1.n > 0) return `${K(c1)} - ${s.slice(1)}`;
    return `${s} ${c1.n < 0 ? '-' : '+'} ${K(c1)}`;
  };
  /** substitution check of a value in an EO: "LHS = … , RHS = …" */
  const subW = (e, v, V) => {
    const [lv, rv] = ev(e, v);
    const t = typeof v === 'number' ? n(v) : tx(v);
    const sl = `${sideSub(e.l, v)}${e.l[0].n === 0 ? '' : ` = ${tx(lv)}`}`, sr = `${sideSub(e.r, v)}${e.r[0].n === 0 ? '' : ` = ${tx(rv)}`}`;
    return T(`Substitute $${V || 'x'} = ${t}$: LHS $= ${sl}$, RHS $= ${sr}$`, `Gantikan $${V || 'x'} = ${t}$: LHS $= ${sl}$, RHS $= ${sr}$`);
  };
  /** "…, so the two sides are (not) equal" */
  const eqLine = (ok) => (ok ? T('The two sides are equal, so it is a solution.', 'Kedua-dua belah sama, maka ia satu penyelesaian.') : T('The two sides are not equal, so it is not a solution.', 'Kedua-dua belah tidak sama, maka ia bukan penyelesaian.'));
  /** left side of "a x + b y" evaluated at (x, y) shown as a substitution */
  const sub2 = (a, b, x, y) => `${cn(a) === '' ? '' : cn(a)}${br(x)}${b < 0 ? ' - ' : ' + '}${cn(ab(b)) === '' ? '' : cn(ab(b))}${br(y)} = ${n(a * x + b * y)}`;
  /** elimination working for a 2x2 system (det != 0); returns an array of lines */
  const sysW = (s, V, U) => {
    V = V || 'x'; U = U || 'y';
    const z = solS(s), out = [];
    if (s.b1 === 0 || s.b2 === 0) {
      const one = s.b1 === 0 ? 1 : 2, a = one === 1 ? s.a1 : s.a2, c = one === 1 ? s.c1 : s.c2;
      out.push(a === 1 ? T(`From (${one}): $${V} = ${n(c)}$`, `Daripada (${one}): $${V} = ${n(c)}$`) : T(`From (${one}): $${cn(a)}${V} = ${n(c)}$, so $${V} = ${tx(z.x)}$`, `Daripada (${one}): $${cn(a)}${V} = ${n(c)}$, maka $${V} = ${tx(z.x)}$`));
      const ob = one === 1 ? s.b2 : s.b1, oa = one === 1 ? s.a2 : s.a1, oc = one === 1 ? s.c2 : s.c1;
      out.push(ob === 1 ? T(`Substitute into (${one === 1 ? 2 : 1}): $${U} = ${tx(z.y)}$`, `Gantikan ke dalam (${one === 1 ? 2 : 1}): $${U} = ${tx(z.y)}$`) : T(`Substitute into (${one === 1 ? 2 : 1}): $${cn(ob)}${U} = ${tx(Fr.sub(Q(oc), Fr.mul(Q(oa), z.x)))}$, so $${U} = ${tx(z.y)}$`, `Gantikan ke dalam (${one === 1 ? 2 : 1}): $${cn(ob)}${U} = ${tx(Fr.sub(Q(oc), Fr.mul(Q(oa), z.x)))}$, maka $${U} = ${tx(z.y)}$`));
      return out;
    }
    const g = SPM.lcm(ab(s.b1), ab(s.b2)), m1 = g / ab(s.b1), m2 = g / ab(s.b2);
    if (m1 > 1 || m2 > 1) out.push(T(`Match the $${U}$ terms: $(1) \\times ${m1}$ and $(2) \\times ${m2}$: $${eq2(s.a1 * m1, s.b1 * m1, s.c1 * m1)}$, $${eq2(s.a2 * m2, s.b2 * m2, s.c2 * m2)}$`, `Samakan sebutan $${U}$: $(1) \\times ${m1}$ dan $(2) \\times ${m2}$: $${eq2(s.a1 * m1, s.b1 * m1, s.c1 * m1)}$, $${eq2(s.a2 * m2, s.b2 * m2, s.c2 * m2)}$`));
    const plus = s.b1 * m1 === -(s.b2 * m2), A = s.a1 * m1 + (plus ? 1 : -1) * s.a2 * m2, C = s.c1 * m1 + (plus ? 1 : -1) * s.c2 * m2;
    out.push(T(`${plus ? 'Add' : 'Subtract'} the equations to eliminate $${U}$: $${cn(A)}${V} = ${n(C)}$`, `${plus ? 'Tambah' : 'Tolak'} persamaan untuk menyingkirkan $${U}$: $${cn(A)}${V} = ${n(C)}$`));
    if (A !== 1) out.push(T(`$${V} = ${tx(z.x)}$`));
    out.push(s.b1 === 1 ? T(`Substitute into (1): $${U} = ${tx(z.y)}$`, `Gantikan ke dalam (1): $${U} = ${tx(z.y)}$`) : T(`Substitute into (1): $${cn(s.b1)}${U} = ${tx(Fr.sub(Q(s.c1), Fr.mul(Q(s.a1), z.x)))}$, so $${U} = ${tx(z.y)}$`, `Gantikan ke dalam (1): $${cn(s.b1)}${U} = ${tx(Fr.sub(Q(s.c1), Fr.mul(Q(s.a1), z.x)))}$, maka $${U} = ${tx(z.y)}$`));
    return out;
  };

  /* ---- shared: one-variable stories.  each returns {st:T story, e:EO}; the story defines $x$ itself ---- */
  const SC = (st, L, R, x, tex) => { const e = EO(L, R, tex); need(Fr.eq(e.x, Q(x))); return { st, e, custom: !!tex }; };
  const NB = I.items.filter((i) => i.hi <= 45);
  const SCe = [
    (r) => { const nm = r.name(), c = r.int(3, 15), a = r.int(2, 9); return SC(T(`${nm} has $x$ marbles. After giving ${a} marbles to a friend, ${nm} has ${c} marbles left.`, `${nm} mempunyai $x$ biji guli. Selepas memberikan ${a} biji guli kepada seorang kawan, ${nm} tinggal ${c} biji guli.`), [1, -a], [0, c], c + a); },
    (r) => { const a = r.int(20, 90), c = r.int(a + 50, a + 400), g = c - a; return SC(T(`A balance is level. The left pan holds a packet of flour of mass $x$ g and a ${a} g weight. The right pan holds a ${c} g weight.`, `Sebuah penimbang berada dalam keadaan seimbang. Dulang kiri mengandungi sebungkus tepung berjisim $x$ g dan satu pemberat ${a} g. Dulang kanan mengandungi satu pemberat ${c} g.`), [1, a], [0, c], g); },
    (r) => { const nm = r.name(), s = r.int(5, 30), w = r.int(3, 8), x = r.int(2, 9); return SC(T(`${nm} has RM${s} and saves RM$x$ every week. After ${w} weeks ${nm} has RM${s + w * x}.`, `${nm} mempunyai RM${s} dan menyimpan RM$x$ setiap minggu. Selepas ${w} minggu ${nm} mempunyai RM${s + w * x}.`), [w, s], [0, s + w * x], x); },
    (r) => { const nm = r.name(), it = r.pick(NB), x = r.int(it.lo, it.hi), k = r.int(2, 5), c = r.int(2, 9); return SC(T(`${nm} buys ${k} ${it.en} at RM$x$ each and a plastic bag for RM${c}. The total bill is RM${k * x + c}.`, `${nm} membeli ${k} ${it.ms} pada harga RM$x$ setiap satu dan sebuah beg plastik berharga RM${c}. Jumlah bil ialah RM${k * x + c}.`), [k, c], [0, k * x + c], x); },
    (r) => { const k = r.int(2, 6), x = r.int(8, 25); return SC(T(`${k} cinema tickets cost RM${k * x} altogether. The price of one ticket is RM$x$.`, `${k} keping tiket wayang berharga RM${k * x} semuanya. Harga sekeping tiket ialah RM$x$.`), [k, 0], [0, k * x], x); },
    (r) => { const nm = r.name(), k = r.int(3, 6), c = r.int(4, 20); return SC(T(`RM$x$ is shared equally among ${k} children. Each child receives RM${c}.`, `RM$x$ dikongsi sama rata antara ${k} orang kanak-kanak. Setiap orang menerima RM${c}.`), [Q(1, k), 0], [0, c], k * c, `\\dfrac{x}{${k}} = ${c}`); },
    (r) => { const b = r.int(3, 9), a = r.int(2, 5), x = r.int(3, 9), c = -b + a * x; return SC(T(`At 6 a.m. the temperature in Cameron Highlands was $-${b}\\,^\\circ$C. It rose by ${a}$\\,^\\circ$C every hour. After $x$ hours it was ${c}$\\,^\\circ$C.`, `Pada pukul 6 pagi suhu di Cameron Highlands ialah $-${b}\\,^\\circ$C. Suhu naik ${a}$\\,^\\circ$C setiap jam. Selepas $x$ jam suhunya ialah ${c}$\\,^\\circ$C.`), [a, -b], [0, c], x, `-${b} + ${a}x = ${c}`); },
    (r) => { const a = r.int(2, 9), x = r.int(3, 15), t = r.pick([3, 4]); return SC(T(`A square has sides of length $(x + ${a})$ cm and a perimeter of ${4 * (x + a)} cm.`, `Sebuah segi empat sama mempunyai sisi $(x + ${a})$ cm dan perimeter ${4 * (x + a)} cm.`), [4, 4 * a], [0, 4 * (x + a)], x, `4(x + ${a}) = ${4 * (x + a)}`); },
    (r) => { const nm = r.name(), k = r.int(3, 4), x = r.int(9, 15); return SC(T(`${nm} is $x$ years old. ${nm}'s father is ${k} times as old as ${nm}. The sum of their ages is ${(k + 1) * x} years.`, `${nm} berumur $x$ tahun. Ayah ${nm} berumur ${k} kali ganda umur ${nm}. Jumlah umur mereka ialah ${(k + 1) * x} tahun.`), [k + 1, 0], [0, (k + 1) * x], x, `x + ${k}x = ${(k + 1) * x}`); },
  ];
  const SCm = [
    (r) => { const a = r.int(3, 7), c = r.int(1, a - 1), x = r.int(2, 9), b = r.int(1, 9), d = (a - c) * x - b; need(d > 0); return SC(T(`${a} times a number $x$, decreased by ${b}, is equal to ${c} times the number, increased by ${d}.`, `${a} kali suatu nombor $x$, ditolak ${b}, adalah sama dengan ${c} kali nombor itu, ditambah ${d}.`), [a, -b], [c, d], x); },
    (r) => { const x = r.int(4, 30), t = 3 * x + 3; return SC(T(`The sum of three consecutive integers is ${t}. The smallest integer is $x$.`, `Hasil tambah tiga integer berturut-turut ialah ${t}. Integer yang terkecil ialah $x$.`), [3, 3], [0, t], x, `x + (x + 1) + (x + 2) = ${t}`); },
    (r) => { const nm = r.pair(), a = r.int(5, 40), x = r.int(20, 90); return SC(T(`${nm[0]} has RM$x$. ${nm[1]} has RM${a} more than ${nm[0]}. Together they have RM${2 * x + a}.`, `${nm[0]} mempunyai RM$x$. ${nm[1]} mempunyai RM${a} lebih daripada ${nm[0]}. Mereka mempunyai RM${2 * x + a} bersama-sama.`), [2, a], [0, 2 * x + a], x, `x + (x + ${a}) = ${2 * x + a}`); },
    (r) => { const a = r.int(2, 8), x = r.int(4, 20); return SC(T(`An isosceles triangle has two equal sides of length $x$ cm and a third side of length $(x + ${a})$ cm. Its perimeter is ${3 * x + a} cm.`, `Sebuah segi tiga sama kaki mempunyai dua sisi sama panjang $x$ cm dan sisi ketiga $(x + ${a})$ cm. Perimeternya ialah ${3 * x + a} cm.`), [3, a], [0, 3 * x + a], x, `x + x + (x + ${a}) = ${3 * x + a}`); },
    (r) => { const a = r.int(2, 4), b = r.int(5, 25), c = r.int(2, 4), x = r.int(10, 25), d = 180 - (a + c) * x - b; need(d > -40 && d < 40 && d !== 0); return SC(T(`Two angles on a straight line measure $(${lin(a, b)})^\\circ$ and $(${lin(c, d)})^\\circ$.`, `Dua sudut pada satu garis lurus berukuran $(${lin(a, b)})^\\circ$ dan $(${lin(c, d)})^\\circ$.`), [a + c, b + d], [0, 180], x, `(${lin(a, b)}) + (${lin(c, d)}) = 180`); },
    (r) => { const b = r.int(5, 30), x = r.int(15, 40); need(4 * x + b < 175); return SC(T(`The angles of a triangle are $x^\\circ$, $(2x)^\\circ$ and $(x + ${b})^\\circ$.`, `Sudut-sudut sebuah segi tiga ialah $x^\\circ$, $(2x)^\\circ$ dan $(x + ${b})^\\circ$.`), [4, b], [0, 180], (180 - b) / 4, `x + 2x + (x + ${b}) = 180`); },
    (r) => { const k = r.int(3, 8), b = r.int(2, 9), x = r.int(3, 12); const it = r.pick(I.clubs); return SC(T(`Each of the ${k} members of the ${it.en} pays RM$x$ for membership and RM${b} for a badge. The club collects RM${k * (x + b)}.`, `Setiap seorang daripada ${k} ahli ${it.ms} membayar RM$x$ untuk keahlian dan RM${b} untuk sebuah lencana. Kelab itu mengutip RM${k * (x + b)}.`), [k, k * b], [0, k * (x + b)], x, `${k}(x + ${b}) = ${k * (x + b)}`); },
    (r) => { const nm = r.name(), b = r.int(10, 40), x = r.int(30, 80); return SC(T(`${nm} cycles for 2 hours at $x$ km/h and then for 1 hour at $(x + ${b})$ km/h. The total distance is ${3 * x + b} km.`, `${nm} berbasikal selama 2 jam pada $x$ km/j dan kemudian selama 1 jam pada $(x + ${b})$ km/j. Jumlah jarak ialah ${3 * x + b} km.`), [3, b], [0, 3 * x + b], x, `2x + (x + ${b}) = ${3 * x + b}`); },
    (r) => { const nm = r.name(), b = r.int(2, 9), k = r.int(3, 6), c = r.int(20, 60), x = r.int(1, 10); return SC(T(`A mobile plan costs RM${b} per month plus RM${k} for every gigabyte. ${nm} paid RM${b + k * x} for $x$ gigabytes of data in a month.`, `Satu pelan telefon bimbit berharga RM${b} sebulan campur RM${k} bagi setiap gigabait. ${nm} membayar RM${b + k * x} untuk $x$ gigabait data dalam sebulan.`), [k, b], [0, b + k * x], x); },
    (r) => { const nm = r.name(), it = r.pick(NB), k = r.int(3, 6), x = r.int(it.lo + 2, it.hi + 4), b = r.int(2, x * 2); return SC(T(`A shop sells ${it.en} at RM$x$ each. ${nm} buys ${k} of them and is given a RM${b} discount on the bill. ${nm} pays RM${k * x - b}.`, `Sebuah kedai menjual ${it.ms} pada harga RM$x$ setiap satu. ${nm} membeli ${k} unit dan diberi diskaun RM${b} pada bil. ${nm} membayar RM${k * x - b}.`), [k, -b], [0, k * x - b], x); },
    (r) => { const nm = r.name(), k = r.int(3, 6), b = r.int(1, 5), c = r.int(4, 12); return SC(T(`${nm} shares $x$ sweets equally among ${k} friends and keeps ${b} sweets. Each friend gets ${c} sweets, so ${nm} gave away ${k * c} sweets.`, `${nm} berkongsi $x$ biji gula-gula sama banyak dengan ${k} orang kawan dan menyimpan ${b} biji. Setiap kawan mendapat ${c} biji, maka ${nm} memberi ${k * c} biji gula-gula.`), [1, -b], [0, k * c], k * c + b); },
    (r) => { const a = r.int(4, 7), b = r.int(2, 12), x = r.int(2, 12), d = (a - 2) * x - b; need(d > 0); return SC(T(`Twice a number $x$ increased by ${b} is equal to ${a} times the number decreased by ${d}.`, `Dua kali suatu nombor $x$ ditambah ${b} adalah sama dengan ${a} kali nombor itu ditolak ${d}.`), [2, b], [a, -d], x); },
  ];
    const optsT = (r, correct, wrong) => {
    const ws = wrong.filter((w, i) => w.en !== correct.en && wrong.findIndex((v) => v.en === w.en) === i).slice(0, 3);
    need(ws.length === 3);
    const all = r.shuffle([correct].concat(ws));
    const f = (k) => all.map((o, j) => `(${ABC[j]}) ${o[k]}`).join('&emsp;');
    return { list: T(f('en'), f('ms')), key: ABC[all.indexOf(correct)], val: correct };
  };
  const withQ = (t, tail) => T(t.en + '<br>' + tail.en, t.ms + '<br>' + tail.ms);
  const cat = SPM.cat;
  const nv = (s) => new Set(s.replace(/\\[a-z]+/g, '').match(/[a-z]/g)).size;

  /* ================================================================ 6.1 */
  const LB = [
    (r) => `${lin(r.int(2, 9), r.nz(-9, 9))} = ${r.int(5, 40)}`,
    (r) => `y = ${lin(r.int(2, 7), r.nz(-9, 9))}`,
    (r) => `\\dfrac{x}{${r.int(2, 6)}} ${r.pick(['+', '-'])} ${r.int(1, 9)} = ${r.int(2, 12)}`,
    (r) => eq2(r.int(1, 6), r.int(1, 6) * r.sign(), r.int(4, 30)),
    (r) => `${r.int(5, 20)} - x = ${r.int(1, 9)}`,
    (r) => `${r.int(2, 5)}(${lin(1, r.nz(-6, 6))}) = ${r.int(6, 40)}`,
    (r) => `${r.int(2, 6)}p + ${r.int(1, 9)}q = ${r.int(5, 30)}`,
    (r) => `${lin(r.int(3, 8), r.int(1, 9))} = ${lin(r.int(1, 2), r.int(1, 9))}`,
  ];
  const NLB = [
    [(r) => `x^2 ${r.pick(['+', '-'])} ${r.int(1, 9)} = ${r.int(10, 40)}`, T('the power of $x$ is 2', 'kuasa bagi $x$ ialah 2')],
    [(r) => `xy = ${r.int(4, 30)}`, T('two unknowns are multiplied together', 'dua pemboleh ubah didarabkan')],
    [(r) => `\\dfrac{${r.int(2, 12)}}{x} = ${r.int(2, 9)}`, T('the unknown is in the denominator', 'pemboleh ubah berada pada penyebut')],
    [(r) => `y = ${r.int(2, 5)}x^2 ${r.pick(['+', '-'])} ${r.int(1, 9)}`, T('the power of $x$ is 2', 'kuasa bagi $x$ ialah 2')],
    [(r) => `x^3 - ${r.int(1, 9)} = ${r.int(2, 30)}`, T('the power of $x$ is 3', 'kuasa bagi $x$ ialah 3')],
    [(r) => `x^2 + y^2 = ${r.int(10, 60)}`, T('both unknowns have power 2', 'kedua-dua pemboleh ubah berkuasa 2')],
    [(r) => `xy + x = ${r.int(5, 30)}`, T('the term $xy$ has two unknowns multiplied', 'sebutan $xy$ mempunyai dua pemboleh ubah yang didarab')],
    [(r) => `${r.int(2, 9)} + \\dfrac{${r.int(2, 9)}}{y} = x`, T('the unknown $y$ is in the denominator', 'pemboleh ubah $y$ berada pada penyebut')],
  ];
  const eLinear = (r) => {
    const v = r.int(0, 4);
    const nl = r.sample(NLB, 3).map((b) => [b[0](r), b[1]]), li = r.sample(LB, 3).map((b) => b(r));
    const show = (items) => items.map((o, i) => `(${ABC[i]}) $${o[0]}$`).join('&emsp;');
    const why = (i, reason) => cat(T(`(${ABC[i]}) is not linear: `, `(${ABC[i]}) bukan linear: `), reason);
    const rule = T('In a linear equation every unknown has power $1$ and no unknowns are multiplied or divided by each other.', 'Dalam persamaan linear setiap pemboleh ubah berkuasa $1$ dan tiada pemboleh ubah yang didarab atau dibahagi antara satu sama lain.');
    if (v === 0) {
      const items = r.shuffle([[li[0], 1], [li[1], 1], [nl[0][0], 0, nl[0][1]], [nl[1][0], 0, nl[1][1]]]);
      const ans = items.map((o, i) => (o[1] ? ABC[i] : '')).filter(Boolean).join(', ');
      return { q: T(`Which of the following are linear equations? ${show(items)}`, `Antara yang berikut, yang manakah persamaan linear? ${show(items)}`), a: T(ans), w: W(rule, ...items.map((o, i) => (o[1] ? null : why(i, o[2]))).filter(Boolean), T(`So the linear equations are (${ans}).`, `Maka persamaan linear ialah (${ans}).`)), sp: 's' };
    }
    if (v === 1) {
      const o = opts(r, nl[0][0], [li[0], li[1], li[2]]);
      return { q: T(`Which one of the following is NOT a linear equation?<br>${o.list}`, `Antara yang berikut, yang manakah BUKAN persamaan linear?<br>${o.list}`), a: mcqA(o), w: W(rule, cat(T(`In $${o.val}$, `, `Dalam $${o.val}$, `), nl[0][1]), T(`So (${o.key}) is not linear.`, `Maka (${o.key}) bukan linear.`)), sp: 's' };
    }
    if (v === 2) {
      const isL = r.chance(), e = isL ? li[0] : nl[0][0];
      return { q: T(`Is $${e}$ a linear equation? Give a reason.`, `Adakah $${e}$ satu persamaan linear? Berikan satu sebab.`), a: isL ? T('Yes: every unknown has power 1 and no two unknowns are multiplied or divided', 'Ya: setiap pemboleh ubah berkuasa 1 dan tiada dua pemboleh ubah yang didarab atau dibahagi') : cat(T('No: ', 'Tidak: '), nl[0][1]), w: W(rule, isL ? T(`$${e}$ passes the test, so it is linear.`, `$${e}$ memenuhi syarat itu, maka ia linear.`) : cat(T(`In $${e}$, `, `Dalam $${e}$, `), nl[0][1])), sp: 's' };
    }
    if (v === 3) {
      const items = r.shuffle([[li[0], 1], [nl[0][0], 0, nl[0][1]], [li[1], 1]]);
      return { q: withQ(T('Classify each equation as linear or non-linear.', 'Kelaskan setiap persamaan sebagai linear atau tak linear.'), SPM.parts(items.map((o) => T(`$${o[0]}$`)))), a: SPM.parts(items.map((o) => (o[1] ? T('linear', 'linear') : T('non-linear', 'tak linear')))), w: W(rule, ...items.map((o, i) => (o[1] ? T(`(${ABC[i]}) $${o[0]}$: every unknown has power $1$, so it is linear.`, `(${ABC[i]}) $${o[0]}$: setiap pemboleh ubah berkuasa $1$, maka ia linear.`) : why(i, o[2])))), sp: 's' };
    }
    const e = li[r.int(0, 2)];
    const vs = [...new Set(e.replace(/\\[a-z]+/g, '').match(/[a-z]/g))];
    return { q: T(`Does $${e}$ have one variable or two variables?`, `Adakah $${e}$ mempunyai satu pemboleh ubah atau dua pemboleh ubah?`), a: nv(e) === 1 ? T('One variable', 'Satu pemboleh ubah') : T(`Two variables`, 'Dua pemboleh ubah'), w: W(T(`The letters used in the equation are $${vs.join('$, $')}$.`, `Huruf yang digunakan dalam persamaan ialah $${vs.join('$, $')}$.`), vs.length === 1 ? T('One letter, so one variable.', 'Satu huruf, maka satu pemboleh ubah.') : T('Two different letters, so two variables.', 'Dua huruf yang berbeza, maka dua pemboleh ubah.')), sp: 'xs' };
  };
  const eVerify = (r) => {
    const e = eqn(r, r.pick(EASYK), { pos: true }), x = e.x.n, v = r.int(0, 2);
    const t = r.chance() ? x : x + r.pick([-2, -1, 1, 2, 3]);
    need(t >= 0);
    const [lv, rv] = ev(e, t), good = Fr.eq(lv, rv);
    const wkg = W(subW(e, t), eqLine(good));
    if (v === 0) return { q: T(`Is $x = ${t}$ a solution of $${e.tex}$? Show your working.`, `Adakah $x = ${t}$ satu penyelesaian bagi $${e.tex}$? Tunjukkan langkah kerja anda.`), a: yes(good), w: wkg, sp: 's' };
    if (v === 1) {
      const c = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].filter((k) => k !== x), 2).concat([x]).sort((p, q) => p - q);
      return { q: T(`Which of the values $x = ${c.join(',\\ ')}$ is the solution of $${e.tex}$? Test each value by substitution.`, `Antara nilai $x = ${c.join(',\\ ')}$, yang manakah penyelesaian bagi $${e.tex}$? Uji setiap nilai dengan penggantian.`), a: T(`$x = ${x}$`), w: W(...c.map((k) => T(`$x = ${k}$: LHS $= ${tx(ev(e, k)[0])}$, RHS $= ${tx(ev(e, k)[1])}$`)), T(`Only $x = ${x}$ makes the two sides equal.`, `Hanya $x = ${x}$ menjadikan kedua-dua belah sama.`)), sp: 's' };
    }
    return { q: T(`When $x = ${t}$, the left-hand side of $${e.tex}$ equals $\\square$ and the right-hand side equals $\\square$. Fill in the blanks and state whether $x = ${t}$ makes the equation true.`, `Apabila $x = ${t}$, sebelah kiri bagi $${e.tex}$ bersamaan $\\square$ dan sebelah kanan bersamaan $\\square$. Isikan tempat kosong dan nyatakan sama ada $x = ${t}$ menjadikan persamaan itu benar.`), a: T(`LHS $= ${tx(lv)}$, RHS $= ${tx(rv)}$; ${good ? 'true' : 'not true'}`, `LHS $= ${tx(lv)}$, RHS $= ${tx(rv)}$; ${good ? 'benar' : 'tidak benar'}`), w: wkg, sp: 's' };
  };
  const eMissing = (r) => {
    const t = r.int(2, 9), c = r.int(10, 40), a = r.int(2, 6), v = r.int(0, 3);
    if (v === 0) return { q: T(`Find the number that must go in the box so that $x = ${t}$ is a solution of $x + \\square = ${c}$.`, `Cari nombor yang mesti diisi dalam petak supaya $x = ${t}$ ialah satu penyelesaian bagi $x + \\square = ${c}$.`), a: T(`$${c - t}$`), w: W(T(`Substitute $x = ${t}$: $${t} + \\square = ${c}$`, `Gantikan $x = ${t}$: $${t} + \\square = ${c}$`), T(`$\\square = ${c} - ${t} = ${c - t}$`)), sp: 'xs' };
    if (v === 1) return { q: T(`The equation $\\square x = ${a * t}$ has the solution $x = ${t}$. What number is in the box?`, `Persamaan $\\square x = ${a * t}$ mempunyai penyelesaian $x = ${t}$. Apakah nombor dalam petak itu?`), a: T(`$${a}$`), w: W(T(`Substitute $x = ${t}$: $\\square \\times ${t} = ${a * t}$`, `Gantikan $x = ${t}$: $\\square \\times ${t} = ${a * t}$`), T(`$\\square = ${a * t} \\div ${t} = ${a}$`)), sp: 'xs' };
    if (v === 2) return { q: T(`Given that $x = ${t}$ satisfies $${a}x - \\square = ${c}$, find the number in the box.`, `Diberi $x = ${t}$ memenuhi $${a}x - \\square = ${c}$, cari nombor dalam petak itu.`), a: T(`$${a * t - c}$`), w: W(T(`Substitute $x = ${t}$: $${a}(${t}) - \\square = ${c}$`, `Gantikan $x = ${t}$: $${a}(${t}) - \\square = ${c}$`), T(`$${a * t} - \\square = ${c}$, so $\\square = ${a * t} - ${c} = ${a * t - c}$`, `$${a * t} - \\square = ${c}$, maka $\\square = ${a * t} - ${c} = ${a * t - c}$`)), sp: 'xs' };
    return { q: T(`Write down any linear equation of the form $x + \\square = \\square$ whose solution is $x = ${t}$.`, `Tulis satu persamaan linear berbentuk $x + \\square = \\square$ yang penyelesaiannya ialah $x = ${t}$.`), a: T(`For example $x + ${c - t} = ${c}$ (any two numbers with difference ${t} on the right)`, `Contohnya $x + ${c - t} = ${c}$ (mana-mana dua nombor dengan beza ${t} di sebelah kanan)`), w: W(T(`Choose the right-hand number first, say $${c}$.`, `Pilih nombor di sebelah kanan dahulu, katakan $${c}$.`), T(`The box on the left must be $${c} - ${t} = ${c - t}$, giving $x + ${c - t} = ${c}$.`, `Petak di sebelah kiri mestilah $${c} - ${t} = ${c - t}$, memberi $x + ${c - t} = ${c}$.`), T(`Check: $${t} + ${c - t} = ${c}$`, `Semak: $${t} + ${c - t} = ${c}$`)), sp: 's' };
  };
  const eTerms = (r) => {
    const a = r.int(2, 9), b = r.int(1, 9), c = r.int(10, 40), v = r.pick(['x', 'y', 'p', 'm', 'n', 't']), neg = r.chance(0.3);
    const e = neg ? `${b} - ${a}${v} = ${c}` : `${a}${v} + ${b} = ${c}`;
    const asks = [
      [T(`the coefficient of $${v}$`, `pekali bagi $${v}$`), neg ? -a : a, T(`The term in $${v}$ is $${neg ? `-${a}${v}` : `${a}${v}`}$, so the number multiplying $${v}$ is $${neg ? -a : a}$.`, `Sebutan dalam $${v}$ ialah $${neg ? `-${a}${v}` : `${a}${v}`}$, maka nombor yang mendarab $${v}$ ialah $${neg ? -a : a}$.`)],
      [T(`the constant term on the left-hand side`, `sebutan pemalar di sebelah kiri`), b, T(`On the left, $${b}$ is the only term with no $${v}$ in it.`, `Di sebelah kiri, $${b}$ ialah satu-satunya sebutan tanpa $${v}$.`)],
      [T(`the unknown`, `anu (pemboleh ubah)`), v, T(`The letter whose value is not known is $${v}$.`, `Huruf yang nilainya tidak diketahui ialah $${v}$.`)],
      [T(`the expression on the right-hand side`, `ungkapan di sebelah kanan`), c, T(`The right-hand side is everything after the equals sign: $${c}$.`, `Sebelah kanan ialah semua yang selepas tanda sama dengan: $${c}$.`)],
    ];
    const [d, val, how] = r.pick(asks);
    return { q: T(`In the equation $${e}$, state ${d.en}.`, `Dalam persamaan $${e}$, nyatakan ${d.ms}.`), a: T(`$${val}$`), w: W(how), sp: 'xs' };
  };
  const eNumEq = (r) => {
    const v = r.int(0, 3), a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), d = r.int(2, 9);
    if (v === 0) return { q: T(`Fill in the box to keep the equality true: $${a} + \\square = ${b} \\times ${c}$.`, `Isikan petak supaya kesamaan itu benar: $${a} + \\square = ${b} \\times ${c}$.`), a: T(`$${b * c - a}$`), w: W(T(`Right-hand side: $${b} \\times ${c} = ${b * c}$`, `Sebelah kanan: $${b} \\times ${c} = ${b * c}$`), T(`$\\square = ${b * c} - ${a} = ${b * c - a}$`)), sp: 'xs' };
    if (v === 1) {
      const off = r.chance() ? 0 : r.pick([-2, -1, 1, 2]), rhs = a * b + c + off;
      return { q: T(`Is the statement $${a} \\times ${b} + ${c} = ${rhs}$ true or false?`, `Adakah pernyataan $${a} \\times ${b} + ${c} = ${rhs}$ benar atau palsu?`), a: off === 0 ? T('True', 'Benar') : T('False', 'Palsu'), w: W(T(`Multiply before adding: $${a} \\times ${b} + ${c} = ${a * b} + ${c} = ${a * b + c}$`, `Darab sebelum tambah: $${a} \\times ${b} + ${c} = ${a * b} + ${c} = ${a * b + c}$`), off === 0 ? T(`This is the same as the right-hand side, so the statement is true.`, `Ini sama dengan sebelah kanan, maka pernyataan itu benar.`) : T(`The right-hand side is $${rhs}$, not $${a * b + c}$, so the statement is false.`, `Sebelah kanan ialah $${rhs}$, bukan $${a * b + c}$, maka pernyataan itu palsu.`)), sp: 'xs' };
    }
    const s = a + b;
    if (v === 2) {
      const o = r.pick([
        [T('added to', 'ditambah kepada'), '+', s + d, T('Add', 'Tambah'), `${a} + ${b} + ${d}`],
        [T('subtracted from', 'ditolak daripada'), '-', s - d, T('Subtract', 'Tolak'), `${a} + ${b} - ${d}`],
        [T('multiplied on', 'didarab pada'), '\\times', s * d, T('Multiply by', 'Darab dengan'), `(${a} + ${b}) \\times ${d}`],
      ]);
      return { q: T(`$${a} + ${b} = ${s}$. Suppose ${d} is ${o[0].en} the left-hand side. What must be done to the right-hand side to keep the equality true?`, `$${a} + ${b} = ${s}$. Andaikan ${d} ${o[0].ms} sebelah kiri. Apakah yang mesti dilakukan pada sebelah kanan supaya kesamaan kekal benar?`), a: T(`${o[3].en} ${d} on the right-hand side too: $${o[4]} = ${s} ${o[1]} ${d}$`, `${o[3].ms} ${d} pada sebelah kanan juga: $${o[4]} = ${s} ${o[1]} ${d}$`), w: W(T('An equality stays true only if the same operation is done to both sides.', 'Kesamaan kekal benar hanya jika operasi yang sama dilakukan pada kedua-dua belah.'), T(`Left: $${o[4]} = ${o[2]}$; right: $${s} ${o[1]} ${d} = ${o[2]}$`, `Kiri: $${o[4]} = ${o[2]}$; kanan: $${s} ${o[1]} ${d} = ${o[2]}$`)), sp: 's' };
    }
    const k = r.int(2, 6);
    return { q: T(`$${a * k} = ${a * k}$. Both sides are divided by ${k}. Write the new equality.`, `$${a * k} = ${a * k}$. Kedua-dua belah dibahagi dengan ${k}. Tulis kesamaan baharu.`), a: T(`$${a} = ${a}$`), w: W(T(`$${a * k} \\div ${k} = ${a}$ on each side.`, `$${a * k} \\div ${k} = ${a}$ pada setiap belah.`), T('Dividing both sides by the same number keeps the equality true.', 'Membahagi kedua-dua belah dengan nombor yang sama mengekalkan kesamaan itu.')), sp: 'xs' };
  };

    /* statement bank: [value of the left side for x, EN, MS, equation] */
  const PH = [
    [(x, a) => x + a, (a, b, c) => `The sum of a number $x$ and ${a} is ${c}.`, (a, b, c) => `Hasil tambah suatu nombor $x$ dan ${a} ialah ${c}.`, (a, b, c) => `x + ${a} = ${c}`, (a, b, c) => T(`"The sum of $x$ and ${a}" is $x + ${a}$, and "is ${c}" gives $= ${c}$.`, `"Hasil tambah $x$ dan ${a}" ialah $x + ${a}$, dan "ialah ${c}" memberi $= ${c}$.`)],
    [(x, a) => x - a, (a, b, c) => `${a} less than a number $x$ is ${c}.`, (a, b, c) => `${a} kurang daripada suatu nombor $x$ ialah ${c}.`, (a, b, c) => `x - ${a} = ${c}`, (a, b, c) => T(`"${a} less than $x$" means ${a} is taken away from $x$: $x - ${a}$.`, `"${a} kurang daripada $x$" bermaksud ${a} ditolak daripada $x$: $x - ${a}$.`)],
    [(x, a) => a * x, (a, b, c) => `The product of ${a} and a number $x$ is ${c}.`, (a, b, c) => `Hasil darab ${a} dan suatu nombor $x$ ialah ${c}.`, (a, b, c) => `${a}x = ${c}`, (a, b, c) => T(`"The product of ${a} and $x$" means ${a} multiplied by $x$: $${a}x$.`, `"Hasil darab ${a} dan $x$" bermaksud ${a} didarab dengan $x$: $${a}x$.`)],
    [(x, a) => x / a, (a, b, c) => `A number $x$ divided by ${a} gives ${c}.`, (a, b, c) => `Suatu nombor $x$ dibahagi dengan ${a} memberikan ${c}.`, (a, b, c) => `\\dfrac{x}{${a}} = ${c}`, (a, b, c) => T(`"$x$ divided by ${a}" is written $\\dfrac{x}{${a}}$.`, `"$x$ dibahagi dengan ${a}" ditulis $\\dfrac{x}{${a}}$.`)],
    [(x, a, b) => a * x + b, (a, b, c) => `${a} times a number $x$, increased by ${b}, is ${c}.`, (a, b, c) => `${a} kali suatu nombor $x$, ditambah ${b}, ialah ${c}.`, (a, b, c) => `${a}x + ${b} = ${c}`, (a, b, c) => T(`"${a} times $x$" is $${a}x$; "increased by ${b}" adds ${b}: $${a}x + ${b}$.`, `"${a} kali $x$" ialah $${a}x$; "ditambah ${b}" menambah ${b}: $${a}x + ${b}$.`)],
    [(x, a, b) => a * x - b, (a, b, c) => `${b} is taken away from ${a} times a number $x$ and the result is ${c}.`, (a, b, c) => `${b} ditolak daripada ${a} kali suatu nombor $x$ dan hasilnya ialah ${c}.`, (a, b, c) => `${a}x - ${b} = ${c}`, (a, b, c) => T(`${b} is taken away from $${a}x$, so the left-hand side is $${a}x - ${b}$.`, `${b} ditolak daripada $${a}x$, maka sebelah kiri ialah $${a}x - ${b}$.`)],
    [(x, a, b) => x / a + b, (a, b, c) => `A number $x$ is divided by ${a} and then ${b} is added. The answer is ${c}.`, (a, b, c) => `Suatu nombor $x$ dibahagi dengan ${a} dan kemudian ${b} ditambah. Jawapannya ialah ${c}.`, (a, b, c) => `\\dfrac{x}{${a}} + ${b} = ${c}`, (a, b, c) => T(`Divide first, then add: $\\dfrac{x}{${a}} + ${b}$.`, `Bahagi dahulu, kemudian tambah: $\\dfrac{x}{${a}} + ${b}$.`)],
    [(x, a, b) => (x + b) / a, (a, b, c) => `The sum of a number $x$ and ${b}, divided by ${a}, gives ${c}.`, (a, b, c) => `Hasil tambah suatu nombor $x$ dan ${b}, dibahagi dengan ${a}, memberikan ${c}.`, (a, b, c) => `\\dfrac{x + ${b}}{${a}} = ${c}`, (a, b, c) => T(`The whole sum $x + ${b}$ is divided by ${a}, so it goes on top: $\\dfrac{x + ${b}}{${a}}$.`, `Keseluruhan hasil tambah $x + ${b}$ dibahagi dengan ${a}, maka ia berada di atas: $\\dfrac{x + ${b}}{${a}}$.`)],
    [(x, a, b) => a * (x + b), (a, b, c) => `${a} times the sum of a number $x$ and ${b} is ${c}.`, (a, b, c) => `${a} kali hasil tambah suatu nombor $x$ dan ${b} ialah ${c}.`, (a, b, c) => `${a}(x + ${b}) = ${c}`, (a, b, c) => T(`${a} multiplies the whole sum, so keep it in a bracket: $${a}(x + ${b})$.`, `${a} mendarab keseluruhan hasil tambah, maka kekalkannya dalam kurungan: $${a}(x + ${b})$.`)],
    [(x, a, b) => b - a * x, (a, b, c) => `${b} minus ${a} times a number $x$ is ${c}.`, (a, b, c) => `${b} tolak ${a} kali suatu nombor $x$ ialah ${c}.`, (a, b, c) => `${b} - ${a}x = ${c}`, (a, b, c) => T(`${a} times $x$ is taken away from ${b}, so the order is $${b} - ${a}x$.`, `${a} kali $x$ ditolak daripada ${b}, maka susunannya ialah $${b} - ${a}x$.`)],
    [(x, a, b) => a * (x - b), (a, b, c) => `${a} times the difference between a number $x$ and ${b} is ${c}.`, (a, b, c) => `${a} kali beza antara suatu nombor $x$ dengan ${b} ialah ${c}.`, (a, b, c) => `${a}(x - ${b}) = ${c}`, (a, b, c) => T(`The difference $x - ${b}$ is multiplied by ${a}: $${a}(x - ${b})$.`, `Beza $x - ${b}$ didarab dengan ${a}: $${a}(x - ${b})$.`)],
    [(x, a, b) => a * x + b * x, (a, b, c) => `${a} times a number $x$ added to ${b} times the same number is ${c}.`, (a, b, c) => `${a} kali suatu nombor $x$ ditambah ${b} kali nombor yang sama ialah ${c}.`, (a, b, c) => `${a}x + ${b}x = ${c}`, (a, b, c) => T(`Both terms use the same number $x$: $${a}x + ${b}x$ (which is $${a+b}x$).`, `Kedua-dua sebutan menggunakan nombor $x$ yang sama: $${a}x + ${b}x$ (iaitu $${a+b}x$).`)],
  ];
  /* solving steps for each statement of PH, in the same order (maths only, same in both languages) */
  const PHW = [
    (a, b, c, x) => [`x = ${redu(c, a)}`],
    (a, b, c, x) => [`x = ${c} + ${a} = ${c + a}`],
    (a, b, c, x) => [`x = \\dfrac{${c}}{${a}} = ${x}`],
    (a, b, c, x) => [`x = ${c} \\times ${a} = ${x}`],
    (a, b, c, x) => [`${a}x = ${redu(c, b)}`, `x = \\dfrac{${c - b}}{${a}} = ${x}`],
    (a, b, c, x) => [`${a}x = ${c} + ${b} = ${c + b}`, `x = \\dfrac{${c + b}}{${a}} = ${x}`],
    (a, b, c, x) => [`\\dfrac{x}{${a}} = ${redu(c, b)}`, `x = ${c - b} \\times ${a} = ${x}`],
    (a, b, c, x) => [`x + ${b} = ${c} \\times ${a} = ${c * a}`, `x = ${redu(c * a, b)}`],
    (a, b, c, x) => [`x + ${b} = \\dfrac{${c}}{${a}} = ${c / a}`, `x = ${redu(c / a, b)}`],
    (a, b, c, x) => [`${a}x = ${redu(b, c)}`, `x = \\dfrac{${b - c}}{${a}} = ${x}`],
    (a, b, c, x) => [`x - ${b} = \\dfrac{${c}}{${a}} = ${c / a}`, `x = ${c / a} + ${b} = ${x}`],
    (a, b, c, x) => [`${a + b}x = ${c}`, `x = \\dfrac{${c}}{${a + b}} = ${x}`],
  ];
  /** lines that solve a phr() statement: how it is translated, the equation, then the steps */
  const phW = (p) => [p.how, T(`Equation: $${p.tex}$`, `Persamaan: $${p.tex}$`), ...PHW[p.i](p.a, p.b, p.c, p.x).map((s) => T(`$${s}$`))];
  const phr = (r, from, to) => {
    const i = r.int(from, to), x = r.int(1, 12), a = r.int(2, 7), b = r.int(1, 9), c = PH[i][0](x, a, b);
    need(Number.isInteger(c) && c > 0);
    return { i, x, a, b, c, how: PH[i][4](a, b, c), st: T(PH[i][1](a, b, c), PH[i][2](a, b, c)), tex: PH[i][3](a, b, c), others: PH.map((p, j) => (j === i ? null : [p[3](a, b, c), T(p[1](a, b, c), p[2](a, b, c))])).filter(Boolean) };
  };
  const ePhrase = (r) => {
    const p = phr(r, 0, 5), v = r.int(0, 2);
    if (v === 0) return { q: T(`Write an equation for the statement: ${p.st.en}`, `Tulis satu persamaan bagi pernyataan: ${p.st.ms}`), a: T(`$${p.tex}$`), w: W(T('Let the unknown number be $x$.', 'Andaikan nombor yang tidak diketahui itu ialah $x$.'), p.how, T(`The equation is $${p.tex}$.`, `Persamaannya ialah $${p.tex}$.`)), sp: 's' };
    if (v === 1) {
      const o = opts(r, p.tex, p.others.map((z) => z[0]));
      return { q: T(`Which equation represents this statement? ${p.st.en}<br>${o.list}`, `Persamaan yang manakah mewakili pernyataan ini? ${p.st.ms}<br>${o.list}`), a: mcqA(o), w: W(p.how, T(`So the statement gives $${p.tex}$, which is option (${o.key}).`, `Maka pernyataan itu memberi $${p.tex}$, iaitu pilihan (${o.key}).`)), sp: 's' };
    }
    const o = optsT(r, p.st, p.others.map((z) => z[1]));
    return { q: T(`Which statement matches the equation $${p.tex}$?<br>${o.list.en}`, `Pernyataan yang manakah sepadan dengan persamaan $${p.tex}$?<br>${o.list.ms}`), a: T(`(${o.key}) ${p.st.en}`, `(${o.key}) ${p.st.ms}`), w: W(T(`Read the equation $${p.tex}$ in words.`, `Baca persamaan $${p.tex}$ dalam perkataan.`), p.how, T(`This matches option (${o.key}).`, `Ini sepadan dengan pilihan (${o.key}).`)), sp: 's' };
  };
  const eOp = (r) => {
    const a = r.int(2, 9), b = r.int(2, 15), c = r.int(10, 40), k = r.int(0, 3);
    const forms = [
      [`x + ${b} = ${c}`, T(`Subtract ${b} from both sides`, `Tolak ${b} daripada kedua-dua belah`), [T(`Add ${b} to both sides`, `Tambah ${b} kepada kedua-dua belah`), T(`Divide both sides by ${b}`, `Bahagi kedua-dua belah dengan ${b}`), T(`Multiply both sides by ${b}`, `Darab kedua-dua belah dengan ${b}`)], T(`${b} is added to $x$, so the inverse operation is to subtract ${b}.`, `${b} ditambah kepada $x$, maka operasi songsangnya ialah menolak ${b}.`), `x = ${c} - ${b} = ${c - b}`],
      [`x - ${b} = ${c}`, T(`Add ${b} to both sides`, `Tambah ${b} kepada kedua-dua belah`), [T(`Subtract ${b} from both sides`, `Tolak ${b} daripada kedua-dua belah`), T(`Divide both sides by ${b}`, `Bahagi kedua-dua belah dengan ${b}`), T(`Multiply both sides by ${b}`, `Darab kedua-dua belah dengan ${b}`)], T(`${b} is subtracted from $x$, so the inverse operation is to add ${b}.`, `${b} ditolak daripada $x$, maka operasi songsangnya ialah menambah ${b}.`), `x = ${c} + ${b} = ${c + b}`],
      [`${a}x = ${c}`, T(`Divide both sides by ${a}`, `Bahagi kedua-dua belah dengan ${a}`), [T(`Multiply both sides by ${a}`, `Darab kedua-dua belah dengan ${a}`), T(`Subtract ${a} from both sides`, `Tolak ${a} daripada kedua-dua belah`), T(`Add ${a} to both sides`, `Tambah ${a} kepada kedua-dua belah`)], T(`$x$ is multiplied by ${a}, so the inverse operation is to divide by ${a}.`, `$x$ didarab dengan ${a}, maka operasi songsangnya ialah membahagi dengan ${a}.`), `x = \\dfrac{${c}}{${a}}${c % a === 0 ? ` = ${c / a}` : ''}`],
      [`\\dfrac{x}{${a}} = ${c}`, T(`Multiply both sides by ${a}`, `Darab kedua-dua belah dengan ${a}`), [T(`Divide both sides by ${a}`, `Bahagi kedua-dua belah dengan ${a}`), T(`Subtract ${a} from both sides`, `Tolak ${a} daripada kedua-dua belah`), T(`Add ${a} to both sides`, `Tambah ${a} kepada kedua-dua belah`)], T(`$x$ is divided by ${a}, so the inverse operation is to multiply by ${a}.`, `$x$ dibahagi dengan ${a}, maka operasi songsangnya ialah mendarab dengan ${a}.`), `x = ${c} \\times ${a} = ${c * a}`],
    ];
    const f = forms[k], o = optsT(r, f[1], f[2]);
    return { q: T(`To find $x$ from $${f[0]}$, which operation should be done on both sides of the equation so that $x$ is alone?<br>${o.list.en}`, `Untuk mencari $x$ daripada $${f[0]}$, operasi yang manakah perlu dilakukan pada kedua-dua belah persamaan supaya $x$ berada seorang diri?<br>${o.list.ms}`), a: T(`(${o.key}) ${f[1].en}`, `(${o.key}) ${f[1].ms}`), w: W(f[3], T(`Doing it to both sides: $${f[4]}$`, `Melakukannya pada kedua-dua belah: $${f[4]}$`)), sp: 's' };
  };
  /** full working for a story problem: translate, write the equation, then solve it */
  const scLines = (s) => [T('Translate the situation into symbols, using $x$ for the unknown quantity.', 'Terjemahkan situasi itu kepada simbol, dengan $x$ mewakili kuantiti yang tidak diketahui.'), T(`Equation: $${s.e.tex}$`, `Persamaan: $${s.e.tex}$`), ...stepsW(s.e)];
  const scFull = (s, ...tail) => W(...scLines(s), ...tail);
  /** put a part label such as "(b) " in front of the first of a list of lines */
  const pfx = (lab, lines) => lines.map((l, i) => (i ? l : cat(T(lab, lab), l)));
  const scW = (s, tail) => W(T('Translate the situation into symbols, using $x$ for the unknown quantity.', 'Terjemahkan situasi itu kepada simbol, dengan $x$ mewakili kuantiti yang tidak diketahui.'), tail || T(`Equation: $${s.e.tex}$`, `Persamaan: $${s.e.tex}$`));
  const eSc = (r) => {
    const s = r.pick(SCe)(r);
    if (r.chance() || s.custom) return { q: T(`${s.st.en} Write an equation in $x$ for this situation.`, `${s.st.ms} Tulis satu persamaan dalam $x$ bagi situasi ini.`), a: T(`$${s.e.tex}$`), w: scW(s), sp: 's' };
    const l = s.e.l, rr = s.e.r, N = (f) => Fr.mul(f, Q(-1));
    const wr = [`${side([l[0], N(l[1])])} = ${side(rr)}`, `${side([l[1], l[0]])} = ${side(rr)}`, `${side(l)} = ${side([rr[0], N(rr[1])])}`, `${side(l)} = ${side([rr[0], Fr.add(rr[1], l[1])])}`];
    const o = opts(r, s.e.tex, wr);
    return { q: T(`${s.st.en} Which equation represents this situation?<br>${o.list}`, `${s.st.ms} Persamaan yang manakah mewakili situasi ini?<br>${o.list}`), a: mcqA(o), w: scW(s, T(`The situation gives $${s.e.tex}$, which is option (${o.key}).`, `Situasi itu memberi $${s.e.tex}$, iaitu pilihan (${o.key}).`)), sp: 's' };
  };
  const pairEq = (r) => {
    const x0 = r.int(-3, 5), y0 = r.int(-3, 5), a = r.nz(-4, 4), b = r.nz(-4, 4);
    return { x0, y0, a, b, c: a * x0 + b * y0, ok: (x, y, a2, b2, c2) => (a2 === undefined ? a : a2) * x + (b2 === undefined ? b : b2) * y === (c2 === undefined ? a * x0 + b * y0 : c2) };
  };
  const pt = (x, y) => `(${x}, ${y})`;
  const ePair = (r) => {
    const p = pairEq(r), v = r.int(0, 3), E = eq2(p.a, p.b, p.c);
    need(p.x0 !== p.y0);
    if (v === 0) {
      const g = r.chance(), tx_ = g ? [p.x0, p.y0] : r.pick([[p.y0, p.x0], [p.x0 + 1, p.y0], [p.x0, p.y0 - 1]]);
      const good = p.ok(tx_[0], tx_[1]);
      return { q: T(`Is $${pt(tx_[0], tx_[1])}$ a solution of $${E}$?`, `Adakah $${pt(tx_[0], tx_[1])}$ satu penyelesaian bagi $${E}$?`), a: yes(good), w: W(T(`Substitute $x = ${tx_[0]}$ and $y = ${tx_[1]}$: $${sub2(p.a, p.b, tx_[0], tx_[1])}$`, `Gantikan $x = ${tx_[0]}$ dan $y = ${tx_[1]}$: $${sub2(p.a, p.b, tx_[0], tx_[1])}$`), good ? T(`This equals ${p.c}, so the pair is a solution.`, `Ini bersamaan ${p.c}, maka pasangan itu ialah penyelesaian.`) : T(`This is not ${p.c}, so the pair is not a solution.`, `Ini bukan ${p.c}, maka pasangan itu bukan penyelesaian.`)), sp: 's' };
    }
    if (v === 1) {
      const o = opts(r, pt(p.x0, p.y0), [pt(p.y0, p.x0), pt(p.x0 + 1, p.y0), pt(p.x0, p.y0 + 1), pt(p.x0 - 1, p.y0 - 1)].filter((z) => { const m = z.match(/-?\d+/g).map(Number); return !p.ok(m[0], m[1]); }));
      return { q: T(`Which ordered pair $(x, y)$ satisfies $${E}$?<br>${o.list}`, `Pasangan tertib $(x, y)$ yang manakah memenuhi $${E}$?<br>${o.list}`), a: mcqA(o), w: W(T('Substitute each pair and compare with the right-hand side.', 'Gantikan setiap pasangan dan bandingkan dengan sebelah kanan.'), T(`$${sub2(p.a, p.b, p.x0, p.y0)}$, so (${o.key}) is the solution.`, `$${sub2(p.a, p.b, p.x0, p.y0)}$, maka (${o.key}) ialah penyelesaiannya.`)), sp: 's' };
    }
    if (v === 2) {
      return { q: T(`Given $${E}$, find the value of $y$ when $x = ${p.x0}$.`, `Diberi $${E}$, cari nilai $y$ apabila $x = ${p.x0}$.`), a: T(`$y = ${p.y0}$`), w: W(T(`Substitute $x = ${p.x0}$: $${cn(p.a)}${br(p.x0)} ${p.b < 0 ? '-' : '+'} ${cn(ab(p.b))}y = ${p.c}$`, `Gantikan $x = ${p.x0}$: $${cn(p.a)}${br(p.x0)} ${p.b < 0 ? '-' : '+'} ${cn(ab(p.b))}y = ${p.c}$`), T(`$${cn(p.b)}y = ${dif(p.c, p.a * p.x0)} = ${p.c - p.a * p.x0}$`), T(`$y = ${p.y0}$`)), sp: 's' };
    }
    const cand = [[p.a, p.b, p.c + r.pick([1, 2, -1])], [p.b, p.a, p.c], [p.a, -p.b, p.c], [-p.a, p.b, p.c]].filter((z) => z[0] * p.x0 + z[1] * p.y0 !== z[2]).map((z) => eq2(z[0], z[1], z[2]));
    const o = opts(r, E, cand);
    return { q: T(`Which equation has $(x, y) = ${pt(p.x0, p.y0)}$ as a solution?<br>${o.list}`, `Persamaan yang manakah mempunyai $(x, y) = ${pt(p.x0, p.y0)}$ sebagai satu penyelesaian?<br>${o.list}`), a: mcqA(o), w: W(T(`Put $x = ${p.x0}$ and $y = ${p.y0}$ into each equation.`, `Masukkan $x = ${p.x0}$ dan $y = ${p.y0}$ ke dalam setiap persamaan.`), T(`Only (${o.key}) works: $${sub2(p.a, p.b, p.x0, p.y0)}$`, `Hanya (${o.key}) berjaya: $${sub2(p.a, p.b, p.x0, p.y0)}$`)), sp: 's' };
  };
  const ge61 = [eLinear, eVerify, eMissing, eTerms, eNumEq, ePhrase, eOp, eSc, ePair];

    const SCa = [
    (r) => { const a = r.int(2, 6), b = r.int(1, 6), c = r.int(4, 14), x = 2 * c - a - b; need(x > 1 && x < 25); return SC(T(`A rectangle has length $(2x + ${a})$ cm and width $(x + ${b})$ cm. A square of side $(x + ${c})$ cm has the same perimeter as the rectangle.`, `Sebuah segi empat tepat mempunyai panjang $(2x + ${a})$ cm dan lebar $(x + ${b})$ cm. Sebuah segi empat sama bersisi $(x + ${c})$ cm mempunyai perimeter yang sama dengan segi empat tepat itu.`), [6, 2 * a + 2 * b], [4, 4 * c], x, `2[(2x + ${a}) + (x + ${b})] = 4(x + ${c})`); },
    (r) => { const nm = r.name(), k1 = r.pick([4, 5]), k2 = r.pick([2, 3]), y = r.int(3, 9); need(k1 > k2 && (y * (k2 - 1)) % (k1 - k2) === 0); const x = (y * (k2 - 1)) / (k1 - k2); need(x >= 5); return SC(T(`${nm} is $x$ years old and ${nm}'s mother is ${k1} times as old. In ${y} years' time, the mother will be ${k2} times as old as ${nm} will be.`, `${nm} berumur $x$ tahun dan ibu ${nm} berumur ${k1} kali ganda. ${y} tahun lagi, umur ibu akan menjadi ${k2} kali ganda umur ${nm} pada masa itu.`), [k1, y], [k2, k2 * y], x, `${k1}x + ${y} = ${k2}(x + ${y})`); },
    (r) => { const nm = r.names(3), a = r.int(5, 30), x = r.int(10, 60); return SC(T(`RM${5 * x + a} is shared among ${nm[0]}, ${nm[1]} and ${nm[2]}. ${nm[0]} gets RM$x$, ${nm[1]} gets twice as much as ${nm[0]} and ${nm[2]} gets RM${a} more than ${nm[1]}.`, `RM${5 * x + a} dikongsi antara ${nm[0]}, ${nm[1]} dan ${nm[2]}. ${nm[0]} mendapat RM$x$, ${nm[1]} mendapat dua kali ganda daripada ${nm[0]} dan ${nm[2]} mendapat RM${a} lebih daripada ${nm[1]}.`), [5, a], [0, 5 * x + a], x, `x + 2x + (2x + ${a}) = ${5 * x + a}`); },
    (r) => { const nm = r.name(), k = r.pick([3, 4, 5]), m = r.int(3, 12), b = r.int(2, 15), x = k * m, c = m * (k - 1) - b; need(c > 0); return SC(T(`${nm} had RM$x$. ${nm} spent $\\dfrac{1}{${k}}$ of the money on a book and RM${b} on food, and RM${c} was left.`, `${nm} mempunyai RM$x$. ${nm} membelanjakan $\\dfrac{1}{${k}}$ daripada wang itu untuk membeli sebuah buku dan RM${b} untuk makanan, dan RM${c} berbaki.`), [Q(k - 1, k), -b], [0, c], x, `x - \\dfrac{x}{${k}} - ${b} = ${c}`); },
    (r) => { const act = r.pick([[T('swimming sessions', 'sesi renang'), T('swimming pool', 'kolam renang')], [T('piano lessons', 'kelas piano'), T('music school', 'sekolah muzik')], [T('gym visits', 'lawatan ke gim'), T('fitness centre', 'pusat kecergasan')]]); const x = r.int(4, 12), r1 = r.int(2, 5), r2 = r1 + r.int(1, 4), f2 = r.int(5, 20), f1 = f2 + (r2 - r1) * x; return SC(T(`Plan A of a ${act[1].en} charges RM${f1} to join and RM${r1} per visit. Plan B charges RM${f2} to join and RM${r2} per visit. After $x$ ${act[0].en} the two plans cost the same.`, `Pelan A sebuah ${act[1].ms} mengenakan RM${f1} untuk menyertai dan RM${r1} bagi setiap lawatan. Pelan B mengenakan RM${f2} untuk menyertai dan RM${r2} bagi setiap lawatan. Selepas $x$ ${act[0].ms} kedua-dua pelan berkos sama.`), [r1, f1], [r2, f2], x, `${f1} + ${r1}x = ${f2} + ${r2}x`); },
    (r) => { const p = r.pick([[2, 3], [3, 4], [3, 5], [2, 5]]), m = r.int(2, 8), x = p[1] * m, d = m * (p[1] - p[0]); return SC(T(`$\\dfrac{${p[0]}}{${p[1]}}$ of a number $x$ is ${d} less than the number itself.`, `$\\dfrac{${p[0]}}{${p[1]}}$ daripada suatu nombor $x$ ialah ${d} kurang daripada nombor itu sendiri.`), [Q(p[0], p[1]), 0], [1, -d], x, `\\dfrac{${p[0]}}{${p[1]}}x = x - ${d}`); },
  ];
  /* more stories */
  SCe.push(
    (r) => { const nm = r.name(), L = r.int(8, 20), c = r.int(2, L - 3); return SC(T(`${nm} cuts $x$ metres of cloth from a roll that is ${L} m long. ${c} m of cloth is left on the roll.`, `${nm} memotong $x$ meter kain daripada segulung kain yang panjangnya ${L} m. ${c} m kain berbaki pada gulungan itu.`), [-1, L], [0, c], L - c, `${L} - x = ${c}`); },
    (r) => { const nm = r.name(), a = r.int(20, 80), x = r.int(10, 60); return SC(T(`A water tank holds ${a} litres. ${nm} pours in $x$ more litres and the tank now holds ${a + x} litres.`, `Sebuah tangki air mengandungi ${a} liter. ${nm} menuang $x$ liter lagi dan tangki itu kini mengandungi ${a + x} liter.`), [1, a], [0, a + x], x); },
    (r) => { const nm = r.name(), k = r.int(12, 30), x = r.int(4, 12); return SC(T(`${nm} reads ${k} pages of a novel every day for $x$ days and finishes a book of ${k * x} pages.`, `${nm} membaca ${k} halaman novel setiap hari selama $x$ hari dan menghabiskan sebuah buku setebal ${k * x} halaman.`), [k, 0], [0, k * x], x); },
    (r) => { const nm = r.name(), p = r.int(2, 5), ch = r.int(1, 8), x = r.int(3, 9); return SC(T(`${nm} buys $x$ curry puffs at RM${p} each, pays RM${p * x + ch} and receives RM${ch} change.`, `${nm} membeli $x$ biji karipap pada harga RM${p} sebiji, membayar RM${p * x + ch} dan menerima baki RM${ch}.`), [p, ch], [0, p * x + ch], x); },
  );
  SCm.push(
    (r) => { const p = r.int(2, 4), q = r.int(2, 3), d = r.int(2, 5), x = r.int(8, 20), tot = p * x + q * (x - d); return SC(T(`An adult ticket costs RM$x$ and a child ticket costs RM${d} less. A family buys ${p} adult tickets and ${q} child tickets for RM${tot}.`, `Harga tiket dewasa ialah RM$x$ dan tiket kanak-kanak lebih murah RM${d}. Sebuah keluarga membeli ${p} tiket dewasa dan ${q} tiket kanak-kanak dengan harga RM${tot}.`), [p + q, -q * d], [0, tot], x, `${p}x + ${q}(x - ${d}) = ${tot}`); },
    (r) => { const a = r.int(3, 9), b = r.int(2, 8), x = r.int(10, 40); return SC(T(`A rope is cut into three pieces of length $x$ cm, $(x + ${a})$ cm and $(2x - ${b})$ cm. The rope was ${4 * x + a - b} cm long.`, `Seutas tali dipotong kepada tiga bahagian yang panjangnya $x$ cm, $(x + ${a})$ cm dan $(2x - ${b})$ cm. Panjang tali itu ialah ${4 * x + a - b} cm.`), [4, a - b], [0, 4 * x + a - b], x, `x + (x + ${a}) + (2x - ${b}) = ${4 * x + a - b}`); },
    (r) => { const d = r.int(10, 30), h = r.int(2, 4), x = r.int(40, 80); return SC(T(`Two buses leave a terminal at the same time and travel in opposite directions. One travels at $x$ km/h and the other at $(x + ${d})$ km/h. After ${h} hours they are ${h * (2 * x + d)} km apart.`, `Dua buah bas bertolak dari sebuah terminal pada masa yang sama dan bergerak dalam arah bertentangan. Sebuah bas bergerak pada $x$ km/j dan sebuah lagi pada $(x + ${d})$ km/j. Selepas ${h} jam, jarak antara kedua-dua bas ialah ${h * (2 * x + d)} km.`), [2 * h, h * d], [0, h * (2 * x + d)], x, `${h}x + ${h}(x + ${d}) = ${h * (2 * x + d)}`); },
    (r) => { const b = r.int(1, 9), x = r.int(20, 60), tot = 5 * x + 10 + b - b; return SC(T(`The angles of a quadrilateral are $x^\\circ$, $(x + 20)^\\circ$, $(2x)^\\circ$ and $(x - 10)^\\circ$.`, `Sudut-sudut sebuah sisi empat ialah $x^\\circ$, $(x + 20)^\\circ$, $(2x)^\\circ$ dan $(x - 10)^\\circ$.`), [5, 10], [0, 360], 70, `x + (x + 20) + 2x + (x - 10) = 360`); },
  );
  SCa.push(
    (r) => { const a = r.int(2, 8), x = 5 * a; const nm = r.pair(); return SC(T(`${nm[0]} earns RM$x$ per hour and ${nm[1]} earns RM${a} more per hour. ${nm[0]} works 6 hours and ${nm[1]} works 5 hours, and they earn the same total.`, `${nm[0]} memperoleh RM$x$ sejam dan ${nm[1]} memperoleh RM${a} lebih sejam. ${nm[0]} bekerja selama 6 jam dan ${nm[1]} bekerja selama 5 jam, dan jumlah pendapatan mereka sama.`), [6, 0], [5, 5 * a], x, `6x = 5(x + ${a})`); },
    (r) => { const a = r.int(2, 8), x = r.int(5, 20), P = 8 * x - 2 * a; return SC(T(`A rectangle has width $x$ cm and length $(3x - ${a})$ cm. Its perimeter is ${P} cm.`, `Sebuah segi empat tepat mempunyai lebar $x$ cm dan panjang $(3x - ${a})$ cm. Perimeternya ialah ${P} cm.`), [8, -2 * a], [0, P], x, `2[x + (3x - ${a})] = ${P}`); },
    (r) => { const nm = r.name(), k1 = r.pick([2, 3]), k2 = r.pick([4, 5, 6]), y = r.int(4, 12); need((y * (k2 - 1)) % (k2 - k1) === 0); const x = (y * (k2 - 1)) / (k2 - k1); need(x >= 8 && x <= 25); return SC(T(`${nm}'s father is ${k1} times as old as ${nm}. ${y} years ago, ${nm}'s father was ${k2} times as old as ${nm}. Let ${nm}'s age now be $x$ years.`, `Ayah ${nm} berumur ${k1} kali ganda umur ${nm}. ${y} tahun yang lalu, umur ayah ${nm} ialah ${k2} kali ganda umur ${nm}. Andaikan umur ${nm} sekarang ialah $x$ tahun.`), [k1, -y], [k2, -k2 * y], x, `${k1}x - ${y} = ${k2}(x - ${y})`); },
  );
  const tabRow = (xs, vals) => vals;
  const asLhsRhs = (e, v) => { const [l, rr] = ev(e, v); return [tx(l), tx(rr)]; };
  const mSc = (r) => {
    const s = r.pick(SCe.concat(SCm))(r), e = s.e, x = e.x.n, v = r.int(0, 3);
    if (v === 0) return { q: T(`${s.st.en} Form an equation in $x$.`, `${s.st.ms} Bentukkan satu persamaan dalam $x$.`), a: T(`$${e.tex}$`), w: scW(s), sp: 's' };
    if (v === 1) {
      need(!s.custom);
      const l = e.l, rr = e.r, N = (f) => Fr.mul(f, Q(-1));
      const wr = [`${side([l[0], N(l[1])])} = ${side(rr)}`, `${side([l[1], l[0]])} = ${side(rr)}`, `${side(l)} = ${side([rr[0], N(rr[1])])}`, `${side(l)} = ${side([rr[0], Fr.add(rr[1], l[1])])}`, `${side([Fr.add(l[0], Q(1)), l[1]])} = ${side(rr)}`];
      const o = opts(r, e.tex, wr);
      return { q: T(`${s.st.en} Choose the equation that represents the situation.<br>${o.list}`, `${s.st.ms} Pilih persamaan yang mewakili situasi itu.<br>${o.list}`), a: mcqA(o), w: scW(s, T(`The situation gives $${e.tex}$, which is option (${o.key}).`, `Situasi itu memberi $${e.tex}$, iaitu pilihan (${o.key}).`)), sp: 's' };
    }
    const [lv, rv] = asLhsRhs(e, x);
    if (v === 2) return { q: T(`${s.st.en} (a) Form an equation in $x$. (b) Show, by substitution, that $x = ${x}$ satisfies your equation.`, `${s.st.ms} (a) Bentukkan satu persamaan dalam $x$. (b) Tunjukkan, dengan penggantian, bahawa $x = ${x}$ memenuhi persamaan anda.`), a: T(`(a) $${e.tex}$ (b) LHS $= ${lv}$ = RHS $= ${rv}$`, `(a) $${e.tex}$ (b) LHS $= ${lv}$ = RHS $= ${rv}$`), w: W(T(`(a) Equation: $${e.tex}$`, `(a) Persamaan: $${e.tex}$`), cat(T('(b) ', '(b) '), subW(e, e.x)), eqLine(true)), sp: 'm' };
    const t = x + r.pick([-2, -1, 1, 2]), [l2, r2] = asLhsRhs(e, t);
    return { q: T(`${s.st.en} Form an equation in $x$ and use substitution to decide whether $x = ${t}$ is a solution.`, `${s.st.ms} Bentukkan satu persamaan dalam $x$ dan gunakan penggantian untuk menentukan sama ada $x = ${t}$ ialah satu penyelesaian.`), a: T(`$${e.tex}$; LHS $= ${l2}$, RHS $= ${r2}$, so no`, `$${e.tex}$; LHS $= ${l2}$, RHS $= ${r2}$, jadi bukan`), w: W(T(`Equation: $${e.tex}$`, `Persamaan: $${e.tex}$`), subW(e, t), eqLine(false), T(`(The value that works is $x = ${x}$.)`, `(Nilai yang menepati ialah $x = ${x}$.)`)), sp: 'm' };
  };
  const mPhr = (r) => {
    const p = phr(r, 4, 11), v = r.int(0, 2);
    if (v === 0) return { q: T(`Write an equation for the statement: ${p.st.en}`, `Tulis satu persamaan bagi pernyataan: ${p.st.ms}`), a: T(`$${p.tex}$`), w: W(T('Let the unknown number be $x$.', 'Andaikan nombor yang tidak diketahui itu ialah $x$.'), p.how, T(`The equation is $${p.tex}$.`, `Persamaannya ialah $${p.tex}$.`)), sp: 's' };
    if (v === 1) {
      const o = opts(r, p.tex, p.others.map((z) => z[0]));
      return { q: T(`Which equation represents this statement? ${p.st.en}<br>${o.list}`, `Persamaan yang manakah mewakili pernyataan ini? ${p.st.ms}<br>${o.list}`), a: mcqA(o), w: W(p.how, T(`So the statement gives $${p.tex}$, which is option (${o.key}).`, `Maka pernyataan itu memberi $${p.tex}$, iaitu pilihan (${o.key}).`)), sp: 's' };
    }
    return { q: T(`${p.st.en} Write an equation and check that the number is $${p.x}$.`, `${p.st.ms} Tulis satu persamaan dan semak bahawa nombor itu ialah $${p.x}$.`), a: T(`$${p.tex}$; substituting $x = ${p.x}$ gives ${p.c} on both sides`, `$${p.tex}$; penggantian $x = ${p.x}$ memberi ${p.c} pada kedua-dua belah`), w: W(p.how, T(`Equation: $${p.tex}$`, `Persamaan: $${p.tex}$`), T(`Substitute $x = ${p.x}$: the left-hand side is $${p.c}$, the same as the right-hand side.`, `Gantikan $x = ${p.x}$: sebelah kiri ialah $${p.c}$, sama dengan sebelah kanan.`)), sp: 's' };
  };
  const mWrong = (r) => {
    const p = phr(r, 1, 11), w = r.pick(p.others), nm = r.name();
    return { q: T(`For the statement "${p.st.en}", ${nm} wrote $${w[0]}$. Is this correct? If not, write the correct equation.`, `Bagi pernyataan "${p.st.ms}", ${nm} menulis $${w[0]}$. Adakah ini betul? Jika tidak, tulis persamaan yang betul.`), a: T(`No. The correct equation is $${p.tex}$`, `Tidak. Persamaan yang betul ialah $${p.tex}$`), w: W(p.how, T(`So the statement gives $${p.tex}$.`, `Maka pernyataan itu memberi $${p.tex}$.`), cat(T(`$${w[0]}$ would say: `, `$${w[0]}$ bermaksud: `), w[1])), sp: 's' };
  };
  const mTable = (r) => {
    const e = eqn(r, r.pick(['two', 'brk', 'both', 'brkc', 'neg']), {}), x = e.x.n;
    const xs = [x - 2, x - 1, x, x + 1, x + 2], rows = xs.map((v) => asLhsRhs(e, v));
    const tab = SPM.table([['$x$'].concat(xs.map((v) => `$${v}$`)), [T('LHS', 'LHS').en].concat(xs.map(() => '')), ['RHS'].concat(xs.map(() => ''))], { rowHead: true });
    return { q: T(`Complete the table for the equation $${e.tex}$. Which value of $x$ in the table is the solution?<br>${tab}`, `Lengkapkan jadual bagi persamaan $${e.tex}$. Nilai $x$ yang manakah dalam jadual itu ialah penyelesaian?<br>${tab}`), a: T(`LHS: ${rows.map((z) => '$' + z[0] + '$').join(', ')}; RHS: ${rows.map((z) => '$' + z[1] + '$').join(', ')}; solution $x = ${x}$`, `LHS: ${rows.map((z) => '$' + z[0] + '$').join(', ')}; RHS: ${rows.map((z) => '$' + z[1] + '$').join(', ')}; penyelesaian $x = ${x}$`), w: W(T('Work out each side separately for every value of $x$ in the table.', 'Hitung setiap belah secara berasingan bagi setiap nilai $x$ dalam jadual.'), subW(e, x), T(`The two sides are equal only at $x = ${x}$, so that is the solution.`, `Kedua-dua belah sama hanya pada $x = ${x}$, maka itulah penyelesaiannya.`)), sp: 'm' };
  };
  const mFindK = (r) => {
    const t = r.nz(-4, 6), a = r.int(2, 5), b = r.int(1, 9), k = r.int(2, 7), v = r.int(0, 3);
    if (v === 0) { const c = k * t + b; return { q: T(`Given that $x = ${t}$ is a solution of $kx ${sg(b)} ${b} = ${c}$, find the value of $k$.`, `Diberi $x = ${t}$ ialah satu penyelesaian bagi $kx ${sg(b)} ${b} = ${c}$, cari nilai $k$.`), a: T(`$k = ${k}$`), w: W(T(`Substitute $x = ${t}$: $k${br(t)} ${sg(b)} ${b} = ${c}$`, `Gantikan $x = ${t}$: $k${br(t)} ${sg(b)} ${b} = ${c}$`), T(`$${cn(t)}k = ${dif(c, b)} = ${k * t}$`), T(ab(t) === 1 ? `$k = ${k}$` : `$k = ${k * t} \\div ${t} = ${k}$`)), sp: 's' }; }
    if (v === 1) { const c = t + k; return { q: T(`$x = ${t}$ is a solution of $x + k = ${c}$. Find $k$.`, `$x = ${t}$ ialah satu penyelesaian bagi $x + k = ${c}$. Cari $k$.`), a: T(`$k = ${k}$`), w: W(T(`Substitute $x = ${t}$: $${t} + k = ${c}$`, `Gantikan $x = ${t}$: $${t} + k = ${c}$`), T(`$k = ${dif(c, t)} = ${k}$`)), sp: 'xs' }; }
    if (v === 2) { const c = a * (t + k); return { q: T(`The equation $${a}(x + k) = ${c}$ has the solution $x = ${t}$. Find the value of $k$.`, `Persamaan $${a}(x + k) = ${c}$ mempunyai penyelesaian $x = ${t}$. Cari nilai $k$.`), a: T(`$k = ${k}$`), w: W(T(`Substitute $x = ${t}$: $${a}(${t} + k) = ${c}$`, `Gantikan $x = ${t}$: $${a}(${t} + k) = ${c}$`), T(`Divide both sides by ${a}: $${t} + k = ${t + k}$`, `Bahagi kedua-dua belah dengan ${a}: $${t} + k = ${t + k}$`), T(`$k = ${dif(t + k, t)} = ${k}$`)), sp: 's' }; }
    const c = a * t - k * t;
    need(c !== 0);
    return { q: T(`If $x = ${t}$ satisfies $${a}x = kx ${sg(c)} ${ab(c)}$, find $k$.`, `Jika $x = ${t}$ memenuhi $${a}x = kx ${sg(c)} ${ab(c)}$, cari $k$.`), a: T(`$k = ${k}$`), w: W(T(`Substitute $x = ${t}$: $${a}${br(t)} = k${br(t)} ${sg(c)} ${ab(c)}$`, `Gantikan $x = ${t}$: $${a}${br(t)} = k${br(t)} ${sg(c)} ${ab(c)}$`), T(`$${cn(t)}k = ${dif(a * t, c)} = ${k * t}$`), T(ab(t) === 1 ? `$k = ${k}$` : `$k = ${k * t} \\div ${t} = ${k}$`)), sp: 's' };
  };
  const mBad = (r) => {
    const t = r.int(2, 8), a = r.int(2, 6), b = r.int(2, 9), c = a * t + b, nm = r.name();
    const wrong = a * (t + b);
    return { q: T(`${nm} tests $x = ${t}$ in $${a}x + ${b} = ${c}$ and writes: "$${a}(${t}) + ${b} = ${a}(${t + b}) = ${wrong}$, so $x = ${t}$ is not a solution." Find the mistake and state the correct conclusion.`, `${nm} menguji $x = ${t}$ dalam $${a}x + ${b} = ${c}$ dan menulis: "$${a}(${t}) + ${b} = ${a}(${t + b}) = ${wrong}$, maka $x = ${t}$ bukan penyelesaian." Cari kesilapan itu dan nyatakan kesimpulan yang betul.`), a: T(`${b} was added before multiplying. Correct: $${a}(${t}) + ${b} = ${a * t} + ${b} = ${c}$, so $x = ${t}$ is a solution.`, `${b} ditambah sebelum darab. Betul: $${a}(${t}) + ${b} = ${a * t} + ${b} = ${c}$, maka $x = ${t}$ ialah satu penyelesaian.`), w: W(T(`Multiplication comes before addition, so work out $${a}(${t})$ first.`, `Darab didahulukan sebelum tambah, maka hitung $${a}(${t})$ dahulu.`), T(`LHS $= ${a}(${t}) + ${b} = ${a * t} + ${b} = ${c}$`), T(`RHS $= ${c}$, so the two sides are equal and $x = ${t}$ is a solution.`, `RHS $= ${c}$, maka kedua-dua belah sama dan $x = ${t}$ ialah satu penyelesaian.`)), sp: 's' };
  };
  const mPair = (r) => {
    const p = pairEq(r), q2 = pairEq(r), v = r.int(0, 2);
    if (v === 0) {
      const c2 = q2.a * p.x0 + q2.b * p.y0, good = r.chance(), c2b = good ? c2 : c2 + r.pick([1, -1, 2]);
      need(q2.a !== p.a || q2.b !== p.b);
      return { q: T(`Show whether $(x, y) = ${pt(p.x0, p.y0)}$ is a solution of both $${eq2(p.a, p.b, p.c)}$ and $${eq2(q2.a, q2.b, c2b)}$.`, `Tunjukkan sama ada $(x, y) = ${pt(p.x0, p.y0)}$ ialah penyelesaian bagi kedua-dua $${eq2(p.a, p.b, p.c)}$ dan $${eq2(q2.a, q2.b, c2b)}$.`), a: good ? T('Yes: it satisfies both equations', 'Ya: ia memenuhi kedua-dua persamaan') : T(`No: it satisfies the first equation but the second gives ${c2}, not ${c2b}`, `Tidak: ia memenuhi persamaan pertama tetapi yang kedua memberi ${c2}, bukan ${c2b}`), w: W(T(`First equation: $${sub2(p.a, p.b, p.x0, p.y0)}$, which is the required ${p.c}.`, `Persamaan pertama: $${sub2(p.a, p.b, p.x0, p.y0)}$, iaitu ${p.c} yang dikehendaki.`), T(`Second equation: $${sub2(q2.a, q2.b, p.x0, p.y0)}$, and the equation needs ${c2b}.`, `Persamaan kedua: $${sub2(q2.a, q2.b, p.x0, p.y0)}$, dan persamaan itu memerlukan ${c2b}.`), good ? T('Both are satisfied, so the pair is a solution of both equations.', 'Kedua-duanya dipenuhi, maka pasangan itu ialah penyelesaian bagi kedua-dua persamaan.') : T('The second is not satisfied, so the pair is not a solution of both.', 'Persamaan kedua tidak dipenuhi, maka pasangan itu bukan penyelesaian bagi kedua-duanya.')), sp: 'm' };
    }
    if (v === 1) return { q: T(`Complete the ordered pairs so that each satisfies $${eq2(p.a, p.b, p.c)}$: $(${p.x0}, \\ \\square)$ and $(\\square, \\ ${p.y0})$.`, `Lengkapkan pasangan tertib supaya setiap satu memenuhi $${eq2(p.a, p.b, p.c)}$: $(${p.x0}, \\ \\square)$ dan $(\\square, \\ ${p.y0})$.`), a: T(`$(${p.x0}, ${p.y0})$ and $(${p.x0}, ${p.y0})$`, `$(${p.x0}, ${p.y0})$ dan $(${p.x0}, ${p.y0})$`), w: W(T(`Put $x = ${p.x0}$ in: $${cn(p.b)}y = ${dif(p.c, p.a * p.x0)} = ${p.c - p.a * p.x0}$, so $y = ${p.y0}$.`, `Masukkan $x = ${p.x0}$: $${cn(p.b)}y = ${dif(p.c, p.a * p.x0)} = ${p.c - p.a * p.x0}$, maka $y = ${p.y0}$.`), T(`Put $y = ${p.y0}$ in: $${cn(p.a)}x = ${dif(p.c, p.b * p.y0)} = ${p.c - p.b * p.y0}$, so $x = ${p.x0}$.`, `Masukkan $y = ${p.y0}$: $${cn(p.a)}x = ${dif(p.c, p.b * p.y0)} = ${p.c - p.b * p.y0}$, maka $x = ${p.x0}$.`)), sp: 's' };
    const k = r.int(-3, 5), y1 = r.int(-3, 5);
    return { q: T(`The ordered pair $(${k}, ${y1})$ is a solution of $${poly([[p.a, 'x'], [p.b, 'y']])} = c$. Find the constant $c$.`, `Pasangan tertib $(${k}, ${y1})$ ialah satu penyelesaian bagi $${poly([[p.a, 'x'], [p.b, 'y']])} = c$. Cari pemalar $c$.`), a: T(`$c = ${p.a * k + p.b * y1}$`), w: W(T(`Substitute $x = ${k}$ and $y = ${y1}$: $${sub2(p.a, p.b, k, y1)}$`, `Gantikan $x = ${k}$ dan $y = ${y1}$: $${sub2(p.a, p.b, k, y1)}$`), T(`$c = ${p.a * k + p.b * y1}$`)), sp: 's' };
  };
  const mMatch = (r) => {
    const ks = r.sample(EASYK.concat(['brk', 'both']), 3), es = ks.map((k) => eqn(r, k, { pos: true }));
    need(new Set(es.map((e) => e.x.n)).size === 3);
    const sh = r.shuffle([0, 1, 2]);
    return { q: withQ(T('Match each equation to its solution.', 'Padankan setiap persamaan dengan penyelesaiannya.'), T(`${es.map((e, i) => `(${i + 1}) $${e.tex}$`).join('&emsp;')}<br>${sh.map((j, i) => `(${ABC[i]}) $x = ${es[j].x.n}$`).join('&emsp;')}`, `${es.map((e, i) => `(${i + 1}) $${e.tex}$`).join('&emsp;')}<br>${sh.map((j, i) => `(${ABC[i]}) $x = ${es[j].x.n}$`).join('&emsp;')}`)), a: T(es.map((e, i) => `${i + 1} - ${ABC[sh.indexOf(i)]}`).join(', ')), w: W(T('Solve each equation and match it with its value of $x$.', 'Selesaikan setiap persamaan dan padankan dengan nilai $x$ masing-masing.'), ...es.map((e, i) => T(`(${i + 1}) $${e.tex}$ gives $x = ${e.x.n}$, so (${i + 1}) matches (${ABC[sh.indexOf(i)]}).`, `(${i + 1}) $${e.tex}$ memberi $x = ${e.x.n}$, maka (${i + 1}) sepadan dengan (${ABC[sh.indexOf(i)]}).`))), sp: 's' };
  };
  const gm61 = [mSc, mPhr, mWrong, mTable, mFindK, mBad, mPair, mMatch];

    const wrongEqs = (s) => { const l = s.e.l, rr = s.e.r, N = (f) => Fr.mul(f, Q(-1)); return [`${side([l[0], N(l[1])])} = ${side(rr)}`, `${side([l[1], l[0]])} = ${side(rr)}`, `${side(l)} = ${side([rr[0], N(rr[1])])}`, `${side(l)} = ${side([rr[0], Fr.add(rr[1], l[1])])}`]; };
  const aSc = (r) => {
    const s = r.pick(SCm.concat(SCa))(r), e = s.e, x = e.x.n, v = r.int(0, 5);
    const [lv, rv] = asLhsRhs(e, x);
    if (v === 0) return { q: T(`${s.st.en} Form an equation in $x$.`, `${s.st.ms} Bentukkan satu persamaan dalam $x$.`), a: T(`$${e.tex}$`), w: scW(s), sp: 's' };
    if (v === 1) {
      const t = x + r.pick([-3, -2, -1, 1, 2, 3]), [l2, r2] = asLhsRhs(e, t);
      return { q: T(`${s.st.en} (a) Write an equation in $x$. (b) Is $x = ${x}$ a solution? (c) Is $x = ${t}$ a solution? Show your working.`, `${s.st.ms} (a) Tulis satu persamaan dalam $x$. (b) Adakah $x = ${x}$ satu penyelesaian? (c) Adakah $x = ${t}$ satu penyelesaian? Tunjukkan langkah kerja anda.`), a: T(`(a) $${e.tex}$ (b) Yes: both sides equal $${lv}$ (c) No: LHS $= ${l2}$, RHS $= ${r2}$`, `(a) $${e.tex}$ (b) Ya: kedua-dua belah bersamaan $${lv}$ (c) Tidak: LHS $= ${l2}$, RHS $= ${r2}$`), w: W(T(`(a) $${e.tex}$`), cat(T('(b) ', '(b) '), subW(e, e.x)), eqLine(true), cat(T('(c) ', '(c) '), subW(e, t)), eqLine(false)), sp: 'l' };
    }
    if (v === 2) {
      need(!s.custom);
      const w = r.pick(wrongEqs(s)), nm = r.name();
      need(w !== e.tex);
      return { q: T(`${s.st.en} ${nm} writes the equation $${w}$. Is ${nm}'s equation correct? If not, give the correct equation.`, `${s.st.ms} ${nm} menulis persamaan $${w}$. Adakah persamaan ${nm} betul? Jika tidak, berikan persamaan yang betul.`), a: T(`No. The correct equation is $${e.tex}$`, `Tidak. Persamaan yang betul ialah $${e.tex}$`), w: scW(s, T(`The situation gives $${e.tex}$, and $${w}$ is not the same equation.`, `Situasi itu memberi $${e.tex}$, dan $${w}$ bukan persamaan yang sama.`)), sp: 's' };
    }
    if (v === 4) {
      const t1 = x + r.pick([-2, -1, 1, 2]), c = [t1, x].sort((p, q) => p - q), [l1, r1] = asLhsRhs(e, t1);
      return { q: T(`${s.st.en} (a) Form an equation in $x$. (b) By substituting $x = ${c[0]}$ and $x = ${c[1]}$ in turn, decide which one is the solution.`, `${s.st.ms} (a) Bentukkan satu persamaan dalam $x$. (b) Dengan menggantikan $x = ${c[0]}$ dan $x = ${c[1]}$ secara bergilir, tentukan yang mana ialah penyelesaian.`), a: T(`(a) $${e.tex}$ (b) $x = ${x}$ (at $x = ${t1}$ the sides are $${l1}$ and $${r1}$)`, `(a) $${e.tex}$ (b) $x = ${x}$ (pada $x = ${t1}$ kedua-dua belah ialah $${l1}$ dan $${r1}$)`), w: W(T(`(a) $${e.tex}$`), subW(e, t1), eqLine(false), subW(e, e.x), T(`So the solution is $x = ${x}$.`, `Maka penyelesaiannya ialah $x = ${x}$.`)), sp: 'm' };
    }
    if (v === 5) return { q: T(`${s.st.en} Write an equation in $x$, then substitute $x = ${x}$ and state the value of each side.`, `${s.st.ms} Tulis satu persamaan dalam $x$, kemudian gantikan $x = ${x}$ dan nyatakan nilai setiap belah.`), a: T(`$${e.tex}$; LHS $= ${lv}$, RHS $= ${rv}$`, `$${e.tex}$; LHS $= ${lv}$, RHS $= ${rv}$`), w: W(T(`Equation: $${e.tex}$`, `Persamaan: $${e.tex}$`), subW(e, e.x), eqLine(true)), sp: 'm' };
    return { q: T(`${s.st.en} Write an equation in $x$ and state the value of $x$ that makes both sides equal.`, `${s.st.ms} Tulis satu persamaan dalam $x$ dan nyatakan nilai $x$ yang menjadikan kedua-dua belah sama.`), a: T(`$${e.tex}$; $x = ${x}$`), w: W(T(`Equation: $${e.tex}$`, `Persamaan: $${e.tex}$`), ...stepsW(e)), sp: 's' };
  };
  const aFrac = (r) => {
    const e = eqn(r, r.pick(['two', 'both', 'neg']), { frac: true }), x = e.x;
    const good = r.chance(), t = good ? x : Fr.add(x, Q(1, x.d));
    const [l, rr] = ev(e, t), ok = Fr.eq(l, rr);
    return { q: T(`Is $x = ${tx(t)}$ a solution of $${e.tex}$? Show your working.`, `Adakah $x = ${tx(t)}$ satu penyelesaian bagi $${e.tex}$? Tunjukkan langkah kerja anda.`), a: yes(ok), w: W(subW(e, t), eqLine(ok), ...(ok ? [] : [T(`(The solution is $x = ${tx(x)}$.)`, `(Penyelesaiannya ialah $x = ${tx(x)}$.)`)])), sp: 'm' };
  };
  const aNeg = (r) => {
    const e = eqn(r, r.pick(['both', 'two', 'neg', 'brk', 'brkb']), {}), x = e.x.n;
    need(x < 0);
    const ts = r.shuffle([x, -x, x + 1, x - 1]).slice(0, 3);
    need(ts.includes(x) || true);
    const c = [x, -x, x + 1].sort((p, q) => p - q);
    return { q: T(`Which of the values $x = ${c.join(',\\ ')}$ satisfies $${e.tex}$? Take care with the negative signs.`, `Antara nilai $x = ${c.join(',\\ ')}$, yang manakah memenuhi $${e.tex}$? Berhati-hati dengan tanda negatif.`), a: T(`$x = ${x}$`), w: W(...c.map((k) => T(`$x = ${k}$: LHS $= ${tx(ev(e, k)[0])}$, RHS $= ${tx(ev(e, k)[1])}$`)), T(`Only $x = ${x}$ makes the two sides equal.`, `Hanya $x = ${x}$ menjadikan kedua-dua belah sama.`)), sp: 's' };
  };
  const aFindK2 = (r) => {
    const t = r.nz(-4, 6), a = r.int(3, 8), c = r.int(1, a - 1), k = r.int(1, 9);
    const b = (a - c) * t + k; // a t + ... build: a x + b = c x - k? => a t + b = c t - k -> b = (c-a)t - k
    const B = (c - a) * t - k;
    return { q: T(`Given that $x = ${t}$ is a solution of $${a}x ${sg(B)} ${ab(B)} = ${c}x - k$, find the value of $k$.`, `Diberi $x = ${t}$ ialah satu penyelesaian bagi $${a}x ${sg(B)} ${ab(B)} = ${c}x - k$, cari nilai $k$.`), a: T(`$k = ${k}$`), w: W(T(`Substitute $x = ${t}$: $${a}${br(t)} ${sg(B)} ${ab(B)} = ${c}${br(t)} - k$`, `Gantikan $x = ${t}$: $${a}${br(t)} ${sg(B)} ${ab(B)} = ${c}${br(t)} - k$`), T(`$${a * t + B} = ${c * t} - k$`), T(`$k = ${dif(c * t, a * t + B)} = ${k}$`)), sp: 'm' };
  };
  const aEquiv = (r) => {
    const e = eqn(r, r.pick(['two', 'mul', 'add']), {}), d = r.int(2, 9), v = r.int(0, 1), l = e.l, rr = e.r;
    const L0 = side(l), R0 = side(rr);
    const good = v === 0 ? `${L0} + ${d} = ${R0} + ${d}` : `${d}(${L0}) = ${d}(${R0})`;
    const wr = v === 0 ? [`${L0} + ${d} = ${R0}`, `${L0} = ${R0} + ${d}`, `${L0} - ${d} = ${R0} + ${d}`] : [`${d}(${L0}) = ${R0}`, `${d}(${L0}) = ${R0} + ${d}`, `${L0} = ${d}(${R0}) + ${d}`];
    const o = opts(r, good, wr);
    return { q: T(`Which of the following equations has the same solution as $${e.tex}$?<br>${o.list}`, `Persamaan yang manakah mempunyai penyelesaian yang sama dengan $${e.tex}$?<br>${o.list}`), a: mcqA(o), w: W(T('An equation keeps the same solution only when the same operation is done to both sides.', 'Persamaan mengekalkan penyelesaian yang sama hanya apabila operasi yang sama dilakukan pada kedua-dua belah.'), v === 0 ? T(`Option (${o.key}) adds ${d} to each side, so the solution is still $x = ${tx(e.x)}$.`, `Pilihan (${o.key}) menambah ${d} pada setiap belah, maka penyelesaiannya kekal $x = ${tx(e.x)}$.`) : T(`Option (${o.key}) multiplies each side by ${d}, so the solution is still $x = ${tx(e.x)}$.`, `Pilihan (${o.key}) mendarab setiap belah dengan ${d}, maka penyelesaiannya kekal $x = ${tx(e.x)}$.`)), sp: 's' };
  };
  const TF = [
    [T('If $a = b$, then $a + 7 = b + 7$.', 'Jika $a = b$, maka $a + 7 = b + 7$.'), true, T('The same number is added to both sides, so equality is kept.', 'Nombor yang sama ditambah pada kedua-dua belah, maka kesamaan kekal.')],
    [T('If $x + 4 = 10$, then $x = 10 + 4$.', 'Jika $x + 4 = 10$, maka $x = 10 + 4$.'), false, T('4 must be subtracted from both sides: $x = 10 - 4 = 6$.', '4 mesti ditolak daripada kedua-dua belah: $x = 10 - 4 = 6$.')],
    [T('The equation $2x + 3 = 11$ has exactly one solution.', 'Persamaan $2x + 3 = 11$ mempunyai tepat satu penyelesaian.'), true, T('It is a linear equation in one variable and only $x = 4$ works.', 'Ia persamaan linear dalam satu pemboleh ubah dan hanya $x = 4$ berfungsi.')],
    [T('The equation $x + y = 8$ has exactly one solution.', 'Persamaan $x + y = 8$ mempunyai tepat satu penyelesaian.'), false, T('There are infinitely many pairs, e.g. $(1, 7)$ and $(2, 6)$.', 'Terdapat pasangan yang tidak terhingga banyaknya, cth. $(1, 7)$ dan $(2, 6)$.')],
    [T('The equations $3x = 12$ and $x = 4$ have the same solution.', 'Persamaan $3x = 12$ dan $x = 4$ mempunyai penyelesaian yang sama.'), true, T('Dividing both sides of $3x = 12$ by 3 gives $x = 4$.', 'Membahagi kedua-dua belah $3x = 12$ dengan 3 memberi $x = 4$.')],
    [T('The equation $x^2 = 9$ is a linear equation.', 'Persamaan $x^2 = 9$ ialah persamaan linear.'), false, T('The power of $x$ is 2, so it is not linear.', 'Kuasa bagi $x$ ialah 2, maka ia bukan persamaan linear.')],
    [T('If $5x = 20$, dividing only the left-hand side by 5 gives $x = 20$.', 'Jika $5x = 20$, membahagi sebelah kiri sahaja dengan 5 memberi $x = 20$.'), false, T('Both sides must be divided by 5, giving $x = 4$.', 'Kedua-dua belah mesti dibahagi dengan 5, memberi $x = 4$.')],
    [T('$(3, 2)$ and $(2, 3)$ are both solutions of $2x + 3y = 12$.', '$(3, 2)$ dan $(2, 3)$ kedua-duanya penyelesaian bagi $2x + 3y = 12$.'), false, T('$(3, 2)$ works ($6 + 6 = 12$) but $(2, 3)$ gives $4 + 9 = 13$. The order of $(x, y)$ matters.', '$(3, 2)$ berfungsi ($6 + 6 = 12$) tetapi $(2, 3)$ memberi $4 + 9 = 13$. Susunan $(x, y)$ penting.')],
    [T('If $x - 6 = 9$, adding 6 to both sides gives $x = 15$.', 'Jika $x - 6 = 9$, menambah 6 pada kedua-dua belah memberi $x = 15$.'), true, T('$x - 6 + 6 = 9 + 6$.', '$x - 6 + 6 = 9 + 6$.')],
    [T('The solution of $x - 5 = 3$ is $x = -2$.', 'Penyelesaian bagi $x - 5 = 3$ ialah $x = -2$.'), false, T('$x = 3 + 5 = 8$; the sign was changed the wrong way.', '$x = 3 + 5 = 8$; tanda ditukar dengan cara yang salah.')],
    [T('$(0, 5)$ is a solution of $2x + y = 5$.', '$(0, 5)$ ialah satu penyelesaian bagi $2x + y = 5$.'), true, T('$2(0) + 5 = 5$.', '$2(0) + 5 = 5$.')],
    [T('$x = 2$ is a solution of both $3x = 6$ and $x + 5 = 7$.', '$x = 2$ ialah penyelesaian bagi kedua-dua $3x = 6$ dan $x + 5 = 7$.'), true, T('$3(2) = 6$ and $2 + 5 = 7$.', '$3(2) = 6$ dan $2 + 5 = 7$.')],
    [T('To solve $3(x + 2) = 15$, we must first subtract 2 from both sides.', 'Untuk menyelesaikan $3(x + 2) = 15$, kita mesti menolak 2 daripada kedua-dua belah dahulu.'), false, T('The 2 is inside the bracket. Divide both sides by 3 first (or expand the bracket).', '2 berada dalam kurungan. Bahagi kedua-dua belah dengan 3 dahulu (atau kembangkan kurungan).')],
    [T('The equation $y = 3x - 2$ is a linear equation in two variables.', 'Persamaan $y = 3x - 2$ ialah persamaan linear dalam dua pemboleh ubah.'), true, T('Both $x$ and $y$ have power 1.', 'Kedua-dua $x$ dan $y$ berkuasa 1.')],
  ];
  const TFX = 0;
  const aTF = (r) => {
    const t = r.pick(TF);
    return { q: T(`True or false? ${t[0].en} Give a reason.`, `Benar atau palsu? ${t[0].ms} Berikan satu sebab.`), a: T(`${t[1] ? 'True' : 'False'}. ${t[2].en}`, `${t[1] ? 'Benar' : 'Palsu'}. ${t[2].ms}`), w: W(t[2], T(`So the statement is ${t[1] ? 'true' : 'false'}.`, `Maka pernyataan itu ${t[1] ? 'benar' : 'palsu'}.`)), sp: 's' };
  };
  const aPairs = (r) => {
    const p = pairEq(r), dx = r.int(1, 2), E = eq2(p.a, p.b, p.c);
    // second solution on the same line: (x0 + b*d, y0 - a*d)
    const x1 = p.x0 + p.b * dx, y1 = p.y0 - p.a * dx, bad = [p.x0 + 1, p.y0 + 1];
    need(p.ok(x1, y1) && !p.ok(bad[0], bad[1]) && Math.abs(x1) < 15 && Math.abs(y1) < 15);
    return { q: T(`Show that both $${pt(p.x0, p.y0)}$ and $${pt(x1, y1)}$ satisfy $${E}$, but $${pt(bad[0], bad[1])}$ does not. What does this tell you about the number of solutions of a linear equation in two variables?`, `Tunjukkan bahawa $${pt(p.x0, p.y0)}$ dan $${pt(x1, y1)}$ kedua-duanya memenuhi $${E}$, tetapi $${pt(bad[0], bad[1])}$ tidak. Apakah yang ditunjukkan tentang bilangan penyelesaian bagi persamaan linear dalam dua pemboleh ubah?`), a: T(`Values: ${p.c}, ${p.a * x1 + p.b * y1}, ${p.a * bad[0] + p.b * bad[1]} (the third is not ${p.c}). There are infinitely many solutions.`, `Nilai: ${p.c}, ${p.a * x1 + p.b * y1}, ${p.a * bad[0] + p.b * bad[1]} (yang ketiga bukan ${p.c}). Terdapat penyelesaian yang tidak terhingga banyaknya.`), w: W(T(`$${sub2(p.a, p.b, p.x0, p.y0)}$ &check;`, `$${sub2(p.a, p.b, p.x0, p.y0)}$ &check;`), T(`$${sub2(p.a, p.b, x1, y1)}$ &check;`), T(`$${sub2(p.a, p.b, bad[0], bad[1])}$, which is not ${p.c}`, `$${sub2(p.a, p.b, bad[0], bad[1])}$, iaitu bukan ${p.c}`), T('Choosing any value of $x$ gives a matching value of $y$, so a linear equation in two variables has infinitely many solutions.', 'Memilih sebarang nilai $x$ memberi satu nilai $y$ yang sepadan, maka persamaan linear dalam dua pemboleh ubah mempunyai penyelesaian yang tidak terhingga banyaknya.')), sp: 'm' };
  };
  const ga61 = [aSc, aFrac, aNeg, aFindK2, aEquiv, aTF, aPairs];
  /* extra 6.1 material: concept questions, balance-scale diagrams, more stories */
  SCe.push(
    (r) => { const k = r.int(3, 8), x = r.int(2, 9); return SC(T(`${k} identical boxes are stacked on a trolley. Each box has a mass of $x$ kg and the boxes weigh ${k * x} kg altogether.`, `${k} buah kotak yang serupa disusun di atas sebuah troli. Setiap kotak berjisim $x$ kg dan kesemua kotak itu berjisim ${k * x} kg.`), [k, 0], [0, k * x], x); },
    (r) => { const k = r.int(2, 5), b = r.int(1, 9), x = r.int(6, 30); return SC(T(`A stall has ${k} trays with $x$ eggs on each tray and ${b} loose eggs. There are ${k * x + b} eggs in all.`, `Sebuah gerai mempunyai ${k} dulang dengan $x$ biji telur pada setiap dulang dan ${b} biji telur yang longgar. Terdapat ${k * x + b} biji telur semuanya.`), [k, b], [0, k * x + b], x); },
    (r) => { const nm = r.name(), y = r.int(3, 9), x = r.int(10, 15); return SC(T(`${nm} is $x$ years old. In ${y} years' time, ${nm} will be ${x + y} years old.`, `${nm} berumur $x$ tahun. ${y} tahun lagi, umur ${nm} ialah ${x + y} tahun.`), [1, y], [0, x + y], x); },
  );
  const balFig = (l, rr) => {
    let o = S.poly([[130, 52], [112, 112], [148, 112]]) + S.line(20, 52, 240, 52, { w: 1.6 });
    for (const [cxp, lab] of [[38, l], [222, rr]]) o += S.line(cxp, 52, cxp - 26, 88) + S.line(cxp, 52, cxp + 26, 88) + S.line(cxp - 32, 88, cxp + 32, 88, { w: 1.6 }) + S.text(cxp, 74, lab, { s: 12 });
    return S.wrap(260, 120, o, 'balance');
  };
  const eConcept = (r) => {
    const a = r.int(2, 9), b = r.int(1, 9), c = r.int(10, 40);
    const B = [
      [T('What is meant by a solution of an equation?', 'Apakah maksud penyelesaian bagi suatu persamaan?'), T('A value of the unknown that makes both sides equal', 'Nilai pemboleh ubah yang menjadikan kedua-dua belah sama'), [T('The number on the right-hand side', 'Nombor di sebelah kanan'), T('The coefficient of the unknown', 'Pekali pemboleh ubah'), T('Any value of the unknown', 'Sebarang nilai pemboleh ubah')], T('A solution is tested by substitution: only a value that makes the left-hand side equal to the right-hand side is a solution.', 'Penyelesaian diuji dengan penggantian: hanya nilai yang menjadikan sebelah kiri sama dengan sebelah kanan ialah penyelesaian.')],
      [T('In an equation, the equals sign "=" shows that', 'Dalam satu persamaan, tanda sama dengan "=" menunjukkan bahawa'), T('both sides have the same value', 'kedua-dua belah mempunyai nilai yang sama'), [T('the answer must be written next', 'jawapan mesti ditulis selepasnya'), T('the left side is larger', 'sebelah kiri lebih besar'), T('the two sides are added', 'kedua-dua belah ditambah')], T('An equation is a balance: the two sides are equal in value.', 'Persamaan ialah satu keseimbangan: kedua-dua belah sama nilai.')],
      [T('A linear equation in one variable has', 'Persamaan linear dalam satu pemboleh ubah mempunyai'), T('exactly one solution', 'tepat satu penyelesaian'), [T('exactly two solutions', 'tepat dua penyelesaian'), T('infinitely many solutions', 'penyelesaian yang tidak terhingga banyaknya'), T('no solution ever', 'tiada penyelesaian sama sekali')], T('For example $2x + 3 = 11$ is true only for $x = 4$.', 'Contohnya $2x + 3 = 11$ benar hanya untuk $x = 4$.')],
      [T('A linear equation in two variables has', 'Persamaan linear dalam dua pemboleh ubah mempunyai'), T('infinitely many ordered-pair solutions', 'penyelesaian pasangan tertib yang tidak terhingga banyaknya'), [T('exactly one ordered-pair solution', 'tepat satu penyelesaian pasangan tertib'), T('exactly two ordered-pair solutions', 'tepat dua penyelesaian pasangan tertib'), T('no ordered-pair solution', 'tiada penyelesaian pasangan tertib')], T('Every value of $x$ gives a matching value of $y$, for example $x + y = 8$ has $(1, 7)$, $(2, 6)$, and so on.', 'Setiap nilai $x$ memberi satu nilai $y$ yang sepadan, contohnya $x + y = 8$ mempunyai $(1, 7)$, $(2, 6)$, dan seterusnya.')],
      [T('The highest power of the unknown in a linear equation is', 'Kuasa tertinggi bagi pemboleh ubah dalam persamaan linear ialah'), T('1', '1'), [T('0', '0'), T('2', '2'), T('3', '3')], T('"Linear" means the graph is a straight line; a power of $2$ or $3$ would make it a curve.', '"Linear" bermaksud grafnya garis lurus; kuasa $2$ atau $3$ akan menjadikannya lengkung.')],
      [T('To keep an equation balanced, an operation must be done to', 'Untuk mengekalkan keseimbangan persamaan, satu operasi mesti dilakukan pada'), T('both sides of the equation', 'kedua-dua belah persamaan'), [T('the left-hand side only', 'sebelah kiri sahaja'), T('the right-hand side only', 'sebelah kanan sahaja'), T('the unknown only', 'pemboleh ubah sahaja')], T('Changing one side only would make the two sides unequal and change the solution.', 'Mengubah sebelah sahaja akan menjadikan kedua-dua belah tidak sama dan menukar penyelesaiannya.')],
      [T('In $(x, y)$, the number written first is', 'Dalam $(x, y)$, nombor yang ditulis dahulu ialah'), T('the value of $x$', 'nilai $x$'), [T('the value of $y$', 'nilai $y$'), T('the constant term', 'sebutan pemalar'), T('the coefficient', 'pekali')], T('The pair is ordered: the $x$-coordinate comes first, then the $y$-coordinate.', 'Pasangan itu tertib: koordinat-$x$ dahulu, kemudian koordinat-$y$.')],
      [T('The expression on the left of the equals sign is called the', 'Ungkapan di sebelah kiri tanda sama dengan dipanggil'), T('left-hand side (LHS)', 'sebelah kiri (LHS)'), [T('right-hand side (RHS)', 'sebelah kanan (RHS)'), T('coefficient', 'pekali'), T('constant', 'pemalar')], T('LHS stands for the left-hand side; the part after the equals sign is the right-hand side.', 'LHS bermaksud sebelah kiri; bahagian selepas tanda sama dengan ialah sebelah kanan.')],
      [T('To check whether $x = 5$ is a solution of an equation, we', 'Untuk menyemak sama ada $x = 5$ ialah penyelesaian bagi suatu persamaan, kita'), T('substitute 5 for $x$ and compare the two sides', 'menggantikan $x$ dengan 5 dan membandingkan kedua-dua belah'), [T('add 5 to both sides', 'menambah 5 pada kedua-dua belah'), T('multiply the equation by 5', 'mendarab persamaan dengan 5'), T('replace the equals sign by 5', 'menggantikan tanda sama dengan dengan 5')], T('Substitution replaces the letter by the number; then the two sides are compared.', 'Penggantian menggantikan huruf dengan nombor; kemudian kedua-dua belah dibandingkan.')],
      [T('The solutions of $x + y = 9$ are written as', 'Penyelesaian bagi $x + y = 9$ ditulis sebagai'), T('ordered pairs $(x, y)$', 'pasangan tertib $(x, y)$'), [T('a single number', 'satu nombor'), T('an expression in $x$ only', 'satu ungkapan dalam $x$ sahaja'), T('a fraction', 'satu pecahan')], T('A solution needs a value of $x$ and a value of $y$ together, written $(x, y)$.', 'Penyelesaian memerlukan nilai $x$ dan nilai $y$ bersama-sama, ditulis $(x, y)$.')],
    ];
    if (r.chance(0.25)) {
      const o = opts(r, `${a}x + ${b}`, [`${a}x + ${b} = ${c}`, `y = ${a}x + ${b}`, `${a}x = ${c}`]);
      return { q: T(`Which of the following is NOT an equation?<br>${o.list}`, `Antara yang berikut, yang manakah BUKAN persamaan?<br>${o.list}`), a: mcqA(o), w: W(T('An equation must contain an equals sign joining two sides of equal value.', 'Persamaan mesti mengandungi tanda sama dengan yang menghubungkan dua belah yang sama nilai.'), T(`$${a}x + ${b}$ has no equals sign, so it is an expression, not an equation.`, `$${a}x + ${b}$ tiada tanda sama dengan, maka ia ungkapan, bukan persamaan.`)), sp: 's' };
    }
    const z = r.pick(B), o = optsT(r, z[1], z[2]);
    return { q: T(`${z[0].en}<br>${o.list.en}`, `${z[0].ms}<br>${o.list.ms}`), a: T(`(${o.key}) ${z[1].en}`, `(${o.key}) ${z[1].ms}`), w: W(z[3], cat(T(`So the answer is (${o.key}) `, `Maka jawapannya ialah (${o.key}) `), z[1], T('.', '.'))), sp: 's' };
  };
  const eBal = (r) => {
    const e = eqn(r, r.pick(['add', 'mul', 'two', 'both']), { pos: true }), x = e.x.n;
    need(e.l[0].d === 1 && e.r[0].d === 1 && e.l[1].n >= 0 && e.r[1].n >= 0);
    const L = side(e.l), R = side(e.r), v = r.int(0, 1);
    if (v === 0) return { q: T(`The diagram shows a balance that is level. Write an equation for it.`, `Rajah menunjukkan sebuah penimbang yang seimbang. Tulis satu persamaan bagi rajah itu.`), fig: balFig(L, R), a: T(`$${e.tex}$`), w: W(T(`Left pan: $${L}$; right pan: $${R}$`, `Dulang kiri: $${L}$; dulang kanan: $${R}$`), T(`The balance is level, so the two pans are equal: $${e.tex}$`, `Penimbang itu seimbang, maka kedua-dua dulang sama: $${e.tex}$`)), sp: 's' };
    return { q: T(`The balance is level. Find, by trying $x = ${x - 1}$, $x = ${x}$ and $x = ${x + 1}$, which value of $x$ keeps the two pans equal.`, `Penimbang itu seimbang. Dengan mencuba $x = ${x - 1}$, $x = ${x}$ dan $x = ${x + 1}$, cari nilai $x$ yang menjadikan kedua-dua dulang sama berat.`), fig: balFig(L, R), a: T(`$x = ${x}$`), w: W(T(`The balance gives $${e.tex}$.`, `Penimbang itu memberi $${e.tex}$.`), ...[x - 1, x, x + 1].map((k) => T(`$x = ${k}$: left $= ${tx(ev(e, k)[0])}$, right $= ${tx(ev(e, k)[1])}$`, `$x = ${k}$: kiri $= ${tx(ev(e, k)[0])}$, kanan $= ${tx(ev(e, k)[1])}$`)), T(`Only $x = ${x}$ keeps the pans equal.`, `Hanya $x = ${x}$ mengekalkan kedua-dua dulang sama.`)), sp: 's' };
  };
  ge61.push(eConcept, eBal);
  const F = SPM.figs;
  const aFig = (r) => {
    const v = r.int(0, 2), x = r.int(15, 30);
    if (v === 0) {
      const a = r.int(2, 4), c = r.int(1, 3), b = r.int(5, 25), d = 180 - (a + c) * x - b, A = a * x + b;
      need(A > 25 && A < 155 && d > -50 && d < 50 && d !== 0);
      const l1 = `(${lin(a, b)})°`, l2 = `(${lin(c, d)})°`;
      return { q: T(`The diagram shows a straight line. Form an equation in $x$ and find the value of $x$.`, `Rajah menunjukkan satu garis lurus. Bentukkan satu persamaan dalam $x$ dan cari nilai $x$.`), fig: F.fan({ rays: [0, A, 180], labels: { 0: l1, 1: l2 }, w: 280, h: 150 }), a: T(`$(${lin(a, b)}) + (${lin(c, d)}) = 180$; $x = ${x}$`), w: W(T('Angles on a straight line add up to $180^\\circ$.', 'Sudut pada satu garis lurus berjumlah $180^\\circ$.'), T(`$(${lin(a, b)}) + (${lin(c, d)}) = 180$`), T(`$${lin(a + c, b + d)} = 180$`), T(`$${a + c}x = ${redu(180, b + d)}$`), T(`$x = \\dfrac{${180 - b - d}}{${a + c}} = ${x}$`)), sp: 's' };
    }
    if (v === 1) {
      const b1 = r.int(5, 20), b2 = r.int(-10, 10), d = 180 - 4 * x - b1 - b2, A = x + b1, B = 2 * x + b2;
      need(d > 0 && A > 20 && B > 20 && 180 - A - B > 20);
      return { q: T(`The diagram shows a triangle. Write an equation in $x$ and find the value of $x$. (The diagram is not drawn to scale.)`, `Rajah menunjukkan sebuah segi tiga. Tulis satu persamaan dalam $x$ dan cari nilai $x$. (Rajah tidak dilukis mengikut skala.)`), fig: F.triangle({ a: A, b: B, angles: { A: `(${lin(1, b1)})°`, B: `(${lin(2, b2)})°`, C: `(${lin(1, d)})°` } }), a: T(`$(${lin(1, b1)}) + (${lin(2, b2)}) + (${lin(1, d)}) = 180$; $x = ${x}$`), w: W(T('The three angles of a triangle add up to $180^\\circ$.', 'Tiga sudut sebuah segi tiga berjumlah $180^\\circ$.'), T(`$(${lin(1, b1)}) + (${lin(2, b2)}) + (${lin(1, d)}) = 180$`), T(`$${lin(4, b1 + b2 + d)} = 180$`), T(`$4x = ${redu(180, b1 + b2 + d)}$`), T(`$x = \\dfrac{${4 * x}}{4} = ${x}$`)), sp: 's' };
    }
    const a = r.int(2, 4), b = r.int(1, 6), c = r.int(2, 8), P = 2 * ((a * x + b) + (x + c));
    return { q: T(`The diagram shows a rectangle with a perimeter of ${P} cm. Form an equation in $x$ and find the value of $x$.`, `Rajah menunjukkan sebuah segi empat tepat dengan perimeter ${P} cm. Bentukkan satu persamaan dalam $x$ dan cari nilai $x$.`), fig: F.polygon({ pts: [[0, 0], [1.9, 0], [1.9, 1], [0, 1]], sides: { '0-1': `(${lin(a, b)}) cm`, '1-2': `(${lin(1, c)}) cm` } }), a: T(`$2[(${lin(a, b)}) + (${lin(1, c)})] = ${P}$; $x = ${x}$`), w: W(T('Perimeter of a rectangle $= 2 \\times$ (length $+$ width).', 'Perimeter segi empat tepat $= 2 \\times$ (panjang $+$ lebar).'), T(`$2[(${lin(a, b)}) + (${lin(1, c)})] = ${P}$`), T(`$2(${lin(a + 1, b + c)}) = ${P}$`), T(`$${lin(a + 1, b + c)} = ${P / 2}$`), T(`$${a + 1}x = ${redu(P / 2, b + c)}$`), T(`$x = \\dfrac{${P / 2 - b - c}}{${a + 1}} = ${x}$`)), sp: 's' };
  };
  const mBal = (r) => {
    const e = eqn(r, r.pick(['both', 'brk', 'two']), { pos: true }), x = e.x.n;
    need(e.l[0].d === 1 && e.r[0].d === 1 && e.l[1].n >= 0 && e.r[1].n >= 0 && e.l[1].n + e.r[1].n > 0);
    const [lv] = ev(e, x);
    return { q: T(`The balance is level. (a) Write an equation for the diagram. (b) Show that $x = ${x}$ makes the two pans equal.`, `Penimbang itu seimbang. (a) Tulis satu persamaan bagi rajah itu. (b) Tunjukkan bahawa $x = ${x}$ menjadikan kedua-dua dulang sama berat.`), fig: balFig(side(e.l), side(e.r)), a: T(`(a) $${e.tex}$ (b) both pans $= ${tx(lv)}$`, `(a) $${e.tex}$ (b) kedua-dua dulang $= ${tx(lv)}$`), w: W(T(`(a) Left pan $= ${side(e.l)}$, right pan $= ${side(e.r)}$, and the balance is level: $${e.tex}$`, `(a) Dulang kiri $= ${side(e.l)}$, dulang kanan $= ${side(e.r)}$, dan penimbang itu seimbang: $${e.tex}$`), cat(T('(b) ', '(b) '), subW(e, e.x)), eqLine(true)), sp: 'm' };
  };
  const mRevPh = (r) => {
    const p = phr(r, 4, 11), o = optsT(r, p.st, p.others.map((z) => z[1]));
    return { q: T(`Which statement is represented by the equation $${p.tex}$?<br>${o.list.en}`, `Pernyataan yang manakah diwakili oleh persamaan $${p.tex}$?<br>${o.list.ms}`), a: T(`(${o.key}) ${p.st.en}`, `(${o.key}) ${p.st.ms}`), w: W(T(`Read $${p.tex}$ in words.`, `Baca $${p.tex}$ dalam perkataan.`), p.how, T(`This is statement (${o.key}).`, `Ini ialah pernyataan (${o.key}).`)), sp: 's' };
  };
  gm61.push(mBal, mRevPh);
  ga61.push(aFig);
  SPM.extend('F1-6.1', { e: ge61, m: gm61, a: ga61 });

  
  /* ================================================================ 6.2 */
  K.fr5 = (r) => { const b = r.int(2, 5), d = r.int(2, 5), a = r.int(1, 6), c = r.int(1, 6), x = r.nz(-3, 12); need(b !== d && (x + a) % b === 0 && (x - c) % d === 0); const e = (x + a) / b + (x - c) / d; return EO([Fr.add(Q(1, b), Q(1, d)), Fr.sub(Q(a, b), Q(c, d))], [0, e], `\\dfrac{x + ${a}}{${b}} + \\dfrac{x - ${c}}{${d}} = ${e}`); };
  const wrongSols = (e) => {
    const l = e.l, rr = e.r, out = [];
    const t = (L, R) => { try { out.push(EO(L, R, 'x').x); } catch (er) { /* degenerate */ } };
    t([l[0], Fr.neg(l[1])], rr); t(l, [rr[0], Fr.neg(rr[1])]); t([Fr.neg(l[0]), l[1]], rr); t(l, [Fr.neg(rr[0]), rr[1]]);
    out.push(Fr.neg(e.x), Fr.add(e.x, Q(1)), Fr.sub(e.x, Q(1)));
    const seen = new Set();
    return out.filter((v) => { const k = tx(v); if (Fr.eq(v, e.x) || seen.has(k) || v.d > 12 || ab(v.n) > 60) return false; seen.add(k); return true; });
  };
  const sol = (e) => `x = ${tx(e.x)}`;
  const asOf = (r, e, v) => (v === 'x' ? e.tex : e.tex.replace(/x/g, v));
  const VARS = ['x', 'y', 'n', 'm', 'p', 't', 'k'];
  /* forward "think of a number" chains, solved backwards */
  /** undo a chain() step by step, from the last operation back to $x$ */
  const chainBack = (c) => {
    const out = []; let cur = c.val;
    for (let i = c.ops.length - 1; i >= 0; i--) {
      const [o, k] = c.ops[i];
      const inv = o === '+' ? `${cur} - ${k}` : o === '-' ? `${cur} + ${k}` : o === '\\times' ? `${cur} \\div ${k}` : `${cur} \\times ${k}`;
      cur = o === '+' ? cur - k : o === '-' ? cur + k : o === '\\times' ? cur / k : cur * k;
      out.push(T(`$${inv} = ${cur}$`));
    }
    return out;
  };
  const chainW = (c) => W(T(`Equation: $${c.eq}$`, `Persamaan: $${c.eq}$`), T('Undo the operations one at a time, starting with the last one.', 'Songsangkan operasi satu demi satu, bermula dengan yang terakhir.'), ...chainBack(c), T(`$x = ${c.x}$`));
  const chain = (r, len) => retry(() => {
    let x = r.int(2, 15), val = x, cur = 'x', flow = 'x';
    const ops = [];
    for (let i = 0; i < len; i++) {
      const o = r.pick(['+', '-', '\\times', '\\div']), k = r.int(2, 9);
      need(!(i > 0 && (o === '+' || o === '-') && (ops[i - 1][0] === '+' || ops[i - 1][0] === '-')));
      if (o === '\\div') { need(val % k === 0); } else if (o === '\\times') need(k <= 6);
      val = o === '+' ? val + k : o === '-' ? val - k : o === '\\times' ? val * k : val / k;
      need(val > 0 && val <= 150);
      ops.push([o, k]);
      cur = o === '+' ? `${cur} + ${k}` : o === '-' ? `${cur} - ${k}` : o === '\\times' ? (cur === 'x' ? `${k}x` : `${k}(${cur})`) : `\\dfrac{${cur}}{${k}}`;
      flow += ` \\xrightarrow{${o === '+' || o === '-' ? o + ' ' : o + ' '}${k}} \\square`;
    }
    let b = Q(val);
    for (let i = ops.length - 1; i >= 0; i--) { const [o, k] = ops[i]; b = o === '+' ? Fr.sub(b, Q(k)) : o === '-' ? Fr.add(b, Q(k)) : o === '\\times' ? Fr.div(b, Q(k)) : Fr.mul(b, Q(k)); }
    need(Fr.eq(b, Q(x)));
    return { flow: flow.replace(/\\square$/, val), eq: `${cur} = ${val}`, x, val, ops, b };
  });
  const eSolve = (r) => {
    const kind = r.pick(EASYK), e = eqn(r, kind, { pos: true }), v = r.pick(VARS), E = asOf(r, e, v), S_ = (t) => t.replace(/x/g, v);
    const w = W(...stepsW(e, v));
    const ph = r.int(0, 3);
    const q = [T(`Solve $${E}$.`, `Selesaikan $${E}$.`), T(`Find the value of $${v}$ in $${E}$.`, `Cari nilai $${v}$ dalam $${E}$.`), T(`Solve the equation $${E}$ and check your answer by substitution.`, `Selesaikan persamaan $${E}$ dan semak jawapan anda dengan penggantian.`), T(`Use the balance method to solve $${E}$.`, `Gunakan kaedah imbangan untuk menyelesaikan $${E}$.`)][ph];
    const ans = T(`$${v} = ${tx(e.x)}$`);
    return { q, a: ans, w, sp: ph === 2 ? 'm' : 's' };
  };
  const eSteps = (r) => {
    const k = r.int(0, 2), a = r.int(2, 8), b = r.int(2, 12), x = r.int(2, 12);
    if (k === 0) { const c = a * x + b; return { q: T(`Complete the steps to solve $${a}x + ${b} = ${c}$:<br>$${a}x = ${c} - \\square$<br>$${a}x = \\square$<br>$x = \\square$`, `Lengkapkan langkah untuk menyelesaikan $${a}x + ${b} = ${c}$:<br>$${a}x = ${c} - \\square$<br>$${a}x = \\square$<br>$x = \\square$`), a: T(`$${b}$; $${c - b}$; $${x}$`), w: W(T(`Subtract $${b}$ from both sides: $${a}x = ${c} - ${b}$`, `Tolak $${b}$ daripada kedua-dua belah: $${a}x = ${c} - ${b}$`), T(`$${a}x = ${c - b}$`), T(`Divide both sides by $${a}$: $x = \\dfrac{${c - b}}{${a}} = ${x}$`, `Bahagi kedua-dua belah dengan $${a}$: $x = \\dfrac{${c - b}}{${a}} = ${x}$`)), sp: 's' }; }
    if (k === 1) { const c = a * x - b; return { q: T(`Complete the steps to solve $${a}x - ${b} = ${c}$:<br>$${a}x = ${c} + \\square$<br>$${a}x = \\square$<br>$x = \\square$`, `Lengkapkan langkah untuk menyelesaikan $${a}x - ${b} = ${c}$:<br>$${a}x = ${c} + \\square$<br>$${a}x = \\square$<br>$x = \\square$`), a: T(`$${b}$; $${c + b}$; $${x}$`), w: W(T(`Add $${b}$ to both sides: $${a}x = ${c} + ${b}$`, `Tambah $${b}$ pada kedua-dua belah: $${a}x = ${c} + ${b}$`), T(`$${a}x = ${c + b}$`), T(`Divide both sides by $${a}$: $x = \\dfrac{${c + b}}{${a}} = ${x}$`, `Bahagi kedua-dua belah dengan $${a}$: $x = \\dfrac{${c + b}}{${a}} = ${x}$`)), sp: 's' }; }
    const c = x + b;
    return { q: T(`Complete: $\\dfrac{x}{${a}} + ${b} = ${c}$<br>$\\dfrac{x}{${a}} = ${c} - ${b} = \\square$<br>$x = \\square \\times ${a} = \\square$`, `Lengkapkan: $\\dfrac{x}{${a}} + ${b} = ${c}$<br>$\\dfrac{x}{${a}} = ${c} - ${b} = \\square$<br>$x = \\square \\times ${a} = \\square$`), a: T(`$${x}$; $${x}$; $${x * a}$`), w: W(T(`Subtract $${b}$ from both sides: $\\dfrac{x}{${a}} = ${c} - ${b} = ${x}$`, `Tolak $${b}$ daripada kedua-dua belah: $\\dfrac{x}{${a}} = ${c} - ${b} = ${x}$`), T(`Multiply both sides by $${a}$: $x = ${x} \\times ${a} = ${x * a}$`, `Darab kedua-dua belah dengan $${a}$: $x = ${x} \\times ${a} = ${x * a}$`)), sp: 's' };
  };
  const eMc = (r) => {
    const e = eqn(r, r.pick(EASYK), { pos: true }), o = opts(r, sol(e), wrongSols(e).map((v) => `x = ${tx(v)}`));
    return { q: T(`The solution of $${e.tex}$ is:<br>${o.list}`, `Penyelesaian bagi $${e.tex}$ ialah:<br>${o.list}`), a: mcqA(o), w: W(...stepsW(e)), sp: 's' };
  };
  const eDerived = (r) => {
    const e = eqn(r, r.pick(EASYK), { pos: true }), m = r.int(2, 4), c = r.int(1, 9), d = m * e.x.n + c;
    return { q: T(`Given $${e.tex}$, find the value of $${lin(m, c)}$.`, `Diberi $${e.tex}$, cari nilai $${lin(m, c)}$.`), a: T(`$${d}$`), w: W(...stepsW(e), T(`$${lin(m, c)} = ${m}(${tx(e.x)}) + ${c} = ${d}$`)), sp: 's' };
  };
  const eBalSolve = (r) => {
    const e = eqn(r, r.pick(['add', 'two', 'mul']), { pos: true });
    need(e.l[1].n >= 0 && e.r[1].n >= 0 && e.l[0].d === 1);
    return { q: T(`The balance is level. Write an equation from the diagram and solve it to find the value of $x$.`, `Penimbang itu seimbang. Tulis satu persamaan daripada rajah itu dan selesaikannya untuk mencari nilai $x$.`), fig: balFig(side(e.l), side(e.r)), a: T(`$${e.tex}$; $${sol(e)}$`), w: W(T(`The two pans balance, so the equation is $${e.tex}$.`, `Kedua-dua dulang seimbang, maka persamaannya ialah $${e.tex}$.`), ...stepsW(e)), sp: 's' };
  };
  const eFirst = (r) => {
    const e = eqn(r, r.pick(['two', 'divb', 'brk']), { pos: true });
    const k = e.tex.includes('dfrac') ? 0 : e.tex.includes('(') ? 1 : 2;
    const good = [T('Subtract the constant from both sides, then multiply by the denominator', 'Tolak pemalar daripada kedua-dua belah, kemudian darab dengan penyebut'), T('Divide both sides by the number outside the bracket', 'Bahagi kedua-dua belah dengan nombor di luar kurungan'), T('Subtract the constant from both sides, then divide by the coefficient of $x$', 'Tolak pemalar daripada kedua-dua belah, kemudian bahagi dengan pekali bagi $x$')][k];
    const bad = [T('Add the denominator to both sides', 'Tambah penyebut pada kedua-dua belah'), T('Subtract the number in the bracket from both sides first', 'Tolak nombor dalam kurungan daripada kedua-dua belah dahulu'), T('Divide both sides by the coefficient of $x$ first, leaving the constant alone', 'Bahagi kedua-dua belah dengan pekali $x$ dahulu, biarkan pemalar'), T('Multiply both sides by the constant', 'Darab kedua-dua belah dengan pemalar'), T('Take the constant to the other side without changing its sign', 'Pindahkan pemalar ke sebelah lagi tanpa menukar tandanya')];
    const o = optsT(r, good, bad.filter((z) => z.en !== good.en));
    return { q: T(`Which set of steps correctly solves $${e.tex}$?<br>${o.list.en}`, `Set langkah yang manakah menyelesaikan $${e.tex}$ dengan betul?<br>${o.list.ms}`), a: T(`(${o.key}) ${good.en}; $${sol(e)}$`, `(${o.key}) ${good.ms}; $${sol(e)}$`), w: W(cat(T('Correct steps: ', 'Langkah yang betul: '), good), ...stepsW(e), T(`So the answer is (${o.key}).`, `Maka jawapannya ialah (${o.key}).`)), sp: 's' };
  };
  const eNumber = (r) => {
    const p = phr(r, 0, 5), v = r.int(0, 2);
    const qs = [T(`${p.st.en} Find the number.`, `${p.st.ms} Cari nombor itu.`), T(`${p.st.en} Write an equation and solve it to find $x$.`, `${p.st.ms} Tulis satu persamaan dan selesaikannya untuk mencari $x$.`), T(`Solve the following problem. ${p.st.en}`, `Selesaikan masalah berikut. ${p.st.ms}`)];
    return { q: qs[v], a: T(`$${p.tex}$; $x = ${p.x}$`), w: W(...phW(p)), sp: 's' };
  };
  const eSc2 = (r) => {
    const s = r.pick(SCe)(r), e = s.e, v = r.int(0, 2);
    if (v === 0) return { q: T(`${s.st.en} Form an equation and solve it to find $x$.`, `${s.st.ms} Bentukkan satu persamaan dan selesaikannya untuk mencari $x$.`), a: T(`$${e.tex}$; $${sol(e)}$`), w: scFull(s), sp: 'm' };
    if (v === 1) return { q: T(`${s.st.en} Find the value of $x$.`, `${s.st.ms} Cari nilai $x$.`), a: T(`$${sol(e)}$`), w: scFull(s), sp: 'm' };
    return { q: T(`${s.st.en} (a) Write an equation. (b) Solve it. (c) Check your answer.`, `${s.st.ms} (a) Tulis satu persamaan. (b) Selesaikannya. (c) Semak jawapan anda.`), a: T(`(a) $${e.tex}$ (b) $${sol(e)}$ (c) both sides $= ${tx(ev(e, e.x)[0])}$`, `(a) $${e.tex}$ (b) $${sol(e)}$ (c) kedua-dua belah $= ${tx(ev(e, e.x)[0])}$`), w: W(T(`(a) Equation: $${e.tex}$`, `(a) Persamaan: $${e.tex}$`), ...pfx('(b) ', stepsW(e)), ...pfx('(c) ', [subW(e, e.x)]), eqLine(true)), sp: 'm' };
  };
  const eBad = (r) => {
    const a = r.int(2, 7), b = r.int(2, 12), x = r.int(2, 12), c = a * x + b, nm = r.name(), wx = Q(c + b, a);
    return { q: T(`${nm} solves $${a}x + ${b} = ${c}$ as follows:<br>$${a}x = ${c} + ${b} = ${c + b}$<br>$x = ${tx(wx)}$<br>Find the mistake and solve the equation correctly.`, `${nm} menyelesaikan $${a}x + ${b} = ${c}$ seperti berikut:<br>$${a}x = ${c} + ${b} = ${c + b}$<br>$x = ${tx(wx)}$<br>Cari kesilapan itu dan selesaikan persamaan dengan betul.`), a: T(`${b} should be subtracted, not added: $${a}x = ${c - b}$, so $x = ${x}$`, `${b} sepatutnya ditolak, bukan ditambah: $${a}x = ${c - b}$, maka $x = ${x}$`), w: W(T(`$${b}$ is added on the left, so to undo it we subtract $${b}$ from both sides, not add it.`, `$${b}$ ditambah di sebelah kiri, maka untuk menyongsangkannya kita tolak $${b}$ daripada kedua-dua belah, bukan menambahnya.`), T(`$${a}x = ${c} - ${b} = ${c - b}$`), T(`$x = \\dfrac{${c - b}}{${a}} = ${x}$`)), sp: 'm' };
  };
  const eTF = (r) => {
    const e = eqn(r, r.pick(EASYK), { pos: true }), good = r.chance(), t = good ? e.x : Fr.add(e.x, Q(r.pick([-1, 1, 2]))), nm = r.name();
    need(t.n > 0);
    return { q: T(`${nm} says that the solution of $${e.tex}$ is $x = ${tx(t)}$. Is ${nm} correct? Explain.`, `${nm} berkata bahawa penyelesaian bagi $${e.tex}$ ialah $x = ${tx(t)}$. Adakah ${nm} betul? Terangkan.`), a: good ? T(`Yes. Substituting $x = ${tx(t)}$ makes both sides $${tx(ev(e, t)[0])}$`, `Ya. Penggantian $x = ${tx(t)}$ menjadikan kedua-dua belah $${tx(ev(e, t)[0])}$`) : T(`No. The solution is $${sol(e)}$; $x = ${tx(t)}$ gives ${tx(ev(e, t)[0])} on the left but ${tx(ev(e, t)[1])} on the right`, `Tidak. Penyelesaiannya ialah $${sol(e)}$; $x = ${tx(t)}$ memberi ${tx(ev(e, t)[0])} di sebelah kiri tetapi ${tx(ev(e, t)[1])} di sebelah kanan`), w: good ? W(subW(e, t), eqLine(true)) : W(subW(e, t), eqLine(false), ...stepsW(e)), sp: 's' };
  };
  const ge62 = [eSolve, eSteps, eMc, eDerived, eBalSolve, eFirst, eNumber, eSc2, eBad, eTF];

    const mSolve = (r) => {
    const e = eqn(r, r.pick(MEDK), {}), v = r.int(0, 3), w = W(...stepsW(e));
    if (v === 0) return { q: T(`Solve $${e.tex}$.`, `Selesaikan $${e.tex}$.`), a: xans(e), w, sp: 'm' };
    if (v === 1) return { q: T(`Solve $${e.tex}$ and verify your answer by substituting it into both sides.`, `Selesaikan $${e.tex}$ dan sahkan jawapan anda dengan menggantikannya ke dalam kedua-dua belah.`), a: T(`$${sol(e)}$; both sides $= ${tx(ev(e, e.x)[0])}$`, `$${sol(e)}$; kedua-dua belah $= ${tx(ev(e, e.x)[0])}$`), w: W(...stepsW(e), subW(e, e.x), eqLine(true)), sp: 'm' };
    if (v === 2) { const m = r.int(2, 4), c = r.int(1, 9), d = Fr.add(Fr.mul(Q(m), e.x), Q(c)); return { q: T(`If $${e.tex}$, find the value of $${lin(m, c)}$.`, `Jika $${e.tex}$, cari nilai $${lin(m, c)}$.`), a: T(`$${tx(d)}$`), w: W(...stepsW(e), T(`$${lin(m, c)} = ${m}(${tx(e.x)}) + ${c} = ${tx(d)}$`)), sp: 'm' }; }
    return { q: T(`Solve $${e.tex}$ by first removing the fractions or brackets. Show each step.`, `Selesaikan $${e.tex}$ dengan menyingkirkan pecahan atau kurungan dahulu. Tunjukkan setiap langkah.`), a: xans(e), w, sp: 'm' };
  };
  const mMc = (r) => {
    const e = eqn(r, r.pick(MEDK), {}), o = opts(r, sol(e), wrongSols(e).map((v) => `x = ${tx(v)}`));
    return { q: T(`Which is the solution of $${e.tex}$?<br>${o.list}`, `Yang manakah penyelesaian bagi $${e.tex}$?<br>${o.list}`), a: mcqA(o), w: W(...stepsW(e)), sp: 's' };
  };
  const mErr = (r) => {
    const nm = r.name(), k = r.int(0, 3), pre = (E) => T(`${nm} solves $${E}$ like this:<br>`, `${nm} menyelesaikan $${E}$ seperti ini:<br>`);
    const mk = (E, lines, why, fix, steps) => ({ q: T(pre(E).en + lines.map((l) => `$${l}$`).join('<br>') + '<br>Find the mistake and give the correct solution.', pre(E).ms + lines.map((l) => `$${l}$`).join('<br>') + '<br>Cari kesilapan itu dan berikan penyelesaian yang betul.'), a: T(`${why.en} Correct: $${fix}$`, `${why.ms} Betul: $${fix}$`), w: W(why, ...(steps || []).map((s) => T(`$${s}$`))), sp: 'm' });
    if (k === 0) { const a = r.int(2, 6), b = r.int(1, 6), x = r.int(1, 10), c = a * (x + b); return mk(`${a}(x + ${b}) = ${c}`, [`${a}(x + ${b}) = ${c}`, `${a}x + ${b} = ${c}`, `${a}x = ${c - b}`, `x = ${tx(Q(c - b, a))}`], T(`The bracket was expanded wrongly: ${a} must multiply both terms.`, `Kurungan dikembangkan dengan salah: ${a} mesti didarab dengan kedua-dua sebutan.`), `${a}x + ${a * b} = ${c},\\ x = ${x}`, [`${a}x + ${a * b} = ${c}`, `${a}x = ${redu(c, a * b)}`, `x = \\dfrac{${a * x}}{${a}} = ${x}`]); }
    if (k === 1) { const a = r.int(3, 8), c = r.int(1, a - 1), x = r.int(2, 9), b = r.int(1, 8), d = (a - c) * x + b; return mk(`${lin(a, b)} = ${lin(c, d)}`, [`${lin(a, b)} = ${lin(c, d)}`, `${a}x + ${c}x = ${d} - ${b}`, `${a + c}x = ${d - b}`, `x = ${tx(Q(d - b, a + c))}`], T(`$${c}x$ was moved to the left without changing its sign; it should be subtracted.`, `$${c}x$ dipindahkan ke sebelah kiri tanpa menukar tandanya; ia sepatutnya ditolak.`), `${a - c}x = ${d - b},\\ x = ${x}`, [`${a}x - ${c}x = ${redu(d, b)}`, `${cn(a - c)}x = ${d - b}`, a - c === 1 ? `x = ${x}` : `x = \\dfrac{${d - b}}{${a - c}} = ${x}`]); }
    if (k === 2) { const a = r.int(2, 5), b = r.int(2, 9), y = r.int(2, 9), c = y + b; return mk(`\\dfrac{x}{${a}} + ${b} = ${c}`, [`\\dfrac{x}{${a}} + ${b} = ${c}`, `x + ${b} = ${a * c}`, `x = ${a * c - b}`], T(`Only $\\dfrac{x}{${a}}$ was multiplied by ${a}; every term must be multiplied.`, `Hanya $\\dfrac{x}{${a}}$ didarab dengan ${a}; setiap sebutan mesti didarab.`), `x + ${a * b} = ${a * c},\\ x = ${a * y}`, [`x + ${a * b} = ${a * c}`, `x = ${redu(a * c, a * b)}`]); }
    const a = r.int(2, 6), x = r.int(1, 8), b = r.int(a * x + 1, a * x + 12), c = b - a * x;
    return mk(`${b} - ${a}x = ${c}`, [`${b} - ${a}x = ${c}`, `${a}x = ${c} - ${b}`, `x = ${tx(Q(c - b, a))}`], T(`The term $-${a}x$ was moved without changing its sign: $${a}x = ${b} - ${c}$.`, `Sebutan $-${a}x$ dipindahkan tanpa menukar tandanya: $${a}x = ${b} - ${c}$.`), `${a}x = ${b} - ${c},\\ x = ${x}`, [`${a}x = ${redu(b, c)}`, `x = \\dfrac{${b - c}}{${a}} = ${x}`]);
  };
  const mSc2 = (r) => {
    const s = r.pick(SCe.concat(SCm))(r), e = s.e, v = r.int(0, 3), [lv] = ev(e, e.x);
    if (v === 3) return { q: T(`${s.st.en} Set up an equation and use inverse operations to find $x$.`, `${s.st.ms} Bentukkan satu persamaan dan gunakan operasi songsang untuk mencari $x$.`), a: T(`$${e.tex}$; $${sol(e)}$`), w: scFull(s), sp: 'm' };
    if (v === 0) return { q: T(`${s.st.en} Form an equation and solve it to find $x$.`, `${s.st.ms} Bentukkan satu persamaan dan selesaikannya untuk mencari $x$.`), a: T(`$${e.tex}$; $${sol(e)}$`), w: scFull(s), sp: 'm' };
    if (v === 1) return { q: T(`${s.st.en} Find the value of $x$. Check that your answer fits the situation.`, `${s.st.ms} Cari nilai $x$. Semak bahawa jawapan anda sesuai dengan situasi itu.`), a: T(`$${sol(e)}$ (both sides of $${e.tex}$ equal $${tx(lv)}$)`, `$${sol(e)}$ (kedua-dua belah $${e.tex}$ bersamaan $${tx(lv)}$)`), w: scFull(s, subW(e, e.x), eqLine(true)), sp: 'm' };
    return { q: T(`${s.st.en} (a) Write an equation in $x$. (b) Solve the equation. (c) State the value of $x$ in words.`, `${s.st.ms} (a) Tulis satu persamaan dalam $x$. (b) Selesaikan persamaan itu. (c) Nyatakan nilai $x$ dengan perkataan.`), a: T(`(a) $${e.tex}$ (b) $${sol(e)}$ (c) $x$ is ${tx(e.x)}`, `(a) $${e.tex}$ (b) $${sol(e)}$ (c) $x$ ialah ${tx(e.x)}`), w: W(T(`(a) Equation: $${e.tex}$`, `(a) Persamaan: $${e.tex}$`), ...pfx('(b) ', stepsW(e)), T(`(c) The unknown quantity is ${tx(e.x)}.`, `(c) Kuantiti yang tidak diketahui itu ialah ${tx(e.x)}.`)), sp: 'l' };
  };
  const mNum = (r) => {
    const p = phr(r, 4, 11), v = r.int(0, 1);
    return { q: v === 0 ? T(`${p.st.en} Find the number.`, `${p.st.ms} Cari nombor itu.`) : T(`${p.st.en} Form an equation and solve it. What is the value of $x$?`, `${p.st.ms} Bentukkan satu persamaan dan selesaikannya. Apakah nilai $x$?`), a: T(`$${p.tex}$; $x = ${p.x}$`), w: W(...phW(p)), sp: 'm' };
  };
  const mChain = (r) => {
    const c = chain(r, 2), v = r.int(0, 1);
    return { q: v === 0 ? T(`A number $x$ goes through the flow $${c.flow}$. Work backwards to find $x$.`, `Suatu nombor $x$ melalui aliran $${c.flow}$. Bekerja ke belakang untuk mencari $x$.`) : T(`Follow the operations: $${c.flow}$. Write an equation in $x$ and solve it.`, `Ikut operasi: $${c.flow}$. Tulis satu persamaan dalam $x$ dan selesaikannya.`), a: T(`$${c.eq}$; $x = ${c.x}$`), w: chainW(c), sp: 'm' };
  };
  const mFig = (r) => {
    const v = r.int(0, 2), x = r.int(12, 30);
    if (v === 0) {
      const a = r.int(2, 4), c = r.int(1, 3), b = r.int(5, 25), d = 180 - (a + c) * x - b, A = a * x + b;
      need(A > 25 && A < 155 && d > -50 && d < 50 && d !== 0 && c * x + d > 15);
      return { q: T(`The diagram shows a straight line. Find (a) the value of $x$, (b) the size of the smaller angle.`, `Rajah menunjukkan satu garis lurus. Cari (a) nilai $x$, (b) saiz sudut yang lebih kecil.`), fig: F.fan({ rays: [0, A, 180], labels: { 0: `(${lin(a, b)})°`, 1: `(${lin(c, d)})°` }, w: 280, h: 150 }), a: T(`(a) $x = ${x}$ (b) $${Math.min(A, 180 - A)}^\\circ$`), w: W(T('Angles on a straight line add up to $180^\\circ$.', 'Sudut pada satu garis lurus berjumlah $180^\\circ$.'), T(`$(${lin(a, b)}) + (${lin(c, d)}) = 180$`), T(`$${lin(a + c, b + d)} = 180$`), T(`$${a + c}x = ${redu(180, b + d)}$`), T(`$x = \\dfrac{${180 - b - d}}{${a + c}} = ${x}$`), T(`The two angles are $${A}^\\circ$ and $${180 - A}^\\circ$, so the smaller one is $${Math.min(A, 180 - A)}^\\circ$.`, `Kedua-dua sudut itu ialah $${A}^\\circ$ dan $${180 - A}^\\circ$, maka sudut yang lebih kecil ialah $${Math.min(A, 180 - A)}^\\circ$.`)), sp: 'm' };
    }
    if (v === 1) {
      const b1 = r.int(5, 20), b2 = r.int(-10, 10), d = 180 - 4 * x - b1 - b2, A = x + b1, B = 2 * x + b2, C = 180 - A - B;
      need(d > 0 && A > 20 && B > 20 && C > 20);
      return { q: T(`Find (a) the value of $x$, (b) the size of the largest angle of the triangle. (Not drawn to scale.)`, `Cari (a) nilai $x$, (b) saiz sudut terbesar segi tiga itu. (Tidak dilukis mengikut skala.)`), fig: F.triangle({ a: A, b: B, angles: { A: `(${lin(1, b1)})°`, B: `(${lin(2, b2)})°`, C: `(${lin(1, d)})°` } }), a: T(`(a) $x = ${x}$ (b) $${Math.max(A, B, C)}^\\circ$`), w: W(T('The three angles of a triangle add up to $180^\\circ$.', 'Tiga sudut sebuah segi tiga berjumlah $180^\\circ$.'), T(`$(${lin(1, b1)}) + (${lin(2, b2)}) + (${lin(1, d)}) = 180$`), T(`$${lin(4, b1 + b2 + d)} = 180$`), T(`$4x = ${redu(180, b1 + b2 + d)}$`), T(`$x = \\dfrac{${180 - b1 - b2 - d}}{4} = ${x}$`), T(`The angles are $${A}^\\circ$, $${B}^\\circ$ and $${C}^\\circ$, so the largest is $${Math.max(A, B, C)}^\\circ$.`, `Sudut-sudut itu ialah $${A}^\\circ$, $${B}^\\circ$ dan $${C}^\\circ$, maka yang terbesar ialah $${Math.max(A, B, C)}^\\circ$.`)), sp: 'm' };
    }
    const a = r.int(2, 4), b = r.int(1, 6), c = r.int(1, 8), P = (a * x + b) + (x + c) + (2 * x - 3);
    return { q: T(`The perimeter of the triangle is ${P} cm. Find $x$ and the length of the longest side.`, `Perimeter segi tiga itu ialah ${P} cm. Cari $x$ dan panjang sisi yang terpanjang.`), fig: F.triangle({ a: 60, b: 55, sides: { AB: `(${lin(1, c)}) cm`, BC: `(${lin(2, -3)}) cm`, AC: `(${lin(a, b)}) cm` } }), a: T(`$x = ${x}$; longest side $${Math.max(a * x + b, x + c, 2 * x - 3)}$ cm`, `$x = ${x}$; sisi terpanjang $${Math.max(a * x + b, x + c, 2 * x - 3)}$ cm`), w: W(T('The perimeter is the sum of the three sides.', 'Perimeter ialah hasil tambah ketiga-tiga sisi.'), T(`$(${lin(a, b)}) + (${lin(1, c)}) + (${lin(2, -3)}) = ${P}$`), T(`$${lin(a + 3, b + c - 3)} = ${P}$`), T(`$${a + 3}x = ${redu(P, b + c - 3)}$`), T(`$x = \\dfrac{${P - b - c + 3}}{${a + 3}} = ${x}$`), T(`The sides are $${a * x + b}$ cm, $${x + c}$ cm and $${2 * x - 3}$ cm, so the longest is $${Math.max(a * x + b, x + c, 2 * x - 3)}$ cm.`, `Sisi-sisinya ialah $${a * x + b}$ cm, $${x + c}$ cm dan $${2 * x - 3}$ cm, maka yang terpanjang ialah $${Math.max(a * x + b, x + c, 2 * x - 3)}$ cm.`)), sp: 'm' };
  };
  const gm62 = [mSolve, mMc, mErr, mSc2, mNum, mChain, mFig];

  const aSolve = (r) => {
    const v = r.int(0, 2);
    if (v === 0) { const e = eqn(r, r.pick(['two', 'both', 'neg', 'brk']), { frac: true }); return { q: T(`Solve $${e.tex}$. Give your answer as a fraction in its simplest form.`, `Selesaikan $${e.tex}$. Berikan jawapan sebagai pecahan dalam bentuk termudah.`), a: xans(e), w: W(...stepsW(e)), sp: 'm' }; }
    if (v === 1) { const e = eqn(r, r.pick(ADVK), {}); return { q: T(`Solve the equation $${e.tex}$.`, `Selesaikan persamaan $${e.tex}$.`), a: xans(e), w: W(...stepsW(e)), sp: 'm' }; }
    const e = eqn(r, r.pick(['fr4', 'fr5', 'frac2', 'fr3']), {});
    return { q: T(`Solve $${e.tex}$ by first multiplying both sides by a common multiple of the denominators.`, `Selesaikan $${e.tex}$ dengan mendarab kedua-dua belah dengan gandaan sepunya bagi penyebut-penyebut terlebih dahulu.`), a: xans(e), w: W(...stepsW(e)), sp: 'l' };
  };
  const aMc = (r) => {
    const e = eqn(r, r.pick(ADVK.concat(['fr5', 'frac2'])), {}), o = opts(r, sol(e), wrongSols(e).map((v) => `x = ${tx(v)}`));
    return { q: T(`Which is the solution of $${e.tex}$?<br>${o.list}`, `Yang manakah penyelesaian bagi $${e.tex}$?<br>${o.list}`), a: mcqA(o), w: W(...stepsW(e)), sp: 'm' };
  };
  const aSc2 = (r) => {
    const s = r.pick(SCm.concat(SCa))(r), e = s.e, v = r.int(0, 3), [lv] = ev(e, e.x);
    if (v === 3) { const w = Fr.add(e.x, Q(r.pick([-2, -1, 1, 2]))), [l2, r2] = ev(e, w); return { q: T(`${s.st.en} Show that $x = ${tx(w)}$ is not the correct value, then find the correct value of $x$.`, `${s.st.ms} Tunjukkan bahawa $x = ${tx(w)}$ bukan nilai yang betul, kemudian cari nilai $x$ yang betul.`), a: T(`Equation $${e.tex}$: at $x = ${tx(w)}$ the sides are $${tx(l2)}$ and $${tx(r2)}$, which differ. Correct value: $${sol(e)}$`, `Persamaan $${e.tex}$: pada $x = ${tx(w)}$ kedua-dua belah ialah $${tx(l2)}$ dan $${tx(r2)}$, yang berbeza. Nilai yang betul: $${sol(e)}$`), w: W(T(`Equation: $${e.tex}$`, `Persamaan: $${e.tex}$`), subW(e, w), eqLine(false), ...stepsW(e)), sp: 'm' }; }
    if (v === 0) return { q: T(`${s.st.en} Form an equation and solve it to find $x$.`, `${s.st.ms} Bentukkan satu persamaan dan selesaikannya untuk mencari $x$.`), a: T(`$${e.tex}$; $${sol(e)}$`), w: scFull(s), sp: 'm' };
    if (v === 1) return { q: T(`${s.st.en} (a) Form an equation. (b) Solve it and verify your answer by substitution.`, `${s.st.ms} (a) Bentukkan satu persamaan. (b) Selesaikannya dan sahkan jawapan anda dengan penggantian.`), a: T(`(a) $${e.tex}$ (b) $${sol(e)}$; both sides $= ${tx(lv)}$`, `(a) $${e.tex}$ (b) $${sol(e)}$; kedua-dua belah $= ${tx(lv)}$`), w: W(T(`(a) Equation: $${e.tex}$`, `(a) Persamaan: $${e.tex}$`), ...pfx('(b) ', stepsW(e)), subW(e, e.x), eqLine(true)), sp: 'l' };
    const m = r.int(2, 4), c = r.int(1, 9);
    return { q: T(`${s.st.en} Form and solve an equation to find $x$. Hence find the value of $${lin(m, c)}$.`, `${s.st.ms} Bentukkan dan selesaikan satu persamaan untuk mencari $x$. Seterusnya cari nilai $${lin(m, c)}$.`), a: T(`$${e.tex}$; $${sol(e)}$; $${tx(Fr.add(Fr.mul(Q(m), e.x), Q(c)))}$`), w: scFull(s, T(`$${lin(m, c)} = ${m}(${tx(e.x)}) + ${c} = ${tx(Fr.add(Fr.mul(Q(m), e.x), Q(c)))}$`)), sp: 'l' };
  };
  const aChain = (r) => {
    const c = chain(r, 3);
    return { q: T(`A number $x$ is changed as shown: $${c.flow}$. (a) Write an equation in $x$. (b) Solve it.`, `Suatu nombor $x$ diubah seperti yang ditunjukkan: $${c.flow}$. (a) Tulis satu persamaan dalam $x$. (b) Selesaikannya.`), a: T(`(a) $${c.eq}$ (b) $x = ${c.x}$`), w: chainW(c), sp: 'm' };
  };
  const aCompare = (r) => {
    const e1 = eqn(r, r.pick(MEDK.concat(ADVK)), {}), e2 = eqn(r, r.pick(MEDK.concat(ADVK)), {});
    need(!Fr.eq(e1.x, e2.x));
    const big = Fr.cmp(e1.x, e2.x) > 0, d = Fr.sub(big ? e1.x : e2.x, big ? e2.x : e1.x);
    return { q: T(`(a) Solve $${e1.tex}$. (b) Solve $${e2.tex}$. (c) Which equation has the larger solution, and by how much?`, `(a) Selesaikan $${e1.tex}$. (b) Selesaikan $${e2.tex}$. (c) Persamaan yang manakah mempunyai penyelesaian yang lebih besar, dan berapakah bezanya?`), a: T(`(a) $${sol(e1)}$ (b) $${sol(e2)}$ (c) ${big ? 'the first' : 'the second'}, by $${tx(d)}$`, `(a) $${sol(e1)}$ (b) $${sol(e2)}$ (c) ${big ? 'yang pertama' : 'yang kedua'}, dengan beza $${tx(d)}$`), w: W(...pfx('(a) ', stepsW(e1)), ...pfx('(b) ', stepsW(e2)), T(`(c) The solutions are $${tx(e1.x)}$ and $${tx(e2.x)}$; the ${big ? 'first' : 'second'} is larger, by $${tx(d)}$.`, `(c) Penyelesaiannya ialah $${tx(e1.x)}$ dan $${tx(e2.x)}$; yang ${big ? 'pertama' : 'kedua'} lebih besar, dengan beza $${tx(d)}$.`)), sp: 'l' };
  };
  const aFindK = (r) => {
    const t = r.int(2, 7), k = r.int(2, 6), b = r.int(1, 9), c = k * t + b, m = r.int(1, 8), x2 = r.int(2, 9), n_ = k * x2 - m;
    return { q: T(`(a) Given that $x = ${t}$ is a solution of $kx + ${b} = ${c}$, find the value of $k$. (b) Using this value of $k$, solve $kx - ${m} = ${n_}$.`, `(a) Diberi $x = ${t}$ ialah satu penyelesaian bagi $kx + ${b} = ${c}$, cari nilai $k$. (b) Dengan menggunakan nilai $k$ ini, selesaikan $kx - ${m} = ${n_}$.`), a: T(`(a) $k = ${k}$ (b) $x = ${x2}$`), w: W(T(`(a) Substitute $x = ${t}$: $${t}k + ${b} = ${c}$`, `(a) Gantikan $x = ${t}$: $${t}k + ${b} = ${c}$`), T(`$${t}k = ${redu(c, b)}$`), T(`$k = \\dfrac{${k * t}}{${t}} = ${k}$`), T(`(b) $${k}x - ${m} = ${n_}$`), T(`$${k}x = ${n_} + ${m} = ${k * x2}$`), T(`$x = \\dfrac{${k * x2}}{${k}} = ${x2}$`)), sp: 'm' };
  };
  const aEqual = (r) => {
    const e = eqn(r, r.pick(['both', 'brkb', 'brk2', 'fr4']), {}), [A, B] = e.tex.split(' = ');
    return { q: T(`For what value of $x$ are the expressions $${A}$ and $${B}$ equal?`, `Bagi nilai $x$ yang manakah ungkapan $${A}$ dan $${B}$ adalah sama?`), a: xans(e), w: W(...stepsW(e)), sp: 'm' };
  };
  const aErr = (r) => {
    const a = r.int(2, 5), c = r.int(2, 5), p = r.int(2, 5), x = r.int(1, 6);
    need(a !== c);
    const b = r.int(1, 8), d = a * (x + b) - c * x; need(d > 0);
    return { q: T(`Ravi solves $${a}(x + ${b}) = ${lin(c, d)}$ and gets $x = ${tx(Q(d - b, a - c))}$. Solve the equation correctly and explain the mistake.`, `Ravi menyelesaikan $${a}(x + ${b}) = ${lin(c, d)}$ dan mendapat $x = ${tx(Q(d - b, a - c))}$. Selesaikan persamaan itu dengan betul dan terangkan kesilapannya.`), a: T(`$x = ${x}$. He forgot to multiply ${b} by ${a} when expanding the bracket: $${a}x + ${a * b} = ${lin(c, d)}$.`, `$x = ${x}$. Dia terlupa mendarab ${b} dengan ${a} semasa mengembangkan kurungan: $${a}x + ${a * b} = ${lin(c, d)}$.`), w: W(T(`The bracket must be expanded as $${a}(x + ${b}) = ${a}x + ${a * b}$: ${a} multiplies both terms.`, `Kurungan mesti dikembangkan sebagai $${a}(x + ${b}) = ${a}x + ${a * b}$: ${a} mendarab kedua-dua sebutan.`), ...stepsW(EO([a, a * b], [c, d], `${a}(x + ${b}) = ${lin(c, d)}`))), sp: 'm' };
  };
  const aFig2 = (r) => {
    const v = r.int(0, 1), x = r.int(10, 25);
    if (v === 0) {
      const a = r.int(2, 3), b = r.int(-10, 10), A = a * x + b, C = 180 - 2 * A;
      need(A > 35 && A < 80 && C > 20);
      return { q: T(`The triangle is isosceles. Find the value of $x$ and the size of each of the two equal angles. (Not drawn to scale.)`, `Segi tiga itu ialah segi tiga sama kaki. Cari nilai $x$ dan saiz setiap satu daripada dua sudut yang sama itu. (Tidak dilukis mengikut skala.)`), fig: F.triangle({ a: A, b: A, angles: { A: `(${lin(a, b)})°`, B: `(${lin(1, x + b + (a - 1) * x - x)})°`.replace(/^.*$/, `(${lin(a, b)})°`), C: `${C}°` }, ticks: { AC: 1, BC: 1 } }), a: T(`$2(${lin(a, b)}) + ${C} = 180$; $x = ${x}$; each equal angle $= ${A}^\\circ$`, `$2(${lin(a, b)}) + ${C} = 180$; $x = ${x}$; setiap sudut yang sama $= ${A}^\\circ$`), w: W(T('The two base angles of an isosceles triangle are equal, and the three angles add up to $180^\\circ$.', 'Dua sudut tapak segi tiga sama kaki adalah sama, dan ketiga-tiga sudut berjumlah $180^\\circ$.'), T(`$2(${lin(a, b)}) + ${C} = 180$`), T(`$${lin(2 * a, 2 * b)} = ${redu(180, C)}$`), T(`$${2 * a}x = ${redu(180 - C, 2 * b)}$`), T(`$x = \\dfrac{${180 - C - 2 * b}}{${2 * a}} = ${x}$`), T(`Each equal angle $= ${a}(${x}) ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${A}^\\circ$.`, `Setiap sudut yang sama $= ${a}(${x}) ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${A}^\\circ$.`)), sp: 'm' };
    }
    const a = r.int(2, 4), b = r.int(1, 6), c = r.int(1, 8), P = 2 * (a * x + b) + 2 * (x + c);
    return { q: T(`A rectangle has length $(${lin(a, b)})$ cm and width $(${lin(1, c)})$ cm, and its perimeter is ${P} cm. Find $x$, then find the area of the rectangle.`, `Sebuah segi empat tepat mempunyai panjang $(${lin(a, b)})$ cm dan lebar $(${lin(1, c)})$ cm, dan perimeternya ${P} cm. Cari $x$, kemudian cari luas segi empat tepat itu.`), a: T(`$x = ${x}$; area $= ${(a * x + b) * (x + c)}$ cm$^2$`, `$x = ${x}$; luas $= ${(a * x + b) * (x + c)}$ cm$^2$`), w: W(T('Perimeter of a rectangle $= 2 \\times$ (length $+$ width).', 'Perimeter segi empat tepat $= 2 \\times$ (panjang $+$ lebar).'), T(`$2(${lin(a, b)}) + 2(${lin(1, c)}) = ${P}$`), T(`$${lin(2 * a + 2, 2 * b + 2 * c)} = ${P}$`), T(`$${2 * a + 2}x = ${redu(P, 2 * b + 2 * c)}$`), T(`$x = \\dfrac{${P - 2 * b - 2 * c}}{${2 * a + 2}} = ${x}$`), T(`Length $= ${a * x + b}$ cm and width $= ${x + c}$ cm, so the area $= ${a * x + b} \\times ${x + c} = ${(a * x + b) * (x + c)}$ cm$^2$.`, `Panjang $= ${a * x + b}$ cm dan lebar $= ${x + c}$ cm, maka luas $= ${a * x + b} \\times ${x + c} = ${(a * x + b) * (x + c)}$ cm$^2$.`)), sp: 'm' };
  };
  const ga62 = [aSolve, aMc, aSc2, aChain, aCompare, aFindK, aEqual, aErr, aFig2];
  /* more 6.2 families */
  const NUMK = [
    [T('consecutive integers', 'integer berturut-turut'), 1, (x) => x],
    [T('consecutive even numbers', 'nombor genap berturut-turut'), 2, (x) => 2 * x],
    [T('consecutive odd numbers', 'nombor ganjil berturut-turut'), 2, (x) => 2 * x + 1],
    [T('consecutive multiples of 5', 'gandaan 5 berturut-turut'), 5, (x) => 5 * x],
  ];
  const eBox = (r) => {
    const a = r.int(2, 9), x = r.int(2, 12), k = r.int(0, 3);
    const Q4 = [
      [`\\square + ${a} = ${x + a}`, T('Find the number that goes in the box.', 'Cari nombor yang perlu diisi dalam petak.'), `\\square = ${x + a} - ${a} = ${x}`, T('adding', 'penambahan'), T('subtract', 'tolak')],
      [`${a} \\times \\square = ${a * x}`, T('What number should replace the box?', 'Apakah nombor yang menggantikan petak?'), `\\square = ${a * x} \\div ${a} = ${x}`, T('multiplying', 'pendaraban'), T('divide', 'bahagi')],
      [`\\square - ${a} = ${x}`, T('Write the missing number.', 'Tulis nombor yang hilang.'), `\\square = ${x} + ${a} = ${x + a}`, T('subtracting', 'penolakan'), T('add', 'tambah')],
      [`\\square \\div ${a} = ${x}`, T('Use inverse operations to find the missing number.', 'Gunakan operasi songsang untuk mencari nombor yang hilang.'), `\\square = ${x} \\times ${a} = ${x * a}`, T('dividing', 'pembahagian'), T('multiply', 'darab')],
    ];
    const ans = [x, x, x + a, x * a][k];
    return { q: T(`$${Q4[k][0]}$. ${Q4[k][1].en}`, `$${Q4[k][0]}$. ${Q4[k][1].ms}`), a: T(`$${ans}$`), w: W(T(`The box is changed by ${Q4[k][3].en} $${a}$, so undo it: ${Q4[k][4].en} $${a}$.`, `Petak itu diubah dengan ${Q4[k][3].ms} $${a}$, maka songsangkannya: ${Q4[k][4].ms} $${a}$.`), T(`$${Q4[k][2]}$`)), sp: 'xs' };
  };
  const eCheck3 = (r) => {
    const e = eqn(r, r.pick(EASYK), { pos: true }), x = e.x.n, c = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter((k) => k !== x), 2).concat([x]).sort((p, q) => p - q);
    return { q: T(`One of the numbers $${c.join(',\\ ')}$ is the solution of $${e.tex}$. Use inverse operations to solve the equation, then state which number it is.`, `Salah satu nombor $${c.join(',\\ ')}$ ialah penyelesaian bagi $${e.tex}$. Gunakan operasi songsang untuk menyelesaikan persamaan itu, kemudian nyatakan nombor yang mana satu.`), a: T(`$${sol(e)}$`), w: W(...stepsW(e), T(`Of the numbers listed, only $${x}$ is the solution.`, `Antara nombor yang disenaraikan, hanya $${x}$ ialah penyelesaiannya.`)), sp: 's' };
  };
  const mFirst = (r) => {
    const e = eqn(r, 'both', { pos: true }), a = e.l[0].n, c = e.r[0].n, b = e.l[1].n, d = e.r[1].n;
    need(a > c && c > 0 && b !== 0 && d !== 0);
    const good = T(`Subtract $${c}x$ from both sides to collect the $x$ terms on the left`, `Tolak $${c}x$ daripada kedua-dua belah untuk mengumpulkan sebutan $x$ di sebelah kiri`);
    const bad = [T(`Add $${c}x$ to both sides`, `Tambah $${c}x$ pada kedua-dua belah`), T(`Divide both sides by ${a}`, `Bahagi kedua-dua belah dengan ${a}`), T(`Subtract $${c}x$ from the right-hand side only`, `Tolak $${c}x$ daripada sebelah kanan sahaja`)];
    const o = optsT(r, good, bad);
    return { q: T(`To solve $${e.tex}$, which is a correct first step?<br>${o.list.en}`, `Untuk menyelesaikan $${e.tex}$, yang manakah langkah pertama yang betul?<br>${o.list.ms}`), a: T(`(${o.key}) ${good.en}; then $${sol(e)}$`, `(${o.key}) ${good.ms}; kemudian $${sol(e)}$`), w: W(cat(T('Correct first step: ', 'Langkah pertama yang betul: '), good), ...stepsW(e), T(`So the answer is (${o.key}).`, `Maka jawapannya ialah (${o.key}).`)), sp: 's' };
  };
  const mCons = (r) => {
    const k = r.pick(NUMK), cnt = r.int(2, 4), st = k[1], x = r.int(2, 14), first = k[2](x);
    const nums = Array.from({ length: cnt }, (_, i) => first + i * st), total = nums.reduce((p, q) => p + q, 0);
    const term = (i) => (i === 0 ? 'x' : `(x + ${i * st})`);
    const eqs = nums.map((_, i) => term(i)).join(' + ');
    const wordC = [T('two', 'dua'), T('two', 'dua'), T('three', 'tiga'), T('four', 'empat')][cnt - 1];
    const v = r.int(0, 1);
    return { q: v === 0 ? T(`The sum of ${wordC.en} ${k[0].en} is ${total}. Let the smallest be $x$, form an equation and find the numbers.`, `Hasil tambah ${wordC.ms} ${k[0].ms} ialah ${total}. Andaikan yang terkecil ialah $x$, bentukkan satu persamaan dan cari nombor-nombor itu.`) : T(`Find ${wordC.en} ${k[0].en} whose sum is ${total}.`, `Cari ${wordC.ms} ${k[0].ms} yang hasil tambahnya ${total}.`), a: T(`$${eqs} = ${total}$; ${nums.join(', ')}`), w: W(T(`Write the numbers as ${nums.map((_, i) => `$${term(i)}$`).join(', ')}.`, `Tulis nombor-nombor itu sebagai ${nums.map((_, i) => `$${term(i)}$`).join(', ')}.`), T(`$${eqs} = ${total}$`), T(`$${lin(cnt, (st * cnt * (cnt - 1)) / 2)} = ${total}$`), T(`$${cnt}x = ${redu(total, (st * cnt * (cnt - 1)) / 2)}$`), T(`$x = \\dfrac{${total - (st * cnt * (cnt - 1)) / 2}}{${cnt}} = ${first}$`), T(`The numbers are ${nums.join(', ')}.`, `Nombor-nombor itu ialah ${nums.join(', ')}.`)), sp: 'm' };
  };
  const aCons = (r) => {
    const k = r.pick(NUMK.slice(0, 3)), st = k[1], x = r.int(3, 14), first = k[2](x), c = r.int(2, 4), m = (c - 1) * first - 2 * st;
    need(m > 0 && c > 1);
    return { q: T(`Three ${k[0].en} are such that the largest is ${m} less than ${c} times the smallest. Let the smallest be $x$. Form an equation and find the three numbers.`, `Tiga ${k[0].ms} dengan keadaan nombor yang terbesar ialah ${m} kurang daripada ${c} kali nombor yang terkecil. Andaikan yang terkecil ialah $x$. Bentukkan satu persamaan dan cari ketiga-tiga nombor itu.`), a: T(`$x + ${2 * st} = ${c}x - ${m}$; ${first}, ${first + st}, ${first + 2 * st}`), w: W(T(`The three numbers are $x$, $x + ${st}$ and $x + ${2 * st}$.`, `Ketiga-tiga nombor itu ialah $x$, $x + ${st}$ dan $x + ${2 * st}$.`), T(`$x + ${2 * st} = ${c}x - ${m}$`), T(`$${c}x - x = ${2 * st} + ${m}$`), T(`$${cn(c - 1)}x = ${2 * st + m}$`), ...(c - 1 === 1 ? [] : [T(`$x = \\dfrac{${2 * st + m}}{${c - 1}} = ${first}$`)]), T(`The numbers are ${first}, ${first + st} and ${first + 2 * st}.`, `Nombor-nombor itu ialah ${first}, ${first + st} dan ${first + 2 * st}.`)), sp: 'm' };
  };
  ge62.push(eBox, eCheck3);
  gm62.push(mFirst, mCons);
  ga62.push(aCons);
  SPM.extend('F1-6.2', { e: ge62, m: gm62, a: ga62 });

  
  /* ================================================================ 6.3 */
  /* two-variable stories: st defines $x$ and $y$; a x + b y = c ; (x0, y0) is a genuine solution; nx / ny name the objects */
  const S2 = (st, a, b, x0, y0, nx, ny, rest) => Object.assign({ st, a, b, x0, y0, c: a * x0 + b * y0, nx, ny, tex: eq2(a, b, a * x0 + b * y0) }, rest || {});
  const SC2 = [
    (r) => { const it = r.pick(NB), jt = r.pick(NB.filter((z) => z !== it)), p = r.int(it.lo, it.hi), q = r.int(jt.lo, jt.hi), x0 = r.int(1, 6), y0 = r.int(1, 6), nm = r.name(); need(p !== q); return S2(T(`${nm} buys $x$ ${it.en} at RM${p} each and $y$ ${jt.en} at RM${q} each. The total cost is RM${p * x0 + q * y0}.`, `${nm} membeli $x$ ${it.ms} pada harga RM${p} setiap satu dan $y$ ${jt.ms} pada harga RM${q} setiap satu. Jumlah kos ialah RM${p * x0 + q * y0}.`), p, q, x0, y0, T(it.en, it.ms), T(jt.en, jt.ms)); },
    (r) => { const x0 = r.int(2, 9), y0 = r.int(2, 9), nm = r.name(); return S2(T(`${nm} has $x$ 20-sen coins and $y$ 50-sen coins with a total value of ${20 * x0 + 50 * y0} sen.`, `${nm} mempunyai $x$ keping syiling 20 sen dan $y$ keping syiling 50 sen dengan jumlah nilai ${20 * x0 + 50 * y0} sen.`), 20, 50, x0, y0, T('20-sen coins', 'syiling 20 sen'), T('50-sen coins', 'syiling 50 sen')); },
    (r) => { const an = r.pick([[T('chickens', 'ayam'), T('goats', 'kambing'), 2, 4], [T('ducks', 'itik'), T('cows', 'lembu'), 2, 4], [T('chickens', 'ayam'), T('rabbits', 'arnab'), 2, 4]]), x0 = r.int(3, 12), y0 = r.int(2, 9); return S2(T(`A farm has $x$ ${an[0].en} and $y$ ${an[1].en}. Together they have ${2 * x0 + 4 * y0} legs.`, `Sebuah ladang mempunyai $x$ ekor ${an[0].ms} dan $y$ ekor ${an[1].ms}. Kesemuanya mempunyai ${2 * x0 + 4 * y0} kaki.`), 2, 4, x0, y0, an[0], an[1]); },
    (r) => { const a = r.int(8, 20), b = r.int(3, a - 2), x0 = r.int(2, 8), y0 = r.int(2, 8); return S2(T(`A cinema sells $x$ adult tickets at RM${a} each and $y$ child tickets at RM${b} each, collecting RM${a * x0 + b * y0}.`, `Sebuah panggung wayang menjual $x$ keping tiket dewasa pada harga RM${a} sekeping dan $y$ keping tiket kanak-kanak pada harga RM${b} sekeping, dan mengutip RM${a * x0 + b * y0}.`), a, b, x0, y0, T('adult tickets', 'tiket dewasa'), T('child tickets', 'tiket kanak-kanak')); },
    (r) => { const x0 = r.int(2, 9), y0 = r.int(2, 9); return S2(T(`A van carries $x$ small boxes of mass 3 kg and $y$ large boxes of mass 5 kg. The total mass of the boxes is ${3 * x0 + 5 * y0} kg.`, `Sebuah van membawa $x$ kotak kecil berjisim 3 kg dan $y$ kotak besar berjisim 5 kg. Jumlah jisim kotak-kotak itu ialah ${3 * x0 + 5 * y0} kg.`), 3, 5, x0, y0, T('small boxes', 'kotak kecil'), T('large boxes', 'kotak besar')); },
    (r) => { const x0 = r.int(1, 4), y0 = r.int(1, 6); return S2(T(`A school hires $x$ buses of 40 seats and $y$ vans of 12 seats. Every seat is taken by ${40 * x0 + 12 * y0} students.`, `Sebuah sekolah menyewa $x$ buah bas 40 tempat duduk dan $y$ buah van 12 tempat duduk. Semua tempat duduk diduduki oleh ${40 * x0 + 12 * y0} orang murid.`), 40, 12, x0, y0, T('buses', 'bas'), T('vans', 'van')); },
    (r) => { const x0 = r.int(6, 30), y0 = r.int(3, x0 - 1); return S2(T(`The sum of two numbers $x$ and $y$ is ${x0 + y0}.`, `Hasil tambah dua nombor $x$ dan $y$ ialah ${x0 + y0}.`), 1, 1, x0, y0, T('the first number', 'nombor pertama'), T('the second number', 'nombor kedua')); },
    (r) => { const [n1, n2] = r.pair(), x0 = r.int(45, 70), y0 = r.int(35, 44); return S2(T(`${n1}'s mass is $x$ kg and ${n2}'s mass is $y$ kg. ${n1} is ${x0 - y0} kg heavier than ${n2}.`, `Jisim ${n1} ialah $x$ kg dan jisim ${n2} ialah $y$ kg. ${n1} lebih berat ${x0 - y0} kg daripada ${n2}.`), 1, -1, x0, y0, T(`${n1}'s mass`, `jisim ${n1}`), T(`${n2}'s mass`, `jisim ${n2}`)); },
    (r) => { const y0 = r.int(3, 12); return S2(T(`In a class, the number of boys is $x$ and the number of girls is $y$. There are twice as many boys as girls.`, `Dalam sebuah kelas, bilangan murid lelaki ialah $x$ dan bilangan murid perempuan ialah $y$. Bilangan murid lelaki ialah dua kali ganda bilangan murid perempuan.`), 1, -2, 2 * y0, y0, T('boys', 'murid lelaki'), T('girls', 'murid perempuan')); },
    (r) => { const x0 = r.int(4, 20), y0 = r.int(3, 15); return S2(T(`A rectangle has length $x$ cm and width $y$ cm. Its perimeter is ${2 * (x0 + y0)} cm.`, `Sebuah segi empat tepat mempunyai panjang $x$ cm dan lebar $y$ cm. Perimeternya ialah ${2 * (x0 + y0)} cm.`), 2, 2, x0, y0, T('length', 'panjang'), T('width', 'lebar')); },
    (r) => { const x0 = r.int(1, 5), y0 = r.int(1, 4); return S2(T(`${r.name()} walks for $x$ hours at 5 km/h and then cycles for $y$ hours at 15 km/h. The total distance covered is ${5 * x0 + 15 * y0} km.`, `${r.name()} berjalan kaki selama $x$ jam pada 5 km/j dan kemudian berbasikal selama $y$ jam pada 15 km/j. Jumlah jarak yang dilalui ialah ${5 * x0 + 15 * y0} km.`), 5, 15, x0, y0, T('hours walking', 'jam berjalan kaki'), T('hours cycling', 'jam berbasikal')); },
    (r) => { const x0 = r.int(2, 9), y0 = r.int(2, 9); return S2(T(`A cashier has $x$ RM5 notes and $y$ RM10 notes, worth RM${5 * x0 + 10 * y0} altogether.`, `Seorang juruwang mempunyai $x$ keping wang kertas RM5 dan $y$ keping wang kertas RM10, bernilai RM${5 * x0 + 10 * y0} semuanya.`), 5, 10, x0, y0, T('RM5 notes', 'wang kertas RM5'), T('RM10 notes', 'wang kertas RM10')); },
    (r) => { const x0 = r.int(3, 10), y0 = r.int(2, 8); return S2(T(`A snack has $x$ apple slices of 50 kcal each and $y$ banana slices of 90 kcal each, giving ${50 * x0 + 90 * y0} kcal in all.`, `Sebuah snek mengandungi $x$ kepingan epal yang masing-masing 50 kkal dan $y$ kepingan pisang yang masing-masing 90 kkal, memberi ${50 * x0 + 90 * y0} kkal kesemuanya.`), 50, 90, x0, y0, T('apple slices', 'kepingan epal'), T('banana slices', 'kepingan pisang')); },
    (r) => { const x0 = r.int(4, 12), y0 = r.int(3, 10); need(y0 !== x0); return S2(T(`An isosceles triangle has two equal sides of length $x$ cm and a base of length $y$ cm. Its perimeter is ${2 * x0 + y0} cm.`, `Sebuah segi tiga sama kaki mempunyai dua sisi sama panjang $x$ cm dan tapak sepanjang $y$ cm. Perimeternya ialah ${2 * x0 + y0} cm.`), 2, 1, x0, y0, T('equal sides', 'sisi sama panjang'), T('base', 'tapak')); },
  ];
  /* alternative ways of writing a x + b y = c (all equivalent) */
  const forms2 = (a, b, c) => {
    const o = [eq2(a, b, c)];
    if (ab(b) === 1) o.push(`y = ${poly([[-a / b, 'x'], [c / b, '']])}`);
    if (ab(a) === 1) o.push(`x = ${poly([[-b / a, 'y'], [c / a, '']])}`);
    return o;
  };
  const yOf = (a, b, c, x) => Fr.div(Fr.sub(Q(c), Q(a * x)), Q(b));
  const xOf = (a, b, c, y) => Fr.div(Fr.sub(Q(c), Q(b * y)), Q(a));
  const pairSol = (r, o) => { o = o || {}; const x0 = r.int(o.lo === undefined ? -3 : o.lo, o.hi || 6), y0 = r.int(o.lo === undefined ? -3 : o.lo, o.hi || 6), a = r.nz(o.pos ? 1 : -4, 4), b = r.nz(o.pos ? 1 : -4, 4); return { a, b, x0, y0, c: a * x0 + b * y0 }; };
  const ptS = (x, y) => `(${x}, ${y})`;
  const eFindY = (r) => {
    const p = pairSol(r, { pos: true, lo: 0 }), b1 = r.pick([1, -1]), a = p.a, c = a * p.x0 + b1 * p.y0, F = forms2(a, b1, c), x = r.int(0, 5), y = yOf(a, b1, c, x), v = r.int(0, 2);
    const E = r.pick(F);
    const std = eq2(a, b1, c), pre = E === std ? [] : [T(`Write the equation as $${std}$.`, `Tulis persamaan itu sebagai $${std}$.`)];
    const subY = (xv, L) => W(...pre, T(`Substitute $x = ${xv}$: $${cn(a)}(${xv}) ${b1 < 0 ? '-' : '+'} y = ${c}$`, `Gantikan $x = ${xv}$: $${cn(a)}(${xv}) ${b1 < 0 ? '-' : '+'} y = ${c}$`), T(`$${cn(b1)}y = ${redu(c, a * xv)}$`), T(`$${L} = ${tx(yOf(a, b1, c, xv))}$`));
    const subX = (yv) => W(...pre, T(`Substitute $y = ${yv}$: $${cn(a)}x ${b1 < 0 ? '-' : '+'} (${yv}) = ${c}$`, `Gantikan $y = ${yv}$: $${cn(a)}x ${b1 < 0 ? '-' : '+'} (${yv}) = ${c}$`), T(`$${cn(a)}x = ${redu(c, b1 * yv)}$`), T(`$x = ${tx(xOf(a, b1, c, yv))}$`));
    if (v === 0) return { q: T(`Given $${E}$, find the value of $y$ when $x = ${x}$.`, `Diberi $${E}$, cari nilai $y$ apabila $x = ${x}$.`), a: T(`$y = ${tx(y)}$`), w: subY(x, 'y'), sp: 's' };
    if (v === 1) { const yy = r.int(0, 5), xx = xOf(a, b1, c, yy); return { q: T(`When $y = ${yy}$, what is the value of $x$ in $${E}$?`, `Apabila $y = ${yy}$, apakah nilai $x$ dalam $${E}$?`), a: T(`$x = ${tx(xx)}$`), w: subX(yy), sp: 's' }; }
    return { q: T(`The point $(${x}, k)$ satisfies $${E}$. Find $k$.`, `Titik $(${x}, k)$ memenuhi $${E}$. Cari $k$.`), a: T(`$k = ${tx(y)}$`), w: W(T(`The point $(${x}, k)$ means $x = ${x}$ and $y = k$.`, `Titik $(${x}, k)$ bermaksud $x = ${x}$ dan $y = k$.`), subY(x, 'k')), sp: 's' };
  };
  const eTable = (r) => {
    const a = r.pick([1, 2, 3, -1, -2]), b = r.pick([1, -1]), x0 = r.int(0, 4), y0 = r.int(0, 5), c = a * x0 + b * y0, xs = [0, 1, 2, 3], v = r.int(0, 1), E = r.pick(forms2(a, b, c));
    const ys = xs.map((x) => yOf(a, b, c, x));
    if (v === 0) {
      const tab = SPM.table([['$x$', ...xs.map((z) => `$${z}$`)], ['$y$', ...xs.map(() => '')]]);
      return { q: T(`Complete the table of values for $${E}$.<br>${tab}`, `Lengkapkan jadual nilai bagi $${E}$.<br>${tab}`), a: T(`$y = ${ys.map((z) => tx(z)).join(',\\ ')}$`), w: W(T(`Make $y$ the subject: $y = ${poly([[-a / b, 'x'], [c / b, '']])}$`, `Jadikan $y$ perkara rumus: $y = ${poly([[-a / b, 'x'], [c / b, '']])}$`), ...xs.map((z, i) => T(`$x = ${z}$: $y = ${tx(ys[i])}$`))), sp: 's' };
    }
    const yv = ys.map((z) => z.n), tab = SPM.table([['$x$', ...xs.map(() => '')], ['$y$', ...yv.map((z) => `$${z}$`)]]);
    return { q: T(`The table shows values of $y$ for $${E}$. Find the missing values of $x$.<br>${tab}`, `Jadual menunjukkan nilai $y$ bagi $${E}$. Cari nilai $x$ yang hilang.<br>${tab}`), a: T(`$x = ${xs.join(',\\ ')}$`), w: W(T(`Put each value of $y$ into $${eq2(a, b, c)}$ and solve for $x$.`, `Masukkan setiap nilai $y$ ke dalam $${eq2(a, b, c)}$ dan selesaikan untuk $x$.`), ...yv.map((z, i) => T(`$y = ${z}$: $${cn(a)}x = ${redu(c, b * z)}$, $x = ${xs[i]}$`))), sp: 's' };
  };
  const eStmt = (r) => {
    const s = r.int(8, 40), d = r.int(2, 7), k = r.int(2, 5), v = r.int(0, 4);
    const L = [
      [T(`The sum of two numbers $x$ and $y$ is ${s}.`, `Hasil tambah dua nombor $x$ dan $y$ ialah ${s}.`), `x + y = ${s}`, T(`"Sum" means add, so the left-hand side is $x + y$ and "is ${s}" gives $= ${s}$.`, `"Hasil tambah" bermaksud tambah, maka sebelah kiri ialah $x + y$ dan "ialah ${s}" memberi $= ${s}$.`)],
      [T(`The difference between two numbers $x$ and $y$ is ${d}, where $x > y$.`, `Beza antara dua nombor $x$ dan $y$ ialah ${d}, dengan $x > y$.`), `x - y = ${d}`, T(`"Difference" means subtract, and $x$ is the larger, so the left-hand side is $x - y$.`, `"Beza" bermaksud tolak, dan $x$ yang lebih besar, maka sebelah kiri ialah $x - y$.`)],
      [T(`$x$ is ${d} more than $y$.`, `$x$ lebih ${d} daripada $y$.`), `x - y = ${d}`, T(`"${d} more than $y$" means $x = y + ${d}$; taking $y$ to the left gives $x - y = ${d}$.`, `"lebih ${d} daripada $y$" bermaksud $x = y + ${d}$; memindahkan $y$ ke sebelah kiri memberi $x - y = ${d}$.`)],
      [T(`$x$ is ${k} times $y$.`, `$x$ ialah ${k} kali $y$.`), `x - ${k}y = 0`, T(`"${k} times $y$" is $${k}y$, so $x = ${k}y$, that is $x - ${k}y = 0$.`, `"${k} kali $y$" ialah $${k}y$, maka $x = ${k}y$, iaitu $x - ${k}y = 0$.`)],
      [T(`Twice a number $x$ added to ${k} times a number $y$ gives ${s}.`, `Dua kali suatu nombor $x$ ditambah ${k} kali suatu nombor $y$ memberi ${s}.`), `2x + ${k}y = ${s}`, T(`"Twice $x$" is $2x$ and "${k} times $y$" is $${k}y$; added together they give $${s}$.`, `"Dua kali $x$" ialah $2x$ dan "${k} kali $y$" ialah $${k}y$; hasil tambahnya ialah $${s}$.`)],
    ];
    const z = L[v], others = L.filter((q, i) => i !== v).map((q) => q[1]);
    if (r.chance()) return { q: T(`Write an equation for the statement: ${z[0].en}`, `Tulis satu persamaan bagi pernyataan: ${z[0].ms}`), a: T(`$${z[1]}$`), w: W(z[2], T(`The equation is $${z[1]}$.`, `Persamaannya ialah $${z[1]}$.`)), sp: 's' };
    const o = opts(r, z[1], others.concat([`x + y = ${d}`, `${k}x - y = 0`]));
    return { q: T(`Which equation represents the statement "${z[0].en}"?<br>${o.list}`, `Persamaan yang manakah mewakili pernyataan "${z[0].ms}"?<br>${o.list}`), a: mcqA(o), w: W(z[2], T(`So the statement gives $${z[1]}$, which is option (${o.key}).`, `Maka pernyataan itu memberi $${z[1]}$, iaitu pilihan (${o.key}).`)), sp: 's' };
  };
  const eSc3 = (r) => {
    const s = r.pick(SC2)(r), v = r.int(0, 1);
    const tr = T('Translate the information into symbols, keeping the letters the question uses.', 'Terjemahkan maklumat itu kepada simbol, mengekalkan huruf yang digunakan dalam soalan.');
    if (v === 0) return { q: T(`${s.st.en} Write an equation in $x$ and $y$.`, `${s.st.ms} Tulis satu persamaan dalam $x$ dan $y$.`), a: T(`$${s.tex}$`), w: W(tr, T(`Multiply each unknown by the number that goes with it and use the total given: $${s.tex}$`, `Darabkan setiap pemboleh ubah dengan nombor yang sepadan dan gunakan jumlah yang diberi: $${s.tex}$`)), sp: 's' };
    const wr = [eq2(s.b, s.a, s.c), eq2(s.a, s.b, s.c + s.a), eq2(s.a, -s.b, s.c), eq2(s.a, s.b, s.c - s.b)].filter((z) => z !== s.tex);
    const o = opts(r, s.tex, wr);
    return { q: T(`${s.st.en} Which equation represents this situation?<br>${o.list}`, `${s.st.ms} Persamaan yang manakah mewakili situasi ini?<br>${o.list}`), a: mcqA(o), w: W(tr, T(`The situation gives $${s.tex}$, which is option (${o.key}).`, `Situasi itu memberi $${s.tex}$, iaitu pilihan (${o.key}).`)), sp: 's' };
  };
  const eIdent = (r) => {
    const a = r.int(1, 9), b = r.nz(-9, 9), c = r.int(-12, 30), v = r.int(0, 2), E = eq2(a, b, c);
    const A = [[T('the coefficient of $x$', 'pekali bagi $x$'), a], [T('the coefficient of $y$', 'pekali bagi $y$'), b], [T('the constant on the right-hand side', 'pemalar di sebelah kanan'), c]];
    const why = [T(`The coefficient of $x$ is the number multiplying $x$, with its sign.`, `Pekali bagi $x$ ialah nombor yang mendarab $x$, berserta tandanya.`), T(`The coefficient of $y$ is the number multiplying $y$, with its sign.`, `Pekali bagi $y$ ialah nombor yang mendarab $y$, berserta tandanya.`), T(`The constant is the number standing alone on the right of the equals sign.`, `Pemalar ialah nombor yang berdiri sendiri di sebelah kanan tanda sama dengan.`)][v];
    return { q: T(`In the equation $${E}$, state ${A[v][0].en}.`, `Dalam persamaan $${E}$, nyatakan ${A[v][0].ms}.`), a: T(`$${A[v][1]}$`), w: W(why, T(`In $${E}$ it is $${A[v][1]}$.`, `Dalam $${E}$ ia ialah $${A[v][1]}$.`)), sp: 'xs' };
  };
  const eRearr = (r) => {
    const a = r.int(2, 6), b = r.int(2, 6), c = r.int(5, 30), m = r.int(2, 5), k = r.int(1, 9), v = r.int(0, 3);
    const L = [
      [`y = ${lin(m, k)}`, `${m}x - y = ${-k}`], [`${a}x = ${c} - ${b}y`, `${a}x + ${b}y = ${c}`], [`y = ${c} - ${a}x`, `${a}x + y = ${c}`], [`${b}y = ${c} - x`, `x + ${b}y = ${c}`],
    ];
    const HOW = [
      W(T(`Subtract $${m}x$ from both sides: $y - ${m}x = ${k}$`, `Tolak $${m}x$ daripada kedua-dua belah: $y - ${m}x = ${k}$`), T(`Multiply both sides by $-1$ so that the $x$ term comes first: $${m}x - y = ${-k}$`, `Darab kedua-dua belah dengan $-1$ supaya sebutan $x$ berada di hadapan: $${m}x - y = ${-k}$`)),
      W(T(`Add $${b}y$ to both sides: $${a}x + ${b}y = ${c}$`, `Tambah $${b}y$ pada kedua-dua belah: $${a}x + ${b}y = ${c}$`)),
      W(T(`Add $${a}x$ to both sides: $${a}x + y = ${c}$`, `Tambah $${a}x$ pada kedua-dua belah: $${a}x + y = ${c}$`)),
      W(T(`Add $x$ to both sides: $x + ${b}y = ${c}$`, `Tambah $x$ pada kedua-dua belah: $x + ${b}y = ${c}$`)),
    ];
    return { q: T(`Rewrite $${L[v][0]}$ in the form $ax + by = c$.`, `Tulis semula $${L[v][0]}$ dalam bentuk $ax + by = c$.`), a: T(`$${L[v][1]}$ (or any equivalent form)`, `$${L[v][1]}$ (atau sebarang bentuk yang setara)`), w: HOW[v], sp: 's' };
  };
  const eConcept2 = (r) => {
    const a = r.int(2, 5), b = r.int(2, 5), x0 = r.int(1, 4), y0 = r.int(1, 4), c = a * x0 + b * y0;
    const B = [
      [T(`In the ordered pair $(3, 7)$, the value of $y$ is`, `Dalam pasangan tertib $(3, 7)$, nilai $y$ ialah`), T('7', '7'), [T('3', '3'), T('10', '10'), T('21', '21')], T('An ordered pair is written $(x, y)$, so the second number is the value of $y$.', 'Pasangan tertib ditulis $(x, y)$, maka nombor kedua ialah nilai $y$.')],
      [T(`Which of these is a linear equation in two variables?`, `Yang manakah persamaan linear dalam dua pemboleh ubah?`), T(`$${a}x + ${b}y = ${c}$`, `$${a}x + ${b}y = ${c}$`), [T(`$${a}x^2 + y = ${c}$`, `$${a}x^2 + y = ${c}$`), T(`$${a}x + ${b} = ${c}$`, `$${a}x + ${b} = ${c}$`), T(`$xy = ${c}$`, `$xy = ${c}$`)], T('A linear equation in two variables has two different letters, each to the power $1$, and they are not multiplied together.', 'Persamaan linear dalam dua pemboleh ubah mempunyai dua huruf berbeza, masing-masing berkuasa $1$, dan tidak didarab antara satu sama lain.')],
      [T(`The equation $x + y = 10$ has`, `Persamaan $x + y = 10$ mempunyai`), T('infinitely many solutions', 'penyelesaian yang tidak terhingga banyaknya'), [T('exactly one solution', 'tepat satu penyelesaian'), T('no solution', 'tiada penyelesaian'), T('exactly ten solutions', 'tepat sepuluh penyelesaian')], T('Every value of $x$ gives a matching value of $y$: $(1, 9)$, $(2, 8)$, $(3, 7)$, and so on without end.', 'Setiap nilai $x$ memberi satu nilai $y$ yang sepadan: $(1, 9)$, $(2, 8)$, $(3, 7)$, dan seterusnya tanpa henti.')],
      [T(`To check that $(${x0}, ${y0})$ is a solution of $${a}x + ${b}y = ${c}$ we`, `Untuk menyemak bahawa $(${x0}, ${y0})$ ialah penyelesaian bagi $${a}x + ${b}y = ${c}$ kita`), T(`replace $x$ by ${x0} and $y$ by ${y0} and compare with ${c}`, `gantikan $x$ dengan ${x0} dan $y$ dengan ${y0} dan bandingkan dengan ${c}`), [T(`replace $x$ by ${y0} and $y$ by ${x0}`, `gantikan $x$ dengan ${y0} dan $y$ dengan ${x0}`), T(`add ${x0} and ${y0}`, `tambah ${x0} dan ${y0}`), T(`only replace $x$ and ignore $y$`, `gantikan $x$ sahaja dan abaikan $y$`)], T(`Substitution puts $${x0}$ in place of $x$ and $${y0}$ in place of $y$; the pair is a solution only if the left-hand side is then equal to $${c}$.`, `Penggantian meletakkan $${x0}$ menggantikan $x$ dan $${y0}$ menggantikan $y$; pasangan itu ialah penyelesaian hanya jika sebelah kiri kemudiannya sama dengan $${c}$.`)],
    ];
    const z = r.pick(B), o = optsT(r, z[1], z[2]);
    return { q: T(`${z[0].en}<br>${o.list.en}`, `${z[0].ms}<br>${o.list.ms}`), a: T(`(${o.key}) ${z[1].en}`, `(${o.key}) ${z[1].ms}`), w: W(z[3], cat(T(`So the answer is (${o.key}) `, `Maka jawapannya ialah (${o.key}) `), z[1], T('.', '.'))), sp: 's' };
  };
  const ge63 = [eFindY, eTable, eStmt, eSc3, eIdent, eRearr, eConcept2];

    const solsNN = (a, b, c, lo) => { const o = []; for (let x = lo; x <= 80; x++) for (let y = lo; y <= 80; y++) if (a * x + b * y === c) o.push([x, y]); return o; };
  const along = (p, t) => { const g = SPM.gcd(p.a, p.b); return [p.x0 + (p.b / g) * t, p.y0 - (p.a / g) * t]; };
  const cf = (a) => (a === 1 ? '' : a === -1 ? '-' : String(a));
  const mTable2 = (r) => {
    const p = pairSol(r, { lo: -2, hi: 4 }), ts = [-2, -1, 0, 1, 2];
    const pts = ts.map((t) => along(p, t));
    need(pts.every((z) => ab(z[0]) <= 14 && ab(z[1]) <= 14));
    const hide = r.shuffle([0, 1, 2, 3, 4]).slice(0, 4), hx = hide.slice(0, 2), hy = hide.slice(2);
    const cell = (i, k) => ((k === 0 ? hx : hy).includes(i) ? '' : `$${pts[i][k]}$`);
    const tab = SPM.table([['$x$'].concat(pts.map((z, i) => cell(i, 0))), ['$y$'].concat(pts.map((z, i) => cell(i, 1)))]);
    const miss = hide.sort((u, v) => u - v).map((i) => (hx.includes(i) ? `x = ${pts[i][0]}` : `y = ${pts[i][1]}`)).join(',\\ ');
    return { q: T(`Some values are missing from the table for $${eq2(p.a, p.b, p.c)}$. Complete the table.<br>${tab}`, `Sebahagian nilai tiada dalam jadual bagi $${eq2(p.a, p.b, p.c)}$. Lengkapkan jadual itu.<br>${tab}`), a: T(`$${miss}$ (columns from the left)`, `$${miss}$ (lajur dari kiri)`), w: W(T(`In each column put the value that is given into $${eq2(p.a, p.b, p.c)}$ and solve for the other letter.`, `Dalam setiap lajur, masukkan nilai yang diberi ke dalam $${eq2(p.a, p.b, p.c)}$ dan selesaikan untuk huruf yang satu lagi.`), ...hide.map((i) => (hx.includes(i) ? T(`$y = ${pts[i][1]}$: $${cn(p.a)}x = ${redu(p.c, p.b * pts[i][1])}$, so $x = ${pts[i][0]}$`, `$y = ${pts[i][1]}$: $${cn(p.a)}x = ${redu(p.c, p.b * pts[i][1])}$, maka $x = ${pts[i][0]}$`) : T(`$x = ${pts[i][0]}$: $${cn(p.b)}y = ${redu(p.c, p.a * pts[i][0])}$, so $y = ${pts[i][1]}$`, `$x = ${pts[i][0]}$: $${cn(p.b)}y = ${redu(p.c, p.a * pts[i][0])}$, maka $y = ${pts[i][1]}$`)))), sp: 's' };
  };
  const mFindK3 = (r) => {
    const p = pairSol(r, { lo: -3, hi: 5 }), v = r.int(0, 2);
    if (v === 0) { need(p.y0 !== 0); return { q: T(`Given that $(${p.x0}, ${p.y0})$ is a solution of $${cf(p.a)}x + ky = ${p.c}$, find the value of $k$.`, `Diberi $(${p.x0}, ${p.y0})$ ialah satu penyelesaian bagi $${cf(p.a)}x + ky = ${p.c}$, cari nilai $k$.`), a: T(`$k = ${p.b}$`), w: W(T(`Substitute $x = ${p.x0}$ and $y = ${p.y0}$: $${cn(p.a)}${br(p.x0)} + k${br(p.y0)} = ${p.c}$`, `Gantikan $x = ${p.x0}$ dan $y = ${p.y0}$: $${cn(p.a)}${br(p.x0)} + k${br(p.y0)} = ${p.c}$`), T(`$${cn(p.y0)}k = ${redu(p.c, p.a * p.x0)}$`), T(`$k = ${p.b}$`)), sp: 's' }; }
    if (v === 1) { need(p.x0 !== 0); return { q: T(`The ordered pair $(${p.x0}, ${p.y0})$ satisfies $kx ${sg(p.b)} ${ab(p.b)}y = ${p.c}$. Find $k$.`, `Pasangan tertib $(${p.x0}, ${p.y0})$ memenuhi $kx ${sg(p.b)} ${ab(p.b)}y = ${p.c}$. Cari $k$.`), a: T(`$k = ${p.a}$`), w: W(T(`Substitute $x = ${p.x0}$ and $y = ${p.y0}$: $k${br(p.x0)} ${sg(p.b)} ${cn(ab(p.b))}${br(p.y0)} = ${p.c}$`, `Gantikan $x = ${p.x0}$ dan $y = ${p.y0}$: $k${br(p.x0)} ${sg(p.b)} ${cn(ab(p.b))}${br(p.y0)} = ${p.c}$`), T(`$${cn(p.x0)}k = ${redu(p.c, p.b * p.y0)}$`), T(`$k = ${p.a}$`)), sp: 's' }; }
    const E = poly([[p.a, 'x'], [p.b, 'y']]);
    return { q: T(`$(${p.x0}, ${p.y0})$ is a solution of $${E} = c$. Find the constant $c$.`, `$(${p.x0}, ${p.y0})$ ialah satu penyelesaian bagi $${E} = c$. Cari pemalar $c$.`), a: T(`$c = ${p.c}$`), w: W(T(`Substitute $x = ${p.x0}$ and $y = ${p.y0}$ into $${E}$.`, `Gantikan $x = ${p.x0}$ dan $y = ${p.y0}$ ke dalam $${E}$.`), T(`$c = ${cn(p.a)}${br(p.x0)} ${p.b < 0 ? '-' : '+'} ${cn(ab(p.b))}${br(p.y0)} = ${p.c}$`)), sp: 's' };
  };
  const mCtx = (r) => {
    const s = r.pick(SC2)(r), g = SPM.gcd(s.a, s.b), v = r.int(0, 2);
    const t = r.pick([-1, 1, 2]), alt = along(s, t), okAlt = alt[0] >= 0 && alt[1] >= 0;
    let pr, ok, why;
    if (v === 0) { pr = [s.x0, s.y0]; ok = true; why = T('It satisfies the equation and both values are whole numbers that are not negative.', 'Ia memenuhi persamaan dan kedua-dua nilai ialah nombor bulat yang tidak negatif.'); }
    else if (v === 1) { pr = [s.x0 + 1, s.y0]; ok = false; why = T(`The equation gives ${s.a * (s.x0 + 1) + s.b * s.y0}, not ${s.c}.`, `Persamaan memberi ${s.a * (s.x0 + 1) + s.b * s.y0}, bukan ${s.c}.`); }
    else { pr = alt; ok = okAlt; need(!okAlt || true); why = okAlt ? T('It satisfies the equation and both values are whole numbers that are not negative.', 'Ia memenuhi persamaan dan kedua-dua nilai ialah nombor bulat yang tidak negatif.') : T('It satisfies the equation, but a negative value is impossible for this situation.', 'Ia memenuhi persamaan, tetapi nilai negatif mustahil bagi situasi ini.'); }
    need(s.a > 0 && (s.b > 0 || v !== 2));
    return { q: T(`${s.st.en} (a) Write an equation in $x$ and $y$. (b) Could $(x, y) = ${ptS(pr[0], pr[1])}$ describe this situation? Explain.`, `${s.st.ms} (a) Tulis satu persamaan dalam $x$ dan $y$. (b) Bolehkah $(x, y) = ${ptS(pr[0], pr[1])}$ menggambarkan situasi ini? Terangkan.`), a: T(`(a) $${s.tex}$ (b) ${ok ? 'Yes' : 'No'}. ${why.en}`, `(a) $${s.tex}$ (b) ${ok ? 'Ya' : 'Tidak'}. ${why.ms}`), w: W(T(`(a) $${s.tex}$`), T(`(b) Substitute: $${cn(s.a)}${br(pr[0])} ${s.b < 0 ? '-' : '+'} ${cn(ab(s.b))}${br(pr[1])} = ${s.a * pr[0] + s.b * pr[1]}$`, `(b) Gantikan: $${cn(s.a)}${br(pr[0])} ${s.b < 0 ? '-' : '+'} ${cn(ab(s.b))}${br(pr[1])} = ${s.a * pr[0] + s.b * pr[1]}$`), why), sp: 'm' };
  };
  const mCtxTable = (r) => {
    const s = r.pick(SC2)(r);
    need(s.a > 0 && s.b > 0);
    const L = solsNN(s.a, s.b, s.c, 0);
    need(L.length >= 3);
    const pick = L.slice(0, 3), tab = SPM.table([['$x$'].concat(pick.map((z) => `$${z[0]}$`)), ['$y$'].concat(pick.map(() => ''))]);
    return { q: T(`${s.st.en} Complete the table to show three possible pairs $(x, y)$.<br>${tab}`.replace('to show three possible pairs $(x, y)$', 'of possible values of $y$'), `${s.st.ms} Lengkapkan jadual nilai $y$ yang mungkin.<br>${tab}`), a: T(`$y = ${pick.map((z) => z[1]).join(',\\ ')}$`), w: T(`Equation: $${s.tex}$`, `Persamaan: $${s.tex}$`), sp: 's' };
  };
  const mSwap = (r) => {
    const p = pairSol(r, { lo: 1, hi: 6, pos: true }), nm = r.name();
    need(p.x0 !== p.y0 && p.a !== p.b);
    return { q: T(`${nm} claims that $(x, y) = ${ptS(p.y0, p.x0)}$ is a solution of $${eq2(p.a, p.b, p.c)}$ because "the numbers 2 and 3 are the same numbers, only the order changes". Is ${nm} correct? Give the correct solution using $x = ${p.x0}$.`.replace('"the numbers 2 and 3 are the same numbers, only the order changes"', '"the same two numbers are used, only in a different order"'), `${nm} mendakwa bahawa $(x, y) = ${ptS(p.y0, p.x0)}$ ialah penyelesaian bagi $${eq2(p.a, p.b, p.c)}$ kerana "dua nombor yang sama digunakan, cuma susunannya berbeza". Adakah ${nm} betul? Berikan penyelesaian yang betul dengan menggunakan $x = ${p.x0}$.`), a: T(`No. The order matters: $(${p.y0}, ${p.x0})$ gives ${p.a * p.y0 + p.b * p.x0}, not ${p.c}. The correct pair is $${ptS(p.x0, p.y0)}$.`, `Tidak. Susunan penting: $(${p.y0}, ${p.x0})$ memberi ${p.a * p.y0 + p.b * p.x0}, bukan ${p.c}. Pasangan yang betul ialah $${ptS(p.x0, p.y0)}$.`), w: W(T(`Substitute $x = ${p.y0}$ and $y = ${p.x0}$: $${cn(p.a)}${br(p.y0)} + ${cn(p.b)}${br(p.x0)} = ${p.a * p.y0 + p.b * p.x0}$`, `Gantikan $x = ${p.y0}$ dan $y = ${p.x0}$: $${cn(p.a)}${br(p.y0)} + ${cn(p.b)}${br(p.x0)} = ${p.a * p.y0 + p.b * p.x0}$`), T(`This is not $${p.c}$: the coefficients $${p.a}$ and $${p.b}$ are different, so swapping $x$ and $y$ changes the value.`, `Ini bukan $${p.c}$: pekali $${p.a}$ dan $${p.b}$ berbeza, maka menukar $x$ dengan $y$ mengubah nilainya.`), T(`With $x = ${p.x0}$: $${cn(p.b)}y = ${redu(p.c, p.a * p.x0)}$, so $y = ${p.y0}$`, `Dengan $x = ${p.x0}$: $${cn(p.b)}y = ${redu(p.c, p.a * p.x0)}$, maka $y = ${p.y0}$`)), sp: 's' };
  };
  const mIntercepts = (r) => {
    const a = r.int(2, 6), b = r.int(2, 6), k = r.int(1, 4), c = SPM.lcm(a, b) * k;
    need(a !== b);
    return { q: T(`Complete the ordered pairs for $${eq2(a, b, c)}$: $(0, \\square)$ and $(\\square, 0)$.`, `Lengkapkan pasangan tertib bagi $${eq2(a, b, c)}$: $(0, \\square)$ dan $(\\square, 0)$.`), a: T(`$(0, ${c / b})$ and $(${c / a}, 0)$`, `$(0, ${c / b})$ dan $(${c / a}, 0)$`), w: W(T(`Put $x = 0$: $${b}y = ${c}$, so $y = ${c / b}$`, `Masukkan $x = 0$: $${b}y = ${c}$, maka $y = ${c / b}$`), T(`Put $y = 0$: $${a}x = ${c}$, so $x = ${c / a}$`, `Masukkan $y = 0$: $${a}x = ${c}$, maka $x = ${c / a}$`)), sp: 's' };
  };
  const mWhich = (r) => {
    const p = pairSol(r, { lo: -3, hi: 5 }), good = [along(p, 0), along(p, 1)], bad = [[p.x0 + 1, p.y0 + 1], [p.y0, p.x0]];
    need(bad.every((z) => p.a * z[0] + p.b * z[1] !== p.c) && ab(good[1][0]) < 12 && ab(good[1][1]) < 12);
    const all = r.shuffle(good.concat(bad));
    const keys = all.map((z, i) => (p.a * z[0] + p.b * z[1] === p.c ? ABC[i] : '')).filter(Boolean).join(', ');
    return { q: T(`Which of the following ordered pairs are solutions of $${eq2(p.a, p.b, p.c)}$? ${all.map((z, i) => `(${ABC[i]}) $${ptS(z[0], z[1])}$`).join('&emsp;')}`, `Antara pasangan tertib berikut, yang manakah penyelesaian bagi $${eq2(p.a, p.b, p.c)}$? ${all.map((z, i) => `(${ABC[i]}) $${ptS(z[0], z[1])}$`).join('&emsp;')}`), a: T(keys), w: W(T(`Substitute each pair into $${eq2(p.a, p.b, p.c)}$ and compare with $${p.c}$.`, `Gantikan setiap pasangan ke dalam $${eq2(p.a, p.b, p.c)}$ dan bandingkan dengan $${p.c}$.`), ...all.map((z, i) => T(`(${ABC[i]}) $${cn(p.a)}${br(z[0])} ${p.b < 0 ? '-' : '+'} ${cn(ab(p.b))}${br(z[1])} = ${p.a * z[0] + p.b * z[1]}$`)), T(`Only ${keys} give $${p.c}$.`, `Hanya ${keys} memberi $${p.c}$.`)), sp: 's' };
  };
  const mFromTable = (r) => {
    const m = r.pick([-3, -2, -1, 1, 2, 3]), k = r.int(-4, 5), xs = [0, 1, 2, 3], ys = xs.map((x) => m * x + k);
    const tab = SPM.table([['$x$'].concat(xs.map((z) => `$${z}$`)), ['$y$'].concat(ys.map((z) => `$${z}$`))]);
    return { q: T(`The table shows some solutions of a linear equation in $x$ and $y$.<br>${tab}<br>Write the equation in the form $y = mx + k$.`, `Jadual menunjukkan beberapa penyelesaian bagi satu persamaan linear dalam $x$ dan $y$.<br>${tab}<br>Tulis persamaan itu dalam bentuk $y = mx + k$.`), a: T(`$y = ${poly([[m, 'x'], [k, '']])}$`), w: W(T(`Each time $x$ increases by $1$, $y$ changes by $${m}$, so the coefficient of $x$ is $${m}$.`, `Setiap kali $x$ bertambah $1$, $y$ berubah sebanyak $${m}$, maka pekali bagi $x$ ialah $${m}$.`), T(`When $x = 0$, $y = ${k}$, so the constant term is $${k}$.`, `Apabila $x = 0$, $y = ${k}$, maka sebutan pemalarnya ialah $${k}$.`), T(`$y = ${poly([[m, 'x'], [k, '']])}$`)), sp: 's' };
  };
  const gm63 = [mTable2, mFindK3, mCtx, mCtxTable, mSwap, mIntercepts, mWhich, mFromTable];

    const listS = (L) => L.map((z) => ptS(z[0], z[1])).join(',\\ ');
  const aList = (r) => {
    const s = r.pick(SC2)(r);
    need(s.a > 0 && s.b > 0);
    const L = solsNN(s.a, s.b, s.c, 1);
    need(L.length >= 2 && L.length <= 7);
    const v = r.int(0, 1);
    return { q: v === 0 ? T(`${s.st.en} Write an equation in $x$ and $y$, then list all the possible pairs $(x, y)$ if $x$ and $y$ are positive whole numbers.`, `${s.st.ms} Tulis satu persamaan dalam $x$ dan $y$, kemudian senaraikan semua pasangan $(x, y)$ yang mungkin jika $x$ dan $y$ ialah nombor bulat positif.`) : T(`${s.st.en} How many different pairs of positive whole numbers $(x, y)$ are possible? List them.`, `${s.st.ms} Berapakah pasangan nombor bulat positif $(x, y)$ yang berbeza yang mungkin? Senaraikannya.`), a: T(`$${s.tex}$; ${L.length} pairs: $${listS(L)}$`, `$${s.tex}$; ${L.length} pasangan: $${listS(L)}$`), w: W(T(`Equation: $${s.tex}$`, `Persamaan: $${s.tex}$`), T('Try $x = 1, 2, 3, \\ldots$ and keep only the values that make $y$ a positive whole number.', 'Cuba $x = 1, 2, 3, \\ldots$ dan kekalkan hanya nilai yang menjadikan $y$ nombor bulat positif.'), ...L.map((z) => T(`$x = ${z[0]}$: $${cn(s.b)}y = ${redu(s.c, s.a * z[0])}$, $y = ${z[1]}$`)), T(`That gives ${L.length} pairs: $${listS(L)}$`, `Ini memberi ${L.length} pasangan: $${listS(L)}$`)), sp: 'm' };
  };
  const aMeaning = (r) => {
    const s = r.pick(SC2)(r), L = solsNN(s.a, s.b, s.c, 0);
    need(s.a > 0 && s.b > 0 && L.length >= 2);
    const z = r.pick(L);
    return { q: T(`${s.st.en} The equation is $${s.tex}$. What does the ordered pair $${ptS(z[0], z[1])}$ mean in this situation? Show that it satisfies the equation.`, `${s.st.ms} Persamaannya ialah $${s.tex}$. Apakah maksud pasangan tertib $${ptS(z[0], z[1])}$ dalam situasi ini? Tunjukkan bahawa ia memenuhi persamaan itu.`), a: T(`$x = ${z[0]}$ (${s.nx.en}) and $y = ${z[1]}$ (${s.ny.en}); $${s.a}(${z[0]}) + ${s.b}(${z[1]}) = ${s.c}$`, `$x = ${z[0]}$ (${s.nx.ms}) dan $y = ${z[1]}$ (${s.ny.ms}); $${s.a}(${z[0]}) + ${s.b}(${z[1]}) = ${s.c}$`), w: W(T(`$x$ stands for ${s.nx.en} and $y$ for ${s.ny.en}, so the pair means ${z[0]} ${s.nx.en} and ${z[1]} ${s.ny.en}.`, `$x$ mewakili ${s.nx.ms} dan $y$ mewakili ${s.ny.ms}, maka pasangan itu bermaksud ${z[0]} ${s.nx.ms} dan ${z[1]} ${s.ny.ms}.`), T(`Check: $${cn(s.a)}${br(z[0])} + ${cn(s.b)}${br(z[1])} = ${s.c}$, which is the right-hand side.`, `Semak: $${cn(s.a)}${br(z[0])} + ${cn(s.b)}${br(z[1])} = ${s.c}$, iaitu sebelah kanan.`)), sp: 'm' };
  };
  const aTwoBlank = (r) => {
    const p = pairSol(r, { lo: 0, hi: 6, pos: true }), q2 = along(p, 1), q3 = along(p, -1);
    need(q2[0] !== p.x0 && q2[1] !== p.y0 && q3[1] >= 0 && q3[0] >= 0 && p.a !== p.b);
    return { q: T(`The ordered pairs $(${p.x0}, m)$ and $(n, ${q2[1]})$ are solutions of $${eq2(p.a, p.b, p.c)}$. Find the values of $m$ and $n$.`, `Pasangan tertib $(${p.x0}, m)$ dan $(n, ${q2[1]})$ ialah penyelesaian bagi $${eq2(p.a, p.b, p.c)}$. Cari nilai $m$ dan $n$.`), a: T(`$m = ${p.y0}$, $n = ${q2[0]}$`), w: W(T(`Substitute $x = ${p.x0}$: $${cn(p.b)}y = ${redu(p.c, p.a * p.x0)}$, so $m = ${p.y0}$`, `Gantikan $x = ${p.x0}$: $${cn(p.b)}y = ${redu(p.c, p.a * p.x0)}$, maka $m = ${p.y0}$`), T(`Substitute $y = ${q2[1]}$: $${cn(p.a)}x = ${redu(p.c, p.b * q2[1])}$, so $n = ${q2[0]}$`, `Gantikan $y = ${q2[1]}$: $${cn(p.a)}x = ${redu(p.c, p.b * q2[1])}$, maka $n = ${q2[0]}$`)), sp: 's' };
  };
  const aMore = (r) => {
    const p = pairSol(r, { lo: -2, hi: 5 }), more = [1, 2, -1].map((t) => along(p, t));
    need(more.every((z) => ab(z[0]) < 20 && ab(z[1]) < 20) && SPM.gcd(p.a, p.b) === 1);
    return { q: T(`$${ptS(p.x0, p.y0)}$ is a solution of $${eq2(p.a, p.b, p.c)}$. Write down three other ordered pairs that are also solutions, and check one of them.`, `$${ptS(p.x0, p.y0)}$ ialah satu penyelesaian bagi $${eq2(p.a, p.b, p.c)}$. Tuliskan tiga pasangan tertib lain yang juga penyelesaian, dan semak salah satunya.`), a: T(`For example $${listS(more)}$ (each gives ${p.c})`, `Contohnya $${listS(more)}$ (setiap satu memberi ${p.c})`), w: W(T('Choose any value of $x$, then work out the matching value of $y$ from the equation.', 'Pilih sebarang nilai $x$, kemudian cari nilai $y$ yang sepadan daripada persamaan itu.'), ...more.map((z) => T(`$x = ${z[0]}$: $${cn(p.b)}y = ${redu(p.c, p.a * z[0])}$, $y = ${z[1]}$`)), T(`Check $${ptS(more[0][0], more[0][1])}$: $${cn(p.a)}${br(more[0][0])} ${p.b < 0 ? '-' : '+'} ${cn(ab(p.b))}${br(more[0][1])} = ${p.c}$`, `Semak $${ptS(more[0][0], more[0][1])}$: $${cn(p.a)}${br(more[0][0])} ${p.b < 0 ? '-' : '+'} ${cn(ab(p.b))}${br(more[0][1])} = ${p.c}$`)), sp: 'm' };
  };
  const aParam = (r) => {
    const k = r.int(2, 5), m = r.int(2, 3), a = r.int(2, 5), b = r.int(1, 4);
    return { q: T(`The ordered pair $(t, ${m}t)$ is a solution of $${eq2(a, b, (a + b * m) * k)}$. Find the value of $t$.`, `Pasangan tertib $(t, ${m}t)$ ialah satu penyelesaian bagi $${eq2(a, b, (a + b * m) * k)}$. Cari nilai $t$.`), a: T(`$t = ${k}$; the pair is $${ptS(k, m * k)}$`, `$t = ${k}$; pasangan itu ialah $${ptS(k, m * k)}$`), w: W(T(`Substitute $x = t$ and $y = ${m}t$: $${a}t + ${cn(b)}(${m}t) = ${(a + b * m) * k}$`, `Gantikan $x = t$ dan $y = ${m}t$: $${a}t + ${cn(b)}(${m}t) = ${(a + b * m) * k}$`), T(`$${a + b * m}t = ${(a + b * m) * k}$`), T(`$t = ${k}$`), T(`So the ordered pair is $${ptS(k, m * k)}$.`, `Maka pasangan tertib itu ialah $${ptS(k, m * k)}$.`)), sp: 's' };
  };
  const aErr3 = (r) => {
    const p = pairSol(r, { lo: 0, hi: 6, pos: true }), pts = [along(p, -1), along(p, 0), along(p, 1)], bad = r.int(0, 2), nm = r.name();
    need(SPM.gcd(p.a, p.b) === 1 && pts.every((z) => z[0] >= -8 && z[1] >= -8 && z[0] < 20 && z[1] < 20));
    const shown = pts.map((z, i) => (i === bad ? [z[0], z[1] + r.pick([1, -1])] : z));
    return { q: T(`${nm} lists $${listS(shown)}$ as solutions of $${eq2(p.a, p.b, p.c)}$. One pair is wrong. Find it and correct it.`, `${nm} menyenaraikan $${listS(shown)}$ sebagai penyelesaian bagi $${eq2(p.a, p.b, p.c)}$. Satu pasangan adalah salah. Cari dan betulkannya.`), a: T(`$${ptS(shown[bad][0], shown[bad][1])}$ is wrong (it gives ${p.a * shown[bad][0] + p.b * shown[bad][1]}). It should be $${ptS(pts[bad][0], pts[bad][1])}$.`, `$${ptS(shown[bad][0], shown[bad][1])}$ adalah salah (ia memberi ${p.a * shown[bad][0] + p.b * shown[bad][1]}). Sepatutnya $${ptS(pts[bad][0], pts[bad][1])}$.`), w: W(T(`Test each pair in $${eq2(p.a, p.b, p.c)}$.`, `Uji setiap pasangan dalam $${eq2(p.a, p.b, p.c)}$.`), ...shown.map((z) => T(`$${ptS(z[0], z[1])}$: $${cn(p.a)}${br(z[0])} + ${cn(p.b)}${br(z[1])} = ${p.a * z[0] + p.b * z[1]}$`)), T(`Only $${ptS(shown[bad][0], shown[bad][1])}$ does not give $${p.c}$.`, `Hanya $${ptS(shown[bad][0], shown[bad][1])}$ tidak memberi $${p.c}$.`), T(`With $x = ${pts[bad][0]}$: $${cn(p.b)}y = ${redu(p.c, p.a * pts[bad][0])}$, so it should be $${ptS(pts[bad][0], pts[bad][1])}$.`, `Dengan $x = ${pts[bad][0]}$: $${cn(p.b)}y = ${redu(p.c, p.a * pts[bad][0])}$, maka ia sepatutnya $${ptS(pts[bad][0], pts[bad][1])}$.`)), sp: 'm' };
  };
  const TF3 = [
    [T('The ordered pairs $(1, 4)$ and $(4, 1)$ are both solutions of $x + y = 5$.', 'Pasangan tertib $(1, 4)$ dan $(4, 1)$ kedua-duanya penyelesaian bagi $x + y = 5$.'), true, T('Both give $1 + 4 = 5$. Different pairs can satisfy the same equation.', 'Kedua-duanya memberi $1 + 4 = 5$. Pasangan yang berbeza boleh memenuhi persamaan yang sama.')],
    [T('If $(3, 2)$ satisfies $2x + y = 8$, then $x = 3$ alone is enough to fix $y$ for every solution.', 'Jika $(3, 2)$ memenuhi $2x + y = 8$, maka $x = 3$ sahaja sudah cukup untuk menentukan $y$ bagi setiap penyelesaian.'), false, T('Every different value of $x$ gives another value of $y$; $x = 3$ fixes only that one pair.', 'Setiap nilai $x$ yang berbeza memberi nilai $y$ yang lain; $x = 3$ hanya menentukan pasangan itu.')],
    [T('The equation $x + 0y = 4$ has $(4, 7)$ and $(4, -2)$ among its solutions.', 'Persamaan $x + 0y = 4$ mempunyai $(4, 7)$ dan $(4, -2)$ antara penyelesaiannya.'), true, T('Any pair with $x = 4$ works, whatever $y$ is.', 'Mana-mana pasangan dengan $x = 4$ berfungsi, apa pun nilai $y$.')],
    [T('Any two numbers whose sum is 10 give a solution of $x + y = 10$.', 'Mana-mana dua nombor yang hasil tambahnya 10 ialah penyelesaian bagi $x + y = 10$.'), true, T('That is exactly what the equation says, for example $(-3, 13)$.', 'Itulah yang dinyatakan oleh persamaan itu, contohnya $(-3, 13)$.')],
    [T('$(0, 0)$ is a solution of every equation of the form $ax + by = c$.', '$(0, 0)$ ialah penyelesaian bagi setiap persamaan berbentuk $ax + by = c$.'), false, T('$(0, 0)$ gives $0 = c$, so it works only when $c = 0$.', '$(0, 0)$ memberi $0 = c$, maka ia hanya berfungsi apabila $c = 0$.')],
  ];
  const aTF3 = (r) => { const t = r.pick(TF3); return { q: T(`True or false? ${t[0].en} Give a reason.`, `Benar atau palsu? ${t[0].ms} Berikan satu sebab.`), a: T(`${t[1] ? 'True' : 'False'}. ${t[2].en}`, `${t[1] ? 'Benar' : 'Palsu'}. ${t[2].ms}`), w: W(t[2], T(`So the statement is ${t[1] ? 'true' : 'false'}.`, `Maka pernyataan itu ${t[1] ? 'benar' : 'palsu'}.`)), sp: 's' }; };
  const ga63 = [aList, aMeaning, aTwoBlank, aMore, aParam, aErr3, aTF3];
  SC2.push(
    (r) => { const x0 = r.int(2, 8), y0 = r.int(2, 8); return S2(T(`A post office has $x$ stamps of 30 sen and $y$ stamps of 50 sen, worth ${30 * x0 + 50 * y0} sen altogether.`, `Sebuah pejabat pos mempunyai $x$ keping setem 30 sen dan $y$ keping setem 50 sen, bernilai ${30 * x0 + 50 * y0} sen semuanya.`), 30, 50, x0, y0, T('30-sen stamps', 'setem 30 sen'), T('50-sen stamps', 'setem 50 sen')); },
    (r) => { const x0 = r.int(2, 8), y0 = r.int(2, 8); return S2(T(`A hall has $x$ rows of 8 seats and $y$ rows of 6 seats. There are ${8 * x0 + 6 * y0} seats altogether.`, `Sebuah dewan mempunyai $x$ baris yang setiap baris ada 8 tempat duduk dan $y$ baris yang setiap baris ada 6 tempat duduk. Terdapat ${8 * x0 + 6 * y0} tempat duduk semuanya.`), 8, 6, x0, y0, T('rows of 8 seats', 'baris 8 tempat duduk'), T('rows of 6 seats', 'baris 6 tempat duduk')); },
    (r) => { const x0 = r.int(3, 20), y0 = r.int(2, 12), nm = r.name(); return S2(T(`${nm} works $x$ hours on weekdays at RM8 per hour and $y$ hours on weekends at RM12 per hour, earning RM${8 * x0 + 12 * y0}.`, `${nm} bekerja $x$ jam pada hari biasa dengan upah RM8 sejam dan $y$ jam pada hujung minggu dengan upah RM12 sejam, dan memperoleh RM${8 * x0 + 12 * y0}.`), 8, 12, x0, y0, T('weekday hours', 'jam hari biasa'), T('weekend hours', 'jam hujung minggu')); },
    (r) => { const x0 = r.int(2, 8), y0 = r.int(1, 5); return S2(T(`A jug holds ${250 * x0 + 500 * y0} ml of juice poured from $x$ small cups of 250 ml and $y$ large cups of 500 ml.`, `Sebuah jag mengandungi ${250 * x0 + 500 * y0} ml jus yang dituang daripada $x$ cawan kecil 250 ml dan $y$ cawan besar 500 ml.`), 250, 500, x0, y0, T('small cups', 'cawan kecil'), T('large cups', 'cawan besar')); },
    (r) => { const x0 = r.int(2, 9), y0 = r.int(2, 9); return S2(T(`A stall sells $x$ kg of rice at RM3 per kg and $y$ kg of sugar at RM4 per kg. The stall receives RM${3 * x0 + 4 * y0}.`, `Sebuah gerai menjual $x$ kg beras pada harga RM3 sekilogram dan $y$ kg gula pada harga RM4 sekilogram. Gerai itu menerima RM${3 * x0 + 4 * y0}.`), 3, 4, x0, y0, T('kg of rice', 'kg beras'), T('kg of sugar', 'kg gula')); },
    (r) => { const x0 = r.int(3, 12), y0 = r.int(2, 9), nm = r.pair(); return S2(T(`${nm[0]} has $x$ stickers and ${nm[1]} has $y$ stickers. Together they have ${x0 + y0} stickers, and ${nm[0]} has ${x0 - y0 > 0 ? x0 - y0 : 0} more than ${nm[1]}.`.replace(/, and .*$/, '.'), `${nm[0]} mempunyai $x$ keping pelekat dan ${nm[1]} mempunyai $y$ keping pelekat. Kedua-duanya mempunyai ${x0 + y0} keping pelekat bersama.`), 1, 1, x0, y0, T(`${nm[0]}'s stickers`, `pelekat ${nm[0]}`), T(`${nm[1]}'s stickers`, `pelekat ${nm[1]}`)); },
  );
  const eBlank = (r) => {
    const s = r.pick(SC2)(r);
    return { q: T(`${s.st.en} Complete the equation: $\\square x + \\square y = \\square$.`, `${s.st.ms} Lengkapkan persamaan: $\\square x + \\square y = \\square$.`), a: T(`$${s.a}$, $${s.b}$ and $${s.c}$ (that is, $${s.tex}$)`, `$${s.a}$, $${s.b}$ dan $${s.c}$ (iaitu $${s.tex}$)`), w: W(T('The first box is the number that goes with $x$, the second the number that goes with $y$, and the third the total.', 'Petak pertama ialah nombor yang sepadan dengan $x$, petak kedua nombor yang sepadan dengan $y$, dan petak ketiga jumlahnya.'), T(`$${s.tex}$`)), sp: 's' };
  };
  const eZero = (r) => {
    const a = r.int(2, 6), b = r.int(2, 6), k = r.int(1, 4), c = SPM.lcm(a, b) * k;
    return { q: T(`For $${eq2(a, b, c)}$, find (a) $y$ when $x = 0$, (b) $x$ when $y = 0$.`, `Bagi $${eq2(a, b, c)}$, cari (a) $y$ apabila $x = 0$, (b) $x$ apabila $y = 0$.`), a: T(`(a) $y = ${c / b}$ (b) $x = ${c / a}$`), w: W(T(`(a) Put $x = 0$: $${b}y = ${c}$, so $y = ${c / b}$`, `(a) Masukkan $x = 0$: $${b}y = ${c}$, maka $y = ${c / b}$`), T(`(b) Put $y = 0$: $${a}x = ${c}$, so $x = ${c / a}$`, `(b) Masukkan $y = 0$: $${a}x = ${c}$, maka $x = ${c / a}$`)), sp: 's' };
  };
  const mCtxY = (r) => {
    const s = r.pick(SC2)(r), L = solsNN(s.a, s.b, s.c, 0);
    need(s.a > 0 && s.b > 0 && L.length >= 3);
    const z = r.pick(L), v = r.int(0, 1);
    return { q: v === 0 ? T(`${s.st.en} Write an equation. If $x = ${z[0]}$, find $y$.`, `${s.st.ms} Tulis satu persamaan. Jika $x = ${z[0]}$, cari $y$.`) : T(`${s.st.en} Form an equation in $x$ and $y$. Find $x$ when $y = ${z[1]}$.`, `${s.st.ms} Bentukkan satu persamaan dalam $x$ dan $y$. Cari $x$ apabila $y = ${z[1]}$.`), a: T(`$${s.tex}$; ${v === 0 ? `$y = ${z[1]}$` : `$x = ${z[0]}$`}`.replace(/\$\$/g, '$'), `$${s.tex}$; ${v === 0 ? `$y = ${z[1]}$` : `$x = ${z[0]}$`}`.replace(/\$\$/g, '$')), w: W(T(`Equation: $${s.tex}$`, `Persamaan: $${s.tex}$`), v === 0 ? T(`Substitute $x = ${z[0]}$: $${cn(s.b)}y = ${redu(s.c, s.a * z[0])}$, so $y = ${z[1]}$`, `Gantikan $x = ${z[0]}$: $${cn(s.b)}y = ${redu(s.c, s.a * z[0])}$, maka $y = ${z[1]}$`) : T(`Substitute $y = ${z[1]}$: $${cn(s.a)}x = ${redu(s.c, s.b * z[1])}$, so $x = ${z[0]}$`, `Gantikan $y = ${z[1]}$: $${cn(s.a)}x = ${redu(s.c, s.b * z[1])}$, maka $x = ${z[0]}$`)), sp: 's' };
  };
  const aExtreme = (r) => {
    const s = r.pick(SC2)(r), L = solsNN(s.a, s.b, s.c, 0);
    need(s.a > 0 && s.b > 0 && L.length >= 3 && L.length <= 9);
    const big = r.chance(), z = big ? L[0] : L[L.length - 1];
    return { q: big ? T(`${s.st.en} Form an equation. What is the greatest possible value of $y$, and what is $x$ then?`, `${s.st.ms} Bentukkan satu persamaan. Apakah nilai $y$ yang paling besar yang mungkin, dan apakah $x$ ketika itu?`) : T(`${s.st.en} Form an equation. What is the greatest possible value of $x$, and what is $y$ then?`, `${s.st.ms} Bentukkan satu persamaan. Apakah nilai $x$ yang paling besar yang mungkin, dan apakah $y$ ketika itu?`), a: big ? T(`$${s.tex}$; $y = ${L.reduce((m, q) => Math.max(m, q[1]), 0)}$, $x = ${L.find((q) => q[1] === Math.max(...L.map((w) => w[1])))[0]}$`) : T(`$${s.tex}$; $x = ${Math.max(...L.map((w) => w[0]))}$, $y = ${L.find((q) => q[0] === Math.max(...L.map((w) => w[0])))[1]}$`), w: W(T(`Equation: $${s.tex}$`, `Persamaan: $${s.tex}$`), T('Both $x$ and $y$ must be whole numbers that are not negative.', 'Kedua-dua $x$ dan $y$ mesti nombor bulat yang tidak negatif.'), big ? T(`$y$ is largest when $x$ is smallest: $x = ${z[0]}$ gives $${cn(s.b)}y = ${redu(s.c, s.a * z[0])}$, so $y = ${z[1]}$.`, `$y$ paling besar apabila $x$ paling kecil: $x = ${z[0]}$ memberi $${cn(s.b)}y = ${redu(s.c, s.a * z[0])}$, maka $y = ${z[1]}$.`) : T(`$x$ is largest when $y$ is smallest: $y = ${z[1]}$ gives $${cn(s.a)}x = ${redu(s.c, s.b * z[1])}$, so $x = ${z[0]}$.`, `$x$ paling besar apabila $y$ paling kecil: $y = ${z[1]}$ memberi $${cn(s.a)}x = ${redu(s.c, s.b * z[1])}$, maka $x = ${z[0]}$.`)), sp: 'm' };
  };
  ge63.push(eBlank, eZero);
  gm63.push(mCtxY);
  ga63.push(aExtreme);
  SPM.extend('F1-6.3', { e: ge63, m: gm63, a: ga63 });

  
  /* ================================================================ 6.4 */
  const PW = (o) => S.plane(Object.assign({ x: [-6, 6], y: [-6, 6], scale: 20 }, o));
  const yEq = (m, c) => { const M = F_(m); const mt = M.d === 1 ? (M.n === 1 ? '' : M.n === -1 ? '-' : String(M.n)) : tx(M); return `y = ${M.n === 0 ? c : `${mt}x${c === 0 ? '' : ` ${sg(c)} ${ab(c)}`}`}`; };
  const LM = [1, -1, 2, -2, 3, -3, Q(1, 2), Q(-1, 2)];
  /* a random sloping line with integer points: returns { m (Fr), c, pts:[[x,y]...] inside the window } */
  const rline = (r, o) => {
    o = o || {};
    const m = o.ms ? r.pick(o.ms) : r.pick(LM.slice(0, o.half ? 8 : 6)), M = F_(m), c = r.int(-3, 3), R = o.R || 5, pts = [];
    for (let x = -R; x <= R; x++) { const y = Fr.add(Fr.mul(M, Q(x)), Q(c)); if (y.d === 1 && ab(y.n) <= R) pts.push([x, y.n]); }
    need(pts.length >= 3 && (o.c0 === undefined || c !== 0));
    return { m: M, c, pts, eq: yEq(M, c), ln: { m: Fr.val(M), c } };
  };
  const inWin = (p, R) => ab(p[0]) <= (R || 5) && ab(p[1]) <= (R || 5);
  /** ['positive','positif'] / ['negative','negatif'] / ['zero','sifar'] for a value */
  const SGW = (v) => (v > 0 ? ['positive', 'positif'] : v < 0 ? ['negative', 'negatif'] : ['zero', 'sifar']);
  const cnt = (xs) => xs.map((z) => `$${z}$`).join(', ');
  const QUAD = (x, y) => (x === 0 && y === 0 ? 'origin' : x === 0 ? 'y-axis' : y === 0 ? 'x-axis' : x > 0 && y > 0 ? 'Q1' : x < 0 && y > 0 ? 'Q2' : x < 0 && y < 0 ? 'Q3' : 'Q4');
  const QN = { origin: T('the origin', 'asalan'), 'x-axis': T('the $x$-axis', 'paksi-$x$'), 'y-axis': T('the $y$-axis', 'paksi-$y$'), Q1: T('the first quadrant', 'sukuan pertama'), Q2: T('the second quadrant', 'sukuan kedua'), Q3: T('the third quadrant', 'sukuan ketiga'), Q4: T('the fourth quadrant', 'sukuan keempat') };
  const eHV = (r) => {
    const k = r.nz(-4, 4), h = r.nz(-4, 4), v = r.int(0, 2), sw = r.chance();
    const fig = PW({ x: [-5, 5], y: [-5, 5], vlines: [k], lines: [{ m: 0, c: h, label: '' }], extra: (M) => S.text(M.sx(k) + 12, M.sy(4.6), sw ? 'l₁' : 'l₂', { i: true }) + S.text(M.sx(4.2), M.sy(h) - 9, sw ? 'l₂' : 'l₁', { i: true }) });
    const V = sw ? 'l_1' : 'l_2', H = sw ? 'l_2' : 'l_1';
    if (v === 0) return { q: T('The diagram shows two straight lines $l_1$ and $l_2$. Write down the equation of each line.', 'Rajah menunjukkan dua garis lurus $l_1$ dan $l_2$. Tuliskan persamaan bagi setiap garis.'), fig, a: T(`$${V}$: $x = ${k}$; $${H}$: $y = ${h}$`), w: W(T('On a vertical line every point has the same $x$-coordinate, so its equation is $x =$ a number; on a horizontal line every point has the same $y$-coordinate, so its equation is $y =$ a number.', 'Pada garis mencancang setiap titik mempunyai koordinat-$x$ yang sama, maka persamaannya ialah $x =$ satu nombor; pada garis mengufuk setiap titik mempunyai koordinat-$y$ yang sama, maka persamaannya ialah $y =$ satu nombor.'), T(`$${V}$ cuts the $x$-axis at $${k}$ and $${H}$ cuts the $y$-axis at $${h}$.`, `$${V}$ memotong paksi-$x$ pada $${k}$ dan $${H}$ memotong paksi-$y$ pada $${h}$.`), T(`$${V}$: $x = ${k}$, $${H}$: $y = ${h}$`)), sp: 's' };
    if (v === 1) return { q: T(`One of the lines in the diagram is $x = ${k}$. Which line is it, and is it horizontal or vertical?`, `Salah satu garis dalam rajah ialah $x = ${k}$. Garis yang manakah itu, dan adakah ia mengufuk atau mencancang?`), fig, a: T(`$${V}$, vertical`, `$${V}$, mencancang`), w: W(T(`$x = ${k}$ fixes the $x$-coordinate, so every point on the line has $x = ${k}$: the line is vertical.`, `$x = ${k}$ menetapkan koordinat-$x$, maka setiap titik pada garis itu mempunyai $x = ${k}$: garis itu mencancang.`), T(`In the diagram that is $${V}$.`, `Dalam rajah itu, garis tersebut ialah $${V}$.`)), sp: 's' };
    return { q: T('The two lines in the diagram meet at a point. Write down its coordinates.', 'Dua garis dalam rajah bertemu pada satu titik. Tuliskan koordinatnya.'), fig, a: T(`$(${k}, ${h})$`), w: W(T(`The meeting point lies on both lines, so it has $x = ${k}$ (from $${V}$) and $y = ${h}$ (from $${H}$).`, `Titik pertemuan terletak pada kedua-dua garis, maka koordinatnya ialah $x = ${k}$ (daripada $${V}$) dan $y = ${h}$ (daripada $${H}$).`), T(`$(${k}, ${h})$`)), sp: 'xs' };
  };
  const ePts = (r) => {
    const ps = r.sample([[-4, 3], [3, 4], [-3, -2], [4, -3], [0, 3], [-2, 0], [2, 1], [-1, -4], [5, 2], [0, -2], [3, 0], [-5, 1]], 3), nm = ['P', 'Q', 'R'], v = r.int(0, 3);
    const fig = PW({ x: [-6, 6], y: [-5, 5], pts: ps.map((z, i) => ({ x: z[0], y: z[1], l: nm[i] })) });
    if (v === 0) return { q: T('Write down the coordinates of the points $P$, $Q$ and $R$ in the diagram.', 'Tuliskan koordinat titik $P$, $Q$ dan $R$ dalam rajah.'), fig, a: T(ps.map((z, i) => `$${nm[i]} = (${z[0]}, ${z[1]})$`).join(', ')), w: W(T('For each point read the $x$-axis first, then the $y$-axis; coordinates are written $(x, y)$.', 'Bagi setiap titik, baca paksi-$x$ dahulu, kemudian paksi-$y$; koordinat ditulis $(x, y)$.'), T(ps.map((z, i) => `$${nm[i]} = (${z[0]}, ${z[1]})$`).join(', '))), sp: 's' };
    if (v === 1) { const i = r.int(0, 2); return { q: T(`Write down the $x$-coordinate and the $y$-coordinate of point $${nm[i]}$.`, `Tuliskan koordinat-$x$ dan koordinat-$y$ bagi titik $${nm[i]}$.`), fig, a: T(`$x = ${ps[i][0]}$, $y = ${ps[i][1]}$`), w: W(T(`$${nm[i]}$ is at $(${ps[i][0]}, ${ps[i][1]})$: the first number is the $x$-coordinate, the second is the $y$-coordinate.`, `$${nm[i]}$ berada pada $(${ps[i][0]}, ${ps[i][1]})$: nombor pertama ialah koordinat-$x$, nombor kedua ialah koordinat-$y$.`)), sp: 'xs' }; }
    if (v === 2) { const i = r.int(0, 2), qd = QUAD(ps[i][0], ps[i][1]); return { q: T(`In which quadrant, or on which axis, does point $${nm[i]}$ lie?`, `Dalam sukuan yang manakah, atau pada paksi yang manakah, titik $${nm[i]}$ terletak?`), fig, a: T(QN[qd].en, QN[qd].ms), w: W(T(`$${nm[i]} = (${ps[i][0]}, ${ps[i][1]})$: the $x$-coordinate is ${SGW(ps[i][0])[0]} and the $y$-coordinate is ${SGW(ps[i][1])[0]}.`, `$${nm[i]} = (${ps[i][0]}, ${ps[i][1]})$: koordinat-$x$ ialah ${SGW(ps[i][0])[1]} dan koordinat-$y$ ialah ${SGW(ps[i][1])[1]}.`), cat(T('Answer: ', 'Jawapan: '), QN[qd], T('.', '.'))), sp: 'xs' }; }
    return { q: T(`Which of the points $P$, $Q$, $R$ has the greatest $y$-coordinate, and what is it?`, `Antara titik $P$, $Q$, $R$, yang manakah mempunyai koordinat-$y$ yang paling besar, dan berapakah nilainya?`), fig, a: T(`${nm[ps.indexOf(ps.reduce((b, z) => (z[1] > b[1] ? z : b), ps[0]))]}: $${Math.max(...ps.map((z) => z[1]))}$`), w: W(T(`Compare the $y$-coordinates: ${ps.map((z, i) => `$${nm[i]}: ${z[1]}$`).join(', ')}.`, `Bandingkan koordinat-$y$: ${ps.map((z, i) => `$${nm[i]}: ${z[1]}$`).join(', ')}.`), T(`The greatest is $${Math.max(...ps.map((z) => z[1]))}$, at $${nm[ps.indexOf(ps.reduce((b, z) => (z[1] > b[1] ? z : b), ps[0]))]}$.`, `Yang paling besar ialah $${Math.max(...ps.map((z) => z[1]))}$, pada $${nm[ps.indexOf(ps.reduce((b, z) => (z[1] > b[1] ? z : b), ps[0]))]}$.`)), sp: 'xs' };
  };
  const eOnLine = (r) => {
    const L = rline(r), on = r.sample(L.pts, 2), off = r.sample([[-3, 2], [2, -4], [4, 4], [-4, -1], [1, 3], [3, -2], [-2, -3]].filter((z) => Fr.cmp(Fr.add(Fr.mul(L.m, Q(z[0])), Q(L.c)), Q(z[1])) !== 0), 2);
    const all = r.shuffle(on.map((z) => [z, 1]).concat(off.map((z) => [z, 0]))), nm = ['A', 'B', 'C', 'D'], v = r.int(0, 1);
    const fig = PW({ x: [-6, 6], y: [-6, 6], lines: [L.ln], pts: all.map((z, i) => ({ x: z[0][0], y: z[0][1], l: nm[i] })) });
    const yes_ = all.map((z, i) => (z[1] ? nm[i] : '')).filter(Boolean).join(', ');
    if (v === 0) return { q: T('The diagram shows a straight line and four points. Which points lie on the line?', 'Rajah menunjukkan satu garis lurus dan empat titik. Titik yang manakah terletak pada garis itu?'), fig, a: T(yes_), w: W(T(`The line has equation $${L.eq}$; a point lies on it only if its coordinates fit the equation.`, `Garis itu mempunyai persamaan $${L.eq}$; sesuatu titik terletak padanya hanya jika koordinatnya memenuhi persamaan itu.`), ...all.map((z, i) => T(`$${nm[i]}(${z[0][0]}, ${z[0][1]})$: ${z[1] ? 'on the line' : 'not on the line'}`, `$${nm[i]}(${z[0][0]}, ${z[0][1]})$: ${z[1] ? 'pada garis' : 'bukan pada garis'}`)), T(`So the points on the line are ${yes_}.`, `Maka titik yang terletak pada garis ialah ${yes_}.`)), sp: 'xs' };
    return { q: T(`The line in the diagram has equation $${L.eq}$. Write down the points that satisfy the equation, and give the coordinates of one of them.`, `Garis dalam rajah mempunyai persamaan $${L.eq}$. Tuliskan titik yang memenuhi persamaan itu dan berikan koordinat salah satu daripadanya.`), fig, a: T(`${yes_}; e.g. $(${on[0][0]}, ${on[0][1]})$`), w: W(T(`Only the points the line passes through satisfy $${L.eq}$.`, `Hanya titik yang dilalui oleh garis itu memenuhi $${L.eq}$.`), ...all.map((z, i) => T(`$${nm[i]}(${z[0][0]}, ${z[0][1]})$: ${z[1] ? 'satisfies the equation' : 'does not satisfy it'}`, `$${nm[i]}(${z[0][0]}, ${z[0][1]})$: ${z[1] ? 'memenuhi persamaan' : 'tidak memenuhinya'}`)), T(`So ${yes_} satisfy the equation, for example $(${on[0][0]}, ${on[0][1]})$.`, `Maka ${yes_} memenuhi persamaan itu, contohnya $(${on[0][0]}, ${on[0][1]})$.`)), sp: 's' };
  };
  const eIntRead = (r) => {
    const xi = r.nz(-5, 5), yi = r.nz(-5, 5), v = r.int(0, 2);
    const m = Fr.make(-yi, xi);
    const fig = PW({ x: [-6, 6], y: [-6, 6], lines: [{ m: Fr.val(m), c: yi }], pts: [{ x: xi, y: 0, l: '' }, { x: 0, y: yi, l: '' }] });
    if (v === 0) return { q: T('State the $x$-intercept and the $y$-intercept of the straight line shown.', 'Nyatakan pintasan-$x$ dan pintasan-$y$ bagi garis lurus yang ditunjukkan.'), fig, a: T(`$x$-intercept $${xi}$, $y$-intercept $${yi}$`, `Pintasan-$x$ $${xi}$, pintasan-$y$ $${yi}$`), w: W(T('The $x$-intercept is where the line crosses the $x$-axis (there $y = 0$); the $y$-intercept is where it crosses the $y$-axis (there $x = 0$).', 'Pintasan-$x$ ialah tempat garis menyilang paksi-$x$ (di situ $y = 0$); pintasan-$y$ ialah tempat ia menyilang paksi-$y$ (di situ $x = 0$).'), T(`Reading the graph: the crossings are at $(${xi}, 0)$ and $(0, ${yi})$.`, `Membaca graf: persilangan berlaku pada $(${xi}, 0)$ dan $(0, ${yi})$.`)), sp: 's' };
    if (v === 1) return { q: T('At which point does the line cross the $x$-axis? Write its coordinates.', 'Pada titik manakah garis itu menyilang paksi-$x$? Tuliskan koordinatnya.'), fig, a: T(`$(${xi}, 0)$`), w: W(T(`Every point on the $x$-axis has $y = 0$.`, `Setiap titik pada paksi-$x$ mempunyai $y = 0$.`), T(`The line meets the $x$-axis at $x = ${xi}$, so the point is $(${xi}, 0)$.`, `Garis itu bertemu paksi-$x$ pada $x = ${xi}$, maka titiknya ialah $(${xi}, 0)$.`)), sp: 'xs' };
    return { q: T('Write down the coordinates of the point where the line meets the $y$-axis.', 'Tuliskan koordinat titik apabila garis itu bertemu paksi-$y$.'), fig, a: T(`$(0, ${yi})$`), w: W(T(`Every point on the $y$-axis has $x = 0$.`, `Setiap titik pada paksi-$y$ mempunyai $x = 0$.`), T(`The line meets the $y$-axis at $y = ${yi}$, so the point is $(0, ${yi})$.`, `Garis itu bertemu paksi-$y$ pada $y = ${yi}$, maka titiknya ialah $(0, ${yi})$.`)), sp: 'xs' };
  };
  const eReadVal = (r) => {
    const L = rline(r), z = r.pick(L.pts), v = r.int(0, 1), fig = PW({ x: [-6, 6], y: [-6, 6], lines: [L.ln] });
    need(z[0] !== 0 && z[1] !== 0);
    return { q: v === 0 ? T(`Use the graph to find the value of $y$ when $x = ${z[0]}$.`, `Gunakan graf untuk mencari nilai $y$ apabila $x = ${z[0]}$.`) : T(`Use the graph to find the value of $x$ when $y = ${z[1]}$.`, `Gunakan graf untuk mencari nilai $x$ apabila $y = ${z[1]}$.`), fig, a: v === 0 ? T(`$y = ${z[1]}$`) : T(`$x = ${z[0]}$`), w: W(v === 0 ? T(`Go to $x = ${z[0]}$ on the horizontal axis, move up or down to the line, then read across to the $y$-axis.`, `Pergi ke $x = ${z[0]}$ pada paksi mengufuk, bergerak ke atas atau ke bawah sehingga garis, kemudian baca ke paksi-$y$.`) : T(`Go to $y = ${z[1]}$ on the vertical axis, move across to the line, then read down to the $x$-axis.`, `Pergi ke $y = ${z[1]}$ pada paksi mencancang, bergerak mengufuk sehingga garis, kemudian baca ke bawah ke paksi-$x$.`), T(`The point on the line is $(${z[0]}, ${z[1]})$, so ${v === 0 ? `$y = ${z[1]}$` : `$x = ${z[0]}$`}.`, `Titik pada garis itu ialah $(${z[0]}, ${z[1]})$, maka ${v === 0 ? `$y = ${z[1]}$` : `$x = ${z[0]}$`}.`)), sp: 'xs' };
  };
  const eEqPoint = (r) => {
    const L = rline(r, { half: false }), v = r.int(0, 3), z = r.pick(L.pts), off = r.chance();
    const P = off ? [z[0], z[1] + r.pick([-1, 1, 2])] : z;
    if (v === 0) return { q: T(`Does the point $(${P[0]}, ${P[1]})$ lie on the line $${L.eq}$?`, `Adakah titik $(${P[0]}, ${P[1]})$ terletak pada garis $${L.eq}$?`), a: yes(!off), w: W(T(`Substitute $x = ${P[0]}$ into $${L.eq}$: $y = ${z[1]}$.`, `Gantikan $x = ${P[0]}$ ke dalam $${L.eq}$: $y = ${z[1]}$.`), off ? T(`The point has $y = ${P[1]}$, not $${z[1]}$, so it does not lie on the line.`, `Titik itu mempunyai $y = ${P[1]}$, bukan $${z[1]}$, maka ia tidak terletak pada garis itu.`) : T(`This is the $y$-coordinate of the point, so it lies on the line.`, `Ini ialah koordinat-$y$ titik itu, maka ia terletak pada garis itu.`)), sp: 's' };
    if (v === 1) return { q: T(`The point $(${z[0]}, k)$ lies on the line $${L.eq}$. Find $k$.`, `Titik $(${z[0]}, k)$ terletak pada garis $${L.eq}$. Cari $k$.`), a: T(`$k = ${z[1]}$`), w: W(T(`The point has $x = ${z[0]}$ and $y = k$.`, `Titik itu mempunyai $x = ${z[0]}$ dan $y = k$.`), T(`Substitute $x = ${z[0]}$ into $${L.eq}$: $k = ${z[1]}$.`, `Gantikan $x = ${z[0]}$ ke dalam $${L.eq}$: $k = ${z[1]}$.`)), sp: 's' };
    if (v === 2) { const p = pairSol(r, { lo: -3, hi: 4 }); const bad = [p.x0 + 1, p.y0]; const good = [p.x0, p.y0]; return { q: T(`Which of the points $${ptS(good[0], good[1])}$ and $${ptS(bad[0], bad[1])}$ lies on the line $${eq2(p.a, p.b, p.c)}$?`, `Antara titik $${ptS(good[0], good[1])}$ dan $${ptS(bad[0], bad[1])}$, yang manakah terletak pada garis $${eq2(p.a, p.b, p.c)}$?`), a: T(`$${ptS(good[0], good[1])}$`), w: W(T(`Substitute each point into $${eq2(p.a, p.b, p.c)}$.`, `Gantikan setiap titik ke dalam $${eq2(p.a, p.b, p.c)}$.`), T(`$${ptS(good[0], good[1])}$: $${cn(p.a)}${br(good[0])} ${p.b < 0 ? '-' : '+'} ${cn(ab(p.b))}${br(good[1])} = ${p.c}$`), T(`$${ptS(bad[0], bad[1])}$: $${cn(p.a)}${br(bad[0])} ${p.b < 0 ? '-' : '+'} ${cn(ab(p.b))}${br(bad[1])} = ${p.a * bad[0] + p.b * bad[1]}$`), T(`Only $${ptS(good[0], good[1])}$ gives $${p.c}$, so it is the point on the line.`, `Hanya $${ptS(good[0], good[1])}$ memberi $${p.c}$, maka itulah titik pada garis itu.`)), sp: 's' }; }
    const k = r.nz(-5, 5), h = r.nz(-5, 5), vert = r.chance();
    return { q: vert ? T(`Which of these points lies on the line $x = ${k}$? $(${h}, ${k})$, $(${k}, ${h})$.`, `Antara titik-titik ini, yang manakah terletak pada garis $x = ${k}$? $(${h}, ${k})$, $(${k}, ${h})$.`) : T(`Which of these points lies on the line $y = ${k}$? $(${h}, ${k})$, $(${k}, ${h})$.`, `Antara titik-titik ini, yang manakah terletak pada garis $y = ${k}$? $(${h}, ${k})$, $(${k}, ${h})$.`), a: vert ? T(`$(${k}, ${h})$`) : T(`$(${h}, ${k})$`), w: W(vert ? T(`Every point on $x = ${k}$ has $x$-coordinate $${k}$, and the $x$-coordinate is written first.`, `Setiap titik pada $x = ${k}$ mempunyai koordinat-$x$ $${k}$, dan koordinat-$x$ ditulis dahulu.`) : T(`Every point on $y = ${k}$ has $y$-coordinate $${k}$, and the $y$-coordinate is written second.`, `Setiap titik pada $y = ${k}$ mempunyai koordinat-$y$ $${k}$, dan koordinat-$y$ ditulis kedua.`), T(vert ? `$(${k}, ${h})$` : `$(${h}, ${k})$`)), sp: 'xs' };
  };
  const eClass = (r) => {
    const a = r.nz(-5, 5), b = r.nz(-5, 5), m = r.int(2, 4), c = r.int(1, 6);
    const items = [[`x = ${a}`, T('vertical', 'mencancang')], [`y = ${b}`, T('horizontal', 'mengufuk')], [`y = ${m}x + ${c}`, T('sloping', 'condong')]];
    const sh = r.shuffle(items), v = r.int(0, 1);
    const lst = sh.map((z, i) => `(${ABC[i]}) $${z[0]}$`).join('&emsp;');
    if (v === 0) return { q: T(`Classify each line as horizontal, vertical or sloping: ${lst}`, `Kelaskan setiap garis sebagai mengufuk, mencancang atau condong: ${lst}`), a: T(sh.map((z, i) => `${ABC[i]}: ${z[1].en}`).join('; '), sh.map((z, i) => `${ABC[i]}: ${z[1].ms}`).join('; ')), w: W(T('$x =$ a number is a vertical line, $y =$ a number is a horizontal line, and an equation containing both $x$ and $y$ gives a sloping line.', '$x =$ satu nombor ialah garis mencancang, $y =$ satu nombor ialah garis mengufuk, dan persamaan yang mengandungi kedua-dua $x$ dan $y$ memberi garis condong.'), T(sh.map((z, i) => `${ABC[i]}: ${z[1].en}`).join('; '), sh.map((z, i) => `${ABC[i]}: ${z[1].ms}`).join('; '))), sp: 's' };
    return { q: T(`Which of the equations $x = ${a}$, $y = ${b}$ and $y = ${m}x$ has a graph that passes through the origin?`, `Antara persamaan $x = ${a}$, $y = ${b}$ dan $y = ${m}x$, graf yang manakah melalui asalan?`), a: T(`$y = ${m}x$`), w: W(T('A graph passes through the origin when $(0, 0)$ satisfies its equation.', 'Suatu graf melalui asalan apabila $(0, 0)$ memenuhi persamaannya.'), T(`$x = ${a}$ needs $x = ${a}$, not $0$; $y = ${b}$ needs $y = ${b}$, not $0$.`, `$x = ${a}$ memerlukan $x = ${a}$, bukan $0$; $y = ${b}$ memerlukan $y = ${b}$, bukan $0$.`), T(`$y = ${m}x$ gives $y = ${m}(0) = 0$, so only this line passes through the origin.`, `$y = ${m}x$ memberi $y = ${m}(0) = 0$, maka hanya garis ini melalui asalan.`)), sp: 's' };
  };
  const eMcGraph = (r) => {
    const v = r.int(0, 1);
    if (v === 0) {
      const L = rline(r), o = opts(r, L.eq, [yEq(Fr.neg(L.m), L.c), yEq(L.m, -L.c), yEq(Fr.add(L.m, Q(1)), L.c), yEq(L.m, L.c + 1)].filter((z) => z !== L.eq));
      return { q: T(`Which equation represents the line shown?<br>${o.list}`, `Persamaan yang manakah mewakili garis yang ditunjukkan?<br>${o.list}`), fig: PW({ x: [-6, 6], y: [-6, 6], lines: [L.ln] }), a: mcqA(o), w: W(T(`Read the graph: the line cuts the $y$-axis at $${L.c}$, and for each $1$ across it rises by $${tx(L.m)}$.`, `Baca graf: garis itu memotong paksi-$y$ pada $${L.c}$, dan bagi setiap $1$ mengufuk ia naik $${tx(L.m)}$.`), T(`Check a point on the line: $(${L.pts[0][0]}, ${L.pts[0][1]})$ satisfies $${L.eq}$.`, `Semak satu titik pada garis: $(${L.pts[0][0]}, ${L.pts[0][1]})$ memenuhi $${L.eq}$.`), T(`So the equation is $${L.eq}$, option (${o.key}).`, `Maka persamaannya ialah $${L.eq}$, pilihan (${o.key}).`)), sp: 's' };
    }
    const k = r.nz(-4, 4), vert = r.chance(), E = vert ? `x = ${k}` : `y = ${k}`, o = opts(r, E, [vert ? `y = ${k}` : `x = ${k}`, vert ? `x = ${-k}` : `y = ${-k}`, vert ? `y = ${-k}` : `x = ${-k}`]);
    return { q: T(`Which equation represents the line shown?<br>${o.list}`, `Persamaan yang manakah mewakili garis yang ditunjukkan?<br>${o.list}`), fig: vert ? PW({ x: [-5, 5], y: [-5, 5], vlines: [k] }) : PW({ x: [-5, 5], y: [-5, 5], lines: [{ m: 0, c: k }] }), a: mcqA(o), w: W(vert ? T(`The line is vertical, so every point on it has the same $x$-coordinate; it cuts the $x$-axis at $${k}$.`, `Garis itu mencancang, maka setiap titik padanya mempunyai koordinat-$x$ yang sama; ia memotong paksi-$x$ pada $${k}$.`) : T(`The line is horizontal, so every point on it has the same $y$-coordinate; it cuts the $y$-axis at $${k}$.`, `Garis itu mengufuk, maka setiap titik padanya mempunyai koordinat-$y$ yang sama; ia memotong paksi-$y$ pada $${k}$.`), T(`So the equation is $${E}$, option (${o.key}).`, `Maka persamaannya ialah $${E}$, pilihan (${o.key}).`)), sp: 's' };
  };
  const eQuad = (r) => {
    const x = r.int(-6, 6), y = r.int(-6, 6), v = r.int(0, 1);
    need(x !== 0 || y !== 0);
    const qd = QUAD(x, y);
    if (v === 0) return { q: T(`The point $(${x}, ${y})$ lies in which quadrant or on which axis?`, `Titik $(${x}, ${y})$ terletak dalam sukuan yang manakah atau pada paksi yang manakah?`), a: T(QN[qd].en, QN[qd].ms), w: W(T(`Here $x = ${x}$ is ${SGW(x)[0]} and $y = ${y}$ is ${SGW(y)[0]}.`, `Di sini $x = ${x}$ ialah ${SGW(x)[1]} dan $y = ${y}$ ialah ${SGW(y)[1]}.`), cat(T('Answer: ', 'Jawapan: '), QN[qd], T('.', '.'))), sp: 'xs' };
    const qs = { Q1: [1, 1], Q2: [-1, 1], Q3: [-1, -1], Q4: [1, -1] }, k = r.pick(Object.keys(qs)), a = r.int(1, 6), b = r.int(1, 6);
    return { q: T(`Write down the coordinates of a point in ${QN[k].en} with $|x| = ${a}$ and $|y| = ${b}$.`, `Tuliskan koordinat satu titik dalam ${QN[k].ms} dengan $|x| = ${a}$ dan $|y| = ${b}$.`), a: T(`$(${qs[k][0] * a}, ${qs[k][1] * b})$`), w: W(cat(T('In ', 'Dalam '), QN[k], T(` the $x$-coordinate is ${SGW(qs[k][0])[0]} and the $y$-coordinate is ${SGW(qs[k][1])[0]}.`, ` koordinat-$x$ ialah ${SGW(qs[k][0])[1]} dan koordinat-$y$ ialah ${SGW(qs[k][1])[1]}.`)), T(`With $|x| = ${a}$ and $|y| = ${b}$ that gives $(${qs[k][0] * a}, ${qs[k][1] * b})$.`, `Dengan $|x| = ${a}$ dan $|y| = ${b}$, ini memberi $(${qs[k][0] * a}, ${qs[k][1] * b})$.`)), sp: 'xs' };
  };
  const eDraw = (r) => {
    const k = r.nz(-4, 4), vert = r.chance(), E = vert ? `x = ${k}` : `y = ${k}`, v = r.int(0, 2);
    if (v === 0) return { q: T(`On the Cartesian plane, draw the line $${E}$.`, `Pada satah Cartes, lukiskan garis $${E}$.`), fig: PW({ x: [-5, 5], y: [-5, 5] }), a: T(vert ? `A vertical line through $(${k}, 0)$` : `A horizontal line through $(0, ${k})$`, vert ? `Garis mencancang melalui $(${k}, 0)$` : `Garis mengufuk melalui $(0, ${k})$`), w: W(vert ? T(`Every point on $x = ${k}$ has $x = ${k}$, for example $(${k}, -2)$, $(${k}, 0)$ and $(${k}, 2)$.`, `Setiap titik pada $x = ${k}$ mempunyai $x = ${k}$, contohnya $(${k}, -2)$, $(${k}, 0)$ dan $(${k}, 2)$.`) : T(`Every point on $y = ${k}$ has $y = ${k}$, for example $(-2, ${k})$, $(0, ${k})$ and $(2, ${k})$.`, `Setiap titik pada $y = ${k}$ mempunyai $y = ${k}$, contohnya $(-2, ${k})$, $(0, ${k})$ dan $(2, ${k})$.`), vert ? T(`Joining them gives a vertical line through $(${k}, 0)$.`, `Menyambungkannya memberi garis mencancang melalui $(${k}, 0)$.`) : T(`Joining them gives a horizontal line through $(0, ${k})$.`, `Menyambungkannya memberi garis mengufuk melalui $(0, ${k})$.`)), sp: 'xl' };
    if (v === 1) return { q: T(`Does the line $${E}$ cross the $x$-axis, the $y$-axis or both? State the crossing point(s).`, `Adakah garis $${E}$ menyilang paksi-$x$, paksi-$y$ atau kedua-duanya? Nyatakan titik persilangan.`), a: vert ? T(`Only the $x$-axis, at $(${k}, 0)$`, `Paksi-$x$ sahaja, di $(${k}, 0)$`) : T(`Only the $y$-axis, at $(0, ${k})$`, `Paksi-$y$ sahaja, di $(0, ${k})$`), w: W(vert ? T(`On $x = ${k}$ the $x$-coordinate is always $${k}$, never $0$, so the line never reaches the $y$-axis.`, `Pada $x = ${k}$, koordinat-$x$ sentiasa $${k}$, tidak pernah $0$, maka garis itu tidak pernah sampai ke paksi-$y$.`) : T(`On $y = ${k}$ the $y$-coordinate is always $${k}$, never $0$, so the line never reaches the $x$-axis.`, `Pada $y = ${k}$, koordinat-$y$ sentiasa $${k}$, tidak pernah $0$, maka garis itu tidak pernah sampai ke paksi-$x$.`), vert ? T(`It crosses the $x$-axis where $y = 0$, at $(${k}, 0)$.`, `Ia menyilang paksi-$x$ apabila $y = 0$, iaitu di $(${k}, 0)$.`) : T(`It crosses the $y$-axis where $x = 0$, at $(0, ${k})$.`, `Ia menyilang paksi-$y$ apabila $x = 0$, iaitu di $(0, ${k})$.`)), sp: 's' };
    const p = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)];
    return { q: T(`Write down the coordinates of three points on the line $${E}$ whose ${vert ? '$y$' : '$x$'}-coordinates are $${p.join(', ')}$.`, `Tuliskan koordinat tiga titik pada garis $${E}$ yang koordinat-${vert ? '$y$' : '$x$'}nya ialah $${p.join(', ')}$.`), a: T(p.map((z) => `$${vert ? ptS(k, z) : ptS(z, k)}$`).join(', ')), w: W(vert ? T(`On $x = ${k}$ the $x$-coordinate is always $${k}$, so pair $${k}$ with each given $y$-coordinate.`, `Pada $x = ${k}$, koordinat-$x$ sentiasa $${k}$, maka pasangkan $${k}$ dengan setiap koordinat-$y$ yang diberi.`) : T(`On $y = ${k}$ the $y$-coordinate is always $${k}$, so pair each given $x$-coordinate with $${k}$.`, `Pada $y = ${k}$, koordinat-$y$ sentiasa $${k}$, maka pasangkan setiap koordinat-$x$ yang diberi dengan $${k}$.`), T(p.map((z) => `$${vert ? ptS(k, z) : ptS(z, k)}$`).join(', '))), sp: 's' };
  };
  const eSc4 = (r) => {
    const s = r.pick(SC2)(r), L = solsNN(s.a, s.b, s.c, 0);
    need(s.a > 0 && s.b > 0 && L.length >= 3 && s.x0 <= 12 && s.y0 <= 12);
    const mx = Math.max(...L.map((z) => z[0])), my = Math.max(...L.map((z) => z[1]));
    need(mx <= 12 && my <= 12);
    const fig = PW({ x: [0, mx + 1], y: [0, my + 1], scale: 22, segs: [{ a: [0, s.c / s.b], b: [s.c / s.a, 0] }], pts: L.map((z) => ({ x: z[0], y: z[1], l: '' })) });
    need(s.c / s.b <= my + 1 && s.c / s.a <= mx + 1);
    const z = r.pick(L);
    return { q: T(`${s.st.en} The graph shows the possible pairs $(x, y)$ as dots on the line $${s.tex}$. Use the graph to find $y$ when $x = ${z[0]}$.`, `${s.st.ms} Graf menunjukkan pasangan $(x, y)$ yang mungkin sebagai titik pada garis $${s.tex}$. Gunakan graf untuk mencari $y$ apabila $x = ${z[0]}$.`), fig, a: T(`$y = ${z[1]}$`), w: W(T(`The dots are the pairs $(x, y)$ that fit $${s.tex}$.`, `Titik-titik itu ialah pasangan $(x, y)$ yang memenuhi $${s.tex}$.`), T(`At $x = ${z[0]}$ the dot is at height $${z[1]}$, so $y = ${z[1]}$.`, `Pada $x = ${z[0]}$, titik itu berada pada ketinggian $${z[1]}$, maka $y = ${z[1]}$.`), T(`Check: $${cn(s.a)}${br(z[0])} + ${cn(s.b)}${br(z[1])} = ${s.c}$`, `Semak: $${cn(s.a)}${br(z[0])} + ${cn(s.b)}${br(z[1])} = ${s.c}$`)), sp: 's' };
  };
  const ge64 = [eHV, ePts, eOnLine, eIntRead, eReadVal, eEqPoint, eClass, eMcGraph, eQuad, eDraw, eSc4];

    const quadsOf = (m, c) => { const o = new Set(); for (let x = -60; x <= 60; x += 0.5) { const y = Fr.val(F_(m)) * x + c; if (x && y) o.add(QUAD(x, y)); } return ['Q1', 'Q2', 'Q3', 'Q4'].filter((k) => o.has(k)); };
  const qList = (ks) => T(ks.map((k) => QN[k].en).join(', '), ks.map((k) => QN[k].ms).join(', '));
  const mEqGraph = (r) => {
    const L = rline(r, { half: true }), two = r.sample(L.pts, 2), nm = ['A', 'B'], v = r.int(0, 2);
    need(two[0][0] !== two[1][0]);
    const fig = PW({ x: [-6, 6], y: [-6, 6], lines: [L.ln], pts: two.map((z, i) => ({ x: z[0], y: z[1], l: nm[i] })) });
    const P = `A(${two[0][0]}, ${two[0][1]})`, Qp = `B(${two[1][0]}, ${two[1][1]})`;
    const pm = two[0][0] !== 0 ? two[0] : two[1], tail = L.c === 0 ? '' : ` ${sg(L.c)} ${ab(L.c)}`;
    const wEq = [T(`The line cuts the $y$-axis at $${L.c}$, so $c = ${L.c}$.`, `Garis itu memotong paksi-$y$ pada $${L.c}$, maka $c = ${L.c}$.`), T(`Use the point $(${pm[0]}, ${pm[1]})$: $${pm[1]} = m${br(pm[0])}${tail}$, so $m = ${tx(L.m)}$.`, `Gunakan titik $(${pm[0]}, ${pm[1]})$: $${pm[1]} = m${br(pm[0])}${tail}$, maka $m = ${tx(L.m)}$.`), T(`$${L.eq}$`)];
    if (v === 0) return { q: T(`The straight line passes through $${P}$ and $${Qp}$. Write down its equation in the form $y = mx + c$.`, `Garis lurus itu melalui $${P}$ dan $${Qp}$. Tuliskan persamaannya dalam bentuk $y = mx + c$.`), fig, a: T(`$${L.eq}$`), w: W(...wEq), sp: 's' };
    if (v === 1) return { q: T(`Read the $y$-intercept of the line from the graph and write the equation of the line.`, `Baca pintasan-$y$ bagi garis itu daripada graf dan tuliskan persamaan garis itu.`), fig, a: T(`$y$-intercept $${L.c}$; $${L.eq}$`, `Pintasan-$y$ $${L.c}$; $${L.eq}$`), w: W(...wEq), sp: 's' };
    return { q: T(`The line passes through the marked points $A$ and $B$. Find its equation and use it to find $y$ when $x = ${L.pts[0][0] + 1 > 5 ? 0 : L.pts[0][0] + 1}$.`, `Garis itu melalui titik $A$ dan $B$ yang ditandakan. Cari persamaannya dan gunakannya untuk mencari $y$ apabila $x = ${L.pts[0][0] + 1 > 5 ? 0 : L.pts[0][0] + 1}$.`), fig, a: T(`$${L.eq}$; $y = ${tx(Fr.add(Fr.mul(L.m, Q(L.pts[0][0] + 1 > 5 ? 0 : L.pts[0][0] + 1)), Q(L.c)))}$`), w: W(...wEq, T(`Substitute $x = ${L.pts[0][0] + 1 > 5 ? 0 : L.pts[0][0] + 1}$: $y = ${tx(Fr.add(Fr.mul(L.m, Q(L.pts[0][0] + 1 > 5 ? 0 : L.pts[0][0] + 1)), Q(L.c)))}$`, `Gantikan $x = ${L.pts[0][0] + 1 > 5 ? 0 : L.pts[0][0] + 1}$: $y = ${tx(Fr.add(Fr.mul(L.m, Q(L.pts[0][0] + 1 > 5 ? 0 : L.pts[0][0] + 1)), Q(L.c)))}$`)), sp: 's' };
  };
  const mAreaAxes = (r) => {
    const p = r.nz(-6, 6), q = r.nz(-6, 6), v = r.int(0, 1), area = (ab(p) * ab(q)) / 2;
    const a = q, b = p, c = p * q;
    if (v === 0) return { q: T(`The line $${eq2(a, b, c)}$ meets the $x$-axis at $A$ and the $y$-axis at $B$. Find the coordinates of $A$ and $B$, and the area of triangle $OAB$.`, `Garis $${eq2(a, b, c)}$ bertemu paksi-$x$ di $A$ dan paksi-$y$ di $B$. Cari koordinat $A$ dan $B$, dan luas segi tiga $OAB$.`), a: T(`$A = (${p}, 0)$, $B = (0, ${q})$; area $= ${n(area)}$ square units`, `$A = (${p}, 0)$, $B = (0, ${q})$; luas $= ${n(area)}$ unit persegi`), w: W(T(`At $A$ the line meets the $x$-axis, so $y = 0$: $${cn(a)}x = ${c}$, giving $x = ${p}$.`, `Di $A$ garis itu bertemu paksi-$x$, maka $y = 0$: $${cn(a)}x = ${c}$, memberi $x = ${p}$.`), T(`At $B$ the line meets the $y$-axis, so $x = 0$: $${cn(b)}y = ${c}$, giving $y = ${q}$.`, `Di $B$ garis itu bertemu paksi-$y$, maka $x = 0$: $${cn(b)}y = ${c}$, memberi $y = ${q}$.`), T(`Triangle $OAB$ has a right angle at $O$, with $OA = ${ab(p)}$ and $OB = ${ab(q)}$.`, `Segi tiga $OAB$ mempunyai sudut tegak di $O$, dengan $OA = ${ab(p)}$ dan $OB = ${ab(q)}$.`), T(`Area $= \\tfrac{1}{2} \\times ${ab(p)} \\times ${ab(q)} = ${n(area)}$ square units.`, `Luas $= \\tfrac{1}{2} \\times ${ab(p)} \\times ${ab(q)} = ${n(area)}$ unit persegi.`)), sp: 'm' };
    const fig = PW({ x: [-7, 7], y: [-7, 7], segs: [{ a: [p, 0], b: [0, q] }], lines: [{ m: -q / p, c: q }], pts: [{ x: p, y: 0, l: 'A' }, { x: 0, y: q, l: 'B' }] });
    return { q: T('The diagram shows a line cutting the axes at $A$ and $B$. Find the area of triangle $OAB$, where $O$ is the origin.', 'Rajah menunjukkan satu garis yang memotong paksi di $A$ dan $B$. Cari luas segi tiga $OAB$, dengan $O$ ialah asalan.'), fig, a: T(`$\\tfrac{1}{2} \\times ${ab(p)} \\times ${ab(q)} = ${n(area)}$ square units`, `$\\tfrac{1}{2} \\times ${ab(p)} \\times ${ab(q)} = ${n(area)}$ unit persegi`), w: W(T(`From the graph, $A = (${p}, 0)$ and $B = (0, ${q})$, so $OA = ${ab(p)}$ and $OB = ${ab(q)}$.`, `Daripada graf, $A = (${p}, 0)$ dan $B = (0, ${q})$, maka $OA = ${ab(p)}$ dan $OB = ${ab(q)}$.`), T(`The triangle has a right angle at the origin, so area $= \\tfrac{1}{2} \\times ${ab(p)} \\times ${ab(q)} = ${n(area)}$ square units.`, `Segi tiga itu mempunyai sudut tegak di asalan, maka luas $= \\tfrac{1}{2} \\times ${ab(p)} \\times ${ab(q)} = ${n(area)}$ unit persegi.`)), sp: 's' };
  };
  const mPlotted = (r) => {
    const L = rline(r), on = L.pts.slice(0, 5), fig = PW({ x: [-6, 6], y: [-6, 6], pts: on.map((z) => ({ x: z[0], y: z[1], l: '' })) }), v = r.int(0, 1);
    return { q: v === 0 ? T('The diagram shows five points which lie on a straight line. Draw the line and write down its equation in the form $y = mx + c$.', 'Rajah menunjukkan lima titik yang terletak pada satu garis lurus. Lukis garis itu dan tuliskan persamaannya dalam bentuk $y = mx + c$.') : T('The plotted points are all solutions of the same linear equation. Join them with a straight line and find the equation.', 'Titik-titik yang diplot semuanya penyelesaian bagi persamaan linear yang sama. Sambungkan titik-titik itu dengan garis lurus dan cari persamaannya.'), fig, a: T(`$${L.eq}$`), w: W(T(`Joining the dots gives a straight line that cuts the $y$-axis at $${L.c}$, so $c = ${L.c}$.`, `Menyambungkan titik-titik itu memberi garis lurus yang memotong paksi-$y$ pada $${L.c}$, maka $c = ${L.c}$.`), T(`From $(${on[0][0]}, ${on[0][1]})$ to $(${on[1][0]}, ${on[1][1]})$, $x$ increases by $${on[1][0] - on[0][0]}$ while $y$ changes by $${on[1][1] - on[0][1]}$, so $m = ${tx(L.m)}$.`, `Daripada $(${on[0][0]}, ${on[0][1]})$ ke $(${on[1][0]}, ${on[1][1]})$, $x$ bertambah $${on[1][0] - on[0][0]}$ manakala $y$ berubah $${on[1][1] - on[0][1]}$, maka $m = ${tx(L.m)}$.`), T(`$${L.eq}$`)), sp: 'm' };
  };
  const mReadBoth = (r) => {
    const L = rline(r, { c0: 1 }), zs = r.sample(L.pts.filter((z) => z[0] && z[1]), 2);
    need(zs.length === 2 && zs[0][0] !== zs[1][0]);
    return { q: T(`Use the graph of $${L.eq}$ to find (a) the value of $y$ when $x = ${zs[0][0]}$, (b) the value of $x$ when $y = ${zs[1][1]}$.`, `Gunakan graf $${L.eq}$ untuk mencari (a) nilai $y$ apabila $x = ${zs[0][0]}$, (b) nilai $x$ apabila $y = ${zs[1][1]}$.`), fig: PW({ x: [-6, 6], y: [-6, 6], lines: [L.ln] }), a: T(`(a) $${zs[0][1]}$ (b) $${zs[1][0]}$`), w: W(T(`(a) Go up from $x = ${zs[0][0]}$ to the line and read across: $y = ${zs[0][1]}$ (check with $${L.eq}$).`, `(a) Naik dari $x = ${zs[0][0]}$ ke garis itu dan baca ke sisi: $y = ${zs[0][1]}$ (semak dengan $${L.eq}$).`), T(`(b) Go across from $y = ${zs[1][1]}$ to the line and read down: $x = ${zs[1][0]}$.`, `(b) Bergerak dari $y = ${zs[1][1]}$ ke garis itu dan baca ke bawah: $x = ${zs[1][0]}$.`)), sp: 's' };
  };
  const mQuad = (r) => {
    const m = r.pick([1, -1, 2, -2, 3, -3]), c = r.int(-4, 4), ks = quadsOf(m, c), v = r.int(0, 1);
    if (v === 0) return { q: T(`The line $${yEq(m, c)}$ is drawn on the Cartesian plane. Through which quadrants does it pass?`, `Garis $${yEq(m, c)}$ dilukis pada satah Cartes. Melalui sukuan yang manakah ia lalu?`), fig: PW({ x: [-6, 6], y: [-6, 6], lines: [{ m, c }] }), a: qList(ks), w: W(T(`Work out a few points: $x = -2, 0, 2$ give $y = ${[-2, 0, 2].map((x) => m * x + c).join(',\\ ')}$.`, `Kira beberapa titik: $x = -2, 0, 2$ memberi $y = ${[-2, 0, 2].map((x) => m * x + c).join(',\\ ')}$.`), T('Extend the line far enough in both directions and see which quadrants it enters.', 'Panjangkan garis itu cukup jauh ke kedua-dua arah dan lihat sukuan yang dimasukinya.'), cat(T('It passes through ', 'Ia melalui '), qList(ks), T('.', '.'))), sp: 's' };
    return { q: T(`Complete a table of values for $${yEq(m, c)}$ using $x = -2, -1, 0, 1, 2$ and hence state the quadrants through which the line passes.`, `Lengkapkan jadual nilai bagi $${yEq(m, c)}$ dengan menggunakan $x = -2, -1, 0, 1, 2$ dan seterusnya nyatakan sukuan yang dilalui garis itu.`), a: T(`$y = ${[-2, -1, 0, 1, 2].map((x) => m * x + c).join(',\\ ')}$; ${qList(ks).en}`, `$y = ${[-2, -1, 0, 1, 2].map((x) => m * x + c).join(',\\ ')}$; ${qList(ks).ms}`), w: W(T(`Substitute each $x$ into $${yEq(m, c)}$: $y = ${[-2, -1, 0, 1, 2].map((x) => m * x + c).join(',\\ ')}$.`, `Gantikan setiap $x$ ke dalam $${yEq(m, c)}$: $y = ${[-2, -1, 0, 1, 2].map((x) => m * x + c).join(',\\ ')}$.`), T('Plot the points, join them and extend the line in both directions.', 'Plot titik-titik itu, sambungkannya dan panjangkan garis itu ke kedua-dua arah.'), cat(T('The line passes through ', 'Garis itu melalui '), qList(ks), T('.', '.'))), sp: 'm' };
  };
  const mCompare = (r) => {
    const px = r.int(-3, 3), py = r.int(-3, 3), m1 = r.pick([1, 2, -1]), m2 = r.pick([-2, -1, 3, 0.5]);
    need(m1 !== m2 && Number.isInteger(m2) && m2 !== 0);
    const c1 = py - m1 * px, c2 = py - m2 * px;
    need(ab(c1) <= 5 && ab(c2) <= 5 && c1 !== c2);
    const fig = PW({ x: [-6, 6], y: [-6, 6], lines: [{ m: m1, c: c1, label: 'l₁' }, { m: m2, c: c2, label: 'l₂' }] });
    return { q: T(`The diagram shows the lines $l_1: ${yEq(m1, c1)}$ and $l_2: ${yEq(m2, c2)}$. (a) Write down the coordinates of the point where they meet. (b) Which line has the larger $y$-intercept?`, `Rajah menunjukkan garis $l_1: ${yEq(m1, c1)}$ dan $l_2: ${yEq(m2, c2)}$. (a) Tuliskan koordinat titik pertemuan kedua-dua garis itu. (b) Garis yang manakah mempunyai pintasan-$y$ yang lebih besar?`), fig, a: T(`(a) $(${px}, ${py})$ (b) $l_${c1 > c2 ? 1 : 2}$ ($${Math.max(c1, c2)}$)`), w: W(T(`(a) The point where they meet lies on both lines. At $x = ${px}$, $l_1$ gives $y = ${py}$ and $l_2$ also gives $y = ${py}$, so they meet at $(${px}, ${py})$.`, `(a) Titik pertemuan terletak pada kedua-dua garis. Pada $x = ${px}$, $l_1$ memberi $y = ${py}$ dan $l_2$ juga memberi $y = ${py}$, maka kedua-duanya bertemu di $(${px}, ${py})$.`), T(`(b) The $y$-intercept is the constant term: $${c1}$ for $l_1$ and $${c2}$ for $l_2$, so $l_${c1 > c2 ? 1 : 2}$ has the larger one, $${Math.max(c1, c2)}$.`, `(b) Pintasan-$y$ ialah sebutan pemalar: $${c1}$ bagi $l_1$ dan $${c2}$ bagi $l_2$, maka $l_${c1 > c2 ? 1 : 2}$ mempunyai yang lebih besar, iaitu $${Math.max(c1, c2)}$.`)), sp: 's' };
  };
  const mDraw = (r) => {
    const m = r.pick([-3, -2, -1, 1, 2, 3]), c = r.int(-4, 4), xs = [-2, -1, 0, 1, 2], ys = xs.map((x) => m * x + c), v = r.int(0, 1);
    const tab = SPM.table([['$x$'].concat(xs.map((z) => `$${z}$`)), ['$y$'].concat(xs.map(() => ''))]);
    if (v === 0) return { q: T(`Complete the table for $${yEq(m, c)}$, plot the points and draw the straight line. State the coordinates of the point where the line crosses the $y$-axis.<br>${tab}`, `Lengkapkan jadual bagi $${yEq(m, c)}$, plot titik-titik itu dan lukis garis lurus. Nyatakan koordinat titik apabila garis itu menyilang paksi-$y$.<br>${tab}`), fig: PW({ x: [-4, 4], y: [-8, 8], scale: 18 }), a: T(`$y = ${ys.join(',\\ ')}$; crosses at $(0, ${c})$`, `$y = ${ys.join(',\\ ')}$; menyilang di $(0, ${c})$`), w: W(T(`Substitute each $x$ into $${yEq(m, c)}$: $y = ${ys.join(',\\ ')}$.`, `Gantikan setiap $x$ ke dalam $${yEq(m, c)}$: $y = ${ys.join(',\\ ')}$.`), T('Plot the five points and join them with a straight line.', 'Plot lima titik itu dan sambungkannya dengan garis lurus.'), T(`The line crosses the $y$-axis where $x = 0$, so at $(0, ${c})$.`, `Garis itu menyilang paksi-$y$ apabila $x = 0$, iaitu di $(0, ${c})$.`)), sp: 'xl' };
    const a = r.int(1, 3), b = r.pick([1, 2]), cc = a * r.int(-2, 3) + b * r.int(-3, 3), xv = [0, b, 2 * b, -b].map((z) => z), yv = xv.map((x) => Fr.div(Fr.sub(Q(cc), Q(a * x)), Q(b)));
    need(yv.every((z) => z.d === 1));
    const tb = SPM.table([['$x$'].concat(xv.map((z) => `$${z}$`)), ['$y$'].concat(xv.map(() => ''))]);
    return { q: T(`Complete the table of values for $${eq2(a, b, cc)}$ and draw its graph on a Cartesian plane.<br>${tb}`, `Lengkapkan jadual nilai bagi $${eq2(a, b, cc)}$ dan lukis grafnya pada satah Cartes.<br>${tb}`), fig: PW({ x: [-5, 5], y: [-7, 7], scale: 18 }), a: T(`$y = ${yv.map((z) => tx(z)).join(',\\ ')}$`), w: W(T(`Put each value of $x$ into $${eq2(a, b, cc)}$ and solve for $y$.`, `Masukkan setiap nilai $x$ ke dalam $${eq2(a, b, cc)}$ dan selesaikan untuk $y$.`), ...xv.map((z, i) => T(`$x = ${z}$: $${cn(b)}y = ${redu(cc, a * z)}$, $y = ${tx(yv[i])}$`)), T('Plot the points and join them with a straight line.', 'Plot titik-titik itu dan sambungkannya dengan garis lurus.')), sp: 'xl' };
  };
  const NOINT = [
    [T('Does the line $y = 3$ have an $x$-intercept? Explain.', 'Adakah garis $y = 3$ mempunyai pintasan-$x$? Terangkan.'), T('No. It is horizontal and parallel to the $x$-axis, so it never meets it.', 'Tidak. Ia mengufuk dan selari dengan paksi-$x$, maka tidak pernah bertemu paksi itu.')],
    [T('Does the line $x = -2$ have a $y$-intercept? Explain.', 'Adakah garis $x = -2$ mempunyai pintasan-$y$? Terangkan.'), T('No. It is vertical and parallel to the $y$-axis, so it never meets it.', 'Tidak. Ia mencancang dan selari dengan paksi-$y$, maka tidak pernah bertemu paksi itu.')],
    [T('The line $y = 2x$ passes through the origin. What are its $x$-intercept and $y$-intercept?', 'Garis $y = 2x$ melalui asalan. Apakah pintasan-$x$ dan pintasan-$y$ bagi garis itu?'), T('Both are 0, because it meets both axes at $(0, 0)$.', 'Kedua-duanya 0 kerana ia bertemu kedua-dua paksi di $(0, 0)$.')],
    [T('Can a straight line have no intercept on either axis? Explain.', 'Bolehkah satu garis lurus tidak mempunyai pintasan pada kedua-dua paksi? Terangkan.'), T('No. A line that is parallel to one axis must cross the other axis.', 'Tidak. Garis yang selari dengan satu paksi mesti menyilang paksi yang satu lagi.')],
    [T('Why does the graph of $y = 5$ have the same $y$-coordinate at every point?', 'Mengapakah graf $y = 5$ mempunyai koordinat-$y$ yang sama pada setiap titik?'), T('The equation says $y$ is always 5, whatever the value of $x$.', 'Persamaan itu menyatakan $y$ sentiasa 5, walau apa pun nilai $x$.')],
  ];
  const mNoInt = (r) => { const z = r.pick(NOINT); return { q: z[0], a: z[1], w: W(T('An intercept on an axis is a point where the line actually meets that axis.', 'Pintasan pada suatu paksi ialah titik apabila garis itu benar-benar bertemu paksi tersebut.'), z[1]), sp: 's' }; };
  const mRect = (r) => {
    const [a, b] = r.sample([-4, -3, -2, -1, 1, 2, 3, 4], 2).sort((p, q) => p - q), [c, d] = r.sample([-4, -3, -2, -1, 1, 2, 3, 4], 2).sort((p, q) => p - q);
    const fig = PW({ x: [-5, 5], y: [-5, 5], vlines: [a, b], lines: [{ m: 0, c }, { m: 0, c: d }] }), v = r.int(0, 1);
    return { q: v === 0 ? T(`The lines $x = ${a}$, $x = ${b}$, $y = ${c}$ and $y = ${d}$ form a rectangle. Write down the coordinates of its four vertices.`, `Garis $x = ${a}$, $x = ${b}$, $y = ${c}$ dan $y = ${d}$ membentuk sebuah segi empat tepat. Tuliskan koordinat keempat-empat bucunya.`) : T(`The diagram shows the lines $x = ${a}$, $x = ${b}$, $y = ${c}$ and $y = ${d}$. Find the perimeter and the area of the rectangle they enclose.`, `Rajah menunjukkan garis $x = ${a}$, $x = ${b}$, $y = ${c}$ dan $y = ${d}$. Cari perimeter dan luas segi empat tepat yang dikelilingi oleh garis-garis itu.`), fig, a: v === 0 ? T(`$(${a}, ${c}), (${b}, ${c}), (${b}, ${d}), (${a}, ${d})$`) : T(`Perimeter $${2 * ((b - a) + (d - c))}$, area $${(b - a) * (d - c)}$`, `Perimeter $${2 * ((b - a) + (d - c))}$, luas $${(b - a) * (d - c)}$`), w: v === 0 ? W(T(`Each corner is where one of the vertical lines meets one of the horizontal lines, so take $x = ${a}$ or $x = ${b}$ with $y = ${c}$ or $y = ${d}$.`, `Setiap bucu ialah tempat salah satu garis mencancang bertemu salah satu garis mengufuk, maka ambil $x = ${a}$ atau $x = ${b}$ dengan $y = ${c}$ atau $y = ${d}$.`), T(`$(${a}, ${c}), (${b}, ${c}), (${b}, ${d}), (${a}, ${d})$`)) : W(T(`Width $= ${dif(b, a)} = ${b - a}$ and height $= ${dif(d, c)} = ${d - c}$.`, `Lebar $= ${dif(b, a)} = ${b - a}$ dan tinggi $= ${dif(d, c)} = ${d - c}$.`), T(`Perimeter $= 2(${b - a} + ${d - c}) = ${2 * ((b - a) + (d - c))}$`, `Perimeter $= 2(${b - a} + ${d - c}) = ${2 * ((b - a) + (d - c))}$`), T(`Area $= ${b - a} \\times ${d - c} = ${(b - a) * (d - c)}$`, `Luas $= ${b - a} \\times ${d - c} = ${(b - a) * (d - c)}$`)), sp: 's' };
  };
  const mSc5 = (r) => {
    const s = r.pick(SC2)(r), L = solsNN(s.a, s.b, s.c, 0);
    need(s.a > 0 && s.b > 0 && L.length >= 3);
    const mx = Math.max(...L.map((z) => z[0])), my = Math.max(...L.map((z) => z[1]));
    need(mx <= 12 && my <= 12 && s.c / s.b <= my + 2 && s.c / s.a <= mx + 2);
    const fig = PW({ x: [0, Math.max(mx, s.c / s.a) + 1], y: [0, Math.max(my, s.c / s.b) + 1], scale: 22, segs: [{ a: [0, s.c / s.b], b: [s.c / s.a, 0] }], pts: L.map((z) => ({ x: z[0], y: z[1], l: '' })) });
    const big = L.reduce((b, z) => (z[0] + z[1] > b[0] + b[1] ? z : b), L[0]);
    return { q: T(`${s.st.en} The line $${s.tex}$ is drawn with the possible pairs marked by dots. (a) How many possible pairs are there? (b) Which pair has the greatest value of $x + y$?`, `${s.st.ms} Garis $${s.tex}$ dilukis dengan pasangan yang mungkin ditandakan dengan titik. (a) Berapakah bilangan pasangan yang mungkin? (b) Pasangan yang manakah mempunyai nilai $x + y$ yang paling besar?`), fig, a: T(`(a) ${L.length} (b) $${ptS(big[0], big[1])}$`), w: W(T(`(a) Count the dots: the pairs of whole numbers that fit $${s.tex}$ are $${L.map((z) => ptS(z[0], z[1])).join(',\\ ')}$, so there are ${L.length}.`, `(a) Bilang titik itu: pasangan nombor bulat yang memenuhi $${s.tex}$ ialah $${L.map((z) => ptS(z[0], z[1])).join(',\\ ')}$, maka bilangannya ${L.length}.`), T(`(b) Work out $x + y$ for each pair: ${L.map((z) => `$${z[0] + z[1]}$`).join(', ')}.`, `(b) Kira $x + y$ bagi setiap pasangan: ${L.map((z) => `$${z[0] + z[1]}$`).join(', ')}.`), T(`The greatest is $${big[0] + big[1]}$, at $${ptS(big[0], big[1])}$.`, `Yang paling besar ialah $${big[0] + big[1]}$, pada $${ptS(big[0], big[1])}$.`)), sp: 's' };
  };
  const gm64 = [mEqGraph, mAreaAxes, mPlotted, mReadBoth, mQuad, mCompare, mDraw, mNoInt, mRect, mSc5];

    const aTriangle = (r) => {
    const L = rline(r, { ms: [1, -1, 2, -2] }), k = r.nz(-4, 4), h = r.nz(-4, 4), mm = Fr.val(L.m);
    const yk = mm * k + L.c, xh = (h - L.c) / mm;
    need(Number.isInteger(xh) && ab(xh) <= 5 && ab(yk) <= 5 && xh !== k && yk !== h);
    const base = ab(xh - k), height = ab(yk - h), fig = PW({ x: [-6, 6], y: [-6, 6], lines: [L.ln, { m: 0, c: h }], vlines: [k] });
    return { q: T(`The diagram shows the lines $${L.eq}$, $x = ${k}$ and $y = ${h}$. They form a triangle. (a) Write down the coordinates of the three vertices. (b) Find the area of the triangle.`, `Rajah menunjukkan garis $${L.eq}$, $x = ${k}$ dan $y = ${h}$. Ketiga-tiga garis itu membentuk sebuah segi tiga. (a) Tuliskan koordinat ketiga-tiga bucu. (b) Cari luas segi tiga itu.`), fig, a: T(`(a) $(${k}, ${h}),\\ (${k}, ${yk}),\\ (${xh}, ${h})$ (b) $${n((base * height) / 2)}$ square units`, `(a) $(${k}, ${h}),\\ (${k}, ${yk}),\\ (${xh}, ${h})$ (b) $${n((base * height) / 2)}$ unit persegi`), w: W(T(`(a) $x = ${k}$ meets $y = ${h}$ at $(${k}, ${h})$.`, `(a) $x = ${k}$ bertemu $y = ${h}$ di $(${k}, ${h})$.`), T(`$x = ${k}$ meets $${L.eq}$ where $y = ${yk}$, at $(${k}, ${yk})$.`, `$x = ${k}$ bertemu $${L.eq}$ apabila $y = ${yk}$, iaitu di $(${k}, ${yk})$.`), T(`$y = ${h}$ meets $${L.eq}$ where $x = ${xh}$, at $(${xh}, ${h})$.`, `$y = ${h}$ bertemu $${L.eq}$ apabila $x = ${xh}$, iaitu di $(${xh}, ${h})$.`), T(`(b) The right angle is at $(${k}, ${h})$: base $= ${base}$, height $= ${height}$.`, `(b) Sudut tegak berada di $(${k}, ${h})$: tapak $= ${base}$, tinggi $= ${height}$.`), T(`Area $= \\tfrac{1}{2} \\times ${base} \\times ${height} = ${n((base * height) / 2)}$ square units.`, `Luas $= \\tfrac{1}{2} \\times ${base} \\times ${height} = ${n((base * height) / 2)}$ unit persegi.`)), sp: 'm' };
  };
  const aFromPoints = (r) => {
    const L = rline(r, { half: true }), two = r.sample(L.pts, 2), R = r.chance() ? r.pick(L.pts) : [r.int(-4, 4), r.int(-4, 4)];
    need(two[0][0] !== two[1][0] && !two.some((z) => z[0] === R[0] && z[1] === R[1]));
    const onIt = Fr.cmp(Fr.add(Fr.mul(L.m, Q(R[0])), Q(L.c)), Q(R[1])) === 0;
    return { q: T(`The straight line passes through $P(${two[0][0]}, ${two[0][1]})$ and $Q(${two[1][0]}, ${two[1][1]})$. (a) Find the equation of the line in the form $y = mx + c$. (b) Does $R(${R[0]}, ${R[1]})$ lie on the line?`, `Garis lurus itu melalui $P(${two[0][0]}, ${two[0][1]})$ dan $Q(${two[1][0]}, ${two[1][1]})$. (a) Cari persamaan garis itu dalam bentuk $y = mx + c$. (b) Adakah $R(${R[0]}, ${R[1]})$ terletak pada garis itu?`), fig: PW({ x: [-6, 6], y: [-6, 6], lines: [L.ln], pts: [{ x: two[0][0], y: two[0][1], l: 'P' }, { x: two[1][0], y: two[1][1], l: 'Q' }] }), a: T(`(a) $${L.eq}$ (b) ${onIt ? 'Yes' : 'No'}`, `(a) $${L.eq}$ (b) ${onIt ? 'Ya' : 'Tidak'}`), w: W(T(`(a) The line cuts the $y$-axis at $${L.c}$, so $c = ${L.c}$.`, `(a) Garis itu memotong paksi-$y$ pada $${L.c}$, maka $c = ${L.c}$.`), T(`Use $${two[0][0] !== 0 ? `P(${two[0][0]}, ${two[0][1]})` : `Q(${two[1][0]}, ${two[1][1]})`}$: $${two[0][0] !== 0 ? two[0][1] : two[1][1]} = m${br(two[0][0] !== 0 ? two[0][0] : two[1][0])}${L.c === 0 ? '' : ` ${sg(L.c)} ${ab(L.c)}`}$, so $m = ${tx(L.m)}$, giving $${L.eq}$.`, `Gunakan $${two[0][0] !== 0 ? `P(${two[0][0]}, ${two[0][1]})` : `Q(${two[1][0]}, ${two[1][1]})`}$: $${two[0][0] !== 0 ? two[0][1] : two[1][1]} = m${br(two[0][0] !== 0 ? two[0][0] : two[1][0])}${L.c === 0 ? '' : ` ${sg(L.c)} ${ab(L.c)}`}$, maka $m = ${tx(L.m)}$, memberi $${L.eq}$.`), T(`(b) Substitute $x = ${R[0]}$ into $${L.eq}$: $y = ${tx(Fr.add(Fr.mul(L.m, Q(R[0])), Q(L.c)))}$.`, `(b) Gantikan $x = ${R[0]}$ ke dalam $${L.eq}$: $y = ${tx(Fr.add(Fr.mul(L.m, Q(R[0])), Q(L.c)))}$.`), onIt ? T(`This is the $y$-coordinate of $R$, so $R$ lies on the line.`, `Ini ialah koordinat-$y$ bagi $R$, maka $R$ terletak pada garis itu.`) : T(`$R$ has $y = ${R[1]}$, so $R$ does not lie on the line.`, `$R$ mempunyai $y = ${R[1]}$, maka $R$ tidak terletak pada garis itu.`)), sp: 'm' };
  };
  const aScale = (r) => {
    const m = r.pick([1, -1, 2, -2, Q(1, 2), Q(-1, 2)]), M = F_(m), c = 2 * r.int(-3, 3), pts = [];
    for (let x = -10; x <= 10; x += 2) { const y = Fr.add(Fr.mul(M, Q(x)), Q(c)); if (y.d === 1 && y.n % 2 === 0 && ab(y.n) <= 10) pts.push([x, y.n]); }
    need(pts.length >= 3);
    const two = r.sample(pts, 2), v = r.int(0, 1);
    need(two[0][0] !== two[1][0]);
    const fig = S.plane({ x: [-10, 10], y: [-10, 10], scale: 13, labelStep: 2, lines: [{ m: Fr.val(M), c }], pts: two.map((z, i) => ({ x: z[0], y: z[1], l: ['A', 'B'][i] })) });
    const eqs = yEq(M, c);
    if (v === 0) return { q: T(`On the diagram each gridline is 1 unit and the axes are labelled every 2 units. The line passes through $A(${two[0][0]}, ${two[0][1]})$ and $B(${two[1][0]}, ${two[1][1]})$. Find the $y$-intercept and the equation of the line.`, `Pada rajah setiap garis grid ialah 1 unit dan paksi dilabel setiap 2 unit. Garis itu melalui $A(${two[0][0]}, ${two[0][1]})$ dan $B(${two[1][0]}, ${two[1][1]})$. Cari pintasan-$y$ dan persamaan garis itu.`), fig, a: T(`$y$-intercept $${c}$; $${eqs}$`, `Pintasan-$y$ $${c}$; $${eqs}$`), w: W(T('Read the labels carefully: one gridline is $1$ unit even though only every second one is numbered.', 'Baca label dengan teliti: satu garis grid ialah $1$ unit walaupun hanya setiap garis kedua dinomborkan.'), T(`The line cuts the $y$-axis at $${c}$, so $c = ${c}$.`, `Garis itu memotong paksi-$y$ pada $${c}$, maka $c = ${c}$.`), T(`Use $A(${two[0][0]}, ${two[0][1]})$ or $B(${two[1][0]}, ${two[1][1]})$ to get $m = ${tx(M)}$.`, `Gunakan $A(${two[0][0]}, ${two[0][1]})$ atau $B(${two[1][0]}, ${two[1][1]})$ untuk mendapatkan $m = ${tx(M)}$.`), T(`$${eqs}$`)), sp: 'm' };
    const xi = Fr.div(Q(-c), M);
    return { q: T(`The line $${eqs}$ is drawn with the axes labelled every 2 units. Find where it crosses (a) the $y$-axis, (b) the $x$-axis.`, `Garis $${eqs}$ dilukis dengan paksi dilabel setiap 2 unit. Cari tempat garis itu menyilang (a) paksi-$y$, (b) paksi-$x$.`), fig, a: T(`(a) $(0, ${c})$ (b) $(${tx(xi)}, 0)$`), w: W(T(`(a) On the $y$-axis $x = 0$, so $y = ${c}$: the point is $(0, ${c})$.`, `(a) Pada paksi-$y$, $x = 0$, maka $y = ${c}$: titiknya ialah $(0, ${c})$.`), T(`(b) On the $x$-axis $y = 0$: $0 = ${eqs.replace('y = ', '')}$, so $x = ${tx(xi)}$.`, `(b) Pada paksi-$x$, $y = 0$: $0 = ${eqs.replace('y = ', '')}$, maka $x = ${tx(xi)}$.`), T(`The point is $(${tx(xi)}, 0)$.`, `Titiknya ialah $(${tx(xi)}, 0)$.`)), sp: 's' };
  };
  const aCtx = (r) => {
    const s = r.pick(SC2)(r), L = solsNN(s.a, s.b, s.c, 0);
    need(s.a > 0 && s.b > 0 && L.length >= 3 && L.length <= 10);
    const mx = Math.max(...L.map((z) => z[0])), my = Math.max(...L.map((z) => z[1]));
    need(mx <= 12 && my <= 12 && s.c / s.b <= my + 2 && s.c / s.a <= mx + 2);
    const fig = PW({ x: [0, Math.max(mx, s.c / s.a) + 1], y: [0, Math.max(my, s.c / s.b) + 1], scale: 22, segs: [{ a: [0, s.c / s.b], b: [s.c / s.a, 0] }], pts: L.map((z) => ({ x: z[0], y: z[1], l: '' })) });
    const z = r.pick(L);
    return { q: T(`${s.st.en} (a) Write an equation. (b) The graph shows the line and the possible pairs. Explain why only the marked points, and not every point on the line, are possible. (c) If $x = ${z[0]}$, what is $y$?`, `${s.st.ms} (a) Tulis satu persamaan. (b) Graf menunjukkan garis itu dan pasangan yang mungkin. Terangkan mengapa hanya titik yang ditandakan, dan bukan setiap titik pada garis itu, yang mungkin. (c) Jika $x = ${z[0]}$, berapakah $y$?`), fig, a: T(`(a) $${s.tex}$ (b) $x$ and $y$ are counts, so they must be whole numbers (not negative) (c) $y = ${z[1]}$`, `(a) $${s.tex}$ (b) $x$ dan $y$ ialah bilangan, maka mesti nombor bulat (tidak negatif) (c) $y = ${z[1]}$`), w: W(T(`(a) $${s.tex}$`), T(`(b) A point such as $(1.5, \\ldots)$ satisfies the equation but cannot describe the situation, because ${s.nx.en} and ${s.ny.en} are counted in whole numbers that are not negative.`, `(b) Titik seperti $(1.5, \\ldots)$ memenuhi persamaan itu tetapi tidak boleh menggambarkan situasi ini, kerana ${s.nx.ms} dan ${s.ny.ms} dibilang dalam nombor bulat yang tidak negatif.`), T(`(c) Substitute $x = ${z[0]}$: $${cn(s.b)}y = ${redu(s.c, s.a * z[0])}$, so $y = ${z[1]}$.`, `(c) Gantikan $x = ${z[0]}$: $${cn(s.b)}y = ${redu(s.c, s.a * z[0])}$, maka $y = ${z[1]}$.`)), sp: 'm' };
  };
  const TFG = [
    [T('The line $y = 4$ passes through $(4, 0)$.', 'Garis $y = 4$ melalui $(4, 0)$.'), false, T('Every point on $y = 4$ has $y = 4$; $(4, 0)$ has $y = 0$. The point $(0, 4)$ is on the line.', 'Setiap titik pada $y = 4$ mempunyai $y = 4$; $(4, 0)$ mempunyai $y = 0$. Titik $(0, 4)$ terletak pada garis itu.')],
    [T('The line $x = 3$ is parallel to the $y$-axis.', 'Garis $x = 3$ selari dengan paksi-$y$.'), true, T('It is vertical and every point has $x = 3$.', 'Ia mencancang dan setiap titik mempunyai $x = 3$.')],
    [T('Two points are enough to draw the graph of a linear equation in two variables, but a third point is a useful check.', 'Dua titik sudah cukup untuk melukis graf persamaan linear dalam dua pemboleh ubah, tetapi titik ketiga berguna untuk menyemak.'), true, T('Only one straight line passes through two points; a third point on it confirms there is no error.', 'Hanya satu garis lurus melalui dua titik; titik ketiga pada garis itu mengesahkan tiada kesilapan.')],
    [T('Every point on the graph of $2x + y = 6$ is a solution of the equation, and every solution is a point on the graph.', 'Setiap titik pada graf $2x + y = 6$ ialah penyelesaian bagi persamaan itu, dan setiap penyelesaian ialah titik pada graf itu.'), true, T('The graph is the set of all solutions.', 'Graf ialah set semua penyelesaian.')],
    [T('The graph of $x + y = 5$ has both an $x$-intercept and a $y$-intercept, and they are equal.', 'Graf $x + y = 5$ mempunyai pintasan-$x$ dan pintasan-$y$, dan kedua-duanya sama.'), true, T('When $y = 0$, $x = 5$; when $x = 0$, $y = 5$.', 'Apabila $y = 0$, $x = 5$; apabila $x = 0$, $y = 5$.')],
    [T('The point $(2, 5)$ lies on the line $y = 2x + 3$ because $5 = 2 + 3$.', 'Titik $(2, 5)$ terletak pada garis $y = 2x + 3$ kerana $5 = 2 + 3$.'), false, T('The correct substitution is $2(2) + 3 = 7$, not 5, so $(2, 5)$ is not on the line.', 'Penggantian yang betul ialah $2(2) + 3 = 7$, bukan 5, maka $(2, 5)$ tidak terletak pada garis itu.')],
  ];
  const aTF4 = (r) => { const t = r.pick(TFG); return { q: T(`True or false? ${t[0].en} Give a reason.`, `Benar atau palsu? ${t[0].ms} Berikan satu sebab.`), a: T(`${t[1] ? 'True' : 'False'}. ${t[2].en}`, `${t[1] ? 'Benar' : 'Palsu'}. ${t[2].ms}`), w: W(t[2], T(`So the statement is ${t[1] ? 'true' : 'false'}.`, `Maka pernyataan itu ${t[1] ? 'benar' : 'palsu'}.`)), sp: 's' }; };
  const aFindPQ = (r) => {
    const xi = r.nz(-6, 6), yi = r.nz(-6, 6), L = SPM.lcm(ab(xi), ab(yi)) * r.pick([1, 2]), p = L / xi, q = L / yi;
    need(ab(p) <= 12 && ab(q) <= 12);
    return { q: T(`The line $px + qy = ${L}$ crosses the $x$-axis at $(${xi}, 0)$ and the $y$-axis at $(0, ${yi})$. Find $p$ and $q$.`, `Garis $px + qy = ${L}$ menyilang paksi-$x$ di $(${xi}, 0)$ dan paksi-$y$ di $(0, ${yi})$. Cari $p$ dan $q$.`), a: T(`$p = ${p}$, $q = ${q}$`), w: T(`$${xi}p = ${L}$ and $${yi}q = ${L}$`, `$${xi}p = ${L}$ dan $${yi}q = ${L}$`), sp: 's' };
  };
  const aFromInt = (r) => {
    const p = r.nz(-6, 6), q = r.nz(-6, 6), g = SPM.gcd(p, q), a = q / g, b = p / g, c = (p * q) / g;
    need(p !== q || true);
    const sgn = a < 0 ? -1 : 1;
    return { q: T(`A line has $x$-intercept ${p} and $y$-intercept ${q}. Write its equation in the form $ax + by = c$ with $a$, $b$ and $c$ as small whole numbers and $a > 0$.`, `Sebuah garis mempunyai pintasan-$x$ ${p} dan pintasan-$y$ ${q}. Tulis persamaannya dalam bentuk $ax + by = c$ dengan $a$, $b$ dan $c$ ialah nombor bulat yang kecil dan $a > 0$.`), a: T(`$${eq2(sgn * a, sgn * b, sgn * c)}$`), w: T(`$${q}x + ${p}y = ${p * q}$ simplified`.replace(`+ ${p}y`, `${sg(p)} ${ab(p)}y`), `$${q}x ${sg(p)} ${ab(p)}y = ${p * q}$ dipermudahkan`), sp: 's' };
  };
  const aThrough = (r) => {
    const k = r.nz(-4, 4), h = r.nz(-4, 4), m = r.pick([1, -1, 2, -2, 3]), c = h - m * k, v = r.int(0, 1);
    need(ab(c) <= 9);
    if (v === 0) return { q: T(`The line $y = ${m === 1 ? '' : m === -1 ? '-' : m}x + c$ passes through the point where the lines $x = ${k}$ and $y = ${h}$ meet. Find the value of $c$.`, `Garis $y = ${m === 1 ? '' : m === -1 ? '-' : m}x + c$ melalui titik pertemuan garis $x = ${k}$ dan $y = ${h}$. Cari nilai $c$.`), a: T(`$c = ${c}$`), w: T(`The meeting point is $(${k}, ${h})$`, `Titik pertemuan ialah $(${k}, ${h})$`), sp: 's' };
    return { q: T(`The lines $x = ${k}$, $y = ${h}$ and $y = mx ${sg(c)} ${ab(c)}$ all pass through the same point. Find the value of $m$.`, `Garis $x = ${k}$, $y = ${h}$ dan $y = mx ${sg(c)} ${ab(c)}$ semuanya melalui titik yang sama. Cari nilai $m$.`), a: T(`$m = ${m}$`), w: T(`The common point is $(${k}, ${h})$`, `Titik sepunya ialah $(${k}, ${h})$`), sp: 's' };
  };
  const ga64 = [aTriangle, aFromPoints, aScale, aCtx, aTF4, aFindPQ, aFromInt, aThrough];
  /* graph stories: y = m x + c on x >= 0 (c can be 0; decreasing lines end on the x-axis) */
  const GC = [
    (m, c, nm) => ({ st: T(`A taxi charges a fixed fare of RM${c} plus RM${m} for every kilometre. The graph shows the fare RM$y$ for a journey of $x$ km.`, `Sebuah teksi mengenakan tambang tetap RM${c} campur RM${m} bagi setiap kilometer. Graf menunjukkan tambang RM$y$ bagi perjalanan $x$ km.`), iy: T('the fixed fare, charged even for 0 km', 'tambang tetap, yang dikenakan walaupun 0 km'), ux: T('km', 'km'), uy: T('RM', 'RM'), inc: 1 }),
    (m, c, nm) => ({ st: T(`A tank holds ${c} litres of water and is filled at ${m} litres per minute. The graph shows the volume $y$ litres after $x$ minutes.`, `Sebuah tangki mengandungi ${c} liter air dan diisi pada kadar ${m} liter seminit. Graf menunjukkan isi padu $y$ liter selepas $x$ minit.`), iy: T('the volume of water in the tank at the start', 'isi padu air dalam tangki pada permulaan'), ux: T('minutes', 'minit'), uy: T('litres', 'liter'), inc: 1 }),
    (m, c, nm) => ({ st: T(`${nm} has RM${c} in a money box and puts in RM${m} every week. The graph shows the total savings RM$y$ after $x$ weeks.`, `${nm} mempunyai RM${c} dalam tabung dan memasukkan RM${m} setiap minggu. Graf menunjukkan jumlah simpanan RM$y$ selepas $x$ minggu.`), iy: T('the amount in the money box at the start', 'jumlah dalam tabung pada permulaan'), ux: T('weeks', 'minggu'), uy: T('RM', 'RM'), inc: 1 }),
    (m, c, nm) => ({ st: T(`A gym charges a joining fee of RM${c} and RM${m} for each visit. The graph shows the total cost RM$y$ after $x$ visits.`, `Sebuah gim mengenakan yuran pendaftaran RM${c} dan RM${m} bagi setiap lawatan. Graf menunjukkan jumlah kos RM$y$ selepas $x$ lawatan.`), iy: T('the joining fee', 'yuran pendaftaran'), ux: T('visits', 'lawatan'), uy: T('RM', 'RM'), inc: 1 }),
    (m, c, nm) => ({ st: T(`A seedling is ${c} cm tall and grows ${m} cm every week. The graph shows its height $y$ cm after $x$ weeks.`, `Sebatang anak pokok setinggi ${c} cm dan tumbuh ${m} cm setiap minggu. Graf menunjukkan tingginya $y$ cm selepas $x$ minggu.`), iy: T('the height of the seedling at the start', 'ketinggian anak pokok pada permulaan'), ux: T('weeks', 'minggu'), uy: T('cm', 'cm'), inc: 1 }),
    (m, c, nm) => ({ st: T(`A cyclist rides from a point ${c} km from home and moves ${m} km further away every hour. The graph shows the distance $y$ km from home after $x$ hours.`, `Seorang penunggang basikal bertolak dari satu titik yang jaraknya ${c} km dari rumah dan bergerak ${m} km lebih jauh setiap jam. Graf menunjukkan jarak $y$ km dari rumah selepas $x$ jam.`), iy: T('the distance from home at the start', 'jarak dari rumah pada permulaan'), ux: T('hours', 'jam'), uy: T('km', 'km'), inc: 1 }),
    (m, c, nm) => ({ st: T(`A candle is ${c} cm tall and burns down ${m} cm every hour. The graph shows its height $y$ cm after $x$ hours.`, `Sebatang lilin setinggi ${c} cm dan terbakar ${m} cm setiap jam. Graf menunjukkan ketinggiannya $y$ cm selepas $x$ jam.`), iy: T('the height of the candle at the start', 'ketinggian lilin pada permulaan'), ix: T('the time when the candle has burnt out completely', 'masa apabila lilin habis terbakar sepenuhnya'), ux: T('hours', 'jam'), uy: T('cm', 'cm'), inc: 0 }),
    (m, c, nm) => ({ st: T(`A prepaid phone has RM${c} credit and uses RM${m} of credit each day. The graph shows the credit RM$y$ after $x$ days.`, `Sebuah telefon prabayar mempunyai kredit RM${c} dan menggunakan kredit RM${m} setiap hari. Graf menunjukkan kredit RM$y$ selepas $x$ hari.`), iy: T('the credit at the start', 'kredit pada permulaan'), ix: T('the day when the credit runs out', 'hari apabila kredit habis'), ux: T('days', 'hari'), uy: T('RM', 'RM'), inc: 0 }),
    (m, c, nm) => ({ st: T(`A tank containing ${c} litres of water has a leak of ${m} litres per minute. The graph shows the volume $y$ litres after $x$ minutes.`, `Sebuah tangki yang mengandungi ${c} liter air bocor pada kadar ${m} liter seminit. Graf menunjukkan isi padu $y$ liter selepas $x$ minit.`), iy: T('the volume of water at the start', 'isi padu air pada permulaan'), ix: T('the time when the tank is empty', 'masa apabila tangki kosong'), ux: T('minutes', 'minit'), uy: T('litres', 'liter'), inc: 0 }),
  ];
  const gcMake = (r, needInc) => {
    const g = r.pick(GC), nm = r.name(), m = r.int(2, 5), i = g(m, 1, nm);
    if (needInc !== undefined) need(i.inc === needInc);
    let c, k;
    if (i.inc) { c = r.int(1, 8); k = r.int(4, 7); } else { k = r.int(3, 7); c = m * k; need(c <= 20); }
    const e = g(m, c, nm), sl = i.inc ? m : -m, X = i.inc ? k : k, yEnd = sl * X + c;
    need(Math.max(c, yEnd) <= 26);
    const Y = Math.max(c, yEnd), ls = Y > 12 ? 2 : 1;
    const fig = S.plane({ x: [0, X + 1], y: [0, Y + 1], scale: Y > 12 ? 14 : 20, labelStep: ls, segs: [{ a: [0, c], b: [X, yEnd] }], pts: [{ x: 0, y: c, l: '' }, { x: X, y: yEnd, l: '' }] });
    return Object.assign(e, { m: sl, c, X, fig, yEnd, eq: yEq(sl, c), inc: i.inc });
  };
  const eGc = (r) => {
    const g = gcMake(r), v = r.int(0, 1), x0 = r.int(1, g.X - 1), y0 = g.m * x0 + g.c;
    if (v === 0) return { q: T(`${g.st.en} Use the graph to find $y$ when $x = ${x0}$.`, `${g.st.ms} Gunakan graf untuk mencari $y$ apabila $x = ${x0}$.`), fig: g.fig, a: T(`$y = ${y0}$`), w: W(T(`Go up from $x = ${x0}$ on the horizontal axis to the line, then read across to the vertical axis.`, `Naik dari $x = ${x0}$ pada paksi mengufuk sehingga garis, kemudian baca ke paksi mencancang.`), T(`Check with $${g.eq}$: $y = ${cn(g.m)}${br(x0)} ${sg(g.c)} ${ab(g.c)} = ${y0}$.`, `Semak dengan $${g.eq}$: $y = ${cn(g.m)}${br(x0)} ${sg(g.c)} ${ab(g.c)} = ${y0}$.`)), sp: 'xs' };
    return { q: T(`${g.st.en} Use the graph to find the value of $x$ when $y = ${y0}$.`, `${g.st.ms} Gunakan graf untuk mencari nilai $x$ apabila $y = ${y0}$.`), fig: g.fig, a: T(`$x = ${x0}$`), w: W(T(`Go across from $y = ${y0}$ on the vertical axis to the line, then read down to the horizontal axis.`, `Bergerak dari $y = ${y0}$ pada paksi mencancang sehingga garis, kemudian baca ke bawah ke paksi mengufuk.`), T(`Check with $${g.eq}$: $${cn(g.m)}${br(x0)} ${sg(g.c)} ${ab(g.c)} = ${y0}$, so $x = ${x0}$.`, `Semak dengan $${g.eq}$: $${cn(g.m)}${br(x0)} ${sg(g.c)} ${ab(g.c)} = ${y0}$, maka $x = ${x0}$.`)), sp: 'xs' };
  };
  const mGc = (r) => {
    const g = gcMake(r), v = r.int(0, 2), x0 = r.int(1, g.X - 1), y0 = g.m * x0 + g.c;
    if (v === 0) return { q: T(`${g.st.en} State the $y$-intercept of the line and explain what it represents.`, `${g.st.ms} Nyatakan pintasan-$y$ bagi garis itu dan terangkan apa yang diwakilinya.`), fig: g.fig, a: T(`$${g.c}$: ${g.iy.en}`, `$${g.c}$: ${g.iy.ms}`), w: W(T(`The $y$-intercept is the value of $y$ when $x = 0$; on the graph the line starts at $(0, ${g.c})$.`, `Pintasan-$y$ ialah nilai $y$ apabila $x = 0$; pada graf, garis itu bermula di $(0, ${g.c})$.`), cat(T('It represents ', 'Ia mewakili '), g.iy, T('.', '.'))), sp: 's' };
    if (v === 1) return { q: T(`${g.st.en} The line passes through $(0, ${g.c})$ and $(${g.X}, ${g.yEnd})$. Write down the equation of the line in the form $y = mx + c$.`, `${g.st.ms} Garis itu melalui $(0, ${g.c})$ dan $(${g.X}, ${g.yEnd})$. Tuliskan persamaan garis itu dalam bentuk $y = mx + c$.`), fig: g.fig, a: T(`$${g.eq}$`), w: W(T(`At $x = 0$, $y = ${g.c}$, so $c = ${g.c}$.`, `Pada $x = 0$, $y = ${g.c}$, maka $c = ${g.c}$.`), T(`From $(0, ${g.c})$ to $(${g.X}, ${g.yEnd})$, $x$ increases by $${g.X}$ and $y$ changes by $${dif(g.yEnd, g.c)} = ${g.yEnd - g.c}$, so $m = ${g.m}$.`, `Daripada $(0, ${g.c})$ ke $(${g.X}, ${g.yEnd})$, $x$ bertambah $${g.X}$ dan $y$ berubah sebanyak $${dif(g.yEnd, g.c)} = ${g.yEnd - g.c}$, maka $m = ${g.m}$.`), T(`$${g.eq}$`)), sp: 's' };
    return { q: T(`${g.st.en} Read from the graph the value of $y$ when $x = ${x0}$, and check it with the equation $${g.eq}$.`, `${g.st.ms} Baca daripada graf nilai $y$ apabila $x = ${x0}$, dan semak dengan persamaan $${g.eq}$.`), fig: g.fig, a: T(`$y = ${y0}$; $${g.m}(${x0}) ${sg(g.c)} ${ab(g.c)} = ${y0}$`), w: W(T(`Reading the graph at $x = ${x0}$ gives $y = ${y0}$.`, `Membaca graf pada $x = ${x0}$ memberi $y = ${y0}$.`), T(`Check: $y = ${cn(g.m)}${br(x0)} ${sg(g.c)} ${ab(g.c)} = ${y0}$, which agrees.`, `Semak: $y = ${cn(g.m)}${br(x0)} ${sg(g.c)} ${ab(g.c)} = ${y0}$, yang sepadan.`)), sp: 's' };
  };
  const aGc = (r) => {
    const g = gcMake(r), v = r.int(0, 2), x1 = g.X + r.int(2, 5);
    if (v === 0) return { q: T(`${g.st.en} The equation of the line is $${g.eq}$. Use it to find $y$ when $x = ${x1}$, which is beyond the part of the graph that is drawn.`, `${g.st.ms} Persamaan garis itu ialah $${g.eq}$. Gunakannya untuk mencari $y$ apabila $x = ${x1}$, iaitu di luar bahagian graf yang dilukis.`), fig: g.fig, a: T(`$y = ${g.m * x1 + g.c}$`), w: W(T(`The drawn part of the graph stops before $x = ${x1}$, but the equation still applies.`, `Bahagian graf yang dilukis berhenti sebelum $x = ${x1}$, tetapi persamaan itu masih terpakai.`), T(`$y = ${cn(g.m)}${br(x1)} ${sg(g.c)} ${ab(g.c)} = ${g.m * x1 + g.c}$`)), sp: 's' };
    if (v === 1 && !g.inc) return { q: T(`${g.st.en} Find the $x$-intercept of the line and explain what it means.`, `${g.st.ms} Cari pintasan-$x$ bagi garis itu dan terangkan maksudnya.`), fig: g.fig, a: T(`$${g.X}$: ${g.ix.en}`, `$${g.X}$: ${g.ix.ms}`), w: W(T(`At the $x$-intercept $y = 0$: $0 = ${cn(g.m)}x ${sg(g.c)} ${ab(g.c)}$, so $${ab(g.m)}x = ${g.c}$ and $x = ${g.X}$.`, `Pada pintasan-$x$, $y = 0$: $0 = ${cn(g.m)}x ${sg(g.c)} ${ab(g.c)}$, maka $${ab(g.m)}x = ${g.c}$ dan $x = ${g.X}$.`), cat(T('It represents ', 'Ia mewakili '), g.ix, T('.', '.'))), sp: 's' };
    if (v === 1) return { q: T(`${g.st.en} Explain why $y$ is never less than $${g.c}$ when $x \\ge 0$.`, `${g.st.ms} Terangkan mengapa $y$ tidak pernah kurang daripada $${g.c}$ apabila $x \\ge 0$.`), fig: g.fig, a: T('The line rises as $x$ increases, so $y$ is never below the $y$-intercept.', 'Garis itu menaik apabila $x$ bertambah, maka $y$ tidak pernah kurang daripada pintasan-$y$.'), w: W(T(`At $x = 0$ the line starts at $y = ${g.c}$.`, `Pada $x = 0$, garis itu bermula pada $y = ${g.c}$.`), T(`Each extra unit of $x$ adds $${g.m}$ to $y$, so for $x \\ge 0$ the value of $y$ is always at least $${g.c}$.`, `Setiap tambahan satu unit $x$ menambah $${g.m}$ pada $y$, maka bagi $x \\ge 0$ nilai $y$ sentiasa sekurang-kurangnya $${g.c}$.`)), sp: 's' };
    const y2 = g.m * (g.X - 1) + g.c;
    return { q: T(`${g.st.en} The line passes through $(${g.X - 1}, ${y2})$ and $(${g.X}, ${g.yEnd})$. By how much does $y$ change when $x$ increases by 1, and what does this represent?`, `${g.st.ms} Garis itu melalui $(${g.X - 1}, ${y2})$ dan $(${g.X}, ${g.yEnd})$. Berapakah perubahan $y$ apabila $x$ bertambah 1, dan apa yang diwakilinya?`), fig: g.fig, a: T(`$y$ changes by $${g.m}$ per unit of $x$: ${g.inc ? 'the rate at which it increases' : 'the rate at which it decreases (the sign is negative)'}`, `$y$ berubah sebanyak $${g.m}$ bagi setiap unit $x$: ${g.inc ? 'kadar pertambahan' : 'kadar pengurangan (tandanya negatif)'}`), w: W(T(`From $(${g.X - 1}, ${y2})$ to $(${g.X}, ${g.yEnd})$, $x$ increases by $1$ and $y$ changes by $${dif(g.yEnd, y2)} = ${g.m}$.`, `Daripada $(${g.X - 1}, ${y2})$ ke $(${g.X}, ${g.yEnd})$, $x$ bertambah $1$ dan $y$ berubah sebanyak $${dif(g.yEnd, y2)} = ${g.m}$.`), T(`This is the coefficient of $x$ in $${g.eq}$, that is ${g.inc ? 'the rate at which $y$ increases' : 'the rate at which $y$ decreases'}.`, `Ini ialah pekali $x$ dalam $${g.eq}$, iaitu ${g.inc ? 'kadar pertambahan $y$' : 'kadar pengurangan $y$'}.`)), sp: 's' };
  };
  ge64.push(eGc);
  gm64.push(mGc);
  ga64.push(aGc);
  SC2.push(
    (r) => { const x0 = r.int(2, 8), y0 = r.int(2, 6), nm = r.name(); return S2(T(`${nm} buys $x$ packets of nasi lemak at RM3 each and $y$ cups of teh tarik at RM2 each. The bill is RM${3 * x0 + 2 * y0}.`, `${nm} membeli $x$ bungkus nasi lemak pada harga RM3 sebungkus dan $y$ cawan teh tarik pada harga RM2 secawan. Bilnya ialah RM${3 * x0 + 2 * y0}.`), 3, 2, x0, y0, T('packets of nasi lemak', 'bungkus nasi lemak'), T('cups of teh tarik', 'cawan teh tarik')); },
    (r) => { const x0 = r.int(2, 7), y0 = r.int(2, 7); return S2(T(`A florist makes bouquets of two sizes: $x$ small bouquets using 6 flowers each and $y$ large bouquets using 10 flowers each, using ${6 * x0 + 10 * y0} flowers.`, `Seorang penjual bunga membuat jambangan dua saiz: $x$ jambangan kecil yang setiap satu menggunakan 6 kuntum bunga dan $y$ jambangan besar yang setiap satu menggunakan 10 kuntum bunga, menggunakan ${6 * x0 + 10 * y0} kuntum bunga.`), 6, 10, x0, y0, T('small bouquets', 'jambangan kecil'), T('large bouquets', 'jambangan besar')); },
    (r) => { const x0 = r.int(1, 6), y0 = r.int(1, 6); return S2(T(`A bakery packs cookies in small boxes of 12 and large boxes of 20. It packs ${12 * x0 + 20 * y0} cookies using $x$ small boxes and $y$ large boxes.`, `Sebuah kedai roti membungkus biskut dalam kotak kecil berisi 12 biji dan kotak besar berisi 20 biji. Ia membungkus ${12 * x0 + 20 * y0} biji biskut menggunakan $x$ kotak kecil dan $y$ kotak besar.`), 12, 20, x0, y0, T('small boxes', 'kotak kecil'), T('large boxes', 'kotak besar')); },
  );
  const sc2Fig = (r, s) => {
    const L = solsNN(s.a, s.b, s.c, 0);
    need(s.a > 0 && s.b > 0 && L.length >= 3);
    const mx = Math.max(...L.map((z) => z[0])), my = Math.max(...L.map((z) => z[1]));
    need(mx <= 12 && my <= 12 && s.c / s.b <= my + 2 && s.c / s.a <= mx + 2);
    return { L, fig: PW({ x: [0, Math.max(mx, s.c / s.a) + 1], y: [0, Math.max(my, s.c / s.b) + 1], scale: 22, segs: [{ a: [0, s.c / s.b], b: [s.c / s.a, 0] }], pts: L.map((z) => ({ x: z[0], y: z[1], l: '' })) }) };
  };
  const eSc4b = (r) => {
    const s = r.pick(SC2)(r), { L, fig } = sc2Fig(r, s), z = r.pick(L), v = r.int(0, 2);
    if (v === 0) return { q: T(`${s.st.en} The graph shows the line $${s.tex}$ and the possible pairs $(x, y)$. Use the graph to find $x$ when $y = ${z[1]}$.`, `${s.st.ms} Graf menunjukkan garis $${s.tex}$ dan pasangan $(x, y)$ yang mungkin. Gunakan graf untuk mencari $x$ apabila $y = ${z[1]}$.`), fig, a: T(`$x = ${z[0]}$`), w: W(T(`Find $y = ${z[1]}$ on the vertical axis, move across to the dot on the line, then read down.`, `Cari $y = ${z[1]}$ pada paksi mencancang, bergerak mengufuk ke titik pada garis itu, kemudian baca ke bawah.`), T(`Check: $${cn(s.a)}${br(z[0])} + ${cn(s.b)}${br(z[1])} = ${s.c}$`, `Semak: $${cn(s.a)}${br(z[0])} + ${cn(s.b)}${br(z[1])} = ${s.c}$`)), sp: 's' };
    if (v === 1) { const big = L.reduce((b, q) => (q[0] > b[0] ? q : b), L[0]); return { q: T(`${s.st.en} Which dot on the graph has the greatest $x$-coordinate? Write down its coordinates.`, `${s.st.ms} Titik yang manakah pada graf mempunyai koordinat-$x$ yang paling besar? Tuliskan koordinatnya.`), fig, a: T(`$${ptS(big[0], big[1])}$`), w: W(T('The dot furthest to the right has the greatest $x$-coordinate.', 'Titik yang paling kanan mempunyai koordinat-$x$ yang paling besar.'), T(`That dot is $${ptS(big[0], big[1])}$; check: $${cn(s.a)}${br(big[0])} + ${cn(s.b)}${br(big[1])} = ${s.c}$.`, `Titik itu ialah $${ptS(big[0], big[1])}$; semak: $${cn(s.a)}${br(big[0])} + ${cn(s.b)}${br(big[1])} = ${s.c}$.`)), sp: 's' }; }
    return { q: T(`${s.st.en} The graph shows the possible pairs as dots. How many dots are there on the line?`, `${s.st.ms} Graf menunjukkan pasangan yang mungkin sebagai titik. Berapakah bilangan titik pada garis itu?`), fig, a: T(`${L.length}`), w: W(T(`The dots are the pairs of whole numbers that fit $${s.tex}$: $${L.map((z2) => ptS(z2[0], z2[1])).join(',\\ ')}$.`, `Titik-titik itu ialah pasangan nombor bulat yang memenuhi $${s.tex}$: $${L.map((z2) => ptS(z2[0], z2[1])).join(',\\ ')}$.`), T(`Counting them gives ${L.length}.`, `Bilangannya ialah ${L.length}.`)), sp: 'xs' };
  };
  const mSc5b = (r) => {
    const s = r.pick(SC2)(r), { L, fig } = sc2Fig(r, s), z = r.pick(L), v = r.int(0, 1);
    if (v === 0) return { q: T(`${s.st.en} The dots on the graph mark the possible pairs. If $x = ${z[0]}$, find $y$ from the graph, and verify it in the equation $${s.tex}$.`, `${s.st.ms} Titik pada graf menandakan pasangan yang mungkin. Jika $x = ${z[0]}$, cari $y$ daripada graf dan sahkan dalam persamaan $${s.tex}$.`), fig, a: T(`$y = ${z[1]}$; $${s.a}(${z[0]}) + ${s.b}(${z[1]}) = ${s.c}$`), w: W(T(`Go up from $x = ${z[0]}$ to the dot on the line and read across: $y = ${z[1]}$.`, `Naik dari $x = ${z[0]}$ ke titik pada garis itu dan baca ke sisi: $y = ${z[1]}$.`), T(`Verify in the equation: $${cn(s.a)}${br(z[0])} + ${cn(s.b)}${br(z[1])} = ${s.c}$`, `Sahkan dalam persamaan: $${cn(s.a)}${br(z[0])} + ${cn(s.b)}${br(z[1])} = ${s.c}$`)), sp: 's' };
    const t = r.pick([-1, 1, 2]);
    return { q: T(`${s.st.en} The line $${s.tex}$ is drawn. Is the point $(${z[0] + 1}, ${z[1]})$ on the line? Can it describe this situation?`, `${s.st.ms} Garis $${s.tex}$ dilukis. Adakah titik $(${z[0] + 1}, ${z[1]})$ pada garis itu? Bolehkah ia menggambarkan situasi ini?`), fig, a: T(`No: $${s.a}(${z[0] + 1}) + ${s.b}(${z[1]}) = ${s.a * (z[0] + 1) + s.b * z[1]}$, not ${s.c}`, `Tidak: $${s.a}(${z[0] + 1}) + ${s.b}(${z[1]}) = ${s.a * (z[0] + 1) + s.b * z[1]}$, bukan ${s.c}`), w: W(T(`Substitute $x = ${z[0] + 1}$ and $y = ${z[1]}$: $${cn(s.a)}${br(z[0] + 1)} + ${cn(s.b)}${br(z[1])} = ${s.a * (z[0] + 1) + s.b * z[1]}$`, `Gantikan $x = ${z[0] + 1}$ dan $y = ${z[1]}$: $${cn(s.a)}${br(z[0] + 1)} + ${cn(s.b)}${br(z[1])} = ${s.a * (z[0] + 1) + s.b * z[1]}$`), T(`This is not $${s.c}$, so the point is not on the line and cannot describe the situation.`, `Ini bukan $${s.c}$, maka titik itu tidak terletak pada garis dan tidak boleh menggambarkan situasi itu.`)), sp: 's' };
  };
  const aSc4b = (r) => {
    const s = r.pick(SC2)(r), { L, fig } = sc2Fig(r, s), v = r.int(0, 1);
    need(L.length >= 3);
    if (v === 0) { const t = L.map((z) => z[0] + z[1]), lo = Math.min(...t), z = L[t.indexOf(lo)]; return { q: T(`${s.st.en} The graph shows the possible pairs $(x, y)$. For which pair is the total $x + y$ the smallest, and what is the total?`, `${s.st.ms} Graf menunjukkan pasangan $(x, y)$ yang mungkin. Bagi pasangan yang manakah jumlah $x + y$ paling kecil, dan berapakah jumlah itu?`), fig, a: T(`$${ptS(z[0], z[1])}$, total $${lo}$`, `$${ptS(z[0], z[1])}$, jumlah $${lo}$`), w: W(T(`Work out $x + y$ for every dot: ${L.map((z2) => `$${z2[0] + z2[1]}$`).join(', ')}.`, `Kira $x + y$ bagi setiap titik: ${L.map((z2) => `$${z2[0] + z2[1]}$`).join(', ')}.`), T(`The smallest total is $${lo}$, at $${ptS(z[0], z[1])}$.`, `Jumlah yang paling kecil ialah $${lo}$, pada $${ptS(z[0], z[1])}$.`)), sp: 's' }; }
    const gt = L.filter((z) => z[0] > z[1]);
    return { q: T(`${s.st.en} Use the graph to list every possible pair $(x, y)$ in which $x$ is greater than $y$.`, `${s.st.ms} Gunakan graf untuk menyenaraikan setiap pasangan $(x, y)$ yang mungkin dengan $x$ lebih besar daripada $y$.`), fig, a: gt.length ? T(`$${listS(gt)}$`) : T('There is none', 'Tiada'), w: W(T(`The dots are $${listS(L)}$.`, `Titik-titik itu ialah $${listS(L)}$.`), T('Compare the two coordinates of each pair.', 'Bandingkan kedua-dua koordinat bagi setiap pasangan.'), gt.length ? T(`Those with $x$ greater than $y$ are $${listS(gt)}$.`, `Yang mempunyai $x$ lebih besar daripada $y$ ialah $${listS(gt)}$.`) : T('In every pair $x$ is not greater than $y$, so there is none.', 'Dalam setiap pasangan, $x$ tidak lebih besar daripada $y$, maka tiada.')), sp: 's' };
  };
  ge64.push(eSc4b);
  gm64.push(mSc5b);
  ga64.push(aSc4b);
  const PLC = [['school', 'sekolah'], ['library', 'perpustakaan'], ['mosque', 'masjid'], ['market', 'pasar'], ['clinic', 'klinik'], ['park', 'taman'], ['post office', 'pejabat pos'], ['bus stop', 'perhentian bas'], ['police station', 'balai polis'], ['bank', 'bank'], ['stadium', 'stadium'], ['cafe', 'kafe']];
  const mapSet = (r, n) => {
    const pl = r.sample(PLC, n), used = new Set(), pts = [];
    while (pts.length < n) { const z = [r.int(-5, 5), r.int(-4, 4)], k = z.join(); if (!used.has(k) && (z[0] || z[1])) { used.add(k); pts.push(z); } }
    const nm = ['A', 'B', 'C'].slice(0, n), leg = { en: pl.map((p, i) => `${nm[i]} is the ${p[0]}`).join(', '), ms: pl.map((p, i) => `${nm[i]} ialah ${p[1]}`).join(', ') };
    return { pl, pts, nm, leg, fig: PW({ x: [-6, 6], y: [-5, 5], pts: pts.map((z, i) => ({ x: z[0], y: z[1], l: nm[i] })) }) };
  };
  const eMap = (r) => {
    const m = mapSet(r, 3), i = r.int(0, 2), v = r.int(0, 2), P = m.pts[i];
    if (v === 0) return { q: T(`The grid shows a map of a town on a Cartesian plane. ${m.leg.en}. Write down the coordinates of the ${m.pl[i][0]}.`, `Grid menunjukkan peta sebuah pekan pada satah Cartes. ${m.leg.ms}. Tuliskan koordinat ${m.pl[i][1]}.`), fig: m.fig, a: T(`$${ptS(P[0], P[1])}$`), w: W(T(`From the origin, ${m.nm[i]} is ${ab(P[0])} ${P[0] >= 0 ? 'to the right' : 'to the left'} and ${ab(P[1])} ${P[1] >= 0 ? 'up' : 'down'}.`, `Dari asalan, ${m.nm[i]} berada ${ab(P[0])} unit ke ${P[0] >= 0 ? 'kanan' : 'kiri'} dan ${ab(P[1])} unit ke ${P[1] >= 0 ? 'atas' : 'bawah'}.`), T(`Coordinates are written $(x, y)$, so the answer is $${ptS(P[0], P[1])}$.`, `Koordinat ditulis $(x, y)$, maka jawapannya ialah $${ptS(P[0], P[1])}$.`)), sp: 'xs' };
    if (v === 1) return { q: T(`On the map, ${m.leg.en}. Which place is at $${ptS(P[0], P[1])}$?`, `Pada peta, ${m.leg.ms}. Tempat yang manakah terletak pada $${ptS(P[0], P[1])}$?`), fig: m.fig, a: T(`The ${m.pl[i][0]} (${m.nm[i]})`, `${SPM.cap(m.pl[i][1])} (${m.nm[i]})`), w: W(T(`$${ptS(P[0], P[1])}$ means $x = ${P[0]}$ and $y = ${P[1]}$.`, `$${ptS(P[0], P[1])}$ bermaksud $x = ${P[0]}$ dan $y = ${P[1]}$.`), T(`The point marked there is ${m.nm[i]}, the ${m.pl[i][0]}.`, `Titik yang ditandakan di situ ialah ${m.nm[i]}, iaitu ${m.pl[i][1]}.`)), sp: 'xs' };
    const hi = m.pts.reduce((b, z, k) => (z[1] > m.pts[b][1] ? k : b), 0);
    return { q: T(`On the map, ${m.leg.en}. Which place has the greatest $y$-coordinate, and what is that coordinate?`, `Pada peta, ${m.leg.ms}. Tempat yang manakah mempunyai koordinat-$y$ yang paling besar, dan berapakah koordinat itu?`), fig: m.fig, a: T(`The ${m.pl[hi][0]}: $${m.pts[hi][1]}$`, `${SPM.cap(m.pl[hi][1])}: $${m.pts[hi][1]}$`), w: W(T(`The $y$-coordinates are ${m.pts.map((z2, j) => `${m.nm[j]}: $${z2[1]}$`).join(', ')}.`, `Koordinat-$y$ ialah ${m.pts.map((z2, j) => `${m.nm[j]}: $${z2[1]}$`).join(', ')}.`), T(`The greatest is $${m.pts[hi][1]}$, at ${m.nm[hi]}, the ${m.pl[hi][0]}.`, `Yang paling besar ialah $${m.pts[hi][1]}$, pada ${m.nm[hi]}, iaitu ${m.pl[hi][1]}.`)), sp: 'xs' };
  };
  const mMap = (r) => {
    const m = mapSet(r, 3), v = r.int(0, 2), [a, b] = [m.pts[0], m.pts[1]];
    if (v === 0) return { q: T(`On the map, ${m.leg.en}. Ali walks from $A$ to $B$. How many units does he move horizontally and how many vertically?`, `Pada peta, ${m.leg.ms}. Ali berjalan dari $A$ ke $B$. Berapa unit dia bergerak secara mengufuk dan berapa unit secara mencancang?`), fig: m.fig, a: T(`${ab(b[0] - a[0])} unit${ab(b[0] - a[0]) === 1 ? '' : 's'} horizontally and ${ab(b[1] - a[1])} unit${ab(b[1] - a[1]) === 1 ? '' : 's'} vertically`, `${ab(b[0] - a[0])} unit secara mengufuk dan ${ab(b[1] - a[1])} unit secara mencancang`), w: W(T(`$A = ${ptS(a[0], a[1])}$ and $B = ${ptS(b[0], b[1])}$.`, `$A = ${ptS(a[0], a[1])}$ dan $B = ${ptS(b[0], b[1])}$.`), T(`Horizontal change: $${dif(b[0], a[0])} = ${b[0] - a[0]}$, so ${ab(b[0] - a[0])} units.`, `Perubahan mengufuk: $${dif(b[0], a[0])} = ${b[0] - a[0]}$, maka ${ab(b[0] - a[0])} unit.`), T(`Vertical change: $${dif(b[1], a[1])} = ${b[1] - a[1]}$, so ${ab(b[1] - a[1])} units.`, `Perubahan mencancang: $${dif(b[1], a[1])} = ${b[1] - a[1]}$, maka ${ab(b[1] - a[1])} unit.`)), sp: 's' };
    if (v === 1) { const ks = m.pts.map((z) => QUAD(z[0], z[1])); return { q: T(`On the map, ${m.leg.en}. State the quadrant or axis in which each of $A$, $B$ and $C$ lies.`, `Pada peta, ${m.leg.ms}. Nyatakan sukuan atau paksi bagi setiap satu daripada $A$, $B$ dan $C$.`), fig: m.fig, a: T(ks.map((k, i) => `${m.nm[i]}: ${QN[k].en}`).join('; '), ks.map((k, i) => `${m.nm[i]}: ${QN[k].ms}`).join('; ')), w: W(T('Look at the sign of each coordinate: both positive is the first quadrant, and so on round the plane.', 'Lihat tanda bagi setiap koordinat: kedua-duanya positif ialah sukuan pertama, dan seterusnya mengelilingi satah.'), T(ks.map((k, i) => `${m.nm[i]}$${ptS(m.pts[i][0], m.pts[i][1])}$: ${QN[k].en}`).join('; '), ks.map((k, i) => `${m.nm[i]}$${ptS(m.pts[i][0], m.pts[i][1])}$: ${QN[k].ms}`).join('; '))), sp: 's' }; }
    return { q: T(`On the map, ${m.leg.en}. Write down the equation of the vertical line through $A$ and the equation of the horizontal line through $B$.`, `Pada peta, ${m.leg.ms}. Tuliskan persamaan garis mencancang yang melalui $A$ dan persamaan garis mengufuk yang melalui $B$.`), fig: m.fig, a: T(`$x = ${a[0]}$ and $y = ${b[1]}$`, `$x = ${a[0]}$ dan $y = ${b[1]}$`), w: W(T(`Every point on a vertical line has the same $x$-coordinate; $A = ${ptS(a[0], a[1])}$, so that line is $x = ${a[0]}$.`, `Setiap titik pada garis mencancang mempunyai koordinat-$x$ yang sama; $A = ${ptS(a[0], a[1])}$, maka garis itu ialah $x = ${a[0]}$.`), T(`Every point on a horizontal line has the same $y$-coordinate; $B = ${ptS(b[0], b[1])}$, so that line is $y = ${b[1]}$.`, `Setiap titik pada garis mengufuk mempunyai koordinat-$y$ yang sama; $B = ${ptS(b[0], b[1])}$, maka garis itu ialah $y = ${b[1]}$.`)), sp: 's' };
  };
  const mIntFrac = (r) => {
    const a = r.int(2, 6), b = r.int(2, 6), c = r.int(3, 20), v = r.int(0, 1);
    need(a !== b && (c % a !== 0 || c % b !== 0));
    const xi = Fr.make(c, a), yi = Fr.make(c, b);
    return { q: v === 0 ? T(`Find the $x$-intercept and the $y$-intercept of the line $${eq2(a, b, c)}$. Give fractions in simplest form.`, `Cari pintasan-$x$ dan pintasan-$y$ bagi garis $${eq2(a, b, c)}$. Berikan pecahan dalam bentuk termudah.`) : T(`The line $${eq2(a, b, c)}$ is to be drawn. Find the points where it meets the axes, using $y = 0$ and $x = 0$.`, `Garis $${eq2(a, b, c)}$ hendak dilukis. Cari titik-titik apabila ia bertemu paksi, dengan menggunakan $y = 0$ dan $x = 0$.`), a: T(`$x$-intercept $${tx(xi)}$, $y$-intercept $${tx(yi)}$; points $(${tx(xi)}, 0)$ and $(0, ${tx(yi)})$`, `Pintasan-$x$ $${tx(xi)}$, pintasan-$y$ $${tx(yi)}$; titik $(${tx(xi)}, 0)$ dan $(0, ${tx(yi)})$`), w: W(T(`Put $y = 0$: $${a}x = ${c}$, so $x = ${tx(xi)}$.`, `Masukkan $y = 0$: $${a}x = ${c}$, maka $x = ${tx(xi)}$.`), T(`Put $x = 0$: $${b}y = ${c}$, so $y = ${tx(yi)}$.`, `Masukkan $x = 0$: $${b}y = ${c}$, maka $y = ${tx(yi)}$.`), T(`The line meets the axes at $(${tx(xi)}, 0)$ and $(0, ${tx(yi)})$.`, `Garis itu bertemu paksi pada $(${tx(xi)}, 0)$ dan $(0, ${tx(yi)})$.`)), sp: 's' };
  };
  const mTableMc = (r) => {
    const v = r.int(0, 1), xs = [-1, 0, 1, 2];
    let E, ys, wr;
    if (v === 0) { const m = r.pick([2, 3, -2, -1]), c = r.nz(-4, 4); E = yEq(m, c); ys = xs.map((x) => m * x + c); wr = [xs.map((x) => m * x - c), xs.map((x) => -m * x + c), xs.map((x) => m * x + c + 1), xs.map((x) => c * x + m)]; }
    else { const a = r.int(1, 3), c = r.int(2, 8); E = eq2(a, 1, c); ys = xs.map((x) => c - a * x); wr = [xs.map((x) => c + a * x), xs.map((x) => a * x - c), xs.map((x) => c - a * x + 1), xs.map((x) => a * (c - x))]; }
    const key = (l) => l.join(',\\ ');
    const o = opts(r, key(ys), wr.map(key));
    return { q: T(`Which list gives the values of $y$ for $x = -1, 0, 1, 2$ in $${E}$?<br>${o.list}`, `Senarai yang manakah memberi nilai $y$ bagi $x = -1, 0, 1, 2$ dalam $${E}$?<br>${o.list}`), a: mcqA(o), w: W(T(`Substitute each value of $x$ into $${E}$.`, `Gantikan setiap nilai $x$ ke dalam $${E}$.`), T(`$x = -1, 0, 1, 2$ give $y = ${ys.join(',\\ ')}$.`, `$x = -1, 0, 1, 2$ memberi $y = ${ys.join(',\\ ')}$.`), T(`That is option (${o.key}).`, `Itulah pilihan (${o.key}).`)), sp: 's' };
  };
  const aHV = (r) => {
    const k = r.nz(-5, 5), p = r.sample([-4, -3, -2, -1, 1, 2, 3, 4, 5], 2), v = r.int(0, 3), vert = v < 2;
    const P = vert ? [k, p[0]] : [p[0], k], Qp = vert ? [k, p[1]] : [p[1], k];
    const fig = PW({ x: [-6, 6], y: [-6, 6], pts: [{ x: P[0], y: P[1], l: 'P' }, { x: Qp[0], y: Qp[1], l: 'Q' }] });
    if (v % 2 === 0) return { q: T(`The points $P(${P[0]}, ${P[1]})$ and $Q(${Qp[0]}, ${Qp[1]})$ lie on a straight line. Write down the equation of the line and state whether it is horizontal or vertical.`, `Titik $P(${P[0]}, ${P[1]})$ dan $Q(${Qp[0]}, ${Qp[1]})$ terletak pada satu garis lurus. Tuliskan persamaan garis itu dan nyatakan sama ada ia mengufuk atau mencancang.`), fig, a: vert ? T(`$x = ${k}$, vertical`, `$x = ${k}$, mencancang`) : T(`$y = ${k}$, horizontal`, `$y = ${k}$, mengufuk`), w: W(vert ? T(`$P$ and $Q$ have the same $x$-coordinate, $${k}$, so the line through them is vertical.`, `$P$ dan $Q$ mempunyai koordinat-$x$ yang sama, iaitu $${k}$, maka garis melaluinya mencancang.`) : T(`$P$ and $Q$ have the same $y$-coordinate, $${k}$, so the line through them is horizontal.`, `$P$ dan $Q$ mempunyai koordinat-$y$ yang sama, iaitu $${k}$, maka garis melaluinya mengufuk.`), T(vert ? `$x = ${k}$` : `$y = ${k}$`)), sp: 's' };
    return { q: T(`$P(${P[0]}, ${P[1]})$ and $Q(${Qp[0]}, ${Qp[1]})$ are joined by a straight line. Write its equation and find the length of $PQ$.`, `$P(${P[0]}, ${P[1]})$ dan $Q(${Qp[0]}, ${Qp[1]})$ disambungkan dengan satu garis lurus. Tulis persamaannya dan cari panjang $PQ$.`), fig, a: T(`${vert ? `$x = ${k}$` : `$y = ${k}$`}; $PQ = ${ab(p[0] - p[1])}$ units`.replace(/\$\$/g, '$'), `${vert ? `$x = ${k}$` : `$y = ${k}$`}; $PQ = ${ab(p[0] - p[1])}$ unit`), w: W(vert ? T(`$P$ and $Q$ have the same $x$-coordinate, so the line is $x = ${k}$.`, `$P$ dan $Q$ mempunyai koordinat-$x$ yang sama, maka garis itu ialah $x = ${k}$.`) : T(`$P$ and $Q$ have the same $y$-coordinate, so the line is $y = ${k}$.`, `$P$ dan $Q$ mempunyai koordinat-$y$ yang sama, maka garis itu ialah $y = ${k}$.`), T(`$PQ$ is the difference of the other coordinates: $${dif(p[0], p[1])} = ${p[0] - p[1]}$, so $PQ = ${ab(p[0] - p[1])}$ units.`, `$PQ$ ialah beza koordinat yang satu lagi: $${dif(p[0], p[1])} = ${p[0] - p[1]}$, maka $PQ = ${ab(p[0] - p[1])}$ unit.`)), sp: 's' };
  };
  ge64.push(eMap);
  gm64.push(mMap, mIntFrac, mTableMc);
  ga64.push(aHV);
  SPM.extend('F1-6.4', { e: ge64, m: gm64, a: ga64 });

  
  /* ================================================================ 6.5 – 6.7 shared */
  const sy = (s) => `\\begin{cases} ${eq2(s.a1, s.b1, s.c1)} \\\\ ${eq2(s.a2, s.b2, s.c2)} \\end{cases}`;
  const mkS = (a1, b1, x0, y0, a2, b2) => ({ a1, b1, c1: a1 * x0 + b1 * y0, a2, b2, c2: a2 * x0 + b2 * y0, x0, y0 });
  const sysR = (r, o) => { o = o || {}; const R = o.R || 3, x0 = o.x0 !== undefined ? o.x0 : r.int(o.lo === undefined ? -4 : o.lo, o.hi || 5), y0 = o.y0 !== undefined ? o.y0 : r.int(o.lo === undefined ? -4 : o.lo, o.hi || 5), a1 = r.nz(o.pos ? 1 : -R, R), b1 = r.nz(o.pos ? 1 : -R, R), a2 = r.nz(o.pos ? 1 : -R, R), b2 = r.nz(o.pos ? 1 : -R, R); need(a1 * b2 - a2 * b1 !== 0); return mkS(a1, b1, x0, y0, a2, b2); };
  const kind = (s) => (s.a1 * s.b2 - s.a2 * s.b1 !== 0 ? 'one' : s.a1 * s.c2 - s.a2 * s.c1 === 0 && s.b1 * s.c2 - s.b2 * s.c1 === 0 ? 'inf' : 'none');
  const KT = { one: T('exactly one solution', 'tepat satu penyelesaian'), none: T('no solution', 'tiada penyelesaian'), inf: T('infinitely many solutions', 'penyelesaian yang tidak terhingga banyaknya') };
  const lnOf = (a, b, c, lab) => (b === 0 ? { v: c / a } : { l: { m: -a / b, c: c / b, label: lab || '' } });
  const gfig = (list, pts) => PW({ x: [-6, 6], y: [-6, 6], lines: list.map((z) => z.l).filter(Boolean), vlines: list.map((z) => z.v).filter((z) => z !== undefined), pts: pts || [] });
  const mkK = (r, kd) => {
    const a1 = r.nz(-4, 4), b1 = r.nz(-4, 4), c1 = r.int(-8, 8), k = r.pick([2, 3, -1, -2]);
    if (kd === 'one') { const s = sysR(r, { R: 4 }); return s; }
    return { a1, b1, c1, a2: a1 * k, b2: b1 * k, c2: kd === 'inf' ? c1 * k : c1 * k + r.pick([1, 2, 3, -1, -2, 4]), x0: 0, y0: 0 };
  };
  /* two-equation stories: st defines $x$ and $y$; eq1, eq2 = [a, b, c]; (x0, y0) the common solution */
  const S5 = (st, e1, e2, x0, y0, nx, ny) => { need(e1[0] * e2[1] - e2[0] * e1[1] !== 0); return { st, a1: e1[0], b1: e1[1], c1: e1[0] * x0 + e1[1] * y0, a2: e2[0], b2: e2[1], c2: e2[0] * x0 + e2[1] * y0, x0, y0, nx, ny }; };
  const SC5 = [
    (r) => { const it = r.pick(NB), jt = r.pick(NB.filter((z) => z !== it)), p = r.int(it.lo, it.hi), q = r.int(jt.lo, jt.hi), n1 = r.int(2, 4), m1 = r.int(1, 3), n2 = r.int(1, 4), m2 = r.int(2, 5), nm = r.name(); need(n1 * m2 !== n2 * m1); return S5(T(`${nm} pays RM${n1 * p + m1 * q} for ${np(n1, it)} and ${np(m1, jt)}, and RM${n2 * p + m2 * q} for ${np(n2, it)} and ${np(m2, jt)}. Let $x$ be the price (RM) of one ${it.en1} and $y$ the price (RM) of one ${jt.en1}.`, `${nm} membayar RM${n1 * p + m1 * q} untuk ${n1} ${it.ms} dan ${m1} ${jt.ms}, dan RM${n2 * p + m2 * q} untuk ${n2} ${it.ms} dan ${m2} ${jt.ms}. Andaikan $x$ ialah harga (RM) bagi satu ${it.ms} dan $y$ ialah harga (RM) bagi satu ${jt.ms}.`), [n1, m1], [n2, m2], p, q, T(`price of a ${it.en1}`, `harga ${it.ms}`), T(`price of a ${jt.en1}`, `harga ${jt.ms}`)); },
    (r) => { const x0 = r.int(6, 25), y0 = r.int(2, x0 - 1); return S5(T(`Two numbers $x$ and $y$ have a sum of ${x0 + y0} and a difference of ${x0 - y0}.`, `Dua nombor $x$ dan $y$ mempunyai hasil tambah ${x0 + y0} dan beza ${x0 - y0}.`), [1, 1], [1, -1], x0, y0, T('the larger number', 'nombor yang lebih besar'), T('the smaller number', 'nombor yang lebih kecil')); },
    (r) => { const a = r.int(8, 20), b = r.int(3, a - 2), n1 = r.int(2, 4), m1 = r.int(2, 5), n2 = r.int(1, 3), m2 = r.int(3, 7); need(n1 * m2 !== n2 * m1); return S5(T(`At a museum, ${n1} adult tickets and ${m1} child tickets cost RM${n1 * a + m1 * b}, while ${n2} adult ticket${n2 > 1 ? 's' : ''} and ${m2} child tickets cost RM${n2 * a + m2 * b}. Let RM$x$ be the price of an adult ticket and RM$y$ that of a child ticket.`, `Di sebuah muzium, ${n1} tiket dewasa dan ${m1} tiket kanak-kanak berharga RM${n1 * a + m1 * b}, manakala ${n2} tiket dewasa dan ${m2} tiket kanak-kanak berharga RM${n2 * a + m2 * b}. Andaikan RM$x$ ialah harga tiket dewasa dan RM$y$ ialah harga tiket kanak-kanak.`), [n1, m1], [n2, m2], a, b, T('adult ticket price', 'harga tiket dewasa'), T('child ticket price', 'harga tiket kanak-kanak')); },
    (r) => { const x0 = r.int(4, 14), y0 = r.int(3, 12), nm = r.name(); return S5(T(`${nm} has ${x0 + y0} coins altogether, made up of $x$ 20-sen coins and $y$ 50-sen coins. Their total value is ${20 * x0 + 50 * y0} sen.`, `${nm} mempunyai ${x0 + y0} keping syiling semuanya, terdiri daripada $x$ keping syiling 20 sen dan $y$ keping syiling 50 sen. Jumlah nilainya ialah ${20 * x0 + 50 * y0} sen.`), [1, 1], [20, 50], x0, y0, T('20-sen coins', 'syiling 20 sen'), T('50-sen coins', 'syiling 50 sen')); },
    (r) => { const x0 = r.int(4, 15), y0 = r.int(3, 12); return S5(T(`A farmer keeps $x$ chickens and $y$ goats. Altogether there are ${x0 + y0} animals with ${2 * x0 + 4 * y0} legs.`, `Seorang petani memelihara $x$ ekor ayam dan $y$ ekor kambing. Terdapat ${x0 + y0} ekor haiwan dengan ${2 * x0 + 4 * y0} kaki semuanya.`), [1, 1], [2, 4], x0, y0, T('chickens', 'ayam'), T('goats', 'kambing')); },
    (r) => { const k = r.int(2, 4), y0 = r.int(8, 15), nm = r.name(); return S5(T(`The sum of the ages of ${nm} and ${nm}'s father is ${(k + 1) * y0} years. The father is ${k} times as old as ${nm}. Let $x$ be the father's age and $y$ be ${nm}'s age.`, `Jumlah umur ${nm} dan ayahnya ialah ${(k + 1) * y0} tahun. Ayah berumur ${k} kali ganda umur ${nm}. Andaikan $x$ ialah umur ayah dan $y$ ialah umur ${nm}.`), [1, 1], [1, -k], k * y0, y0, T("father's age", 'umur ayah'), T(`${nm}'s age`, `umur ${nm}`)); },
    (r) => { const x0 = r.int(6, 20), y0 = r.int(3, x0 - 1); return S5(T(`The perimeter of a rectangle is ${2 * (x0 + y0)} cm. Its length, $x$ cm, is ${x0 - y0} cm more than its width, $y$ cm.`, `Perimeter sebuah segi empat tepat ialah ${2 * (x0 + y0)} cm. Panjangnya, $x$ cm, lebih ${x0 - y0} cm daripada lebarnya, $y$ cm.`), [2, 2], [1, -1], x0, y0, T('length', 'panjang'), T('width', 'lebar')); },
    (r) => { const x0 = r.int(2, 8), y0 = r.int(2, 8); return S5(T(`A cashier has ${x0 + y0} notes made up of $x$ RM5 notes and $y$ RM10 notes, worth RM${5 * x0 + 10 * y0} in all.`, `Seorang juruwang mempunyai ${x0 + y0} keping wang kertas yang terdiri daripada $x$ keping RM5 dan $y$ keping RM10, bernilai RM${5 * x0 + 10 * y0} semuanya.`), [1, 1], [5, 10], x0, y0, T('RM5 notes', 'wang kertas RM5'), T('RM10 notes', 'wang kertas RM10')); },
    (r) => { const x0 = r.int(2, 9), y0 = r.int(2, 9); return S5(T(`A trader mixes $x$ kg of rice costing RM3 per kg with $y$ kg of sugar costing RM4 per kg. The mixture of goods has a mass of ${x0 + y0} kg and costs RM${3 * x0 + 4 * y0}.`, `Seorang peniaga menjual $x$ kg beras berharga RM3 sekilogram bersama $y$ kg gula berharga RM4 sekilogram. Kedua-dua barang itu berjisim ${x0 + y0} kg dan berharga RM${3 * x0 + 4 * y0}.`), [1, 1], [3, 4], x0, y0, T('kg of rice', 'kg beras'), T('kg of sugar', 'kg gula')); },
    (r) => { const h = r.int(5, 30); return S5(T(`Two angles $x^\\circ$ and $y^\\circ$ are complementary, so they add up to $90^\\circ$, and $x^\\circ$ is $${2 * h}^\\circ$ larger than $y^\\circ$.`, `Dua sudut $x^\\circ$ dan $y^\\circ$ ialah sudut pelengkap, maka jumlahnya $90^\\circ$, dan $x^\\circ$ lebih besar $${2 * h}^\\circ$ daripada $y^\\circ$.`), [1, 1], [1, -1], 45 + h, 45 - h, T('the larger angle', 'sudut yang lebih besar'), T('the smaller angle', 'sudut yang lebih kecil')); },
    (r) => { const p = r.int(2, 5), q = r.int(3, 8), n1 = r.int(2, 4), n2 = r.int(1, 3), m1 = r.int(1, 3), m2 = r.int(2, 4); need(n1 * m2 !== n2 * m1); const f = I.foods, fa = r.pick(f), fb = r.pick(f.filter((z) => z !== fa)); return S5(T(`At a stall, ${np(n1, fa)} and ${np(m1, fb)} cost RM${n1 * p + m1 * q} while ${np(n2, fa)} and ${np(m2, fb)} cost RM${n2 * p + m2 * q}. Let $x$ and $y$ be the prices in RM of one ${fa.en1} and one ${fb.en1}.`, `Di sebuah gerai, ${n1} ${fa.ms} dan ${m1} ${fb.ms} berharga RM${n1 * p + m1 * q} manakala ${n2} ${fa.ms} dan ${m2} ${fb.ms} berharga RM${n2 * p + m2 * q}. Andaikan $x$ dan $y$ ialah harga dalam RM bagi satu ${fa.ms} dan satu ${fb.ms}.`), [n1, m1], [n2, m2], p, q, T(`price of a ${fa.en1}`, `harga ${fa.ms}`), T(`price of a ${fb.en1}`, `harga ${fb.ms}`)); },
  ];
  const np = (k, it) => `${k} ${k === 1 ? it.en1 : it.en}`;
  const eqsOf = (s) => `${eq2(s.a1, s.b1, s.c1)},\\ \\ ${eq2(s.a2, s.b2, s.c2)}`;
  const e65Form = (r) => {
    const s = r.pick(SC5)(r), v = r.int(0, 2);
    if (v === 0) return { q: T(`${s.st.en} Write two linear equations in $x$ and $y$ for this situation.`, `${s.st.ms} Tulis dua persamaan linear dalam $x$ dan $y$ bagi situasi ini.`), a: T(`$${eqsOf(s)}$`), w: W(T('Each piece of information in the question becomes one equation, using the letters given.', 'Setiap maklumat dalam soalan menjadi satu persamaan, menggunakan huruf yang diberi.'), T(`$${eq2(s.a1, s.b1, s.c1)}$`), T(`$${eq2(s.a2, s.b2, s.c2)}$`)), sp: 's' };
    if (v === 1) {
      const wr = [[eq2(s.b1, s.a1, s.c1), eq2(s.a2, s.b2, s.c2)], [eq2(s.a1, s.b1, s.c1), eq2(s.b2, s.a2, s.c2)], [eq2(s.a1, s.b1, s.c1 + 1), eq2(s.a2, s.b2, s.c2)]].map((z) => `${z[0]};\\ ${z[1]}`);
      const o = opts(r, `${eq2(s.a1, s.b1, s.c1)};\\ ${eq2(s.a2, s.b2, s.c2)}`, wr);
      return { q: T(`${s.st.en} Which pair of equations represents the situation?<br>${o.list}`, `${s.st.ms} Pasangan persamaan yang manakah mewakili situasi ini?<br>${o.list}`), a: mcqA(o), w: W(T('Each piece of information in the question becomes one equation, using the letters given.', 'Setiap maklumat dalam soalan menjadi satu persamaan, menggunakan huruf yang diberi.'), T(`The situation gives $${eqsOf(s)}$, which is option (${o.key}).`, `Situasi itu memberi $${eqsOf(s)}$, iaitu pilihan (${o.key}).`)), sp: 's' };
    }
    const chk = `${s.a1}(${s.x0}) ${sg(s.b1)} ${ab(s.b1)}(${s.y0}) = ${s.c1}`, chk2 = `${s.a2}(${s.x0}) ${sg(s.b2)} ${ab(s.b2)}(${s.y0}) = ${s.c2}`;
    return { q: T(`${s.st.en} Show that $x = ${s.x0}$ and $y = ${s.y0}$ satisfy both of your equations.`, `${s.st.ms} Tunjukkan bahawa $x = ${s.x0}$ dan $y = ${s.y0}$ memenuhi kedua-dua persamaan anda.`), a: T(`$${eqsOf(s)}$; $${chk}$ and $${chk2}$`, `$${eqsOf(s)}$; $${chk}$ dan $${chk2}$`), w: W(T(`The equations are $${eqsOf(s)}$.`, `Persamaannya ialah $${eqsOf(s)}$.`), T(`Substitute into the first: $${chk}$`, `Gantikan ke dalam yang pertama: $${chk}$`), T(`Substitute into the second: $${chk2}$`, `Gantikan ke dalam yang kedua: $${chk2}$`), T('Both equations are satisfied, so the values are the solution.', 'Kedua-dua persamaan dipenuhi, maka nilai-nilai itu ialah penyelesaiannya.')), sp: 'm' };
  };
  const e65Check = (r) => {
    const s = sysR(r, { lo: -3, hi: 5 }), v = r.int(0, 2), good = r.chance();
    const P = good ? [s.x0, s.y0] : r.pick([[s.y0, s.x0], [s.x0 + 1, s.y0], [s.x0, s.y0 - 1]]);
    const ok1 = s.a1 * P[0] + s.b1 * P[1] === s.c1, ok2 = s.a2 * P[0] + s.b2 * P[1] === s.c2, both = ok1 && ok2;
    if (v === 0) return { q: T(`Is $(x, y) = ${ptS(P[0], P[1])}$ a solution of the simultaneous equations $${sy(s)}$?`, `Adakah $(x, y) = ${ptS(P[0], P[1])}$ satu penyelesaian bagi persamaan serentak $${sy(s)}$?`), a: yes(both), w: W(T(`Substitute $x = ${P[0]}$ and $y = ${P[1]}$ into both equations.`, `Gantikan $x = ${P[0]}$ dan $y = ${P[1]}$ ke dalam kedua-dua persamaan.`), T(`Equation 1: $${cn(s.a1)}${br(P[0])} ${sg(s.b1)} ${cn(ab(s.b1))}${br(P[1])} = ${s.a1 * P[0] + s.b1 * P[1]}$, and it needs $${s.c1}$.`, `Persamaan 1: $${cn(s.a1)}${br(P[0])} ${sg(s.b1)} ${cn(ab(s.b1))}${br(P[1])} = ${s.a1 * P[0] + s.b1 * P[1]}$, dan ia memerlukan $${s.c1}$.`), T(`Equation 2: $${cn(s.a2)}${br(P[0])} ${sg(s.b2)} ${cn(ab(s.b2))}${br(P[1])} = ${s.a2 * P[0] + s.b2 * P[1]}$, and it needs $${s.c2}$.`, `Persamaan 2: $${cn(s.a2)}${br(P[0])} ${sg(s.b2)} ${cn(ab(s.b2))}${br(P[1])} = ${s.a2 * P[0] + s.b2 * P[1]}$, dan ia memerlukan $${s.c2}$.`), both ? T('Both equations are satisfied, so the pair is a solution.', 'Kedua-dua persamaan dipenuhi, maka pasangan itu ialah satu penyelesaian.') : T('A solution must satisfy both equations at the same time, so this pair is not a solution.', 'Penyelesaian mesti memenuhi kedua-dua persamaan serentak, maka pasangan ini bukan penyelesaian.')), sp: 's' };
    if (v === 1) {
      const o = opts(r, ptS(s.x0, s.y0), [ptS(s.y0, s.x0), ptS(s.x0 + 1, s.y0), ptS(s.x0, s.y0 + 1), ptS(s.x0 - 1, s.y0 - 1)].filter((z) => { const m = z.match(/-?\d+/g).map(Number); return !(s.a1 * m[0] + s.b1 * m[1] === s.c1 && s.a2 * m[0] + s.b2 * m[1] === s.c2); }));
      return { q: T(`Which ordered pair is the solution of $${sy(s)}$?<br>${o.list}`, `Pasangan tertib yang manakah penyelesaian bagi $${sy(s)}$?<br>${o.list}`), a: mcqA(o), w: W(T('Test each pair in both equations; only the solution satisfies both.', 'Uji setiap pasangan dalam kedua-dua persamaan; hanya penyelesaian memenuhi kedua-duanya.'), T(`$${ptS(s.x0, s.y0)}$ gives $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$ and $${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$.`, `$${ptS(s.x0, s.y0)}$ memberi $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$ dan $${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$.`), T(`So the answer is (${o.key}).`, `Maka jawapannya ialah (${o.key}).`)), sp: 's' };
    }
    const nm = r.name();
    return { q: T(`${nm} finds that $(${P[0]}, ${P[1]})$ satisfies $${eq2(s.a1, s.b1, s.c1)}$ and concludes that it is a solution of $${sy(s)}$. ${ok1 ? 'Test the pair in the second equation. Is' : 'Is'} ${nm}'s conclusion correct?`, `${nm} mendapati $(${P[0]}, ${P[1]})$ memenuhi $${eq2(s.a1, s.b1, s.c1)}$ dan membuat kesimpulan bahawa ia penyelesaian bagi $${sy(s)}$. ${ok1 ? 'Uji pasangan itu dalam persamaan kedua. Adakah' : 'Adakah'} kesimpulan ${nm} betul?`), a: ok1 ? (both ? T('Yes: it also satisfies equation 2.', 'Ya: ia juga memenuhi persamaan 2.') : T(`No: it must satisfy both equations; equation 2 gives ${s.a2 * P[0] + s.b2 * P[1]}, not ${s.c2}.`, `Tidak: ia mesti memenuhi kedua-dua persamaan; persamaan 2 memberi ${s.a2 * P[0] + s.b2 * P[1]}, bukan ${s.c2}.`)) : T(`No: it does not even satisfy equation 1 (it gives ${s.a1 * P[0] + s.b1 * P[1]}, not ${s.c1}).`, `Tidak: ia tidak memenuhi persamaan 1 pun (ia memberi ${s.a1 * P[0] + s.b1 * P[1]}, bukan ${s.c1}).`), w: W(T('A pair is a solution of simultaneous equations only if it satisfies both equations at the same time.', 'Sesuatu pasangan ialah penyelesaian bagi persamaan serentak hanya jika ia memenuhi kedua-dua persamaan serentak.'), T(`Equation 1 gives $${s.a1 * P[0] + s.b1 * P[1]}$ and needs $${s.c1}$.`, `Persamaan 1 memberi $${s.a1 * P[0] + s.b1 * P[1]}$ dan memerlukan $${s.c1}$.`), T(`Equation 2 gives $${s.a2 * P[0] + s.b2 * P[1]}$ and needs $${s.c2}$.`, `Persamaan 2 memberi $${s.a2 * P[0] + s.b2 * P[1]}$ dan memerlukan $${s.c2}$.`), both ? T('Both hold, so the conclusion happens to be right.', 'Kedua-duanya dipenuhi, maka kesimpulan itu kebetulan betul.') : T('At least one fails, so the conclusion is wrong.', 'Sekurang-kurangnya satu tidak dipenuhi, maka kesimpulan itu salah.')), sp: 's' };
  };
  const e65Graph = (r) => {
    const s = sysR(r, { lo: -3, hi: 3, R: 2 });
    need(s.b1 !== 0 && s.b2 !== 0 && ab(s.c1 / s.b1) <= 5 && ab(s.c2 / s.b2) <= 5 && Math.abs(s.a1 * s.b2) !== Math.abs(s.a2 * s.b1));
    const fig = gfig([lnOf(s.a1, s.b1, s.c1, 'l₁'), lnOf(s.a2, s.b2, s.c2, 'l₂')], [{ x: s.x0, y: s.y0, l: 'P' }]), v = r.int(0, 2);
    if (v === 0) return { q: T(`The diagram shows the lines $${eq2(s.a1, s.b1, s.c1)}$ and $${eq2(s.a2, s.b2, s.c2)}$ meeting at $P$. Write down the coordinates of $P$.`, `Rajah menunjukkan garis $${eq2(s.a1, s.b1, s.c1)}$ dan $${eq2(s.a2, s.b2, s.c2)}$ bertemu di $P$. Tuliskan koordinat $P$.`), fig, a: T(`$${ptS(s.x0, s.y0)}$`), w: W(T('Read the coordinates of the crossing point straight from the axes.', 'Baca koordinat titik persilangan terus daripada paksi.'), T(`$P = ${ptS(s.x0, s.y0)}$`), T(`Check in the first equation: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$`, `Semak dalam persamaan pertama: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$`)), sp: 'xs' };
    if (v === 1) return { q: T(`The lines in the diagram are the graphs of two linear equations. What is the solution of the simultaneous equations $${sy(s)}$?`, `Garis dalam rajah ialah graf bagi dua persamaan linear. Apakah penyelesaian bagi persamaan serentak $${sy(s)}$?`), fig, a: T(`$x = ${s.x0}$, $y = ${s.y0}$`), w: W(T('The solution of a pair of simultaneous equations is the point where the two graphs meet.', 'Penyelesaian bagi sepasang persamaan serentak ialah titik pertemuan kedua-dua graf.'), T(`The lines meet at $${ptS(s.x0, s.y0)}$, so $x = ${s.x0}$ and $y = ${s.y0}$.`, `Garis-garis itu bertemu di $${ptS(s.x0, s.y0)}$, maka $x = ${s.x0}$ dan $y = ${s.y0}$.`)), sp: 's' };
    return { q: T(`Point $P$ is where the two lines cross. Explain why the coordinates of $P$ satisfy both $${eq2(s.a1, s.b1, s.c1)}$ and $${eq2(s.a2, s.b2, s.c2)}$, and write them down.`, `Titik $P$ ialah tempat kedua-dua garis bersilang. Terangkan mengapa koordinat $P$ memenuhi kedua-dua $${eq2(s.a1, s.b1, s.c1)}$ dan $${eq2(s.a2, s.b2, s.c2)}$, dan tuliskannya.`), fig, a: T(`$P$ lies on both lines, so it satisfies both equations: $${ptS(s.x0, s.y0)}$`, `$P$ terletak pada kedua-dua garis, maka ia memenuhi kedua-dua persamaan: $${ptS(s.x0, s.y0)}$`), w: W(T('Every point on a line satisfies the equation of that line.', 'Setiap titik pada suatu garis memenuhi persamaan garis itu.'), T(`$P$ is on both lines, so it satisfies both equations: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$ and $${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$.`, `$P$ berada pada kedua-dua garis, maka ia memenuhi kedua-dua persamaan: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$ dan $${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$.`), T(`$P = ${ptS(s.x0, s.y0)}$`)), sp: 's' };
  };
  const e65Num = (r) => {
    const kd = r.pick(['one', 'none', 'inf']), m = r.pick([1, -1, 2, -2]), c1 = r.int(-4, 4);
    let c2 = c1 + r.pick([2, 3, -2, -3]), m2 = r.pick([1, -1, 2, -2, 3]);
    need(ab(c2) <= 5);
    const mm2 = kd === 'one' ? m2 : m;
    need(kd !== 'one' || m2 !== m);
    const cc2 = kd === 'inf' ? c1 : c2;
    const fig = PW({ x: [-6, 6], y: [-6, 6], lines: kd === 'inf' ? [{ m, c: c1, label: 'l₁, l₂' }] : [{ m, c: c1, label: 'l₁' }, { m: mm2, c: cc2, label: 'l₂' }] });
    return { q: T('The diagram shows the graphs of two linear equations $l_1$ and $l_2$. How many solutions do the simultaneous equations have?', 'Rajah menunjukkan graf bagi dua persamaan linear $l_1$ dan $l_2$. Berapakah bilangan penyelesaian bagi persamaan serentak itu?'), fig, a: T(KT[kd].en, KT[kd].ms), w: kd === 'one' ? T('The lines cross once.', 'Garis bersilang sekali.') : kd === 'none' ? T('The lines are parallel and never meet.', 'Garis selari dan tidak pernah bertemu.') : T('The lines lie on top of each other.', 'Garis berhimpit antara satu sama lain.'), sp: 's' };
  };
  const e65Tab = (r) => {
    const s = sysR(r, { lo: 0, hi: 4, R: 2, pos: true }), xs = [0, 1, 2, 3, 4, 5];
    need(s.b1 === 1 || s.b1 === -1 || false);
    need(s.b2 === 1 || s.b2 === -1);
    need(s.x0 <= 4);
    const y1 = xs.map((x) => (s.c1 - s.a1 * x) / s.b1), y2 = xs.map((x) => (s.c2 - s.a2 * x) / s.b2);
    const t1 = SPM.table([['$x$'].concat(xs.map((z) => `$${z}$`)), ['$y$'].concat(y1.map((z) => `$${z}$`))]), t2 = SPM.table([['$x$'].concat(xs.map((z) => `$${z}$`)), ['$y$'].concat(y2.map((z) => `$${z}$`))]);
    return { q: T(`The tables show values of $x$ and $y$ for two equations.<br>$${eq2(s.a1, s.b1, s.c1)}$:<br>${t1}$${eq2(s.a2, s.b2, s.c2)}$:<br>${t2}Which pair $(x, y)$ appears in both tables? What does this pair represent?`, `Jadual menunjukkan nilai $x$ dan $y$ bagi dua persamaan.<br>$${eq2(s.a1, s.b1, s.c1)}$:<br>${t1}$${eq2(s.a2, s.b2, s.c2)}$:<br>${t2}Pasangan $(x, y)$ yang manakah muncul dalam kedua-dua jadual? Apakah yang diwakili oleh pasangan ini?`), a: T(`$${ptS(s.x0, s.y0)}$: the solution of the simultaneous equations`, `$${ptS(s.x0, s.y0)}$: penyelesaian bagi persamaan serentak itu`), w: W(T('Look for a value of $x$ that gives the same $y$ in both tables.', 'Cari nilai $x$ yang memberi nilai $y$ yang sama dalam kedua-dua jadual.'), T(`At $x = ${s.x0}$ both tables give $y = ${s.y0}$.`, `Pada $x = ${s.x0}$, kedua-dua jadual memberi $y = ${s.y0}$.`), T(`So $${ptS(s.x0, s.y0)}$ satisfies both equations, which makes it the solution of the simultaneous equations.`, `Maka $${ptS(s.x0, s.y0)}$ memenuhi kedua-dua persamaan, menjadikannya penyelesaian bagi persamaan serentak itu.`)), sp: 's' };
  };
  const TF5 = [
    [T('Two different straight lines can meet at more than one point.', 'Dua garis lurus yang berbeza boleh bertemu pada lebih daripada satu titik.'), false, T('Two different straight lines meet at most once.', 'Dua garis lurus yang berbeza bertemu paling banyak sekali.')],
    [T('Simultaneous equations whose lines are parallel and different have no solution.', 'Persamaan serentak yang garisnya selari dan berbeza tiada penyelesaian.'), true, T('Parallel lines never meet, so no point satisfies both equations.', 'Garis selari tidak pernah bertemu, maka tiada titik yang memenuhi kedua-dua persamaan.')],
    [T('A solution of simultaneous equations must satisfy both equations at the same time.', 'Penyelesaian bagi persamaan serentak mesti memenuhi kedua-dua persamaan pada masa yang sama.'), true, T('The solution is the common point of the two lines.', 'Penyelesaian ialah titik sepunya bagi kedua-dua garis.')],
    [T('If $x = 3$ satisfies the first equation and $y = 4$ satisfies the second, then $(3, 4)$ is the solution.', 'Jika $x = 3$ memenuhi persamaan pertama dan $y = 4$ memenuhi persamaan kedua, maka $(3, 4)$ ialah penyelesaian.'), false, T('The same pair $(x, y)$ must satisfy both equations.', 'Pasangan $(x, y)$ yang sama mesti memenuhi kedua-dua persamaan.')],
    [T('If two equations have the same graph, every point on the line is a solution of both.', 'Jika dua persamaan mempunyai graf yang sama, setiap titik pada garis itu ialah penyelesaian bagi kedua-duanya.'), true, T('The lines coincide, giving infinitely many solutions.', 'Garis-garis itu berhimpit, memberi penyelesaian yang tidak terhingga banyaknya.')],
    [T('Simultaneous linear equations always have exactly one solution.', 'Persamaan linear serentak sentiasa mempunyai tepat satu penyelesaian.'), false, T('They can also have no solution (parallel lines) or infinitely many (coincident lines).', 'Ia juga boleh tiada penyelesaian (garis selari) atau tidak terhingga banyaknya (garis berhimpit).')],
    [T('The equations $x + y = 6$ and $2x + 2y = 12$ have exactly one common solution.', 'Persamaan $x + y = 6$ dan $2x + 2y = 12$ mempunyai tepat satu penyelesaian sepunya.'), false, T('The second equation is twice the first, so the lines coincide and there are infinitely many common solutions.', 'Persamaan kedua ialah dua kali persamaan pertama, maka garis berhimpit dan terdapat penyelesaian sepunya yang tidak terhingga banyaknya.')],
    [T('The pair $(2, 1)$ is a solution of $x + y = 3$ and of $x - y = 1$, so it is the solution of the simultaneous equations.', 'Pasangan $(2, 1)$ ialah penyelesaian bagi $x + y = 3$ dan $x - y = 1$, maka ia penyelesaian bagi persamaan serentak itu.'), true, T('$2 + 1 = 3$ and $2 - 1 = 1$.', '$2 + 1 = 3$ dan $2 - 1 = 1$.')],
    [T('The lines $y = 2x + 1$ and $y = 2x + 5$ meet at exactly one point.', 'Garis $y = 2x + 1$ dan $y = 2x + 5$ bertemu pada tepat satu titik.'), false, T('They are parallel (both rise 2 units for every 1 unit across) with different $y$-intercepts, so they never meet.', 'Garis-garis itu selari (kedua-duanya naik 2 unit bagi setiap 1 unit mengufuk) dengan pintasan-$y$ yang berbeza, maka tidak pernah bertemu.')],
  ];
  const e65TF = (r) => { const t = r.pick(TF5); return { q: T(`True or false? ${t[0].en} Give a reason.`, `Benar atau palsu? ${t[0].ms} Berikan satu sebab.`), a: T(`${t[1] ? 'True' : 'False'}. ${t[2].en}`, `${t[1] ? 'Benar' : 'Palsu'}. ${t[2].ms}`), w: W(t[2], T(`So the statement is ${t[1] ? 'true' : 'false'}.`, `Maka pernyataan itu ${t[1] ? 'benar' : 'palsu'}.`)), sp: 's' }; };
  const ge65 = [e65Form, e65Check, e65Graph, e65Num, e65Tab, e65TF];

    const clsWhy = { one: T('The coefficients of $x$ and $y$ are not in the same ratio, so the lines cross once.', 'Pekali $x$ dan $y$ tidak berkadar sama, maka garis bersilang sekali.'), none: T('The coefficients are in the same ratio but the constants are not, so the lines are parallel.', 'Pekali berkadar sama tetapi pemalar tidak, maka garis selari.'), inf: T('The coefficients and the constants are all in the same ratio, so the lines coincide.', 'Pekali dan pemalar semuanya berkadar sama, maka garis berhimpit.') };
  const m65Class = (r) => {
    const v = r.int(0, 2), kd = r.pick(['one', 'none', 'inf']), s = mkK(r, kd);
    if (v === 0) return { q: T(`Without solving, state whether the simultaneous equations $${sy(s)}$ have one solution, no solution or infinitely many solutions. Give a reason.`, `Tanpa menyelesaikannya, nyatakan sama ada persamaan serentak $${sy(s)}$ mempunyai satu penyelesaian, tiada penyelesaian atau penyelesaian yang tidak terhingga banyaknya. Berikan sebab.`), a: T(`${SPM.cap(KT[kind(s)].en)}. ${clsWhy[kind(s)].en}`, `${SPM.cap(KT[kind(s)].ms)}. ${clsWhy[kind(s)].ms}`), w: W(T(`Compare the coefficients: $${s.a1}$ and $${s.a2}$ for $x$, $${s.b1}$ and $${s.b2}$ for $y$, $${s.c1}$ and $${s.c2}$ for the constants.`, `Bandingkan pekali: $${s.a1}$ dan $${s.a2}$ bagi $x$, $${s.b1}$ dan $${s.b2}$ bagi $y$, $${s.c1}$ dan $${s.c2}$ bagi pemalar.`), clsWhy[kind(s)], cat(T('So there is ', 'Maka terdapat '), KT[kind(s)], T('.', '.'))), sp: 's' };
    if (v === 1) { const s3 = [mkK(r, 'one'), mkK(r, kd === 'one' ? 'none' : kd), mkK(r, 'inf')]; const sh = r.shuffle(s3); return { q: withQ(T('Classify each pair of equations as having one solution, no solution or infinitely many solutions.', 'Kelaskan setiap pasangan persamaan sebagai mempunyai satu penyelesaian, tiada penyelesaian atau penyelesaian yang tidak terhingga banyaknya.'), SPM.parts(sh.map((z) => T(`$${sy(z)}$`)))), a: SPM.parts(sh.map((z) => KT[kind(z)])), w: W(T('In each pair, compare the coefficients of $x$ and of $y$ in the two equations, then the constants.', 'Dalam setiap pasangan, bandingkan pekali $x$ dan pekali $y$ dalam kedua-dua persamaan, kemudian pemalarnya.'), ...sh.map((z, i) => cat(T(`(${ABC[i]}) `, `(${ABC[i]}) `), clsWhy[kind(z)]))), sp: 'm' }; }
    const a = r.int(1, 4), c = r.int(-6, 6), d = r.pick([1, 2, 3]);
    const same = kd === 'inf', par = kd === 'none';
    const c2 = par ? c + d : same ? c : c + d, m2 = kd === 'one' ? a + r.pick([1, 2, -1]) : a;
    need(m2 !== 0 && ab(c2) <= 9);
    const k = kind({ a1: -a, b1: 1, c1: c, a2: -m2, b2: 1, c2 });
    return { q: T(`Two lines have equations $${yEq(a, c)}$ and $${yEq(m2, c2)}$. Without drawing them, state whether they meet at one point, never meet, or lie on top of each other, and how many solutions the simultaneous equations have.`, `Dua garis mempunyai persamaan $${yEq(a, c)}$ dan $${yEq(m2, c2)}$. Tanpa melukisnya, nyatakan sama ada garis-garis itu bertemu pada satu titik, tidak pernah bertemu atau berhimpit, dan berapakah bilangan penyelesaian bagi persamaan serentak itu.`), a: k === 'one' ? T('They meet at one point: one solution', 'Garis bertemu pada satu titik: satu penyelesaian') : k === 'none' ? T('They are parallel and never meet: no solution', 'Garis selari dan tidak pernah bertemu: tiada penyelesaian') : T('They coincide: infinitely many solutions', 'Garis berhimpit: penyelesaian yang tidak terhingga banyaknya'), w: W(T('In the form $y = mx + c$, two lines are parallel when they have the same coefficient of $x$.', 'Dalam bentuk $y = mx + c$, dua garis adalah selari apabila pekali $x$-nya sama.'), k === 'one' ? T(`The coefficients of $x$ are $${a}$ and $${m2}$, which are different, so the lines cross exactly once.`, `Pekali $x$ ialah $${a}$ dan $${m2}$, yang berbeza, maka garis bersilang tepat sekali.`) : k === 'none' ? T(`Both have coefficient of $x$ equal to $${a}$, but the $y$-intercepts $${c}$ and $${c2}$ differ, so the lines are parallel and never meet.`, `Kedua-duanya mempunyai pekali $x$ yang sama, iaitu $${a}$, tetapi pintasan-$y$ $${c}$ dan $${c2}$ berbeza, maka garis selari dan tidak pernah bertemu.`) : T(`Both the coefficient of $x$ ($${a}$) and the $y$-intercept ($${c}$) are the same, so the two equations describe the same line.`, `Kedua-dua pekali $x$ ($${a}$) dan pintasan-$y$ ($${c}$) adalah sama, maka kedua-dua persamaan menghuraikan garis yang sama.`)), sp: 's' };
  };
  const m65Form = (r) => {
    const s = r.pick(SC5)(r), v = r.int(0, 2);
    if (v === 0) return { q: T(`${s.st.en} (a) Write two equations. (b) Show that $(x, y) = ${ptS(s.x0, s.y0)}$ is the solution, and say what it means in this situation.`, `${s.st.ms} (a) Tulis dua persamaan. (b) Tunjukkan bahawa $(x, y) = ${ptS(s.x0, s.y0)}$ ialah penyelesaiannya, dan nyatakan maksudnya dalam situasi ini.`), a: T(`(a) $${eqsOf(s)}$ (b) it satisfies both: ${s.nx.en} = ${s.x0}, ${s.ny.en} = ${s.y0}`, `(a) $${eqsOf(s)}$ (b) ia memenuhi kedua-duanya: ${s.nx.ms} = ${s.x0}, ${s.ny.ms} = ${s.y0}`), w: W(T(`(a) $${eqsOf(s)}$`), T(`(b) Substitute $x = ${s.x0}$, $y = ${s.y0}$: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$ and $${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$.`, `(b) Gantikan $x = ${s.x0}$, $y = ${s.y0}$: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$ dan $${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$.`), T(`Both equations hold, so ${s.nx.en} is ${s.x0} and ${s.ny.en} is ${s.y0}.`, `Kedua-dua persamaan dipenuhi, maka ${s.nx.ms} ialah ${s.x0} dan ${s.ny.ms} ialah ${s.y0}.`)), sp: 'm' };
    if (v === 1) return { q: T(`${s.st.en} Form two linear equations. Could $(x, y) = ${ptS(s.x0 + 1, s.y0)}$ be the solution? Test it in both equations.`, `${s.st.ms} Bentukkan dua persamaan linear. Bolehkah $(x, y) = ${ptS(s.x0 + 1, s.y0)}$ menjadi penyelesaiannya? Uji dalam kedua-dua persamaan.`), a: T(`$${eqsOf(s)}$; no: equation 1 gives ${s.a1 * (s.x0 + 1) + s.b1 * s.y0}, not ${s.c1}`, `$${eqsOf(s)}$; tidak: persamaan 1 memberi ${s.a1 * (s.x0 + 1) + s.b1 * s.y0}, bukan ${s.c1}`), w: W(T(`Equations: $${eqsOf(s)}$`, `Persamaan: $${eqsOf(s)}$`), T(`Test the pair in equation 1: $${cn(s.a1)}${br(s.x0 + 1)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.a1 * (s.x0 + 1) + s.b1 * s.y0}$, which is not $${s.c1}$.`, `Uji pasangan itu dalam persamaan 1: $${cn(s.a1)}${br(s.x0 + 1)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.a1 * (s.x0 + 1) + s.b1 * s.y0}$, yang bukan $${s.c1}$.`), T(`One failure is enough: the pair is not the solution. The solution is $${ptS(s.x0, s.y0)}$.`, `Satu kegagalan sudah cukup: pasangan itu bukan penyelesaiannya. Penyelesaiannya ialah $${ptS(s.x0, s.y0)}$.`)), sp: 'm' };
    return { q: T(`${s.st.en} Write the situation as a pair of simultaneous equations and state how many solutions you expect.`, `${s.st.ms} Tulis situasi itu sebagai sepasang persamaan serentak dan nyatakan berapakah bilangan penyelesaian yang dijangkakan.`), a: T(`$${eqsOf(s)}$; one solution (the two relationships are independent)`, `$${eqsOf(s)}$; satu penyelesaian (kedua-dua hubungan itu tidak bersandar)`), w: W(T(`Equations: $${eqsOf(s)}$`, `Persamaan: $${eqsOf(s)}$`), T(`The coefficients are not in the same ratio ($${s.a1} : ${s.a2}$ against $${s.b1} : ${s.b2}$), so the two lines cross exactly once.`, `Pekali tidak berkadar sama ($${s.a1} : ${s.a2}$ berbanding $${s.b1} : ${s.b2}$), maka kedua-dua garis bersilang tepat sekali.`), T('So there is exactly one pair $(x, y)$ that fits both conditions.', 'Maka terdapat tepat satu pasangan $(x, y)$ yang memenuhi kedua-dua syarat.')), sp: 'm' };
  };
  const m65Graph = (r) => {
    const v = r.int(0, 1), s = sysR(r, { lo: -3, hi: 3, R: 3 });
    if (v === 0) {
      const k = r.nz(-4, 4), m = r.pick([1, -1, 2, -2]), c = r.int(-3, 3), yv = m * k + c;
      need(ab(yv) <= 5);
      const fig = PW({ x: [-6, 6], y: [-6, 6], lines: [{ m, c, label: 'l₂' }], vlines: [k], pts: [{ x: k, y: yv, l: '' }] });
      return { q: T(`The diagram shows the lines $x = ${k}$ and $${yEq(m, c)}$. Write down the solution of the simultaneous equations and check it in both equations.`, `Rajah menunjukkan garis $x = ${k}$ dan $${yEq(m, c)}$. Tuliskan penyelesaian bagi persamaan serentak itu dan semak dalam kedua-dua persamaan.`), fig, a: T(`$x = ${k}$, $y = ${yv}$; $${m}(${k}) ${sg(c)} ${ab(c)} = ${yv}$`), w: W(T(`$x = ${k}$ is a vertical line, so at the crossing point $x = ${k}$.`, `$x = ${k}$ ialah garis mencancang, maka pada titik persilangan $x = ${k}$.`), T(`Substitute into $${yEq(m, c)}$: $y = ${cn(m)}${br(k)}${c === 0 ? '' : ` ${sg(c)} ${ab(c)}`} = ${yv}$.`, `Gantikan ke dalam $${yEq(m, c)}$: $y = ${cn(m)}${br(k)}${c === 0 ? '' : ` ${sg(c)} ${ab(c)}`} = ${yv}$.`), T(`The solution is $x = ${k}$, $y = ${yv}$, which agrees with the crossing point on the graph.`, `Penyelesaiannya ialah $x = ${k}$, $y = ${yv}$, yang sepadan dengan titik persilangan pada graf.`)), sp: 's' };
    }
    need(s.b1 !== 0 && s.b2 !== 0 && ab(s.c1 / s.b1) <= 6 && ab(s.c2 / s.b2) <= 6);
    return { q: T(`Draw the graphs of $${eq2(s.a1, s.b1, s.c1)}$ and $${eq2(s.a2, s.b2, s.c2)}$ on the same axes, using the intercepts or a table of values. Write down the coordinates of the point of intersection and state what it represents.`, `Lukis graf $${eq2(s.a1, s.b1, s.c1)}$ dan $${eq2(s.a2, s.b2, s.c2)}$ pada paksi yang sama dengan menggunakan pintasan atau jadual nilai. Tuliskan koordinat titik persilangan dan nyatakan apa yang diwakilinya.`), fig: PW({ x: [-6, 6], y: [-6, 6] }), a: T(`$${ptS(s.x0, s.y0)}$: the solution of the simultaneous equations`, `$${ptS(s.x0, s.y0)}$: penyelesaian bagi persamaan serentak itu`), w: W(T(`For $${eq2(s.a1, s.b1, s.c1)}$: $x = 0$ gives $y = ${tx(Fr.make(s.c1, s.b1))}$, and $y = 0$ gives $x = ${tx(Fr.make(s.c1, s.a1))}$.`, `Bagi $${eq2(s.a1, s.b1, s.c1)}$: $x = 0$ memberi $y = ${tx(Fr.make(s.c1, s.b1))}$, dan $y = 0$ memberi $x = ${tx(Fr.make(s.c1, s.a1))}$.`), T(`For $${eq2(s.a2, s.b2, s.c2)}$: $x = 0$ gives $y = ${tx(Fr.make(s.c2, s.b2))}$, and $y = 0$ gives $x = ${tx(Fr.make(s.c2, s.a2))}$.`, `Bagi $${eq2(s.a2, s.b2, s.c2)}$: $x = 0$ memberi $y = ${tx(Fr.make(s.c2, s.b2))}$, dan $y = 0$ memberi $x = ${tx(Fr.make(s.c2, s.a2))}$.`), T('Join each pair of points with a straight line.', 'Sambungkan setiap pasangan titik dengan garis lurus.'), T(`The lines cross at $${ptS(s.x0, s.y0)}$, which is the solution of the simultaneous equations.`, `Garis-garis itu bersilang di $${ptS(s.x0, s.y0)}$, iaitu penyelesaian bagi persamaan serentak itu.`)), sp: 'xl' };
  };
  const PLN = [
    [T('gym plans', 'pelan gim'), T('visits', 'lawatan'), T('cost', 'kos')], [T('phone plans', 'pelan telefon'), T('gigabytes of data', 'gigabait data'), T('monthly bill', 'bil bulanan')], [T('taxi companies', 'syarikat teksi'), T('kilometres', 'kilometer'), T('fare', 'tambang')], [T('printing shops', 'kedai cetak'), T('pages printed', 'muka surat dicetak'), T('total charge', 'jumlah bayaran')], [T('bicycle rental shops', 'kedai sewa basikal'), T('hours', 'jam'), T('rental fee', 'yuran sewa')],
  ];
  const m65Plan = (r) => {
    const p = r.pick(PLN), x0 = r.int(3, 8), a = r.int(1, 3), c = a + r.int(1, 3), d = r.int(1, 4), b = d + (c - a) * x0;
    need(b <= 24);
    const yv = a * x0 + b, Y = Math.max(yv, b, d) + 4, fig = S.plane({ x: [0, x0 + 4], y: [0, Math.min(Y, 40)], scale: Y > 20 ? 10 : 16, labelStep: Y > 20 ? 5 : 2, lines: [{ m: a, c: b, label: 'A' }, { m: c, c: d, label: 'B' }], pts: [{ x: x0, y: yv, l: '' }] });
    const v = r.int(0, 1);
    return { q: v === 0 ? T(`The graph compares two ${p[0].en}, A and B. The horizontal axis shows the number of ${p[1].en} ($x$) and the vertical axis shows the ${p[2].en} ($y$) in RM. Their equations are $${yEq(a, b)}$ and $${yEq(c, d)}$. For how many ${p[1].en} do the two plans cost the same, and what is that ${p[2].en}?`, `Graf membandingkan dua ${p[0].ms}, A dan B. Paksi mengufuk menunjukkan bilangan ${p[1].ms} ($x$) dan paksi mencancang menunjukkan ${p[2].ms} ($y$) dalam RM. Persamaannya ialah $${yEq(a, b)}$ dan $${yEq(c, d)}$. Bagi berapakah ${p[1].ms} kedua-dua pelan berkos sama, dan berapakah ${p[2].ms} itu?`) : T(`The graph shows the ${p[2].en} $y$ (in RM) for $x$ ${p[1].en} under two ${p[0].en}, A and B. Read the point where the lines meet and say which plan is cheaper for ${x0 + 2} ${p[1].en}.`, `Graf menunjukkan ${p[2].ms} $y$ (dalam RM) bagi $x$ ${p[1].ms} di bawah dua ${p[0].ms}, A dan B. Baca titik pertemuan garis-garis itu dan nyatakan pelan yang lebih murah bagi ${x0 + 2} ${p[1].ms}.`), fig, a: v === 0 ? T(`${x0} ${p[1].en}; RM${yv}`, `${x0} ${p[1].ms}; RM${yv}`) : T(`They meet at $${ptS(x0, yv)}$; for ${x0 + 2} ${p[1].en} plan A costs RM${a * (x0 + 2) + b} and plan B costs RM${c * (x0 + 2) + d}, so plan ${a * (x0 + 2) + b < c * (x0 + 2) + d ? 'A' : 'B'} is cheaper`, `Bertemu di $${ptS(x0, yv)}$; bagi ${x0 + 2} ${p[1].ms} pelan A berharga RM${a * (x0 + 2) + b} dan pelan B berharga RM${c * (x0 + 2) + d}, maka pelan ${a * (x0 + 2) + b < c * (x0 + 2) + d ? 'A' : 'B'} lebih murah`), w: W(T(`The two plans agree where the lines meet: $${a}x + ${b} = ${c}x + ${d}$.`, `Kedua-dua pelan sama pada titik pertemuan garis: $${a}x + ${b} = ${c}x + ${d}$.`), T(`$${c - a}x = ${b - d}$, so $x = ${x0}$ and $y = ${cn(a)}${br(x0)} + ${b} = ${yv}$.`, `$${c - a}x = ${b - d}$, maka $x = ${x0}$ dan $y = ${cn(a)}${br(x0)} + ${b} = ${yv}$.`), v === 0 ? T(`So the two plans cost the same for ${x0} ${p[1].en}, at RM${yv}.`, `Maka kedua-dua pelan berkos sama bagi ${x0} ${p[1].ms}, iaitu RM${yv}.`) : T(`At $x = ${x0 + 2}$: plan A costs RM${a * (x0 + 2) + b} and plan B costs RM${c * (x0 + 2) + d}, so plan ${a * (x0 + 2) + b < c * (x0 + 2) + d ? 'A' : 'B'} is cheaper.`, `Pada $x = ${x0 + 2}$: pelan A berharga RM${a * (x0 + 2) + b} dan pelan B berharga RM${c * (x0 + 2) + d}, maka pelan ${a * (x0 + 2) + b < c * (x0 + 2) + d ? 'A' : 'B'} lebih murah.`)), sp: 's' };
  };
  const m65Err = (r) => {
    const s = sysR(r, { lo: 1, hi: 6, R: 3, pos: true }), nm = r.name();
    need(s.x0 !== s.y0);
    return { q: T(`${nm} says that the solution of $${sy(s)}$ is $x = ${s.x0}$ from the first equation and $y = ${s.x0}$ from the second. Explain what is wrong and give the correct solution.`, `${nm} berkata bahawa penyelesaian bagi $${sy(s)}$ ialah $x = ${s.x0}$ daripada persamaan pertama dan $y = ${s.x0}$ daripada persamaan kedua. Terangkan apa yang salah dan berikan penyelesaian yang betul.`), a: T(`The values of $x$ and $y$ must satisfy both equations together as one ordered pair. The solution is $${ptS(s.x0, s.y0)}$.`, `Nilai $x$ dan $y$ mesti memenuhi kedua-dua persamaan bersama-sama sebagai satu pasangan tertib. Penyelesaiannya ialah $${ptS(s.x0, s.y0)}$.`), w: W(T('A solution of simultaneous equations is one ordered pair that satisfies both equations at the same time; $x$ cannot be taken from one equation and $y$ from the other.', 'Penyelesaian bagi persamaan serentak ialah satu pasangan tertib yang memenuhi kedua-dua persamaan serentak; $x$ tidak boleh diambil daripada satu persamaan dan $y$ daripada persamaan yang lain.'), T(`Solving them together gives $x = ${s.x0}$ and $y = ${s.y0}$.`, `Menyelesaikannya bersama-sama memberi $x = ${s.x0}$ dan $y = ${s.y0}$.`), T(`Check: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$ and $${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$.`, `Semak: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$ dan $${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$.`)), sp: 'm' };
  };
  const gm65 = [m65Class, m65Form, m65Graph, m65Plan, m65Err];

  const a65K = (r) => {
    const a = r.int(1, 4), b = r.int(1, 4), c = r.int(2, 9), t = r.pick([2, 3]), v = r.int(0, 2);
    if (v === 0) return { q: T(`Find the value of $k$ for which the simultaneous equations $\\begin{cases} ${eq2(a, b, c)} \\\\ ${poly([[a * t, 'x'], [b * t, 'y']])} = k \\end{cases}$ have no solution. (Give a value that makes the lines parallel but different.)`, `Cari nilai $k$ yang menjadikan persamaan serentak $\\begin{cases} ${eq2(a, b, c)} \\\\ ${poly([[a * t, 'x'], [b * t, 'y']])} = k \\end{cases}$ tiada penyelesaian. (Berikan satu nilai yang menjadikan garis selari tetapi berbeza.)`), a: T(`Any $k \\ne ${c * t}$, for example $k = ${c * t + 1}$`, `Sebarang $k \\ne ${c * t}$, contohnya $k = ${c * t + 1}$`), w: W(T(`Multiplying the first equation by $${t}$ gives $${poly([[a * t, 'x'], [b * t, 'y']])} = ${c * t}$.`, `Mendarab persamaan pertama dengan $${t}$ memberi $${poly([[a * t, 'x'], [b * t, 'y']])} = ${c * t}$.`), T(`The $x$ and $y$ terms already match, so the lines are parallel; they are different lines, and so have no solution, whenever $k \\ne ${c * t}$.`, `Sebutan $x$ dan $y$ sudah sepadan, maka garis selari; garis itu berbeza, dan tiada penyelesaian, apabila $k \\ne ${c * t}$.`), T(`For example $k = ${c * t + 1}$.`, `Contohnya $k = ${c * t + 1}$.`)), sp: 's' };
    if (v === 1) return { q: T(`The simultaneous equations $\\begin{cases} ${eq2(a, b, c)} \\\\ ${poly([[a * t, 'x'], [b * t, 'y']])} = k \\end{cases}$ have infinitely many solutions. Find $k$.`, `Persamaan serentak $\\begin{cases} ${eq2(a, b, c)} \\\\ ${poly([[a * t, 'x'], [b * t, 'y']])} = k \\end{cases}$ mempunyai penyelesaian yang tidak terhingga banyaknya. Cari $k$.`), a: T(`$k = ${c * t}$`), w: W(T('Infinitely many solutions means the two equations describe the same line.', 'Penyelesaian yang tidak terhingga banyaknya bermakna kedua-dua persamaan menghuraikan garis yang sama.'), T(`The left-hand side of the second equation is $${t}$ times the first, so the right-hand side must be as well.`, `Sebelah kiri persamaan kedua ialah $${t}$ kali yang pertama, maka sebelah kanan juga mesti begitu.`), T(`$k = ${t} \\times ${c} = ${c * t}$`)), sp: 's' };
    const m = r.int(2, 5);
    need(m !== a);
    return { q: T(`For the equations $${eq2(a, b, c)}$ and $${poly([[m, 'x'], [b, 'y']])} = ${c + 1}$, do the lines meet at one point, no point or all points? Explain using the coefficients.`, `Bagi persamaan $${eq2(a, b, c)}$ dan $${poly([[m, 'x'], [b, 'y']])} = ${c + 1}$, adakah garis-garis itu bertemu pada satu titik, tiada titik atau semua titik? Terangkan dengan menggunakan pekali.`), a: T(`One point: the coefficients of $x$ (${a} and ${m}) differ while the coefficients of $y$ are equal, so they are not proportional`, `Satu titik: pekali $x$ (${a} dan ${m}) berbeza manakala pekali $y$ sama, maka tidak berkadar`), w: W(T('Two lines are parallel (or coincide) only when the coefficients of $x$ and of $y$ are in the same ratio.', 'Dua garis selari (atau berhimpit) hanya apabila pekali $x$ dan pekali $y$ berkadar sama.'), T(`Here the $x$ coefficients are $${a}$ and $${m}$ while the $y$ coefficients are both $${b}$, so the ratios differ.`, `Di sini pekali $x$ ialah $${a}$ dan $${m}$ manakala pekali $y$ kedua-duanya $${b}$, maka nisbahnya berbeza.`), T('The lines are therefore not parallel and meet at exactly one point.', 'Maka garis-garis itu tidak selari dan bertemu pada tepat satu titik.')), sp: 's' };
  };
  const a65Find = (r) => {
    const s = sysR(r, { lo: -3, hi: 5, R: 3 }), v = r.int(0, 1);
    if (v === 0) return { q: T(`The simultaneous equations $\\begin{cases} ${eq2(s.a1, s.b1, s.c1)} \\\\ ${poly([[s.a2, 'x'], [s.b2, 'y']])} = k \\end{cases}$ have the solution $x = ${s.x0}$, $y = ${s.y0}$. Find the value of $k$.`, `Persamaan serentak $\\begin{cases} ${eq2(s.a1, s.b1, s.c1)} \\\\ ${poly([[s.a2, 'x'], [s.b2, 'y']])} = k \\end{cases}$ mempunyai penyelesaian $x = ${s.x0}$, $y = ${s.y0}$. Cari nilai $k$.`), a: T(`$k = ${s.c2}$`), w: W(T('The solution must satisfy the second equation as well.', 'Penyelesaian itu mesti memenuhi persamaan kedua juga.'), T(`$k = ${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$`)), sp: 's' };
    need(s.x0 !== 0);
    return { q: T(`$(${s.x0}, ${s.y0})$ is the solution of $\\begin{cases} ${poly([[s.a1, 'x'], [s.b1, 'y']])} = p \\\\ ${poly([[s.a2, 'x'], [s.b2, 'y']])} = q \\end{cases}$. Find the values of $p$ and $q$.`, `$(${s.x0}, ${s.y0})$ ialah penyelesaian bagi $\\begin{cases} ${poly([[s.a1, 'x'], [s.b1, 'y']])} = p \\\\ ${poly([[s.a2, 'x'], [s.b2, 'y']])} = q \\end{cases}$. Cari nilai $p$ dan $q$.`), a: T(`$p = ${s.c1}$, $q = ${s.c2}$`), w: W(T(`Substitute $x = ${s.x0}$ and $y = ${s.y0}$ into both equations.`, `Gantikan $x = ${s.x0}$ dan $y = ${s.y0}$ ke dalam kedua-dua persamaan.`), T(`$p = ${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$`), T(`$q = ${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$`)), sp: 's' };
  };
  const a65Table = (r) => {
    const s = r.pick(SC5)(r);
    const a = s.a1, b = s.b1;
    need(a > 0 && b > 0 && s.a2 > 0 && s.b2 > 0 && s.a1 !== 1);
    const tab = SPM.table([[T('Purchase', 'Pembelian').en, '$x$ ', '$y$ ', T('Total', 'Jumlah').en], ['1', `${s.a1}`, `${s.b1}`, `${s.c1}`], ['2', `${s.a2}`, `${s.b2}`, `${s.c2}`]]);
    const tabM = SPM.table([['Pembelian', '$x$ ', '$y$ ', 'Jumlah'], ['1', `${s.a1}`, `${s.b1}`, `${s.c1}`], ['2', `${s.a2}`, `${s.b2}`, `${s.c2}`]]);
    return { q: T(`${s.st.en}<br>The table gives the numbers of $x$-items and $y$-items in two situations and the totals.<br>${tab}Write two linear equations and show that $(${s.x0}, ${s.y0})$ satisfies both.`, `${s.st.ms}<br>Jadual memberi bilangan barang $x$ dan barang $y$ dalam dua situasi serta jumlahnya.<br>${tabM}Tulis dua persamaan linear dan tunjukkan bahawa $(${s.x0}, ${s.y0})$ memenuhi kedua-duanya.`), a: T(`$${eqsOf(s)}$; both are satisfied`, `$${eqsOf(s)}$; kedua-duanya dipenuhi`), w: W(T(`Each row of the table gives one equation: $${eq2(s.a1, s.b1, s.c1)}$ and $${eq2(s.a2, s.b2, s.c2)}$.`, `Setiap baris jadual memberi satu persamaan: $${eq2(s.a1, s.b1, s.c1)}$ dan $${eq2(s.a2, s.b2, s.c2)}$.`), T(`Substitute $x = ${s.x0}$, $y = ${s.y0}$ into the first: $${cn(s.a1)}${br(s.x0)} + ${cn(s.b1)}${br(s.y0)} = ${s.c1}$`, `Gantikan $x = ${s.x0}$, $y = ${s.y0}$ ke dalam yang pertama: $${cn(s.a1)}${br(s.x0)} + ${cn(s.b1)}${br(s.y0)} = ${s.c1}$`), T(`And into the second: $${cn(s.a2)}${br(s.x0)} + ${cn(s.b2)}${br(s.y0)} = ${s.c2}$`, `Dan ke dalam yang kedua: $${cn(s.a2)}${br(s.x0)} + ${cn(s.b2)}${br(s.y0)} = ${s.c2}$`), T('Both equations are satisfied, so the pair is the solution.', 'Kedua-dua persamaan dipenuhi, maka pasangan itu ialah penyelesaiannya.')), sp: 'm' };
  };
  const a65Match = (r) => {
    const ks = r.shuffle(['one', 'none', 'inf']), ss = ks.map((k) => mkK(r, k));
    return { q: withQ(T('Match each pair of equations with the description of its graph: (P) two lines that meet at one point, (Q) two parallel lines, (R) two lines that coincide.', 'Padankan setiap pasangan persamaan dengan huraian grafnya: (P) dua garis yang bertemu pada satu titik, (Q) dua garis selari, (R) dua garis yang berhimpit.'), SPM.parts(ss.map((z) => T(`$${sy(z)}$`)))), a: SPM.parts(ks.map((k) => T({ one: 'P', none: 'Q', inf: 'R' }[k]))), w: W(T('Compare the two equations in each pair: if one is a multiple of the other all the way through, the lines coincide; if only the $x$ and $y$ terms are in the same ratio, the lines are parallel; otherwise they cross once.', 'Bandingkan kedua-dua persamaan dalam setiap pasangan: jika satu ialah gandaan yang satu lagi sepenuhnya, garis berhimpit; jika hanya sebutan $x$ dan $y$ berkadar sama, garis selari; jika tidak, garis bersilang sekali.'), ...ss.map((z, i) => T(`(${'abc'[i]}) ${{ one: 'the coefficients are not in the same ratio, so the lines meet at one point: P', none: 'the coefficients are in the same ratio but the constants are not, so the lines are parallel: Q', inf: 'the coefficients and the constants are all in the same ratio, so the lines coincide: R' }[kind(z)]}`, `(${'abc'[i]}) ${{ one: 'pekali tidak berkadar sama, maka garis bertemu pada satu titik: P', none: 'pekali berkadar sama tetapi pemalar tidak, maka garis selari: Q', inf: 'pekali dan pemalar semuanya berkadar sama, maka garis berhimpit: R' }[kind(z)]}`))), sp: 'm' };
  };
  const a65Ctx = (r) => {
    const s = r.pick(SC5)(r);
    need(s.a1 > 0 && s.b1 > 0);
    return { q: T(`${s.st.en} The graph of each equation is a straight line. What do the coordinates of the point where the two lines meet represent here? Write down that point.`, `${s.st.ms} Graf setiap persamaan ialah garis lurus. Apakah yang diwakili oleh koordinat titik pertemuan kedua-dua garis dalam situasi ini? Tuliskan titik itu.`), a: T(`The values of ${s.nx.en} and ${s.ny.en} that fit both conditions: $${ptS(s.x0, s.y0)}$`, `Nilai ${s.nx.ms} dan ${s.ny.ms} yang memenuhi kedua-dua syarat: $${ptS(s.x0, s.y0)}$`), w: W(T('Each equation is one condition from the problem, and its graph shows every pair that fits that condition.', 'Setiap persamaan ialah satu syarat daripada masalah itu, dan grafnya menunjukkan setiap pasangan yang memenuhi syarat itu.'), T('The point on both lines is the only pair that fits both conditions at once.', 'Titik pada kedua-dua garis ialah satu-satunya pasangan yang memenuhi kedua-dua syarat serentak.'), T(`Here that point is $${ptS(s.x0, s.y0)}$: ${s.nx.en} $= ${s.x0}$ and ${s.ny.en} $= ${s.y0}$.`, `Di sini titik itu ialah $${ptS(s.x0, s.y0)}$: ${s.nx.ms} $= ${s.x0}$ dan ${s.ny.ms} $= ${s.y0}$.`)), sp: 's' };
  };
  const ga65 = [a65K, a65Find, a65Table, a65Match, a65Ctx];
  SC5.push(
    (r) => { const x0 = r.int(8, 15), y0 = r.int(2, 7), nm = r.name(); return S5(T(`${nm} answers ${x0 + y0} quiz questions. Each correct answer ($x$ of them) earns 3 marks and each wrong answer ($y$ of them) loses 1 mark. ${nm}'s score is ${3 * x0 - y0} marks.`, `${nm} menjawab ${x0 + y0} soalan kuiz. Setiap jawapan betul ($x$ soalan) mendapat 3 markah dan setiap jawapan salah ($y$ soalan) ditolak 1 markah. Skor ${nm} ialah ${3 * x0 - y0} markah.`), [1, 1], [3, -1], x0, y0, T('correct answers', 'jawapan betul'), T('wrong answers', 'jawapan salah')); },
    (r) => { const x0 = r.int(6, 20), y0 = r.int(3, 15); return S5(T(`A car park has $x$ cars, each paying RM2 per hour, and $y$ motorcycles, each paying RM1 per hour. There are ${x0 + y0} vehicles and the hourly takings are RM${2 * x0 + y0}.`, `Sebuah tempat letak kereta mempunyai $x$ buah kereta yang masing-masing membayar RM2 sejam dan $y$ buah motosikal yang masing-masing membayar RM1 sejam. Terdapat ${x0 + y0} buah kenderaan dan kutipan sejam ialah RM${2 * x0 + y0}.`), [1, 1], [2, 1], x0, y0, T('cars', 'kereta'), T('motorcycles', 'motosikal')); },
    (r) => { const x0 = r.int(5, 15), y0 = r.int(3, 12); return S5(T(`In a basketball game a team scored $x$ two-point baskets and $y$ three-point baskets. It scored ${x0 + y0} baskets and ${2 * x0 + 3 * y0} points altogether.`, `Dalam satu perlawanan bola keranjang, sebuah pasukan menjaringkan $x$ jaringan dua mata dan $y$ jaringan tiga mata. Pasukan itu menjaringkan ${x0 + y0} jaringan dan ${2 * x0 + 3 * y0} mata semuanya.`), [1, 1], [2, 3], x0, y0, T('two-point baskets', 'jaringan dua mata'), T('three-point baskets', 'jaringan tiga mata')); },
    (r) => { const fa = r.pick(I.fruits), fb = r.pick(I.fruits.filter((z) => z !== fa)), p = r.int(fa.lo, fa.hi), q = r.int(fb.lo, fb.hi), x0 = r.int(2, 8), y0 = r.int(2, 8); need(p !== q); return S5(T(`A shopper buys $x$ kg of ${fa.en} at RM${p} per kg and $y$ kg of ${fb.en} at RM${q} per kg. The total mass is ${x0 + y0} kg and the total cost is RM${p * x0 + q * y0}.`, `Seorang pembeli membeli $x$ kg ${fa.ms} pada harga RM${p} sekilogram dan $y$ kg ${fb.ms} pada harga RM${q} sekilogram. Jumlah jisim ialah ${x0 + y0} kg dan jumlah kos ialah RM${p * x0 + q * y0}.`), [1, 1], [p, q], x0, y0, T(`kg of ${fa.en}`, `kg ${fa.ms}`), T(`kg of ${fb.en}`, `kg ${fb.ms}`)); },
    (r) => { const x0 = r.int(3, 12), y0 = r.int(2, 10); return S5(T(`A post office sells $x$ stamps of 60 sen and $y$ stamps of 80 sen. It sells ${x0 + y0} stamps for a total of ${60 * x0 + 80 * y0} sen.`, `Sebuah pejabat pos menjual $x$ keping setem 60 sen dan $y$ keping setem 80 sen. Ia menjual ${x0 + y0} keping setem dengan jumlah ${60 * x0 + 80 * y0} sen.`), [1, 1], [60, 80], x0, y0, T('60-sen stamps', 'setem 60 sen'), T('80-sen stamps', 'setem 80 sen')); },
  );
  const e65Var = (r) => {
    const s = r.pick(SC5)(r), v = r.int(0, 1);
    return { q: v === 0 ? T(`${s.st.en} Write down what $x$ and $y$ stand for, then form two equations.`, `${s.st.ms} Tuliskan apa yang diwakili oleh $x$ dan $y$, kemudian bentukkan dua persamaan.`) : T(`${s.st.en} State the meaning of $x$ and of $y$ in this problem.`, `${s.st.ms} Nyatakan maksud $x$ dan $y$ dalam masalah ini.`), a: v === 0 ? T(`$x$: ${s.nx.en}; $y$: ${s.ny.en}; $${eqsOf(s)}$`, `$x$: ${s.nx.ms}; $y$: ${s.ny.ms}; $${eqsOf(s)}$`) : T(`$x$ is the ${s.nx.en}; $y$ is the ${s.ny.en}`, `$x$ ialah ${s.nx.ms}; $y$ ialah ${s.ny.ms}`), w: W(T(`The question itself says that $x$ is the ${s.nx.en} and $y$ is the ${s.ny.en}.`, `Soalan itu sendiri menyatakan bahawa $x$ ialah ${s.nx.ms} dan $y$ ialah ${s.ny.ms}.`), v === 0 ? T(`Each fact in the question then gives one equation: $${eqsOf(s)}$.`, `Setiap fakta dalam soalan kemudiannya memberi satu persamaan: $${eqsOf(s)}$.`) : T('Naming the unknowns clearly is always the first step in a word problem.', 'Menamakan pemboleh ubah dengan jelas sentiasa menjadi langkah pertama dalam masalah berayat.')), sp: 's' };
  };
  ge65.push(e65Var);
  SPM.extend('F1-6.5', { e: ge65, m: gm65, a: ga65 });

  
  /* ================================================================ 6.6 */
  const detS = (s) => s.a1 * s.b2 - s.a2 * s.b1;
  const solS = (s) => ({ x: Fr.make(s.c1 * s.b2 - s.c2 * s.b1, detS(s)), y: Fr.make(s.a1 * s.c2 - s.a2 * s.c1, detS(s)) });
  const ans6 = (s) => { const z = solS(s); return T(`$x = ${tx(z.x)}$, $y = ${tx(z.y)}$`); };
  const key6 = (s) => T(`Eliminating $y$ gives $${detS(s)}x = ${s.c1 * s.b2 - s.c2 * s.b1}$`, `Menyingkirkan $y$ memberi $${detS(s)}x = ${s.c1 * s.b2 - s.c2 * s.b1}$`);
  const chk6 = (s) => { const z = solS(s); return T(`Check: $${eq2(s.a1, s.b1, s.c1).replace('x', `(${tx(z.x)})`).replace('y', `(${tx(z.y)})`)}$ ✓`, ''); };
  const yForm = (a, b) => `y = ${lin(a, b)}`;
  const sub6 = (r, o) => {
    const x0 = r.int(-4, 6), y0 = r.int(-3, 6), a = r.pick([1, 2, 3, -1, -2]), b = r.nz(-5, 5), c = r.nz(-3, 4), d = r.nz(-3, 4), yy = a * x0 + b;
    need(yy >= -6 && yy <= 12 && c + d * a !== 0);
    const e = c * x0 + d * yy;
    return { x0, y0: yy, a, b, c, d, e, tex: `\\begin{cases} ${yForm(a, b)} \\\\ ${eq2(c, d, e)} \\end{cases}`, s: { a1: -a, b1: 1, c1: b, a2: c, b2: d, c2: e } };
  };
  const ans6b = (x0, y0) => T(`$x = ${x0}$, $y = ${y0}$`);
  const e66Sub = (r) => {
    const v = r.int(0, 2), nm = r.name();
    if (v === 0) { const t = sub6(r), k = r.int(1, 2); need(t.d !== 0); return { q: T(`Solve by substitution: $${t.tex}$`, `Selesaikan dengan penggantian: $${t.tex}$`), a: ans6b(t.x0, t.y0), w: W(T(`The first equation already gives $y$, so substitute $y = ${lin(t.a, t.b)}$ into the second: $${poly([[t.c, 'x']])} ${t.d < 0 ? '-' : '+'} ${cn(ab(t.d))}(${lin(t.a, t.b)}) = ${t.e}$`, `Persamaan pertama sudah memberi $y$, maka gantikan $y = ${lin(t.a, t.b)}$ ke dalam persamaan kedua: $${poly([[t.c, 'x']])} ${t.d < 0 ? '-' : '+'} ${cn(ab(t.d))}(${lin(t.a, t.b)}) = ${t.e}$`), T(`Expand and simplify: $${lin(t.c + t.d * t.a, t.d * t.b)} = ${t.e}$`, `Kembang dan permudahkan: $${lin(t.c + t.d * t.a, t.d * t.b)} = ${t.e}$`), T(`$${cn(t.c + t.d * t.a)}x = ${redu(t.e, t.d * t.b)}$, so $x = ${t.x0}$.`, `$${cn(t.c + t.d * t.a)}x = ${redu(t.e, t.d * t.b)}$, maka $x = ${t.x0}$.`), T(`Then $y = ${cn(t.a)}${br(t.x0)} ${sg(t.b)} ${ab(t.b)} = ${t.y0}$.`, `Kemudian $y = ${cn(t.a)}${br(t.x0)} ${sg(t.b)} ${ab(t.b)} = ${t.y0}$.`)), sp: 'm' }; }
    if (v === 1) { const x0 = r.int(1, 8), k = r.int(1, 5), s = x0 + k; return { q: T(`Solve by substitution: $y = x + ${k}$ and $x + y = ${x0 + x0 + k}$.`, `Selesaikan dengan penggantian: $y = x + ${k}$ dan $x + y = ${x0 + x0 + k}$.`), a: ans6b(x0, x0 + k), w: W(T(`Substitute $y = x + ${k}$ into $x + y = ${x0 + x0 + k}$: $x + (x + ${k}) = ${x0 + x0 + k}$`, `Gantikan $y = x + ${k}$ ke dalam $x + y = ${x0 + x0 + k}$: $x + (x + ${k}) = ${x0 + x0 + k}$`), T(`$2x + ${k} = ${x0 + x0 + k}$, so $2x = ${2 * x0}$ and $x = ${x0}$.`, `$2x + ${k} = ${x0 + x0 + k}$, maka $2x = ${2 * x0}$ dan $x = ${x0}$.`), T(`Then $y = ${x0} + ${k} = ${x0 + k}$.`, `Kemudian $y = ${x0} + ${k} = ${x0 + k}$.`)), sp: 'm' }; }
    const y0 = r.int(1, 6), a = r.int(2, 4), b = r.int(0, 4), x0 = a * y0 + b, c = r.int(1, 3);
    return { q: T(`Solve by substitution: $x = ${lin(a, b, 'y')}$ and $${c === 1 ? '' : c}x + y = ${c * x0 + y0}$.`, `Selesaikan dengan penggantian: $x = ${lin(a, b, 'y')}$ dan $${c === 1 ? '' : c}x + y = ${c * x0 + y0}$.`), a: ans6b(x0, y0), w: W(T(`Substitute $x = ${lin(a, b, 'y')}$ into the second equation: $${c === 1 ? '' : c}(${lin(a, b, 'y')}) + y = ${c * x0 + y0}$`, `Gantikan $x = ${lin(a, b, 'y')}$ ke dalam persamaan kedua: $${c === 1 ? '' : c}(${lin(a, b, 'y')}) + y = ${c * x0 + y0}$`), T(`Expand and simplify: $${lin(c * a + 1, c * b, 'y')} = ${c * x0 + y0}$`, `Kembang dan permudahkan: $${lin(c * a + 1, c * b, 'y')} = ${c * x0 + y0}$`), T(`$${cn(c * a + 1)}y = ${redu(c * x0 + y0, c * b)}$, so $y = ${y0}$.`, `$${cn(c * a + 1)}y = ${redu(c * x0 + y0, c * b)}$, maka $y = ${y0}$.`), T(`Then $x = ${a}${br(y0)}${b === 0 ? '' : ` + ${b}`} = ${x0}$.`, `Kemudian $x = ${a}${br(y0)}${b === 0 ? '' : ` + ${b}`} = ${x0}$.`)), sp: 'm' };
  };
  const e66Elim = (r) => {
    const v = r.int(0, 3), x0 = r.int(1, 7), y0 = r.int(1, 7), a = r.int(1, 4), b = r.int(1, 4), c = r.int(1, 4);
    let s, how;
    if (v === 0) { s = mkS(a, b, x0, y0, c, -b); how = T('add the equations to eliminate $y$', 'tambah kedua-dua persamaan untuk menyingkirkan $y$'); }
    else if (v === 1) { need(b !== c); s = mkS(a, b, x0, y0, a, c); how = T('subtract the equations to eliminate $x$', 'tolak kedua-dua persamaan untuk menyingkirkan $x$'); }
    else if (v === 2) { need(a !== c); s = mkS(a, b, x0, y0, -a, c); how = T('add the equations to eliminate $x$', 'tambah kedua-dua persamaan untuk menyingkirkan $x$'); }
    else { need(a !== c); s = mkS(a, b, x0, y0, c, b); how = T('subtract the equations to eliminate $y$', 'tolak kedua-dua persamaan untuk menyingkirkan $y$'); }
    need(detS(s) !== 0);
    const q3 = r.int(0, 1);
    return { q: q3 === 0 ? T(`Solve by elimination: $${sy(s)}$`, `Selesaikan dengan penyingkiran: $${sy(s)}$`) : T(`Solve $${sy(s)}$. Hint: ${how.en}.`, `Selesaikan $${sy(s)}$. Petunjuk: ${how.ms}.`), a: ans6b(x0, y0), w: W(cat(T('Method: ', 'Kaedah: '), how, T('.', '.')), ...sysW(s)), sp: 'm' };
  };
  const e66Steps = (r) => {
    const x0 = r.int(1, 7), y0 = r.int(1, 7), b = r.int(1, 4), a = r.int(1, 4);
    const s = mkS(1, b, x0, y0, 1, -b), v = r.int(0, 1);
    if (v === 0) return { q: T(`Complete the working. $x + ${b}y = ${s.c1}$ (1), $x - ${b}y = ${s.c2}$ (2). (1) + (2): $\\square x = \\square$, so $x = \\square$. Substitute into (1): $y = \\square$.`, `Lengkapkan langkah kerja. $x + ${b}y = ${s.c1}$ (1), $x - ${b}y = ${s.c2}$ (2). (1) + (2): $\\square x = \\square$, maka $x = \\square$. Gantikan ke dalam (1): $y = \\square$.`), a: T(`$2x = ${s.c1 + s.c2}$; $x = ${x0}$; $y = ${y0}$`), w: W(T(`Adding (1) and (2) cancels the $${b}y$ terms: $2x = ${s.c1} + ${s.c2} = ${s.c1 + s.c2}$.`, `Menambah (1) dan (2) menghapuskan sebutan $${b}y$: $2x = ${s.c1} + ${s.c2} = ${s.c1 + s.c2}$.`), T(`$x = ${x0}$`), T(`Substitute into (1): $${x0} + ${b}y = ${s.c1}$, so $${b}y = ${s.c1 - x0}$ and $y = ${y0}$.`, `Gantikan ke dalam (1): $${x0} + ${b}y = ${s.c1}$, maka $${b}y = ${s.c1 - x0}$ dan $y = ${y0}$.`)), sp: 's' };
    const t = mkS(a, 1, x0, y0, a, -1); need(a !== 0);
    return { q: T(`Complete: $${a}x + y = ${t.c1}$ (1), $${a}x - y = ${t.c2}$ (2). (1) + (2) gives $\\square x = \\square$, so $x = \\square$. Then from (1), $y = \\square$.`, `Lengkapkan: $${a}x + y = ${t.c1}$ (1), $${a}x - y = ${t.c2}$ (2). (1) + (2) memberi $\\square x = \\square$, maka $x = \\square$. Kemudian daripada (1), $y = \\square$.`), a: T(`$${2 * a}x = ${t.c1 + t.c2}$; $x = ${x0}$; $y = ${y0}$`), w: W(T(`Adding (1) and (2) cancels the $y$ terms: $${2 * a}x = ${t.c1} + ${t.c2} = ${t.c1 + t.c2}$.`, `Menambah (1) dan (2) menghapuskan sebutan $y$: $${2 * a}x = ${t.c1} + ${t.c2} = ${t.c1 + t.c2}$.`), T(`$x = ${x0}$`), T(`From (1): $${cn(a)}${br(x0)} + y = ${t.c1}$, so $y = ${y0}$.`, `Daripada (1): $${cn(a)}${br(x0)} + y = ${t.c1}$, maka $y = ${y0}$.`)), sp: 's' };
  };
  const e66Graph = (r) => {
    const s = sysR(r, { lo: -3, hi: 3, R: 2 });
    need(s.b1 !== 0 && s.b2 !== 0 && ab(s.c1 / s.b1) <= 5 && ab(s.c2 / s.b2) <= 5);
    const fig = gfig([lnOf(s.a1, s.b1, s.c1, 'l₁'), lnOf(s.a2, s.b2, s.c2, 'l₂')], [{ x: s.x0, y: s.y0, l: '' }]), v = r.int(0, 1);
    return { q: v === 0 ? T(`Solve the simultaneous equations $${sy(s)}$ graphically, using the lines drawn.`, `Selesaikan persamaan serentak $${sy(s)}$ secara graf dengan menggunakan garis yang dilukis.`) : T(`The graph shows $${eq2(s.a1, s.b1, s.c1)}$ and $${eq2(s.a2, s.b2, s.c2)}$. Read the point of intersection to solve the equations and verify the reading in the first equation.`, `Graf menunjukkan $${eq2(s.a1, s.b1, s.c1)}$ dan $${eq2(s.a2, s.b2, s.c2)}$. Baca titik persilangan untuk menyelesaikan persamaan itu dan sahkan bacaan dalam persamaan pertama.`), fig, a: v === 0 ? ans6b(s.x0, s.y0) : T(`$x = ${s.x0}$, $y = ${s.y0}$; $${s.a1}(${s.x0}) + (${s.b1})(${s.y0}) = ${s.c1}$`), w: W(T('Solving graphically means reading off the point where the two lines cross.', 'Menyelesaikan secara graf bermaksud membaca titik persilangan kedua-dua garis.'), T(`The lines meet at $${ptS(s.x0, s.y0)}$, so $x = ${s.x0}$ and $y = ${s.y0}$.`, `Garis-garis itu bertemu di $${ptS(s.x0, s.y0)}$, maka $x = ${s.x0}$ dan $y = ${s.y0}$.`), T(`Check in the first equation: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$`, `Semak dalam persamaan pertama: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$`)), sp: 's' };
  };
  const e66Second = (r) => {
    const s = sysR(r, { lo: 1, hi: 8, R: 3, pos: true }), v = r.int(0, 1);
    return { q: v === 0 ? T(`Given that $x = ${s.x0}$ in the simultaneous equations $${sy(s)}$, substitute it into the first equation to find $y$.`, `Diberi $x = ${s.x0}$ dalam persamaan serentak $${sy(s)}$, gantikannya ke dalam persamaan pertama untuk mencari $y$.`) : T(`In the equations $${sy(s)}$ the value of $y$ is ${s.y0}. Use the second equation to find $x$, then check it in the first equation.`, `Dalam persamaan $${sy(s)}$ nilai $y$ ialah ${s.y0}. Gunakan persamaan kedua untuk mencari $x$, kemudian semak dalam persamaan pertama.`), a: v === 0 ? T(`$y = ${s.y0}$`) : T(`$x = ${s.x0}$`), w: v === 0 ? W(T(`Substitute $x = ${s.x0}$ into $${eq2(s.a1, s.b1, s.c1)}$: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}y = ${s.c1}$`, `Gantikan $x = ${s.x0}$ ke dalam $${eq2(s.a1, s.b1, s.c1)}$: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}y = ${s.c1}$`), T(`$${cn(s.b1)}y = ${redu(s.c1, s.a1 * s.x0)}$, so $y = ${s.y0}$.`, `$${cn(s.b1)}y = ${redu(s.c1, s.a1 * s.x0)}$, maka $y = ${s.y0}$.`)) : W(T(`Substitute $y = ${s.y0}$ into $${eq2(s.a2, s.b2, s.c2)}$: $${cn(s.a2)}x ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$`, `Gantikan $y = ${s.y0}$ ke dalam $${eq2(s.a2, s.b2, s.c2)}$: $${cn(s.a2)}x ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$`), T(`$${cn(s.a2)}x = ${redu(s.c2, s.b2 * s.y0)}$, so $x = ${s.x0}$.`, `$${cn(s.a2)}x = ${redu(s.c2, s.b2 * s.y0)}$, maka $x = ${s.x0}$.`), T(`Check in the first equation: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$`, `Semak dalam persamaan pertama: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$`)), sp: 's' };
  };
  const e66Which = (r) => {
    const s = r.int(0, 2), a = r.int(2, 5), b = r.int(1, 6), x0 = r.int(1, 5), y0 = r.int(1, 5);
    const sys = [
      [`\\begin{cases} y = ${lin(a, b)} \\\\ ${eq2(1, 1, x0 + a * x0 + b)} \\end{cases}`, T('substitution', 'penggantian'), T('$y$ is already the subject of the first equation', '$y$ sudah menjadi perkara dalam persamaan pertama')],
      [`\\begin{cases} ${eq2(a, 1, a * x0 + y0)} \\\\ ${eq2(a, -1, a * x0 - y0)} \\end{cases}`, T('elimination (add)', 'penyingkiran (tambah)'), T('the coefficients of $y$ are opposite', 'pekali $y$ ialah songsang')],
      [`\\begin{cases} ${eq2(2, b, 2 * x0 + b * y0)} \\\\ ${eq2(2, -a, 2 * x0 - a * y0)} \\end{cases}`, T('elimination (subtract)', 'penyingkiran (tolak)'), T('the coefficients of $x$ are equal', 'pekali $x$ sama')],
    ][s];
    need(a !== b);
    const opts3 = [T('substitution', 'penggantian'), T('elimination (add)', 'penyingkiran (tambah)'), T('elimination (subtract)', 'penyingkiran (tolak)')];
    const o = optsT(r, sys[1], opts3.filter((z) => z.en !== sys[1].en).concat([T('guess and check only', 'cuba jaya sahaja')]));
    return { q: T(`Which method is the quickest way to start solving $${sys[0]}$?<br>${o.list.en}`, `Kaedah yang manakah paling cepat untuk mula menyelesaikan $${sys[0]}$?<br>${o.list.ms}`), a: T(`(${o.key}) ${sys[1].en}: ${sys[2].en}`, `(${o.key}) ${sys[1].ms}: ${sys[2].ms}`), w: W(T('Look at the form of the two equations before choosing a method.', 'Lihat bentuk kedua-dua persamaan sebelum memilih kaedah.'), cat(T(`Here ${sys[1].en} is quickest because `, `Di sini ${sys[1].ms} paling cepat kerana `), sys[2], T('.', '.')), T(`So the answer is (${o.key}).`, `Maka jawapannya ialah (${o.key}).`)), sp: 's' };
  };
  const ge66 = [e66Sub, e66Elim, e66Steps, e66Graph, e66Second, e66Which];

    const m66Elim = (r) => {
    const v = r.int(0, 2), s = sysR(r, { lo: -4, hi: 6, R: 4 }), k = r.pick([2, 3, -2, -3]);
    if (v === 0) { const t = mkS(s.a1, s.b1, s.x0, s.y0, s.a1 * k, s.b2); need(detS(t) !== 0 && ab(t.b2) <= 6 && s.b1 !== 0 && s.a1 * k * 1 !== 0 && ab(s.a1 * k) <= 10 && t.b2 !== s.b1 * k); return { q: T(`Solve by elimination: $${sy(t)}$`, `Selesaikan dengan penyingkiran: $${sy(t)}$`), a: ans6b(s.x0, s.y0), w: W(...sysW(t)), sp: 'l' }; }
    if (v === 1) { const t = mkS(s.a1, s.b1, s.x0, s.y0, s.a2, s.b1 * k); need(detS(t) !== 0 && ab(s.b1 * k) <= 12); return { q: T(`Multiply one equation by a suitable number, then eliminate a variable: $${sy(t)}$`, `Darabkan satu persamaan dengan nombor yang sesuai, kemudian singkirkan satu pemboleh ubah: $${sy(t)}$`), a: ans6b(s.x0, s.y0), w: W(...sysW(t)), sp: 'l' }; }
    need(detS(s) !== 0 && s.x0 !== 0);
    return { q: T(`Solve the simultaneous equations $${sy(s)}$ and verify your answer in both equations.`, `Selesaikan persamaan serentak $${sy(s)}$ dan sahkan jawapan anda dalam kedua-dua persamaan.`), a: T(`$x = ${s.x0}$, $y = ${s.y0}$; ${s.a1}(${s.x0}) + (${s.b1})(${s.y0}) = ${s.c1}, ${s.a2}(${s.x0}) + (${s.b2})(${s.y0}) = ${s.c2}`), w: W(...sysW(s)), sp: 'l' };
  };
  const m66Sub = (r) => {
    const s = sysR(r, { lo: -3, hi: 6, R: 3 }), v = r.int(0, 1);
    need(ab(s.a1) === 1 || ab(s.b1) === 1);
    const solvY = ab(s.b1) === 1;
    const t = solvY ? `y = ${poly([[-s.a1 / s.b1, 'x'], [s.c1 / s.b1, '']])}` : `x = ${poly([[-s.b1 / s.a1, 'y'], [s.c1 / s.a1, '']])}`;
    const mm = solvY ? -s.a1 / s.b1 : -s.b1 / s.a1, nn = solvY ? s.c1 / s.b1 : s.c1 / s.a1;
    const wSub = solvY
      ? W(T(`Make $y$ the subject of the first equation: $${t}$`, `Jadikan $y$ perkara rumus bagi persamaan pertama: $${t}$`),
        T(`Substitute into the second equation: $${poly([[s.a2, 'x']])} ${s.b2 < 0 ? '-' : '+'} ${cn(ab(s.b2))}(${poly([[mm, 'x'], [nn, '']])}) = ${s.c2}$`, `Gantikan ke dalam persamaan kedua: $${poly([[s.a2, 'x']])} ${s.b2 < 0 ? '-' : '+'} ${cn(ab(s.b2))}(${poly([[mm, 'x'], [nn, '']])}) = ${s.c2}$`),
        T(`Expand and simplify: $${lin(s.a2 + s.b2 * mm, s.b2 * nn)} = ${s.c2}$`, `Kembang dan permudahkan: $${lin(s.a2 + s.b2 * mm, s.b2 * nn)} = ${s.c2}$`),
        T(`$${cn(s.a2 + s.b2 * mm)}x = ${redu(s.c2, s.b2 * nn)}$, so $x = ${s.x0}$.`, `$${cn(s.a2 + s.b2 * mm)}x = ${redu(s.c2, s.b2 * nn)}$, maka $x = ${s.x0}$.`),
        T(`Then $y = ${cn(mm)}${br(s.x0)}${nn === 0 ? '' : ` ${sg(nn)} ${ab(nn)}`} = ${s.y0}$.`, `Kemudian $y = ${cn(mm)}${br(s.x0)}${nn === 0 ? '' : ` ${sg(nn)} ${ab(nn)}`} = ${s.y0}$.`))
      : W(T(`Make $x$ the subject of the first equation: $${t}$`, `Jadikan $x$ perkara rumus bagi persamaan pertama: $${t}$`),
        T(`Substitute into the second equation: $${cn(s.a2)}(${poly([[mm, 'y'], [nn, '']])}) ${s.b2 < 0 ? '-' : '+'} ${cn(ab(s.b2))}y = ${s.c2}$`, `Gantikan ke dalam persamaan kedua: $${cn(s.a2)}(${poly([[mm, 'y'], [nn, '']])}) ${s.b2 < 0 ? '-' : '+'} ${cn(ab(s.b2))}y = ${s.c2}$`),
        T(`Expand and simplify: $${poly([[s.a2 * mm + s.b2, 'y'], [s.a2 * nn, '']])} = ${s.c2}$`, `Kembang dan permudahkan: $${poly([[s.a2 * mm + s.b2, 'y'], [s.a2 * nn, '']])} = ${s.c2}$`),
        T(`$${cn(s.a2 * mm + s.b2)}y = ${redu(s.c2, s.a2 * nn)}$, so $y = ${s.y0}$.`, `$${cn(s.a2 * mm + s.b2)}y = ${redu(s.c2, s.a2 * nn)}$, maka $y = ${s.y0}$.`),
        T(`Then $x = ${cn(mm)}${br(s.y0)}${nn === 0 ? '' : ` ${sg(nn)} ${ab(nn)}`} = ${s.x0}$.`, `Kemudian $x = ${cn(mm)}${br(s.y0)}${nn === 0 ? '' : ` ${sg(nn)} ${ab(nn)}`} = ${s.x0}$.`));
    return { q: v === 0 ? T(`Rearrange the first equation of $${sy(s)}$ to make ${solvY ? '$y$' : '$x$'} the subject, then solve by substitution.`, `Susun semula persamaan pertama bagi $${sy(s)}$ untuk menjadikan ${solvY ? '$y$' : '$x$'} sebagai perkara, kemudian selesaikan dengan penggantian.`) : T(`Solve $${sy(s)}$ by substitution. (First write ${solvY ? '$y$' : '$x$'} in terms of the other variable using the first equation.)`, `Selesaikan $${sy(s)}$ dengan penggantian. (Tulis ${solvY ? '$y$' : '$x$'} dalam sebutan pemboleh ubah yang satu lagi dengan menggunakan persamaan pertama.)`), a: T(`$${t}$; $x = ${s.x0}$, $y = ${s.y0}$`), w: wSub, sp: 'l' };
  };
  const m66Err = (r) => {
    const s = sysR(r, { lo: 1, hi: 6, R: 3, pos: true }), nm = r.name(), v = r.int(0, 1);
    need(s.a1 !== s.a2 && s.b1 !== s.b2 && ab(s.a1) !== ab(s.a2));
    if (v === 0) {
      const wrongC = s.c1 + s.c2, wrongX = Fr.make(wrongC, s.a1 + s.a2), same = s.b1 === -s.b2;
      need(s.b1 !== s.b2);
      const t = mkS(s.a1, s.b1, s.x0, s.y0, s.a2, s.b2);
      return { q: T(`${nm} adds the equations of $${sy(t)}$ to eliminate $y$ and gets $${t.a1 + t.a2}x = ${t.c1 + t.c2}$. Explain the mistake and solve the equations correctly.`, `${nm} menambah persamaan bagi $${sy(t)}$ untuk menyingkirkan $y$ dan mendapat $${t.a1 + t.a2}x = ${t.c1 + t.c2}$. Terangkan kesilapan itu dan selesaikan persamaan dengan betul.`), a: T(`Adding does not remove $y$ because its coefficients (${t.b1} and ${t.b2}) are not opposite. Multiply first: the solution is $x = ${s.x0}$, $y = ${s.y0}$.`, `Menambah tidak menyingkirkan $y$ kerana pekalinya (${t.b1} dan ${t.b2}) bukan songsang. Darab dahulu: penyelesaiannya ialah $x = ${s.x0}$, $y = ${s.y0}$.`), w: W(T(`Adding removes $y$ only when the coefficients of $y$ add up to $0$. Here they are $${t.b1}$ and $${t.b2}$, and $${t.b1} + ${t.b2} = ${t.b1 + t.b2}$, which is not $0$.`, `Menambah menyingkirkan $y$ hanya apabila pekali $y$ berjumlah $0$. Di sini pekalinya $${t.b1}$ dan $${t.b2}$, dan $${t.b1} + ${t.b2} = ${t.b1 + t.b2}$, yang bukan $0$.`), T('Multiply the equations first so that the $y$ terms match.', 'Darabkan persamaan dahulu supaya sebutan $y$ sepadan.'), ...sysW(t)), sp: 'l' };
    }
    const b = s.b1, t = mkS(s.a1, b, s.x0, s.y0, s.a2, s.b2);
    return { q: T(`${nm} solves $${sy(t)}$ and finds $x = ${t.x0 + 1}$, $y = ${t.y0}$. Check ${nm}'s answer in both equations and state whether it is correct.`, `${nm} menyelesaikan $${sy(t)}$ dan mendapat $x = ${t.x0 + 1}$, $y = ${t.y0}$. Semak jawapan ${nm} dalam kedua-dua persamaan dan nyatakan sama ada ia betul.`), a: T(`Equation 1 gives ${t.a1 * (t.x0 + 1) + t.b1 * t.y0} (needs ${t.c1}); equation 2 gives ${t.a2 * (t.x0 + 1) + t.b2 * t.y0} (needs ${t.c2}). So it is wrong. The solution is $x = ${t.x0}$, $y = ${t.y0}$.`, `Persamaan 1 memberi ${t.a1 * (t.x0 + 1) + t.b1 * t.y0} (perlu ${t.c1}); persamaan 2 memberi ${t.a2 * (t.x0 + 1) + t.b2 * t.y0} (perlu ${t.c2}). Maka ia salah. Penyelesaiannya ialah $x = ${t.x0}$, $y = ${t.y0}$.`), w: W(T(`Equation 1: $${cn(t.a1)}${br(t.x0 + 1)} ${sg(t.b1)} ${cn(ab(t.b1))}${br(t.y0)} = ${t.a1 * (t.x0 + 1) + t.b1 * t.y0}$, but it needs $${t.c1}$.`, `Persamaan 1: $${cn(t.a1)}${br(t.x0 + 1)} ${sg(t.b1)} ${cn(ab(t.b1))}${br(t.y0)} = ${t.a1 * (t.x0 + 1) + t.b1 * t.y0}$, tetapi ia memerlukan $${t.c1}$.`), T(`Equation 2: $${cn(t.a2)}${br(t.x0 + 1)} ${sg(t.b2)} ${cn(ab(t.b2))}${br(t.y0)} = ${t.a2 * (t.x0 + 1) + t.b2 * t.y0}$, but it needs $${t.c2}$.`, `Persamaan 2: $${cn(t.a2)}${br(t.x0 + 1)} ${sg(t.b2)} ${cn(ab(t.b2))}${br(t.y0)} = ${t.a2 * (t.x0 + 1) + t.b2 * t.y0}$, tetapi ia memerlukan $${t.c2}$.`), T('The pair fails both equations, so the answer is wrong.', 'Pasangan itu gagal dalam kedua-dua persamaan, maka jawapan itu salah.'), ...sysW(t)), sp: 'm' };
  };
  const m66Graph = (r) => {
    const x0 = r.int(-3, 2) + 0.5, y0 = r.int(-3, 3), a1 = r.pick([2, 4]), b1 = r.pick([1, -1]), a2 = r.pick([-2, 2]), b2 = 1;
    const s = { a1, b1, c1: a1 * x0 + b1 * y0, a2, b2, c2: a2 * x0 + b2 * y0 };
    need(Number.isInteger(s.c1) && Number.isInteger(s.c2) && detS(s) !== 0 && ab(s.c1 / b1) <= 6 && ab(s.c2) <= 6);
    const fig = gfig([lnOf(s.a1, s.b1, s.c1, 'l₁'), lnOf(s.a2, s.b2, s.c2, 'l₂')], [{ x: x0, y: y0, l: '' }]);
    const z = solS(s);
    return { q: T(`The graph shows the lines $${eq2(s.a1, s.b1, s.c1)}$ and $${eq2(s.a2, s.b2, s.c2)}$. (a) Estimate the solution from the graph, to the nearest 0.5. (b) Solve the equations algebraically and compare.`, `Graf menunjukkan garis $${eq2(s.a1, s.b1, s.c1)}$ dan $${eq2(s.a2, s.b2, s.c2)}$. (a) Anggarkan penyelesaian daripada graf, kepada 0.5 yang terdekat. (b) Selesaikan persamaan itu secara algebra dan bandingkan.`), fig, a: T(`(a) about $(${n(x0)}, ${y0})$ (b) $x = ${tx(z.x)}$, $y = ${tx(z.y)}$, which agrees`, `(a) kira-kira $(${n(x0)}, ${y0})$ (b) $x = ${tx(z.x)}$, $y = ${tx(z.y)}$, yang sepadan`), w: W(T(`(a) The lines cross about half a square to one side, at roughly $(${n(x0)}, ${y0})$.`, `(a) Garis-garis itu bersilang kira-kira setengah petak ke tepi, lebih kurang pada $(${n(x0)}, ${y0})$.`), ...pfx('(b) ', sysW(s)), T('The exact answer agrees with the estimate read from the graph.', 'Jawapan tepat itu sepadan dengan anggaran yang dibaca daripada graf.')), sp: 'm' };
  };
  const m66Method = (r) => {
    const s = sysR(r, { lo: -3, hi: 6, R: 3 });
    need(detS(s) !== 0 && s.x0 !== 0 && s.y0 !== 0);
    const easy = (ab(s.b1) === ab(s.b2)) || (ab(s.a1) === ab(s.a2));
    return { q: T(`Choose a method (graph, substitution or elimination) to solve $${sy(s)}$. Write the method you chose and the solution.`, `Pilih satu kaedah (graf, penggantian atau penyingkiran) untuk menyelesaikan $${sy(s)}$. Tulis kaedah yang anda pilih dan penyelesaiannya.`), a: T(`Any correct method: $x = ${s.x0}$, $y = ${s.y0}$`, `Mana-mana kaedah yang betul: $x = ${s.x0}$, $y = ${s.y0}$`), w: W(...sysW(s)), sp: 'l' };
  };
  const gm66 = [m66Elim, m66Sub, m66Err, m66Graph, m66Method];

    const sysF = (r, o) => retry(() => {
    o = o || {};
    const a1 = r.nz(-5, 5), b1 = r.nz(-5, 5), a2 = r.nz(-5, 5), b2 = r.nz(-5, 5), c1 = r.int(-9, 12), c2 = r.int(-9, 12), s = { a1, b1, c1, a2, b2, c2 };
    need(detS(s) !== 0);
    const z = solS(s);
    need(z.x.d > 1 !== false && (z.x.d > 1 || z.y.d > 1) && z.x.d <= 12 && z.y.d <= 12 && ab(z.x.n) <= 30 && ab(z.y.n) <= 30);
    if (o.both) need(z.x.d > 1 && z.y.d > 1);
    return s;
  });
  const a66Both = (r) => {
    const s = sysR(r, { lo: -4, hi: 6, R: 5 });
    need(ab(s.a1) !== ab(s.a2) && ab(s.b1) !== ab(s.b2) && detS(s) !== 0);
    const v = r.int(0, 1);
    return { q: v === 0 ? T(`Solve the simultaneous equations $${sy(s)}$ and check your answer in both equations.`, `Selesaikan persamaan serentak $${sy(s)}$ dan semak jawapan anda dalam kedua-dua persamaan.`) : T(`Solve $${sy(s)}$ by multiplying both equations so that one variable has the same coefficient in each. Show every step.`, `Selesaikan $${sy(s)}$ dengan mendarabkan kedua-dua persamaan supaya satu pemboleh ubah mempunyai pekali yang sama dalam setiap persamaan. Tunjukkan setiap langkah.`), a: ans6(s), w: W(...sysW(s)), sp: 'xl' };
  };
  const a66Frac = (r) => {
    const s = sysF(r), v = r.int(0, 1);
    return { q: v === 0 ? T(`Solve $${sy(s)}$. Give fractional answers in their simplest form.`, `Selesaikan $${sy(s)}$. Berikan jawapan pecahan dalam bentuk termudah.`) : T(`Solve the simultaneous equations $${sy(s)}$ and verify that your answer satisfies the first equation.`, `Selesaikan persamaan serentak $${sy(s)}$ dan sahkan bahawa jawapan anda memenuhi persamaan pertama.`), a: ans6(s), w: W(...sysW(s)), sp: 'xl' };
  };
  const a66Coef = (r) => {
    const a = r.int(2, 4), b = r.int(2, 5), x0 = a * r.nz(-3, 4), y0 = b * r.nz(-3, 4), p = r.nz(-3, 3), q = r.nz(-3, 3);
    need(a !== b && p * b !== -q * a * 0 && Fr.eq(Fr.make(1, a), Fr.make(1, a)));
    const c1 = x0 / a + y0 / b, c2 = p * x0 + q * y0, tex = `\\begin{cases} \\dfrac{x}{${a}} + \\dfrac{y}{${b}} = ${c1} \\\\ ${eq2(p, q, c2)} \\end{cases}`;
    const s = { a1: b, b1: a, c1: a * b * c1, a2: p, b2: q, c2 };
    need(detS(s) !== 0);
    const z = solS(s);
    return { q: T(`Solve $${tex}$. (Clear the fractions in the first equation first.)`, `Selesaikan $${tex}$. (Hapuskan pecahan dalam persamaan pertama dahulu.)`), a: T(`$x = ${tx(z.x)}$, $y = ${tx(z.y)}$`), w: W(T(`Multiply the first equation by $${a * b}$ to clear the fractions: $${eq2(b, a, a * b * c1)}$`, `Darabkan persamaan pertama dengan $${a * b}$ untuk menghapuskan pecahan: $${eq2(b, a, a * b * c1)}$`), ...sysW(s)), sp: 'xl' };
  };
  const a66NoSol = (r) => {
    const kd = r.pick(['none', 'inf']), s = mkK(r, kd), k = s.a2 / s.a1;
    need(Number.isInteger(k) && k !== 1 && ab(k) <= 3);
    return { q: T(`Try to solve $${sy(s)}$ by elimination. What happens, and what does it tell you about the solutions?`, `Cuba selesaikan $${sy(s)}$ dengan penyingkiran. Apakah yang berlaku, dan apakah yang ditunjukkan tentang penyelesaiannya?`), a: kd === 'none' ? T(`Multiplying equation 1 by ${k} and subtracting gives $0 = ${s.c2 - k * s.c1}$, which is impossible: there is no solution (parallel lines).`, `Mendarab persamaan 1 dengan ${k} dan menolak memberi $0 = ${s.c2 - k * s.c1}$, yang mustahil: tiada penyelesaian (garis selari).`) : T(`Multiplying equation 1 by ${k} gives equation 2 exactly, so subtracting gives $0 = 0$: infinitely many solutions (the lines coincide).`, `Mendarab persamaan 1 dengan ${k} memberi persamaan 2 dengan tepat, maka menolak memberi $0 = 0$: penyelesaian yang tidak terhingga banyaknya (garis berhimpit).`), w: W(T(`Multiply equation 1 by $${k}$: $${eq2(s.a1 * k, s.b1 * k, s.c1 * k)}$.`, `Darabkan persamaan 1 dengan $${k}$: $${eq2(s.a1 * k, s.b1 * k, s.c1 * k)}$.`), T(`Subtract equation 2: the $x$ terms and the $y$ terms both cancel, leaving $0 = ${s.c2 - k * s.c1}$.`, `Tolak persamaan 2: sebutan $x$ dan sebutan $y$ kedua-duanya terhapus, meninggalkan $0 = ${s.c2 - k * s.c1}$.`), kd === 'none' ? T('This statement is false, so no pair $(x, y)$ can satisfy both equations: the lines are parallel and there is no solution.', 'Pernyataan ini palsu, maka tiada pasangan $(x, y)$ boleh memenuhi kedua-dua persamaan: garis selari dan tiada penyelesaian.') : T('This statement is always true, so every point of the line satisfies both equations: there are infinitely many solutions.', 'Pernyataan ini sentiasa benar, maka setiap titik pada garis memenuhi kedua-dua persamaan: terdapat penyelesaian yang tidak terhingga banyaknya.')), sp: 'm' };
  };
  const a66Expr = (r) => {
    const s = sysR(r, { lo: -3, hi: 6, R: 3 }), m = r.int(2, 4), c = r.int(1, 4), v = r.int(0, 1);
    need(detS(s) !== 0);
    const val = v === 0 ? m * s.x0 - c * s.y0 : s.x0 * s.y0;
    return { q: v === 0 ? T(`Solve $${sy(s)}$ and hence find the value of $${poly([[m, 'x'], [-c, 'y']])}$.`, `Selesaikan $${sy(s)}$ dan seterusnya cari nilai $${poly([[m, 'x'], [-c, 'y']])}$.`) : T(`Solve $${sy(s)}$ and find the product $xy$.`, `Selesaikan $${sy(s)}$ dan cari hasil darab $xy$.`), a: T(`$x = ${s.x0}$, $y = ${s.y0}$; $${val}$`), w: W(...sysW(s)), sp: 'l' };
  };
  const a66Choose = (r) => {
    const s1 = mkS(1, r.int(1, 3), 3, 2, 1, -r.int(1, 3)), a = r.int(2, 4), s2 = sysR(r, { lo: 1, hi: 6, R: 3, pos: true });
    need(detS(s1) !== 0 && detS(s2) !== 0 && s1.b1 !== -s1.b2);
    const y1 = r.int(1, 6), x1 = r.int(1, 6), t1 = mkS(1, a, x1, y1, 1, -a), t2 = { a1: 0, b1: 0 };
    const p2 = sub6(r);
    need(p2.d !== 0);
    return { q: withQ(T('For each pair of equations, state the most efficient method (substitution or elimination) with a reason, and then solve.', 'Bagi setiap pasangan persamaan, nyatakan kaedah yang paling cekap (penggantian atau penyingkiran) beserta sebab, dan kemudian selesaikan.'), SPM.parts([T(`$${sy(t1)}$`), T(`$${p2.tex}$`)])), a: SPM.parts([T(`Elimination: the coefficients of $x$ are equal (subtract). $x = ${x1}$, $y = ${y1}$`, `Penyingkiran: pekali $x$ sama (tolak). $x = ${x1}$, $y = ${y1}$`), T(`Substitution: $y$ is already given in terms of $x$. $x = ${p2.x0}$, $y = ${p2.y0}$`, `Penggantian: $y$ sudah diberi dalam sebutan $x$. $x = ${p2.x0}$, $y = ${p2.y0}$`)]), w: W(T('(a) The coefficients of $x$ are equal, so subtracting the equations removes $x$ in one step: elimination.', '(a) Pekali $x$ adalah sama, maka menolak persamaan menyingkirkan $x$ dalam satu langkah: penyingkiran.'), ...sysW(t1), T('(b) The first equation already gives $y$ in terms of $x$, so substitution is quicker.', '(b) Persamaan pertama sudah memberi $y$ dalam sebutan $x$, maka penggantian lebih cepat.'), T(`Substituting $y = ${lin(p2.a, p2.b)}$ into the second equation gives $x = ${p2.x0}$, and then $y = ${p2.y0}$.`, `Menggantikan $y = ${lin(p2.a, p2.b)}$ ke dalam persamaan kedua memberi $x = ${p2.x0}$, dan kemudian $y = ${p2.y0}$.`)), sp: 'xl' };
  };
  const a66Err = (r) => {
    const x0 = r.int(1, 6), y0 = r.int(1, 6), a = r.int(2, 4), b = r.int(2, 3), c = r.int(1, 3), nm = r.name();
    const s = mkS(a, b, x0, y0, c, -1);
    need(a !== c * b && s.c1 > 0);
    const m = s.b1, wrongC = s.c1 - s.c2 * 1;
    return { q: T(`${nm} solves $${sy(s)}$: "Multiply the second equation by ${b}: $${c * b}x - ${b}y = ${s.c2}$. Add the equations: $${a + c * b}x = ${s.c1 + s.c2}$." Find the mistake and give the correct solution.`, `${nm} menyelesaikan $${sy(s)}$: "Darabkan persamaan kedua dengan ${b}: $${c * b}x - ${b}y = ${s.c2}$. Tambah persamaan: $${a + c * b}x = ${s.c1 + s.c2}$." Cari kesilapan itu dan berikan penyelesaian yang betul.`), a: T(`The constant ${s.c2} was not multiplied by ${b}; it should be ${b * s.c2}. Correct: $${a + c * b}x = ${s.c1 + b * s.c2}$, so $x = ${x0}$, $y = ${y0}$.`, `Pemalar ${s.c2} tidak didarab dengan ${b}; sepatutnya ${b * s.c2}. Betul: $${a + c * b}x = ${s.c1 + b * s.c2}$, maka $x = ${x0}$, $y = ${y0}$.`), w: W(T(`When an equation is multiplied by $${b}$, every term must be multiplied, including the constant: $${c * b}x - ${b}y = ${b * s.c2}$.`, `Apabila satu persamaan didarab dengan $${b}$, setiap sebutan mesti didarab, termasuk pemalarnya: $${c * b}x - ${b}y = ${b * s.c2}$.`), T(`Add it to $${eq2(a, b, s.c1)}$: $${a + c * b}x = ${dif(s.c1, -b * s.c2)} = ${s.c1 + b * s.c2}$.`, `Tambahkannya kepada $${eq2(a, b, s.c1)}$: $${a + c * b}x = ${dif(s.c1, -b * s.c2)} = ${s.c1 + b * s.c2}$.`), T(`$x = ${x0}$`), T(`From the second equation: $${cn(c)}${br(x0)} - y = ${s.c2}$, so $y = ${y0}$.`, `Daripada persamaan kedua: $${cn(c)}${br(x0)} - y = ${s.c2}$, maka $y = ${y0}$.`)), sp: 'l' };
  };
  const a66Param = (r) => {
    const s = sysR(r, { lo: -2, hi: 5, R: 3 });
    need(detS(s) !== 0 && s.a1 !== 0 && s.x0 !== 0 && s.y0 !== 0);
    return { q: T(`The solution of $\\begin{cases} ax + ${s.b1 > 0 ? '' : '('}${s.b1}${s.b1 > 0 ? '' : ')'}y = ${s.c1} \\\\ ${eq2(s.a2, s.b2, 'b')} \\end{cases}$ is $x = ${s.x0}$, $y = ${s.y0}$. Find the values of $a$ and $b$.`.replace(/\+ \(-(\d+)\)y/, '- $1y').replace(/\+ (\d+)y/, '+ $1y'), `Penyelesaian bagi $\\begin{cases} ax + ${s.b1 > 0 ? '' : '('}${s.b1}${s.b1 > 0 ? '' : ')'}y = ${s.c1} \\\\ ${eq2(s.a2, s.b2, 'b')} \\end{cases}$ ialah $x = ${s.x0}$, $y = ${s.y0}$. Cari nilai $a$ dan $b$.`.replace(/\+ \(-(\d+)\)y/, '- $1y').replace(/\+ (\d+)y/, '+ $1y')), a: T(`$a = ${s.a1}$, $b = ${s.c2}$`), w: W(T(`The solution satisfies both equations, so substitute $x = ${s.x0}$ and $y = ${s.y0}$.`, `Penyelesaian itu memenuhi kedua-dua persamaan, maka gantikan $x = ${s.x0}$ dan $y = ${s.y0}$.`), T(`First equation: $a${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$`, `Persamaan pertama: $a${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$`), T(`$${cn(s.x0)}a = ${redu(s.c1, s.b1 * s.y0)}$, so $a = ${s.a1}$.`, `$${cn(s.x0)}a = ${redu(s.c1, s.b1 * s.y0)}$, maka $a = ${s.a1}$.`), T(`Second equation: $b = ${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$`, `Persamaan kedua: $b = ${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$`)), sp: 'm' };
  };
  const ga66 = [a66Both, a66Frac, a66Coef, a66NoSol, a66Expr, a66Choose, a66Err, a66Param];
  /* composed 6.6 questions: method x presentation x what is asked */
  const M66 = [
    [T('Solve by substitution:', 'Selesaikan dengan penggantian:'), 1], [T('Solve by elimination:', 'Selesaikan dengan penyingkiran:'), 2], [T('Solve, using the method that you find most efficient:', 'Selesaikan dengan kaedah yang anda anggap paling cekap:'), 0],
    [T('Using the substitution method, solve', 'Dengan menggunakan kaedah penggantian, selesaikan'), 1], [T('Using the elimination method, solve', 'Dengan menggunakan kaedah penyingkiran, selesaikan'), 2], [T('Add or subtract suitable multiples of the equations to solve', 'Tambah atau tolak gandaan yang sesuai bagi persamaan untuk menyelesaikan'), 2],
  ];
  const A66 = [
    [T('Write down the values of $x$ and $y$.', 'Tuliskan nilai $x$ dan $y$.'), (z) => `x = ${tx(z.x)},\\ y = ${tx(z.y)}`],
    [T('Find the value of $x$ only.', 'Cari nilai $x$ sahaja.'), (z) => `x = ${tx(z.x)}`],
    [T('Find only the value of $y$.', 'Cari nilai $y$ sahaja.'), (z) => `y = ${tx(z.y)}`],
    [T('Hence find the value of $x + y$.', 'Seterusnya cari nilai $x + y$.'), (z) => tx(Fr.add(z.x, z.y))],
    [T('Hence find the value of $x - y$.', 'Seterusnya cari nilai $x - y$.'), (z) => tx(Fr.sub(z.x, z.y))],
    [T('Hence find the value of $2x + y$.', 'Seterusnya cari nilai $2x + y$.'), (z) => tx(Fr.add(Fr.mul(Q(2), z.x), z.y))],
    [T('Which is larger, $x$ or $y$?', 'Antara $x$ dan $y$, yang manakah lebih besar?'), (z) => (Fr.cmp(z.x, z.y) > 0 ? `x = ${tx(z.x)}` : `y = ${tx(z.y)}`), (z) => Fr.cmp(z.x, z.y) !== 0],
    [T('State the quadrant in which the point $(x, y)$ lies.', 'Nyatakan sukuan yang mengandungi titik $(x, y)$.'), (z) => null, (z) => z.x.n !== 0 && z.y.n !== 0],
    [T('Write the solution as an ordered pair $(x, y)$.', 'Tulis penyelesaian sebagai pasangan tertib $(x, y)$.'), (z) => `(${tx(z.x)}, ${tx(z.y)})`],
    [T('Then verify your solution in both equations.', 'Kemudian sahkan penyelesaian anda dalam kedua-dua persamaan.'), (z) => `x = ${tx(z.x)},\\ y = ${tx(z.y)}`],
    [T('Is $x$ a whole number? Is $y$?', 'Adakah $x$ nombor bulat? Adakah $y$?'), (z) => null, (z) => true],
    [T('Show that the solution satisfies the first equation.', 'Tunjukkan bahawa penyelesaian itu memenuhi persamaan pertama.'), (z) => `x = ${tx(z.x)},\\ y = ${tx(z.y)}`],
  ];
  const mix66 = (r, lv) => {
    let s;
    if (lv === 'e') {
      const x0 = r.int(1, 7), y0 = r.int(1, 7), a = r.int(1, 4), b = r.int(1, 4), c = r.int(1, 4), w = r.int(0, 2);
      s = w === 0 ? mkS(a, b, x0, y0, c, -b) : w === 1 ? mkS(a, b, x0, y0, a, c) : mkS(a, b, x0, y0, -a, c);
    } else if (lv === 'm') s = sysR(r, { lo: -4, hi: 6, R: 3 });
    else s = r.chance() ? sysR(r, { lo: -4, hi: 6, R: 5 }) : sysF(r);
    need(detS(s) !== 0);
    const z = solS(s), m = r.pick(M66), ai = r.int(0, A66.length - 1), A = A66[ai], F = r.int(0, 3), ex = r.int(0, 2);
    if (A[2]) need(A[2](z));
    if (lv === 'e') need(m[1] === 0 || true);
    const cs = sy(s);
    const tab = SPM.table([['', '$x$', '$y$', '$=$'], [T('(1)', '(1)').en, `$${s.a1}$`, `$${s.b1}$`, `$${s.c1}$`], ['(2)', `$${s.a2}$`, `$${s.b2}$`, `$${s.c2}$`]]);
    const frame = [`$${cs}$`, `(1) $${eq2(s.a1, s.b1, s.c1)}$<br>(2) $${eq2(s.a2, s.b2, s.c2)}$`, `$${eq2(s.a1, s.b1, s.c1)}$ ${T('and', 'dan').en} $${eq2(s.a2, s.b2, s.c2)}$`, tab][F];
    const frameMs = F === 2 ? `$${eq2(s.a1, s.b1, s.c1)}$ dan $${eq2(s.a2, s.b2, s.c2)}$` : frame;
    const exs = [['', ''], [' Show your working.', ' Tunjukkan langkah kerja anda.'], [' Give any fractions in simplest form.', ' Berikan sebarang pecahan dalam bentuk termudah.']][ex];
    let ans;
    if (ai === 7) { const qd = QUAD(Fr.val(z.x), Fr.val(z.y)); ans = T(`$x = ${tx(z.x)}$, $y = ${tx(z.y)}$; ${QN[qd].en}`, `$x = ${tx(z.x)}$, $y = ${tx(z.y)}$; ${QN[qd].ms}`); }
    else if (ai === 10) ans = T(`$x$: ${z.x.d === 1 ? 'yes' : 'no'}; $y$: ${z.y.d === 1 ? 'yes' : 'no'} ($x = ${tx(z.x)}$, $y = ${tx(z.y)}$)`, `$x$: ${z.x.d === 1 ? 'ya' : 'tidak'}; $y$: ${z.y.d === 1 ? 'ya' : 'tidak'} ($x = ${tx(z.x)}$, $y = ${tx(z.y)}$)`);
    else ans = T(`$${A[1](z)}$`.replace(/^\$\$/, '$'), `$${A[1](z)}$`);
    if ([3, 4, 5].includes(ai)) ans = T(`$x = ${tx(z.x)}$, $y = ${tx(z.y)}$; $${A[1](z)}$`);
    return { q: T(`${m[0].en}<br>${frame}<br>${A[0].en}${exs[0]}`, `${m[0].ms}<br>${frameMs}<br>${A[0].ms}${exs[1]}`), a: ans, w: W(...sysW(s)), sp: lv === 'e' ? 'm' : 'l' };
  };
  const e66Mix = (r) => mix66(r, 'e'), m66Mix = (r) => mix66(r, 'm'), a66Mix = (r) => mix66(r, 'a');
  ge66.push(e66Mix, e66Mix, e66Mix);
  gm66.push(m66Mix, m66Mix, m66Mix);
  ga66.push(a66Mix, a66Mix, a66Mix);
  SPM.extend('F1-6.6', { e: ge66, m: gm66, a: ga66 });

  
  /* ================================================================ 6.7 */
  SC5.push(
    (r) => { const [A, B] = r.pair(), d = r.int(2, 8), y = r.int(3, 9), y0 = r.int(9, 16), x0 = y0 + d; return S5(T(`${A} is ${d} years older than ${B}. In ${y} years' time the sum of their ages will be ${x0 + y0 + 2 * y}. Let $x$ and $y$ be the present ages of ${A} and ${B}.`, `${A} lebih tua ${d} tahun daripada ${B}. ${y} tahun lagi, jumlah umur mereka ialah ${x0 + y0 + 2 * y}. Andaikan $x$ dan $y$ ialah umur ${A} dan ${B} sekarang.`), [1, -1], [1, 1], x0, y0, T(`${A}'s age now`, `umur ${A} sekarang`), T(`${B}'s age now`, `umur ${B} sekarang`)); },
    (r) => { const [A, B] = r.pair(), k = r.int(3, 4), y0 = r.int(9, 14), yr = r.int(3, 6); return S5(T(`${A} is ${k} times as old as ${B}. The sum of their ages ${yr} years ago was ${k * y0 + y0 - 2 * yr}. Let $x$ and $y$ be the present ages of ${A} and ${B}.`, `Umur ${A} ialah ${k} kali ganda umur ${B}. Jumlah umur mereka ${yr} tahun yang lalu ialah ${k * y0 + y0 - 2 * yr}. Andaikan $x$ dan $y$ ialah umur ${A} dan ${B} sekarang.`), [1, -k], [1, 1], k * y0, y0, T(`${A}'s age now`, `umur ${A} sekarang`), T(`${B}'s age now`, `umur ${B} sekarang`)); },
    (r) => { const x0 = r.int(1, 8), y0 = r.int(x0 + 1, 9); return S5(T(`The sum of the digits of a two-digit number is ${x0 + y0}. When the digits are swapped the number becomes ${9 * (y0 - x0)} more than the original number. Let $x$ be the tens digit and $y$ the units digit.`, `Hasil tambah digit bagi suatu nombor dua digit ialah ${x0 + y0}. Apabila digit-digitnya ditukar tempat, nombor itu menjadi ${9 * (y0 - x0)} lebih besar daripada nombor asal. Andaikan $x$ ialah digit puluh dan $y$ ialah digit sebut.`), [1, 1], [-9, 9], x0, y0, T('tens digit', 'digit puluh'), T('units digit', 'digit sebut')); },
    (r) => { const x0 = r.int(3, 12), y0 = r.int(2, 10), a = r.pick([2, 3]), b = r.int(1, 3); need(x0 > y0); return S5(T(`Two numbers $x$ and $y$ are such that ${a} times the first plus ${b === 1 ? 'the second' : b + ' times the second'} is ${a * x0 + b * y0}, and the first minus the second is ${x0 - y0}.`, `Dua nombor $x$ dan $y$ dengan keadaan ${a} kali nombor pertama campur ${b === 1 ? 'nombor kedua' : b + ' kali nombor kedua'} ialah ${a * x0 + b * y0}, dan nombor pertama tolak nombor kedua ialah ${x0 - y0}.`), [a, b], [1, -1], x0, y0, T('the first number', 'nombor pertama'), T('the second number', 'nombor kedua')); },
    (r) => { const x0 = r.int(3, 10), a = r.int(2, 5), c = a + r.int(1, 3), g = r.int(4, 20), f = g + (c - a) * x0; need(f <= 60); const y0 = a * x0 + f, act = r.pick([[T('gym', 'gim'), T('visit', 'lawatan')], [T('swimming pool', 'kolam renang'), T('session', 'sesi')]]); return S5(T(`Plan A of a ${act[0].en} costs RM${f} to join plus RM${a} per ${act[1].en}. Plan B costs RM${g} to join plus RM${c} per ${act[1].en}. After $x$ ${act[1].en}s both plans have cost the same amount, RM$y$.`, `Pelan A sebuah ${act[0].ms} berharga RM${f} untuk menyertai campur RM${a} bagi setiap ${act[1].ms}. Pelan B berharga RM${g} untuk menyertai campur RM${c} bagi setiap ${act[1].ms}. Selepas $x$ ${act[1].ms}, kedua-dua pelan telah berkos sama, iaitu RM$y$.`), [-a, 1], [-c, 1], x0, y0, T(`number of ${act[1].en}s`, `bilangan ${act[1].ms}`), T('cost in RM', 'kos dalam RM')); },
    (r) => { const y0 = r.int(3, 12), dd = r.int(1, 5), x0 = y0 + dd; return S5(T(`An isosceles triangle has two equal sides of $x$ cm and a base of $y$ cm. Its perimeter is ${2 * x0 + y0} cm and each equal side is ${dd} cm longer than the base.`, `Sebuah segi tiga sama kaki mempunyai dua sisi sama panjang $x$ cm dan tapak $y$ cm. Perimeternya ialah ${2 * x0 + y0} cm dan setiap sisi sama panjang itu lebih ${dd} cm daripada tapak.`), [2, 1], [1, -1], x0, y0, T('equal side', 'sisi sama panjang'), T('base', 'tapak')); },
    (r) => { const [A, B] = r.pair(), d = r.int(5, 30), y0 = r.int(20, 80), x0 = y0 + 2 * d; return S5(T(`${A} and ${B} together have RM${x0 + y0}. If ${A} gives RM${d} to ${B}, they will have equal amounts. Let RM$x$ and RM$y$ be the amounts that ${A} and ${B} have now.`, `${A} dan ${B} mempunyai RM${x0 + y0} bersama-sama. Jika ${A} memberi RM${d} kepada ${B}, mereka akan mempunyai jumlah yang sama. Andaikan RM$x$ dan RM$y$ ialah jumlah wang ${A} dan ${B} sekarang.`), [1, 1], [1, -1], x0, y0, T(`${A}'s money`, `wang ${A}`), T(`${B}'s money`, `wang ${B}`)); },
  );
  const unitAns = (s) => T(`$x = ${s.x0}$ (${s.nx.en}), $y = ${s.y0}$ (${s.ny.en})`, `$x = ${s.x0}$ (${s.nx.ms}), $y = ${s.y0}$ (${s.ny.ms})`);
  const priced = (s) => /price|harga/.test(s.nx.en + s.nx.ms) && /price|harga/.test(s.ny.en + s.ny.ms);
  const NUM7 = [
    (x, y) => [T(`The sum of two numbers is ${x + y} and their difference is ${x - y}. Find the two numbers.`, `Hasil tambah dua nombor ialah ${x + y} dan beza antara kedua-duanya ialah ${x - y}. Cari kedua-dua nombor itu.`), [1, 1, x + y], [1, -1, x - y]],
    (x, y) => [T(`The sum of two numbers is ${x + y}. One number is ${x - y} more than the other. Find the numbers.`, `Hasil tambah dua nombor ialah ${x + y}. Satu nombor lebih ${x - y} daripada nombor yang lain. Cari nombor-nombor itu.`), [1, 1, x + y], [1, -1, x - y]],
    (x, y) => (need(x - 2 * y > 0), [T(`Two numbers add up to ${x + y}, and the first is twice the second increased by ${x - 2 * y}. Find the numbers.`, `Dua nombor berjumlah ${x + y}, dan nombor pertama ialah dua kali nombor kedua ditambah ${x - 2 * y}. Cari nombor-nombor itu.`), [1, 1, x + y], [1, -2, x - 2 * y]]),
    (x, y) => [T(`Twice the first number plus the second number is ${2 * x + y}, and the first number minus the second is ${x - y}. Find the numbers.`, `Dua kali nombor pertama campur nombor kedua ialah ${2 * x + y}, dan nombor pertama tolak nombor kedua ialah ${x - y}. Cari nombor-nombor itu.`), [2, 1, 2 * x + y], [1, -1, x - y]],
    (x, y) => [T(`Three times the first number added to the second number is ${3 * x + y}. Their sum is ${x + y}. Find the numbers.`, `Tiga kali nombor pertama ditambah nombor kedua ialah ${3 * x + y}. Hasil tambah kedua-duanya ialah ${x + y}. Cari nombor-nombor itu.`), [3, 1, 3 * x + y], [1, 1, x + y]],
  ];
  /** full working for a two-equation story: equations, elimination, meaning */
  const wSys = (s, ...tail) => W(T(`Equations: $${eqsOf(s)}$`, `Persamaan: $${eqsOf(s)}$`), ...sysW(s), T(`So ${s.nx.en} is ${s.x0} and ${s.ny.en} is ${s.y0}.`, `Maka ${s.nx.ms} ialah ${s.x0} dan ${s.ny.ms} ialah ${s.y0}.`), ...tail);
  const e67Solve = (r) => {
    const s = r.pick(SC5)(r), v = r.int(0, 2);
    if (v === 0) return { q: T(`${s.st.en} Form two equations and solve them to find $x$ and $y$.`, `${s.st.ms} Bentukkan dua persamaan dan selesaikannya untuk mencari $x$ dan $y$.`), a: cat(T(`$${eqsOf(s)}$; `, `$${eqsOf(s)}$; `), unitAns(s)), w: wSys(s), sp: 'xl' };
    if (v === 1) return { q: T(`${s.st.en} Solve the simultaneous equations to find the values of $x$ and $y$, with their meaning.`, `${s.st.ms} Selesaikan persamaan serentak untuk mencari nilai $x$ dan $y$ beserta maksudnya.`), a: unitAns(s), w: wSys(s), sp: 'xl' };
    return { q: T(`${s.st.en} (a) Write two equations. (b) Solve them. (c) Check your answer in both equations.`, `${s.st.ms} (a) Tulis dua persamaan. (b) Selesaikannya. (c) Semak jawapan anda dalam kedua-dua persamaan.`), a: cat(T(`(a) $${eqsOf(s)}$ (b) `, `(a) $${eqsOf(s)}$ (b) `), unitAns(s)), w: wSys(s, T(`Check: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$ and $${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$.`, `Semak: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$ dan $${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$.`)), sp: 'xl' };
  };
  const e67Given = (r) => {
    const s = r.pick(SC5)(r);
    need(s.a1 > 0 && s.b1 !== 0);
    return { q: T(`${s.st.en} The situation gives the equations $${eqsOf(s)}$. Solve the equations and say what $x$ and $y$ are.`, `${s.st.ms} Situasi ini memberi persamaan $${eqsOf(s)}$. Selesaikan persamaan itu dan nyatakan apa itu $x$ dan $y$.`), a: unitAns(s), w: W(...sysW(s), T(`So ${s.nx.en} is ${s.x0} and ${s.ny.en} is ${s.y0}.`, `Maka ${s.nx.ms} ialah ${s.x0} dan ${s.ny.ms} ialah ${s.y0}.`)), sp: 'l' };
  };
  const e67Num = (r) => {
    const x = r.int(5, 20), y = r.int(2, x - 1), z = r.pick(NUM7)(x, y), [q1, e1, e2] = z, s = { a1: e1[0], b1: e1[1], c1: e1[2], a2: e2[0], b2: e2[1], c2: e2[2] };
    need(detS(s) !== 0 && solS(s).x.n === x && solS(s).y.n === y);
    return { q: q1, a: T(`${x} and ${y}`, `${x} dan ${y}`), w: T(`Equations: $${eq2(s.a1, s.b1, s.c1)}$, $${eq2(s.a2, s.b2, s.c2)}$`, `Persamaan: $${eq2(s.a1, s.b1, s.c1)}$, $${eq2(s.a2, s.b2, s.c2)}$`), sp: 'l' };
  };
  const e67Check = (r) => {
    const s = r.pick(SC5)(r), good = r.chance(), dx = r.pick([1, -1]);
    const P = good ? [s.x0, s.y0] : [s.x0 + dx, s.y0];
    need(P[0] > 0);
    const ok = s.a1 * P[0] + s.b1 * P[1] === s.c1 && s.a2 * P[0] + s.b2 * P[1] === s.c2;
    return { q: T(`${s.st.en} A student says that $x = ${P[0]}$ and $y = ${P[1]}$. Check this in the two equations of the problem, $${eqsOf(s)}$, and say whether the student is correct.`, `${s.st.ms} Seorang murid berkata bahawa $x = ${P[0]}$ dan $y = ${P[1]}$. Semak jawapan ini dalam dua persamaan bagi masalah itu, $${eqsOf(s)}$, dan nyatakan sama ada murid itu betul.`), a: ok ? T('Correct: both equations are satisfied.', 'Betul: kedua-dua persamaan dipenuhi.') : T(`Not correct: equation 1 gives ${s.a1 * P[0] + s.b1 * P[1]} (needs ${s.c1}). The right values are $x = ${s.x0}$, $y = ${s.y0}$.`, `Tidak betul: persamaan 1 memberi ${s.a1 * P[0] + s.b1 * P[1]} (perlu ${s.c1}). Nilai yang betul ialah $x = ${s.x0}$, $y = ${s.y0}$.`), w: W(T(`Equation 1: $${cn(s.a1)}${br(P[0])} ${sg(s.b1)} ${cn(ab(s.b1))}${br(P[1])} = ${s.a1 * P[0] + s.b1 * P[1]}$, and it needs $${s.c1}$.`, `Persamaan 1: $${cn(s.a1)}${br(P[0])} ${sg(s.b1)} ${cn(ab(s.b1))}${br(P[1])} = ${s.a1 * P[0] + s.b1 * P[1]}$, dan ia memerlukan $${s.c1}$.`), T(`Equation 2: $${cn(s.a2)}${br(P[0])} ${sg(s.b2)} ${cn(ab(s.b2))}${br(P[1])} = ${s.a2 * P[0] + s.b2 * P[1]}$, and it needs $${s.c2}$.`, `Persamaan 2: $${cn(s.a2)}${br(P[0])} ${sg(s.b2)} ${cn(ab(s.b2))}${br(P[1])} = ${s.a2 * P[0] + s.b2 * P[1]}$, dan ia memerlukan $${s.c2}$.`), ok ? T('Both equations are satisfied, so the student is correct.', 'Kedua-dua persamaan dipenuhi, maka murid itu betul.') : T(`At least one equation fails, so the student is not correct; the values that work are $x = ${s.x0}$ and $y = ${s.y0}$.`, `Sekurang-kurangnya satu persamaan gagal, maka murid itu tidak betul; nilai yang betul ialah $x = ${s.x0}$ dan $y = ${s.y0}$.`)), sp: 'm' };
  };
  const e67Tab = (r) => {
    const it = r.pick(NB), jt = r.pick(NB.filter((z) => z !== it)), p = r.int(it.lo, it.hi), q = r.int(jt.lo, jt.hi), n1 = r.int(2, 4), m1 = r.int(1, 3), n2 = r.int(1, 3), m2 = r.int(2, 4);
    need(n1 * m2 !== n2 * m1 && p !== q);
    const H = (l) => SPM.table([[l[0], it[l[1]], jt[l[1]], l[2]], ['1', n1, m1, `RM${n1 * p + m1 * q}`], ['2', n2, m2, `RM${n2 * p + m2 * q}`]]);
    return { q: T(`The table shows two purchases. Let $x$ be the price of one ${it.en1} and $y$ the price of one ${jt.en1}. Write two equations and find $x$ and $y$.<br>${H(['Purchase', 'en', 'Total'])}`, `Jadual menunjukkan dua pembelian. Andaikan $x$ ialah harga satu ${it.ms} dan $y$ ialah harga satu ${jt.ms}. Tulis dua persamaan dan cari $x$ dan $y$.<br>${H(['Pembelian', 'ms', 'Jumlah'])}`), a: T(`$${n1}x + ${m1}y = ${n1 * p + m1 * q}$, $${n2}x + ${m2}y = ${n2 * p + m2 * q}$; $x = ${p}$, $y = ${q}$ (RM)`), w: W(T(`Purchase 1 gives $${eq2(n1, m1, n1 * p + m1 * q)}$ and purchase 2 gives $${eq2(n2, m2, n2 * p + m2 * q)}$.`, `Pembelian 1 memberi $${eq2(n1, m1, n1 * p + m1 * q)}$ dan pembelian 2 memberi $${eq2(n2, m2, n2 * p + m2 * q)}$.`), ...sysW({ a1: n1, b1: m1, c1: n1 * p + m1 * q, a2: n2, b2: m2, c2: n2 * p + m2 * q }), T(`So one ${it.en1} costs RM${p} and one ${jt.en1} costs RM${q}.`, `Maka satu ${it.ms} berharga RM${p} dan satu ${jt.ms} berharga RM${q}.`)), sp: 'xl' };
  };
  const ge67 = [e67Solve, e67Given, e67Num, e67Check, e67Tab];

    const m67Def = (r) => {
    const s = r.pick(SC5)(r), v = r.int(0, 2);
    if (v === 0) return { q: T(`${s.st.en} Form two simultaneous equations and solve them. State the answer in words with units.`, `${s.st.ms} Bentukkan dua persamaan serentak dan selesaikannya. Nyatakan jawapan dengan perkataan berserta unit.`), a: cat(T(`$${eqsOf(s)}$; `, `$${eqsOf(s)}$; `), unitAns(s)), w: wSys(s), sp: 'xl' };
    if (v === 1) return { q: T(`${s.st.en} By forming and solving a pair of equations, find the value of ${s.nx.en} and the value of ${s.ny.en}.`, `${s.st.ms} Dengan membentuk dan menyelesaikan sepasang persamaan, cari nilai ${s.nx.ms} dan nilai ${s.ny.ms}.`), a: unitAns(s), w: wSys(s), sp: 'xl' };
    return { q: T(`${s.st.en} Solve the problem by elimination or substitution, and verify your answer in both equations of the problem.`, `${s.st.ms} Selesaikan masalah itu dengan penyingkiran atau penggantian, dan sahkan jawapan anda dalam kedua-dua persamaan bagi masalah itu.`), a: cat(unitAns(s), T(`; check: ${s.a1}(${s.x0}) + (${s.b1})(${s.y0}) = ${s.c1} and ${s.a2}(${s.x0}) + (${s.b2})(${s.y0}) = ${s.c2}`, `; semakan: ${s.a1}(${s.x0}) + (${s.b1})(${s.y0}) = ${s.c1} dan ${s.a2}(${s.x0}) + (${s.b2})(${s.y0}) = ${s.c2}`)), w: wSys(s, T(`Check: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$ and $${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$.`, `Semak: $${cn(s.a1)}${br(s.x0)} ${sg(s.b1)} ${cn(ab(s.b1))}${br(s.y0)} = ${s.c1}$ dan $${cn(s.a2)}${br(s.x0)} ${sg(s.b2)} ${cn(ab(s.b2))}${br(s.y0)} = ${s.c2}$.`)), sp: 'xl' };
  };
  const m67Follow = (r) => {
    const s = r.pick(SC5)(r);
    need(priced(s));
    const k = r.int(2, 5), m = r.int(1, 4), v = r.int(0, 1);
    return { q: v === 0 ? T(`${s.st.en} (a) Find $x$ and $y$. (b) Find the cost of ${k} of the first item and ${m} of the second.`, `${s.st.ms} (a) Cari $x$ dan $y$. (b) Cari kos bagi ${k} unit barang pertama dan ${m} unit barang kedua.`) : T(`${s.st.en} Form and solve two equations. Hence find the total price of one of each item.`, `${s.st.ms} Bentukkan dan selesaikan dua persamaan. Seterusnya cari jumlah harga bagi satu unit setiap barang.`), a: v === 0 ? T(`(a) $x = ${s.x0}$, $y = ${s.y0}$ (b) RM${k * s.x0 + m * s.y0}`) : T(`$x = ${s.x0}$, $y = ${s.y0}$; RM${s.x0 + s.y0}`), w: wSys(s, v === 0 ? T(`(b) $${k}(${s.x0}) + ${m}(${s.y0}) = ${k * s.x0 + m * s.y0}$, that is RM${k * s.x0 + m * s.y0}.`, `(b) $${k}(${s.x0}) + ${m}(${s.y0}) = ${k * s.x0 + m * s.y0}$, iaitu RM${k * s.x0 + m * s.y0}.`) : T(`One of each costs $${s.x0} + ${s.y0} = ${s.x0 + s.y0}$, that is RM${s.x0 + s.y0}.`, `Satu unit setiap barang berharga $${s.x0} + ${s.y0} = ${s.x0 + s.y0}$, iaitu RM${s.x0 + s.y0}.`)), sp: 'xl' };
  };
  const CNT = [
    [T('20-sen coins', 'syiling 20 sen'), T('50-sen coins', 'syiling 50 sen'), 20, 50, T('coins', 'keping syiling'), T('sen', 'sen'), T('are worth', 'bernilai')],
    [T('RM5 notes', 'wang kertas RM5'), T('RM10 notes', 'wang kertas RM10'), 5, 10, T('notes', 'keping wang kertas'), T('RM', 'RM'), T('are worth', 'bernilai')],
    [T('chickens', 'ayam'), T('goats', 'kambing'), 2, 4, T('animals', 'ekor haiwan'), T('legs', 'kaki'), T('have', 'mempunyai')],
    [T('adult tickets', 'tiket dewasa'), T('child tickets', 'tiket kanak-kanak'), 12, 5, T('tickets', 'keping tiket'), T('RM', 'RM'), T('cost', 'berharga')],
  ];
  const m67Reject = (r) => {
    const c = r.pick(CNT), N = r.int(8, 20), good = r.chance(), nm = r.name();
    let x0 = r.int(2, N - 3), V = c[2] * x0 + c[3] * (N - x0);
    if (!good) V += r.pick([1, -1, 3]) * (c[3] - c[2] > 1 ? 1 : 1);
    const s = { a1: 1, b1: 1, c1: N, a2: c[2], b2: c[3], c2: V }, z = solS(s), whole = z.x.d === 1 && z.y.d === 1 && z.x.n >= 0 && z.y.n >= 0;
    need(detS(s) !== 0);
        const vt = (l) => (c[5].en === 'RM' ? `RM${V}` : `${V} ${c[5][l]}`);
    return { q: T(`${nm} says that ${N} ${c[4].en}, made up of ${c[0].en} and ${c[1].en}, ${c[6].en} ${vt('en')} altogether. Let $x$ be the number of ${c[0].en} and $y$ the number of ${c[1].en}. Form two equations, solve them, and decide whether ${nm}'s data can be correct.`, `${nm} berkata bahawa ${N} ${c[4].ms}, terdiri daripada ${c[0].ms} dan ${c[1].ms}, ${c[6].ms} ${vt('ms')} semuanya. Andaikan $x$ ialah bilangan ${c[0].ms} dan $y$ ialah bilangan ${c[1].ms}. Bentukkan dua persamaan, selesaikannya dan tentukan sama ada data ${nm} boleh betul.`), a: whole ? T(`$x + y = ${N}$, $${c[2]}x + ${c[3]}y = ${V}$; $x = ${z.x.n}$, $y = ${z.y.n}$: possible`, `$x + y = ${N}$, $${c[2]}x + ${c[3]}y = ${V}$; $x = ${z.x.n}$, $y = ${z.y.n}$: mungkin`) : T(`$x + y = ${N}$, $${c[2]}x + ${c[3]}y = ${V}$; $x = ${tx(z.x)}$, $y = ${tx(z.y)}$: not possible, because the numbers of ${c[4].en} must be whole numbers that are not negative`, `$x + y = ${N}$, $${c[2]}x + ${c[3]}y = ${V}$; $x = ${tx(z.x)}$, $y = ${tx(z.y)}$: tidak mungkin, kerana bilangan ${c[4].ms} mesti nombor bulat yang tidak negatif`), w: W(T(`The total number gives $x + y = ${N}$ and the total value gives $${eq2(c[2], c[3], V)}$.`, `Jumlah bilangan memberi $x + y = ${N}$ dan jumlah nilai memberi $${eq2(c[2], c[3], V)}$.`), ...sysW(s), whole ? T(`Both values are whole numbers that are not negative, so the data can be correct.`, `Kedua-dua nilai ialah nombor bulat yang tidak negatif, maka data itu boleh betul.`) : T(`A number of ${c[4].en} cannot be a fraction or negative, so the data cannot be correct.`, `Bilangan ${c[4].ms} tidak boleh pecahan atau negatif, maka data itu tidak boleh betul.`)), sp: 'xl' };
  };
  const m67Sent = (r) => {
    const s = r.pick(SC5)(r), q = r.int(0, 1);
    return { q: q === 0 ? T(`${s.st.en} Find $x$ and $y$ and write a sentence that answers the problem.`, `${s.st.ms} Cari $x$ dan $y$ dan tulis satu ayat yang menjawab masalah itu.`) : T(`${s.st.en} Which is greater, $x$ or $y$, and by how much? Solve the equations first.`, `${s.st.ms} Antara $x$ dan $y$, yang manakah lebih besar, dan berapakah bezanya? Selesaikan persamaan itu dahulu.`), a: q === 0 ? unitAns(s) : T(`${s.x0 > s.y0 ? '$x$' : s.x0 === s.y0 ? 'Neither: they are equal' : '$y$'} ${s.x0 === s.y0 ? '' : `is greater, by ${Math.abs(s.x0 - s.y0)} ($x = ${s.x0}$, $y = ${s.y0}$)`}`, `${s.x0 > s.y0 ? '$x$' : s.x0 === s.y0 ? 'Kedua-duanya sama' : '$y$'} ${s.x0 === s.y0 ? '' : `lebih besar, dengan beza ${Math.abs(s.x0 - s.y0)} ($x = ${s.x0}$, $y = ${s.y0}$)`}`), w: wSys(s, q === 0 ? T(`A sentence: ${s.nx.en} is ${s.x0} and ${s.ny.en} is ${s.y0}.`, `Satu ayat: ${s.nx.ms} ialah ${s.x0} dan ${s.ny.ms} ialah ${s.y0}.`) : T(`Comparing $x = ${s.x0}$ with $y = ${s.y0}$: ${s.x0 === s.y0 ? 'they are equal' : `the difference is $${ab(s.x0 - s.y0)}$`}.`, `Membandingkan $x = ${s.x0}$ dengan $y = ${s.y0}$: ${s.x0 === s.y0 ? 'kedua-duanya sama' : `bezanya ialah $${ab(s.x0 - s.y0)}$`}.`)), sp: 'xl' };
  };
  const m67Num = (r) => {
    const x = r.int(5, 25), y = r.int(2, x - 1), z = r.pick(NUM7)(x, y), [q1, e1, e2] = z;
    const s = { a1: e1[0], b1: e1[1], c1: e1[2], a2: e2[0], b2: e2[1], c2: e2[2] };
    need(detS(s) !== 0 && solS(s).x.n === x);
    return { q: T(`${q1.en} Let the numbers be $x$ and $y$; form two equations and solve them.`, `${q1.ms} Andaikan nombor-nombor itu $x$ dan $y$; bentukkan dua persamaan dan selesaikannya.`), a: T(`$${eq2(s.a1, s.b1, s.c1)}$, $${eq2(s.a2, s.b2, s.c2)}$; $x = ${x}$, $y = ${y}$`), w: W(T(`Equations: $${eq2(s.a1, s.b1, s.c1)}$, $${eq2(s.a2, s.b2, s.c2)}$`, `Persamaan: $${eq2(s.a1, s.b1, s.c1)}$, $${eq2(s.a2, s.b2, s.c2)}$`), ...sysW(s), T(`So the numbers are ${x} and ${y}.`, `Maka nombor-nombor itu ialah ${x} dan ${y}.`)), sp: 'l' };
  };
  const gm67 = [m67Def, m67Follow, m67Reject, m67Sent, m67Num];
  const rectFig = (bot, right, top, left) => F.polygon({ pts: [[0, 0], [2.4, 0], [2.4, 1.4], [0, 1.4]], sides: { '0-1': bot, '1-2': right, '2-3': top, '3-0': left } });
  const a67Rect = (r) => {
    const s = sysR(r, { lo: 2, hi: 7, R: 3, pos: true });
    need(s.c1 > 0 && s.c2 > 0 && s.a1 !== s.b1 && detS(s) !== 0);
    const E1 = poly([[s.a1, 'x'], [s.b1, 'y']]), E2 = poly([[s.a2, 'x'], [s.b2, 'y']]), P = 2 * (s.c1 + s.c2);
    return { q: T(`The diagram shows a rectangle (not drawn to scale). Its opposite sides are equal. Form two equations, find $x$ and $y$, and hence find the perimeter of the rectangle.`, `Rajah menunjukkan sebuah segi empat tepat (tidak dilukis mengikut skala). Sisi-sisi yang bertentangan adalah sama. Bentukkan dua persamaan, cari $x$ dan $y$, dan seterusnya cari perimeter segi empat tepat itu.`), fig: rectFig(`(${E1}) cm`, `${s.c2} cm`, `${s.c1} cm`, `(${E2}) cm`), a: T(`$${eq2(s.a1, s.b1, s.c1)}$, $${eq2(s.a2, s.b2, s.c2)}$; $x = ${s.x0}$, $y = ${s.y0}$; perimeter $${P}$ cm`, `$${eq2(s.a1, s.b1, s.c1)}$, $${eq2(s.a2, s.b2, s.c2)}$; $x = ${s.x0}$, $y = ${s.y0}$; perimeter $${P}$ cm`), w: W(T(`Opposite sides of a rectangle are equal, so $${E1} = ${s.c1}$ and $${E2} = ${s.c2}$.`, `Sisi bertentangan segi empat tepat adalah sama, maka $${E1} = ${s.c1}$ dan $${E2} = ${s.c2}$.`), ...sysW(s), T(`The sides are $${s.c1}$ cm and $${s.c2}$ cm, so the perimeter is $2(${s.c1} + ${s.c2}) = ${P}$ cm.`, `Sisi-sisinya ialah $${s.c1}$ cm dan $${s.c2}$ cm, maka perimeternya ialah $2(${s.c1} + ${s.c2}) = ${P}$ cm.`)), sp: 'xl' };
  };
  const a67Multi = (r) => {
    const s = r.pick(SC5)(r);
    need(priced(s));
    const k = r.int(2, 6), m = r.int(2, 6), cheap = k * s.x0 + m * s.y0, pk = s.x0 + s.y0;
    return { q: T(`${s.st.en} (a) Form two equations and solve them. (b) Find the total price of ${k} of the first item and ${m} of the second. (c) A promotion sells one of each item for RM${pk - 2}. How much is saved by using the promotion twice instead of paying normally?`, `${s.st.ms} (a) Bentukkan dua persamaan dan selesaikannya. (b) Cari jumlah harga bagi ${k} unit barang pertama dan ${m} unit barang kedua. (c) Satu promosi menjual satu unit setiap barang dengan harga RM${pk - 2}. Berapakah penjimatan jika promosi itu digunakan dua kali berbanding membayar harga biasa?`), a: T(`(a) $x = ${s.x0}$, $y = ${s.y0}$ (b) RM${cheap} (c) RM4`), w: W(T(`(a) Equations: $${eqsOf(s)}$`, `(a) Persamaan: $${eqsOf(s)}$`), ...sysW(s), T(`(b) $${k}(${s.x0}) + ${m}(${s.y0}) = ${cheap}$, that is RM${cheap}.`, `(b) $${k}(${s.x0}) + ${m}(${s.y0}) = ${cheap}$, iaitu RM${cheap}.`), T(`(c) Normally one of each costs $${s.x0} + ${s.y0} = ${pk}$, that is RM${pk}; the promotion charges RM${pk - 2}, so it saves RM2 each time.`, `(c) Biasanya satu unit setiap barang berharga $${s.x0} + ${s.y0} = ${pk}$, iaitu RM${pk}; promosi mengenakan RM${pk - 2}, maka ia menjimatkan RM2 setiap kali.`), T('Used twice, the saving is RM4.', 'Digunakan dua kali, penjimatannya ialah RM4.')), sp: 'xl' };
  };
  const a67Digits = (r) => {
    const x0 = r.int(1, 8), y0 = r.int(x0 + 1, 9), num = 10 * x0 + y0;
    return { q: T(`A two-digit number has digits that add up to ${x0 + y0}. The number formed by reversing its digits is ${9 * (y0 - x0)} more than the original number. Find the original number.`, `Digit-digit bagi suatu nombor dua digit berjumlah ${x0 + y0}. Nombor yang terbentuk apabila digit-digitnya diterbalikkan ialah ${9 * (y0 - x0)} lebih besar daripada nombor asal. Cari nombor asal itu.`), a: T(`Tens digit $${x0}$, units digit $${y0}$: the number is ${num}`, `Digit puluh $${x0}$, digit sebut $${y0}$: nombor itu ialah ${num}`), w: W(T('Let $x$ be the tens digit and $y$ the units digit, so the number is $10x + y$.', 'Andaikan $x$ ialah digit puluh dan $y$ ialah digit sebut, maka nombor itu ialah $10x + y$.'), T(`The digits add up: $x + y = ${x0 + y0}$.`, `Hasil tambah digitnya: $x + y = ${x0 + y0}$.`), T(`Reversing gives $(10y + x) - (10x + y) = 9y - 9x = ${9 * (y0 - x0)}$, so $y - x = ${y0 - x0}$.`, `Menterbalikkan digit memberi $(10y + x) - (10x + y) = 9y - 9x = ${9 * (y0 - x0)}$, maka $y - x = ${y0 - x0}$.`), T(`Adding the two equations: $2y = ${2 * y0}$, so $y = ${y0}$ and $x = ${x0}$.`, `Menambah kedua-dua persamaan: $2y = ${2 * y0}$, maka $y = ${y0}$ dan $x = ${x0}$.`), T(`The number is $10(${x0}) + ${y0} = ${num}$.`, `Nombor itu ialah $10(${x0}) + ${y0} = ${num}$.`)), sp: 'xl' };
  };
  const a67Compare = (r) => {
    const s = r.pick(SC5)(r);
    need(priced(s));
    const k = r.int(2, 4), m = r.int(2, 4), c1 = k * s.x0 + (k + 1) * s.y0, c2 = (k + 2) * s.x0 + m * s.y0;
    need(c1 !== c2);
    return { q: T(`${s.st.en} Find $x$ and $y$. Ali buys ${k} of the first item and ${k + 1} of the second. Aina buys ${k + 2} of the first and ${m} of the second. Who pays more, and by how much?`, `${s.st.ms} Cari $x$ dan $y$. Ali membeli ${k} unit barang pertama dan ${k + 1} unit barang kedua. Aina membeli ${k + 2} unit barang pertama dan ${m} unit barang kedua. Siapakah yang membayar lebih, dan berapakah bezanya?`), a: T(`$x = ${s.x0}$, $y = ${s.y0}$; ${c1 > c2 ? 'Ali' : 'Aina'} pays more by RM${ab(c1 - c2)} (RM${c1} and RM${c2})`, `$x = ${s.x0}$, $y = ${s.y0}$; ${c1 > c2 ? 'Ali' : 'Aina'} membayar lebih RM${ab(c1 - c2)} (RM${c1} dan RM${c2})`), w: W(T(`Equations: $${eqsOf(s)}$`, `Persamaan: $${eqsOf(s)}$`), ...sysW(s), T(`Ali pays $${k}(${s.x0}) + ${k + 1}(${s.y0}) = ${c1}$, that is RM${c1}.`, `Ali membayar $${k}(${s.x0}) + ${k + 1}(${s.y0}) = ${c1}$, iaitu RM${c1}.`), T(`Aina pays $${k + 2}(${s.x0}) + ${m}(${s.y0}) = ${c2}$, that is RM${c2}.`, `Aina membayar $${k + 2}(${s.x0}) + ${m}(${s.y0}) = ${c2}$, iaitu RM${c2}.`), T(`${c1 > c2 ? 'Ali' : 'Aina'} pays more, by RM${ab(c1 - c2)}.`, `${c1 > c2 ? 'Ali' : 'Aina'} membayar lebih, sebanyak RM${ab(c1 - c2)}.`)), sp: 'xl' };
  };
  const a67Reject = (r) => {
    const s = sysF(r, { both: false }), z = solS(s);
    need(z.x.d > 1 || z.y.d > 1);
    const c = r.pick(CNT), nm = r.name();
    return { q: T(`${nm} models a problem about ${c[4].en} with $${sy(s)}$, where $x$ and $y$ are the numbers of two kinds of ${c[4].en}. Solve the equations and decide whether the solution makes sense for counting ${c[4].en}.`, `${nm} memodelkan satu masalah tentang ${c[4].ms} dengan $${sy(s)}$, dengan $x$ dan $y$ ialah bilangan dua jenis ${c[4].ms}. Selesaikan persamaan itu dan tentukan sama ada penyelesaian itu munasabah untuk membilang ${c[4].ms}.`), a: T(`$x = ${tx(z.x)}$, $y = ${tx(z.y)}$: not acceptable, since counts must be whole numbers${z.x.n < 0 || z.y.n < 0 ? ' and cannot be negative' : ''}`, `$x = ${tx(z.x)}$, $y = ${tx(z.y)}$: tidak boleh diterima kerana bilangan mesti nombor bulat${z.x.n < 0 || z.y.n < 0 ? ' dan tidak boleh negatif' : ''}`), w: W(...sysW(s), T(`The solution is $x = ${tx(z.x)}$, $y = ${tx(z.y)}$.`, `Penyelesaiannya ialah $x = ${tx(z.x)}$, $y = ${tx(z.y)}$.`), T(`A number of ${c[4].en} must be a whole number that is not negative, so these values cannot describe the situation.`, `Bilangan ${c[4].ms} mesti nombor bulat yang tidak negatif, maka nilai-nilai ini tidak boleh menggambarkan situasi itu.`)), sp: 'l' };
  };
  const ga67 = [a67Rect, a67Multi, a67Digits, a67Compare, a67Reject];
  SPM.extend('F1-6.7', { e: ge67, m: gm67, a: ga67 });

  /*@@NEXT@@*/
})();
