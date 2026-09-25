/* Form 1 – Chapters 1 to 5 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { L, n, fx, gm, rm, gt, par, sgn, gcd, lcm, isPrime, primeFactors, factors, round, Fr, poly, lin, parts, lines, table, need, retry, sum } = SPM;
  const S = SPM.svg;
  const T = (e, m) => ({ en: e, ms: m === undefined ? e : m });

  /* ============================================================ helpers */
  const W = SPM.lines;
  /** "smallest first" / "largest first" label for ordering questions */
  const orderWord = (asc) => (asc ? T('smallest first', 'terkecil dahulu') : T('largest first', 'terbesar dahulu'));
  /** "$a$ lies to the left/right of $b$ on a number line" */
  const sideOf = (a, b) => T(`On a number line $${par(a)}$ lies to the ${a < b ? 'left' : 'right'} of $${par(b)}$.`, `Pada garis nombor $${par(a)}$ terletak di sebelah ${a < b ? 'kiri' : 'kanan'} $${par(b)}$.`);
  const frT = Fr.tex;
  const frP = Fr.texP;
  const fr = (a, b) => Fr.make(a, b);
  const ITEM = [
    { en: 'pens', ms: 'batang pen' }, { en: 'exercise books', ms: 'buku latihan' }, { en: 'erasers', ms: 'pemadam' },
    { en: 'rulers', ms: 'pembaris' }, { en: 'oranges', ms: 'biji oren' }, { en: 'cakes', ms: 'biji kek' },
  ];
  const cmpWord = { '<': T('less than', 'kurang daripada'), '>': T('greater than', 'lebih besar daripada') };
  const ascDesc = (asc) => (asc ? T('ascending order', 'tertib menaik') : T('descending order', 'tertib menurun'));

  /* ---- working-step helpers (fractions) ---- */
  /** \dfrac{a}{b} exactly as given (no simplifying), minus sign in front, integers plain */
  const frRaw = (a, b) => (b === 1 ? n(a) : (a < 0 ? '-' : '') + `\\dfrac{${Math.abs(a)}}{${b}}`);
  /** same, bracketed when negative */
  const frRawP = (a, b) => (a < 0 ? `\\left(${frRaw(a, b)}\\right)` : frRaw(a, b));
  /** a signed number written inside a sum: negatives in round brackets */
  const numP = (v) => (v < 0 ? `(${n(v)})` : n(v));
  /** the reciprocal of a fraction */
  const recip = (B) => fr(B.d, B.n);
  /** "As a mixed number: …" line, only when the answer really is improper */
  const mixedLine = (v) => (Fr.mixed(v) === frT(v) ? [] : [T(`As a mixed number: $${frT(v)} = ${Fr.mixed(v)}$`, `Sebagai nombor bercampur: $${frT(v)} = ${Fr.mixed(v)}$`)]);
  /** steps for A + B or A - B with fractions, ending at the simplified answer */
  const frAddSteps = (A, op, B) => {
    const D = lcm(A.d, B.d);
    const an = A.n * (D / A.d), bn = B.n * (D / B.d);
    const raw = op === '+' ? an + bn : an - bn;
    const v = fr(raw, D);
    const out = [];
    if (op === '-' && B.n < 0) out.push(T('Subtracting a negative number is the same as adding its positive value.', 'Menolak nombor negatif sama dengan menambah nilai positifnya.'));
    if (A.d !== B.d) out.push(T(`Common denominator $${D}$: $${frRaw(an, D)} ${op} ${frRawP(bn, D)}$`, `Penyebut sepunya $${D}$: $${frRaw(an, D)} ${op} ${frRawP(bn, D)}$`));
    out.push(T(`$= \\dfrac{${n(an)} ${op} ${numP(bn)}}{${D}} = ${frRaw(raw, D)}$`));
    if (frRaw(raw, D) !== frT(v)) out.push(T(`Simplify: $${frRaw(raw, D)} = ${frT(v)}$`, `Permudahkan: $${frRaw(raw, D)} = ${frT(v)}$`));
    return out;
  };
  /** steps for A × B or A ÷ B with fractions, ending at the simplified answer */
  const frMulSteps = (A, op, B) => {
    const out = [];
    let C = B;
    if (op === '\\div') {
      C = recip(B);
      out.push(T(`Dividing by $${frT(B)}$ is multiplying by its reciprocal $${frT(C)}$.`, `Membahagi dengan $${frT(B)}$ ialah mendarab dengan salingannya $${frT(C)}$.`));
    }
    const rawN = A.n * C.n, rawD = A.d * C.d;
    const v = fr(rawN, rawD);
    out.push(T(`$= \\dfrac{${numP(A.n)} \\times ${numP(C.n)}}{${A.d} \\times ${C.d}} = ${frRaw(rawN, rawD)}$`));
    if (frRaw(rawN, rawD) !== frT(v)) out.push(T(`Simplify: $${frRaw(rawN, rawD)} = ${frT(v)}$`, `Permudahkan: $${frRaw(rawN, rawD)} = ${frT(v)}$`));
    return out;
  };
  /** common-denominator comparison lines for a list of fractions */
  const frOrderSteps = (list, sorted, asc) => {
    const D = list.reduce((m, f) => lcm(m, f.d), 1);
    const show = (a) => a.map((f) => frRaw(f.n * (D / f.d), D)).join(',\\ ');
    return [
      T(`Write them all with the common denominator $${D}$: $${show(list)}$`, `Tulis kesemuanya dengan penyebut sepunya $${D}$: $${show(list)}$`),
      T(`Compare the numerators, ${orderWord(asc).en}: $${show(sorted)}$`, `Bandingkan pengangka, ${orderWord(asc).ms}: $${show(sorted)}$`),
      T(`$${sorted.map(frT).join(',\\ ')}$`),
    ];
  };

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
      return {
        q: T('State the integer represented by point $P$ on the number line.', 'Nyatakan integer yang diwakili oleh titik $P$ pada garis nombor.'),
        fig: S.numberLine({ min: lo, max: hi, step: 1, points: pts }),
        a: T(`$${v}$`),
        w: W(
          v === 0 ? T('$P$ is exactly at the origin.', '$P$ berada tepat pada asalan.')
            : T(`Count the marks from $0$: $P$ is ${Math.abs(v)} unit${Math.abs(v) === 1 ? '' : 's'} to the ${v < 0 ? 'left' : 'right'}, so the integer is ${v < 0 ? 'negative' : 'positive'}.`,
              `Kira tanda dari $0$: $P$ berada ${Math.abs(v)} unit ke ${v < 0 ? 'kiri' : 'kanan'}, jadi integernya ${v < 0 ? 'negatif' : 'positif'}.`),
          T(`$P = ${v}$`),
        ),
        sp: 'xs',
      };
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
      return {
        q: T(`Write the following as an integer: ${ctx[0].en}.`, `Tulis yang berikut sebagai integer: ${ctx[0].ms}.`),
        a: T(`$${ctx[1]}$`),
        w: W(
          ctx[1] < 0
            ? T('"Below zero", "below sea level" and "a loss" all point away from zero in the negative direction, so a minus sign is needed.', '"Di bawah sifar", "di bawah aras laut" dan "kerugian" semuanya menuju arah negatif daripada sifar, jadi tanda tolak diperlukan.')
            : T('"Above", "profit" and "gain" point in the positive direction from zero, so no minus sign is needed.', '"Di atas", "keuntungan" dan "pertambahan" menuju arah positif daripada sifar, jadi tanda tolak tidak diperlukan.'),
          T(`$${ctx[1]}$`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const pool = r.shuffle([-7, -3, 0, 5, 12, -10, 4, -1]).slice(0, 6);
      const extra = r.pick([[T('0.5', '0.5'), '0.5'], [T('\\tfrac12', ''), '\\tfrac{1}{2}'], [null, '2.5']]);
      const list = r.shuffle(pool.map((x) => '' + x).concat([r.pick(['0.5', '2.5', '\\tfrac{1}{2}', '-1.5', '\\tfrac{3}{4}'])]));
      const ints = list.filter((s) => /^-?\d+$/.test(s));
      return {
        q: T(`Which of the following numbers are integers? $${list.join(',\\ ')}$`, `Antara nombor berikut, yang manakah integer? $${list.join(',\\ ')}$`),
        a: T(`$${ints.join(',\\ ')}$`),
        w: W(
          T('An integer is a whole number or its negative: it has no fractional or decimal part.', 'Integer ialah nombor bulat atau negatifnya: ia tiada bahagian pecahan atau perpuluhan.'),
          T(`So the integers are $${ints.join(',\\ ')}$.`, `Maka integernya ialah $${ints.join(',\\ ')}$.`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const [a, b] = r.distinct(2, -9, 9);
      const sym = a < b ? '<' : '>';
      return {
        q: T(`Fill in the blank with $<$ or $>$: $${par(a)}\\ \\square\\ ${par(b)}$`, `Isi tempat kosong dengan $<$ atau $>$: $${par(a)}\\ \\square\\ ${par(b)}$`),
        a: T(`$${par(a)} ${sym} ${par(b)}$`),
        w: W(sideOf(a, b), T(`$${par(a)} ${sym} ${par(b)}$`)),
        sp: 'xs',
      };
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
        a: T(`$${ss.join(',\\ ')}$`),
        w: W(
          T('On a number line the values increase from left to right, so a negative integer further from zero is smaller.', 'Pada garis nombor, nilai bertambah dari kiri ke kanan, jadi integer negatif yang lebih jauh daripada sifar adalah lebih kecil.'),
          T(`Take them ${orderWord(asc).en}: $${ss.join(',\\ ')}$`, `Ambil mengikut ${orderWord(asc).ms}: $${ss.join(',\\ ')}$`),
        ),
        sp: 's',
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
        a: T(`$P = ${p}$, $Q = ${q}$`),
        w: W(
          T(`From $${lo}$ to $${hi}$ there are ${(hi - lo) / step} equal intervals, so each interval is $${step}$ units.`, `Dari $${lo}$ hingga $${hi}$ terdapat ${(hi - lo) / step} sela yang sama, jadi setiap sela ialah $${step}$ unit.`),
          T(`Counting in ${step}s from $0$: $P = ${p}$ and $Q = ${q}$.`, `Mengira selang ${step} dari $0$: $P = ${p}$ dan $Q = ${q}$.`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const [a, b] = r.distinct(2, 2, 40);
      const na = -a, nb = -b;
      const x = r.pick([[na, nb], [a, nb]]);
      const bigger = Math.max(x[0], x[1]);
      const smaller = Math.min(x[0], x[1]);
      return {
        q: T(`Which is greater, $${x[0]}$ or $${x[1]}$?`, `Yang manakah lebih besar, $${x[0]}$ atau $${x[1]}$?`),
        a: T(`$${bigger}$`),
        w: W(
          sideOf(bigger, smaller),
          T(`$${par(bigger)} > ${par(smaller)}$, so the greater number is $${bigger}$.`, `$${par(bigger)} > ${par(smaller)}$, jadi nombor yang lebih besar ialah $${bigger}$.`),
        ),
        sp: 'xs',
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
        a: T(`$${ss.join(',\\ ')}$`),
        w: W(
          T('Split the list first: the negative integers are all smaller than $0$, and $0$ is smaller than every positive integer.', 'Asingkan senarai dahulu: semua integer negatif lebih kecil daripada $0$, dan $0$ lebih kecil daripada setiap integer positif.'),
          T('Among the negative integers, the one further from zero is the smaller one (that is why $-100$ is smaller than $-15$).', 'Antara integer negatif, yang lebih jauh daripada sifar adalah lebih kecil (sebab itulah $-100$ lebih kecil daripada $-15$).'),
          T(`Taking them ${orderWord(asc).en}: $${ss.join(',\\ ')}$`, `Mengambilnya mengikut ${orderWord(asc).ms}: $${ss.join(',\\ ')}$`),
        ),
        sp: 'm',
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
        w: W(
          T(`From $${a0}$ to $${hi}$ there are ${(hi - a0) / step} equal intervals, so one interval $= ${step}$.`, `Dari $${a0}$ hingga $${hi}$ terdapat ${(hi - a0) / step} sela yang sama, jadi satu sela $= ${step}$.`),
          T(`(a) $P = ${p}$, $Q = ${q}$`),
          T(`(b) ${p < q ? 'P' : 'Q'} is further to the left, so it is the lower one.`, `(b) ${p < q ? 'P' : 'Q'} lebih ke kiri, jadi ia yang lebih rendah.`),
          T(`Difference $= ${Math.max(p, q)} - ${par(Math.min(p, q))} = ${Math.abs(p - q)}$`, `Beza $= ${Math.max(p, q)} - ${par(Math.min(p, q))} = ${Math.abs(p - q)}$`),
        ),
        sp: 'm',
      };
    },
  ];

  /* ---- 1.2 Integer arithmetic */
  const LAWS = [
    { t: (a, b) => `${a} + ${b} = ${b} + ${a}`, n: T('Commutative law of addition', 'Hukum kalis tukar tertib bagi penambahan'), why: T('the two numbers are added in a different order, yet the sum is unchanged.', 'kedua-dua nombor ditambah dalam tertib yang berbeza, tetapi hasil tambahnya tidak berubah.') },
    { t: (a, b) => `${a} \\times ${b} = ${b} \\times ${a}`, n: T('Commutative law of multiplication', 'Hukum kalis tukar tertib bagi pendaraban'), why: T('the two numbers are multiplied in a different order, yet the product is unchanged.', 'kedua-dua nombor didarab dalam tertib yang berbeza, tetapi hasil darabnya tidak berubah.') },
    { t: (a, b, c) => `(${a} + ${b}) + ${c} = ${a} + (${b} + ${c})`, n: T('Associative law of addition', 'Hukum kalis sekutuan bagi penambahan'), why: T('only the grouping of the brackets changes; the order of the numbers stays the same.', 'hanya pengumpulan kurungan yang berubah; tertib nombor itu kekal sama.') },
    { t: (a, b, c) => `(${a} \\times ${b}) \\times ${c} = ${a} \\times (${b} \\times ${c})`, n: T('Associative law of multiplication', 'Hukum kalis sekutuan bagi pendaraban'), why: T('only the grouping of the brackets changes; the order of the numbers stays the same.', 'hanya pengumpulan kurungan yang berubah; tertib nombor itu kekal sama.') },
    { t: (a, b, c) => `${a} \\times (${b} + ${c}) = ${a} \\times ${b} + ${a} \\times ${c}`, n: T('Distributive law', 'Hukum kalis agihan'), why: T('the multiplier outside the bracket is shared out over each term inside it.', 'pendarab di luar kurungan diagihkan kepada setiap sebutan di dalamnya.') },
    { t: (a) => `${a} + 0 = ${a}`, n: T('Identity law of addition (additive identity)', 'Hukum identiti bagi penambahan'), why: T('adding $0$ leaves the number unchanged.', 'menambah $0$ tidak mengubah nombor itu.') },
    { t: (a) => `${a} \\times 1 = ${a}`, n: T('Identity law of multiplication (multiplicative identity)', 'Hukum identiti bagi pendaraban'), why: T('multiplying by $1$ leaves the number unchanged.', 'mendarab dengan $1$ tidak mengubah nombor itu.') },
  ];
  /** steps for `a + (b)` / `a - (b)` with a possibly negative b */
  const addSubSteps = (a, op, b, v) => {
    const eff = op === '+' ? b : -b;
    const rewrite = `${a} ${eff < 0 ? '-' : '+'} ${Math.abs(eff)}`;
    if (`${a} ${op} ${par(b)}` === rewrite) return [T(`$${a} ${op} ${par(b)} = ${v}$`)];
    return [
      T(`${op === '+' ? 'Adding' : 'Subtracting'} $${par(b)}$ is the same as ${eff < 0 ? 'subtracting' : 'adding'} $${Math.abs(eff)}$.`,
        `${op === '+' ? 'Menambah' : 'Menolak'} $${par(b)}$ adalah sama dengan ${eff < 0 ? 'menolak' : 'menambah'} $${Math.abs(eff)}$.`),
      T(`$${a} ${op} ${par(b)} = ${rewrite} = ${v}$`),
    ];
  };
  /** "same signs -> positive, different signs -> negative" */
  const signRule = (neg, what) => T(`The two numbers have ${neg ? 'different signs, so the ' + what + ' is negative' : 'the same sign, so the ' + what + ' is positive'}.`,
    `Kedua-dua nombor mempunyai ${neg ? 'tanda yang berbeza, jadi ' + (what === 'product' ? 'hasil darabnya' : 'hasil bahaginya') + ' negatif' : 'tanda yang sama, jadi ' + (what === 'product' ? 'hasil darabnya' : 'hasil bahaginya') + ' positif'}.`);
  const g12e = [
    (r) => {
      const a = r.int(-15, 15), b = r.int(-15, 15);
      need(a !== 0 && b !== 0);
      const op = r.pick(['+', '-']);
      const v = op === '+' ? a + b : a - b;
      return { q: T(`Calculate $${a} ${op} ${par(b)}$.`, `Hitung $${a} ${op} ${par(b)}$.`), a: T(`$${v}$`), w: W(...addSubSteps(a, op, b, v)), sp: 'xs' };
    },
    (r) => {
      const a = r.nz(-9, 9), b = r.nz(-9, 9);
      return {
        q: T(`Evaluate $${a} \\times ${par(b)}$.`, `Hitung $${a} \\times ${par(b)}$.`),
        a: T(`$${a * b}$`),
        w: W(T(`Multiply the digits: $${Math.abs(a)} \\times ${Math.abs(b)} = ${Math.abs(a * b)}$`, `Darab digitnya: $${Math.abs(a)} \\times ${Math.abs(b)} = ${Math.abs(a * b)}$`), signRule(a * b < 0, 'product'), T(`$${a} \\times ${par(b)} = ${a * b}$`)),
        sp: 'xs',
      };
    },
    (r) => {
      const b = r.nz(-9, 9), k = r.nz(-9, 9);
      return {
        q: T(`Evaluate $${b * k} \\div ${par(b)}$.`, `Hitung $${b * k} \\div ${par(b)}$.`),
        a: T(`$${k}$`),
        w: W(T(`Divide the digits: $${Math.abs(b * k)} \\div ${Math.abs(b)} = ${Math.abs(k)}$`, `Bahagi digitnya: $${Math.abs(b * k)} \\div ${Math.abs(b)} = ${Math.abs(k)}$`), signRule(k < 0, 'quotient'), T(`$${b * k} \\div ${par(b)} = ${k}$`)),
        sp: 'xs',
      };
    },
    (r) => {
      const L1 = r.int(0, 3);
      const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9);
      const law = LAWS[L1 === 3 ? 3 : L1];
      const expr = law.t(a, b, c);
      return {
        q: T(`Name the arithmetic law shown by $${expr}$.`, `Namakan hukum aritmetik yang ditunjukkan oleh $${expr}$.`),
        a: law.n,
        w: W(T(`In $${expr}$ ${law.why.en}`, `Dalam $${expr}$ ${law.why.ms}`), law.n),
        sp: 'xs',
      };
    },
  ];
  const g12m = [
    (r) => {
      const a = r.nz(-9, 9), b = r.nz(-9, 9), c = r.nz(-9, 9);
      const forms = [
        [`${a} + ${par(b)} \\times ${par(c)}`, a + b * c, `${a} + ${par(b * c)}`, false],
        [`${a} - ${par(b)} \\times ${par(c)}`, a - b * c, `${a} - ${par(b * c)}`, false],
        [`(${a} + ${par(b)}) \\times ${par(c)}`, (a + b) * c, `${par(a + b)} \\times ${par(c)}`, true],
        [`(${a} - ${par(b)}) \\times ${par(c)}`, (a - b) * c, `${par(a - b)} \\times ${par(c)}`, true],
      ];
      const f = r.pick(forms);
      return {
        q: T(`Calculate $${f[0]}$.`, `Hitung $${f[0]}$.`),
        a: T(`$${f[1]}$`),
        w: W(
          f[3] ? T('Work out the bracket first.', 'Kira kurungan terlebih dahulu.') : T('Multiplication is done before addition and subtraction.', 'Pendaraban dilakukan sebelum penambahan dan penolakan.'),
          T(`$${f[0]} = ${f[2]}$`),
          T(`$= ${f[1]}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const c = r.nz(-6, 6), k = r.nz(-8, 8), a = r.nz(-20, 20);
      const f = r.pick([
        [`${a} + ${c * k} \\div ${par(c)}`, a + k, '+'],
        [`${a} - ${c * k} \\div ${par(c)}`, a - k, '-'],
      ]);
      return {
        q: T(`Evaluate $${f[0]}$.`, `Hitung $${f[0]}$.`),
        a: T(`$${f[1]}$`),
        w: W(
          T('Division is done before addition and subtraction.', 'Pembahagian dilakukan sebelum penambahan dan penolakan.'),
          T(`$${c * k} \\div ${par(c)} = ${k}$`),
          ...addSubSteps(a, f[2], k, f[1]),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = r.int(6, 30), b = r.int(3, 9), c = r.int(3, 9);
      const A = r.pick([13, 17, 19, 23, 27, 42, 25, 18]);
      const K = r.pick([98, 99, 101, 102, 48, 52, 97, 103]);
      return {
        q: T(`Use the distributive law to calculate $${A} \\times ${K}$ efficiently.`, `Gunakan hukum kalis agihan untuk menghitung $${A} \\times ${K}$ dengan cekap.`),
        a: T(`$${A * K}$`),
        w: (() => {
          const base = K > 75 ? 100 : 50;
          const dd = K - base, s = dd < 0 ? '-' : '+', ad = Math.abs(dd);
          return W(
            T(`Split $${K}$ into $${base} ${s} ${ad}$, a number that is easy to multiply by.`, `Pecahkan $${K}$ kepada $${base} ${s} ${ad}$, nombor yang mudah didarab.`),
            T(`$${A} \\times ${K} = ${A} \\times (${base} ${s} ${ad})$`),
            T(`$= ${A} \\times ${base} ${s} ${A} \\times ${ad}$`),
            T(`$= ${A * base} ${s} ${A * ad} = ${A * K}$`),
          );
        })(),
        sp: 's',
      };
    },
    (r) => {
      const t0 = r.int(-8, 8), d1 = r.int(4, 15), d2 = r.int(3, 12);
      const cont = r.pick(['t', 'e']);
      const t1 = t0 - d1, t2 = t1 + d2;
      const wk = W(
        cont === 't'
          ? T(`A drop subtracts and a rise adds; start from $${t0}$.`, `Penurunan menolak dan kenaikan menambah; mula daripada $${t0}$.`)
          : T(`Diving subtracts and rising adds; start from $${t0}$.`, `Menyelam menolak dan naik menambah; mula daripada $${t0}$.`),
        T(`$${t0} - ${d1} = ${t1}$`),
        T(`$${t1} + ${d2} = ${t2}$`),
      );
      return cont === 't'
        ? { q: T(`At midnight the temperature in Cameron Highlands was $${t0}^\\circ$C. It dropped by $${d1}^\\circ$C by 3 a.m. and then rose by $${d2}^\\circ$C by 8 a.m. What was the temperature at 8 a.m.?`, `Pada tengah malam, suhu di Cameron Highlands ialah $${t0}^\\circ$C. Suhu itu turun sebanyak $${d1}^\\circ$C pada pukul 3 pagi dan kemudian naik sebanyak $${d2}^\\circ$C pada pukul 8 pagi. Apakah suhu pada pukul 8 pagi?`), a: T(`$${t2}^\\circ$C`), w: wk, sp: 's' }
        : { q: T(`A submarine is at ${t0} m relative to sea level. It dives ${d1} m and then rises ${d2} m. State its final position relative to sea level.`, `Sebuah kapal selam berada pada ${t0} m berbanding aras laut. Ia menyelam ${d1} m dan kemudian naik ${d2} m. Nyatakan kedudukan akhirnya berbanding aras laut.`), a: T(`$${t2}$ m`), w: wk, sp: 's' };
    },
  ];
  const g12a = [
    (r) => {
      const a = r.nz(-9, 9), b = r.int(2, 9), c = r.nz(-9, 9), d = r.nz(-6, 6);
      const m = r.nz(-5, 5);
      const inner = a - b * c;
      // [a - b*c] ...
      const f = r.pick([
        [`${a} \\times [${b} - (${c} + ${d})] `, a * (b - (c + d)), `${a} \\times [${b} - ${par(c + d)}]`, `${a} \\times ${par(b - (c + d))}`],
        [`-${b} \\times [${c} - ${par(a)}] + ${par(d)}`, -b * (c - a) + d, `-${b} \\times ${par(c - a)} + ${par(d)}`, `${-b * (c - a)} + ${par(d)}`],
        [`[${a} - (${b} - ${par(c)})] \\times ${par(d)}`, (a - (b - c)) * d, `[${a} - ${par(b - c)}] \\times ${par(d)}`, `${par(a - (b - c))} \\times ${par(d)}`],
      ]);
      return {
        q: T(`Evaluate $${f[0]}$.`, `Hitung $${f[0]}$.`),
        a: T(`$${f[1]}$`),
        w: W(
          T('Work from the innermost bracket outwards.', 'Kira dari kurungan paling dalam ke arah luar.'),
          T(`$= ${f[2]}$`),
          T(`$= ${f[3]}$`),
          T(`$= ${f[1]}$`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const a = r.nz(-8, 8), x = r.nz(-9, 9), b = r.nz(-9, 9);
      const v = a * x + b;
      return {
        q: T(`Find the value of $\\square$ if $${a} \\times \\square ${sgn(b)} = ${v}$.`, `Cari nilai $\\square$ jika $${a} \\times \\square ${sgn(b)} = ${v}$.`),
        a: T(`$${x}$`),
        w: W(
          T('Undo the operations in reverse order, doing the same to both sides.', 'Songsangkan operasi dalam tertib terbalik, dengan melakukan perkara yang sama pada kedua-dua belah.'),
          T(`$${a} \\times \\square = ${v} ${b < 0 ? '+' : '-'} ${Math.abs(b)} = ${v - b}$`),
          T(`$\\square = ${v - b} \\div ${par(a)} = ${x}$`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const a = r.int(12, 60), b = r.int(2, 9);
      const c = r.nz(-9, 9);
      const k = r.int(2, 6);
      return {
        q: T(`Using a suitable arithmetic law, calculate $${a} \\times ${par(-b)} + ${a} \\times ${par(-(10 - b))}$ without a calculator. State the law used.`, `Dengan menggunakan hukum aritmetik yang sesuai, hitung $${a} \\times ${par(-b)} + ${a} \\times ${par(-(10 - b))}$ tanpa kalkulator. Nyatakan hukum yang digunakan.`),
        a: T(`$${-a * 10}$ — distributive law`, `$${-a * 10}$ — hukum kalis agihan`),
        w: W(
          T(`Both products share the factor $${a}$, so take it out: this is the distributive law.`, `Kedua-dua hasil darab berkongsi faktor $${a}$, jadi keluarkannya: inilah hukum kalis agihan.`),
          T(`$${a}\\times[(-${b}) + (-${10 - b})] = ${a}\\times(-10)$`),
          T(`$= ${-a * 10}$`),
        ),
        sp: 'm',
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
      return { q: T(`Calculate $${frT(A)} ${op} ${frP(B)}$. Give the answer in its simplest form.`, `Hitung $${frT(A)} ${op} ${frP(B)}$. Berikan jawapan dalam bentuk termudah.`), a: T(`$${frT(v)}$`), w: W(...frAddSteps(A, op, B)), sp: 's' };
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
        a: T(`$${Fr.tex(F)}$`),
        w: W(
          T(`Each unit is divided into ${d} equal parts, so one small step is $\\dfrac{1}{${d}}$.`, `Setiap unit dibahagikan kepada ${d} bahagian yang sama, jadi satu langkah kecil ialah $\\dfrac{1}{${d}}$.`),
          T(`$P$ is ${Math.abs(k)} step${Math.abs(k) === 1 ? '' : 's'} to the ${k < 0 ? 'left' : 'right'} of $0$: $P = ${frRaw(k, d)}$`, `$P$ berada ${Math.abs(k)} langkah ke ${k < 0 ? 'kiri' : 'kanan'} $0$: $P = ${frRaw(k, d)}$`),
          ...(frRaw(k, d) === frT(F) ? [] : [T(`Simplify: $${frRaw(k, d)} = ${frT(F)}$`, `Permudahkan: $${frRaw(k, d)} = ${frT(F)}$`)]),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const d = r.int(4, 12);
      const [a, b] = r.distinct(2, 1, d - 1);
      const A = Fr.neg(fr(a, d)), B = Fr.neg(fr(b, d));
      const sym = Fr.cmp(A, B) < 0 ? '<' : '>';
      const D = lcm(A.d, B.d);
      const an = A.n * (D / A.d), bn = B.n * (D / B.d);
      return {
        q: T(`Fill in the blank with $<$ or $>$: $${frT(A)}\\ \\square\\ ${frT(B)}$`, `Isi tempat kosong dengan $<$ atau $>$: $${frT(A)}\\ \\square\\ ${frT(B)}$`),
        a: T(`$${frT(A)} ${sym} ${frT(B)}$`),
        w: W(
          T(`Common denominator $${D}$: $${frRaw(an, D)}$ and $${frRaw(bn, D)}$`, `Penyebut sepunya $${D}$: $${frRaw(an, D)}$ dan $${frRaw(bn, D)}$`),
          T(`Both are negative, so the one further from zero is the smaller: $${n(an)} ${sym} ${n(bn)}$.`, `Kedua-duanya negatif, jadi yang lebih jauh daripada sifar adalah lebih kecil: $${n(an)} ${sym} ${n(bn)}$.`),
          T(`$${frT(A)} ${sym} ${frT(B)}$`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const d = r.int(3, 9);
      const w = r.int(1, 3);
      const nu = r.int(1, d - 1);
      const F = fr(w * d + nu, d);
      const toMixed = r.chance();
      return toMixed
        ? {
          q: T(`Express $\\dfrac{${w * d + nu}}{${d}}$ as a mixed number.`, `Ungkapkan $\\dfrac{${w * d + nu}}{${d}}$ sebagai nombor bercampur.`),
          a: T(`$${w}\\dfrac{${nu}}{${d}}$`),
          w: W(
            T(`Divide the numerator by the denominator: $${w * d + nu} \\div ${d} = ${w}$ remainder $${nu}$.`, `Bahagi pengangka dengan penyebut: $${w * d + nu} \\div ${d} = ${w}$ baki $${nu}$.`),
            T(`The quotient is the whole number and the remainder stays over $${d}$: $\\dfrac{${w * d + nu}}{${d}} = ${w}\\dfrac{${nu}}{${d}}$`, `Hasil bahagi menjadi nombor bulat dan bakinya kekal di atas $${d}$: $\\dfrac{${w * d + nu}}{${d}} = ${w}\\dfrac{${nu}}{${d}}$`),
          ),
          sp: 'xs',
        }
        : {
          q: T(`Express $${w}\\dfrac{${nu}}{${d}}$ as an improper fraction.`, `Ungkapkan $${w}\\dfrac{${nu}}{${d}}$ sebagai pecahan tak wajar.`),
          a: T(`$\\dfrac{${w * d + nu}}{${d}}$`),
          w: W(
            T(`Multiply the whole number by the denominator and add the numerator: $${w} \\times ${d} + ${nu} = ${w * d + nu}$`, `Darab nombor bulat dengan penyebut dan tambah pengangka: $${w} \\times ${d} + ${nu} = ${w * d + nu}$`),
            T(`Keep the same denominator: $${w}\\dfrac{${nu}}{${d}} = \\dfrac{${w * d + nu}}{${d}}$`, `Kekalkan penyebut yang sama: $${w}\\dfrac{${nu}}{${d}} = \\dfrac{${w * d + nu}}{${d}}$`),
          ),
          sp: 'xs',
        };
    },
  ];
  const g13m = [
    (r) => {
      const A = fracRand(r, 9, true, true), B = fracRand(r, 9, true, true);
      need(A.d !== B.d);
      const op = r.pick(['+', '-', '\\times', '\\div']);
      const v = op === '+' ? Fr.add(A, B) : op === '-' ? Fr.sub(A, B) : op === '\\times' ? Fr.mul(A, B) : Fr.div(A, B);
      const steps = op === '+' || op === '-' ? frAddSteps(A, op, B) : frMulSteps(A, op, B);
      return { q: T(`Calculate $${frT(A)} ${op} ${frP(B)}$.`, `Hitung $${frT(A)} ${op} ${frP(B)}$.`), a: T(`$${Fr.mixed(v)}$`), w: W(...steps, ...mixedLine(v)), sp: 's' };
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
      return { q: T(`Arrange $${vals.map(frT).join(',\\ ')}$ in ${ascDesc(asc).en}.`, `Susun $${vals.map(frT).join(',\\ ')}$ mengikut ${ascDesc(asc).ms}.`), a: T(`$${s.map(frT).join(',\\ ')}$`), w: W(...frOrderSteps(vals, s, asc)), sp: 's' };
    },
    (r) => {
      const w1 = r.int(1, 3), w2 = r.int(1, 3);
      const A = fr(w1 * 4 + 1, 4), B = fr(w2 * 3 + 2, 3);
      const op = r.pick(['+', '-']);
      const a1 = fr(r.int(1, 3), r.pick([2, 3, 4])), b1 = fr(r.int(1, 4), r.pick([3, 5, 6]));
      const X = Fr.add(fr(w1, 1), a1), Y = Fr.add(fr(w2, 1), b1);
      const v = op === '+' ? Fr.add(X, Y) : Fr.sub(X, Y);
      const conv = [X, Y].filter((f) => Fr.mixed(f) !== frT(f));
      return {
        q: T(`Calculate $${Fr.mixed(X)} ${op} ${Fr.mixed(Y)}$.`, `Hitung $${Fr.mixed(X)} ${op} ${Fr.mixed(Y)}$.`),
        a: T(`$${Fr.mixed(v)}$`),
        w: W(
          ...(conv.length ? [T(`Change to improper fractions: $${conv.map((f) => `${Fr.mixed(f)} = ${frT(f)}`).join('$, $')}$`, `Tukar kepada pecahan tak wajar: $${conv.map((f) => `${Fr.mixed(f)} = ${frT(f)}`).join('$, $')}$`)] : []),
          ...frAddSteps(X, op, Y),
          ...mixedLine(v),
        ),
        sp: 's',
      };
    },
  ];
  const g13a = [
    (r) => {
      const A = fracRand(r, 6, true, true), B = fracRand(r, 6, true, true), C = fracRand(r, 6, true, true);
      const brackets = T('Work out the brackets first.', 'Selesaikan kurungan terlebih dahulu.');
      const f = r.pick([
        [`(${frT(A)} + ${frP(B)}) \\div ${frP(C)}`, () => Fr.div(Fr.add(A, B), C), () => {
          const S1 = Fr.add(A, B), R = recip(C);
          return [brackets, T(`$${frT(A)} + ${frP(B)} = ${frT(S1)}$`),
            T(`Dividing by $${frT(C)}$ is multiplying by its reciprocal $${frT(R)}$.`, `Membahagi dengan $${frT(C)}$ ialah mendarab dengan salingannya $${frT(R)}$.`),
            T(`$${frT(S1)} \\times ${frP(R)} = ${frT(Fr.mul(S1, R))}$`)];
        }],
        [`${frT(A)} \\times ${frP(B)} - ${frP(C)}`, () => Fr.sub(Fr.mul(A, B), C), () => {
          const P1 = Fr.mul(A, B);
          return [T('Multiply before you subtract.', 'Darab sebelum tolak.'), T(`$${frT(A)} \\times ${frP(B)} = ${frT(P1)}$`), T(`$${frT(P1)} - ${frP(C)} = ${frT(Fr.sub(P1, C))}$`)];
        }],
        [`${frT(A)} - ${frP(B)} \\div ${frP(C)}`, () => Fr.sub(A, Fr.div(B, C)), () => {
          const R = recip(C), Q1 = Fr.div(B, C);
          return [T('Divide before you subtract.', 'Bahagi sebelum tolak.'), T(`$${frT(B)} \\div ${frP(C)} = ${frT(B)} \\times ${frP(R)} = ${frT(Q1)}$`), T(`$${frT(A)} - ${frP(Q1)} = ${frT(Fr.sub(A, Q1))}$`)];
        }],
        [`(${frT(A)} - ${frP(B)}) \\times ${frP(C)}`, () => Fr.mul(Fr.sub(A, B), C), () => {
          const S1 = Fr.sub(A, B);
          return [brackets, T(`$${frT(A)} - ${frP(B)} = ${frT(S1)}$`), T(`$${frT(S1)} \\times ${frP(C)} = ${frT(Fr.mul(S1, C))}$`)];
        }],
      ]);
      need(C.n !== 0);
      const v = f[1]();
      need(Math.abs(v.n) < 60 && v.d < 200);
      return { q: T(`Evaluate $${f[0]}$. Give your answer in the simplest form.`, `Hitung $${f[0]}$. Berikan jawapan dalam bentuk termudah.`), a: T(`$${Fr.mixed(v)}$`), w: W(...f[2](), ...mixedLine(v)), sp: 'm' };
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
        a: T(`RM${ans.n}`),
        w: W(
          T(`Fraction spent $= ${frT(f1)} + ${frT(f2)} = ${frT(used)}$`, `Pecahan yang dibelanjakan $= ${frT(f1)} + ${frT(f2)} = ${frT(used)}$`),
          T(`Fraction left $= 1 - ${frT(used)} = ${frT(rest)}$`, `Pecahan yang tinggal $= 1 - ${frT(used)} = ${frT(rest)}$`),
          T(`Money left $= ${frT(rest)} \\times ${total} = ${ans.n}$`, `Wang yang tinggal $= ${frT(rest)} \\times ${total} = ${ans.n}$`),
          T(`RM${ans.n}`),
        ),
        sp: 'm',
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
        a: T(`$${list.slice().sort(Fr.cmp).map(frT).join(',\\ ')}$`),
        w: W(
          T('All three are negative, so the fraction furthest from zero is the smallest.', 'Ketiga-tiganya negatif, jadi pecahan yang paling jauh daripada sifar adalah yang terkecil.'),
          ...frOrderSteps(list, list.slice().sort(Fr.cmp), true),
        ),
        sp: 'm',
      };
    },
  ];

  /* ---- decimals */
  const dec = (h, dp) => n(round(h / Math.pow(10, dp), dp));
  const decP = (v) => (v < 0 ? '(' + n(v) + ')' : n(v));
  /** steps for a + b or a - b with signed decimals, ending at the answer */
  const decAddSteps = (a, op, b) => {
    const c = op === '+' ? b : -b;
    const v = round(a + c, 6);
    const out = [];
    if (op === '-') out.push(T(`Subtracting a number is adding its opposite: $${n(a)} - ${decP(b)} = ${n(a)} + ${decP(c)}$`, `Menolak suatu nombor bermaksud menambah songsangannya: $${n(a)} - ${decP(b)} = ${n(a)} + ${decP(c)}$`));
    if (v === 0) out.push(T('The two values are equal but the signs are opposite, so they cancel.', 'Kedua-dua nilai sama tetapi tandanya bertentangan, jadi ia saling menghapuskan.'));
    else if ((a < 0) === (c < 0)) out.push(T(`Same signs: add the values, $${n(Math.abs(a))} + ${n(Math.abs(c))} = ${n(Math.abs(v))}$, and keep the ${a < 0 ? 'minus' : 'plus'} sign.`, `Tanda sama: tambah nilainya, $${n(Math.abs(a))} + ${n(Math.abs(c))} = ${n(Math.abs(v))}$, dan kekalkan tanda ${a < 0 ? 'tolak' : 'tambah'}.`));
    else out.push(T(`Different signs: subtract the smaller value from the larger, $${n(Math.max(Math.abs(a), Math.abs(c)))} - ${n(Math.min(Math.abs(a), Math.abs(c)))} = ${n(Math.abs(v))}$, and keep the sign of $${n(Math.abs(a) > Math.abs(c) ? a : c)}$.`, `Tanda berbeza: tolak nilai yang lebih kecil daripada yang lebih besar, $${n(Math.max(Math.abs(a), Math.abs(c)))} - ${n(Math.min(Math.abs(a), Math.abs(c)))} = ${n(Math.abs(v))}$, dan kekalkan tanda bagi $${n(Math.abs(a) > Math.abs(c) ? a : c)}$.`));
    out.push(T(`$${n(a)} ${op} ${decP(b)} = ${n(v)}$`));
    return out;
  };
  /** the sign rule for a product or a quotient of two signed numbers */
  const decSign = (a, b, prod) => (a === 0 || b === 0
    ? T('One of the numbers is $0$, so the result is $0$.', 'Salah satu nombor ialah $0$, jadi hasilnya ialah $0$.')
    : signRule((a < 0) !== (b < 0), prod ? 'product' : 'quotient'));
  /** steps for a × b with signed decimals */
  const decMulSteps = (a, b) => {
    const v = round(a * b, 6);
    return [
      decSign(a, b, true),
      T(`Multiply the values: $${n(Math.abs(a))} \\times ${n(Math.abs(b))} = ${n(Math.abs(v))}$`, `Darab nilainya: $${n(Math.abs(a))} \\times ${n(Math.abs(b))} = ${n(Math.abs(v))}$`),
      T(`$${n(a)} \\times ${decP(b)} = ${n(v)}$`),
    ];
  };
  const g14e = [
    (r) => {
      const dp = r.pick([1, 2]);
      const a = r.nz(-90, 90) / Math.pow(10, dp), b = r.nz(-90, 90) / Math.pow(10, dp);
      const op = r.pick(['+', '-']);
      const v = round(op === '+' ? a + b : a - b, dp);
      return { q: T(`Calculate $${n(a)} ${op} ${decP(b)}$.`, `Hitung $${n(a)} ${op} ${decP(b)}$.`), a: T(`$${n(v)}$`), w: W(...decAddSteps(a, op, b)), sp: 'xs' };
    },
    (r) => {
      const a = r.nz(-9, 9) / 10, b = r.nz(-9, 9);
      return { q: T(`Calculate $${n(a)} \\times ${par(b)}$.`, `Hitung $${n(a)} \\times ${par(b)}$.`), a: T(`$${n(round(a * b, 1))}$`), w: W(...decMulSteps(a, b)), sp: 'xs' };
    },
    (r) => {
      const a = r.int(-9, 9), lo = -r.int(2, 4), hi = r.int(2, 4);
      const v = r.int(lo * 10 + 1, hi * 10 - 1);
      need(v % 10 !== 0);
      return {
        q: T('State the decimal represented by $P$ on the number line.', 'Nyatakan perpuluhan yang diwakili oleh $P$ pada garis nombor.'),
        fig: S.numberLine({ min: lo, max: hi, step: 0.1, labels: (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : null), points: [{ v: v / 10, label: 'P' }], width: 460 }),
        a: T(`$${n(v / 10)}$`),
        w: W(
          T(`Each unit is divided into $10$ equal parts, so one small mark is $0.1$.`, `Setiap unit dibahagikan kepada $10$ bahagian yang sama, jadi satu tanda kecil ialah $0.1$.`),
          T(`$P$ is ${v - 10 * Math.floor(v / 10)} marks to the right of $${Math.floor(v / 10)}$: $${Math.floor(v / 10)} + ${v - 10 * Math.floor(v / 10)} \\times 0.1 = ${n(v / 10)}$`, `$P$ berada ${v - 10 * Math.floor(v / 10)} tanda ke kanan $${Math.floor(v / 10)}$: $${Math.floor(v / 10)} + ${v - 10 * Math.floor(v / 10)} \\times 0.1 = ${n(v / 10)}$`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const a = r.nz(-90, 90) / 100, b = r.nz(-90, 90) / 100;
      need(a !== b);
      const s = a < b ? '<' : '>';
      return {
        q: T(`Fill in the blank with $<$ or $>$: $${n(a)}\\ \\square\\ ${n(b)}$`, `Isi tempat kosong dengan $<$ atau $>$: $${n(a)}\\ \\square\\ ${n(b)}$`),
        a: T(`$${n(a)} ${s} ${n(b)}$`),
        w: W(
          (a < 0) !== (b < 0)
            ? T(`$${n(a)}$ is ${a < 0 ? 'negative' : 'positive'} and $${n(b)}$ is ${b < 0 ? 'negative' : 'positive'}; on a number line every negative number lies to the left of every positive number.`, `$${n(a)}$ ialah ${a < 0 ? 'negatif' : 'positif'} dan $${n(b)}$ ialah ${b < 0 ? 'negatif' : 'positif'}; pada garis nombor setiap nombor negatif terletak di sebelah kiri setiap nombor positif.`)
            : a < 0
              ? T(`Both are negative, so the one further from zero is the smaller: $${n(-a)}$ against $${n(-b)}$.`, `Kedua-duanya negatif, jadi yang lebih jauh daripada sifar adalah lebih kecil: $${n(-a)}$ berbanding $${n(-b)}$.`)
              : T(`Both are positive, so compare the digits after the decimal point: $${n(a)}$ against $${n(b)}$.`, `Kedua-duanya positif, jadi bandingkan digit selepas titik perpuluhan: $${n(a)}$ berbanding $${n(b)}$.`),
          T(`$${n(a)} ${s} ${n(b)}$`),
        ),
        sp: 'xs',
      };
    },
  ];
  const g14m = [
    (r) => {
      const a = r.nz(-500, 500) / 100, b = r.nz(-90, 90) / 10;
      const op = r.pick(['+', '-']);
      const v = round(op === '+' ? a + b : a - b, 2);
      return { q: T(`Calculate $${n(a)} ${op} ${decP(b)}$.`, `Hitung $${n(a)} ${op} ${decP(b)}$.`), a: T(`$${n(v)}$`), w: W(T('Line up the decimal points and work with the values first, then decide the sign.', 'Jajarkan titik perpuluhan dan kira nilainya dahulu, kemudian tentukan tandanya.'), ...decAddSteps(a, op, b)), sp: 's' };
    },
    (r) => {
      const a = r.nz(-90, 90) / 10, b = r.nz(-90, 90) / 10;
      const op = r.pick(['\\times', '\\div']);
      if (op === '\\div') {
        const q = r.nz(-40, 40) / 10, dvs = r.nz(-9, 9) / 10;
        const dd = round(q * dvs, 2);
        return {
          q: T(`Calculate $${n(dd)} \\div ${decP(dvs)}$.`, `Hitung $${n(dd)} \\div ${decP(dvs)}$.`),
          a: T(`$${n(q)}$`),
          w: W(
            decSign(dd, dvs, false),
            T(`Multiply both numbers by $10$ so that the divisor is a whole number: $${n(Math.abs(round(dd * 10, 2)))} \\div ${n(Math.abs(dvs * 10))}$`, `Darab kedua-dua nombor dengan $10$ supaya pembahaginya nombor bulat: $${n(Math.abs(round(dd * 10, 2)))} \\div ${n(Math.abs(dvs * 10))}$`),
            T(`$= ${n(Math.abs(q))}$, so $${n(dd)} \\div ${decP(dvs)} = ${n(q)}$`, `$= ${n(Math.abs(q))}$, maka $${n(dd)} \\div ${decP(dvs)} = ${n(q)}$`),
          ),
          sp: 's',
        };
      }
      return { q: T(`Calculate $${n(a)} \\times ${decP(b)}$.`, `Hitung $${n(a)} \\times ${decP(b)}$.`), a: T(`$${n(round(a * b, 2))}$`), w: W(...decMulSteps(a, b)), sp: 's' };
    },
    (r) => {
      const vals = r.distinct(4, -300, 300).map((x) => round(x / r.pick([10, 100]), 2));
      need(new Set(vals).size === 4);
      const asc = r.chance();
      const s = vals.slice().sort((x, y) => (asc ? x - y : y - x));
      return {
        q: T(`Arrange $${vals.join(',\\ ')}$ in ${ascDesc(asc).en}.`, `Susun $${vals.join(',\\ ')}$ mengikut ${ascDesc(asc).ms}.`),
        a: T(`$${s.join(',\\ ')}$`),
        w: W(
          T('Every negative number is smaller than every positive one; among negatives, the one further from zero is the smaller.', 'Setiap nombor negatif lebih kecil daripada setiap nombor positif; antara nombor negatif, yang lebih jauh daripada sifar adalah lebih kecil.'),
          T(`Place them on a number line and read them off ${orderWord(asc).en}: $${s.join(',\\ ')}$`, `Letakkannya pada garis nombor dan baca mengikut ${orderWord(asc).ms}: $${s.join(',\\ ')}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = r.nz(-90, 90) / 10, b = r.nz(-9, 9) / 10, c = r.nz(-9, 9);
      const v = round(a + b * c, 2);
      const p = round(b * c, 2);
      return {
        q: T(`Evaluate $${n(a)} + ${decP(b)} \\times ${par(c)}$.`, `Hitung $${n(a)} + ${decP(b)} \\times ${par(c)}$.`),
        a: T(`$${n(v)}$`),
        w: W(
          T('Multiply before you add.', 'Darab sebelum tambah.'),
          T(`$${decP(b)} \\times ${par(c)} = ${n(p)}$`),
          ...decAddSteps(a, '+', p),
        ),
        sp: 's',
      };
    },
  ];
  const g14a = [
    (r) => {
      const a = r.nz(-90, 90) / 10, b = r.nz(-90, 90) / 10, c = r.nz(-9, 9) / 10;
      const f = r.pick([
        [`(${n(a)} + ${decP(b)}) \\times ${decP(c)}`, (a + b) * c, () => {
          const s1 = round(a + b, 2);
          return [T('Work out the brackets first.', 'Selesaikan kurungan terlebih dahulu.'), T(`$${n(a)} + ${decP(b)} = ${n(s1)}$`), ...decMulSteps(s1, c)];
        }],
        [`${n(a)} \\times ${decP(b)} - ${decP(c)}`, a * b - c, () => {
          const p1 = round(a * b, 2);
          return [T('Multiply before you subtract.', 'Darab sebelum tolak.'), T(`$${n(a)} \\times ${decP(b)} = ${n(p1)}$`), ...decAddSteps(p1, '-', c)];
        }],
        [`(${n(a)} - ${decP(b)}) \\div ${decP(c)}`, (a - b) / c, () => {
          const s1 = round(a - b, 2), qq = round(s1 / c, 4);
          return [T('Work out the brackets first.', 'Selesaikan kurungan terlebih dahulu.'), T(`$${n(a)} - ${decP(b)} = ${n(s1)}$`), decSign(s1, c, false),
            T(`$${n(Math.abs(s1))} \\div ${n(Math.abs(c))} = ${n(Math.abs(qq))}$, so $${n(s1)} \\div ${decP(c)} = ${n(qq)}$`, `$${n(Math.abs(s1))} \\div ${n(Math.abs(c))} = ${n(Math.abs(qq))}$, maka $${n(s1)} \\div ${decP(c)} = ${n(qq)}$`)];
        }],
      ]);
      const v = round(f[1], 4);
      need(Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-7);
      return { q: T(`Evaluate $${f[0]}$.`, `Hitung $${f[0]}$.`), a: T(`$${n(v)}$`), w: W(...f[2]()), sp: 'm' };
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
        a: T(`$${n(v)}$ (overdrawn by ${rm(-v, 2)})`, `$${n(v)}$ (terlebih keluar ${rm(-v, 2)})`),
        w: W(
          T('Payments are subtracted and the deposit is added.', 'Bayaran ditolak dan deposit ditambah.'),
          T(`Total paid out $= ${n(spend1)} + ${n(spend2)} = ${n(round(spend1 + spend2, 2))}$`, `Jumlah bayaran $= ${n(spend1)} + ${n(spend2)} = ${n(round(spend1 + spend2, 2))}$`),
          T(`Balance $= ${n(bal)} - ${n(round(spend1 + spend2, 2))} + ${dep} = ${n(v)}$`, `Baki $= ${n(bal)} - ${n(round(spend1 + spend2, 2))} + ${dep} = ${n(v)}$`),
          T(`The balance is negative, so the account is overdrawn by ${rm(-v, 2)}.`, `Baki adalah negatif, jadi akaun itu terlebih keluar sebanyak ${rm(-v, 2)}.`),
        ),
        sp: 'm',
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
        a: T(pick.map((p) => `$${p[0]} = ${p[1]}$`).join('; ')),
        w: W(
          T('An integer $k$ is already rational: write it as $\\dfrac{k}{1}$.', 'Integer $k$ memang nombor nisbah: tulisnya sebagai $\\dfrac{k}{1}$.'),
          T('A terminating decimal is written with the digits over $10$, $100$ or $1000$ and then simplified; a fraction is already in the required form.', 'Perpuluhan tamat ditulis dengan digitnya di atas $10$, $100$ atau $1000$ kemudian dipermudahkan; pecahan sudah pun dalam bentuk yang dikehendaki.'),
          T(pick.map((p) => `$${p[0]} = ${p[1]}$`).join('; ')),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = r.int(-9, 9);
      const vals = [`${a}`, `\\dfrac{${r.int(1, 5)}}{${r.int(6, 9)}}`, `${r.int(1, 9) / 10}`, `-${r.int(1, 9) / 4}`];
      return {
        q: T(`True or false: every integer is a rational number. Give an example.`, `Betul atau salah: setiap integer ialah nombor nisbah. Berikan satu contoh.`),
        a: T(`True. For example, $${a} = \\dfrac{${a}}{1}$.`, `Betul. Contohnya, $${a} = \\dfrac{${a}}{1}$.`),
        w: W(
          T('A rational number is any number that can be written as $\\dfrac{a}{b}$ with $a$ and $b$ integers and $b \\neq 0$.', 'Nombor nisbah ialah sebarang nombor yang boleh ditulis sebagai $\\dfrac{a}{b}$ dengan $a$ dan $b$ ialah integer dan $b \\neq 0$.'),
          T(`Every integer fits this form with denominator $1$, for example $${a} = \\dfrac{${a}}{1}$, so the statement is true.`, `Setiap integer menepati bentuk ini dengan penyebut $1$, contohnya $${a} = \\dfrac{${a}}{1}$, jadi pernyataan itu betul.`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const a = r.pick([0.5, 0.25, 0.75, 0.2, 0.4, 0.6, 0.8, 0.125]);
      const f = fr(Math.round(a * 1000), 1000);
      const s = r.chance() ? -1 : 1;
      const F = s < 0 ? Fr.neg(f) : f;
      const dp = String(a).split('.')[1].length;
      const den = Math.pow(10, dp);
      const num = s * Math.round(a * den);
      const gg = gcd(Math.abs(num), den);
      return {
        q: T(`Express $${n(s * a)}$ as a fraction in its simplest form.`, `Ungkapkan $${n(s * a)}$ sebagai pecahan dalam bentuk termudah.`),
        a: T(`$${frT(F)}$`),
        w: W(
          T(`There ${dp === 1 ? 'is 1 digit' : 'are ' + dp + ' digits'} after the decimal point, so write the number over $${den}$: $${n(s * a)} = ${frRaw(num, den)}$`, `Terdapat ${dp} digit selepas titik perpuluhan, jadi tulis nombor itu di atas $${den}$: $${n(s * a)} = ${frRaw(num, den)}$`),
          T(`Divide the numerator and the denominator by $${gg}$: $${frRaw(num, den)} = ${frT(F)}$`, `Bahagi pengangka dan penyebut dengan $${gg}$: $${frRaw(num, den)} = ${frT(F)}$`),
        ),
        sp: 'xs',
      };
    },
  ];
  const g15m = [
    (r) => {
      const items = r.sample([
        [-0.75, '-0.75'], [-1 / 2, '-\\dfrac{1}{2}'], [2 / 3, '\\dfrac{2}{3}'], [0.6, '0.6'], [-1, '-1'], [5 / 4, '\\dfrac{5}{4}'], [-0.3, '-0.3'], [3 / 8, '\\dfrac{3}{8}'], [1.2, '1.2'], [-5 / 6, '-\\dfrac{5}{6}'],
      ], r.int(4, 5));
      const asc = r.chance();
      const s = items.slice().sort((x, y) => (asc ? x[0] - y[0] : y[0] - x[0]));
      const eqn = (x) => (Math.abs(round(x[0], 4) - x[0]) < 1e-12 ? `${x[1]} = ${n(round(x[0], 4))}` : `${x[1]} \\approx ${fx(x[0], 3)}`);
      return {
        q: T(`Arrange $${items.map((x) => x[1]).join(',\\ ')}$ in ${ascDesc(asc).en}.`, `Susun $${items.map((x) => x[1]).join(',\\ ')}$ mengikut ${ascDesc(asc).ms}.`),
        a: T(`$${s.map((x) => x[1]).join(',\\ ')}$`),
        w: W(
          T('Change every number to a decimal so that they can be compared directly.', 'Tukarkan setiap nombor kepada perpuluhan supaya ia boleh dibandingkan terus.'),
          T(`$${items.map(eqn).join('$, $')}$`),
          T(`Take them ${orderWord(asc).en}: $${s.map((x) => x[1]).join(',\\ ')}$`, `Ambil mengikut ${orderWord(asc).ms}: $${s.map((x) => x[1]).join(',\\ ')}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = fr(r.nz(-5, 5), r.pick([2, 4, 5])), b = r.nz(-9, 9) / 10, c = r.nz(-3, 3);
      const B = fr(Math.round(b * 10), 10);
      const S1 = Fr.add(a, B);
      const v = Fr.mul(S1, fr(c, 1));
      return {
        q: T(`Evaluate $(${frT(a)} + ${decP(b)}) \\times ${par(c)}$. Give your answer as a fraction in its simplest form.`, `Hitung $(${frT(a)} + ${decP(b)}) \\times ${par(c)}$. Berikan jawapan sebagai pecahan dalam bentuk termudah.`),
        a: T(`$${Fr.mixed(v)}$`),
        w: W(
          T(`Change the decimal to a fraction: $${n(b)} = ${frRaw(Math.round(b * 10), 10)}${frRaw(Math.round(b * 10), 10) === frT(B) ? '' : ' = ' + frT(B)}$`, `Tukar perpuluhan kepada pecahan: $${n(b)} = ${frRaw(Math.round(b * 10), 10)}${frRaw(Math.round(b * 10), 10) === frT(B) ? '' : ' = ' + frT(B)}$`),
          T('Work out the brackets first.', 'Selesaikan kurungan terlebih dahulu.'),
          T(`$${frT(a)} + ${frP(B)} = ${frT(S1)}$`),
          T(`$${frT(S1)} \\times ${par(c)} = ${frT(v)}$`),
          ...mixedLine(v),
        ),
        sp: 'm',
      };
    },
  ];
  const g15a = [
    (r) => {
      const [lo, hi] = r.pick([[fr(-1, 3), fr(-1, 4)], [fr(1, 5), fr(1, 4)], [fr(-2, 3), fr(-3, 5)], [fr(-1, 2), fr(-2, 5)]]);
      const mid = Fr.div(Fr.add(lo, hi), fr(2, 1));
      return {
        q: T(`Find a rational number between $${frT(lo)}$ and $${frT(hi)}$. Show that your answer lies between them.`, `Cari satu nombor nisbah di antara $${frT(lo)}$ dan $${frT(hi)}$. Tunjukkan bahawa jawapan anda terletak di antara kedua-duanya.`),
        a: T(`For example $${frT(mid)}$ (the mean of the two numbers)`, `Contohnya $${frT(mid)}$ (min bagi kedua-dua nombor)`),
        w: W(
          T('The mean of two different numbers always lies between them, so take their mean.', 'Min bagi dua nombor berbeza sentiasa terletak di antara kedua-duanya, jadi ambil minnya.'),
          T(`$\\left(${frT(lo)} + ${frP(hi)}\\right) \\div 2 = ${frT(Fr.add(lo, hi))} \\div 2 = ${frT(mid)}$`),
          T(`Check with a common denominator $${lcm(lcm(lo.d, hi.d), mid.d)}$: $${frRaw(lo.n * (lcm(lcm(lo.d, hi.d), mid.d) / lo.d), lcm(lcm(lo.d, hi.d), mid.d))} < ${frRaw(mid.n * (lcm(lcm(lo.d, hi.d), mid.d) / mid.d), lcm(lcm(lo.d, hi.d), mid.d))} < ${frRaw(hi.n * (lcm(lcm(lo.d, hi.d), mid.d) / hi.d), lcm(lcm(lo.d, hi.d), mid.d))}$`,
            `Semak dengan penyebut sepunya $${lcm(lcm(lo.d, hi.d), mid.d)}$: $${frRaw(lo.n * (lcm(lcm(lo.d, hi.d), mid.d) / lo.d), lcm(lcm(lo.d, hi.d), mid.d))} < ${frRaw(mid.n * (lcm(lcm(lo.d, hi.d), mid.d) / mid.d), lcm(lcm(lo.d, hi.d), mid.d))} < ${frRaw(hi.n * (lcm(lcm(lo.d, hi.d), mid.d) / hi.d), lcm(lcm(lo.d, hi.d), mid.d))}$`),
        ),
        sp: 'm',
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
        q: T(`${p} received an allowance of RM${total}. ${p} spent $${frT(spend)}$ of the allowance and then gave $${n(dec1)}$ of the original allowance to a friend. How much money does ${p} have left?`, `${p} menerima elaun RM${total}. ${p} membelanjakan $${frT(spend)}$ daripada elaun itu dan kemudian memberikan $${n(dec1)}$ daripada elaun asal kepada seorang kawan. Berapakah wang yang tinggal pada ${p}?`),
        a: T(`RM${n(ans)}`),
        w: W(
          T('Both shares are taken from the original allowance, so work each one out separately.', 'Kedua-dua bahagian diambil daripada elaun asal, jadi kira setiap satu secara berasingan.'),
          T(`Spent $= ${total} \\times ${frT(spend)} = ${n(total * Fr.val(spend))}$`, `Dibelanjakan $= ${total} \\times ${frT(spend)} = ${n(total * Fr.val(spend))}$`),
          T(`Given away $= ${total} \\times ${n(dec1)} = ${n(total * dec1)}$`, `Diberikan $= ${total} \\times ${n(dec1)} = ${n(total * dec1)}$`),
          T(`Left $= ${total} - ${n(total * Fr.val(spend))} - ${n(total * dec1)} = ${n(ans)}$`, `Tinggal $= ${total} - ${n(total * Fr.val(spend))} - ${n(total * dec1)} = ${n(ans)}$`),
          T(`RM${n(ans)}`),
        ),
        sp: 'm',
      };
    },
  ];
  const g15Ee = [
    (r) => {
      const d = r.int(1, 8);
      const F = fr(d, 9);
      return {
        q: T(`Express $0.\\overline{${d}}$ as a fraction in its simplest form.`, `Ungkapkan $0.\\overline{${d}}$ sebagai pecahan dalam bentuk termudah.`),
        a: T(`$${frT(F)}$`),
        w: W(
          T(`Let $x = 0.${d}${d}${d}\\ldots$`, `Katakan $x = 0.${d}${d}${d}\\ldots$`),
          T(`One digit repeats, so multiply by $10$: $10x = ${d}.${d}${d}${d}\\ldots$`, `Satu digit berulang, jadi darab dengan $10$: $10x = ${d}.${d}${d}${d}\\ldots$`),
          T(`Subtract: $10x - x = ${d}$, so $9x = ${d}$`, `Tolak: $10x - x = ${d}$, jadi $9x = ${d}$`),
          T(`$x = \\dfrac{${d}}{9}${`\\dfrac{${d}}{9}` === frT(F) ? '' : ' = ' + frT(F)}$`),
        ),
        sp: 's',
      };
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
        a: T(`${rm(total - cost)}`),
        w: W(
          T(`Total saved $= ${w} \\times ${months} = ${total}$`, `Jumlah simpanan $= ${w} \\times ${months} = ${total}$`),
          T(`Savings left $= ${total} - ${cost} = ${total - cost}$`, `Simpanan yang tinggal $= ${total} - ${cost} = ${total - cost}$`),
          T(`${rm(total - cost)}`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const d = r.int(1, 8);
      const e = r.pick([3, 6, 7, 8]);
      const F = fr(d, 9);
      return {
        q: T(`Express $0.\\overline{${d}}$ as a fraction in its simplest form, and hence find $0.\\overline{${d}} \\times 9$.`, `Ungkapkan $0.\\overline{${d}}$ sebagai pecahan dalam bentuk termudah, dan seterusnya cari $0.\\overline{${d}} \\times 9$.`),
        a: T(`$${frT(F)}$; $${d}$`),
        w: W(
          T(`Let $x = 0.${d}${d}${d}\\ldots$, then $10x = ${d}.${d}${d}${d}\\ldots$`, `Katakan $x = 0.${d}${d}${d}\\ldots$, maka $10x = ${d}.${d}${d}${d}\\ldots$`),
          T(`$10x - x = ${d}$, so $9x = ${d}$ and $x = \\dfrac{${d}}{9}${`\\dfrac{${d}}{9}` === frT(F) ? '' : ' = ' + frT(F)}$`, `$10x - x = ${d}$, jadi $9x = ${d}$ dan $x = \\dfrac{${d}}{9}${`\\dfrac{${d}}{9}` === frT(F) ? '' : ' = ' + frT(F)}$`),
          T(`Hence $0.\\overline{${d}} \\times 9 = \\dfrac{${d}}{9} \\times 9 = ${d}$`, `Maka $0.\\overline{${d}} \\times 9 = \\dfrac{${d}}{9} \\times 9 = ${d}$`),
        ),
        sp: 's',
      };
    },
  ];
  const g15Ea = [
    (r) => {
      const a = r.int(1, 9), b = r.int(0, 9);
      need(a !== b);
      const num = 10 * a + b;
      const F = fr(num, 99);
      return {
        q: T(`Express $0.\\overline{${a}${b}}$ as a fraction in its simplest form.`, `Ungkapkan $0.\\overline{${a}${b}}$ sebagai pecahan dalam bentuk termudah.`),
        a: T(`$${frT(F)}$`),
        w: W(
          T(`Let $x = 0.${a}${b}${a}${b}\\ldots$`, `Katakan $x = 0.${a}${b}${a}${b}\\ldots$`),
          T(`Two digits repeat, so multiply by $100$: $100x = ${num}.${a}${b}${a}${b}\\ldots$`, `Dua digit berulang, jadi darab dengan $100$: $100x = ${num}.${a}${b}${a}${b}\\ldots$`),
          T(`Subtract: $100x - x = ${num}$, so $99x = ${num}$`, `Tolak: $100x - x = ${num}$, jadi $99x = ${num}$`),
          T(`$x = \\dfrac{${num}}{99}${`\\dfrac{${num}}{99}` === frT(F) ? '' : ' = ' + frT(F)}$`),
        ),
        sp: 'm',
      };
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
        a: T(`RM${total - cost.n}`),
        w: W(
          T(`Total saved $= ${w} \\times ${months} = ${total}$`, `Jumlah simpanan $= ${w} \\times ${months} = ${total}$`),
          T(`Spent $= ${frT(spend)} \\times ${total} = ${cost.n}$`, `Dibelanjakan $= ${frT(spend)} \\times ${total} = ${cost.n}$`),
          T(`Left $= ${total} - ${cost.n} = ${total - cost.n}$`, `Tinggal $= ${total} - ${cost.n} = ${total - cost.n}$`),
          T(`RM${total - cost.n}`),
        ),
        sp: 'm',
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
  /** "$24 \div 2 = 12,\ 12 \div 2 = 6,\ …$" – repeated division by the smallest prime */
  const pfDivChain = (nn) => {
    let x = nn;
    return primeFactors(nn).map((p) => { const t = `${x} \\div ${p} = ${x / p}`; x /= p; return t; }).join(',\\ ');
  };
  /** factor pairs "1 \times 24,\ 2 \times 12,\ …" */
  const pairList = (nn) => {
    const out = [];
    for (let i = 1; i * i <= nn; i++) if (nn % i === 0) out.push(`${i} \\times ${nn / i}`);
    return out.join(',\\ ');
  };
  /** exponents of the prime factorisation, as {prime: power} */
  const pfMap = (x) => { const m = {}; primeFactors(x).forEach((p) => (m[p] = (m[p] || 0) + 1)); return m; };
  /** lines: prime factorisation of each number, then the HCF (hcf = true) or LCM built from the powers */
  const hcfLcmSteps = (nums, hcf) => {
    const maps = nums.map(pfMap);
    const all = [...new Set([].concat(...nums.map((x) => primeFactors(x))))].sort((a, b) => a - b);
    const primes = hcf ? all.filter((p) => maps.every((m) => m[p])) : all;
    const pw = (p) => (hcf ? Math.min.apply(null, maps.map((m) => m[p] || 0)) : Math.max.apply(null, maps.map((m) => m[p] || 0)));
    const expr = primes.length ? primes.map((p) => (pw(p) > 1 ? `${p}^{${pw(p)}}` : `${p}`)).join(' \\times ') : '1';
    const val = primes.reduce((s, p) => s * Math.pow(p, pw(p)), 1);
    return [
      T(`$${nums.map((x) => `${x} = ${facStr(x)}`).join('$, $')}$`),
      hcf
        ? T(`The HCF takes every prime common to all of them, to the lower power: $${expr}${expr === String(val) ? '' : ' = ' + val}$`, `FSTB mengambil setiap faktor perdana yang sepunya, dengan kuasa yang lebih rendah: $${expr}${expr === String(val) ? '' : ' = ' + val}$`)
        : T(`The LCM takes every prime that appears, to the higher power: $${expr}${expr === String(val) ? '' : ' = ' + val}$`, `GSTK mengambil setiap faktor perdana yang muncul, dengan kuasa yang lebih tinggi: $${expr}${expr === String(val) ? '' : ' = ' + val}$`),
    ];
  };
  const g21e = [
    (r) => {
      const nn = r.pick([12, 16, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48]);
      return {
        q: T(`List all the factors of $${nn}$.`, `Senaraikan semua faktor bagi $${nn}$.`),
        a: T(`$${factors(nn).join(',\\ ')}$`),
        w: W(
          T(`Work in pairs whose product is $${nn}$: $${pairList(nn)}$`, `Kira dalam pasangan yang hasil darabnya $${nn}$: $${pairList(nn)}$`),
          T(`Write the numbers in the pairs in order: $${factors(nn).join(',\\ ')}$`, `Tulis nombor dalam pasangan itu mengikut tertib: $${factors(nn).join(',\\ ')}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const k = r.int(3, 12), cnt = 5;
      return {
        q: T(`List the first ${cnt} multiples of $${k}$.`, `Senaraikan ${cnt} gandaan pertama bagi $${k}$.`),
        a: T(`$${[1, 2, 3, 4, 5].map((i) => i * k).join(',\\ ')}$`),
        w: W(
          T(`Multiply $${k}$ by $1, 2, 3, 4, 5$: $${[1, 2, 3, 4, 5].map((i) => `${k} \\times ${i} = ${k * i}`).join(',\\ ')}$`, `Darab $${k}$ dengan $1, 2, 3, 4, 5$: $${[1, 2, 3, 4, 5].map((i) => `${k} \\times ${i} = ${k * i}`).join(',\\ ')}$`),
          T(`$${[1, 2, 3, 4, 5].map((i) => i * k).join(',\\ ')}$`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const pr = r.sample([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47], 2);
      const comp = r.sample([9, 15, 21, 27, 33, 39, 45, 49], 2);
      const list = r.shuffle(pr.concat(comp));
      return {
        q: T(`Which of the following are prime numbers? $${list.join(',\\ ')}$`, `Antara nombor berikut, yang manakah nombor perdana? $${list.join(',\\ ')}$`),
        a: T(`$${list.filter(isPrime).sort((a, b) => a - b).join(',\\ ')}$`),
        w: W(
          T('A prime number has exactly two different factors: $1$ and itself.', 'Nombor perdana mempunyai tepat dua faktor yang berbeza: $1$ dan dirinya sendiri.'),
          T(`These have another factor, so they are not prime: $${list.filter((x) => !isPrime(x)).map((x) => `${x} = ${primeFactors(x)[0]} \\times ${x / primeFactors(x)[0]}`).join('$, $')}$`, `Nombor ini mempunyai faktor lain, jadi ia bukan perdana: $${list.filter((x) => !isPrime(x)).map((x) => `${x} = ${primeFactors(x)[0]} \\times ${x / primeFactors(x)[0]}`).join('$, $')}$`),
          T(`The primes are $${list.filter(isPrime).sort((a, b) => a - b).join(',\\ ')}$.`, `Nombor perdananya ialah $${list.filter(isPrime).sort((a, b) => a - b).join(',\\ ')}$.`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const nn = r.pick([12, 18, 20, 24, 28, 30, 36, 40, 45, 50]);
      return {
        q: T(`Express $${nn}$ as a product of prime factors.`, `Ungkapkan $${nn}$ sebagai hasil darab faktor perdana.`),
        a: T(`$${nn} = ${primeFactors(nn).join(' \\times ')}$`),
        w: W(
          T(`Divide again and again by the smallest prime that fits: $${pfDivChain(nn)}$`, `Bahagi berulang kali dengan nombor perdana terkecil yang sesuai: $${pfDivChain(nn)}$`),
          T(`Multiply the divisors: $${nn} = ${primeFactors(nn).join(' \\times ')}$`, `Darab pembahaginya: $${nn} = ${primeFactors(nn).join(' \\times ')}$`),
        ),
        sp: 's',
      };
    },
  ];
  const g21m = [
    (r) => {
      const nn = r.pick([60, 84, 90, 126, 132, 150, 180, 210, 220, 252, 300, 330, 420, 462]);
      return {
        q: T(`Express $${nn}$ as a product of prime factors. Use a factor tree or repeated division.`, `Ungkapkan $${nn}$ sebagai hasil darab faktor perdana. Gunakan pokok faktor atau pembahagian berulang.`),
        a: T(`$${nn} = ${primeFactors(nn).join(' \\times ')}$`),
        w: W(
          T(`Divide again and again by the smallest prime that fits: $${pfDivChain(nn)}$`, `Bahagi berulang kali dengan nombor perdana terkecil yang sesuai: $${pfDivChain(nn)}$`),
          T(`Stop at $1$ and multiply the divisors: $${nn} = ${primeFactors(nn).join(' \\times ')}$`, `Berhenti pada $1$ dan darab pembahaginya: $${nn} = ${primeFactors(nn).join(' \\times ')}$`),
          T(`In index notation: $${nn} = ${facStr(nn)}$`, `Dalam tatatanda indeks: $${nn} = ${facStr(nn)}$`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const list = r.shuffle([51, 57, 87, 91, 97, 89, 83, 73]).slice(0, 5);
      const bad = list.filter((x) => !isPrime(x));
      return {
        q: T(`Identify the prime numbers among $${list.join(',\\ ')}$. (Hint: check for factors 3, 7, 11 before deciding.)`, `Kenal pasti nombor perdana antara $${list.join(',\\ ')}$. (Petunjuk: semak faktor 3, 7, 11 sebelum membuat keputusan.)`),
        a: T(`$${list.filter(isPrime).join(',\\ ') || '\\text{none}'}$`, `$${list.filter(isPrime).join(',\\ ') || '\\text{tiada}'}$`),
        w: W(
          T('It is enough to test the primes up to the square root of the number: $2, 3, 5, 7$ here, since $11^2 = 121$ is already too big.', 'Memadai menguji nombor perdana sehingga punca kuasa dua nombor itu: $2, 3, 5, 7$ di sini, kerana $11^2 = 121$ sudah terlalu besar.'),
          bad.length
            ? T(`These have a factor, so they are not prime: $${bad.map((x) => `${x} = ${primeFactors(x)[0]} \\times ${x / primeFactors(x)[0]}`).join('$, $')}$`, `Nombor ini mempunyai faktor, jadi ia bukan perdana: $${bad.map((x) => `${x} = ${primeFactors(x)[0]} \\times ${x / primeFactors(x)[0]}`).join('$, $')}$`)
            : T('None of them has such a factor.', 'Tiada satu pun mempunyai faktor sedemikian.'),
          T(`The primes are $${list.filter(isPrime).join(',\\ ') || '\\text{none}'}$.`, `Nombor perdananya ialah $${list.filter(isPrime).join(',\\ ') || '\\text{tiada}'}$.`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const nn = r.pick([72, 96, 108, 120, 144, 160, 200, 240, 360, 450]);
      return {
        q: T(`List all the factors of $${nn}$. How many factors does it have?`, `Senaraikan semua faktor bagi $${nn}$. Berapakah bilangan faktornya?`),
        a: T(`$${factors(nn).join(',\\ ')}$ (${factors(nn).length} factors)`, `$${factors(nn).join(',\\ ')}$ (${factors(nn).length} faktor)`),
        w: W(
          T(`Test $1, 2, 3, \\ldots$ in turn and write each factor with its partner: $${pairList(nn)}$`, `Uji $1, 2, 3, \\ldots$ satu demi satu dan tulis setiap faktor bersama pasangannya: $${pairList(nn)}$`),
          T(`In order: $${factors(nn).join(',\\ ')}$`, `Mengikut tertib: $${factors(nn).join(',\\ ')}$`),
          T(`Counting them gives ${factors(nn).length} factors.`, `Kiraan memberi ${factors(nn).length} faktor.`),
        ),
        sp: 'm',
      };
    },
  ];
  const g21a = [
    (r) => {
      const nn = r.pick([360, 504, 540, 588, 630, 675, 720, 756, 792, 840, 900, 936, 980]);
      return {
        q: T(`Express $${nn}$ as a product of prime factors in index notation.`, `Ungkapkan $${nn}$ sebagai hasil darab faktor perdana dalam tatatanda indeks.`),
        a: T(`$${nn} = ${facStr(nn)}$`),
        w: W(
          T(`Divide repeatedly by the smallest prime that fits: $${pfDivChain(nn)}$`, `Bahagi berulang kali dengan nombor perdana terkecil yang sesuai: $${pfDivChain(nn)}$`),
          T(`$${nn} = ${primeFactors(nn).join(' \\times ')}$`),
          T(`Collect equal primes into powers: $${nn} = ${facStr(nn)}$`, `Kumpulkan faktor perdana yang sama menjadi kuasa: $${nn} = ${facStr(nn)}$`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(1, 3), c = r.pick([5, 7]), d = 3;
      const val = Math.pow(2, a) * Math.pow(3, b) * c;
      need(val < 1300);
      return {
        q: T(`Given that $2^a \\times 3^b \\times ${c} = ${val}$, where $a$ and $b$ are positive integers, find the values of $a$ and $b$.`, `Diberi $2^a \\times 3^b \\times ${c} = ${val}$, dengan keadaan $a$ dan $b$ ialah integer positif, cari nilai $a$ dan $b$.`),
        a: T(`$a = ${a}$, $b = ${b}$`),
        w: W(
          T(`Factorise the right-hand side: $${val} = ${facStr(val)}$`, `Faktorkan ruas kanan: $${val} = ${facStr(val)}$`),
          T(`Compare with $2^a \\times 3^b \\times ${c}$: the power of $2$ is $${a}$ and the power of $3$ is $${b}$.`, `Bandingkan dengan $2^a \\times 3^b \\times ${c}$: kuasa bagi $2$ ialah $${a}$ dan kuasa bagi $3$ ialah $${b}$.`),
          T(`$a = ${a}$, $b = ${b}$`),
        ),
        sp: 'm',
      };
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
        a: T(`$${missing}$`),
        w: W(
          T(`Factorise $${nn}$ completely: $${nn} = ${facStr(nn)}$`, `Faktorkan $${nn}$ sepenuhnya: $${nn} = ${facStr(nn)}$`),
          T(`Comparing with the given product, the prime hidden by $\\square$ is $${missing}$.`, `Dengan membandingkan hasil darab yang diberi, nombor perdana yang dilindungi $\\square$ ialah $${missing}$.`),
        ),
        sp: 'm',
      };
    },
  ];
  const g22e = [
    (r) => {
      const g = r.pick([2, 3, 4, 5, 6]);
      const a = g * r.int(2, 6), b = g * r.int(2, 6);
      need(a !== b && gcd(a, b) === g && a <= 50 && b <= 50);
      return {
        q: T(`Find the highest common factor (HCF) of $${a}$ and $${b}$.`, `Cari faktor sepunya terbesar (FSTB) bagi $${a}$ dan $${b}$.`),
        a: T(`$${g}$`),
        w: W(
          T(`Factors of $${a}$: $${factors(a).join(',\\ ')}$`, `Faktor bagi $${a}$: $${factors(a).join(',\\ ')}$`),
          T(`Factors of $${b}$: $${factors(b).join(',\\ ')}$`, `Faktor bagi $${b}$: $${factors(b).join(',\\ ')}$`),
          T(`Common factors: $${factors(a).filter((x) => b % x === 0).join(',\\ ')}$; the largest is $${g}$.`, `Faktor sepunya: $${factors(a).filter((x) => b % x === 0).join(',\\ ')}$; yang terbesar ialah $${g}$.`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = r.pick([12, 16, 18, 20, 24, 30]), b = r.pick([8, 9, 15, 27, 32, 36, 40]);
      need(a !== b && gcd(a, b) > 1);
      const ca = factors(a).filter((x) => b % x === 0);
      return {
        q: T(`List the common factors of $${a}$ and $${b}$.`, `Senaraikan faktor sepunya bagi $${a}$ dan $${b}$.`),
        a: T(`$${ca.join(',\\ ')}$`),
        w: W(
          T(`Factors of $${a}$: $${factors(a).join(',\\ ')}$`, `Faktor bagi $${a}$: $${factors(a).join(',\\ ')}$`),
          T(`Factors of $${b}$: $${factors(b).join(',\\ ')}$`, `Faktor bagi $${b}$: $${factors(b).join(',\\ ')}$`),
          T(`The numbers in both lists: $${ca.join(',\\ ')}$`, `Nombor yang ada dalam kedua-dua senarai: $${ca.join(',\\ ')}$`),
        ),
        sp: 's',
      };
    },
  ];
  const g22m = [
    (r) => {
      const g = r.pick([6, 7, 8, 9, 12, 14, 15]);
      const a = g * r.int(3, 12), b = g * r.int(3, 12);
      need(a !== b && gcd(a, b) === g && a <= 200 && b <= 200);
      return { q: T(`Find the HCF of $${a}$ and $${b}$ using prime factorisation.`, `Cari FSTB bagi $${a}$ dan $${b}$ menggunakan pemfaktoran perdana.`), a: T(`$${g}$`), w: W(...hcfLcmSteps([a, b], true), T(`$\\text{HCF} = ${g}$`, `$\\text{FSTB} = ${g}$`)), sp: 'm' };
    },
    (r) => {
      const g = r.pick([2, 3, 4, 6]);
      const [a, b, c] = [g * r.int(2, 8), g * r.int(2, 8), g * r.int(2, 8)];
      need(new Set([a, b, c]).size === 3 && gcd3(a, b, c) === g);
      return { q: T(`Find the HCF of $${a}$, $${b}$ and $${c}$.`, `Cari FSTB bagi $${a}$, $${b}$ dan $${c}$.`), a: T(`$${g}$`), w: W(...hcfLcmSteps([a, b, c], true), T(`$\\text{HCF} = ${g}$`, `$\\text{FSTB} = ${g}$`)), sp: 'm' };
    },
    (r) => {
      const g = r.pick([4, 5, 6, 8, 12]);
      const a = g * r.int(3, 9), b = g * r.int(3, 9);
      need(gcd(a, b) === g && a !== b);
      const it = r.pick(ITEM);
      const [p] = r.pair();
      return {
        q: T(`A teacher has ${a} pens and ${b} exercise books. They are to be packed into identical sets with no items left over. Find the greatest number of sets.`, `Seorang guru mempunyai ${a} batang pen dan ${b} buah buku latihan. Kesemuanya hendak dibungkus dalam set yang serupa tanpa sebarang baki. Cari bilangan set yang paling banyak.`),
        a: T(`${g}`),
        w: W(
          T(`The number of sets must divide both ${a} and ${b} exactly, and we want the greatest such number, so it is the HCF.`, `Bilangan set mesti membahagi tepat ${a} dan ${b}, dan kita mahu bilangan terbesar, jadi ia ialah FSTB.`),
          ...hcfLcmSteps([a, b], true),
          T(`Greatest number of sets $= ${g}$ (each with $${a / g}$ pens and $${b / g}$ exercise books).`, `Bilangan set terbanyak $= ${g}$ (setiap satu dengan $${a / g}$ batang pen dan $${b / g}$ buah buku latihan).`),
        ),
        sp: 'm',
      };
    },
  ];
  const g22a = [
    (r) => {
      const g = r.pick([6, 12, 14, 18, 21, 24]);
      const a = g * r.pick([3, 5, 7, 8, 11]), b = g * r.pick([4, 9, 10, 13]), c = g * r.pick([5, 6, 12, 15]);
      need(new Set([a, b, c]).size === 3 && gcd3(a, b, c) === g && Math.max(a, b, c) <= 500);
      return { q: T(`Find the HCF of $${a}$, $${b}$ and $${c}$.`, `Cari FSTB bagi $${a}$, $${b}$ dan $${c}$.`), a: T(`$${g}$`), w: W(...hcfLcmSteps([a, b, c], true), T(`$\\text{HCF} = ${g}$`, `$\\text{FSTB} = ${g}$`)), sp: 'm' };
    },
    (r) => {
      const g = r.pick([15, 20, 25, 30, 40, 45, 50]);
      const w = g * r.int(3, 8), h = g * r.int(2, 6);
      need(gcd(w, h) === g && w !== h);
      return {
        q: T(`A rectangular floor measures ${w} cm by ${h} cm. It is to be covered exactly with identical square tiles, with no cutting. Find (a) the largest possible side length of a tile, (b) the number of tiles needed.`, `Sebuah lantai segi empat tepat berukuran ${w} cm kali ${h} cm. Lantai itu hendak ditutup tepat dengan jubin segi empat sama yang serupa tanpa dipotong. Cari (a) panjang sisi terbesar bagi sebuah jubin, (b) bilangan jubin yang diperlukan.`),
        a: T(`(a) ${g} cm (b) ${(w / g) * (h / g)} tiles`, `(a) ${g} cm (b) ${(w / g) * (h / g)} keping`),
        w: W(
          T('(a) The side of a tile must divide both sides of the floor exactly, and we want the largest, so take the HCF.', '(a) Sisi jubin mesti membahagi tepat kedua-dua sisi lantai, dan kita mahu yang terbesar, jadi ambil FSTB.'),
          ...hcfLcmSteps([w, h], true),
          T(`Side of a tile $= ${g}$ cm`, `Sisi jubin $= ${g}$ cm`),
          T(`(b) Tiles $= \\dfrac{${w}}{${g}} \\times \\dfrac{${h}}{${g}} = ${w / g} \\times ${h / g} = ${(w / g) * (h / g)}$`, `(b) Jubin $= \\dfrac{${w}}{${g}} \\times \\dfrac{${h}}{${g}} = ${w / g} \\times ${h / g} = ${(w / g) * (h / g)}$`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const g = r.pick([6, 8, 9, 12]);
      const a = g * r.int(3, 9), b = g * r.int(4, 11), c = g * r.int(3, 8);
      need(new Set([a, b, c]).size === 3 && gcd3(a, b, c) === g);
      return {
        q: T(`A school has ${a} boys, ${b} girls and ${c} teachers on a trip. They are to be split into the largest possible identical groups, each with the same number of boys, girls and teachers. How many groups are there, and how many of each are in a group?`, `Sebuah sekolah menghantar ${a} murid lelaki, ${b} murid perempuan dan ${c} guru dalam satu lawatan. Mereka hendak dibahagikan kepada kumpulan serupa yang paling banyak, setiap kumpulan mempunyai bilangan murid lelaki, murid perempuan dan guru yang sama. Berapakah bilangan kumpulan, dan berapakah bilangan setiap jenis dalam satu kumpulan?`),
        a: T(`${g} groups; ${a / g} boys, ${b / g} girls, ${c / g} teachers each`, `${g} kumpulan; setiap kumpulan ${a / g} lelaki, ${b / g} perempuan, ${c / g} guru`),
        w: W(
          T('The number of groups must divide all three totals exactly, and it must be as large as possible, so it is the HCF.', 'Bilangan kumpulan mesti membahagi tepat ketiga-tiga jumlah itu dan mestilah sebesar mungkin, jadi ia ialah FSTB.'),
          ...hcfLcmSteps([a, b, c], true),
          T(`Number of groups $= ${g}$`, `Bilangan kumpulan $= ${g}$`),
          T(`Each group: $${a} \\div ${g} = ${a / g}$ boys, $${b} \\div ${g} = ${b / g}$ girls, $${c} \\div ${g} = ${c / g}$ teachers.`, `Setiap kumpulan: $${a} \\div ${g} = ${a / g}$ murid lelaki, $${b} \\div ${g} = ${b / g}$ murid perempuan, $${c} \\div ${g} = ${c / g}$ guru.`),
        ),
        sp: 'm',
      };
    },
  ];
  const g23e = [
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 12);
      need(a !== b && lcm(a, b) <= 60);
      const L1 = lcm(a, b);
      const upto = (k) => { const o = []; for (let i = 1; i * k <= L1; i++) o.push(i * k); return o.join(',\\ '); };
      return {
        q: T(`Find the lowest common multiple (LCM) of $${a}$ and $${b}$.`, `Cari gandaan sepunya terkecil (GSTK) bagi $${a}$ dan $${b}$.`),
        a: T(`$${L1}$`),
        w: W(
          T(`Multiples of $${a}$: $${upto(a)}$`, `Gandaan bagi $${a}$: $${upto(a)}$`),
          T(`Multiples of $${b}$: $${upto(b)}$`, `Gandaan bagi $${b}$: $${upto(b)}$`),
          T(`The smallest number in both lists is $${L1}$.`, `Nombor terkecil yang ada dalam kedua-dua senarai ialah $${L1}$.`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = r.int(3, 8), b = r.int(3, 9);
      need(a !== b);
      // the LCM must actually appear in the lists the question asks for, so list enough multiples
      const cnt = Math.max(6, lcm(a, b) / a, lcm(a, b) / b);
      const mul = (k) => { const o = []; for (let i = 1; i <= cnt; i++) o.push(i * k); return o; };
      return {
        q: T(`List the first ${cnt} multiples of $${a}$ and of $${b}$. Hence state the LCM.`, `Senaraikan ${cnt} gandaan pertama bagi $${a}$ dan $${b}$. Seterusnya nyatakan GSTK.`),
        a: T(`Multiples of $${a}$: $${mul(a).join(', ')}$; of $${b}$: $${mul(b).join(', ')}$. LCM $= ${lcm(a, b)}$`, `Gandaan $${a}$: $${mul(a).join(', ')}$; $${b}$: $${mul(b).join(', ')}$. GSTK $= ${lcm(a, b)}$`),
        w: W(
          T(`Multiply each number by $1, 2, 3, \\ldots, ${cnt}$: $${a}$ gives $${mul(a).join(',\\ ')}$`, `Darab setiap nombor dengan $1, 2, 3, \\ldots, ${cnt}$: $${a}$ memberi $${mul(a).join(',\\ ')}$`),
          T(`$${b}$ gives $${mul(b).join(',\\ ')}$`, `$${b}$ memberi $${mul(b).join(',\\ ')}$`),
          T(`The LCM is the smallest number that appears in both lists: $${lcm(a, b)}$, since $${a} \\times ${lcm(a, b) / a} = ${lcm(a, b)}$ and $${b} \\times ${lcm(a, b) / b} = ${lcm(a, b)}$.`, `GSTK ialah nombor terkecil yang muncul dalam kedua-dua senarai: $${lcm(a, b)}$, kerana $${a} \\times ${lcm(a, b) / a} = ${lcm(a, b)}$ dan $${b} \\times ${lcm(a, b) / b} = ${lcm(a, b)}$.`),
        ),
        sp: 's',
      };
    },
  ];
  const g23m = [
    (r) => {
      const a = r.int(12, 60), b = r.int(12, 100);
      need(a !== b && lcm(a, b) <= 900);
      return { q: T(`Find the LCM of $${a}$ and $${b}$.`, `Cari GSTK bagi $${a}$ dan $${b}$.`), a: T(`$${lcm(a, b)}$`), w: W(...hcfLcmSteps([a, b], false), T(`$\\text{LCM} = ${lcm(a, b)}$`, `$\\text{GSTK} = ${lcm(a, b)}$`)), sp: 'm' };
    },
    (r) => {
      const [a, b, c] = r.distinct(3, 2, 30);
      need(lcm3(a, b, c) <= 1500);
      return { q: T(`Find the LCM of $${a}$, $${b}$ and $${c}$.`, `Cari GSTK bagi $${a}$, $${b}$ dan $${c}$.`), a: T(`$${lcm3(a, b, c)}$`), w: W(...hcfLcmSteps([a, b, c], false), T(`$\\text{LCM} = ${lcm3(a, b, c)}$`, `$\\text{GSTK} = ${lcm3(a, b, c)}$`)), sp: 'm' };
    },
    (r) => {
      const a = r.pick([10, 12, 15, 20, 25]), b = r.pick([6, 8, 9, 14, 18]);
      need(lcm(a, b) < 400);
      return {
        q: T(`Two bells ring every ${a} minutes and every ${b} minutes respectively. If they ring together at 8:00 a.m., after how many minutes will they next ring together?`, `Dua loceng masing-masing berbunyi setiap ${a} minit dan setiap ${b} minit. Jika kedua-duanya berbunyi serentak pada pukul 8:00 pagi, selepas berapa minit kedua-duanya akan berbunyi serentak lagi?`),
        a: T(`${lcm(a, b)} minutes`, `${lcm(a, b)} minit`),
        w: W(
          T('They ring together again after a number of minutes that is a multiple of both intervals, and the first such time is the LCM.', 'Kedua-duanya berbunyi serentak semula selepas bilangan minit yang merupakan gandaan bagi kedua-dua selang, dan kali pertama ialah GSTK.'),
          ...hcfLcmSteps([a, b], false),
          T(`They ring together again after ${lcm(a, b)} minutes.`, `Kedua-duanya berbunyi serentak semula selepas ${lcm(a, b)} minit.`),
        ),
        sp: 'm',
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
        a: T(`(a) ${l} s (b) ${Math.floor(3600 / l)} times`, `(a) ${l} s (b) ${Math.floor(3600 / l)} kali`),
        w: W(
          T('(a) They flash together again after the lowest common multiple of the three intervals.', '(a) Ketiga-tiganya berkelip serentak semula selepas gandaan sepunya terkecil bagi ketiga-tiga selang itu.'),
          ...hcfLcmSteps([a, b, c], false),
          T(`They flash together every ${l} s.`, `Ketiga-tiganya berkelip serentak setiap ${l} s.`),
          T(`(b) $1$ hour $= 3600$ s, so $3600 \\div ${l} ${3600 % l === 0 ? '=' : '\\approx'} ${n(round(3600 / l, 4))}$, giving ${Math.floor(3600 / l)} complete flashes together.`, `(b) $1$ jam $= 3600$ s, jadi $3600 \\div ${l} ${3600 % l === 0 ? '=' : '\\approx'} ${n(round(3600 / l, 4))}$, memberi ${Math.floor(3600 / l)} kali kelipan serentak yang lengkap.`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const d = r.pick([[6, 8, 9], [4, 6, 10], [8, 12, 15], [5, 6, 8]]);
      const rem = r.int(1, 3);
      const l = lcm3(...d);
      return {
        q: T(`Find the smallest number that is divisible by $${d[0]}$, $${d[1]}$ and $${d[2]}$. Hence find the smallest 4-digit number divisible by all three.`, `Cari nombor terkecil yang boleh dibahagi tepat dengan $${d[0]}$, $${d[1]}$ dan $${d[2]}$. Seterusnya cari nombor 4 digit terkecil yang boleh dibahagi tepat dengan ketiga-tiganya.`),
        a: T(`$${l}$; $${Math.ceil(1000 / l) * l}$`),
        w: W(
          T('The smallest number divisible by all three is their LCM.', 'Nombor terkecil yang boleh dibahagi tepat dengan ketiga-tiganya ialah GSTK mereka.'),
          ...hcfLcmSteps(d, false),
          T(`Every number divisible by all three is a multiple of $${l}$, so look for the first 4-digit one: $1000 \\div ${l} ${1000 % l === 0 ? '=' : '\\approx'} ${n(round(1000 / l, 4))}$, so take ${Math.ceil(1000 / l)} lots.`, `Setiap nombor yang boleh dibahagi tepat dengan ketiga-tiganya ialah gandaan $${l}$, jadi cari yang pertama berdigit 4: $1000 \\div ${l} ${1000 % l === 0 ? '=' : '\\approx'} ${n(round(1000 / l, 4))}$, maka ambil ${Math.ceil(1000 / l)} kali.`),
          T(`$${l} \\times ${Math.ceil(1000 / l)} = ${Math.ceil(1000 / l) * l}$`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const g = r.pick([3, 4, 5, 6]);
      const a = g * r.pick([2, 3, 5]), b = g * r.pick([4, 7]);
      need(a !== b);
      return {
        q: T(`The HCF of two numbers is $${gcd(a, b)}$ and their LCM is $${lcm(a, b)}$. If one of the numbers is $${a}$, find the other number.`, `FSTB bagi dua nombor ialah $${gcd(a, b)}$ dan GSTK bagi kedua-duanya ialah $${lcm(a, b)}$. Jika satu daripada nombor itu ialah $${a}$, cari nombor yang satu lagi.`),
        a: T(`$${b}$`),
        w: W(
          T('For two numbers, $\\text{HCF} \\times \\text{LCM}$ equals the product of the numbers.', 'Bagi dua nombor, $\\text{FSTB} \\times \\text{GSTK}$ sama dengan hasil darab kedua-dua nombor itu.'),
          T(`$${gcd(a, b)} \\times ${lcm(a, b)} = ${gcd(a, b) * lcm(a, b)}$`),
          T(`Other number $= ${gcd(a, b) * lcm(a, b)} \\div ${a} = ${b}$`, `Nombor yang satu lagi $= ${gcd(a, b) * lcm(a, b)} \\div ${a} = ${b}$`),
        ),
        sp: 'm',
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
    (r) => { const k = r.int(2, 12); return { q: T(`Evaluate $${k}^2$.`, `Hitung $${k}^2$.`), a: T(`$${k * k}$`), w: W(T(`Squaring means multiplying the number by itself: $${k}^2 = ${k} \\times ${k} = ${k * k}$`, `Kuasa dua bermaksud mendarab nombor itu dengan dirinya sendiri: $${k}^2 = ${k} \\times ${k} = ${k * k}$`)), sp: 'xs' }; },
    (r) => { const k = r.int(2, 12); return { q: T(`Find the value of $\\sqrt{${k * k}}$.`, `Cari nilai $\\sqrt{${k * k}}$.`), a: T(`$${k}$`), w: W(T(`A square root asks which positive number multiplied by itself gives $${k * k}$.`, `Punca kuasa dua bertanya nombor positif manakah yang apabila didarab dengan dirinya memberi $${k * k}$.`), T(`$${k} \\times ${k} = ${k * k}$, so $\\sqrt{${k * k}} = ${k}$`, `$${k} \\times ${k} = ${k * k}$, jadi $\\sqrt{${k * k}} = ${k}$`)), sp: 'xs' }; },
    (r) => { const k = r.int(3, 12); return { q: T(`Solve $x^2 = ${k * k}$.`, `Selesaikan $x^2 = ${k * k}$.`), a: T(`$x = \\pm ${k}$ (i.e. $${k}$ or $-${k}$)`, `$x = \\pm ${k}$ (iaitu $${k}$ atau $-${k}$)`), w: W(T(`Take the square root of both sides: $x = \\pm\\sqrt{${k * k}} = \\pm ${k}$`, `Punca kuasa duakan kedua-dua belah: $x = \\pm\\sqrt{${k * k}} = \\pm ${k}$`), T(`Both signs work, because $(-${k})^2 = ${k * k}$ as well.`, `Kedua-dua tanda sesuai, kerana $(-${k})^2 = ${k * k}$ juga.`)), sp: 'xs' }; },
    (r) => { const k = r.int(3, 12); return { q: T(`The area of a square is $${k * k}\\ \\text{cm}^2$. Find the length of one side.`, `Luas sebuah segi empat sama ialah $${k * k}\\ \\text{cm}^2$. Cari panjang satu sisi.`), a: T(`$${k}$ cm`), w: W(T(`For a square, area $= s^2$, so $s = \\sqrt{${k * k}}$.`, `Bagi segi empat sama, luas $= s^2$, jadi $s = \\sqrt{${k * k}}$.`), T(`$s = ${k}$ cm (a length is positive, so the negative root is rejected).`, `$s = ${k}$ cm (panjang adalah positif, jadi punca negatif ditolak).`)), sp: 'xs' }; },
  ];
  const g31m = [
    (r) => { const k = r.int(13, 20); return { q: T(`Evaluate $${k}^2$.`, `Hitung $${k}^2$.`), a: T(`$${k * k}$`), w: W(T(`$${k}^2 = ${k} \\times ${k} = ${k * k}$`), T(`Split it if it helps: $${k} \\times ${k} = ${k} \\times 10 + ${k} \\times ${k - 10} = ${k * 10} + ${k * (k - 10)} = ${k * k}$`, `Pecahkan jika membantu: $${k} \\times ${k} = ${k} \\times 10 + ${k} \\times ${k - 10} = ${k * 10} + ${k * (k - 10)} = ${k * k}$`)), sp: 'xs' }; },
    (r) => {
      const a = r.pick([[1, 4], [4, 9], [9, 16], [25, 49], [36, 64], [16, 81], [49, 100]]);
      return {
        q: T(`Find the value of $\\sqrt{\\dfrac{${a[0]}}{${a[1]}}}$.`, `Cari nilai $\\sqrt{\\dfrac{${a[0]}}{${a[1]}}}$.`),
        a: T(`$\\dfrac{${Math.sqrt(a[0])}}{${Math.sqrt(a[1])}}$`),
        w: W(
          T('Take the square root of the numerator and of the denominator separately.', 'Punca kuasa duakan pengangka dan penyebut secara berasingan.'),
          T(`$\\sqrt{\\dfrac{${a[0]}}{${a[1]}}} = \\dfrac{\\sqrt{${a[0]}}}{\\sqrt{${a[1]}}} = \\dfrac{${Math.sqrt(a[0])}}{${Math.sqrt(a[1])}}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const k = r.pick([0.09, 0.16, 0.25, 0.36, 0.49, 0.64, 0.81, 1.44, 1.21, 2.25]);
      return {
        q: T(`Find the value of $\\sqrt{${k}}$.`, `Cari nilai $\\sqrt{${k}}$.`),
        a: T(`$${n(round(Math.sqrt(k), 2))}$`),
        w: W(
          T(`Write the decimal as a fraction: $${k} = \\dfrac{${Math.round(k * 100)}}{100}$`, `Tulis perpuluhan itu sebagai pecahan: $${k} = \\dfrac{${Math.round(k * 100)}}{100}$`),
          T(`$\\sqrt{\\dfrac{${Math.round(k * 100)}}{100}} = \\dfrac{${Math.round(Math.sqrt(k * 100))}}{10} = ${n(round(Math.sqrt(k), 2))}$`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const a = r.int(2, 12), b = r.int(2, 12);
      const f = r.pick([
        [`\\sqrt{${a * a}} + \\sqrt{${b * b}}`, a + b, () => [T(`Find each root first: $\\sqrt{${a * a}} = ${a}$, $\\sqrt{${b * b}} = ${b}$`, `Cari setiap punca dahulu: $\\sqrt{${a * a}} = ${a}$, $\\sqrt{${b * b}} = ${b}$`), T(`$${a} + ${b} = ${a + b}$`)]],
        [`\\sqrt{${a * a}} \\times \\sqrt{${b * b}}`, a * b, () => [T(`Find each root first: $\\sqrt{${a * a}} = ${a}$, $\\sqrt{${b * b}} = ${b}$`, `Cari setiap punca dahulu: $\\sqrt{${a * a}} = ${a}$, $\\sqrt{${b * b}} = ${b}$`), T(`$${a} \\times ${b} = ${a * b}$`)]],
        [`${a}^2 - \\sqrt{${b * b}}`, a * a - b, () => [T(`$${a}^2 = ${a * a}$ and $\\sqrt{${b * b}} = ${b}$`, `$${a}^2 = ${a * a}$ dan $\\sqrt{${b * b}} = ${b}$`), T(`$${a * a} - ${b} = ${a * a - b}$`)]],
        [`\\sqrt{${a * a}} \\times \\sqrt{${a * a}}`, a * a, () => [T(`$\\sqrt{${a * a}} = ${a}$, so the product is $${a} \\times ${a} = ${a * a}$.`, `$\\sqrt{${a * a}} = ${a}$, jadi hasil darabnya ialah $${a} \\times ${a} = ${a * a}$.`), T('A square root multiplied by itself gives back the number under the root.', 'Punca kuasa dua yang didarab dengan dirinya memberi semula nombor di bawah tanda punca itu.')]],
      ]);
      return { q: T(`Evaluate $${f[0]}$.`, `Hitung $${f[0]}$.`), a: T(`$${f[1]}$`), w: W(...f[2]()), sp: 's' };
    },
    (r) => {
      const a = r.pick([4, 9, 16, 25, 36]), b = r.pick([9, 16, 25, 49, 64, 81]);
      return {
        q: T(`Show that $\\sqrt{${a}} \\times \\sqrt{${b}} = \\sqrt{${a} \\times ${b}}$.`, `Tunjukkan bahawa $\\sqrt{${a}} \\times \\sqrt{${b}} = \\sqrt{${a} \\times ${b}}$.`),
        a: T(`$${Math.sqrt(a)} \\times ${Math.sqrt(b)} = ${Math.sqrt(a) * Math.sqrt(b)}$ and $\\sqrt{${a * b}} = ${Math.sqrt(a * b)}$`),
        w: W(
          T(`Left side: $\\sqrt{${a}} \\times \\sqrt{${b}} = ${Math.sqrt(a)} \\times ${Math.sqrt(b)} = ${Math.sqrt(a) * Math.sqrt(b)}$`, `Sebelah kiri: $\\sqrt{${a}} \\times \\sqrt{${b}} = ${Math.sqrt(a)} \\times ${Math.sqrt(b)} = ${Math.sqrt(a) * Math.sqrt(b)}$`),
          T(`Right side: $\\sqrt{${a} \\times ${b}} = \\sqrt{${a * b}} = ${Math.sqrt(a * b)}$`, `Sebelah kanan: $\\sqrt{${a} \\times ${b}} = \\sqrt{${a * b}} = ${Math.sqrt(a * b)}$`),
          T('Both sides give the same value, so the statement is true.', 'Kedua-dua belah memberi nilai yang sama, jadi pernyataan itu betul.'),
        ),
        sp: 's',
      };
    },
  ];
  const g31a = [
    (r) => {
      const k = r.int(30, 130);
      const lo = Math.floor(Math.sqrt(k));
      need(lo * lo !== k);
      return {
        q: T(`Between which two consecutive integers does $\\sqrt{${k}}$ lie?`, `Di antara dua integer berturutan yang manakah $\\sqrt{${k}}$ terletak?`),
        a: T(`Between $${lo}$ and $${lo + 1}$`, `Di antara $${lo}$ dan $${lo + 1}$`),
        w: W(
          T('Find the perfect squares just below and just above the number.', 'Cari nombor kuasa dua sempurna yang tepat di bawah dan tepat di atas nombor itu.'),
          T(`$${lo}^2 = ${lo * lo}$ and $${lo + 1}^2 = ${(lo + 1) ** 2}$, and $${lo * lo} < ${k} < ${(lo + 1) ** 2}$.`, `$${lo}^2 = ${lo * lo}$ dan $${lo + 1}^2 = ${(lo + 1) ** 2}$, dan $${lo * lo} < ${k} < ${(lo + 1) ** 2}$.`),
          T(`So $${lo} < \\sqrt{${k}} < ${lo + 1}$.`, `Maka $${lo} < \\sqrt{${k}} < ${lo + 1}$.`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 8), c = r.int(2, 5);
      const d = r.pick([2, 3, 6]);
      const f = r.pick([
        [`${a}^2 \\times \\sqrt{${(b * d) * (b * d)}} \\div ${d} - ${c}`, a * a * b * d / d - c, () => [
          T(`Powers and roots first: $${a}^2 = ${a * a}$ and $\\sqrt{${(b * d) * (b * d)}} = ${b * d}$.`, `Kuasa dan punca dahulu: $${a}^2 = ${a * a}$ dan $\\sqrt{${(b * d) * (b * d)}} = ${b * d}$.`),
          T(`Then $\\times$ and $\\div$ from left to right: $${a * a} \\times ${b * d} = ${a * a * b * d}$, $${a * a * b * d} \\div ${d} = ${a * a * b}$.`, `Kemudian $\\times$ dan $\\div$ dari kiri ke kanan: $${a * a} \\times ${b * d} = ${a * a * b * d}$, $${a * a * b * d} \\div ${d} = ${a * a * b}$.`),
          T(`Last, subtract: $${a * a * b} - ${c} = ${a * a * b - c}$`, `Akhir sekali, tolak: $${a * a * b} - ${c} = ${a * a * b - c}$`)]],
        [`\\sqrt{${a * a}} + ${b}^2 \\div ${b} - ${c}`, a + b - c, () => [
          T(`Root and power first: $\\sqrt{${a * a}} = ${a}$ and $${b}^2 = ${b * b}$.`, `Punca dan kuasa dahulu: $\\sqrt{${a * a}} = ${a}$ dan $${b}^2 = ${b * b}$.`),
          T(`Divide before adding: $${b * b} \\div ${b} = ${b}$.`, `Bahagi sebelum tambah: $${b * b} \\div ${b} = ${b}$.`),
          T(`$${a} + ${b} - ${c} = ${a + b - c}$`)]],
        [`(\\sqrt{${a * a * b * b}} - ${a}) \\times ${c}`, (a * b - a) * c, () => [
          T(`Brackets first: $\\sqrt{${a * a * b * b}} = ${a * b}$, so the bracket is $${a * b} - ${a} = ${a * b - a}$.`, `Kurungan dahulu: $\\sqrt{${a * a * b * b}} = ${a * b}$, jadi kurungan itu ialah $${a * b} - ${a} = ${a * b - a}$.`),
          T(`$${a * b - a} \\times ${c} = ${(a * b - a) * c}$`)]],
      ]);
      return { q: T(`Evaluate $${f[0]}$.`, `Hitung $${f[0]}$.`), a: T(`$${f[1]}$`), w: W(...f[2]()), sp: 'm' };
    },
    (r) => {
      const w = r.int(1, 4), nu = r.pick([[1, 4], [9, 16], [1, 9], [4, 9], [16, 25]]);
      const F = fr(w * nu[1] + nu[0], nu[1]);
      const v = fr(Math.sqrt(F.n), Math.sqrt(F.d));
      need(Number.isInteger(Math.sqrt(F.n)) && Number.isInteger(Math.sqrt(F.d)));
      return {
        q: T(`Find the value of $\\sqrt{${w}\\dfrac{${nu[0]}}{${nu[1]}}}$.`, `Cari nilai $\\sqrt{${w}\\dfrac{${nu[0]}}{${nu[1]}}}$.`),
        a: T(`$${Fr.mixed(v)}$`),
        w: W(
          T(`Change the mixed number to an improper fraction first: $${w}\\dfrac{${nu[0]}}{${nu[1]}} = \\dfrac{${w} \\times ${nu[1]} + ${nu[0]}}{${nu[1]}} = \\dfrac{${F.n}}{${F.d}}$`, `Tukar nombor bercampur kepada pecahan tak wajar dahulu: $${w}\\dfrac{${nu[0]}}{${nu[1]}} = \\dfrac{${w} \\times ${nu[1]} + ${nu[0]}}{${nu[1]}} = \\dfrac{${F.n}}{${F.d}}$`),
          T(`$\\sqrt{\\dfrac{${F.n}}{${F.d}}} = \\dfrac{\\sqrt{${F.n}}}{\\sqrt{${F.d}}} = \\dfrac{${Math.sqrt(F.n)}}{${Math.sqrt(F.d)}}$`),
          ...mixedLine(v),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const a = r.int(3, 12), b = r.int(2, 12);
      return {
        q: T(`The side of a square is ${a} cm. Find the difference between the area of a square of side ${a + b} cm and this square.`, `Sisi sebuah segi empat sama ialah ${a} cm. Cari perbezaan antara luas segi empat sama bersisi ${a + b} cm dengan segi empat sama ini.`),
        a: T(`$${(a + b) ** 2 - a * a}\\ \\text{cm}^2$`),
        w: W(
          T(`Larger area $= ${a + b}^2 = ${(a + b) ** 2}\\ \\text{cm}^2$`, `Luas yang lebih besar $= ${a + b}^2 = ${(a + b) ** 2}\\ \\text{cm}^2$`),
          T(`Smaller area $= ${a}^2 = ${a * a}\\ \\text{cm}^2$`, `Luas yang lebih kecil $= ${a}^2 = ${a * a}\\ \\text{cm}^2$`),
          T(`Difference $= ${(a + b) ** 2} - ${a * a} = ${(a + b) ** 2 - a * a}\\ \\text{cm}^2$`, `Beza $= ${(a + b) ** 2} - ${a * a} = ${(a + b) ** 2 - a * a}\\ \\text{cm}^2$`),
        ),
        sp: 'm',
      };
    },
  ];
  const cubeList = [1, 8, 27, 64, 125, 216, 343, 512, 729, 1000];
  const g32e = [
    (r) => { const k = r.int(1, 10); return { q: T(`Evaluate $${k}^3$.`, `Hitung $${k}^3$.`), a: T(`$${k ** 3}$`), w: W(T(`Cubing means using the number as a factor three times: $${k}^3 = ${k} \\times ${k} \\times ${k}$`, `Kuasa tiga bermaksud menggunakan nombor itu sebagai faktor sebanyak tiga kali: $${k}^3 = ${k} \\times ${k} \\times ${k}$`), T(`$= ${k * k} \\times ${k} = ${k ** 3}$`)), sp: 'xs' }; },
    (r) => { const k = r.int(1, 10); return { q: T(`Find the value of $\\sqrt[3]{${k ** 3}}$.`, `Cari nilai $\\sqrt[3]{${k ** 3}}$.`), a: T(`$${k}$`), w: W(T(`A cube root asks which number used three times as a factor gives $${k ** 3}$.`, `Punca kuasa tiga bertanya nombor manakah yang digunakan tiga kali sebagai faktor memberi $${k ** 3}$.`), T(`$${k} \\times ${k} \\times ${k} = ${k ** 3}$, so $\\sqrt[3]{${k ** 3}} = ${k}$`, `$${k} \\times ${k} \\times ${k} = ${k ** 3}$, jadi $\\sqrt[3]{${k ** 3}} = ${k}$`)), sp: 'xs' }; },
    (r) => { const k = r.int(2, 9); return { q: T(`Solve $x^3 = ${k ** 3}$.`, `Selesaikan $x^3 = ${k ** 3}$.`), a: T(`$x = ${k}$`), w: W(T(`Take the cube root of both sides: $x = \\sqrt[3]{${k ** 3}} = ${k}$`, `Punca kuasa tigakan kedua-dua belah: $x = \\sqrt[3]{${k ** 3}} = ${k}$`), T('Unlike a square root, a cube root has only one value: the sign of the cube matches the sign of the number.', 'Tidak seperti punca kuasa dua, punca kuasa tiga hanya mempunyai satu nilai: tanda kuasa tiga sama dengan tanda nombor itu.')), sp: 'xs' }; },
    (r) => { const k = r.int(2, 10); return { q: T(`The volume of a cube is $${k ** 3}\\ \\text{cm}^3$. Find the length of an edge.`, `Isi padu sebuah kubus ialah $${k ** 3}\\ \\text{cm}^3$. Cari panjang seunit tepinya.`), a: T(`$${k}$ cm`), w: W(T(`For a cube, volume $= e^3$, so $e = \\sqrt[3]{${k ** 3}}$.`, `Bagi sebuah kubus, isi padu $= e^3$, jadi $e = \\sqrt[3]{${k ** 3}}$.`), T(`$${k} \\times ${k} \\times ${k} = ${k ** 3}$, so $e = ${k}$ cm.`, `$${k} \\times ${k} \\times ${k} = ${k ** 3}$, jadi $e = ${k}$ cm.`)), sp: 'xs' }; },
  ];
  const g32m = [
    (r) => { const k = r.int(11, 15); return { q: T(`Evaluate $${k}^3$.`, `Hitung $${k}^3$.`), a: T(`$${k ** 3}$`), w: W(T(`$${k}^3 = ${k} \\times ${k} \\times ${k}$`), T(`$${k} \\times ${k} = ${k * k}$, then $${k * k} \\times ${k} = ${k ** 3}$`, `$${k} \\times ${k} = ${k * k}$, kemudian $${k * k} \\times ${k} = ${k ** 3}$`)), sp: 'xs' }; },
    (r) => { const k = r.pick([6, 7, 8, 9, 10]); const s = r.chance(); return { q: T(`Find the value of $\\sqrt[3]{${s ? '-' : ''}${k ** 3}}$.`, `Cari nilai $\\sqrt[3]{${s ? '-' : ''}${k ** 3}}$.`), a: T(`$${s ? -k : k}$`), w: W(T(`$${k}^3 = ${k ** 3}$`), s ? T(`A negative number cubed stays negative, so $\\sqrt[3]{-${k ** 3}} = -${k}$.`, `Nombor negatif yang dikuasatigakan kekal negatif, jadi $\\sqrt[3]{-${k ** 3}} = -${k}$.`) : T(`So $\\sqrt[3]{${k ** 3}} = ${k}$.`, `Jadi $\\sqrt[3]{${k ** 3}} = ${k}$.`)), sp: 'xs' }; },
    (r) => { const k = r.int(2, 6); return { q: T(`Evaluate $(-${k})^3$.`, `Hitung $(-${k})^3$.`), a: T(`$${-(k ** 3)}$`), w: W(T(`$(-${k})^3 = (-${k}) \\times (-${k}) \\times (-${k})$`), T(`$(-${k}) \\times (-${k}) = ${k * k}$, then $${k * k} \\times (-${k}) = ${-(k ** 3)}$`, `$(-${k}) \\times (-${k}) = ${k * k}$, kemudian $${k * k} \\times (-${k}) = ${-(k ** 3)}$`), T('An odd power keeps the minus sign.', 'Kuasa ganjil mengekalkan tanda tolak.')), sp: 'xs' }; },
    (r) => {
      const a = r.int(2, 7), b = r.int(2, 5);
      const f = r.pick([
        [`\\sqrt[3]{${a ** 3}} + ${b}^3`, a + b ** 3, () => [T(`$\\sqrt[3]{${a ** 3}} = ${a}$ and $${b}^3 = ${b ** 3}$`, `$\\sqrt[3]{${a ** 3}} = ${a}$ dan $${b}^3 = ${b ** 3}$`), T(`$${a} + ${b ** 3} = ${a + b ** 3}$`)]],
        [`${a}^3 - \\sqrt[3]{${b ** 3}}`, a ** 3 - b, () => [T(`$${a}^3 = ${a ** 3}$ and $\\sqrt[3]{${b ** 3}} = ${b}$`, `$${a}^3 = ${a ** 3}$ dan $\\sqrt[3]{${b ** 3}} = ${b}$`), T(`$${a ** 3} - ${b} = ${a ** 3 - b}$`)]],
        [`\\sqrt[3]{${a ** 3}} \\times \\sqrt[3]{${b ** 3}}`, a * b, () => [T(`$\\sqrt[3]{${a ** 3}} = ${a}$ and $\\sqrt[3]{${b ** 3}} = ${b}$`, `$\\sqrt[3]{${a ** 3}} = ${a}$ dan $\\sqrt[3]{${b ** 3}} = ${b}$`), T(`$${a} \\times ${b} = ${a * b}$`)]],
        [`${a * b * b * b} \\div ${b}^3 + \\sqrt[3]{${a ** 3}}`, a + a, () => [T(`$${b}^3 = ${b ** 3}$, so $${a * b * b * b} \\div ${b ** 3} = ${a}$`, `$${b}^3 = ${b ** 3}$, jadi $${a * b * b * b} \\div ${b ** 3} = ${a}$`), T(`$\\sqrt[3]{${a ** 3}} = ${a}$`), T(`$${a} + ${a} = ${2 * a}$`)]],
      ]);
      return { q: T(`Evaluate $${f[0]}$.`, `Hitung $${f[0]}$.`), a: T(`$${f[1]}$`), w: W(...f[2]()), sp: 's' };
    },
  ];
  const g32a = [
    (r) => {
      const k = r.int(30, 500);
      const lo = Math.floor(Math.cbrt(k));
      need(lo ** 3 !== k);
      return {
        q: T(`Between which two consecutive integers does $\\sqrt[3]{${k}}$ lie?`, `Di antara dua integer berturutan yang manakah $\\sqrt[3]{${k}}$ terletak?`),
        a: T(`Between $${lo}$ and $${lo + 1}$`, `Di antara $${lo}$ dan $${lo + 1}$`),
        w: W(
          T('Find the perfect cubes just below and just above the number.', 'Cari nombor kuasa tiga sempurna yang tepat di bawah dan tepat di atas nombor itu.'),
          T(`$${lo}^3 = ${lo ** 3}$ and $${lo + 1}^3 = ${(lo + 1) ** 3}$, and $${lo ** 3} < ${k} < ${(lo + 1) ** 3}$.`, `$${lo}^3 = ${lo ** 3}$ dan $${lo + 1}^3 = ${(lo + 1) ** 3}$, dan $${lo ** 3} < ${k} < ${(lo + 1) ** 3}$.`),
          T(`So $${lo} < \\sqrt[3]{${k}} < ${lo + 1}$.`, `Maka $${lo} < \\sqrt[3]{${k}} < ${lo + 1}$.`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const nu = r.pick([[1, 8], [8, 27], [27, 64], [64, 125], [1, 27], [125, 216]]);
      return {
        q: T(`Find the value of $\\sqrt[3]{\\dfrac{${nu[0]}}{${nu[1]}}}$.`, `Cari nilai $\\sqrt[3]{\\dfrac{${nu[0]}}{${nu[1]}}}$.`),
        a: T(`$\\dfrac{${Math.round(Math.cbrt(nu[0]))}}{${Math.round(Math.cbrt(nu[1]))}}$`),
        w: W(
          T('Take the cube root of the numerator and of the denominator separately.', 'Punca kuasa tigakan pengangka dan penyebut secara berasingan.'),
          T(`$\\sqrt[3]{${nu[0]}} = ${Math.round(Math.cbrt(nu[0]))}$ and $\\sqrt[3]{${nu[1]}} = ${Math.round(Math.cbrt(nu[1]))}$`, `$\\sqrt[3]{${nu[0]}} = ${Math.round(Math.cbrt(nu[0]))}$ dan $\\sqrt[3]{${nu[1]}} = ${Math.round(Math.cbrt(nu[1]))}$`),
          T(`$\\sqrt[3]{\\dfrac{${nu[0]}}{${nu[1]}}} = \\dfrac{${Math.round(Math.cbrt(nu[0]))}}{${Math.round(Math.cbrt(nu[1]))}}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const k = r.pick([[0.008, 0.2], [0.027, 0.3], [0.125, 0.5], [0.064, 0.4], [0.001, 0.1], [0.216, 0.6]]);
      return {
        q: T(`Find the value of $\\sqrt[3]{${k[0]}}$.`, `Cari nilai $\\sqrt[3]{${k[0]}}$.`),
        a: T(`$${k[1]}$`),
        w: W(
          T(`Write the decimal as a fraction: $${k[0]} = \\dfrac{${Math.round(k[0] * 1000)}}{1000}$`, `Tulis perpuluhan itu sebagai pecahan: $${k[0]} = \\dfrac{${Math.round(k[0] * 1000)}}{1000}$`),
          T(`$\\sqrt[3]{\\dfrac{${Math.round(k[0] * 1000)}}{1000}} = \\dfrac{${Math.round(k[1] * 10)}}{10} = ${k[1]}$`),
          T(`Check: $${k[1]} \\times ${k[1]} \\times ${k[1]} = ${k[0]}$`, `Semak: $${k[1]} \\times ${k[1]} \\times ${k[1]} = ${k[0]}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const e = r.int(3, 12);
      return {
        q: T(`A solid metal cube has a volume of $${e ** 3}\\ \\text{cm}^3$. Find (a) the length of one edge, (b) the area of one face.`, `Sebuah kubus logam pepejal mempunyai isi padu $${e ** 3}\\ \\text{cm}^3$. Cari (a) panjang satu tepi, (b) luas satu permukaan.`),
        a: T(`(a) ${e} cm (b) $${e * e}\\ \\text{cm}^2$`),
        w: W(
          T(`(a) Volume $= e^3$, so $e = \\sqrt[3]{${e ** 3}} = ${e}$ cm.`, `(a) Isi padu $= e^3$, jadi $e = \\sqrt[3]{${e ** 3}} = ${e}$ cm.`),
          T(`(b) Every face is a square of side ${e} cm: area $= ${e}^2 = ${e * e}\\ \\text{cm}^2$.`, `(b) Setiap permukaan ialah segi empat sama bersisi ${e} cm: luas $= ${e}^2 = ${e * e}\\ \\text{cm}^2$.`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5), c = r.int(2, 4);
      return {
        q: T(`Evaluate $\\sqrt[3]{${a ** 3}} \\times ${b}^2 - \\sqrt{${c * c * 16}} \\div ${c}$.`, `Hitung $\\sqrt[3]{${a ** 3}} \\times ${b}^2 - \\sqrt{${c * c * 16}} \\div ${c}$.`),
        a: T(`$${a * b * b - 4}$`),
        w: W(
          T(`Roots and powers first: $\\sqrt[3]{${a ** 3}} = ${a}$, $${b}^2 = ${b * b}$, $\\sqrt{${c * c * 16}} = ${4 * c}$.`, `Punca dan kuasa dahulu: $\\sqrt[3]{${a ** 3}} = ${a}$, $${b}^2 = ${b * b}$, $\\sqrt{${c * c * 16}} = ${4 * c}$.`),
          T(`Then $\\times$ and $\\div$: $${a} \\times ${b * b} = ${a * b * b}$ and $${4 * c} \\div ${c} = 4$.`, `Kemudian $\\times$ dan $\\div$: $${a} \\times ${b * b} = ${a * b * b}$ dan $${4 * c} \\div ${c} = 4$.`),
          T(`Last, subtract: $${a * b * b} - 4 = ${a * b * b - 4}$`, `Akhir sekali, tolak: $${a * b * b} - 4 = ${a * b * b - 4}$`),
        ),
        sp: 'm',
      };
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
      return {
        q: T(`Simplify the ratio $${a * g} : ${b * g}$.`, `Ringkaskan nisbah $${a * g} : ${b * g}$.`),
        a: T(`$${a} : ${b}$`),
        w: W(
          T(`The HCF of $${a * g}$ and $${b * g}$ is $${g}$.`, `FSTB bagi $${a * g}$ dan $${b * g}$ ialah $${g}$.`),
          T(`Divide both parts by $${g}$: $${a * g} \\div ${g} = ${a}$ and $${b * g} \\div ${g} = ${b}$`, `Bahagi kedua-dua bahagian dengan $${g}$: $${a * g} \\div ${g} = ${a}$ dan $${b * g} \\div ${g} = ${b}$`),
          T(`$${a} : ${b}$`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const [p] = r.pair();
      const a = r.int(2, 9), b = r.int(2, 9);
      need(a !== b);
      const G = gcd(a * 3, b * 3);
      return {
        q: T(`In a class there are ${a * 3} boys and ${b * 3} girls. Write the ratio of the number of boys to the number of girls in its simplest form.`, `Dalam sebuah kelas terdapat ${a * 3} murid lelaki dan ${b * 3} murid perempuan. Tulis nisbah bilangan murid lelaki kepada bilangan murid perempuan dalam bentuk termudah.`),
        a: T(`$${simpRatio(a * 3, b * 3).join(' : ')}$`),
        w: W(
          T(`Boys to girls $= ${a * 3} : ${b * 3}$ (keep the order asked for).`, `Lelaki kepada perempuan $= ${a * 3} : ${b * 3}$ (kekalkan tertib yang diminta).`),
          T(`Divide both parts by their HCF $${G}$: $${simpRatio(a * 3, b * 3).join(' : ')}$`, `Bahagi kedua-dua bahagian dengan FSTB $${G}$: $${simpRatio(a * 3, b * 3).join(' : ')}$`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 7), k = r.int(2, 6);
      need(a !== b);
      return {
        q: T(`Find the value of $x$ in the equivalent ratios $${a} : ${b} = ${a * k} : x$.`, `Cari nilai $x$ dalam nisbah setara $${a} : ${b} = ${a * k} : x$.`),
        a: T(`$x = ${b * k}$`),
        w: W(
          T(`The first part was multiplied by $${a * k} \\div ${a} = ${k}$.`, `Bahagian pertama didarab dengan $${a * k} \\div ${a} = ${k}$.`),
          T(`Equivalent ratios multiply both parts by the same number: $x = ${b} \\times ${k} = ${b * k}$`, `Nisbah setara mendarab kedua-dua bahagian dengan nombor yang sama: $x = ${b} \\times ${k} = ${b * k}$`),
        ),
        sp: 'xs',
      };
    },
  ];
  const g41m = [
    (r) => {
      const rmv = r.pick([[50, 2], [80, 3], [60, 1], [25, 2], [40, 4]]);
      const [s, R] = rmv;
      const rs = simpRatio(s, R * 100);
      return {
        q: T(`Express the ratio ${s} sen to RM${R} in its simplest form.`, `Ungkapkan nisbah ${s} sen kepada RM${R} dalam bentuk termudah.`),
        a: T(`$${rs.join(' : ')}$`),
        w: W(
          T(`A ratio needs the same unit on both sides: RM${R} $= ${R * 100}$ sen.`, `Nisbah memerlukan unit yang sama pada kedua-dua belah: RM${R} $= ${R * 100}$ sen.`),
          T(`Ratio $= ${s} : ${R * 100}$`, `Nisbah $= ${s} : ${R * 100}$`),
          T(`Divide both parts by their HCF $${gcd(s, R * 100)}$: $${rs.join(' : ')}$`, `Bahagi kedua-dua bahagian dengan FSTB $${gcd(s, R * 100)}$: $${rs.join(' : ')}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const [a, b, c] = [r.int(2, 8), r.int(2, 8), r.int(2, 8)];
      need(gcd(gcd(a, b), c) === 1 && new Set([a, b, c]).size >= 2);
      const k = r.int(2, 5);
      const x = r.int(1, 3);
      return {
        q: T(`Simplify the ratio $${a * k} : ${b * k} : ${c * k}$.`, `Ringkaskan nisbah $${a * k} : ${b * k} : ${c * k}$.`),
        a: T(`$${a} : ${b} : ${c}$`),
        w: W(
          T(`The HCF of $${a * k}$, $${b * k}$ and $${c * k}$ is $${k}$.`, `FSTB bagi $${a * k}$, $${b * k}$ dan $${c * k}$ ialah $${k}$.`),
          T(`Divide every part by $${k}$: $${a * k} \\div ${k} = ${a}$, $${b * k} \\div ${k} = ${b}$, $${c * k} \\div ${k} = ${c}$`, `Bahagi setiap bahagian dengan $${k}$: $${a * k} \\div ${k} = ${a}$, $${b * k} \\div ${k} = ${b}$, $${c * k} \\div ${k} = ${c}$`),
          T(`$${a} : ${b} : ${c}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = r.pick([2, 4, 5, 8]), b = r.int(a + 1, 21);
      need(gcd(a, b) === 1);
      return {
        q: T(`Express the ratio $${a} : ${b}$ in the form $1 : n$.`, `Ungkapkan nisbah $${a} : ${b}$ dalam bentuk $1 : n$.`),
        a: T(`$1 : ${n(round(b / a, 3))}$`),
        w: W(
          T(`To make the first part $1$, divide both parts by $${a}$.`, `Untuk menjadikan bahagian pertama $1$, bahagi kedua-dua bahagian dengan $${a}$.`),
          T(`$${a} \\div ${a} = 1$ and $${b} \\div ${a} = ${n(round(b / a, 3))}$`, `$${a} \\div ${a} = 1$ dan $${b} \\div ${a} = ${n(round(b / a, 3))}$`),
          T(`$1 : ${n(round(b / a, 3))}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 9);
      need(a !== b && gcd(a, b) === 1);
      const [p] = r.pair();
      return {
        q: T(`The ratio of the number of red marbles to blue marbles is $${a} : ${b}$. What fraction of the marbles are red?`, `Nisbah bilangan guli merah kepada guli biru ialah $${a} : ${b}$. Apakah pecahan guli yang berwarna merah?`),
        a: T(`$\\dfrac{${a}}{${a + b}}$`),
        w: W(
          T(`The ratio $${a} : ${b}$ means $${a}$ parts red out of $${a} + ${b} = ${a + b}$ parts altogether.`, `Nisbah $${a} : ${b}$ bermaksud $${a}$ bahagian merah daripada $${a} + ${b} = ${a + b}$ bahagian kesemuanya.`),
          T(`Fraction that is red $= \\dfrac{${a}}{${a + b}}$`, `Pecahan yang berwarna merah $= \\dfrac{${a}}{${a + b}}$`),
          T(`A common mistake is to write $\\dfrac{${a}}{${b}}$, but that compares red with blue, not with the total.`, `Kesilapan biasa ialah menulis $\\dfrac{${a}}{${b}}$, tetapi itu membandingkan merah dengan biru, bukan dengan jumlahnya.`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = r.pick([300, 450, 600, 750, 1200]), b = r.pick([2, 3, 5]);
      return {
        q: T(`Express the ratio ${a} g to ${b} kg in its simplest form.`, `Ungkapkan nisbah ${a} g kepada ${b} kg dalam bentuk termudah.`),
        a: T(`$${simpRatio(a, b * 1000).join(' : ')}$`),
        w: W(
          T(`Use the same unit on both sides: ${b} kg $= ${b * 1000}$ g.`, `Guna unit yang sama pada kedua-dua belah: ${b} kg $= ${b * 1000}$ g.`),
          T(`Ratio $= ${a} : ${b * 1000}$`, `Nisbah $= ${a} : ${b * 1000}$`),
          T(`Divide both parts by their HCF $${gcd(a, b * 1000)}$: $${simpRatio(a, b * 1000).join(' : ')}$`, `Bahagi kedua-dua bahagian dengan FSTB $${gcd(a, b * 1000)}$: $${simpRatio(a, b * 1000).join(' : ')}$`),
        ),
        sp: 's',
      };
    },
  ];
  const g41a = [
    (r) => {
      const a = r.int(1, 5), b = r.int(2, 7), c = r.int(2, 7), d = r.int(2, 7);
      need(gcd(a, b) === 1 && gcd(c, d) === 1 && b !== c);
      const l = lcm(b, c);
      const x = [a * (l / b), b * (l / b), d * (l / c)];
      const g = gcd(gcd(x[0], x[1]), x[2]);
      return {
        q: T(`Given $a : b = ${a} : ${b}$ and $b : c = ${c} : ${d}$, find $a : b : c$.`, `Diberi $a : b = ${a} : ${b}$ dan $b : c = ${c} : ${d}$, cari $a : b : c$.`),
        a: T(`$${x.map((v) => v / g).join(' : ')}$`),
        w: W(
          T(`$b$ must be the same number in both ratios: the LCM of $${b}$ and $${c}$ is $${l}$.`, `$b$ mesti nombor yang sama dalam kedua-dua nisbah: GSTK bagi $${b}$ dan $${c}$ ialah $${l}$.`),
          T(`$a : b = ${a} : ${b} = ${x[0]} : ${l}$ (both parts $\\times ${l / b}$)`, `$a : b = ${a} : ${b} = ${x[0]} : ${l}$ (kedua-dua bahagian $\\times ${l / b}$)`),
          T(`$b : c = ${c} : ${d} = ${l} : ${x[2]}$ (both parts $\\times ${l / c}$)`, `$b : c = ${c} : ${d} = ${l} : ${x[2]}$ (kedua-dua bahagian $\\times ${l / c}$)`),
          T(`$a : b : c = ${x.join(' : ')}${g === 1 ? '' : ' = ' + x.map((v) => v / g).join(' : ')}$`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(a + 1, 9), add = r.int(1, 4);
      need(gcd(a, b) === 1);
      const k = r.int(2, 5);
      const A = a * k, B = b * k;
      const nn = simpRatio(A + add, B + add);
      need(nn[0] !== A + add || true);
      return {
        q: T(`The ratio of the ages of two brothers is $${a} : ${b}$. Their ages are ${A} and ${B} years. Find the ratio of their ages after ${add} years, in its simplest form.`, `Nisbah umur dua orang adik-beradik ialah $${a} : ${b}$. Umur mereka ialah ${A} dan ${B} tahun. Cari nisbah umur mereka selepas ${add} tahun, dalam bentuk termudah.`),
        a: T(`$${nn.join(' : ')}$`),
        w: W(
          T(`Each age grows by ${add}: $${A} + ${add} = ${A + add}$ and $${B} + ${add} = ${B + add}$.`, `Setiap umur bertambah ${add}: $${A} + ${add} = ${A + add}$ dan $${B} + ${add} = ${B + add}$.`),
          T(`New ratio $= ${A + add} : ${B + add}$`, `Nisbah baharu $= ${A + add} : ${B + add}$`),
          gcd(A + add, B + add) === 1
            ? T(`Their HCF is $1$, so $${nn.join(' : ')}$ is already the simplest form.`, `FSTB mereka ialah $1$, jadi $${nn.join(' : ')}$ memang bentuk termudah.`)
            : T(`Divide both parts by their HCF $${gcd(A + add, B + add)}$: $${nn.join(' : ')}$`, `Bahagi kedua-dua bahagian dengan FSTB $${gcd(A + add, B + add)}$: $${nn.join(' : ')}$`),
          T(`Note that the ratio changes: adding the same number to both ages does not keep $${a} : ${b}$.`, `Perhatikan bahawa nisbah itu berubah: menambah nombor yang sama kepada kedua-dua umur tidak mengekalkan $${a} : ${b}$.`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 8), add = r.int(2, 6);
      need(gcd(a, b) === 1 && a !== b);
      const k = r.int(2, 6);
      const A = a * k, B = b * k;
      const after = simpRatio(A + add, B + add);
      return {
        q: T(`A number of red and blue pens are in the ratio $${a} : ${b}$. If ${add} more of each colour are added, there are ${A + add} red pens and ${B + add} blue pens. Find how many pens of each colour there were originally.`, `Sebilangan pen merah dan biru berada dalam nisbah $${a} : ${b}$. Jika ${add} batang lagi bagi setiap warna ditambah, terdapat ${A + add} batang pen merah dan ${B + add} batang pen biru. Cari bilangan asal pen bagi setiap warna.`),
        a: T(`${A} red, ${B} blue`, `${A} merah, ${B} biru`),
        w: W(
          T(`Work backwards and take away the ${add} that were added to each colour.`, `Kira ke belakang dan tolak ${add} yang ditambah kepada setiap warna.`),
          T(`Red $= ${A + add} - ${add} = ${A}$; blue $= ${B + add} - ${add} = ${B}$`, `Merah $= ${A + add} - ${add} = ${A}$; biru $= ${B + add} - ${add} = ${B}$`),
          T(`Check: $${A} : ${B} = ${a} : ${b}$, as given.`, `Semak: $${A} : ${B} = ${a} : ${b}$, seperti yang diberi.`),
        ),
        sp: 'm',
      };
    },
  ];
  const g42e = [
    (r) => {
      const c = r.int(2, 9), q = r.int(2, 6);
      const item = r.pick([[T('kg of rice', 'kg beras'), 'kg'], [T('kg of sugar', 'kg gula'), 'kg'], [T('litres of petrol', 'liter petrol'), 'l']]);
      return {
        q: T(`RM${c * q} is paid for ${q} ${item[0].en}. Find the price per ${item[1]}.`, `RM${c * q} dibayar bagi ${q} ${item[0].ms}. Cari harga per ${item[1]}.`),
        a: T(`RM${c} per ${item[1]}`, `RM${c} per ${item[1]}`),
        w: W(
          T(`"Per ${item[1]}" means the cost of $1$ ${item[1]}, so divide the total by the quantity.`, `"Per ${item[1]}" bermaksud kos bagi $1$ ${item[1]}, jadi bahagikan jumlah dengan kuantitinya.`),
          T(`$${c * q} \\div ${q} = ${c}$`),
          T(`RM${c} per ${item[1]}`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const v = r.int(30, 90), t = r.int(2, 6);
      return {
        q: T(`A car travels ${v * t} km in ${t} hours. Find its speed in km/h.`, `Sebuah kereta bergerak ${v * t} km dalam ${t} jam. Cari lajunya dalam km/j.`),
        a: T(`${v} km/h`, `${v} km/j`),
        w: W(
          T('Speed $=$ distance $\\div$ time.', 'Laju $=$ jarak $\\div$ masa.'),
          T(`$${v * t} \\div ${t} = ${v}$`),
          T(`${v} km/h`, `${v} km/j`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const w = r.int(6, 15), h = r.int(4, 8);
      return {
        q: T(`Rahman earns RM${w * h} for working ${h} hours. Find his hourly wage.`, `Rahman memperoleh RM${w * h} kerana bekerja ${h} jam. Cari upah sejamnya.`),
        a: T(`RM${w}/hour`, `RM${w}/jam`),
        w: W(
          T('The hourly wage is the pay for $1$ hour, so divide the total pay by the number of hours.', 'Upah sejam ialah bayaran bagi $1$ jam, jadi bahagikan jumlah bayaran dengan bilangan jam.'),
          T(`$${w * h} \\div ${h} = ${w}$`),
          T(`RM${w} per hour`, `RM${w} sejam`),
        ),
        sp: 'xs',
      };
    },
  ];
  const g42m = [
    (r) => {
      const p1 = r.pick([[3, 4.5], [2, 3.4], [5, 8.5], [4, 5.6]]), p2 = r.pick([[6, 8.4], [10, 15.5], [8, 10.4], [2, 3.1]]);
      const u1 = round(p1[1] / p1[0], 4), u2 = round(p2[1] / p2[0], 4);
      need(u1 !== u2);
      const best = u1 < u2 ? 'A' : 'B';
      return {
        q: T(`Shop A sells ${p1[0]} kg of flour for RM${n(p1[1])} and Shop B sells ${p2[0]} kg for RM${n(p2[1])}. Which shop offers the better price per kg?`, `Kedai A menjual ${p1[0]} kg tepung dengan harga RM${n(p1[1])} dan Kedai B menjual ${p2[0]} kg dengan harga RM${n(p2[1])}. Kedai manakah yang menawarkan harga per kg yang lebih baik?`),
        a: T(`Shop ${best} (RM${n(Math.min(u1, u2))}/kg vs RM${n(Math.max(u1, u2))}/kg)`, `Kedai ${best} (RM${n(Math.min(u1, u2))}/kg berbanding RM${n(Math.max(u1, u2))}/kg)`),
        w: W(
          T('The packs are different sizes, so compare the price of $1$ kg.', 'Saiz pek berbeza, jadi bandingkan harga bagi $1$ kg.'),
          T(`Shop A: $${n(p1[1])} \\div ${p1[0]} = ${n(u1)}$ per kg`, `Kedai A: $${n(p1[1])} \\div ${p1[0]} = ${n(u1)}$ per kg`),
          T(`Shop B: $${n(p2[1])} \\div ${p2[0]} = ${n(u2)}$ per kg`, `Kedai B: $${n(p2[1])} \\div ${p2[0]} = ${n(u2)}$ per kg`),
          T(`$${n(Math.min(u1, u2))} < ${n(Math.max(u1, u2))}$, so Shop ${best} is the better buy.`, `$${n(Math.min(u1, u2))} < ${n(Math.max(u1, u2))}$, jadi Kedai ${best} lebih berbaloi.`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const v = r.pick([40, 48, 60, 72]), h = r.int(2, 4), m = r.pick([15, 30, 45]);
      const t = h + m / 60;
      const d = v * t;
      return {
        q: T(`A bus travels at ${v} km/h for ${h} hours ${m} minutes. Calculate the distance travelled.`, `Sebuah bas bergerak pada ${v} km/j selama ${h} jam ${m} minit. Hitung jarak yang dilalui.`),
        a: T(`${n(d)} km`),
        w: W(
          T(`The speed is in km/h, so the time must be in hours: ${m} min $= \\dfrac{${m}}{60} = ${n(m / 60)}$ h.`, `Laju dalam km/j, jadi masa mesti dalam jam: ${m} min $= \\dfrac{${m}}{60} = ${n(m / 60)}$ j.`),
          T(`Time $= ${h} + ${n(m / 60)} = ${n(t)}$ h`, `Masa $= ${h} + ${n(m / 60)} = ${n(t)}$ j`),
          T(`Distance $=$ speed $\\times$ time $= ${v} \\times ${n(t)} = ${n(d)}$ km`, `Jarak $=$ laju $\\times$ masa $= ${v} \\times ${n(t)} = ${n(d)}$ km`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const usd = r.pick([4.2, 4.5, 4.4, 4.7]);
      const a = r.int(20, 90);
      return {
        q: T(`The exchange rate is USD1 = RM${usd}. Convert USD${a} to ringgit.`, `Kadar pertukaran ialah USD1 = RM${usd}. Tukarkan USD${a} kepada ringgit.`),
        a: T(`RM${n(round(a * usd, 2))}`),
        w: W(
          T(`Each USD is worth RM${usd}, so multiply by ${a}.`, `Setiap USD bernilai RM${usd}, jadi darab dengan ${a}.`),
          T(`$${a} \\times ${usd} = ${n(round(a * usd, 2))}$`),
          T(`RM${n(round(a * usd, 2))}`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const m = r.int(2, 9) * 100, l = r.int(2, 5) * 100;
      const den = round(m / l, 2);
      return {
        q: T(`A metal block has a mass of ${m} g and a volume of ${l} cm³. Find its density in g/cm³.`, `Sebuah bongkah logam berjisim ${m} g dan berisi padu ${l} cm³. Cari ketumpatannya dalam g/cm³.`),
        a: T(`${n(den)} g/cm³`),
        w: W(
          T('Density $=$ mass $\\div$ volume.', 'Ketumpatan $=$ jisim $\\div$ isi padu.'),
          T(`$${m} \\div ${l} ${Math.abs(m / l - den) < 1e-12 ? '=' : '\\approx'} ${n(den)}$`),
          T(`${n(den)} g/cm³`),
        ),
        sp: 's',
      };
    },
  ];
  const g42a = [
    (r) => {
      const v1 = r.pick([40, 60, 80]), v2 = r.pick([50, 90, 100]), d1 = r.int(2, 4) * 40, d2 = r.int(2, 4) * 50;
      const t1 = d1 / v1, t2 = d2 / v2;
      const avg = round((d1 + d2) / (t1 + t2), 2);
      need(v1 !== v2);
      const tt = Fr.add(fr(d1, v1), fr(d2, v2));
      return {
        q: T(`A driver travels ${d1} km at ${v1} km/h and then ${d2} km at ${v2} km/h. Find the average speed for the whole journey (correct to 2 decimal places if necessary).`, `Seorang pemandu memandu sejauh ${d1} km pada ${v1} km/j dan kemudian ${d2} km pada ${v2} km/j. Cari purata laju bagi keseluruhan perjalanan (betul kepada 2 tempat perpuluhan jika perlu).`),
        a: T(`${n(avg)} km/h`, `${n(avg)} km/j`),
        w: W(
          T('Average speed uses the total distance and the total time — it is not the mean of the two speeds.', 'Purata laju menggunakan jumlah jarak dan jumlah masa — ia bukan min bagi kedua-dua laju itu.'),
          T(`Total distance $= ${d1} + ${d2} = ${d1 + d2}$ km`, `Jumlah jarak $= ${d1} + ${d2} = ${d1 + d2}$ km`),
          T(`Total time $= \\dfrac{${d1}}{${v1}} + \\dfrac{${d2}}{${v2}} = ${frT(tt)}$ h`, `Jumlah masa $= \\dfrac{${d1}}{${v1}} + \\dfrac{${d2}}{${v2}} = ${frT(tt)}$ j`),
          T(`Average speed $= ${d1 + d2} \\div ${frT(tt)} ${Math.abs((d1 + d2) / Fr.val(tt) - avg) < 1e-9 ? '=' : '\\approx'} ${n(avg)}$ km/h`, `Purata laju $= ${d1 + d2} \\div ${frT(tt)} ${Math.abs((d1 + d2) / Fr.val(tt) - avg) < 1e-9 ? '=' : '\\approx'} ${n(avg)}$ km/j`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const mpm = r.pick([60, 75, 90, 120, 150]);
      const kmh = round((mpm * 60) / 1000, 2);
      return {
        q: T(`Convert ${mpm} m/min to km/h.`, `Tukarkan ${mpm} m/min kepada km/j.`),
        a: T(`${n(kmh)} km/h`, `${n(kmh)} km/j`),
        w: W(
          T(`In $1$ hour there are $60$ minutes: $${mpm} \\times 60 = ${mpm * 60}$ m per hour.`, `Dalam $1$ jam terdapat $60$ minit: $${mpm} \\times 60 = ${mpm * 60}$ m sejam.`),
          T(`$1$ km $= 1000$ m, so $${mpm * 60} \\div 1000 = ${n(kmh)}$.`, `$1$ km $= 1000$ m, jadi $${mpm * 60} \\div 1000 = ${n(kmh)}$.`),
          T(`${n(kmh)} km/h`, `${n(kmh)} km/j`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const q1 = r.pick([[6, 10.2], [5, 9.5], [4, 7.6]]);
      const l = r.int(20, 60);
      const rate1 = q1[1] / q1[0];
      const petrol = r.pick([2.05, 2.15, 2.6]);
      const kmL = r.pick([8, 10, 12, 16]);
      const d = kmL * r.int(4, 9);
      return {
        q: T(`A car uses 1 litre of petrol for every ${kmL} km. Petrol costs RM${petrol} per litre. Find the cost of petrol for a journey of ${d} km.`, `Sebuah kereta menggunakan 1 liter petrol bagi setiap ${kmL} km. Harga petrol ialah RM${petrol} seliter. Cari kos petrol bagi perjalanan sejauh ${d} km.`),
        a: T(`RM${fx((d / kmL) * petrol, 2)}`),
        w: W(
          T(`Petrol used $= ${d} \\div ${kmL} = ${n(d / kmL)}$ litres`, `Petrol digunakan $= ${d} \\div ${kmL} = ${n(d / kmL)}$ liter`),
          T(`Cost $= ${n(d / kmL)} \\times ${petrol} = ${fx((d / kmL) * petrol, 2)}$`, `Kos $= ${n(d / kmL)} \\times ${petrol} = ${fx((d / kmL) * petrol, 2)}$`),
          T(`RM${fx((d / kmL) * petrol, 2)}`),
        ),
        sp: 'm',
      };
    },
  ];
  const g43e = [
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 9), k = r.int(2, 5);
      need(a !== b);
      const which = r.chance();
      return which
        ? {
          q: T(`Find $x$ if $x : ${b * k} = ${a} : ${b}$.`, `Cari $x$ jika $x : ${b * k} = ${a} : ${b}$.`),
          a: T(`$x = ${a * k}$`),
          w: W(
            T(`Write the ratios as fractions: $\\dfrac{x}{${b * k}} = \\dfrac{${a}}{${b}}$`, `Tulis nisbah itu sebagai pecahan: $\\dfrac{x}{${b * k}} = \\dfrac{${a}}{${b}}$`),
            T(`The second part went from $${b}$ to $${b * k}$, i.e. $\\times ${k}$, so do the same to the first part.`, `Bahagian kedua berubah daripada $${b}$ kepada $${b * k}$, iaitu $\\times ${k}$, jadi lakukan yang sama pada bahagian pertama.`),
            T(`$x = ${a} \\times ${k} = ${a * k}$`),
          ),
          sp: 's',
        }
        : {
          q: T(`Solve $\\dfrac{${a}}{${b}} = \\dfrac{x}{${b * k}}$.`, `Selesaikan $\\dfrac{${a}}{${b}} = \\dfrac{x}{${b * k}}$.`),
          a: T(`$x = ${a * k}$`),
          w: W(
            T(`Cross-multiply: $${a} \\times ${b * k} = ${b} \\times x$`, `Darab silang: $${a} \\times ${b * k} = ${b} \\times x$`),
            T(`$${a * b * k} = ${b}x$`),
            T(`$x = ${a * b * k} \\div ${b} = ${a * k}$`),
          ),
          sp: 's',
        };
    },
    (r) => {
      const p = r.pick([[1, 2, 0.5, 50], [1, 4, 0.25, 25], [3, 4, 0.75, 75], [1, 5, 0.2, 20], [2, 5, 0.4, 40], [3, 5, 0.6, 60], [1, 10, 0.1, 10]]);
      return {
        q: T(`Express $\\dfrac{${p[0]}}{${p[1]}}$ as (a) a decimal, (b) a percentage.`, `Ungkapkan $\\dfrac{${p[0]}}{${p[1]}}$ sebagai (a) perpuluhan, (b) peratusan.`),
        a: T(`(a) $${p[2]}$ (b) $${p[3]}\\%$`),
        w: W(
          T(`(a) A fraction means a division: $${p[0]} \\div ${p[1]} = ${p[2]}$`, `(a) Pecahan bermaksud pembahagian: $${p[0]} \\div ${p[1]} = ${p[2]}$`),
          T(`(b) A percentage is a fraction out of $100$, so multiply by $100\\%$: $${p[2]} \\times 100\\% = ${p[3]}\\%$`, `(b) Peratusan ialah pecahan daripada $100$, jadi darab dengan $100\\%$: $${p[2]} \\times 100\\% = ${p[3]}\\%$`),
        ),
        sp: 's',
      };
    },
  ];
  const g43m = [
    (r) => {
      const a = r.int(2, 5), b = r.int(a + 1, 8);
      need(gcd(a, b) === 1);
      const tot = (a + b) * r.int(30, 130);
      const sh = tot / (a + b);
      const [p, q] = r.pair();
      return {
        q: T(`${p} and ${q} share RM${tot} in the ratio $${a} : ${b}$. Calculate each person's share.`, `${p} dan ${q} berkongsi RM${tot} dalam nisbah $${a} : ${b}$. Hitung bahagian setiap orang.`),
        a: T(`${p}: RM${a * sh}, ${q}: RM${b * sh}`),
        w: W(
          T(`Total parts $= ${a} + ${b} = ${a + b}$`, `Jumlah bahagian $= ${a} + ${b} = ${a + b}$`),
          T(`One part $= ${tot} \\div ${a + b} = ${sh}$`, `Satu bahagian $= ${tot} \\div ${a + b} = ${sh}$`),
          T(`${p} gets $${a} \\times ${sh} = ${a * sh}$ and ${q} gets $${b} \\times ${sh} = ${b * sh}$.`, `${p} mendapat $${a} \\times ${sh} = ${a * sh}$ dan ${q} mendapat $${b} \\times ${sh} = ${b * sh}$.`),
          T(`${p}: RM${a * sh}, ${q}: RM${b * sh} (check: $${a * sh} + ${b * sh} = ${tot}$)`, `${p}: RM${a * sh}, ${q}: RM${b * sh} (semak: $${a * sh} + ${b * sh} = ${tot}$)`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const a = r.int(1, 4), b = r.int(2, 5), c = r.int(3, 6);
      need(new Set([a, b, c]).size === 3);
      const tot = (a + b + c) * r.int(20, 90);
      const sh = tot / (a + b + c);
      const nm = r.names(3);
      return {
        q: T(`RM${tot} is divided among ${nm.join(', ')} in the ratio $${a} : ${b} : ${c}$. Find each share.`, `RM${tot} dibahagikan kepada ${nm.join(', ')} dalam nisbah $${a} : ${b} : ${c}$. Cari bahagian setiap orang.`),
        a: T(`RM${a * sh}, RM${b * sh}, RM${c * sh}`),
        w: W(
          T(`Total parts $= ${a} + ${b} + ${c} = ${a + b + c}$`, `Jumlah bahagian $= ${a} + ${b} + ${c} = ${a + b + c}$`),
          T(`One part $= ${tot} \\div ${a + b + c} = ${sh}$`, `Satu bahagian $= ${tot} \\div ${a + b + c} = ${sh}$`),
          T(`Shares: $${a} \\times ${sh} = ${a * sh}$, $${b} \\times ${sh} = ${b * sh}$, $${c} \\times ${sh} = ${c * sh}$`, `Bahagian: $${a} \\times ${sh} = ${a * sh}$, $${b} \\times ${sh} = ${b * sh}$, $${c} \\times ${sh} = ${c * sh}$`),
          T(`RM${a * sh}, RM${b * sh}, RM${c * sh}`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const part = r.pick([12, 15, 18, 24, 30, 36, 45]), whole = r.pick([40, 50, 60, 80, 100, 120, 150]);
      need((part * 100) % whole === 0 && part < whole);
      const x = (part * 100) / whole;
      return {
        q: T(`Use a proportion to find what percentage ${part} is of ${whole}.`, `Gunakan kaedah kadaran untuk mencari peratusan ${part} daripada ${whole}.`),
        a: T(`$${x}\\%$`),
        w: W(
          T(`Set up the proportion: $\\dfrac{${part}}{${whole}} = \\dfrac{x}{100}$`, `Bentukkan kadaran: $\\dfrac{${part}}{${whole}} = \\dfrac{x}{100}$`),
          T(`Cross-multiply: $${whole}x = ${part} \\times 100 = ${part * 100}$`, `Darab silang: $${whole}x = ${part} \\times 100 = ${part * 100}$`),
          T(`$x = ${part * 100} \\div ${whole} = ${x}$, so ${part} is $${x}\\%$ of ${whole}.`, `$x = ${part * 100} \\div ${whole} = ${x}$, jadi ${part} ialah $${x}\\%$ daripada ${whole}.`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const srv = r.int(3, 6), need_ = r.int(2, 5) * 2 + srv;
      const flour = r.pick([120, 150, 200, 250]);
      const a = flour * need_ / srv;
      need(Number.isInteger(a) || Math.abs(a - round(a, 1)) < 1e-9);
      return {
        q: T(`A recipe uses ${flour} g of flour to make ${srv} muffins. How much flour is needed to make ${need_} muffins?`, `Sebuah resipi menggunakan ${flour} g tepung untuk membuat ${srv} biji muffin. Berapakah tepung yang diperlukan untuk membuat ${need_} biji muffin?`),
        a: T(`${n(a)} g`),
        w: W(
          T('More muffins need proportionally more flour, so multiply by the ratio of the two numbers of muffins.', 'Lebih banyak muffin memerlukan lebih banyak tepung secara berkadaran, jadi darab dengan nisbah kedua-dua bilangan muffin itu.'),
          T(`Flour $= ${flour} \\times \\dfrac{${need_}}{${srv}} = ${n(a)}$ g`, `Tepung $= ${flour} \\times \\dfrac{${need_}}{${srv}} = ${n(a)}$ g`),
          T(`${n(a)} g`),
        ),
        sp: 'm',
      };
    },
  ];
  const g43a = [
    (r) => {
      const a = r.int(2, 5), b = r.int(a + 1, 8);
      need(gcd(a, b) === 1);
      const tot = (a + b) * r.int(40, 160);
      const sh = tot / (a + b);
      const [p, q] = r.pair();
      return {
        q: T(`${p} and ${q} share RM${tot} in the ratio $${a} : ${b}$. Find (a) how much more ${q} receives than ${p}, (b) the percentage of the total that ${p} receives.`, `${p} dan ${q} berkongsi RM${tot} dalam nisbah $${a} : ${b}$. Cari (a) berapa lebih banyak ${q} menerima berbanding ${p}, (b) peratusan daripada jumlah yang diterima ${p}.`),
        a: T(`(a) RM${(b - a) * sh} (b) $${n(round((a * 100) / (a + b), 2))}\\%$`),
        w: W(
          T(`Total parts $= ${a} + ${b} = ${a + b}$, so one part $= ${tot} \\div ${a + b} = ${sh}$.`, `Jumlah bahagian $= ${a} + ${b} = ${a + b}$, jadi satu bahagian $= ${tot} \\div ${a + b} = ${sh}$.`),
          T(`(a) The difference is $${b} - ${a} = ${b - a}$ parts: $${b - a} \\times ${sh} = ${(b - a) * sh}$, i.e. RM${(b - a) * sh}.`, `(a) Bezanya ialah $${b} - ${a} = ${b - a}$ bahagian: $${b - a} \\times ${sh} = ${(b - a) * sh}$, iaitu RM${(b - a) * sh}.`),
          T(`(b) ${p} gets $${a}$ parts out of $${a + b}$: $\\dfrac{${a}}{${a + b}} \\times 100\\% ${(a * 100) % (a + b) === 0 ? '=' : '\\approx'} ${n(round((a * 100) / (a + b), 2))}\\%$`, `(b) ${p} mendapat $${a}$ bahagian daripada $${a + b}$: $\\dfrac{${a}}{${a + b}} \\times 100\\% ${(a * 100) % (a + b) === 0 ? '=' : '\\approx'} ${n(round((a * 100) / (a + b), 2))}\\%$`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const a = r.int(2, 4), b = r.int(a + 1, 6);
      need(gcd(a, b) === 1);
      const k = r.int(3, 9);
      const diff = (b - a) * k;
      return {
        q: T(`The ratio of the number of boys to girls in a club is $${a} : ${b}$. There are ${diff} more girls than boys. Find the total number of members.`, `Nisbah bilangan murid lelaki kepada murid perempuan dalam sebuah kelab ialah $${a} : ${b}$. Terdapat ${diff} lebih murid perempuan berbanding murid lelaki. Cari jumlah bilangan ahli.`),
        a: T(`${(a + b) * k}`),
        w: W(
          T(`The difference in parts is $${b} - ${a} = ${b - a}$.`, `Beza bahagian ialah $${b} - ${a} = ${b - a}$.`),
          b - a === 1
            ? T(`That one part represents ${diff} members, so $1$ part $= ${k}$.`, `Satu bahagian itu mewakili ${diff} ahli, jadi $1$ bahagian $= ${k}$.`)
            : T(`Those $${b - a}$ parts represent ${diff} members, so $1$ part $= ${diff} \\div ${b - a} = ${k}$.`, `$${b - a}$ bahagian itu mewakili ${diff} ahli, jadi $1$ bahagian $= ${diff} \\div ${b - a} = ${k}$.`),
          T(`Total $= ${a} + ${b} = ${a + b}$ parts $= ${a + b} \\times ${k} = ${(a + b) * k}$`, `Jumlah $= ${a} + ${b} = ${a + b}$ bahagian $= ${a + b} \\times ${k} = ${(a + b) * k}$`),
          T(`${(a + b) * k} members (${a * k} boys and ${b * k} girls).`, `${(a + b) * k} ahli (${a * k} lelaki dan ${b * k} perempuan).`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const tot = r.int(4, 9) * 10;
      const pct = r.pick([20, 25, 40, 60]);
      const part = (tot * pct) / 100;
      const price = r.pick([6, 8, 12, 15]);
      return {
        q: T(`A shop has ${tot} shirts. ${pct}% of them are sold at RM${price} each and the rest at RM${price - 2} each. Find the total sales value.`, `Sebuah kedai mempunyai ${tot} helai baju. ${pct}% daripadanya dijual pada harga RM${price} sehelai dan selebihnya pada harga RM${price - 2} sehelai. Cari jumlah nilai jualan.`),
        a: T(`RM${part * price + (tot - part) * (price - 2)}`),
        w: W(
          T(`Shirts at RM${price}: $\\dfrac{${pct}}{100} \\times ${tot} = ${part}$`, `Baju pada RM${price}: $\\dfrac{${pct}}{100} \\times ${tot} = ${part}$`),
          T(`The rest: $${tot} - ${part} = ${tot - part}$ shirts at RM${price - 2}.`, `Selebihnya: $${tot} - ${part} = ${tot - part}$ helai pada RM${price - 2}.`),
          T(`Total $= ${part} \\times ${price} + ${tot - part} \\times ${price - 2} = ${part * price} + ${(tot - part) * (price - 2)} = ${part * price + (tot - part) * (price - 2)}$`, `Jumlah $= ${part} \\times ${price} + ${tot - part} \\times ${price - 2} = ${part * price} + ${(tot - part) * (price - 2)} = ${part * price + (tot - part) * (price - 2)}$`),
          T(`RM${part * price + (tot - part) * (price - 2)}`),
        ),
        sp: 'm',
      };
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
        [T(`${k} more than ${v}`, `${k} lebih daripada ${v}`), `${v} + ${k}`, T(`"More than" means add, so start from $${v}$ and add $${k}$: $${v} + ${k}$`, `"Lebih daripada" bermaksud tambah, jadi mula dengan $${v}$ dan tambah $${k}$: $${v} + ${k}$`)],
        [T(`${k} less than ${v}`, `${k} kurang daripada ${v}`), `${v} - ${k}`, T(`"${k} less than ${v}" means start from $${v}$ and take away $${k}$: $${v} - ${k}$ — not $${k} - ${v}$.`, `"${k} kurang daripada ${v}" bermaksud mula dengan $${v}$ dan tolak $${k}$: $${v} - ${k}$ — bukan $${k} - ${v}$.`)],
        [T(`${k} times ${v}`, `${k} kali ${v}`), `${k}${v}`, T(`"Times" means multiply, and $${k} \\times ${v}$ is written without the sign as $${k}${v}$.`, `"Kali" bermaksud darab, dan $${k} \\times ${v}$ ditulis tanpa tandanya sebagai $${k}${v}$.`)],
        [T(`${v} divided by ${k}`, `${v} dibahagi dengan ${k}`), `\\dfrac{${v}}{${k}}`, T(`A division is written as a fraction with $${v}$ on top: $\\dfrac{${v}}{${k}}$`, `Pembahagian ditulis sebagai pecahan dengan $${v}$ di atas: $\\dfrac{${v}}{${k}}$`)],
      ]);
      return { q: T(`Write an algebraic expression for "${f[0].en}".`, `Tulis ungkapan algebra bagi "${f[0].ms}".`), a: T(`$${f[1]}$`), w: W(T('Translate the words one piece at a time.', 'Terjemahkan perkataan itu sebahagian demi sebahagian.'), f[2]), sp: 'xs' };
    },
    (r) => {
      const c = r.int(2, 9), v = r.pick(['x', 'y', 'a', 'p']);
      const t = r.int(2, 9);
      const e = `${c}${v}^2`;
      return {
        q: T(`For the term $${c * 1}${v}$, state the coefficient and the variable.`, `Bagi sebutan $${c}${v}$, nyatakan pekali dan pemboleh ubah.`),
        a: T(`Coefficient: $${c}$; variable: $${v}$`, `Pekali: $${c}$; pemboleh ubah: $${v}$`),
        w: W(
          T(`$${c}${v}$ is short for $${c} \\times ${v}$.`, `$${c}${v}$ ialah singkatan bagi $${c} \\times ${v}$.`),
          T(`The number multiplying the letter is the coefficient, $${c}$, and the letter itself is the variable, $${v}$.`, `Nombor yang mendarab huruf itu ialah pekali, $${c}$, dan huruf itu sendiri ialah pemboleh ubah, $${v}$.`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const v = r.pick(['x', 'y', 'a', 'p']);
      const k = r.int(2, 4);
      return {
        q: T(`Write $${Array(k).fill(v).join(' \\times ')}$ in index form.`, `Tulis $${Array(k).fill(v).join(' \\times ')}$ dalam bentuk indeks.`),
        a: T(`$${v}^{${k}}$`),
        w: W(
          T(`The factor $${v}$ is used ${k} times, and the index counts how many times a factor is repeated.`, `Faktor $${v}$ digunakan ${k} kali, dan indeks menghitung berapa kali faktor itu diulang.`),
          T(`$${Array(k).fill(v).join(' \\times ')} = ${v}^{${k}}$`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const c = r.int(2, 6);
      const ctx = r.pick([
        [T(`A car travels at a constant speed of ${c * 10} km/h for $t$ hours.`, `Sebuah kereta bergerak dengan laju tetap ${c * 10} km/j selama $t$ jam.`), 't', T('the time $t$ changes; the speed is fixed', 'masa $t$ berubah; laju adalah tetap'), T('speed', 'laju')],
        [T(`A pen costs RM${c} and $n$ pens are bought.`, `Harga sebatang pen ialah RM${c} dan $n$ batang pen dibeli.`), 'n', T('the number of pens $n$ changes; the price is fixed', 'bilangan pen $n$ berubah; harga adalah tetap'), T('price', 'harga')],
      ]);
      return {
        q: T(`${ctx[0].en} State the quantity that is a variable and the quantity that is fixed.`, `${ctx[0].ms} Nyatakan kuantiti yang merupakan pemboleh ubah dan kuantiti yang tetap.`),
        a: ctx[2],
        w: W(
          T('A variable is a quantity that can take different values; a fixed quantity (a constant) keeps the same value.', 'Pemboleh ubah ialah kuantiti yang boleh mengambil nilai berbeza; kuantiti tetap (pemalar) mengekalkan nilai yang sama.'),
          T(`Here $${ctx[1]}$ can change, while the ${ctx[3].en} of ${ctx[1] === 't' ? c * 10 + ' km/h' : 'RM' + c} is given once and stays the same.`, `Di sini $${ctx[1]}$ boleh berubah, manakala ${ctx[3].ms} ${ctx[1] === 't' ? c * 10 + ' km/j' : 'RM' + c} diberi sekali dan kekal sama.`),
        ),
        sp: 's',
      };
    },
  ];
  const g51m = [
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 9), v = r.pick(['x', 'y', 'n']);
      const f = r.pick([
        [T(`${a} more than twice ${v}`, `${a} lebih daripada dua kali ${v}`), `2${v} + ${a}`, T(`"Twice ${v}" is $2${v}$, and "${a} more than" adds $${a}$: $2${v} + ${a}$`, `"Dua kali ${v}" ialah $2${v}$, dan "${a} lebih daripada" menambah $${a}$: $2${v} + ${a}$`)],
        [T(`twice the sum of ${v} and ${b}`, `dua kali hasil tambah ${v} dan ${b}`), `2(${v} + ${b})`, T(`The sum is $${v} + ${b}$, and the whole sum is doubled, so it needs brackets: $2(${v} + ${b})$`, `Hasil tambahnya ialah $${v} + ${b}$, dan keseluruhan hasil tambah itu didua kalikan, jadi ia memerlukan kurungan: $2(${v} + ${b})$`)],
        [T(`${b} less than three times ${v}`, `${b} kurang daripada tiga kali ${v}`), `3${v} - ${b}`, T(`"Three times ${v}" is $3${v}$, and "${b} less than" subtracts $${b}$ from it: $3${v} - ${b}$`, `"Tiga kali ${v}" ialah $3${v}$, dan "${b} kurang daripada" menolak $${b}$ daripadanya: $3${v} - ${b}$`)],
        [T(`the product of ${v} and ${b}, divided by ${a}`, `hasil darab ${v} dan ${b}, dibahagi dengan ${a}`), `\\dfrac{${b}${v}}{${a}}`, T(`The product is $${b}${v}$, and dividing it by $${a}$ puts it over $${a}$: $\\dfrac{${b}${v}}{${a}}$`, `Hasil darabnya ialah $${b}${v}$, dan membahagikannya dengan $${a}$ meletakkannya di atas $${a}$: $\\dfrac{${b}${v}}{${a}}$`)],
      ]);
      return { q: T(`Write an algebraic expression for "${f[0].en}".`, `Tulis ungkapan algebra bagi "${f[0].ms}".`), a: T(`$${f[1]}$`), w: W(T('Translate the words one piece at a time.', 'Terjemahkan perkataan itu sebahagian demi sebahagian.'), f[2]), sp: 's' };
    },
    (r) => {
      const p = r.int(2, 9) / 2, c = r.int(2, 9);
      const [nm] = r.pair();
      return {
        q: T(`${nm} buys $p$ pens at RM${c} each and $q$ books at RM${c + 3} each. Write an expression for the total cost in RM.`, `${nm} membeli $p$ batang pen pada harga RM${c} sebatang dan $q$ buah buku pada harga RM${c + 3} sebuah. Tulis ungkapan bagi jumlah kos dalam RM.`),
        a: T(`$${c}p + ${c + 3}q$`),
        w: W(
          T(`Cost of the pens $= ${c} \\times p = ${c}p$`, `Kos pen $= ${c} \\times p = ${c}p$`),
          T(`Cost of the books $= ${c + 3} \\times q = ${c + 3}q$`, `Kos buku $= ${c + 3} \\times q = ${c + 3}q$`),
          T(`Total cost $= ${c}p + ${c + 3}q$ (the two terms are unlike, so they cannot be added further).`, `Jumlah kos $= ${c}p + ${c + 3}q$ (kedua-dua sebutan itu tidak serupa, jadi ia tidak boleh ditambah lagi).`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const v = r.pick(['x', 'a', 'p']), w = r.pick(['y', 'b', 'q']);
      return {
        q: T(`Write $${v} \\times ${v} \\times ${w} \\times ${v} \\times ${w}$ in index form.`, `Tulis $${v} \\times ${v} \\times ${w} \\times ${v} \\times ${w}$ dalam bentuk indeks.`),
        a: T(`$${v}^3${w}^2$`),
        w: W(
          T(`Count each letter: $${v}$ appears $3$ times and $${w}$ appears $2$ times.`, `Kira setiap huruf: $${v}$ muncul $3$ kali dan $${w}$ muncul $2$ kali.`),
          T(`$${v} \\times ${v} \\times ${v} \\times ${w} \\times ${w} = ${v}^3${w}^2$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const k = r.int(3, 10);
      return {
        q: T(`A rectangle has length $(x + ${k})$ cm and width $x$ cm. Write an expression for its perimeter.`, `Sebuah segi empat tepat mempunyai panjang $(x + ${k})$ cm dan lebar $x$ cm. Tulis ungkapan bagi perimeternya.`),
        a: T(`$(4x + ${2 * k})$ cm`),
        w: W(
          T('Perimeter $= 2 \\times (\\text{length} + \\text{width})$', 'Perimeter $= 2 \\times (\\text{panjang} + \\text{lebar})$'),
          T(`$= 2[(x + ${k}) + x] = 2(2x + ${k})$`),
          T(`$= 4x + ${2 * k}$, so the perimeter is $(4x + ${2 * k})$ cm.`, `$= 4x + ${2 * k}$, jadi perimeternya ialah $(4x + ${2 * k})$ cm.`),
        ),
        sp: 's',
      };
    },
  ];
  const g51a = [
    (r) => {
      const a = r.int(2, 5), b = r.int(1, 4);
      const w = r.int(2, 5), l = r.int(1, 4);
      return {
        q: T(`A rectangle has length $(${lin(a, b, 'a')})$ cm and width $(${lin(w, -l, 'a')})$ cm. Write and simplify an expression for its perimeter.`, `Sebuah segi empat tepat mempunyai panjang $(${lin(a, b, 'a')})$ cm dan lebar $(${lin(w, -l, 'a')})$ cm. Tulis dan ringkaskan satu ungkapan bagi perimeternya.`),
        a: T(`$(${lin(2 * (a + w), 2 * (b - l), 'a')})$ cm`),
        w: W(
          T('Perimeter $= 2 \\times (\\text{length} + \\text{width})$', 'Perimeter $= 2 \\times (\\text{panjang} + \\text{lebar})$'),
          T(`Add the like terms first: $(${lin(a, b, 'a')}) + (${lin(w, -l, 'a')}) = ${lin(a + w, b - l, 'a')}$`, `Tambah sebutan serupa dahulu: $(${lin(a, b, 'a')}) + (${lin(w, -l, 'a')}) = ${lin(a + w, b - l, 'a')}$`),
          T(`$2(${lin(a + w, b - l, 'a')}) = ${lin(2 * (a + w), 2 * (b - l), 'a')}$`),
          T(`$(${lin(2 * (a + w), 2 * (b - l), 'a')})$ cm`),
        ),
        sp: 'm',
      };
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
      a: T(`(a) $${expanded.join(' \\times ')}$ (b) $${prod}$`),
      w: W(
        T(`(a) The index $${a}$ means $${v}$ is used as a factor $${a}$ times, and $${b}$ means $${w}$ is used $${b}$ times: $${expanded.join(' \\times ')}$`, `(a) Indeks $${a}$ bermaksud $${v}$ digunakan sebagai faktor $${a}$ kali, dan $${b}$ bermaksud $${w}$ digunakan $${b}$ kali: $${expanded.join(' \\times ')}$`),
        T(`(b) The order of the factors does not matter: count $${a}$ of $${v}$ and $${b}$ of $${w}$, giving $${prod}$.`, `(b) Tertib faktor tidak penting: kira $${a}$ bagi $${v}$ dan $${b}$ bagi $${w}$, memberi $${prod}$.`),
      ),
      sp: 'm',
    };
  };
  g51a[2] = (r) => {
    const c = r.int(2, 5), d = r.int(2, 6);
    return {
      q: T(`The price of a shirt is RM$x$. During a sale it is reduced by RM${c}. Ali buys ${d} shirts. (a) Write an expression for his total payment. (b) State the coefficient of $x$ after simplifying.`, `Harga sehelai baju ialah RM$x$. Semasa jualan, harganya dikurangkan sebanyak RM${c}. Ali membeli ${d} helai baju. (a) Tulis ungkapan bagi jumlah bayarannya. (b) Nyatakan pekali $x$ selepas diringkaskan.`),
      a: T(`(a) RM$${d}(x - ${c}) = ${d}x - ${c * d}$ (b) $${d}$`),
      w: W(
        T(`(a) One shirt in the sale costs $(x - ${c})$, because the price drops by RM${c}.`, `(a) Sehelai baju semasa jualan berharga $(x - ${c})$, kerana harganya turun sebanyak RM${c}.`),
        T(`For ${d} shirts: $${d}(x - ${c}) = ${d}x - ${c * d}$`, `Bagi ${d} helai baju: $${d}(x - ${c}) = ${d}x - ${c * d}$`),
        T(`(b) In $${d}x - ${c * d}$ the number multiplying $x$ is $${d}$, so the coefficient of $x$ is $${d}$.`, `(b) Dalam $${d}x - ${c * d}$, nombor yang mendarab $x$ ialah $${d}$, jadi pekali $x$ ialah $${d}$.`),
      ),
      sp: 'm',
    };
  };

  const g52e = [
    (r) => {
      const a = r.int(2, 9), b = r.int(1, a - 1), v = r.pick(['a', 'x', 'p', 'm']);
      return {
        q: T(`Simplify $${a}${v} - ${b}${v}$.`, `Ringkaskan $${a}${v} - ${b}${v}$.`),
        a: T(`$${termOf(a - b, v)}$`),
        w: W(
          T(`Both terms have the same variable $${v}$, so they are like terms and can be combined.`, `Kedua-dua sebutan mempunyai pemboleh ubah $${v}$ yang sama, jadi ia sebutan serupa dan boleh digabungkan.`),
          T(`Subtract the coefficients: $${a} - ${b} = ${a - b}$, giving $${termOf(a - b, v)}$.`, `Tolak pekalinya: $${a} - ${b} = ${a - b}$, memberi $${termOf(a - b, v)}$.`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const a = r.int(2, 8), b = r.int(2, 8), v = r.pick(['x', 'y', 'p']), c = r.int(2, 6);
      return {
        q: T(`Simplify $${a}${v} + ${b}${v} + ${c}$.`, `Ringkaskan $${a}${v} + ${b}${v} + ${c}$.`),
        a: T(`$${termOf(a + b, v)} + ${c}$`),
        w: W(
          T(`$${a}${v}$ and $${b}${v}$ are like terms: $${a} + ${b} = ${a + b}$, so they give $${termOf(a + b, v)}$.`, `$${a}${v}$ dan $${b}${v}$ ialah sebutan serupa: $${a} + ${b} = ${a + b}$, jadi ia memberi $${termOf(a + b, v)}$.`),
          T(`$${c}$ has no $${v}$, so it cannot be combined with them: $${termOf(a + b, v)} + ${c}$`, `$${c}$ tiada $${v}$, jadi ia tidak boleh digabungkan dengannya: $${termOf(a + b, v)} + ${c}$`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9);
      const A = r.pick(['x', 'y', 'a', 'p']);
      return {
        q: T(`Evaluate $${a}x + ${b}$ when $x = ${c}$.`, `Hitung $${a}x + ${b}$ apabila $x = ${c}$.`),
        a: T(`$${a * c + b}$`),
        w: W(
          T(`Replace $x$ by $${c}$: $${a}(${c}) + ${b}$`, `Gantikan $x$ dengan $${c}$: $${a}(${c}) + ${b}$`),
          T(`$= ${a * c} + ${b} = ${a * c + b}$`),
        ),
        sp: 'xs',
      };
    },
    (r) => {
      const a = r.int(2, 7), b = r.int(2, 7);
      return {
        q: T(`Simplify $${a}p \\times ${b}q$.`, `Ringkaskan $${a}p \\times ${b}q$.`),
        a: T(`$${a * b}pq$`),
        w: W(
          T(`Multiply the numbers and the letters separately: $${a} \\times ${b} = ${a * b}$ and $p \\times q = pq$.`, `Darab nombor dan huruf secara berasingan: $${a} \\times ${b} = ${a * b}$ dan $p \\times q = pq$.`),
          T(`$${a}p \\times ${b}q = ${a * b}pq$`),
        ),
        sp: 'xs',
      };
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
      return {
        q: T(`Simplify $${poly([[a, 'x'], [b, 'y'], [c, 'x'], [d, 'y']])}$.`, `Ringkaskan $${poly([[a, 'x'], [b, 'y'], [c, 'x'], [d, 'y']])}$.`),
        a: T(`$${poly([[x, 'x'], [y, 'y']])}$`),
        w: W(
          T('Collect the like terms, keeping the sign in front of each term.', 'Kumpulkan sebutan serupa, dengan mengekalkan tanda di hadapan setiap sebutan.'),
          T(`$x$ terms: $${n(a)} + ${par(c)} = ${x}$`),
          T(`$y$ terms: $${n(b)} + ${par(d)} = ${y}$`),
          T(`$${poly([[x, 'x'], [y, 'y']])}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), p = r.int(1, 3), q = r.int(1, 2);
      const v = r.pick(['p', 'x', 'a']);
      const A = a * b, k = r.int(2, 6);
      return {
        q: T(`Simplify $${A * k}${v}^2 \\div ${k}${v}$.`, `Ringkaskan $${A * k}${v}^2 \\div ${k}${v}$.`),
        a: T(`$${A}${v}$`),
        w: W(
          T(`Divide the numbers: $${A * k} \\div ${k} = ${A}$`, `Bahagi nombornya: $${A * k} \\div ${k} = ${A}$`),
          T(`Divide the letters: $${v}^2 \\div ${v} = ${v}$ (one $${v}$ cancels).`, `Bahagi hurufnya: $${v}^2 \\div ${v} = ${v}$ (satu $${v}$ terbatal).`),
          T(`$${A}${v}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5);
      return {
        q: T(`Simplify $${a}p \\times ${b}q$ and $${a * b * 4}x^2 \\div ${b * 2}x$.`, `Ringkaskan $${a}p \\times ${b}q$ dan $${a * b * 4}x^2 \\div ${b * 2}x$.`),
        a: T(`$${a * b}pq$; $${termOf((a * b * 4) / (b * 2), 'x')}$`),
        w: W(
          T(`$${a}p \\times ${b}q = (${a} \\times ${b})pq = ${a * b}pq$`),
          T(`$${a * b * 4}x^2 \\div ${b * 2}x = (${a * b * 4} \\div ${b * 2}) \\times (x^2 \\div x) = ${termOf((a * b * 4) / (b * 2), 'x')}$`),
        ),
        sp: 's',
      };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 6), x = r.int(2, 5), y = r.nz(-4, 4);
      return {
        q: T(`Find the value of $${a}x - ${b}y$ when $x = ${x}$ and $y = ${y}$.`, `Cari nilai $${a}x - ${b}y$ apabila $x = ${x}$ dan $y = ${y}$.`),
        a: T(`$${a * x - b * y}$`),
        w: W(
          T(`Substitute $x = ${x}$ and $y = ${y}$, keeping brackets round the values: $${a}(${x}) - ${b}(${par(y)})$`, `Gantikan $x = ${x}$ dan $y = ${y}$, dengan mengekalkan kurungan pada nilainya: $${a}(${x}) - ${b}(${par(y)})$`),
          T(`$= ${a * x} - ${par(b * y)} = ${a * x - b * y}$`),
        ),
        sp: 's',
      };
    },
  ];
  const g52a = [
    (r) => {
      const fa = fr(r.int(1, 3), r.pick([2, 3, 4])), fb = fr(r.int(1, 3), r.pick([3, 5, 6]));
      const v = Fr.sub(fa, fb);
      need(fa.d !== fb.d);
      return {
        q: T(`Simplify $${frT(fa)}x - ${frT(fb)}x$.`, `Ringkaskan $${frT(fa)}x - ${frT(fb)}x$.`),
        a: T(`$${v.n === 0 ? '0' : (Fr.tex(v) + 'x')}$`),
        w: W(
          T(`Both terms are $x$ terms, so subtract the coefficients: $${frT(fa)} - ${frT(fb)}$`, `Kedua-dua sebutan ialah sebutan $x$, jadi tolak pekalinya: $${frT(fa)} - ${frT(fb)}$`),
          ...frAddSteps(fa, '-', fb),
          T(`$${v.n === 0 ? '0' : Fr.tex(v) + 'x'}$`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const a = r.int(-4, -1), k = r.int(2, 4);
      const c = r.int(1, 4), d = r.int(2, 7);
      const val = a ** 3 - k * a;
      return {
        q: T(`Find the value of $a^3 - ${k}a$ when $a = ${a}$.`, `Cari nilai $a^3 - ${k}a$ apabila $a = ${a}$.`),
        a: T(`$${val}$`),
        w: W(
          T(`Substitute $a = ${a}$ with brackets, so the negative sign is cubed too: $(${a})^3 - ${k}(${a})$`, `Gantikan $a = ${a}$ dengan kurungan, supaya tanda negatif turut dikuasatigakan: $(${a})^3 - ${k}(${a})$`),
          T(`$(${a})^3 = ${a ** 3}$ and $${k}(${a}) = ${k * a}$`, `$(${a})^3 = ${a ** 3}$ dan $${k}(${a}) = ${k * a}$`),
          T(`$= ${a ** 3} - ${par(k * a)} = ${val}$`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const [a, b, c, d, e] = [r.nz(-6, 6), r.nz(-6, 6), r.nz(-6, 6), r.nz(-6, 6), r.nz(-6, 6)];
      const terms = [[a, 'x'], [b, 'y'], [c, ''], [d, 'x'], [e, 'y'], [r.nz(-6, 6), '']];
      const xs = terms.filter((t) => t[1] === 'x').reduce((s, t) => s + t[0], 0);
      const ys = terms.filter((t) => t[1] === 'y').reduce((s, t) => s + t[0], 0);
      const cs = terms.filter((t) => t[1] === '').reduce((s, t) => s + t[0], 0);
      const shown = poly(r.shuffle(terms));
      const coefs = (k) => terms.filter((t) => t[1] === k).map((t) => t[0]);
      const sumLine = (list) => list.map((c, i) => (i === 0 ? n(c) : par(c))).join(' + ');
      return {
        q: T(`Simplify $${shown}$.`, `Ringkaskan $${shown}$.`),
        a: T(`$${poly([[xs, 'x'], [ys, 'y'], [cs, '']])}$`),
        w: W(
          T('Group the like terms, carrying the sign in front of each term with it.', 'Kumpulkan sebutan serupa, bawa tanda di hadapan setiap sebutan bersamanya.'),
          T(`$x$ terms: $${sumLine(coefs('x'))} = ${xs}$`),
          T(`$y$ terms: $${sumLine(coefs('y'))} = ${ys}$`),
          T(`Constant terms: $${sumLine(coefs(''))} = ${cs}$`, `Sebutan pemalar: $${sumLine(coefs(''))} = ${cs}$`),
          T(`$${poly([[xs, 'x'], [ys, 'y'], [cs, '']])}$`),
        ),
        sp: 'm',
      };
    },
    (r) => {
      const x = r.nz(-4, 4), y = r.nz(-4, 4);
      const a = r.int(2, 4), b = r.int(2, 4);
      const br = (t) => `(${n(t)})`;
      return {
        q: T(`Given $x = ${x}$ and $y = ${y}$, evaluate $${a}x^2 - ${b}xy + y^2$.`, `Diberi $x = ${x}$ dan $y = ${y}$, hitung $${a}x^2 - ${b}xy + y^2$.`),
        a: T(`$${a * x * x - b * x * y + y * y}$`),
        w: W(
          T(`Substitute with brackets: $${a}${br(x)}^2 - ${b}${br(x)}${br(y)} + ${br(y)}^2$`, `Gantikan dengan kurungan: $${a}${br(x)}^2 - ${b}${br(x)}${br(y)} + ${br(y)}^2$`),
          T(`$${br(x)}^2 = ${x * x}$, $${br(x)}${br(y)} = ${x * y}$, $${br(y)}^2 = ${y * y}$`),
          T(`$= ${a * x * x} - ${par(b * x * y)} + ${y * y} = ${a * x * x - b * x * y + y * y}$`),
        ),
        sp: 'm',
      };
    },
  ];
  SPM.addChapter(1, 5, T('Algebraic Expressions', 'Ungkapan Algebra'), [
    { id: '5.1', en: 'Variables and algebraic expressions', ms: 'Pemboleh ubah dan ungkapan algebra', gen: { e: g51e, m: g51m, a: g51a } },
    { id: '5.2', en: 'Algebraic expressions involving basic arithmetic operations', ms: 'Ungkapan algebra yang melibatkan operasi asas aritmetik', gen: { e: g52e, m: g52m, a: g52a } },
  ]);
})();
