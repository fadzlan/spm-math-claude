/* Variety pack x4a: extra generators for F4-1.1 .. F4-1.6, F4-2.1, F4-2.1E
 * (Form 4 Ch1 Quadratic Functions & Equations in One Variable, Ch2 Number Bases). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, Fr, poly, lin, gcd } = SPM;
  const S = SPM.svg;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const frT = Fr.tex;
  const fr = (a, b) => Fr.make(a, b);
  const Q = (a, b, c) => poly([[a, 'x^2'], [b, 'x'], [c, '']]);
  const LET = 'ABCD';
  /** MCQ block: correct tex string + pool of distractor tex strings (deduped, up to 3 sampled). */
  function mcq(r, correct, pool) {
    const uniq = [...new Set(pool.filter((s) => s !== correct))];
    const chosen = r.sample(uniq, Math.min(3, uniq.length));
    const opts = r.shuffle([correct, ...chosen]);
    const letter = LET[opts.indexOf(correct)];
    const list = opts.map((o, i) => `(${LET[i]}) $${o}$`).join('  ');
    return { list, letter };
  }
  /** run one task family: draw shared context, pick one task-builder, normalise its return into a question object. */
  function fam(r, ctxFn, tasks, spDefault) {
    const ctx = ctxFn(r);
    const t = r.pick(tasks)(ctx, r);
    return { q: T(t.en, t.ms), a: T(t.aEn, t.aMs), w: t.wEn ? T(t.wEn, t.wMs) : undefined, fig: t.fig, sp: t.sp || spDefault || 's' };
  }

  /* =============================================================== 1.1 : characteristics */
  function nonQuadPool(r) {
    const a = r.int(2, 5), b = r.int(1, 6), c = r.int(1, 8);
    return [lin(a, b), `x^3 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x`, `${a}x^2 + \\dfrac{${b}}{x}`, `\\sqrt{x} + ${c}`, `${a}xy + ${b}x`, `${c}`, `\\dfrac{${a}}{x^2} + ${b}`];
  }
  const ctx11 = (r) => {
    const a = r.nz(-5, 5), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const x0 = r.nz(-4, 4);
    const val = a * x0 * x0 + b * x0 + c;
    return { a, b, c, x0, val };
  };
  const TASKS11_CORE = [
    ({ a, b, c }) => ({ en: `For the quadratic expression $${Q(a, b, c)}$, state the values of $a$, $b$ and $c$ in $ax^2 + bx + c$.`, ms: `Bagi ungkapan kuadratik $${Q(a, b, c)}$, nyatakan nilai $a$, $b$ dan $c$ dalam $ax^2 + bx + c$.`, aEn: `$a = ${a}$, $b = ${b}$, $c = ${c}$`, aMs: `$a = ${a}$, $b = ${b}$, $c = ${c}$` }),
    ({ a, b, c }) => ({ en: `What is the coefficient of $x^2$ in $${Q(a, b, c)}$?`, ms: `Apakah pekali $x^2$ dalam $${Q(a, b, c)}$?`, aEn: `$${a}$`, aMs: `$${a}$` }),
    ({ a, b, c }) => ({ en: `What is the coefficient of $x$ in $${Q(a, b, c)}$?`, ms: `Apakah pekali $x$ dalam $${Q(a, b, c)}$?`, aEn: `$${b}$`, aMs: `$${b}$` }),
    ({ a, b, c }) => ({ en: `What is the constant term in $${Q(a, b, c)}$?`, ms: `Apakah sebutan malar dalam $${Q(a, b, c)}$?`, aEn: `$${c}$`, aMs: `$${c}$` }),
    ({ a, b, c, x0, val }) => ({ en: `Given $f(x) = ${Q(a, b, c)}$, find $f(${x0})$.`, ms: `Diberi $f(x) = ${Q(a, b, c)}$, cari $f(${x0})$.`, aEn: `$f(${x0}) = ${val}$`, aMs: `$f(${x0}) = ${val}$` }),
    ({ a, b, c }) => ({ en: `Is $${Q(a, b, c)} = 0$ an equation or an expression? Give a reason.`, ms: `Adakah $${Q(a, b, c)} = 0$ suatu persamaan atau ungkapan? Berikan sebab.`, aEn: `An equation, because it contains an "=" sign.`, aMs: `Persamaan, kerana ia mengandungi tanda "=".` }),
    ({ a, b, c }) => ({ en: `Is $f(x) = ${Q(a, b, c)}$ a function or an expression? Give a reason.`, ms: `Adakah $f(x) = ${Q(a, b, c)}$ suatu fungsi atau ungkapan? Berikan sebab.`, aEn: `A function, because it is written as $f(x) = \\ldots$, relating each $x$ to one output.`, aMs: `Fungsi, kerana ia ditulis sebagai $f(x) = \\ldots$, mengaitkan setiap $x$ dengan satu output.` }),
    ({ a, b, c }) => ({ en: `Is $${Q(a, b, c)}$ an expression, a function or an equation? Give a reason.`, ms: `Adakah $${Q(a, b, c)}$ suatu ungkapan, fungsi atau persamaan? Berikan sebab.`, aEn: `An expression, because it has no "=" sign and is not written as $f(x)$.`, aMs: `Ungkapan, kerana ia tiada tanda "=" dan tidak ditulis sebagai $f(x)$.` }),
    ({ a, b, c }) => ({ en: `What is the highest power of $x$ in $${Q(a, b, c)}$? Is this expression quadratic?`, ms: `Apakah kuasa tertinggi $x$ dalam $${Q(a, b, c)}$? Adakah ungkapan ini kuadratik?`, aEn: `Highest power is $2$; yes, it is quadratic.`, aMs: `Kuasa tertinggi ialah $2$; ya, ia kuadratik.` }),
    ({ a, b, c }) => ({ en: `Explain why $${Q(a, b, c)} = 0$ is a quadratic equation.`, ms: `Terangkan mengapa $${Q(a, b, c)} = 0$ ialah suatu persamaan kuadratik.`, aEn: `It is an equation (has "=") whose highest power of $x$ is $2$ with a nonzero coefficient $a = ${a}$.`, aMs: `Ia suatu persamaan (mempunyai "=") dengan kuasa tertinggi $x$ ialah $2$ dan pekali $a = ${a}$ tidak sifar.` }),
    ({ a, b, c }) => ({ en: `Rewrite the expression $${Q(a, b, c)}$ as a function of $x$, using function notation.`, ms: `Tuliskan semula ungkapan $${Q(a, b, c)}$ sebagai fungsi bagi $x$, menggunakan tatatanda fungsi.`, aEn: `$f(x) = ${Q(a, b, c)}$`, aMs: `$f(x) = ${Q(a, b, c)}$` }),
    ({ a, b, c }) => ({ en: `Rewrite the function $f(x) = ${Q(a, b, c)}$ as a quadratic equation equal to zero.`, ms: `Tuliskan semula fungsi $f(x) = ${Q(a, b, c)}$ sebagai suatu persamaan kuadratik yang bersamaan sifar.`, aEn: `$${Q(a, b, c)} = 0$`, aMs: `$${Q(a, b, c)} = 0$` }),
  ];
  const g11e1 = (r) => fam(r, ctx11, TASKS11_CORE);

  const ctx11z = (r) => {
    const a = r.nz(-5, 5); let b = r.nz(-6, 6), c = r.nz(-8, 8);
    const zero = r.pick(['b', 'c']);
    if (zero === 'b') b = 0; else c = 0;
    return { a, b, c, zero };
  };
  const TASKS11_ZERO = [
    ({ a, b, c }) => ({ en: `For the quadratic expression $${Q(a, b, c)}$, state the values of $a$, $b$ and $c$ in $ax^2 + bx + c$ (some may be $0$).`, ms: `Bagi ungkapan kuadratik $${Q(a, b, c)}$, nyatakan nilai $a$, $b$ dan $c$ dalam $ax^2 + bx + c$ (sesetengahnya mungkin $0$).`, aEn: `$a = ${a}$, $b = ${b}$, $c = ${c}$`, aMs: `$a = ${a}$, $b = ${b}$, $c = ${c}$` }),
    ({ a, b, c, zero }) => { const missing = zero === 'b' ? T('term in $x$', 'sebutan dalam $x$') : T('constant term', 'sebutan malar'); const sym = zero === 'b' ? 'b' : 'c'; return { en: `The ${missing.en} does not appear when the expression $${Q(a, b, c)}$ is written out. What is the value of its coefficient $${sym}$?`, ms: `${missing.ms} tidak kelihatan apabila ungkapan $${Q(a, b, c)}$ ditulis. Apakah nilai pekali $${sym}$ itu?`, aEn: `$${sym} = 0$ (the missing term has coefficient $0$)`, aMs: `$${sym} = 0$ (sebutan yang tiada mempunyai pekali $0$)` }; },
    ({ a, b, c }) => ({ en: `A student says $${Q(a, b, c)}$ is not quadratic because one of $a$, $b$, $c$ is missing from the written expression. Is the student correct? Explain.`, ms: `Seorang pelajar berkata $${Q(a, b, c)}$ bukan kuadratik kerana salah satu daripada $a$, $b$, $c$ tiada dalam ungkapan yang ditulis. Adakah pelajar itu betul? Terangkan.`, aEn: `No; a missing term simply has coefficient $0$. It is still quadratic since $a = ${a} \\neq 0$.`, aMs: `Tidak; sebutan yang tiada hanya mempunyai pekali $0$. Ia tetap kuadratik kerana $a = ${a} \\neq 0$.` }),
  ];
  const g11e2 = (r) => fam(r, ctx11z, TASKS11_ZERO);

  const ctx11kind = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-5, 5), c = r.nz(-6, 6);
    const kind = r.pick(['expr', 'func', 'eq']);
    const disp = kind === 'expr' ? `${Q(a, b, c)}` : kind === 'func' ? `f(x) = ${Q(a, b, c)}` : `${Q(a, b, c)} = 0`;
    const NM = { expr: T('an expression', 'suatu ungkapan'), func: T('a function', 'suatu fungsi'), eq: T('an equation', 'suatu persamaan') }[kind];
    return { a, b, c, kind, disp, NM };
  };
  const TASKS11_KIND = [
    ({ disp, NM }) => ({ en: `Is $${disp}$ an expression, a function or an equation? Give a reason.`, ms: `Adakah $${disp}$ suatu ungkapan, fungsi atau persamaan? Berikan sebab.`, aEn: `It is ${NM.en}.`, aMs: `Ia ialah ${NM.ms}.` }),
    ({ disp, NM, kind }) => ({ en: `Classify $${disp}$: (A) expression (B) function (C) equation (D) none of these.`, ms: `Klasifikasikan $${disp}$: (A) ungkapan (B) fungsi (C) persamaan (D) tiada satu pun.`, aEn: `(${kind === 'expr' ? 'A' : kind === 'func' ? 'B' : 'C'}) ${NM.en}`, aMs: `(${kind === 'expr' ? 'A' : kind === 'func' ? 'B' : 'C'}) ${NM.ms}` }),
  ];
  const g11e3 = (r) => fam(r, ctx11kind, TASKS11_KIND);

  const ctx11mcq = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const good = Q(a, b, c);
    return { a, b, c, good, bads: nonQuadPool(r) };
  };
  const TASKS11_MCQ = [
    ({ good, bads }, r) => { const m = mcq(r, good, bads); return { en: `Which of the following is a quadratic expression in $x$? ${m.list}`, ms: `Antara yang berikut, yang manakah ungkapan kuadratik dalam $x$? ${m.list}`, aEn: `(${m.letter})`, aMs: `(${m.letter})` }; },
    ({ good, bads }, r) => { const bad = r.pick(bads); const items = r.shuffle([{ s: good, q: true }, { s: bad, q: false }]); const ansIdx = items[0].q ? 1 : 0; return { en: `(A) $${items[0].s}$  (B) $${items[1].s}$. Which one is NOT a quadratic expression in $x$?`, ms: `(A) $${items[0].s}$  (B) $${items[1].s}$. Yang manakah BUKAN ungkapan kuadratik dalam $x$?`, aEn: `(${LET[ansIdx]}) $${items[ansIdx].s}$`, aMs: `(${LET[ansIdx]}) $${items[ansIdx].s}$` }; },
    ({ good, bads }, r) => { const list = r.shuffle([{ s: good, ok: true }, ...r.sample(bads, 3).map((s) => ({ s, ok: false }))]); const idx = list.findIndex((o) => o.ok); return { en: `Which of these expressions in $x$ is quadratic? (A) $${list[0].s}$ (B) $${list[1].s}$ (C) $${list[2].s}$ (D) $${list[3].s}$`, ms: `Antara ungkapan dalam $x$ berikut, yang manakah kuadratik? (A) $${list[0].s}$ (B) $${list[1].s}$ (C) $${list[2].s}$ (D) $${list[3].s}$`, aEn: `(${LET[idx]})`, aMs: `(${LET[idx]})` }; },
  ];
  const g11e4 = (r) => fam(r, ctx11mcq, TASKS11_MCQ);

  const g11e5 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const wrongPart = r.pick(['a', 'b', 'c']);
    const label = { a: T('the coefficient of $x^2$', 'pekali $x^2$'), b: T('the coefficient of $x$', 'pekali $x$'), c: T('the constant term', 'sebutan malar') }[wrongPart];
    const correct = { a, b, c }[wrongPart];
    const claim = correct + r.nz(1, 3);
    return { q: T(`True or false: for $${Q(a, b, c)}$, ${label.en} is $${claim}$?`, `Benar atau palsu: bagi $${Q(a, b, c)}$, ${label.ms} ialah $${claim}$?`), a: T(`False; ${label.en} is $${correct}$.`, `Palsu; ${label.ms} ialah $${correct}$.`), sp: 's' };
  };

  const g11e6 = (r) => {
    const a = r.nz(-3, 3), b = r.nz(-5, 5), c = r.nz(-6, 6);
    const disp = poly([[c, ''], [b, 'x'], [a, 'x^2']]); // c + bx + ax^2, same expression, reordered
    return { q: T(`For $y = ${disp}$ (written in the order $c + bx + ax^2$), what is the highest power of $x$? Is this a quadratic function?`, `Bagi $y = ${disp}$ (ditulis dalam susunan $c + bx + ax^2$), apakah kuasa tertinggi $x$? Adakah ini fungsi kuadratik?`), a: T('Highest power is 2; yes, it is a quadratic function (the terms are just written in a different order).', 'Kuasa tertinggi ialah 2; ya, ia fungsi kuadratik (sebutan hanya ditulis dalam susunan berlainan).'), sp: 's' };
  };

  const g11e7 = (r) => {
    const a = r.nz(-3, 3), b = r.nz(-4, 4), c = r.nz(-5, 5);
    const xs = r.sample(range(-2, 2), 3).sort((p, q) => p - q);
    const tab = SPM.table([['$x$', ...xs.map((x) => `$${x}$`)], ['$f(x)$', ...xs.map(() => '')]]);
    return { q: T(`Complete the table of values for $f(x) = ${Q(a, b, c)}$.<br>${tab}`, `Lengkapkan jadual nilai bagi $f(x) = ${Q(a, b, c)}$.<br>${tab}`), a: T(`$f(x) = ${xs.map((x) => a * x * x + b * x + c).join(', ')}$`), sp: 's' };
  };

  const g11e8 = (r) => {
    const p = r.nz(-4, 4);
    const a = r.pick([1, -1, 2, -2]);
    const v1 = a * p * p;
    return { q: T(`For $f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}x^2$, find $f(${p})$ and $f(${-p})$. What do you notice?`, `Bagi $f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}x^2$, cari $f(${p})$ dan $f(${-p})$. Apakah yang anda perhatikan?`), a: T(`$f(${p}) = f(${-p}) = ${v1}$; two different $x$-values give the same output, so $f$ is many-to-one.`, `$f(${p}) = f(${-p}) = ${v1}$; dua nilai $x$ yang berbeza memberikan output yang sama, jadi $f$ ialah hubungan banyak-kepada-satu.`), sp: 's' };
  };

  const g11e9 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const list = r.shuffle([
      { s: `${Q(a, b, c)}`, k: T('an expression', 'ungkapan') },
      { s: `g(x) = ${Q(a, b, c)}`, k: T('a function', 'fungsi') },
      { s: `${Q(a, b, c)} = 0`, k: T('an equation', 'persamaan') },
    ]);
    return { q: T(`Match each item to its correct type (expression / function / equation): (A) $${list[0].s}$ (B) $${list[1].s}$ (C) $${list[2].s}$`, `Padankan setiap item dengan jenis yang betul (ungkapan / fungsi / persamaan): (A) $${list[0].s}$ (B) $${list[1].s}$ (C) $${list[2].s}$`), a: T(`(A) ${list[0].k.en} (B) ${list[1].k.en} (C) ${list[2].k.en}`, `(A) ${list[0].k.ms} (B) ${list[1].k.ms} (C) ${list[2].k.ms}`), sp: 's' };
  };
  const REPR11 = [
    { key: 'std', render: (a, b, c) => `${Q(a, b, c)}` },
    { key: 'reord', render: (a, b, c) => poly([[c, ''], [b, 'x'], [a, 'x^2']]) },
    { key: 'func', render: (a, b, c) => `f(x) = ${Q(a, b, c)}` },
    { key: 'eq', render: (a, b, c) => `${Q(a, b, c)} = 0` },
  ];
  const TARGET11 = [
    { sym: 'a', label: T('the coefficient of $x^2$', 'pekali $x^2$'), get: (a) => a },
    { sym: 'b', label: T('the coefficient of $x$', 'pekali $x$'), get: (a, b) => b },
    { sym: 'c', label: T('the constant term', 'sebutan malar'), get: (a, b, c) => c },
  ];
  const g11e10 = (r) => {
    const a = r.nz(-5, 5), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const rep = r.pick(REPR11), tgt = r.pick(TARGET11);
    const disp = rep.render(a, b, c);
    const val = tgt.get(a, b, c);
    return { q: T(`In $${disp}$, state ${tgt.label.en}.`, `Dalam $${disp}$, nyatakan ${tgt.label.ms}.`), a: T(`$${val}$`), sp: 'xs' };
  };
  const INTRO11 = [
    (lbl, y) => T(`State the value of ${lbl.en} in $${y}$.`, `Nyatakan nilai ${lbl.ms} dalam $${y}$.`),
    (lbl, y) => T(`What is ${lbl.en} in $${y}$?`, `Apakah ${lbl.ms} dalam $${y}$?`),
    (lbl, y) => T(`Identify ${lbl.en} in the expression $${y}$.`, `Kenal pasti ${lbl.ms} dalam ungkapan $${y}$.`),
    (lbl, y) => T(`For the quadratic $${y}$, write down ${lbl.en}.`, `Bagi kuadratik $${y}$, tuliskan ${lbl.ms}.`),
    (lbl, y) => T(`Given $${y}$, determine ${lbl.en}.`, `Diberi $${y}$, tentukan ${lbl.ms}.`),
    (lbl, y) => T(`Complete: in $${y}$, ${lbl.en} is ___.`, `Lengkapkan: dalam $${y}$, ${lbl.ms} ialah ___.`),
    (lbl, y) => T(`Read off ${lbl.en} directly from $${y}$.`, `Baca terus ${lbl.ms} daripada $${y}$.`),
    (lbl, y) => T(`Pick out ${lbl.en} from the expression $${y}$.`, `Pilih ${lbl.ms} daripada ungkapan $${y}$.`),
  ];
  const g11e11 = (r) => {
    const a = r.nz(-5, 5), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const y = Q(a, b, c);
    const tgt = r.pick(TARGET11);
    const s = r.pick(INTRO11)(tgt.label, y);
    return { q: s, a: T(`$${tgt.get(a, b, c)}$`), sp: 'xs' };
  };
  const INTRO11K = [
    (y) => T(`Is $${y}$ an expression, a function or an equation? Give a reason.`, `Adakah $${y}$ suatu ungkapan, fungsi atau persamaan? Berikan sebab.`),
    (y) => T(`What type of mathematical object is $${y}$ — an expression, a function, or an equation?`, `Apakah jenis objek matematik $${y}$ — ungkapan, fungsi, atau persamaan?`),
    (y) => T(`Look at $${y}$. Decide whether it is an expression, a function or an equation, and explain your choice.`, `Lihat $${y}$. Putuskan sama ada ia ungkapan, fungsi atau persamaan, dan terangkan pilihan anda.`),
    (y) => T(`Classify $${y}$ as an expression, a function or an equation.`, `Klasifikasikan $${y}$ sebagai ungkapan, fungsi atau persamaan.`),
  ];
  const g11e12 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-5, 5), c = r.nz(-6, 6);
    const kind = r.pick(['expr', 'func', 'eq']);
    const y = kind === 'expr' ? `${Q(a, b, c)}` : kind === 'func' ? `f(x) = ${Q(a, b, c)}` : `${Q(a, b, c)} = 0`;
    const NM = { expr: T('an expression', 'suatu ungkapan'), func: T('a function', 'suatu fungsi'), eq: T('an equation', 'suatu persamaan') }[kind];
    const s = r.pick(INTRO11K)(y);
    return { q: s, a: T(`It is ${NM.en}.`, `Ia ialah ${NM.ms}.`), sp: 's' };
  };
  const INTRO11EV = [
    (y, x0) => T(`Given $f(x) = ${y}$, find $f(${x0})$.`, `Diberi $f(x) = ${y}$, cari $f(${x0})$.`),
    (y, x0) => T(`Evaluate $f(${x0})$ for $f(x) = ${y}$.`, `Nilaikan $f(${x0})$ bagi $f(x) = ${y}$.`),
    (y, x0) => T(`Substitute $x = ${x0}$ into $f(x) = ${y}$ and simplify.`, `Gantikan $x = ${x0}$ ke dalam $f(x) = ${y}$ dan permudahkan.`),
    (y, x0) => T(`If $f(x) = ${y}$, what is the value of $f(${x0})$?`, `Jika $f(x) = ${y}$, apakah nilai $f(${x0})$?`),
  ];
  const g11e13 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8), x0 = r.nz(-4, 4);
    const y = Q(a, b, c);
    const s = r.pick(INTRO11EV)(y, x0);
    return { q: s, a: T(`$f(${x0}) = ${a * x0 * x0 + b * x0 + c}$`), sp: 's' };
  };
  const INTRO11MCQ = [
    (m) => T(`Which of the following is a quadratic expression in $x$? ${m.list}`, `Antara yang berikut, yang manakah ungkapan kuadratik dalam $x$? ${m.list}`),
    (m) => T(`Choose the option below that is a quadratic expression in $x$. ${m.list}`, `Pilih pilihan di bawah yang merupakan ungkapan kuadratik dalam $x$. ${m.list}`),
    (m) => T(`Only one of the following is quadratic in $x$. Which one? ${m.list}`, `Hanya satu daripada berikut adalah kuadratik dalam $x$. Yang manakah? ${m.list}`),
  ];
  const g11e14 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const good = Q(a, b, c);
    const m = mcq(r, good, nonQuadPool(r));
    const s = r.pick(INTRO11MCQ)(m);
    return { q: s, a: T(`(${m.letter})`), sp: 's' };
  };
  const INTRO11M2 = [
    (y, p1, p2, v) => T(`For $f(x) = ${y}$, show that $f(${p1}) = f(${p2})$.`, `Bagi $f(x) = ${y}$, tunjukkan bahawa $f(${p1}) = f(${p2})$.`),
    (y, p1, p2, v) => T(`Check whether $f(${p1})$ and $f(${p2})$ are equal for $f(x) = ${y}$.`, `Semak sama ada $f(${p1})$ dan $f(${p2})$ adalah sama bagi $f(x) = ${y}$.`),
    (y, p1, p2, v) => T(`Two inputs, $x = ${p1}$ and $x = ${p2}$, are given for $f(x) = ${y}$. Do they share the same output?`, `Dua input, $x = ${p1}$ dan $x = ${p2}$, diberikan bagi $f(x) = ${y}$. Adakah kedua-duanya berkongsi output yang sama?`),
  ];
  const g11e15 = (r) => {
    const p = r.nz(-4, 4);
    const a = r.pick([1, -1, 2, -2]);
    const y = `${a === 1 ? '' : a === -1 ? '-' : a}x^2`;
    const v = a * p * p;
    const s = r.pick(INTRO11M2)(y, p, -p, v);
    return { q: s, a: T(`$f(${p}) = f(${-p}) = ${v}$; yes, they are equal.`, `$f(${p}) = f(${-p}) = ${v}$; ya, kedua-duanya sama.`), sp: 's' };
  };
  const INTRO11SEL = [
    (list) => T(`Which of these expressions in $x$ are quadratic? ${list}`, `Antara ungkapan dalam $x$ berikut, yang manakah kuadratik? ${list}`),
    (list) => T(`Tick all the quadratic expressions in $x$ below. ${list}`, `Tandakan semua ungkapan kuadratik dalam $x$ di bawah. ${list}`),
    (list) => T(`Exactly one of these is quadratic in $x$. Pick it out. ${list}`, `Tepat satu daripada ini kuadratik dalam $x$. Kenal pastikan. ${list}`),
  ];
  const g11e16 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const good = Q(a, b, c);
    const list = r.shuffle([{ s: good, ok: true }, ...r.sample(nonQuadPool(r), 3).map((s) => ({ s, ok: false }))]);
    const idx = list.findIndex((o) => o.ok);
    const listTxt = list.map((o, i) => `(${LET[i]}) $${o.s}$`).join('  ');
    const s = r.pick(INTRO11SEL)(listTxt);
    return { q: s, a: T(`(${LET[idx]}) only`, `(${LET[idx]}) sahaja`), sp: 's' };
  };
  const INTRO11HP = [
    (y) => T(`What is the highest power of $x$ in $${y}$?`, `Apakah kuasa tertinggi $x$ dalam $${y}$?`),
    (y) => T(`State the degree of the expression $${y}$.`, `Nyatakan darjah ungkapan $${y}$.`),
    (y) => T(`Find the largest exponent of $x$ appearing in $${y}$.`, `Cari eksponen $x$ terbesar yang muncul dalam $${y}$.`),
  ];
  const g11e17 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const y = Q(a, b, c);
    const s = r.pick(INTRO11HP)(y);
    return { q: s, a: T('$2$'), sp: 'xs' };
  };
  const INTRO11CMPE = [
    (y1, y2, lbl) => T(`Expression $P$: $y = ${y1}$. Expression $Q$: $y = ${y2}$. State ${lbl.en} of $P$ and of $Q$.`, `Ungkapan $P$: $y = ${y1}$. Ungkapan $Q$: $y = ${y2}$. Nyatakan ${lbl.ms} bagi $P$ dan bagi $Q$.`),
    (y1, y2, lbl) => T(`Two expressions are given: $P: y = ${y1}$ and $Q: y = ${y2}$. Write down ${lbl.en} for each.`, `Dua ungkapan diberikan: $P: y = ${y1}$ dan $Q: y = ${y2}$. Tuliskan ${lbl.ms} bagi setiap satu.`),
  ];
  const g11e18 = (r) => {
    const a1 = r.nz(-4, 4), b1 = r.nz(-6, 6), c1 = r.nz(-8, 8);
    const a2 = r.nz(-4, 4), b2 = r.nz(-6, 6), c2 = r.nz(-8, 8);
    const target = r.pick(['a', 'b', 'c']);
    const v1 = { a: a1, b: b1, c: c1 }[target], v2 = { a: a2, b: b2, c: c2 }[target];
    const label = { a: T('coefficient $a$', 'pekali $a$'), b: T('coefficient $b$', 'pekali $b$'), c: T('constant term $c$', 'sebutan malar $c$') }[target];
    const s = r.pick(INTRO11CMPE)(Q(a1, b1, c1), Q(a2, b2, c2), label);
    return { q: s, a: T(`$P$: $${v1}$; $Q$: $${v2}$`), sp: 's' };
  };
  const g11e = [g11e1, g11e2, g11e3, g11e4, g11e5, g11e6, g11e7, g11e8, g11e9, g11e10, g11e11, g11e12, g11e13, g11e14, g11e15, g11e16, g11e17, g11e18];

  /* ---- medium ---- */
  const ctx11rearr = (r) => { const p = r.int(2, 6), k = r.int(2, 12); return { p, k }; };
  const TASKS11_REARR = [
    ({ p, k }) => { const a = 1, b = p, c = -k; return { en: `Write $x(x + ${p}) = ${k}$ in the form $ax^2 + bx + c = 0$ and state $a$, $b$, $c$.`, ms: `Tulis $x(x + ${p}) = ${k}$ dalam bentuk $ax^2 + bx + c = 0$ dan nyatakan $a$, $b$, $c$.`, aEn: `$${Q(a, b, c)} = 0$; $a = ${a}$, $b = ${b}$, $c = ${c}$`, aMs: `$${Q(a, b, c)} = 0$; $a = ${a}$, $b = ${b}$, $c = ${c}$` }; },
    ({ p, k }) => { const a = 1, b = 2 * p, c = p * p - k; return { en: `Write $(x + ${p})^2 = ${k}$ in the form $ax^2 + bx + c = 0$ and state $a$, $b$, $c$.`, ms: `Tulis $(x + ${p})^2 = ${k}$ dalam bentuk $ax^2 + bx + c = 0$ dan nyatakan $a$, $b$, $c$.`, aEn: `$${Q(a, b, c)} = 0$; $a = ${a}$, $b = ${b}$, $c = ${c}$`, aMs: `$${Q(a, b, c)} = 0$; $a = ${a}$, $b = ${b}$, $c = ${c}$` }; },
    ({ p, k }) => { const a = p, b = -k, c = -p; return { en: `Write $${p}x^2 = ${k}x + ${p}$ in the form $ax^2 + bx + c = 0$ and state $a$, $b$, $c$.`, ms: `Tulis $${p}x^2 = ${k}x + ${p}$ dalam bentuk $ax^2 + bx + c = 0$ dan nyatakan $a$, $b$, $c$.`, aEn: `$${Q(a, b, c)} = 0$; $a = ${a}$, $b = ${b}$, $c = ${c}$`, aMs: `$${Q(a, b, c)} = 0$; $a = ${a}$, $b = ${b}$, $c = ${c}$` }; },
    ({ p, k }) => { const a = 1, b = -k, c = p; return { en: `Write $x^2 + ${p} = ${k}x$ in the form $ax^2 + bx + c = 0$ and state $a$, $b$, $c$.`, ms: `Tulis $x^2 + ${p} = ${k}x$ dalam bentuk $ax^2 + bx + c = 0$ dan nyatakan $a$, $b$, $c$.`, aEn: `$${Q(a, b, c)} = 0$; $a = ${a}$, $b = ${b}$, $c = ${c}$`, aMs: `$${Q(a, b, c)} = 0$; $a = ${a}$, $b = ${b}$, $c = ${c}$` }; },
    ({ p, k }) => { const a = 2, b = -2 * p, c = -k; return { en: `Write $2x(x - ${p}) = ${k}$ in the form $ax^2 + bx + c = 0$ and state $a$, $b$, $c$.`, ms: `Tulis $2x(x - ${p}) = ${k}$ dalam bentuk $ax^2 + bx + c = 0$ dan nyatakan $a$, $b$, $c$.`, aEn: `$${Q(a, b, c)} = 0$; $a = ${a}$, $b = ${b}$, $c = ${c}$`, aMs: `$${Q(a, b, c)} = 0$; $a = ${a}$, $b = ${b}$, $c = ${c}$` }; },
  ];
  const g11m1 = (r) => fam(r, ctx11rearr, TASKS11_REARR);

  const g11m2 = (r) => {
    const a = r.int(2, 5), c = r.int(1, 6);
    const pairs = [
      { f1: `y = ${a}x^2 + ${c}`, f2: `y = ${a}x + ${c}`, firstQuad: true, reason: T('it is linear', 'ia linear') },
      { f1: `y = (x + ${a})^2`, f2: `y = ${a}(x + ${c})`, firstQuad: true, reason: T('it is linear', 'ia linear') },
      { f1: `y = x^3 + ${a}x`, f2: `y = ${a}x^2 - ${c}`, firstQuad: false, reason: T('it is degree 3, not 2', 'kuasanya 3, bukan 2') },
    ];
    const p = r.pick(pairs);
    const quadOneEn = p.firstQuad ? 'The first' : 'The second', quadOneMs = p.firstQuad ? 'Yang pertama' : 'Yang kedua';
    const notOneEn = p.firstQuad ? 'the second' : 'the first', notOneMs = p.firstQuad ? 'yang kedua' : 'yang pertama';
    return { q: T(`Is $${p.f1}$ a quadratic function? Is $${p.f2}$? Give a reason for each.`, `Adakah $${p.f1}$ suatu fungsi kuadratik? Adakah $${p.f2}$? Berikan sebab bagi setiap satu.`), a: T(`${quadOneEn} is quadratic (highest power of $x$ is 2, $a \\neq 0$); ${notOneEn} is not, because ${p.reason.en}.`, `${quadOneMs} ialah fungsi kuadratik (kuasa tertinggi $x$ ialah 2, $a \\neq 0$); ${notOneMs} bukan, kerana ${p.reason.ms}.`), sp: 's' };
  };

  const ctx11m2o = (r) => {
    const p = r.int(-3, 3), d = r.int(1, 4), a = r.pick([1, 2, -1, -2]);
    const x0 = p - d, x1 = p + d, b = -2 * a * p, c = r.nz(-5, 5);
    const val = a * x0 * x0 + b * x0 + c, val1 = a * x1 * x1 + b * x1 + c;
    return { a, b, c, x0, x1, val, val1 };
  };
  const TASKS11_M2O = [
    ({ a, b, c, x0, x1, val }) => ({ en: `For $f(x) = ${Q(a, b, c)}$, verify that $f(${x0}) = f(${x1})$, then explain why a quadratic function is a many-to-one relation.`, ms: `Bagi $f(x) = ${Q(a, b, c)}$, sahkan bahawa $f(${x0}) = f(${x1})$, kemudian terangkan mengapa fungsi kuadratik ialah hubungan banyak-kepada-satu.`, aEn: `$f(${x0}) = f(${x1}) = ${val}$. Since two different $x$-values give the same output, $f$ is many-to-one.`, aMs: `$f(${x0}) = f(${x1}) = ${val}$. Oleh sebab dua nilai $x$ berbeza memberikan output yang sama, $f$ ialah banyak-kepada-satu.`, sp: 'm' }),
    ({ a, b, c, x0, x1 }, r) => {
      const others = range(-6, 6).filter((x) => x !== x0 && x !== x1);
      const wrongPair = r.pick(others);
      const lhs = a * x0 * x0 + b * x0 + c, rhs = a * wrongPair * wrongPair + b * wrongPair + c;
      const equal = lhs === rhs;
      return { en: `A student claims $f(${x0}) = f(${wrongPair})$ for $f(x) = ${Q(a, b, c)}$. Is the student correct? Justify by evaluating both.`, ms: `Seorang pelajar mendakwa $f(${x0}) = f(${wrongPair})$ bagi $f(x) = ${Q(a, b, c)}$. Adakah pelajar itu betul? Wajarkan dengan menilai kedua-duanya.`, aEn: `$f(${x0}) = ${lhs}$ and $f(${wrongPair}) = ${rhs}$; these are ${equal ? 'equal, so the student is correct' : `not equal, so the student is incorrect (the true matching value is $x = ${x1}$)`}.`, aMs: `$f(${x0}) = ${lhs}$ dan $f(${wrongPair}) = ${rhs}$; ini ${equal ? 'sama, jadi pelajar itu betul' : `tidak sama, jadi pelajar itu silap (nilai sepadan sebenar ialah $x = ${x1}$)`}.`, sp: 'm' };
    },
  ];
  const g11m3 = (r) => fam(r, ctx11m2o, TASKS11_M2O);

  const g11m4 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const wrongPart = r.pick(['a', 'b', 'c']);
    const student = wrongPart === 'a' ? { a: b, b, c } : wrongPart === 'b' ? { a, b: c, c: b } : { a, b, c: a };
    return { q: T(`A student wrote: "For $${Q(a, b, c)}$, $a = ${student.a}$, $b = ${student.b}$, $c = ${student.c}$." Identify and correct the error.`, `Seorang pelajar menulis: "Bagi $${Q(a, b, c)}$, $a = ${student.a}$, $b = ${student.b}$, $c = ${student.c}$." Kenal pasti dan betulkan kesilapan itu.`), a: T(`The student mixed up the coefficients; the correct values are $a = ${a}$, $b = ${b}$, $c = ${c}$.`, `Pelajar itu tersalah padankan pekali; nilai yang betul ialah $a = ${a}$, $b = ${b}$, $c = ${c}$.`), sp: 's' };
  };

  const g11m5 = (r) => {
    const b = r.nz(-4, 4), c = r.nz(-6, 6);
    return { q: T(`Write $\\dfrac{x^2}{2} ${b < 0 ? '-' : '+'} ${Math.abs(b)}x = ${-c}$ in the form $ax^2 + bx + c = 0$ and state $a$, $b$, $c$.`, `Tulis $\\dfrac{x^2}{2} ${b < 0 ? '-' : '+'} ${Math.abs(b)}x = ${-c}$ dalam bentuk $ax^2 + bx + c = 0$ dan nyatakan $a$, $b$, $c$.`), a: T(`$${Q(0.5, b, c)} = 0$; $a = 0.5$, $b = ${b}$, $c = ${c}$`), sp: 's' };
  };

  const g11m6 = (r) => {
    const items = [
      { fEn: 'f(x) = x^2', fMs: 'f(x) = x^2', many: true },
      { fEn: 'f(x) = 2x + 1', fMs: 'f(x) = 2x + 1', many: false },
    ];
    const it = r.pick(items);
    return { q: T(`Is the relation $${it.fEn}$ for $x \\in \\{-2, -1, 1, 2\\}$ many-to-one or one-to-one? Explain.`, `Adakah hubungan $${it.fMs}$ bagi $x \\in \\{-2, -1, 1, 2\\}$ banyak-kepada-satu atau satu-kepada-satu? Terangkan.`), a: it.many ? T('Many-to-one: e.g. $f(-1) = f(1) = 1$, two different inputs share an output.', 'Banyak-kepada-satu: cth. $f(-1) = f(1) = 1$, dua input berbeza berkongsi satu output.') : T('One-to-one: every input in the set gives a different output.', 'Satu-kepada-satu: setiap input dalam set memberikan output yang berbeza.'), sp: 's' };
  };

  const g11m7 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const target = r.pick(['a2', 'a1', 'a0']);
    const ask = { a2: T('the coefficient of $x^2$', 'pekali $x^2$'), a1: T('the coefficient of $x$', 'pekali $x$'), a0: T('the constant term', 'sebutan malar') }[target];
    const disp = poly([[c, ''], [b, 'x'], [a, 'x^2']]);
    return { q: T(`The equation $${disp} = 0$ is equivalent to the form $ax^2 + bx + c = 0$ (its terms are just written in a different order). State ${ask.en}.`, `Persamaan $${disp} = 0$ setara dengan bentuk $ax^2 + bx + c = 0$ (sebutannya hanya ditulis dalam susunan berlainan). Nyatakan ${ask.ms}.`), a: T(`$${{ a2: a, a1: b, a0: c }[target]}$`), sp: 's' };
  };

  const g11m8 = (r) => {
    const kind = r.chance();
    const s1 = T('A quadratic function can never be one-to-one over all real numbers.', 'Suatu fungsi kuadratik tidak boleh menjadi satu-kepada-satu ke atas semua nombor nyata.');
    const s2 = T('Every input value of a quadratic function has a unique output value.', 'Setiap nilai input suatu fungsi kuadratik mempunyai nilai output yang unik.');
    const s = kind ? s1 : s2;
    return { q: T(`True or false: "${s.en}" Give a reason.`, `Benar atau palsu: "${s.ms}" Berikan sebab.`), a: kind ? T('True: a quadratic graph is symmetrical, so pairs of different $x$-values (equidistant from the axis of symmetry) share the same output.', 'Benar: graf kuadratik adalah simetri, jadi pasangan nilai $x$ berbeza (jarak sama dari paksi simetri) berkongsi output yang sama.') : T('False: two different inputs can give the same output (many-to-one), e.g. $f(x) = x^2$ has $f(-2) = f(2)$.', 'Palsu: dua input berbeza boleh memberi output yang sama (banyak-kepada-satu), cth. $f(x) = x^2$ mempunyai $f(-2) = f(2)$.'), sp: 's' };
  };

  const g11m9 = (r) => {
    const p = r.int(-2, 2), a = r.pick([1, 2, -1, -2]), b = -2 * a * p, c = r.nz(-6, 6);
    const d = r.int(1, 3);
    const x0 = p - d, x1 = p + d;
    const others = range(-4, 4).filter((x) => x !== x0 && x !== x1 && x !== p);
    const extra = r.sample(others, 2);
    const xs = r.shuffle([x0, x1, ...extra]);
    const ys = xs.map((x) => a * x * x + b * x + c);
    const tab = SPM.table([['$x$', ...xs.map((x) => `$${x}$`)], ['$f(x)$', ...ys.map((y) => `$${y}$`)]]);
    const dupVal = a * x0 * x0 + b * x0 + c;
    return { q: T(`The table shows values of $f(x) = ${Q(a, b, c)}$.<br>${tab}<br>Which two $x$-values give the same $f(x)$? What does this show about $f$?`, `Jadual menunjukkan nilai $f(x) = ${Q(a, b, c)}$.<br>${tab}<br>Nilai $x$ manakah yang memberikan $f(x)$ yang sama? Apakah yang ditunjukkan oleh ini tentang $f$?`), a: T(`$x = ${x0}$ and $x = ${x1}$ both give $f(x) = ${dupVal}$, showing $f$ is many-to-one.`, `$x = ${x0}$ dan $x = ${x1}$ kedua-duanya memberikan $f(x) = ${dupVal}$, menunjukkan $f$ ialah banyak-kepada-satu.`), sp: 'm' };
  };
  const ctx11kond = (r) => { const t = r.int(2, 6), b = r.nz(1, 4); return { t, b }; };
  const TASKS11_KOND = [
    ({ t, b }) => ({ en: `$f(x) = (k - ${t})x^2 + ${b}x - 1$ is a quadratic function. What condition must $k$ satisfy?`, ms: `$f(x) = (k - ${t})x^2 + ${b}x - 1$ ialah fungsi kuadratik. Apakah syarat yang mesti dipenuhi oleh $k$?`, aEn: `$k \\neq ${t}$`, aMs: `$k \\neq ${t}$` }),
    ({ t }) => ({ en: `$f(x) = (${t} - k)x^2 - 2x + 5$ is a quadratic function. What condition must $k$ satisfy?`, ms: `$f(x) = (${t} - k)x^2 - 2x + 5$ ialah fungsi kuadratik. Apakah syarat yang mesti dipenuhi oleh $k$?`, aEn: `$k \\neq ${t}$`, aMs: `$k \\neq ${t}$` }),
    ({ t }) => { const kv = t % 2 === 0 ? n(t / 2) : frT(fr(t, 2)); return { en: `$f(x) = (2k - ${t})x^2 + 3x + 1$ is a quadratic function. What condition must $k$ satisfy?`, ms: `$f(x) = (2k - ${t})x^2 + 3x + 1$ ialah fungsi kuadratik. Apakah syarat yang mesti dipenuhi oleh $k$?`, aEn: `$k \\neq ${kv}$`, aMs: `$k \\neq ${kv}$` }; },
    ({ t }) => ({ en: `$f(x) = (k + ${t})x^2 - x + 2$ is a quadratic function. What condition must $k$ satisfy?`, ms: `$f(x) = (k + ${t})x^2 - x + 2$ ialah fungsi kuadratik. Apakah syarat yang mesti dipenuhi oleh $k$?`, aEn: `$k \\neq -${t}$`, aMs: `$k \\neq -${t}$` }),
  ];
  const g11m10 = (r) => fam(r, ctx11kond, TASKS11_KOND);

  const ctx11expand = (r) => {
    const p = r.int(2, 6), q = r.int(1, 5), k = r.int(1, 15);
    return { p, q, k };
  };
  const TASKS11_EXPAND = [
    ({ p, q, k }, r) => {
      const good = `(x + ${p})(x + ${q}) = ${k}`;
      const bads = [`(x + ${p}) + (x + ${q}) = ${k}`, `(x + ${p})(x + ${q}) - x^2 = ${k}`, `x(x^2 + ${p}) = ${k}`, `2(x + ${p}) = ${k}`, `\\dfrac{x + ${p}}{x} = ${k}`];
      const m = mcq(r, good, bads);
      return { en: `Which of the following, after full expansion, is a quadratic equation in $x$? ${m.list}`, ms: `Antara yang berikut, yang manakah persamaan kuadratik dalam $x$ selepas dikembangkan sepenuhnya? ${m.list}`, aEn: `(${m.letter})`, aMs: `(${m.letter})` };
    },
    ({ p, k }, r) => {
      const good = `(x + ${p})^2 = ${k}`;
      const bads = [`(x + ${p}) + ${p} = ${k}`, `x^3 + ${p}x = ${k}`, `\\dfrac{${p}}{x} + x = ${k}`, `(x + ${p}) - (x - ${p}) = ${k}`];
      const m = mcq(r, good, bads);
      return { en: `Which of the following, after full expansion, is a quadratic equation in $x$? ${m.list}`, ms: `Antara yang berikut, yang manakah persamaan kuadratik dalam $x$ selepas dikembangkan sepenuhnya? ${m.list}`, aEn: `(${m.letter})`, aMs: `(${m.letter})` };
    },
  ];
  const g11m11 = (r) => fam(r, ctx11expand, TASKS11_EXPAND);

  const g11m12 = (r) => {
    const items = r.shuffle([
      { d: 1, en: `${r.nz(1, 5)}x + ${r.int(1, 6)}`, name: T('degree 1 (linear)', 'darjah 1 (linear)') },
      { d: 2, en: `${r.nz(1, 5)}x^2 - ${r.int(1, 6)}`, name: T('degree 2 (quadratic)', 'darjah 2 (kuadratik)') },
      { d: 3, en: `x^3 + ${r.int(1, 6)}x`, name: T('degree 3 (cubic)', 'darjah 3 (kubik)') },
    ]);
    return { q: T(`Arrange these expressions in increasing order of degree: (A) $${items[0].en}$ (B) $${items[1].en}$ (C) $${items[2].en}$. Which one is the quadratic expression?`, `Susunkan ungkapan berikut mengikut tertib menaik darjah: (A) $${items[0].en}$ (B) $${items[1].en}$ (C) $${items[2].en}$. Yang manakah ungkapan kuadratik?`), a: T(`Order: ${['A', 'B', 'C'][items.findIndex((i) => i.d === 1)]} (degree 1), ${['A', 'B', 'C'][items.findIndex((i) => i.d === 2)]} (degree 2), ${['A', 'B', 'C'][items.findIndex((i) => i.d === 3)]} (degree 3); the quadratic one is (${['A', 'B', 'C'][items.findIndex((i) => i.d === 2)]}).`, `Tertib: ${['A', 'B', 'C'][items.findIndex((i) => i.d === 1)]} (darjah 1), ${['A', 'B', 'C'][items.findIndex((i) => i.d === 2)]} (darjah 2), ${['A', 'B', 'C'][items.findIndex((i) => i.d === 3)]} (darjah 3); ungkapan kuadratik ialah (${['A', 'B', 'C'][items.findIndex((i) => i.d === 2)]}).`), sp: 'm' };
  };

  const g11m13 = (r) => {
    const a = r.nz(-4, 4), c = r.nz(-6, 6);
    const bChoice = r.chance();
    return { q: T(`Construct a quadratic expression in $x$ with $a = ${a}$ and ${bChoice ? `$c = ${c}$` : 'no constant term'}. State your expression and check it is quadratic.`, `Bina satu ungkapan kuadratik dalam $x$ dengan $a = ${a}$ dan ${bChoice ? `$c = ${c}$` : 'tiada sebutan malar'}. Nyatakan ungkapan anda dan sahkan ia kuadratik.`), a: T(`e.g. $${Q(a, 0, bChoice ? c : 0)}$ (any value of $b$ also works); it is quadratic since $a = ${a} \\neq 0$.`, `cth. $${Q(a, 0, bChoice ? c : 0)}$ (mana-mana nilai $b$ turut sah); ia kuadratik kerana $a = ${a} \\neq 0$.`), sp: 's' };
  };
  const REPR11M = [
    { key: 'zerob', render: (a, c) => `${Q(a, 0, c)}` },
    { key: 'zeroc', render: (a, b) => `${Q(a, b, 0)}` },
    { key: 'frac', render: (b, c) => `\\dfrac{x^2}{2} ${b < 0 ? '-' : '+'} ${Math.abs(b)}x ${c < 0 ? '-' : '+'} ${Math.abs(c)}` },
    { key: 'dec', render: (b, c) => `1.5x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x ${c < 0 ? '-' : '+'} ${Math.abs(c)}` },
  ];
  const ASK11M = [
    { verb: T('State', 'Nyatakan') },
    { verb: T('Determine', 'Tentukan') },
    { verb: T('Find', 'Cari') },
  ];
  const g11m14 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const rep = r.pick(REPR11M), ask = r.pick(ASK11M);
    let disp, av, bv, cv;
    if (rep.key === 'zerob') { disp = rep.render(a, c); av = a; bv = 0; cv = c; }
    else if (rep.key === 'zeroc') { disp = rep.render(a, b); av = a; bv = b; cv = 0; }
    else if (rep.key === 'frac') { disp = rep.render(b, c); av = 0.5; bv = b; cv = c; }
    else { disp = rep.render(b, c); av = 1.5; bv = b; cv = c; }
    return { q: T(`${ask.verb.en} the values of $a$, $b$ and $c$ in $y = ${disp}$.`, `${ask.verb.ms} nilai $a$, $b$ dan $c$ dalam $y = ${disp}$.`), a: T(`$a = ${av}$, $b = ${bv}$, $c = ${cv}$`), sp: 's' };
  };
  const INTRO11M = [
    (lbl, y) => T(`After rearranging, $${y}$ is in the form $ax^2 + bx + c$. Deduce ${lbl.en}.`, `Selepas disusun semula, $${y}$ berbentuk $ax^2 + bx + c$. Deduksikan ${lbl.ms}.`),
    (lbl, y) => T(`The terms of $${y}$ are written out of order. Work out ${lbl.en}.`, `Sebutan $${y}$ ditulis tidak mengikut turutan. Kira ${lbl.ms}.`),
    (lbl, y) => T(`Given the quadratic expression $${y}$ (terms not in standard order), calculate ${lbl.en}.`, `Diberi ungkapan kuadratik $${y}$ (sebutan bukan dalam turutan piawai), hitung ${lbl.ms}.`),
  ];
  const g11m15 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const y = poly([[c, ''], [b, 'x'], [a, 'x^2']]); // c + bx + ax^2
    const tgt = r.pick(TARGET11);
    const s = r.pick(INTRO11M)(tgt.label, y);
    return { q: s, a: T(`$${tgt.get(a, b, c)}$`), sp: 'xs' };
  };
  const INTRO11MK = [
    (y) => T(`A classmate says $${y}$ is "just an equation". Decide whether it is really an expression, a function or an equation, with reasons.`, `Seorang rakan sekelas berkata $${y}$ "hanyalah suatu persamaan". Putuskan sama ada ia sebenarnya ungkapan, fungsi atau persamaan, berserta sebab.`),
    (y) => T(`State, with a reason, whether $${y}$ is an expression, a function or an equation.`, `Nyatakan, berserta sebab, sama ada $${y}$ ialah ungkapan, fungsi atau persamaan.`),
    (y) => T(`By checking for an "$=$" sign and function notation, decide the type of $${y}$: expression, function, or equation?`, `Dengan memeriksa tanda "$=$" dan tatatanda fungsi, putuskan jenis $${y}$: ungkapan, fungsi, atau persamaan?`),
  ];
  const g11m16 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-5, 5), c = r.nz(-6, 6);
    const kind = r.pick(['expr', 'func', 'eq']);
    const y = kind === 'expr' ? `${Q(a, b, c)}` : kind === 'func' ? `g(x) = ${Q(a, b, c)}` : `${Q(a, b, c)} = 0`;
    const NM = { expr: T('an expression', 'suatu ungkapan'), func: T('a function', 'suatu fungsi'), eq: T('an equation', 'suatu persamaan') }[kind];
    const s = r.pick(INTRO11MK)(y);
    return { q: s, a: T(`It is ${NM.en}.`, `Ia ialah ${NM.ms}.`), sp: 's' };
  };
  const INTRO11MEV = [
    (y, x0) => T(`For $f(x) = ${y}$, work out $f(${x0})$ step by step.`, `Bagi $f(x) = ${y}$, kira $f(${x0})$ langkah demi langkah.`),
    (y, x0) => T(`A quadratic function is defined by $f(x) = ${y}$. Compute $f(${x0})$.`, `Suatu fungsi kuadratik ditakrifkan oleh $f(x) = ${y}$. Hitung $f(${x0})$.`),
    (y, x0) => T(`Use $f(x) = ${y}$ to find the image of $${x0}$ under $f$.`, `Guna $f(x) = ${y}$ untuk mencari imej $${x0}$ di bawah $f$.`),
  ];
  const g11m17 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8), x0 = r.nz(-5, 5);
    const y = Q(a, b, c);
    const s = r.pick(INTRO11MEV)(y, x0);
    return { q: s, a: T(`$f(${x0}) = ${a * x0 * x0 + b * x0 + c}$`), sp: 's' };
  };
  const INTRO11MMCQ = [
    (m) => T(`After expanding where necessary, which of the following is a quadratic expression in $x$? ${m.list}`, `Selepas dikembangkan jika perlu, antara yang berikut, yang manakah ungkapan kuadratik dalam $x$? ${m.list}`),
    (m) => T(`Three of these four are NOT quadratic in $x$. Which one IS? ${m.list}`, `Tiga daripada empat ini BUKAN kuadratik dalam $x$. Yang manakah kuadratik? ${m.list}`),
  ];
  const g11m18 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const good = Q(a, b, c);
    const list = r.shuffle([{ s: good, ok: true }, ...r.sample(nonQuadPool(r), 3).map((s) => ({ s, ok: false }))]);
    const idx = list.findIndex((o) => o.ok);
    const m = { list: list.map((o, i) => `(${LET[i]}) $${o.s}$`).join('  ') };
    const s = r.pick(INTRO11MMCQ)(m);
    return { q: s, a: T(`(${LET[idx]})`), sp: 's' };
  };
  const INTRO11REP2 = [
    (lbl, y) => T(`This expression has a missing or unusual-looking term: $y = ${y}$. Find ${lbl.en}.`, `Ungkapan ini mempunyai sebutan yang tiada atau kelihatan luar biasa: $y = ${y}$. Cari ${lbl.ms}.`),
    (lbl, y) => T(`Rewrite $y = ${y}$ mentally in standard form $ax^2 + bx + c$, then state ${lbl.en}.`, `Tulis semula $y = ${y}$ secara mental dalam bentuk piawai $ax^2 + bx + c$, kemudian nyatakan ${lbl.ms}.`),
  ];
  const g11m19 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const rep = r.pick(REPR11M), tgt = r.pick(TARGET11);
    let disp, av, bv, cv;
    if (rep.key === 'zerob') { disp = rep.render(a, c); av = a; bv = 0; cv = c; }
    else if (rep.key === 'zeroc') { disp = rep.render(a, b); av = a; bv = b; cv = 0; }
    else if (rep.key === 'frac') { disp = rep.render(b, c); av = 0.5; bv = b; cv = c; }
    else { disp = rep.render(b, c); av = 1.5; bv = b; cv = c; }
    const val = { a: av, b: bv, c: cv }[tgt.sym];
    const s = r.pick(INTRO11REP2)(tgt.label, disp);
    return { q: s, a: T(`$${val}$`), sp: 's' };
  };
  const INTRO11TF = [
    (y, claim) => T(`True or false: for $${y}$, ${claim.en}?`, `Benar atau palsu: bagi $${y}$, ${claim.ms}?`),
    (y, claim) => T(`Decide, with a reason: is it true that for $${y}$, ${claim.en}?`, `Putuskan, berserta sebab: benarkah bagi $${y}$, ${claim.ms}?`),
    (y, claim) => T(`A student claims that for $${y}$, ${claim.en}. Verify this claim.`, `Seorang pelajar mendakwa bagi $${y}$, ${claim.ms}. Sahkan dakwaan ini.`),
  ];
  const g11m20 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const y = Q(a, b, c);
    const target = r.pick(['a', 'b', 'c']);
    const correct = { a, b, c }[target];
    const shown = correct + r.nz(1, 3);
    const label = { a: T('the coefficient of $x^2$', 'pekali $x^2$'), b: T('the coefficient of $x$', 'pekali $x$'), c: T('the constant term', 'sebutan malar') }[target];
    const claim = T(`${label.en} is $${shown}$`, `${label.ms} ialah $${shown}$`);
    const s = r.pick(INTRO11TF)(y, claim);
    return { q: s, a: T(`False; ${label.en} is $${correct}$.`, `Palsu; ${label.ms} ialah $${correct}$.`), sp: 's' };
  };
  const INTRO11CMP = [
    (y1, y2, lbl) => T(`Expression $P$: $y = ${y1}$. Expression $Q$: $y = ${y2}$. Which has the greater ${lbl.en}, $P$ or $Q$?`, `Ungkapan $P$: $y = ${y1}$. Ungkapan $Q$: $y = ${y2}$. Yang manakah mempunyai ${lbl.ms} yang lebih besar, $P$ atau $Q$?`),
    (y1, y2, lbl) => T(`Compare $y = ${y1}$ (call it $P$) with $y = ${y2}$ (call it $Q$): which one has the larger ${lbl.en}?`, `Bandingkan $y = ${y1}$ (namakan $P$) dengan $y = ${y2}$ (namakan $Q$): yang manakah mempunyai ${lbl.ms} yang lebih besar?`),
  ];
  const g11m21 = (r) => {
    const a1 = r.nz(-4, 4), b1 = r.nz(-6, 6), c1 = r.nz(-8, 8);
    const a2 = r.nz(-4, 4), b2 = r.nz(-6, 6), c2 = r.nz(-8, 8);
    const target = r.pick(['a', 'b', 'c']);
    const v1 = { a: a1, b: b1, c: c1 }[target], v2 = { a: a2, b: b2, c: c2 }[target];
    need(v1 !== v2);
    const label = { a: T('coefficient $a$', 'pekali $a$'), b: T('coefficient $b$', 'pekali $b$'), c: T('constant term $c$', 'sebutan malar $c$') }[target];
    const s = r.pick(INTRO11CMP)(Q(a1, b1, c1), Q(a2, b2, c2), label);
    return { q: s, a: T(`${v1 > v2 ? '$P$' : '$Q$'} ($${Math.max(v1, v2)} > ${Math.min(v1, v2)}$)`), sp: 's' };
  };
  const g11m = [g11m1, g11m2, g11m3, g11m4, g11m5, g11m6, g11m7, g11m8, g11m9, g11m10, g11m11, g11m12, g11m13, g11m14, g11m15, g11m16, g11m17, g11m18, g11m19, g11m20, g11m21];

  /* ---- advanced ---- */
  const g11a1 = (r) => {
    const k = r.int(2, 6), b = r.int(1, 6);
    return { q: T(`$f(x) = (k - ${k})x^2 + ${b}x + 1$ is a quadratic function. What condition must $k$ satisfy?`, `$f(x) = (k - ${k})x^2 + ${b}x + 1$ ialah fungsi kuadratik. Apakah syarat yang mesti dipenuhi oleh $k$?`), a: T(`$k \\neq ${k}$ (so that $a \\neq 0$)`), sp: 's' };
  };
  const g11a2 = (r) => {
    const t = r.int(2, 6);
    return { q: T(`$g(x) = (m^2 - ${t * t})x^2 + mx - 3$ is a quadratic function. Find the values of $m$ for which $g$ is NOT quadratic.`, `$g(x) = (m^2 - ${t * t})x^2 + mx - 3$ ialah fungsi kuadratik. Cari nilai $m$ yang menjadikan $g$ TIDAK kuadratik.`), a: T(`$m^2 = ${t * t}$, so $m = ${t}$ or $m = -${t}$`, `$m^2 = ${t * t}$, jadi $m = ${t}$ atau $m = -${t}$`), w: T('$g$ fails to be quadratic when its $x^2$-coefficient is 0.', 'g gagal menjadi kuadratik apabila pekali $x^2$ ialah 0.'), sp: 'm' };
  };
  const g11a3 = (r) => {
    const p = r.nz(-4, 4);
    return { q: T(`Is $(x + ${p})(x - ${p}) - x^2$ a quadratic expression in $x$? Simplify first, then decide.`, `Adakah $(x + ${p})(x - ${p}) - x^2$ suatu ungkapan kuadratik dalam $x$? Permudahkan dahulu, kemudian putuskan.`), a: T(`$(x + ${p})(x - ${p}) - x^2 = x^2 - ${p * p} - x^2 = ${-p * p}$, a constant. It is NOT quadratic (the $x^2$ terms cancel).`, `$(x + ${p})(x - ${p}) - x^2 = x^2 - ${p * p} - x^2 = ${-p * p}$, satu pemalar. Ia BUKAN kuadratik (sebutan $x^2$ saling meniadakan).`), sp: 'm' };
  };
  const g11a4 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8), x0 = r.nz(-3, 3);
    const val = a * x0 * x0 + b * x0 + c;
    return { q: T(`For $f(x) = ${Q(a, b, c)}$: (a) state $a$, $b$, $c$; (b) is this an expression, a function or an equation; (c) find $f(${x0})$.`, `Bagi $f(x) = ${Q(a, b, c)}$: (a) nyatakan $a$, $b$, $c$; (b) adakah ini ungkapan, fungsi atau persamaan; (c) cari $f(${x0})$.`), a: SPM.parts([T(`$a = ${a}$, $b = ${b}$, $c = ${c}$`), T('A function.', 'Suatu fungsi.'), T(`$f(${x0}) = ${val}$`)]), sp: 'm' };
  };
  const g11a5 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    return { q: T(`A student wrote "$${Q(a, b, c)}$" is an equation because it has an "equals" relationship between terms. Explain why the student is wrong, and state what type of item it actually is.`, `Seorang pelajar menulis "$${Q(a, b, c)}$" ialah suatu persamaan kerana ia mempunyai hubungan "sama dengan" antara sebutan. Terangkan mengapa pelajar itu silap, dan nyatakan jenis item itu sebenarnya.`), a: T('The student is wrong: there is no "=" sign, so it cannot be an equation. It is an expression.', 'Pelajar itu silap: tiada tanda "=", jadi ia tidak boleh menjadi persamaan. Ia ialah suatu ungkapan.'), sp: 's' };
  };
  const g11a6 = (r) => {
    const a = r.nz(2, 5), b = r.nz(-6, 6);
    return { q: T(`For what value of $m$ does $h(x) = (m + ${a})x^2 + ${b}x - 2$ have its $x^2$-coefficient equal to $1$?`, `Untuk nilai $m$ yang manakah $h(x) = (m + ${a})x^2 + ${b}x - 2$ mempunyai pekali $x^2$ bersamaan dengan $1$?`), a: T(`$m + ${a} = 1$, so $m = ${1 - a}$`, `$m + ${a} = 1$, jadi $m = ${1 - a}$`), sp: 's' };
  };
  const g11a7 = (r) => {
    const p = r.int(-3, 3), d = r.int(1, 4), a = r.pick([1, 2, -1]);
    const x0 = p - d, x1 = p + d, b = -2 * a * p, c = r.nz(-5, 5);
    return { q: T(`Explain, using $f(x) = ${Q(a, b, c)}$ and the two inputs $x = ${x0}$ and $x = ${x1}$, why a quadratic function is generally described as a many-to-one relation rather than one-to-one.`, `Terangkan, dengan menggunakan $f(x) = ${Q(a, b, c)}$ dan dua input $x = ${x0}$ dan $x = ${x1}$, mengapa fungsi kuadratik secara umumnya digambarkan sebagai hubungan banyak-kepada-satu dan bukan satu-kepada-satu.`), a: T(`$f(${x0}) = f(${x1}) = ${a * x0 * x0 + b * x0 + c}$. Since the two distinct inputs $${x0}$ and $${x1}$ map to the same output, at least one output has more than one input mapped to it, so the relation is many-to-one, not one-to-one.`, `$f(${x0}) = f(${x1}) = ${a * x0 * x0 + b * x0 + c}$. Oleh sebab dua input berlainan $${x0}$ dan $${x1}$ memetakan kepada output yang sama, sekurang-kurangnya satu output mempunyai lebih daripada satu input yang dipetakan kepadanya, jadi hubungan itu banyak-kepada-satu, bukan satu-kepada-satu.`), sp: 'm' };
  };
  const g11a8 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const errKind = r.pick(['no_a0', 'wrong_pick', 'sign']);
    let student;
    if (errKind === 'no_a0') student = T(`"The expression $${Q(a, b, c)}$ is not quadratic because there is no number multiplying $x^2$ written before it (when $a = 1$ or $a = -1$)."`, `"Ungkapan $${Q(a, b, c)}$ bukan kuadratik kerana tiada nombor didarab dengan $x^2$ yang ditulis sebelumnya (apabila $a = 1$ atau $a = -1$)."`);
    else if (errKind === 'wrong_pick') student = T(`"For $${Q(a, b, c)}$, the constant term $c$ is the $x$-intercept."`, `"Bagi $${Q(a, b, c)}$, sebutan malar $c$ ialah pintasan-$x$."`);
    else student = T(`"For $${Q(a, b, c)}$, since $c$ has a negative sign in the original expression, $c$ must be counted as $0$."`, `"Bagi $${Q(a, b, c)}$, oleh sebab $c$ mempunyai tanda negatif dalam ungkapan asal, $c$ mesti dikira sebagai $0$."`);
    const corr = errKind === 'no_a0' ? T(`Incorrect: when no number is written, the coefficient is $1$ or $-1$ (here $a = ${a}$), and the expression is still quadratic.`, `Silap: apabila tiada nombor ditulis, pekali itu ialah $1$ atau $-1$ (di sini $a = ${a}$), dan ungkapan itu tetap kuadratik.`) : errKind === 'wrong_pick' ? T(`Incorrect: $c$ is the constant term (value of the expression at $x = 0$), not necessarily an $x$-intercept.`, `Silap: $c$ ialah sebutan malar (nilai ungkapan pada $x = 0$), bukan semestinya pintasan-$x$.`) : T(`Incorrect: the sign is part of the value of $c$; here $c = ${c}$, it is not automatically $0$.`, `Silap: tanda itu sebahagian daripada nilai $c$; di sini $c = ${c}$, ia tidak automatik $0$.`);
    return { q: T(`A student made this claim: ${student.en} Explain why the student's reasoning is incorrect.`, `Seorang pelajar membuat dakwaan ini: ${student.ms} Terangkan mengapa penaakulan pelajar itu tidak betul.`), a: corr, sp: 'm' };
  };
  const ctx11two = (r) => { const t = r.int(2, 5), u = r.int(2, 5); need(t !== u); return { t, u }; };
  const TASKS11_TWO = [
    ({ t, u }) => ({ en: `$g(x) = (m - ${t})(m + ${u})x^2 + mx + 1$ is a quadratic function. Find the values of $m$ for which $g$ is NOT quadratic.`, ms: `$g(x) = (m - ${t})(m + ${u})x^2 + mx + 1$ ialah fungsi kuadratik. Cari nilai $m$ yang menjadikan $g$ TIDAK kuadratik.`, aEn: `$m = ${t}$ or $m = -${u}$`, aMs: `$m = ${t}$ atau $m = -${u}$` }),
    ({ t, u }) => ({ en: `$h(x) = (2m - ${t})(m - ${u})x^2 - 3x + 2$ is a quadratic function. Find the values of $m$ for which $h$ is NOT quadratic.`, ms: `$h(x) = (2m - ${t})(m - ${u})x^2 - 3x + 2$ ialah fungsi kuadratik. Cari nilai $m$ yang menjadikan $h$ TIDAK kuadratik.`, aEn: `$m = ${frT(fr(t, 2))}$ or $m = ${u}$`, aMs: `$m = ${frT(fr(t, 2))}$ atau $m = ${u}$` }),
  ];
  const g11a9 = (r) => fam(r, ctx11two, TASKS11_TWO);

  const g11a10 = (r) => {
    const p = r.nz(-4, 4), q = r.nz(-4, 4);
    need(p !== q && p + q !== 0);
    // (x+p)(x+q) - x^2 collapses to a linear expression, NOT quadratic
    const b = p + q, c = p * q;
    return { q: T(`Is $(x + ${p})(x + ${q}) - x^2$ a quadratic expression in $x$? Simplify first, then decide, and state the type of expression it actually is.`, `Adakah $(x + ${p})(x + ${q}) - x^2$ suatu ungkapan kuadratik dalam $x$? Permudahkan dahulu, kemudian putuskan, dan nyatakan jenis ungkapan itu sebenarnya.`), a: T(`$(x + ${p})(x + ${q}) - x^2 = ${lin(b, c)}$. It is NOT quadratic (the $x^2$ terms cancel); it is a linear expression.`, `$(x + ${p})(x + ${q}) - x^2 = ${lin(b, c)}$. Ia BUKAN kuadratik (sebutan $x^2$ saling meniadakan); ia ialah ungkapan linear.`), sp: 'm' };
  };

  const g11a11 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const p = r.int(1, 3);
    const disp = `(k^2 - ${p * p})x^2 + kx + ${c}`;
    return { q: T(`$f(x) = ${disp}$ is a quadratic function for all values of $k$ except two. (a) Find these two excluded values. (b) State the condition on $k$ using $\\neq$.`, `$f(x) = ${disp}$ ialah fungsi kuadratik bagi semua nilai $k$ kecuali dua nilai. (a) Cari kedua-dua nilai yang dikecualikan itu. (b) Nyatakan syarat ke atas $k$ menggunakan $\\neq$.`), a: SPM.parts([T(`$k = ${p}$ or $k = -${p}$`, `$k = ${p}$ atau $k = -${p}$`), T(`$k \\neq ${p}$ and $k \\neq -${p}$`, `$k \\neq ${p}$ dan $k \\neq -${p}$`)]), sp: 'm' };
  };

  const g11a12 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const x0 = r.nz(-3, 3);
    const val = a * x0 * x0 + b * x0 + c;
    const disp = poly([[c, ''], [b, 'x'], [a, 'x^2']]);
    const sub = `${a}(${x0})^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}(${x0}) ${c < 0 ? '-' : '+'} ${Math.abs(c)}`;
    return { q: T(`For the item $${disp} = 0$: (a) rewrite it in the form $ax^2 + bx + c = 0$ and state $a$, $b$, $c$; (b) explain why it is a quadratic equation, not merely an expression; (c) verify whether $x = ${x0}$ is a root.`, `Bagi item $${disp} = 0$: (a) tuliskan semula dalam bentuk $ax^2 + bx + c = 0$ dan nyatakan $a$, $b$, $c$; (b) terangkan mengapa ia persamaan kuadratik, bukan sekadar ungkapan; (c) sahkan sama ada $x = ${x0}$ ialah punca.`), a: SPM.parts([T(`$${Q(a, b, c)} = 0$; $a = ${a}$, $b = ${b}$, $c = ${c}$`), T('It has an "=" sign and highest power of $x$ equal to 2 with $a \\neq 0$.', 'Ia mempunyai tanda "=" dan kuasa tertinggi $x$ bersamaan 2 dengan $a \\neq 0$.'), T(`$${sub} = ${val}$, which is ${val === 0 ? '$0$, so $x = ' + x0 + '$ is a root' : 'not $0$, so $x = ' + x0 + '$ is NOT a root'}.`, `$${sub} = ${val}$, iaitu ${val === 0 ? '$0$, jadi $x = ' + x0 + '$ ialah punca' : 'bukan $0$, jadi $x = ' + x0 + '$ BUKAN punca'}.`)]), sp: 'l' };
  };
  const CONDFORM11 = [
    { render: (t) => `(k - ${t})`, excl: (t) => n(t), exclEn: (t) => `${t}` },
    { render: (t) => `(${t} - k)`, excl: (t) => n(t), exclEn: (t) => `${t}` },
    { render: (t) => `(k + ${t})`, excl: (t) => `-${t}`, exclEn: (t) => `-${t}` },
    { render: (t) => `(2k - ${t})`, excl: (t) => (t % 2 === 0 ? n(t / 2) : frT(fr(t, 2))), exclEn: (t) => (t % 2 === 0 ? n(t / 2) : frT(fr(t, 2))) },
  ];
  const ASK11A = ['cond', 'value', 'explain'];
  const g11a13 = (r) => {
    const t = r.int(2, 6), b = r.nz(1, 5), c = r.nz(-4, 4);
    const cf = r.pick(CONDFORM11), ask = r.pick(ASK11A);
    const coef = cf.render(t);
    const excl = cf.excl(t);
    const disp = `f(x) = ${coef}x^2 + ${b}x ${c < 0 ? '-' : '+'} ${Math.abs(c)}`;
    if (ask === 'cond') return { q: T(`$${disp}$ is a quadratic function. What condition must $k$ satisfy?`, `$${disp}$ ialah fungsi kuadratik. Apakah syarat yang mesti dipenuhi oleh $k$?`), a: T(`$k \\neq ${excl}$`), sp: 's' };
    if (ask === 'value') return { q: T(`$${disp}$ is a quadratic function for every value of $k$ except one. Find that excluded value of $k$.`, `$${disp}$ ialah fungsi kuadratik bagi setiap nilai $k$ kecuali satu. Cari nilai $k$ yang dikecualikan itu.`), a: T(`$k = ${excl}$`), sp: 's' };
    return { q: T(`Explain why $${disp}$ is NOT a quadratic function when $k = ${excl}$.`, `Terangkan mengapa $${disp}$ BUKAN fungsi kuadratik apabila $k = ${excl}$.`), a: T(`When $k = ${excl}$, the coefficient of $x^2$ becomes $0$, so the $x^2$ term vanishes and the expression is no longer quadratic.`, `Apabila $k = ${excl}$, pekali $x^2$ menjadi $0$, jadi sebutan $x^2$ hilang dan ungkapan itu tidak lagi kuadratik.`), sp: 's' };
  };
  const INTRO11A = [
    (lbl, y) => T(`Justify, by inspecting $${y}$, why ${lbl.en} has the value it does.`, `Wajarkan, dengan memeriksa $${y}$, mengapa ${lbl.ms} mempunyai nilai sedemikian.`),
    (lbl, y) => T(`A student is unsure how to read ${lbl.en} from $${y}$. Explain how, and state its value.`, `Seorang pelajar tidak pasti cara membaca ${lbl.ms} daripada $${y}$. Terangkan caranya, dan nyatakan nilainya.`),
    (lbl, y) => T(`Without expanding further, determine ${lbl.en} in $${y}$ and explain your reasoning.`, `Tanpa mengembangkan lagi, tentukan ${lbl.ms} dalam $${y}$ dan terangkan penaakulan anda.`),
  ];
  const g11a14 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const rep = r.pick([REPR11[2], REPR11[3]]); // func or eq form
    const y = rep.render(a, b, c);
    const tgt = r.pick(TARGET11);
    const s = r.pick(INTRO11A)(tgt.label, y);
    return { q: s, a: T(`$${tgt.get(a, b, c)}$`), sp: 's' };
  };
  const INTRO11AK = [
    (y) => T(`Two students disagree about whether $${y}$ is an expression, a function or an equation. Resolve the disagreement with a clear justification.`, `Dua pelajar tidak bersetuju sama ada $${y}$ ialah ungkapan, fungsi atau persamaan. Selesaikan percanggahan itu dengan justifikasi yang jelas.`),
    (y) => T(`Argue, using the defining features of each, why $${y}$ should be classified as an expression, a function or an equation (choose one).`, `Hujahkan, menggunakan ciri takrif setiap satu, mengapa $${y}$ patut diklasifikasikan sebagai ungkapan, fungsi atau persamaan (pilih satu).`),
    (y) => T(`Is $${y}$ best described as an expression, a function or an equation? Support your answer by identifying the defining feature present (or absent).`, `Adakah $${y}$ lebih tepat digambarkan sebagai ungkapan, fungsi atau persamaan? Sokong jawapan anda dengan mengenal pasti ciri takrif yang ada (atau tiada).`),
  ];
  const g11a15 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-5, 5), c = r.nz(-6, 6);
    const kind = r.pick(['expr', 'func', 'eq']);
    const y = kind === 'expr' ? `${Q(a, b, c)}` : kind === 'func' ? `h(x) = ${Q(a, b, c)}` : `${Q(a, b, c)} = 0`;
    const NM = { expr: T('an expression, because it has neither an "=" sign nor function notation', 'suatu ungkapan, kerana ia tiada tanda "=" atau tatatanda fungsi'), func: T('a function, because it is written using function notation $h(x) = \\ldots$', 'suatu fungsi, kerana ia ditulis menggunakan tatatanda fungsi $h(x) = \\ldots$'), eq: T('an equation, because it contains an "=" sign', 'suatu persamaan, kerana ia mengandungi tanda "="') }[kind];
    const s = r.pick(INTRO11AK)(y);
    return { q: s, a: T(`It is ${NM.en}.`, `Ia ialah ${NM.ms}.`), sp: 's' };
  };
  const INTRO11AEV = [
    (y, x0) => T(`Show that $f(${x0})$ can be found by substitution for $f(x) = ${y}$, and hence determine its value.`, `Tunjukkan bahawa $f(${x0})$ boleh dicari melalui penggantian bagi $f(x) = ${y}$, dan seterusnya tentukan nilainya.`),
    (y, x0) => T(`A student substitutes carelessly and gets the wrong sign for $f(${x0})$ where $f(x) = ${y}$. Find the correct value of $f(${x0})$, showing full substitution.`, `Seorang pelajar menggantikan secara cuai dan mendapat tanda yang salah bagi $f(${x0})$ dengan $f(x) = ${y}$. Cari nilai betul $f(${x0})$, dengan menunjukkan penggantian penuh.`),
  ];
  const g11a16 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8), x0 = r.nz(-4, 4);
    const y = Q(a, b, c);
    const val = a * x0 * x0 + b * x0 + c;
    const sub = `${a}(${x0})^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}(${x0}) ${c < 0 ? '-' : '+'} ${Math.abs(c)}`;
    const s = r.pick(INTRO11AEV)(y, x0);
    return { q: s, a: T(`$f(${x0}) = ${sub} = ${val}$`), sp: 'm' };
  };
  const INTRO11AMCQ = [
    (y, opts) => T(`Select the best classification of $${y}$: (A) ${opts.expr.en} (B) ${opts.func.en} (C) ${opts.eq.en} (D) ${opts.none.en}`, `Pilih klasifikasi terbaik bagi $${y}$: (A) ${opts.expr.ms} (B) ${opts.func.ms} (C) ${opts.eq.ms} (D) ${opts.none.ms}`),
    (y, opts) => T(`Exactly one description fits $${y}$. (A) ${opts.expr.en} (B) ${opts.func.en} (C) ${opts.eq.en} (D) ${opts.none.en} Which is it?`, `Tepat satu penerangan sesuai dengan $${y}$. (A) ${opts.expr.ms} (B) ${opts.func.ms} (C) ${opts.eq.ms} (D) ${opts.none.ms} Yang manakah?`),
  ];
  const g11a17 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-5, 5), c = r.nz(-6, 6);
    const kind = r.pick(['expr', 'func', 'eq']);
    const y = kind === 'expr' ? `${Q(a, b, c)}` : kind === 'func' ? `p(x) = ${Q(a, b, c)}` : `${Q(a, b, c)} = 0`;
    const opts = { expr: T('an expression', 'suatu ungkapan'), func: T('a function', 'suatu fungsi'), eq: T('an equation', 'suatu persamaan'), none: T('none of these', 'tiada satu pun') };
    const letter = { expr: 'A', func: 'B', eq: 'C' }[kind];
    const s = r.pick(INTRO11AMCQ)(y, opts);
    return { q: s, a: T(`(${letter}) ${opts[kind].en}`, `(${letter}) ${opts[kind].ms}`), sp: 's' };
  };
  const INTRO11TWO = [
    (y, sols) => T(`$g(x) = ${y}$ is a quadratic function. Find every value of $m$ that makes $g$ fail to be quadratic.`, `$g(x) = ${y}$ ialah fungsi kuadratik. Cari setiap nilai $m$ yang menjadikan $g$ gagal menjadi kuadratik.`),
    (y, sols) => T(`For what values of $m$ does $g(x) = ${y}$ have an $x^2$-coefficient of exactly $0$?`, `Untuk nilai $m$ yang manakah $g(x) = ${y}$ mempunyai pekali $x^2$ tepat $0$?`),
  ];
  const g11a18 = (r) => {
    const t = r.int(2, 5), u = r.int(2, 5);
    need(t !== u);
    const y = `(m - ${t})(m + ${u})x^2 + 2mx - 3`;
    const s = r.pick(INTRO11TWO)(y);
    return { q: s, a: T(`$m = ${t}$ or $m = -${u}$`, `$m = ${t}$ atau $m = -${u}$`), sp: 'm' };
  };
  const INTRO11MATCH = [
    (l) => T(`Three related items are shown, sharing the same coefficients. Match each to its correct type (expression / function / equation), explaining what distinguishes them: (A) $${l[0]}$ (B) $${l[1]}$ (C) $${l[2]}$`, `Tiga item berkaitan ditunjukkan, berkongsi pekali yang sama. Padankan setiap satu dengan jenis yang betul (ungkapan / fungsi / persamaan), sambil menerangkan apa yang membezakannya: (A) $${l[0]}$ (B) $${l[1]}$ (C) $${l[2]}$`),
    (l) => T(`(A) $${l[0]}$ (B) $${l[1]}$ (C) $${l[2]}$. Exactly one is an expression, one is a function and one is an equation. Match them and justify using the defining feature of each.`, `(A) $${l[0]}$ (B) $${l[1]}$ (C) $${l[2]}$. Tepat satu ungkapan, satu fungsi dan satu persamaan. Padankan dan wajarkan menggunakan ciri takrif setiap satu.`),
  ];
  const g11a19 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8);
    const list = r.shuffle([
      { s: `${Q(a, b, c)}`, k: T('an expression (no "=", no function notation)', 'ungkapan (tiada "=", tiada tatatanda fungsi)') },
      { s: `k(x) = ${Q(a, b, c)}`, k: T('a function (uses function notation)', 'fungsi (menggunakan tatatanda fungsi)') },
      { s: `${Q(a, b, c)} = 0`, k: T('an equation (has "=")', 'persamaan (mempunyai "=")') },
    ]);
    const s = r.pick(INTRO11MATCH)(list.map((x) => x.s));
    return { q: s, a: T(`(A) ${list[0].k.en} (B) ${list[1].k.en} (C) ${list[2].k.en}`, `(A) ${list[0].k.ms} (B) ${list[1].k.ms} (C) ${list[2].k.ms}`), sp: 'm' };
  };
  const g11a = [g11a1, g11a2, g11a3, g11a4, g11a5, g11a6, g11a7, g11a8, g11a9, g11a10, g11a11, g11a12, g11a13, g11a14, g11a15, g11a16, g11a17, g11a18, g11a19];

  SPM.extend('F4-1.1', { e: g11e, m: g11m, a: g11a });

  /* =============================================================== 1.2 : effects of a, b, c */
  const graphA = (a1, a2) => S.plane({ x: [-4, 4], y: [-8, 8], scale: 16, labelStep: 2, curves: [{ f: (x) => a1 * x * x }, { f: (x) => a2 * x * x, dash: true }] });
  const graphC = (a, c1, c2) => S.plane({ x: [-4, 4], y: [-6, 10], scale: 16, labelStep: 2, curves: [{ f: (x) => a * x * x + c1 }, { f: (x) => a * x * x + c2, dash: true }] });

  const ctxA12 = (r) => {
    const m1 = r.pick([1, 2, 3]), m2 = r.pick([1, 2, 3].filter((v) => v !== m1));
    const s1 = r.sign(), s2 = r.pick([s1, -s1]);
    return { a1: s1 * m1, a2: s2 * m2, m1, m2, s1, s2 };
  };
  const TASKS_A = [
    ({ a1 }) => ({ en: `State whether the graph of $y = ${a1 === 1 ? '' : a1 === -1 ? '-' : a1}x^2$ opens upward or downward.`, ms: `Nyatakan sama ada graf $y = ${a1 === 1 ? '' : a1 === -1 ? '-' : a1}x^2$ terbuka ke atas atau ke bawah.`, aEn: `${a1 > 0 ? 'Upward' : 'Downward'} (since $a = ${a1} ${a1 > 0 ? '> 0' : '< 0'}$).`, aMs: `${a1 > 0 ? 'Ke atas' : 'Ke bawah'} (kerana $a = ${a1} ${a1 > 0 ? '> 0' : '< 0'}$).` }),
    ({ a1, a2, m1, m2 }) => ({ en: `Compare the graphs of $y = ${a1 === 1 ? '' : a1 === -1 ? '-' : a1}x^2$ and $y = ${a2 === 1 ? '' : a2 === -1 ? '-' : a2}x^2$. Which one is narrower?`, ms: `Bandingkan graf $y = ${a1 === 1 ? '' : a1 === -1 ? '-' : a1}x^2$ dan $y = ${a2 === 1 ? '' : a2 === -1 ? '-' : a2}x^2$. Yang manakah lebih sempit?`, aEn: `$y = ${(m1 > m2 ? a1 : a2) === 1 ? '' : (m1 > m2 ? a1 : a2) === -1 ? '-' : (m1 > m2 ? a1 : a2)}x^2$ is narrower (larger $|a| = ${Math.max(m1, m2)}$).`, aMs: `$y = ${(m1 > m2 ? a1 : a2) === 1 ? '' : (m1 > m2 ? a1 : a2) === -1 ? '-' : (m1 > m2 ? a1 : a2)}x^2$ lebih sempit ($|a| = ${Math.max(m1, m2)}$ lebih besar).` }),
    ({ a1, a2 }) => ({ en: `What is the common point shared by the graphs of $y = ${a1}x^2$ and $y = ${a2}x^2$?`, ms: `Apakah titik sepunya bagi graf $y = ${a1}x^2$ dan $y = ${a2}x^2$?`, aEn: `$(0, 0)$, the origin (both have $b = c = 0$).`, aMs: `$(0, 0)$, origin (kedua-duanya mempunyai $b = c = 0$).` }),
    ({ a1, a2 }) => ({ en: `Find the value of $y$ at $x = 1$ for $y = ${a1}x^2$ and for $y = ${a2}x^2$.`, ms: `Cari nilai $y$ pada $x = 1$ bagi $y = ${a1}x^2$ dan bagi $y = ${a2}x^2$.`, aEn: `$y = ${a1}$ and $y = ${a2}$ respectively at $x = 1$.`, aMs: `$y = ${a1}$ dan $y = ${a2}$ masing-masing pada $x = 1$.` }),
    ({ a1 }) => ({ en: `For $y = ${a1}x^2$, what must be true about the coefficient $a$ for the graph to open ${a1 > 0 ? 'upward' : 'downward'}?`, ms: `Bagi $y = ${a1}x^2$, apakah yang mesti benar tentang pekali $a$ supaya graf terbuka ${a1 > 0 ? 'ke atas' : 'ke bawah'}?`, aEn: `$a ${a1 > 0 ? '> 0' : '< 0'}$ (here $a = ${a1}$).`, aMs: `$a ${a1 > 0 ? '> 0' : '< 0'}$ (di sini $a = ${a1}$).` }),
    ({ a1, a2 }, r) => { const m = mcq(r, `\\text{both pass through } (0,0)`, [`y = ${a1}x^2 \\text{ is always above } y = ${a2}x^2`, `y = ${a1}x^2 \\text{ and } y = ${a2}x^2 \\text{ never meet}`, `\\text{the graphs have different } y\\text{-intercepts}`]); return { en: `Which statement about $y = ${a1}x^2$ and $y = ${a2}x^2$ is correct? ${m.list}`, ms: `Pernyataan manakah yang betul tentang $y = ${a1}x^2$ dan $y = ${a2}x^2$? ${m.list}`, aEn: `(${m.letter})`, aMs: `(${m.letter})` }; },
    ({ a1, a2, m1, m2 }) => ({ en: `True or false: the graph of $y = ${a1}x^2$ is wider than $y = ${a2}x^2$ when $|${a1}| ${m1 > m2 ? '>' : '<'} |${a2}|$?`, ms: `Benar atau palsu: graf $y = ${a1}x^2$ lebih lebar daripada $y = ${a2}x^2$ apabila $|${a1}| ${m1 > m2 ? '>' : '<'} |${a2}|$?`, aEn: `False; a larger $|a|$ gives a narrower (not wider) graph.`, aMs: `Palsu; $|a|$ yang lebih besar memberikan graf yang lebih sempit (bukan lebih lebar).` }),
    ({ a1 }) => ({ en: `Sketch the graph of $y = ${a1}x^2$, showing its shape and the direction it opens.`, ms: `Lakar graf $y = ${a1}x^2$, menunjukkan bentuk dan arah ia terbuka.`, aEn: `A parabola with vertex $(0,0)$ opening ${a1 > 0 ? 'upward' : 'downward'}.`, aMs: `Parabola berpuncak $(0,0)$ terbuka ${a1 > 0 ? 'ke atas' : 'ke bawah'}.`, fig: S.plane({ x: [-4, 4], y: [-8, 8], scale: 16, labelStep: 2, curves: [{ f: (x) => a1 * x * x }] }) }),
    ({ a1, a2 }) => ({ en: `The graphs of $y = ${a1}x^2$ and $y = ${a2}x^2$ are shown (dashed for the second). Which curve is which? State a reason.`, ms: `Graf $y = ${a1}x^2$ dan $y = ${a2}x^2$ ditunjukkan (putus-putus bagi yang kedua). Lengkung manakah yang mana? Nyatakan sebab.`, aEn: `The solid curve is $y = ${a1}x^2$ and the dashed curve is $y = ${a2}x^2$, matched by opening direction and relative width.`, aMs: `Lengkung penuh ialah $y = ${a1}x^2$ dan lengkung putus-putus ialah $y = ${a2}x^2$, dipadankan mengikut arah terbuka dan lebar relatif.`, fig: graphA(a1, a2) }),
  ];
  const g12e1 = (r) => fam(r, ctxA12, TASKS_A);

  const ctxC12 = (r) => {
    const a = r.nz(-3, 3);
    const c1 = r.nz(-6, 6), c2 = r.nz(-6, 6);
    need(c1 !== c2);
    return { a, c1, c2 };
  };
  const TASKS_C = [
    ({ a, c1 }) => ({ en: `State the $y$-intercept of the graph $y = ${Q(a, 0, c1)}$.`, ms: `Nyatakan pintasan-$y$ bagi graf $y = ${Q(a, 0, c1)}$.`, aEn: `$${c1}$ (the point $(0, ${c1})$).`, aMs: `$${c1}$ (titik $(0, ${c1})$).` }),
    ({ a, c1, c2 }) => ({ en: `The graphs of $y = ${Q(a, 0, c1)}$ and $y = ${Q(a, 0, c2)}$ have the same shape. Which one is positioned higher up?`, ms: `Graf $y = ${Q(a, 0, c1)}$ dan $y = ${Q(a, 0, c2)}$ mempunyai bentuk yang sama. Yang manakah berkedudukan lebih tinggi?`, aEn: `$y = ${Q(a, 0, Math.max(c1, c2))}$, since $${Math.max(c1, c2)} > ${Math.min(c1, c2)}$.`, aMs: `$y = ${Q(a, 0, Math.max(c1, c2))}$, kerana $${Math.max(c1, c2)} > ${Math.min(c1, c2)}$.` }),
    ({ a, c1, c2 }) => ({ en: `What stays the same, and what changes, between the graphs of $y = ${Q(a, 0, c1)}$ and $y = ${Q(a, 0, c2)}$?`, ms: `Apakah yang kekal sama, dan apakah yang berubah, antara graf $y = ${Q(a, 0, c1)}$ dan $y = ${Q(a, 0, c2)}$?`, aEn: `The shape, width and opening direction stay the same (same $a$); the $y$-intercept and vertical position change.`, aMs: `Bentuk, lebar dan arah terbuka kekal sama ($a$ sama); pintasan-$y$ dan kedudukan menegak berubah.` }),
    ({ a, c1 }) => ({ en: `Find the value of $y$ when $x = 0$ for $y = ${Q(a, 0, c1)}$. What does this value represent on the graph?`, ms: `Cari nilai $y$ apabila $x = 0$ bagi $y = ${Q(a, 0, c1)}$. Apakah yang diwakili oleh nilai ini pada graf?`, aEn: `$y = ${c1}$; this is the $y$-intercept.`, aMs: `$y = ${c1}$; ini ialah pintasan-$y$.` }),
    ({ a, c1, c2 }, r) => { const m = mcq(r, `\\text{same width, different } y\\text{-intercept}`, [`\\text{different width, same } y\\text{-intercept}`, `\\text{same width, same } y\\text{-intercept}`, `\\text{different width, different } y\\text{-intercept}`]); return { en: `$y = ${Q(a, 0, c1)}$ and $y = ${Q(a, 0, c2)}$ have: ${m.list}`, ms: `$y = ${Q(a, 0, c1)}$ dan $y = ${Q(a, 0, c2)}$ mempunyai: ${m.list}`, aEn: `(${m.letter})`, aMs: `(${m.letter})` }; },
    ({ a, c1 }) => ({ en: `True or false: the constant term $c$ in $y = ${Q(a, 0, c1)}$ gives the $x$-intercept?`, ms: `Benar atau palsu: sebutan malar $c$ dalam $y = ${Q(a, 0, c1)}$ memberikan pintasan-$x$?`, aEn: `False; $c$ gives the $y$-intercept, i.e. $f(0) = ${c1}$.`, aMs: `Palsu; $c$ memberikan pintasan-$y$, iaitu $f(0) = ${c1}$.` }),
    ({ a, c1, c2 }) => ({ en: `The graphs of $y = ${Q(a, 0, c1)}$ and $y = ${Q(a, 0, c2)}$ are shown, one dashed. Identify each curve using its $y$-intercept.`, ms: `Graf $y = ${Q(a, 0, c1)}$ dan $y = ${Q(a, 0, c2)}$ ditunjukkan, satu putus-putus. Kenal pasti setiap lengkung menggunakan pintasan-$y$nya.`, aEn: `The solid curve crosses the $y$-axis at $${c1}$ (equation $y = ${Q(a, 0, c1)}$); the dashed curve crosses at $${c2}$ (equation $y = ${Q(a, 0, c2)}$).`, aMs: `Lengkung penuh memotong paksi-$y$ pada $${c1}$ (persamaan $y = ${Q(a, 0, c1)}$); lengkung putus-putus memotong pada $${c2}$ (persamaan $y = ${Q(a, 0, c2)}$).`, fig: graphC(a, c1, c2) }),
  ];
  const g12e2 = (r) => fam(r, ctxC12, TASKS_C);

  const g12e = [g12e1, g12e2];

  const ctxB12 = (r) => {
    const a = r.pick([1, -1, 2]);
    const b1 = r.nz(-4, 4), b2 = r.nz(-4, 4);
    need(b1 !== b2);
    const c = r.nz(-4, 4);
    const xs = range(-3, 3);
    const y1 = xs.map((x) => a * x * x + b1 * x + c);
    const y2 = xs.map((x) => a * x * x + b2 * x + c);
    const min1x = xs[y1.indexOf(a > 0 ? Math.min(...y1) : Math.max(...y1))];
    const min2x = xs[y2.indexOf(a > 0 ? Math.min(...y2) : Math.max(...y2))];
    return { a, b1, b2, c, xs, y1, y2, min1x, min2x };
  };
  const TASKS_B = [
    ({ a, b1, c, xs, y1 }) => { const tab = SPM.table([['$x$', ...xs.map((x) => `$${x}$`)], ['$y$', ...xs.map(() => '')]]); return { en: `Complete the table of values for $y = ${Q(a, b1, c)}$.<br>${tab}`, ms: `Lengkapkan jadual nilai bagi $y = ${Q(a, b1, c)}$.<br>${tab}`, aEn: `$y = ${y1.join(', ')}$`, aMs: `$y = ${y1.join(', ')}$`, sp: 'm' }; },
    ({ a, b1, c }) => ({ en: `For $y = ${Q(a, b1, c)}$, state the $y$-intercept without drawing the graph.`, ms: `Bagi $y = ${Q(a, b1, c)}$, nyatakan pintasan-$y$ tanpa melukis graf.`, aEn: `$${c}$ (the value of $y$ when $x = 0$).`, aMs: `$${c}$ (nilai $y$ apabila $x = 0$).` }),
    ({ a, b1, c, xs, y1 }) => { const tab = SPM.table([['$x$', ...xs.map((x) => `$${x}$`)], ['$y$', ...y1.map((y) => `$${y}$`)]]); const dup = y1.find((v, i) => y1.indexOf(v) !== i); return { en: `The table shows values for $y = ${Q(a, b1, c)}$.<br>${tab}<br>Which two $x$-values give the same $y$-value?`, ms: `Jadual menunjukkan nilai bagi $y = ${Q(a, b1, c)}$.<br>${tab}<br>Nilai $x$ manakah yang memberikan nilai $y$ yang sama?`, aEn: dup !== undefined ? `$x = ${xs[y1.indexOf(dup)]}$ and $x = ${xs.map((x, i) => (y1[i] === dup ? x : null)).filter((v) => v !== null)[1]}$ (both give $y = ${dup}$).` : `No pair among the tabulated values is equal here.`, aMs: dup !== undefined ? `$x = ${xs[y1.indexOf(dup)]}$ dan $x = ${xs.map((x, i) => (y1[i] === dup ? x : null)).filter((v) => v !== null)[1]}$ (kedua-duanya memberikan $y = ${dup}$).` : `Tiada pasangan antara nilai berjadual yang sama di sini.`, sp: 'm' }; },
    ({ a, b1, b2, c, min1x, min2x }) => ({ en: `The graphs of $y = ${Q(a, b1, c)}$ and $y = ${Q(a, b2, c)}$ have the same $a$ and $c$ but different $b$. Which stays the same: the $y$-intercept, or the position of the turning point?`, ms: `Graf $y = ${Q(a, b1, c)}$ dan $y = ${Q(a, b2, c)}$ mempunyai $a$ dan $c$ yang sama tetapi $b$ berbeza. Yang manakah kekal sama: pintasan-$y$, atau kedudukan titik pusingan?`, aEn: `The $y$-intercept stays the same (both $= ${c}$); the turning point's position changes with $b$.`, aMs: `Pintasan-$y$ kekal sama (kedua-dua $= ${c}$); kedudukan titik pusingan berubah mengikut $b$.` }),
    ({ a, b1, c }) => ({ en: `True or false: changing the value of $b$ in $y = ${Q(a, b1, c)}$ also changes the $y$-intercept?`, ms: `Benar atau palsu: menukar nilai $b$ dalam $y = ${Q(a, b1, c)}$ turut menukar pintasan-$y$?`, aEn: `False; the $y$-intercept depends only on $c$ (here $c = ${c}$), not on $b$.`, aMs: `Palsu; pintasan-$y$ hanya bergantung pada $c$ (di sini $c = ${c}$), bukan $b$.` }),
    ({ a, b1, b2, c }, r) => { const m = mcq(r, `\\text{the turning point's position}`, [`\\text{the } y\\text{-intercept}`, `\\text{the opening direction}`, `\\text{the width of the graph}`]); return { en: `Comparing $y = ${Q(a, b1, c)}$ with $y = ${Q(a, b2, c)}$ (same $a$, $c$), a change in $b$ mainly affects: ${m.list}`, ms: `Membandingkan $y = ${Q(a, b1, c)}$ dengan $y = ${Q(a, b2, c)}$ ($a$, $c$ sama), perubahan $b$ terutamanya menjejaskan: ${m.list}`, aEn: `(${m.letter})`, aMs: `(${m.letter})` }; },
    ({ a, b1, b2, c, min1x, min2x }) => ({ en: `From the tables of $y = ${Q(a, b1, c)}$ and $y = ${Q(a, b2, c)}$, the lowest (or highest) tabulated $y$-value occurs at $x = ${min1x}$ and $x = ${min2x}$ respectively. What does this suggest about the effect of $b$?`, ms: `Daripada jadual $y = ${Q(a, b1, c)}$ dan $y = ${Q(a, b2, c)}$, nilai $y$ terendah (atau tertinggi) berjadual berlaku pada $x = ${min1x}$ dan $x = ${min2x}$ masing-masing. Apakah yang dicadangkan ini tentang kesan $b$?`, aEn: `Changing $b$ shifts the position (and axis of symmetry) of the graph horizontally, without changing its $y$-intercept.`, aMs: `Menukar $b$ mengalihkan kedudukan (dan paksi simetri) graf secara mendatar, tanpa menukar pintasan-$y$nya.`, sp: 'm' }),
  ];
  const g12m1 = (r) => fam(r, ctxB12, TASKS_B);
  const g12m = [g12m1];

  const ctxABC = (r) => {
    const a = r.nz(-3, 3), b = r.nz(-4, 4), c = r.nz(-6, 6);
    return { a, b, c };
  };
  const TASKS_ABC = [
    ({ a, b, c }) => { const parts = SPM.parts([T(`$a = ${a} ${a > 0 ? '> 0' : '< 0'}$, so the graph opens ${a > 0 ? 'upward' : 'downward'}.`, `$a = ${a} ${a > 0 ? '> 0' : '< 0'}$, jadi graf terbuka ${a > 0 ? 'ke atas' : 'ke bawah'}.`), T(`$c = ${c}$, so the graph crosses the $y$-axis at $(0, ${c})$.`, `$c = ${c}$, jadi graf memotong paksi-$y$ pada $(0, ${c})$.`)]); return { en: `For $y = ${Q(a, b, c)}$, describe in words the separate effect of (a) the sign of $a$, (b) the value of $c$, on the graph.`, ms: `Bagi $y = ${Q(a, b, c)}$, terangkan secara lisan kesan berasingan bagi (a) tanda $a$, (b) nilai $c$, ke atas graf.`, aEn: parts.en, aMs: parts.ms, sp: 'm' }; },
    ({ a, b, c }, r) => {
      const c2 = c + r.pick([-3, -2, 2, 3]);
      const a2 = r.pick([a, -a]);
      return { en: `The functions $y = ${Q(a, b, c)}$ and $y = ${Q(a2, b, c2)}$ have the same $b$. Identify every coefficient that differs, and state which visual feature(s) of the graph each difference affects.`, ms: `Fungsi $y = ${Q(a, b, c)}$ dan $y = ${Q(a2, b, c2)}$ mempunyai $b$ yang sama. Kenal pasti setiap pekali yang berbeza, dan nyatakan ciri visual graf yang dijejaskan oleh setiap perbezaan.`, aEn: `$a$ differs (${a} vs ${a2}), affecting opening direction${a * a2 < 0 ? '' : '/width'}; $c$ differs (${c} vs ${c2}), affecting the $y$-intercept; $b$ is unchanged.`, aMs: `$a$ berbeza (${a} lawan ${a2}), menjejaskan arah terbuka${a * a2 < 0 ? '' : '/lebar'}; $c$ berbeza (${c} lawan ${c2}), menjejaskan pintasan-$y$; $b$ tidak berubah.`, sp: 'm' };
    },
    ({ a, b, c }, r) => {
      const student = r.pick(['a-yint', 'c-dir', 'b-yint']);
      const wrong = student === 'a-yint' ? T(`"The value of $a$ in $y = ${Q(a, b, c)}$ determines the $y$-intercept."`, `"Nilai $a$ dalam $y = ${Q(a, b, c)}$ menentukan pintasan-$y$."`) : student === 'c-dir' ? T(`"The sign of $c$ in $y = ${Q(a, b, c)}$ determines whether the graph opens upward or downward."`, `"Tanda $c$ dalam $y = ${Q(a, b, c)}$ menentukan sama ada graf terbuka ke atas atau ke bawah."`) : T(`"Changing $b$ in $y = ${Q(a, b, c)}$ changes the $y$-intercept."`, `"Menukar $b$ dalam $y = ${Q(a, b, c)}$ menukar pintasan-$y$."`);
      const fix = student === 'a-yint' ? T(`Incorrect: $a$ determines opening direction and width; the $y$-intercept is $c = ${c}$.`, `Silap: $a$ menentukan arah terbuka dan lebar; pintasan-$y$ ialah $c = ${c}$.`) : student === 'c-dir' ? T(`Incorrect: opening direction depends on the sign of $a$ (here $a = ${a}$); $c$ only sets the $y$-intercept.`, `Silap: arah terbuka bergantung pada tanda $a$ (di sini $a = ${a}$); $c$ hanya menetapkan pintasan-$y$.`) : T(`Incorrect: the $y$-intercept depends only on $c = ${c}$; $b$ affects the position/symmetry, not the $y$-intercept.`, `Silap: pintasan-$y$ hanya bergantung pada $c = ${c}$; $b$ menjejaskan kedudukan/simetri, bukan pintasan-$y$.`);
      return { en: `A student claims: ${wrong.en} Explain why this is incorrect.`, ms: `Seorang pelajar mendakwa: ${wrong.ms} Terangkan mengapa ini tidak betul.`, aEn: fix.en, aMs: fix.ms, sp: 'm' };
    },
    ({ a, b, c }, r) => {
      const descs = r.shuffle([
        { eq: Q(a, 0, c), desc: T(`opens ${a > 0 ? 'upward' : 'downward'}, $y$-intercept $${c}$, symmetric about $x = 0$`, `terbuka ${a > 0 ? 'ke atas' : 'ke bawah'}, pintasan-$y$ $${c}$, simetri tentang $x = 0$`) },
        { eq: Q(-a, 0, c), desc: T(`opens ${a > 0 ? 'downward' : 'upward'}, $y$-intercept $${c}$, symmetric about $x = 0$`, `terbuka ${a > 0 ? 'ke bawah' : 'ke atas'}, pintasan-$y$ $${c}$, simetri tentang $x = 0$`) },
      ]);
      return { en: `Match each equation to its description: (A) $y = ${descs[0].eq}$ (B) $y = ${descs[1].eq}$ — Descriptions: (i) ${descs[0].desc.en} (ii) ${descs[1].desc.en}`, ms: `Padankan setiap persamaan dengan penerangannya: (A) $y = ${descs[0].eq}$ (B) $y = ${descs[1].eq}$ — Penerangan: (i) ${descs[0].desc.ms} (ii) ${descs[1].desc.ms}`, aEn: `A–(i), B–(ii)`, aMs: `A–(i), B–(ii)`, sp: 'm' };
    },
  ];
  const g12a1 = (r) => fam(r, ctxABC, TASKS_ABC);
  const g12a = [g12a1];

  /* dense feature x wording crossings */
  const FEAT_E = [
    { ask: T('the opening direction of the graph', 'arah terbuka graf'), val: (a, c) => (a > 0 ? T('Upward', 'Ke atas') : T('Downward', 'Ke bawah')) },
    { ask: T('the $y$-intercept of the graph', 'pintasan-$y$ graf'), val: (a, c) => T(`$${c}$`, `$${c}$`) },
    { ask: T('the value of $y$ when $x = 1$', 'nilai $y$ apabila $x = 1$'), val: (a, c) => T(`$${a + c}$`, `$${a + c}$`) },
    { ask: T('the equation of the axis of symmetry', 'persamaan paksi simetri'), val: () => T('$x = 0$', '$x = 0$') },
    { ask: T('whether the graph has a minimum or maximum value, and what that value is', 'sama ada graf mempunyai nilai minimum atau maksimum, dan apakah nilai itu'), val: (a, c) => T(`A ${a > 0 ? 'minimum' : 'maximum'} value of $${c}$, at the turning point $(0, ${c})$.`, `Nilai ${a > 0 ? 'minimum' : 'maksimum'} $${c}$, pada titik pusingan $(0, ${c})$.`) },
    { ask: T('how many times the graph meets the $x$-axis', 'berapa kali graf bertemu paksi-$x$'), val: (a, c) => (a * c < 0 ? T('Twice (the vertex and opening direction put the graph on opposite sides of the $x$-axis).', 'Dua kali (bucu dan arah terbuka meletakkan graf pada sisi bertentangan paksi-$x$).') : T('Never (the vertex and opening direction keep the whole graph on one side of the $x$-axis).', 'Tidak sekali pun (bucu dan arah terbuka mengekalkan keseluruhan graf pada satu sisi paksi-$x$).')) },
    { ask: T('the coordinates of the turning point', 'koordinat titik pusingan'), val: (a, c) => T(`$(0, ${c})$`, `$(0, ${c})$`) },
    { ask: T('how many terms appear in the expression, and why the $bx$ term is missing', 'berapa sebutan yang terdapat dalam ungkapan, dan mengapa sebutan $bx$ tiada'), val: () => T('$2$ terms ($ax^2$ and $c$); the $bx$ term is absent because $b = 0$ for this family.', '$2$ sebutan ($ax^2$ dan $c$); sebutan $bx$ tiada kerana $b = 0$ bagi keluarga ini.') },
    { ask: T('whether the graph is narrower than, wider than, or the same width as $y = x^2$', 'sama ada graf lebih sempit, lebih lebar, atau sama lebar berbanding $y = x^2$'), val: (a) => (Math.abs(a) > 1 ? T('Narrower', 'Lebih sempit') : Math.abs(a) < 1 ? T('Wider', 'Lebih lebar') : T('Same width', 'Lebar sama')) },
  ];
  const INTRO_E1 = [
    (ask, y) => T(`For $y = ${y}$, state ${ask.en}.`, `Bagi $y = ${y}$, nyatakan ${ask.ms}.`),
    (ask, y) => T(`What is ${ask.en} for $y = ${y}$?`, `Apakah ${ask.ms} bagi $y = ${y}$?`),
    (ask, y) => T(`Given $y = ${y}$, determine ${ask.en}.`, `Diberi $y = ${y}$, tentukan ${ask.ms}.`),
    (ask, y) => T(`Identify ${ask.en} of $y = ${y}$.`, `Kenal pasti ${ask.ms} bagi $y = ${y}$.`),
    (ask, y) => T(`Looking at $y = ${y}$, what is ${ask.en}?`, `Melihat $y = ${y}$, apakah ${ask.ms}?`),
    (ask, y) => T(`Read directly from $y = ${y}$: ${ask.en}.`, `Baca terus daripada $y = ${y}$: ${ask.ms}.`),
    (ask, y) => T(`By inspection of $y = ${y}$, find ${ask.en}.`, `Dengan pemeriksaan $y = ${y}$, cari ${ask.ms}.`),
  ];
  const g12e3 = (r) => {
    const a = r.nz(-3, 3), c = r.nz(-6, 6);
    const y = Q(a, 0, c);
    const f = r.pick(FEAT_E);
    const s = r.pick(INTRO_E1)(f.ask, y);
    const v = f.val(a, c);
    return { q: s, a: v, sp: 'xs' };
  };

  const INTRO_E2 = [
    (a1, a2) => T(`Which graph is narrower, $y = ${a1}x^2$ or $y = ${a2}x^2$?`, `Graf manakah lebih sempit, $y = ${a1}x^2$ atau $y = ${a2}x^2$?`),
    (a1, a2) => T(`Between $y = ${a1}x^2$ and $y = ${a2}x^2$, which curve hugs the $y$-axis more closely?`, `Antara $y = ${a1}x^2$ dan $y = ${a2}x^2$, lengkung manakah lebih rapat dengan paksi-$y$?`),
    (a1, a2) => T(`$y = ${a1}x^2$ and $y = ${a2}x^2$ are graphed. Which one is the narrower parabola?`, `$y = ${a1}x^2$ dan $y = ${a2}x^2$ dilukis. Yang manakah parabola lebih sempit?`),
    (a1, a2) => T(`State which of $y = ${a1}x^2$ or $y = ${a2}x^2$ has the narrower graph.`, `Nyatakan yang manakah antara $y = ${a1}x^2$ atau $y = ${a2}x^2$ mempunyai graf lebih sempit.`),
  ];
  const g12e4 = (r) => {
    const m1 = r.pick([1, 2, 3, 4]), m2 = r.pick([1, 2, 3, 4].filter((v) => v !== m1));
    const a1 = r.sign() * m1, a2 = r.sign() * m2;
    const s = r.pick(INTRO_E2)(a1, a2);
    const win = m1 > m2 ? a1 : a2;
    return { q: s, a: T(`$y = ${win}x^2$ (larger $|a| = ${Math.max(m1, m2)}$).`, `$y = ${win}x^2$ ($|a| = ${Math.max(m1, m2)}$ lebih besar).`), sp: 's' };
  };

  const INTRO_E3 = [
    (c1, c2, a) => T(`The graphs of $y = ${Q(a, 0, c1)}$ and $y = ${Q(a, 0, c2)}$ have the same shape. Which crosses the $y$-axis higher up?`, `Graf $y = ${Q(a, 0, c1)}$ dan $y = ${Q(a, 0, c2)}$ mempunyai bentuk yang sama. Yang manakah memotong paksi-$y$ lebih tinggi?`),
    (c1, c2, a) => T(`Between $y = ${Q(a, 0, c1)}$ and $y = ${Q(a, 0, c2)}$, which one is positioned lower on the graph paper?`, `Antara $y = ${Q(a, 0, c1)}$ dan $y = ${Q(a, 0, c2)}$, yang manakah berkedudukan lebih rendah pada kertas graf?`),
    (c1, c2, a) => T(`Which of $y = ${Q(a, 0, c1)}$ or $y = ${Q(a, 0, c2)}$ passes through a point closer to the top of a typical graph grid?`, `Yang manakah antara $y = ${Q(a, 0, c1)}$ atau $y = ${Q(a, 0, c2)}$ melalui titik yang lebih dekat ke bahagian atas grid graf biasa?`),
  ];
  const g12e5 = (r) => {
    const a = r.nz(-3, 3);
    const c1 = r.nz(-6, 6), c2 = r.nz(-6, 6);
    need(c1 !== c2);
    const s = r.pick(INTRO_E3)(c1, c2, a);
    const hi = Math.max(c1, c2);
    return { q: s, a: T(`$y = ${Q(a, 0, hi)}$ (larger $y$-intercept, $${hi} > ${Math.min(c1, c2)}$).`, `$y = ${Q(a, 0, hi)}$ (pintasan-$y$ lebih besar, $${hi} > ${Math.min(c1, c2)}$).`), sp: 's' };
  };
  g12e.push(g12e3, g12e4, g12e5);

  /* m-level dense crossings */
  const FEAT_M = [
    { ask: T('the $y$-intercept', 'pintasan-$y$'), val: (a, b, c) => T(`$${c}$`, `$${c}$`) },
    { ask: T('the opening direction', 'arah terbuka'), val: (a) => (a > 0 ? T('Upward', 'Ke atas') : T('Downward', 'Ke bawah')) },
    { ask: T('whether increasing $|a|$ (keeping $b$, $c$ fixed) makes the graph narrower or wider', 'sama ada peningkatan $|a|$ (dengan $b$, $c$ tetap) menjadikan graf lebih sempit atau lebih lebar'), val: () => T('Narrower', 'Lebih sempit') },
  ];
  const INTRO_M1 = [
    (ask, y) => T(`For $y = ${y}$, determine ${ask.en}.`, `Bagi $y = ${y}$, tentukan ${ask.ms}.`),
    (ask, y) => T(`Given the quadratic $y = ${y}$ (terms possibly not in standard order), work out ${ask.en}.`, `Diberi kuadratik $y = ${y}$ (sebutan mungkin tidak dalam turutan piawai), kira ${ask.ms}.`),
    (ask, y) => T(`Deduce ${ask.en} for the function $y = ${y}$.`, `Deduksikan ${ask.ms} bagi fungsi $y = ${y}$.`),
  ];
  const g12m2 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-5, 5), c = r.nz(-6, 6);
    const y = poly([[c, ''], [b, 'x'], [a, 'x^2']]); // reordered, needs recognising terms
    const f = r.pick(FEAT_M);
    const s = r.pick(INTRO_M1)(f.ask, y);
    return { q: s, a: f.val(a, b, c), sp: 's' };
  };

  const INTRO_M2 = [
    (a, c, b1, b2) => T(`The graphs of $y = ${Q(a, b1, c)}$ and $y = ${Q(a, b2, c)}$ share the same $a$ and $c$. Explain, without using a formula for the axis of symmetry, how you know their $y$-intercepts are equal.`, `Graf $y = ${Q(a, b1, c)}$ dan $y = ${Q(a, b2, c)}$ berkongsi $a$ dan $c$ yang sama. Terangkan, tanpa menggunakan formula paksi simetri, bagaimana anda tahu pintasan-$y$ kedua-duanya sama.`),
    (a, c, b1, b2) => T(`For $y = ${Q(a, b1, c)}$ and $y = ${Q(a, b2, c)}$, justify why both graphs cross the $y$-axis at the same point.`, `Bagi $y = ${Q(a, b1, c)}$ dan $y = ${Q(a, b2, c)}$, wajarkan mengapa kedua-dua graf memotong paksi-$y$ pada titik yang sama.`),
  ];
  const g12m3 = (r) => {
    const a = r.nz(-3, 3), c = r.nz(-5, 5);
    const b1 = r.nz(-4, 4), b2 = r.nz(-4, 4);
    need(b1 !== b2);
    const s = r.pick(INTRO_M2)(a, c, b1, b2);
    return { q: s, a: T(`Substituting $x = 0$ into either equation gives $y = ${c}$ regardless of $b$, since the $bx$ term vanishes at $x = 0$.`, `Menggantikan $x = 0$ ke dalam mana-mana persamaan memberikan $y = ${c}$ tanpa mengira $b$, kerana sebutan $bx$ hilang pada $x = 0$.`), sp: 'm' };
  };
  g12m.push(g12m2, g12m3);

  /* a-level dense crossings */
  const INTRO_A1 = [
    (a, b, c) => T(`$y = ${Q(a, b, c)}$ is transformed by DOUBLING $a$ only. Describe precisely what changes and what stays the same on the graph.`, `$y = ${Q(a, b, c)}$ diubah dengan MENGGANDAKAN $a$ sahaja. Terangkan dengan tepat apa yang berubah dan apa yang kekal sama pada graf.`),
    (a, b, c) => T(`$y = ${Q(a, b, c)}$ is transformed by NEGATING $a$ only (i.e. $a \\to -a$). Describe precisely what changes and what stays the same on the graph.`, `$y = ${Q(a, b, c)}$ diubah dengan MENEGATIFKAN $a$ sahaja (iaitu $a \\to -a$). Terangkan dengan tepat apa yang berubah dan apa yang kekal sama pada graf.`),
    (a, b, c) => T(`$y = ${Q(a, b, c)}$ is transformed by adding $5$ to $c$ only. Describe precisely what changes and what stays the same on the graph.`, `$y = ${Q(a, b, c)}$ diubah dengan menambah $5$ kepada $c$ sahaja. Terangkan dengan tepat apa yang berubah dan apa yang kekal sama pada graf.`),
  ];
  const g12a2 = (r) => {
    const a = r.nz(-3, 3), b = r.nz(-4, 4), c = r.nz(-5, 5);
    const kind = r.int(0, 2);
    const s = INTRO_A1[kind](a, b, c);
    const ans = kind === 0 ? T(`The graph becomes narrower (opening direction and $y$-intercept unchanged, since only $|a|$ increased).`, `Graf menjadi lebih sempit (arah terbuka dan pintasan-$y$ tidak berubah, kerana hanya $|a|$ meningkat).`) : kind === 1 ? T(`The graph flips to open in the opposite direction (width, $y$-intercept and $b$ unchanged).`, `Graf berbalik terbuka ke arah bertentangan (lebar, pintasan-$y$ dan $b$ tidak berubah).`) : T(`The $y$-intercept increases by $5$ (new value $${c + 5}$); shape, width and opening direction unchanged.`, `Pintasan-$y$ meningkat sebanyak $5$ (nilai baharu $${c + 5}$); bentuk, lebar dan arah terbuka tidak berubah.`);
    return { q: s, a: ans, sp: 'm' };
  };

  const INTRO_A2 = [
    (a, c) => T(`A graph has equation $y = ax^2 + c$ with $a < 0$ and $c < 0$. Sketch its general shape (no scale needed) and justify your sketch using the signs of $a$ and $c$.`, `Suatu graf mempunyai persamaan $y = ax^2 + c$ dengan $a < 0$ dan $c < 0$. Lakar bentuk am grafnya (tanpa skala) dan wajarkan lakaran anda menggunakan tanda $a$ dan $c$.`),
    (a, c) => T(`A graph has equation $y = ax^2 + c$ with $a > 0$ and $c > 0$. Sketch its general shape (no scale needed) and justify your sketch using the signs of $a$ and $c$.`, `Suatu graf mempunyai persamaan $y = ax^2 + c$ dengan $a > 0$ dan $c > 0$. Lakar bentuk am grafnya (tanpa skala) dan wajarkan lakaran anda menggunakan tanda $a$ dan $c$.`),
    (a, c) => T(`A graph has equation $y = ax^2 + c$ with $a > 0$ and $c < 0$. Sketch its general shape (no scale needed) and justify your sketch using the signs of $a$ and $c$.`, `Suatu graf mempunyai persamaan $y = ax^2 + c$ dengan $a > 0$ dan $c < 0$. Lakar bentuk am grafnya (tanpa skala) dan wajarkan lakaran anda menggunakan tanda $a$ dan $c$.`),
    (a, c) => T(`A graph has equation $y = ax^2 + c$ with $a < 0$ and $c > 0$. Sketch its general shape (no scale needed) and justify your sketch using the signs of $a$ and $c$.`, `Suatu graf mempunyai persamaan $y = ax^2 + c$ dengan $a < 0$ dan $c > 0$. Lakar bentuk am grafnya (tanpa skala) dan wajarkan lakaran anda menggunakan tanda $a$ dan $c$.`),
  ];
  const g12a3 = (r) => {
    const kind = r.int(0, 3);
    const asign = kind === 0 || kind === 3 ? -1 : 1, csign = kind === 0 || kind === 2 ? -1 : 1;
    const a = asign * r.int(1, 3), c = csign * r.int(1, 6);
    const s = INTRO_A2[kind](a, c);
    return { q: s, fig: S.plane({ x: [-4, 4], y: [-8, 8], scale: 15, labelStep: 2, curves: [{ f: (x) => a * x * x + c }] }), a: T(`Opens ${a > 0 ? 'upward' : 'downward'} (sign of $a$); crosses the $y$-axis ${c > 0 ? 'above' : 'below'} the origin at $(0, ${c})$ (sign of $c$).`, `Terbuka ${a > 0 ? 'ke atas' : 'ke bawah'} (tanda $a$); memotong paksi-$y$ ${c > 0 ? 'di atas' : 'di bawah'} origin pada $(0, ${c})$ (tanda $c$).`), sp: 'm' };
  };
  g12a.push(g12a2, g12a3);

  /* extra dense crossings: representation x feature x intro, to close the gap to target */
  const REPR_G = [
    (a, c) => `y = ${Q(a, 0, c)}`,
    (a, c) => `f(x) = ${Q(a, 0, c)}`,
    (a, c) => `\\text{the graph of } y = ${Q(a, 0, c)}`,
  ];
  const INTRO_E4 = [
    (ask, y) => T(`Consider $${y}$. State ${ask.en}.`, `Pertimbangkan $${y}$. Nyatakan ${ask.ms}.`),
    (ask, y) => T(`Refer to $${y}$: what is ${ask.en}?`, `Rujuk $${y}$: apakah ${ask.ms}?`),
    (ask, y) => T(`Using $${y}$, write down ${ask.en}.`, `Menggunakan $${y}$, tuliskan ${ask.ms}.`),
  ];
  const g12e6 = (r) => {
    const a = r.nz(-3, 3), c = r.nz(-6, 6);
    const y = r.pick(REPR_G)(a, c);
    const f = r.pick(FEAT_E);
    const s = r.pick(INTRO_E4)(f.ask, y);
    return { q: s, a: f.val(a, c), sp: 'xs' };
  };

  const INTRO_E5 = [
    (a1, a2) => T(`Do the graphs of $y = ${a1}x^2$ and $y = ${a2}x^2$ open in the same direction?`, `Adakah graf $y = ${a1}x^2$ dan $y = ${a2}x^2$ terbuka ke arah yang sama?`),
    (a1, a2) => T(`Compare the opening directions of $y = ${a1}x^2$ and $y = ${a2}x^2$.`, `Bandingkan arah terbuka bagi $y = ${a1}x^2$ dan $y = ${a2}x^2$.`),
    (a1, a2) => T(`True or false: $y = ${a1}x^2$ and $y = ${a2}x^2$ open in opposite directions?`, `Benar atau palsu: $y = ${a1}x^2$ dan $y = ${a2}x^2$ terbuka ke arah bertentangan?`),
  ];
  const g12e7 = (r) => {
    const m1 = r.pick([1, 2, 3]), m2 = r.pick([1, 2, 3]);
    const s1 = r.sign(), s2 = r.pick([s1, -s1]);
    const a1 = s1 * m1, a2 = s2 * m2;
    const same = (a1 > 0) === (a2 > 0);
    const s = r.pick(INTRO_E5)(a1, a2);
    return { q: s, a: T(same ? 'Yes, both open in the same direction.' : 'No, they open in opposite directions.', same ? 'Ya, kedua-duanya terbuka ke arah yang sama.' : 'Tidak, kedua-duanya terbuka ke arah bertentangan.'), sp: 'xs' };
  };
  g12e.push(g12e6, g12e7);

  const INTRO_M4 = [
    (a1, a2, c) => T(`Two graphs, $y = ${Q(a1, 0, c)}$ and $y = ${Q(a2, 0, c)}$, share the same $c$. State one feature that is the same for both graphs and one that differs, with reasons.`, `Dua graf, $y = ${Q(a1, 0, c)}$ dan $y = ${Q(a2, 0, c)}$, berkongsi $c$ yang sama. Nyatakan satu ciri yang sama bagi kedua-dua graf dan satu yang berbeza, berserta sebab.`),
    (a1, a2, c) => T(`For $y = ${Q(a1, 0, c)}$ and $y = ${Q(a2, 0, c)}$, identify what is common and what is different between the two graphs, with reasons.`, `Bagi $y = ${Q(a1, 0, c)}$ dan $y = ${Q(a2, 0, c)}$, kenal pasti apa yang sepunya dan apa yang berbeza antara kedua-dua graf, berserta sebab.`),
  ];
  const g12m4 = (r) => {
    const c = r.nz(-5, 5);
    const m1 = r.pick([1, 2, 3]), m2 = r.pick([1, 2, 3].filter((v) => v !== m1));
    const a1 = m1, a2 = m2;
    const s = r.pick(INTRO_M4)(a1, a2, c);
    return { q: s, a: T(`Same: the $y$-intercept ($c = ${c}$ for both) and opening direction (both open upward). Different: the width — $y = ${Q(a2, 0, c)}$ is narrower since $|a| = ${m2} > ${m1}$.`, `Sama: pintasan-$y$ ($c = ${c}$ bagi kedua-duanya) dan arah terbuka (kedua-duanya terbuka ke atas). Berbeza: lebar — $y = ${Q(a2, 0, c)}$ lebih sempit kerana $|a| = ${m2} > ${m1}$.`), sp: 'm' };
  };
  g12m.push(g12m4);

  const INTRO_A4 = [
    (y1, y2) => T(`Graph $P$: $y = ${y1}$. Graph $Q$: $y = ${y2}$. List every visual difference between $P$ and $Q$, linking each to the coefficient responsible.`, `Graf $P$: $y = ${y1}$. Graf $Q$: $y = ${y2}$. Senaraikan setiap perbezaan visual antara $P$ dan $Q$, dengan mengaitkan setiap satu kepada pekali yang bertanggungjawab.`),
    (y1, y2) => T(`Comparing graph $P$: $y = ${y1}$ with graph $Q$: $y = ${y2}$, explain fully how they differ and why, coefficient by coefficient.`, `Membandingkan graf $P$: $y = ${y1}$ dengan graf $Q$: $y = ${y2}$, terangkan sepenuhnya bagaimana kedua-duanya berbeza dan mengapa, pekali demi pekali.`),
  ];
  const g12a4 = (r) => {
    const a1 = r.nz(-3, 3), c1 = r.nz(-5, 5);
    const a2 = r.nz(-3, 3), c2 = r.nz(-5, 5);
    need(a1 !== a2 && c1 !== c2);
    const s = r.pick(INTRO_A4)(Q(a1, 0, c1), Q(a2, 0, c2));
    const dirDiff = (a1 > 0) !== (a2 > 0);
    return { q: s, a: T(`Opening direction: ${dirDiff ? 'differs' : 'the same'} (from $a$: $${a1}$ vs $${a2}$). Width: ${Math.abs(a1) !== Math.abs(a2) ? `differs, $|a|=${Math.abs(a1)}$ vs $|a|=${Math.abs(a2)}$` : 'the same magnitude of $a$'}. $y$-intercept: differs ($c = ${c1}$ vs $c = ${c2}$).`, `Arah terbuka: ${dirDiff ? 'berbeza' : 'sama'} (daripada $a$: $${a1}$ lawan $${a2}$). Lebar: ${Math.abs(a1) !== Math.abs(a2) ? `berbeza, $|a|=${Math.abs(a1)}$ lawan $|a|=${Math.abs(a2)}$` : 'magnitud $a$ yang sama'}. Pintasan-$y$: berbeza ($c = ${c1}$ lawan $c = ${c2}$).`), sp: 'm' };
  };
  g12a.push(g12a4);

  /* more m/a crossings (these levels lag) */
  const FEAT_M2 = [
    { ask: T('the $y$-intercept', 'pintasan-$y$'), val: (a, b, c) => T(`$${c}$`, `$${c}$`) },
    { ask: T('the opening direction', 'arah terbuka'), val: (a) => (a > 0 ? T('Upward', 'Ke atas') : T('Downward', 'Ke bawah')) },
  ];
  const INTRO_M5 = [
    (ask, y) => T(`After identifying $a$, $b$, $c$ in $y = ${y}$, state ${ask.en}.`, `Selepas mengenal pasti $a$, $b$, $c$ dalam $y = ${y}$, nyatakan ${ask.ms}.`),
    (ask, y) => T(`Rearranged, $y = ${y}$ is a quadratic function. Work out ${ask.en}.`, `Setelah disusun semula, $y = ${y}$ ialah fungsi kuadratik. Kira ${ask.ms}.`),
    (ask, y) => T(`For the quadratic function $y = ${y}$ (with terms out of order), find ${ask.en}.`, `Bagi fungsi kuadratik $y = ${y}$ (dengan sebutan tidak mengikut turutan), cari ${ask.ms}.`),
    (ask, y) => T(`Examine $y = ${y}$ carefully and state ${ask.en}.`, `Periksa $y = ${y}$ dengan teliti dan nyatakan ${ask.ms}.`),
  ];
  const g12m5 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-5, 5), c = r.nz(-6, 6);
    const y = poly([[b, 'x'], [c, ''], [a, 'x^2']]); // bx + c + ax^2
    const f = r.pick(FEAT_M2);
    const s = r.pick(INTRO_M5)(f.ask, y);
    return { q: s, a: f.val(a, b, c), sp: 's' };
  };

  const INTRO_M6 = [
    (a, c1, c2) => T(`Explain, WITHOUT sketching, why the graphs of $y = ${Q(a, 0, c1)}$ and $y = ${Q(a, 0, c2)}$ never cross each other.`, `Terangkan, TANPA melakar, mengapa graf $y = ${Q(a, 0, c1)}$ dan $y = ${Q(a, 0, c2)}$ tidak pernah bersilang.`),
    (a, c1, c2) => T(`Justify, using algebra rather than a sketch, why $y = ${Q(a, 0, c1)}$ and $y = ${Q(a, 0, c2)}$ are parallel-looking curves that never meet.`, `Wajarkan, menggunakan algebra dan bukan lakaran, mengapa $y = ${Q(a, 0, c1)}$ dan $y = ${Q(a, 0, c2)}$ ialah lengkung yang kelihatan selari dan tidak pernah bertemu.`),
  ];
  const g12m6 = (r) => {
    const a = r.nz(-3, 3);
    const c1 = r.nz(-5, 5), c2 = r.nz(-5, 5);
    need(c1 !== c2);
    const s = r.pick(INTRO_M6)(a, c1, c2);
    return { q: s, a: T(`For any $x$, the difference in $y$-values is $${Q(a, 0, c1)} - (${Q(a, 0, c2)}) = ${c1 - c2}$, a nonzero constant, so the two curves are always $${Math.abs(c1 - c2)}$ apart vertically and never intersect.`, `Bagi sebarang $x$, perbezaan nilai $y$ ialah $${Q(a, 0, c1)} - (${Q(a, 0, c2)}) = ${c1 - c2}$, satu pemalar bukan sifar, jadi kedua-dua lengkung sentiasa $${Math.abs(c1 - c2)}$ terpisah secara menegak dan tidak pernah bersilang.`), sp: 'm' };
  };
  g12m.push(g12m5, g12m6);

  const INTRO_A5 = [
    (a, b, c, x0) => T(`For $y = ${Q(a, b, c)}$, a student wants to know the $y$-value when $x = ${x0}$ WITHOUT a calculator or graph. Show how, and explain what coefficient effect makes the constant term easy to check separately at $x = 0$.`, `Bagi $y = ${Q(a, b, c)}$, seorang pelajar ingin tahu nilai $y$ apabila $x = ${x0}$ TANPA kalkulator atau graf. Tunjukkan caranya, dan terangkan kesan pekali yang menjadikan sebutan malar mudah disemak secara berasingan pada $x = 0$.`),
  ];
  const g12a5 = (r) => {
    const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-8, 8), x0 = r.nz(-3, 3);
    const val = a * x0 * x0 + b * x0 + c;
    const sub = `${a}(${x0})^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}(${x0}) ${c < 0 ? '-' : '+'} ${Math.abs(c)}`;
    const s = INTRO_A5[0](a, b, c, x0);
    return { q: s, a: T(`$y = ${sub} = ${val}$; the constant term $c = ${c}$ is exactly the value at $x = 0$, since the $ax^2$ and $bx$ terms both vanish there.`, `$y = ${sub} = ${val}$; sebutan malar $c = ${c}$ adalah tepat nilai pada $x = 0$, kerana sebutan $ax^2$ dan $bx$ kedua-duanya hilang di sana.`), sp: 'm' };
  };

  const INTRO_A6 = [
    (a1, a2, c) => T(`Two parabolas, $y = ${Q(a1, 0, c)}$ and $y = ${Q(a2, 0, c)}$, are graphed on the same axes. Determine algebraically all points where they intersect.`, `Dua parabola, $y = ${Q(a1, 0, c)}$ dan $y = ${Q(a2, 0, c)}$, dilukis pada paksi yang sama. Tentukan secara algebra semua titik persilangan kedua-duanya.`),
  ];
  const g12a6 = (r) => {
    const c = r.nz(-5, 5);
    const a1 = r.nz(-3, 3), a2 = r.nz(-3, 3);
    need(a1 !== a2);
    const s = INTRO_A6[0](a1, a2, c);
    return { q: s, a: T(`Setting $${Q(a1, 0, c)} = ${Q(a2, 0, c)}$ gives $(${a1} - ${a2})x^2 = 0$, so $x = 0$ (a repeated/double solution). They meet only at $(0, ${c})$, their common $y$-intercept.`, `Menetapkan $${Q(a1, 0, c)} = ${Q(a2, 0, c)}$ memberikan $(${a1} - ${a2})x^2 = 0$, jadi $x = 0$ (punca berganda). Kedua-duanya bertemu hanya pada $(0, ${c})$, pintasan-$y$ sepunya.`), sp: 'm' };
  };
  g12a.push(g12a5, g12a6);

  /* final push: wide wording x feature crossings */
  const INTRO_E6 = [
    (ask, y) => T(`In $${y}$, ${ask.en} is what?`, `Dalam $${y}$, ${ask.ms} adalah apa?`),
    (ask, y) => T(`Report ${ask.en} for the curve $${y}$.`, `Laporkan ${ask.ms} bagi lengkung $${y}$.`),
    (ask, y) => T(`Extract ${ask.en} from $${y}$.`, `Ekstrak ${ask.ms} daripada $${y}$.`),
  ];
  const g12e8 = (r) => {
    const a = r.nz(-3, 3), c = r.nz(-6, 6);
    const y = Q(a, 0, c);
    const f = r.pick(FEAT_E);
    const s = r.pick(INTRO_E6)(f.ask, y);
    return { q: s, a: f.val(a, c), sp: 'xs' };
  };
  g12e.push(g12e8);

  const INTRO_M7 = [
    (a1, a2, c) => T(`A wider parabola $y = ${Q(a1, 0, c)}$ and a narrower parabola $y = ${Q(a2, 0, c)}$ are both drawn. State which equation belongs to the narrower parabola, and explain your reasoning using $|a|$.`, `Parabola lebih lebar $y = ${Q(a1, 0, c)}$ dan parabola lebih sempit $y = ${Q(a2, 0, c)}$ kedua-duanya dilukis. Nyatakan persamaan yang manakah tergolong pada parabola lebih sempit, dan terangkan penaakulan anda menggunakan $|a|$.`),
    (a1, a2, c) => T(`Between $y = ${Q(a1, 0, c)}$ and $y = ${Q(a2, 0, c)}$, one graph is visibly narrower than the other. Identify which equation it is, with justification.`, `Antara $y = ${Q(a1, 0, c)}$ dan $y = ${Q(a2, 0, c)}$, satu graf kelihatan lebih sempit daripada yang lain. Kenal pasti persamaan yang manakah, berserta justifikasi.`),
  ];
  const g12m7 = (r) => {
    const c = r.nz(-4, 4);
    const m1 = r.pick([1, 2]), m2 = r.pick([3, 4]);
    const a1 = m1, a2 = m2;
    const s = r.pick(INTRO_M7)(a1, a2, c);
    return { q: s, a: T(`$y = ${Q(a2, 0, c)}$ is narrower, since $|a| = ${m2} > ${m1}$.`, `$y = ${Q(a2, 0, c)}$ lebih sempit, kerana $|a| = ${m2} > ${m1}$.`), sp: 's' };
  };
  g12m.push(g12m7);

  const INTRO_A7 = [
    (a, c) => T(`A parabola $y = ${Q(a, 0, c)}$ is reflected in the $x$-axis to form a new graph. Find the equation of the new graph, and describe what changed and what stayed the same.`, `Parabola $y = ${Q(a, 0, c)}$ dipantulkan pada paksi-$x$ untuk membentuk graf baharu. Cari persamaan graf baharu, dan terangkan apa yang berubah dan apa yang kekal sama.`),
  ];
  const g12a7 = (r) => {
    const a = r.nz(-3, 3), c = r.nz(-6, 6);
    const s = INTRO_A7[0](a, c);
    return { q: s, a: T(`New equation: $y = ${Q(-a, 0, -c)}$ (both $a$ and $c$ negate). Opening direction reverses and the $y$-intercept reflects to $${-c}$; the width ($|a| = ${Math.abs(a)}$) stays the same.`, `Persamaan baharu: $y = ${Q(-a, 0, -c)}$ ($a$ dan $c$ kedua-duanya bertukar tanda). Arah terbuka berbalik dan pintasan-$y$ terpantul kepada $${-c}$; lebar ($|a| = ${Math.abs(a)}$) kekal sama.`), sp: 'm' };
  };

  const INTRO_A8 = [
    (a, c1, c2) => T(`Three graphs share the equation form $y = ${a === 1 ? '' : a === -1 ? '-' : a}x^2 + c$. Two of them have $c = ${c1}$ and $c = ${c2}$. Without computing anything else, rank all statements true for every member of this family (shape, width, axis of symmetry) versus what varies.`, `Tiga graf berkongsi bentuk persamaan $y = ${a === 1 ? '' : a === -1 ? '-' : a}x^2 + c$. Dua daripadanya mempunyai $c = ${c1}$ dan $c = ${c2}$. Tanpa mengira apa-apa lagi, susun semua pernyataan yang benar bagi setiap ahli keluarga ini (bentuk, lebar, paksi simetri) berbanding apa yang berubah.`),
  ];
  const g12a8 = (r) => {
    const a = r.nz(-3, 3);
    const c1 = r.nz(-5, 5), c2 = r.nz(-5, 5);
    need(c1 !== c2);
    const s = INTRO_A8[0](a, c1, c2);
    return { q: s, a: T(`Always true for the family: same shape and width (fixed $a = ${a}$) and same axis of symmetry $x = 0$ (since $b = 0$). What varies: the $y$-intercept and vertical position, controlled by $c$.`, `Sentiasa benar bagi keluarga ini: bentuk dan lebar sama ($a = ${a}$ tetap) dan paksi simetri sama $x = 0$ (kerana $b = 0$). Apa yang berubah: pintasan-$y$ dan kedudukan menegak, dikawal oleh $c$.`), sp: 'm' };
  };
  g12a.push(g12a7, g12a8);

  /* big a-level crossing: representation x feature x justify-wording (a-level lags most) */
  const INTRO_A9 = [
    (ask, y) => T(`Justify, from $${y}$ alone (no sketch), ${ask.en}.`, `Wajarkan, daripada $${y}$ sahaja (tanpa lakaran), ${ask.ms}.`),
    (ask, y) => T(`Without drawing anything, argue what ${ask.en} must be for $${y}$, citing the relevant coefficient.`, `Tanpa melukis apa-apa, hujahkan apakah ${ask.ms} bagi $${y}$, dengan merujuk pekali berkaitan.`),
    (ask, y) => T(`A peer is unsure how to determine ${ask.en} for $${y}$ just by inspection. Explain the reasoning to them.`, `Seorang rakan tidak pasti cara menentukan ${ask.ms} bagi $${y}$ hanya dengan pemeriksaan. Terangkan penaakulan itu kepadanya.`),
  ];
  const FEAT_A = [
    { ask: T('the opening direction', 'arah terbuka'), val: (a, c) => T(`${a > 0 ? 'Upward' : 'Downward'}, because the coefficient of $x^2$ is $a = ${a} ${a > 0 ? '> 0' : '< 0'}$.`, `${a > 0 ? 'Ke atas' : 'Ke bawah'}, kerana pekali $x^2$ ialah $a = ${a} ${a > 0 ? '> 0' : '< 0'}$.`) },
    { ask: T('the value of $y$ when $x = 1$', 'nilai $y$ apabila $x = 1$'), val: (a, c) => T(`$${a + c}$, because $y = ${a}(1)^2 + ${c} = ${a + c}$ when there is no $bx$ term.`, `$${a + c}$, kerana $y = ${a}(1)^2 + ${c} = ${a + c}$ apabila tiada sebutan $bx$.`) },
    { ask: T('the equation of the axis of symmetry', 'persamaan paksi simetri'), val: () => T('$x = 0$, because the family $y = ax^2 + c$ has $b = 0$, so the graph is symmetric about the $y$-axis.', '$x = 0$, kerana keluarga $y = ax^2 + c$ mempunyai $b = 0$, jadi graf simetri tentang paksi-$y$.') },
    { ask: T('whether the graph has a minimum or maximum value, and what that value is', 'sama ada graf mempunyai nilai minimum atau maksimum, dan apakah nilai itu'), val: (a, c) => T(`A ${a > 0 ? 'minimum' : 'maximum'} value of $${c}$, at the turning point $(0, ${c})$, because this is the lowest/highest point reached by the family $y = ax^2 + c$.`, `Nilai ${a > 0 ? 'minimum' : 'maksimum'} $${c}$, pada titik pusingan $(0, ${c})$, kerana inilah titik terendah/tertinggi yang dicapai oleh keluarga $y = ax^2 + c$.`) },
    { ask: T('how many times the graph meets the $x$-axis', 'berapa kali graf bertemu paksi-$x$'), val: (a, c) => (a * c < 0 ? T('Twice, because the turning point $(0,' + c + ')$ is on the opposite side of the $x$-axis from the direction the graph opens.', 'Dua kali, kerana titik pusingan $(0,' + c + ')$ berada pada sisi bertentangan paksi-$x$ daripada arah graf terbuka.') : T('Never, because the turning point and the opening direction keep the whole graph on one side of the $x$-axis.', 'Tidak sekali pun, kerana titik pusingan dan arah terbuka mengekalkan keseluruhan graf pada satu sisi paksi-$x$.')) },
    { ask: T('the $y$-intercept', 'pintasan-$y$'), val: (a, c) => T(`$${c}$, because substituting $x = 0$ leaves only the constant term $c = ${c}$.`, `$${c}$, kerana menggantikan $x = 0$ hanya meninggalkan sebutan malar $c = ${c}$.`) },
    { ask: T('whether the graph is narrower than $y = x^2$', 'sama ada graf lebih sempit berbanding $y = x^2$'), val: (a, c) => T(Math.abs(a) > 1 ? `Yes, since $|a| = ${Math.abs(a)} > 1$.` : Math.abs(a) < 1 ? `No, it is wider, since $|a| = ${Math.abs(a)} < 1$.` : `No, it is the same width, since $|a| = 1$.`, Math.abs(a) > 1 ? `Ya, kerana $|a| = ${Math.abs(a)} > 1$.` : Math.abs(a) < 1 ? `Tidak, ia lebih lebar, kerana $|a| = ${Math.abs(a)} < 1$.` : `Tidak, ia sama lebar, kerana $|a| = 1$.`) },
  ];
  const g12a9 = (r) => {
    const a = r.nz(-3, 3), c = r.nz(-6, 6);
    const y = r.pick(REPR_G)(a, c);
    const f = r.pick(FEAT_A);
    const s = r.pick(INTRO_A9)(f.ask, y);
    return { q: s, a: f.val(a, c), sp: 's' };
  };
  g12a.push(g12a9);

  /* big m-level crossing mirroring the a-level one (m lags) */
  const INTRO_M8 = [
    (ask, y) => T(`For $${y}$, work out ${ask.en}, showing your reasoning.`, `Bagi $${y}$, kira ${ask.ms}, dengan menunjukkan penaakulan anda.`),
    (ask, y) => T(`Determine ${ask.en} for $${y}$ and explain briefly how you found it.`, `Tentukan ${ask.ms} bagi $${y}$ dan terangkan secara ringkas bagaimana anda mendapatkannya.`),
    (ask, y) => T(`Given $${y}$, calculate ${ask.en}.`, `Diberi $${y}$, hitung ${ask.ms}.`),
    (ask, y) => T(`Analyse $${y}$ to find ${ask.en}.`, `Analisis $${y}$ untuk mencari ${ask.ms}.`),
  ];
  const FEAT_M3 = [
    { ask: T('the opening direction', 'arah terbuka'), val: (a, c) => T(a > 0 ? 'Upward' : 'Downward', a > 0 ? 'Ke atas' : 'Ke bawah') },
    { ask: T('the $y$-intercept', 'pintasan-$y$'), val: (a, c) => T(`$${c}$`, `$${c}$`) },
    { ask: T('whether the graph is narrower than, wider than, or the same width as $y = x^2$', 'sama ada graf lebih sempit, lebih lebar, atau sama lebar berbanding $y = x^2$'), val: (a) => (Math.abs(a) > 1 ? T('Narrower', 'Lebih sempit') : Math.abs(a) < 1 ? T('Wider', 'Lebih lebar') : T('Same width', 'Lebar sama')) },
    { ask: T('the value of $y$ when $x = 1$', 'nilai $y$ apabila $x = 1$'), val: (a, c) => T(`$${a + c}$`, `$${a + c}$`) },
    { ask: T('the equation of the axis of symmetry', 'persamaan paksi simetri'), val: () => T('$x = 0$', '$x = 0$') },
    { ask: T('whether the graph has a minimum or maximum value, and what that value is', 'sama ada graf mempunyai nilai minimum atau maksimum, dan apakah nilai itu'), val: (a, c) => T(`A ${a > 0 ? 'minimum' : 'maximum'} value of $${c}$, at the turning point $(0, ${c})$.`, `Nilai ${a > 0 ? 'minimum' : 'maksimum'} $${c}$, pada titik pusingan $(0, ${c})$.`) },
    { ask: T('how many times the graph meets the $x$-axis', 'berapa kali graf bertemu paksi-$x$'), val: (a, c) => (a * c < 0 ? T('Twice (the vertex and opening direction put the graph on opposite sides of the $x$-axis).', 'Dua kali (bucu dan arah terbuka meletakkan graf pada sisi bertentangan paksi-$x$).') : T('Never (the vertex and opening direction keep the whole graph on one side of the $x$-axis).', 'Tidak sekali pun (bucu dan arah terbuka mengekalkan keseluruhan graf pada satu sisi paksi-$x$).')) },
    { ask: T('the coordinates of the turning point', 'koordinat titik pusingan'), val: (a, c) => T(`$(0, ${c})$`, `$(0, ${c})$`) },
    { ask: T('how many terms appear in the expression, and why the $bx$ term is missing', 'berapa sebutan yang terdapat dalam ungkapan, dan mengapa sebutan $bx$ tiada'), val: () => T('$2$ terms ($ax^2$ and $c$); the $bx$ term is absent because $b = 0$ for this family.', '$2$ sebutan ($ax^2$ dan $c$); sebutan $bx$ tiada kerana $b = 0$ bagi keluarga ini.') },
  ];
  const g12m8 = (r) => {
    const a = r.nz(-3, 3), c = r.nz(-6, 6);
    const y = r.pick(REPR_G)(a, c);
    const f = r.pick(FEAT_M3);
    const s = r.pick(INTRO_M8)(f.ask, y);
    return { q: s, a: f.val(a, c), sp: 's' };
  };
  g12m.push(g12m8);

  SPM.extend('F4-1.2', { e: g12e, m: g12m, a: g12a });

  /* =============================================================== 1.3 : forming & interpreting roots */
  const ctxPQ = (r) => { const p = r.nz(-6, 6), q = r.nz(-6, 6); need(p !== q); return { p, q }; };
  const REPR_PQ = [
    (p, q) => `(x - ${p})(x - ${q})`,
    (p, q) => `(x ${p < 0 ? '+' : '-'} ${Math.abs(p)})(x ${q < 0 ? '+' : '-'} ${Math.abs(q)})`,
    (p, q) => `(x - ${q})(x - ${p})`,
  ];
  const FEAT_ROOT_E = [
    { ask: T('the roots of $f(x) = 0$', 'punca bagi $f(x) = 0$'), val: (p, q) => T(`$x = ${p}$ or $x = ${q}$`, `$x = ${p}$ atau $x = ${q}$`) },
    { ask: T('the $x$-intercepts of the graph of $f$', 'pintasan-$x$ graf $f$'), val: (p, q) => T(`$(${p}, 0)$ and $(${q}, 0)$`, `$(${p}, 0)$ dan $(${q}, 0)$`) },
    { ask: T('$f(x)$ expanded in the form $ax^2 + bx + c$', '$f(x)$ dikembangkan dalam bentuk $ax^2 + bx + c$'), val: (p, q) => T(`$${Q(1, -(p + q), p * q)}$`, `$${Q(1, -(p + q), p * q)}$`) },
    { ask: T('the sum of the two roots', 'hasil tambah kedua-dua punca'), val: (p, q) => T(`$${p} + ${q} = ${p + q}$`, `$${p} + ${q} = ${p + q}$`) },
    { ask: T('the product of the two roots', 'hasil darab kedua-dua punca'), val: (p, q) => T(`$${p} \\times ${q} = ${p * q}$`, `$${p} \\times ${q} = ${p * q}$`) },
    { ask: T('how many real roots $f(x) = 0$ has', 'berapa punca nyata yang dimiliki $f(x) = 0$'), val: () => T('Two (the two distinct roots shown).', 'Dua (dua punca berbeza yang ditunjukkan).') },
    { ask: T('the value of $f(0)$, the $y$-intercept', 'nilai $f(0)$, pintasan-$y$'), val: (p, q) => T(`$f(0) = (0 - ${p})(0 - ${q}) = ${p * q}$`, `$f(0) = (0 - ${p})(0 - ${q}) = ${p * q}$`) },
    { ask: T('the number of factors visible in $f(x)$', 'bilangan faktor yang kelihatan dalam $f(x)$'), val: () => T('$2$ linear factors, one for each root.', '$2$ faktor linear, satu bagi setiap punca.') },
    { ask: T('the smaller of the two roots', 'punca yang lebih kecil antara kedua-duanya'), val: (p, q) => T(`$x = ${Math.min(p, q)}$`, `$x = ${Math.min(p, q)}$`) },
    { ask: T('the midpoint between the two roots', 'titik tengah antara kedua-dua punca'), val: (p, q) => T(`$${frT(fr(p + q, 2))}$`, `$${frT(fr(p + q, 2))}$`) },
    { ask: T('the larger of the two roots', 'punca yang lebih besar antara kedua-duanya'), val: (p, q) => T(`$x = ${Math.max(p, q)}$`, `$x = ${Math.max(p, q)}$`) },
    { ask: T('whether $f$ has a maximum or minimum point (assuming the leading coefficient is positive)', 'sama ada $f$ mempunyai titik maksimum atau minimum (andaikan pekali pendahulu positif)'), val: () => T('Minimum (an upward-opening parabola with positive leading coefficient).', 'Minimum (parabola terbuka ke atas dengan pekali pendahulu positif).') },
  ];
  const INTRO_R1 = [
    (ask, y) => T(`Given $f(x) = ${y}$, state ${ask.en}.`, `Diberi $f(x) = ${y}$, nyatakan ${ask.ms}.`),
    (ask, y) => T(`For the quadratic function $f(x) = ${y}$, find ${ask.en}.`, `Bagi fungsi kuadratik $f(x) = ${y}$, cari ${ask.ms}.`),
    (ask, y) => T(`If $f(x) = ${y}$, what is ${ask.en}?`, `Jika $f(x) = ${y}$, apakah ${ask.ms}?`),
    (ask, y) => T(`Write down ${ask.en} for $f(x) = ${y}$.`, `Tuliskan ${ask.ms} bagi $f(x) = ${y}$.`),
    (ask, y) => T(`Consider the function $f(x) = ${y}$. Determine ${ask.en}.`, `Pertimbangkan fungsi $f(x) = ${y}$. Tentukan ${ask.ms}.`),
    (ask, y) => T(`The quadratic $f(x) = ${y}$ is given. Report ${ask.en}.`, `Kuadratik $f(x) = ${y}$ diberikan. Laporkan ${ask.ms}.`),
    (ask, y) => T(`Examine $f(x) = ${y}$ and work out ${ask.en}.`, `Periksa $f(x) = ${y}$ dan kira ${ask.ms}.`),
    (ask, y) => T(`From $f(x) = ${y}$, extract ${ask.en}.`, `Daripada $f(x) = ${y}$, dapatkan ${ask.ms}.`),
  ];
  const g13e1 = (r) => {
    const { p, q } = ctxPQ(r);
    const y = r.pick(REPR_PQ)(p, q);
    const f = r.pick(FEAT_ROOT_E);
    const s = r.pick(INTRO_R1)(f.ask, y);
    return { q: s, a: f.val(p, q), sp: 's' };
  };

  const g13e2 = (r) => {
    const { p, q } = ctxPQ(r);
    const testP = r.chance();
    const x0 = testP ? p : r.nz(-6, 6);
    need(testP || x0 !== p);
    const isRoot = x0 === p || x0 === q;
    const val = (x0 - p) * (x0 - q);
    return { q: T(`Is $x = ${x0}$ a root of $f(x) = (x - ${p})(x - ${q})$? Verify by substitution.`, `Adakah $x = ${x0}$ punca bagi $f(x) = (x - ${p})(x - ${q})$? Sahkan dengan penggantian.`), a: T(`$f(${x0}) = ${val}$, so $x = ${x0}$ ${isRoot ? 'IS' : 'is NOT'} a root.`, `$f(${x0}) = ${val}$, jadi $x = ${x0}$ ${isRoot ? 'ADALAH' : 'BUKAN'} punca.`), sp: 's' };
  };

  const g13e3 = (r) => {
    const p = r.int(2, 6), q = r.int(2, 6);
    return { q: T(`A rectangle has length $(x + ${p})$ cm and width $(x + ${q})$ cm. Write the area as a quadratic function $A(x)$.`, `Sebuah segi empat tepat mempunyai panjang $(x + ${p})$ cm dan lebar $(x + ${q})$ cm. Tulis luasnya sebagai fungsi kuadratik $A(x)$.`), a: T(`$A(x) = (x + ${p})(x + ${q}) = ${Q(1, p + q, p * q)}$`), sp: 's' };
  };

  const g13e4 = (r) => {
    const p = r.int(-4, -1), q = r.int(1, 4);
    const fig = S.plane({ x: [-6, 6], y: [-6, 6], scale: 15, labelStep: 2, curves: [{ f: (x) => (x - p) * (x - q) }] });
    return { q: T('The graph of a quadratic function $f$ is shown. State the roots of the equation $f(x) = 0$.', 'Graf suatu fungsi kuadratik $f$ ditunjukkan. Nyatakan punca bagi persamaan $f(x) = 0$.'), fig, a: T(`$x = ${p}$ and $x = ${q}$ (where the graph crosses the $x$-axis).`, `$x = ${p}$ dan $x = ${q}$ (di mana graf memotong paksi-$x$).`), sp: 's' };
  };
  const g13e5 = (r) => {
    const p = r.nz(-5, 5), q = r.nz(-5, 5);
    need(p !== q);
    const good = `x = ${p} \\text{ or } x = ${q}`;
    const bads = [`x = ${-p} \\text{ or } x = ${-q}`, `x = ${p + q}`, `x = ${p * q}`, `x = ${p} \\text{ and } x = ${p}`];
    const m = mcq(r, good, bads);
    return { q: T(`What are the roots of $f(x) = (x - ${p})(x - ${q})$? ${m.list}`, `Apakah punca bagi $f(x) = (x - ${p})(x - ${q})$? ${m.list}`), a: T(`(${m.letter})`), sp: 's' };
  };
  const g13e6 = (r) => {
    const p = r.nz(-5, 5), q = r.nz(-5, 5);
    need(p !== q);
    return { q: T(`True or false: the graph of $f(x) = (x - ${p})(x - ${q})$ crosses the $x$-axis exactly twice?`, `Benar atau palsu: graf $f(x) = (x - ${p})(x - ${q})$ memotong paksi-$x$ tepat dua kali?`), a: T(`True; the two distinct roots $x = ${p}$ and $x = ${q}$ give two $x$-intercepts.`, `Benar; dua punca berbeza $x = ${p}$ dan $x = ${q}$ memberikan dua pintasan-$x$.`), sp: 's' };
  };
  const g13e = [g13e1, g13e2, g13e3, g13e4, g13e5, g13e6];

  const ctxPQa = (r) => { const p = r.nz(-5, 5), q = r.nz(-5, 5); const a = r.pick([1, 2, 3, -1, -2]); need(p !== q && p !== 1 && q !== 1 && p !== -1 && q !== -1); return { p, q, a }; };
  const FEAT_ROOT_M = [
    { ask: T('the value of the leading coefficient $a$', 'nilai pekali pendahulu $a$'), val: (p, q, a) => T(`$a = ${a}$, since $f(0) = a(0 - ${p})(0 - ${q}) = ${p * q}a = ${a * p * q}$.`, `$a = ${a}$, kerana $f(0) = a(0 - ${p})(0 - ${q}) = ${p * q}a = ${a * p * q}$.`) },
    { ask: T('$f(x)$ expanded in the form $ax^2 + bx + c$', '$f(x)$ dikembangkan dalam bentuk $ax^2 + bx + c$'), val: (p, q, a) => T(`$${Q(a, -a * (p + q), a * p * q)}$`, `$${Q(a, -a * (p + q), a * p * q)}$`) },
    { ask: T('whether $x = 0$ is a root of $f(x) = 0$, and why', 'sama ada $x = 0$ ialah punca bagi $f(x) = 0$, dan mengapa'), val: (p, q, a) => T(`No; the only roots are $x = ${p}$ and $x = ${q}$, both nonzero.`, `Tidak; punca hanya $x = ${p}$ dan $x = ${q}$, kedua-duanya bukan sifar.`) },
    { ask: T('the equation of $f$ written as $ax^2 + bx + c = 0$', 'persamaan $f$ ditulis sebagai $ax^2 + bx + c = 0$'), val: (p, q, a) => T(`$${Q(a, -a * (p + q), a * p * q)} = 0$`, `$${Q(a, -a * (p + q), a * p * q)} = 0$`) },
    { ask: T('whether the graph opens upward or downward', 'sama ada graf terbuka ke atas atau ke bawah'), val: (p, q, a) => T(a > 0 ? 'Upward (since $a > 0$).' : 'Downward (since $a < 0$).', a > 0 ? 'Ke atas (kerana $a > 0$).' : 'Ke bawah (kerana $a < 0$).') },
    { ask: T('the sum and product of the two roots', 'hasil tambah dan hasil darab kedua-dua punca'), val: (p, q) => T(`Sum $= ${p + q}$; product $= ${p * q}$.`, `Hasil tambah $= ${p + q}$; hasil darab $= ${p * q}$.`) },
    { ask: T('the value of $f(1)$', 'nilai $f(1)$'), val: (p, q, a) => T(`$f(1) = a(1 - ${p})(1 - ${q}) = ${(1 - p) * (1 - q)}a = ${(1 - p) * (1 - q) * a}$.`, `$f(1) = a(1 - ${p})(1 - ${q}) = ${(1 - p) * (1 - q)}a = ${(1 - p) * (1 - q) * a}$.`) },
    { ask: T('whether $f$ has a maximum or minimum point', 'sama ada $f$ mempunyai titik maksimum atau minimum'), val: (p, q, a) => T(a > 0 ? 'Minimum, since $a > 0$ (upward-opening parabola).' : 'Maximum, since $a < 0$ (downward-opening parabola).', a > 0 ? 'Minimum, kerana $a > 0$ (parabola terbuka ke atas).' : 'Maksimum, kerana $a < 0$ (parabola terbuka ke bawah).') },
    { ask: T('the larger of the two roots', 'punca yang lebih besar antara kedua-duanya'), val: (p, q) => T(`$x = ${Math.max(p, q)}$`, `$x = ${Math.max(p, q)}$`) },
    { ask: T('the distance between the two roots on the number line', 'jarak antara kedua-dua punca pada garis nombor'), val: (p, q) => T(`$${Math.abs(p - q)}$ units`, `$${Math.abs(p - q)}$ unit`) },
    { ask: T('the value of $f(-1)$', 'nilai $f(-1)$'), val: (p, q, a) => T(`$f(-1) = a(-1 - ${p})(-1 - ${q}) = ${(-1 - p) * (-1 - q)}a = ${(-1 - p) * (-1 - q) * a}$.`, `$f(-1) = a(-1 - ${p})(-1 - ${q}) = ${(-1 - p) * (-1 - q)}a = ${(-1 - p) * (-1 - q) * a}$.`) },
    { ask: T('the midpoint between the two roots on the number line', 'titik tengah antara kedua-dua punca pada garis nombor'), val: (p, q) => T(`$\\dfrac{${p} + ${q}}{2} = ${frT(fr(p + q, 2))}$`, `$\\dfrac{${p} + ${q}}{2} = ${frT(fr(p + q, 2))}$`) },
  ];
  const INTRO_R2 = [
    (ask, p, q, a) => T(`A quadratic function has roots $x = ${p}$ and $x = ${q}$, so $f(x) = a(x - ${p})(x - ${q})$ for some constant $a$. Given that $f(0) = ${a * p * q}$, state ${ask.en}.`, `Suatu fungsi kuadratik mempunyai punca $x = ${p}$ dan $x = ${q}$, jadi $f(x) = a(x - ${p})(x - ${q})$ bagi suatu pemalar $a$. Diberi $f(0) = ${a * p * q}$, nyatakan ${ask.ms}.`),
    (ask, p, q, a) => T(`$f(x) = a(x - ${p})(x - ${q})$ has roots $x = ${p}$, $x = ${q}$ and passes through $(0, ${a * p * q})$. Determine ${ask.en}.`, `$f(x) = a(x - ${p})(x - ${q})$ mempunyai punca $x = ${p}$, $x = ${q}$ dan melalui $(0, ${a * p * q})$. Tentukan ${ask.ms}.`),
    (ask, p, q, a) => T(`Roots $x = ${p}$, $x = ${q}$ and the condition $f(0) = ${a * p * q}$ define a quadratic function $f(x) = a(x - ${p})(x - ${q})$. Work out ${ask.en}.`, `Punca $x = ${p}$, $x = ${q}$ dan syarat $f(0) = ${a * p * q}$ mentakrifkan fungsi kuadratik $f(x) = a(x - ${p})(x - ${q})$. Kira ${ask.ms}.`),
    (ask, p, q, a) => T(`Suppose $f(x) = a(x - ${p})(x - ${q})$ and its graph crosses the $y$-axis at $${a * p * q}$. Calculate ${ask.en}.`, `Andaikan $f(x) = a(x - ${p})(x - ${q})$ dan grafnya memotong paksi-$y$ pada $${a * p * q}$. Hitung ${ask.ms}.`),
    (ask, p, q, a) => T(`A quadratic $f(x) = a(x - ${p})(x - ${q})$ satisfies $f(0) = ${a * p * q}$. Use this information to find ${ask.en}.`, `Suatu kuadratik $f(x) = a(x - ${p})(x - ${q})$ memenuhi $f(0) = ${a * p * q}$. Gunakan maklumat ini untuk mencari ${ask.ms}.`),
  ];
  const g13m1 = (r) => {
    const { p, q, a } = ctxPQa(r);
    const f = r.pick(FEAT_ROOT_M);
    const s = r.pick(INTRO_R2)(f.ask, p, q, a);
    return { q: s, a: f.val(p, q, a), sp: 'm' };
  };

  const g13m2 = (r) => {
    const p = r.int(2, 6), A = r.pick([12, 18, 20, 24, 30, 36, 40]);
    return { q: T(`The area of a rectangular garden is $A(x) = x^2 + ${p}x$ m², where $x$ m is its width. Form the equation for when the area is ${A} m², and write it in the form $ax^2 + bx + c = 0$.`, `Luas sebuah taman segi empat tepat ialah $A(x) = x^2 + ${p}x$ m², dengan $x$ m ialah lebarnya. Bentukkan persamaan apabila luasnya ${A} m², dan tulis dalam bentuk $ax^2 + bx + c = 0$.`), a: T(`$x^2 + ${p}x - ${A} = 0$`), sp: 's' };
  };

  const g13m3 = (r) => {
    const kind = r.pick(['two', 'one', 'none']);
    const fig = kind === 'two' ? S.plane({ x: [-5, 5], y: [-3, 6], scale: 15, labelStep: 2, curves: [{ f: (x) => (x + 2) * (x - 2) }] }) : kind === 'one' ? S.plane({ x: [-5, 5], y: [-2, 6], scale: 15, labelStep: 2, curves: [{ f: (x) => (x - 1) * (x - 1) }] }) : S.plane({ x: [-5, 5], y: [-1, 8], scale: 15, labelStep: 2, curves: [{ f: (x) => x * x + 2 }] });
    const ansEn = kind === 'two' ? 'Two real roots (the graph crosses the $x$-axis twice).' : kind === 'one' ? 'One repeated real root (the graph touches the $x$-axis at one point).' : 'No real roots (the graph does not meet the $x$-axis).';
    const ansMs = kind === 'two' ? 'Dua punca nyata (graf memotong paksi-$x$ dua kali).' : kind === 'one' ? 'Satu punca nyata berganda (graf menyentuh paksi-$x$ pada satu titik).' : 'Tiada punca nyata (graf tidak bertemu paksi-$x$).';
    return { q: T('The graph of a quadratic function is shown. How many real roots does $f(x) = 0$ have, based on the graph?', 'Graf suatu fungsi kuadratik ditunjukkan. Berapakah punca nyata yang dimiliki oleh $f(x) = 0$, berdasarkan graf itu?'), fig, a: T(ansEn, ansMs), sp: 's' };
  };
  const g13m4 = (r) => {
    const p = r.int(2, 5), q = r.int(2, 6);
    need(p !== q);
    const A = p * q;
    return { q: T(`A triangle has base $(x + ${p})$ cm and height $(x + ${q})$ cm. Form a quadratic function $A(x)$ for the area, and state the coefficient of $x^2$ in $A(x)$ expressed with integer coefficients (i.e. $2A(x)$).`, `Sebuah segi tiga mempunyai tapak $(x + ${p})$ cm dan tinggi $(x + ${q})$ cm. Bentukkan fungsi kuadratik $A(x)$ bagi luas, dan nyatakan pekali $x^2$ dalam $A(x)$ yang dinyatakan dengan pekali integer (iaitu $2A(x)$).`), a: T(`$A(x) = \\dfrac{1}{2}(x + ${p})(x + ${q}) = \\dfrac{1}{2}${Q(1, p + q, A)}$; for $2A(x) = ${Q(1, p + q, A)}$, the coefficient of $x^2$ is $1$.`, `$A(x) = \\dfrac{1}{2}(x + ${p})(x + ${q}) = \\dfrac{1}{2}${Q(1, p + q, A)}$; bagi $2A(x) = ${Q(1, p + q, A)}$, pekali $x^2$ ialah $1$.`), sp: 'm' };
  };
  const g13m5 = (r) => {
    const p = r.nz(-6, 6), q = r.nz(-6, 6);
    need(p !== q);
    const student = T(`"For $f(x) = (x - ${p})(x - ${q})$, the roots are $x = ${p}$ and $x = -${q}$."`, `"Bagi $f(x) = (x - ${p})(x - ${q})$, punca ialah $x = ${p}$ dan $x = -${q}$."`);
    return { q: T(`A student wrote: ${student.en} Identify and correct the error.`, `Seorang pelajar menulis: ${student.ms} Kenal pasti dan betulkan kesilapan itu.`), a: T(`Error: setting $x - ${q} = 0$ gives $x = ${q}$, not $x = -${q}$. Correct roots: $x = ${p}$ or $x = ${q}$.`, `Kesilapan: menetapkan $x - ${q} = 0$ memberikan $x = ${q}$, bukan $x = -${q}$. Punca yang betul: $x = ${p}$ atau $x = ${q}$.`), sp: 's' };
  };
  const g13m = [g13m1, g13m2, g13m3, g13m4, g13m5];

  const g13a1 = (r) => {
    const p = r.int(1, 5), q = r.int(-6, -1);
    const c0 = 2 * p * q;
    return { q: T(`The graph of a quadratic function $f(x)$ cuts the $x$-axis at $x = ${p}$ and $x = ${q}$, and $f(0) = ${c0}$. Find $f(x)$ in the form $ax^2 + bx + c$, and explain what the roots represent on the graph.`, `Graf fungsi kuadratik $f(x)$ memotong paksi-$x$ pada $x = ${p}$ dan $x = ${q}$, dan $f(0) = ${c0}$. Cari $f(x)$ dalam bentuk $ax^2 + bx + c$, dan terangkan apa yang diwakili oleh punca-punca itu pada graf.`), a: T(`$f(x) = a(x - ${p})(x - ${q})$ with $f(0) = ${p * q}a = ${c0}$, so $a = 2$: $f(x) = ${Q(2, -2 * (p + q), c0)}$. The roots are the $x$-values where the graph meets the $x$-axis.`, `$f(x) = a(x - ${p})(x - ${q})$ dengan $f(0) = ${p * q}a = ${c0}$, jadi $a = 2$: $f(x) = ${Q(2, -2 * (p + q), c0)}$. Punca ialah nilai $x$ di mana graf bertemu paksi-$x$.`), sp: 'm' };
  };
  const g13a2 = (r) => {
    const p = r.int(2, 6);
    return { q: T(`A student says "since $f(x) = (x - ${p})^2$ has only one factor written, it has no real roots." Explain why this reasoning is wrong, and state the actual root(s).`, `Seorang pelajar berkata "kerana $f(x) = (x - ${p})^2$ hanya mempunyai satu faktor ditulis, ia tiada punca nyata." Terangkan mengapa penaakulan ini salah, dan nyatakan punca sebenar.`), a: T(`Wrong: $(x-${p})^2 = 0$ still gives a real root, $x = ${p}$ (repeated twice), where the graph touches the $x$-axis.`, `Salah: $(x-${p})^2 = 0$ tetap memberikan punca nyata, $x = ${p}$ (berganda dua kali), di mana graf menyentuh paksi-$x$.`), sp: 'm' };
  };
  const g13a3 = (r) => {
    const p = r.nz(-5, 5), q = r.nz(-5, 5);
    need(p !== q);
    const x0 = r.nz(-5, 5);
    need(x0 !== p && x0 !== q);
    return { q: T(`$f(x) = (x - ${p})(x - ${q})$. (a) State the roots of $f(x) = 0$. (b) Is $x = ${x0}$ a root? Verify. (c) What do the roots represent on the graph of $f$?`, `$f(x) = (x - ${p})(x - ${q})$. (a) Nyatakan punca bagi $f(x) = 0$. (b) Adakah $x = ${x0}$ punca? Sahkan. (c) Apakah yang diwakili oleh punca-punca pada graf $f$?`), a: SPM.parts([T(`$x = ${p}$ or $x = ${q}$`, `$x = ${p}$ atau $x = ${q}$`), T(`No; $f(${x0}) = ${(x0 - p) * (x0 - q)} \\neq 0$.`, `Tidak; $f(${x0}) = ${(x0 - p) * (x0 - q)} \\neq 0$.`), T('They are the $x$-intercepts, where the graph meets the $x$-axis.', 'Ia ialah pintasan-$x$, di mana graf bertemu paksi-$x$.')]), sp: 'l' };
  };
  const INTRO_R3 = [
    (ask, p, q, a) => T(`Justify, without sketching, $f(x) = a(x - ${p})(x - ${q})$ with $f(0) = ${a * p * q}$: what is ${ask.en}, and how do you know?`, `Wajarkan, tanpa melakar, $f(x) = a(x - ${p})(x - ${q})$ dengan $f(0) = ${a * p * q}$: apakah ${ask.ms}, dan bagaimana anda tahu?`),
    (ask, p, q, a) => T(`A student is given only the roots $x = ${p}$, $x = ${q}$ and $f(0) = ${a * p * q}$ for $f(x) = a(x - ${p})(x - ${q})$. Explain fully how to find ${ask.en}.`, `Seorang pelajar hanya diberi punca $x = ${p}$, $x = ${q}$ dan $f(0) = ${a * p * q}$ bagi $f(x) = a(x - ${p})(x - ${q})$. Terangkan sepenuhnya cara mencari ${ask.ms}.`),
    (ask, p, q, a) => T(`Without using a calculator or sketch, reason through $f(x) = a(x - ${p})(x - ${q})$, $f(0) = ${a * p * q}$ to establish ${ask.en}. Show every step.`, `Tanpa menggunakan kalkulator atau lakaran, taakulkan $f(x) = a(x - ${p})(x - ${q})$, $f(0) = ${a * p * q}$ untuk menetapkan ${ask.ms}. Tunjukkan setiap langkah.`),
    (ask, p, q, a) => T(`Prove your answer for ${ask.en} using only the roots $x = ${p}$, $x = ${q}$ and the fact $f(0) = ${a * p * q}$ for $f(x) = a(x - ${p})(x - ${q})$.`, `Buktikan jawapan anda bagi ${ask.ms} hanya menggunakan punca $x = ${p}$, $x = ${q}$ dan hakikat $f(0) = ${a * p * q}$ bagi $f(x) = a(x - ${p})(x - ${q})$.`),
  ];
  const g13a4 = (r) => {
    const { p, q, a } = ctxPQa(r);
    const f = r.pick(FEAT_ROOT_M);
    const s = r.pick(INTRO_R3)(f.ask, p, q, a);
    return { q: s, a: f.val(p, q, a), sp: 'm' };
  };

  const g13a5 = (r) => {
    const p = r.int(1, 5), q = r.int(-6, -1), a = r.pick([1, 2, 3]);
    const A = r.int(2, 5), B = r.int(2, 6);
    return { q: T(`A quadratic function has roots $x = ${p}$ and $x = ${q}$. The graph is scaled so that $f(0) = ${a * p * q * A}$ instead of $f(0) = ${a * p * q}$ (i.e. $a$ is now $${A}$ times as large). Find the new value of $a$, and write the new $f(x)$.`, `Suatu fungsi kuadratik mempunyai punca $x = ${p}$ dan $x = ${q}$. Graf diskalakan supaya $f(0) = ${a * p * q * A}$ dan bukan $f(0) = ${a * p * q}$ (iaitu $a$ kini $${A}$ kali lebih besar). Cari nilai baharu $a$, dan tulis $f(x)$ yang baharu.`), a: T(`New $a = ${a * A}$; $f(x) = ${Q(a * A, -a * A * (p + q), a * A * p * q)}$.`, `Nilai baharu $a = ${a * A}$; $f(x) = ${Q(a * A, -a * A * (p + q), a * A * p * q)}$.`), sp: 'm' };
  };
  const g13a6 = (r) => {
    const p = r.int(2, 6), q = r.int(2, 6);
    need(p !== q);
    const A = r.pick([12, 18, 20, 24, 28, 30, 36, 40, 42]);
    return { q: T(`A rectangular plot has length $(x + ${p})$ m and width $(x - ${q})$ m, where $x > ${q}$. Form a quadratic function for the area, write it as an equation equal to ${A}, and explain why the condition $x > ${q}$ matters for interpreting any root found later.`, `Sebidang tanah segi empat tepat mempunyai panjang $(x + ${p})$ m dan lebar $(x - ${q})$ m, dengan $x > ${q}$. Bentukkan fungsi kuadratik bagi luas, tulis sebagai persamaan bersamaan ${A}, dan terangkan mengapa syarat $x > ${q}$ penting untuk mentafsir sebarang punca yang ditemui kelak.`), a: T(`$(x + ${p})(x - ${q}) = ${A}$, i.e. $${Q(1, p - q, -p * q - A)} = 0$. The condition $x > ${q}$ matters because a root that does not satisfy it (e.g. a negative or too-small root) must be rejected as physically meaningless for the width.`, `$(x + ${p})(x - ${q}) = ${A}$, iaitu $${Q(1, p - q, -p * q - A)} = 0$. Syarat $x > ${q}$ penting kerana punca yang tidak memenuhinya (cth. punca negatif atau terlalu kecil) mesti ditolak kerana tidak bermakna secara fizikal bagi lebar.`), sp: 'l' };
  };
  const g13a7 = (r) => {
    const p = r.nz(-5, 5), q = r.nz(-5, 5);
    need(p !== q);
    const fig = S.plane({ x: [-6, 6], y: [-6, 6], scale: 15, labelStep: 2, curves: [{ f: (x) => (x - p) * (x - q) }] });
    return { q: T('A graph is shown. (a) State its roots. (b) Explain, in terms of the definition of a root, why these $x$-values are roots. (c) State one $x$-value that is NOT a root, and justify using the graph.', 'Suatu graf ditunjukkan. (a) Nyatakan puncanya. (b) Terangkan, dari segi takrif punca, mengapa nilai-nilai $x$ ini adalah punca. (c) Nyatakan satu nilai $x$ yang BUKAN punca, dan wajarkan menggunakan graf.'), fig, a: SPM.parts([T(`$x = ${p}$ or $x = ${q}$`, `$x = ${p}$ atau $x = ${q}$`), T('A root is an $x$-value where $f(x) = 0$, i.e. where the graph meets the $x$-axis; both points shown lie on the $x$-axis.', 'Punca ialah nilai $x$ di mana $f(x) = 0$, iaitu di mana graf bertemu paksi-$x$; kedua-dua titik yang ditunjukkan terletak pada paksi-$x$.'), T(`Any other $x$-value, e.g. $x = 0$, is not a root since the graph does not touch the $x$-axis there (its value is $f(0) = ${p * q}$, not $0$).`, `Sebarang nilai $x$ lain, cth. $x = 0$, bukan punca kerana graf tidak menyentuh paksi-$x$ di situ (nilainya $f(0) = ${p * q}$, bukan $0$).`)]), sp: 'l' };
  };
  const g13a = [g13a1, g13a2, g13a3, g13a4, g13a5, g13a6, g13a7];

  SPM.extend('F4-1.3', { e: g13e, m: g13m, a: g13a });

  /* =============================================================== 1.4 : solving by factorisation */
  const fac1 = (v) => `(x ${v < 0 ? '-' : '+'} ${Math.abs(v)})`;
  const INTRO_SOLVE = [
    (eq) => T(`Solve $${eq} = 0$.`, `Selesaikan $${eq} = 0$.`),
    (eq) => T(`Find the roots of $${eq} = 0$.`, `Cari punca bagi $${eq} = 0$.`),
    (eq) => T(`Solve the equation $${eq} = 0$ by factorisation.`, `Selesaikan persamaan $${eq} = 0$ dengan pemfaktoran.`),
    (eq) => T(`Determine the values of $x$ that satisfy $${eq} = 0$.`, `Tentukan nilai $x$ yang memenuhi $${eq} = 0$.`),
    (eq) => T(`Factorise $${eq}$ and hence solve $${eq} = 0$.`, `Faktorkan $${eq}$ dan seterusnya selesaikan $${eq} = 0$.`),
    (eq) => T(`Find all values of $x$ for which $${eq} = 0$.`, `Cari semua nilai $x$ yang menjadikan $${eq} = 0$.`),
    (eq) => T(`Use the zero-product property to solve $${eq} = 0$.`, `Guna sifat hasil darab sifar untuk selesaikan $${eq} = 0$.`),
    (eq) => T(`What are the solutions of $${eq} = 0$?`, `Apakah penyelesaian bagi $${eq} = 0$?`),
    (eq) => T(`Calculate the roots of the quadratic equation $${eq} = 0$.`, `Hitung punca bagi persamaan kuadratik $${eq} = 0$.`),
    (eq) => T(`Work out $x$ given that $${eq} = 0$.`, `Kira $x$ diberi $${eq} = 0$.`),
  ];
  const g14e1 = (r) => {
    const p = r.nz(-8, 8), q = r.nz(-8, 8);
    need(p !== -q);
    const eq = `${fac1(p)}${fac1(q)}`;
    const s = r.pick(INTRO_SOLVE)(eq);
    return { q: s, a: T(`$x = ${-p}$ or $x = ${-q}$`, `$x = ${-p}$ atau $x = ${-q}$`), sp: 'm' };
  };
  const g14e2 = (r) => {
    const p = r.nz(-8, 8), q = r.nz(-8, 8);
    need(p !== q);
    const eq = Q(1, -(p + q), p * q);
    const s = r.pick(INTRO_SOLVE)(eq);
    return { q: s, a: T(`$x = ${p}$ or $x = ${q}$`, `$x = ${p}$ atau $x = ${q}$`), sp: 'm' };
  };
  const g14e3 = (r) => {
    const p = r.nz(-9, 9);
    const eq = `x^2 ${p < 0 ? '-' : '+'} ${Math.abs(p)}x`;
    const s = r.pick(INTRO_SOLVE)(eq);
    return { q: s, a: T(`$x = 0$ or $x = ${-p}$`, `$x = 0$ atau $x = ${-p}$`), sp: 'm' };
  };
  const g14e4 = (r) => {
    const k = r.pick([4, 9, 16, 25, 36, 49, 64, 81]);
    const eq = `x^2 - ${k}`;
    const s = r.pick(INTRO_SOLVE)(eq);
    return { q: s, a: T(`$x = ${Math.sqrt(k)}$ or $x = -${Math.sqrt(k)}$`, `$x = ${Math.sqrt(k)}$ atau $x = -${Math.sqrt(k)}$`), sp: 'm' };
  };
  const g14e5 = (r) => {
    const a = r.pick([2, 3, 4, 5]);
    const p = r.nz(-7, 7);
    const eq = `${a}x^2 ${p < 0 ? '-' : '+'} ${Math.abs(a * p)}x`;
    const s = r.pick(INTRO_SOLVE)(eq);
    return { q: s, a: T(`$x = 0$ or $x = ${-p}$`, `$x = 0$ atau $x = ${-p}$`), sp: 'm' };
  };
  const g14e6 = (r) => {
    const p = r.int(2, 9);
    const eq = `x^2 - ${p * p}`;
    return { q: T(`Solve $${eq} = 0$ and $x^2 - ${p}x = 0$.`, `Selesaikan $${eq} = 0$ dan $x^2 - ${p}x = 0$.`), a: T(`$x = \\pm ${p}$; $x = 0$ or $x = ${p}$`, `$x = \\pm ${p}$; $x = 0$ atau $x = ${p}$`), sp: 'm' };
  };
  const g14e7 = (r) => {
    const p = r.nz(-8, 8), q = r.nz(-8, 8);
    need(p !== -q);
    const eq = `${fac1(p)}${fac1(q)}`;
    const list = r.shuffle([{ s: `x = ${-p} \\text{ or } x = ${-q}`, ok: true }, { s: `x = ${p} \\text{ or } x = ${q}`, ok: false }, { s: `x = ${-p - q}`, ok: false }, { s: `x = ${p * q}`, ok: false }]);
    return { q: T(`Which option gives the correct roots of $${eq} = 0$? (A) $${list[0].s}$ (B) $${list[1].s}$ (C) $${list[2].s}$ (D) $${list[3].s}$`, `Pilihan manakah yang memberi punca betul bagi $${eq} = 0$? (A) $${list[0].s}$ (B) $${list[1].s}$ (C) $${list[2].s}$ (D) $${list[3].s}$`), a: T(`(${LET[list.findIndex((o) => o.ok)]})`), sp: 's' };
  };
  const g14e8 = (r) => {
    const p = r.nz(-8, 8), q = r.nz(-8, 8);
    need(p !== q);
    const wrongRoot = r.pick([p + 1, p - 1, q + 1, q - 1].filter((v) => v !== p && v !== q));
    const claimBoth = r.chance();
    const shown = claimBoth ? `x = ${p}$ or $x = ${wrongRoot}` : `x = ${wrongRoot}$ or $x = ${q}`;
    return { q: T(`A student solved $(x - ${p})(x - ${q}) = 0$ and got $${shown}$. Identify and correct the error.`, `Seorang pelajar menyelesaikan $(x - ${p})(x - ${q}) = 0$ dan mendapat $${shown}$. Kenal pasti dan betulkan kesilapan itu.`), a: T(`Correct roots: $x = ${p}$ or $x = ${q}$ (each factor set to $0$ gives $x - ${p} = 0 \\Rightarrow x = ${p}$, similarly for $x = ${q}$).`, `Punca yang betul: $x = ${p}$ atau $x = ${q}$ (setiap faktor ditetapkan $0$ memberi $x - ${p} = 0 \\Rightarrow x = ${p}$, begitu juga bagi $x = ${q}$).`), sp: 's' };
  };
  /* dense feature x wording crossing (mirrors the technique used for 1.1-1.3) */
  const ctxFac = (r) => { const p = r.nz(-7, 7), q = r.nz(-7, 7); need(p !== q); return { p, q }; };
  const FEAT_FAC_E = [
    { ask: T('the roots', 'punca'), val: (p, q) => T(`$x = ${p}$ or $x = ${q}$`, `$x = ${p}$ atau $x = ${q}$`) },
    { ask: T('the value of $x$ closer to zero', 'nilai $x$ yang lebih dekat dengan sifar'), val: (p, q) => T(`$x = ${Math.abs(p) < Math.abs(q) ? p : q}$`, `$x = ${Math.abs(p) < Math.abs(q) ? p : q}$`) },
    { ask: T('the sum of the two roots', 'hasil tambah kedua-dua punca'), val: (p, q) => T(`$${p + q}$`, `$${p + q}$`) },
    { ask: T('the product of the two roots', 'hasil darab kedua-dua punca'), val: (p, q) => T(`$${p * q}$`, `$${p * q}$`) },
    { ask: T('the larger root', 'punca yang lebih besar'), val: (p, q) => T(`$x = ${Math.max(p, q)}$`, `$x = ${Math.max(p, q)}$`) },
    { ask: T('the smaller root', 'punca yang lebih kecil'), val: (p, q) => T(`$x = ${Math.min(p, q)}$`, `$x = ${Math.min(p, q)}$`) },
  ];
  const INTRO_FAC_E = [
    (ask, eq) => T(`Solve $${eq} = 0$ and state ${ask.en}.`, `Selesaikan $${eq} = 0$ dan nyatakan ${ask.ms}.`),
    (ask, eq) => T(`Given $${eq} = 0$, find ${ask.en}.`, `Diberi $${eq} = 0$, cari ${ask.ms}.`),
    (ask, eq) => T(`For the equation $${eq} = 0$, work out ${ask.en}.`, `Bagi persamaan $${eq} = 0$, kira ${ask.ms}.`),
    (ask, eq) => T(`After solving $${eq} = 0$ by factorisation, determine ${ask.en}.`, `Selepas menyelesaikan $${eq} = 0$ dengan pemfaktoran, tentukan ${ask.ms}.`),
    (ask, eq) => T(`Factorise and solve $${eq} = 0$, then state ${ask.en}.`, `Faktorkan dan selesaikan $${eq} = 0$, kemudian nyatakan ${ask.ms}.`),
    (ask, eq) => T(`Solve $${eq} = 0$. Then report ${ask.en}.`, `Selesaikan $${eq} = 0$. Kemudian laporkan ${ask.ms}.`),
    (ask, eq) => T(`Look at $${eq} = 0$. Factorise it and give ${ask.en}.`, `Lihat $${eq} = 0$. Faktorkannya dan berikan ${ask.ms}.`),
  ];
  const g14e9 = (r) => {
    const { p, q } = ctxFac(r);
    const eq = Q(1, -(p + q), p * q);
    const f = r.pick(FEAT_FAC_E);
    const s = r.pick(INTRO_FAC_E)(f.ask, eq);
    return { q: s, a: f.val(p, q), sp: 'm' };
  };
  const g14e10 = (r) => {
    const { p, q } = ctxFac(r);
    const eq = `${fac1(p)}${fac1(q)}`;
    const f = r.pick(FEAT_FAC_E);
    const s = r.pick(INTRO_FAC_E)(f.ask, eq);
    return { q: s, a: f.val(-p, -q), sp: 'm' };
  };
  const g14e = [g14e1, g14e2, g14e3, g14e4, g14e5, g14e6, g14e7, g14e8, g14e9, g14e10];

  const g14m1 = (r) => {
    const u = r.pick([2, 3, 4]), p = r.int(1, 4), q = r.nz(-4, 4);
    need(gcd(u, Math.abs(q)) === 1);
    const eq = Q(u, u * q + p, p * q);
    const s = r.pick(INTRO_SOLVE)(eq);
    return { q: s, a: T(`$x = ${frT(fr(-p, u))}$ or $x = ${-q}$`, `$x = ${frT(fr(-p, u))}$ atau $x = ${-q}$`), sp: 'm' };
  };
  const g14m2 = (r) => {
    const a = r.int(1, 6), b = -r.int(1, 6);
    need(a + b !== 0);
    const bb = a + b;
    const eq = `x^2 ${bb < 0 ? '-' : '+'} ${Math.abs(bb)}x - ${-a * b}`;
    return { q: T(`Solve $x^2 ${bb < 0 ? '-' : '+'} ${Math.abs(bb)}x = ${-a * b}$.`, `Selesaikan $x^2 ${bb < 0 ? '-' : '+'} ${Math.abs(bb)}x = ${-a * b}$.`), a: T(`$x = ${-a}$ or $x = ${-b}$`, `$x = ${-a}$ atau $x = ${-b}$`), sp: 'm' };
  };
  const g14m3b = (r) => {
    const x1 = r.int(2, 9);
    const p = r.int(1, 6);
    const A = x1 * (x1 + p);
    return { q: T(`Solve $x(x + ${p}) = ${A}$.`, `Selesaikan $x(x + ${p}) = ${A}$.`), a: T(`$x = ${x1}$ or $x = ${-(x1 + p)}$`, `$x = ${x1}$ atau $x = ${-(x1 + p)}$`), sp: 'm' };
  };
  const g14m4 = (r) => {
    const p = r.int(2, 6), q = r.nz(-6, 6);
    need(p !== q);
    const c = -p * q;
    return { q: T(`Rearrange $x^2 - ${p + q}x = ${c}$ to the form $ax^2 + bx + c = 0$, then solve by factorisation.`, `Susun semula $x^2 - ${p + q}x = ${c}$ kepada bentuk $ax^2 + bx + c = 0$, kemudian selesaikan dengan pemfaktoran.`), a: T(`$x^2 - ${p + q}x - ${c} = 0$; $(x - ${p})(x - ${q}) = 0$; $x = ${p}$ or $x = ${q}$`, `$x^2 - ${p + q}x - ${c} = 0$; $(x - ${p})(x - ${q}) = 0$; $x = ${p}$ atau $x = ${q}$`), sp: 'm' };
  };
  const g14m5 = (r) => {
    const p = r.int(2, 6), q = r.nz(-6, -1);
    const eq = `${p}x^2 ${q < 0 ? '-' : '+'} ${Math.abs(p * q)}x`;
    return { q: T(`Solve $${eq} = 0$ and hence state the two $x$-intercepts of $y = ${eq}$.`, `Selesaikan $${eq} = 0$ dan seterusnya nyatakan dua pintasan-$x$ bagi $y = ${eq}$.`), a: T(`$x = 0$ or $x = ${-q}$; $x$-intercepts $(0, 0)$ and $(${-q}, 0)$`, `$x = 0$ atau $x = ${-q}$; pintasan-$x$ $(0, 0)$ dan $(${-q}, 0)$`), sp: 'm' };
  };
  const g14m6 = (r) => {
    const p = r.nz(-6, 6);
    const eq = `(x ${p < 0 ? '+' : '-'} ${Math.abs(p)})^2`;
    return { q: T(`Solve $${eq} = 0$. How many distinct roots does this equation have?`, `Selesaikan $${eq} = 0$. Berapakah punca berbeza yang dimiliki persamaan ini?`), a: T(`$x = ${p}$ (repeated); only one distinct root.`, `$x = ${p}$ (berganda); hanya satu punca berbeza.`), sp: 'm' };
  };
  const g14m7 = (r) => {
    const u = r.pick([2, 3]), v = r.pick([2, 3].filter((x) => x !== u));
    const p = r.nz(-4, 4), q = r.nz(-4, 4);
    need(gcd(u, Math.abs(p)) === 1 && gcd(v, Math.abs(q)) === 1 && !Fr.eq(fr(-p, u), fr(-q, v)));
    const A = u * v, B = u * q + v * p, C = p * q;
    const eq = Q(A, B, C);
    const s = r.pick(INTRO_SOLVE)(eq);
    return { q: s, a: T(`$x = ${frT(fr(-p, u))}$ or $x = ${frT(fr(-q, v))}$`, `$x = ${frT(fr(-p, u))}$ atau $x = ${frT(fr(-q, v))}$`), sp: 'm' };
  };
  const g14m8 = (r) => {
    const p = r.nz(-6, 6), q = r.nz(-6, 6);
    need(p !== q);
    const a = -(p + q), b = p * q;
    return { q: T(`A student factorised $x^2 ${a < 0 ? '-' : '+'} ${Math.abs(a)}x ${b < 0 ? '-' : '+'} ${Math.abs(b)} = 0$ but only set one factor to zero, getting a single root $x = ${p}$. Explain the error and give the complete solution.`, `Seorang pelajar memfaktorkan $x^2 ${a < 0 ? '-' : '+'} ${Math.abs(a)}x ${b < 0 ? '-' : '+'} ${Math.abs(b)} = 0$ tetapi hanya menetapkan satu faktor kepada sifar, mendapat satu punca $x = ${p}$. Terangkan kesilapan itu dan berikan penyelesaian lengkap.`), a: T(`Both factors must be set to zero (zero-product property); the complete solution is $x = ${p}$ or $x = ${q}$.`, `Kedua-dua faktor mesti ditetapkan sifar (sifat hasil darab sifar); penyelesaian lengkap ialah $x = ${p}$ atau $x = ${q}$.`), sp: 'm' };
  };
  const g14m9 = (r) => {
    const p = r.int(2, 6), q = r.nz(-6, 6);
    need(p !== q);
    const c = -p * q;
    return { q: T(`Solve $x^2 - ${p + q}x - ${c} = 0$, and check your answer by substituting one root back into the original equation.`, `Selesaikan $x^2 - ${p + q}x - ${c} = 0$, dan semak jawapan anda dengan menggantikan semula satu punca ke dalam persamaan asal.`), a: T(`$(x - ${p})(x - ${q}) = 0$; $x = ${p}$ or $x = ${q}$. Check: $(${p})^2 - ${p + q}(${p}) - ${c} = 0$. ✓`, `$(x - ${p})(x - ${q}) = 0$; $x = ${p}$ atau $x = ${q}$. Semak: $(${p})^2 - ${p + q}(${p}) - ${c} = 0$. ✓`), sp: 'm' };
  };
  const g14m10 = (r) => {
    const p = r.int(2, 6), q = r.nz(-6, -1);
    const dec = r.pick([0.5, 1.5, 2.5]);
    return { q: T(`Solve $x^2 ${-(p + q) < 0 ? '-' : '+'} ${Math.abs(p + q)}x ${p * q < 0 ? '-' : '+'} ${Math.abs(p * q)} = 0$, then state the difference between the two roots.`, `Selesaikan $x^2 ${-(p + q) < 0 ? '-' : '+'} ${Math.abs(p + q)}x ${p * q < 0 ? '-' : '+'} ${Math.abs(p * q)} = 0$, kemudian nyatakan beza antara kedua-dua punca.`), a: T(`$x = ${p}$ or $x = ${q}$; difference $= ${p - q}$.`, `$x = ${p}$ atau $x = ${q}$; beza $= ${p - q}$.`), sp: 'm' };
  };
  const g14m11 = (r) => {
    const p = r.int(2, 6), q = r.nz(-6, -1);
    const eq = `2x^2 ${-(2 * (p + q)) < 0 ? '-' : '+'} ${Math.abs(2 * (p + q))}x ${2 * p * q < 0 ? '-' : '+'} ${Math.abs(2 * p * q)}`;
    return { q: T(`Solve $${eq} = 0$. (Hint: take out the common factor $2$ first.)`, `Selesaikan $${eq} = 0$. (Petunjuk: keluarkan faktor sepunya $2$ dahulu.)`), a: T(`$2(x^2 ${-(p + q) < 0 ? '-' : '+'} ${Math.abs(p + q)}x ${p * q < 0 ? '-' : '+'} ${Math.abs(p * q)}) = 0 \\Rightarrow (x - ${p})(x - ${q}) = 0$; $x = ${p}$ or $x = ${q}$`, `$2(x^2 ${-(p + q) < 0 ? '-' : '+'} ${Math.abs(p + q)}x ${p * q < 0 ? '-' : '+'} ${Math.abs(p * q)}) = 0 \\Rightarrow (x - ${p})(x - ${q}) = 0$; $x = ${p}$ atau $x = ${q}$`), sp: 'm' };
  };
  const ctxFacM = (r) => { const u = r.pick([2, 3]), p = r.int(1, 4), q = r.nz(-5, 5); need(gcd(u, Math.abs(q)) === 1); return { u, p, q }; };
  const FEAT_FAC_M = [
    { ask: T('both roots', 'kedua-dua punca'), val: (u, p, q) => T(`$x = ${frT(fr(-p, u))}$ or $x = ${-q}$`, `$x = ${frT(fr(-p, u))}$ atau $x = ${-q}$`) },
    { ask: T('the integer root', 'punca integer'), val: (u, p, q) => T(`$x = ${-q}$`, `$x = ${-q}$`) },
    { ask: T('whether both roots are integers', 'sama ada kedua-dua punca ialah integer'), val: (u, p, q) => T(u === 1 ? 'Yes, both are integers.' : `No; one root is the fraction $${frT(fr(-p, u))}$.`, u === 1 ? 'Ya, kedua-duanya integer.' : `Tidak; satu punca ialah pecahan $${frT(fr(-p, u))}$.`) },
    { ask: T('the fractional root, written as an improper fraction if needed', 'punca berpecahan, ditulis sebagai pecahan tak wajar jika perlu'), val: (u, p, q) => T(`$x = ${frT(fr(-p, u))}$`, `$x = ${frT(fr(-p, u))}$`) },
    { ask: T('the product of both roots', 'hasil darab kedua-dua punca'), val: (u, p, q) => T(`$${frT(fr(-p, u))} \\times (${-q}) = ${frT(Fr.mul(fr(-p, u), fr(-q, 1)))}$`, `$${frT(fr(-p, u))} \\times (${-q}) = ${frT(Fr.mul(fr(-p, u), fr(-q, 1)))}$`) },
    { ask: T('the sum of both roots', 'hasil tambah kedua-dua punca'), val: (u, p, q) => T(`$${frT(fr(-p, u))} + (${-q}) = ${frT(Fr.add(fr(-p, u), fr(-q, 1)))}$`, `$${frT(fr(-p, u))} + (${-q}) = ${frT(Fr.add(fr(-p, u), fr(-q, 1)))}$`) },
  ];
  const INTRO_FAC_M = [
    (ask, eq) => T(`Solve $${eq} = 0$ and state ${ask.en}.`, `Selesaikan $${eq} = 0$ dan nyatakan ${ask.ms}.`),
    (ask, eq) => T(`For $${eq} = 0$, find ${ask.en}, showing your factorisation.`, `Bagi $${eq} = 0$, cari ${ask.ms}, dengan menunjukkan pemfaktoran anda.`),
    (ask, eq) => T(`Factorise $${eq}$ completely and determine ${ask.en}.`, `Faktorkan $${eq}$ sepenuhnya dan tentukan ${ask.ms}.`),
    (ask, eq) => T(`Given the equation $${eq} = 0$, work out ${ask.en}.`, `Diberi persamaan $${eq} = 0$, kira ${ask.ms}.`),
    (ask, eq) => T(`Solve the quadratic equation $${eq} = 0$, showing each factorisation step, and report ${ask.en}.`, `Selesaikan persamaan kuadratik $${eq} = 0$, dengan menunjukkan setiap langkah pemfaktoran, dan laporkan ${ask.ms}.`),
    (ask, eq) => T(`By factorisation, solve $${eq} = 0$ and identify ${ask.en}.`, `Dengan pemfaktoran, selesaikan $${eq} = 0$ dan kenal pasti ${ask.ms}.`),
    (ask, eq) => T(`Break $${eq} = 0$ into factors to solve it, and state ${ask.en}.`, `Pecahkan $${eq} = 0$ kepada faktor untuk menyelesaikannya, dan nyatakan ${ask.ms}.`),
  ];
  const g14m12 = (r) => {
    const { u, p, q } = ctxFacM(r);
    const eq = Q(u, u * q + p, p * q);
    const f = r.pick(FEAT_FAC_M);
    const s = r.pick(INTRO_FAC_M)(f.ask, eq);
    return { q: s, a: f.val(u, p, q), sp: 'm' };
  };
  const g14m = [g14m1, g14m2, g14m3b, g14m4, g14m5, g14m6, g14m7, g14m8, g14m9, g14m10, g14m11, g14m12];

  const g14a1 = (r) => {
    const a = r.int(2, 4), p = r.int(1, 3), q = r.int(1, 4);
    need(gcd(a, q) === 1);
    const b = a * q - p, c = -p * q;
    const eq = Q(a, b, c);
    const s = r.pick(INTRO_SOLVE)(eq);
    return { q: s, a: T(`$x = ${frT(fr(p, a))}$ or $x = ${-q}$`, `$x = ${frT(fr(p, a))}$ atau $x = ${-q}$`), sp: 'm' };
  };
  const g14a2 = (r) => {
    const u = r.int(2, 3), v = r.int(1, 2), p = r.nz(-4, 4), q = r.nz(-4, 4);
    const A = u * v, B = u * q + v * p, C = p * q;
    need(gcd(u, Math.abs(p)) === 1 && gcd(v, Math.abs(q)) === 1 && !Fr.eq(fr(-p, u), fr(-q, v)));
    const extra = r.int(1, 3);
    const lhs = `${A}x^2 + ${n(B + extra)}x ${C < 0 ? '-' : '+'} ${Math.abs(C)}`.replace('+ -', '- ');
    return { q: T(`Solve $${lhs} = ${extra}x$.`, `Selesaikan $${lhs} = ${extra}x$.`), a: T(`$x = ${frT(fr(-p, u))}$ or $x = ${frT(fr(-q, v))}$`, `$x = ${frT(fr(-p, u))}$ atau $x = ${frT(fr(-q, v))}$`), w: T('Move all terms to one side first, then factorise.', 'Pindahkan semua sebutan ke satu sisi dahulu, kemudian faktorkan.'), sp: 'm' };
  };
  const g14a3 = (r) => {
    const p = r.int(2, 6), q = r.nz(-6, -1);
    const A = r.int(2, 4);
    return { q: T(`Find the positive value of $x$ that satisfies $A(x - ${p})(x - ${q}) = 0$ where $A = ${A}$, then verify by substituting back into the original equation.`, `Cari nilai positif $x$ yang memenuhi $A(x - ${p})(x - ${q}) = 0$ dengan $A = ${A}$, kemudian sahkan dengan menggantikan semula ke dalam persamaan asal.`), a: T(`$x = ${p}$ (the positive root; the other root $x = ${q}$ is negative); check: $${A}(${p - p})(${p - q}) = 0$. ✓`, `$x = ${p}$ (punca positif; punca lain $x = ${q}$ adalah negatif); semak: $${A}(${p - p})(${p - q}) = 0$. ✓`), sp: 'm' };
  };
  const g14a4 = (r) => {
    const p = r.int(2, 6), q = r.nz(-6, -1);
    const c = -p * q;
    return { q: T(`A quadratic equation $x^2 + bx + c = 0$ has one root $x = ${p}$. If the other root is $x = ${q}$, form the equation and state $b$ and $c$, showing both are consistent with the zero-product property.`, `Suatu persamaan kuadratik $x^2 + bx + c = 0$ mempunyai satu punca $x = ${p}$. Jika punca yang lain ialah $x = ${q}$, bentukkan persamaan dan nyatakan $b$ dan $c$, dengan menunjukkan kedua-duanya konsisten dengan sifat hasil darab sifar.`), a: T(`$(x - ${p})(x - ${q}) = 0 \\Rightarrow x^2 ${-(p + q) < 0 ? '-' : '+'} ${Math.abs(p + q)}x ${c < 0 ? '-' : '+'} ${Math.abs(c)} = 0$; $b = ${-(p + q)}$, $c = ${c}$. Substituting $x = ${p}$ or $x = ${q}$ makes one factor $0$.`, `$(x - ${p})(x - ${q}) = 0 \\Rightarrow x^2 ${-(p + q) < 0 ? '-' : '+'} ${Math.abs(p + q)}x ${c < 0 ? '-' : '+'} ${Math.abs(c)} = 0$; $b = ${-(p + q)}$, $c = ${c}$. Menggantikan $x = ${p}$ atau $x = ${q}$ menjadikan satu faktor $0$.`), sp: 'm' };
  };
  const g14a6 = (r) => {
    const p = r.int(2, 6), q = r.nz(-6, -1);
    const k = r.int(2, 5);
    // (x-p)(x-q) = k(x - p)  =>  (x-p)(x-q-k) = 0
    const eq1 = `(x - ${p})(x - ${q})`;
    return { q: T(`Solve $${eq1} = ${k}(x - ${p})$.`, `Selesaikan $${eq1} = ${k}(x - ${p})$.`), a: T(`$(x - ${p})[(x - ${q}) - ${k}] = 0 \\Rightarrow (x - ${p})(x - ${q + k}) = 0$; $x = ${p}$ or $x = ${q + k}$`, `$(x - ${p})[(x - ${q}) - ${k}] = 0 \\Rightarrow (x - ${p})(x - ${q + k}) = 0$; $x = ${p}$ atau $x = ${q + k}$`), sp: 'm' };
  };
  const g14a7 = (r) => {
    const p = r.int(2, 6), q = r.nz(-6, -1);
    const c = -p * q;
    const bb = -(p + q);
    const wrongFactor = r.pick([[p + 1, q], [p, q + 1], [-p, q]]);
    return { q: T(`A student factorised $x^2 ${bb < 0 ? '-' : '+'} ${Math.abs(bb)}x ${c < 0 ? '-' : '+'} ${Math.abs(c)} = 0$ as $(x - ${wrongFactor[0]})(x - ${wrongFactor[1]}) = 0$. Verify by expansion whether this is correct, and give the correct factorisation if not.`, `Seorang pelajar memfaktorkan $x^2 ${bb < 0 ? '-' : '+'} ${Math.abs(bb)}x ${c < 0 ? '-' : '+'} ${Math.abs(c)} = 0$ sebagai $(x - ${wrongFactor[0]})(x - ${wrongFactor[1]}) = 0$. Sahkan melalui pengembangan sama ada ini betul, dan berikan pemfaktoran yang betul jika tidak.`), a: T(`Expanding $(x - ${wrongFactor[0]})(x - ${wrongFactor[1]})$ gives $${Q(1, -(wrongFactor[0] + wrongFactor[1]), wrongFactor[0] * wrongFactor[1])}$, which does not match. The correct factorisation is $(x - ${p})(x - ${q}) = 0$, giving $x = ${p}$ or $x = ${q}$.`, `Mengembangkan $(x - ${wrongFactor[0]})(x - ${wrongFactor[1]})$ memberikan $${Q(1, -(wrongFactor[0] + wrongFactor[1]), wrongFactor[0] * wrongFactor[1])}$, yang tidak sepadan. Pemfaktoran yang betul ialah $(x - ${p})(x - ${q}) = 0$, memberikan $x = ${p}$ atau $x = ${q}$.`), sp: 'm' };
  };
  const INTRO_FAC_A = [
    (ask, eq) => T(`Justify each step as you solve $${eq} = 0$, then report ${ask.en}.`, `Wajarkan setiap langkah semasa anda menyelesaikan $${eq} = 0$, kemudian laporkan ${ask.ms}.`),
    (ask, eq) => T(`Without a calculator, solve $${eq} = 0$ fully and explain how you find ${ask.en}.`, `Tanpa kalkulator, selesaikan $${eq} = 0$ sepenuhnya dan terangkan cara anda mencari ${ask.ms}.`),
    (ask, eq) => T(`A peer struggles to factorise $${eq} = 0$. Solve it for them and explain how to determine ${ask.en}.`, `Seorang rakan sukar memfaktorkan $${eq} = 0$. Selesaikan baginya dan terangkan cara menentukan ${ask.ms}.`),
    (ask, eq) => T(`Prove, by full factorisation of $${eq} = 0$, what ${ask.en} is.`, `Buktikan, melalui pemfaktoran penuh $${eq} = 0$, apakah ${ask.ms}.`),
    (ask, eq) => T(`Demonstrate a complete, justified solution of $${eq} = 0$, concluding with ${ask.en}.`, `Tunjukkan penyelesaian lengkap yang berwajaran bagi $${eq} = 0$, dan akhiri dengan ${ask.ms}.`),
  ];
  const g14a8 = (r) => {
    const { u, p, q } = ctxFacM(r);
    const eq = Q(u, u * q + p, p * q);
    const f = r.pick(FEAT_FAC_M);
    const s = r.pick(INTRO_FAC_A)(f.ask, eq);
    return { q: s, a: f.val(u, p, q), sp: 'm' };
  };
  const FEAT_FAC_A = [
    { ask: T('both roots, with full working', 'kedua-dua punca, berserta kerja penuh'), val: (u, p, q) => T(`$x = ${frT(fr(-p, u))}$ or $x = ${-q}$`, `$x = ${frT(fr(-p, u))}$ atau $x = ${-q}$`) },
    { ask: T('why one root is a fraction while the other is an integer (or explain if both are integers)', 'mengapa satu punca ialah pecahan sedangkan satu lagi integer (atau terangkan jika kedua-duanya integer)'), val: (u, p, q) => T(u === 1 ? 'Both are integers here, since the coefficient of $x$ in that factor is $1$.' : `The factor $(${u}x + ${p})$ has a coefficient of $x$ other than $1$, so solving it gives a fraction $x = ${frT(fr(-p, u))}$; the other factor $(x + ${q})$ has coefficient $1$, giving the integer root $x = ${-q}$.`, u === 1 ? 'Kedua-duanya integer di sini, kerana pekali $x$ dalam faktor itu ialah $1$.' : `Faktor $(${u}x + ${p})$ mempunyai pekali $x$ selain $1$, jadi menyelesaikannya memberi pecahan $x = ${frT(fr(-p, u))}$; faktor lain $(x + ${q})$ berpekali $1$, memberikan punca integer $x = ${-q}$.`) },
  ];
  const g14a9 = (r) => {
    const { u, p, q } = ctxFacM(r);
    const eq = Q(u, u * q + p, p * q);
    const f = r.pick(FEAT_FAC_A);
    const s = r.pick(INTRO_FAC_A)(f.ask, eq);
    return { q: s, a: f.val(u, p, q), sp: 'm' };
  };
  const g14a = [g14a1, g14a2, g14a3, g14a4, g14a6, g14a7, g14a8, g14a9];

  SPM.extend('F4-1.4', { e: g14e, m: g14m, a: g14a });

  /* =============================================================== 2.1 : number bases */
  const DIG10 = '0123456789';
  const toBase = (v, b) => (v === 0 ? '0' : (() => { let s = ''; while (v > 0) { s = DIG10[v % b] + s; v = Math.floor(v / b); } return s; })());
  const fromBase = (s, b) => s.split('').reduce((t, d) => t * b + +d, 0);
  const nb = (s, b) => `${s}_{${b}}`;

  const INTRO_CONV = [
    (a, b) => T(`Convert $${a}$ to a number in base ${b}.`, `Tukarkan $${a}$ kepada nombor dalam asas ${b}.`),
    (a, b) => T(`Express $${a}$ as a number in base ${b}.`, `Nyatakan $${a}$ sebagai nombor dalam asas ${b}.`),
    (a, b) => T(`Change $${a}$ to base ${b}.`, `Tukarkan $${a}$ kepada asas ${b}.`),
    (a, b) => T(`Write $${a}$ in base ${b}.`, `Tulis $${a}$ dalam asas ${b}.`),
    (a, b) => T(`What is $${a}$ written in base ${b}?`, `Apakah $${a}$ ditulis dalam asas ${b}?`),
    (a, b) => T(`Rewrite $${a}$ using base ${b}.`, `Tulis semula $${a}$ menggunakan asas ${b}.`),
    (a, b) => T(`Find the base-${b} numeral equal to $${a}$.`, `Cari angka asas-${b} yang bersamaan dengan $${a}$.`),
    (a, b) => T(`Represent $${a}$ in base ${b}.`, `Wakilkan $${a}$ dalam asas ${b}.`),
    (a, b) => T(`$${a}$ is given in base 10. Give it in base ${b}.`, `$${a}$ diberi dalam asas 10. Berikan dalam asas ${b}.`),
    (a, b) => T(`Report $${a}$ as a base-${b} numeral.`, `Laporkan $${a}$ sebagai angka asas-${b}.`),
    (a, b) => T(`Convert the base-10 value $${a}$ into base ${b}.`, `Tukarkan nilai asas-10 $${a}$ kepada asas ${b}.`),
    (a, b) => T(`Show $${a}$ using base ${b}.`, `Tunjukkan $${a}$ menggunakan asas ${b}.`),
    (a, b) => T(`Turn $${a}$ (base 10) into a base-${b} numeral.`, `Tukarkan $${a}$ (asas 10) kepada angka asas-${b}.`),
  ];
  const g21e1 = (r) => {
    const b = r.pick([2, 5, 8]), v = r.int(5, 63);
    const s = toBase(v, b);
    return { q: T(`Convert $${nb(s, b)}$ to a number in base 10.`, `Tukarkan $${nb(s, b)}$ kepada nombor dalam asas 10.`), a: T(`$${v}$`), w: T(`$${s.split('').map((d, i) => `${d} \\times ${b}^{${s.length - 1 - i}}`).join(' + ')}$`), sp: 's' };
  };
  const g21e2 = (r) => {
    const b = r.pick([2, 5, 8]), v = r.int(9, 63);
    const s = r.pick(INTRO_CONV)(v, b);
    return { q: s, a: T(`$${nb(toBase(v, b), b)}$`), sp: 's' };
  };
  const g21e3 = (r) => {
    const b = r.pick([2, 3, 4, 5, 6, 7, 8, 9]);
    const len = r.pick([3, 4]);
    const digits = Array.from({ length: len }, () => r.int(0, b - 1));
    if (digits[0] === 0) digits[0] = r.int(1, b - 1);
    const s = digits.join('');
    const pos = r.int(0, len - 1);
    const placeVal = Math.pow(b, len - 1 - pos);
    return { q: T(`In the numeral $${nb(s, b)}$, what is the place value of the digit in position ${len - pos} from the right?`, `Dalam angka $${nb(s, b)}$, apakah nilai tempat bagi digit pada kedudukan ${len - pos} dari kanan?`), a: T(`$${b}^{${len - 1 - pos}} = ${placeVal}$`), sp: 's' };
  };
  const g21e4 = (r) => {
    const b = r.pick([2, 3, 4, 5, 6, 7, 8, 9]);
    const valid = r.chance();
    const d = valid ? r.int(0, b - 1) : b + r.int(0, 3);
    return { q: T(`Is the digit $${d}$ a valid digit in base ${b}?`, `Adakah digit $${d}$ suatu digit yang sah dalam asas ${b}?`), a: valid ? T(`Yes; digits in base ${b} range from $0$ to $${b - 1}$.`, `Ya; digit dalam asas ${b} adalah dari $0$ hingga $${b - 1}$.`) : T(`No; digits in base ${b} must be less than ${b}, but $${d} \\geq ${b}$.`, `Tidak; digit dalam asas ${b} mesti kurang daripada ${b}, tetapi $${d} \\geq ${b}$.`), sp: 's' };
  };
  const g21e5 = (r) => {
    const b = r.pick([2, 5, 8]), v = r.int(5, 40);
    const good = nb(toBase(v, b), b);
    const otherBase = r.pick([2, 5, 8].filter((x) => x !== b));
    const bads = [nb(toBase(v + r.nz(1, 4), b), b), nb(toBase(v, otherBase), b)];
    const m = mcq(r, good, [bads[0], bads[1], nb(toBase(v, b).split('').reverse().join(''), b)]);
    return { q: T(`Which of the following equals $${v}$ in base ${b}? ${m.list}`, `Antara berikut, yang manakah bersamaan dengan $${v}$ dalam asas ${b}? ${m.list}`), a: T(`(${m.letter})`), sp: 's' };
  };
  const g21e6 = (r) => {
    const b = r.pick([2, 5, 8]);
    const digs = Array.from({ length: 3 }, () => r.int(0, b - 1));
    if (digs[0] === 0) digs[0] = r.int(1, b - 1);
    const s = digs.join('');
    return { q: T(`State the value of each digit's place (from left to right) in $${nb(s, b)}$.`, `Nyatakan nilai tempat bagi setiap digit (dari kiri ke kanan) dalam $${nb(s, b)}$.`), a: T(`$${b}^2 = ${b * b}$, $${b}^1 = ${b}$, $${b}^0 = 1$`), sp: 's' };
  };
  const ctxPV = (r) => {
    const b = r.pick([2, 3, 4, 5, 6, 7, 8, 9]);
    const len = r.pick([3, 4]);
    const digits = Array.from({ length: len }, () => r.int(0, b - 1));
    if (digits[0] === 0) digits[0] = r.int(1, b - 1);
    const pos = r.int(0, len - 1); // position from left
    return { b, digits, len, pos, s: digits.join('') };
  };
  const FEAT_PV = [
    { ask: T('the place value of the digit', 'nilai tempat digit itu'), val: (ctx) => T(`$${ctx.b}^{${ctx.len - 1 - ctx.pos}} = ${Math.pow(ctx.b, ctx.len - 1 - ctx.pos)}$`, `$${ctx.b}^{${ctx.len - 1 - ctx.pos}} = ${Math.pow(ctx.b, ctx.len - 1 - ctx.pos)}$`) },
    { ask: T('the digit itself', 'digit itu sendiri'), val: (ctx) => T(`$${ctx.digits[ctx.pos]}$`, `$${ctx.digits[ctx.pos]}$`) },
    { ask: T('the value contributed by the digit (digit $\\times$ place value)', 'nilai yang disumbangkan oleh digit itu (digit $\\times$ nilai tempat)'), val: (ctx) => T(`$${ctx.digits[ctx.pos]} \\times ${ctx.b}^{${ctx.len - 1 - ctx.pos}} = ${ctx.digits[ctx.pos] * Math.pow(ctx.b, ctx.len - 1 - ctx.pos)}$`, `$${ctx.digits[ctx.pos]} \\times ${ctx.b}^{${ctx.len - 1 - ctx.pos}} = ${ctx.digits[ctx.pos] * Math.pow(ctx.b, ctx.len - 1 - ctx.pos)}$`) },
    { ask: T('the exponent of the base in the place value', 'eksponen asas dalam nilai tempat'), val: (ctx) => T(`$${ctx.len - 1 - ctx.pos}$`, `$${ctx.len - 1 - ctx.pos}$`) },
    { ask: T('whether the digit is valid for this base, and why', 'sama ada digit itu sah bagi asas ini, dan mengapa'), val: (ctx) => T(`Yes; $${ctx.digits[ctx.pos]} < ${ctx.b}$, so it is a valid digit in base ${ctx.b}.`, `Ya; $${ctx.digits[ctx.pos]} < ${ctx.b}$, jadi ia digit yang sah dalam asas ${ctx.b}.`) },
    { ask: T('the total number of digits in the numeral', 'jumlah bilangan digit dalam angka itu'), val: (ctx) => T(`$${ctx.len}$`, `$${ctx.len}$`) },
    { ask: T('the digit in the units (ones) place', 'digit pada tempat sa'), val: (ctx) => T(`$${ctx.digits[ctx.len - 1]}$`, `$${ctx.digits[ctx.len - 1]}$`) },
    { ask: T('the leftmost digit and its place value', 'digit paling kiri dan nilai tempatnya'), val: (ctx) => T(`Digit $${ctx.digits[0]}$; place value $${ctx.b}^{${ctx.len - 1}} = ${Math.pow(ctx.b, ctx.len - 1)}$`, `Digit $${ctx.digits[0]}$; nilai tempat $${ctx.b}^{${ctx.len - 1}} = ${Math.pow(ctx.b, ctx.len - 1)}$`) },
    { ask: T('the largest possible digit that could appear in this base', 'digit terbesar yang mungkin muncul dalam asas ini'), val: (ctx) => T(`$${ctx.b - 1}$ (one less than the base)`, `$${ctx.b - 1}$ (satu kurang daripada asas)`) },
    { ask: T('the value of the whole numeral in base 10', 'nilai keseluruhan angka itu dalam asas 10'), val: (ctx) => T(`$${fromBase(ctx.digits.join(''), ctx.b)}$`, `$${fromBase(ctx.digits.join(''), ctx.b)}$`) },
    { ask: T('how the place value would change if the base were one more', 'bagaimana nilai tempat berubah jika asas itu satu lebih besar'), val: (ctx) => T(`It would become $${ctx.b + 1}^{${ctx.len - 1 - ctx.pos}} = ${Math.pow(ctx.b + 1, ctx.len - 1 - ctx.pos)}$ instead of $${Math.pow(ctx.b, ctx.len - 1 - ctx.pos)}$.`, `Ia akan menjadi $${ctx.b + 1}^{${ctx.len - 1 - ctx.pos}} = ${Math.pow(ctx.b + 1, ctx.len - 1 - ctx.pos)}$ dan bukan $${Math.pow(ctx.b, ctx.len - 1 - ctx.pos)}$.`) },
    { ask: T('the sum of all the place values used in this numeral (before multiplying by digits)', 'hasil tambah semua nilai tempat yang digunakan dalam angka ini (sebelum didarab dengan digit)'), val: (ctx) => { const places = Array.from({ length: ctx.len }, (_, i) => Math.pow(ctx.b, ctx.len - 1 - i)); return T(`$${places.join(' + ')} = ${places.reduce((s, v) => s + v, 0)}$`, `$${places.join(' + ')} = ${places.reduce((s, v) => s + v, 0)}$`); } },
    { ask: T('whether changing this digit to the largest valid digit would still give a valid numeral', 'sama ada menukar digit ini kepada digit sah terbesar masih memberikan angka yang sah'), val: (ctx) => T(`Yes; any digit from $0$ to $${ctx.b - 1}$ keeps the numeral valid in base ${ctx.b}.`, `Ya; sebarang digit dari $0$ hingga $${ctx.b - 1}$ mengekalkan angka itu sah dalam asas ${ctx.b}.`) },
    { ask: T('the range of possible digit values in this base', 'julat nilai digit yang mungkin dalam asas ini'), val: (ctx) => T(`$0$ to $${ctx.b - 1}$ inclusive.`, `$0$ hingga $${ctx.b - 1}$ termasuk.`) },
    { ask: T('what happens to the numeral\'s value if this digit is increased by $1$ (assuming it stays valid)', 'apakah yang berlaku kepada nilai angka itu jika digit ini ditambah $1$ (andaikan ia kekal sah)'), val: (ctx) => T(`The value increases by $${Math.pow(ctx.b, ctx.len - 1 - ctx.pos)}$ (one place value).`, `Nilai bertambah $${Math.pow(ctx.b, ctx.len - 1 - ctx.pos)}$ (satu nilai tempat).`) },
  ];
  const INTRO_PV = [
    (ask, s, b, k) => T(`In $${nb(s, b)}$, state ${ask.en} of the digit in position ${k} from the right.`, `Dalam $${nb(s, b)}$, nyatakan ${ask.ms} bagi digit pada kedudukan ${k} dari kanan.`),
    (ask, s, b, k) => T(`For the numeral $${nb(s, b)}$, find ${ask.en} of the digit that is ${k}${k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} from the right.`, `Bagi angka $${nb(s, b)}$, cari ${ask.ms} bagi digit yang ke-${k} dari kanan.`),
    (ask, s, b, k) => T(`Look at $${nb(s, b)}$: what is ${ask.en} of the digit in the position ${k} counting from the right?`, `Lihat $${nb(s, b)}$: apakah ${ask.ms} bagi digit pada kedudukan ${k} dikira dari kanan?`),
    (ask, s, b, k) => T(`Identify ${ask.en} of the digit $${k}$ places from the right in $${nb(s, b)}$.`, `Kenal pasti ${ask.ms} bagi digit $${k}$ tempat dari kanan dalam $${nb(s, b)}$.`),
    (ask, s, b, k) => T(`Consider $${nb(s, b)}$. Report ${ask.en} of the digit ${k} places from the right.`, `Pertimbangkan $${nb(s, b)}$. Laporkan ${ask.ms} bagi digit ${k} tempat dari kanan.`),
    (ask, s, b, k) => T(`Examine the digit ${k} places from the right in $${nb(s, b)}$, and state ${ask.en}.`, `Periksa digit ${k} tempat dari kanan dalam $${nb(s, b)}$, dan nyatakan ${ask.ms}.`),
  ];
  const g21e7 = (r) => {
    const ctx = ctxPV(r);
    const f = r.pick(FEAT_PV);
    const k = ctx.len - ctx.pos;
    const s = r.pick(INTRO_PV)(f.ask, ctx.s, ctx.b, k);
    return { q: s, a: f.val(ctx), sp: 's' };
  };
  const INTRO_DCOUNT = [
    (v, b) => T(`How many digits does $${v}$ have when written in base ${b}?`, `Berapa digit yang dimiliki $${v}$ apabila ditulis dalam asas ${b}?`),
    (v, b) => T(`Find the number of digits in the base-${b} representation of $${v}$.`, `Cari bilangan digit dalam perwakilan asas-${b} bagi $${v}$.`),
    (v, b) => T(`When $${v}$ is converted to base ${b}, how many digits result?`, `Apabila $${v}$ ditukar kepada asas ${b}, berapa digit yang terhasil?`),
    (v, b) => T(`State the length (number of digits) of $${v}$ once written in base ${b}.`, `Nyatakan panjang (bilangan digit) $${v}$ setelah ditulis dalam asas ${b}.`),
    (v, b) => T(`Count the digits needed to write $${v}$ in base ${b}.`, `Kira bilangan digit yang diperlukan untuk menulis $${v}$ dalam asas ${b}.`),
  ];
  const g21e8 = (r) => {
    const b = r.pick([2, 3, 4, 5, 6, 7, 8, 9]), v = r.int(5, 100);
    const s = r.pick(INTRO_DCOUNT)(v, b);
    return { q: s, a: T(`$${toBase(v, b).length}$ digits ($${nb(toBase(v, b), b)}$)`, `$${toBase(v, b).length}$ digit ($${nb(toBase(v, b), b)}$)`), sp: 's' };
  };
  const INTRO_ERR_E = [
    (v, b, wrong) => T(`A student converted $${v}$ to base ${b} and wrote $${nb(wrong, b)}$. Is this correct? If not, give the correct answer.`, `Seorang pelajar menukar $${v}$ kepada asas ${b} dan menulis $${nb(wrong, b)}$. Adakah ini betul? Jika tidak, berikan jawapan yang betul.`),
    (v, b, wrong) => T(`Check whether $${nb(wrong, b)}$ correctly represents $${v}$ in base ${b}.`, `Semak sama ada $${nb(wrong, b)}$ mewakili $${v}$ dengan betul dalam asas ${b}.`),
    (v, b, wrong) => T(`True or false: $${nb(wrong, b)}$ equals $${v}$ in base ${b}?`, `Benar atau palsu: $${nb(wrong, b)}$ bersamaan dengan $${v}$ dalam asas ${b}?`),
    (v, b, wrong) => T(`Someone claims $${v}$ written in base ${b} is $${nb(wrong, b)}$. Verify this claim.`, `Seseorang mendakwa $${v}$ ditulis dalam asas ${b} ialah $${nb(wrong, b)}$. Sahkan dakwaan ini.`),
    (v, b, wrong) => T(`Does $${nb(wrong, b)}$ (base ${b}) represent the value $${v}$?`, `Adakah $${nb(wrong, b)}$ (asas ${b}) mewakili nilai $${v}$?`),
  ];
  const g21e9 = (r) => {
    const b = r.pick([2, 5, 8]), v = r.int(9, 63);
    const correct = toBase(v, b);
    const isRight = r.chance(0.35);
    let shown = correct;
    if (!isRight) {
      const errKind = r.pick(['reverse', 'shift', 'offbyone']);
      if (errKind === 'reverse') shown = correct.split('').reverse().join('');
      else if (errKind === 'shift') shown = correct + '0';
      else shown = toBase(v + r.nz(1, 3), b);
      need(shown !== correct);
    }
    const s = r.pick(INTRO_ERR_E)(v, b, shown);
    return { q: s, a: isRight ? T(`Correct; $${nb(correct, b)}$ is indeed $${v}$ in base ${b}.`, `Betul; $${nb(correct, b)}$ memang $${v}$ dalam asas ${b}.`) : T(`Incorrect; the correct base-${b} numeral for $${v}$ is $${nb(correct, b)}$.`, `Tidak betul; angka asas-${b} yang betul bagi $${v}$ ialah $${nb(correct, b)}$.`), sp: 's' };
  };
  const g21e = [g21e1, g21e2, g21e3, g21e4, g21e5, g21e6, g21e7, g21e8, g21e9];

  const INTRO_CONV_M = [
    (a, b) => T(`Convert $${a}$ to base ${b}.`, `Tukarkan $${a}$ kepada asas ${b}.`),
    (a, b) => T(`Express the number $${a}$ in base ${b}.`, `Nyatakan nombor $${a}$ dalam asas ${b}.`),
    (a, b) => T(`Write $${a}$ as a numeral in base ${b}.`, `Tulis $${a}$ sebagai angka dalam asas ${b}.`),
    (a, b) => T(`Determine the base-${b} representation of $${a}$.`, `Tentukan perwakilan asas-${b} bagi $${a}$.`),
    (a, b) => T(`Using repeated division, convert $${a}$ to base ${b}.`, `Menggunakan pembahagian berulang, tukarkan $${a}$ kepada asas ${b}.`),
    (a, b) => T(`Find the base-${b} numeral for $${a}$, showing your working.`, `Cari angka asas-${b} bagi $${a}$, dengan menunjukkan kerja anda.`),
    (a, b) => T(`Calculate the base-${b} form of $${a}$.`, `Hitung bentuk asas-${b} bagi $${a}$.`),
    (a, b) => T(`$${a}$ (base 10) needs to be reported in base ${b}. Do the conversion.`, `$${a}$ (asas 10) perlu dilaporkan dalam asas ${b}. Lakukan penukaran itu.`),
    (a, b) => T(`Perform the conversion of $${a}$ into base ${b}, listing each division step.`, `Lakukan penukaran $${a}$ kepada asas ${b}, dengan menyenaraikan setiap langkah pembahagian.`),
    (a, b) => T(`A record shows the value $${a}$ in base 10; rewrite it in base ${b}.`, `Suatu rekod menunjukkan nilai $${a}$ dalam asas 10; tulis semula dalam asas ${b}.`),
    (a, b) => T(`Translate $${a}$ into base ${b}.`, `Terjemahkan $${a}$ kepada asas ${b}.`),
    (a, b) => T(`A teacher asks for $${a}$ to be written in base ${b}. Provide the conversion with working.`, `Seorang guru meminta $${a}$ ditulis dalam asas ${b}. Berikan penukaran itu berserta kerja.`),
    (a, b) => T(`Obtain the base-${b} numeral corresponding to $${a}$.`, `Dapatkan angka asas-${b} yang sepadan dengan $${a}$.`),
  ];
  const g21m1 = (r) => {
    const b = r.int(2, 9), v = r.int(100, 500);
    const s = r.pick(INTRO_CONV_M)(v, b);
    return { q: s, a: T(`$${nb(toBase(v, b), b)}$`), sp: 'm' };
  };
  const g21m2 = (r) => {
    const [b1, b2] = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 2);
    const v = r.int(20, 200);
    return { q: T(`Convert $${nb(toBase(v, b1), b1)}$ to base ${b2}.`, `Tukarkan $${nb(toBase(v, b1), b1)}$ kepada asas ${b2}.`), a: T(`$${nb(toBase(v, b2), b2)}$`), w: T(`Base ${b1} → base 10 ($${v}$) → base ${b2}`, `Asas ${b1} → asas 10 ($${v}$) → asas ${b2}`), sp: 'm' };
  };
  const g21m3 = (r) => {
    const base = r.pick([5, 6, 7, 8, 9]);
    const v = r.int(30, 150);
    const s = toBase(v, base);
    need(s.length >= 2);
    const pos = r.int(0, s.length - 1);
    const shown = s.slice(0, pos) + 'k' + s.slice(pos + 1);
    return { q: T(`The number $${nb(shown, base)}$ in base ${base} equals ${v} in base 10. Find the digit $k$.`, `Nombor $${nb(shown, base)}$ dalam asas ${base} sama dengan ${v} dalam asas 10. Cari digit $k$.`), a: T(`$k = ${s[pos]}$`), sp: 'm' };
  };
  const g21m4 = (r) => {
    const [b1, b2] = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 2);
    const v = r.int(30, 150);
    return { q: T(`Convert $${v}$ to base ${b1} and to base ${b2}.`, `Tukarkan $${v}$ kepada asas ${b1} dan kepada asas ${b2}.`), a: T(`$${nb(toBase(v, b1), b1)}$ and $${nb(toBase(v, b2), b2)}$`, `$${nb(toBase(v, b1), b1)}$ dan $${nb(toBase(v, b2), b2)}$`), sp: 'm' };
  };
  const g21m5 = (r) => {
    const list = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 3);
    const v = r.int(30, 150);
    const nums = list.map((b) => nb(toBase(v, b), b));
    return { q: T(`Show that $${nums[0]}$, $${nums[1]}$ and $${nums[2]}$ all represent the same value. State that value in base 10.`, `Tunjukkan bahawa $${nums[0]}$, $${nums[1]}$ dan $${nums[2]}$ semuanya mewakili nilai yang sama. Nyatakan nilai itu dalam asas 10.`), a: T(`All equal $${v}$ in base 10.`, `Semuanya bersamaan $${v}$ dalam asas 10.`), sp: 'm' };
  };
  const INTRO_ORD_M = [
    (n1, n2) => T(`Order $${n1}$ and $${n2}$ from smallest to largest.`, `Susun $${n1}$ dan $${n2}$ daripada terkecil kepada terbesar.`),
    (n1, n2) => T(`Which is smaller, $${n1}$ or $${n2}$? Write the two numerals with the correct inequality sign between them.`, `Yang manakah lebih kecil, $${n1}$ atau $${n2}$? Tulis kedua-dua angka itu dengan tanda ketaksamaan yang betul di antaranya.`),
    (n1, n2) => T(`Arrange $${n1}$ and $${n2}$ in ascending order.`, `Susun $${n1}$ dan $${n2}$ mengikut tertib menaik.`),
    (n1, n2) => T(`Place $${n1}$ and $${n2}$ on a number line in the correct relative order (state which comes first).`, `Letakkan $${n1}$ dan $${n2}$ pada garis nombor dalam tertib relatif yang betul (nyatakan yang mana datang dahulu).`),
  ];
  const g21m6 = (r) => {
    const b = r.int(2, 9), v1 = r.int(50, 300), v2 = r.int(50, 300);
    need(v1 !== v2);
    const n1 = nb(toBase(v1, b), b), n2 = nb(toBase(v2, b), b);
    const s = r.pick(INTRO_ORD_M)(n1, n2);
    return { q: s, a: T(`$${nb(toBase(Math.min(v1, v2), b), b)} < ${nb(toBase(Math.max(v1, v2), b), b)}$`), sp: 'm' };
  };
  const INTRO_ADD_M = [
    (expr, base) => T(`Calculate $${expr}$, giving the answer in base ${base}.`, `Hitung $${expr}$, dengan memberikan jawapan dalam asas ${base}.`),
    (expr, base) => T(`Find $${expr}$ in base ${base}.`, `Cari $${expr}$ dalam asas ${base}.`),
    (expr, base) => T(`Work out $${expr}$, where all numbers are in base ${base}.`, `Kira $${expr}$, dengan semua nombor dalam asas ${base}.`),
    (expr, base) => T(`Evaluate $${expr}$ (base ${base} throughout), expressing your answer in base ${base}.`, `Nilaikan $${expr}$ (asas ${base} keseluruhannya), dengan menyatakan jawapan anda dalam asas ${base}.`),
    (expr, base) => T(`Perform $${expr}$ directly in base ${base} without converting to base 10 first.`, `Lakukan $${expr}$ terus dalam asas ${base} tanpa menukar kepada asas 10 dahulu.`),
    (expr, base) => T(`Compute $${expr}$, keeping every number in base ${base}.`, `Hitung $${expr}$, dengan mengekalkan setiap nombor dalam asas ${base}.`),
    (expr, base) => T(`Determine $${expr}$, answering in base ${base}.`, `Tentukan $${expr}$, dengan menjawab dalam asas ${base}.`),
    (expr, base) => T(`Work in base ${base} throughout to find $${expr}$.`, `Bekerja dalam asas ${base} sepanjang masa untuk mencari $${expr}$.`),
  ];
  const g21m7 = (r) => {
    const base = r.pick([4, 5, 6, 7, 8]);
    const a = toBase(r.int(20, 150), base), b = toBase(r.int(20, 150), base);
    const va = fromBase(a, base), vb = fromBase(b, base);
    const expr = `${nb(a, base)} + ${nb(b, base)}`;
    const s = r.pick(INTRO_ADD_M)(expr, base);
    return { q: s, a: T(`$${nb(toBase(va + vb, base), base)}$`), sp: 'm' };
  };
  const g21m8 = (r) => {
    const base = r.pick([4, 5, 6, 7, 8]);
    const va = r.int(60, 200), vb = r.int(10, va - 10);
    const a = toBase(va, base), b = toBase(vb, base);
    const expr = `${nb(a, base)} - ${nb(b, base)}`;
    const s = r.pick(INTRO_ADD_M)(expr, base);
    return { q: s, a: T(`$${nb(toBase(va - vb, base), base)}$`), sp: 'm' };
  };
  const INTRO_PV_M = [
    (ask, s, b, k) => T(`Without converting the whole numeral, determine ${ask.en} of the digit ${k} places from the right in $${nb(s, b)}$.`, `Tanpa menukar keseluruhan angka, tentukan ${ask.ms} bagi digit ${k} tempat dari kanan dalam $${nb(s, b)}$.`),
    (ask, s, b, k) => T(`In the base-${b} numeral $${nb(s, b)}$, calculate ${ask.en} of the digit at position ${k} (counted from the right).`, `Dalam angka asas-${b} $${nb(s, b)}$, hitung ${ask.ms} bagi digit pada kedudukan ${k} (dikira dari kanan).`),
    (ask, s, b, k) => T(`Explain and compute ${ask.en} of the digit ${k} from the right in $${nb(s, b)}$.`, `Terangkan dan kira ${ask.ms} bagi digit ke-${k} dari kanan dalam $${nb(s, b)}$.`),
  ];
  const g21m9 = (r) => {
    const ctx = ctxPV(r);
    const f = r.pick(FEAT_PV);
    const k = ctx.len - ctx.pos;
    const s = r.pick(INTRO_PV_M)(f.ask, ctx.s, ctx.b, k);
    return { q: s, a: f.val(ctx), sp: 's' };
  };
  const g21m10 = (r) => {
    const items = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 3);
    const vals = items.map(() => r.int(10, 100));
    const nums = items.map((b, i) => nb(toBase(vals[i], b), b));
    const order = items.map((b, i) => ({ b, v: vals[i], s: nums[i] })).sort((x, y) => x.v - y.v);
    return { q: T(`Arrange $${nums[0]}$, $${nums[1]}$ and $${nums[2]}$ (each in a different base) in ascending order.`, `Susun $${nums[0]}$, $${nums[1]}$ dan $${nums[2]}$ (setiap satu dalam asas berlainan) mengikut tertib menaik.`), a: T(`$${order[0].s} < ${order[1].s} < ${order[2].s}$`), sp: 'm' };
  };
  const INTRO_CMPB_M = [
    (n1, n2) => T(`Compare $${n1}$ and $${n2}$. Which is larger?`, `Bandingkan $${n1}$ dan $${n2}$. Yang manakah lebih besar?`),
    (n1, n2) => T(`$${n1}$ and $${n2}$ are in different bases. Determine which represents the greater value.`, `$${n1}$ dan $${n2}$ berada dalam asas berlainan. Tentukan yang manakah mewakili nilai yang lebih besar.`),
    (n1, n2) => T(`By converting both to base 10, decide whether $${n1}$ or $${n2}$ is bigger.`, `Dengan menukar kedua-duanya kepada asas 10, putuskan sama ada $${n1}$ atau $${n2}$ lebih besar.`),
  ];
  const g21m11 = (r) => {
    const b1 = r.int(2, 9), b2 = r.pick([2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== b1));
    const v1 = r.int(20, 150);
    const v2 = r.int(20, 150);
    need(v1 !== v2);
    const n1 = nb(toBase(v1, b1), b1), n2 = nb(toBase(v2, b2), b2);
    const s = r.pick(INTRO_CMPB_M)(n1, n2);
    return { q: s, a: T(`$${nb(toBase(Math.max(v1, v2), v1 > v2 ? b1 : b2), v1 > v2 ? b1 : b2)}$ is larger (base 10 values: $${v1}$ vs $${v2}$).`, `$${nb(toBase(Math.max(v1, v2), v1 > v2 ? b1 : b2), v1 > v2 ? b1 : b2)}$ lebih besar (nilai asas 10: $${v1}$ lawan $${v2}$).`), sp: 'm' };
  };
  const g21m12 = (r) => {
    const base = r.pick([4, 5, 6, 7, 8]);
    const va = r.int(30, 150), vb = r.int(10, 60);
    const targetBase = r.pick([2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== base));
    const sum = va + vb;
    return { q: T(`Add $${nb(toBase(va, base), base)}$ and $${nb(toBase(vb, base), base)}$ (both base ${base}), then express the result in base ${targetBase}.`, `Tambahkan $${nb(toBase(va, base), base)}$ dan $${nb(toBase(vb, base), base)}$ (kedua-dua asas ${base}), kemudian nyatakan hasilnya dalam asas ${targetBase}.`), a: T(`Sum $= ${sum}$ in base 10 $= ${nb(toBase(sum, targetBase), targetBase)}$`), sp: 'm' };
  };
  const INTRO_DCOUNT_M = [
    (v, b) => T(`Without fully converting, estimate then confirm how many digits $${v}$ has in base ${b}.`, `Tanpa menukar sepenuhnya, anggarkan kemudian sahkan berapa digit yang dimiliki $${v}$ dalam asas ${b}.`),
    (v, b) => T(`Determine the number of digits in the base-${b} form of $${v}$, and explain your reasoning using powers of ${b}.`, `Tentukan bilangan digit dalam bentuk asas-${b} bagi $${v}$, dan terangkan penaakulan anda menggunakan kuasa ${b}.`),
    (v, b) => T(`Using the digit-count boundaries for base ${b}, work out how many digits $${v}$ needs in base ${b}.`, `Menggunakan sempadan bilangan digit bagi asas ${b}, kira berapa digit yang diperlukan $${v}$ dalam asas ${b}.`),
  ];
  const g21m13 = (r) => {
    const b = r.pick([2, 3, 4, 5, 6, 7, 8, 9]), v = r.int(50, 300);
    const s = r.pick(INTRO_DCOUNT_M)(v, b);
    const len = toBase(v, b).length;
    return { q: s, a: T(`$${len}$ digits, since $${b}^{${len - 1}} \\le ${v} < ${b}^{${len}}$.`, `$${len}$ digit, kerana $${b}^{${len - 1}} \\le ${v} < ${b}^{${len}}$.`), sp: 'm' };
  };
  /** column-by-column trace of a + b in the given base (least-significant digit first internally) */
  function addTrace(aStr, bStr, base) {
    const A = aStr.split('').reverse(), B = bStr.split('').reverse();
    const n = Math.max(A.length, B.length);
    let carry = 0;
    const cols = [];
    for (let i = 0; i < n; i++) {
      const da = +(A[i] || 0), db = +(B[i] || 0);
      const sum = da + db + carry;
      const digit = sum % base;
      const carryOut = Math.floor(sum / base);
      cols.push({ da, db, carryIn: carry, sum, digit, carryOut });
      carry = carryOut;
    }
    const digits = cols.map((c) => c.digit);
    if (carry > 0) digits.push(carry);
    return { result: digits.reverse().join(''), cols };
  }
  const INTRO_CARRY_M = [
    (a, b, base) => T(`Add $${nb(a, base)}$ and $${nb(b, base)}$ in base ${base}, working column by column and stating the carry produced at the units column.`, `Tambahkan $${nb(a, base)}$ dan $${nb(b, base)}$ dalam asas ${base}, dengan bekerja lajur demi lajur dan menyatakan bawaan yang terhasil pada lajur sa.`),
    (a, b, base) => T(`For $${nb(a, base)} + ${nb(b, base)}$ in base ${base}, what carry (if any) is produced when adding the units digits?`, `Bagi $${nb(a, base)} + ${nb(b, base)}$ dalam asas ${base}, apakah bawaan (jika ada) yang terhasil apabila menambah digit sa?`),
    (a, b, base) => T(`Add the units digits of $${nb(a, base)}$ and $${nb(b, base)}$ (base ${base}) and state the resulting digit and carry.`, `Tambahkan digit sa bagi $${nb(a, base)}$ dan $${nb(b, base)}$ (asas ${base}) dan nyatakan digit yang terhasil serta bawaan.`),
    (a, b, base) => T(`In base ${base}, add $${nb(a, base)}$ and $${nb(b, base)}$. Begin at the units column and state what carries into the next column.`, `Dalam asas ${base}, tambahkan $${nb(a, base)}$ dan $${nb(b, base)}$. Mula pada lajur sa dan nyatakan apa yang dibawa ke lajur seterusnya.`),
    (a, b, base) => T(`Show the units-column working for $${nb(a, base)} + ${nb(b, base)}$ in base ${base}, including the carry.`, `Tunjukkan kerja lajur sa bagi $${nb(a, base)} + ${nb(b, base)}$ dalam asas ${base}, termasuk bawaan.`),
  ];
  const g21m14 = (r) => {
    const base = r.pick([5, 6, 7, 8]);
    const da = r.int(1, base - 1), db = r.int(base - da, base - 1); // guarantee a carry out of the units column
    need(da + db >= base);
    const a = toBase(r.int(2, 5) * base + da, base), b = toBase(r.int(2, 5) * base + db, base);
    const va = fromBase(a, base), vb = fromBase(b, base);
    const unitsSum = da + db;
    const s = r.pick(INTRO_CARRY_M)(a, b, base);
    return { q: s, a: T(`Units: $${da} + ${db} = ${unitsSum} = 1 \\times ${base} + ${unitsSum - base}$, so write $${unitsSum - base}$ and carry $1$; full sum $= ${nb(toBase(va + vb, base), base)}$.`, `Sa: $${da} + ${db} = ${unitsSum} = 1 \\times ${base} + ${unitsSum - base}$, jadi tulis $${unitsSum - base}$ dan bawa $1$; jumlah penuh $= ${nb(toBase(va + vb, base), base)}$.`), sp: 'm' };
  };
  function divLadder(v, b) {
    const steps = [];
    let q = v;
    while (q > 0) {
      const rem = q % b, nq = Math.floor(q / b);
      steps.push({ dividend: q, quotient: nq, remainder: rem });
      q = nq;
    }
    return steps;
  }
  const ladderTex = (steps, base, lang) => steps.map((s) => `${s.dividend} \\div ${base} = ${s.quotient}\\ \\text{${lang === 'en' ? 'remainder' : 'baki'}}\\ ${s.remainder}`).join(',\\ ');
  const INTRO_ERR_M = [
    (base) => T(`A student's repeated-division working to convert a number to base ${base} is shown below, but one remainder is wrong.`, `Kerja pembahagian berulang seorang pelajar untuk menukar suatu nombor kepada asas ${base} ditunjukkan di bawah, tetapi satu baki adalah salah.`),
    (base) => T(`Below is a repeated-division conversion to base ${base} with exactly one error. `, `Di bawah ialah penukaran pembahagian berulang kepada asas ${base} dengan tepat satu kesilapan. `),
    (base) => T(`Examine this repeated-division conversion to base ${base}; one remainder has been recorded wrongly.`, `Periksa penukaran pembahagian berulang kepada asas ${base} ini; satu baki telah direkodkan dengan salah.`),
    (base) => T(`A worked conversion to base ${base} contains a single mistake in one of its remainders.`, `Suatu penukaran berkerja kepada asas ${base} mengandungi satu kesilapan dalam salah satu bakinya.`),
  ];
  const g21m15 = (r) => {
    const b = r.pick([2, 3, 4, 5, 6, 7, 8, 9]);
    const v = r.int(30, 150);
    const steps = divLadder(v, b);
    need(steps.length >= 2);
    const errIdx = r.int(0, steps.length - 1);
    const wrongRem = (steps[errIdx].remainder + r.int(1, b - 1)) % b;
    const shown = steps.map((s, i) => (i === errIdx ? { ...s, remainder: wrongRem } : s));
    const intro = r.pick(INTRO_ERR_M)(b);
    return { q: T(`${intro.en} $${ladderTex(shown, b, 'en')}$. Identify the incorrect step and give the correct base-${b} numeral for $${v}$.`, `${intro.ms} $${ladderTex(shown, b, 'ms')}$. Kenal pasti langkah yang salah dan berikan angka asas-${b} yang betul bagi $${v}$.`), a: T(`The step "$${steps[errIdx].dividend} \\div ${b}$" should give remainder $${steps[errIdx].remainder}$, not $${wrongRem}$; the correct numeral is $${nb(toBase(v, b), b)}$.`, `Langkah "$${steps[errIdx].dividend} \\div ${b}$" sepatutnya memberi baki $${steps[errIdx].remainder}$, bukan $${wrongRem}$; angka yang betul ialah $${nb(toBase(v, b), b)}$.`), sp: 'l' };
  };
  const g21m = [g21m1, g21m2, g21m3, g21m4, g21m5, g21m6, g21m7, g21m8, g21m9, g21m10, g21m11, g21m12, g21m13, g21m14, g21m15];

  const addBase = (a, b, base) => toBase(fromBase(a, base) + fromBase(b, base), base);
  const INTRO_ADD_A = [
    (expr, base) => T(`Calculate $${expr}$ directly in base ${base} (do not convert every step to base 10), showing every carry or borrow.`, `Hitung $${expr}$ terus dalam asas ${base} (jangan tukar setiap langkah kepada asas 10), dengan menunjukkan setiap bawaan atau pinjaman.`),
    (expr, base) => T(`Work through $${expr}$ in base ${base}, explaining each carry or borrow as it occurs.`, `Selesaikan $${expr}$ dalam asas ${base}, dengan menerangkan setiap bawaan atau pinjaman semasa ia berlaku.`),
    (expr, base) => T(`A learner is confused about carrying in base ${base}. Demonstrate the full working for $${expr}$ to clarify.`, `Seorang pelajar keliru tentang bawaan dalam asas ${base}. Tunjukkan kerja penuh bagi $${expr}$ untuk menjelaskan.`),
    (expr, base) => T(`Justify every carry or borrow as you evaluate $${expr}$ entirely within base ${base}.`, `Wajarkan setiap bawaan atau pinjaman semasa anda menilai $${expr}$ sepenuhnya dalam asas ${base}.`),
    (expr, base) => T(`Present a column-by-column solution for $${expr}$ in base ${base}, annotating any carry or borrow.`, `Kemukakan penyelesaian lajur demi lajur bagi $${expr}$ dalam asas ${base}, dengan menandakan sebarang bawaan atau pinjaman.`),
  ];
  const g21a1 = (r) => {
    const base = r.pick([5, 6, 7, 8]);
    const a = toBase(r.int(60, 300), base), b = toBase(r.int(60, 300), base);
    const add = r.chance();
    const va = fromBase(a, base), vb = fromBase(b, base);
    need(add || va > vb);
    const expr = `${nb(a, base)} ${add ? '+' : '-'} ${nb(b, base)}`;
    const s = r.pick(INTRO_ADD_A)(expr, base);
    return { q: s, a: T(`$${nb(toBase(add ? va + vb : va - vb, base), base)}$`), sp: 'm' };
  };
  const g21a2 = (r) => {
    const base = r.pick([5, 6, 7, 8, 9]);
    const v = r.int(30, 150);
    const s = toBase(v, base);
    need(s.length >= 2);
    const pos = r.int(0, s.length - 1);
    const shown = s.slice(0, pos) + 'k' + s.slice(pos + 1);
    return { q: T(`The number $${nb(shown, base)}$ in base ${base} equals ${v} in base 10. Find the digit $k$, and verify that $0 \\le k < ${base}$.`, `Nombor $${nb(shown, base)}$ dalam asas ${base} sama dengan ${v} dalam asas 10. Cari digit $k$, dan sahkan bahawa $0 \\le k < ${base}$.`), a: T(`$k = ${s[pos]}$, which satisfies $0 \\le ${s[pos]} < ${base}$.`, `$k = ${s[pos]}$, yang memenuhi $0 \\le ${s[pos]} < ${base}$.`), sp: 'm' };
  };
  const g21a3 = (r) => {
    const n = r.int(2, 9);
    const A = r.int(1, n - 1), B = r.int(0, n - 1);
    const v10 = A * n + B;
    return { q: T(`If $${nb(`${A}${B}`, 'n')} = ${v10}$ in base 10, find the base $n$.`, `Jika $${nb(`${A}${B}`, 'n')} = ${v10}$ dalam asas 10, cari asas $n$.`), a: T(`$${A}n + ${B} = ${v10} \\Rightarrow n = ${n}$`, `$${A}n + ${B} = ${v10} \\Rightarrow n = ${n}$`), w: T(`Check: $n$ must satisfy $n > ${Math.max(A, B)}$ and $n \\le 9$; $n = ${n}$ works.`, `Semak: $n$ mesti memenuhi $n > ${Math.max(A, B)}$ dan $n \\le 9$; $n = ${n}$ sah.`), sp: 'm' };
  };
  const g21a4 = (r) => {
    const A = r.int(1, 8);
    return { q: T(`Find the smallest base $n$ (with $2 \\le n \\le 9$) for which the digit ${A} is valid, and explain why bases smaller than your answer are invalid for this digit.`, `Cari asas $n$ terkecil (dengan $2 \\le n \\le 9$) yang menjadikan digit ${A} sah, dan terangkan mengapa asas lebih kecil daripada jawapan anda tidak sah bagi digit ini.`), a: T(`$n = ${A + 1}$; a base $n$ must satisfy $n > ${A}$ for digit ${A} to be valid (digits run from $0$ to $n-1$), so any $n \\le ${A}$ is invalid.`, `$n = ${A + 1}$; asas $n$ mesti memenuhi $n > ${A}$ supaya digit ${A} sah (digit dari $0$ hingga $n-1$), jadi mana-mana $n \\le ${A}$ tidak sah.`), sp: 'm' };
  };
  const INTRO_PV_A = [
    (ask, s, b, k) => T(`Justify, using place value alone (no full conversion), ${ask.en} of the digit ${k} places from the right in $${nb(s, b)}$.`, `Wajarkan, menggunakan nilai tempat sahaja (tanpa penukaran penuh), ${ask.ms} bagi digit ${k} tempat dari kanan dalam $${nb(s, b)}$.`),
    (ask, s, b, k) => T(`A student is unsure how to find ${ask.en} of the digit ${k} places from the right in $${nb(s, b)}$. Explain the method fully.`, `Seorang pelajar tidak pasti cara mencari ${ask.ms} bagi digit ${k} tempat dari kanan dalam $${nb(s, b)}$. Terangkan kaedah itu sepenuhnya.`),
    (ask, s, b, k) => T(`Prove your value for ${ask.en} of the digit ${k} places from the right in $${nb(s, b)}$, showing every step.`, `Buktikan nilai anda bagi ${ask.ms} bagi digit ${k} tempat dari kanan dalam $${nb(s, b)}$, dengan menunjukkan setiap langkah.`),
    (ask, s, b, k) => T(`Without any shortcuts, reason out ${ask.en} of the digit ${k} places from the right in $${nb(s, b)}$.`, `Tanpa sebarang jalan pintas, taakulkan ${ask.ms} bagi digit ${k} tempat dari kanan dalam $${nb(s, b)}$.`),
  ];
  const g21a5 = (r) => {
    const ctx = ctxPV(r);
    const f = r.pick(FEAT_PV);
    const k = ctx.len - ctx.pos;
    const s = r.pick(INTRO_PV_A)(f.ask, ctx.s, ctx.b, k);
    return { q: s, a: f.val(ctx), sp: 'm' };
  };
  const g21a6 = (r) => {
    const base1 = r.pick([4, 5, 6, 7]);
    const base2 = r.pick([2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== base1));
    const va = r.int(40, 200), vb = r.int(10, 80);
    need(va > vb);
    const targetBase = r.pick([2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== base1 && x !== base2));
    const diff = va - vb;
    return { q: T(`$${nb(toBase(va, base1), base1)}$ is in base ${base1} and $${nb(toBase(vb, base2), base2)}$ is in base ${base2}. Find their difference and express the answer in base ${targetBase}.`, `$${nb(toBase(va, base1), base1)}$ dalam asas ${base1} dan $${nb(toBase(vb, base2), base2)}$ dalam asas ${base2}. Cari beza kedua-duanya dan nyatakan jawapan dalam asas ${targetBase}.`), a: T(`Base 10: $${va} - ${vb} = ${diff}$; in base ${targetBase}: $${nb(toBase(diff, targetBase), targetBase)}$`, `Asas 10: $${va} - ${vb} = ${diff}$; dalam asas ${targetBase}: $${nb(toBase(diff, targetBase), targetBase)}$`), sp: 'l' };
  };
  const g21a7 = (r) => {
    const n = r.int(2, 9);
    const A = r.int(1, n - 1), B = r.int(0, n - 1), C = r.int(0, n - 1);
    const v10 = A * n * n + B * n + C;
    return { q: T(`If $${nb(`${A}${B}${C}`, 'n')} = ${v10}$ in base 10, find the base $n$, verifying that all digits are valid for your answer.`, `Jika $${nb(`${A}${B}${C}`, 'n')} = ${v10}$ dalam asas 10, cari asas $n$, dengan mengesahkan semua digit sah bagi jawapan anda.`), a: T(`$${A}n^2 + ${B}n + ${C} = ${v10} \\Rightarrow n = ${n}$; digits $${A}, ${B}, ${C}$ are all less than $${n}$, so valid.`, `$${A}n^2 + ${B}n + ${C} = ${v10} \\Rightarrow n = ${n}$; digit $${A}, ${B}, ${C}$ semuanya kurang daripada $${n}$, jadi sah.`), sp: 'l' };
  };
  const g21a8 = (r) => {
    const b = r.pick([2, 3, 4, 5, 6, 7, 8, 9]), v = r.int(50, 300);
    const len = toBase(v, b).length;
    return { q: T(`Prove, using inequalities involving powers of ${b} (without listing every value), that $${v}$ requires exactly $${len}$ digits in base ${b}.`, `Buktikan, menggunakan ketaksamaan yang melibatkan kuasa ${b} (tanpa menyenaraikan setiap nilai), bahawa $${v}$ memerlukan tepat $${len}$ digit dalam asas ${b}.`), a: T(`Since $${b}^{${len - 1}} = ${Math.pow(b, len - 1)} \\le ${v} < ${Math.pow(b, len)} = ${b}^{${len}}$, exactly $${len}$ digits are needed.`, `Oleh sebab $${b}^{${len - 1}} = ${Math.pow(b, len - 1)} \\le ${v} < ${Math.pow(b, len)} = ${b}^{${len}}$, tepat $${len}$ digit diperlukan.`), sp: 'm' };
  };
  const INTRO_CARRY_A = [
    (a, b, base) => T(`Add $${nb(a, base)}$ and $${nb(b, base)}$ entirely within base ${base}, showing the carry produced at every column (there is more than one carry here).`, `Tambahkan $${nb(a, base)}$ dan $${nb(b, base)}$ sepenuhnya dalam asas ${base}, dengan menunjukkan bawaan yang terhasil pada setiap lajur (terdapat lebih daripada satu bawaan di sini).`),
    (a, b, base) => T(`Demonstrate, column by column with every carry justified, that $${nb(a, base)} + ${nb(b, base)}$ (base ${base}) gives the stated result.`, `Tunjukkan, lajur demi lajur dengan setiap bawaan diwajarkan, bahawa $${nb(a, base)} + ${nb(b, base)}$ (asas ${base}) memberikan hasil yang dinyatakan.`),
    (a, b, base) => T(`A junior student cannot see how carries chain across three columns in base ${base}. Using $${nb(a, base)} + ${nb(b, base)}$, explain fully.`, `Seorang pelajar junior tidak dapat melihat bagaimana bawaan berantai merentasi tiga lajur dalam asas ${base}. Menggunakan $${nb(a, base)} + ${nb(b, base)}$, terangkan sepenuhnya.`),
  ];
  const g21a9 = (r) => {
    const base = r.pick([5, 6, 7, 8]);
    // build two 3-digit numerals whose addition forces a carry at every column
    let a, b;
    for (let tries = 0; tries < 50; tries++) {
      const da = [r.int(1, base - 1), r.int(0, base - 1), r.int(0, base - 1)];
      const db = [r.int(1, base - 1), r.int(0, base - 1), r.int(0, base - 1)];
      const trial = addTrace(da.join(''), db.join(''), base);
      if (trial.cols.every((c) => c.carryOut > 0)) { a = da.join(''); b = db.join(''); break; }
    }
    need(a !== undefined);
    const { result, cols } = addTrace(a, b, base);
    const colNames = ['units column', 'second column (from the right)', 'third column (from the right)'];
    const colNamesMs = ['lajur sa', 'lajur kedua (dari kanan)', 'lajur ketiga (dari kanan)'];
    const trace = cols.map((c, i) => `${colNamesMs[i]}: $${c.da} + ${c.db} + ${c.carryIn} = ${c.sum} = ${c.carryOut} \\times ${base} + ${c.digit}$`).reverse().join('; ');
    const traceEn = cols.map((c, i) => `${colNames[i]}: $${c.da} + ${c.db} + ${c.carryIn} = ${c.sum} = ${c.carryOut} \\times ${base} + ${c.digit}$`).reverse().join('; ');
    const s = r.pick(INTRO_CARRY_A)(a, b, base);
    return { q: s, a: T(`${traceEn}; result $= ${nb(result, base)}$.`, `${trace}; hasil $= ${nb(result, base)}$.`), sp: 'l' };
  };
  const INTRO_CMPB_A = [
    (n1, n2, b1, b2) => T(`$${n1}$ (base ${b1}) and $${n2}$ (base ${b2}) are given. Justify, by full conversion to base 10, which is larger.`, `$${n1}$ (asas ${b1}) dan $${n2}$ (asas ${b2}) diberikan. Wajarkan, melalui penukaran penuh kepada asas 10, yang manakah lebih besar.`),
    (n1, n2, b1, b2) => T(`A classmate guesses $${n1}$ is larger than $${n2}$ just by comparing digit strings, ignoring that the bases (${b1} and ${b2}) differ. Show why this reasoning can fail, and state the correct comparison.`, `Seorang rakan sekelas meneka $${n1}$ lebih besar daripada $${n2}$ hanya dengan membandingkan jujukan digit, tanpa mengambil kira asas (${b1} dan ${b2}) yang berbeza. Tunjukkan mengapa penaakulan ini boleh silap, dan nyatakan perbandingan yang betul.`),
  ];
  const g21a10 = (r) => {
    const b1 = r.int(2, 9), b2 = r.pick([2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== b1));
    const v1 = r.int(20, 200), v2 = r.int(20, 200);
    need(v1 !== v2);
    const n1 = nb(toBase(v1, b1), b1), n2 = nb(toBase(v2, b2), b2);
    const s = r.pick(INTRO_CMPB_A)(n1, n2, b1, b2);
    const bigger = v1 > v2 ? n1 : n2;
    return { q: s, a: T(`Converting to base 10: $${n1} = ${v1}$ and $${n2} = ${v2}$; since $${Math.max(v1, v2)} > ${Math.min(v1, v2)}$, $${bigger}$ is larger.`, `Menukar kepada asas 10: $${n1} = ${v1}$ dan $${n2} = ${v2}$; oleh sebab $${Math.max(v1, v2)} > ${Math.min(v1, v2)}$, $${bigger}$ lebih besar.`), sp: 'm' };
  };
  const g21a11 = (r) => {
    const b = r.pick([2, 3, 4, 5, 6, 7, 8, 9]);
    const v = r.int(60, 250);
    const steps = divLadder(v, b);
    need(steps.length >= 3);
    const errIdx = r.int(0, steps.length - 1);
    const wrongRem = (steps[errIdx].remainder + r.int(1, b - 1)) % b;
    need(!(errIdx === steps.length - 1 && wrongRem === 0)); // avoid a leading-zero display glitch
    const shown = steps.map((s, i) => (i === errIdx ? { ...s, remainder: wrongRem } : s));
    const wrongNumeral = toBase(v, b).split('').map((d, i, arr) => (arr.length - 1 - i === errIdx ? wrongRem : +d)).join('');
    return { q: T(`A repeated-division conversion of a number to base ${b} is shown: $${ladderTex(shown, b, 'en')}$. If this working were used as printed, state the (incorrect) numeral it would produce, then find and correct the actual error to give the true base-${b} numeral for $${v}$.`, `Penukaran pembahagian berulang bagi suatu nombor kepada asas ${b} ditunjukkan: $${ladderTex(shown, b, 'ms')}$. Jika kerja ini digunakan seperti dicetak, nyatakan angka (yang salah) yang akan dihasilkannya, kemudian cari dan betulkan kesilapan sebenar untuk memberikan angka asas-${b} yang benar bagi $${v}$.`), a: T(`As printed this suggests $${nb(wrongNumeral, b)}$, which is wrong; the error is in the step "$${steps[errIdx].dividend} \\div ${b}$" (remainder should be $${steps[errIdx].remainder}$, not $${wrongRem}$); the true numeral is $${nb(toBase(v, b), b)}$.`, `Seperti dicetak ini mencadangkan $${nb(wrongNumeral, b)}$, yang salah; kesilapan berada pada langkah "$${steps[errIdx].dividend} \\div ${b}$" (baki sepatutnya $${steps[errIdx].remainder}$, bukan $${wrongRem}$); angka sebenar ialah $${nb(toBase(v, b), b)}$.`), sp: 'l' };
  };
  const g21a = [g21a1, g21a2, g21a3, g21a4, g21a5, g21a6, g21a7, g21a8, g21a9, g21a10, g21a11];

  SPM.extend('F4-2.1', { e: g21e, m: g21m, a: g21a });

  /* =============================================================== 2.1E : base 2 <-> base 8 grouping (enrichment) */
  const INTRO_GRP = [
    (a, b) => T(`Convert $${a}$ to base 8 by grouping the binary digits in threes.`, `Tukarkan $${a}$ kepada asas 8 dengan mengumpulkan digit binari dalam kumpulan tiga.`),
    (a, b) => T(`Use 3-bit grouping to change $${a}$ to base 8.`, `Guna pengumpulan 3-bit untuk menukar $${a}$ kepada asas 8.`),
    (a, b) => T(`Group the digits of $${a}$ in threes (from the right) to find its base-8 form.`, `Kumpulkan digit $${a}$ dalam tiga-tiga (dari kanan) untuk mencari bentuk asas-8nya.`),
    (a, b) => T(`Shortcut: convert $${a}$ to base 8 using binary triples.`, `Jalan pintas: tukarkan $${a}$ kepada asas 8 menggunakan tiga-tiga binari.`),
    (a, b) => T(`Change $${a}$ to base 8 using the 3-bit grouping shortcut.`, `Tukarkan $${a}$ kepada asas 8 menggunakan jalan pintas pengumpulan 3-bit.`),
    (a, b) => T(`Apply 3-bit grouping to $${a}$ to find its base-8 equivalent.`, `Guna pengumpulan 3-bit pada $${a}$ untuk mencari bentuk setara asas-8nya.`),
    (a, b) => T(`Find the base-8 form of $${a}$ by grouping its bits in threes from the right.`, `Cari bentuk asas-8 bagi $${a}$ dengan mengumpulkan bitnya dalam tiga-tiga dari kanan.`),
    (a, b) => T(`Without repeated division, convert $${a}$ to base 8 (use 3-bit grouping).`, `Tanpa pembahagian berulang, tukarkan $${a}$ kepada asas 8 (guna pengumpulan 3-bit).`),
    (a, b) => T(`Regroup the bits of $${a}$ in threes to write it in base 8.`, `Kumpulkan semula bit $${a}$ dalam tiga-tiga untuk menuliskannya dalam asas 8.`),
    (a, b) => T(`Translate $${a}$ into base 8 using the bit-grouping method.`, `Terjemahkan $${a}$ kepada asas 8 menggunakan kaedah pengumpulan bit.`),
    (a, b) => T(`Pad $${a}$ with leading zeros if needed, then group into base 8.`, `Tambah sifar pendahulu pada $${a}$ jika perlu, kemudian kumpulkan kepada asas 8.`),
  ];
  const g21Ee1 = (r) => {
    const v = r.int(8, 63);
    const b2 = toBase(v, 2);
    const pad = b2.padStart(Math.ceil(b2.length / 3) * 3, '0');
    const oct = toBase(v, 8);
    const s = r.pick(INTRO_GRP)(nb(b2, 2));
    return { q: s, a: T(`$${pad.match(/.{3}/g).join('\\ ')}$ gives $${nb(oct, 8)}$`), sp: 'm' };
  };
  const INTRO_GRP2 = [
    (a) => T(`Convert $${a}$ to base 2 by writing each octal digit as a 3-bit binary group.`, `Tukarkan $${a}$ kepada asas 2 dengan menulis setiap digit oktal sebagai kumpulan binari 3-bit.`),
    (a) => T(`Use 3-bit grouping to change $${a}$ to base 2.`, `Guna pengumpulan 3-bit untuk menukar $${a}$ kepada asas 2.`),
    (a) => T(`Expand each digit of $${a}$ into its 3-bit binary form to find the base-2 equivalent.`, `Kembangkan setiap digit $${a}$ kepada bentuk binari 3-bitnya untuk mencari bentuk setara asas-2.`),
    (a) => T(`Find the base-2 form of $${a}$ using the octal-to-binary shortcut.`, `Cari bentuk asas-2 bagi $${a}$ menggunakan jalan pintas oktal-ke-binari.`),
    (a) => T(`Change $${a}$ to base 2 without repeated multiplication (use 3-bit groups).`, `Tukarkan $${a}$ kepada asas 2 tanpa pendaraban berulang (guna kumpulan 3-bit).`),
    (a) => T(`Apply the octal-to-binary shortcut to $${a}$.`, `Guna jalan pintas oktal-ke-binari pada $${a}$.`),
    (a) => T(`Break $${a}$ into its individual octal digits and expand each into binary.`, `Pecahkan $${a}$ kepada digit oktal individunya dan kembangkan setiap satu kepada binari.`),
    (a) => T(`Rewrite $${a}$ in base 2 using 3-bit groups for each digit.`, `Tulis semula $${a}$ dalam asas 2 menggunakan kumpulan 3-bit bagi setiap digit.`),
  ];
  const g21Ee2 = (r) => {
    const v = r.int(8, 63);
    const oct = toBase(v, 8);
    const b2 = toBase(v, 2).padStart(oct.length * 3, '0');
    const s = r.pick(INTRO_GRP2)(nb(oct, 8));
    return { q: s, a: T(`$${oct.split('').map((d) => (+d).toString(2).padStart(3, '0')).join('\\ ')}$ gives $${nb(b2.replace(/^0+(?=\d)/, ''), 2)}$`), sp: 'm' };
  };
  const INTRO_VER = [
    (v) => T(`Verify that converting $${v}$ (base 10) to base 8 directly gives the same result as converting it to base 2 first, then grouping into base 8.`, `Sahkan bahawa menukar $${v}$ (asas 10) kepada asas 8 secara terus memberikan hasil yang sama seperti menukarnya kepada asas 2 dahulu, kemudian mengumpulkannya kepada asas 8.`),
    (v) => T(`Show that direct repeated division and the 3-bit grouping shortcut give the same base-8 result for $${v}$.`, `Tunjukkan bahawa pembahagian berulang terus dan jalan pintas pengumpulan 3-bit memberikan hasil asas-8 yang sama bagi $${v}$.`),
    (v) => T(`Compare two methods of converting $${v}$ to base 8: repeated division, and binary grouping. Do they agree?`, `Bandingkan dua kaedah menukar $${v}$ kepada asas 8: pembahagian berulang, dan pengumpulan binari. Adakah kedua-duanya bersetuju?`),
    (v) => T(`A classmate insists binary grouping only works "sometimes". Use $${v}$ to show it always agrees with repeated division.`, `Seorang rakan sekelas mendesak pengumpulan binari hanya berfungsi "kadangkala". Guna $${v}$ untuk menunjukkan ia sentiasa bersetuju dengan pembahagian berulang.`),
  ];
  const g21Ee3 = (r) => {
    const v = r.int(8, 63);
    const s = r.pick(INTRO_VER)(v);
    return { q: s, a: T(`Both methods give $${nb(toBase(v, 8), 8)}$.`), sp: 'm' };
  };
  const INTRO_ERRGRP = [
    (oct, wrong) => T(`A student converted $${oct}$ to binary and got $${wrong}$. Identify the error and give the correct binary grouping.`, `Seorang pelajar menukar $${oct}$ kepada binari dan mendapat $${wrong}$. Kenal pasti kesilapan itu dan berikan pengumpulan binari yang betul.`),
    (oct, wrong) => T(`Checking a peer's work, you see $${oct}$ converted to $${wrong}$ in binary. Find the mistake and correct it.`, `Menyemak kerja rakan, anda lihat $${oct}$ ditukar kepada $${wrong}$ dalam binari. Cari kesilapan itu dan betulkannya.`),
    (oct, wrong) => T(`One 3-bit group is wrong in this conversion of $${oct}$ to binary: $${wrong}$. Which group, and what should it be?`, `Satu kumpulan 3-bit adalah salah dalam penukaran $${oct}$ kepada binari ini: $${wrong}$. Kumpulan yang mana, dan apakah yang sepatutnya?`),
  ];
  const g21Ee4 = (r) => {
    const oct1 = r.int(1, 7), oct2 = r.int(0, 7), oct3 = r.int(0, 7);
    const octStr = `${oct1}${oct2}${oct3}`;
    const v = fromBase(octStr, 8);
    const groups = octStr.split('').map((d) => (+d).toString(2).padStart(3, '0'));
    const wrongPos = r.int(0, 2);
    const wrongGroups = groups.slice();
    wrongGroups[wrongPos] = wrongGroups[wrongPos].split('').reverse().join('');
    need(wrongGroups[wrongPos] !== groups[wrongPos]);
    const s = r.pick(INTRO_ERRGRP)(nb(octStr, 8), wrongGroups.join('\\ '));
    return { q: s, a: T(`One group of 3 bits was written incorrectly. The correct grouping is $${groups.join('\\ ')}$, giving $${nb(groups.join('').replace(/^0+(?=\d)/, ''), 2)}$.`, `Satu kumpulan 3 bit ditulis dengan salah. Pengumpulan yang betul ialah $${groups.join('\\ ')}$, memberikan $${nb(groups.join('').replace(/^0+(?=\d)/, ''), 2)}$.`), sp: 'm' };
  };
  const INTRO_MCQGRP = [
    (n, list) => T(`Which is the correct base-8 equivalent of $${n}$? ${list}`, `Yang manakah bentuk setara asas-8 yang betul bagi $${n}$? ${list}`),
    (n, list) => T(`Select the correct octal grouping of $${n}$. ${list}`, `Pilih pengumpulan oktal yang betul bagi $${n}$. ${list}`),
    (n, list) => T(`Only one option correctly converts $${n}$ to base 8. Which one? ${list}`, `Hanya satu pilihan menukar $${n}$ kepada asas 8 dengan betul. Yang manakah? ${list}`),
  ];
  const g21Ee5 = (r) => {
    const v = r.int(8, 63);
    const b2 = toBase(v, 2);
    const good = nb(toBase(v, 8), 8);
    const wrongGroup = (() => { const pad = b2.padStart(Math.ceil(b2.length / 3) * 3, '0'); const bad = pad.split('').reverse().join(''); const badPad = bad.padStart(Math.ceil(bad.length / 3) * 3, '0'); return badPad.match(/.{3}/g).map((g) => parseInt(g, 2)).join(''); })();
    const bads = [nb(wrongGroup, 8), nb(toBase(v + 1, 8), 8), nb(toBase(v, 8).split('').reverse().join(''), 8)];
    const m = mcq(r, good, bads);
    const s = r.pick(INTRO_MCQGRP)(nb(b2, 2), m.list);
    return { q: s, a: T(`(${m.letter})`), sp: 'm' };
  };
  const g21Ee6 = (r) => {
    const v = r.int(8, 63);
    const b2 = toBase(v, 2);
    const groups = Math.ceil(b2.length / 3);
    return { q: T(`How many groups of 3 bits are needed to convert $${nb(b2, 2)}$ to base 8?`, `Berapa kumpulan 3-bit diperlukan untuk menukar $${nb(b2, 2)}$ kepada asas 8?`), a: T(`$${groups}$ group(s) (pad with leading zeros if needed to make the length a multiple of $3$).`, `$${groups}$ kumpulan (tambah sifar pendahulu jika perlu supaya panjangnya gandaan $3$).`), sp: 's' };
  };
  const g21Ee7 = (r) => {
    const v = r.int(8, 63);
    const oct = toBase(v, 8);
    return { q: T(`How many binary digits (bits) does the base-8 numeral $${nb(oct, 8)}$ expand to when converted to base 2 using 3-bit grouping (before removing leading zeros)?`, `Berapa digit binari (bit) yang terhasil apabila angka asas-8 $${nb(oct, 8)}$ ditukar kepada asas 2 menggunakan pengumpulan 3-bit (sebelum sifar pendahulu dibuang)?`), a: T(`$${oct.length * 3}$ bits ($${oct.length}$ octal digits $\\times$ $3$ bits each).`), sp: 's' };
  };
  const INTRO_ERRLEFT = [
    (n, wrong) => T(`A student grouped the bits of $${n}$ into threes starting from the LEFT, getting $${wrong}$. Explain why this is wrong and give the correct grouping.`, `Seorang pelajar mengumpulkan bit $${n}$ dalam tiga-tiga bermula dari KIRI, mendapat $${wrong}$. Terangkan mengapa ini salah dan berikan pengumpulan yang betul.`),
    (n, wrong) => T(`Grouping from the left, a student got $${wrong}$ for $${n}$. Why is this approach unreliable, and what is the correct grouping?`, `Dengan mengumpulkan dari kiri, seorang pelajar mendapat $${wrong}$ bagi $${n}$. Mengapa pendekatan ini tidak boleh dipercayai, dan apakah pengumpulan yang betul?`),
  ];
  const g21Ee8 = (r) => {
    const v = r.int(8, 63);
    const b2 = toBase(v, 2);
    need(b2.length % 3 !== 0);
    const pad = b2.padStart(Math.ceil(b2.length / 3) * 3, '0');
    const correctGroups = pad.match(/.{3}/g).join('\\ ');
    const wrongFromLeft = b2.padEnd(Math.ceil(b2.length / 3) * 3, '0').match(/.{3}/g).join('\\ ');
    const s = r.pick(INTRO_ERRLEFT)(nb(b2, 2), wrongFromLeft);
    return { q: s, a: T(`Grouping must start from the right (the ones place); padding zeros go on the left. The correct grouping is $${correctGroups}$, giving $${nb(toBase(v, 8), 8)}$.`, `Pengumpulan mesti bermula dari kanan (tempat sa); sifar tambahan diletak di kiri. Pengumpulan yang betul ialah $${correctGroups}$, memberikan $${nb(toBase(v, 8), 8)}$.`), sp: 'm' };
  };
  /* dense feature x wording crossing over a shared grouping context (mirrors the technique used for F4-2.1) */
  const ctxGRP = (r) => {
    const v = r.int(8, 63);
    const b2 = toBase(v, 2);
    const oct = toBase(v, 8);
    const pad = b2.padStart(Math.ceil(b2.length / 3) * 3, '0');
    const groups = pad.match(/.{3}/g);
    return { v, b2, oct, pad, zerosAdded: pad.length - b2.length, groups };
  };
  const FEAT_GRP = [
    { ask: T('the base-8 equivalent found using grouping', 'bentuk setara asas-8 yang ditemui menggunakan pengumpulan'), val: (c) => T(`$${nb(c.oct, 8)}$`, `$${nb(c.oct, 8)}$`) },
    { ask: T('how many leading zeros must be added before grouping', 'berapa sifar pendahulu perlu ditambah sebelum pengumpulan'), val: (c) => T(`$${c.zerosAdded}$`, `$${c.zerosAdded}$`) },
    { ask: T('how many groups of 3 bits result', 'berapa kumpulan 3-bit terhasil'), val: (c) => T(`$${c.groups.length}$`, `$${c.groups.length}$`) },
    { ask: T('the first (leftmost) group of 3 bits and the octal digit it gives', 'kumpulan 3-bit pertama (paling kiri) dan digit oktal yang diberikannya'), val: (c) => T(`$${c.groups[0]}$, giving octal digit $${parseInt(c.groups[0], 2)}$.`, `$${c.groups[0]}$, memberikan digit oktal $${parseInt(c.groups[0], 2)}$.`) },
    { ask: T('the last (rightmost) group of 3 bits and the octal digit it gives', 'kumpulan 3-bit terakhir (paling kanan) dan digit oktal yang diberikannya'), val: (c) => T(`$${c.groups[c.groups.length - 1]}$, giving octal digit $${parseInt(c.groups[c.groups.length - 1], 2)}$.`, `$${c.groups[c.groups.length - 1]}$, memberikan digit oktal $${parseInt(c.groups[c.groups.length - 1], 2)}$.`) },
    { ask: T('the number of bits in the original (unpadded) binary numeral', 'bilangan bit dalam angka binari asal (tanpa tambahan)'), val: (c) => T(`$${c.b2.length}$`, `$${c.b2.length}$`) },
    { ask: T('the number of octal digits in the final answer', 'bilangan digit oktal dalam jawapan akhir'), val: (c) => T(`$${c.oct.length}$`, `$${c.oct.length}$`) },
    { ask: T('the middle group of 3 bits, if there is one', 'kumpulan 3-bit di tengah, jika ada'), val: (c) => (c.groups.length >= 3 ? T(`$${c.groups[1]}$, giving octal digit $${parseInt(c.groups[1], 2)}$.`, `$${c.groups[1]}$, memberikan digit oktal $${parseInt(c.groups[1], 2)}$.`) : T('There is no middle group; only two groups are formed.', 'Tiada kumpulan tengah; hanya dua kumpulan terbentuk.')) },
    { ask: T('the base-10 value being converted', 'nilai asas-10 yang ditukar'), val: (c) => T(`$${c.v}$`, `$${c.v}$`) },
    { ask: T('the padded binary numeral (with leading zeros added so its length is a multiple of $3$)', 'angka binari yang ditambah (dengan sifar pendahulu supaya panjangnya gandaan $3$)'), val: (c) => T(`$${c.pad}$`, `$${c.pad}$`) },
    { ask: T('whether adding the leading zeros changes the value represented', 'sama ada penambahan sifar pendahulu mengubah nilai yang diwakili'), val: () => T('No; leading zeros never change a numeral\'s value, in any base.', 'Tidak; sifar pendahulu tidak pernah mengubah nilai sesuatu angka, dalam sebarang asas.') },
  ];
  const INTRO_GRPF = [
    (ask, b2) => T(`For $${nb(b2, 2)}$, state ${ask.en}.`, `Bagi $${nb(b2, 2)}$, nyatakan ${ask.ms}.`),
    (ask, b2) => T(`Converting $${nb(b2, 2)}$ to base 8 by grouping, find ${ask.en}.`, `Menukar $${nb(b2, 2)}$ kepada asas 8 dengan pengumpulan, cari ${ask.ms}.`),
    (ask, b2) => T(`Using 3-bit grouping on $${nb(b2, 2)}$, determine ${ask.en}.`, `Menggunakan pengumpulan 3-bit pada $${nb(b2, 2)}$, tentukan ${ask.ms}.`),
    (ask, b2) => T(`Given $${nb(b2, 2)}$, report ${ask.en}.`, `Diberi $${nb(b2, 2)}$, laporkan ${ask.ms}.`),
    (ask, b2) => T(`Work with $${nb(b2, 2)}$ to find ${ask.en}.`, `Bekerja dengan $${nb(b2, 2)}$ untuk mencari ${ask.ms}.`),
    (ask, b2) => T(`Examine $${nb(b2, 2)}$ carefully and state ${ask.en}.`, `Periksa $${nb(b2, 2)}$ dengan teliti dan nyatakan ${ask.ms}.`),
    (ask, b2) => T(`Looking at $${nb(b2, 2)}$, identify ${ask.en}.`, `Melihat $${nb(b2, 2)}$, kenal pasti ${ask.ms}.`),
    (ask, b2) => T(`Inspect $${nb(b2, 2)}$ and write down ${ask.en}.`, `Periksa $${nb(b2, 2)}$ dan tuliskan ${ask.ms}.`),
  ];
  const g21Ee9 = (r) => {
    const c = ctxGRP(r);
    const f = r.pick(FEAT_GRP);
    const s = r.pick(INTRO_GRPF)(f.ask, c.b2);
    return { q: s, a: f.val(c), sp: 's' };
  };

  const INTRO_DIG1 = [
    (d) => T(`What 3-bit binary group represents the single octal digit $${d}$?`, `Kumpulan binari 3-bit manakah yang mewakili digit oktal tunggal $${d}$?`),
    (d) => T(`Write the octal digit $${d}$ as a 3-bit binary group.`, `Tulis digit oktal $${d}$ sebagai kumpulan binari 3-bit.`),
    (d) => T(`Convert the octal digit $${d}$ to its 3-bit binary form.`, `Tukarkan digit oktal $${d}$ kepada bentuk binari 3-bitnya.`),
    (d) => T(`Expand the octal digit $${d}$ into 3 binary digits.`, `Kembangkan digit oktal $${d}$ kepada 3 digit binari.`),
    (d) => T(`Give the 3-bit binary code for the octal digit $${d}$.`, `Berikan kod binari 3-bit bagi digit oktal $${d}$.`),
  ];
  const g21Ee10 = (r) => {
    const d = r.int(0, 7);
    const s = r.pick(INTRO_DIG1)(d);
    return { q: s, a: T(`$${d.toString(2).padStart(3, '0')}$`), sp: 'xs' };
  };
  const INTRO_DIG2 = [
    (grp) => T(`What octal digit does the 3-bit binary group $${grp}$ represent?`, `Digit oktal manakah yang diwakili oleh kumpulan binari 3-bit $${grp}$?`),
    (grp) => T(`Convert the 3-bit group $${grp}$ to its octal digit.`, `Tukarkan kumpulan 3-bit $${grp}$ kepada digit oktalnya.`),
    (grp) => T(`Find the single octal digit equal to the binary group $${grp}$.`, `Cari digit oktal tunggal yang bersamaan dengan kumpulan binari $${grp}$.`),
    (grp) => T(`Simplify the 3-bit group $${grp}$ to one octal digit.`, `Permudahkan kumpulan 3-bit $${grp}$ kepada satu digit oktal.`),
    (grp) => T(`What single digit in base 8 corresponds to $${grp}$ in base 2?`, `Digit tunggal manakah dalam asas 8 yang sepadan dengan $${grp}$ dalam asas 2?`),
  ];
  const g21Ee11 = (r) => {
    const d = r.int(0, 7);
    const grp = d.toString(2).padStart(3, '0');
    const s = r.pick(INTRO_DIG2)(grp);
    return { q: s, a: T(`$${d}$`), sp: 'xs' };
  };

  /* real-world grouping contexts (same skill, applied framing) */
  const CTXTECH = [
    T('A programmer wants to display a stored binary value more compactly in octal', 'Seorang pengaturcara ingin memaparkan nilai binari yang disimpan dengan lebih ringkas dalam asas 8'),
    T('A digital circuit\'s output register holds a binary reading that a technician needs to log in octal', 'Daftar output litar digit menyimpan bacaan binari yang perlu dilog oleh seorang juruteknik dalam asas 8'),
    T('An early computer\'s memory dump is traditionally shown in octal for readability', 'Cetakan memori komputer awal secara tradisi dipaparkan dalam asas 8 untuk kebolehbacaan'),
    T('A network log records a flag value in binary that must be converted to octal for a compact report', 'Log rangkaian merekodkan nilai bendera dalam binari yang perlu ditukar kepada asas 8 untuk laporan ringkas'),
    T('A robotics team codes sensor states in binary but their control panel only displays octal', 'Sebuah pasukan robotik mengekod keadaan penderia dalam binari tetapi panel kawalan mereka hanya memaparkan asas 8'),
    T('An operating system permission setting is stored in binary internally but shown to users in octal', 'Tetapan kebenaran sistem pengendalian disimpan dalam binari secara dalaman tetapi ditunjukkan kepada pengguna dalam asas 8'),
    T('A telecommunications engineer needs to compress a long binary code into a shorter octal label', 'Seorang jurutera telekomunikasi perlu memampatkan kod binari yang panjang kepada label asas 8 yang lebih ringkas'),
  ];
  const g21Ee12 = (r) => {
    const v = r.int(8, 63);
    const b2 = toBase(v, 2);
    const ctx = r.pick(CTXTECH);
    const pad = b2.padStart(Math.ceil(b2.length / 3) * 3, '0');
    return { q: T(`${ctx.en}. The binary value is $${nb(b2, 2)}$. Convert it to base 8 using 3-bit grouping.`, `${ctx.ms}. Nilai binari itu ialah $${nb(b2, 2)}$. Tukarkan kepada asas 8 menggunakan pengumpulan 3-bit.`), a: T(`$${pad.match(/.{3}/g).join('\\ ')}$ gives $${nb(toBase(v, 8), 8)}$.`, `$${pad.match(/.{3}/g).join('\\ ')}$ memberikan $${nb(toBase(v, 8), 8)}$.`), sp: 'm' };
  };
  const g21Ee13 = (r) => {
    const v = r.int(8, 63);
    const oct = toBase(v, 8);
    const ctx = r.pick(CTXTECH);
    return { q: T(`${ctx.en}. This time the octal reading $${nb(oct, 8)}$ needs to be expanded back to binary for the raw circuit signal. Perform the conversion.`, `${ctx.ms}. Kali ini bacaan oktal $${nb(oct, 8)}$ perlu dikembangkan semula kepada binari untuk isyarat litar mentah. Lakukan penukaran itu.`), a: T(`$${oct.split('').map((d) => (+d).toString(2).padStart(3, '0')).join('\\ ')}$ gives $${nb(toBase(v, 2), 2)}$.`, `$${oct.split('').map((d) => (+d).toString(2).padStart(3, '0')).join('\\ ')}$ memberikan $${nb(toBase(v, 2), 2)}$.`), sp: 'm' };
  };

  const g21E = [g21Ee1, g21Ee2, g21Ee3, g21Ee4, g21Ee5, g21Ee6, g21Ee7, g21Ee8, g21Ee9, g21Ee10, g21Ee11, g21Ee12, g21Ee13];
  SPM.extend('F4-2.1E', { e: g21E, m: g21E, a: g21E });

  /* =============================================================== 1.6 : problems involving quadratic equations */
  const CTXOBJ = [T('a garden', 'sebuah taman'), T('a photo frame', 'sebuah bingkai gambar'), T('a piece of cardboard', 'sekeping kadbod'), T('a banner', 'sebuah sepanduk'), T('a field', 'sebuah padang'), T('a notice board', 'sebuah papan kenyataan'), T('a table top', 'sebuah permukaan meja'), T('a carpet', 'sebuah permaidani'), T('a swimming pool', 'sebuah kolam renang'), T('a parking lot', 'sebuah tempat letak kereta'), T('a vegetable plot', 'sebuah petak sayur'), T('a stage', 'sebuah pentas'), T('a mural', 'sebuah mural'), T('a mousepad', 'sebuah tapak tetikus')];
  const INTRO_RECT = [
    (obj, l, w, A) => T(`The length of ${obj.en} is $${l}$ more than its width $x$. Its area is $${A}$. Form an equation and find the width.`, `Panjang ${obj.ms} ialah $${l}$ lebih daripada lebarnya $x$. Luasnya ialah $${A}$. Bentukkan persamaan dan cari lebarnya.`),
    (obj, l, w, A) => T(`${obj.en[0].toUpperCase()}${obj.en.slice(1)} has a length $${l}$ greater than its width $x$, and an area of $${A}$. Find $x$.`, `${obj.ms[0].toUpperCase()}${obj.ms.slice(1)} mempunyai panjang $${l}$ lebih besar daripada lebarnya $x$, dan luas $${A}$. Cari $x$.`),
    (obj, l, w, A) => T(`For ${obj.en}, the length exceeds the width $x$ by $${l}$, and the area is $${A}$. Determine the width.`, `Bagi ${obj.ms}, panjangnya melebihi lebar $x$ sebanyak $${l}$, dan luasnya ialah $${A}$. Tentukan lebarnya.`),
    (obj, l, w, A) => T(`${obj.en[0].toUpperCase()}${obj.en.slice(1)} is $${l}$ longer than it is wide (width $x$); its area is $${A}$. Find the value of $x$.`, `${obj.ms[0].toUpperCase()}${obj.ms.slice(1)} adalah $${l}$ lebih panjang daripada lebarnya (lebar $x$); luasnya ialah $${A}$. Cari nilai $x$.`),
    (obj, l, w, A) => T(`Suppose ${obj.en} has width $x$ and a length $${l}$ more, giving area $${A}$. What is $x$?`, `Andaikan ${obj.ms} mempunyai lebar $x$ dan panjang $${l}$ lebih, memberikan luas $${A}$. Apakah $x$?`),
  ];
  const g16e1 = (r) => {
    const obj = r.pick(CTXOBJ);
    const a = r.int(2, 8), diff = r.int(1, 6), b = a + diff, A = a * b;
    const s = r.pick(INTRO_RECT)(obj, diff, a, `${A}\\ \\text{cm}^2`);
    return { q: s, a: T(`$x(x + ${diff}) = ${A}$; $x = ${a}$ cm (reject $x = -${b}$)`, `$x(x + ${diff}) = ${A}$; $x = ${a}$ cm (tolak $x = -${b}$)`), sp: 'm' };
  };
  const g16e2 = (r) => {
    const p = r.int(2, 8), q = r.int(2, 8);
    return { q: T(`Two numbers differ by $${Math.abs(p - q)}$ and their product is $${p * q}$. If the smaller number is $x$, form an equation in $x$.`, `Dua nombor berbeza sebanyak $${Math.abs(p - q)}$ dan hasil darabnya ialah $${p * q}$. Jika nombor yang lebih kecil ialah $x$, bentukkan persamaan dalam $x$.`), a: T(`$x(x + ${Math.abs(p - q)}) = ${p * q}$`), sp: 's' };
  };
  const g16e3 = (r) => {
    const s = r.int(4, 12);
    return { q: T(`A square has side $(x + ${s})$ cm. Write a quadratic expression for its area, and state the expression for the area in expanded form.`, `Sebuah segi empat sama mempunyai sisi $(x + ${s})$ cm. Tulis ungkapan kuadratik bagi luasnya, dan nyatakan ungkapan luas dalam bentuk kembang.`), a: T(`$(x + ${s})^2 = ${Q(1, 2 * s, s * s)}$`), sp: 's' };
  };
  const g16e4 = (r) => {
    const n = r.int(3, 9);
    return { q: T(`The product of two consecutive positive integers is $${n * (n + 1)}$. Form a quadratic equation in $x$ (the smaller integer).`, `Hasil darab dua integer positif berturutan ialah $${n * (n + 1)}$. Bentukkan persamaan kuadratik dalam $x$ (integer yang lebih kecil).`), a: T(`$x(x + 1) = ${n * (n + 1)}$, i.e. $${Q(1, 1, -n * (n + 1))} = 0$`), sp: 's' };
  };
  const INTRO_CONSEC = [
    (P) => T(`The product of two consecutive positive integers is $${P}$. Form a quadratic equation in $x$ (the smaller integer) and find the integers.`, `Hasil darab dua integer positif berturutan ialah $${P}$. Bentukkan persamaan kuadratik dalam $x$ (integer yang lebih kecil) dan cari integer itu.`),
    (P) => T(`Two consecutive positive integers multiply to give $${P}$. Letting $x$ be the smaller, form and solve a quadratic equation.`, `Dua integer positif berturutan didarab memberikan $${P}$. Dengan $x$ ialah yang lebih kecil, bentukkan dan selesaikan persamaan kuadratik.`),
    (P) => T(`Find two consecutive positive integers whose product is $${P}$, using $x$ for the smaller integer.`, `Cari dua integer positif berturutan yang hasil darabnya ialah $${P}$, dengan menggunakan $x$ bagi integer yang lebih kecil.`),
    (P) => T(`Two consecutive positive integers have a product of $${P}$. Determine both integers.`, `Dua integer positif berturutan mempunyai hasil darab $${P}$. Tentukan kedua-dua integer itu.`),
    (P) => T(`If two consecutive positive integers multiply to $${P}$, identify both integers.`, `Jika dua integer positif berturutan didarab menjadi $${P}$, kenal pasti kedua-dua integer itu.`),
  ];
  const g16e5 = (r) => {
    const n = r.int(3, 9);
    const s = r.pick(INTRO_CONSEC)(n * (n + 1));
    return { q: s, a: T(`$x(x + 1) = ${n * (n + 1)}$; the integers are $${n}$ and $${n + 1}$.`, `$x(x + 1) = ${n * (n + 1)}$; integer itu ialah $${n}$ dan $${n + 1}$.`), sp: 'm' };
  };
  const g16e = [g16e1, g16e2, g16e3, g16e4, g16e5];

  const INTRO_RECT_M = [
    (obj, l, w, A) => T(`The length of ${obj.en} is $${l}$ more than its width $x$. Its area is $${A}$. Form a quadratic equation in $x$ and solve it to find the width.`, `Panjang ${obj.ms} ialah $${l}$ lebih daripada lebarnya $x$. Luasnya ialah $${A}$. Bentukkan persamaan kuadratik dalam $x$ dan selesaikannya untuk mencari lebar.`),
    (obj, l, w, A) => T(`${obj.en[0].toUpperCase()}${obj.en.slice(1)} has length $${l}$ cm greater than its width $x$ cm and area $${A}$. Find $x$, rejecting any inadmissible root.`, `${obj.ms[0].toUpperCase()}${obj.ms.slice(1)} mempunyai panjang $${l}$ cm lebih besar daripada lebarnya $x$ cm dan luas $${A}$. Cari $x$, dengan menolak sebarang punca yang tidak sah.`),
    (obj, l, w, A) => T(`Given that ${obj.en} has a width $x$ cm, a length $${l}$ cm longer, and an area of $${A}$, form and solve a suitable equation.`, `Diberi ${obj.ms} mempunyai lebar $x$ cm, panjang $${l}$ cm lebih panjang, dan luas $${A}$, bentukkan dan selesaikan persamaan yang sesuai.`),
  ];
  const g16m1 = (r) => {
    const obj = r.pick(CTXOBJ);
    const a = r.int(3, 10), diff = r.int(1, 7), b = a + diff, A = a * b;
    const s = r.pick(INTRO_RECT_M)(obj, diff, a, `${A}\\ \\text{cm}^2`);
    return { q: s, a: T(`$x(x + ${diff}) = ${A} \\Rightarrow ${Q(1, diff, -A)} = 0 \\Rightarrow (x - ${a})(x + ${b}) = 0$; $x = ${a}$ cm (reject $x = -${b}$, a length cannot be negative)`, `$x(x + ${diff}) = ${A} \\Rightarrow ${Q(1, diff, -A)} = 0 \\Rightarrow (x - ${a})(x + ${b}) = 0$; $x = ${a}$ cm (tolak $x = -${b}$, panjang tidak boleh negatif)`), sp: 'l' };
  };
  const g16m2 = (r) => {
    const a = r.int(4, 12);
    return { q: T(`The product of two consecutive even integers is $${a * (a + 2)}$. Form a quadratic equation and find the integers.`, `Hasil darab dua integer genap berturutan ialah $${a * (a + 2)}$. Bentukkan persamaan kuadratik dan cari integer itu.`), a: T(`$x(x + 2) = ${a * (a + 2)}$; $x = ${a}$ (reject $x = -${a + 2}$); the integers are $${a}$ and $${a + 2}$.`, `$x(x + 2) = ${a * (a + 2)}$; $x = ${a}$ (tolak $x = -${a + 2}$); integer itu ialah $${a}$ dan $${a + 2}$.`), sp: 'm' };
  };
  const g16m3 = (r) => {
    const s = r.int(3, 8), k = r.int(1, 5);
    const A = (s * (s + k)) / 2;
    need(Number.isInteger(A) && A > 0);
    return { q: T(`The base of a triangle is $x$ cm and its height is $(x + ${k})$ cm. The area is $${A}$ cm². Form a quadratic equation and find $x$.`, `Tapak sebuah segi tiga ialah $x$ cm dan tingginya $(x + ${k})$ cm. Luasnya ialah $${A}$ cm². Bentukkan persamaan kuadratik dan cari $x$.`), a: T(`$\\dfrac{1}{2}x(x + ${k}) = ${A}$, $${Q(1, k, -2 * A)} = 0$; $x = ${s}$ cm`, `$\\dfrac{1}{2}x(x + ${k}) = ${A}$, $${Q(1, k, -2 * A)} = 0$; $x = ${s}$ cm`), sp: 'm' };
  };
  const g16m4 = (r) => {
    const inner = r.int(3, 8), border = r.int(1, 4);
    const outer = inner + 2 * border;
    const A = outer * outer;
    return { q: T(`A square photo of side $x$ cm has a border of width $${border}$ cm added on every side, making a square of area $${A}$ cm² overall. Form a quadratic equation in $x$ and solve it.`, `Sekeping gambar segi empat sama bersisi $x$ cm mempunyai sempadan lebar $${border}$ cm ditambah pada setiap sisi, membentuk segi empat sama berluas $${A}$ cm² secara keseluruhan. Bentukkan persamaan kuadratik dalam $x$ dan selesaikannya.`), a: T(`$(x + ${2 * border})^2 = ${A}$, i.e. $${Q(1, 4 * border, 4 * border * border - A)} = 0$; $x = ${inner}$ cm (reject the negative root).`, `$(x + ${2 * border})^2 = ${A}$, iaitu $${Q(1, 4 * border, 4 * border * border - A)} = 0$; $x = ${inner}$ cm (tolak punca negatif).`), sp: 'l' };
  };
  const INTRO_TRI_M = [
    (k, A) => T(`The base of a triangle is $x$ cm and its height is $(x + ${k})$ cm. The area is $${A}$ cm². Form a quadratic equation and find $x$.`, `Tapak sebuah segi tiga ialah $x$ cm dan tingginya $(x + ${k})$ cm. Luasnya ialah $${A}$ cm². Bentukkan persamaan kuadratik dan cari $x$.`),
    (k, A) => T(`A triangular flag has base $x$ cm and height $(x + ${k})$ cm, with area $${A}$ cm². Set up and solve a quadratic equation for $x$.`, `Sebuah bendera segi tiga mempunyai tapak $x$ cm dan tinggi $(x + ${k})$ cm, dengan luas $${A}$ cm². Bina dan selesaikan persamaan kuadratik bagi $x$.`),
    (k, A) => T(`A triangle's height exceeds its base $x$ cm by $${k}$ cm, and its area is $${A}$ cm². Find $x$.`, `Tinggi sebuah segi tiga melebihi tapaknya $x$ cm sebanyak $${k}$ cm, dan luasnya ialah $${A}$ cm². Cari $x$.`),
    (k, A) => T(`A triangular banner has base $x$ cm, height $(x + ${k})$ cm and area $${A}$ cm². Determine $x$.`, `Sepanduk segi tiga mempunyai tapak $x$ cm, tinggi $(x + ${k})$ cm dan luas $${A}$ cm². Tentukan $x$.`),
  ];
  const g16m5 = (r) => {
    const s = r.int(3, 8), k = r.int(1, 5);
    const A = (s * (s + k)) / 2;
    need(Number.isInteger(A) && A > 0);
    const q = r.pick(INTRO_TRI_M)(k, A);
    return { q, a: T(`$\\dfrac{1}{2}x(x + ${k}) = ${A}$, $${Q(1, k, -2 * A)} = 0$; $x = ${s}$ cm`, `$\\dfrac{1}{2}x(x + ${k}) = ${A}$, $${Q(1, k, -2 * A)} = 0$; $x = ${s}$ cm`), sp: 'm' };
  };
  const g16m = [g16m1, g16m2, g16m3, g16m4, g16m5];

  const g16a1 = (r) => {
    const s = r.int(3, 8), k = r.int(1, 5);
    const A = (s * (s + k)) / 2;
    need(Number.isInteger(A) && A > 0);
    return { q: T(`The base of a triangle is $x$ cm and its height is $(x + ${k})$ cm. The area is $${A}$ cm². Form and solve a quadratic equation to find $x$, and state which solution is rejected and why.`, `Tapak sebuah segi tiga ialah $x$ cm dan tingginya $(x + ${k})$ cm. Luasnya ialah $${A}$ cm². Bentukkan dan selesaikan persamaan kuadratik untuk mencari $x$, dan nyatakan penyelesaian yang ditolak berserta sebabnya.`), a: T(`$\\dfrac{1}{2}x(x + ${k}) = ${A}$, $${Q(1, k, -2 * A)} = 0$; $x = ${s}$; reject $x = -${s + k}$ (length cannot be negative)`, `$\\dfrac{1}{2}x(x + ${k}) = ${A}$, $${Q(1, k, -2 * A)} = 0$; $x = ${s}$; tolak $x = -${s + k}$ (panjang tidak boleh negatif)`), sp: 'l' };
  };
  const g16a2 = (r) => {
    const w = r.int(4, 9), l = w + r.int(2, 6);
    const inc = r.int(1, 4);
    const A2 = (w + inc) * (l + inc);
    return { q: T(`A rectangular field is $${l}$ m by $${w}$ m. Both dimensions are increased by $x$ m, making the new area $${A2}$ m². Form a quadratic equation in $x$, solve it, and interpret your answer.`, `Sebidang padang segi empat tepat berukuran $${l}$ m dengan $${w}$ m. Kedua-dua dimensi ditambah $x$ m, menjadikan luas baharu $${A2}$ m². Bentukkan persamaan kuadratik dalam $x$, selesaikannya, dan tafsirkan jawapan anda.`), a: T(`$(${l} + x)(${w} + x) = ${A2}$; expanding gives $${Q(1, l + w, l * w - A2)} = 0$; $x = ${inc}$ (reject the negative root); each dimension increases by $${inc}$ m.`, `$(${l} + x)(${w} + x) = ${A2}$; mengembangkan memberikan $${Q(1, l + w, l * w - A2)} = 0$; $x = ${inc}$ (tolak punca negatif); setiap dimensi bertambah $${inc}$ m.`), sp: 'l' };
  };
  const g16a3 = (r) => {
    const n = r.int(4, 10);
    return { q: T(`The product of two positive integers that differ by $${n}$ is $${(n + 6) * 6}$. Form a quadratic equation and find both integers, explaining why only one pair is valid.`, `Hasil darab dua integer positif yang berbeza sebanyak $${n}$ ialah $${(n + 6) * 6}$. Bentukkan persamaan kuadratik dan cari kedua-dua integer itu, dengan menerangkan mengapa hanya satu pasangan yang sah.`), a: T(`$x(x + ${n}) = ${(n + 6) * 6}$; $${Q(1, n, -(n + 6) * 6)} = 0$; $x = 6$ (reject the negative root as integers here must be positive); the integers are $6$ and $${n + 6}$.`, `$x(x + ${n}) = ${(n + 6) * 6}$; $${Q(1, n, -(n + 6) * 6)} = 0$; $x = 6$ (tolak punca negatif kerana integer di sini mestilah positif); integer itu ialah $6$ dan $${n + 6}$.`), sp: 'l' };
  };
  const INTRO_RECT_A = [
    (obj, l, w, A) => T(`${obj.en[0].toUpperCase()}${obj.en.slice(1)} has length $${l}$ more than its width $x$ and area $${A}$. Form and solve a quadratic equation for $x$, fully justifying which root is rejected and why.`, `${obj.ms[0].toUpperCase()}${obj.ms.slice(1)} mempunyai panjang $${l}$ lebih daripada lebarnya $x$ dan luas $${A}$. Bentukkan dan selesaikan persamaan kuadratik bagi $x$, dengan menjustifikasikan sepenuhnya punca yang ditolak dan sebabnya.`),
    (obj, l, w, A) => T(`A designer models ${obj.en} with width $x$, length $${l}$ more than the width, and area $${A}$. Set up and solve the equation, then explain why only one solution makes physical sense.`, `Seorang pereka memodelkan ${obj.ms} dengan lebar $x$, panjang $${l}$ lebih daripada lebar, dan luas $${A}$. Bina dan selesaikan persamaan itu, kemudian terangkan mengapa hanya satu penyelesaian masuk akal secara fizikal.`),
  ];
  const g16a4 = (r) => {
    const obj = r.pick(CTXOBJ);
    const a = r.int(3, 10), diff = r.int(1, 7), b = a + diff, A = a * b;
    const s = r.pick(INTRO_RECT_A)(obj, diff, a, `${A}\\ \\text{cm}^2`);
    return { q: s, a: T(`$x(x + ${diff}) = ${A} \\Rightarrow ${Q(1, diff, -A)} = 0 \\Rightarrow (x - ${a})(x + ${b}) = 0$; $x = ${a}$ or $x = -${b}$. Reject $x = -${b}$ since a width cannot be negative; $x = ${a}$ cm.`, `$x(x + ${diff}) = ${A} \\Rightarrow ${Q(1, diff, -A)} = 0 \\Rightarrow (x - ${a})(x + ${b}) = 0$; $x = ${a}$ atau $x = -${b}$. Tolak $x = -${b}$ kerana lebar tidak boleh negatif; $x = ${a}$ cm.`), sp: 'l' };
  };
  const g16a5 = (r) => {
    const n = r.int(4, 10);
    return { q: T(`The sum of a positive integer and its square is $${n + n * n}$. Form a quadratic equation and find the integer, explaining why the negative solution is rejected.`, `Hasil tambah suatu integer positif dan kuasa duanya ialah $${n + n * n}$. Bentukkan persamaan kuadratik dan cari integer itu, dengan menerangkan mengapa penyelesaian negatif ditolak.`), a: T(`$x + x^2 = ${n + n * n}$, i.e. $${Q(1, 1, -(n + n * n))} = 0$; $x = ${n}$ (reject $x = -${n + 1}$, since the integer must be positive).`, `$x + x^2 = ${n + n * n}$, iaitu $${Q(1, 1, -(n + n * n))} = 0$; $x = ${n}$ (tolak $x = -${n + 1}$, kerana integer itu mestilah positif).`), sp: 'l' };
  };
  const g16a6 = (r) => {
    const w = r.int(3, 7), extra = r.int(3, 9);
    const A = w * (w + extra);
    return { q: T(`A rectangular banner has perimeter-independent length $(x + ${extra})$ cm and width $x$ cm, with area $${A}$ cm². A colleague suggests $x = ${-(w + extra)}$ cm is also a valid width. Explain, with reference to the context, why this is not acceptable.`, `Sepanduk segi empat tepat mempunyai panjang $(x + ${extra})$ cm dan lebar $x$ cm, dengan luas $${A}$ cm². Seorang rakan sekerja mencadangkan $x = ${-(w + extra)}$ cm juga lebar yang sah. Terangkan, merujuk konteks, mengapa ini tidak boleh diterima.`), a: T(`Although $x = ${-(w + extra)}$ solves the equation algebraically, a width cannot be negative in this real-world context, so only $x = ${w}$ cm is valid.`, `Walaupun $x = ${-(w + extra)}$ menyelesaikan persamaan secara algebra, lebar tidak boleh negatif dalam konteks dunia sebenar ini, jadi hanya $x = ${w}$ cm sah.`), sp: 'm' };
  };
  const INTRO_TRI_A = [
    (k, A) => T(`The base of a triangular sail is $x$ m and its height is $(x + ${k})$ m. The area is $${A}$ m². Form and solve a quadratic equation for $x$, fully justifying which root is rejected.`, `Tapak sebuah layar segi tiga ialah $x$ m dan tingginya $(x + ${k})$ m. Luasnya ialah $${A}$ m². Bentukkan dan selesaikan persamaan kuadratik bagi $x$, dengan menjustifikasikan sepenuhnya punca yang ditolak.`),
  ];
  const g16a7 = (r) => {
    const s = r.int(3, 8), k = r.int(1, 5);
    const A = (s * (s + k)) / 2;
    need(Number.isInteger(A) && A > 0);
    const q = INTRO_TRI_A[0](k, A);
    return { q, a: T(`$\\dfrac{1}{2}x(x + ${k}) = ${A}$, $${Q(1, k, -2 * A)} = 0 \\Rightarrow (x - ${s})(x + ${s + k}) = 0$; $x = ${s}$ (reject $x = -${s + k}$, since a length cannot be negative).`, `$\\dfrac{1}{2}x(x + ${k}) = ${A}$, $${Q(1, k, -2 * A)} = 0 \\Rightarrow (x - ${s})(x + ${s + k}) = 0$; $x = ${s}$ (tolak $x = -${s + k}$, kerana panjang tidak boleh negatif).`), sp: 'l' };
  };
  const g16a = [g16a1, g16a2, g16a3, g16a4, g16a5, g16a6, g16a7];

  SPM.extend('F4-1.6', { e: g16e, m: g16m, a: g16a });

  /* =============================================================== 1.5 : sketching & matching graphs */
  const ctxPQg = (r) => { const p = r.int(-4, -1), q = r.int(1, 4); const a = r.pick([1, -1, 2]); return { p, q, a }; };
  const FEAT_GR = [
    { ask: T('the $x$-intercepts', 'pintasan-$x$'), val: ({ p, q }) => T(`$(${p}, 0)$ and $(${q}, 0)$`, `$(${p}, 0)$ dan $(${q}, 0)$`) },
    { ask: T('the $y$-intercept', 'pintasan-$y$'), val: ({ p, q, a }) => T(`$${a * p * q}$`, `$${a * p * q}$`) },
    { ask: T('whether the graph has a maximum or minimum point', 'sama ada graf mempunyai titik maksimum atau minimum'), val: ({ a }) => T(a > 0 ? 'Minimum' : 'Maximum', a > 0 ? 'Minimum' : 'Maksimum') },
    { ask: T('the number of times the graph crosses the $x$-axis', 'berapa kali graf memotong paksi-$x$'), val: () => T('$2$', '$2$') },
    { ask: T('the roots of $y = 0$', 'punca bagi $y = 0$'), val: ({ p, q }) => T(`$x = ${p}$ or $x = ${q}$`, `$x = ${p}$ atau $x = ${q}$`) },
    { ask: T('whether the graph opens upward or downward', 'sama ada graf terbuka ke atas atau ke bawah'), val: ({ a }) => T(a > 0 ? 'Upward' : 'Downward', a > 0 ? 'Ke atas' : 'Ke bawah') },
    { ask: T('the sum of the two $x$-intercepts', 'hasil tambah kedua-dua pintasan-$x$'), val: ({ p, q }) => T(`$${p + q}$`, `$${p + q}$`) },
    { ask: T('the product of the two $x$-intercepts', 'hasil darab kedua-dua pintasan-$x$'), val: ({ p, q }) => T(`$${p * q}$`, `$${p * q}$`) },
    { ask: T('the value of $y$ when $x = 0$', 'nilai $y$ apabila $x = 0$'), val: ({ p, q, a }) => T(`$${a * p * q}$`, `$${a * p * q}$`) },
    { ask: T('the larger $x$-intercept', 'pintasan-$x$ yang lebih besar'), val: ({ p, q }) => T(`$(${Math.max(p, q)}, 0)$`, `$(${Math.max(p, q)}, 0)$`) },
    { ask: T('the smaller $x$-intercept', 'pintasan-$x$ yang lebih kecil'), val: ({ p, q }) => T(`$(${Math.min(p, q)}, 0)$`, `$(${Math.min(p, q)}, 0)$`) },
    { ask: T('whether the graph is symmetrical, and about what line', 'sama ada graf itu simetri, dan tentang garis yang mana'), val: () => T('Yes, it is symmetrical about a vertical line through its turning point.', 'Ya, ia simetri tentang satu garis mencancang melalui titik pusingannya.') },
    { ask: T('the coordinates of one point on the graph other than the intercepts', 'koordinat satu titik pada graf selain pintasan'), val: ({ p, q, a }) => { const x0 = p + q; return T(`e.g. $(${x0}, ${a * (x0 - p) * (x0 - q)})$ (any point satisfying the equation is acceptable).`, `cth. $(${x0}, ${a * (x0 - p) * (x0 - q)})$ (mana-mana titik yang memenuhi persamaan boleh diterima).`); } },
    { ask: T('the total number of $x$- and $y$-intercepts combined', 'jumlah bilangan pintasan-$x$ dan pintasan-$y$ digabungkan'), val: () => T('$3$ ($2$ $x$-intercepts and $1$ $y$-intercept).', '$3$ ($2$ pintasan-$x$ dan $1$ pintasan-$y$).') },
  ];
  const INTRO_GR1 = [
    (ask, y) => T(`The graph of $y = ${y}$ is drawn. State ${ask.en}.`, `Graf $y = ${y}$ dilukis. Nyatakan ${ask.ms}.`),
    (ask, y) => T(`For the graph of $y = ${y}$, find ${ask.en}.`, `Bagi graf $y = ${y}$, cari ${ask.ms}.`),
    (ask, y) => T(`Sketching $y = ${y}$, identify ${ask.en}.`, `Melakar $y = ${y}$, kenal pasti ${ask.ms}.`),
    (ask, y) => T(`Given the function $y = ${y}$, determine ${ask.en} of its graph.`, `Diberi fungsi $y = ${y}$, tentukan ${ask.ms} bagi grafnya.`),
    (ask, y) => T(`What is ${ask.en} of the graph $y = ${y}$?`, `Apakah ${ask.ms} bagi graf $y = ${y}$?`),
    (ask, y) => T(`Read off ${ask.en} for $y = ${y}$.`, `Baca ${ask.ms} bagi $y = ${y}$.`),
    (ask, y) => T(`Consider the graph $y = ${y}$. Write down ${ask.en}.`, `Pertimbangkan graf $y = ${y}$. Tuliskan ${ask.ms}.`),
    (ask, y) => T(`The curve $y = ${y}$ is to be sketched. Report ${ask.en}.`, `Lengkung $y = ${y}$ hendak dilakar. Laporkan ${ask.ms}.`),
    (ask, y) => T(`Inspect $y = ${y}$ and state ${ask.en}.`, `Periksa $y = ${y}$ dan nyatakan ${ask.ms}.`),
  ];
  const g15e1 = (r) => {
    const ctx = ctxPQg(r);
    const y = `${ctx.a === 1 ? '' : ctx.a === -1 ? '-' : ctx.a}(x - ${ctx.p})(x - ${ctx.q})`.replace('- -', '+ ');
    const f = r.pick(FEAT_GR);
    const s = r.pick(INTRO_GR1)(f.ask, y);
    return { q: s, a: f.val(ctx), sp: 's' };
  };
  const g15e2 = (r) => {
    const p = r.int(-4, 0), q = r.int(1, 4);
    const fig = S.plane({ x: [-6, 6], y: [-8, 8], scale: 15, labelStep: 2, curves: [{ f: (x) => (x - p) * (x - q) }] });
    return { q: T('The graph of a quadratic function is shown. State the $x$-intercepts, the $y$-intercept and whether the graph has a maximum or a minimum point.', 'Graf suatu fungsi kuadratik ditunjukkan. Nyatakan pintasan-$x$, pintasan-$y$ dan sama ada graf itu mempunyai titik maksimum atau minimum.'), fig, a: T(`$x$-intercepts ${p} and ${q}; $y$-intercept ${p * q}; minimum point`, `Pintasan-$x$ ${p} dan ${q}; pintasan-$y$ ${p * q}; titik minimum`), sp: 's' };
  };
  const g15e3 = (r) => {
    const a = r.pick([1, -1, 2, -1, 3]);
    const c = r.nz(-5, 5);
    const fig = S.plane({ x: [-5, 5], y: [-8, 8], scale: 15, curves: [{ f: (x) => (a === 1 ? 1 : a === -1 ? -1 : a) * x * x + c }], labelStep: 2 });
    return { q: T('The graph shown is of $y = ax^2 + c$. State whether $a$ is positive or negative, and state the value of $c$.', 'Graf yang ditunjukkan ialah bagi $y = ax^2 + c$. Nyatakan sama ada $a$ positif atau negatif, dan nyatakan nilai $c$.'), fig, a: T(`$a$ is ${a > 0 ? 'positive' : 'negative'}; $c = ${c}$`, `$a$ adalah ${a > 0 ? 'positif' : 'negatif'}; $c = ${c}$`), sp: 's' };
  };
  const g15e4 = (r) => {
    const p = r.int(-3, 3), q = r.int(-4, 4);
    const a = r.pick([1, -1]);
    const xs = range(-2, 2);
    const tab = SPM.table([['$x$', ...xs.map((x) => `$${x}$`)], ['$y$', ...xs.map(() => '')]]);
    const ys = xs.map((x) => a * (x - p) * (x - p) + q);
    return { q: T(`Complete the table of values for $y = ${a === 1 ? '' : '-'}(x - ${p})^2 + ${q}$.<br>${tab}`, `Lengkapkan jadual nilai bagi $y = ${a === 1 ? '' : '-'}(x - ${p})^2 + ${q}$.<br>${tab}`), a: T(`$y = ${ys.join(', ')}$`), sp: 's' };
  };
  const g15e = [g15e1, g15e2, g15e3, g15e4];

  const INTRO_GR2 = [
    (ask, y) => T(`After completing a table of values, the graph of $y = ${y}$ is drawn. State ${ask.en}.`, `Selepas melengkapkan jadual nilai, graf $y = ${y}$ dilukis. Nyatakan ${ask.ms}.`),
    (ask, y) => T(`Using symmetry, determine ${ask.en} for the graph of $y = ${y}$.`, `Menggunakan simetri, tentukan ${ask.ms} bagi graf $y = ${y}$.`),
    (ask, y) => T(`From the factorised form $y = ${y}$, deduce ${ask.en} of its graph without plotting.`, `Daripada bentuk pemfaktoran $y = ${y}$, deduksikan ${ask.ms} bagi grafnya tanpa memplot.`),
    (ask, y) => T(`Calculate ${ask.en} for the graph of $y = ${y}$, showing your reasoning.`, `Hitung ${ask.ms} bagi graf $y = ${y}$, dengan menunjukkan penaakulan anda.`),
    (ask, y) => T(`Work out ${ask.en} of $y = ${y}$ before sketching.`, `Kira ${ask.ms} bagi $y = ${y}$ sebelum melakar.`),
    (ask, y) => T(`A student needs $y = ${y}$ sketched accurately. Before they start, find ${ask.en}.`, `Seorang pelajar perlu melakar $y = ${y}$ dengan tepat. Sebelum bermula, cari ${ask.ms}.`),
    (ask, y) => T(`Analyse the equation $y = ${y}$ to obtain ${ask.en}.`, `Analisis persamaan $y = ${y}$ untuk mendapatkan ${ask.ms}.`),
  ];
  const g15m1 = (r) => {
    const ctx = ctxPQg(r);
    const y = `${ctx.a === 1 ? '' : ctx.a === -1 ? '-' : ctx.a}(x - ${ctx.p})(x - ${ctx.q})`.replace('- -', '+ ');
    const f = r.pick(FEAT_GR);
    const s = r.pick(INTRO_GR2)(f.ask, y);
    return { q: s, a: f.val(ctx), sp: 'm' };
  };
  const g15m2 = (r) => {
    const a = r.pick([1, -1, 2]), p = r.int(-1, 1), q = r.int(-3, 3);
    const b = -2 * a * p, c = a * p * p + q;
    const xs = range(-3, 3);
    const tab = SPM.table([['$x$', ...xs, ], ['$y$', ...xs.map(() => '')]]);
    return { q: T(`Complete the table of values for $y = ${Q(a, b, c)}$ and sketch its graph, showing the axis of symmetry and the ${a > 0 ? 'minimum' : 'maximum'} point.<br>${tab}`, `Lengkapkan jadual nilai bagi $y = ${Q(a, b, c)}$ dan lakar grafnya, dengan menunjukkan paksi simetri dan titik ${a > 0 ? 'minimum' : 'maksimum'}.<br>${tab}`), fig: S.plane({ x: [-4, 4], y: [-8, 10], scale: 14, labelStep: 2 }), a: T(`$y = ${xs.map((x) => a * x * x + b * x + c).join(', ')}$; axis $x = ${p}$; ${a > 0 ? 'minimum' : 'maximum'} point $(${p}, ${q})$`, `$y = ${xs.map((x) => a * x * x + b * x + c).join(', ')}$; paksi $x = ${p}$; titik ${a > 0 ? 'minimum' : 'maksimum'} $(${p}, ${q})$`), sp: 'xs' };
  };
  const g15m3 = (r) => {
    const p = r.int(-3, 3), a = r.pick([1, 2, -1]);
    const xs = [p - 2, p - 1, p, p + 1, p + 2];
    const b = -2 * a * p, c = r.nz(-4, 4);
    const ys = xs.map((x) => a * x * x + b * x + c);
    return { q: T(`A table of values for $y = ${Q(a, b, c)}$ has $y = ${ys.join(', ')}$ for $x = ${xs.join(', ')}$. Use the equal outputs to state the axis of symmetry.`, `Jadual nilai bagi $y = ${Q(a, b, c)}$ mempunyai $y = ${ys.join(', ')}$ bagi $x = ${xs.join(', ')}$. Guna output yang sama untuk menyatakan paksi simetri.`), a: T(`$x = ${p}$ (since $y$ at $x = ${p - 1}$ and $x = ${p + 1}$ are equal, and similarly for $x = ${p - 2}$, $x = ${p + 2}$)`, `$x = ${p}$ (kerana $y$ pada $x = ${p - 1}$ dan $x = ${p + 1}$ adalah sama, dan begitu juga bagi $x = ${p - 2}$, $x = ${p + 2}$)`), sp: 'm' };
  };
  const g15m4 = (r) => {
    const p = r.int(-3, 3), q1 = r.int(-4, -1), q2 = r.int(1, 4);
    const funcs = [
      { a: 1, p, q: q1, label: 'A' },
      { a: 1, p, q: q2, label: 'B' },
    ];
    const chosen = r.pick(funcs);
    const fig = S.plane({ x: [-5, 5], y: [-5, 8], scale: 14, labelStep: 2, curves: [{ f: (x) => (x - chosen.p) * (x - chosen.p) + chosen.q }] });
    const opts = [`y = (x - ${chosen.p})^2 + ${q1}`, `y = (x - ${chosen.p})^2 + ${q2}`, `y = (x + ${chosen.p})^2 + ${chosen.q}`];
    const m = mcq(r, `y = (x - ${chosen.p})^2 + ${chosen.q}`, opts);
    return { q: T(`Which equation matches the graph shown? ${m.list}`, `Persamaan manakah yang sepadan dengan graf yang ditunjukkan? ${m.list}`), fig, a: T(`(${m.letter})`), sp: 's' };
  };
  const g15m = [g15m1, g15m2, g15m3, g15m4];

  const INTRO_GR3 = [
    (ask, y) => T(`Without plotting any points, justify ${ask.en} for the graph of $y = ${y}$.`, `Tanpa memplot mana-mana titik, wajarkan ${ask.ms} bagi graf $y = ${y}$.`),
    (ask, y) => T(`A classmate cannot see why ${ask.en} takes the value it does for $y = ${y}$. Explain fully.`, `Seorang rakan sekelas tidak dapat melihat mengapa ${ask.ms} mempunyai nilai sedemikian bagi $y = ${y}$. Terangkan sepenuhnya.`),
    (ask, y) => T(`Prove, using the structure of $y = ${y}$ alone, what ${ask.en} must be.`, `Buktikan, menggunakan struktur $y = ${y}$ sahaja, apakah ${ask.ms} yang mesti ada.`),
    (ask, y) => T(`Reasoning from the equation (not a picture), determine ${ask.en} for $y = ${y}$.`, `Menaakul daripada persamaan (bukan gambar), tentukan ${ask.ms} bagi $y = ${y}$.`),
    (ask, y) => T(`Give a complete argument, referencing the factorised form, for ${ask.en} of $y = ${y}$.`, `Berikan hujah lengkap, merujuk bentuk pemfaktoran, bagi ${ask.ms} $y = ${y}$.`),
    (ask, y) => T(`A textbook omits the graph for $y = ${y}$. Deduce ${ask.en} from the equation alone, with justification.`, `Sebuah buku teks tidak menyertakan graf bagi $y = ${y}$. Deduksikan ${ask.ms} daripada persamaan sahaja, berserta justifikasi.`),
  ];
  const g15a1 = (r) => {
    const ctx = ctxPQg(r);
    const y = `${ctx.a === 1 ? '' : ctx.a === -1 ? '-' : ctx.a}(x - ${ctx.p})(x - ${ctx.q})`.replace('- -', '+ ');
    const f = r.pick(FEAT_GR);
    const s = r.pick(INTRO_GR3)(f.ask, y);
    return { q: s, a: f.val(ctx), sp: 'm' };
  };
  const g15a2 = (r) => {
    const p = r.int(1, 3), q = r.int(-3, -1), a = r.pick([1, 2, -1]);
    const fig = S.plane({ x: [-5, 5], y: [-10, 10], scale: 14, labelStep: 2, curves: [{ f: (x) => a * (x - p) * (x - q) }], pts: [{ x: 0, y: a * p * q, l: '' }] });
    return { q: T(`The graph of a quadratic function cuts the $x$-axis at $x = ${q}$ and $x = ${p}$ and the $y$-axis at $(0, ${a * p * q})$. Find the equation of the function.`, `Graf suatu fungsi kuadratik memotong paksi-$x$ pada $x = ${q}$ dan $x = ${p}$ dan paksi-$y$ di $(0, ${a * p * q})$. Cari persamaan fungsi itu.`), fig, a: T(`$y = ${a === 1 ? '' : a === -1 ? '-' : a}(x - ${p})(x + ${-q})$, i.e. $y = ${Q(a, -a * (p + q), a * p * q)}$`, `$y = ${a === 1 ? '' : a === -1 ? '-' : a}(x - ${p})(x + ${-q})$, iaitu $y = ${Q(a, -a * (p + q), a * p * q)}$`), sp: 'm' };
  };
  const g15a3 = (r) => {
    const p = r.int(-3, 3);
    const a1 = r.pick([1, 2]), a2 = r.pick([-1, -2]);
    const q1 = r.nz(-4, 4);
    const fig1 = `y = ${a1}(x - ${p})^2 ${q1 < 0 ? '-' : '+'} ${Math.abs(q1)}`;
    const fig2 = `y = ${a2}(x - ${p})^2 ${q1 < 0 ? '-' : '+'} ${Math.abs(q1)}`;
    return { q: T(`Two graphs, $${fig1}$ and $${fig2}$, share the same axis of symmetry and turning point $x$-coordinate. Explain how you know this without sketching, and state one feature that differs.`, `Dua graf, $${fig1}$ dan $${fig2}$, berkongsi paksi simetri dan koordinat-$x$ titik pusingan yang sama. Terangkan bagaimana anda tahu ini tanpa melakar, dan nyatakan satu ciri yang berbeza.`), a: T(`Both are of the form $(x - ${p})^2$, so the axis of symmetry is $x = ${p}$ for both; they differ in opening direction, since one has $a > 0$ (minimum) and the other $a < 0$ (maximum).`, `Kedua-duanya berbentuk $(x - ${p})^2$, jadi paksi simetri ialah $x = ${p}$ bagi kedua-duanya; kedua-duanya berbeza dari segi arah terbuka, kerana satu mempunyai $a > 0$ (minimum) dan satu lagi $a < 0$ (maksimum).`), sp: 'm' };
  };
  const g15a = [g15a1, g15a2, g15a3];

  SPM.extend('F4-1.5', { e: g15e, m: g15m, a: g15a });
})();
