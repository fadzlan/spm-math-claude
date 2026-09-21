/* Form 1 – Chapters 1 to 5 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { L, n, fx, gm, rm, gt, par, sgn, gcd, lcm, isPrime, primeFactors, factors, round, Fr, poly, lin, parts, lines, table, need, retry, sum } = SPM;
  const S = SPM.svg;
  const T = (e, m) => ({ en: e, ms: m === undefined ? e : m });

  /* ============================================================ helpers */
  const frT = Fr.tex;
  const frP = Fr.texP;
  const fr = (a, b) => Fr.make(a, b);
  const ITEM = [
    { en: 'pens', ms: 'batang pen' }, { en: 'exercise books', ms: 'buku latihan' }, { en: 'erasers', ms: 'pemadam' },
    { en: 'rulers', ms: 'pembaris' }, { en: 'oranges', ms: 'biji oren' }, { en: 'cakes', ms: 'biji kek' },
  ];
  const cmpWord = { '<': T('less than', 'kurang daripada'), '>': T('greater than', 'lebih besar daripada') };
  const ascDesc = (asc) => (asc ? T('ascending order', 'tertib menaik') : T('descending order', 'tertib menurun'));

  /* =============================================================== 1 */
  /* ---- 1.1 Integers */
  function intOnLine(r, hard) {
    const lo = -r.int(4, 8);
    const hi = r.int(4, 8);
    const v = r.int(lo + 1, hi - 1);
    const pts = [{ v, label: 'P' }];
    return { lo, hi, v, pts };
  }
  const g11e = [
    (r) => {
      const { lo, hi, v, pts } = intOnLine(r);
      return { q: T('State the integer represented by point $P$ on the number line.', 'Nyatakan integer yang diwakili oleh titik $P$ pada garis nombor.'), fig: S.numberLine({ min: lo, max: hi, step: 1, points: pts }), a: T(`$${v}$`), sp: 'xs' };
    },
    (r) => {
      const t = r.int(2, 12);
      const ctx = r.pick([
        [T(`A temperature of ${t} degrees Celsius below zero`, `Suhu ${t} darjah Celsius di bawah sifar`), -t],
        [T(`A diver is ${t} metres below sea level`, `Seorang penyelam berada ${t} meter di bawah aras laut`), -t],
        [T(`A shop earns a profit of RM${t}`, `Sebuah kedai memperoleh keuntungan RM${t}`), t],
        [T(`A lift is at ${t} floors above the ground floor`, `Sebuah lif berada ${t} tingkat di atas tingkat bawah`), t],
        [T(`A loss of RM${t}`, `Kerugian RM${t}`), -t],
      ]);
      return { q: T(`Write the following as an integer: ${ctx[0].en}.`, `Tulis yang berikut sebagai integer: ${ctx[0].ms}.`), a: T(`$${ctx[1]}$`), sp: 'xs' };
    },
    (r) => {
      const pool = r.shuffle([-7, -3, 0, 5, 12, -10, 4, -1]).slice(0, 6);
      const extra = r.pick([[T('0.5', '0.5'), '0.5'], [T('\\tfrac12', ''), '\\tfrac{1}{2}'], [null, '2.5']]);
      const list = r.shuffle(pool.map((x) => '' + x).concat([r.pick(['0.5', '2.5', '\\tfrac{1}{2}', '-1.5', '\\tfrac{3}{4}'])]));
      const ints = list.filter((s) => /^-?\d+$/.test(s));
      return {
        q: T(`Which of the following numbers are integers? $${list.join(',\\ ')}$`, `Antara nombor berikut, yang manakah integer? $${list.join(',\\ ')}$`),
        a: T(`$${ints.join(',\\ ')}$`), sp: 'xs',
      };
    },
    (r) => {
      const [a, b] = r.distinct(2, -9, 9);
      const sym = a < b ? '<' : '>';
      return { q: T(`Fill in the blank with $<$ or $>$: $${par(a)}\\ \\square\\ ${par(b)}$`, `Isi tempat kosong dengan $<$ atau $>$: $${par(a)}\\ \\square\\ ${par(b)}$`), a: T(`$${par(a)} ${sym} ${par(b)}$`), sp: 'xs' };
    },
  ];
  const g11m = [
    (r) => {
      const k = r.int(4, 5);
      const v = r.distinct(k, -12, 12);
      if (!v.includes(0)) v[0] = 0;
      const asc = r.chance();
      const shown = r.shuffle(v).join(',\\ ');
      const ss = v.slice().sort((x, y) => (asc ? x - y : y - x));
      return {
        q: T(`Arrange the integers $${shown}$ in ${ascDesc(asc).en}.`, `Susun integer $${shown}$ mengikut ${ascDesc(asc).ms}.`),
        a: T(`$${ss.join(',\\ ')}$`), sp: 's',
      };
    },
    (r) => {
      const step = r.pick([2, 5, 10]);
      const lo = -step * r.int(3, 5);
      const hi = step * r.int(3, 5);
      const [p, q] = r.distinct(2, lo / step + 1, hi / step - 1).map((x) => x * step);
      need(p !== q);
      return {
        q: T('The number line below has equal intervals. State the integers represented by $P$ and $Q$.', 'Garis nombor di bawah mempunyai sela yang sama. Nyatakan integer yang diwakili oleh $P$ dan $Q$.'),
        fig: S.numberLine({ min: lo, max: hi, step, labels: [lo, 0, hi], points: [{ v: p, label: 'P' }, { v: q, label: 'Q' }], width: 400 }),
        a: T(`$P = ${p}$, $Q = ${q}$`), sp: 's',
      };
    },
    (r) => {
      const [a, b] = r.distinct(2, 2, 40);
      const na = -a, nb = -b;
      const x = r.pick([[na, nb], [a, nb]]);
      const bigger = Math.max(x[0], x[1]);
      return {
        q: T(`Which is greater, $${x[0]}$ or $${x[1]}$?`, `Yang manakah lebih besar, $${x[0]}$ atau $${x[1]}$?`),
        a: T(`$${bigger}$`), sp: 'xs',
      };
    },
  ];
  const g11a = [
    (r) => {
      const k = 5;
      const base = r.int(2, 9) * 10;
      const v = r.distinct(k, -base - 20, base).map((x) => x);
      const withClose = [-r.int(12, 60)];
      withClose.push(-withClose[0] - r.int(1, 9) * (r.chance() ? 1 : -1));
      const set = r.shuffle([...new Set([...withClose, 0, r.int(3, 30), -r.int(70, 120)])]);
      need(set.length >= 4);
      const asc = r.chance();
      const ss = set.slice().sort((x, y) => (asc ? x - y : y - x));
      return {
        q: T(`Arrange $${set.join(',\\ ')}$ in ${ascDesc(asc).en}. Give a reason for the position of the negative integers.`, `Susun $${set.join(',\\ ')}$ mengikut ${ascDesc(asc).ms}. Berikan sebab bagi kedudukan integer negatif.`),
        a: T(`$${ss.join(',\\ ')}$`), w: T('A negative integer further from zero is smaller.', 'Integer negatif yang lebih jauh daripada sifar adalah lebih kecil.'), sp: 'm',
      };
    },
    (r) => {
      // incompletely labelled number line, context thermometer
      const step = r.pick([3, 4, 5, 6, 8]);
      const a0 = -step * r.int(2, 4);
      const hi = step * r.int(2, 4);
      const [p, q] = r.distinct(2, a0 / step + 1, hi / step - 1).map((x) => x * step);
      need(p !== 0 && q !== 0);
      const cont = r.pick([[T('temperature (°C)', 'suhu (°C)'), T('temperatures', 'suhu')], [T('level (m) relative to sea level', 'aras (m) berbanding aras laut'), T('levels', 'aras')]]);
      return {
        q: T(`The number line shows ${cont[0].en}. The marks are equally spaced and only $${a0}$ and $${hi}$ are labelled. (a) State the values at $P$ and $Q$. (b) Which of the two is lower, and by how much?`,
          `Garis nombor menunjukkan ${cont[0].ms}. Tanda-tanda adalah sama jarak dan hanya $${a0}$ dan $${hi}$ dilabel. (a) Nyatakan nilai pada $P$ dan $Q$. (b) Yang manakah lebih rendah, dan berapakah bezanya?`),
        fig: S.numberLine({ min: a0, max: hi, step, labels: [a0, hi], points: [{ v: p, label: 'P' }, { v: q, label: 'Q' }], width: 400 }),
        a: T(`(a) $P = ${p}$, $Q = ${q}$ (b) ${p < q ? 'P' : 'Q'} is lower by $${Math.abs(p - q)}$`, `(a) $P = ${p}$, $Q = ${q}$ (b) ${p < q ? 'P' : 'Q'} lebih rendah sebanyak $${Math.abs(p - q)}$`),
        sp: 'm',
      };
    },
  ];

  /* ---- 1.2 Integer arithmetic */
  const LAWS = [
    { t: (a, b) => `${a} + ${b} = ${b} + ${a}`, n: T('Commutative law of addition', 'Hukum kalis tukar tertib bagi penambahan') },
    { t: (a, b) => `${a} \\times ${b} = ${b} \\times ${a}`, n: T('Commutative law of multiplication', 'Hukum kalis tukar tertib bagi pendaraban') },
    { t: (a, b, c) => `(${a} + ${b}) + ${c} = ${a} + (${b} + ${c})`, n: T('Associative law of addition', 'Hukum kalis sekutuan bagi penambahan') },
    { t: (a, b, c) => `(${a} \\times ${b}) \\times ${c} = ${a} \\times (${b} \\times ${c})`, n: T('Associative law of multiplication', 'Hukum kalis sekutuan bagi pendaraban') },
    { t: (a, b, c) => `${a} \\times (${b} + ${c}) = ${a} \\times ${b} + ${a} \\times ${c}`, n: T('Distributive law', 'Hukum kalis agihan') },
    { t: (a) => `${a} + 0 = ${a}`, n: T('Identity law of addition (additive identity)', 'Hukum identiti bagi penambahan') },
    { t: (a) => `${a} \\times 1 = ${a}`, n: T('Identity law of multiplication (multiplicative identity)', 'Hukum identiti bagi pendaraban') },
  ];
  const g12e = [
    (r) => {
      const a = r.int(-15, 15), b = r.int(-15, 15);
      need(a !== 0 && b !== 0);
      const op = r.pick(['+', '-']);
      const v = op === '+' ? a + b : a - b;
      return { q: T(`Calculate $${a} ${op} ${par(b)}$.`, `Hitung $${a} ${op} ${par(b)}$.`), a: T(`$${v}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.nz(-9, 9), b = r.nz(-9, 9);
      return { q: T(`Evaluate $${a} \\times ${par(b)}$.`, `Hitung $${a} \\times ${par(b)}$.`), a: T(`$${a * b}$`), sp: 'xs' };
    },
    (r) => {
      const b = r.nz(-9, 9), k = r.nz(-9, 9);
      return { q: T(`Evaluate $${b * k} \\div ${par(b)}$.`, `Hitung $${b * k} \\div ${par(b)}$.`), a: T(`$${k}$`), sp: 'xs' };
    },
    (r) => {
      const L1 = r.int(0, 3);
      const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9);
      const law = LAWS[L1 === 3 ? 3 : L1];
      const expr = law.t(a, b, c);
      return { q: T(`Name the arithmetic law shown by $${expr}$.`, `Namakan hukum aritmetik yang ditunjukkan oleh $${expr}$.`), a: law.n, sp: 'xs' };
    },
  ];
  const g12m = [
    (r) => {
      const a = r.nz(-9, 9), b = r.nz(-9, 9), c = r.nz(-9, 9);
      const forms = [
        [`${a} + ${par(b)} \\times ${par(c)}`, a + b * c],
        [`${a} - ${par(b)} \\times ${par(c)}`, a - b * c],
        [`(${a} + ${par(b)}) \\times ${par(c)}`, (a + b) * c],
        [`(${a} - ${par(b)}) \\times ${par(c)}`, (a - b) * c],
      ];
      const f = r.pick(forms);
      return { q: T(`Calculate $${f[0]}$.`, `Hitung $${f[0]}$.`), a: T(`$${f[1]}$`), sp: 's' };
    },
    (r) => {
      const c = r.nz(-6, 6), k = r.nz(-8, 8), a = r.nz(-20, 20);
      const f = r.pick([
        [`${a} + ${c * k} \\div ${par(c)}`, a + k],
        [`${a} - ${c * k} \\div ${par(c)}`, a - k],
      ]);
      return { q: T(`Evaluate $${f[0]}$.`, `Hitung $${f[0]}$.`), a: T(`$${f[1]}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(6, 30), b = r.int(3, 9), c = r.int(3, 9);
      const A = r.pick([13, 17, 19, 23, 27, 42, 25, 18]);
      const K = r.pick([98, 99, 101, 102, 48, 52, 97, 103]);
      return {
        q: T(`Use the distributive law to calculate $${A} \\times ${K}$ efficiently.`, `Gunakan hukum kalis agihan untuk menghitung $${A} \\times ${K}$ dengan cekap.`),
        a: T(`$${A * K}$`), w: T(`$${A} \\times ${K} = ${A} \\times (${K > 75 ? K < 100 ? '100 - ' + (100 - K) : K > 100 ? '100 + ' + (K - 100) : K : '50 ' + (K > 50 ? '+ ' + (K - 50) : '- ' + (50 - K))}) $`), sp: 's',
      };
    },
    (r) => {
      const t0 = r.int(-8, 8), d1 = r.int(4, 15), d2 = r.int(3, 12);
      const cont = r.pick(['t', 'e']);
      const t1 = t0 - d1, t2 = t1 + d2;
      return cont === 't'
        ? { q: T(`At midnight the temperature in Cameron Highlands was $${t0}^\\circ$C. It dropped by $${d1}^\\circ$C by 3 a.m. and then rose by $${d2}^\\circ$C by 8 a.m. What was the temperature at 8 a.m.?`, `Pada tengah malam, suhu di Cameron Highlands ialah $${t0}^\\circ$C. Suhu itu turun sebanyak $${d1}^\\circ$C pada pukul 3 pagi dan kemudian naik sebanyak $${d2}^\\circ$C pada pukul 8 pagi. Apakah suhu pada pukul 8 pagi?`), a: T(`$${t2}^\\circ$C`), w: T(`$${t0} - ${d1} + ${d2} = ${t2}$`), sp: 's' }
        : { q: T(`A submarine is at ${t0} m relative to sea level. It dives ${d1} m and then rises ${d2} m. State its final position relative to sea level.`, `Sebuah kapal selam berada pada ${t0} m berbanding aras laut. Ia menyelam ${d1} m dan kemudian naik ${d2} m. Nyatakan kedudukan akhirnya berbanding aras laut.`), a: T(`$${t2}$ m`), w: T(`$${t0} - ${d1} + ${d2} = ${t2}$`), sp: 's' };
    },
  ];
  const g12a = [
    (r) => {
      const a = r.nz(-9, 9), b = r.int(2, 9), c = r.nz(-9, 9), d = r.nz(-6, 6);
      const m = r.nz(-5, 5);
      const inner = a - b * c;
      // [a - b*c] ...
      const f = r.pick([
        [`${a} \\times [${b} - (${c} + ${d})] `, a * (b - (c + d))],
        [`-${b} \\times [${c} - ${par(a)}] + ${par(d)}`, -b * (c - a) + d],
        [`[${a} - (${b} - ${par(c)})] \\times ${par(d)}`, (a - (b - c)) * d],
      ]);
      return { q: T(`Evaluate $${f[0]}$.`, `Hitung $${f[0]}$.`), a: T(`$${f[1]}$`), sp: 'm' };
    },
    (r) => {
      const a = r.nz(-8, 8), x = r.nz(-9, 9), b = r.nz(-9, 9);
      const v = a * x + b;
      return { q: T(`Find the value of $\\square$ if $${a} \\times \\square ${sgn(b)} = ${v}$.`, `Cari nilai $\\square$ jika $${a} \\times \\square ${sgn(b)} = ${v}$.`), a: T(`$${x}$`), w: T(`$${a}\\times\\square = ${v - b}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(12, 60), b = r.int(2, 9);
      const c = r.nz(-9, 9);
      const k = r.int(2, 6);
      return {
        q: T(`Using a suitable arithmetic law, calculate $${a} \\times ${par(-b)} + ${a} \\times ${par(-(10 - b))}$ without a calculator. State the law used.`, `Dengan menggunakan hukum aritmetik yang sesuai, hitung $${a} \\times ${par(-b)} + ${a} \\times ${par(-(10 - b))}$ tanpa kalkulator. Nyatakan hukum yang digunakan.`),
        a: T(`$${-a * 10}$ — distributive law`, `$${-a * 10}$ — hukum kalis agihan`), w: T(`$${a}\\times[(-${b}) + (-${10 - b})] = ${a}\\times(-10)$`), sp: 'm',
      };
    },
  ];

  /* ---- fractions */
  function fracRand(r, maxD, allowNeg, proper) {
    const d = r.int(2, maxD);
    let nu = r.int(1, proper ? d - 1 : d * 2);
    need(gcd(nu, d) === 1 || r.chance(0.2));
    let f = fr(nu, d);
    if (allowNeg && r.chance(0.5)) f = Fr.neg(f);
    return f;
  }
  const g13e = [
    (r) => {
      const d = r.int(3, 11);
      const a = r.int(1, d - 1), b = r.int(1, d - 1);
      const s = r.chance();
      const A = s ? Fr.neg(fr(a, d)) : fr(a, d);
      const B = Fr.neg(fr(b, d));
      const op = r.pick(['+', '-']);
      const v = op === '+' ? Fr.add(A, B) : Fr.sub(A, B);
      return { q: T(`Calculate $${frT(A)} ${op} ${frP(B)}$. Give the answer in its simplest form.`, `Hitung $${frT(A)} ${op} ${frP(B)}$. Berikan jawapan dalam bentuk termudah.`), a: T(`$${frT(v)}$`), sp: 's' };
    },
    (r) => {
      const d = r.pick([4, 5, 6, 8]);
      const k = r.int(-2 * d + 1, 2 * d - 1);
      need(k % d !== 0);
      const F = fr(k, d);
      const min = -2, max = 2;
      const lab = (v) => {
        const f = fr(Math.round(v * d), d);
        return f.d === 1 ? String(f.n) : { n: f.n, d: f.d };
      };
      const step = 1 / d;
      return {
        q: T(`State the fraction represented by point $P$ on the number line.`, `Nyatakan pecahan yang diwakili oleh titik $P$ pada garis nombor.`),
        fig: S.numberLine({ min, max, step, labels: (v) => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : null), points: [{ v: k / d, label: 'P' }], width: 420 }),
        a: T(`$${Fr.tex(F)}$`), sp: 'xs',
      };
    },
    (r) => {
      const d = r.int(4, 12);
      const [a, b] = r.distinct(2, 1, d - 1);
      const A = Fr.neg(fr(a, d)), B = Fr.neg(fr(b, d));
      const sym = Fr.cmp(A, B) < 0 ? '<' : '>';
      return { q: T(`Fill in the blank with $<$ or $>$: $${frT(A)}\\ \\square\\ ${frT(B)}$`, `Isi tempat kosong dengan $<$ atau $>$: $${frT(A)}\\ \\square\\ ${frT(B)}$`), a: T(`$${frT(A)} ${sym} ${frT(B)}$`), sp: 'xs' };
    },
    (r) => {
      const d = r.int(3, 9);
      const w = r.int(1, 3);
      const nu = r.int(1, d - 1);
      const F = fr(w * d + nu, d);
      const toMixed = r.chance();
      return toMixed
        ? { q: T(`Express $\\dfrac{${w * d + nu}}{${d}}$ as a mixed number.`, `Ungkapkan $\\dfrac{${w * d + nu}}{${d}}$ sebagai nombor bercampur.`), a: T(`$${w}\\dfrac{${nu}}{${d}}$`), sp: 'xs' }
        : { q: T(`Express $${w}\\dfrac{${nu}}{${d}}$ as an improper fraction.`, `Ungkapkan $${w}\\dfrac{${nu}}{${d}}$ sebagai pecahan tak wajar.`), a: T(`$\\dfrac{${w * d + nu}}{${d}}$`), sp: 'xs' };
    },
  ];
  const g13m = [
    (r) => {
      const A = fracRand(r, 9, true, true), B = fracRand(r, 9, true, true);
      need(A.d !== B.d);
      const op = r.pick(['+', '-', '\\times', '\\div']);
      const v = op === '+' ? Fr.add(A, B) : op === '-' ? Fr.sub(A, B) : op === '\\times' ? Fr.mul(A, B) : Fr.div(A, B);
      return { q: T(`Calculate $${frT(A)} ${op} ${frP(B)}$.`, `Hitung $${frT(A)} ${op} ${frP(B)}$.`), a: T(`$${Fr.mixed(v)}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(3, 4);
      let vals;
      do {
        vals = [];
        while (vals.length < k) {
          const f = fracRand(r, 8, true, true);
          if (!vals.some((x) => Fr.eq(x, f))) vals.push(f);
        }
      } while (false);
      const asc = r.chance();
      const s = vals.slice().sort((x, y) => (asc ? Fr.cmp(x, y) : Fr.cmp(y, x)));
      return { q: T(`Arrange $${vals.map(frT).join(',\\ ')}$ in ${ascDesc(asc).en}.`, `Susun $${vals.map(frT).join(',\\ ')}$ mengikut ${ascDesc(asc).ms}.`), a: T(`$${s.map(frT).join(',\\ ')}$`), sp: 's' };
    },
    (r) => {
      const w1 = r.int(1, 3), w2 = r.int(1, 3);
      const A = fr(w1 * 4 + 1, 4), B = fr(w2 * 3 + 2, 3);
      const op = r.pick(['+', '-']);
      const a1 = fr(r.int(1, 3), r.pick([2, 3, 4])), b1 = fr(r.int(1, 4), r.pick([3, 5, 6]));
      const X = Fr.add(fr(w1, 1), a1), Y = Fr.add(fr(w2, 1), b1);
      const v = op === '+' ? Fr.add(X, Y) : Fr.sub(X, Y);
      return { q: T(`Calculate $${Fr.mixed(X)} ${op} ${Fr.mixed(Y)}$.`, `Hitung $${Fr.mixed(X)} ${op} ${Fr.mixed(Y)}$.`), a: T(`$${Fr.mixed(v)}$`), sp: 's' };
    },
  ];
  const g13a = [
    (r) => {
      const A = fracRand(r, 6, true, true), B = fracRand(r, 6, true, true), C = fracRand(r, 6, true, true);
      const f = r.pick([
        [`(${frT(A)} + ${frP(B)}) \\div ${frP(C)}`, () => Fr.div(Fr.add(A, B), C)],
        [`${frT(A)} \\times ${frP(B)} - ${frP(C)}`, () => Fr.sub(Fr.mul(A, B), C)],
        [`${frT(A)} - ${frP(B)} \\div ${frP(C)}`, () => Fr.sub(A, Fr.div(B, C))],
        [`(${frT(A)} - ${frP(B)}) \\times ${frP(C)}`, () => Fr.mul(Fr.sub(A, B), C)],
      ]);
      need(C.n !== 0);
      const v = f[1]();
      need(Math.abs(v.n) < 60 && v.d < 200);
      return { q: T(`Evaluate $${f[0]}$. Give your answer in the simplest form.`, `Hitung $${f[0]}$. Berikan jawapan dalam bentuk termudah.`), a: T(`$${Fr.mixed(v)}$`), sp: 'm' };
    },
    (r) => {
      const total = r.int(2, 6) * 12;
      const f1 = fr(1, r.pick([3, 4])), f2 = fr(1, r.pick([2, 6]));
      const used = Fr.add(f1, f2);
      need(Fr.val(used) < 1);
      const rest = Fr.sub(fr(1, 1), used);
      const ans = Fr.mul(rest, fr(total, 1));
      need(ans.d === 1);
      const [p] = r.pair();
      return {
        q: T(`${p} had RM${total}. ${p} spent $${frT(f1)}$ of it on food and $${frT(f2)}$ of it on transport. How much money is left?`, `${p} mempunyai RM${total}. ${p} membelanjakan $${frT(f1)}$ daripadanya untuk makanan dan $${frT(f2)}$ untuk pengangkutan. Berapakah wang yang tinggal?`),
        a: T(`RM${ans.n}`), w: T(`$1 - ${frT(f1)} - ${frT(f2)} = ${frT(rest)}$; $${frT(rest)} \\times ${total} = ${ans.n}$`), sp: 'm',
      };
    },
    (r) => {
      const x = fr(-r.int(1, 5), r.pick([2, 3, 4, 5])), y = fr(-r.int(1, 5), r.pick([6, 7, 8]));
      const mid = fr(-r.int(1, 3), r.pick([2, 3]));
      const A = fracRand(r, 5, true, true);
      const p = fr(-1, 2), q = fr(-1, 3);
      const nn = r.pick([[fr(-2, 3), fr(-1, 2), fr(-3, 4)], [fr(-5, 6), fr(-3, 4), fr(-7, 8)], [fr(-1, 4), fr(-2, 5), fr(-3, 10)]]);
      const list = r.shuffle(nn);
      return {
        q: T(`Arrange $${list.map(frT).join(',\\ ')}$ in ascending order. Show how you compare them using equivalent fractions.`, `Susun $${list.map(frT).join(',\\ ')}$ mengikut tertib menaik. Tunjukkan cara anda membandingkannya menggunakan pecahan setara.`),
        a: T(`$${list.slice().sort(Fr.cmp).map(frT).join(',\\ ')}$`), sp: 'm',
      };
    },
  ];

  /* ---- decimals */
  const dec = (h, dp) => n(round(h / Math.pow(10, dp), dp));
  const decP = (v) => (v < 0 ? '(' + n(v) + ')' : n(v));
  const g14e = [
    (r) => {
      const dp = r.pick([1, 2]);
      const a = r.nz(-90, 90) / Math.pow(10, dp), b = r.nz(-90, 90) / Math.pow(10, dp);
      const op = r.pick(['+', '-']);
      const v = round(op === '+' ? a + b : a - b, dp);
      return { q: T(`Calculate $${n(a)} ${op} ${decP(b)}$.`, `Hitung $${n(a)} ${op} ${decP(b)}$.`), a: T(`$${n(v)}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.nz(-9, 9) / 10, b = r.nz(-9, 9);
      return { q: T(`Calculate $${n(a)} \\times ${par(b)}$.`, `Hitung $${n(a)} \\times ${par(b)}$.`), a: T(`$${n(round(a * b, 1))}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(-9, 9), lo = -r.int(2, 4), hi = r.int(2, 4);
      const v = r.int(lo * 10 + 1, hi * 10 - 1);
      need(v % 10 !== 0);
      return {
        q: T('State the decimal represented by $P$ on the number line.', 'Nyatakan perpuluhan yang diwakili oleh $P$ pada garis nombor.'),
        fig: S.numberLine({ min: lo, max: hi, step: 0.1, labels: (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : null), points: [{ v: v / 10, label: 'P' }], width: 460 }),
        a: T(`$${n(v / 10)}$`), sp: 'xs',
      };
    },
    (r) => {
      const a = r.nz(-90, 90) / 100, b = r.nz(-90, 90) / 100;
      need(a !== b);
      const s = a < b ? '<' : '>';
      return { q: T(`Fill in the blank with $<$ or $>$: $${n(a)}\\ \\square\\ ${n(b)}$`, `Isi tempat kosong dengan $<$ atau $>$: $${n(a)}\\ \\square\\ ${n(b)}$`), a: T(`$${n(a)} ${s} ${n(b)}$`), sp: 'xs' };
    },
  ];
  const g14m = [
    (r) => {
      const a = r.nz(-500, 500) / 100, b = r.nz(-90, 90) / 10;
      const op = r.pick(['+', '-']);
      const v = round(op === '+' ? a + b : a - b, 2);
      return { q: T(`Calculate $${n(a)} ${op} ${decP(b)}$.`, `Hitung $${n(a)} ${op} ${decP(b)}$.`), a: T(`$${n(v)}$`), sp: 's' };
    },
    (r) => {
      const a = r.nz(-90, 90) / 10, b = r.nz(-90, 90) / 10;
      const op = r.pick(['\\times', '\\div']);
      if (op === '\\div') {
        const q = r.nz(-40, 40) / 10, dvs = r.nz(-9, 9) / 10;
        return { q: T(`Calculate $${n(round(q * dvs, 2))} \\div ${decP(dvs)}$.`, `Hitung $${n(round(q * dvs, 2))} \\div ${decP(dvs)}$.`), a: T(`$${n(q)}$`), sp: 's' };
      }
      return { q: T(`Calculate $${n(a)} \\times ${decP(b)}$.`, `Hitung $${n(a)} \\times ${decP(b)}$.`), a: T(`$${n(round(a * b, 2))}$`), sp: 's' };
    },
    (r) => {
      const vals = r.distinct(4, -300, 300).map((x) => round(x / r.pick([10, 100]), 2));
      need(new Set(vals).size === 4);
      const asc = r.chance();
      return { q: T(`Arrange $${vals.join(',\\ ')}$ in ${ascDesc(asc).en}.`, `Susun $${vals.join(',\\ ')}$ mengikut ${ascDesc(asc).ms}.`), a: T(`$${vals.slice().sort((x, y) => (asc ? x - y : y - x)).join(',\\ ')}$`), sp: 's' };
    },
    (r) => {
      const a = r.nz(-90, 90) / 10, b = r.nz(-9, 9) / 10, c = r.nz(-9, 9);
      const v = round(a + b * c, 2);
      return { q: T(`Evaluate $${n(a)} + ${decP(b)} \\times ${par(c)}$.`, `Hitung $${n(a)} + ${decP(b)} \\times ${par(c)}$.`), a: T(`$${n(v)}$`), sp: 's' };
    },
  ];
  const g14a = [
    (r) => {
      const a = r.nz(-90, 90) / 10, b = r.nz(-90, 90) / 10, c = r.nz(-9, 9) / 10;
      const f = r.pick([
        [`(${n(a)} + ${decP(b)}) \\times ${decP(c)}`, (a + b) * c],
        [`${n(a)} \\times ${decP(b)} - ${decP(c)}`, a * b - c],
        [`(${n(a)} - ${decP(b)}) \\div ${decP(c)}`, (a - b) / c],
      ]);
      const v = round(f[1], 4);
      need(Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-7);
      return { q: T(`Evaluate $${f[0]}$.`, `Hitung $${f[0]}$.`), a: T(`$${n(v)}$`), sp: 'm' };
    },
    (r) => {
      const bal = r.int(20, 80) + r.int(0, 9) / 10;
      const spend1 = r.int(15, 60) + r.pick([0, 0.5, 0.9]);
      const spend2 = r.int(30, 90) + r.pick([0.2, 0.5, 0.8]);
      const dep = r.int(10, 40);
      const v = round(bal - spend1 - spend2 + dep, 2);
      need(v < 0);
      const [p] = r.pair();
      return {
        q: T(`${p}'s bank account has a balance of ${rm(bal, 2)}. ${p} pays ${rm(spend1, 2)} for a book and ${rm(spend2, 2)} for a school bag, and then deposits ${rm(dep, 2)}. Find the new balance. Give your answer as a signed decimal in RM and explain what a negative balance means.`,
          `Baki akaun bank ${p} ialah ${rm(bal, 2)}. ${p} membayar ${rm(spend1, 2)} untuk sebuah buku dan ${rm(spend2, 2)} untuk sebuah beg sekolah, kemudian mendeposit ${rm(dep, 2)}. Cari baki baharu. Berikan jawapan sebagai perpuluhan bertanda dalam RM dan terangkan maksud baki negatif.`),
        a: T(`$${n(v)}$ (overdrawn by ${rm(-v, 2)})`, `$${n(v)}$ (terlebih keluar ${rm(-v, 2)})`), w: T(`$${n(bal)} - ${n(spend1)} - ${n(spend2)} + ${dep} = ${n(v)}$`), sp: 'm',
      };
    },
  ];

  /* ---- rational numbers */
  const g15e = [
    (r) => {
      const pool = [
        ['-4', '\\dfrac{-4}{1}'], ['7', '\\dfrac{7}{1}'], ['\\dfrac{3}{5}', '\\dfrac{3}{5}'], ['-\\dfrac{2}{7}', '\\dfrac{-2}{7}'],
        ['0.25', '\\dfrac{1}{4}'], ['-1.5', '\\dfrac{-3}{2}'], ['0.6', '\\dfrac{3}{5}'], ['-0.75', '\\dfrac{-3}{4}'], ['12', '\\dfrac{12}{1}'], ['0.5', '\\dfrac{1}{2}'],
      ];
      const pick = r.sample(pool, 4);
      const list = pick.map((p) => p[0]).join(',\\ ');
      return {
        q: T(`Write each of the following in the form $\\dfrac{a}{b}$, where $a$ and $b$ are integers and $b \\neq 0$: $${list}$`, `Tulis setiap yang berikut dalam bentuk $\\dfrac{a}{b}$, dengan keadaan $a$ dan $b$ ialah integer dan $b \\neq 0$: $${list}$`),
        a: T(pick.map((p) => `$${p[0]} = ${p[1]}$`).join('; ')), sp: 's',
      };
    },
    (r) => {
      const a = r.int(-9, 9);
      const vals = [`${a}`, `\\dfrac{${r.int(1, 5)}}{${r.int(6, 9)}}`, `${r.int(1, 9) / 10}`, `-${r.int(1, 9) / 4}`];
      return {
        q: T(`True or false: every integer is a rational number. Give an example.`, `Benar atau palsu: setiap integer ialah nombor nisbah. Berikan satu contoh.`),
        a: T(`True. For example, $${a} = \\dfrac{${a}}{1}$.`, `Benar. Contohnya, $${a} = \\dfrac{${a}}{1}$.`), sp: 'xs',
      };
    },
    (r) => {
      const a = r.pick([0.5, 0.25, 0.75, 0.2, 0.4, 0.6, 0.8, 0.125]);
      const f = fr(Math.round(a * 1000), 1000);
      const s = r.chance() ? -1 : 1;
      const F = s < 0 ? Fr.neg(f) : f;
      return { q: T(`Express $${n(s * a)}$ as a fraction in its simplest form.`, `Ungkapkan $${n(s * a)}$ sebagai pecahan dalam bentuk termudah.`), a: T(`$${frT(F)}$`), sp: 'xs' };
    },
  ];
  const g15m = [
    (r) => {
      const items = r.sample([
        [-0.75, '-0.75'], [-1 / 2, '-\\dfrac{1}{2}'], [2 / 3, '\\dfrac{2}{3}'], [0.6, '0.6'], [-1, '-1'], [5 / 4, '\\dfrac{5}{4}'], [-0.3, '-0.3'], [3 / 8, '\\dfrac{3}{8}'], [1.2, '1.2'], [-5 / 6, '-\\dfrac{5}{6}'],
      ], r.int(4, 5));
      const asc = r.chance();
      const s = items.slice().sort((x, y) => (asc ? x[0] - y[0] : y[0] - x[0]));
      return { q: T(`Arrange $${items.map((x) => x[1]).join(',\\ ')}$ in ${ascDesc(asc).en}.`, `Susun $${items.map((x) => x[1]).join(',\\ ')}$ mengikut ${ascDesc(asc).ms}.`), a: T(`$${s.map((x) => x[1]).join(',\\ ')}$`), sp: 's' };
    },
    (r) => {
      const a = fr(r.nz(-5, 5), r.pick([2, 4, 5])), b = r.nz(-9, 9) / 10, c = r.nz(-3, 3);
      const v = Fr.mul(Fr.add(a, fr(Math.round(b * 10), 10)), fr(c, 1));
      return { q: T(`Evaluate $(${frT(a)} + ${decP(b)}) \\times ${par(c)}$. Give your answer as a fraction in its simplest form.`, `Hitung $(${frT(a)} + ${decP(b)}) \\times ${par(c)}$. Berikan jawapan sebagai pecahan dalam bentuk termudah.`), a: T(`$${Fr.mixed(v)}$`), sp: 'm' };
    },
  ];
  const g15a = [
    (r) => {
      const [lo, hi] = r.pick([[fr(-1, 3), fr(-1, 4)], [fr(1, 5), fr(1, 4)], [fr(-2, 3), fr(-3, 5)], [fr(-1, 2), fr(-2, 5)]]);
      const mid = Fr.div(Fr.add(lo, hi), fr(2, 1));
      return {
        q: T(`Find a rational number between $${frT(lo)}$ and $${frT(hi)}$. Show that your answer lies between them.`, `Cari satu nombor nisbah di antara $${frT(lo)}$ dan $${frT(hi)}$. Tunjukkan bahawa jawapan anda terletak di antara kedua-duanya.`),
        a: T(`For example $${frT(mid)}$ (the mean of the two numbers)`, `Contohnya $${frT(mid)}$ (min bagi kedua-dua nombor)`), sp: 'm',
      };
    },
    (r) => {
      const total = r.int(2, 5) * 20;
      const spend = fr(r.pick([1, 3]), r.pick([4, 5]));
      const dec1 = r.pick([0.2, 0.25, 0.4]);
      const ans = total * (1 - Fr.val(spend)) - total * dec1;
      need(Math.abs(ans - Math.round(ans)) < 1e-9 && ans > 0);
      const [p] = r.pair();
      return {
        q: T(`${p} received an allowance of RM${total}. ${p} spent $${frT(spend)}$ of the allowance and saved ${n(dec1 * 100)}% ... Actually, ${p} then gave $${n(dec1)}$ of the original allowance to a friend. How much money does ${p} have left?`.replace(` and saved ${n(dec1 * 100)}% ... Actually, ${p} then`, ' and then'), `${p} menerima elaun RM${total}. ${p} membelanjakan $${frT(spend)}$ daripada elaun itu dan kemudian memberikan $${n(dec1)}$ daripada elaun asal kepada seorang kawan. Berapakah wang yang tinggal pada ${p}?`),
        a: T(`RM${n(ans)}`), w: T(`$${total} - ${total}\\times${frT(spend)} - ${total}\\times ${n(dec1)} = ${n(ans)}$`), sp: 'm',
      };
    },
  ];
  const g15Ee = [
    (r) => {
      const d = r.int(1, 8);
      const F = fr(d, 9);
      return { q: T(`Express $0.\\overline{${d}}$ as a fraction in its simplest form.`, `Ungkapkan $0.\\overline{${d}}$ sebagai pecahan dalam bentuk termudah.`), a: T(`$${frT(F)}$`), w: T(`Let $x = 0.${d}${d}${d}\\ldots$; then $10x - x = ${d}$, so $x = \\dfrac{${d}}{9}$`, `Katakan $x = 0.${d}${d}${d}\\ldots$; maka $10x - x = ${d}$, jadi $x = \\dfrac{${d}}{9}$`), sp: 's' };
    },
  ];
  const g15Em = [
    (r) => {
      const w = r.int(50, 150), months = r.int(3, 6);
      const p = r.name();
      const price = r.pick([120, 150, 200, 180]);
      const total = w * months;
      const cost = total - r.int(10, 60);
      return {
        q: T(`${p} saves RM${w} each month. After ${months} months ${p} buys a gift for ${rm(cost)}. How much of the savings is left?`, `${p} menyimpan RM${w} setiap bulan. Selepas ${months} bulan, ${p} membeli sebuah hadiah berharga ${rm(cost)}. Berapakah simpanan yang tinggal?`),
        a: T(`${rm(total - cost)}`), w: T(`$${w} \\times ${months} - ${cost} = ${total - cost}$`), sp: 's',
      };
    },
    (r) => {
      const d = r.int(1, 8);
      const e = r.pick([3, 6, 7, 8]);
      const F = fr(d, 9);
      return { q: T(`Express $0.\\overline{${d}}$ as a fraction in its simplest form, and hence find $0.\\overline{${d}} \\times 9$.`, `Ungkapkan $0.\\overline{${d}}$ sebagai pecahan dalam bentuk termudah, dan seterusnya cari $0.\\overline{${d}} \\times 9$.`), a: T(`$${frT(F)}$; $${d}$`), sp: 's' };
    },
  ];
  const g15Ea = [
    (r) => {
      const a = r.int(1, 9), b = r.int(0, 9);
      need(a !== b);
      const num = 10 * a + b;
      const F = fr(num, 99);
      return { q: T(`Express $0.\\overline{${a}${b}}$ as a fraction in its simplest form.`, `Ungkapkan $0.\\overline{${a}${b}}$ sebagai pecahan dalam bentuk termudah.`), a: T(`$${frT(F)}$`), w: T(`Let $x = 0.${a}${b}${a}${b}\\ldots$; then $100x - x = ${num}$, so $x = \\dfrac{${num}}{99}$`, `Katakan $x = 0.${a}${b}${a}${b}\\ldots$; maka $100x - x = ${num}$, jadi $x = \\dfrac{${num}}{99}$`), sp: 'm' };
    },
    (r) => {
      const w = r.int(60, 140), months = r.int(4, 8);
      const p = r.name();
      const spend = r.pick([fr(1, 4), fr(1, 3), fr(2, 5)]);
      const total = w * months;
      const cost = Fr.mul(spend, fr(total, 1));
      need(cost.d === 1);
      return {
        q: T(`${p} saves RM${w} each month for ${months} months, then spends $${frT(spend)}$ of the savings on a school trip. How much is left?`, `${p} menyimpan RM${w} setiap bulan selama ${months} bulan, kemudian membelanjakan $${frT(spend)}$ daripada simpanan itu untuk lawatan sekolah. Berapakah yang tinggal?`),
        a: T(`RM${total - cost.n}`), w: T(`$${total} - ${frT(spend)} \\times ${total}$`), sp: 'm',
      };
    },
  ];

  SPM.addChapter(1, 1, T('Rational Numbers', 'Nombor Nisbah'), [
    { id: '1.1', en: 'Integers', ms: 'Integer', gen: { e: g11e, m: g11m, a: g11a } },
    { id: '1.2', en: 'Basic arithmetic operations involving integers', ms: 'Operasi asas aritmetik yang melibatkan integer', gen: { e: g12e, m: g12m, a: g12a } },
    { id: '1.3', en: 'Positive and negative fractions', ms: 'Pecahan positif dan negatif', gen: { e: g13e, m: g13m, a: g13a } },
    { id: '1.4', en: 'Positive and negative decimals', ms: 'Perpuluhan positif dan negatif', gen: { e: g14e, m: g14m, a: g14a } },
    { id: '1.5', en: 'Rational numbers', ms: 'Nombor nisbah', gen: { e: g15e, m: g15m, a: g15a } },
    { id: '1.5E', en: 'Extensions and contexts', ms: 'Lanjutan dan konteks', scope: 'enrichment', gen: { e: g15Ee, m: g15Em, a: g15Ea } },
  ]);

  /* =============================================================== 2 */
  const primeList = (r, lo, hi) => {
    const ps = [];
    for (let i = lo; i <= hi; i++) if (isPrime(i)) ps.push(i);
    return ps;
  };
  const facStr = (nn) => {
    const pf = primeFactors(nn);
    const cnt = {};
    pf.forEach((p) => (cnt[p] = (cnt[p] || 0) + 1));
    return Object.keys(cnt).map(Number).sort((a, b) => a - b).map((p) => (cnt[p] > 1 ? `${p}^{${cnt[p]}}` : `${p}`)).join(' \\times ');
  };
  const gcd3 = (a, b, c) => gcd(gcd(a, b), c);
  const lcm3 = (a, b, c) => lcm(lcm(a, b), c);
  const g21e = [
    (r) => {
      const nn = r.pick([12, 16, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48]);
      return { q: T(`List all the factors of $${nn}$.`, `Senaraikan semua faktor bagi $${nn}$.`), a: T(`$${factors(nn).join(',\\ ')}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(3, 12), cnt = 5;
      return { q: T(`List the first ${cnt} multiples of $${k}$.`, `Senaraikan ${cnt} gandaan pertama bagi $${k}$.`), a: T(`$${[1, 2, 3, 4, 5].map((i) => i * k).join(',\\ ')}$`), sp: 'xs' };
    },
    (r) => {
      const pr = r.sample([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47], 2);
      const comp = r.sample([9, 15, 21, 27, 33, 39, 45, 49], 2);
      const list = r.shuffle(pr.concat(comp));
      return { q: T(`Which of the following are prime numbers? $${list.join(',\\ ')}$`, `Antara nombor berikut, yang manakah nombor perdana? $${list.join(',\\ ')}$`), a: T(`$${list.filter(isPrime).sort((a, b) => a - b).join(',\\ ')}$`), sp: 'xs' };
    },
    (r) => {
      const nn = r.pick([12, 18, 20, 24, 28, 30, 36, 40, 45, 50]);
      return { q: T(`Express $${nn}$ as a product of prime factors.`, `Ungkapkan $${nn}$ sebagai hasil darab faktor perdana.`), a: T(`$${nn} = ${primeFactors(nn).join(' \\times ')}$`), sp: 's' };
    },
  ];
  const g21m = [
    (r) => {
      const nn = r.pick([60, 84, 90, 126, 132, 150, 180, 210, 220, 252, 300, 330, 420, 462]);
      return { q: T(`Express $${nn}$ as a product of prime factors. Use a factor tree or repeated division.`, `Ungkapkan $${nn}$ sebagai hasil darab faktor perdana. Gunakan pokok faktor atau pembahagian berulang.`), a: T(`$${nn} = ${primeFactors(nn).join(' \\times ')}$`), sp: 'm' };
    },
    (r) => {
      const list = r.shuffle([51, 57, 87, 91, 97, 89, 83, 73]).slice(0, 5);
      return { q: T(`Identify the prime numbers among $${list.join(',\\ ')}$. (Hint: check for factors 3, 7, 11 before deciding.)`, `Kenal pasti nombor perdana antara $${list.join(',\\ ')}$. (Petunjuk: semak faktor 3, 7, 11 sebelum membuat keputusan.)`), a: T(`$${list.filter(isPrime).join(',\\ ') || '\\text{none}'}$`, `$${list.filter(isPrime).join(',\\ ') || '\\text{tiada}'}$`), sp: 's' };
    },
    (r) => {
      const nn = r.pick([72, 96, 108, 120, 144, 160, 200, 240, 360, 450]);
      return { q: T(`List all the factors of $${nn}$. How many factors does it have?`, `Senaraikan semua faktor bagi $${nn}$. Berapakah bilangan faktornya?`), a: T(`$${factors(nn).join(',\\ ')}$ (${factors(nn).length} factors)`, `$${factors(nn).join(',\\ ')}$ (${factors(nn).length} faktor)`), sp: 'm' };
    },
  ];
  const g21a = [
    (r) => {
      const nn = r.pick([360, 504, 540, 588, 630, 675, 720, 756, 792, 840, 900, 936, 980]);
      return { q: T(`Express $${nn}$ as a product of prime factors in index notation.`, `Ungkapkan $${nn}$ sebagai hasil darab faktor perdana dalam tatatanda indeks.`), a: T(`$${nn} = ${facStr(nn)}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(1, 3), c = r.pick([5, 7]), d = 3;
      const val = Math.pow(2, a) * Math.pow(3, b) * c;
      need(val < 1300);
      return { q: T(`Given that $2^a \\times 3^b \\times ${c} = ${val}$, where $a$ and $b$ are positive integers, find the values of $a$ and $b$.`, `Diberi $2^a \\times 3^b \\times ${c} = ${val}$, dengan keadaan $a$ dan $b$ ialah integer positif, cari nilai $a$ dan $b$.`), a: T(`$a = ${a}$, $b = ${b}$`), w: T(`$${val} = ${facStr(val)}$`), sp: 'm' };
    },
    (r) => {
      const p = r.pick([3, 5, 7, 11]), a = r.int(2, 3);
      const q = r.pick([2, 3, 5]);
      need(p !== q);
      const nn = Math.pow(p, a) * q * r.pick([2, 3, 4]);
      const pf = primeFactors(nn);
      const missing = r.pick([...new Set(pf)]);
      return {
        q: T(`$${nn} = ${facStr(nn).replace(new RegExp('(^|\\\\times )' + missing + '(\\^\\{\\d+\\})?'), (m, pre, ex) => pre + '\\square' + (ex || ''))}$. Find the missing prime number $\\square$.`, `$${nn} = ${facStr(nn).replace(new RegExp('(^|\\\\times )' + missing + '(\\^\\{\\d+\\})?'), (m, pre, ex) => pre + '\\square' + (ex || ''))}$. Cari nombor perdana yang hilang $\\square$.`),
        a: T(`$${missing}$`), w: T(`$${nn} = ${facStr(nn)}$`), sp: 'm',
      };
    },
  ];
  const g22e = [
    (r) => {
      const g = r.pick([2, 3, 4, 5, 6]);
      const a = g * r.int(2, 6), b = g * r.int(2, 6);
      need(a !== b && gcd(a, b) === g && a <= 50 && b <= 50);
      return { q: T(`Find the highest common factor (HCF) of $${a}$ and $${b}$.`, `Cari faktor sepunya terbesar (FSTB) bagi $${a}$ dan $${b}$.`), a: T(`$${g}$`), sp: 's' };
    },
    (r) => {
      const a = r.pick([12, 16, 18, 20, 24, 30]), b = r.pick([8, 9, 15, 27, 32, 36, 40]);
      need(a !== b && gcd(a, b) > 1);
      const ca = factors(a).filter((x) => b % x === 0);
      return { q: T(`List the common factors of $${a}$ and $${b}$.`, `Senaraikan faktor sepunya bagi $${a}$ dan $${b}$.`), a: T(`$${ca.join(',\\ ')}$`), sp: 's' };
    },
  ];
  const g22m = [
    (r) => {
      const g = r.pick([6, 7, 8, 9, 12, 14, 15]);
      const a = g * r.int(3, 12), b = g * r.int(3, 12);
      need(a !== b && gcd(a, b) === g && a <= 200 && b <= 200);
      return { q: T(`Find the HCF of $${a}$ and $${b}$ using prime factorisation.`, `Cari FSTB bagi $${a}$ dan $${b}$ menggunakan pemfaktoran perdana.`), a: T(`$${g}$`), w: T(`$${a} = ${primeFactors(a).join(' \\times ')}$, $${b} = ${primeFactors(b).join(' \\times ')}$`), sp: 'm' };
    },
    (r) => {
      const g = r.pick([2, 3, 4, 6]);
      const [a, b, c] = [g * r.int(2, 8), g * r.int(2, 8), g * r.int(2, 8)];
      need(new Set([a, b, c]).size === 3 && gcd3(a, b, c) === g);
      return { q: T(`Find the HCF of $${a}$, $${b}$ and $${c}$.`, `Cari FSTB bagi $${a}$, $${b}$ dan $${c}$.`), a: T(`$${g}$`), sp: 'm' };
    },
    (r) => {
      const g = r.pick([4, 5, 6, 8, 12]);
      const a = g * r.int(3, 9), b = g * r.int(3, 9);
      need(gcd(a, b) === g && a !== b);
      const it = r.pick(ITEM);
      const [p] = r.pair();
      return { q: T(`A teacher has ${a} pens and ${b} exercise books. They are to be packed into identical sets with no items left over. Find the greatest number of sets.`, `Seorang guru mempunyai ${a} batang pen dan ${b} buah buku latihan. Kesemuanya hendak dibungkus dalam set yang serupa tanpa sebarang baki. Cari bilangan set yang paling banyak.`), a: T(`${g}`), w: T(`HCF of ${a} and ${b}`, `FSTB bagi ${a} dan ${b}`), sp: 'm' };
    },
  ];
  const g22a = [
    (r) => {
      const g = r.pick([6, 12, 14, 18, 21, 24]);
      const a = g * r.pick([3, 5, 7, 8, 11]), b = g * r.pick([4, 9, 10, 13]), c = g * r.pick([5, 6, 12, 15]);
      need(new Set([a, b, c]).size === 3 && gcd3(a, b, c) === g && Math.max(a, b, c) <= 500);
      return { q: T(`Find the HCF of $${a}$, $${b}$ and $${c}$.`, `Cari FSTB bagi $${a}$, $${b}$ dan $${c}$.`), a: T(`$${g}$`), sp: 'm' };
    },
    (r) => {
      const g = r.pick([15, 20, 25, 30, 40, 45, 50]);
      const w = g * r.int(3, 8), h = g * r.int(2, 6);
      need(gcd(w, h) === g && w !== h);
      return {
        q: T(`A rectangular floor measures ${w} cm by ${h} cm. It is to be covered exactly with identical square tiles, with no cutting. Find (a) the largest possible side length of a tile, (b) the number of tiles needed.`, `Sebuah lantai segi empat tepat berukuran ${w} cm kali ${h} cm. Lantai itu hendak ditutup tepat dengan jubin segi empat sama yang serupa tanpa dipotong. Cari (a) panjang sisi terbesar bagi sebuah jubin, (b) bilangan jubin yang diperlukan.`),
        a: T(`(a) ${g} cm (b) ${(w / g) * (h / g)} tiles`, `(a) ${g} cm (b) ${(w / g) * (h / g)} keping`), w: T(`HCF of ${w} and ${h} is ${g}; $${w / g} \\times ${h / g}$`, `FSTB bagi ${w} dan ${h} ialah ${g}; $${w / g} \\times ${h / g}$`), sp: 'm',
      };
    },
    (r) => {
      const g = r.pick([6, 8, 9, 12]);
      const a = g * r.int(3, 9), b = g * r.int(4, 11), c = g * r.int(3, 8);
      need(new Set([a, b, c]).size === 3 && gcd3(a, b, c) === g);
      return {
        q: T(`A school has ${a} boys, ${b} girls and ${c} teachers on a trip. They are to be split into the largest possible identical groups, each with the same number of boys, girls and teachers. How many groups are there, and how many of each are in a group?`, `Sebuah sekolah menghantar ${a} murid lelaki, ${b} murid perempuan dan ${c} guru dalam satu lawatan. Mereka hendak dibahagikan kepada kumpulan serupa yang paling banyak, setiap kumpulan mempunyai bilangan murid lelaki, murid perempuan dan guru yang sama. Berapakah bilangan kumpulan, dan berapakah bilangan setiap jenis dalam satu kumpulan?`),
        a: T(`${g} groups; ${a / g} boys, ${b / g} girls, ${c / g} teachers each`, `${g} kumpulan; setiap kumpulan ${a / g} lelaki, ${b / g} perempuan, ${c / g} guru`), sp: 'm',
      };
    },
  ];
  const g23e = [
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 12);
      need(a !== b && lcm(a, b) <= 60);
      return { q: T(`Find the lowest common multiple (LCM) of $${a}$ and $${b}$.`, `Cari gandaan sepunya terkecil (GSTK) bagi $${a}$ dan $${b}$.`), a: T(`$${lcm(a, b)}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(3, 8), b = r.int(3, 9);
      need(a !== b);
      const ma = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => i * a).filter((x) => x % b === 0 && x <= a * b);
      return { q: T(`List the first six multiples of $${a}$ and of $${b}$. Hence state the LCM.`, `Senaraikan enam gandaan pertama bagi $${a}$ dan $${b}$. Seterusnya nyatakan GSTK.`), a: T(`Multiples of $${a}$: $${[1, 2, 3, 4, 5, 6].map((i) => i * a).join(', ')}$; of $${b}$: $${[1, 2, 3, 4, 5, 6].map((i) => i * b).join(', ')}$. LCM $= ${lcm(a, b)}$`, `Gandaan $${a}$: $${[1, 2, 3, 4, 5, 6].map((i) => i * a).join(', ')}$; $${b}$: $${[1, 2, 3, 4, 5, 6].map((i) => i * b).join(', ')}$. GSTK $= ${lcm(a, b)}$`), sp: 's' };
    },
  ];
  const g23m = [
    (r) => {
      const a = r.int(12, 60), b = r.int(12, 100);
      need(a !== b && lcm(a, b) <= 900);
      return { q: T(`Find the LCM of $${a}$ and $${b}$.`, `Cari GSTK bagi $${a}$ dan $${b}$.`), a: T(`$${lcm(a, b)}$`), sp: 'm' };
    },
    (r) => {
      const [a, b, c] = r.distinct(3, 2, 30);
      need(lcm3(a, b, c) <= 1500);
      return { q: T(`Find the LCM of $${a}$, $${b}$ and $${c}$.`, `Cari GSTK bagi $${a}$, $${b}$ dan $${c}$.`), a: T(`$${lcm3(a, b, c)}$`), sp: 'm' };
    },
    (r) => {
      const a = r.pick([10, 12, 15, 20, 25]), b = r.pick([6, 8, 9, 14, 18]);
      need(lcm(a, b) < 400);
      return {
        q: T(`Two bells ring every ${a} minutes and every ${b} minutes respectively. If they ring together at 8:00 a.m., after how many minutes will they next ring together?`, `Dua loceng masing-masing berbunyi setiap ${a} minit dan setiap ${b} minit. Jika kedua-duanya berbunyi serentak pada pukul 8:00 pagi, selepas berapa minit kedua-duanya akan berbunyi serentak lagi?`),
        a: T(`${lcm(a, b)} minutes`, `${lcm(a, b)} minit`), sp: 'm',
      };
    },
  ];
  const g23a = [
    (r) => {
      const a = r.pick([12, 18, 20, 24]), b = r.pick([15, 16, 30, 36]), c = r.pick([9, 10, 25, 27]);
      need(new Set([a, b, c]).size === 3 && lcm3(a, b, c) < 2000);
      const l = lcm3(a, b, c);
      return {
        q: T(`Three lights flash every ${a} s, ${b} s and ${c} s. They flash together at the start. (a) After how many seconds will all three flash together again? (b) How many times do all three flash together in 1 hour (not counting the start)?`, `Tiga lampu berkelip setiap ${a} s, ${b} s dan ${c} s. Ketiga-tiganya berkelip serentak pada permulaan. (a) Selepas berapa saat ketiga-tiganya berkelip serentak semula? (b) Berapa kalikah ketiga-tiganya berkelip serentak dalam 1 jam (tidak termasuk permulaan)?`),
        a: T(`(a) ${l} s (b) ${Math.floor(3600 / l)} times`, `(a) ${l} s (b) ${Math.floor(3600 / l)} kali`), sp: 'm',
      };
    },
    (r) => {
      const d = r.pick([[6, 8, 9], [4, 6, 10], [8, 12, 15], [5, 6, 8]]);
      const rem = r.int(1, 3);
      const l = lcm3(...d);
      return {
        q: T(`Find the smallest number that is divisible by $${d[0]}$, $${d[1]}$ and $${d[2]}$. Hence find the smallest 4-digit number divisible by all three.`, `Cari nombor terkecil yang boleh dibahagi tepat dengan $${d[0]}$, $${d[1]}$ dan $${d[2]}$. Seterusnya cari nombor 4 digit terkecil yang boleh dibahagi tepat dengan ketiga-tiganya.`),
        a: T(`$${l}$; $${Math.ceil(1000 / l) * l}$`), sp: 'm',
      };
    },
    (r) => {
      const g = r.pick([3, 4, 5, 6]);
      const a = g * r.pick([2, 3, 5]), b = g * r.pick([4, 7]);
      need(a !== b);
      return {
        q: T(`The HCF of two numbers is $${gcd(a, b)}$ and their LCM is $${lcm(a, b)}$. If one of the numbers is $${a}$, find the other number.`, `FSTB bagi dua nombor ialah $${gcd(a, b)}$ dan GSTK bagi kedua-duanya ialah $${lcm(a, b)}$. Jika satu daripada nombor itu ialah $${a}$, cari nombor yang satu lagi.`),
        a: T(`$${b}$`), w: T(`$\\text{HCF}\\times\\text{LCM} = ${gcd(a, b) * lcm(a, b)} = ${a} \\times ${b}$`, `$\\text{FSTB}\\times\\text{GSTK} = ${gcd(a, b) * lcm(a, b)} = ${a} \\times ${b}$`), sp: 'm',
      };
    },
  ];

  SPM.addChapter(1, 2, T('Factors and Multiples', 'Faktor dan Gandaan'), [
    { id: '2.1', en: 'Factors, prime factors and multiples', ms: 'Faktor, faktor perdana dan gandaan', gen: { e: g21e, m: g21m, a: g21a } },
    { id: '2.2', en: 'Common factors and HCF', ms: 'Faktor sepunya dan FSTB', gen: { e: g22e, m: g22m, a: g22a } },
    { id: '2.3', en: 'Common multiples and LCM', ms: 'Gandaan sepunya dan GSTK', gen: { e: g23e, m: g23m, a: g23a } },
  ]);

  /* =============================================================== 3 */
  const SQ = (k) => k * k;
  const g31e = [
    (r) => { const k = r.int(2, 12); return { q: T(`Evaluate $${k}^2$.`, `Hitung $${k}^2$.`), a: T(`$${k * k}$`), sp: 'xs' }; },
    (r) => { const k = r.int(2, 12); return { q: T(`Find the value of $\\sqrt{${k * k}}$.`, `Cari nilai $\\sqrt{${k * k}}$.`), a: T(`$${k}$`), sp: 'xs' }; },
    (r) => { const k = r.int(3, 12); return { q: T(`Solve $x^2 = ${k * k}$.`, `Selesaikan $x^2 = ${k * k}$.`), a: T(`$x = \\pm ${k}$ (i.e. $${k}$ or $-${k}$)`, `$x = \\pm ${k}$ (iaitu $${k}$ atau $-${k}$)`), sp: 'xs' }; },
    (r) => { const k = r.int(3, 12); return { q: T(`The area of a square is $${k * k}\\ \\text{cm}^2$. Find the length of one side.`, `Luas sebuah segi empat sama ialah $${k * k}\\ \\text{cm}^2$. Cari panjang satu sisi.`), a: T(`$${k}$ cm`), sp: 'xs' }; },
  ];
  const g31m = [
    (r) => { const k = r.int(13, 20); return { q: T(`Evaluate $${k}^2$.`, `Hitung $${k}^2$.`), a: T(`$${k * k}$`), sp: 'xs' }; },
    (r) => {
      const a = r.pick([[1, 4], [4, 9], [9, 16], [25, 49], [36, 64], [16, 81], [49, 100]]);
      return { q: T(`Find the value of $\\sqrt{\\dfrac{${a[0]}}{${a[1]}}}$.`, `Cari nilai $\\sqrt{\\dfrac{${a[0]}}{${a[1]}}}$.`), a: T(`$\\dfrac{${Math.sqrt(a[0])}}{${Math.sqrt(a[1])}}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([0.09, 0.16, 0.25, 0.36, 0.49, 0.64, 0.81, 1.44, 1.21, 2.25]);
      return { q: T(`Find the value of $\\sqrt{${k}}$.`, `Cari nilai $\\sqrt{${k}}$.`), a: T(`$${n(round(Math.sqrt(k), 2))}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 12), b = r.int(2, 12);
      const f = r.pick([
        [`\\sqrt{${a * a}} + \\sqrt{${b * b}}`, a + b],
        [`\\sqrt{${a * a}} \\times \\sqrt{${b * b}}`, a * b],
        [`${a}^2 - \\sqrt{${b * b}}`, a * a - b],
        [`\\sqrt{${a * a}} \\times \\sqrt{${a * a}}`, a * a],
      ]);
      return { q: T(`Evaluate $${f[0]}$.`, `Hitung $${f[0]}$.`), a: T(`$${f[1]}$`), sp: 's' };
    },
    (r) => {
      const a = r.pick([4, 9, 16, 25, 36]), b = r.pick([9, 16, 25, 49, 64, 81]);
      return { q: T(`Show that $\\sqrt{${a}} \\times \\sqrt{${b}} = \\sqrt{${a} \\times ${b}}$.`, `Tunjukkan bahawa $\\sqrt{${a}} \\times \\sqrt{${b}} = \\sqrt{${a} \\times ${b}}$.`), a: T(`$${Math.sqrt(a)} \\times ${Math.sqrt(b)} = ${Math.sqrt(a) * Math.sqrt(b)}$ and $\\sqrt{${a * b}} = ${Math.sqrt(a * b)}$`), sp: 's' };
    },
  ];
  const g31a = [
    (r) => {
      const k = r.int(30, 130);
      const lo = Math.floor(Math.sqrt(k));
      need(lo * lo !== k);
      return { q: T(`Between which two consecutive integers does $\\sqrt{${k}}$ lie?`, `Di antara dua integer berturutan yang manakah $\\sqrt{${k}}$ terletak?`), a: T(`Between $${lo}$ and $${lo + 1}$`, `Di antara $${lo}$ dan $${lo + 1}$`), w: T(`$${lo}^2 = ${lo * lo}$, $${lo + 1}^2 = ${(lo + 1) ** 2}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 8), c = r.int(2, 5);
      const d = r.pick([2, 3, 6]);
      const f = r.pick([
        [`${a}^2 \\times \\sqrt{${(b * d) * (b * d)}} \\div ${d} - ${c}`, a * a * b * d / d - c],
        [`\\sqrt{${a * a}} + ${b}^2 \\div ${b} - ${c}`, a + b - c],
        [`(\\sqrt{${a * a * b * b}} - ${a}) \\times ${c}`, (a * b - a) * c],
      ]);
      return { q: T(`Evaluate $${f[0]}$.`, `Hitung $${f[0]}$.`), a: T(`$${f[1]}$`), sp: 'm' };
    },
    (r) => {
      const w = r.int(1, 4), nu = r.pick([[1, 4], [9, 16], [1, 9], [4, 9], [16, 25]]);
      const F = fr(w * nu[1] + nu[0], nu[1]);
      const v = fr(Math.sqrt(F.n), Math.sqrt(F.d));
      need(Number.isInteger(Math.sqrt(F.n)) && Number.isInteger(Math.sqrt(F.d)));
      return { q: T(`Find the value of $\\sqrt{${w}\\dfrac{${nu[0]}}{${nu[1]}}}$.`, `Cari nilai $\\sqrt{${w}\\dfrac{${nu[0]}}{${nu[1]}}}$.`), a: T(`$${Fr.mixed(v)}$`), w: T(`$${w}\\dfrac{${nu[0]}}{${nu[1]}} = \\dfrac{${F.n}}{${F.d}}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(3, 12), b = r.int(2, 12);
      return { q: T(`The side of a square is ${a} cm. Find the difference between the area of a square of side ${a + b} cm and this square.`, `Sisi sebuah segi empat sama ialah ${a} cm. Cari perbezaan antara luas segi empat sama bersisi ${a + b} cm dengan segi empat sama ini.`), a: T(`$${(a + b) ** 2 - a * a}\\ \\text{cm}^2$`), w: T(`$${a + b}^2 - ${a}^2$`), sp: 'm' };
    },
  ];
  const cubeList = [1, 8, 27, 64, 125, 216, 343, 512, 729, 1000];
  const g32e = [
    (r) => { const k = r.int(1, 10); return { q: T(`Evaluate $${k}^3$.`, `Hitung $${k}^3$.`), a: T(`$${k ** 3}$`), sp: 'xs' }; },
    (r) => { const k = r.int(1, 10); return { q: T(`Find the value of $\\sqrt[3]{${k ** 3}}$.`, `Cari nilai $\\sqrt[3]{${k ** 3}}$.`), a: T(`$${k}$`), sp: 'xs' }; },
    (r) => { const k = r.int(2, 9); return { q: T(`Solve $x^3 = ${k ** 3}$.`, `Selesaikan $x^3 = ${k ** 3}$.`), a: T(`$x = ${k}$`), sp: 'xs' }; },
    (r) => { const k = r.int(2, 10); return { q: T(`The volume of a cube is $${k ** 3}\\ \\text{cm}^3$. Find the length of an edge.`, `Isi padu sebuah kubus ialah $${k ** 3}\\ \\text{cm}^3$. Cari panjang seunit tepinya.`), a: T(`$${k}$ cm`), sp: 'xs' }; },
  ];
  const g32m = [
    (r) => { const k = r.int(11, 15); return { q: T(`Evaluate $${k}^3$.`, `Hitung $${k}^3$.`), a: T(`$${k ** 3}$`), sp: 'xs' }; },
    (r) => { const k = r.pick([6, 7, 8, 9, 10]); const s = r.chance(); return { q: T(`Find the value of $\\sqrt[3]{${s ? '-' : ''}${k ** 3}}$.`, `Cari nilai $\\sqrt[3]{${s ? '-' : ''}${k ** 3}}$.`), a: T(`$${s ? -k : k}$`), sp: 'xs' }; },
    (r) => { const k = r.int(2, 6); return { q: T(`Evaluate $(-${k})^3$.`, `Hitung $(-${k})^3$.`), a: T(`$${-(k ** 3)}$`), sp: 'xs' }; },
    (r) => {
      const a = r.int(2, 7), b = r.int(2, 5);
      const f = r.pick([
        [`\\sqrt[3]{${a ** 3}} + ${b}^3`, a + b ** 3],
        [`${a}^3 - \\sqrt[3]{${b ** 3}}`, a ** 3 - b],
        [`\\sqrt[3]{${a ** 3}} \\times \\sqrt[3]{${b ** 3}}`, a * b],
        [`${a * b * b * b} \\div ${b}^3 + \\sqrt[3]{${a ** 3}}`, a + a],
      ]);
      return { q: T(`Evaluate $${f[0]}$.`, `Hitung $${f[0]}$.`), a: T(`$${f[1]}$`), sp: 's' };
    },
  ];
  const g32a = [
    (r) => {
      const k = r.int(30, 500);
      const lo = Math.floor(Math.cbrt(k));
      need(lo ** 3 !== k);
      return { q: T(`Between which two consecutive integers does $\\sqrt[3]{${k}}$ lie?`, `Di antara dua integer berturutan yang manakah $\\sqrt[3]{${k}}$ terletak?`), a: T(`Between $${lo}$ and $${lo + 1}$`, `Di antara $${lo}$ dan $${lo + 1}$`), w: T(`$${lo}^3 = ${lo ** 3}$, $${lo + 1}^3 = ${(lo + 1) ** 3}$`), sp: 's' };
    },
    (r) => {
      const nu = r.pick([[1, 8], [8, 27], [27, 64], [64, 125], [1, 27], [125, 216]]);
      return { q: T(`Find the value of $\\sqrt[3]{\\dfrac{${nu[0]}}{${nu[1]}}}$.`, `Cari nilai $\\sqrt[3]{\\dfrac{${nu[0]}}{${nu[1]}}}$.`), a: T(`$\\dfrac{${Math.round(Math.cbrt(nu[0]))}}{${Math.round(Math.cbrt(nu[1]))}}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([[0.008, 0.2], [0.027, 0.3], [0.125, 0.5], [0.064, 0.4], [0.001, 0.1], [0.216, 0.6]]);
      return { q: T(`Find the value of $\\sqrt[3]{${k[0]}}$.`, `Cari nilai $\\sqrt[3]{${k[0]}}$.`), a: T(`$${k[1]}$`), sp: 's' };
    },
    (r) => {
      const e = r.int(3, 12);
      return { q: T(`A solid metal cube has a volume of $${e ** 3}\\ \\text{cm}^3$. Find (a) the length of one edge, (b) the area of one face.`, `Sebuah kubus logam pepejal mempunyai isi padu $${e ** 3}\\ \\text{cm}^3$. Cari (a) panjang satu tepi, (b) luas satu permukaan.`), a: T(`(a) ${e} cm (b) $${e * e}\\ \\text{cm}^2$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5), c = r.int(2, 4);
      return { q: T(`Evaluate $\\sqrt[3]{${a ** 3}} \\times ${b}^2 - \\sqrt{${c * c * 16}} \\div ${c}$.`, `Hitung $\\sqrt[3]{${a ** 3}} \\times ${b}^2 - \\sqrt{${c * c * 16}} \\div ${c}$.`), a: T(`$${a * b * b - 4}$`), sp: 'm' };
    },
  ];
  SPM.addChapter(1, 3, T('Squares, Square Roots, Cubes and Cube Roots', 'Kuasa Dua, Punca Kuasa Dua, Kuasa Tiga dan Punca Kuasa Tiga'), [
    { id: '3.1', en: 'Squares and square roots', ms: 'Kuasa dua dan punca kuasa dua', gen: { e: g31e, m: g31m, a: g31a } },
    { id: '3.2', en: 'Cubes and cube roots', ms: 'Kuasa tiga dan punca kuasa tiga', gen: { e: g32e, m: g32m, a: g32a } },
  ]);

  /* =============================================================== 4 */
  const simpRatio = (a, b) => { const g = gcd(a, b); return [a / g, b / g]; };
  const g41e = [
    (r) => {
      const g = r.int(2, 6), a = r.int(1, 6), b = r.int(1, 6);
      need(gcd(a, b) === 1 && a !== b);
      return { q: T(`Simplify the ratio $${a * g} : ${b * g}$.`, `Ringkaskan nisbah $${a * g} : ${b * g}$.`), a: T(`$${a} : ${b}$`), sp: 'xs' };
    },
    (r) => {
      const [p] = r.pair();
      const a = r.int(2, 9), b = r.int(2, 9);
      need(a !== b);
      return { q: T(`In a class there are ${a * 3} boys and ${b * 3} girls. Write the ratio of the number of boys to the number of girls in its simplest form.`, `Dalam sebuah kelas terdapat ${a * 3} murid lelaki dan ${b * 3} murid perempuan. Tulis nisbah bilangan murid lelaki kepada bilangan murid perempuan dalam bentuk termudah.`), a: T(`$${simpRatio(a * 3, b * 3).join(' : ')}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 7), k = r.int(2, 6);
      need(a !== b);
      return { q: T(`Find the value of $x$ in the equivalent ratios $${a} : ${b} = ${a * k} : x$.`, `Cari nilai $x$ dalam nisbah setara $${a} : ${b} = ${a * k} : x$.`), a: T(`$x = ${b * k}$`), sp: 'xs' };
    },
  ];
  const g41m = [
    (r) => {
      const rmv = r.pick([[50, 2], [80, 3], [60, 1], [25, 2], [40, 4]]);
      const [s, R] = rmv;
      const rs = simpRatio(s, R * 100);
      return { q: T(`Express the ratio ${s} sen to RM${R} in its simplest form.`, `Ungkapkan nisbah ${s} sen kepada RM${R} dalam bentuk termudah.`), a: T(`$${rs.join(' : ')}$`), w: T(`RM${R} = ${R * 100} sen`), sp: 's' };
    },
    (r) => {
      const [a, b, c] = [r.int(2, 8), r.int(2, 8), r.int(2, 8)];
      need(gcd(gcd(a, b), c) === 1 && new Set([a, b, c]).size >= 2);
      const k = r.int(2, 5);
      const x = r.int(1, 3);
      return { q: T(`Simplify the ratio $${a * k} : ${b * k} : ${c * k}$.`, `Ringkaskan nisbah $${a * k} : ${b * k} : ${c * k}$.`), a: T(`$${a} : ${b} : ${c}$`), sp: 's' };
    },
    (r) => {
      const a = r.pick([2, 4, 5, 8]), b = r.int(a + 1, 21);
      need(gcd(a, b) === 1);
      return { q: T(`Express the ratio $${a} : ${b}$ in the form $1 : n$.`, `Ungkapkan nisbah $${a} : ${b}$ dalam bentuk $1 : n$.`), a: T(`$1 : ${n(round(b / a, 3))}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 9);
      need(a !== b && gcd(a, b) === 1);
      const [p] = r.pair();
      return { q: T(`The ratio of the number of red marbles to blue marbles is $${a} : ${b}$. What fraction of the marbles are red?`, `Nisbah bilangan guli merah kepada guli biru ialah $${a} : ${b}$. Apakah pecahan guli yang berwarna merah?`), a: T(`$\\dfrac{${a}}{${a + b}}$`), sp: 's' };
    },
    (r) => {
      const a = r.pick([300, 450, 600, 750, 1200]), b = r.pick([2, 3, 5]);
      return { q: T(`Express the ratio ${a} g to ${b} kg in its simplest form.`, `Ungkapkan nisbah ${a} g kepada ${b} kg dalam bentuk termudah.`), a: T(`$${simpRatio(a, b * 1000).join(' : ')}$`), sp: 's' };
    },
  ];
  const g41a = [
    (r) => {
      const a = r.int(1, 5), b = r.int(2, 7), c = r.int(2, 7), d = r.int(2, 7);
      need(gcd(a, b) === 1 && gcd(c, d) === 1 && b !== c);
      const l = lcm(b, c);
      const x = [a * (l / b), b * (l / b), d * (l / c)];
      const g = gcd(gcd(x[0], x[1]), x[2]);
      return { q: T(`Given $a : b = ${a} : ${b}$ and $b : c = ${c} : ${d}$, find $a : b : c$.`, `Diberi $a : b = ${a} : ${b}$ dan $b : c = ${c} : ${d}$, cari $a : b : c$.`), a: T(`$${x.map((v) => v / g).join(' : ')}$`), w: T(`Make $b$ equal to ${l} in both ratios`, `Samakan $b$ kepada ${l} dalam kedua-dua nisbah`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(a + 1, 9), add = r.int(1, 4);
      need(gcd(a, b) === 1);
      const k = r.int(2, 5);
      const A = a * k, B = b * k;
      const nn = simpRatio(A + add, B + add);
      need(nn[0] !== A + add || true);
      return { q: T(`The ratio of the ages of two brothers is $${a} : ${b}$. Their ages are ${A} and ${B} years. Find the ratio of their ages after ${add} years, in its simplest form.`, `Nisbah umur dua orang adik-beradik ialah $${a} : ${b}$. Umur mereka ialah ${A} dan ${B} tahun. Cari nisbah umur mereka selepas ${add} tahun, dalam bentuk termudah.`), a: T(`$${nn.join(' : ')}$`), w: T(`$${A + add} : ${B + add}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 8), add = r.int(2, 6);
      need(gcd(a, b) === 1 && a !== b);
      const k = r.int(2, 6);
      const A = a * k, B = b * k;
      const after = simpRatio(A + add, B + add);
      return { q: T(`A number of red and blue pens are in the ratio $${a} : ${b}$. If ${add} more of each colour are added, there are ${A + add} red pens and ${B + add} blue pens. Find how many pens of each colour there were originally.`, `Sebilangan pen merah dan biru berada dalam nisbah $${a} : ${b}$. Jika ${add} batang lagi bagi setiap warna ditambah, terdapat ${A + add} batang pen merah dan ${B + add} batang pen biru. Cari bilangan asal pen bagi setiap warna.`), a: T(`${A} red, ${B} blue`, `${A} merah, ${B} biru`), sp: 'm' };
    },
  ];
  const g42e = [
    (r) => {
      const c = r.int(2, 9), q = r.int(2, 6);
      const item = r.pick([[T('kg of rice', 'kg beras'), 'kg'], [T('kg of sugar', 'kg gula'), 'kg'], [T('litres of petrol', 'liter petrol'), 'l']]);
      return { q: T(`RM${c * q} is paid for ${q} ${item[0].en}. Find the price per ${item[1]}.`, `RM${c * q} dibayar bagi ${q} ${item[0].ms}. Cari harga per ${item[1]}.`), a: T(`RM${c} per ${item[1]}`, `RM${c} per ${item[1]}`), sp: 'xs' };
    },
    (r) => {
      const v = r.int(30, 90), t = r.int(2, 6);
      return { q: T(`A car travels ${v * t} km in ${t} hours. Find its speed in km/h.`, `Sebuah kereta bergerak ${v * t} km dalam ${t} jam. Cari lajunya dalam km/j.`), a: T(`${v} km/h`, `${v} km/j`), sp: 'xs' };
    },
    (r) => {
      const w = r.int(6, 15), h = r.int(4, 8);
      return { q: T(`Rahman earns RM${w * h} for working ${h} hours. Find his hourly wage.`, `Rahman memperoleh RM${w * h} kerana bekerja ${h} jam. Cari upah sejamnya.`), a: T(`RM${w}/hour`, `RM${w}/jam`), sp: 'xs' };
    },
  ];
  const g42m = [
    (r) => {
      const p1 = r.pick([[3, 4.5], [2, 3.4], [5, 8.5], [4, 5.6]]), p2 = r.pick([[6, 8.4], [10, 15.5], [8, 10.4], [2, 3.1]]);
      const u1 = round(p1[1] / p1[0], 4), u2 = round(p2[1] / p2[0], 4);
      need(u1 !== u2);
      const best = u1 < u2 ? 'A' : 'B';
      return { q: T(`Shop A sells ${p1[0]} kg of flour for RM${n(p1[1])} and Shop B sells ${p2[0]} kg for RM${n(p2[1])}. Which shop offers the better price per kg?`, `Kedai A menjual ${p1[0]} kg tepung dengan harga RM${n(p1[1])} dan Kedai B menjual ${p2[0]} kg dengan harga RM${n(p2[1])}. Kedai manakah yang menawarkan harga per kg yang lebih baik?`), a: T(`Shop ${best} (RM${n(Math.min(u1, u2))}/kg vs RM${n(Math.max(u1, u2))}/kg)`, `Kedai ${best} (RM${n(Math.min(u1, u2))}/kg berbanding RM${n(Math.max(u1, u2))}/kg)`), sp: 'm' };
    },
    (r) => {
      const v = r.pick([40, 48, 60, 72]), h = r.int(2, 4), m = r.pick([15, 30, 45]);
      const t = h + m / 60;
      const d = v * t;
      return { q: T(`A bus travels at ${v} km/h for ${h} hours ${m} minutes. Calculate the distance travelled.`, `Sebuah bas bergerak pada ${v} km/j selama ${h} jam ${m} minit. Hitung jarak yang dilalui.`), a: T(`${n(d)} km`), w: T(`$${v}\\times${n(t)}$`), sp: 's' };
    },
    (r) => {
      const usd = r.pick([4.2, 4.5, 4.4, 4.7]);
      const a = r.int(20, 90);
      return { q: T(`The exchange rate is USD1 = RM${usd}. Convert USD${a} to ringgit.`, `Kadar pertukaran ialah USD1 = RM${usd}. Tukarkan USD${a} kepada ringgit.`), a: T(`RM${n(round(a * usd, 2))}`), sp: 's' };
    },
    (r) => {
      const m = r.int(2, 9) * 100, l = r.int(2, 5) * 100;
      const den = round(m / l, 2);
      return { q: T(`A metal block has a mass of ${m} g and a volume of ${l} cm³. Find its density in g/cm³.`, `Sebuah bongkah logam berjisim ${m} g dan berisi padu ${l} cm³. Cari ketumpatannya dalam g/cm³.`), a: T(`${n(den)} g/cm³`), sp: 's' };
    },
  ];
  const g42a = [
    (r) => {
      const v1 = r.pick([40, 60, 80]), v2 = r.pick([50, 90, 100]), d1 = r.int(2, 4) * 40, d2 = r.int(2, 4) * 50;
      const t1 = d1 / v1, t2 = d2 / v2;
      const avg = round((d1 + d2) / (t1 + t2), 2);
      need(v1 !== v2);
      return { q: T(`A driver travels ${d1} km at ${v1} km/h and then ${d2} km at ${v2} km/h. Find the average speed for the whole journey (correct to 2 decimal places if necessary).`, `Seorang pemandu memandu sejauh ${d1} km pada ${v1} km/j dan kemudian ${d2} km pada ${v2} km/j. Cari purata laju bagi keseluruhan perjalanan (betul kepada 2 tempat perpuluhan jika perlu).`), a: T(`${n(avg)} km/h`, `${n(avg)} km/j`), w: T(`$\\dfrac{${d1}+${d2}}{\\frac{${d1}}{${v1}}+\\frac{${d2}}{${v2}}}$`), sp: 'm' };
    },
    (r) => {
      const mpm = r.pick([60, 75, 90, 120, 150]);
      const kmh = round((mpm * 60) / 1000, 2);
      return { q: T(`Convert ${mpm} m/min to km/h.`, `Tukarkan ${mpm} m/min kepada km/j.`), a: T(`${n(kmh)} km/h`, `${n(kmh)} km/j`), w: T(`$${mpm}\\times 60 \\div 1000$`), sp: 'm' };
    },
    (r) => {
      const q1 = r.pick([[6, 10.2], [5, 9.5], [4, 7.6]]);
      const l = r.int(20, 60);
      const rate1 = q1[1] / q1[0];
      const petrol = r.pick([2.05, 2.15, 2.6]);
      const kmL = r.pick([8, 10, 12, 16]);
      const d = kmL * r.int(4, 9);
      return { q: T(`A car uses 1 litre of petrol for every ${kmL} km. Petrol costs RM${petrol} per litre. Find the cost of petrol for a journey of ${d} km.`, `Sebuah kereta menggunakan 1 liter petrol bagi setiap ${kmL} km. Harga petrol ialah RM${petrol} seliter. Cari kos petrol bagi perjalanan sejauh ${d} km.`), a: T(`RM${fx((d / kmL) * petrol, 2)}`), w: T(`$${d}\\div${kmL}\\times${petrol}$`), sp: 'm' };
    },
  ];
  const g43e = [
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 9), k = r.int(2, 5);
      need(a !== b);
      const which = r.chance();
      return which
        ? { q: T(`Find $x$ if $x : ${b * k} = ${a} : ${b}$.`, `Cari $x$ jika $x : ${b * k} = ${a} : ${b}$.`), a: T(`$x = ${a * k}$`), sp: 's' }
        : { q: T(`Solve $\\dfrac{${a}}{${b}} = \\dfrac{x}{${b * k}}$.`, `Selesaikan $\\dfrac{${a}}{${b}} = \\dfrac{x}{${b * k}}$.`), a: T(`$x = ${a * k}$`), sp: 's' };
    },
    (r) => {
      const p = r.pick([[1, 2, 0.5, 50], [1, 4, 0.25, 25], [3, 4, 0.75, 75], [1, 5, 0.2, 20], [2, 5, 0.4, 40], [3, 5, 0.6, 60], [1, 10, 0.1, 10]]);
      return { q: T(`Express $\\dfrac{${p[0]}}{${p[1]}}$ as (a) a decimal, (b) a percentage.`, `Ungkapkan $\\dfrac{${p[0]}}{${p[1]}}$ sebagai (a) perpuluhan, (b) peratusan.`), a: T(`(a) $${p[2]}$ (b) $${p[3]}\\%$`), sp: 's' };
    },
  ];
  const g43m = [
    (r) => {
      const a = r.int(2, 5), b = r.int(a + 1, 8);
      need(gcd(a, b) === 1);
      const tot = (a + b) * r.int(30, 130);
      const sh = tot / (a + b);
      const [p, q] = r.pair();
      return { q: T(`${p} and ${q} share RM${tot} in the ratio $${a} : ${b}$. Calculate each person's share.`, `${p} dan ${q} berkongsi RM${tot} dalam nisbah $${a} : ${b}$. Hitung bahagian setiap orang.`), a: T(`${p}: RM${a * sh}, ${q}: RM${b * sh}`), w: T(`Total parts = ${a + b}`, `Jumlah bahagian = ${a + b}`), sp: 'm' };
    },
    (r) => {
      const a = r.int(1, 4), b = r.int(2, 5), c = r.int(3, 6);
      need(new Set([a, b, c]).size === 3);
      const tot = (a + b + c) * r.int(20, 90);
      const sh = tot / (a + b + c);
      const nm = r.names(3);
      return { q: T(`RM${tot} is divided among ${nm.join(', ')} in the ratio $${a} : ${b} : ${c}$. Find each share.`, `RM${tot} dibahagikan kepada ${nm.join(', ')} dalam nisbah $${a} : ${b} : ${c}$. Cari bahagian setiap orang.`), a: T(`RM${a * sh}, RM${b * sh}, RM${c * sh}`), sp: 'm' };
    },
    (r) => {
      const part = r.pick([12, 15, 18, 24, 30, 36, 45]), whole = r.pick([40, 50, 60, 80, 100, 120, 150]);
      need((part * 100) % whole === 0 && part < whole);
      const x = (part * 100) / whole;
      return { q: T(`Use a proportion to find what percentage ${part} is of ${whole}.`, `Gunakan kaedah kadaran untuk mencari peratusan ${part} daripada ${whole}.`), a: T(`$${x}\\%$`), w: T(`$\\dfrac{${part}}{${whole}} = \\dfrac{x}{100}$`), sp: 'm' };
    },
    (r) => {
      const srv = r.int(3, 6), need_ = r.int(2, 5) * 2 + srv;
      const flour = r.pick([120, 150, 200, 250]);
      const a = flour * need_ / srv;
      need(Number.isInteger(a) || Math.abs(a - round(a, 1)) < 1e-9);
      return { q: T(`A recipe uses ${flour} g of flour to make ${srv} muffins. How much flour is needed to make ${need_} muffins?`, `Sebuah resipi menggunakan ${flour} g tepung untuk membuat ${srv} biji muffin. Berapakah tepung yang diperlukan untuk membuat ${need_} biji muffin?`), a: T(`${n(a)} g`), w: T(`$${flour}\\div ${srv}\\times ${need_}$`), sp: 'm' };
    },
  ];
  const g43a = [
    (r) => {
      const a = r.int(2, 5), b = r.int(a + 1, 8);
      need(gcd(a, b) === 1);
      const tot = (a + b) * r.int(40, 160);
      const sh = tot / (a + b);
      const [p, q] = r.pair();
      return { q: T(`${p} and ${q} share RM${tot} in the ratio $${a} : ${b}$. Find (a) how much more ${q} receives than ${p}, (b) the percentage of the total that ${p} receives.`, `${p} dan ${q} berkongsi RM${tot} dalam nisbah $${a} : ${b}$. Cari (a) berapa lebih banyak ${q} menerima berbanding ${p}, (b) peratusan daripada jumlah yang diterima ${p}.`), a: T(`(a) RM${(b - a) * sh} (b) $${n(round((a * 100) / (a + b), 2))}\\%$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 4), b = r.int(a + 1, 6);
      need(gcd(a, b) === 1);
      const k = r.int(3, 9);
      const diff = (b - a) * k;
      return { q: T(`The ratio of the number of boys to girls in a club is $${a} : ${b}$. There are ${diff} more girls than boys. Find the total number of members.`, `Nisbah bilangan murid lelaki kepada murid perempuan dalam sebuah kelab ialah $${a} : ${b}$. Terdapat ${diff} lebih murid perempuan berbanding murid lelaki. Cari jumlah bilangan ahli.`), a: T(`${(a + b) * k}`), w: T(`$${b - a}$ parts $= ${diff}$; 1 part $= ${k}$`, `$${b - a}$ bahagian $= ${diff}$; 1 bahagian $= ${k}$`), sp: 'm' };
    },
    (r) => {
      const tot = r.int(4, 9) * 10;
      const pct = r.pick([20, 25, 40, 60]);
      const part = (tot * pct) / 100;
      const price = r.pick([6, 8, 12, 15]);
      return { q: T(`A shop has ${tot} shirts. ${pct}% of them are sold at RM${price} each and the rest at RM${price - 2} each. Find the total sales value.`, `Sebuah kedai mempunyai ${tot} helai baju. ${pct}% daripadanya dijual pada harga RM${price} sehelai dan selebihnya pada harga RM${price - 2} sehelai. Cari jumlah nilai jualan.`), a: T(`RM${part * price + (tot - part) * (price - 2)}`), sp: 'm' };
    },
  ];
  SPM.addChapter(1, 4, T('Ratios, Rates and Proportions', 'Nisbah, Kadar dan Kadaran'), [
    { id: '4.1', en: 'Ratios', ms: 'Nisbah', gen: { e: g41e, m: g41m, a: g41a } },
    { id: '4.2', en: 'Rates', ms: 'Kadar', gen: { e: g42e, m: g42m, a: g42a } },
    { id: '4.3', en: 'Proportions, fractions, decimals and percentages', ms: 'Kadaran, pecahan, perpuluhan dan peratusan', gen: { e: g43e, m: g43m, a: g43a } },
  ]);

  /* =============================================================== 5 */
  const VARS = ['x', 'y', 'a', 'b', 'p', 'q', 'm', 'n', 'k'];
  const g51e = [
    (r) => {
      const k = r.int(2, 9), v = r.pick(['x', 'm', 'n', 'p']);
      const f = r.pick([
        [T(`${k} more than ${v}`, `${k} lebih daripada ${v}`), `${v} + ${k}`],
        [T(`${k} less than ${v}`, `${k} kurang daripada ${v}`), `${v} - ${k}`],
        [T(`${k} times ${v}`, `${k} kali ${v}`), `${k}${v}`],
        [T(`${v} divided by ${k}`, `${v} dibahagi dengan ${k}`), `\\dfrac{${v}}{${k}}`],
      ]);
      return { q: T(`Write an algebraic expression for "${f[0].en}".`, `Tulis ungkapan algebra bagi "${f[0].ms}".`), a: T(`$${f[1]}$`), sp: 'xs' };
    },
    (r) => {
      const c = r.int(2, 9), v = r.pick(['x', 'y', 'a', 'p']);
      const t = r.int(2, 9);
      const e = `${c}${v}^2`;
      return { q: T(`For the term $${c * 1}${v}$, state the coefficient and the variable.`, `Bagi sebutan $${c}${v}$, nyatakan pekali dan pemboleh ubah.`), a: T(`Coefficient: $${c}$; variable: $${v}$`, `Pekali: $${c}$; pemboleh ubah: $${v}$`), sp: 'xs' };
    },
    (r) => {
      const v = r.pick(['x', 'y', 'a', 'p']);
      const k = r.int(2, 4);
      return { q: T(`Write $${Array(k).fill(v).join(' \\times ')}$ in index form.`, `Tulis $${Array(k).fill(v).join(' \\times ')}$ dalam bentuk indeks.`), a: T(`$${v}^{${k}}$`), sp: 'xs' };
    },
    (r) => {
      const c = r.int(2, 6);
      const ctx = r.pick([
        [T(`A car travels at a constant speed of ${c * 10} km/h for $t$ hours.`, `Sebuah kereta bergerak dengan laju tetap ${c * 10} km/j selama $t$ jam.`), 't', T('the time $t$ changes; the speed is fixed', 'masa $t$ berubah; laju adalah tetap'), T('speed', 'laju')],
        [T(`A pen costs RM${c} and $n$ pens are bought.`, `Harga sebatang pen ialah RM${c} dan $n$ batang pen dibeli.`), 'n', T('the number of pens $n$ changes; the price is fixed', 'bilangan pen $n$ berubah; harga adalah tetap'), T('price', 'harga')],
      ]);
      return { q: T(`${ctx[0].en} State the quantity that is a variable and the quantity that is fixed.`, `${ctx[0].ms} Nyatakan kuantiti yang merupakan pemboleh ubah dan kuantiti yang tetap.`), a: ctx[2], sp: 's' };
    },
  ];
  const g51m = [
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 9), v = r.pick(['x', 'y', 'n']);
      const f = r.pick([
        [T(`${a} more than twice ${v}`, `${a} lebih daripada dua kali ${v}`), `2${v} + ${a}`],
        [T(`twice the sum of ${v} and ${b}`, `dua kali hasil tambah ${v} dan ${b}`), `2(${v} + ${b})`],
        [T(`${b} less than three times ${v}`, `${b} kurang daripada tiga kali ${v}`), `3${v} - ${b}`],
        [T(`the product of ${v} and ${b}, divided by ${a}`, `hasil darab ${v} dan ${b}, dibahagi dengan ${a}`), `\\dfrac{${b}${v}}{${a}}`],
      ]);
      return { q: T(`Write an algebraic expression for "${f[0].en}".`, `Tulis ungkapan algebra bagi "${f[0].ms}".`), a: T(`$${f[1]}$`), sp: 's' };
    },
    (r) => {
      const p = r.int(2, 9) / 2, c = r.int(2, 9);
      const [nm] = r.pair();
      return { q: T(`${nm} buys $p$ pens at RM${c} each and $q$ books at RM${c + 3} each. Write an expression for the total cost in RM.`, `${nm} membeli $p$ batang pen pada harga RM${c} sebatang dan $q$ buah buku pada harga RM${c + 3} sebuah. Tulis ungkapan bagi jumlah kos dalam RM.`), a: T(`$${c}p + ${c + 3}q$`), sp: 's' };
    },
    (r) => {
      const v = r.pick(['x', 'a', 'p']), w = r.pick(['y', 'b', 'q']);
      return { q: T(`Write $${v} \\times ${v} \\times ${w} \\times ${v} \\times ${w}$ in index form.`, `Tulis $${v} \\times ${v} \\times ${w} \\times ${v} \\times ${w}$ dalam bentuk indeks.`), a: T(`$${v}^3${w}^2$`), sp: 's' };
    },
    (r) => {
      const k = r.int(3, 10);
      return { q: T(`A rectangle has length $(x + ${k})$ cm and width $x$ cm. Write an expression for its perimeter.`, `Sebuah segi empat tepat mempunyai panjang $(x + ${k})$ cm dan lebar $x$ cm. Tulis ungkapan bagi perimeternya.`), a: T(`$(4x + ${2 * k})$ cm`), w: T(`$2[(x+${k}) + x]$`), sp: 's' };
    },
  ];
  const g51a = [
    (r) => {
      const a = r.int(2, 5), b = r.int(1, 4);
      const w = r.int(2, 5), l = r.int(1, 4);
      const W = lin(w, l, 'a'), Lx = lin(a, -b, 'a');
      return { q: T(`A rectangle has length $(${lin(a, b, 'a')})$ cm and width $(${lin(w, -l, 'a')})$ cm. Write and simplify an expression for its perimeter.`, `Sebuah segi empat tepat mempunyai panjang $(${lin(a, b, 'a')})$ cm dan lebar $(${lin(w, -l, 'a')})$ cm. Tulis dan ringkaskan satu ungkapan bagi perimeternya.`), a: T(`$(${lin(2 * (a + w), 2 * (b - l), 'a')})$ cm`), w: T(`$2[(${lin(a, b, 'a')}) + (${lin(w, -l, 'a')})]$`), sp: 'm' };
    },
    (r) => {
      const v = r.pick(['p', 'x', 'y']), w = r.pick(['q', 'y', 'z']);
      need(v !== w);
      const a = r.int(2, 3), b = r.int(2, 3);
      const prod = `${v}^{${a}}${w}^{${b}}`;
      const expanded = Array(a).fill(v).concat(Array(b).fill(w));
      return { q: T(`(a) Write $${prod}$ as repeated multiplication. (b) Write $${r.shuffle(expanded).join(' \\times ')}$ in index form.`, `(a) Tulis $${prod}$ sebagai pendaraban berulang. (b) Tulis $${r.shuffle(expanded).join(' \\times ')}$ dalam bentuk indeks.`), a: T(`(a) $${v}\\times`.replace('\\times', '') + `$`, ''), sp: 'm' };
    },
    (r) => {
      const c = r.int(2, 5), d = r.int(2, 6);
      return { q: T(`Write an expression for each situation. (a) The price of a shirt is RM$x$. During a sale it is reduced by RM${c}. Ali buys ${d} shirts. Find his total payment. (b) Write the coefficient of $x$ in your answer.`, `Tulis ungkapan bagi setiap situasi. (a) Harga sehelai baju ialah RM$x$. Semasa jualan, harganya dikurangkan sebanyak RM${c}. Ali membeli ${d} helai baju. Cari jumlah bayarannya. (b) Tulis pekali $x$ dalam jawapan anda.`), a: T(`(a) RM$${d}(x - ${c}) = ${d}x - ${c * d}$ (b) $${d}$`.replace('RM$', '$RM ').replace('$RM ', 'RM$')), sp: 'm' };
    },
  ];
  // fix generator with awkward answer string (parts of repeated mult)
  g51a[1] = (r) => {
    const v = r.pick(['p', 'x', 'y']), w = r.pick(['q', 'z', 'k']);
    const a = r.int(2, 3), b = r.int(2, 3);
    const prod = `${v}^{${a}}${w}^{${b}}`;
    const expanded = Array(a).fill(v).concat(Array(b).fill(w));
    const shown = r.shuffle(expanded).join(' \\times ');
    return {
      q: T(`(a) Write $${prod}$ as repeated multiplication. (b) Write $${shown}$ in index form.`, `(a) Tulis $${prod}$ sebagai pendaraban berulang. (b) Tulis $${shown}$ dalam bentuk indeks.`),
      a: T(`(a) $${expanded.join(' \\times ')}$ (b) $${prod}$`), sp: 'm',
    };
  };
  g51a[2] = (r) => {
    const c = r.int(2, 5), d = r.int(2, 6);
    return {
      q: T(`The price of a shirt is RM$x$. During a sale it is reduced by RM${c}. Ali buys ${d} shirts. (a) Write an expression for his total payment. (b) State the coefficient of $x$ after simplifying.`, `Harga sehelai baju ialah RM$x$. Semasa jualan, harganya dikurangkan sebanyak RM${c}. Ali membeli ${d} helai baju. (a) Tulis ungkapan bagi jumlah bayarannya. (b) Nyatakan pekali $x$ selepas diringkaskan.`),
      a: T(`(a) RM$${d}(x - ${c}) = ${d}x - ${c * d}$ (b) $${d}$`), sp: 'm',
    };
  };

  const g52e = [
    (r) => {
      const a = r.int(2, 9), b = r.int(1, a - 1), v = r.pick(['a', 'x', 'p', 'm']);
      return { q: T(`Simplify $${a}${v} - ${b}${v}$.`, `Ringkaskan $${a}${v} - ${b}${v}$.`), a: T(`$${termOf(a - b, v)}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 8), b = r.int(2, 8), v = r.pick(['x', 'y', 'p']), c = r.int(2, 6);
      return { q: T(`Simplify $${a}${v} + ${b}${v} + ${c}$.`, `Ringkaskan $${a}${v} + ${b}${v} + ${c}$.`), a: T(`$${termOf(a + b, v)} + ${c}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9);
      const A = r.pick(['x', 'y', 'a', 'p']);
      return { q: T(`Evaluate $${a}x + ${b}$ when $x = ${c}$.`, `Hitung $${a}x + ${b}$ apabila $x = ${c}$.`), a: T(`$${a * c + b}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 7), b = r.int(2, 7);
      return { q: T(`Simplify $${a}p \\times ${b}q$.`, `Ringkaskan $${a}p \\times ${b}q$.`), a: T(`$${a * b}pq$`), sp: 'xs' };
    },
  ];
  function termOf(c, v) {
    if (c === 1) return v;
    if (c === -1) return '-' + v;
    return c + v;
  }
  const g52m = [
    (r) => {
      const [a, b, c, d] = [r.nz(-9, 9), r.nz(-9, 9), r.nz(-9, 9), r.nz(-9, 9)];
      const x = a + c, y = b + d;
      return { q: T(`Simplify $${poly([[a, 'x'], [b, 'y'], [c, 'x'], [d, 'y']])}$.`, `Ringkaskan $${poly([[a, 'x'], [b, 'y'], [c, 'x'], [d, 'y']])}$.`), a: T(`$${poly([[x, 'x'], [y, 'y']])}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), p = r.int(1, 3), q = r.int(1, 2);
      const v = r.pick(['p', 'x', 'a']);
      const A = a * b, k = r.int(2, 6);
      return { q: T(`Simplify $${A * k}${v}^2 \\div ${k}${v}$.`, `Ringkaskan $${A * k}${v}^2 \\div ${k}${v}$.`), a: T(`$${A}${v}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5);
      return { q: T(`Simplify $${a}p \\times ${b}q$ and $${a * b * 4}x^2 \\div ${b * 2}x$.`, `Ringkaskan $${a}p \\times ${b}q$ dan $${a * b * 4}x^2 \\div ${b * 2}x$.`), a: T(`$${a * b}pq$; $${termOf((a * b * 4) / (b * 2), 'x')}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 6), x = r.int(2, 5), y = r.nz(-4, 4);
      return { q: T(`Find the value of $${a}x - ${b}y$ when $x = ${x}$ and $y = ${y}$.`, `Cari nilai $${a}x - ${b}y$ apabila $x = ${x}$ dan $y = ${y}$.`), a: T(`$${a * x - b * y}$`), w: T(`$${a}(${x}) - ${b}(${par(y)})$`), sp: 's' };
    },
  ];
  const g52a = [
    (r) => {
      const fa = fr(r.int(1, 3), r.pick([2, 3, 4])), fb = fr(r.int(1, 3), r.pick([3, 5, 6]));
      const v = Fr.sub(fa, fb);
      need(fa.d !== fb.d);
      return { q: T(`Simplify $${frT(fa)}x - ${frT(fb)}x$.`, `Ringkaskan $${frT(fa)}x - ${frT(fb)}x$.`), a: T(`$${v.n === 0 ? '0' : (Fr.tex(v) + 'x')}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(-4, -1), k = r.int(2, 4);
      const c = r.int(1, 4), d = r.int(2, 7);
      const val = a ** 3 - k * a;
      return { q: T(`Find the value of $a^3 - ${k}a$ when $a = ${a}$.`, `Cari nilai $a^3 - ${k}a$ apabila $a = ${a}$.`), a: T(`$${val}$`), w: T(`$(${a})^3 - ${k}(${a})$`), sp: 'm' };
    },
    (r) => {
      const [a, b, c, d, e] = [r.nz(-6, 6), r.nz(-6, 6), r.nz(-6, 6), r.nz(-6, 6), r.nz(-6, 6)];
      const terms = [[a, 'x'], [b, 'y'], [c, ''], [d, 'x'], [e, 'y'], [r.nz(-6, 6), '']];
      const xs = terms.filter((t) => t[1] === 'x').reduce((s, t) => s + t[0], 0);
      const ys = terms.filter((t) => t[1] === 'y').reduce((s, t) => s + t[0], 0);
      const cs = terms.filter((t) => t[1] === '').reduce((s, t) => s + t[0], 0);
      const shown = poly(r.shuffle(terms));
      return { q: T(`Simplify $${shown}$.`, `Ringkaskan $${shown}$.`), a: T(`$${poly([[xs, 'x'], [ys, 'y'], [cs, '']])}$`), sp: 'm' };
    },
    (r) => {
      const x = r.nz(-4, 4), y = r.nz(-4, 4);
      const a = r.int(2, 4), b = r.int(2, 4);
      return { q: T(`Given $x = ${x}$ and $y = ${y}$, evaluate $${a}x^2 - ${b}xy + y^2$.`, `Diberi $x = ${x}$ dan $y = ${y}$, hitung $${a}x^2 - ${b}xy + y^2$.`), a: T(`$${a * x * x - b * x * y + y * y}$`), sp: 'm' };
    },
  ];
  SPM.addChapter(1, 5, T('Algebraic Expressions', 'Ungkapan Algebra'), [
    { id: '5.1', en: 'Variables and algebraic expressions', ms: 'Pemboleh ubah dan ungkapan algebra', gen: { e: g51e, m: g51m, a: g51a } },
    { id: '5.2', en: 'Algebraic expressions involving basic arithmetic operations', ms: 'Ungkapan algebra yang melibatkan operasi asas aritmetik', gen: { e: g52e, m: g52m, a: g52a } },
  ]);
})();
