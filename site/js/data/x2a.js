/* Variety pack x2a: F2-1.1 .. F2-1.E (patterns & sequences) and F2-2.1 .. F2-2.3 (expansion, factorisation, algebraic fractions). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, Fr, poly, lin, gcd, round } = SPM;
  const T = SPM.L, S = SPM.svg;
  const PT = SPM.parts;

  /* ---------------------------------------------------------------- shared helpers */
  const sq = (l) => l.map((v) => n(v)).join(',\\ ');
  const dots = (l) => sq(l) + ',\\ \\ldots';
  const ar = (a, d, k) => Array.from({ length: k }, (_, i) => round(a + d * i, 6));
  const ke = (k) => 'ke-' + k;
  const ordE = (k) => k + (k % 100 > 10 && k % 100 < 14 ? 'th' : ['th', 'st', 'nd', 'rd'][k % 10] || 'th');
  const sg = (v) => (v < 0 ? '-' : '+');
  const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  const diffs = (l) => l.slice(1).map((v, i) => round(v - l[i], 6));
  /** multiple choice: right / wrong are strings or {en,ms}; returns {q: options, a: key} */
  const mc = (r, right, wrong, sep) => {
    const all = r.shuffle([right].concat(wrong));
    need(new Set(all.map((o) => (typeof o === 'string' ? o : o.en))).size === all.length);
    const f = (k) => all.map((o, i) => `(${'ABCD'[i]}) ${typeof o === 'string' ? o : o[k]}`).join(sep || '&emsp;&emsp;');
    const i = all.indexOf(right), g = (k) => `(${'ABCD'[i]}) ${typeof right === 'string' ? right : right[k]}`;
    return { q: T(f('en'), f('ms')), a: T(g('en'), g('ms')) };
  };
  const cat = (...xs) => SPM.cat(...xs);
  const BR = T('<br>', '<br>');

  /* ---- number-pattern rule bank: each maker returns a list (>= 7 terms), a rule text, an optional family name, wrong rules ---- */
  const R = {
    add: (r) => { const d = r.int(2, 9), a = r.int(1, 12); need(a * d !== a + d); return { l: ar(a, d, 9), en: `add ${d} each time`, ms: `tambah ${d} setiap kali`, wr: [T(`add ${d + 1} each time`, `tambah ${d + 1} setiap kali`), T(`add ${d - 1} each time`, `tambah ${d - 1} setiap kali`), T(`multiply by ${d} each time`, `darab dengan ${d} setiap kali`)], d }; },
    sub: (r) => { const d = r.int(2, 9), a = r.int(45, 90); return { l: ar(a, -d, 9), en: `subtract ${d} each time`, ms: `tolak ${d} setiap kali`, wr: [T(`subtract ${d + 1} each time`, `tolak ${d + 1} setiap kali`), T(`subtract ${d - 1} each time`, `tolak ${d - 1} setiap kali`), T(`add ${d} each time`, `tambah ${d} setiap kali`)], d: -d }; },
    neg: (r) => { const d = r.int(3, 8), a = r.int(5, 12); return { l: ar(a, -d, 9), en: `subtract ${d} each time`, ms: `tolak ${d} setiap kali`, wr: [T(`subtract ${d + 1} each time`, `tolak ${d + 1} setiap kali`), T(`subtract ${d - 1} each time`, `tolak ${d - 1} setiap kali`), T(`add ${d} each time`, `tambah ${d} setiap kali`)], d: -d }; },
    odd: (r) => { const s = r.int(0, 8); return { l: ar(2 * s + 1, 2, 9), nm: T('odd numbers', 'nombor ganjil'), en: 'add 2 each time (odd numbers)', ms: 'tambah 2 setiap kali (nombor ganjil)', wr: [T('add 3 each time', 'tambah 3 setiap kali'), T('add 1 each time', 'tambah 1 setiap kali'), T('multiply by 2 each time', 'darab dengan 2 setiap kali')], d: 2 }; },
    even: (r) => { const s = r.int(1, 9); return { l: ar(2 * s, 2, 9), nm: T('even numbers', 'nombor genap'), en: 'add 2 each time (even numbers)', ms: 'tambah 2 setiap kali (nombor genap)', wr: [T('add 4 each time', 'tambah 4 setiap kali'), T('add 1 each time', 'tambah 1 setiap kali'), T('multiply by 2 each time', 'darab dengan 2 setiap kali')], d: 2 }; },
    mult: (r) => { const k = r.int(3, 12), s = r.int(1, 4); return { l: ar(k * s, k, 9), nm: T(`multiples of ${k}`, `gandaan bagi ${k}`), en: `add ${k} each time (multiples of ${k})`, ms: `tambah ${k} setiap kali (gandaan bagi ${k})`, wr: [T(`add ${k + 1} each time`, `tambah ${k + 1} setiap kali`), T(`add ${k - 1} each time`, `tambah ${k - 1} setiap kali`), T(`multiply by ${k} each time`, `darab dengan ${k} setiap kali`)], d: k }; },
    dec: (r) => { const d = r.pick([0.5, 0.25, 1.5, 0.2, 0.4, 0.3]), a = r.pick([0.5, 1, 1.5, 2, 2.5, 3]); return { l: ar(a, d, 8), en: `add ${n(d)} each time`, ms: `tambah ${n(d)} setiap kali`, wr: [T(`add ${n(d * 2)} each time`, `tambah ${n(d * 2)} setiap kali`), T(`add ${n(round(d / 2, 3))} each time`, `tambah ${n(round(d / 2, 3))} setiap kali`), T(`multiply by ${n(d)} each time`, `darab dengan ${n(d)} setiap kali`)], d }; },
    sqr: (r) => { const s = r.int(1, 4); return { l: Array.from({ length: 9 }, (_, i) => (s + i) * (s + i)), nm: T('square numbers', 'nombor kuasa dua sempurna'), en: 'square numbers', ms: 'nombor kuasa dua sempurna', wr: [T('add 3 each time', 'tambah 3 setiap kali'), T('cube numbers', 'nombor kuasa tiga sempurna'), T('multiply by 2 each time', 'darab dengan 2 setiap kali')], sqr: 1 }; },
    cube: () => ({ l: Array.from({ length: 8 }, (_, i) => (i + 1) ** 3), nm: T('cube numbers', 'nombor kuasa tiga sempurna'), en: 'cube numbers', ms: 'nombor kuasa tiga sempurna', wr: [T('square numbers', 'nombor kuasa dua sempurna'), T('multiply by 8 each time', 'darab dengan 8 setiap kali'), T('add 19 each time', 'tambah 19 setiap kali')] }),
    mul: (r) => { const m = r.pick([2, 3, 4, 5]), a = r.int(1, 3); return { l: Array.from({ length: 7 }, (_, i) => a * m ** i), en: `multiply by ${m} each time`, ms: `darab dengan ${m} setiap kali`, wr: [T(`add ${m} each time`, `tambah ${m} setiap kali`), T(`multiply by ${m + 1} each time`, `darab dengan ${m + 1} setiap kali`), T(`add ${a * (m - 1)} each time`, `tambah ${a * (m - 1)} setiap kali`)], m }; },
    div: (r) => { const m = r.pick([2, 3]), a = r.int(1, 4); return { l: Array.from({ length: 7 }, (_, i) => a * m ** (6 - i)), en: `divide by ${m} each time`, ms: `bahagi dengan ${m} setiap kali`, wr: [T(`subtract ${m} each time`, `tolak ${m} setiap kali`), T(`divide by ${m + 1} each time`, `bahagi dengan ${m + 1} setiap kali`), T(`multiply by ${m} each time`, `darab dengan ${m} setiap kali`)], m }; },
    fib: (r) => { const a = r.int(1, 5), b = r.int(1, 5); const l = [a, b]; for (let i = 2; i < 9; i++) l.push(l[i - 1] + l[i - 2]); return { l, nm: T('Fibonacci-type numbers', 'nombor jenis Fibonacci'), en: 'add the two previous terms', ms: 'tambah dua sebutan sebelumnya', wr: [T('add the last term twice', 'tambah sebutan terakhir dua kali'), T('add 2 to the previous term', 'tambah 2 kepada sebutan sebelumnya'), T('multiply the two previous terms', 'darab dua sebutan sebelumnya')], fib: 1 }; },
    tri: () => ({ l: Array.from({ length: 9 }, (_, i) => ((i + 1) * (i + 2)) / 2), nm: T('triangular numbers', 'nombor segi tiga'), en: 'add 2, then 3, then 4, then 5, and so on', ms: 'tambah 2, kemudian 3, kemudian 4, kemudian 5, dan seterusnya', wr: [T('add 2 each time', 'tambah 2 setiap kali'), T('add 3 each time', 'tambah 3 setiap kali'), T('multiply by 2 each time', 'darab dengan 2 setiap kali')], tri: 1 }),
  };
  const RE = ['add', 'sub', 'odd', 'even', 'mult', 'sqr', 'dec'], RM = ['mul', 'div', 'fib', 'sqr', 'cube', 'tri', 'dec', 'sub', 'add', 'neg'], RA = Object.keys(R);
  const pr = (r, ks) => R[r.pick(ks)](r);

  /* ---- figure patterns: every figure is drawn from one internal model, and the count of drawn parts is checked against a*k+b ---- */
  const B = () => {
    const keys = new Set();
    let out = '';
    const q = (v) => Math.round(v * 10);
    return {
      seg(x1, y1, x2, y2) { const a = q(x1) + ',' + q(y1), b = q(x2) + ',' + q(y2); keys.add(a < b ? a + '|' + b : b + '|' + a); out += S.line(x1, y1, x2, y2, { w: 2.2 }); },
      dot(x, y) { keys.add(q(x) + ';' + q(y)); out += S.dot(x, y, 3.4); },
      tile(x, y, s) { keys.add(q(x) + ':' + q(y)); out += S.rect(x, y, s, s, { fill: 'currentColor', op: 0.25 }); },
      raw(s) { out += s; },
      done(w, h) { return { out, w, h, cnt: keys.size }; },
    };
  };
  const hexPts = (cx, y0, s) => { const h = (Math.sqrt(3) / 2) * s; return [[cx, y0], [cx + h, y0 + s / 2], [cx + h, y0 + 1.5 * s], [cx, y0 + 2 * s], [cx - h, y0 + 1.5 * s], [cx - h, y0 + s / 2]]; };
  const mkK = (a, b, intro, noun, grow, draw) => ({ a, b, intro, noun, grow, draw });
  const FK = {
    sq: () => mkK(3, 1, T('a pattern of squares made from matchsticks', 'satu pola segi empat sama yang dibina daripada batang mancis'), T('matchsticks', 'batang mancis'), T('one more square is joined at the end', 'satu lagi segi empat sama disambung di hujung'), (k) => {
      const b = B(), s = 22;
      for (let i = 0; i < k; i++) { b.seg(i * s, 0, (i + 1) * s, 0); b.seg(i * s, s, (i + 1) * s, s); }
      for (let i = 0; i <= k; i++) b.seg(i * s, 0, i * s, s);
      return b.done(k * s, s);
    }),
    tri: () => mkK(2, 1, T('a pattern of triangles made from matchsticks', 'satu pola segi tiga yang dibina daripada batang mancis'), T('matchsticks', 'batang mancis'), T('one more triangle is joined at the end', 'satu lagi segi tiga disambung di hujung'), (k) => {
      const b = B(), s = 26, h = s * 0.866;
      for (let i = 0; i < k; i++) {
        const x = (i * s) / 2, up = i % 2 === 0;
        const P = up ? [[x, h], [x + s, h], [x + s / 2, 0]] : [[x, 0], [x + s, 0], [x + s / 2, h]];
        b.seg(...P[0], ...P[1]); b.seg(...P[1], ...P[2]); b.seg(...P[2], ...P[0]);
      }
      return b.done(((k + 1) * s) / 2, h);
    }),
    hex: () => mkK(5, 1, T('a pattern of hexagons made from matchsticks', 'satu pola heksagon yang dibina daripada batang mancis'), T('matchsticks', 'batang mancis'), T('one more hexagon is joined at the end', 'satu lagi heksagon disambung di hujung'), (k) => {
      const b = B(), s = 14, w = Math.sqrt(3) * s;
      for (let i = 0; i < k; i++) { const P = hexPts(w / 2 + i * w, 0, s); for (let j = 0; j < 6; j++) b.seg(...P[j], ...P[(j + 1) % 6]); }
      return b.done(k * w, 2 * s);
    }),
    tab: () => mkK(2, 2, T('tables (squares) pushed together in a row, with a chair (dot) at each free side', 'meja (segi empat sama) yang dirapatkan dalam satu baris, dengan sebuah kerusi (titik) pada setiap sisi yang kosong'), T('chairs', 'kerusi'), T('one more table is added, giving two more chairs', 'satu lagi meja ditambah, memberi dua lagi kerusi'), (k) => {
      const b = B(), s = 22;
      for (let i = 0; i < k; i++) { b.raw(S.rect(10 + i * s, 10, s, s)); b.dot(10 + i * s + s / 2, 3); b.dot(10 + i * s + s / 2, 10 + s + 7); }
      b.dot(3, 10 + s / 2); b.dot(10 + k * s + 7, 10 + s / 2);
      return b.done(k * s + 20, s + 20);
    }),
    L: () => mkK(2, -1, T('an L-shaped pattern of dots', 'satu pola titik berbentuk L'), T('dots', 'titik'), T('one more dot is added to each arm of the L', 'satu lagi titik ditambah pada setiap lengan L'), (k) => {
      const b = B(), d = 14;
      for (let j = 0; j < k; j++) b.dot(5, 5 + j * d);
      for (let j = 1; j < k; j++) b.dot(5 + j * d, 5 + (k - 1) * d);
      return b.done((k - 1) * d + 10, (k - 1) * d + 10);
    }),
    plus: () => mkK(4, 1, T('a cross-shaped pattern of dots', 'satu pola titik berbentuk palang'), T('dots', 'titik'), T('each of the four arms gets one more dot', 'setiap satu daripada empat lengan mendapat satu lagi titik'), (k) => {
      const b = B(), d = 13, c = 5 + k * d;
      b.dot(c, c);
      for (let t = 1; t <= k; t++) { b.dot(c + t * d, c); b.dot(c - t * d, c); b.dot(c, c + t * d); b.dot(c, c - t * d); }
      return b.done(2 * k * d + 10, 2 * k * d + 10);
    }),
    frm: () => mkK(4, 4, T('square pools (white) surrounded by a border of square tiles (shaded)', 'kolam segi empat sama (putih) yang dikelilingi sempadan jubin segi empat sama (berlorek)'), T('tiles', 'jubin'), T('the pool becomes one tile longer on each side', 'kolam menjadi satu jubin lebih panjang pada setiap sisi'), (k) => {
      const b = B(), c = 12;
      for (let i = 0; i < k + 2; i++) for (let j = 0; j < k + 2; j++) if (i === 0 || j === 0 || i === k + 1 || j === k + 1) b.tile(i * c, j * c, c);
      return b.done((k + 2) * c, (k + 2) * c);
    }),
    arr: (r) => { const m = r.int(2, 4); return mkK(m, 0, T(`an array of dots with ${m} rows`, `satu tatasusunan titik dengan ${m} baris`), T('dots', 'titik'), T('one more column of dots is added', 'satu lagi lajur titik ditambah'), (k) => {
      const b = B(), d = 14;
      for (let i = 0; i < m; i++) for (let j = 0; j < k; j++) b.dot(5 + j * d, 5 + i * d);
      return b.done((k - 1) * d + 10, (m - 1) * d + 10);
    }); },
  };
  const FKS = Object.keys(FK);
  const mkFig = (r, ks) => { const kd = r.pick(ks || FKS), p = FK[kd](r); p.k = kd; return p; };
  /** the drawn figures numbered ks as one SVG (labels in EN / MS) */
  const figL = (p, ks) => {
    const ds = ks.map((k) => { const d = p.draw(k); need(d.cnt === p.a * k + p.b); return d; });
    const H = Math.max(...ds.map((d) => d.h)), gap = 22;
    const build = (lab) => {
      let x = 6, o = '';
      ds.forEach((d, i) => { o += `<g transform="translate(${x},${4 + H - d.h})">${d.out}</g>` + S.text(x + d.w / 2, H + 18, `${lab} ${ks[i]}`, { s: 11 }); x += d.w + gap; });
      return S.wrap(x - gap + 6, H + 28, o, 'pattern');
    };
    return T(build('Fig.'), build('Rajah'));
  };
  const fN = (p, k) => p.a * k + p.b;
  const asEnd = (l) => T(`Figure ${l}`, `Rajah ${l}`);

  /* ---- cycles (repeating patterns) ---- */
  const CY = [
    { en: ['circle', 'triangle', 'square'], ms: ['bulatan', 'segi tiga', 'segi empat sama'], thing: T('shapes', 'bentuk') },
    { en: ['red', 'blue', 'green'], ms: ['merah', 'biru', 'hijau'], thing: T('beads on a necklace', 'manik pada seutas rantai') },
    { en: ['red', 'yellow', 'blue', 'green'], ms: ['merah', 'kuning', 'biru', 'hijau'], thing: T('flags in a row', 'bendera dalam satu baris') },
    { en: ['star', 'moon', 'sun'], ms: ['bintang', 'bulan', 'matahari'], thing: T('stickers', 'pelekat') },
    { en: ['A', 'B', 'C', 'D', 'E'], ms: ['A', 'B', 'C', 'D', 'E'], thing: T('letters', 'huruf') },
    { en: ['Ali', 'Siti', 'Kumar'], ms: ['Ali', 'Siti', 'Kumar'], thing: T('pupils standing in a queue and counting off', 'murid berbaris dan mengira secara berulang') },
    { en: ['white', 'black'], ms: ['putih', 'hitam'], thing: T('tiles on a floor', 'jubin pada lantai') },
    { en: ['circle', 'square', 'circle', 'triangle'], ms: ['bulatan', 'segi empat sama', 'bulatan', 'segi tiga'], thing: T('shapes', 'bentuk') },
  ];

  /* ---- everyday contexts for a constant-difference change: intro, thing asked, "at step k" ---- */
  const CX = [
    { i: (a, d) => T(`A plant is ${a} cm tall at the end of week 1 and grows ${d} cm every week`, `Sebatang pokok setinggi ${a} cm pada akhir minggu pertama dan tumbuh ${d} cm setiap minggu`), w: T('the height of the plant', 'tinggi pokok itu'), at: (k) => T(`at the end of week ${k}`, `pada akhir minggu ke-${k}`), u: ['', ' cm'], a: [10, 30], d: [2, 5] },
    { i: (a, d) => T(`Aina has RM${a} in her savings box in week 1 and adds RM${d} every week`, `Aina mempunyai RM${a} dalam tabung pada minggu pertama dan menambah RM${d} setiap minggu`), w: T('her savings', 'simpanannya'), at: (k) => T(`in week ${k}`, `pada minggu ke-${k}`), u: ['RM', ''], a: [8, 25], d: [2, 6] },
    { i: (a, d) => T(`A water tank holds ${a} litres at 8 a.m. and loses ${d} litres every hour`, `Sebuah tangki air mengandungi ${a} liter pada pukul 8 pagi dan kehilangan ${d} liter setiap jam`), w: T('the volume of water', 'isi padu air'), at: (k) => T(`after ${k - 1} hours`, `selepas ${k - 1} jam`), u: ['', ' litres'], a: [150, 300], d: [10, 25], dec: 1 },
    { i: (a, d) => T(`There are ${a} seats in the first row of a hall and each row has ${d} more seats than the row in front`, `Terdapat ${a} tempat duduk pada baris pertama sebuah dewan dan setiap baris mempunyai ${d} tempat duduk lebih daripada baris di hadapannya`), w: T('the number of seats', 'bilangan tempat duduk'), at: (k) => T(`in row ${k}`, `pada baris ke-${k}`), u: ['', ' seats'], a: [10, 20], d: [2, 4] },
    { i: (a, d) => T(`Hafiz reads ${a} pages on Monday and ${d} more pages each day than the day before`, `Hafiz membaca ${a} halaman pada hari Isnin dan ${d} halaman lebih setiap hari berbanding hari sebelumnya`), w: T('the number of pages he reads', 'bilangan halaman yang dibacanya'), at: (k) => T(`on day ${k} (Monday is day 1)`, `pada hari ke-${k} (Isnin ialah hari ke-1)`), u: ['', ' pages'], a: [5, 15], d: [3, 6] },
    { i: (a, d) => T(`The first step of a staircase is ${a} cm above the floor and every next step is ${d} cm higher`, `Anak tangga pertama sebuah tangga berada ${a} cm dari lantai dan setiap anak tangga seterusnya ${d} cm lebih tinggi`), w: T('the height of the step above the floor', 'tinggi anak tangga dari lantai'), at: (k) => T(`step ${k}`, `anak tangga ke-${k}`), u: ['', ' cm'], a: [15, 25], d: [15, 20] },
    { i: (a, d) => T(`A car has ${a} litres of petrol at the start and uses ${d} litres on every trip`, `Sebuah kereta mempunyai ${a} liter petrol pada permulaan dan menggunakan ${d} liter setiap perjalanan`), w: T('the petrol left', 'petrol yang tinggal'), at: (k) => T(`after ${k - 1} trips`, `selepas ${k - 1} perjalanan`), u: ['', ' litres'], a: [50, 70], d: [3, 5], dec: 1 },
    { i: (a, d) => T(`The bottom layer of a stack of tins has ${a} tins and each layer above has ${d} fewer tins`, `Lapisan bawah satu timbunan tin mengandungi ${a} biji tin dan setiap lapisan di atasnya mempunyai ${d} biji tin lebih sedikit`), w: T('the number of tins', 'bilangan tin'), at: (k) => T(`in layer ${k} (the bottom layer is layer 1)`, `dalam lapisan ke-${k} (lapisan bawah ialah lapisan ke-1)`), u: ['', ' tins'], a: [28, 40], d: [2, 3], dec: 1 },
    { i: (a, d) => T(`Farid's monthly pocket money is RM${a} in January and rises by RM${d} each month`, `Wang saku bulanan Farid ialah RM${a} pada Januari dan naik sebanyak RM${d} setiap bulan`), w: T('his pocket money', 'wang sakunya'), at: (k) => T(`in month ${k} (January is month 1)`, `pada bulan ke-${k} (Januari ialah bulan ke-1)`), u: ['RM', ''], a: [20, 50], d: [2, 5] },
    { i: (a, d) => T(`A bus leaves the terminal at ${a} minutes past 6 a.m. and then every ${d} minutes`, `Sebuah bas bertolak dari terminal pada ${a} minit selepas pukul 6 pagi dan seterusnya setiap ${d} minit`), w: T('the number of minutes after 6 a.m. that the bus leaves', 'bilangan minit selepas pukul 6 pagi bas itu bertolak'), at: (k) => T(`for the ${ordE(k)} bus`, `bagi bas ${ke(k)}`), u: ['', ' minutes'], a: [5, 15], d: [10, 20] },
  ];
  /** draws a context: returns {i, w, at(k), val(k), fmt(v), a, d, dec} */
  const cx = (r, k) => {
    const c = r.pick(CX), d = r.int(c.d[0], c.d[1]), a = r.int(c.a[0], c.a[1]);
    const sgn = c.dec ? -1 : 1, val = (j) => a + sgn * d * (j - 1);
    need(val(Math.max(k || 1, 1)) > 0);
    return { c, i: c.i(a, d), w: c.w, at: c.at, val, a, d, dec: !!c.dec, fmt: (v) => T(c.u[0] + n(v) + c.u[1].replace(/^ /, ' '), c.u[0] + n(v) + c.u[1]) };
  };
  const fmtU = (c, v) => T(`${c.c.u[0]}${n(v)}${c.c.u[1]}`, `${c.c.u[0]}${n(v)}${c.c.u[1].replace('seats', 'tempat duduk').replace('pages', 'halaman').replace('litres', 'liter').replace('tins', 'biji tin').replace('minutes', 'minit')}`);
  const numText = (l, ks) => l.map((v, i) => (ks.includes(i) ? '\\square' : n(v))).join(',\\ ');

  /* ================================================================ F2-1.1 Patterns */
  const named = (rule) => (rule.nm ? T(` These are ${rule.nm.en}.`, ` Nombor ini ialah ${rule.nm.ms}.`) : T(''));
  const ruleAns = (rule, x) => T(`${x} (rule: ${rule.en})`, `${x} (peraturan: ${rule.ms})`);
  const cxQ = (c, k) => T(`${c.i.en}. Find ${c.w.en} ${c.at(k).en}.`, `${c.i.ms}. Cari ${c.w.ms} ${c.at(k).ms}.`);
  const sepL = (l) => l.map(n).join(', ');
  const ge11 = [
    /* fill in the blanks, three positions */
    (r) => {
      const rule = pr(r, RE), pos = r.pick(['end', 'mid', 'start']), l = rule.l.slice(0, 6);
      const idx = pos === 'end' ? [4, 5] : pos === 'mid' ? [r.int(2, 3)] : [0];
      const stem = { end: T('Complete the pattern:', 'Lengkapkan pola:'), mid: T('Fill in the missing number in the pattern:', 'Isikan nombor yang hilang dalam pola:'), start: T('Find the number missing at the start of the pattern:', 'Cari nombor yang hilang pada permulaan pola:') }[pos];
      const nmd = r.chance() ? named(rule) : T('');
      return { q: cat(stem, T(` $${numText(l, idx)}$.`), nmd), a: ruleAns(rule, `$${sq(idx.map((i) => l[i]))}$`), sp: 'xs' };
    },
    /* rule stated -> write the terms */
    (r) => {
      const rule = pr(r, ['add', 'sub', 'dec', 'add', 'sub']), l = rule.l, N = r.pick([5, 6]);
      const form = r.int(0, 2);
      const q = [T(`Write the first ${N} numbers of a pattern which starts at ${n(l[0])} and where you ${rule.en}.`, `Tulis ${N} nombor pertama bagi satu pola yang bermula pada ${n(l[0])} dan di mana anda ${rule.ms}.`),
        T(`A pattern begins with ${n(l[0])}. The rule is: ${rule.en}. List the first ${N} terms.`, `Satu pola bermula dengan ${n(l[0])}. Peraturannya ialah: ${rule.ms}. Senaraikan ${N} sebutan pertama.`),
        T(`Start at ${n(l[0])} and ${rule.en}. Write down the numbers you get until you have ${N} numbers.`, `Mulakan pada ${n(l[0])} dan ${rule.ms}. Tuliskan nombor yang anda perolehi sehingga anda mempunyai ${N} nombor.`)][form];
      return { q, a: T(`$${sq(l.slice(0, N))}$`), sp: 'xs' };
    },
    /* next two / three numbers */
    (r) => {
      const rule = pr(r, RE), N = r.pick([2, 3]), l = rule.l, sh = r.int(4, 5);
      const w = N === 2 ? ['two', 'dua'] : ['three', 'tiga'];
      return { q: cat(T(`Write the next ${w[0]} numbers in the pattern $${dots(l.slice(0, sh))}$.`, `Tulis ${w[1]} nombor berikutnya dalam pola $${dots(l.slice(0, sh))}$.`), r.chance() ? named(rule) : T('')), a: ruleAns(rule, `$${sq(l.slice(sh, sh + N))}$`), sp: 'xs' };
    },
    /* which rule describes the pattern (MCQ) */
    (r) => {
      const rule = pr(r, ['add', 'sub', 'odd', 'even', 'mult', 'dec']), l = rule.l.slice(0, 5);
      const o = mc(r, T(rule.en, rule.ms), rule.wr, '<br>');
      return { q: cat(T(`Which rule describes the number pattern $${dots(l)}$?<br>`, `Peraturan yang manakah menerangkan pola nombor $${dots(l)}$?<br>`), o.q), a: o.a, sp: 's' };
    },
    /* true / false rule statement */
    (r) => {
      const rule = pr(r, ['add', 'sub', 'mult', 'dec']), l = rule.l.slice(0, 5), ok = r.chance();
      const shown = ok ? T(rule.en, rule.ms) : rule.wr[r.int(0, 1)];
      return { q: T(`The number pattern $${dots(l)}$ is made by the rule "${shown.en}". True or false? If it is false, write the correct rule.`, `Pola nombor $${dots(l)}$ dibentuk dengan peraturan "${shown.ms}". Betul atau salah? Jika salah, tulis peraturan yang betul.`), a: ok ? T('True', 'Betul') : T(`False. The correct rule is: ${rule.en}.`, `Salah. Peraturan yang betul ialah: ${rule.ms}.`), sp: 's' };
    },
    /* one number is wrong */
    (r) => {
      const rule = pr(r, ['add', 'sub', 'odd', 'even', 'mult', 'dec']), l = rule.l.slice(0, 7), i = r.int(2, 5);
      const bad = round(l[i] + r.pick([-2, -1, 1, 2]), 6), shown = l.map((v, j) => (j === i ? bad : v));
      const st = r.chance();
      return { q: T(`One number in the pattern $${sq(shown)}$ has been written wrongly${st ? `; the pattern should ${rule.en}` : ''}. Find the wrong number and write the correct one.`, `Satu nombor dalam pola $${sq(shown)}$ telah ditulis dengan salah${st ? `; pola itu sepatutnya ${rule.ms}` : ''}. Cari nombor yang salah itu dan tulis nombor yang betul.`), a: T(`${n(bad)} should be ${n(l[i])}`, `${n(bad)} sepatutnya ${n(l[i])}`), sp: 's' };
    },
    /* table of position / number */
    (r) => {
      const rule = pr(r, ['add', 'sub', 'odd', 'even', 'mult']), l = rule.l.slice(0, 5), bl = r.chance() ? [3, 4] : [1, 3];
      const row = (lab, v) => [lab].concat(v);
      const mk = (a, b) => SPM.table([row(a, [1, 2, 3, 4, 5]), row(b, l.map((v, i) => (bl.includes(i) ? '?' : n(v))))], { rowHead: true });
      return { q: T(`Study the table and fill in each ? with the correct number.<br>${mk('Position', 'Number')}`, `Kaji jadual itu dan isikan setiap ? dengan nombor yang betul.<br>${mk('Kedudukan', 'Nombor')}`), a: ruleAns(rule, `$${sq(bl.map((i) => l[i]))}$`), sp: 's' };
    },
    /* everyday context, continue by adding */
    (r) => { const k = r.int(4, 6), c = cx(r, k); return { q: cxQ(c, k), a: T(`${fmtU(c, c.val(k)).en}`, fmtU(c, c.val(k)).ms), w: T(`Keep ${c.dec ? 'subtracting' : 'adding'} ${c.d} until you reach step ${k}.`, `Teruskan ${c.dec ? 'menolak' : 'menambah'} ${c.d} sehingga langkah ke-${k}.`), sp: 's' }; },
    /* multiples */
    (r) => {
      const k = r.int(3, 12), v = r.int(0, 2);
      if (v === 0) { const N = r.pick([5, 6]); return { q: T(`Write the first ${N} multiples of ${k}. What is the difference between two consecutive multiples?`, `Tulis ${N} gandaan pertama bagi ${k}. Apakah beza antara dua gandaan yang berturutan?`), a: T(`$${sq(ar(k, k, N))}$; difference ${k}`, `$${sq(ar(k, k, N))}$; beza ${k}`), sp: 's' }; }
      if (v === 1) { const mult = r.sample(ar(1, 1, 12).map((x) => x * k), 3), oth = r.sample(ar(1, 1, 60).filter((x) => x % k && x < 12 * k), 3), all = r.shuffle(mult.concat(oth)); return { q: T(`From the numbers $${sq(all)}$, list all the multiples of ${k}.`, `Daripada nombor $${sq(all)}$, senaraikan semua gandaan bagi ${k}.`), a: T(`$${sq(all.filter((x) => x % k === 0).sort((x, y) => x - y))}$`), sp: 's' }; }
      const N = k * r.int(4, 9) + r.int(1, k - 1); const f = Math.ceil(N / k) * k;
      return { q: T(`Continue counting in ${k}s: $${sq(ar(k, k, 4))},\\ \\ldots$ What is the first multiple of ${k} that is greater than ${N}?`, `Teruskan mengira dalam ${k}: $${sq(ar(k, k, 4))},\\ \\ldots$ Apakah gandaan pertama bagi ${k} yang lebih besar daripada ${N}?`), a: T(`$${f}$`), sp: 's' };
    },
    /* factors */
    (r) => {
      const N = r.pick([12, 16, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48]), fs = SPM.factors(N);
      if (r.chance()) { const pairs = fs.filter((x) => x * x <= N).map((x) => `${x} \\times ${N / x}`); return { q: T(`Write ${N} as a product of two numbers in as many ways as you can, starting with $1 \\times ${N}$.`, `Tulis ${N} sebagai hasil darab dua nombor dalam sebanyak cara yang anda boleh, bermula dengan $1 \\times ${N}$.`), a: T(`$${pairs.join(',\\ ')}$; factors: $${sq(fs)}$`, `$${pairs.join(',\\ ')}$; faktor: $${sq(fs)}$`), sp: 's' }; }
      const cand = [2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x < N), ch = r.sample(cand, 5).sort((x, y) => x - y);
      return { q: T(`Which of the numbers $${sq(ch)}$ are factors of ${N}?`, `Antara nombor $${sq(ch)}$, yang manakah faktor bagi ${N}?`), a: T(`$${sq(ch.filter((x) => N % x === 0)) || '-'}$`), sp: 's' };
    },
    /* odd / even */
    (r) => {
      const v = r.int(0, 3);
      if (v === 0) { const k = r.int(0, 20) * 2 + 1; return { q: T(`Write the next three odd numbers after ${k}.`, `Tulis tiga nombor ganjil berikutnya selepas ${k}.`), a: T(`$${sq(ar(k + 2, 2, 3))}$`), sp: 'xs' }; }
      if (v === 1) { const a = r.int(2, 12) * 2 + 1, b = a + 2 * r.int(4, 6); return { q: T(`List all the even numbers between ${a} and ${b}.`, `Senaraikan semua nombor genap antara ${a} dan ${b}.`), a: T(`$${sq(ar(a + 1, 2, (b - a - 1) / 2))}$`), sp: 's' }; }
      if (v === 2) { const st = r.shuffle([['odd + odd', 'ganjil + ganjil', 'even', 'genap'], ['odd + even', 'ganjil + genap', 'odd', 'ganjil'], ['even + even', 'genap + genap', 'even', 'genap'], ['odd × odd', 'ganjil × ganjil', 'odd', 'ganjil'], ['even × odd', 'genap × ganjil', 'even', 'genap']]).slice(0, 3);
        return { q: T(`Try two examples for each and complete: ${st.map((x) => `<b>${x[0]}</b> is always \\_\\_\\_\\_`).join('; ')}.`, `Cuba dua contoh bagi setiap satu dan lengkapkan: ${st.map((x) => `<b>${x[1]}</b> sentiasa \\_\\_\\_\\_`).join('; ')}.`), a: T(st.map((x) => x[2]).join('; '), st.map((x) => x[3]).join('; ')), sp: 's' }; }
      const k = r.int(3, 9);
      return { q: T(`(a) Write the first ${k} odd numbers. (b) Write the first ${k} even numbers. (c) What is the difference between the ${ordE(k)} even number and the ${ordE(k)} odd number?`, `(a) Tulis ${k} nombor ganjil yang pertama. (b) Tulis ${k} nombor genap yang pertama. (c) Apakah beza antara nombor genap ${ke(k)} dengan nombor ganjil ${ke(k)}?`), a: T(`(a) $${sq(ar(1, 2, k))}$ (b) $${sq(ar(2, 2, k))}$ (c) $1$`), sp: 'm' };
    },
    /* square and cube numbers, basics */
    (r) => {
      const v = r.int(0, 3);
      if (v === 0) { const N = r.int(5, 8); return { q: T(`Write the first ${N} square numbers.`, `Tulis ${N} nombor kuasa dua sempurna yang pertama.`), a: T(`$${sq(Array.from({ length: N }, (_, i) => (i + 1) ** 2))}$`), sp: 's' }; }
      if (v === 1) { const sqs = r.sample([4, 9, 16, 25, 36, 49, 64, 81], 3), non = r.sample([8, 12, 20, 24, 30, 40, 50, 72], 3), all = r.shuffle(sqs.concat(non)); return { q: T(`Which of the numbers $${sq(all)}$ are square numbers?`, `Antara nombor $${sq(all)}$, yang manakah nombor kuasa dua sempurna?`), a: T(`$${sq(sqs.sort((x, y) => x - y))}$`), sp: 's' }; }
      if (v === 2) { const k = r.int(5, 9); return { q: T(`Complete the pattern: $1^2 = 1,\\ 2^2 = 4,\\ 3^2 = 9,\\ \\ldots,\\ ${k}^2 = \\square$. What is $${k + 1}^2$?`, `Lengkapkan pola: $1^2 = 1,\\ 2^2 = 4,\\ 3^2 = 9,\\ \\ldots,\\ ${k}^2 = \\square$. Apakah $${k + 1}^2$?`), a: T(`$${k * k}$; $${(k + 1) ** 2}$`), sp: 's' }; }
      const k = r.int(3, 6);
      return { q: T(`Complete: $1^3 = 1,\\ 2^3 = 8,\\ \\ldots,\\ ${k}^3 = \\square,\\ ${k + 1}^3 = \\square$.`, `Lengkapkan: $1^3 = 1,\\ 2^3 = 8,\\ \\ldots,\\ ${k}^3 = \\square,\\ ${k + 1}^3 = \\square$.`), a: T(`$${k ** 3},\\ ${(k + 1) ** 3}$`), sp: 's' };
    },
    /* figure, easy */
    (r) => {
      const p = mkFig(r, ['sq', 'tri', 'tab', 'L', 'plus', 'arr']), ks = [1, 2, 3], k = 4;
      const v = r.int(0, 1);
      const inv = `The diagram shows ${p.intro.en}.`, invM = `Rajah menunjukkan ${p.intro.ms}.`;
      return v === 0 ? { q: T(`${inv} How many ${p.noun.en} are there in Figure 4?`, `${invM} Berapakah bilangan ${p.noun.ms} dalam Rajah 4?`), fig: figL(p, ks), a: T(`${fN(p, k)}`), w: T(`Each figure has ${p.a} more ${p.noun.en}: ${p.grow.en}.`, `Setiap rajah mempunyai ${p.a} ${p.noun.ms} lebih banyak: ${p.grow.ms}.`), sp: 'm' }
        : { q: T(`${inv} How many more ${p.noun.en} are in Figure 3 than in Figure 2?`, `${invM} Berapa banyak lagi ${p.noun.ms} dalam Rajah 3 berbanding Rajah 2?`), fig: figL(p, ks), a: T(`${p.a}`), sp: 's' };
    },
    /* repeating shapes, easy */
    (r) => {
      const c = r.pick(CY), L = c.en.length, rep = 2, shown = L * rep + r.int(0, L - 2), v = r.int(0, 1);
      const nm = (lang, i) => c[lang][i % L], list = (lang) => Array.from({ length: shown }, (_, i) => nm(lang, i)).join(', ');
      return v === 0 ? { q: T(`${c.thing.en.charAt(0).toUpperCase() + c.thing.en.slice(1)} are arranged in a repeating pattern: ${list('en')}, … What comes next?`, `${c.thing.ms.charAt(0).toUpperCase() + c.thing.ms.slice(1)} disusun dalam pola berulang: ${list('ms')}, … Apakah yang berikutnya?`), a: T(nm('en', shown), nm('ms', shown)), sp: 'xs' }
        : { q: T(`${c.thing.en.charAt(0).toUpperCase() + c.thing.en.slice(1)} follow a repeating pattern: ${list('en')}, … How many items are in one complete repeating group?`, `${c.thing.ms.charAt(0).toUpperCase() + c.thing.ms.slice(1)} mengikut pola berulang: ${list('ms')}, … Berapakah bilangan item dalam satu kumpulan pengulangan yang lengkap?`), a: T(`${L} (${c.en.slice(0, L).join(', ')})`, `${L} (${c.ms.slice(0, L).join(', ')})`), sp: 'xs' };
    },
    /* count on / back */
    (r) => {
      const d = r.int(2, 9), back = r.chance(), a = back ? d * r.int(6, 10) : d * r.int(1, 4), l = ar(a, back ? -d : d, 7);
      return { q: T(`Count ${back ? 'backwards' : 'forwards'} in ${d}s: $${sq(l.slice(0, 3))},\\ \\square,\\ \\square,\\ \\square$. Fill in the boxes.`, `Kira ${back ? 'ke belakang' : 'ke hadapan'} dalam ${d}: $${sq(l.slice(0, 3))},\\ \\square,\\ \\square,\\ \\square$. Isikan petak-petak itu.`), a: T(`$${sq(l.slice(3, 6))}$`), sp: 'xs' };
    },
    /* true / false statements about numbers */
    (r) => {
      const st = [];
      const k = r.int(2, 9), M = k * r.int(2, 9) + (r.chance() ? 0 : r.int(1, k - 1));
      st.push([T(`${M} is a multiple of ${k}`, `${M} ialah gandaan bagi ${k}`), M % k === 0]);
      const Q = r.pick([16, 25, 36, 49, 64, 81, 20, 30, 45, 50]);
      st.push([T(`${Q} is a square number`, `${Q} ialah nombor kuasa dua sempurna`), Math.sqrt(Q) % 1 === 0]);
      const O = r.int(10, 99);
      st.push([T(`${O} is an ${O % 2 ? 'odd' : 'even'} number`, `${O} ialah nombor ${O % 2 ? 'ganjil' : 'genap'}`), true]);
      const O2 = r.int(10, 99);
      st.push([T(`${O2} is an ${O2 % 2 ? 'even' : 'odd'} number`, `${O2} ialah nombor ${O2 % 2 ? 'genap' : 'ganjil'}`), false]);
      const F = r.pick([12, 18, 20, 24, 30]), f = r.int(2, 9);
      st.push([T(`${f} is a factor of ${F}`, `${f} ialah faktor bagi ${F}`), F % f === 0]);
      const rule = pr(r, ['add', 'sub']), l = rule.l, x = r.chance() ? l[4] : l[4] + 1;
      st.push([T(`the next number in $${dots(l.slice(0, 4))}$ is ${n(x)}`, `nombor berikutnya dalam $${dots(l.slice(0, 4))}$ ialah ${n(x)}`), x === l[4]]);
      const pick = r.sample(st, 3);
      return { q: T(`Write true or false for each statement. (a) ${pick[0][0].en}. (b) ${pick[1][0].en}. (c) ${pick[2][0].en}.`, `Tulis betul atau salah bagi setiap pernyataan. (a) ${pick[0][0].ms}. (b) ${pick[1][0].ms}. (c) ${pick[2][0].ms}.`), a: T(pick.map((x, i) => `(${'abc'[i]}) ${x[1] ? 'True' : 'False'}`).join(' '), pick.map((x, i) => `(${'abc'[i]}) ${x[1] ? 'Betul' : 'Salah'}`).join(' ')), sp: 's' };
    },
  ];

  const DB = [
    (r) => { const a = r.int(2, 9), k = r.int(4, 7); return [T(`A colony has ${a} bacteria. The number of bacteria doubles every hour. How many bacteria are there after ${k} hours?`, `Satu koloni mempunyai ${a} bakteria. Bilangan bakteria berganda setiap jam. Berapakah bilangan bakteria selepas ${k} jam?`), (m) => a * m ** k, 2, k, a]; },
    (r) => { const k = r.int(4, 8); return [T(`A long strip of paper is folded in half again and again. After 1 fold it has 2 layers, and each fold doubles the number of layers. How many layers are there after ${k} folds?`, `Sehelai kertas panjang dilipat separuh berulang kali. Selepas 1 lipatan ia mempunyai 2 lapisan, dan setiap lipatan menggandakan bilangan lapisan. Berapakah bilangan lapisan selepas ${k} lipatan?`), (m) => 1 * m ** k, 2, k, 1]; },
    (r) => { const k = r.int(3, 5), a = r.int(1, 4) * 5; return [T(`Every day the number of people who know a rumour triples. On day 1, ${a} people know it. How many people know it on day ${k + 1}?`, `Setiap hari bilangan orang yang mengetahui sesuatu khabar angin menjadi tiga kali ganda. Pada hari pertama, ${a} orang mengetahuinya. Berapakah bilangan orang yang mengetahuinya pada hari ke-${k + 1}?`), (m) => a * m ** k, 3, k, a]; },
    (r) => { const k = r.int(3, 5), H = r.int(1, 4) * 2 ** k * 5; return [T(`A ball dropped from a height of ${H} cm rebounds to half of its previous height each time. What is the height of the ${ordE(k)} rebound?`, `Sebiji bola dijatuhkan dari ketinggian ${H} cm dan melantun ke separuh daripada ketinggian sebelumnya setiap kali. Berapakah ketinggian lantunan ${ke(k)}?`), (m) => H / m ** k, 0.5, k, H]; },
    (r) => { const k = r.int(3, 6), a = r.int(2, 5); return [T(`A tree has ${a} branches. Every year each branch splits into 2 new branches. How many branches are there after ${k} years?`, `Sebatang pokok mempunyai ${a} dahan. Setiap tahun setiap dahan bercabang kepada 2 dahan baharu. Berapakah bilangan dahan selepas ${k} tahun?`), (m) => a * m ** k, 2, k, a]; },
  ];
  const facts = (r) => {
    const v = r.int(0, 5), rep = (i) => Number('123456789'.slice(0, i));
    if (v === 0) {
      const m = r.pick([8, 9]), ad = (i) => (m === 8 ? i : i + 1), line = (i) => [`${rep(i)} \\times ${m} + ${ad(i)}`, rep(i) * m + ad(i)], t = r.int(5, 7);
      const exp = m === 8 ? Number('987654321'.slice(0, t)) : Number('1'.repeat(t + 1));
      need(line(t)[1] === exp);
      return { q: T(`Study the pattern: $${[1, 2, 3].map((i) => line(i)[0] + ' = ' + line(i)[1]).join(',\\ ')}$. Write the line for ${ordE(t)} row and check it with a calculation.`, `Kaji pola ini: $${[1, 2, 3].map((i) => line(i)[0] + ' = ' + line(i)[1]).join(',\\ ')}$. Tulis baris ${ke(t)} dan semak dengan pengiraan.`), a: T(`$${line(t)[0]} = ${exp}$`), sp: 'm' };
    }
    if (v === 1) {
      const t = r.int(5, 7), one = (i) => Number('1'.repeat(i)), res = (i) => Number('123456789'.slice(0, i) + '987654321'.slice(9 - i + 1));
      need(one(t) * one(t) === res(t));
      return { q: T(`Study: $${[2, 3, 4].map((i) => `${one(i)}^2 = ${one(i) ** 2}`).join(',\\ ')}$. Predict $${one(t)}^2$ from the pattern.`, `Kaji: $${[2, 3, 4].map((i) => `${one(i)}^2 = ${one(i) ** 2}`).join(',\\ ')}$. Ramalkan $${one(t)}^2$ daripada pola itu.`), a: T(`$${one(t) ** 2}$`), sp: 's' };
    }
    if (v === 2) {
      const ks = r.sample([2, 3, 4, 5, 6, 7, 8], 4).sort((a, b) => a - b), k = r.pick([2, 3, 4, 5, 6, 7, 8, 9]);
      const ds = (x) => String(x).split('').reduce((s, c) => s + Number(c), 0);
      return { q: T(`Find $9 \\times ${ks[0]}$, $9 \\times ${ks[1]}$ and $9 \\times ${ks[2]}$ and add the digits of each answer. What do you notice? Use it to predict the sum of the digits of $9 \\times ${k}$.`, `Cari $9 \\times ${ks[0]}$, $9 \\times ${ks[1]}$ dan $9 \\times ${ks[2]}$ dan tambah digit bagi setiap jawapan. Apakah yang anda perhatikan? Gunakannya untuk meramal hasil tambah digit bagi $9 \\times ${k}$.`), a: T(`Digit sums: ${ks.slice(0, 3).map((x) => ds(9 * x)).join(', ')}, always 9; $9 \\times ${k} = ${9 * k}$, digit sum ${ds(9 * k)}`, `Hasil tambah digit: ${ks.slice(0, 3).map((x) => ds(9 * x)).join(', ')}, sentiasa 9; $9 \\times ${k} = ${9 * k}$, hasil tambah digit ${ds(9 * k)}`), sp: 'm' };
    }
    if (v === 3) {
      const t = r.int(8, 15);
      return { q: T(`Study the pattern: $2^2 - 1^2 = 3,\\ 3^2 - 2^2 = 5,\\ 4^2 - 3^2 = 7$. Use it to write the line for $${t}^2 - ${t - 1}^2$ and give its value.`, `Kaji pola ini: $2^2 - 1^2 = 3,\\ 3^2 - 2^2 = 5,\\ 4^2 - 3^2 = 7$. Gunakannya untuk menulis baris bagi $${t}^2 - ${t - 1}^2$ dan beri nilainya.`), a: T(`$${t}^2 - ${t - 1}^2 = ${t * t - (t - 1) * (t - 1)}$`), sp: 's' };
    }
    if (v === 4) {
      const k = r.int(7, 14);
      return { q: T(`Study: $1 = 1^2,\\ 1 + 3 = 2^2,\\ 1 + 3 + 5 = 3^2$. Use the pattern to find the sum of the first ${k} odd numbers.`, `Kaji: $1 = 1^2,\\ 1 + 3 = 2^2,\\ 1 + 3 + 5 = 3^2$. Gunakan pola itu untuk mencari hasil tambah ${k} nombor ganjil pertama.`), a: T(`$${k}^2 = ${k * k}$`), sp: 's' };
    }
    const k = r.int(4, 6), tot = Array.from({ length: k }, (_, i) => (i + 1) ** 3).reduce((s, x) => s + x, 0), tr = (k * (k + 1)) / 2;
    need(tot === tr * tr);
    return { q: T(`Study: $1^3 = 1^2,\\ 1^3 + 2^3 = 3^2,\\ 1^3 + 2^3 + 3^3 = 6^2$. Write the line for $1^3 + 2^3 + \\ldots + ${k}^3$ and find its value.`, `Kaji: $1^3 = 1^2,\\ 1^3 + 2^3 = 3^2,\\ 1^3 + 2^3 + 3^3 = 6^2$. Tulis baris bagi $1^3 + 2^3 + \\ldots + ${k}^3$ dan cari nilainya.`), a: T(`$${tr}^2 = ${tot}$`), sp: 's' };
  };
  const gm11 = [
    /* next two terms + rule / continue / MCQ next */
    (r) => {
      const rule = pr(r, RM), l = rule.l, v = r.int(0, 3), sh = rule.l.length >= 8 ? 5 : 4;
      if (v === 0) return { q: cat(T(`Find the next two terms of $${dots(l.slice(0, sh))}$ and state the rule.`, `Cari dua sebutan berikutnya bagi $${dots(l.slice(0, sh))}$ dan nyatakan peraturannya.`), r.chance() ? named(rule) : T('')), a: ruleAns(rule, `$${sq(l.slice(sh, sh + 2))}$`), sp: 's' };
      if (v === 1) return { q: T(`The first ${sh} terms of a pattern are $${sq(l.slice(0, sh))}$. Continue the pattern and write the ${ordE(sh + 2)} term.`, `${sh} sebutan pertama satu pola ialah $${sq(l.slice(0, sh))}$. Teruskan pola itu dan tulis sebutan ${ke(sh + 2)}.`), a: ruleAns(rule, `$${n(l[sh + 1])}$`), sp: 's' };
      if (v === 2) { const nx = l[sh], last = l[sh - 1] - l[sh - 2]; const o = mc(r, `$${n(nx)}$`, [`$${n(l[sh - 1] + last)}$`, `$${n(nx + 1)}$`, `$${n(nx - 1)}$`]); return { q: cat(T(`What is the next number in the pattern $${dots(l.slice(0, sh))}$?<br>`, `Apakah nombor berikutnya dalam pola $${dots(l.slice(0, sh))}$?<br>`), o.q), a: o.a, w: T(`Rule: ${rule.en}.`, `Peraturan: ${rule.ms}.`), sp: 's' }; }
      const i = r.int(2, sh - 1); return { q: T(`Complete the pattern: $${numText(l.slice(0, 7), [i, 5, 6])}$.`, `Lengkapkan pola: $${numText(l.slice(0, 7), [i, 5, 6])}$.`), a: ruleAns(rule, `$${sq([l[i], l[5], l[6]])}$`), sp: 's' };
    },
    /* two-step recursive rule */
    (r) => {
      const a = r.int(1, 5), m = r.pick([2, 3]), c = r.pick([-1, 1, 2, -2, 3]), N = r.pick([4, 5]);
      const l = [a]; for (let i = 1; i < 6; i++) l.push(l[i - 1] * m + c);
      need(l.every((v) => v > 0));
      return { q: T(`A pattern starts at ${a}. To get the next term, multiply the previous term by ${m} and then ${c < 0 ? 'subtract' : 'add'} ${Math.abs(c)}. Write the first ${N} terms.`, `Satu pola bermula pada ${a}. Untuk mendapatkan sebutan berikutnya, darabkan sebutan sebelumnya dengan ${m} kemudian ${c < 0 ? 'tolak' : 'tambah'} ${Math.abs(c)}. Tulis ${N} sebutan pertama.`), a: T(`$${sq(l.slice(0, N))}$`), sp: 's' };
    },
    /* Fibonacci-type: missing terms / work backwards */
    (r) => {
      const rule = R.fib(r), l = rule.l, v = r.int(0, 2);
      if (v === 0) return { q: T(`Each term of a Fibonacci-type pattern is the sum of the two terms before it. Find the missing terms: $${numText(l.slice(0, 6), [3, 4])}$.`, `Setiap sebutan dalam pola jenis Fibonacci ialah hasil tambah dua sebutan sebelumnya. Cari sebutan yang hilang: $${numText(l.slice(0, 6), [3, 4])}$.`), a: T(`$${l[3]},\\ ${l[4]}$`), sp: 's' };
      if (v === 1) return { q: T(`In a Fibonacci-type pattern the 4th term is ${l[3]} and the 5th term is ${l[4]}. Find the 3rd term and the 2nd term.`, `Dalam satu pola jenis Fibonacci, sebutan ke-4 ialah ${l[3]} dan sebutan ke-5 ialah ${l[4]}. Cari sebutan ke-3 dan sebutan ke-2.`), a: T(`3rd term ${l[2]}, 2nd term ${l[1]}`, `Sebutan ke-3 ${l[2]}, sebutan ke-2 ${l[1]}`), sp: 's' };
      return { q: T(`A Fibonacci-type pattern starts with ${l[0]} and ${l[1]}. Write the first eight terms and state the sum of the 7th and 8th terms.`, `Satu pola jenis Fibonacci bermula dengan ${l[0]} dan ${l[1]}. Tulis lapan sebutan pertama dan nyatakan hasil tambah sebutan ke-7 dan ke-8.`), a: T(`$${sq(l.slice(0, 8))}$; ${l[6] + l[7]}`, `$${sq(l.slice(0, 8))}$; ${l[6] + l[7]}`), sp: 'm' };
    },
    /* squares and cubes reasoning */
    (r) => {
      const v = r.int(0, 4), k = r.int(9, 15);
      if (v === 0) return { q: T(`Find the ${ordE(k)} square number and the ${ordE(k - 5)} cube number.`, `Cari nombor kuasa dua sempurna ${ke(k)} dan nombor kuasa tiga sempurna ${ke(k - 5)}.`), a: T(`$${k}^2 = ${k * k}$; $${k - 5}^3 = ${(k - 5) ** 3}$`), sp: 's' };
      if (v === 1) { const N = r.chance() ? r.pick([121, 144, 169, 196, 225]) : r.pick([120, 150, 170, 200, 230]); const yes = Math.sqrt(N) % 1 === 0; return { q: T(`Is ${N} a square number? Show how you decide.`, `Adakah ${N} nombor kuasa dua sempurna? Tunjukkan bagaimana anda memutuskannya.`), a: yes ? T(`Yes, $${Math.sqrt(N)}^2 = ${N}$`, `Ya, $${Math.sqrt(N)}^2 = ${N}$`) : T(`No, $${Math.floor(Math.sqrt(N))}^2 = ${Math.floor(Math.sqrt(N)) ** 2}$ and $${Math.floor(Math.sqrt(N)) + 1}^2 = ${(Math.floor(Math.sqrt(N)) + 1) ** 2}$, so ${N} lies between two square numbers`, `Tidak, $${Math.floor(Math.sqrt(N))}^2 = ${Math.floor(Math.sqrt(N)) ** 2}$ dan $${Math.floor(Math.sqrt(N)) + 1}^2 = ${(Math.floor(Math.sqrt(N)) + 1) ** 2}$, jadi ${N} terletak di antara dua nombor kuasa dua sempurna`), sp: 's' }; }
      if (v === 2) { const cub = r.pick([27, 64, 125, 216, 343]), oth = r.sample([9, 16, 25, 36, 49, 81], 3), o = mc(r, `$${cub}$`, oth.map((x) => `$${x}$`)); return { q: cat(T('Which of these is a cube number?<br>', 'Yang manakah antara ini nombor kuasa tiga sempurna?<br>'), o.q), a: o.a, sp: 's' }; }
      if (v === 3) { const a = r.int(2, 6); return { q: T(`Write the first five square numbers and the first five cube numbers. Which number is both a square number and a cube number?`, `Tulis lima nombor kuasa dua sempurna pertama dan lima nombor kuasa tiga sempurna pertama. Nombor yang manakah ialah kedua-duanya nombor kuasa dua sempurna dan nombor kuasa tiga sempurna?`), a: T(`Squares: $1,\\ 4,\\ 9,\\ 16,\\ 25$; cubes: $1,\\ 8,\\ 27,\\ 64,\\ 125$; the number is $1$`, `Kuasa dua: $1,\\ 4,\\ 9,\\ 16,\\ 25$; kuasa tiga: $1,\\ 8,\\ 27,\\ 64,\\ 125$; nombor itu ialah $1$`), sp: 'm' }; }
      const a = r.int(3, 9); return { q: T(`The differences between consecutive square numbers $1,\\ 4,\\ 9,\\ 16,\\ 25$ form a pattern. Write the differences and use them to find the difference between $${a + 1}^2$ and $${a}^2$.`, `Beza antara nombor kuasa dua sempurna berturutan $1,\\ 4,\\ 9,\\ 16,\\ 25$ membentuk satu pola. Tulis beza-beza itu dan gunakannya untuk mencari beza antara $${a + 1}^2$ dan $${a}^2$.`), a: T(`Differences: $3,\\ 5,\\ 7,\\ 9$ (odd numbers); $${a + 1}^2 - ${a}^2 = ${(a + 1) ** 2 - a * a}$`, `Beza: $3,\\ 5,\\ 7,\\ 9$ (nombor ganjil); $${a + 1}^2 - ${a}^2 = ${(a + 1) ** 2 - a * a}$`), sp: 'm' };
    },
    /* number-fact lines */
    facts,
    /* doubling / halving contexts */
    (r) => { const [q, f, m] = r.pick(DB)(r); const a = f(m); return { q, a: T(`${n(a)}`), sp: 's' }; },
    /* repeating pattern, the nth item */
    (r) => {
      const c = r.pick(CY), L = c.en.length, k = r.int(3, 9) * L + r.int(1, L - 1), sh = L * 2 + 1;
      const list = (lang) => Array.from({ length: sh }, (_, i) => c[lang][i % L]).join(', ');
      const i = (k - 1) % L;
      return { q: T(`${SPM.cap(c.thing.en)} follow a repeating pattern: ${list('en')}, … What is the ${ordE(k)} one?`, `${SPM.cap(c.thing.ms)} mengikut pola berulang: ${list('ms')}, … Apakah yang ${ke(k)}?`), a: T(c.en[i], c.ms[i]), w: T(`The pattern repeats every ${L}. ${k} = ${L} × ${Math.floor(k / L)} + ${k % L}.`, `Pola berulang setiap ${L}. ${k} = ${L} × ${Math.floor(k / L)} + ${k % L}.`), sp: 's' };
    },
    /* classify three patterns */
    (r) => {
      const A = pr(r, ['add', 'sub', 'dec']), Bm = pr(r, ['mul', 'div']), C = pr(r, ['fib', 'sqr', 'tri', 'cube']), items = r.shuffle([[A, 0], [Bm, 1], [C, 2]]);
      const kinds = [T('add or subtract the same number', 'tambah atau tolak nombor yang sama'), T('multiply or divide by the same number', 'darab atau bahagi dengan nombor yang sama'), T('neither', 'kedua-duanya bukan')];
      return { q: T(`Decide whether each pattern is formed by (P) adding or subtracting the same number each time, (Q) multiplying or dividing by the same number each time, or (R) neither. (a) $${dots(items[0][0].l.slice(0, 5))}$ (b) $${dots(items[1][0].l.slice(0, 5))}$ (c) $${dots(items[2][0].l.slice(0, 5))}$`, `Tentukan sama ada setiap pola dibentuk dengan (P) menambah atau menolak nombor yang sama setiap kali, (Q) mendarab atau membahagi dengan nombor yang sama setiap kali, atau (R) kedua-duanya bukan. (a) $${dots(items[0][0].l.slice(0, 5))}$ (b) $${dots(items[1][0].l.slice(0, 5))}$ (c) $${dots(items[2][0].l.slice(0, 5))}$`), a: T(items.map((x, i) => `(${'abc'[i]}) ${'PQR'[x[1]]}`).join('  ')), sp: 's' };
    },
    /* table, non-additive rules */
    (r) => {
      const rule = pr(r, ['mul', 'div', 'fib', 'sqr', 'tri', 'sub']), l = rule.l.slice(0, 6), bl = r.chance() ? [4, 5] : [3, 5];
      const mk = (a, b) => SPM.table([[a, 1, 2, 3, 4, 5, 6], [b].concat(l.map((v, i) => (bl.includes(i) ? '?' : n(v))))], { rowHead: true });
      return { q: T(`Complete the table and describe the rule of the pattern in words.<br>${mk('Position', 'Term')}`, `Lengkapkan jadual itu dan huraikan peraturan pola itu dengan perkataan.<br>${mk('Kedudukan', 'Sebutan')}`), a: T(`$${sq(bl.map((i) => l[i]))}$; rule: ${rule.en}`, `$${sq(bl.map((i) => l[i]))}$; peraturan: ${rule.ms}`), sp: 'm' };
    },
    /* which list is Fibonacci-type (MCQ) */
    (r) => {
      const f = R.fib(r).l.slice(0, 5), a1 = R.add(r).l.slice(0, 5), m1 = R.mul(r).l.slice(0, 5), s1 = R.sqr(r).l.slice(0, 5);
      const o = mc(r, `$${sq(f)}$`, [`$${sq(a1)}$`, `$${sq(m1)}$`, `$${sq(s1)}$`], '<br>');
      return { q: cat(T('Which list is a Fibonacci-type pattern, where each term is the sum of the two terms before it?<br>', 'Senarai yang manakah pola jenis Fibonacci, di mana setiap sebutan ialah hasil tambah dua sebutan sebelumnya?<br>'), o.q), a: o.a, sp: 's' };
    },
    /* insert terms between two numbers (add rule) */
    (r) => {
      const d = r.int(2, 9) * r.sign(), a = r.int(10, 40), g = r.pick([2, 3]);
      const l = ar(a, d, g + 2); need(l.every((v) => v > 0));
      return { q: T(`Write ${g} numbers between ${l[0]} and ${l[g + 1]} so that the pattern adds (or subtracts) the same number each time: $${l[0]},\\ ${Array(g).fill('\\square').join(',\\ ')},\\ ${l[g + 1]}$.`, `Tulis ${g} nombor antara ${l[0]} dan ${l[g + 1]} supaya pola itu menambah (atau menolak) nombor yang sama setiap kali: $${l[0]},\\ ${Array(g).fill('\\square').join(',\\ ')},\\ ${l[g + 1]}$.`), a: T(`$${sq(l.slice(1, g + 1))}$ (${d > 0 ? 'add' : 'subtract'} ${Math.abs(d)})`, `$${sq(l.slice(1, g + 1))}$ (${d > 0 ? 'tambah' : 'tolak'} ${Math.abs(d)})`), sp: 's' };
    },
    /* figure, medium */
    (r) => {
      const p = mkFig(r), ks = [1, 2, 3], v = r.int(0, 2);
      const h = `The diagram shows ${p.intro.en}.`, hM = `Rajah menunjukkan ${p.intro.ms}.`;
      if (v === 0) return { q: T(`${h} (a) Complete the table. (b) State the rule for the number of ${p.noun.en} in words.<br>${SPM.table([['Figure', 1, 2, 3, 4, 5], ['Number of ' + p.noun.en, fN(p, 1), fN(p, 2), fN(p, 3), '?', '?']], { rowHead: true })}`, `${hM} (a) Lengkapkan jadual. (b) Nyatakan peraturan bagi bilangan ${p.noun.ms} dengan perkataan.<br>${SPM.table([['Rajah', 1, 2, 3, 4, 5], ['Bilangan ' + p.noun.ms, fN(p, 1), fN(p, 2), fN(p, 3), '?', '?']], { rowHead: true })}`), fig: figL(p, ks), a: T(`(a) ${fN(p, 4)}, ${fN(p, 5)} (b) Each figure has ${p.a} more ${p.noun.en} than the one before (${p.grow.en}).`, `(a) ${fN(p, 4)}, ${fN(p, 5)} (b) Setiap rajah mempunyai ${p.a} ${p.noun.ms} lebih banyak daripada rajah sebelumnya (${p.grow.ms}).`), sp: 'l' };
      if (v === 1) { const K = r.int(6, 10); return { q: T(`${h} (a) How many ${p.noun.en} are in Figure 5? (b) Which figure has ${fN(p, K)} ${p.noun.en}?`, `${hM} (a) Berapakah bilangan ${p.noun.ms} dalam Rajah 5? (b) Rajah yang manakah mempunyai ${fN(p, K)} ${p.noun.ms}?`), fig: figL(p, ks), a: T(`(a) ${fN(p, 5)} (b) Figure ${K}`, `(a) ${fN(p, 5)} (b) Rajah ${K}`), sp: 'l' }; }
      const i = r.int(3, 5), j = i + r.int(2, 4); return { q: T(`${h} How many more ${p.noun.en} are needed for Figure ${j} than for Figure ${i}? Explain how you know without counting both figures.`, `${hM} Berapa banyak lagi ${p.noun.ms} diperlukan untuk Rajah ${j} berbanding Rajah ${i}? Terangkan bagaimana anda tahu tanpa mengira kedua-dua rajah.`), fig: figL(p, ks), a: T(`${p.a * (j - i)}: each of the ${j - i} extra figures adds ${p.a}`, `${p.a * (j - i)}: setiap satu daripada ${j - i} rajah tambahan menambah ${p.a}`), sp: 'm' };
    },
  ];

  const hd = (p) => T(`The diagram shows ${p.intro.en}.`, `Rajah menunjukkan ${p.intro.ms}.`);
  const ga11 = [
    /* describe the rule, extend, and use it for a distant figure */
    (r) => {
      const p = mkFig(r), K = r.pick([10, 12, 15, 20, 25]);
      return { q: cat(hd(p), T(` (a) Describe in words how each figure is made from the one before. (b) How many ${p.noun.en} are in Figure 4? (c) Use your rule to find the number of ${p.noun.en} in Figure ${K}.`, ` (a) Huraikan dengan perkataan bagaimana setiap rajah dibina daripada rajah sebelumnya. (b) Berapakah bilangan ${p.noun.ms} dalam Rajah 4? (c) Gunakan peraturan anda untuk mencari bilangan ${p.noun.ms} dalam Rajah ${K}.`)), fig: figL(p, [1, 2, 3]), a: T(`(a) ${SPM.cap(p.grow.en)}, so ${p.a} more ${p.noun.en} each time. (b) ${fN(p, 4)} (c) ${fN(p, 1)} + ${K - 1} × ${p.a} = ${fN(p, K)}`, `(a) ${SPM.cap(p.grow.ms)}, jadi ${p.a} ${p.noun.ms} lebih banyak setiap kali. (b) ${fN(p, 4)} (c) ${fN(p, 1)} + ${K - 1} × ${p.a} = ${fN(p, K)}`), sp: 'xl' };
    },
    /* can a figure have exactly N ? */
    (r) => {
      const p = mkFig(r), K = r.int(9, 20), yes = r.chance(), N = fN(p, K) + (yes ? 0 : r.int(1, p.a - 1 || 1));
      need(yes || p.a > 1);
      const who = r.name();
      return { q: cat(hd(p), T(` ${who} says that one of the figures in this pattern uses exactly ${N} ${p.noun.en}. Is ${who} correct? Give a reason.`, ` ${who} berkata bahawa salah satu rajah dalam pola ini menggunakan tepat ${N} ${p.noun.ms}. Adakah ${who} betul? Beri satu sebab.`)), fig: figL(p, [1, 2, 3]), a: yes ? T(`Yes, Figure ${K}: (${N} − ${p.b}) ÷ ${p.a} = ${K}, a whole number.`, `Ya, Rajah ${K}: (${N} − ${p.b}) ÷ ${p.a} = ${K}, satu nombor bulat.`) : T(`No. (${N} − ${p.b}) ÷ ${p.a} = ${n(round((N - p.b) / p.a, 3))} is not a whole number.`, `Tidak. (${N} − ${p.b}) ÷ ${p.a} = ${n(round((N - p.b) / p.a, 3))} bukan nombor bulat.`), sp: 'l' };
    },
    /* budget: largest figure that can be built, leftover */
    (r) => {
      const p = mkFig(r), N = r.int(40, 120), K = Math.floor((N - p.b) / p.a), left = N - fN(p, K);
      need(K >= 5 && left > 0);
      return { q: cat(hd(p), T(` A shop has only ${N} ${p.noun.en}. What is the largest figure in the pattern that can be made? How many ${p.noun.en} are left over?`, ` Sebuah kedai hanya mempunyai ${N} ${p.noun.ms}. Apakah rajah terbesar dalam pola itu yang boleh dibina? Berapakah ${p.noun.ms} yang berbaki?`)), fig: figL(p, [1, 2, 3]), a: T(`Figure ${K} (uses ${fN(p, K)}); ${left} left over`, `Rajah ${K} (menggunakan ${fN(p, K)}); ${left} berbaki`), sp: 'l' };
    },
    /* cost */
    (r) => {
      const p = mkFig(r, ['sq', 'tri', 'hex', 'tab', 'frm']), K = r.int(8, 15), c = r.pick([20, 25, 30, 40, 50]);
      const item = { sq: T('matchstick', 'batang mancis'), tri: T('matchstick', 'batang mancis'), hex: T('matchstick', 'batang mancis'), tab: T('chair', 'kerusi'), frm: T('tile', 'jubin') };
      const it = p.noun.en === 'matchsticks' ? item.sq : p.noun.en === 'chairs' ? item.tab : item.frm;
      return { q: cat(hd(p), T(` Each ${it.en} costs ${c} sen. Find the total cost, in RM, of the ${p.noun.en} needed for Figure ${K}.`, ` Setiap ${it.ms} berharga ${c} sen. Cari jumlah kos, dalam RM, bagi ${p.noun.ms} yang diperlukan untuk Rajah ${K}.`)), fig: figL(p, [1, 2, 3]), a: T(`${fN(p, K)} × ${c} sen = ${SPM.rm((fN(p, K) * c) / 100)}`), sp: 'l' };
    },
    /* check a claim */
    (r) => {
      const p = mkFig(r), K = r.int(6, 12), who = r.name(), ok = r.chance();
      const wrong = r.pick([fN(p, K) + p.a, fN(p, K) - p.a, p.a * K + p.b + 1, fN(p, 1) * K]);
      need(ok || wrong !== fN(p, K));
      const cl = ok ? fN(p, K) : wrong;
      return { q: cat(hd(p), T(` ${who} claims that Figure ${K} has ${cl} ${p.noun.en}. Is the claim correct? If not, give the correct number.`, ` ${who} mendakwa bahawa Rajah ${K} mempunyai ${cl} ${p.noun.ms}. Adakah dakwaan itu betul? Jika tidak, berikan bilangan yang betul.`)), fig: figL(p, [1, 2, 3]), a: ok ? T(`Correct: ${fN(p, 1)} + ${K - 1} × ${p.a} = ${cl}`, `Betul: ${fN(p, 1)} + ${K - 1} × ${p.a} = ${cl}`) : T(`Not correct. The correct number is ${fN(p, K)}.`, `Tidak betul. Bilangan yang betul ialah ${fN(p, K)}.`), sp: 'l' };
    },
    /* two patterns compared */
    (r) => {
      const ks = r.sample(r.pick([['sq', 'tri', 'hex'], ['L', 'plus', 'arr']]), 2), p = FK[ks[0]](r), q = FK[ks[1]](r), K = r.int(6, 12);
      need(fN(p, K) !== fN(q, K) && p.noun.en === q.noun.en);
      const big = fN(p, K) > fN(q, K);
      return { q: T(`Pattern P and pattern Q both use ${p.noun.en}. P is ${p.intro.en}; Q is ${q.intro.en}. The figures are shown below (top: P, bottom: Q). Which pattern needs more ${p.noun.en} for Figure ${K}, and by how many?`, `Pola P dan pola Q kedua-duanya menggunakan ${p.noun.ms}. P ialah ${p.intro.ms}; Q ialah ${q.intro.ms}. Rajah-rajah ditunjukkan di bawah (atas: P, bawah: Q). Pola yang manakah memerlukan lebih banyak ${p.noun.ms} untuk Rajah ${K}, dan berapa banyak lebihnya?`), fig: T(figL(p, [1, 2, 3]).en + figL(q, [1, 2, 3]).en, figL(p, [1, 2, 3]).ms + figL(q, [1, 2, 3]).ms), a: T(`${big ? 'P' : 'Q'}: P has ${fN(p, K)}, Q has ${fN(q, K)}; difference ${Math.abs(fN(p, K) - fN(q, K))}`, `${big ? 'P' : 'Q'}: P ada ${fN(p, K)}, Q ada ${fN(q, K)}; beza ${Math.abs(fN(p, K) - fN(q, K))}`), sp: 'xl' };
    },
    /* the growth stated in words only (no diagram) */
    (r) => {
      const p = mkFig(r), K = r.int(8, 16);
      return { q: T(`Consider ${p.intro.en}. Figure 1 uses ${fN(p, 1)} ${p.noun.en}, and ${p.grow.en} from one figure to the next, so each figure uses ${p.a} more ${p.noun.en} than the one before. How many ${p.noun.en} are needed for Figure ${K}?`, `Pertimbangkan ${p.intro.ms}. Rajah 1 menggunakan ${fN(p, 1)} ${p.noun.ms}, dan ${p.grow.ms} dari satu rajah ke rajah berikutnya, jadi setiap rajah menggunakan ${p.a} ${p.noun.ms} lebih banyak daripada rajah sebelumnya. Berapakah ${p.noun.ms} yang diperlukan untuk Rajah ${K}?`), a: T(`${fN(p, K)}`), w: T(`${fN(p, 1)} + ${K - 1} × ${p.a}`), sp: 'm' };
    },
    /* method MCQ, off by one */
    (r) => {
      const p = mkFig(r), K = r.int(10, 30), f1 = fN(p, 1);
      const right = `$${f1} + ${p.a} \\times ${K - 1}$`, o = mc(r, right, [`$${f1} + ${p.a} \\times ${K}$`, `$${p.a} \\times ${K}$`, `$${f1} \\times ${K}$`], '<br>');
      return { q: cat(hd(p), T(` Figure 1 has ${f1} ${p.noun.en} and each figure has ${p.a} more than the one before. Which calculation gives the number of ${p.noun.en} in Figure ${K}?<br>`, ` Rajah 1 mempunyai ${f1} ${p.noun.ms} dan setiap rajah mempunyai ${p.a} lebih banyak daripada rajah sebelumnya. Pengiraan yang manakah memberi bilangan ${p.noun.ms} dalam Rajah ${K}?<br>`), o.q), fig: figL(p, [1, 2, 3]), a: cat(o.a, T(` = ${fN(p, K)}`)), sp: 'l' };
    },
  ];
  const gb11 = [
    /* several rules fit a finite list */
    (r) => {
      const a = r.int(1, 4), v = r.int(0, 2);
      if (v === 0) return { q: T(`The first three numbers of a pattern are $${sq([a, 2 * a, 4 * a])},\\ \\ldots$ Aina says the next number is ${8 * a}. Farid says it is ${7 * a}. Give a rule for each of them that makes them both correct.`, `Tiga nombor pertama satu pola ialah $${sq([a, 2 * a, 4 * a])},\\ \\ldots$ Aina berkata nombor berikutnya ialah ${8 * a}. Farid berkata ia ialah ${7 * a}. Beri satu peraturan bagi setiap seorang supaya kedua-duanya betul.`), a: T(`Aina: multiply by 2 each time (${8 * a}). Farid: add ${a}, then ${2 * a}, then ${3 * a} (${7 * a}).`, `Aina: darab dengan 2 setiap kali (${8 * a}). Farid: tambah ${a}, kemudian ${2 * a}, kemudian ${3 * a} (${7 * a}).`), sp: 'm' };
      if (v === 1) { const x = r.pick([[2, 3, 5, 7, 8, 'primes', 'nombor perdana', 'add the previous two terms', 'tambah dua sebutan sebelumnya'], [1, 2, 3, 4, 5, 'add 1 each time', 'tambah 1 setiap kali', 'add the previous two terms', 'tambah dua sebutan sebelumnya']]); return x.length === 9
        ? { q: T(`The numbers $2,\\ 3,\\ 5,\\ \\ldots$ can continue in more than one way. Give the next number for the rule "prime numbers" and the next number for the rule "add the previous two terms".`, `Nombor $2,\\ 3,\\ 5,\\ \\ldots$ boleh diteruskan dengan lebih daripada satu cara. Beri nombor berikutnya bagi peraturan "nombor perdana" dan nombor berikutnya bagi peraturan "tambah dua sebutan sebelumnya".`), a: T('Prime numbers: 7 (2, 3, 5, 7). Add the previous two terms: 8 (2, 3, 5, 8).', 'Nombor perdana: 7 (2, 3, 5, 7). Tambah dua sebutan sebelumnya: 8 (2, 3, 5, 8).'), sp: 'm' }
        : { q: T(`The numbers $1,\\ 2,\\ 3,\\ \\ldots$ can continue in more than one way. Give the next number for the rule "add 1 each time" and the next number for the rule "add the previous two terms".`, `Nombor $1,\\ 2,\\ 3,\\ \\ldots$ boleh diteruskan dengan lebih daripada satu cara. Beri nombor berikutnya bagi peraturan "tambah 1 setiap kali" dan nombor berikutnya bagi peraturan "tambah dua sebutan sebelumnya".`), a: T('Add 1: 4 (1, 2, 3, 4). Add the previous two: 5 (1, 2, 3, 5).', 'Tambah 1: 4 (1, 2, 3, 4). Tambah dua sebutan sebelumnya: 5 (1, 2, 3, 5).'), sp: 'm' }; }
      const b = a + r.int(1, 3);
      return { q: T(`Why is it not certain that the next number after $${sq([b, b + 2, b + 4])},\\ \\ldots$ is ${b + 6}? Give another rule that fits the three numbers but gives a different next number.`, `Mengapakah tidak pasti bahawa nombor selepas $${sq([b, b + 2, b + 4])},\\ \\ldots$ ialah ${b + 6}? Beri satu peraturan lain yang sesuai dengan tiga nombor itu tetapi memberi nombor berikutnya yang berbeza.`), a: T(`Three numbers do not fix the rule. Example: add 2, add 2, then add 4 gives ${b + 8}; the rule "add 2" gives ${b + 6}.`, `Tiga nombor tidak menentukan peraturan. Contoh: tambah 2, tambah 2, kemudian tambah 4 memberi ${b + 8}; peraturan "tambah 2" memberi ${b + 6}.`), sp: 'm' };
    },
    /* insert terms: geometric / arithmetic */
    (r) => {
      const v = r.int(0, 2);
      if (v === 0) { const m = r.pick([2, 3]), a = r.int(1, 5), g = 2; const l = Array.from({ length: 4 }, (_, i) => a * m ** i); return { q: T(`Two numbers are missing from this pattern, which multiplies by the same number each time: $${l[0]},\\ \\square,\\ \\square,\\ ${l[3]}$. Find them.`, `Dua nombor hilang daripada pola ini, yang didarab dengan nombor yang sama setiap kali: $${l[0]},\\ \\square,\\ \\square,\\ ${l[3]}$. Cari nombor itu.`), a: T(`$${l[1]},\\ ${l[2]}$ (multiply by ${m})`, `$${l[1]},\\ ${l[2]}$ (darab dengan ${m})`), sp: 's' }; }
      if (v === 1) { const d = r.int(3, 9), a = r.int(2, 15), l = ar(a, d, 5); return { q: T(`Three numbers are missing from this pattern, which adds the same number each time: $${l[0]},\\ \\square,\\ \\square,\\ \\square,\\ ${l[4]}$. Find them.`, `Tiga nombor hilang daripada pola ini, yang menambah nombor yang sama setiap kali: $${l[0]},\\ \\square,\\ \\square,\\ \\square,\\ ${l[4]}$. Cari nombor itu.`), a: T(`$${sq(l.slice(1, 4))}$ (add ${d})`, `$${sq(l.slice(1, 4))}$ (tambah ${d})`), w: T(`${l[4]} − ${l[0]} = ${l[4] - l[0]}, divided into 4 equal steps`, `${l[4]} − ${l[0]} = ${l[4] - l[0]}, dibahagi kepada 4 langkah sama`), sp: 'm' }; }
      const m = 2, a = r.int(1, 4), l = Array.from({ length: 5 }, (_, i) => a * m ** i); return { q: T(`The numbers $${l[0]}$ and $${l[4]}$ are the first and fifth terms of a pattern that doubles each time. Write the three terms in between.`, `Nombor $${l[0]}$ dan $${l[4]}$ ialah sebutan pertama dan sebutan kelima bagi satu pola yang berganda setiap kali. Tulis tiga sebutan di antaranya.`), a: T(`$${sq(l.slice(1, 4))}$`), sp: 's' };
    },
    /* find the error in a continuation */
    (r) => {
      const rule = pr(r, ['mul', 'div', 'fib', 'sqr', 'tri', 'add']), l = rule.l, sh = 4, who = r.name();
      const i = r.int(sh, sh + 2), bad = l.slice(sh, sh + 3).map((v, j) => (sh + j === i ? v + r.pick([-2, -1, 1, 2]) : v)); need(l[i] !== bad[i - sh]);
      return { q: T(`The pattern starts $${sq(l.slice(0, sh))},\\ \\ldots$ (rule: ${rule.en}). ${who} continues it as $${sq(bad)}$. Which number is wrong, and what should it be?`, `Pola itu bermula $${sq(l.slice(0, sh))},\\ \\ldots$ (peraturan: ${rule.ms}). ${who} meneruskannya sebagai $${sq(bad)}$. Nombor yang manakah salah, dan apakah nombor yang sepatutnya?`), a: T(`${n(bad[i - sh])} is wrong; it should be ${n(l[i])}`, `${n(bad[i - sh])} salah; sepatutnya ${n(l[i])}`), sp: 'm' };
    },
    /* cycle counting */
    (r) => {
      const c = r.pick(CY.slice(0, 4).concat(CY.slice(5, 7))), L = c.en.length, N = r.int(4, 9) * L + r.int(1, L - 1), target = r.int(0, L - 1);
      let cnt = 0; for (let i = 0; i < N; i++) if (i % L === target) cnt++;
      const list = (lang) => Array.from({ length: L * 2 }, (_, i) => c[lang][i % L]).join(', ');
      return { q: T(`${SPM.cap(c.thing.en)} follow a repeating pattern: ${list('en')}, … Among the first ${N}, how many are "${c.en[target]}"?`, `${SPM.cap(c.thing.ms)} mengikut pola berulang: ${list('ms')}, … Dalam ${N} yang pertama, berapakah yang "${c.ms[target]}"?`), a: T(`${cnt}`), w: T(`${N} = ${L} × ${Math.floor(N / L)} + ${N % L}`), sp: 'm' };
    },
    /* Fibonacci backwards */
    (r) => {
      const rule = R.fib(r), l = rule.l, k = r.int(5, 7);
      return { q: T(`In a Fibonacci-type pattern the ${ordE(k)} term is ${l[k - 1]} and the ${ordE(k + 1)} term is ${l[k]}. Work backwards to find the first two terms.`, `Dalam satu pola jenis Fibonacci, sebutan ${ke(k)} ialah ${l[k - 1]} dan sebutan ${ke(k + 1)} ialah ${l[k]}. Kerjakan ke belakang untuk mencari dua sebutan pertama.`), a: T(`${l[0]} and ${l[1]}`, `${l[0]} dan ${l[1]}`), w: T(`${sq(l.slice(0, k + 1))}`), sp: 'm' };
    },
    /* rule in words from a table, then use it */
    (r) => {
      const a = r.int(2, 6), b = r.int(1, 8), K = r.pick([10, 15, 20, 30]), v = r.int(0, 1), N = a * r.int(12, 40) + b;
      const tb = (h1, h2) => SPM.table([[h1, 1, 2, 3, 4], [h2].concat([1, 2, 3, 4].map((i) => a * i + b))], { rowHead: true });
      return { q: T(`The table shows a pattern.<br>${tb('Position', 'Number')}<br>The rule is: "multiply the position by a fixed number, then add a fixed number". ${v ? `Which position has the number ${N}?` : `Find the number at position ${K}.`}`, `Jadual menunjukkan satu pola.<br>${tb('Kedudukan', 'Nombor')}<br>Peraturannya ialah: "darabkan kedudukan dengan satu nombor tetap, kemudian tambah satu nombor tetap". ${v ? `Kedudukan yang manakah mempunyai nombor ${N}?` : `Cari nombor pada kedudukan ${K}.`}`), a: v ? T(`Position ${(N - b) / a}`, `Kedudukan ${(N - b) / a}`) : T(`${a * K + b}`), w: T(`Multiply by ${a}, then add ${b}`, `Darab dengan ${a}, kemudian tambah ${b}`), sp: 'm' };
    },
    /* recursive rule, several steps and threshold */
    (r) => {
      const a = r.int(2, 4), m = r.pick([2, 3]), c = r.pick([1, 2, -1]), thr = r.pick([50, 100, 200]);
      const l = [a]; while (l[l.length - 1] <= thr && l.length < 12) l.push(l[l.length - 1] * m + c); need(l.length <= 9 && l.length >= 5);
      return { q: T(`A pattern starts at ${a}. Each new term is ${m} times the previous term ${c < 0 ? 'minus' : 'plus'} ${Math.abs(c)}. Which is the first term greater than ${thr}, and which term number is it?`, `Satu pola bermula pada ${a}. Setiap sebutan baharu ialah ${m} kali sebutan sebelumnya ${c < 0 ? 'tolak' : 'tambah'} ${Math.abs(c)}. Sebutan yang manakah sebutan pertama yang lebih besar daripada ${thr}, dan sebutan yang ke berapa?`), a: T(`${l[l.length - 1]}, the ${ordE(l.length)} term`, `${l[l.length - 1]}, sebutan ${ke(l.length)}`), w: T(`${sq(l)}`), sp: 'm' };
    },
    /* last digit cycles */
    (r) => {
      const b = r.pick([2, 3, 4, 7, 8, 9]), k = r.int(15, 60);
      let v = 1; const ds = []; for (let i = 1; i <= 8; i++) { v = (v * b) % 10; ds.push(v); }
      let x = 1; for (let i = 0; i < k; i++) x = (x * b) % 10;
      return { q: T(`The last digits of $${b}^1,\\ ${b}^2,\\ ${b}^3,\\ \\ldots$ are $${sq(ds)},\\ \\ldots$ The pattern of last digits repeats. Use it to find the last digit of $${b}^{${k}}$.`, `Digit terakhir bagi $${b}^1,\\ ${b}^2,\\ ${b}^3,\\ \\ldots$ ialah $${sq(ds)},\\ \\ldots$ Pola digit terakhir itu berulang. Gunakannya untuk mencari digit terakhir bagi $${b}^{${k}}$.`), a: T(`$${x}$`), sp: 'm' };
    },
    /* Pascal's triangle */
    (r) => {
      const rows = [[1]]; for (let i = 1; i < 9; i++) { const p = rows[i - 1], q = [1]; for (let j = 1; j < i; j++) q.push(p[j - 1] + p[j]); q.push(1); rows.push(q); }
      const t = r.int(5, 7), K = r.int(9, 12);
      return { q: T(`Study the first rows of Pascal's triangle: $1$; $1,\\ 1$; $1,\\ 2,\\ 1$; $1,\\ 3,\\ 3,\\ 1$. (a) Write row ${t}. (b) Add the numbers in each of the first four rows. Use the pattern of these sums to find the sum of the numbers in row ${K}.`, `Kaji baris-baris pertama segi tiga Pascal: $1$; $1,\\ 1$; $1,\\ 2,\\ 1$; $1,\\ 3,\\ 3,\\ 1$. (a) Tulis baris ${ke(t)}. (b) Tambah nombor dalam setiap satu daripada empat baris pertama. Gunakan pola hasil tambah ini untuk mencari hasil tambah nombor dalam baris ${ke(K)}.`), a: T(`(a) $${sq(rows[t - 1])}$ (b) sums $1,\\ 2,\\ 4,\\ 8$ (doubling); row ${K}: $2^{${K - 1}} = ${2 ** (K - 1)}$`, `(a) $${sq(rows[t - 1])}$ (b) hasil tambah $1,\\ 2,\\ 4,\\ 8$ (berganda); baris ${K}: $2^{${K - 1}} = ${2 ** (K - 1)}$`), sp: 'l' };
    },
  ];
  /* ---- menu chains for 1.1: one number pattern (list / table / rule-start), then 2-3 different tasks ---- */
  const patRep = (r, ks) => {
    const ru = pr(r, ks), l = ru.l, kind = r.pick(['list', 'list', 'table', 'rule']), sh = l.length >= 8 ? 5 : 4;
    const intro = {
      list: T(`Here is a number pattern: $${dots(l.slice(0, sh))}$`, `Ini ialah satu pola nombor: $${dots(l.slice(0, sh))}$`),
      table: T(`The table shows a number pattern.<br>${SPM.table([['Position', 1, 2, 3, 4, 5], ['Number'].concat(l.slice(0, 5).map(n))], { rowHead: true })}`, `Jadual menunjukkan satu pola nombor.<br>${SPM.table([['Kedudukan', 1, 2, 3, 4, 5], ['Nombor'].concat(l.slice(0, 5).map(n))], { rowHead: true })}`),
      rule: T(`A number pattern starts at ${n(l[0])} and follows this rule: ${ru.en}.`, `Satu pola nombor bermula pada ${n(l[0])} dan mengikut peraturan ini: ${ru.ms}.`),
    }[kind];
    return { ru, l, kind, intro, sh };
  };
  const E11t = (S, r) => {
    const { l, ru, kind } = S, inc = l[1] > l[0], no = r.chance(), Xs = no ? l[5] + r.pick([-1, 1, 2]) : l[5], Ys = r.chance() ? l[6] : l[6] + 1, nums = l.slice(0, 6);
    return [
      kind === 'rule' ? P('Write the first five numbers of the pattern.', 'Tulis lima nombor pertama bagi pola itu.', `$${sq(l.slice(0, 5))}$`) : P('Write the next two numbers.', 'Tulis dua nombor berikutnya.', `$${sq([l[S.sh], l[S.sh + 1]])}$`),
      kind === 'rule' ? null : P('Describe the rule of the pattern in words.', 'Huraikan peraturan pola itu dengan perkataan.', SPM.cap(ru.en), SPM.cap(ru.ms)),
      P(`Alia says the 6th number is ${n(Xs)}. Is she correct?`, `Alia berkata nombor ke-6 ialah ${n(Xs)}. Adakah dia betul?`, Xs === l[5] ? 'Yes' : `No, it is ${n(l[5])}`, Xs === l[5] ? 'Ya' : `Tidak, ia ialah ${n(l[5])}`),
      P('Write the 7th number in the pattern.', 'Tulis nombor ke-7 dalam pola itu.', n(l[6])),
      P('Find the sum of the first three numbers.', 'Cari hasil tambah tiga nombor pertama.', n(round(l[0] + l[1] + l[2], 6))),
      P(`By how much is the 5th number ${l[4] >= l[1] ? 'greater' : 'smaller'} than the 2nd number?`, `Berapa banyak nombor ke-5 ${l[4] >= l[1] ? 'lebih besar' : 'lebih kecil'} daripada nombor ke-2?`, n(round(Math.abs(l[4] - l[1]), 6))),
      P(`Does the pattern contain the number ${n(Ys)}?`, `Adakah pola itu mengandungi nombor ${n(Ys)}?`, l.slice(0, 9).includes(Ys) ? 'Yes' : 'No', l.slice(0, 9).includes(Ys) ? 'Ya' : 'Tidak'),
      nums.every(Number.isInteger) ? P('Are the first six numbers all odd, all even, or a mixture?', 'Adakah enam nombor pertama semuanya ganjil, semuanya genap, atau campuran?', nums.every((x) => x % 2) ? 'All odd' : nums.every((x) => x % 2 === 0) ? 'All even' : 'A mixture', nums.every((x) => x % 2) ? 'Semuanya ganjil' : nums.every((x) => x % 2 === 0) ? 'Semuanya genap' : 'Campuran') : null,
      nums.every(Number.isInteger) ? P('How many of the first six numbers are even?', 'Berapakah bilangan nombor genap dalam enam nombor pertama?', `${nums.filter((x) => x % 2 === 0).length}`) : null,
      ru.d && !ru.sqr ? P('Write the number that would come before the first number if the pattern is continued backwards.', 'Tulis nombor yang datang sebelum nombor pertama jika pola itu diteruskan ke belakang.', n(round(l[0] - ru.d, 6))) : null,
      P(`Is the pattern increasing or decreasing?`, `Adakah pola itu menokok atau menyusut?`, inc ? 'Increasing' : 'Decreasing', inc ? 'Menokok' : 'Menyusut'),
    ];
  };
  const M11t = (S, r) => {
    const { l, ru } = S, inc = l[1] > l[0], T8 = l[l.length > 7 ? 7 : 6], k8 = l.length > 7 ? 8 : 7, K = r.pick([50, 100, 200]), first = l.findIndex((x) => x > K);
    return [
      P(`Write down the ${ordE(k8)} number in the pattern.`, `Tulis nombor ${ke(k8)} dalam pola itu.`, n(T8)),
      S.kind === 'rule' ? P('Use the rule to write the 5th, 6th and 7th numbers.', 'Gunakan peraturan itu untuk menulis nombor ke-5, ke-6 dan ke-7.', `$${sq(l.slice(4, 7))}$`) : P('State the rule of the pattern and use it to write the next three numbers.', 'Nyatakan peraturan pola itu dan gunakannya untuk menulis tiga nombor berikutnya.', `${ru.en}; $${sq(l.slice(S.sh, S.sh + 3))}$`, `${ru.ms}; $${sq(l.slice(S.sh, S.sh + 3))}$`),
      P('Find the difference between the 6th number and the 3rd number.', 'Cari beza antara nombor ke-6 dengan nombor ke-3.', n(round(l[5] - l[2], 6))),
      inc && first > 0 ? P(`Continue the pattern and write the first number that is greater than ${K}.`, `Teruskan pola itu dan tulis nombor pertama yang lebih besar daripada ${K}.`, n(l[first])) : null,
      P('Write the pattern up to the 7th number.', 'Tulis pola itu sehingga nombor ke-7.', `$${sq(l.slice(0, 7))}$`),
      P('How many of the first seven numbers are greater than 20?', 'Berapakah bilangan nombor dalam tujuh nombor pertama yang lebih besar daripada 20?', `${l.slice(0, 7).filter((x) => x > 20).length}`),
      ru.fib ? P('Show that the 3rd number plus the 4th number equals the 5th number.', 'Tunjukkan bahawa nombor ke-3 campur nombor ke-4 sama dengan nombor ke-5.', `${l[2]} + ${l[3]} = ${l[4]}`) : null,
      ru.m ? P(`By what number is each term ${inc ? 'multiplied' : 'divided'}?`, `Setiap sebutan ${inc ? 'didarab' : 'dibahagi'} dengan nombor berapa?`, `${ru.m}`) : null,
      ru.d && !ru.sqr && Number.isInteger(ru.d) ? P(`Is ${n(l[0] + ru.d * 12)} in the pattern? Explain.`, `Adakah ${n(l[0] + ru.d * 12)} terdapat dalam pola itu? Terangkan.`, `Yes, it is the 13th number: ${n(l[0])} + 12 × ${n(ru.d)}`, `Ya, ia ialah nombor ke-13: ${n(l[0])} + 12 × ${n(ru.d)}`) : null,
      P('Is the pattern formed by adding a fixed number each time? Give a reason.', 'Adakah pola itu dibentuk dengan menambah nombor tetap setiap kali? Beri satu sebab.', ru.d !== undefined && !ru.sqr && !ru.tri ? `Yes, the difference is always ${n(ru.d)}` : `No, the differences are ${diffs(l.slice(0, 5)).map(n).join(', ')}`, ru.d !== undefined && !ru.sqr && !ru.tri ? `Ya, bezanya sentiasa ${n(ru.d)}` : `Tidak, bezanya ialah ${diffs(l.slice(0, 5)).map(n).join(', ')}`),
      P('Find the sum of the 4th and 5th numbers.', 'Cari hasil tambah nombor ke-4 dan ke-5.', n(round(l[3] + l[4], 6))),
    ];
  };
  const A11t = (S, r) => {
    const { l, ru } = S, who = r.name(), i = r.int(3, 6), bad = l.slice(0, 7).map((v, j) => (j === i ? v + r.pick([-1, 1, 2]) : v)), K = r.pick([200, 500, 1000]), first = l.findIndex((x) => x > K);
    const cls = ru.d !== undefined && !ru.sqr && !ru.tri ? T('adding a fixed number each time', 'menambah nombor tetap setiap kali') : ru.m ? T(`${l[1] > l[0] ? 'multiplying' : 'dividing'} by a fixed number each time`, `${l[1] > l[0] ? 'mendarab' : 'membahagi'} dengan nombor tetap setiap kali`) : T('a rule that is neither adding nor multiplying by a fixed number', 'peraturan yang bukan menambah atau mendarab dengan nombor tetap');
    return [
      P(`${who} writes the pattern as $${sq(bad)}$. Which number is wrong and what should it be?`, `${who} menulis pola itu sebagai $${sq(bad)}$. Nombor yang manakah salah dan apakah nombor yang sepatutnya?`, `${n(bad[i])} should be ${n(l[i])}`, `${n(bad[i])} sepatutnya ${n(l[i])}`),
      P('Describe how the pattern is formed, using words such as "add", "multiply" or "previous".', 'Huraikan bagaimana pola itu dibentuk, menggunakan perkataan seperti "tambah", "darab" atau "sebelumnya".', SPM.cap(ru.en), SPM.cap(ru.ms)),
      P('Which type of rule is this?', 'Apakah jenis peraturan ini?', SPM.cap(cls.en), SPM.cap(cls.ms)),
      l.length > 8 ? P('Use the pattern to write the 9th number.', 'Gunakan pola itu untuk menulis nombor ke-9.', n(l[8])) : null,
      l[1] > l[0] && first > 0 ? P(`Which is the first number in the pattern greater than ${K}, and which number in the pattern is it?`, `Yang manakah nombor pertama dalam pola itu yang lebih besar daripada ${K}, dan nombor yang ke berapa?`, `${n(l[first])}, the ${ordE(first + 1)}`, `${n(l[first])}, ${ke(first + 1)}`) : null,
      P('Give a different rule that also produces the first three numbers but a different fourth number.', 'Beri satu peraturan lain yang juga menghasilkan tiga nombor pertama tetapi nombor keempat yang berbeza.', 'Any valid rule, e.g. differences that change (add 1, then add 2, then add 3, and so on) — three numbers do not fix a rule', 'Sebarang peraturan yang sah, contoh: beza yang berubah (tambah 1, kemudian tambah 2, kemudian tambah 3, dan seterusnya) — tiga nombor tidak menentukan peraturan'),
      P('Explain how you can check that a pattern really follows your rule.', 'Terangkan bagaimana anda boleh menyemak bahawa satu pola benar-benar mengikut peraturan anda.', 'Apply the rule to every consecutive pair of terms, not just the first two', 'Gunakan peraturan itu pada setiap pasangan sebutan berturutan, bukan hanya dua yang pertama'),
      P('Find the sum of the 5th and 6th numbers and compare it with the 7th number.', 'Cari hasil tambah nombor ke-5 dan ke-6 dan bandingkannya dengan nombor ke-7.', `${n(round(l[4] + l[5], 6))} and ${n(l[6])}: ${round(l[4] + l[5], 6) === l[6] ? 'equal' : 'not equal'}`, `${n(round(l[4] + l[5], 6))} dan ${n(l[6])}: ${round(l[4] + l[5], 6) === l[6] ? 'sama' : 'tidak sama'}`),
      P(`Is ${n(l[6] + 1)} the 7th number? Give a reason.`, `Adakah ${n(l[6] + 1)} nombor ke-7? Beri satu sebab.`, `No, the 7th number is ${n(l[6])}`, `Tidak, nombor ke-7 ialah ${n(l[6])}`),
    ];
  };
  const chainGen11 = (ks, tasks, kk) => (r) => { const S = patRep(r, ks); return chain(r, S.intro, tasks(S, r), r.pick(kk)); };
  ge11.push(chainGen11(RE, E11t, [2, 2, 3]), chainGen11(['add', 'sub', 'odd', 'even', 'mult', 'dec', 'sqr'], E11t, [2, 3]));
  gm11.push(chainGen11(RM, M11t, [2, 3]), chainGen11(RM, M11t, [3]));
  ga11.push(chainGen11(RA, A11t, [3]), chainGen11(['mul', 'div', 'fib', 'sqr', 'tri', 'cube', 'add', 'sub', 'neg'], A11t, [2, 3]));

  SPM.extend('F2-1.1', { e: ge11, m: gm11, a: ga11.concat(gb11) });

  /* ================================================================ F2-1.2 Sequences */
  const Tn = (k) => `T_{${k}}`;
  const tk = (a, d, k) => round(a + (k - 1) * d, 6);
  const apos = (l) => l.map((v) => v);
  const seqR = (r, ks) => { const ru = pr(r, ks || ['add', 'sub', 'odd', 'even', 'mult', 'dec']); return ru; };
  /** an arithmetic sequence: a, d, list of 8 */
  const AS = (r, o) => {
    o = o || {};
    const d = o.d !== undefined ? o.d : r.nz(-9, 9) * (o.pos ? 1 : 1), a = o.a !== undefined ? o.a : r.int(o.lo || 1, o.hi || 20);
    return { a, d, l: ar(a, d, 8) };
  };
  const ge12 = [
    /* notation: read terms / position from a list */
    (r) => {
      const s = AS(r, { d: r.int(2, 8) * (r.chance(0.3) ? -1 : 1), a: r.int(20, 40) }), l = s.l.slice(0, 6), v = r.int(0, 2);
      if (v === 0) { const i = r.sample([1, 2, 3, 4, 5, 6], 3).sort(); return { q: T(`The sequence $${dots(l)}$ is written $T_1,\\ T_2,\\ T_3,\\ \\ldots$ Write down $${Tn(i[0])}$, $${Tn(i[1])}$ and $${Tn(i[2])}$.`, `Jujukan $${dots(l)}$ ditulis $T_1,\\ T_2,\\ T_3,\\ \\ldots$ Tulis $${Tn(i[0])}$, $${Tn(i[1])}$ dan $${Tn(i[2])}$.`), a: T(`$${Tn(i[0])} = ${l[i[0] - 1]}$, $${Tn(i[1])} = ${l[i[1] - 1]}$, $${Tn(i[2])} = ${l[i[2] - 1]}$`), sp: 's' }; }
      if (v === 1) { const i = r.int(2, 6); return { q: T(`In the sequence $${dots(l)}$, ${l[i - 1]} is which term? Write your answer as $T_n$.`, `Dalam jujukan $${dots(l)}$, ${l[i - 1]} ialah sebutan yang ke berapa? Tulis jawapan anda sebagai $T_n$.`), a: T(`$${Tn(i)}$`), sp: 'xs' }; }
      const i = r.int(1, 4); return { q: T(`For the sequence $${dots(l)}$, find $${Tn(i + 1)} - ${Tn(i)}$ and $${Tn(i + 2)} - ${Tn(i + 1)}$. What do you notice?`, `Bagi jujukan $${dots(l)}$, cari $${Tn(i + 1)} - ${Tn(i)}$ dan $${Tn(i + 2)} - ${Tn(i + 1)}$. Apakah yang anda perhatikan?`), a: T(`Both equal $${n(s.d)}$: the difference is constant`, `Kedua-duanya sama dengan $${n(s.d)}$: bezanya malar`), sp: 's' };
    },
    /* first term and difference given */
    (r) => {
      const a = r.int(-5, 20), d = r.nz(-8, 8), v = r.int(0, 2), N = r.int(4, 6);
      if (v === 0) return { q: T(`A sequence has $T_1 = ${a}$ and each term is ${d > 0 ? `${d} more` : `${-d} less`} than the previous term. Write the first ${N} terms.`, `Satu jujukan mempunyai $T_1 = ${a}$ dan setiap sebutan ${d > 0 ? `lebih ${d}` : `kurang ${-d}`} daripada sebutan sebelumnya. Tulis ${N} sebutan pertama.`), a: T(`$${sq(ar(a, d, N))}$`), sp: 's' };
      if (v === 1) return { q: T(`The first term of a sequence is ${a} and the common difference is ${d}. Find $${Tn(N)}$ by listing the terms.`, `Sebutan pertama satu jujukan ialah ${a} dan beza sepunya ialah ${d}. Cari $${Tn(N)}$ dengan menyenaraikan sebutan.`), a: T(`$${Tn(N)} = ${tk(a, d, N)}$`), w: T(`$${sq(ar(a, d, N))}$`), sp: 's' };
      return { q: T(`Write the first ${N} terms of the sequence with $T_1 = ${a}$ and $T_2 = ${a + d}$, where the difference between consecutive terms is constant.`, `Tulis ${N} sebutan pertama bagi jujukan dengan $T_1 = ${a}$ dan $T_2 = ${a + d}$, dengan beza antara sebutan berturutan adalah malar.`), a: T(`$${sq(ar(a, d, N))}$`), sp: 's' };
    },
    /* recursive rule */
    (r) => {
      const a = r.int(1, 9), N = r.pick([4, 5]), v = r.int(0, 2), d = r.int(2, 7);
      if (v === 0) return { q: T(`A sequence is defined by $T_1 = ${a}$ and $T_{n+1} = T_n + ${d}$. Find $${Tn(N)}$.`, `Satu jujukan ditakrifkan oleh $T_1 = ${a}$ dan $T_{n+1} = T_n + ${d}$. Cari $${Tn(N)}$.`), a: T(`$${Tn(N)} = ${tk(a, d, N)}$`), w: T(`$${sq(ar(a, d, N))}$`), sp: 's' };
      if (v === 1) { const b = d * N + a + 5; return { q: T(`A sequence is defined by $T_1 = ${b}$ and $T_{n+1} = T_n - ${d}$. Find $${Tn(N)}$.`, `Satu jujukan ditakrifkan oleh $T_1 = ${b}$ dan $T_{n+1} = T_n - ${d}$. Cari $${Tn(N)}$.`), a: T(`$${Tn(N)} = ${tk(b, -d, N)}$`), sp: 's' }; }
      const m = r.pick([2, 3]); return { q: T(`A sequence is defined by $T_1 = ${a}$ and $T_{n+1} = ${m}T_n$. Find $${Tn(N)}$.`, `Satu jujukan ditakrifkan oleh $T_1 = ${a}$ dan $T_{n+1} = ${m}T_n$. Cari $${Tn(N)}$.`), a: T(`$${Tn(N)} = ${a * m ** (N - 1)}$`), sp: 's' };
    },
    /* common difference */
    (r) => {
      const s = AS(r, { d: r.pick([-7, -5, -3, 2, 4, 6, 9]), a: r.int(15, 40) }), l = s.l.slice(0, 5), v = r.int(0, 3);
      if (v === 0) return { q: T(`Find the common difference of the sequence $${dots(l)}$.`, `Cari beza sepunya bagi jujukan $${dots(l)}$.`), a: T(`$d = ${n(s.d)}$`), sp: 'xs' };
      if (v === 1) { const o = mc(r, `$${n(s.d)}$`, [`$${n(-s.d)}$`, `$${n(s.d + 1)}$`, `$${n(s.d - 1)}$`]); return { q: cat(T(`What is the common difference of $${dots(l)}$?<br>`, `Apakah beza sepunya bagi $${dots(l)}$?<br>`), o.q), a: o.a, sp: 's' }; }
      if (v === 2) { const inc = s.d > 0; return { q: T(`Is the sequence $${dots(l)}$ increasing or decreasing? State the amount by which each term changes.`, `Adakah jujukan $${dots(l)}$ menokok atau menyusut? Nyatakan amaun setiap sebutan berubah.`), a: T(`${inc ? 'Increasing' : 'Decreasing'}, by ${Math.abs(s.d)} each time`, `${inc ? 'Menokok' : 'Menyusut'}, sebanyak ${Math.abs(s.d)} setiap kali`), sp: 's' }; }
      const ok = r.chance(), lst = ok ? l : l.map((x, i) => (i === 3 ? x + 1 : x)); return { q: T(`Does the sequence $${sq(lst)},\\ \\ldots$ have a common difference? Give a reason.`, `Adakah jujukan $${sq(lst)},\\ \\ldots$ mempunyai beza sepunya? Beri satu sebab.`), a: ok ? T(`Yes, the difference is always ${n(s.d)}`, `Ya, bezanya sentiasa ${n(s.d)}`) : T(`No, the differences are ${diffs(lst).map(n).join(', ')}`, `Tidak, bezanya ialah ${diffs(lst).map(n).join(', ')}`), sp: 's' };
    },
    /* the order of a sequence matters */
    (r) => {
      const s = AS(r, { d: r.int(2, 7), a: r.int(1, 12) }), l = s.l.slice(0, 4), v = r.int(0, 1);
      if (v === 0) return { q: T(`Ali writes the sequence $${sq(l)},\\ \\ldots$ and Aina writes $${sq(l.slice().reverse())}$. Are these the same sequence? Explain why the order of the terms is important.`, `Ali menulis jujukan $${sq(l)},\\ \\ldots$ dan Aina menulis $${sq(l.slice().reverse())}$. Adakah ini jujukan yang sama? Terangkan mengapa susunan sebutan penting.`), a: T(`No. In a sequence each term has a fixed position ($T_1$, $T_2$, …); reversing the order changes every term's position.`, `Tidak. Dalam satu jujukan setiap sebutan mempunyai kedudukan yang tetap ($T_1$, $T_2$, …); membalikkan susunan mengubah kedudukan setiap sebutan.`), sp: 's' };
      return { q: T(`A sequence begins $${sq(l)},\\ \\ldots$ Write down the term that comes before $T_1$ if the same rule is used backwards.`, `Satu jujukan bermula $${sq(l)},\\ \\ldots$ Tulis sebutan yang datang sebelum $T_1$ jika peraturan yang sama digunakan ke belakang.`), a: T(`$${l[0] - s.d}$`), sp: 'xs' };
    },
    /* context, small k */
    (r) => { const k = r.int(4, 6), c = cx(r, k); return { q: T(`${c.i.en}. The amounts form a sequence. Write the first ${k} terms and state the ${ordE(k)} term.`, `${c.i.ms}. Amaun-amaun itu membentuk satu jujukan. Tulis ${k} sebutan pertama dan nyatakan sebutan ${ke(k)}.`), a: T(`$${sq(Array.from({ length: k }, (_, i) => c.val(i + 1)))}$; ${ordE(k)} term = ${c.val(k)}`, `$${sq(Array.from({ length: k }, (_, i) => c.val(i + 1)))}$; sebutan ${ke(k)} = ${c.val(k)}`), sp: 's' }; },
    /* which sequence has a common difference (MCQ) */
    (r) => {
      const s = R.add(r), m = R.mul(r), f = R.fib(r), q2 = R.sqr(r);
      const o = mc(r, `$${sq(s.l.slice(0, 5))}$`, [`$${sq(m.l.slice(0, 5))}$`, `$${sq(f.l.slice(0, 5))}$`, `$${sq(q2.l.slice(0, 5))}$`], '<br>');
      return { q: cat(T('Which of these sequences has a common difference between consecutive terms?<br>', 'Yang manakah antara jujukan ini mempunyai beza sepunya antara sebutan berturutan?<br>'), o.q), a: o.a, sp: 's' };
    },
    /* table with T_n labels */
    (r) => {
      const s = AS(r, { d: r.nz(-6, 6), a: r.int(10, 30) }), l = s.l.slice(0, 5), bl = r.pick([[2, 4], [3], [1, 3]]);
      const hd = [1, 2, 3, 4, 5].map((k) => `T<sub>${k}</sub>`);
      const tb = SPM.table([hd, l.map((v, i) => (bl.includes(i) ? '?' : n(v)))]);
      return { q: T(`The table shows the first five terms of a sequence with a constant difference. Find the missing terms.<br>${tb}`, `Jadual menunjukkan lima sebutan pertama satu jujukan dengan beza yang malar. Cari sebutan yang hilang.<br>${tb}`), a: T(`$${sq(bl.map((i) => l[i]))}$`), sp: 's' };
    },
    /* middle term */
    (r) => {
      const s = AS(r, { d: r.int(2, 9), a: r.int(2, 20) });
      return { q: T(`$T_1 = ${s.l[0]}$ and $T_3 = ${s.l[2]}$ in a sequence with a constant difference. Find $T_2$.`, `$T_1 = ${s.l[0]}$ dan $T_3 = ${s.l[2]}$ dalam satu jujukan dengan beza yang malar. Cari $T_2$.`), a: T(`$T_2 = ${s.l[1]}$`), w: T(`$d = (${s.l[2]} - ${s.l[0]}) \\div 2 = ${s.d}$`, `$d = (${s.l[2]} - ${s.l[0]}) \\div 2 = ${s.d}$`), sp: 's' };
    },
    /* geometric, small */
    (r) => {
      const a = r.int(1, 6), m = r.pick([2, 3, 4]), N = r.int(4, 5), v = r.int(0, 1);
      return v === 0 ? { q: T(`A sequence starts at ${a} and each term is ${m} times the term before it. Write $T_1$ to $T_${N}$.`, `Satu jujukan bermula pada ${a} dan setiap sebutan ialah ${m} kali sebutan sebelumnya. Tulis $T_1$ hingga $T_${N}$.`), a: T(`$${sq(Array.from({ length: N }, (_, i) => a * m ** i))}$`), sp: 's' }
        : { q: T(`In the sequence $${dots(Array.from({ length: 4 }, (_, i) => a * m ** i))}$ each term is multiplied by the same number. Find this number and $T_5$.`, `Dalam jujukan $${dots(Array.from({ length: 4 }, (_, i) => a * m ** i))}$ setiap sebutan didarab dengan nombor yang sama. Cari nombor ini dan $T_5$.`), a: T(`Multiply by ${m}; $T_5 = ${a * m ** 4}$`, `Darab dengan ${m}; $T_5 = ${a * m ** 4}$`), sp: 's' };
    },
    /* named sequences */
    (r) => {
      const k = r.int(3, 9), N = r.pick([4, 5, 6]), v = r.int(0, 3);
      const tx = [[T(`the multiples of ${k}`, `gandaan bagi ${k}`), ar(k, k, N)], [T('the odd numbers', 'nombor ganjil'), ar(1, 2, N)], [T('the square numbers', 'nombor kuasa dua sempurna'), Array.from({ length: N }, (_, i) => (i + 1) ** 2)], [T('the even numbers starting from 2', 'nombor genap bermula daripada 2'), ar(2, 2, N)]][v];
      return { q: T(`A sequence is made up of ${tx[0].en}, in order. Write down $T_1$ to $T_${N}$.`, `Satu jujukan terdiri daripada ${tx[0].ms}, mengikut susunan. Tulis $T_1$ hingga $T_${N}$.`), a: T(`$${sq(tx[1])}$`), sp: 's' };
    },
    /* true / false about notation */
    (r) => {
      const s = AS(r, { d: r.int(2, 9), a: r.int(2, 15) }), l = s.l, i = r.int(2, 6), j = i + 1;
      const st = [[T(`$${Tn(i)}$ is the ${ordE(i)} term of the sequence`, `$${Tn(i)}$ ialah sebutan ${ke(i)} bagi jujukan itu`), true], [T(`$${Tn(i)} = ${l[i - 1]}$`, `$${Tn(i)} = ${l[i - 1]}$`), true], [T(`$${Tn(i)} = ${l[i]}$`, `$${Tn(i)} = ${l[i]}$`), false], [T(`$${Tn(j)} - ${Tn(i)} = ${s.d + 1}$`, `$${Tn(j)} - ${Tn(i)} = ${s.d + 1}$`), false], [T(`$${Tn(j)} - ${Tn(i)} = ${s.d}$`, `$${Tn(j)} - ${Tn(i)} = ${s.d}$`), true], [T(`$T_1$ is the first term, so $T_0$ is the term before it`, `$T_1$ ialah sebutan pertama, jadi $T_0$ ialah sebutan sebelumnya`), false]];
      const pk = r.sample(st, 3);
      return { q: T(`The sequence $${dots(l.slice(0, 5))}$ has first term $T_1 = ${l[0]}$. True or false? (a) ${pk[0][0].en} (b) ${pk[1][0].en} (c) ${pk[2][0].en}`, `Jujukan $${dots(l.slice(0, 5))}$ mempunyai sebutan pertama $T_1 = ${l[0]}$. Betul atau salah? (a) ${pk[0][0].ms} (b) ${pk[1][0].ms} (c) ${pk[2][0].ms}`), a: T(pk.map((x, k) => `(${'abc'[k]}) ${x[1] ? 'True' : 'False'}`).join(' '), pk.map((x, k) => `(${'abc'[k]}) ${x[1] ? 'Betul' : 'Salah'}`).join(' ')), sp: 's' };
    },
  ];
  const gm12 = [
    /* T_k without listing, forms */
    (r) => {
      const s = AS(r, { d: r.nz(-7, 7), a: r.int(-5, 30) }), k = r.pick([10, 12, 15, 20]), v = r.int(0, 3), l = s.l.slice(0, 4);
      need(s.d > 0 || s.a + (k - 1) * s.d > -60);
      const ans = T(`$${Tn(k)} = ${tk(s.a, s.d, k)}$`), w = T(`$T_n = ${s.a} + (n - 1)(${s.d})$`, `$T_n = ${s.a} + (n - 1)(${s.d})$`);
      if (v === 0) return { q: T(`Find $${Tn(k)}$ of the sequence $${dots(l)}$ without listing all the terms.`, `Cari $${Tn(k)}$ bagi jujukan $${dots(l)}$ tanpa menyenaraikan semua sebutan.`), a: ans, w, sp: 's' };
      if (v === 1) return { q: T(`A sequence has $T_1 = ${s.a}$ and $T_2 = ${s.a + s.d}$, with a constant difference. Calculate $${Tn(k)}$.`, `Satu jujukan mempunyai $T_1 = ${s.a}$ dan $T_2 = ${s.a + s.d}$, dengan beza yang malar. Hitung $${Tn(k)}$.`), a: ans, w, sp: 's' };
      if (v === 2) return { q: T(`For an arithmetic sequence, $T_n = T_1 + (n - 1)d$. Use it to find $${Tn(k)}$ when $T_1 = ${s.a}$ and $d = ${s.d}$.`, `Bagi satu jujukan aritmetik, $T_n = T_1 + (n - 1)d$. Gunakannya untuk mencari $${Tn(k)}$ apabila $T_1 = ${s.a}$ dan $d = ${s.d}$.`), a: ans, sp: 's' };
      const who = r.name(); return { q: T(`${who} lists the sequence $${dots(l)}$ up to the ${ordE(k)} term. Find the value of the last term ${who} writes down without listing.`, `${who} menyenaraikan jujukan $${dots(l)}$ sehingga sebutan ${ke(k)}. Cari nilai sebutan terakhir yang ditulis oleh ${who} tanpa menyenaraikan.`), a: ans, w, sp: 's' };
    },
    /* is X a term? */
    (r) => {
      const s = AS(r, { d: r.int(2, 9), a: r.int(1, 15) }), N = r.int(9, 25), yes = r.chance(), X = tk(s.a, s.d, N) + (yes ? 0 : r.int(1, s.d - 1)), l = s.l.slice(0, 4), v = r.int(0, 1);
      const res = (X - s.a) / s.d + 1;
      const anw = yes ? T(`Yes, $${Tn(N)}$: $n = (${X} - ${s.a}) \\div ${s.d} + 1 = ${N}$`, `Ya, $${Tn(N)}$: $n = (${X} - ${s.a}) \\div ${s.d} + 1 = ${N}$`) : T(`No: $n = (${X} - ${s.a}) \\div ${s.d} + 1 = ${n(round(res, 3))}$, not a whole number`, `Tidak: $n = (${X} - ${s.a}) \\div ${s.d} + 1 = ${n(round(res, 3))}$, bukan nombor bulat`);
      return v === 0 ? { q: T(`Is ${X} a term of the sequence $${dots(l)}$? If it is, state which term it is.`, `Adakah ${X} suatu sebutan bagi jujukan $${dots(l)}$? Jika ya, nyatakan sebutan yang ke berapa.`), a: anw, sp: 's' }
        : { q: T(`Solve $${s.a} + (n - 1) \\times ${s.d} = ${X}$ to decide whether ${X} is a term of $${dots(l)}$.`, `Selesaikan $${s.a} + (n - 1) \\times ${s.d} = ${X}$ untuk memutuskan sama ada ${X} ialah sebutan bagi $${dots(l)}$.`), a: anw, sp: 's' };
    },
    /* which term equals X */
    (r) => {
      const s = AS(r, { d: r.int(2, 9), a: r.int(1, 15) }), N = r.int(9, 30), l = s.l.slice(0, 4);
      return { q: T(`Which term of the sequence $${dots(l)}$ is equal to ${tk(s.a, s.d, N)}?`, `Sebutan yang ke berapakah bagi jujukan $${dots(l)}$ yang sama dengan ${tk(s.a, s.d, N)}?`), a: T(`$${Tn(N)}$`), w: T(`$${s.a} + (n-1) \\times ${s.d} = ${tk(s.a, s.d, N)}$`, `$${s.a} + (n-1) \\times ${s.d} = ${tk(s.a, s.d, N)}$`), sp: 's' };
    },
    /* work back to T1 */
    (r) => {
      const s = AS(r, { d: r.int(2, 8) * r.sign(), a: r.int(10, 30) }), p = r.int(4, 8), q = p + r.int(4, 10);
      need(s.a + (q - 1) * s.d > -50);
      return { q: T(`In a sequence with a constant difference, $${Tn(p)} = ${tk(s.a, s.d, p)}$ and the common difference is ${s.d}. Find $T_1$ and $${Tn(q)}$.`, `Dalam satu jujukan dengan beza yang malar, $${Tn(p)} = ${tk(s.a, s.d, p)}$ dan beza sepunya ialah ${s.d}. Cari $T_1$ dan $${Tn(q)}$.`), a: T(`$T_1 = ${s.a}$; $${Tn(q)} = ${tk(s.a, s.d, q)}$`), sp: 'm' };
    },
    /* find d from T1 and Tk */
    (r) => {
      const s = AS(r, { d: r.int(2, 9) * r.sign(), a: r.int(10, 40) }), k = r.int(5, 9), m = r.int(12, 20);
      need(s.a + (m - 1) * s.d > -50);
      return { q: T(`$T_1 = ${s.a}$ and $${Tn(k)} = ${tk(s.a, s.d, k)}$ in a sequence with a constant difference. Find the common difference and $${Tn(m)}$.`, `$T_1 = ${s.a}$ dan $${Tn(k)} = ${tk(s.a, s.d, k)}$ dalam satu jujukan dengan beza yang malar. Cari beza sepunya dan $${Tn(m)}$.`), a: T(`$d = ${s.d}$; $${Tn(m)} = ${tk(s.a, s.d, m)}$`), w: T(`$d = (${tk(s.a, s.d, k)} - ${s.a}) \\div ${k - 1}$`), sp: 'm' };
    },
    /* which number is a term (MCQ) */
    (r) => {
      const s = AS(r, { d: r.int(3, 9), a: r.int(1, 15) }), N = r.int(8, 20), l = s.l.slice(0, 4), right = tk(s.a, s.d, N);
      const wr = [1, 2, 3].map((j) => right + ((j % (s.d - 1 || 1)) + 1)).filter((x, i, ar2) => (x - s.a) % s.d !== 0 && ar2.indexOf(x) === i);
      need(wr.length >= 3);
      const o = mc(r, `$${right}$`, wr.slice(0, 3).map((x) => `$${x}$`));
      return { q: cat(T(`Which of these numbers is a term of the sequence $${dots(l)}$?<br>`, `Yang manakah antara nombor ini ialah sebutan bagi jujukan $${dots(l)}$?<br>`), o.q), a: cat(o.a, T(` (it is $${Tn(N)}$)`, ` (ia ialah $${Tn(N)}$)`)), sp: 's' };
    },
    /* recursive, two-step */
    (r) => {
      const a = r.int(1, 5), m = r.pick([2, 3]), c = r.pick([1, 2, -1]), N = r.pick([5, 6]), l = [a];
      for (let i = 1; i < N; i++) l.push(m * l[i - 1] + c);
      return { q: T(`A sequence is defined by $T_1 = ${a}$ and $T_{n+1} = ${m}T_n ${c < 0 ? '-' : '+'} ${Math.abs(c)}$. Find $${Tn(N)}$.`, `Satu jujukan ditakrifkan oleh $T_1 = ${a}$ dan $T_{n+1} = ${m}T_n ${c < 0 ? '-' : '+'} ${Math.abs(c)}$. Cari $${Tn(N)}$.`), a: T(`$${Tn(N)} = ${l[N - 1]}$`), w: T(`$${sq(l)}$`), sp: 's' };
    },
    /* geometric term */
    (r) => {
      const a = r.int(1, 5), m = r.pick([2, 3]), k = r.int(6, 9), l = Array.from({ length: 4 }, (_, i) => a * m ** i), v = r.int(0, 1);
      return v === 0 ? { q: T(`Each term of the sequence $${dots(l)}$ is found by multiplying the previous term by the same number. Find $${Tn(k)}$.`, `Setiap sebutan bagi jujukan $${dots(l)}$ diperoleh dengan mendarab sebutan sebelumnya dengan nombor yang sama. Cari $${Tn(k)}$.`), a: T(`$${Tn(k)} = ${a * m ** (k - 1)}$`), w: T(`Multiply by ${m}: $${a} \\times ${m}^{${k - 1}}$`, `Darab dengan ${m}: $${a} \\times ${m}^{${k - 1}}$`), sp: 's' }
        : { q: T(`Which term of the sequence $${dots(l)}$ (each term is ${m} times the one before) equals ${a * m ** (k - 1)}?`, `Sebutan yang ke berapakah bagi jujukan $${dots(l)}$ (setiap sebutan ialah ${m} kali sebutan sebelumnya) sama dengan ${a * m ** (k - 1)}?`), a: T(`$${Tn(k)}$`), sp: 's' };
    },
    /* context, formula use */
    (r) => { const k = r.int(9, 14), c = cx(r, k); return { q: T(`${c.i.en}. Find ${c.w.en} ${c.at(k).en}.`, `${c.i.ms}. Cari ${c.w.ms} ${c.at(k).ms}.`), a: fmtU(c, c.val(k)), w: T(`$${c.a} ${c.dec ? '-' : '+'} ${k - 1} \\times ${c.d}$`), sp: 's' }; },
    /* difference between two terms */
    (r) => {
      const s = AS(r, { d: r.int(2, 9), a: r.int(1, 15) }), k = r.int(3, 8), j = r.int(3, 8), l = s.l.slice(0, 4);
      return { q: T(`The sequence $${dots(l)}$ has a constant difference. Without finding either term, work out how much bigger $${Tn(k + j)}$ is than $${Tn(k)}$.`, `Jujukan $${dots(l)}$ mempunyai beza yang malar. Tanpa mencari kedua-dua sebutan, hitung berapa banyak $${Tn(k + j)}$ lebih besar daripada $${Tn(k)}$.`), a: T(`$${j} \\times ${s.d} = ${j * s.d}$`), w: T(`$${j}$ steps of $${s.d}$`, `$${j}$ langkah sebanyak $${s.d}$`), sp: 's' };
    },
    /* between which two terms */
    (r) => {
      const s = AS(r, { d: r.int(4, 9), a: r.int(1, 12) }), N = r.int(6, 15), X = tk(s.a, s.d, N) + r.int(1, s.d - 1), l = s.l.slice(0, 4);
      return { q: T(`Between which two consecutive terms of the sequence $${dots(l)}$ does ${X} lie?`, `Antara dua sebutan berturutan yang manakah bagi jujukan $${dots(l)}$ nombor ${X} terletak?`), a: T(`Between $${Tn(N)} = ${tk(s.a, s.d, N)}$ and $${Tn(N + 1)} = ${tk(s.a, s.d, N + 1)}$`, `Antara $${Tn(N)} = ${tk(s.a, s.d, N)}$ dan $${Tn(N + 1)} = ${tk(s.a, s.d, N + 1)}$`), sp: 's' };
    },
    /* decimals / fractions in the sequence */
    (r) => {
      const d = r.pick([0.5, 1.5, 2.5, 0.25, 0.2, 0.4, 1.2]), a = r.pick([0.5, 1, 1.5, 2, 3, 2.5]), k = r.pick([10, 12, 15, 20]), l = ar(a, d, 4);
      return { q: T(`Find $${Tn(k)}$ of the sequence $${dots(l)}$.`, `Cari $${Tn(k)}$ bagi jujukan $${dots(l)}$.`), a: T(`$${Tn(k)} = ${n(tk(a, d, k))}$`), w: T(`$${n(a)} + ${k - 1} \\times ${n(d)}$`), sp: 's' };
    },
    /* sum / product of two terms */
    (r) => {
      const s = AS(r, { d: r.int(2, 8), a: r.int(1, 10) }), p = r.int(6, 12), q = p + r.int(2, 8), l = s.l.slice(0, 4);
      return { q: T(`Find $${Tn(p)} + ${Tn(q)}$ for the sequence $${dots(l)}$.`, `Cari $${Tn(p)} + ${Tn(q)}$ bagi jujukan $${dots(l)}$.`), a: T(`$${tk(s.a, s.d, p)} + ${tk(s.a, s.d, q)} = ${tk(s.a, s.d, p) + tk(s.a, s.d, q)}$`), sp: 's' };
    },
    /* which working is correct (MCQ) */
    (r) => {
      const s = AS(r, { d: r.int(2, 8), a: r.int(2, 12) }), k = r.pick([10, 12, 15, 20]), l = s.l.slice(0, 4);
      const ok = `$${s.a} + ${k - 1} \\times ${s.d} = ${tk(s.a, s.d, k)}$`, o = mc(r, ok, [`$${s.a} + ${k} \\times ${s.d} = ${s.a + k * s.d}$`, `$${k} \\times ${s.d} = ${k * s.d}$`, `$${s.a} + ${k + 1} \\times ${s.d} = ${s.a + (k + 1) * s.d}$`], '<br>');
      return { q: cat(T(`Which working correctly gives $${Tn(k)}$ of the sequence $${dots(l)}$?<br>`, `Pengiraan yang manakah memberi $${Tn(k)}$ bagi jujukan $${dots(l)}$ dengan betul?<br>`), o.q), a: o.a, sp: 's' };
    },
    /* number of terms */
    (r) => {
      const s = AS(r, { d: r.int(2, 9), a: r.int(1, 12) }), N = r.int(12, 40);
      return { q: T(`How many terms are there in the sequence $${sq(s.l.slice(0, 3))},\\ \\ldots,\\ ${tk(s.a, s.d, N)}$?`, `Berapakah bilangan sebutan dalam jujukan $${sq(s.l.slice(0, 3))},\\ \\ldots,\\ ${tk(s.a, s.d, N)}$?`), a: T(`${N}`), w: T(`$${s.a} + (n-1) \\times ${s.d} = ${tk(s.a, s.d, N)}$`), sp: 's' };
    },
  ];
  const ga12 = [
    /* decreasing sequence: which term equals a negative value? (yes / no) */
    (r) => {
      const d = r.int(2, 7), a = r.int(10, 30), N = r.int(10, 20), yes = r.chance(), X = a - (N - 1) * d + (yes ? 0 : -r.int(1, d - 1 || 1)), l = ar(a, -d, 4);
      need(yes || d > 1);
      const nn = (a - X) / d + 1;
      return { q: T(`Determine whether ${X} is a term of the sequence $${dots(l)}$. If it is, state which term it is.`, `Tentukan sama ada ${X} ialah sebutan bagi jujukan $${dots(l)}$. Jika ya, nyatakan sebutan yang ke berapa.`), a: yes ? T(`Yes: $${a} - ${d}(n - 1) = ${X}$ gives $n = ${N}$, so it is $${Tn(N)}$`, `Ya: $${a} - ${d}(n - 1) = ${X}$ memberi $n = ${N}$, jadi ia ialah $${Tn(N)}$`) : T(`No: $n = ${n(round(nn, 3))}$ is not a whole number`, `Tidak: $n = ${n(round(nn, 3))}$ bukan nombor bulat`), sp: 'm' };
    },
    /* which term equals zero */
    (r) => {
      const d = r.int(2, 6), N = r.int(8, 15), a = d * (N - 1), l = ar(a, -d, 4), yes = r.chance(), X = 0;
      return { q: T(`The sequence $${dots(l)}$ continues in the same way. Which term is equal to 0, and what is the next term after it?`, `Jujukan $${dots(l)}$ diteruskan dengan cara yang sama. Sebutan yang ke berapakah sama dengan 0, dan apakah sebutan selepasnya?`), a: T(`$${Tn(N)} = 0$; the next term is $${-d}$`, `$${Tn(N)} = 0$; sebutan berikutnya ialah $${-d}$`), sp: 'm' };
    },
    /* two terms given: find a, d and another term */
    (r) => {
      const s = AS(r, { d: r.int(2, 7) * r.sign(), a: r.int(-5, 25) }), p = r.int(3, 6), q = p + r.int(3, 6), m = r.int(15, 25);
      need(s.a + (m - 1) * s.d > -80);
      return { q: T(`In a sequence with a constant difference, $${Tn(p)} = ${tk(s.a, s.d, p)}$ and $${Tn(q)} = ${tk(s.a, s.d, q)}$. Find (a) the common difference, (b) $T_1$, (c) $${Tn(m)}$.`, `Dalam satu jujukan dengan beza yang malar, $${Tn(p)} = ${tk(s.a, s.d, p)}$ dan $${Tn(q)} = ${tk(s.a, s.d, q)}$. Cari (a) beza sepunya, (b) $T_1$, (c) $${Tn(m)}$.`), a: T(`(a) $${s.d}$ (b) $${s.a}$ (c) $${tk(s.a, s.d, m)}$`), w: T(`$d = (${tk(s.a, s.d, q)} - ${tk(s.a, s.d, p)}) \\div ${q - p}$`), sp: 'm' };
    },
    /* expressions in consecutive terms */
    (r) => {
      const x0 = r.int(2, 8), p1 = r.int(1, 3), p2 = r.int(2, 4), p3 = r.int(3, 6);
      need(p3 - 2 * p2 + p1 !== 0);
      const q1 = r.int(-4, 4), q2 = r.int(-4, 4), q3 = q2 + (q2 - q1) + (p2 - p1) * x0 - (p3 - p2) * x0;
      const e = (p, q) => lin(p, q, 'x'), v = (p, q) => p * x0 + q, t = [v(p1, q1), v(p2, q2), v(p3, q3)];
      need(t[1] - t[0] === t[2] - t[1] && t[1] - t[0] > 0 && t[0] > 0);
      return { q: T(`The expressions $${e(p1, q1)}$, $${e(p2, q2)}$ and $${e(p3, q3)}$ are three consecutive terms of a sequence with a constant difference. Find the value of $x$ and the common difference.`, `Ungkapan $${e(p1, q1)}$, $${e(p2, q2)}$ dan $${e(p3, q3)}$ ialah tiga sebutan berturutan bagi satu jujukan dengan beza yang malar. Cari nilai $x$ dan beza sepunya.`), a: T(`$x = ${x0}$; $d = ${t[1] - t[0]}$ (terms $${sq(t)}$)`), w: T(`$(${e(p2, q2)}) - (${e(p1, q1)}) = (${e(p3, q3)}) - (${e(p2, q2)})$`), sp: 'l' };
    },
    /* which step reaches value: context */
    (r) => {
      const c = cx(r, 12), N = r.int(8, 14), yes = r.chance(); need(c.val(N) > 0);
      const X = c.val(N) + (yes ? 0 : (c.dec ? -1 : 1) * r.int(1, c.d - 1 || 1)); need(yes || c.d > 1 && X > 0);
      const nn = c.dec ? (c.a - X) / c.d + 1 : (X - c.a) / c.d + 1;
      return { q: T(`${c.i.en}. Will ${c.w.en} ever be exactly ${c.c.u[0]}${X}${c.c.u[1]}? If so, at which step?`, `${c.i.ms}. Adakah ${c.w.ms} pernah tepat ${c.c.u[0]}${X}${c.c.u[1].replace(' seats', ' tempat duduk').replace(' pages', ' halaman').replace(' litres', ' liter').replace(' tins', ' biji tin').replace(' minutes', ' minit')}? Jika ya, pada langkah yang ke berapa?`), a: yes ? T(`Yes, at step ${N}`, `Ya, pada langkah ke-${N}`) : T(`No: the step number would be ${n(round(nn, 3))}, not a whole number`, `Tidak: nombor langkah ialah ${n(round(nn, 3))}, bukan nombor bulat`), sp: 'm' };
    },
    /* count terms in a finite sequence, and the middle term */
    (r) => {
      const d = r.int(3, 8), a = r.int(2, 10), h = r.int(6, 15), N = 2 * h + 1, l = ar(a, d, 3);
      return { q: T(`The finite sequence $${sq(l)},\\ \\ldots,\\ ${tk(a, d, N)}$ has a constant difference. (a) How many terms does it have? (b) Find the middle term.`, `Jujukan terhingga $${sq(l)},\\ \\ldots,\\ ${tk(a, d, N)}$ mempunyai beza yang malar. (a) Berapakah bilangan sebutannya? (b) Cari sebutan tengah.`), a: T(`(a) ${N} (b) the ${ordE(h + 1)} term, ${tk(a, d, h + 1)}`, `(a) ${N} (b) sebutan ${ke(h + 1)}, ${tk(a, d, h + 1)}`), sp: 'm' };
    },
    /* geometric: which term? */
    (r) => {
      const a = r.int(1, 5), m = r.pick([2, 3]), k = r.int(6, 9), X = a * m ** (k - 1);
      return { q: T(`A sequence starts at ${a} and each term is ${m} times the previous term. (a) Write the first five terms. (b) Which term is ${X}?`, `Satu jujukan bermula pada ${a} dan setiap sebutan ialah ${m} kali sebutan sebelumnya. (a) Tulis lima sebutan pertama. (b) Sebutan yang ke berapakah ialah ${X}?`), a: T(`(a) $${sq(Array.from({ length: 5 }, (_, i) => a * m ** i))}$ (b) $${Tn(k)}$`), sp: 'm' };
    },
    /* explain an error */
    (r) => {
      const s = AS(r, { d: r.int(2, 8), a: r.int(2, 12) }), k = r.pick([10, 12, 15, 20]), who = r.name(), l = s.l.slice(0, 4);
      return { q: T(`${who} finds $${Tn(k)}$ of the sequence $${dots(l)}$ like this: "$${Tn(k)} = ${s.a} + ${k} \\times ${s.d} = ${s.a + k * s.d}$". Explain ${who}'s mistake and give the correct value.`, `${who} mencari $${Tn(k)}$ bagi jujukan $${dots(l)}$ seperti ini: "$${Tn(k)} = ${s.a} + ${k} \\times ${s.d} = ${s.a + k * s.d}$". Terangkan kesilapan ${who} dan beri nilai yang betul.`), a: T(`From $T_1$ to $${Tn(k)}$ there are only ${k - 1} steps, not ${k}. $${Tn(k)} = ${s.a} + ${k - 1} \\times ${s.d} = ${tk(s.a, s.d, k)}$`, `Dari $T_1$ ke $${Tn(k)}$ hanya ada ${k - 1} langkah, bukan ${k}. $${Tn(k)} = ${s.a} + ${k - 1} \\times ${s.d} = ${tk(s.a, s.d, k)}$`), sp: 'm' };
    },
    /* chained multi-part */
    (r) => {
      const s = AS(r, { d: r.int(3, 9), a: r.int(2, 15) }), k = r.int(15, 30), N = r.int(20, 40), yes = r.chance(), l = s.l.slice(0, 4);
      const X = tk(s.a, s.d, N) + (yes ? 0 : 1); need(yes || s.d > 1);
      const parts = [[T(`Find the common difference.`, `Cari beza sepunya.`), T(`${s.d}`)], [T(`Find $${Tn(k)}$.`, `Cari $${Tn(k)}$.`), T(`${tk(s.a, s.d, k)}`)], [T(`Is ${X} a term of the sequence? Give a reason.`, `Adakah ${X} suatu sebutan bagi jujukan itu? Beri satu sebab.`), yes ? T(`Yes, $${Tn(N)}$`, `Ya, $${Tn(N)}$`) : T(`No, $n = ${n(round((X - s.a) / s.d + 1, 3))}$`, `Tidak, $n = ${n(round((X - s.a) / s.d + 1, 3))}$`)], [T(`Which term is ${tk(s.a, s.d, N)}?`, `Sebutan yang ke berapakah ${tk(s.a, s.d, N)}?`), T(`$${Tn(N)}$`)]];
      const pick = r.sample([0, 1, 2, 3], 3).sort();
      return { q: cat(T(`The sequence $${dots(l)}$ has a constant difference. `, `Jujukan $${dots(l)}$ mempunyai beza yang malar. `), PT(pick.map((i) => parts[i][0]))), a: PT(pick.map((i) => parts[i][1])), sp: 'l' };
    },
    /* fraction sequence */
    (r) => {
      const q = r.pick([2, 3, 4, 5]), p = r.int(1, q - 1), st = r.int(1, q - 1), a = Fr.make(p, q), d = Fr.make(st, q), k = r.int(8, 14);
      const t = (i) => Fr.add(a, Fr.mul(d, Fr.make(i - 1)));
      const list = [1, 2, 3, 4].map((i) => Fr.tex(t(i)));
      need(d.d > 1 || true);
      return { q: T(`The sequence $${list.join(',\\ ')},\\ \\ldots$ has a constant difference. Find $${Tn(k)}$.`, `Jujukan $${list.join(',\\ ')},\\ \\ldots$ mempunyai beza yang malar. Cari $${Tn(k)}$.`), a: T(`$${Tn(k)} = ${Fr.mixed(t(k))}$`), sp: 'm' };
    },
    /* negative first term */
    (r) => {
      const d = r.int(3, 8), a = -r.int(10, 40), k = r.int(10, 20), l = ar(a, d, 4);
      return { q: T(`Find $${Tn(k)}$ of the sequence $${dots(l)}$, and state whether it is positive or negative.`, `Cari $${Tn(k)}$ bagi jujukan $${dots(l)}$, dan nyatakan sama ada ia positif atau negatif.`), a: T(`$${Tn(k)} = ${tk(a, d, k)}$, ${tk(a, d, k) >= 0 ? (tk(a, d, k) === 0 ? 'zero' : 'positive') : 'negative'}`, `$${Tn(k)} = ${tk(a, d, k)}$, ${tk(a, d, k) >= 0 ? (tk(a, d, k) === 0 ? 'sifar' : 'positif') : 'negatif'}`), sp: 'm' };
    },
    /* compare two sequences at the same position */
    (r) => {
      const s1 = AS(r, { d: r.int(2, 6), a: r.int(20, 40) }), s2 = AS(r, { d: r.int(7, 12), a: r.int(1, 12) }), k = r.int(8, 15);
      return { q: T(`Sequence P is $${dots(s1.l.slice(0, 4))}$ and sequence Q is $${dots(s2.l.slice(0, 4))}$; both have a constant difference. Which sequence has the larger ${ordE(k)} term, and by how much?`, `Jujukan P ialah $${dots(s1.l.slice(0, 4))}$ dan jujukan Q ialah $${dots(s2.l.slice(0, 4))}$; kedua-duanya mempunyai beza yang malar. Jujukan yang manakah mempunyai sebutan ${ke(k)} yang lebih besar, dan berapa banyak?`), a: (() => { const p = tk(s1.a, s1.d, k), q = tk(s2.a, s2.d, k); need(p !== q); return T(`${p > q ? 'P' : 'Q'}: P = ${p}, Q = ${q}; difference ${Math.abs(p - q)}`, `${p > q ? 'P' : 'Q'}: P = ${p}, Q = ${q}; beza ${Math.abs(p - q)}`); })(), sp: 'm' };
    },
  ];
  /* ---- menu chains for 1.2: one sequence, shown in one of several representations, then 2-3 different tasks about it ---- */
  const P = (qe, qm, ae, am) => ({ q: T(qe, qm), a: T(ae, am === undefined ? ae : am) });
  const rn = (x) => n(round(x, 6));
  const chain = (r, intro, tasks, k) => {
    const ts = tasks.filter(Boolean), idx = r.sample(ts.map((_, i) => i), Math.min(k, ts.length)).sort((x, y) => x - y).map((i) => ts[i]);
    return { q: cat(intro, T('<br>'), PT(idx.map((t) => t.q))), a: PT(idx.map((t) => t.a)), sp: idx.length > 2 ? 'l' : 'm' };
  };
  const Tv = (k) => `$${Tn(k)}`;
  const tabRow = (l) => SPM.table([[1, 2, 3, 4, 5].map((i) => `T<sub>${i}</sub>`), l.slice(0, 5).map((v) => rn(v))]);
  /** a sequence with constant difference, in one of several representations; lv = e | m | a */
  const seqRep = (r, lv) => {
    const kind = r.pick(['list', 'list', 'table', 'rec', 'words', 'cx']);
    let a, d, c = null;
    if (kind === 'cx') { c = cx(r, 12); a = c.a; d = c.dec ? -c.d : c.d; }
    else if (lv === 'a' && r.chance(0.5)) { d = r.pick([0.5, 1.5, 2.5, 0.25, 0.2, 0.4, 1.2]) * r.sign(); a = r.pick([0.5, 1, 1.5, 2, 3, 2.5, 4, -1, -2.5]); }
    else if (lv === 'e') { d = r.int(2, 9) * (r.chance(0.25) ? -1 : 1); a = d < 0 ? r.int(55, 90) : r.int(1, 25); }
    else { d = r.nz(-9, 9); a = d < 0 && r.chance(0.5) ? r.int(20, 60) : r.int(-12, 40); }
    const t = (k) => round(a + (k - 1) * d, 6), l4 = [1, 2, 3, 4].map(t), sgn = d < 0;
    const adn = rn(Math.abs(d));
    const intro = {
      list: T(`The sequence $${dots(l4)}$ has a constant difference.`, `Jujukan $${dots(l4)}$ mempunyai beza yang malar.`),
      table: T(`The table shows the first five terms of a sequence with a constant difference.<br>${tabRow([1, 2, 3, 4, 5].map(t))}`, `Jadual menunjukkan lima sebutan pertama satu jujukan dengan beza yang malar.<br>${tabRow([1, 2, 3, 4, 5].map(t))}`),
      rec: T(`A sequence is defined by $T_1 = ${rn(a)}$ and $T_{n+1} = T_n ${sgn ? '-' : '+'} ${adn}$.`, `Satu jujukan ditakrifkan oleh $T_1 = ${rn(a)}$ dan $T_{n+1} = T_n ${sgn ? '-' : '+'} ${adn}$.`),
      words: T(`The first term of a sequence is ${rn(a)} and each term is ${adn} ${sgn ? 'less' : 'more'} than the term before it.`, `Sebutan pertama satu jujukan ialah ${rn(a)} dan setiap sebutan ${sgn ? 'kurang' : 'lebih'} ${adn} daripada sebutan sebelumnya.`),
      cx: c && T(`${c.i.en}. Let $T_n$ be ${c.w.en} at stage $n$, where stage 1 is the situation first described.`, `${c.i.ms}. Biarkan $T_n$ ialah ${c.w.ms} pada peringkat $n$, dengan peringkat 1 ialah situasi yang pertama diterangkan.`),
    }[kind];
    return { a, d, t, kind, intro, c };
  };
  const isT = (S, x) => { const nn = round((x - S.a) / S.d + 1, 6); return { ok: Number.isInteger(nn) && nn >= 1, nn }; };
  const termQ = (S, x) => { const v = isT(S, x); return v.ok ? [T(`Yes, $${Tn(v.nn)}$: $n = (${rn(x)} - ${rn(S.a)}) \\div ${rn(S.d)} + 1 = ${v.nn}$`, `Ya, $${Tn(v.nn)}$: $n = (${rn(x)} - ${rn(S.a)}) \\div ${rn(S.d)} + 1 = ${v.nn}$`)] : [T(`No: $n = (${rn(x)} - ${rn(S.a)}) \\div ${rn(S.d)} + 1 = ${rn(v.nn)}$ is not a positive whole number`, `Tidak: $n = (${rn(x)} - ${rn(S.a)}) \\div ${rn(S.d)} + 1 = ${rn(v.nn)}$ bukan nombor bulat positif`)]; };
  const E12t = (S, r) => {
    const { a, d, t } = S, j = r.int(6, 8), k = r.int(5, 8), X = t(j), no = r.chance(), Y = no ? round(X + d / 2, 6) : X;
    return [
      P('State the first term $T_1$ and the common difference.', 'Nyatakan sebutan pertama $T_1$ dan beza sepunya.', `$T_1 = ${rn(a)}$, $d = ${rn(d)}$`),
      P('Write down $T_6$ and $T_7$.', 'Tulis $T_6$ dan $T_7$.', `$${Tn(6)} = ${rn(t(6))}$, $${Tn(7)} = ${rn(t(7))}$`),
      P('Is the sequence increasing or decreasing? By how much does each term change?', 'Adakah jujukan itu menokok atau menyusut? Berapakah perubahan setiap sebutan?', d > 0 ? `Increasing, by ${rn(d)}` : `Decreasing, by ${rn(-d)}`, d > 0 ? `Menokok, sebanyak ${rn(d)}` : `Menyusut, sebanyak ${rn(-d)}`),
      P(`Find $${Tn(k)}$ by continuing the sequence.`, `Cari $${Tn(k)}$ dengan meneruskan jujukan itu.`, `$${Tn(k)} = ${rn(t(k))}$`),
      P('Write the term that comes just before $T_1$.', 'Tulis sebutan yang datang sebelum $T_1$.', rn(t(0))),
      P('Find $T_5 - T_2$.', 'Cari $T_5 - T_2$.', rn(t(5) - t(2))),
      P('Find $T_2 + T_3$.', 'Cari $T_2 + T_3$.', rn(t(2) + t(3))),
      P(`Which term of the sequence is equal to ${rn(X)}?`, `Sebutan yang ke berapakah sama dengan ${rn(X)}?`, `$${Tn(j)}$`),
      P(`Is ${rn(Y)} a term of the sequence? Give the term number if it is.`, `Adakah ${rn(Y)} suatu sebutan bagi jujukan itu? Beri nombor sebutan jika ya.`, ...(() => { const z = termQ(S, Y)[0]; return [z.en, z.ms]; })()),
      P('What must be added to $T_3$ to obtain $T_7$?', 'Apakah yang mesti ditambah kepada $T_3$ untuk mendapat $T_7$?', rn(t(7) - t(3))),
      P('Which is greater, $T_2$ or $T_5$, and by how much?', 'Yang manakah lebih besar, $T_2$ atau $T_5$, dan berapa banyak?', `${t(5) > t(2) ? 'T_5' : 'T_2'}: ${rn(Math.abs(t(5) - t(2)))}`.replace(/T_(\d)/, '$$T_$1$$')),
      P('Find the sum of the first three terms.', 'Cari hasil tambah tiga sebutan pertama.', rn(t(1) + t(2) + t(3))),
    ];
  };
  const M12t = (S, r) => {
    const { a, d, t } = S, k = r.int(10, 25), j = r.int(12, 30), p = r.int(6, 12), q = p + 2 * r.int(2, 6), no = r.chance(), Y = no ? round(t(j) + d / 2, 6) : t(j), X = t(j), Z = round(t(j) + d / 3 * r.pick([1, 2]), 6), x9 = t(r.int(3, 9)) ;
    const between = (() => { const g = r.int(8, 20); return [g, round(t(g) + d / 2, 6)]; })();
    const ib = Number.isInteger(a) && Number.isInteger(d);
    return [
      P(`Find $${Tn(k)}$ without listing the terms.`, `Cari $${Tn(k)}$ tanpa menyenaraikan sebutan.`, `$${Tn(k)} = ${rn(t(k))}$`, undefined),
      P(`Use $T_n = T_1 + (n - 1)d$ to find $${Tn(k + 5)}$.`, `Gunakan $T_n = T_1 + (n - 1)d$ untuk mencari $${Tn(k + 5)}$.`, `$${Tn(k + 5)} = ${rn(t(k + 5))}$`),
      P(`Which term of the sequence equals ${rn(X)}?`, `Sebutan yang ke berapakah bagi jujukan itu sama dengan ${rn(X)}?`, `$${Tn(j)}$`),
      P(`Is ${rn(Y)} a term of the sequence? Show your working.`, `Adakah ${rn(Y)} suatu sebutan bagi jujukan itu? Tunjukkan langkah kerja anda.`, ...(() => { const z = termQ(S, Y)[0]; return [z.en, z.ms]; })()),
      P(`Find $${Tn(p)} + ${Tn(q)}$.`, `Cari $${Tn(p)} + ${Tn(q)}$.`, rn(t(p) + t(q))),
      P(`How much ${d > 0 ? 'bigger' : 'smaller'} is $${Tn(q)}$ than $${Tn(p)}$?`, `Berapa banyak ${d > 0 ? 'lebih besar' : 'lebih kecil'} $${Tn(q)}$ berbanding $${Tn(p)}$?`, rn(Math.abs(t(q) - t(p)))),
      P(`Between which two consecutive terms does ${rn(between[1])} lie?`, `Antara dua sebutan berturutan yang manakah ${rn(between[1])} terletak?`, `$${Tn(between[0])} = ${rn(t(between[0]))}$ and $${Tn(between[0] + 1)} = ${rn(t(between[0] + 1))}$`, `$${Tn(between[0])} = ${rn(t(between[0]))}$ dan $${Tn(between[0] + 1)} = ${rn(t(between[0] + 1))}$`),
      P(`How many terms are there from $T_1$ up to and including the term ${rn(X)}?`, `Berapakah bilangan sebutan dari $T_1$ hingga sebutan ${rn(X)} (termasuk)?`, `${j}`),
      P(`Find the average of $${Tn(p)}$ and $${Tn(q)}$. Which term of the sequence is it?`, `Cari purata bagi $${Tn(p)}$ dan $${Tn(q)}$. Sebutan yang ke berapakah ia?`, `${rn((t(p) + t(q)) / 2)}, $${Tn((p + q) / 2)}$`),
      P(`Write $${Tn(k)}$, $${Tn(k + 1)}$ and $${Tn(k + 2)}$.`, `Tulis $${Tn(k)}$, $${Tn(k + 1)}$ dan $${Tn(k + 2)}$.`, `$${sq([t(k), t(k + 1), t(k + 2)])}$`),
      P(`Find $${Tn(2 * p)}$ and compare it with $2 \\times ${Tn(p)}$. Are they equal?`, `Cari $${Tn(2 * p)}$ dan bandingkannya dengan $2 \\times ${Tn(p)}$. Adakah sama?`, `${rn(t(2 * p))} and ${rn(2 * t(p))}: ${t(2 * p) === round(2 * t(p), 6) ? 'equal' : 'not equal'}`, `${rn(t(2 * p))} dan ${rn(2 * t(p))}: ${t(2 * p) === round(2 * t(p), 6) ? 'sama' : 'tidak sama'}`),
      ib ? P(`Is $${Tn(k)}$ an odd number or an even number?`, `Adakah $${Tn(k)}$ nombor ganjil atau nombor genap?`, `${Math.abs(t(k)) % 2 ? 'Odd' : 'Even'} (${rn(t(k))})`, `${Math.abs(t(k)) % 2 ? 'Ganjil' : 'Genap'} (${rn(t(k))})`) : null,
    ];
  };
  const A12t = (S, r) => {
    const { a, d, t } = S, N = r.int(15, 40), k = r.int(30, 60), p = r.int(10, 20), q = r.int(21, 35), no = r.chance(), Y = no ? round(t(N) + d / 2, 6) : t(N), h = r.int(8, 20), zeroN = round(1 - a / d, 6), odd = 2 * h + 1;
    return [
      P(`Determine whether ${rn(Y)} is a term. Show that the term number is (or is not) a positive integer.`, `Tentukan sama ada ${rn(Y)} ialah satu sebutan. Tunjukkan bahawa nombor sebutan ialah (atau bukan) integer positif.`, ...(() => { const z = termQ(S, Y)[0]; return [z.en, z.ms]; })()),
      P(`Which term equals ${rn(t(N))}? Verify that the position is a positive integer.`, `Sebutan yang ke berapakah sama dengan ${rn(t(N))}? Sahkan bahawa kedudukannya ialah integer positif.`, `$${Tn(N)}$`),
      P(`Is 0 a term of this sequence? Explain.`, `Adakah 0 suatu sebutan bagi jujukan ini? Terangkan.`, Number.isInteger(zeroN) && zeroN >= 1 ? `Yes, $${Tn(zeroN)} = 0$` : `No: $n = ${rn(zeroN)}$ ${zeroN < 1 ? 'is not positive' : 'is not a whole number'}`, Number.isInteger(zeroN) && zeroN >= 1 ? `Ya, $${Tn(zeroN)} = 0$` : `Tidak: $n = ${rn(zeroN)}$ ${zeroN < 1 ? 'bukan positif' : 'bukan nombor bulat'}`),
      P(`Find $${Tn(k)}$.`, `Cari $${Tn(k)}$.`, `$${Tn(k)} = ${rn(t(k))}$`),
      P(`The sequence is stopped at the term ${rn(t(N))}. How many terms does it have?`, `Jujukan itu dihentikan pada sebutan ${rn(t(N))}. Berapakah bilangan sebutannya?`, `${N}`),
      P(`A finite sequence of ${odd} terms follows the same rule. Find its middle term and the position of that term.`, `Satu jujukan terhingga yang mempunyai ${odd} sebutan mengikut peraturan yang sama. Cari sebutan tengahnya dan kedudukan sebutan itu.`, `$${Tn(h + 1)} = ${rn(t(h + 1))}$, position ${h + 1}`, `$${Tn(h + 1)} = ${rn(t(h + 1))}$, kedudukan ke-${h + 1}`),
      P(`Find $${Tn(p)} + ${Tn(q)}$.`, `Cari $${Tn(p)} + ${Tn(q)}$.`, rn(t(p) + t(q))),
      P(`Find the difference between $${Tn(q)}$ and $${Tn(p)}$.`, `Cari beza antara $${Tn(q)}$ dan $${Tn(p)}$.`, rn(t(q) - t(p))),
      P(`A student says $${Tn(p)} = T_1 + ${p} \\times d$. Explain the error and give the correct value.`, `Seorang murid berkata $${Tn(p)} = T_1 + ${p} \\times d$. Terangkan kesilapan itu dan beri nilai yang betul.`, `It should be $${p - 1}d$, not $${p}d$: $${Tn(p)} = ${rn(t(p))}$`, `Sepatutnya $${p - 1}d$, bukan $${p}d$: $${Tn(p)} = ${rn(t(p))}$`),
      no ? P(`Give a reason why ${rn(Y)} cannot be a term of the sequence.`, `Beri satu sebab mengapa ${rn(Y)} tidak boleh menjadi sebutan bagi jujukan itu.`, `$n = ${rn(isT(S, Y).nn)}$ is not a whole number`, `$n = ${rn(isT(S, Y).nn)}$ bukan nombor bulat`) : null,
      P(`Find $${Tn(k)} - ${Tn(k - 10)}$ without calculating either term.`, `Cari $${Tn(k)} - ${Tn(k - 10)}$ tanpa mengira mana-mana sebutan.`, `$10d = ${rn(10 * d)}$`),
    ];
  };
  const chainGen = (lv, tasks, ks) => (r) => { const S = seqRep(r, lv); const need1 = S.kind === 'words' || S.kind === 'rec'; return { ...chain(r, S.intro, tasks(S, r), r.pick(ks)) }; };
  ge12.push(chainGen('e', E12t, [2, 2, 3]), chainGen('e', E12t, [2, 3]));
  gm12.push(chainGen('m', M12t, [2, 3]), chainGen('m', M12t, [3]));
  ga12.push(chainGen('a', A12t, [3]), chainGen('a', A12t, [2, 3]));

  SPM.extend('F2-1.2', { e: ge12, m: gm12, a: ga12 });

  /* ================================================================ F2-1.3 Generalisation and problem solving */
  const Tl = (a, b) => `T_n = ${lin(a, b, 'n')}`;
  const wordsRule = (a, b) => T(`multiply the position $n$ by ${a}${b ? `, then ${b > 0 ? 'add' : 'subtract'} ${Math.abs(b)}` : ''}`, `darabkan kedudukan $n$ dengan ${a}${b ? `, kemudian ${b > 0 ? 'tambah' : 'tolak'} ${Math.abs(b)}` : ''}`);
  const LC = [
    { u: ['', ' cm', ' cm'], N: T('cups', 'biji cawan'), r: [[1, 3], [6, 12]], d: (a, b) => T(`A cup is ${a + b} cm tall. Each extra cup placed on a stack adds ${a} cm to the height of the stack.`, `Sebiji cawan setinggi ${a + b} cm. Setiap cawan tambahan yang diletakkan pada timbunan menambah ${a} cm kepada tinggi timbunan.`), w: T('the height of a stack of $n$ cups', 'tinggi timbunan $n$ biji cawan'), ask: (N) => T(`a stack of ${N} cups`, `timbunan ${N} biji cawan`), inv: (V) => T(`a stack that is ${V} cm high`, `timbunan yang tingginya ${V} cm`) },
    { u: ['', ' people', ' orang'], N: T('tables', 'meja'), r: [[2, 4], [1, 3]], d: (a, b) => T(`One table seats ${a + b} people. Each extra table joined to the end of the row adds ${a} seats.`, `Sebuah meja memuatkan ${a + b} orang. Setiap meja tambahan yang disambung pada hujung baris menambah ${a} tempat duduk.`), w: T('the number of people seated at $n$ tables in a row', 'bilangan orang yang duduk pada $n$ meja dalam satu baris'), ask: (N) => T(`${N} tables in a row`, `${N} meja dalam satu baris`), inv: (V) => T(`seating for ${V} people`, `tempat duduk untuk ${V} orang`) },
    { u: ['RM', '', ''], N: T('weeks', 'minggu'), r: [[2, 6], [3, 10]], d: (a, b) => T(`Hui Min saves RM${a + b} in week 1. Each week she saves RM${a} more than the week before.`, `Hui Min menyimpan RM${a + b} pada minggu pertama. Setiap minggu dia menyimpan RM${a} lebih daripada minggu sebelumnya.`), w: T('the amount she saves in week $n$', 'jumlah yang disimpannya pada minggu ke-$n$'), ask: (N) => T(`week ${N}`, `minggu ke-${N}`), inv: (V) => T(`a week in which she saves RM${V}`, `satu minggu apabila dia menyimpan RM${V}`) },
    { u: ['RM', '', ''], N: T('kilometres', 'kilometer'), r: [[1, 3], [3, 6]], d: (a, b) => T(`A taxi charges a fixed fare of RM${b} plus RM${a} for every kilometre travelled.`, `Sebuah teksi mengenakan tambang tetap RM${b} ditambah RM${a} bagi setiap kilometer perjalanan.`), w: T('the fare for a journey of $n$ km', 'tambang bagi perjalanan sejauh $n$ km'), ask: (N) => T(`a journey of ${N} km`, `perjalanan sejauh ${N} km`), inv: (V) => T(`a fare of RM${V}`, `tambang RM${V}`) },
    { u: ['', ' cm', ' cm'], N: T('steps', 'anak tangga'), r: [[15, 20], [0, 10]], d: (a, b) => T(`The first step of a staircase is ${a + b} cm above the floor. Each step is ${a} cm higher than the one before.`, `Anak tangga pertama sebuah tangga berada ${a + b} cm dari lantai. Setiap anak tangga ${a} cm lebih tinggi daripada yang sebelumnya.`), w: T('the height of step $n$ above the floor', 'tinggi anak tangga ke-$n$ dari lantai'), ask: (N) => T(`step ${N}`, `anak tangga ke-${N}`), inv: (V) => T(`the step that is ${V} cm above the floor`, `anak tangga yang berada ${V} cm dari lantai`) },
    { u: ['', ' seats', ' tempat duduk'], N: T('rows', 'baris'), r: [[2, 4], [8, 15]], d: (a, b) => T(`In a cinema, the first row has ${a + b} seats and each row behind has ${a} more seats than the row in front.`, `Dalam sebuah pawagam, baris pertama mempunyai ${a + b} tempat duduk dan setiap baris di belakang mempunyai ${a} tempat duduk lebih daripada baris di hadapannya.`), w: T('the number of seats in row $n$', 'bilangan tempat duduk pada baris ke-$n$'), ask: (N) => T(`row ${N}`, `baris ke-${N}`), inv: (V) => T(`a row with ${V} seats`, `baris yang mempunyai ${V} tempat duduk`) },
    { u: ['', ' pages', ' halaman'], N: T('days', 'hari'), r: [[2, 5], [4, 10]], d: (a, b) => T(`Farid reads ${a + b} pages on day 1 and ${a} more pages each day than the day before.`, `Farid membaca ${a + b} halaman pada hari pertama dan ${a} halaman lebih setiap hari berbanding hari sebelumnya.`), w: T('the number of pages he reads on day $n$', 'bilangan halaman yang dibacanya pada hari ke-$n$'), ask: (N) => T(`day ${N}`, `hari ke-${N}`), inv: (V) => T(`a day on which he reads ${V} pages`, `satu hari apabila dia membaca ${V} halaman`) },
  ];
  const mkLC = (r) => { const c = r.pick(LC), a = r.int(c.r[0][0], c.r[0][1]), b = r.int(c.r[1][0], c.r[1][1]); return { c, a, b, v: (k) => a * k + b, f: (v) => T(`${c.u[0]}${n(v)}${c.u[1]}`, `${c.u[0]}${n(v)}${c.u[2]}`), d: c.d(a, b) }; };
  const ge13 = [
    /* substitute into T_n = an + b */
    (r) => {
      const a = r.int(2, 9), b = r.nz(-6, 9), k = r.int(1, 10), v = r.int(0, 2);
      if (v === 0) return { q: T(`Given $${Tl(a, b)}$, find $${Tn(k)}$.`, `Diberi $${Tl(a, b)}$, cari $${Tn(k)}$.`), a: T(`$${Tn(k)} = ${a * k + b}$`), sp: 'xs' };
      if (v === 1) return { q: T(`The $n$th term of a sequence is $${Tl(a, b)}$. Write the first three terms.`, `Sebutan ke-$n$ bagi satu jujukan ialah $${Tl(a, b)}$. Tulis tiga sebutan pertama.`), a: T(`$${sq([1, 2, 3].map((i) => a * i + b))}$`), sp: 's' };
      return { q: T(`The $n$th term of a sequence is $${Tl(a, b)}$. Find the values of $T_1$ and $${Tn(k + 1)}$.`, `Sebutan ke-$n$ bagi satu jujukan ialah $${Tl(a, b)}$. Cari nilai $T_1$ dan $${Tn(k + 1)}$.`), a: T(`$T_1 = ${a + b}$; $${Tn(k + 1)} = ${a * (k + 1) + b}$`), sp: 's' };
    },
    /* find T_n from the first terms */
    (r) => {
      const a = r.int(2, 8), b = r.nz(-5, 8), N = r.pick([3, 4]), l = [1, 2, 3, 4].map((i) => a * i + b).slice(0, N + 1), v = r.int(0, 2);
      if (v === 0) return { q: T(`The first terms of a sequence are $${sq(l)},\\ \\ldots$ Find the formula for $T_n$.`, `Sebutan pertama satu jujukan ialah $${sq(l)},\\ \\ldots$ Cari rumus bagi $T_n$.`), a: T(`$${Tl(a, b)}$`), sp: 's' };
      if (v === 1) return { q: T(`Write an expression for the $n$th term $T_n$ of the sequence $${dots(l)}$.`, `Tulis satu ungkapan bagi sebutan ke-$n$, $T_n$, bagi jujukan $${dots(l)}$.`), a: T(`$${Tl(a, b)}$`), w: T(`Common difference ${a}; $T_1 = ${a + b}$`, `Beza sepunya ${a}; $T_1 = ${a + b}$`), sp: 's' };
      const o = mc(r, `$${lin(a, b, 'n')}$`, [`$${lin(a, b + a, 'n')}$`, `$${lin(a + 1, b, 'n')}$`, `$${lin(b === 0 ? a + 2 : b, a, 'n')}$`]);
      return { q: cat(T(`Which expression gives the $n$th term of $${dots(l)}$?<br>`, `Ungkapan yang manakah memberi sebutan ke-$n$ bagi $${dots(l)}$?<br>`), o.q), a: o.a, sp: 's' };
    },
    /* words <-> algebra */
    (r) => {
      const a = r.int(2, 9), b = r.nz(-5, 9), v = r.int(0, 1);
      return v === 0 ? { q: T(`The rule of a sequence is: ${wordsRule(a, b).en}. Write the rule as an expression for $T_n$.`, `Peraturan satu jujukan ialah: ${wordsRule(a, b).ms}. Tulis peraturan itu sebagai ungkapan bagi $T_n$.`), a: T(`$${Tl(a, b)}$`), sp: 's' }
        : { q: T(`Describe the rule $${Tl(a, b)}$ in words, and find the first term.`, `Huraikan peraturan $${Tl(a, b)}$ dengan perkataan, dan cari sebutan pertama.`), a: T(`${SPM.cap(wordsRule(a, b).en)}; $T_1 = ${a + b}$`, `${SPM.cap(wordsRule(a, b).ms)}; $T_1 = ${a + b}$`), sp: 's' };
    },
    /* three representations */
    (r) => {
      const a = r.int(2, 7), b = r.int(1, 8), l = [1, 2, 3, 4].map((i) => a * i + b), k = r.pick([8, 10, 15]);
      return { q: T(`The number pattern $${dots(l)}$ can be described by numbers, by words and by algebra. (a) Write the next two numbers. (b) Describe the rule in words. (c) Write the rule for $T_n$. (d) Find $${Tn(k)}$.`, `Pola nombor $${dots(l)}$ boleh diterangkan dengan nombor, perkataan dan algebra. (a) Tulis dua nombor berikutnya. (b) Huraikan peraturan itu dengan perkataan. (c) Tulis peraturan bagi $T_n$. (d) Cari $${Tn(k)}$.`), a: T(`(a) $${a * 5 + b},\\ ${a * 6 + b}$ (b) ${wordsRule(a, b).en} (c) $${Tl(a, b)}$ (d) $${a * k + b}$`, `(a) $${a * 5 + b},\\ ${a * 6 + b}$ (b) ${wordsRule(a, b).ms} (c) $${Tl(a, b)}$ (d) $${a * k + b}$`), sp: 'l' };
    },
    /* table of n and T_n */
    (r) => {
      const a = r.int(2, 8), b = r.int(-3, 9), v = r.int(0, 1), tb = SPM.table([['n', 1, 2, 3, 4, 5], ['T<sub>n</sub>', ...[1, 2, 3, 4, 5].map((i) => (i > 3 ? '?' : a * i + b))]], { rowHead: true }), k = r.pick([8, 10, 12]);
      return v === 0 ? { q: T(`Complete the table for $T_n = ${lin(a, b, 'n')}$.<br>${SPM.table([['n', 1, 2, 3, 4, 5], ['T<sub>n</sub>', ...[1, 2, 3, 4, 5].map((i) => (i > 3 ? '?' : a * i + b))]], { rowHead: true })}`, `Lengkapkan jadual bagi $T_n = ${lin(a, b, 'n')}$.<br>${tb}`), a: T(`$${a * 4 + b},\\ ${a * 5 + b}$`), sp: 's' }
        : { q: T(`The table shows a sequence.<br>${SPM.table([['n', 1, 2, 3, 4], ['T<sub>n</sub>', ...[1, 2, 3, 4].map((i) => a * i + b)]], { rowHead: true })}<br>Find the formula for $T_n$ and use it to find $${Tn(k)}$.`, `Jadual menunjukkan satu jujukan.<br>${SPM.table([['n', 1, 2, 3, 4], ['T<sub>n</sub>', ...[1, 2, 3, 4].map((i) => a * i + b)]], { rowHead: true })}<br>Cari rumus bagi $T_n$ dan gunakannya untuk mencari $${Tn(k)}$.`), a: T(`$${Tl(a, b)}$; $${Tn(k)} = ${a * k + b}$`), sp: 's' };
    },
    /* figure with the formula given: check and use */
    (r) => {
      const p = mkFig(r, ['sq', 'tri', 'hex', 'tab', 'L', 'plus', 'frm', 'arr']), k = r.pick([8, 10, 12, 20]), v = r.int(0, 1);
      const F = lin(p.a, p.b, 'n');
      return v === 0 ? { q: T(`The diagram shows ${p.intro.en}. The number of ${p.noun.en} in Figure $n$ is $${F}$. Use the formula to find the number in Figure ${k}.`, `Rajah menunjukkan ${p.intro.ms}. Bilangan ${p.noun.ms} dalam Rajah $n$ ialah $${F}$. Gunakan rumus itu untuk mencari bilangannya dalam Rajah ${k}.`), fig: figL(p, [1, 2, 3]), a: T(`${fN(p, k)}`), sp: 'm' }
        : { q: T(`The diagram shows ${p.intro.en}. Ali says the number of ${p.noun.en} in Figure $n$ is $${F}$. Check his formula for Figures 1, 2 and 3.`, `Rajah menunjukkan ${p.intro.ms}. Ali berkata bilangan ${p.noun.ms} dalam Rajah $n$ ialah $${F}$. Semak rumusnya bagi Rajah 1, 2 dan 3.`), fig: figL(p, [1, 2, 3]), a: T(`$${[1, 2, 3].map((i) => fN(p, i)).join(',\\ ')}$: the formula is correct`, `$${[1, 2, 3].map((i) => fN(p, i)).join(',\\ ')}$: rumus itu betul`), sp: 'm' };
    },
    /* meaning of a and b */
    (r) => {
      const a = r.int(2, 9), b = r.int(1, 9), v = r.int(0, 2);
      if (v === 0) return { q: T(`For the sequence $${Tl(a, b)}$, what does the number ${a} tell you about the sequence?`, `Bagi jujukan $${Tl(a, b)}$, apakah yang dinyatakan oleh nombor ${a} tentang jujukan itu?`), a: T(`It is the common difference: each term is ${a} more than the term before.`, `Ia ialah beza sepunya: setiap sebutan lebih ${a} daripada sebutan sebelumnya.`), sp: 's' };
      if (v === 1) return { q: T(`In $T_n = ${a}n + b$, the first term is $T_1 = ${a + b}$. Find $b$.`, `Dalam $T_n = ${a}n + b$, sebutan pertama ialah $T_1 = ${a + b}$. Cari $b$.`), a: T(`$b = ${b}$`), sp: 's' };
      return { q: T(`Without listing terms, state the common difference of the sequence $${Tl(a, b)}$ and its second term.`, `Tanpa menyenaraikan sebutan, nyatakan beza sepunya bagi jujukan $${Tl(a, b)}$ dan sebutan keduanya.`), a: T(`Common difference ${a}; $T_2 = ${2 * a + b}$`, `Beza sepunya ${a}; $T_2 = ${2 * a + b}$`), sp: 's' };
    },
    /* context: cost / amount formula in words */
    (r) => {
      const c = mkLC(r), N = r.int(5, 12);
      return { q: T(`${c.d.en} The formula for ${c.c.w.en} is $${lin(c.a, c.b, 'n')}$. Use the formula to find the value for ${c.c.ask(N).en}.`, `${c.d.ms} Rumus bagi ${c.c.w.ms} ialah $${lin(c.a, c.b, 'n')}$. Gunakan rumus itu untuk mencari nilai bagi ${c.c.ask(N).ms}.`), a: c.f(c.v(N)), sp: 's' };
    },
    /* decreasing formula */
    (r) => {
      const a = r.int(2, 6), b = r.int(20, 50), k = r.int(3, 8), v = r.int(0, 1);
      return v === 0 ? { q: T(`For the sequence $T_n = ${b} - ${a}n$, find $T_1$, $T_2$ and $${Tn(k)}$.`, `Bagi jujukan $T_n = ${b} - ${a}n$, cari $T_1$, $T_2$ dan $${Tn(k)}$.`), a: T(`$${b - a},\\ ${b - 2 * a},\\ ${b - a * k}$`), sp: 's' }
        : { q: T(`A sequence has the rule "start from ${b}, then subtract ${a} times the position". Write the rule as $T_n = \\ldots$ and find $${Tn(k)}$.`, `Satu jujukan mempunyai peraturan "mulakan dari ${b}, kemudian tolak ${a} kali kedudukan". Tulis peraturan itu sebagai $T_n = \\ldots$ dan cari $${Tn(k)}$.`), a: T(`$T_n = ${b} - ${a}n$; $${Tn(k)} = ${b - a * k}$`), sp: 's' };
    },
    /* true / false: does the formula fit? */
    (r) => {
      const a = r.int(2, 7), b = r.int(1, 8), ok = r.chance(), l = [1, 2, 3, 4].map((i) => a * i + b), F = ok ? lin(a, b, 'n') : r.pick([lin(a, b + 1, 'n'), lin(a + 1, b, 'n'), lin(a, b - 1, 'n')]);
      return { q: T(`Does $T_n = ${F}$ give the sequence $${dots(l)}$? Test it with $n = 1$ and $n = 2$.`, `Adakah $T_n = ${F}$ memberi jujukan $${dots(l)}$? Ujinya dengan $n = 1$ dan $n = 2$.`), a: ok ? T(`Yes: $T_1 = ${l[0]}$ and $T_2 = ${l[1]}$ match`, `Ya: $T_1 = ${l[0]}$ dan $T_2 = ${l[1]}$ sepadan`) : T(`No: the formula does not give both $T_1 = ${l[0]}$ and $T_2 = ${l[1]}$`, `Tidak: rumus itu tidak memberi kedua-dua $T_1 = ${l[0]}$ dan $T_2 = ${l[1]}$`), sp: 's' };
    },
  ];
  const WHY = {
    sq: () => T('each square needs 3 matchsticks, plus 1 extra matchstick at the start', 'setiap segi empat sama memerlukan 3 batang mancis, ditambah 1 batang mancis lagi pada permulaan'),
    tri: () => T('each triangle needs 2 new matchsticks, plus 1 matchstick at the start', 'setiap segi tiga memerlukan 2 batang mancis baharu, ditambah 1 batang mancis pada permulaan'),
    hex: () => T('each hexagon needs 5 new matchsticks, plus 1 matchstick at the start', 'setiap heksagon memerlukan 5 batang mancis baharu, ditambah 1 batang mancis pada permulaan'),
    tab: () => T('each table has 2 chairs (one on each long side), plus 2 chairs at the two ends', 'setiap meja mempunyai 2 kerusi (satu pada setiap sisi panjang), ditambah 2 kerusi pada kedua-dua hujung'),
    L: () => T('the two arms each have $n$ dots but the corner dot is counted in both, so $n + n - 1$', 'setiap lengan mempunyai $n$ titik tetapi titik sudut dikira dalam kedua-duanya, jadi $n + n - 1$'),
    plus: () => T('the four arms each have $n$ dots, plus 1 dot in the centre', 'empat lengan masing-masing mempunyai $n$ titik, ditambah 1 titik di tengah'),
    frm: () => T('the four sides each have $n$ tiles, plus 4 corner tiles', 'empat sisi masing-masing mempunyai $n$ jubin, ditambah 4 jubin sudut'),
    arr: (p) => T(`there are ${p.a} rows, each with $n$ dots`, `terdapat ${p.a} baris, setiap satu dengan $n$ titik`),
  };
  const PL = [
    (r) => { const a1 = r.int(5, 12), da = r.int(3, 8), N = r.int(2, 8), b2 = r.int(5, 15); return { tx: T('Shop A charges', 'Kedai A mengenakan'), en: (a1, b1, a2, b2) => `A gym offers two plans. Plan A: RM${b1} joining fee plus RM${a1} per month. Plan B: RM${b2} joining fee plus RM${a2} per month.`, ms: (a1, b1, a2, b2) => `Sebuah gimnasium menawarkan dua pelan. Pelan A: yuran pendaftaran RM${b1} ditambah RM${a1} sebulan. Pelan B: yuran pendaftaran RM${b2} ditambah RM${a2} sebulan.`, u: T('months', 'bulan'), a1, a2: a1 + da, b2, b1: b2 + N * da }; },
    (r) => { const a1 = r.int(1, 3), da = r.int(1, 2), N = r.int(3, 9), b2 = r.int(2, 6); return { en: (a1, b1, a2, b2) => `Two taxi companies charge for a journey of $n$ km. Company A: RM${b1} plus RM${a1} per km. Company B: RM${b2} plus RM${a2} per km.`, ms: (a1, b1, a2, b2) => `Dua syarikat teksi mengenakan bayaran bagi perjalanan sejauh $n$ km. Syarikat A: RM${b1} ditambah RM${a1} setiap km. Syarikat B: RM${b2} ditambah RM${a2} setiap km.`, u: T('km', 'km'), a1, a2: a1 + da, b2, b1: b2 + N * da }; },
    (r) => { const a1 = r.int(2, 5), da = r.int(1, 3), N = r.int(3, 8), b2 = r.int(5, 20); return { en: (a1, b1, a2, b2) => `A printing shop offers two ways to print $n$ posters. Way A: RM${b1} set-up fee plus RM${a1} per poster. Way B: RM${b2} set-up fee plus RM${a2} per poster.`, ms: (a1, b1, a2, b2) => `Sebuah kedai cetak menawarkan dua cara mencetak $n$ keping poster. Cara A: bayaran persediaan RM${b1} ditambah RM${a1} sekeping. Cara B: bayaran persediaan RM${b2} ditambah RM${a2} sekeping.`, u: T('posters', 'keping poster'), a1, a2: a1 + da, b2, b1: b2 + N * da }; },
  ];
  const DC = [
    { r: [[8, 20], [12, 40]], d: (c, a) => T(`A tank contains ${c} litres of water and loses ${a} litres every hour.`, `Sebuah tangki mengandungi ${c} liter air dan kehilangan ${a} liter setiap jam.`), w: T('the volume of water after $n$ hours', 'isi padu air selepas $n$ jam'), u: ['', ' litres', ' liter'], z: T('the tank is empty', 'tangki itu kosong'), N: T('hours', 'jam') },
    { r: [[2, 5], [15, 40]], d: (c, a) => T(`A candle is ${c} cm tall and burns down by ${a} cm every hour.`, `Sebatang lilin setinggi ${c} cm dan terbakar sebanyak ${a} cm setiap jam.`), w: T('the height of the candle after $n$ hours', 'tinggi lilin selepas $n$ jam'), u: ['', ' cm', ' cm'], z: T('the candle has burnt out', 'lilin itu habis terbakar'), N: T('hours', 'jam') },
    { r: [[2, 6], [30, 80]], d: (c, a) => T(`Nurul's prepaid card has RM${c} and RM${a} is deducted every day.`, `Kad prabayar Nurul mempunyai RM${c} dan RM${a} ditolak setiap hari.`), w: T('the balance after $n$ days', 'baki selepas $n$ hari'), u: ['RM', '', ''], z: T('the balance is RM0', 'baki ialah RM0'), N: T('days', 'hari') },
    { r: [[3, 8], [60, 120]], d: (c, a) => T(`A book has ${c} pages and ${a} pages are left unread after each day of reading.`, `Sebuah buku mempunyai ${c} halaman dan ${a} halaman lagi belum dibaca selepas setiap hari membaca.`), w: T('the number of pages unread after $n$ days', 'bilangan halaman yang belum dibaca selepas $n$ hari'), u: ['', ' pages', ' halaman'], z: T('there are no pages left', 'tiada halaman yang tinggal'), N: T('days', 'hari') },
  ];
  const gm13 = [
    /* derive T_n incl. decreasing, then check */
    (r) => {
      const a = r.nz(-8, 8), b = r.int(-6, 25), l = [1, 2, 3, 4].map((i) => a * i + b), v = r.int(0, 2), k = r.int(5, 9);
      if (v === 0) return { q: T(`Find the formula for $T_n$ of the sequence $${dots(l)}$, then check your formula by finding $T_5$.`, `Cari rumus bagi $T_n$ bagi jujukan $${dots(l)}$, kemudian semak rumus anda dengan mencari $T_5$.`), a: T(`$${Tl(a, b)}$; $T_5 = ${5 * a + b}$`), sp: 's' };
      if (v === 1) return { q: T(`Write $T_n$ for the sequence $${dots(l)}$ and use it to find $${Tn(k)}$.`, `Tulis $T_n$ bagi jujukan $${dots(l)}$ dan gunakannya untuk mencari $${Tn(k)}$.`), a: T(`$${Tl(a, b)}$; $${Tn(k)} = ${a * k + b}$`), sp: 's' };
      return { q: T(`The sequence $${dots(l)}$ is ${a > 0 ? 'increasing' : 'decreasing'}. Find its $n$th term and the term that comes after $T_4$ using your formula.`, `Jujukan $${dots(l)}$ ialah jujukan ${a > 0 ? 'menokok' : 'menyusut'}. Cari sebutan ke-$n$nya dan sebutan selepas $T_4$ menggunakan rumus anda.`), a: T(`$${Tl(a, b)}$; $T_5 = ${5 * a + b}$`), sp: 's' };
    },
    /* from T1 and d */
    (r) => {
      const a = r.int(-5, 30), d = r.nz(-8, 9), v = r.int(0, 1), k = r.pick([12, 20, 25]);
      return v === 0 ? { q: T(`A sequence has first term ${a} and common difference ${d}. Write $T_n$ in the form $T_n = pn + q$ and find $${Tn(k)}$.`, `Satu jujukan mempunyai sebutan pertama ${a} dan beza sepunya ${d}. Tulis $T_n$ dalam bentuk $T_n = pn + q$ dan cari $${Tn(k)}$.`), a: T(`$${Tl(d, a - d)}$; $${Tn(k)} = ${d * k + a - d}$`), w: T(`$T_n = ${a} + (n - 1)(${d})$`, `$T_n = ${a} + (n - 1)(${d})$`), sp: 'm' }
        : { q: T(`Expand and simplify $${a} + (n - 1)(${d})$ to obtain the $n$th term of the sequence with $T_1 = ${a}$ and $d = ${d}$.`, `Kembangkan dan ringkaskan $${a} + (n - 1)(${d})$ untuk mendapat sebutan ke-$n$ bagi jujukan dengan $T_1 = ${a}$ dan $d = ${d}$.`), a: T(`$${Tl(d, a - d)}$`), sp: 'm' };
    },
    /* from two terms */
    (r) => {
      const a = r.nz(-6, 7), b = r.int(-8, 20), p = r.int(2, 5), q = p + r.int(2, 5), k = r.pick([15, 20, 30]);
      return { q: T(`A sequence has a constant difference, with $${Tn(p)} = ${a * p + b}$ and $${Tn(q)} = ${a * q + b}$. Find $T_n$ and $${Tn(k)}$.`, `Satu jujukan mempunyai beza yang malar, dengan $${Tn(p)} = ${a * p + b}$ dan $${Tn(q)} = ${a * q + b}$. Cari $T_n$ dan $${Tn(k)}$.`), a: T(`$${Tl(a, b)}$; $${Tn(k)} = ${a * k + b}$`), w: T(`$a = (${a * q + b} - ${a * p + b}) \\div ${q - p} = ${a}$`, `$a = (${a * q + b} - ${a * p + b}) \\div ${q - p} = ${a}$`), sp: 'm' };
    },
    /* solve for n from T_n, or is it a term */
    (r) => {
      const a = r.int(2, 9), b = r.int(-5, 12), N = r.int(8, 30), yes = r.chance(), X = a * N + b + (yes ? 0 : r.int(1, a - 1)), v = r.int(0, 1);
      need(yes || a > 1);
      const nn = (X - b) / a;
      const ans = yes ? T(`$n = ${N}$: yes, it is $${Tn(N)}$`, `$n = ${N}$: ya, ia ialah $${Tn(N)}$`) : T(`$n = ${n(round(nn, 3))}$, not a whole number, so ${X} is not a term`, `$n = ${n(round(nn, 3))}$, bukan nombor bulat, jadi ${X} bukan suatu sebutan`);
      return v === 0 ? { q: T(`For the sequence $${Tl(a, b)}$, find $n$ when $T_n = ${X}$. What does your answer tell you?`, `Bagi jujukan $${Tl(a, b)}$, cari $n$ apabila $T_n = ${X}$. Apakah yang dinyatakan oleh jawapan anda?`), a: ans, sp: 's' }
        : { q: T(`The $n$th term of a sequence is $${lin(a, b, 'n')}$. Is ${X} a term of the sequence? Show your working.`, `Sebutan ke-$n$ bagi satu jujukan ialah $${lin(a, b, 'n')}$. Adakah ${X} suatu sebutan bagi jujukan itu? Tunjukkan langkah kerja anda.`), a: ans, sp: 's' };
    },
    /* linear context: derive and use */
    (r) => {
      const c = mkLC(r), N = r.int(8, 20), v = r.int(0, 1);
      return v === 0 ? { q: T(`${c.d.en} Write a formula for ${c.c.w.en}, and find its value for ${c.c.ask(N).en}.`, `${c.d.ms} Tulis satu rumus bagi ${c.c.w.ms}, dan cari nilainya bagi ${c.c.ask(N).ms}.`), a: T(`$${Tl(c.a, c.b)}$; ${c.f(c.v(N)).en}`, `$${Tl(c.a, c.b)}$; ${c.f(c.v(N)).ms}`), sp: 'm' }
        : { q: T(`${c.d.en} Find ${c.c.inv(c.v(N)).en} by first writing the formula for ${c.c.w.en}.`, `${c.d.ms} Cari ${c.c.inv(c.v(N)).ms} dengan menulis rumus bagi ${c.c.w.ms} terlebih dahulu.`), a: T(`$${Tl(c.a, c.b)}$; $n = ${N}$`), w: T(`$${lin(c.a, c.b, 'n')} = ${c.v(N)}$`), sp: 'm' };
    },
    /* figure: derive the formula */
    (r) => {
      const p = mkFig(r), k = r.int(10, 25), v = r.int(0, 2);
      const h = T(`The diagram shows ${p.intro.en}.`, `Rajah menunjukkan ${p.intro.ms}.`);
      if (v === 0) return { q: cat(h, T(` Find a formula for the number of ${p.noun.en} in Figure $n$.`, ` Cari satu rumus bagi bilangan ${p.noun.ms} dalam Rajah $n$.`)), fig: figL(p, [1, 2, 3]), a: T(`$${Tl(p.a, p.b)}$`), w: T(`Common difference ${p.a}; $T_1 = ${fN(p, 1)}$`, `Beza sepunya ${p.a}; $T_1 = ${fN(p, 1)}$`), sp: 'l' };
      if (v === 1) return { q: cat(h, T(` (a) Write $T_1$, $T_2$ and $T_3$. (b) Find the formula for $T_n$. (c) Find $${Tn(k)}$.`, ` (a) Tulis $T_1$, $T_2$ dan $T_3$. (b) Cari rumus bagi $T_n$. (c) Cari $${Tn(k)}$.`)), fig: figL(p, [1, 2, 3]), a: T(`(a) $${sq([1, 2, 3].map((i) => fN(p, i)))}$ (b) $${Tl(p.a, p.b)}$ (c) $${fN(p, k)}$`), sp: 'l' };
      return { q: cat(h, T(` The number of ${p.noun.en} in Figure $n$ is $T_n$. Find $T_n$, and calculate the number of ${p.noun.en} in Figure ${k} to check that Figure ${k} has ${p.a} more than Figure ${k - 1}.`, ` Bilangan ${p.noun.ms} dalam Rajah $n$ ialah $T_n$. Cari $T_n$, dan hitung bilangan ${p.noun.ms} dalam Rajah ${k} untuk menyemak bahawa Rajah ${k} mempunyai ${p.a} lebih banyak daripada Rajah ${k - 1}.`)), fig: figL(p, [1, 2, 3]), a: T(`$${Tl(p.a, p.b)}$; $${Tn(k)} = ${fN(p, k)}$, $${Tn(k - 1)} = ${fN(p, k - 1)}$`), sp: 'l' };
    },
    /* off-by-one MCQ */
    (r) => {
      const a = r.int(2, 8), b = r.int(1, 9), l = [1, 2, 3, 4].map((i) => a * i + b);
      const o = mc(r, `$${lin(a, b, 'n')}$`, [`$${lin(a, l[0], 'n')}$`, `$${lin(a, b + a, 'n')}$`, `$${lin(a, l[0] - 1, 'n')}$`].filter((x, i, arr) => arr.indexOf(x) === i && x !== `$${lin(a, b, 'n')}$`).concat([`$${lin(a + 1, b, 'n')}$`]).slice(0, 3), '&emsp;&emsp;');
      return { q: cat(T(`The sequence $${dots(l)}$ has $T_1 = ${l[0]}$ and $d = ${a}$. Which is the correct $n$th term?<br>`, `Jujukan $${dots(l)}$ mempunyai $T_1 = ${l[0]}$ dan $d = ${a}$. Yang manakah sebutan ke-$n$ yang betul?<br>`), o.q), a: o.a, w: T(`Test $n = 1$: $T_1 = ${l[0]}$`, `Uji $n = 1$: $T_1 = ${l[0]}$`), sp: 's' };
    },
    /* check by computing a term */
    (r) => {
      const a = r.int(2, 8), b = r.int(-4, 9), l = [1, 2, 3, 4, 5, 6].map((i) => a * i + b), who = r.name(), ok = r.chance(), F = ok ? [a, b] : [a, b + r.pick([-2, -1, 1, 2])];
      return { q: T(`${who} says that the $n$th term of $${dots(l.slice(0, 4))}$ is $${lin(F[0], F[1], 'n')}$. Check the formula by calculating $T_6$. Is ${who} correct?`, `${who} berkata bahawa sebutan ke-$n$ bagi $${dots(l.slice(0, 4))}$ ialah $${lin(F[0], F[1], 'n')}$. Semak rumus itu dengan mengira $T_6$. Adakah ${who} betul?`), a: T(`Formula gives $T_6 = ${6 * F[0] + F[1]}$; the sequence gives ${l[5]}. ${who} is ${ok ? 'correct' : 'not correct'}.`, `Rumus memberi $T_6 = ${6 * F[0] + F[1]}$; jujukan memberi ${l[5]}. ${who} ${ok ? 'betul' : 'tidak betul'}.`), sp: 's' };
    },
    /* words to algebra, then use */
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), s = r.chance(), k = r.pick([9, 12, 20]);
      return { q: T(`In a pattern, the number of dots in Figure $n$ is ${a} times $n$ ${s ? 'plus' : 'minus'} ${b}. Write an expression for this and find the number of dots in Figure ${k}.`, `Dalam satu pola, bilangan titik dalam Rajah $n$ ialah ${a} kali $n$ ${s ? 'campur' : 'tolak'} ${b}. Tulis satu ungkapan bagi ini dan cari bilangan titik dalam Rajah ${k}.`), a: T(`$${Tl(a, s ? b : -b)}$; ${a * k + (s ? b : -b)}`), sp: 's' };
    },
    /* decimal coefficients */
    (r) => {
      const a = r.pick([0.5, 1.5, 2.5, 0.25]), b = r.pick([1, 2, 3, 0.5]), k = r.pick([10, 12, 20]), l = [1, 2, 3, 4].map((i) => round(a * i + b, 6));
      return { q: T(`Find the formula for $T_n$ of the sequence $${dots(l)}$ and use it to find $${Tn(k)}$.`, `Cari rumus bagi $T_n$ bagi jujukan $${dots(l)}$ dan gunakannya untuk mencari $${Tn(k)}$.`), a: T(`$T_n = ${n(a)}n + ${n(b)}$; $${Tn(k)} = ${n(round(a * k + b, 6))}$`), sp: 's' };
    },
    /* show that the difference is constant */
    (r) => {
      const a = r.int(2, 9), b = r.nz(-6, 9);
      return { q: T(`For $T_n = ${lin(a, b, 'n')}$, write $T_{n+1}$ and show that $T_{n+1} - T_n$ is the same for every $n$.`, `Bagi $T_n = ${lin(a, b, 'n')}$, tulis $T_{n+1}$ dan tunjukkan bahawa $T_{n+1} - T_n$ adalah sama bagi setiap $n$.`), a: T(`$T_{n+1} = ${a}(n + 1) ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${lin(a, a + b, 'n')}$; $T_{n+1} - T_n = ${a}$`, `$T_{n+1} = ${a}(n + 1) ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${lin(a, a + b, 'n')}$; $T_{n+1} - T_n = ${a}$`), sp: 'm' };
    },
    /* compare formulas: which is increasing / larger */
    (r) => {
      const a1 = r.int(2, 7), b1 = r.int(1, 9), a2 = r.int(2, 7), b2 = r.int(1, 9), k = r.pick([5, 8, 10]);
      need(a1 !== a2 && a1 * k + b1 !== a2 * k + b2);
      return { q: T(`Sequence P has $T_n = ${lin(a1, b1, 'n')}$ and sequence Q has $T_n = ${lin(a2, b2, 'n')}$. Which sequence has the larger ${ordE(k)} term? Find the difference.`, `Jujukan P mempunyai $T_n = ${lin(a1, b1, 'n')}$ dan jujukan Q mempunyai $T_n = ${lin(a2, b2, 'n')}$. Jujukan yang manakah mempunyai sebutan ${ke(k)} yang lebih besar? Cari bezanya.`), a: T(`${a1 * k + b1 > a2 * k + b2 ? 'P' : 'Q'} (${a1 * k + b1} and ${a2 * k + b2}); difference ${Math.abs(a1 * k + b1 - a2 * k - b2)}`, `${a1 * k + b1 > a2 * k + b2 ? 'P' : 'Q'} (${a1 * k + b1} dan ${a2 * k + b2}); beza ${Math.abs(a1 * k + b1 - a2 * k - b2)}`), sp: 's' };
    },
  ];
  const ga13 = [
    /* figure: formula, T_k, which figure */
    (r) => {
      const p = mkFig(r), k = r.int(15, 40), K = r.int(10, 25), v = r.chance();
      const h = T(`The diagram shows ${p.intro.en}.`, `Rajah menunjukkan ${p.intro.ms}.`);
      return { q: cat(h, T(` (a) Find a formula for the number of ${p.noun.en} $T_n$ in Figure $n$. (b) Find $${Tn(k)}$. (c) Which figure uses ${fN(p, K)} ${p.noun.en}?`, ` (a) Cari satu rumus bagi bilangan ${p.noun.ms} $T_n$ dalam Rajah $n$. (b) Cari $${Tn(k)}$. (c) Rajah yang manakah menggunakan ${fN(p, K)} ${p.noun.ms}?`)), fig: figL(p, [1, 2, 3]), a: T(`(a) $${Tl(p.a, p.b)}$ (b) ${fN(p, k)} (c) Figure ${K}`, `(a) $${Tl(p.a, p.b)}$ (b) ${fN(p, k)} (c) Rajah ${K}`), sp: 'xl' };
    },
    /* explain the formula from the structure */
    (r) => {
      const p = mkFig(r), o = (() => { const w = WHY[p.k](p); return w; })();
      const others = FKS.filter((k) => k !== p.k), wrong = r.sample(others, 3).map((k) => FK[k](r)).map((q) => ({ en: `$${lin(q.a, q.b, 'n')}$`, ms: `$${lin(q.a, q.b, 'n')}$` }));
      const right = `$${lin(p.a, p.b, 'n')}$`, opt = mc(r, right, wrong.map((x) => x.en));
      return { q: cat(T(`The diagram shows ${p.intro.en}. Which expression gives the number of ${p.noun.en} in Figure $n$?<br>`, `Rajah menunjukkan ${p.intro.ms}. Ungkapan yang manakah memberi bilangan ${p.noun.ms} dalam Rajah $n$?<br>`), opt.q), fig: figL(p, [1, 2, 3]), a: cat(opt.a, T(`: ${o.en}`, `: ${o.ms}`)), sp: 'l' };
    },
    /* budget with a formula */
    (r) => {
      const p = mkFig(r, ['sq', 'tri', 'hex', 'tab', 'L', 'plus', 'frm']), N = r.int(60, 200), K = Math.floor((N - p.b) / p.a), left = N - fN(p, K);
      need(K > 8 && left > 0);
      return { q: T(`Consider ${p.intro.en}. The number of ${p.noun.en} in Figure $n$ is $${lin(p.a, p.b, 'n')}$. There are ${N} ${p.noun.en} available. (a) Find the largest figure that can be made. (b) How many ${p.noun.en} are left?`, `Pertimbangkan ${p.intro.ms}. Bilangan ${p.noun.ms} dalam Rajah $n$ ialah $${lin(p.a, p.b, 'n')}$. Terdapat ${N} ${p.noun.ms}. (a) Cari rajah terbesar yang boleh dibina. (b) Berapakah ${p.noun.ms} yang berbaki?`), a: T(`(a) Figure ${K} (b) ${left}`, `(a) Rajah ${K} (b) ${left}`), w: T(`$${lin(p.a, p.b, 'n')} \\leq ${N}$ gives $n = ${K}$; ${fN(p, K)} used`, `$${lin(p.a, p.b, 'n')} \\leq ${N}$ memberi $n = ${K}$; ${fN(p, K)} digunakan`), sp: 'm' };
    },
    /* the structure gives the formula */
    (r) => {
      const p = mkFig(r), k = r.int(12, 30), who = r.name();
      const hasWhy = WHY[p.k](p);
      return { q: T(`Look at the diagram: ${p.intro.en}. ${SPM.cap(hasWhy.en)}. Use this to write a formula for the number of ${p.noun.en} in Figure $n$ and to find the number in Figure ${k}.`, `Lihat rajah itu: ${p.intro.ms}. ${SPM.cap(hasWhy.ms)}. Gunakannya untuk menulis satu rumus bagi bilangan ${p.noun.ms} dalam Rajah $n$ dan untuk mencari bilangannya dalam Rajah ${k}.`), fig: figL(p, [1, 2, 3]), a: T(`$${Tl(p.a, p.b)}$; ${fN(p, k)}`), sp: 'l' };
    },
    /* two plans: when are they equal */
    (r) => {
      const c = r.pick(PL)(r), a1 = c.a1, a2 = c.a2, b1 = c.b1, b2 = c.b2, N = (b1 - b2) / (a2 - a1);
      need(Number.isInteger(N) && N >= 2);
      const k = N + r.int(2, 5);
      return { q: T(`${c.en(a1, b1, a2, b2)} (a) Write an expression for the cost of each plan for $n$ ${c.u.en}. (b) For how many ${c.u.en} do the two plans cost the same? (c) Which plan is cheaper for ${k} ${c.u.en}?`, `${c.ms(a1, b1, a2, b2)} (a) Tulis satu ungkapan bagi kos setiap pelan untuk $n$ ${c.u.ms}. (b) Bagi berapa ${c.u.ms} kedua-dua pelan berkos sama? (c) Pelan yang manakah lebih murah untuk ${k} ${c.u.ms}?`), a: T(`(a) A: RM$(${lin(a1, b1, 'n')})$, B: RM$(${lin(a2, b2, 'n')})$ (b) ${N} (c) Plan ${a1 * k + b1 < a2 * k + b2 ? 'A' : 'B'} (RM${a1 * k + b1} and RM${a2 * k + b2})`, `(a) A: RM$(${lin(a1, b1, 'n')})$, B: RM$(${lin(a2, b2, 'n')})$ (b) ${N} (c) Pelan ${a1 * k + b1 < a2 * k + b2 ? 'A' : 'B'} (RM${a1 * k + b1} dan RM${a2 * k + b2})`), sp: 'l' };
    },
    /* decreasing context */
    (r) => {
      const c = r.pick(DC), a = r.int(c.r[0][0], c.r[0][1]), N = r.int(6, 14), C = a * N, k = r.int(2, N - 2);
      const f = (v) => `${c.u[0]}${v}${c.u[1]}`, fm = (v) => `${c.u[0]}${v}${c.u[2]}`;
      return { q: T(`${c.d(C, a).en} (a) Write a formula for ${c.w.en}. (b) Find its value when $n = ${k}$. (c) After how many ${c.N.en} is ${c.z.en}?`, `${c.d(C, a).ms} (a) Tulis satu rumus bagi ${c.w.ms}. (b) Cari nilainya apabila $n = ${k}$. (c) Selepas berapa ${c.N.ms} ${c.z.ms}?`), a: T(`(a) $${C} - ${a}n$ (b) ${f(C - a * k)} (c) ${N}`, `(a) $${C} - ${a}n$ (b) ${fm(C - a * k)} (c) ${N}`), sp: 'l' };
    },
    /* weekly amount vs total so far */
    (r) => {
      const a = r.int(2, 6), b = r.int(3, 10), K = r.int(4, 6), W = r.int(12, 20), who = r.name();
      const l = Array.from({ length: K }, (_, i) => a * (i + 1) + b), X = a * r.int(15, 30) + b;
      return { q: T(`${who} saves RM${a + b} in week 1, and RM${a} more each week than in the previous week. (a) Write a formula for the amount saved in week $n$. (b) How much is saved in week ${W}? (c) How much has been saved altogether after ${K} weeks? (d) In which week does ${who} save RM${X}?`, `${who} menyimpan RM${a + b} pada minggu pertama, dan RM${a} lebih setiap minggu berbanding minggu sebelumnya. (a) Tulis satu rumus bagi jumlah yang disimpan pada minggu ke-$n$. (b) Berapakah yang disimpan pada minggu ke-${W}? (c) Berapakah jumlah simpanan keseluruhan selepas ${K} minggu? (d) Pada minggu yang ke berapakah ${who} menyimpan RM${X}?`), a: T(`(a) RM$(${lin(a, b, 'n')})$ (b) RM${a * W + b} (c) RM${sq(l).replace(/,\\ /g, ' + ')} = RM${l.reduce((s, x) => s + x, 0)} (d) week ${(X - b) / a}`, `(a) RM$(${lin(a, b, 'n')})$ (b) RM${a * W + b} (c) RM${sq(l).replace(/,\\ /g, ' + ')} = RM${l.reduce((s, x) => s + x, 0)} (d) minggu ke-${(X - b) / a}`), sp: 'xl' };
    },
    /* parameters from two conditions */
    (r) => {
      const a = r.int(2, 8), b = r.int(-6, 15), p = r.int(3, 7), q = p + r.int(3, 6), X = a * r.int(20, 40) + b;
      return { q: T(`In a sequence with $T_n = an + b$, $${Tn(p)} = ${a * p + b}$ and $${Tn(q)} = ${a * q + b}$. Find $a$ and $b$, then find which term equals ${X}.`, `Dalam satu jujukan dengan $T_n = an + b$, $${Tn(p)} = ${a * p + b}$ dan $${Tn(q)} = ${a * q + b}$. Cari $a$ dan $b$, kemudian cari sebutan yang sama dengan ${X}.`), a: T(`$a = ${a}$, $b = ${b}$; ${X} is $${Tn((X - b) / a)}$`, `$a = ${a}$, $b = ${b}$; ${X} ialah $${Tn((X - b) / a)}$`), sp: 'm' };
    },
    /* which lists have the form an + b */
    (r) => {
      const A = R.add(r), G = R.mul(r), C = R.sub(r), Q = R.sqr(r), items = r.shuffle([[A, 1], [G, 0], [C, 1], [Q, 0]]);
      const L = 'ABCD';
      return { q: T(`Which of these sequences can be written as $T_n = an + b$ (a constant difference)? ${items.map((it, i) => `(${L[i]}) $${dots(it[0].l.slice(0, 5))}$`).join(' ')} Write $T_n$ for each one that can.`, `Yang manakah antara jujukan ini boleh ditulis sebagai $T_n = an + b$ (beza yang malar)? ${items.map((it, i) => `(${L[i]}) $${dots(it[0].l.slice(0, 5))}$`).join(' ')} Tulis $T_n$ bagi setiap satu yang boleh.`), a: T(items.map((it, i) => (it[1] ? `${L[i]}: $${Tl(it[0].l[1] - it[0].l[0], it[0].l[0] - (it[0].l[1] - it[0].l[0]))}$` : `${L[i]}: no`)).filter((x) => !/no$/.test(x)).join('; ')), sp: 'l' };
    },
    /* three consecutive terms */
    (r) => {
      const a = r.int(2, 9), b = r.nz(-5, 9), m = r.int(3, 12);
      return { q: T(`For $T_n = ${lin(a, b, 'n')}$, find $${Tn(m - 1)} + ${Tn(m)} + ${Tn(m + 1)}$. Compare your answer with $${Tn(m)}$. What do you notice, and why?`, `Bagi $T_n = ${lin(a, b, 'n')}$, cari $${Tn(m - 1)} + ${Tn(m)} + ${Tn(m + 1)}$. Bandingkan jawapan anda dengan $${Tn(m)}$. Apakah yang anda perhatikan, dan mengapa?`), a: T(`${a * (m - 1) + b} + ${a * m + b} + ${a * (m + 1) + b} = ${3 * (a * m + b)}, which is 3 × ${a * m + b}; the terms on each side of $${Tn(m)}$ differ from it by ${a}, and these cancel out`, `${a * (m - 1) + b} + ${a * m + b} + ${a * (m + 1) + b} = ${3 * (a * m + b)}, iaitu 3 × ${a * m + b}; sebutan di kiri dan kanan $${Tn(m)}$ berbeza ${a} daripadanya, dan ini saling batal`), sp: 'm' };
    },
    /* n such that T_n is a multiple of k, first few */
    (r) => {
      const a = r.int(3, 8), b = r.int(1, 9), k = r.pick([2, 3, 5]), N = r.int(8, 14), l = Array.from({ length: N }, (_, i) => a * (i + 1) + b).filter((x) => x % k === 0);
      need(l.length >= 2);
      return { q: T(`The $n$th term of a sequence is $${lin(a, b, 'n')}$. List all the terms among $T_1$ to $${Tn(N)}$ that are multiples of ${k}.`, `Sebutan ke-$n$ bagi satu jujukan ialah $${lin(a, b, 'n')}$. Senaraikan semua sebutan antara $T_1$ hingga $${Tn(N)}$ yang merupakan gandaan bagi ${k}.`), a: T(`$${sq(l)}$`), sp: 'm' };
    },
    /* expressions for T_{n-1}, T_{2n} */
    (r) => {
      const a = r.int(2, 7), b = r.nz(-5, 8), v = r.int(0, 1);
      return v === 0 ? { q: T(`For $T_n = ${lin(a, b, 'n')}$, write and simplify an expression for $T_{n-1}$ and for $T_{2n}$.`, `Bagi $T_n = ${lin(a, b, 'n')}$, tulis dan ringkaskan ungkapan bagi $T_{n-1}$ dan bagi $T_{2n}$.`), a: T(`$T_{n-1} = ${lin(a, b - a, 'n')}$; $T_{2n} = ${lin(2 * a, b, 'n')}$`), sp: 'm' }
        : { q: T(`Given $T_n = ${lin(a, b, 'n')}$, write $T_{n+2}$ in its simplest form and find $T_{n+2} - T_n$.`, `Diberi $T_n = ${lin(a, b, 'n')}$, tulis $T_{n+2}$ dalam bentuk paling ringkas dan cari $T_{n+2} - T_n$.`), a: T(`$T_{n+2} = ${lin(a, b + 2 * a, 'n')}$; difference $${2 * a}$`, `$T_{n+2} = ${lin(a, b + 2 * a, 'n')}$; beza $${2 * a}$`), sp: 'm' };
    },
  ];
  /* ---- menu chains for 1.3: T_n = an + b shown as list / table / figure / context / words / formula, then 2-3 tasks ---- */
  const linRep = (r, lv) => {
    const kind = r.pick(['list', 'table', 'fig', 'fig', 'ctx', 'ctx', 'words', 'form', 'two']);
    let a, b, fig = null, cxt = null, intro;
    if (kind === 'fig') { const p = mkFig(r, ['sq', 'tri', 'hex', 'tab', 'L', 'plus', 'frm', 'arr']); a = p.a; b = p.b; fig = figL(p, [1, 2, 3]); intro = T(`The diagram shows ${p.intro.en}. Let $T_n$ be the number of ${p.noun.en} in Figure $n$.`, `Rajah menunjukkan ${p.intro.ms}. Biarkan $T_n$ ialah bilangan ${p.noun.ms} dalam Rajah $n$.`); }
    else if (kind === 'ctx') { const c = mkLC(r); a = c.a; b = c.b; cxt = c; intro = T(`${c.d.en} Let $T_n$ be ${c.c.w.en.replace(/^the /, 'the ')} for $n = 1, 2, 3, \\ldots$`, `${c.d.ms} Biarkan $T_n$ ialah ${c.c.w.ms} bagi $n = 1, 2, 3, \\ldots$`); }
    else {
      a = lv === 'a' && r.chance(0.4) ? r.nz(-9, -2) : r.int(2, lv === 'e' ? 6 : 9); b = lv === 'e' ? r.int(1, 8) : r.int(-8, 15);
      const t = (k) => a * k + b, l4 = [1, 2, 3, 4].map(t);
      intro = { list: T(`The first terms of a sequence are $${dots(l4)}$.`, `Sebutan pertama satu jujukan ialah $${dots(l4)}$.`), table: T(`The table shows a sequence.<br>${SPM.table([['n', 1, 2, 3, 4], ['T<sub>n</sub>'].concat(l4)], { rowHead: true })}`, `Jadual menunjukkan satu jujukan.<br>${SPM.table([['n', 1, 2, 3, 4], ['T<sub>n</sub>'].concat(l4)], { rowHead: true })}`), words: T(`A sequence has this rule: ${wordsRule(a, b).en}.`, `Satu jujukan mempunyai peraturan ini: ${wordsRule(a, b).ms}.`), form: T(`The $n$th term of a sequence is $${Tl(a, b)}$.`, `Sebutan ke-$n$ bagi satu jujukan ialah $${Tl(a, b)}$.`), two: T(`A sequence has a constant difference, with $T_2 = ${2 * a + b}$ and $T_5 = ${5 * a + b}$.`, `Satu jujukan mempunyai beza yang malar, dengan $T_2 = ${2 * a + b}$ dan $T_5 = ${5 * a + b}$.`) }[kind];
    }
    return { a, b, kind, intro, fig, cxt, t: (k) => a * k + b, hasF: kind === 'form' || kind === 'words' };
  };
  const cq = (S, r) => { // question pieces shared by all levels
    const { a, b, t } = S, F = lin(a, b, 'n'), k = r.int(8, 25), j = r.int(6, 30), no = r.chance(), Y = no ? t(j) + r.int(1, Math.max(1, Math.abs(a) - 1)) * Math.sign(a) : t(j), p = r.int(5, 12), q = p + r.int(3, 10);
    const nn = (Y - b) / a, ok = Number.isInteger(nn) && nn >= 1;
    const yn = ok ? T(`Yes: $${F} = ${Y}$ gives $n = ${nn}$, so it is $${Tn(nn)}$`, `Ya: $${F} = ${Y}$ memberi $n = ${nn}$, jadi ia ialah $${Tn(nn)}$`) : T(`No: $n = ${rn(nn)}$ is not a positive whole number`, `Tidak: $n = ${rn(nn)}$ bukan nombor bulat positif`);
    return { a, b, t, F, k, j, Y, p, q, yn, no };
  };
  const E13t = (S, r) => {
    const { a, b, F, k, j, Y, p, q, yn } = cq(S, r), Fa = T(`$${Tl(a, b)}$`);
    return [
      S.hasF ? null : P('Write a formula for $T_n$.', 'Tulis satu rumus bagi $T_n$.', `$${Tl(a, b)}$`),
      P(`Find $${Tn(k)}$.`, `Cari $${Tn(k)}$.`, `$${Tn(k)} = ${S.t(k)}$`),
      P('Write down $T_1$, $T_2$ and $T_3$.', 'Tulis $T_1$, $T_2$ dan $T_3$.', `$${sq([1, 2, 3].map(S.t))}$`),
      P('State the common difference of the sequence.', 'Nyatakan beza sepunya bagi jujukan itu.', `${a}`),
      P('Describe the rule in words.', 'Huraikan peraturan itu dengan perkataan.', SPM.cap(wordsRule(a, b).en), SPM.cap(wordsRule(a, b).ms)),
      P(`Which term is equal to ${S.t(j)}?`, `Sebutan yang ke berapakah sama dengan ${S.t(j)}?`, `$${Tn(j)}$`),
      P(`Is ${Y} a term of the sequence?`, `Adakah ${Y} suatu sebutan bagi jujukan itu?`, yn.en, yn.ms),
      P(`Find $${Tn(q)} - ${Tn(p)}$.`, `Cari $${Tn(q)} - ${Tn(p)}$.`, `${S.t(q) - S.t(p)}`),
      P('What does the number multiplying $n$ in the formula tell you?', 'Apakah yang dinyatakan oleh nombor yang mendarab $n$ dalam rumus itu?', `It is the common difference: each term is ${a} ${a > 0 ? 'more' : 'less'} than the previous term (${Math.abs(a)})`.replace(/\(\d+\)$/, '').trim(), `Ia ialah beza sepunya: setiap sebutan ${a > 0 ? 'lebih' : 'kurang'} ${Math.abs(a)} daripada sebutan sebelumnya`),
      P('Check the formula by finding $T_5$ from the formula and from the pattern.', 'Semak rumus itu dengan mencari $T_5$ daripada rumus dan daripada pola.', `$${Tn(5)} = ${S.t(5)}$ both ways`, `$${Tn(5)} = ${S.t(5)}$ kedua-dua cara`),
    ];
  };
  const M13t = (S, r) => {
    const { a, b, F, k, j, Y, p, q, yn } = cq(S, r), c = S.cxt;
    return [
      S.hasF ? null : P('Write $T_n$ in the form $T_n = pn + q$.', 'Tulis $T_n$ dalam bentuk $T_n = pn + q$.', `$${Tl(a, b)}$`),
      P(`Find $${Tn(k)}$ using the formula.`, `Cari $${Tn(k)}$ menggunakan rumus itu.`, `$${Tn(k)} = ${S.t(k)}$`),
      P(`Find $n$ when $T_n = ${S.t(j)}$.`, `Cari $n$ apabila $T_n = ${S.t(j)}$.`, `$n = ${j}$`),
      P(`Explain whether ${Y} is a term of the sequence.`, `Terangkan sama ada ${Y} ialah suatu sebutan bagi jujukan itu.`, yn.en, yn.ms),
      P(`Find $${Tn(p)} + ${Tn(q)}$.`, `Cari $${Tn(p)} + ${Tn(q)}$.`, `${S.t(p) + S.t(q)}`),
      P(`Find $${Tn(q)} - ${Tn(p)}$ without finding either term.`, `Cari $${Tn(q)} - ${Tn(p)}$ tanpa mencari mana-mana sebutan.`, `${q - p} × ${a} = ${a * (q - p)}`),
      P('Write $T_{n+1}$ in its simplest form.', 'Tulis $T_{n+1}$ dalam bentuk paling ringkas.', `$${lin(a, a + b, 'n')}$`),
      P('Write $T_{n-1}$ in its simplest form.', 'Tulis $T_{n-1}$ dalam bentuk paling ringkas.', `$${lin(a, b - a, 'n')}$`),
      P('Show that $T_{n+1} - T_n$ is the same for every $n$.', 'Tunjukkan bahawa $T_{n+1} - T_n$ adalah sama bagi setiap $n$.', `$T_{n+1} - T_n = ${a}$`),
      P(`Write an expression for $T_{2n}$.`, `Tulis satu ungkapan bagi $T_{2n}$.`, `$${lin(2 * a, b, 'n')}$`),
      P(`Find the value of $T_n$ when $n = ${k}$ and say whether it is odd or even.`, `Cari nilai $T_n$ apabila $n = ${k}$ dan nyatakan sama ada ia ganjil atau genap.`, `${S.t(k)} (${Math.abs(S.t(k)) % 2 ? 'odd' : 'even'})`, `${S.t(k)} (${Math.abs(S.t(k)) % 2 ? 'ganjil' : 'genap'})`),
      c ? P(`What does the constant term ${b} in the formula represent in this situation?`, `Apakah yang diwakili oleh sebutan malar ${b} dalam rumus itu dalam situasi ini?`, `The value that would correspond to $n = 0$: ${c.c.w.en.replace('$n$', '0')}`, `Nilai yang sepadan dengan $n = 0$`) : null,
      c ? P(`Find ${c.c.inv(S.t(j)).en}.`, `Cari ${c.c.inv(S.t(j)).ms}.`, `$n = ${j}$`) : null,
    ];
  };
  const A13t = (S, r) => {
    const { a, b, F, k, j, Y, p, q, yn } = cq(S, r), m = r.int(3, 9);
    return [
      S.hasF ? null : P('Find $T_n$ and use it to find $T_{40}$.', 'Cari $T_n$ dan gunakannya untuk mencari $T_{40}$.', `$${Tl(a, b)}$; $${Tn(40)} = ${S.t(40)}$`),
      P(`Decide whether ${Y} is a term. Show that $n$ is (or is not) a positive integer.`, `Tentukan sama ada ${Y} ialah suatu sebutan. Tunjukkan bahawa $n$ ialah (atau bukan) integer positif.`, yn.en, yn.ms),
      P(`Show that $T_n + T_{n+1} = ${lin(2 * a, a + 2 * b, 'n')}$.`, `Tunjukkan bahawa $T_n + T_{n+1} = ${lin(2 * a, a + 2 * b, 'n')}$.`, `$(${lin(a, b, 'n')}) + (${lin(a, a + b, 'n')}) = ${lin(2 * a, a + 2 * b, 'n')}$`),
      P(`Write $T_{3n}$ and find $T_{3n} - T_n$.`, `Tulis $T_{3n}$ dan cari $T_{3n} - T_n$.`, `$T_{3n} = ${lin(3 * a, b, 'n')}$; $T_{3n} - T_n = ${lin(2 * a, 0, 'n')}$`),
      Number.isInteger(10 + b / a) && 10 + b / a > 1 ? P(`Find the value of $n$ for which $T_n = 2 \\times T_5$.`, `Cari nilai $n$ yang menjadikan $T_n = 2 \\times T_5$.`, `$n = ${10 + b / a}$`) : null,
      Number.isInteger(b / a) && b / a + 3 > 0 ? P(`Find $n$ such that $T_n = T_1 + T_2$.`, `Cari $n$ yang menjadikan $T_n = T_1 + T_2$.`, `$n = ${3 + b / a}$`) : null,
      P(`Find $${Tn(m + 1)} + ${Tn(m - 1)}$ and compare it with $2 \\times ${Tn(m)}$.`, `Cari $${Tn(m + 1)} + ${Tn(m - 1)}$ dan bandingkannya dengan $2 \\times ${Tn(m)}$.`, `${S.t(m + 1) + S.t(m - 1)} = 2 × ${S.t(m)}`),
      P(`Find $${Tn(k)}$ and $${Tn(k + 1)}$ and show that they differ by ${Math.abs(a)}.`, `Cari $${Tn(k)}$ dan $${Tn(k + 1)}$ dan tunjukkan bahawa beza mereka ialah ${Math.abs(a)}.`, `${S.t(k)}, ${S.t(k + 1)}: difference ${S.t(k + 1) - S.t(k)}`.replace(/difference (-?\d+)/, (m2, x) => `difference ${Math.abs(+x)}`), `${S.t(k)}, ${S.t(k + 1)}: beza ${Math.abs(S.t(k + 1) - S.t(k))}`),
      S.cxt ? P(`Find ${S.cxt.c.inv(S.t(j)).en} and explain how you know the answer is realistic.`, `Cari ${S.cxt.c.inv(S.t(j)).ms} dan terangkan bagaimana anda tahu jawapan itu munasabah.`, `$n = ${j}$, a positive whole number of ${S.cxt.c.N.en}`, `$n = ${j}$, nombor bulat positif bagi ${S.cxt.c.N.ms}`) : null,
      P(`State which values of $n$ are allowed in the formula $${Tl(a, b)}$ and why.`, `Nyatakan nilai $n$ yang dibenarkan dalam rumus $${Tl(a, b)}$ dan sebabnya.`, 'Positive whole numbers, since $n$ is the position of a term', 'Nombor bulat positif, kerana $n$ ialah kedudukan suatu sebutan'),
      P(`Find $${Tn(q)} - ${Tn(p)}$ and hence the number of steps of size ${Math.abs(a)} between them.`, `Cari $${Tn(q)} - ${Tn(p)}$ dan seterusnya bilangan langkah bersaiz ${Math.abs(a)} di antara keduanya.`, `${S.t(q) - S.t(p)}; ${q - p} steps`, `${S.t(q) - S.t(p)}; ${q - p} langkah`),
    ];
  };
  const chainGen13 = (lv, tasks, ks) => (r) => { const S = linRep(r, lv), o = chain(r, S.intro, tasks(S, r), r.pick(ks)); if (S.fig) o.fig = S.fig; if (S.fig) o.sp = 'xl'; return o; };
  ge13.push(chainGen13('e', E13t, [2, 2, 3]), chainGen13('e', E13t, [2, 3]));
  gm13.push(chainGen13('m', M13t, [2, 3]), chainGen13('m', M13t, [3]));
  ga13.push(chainGen13('a', A13t, [3]), chainGen13('a', A13t, [2, 3]));

  SPM.extend('F2-1.3', { e: ge13, m: gm13, a: ga13 });

  /* ================================================================ F2-1.E Extended rule families (enrichment) */
  const Q2 = (a, c) => ({ a, c, tex: poly([[a, 'n^2'], [c, '']]), f: (k) => a * k * k + c });
  const q2 = (r, lo) => Q2(r.pick(lo || [1, 1, 1, 2, 3]), r.int(-4, 9));
  const FQ = {
    sqd: { f: (k) => k * k, tex: 'n^2', intro: T('a square array of dots', 'satu tatasusunan titik berbentuk segi empat sama'), draw: (k) => { const b = B(), d = 13; for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) b.dot(5 + j * d, 5 + i * d); return b.done((k - 1) * d + 10, (k - 1) * d + 10); } },
    rct: { f: (k) => k * (k + 1), tex: 'n(n + 1)', intro: T('a rectangular array of dots with $n$ rows and $n + 1$ columns', 'satu tatasusunan titik berbentuk segi empat tepat dengan $n$ baris dan $n + 1$ lajur'), draw: (k) => { const b = B(), d = 13; for (let i = 0; i < k; i++) for (let j = 0; j <= k; j++) b.dot(5 + j * d, 5 + i * d); return b.done(k * d + 10, (k - 1) * d + 10); } },
    tri: { f: (k) => (k * (k + 1)) / 2, tex: '\\dfrac{n(n + 1)}{2}', intro: T('a triangle of dots with $n$ dots in the bottom row', 'satu segi tiga titik dengan $n$ titik pada baris bawah'), draw: (k) => { const b = B(), d = 14; for (let i = 0; i < k; i++) for (let j = 0; j <= i; j++) b.dot(5 + (k - 1 - i) * d / 2 + j * d, 5 + i * d); return b.done((k - 1) * d + 10, (k - 1) * d + 10); } },
  };
  const figQ = (p, ks) => {
    const ds = ks.map((k) => { const d = p.draw(k); need(d.cnt === p.f(k)); return d; });
    const H = Math.max(...ds.map((d) => d.h)), gap = 22;
    const build = (lab) => { let x = 6, o = ''; ds.forEach((d, i) => { o += `<g transform="translate(${x},${4 + H - d.h})">${d.out}</g>` + S.text(x + d.w / 2, H + 18, `${lab} ${ks[i]}`, { s: 11 }); x += d.w + gap; }); return S.wrap(x - gap + 6, H + 28, o, 'pattern'); };
    return T(build('Fig.'), build('Rajah'));
  };
  const alt = (s, p, q, N) => { const l = [s]; for (let i = 1; i < N; i++) l.push(l[i - 1] + (i % 2 ? p : q)); return l; };
  const inter = (p1, d1, p2, d2, N) => Array.from({ length: N }, (_, i) => (i % 2 === 0 ? p1 + d1 * (i / 2) : p2 + d2 * ((i - 1) / 2)));
  const firstAbove = (f, K) => { let k = 1; while (f(k) <= K && k < 500) k++; return k; };
  const ge1E = [
    /* stated quadratic rule: first terms / one term */
    (r) => {
      const Q = q2(r), v = r.int(0, 2), k = r.int(4, 8);
      if (v === 0) return { q: T(`The $n$th term of a sequence is $T_n = ${Q.tex}$. Write the first four terms.`, `Sebutan ke-$n$ bagi satu jujukan ialah $T_n = ${Q.tex}$. Tulis empat sebutan pertama.`), a: T(`$${sq([1, 2, 3, 4].map(Q.f))}$`), sp: 's' };
      if (v === 1) return { q: T(`Given $T_n = ${Q.tex}$, find $${Tn(k)}$.`, `Diberi $T_n = ${Q.tex}$, cari $${Tn(k)}$.`), a: T(`$${Tn(k)} = ${Q.f(k)}$`), sp: 'xs' };
      return { q: T(`The sequence with $T_n = ${Q.tex}$ does not have a constant difference. Show this by writing $T_1$ to $T_4$ and the differences between neighbouring terms.`, `Jujukan dengan $T_n = ${Q.tex}$ tidak mempunyai beza yang malar. Tunjukkan ini dengan menulis $T_1$ hingga $T_4$ dan beza antara sebutan berdekatan.`), a: T(`$${sq([1, 2, 3, 4].map(Q.f))}$; differences $${sq(diffs([1, 2, 3, 4].map(Q.f)))}$ (not constant)`, `$${sq([1, 2, 3, 4].map(Q.f))}$; beza $${sq(diffs([1, 2, 3, 4].map(Q.f)))}$ (tidak malar)`), sp: 's' };
    },
    /* first and second differences */
    (r) => {
      const Q = q2(r), l = [1, 2, 3, 4, 5].map(Q.f), d1 = diffs(l), d2 = diffs(d1), v = r.int(0, 1);
      return v === 0 ? { q: T(`For the sequence $${dots(l)}$, write the first differences and then the second differences (the differences of the first differences).`, `Bagi jujukan $${dots(l)}$, tulis beza pertama dan kemudian beza kedua (beza bagi beza pertama).`), a: T(`First: $${sq(d1)}$; second: $${sq(d2)}$ (constant)`, `Pertama: $${sq(d1)}$; kedua: $${sq(d2)}$ (malar)`), sp: 's' }
        : { q: T(`The second differences of a sequence are all equal to ${d2[0]}. The first four terms are $${sq(l.slice(0, 4))}$. Find the next two terms.`, `Beza kedua satu jujukan semuanya sama dengan ${d2[0]}. Empat sebutan pertama ialah $${sq(l.slice(0, 4))}$. Cari dua sebutan berikutnya.`), a: T(`First differences ${d1.slice(0, 3).join(', ')}, then ${d1[3]}, ${d1[3] + d2[0]}: terms $${l[4]},\\ ${l[5] === undefined ? Q.f(6) : l[5]}$`, `Beza pertama ${d1.slice(0, 3).join(', ')}, kemudian ${d1[3]}, ${d1[3] + d2[0]}: sebutan $${l[4]},\\ ${Q.f(6)}$`), sp: 's' };
    },
    /* interleaved: stated rule */
    (r) => {
      const p1 = r.int(1, 6), d1 = r.int(2, 5), p2 = r.int(2, 9), d2 = r.int(1, 4), N = r.pick([6, 7]), l = inter(p1, d1, p2, d2, N + 2);
      return { q: T(`In a sequence, the odd-numbered terms ($T_1,\\ T_3,\\ \\ldots$) start at ${p1} and go up by ${d1}; the even-numbered terms ($T_2,\\ T_4,\\ \\ldots$) start at ${p2} and go up by ${d2}. Write the first ${N} terms.`, `Dalam satu jujukan, sebutan bernombor ganjil ($T_1,\\ T_3,\\ \\ldots$) bermula pada ${p1} dan bertambah ${d1}; sebutan bernombor genap ($T_2,\\ T_4,\\ \\ldots$) bermula pada ${p2} dan bertambah ${d2}. Tulis ${N} sebutan pertama.`), a: T(`$${sq(l.slice(0, N))}$`), sp: 's' };
    },
    /* alternating additions */
    (r) => {
      const s = r.int(1, 8), p = r.int(1, 4), q = r.int(2, 6), l = alt(s, p, q, 9);
      need(p !== q);
      return { q: T(`A sequence begins $${sq(l.slice(0, 5))},\\ \\ldots$ It is formed by adding ${p} and ${q} alternately (${p} first). Write the next three terms.`, `Satu jujukan bermula $${sq(l.slice(0, 5))},\\ \\ldots$ Ia dibentuk dengan menambah ${p} dan ${q} secara berselang-seli (${p} dahulu). Tulis tiga sebutan berikutnya.`), a: T(`$${sq(l.slice(5, 8))}$`), sp: 's' };
    },
    /* linear threshold by listing */
    (r) => {
      const a = r.int(2, 6), b = r.int(1, 9), K = r.int(20, 45), f = (k) => a * k + b, N = firstAbove(f, K);
      return { q: T(`For $T_n = ${lin(a, b, 'n')}$, list the terms $T_1,\\ T_2,\\ \\ldots$ until you find the first term greater than ${K}.`, `Bagi $T_n = ${lin(a, b, 'n')}$, senaraikan sebutan $T_1,\\ T_2,\\ \\ldots$ sehingga anda menemui sebutan pertama yang lebih besar daripada ${K}.`), a: T(`$${Tn(N)} = ${f(N)}$`), w: T(`$${sq(Array.from({ length: N }, (_, i) => f(i + 1)))}$`), sp: 's' };
    },
    /* which sequence has constant second difference */
    (r) => {
      const Q = q2(r), Ll = R.add(r), G = R.mul(r), C = R.cube(r);
      const o = mc(r, `$${sq([1, 2, 3, 4, 5].map(Q.f))}$`, [`$${sq(Ll.l.slice(0, 5))}$`, `$${sq(G.l.slice(0, 5))}$`, `$${sq(C.l.slice(0, 5))}$`], '<br>');
      return { q: cat(T('Which sequence has a constant second difference (its first differences increase by the same amount each time)?<br>', 'Jujukan yang manakah mempunyai beza kedua yang malar (beza pertamanya bertambah dengan amaun yang sama setiap kali)?<br>'), o.q), a: o.a, sp: 's' };
    },
    /* stated family, continue */
    (r) => {
      const Q = q2(r), l = [1, 2, 3, 4, 5, 6, 7, 8].map(Q.f);
      return { q: T(`The sequence $${dots(l.slice(0, 4))}$ follows the rule $T_n = ${Q.tex}$. Find $T_5$ and $T_6$.`, `Jujukan $${dots(l.slice(0, 4))}$ mengikut peraturan $T_n = ${Q.tex}$. Cari $T_5$ dan $T_6$.`), a: T(`$${l[4]},\\ ${l[5]}$`), sp: 's' };
    },
    /* dot figures, quadratic */
    (r) => {
      const p = FQ[r.pick(['sqd', 'rct', 'tri'])], k = r.int(4, 5);
      return { q: T(`The diagram shows ${p.intro.en}. Count the dots in Figures 1, 2 and 3, then find the number of dots in Figure ${k}. (Hint: look at how many dots are added each time.)`, `Rajah menunjukkan ${p.intro.ms}. Kira titik dalam Rajah 1, 2 dan 3, kemudian cari bilangan titik dalam Rajah ${k}. (Petunjuk: lihat berapa banyak titik ditambah setiap kali.)`), fig: figQ(p, [1, 2, 3]), a: T(`${[1, 2, 3].map(p.f).join(', ')}; Figure ${k}: ${p.f(k)}`, `${[1, 2, 3].map(p.f).join(', ')}; Rajah ${k}: ${p.f(k)}`), sp: 'l' };
    },
    /* triangular numbers */
    (r) => {
      const N = r.int(5, 7), k = r.int(6, 12);
      return { q: T(`The triangular numbers are given by $T_n = \\dfrac{n(n + 1)}{2}$. Write the first ${N} triangular numbers and find $${Tn(k)}$.`, `Nombor segi tiga diberi oleh $T_n = \\dfrac{n(n + 1)}{2}$. Tulis ${N} nombor segi tiga yang pertama dan cari $${Tn(k)}$.`), a: T(`$${sq(Array.from({ length: N }, (_, i) => ((i + 1) * (i + 2)) / 2))}$; $${Tn(k)} = ${(k * (k + 1)) / 2}$`), sp: 's' };
    },
    /* two possible rules for a prefix */
    (r) => {
      const a = r.int(1, 3), N = r.pick([5, 6]);
      return { q: T(`The first three terms of a sequence are $${sq([a, 2 * a, 4 * a])},\\ \\ldots$ Rule A is "multiply by 2 each time". Rule B is $T_n = ${a === 1 ? '' : a}\\dfrac{n^2 - n + 2}{2}$. Find $${Tn(N)}$ for each rule.`, `Tiga sebutan pertama satu jujukan ialah $${sq([a, 2 * a, 4 * a])},\\ \\ldots$ Peraturan A ialah "darab dengan 2 setiap kali". Peraturan B ialah $T_n = ${a === 1 ? '' : a}\\dfrac{n^2 - n + 2}{2}$. Cari $${Tn(N)}$ bagi setiap peraturan.`), a: T(`Rule A: ${a * 2 ** (N - 1)}; Rule B: ${(a * (N * N - N + 2)) / 2}`, `Peraturan A: ${a * 2 ** (N - 1)}; Peraturan B: ${(a * (N * N - N + 2)) / 2}`), sp: 's' };
    },
  ];
  const gm1E = [
    /* find c from one term */
    (r) => {
      const c = r.int(-5, 9), k = r.int(3, 6), m = r.int(8, 12);
      return { q: T(`The $n$th term of a sequence is $T_n = n^2 + c$. Given that $${Tn(k)} = ${k * k + c}$, find $c$ and $${Tn(m)}$.`, `Sebutan ke-$n$ bagi satu jujukan ialah $T_n = n^2 + c$. Diberi $${Tn(k)} = ${k * k + c}$, cari $c$ dan $${Tn(m)}$.`), a: T(`$c = ${c}$; $${Tn(m)} = ${m * m + c}$`), sp: 's' };
    },
    /* find a in an^2 */
    (r) => {
      const a = r.int(2, 5), k = r.int(2, 5), m = r.int(8, 12), v = r.int(0, 1);
      return v === 0 ? { q: T(`A sequence has the rule $T_n = an^2$. If $${Tn(k)} = ${a * k * k}$, find $a$ and $${Tn(m)}$.`, `Satu jujukan mempunyai peraturan $T_n = an^2$. Jika $${Tn(k)} = ${a * k * k}$, cari $a$ dan $${Tn(m)}$.`), a: T(`$a = ${a}$; $${Tn(m)} = ${a * m * m}$`), sp: 's' }
        : { q: T(`The sequence $${dots([1, 2, 3, 4].map((i) => a * i * i))}$ has the rule $T_n = an^2$. Find $a$ and then $${Tn(m)}$.`, `Jujukan $${dots([1, 2, 3, 4].map((i) => a * i * i))}$ mempunyai peraturan $T_n = an^2$. Cari $a$ dan kemudian $${Tn(m)}$.`), a: T(`$a = ${a}$; $${Tn(m)} = ${a * m * m}$`), sp: 's' };
    },
    /* from a list with constant second difference: T_n = n^2 + c */
    (r) => {
      const c = r.int(-3, 8), l = [1, 2, 3, 4, 5].map((i) => i * i + c), k = r.int(9, 15);
      return { q: T(`The sequence $${dots(l)}$ has second differences equal to 2, so its rule has the form $T_n = n^2 + c$. Find $c$ and $${Tn(k)}$.`, `Jujukan $${dots(l)}$ mempunyai beza kedua sama dengan 2, jadi peraturannya berbentuk $T_n = n^2 + c$. Cari $c$ dan $${Tn(k)}$.`), a: T(`$c = ${c}$; $${Tn(k)} = ${k * k + c}$`), w: T(`$${l[0]} = 1 + c$`, `$${l[0]} = 1 + c$`), sp: 's' };
    },
    /* interleaved: large term */
    (r) => {
      const p1 = r.int(1, 6), d1 = r.int(2, 5), p2 = r.int(2, 9), d2 = r.int(1, 6), l = inter(p1, d1, p2, d2, 6), k = r.pick([15, 20, 25, 30]);
      const val = k % 2 ? p1 + d1 * ((k - 1) / 2) : p2 + d2 * (k / 2 - 1);
      return { q: T(`The sequence $${dots(l)}$ is made of two interleaved sequences: the odd-numbered terms and the even-numbered terms. Find $${Tn(k)}$.`, `Jujukan $${dots(l)}$ terdiri daripada dua jujukan berselang-seli: sebutan bernombor ganjil dan sebutan bernombor genap. Cari $${Tn(k)}$.`), a: T(`$${Tn(k)} = ${val}$`), w: T(`${k % 2 ? 'Odd' : 'Even'}-numbered terms: ${k % 2 ? p1 : p2} + ${k % 2 ? d1 : d2} × ${k % 2 ? (k - 1) / 2 : k / 2 - 1}`, `Sebutan bernombor ${k % 2 ? 'ganjil' : 'genap'}: ${k % 2 ? p1 : p2} + ${k % 2 ? d1 : d2} × ${k % 2 ? (k - 1) / 2 : k / 2 - 1}`), sp: 'm' };
    },
    /* alternating add p, q: T_20 */
    (r) => {
      const s = r.int(1, 8), p = r.int(1, 4), q = r.int(2, 6), l = alt(s, p, q, 20), k = r.pick([12, 15, 20]);
      need(p !== q);
      return { q: T(`A sequence starts at ${s} and ${p} and ${q} are added alternately (${p} first): $${sq(l.slice(0, 5))},\\ \\ldots$ Find $${Tn(k)}$.`, `Satu jujukan bermula pada ${s} dan ${p} serta ${q} ditambah secara berselang-seli (${p} dahulu): $${sq(l.slice(0, 5))},\\ \\ldots$ Cari $${Tn(k)}$.`), a: T(`$${Tn(k)} = ${alt(s, p, q, k)[k - 1]}$`), w: T(`Every 2 steps the terms go up by ${p + q}`, `Setiap 2 langkah sebutan bertambah ${p + q}`), sp: 'm' };
    },
    /* linear threshold: solve */
    (r) => {
      const a = r.int(2, 9), b = r.int(-6, 10), K = r.int(50, 300), f = (k) => a * k + b, N = firstAbove(f, K), v = r.int(0, 1);
      return v === 0 ? { q: T(`Find the first term of the sequence $T_n = ${lin(a, b, 'n')}$ that is greater than ${K}. State its position $n$.`, `Cari sebutan pertama bagi jujukan $T_n = ${lin(a, b, 'n')}$ yang lebih besar daripada ${K}. Nyatakan kedudukannya $n$.`), a: T(`$n = ${N}$, $${Tn(N)} = ${f(N)}$`), w: T(`$${lin(a, b, 'n')} > ${K}$ gives $n > ${n(round((K - b) / a, 2))}$`, `$${lin(a, b, 'n')} > ${K}$ memberi $n > ${n(round((K - b) / a, 2))}$`), sp: 'm' }
        : { q: T(`How many terms of the sequence $T_n = ${lin(a, b, 'n')}$ are less than ${K}?`, `Berapakah bilangan sebutan bagi jujukan $T_n = ${lin(a, b, 'n')}$ yang kurang daripada ${K}?`), a: T(`${N - 1}`), w: T(`$${lin(a, b, 'n')} < ${K}$ gives $n < ${n(round((K - b) / a, 2))}$`, `$${lin(a, b, 'n')} < ${K}$ memberi $n < ${n(round((K - b) / a, 2))}$`), sp: 'm' };
    },
    /* quadratic threshold */
    (r) => {
      const Q = q2(r, [1, 1, 2]), K = r.int(60, 400), N = firstAbove(Q.f, K);
      return { q: T(`Find the first term of the sequence $T_n = ${Q.tex}$ that is greater than ${K}.`, `Cari sebutan pertama bagi jujukan $T_n = ${Q.tex}$ yang lebih besar daripada ${K}.`), a: T(`$${Tn(N)} = ${Q.f(N)}$ (and $${Tn(N - 1)} = ${Q.f(N - 1)}$ is not big enough)`, `$${Tn(N)} = ${Q.f(N)}$ (dan $${Tn(N - 1)} = ${Q.f(N - 1)}$ tidak cukup besar)`), sp: 'm' };
    },
    /* which term equals X in n^2 + c */
    (r) => {
      const Q = q2(r, [1, 2]), N = r.int(6, 15), yes = r.chance(), X = Q.f(N) + (yes ? 0 : r.int(1, 3));
      let hit = 0; for (let k = 1; k < 60; k++) if (Q.f(k) === X) hit = k;
      return { q: T(`Is ${X} a term of the sequence $T_n = ${Q.tex}$? If it is, which term?`, `Adakah ${X} suatu sebutan bagi jujukan $T_n = ${Q.tex}$? Jika ya, sebutan yang ke berapa?`), a: hit ? T(`Yes, $${Tn(hit)}$`, `Ya, $${Tn(hit)}$`) : T(`No: $${Tn(N)} = ${Q.f(N)}$ and $${Tn(N + 1)} = ${Q.f(N + 1)}$, so ${X} is skipped`, `Tidak: $${Tn(N)} = ${Q.f(N)}$ dan $${Tn(N + 1)} = ${Q.f(N + 1)}$, jadi ${X} terlangkau`), sp: 'm' };
    },
    /* dot figures: formula */
    (r) => {
      const key = r.pick(['sqd', 'rct', 'tri']), p = FQ[key], k = r.int(8, 15), K = r.int(6, 12);
      return { q: T(`The diagram shows ${p.intro.en}. The number of dots in Figure $n$ is $T_n = ${p.tex}$. (a) Check the formula for Figure 3. (b) Find the number of dots in Figure ${k}.`, `Rajah menunjukkan ${p.intro.ms}. Bilangan titik dalam Rajah $n$ ialah $T_n = ${p.tex}$. (a) Semak rumus itu untuk Rajah 3. (b) Cari bilangan titik dalam Rajah ${k}.`), fig: figQ(p, [1, 2, 3]), a: T(`(a) ${p.f(3)} dots, matches the diagram (b) ${p.f(k)}`, `(a) ${p.f(3)} titik, sepadan dengan rajah (b) ${p.f(k)}`), sp: 'l' };
    },
    /* T_{n+1} - T_n */
    (r) => {
      const Q = q2(r, [1, 2, 3]), k = r.int(6, 14);
      return { q: T(`For $T_n = ${Q.tex}$, find $${Tn(k + 1)} - ${Tn(k)}$. Is the difference between neighbouring terms constant? Explain.`, `Bagi $T_n = ${Q.tex}$, cari $${Tn(k + 1)} - ${Tn(k)}$. Adakah beza antara sebutan berdekatan malar? Terangkan.`), a: T(`$${Q.f(k + 1)} - ${Q.f(k)} = ${Q.f(k + 1) - Q.f(k)}$; not constant: it grows by ${2 * Q.a} each time (compare $${Tn(k + 2)} - ${Tn(k + 1)} = ${Q.f(k + 2) - Q.f(k + 1)}$)`, `$${Q.f(k + 1)} - ${Q.f(k)} = ${Q.f(k + 1) - Q.f(k)}$; tidak malar: ia bertambah ${2 * Q.a} setiap kali (bandingkan $${Tn(k + 2)} - ${Tn(k + 1)} = ${Q.f(k + 2) - Q.f(k + 1)}$)`), sp: 'm' };
    },
    /* interleaved: which term equals X */
    (r) => {
      const p1 = r.int(1, 6), d1 = r.int(2, 5), p2 = r.int(2, 9), d2 = r.int(1, 6), l = inter(p1, d1, p2, d2, 6), odd = r.chance(), j = r.int(6, 14);
      const X = odd ? p1 + d1 * j : p2 + d2 * j, pos = odd ? 2 * j + 1 : 2 * j + 2;
      return { q: T(`The sequence $${dots(l)}$ has odd-numbered and even-numbered terms following different rules. Which term of the sequence is equal to ${X}? (Check that no other term equals ${X}.)`, `Jujukan $${dots(l)}$ mempunyai sebutan bernombor ganjil dan genap yang mengikut peraturan berbeza. Sebutan yang ke berapakah sama dengan ${X}? (Semak bahawa tiada sebutan lain sama dengan ${X}.)`), a: (() => { const other = odd ? (X - p2) / d2 : (X - p1) / d1; if (Number.isInteger(other) && other >= 0) throw SPM.REJECT; return T(`$${Tn(pos)}$`); })(), sp: 'm' };
    },
    /* triangular sums */
    (r) => {
      const k = r.int(4, 9), t = (m) => (m * (m + 1)) / 2;
      return { q: T(`Triangular numbers are $1,\\ 3,\\ 6,\\ 10,\\ \\ldots$ Add the ${ordE(k)} and ${ordE(k + 1)} triangular numbers. What kind of number do you get?`, `Nombor segi tiga ialah $1,\\ 3,\\ 6,\\ 10,\\ \\ldots$ Tambah nombor segi tiga ${ke(k)} dan ${ke(k + 1)}. Apakah jenis nombor yang anda perolehi?`), a: T(`${t(k)} + ${t(k + 1)} = ${t(k) + t(k + 1)} = ${k + 1}², a square number`, `${t(k)} + ${t(k + 1)} = ${t(k) + t(k + 1)} = ${k + 1}², nombor kuasa dua sempurna`), sp: 's' };
    },
    /* compare linear and quadratic at a value */
    (r) => {
      const a = r.int(4, 9), c = r.int(1, 5), k = r.int(3, 12);
      need(k * k + c !== a * k);
      return { q: T(`Sequence P has $T_n = n^2 + ${c}$ and sequence Q has $T_n = ${a}n$. Which sequence has the larger term when $n = ${k}$?`, `Jujukan P mempunyai $T_n = n^2 + ${c}$ dan jujukan Q mempunyai $T_n = ${a}n$. Jujukan yang manakah mempunyai sebutan yang lebih besar apabila $n = ${k}$?`), a: T(`${k * k + c > a * k ? 'P' : 'Q'}: P = ${k * k + c}, Q = ${a * k}`, `${k * k + c > a * k ? 'P' : 'Q'}: P = ${k * k + c}, Q = ${a * k}`), sp: 's' };
    },
  ];
  const ga1E = [
    /* two terms give a and c */
    (r) => {
      const a = r.int(2, 5), c = r.int(-6, 9), p = r.int(1, 3), q = p + r.int(1, 3), k = r.int(9, 14);
      return { q: T(`A sequence has the rule $T_n = an^2 + c$. Given that $${Tn(p)} = ${a * p * p + c}$ and $${Tn(q)} = ${a * q * q + c}$, find $a$, $c$ and $${Tn(k)}$.`, `Satu jujukan mempunyai peraturan $T_n = an^2 + c$. Diberi $${Tn(p)} = ${a * p * p + c}$ dan $${Tn(q)} = ${a * q * q + c}$, cari $a$, $c$ dan $${Tn(k)}$.`), a: T(`$a = ${a}$, $c = ${c}$; $${Tn(k)} = ${a * k * k + c}$`), w: T(`Subtract: $${a * (q * q - p * p)} = a(${q * q} - ${p * p})$`, `Tolak: $${a * (q * q - p * p)} = a(${q * q} - ${p * p})$`), sp: 'm' };
    },
    /* n^2 + bn + c from T1, T2 */
    (r) => {
      const b = r.int(-3, 5), c = r.int(-4, 6), k = r.int(8, 12), f = (i) => i * i + b * i + c;
      return { q: T(`A sequence has second differences equal to 2, so $T_n = n^2 + bn + c$. Given $T_1 = ${f(1)}$ and $T_2 = ${f(2)}$, find $b$, $c$ and $${Tn(k)}$.`, `Satu jujukan mempunyai beza kedua sama dengan 2, jadi $T_n = n^2 + bn + c$. Diberi $T_1 = ${f(1)}$ dan $T_2 = ${f(2)}$, cari $b$, $c$ dan $${Tn(k)}$.`), a: T(`$b = ${b}$, $c = ${c}$; $${Tn(k)} = ${f(k)}$`), w: T(`$1 + b + c = ${f(1)}$ and $4 + 2b + c = ${f(2)}$`, `$1 + b + c = ${f(1)}$ dan $4 + 2b + c = ${f(2)}$`), sp: 'l' };
    },
    /* decreasing threshold */
    (r) => {
      const a = r.int(3, 9), N = r.int(8, 20), b = a * N - r.int(1, a - 1), f = (k) => b - a * k;
      let cnt = 0; while (f(cnt + 1) > 0) cnt++;
      return { q: T(`For the sequence $T_n = ${b} - ${a}n$, (a) find the first negative term and its position, (b) find how many terms are positive.`, `Bagi jujukan $T_n = ${b} - ${a}n$, (a) cari sebutan negatif yang pertama dan kedudukannya, (b) cari bilangan sebutan yang positif.`), a: T(`(a) $${Tn(cnt + 1)} = ${f(cnt + 1)}$ (b) ${cnt}`, `(a) $${Tn(cnt + 1)} = ${f(cnt + 1)}$ (b) ${cnt}`), w: T(`$${b} - ${a}n < 0$ gives $n > ${n(round(b / a, 2))}$`, `$${b} - ${a}n < 0$ memberi $n > ${n(round(b / a, 2))}$`), sp: 'm' };
    },
    /* quadratic vs linear crossover */
    (r) => {
      const a = r.int(3, 7), c = r.int(0, 6), f = (k) => k * k + c, g = (k) => a * k;
      let N = 1; while (f(N) <= g(N) && N < 100) N++;
      need(N > 2 && N < 12);
      return { q: T(`Sequence P is $T_n = n^2 + ${c}$ and sequence Q is $T_n = ${a}n$. Find the smallest value of $n$ for which the term of P is greater than the term of Q.`, `Jujukan P ialah $T_n = n^2 + ${c}$ dan jujukan Q ialah $T_n = ${a}n$. Cari nilai $n$ terkecil yang menjadikan sebutan P lebih besar daripada sebutan Q.`), a: T(`$n = ${N}$ (P: ${f(N)}, Q: ${g(N)}; at $n = ${N - 1}$: P ${f(N - 1)}, Q ${g(N - 1)})`, `$n = ${N}$ (P: ${f(N)}, Q: ${g(N)}; pada $n = ${N - 1}$: P ${f(N - 1)}, Q ${g(N - 1)})`), sp: 'l' };
    },
    /* interleaved formulas: odd n and even n */
    (r) => {
      const a = r.int(2, 5), b = r.int(0, 4), c = r.int(1, 4), d = r.int(1, 6), k1 = r.pick([25, 31, 41]), k2 = r.pick([20, 30, 40]);
      const f = (k) => (k % 2 ? a * k + b : c * k + d);
      return { q: T(`A sequence is defined by $T_n = ${lin(a, b, 'n')}$ when $n$ is odd and $T_n = ${lin(c, d, 'n')}$ when $n$ is even. Write the first six terms, then find $${Tn(k1)}$ and $${Tn(k2)}$.`, `Satu jujukan ditakrifkan oleh $T_n = ${lin(a, b, 'n')}$ apabila $n$ ialah ganjil dan $T_n = ${lin(c, d, 'n')}$ apabila $n$ ialah genap. Tulis enam sebutan pertama, kemudian cari $${Tn(k1)}$ dan $${Tn(k2)}$.`), a: T(`$${sq([1, 2, 3, 4, 5, 6].map(f))}$; $${Tn(k1)} = ${f(k1)}$, $${Tn(k2)} = ${f(k2)}$`), sp: 'l' };
    },
    /* triangular numbers, which term */
    (r) => {
      const N = r.int(12, 30), t = (m) => (m * (m + 1)) / 2;
      return { q: T(`The $n$th triangular number is $T_n = \\dfrac{n(n + 1)}{2}$. (a) Find $${Tn(N)}$. (b) Which triangular number is equal to ${t(N - 3)}? Test values of $n$ close to ${N - 3}.`, `Nombor segi tiga ke-$n$ ialah $T_n = \\dfrac{n(n + 1)}{2}$. (a) Cari $${Tn(N)}$. (b) Nombor segi tiga yang ke berapakah sama dengan ${t(N - 3)}? Uji nilai $n$ yang hampir dengan ${N - 3}.`), a: T(`(a) ${t(N)} (b) $${Tn(N - 3)}$ (since $${N - 3} \\times ${N - 2} \\div 2 = ${t(N - 3)}$)`, `(a) ${t(N)} (b) $${Tn(N - 3)}$ (kerana $${N - 3} \\times ${N - 2} \\div 2 = ${t(N - 3)}$)`), sp: 'm' };
    },
    /* handshakes */
    (r) => {
      const N = r.int(8, 15), c = r.int(0, 2), K = r.int(5, 12), items = [[T('people at a party shake hands with each other exactly once', 'orang di sebuah majlis berjabat tangan antara satu sama lain tepat sekali'), T('handshakes', 'jabat tangan')], [T('teams in a league play each other exactly once', 'pasukan dalam satu liga bertanding antara satu sama lain tepat sekali'), T('matches', 'perlawanan')]][c % 2];
      const t = (m) => (m * (m - 1)) / 2;
      return { q: T(`When ${items[0].en}, 2 ${c % 2 ? 'teams' : 'people'} give 1 ${c % 2 ? 'match' : 'handshake'}, 3 give 3, and 4 give 6. (a) Write the next two numbers of ${items[1].en}. (b) Use $\\dfrac{n(n - 1)}{2}$ to find the number of ${items[1].en} for ${N} ${c % 2 ? 'teams' : 'people'}. (c) If there are ${t(K)} ${items[1].en}, how many ${c % 2 ? 'teams' : 'people'} are there?`, `Apabila ${items[0].ms}, 2 ${c % 2 ? 'pasukan' : 'orang'} memberi 1 ${c % 2 ? 'perlawanan' : 'jabat tangan'}, 3 memberi 3, dan 4 memberi 6. (a) Tulis dua nombor berikutnya bagi ${items[1].ms}. (b) Gunakan $\\dfrac{n(n - 1)}{2}$ untuk mencari bilangan ${items[1].ms} bagi ${N} ${c % 2 ? 'pasukan' : 'orang'}. (c) Jika terdapat ${t(K)} ${items[1].ms}, berapakah bilangan ${c % 2 ? 'pasukan' : 'orang'}?`), a: T(`(a) 10, 15 (b) ${t(N)} (c) ${K}`), sp: 'l' };
    },
    /* dot figure: threshold */
    (r) => {
      const key = r.pick(['sqd', 'rct', 'tri']), p = FQ[key], K = r.int(60, 300), N = firstAbove(p.f, K);
      return { q: T(`The diagram shows ${p.intro.en}; Figure $n$ has $${p.tex}$ dots. Find the first figure that has more than ${K} dots.`, `Rajah menunjukkan ${p.intro.ms}; Rajah $n$ mempunyai $${p.tex}$ titik. Cari rajah pertama yang mempunyai lebih daripada ${K} titik.`), fig: figQ(p, [1, 2, 3]), a: T(`Figure ${N} (${p.f(N)} dots); Figure ${N - 1} has only ${p.f(N - 1)}`, `Rajah ${N} (${p.f(N)} titik); Rajah ${N - 1} hanya mempunyai ${p.f(N - 1)}`), sp: 'l' };
    },
    /* alternating: which term equals X or first above */
    (r) => {
      const s = r.int(1, 6), p = r.int(1, 4), q = r.int(2, 6), l = alt(s, p, q, 60), K = r.int(60, 150);
      need(p !== q);
      const N = l.findIndex((x) => x > K) + 1;
      need(N > 0);
      return { q: T(`A sequence starts at ${s} and ${p} and ${q} are added alternately (${p} first): $${sq(l.slice(0, 5))},\\ \\ldots$ Find the first term that is greater than ${K}, and state which term it is.`, `Satu jujukan bermula pada ${s} dan ${p} serta ${q} ditambah secara berselang-seli (${p} dahulu): $${sq(l.slice(0, 5))},\\ \\ldots$ Cari sebutan pertama yang lebih besar daripada ${K}, dan nyatakan sebutan yang ke berapa.`), a: T(`$${Tn(N)} = ${l[N - 1]}$`), sp: 'm' };
    },
    /* Fibonacci-type: 1.E growth, which term first exceeds */
    (r) => {
      const rule = R.fib(r), K = r.int(50, 300), l = rule.l.slice();
      while (l[l.length - 1] <= K) l.push(l[l.length - 1] + l[l.length - 2]);
      const N = l.findIndex((x) => x > K) + 1;
      return { q: T(`In a Fibonacci-type sequence, $T_1 = ${l[0]}$ and $T_2 = ${l[1]}$, and each term is the sum of the previous two. Find the first term greater than ${K} and its position.`, `Dalam satu jujukan jenis Fibonacci, $T_1 = ${l[0]}$ dan $T_2 = ${l[1]}$, dan setiap sebutan ialah hasil tambah dua sebutan sebelumnya. Cari sebutan pertama yang lebih besar daripada ${K} dan kedudukannya.`), a: T(`$${Tn(N)} = ${l[N - 1]}$`), w: T(`$${sq(l.slice(0, N))}$`), sp: 'm' };
    },
  ];
  /* ---- menu chains for 1.E: quadratic (an^2 + c) / interleaved / alternating sequences, then 2-3 tasks ---- */
  const extRep = (r, lv) => {
    const kind = r.pick(['quad', 'quad', 'inter', 'alt']);
    if (kind === 'quad') {
      const Q = Q2(lv === 'e' ? r.pick([1, 1, 2]) : r.pick([1, 2, 3]), r.int(-3, 9)), f = Q.f, l = Array.from({ length: 12 }, (_, i) => f(i + 1)), shown = r.pick(['rule', 'list', 'both']);
      const intro = { rule: T(`The $n$th term of a sequence is $T_n = ${Q.tex}$.`, `Sebutan ke-$n$ bagi satu jujukan ialah $T_n = ${Q.tex}$.`), list: T(`A sequence begins $${dots(l.slice(0, 5))}$ and its second differences are constant.`, `Satu jujukan bermula $${dots(l.slice(0, 5))}$ dan beza keduanya adalah malar.`), both: T(`The sequence $${dots(l.slice(0, 4))}$ follows the rule $T_n = ${Q.tex}$.`, `Jujukan $${dots(l.slice(0, 4))}$ mengikut peraturan $T_n = ${Q.tex}$.`) }[shown];
      return { kind, l, f, Q, intro, quad: true };
    }
    if (kind === 'inter') {
      const p1 = r.int(1, 6), d1 = r.int(2, 5), p2 = r.int(2, 9), d2 = r.int(1, 6), l = inter(p1, d1, p2, d2, 40);
      return { kind, l, f: (k) => l[k - 1], intro: T(`A sequence begins $${dots(l.slice(0, 6))}$. The odd-numbered terms follow one rule and the even-numbered terms follow another rule.`, `Satu jujukan bermula $${dots(l.slice(0, 6))}$. Sebutan bernombor ganjil mengikut satu peraturan dan sebutan bernombor genap mengikut peraturan lain.`), inter: 1 };
    }
    const s = r.int(1, 6), p = r.int(1, 4), q = r.int(2, 6); need(p !== q);
    const l = alt(s, p, q, 40);
    return { kind, l, f: (k) => l[k - 1], intro: T(`A sequence begins $${dots(l.slice(0, 5))}$. It is formed by adding ${p} and ${q} alternately (${p} first).`, `Satu jujukan bermula $${dots(l.slice(0, 5))}$. Ia dibentuk dengan menambah ${p} dan ${q} secara berselang-seli (${p} dahulu).`) };
  };
  const E1t = (S, r) => {
    const { l, f } = S, k = r.int(6, 10), K = r.pick([30, 50, 80]), Y = r.chance() ? f(k) : f(k) + 1, first = l.findIndex((x) => x > K), d1 = diffs(l.slice(0, 6)), d2 = diffs(d1);
    return [
      P('Write the first six terms.', 'Tulis enam sebutan pertama.', `$${sq(l.slice(0, 6))}$`),
      P(`Find $${Tn(k)}$.`, `Cari $${Tn(k)}$.`, `$${Tn(k)} = ${f(k)}$`),
      P('Write the first differences of the first six terms.', 'Tulis beza pertama bagi enam sebutan pertama.', `$${sq(d1)}$`),
      P('Is the difference between neighbouring terms constant? Give a reason.', 'Adakah beza antara sebutan berdekatan malar? Beri satu sebab.', d1.every((x) => x === d1[0]) ? `Yes, always ${d1[0]}` : `No: the differences are ${d1.join(', ')}`, d1.every((x) => x === d1[0]) ? `Ya, sentiasa ${d1[0]}` : `Tidak: bezanya ialah ${d1.join(', ')}`),
      P(`Is ${Y} one of the first ${k + 2} terms?`, `Adakah ${Y} salah satu daripada ${k + 2} sebutan pertama?`, l.slice(0, k + 2).includes(Y) ? 'Yes' : 'No', l.slice(0, k + 2).includes(Y) ? 'Ya' : 'Tidak'),
      first > 0 ? P(`List terms until you find the first term greater than ${K}.`, `Senaraikan sebutan sehingga anda menemui sebutan pertama yang lebih besar daripada ${K}.`, `$${Tn(first + 1)} = ${l[first]}$`) : null,
      P('Write the second differences (the differences of the first differences).', 'Tulis beza kedua (beza bagi beza pertama).', `$${sq(d2)}$`),
      P(`Write $${Tn(k)}$ and $${Tn(k + 1)}$.`, `Tulis $${Tn(k)}$ dan $${Tn(k + 1)}$.`, `$${sq([f(k), f(k + 1)])}$`),
      P('Which is larger, the 4th term or twice the 2nd term?', 'Yang manakah lebih besar, sebutan ke-4 atau dua kali sebutan ke-2?', `${l[3]} and ${2 * l[1]}: ${l[3] > 2 * l[1] ? 'the 4th term' : l[3] < 2 * l[1] ? 'twice the 2nd term' : 'equal'}`, `${l[3]} dan ${2 * l[1]}: ${l[3] > 2 * l[1] ? 'sebutan ke-4' : l[3] < 2 * l[1] ? 'dua kali sebutan ke-2' : 'sama'}`),
    ];
  };
  const M1t = (S, r) => {
    const { l, f } = S, k = r.int(12, 25), j = r.int(8, 15), yes = r.chance(), X = yes ? f(j) : f(j) + 1, K = r.pick([100, 200, 500]), first = l.findIndex((x) => x > K), cnt = l.slice(0, 40).filter((x) => x < K).length;
    const pos = l.indexOf(X), same = l.slice(0, 40).filter((x) => x === X).length === 1;
    return [
      P(`Find $${Tn(k)}$ using the rule.`, `Cari $${Tn(k)}$ menggunakan peraturan itu.`, `$${Tn(k)} = ${f(k)}$`),
      P(`Is ${X} a term of the sequence? If so, which term?`, `Adakah ${X} suatu sebutan bagi jujukan itu? Jika ya, sebutan yang ke berapa?`, pos >= 0 ? `Yes, $${Tn(pos + 1)}$` : 'No', pos >= 0 ? `Ya, $${Tn(pos + 1)}$` : 'Tidak'),
      first > 0 && first < 39 ? P(`Find the first term greater than ${K} and state its position.`, `Cari sebutan pertama yang lebih besar daripada ${K} dan nyatakan kedudukannya.`, `$${Tn(first + 1)} = ${l[first]}$`) : null,
      cnt > 0 && cnt < 39 ? P(`How many terms of the sequence are less than ${K}?`, `Berapakah bilangan sebutan bagi jujukan itu yang kurang daripada ${K}?`, `${cnt}`) : null,
      P(`Find $${Tn(k + 1)} - ${Tn(k)}$.`, `Cari $${Tn(k + 1)} - ${Tn(k)}$.`, `${f(k + 1) - f(k)}`),
      P('Find the first and second differences of the first five terms.', 'Cari beza pertama dan beza kedua bagi lima sebutan pertama.', `First: $${sq(diffs(l.slice(0, 5)))}$; second: $${sq(diffs(diffs(l.slice(0, 5))))}$`, `Pertama: $${sq(diffs(l.slice(0, 5)))}$; kedua: $${sq(diffs(diffs(l.slice(0, 5))))}$`),
      P(`Find the sum of $${Tn(j)}$ and $${Tn(j + 1)}$.`, `Cari hasil tambah $${Tn(j)}$ dan $${Tn(j + 1)}$.`, `${f(j) + f(j + 1)}`),
      P('Explain in one sentence why this is not an arithmetic sequence (with a common difference), or state that it is.', 'Terangkan dalam satu ayat mengapa ini bukan jujukan aritmetik (dengan beza sepunya), atau nyatakan bahawa ia ialah jujukan aritmetik.', (() => { const dd = diffs(l.slice(0, 8)); return dd.every((x) => x === dd[0]) ? `It is arithmetic: the difference is always ${dd[0]}` : `The differences (${dd.slice(0, 4).join(', ')}, …) are not constant`; })(), (() => { const dd = diffs(l.slice(0, 8)); return dd.every((x) => x === dd[0]) ? `Ia aritmetik: bezanya sentiasa ${dd[0]}` : `Bezanya (${dd.slice(0, 4).join(', ')}, …) tidak malar`; })()),
      S.quad ? P('Write the next two terms using the second difference.', 'Tulis dua sebutan berikutnya menggunakan beza kedua.', `$${sq([l[5], l[6]])}$`) : P('Write the next two terms after the sixth term.', 'Tulis dua sebutan berikutnya selepas sebutan keenam.', `$${sq([l[6], l[7]])}$`),
    ];
  };
  const A1t = (S, r) => {
    const { l, f } = S, k = r.int(20, 39), j = r.int(15, 30), yes = r.chance(), X = yes ? f(j) : f(j) + 1, K = r.pick([300, 500, 1000, 2000]), first = l.findIndex((x) => x > K), pos = l.indexOf(X), Z = r.int(3, 8);
    return [
      P(`Find $${Tn(k)}$.`, `Cari $${Tn(k)}$.`, `$${Tn(k)} = ${f(k)}$`),
      first > 0 && first < 39 ? P(`Find the smallest $n$ for which $T_n > ${K}$, and give $T_n$ for that $n$.`, `Cari nilai $n$ terkecil yang menjadikan $T_n > ${K}$, dan beri $T_n$ bagi $n$ itu.`, `$n = ${first + 1}$, $T_n = ${l[first]}$; ($${Tn(first)} = ${l[first - 1]}$ is too small)`, `$n = ${first + 1}$, $T_n = ${l[first]}$; ($${Tn(first)} = ${l[first - 1]}$ terlalu kecil)`) : null,
      P(`Decide whether ${X} is a term and justify your answer.`, `Tentukan sama ada ${X} ialah suatu sebutan dan justifikasikan jawapan anda.`, pos >= 0 ? `Yes, $${Tn(pos + 1)} = ${X}$` : `No: it lies between two consecutive terms and no term equals ${X}`, pos >= 0 ? `Ya, $${Tn(pos + 1)} = ${X}$` : `Tidak: ia terletak di antara dua sebutan berturutan dan tiada sebutan yang sama dengan ${X}`),
      P(`Find $${Tn(k)} - ${Tn(k - 1)}$ and $${Tn(k - 1)} - ${Tn(k - 2)}$. What do you notice?`, `Cari $${Tn(k)} - ${Tn(k - 1)}$ dan $${Tn(k - 1)} - ${Tn(k - 2)}$. Apakah yang anda perhatikan?`, `${f(k) - f(k - 1)} and ${f(k - 1) - f(k - 2)}: ${f(k) - f(k - 1) === f(k - 1) - f(k - 2) ? 'equal, so the differences are constant' : 'they differ, so the differences are not constant'}`, `${f(k) - f(k - 1)} dan ${f(k - 1) - f(k - 2)}: ${f(k) - f(k - 1) === f(k - 1) - f(k - 2) ? 'sama, jadi bezanya malar' : 'berbeza, jadi bezanya tidak malar'}`),
      P(`Find the sum of the ${ordE(Z)} term and the ${ordE(Z + 1)} term.`, `Cari hasil tambah sebutan ${ke(Z)} dan sebutan ${ke(Z + 1)}.`, `${f(Z) + f(Z + 1)}`),
      P('Another rule also gives the first three terms but a different fourth term. Explain why the given rule is used here.', 'Satu peraturan lain juga memberi tiga sebutan pertama tetapi sebutan keempat yang berbeza. Terangkan mengapa peraturan yang diberi digunakan di sini.', 'A finite list can fit many rules; the stated rule or family says which one is intended', 'Senarai terhingga boleh sesuai dengan banyak peraturan; peraturan atau keluarga yang dinyatakan menentukan yang mana dimaksudkan'),
      S.inter ? P('Write the rule for the odd-numbered terms and the rule for the even-numbered terms.', 'Tulis peraturan bagi sebutan bernombor ganjil dan peraturan bagi sebutan bernombor genap.', `Odd: start ${l[0]}, add ${l[2] - l[0]}; even: start ${l[1]}, add ${l[3] - l[1]}`, `Ganjil: mula ${l[0]}, tambah ${l[2] - l[0]}; genap: mula ${l[1]}, tambah ${l[3] - l[1]}`) : null,
      P(`Find the value of $${Tn(k)} + ${Tn(k + 1)}$.`, `Cari nilai $${Tn(k)} + ${Tn(k + 1)}$.`, `${f(k) + f(k + 1)}`),
      P(`How many of the first ${k} terms are even numbers?`, `Berapakah bilangan sebutan genap dalam ${k} sebutan pertama?`, `${l.slice(0, k).filter((x) => x % 2 === 0).length}`),
    ];
  };
  const chainGen1E = (lv, tasks, ks) => (r) => { const S = extRep(r, lv); return chain(r, S.intro, tasks(S, r), r.pick(ks)); };
  ge1E.push(chainGen1E('e', E1t, [2, 2, 3]));
  gm1E.push(chainGen1E('m', M1t, [2, 3]));
  ga1E.push(chainGen1E('a', A1t, [3]));

  SPM.extend('F2-1.E', { e: ge1E, m: gm1E, a: ga1E });

  /* ================================================================ F2-2.1 Expansion */
  const pmul = (p, q) => { const o = Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { o[i + j] += a * b; })); return o; };
  const padd = (p, q, s) => Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] || 0) + (s || 1) * (q[i] || 0));
  const pt = (c, v) => poly(c.map((co, i) => [co, i === 0 ? '' : i === 1 ? v : `${v}^${i}`]).reverse());
  const lx = (a, b) => lin(a, b, 'x'), bx = (a, b) => `(${lin(a, b, 'x')})`;
  const pev = (c, x) => c.reduce((s, co, i) => s + co * x ** i, 0);
  const XS = [0, 1, 2, 3, -1, -2, 5];
  /** expansion exercise: tex = factor form, c = coefficients (ascending) from the formula, f = independent numeric evaluation of tex */
  const mkE = (tex, c, f) => { if (!XS.every((x) => f(x) === pev(c, x))) throw new Error('expansion mismatch ' + tex); return { tex, c, f, deg: c.length - 1, res: pt(c, 'x') }; };
  const X2 = (a, b, c) => poly([[a, 'x^2'], [b, 'x'], [c, '']]);
  const nzs = (r, k) => r.nz(-k, k);
  const FM = {
    one: (r) => { const k = r.int(2, 7), a = r.int(1, 5), b = nzs(r, 9); return mkE(`${k}${bx(a, b)}`, [k * b, k * a], (x) => k * (a * x + b)); },
    neg: (r) => { const k = r.int(2, 6), a = r.int(1, 5), b = nzs(r, 8); return mkE(`-${k}${bx(a, b)}`, [-k * b, -k * a], (x) => -k * (a * x + b)); },
    xone: (r) => { const k = r.int(1, 4), a = r.int(1, 4), b = nzs(r, 8); return mkE(`${k === 1 ? '' : k}x${bx(a, b)}`, [0, k * b, k * a], (x) => k * x * (a * x + b)); },
    two: (r) => { const p = r.int(1, 8), q = r.int(1, 8); return mkE(`${bx(1, p)}${bx(1, q)}`, [p * q, p + q, 1], (x) => (x + p) * (x + q)); },
    twom: (r) => { const p = nzs(r, 9), q = nzs(r, 9); need(p + q !== 0 && (p < 0 || q < 0)); return mkE(`${bx(1, p)}${bx(1, q)}`, [p * q, p + q, 1], (x) => (x + p) * (x + q)); },
    gen: (r) => { const a = r.int(2, 5), b = nzs(r, 7), c = r.int(1, 4), d = nzs(r, 7); need(a * d + b * c !== 0); return mkE(`${bx(a, b)}${bx(c, d)}`, [b * d, a * d + b * c, a * c], (x) => (a * x + b) * (c * x + d)); },
    sq: (r) => { const p = r.int(2, 9) * r.sign(); return mkE(`${bx(1, p)}^2`, [p * p, 2 * p, 1], (x) => (x + p) ** 2); },
    sqa: (r) => { const a = r.int(2, 5), b = r.int(1, 7) * r.sign(); return mkE(`${bx(a, b)}^2`, [b * b, 2 * a * b, a * a], (x) => (a * x + b) ** 2); },
    dif: (r) => { const p = r.int(2, 12); return r.chance() ? mkE(`${bx(1, p)}${bx(1, -p)}`, [-p * p, 0, 1], (x) => (x + p) * (x - p)) : mkE(`(${p} - x)(${p} + x)`, [p * p, 0, -1], (x) => (p - x) * (p + x)); },
    difa: (r) => { const a = r.int(2, 6), b = r.int(1, 9); return mkE(`${bx(a, b)}${bx(a, -b)}`, [-b * b, 0, a * a], (x) => (a * x + b) * (a * x - b)); },
    sum2: (r) => { const p = nzs(r, 6), q = nzs(r, 6), s = nzs(r, 6), t = nzs(r, 6), m = r.sign(); const c = padd(pmul([p, 1], [q, 1]), pmul([s, 1], [t, 1]), m); need(c[2] !== 0 && c[1] !== 0); return mkE(`${bx(1, p)}${bx(1, q)} ${m > 0 ? '+' : '-'} ${bx(1, s)}${bx(1, t)}`, c, (x) => (x + p) * (x + q) + m * (x + s) * (x + t)); },
    sqdif: (r) => { const a = r.int(2, 4), b = nzs(r, 5), c1 = r.int(1, 3), d = nzs(r, 5), e = r.int(1, 3), f = nzs(r, 5); const c = padd(pmul([b, a], [b, a]), pmul([d, c1], [f, e]), -1); need(c[1] !== 0 && c[2] !== 0); return mkE(`${bx(a, b)}^2 - ${bx(c1, d)}${bx(e, f)}`, c, (x) => (a * x + b) ** 2 - (c1 * x + d) * (e * x + f)); },
    sqsq: (r) => { const p = nzs(r, 7), q = nzs(r, 7); need(p !== q && p !== -q); return mkE(`${bx(1, p)}^2 - ${bx(1, q)}^2`, padd(pmul([p, 1], [p, 1]), pmul([q, 1], [q, 1]), -1), (x) => (x + p) ** 2 - (x + q) ** 2); },
    kmul: (r) => { const k = r.int(2, 4), p = nzs(r, 4), m = r.int(1, 3), q = nzs(r, 5), s = nzs(r, 5); const c = padd(pmul([k], pmul([p, 1], [p, 1])), pmul([m], pmul([q, 1], [s, 1])), -1); need(c[2] !== 0 && c[1] !== 0); return mkE(`${k}${bx(1, p)}^2 - ${m === 1 ? '' : m}${bx(1, q)}${bx(1, s)}`, c, (x) => k * (x + p) ** 2 - m * (x + q) * (x + s)); },
    cancel: (r) => { const p = nzs(r, 6), q = nzs(r, 6), t = nzs(r, 6); const c = padd(pmul([p, 1], [q, 1]), [0, t, 1], -1); need(c[1] !== 0); return mkE(`${bx(1, p)}${bx(1, q)} - x${bx(1, t)}`, c, (x) => (x + p) * (x + q) - x * (x + t)); },
    frac1: (r) => { const k = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]), m = k[1], a = m * r.int(1, 3), b = m * nzs(r, 4); return mkE(`\\dfrac{${k[0]}}{${m}}${bx(a, b)}`, [(k[0] * b) / m, (k[0] * a) / m], (x) => (k[0] * (a * x + b)) / m); },
    frac2: (r) => { const p = nzs(r, 5), q = 2 * nzs(r, 4); need(q / 2 + 2 * p !== 0); return mkE(`\\left(\\dfrac{x}{2} ${p < 0 ? '-' : '+'} ${Math.abs(p)}\\right)${bx(2, q)}`, [p * q, q / 2 + 2 * p, 1], (x) => (x / 2 + p) * (2 * x + q)); },
  };
  const F21e = ['one', 'one', 'neg', 'xone', 'two', 'two'], F21m = ['gen', 'twom', 'sq', 'sqa', 'dif', 'difa', 'sum2', 'gen', 'twom', 'frac1'], F21a = ['sqdif', 'sqsq', 'kmul', 'cancel', 'sum2', 'frac2', 'sqa', 'gen', 'difa'];
  const cof = (E, i) => E.c[i] || 0;
  /** a plausible wrong expansion of E (a different coefficient list) with a description of the mistake */
  const wrongOf = (E, r) => {
    const c = E.c.slice(), opts = [];
    if (E.deg >= 1 && c[0] !== 0) opts.push([c.map((v, i) => (i === 0 ? -v : v)), T('the constant term has the wrong sign', 'sebutan malar mempunyai tanda yang salah')]);
    if (E.deg === 2 && c[1] !== 0) { opts.push([c.map((v, i) => (i === 1 ? 0 : v)), T('the middle term is missing', 'sebutan tengah tidak ditulis')]); opts.push([c.map((v, i) => (i === 1 ? -v : v)), T('the $x$ term has the wrong sign', 'sebutan $x$ mempunyai tanda yang salah')]); }
    if (E.deg === 1 && c[1] !== 0) opts.push([[c[0], -c[1]], T('the $x$ term has the wrong sign', 'sebutan $x$ mempunyai tanda yang salah')]);
    if (E.deg === 2 && c[2] !== 0) opts.push([c.map((v, i) => (i === 2 ? v + (v > 0 ? 1 : -1) : v)), T('the coefficient of $x^2$ is wrong', 'pekali bagi $x^2$ adalah salah')]);
    need(opts.length);
    const o = r.pick(opts); need(o[0].some((v, i) => v !== c[i]));
    return { c: o[0], why: o[1] };
  };
  const t21 = (E, r) => {
    const x0 = r.pick([1, 2, 3, -1, -2, 4]), ok = r.chance(), w = ok ? null : wrongOf(E, r), shown = ok ? E.c : w.c, R = `$${E.res}$`;
    return [
      P('Expand and simplify the expression.', 'Kembangkan dan ringkaskan ungkapan itu.', R),
      P('Write its expansion in descending powers of $x$.', 'Tulis kembangannya dalam kuasa $x$ yang menurun.', R),
      P('Expand it and state the coefficient of $x$ in your answer.', 'Kembangkan ungkapan itu dan nyatakan pekali bagi $x$ dalam jawapan anda.', `${R}; coefficient of $x$: $${cof(E, 1)}$`, `${R}; pekali bagi $x$: $${cof(E, 1)}$`),
      P('Expand it and state the constant term.', 'Kembangkan ungkapan itu dan nyatakan sebutan malar.', `${R}; constant term: $${cof(E, 0)}$`, `${R}; sebutan malar: $${cof(E, 0)}$`),
      P(`Expand it, then use your answer to find its value when $x = ${x0}$.`, `Kembangkan ungkapan itu, kemudian gunakan jawapan anda untuk mencari nilainya apabila $x = ${x0}$.`, `${R}; value $${pev(E.c, x0)}$`, `${R}; nilai $${pev(E.c, x0)}$`),
      P(`Check your expansion by substituting $x = ${x0}$ into the original expression and into your answer.`, `Semak kembangan anda dengan menggantikan $x = ${x0}$ ke dalam ungkapan asal dan ke dalam jawapan anda.`, `Both give $${E.f(x0)}$; expansion ${R}`, `Kedua-duanya memberi $${E.f(x0)}$; kembangan ${R}`),
      P('Expand it and find the sum of the coefficients in the answer.', 'Kembangkan ungkapan itu dan cari jumlah pekali dalam jawapan.', `${R}; sum $${E.c.reduce((s, v) => s + v, 0)}$`, `${R}; jumlah $${E.c.reduce((s, v) => s + v, 0)}$`),
      P('How many terms does the expression have after it has been expanded and simplified?', 'Berapakah bilangan sebutan bagi ungkapan itu selepas dikembangkan dan diringkaskan?', `${E.c.filter((v) => v !== 0).length}: ${R}`),
      P(`A student says it equals $${pt(shown, 'x')}$. Is this correct? If not, give the correct expansion${ok ? '' : ' and describe the error'}.`, `Seorang murid berkata ia sama dengan $${pt(shown, 'x')}$. Adakah ini betul? Jika tidak, berikan kembangan yang betul${ok ? '' : ' dan huraikan kesilapannya'}.`, ok ? 'Correct' : `Not correct: ${R}; ${w.why.en}`, ok ? 'Betul' : `Tidak betul: ${R}; ${w.why.ms}`),
      P('What is the highest power of $x$ in the expansion?', 'Apakah kuasa $x$ yang tertinggi dalam kembangan itu?', `$x^{${E.deg}}$ (${R})`),
      E.deg === 2 && E.c[1] !== 0 ? P('Expand it. Is the coefficient of $x$ positive or negative?', 'Kembangkan ungkapan itu. Adakah pekali bagi $x$ positif atau negatif?', `${R}; ${E.c[1] > 0 ? 'positive' : 'negative'}`, `${R}; ${E.c[1] > 0 ? 'positif' : 'negatif'}`) : null,
    ];
  };
  const chainGen21 = (ks, kk) => (r) => { const E = FM[r.pick(ks)](r); return chain(r, T(`Consider the expression $${E.tex}$.`, `Pertimbangkan ungkapan $${E.tex}$.`), t21(E, r), r.pick(kk)); };
  /** two-variable expansion: (a u + b v)(c u + d v) */
  const two2 = (r, u, v, sq2) => {
    const a = r.int(1, 4), b = nzs(r, 5), c = sq2 ? a : r.int(1, 4), d = sq2 ? b : nzs(r, 5);
    const A = a * c, Bc = a * d + b * c, C = b * d;
    const f = (x, y) => (a * x + b * y) * (c * x + d * y), g = (x, y) => A * x * x + Bc * x * y + C * y * y;
    for (const [x, y] of [[1, 2], [3, -1], [2, 5], [-2, 3]]) if (f(x, y) !== g(x, y)) throw new Error('two-variable expansion mismatch');
    const t1 = (p, q) => poly([[p, u], [q, v]]);
    return { tex: sq2 ? `(${t1(a, b)})^2` : `(${t1(a, b)})(${t1(c, d)})`, res: poly([[A, `${u}^2`], [Bc, `${u}${v}`], [C, `${v}^2`]]), A, Bc, C };
  };
  const NUM = [[99, 100, -1], [98, 100, -2], [101, 100, 1], [102, 100, 2], [49, 50, -1], [51, 50, 1], [52, 50, 2], [48, 50, -2], [199, 200, -1], [201, 200, 1], [998, 1000, -2], [1002, 1000, 2], [31, 30, 1], [29, 30, -1], [62, 60, 2], [58, 60, -2]];
  const ge21 = [
    /* fill in the boxes */
    (r) => { const k = r.int(2, 8), a = r.int(1, 6), b = nzs(r, 9); return { q: T(`Fill in the boxes: $${k}(${lx(a, b)}) = \\square x ${b < 0 ? '-' : '+'} \\square$.`, `Isikan petak-petak itu: $${k}(${lx(a, b)}) = \\square x ${b < 0 ? '-' : '+'} \\square$.`), a: T(`$${k * a}$ and $${Math.abs(k * b)}$: $${lx(k * a, k * b)}$`, `$${k * a}$ dan $${Math.abs(k * b)}$: $${lx(k * a, k * b)}$`), sp: 'xs' }; },
    /* MCQ: which is the correct expansion */
    (r) => {
      const k = r.int(2, 7), a = r.int(1, 5), b = r.int(1, 9), o = mc(r, `$${lx(k * a, k * b)}$`, [`$${lx(k * a, b)}$`, `$${lx(a, k * b)}$`, `$${lx(k * a, -k * b)}$`]);
      return { q: cat(T(`Which is the correct expansion of $${k}(${lx(a, b)})$?<br>`, `Yang manakah kembangan yang betul bagi $${k}(${lx(a, b)})$?<br>`), o.q), a: o.a, sp: 's' };
    },
    /* numeric distributive law */
    (r) => {
      const k = r.int(3, 9), base = r.pick([10, 20, 30, 100]), e = r.int(1, 4), up = r.chance(), N = up ? base + e : base - e;
      return { q: T(`Use the distributive law, writing ${N} as ${base} ${up ? '+' : '-'} ${e}, to work out ${k} × ${N}.`, `Gunakan hukum kalis agihan, dengan menulis ${N} sebagai ${base} ${up ? '+' : '-'} ${e}, untuk menghitung ${k} × ${N}.`), a: T(`$${k}(${base} ${up ? '+' : '-'} ${e}) = ${k * base} ${up ? '+' : '-'} ${k * e} = ${k * N}$`), sp: 's' };
    },
    /* rectangle area */
    (r) => {
      const k = r.int(2, 8), a = r.int(1, 4), b = r.int(1, 9), x = r.int(2, 6), E = FM.one; const nm = r.pick([T('a rectangle', 'sebuah segi empat tepat')]);
      return { q: T(`A rectangle has length $(${lx(a, b)})$ cm and width ${k} cm. Write its area as an expanded expression, then find the area when $x = ${x}$.`, `Sebuah segi empat tepat mempunyai panjang $(${lx(a, b)})$ cm dan lebar ${k} cm. Tulis luasnya sebagai ungkapan yang dikembangkan, kemudian cari luasnya apabila $x = ${x}$.`), a: T(`$${k}(${lx(a, b)}) = ${lx(k * a, k * b)}$ cm$^2$; area $= ${k * (a * x + b)}$ cm$^2$`), sp: 'm' };
    },
    /* two variables, one bracket */
    (r) => {
      const [u, v] = r.pick([['a', 'b'], ['m', 'n'], ['p', 'q'], ['x', 'y']]), k = r.int(2, 6), a = r.int(1, 5), b = nzs(r, 6);
      return { q: T(`Expand $${k}(${poly([[a, u], [b, v]])})$.`, `Kembangkan $${k}(${poly([[a, u], [b, v]])})$.`), a: T(`$${poly([[k * a, u], [k * b, v]])}$`), sp: 'xs' };
    },
    /* true / false with substitution */
    (r) => {
      const k = r.int(2, 6), a = r.int(1, 4), b = r.int(1, 8), right = r.chance(), shown = right ? [k * a, k * b] : [k * a, b], x = r.int(1, 3);
      return { q: T(`Is $${k}(${lx(a, b)}) = ${lx(shown[0], shown[1])}$ correct? Test it by substituting $x = ${x}$ on both sides.`, `Adakah $${k}(${lx(a, b)}) = ${lx(shown[0], shown[1])}$ betul? Uji dengan menggantikan $x = ${x}$ pada kedua-dua belah.`), a: right ? T(`Correct: both sides equal $${k * (a * x + b)}$`, `Betul: kedua-dua belah sama dengan $${k * (a * x + b)}$`) : T(`Not correct: the left side is $${k * (a * x + b)}$ but the right side is $${shown[0] * x + shown[1]}$. The correct expansion is $${lx(k * a, k * b)}$.`, `Tidak betul: belah kiri ialah $${k * (a * x + b)}$ tetapi belah kanan ialah $${shown[0] * x + shown[1]}$. Kembangan yang betul ialah $${lx(k * a, k * b)}$.`), sp: 's' };
    },
    /* sum and product, completing the first step */
    (r) => {
      const p = r.int(1, 7), q = r.int(1, 7);
      return { q: T(`Complete: $(x + ${p})(x + ${q}) = x^2 + \\square x + \\square$. What do the two boxes have to do with ${p} and ${q}?`, `Lengkapkan: $(x + ${p})(x + ${q}) = x^2 + \\square x + \\square$. Apakah kaitan antara dua petak itu dengan ${p} dan ${q}?`), a: T(`$x^2 + ${p + q}x + ${p * q}$: the coefficient of $x$ is the sum ${p} + ${q}, and the constant is the product ${p} × ${q}`, `$x^2 + ${p + q}x + ${p * q}$: pekali $x$ ialah hasil tambah ${p} + ${q}, dan sebutan malar ialah hasil darab ${p} × ${q}`), sp: 's' };
    },
    /* step-by-step FOIL fill */
    (r) => {
      const p = r.int(1, 7), q = r.int(1, 7);
      return { q: T(`Complete the working: $(x + ${p})(x + ${q}) = x \\cdot x + x \\cdot ${q} + ${p} \\cdot x + ${p} \\cdot ${q} = x^2 + \\square x + \\square x + \\square$, so the answer is $\\square$.`, `Lengkapkan langkah kerja: $(x + ${p})(x + ${q}) = x \\cdot x + x \\cdot ${q} + ${p} \\cdot x + ${p} \\cdot ${q} = x^2 + \\square x + \\square x + \\square$, jadi jawapannya ialah $\\square$.`), a: T(`$x^2 + ${q}x + ${p}x + ${p * q} = x^2 + ${p + q}x + ${p * q}$`), sp: 's' };
    },
    /* x times a bracket, MCQ error detection */
    (r) => {
      const a = r.int(1, 4), b = r.int(1, 9), o = mc(r, `$${poly([[a, 'x^2'], [b, 'x']])}$`, [`$${poly([[a, 'x^2'], [b, '']])}$`, `$${poly([[a, 'x'], [b, 'x']])}$`, `$${poly([[a, 'x'], [b, '']])}$`]);
      return { q: cat(T(`Which is the expansion of $x(${lx(a, b)})$?<br>`, `Yang manakah kembangan bagi $x(${lx(a, b)})$?<br>`), o.q), a: o.a, sp: 's' };
    },
    /* expand and find a perimeter or area value */
    (r) => {
      const p = r.int(1, 6), q = r.int(1, 6), x = r.int(2, 7);
      return { q: T(`A rectangle has length $(x + ${p})$ cm and width $(x + ${q})$ cm. (a) Write an expression for its area and expand it. (b) Find the area when $x = ${x}$.`, `Sebuah segi empat tepat mempunyai panjang $(x + ${p})$ cm dan lebar $(x + ${q})$ cm. (a) Tulis satu ungkapan bagi luasnya dan kembangkannya. (b) Cari luasnya apabila $x = ${x}$.`), a: T(`(a) $(x + ${p})(x + ${q}) = x^2 + ${p + q}x + ${p * q}$ (b) $${(x + p) * (x + q)}$ cm$^2$`, `(a) $(x + ${p})(x + ${q}) = x^2 + ${p + q}x + ${p * q}$ (b) $${(x + p) * (x + q)}$ cm$^2$`), sp: 'm' };
    },
  ];
  ge21.push(chainGen21(F21e, [2, 2, 3]), chainGen21(['one', 'neg', 'xone', 'two'], [2, 3]), chainGen21(['two', 'one', 'xone'], [3]));
  const sqNum = (r) => { const [N, base, e] = r.pick(NUM), sq2 = r.chance(); if (sq2) return { q: T(`Use a special product to evaluate $${N}^2$ without a calculator.`, `Gunakan hasil darab khas untuk menilai $${N}^2$ tanpa kalkulator.`), a: T(`$(${base} ${e < 0 ? '-' : '+'} ${Math.abs(e)})^2 = ${base * base} ${e < 0 ? '-' : '+'} ${2 * base * Math.abs(e)} + ${e * e} = ${N * N}$`), sp: 's' }; const d = Math.abs(e); return { q: T(`Use $(a + b)(a - b) = a^2 - b^2$ to evaluate ${base + d} × ${base - d} without a calculator.`, `Gunakan $(a + b)(a - b) = a^2 - b^2$ untuk menilai ${base + d} × ${base - d} tanpa kalkulator.`), a: T(`$${base}^2 - ${d}^2 = ${base * base} - ${d * d} = ${(base + d) * (base - d)}$`), sp: 's' }; };
  const gm21 = [
    /* find the missing constant */
    (r) => {
      const p = r.int(1, 8), k = r.int(1, 8), v = r.int(0, 2);
      if (v === 0) return { q: T(`Given that $(x + ${p})(x + k) = x^2 + ${p + k}x + ${p * k}$, find the value of $k$.`, `Diberi bahawa $(x + ${p})(x + k) = x^2 + ${p + k}x + ${p * k}$, cari nilai $k$.`), a: T(`$k = ${k}$`), w: T(`$${p}k = ${p * k}$`), sp: 's' };
      if (v === 1) return { q: T(`The expansion of $(x + ${p})^2$ is $x^2 + kx + ${p * p}$. Find $k$.`, `Kembangan bagi $(x + ${p})^2$ ialah $x^2 + kx + ${p * p}$. Cari $k$.`), a: T(`$k = ${2 * p}$`), sp: 's' };
      return { q: T(`When $(x - ${p})(x + ${k})$ is expanded, the coefficient of $x$ is $m$ and the constant term is $c$. Find $m$ and $c$.`, `Apabila $(x - ${p})(x + ${k})$ dikembangkan, pekali bagi $x$ ialah $m$ dan sebutan malar ialah $c$. Cari $m$ dan $c$.`), a: T(`$m = ${k - p}$, $c = ${-p * k}$`), sp: 's' };
    },
    /* numeric squares / difference of squares */
    sqNum, sqNum,
    /* two-variable products */
    (r) => { const [u, v] = r.pick([['a', 'b'], ['m', 'n'], ['p', 'q'], ['x', 'y']]), sqf = r.chance(0.35), E = two2(r, u, v, sqf); return { q: T(`Expand and simplify $${E.tex}$.`, `Kembangkan dan ringkaskan $${E.tex}$.`), a: T(`$${E.res}$`), sp: 's' }; },
    /* two-variable difference of squares */
    (r) => { const [u, v] = r.pick([['a', 'b'], ['m', 'n'], ['p', 'q'], ['x', 'y']]), a = r.int(1, 5), b = r.int(1, 6); return { q: T(`Expand $(${poly([[a, u], [b, v]])})(${poly([[a, u], [-b, v]])})$.`, `Kembangkan $(${poly([[a, u], [b, v]])})(${poly([[a, u], [-b, v]])})$.`), a: T(`$${poly([[a * a, `${u}^2`], [-b * b, `${v}^2`]])}$`), sp: 's' }; },
    /* spot the error */
    (r) => {
      const E = FM[r.pick(['gen', 'twom', 'sq', 'sqa', 'difa', 'two'])](r), w = wrongOf(E, r), who = r.name();
      return { q: T(`${who} expands $${E.tex}$ and gets $${pt(w.c, 'x')}$. Find ${who}'s mistake and give the correct expansion.`, `${who} mengembangkan $${E.tex}$ dan mendapat $${pt(w.c, 'x')}$. Cari kesilapan ${who} dan berikan kembangan yang betul.`), a: T(`Mistake: ${w.why.en}. Correct: $${E.res}$`, `Kesilapan: ${w.why.ms}. Betul: $${E.res}$`), sp: 's' };
    },
    /* MCQ correct expansion */
    (r) => {
      const E = FM[r.pick(['gen', 'twom', 'sq', 'sqa', 'difa', 'dif'])](r), ws = []; for (let i = 0; i < 6 && ws.length < 3; i++) { const w = wrongOf(E, r); const s = `$${pt(w.c, 'x')}$`; if (!ws.includes(s)) ws.push(s); } need(ws.length === 3);
      const o = mc(r, `$${E.res}$`, ws, '<br>');
      return { q: cat(T(`Which is the correct expansion of $${E.tex}$?<br>`, `Yang manakah kembangan yang betul bagi $${E.tex}$?<br>`), o.q), a: o.a, sp: 's' };
    },
    /* area contexts */
    (r) => {
      const a = r.int(1, 4), b = r.int(1, 6), c = r.int(1, 3), d = r.int(1, 6), x = r.int(2, 6);
      return { q: T(`The length of a rectangle is $(${lx(a, b)})$ m and its width is $(x + ${d})$ m. Write and expand an expression for its area. Find the area when $x = ${x}$.`, `Panjang sebuah segi empat tepat ialah $(${lx(a, b)})$ m dan lebarnya ialah $(x + ${d})$ m. Tulis dan kembangkan satu ungkapan bagi luasnya. Cari luasnya apabila $x = ${x}$.`), a: T(`$${X2(a, a * d + b, b * d)}$ m$^2$; area $${(a * x + b) * (x + d)}$ m$^2$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(1, 6), x = r.int(3, 8), s = r.chance();
      return { q: T(`A square has sides of length $(x ${s ? '+' : '-'} ${a})$ cm. Show that its area is $(x^2 ${s ? '+' : '-'} ${2 * a}x + ${a * a})$ cm$^2$ and find the area when $x = ${x + a + 2}$.`, `Sebuah segi empat sama mempunyai sisi sepanjang $(x ${s ? '+' : '-'} ${a})$ cm. Tunjukkan bahawa luasnya ialah $(x^2 ${s ? '+' : '-'} ${2 * a}x + ${a * a})$ cm$^2$ dan cari luasnya apabila $x = ${x + a + 2}$.`), a: T(`$(x ${s ? '+' : '-'} ${a})^2 = x^2 ${s ? '+' : '-'} ${2 * a}x + ${a * a}$; area $${(x + a + 2 + (s ? a : -a)) ** 2}$ cm$^2$`), sp: 'm' };
    },
    /* find a coefficient of the expansion */
    (r) => { const E = FM.gen(r), i = r.int(0, 2), nm = [T('the constant term', 'sebutan malar'), T('the coefficient of $x$', 'pekali bagi $x$'), T('the coefficient of $x^2$', 'pekali bagi $x^2$')][i]; return { q: T(`State ${nm.en} in the expansion of $${E.tex}$.`, `Nyatakan ${nm.ms} dalam kembangan bagi $${E.tex}$.`), a: T(`$${E.c[i]}$`), w: T(`$${E.res}$`), sp: 's' }; },
    /* expand then substitute */
    (r) => { const E = FM[r.pick(['gen', 'twom', 'sq', 'sqa', 'sum2'])](r), x = r.pick([-3, -2, 2, 3, 4, 5, 10]); return { q: T(`Expand $${E.tex}$ and hence find its value when $x = ${x}$.`, `Kembangkan $${E.tex}$ dan seterusnya cari nilainya apabila $x = ${x}$.`), a: T(`$${E.res}$; $${E.f(x)}$`), sp: 's' }; },
    /* true/false of an identity */
    (r) => {
      const a = r.int(2, 8), b = r.int(2, 8), x = r.pick([[a, b]]), which = r.int(0, 2);
      const st = [[`(a + b)^2 = a^2 + b^2`, false, `(${a} + ${b})^2 = ${(a + b) ** 2} \\neq ${a * a + b * b} = ${a}^2 + ${b}^2`], [`(a - b)^2 = a^2 - 2ab + b^2`, true, `(${a} - ${b})^2 = ${(a - b) ** 2} = ${a * a} - ${2 * a * b} + ${b * b}`], [`(a - b)^2 = a^2 - b^2`, false, `(${a} - ${b})^2 = ${(a - b) ** 2} \\neq ${a * a - b * b} = ${a}^2 - ${b}^2`]][which];
      return { q: T(`Is $${st[0]}$ true for all $a$ and $b$? Test it with $a = ${a}$ and $b = ${b}$.`, `Adakah $${st[0]}$ benar bagi semua $a$ dan $b$? Uji dengan $a = ${a}$ dan $b = ${b}$.`), a: T(`${st[1] ? 'True' : 'False'}: $${st[2]}$`, `${st[1] ? 'Benar' : 'Palsu'}: $${st[2]}$`), sp: 's' };
    },
  ];
  gm21.push(chainGen21(F21m, [2, 3]), chainGen21(F21m, [2, 3]), chainGen21(['gen', 'twom', 'sq', 'sqa', 'dif', 'difa'], [3]));

  const ga21 = [
    /* multi-product simplification */
    (r) => { const E = FM[r.pick(['sqdif', 'sqsq', 'kmul', 'cancel', 'sum2'])](r); return { q: T(`Expand and simplify $${E.tex}$.`, `Kembangkan dan ringkaskan $${E.tex}$.`), a: T(`$${E.res}$`), sp: 'm' }; },
    /* numeric difference of squares */
    (r) => {
      const b = r.pick([100, 200, 500, 1000]), d = r.int(1, 9), hi = b + d, lo = b - d;
      return { q: T(`Without a calculator, evaluate $${hi}^2 - ${lo}^2$ using $a^2 - b^2 = (a + b)(a - b)$.`, `Tanpa kalkulator, nilaikan $${hi}^2 - ${lo}^2$ menggunakan $a^2 - b^2 = (a + b)(a - b)$.`), a: T(`$(${hi} + ${lo})(${hi} - ${lo}) = ${hi + lo} \\times ${hi - lo} = ${hi * hi - lo * lo}$`), sp: 'm' };
    },
    /* show an identity by expanding both sides */
    (r) => {
      const k = r.int(2, 6), v = r.int(0, 2);
      if (v === 0) return { q: T(`Show that $(x + ${k})^2 - (x - ${k})^2 = ${4 * k}x$.`, `Tunjukkan bahawa $(x + ${k})^2 - (x - ${k})^2 = ${4 * k}x$.`), a: T(`$(x^2 + ${2 * k}x + ${k * k}) - (x^2 - ${2 * k}x + ${k * k}) = ${4 * k}x$`), sp: 'm' };
      if (v === 1) return { q: T(`Show that $n(n + ${2 * k}) + ${k * k} = (n + ${k})^2$.`, `Tunjukkan bahawa $n(n + ${2 * k}) + ${k * k} = (n + ${k})^2$.`), a: T(`Left side $= n^2 + ${2 * k}n + ${k * k}$; right side $= n^2 + ${2 * k}n + ${k * k}$`, `Belah kiri $= n^2 + ${2 * k}n + ${k * k}$; belah kanan $= n^2 + ${2 * k}n + ${k * k}$`), sp: 'm' };
      return { q: T(`Show that $(n + 1)^2 - n^2 = 2n + 1$. Hence find $${k * 10 + 1}^2 - ${k * 10}^2$.`, `Tunjukkan bahawa $(n + 1)^2 - n^2 = 2n + 1$. Seterusnya cari $${k * 10 + 1}^2 - ${k * 10}^2$.`), a: T(`$n^2 + 2n + 1 - n^2 = 2n + 1$; with $n = ${k * 10}$: $${2 * k * 10 + 1}$`), sp: 'm' };
    },
    /* find k in an identity */
    (r) => {
      const k = r.int(2, 8), v = r.int(0, 1);
      return v === 0 ? { q: T(`Given that $(x + k)^2 - (x - k)^2 = ${4 * k}x$ for all $x$ where $k$ is a positive number, find $k$.`, `Diberi bahawa $(x + k)^2 - (x - k)^2 = ${4 * k}x$ bagi semua $x$ dengan $k$ ialah nombor positif, cari $k$.`), a: T(`$4kx = ${4 * k}x$, so $k = ${k}$`), sp: 'm' }
        : { q: T(`The expansion of $(x + a)(x + b)$ is $x^2 + ${2 * k + 2}x + ${k * (k + 2)}$ where $a$ and $b$ are positive integers with $a < b$. Find $a$ and $b$.`, `Kembangan bagi $(x + a)(x + b)$ ialah $x^2 + ${2 * k + 2}x + ${k * (k + 2)}$ dengan $a$ dan $b$ ialah integer positif dan $a < b$. Cari $a$ dan $b$.`), a: T(`$a = ${k}$, $b = ${k + 2}$`), w: T(`$a + b = ${2 * k + 2}$, $ab = ${k * (k + 2)}$`), sp: 'm' };
    },
    /* pairs of integers: (px + a)(x + b) */
    (r) => {
      const p = r.int(2, 4), a = r.int(1, 6), b = r.int(1, 6), S = p * b + a, P = a * b, sols = [];
      for (let x = 1; x <= 40; x++) for (let y = 1; y <= 40; y++) if (p * y + x === S && x * y === P) sols.push([x, y]);
      need(sols.length === 1);
      return { q: T(`Given that $(${p}x + a)(x + b) = ${p}x^2 + ${S}x + ${P}$ where $a$ and $b$ are positive integers, find $a$ and $b$.`, `Diberi bahawa $(${p}x + a)(x + b) = ${p}x^2 + ${S}x + ${P}$ dengan $a$ dan $b$ ialah integer positif, cari $a$ dan $b$.`), a: T(`$a = ${a}$, $b = ${b}$`), w: T(`$ab = ${P}$ and $${p}b + a = ${S}$`, `$ab = ${P}$ dan $${p}b + a = ${S}$`), sp: 'm' };
    },
    /* shaded region: square with a square hole */
    (r) => {
      const a = r.int(2, 6), b = r.int(1, a - 1), x = r.int(a + 2, a + 8);
      return { q: T(`A square of side $(x + ${a})$ cm has a square hole of side $(x - ${b})$ cm cut out of it. Write an expression for the area of the remaining shape and simplify it. Find the area when $x = ${x}$.`, `Sebuah segi empat sama bersisi $(x + ${a})$ cm mempunyai satu lubang segi empat sama bersisi $(x - ${b})$ cm yang dipotong daripadanya. Tulis satu ungkapan bagi luas bentuk yang tinggal dan ringkaskannya. Cari luasnya apabila $x = ${x}$.`), a: T(`$(x + ${a})^2 - (x - ${b})^2 = ${lx(2 * (a + b), a * a - b * b)}$ cm$^2$; area $${(x + a) ** 2 - (x - b) ** 2}$ cm$^2$`), sp: 'l' };
    },
    /* path around a garden */
    (r) => {
      const l = r.int(8, 15), w = r.int(4, l - 2), p = r.pick(['x', 'x']), x = r.int(1, 3);
      const A = 4, B = 2 * (l + w), C = 0, ex = (l + 2 * x) * (w + 2 * x) - l * w;
      return { q: T(`A rectangular garden ${l} m by ${w} m has a path of width $x$ m all the way round the outside. (a) Write an expression, in expanded form, for the total area of the path. (b) Find the area of the path when $x = ${x}$.`, `Sebuah taman segi empat tepat ${l} m kali ${w} m mempunyai denai selebar $x$ m di sekeliling bahagian luarnya. (a) Tulis satu ungkapan, dalam bentuk terkembang, bagi jumlah luas denai itu. (b) Cari luas denai itu apabila $x = ${x}$.`), a: T(`(a) $(${l} + 2x)(${w} + 2x) - ${l * w} = ${X2(4, B, 0)}$ m$^2$ (b) $${ex}$ m$^2$`), sp: 'l' };
    },
    /* rational coefficients */
    (r) => { const E = FM[r.pick(['frac1', 'frac2'])](r); return { q: T(`Expand $${E.tex}$.`, `Kembangkan $${E.tex}$.`), a: T(`$${E.res}$`), sp: 'm' }; },
    /* error correction in a multi-step simplification */
    (r) => {
      const E = FM.sqdif(r), who = r.name();
      const w = wrongOf(E, r);
      return { q: T(`${who} simplifies $${E.tex}$ and writes $${pt(w.c, 'x')}$. Explain what ${who} did wrong and find the correct answer.`, `${who} meringkaskan $${E.tex}$ dan menulis $${pt(w.c, 'x')}$. Terangkan kesilapan ${who} dan cari jawapan yang betul.`), a: T(`${SPM.cap(w.why.en)}. Correct: $${E.res}$`, `${SPM.cap(w.why.ms)}. Betul: $${E.res}$`), sp: 'm' };
    },
  ];

  ga21.push(chainGen21(F21a, [2, 3]), chainGen21(F21a, [3]), chainGen21(F21a, [2, 3]));
  SPM.extend('F2-2.1', { e: ge21, m: gm21, a: ga21 });

  const isSq = (v) => v >= 0 && Number.isInteger(Math.sqrt(v));
  const hasFac = (a, b, c) => isSq(b * b - 4 * a * c);
  /* ================================================================ F2-2.2 Factorisation */
  const fx = (a, b) => `(${lin(a, b, 'x')})`;
  const bxv = (a, b, v) => `(${lin(a, b, v)})`;
  /** factorisation exercise: display (poly), full factorisation as list of factor coefficient arrays with a leading numeric factor k; verified by expanding and by numeric evaluation */
  const mkF = (k, facs, o) => {
    // facs: list of [a,b] meaning (a x + b); k common factor (may be negative)
    let c = [k]; for (const f of facs) c = pmul(c, [f[1], f[0]]);
    const ev = (x) => facs.reduce((s, f) => s * (f[0] * x + f[1]), k);
    if (!XS.every((x) => ev(x) === pev(c, x))) throw new Error('factorisation mismatch');
    const kt = k === 1 ? '' : k === -1 ? '-' : n(k);
    const ft = facs.map((f) => fx(f[0], f[1])).join('');
    return Object.assign({ k, facs, c, disp: pt(c, 'x'), ans: kt + ft, ev }, o || {});
  };
  const pairs = (r, lo, hi, opt) => { const p = r.int(lo, hi) * (opt && opt.sgn ? r.sign() : 1), q = r.int(lo, hi) * (opt && opt.sgn ? r.sign() : 1); return [p, q]; };
  const FF = {
    hcf1: (r) => { const k = r.int(2, 9), a = r.int(1, 6), b = r.int(1, 7); need(gcd(a, b) === 1); return mkF(k, [[a, b]]); },
    hcf1m: (r) => { const k = r.int(2, 9), a = r.int(1, 6), b = r.int(1, 7); need(gcd(a, b) === 1); return mkF(k, [[a, -b]]); },
    hcfx: (r) => { const a = r.int(2, 6), b = r.int(1, 6), k = r.int(1, 3); need(gcd(a, b) === 1); const c = [0, k * b, k * a]; return { k, c, disp: pt(c, 'x'), ans: `${k === 1 ? '' : k}x${fx(a, b)}`, ev: (x) => k * x * (a * x + b), xf: true }; },
    hcf3: (r) => { const k = r.int(2, 5), a = r.int(1, 4), b = nzs(r, 5), c = nzs(r, 5); need(gcd(gcd(a, Math.abs(b)), Math.abs(c)) === 1 && !isSq(b * b - 4 * a * c)); const co = [k * c, k * b, k * a]; return { k, c: co, disp: pt(co, 'x'), ans: `${k}(${X2(a, b, c)})`, ev: (x) => k * (a * x * x + b * x + c), hcf3: 1 }; },
    tri1: (r) => { const p = r.int(1, 9), q = r.int(1, 9); return mkF(1, [[1, p], [1, q]]); },
    tri1m: (r) => { const [p, q] = [nzs(r, 9), nzs(r, 9)]; need(p + q !== 0 && (p < 0 || q < 0) && p !== q); return mkF(1, [[1, p], [1, q]]); },
    trisq: (r) => { const p = r.int(1, 9) * r.sign(); return mkF(1, [[1, p], [1, p]]); },
    dsq: (r) => { const p = r.int(2, 12); return mkF(1, [[1, p], [1, -p]]); },
    dsqa: (r) => { const a = r.int(2, 6), b = r.int(1, 9); need(gcd(a, b) === 1); return mkF(1, [[a, b], [a, -b]]); },
    dsqk: (r) => { const k = r.int(2, 6), p = r.int(1, 8); return mkF(k, [[1, p], [1, -p]]); },
    dsqka: (r) => { const k = r.int(2, 5), a = r.int(2, 4), b = r.int(1, 6); need(gcd(a, b) === 1); return mkF(k, [[a, b], [a, -b]]); },
    lead: (r) => { const a = r.int(2, 4), b = r.nz(-6, 6), c = r.int(1, 3), d = r.nz(-6, 6); need(a !== c && gcd(a, Math.abs(b)) === 1 && gcd(c, Math.abs(d)) === 1 && a * d + b * c !== 0); return mkF(1, [[a, b], [c, d]]); },
    lead6: (r) => { const a = r.pick([2, 3, 4, 6]), c = r.pick([1, 2, 3]), b = nzs(r, 7), d = nzs(r, 7); need(a * c <= 6 * 2 && gcd(a, Math.abs(b)) === 1 && gcd(c, Math.abs(d)) === 1 && a * d + b * c !== 0); return mkF(1, [[a, b], [c, d]]); },
    twostage: (r) => { const k = r.int(2, 5), p = r.int(1, 8); return mkF(k, [[1, p], [1, -p]]); },
    twostage2: (r) => { const k = r.int(2, 5), p = nzs(r, 6), q = nzs(r, 6); need(p + q !== 0 && p !== q && (p < 0 || q < 0)); return mkF(k, [[1, p], [1, q]]); },
    twostage3: (r) => { const k = r.int(2, 4), a = r.int(2, 3), b = nzs(r, 5), c = r.int(1, 2), d = nzs(r, 5); need(a !== c && gcd(a, Math.abs(b)) === 1 && gcd(c, Math.abs(d)) === 1 && a * d + b * c !== 0); return mkF(k, [[a, b], [c, d]]); },
    neg1: (r) => { const p = r.int(1, 7), q = r.int(1, 7); need(p !== q); return mkF(-1, [[1, -p], [1, -q]]); },
    negd: (r) => { const p = r.int(2, 9); return mkF(-1, [[1, p], [1, -p]]); },
    negk: (r) => { const k = r.int(2, 5), a = r.int(1, 5), b = r.int(1, 8); need(gcd(a, b) === 1); return mkF(-k, [[a, b]]); },
  };
  const FFe = ['hcf1', 'hcf1', 'hcf1m', 'hcfx', 'tri1', 'tri1'], FFm = ['tri1m', 'trisq', 'dsq', 'dsqa', 'lead', 'lead', 'hcf3'], FFa = ['twostage', 'twostage2', 'twostage3', 'dsqk', 'dsqka', 'lead6', 'neg1', 'negd', 'negk'];
  const disp2 = (F) => `$${F.disp}$`;
  const tf22 = (F, r) => {
    const x0 = r.pick([1, 2, 3, -1, 4]), Fv = F.ev(x0), D = disp2(F), A = `$${F.ans}$`, ok = r.chance();
    // a wrong factorisation: change the sign of the constant of one factor, when there is a factor with a constant term
    let wrongAns = null;
    if (F.facs && F.facs.length) { const fs = F.facs.map((f) => f.slice()); const i = r.int(0, fs.length - 1); if (fs[i][1] !== 0) { fs[i][1] = -fs[i][1]; const kt = F.k === 1 ? '' : F.k === -1 ? '-' : n(F.k); wrongAns = kt + fs.map((f) => fx(f[0], f[1])).join(''); const t = F.facs.map((f, j) => (j === i ? [f[0], -f[1]] : f)).reduce((s, f) => s * (f[0] * x0 + f[1]), F.k); if (t === Fv) wrongAns = null; } }
    return [
      P('Factorise the expression completely.', 'Faktorkan ungkapan itu sepenuhnya.', A),
      P('Write the expression as a product of factors.', 'Tulis ungkapan itu sebagai hasil darab faktor.', A),
      P('Factorise the expression, and check your answer by expanding.', 'Faktorkan ungkapan itu, dan semak jawapan anda dengan mengembangkannya.', `${A}; expanding gives ${D}`, `${A}; pengembangan memberi ${D}`),
      P(`Factorise the expression and use your factors to find its value when $x = ${x0}$.`, `Faktorkan ungkapan itu dan gunakan faktor anda untuk mencari nilainya apabila $x = ${x0}$.`, `${A}; value $${Fv}$`, `${A}; nilai $${Fv}$`),
      P(`Check by substituting $x = ${x0}$ that the expression and its factorised form have the same value.`, `Semak dengan menggantikan $x = ${x0}$ bahawa ungkapan itu dan bentuk terfaktornya mempunyai nilai yang sama.`, `Both equal $${Fv}$; factorised form ${A}`, `Kedua-duanya sama dengan $${Fv}$; bentuk terfaktor ${A}`),
      wrongAns ? P(`A student's answer is $${wrongAns}$. Expand it to show whether it is correct, and if not give the correct factorisation.`, `Jawapan seorang murid ialah $${wrongAns}$. Kembangkannya untuk menunjukkan sama ada ia betul, dan jika tidak berikan pemfaktoran yang betul.`, `It does not expand to ${D}; the correct factorisation is ${A}`, `Ia tidak mengembang kepada ${D}; pemfaktoran yang betul ialah ${A}`) : null,
      P('State the highest common factor of the terms in the expression.', 'Nyatakan faktor sepunya tertinggi bagi sebutan dalam ungkapan itu.', F.k === 1 && !F.xf ? '1 (no common factor other than 1)' : `${F.xf ? (F.k === 1 ? 'x' : `${F.k}x`) : n(Math.abs(F.k))}`, F.k === 1 && !F.xf ? '1 (tiada faktor sepunya selain 1)' : `${F.xf ? (F.k === 1 ? 'x' : `${F.k}x`) : n(Math.abs(F.k))}`),
      P('Name the method (or methods) used to factorise the expression.', 'Namakan kaedah (atau kaedah-kaedah) yang digunakan untuk memfaktorkan ungkapan itu.', (() => { const m = []; if (F.xf || F.hcf3 || Math.abs(F.k) > 1 || F.k === -1) m.push(['take out a common factor', 'keluarkan faktor sepunya']); if (F.facs && F.facs.length === 2 && F.facs[0][0] === F.facs[1][0] && F.facs[0][1] === -F.facs[1][1]) m.push(['difference of two squares', 'beza dua kuasa dua']); else if (F.facs && F.facs.length === 2) m.push(['factorising a trinomial', 'pemfaktoran trinomial']); return m.map((x) => x[0]).join(' then '); })(), (() => { const m = []; if (F.xf || F.hcf3 || Math.abs(F.k) > 1 || F.k === -1) m.push('keluarkan faktor sepunya'); if (F.facs && F.facs.length === 2 && F.facs[0][0] === F.facs[1][0] && F.facs[0][1] === -F.facs[1][1]) m.push('beza dua kuasa dua'); else if (F.facs && F.facs.length === 2) m.push('pemfaktoran trinomial'); return m.join(' kemudian '); })()),
      P('Write each factor of the fully factorised form separately.', 'Tulis setiap faktor bagi bentuk terfaktor sepenuhnya secara berasingan.', (F.k !== 1 ? [`${F.k}`] : []).concat(F.xf ? ['$x$'] : []).concat(F.facs ? F.facs.map((f) => `$${lx(f[0], f[1])}$`) : [`$${F.ans.match(/\(.*\)$/)[0]}$`]).join(', ')),
      P('How many factors (brackets) does the fully factorised form have?', 'Berapakah bilangan faktor (kurungan) dalam bentuk terfaktor sepenuhnya?', `${(F.facs || []).length || 1} bracket(s): ${A}`, `${(F.facs || []).length || 1} kurungan: ${A}`),
    ];
  };
  const chainGen22 = (ks, kk) => (r) => { const F = FF[r.pick(ks)](r); return chain(r, T(`Consider the expression ${disp2(F)}.`, `Pertimbangkan ungkapan ${disp2(F)}.`), tf22(F, r), r.pick(kk)); };
  /** factorise with a wrong-answer option list */
  const optsF = (r, F) => {
    const ws = [], kt = (k) => (k === 1 ? '' : k === -1 ? '-' : n(k));
    for (let i = 0; i < 20 && ws.length < 3; i++) {
      const fs = F.facs.map((f) => f.slice()); let k = F.k; const j = r.int(0, fs.length - 1), m = r.int(0, 3);
      if (m === 0) fs[j][1] = -fs[j][1]; else if (m === 1) fs[j][1] += r.pick([-1, 1]); else if (m === 2) k = k > 0 ? k + r.pick([-1, 1]) : k - 1; else fs[j][0] += r.pick([-1, 1]);
      if (k === 0 || fs.some((f) => f[0] === 0)) continue;
      let c = [k]; for (const f of fs) c = pmul(c, [f[1], f[0]]);
      const t = `$${kt(k)}${fs.map((f) => fx(f[0], f[1])).join('')}$`;
      if (c.some((v, i2) => v !== F.c[i2]) && !ws.includes(t)) ws.push(t);
    }
    need(ws.length === 3); return mc(r, `$${F.ans}$`, ws, '<br>');
  };
  const ge22 = [
    /* common factor: complete the bracket */
    (r) => { const k = r.int(2, 9), a = r.int(1, 6), b = r.int(1, 8); need(gcd(a, b) === 1); return { q: T(`Complete the factorisation: $${lx(k * a, k * b)} = ${k}(\\ \\square\\ )$.`, `Lengkapkan pemfaktoran: $${lx(k * a, k * b)} = ${k}(\\ \\square\\ )$.`), a: T(`$${k}(${lx(a, b)})$`), sp: 'xs' }; },
    /* HCF of two terms */
    (r) => { const k = r.int(2, 9), a = r.int(1, 6), b = r.int(1, 8); need(gcd(a, b) === 1); return { q: T(`Find the highest common factor of ${k * a}x and ${k * b}, then factorise $${lx(k * a, k * b)}$.`, `Cari faktor sepunya tertinggi bagi ${k * a}x dan ${k * b}, kemudian faktorkan $${lx(k * a, k * b)}$.`), a: T(`HCF $= ${k}$; $${k}(${lx(a, b)})$`, `FSTT $= ${k}$; $${k}(${lx(a, b)})$`), sp: 's' }; },
    /* algebraic term HCF */
    (r) => { const [u, v] = r.pick([['a', 'b'], ['m', 'n'], ['p', 'q'], ['x', 'y']]), k = r.int(2, 6), a = r.int(1, 5), b = r.int(1, 5); need(gcd(a, b) === 1); return { q: T(`Factorise $${k * a}${u}${v} + ${k * b}${u}$.`, `Faktorkan $${k * a}${u}${v} + ${k * b}${u}$.`), a: T(`$${k}${u}(${a === 1 ? '' : a}${v} + ${b})$`), sp: 's' }; },
    /* MCQ common factor */
    (r) => { const F = FF.hcf1(r), o = optsF(r, F); return { q: cat(T(`Which is the correct factorisation of $${F.disp}$?<br>`, `Yang manakah pemfaktoran yang betul bagi $${F.disp}$?<br>`), o.q), a: o.a, sp: 's' }; },
    /* trinomial: find two numbers */
    (r) => { const p = r.int(1, 8), q = r.int(1, 8); return { q: T(`Find two numbers whose sum is ${p + q} and whose product is ${p * q}. Use them to factorise $x^2 + ${p + q}x + ${p * q}$.`, `Cari dua nombor yang hasil tambahnya ${p + q} dan hasil darabnya ${p * q}. Gunakannya untuk memfaktorkan $x^2 + ${p + q}x + ${p * q}$.`), a: T(`${p} and ${q}; $(x + ${p})(x + ${q})$`), sp: 's' }; },
    /* trinomial list of factor pairs */
    (r) => { const p = r.int(1, 6), q = r.int(1, 6); need(p !== q); const P = p * q, prs = SPM.factors(P).filter((d) => d * d <= P).map((d) => [d, P / d]); return { q: T(`(a) List the pairs of positive integers with product ${P}. (b) Which pair has sum ${p + q}? (c) Factorise $x^2 + ${p + q}x + ${P}$.`, `(a) Senaraikan pasangan integer positif yang hasil darabnya ${P}. (b) Pasangan yang manakah mempunyai hasil tambah ${p + q}? (c) Faktorkan $x^2 + ${p + q}x + ${P}$.`), a: T(`(a) ${prs.map((x) => `${x[0]}, ${x[1]}`).join('; ')} (b) ${Math.min(p, q)}, ${Math.max(p, q)} (c) $(x + ${p})(x + ${q})$`), sp: 'm' }; },
    /* expand to check (which is right) */
    (r) => { const F = FF.tri1(r), p = F.facs[0][1], q = F.facs[1][1], ok = r.chance(), shown = ok ? [p, q] : [p, q + 1]; return { q: T(`Is $x^2 + ${p + q}x + ${p * q} = (x + ${shown[0]})(x + ${shown[1]})$ correct? Expand the right side to decide.`, `Adakah $x^2 + ${p + q}x + ${p * q} = (x + ${shown[0]})(x + ${shown[1]})$ betul? Kembangkan belah kanan untuk memutuskan.`), a: ok ? T('Correct: the right side expands to the left side', 'Betul: belah kanan mengembang kepada belah kiri') : T(`Not correct: the right side is $x^2 + ${shown[0] + shown[1]}x + ${shown[0] * shown[1]}$. The correct factorisation is $(x + ${p})(x + ${q})$.`, `Tidak betul: belah kanan ialah $x^2 + ${shown[0] + shown[1]}x + ${shown[0] * shown[1]}$. Pemfaktoran yang betul ialah $(x + ${p})(x + ${q})$.`), sp: 's' }; },
    /* difference of squares by recognising squares, x^2 - 9 */
    (r) => { const a = r.int(2, 12); return { q: T(`Write ${a * a} as a square number and hence factorise $x^2 - ${a * a}$.`, `Tulis ${a * a} sebagai nombor kuasa dua dan seterusnya faktorkan $x^2 - ${a * a}$.`), a: T(`${a * a} = ${a}<sup>2</sup>, so $(x + ${a})(x - ${a})$`, `${a * a} = ${a}<sup>2</sup>, jadi $(x + ${a})(x - ${a})$`), sp: 's' }; },
    /* area to dimensions (simple) */
    (r) => { const k = r.int(2, 6), a = r.int(1, 4), b = r.int(1, 7); need(gcd(a, b) === 1); return { q: T(`A rectangle has area $(${lx(k * a, k * b)})$ cm$^2$ and one side of length ${k} cm. Factorise the area to find the other side.`, `Sebuah segi empat tepat mempunyai luas $(${lx(k * a, k * b)})$ cm$^2$ dan satu sisi sepanjang ${k} cm. Faktorkan luas itu untuk mencari sisi yang satu lagi.`), a: T(`$${k}(${lx(a, b)})$: the other side is $(${lx(a, b)})$ cm`, `$${k}(${lx(a, b)})$: sisi yang satu lagi ialah $(${lx(a, b)})$ cm`), sp: 's' }; },
    /* two variable trinomial-free: common factor */
    (r) => { const [u, v] = r.pick([['a', 'b'], ['m', 'n'], ['p', 'q'], ['x', 'y']]), k = r.int(2, 5), a = r.int(1, 4), b = r.int(1, 5), c = r.int(1, 5); need(gcd(a, gcd(b, c)) === 1); return { q: T(`Factorise $${k * a}${u}^2 + ${k * b}${u}${v}$.`, `Faktorkan $${k * a}${u}^2 + ${k * b}${u}${v}$.`), a: T(`$${k}${u}(${a === 1 ? '' : a}${u} + ${b}${v})$`), sp: 's' }; },
  ];
  ge22.push(chainGen22(FFe, [2, 2, 3]), chainGen22(['hcf1', 'hcf1m', 'hcfx', 'tri1'], [2, 3]), chainGen22(['tri1', 'hcf1', 'hcfx'], [3]));
  const kSet = (a, c) => { const ks = new Set(); for (const p of SPM.factors(a)) for (const q of SPM.factors(Math.abs(c)).flatMap((d) => [d, -d])) { const rr = a / p, s = c / q; if (Number.isInteger(s)) ks.add(Math.abs(p * s + q * rr)); } return [...ks].filter((v) => v > 0).sort((x, y) => x - y); };
  const gm22 = [
    /* fill in the numbers of a signed trinomial */
    (r) => { const p = r.int(1, 9), q = r.int(1, 9); need(p !== q); const mode = r.int(0, 1); const [u, v] = mode ? [p, -q] : [-p, -q]; const F = mkF(1, [[1, u], [1, v]]); return { q: T(`Complete: $${F.disp} = (x \\ \\square\\ )(x \\ \\square\\ )$.`, `Lengkapkan: $${F.disp} = (x \\ \\square\\ )(x \\ \\square\\ )$.`), a: T(`$${F.ans}$`), sp: 's' }; },
    /* list all k */
    (r) => {
      const c = r.pick([6, 8, 10, 12, 15, 16, 18, 20, 24]), ks = kSet(1, c).filter((k) => true);
      const pos = SPM.factors(c).filter((d) => d * d <= c).map((d) => d + c / d);
      return { q: T(`The expression $x^2 + kx + ${c}$, where $k$ is a positive integer, can be factorised into two brackets with integer numbers. List all the possible values of $k$.`, `Ungkapan $x^2 + kx + ${c}$, dengan $k$ ialah integer positif, boleh difaktorkan kepada dua kurungan dengan nombor integer. Senaraikan semua nilai $k$ yang mungkin.`), a: T(`$${sq(pos.sort((x, y) => x - y))}$`), w: T(`pairs with product ${c}: ${SPM.factors(c).filter((d) => d * d <= c).map((d) => `${d}, ${c / d}`).join('; ')}`, `pasangan dengan hasil darab ${c}: ${SPM.factors(c).filter((d) => d * d <= c).map((d) => `${d}, ${c / d}`).join('; ')}`), sp: 'm' };
    },
    /* which are differences of two squares */
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), c2 = r.pick([5, 7, 12, 18, 20, 27]), items = [[`x^2 - ${a * a}`, true], [`x^2 + ${b * b}`, false], [`${b * b}x^2 - ${a * a}`, true], [`x^2 - ${c2}`, false]], sh = r.shuffle(items);
      return { q: T(`Which of these are differences of two squares (with integer coefficients)? ${sh.map((x, i) => `(${'ABCD'[i]}) $${x[0]}$`).join(' ')}`, `Yang manakah antara ini ialah beza dua kuasa dua (dengan pekali integer)? ${sh.map((x, i) => `(${'ABCD'[i]}) $${x[0]}$`).join(' ')}`), a: T(sh.map((x, i) => (x[1] ? 'ABCD'[i] : '')).filter(Boolean).join(' and ')), w: T('A sum of squares, or a difference where a number is not a perfect square, is not a difference of two squares', 'Hasil tambah kuasa dua, atau beza dengan nombor yang bukan kuasa dua sempurna, bukan beza dua kuasa dua'), sp: 's' };
    },
    /* two-variable difference of squares */
    (r) => { const [u, v] = r.pick([['a', 'b'], ['m', 'n'], ['p', 'q'], ['x', 'y']]), a = r.int(1, 6), b = r.int(1, 6); need(a !== b || true); return { q: T(`Factorise $${a * a === 1 ? '' : a * a}${u}^2 - ${b * b === 1 ? '' : b * b}${v}^2$.`, `Faktorkan $${a * a === 1 ? '' : a * a}${u}^2 - ${b * b === 1 ? '' : b * b}${v}^2$.`), a: T(`$(${a === 1 ? '' : a}${u} + ${b === 1 ? '' : b}${v})(${a === 1 ? '' : a}${u} - ${b === 1 ? '' : b}${v})$`), sp: 's' }; },
    /* numeric factorisation */
    (r) => {
      const v = r.int(0, 2), a = r.int(3, 9);
      if (v === 0) { const A = r.pick([75, 85, 65, 55]), Bn = r.pick([25, 15, 35, 45]); return { q: T(`Use factorisation to evaluate $${A}^2 - ${Bn}^2$ without a calculator.`, `Gunakan pemfaktoran untuk menilai $${A}^2 - ${Bn}^2$ tanpa kalkulator.`), a: T(`$(${A} + ${Bn})(${A} - ${Bn}) = ${A + Bn} \\times ${A - Bn} = ${A * A - Bn * Bn}$`), sp: 's' }; }
      if (v === 1) { const x = r.int(11, 89), y = 100 - x; return { q: T(`Factorise to evaluate $${a} \\times ${x} + ${a} \\times ${y}$.`, `Faktorkan untuk menilai $${a} \\times ${x} + ${a} \\times ${y}$.`), a: T(`$${a}(${x} + ${y}) = ${a} \\times 100 = ${a * 100}$`), sp: 's' }; }
      const N = r.pick([21, 31, 41, 51, 61]); return { q: T(`Evaluate $${N}^2 - ${N}$ by first taking out a common factor.`, `Nilaikan $${N}^2 - ${N}$ dengan mengeluarkan faktor sepunya terlebih dahulu.`), a: T(`$${N}(${N} - 1) = ${N} \\times ${N - 1} = ${N * (N - 1)}$`), sp: 's' };
    },
    /* area to dimensions */
    (r) => {
      const p = r.int(1, 7), q = r.int(p, 8), x = r.int(2, 6);
      return { q: T(`The area of a rectangle is $(x^2 + ${p + q}x + ${p * q})$ cm$^2$ and its length is $(x + ${q})$ cm. (a) Factorise the area to find the width. (b) Find the perimeter when $x = ${x}$.`, `Luas sebuah segi empat tepat ialah $(x^2 + ${p + q}x + ${p * q})$ cm$^2$ dan panjangnya ialah $(x + ${q})$ cm. (a) Faktorkan luas itu untuk mencari lebar. (b) Cari perimeter apabila $x = ${x}$.`), a: T(`(a) $(x + ${p})$ cm (b) $2(${x + q} + ${x + p}) = ${2 * (2 * x + p + q)}$ cm`), sp: 'm' };
    },
    /* MCQ trinomials */
    (r) => { const F = FF[r.pick(['tri1m', 'lead', 'dsqa', 'trisq'])](r), o = optsF(r, F); return { q: cat(T(`Which is the correct factorisation of $${F.disp}$?<br>`, `Yang manakah pemfaktoran yang betul bagi $${F.disp}$?<br>`), o.q), a: o.a, sp: 's' }; },
    /* not complete: 3x^2 - 27 = 3(x^2 - 9) */
    (r) => { const F = FF.twostage(r), p = F.facs[0][1], k = F.k; return { q: T(`Aina writes $${F.disp} = ${k}(x^2 - ${p * p})$. Is this a complete factorisation? If not, complete it.`, `Aina menulis $${F.disp} = ${k}(x^2 - ${p * p})$. Adakah ini pemfaktoran yang lengkap? Jika tidak, lengkapkannya.`), a: T(`No: $x^2 - ${p * p}$ can be factorised again. $${k}(x + ${p})(x - ${p})$`, `Tidak: $x^2 - ${p * p}$ boleh difaktorkan lagi. $${k}(x + ${p})(x - ${p})$`), sp: 's' }; },
    /* leading coefficient 2 or 3 with cross table */
    (r) => { const F = FF.lead(r), a = F.facs[0][0], c = F.facs[1][0]; return { q: T(`Factorise $${F.disp}$. (Hint: the coefficient of $x^2$ is ${F.c[2]}, so the $x$ terms in the two brackets multiply to give it.)`, `Faktorkan $${F.disp}$. (Petunjuk: pekali $x^2$ ialah ${F.c[2]}, jadi sebutan $x$ dalam dua kurungan itu didarab untuk memberinya.)`), a: T(`$${F.ans}$`), sp: 's' }; },
    /* find the other factor */
    (r) => { const F = FF.lead(r), f = F.facs[0]; return { q: T(`One factor of $${F.disp}$ is $${fx(F.facs[1][0], F.facs[1][1])}$. Find the other factor.`, `Satu faktor bagi $${F.disp}$ ialah $${fx(F.facs[1][0], F.facs[1][1])}$. Cari faktor yang satu lagi.`), a: T(`$${fx(f[0], f[1])}$`), sp: 's' }; },
    /* sum and product from factorisation */
    (r) => { const p = r.int(1, 9), q = r.int(1, 9), sg2 = r.chance(), F = mkF(1, [[1, sg2 ? p : -p], [1, sg2 ? q : -q]]); need(p !== q); return { q: T(`Factorise $${F.disp}$ and state the two numbers in the brackets, together with their sum and product.`, `Faktorkan $${F.disp}$ dan nyatakan dua nombor dalam kurungan itu, bersama hasil tambah dan hasil darab mereka.`), a: T(`$${F.ans}$; numbers ${sg2 ? p : -p} and ${sg2 ? q : -q}; sum ${sg2 ? p + q : -(p + q)}, product ${p * q}`, `$${F.ans}$; nombor ${sg2 ? p : -p} dan ${sg2 ? q : -q}; hasil tambah ${sg2 ? p + q : -(p + q)}, hasil darab ${p * q}`), sp: 's' }; },
    /* which method */
    (r) => { const k = r.int(2, 6), a = r.int(2, 6), b = r.int(1, 9); const ex = [[`${k * a}x + ${k * b}`, T('take out a common factor', 'keluarkan faktor sepunya')], [`x^2 - ${a * a}`, T('difference of two squares', 'beza dua kuasa dua')], [`x^2 + ${a + b}x + ${a * b}`, T('trinomial with two numbers', 'trinomial dengan dua nombor')]]; const sh = r.shuffle(ex); return { q: T(`Name the method you would use first to factorise each expression: ${sh.map((x, i) => `(${'abc'[i]}) $${x[0]}$`).join(' ')}`, `Namakan kaedah yang akan anda gunakan dahulu untuk memfaktorkan setiap ungkapan: ${sh.map((x, i) => `(${'abc'[i]}) $${x[0]}$`).join(' ')}`), a: T(sh.map((x, i) => `(${'abc'[i]}) ${x[1].en}`).join('; '), sh.map((x, i) => `(${'abc'[i]}) ${x[1].ms}`).join('; ')), sp: 's' }; },
  ];
  gm22.push(chainGen22(FFm, [2, 3]), chainGen22(FFm, [2, 3]), chainGen22(['tri1m', 'trisq', 'dsq', 'dsqa', 'lead'], [3]));
  const ga22 = [
    /* classification: can it be factorised over the integers? */
    (r) => {
      const mk = () => { const t = r.int(0, 3); const a = r.pick([1, 1, 2]), b = nzs(r, 9), c = nzs(r, 12); if (t === 0) { const p = nzs(r, 7), q = nzs(r, 7); return [X2(1, p + q, p * q), true]; } if (t === 1) return [X2(1, 0, r.int(1, 12) * 1), false]; if (t === 2) { const cc = r.pick([2, 3, 5, 6, 7, 10, 11]); return [X2(1, 0, -cc), false]; } const bb = nzs(r, 6), c3 = r.int(4, 12); return [X2(1, bb, c3), hasFac(1, bb, c3)]; };
      const items = []; while (items.length < 4) { const it = mk(); if (!items.some((x) => x[0] === it[0])) items.push(it); }
      need(items.some((x) => x[1]) && items.some((x) => !x[1]));
      return { q: T(`Which of these expressions can be factorised into two brackets with integer coefficients? Write "cannot be factorised" for the others. ${items.map((x, i) => `(${'abcd'[i]}) $${x[0]}$`).join(' ')}`, `Yang manakah antara ungkapan ini boleh difaktorkan kepada dua kurungan dengan pekali integer? Tulis "tidak boleh difaktorkan" bagi yang lain. ${items.map((x, i) => `(${'abcd'[i]}) $${x[0]}$`).join(' ')}`), a: T(items.map((x, i) => `(${'abcd'[i]}) ${x[1] ? 'can be factorised' : 'cannot'}`).join('; '), items.map((x, i) => `(${'abcd'[i]}) ${x[1] ? 'boleh difaktorkan' : 'tidak boleh'}`).join('; ')), sp: 'm' };
    },
    /* partial factorisation spotted */
    (r) => {
      const k = r.int(2, 5), p = r.int(1, 8), who = r.name();
      return { q: T(`${who} factorises $${k}x^2 - ${k * p * p}$ as $(${k}x + ${k * p})(x - ${p})$. Expand this to check it, and say why it is not the complete factorisation. Give the fully factorised form.`, `${who} memfaktorkan $${k}x^2 - ${k * p * p}$ sebagai $(${k}x + ${k * p})(x - ${p})$. Kembangkan untuk menyemaknya, dan nyatakan mengapa ia bukan pemfaktoran yang lengkap. Berikan bentuk terfaktor sepenuhnya.`), a: T(`It expands correctly, but $(${k}x + ${k * p})$ still has the common factor ${k}. Complete: $${k}(x + ${p})(x - ${p})$`, `Ia mengembang dengan betul, tetapi $(${k}x + ${k * p})$ masih mempunyai faktor sepunya ${k}. Lengkap: $${k}(x + ${p})(x - ${p})$`), sp: 'm' };
    },
    /* all k for ax^2 + kx + c */
    (r) => {
      const a = r.pick([2, 3]), c = r.pick([4, 5, 6, 8, 9]), ks = kSet(a, c);
      const pos = []; for (const p of SPM.factors(a)) for (const q of SPM.factors(c)) { const rr = a / p, s = c / q; pos.push(p * s + q * rr); }
      const u = [...new Set(pos)].sort((x, y) => x - y);
      return { q: T(`The expression $${a}x^2 + kx + ${c}$, where $k$ is a positive integer, can be factorised into two brackets with integer numbers. List all the possible values of $k$.`, `Ungkapan $${a}x^2 + kx + ${c}$, dengan $k$ ialah integer positif, boleh difaktorkan kepada dua kurungan dengan nombor integer. Senaraikan semua nilai $k$ yang mungkin.`), a: T(`$${sq(u)}$`), sp: 'l' };
    },
    /* area problem with 2x^2 */
    (r) => {
      const F = FF.lead(r), q = r.int(2, 6); need(F.facs.every((f) => f[0] > 0 && f[1] > 0));
      return { q: T(`A rectangular field has area $(${F.disp})$ m$^2$. (a) Factorise the area to find expressions for its length and width. (b) Find its perimeter in terms of $x$.`, `Sebuah padang segi empat tepat mempunyai luas $(${F.disp})$ m$^2$. (a) Faktorkan luas itu untuk mencari ungkapan bagi panjang dan lebarnya. (b) Cari perimeternya dalam sebutan $x$.`), a: T(`(a) $${fx(...F.facs[0])}$ m and $${fx(...F.facs[1])}$ m (b) $2(${lx(F.facs[0][0] + F.facs[1][0], F.facs[0][1] + F.facs[1][1])}) = ${lx(2 * (F.facs[0][0] + F.facs[1][0]), 2 * (F.facs[0][1] + F.facs[1][1]))}$ m`), sp: 'l' };
    },
    /* numeric large */
    (r) => { const b = r.pick([2019, 1001, 5001, 999]), Ns = [[b + 1, b], [b + 1, b - 1]][r.int(0, 1)]; return { q: T(`Evaluate $${Ns[0]}^2 - ${Ns[1]}^2$ without a calculator.`, `Nilaikan $${Ns[0]}^2 - ${Ns[1]}^2$ tanpa kalkulator.`), a: T(`$(${Ns[0]} + ${Ns[1]})(${Ns[0]} - ${Ns[1]}) = ${Ns[0] + Ns[1]} \\times ${Ns[0] - Ns[1]} = ${Ns[0] * Ns[0] - Ns[1] * Ns[1]}$`), sp: 's' }; },
    /* two variables, two stage */
    (r) => { const [u, v] = r.pick([['a', 'b'], ['m', 'n'], ['p', 'q'], ['x', 'y']]), k = r.int(2, 5), a = r.int(1, 3), b = r.int(1, 4); return { q: T(`Factorise completely $${k * a * a}${u}^2 - ${k * b * b}${v}^2$.`, `Faktorkan sepenuhnya $${k * a * a}${u}^2 - ${k * b * b}${v}^2$.`), a: T(`$${k}(${a === 1 ? '' : a}${u} + ${b === 1 ? '' : b}${v})(${a === 1 ? '' : a}${u} - ${b === 1 ? '' : b}${v})$`), sp: 'm' }; },
    /* the boxes of a cross table */
    (r) => { const F = FF.lead6(r), p = F.facs[0], q = F.facs[1]; return { q: T(`To factorise $${F.disp}$, write $(\\square x + \\square)(\\square x + \\square)$. The two coefficients of $x$ multiply to ${F.c[2]} and the two constants multiply to ${F.c[0]}. Find the factorisation.`, `Untuk memfaktorkan $${F.disp}$, tulis $(\\square x + \\square)(\\square x + \\square)$. Dua pekali $x$ didarab untuk memberi ${F.c[2]} dan dua sebutan malar didarab untuk memberi ${F.c[0]}. Cari pemfaktoran itu.`), a: T(`$${F.ans}$`), w: T(`Cross-check the middle term: $${p[0] * q[1]} + ${p[1] * q[0]} = ${F.c[1]}$`.replace(/ \+ -/g, ' + (-')), sp: 'm' }; },
    /* common factor of two factorised expressions */
    (r) => { const p = r.int(2, 9), q = r.int(2, 9); need(p !== q); return { q: T(`Factorise $x^2 - ${p + q}x + ${p * q}$ and $x^2 - ${p * p}$. Write down the factor that the two expressions have in common.`, `Faktorkan $x^2 - ${p + q}x + ${p * q}$ dan $x^2 - ${p * p}$. Tulis faktor yang sepunya bagi kedua-dua ungkapan itu.`), a: T(`$(x - ${p})(x - ${q})$ and $(x + ${p})(x - ${p})$: common factor $(x - ${p})$`), sp: 'm' }; },
    /* explain irreducibility of a sum of squares */
    (r) => { const c = r.pick([2, 3, 5, 7]), a = r.int(1, 9); return { q: T(`Explain why $x^2 + ${a * a}$ cannot be factorised into two brackets with integer coefficients, but $x^2 - ${a * a}$ can.`, `Terangkan mengapa $x^2 + ${a * a}$ tidak boleh difaktorkan kepada dua kurungan dengan pekali integer, tetapi $x^2 - ${a * a}$ boleh.`), a: T(`$x^2 - ${a * a} = (x + ${a})(x - ${a})$ is a difference of two squares. A sum of two squares has no such factorisation: no two integers have product ${a * a} and sum 0.`, `$x^2 - ${a * a} = (x + ${a})(x - ${a})$ ialah beza dua kuasa dua. Hasil tambah dua kuasa dua tidak mempunyai pemfaktoran sedemikian: tiada dua integer yang hasil darabnya ${a * a} dan hasil tambahnya 0.`), sp: 'm' }; },
  ];
  ga22.push(chainGen22(FFa, [2, 3]), chainGen22(FFa, [3]), chainGen22(FFa, [2, 3]));
  SPM.extend('F2-2.2', { e: ge22, m: gm22, a: ga22 });

  /* ================================================================ F2-2.3 Algebraic expressions and algebraic fractions */
  const D = (a, b) => `\\dfrac{${a}}{${b}}`;
  const XV = [-7, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 8, 0.5, 2.5], YV = [1, 2, -3, 4];
  /** a fraction exercise: tex (question), ans (simplified), ex (excluded-value conditions), ev/aev evaluate both numerically; verified at many admissible points */
  const mkA = (tex, ans, ex, ev, aev, o) => {
    let cnt = 0;
    for (const x of XV) for (const y of YV) { const a = ev(x, y); if (!Number.isFinite(a)) continue; const b = aev(x, y); if (!Number.isFinite(b) || Math.abs(a - b) > 1e-9 * Math.max(1, Math.abs(a))) throw new Error('algebraic fraction mismatch: ' + tex + ' -> ' + ans); cnt++; }
    if (cnt < 8) throw new Error('too few admissible points: ' + tex);
    return Object.assign({ tex, ans, ex: [...new Set(ex)], ev, aev }, o || {});
  };
  const cnd = (a, b, v) => `${v || 'x'} \\neq ${Fr.tex(Fr.make(-b, a))}`;
  const frt = (N, Dd) => Fr.tex(Fr.make(N, Dd));
  const coef = (k) => (k === 1 ? '' : k === -1 ? '-' : n(k));
  /** (nu/de) v, reduced, as tex */
  const mono = (nu, de, v) => { const g = gcd(nu, de) || 1, N = nu / g, Dd = de / g, sg3 = N < 0 ? '-' : ''; return Dd === 1 ? `${coef(N)}${v}` : `${sg3}\\dfrac{${coef(Math.abs(N))}${v}}{${Dd}}`; };
  const lcm2 = (a, b) => (a / gcd(a, b)) * b;
  const AF = {
    like: (r) => { const a = r.int(1, 6), b = nzs(r, 6), c = nzs(r, 6), d = nzs(r, 6), s = r.sign(); need(a + s * c !== 0 && b + s * d !== 0); return mkA(`${poly([[a, 'x'], [b, 'y']])} ${s > 0 ? '+' : '-'} (${poly([[c, 'x'], [d, 'y']])})`, poly([[a + s * c, 'x'], [b + s * d, 'y']]), [], (x, y) => a * x + b * y + s * (c * x + d * y), (x, y) => (a + s * c) * x + (b + s * d) * y); },
    brk: (r) => { const a = r.int(2, 6), b = nzs(r, 6), c = r.int(2, 6), d = nzs(r, 6), s = r.sign(); const A = a + s * c, B = a * b + s * c * d; need(A !== 0 && B !== 0); return mkA(`${a}(${lx(1, b)}) ${s > 0 ? '+' : '-'} ${c}(${lx(1, d)})`, lx(A, B), [], (x) => a * (x + b) + s * c * (x + d), (x) => A * x + B); },
    samex: (r) => { const a = r.int(1, 8), b = r.int(1, 8), k = r.int(2, 9), s = r.sign(); need(a + s * b !== 0 && gcd(a + s * b, k) > 1 || true); need(a + s * b !== 0); return mkA(`${D(`${coef(a)}x`, k)} ${s > 0 ? '+' : '-'} ${D(`${coef(b)}x`, k)}`, mono(a + s * b, k, 'x'), [], (x) => (a * x + s * b * x) / k, (x) => ((a + s * b) * x) / k); },
    samed: (r) => { const a = r.int(1, 9), b = r.int(1, 9), s = r.sign(), v = r.pick(['x', 'y']), A = a + s * b; need(A !== 0); return mkA(`${D(a, v)} ${s > 0 ? '+' : '-'} ${D(b, v)}`, `${A < 0 ? '-' : ''}${D(Math.abs(A), v)}`, [`${v} \\neq 0`], (x, y) => (a + s * b) / (v === 'x' ? x : y), (x, y) => A / (v === 'x' ? x : y)); },
    mulm: (r) => { const a = r.int(1, 6), b = r.int(1, 6), c = r.int(1, 6), d = r.int(1, 6); need(gcd(a * c, b * d) > 1 || a * c !== b * d); return mkA(`${D(`${coef(a)}x`, `${coef(b)}y`)} \\times ${D(`${coef(c)}y`, `${coef(d)}x`)}`, frt(a * c, b * d), ['x \\neq 0', 'y \\neq 0'], (x, y) => ((a * x) / (b * y)) * ((c * y) / (d * x)), () => (a * c) / (b * d)); },
    mulm2: (r) => { const a = r.int(1, 5), b = r.int(1, 6), c = r.int(1, 5), d = r.int(1, 6); return mkA(`${D(`${coef(a)}x^2`, `${coef(b)}y`)} \\times ${D(`${coef(c)}y^2`, `${coef(d)}x`)}`, mono(a * c, b * d, 'xy'), ['x \\neq 0', 'y \\neq 0'], (x, y) => ((a * x * x) / (b * y)) * ((c * y * y) / (d * x)), (x, y) => ((a * c) / (b * d)) * x * y); },
    canm: (r) => { const a = r.int(2, 9), b = r.int(2, 9); need(a !== b); return mkA(D(`${a}x^2`, `${b}x`), mono(a, b, 'x'), ['x \\neq 0'], (x) => (a * x * x) / (b * x), (x) => (a / b) * x); },
    divm: (r) => { const a = r.int(1, 6), b = r.int(1, 6), c = r.int(1, 6), d = r.int(1, 6); return mkA(`${D(`${coef(a)}x`, `${coef(b)}y`)} \\div ${D(`${coef(c)}x`, `${coef(d)}y`)}`, frt(a * d, b * c), ['x \\neq 0', 'y \\neq 0'], (x, y) => ((a * x) / (b * y)) / ((c * x) / (d * y)), () => (a * d) / (b * c)); },
    canb: (r) => { const k = r.int(2, 9), p = r.int(1, 9), q = r.chance(); return q ? mkA(D(`${k}x + ${k * p}`, k), lx(1, p), [], (x) => (k * x + k * p) / k, (x) => x + p) : mkA(D(`${k}x - ${k * p}`, k), lx(1, -p), [], (x) => (k * x - k * p) / k, (x) => x - p); },
    canb2: (r) => { const k = r.int(2, 5), m = r.int(2, 5), p = r.int(1, 8); need(gcd(k, m) === 1); return mkA(D(`${k * m}x + ${k * m * p}`, m), `${k}(${lx(1, p)})`, [], (x) => (k * m * x + k * m * p) / m, (x) => k * (x + p)); },
    unl: (r) => { const a = r.int(2, 6), b = r.int(2, 6), s = r.sign(); need(a !== b); const L = lcm2(a, b), A = L / a + s * (L / b); need(A !== 0); return mkA(`${D('x', a)} ${s > 0 ? '+' : '-'} ${D('x', b)}`, mono(A, L, 'x'), [], (x) => x / a + (s * x) / b, (x) => (A * x) / L); },
    unl2: (r) => { const a = r.int(1, 5), b = r.int(1, 5), s = r.sign(), tx = (m, v) => `${coef(m)}${v}`; return mkA(`${D(a, 'x')} ${s > 0 ? '+' : '-'} ${D(b, 'y')}`, D(`${tx(a, 'y')} ${s > 0 ? '+' : '-'} ${tx(b, 'x')}`, 'xy'), ['x \\neq 0', 'y \\neq 0'], (x, y) => a / x + (s * b) / y, (x, y) => (a * y + s * b * x) / (x * y)); },
    unl3: (r) => { const p = r.int(1, 6), q = r.int(1, 6), a = r.int(2, 5), b = r.int(2, 5), s = r.sign(); need(a !== b); const L = lcm2(a, b), N = p * (L / a) + s * q * (L / b); need(N !== 0); const g = gcd(N, L); return mkA(`${D(p, `${a}x`)} ${s > 0 ? '+' : '-'} ${D(q, `${b}x`)}`, D(N / g, `${L / g === 1 ? '' : L / g}x`), ['x \\neq 0'], (x) => p / (a * x) + (s * q) / (b * x), (x) => N / g / ((L / g) * x)); },
    lin1: (r) => { const a = r.int(1, 5), b = r.int(1, 5), k = r.int(2, 6), m = r.int(2, 6), s = r.sign(); need(k !== m); const L = lcm2(k, m), A = L / k + s * (L / m), B = (L / k) * a + s * (L / m) * b; need(A !== 0 && B !== 0 && gcd(gcd(Math.abs(A), Math.abs(B)), L) === 1); return mkA(`${D(lx(1, a), k)} ${s > 0 ? '+' : '-'} ${D(lx(1, b), m)}`, D(lx(A, B), L), [], (x) => (x + a) / k + (s * (x + b)) / m, (x) => (A * x + B) / L); },
    lin2: (r) => { const a = nzs(r, 5), b = nzs(r, 5), c1 = r.int(2, 4), c2 = r.int(2, 4), k = r.int(2, 6), m = r.int(2, 6), s = r.sign(); need(k !== m); const L = lcm2(k, m), A = c1 * (L / k) + s * c2 * (L / m), B = c1 * (L / k) * a + s * c2 * (L / m) * b; need(A !== 0 && B !== 0 && gcd(gcd(Math.abs(A), Math.abs(B)), L) === 1); return mkA(`${D(`${c1}(${lx(1, a)})`, k)} ${s > 0 ? '+' : '-'} ${D(`${c2}(${lx(1, b)})`, m)}`, D(lx(A, B), L), [], (x) => (c1 * (x + a)) / k + (s * c2 * (x + b)) / m, (x) => (A * x + B) / L); },
    mulf: (r) => { const k = r.int(2, 5), m = r.int(2, 6), p = r.int(1, 8), t = r.int(2, 6); need(gcd(k * t, m) > 1 || true); return mkA(`${D(`${k}x + ${k * p}`, m)} \\times ${D(t, `x + ${p}`)}`, frt(k * t, m), [cnd(1, p)], (x) => ((k * x + k * p) / m) * (t / (x + p)), () => (k * t) / m); },
    ds1: (r) => { const p = r.int(2, 9); return mkA(D(`x^2 - ${p * p}`, `x + ${p}`), lx(1, -p), [cnd(1, p)], (x) => (x * x - p * p) / (x + p), (x) => x - p); },
    ds2: (r) => { const p = r.int(1, 8), q = r.int(1, 8); need(p !== q); return mkA(D(X2(1, p + q, p * q), `x + ${p}`), lx(1, q), [cnd(1, p)], (x) => (x * x + (p + q) * x + p * q) / (x + p), (x) => x + q); },
    ds3: (r) => { const p = r.int(2, 8), k = r.int(2, 7); return mkA(D(`${k}x + ${k * p}`, `x^2 - ${p * p}`), D(k, `x - ${p}`), [cnd(1, p), cnd(1, -p)], (x) => (k * x + k * p) / (x * x - p * p), (x) => k / (x - p)); },
    ds4: (r) => { const p = r.int(1, 7), q = r.int(1, 7); need(p !== q); return mkA(D(`x^2 - ${p * p}`, X2(1, p + q, p * q)), D(`x - ${p}`, `x + ${q}`), [cnd(1, p), cnd(1, q)], (x) => (x * x - p * p) / (x * x + (p + q) * x + p * q), (x) => (x - p) / (x + q)); },
    div1: (r) => { const a = r.int(1, 6), b = r.int(2, 6), c = r.int(2, 6); need(b !== c); return mkA(`${D(lx(1, a), b)} \\div ${D(lx(1, a), c)}`, frt(c, b), [cnd(1, a)], (x) => ((x + a) / b) / ((x + a) / c), () => c / b); },
    div2: (r) => { const k = r.int(2, 5), c = r.int(2, 6), d = r.int(2, 6), p = r.int(1, 8); return mkA(`${D(`${k}x + ${k * p}`, c)} \\div ${D(`x + ${p}`, d)}`, frt(k * d, c), [cnd(1, p)], (x) => ((k * x + k * p) / c) / ((x + p) / d), () => (k * d) / c); },
    sdb: (r) => { const a = r.int(1, 5), b = nzs(r, 6), c = r.int(1, 5), d = nzs(r, 6), p = r.int(1, 6), s = r.sign(); const A = a + s * c, B = b + s * d; need(A !== 0 && B !== 0 && B !== p * A && a !== c); return mkA(`${D(lx(a, b), lx(1, p))} ${s > 0 ? '+' : '-'} ${D(lx(c, d), lx(1, p))}`, D(lx(A, B), lx(1, p)), [cnd(1, p)], (x) => (a * x + b) / (x + p) + (s * (c * x + d)) / (x + p), (x) => (A * x + B) / (x + p)); },
    sdc: (r) => { const p = r.int(2, 9), s = r.sign(); return s > 0 ? mkA(`${D('x^2', `x - ${p}`)} - ${D(p * p, `x - ${p}`)}`, lx(1, p), [cnd(1, -p)], (x) => (x * x - p * p) / (x - p), (x) => x + p) : mkA(`${D('x', `x + ${p}`)} + ${D(p, `x + ${p}`)}`, '1', [cnd(1, p)], (x) => (x + p) / (x + p), () => 1); },
    one: (r) => { const p = r.int(1, 9), s = r.sign(); return mkA(`1 ${s > 0 ? '+' : '-'} ${D(p, `x ${s > 0 ? '+' : '-'} ${p}`)}`, s > 0 ? D(`x + ${2 * p}`, `x + ${p}`) : D(`x - ${2 * p}`, `x - ${p}`), [cnd(1, s > 0 ? p : -p)], (x) => 1 + s * (p / (x + s * p)), (x) => (s > 0 ? (x + 2 * p) / (x + p) : (x - 2 * p) / (x - p))); },
    ub: (r) => { const a = r.int(1, 5), b = r.int(1, 5), p = r.int(1, 4), q = r.int(1, 4), s = r.sign(); need(a !== b); const A = p + s * q, B = p * b + s * q * a; need(A !== 0 && B !== 0 && B !== A * -a && B !== A * -b); return mkA(`${D(p, `x + ${a}`)} ${s > 0 ? '+' : '-'} ${D(q, `x + ${b}`)}`, D(lx(A, B), `(x + ${a})(x + ${b})`), [cnd(1, a), cnd(1, b)], (x) => p / (x + a) + (s * q) / (x + b), (x) => (A * x + B) / ((x + a) * (x + b))); },
    ub2: (r) => { const a = r.int(1, 6), b = r.int(1, 6), p = r.int(1, 3); need(a !== b); return mkA(`${D(p, `x - ${a}`)} - ${D(p, `x + ${b}`)}`, D(`${p * (a + b)}`, `(x - ${a})(x + ${b})`), [cnd(1, -a), cnd(1, b)], (x) => p / (x - a) - p / (x + b), (x) => (p * (a + b)) / ((x - a) * (x + b))); },
    fd: (r) => { const p = r.int(2, 7), m = r.int(1, 4), q = r.int(1, 6), s = r.sign(); const A = m, B = m * p + s * q; need(B !== 0 && B !== A * p && B !== -A * p); return mkA(`${D(m, `x - ${p}`)} ${s > 0 ? '+' : '-'} ${D(q, `x^2 - ${p * p}`)}`, D(lx(A, B), `(x - ${p})(x + ${p})`), [cnd(1, -p), cnd(1, p)], (x) => m / (x - p) + (s * q) / (x * x - p * p), (x) => (A * x + B) / ((x - p) * (x + p))); },
    fd2: (r) => { const p = r.int(2, 7), k = r.int(2, 5); return mkA(`${D(k, `x - ${p}`)} - ${D(k * 2 * p, `x^2 - ${p * p}`)}`, D(k, `x + ${p}`), [cnd(1, -p), cnd(1, p)], (x) => k / (x - p) - (k * 2 * p) / (x * x - p * p), (x) => k / (x + p)); },
    dv3: (r) => { const p = r.int(1, 7), q = r.int(1, 7), k = r.int(2, 6); need(p !== q); return mkA(`${D(`x^2 - ${p * p}`, `x + ${q}`)} \\div ${D(`x - ${p}`, k)}`, D(`${k}(x + ${p})`, `x + ${q}`), [cnd(1, q), cnd(1, -p)], (x) => ((x * x - p * p) / (x + q)) / ((x - p) / k), (x) => (k * (x + p)) / (x + q)); },
    dv4: (r) => { const p = r.int(1, 7), q = r.int(1, 7), k = r.int(2, 5), m = r.int(2, 5); need(p !== q && gcd(k, m) === 1); return mkA(`${D(X2(1, p + q, p * q), k)} \\div ${D(`x + ${q}`, m)}`, D(`${m}(x + ${p})`, k), [cnd(1, q)], (x) => ((x * x + (p + q) * x + p * q) / k) / ((x + q) / m), (x) => (m * (x + p)) / k); },
    mx: (r) => { const p = r.int(2, 8); return mkA(`${D(`x^2 - ${p * p}`, 'x^2')} \\times ${D('x', `x - ${p}`)}`, D(`x + ${p}`, 'x'), ['x \\neq 0', cnd(1, -p)], (x) => ((x * x - p * p) / (x * x)) * (x / (x - p)), (x) => (x + p) / x); },
    mx2: (r) => { const p = r.int(1, 6), q = r.int(1, 6), k = r.int(2, 5); need(p !== q); return mkA(`${D(X2(1, p + q, p * q), `x^2 - ${q * q}`)} \\times ${D(`${k}(x - ${q})`, `x + ${p}`)}`, `${k}`, [cnd(1, -q), cnd(1, q), cnd(1, p)], (x) => ((x * x + (p + q) * x + p * q) / (x * x - q * q)) * ((k * (x - q)) / (x + p)), () => k); },
    ce: (r) => { const p = r.int(1, 8), s = r.chance(); return s ? mkA(D(`(x + ${p})^2 - ${p * p}`, 'x'), lx(1, 2 * p), ['x \\neq 0'], (x) => ((x + p) ** 2 - p * p) / x, (x) => x + 2 * p) : mkA(D(`(x - ${p})^2 - ${p * p}`, 'x'), lx(1, -2 * p), ['x \\neq 0'], (x) => ((x - p) ** 2 - p * p) / x, (x) => x - 2 * p); },
    ce2: (r) => { const a = r.int(1, 7), b = r.int(1, 7); need(a !== b); return mkA(D(`(x + ${a})(x + ${b}) - ${a * b}`, 'x'), lx(1, a + b), ['x \\neq 0'], (x) => ((x + a) * (x + b) - a * b) / x, (x) => x + a + b); },
    ce3: (r) => { const p = r.int(1, 6), q = r.int(1, 6); need(p !== q); return mkA(D(`(x + ${p})^2 - ${q * q}`, `x + ${p + q}`), lx(1, p - q), [cnd(1, p + q)], (x) => ((x + p) ** 2 - q * q) / (x + p + q), (x) => x + p - q); },
    sp: (r) => { const a = r.int(1, 6), b = r.int(1, 6), c = r.int(2, 6); need(gcd(a + b, c) > 1 || a + b !== c); return mkA(`\\left(${D(a, 'x')} + ${D(b, 'x')}\\right) \\times ${D('x', c)}`, frt(a + b, c), ['x \\neq 0'], (x) => (a / x + b / x) * (x / c), () => (a + b) / c); },
    three: (r) => { const ds = r.pick([[2, 3, 6], [2, 4, 4], [3, 4, 12], [2, 3, 12], [4, 6, 12], [2, 5, 10]]), [k1, k2, k3] = ds, c = [r.int(1, 3), r.int(1, 3), r.int(1, 3)], b = [nzs(r, 4), nzs(r, 4), nzs(r, 4)], s = [1, r.sign(), r.sign()]; const L = lcm2(lcm2(k1, k2), k3), ks = [k1, k2, k3]; const A = [0, 1, 2].reduce((t, i) => t + s[i] * c[i] * (L / ks[i]), 0), B = [0, 1, 2].reduce((t, i) => t + s[i] * b[i] * (L / ks[i]), 0); need(A !== 0 && B !== 0 && gcd(gcd(Math.abs(A), Math.abs(B)), L) === 1); const term = (i) => `${D(lin(c[i], b[i], 'x'), ks[i])}`; return mkA(`${term(0)} ${s[1] > 0 ? '+' : '-'} ${term(1)} ${s[2] > 0 ? '+' : '-'} ${term(2)}`, D(lx(A, B), L), [], (x) => [0, 1, 2].reduce((t, i) => t + (s[i] * (c[i] * x + b[i])) / ks[i], 0), (x) => (A * x + B) / L); },
  };
  const AFe = ['like', 'brk', 'samex', 'samed', 'mulm', 'canm', 'divm', 'canb', 'unl'], AFm = ['unl2', 'unl3', 'lin1', 'mulf', 'ds1', 'ds2', 'ds3', 'div1', 'div2', 'sdb', 'lin2', 'canb2', 'mulm2'], AFa = ['ub', 'ub2', 'fd', 'fd2', 'dv3', 'dv4', 'mx', 'mx2', 'ce', 'ce2', 'ce3', 'sp', 'three', 'sdc', 'one', 'ds4'];
  const exTex = (A) => A.ex.join(',\\ ');
  const exStr = (A) => (A.ex.length ? T(` (for $${exTex(A)}$)`, ` (bagi $${exTex(A)}$)`) : T(''));
  const frOf = (v) => { for (let d = 1; d <= 720; d++) if (Math.abs(v * d - Math.round(v * d)) < 1e-8) return Fr.make(Math.round(v * d), d); return null; };
  const t23 = (A, r) => {
    const ansT = T(`$${A.ans}$`);
    let v = null; for (const c0 of r.shuffle([2, 3, 4, 5, 6, 7, -2, -3, 8, 10])) { if (Number.isFinite(A.ev(c0, 3)) && frOf(A.aev(c0, 3)) && frOf(A.ev(c0, 3))) { v = c0; break; } }
    const hasV = v !== null && !/y/.test(A.tex), val = hasV ? Fr.tex(frOf(A.aev(v, 3))) : '';
    const hasX = A.ex.length > 0;
    return [
      { q: T('Simplify the expression.', 'Ringkaskan ungkapan itu.'), a: cat(ansT, exStr(A)) },
      hasX ? { q: T('State every value of the variable(s) for which the original expression is not defined.', 'Nyatakan setiap nilai pemboleh ubah yang menjadikan ungkapan asal tidak tertakrif.'), a: T(`$${exTex(A)}$`) } : null,
      hasX ? { q: T('Simplify the expression and state the values for which it is not defined.', 'Ringkaskan ungkapan itu dan nyatakan nilai yang menjadikannya tidak tertakrif.'), a: T(`$${A.ans}$, where $${exTex(A)}$`, `$${A.ans}$, dengan $${exTex(A)}$`) } : null,
      hasV ? { q: T(`Simplify the expression, then find its value when $x = ${v}$.`, `Ringkaskan ungkapan itu, kemudian cari nilainya apabila $x = ${v}$.`), a: T(`$${A.ans}$; value $${val}$`, `$${A.ans}$; nilai $${val}$`) } : null,
      hasV ? { q: T(`Check your simplification by substituting $x = ${v}$ into the original expression and into your answer.`, `Semak pengringkasan anda dengan menggantikan $x = ${v}$ ke dalam ungkapan asal dan ke dalam jawapan anda.`), a: T(`Both give $${val}$; simplified form $${A.ans}$`, `Kedua-duanya memberi $${val}$; bentuk ringkas $${A.ans}$`) } : null,
      /^-?\\dfrac\{[^{}]*\}\{[^{}]*\}$/.test(A.ans) ? { q: T('Simplify the expression and write down the numerator of your answer.', 'Ringkaskan ungkapan itu dan tulis pengangka bagi jawapan anda.'), a: T(`$${A.ans}$; numerator $${A.ans.match(/\{([^{}]*)\}\{/)[1]}$`, `$${A.ans}$; pengangka $${A.ans.match(/\{([^{}]*)\}\{/)[1]}$`) } : null,
      /^-?\\dfrac\{[^{}]*\}\{[^{}]*\}$/.test(A.ans) ? { q: T('Simplify the expression and write down the denominator of your answer.', 'Ringkaskan ungkapan itu dan tulis penyebut bagi jawapan anda.'), a: T(`$${A.ans}$; denominator $${A.ans.match(/\}\{([^{}]*)\}$/)[1]}$`, `$${A.ans}$; penyebut $${A.ans.match(/\}\{([^{}]*)\}$/)[1]}$`) } : null,
    ];
  };
  const chainGen23 = (ks, kk) => (r) => { const A = AF[r.pick(ks)](r); return chain(r, T(`Consider the expression $${A.tex}$.`, `Pertimbangkan ungkapan $${A.tex}$.`), t23(A, r), r.pick(kk)); };
  const kx = (v) => (v < 0 ? `(${v})` : `${v}`);
  const ge23 = [
    /* which value is excluded */
    (r) => {
      const v = r.int(0, 3), k = r.int(1, 9), p = r.int(1, 9);
      const ex = [[D(k, `x - ${p}`), [cnd(1, -p)]], [D(`x + ${k}`, 'x'), ['x \\neq 0']], [D(k, lx(r.int(2, 4), -p)), null], [D(`x + ${k}`, `x + ${p}`), [cnd(1, p)]]][v];
      if (!ex[1]) { const a = r.int(2, 4); return { q: T(`Find the value of $x$ for which $${D(k, lx(a, -a * p))}$ is not defined.`, `Cari nilai $x$ yang menjadikan $${D(k, lx(a, -a * p))}$ tidak tertakrif.`), a: T(`$x = ${p}$ (the denominator would be 0)`, `$x = ${p}$ (penyebut akan menjadi 0)`), sp: 'xs' }; }
      return { q: T(`For which value of $x$ is $${ex[0]}$ not defined? Give a reason.`, `Bagi nilai $x$ yang manakah $${ex[0]}$ tidak tertakrif? Beri satu sebab.`), a: T(`$${ex[1][0]}$: the denominator cannot be zero`, `$${ex[1][0]}$: penyebut tidak boleh sifar`), sp: 'xs' };
    },
    /* fill the numerator */
    (r) => { const a = r.int(1, 9), b = r.int(1, 9), s = r.sign(), v = r.pick(['x', 'y', 'm']); need(a + s * b !== 0); return { q: T(`Fill in the box: $${D(a, v)} ${s > 0 ? '+' : '-'} ${D(b, v)} = ${D('\\square', v)}$.`, `Isikan petak itu: $${D(a, v)} ${s > 0 ? '+' : '-'} ${D(b, v)} = ${D('\\square', v)}$.`), a: T(`$${a + s * b}$`), sp: 'xs' }; },
    /* collect like terms: perimeter */
    (r) => {
      const a = r.int(1, 5), b = r.int(1, 8), c = r.int(1, 5), d = r.int(1, 8), e = r.int(1, 5), f = r.int(1, 8), sh = r.pick([[T('triangle', 'segi tiga'), 3], [T('quadrilateral with a fourth side of 5 cm', 'sisi empat dengan sisi keempat 5 cm'), 4]]);
      const A = a + c + e, B = b + d + f + (sh[1] === 4 ? 5 : 0);
      return { q: T(`The sides of a ${sh[0].en} are $(${lx(a, b)})$ cm, $(${lx(c, d)})$ cm and $(${lx(e, f)})$ cm. Write its perimeter as a simplified expression.`, `Sisi-sisi sebuah ${sh[0].ms} ialah $(${lx(a, b)})$ cm, $(${lx(c, d)})$ cm dan $(${lx(e, f)})$ cm. Tulis perimeternya sebagai ungkapan yang diringkaskan.`), a: T(`$${lx(A, B)}$ cm`), sp: 's' };
    },
    /* invalid cancellation: test with numbers */
    (r) => {
      const p = r.int(2, 9), x0 = r.int(2, 6), v = r.int(0, 2);
      const bank = [[`${D(`x + ${p}`, 'x')} = ${p}`, 0, `${D(`${x0} + ${p}`, x0)} = ${D(x0 + p, x0)} \\neq ${p}`, T('cancelled the $x$ in $x + ' + p + '$ (a term) with the $x$ below', 'membatalkan $x$ dalam $x + ' + p + '$ (satu sebutan) dengan $x$ di bawah')], [`${D(`${p}x + 1`, p)} = x + 1`, 0, `${D(`${p} \\times ${x0} + 1`, p)} = ${D(p * x0 + 1, p)} \\neq ${x0 + 1}`, T(`cancelled ${p} from only one term of the numerator`, `membatalkan ${p} daripada satu sebutan sahaja dalam pengangka`)], [`${D(`x^2 + ${p}`, `x + ${p}`)} = x`, 0, `${D(`${x0}^2 + ${p}`, `${x0} + ${p}`)} = ${D(x0 * x0 + p, x0 + p)} \\neq ${x0}`, T('cancelled terms instead of factors', 'membatalkan sebutan dan bukan faktor')]][v];
      return { q: T(`Ali writes $${bank[0]}$. Substitute $x = ${x0}$ to show that this is not correct.`, `Ali menulis $${bank[0]}$. Gantikan $x = ${x0}$ untuk menunjukkan bahawa ini tidak betul.`), a: T(`$${bank[2]}$: he ${bank[3].en}`, `$${bank[2]}$: dia ${bank[3].ms}`), sp: 's' };
    },
    /* LCD of numeric / monomial denominators */
    (r) => { const a = r.int(2, 9), b = r.int(2, 9); need(a !== b); const v = r.chance(); return v ? { q: T(`Write down the lowest common denominator of $${D(1, a)}$ and $${D(1, b)}$.`, `Tulis penyebut sepunya terendah bagi $${D(1, a)}$ dan $${D(1, b)}$.`), a: T(`${lcm2(a, b)}`), sp: 'xs' } : { q: T(`Write down the lowest common denominator of $${D(1, `${a}x`)}$ and $${D(1, `${b}x`)}$.`, `Tulis penyebut sepunya terendah bagi $${D(1, `${a}x`)}$ dan $${D(1, `${b}x`)}$.`), a: T(`$${lcm2(a, b)}x$`), sp: 'xs' }; },
    /* reciprocal / dividing */
    (r) => { const a = r.int(1, 7), b = r.int(1, 7), c = r.int(1, 7), d = r.int(1, 7), v = r.pick(['x', 'y', 'p']); need(a * d !== b * c && gcd(c, d) === 1 && gcd(a, b) === 1); return { q: T(`Write the reciprocal of $${D(`${coef(c)}${v}`, d)}$ and use it to work out $${D(`${coef(a)}${v}`, b)} \\div ${D(`${coef(c)}${v}`, d)}$.`, `Tulis salingan bagi $${D(`${coef(c)}${v}`, d)}$ dan gunakannya untuk menghitung $${D(`${coef(a)}${v}`, b)} \\div ${D(`${coef(c)}${v}`, d)}$.`), a: T(`Reciprocal $${D(d, `${coef(c)}${v}`)}$; answer $${frt(a * d, b * c)}$`, `Salingan $${D(d, `${coef(c)}${v}`)}$; jawapan $${frt(a * d, b * c)}$`), sp: 's' }; },
    /* MCQ simplest form of a monomial fraction */
    (r) => { const A = AF.canm(r), a = parseInt(A.tex.match(/dfrac\{(\d+)x/)[1], 10), b = parseInt(A.tex.match(/\{(\d+)x\}$/)[1], 10), o = mc(r, `$${A.ans}$`, [`$${mono(a, b, 'x^2')}$`, `$${mono(a * b, 1, 'x')}$`, `$${mono(b, a, 'x')}$`]); return { q: cat(T(`Which is $${A.tex}$ in its simplest form?<br>`, `Yang manakah $${A.tex}$ dalam bentuk termudahnya?<br>`), o.q), a: o.a, sp: 's' }; },
    /* remove common factor from a numerator */
    (r) => { const k = r.int(2, 6), a = r.int(1, 5), b = r.int(1, 6), m = r.int(2, 7); need(gcd(a, b) === 1 && k !== m); return { q: T(`Take out the common factor in the numerator and simplify $${D(`${k * a}x + ${k * b}`, k * m)}$.`, `Keluarkan faktor sepunya dalam pengangka dan ringkaskan $${D(`${k * a}x + ${k * b}`, k * m)}$.`), a: T(`$${D(`${lx(a, b)}`, m)}$`), sp: 's' }; },
  ];
  ge23.push(chainGen23(AFe, [2, 2, 3]), chainGen23(['like', 'brk', 'samex', 'samed', 'canm', 'canb'], [2, 3]), chainGen23(['mulm', 'divm', 'unl', 'canb'], [2, 3]));
  const gm23 = [
    /* LCD of binomial denominators */
    (r) => { const p = r.int(1, 8), q = r.int(1, 8), a = r.int(1, 5), b = r.int(1, 5), s = r.sign(); return { q: T(`Write down a common denominator for $${D(a, `x + ${p}`)}$ and $${D(b, `x ${s > 0 ? '+' : '-'} ${q}`)}$ and use it to write the two fractions with the same denominator.`, `Tulis satu penyebut sepunya bagi $${D(a, `x + ${p}`)}$ dan $${D(b, `x ${s > 0 ? '+' : '-'} ${q}`)}$ dan gunakannya untuk menulis kedua-dua pecahan dengan penyebut yang sama.`), a: T(`$(x + ${p})(x ${s > 0 ? '+' : '-'} ${q})$; $${D(`${coef(a)}(x ${s > 0 ? '+' : '-'} ${q})`, `(x + ${p})(x ${s > 0 ? '+' : '-'} ${q})`)}$ and $${D(`${coef(b)}(x + ${p})`, `(x + ${p})(x ${s > 0 ? '+' : '-'} ${q})`)}$`), sp: 'm' }; },
    /* wrong addition */
    (r) => { const a = r.int(1, 5), b = r.int(1, 5), x0 = r.int(2, 6), y0 = r.int(2, 6); need(x0 !== y0 && a * y0 + b * x0 !== 0); const lhs = Fr.add(Fr.make(a, x0), Fr.make(b, y0)), rhs = Fr.make(a + b, x0 + y0); need(!Fr.eq(lhs, rhs)); return { q: T(`Farid writes $${D(a, 'x')} + ${D(b, 'y')} = ${D(`${a} + ${b}`, 'x + y')}$. Test $x = ${x0}$, $y = ${y0}$ to show that he is wrong, and write the correct answer.`, `Farid menulis $${D(a, 'x')} + ${D(b, 'y')} = ${D(`${a} + ${b}`, 'x + y')}$. Uji $x = ${x0}$, $y = ${y0}$ untuk menunjukkan bahawa dia salah, dan tulis jawapan yang betul.`), a: T(`Left side $${Fr.tex(lhs)}$, right side $${Fr.tex(rhs)}$. Correct: $${D(`${coef(a)}y + ${coef(b)}x`, 'xy')}$`, `Belah kiri $${Fr.tex(lhs)}$, belah kanan $${Fr.tex(rhs)}$. Betul: $${D(`${coef(a)}y + ${coef(b)}x`, 'xy')}$`), sp: 'm' }; },
    /* journey time context */
    (r) => { const a = r.pick([40, 60, 80, 30, 50]), b = r.pick([20, 40, 60, 90, 100]); need(a !== b); const L = lcm2(a, b), A = L / a + L / b, g = gcd(A, L); const k = r.int(1, 3) * 120; return { q: T(`A car travels $x$ km at ${a} km/h and then another $x$ km at ${b} km/h. Write the total time taken, in hours, as a single fraction in its simplest form. Find the time when $x = ${k}$.`, `Sebuah kereta bergerak sejauh $x$ km pada ${a} km/j dan kemudian $x$ km lagi pada ${b} km/j. Tulis jumlah masa yang diambil, dalam jam, sebagai satu pecahan tunggal dalam bentuk termudah. Cari masa apabila $x = ${k}$.`), a: T(`$${D('x', a)} + ${D('x', b)} = ${mono(A, L, 'x')}$ hours; ${n(round((A * k) / L, 4))} hours`, `$${D('x', a)} + ${D('x', b)} = ${mono(A, L, 'x')}$ jam; ${n(round((A * k) / L, 4))} jam`), sp: 'm' }; },
    /* width from area */
    (r) => { const p = r.int(2, 9), x0 = r.int(p + 1, p + 8); return { q: T(`A rectangle has area $(x^2 - ${p * p})$ cm$^2$ and length $(x + ${p})$ cm. Write the width as a fraction, simplify it, and find the width when $x = ${x0}$.`, `Sebuah segi empat tepat mempunyai luas $(x^2 - ${p * p})$ cm$^2$ dan panjang $(x + ${p})$ cm. Tulis lebar sebagai pecahan, ringkaskannya, dan cari lebar apabila $x = ${x0}$.`), a: T(`$${D(`x^2 - ${p * p}`, `x + ${p}`)} = x - ${p}$ cm; ${x0 - p} cm`, `$${D(`x^2 - ${p * p}`, `x + ${p}`)} = x - ${p}$ cm; ${x0 - p} cm`), sp: 'm' }; },
    /* find the missing part */
    (r) => { const p = r.int(2, 9), q = r.int(1, 9), v = r.int(0, 1); return v === 0 ? { q: T(`Fill in the box: $${D(`x^2 - ${p * p}`, `x + ${p}`)} = x - \\square$.`, `Isikan petak itu: $${D(`x^2 - ${p * p}`, `x + ${p}`)} = x - \\square$.`), a: T(`$${p}$`), sp: 'xs' } : { q: T(`Fill in the box: $${D(X2(1, p + q, p * q), `x + ${p}`)} = x + \\square$.`, `Isikan petak itu: $${D(X2(1, p + q, p * q), `x + ${p}`)} = x + \\square$.`), a: T(`$${q}$`), sp: 'xs' }; },
    /* which can be simplified */
    (r) => {
      const p = r.int(2, 8), q = r.int(2, 8), items = r.shuffle([[D(`x + ${p}`, 'x'), false], [D(`${q}x`, 'x'), true], [D(`x^2 - ${p * p}`, `x + ${p}`), true], [D(`x^2 + ${q}`, `x + ${q}`), false]]);
      return { q: T(`Which of these fractions can be simplified by cancelling a common factor? ${items.map((x, i) => `(${'ABCD'[i]}) $${x[0]}$`).join(' ')}`, `Pecahan yang manakah boleh diringkaskan dengan membatalkan faktor sepunya? ${items.map((x, i) => `(${'ABCD'[i]}) $${x[0]}$`).join(' ')}`), a: T(items.map((x, i) => (x[1] ? 'ABCD'[i] : '')).filter(Boolean).join(' and ')), w: T('You may cancel only common factors, never terms joined by + or −', 'Hanya faktor sepunya boleh dibatalkan, bukan sebutan yang dihubungkan oleh + atau −'), sp: 's' };
    },
    /* MCQ for difference of squares fraction */
    (r) => { const A = AF.ds1(r), p = parseInt(A.tex.match(/- (\d+)\}/)[1], 10), pp = Math.sqrt(p), o = mc(r, `$${A.ans}$`, [`$x + ${pp}$`, `$x^2 - ${pp}$`, `$x - ${p}$`]); return { q: cat(T(`Simplify $${A.tex}$.<br>`, `Ringkaskan $${A.tex}$.<br>`), o.q), a: o.a, sp: 's' }; },
    /* explicit excluded values, including the divisor */
    (r) => { const p = r.int(1, 8), q = r.int(1, 8), s2 = r.int(1, 8); need(new Set([p, -q, s2]).size === 3); const vals = [...new Set([p, -q, -s2])]; return { q: T(`State all the values of $x$ that must be excluded in $${D(`x + ${s2}`, `x - ${p}`)} \\div ${D(`x - ${q}`, `x + ${s2}`)}$.`, `Nyatakan semua nilai $x$ yang mesti dikecualikan dalam $${D(`x + ${s2}`, `x - ${p}`)} \\div ${D(`x - ${q}`, `x + ${s2}`)}$.`), a: T(`$x \\neq ${p}$, $x \\neq ${-s2}$ and $x \\neq ${q}$ (the divisor cannot be 0 either)`, `$x \\neq ${p}$, $x \\neq ${-s2}$ dan $x \\neq ${q}$ (pembahagi juga tidak boleh 0)`), sp: 'm' }; },
    /* simplify then evaluate */
    (r) => { const A = AF[r.pick(['ds1', 'ds2', 'lin1', 'mulf', 'div2'])](r), t = t23(A, r).filter((x) => x && /value/.test(x.a.en)); need(t.length); return { q: T(`${t[0].q.en.replace('the expression', `$${A.tex}$`)}`, `${t[0].q.ms.replace('ungkapan itu', `$${A.tex}$`)}`), a: t[0].a, sp: 'm' }; },
  ];
  gm23.push(chainGen23(AFm, [2, 3]), chainGen23(AFm, [2, 3]), chainGen23(['ds1', 'ds2', 'ds3', 'lin1', 'div1', 'div2', 'mulf'], [3]));
  const ga23 = [
    /* cost sharing */
    (r) => { const P = r.pick([120, 240, 300, 600]), q = r.int(2, 4), k = r.int(1, 3) * 2; return { q: T(`A prize of RM${P} is shared equally among $x$ winners. If ${q} more winners are added, it is shared among $(x + ${q})$ winners. Write the difference in each person's share as a single fraction. Find the difference when $x = ${k + 2}$.`, `Hadiah sebanyak RM${P} dikongsi sama rata di kalangan $x$ orang pemenang. Jika ${q} orang pemenang lagi ditambah, ia dikongsi di kalangan $(x + ${q})$ orang pemenang. Tulis beza bahagian setiap orang sebagai satu pecahan tunggal. Cari bezanya apabila $x = ${k + 2}$.`), a: T(`$${D(P, 'x')} - ${D(P, `x + ${q}`)} = ${D(P * q, `x(x + ${q})`)}$; RM${n(round((P * q) / ((k + 2) * (k + 2 + q)), 2))}`, `$${D(P, 'x')} - ${D(P, `x + ${q}`)} = ${D(P * q, `x(x + ${q})`)}$; RM${n(round((P * q) / ((k + 2) * (k + 2 + q)), 2))}`), sp: 'l' }; },
    /* find k */
    (r) => { const p = r.int(1, 7), q = r.int(1, 8), v = r.int(0, 1); return v === 0 ? { q: T(`Given that $${D(`x^2 + kx + ${p * q}`, `x + ${p}`)}$ simplifies to $x + ${q}$, find the value of $k$.`, `Diberi bahawa $${D(`x^2 + kx + ${p * q}`, `x + ${p}`)}$ diringkaskan kepada $x + ${q}$, cari nilai $k$.`), a: T(`$k = ${p + q}$`), w: T(`$(x + ${p})(x + ${q}) = x^2 + ${p + q}x + ${p * q}$`, `$(x + ${p})(x + ${q}) = x^2 + ${p + q}x + ${p * q}$`), sp: 'm' } : { q: T(`The fraction $${D(`x^2 - k`, `x + ${p}`)}$ can be simplified by cancelling $(x + ${p})$. Find the value of $k$ and the simplified expression.`, `Pecahan $${D(`x^2 - k`, `x + ${p}`)}$ boleh diringkaskan dengan membatalkan $(x + ${p})$. Cari nilai $k$ dan ungkapan yang diringkaskan.`), a: T(`$k = ${p * p}$; $x - ${p}$`), sp: 'm' }; },
    /* show that */
    (r) => { const p = r.int(1, 8), v = r.int(0, 1); return v === 0 ? { q: T(`Show that $${D(1, `x + ${p}`)} - ${D(1, `x + ${p + 1}`)} = ${D(1, `(x + ${p})(x + ${p + 1})`)}$.`, `Tunjukkan bahawa $${D(1, `x + ${p}`)} - ${D(1, `x + ${p + 1}`)} = ${D(1, `(x + ${p})(x + ${p + 1})`)}$.`), a: T(`$${D(`(x + ${p + 1}) - (x + ${p})`, `(x + ${p})(x + ${p + 1})`)} = ${D(1, `(x + ${p})(x + ${p + 1})`)}$`), sp: 'm' } : { q: T(`Show that $${D('x', `x + ${p}`)} + ${D(p, `x + ${p}`)} = 1$ for every $x$ where the expression is defined.`, `Tunjukkan bahawa $${D('x', `x + ${p}`)} + ${D(p, `x + ${p}`)} = 1$ bagi setiap $x$ yang menjadikan ungkapan itu tertakrif.`), a: T(`$${D(`x + ${p}`, `x + ${p}`)} = 1$, for $x \\neq ${-p}$`, `$${D(`x + ${p}`, `x + ${p}`)} = 1$, bagi $x \\neq ${-p}$`), sp: 'm' }; },
    /* combined: expansion and factorisation */
    (r) => { const A = AF[r.pick(['ce', 'ce2', 'ce3'])](r); return { q: T(`Simplify $${A.tex}$. (Expand the numerator first, then factorise.)`, `Ringkaskan $${A.tex}$. (Kembangkan pengangka dahulu, kemudian faktorkan.)`), a: cat(T(`$${A.ans}$`), exStr(A)), sp: 'l' }; },
    /* denominators that need factorising: LCD */
    (r) => { const p = r.int(2, 8), a = r.int(1, 5); return { q: T(`(a) Factorise $x^2 - ${p * p}$. (b) Write down the lowest common denominator of $${D(a, `x - ${p}`)}$ and $${D(1, `x^2 - ${p * p}`)}$.`, `(a) Faktorkan $x^2 - ${p * p}$. (b) Tulis penyebut sepunya terendah bagi $${D(a, `x - ${p}`)}$ dan $${D(1, `x^2 - ${p * p}`)}$.`), a: T(`(a) $(x + ${p})(x - ${p})$ (b) $(x + ${p})(x - ${p})$, or $x^2 - ${p * p}$`), sp: 'm' }; },
    /* value check with two points */
    (r) => { const A = AF[r.pick(['ub', 'fd', 'ds4', 'dv3', 'mx'])](r), t = t23(A, r).filter((x) => x && /Check/.test(x.q.en)); need(t.length); return { q: T(`Simplify $${A.tex}$, then ${t[0].q.en.charAt(0).toLowerCase() + t[0].q.en.slice(1)}`, `Ringkaskan $${A.tex}$, kemudian ${t[0].q.ms.charAt(0).toLowerCase() + t[0].q.ms.slice(1)}`), a: T(`$${A.ans}$; ${t[0].a.en}`, `$${A.ans}$; ${t[0].a.ms}`), sp: 'l' }; },
  ];
  ga23.push(chainGen23(AFa, [2, 3]), chainGen23(AFa, [3]), chainGen23(AFa, [2, 3]), chainGen23(AFa, [2, 3]));
  SPM.extend('F2-2.3', { e: ge23, m: gm23, a: ga23 });

  /* ---- more F2-2.2 generators: matching, check-by-expanding, partial factorisation, shaded regions ---- */
  const match22 = (ks, sp) => (r) => {
    const Fs = []; while (Fs.length < 3) { const F = FF[r.pick(ks)](r); if (!Fs.some((g) => g.ans === F.ans || g.disp === F.disp)) Fs.push(F); }
    const ex = r.shuffle(Fs.map((F, i) => [F, i])), fa = r.shuffle(Fs.map((F, i) => [F, i]));
    return { q: T(`Match each expression (1 to 3) with its factorised form (A to C). ${ex.map((x, i) => `(${i + 1}) $${x[0].disp}$`).join(' ')} ${fa.map((x, i) => `(${'ABC'[i]}) $${x[0].ans}$`).join(' ')}`, `Padankan setiap ungkapan (1 hingga 3) dengan bentuk terfaktornya (A hingga C). ${ex.map((x, i) => `(${i + 1}) $${x[0].disp}$`).join(' ')} ${fa.map((x, i) => `(${'ABC'[i]}) $${x[0].ans}$`).join(' ')}`), a: T(ex.map((x, i) => `${i + 1}-${'ABC'[fa.findIndex((y) => y[1] === x[1])]}`).join(', ')), sp };
  };
  const gm22b = [
    match22(FFm, 's'),
    (r) => { const F = FF[r.pick(['tri1m', 'lead', 'dsqa', 'dsq'])](r), i = r.int(0, 1), fs = F.facs.map((f) => f.slice()); fs[i][1] = -fs[i][1]; let c = [F.k]; for (const f of fs) c = pmul(c, [f[1], f[0]]); need(c.some((v, j) => v !== F.c[j])); const who = r.name(), sh = fs.map((f) => fx(f[0], f[1])).join(''); return { q: T(`${who} says that $${F.disp} = ${sh}$. Expand the right side to check ${who}'s answer. If it is wrong, give the correct factorisation.`, `${who} berkata bahawa $${F.disp} = ${sh}$. Kembangkan belah kanan untuk menyemak jawapan ${who}. Jika salah, berikan pemfaktoran yang betul.`), a: T(`The right side expands to $${pt(c, 'x')}$, so it is wrong. Correct: $${F.ans}$`, `Belah kanan mengembang kepada $${pt(c, 'x')}$, jadi ia salah. Betul: $${F.ans}$`), sp: 's' }; },
    (r) => { const x0 = r.pick([51, 52, 53, 61, 71, 101]), k = r.int(2, 6); return { q: T(`Given that $x = ${x0}$, factorise $x^2 - ${k}x$ and hence find its value without a calculator.`, `Diberi bahawa $x = ${x0}$, faktorkan $x^2 - ${k}x$ dan seterusnya cari nilainya tanpa kalkulator.`), a: T(`$x(x - ${k}) = ${x0} \\times ${x0 - k} = ${x0 * (x0 - k)}$`), sp: 's' }; },
    (r) => { const F = FF.hcf1m(r), o = optsF(r, F); return { q: cat(T(`Which of these is the fully factorised form of $${F.disp}$?<br>`, `Yang manakah bentuk terfaktor sepenuhnya bagi $${F.disp}$?<br>`), o.q), a: o.a, sp: 's' }; },
  ];
  const ga22b = [
    match22(FFa, 'm'),
    (r) => { const k = r.int(2, 4), p = nzs(r, 5), q = nzs(r, 5), who = r.name(); need(p + q !== 0 && p !== q); const F = mkF(k, [[1, p], [1, q]]); return { q: T(`${who} factorises $${F.disp}$ as $(${k}x + ${k * p})(x ${q < 0 ? '-' : '+'} ${Math.abs(q)})$. Is this completely factorised? Explain and give the complete factorisation.`, `${who} memfaktorkan $${F.disp}$ sebagai $(${k}x + ${k * p})(x ${q < 0 ? '-' : '+'} ${Math.abs(q)})$. Adakah ini difaktorkan sepenuhnya? Terangkan dan berikan pemfaktoran yang lengkap.`), a: T(`No: $(${lx(k, k * p)})$ still has the common factor ${k}. Complete: $${F.ans}$`, `Tidak: $(${lx(k, k * p)})$ masih mempunyai faktor sepunya ${k}. Lengkap: $${F.ans}$`), sp: 'm' }; },
    (r) => { const p = r.int(1, 9), x0 = p + r.int(3, 12); return { q: T(`A square of side $x$ cm has a square of side ${p} cm cut from one corner. (a) Write the area of the remaining shape as an expression and factorise it. (b) Find the area when $x = ${x0}$ using your factorised form.`, `Sebuah segi empat sama bersisi $x$ cm dipotong satu segi empat sama bersisi ${p} cm dari satu sudutnya. (a) Tulis luas bentuk yang tinggal sebagai satu ungkapan dan faktorkannya. (b) Cari luas apabila $x = ${x0}$ menggunakan bentuk terfaktor anda.`), a: T(`(a) $x^2 - ${p * p} = (x + ${p})(x - ${p})$ (b) $${x0 + p} \\times ${x0 - p} = ${(x0 + p) * (x0 - p)}$ cm$^2$`), sp: 'm' }; },
    (r) => { const F = FF[r.pick(['lead', 'lead6'])](r), x0 = r.int(2, 6); need(F.facs.every((f) => f[0] > 0)); const k0 = F.facs[0][0] * x0 + F.facs[0][1], k1 = F.facs[1][0] * x0 + F.facs[1][1]; need(k0 > 0 && k1 > 0); return { q: T(`Factorise $${F.disp}$. Hence find its value when $x = ${x0}$ and check by direct substitution.`, `Faktorkan $${F.disp}$. Seterusnya cari nilainya apabila $x = ${x0}$ dan semak dengan penggantian terus.`), a: T(`$${F.ans}$; ${k0} × ${k1} = ${k0 * k1}; direct: ${pev(F.c, x0)}`, `$${F.ans}$; ${k0} × ${k1} = ${k0 * k1}; terus: ${pev(F.c, x0)}`), sp: 'm' }; },
  ];
  SPM.extend('F2-2.2', { m: gm22b, a: ga22b });

/*@@END*/
})();
