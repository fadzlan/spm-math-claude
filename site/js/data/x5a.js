/* Variety pack x5a: extra generators for F5-1.1..1.3 (Variation) and F5-2.1..2.3 (Matrices).
 * See tools/PACKS.md. Matrix sizes and powers are kept within the KSSM Form 5 syllabus
 * (syllabus/form5/ch01-variation.md, ch02-matrices.md): 2x2 inverses only, entries -9..9,
 * prescribed powers n in {1,2,3} and roots x^(1/2), x^(1/3) with valid real domains. */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, sum, gcd, lcm, Fr, poly, lin, rm } = SPM;
  const T = SPM.L, S = SPM.svg;
  const PT = SPM.parts;
  const cat = (...xs) => SPM.cat(...xs);
  const frT = Fr.tex;
  const fr = (a, b) => Fr.make(a, b);

  /* ---------------------------------------------------------- generic MCQ / fact-bank task frames
   * (a small bank of [correctStatement, plausibleWrongVariant] pairs feeds several task shapes:
   * true/false, spot-the-error, "pick the true one among k", full MCQ. See PACKS.md §2. */
  const W = SPM.lines;
  /* each fact-bank entry is [correct, wrong variant, why] – `why` is the one-line reason used as working */
  const mc = (r, right, wrong) => {
    const all = r.shuffle([right].concat(wrong));
    need(new Set(all.map((o) => o.en)).size === all.length);
    const f = (k) => all.map((o, i) => `(${'ABCD'[i]}) ${o[k]}`).join('&emsp;&emsp;');
    const i = all.indexOf(right), g = (k) => `(${'ABCD'[i]}) ${right[k]}`;
    return { q: T(f('en'), f('ms')), a: T(g('en'), g('ms')) };
  };
  const tfFrame = (bank) => (r) => {
    const f = r.pick(bank), showTrue = r.chance();
    const stmt = showTrue ? f[0] : f[1];
    return { q: T(`True or False: ${stmt.en}`, `Betul atau Salah: ${stmt.ms}`), a: showTrue ? T('True', 'Betul') : T(`False — the correct statement is: ${f[0].en}`, `Salah — pernyataan yang betul ialah: ${f[0].ms}`), w: W(f[2]), sp: 's' };
  };
  const spotFrame = (bank) => (r) => {
    const f = r.pick(bank);
    return { q: T(`A student claims: "${f[1].en}" Identify the error and give the correct statement.`, `Seorang murid mendakwa: "${f[1].ms}" Kenal pasti kesilapan itu dan berikan pernyataan yang betul.`), a: f[0], w: W(f[2]), sp: 's' };
  };
  const mcqFrame = (bank, topicEn, topicMs) => (r) => {
    const picks = r.sample(bank, 4), ci = r.int(0, 3);
    const right = picks[ci][0], wrong = picks.filter((_, i) => i !== ci).map((f) => f[1]);
    const o = mc(r, right, wrong);
    return { q: cat(T(`Which of the following statements about ${topicEn} is TRUE?<br>`, `Antara pernyataan berikut tentang ${topicMs}, yang manakah BETUL?<br>`), o.q), a: o.a, w: W(picks[ci][2]), sp: 's' };
  };
  const pickTrueFrame = (bank, k) => (r) => {
    const picks = r.sample(bank, k), ci = r.int(0, k - 1);
    const right = picks[ci][0], wrong = picks.filter((_, i) => i !== ci).map((f) => f[1]);
    const o = mc(r, right, wrong);
    const only = k === 2 ? T('Exactly one of these two statements is correct. Which one', 'Tepat satu daripada dua pernyataan ini betul. Yang manakah') : T('Exactly one of these three statements is correct. Which one', 'Tepat satu daripada tiga pernyataan ini betul. Yang manakah');
    return { q: cat(T(`${only.en}?<br>`, `${only.ms}?<br>`), o.q), a: o.a, w: W(picks[ci][2]), sp: 's' };
  };
  const dualSpotFrame = (bank) => (r) => {
    const [f1, f2] = r.sample(bank, 2);
    return { q: T(`A student made two claims: (a) "${f1[1].en}" (b) "${f2[1].en}" For each, identify the error and give the correct statement.`, `Seorang murid membuat dua dakwaan: (a) "${f1[1].ms}" (b) "${f2[1].ms}" Bagi setiap satu, kenal pasti kesilapan itu dan berikan pernyataan yang betul.`), a: PT([f1[0], f2[0]]), w: W(cat('(a) ', f1[2]), cat('(b) ', f2[2])), sp: 'm' };
  };

  /* =============================================================================================
   * F5-1  VARIATION — shared power-form helpers
   * DV = the five prescribed forms of x-dependence: x, x^2, x^3, sqrt(x), cbrt(x). Using pw.kind lets
   * one family cover several syllabus-prescribed powers/roots at once (a big variety multiplier). */
  const DV = [
    { tex: (x) => x, phEn: '', phMs: '', kind: 'lin' },
    { tex: (x) => `${x}^2`, phEn: 'the square of ', phMs: 'kuasa dua ', kind: 'sq' },
    { tex: (x) => `${x}^3`, phEn: 'the cube of ', phMs: 'kuasa tiga ', kind: 'cb' },
    { tex: (x) => `\\sqrt{${x}}`, phEn: 'the square root of ', phMs: 'punca kuasa dua ', kind: 'sqrt' },
    { tex: (x) => `\\sqrt[3]{${x}}`, phEn: 'the cube root of ', phMs: 'punca kuasa tiga ', kind: 'cbrt' },
  ];
  const dvVal = (kind, x) => (kind === 'lin' ? x : kind === 'sq' ? x * x : kind === 'cb' ? x * x * x : kind === 'sqrt' ? Math.round(Math.sqrt(x)) : Math.round(Math.cbrt(x)));
  const dvX = (r, kind) => (kind === 'sqrt' ? r.pick([4, 9, 16, 25, 36, 49]) : kind === 'cbrt' ? r.pick([1, 8, 27, 64, 125]) : kind === 'cb' ? r.int(2, 6) : kind === 'sq' ? r.int(2, 8) : r.int(2, 9));
  const DVPH = [
    { en: (xp) => `varies directly as ${xp}`, ms: (xp) => `berubah secara langsung dengan ${xp}` },
    { en: (xp) => `is directly proportional to ${xp}`, ms: (xp) => `berkadar langsung dengan ${xp}` },
  ];
  const dvXpEn = (pw) => `${pw.phEn}$x$`;
  const dvXpMs = (pw) => `${pw.phMs}$x$`;
  /* worked-solution helpers for y = k x^n (pw = a DV entry) */
  const pwN = (pw) => ({ lin: 1, sq: 2, cb: 3 }[pw.kind]);
  /** "$k = \dfrac{y}{x^n} = … = k$" from one pair (x, y) */
  const dvK = (pw, x, y) => {
    const X = dvVal(pw.kind, x), k = Fr.make(y, X);
    return `$k = \\dfrac{${y}}{${pw.tex(x)}}${pw.kind === 'lin' ? '' : ` = \\dfrac{${y}}{${X}}`} = ${frT(k)}$`;
  };
  /** "k(x^n) = k × X = y" with k a number (or TeX string) */
  const dvSub = (k, pw, x) => {
    const X = dvVal(pw.kind, x);
    const kv = typeof k === 'number' ? Fr.make(k, 1) : k, kt = frT(kv);
    return `${kt}(${pw.tex(x)})${pw.kind === 'lin' ? '' : ` = ${kt} \\times ${X}`} = ${frT(Fr.mul(kv, Fr.make(X, 1)))}`;
  };

  const DVCTX = [ // linear (n=1) real-life direct-variation contexts: {setup, k-name, x-name, y-name}
    (r) => { const it = r.pick(SPM.bank.items), price = r.int(it.lo, it.hi); return { qEn: `The total cost, RM $C$, of buying $x$ ${it.en} is directly proportional to $x$. One ${it.en1} costs RM${price}.`, qMs: `Jumlah kos, RM $C$, membeli $x$ ${it.ms} berkadar langsung dengan $x$. Satu ${it.ms} berharga RM${price}.`, k: price, xs: 'x', ys: 'C' }; },
    (r) => { const spd = r.pick([40, 50, 60, 80, 90]); return { qEn: `A car travels at a constant speed of ${spd} km/h. The distance travelled, $D$ km, varies directly as the time taken, $t$ hours.`, qMs: `Sebuah kereta bergerak pada kelajuan malar ${spd} km/j. Jarak yang dilalui, $D$ km, berubah secara langsung dengan masa yang diambil, $t$ jam.`, k: spd, xs: 't', ys: 'D' }; },
    (r) => { const wage = r.int(6, 15); return { qEn: `A worker is paid RM${wage} per hour. The total wage, RM $W$, varies directly as the number of hours worked, $h$.`, qMs: `Seorang pekerja dibayar RM${wage} sejam. Jumlah gaji, RM $W$, berubah secara langsung dengan bilangan jam bekerja, $h$.`, k: wage, xs: 'h', ys: 'W' }; },
  ];

  const CONCEPT_DV = [
    [T('If $y$ varies directly as $x$, the graph of $y$ against $x$ is a straight line passing through the origin.', 'Jika $y$ berubah secara langsung dengan $x$, graf $y$ melawan $x$ ialah garis lurus yang melalui asalan.'), T('If $y$ varies directly as $x$, the graph of $y$ against $x$ is a straight line that does not pass through the origin.', 'Jika $y$ berubah secara langsung dengan $x$, graf $y$ melawan $x$ ialah garis lurus yang tidak melalui asalan.'), T('When $x = 0$, $y = k(0) = 0$, so the line $y = kx$ passes through $(0, 0)$.', 'Apabila $x = 0$, $y = k(0) = 0$, jadi garis $y = kx$ melalui $(0, 0)$.')],
    [T('In $y = kx$, the constant $k$ is also the gradient of the graph of $y$ against $x$.', 'Dalam $y = kx$, pemalar $k$ juga ialah kecerunan graf $y$ melawan $x$.'), T('In $y = kx$, the constant $k$ is the $y$-intercept of the graph of $y$ against $x$.', 'Dalam $y = kx$, pemalar $k$ ialah pintasan-$y$ graf $y$ melawan $x$.'), T('$y = kx$ has the form $y = mx + c$ with $m = k$ and $c = 0$: $k$ is the gradient and the $y$-intercept is $0$.', '$y = kx$ berbentuk $y = mx + c$ dengan $m = k$ dan $c = 0$: $k$ ialah kecerunan dan pintasan-$y$ ialah $0$.')],
    [T('If $y$ varies directly as $x$, doubling $x$ doubles $y$.', 'Jika $y$ berubah secara langsung dengan $x$, menggandakan dua $x$ akan menggandakan dua $y$.'), T('If $y$ varies directly as $x$, doubling $x$ leaves $y$ unchanged.', 'Jika $y$ berubah secara langsung dengan $x$, menggandakan dua $x$ tidak mengubah $y$.'), '$k(2x) = 2(kx) = 2y$'],
    [T('If $y$ varies directly as $x^2$, doubling $x$ makes $y$ four times as large.', 'Jika $y$ berubah secara langsung dengan $x^2$, menggandakan dua $x$ menjadikan $y$ empat kali ganda.'), T('If $y$ varies directly as $x^2$, doubling $x$ makes $y$ twice as large.', 'Jika $y$ berubah secara langsung dengan $x^2$, menggandakan dua $x$ menjadikan $y$ dua kali ganda.'), '$k(2x)^2 = 4kx^2 = 4y$'],
    [T('When $y$ varies directly as $x$, the ratio $\\dfrac{y}{x}$ is constant.', 'Apabila $y$ berubah secara langsung dengan $x$, nisbah $\\dfrac{y}{x}$ adalah malar.'), T('When $y$ varies directly as $x$, the product $xy$ is constant.', 'Apabila $y$ berubah secara langsung dengan $x$, hasil darab $xy$ adalah malar.'), T('$y = kx \\Rightarrow \\dfrac{y}{x} = k$, a constant.', '$y = kx \\Rightarrow \\dfrac{y}{x} = k$, iaitu pemalar.')],
    [T('If $y$ varies directly as $x^3$, tripling $x$ makes $y$ 27 times as large.', 'Jika $y$ berubah secara langsung dengan $x^3$, mengganda tigakan $x$ menjadikan $y$ 27 kali ganda.'), T('If $y$ varies directly as $x^3$, tripling $x$ makes $y$ 9 times as large.', 'Jika $y$ berubah secara langsung dengan $x^3$, mengganda tigakan $x$ menjadikan $y$ 9 kali ganda.'), '$k(3x)^3 = 27kx^3 = 27y$'],
    [T('$y = kx + c$ with $c \\neq 0$ is NOT a direct variation.', '$y = kx + c$ dengan $c \\neq 0$ BUKAN suatu variasi langsung.'), T('$y = kx + c$ with $c \\neq 0$ is still a direct variation because it is a straight line.', '$y = kx + c$ dengan $c \\neq 0$ masih suatu variasi langsung kerana ia garis lurus.'), T('When $x = 0$, $y = c \\neq 0$, and $\\dfrac{y}{x}$ is not constant, so it is not of the form $y = kx$.', 'Apabila $x = 0$, $y = c \\neq 0$, dan $\\dfrac{y}{x}$ tidak malar, jadi ia bukan dalam bentuk $y = kx$.')],
    [T('If $y$ varies directly as $x^n$ ($n > 0$), then $y = 0$ when $x = 0$.', 'Jika $y$ berubah secara langsung dengan $x^n$ ($n > 0$), maka $y = 0$ apabila $x = 0$.'), T('If $y$ varies directly as $x^n$ ($n > 0$), $y$ can be any value when $x = 0$.', 'Jika $y$ berubah secara langsung dengan $x^n$ ($n > 0$), $y$ boleh menjadi sebarang nilai apabila $x = 0$.'), T('When $x = 0$, $y = k(0)^n = 0$.', 'Apabila $x = 0$, $y = k(0)^n = 0$.')],
    [T('For $y$ varying directly as $\\sqrt{x}$, $x$ must be non-negative for $y$ to be a real number.', 'Bagi $y$ berubah secara langsung dengan $\\sqrt{x}$, $x$ mestilah tidak negatif supaya $y$ ialah nombor nyata.'), T('For $y$ varying directly as $\\sqrt{x}$, $x$ can be any real number, including negative values.', 'Bagi $y$ berubah secara langsung dengan $\\sqrt{x}$, $x$ boleh menjadi sebarang nombor nyata, termasuk nilai negatif.'), T('No real number squared is negative, so $\\sqrt{x}$ is not real when $x < 0$.', 'Tiada nombor nyata yang kuasa duanya negatif, jadi $\\sqrt{x}$ bukan nombor nyata apabila $x < 0$.')],
    [T('To find $k$ from one data pair, compute $k = \\dfrac{y}{x^n}$.', 'Untuk mencari $k$ daripada satu pasangan data, hitung $k = \\dfrac{y}{x^n}$.'), T('To find $k$ from one data pair, compute $k = y \\times x^n$.', 'Untuk mencari $k$ daripada satu pasangan data, hitung $k = y \\times x^n$.'), '$y = kx^n \\Rightarrow k = \\dfrac{y}{x^n}$'],
    [T('To confirm $y$ varies directly as $x^n$ from a table, check that $\\dfrac{y}{x^n}$ is the same for every row.', 'Untuk mengesahkan $y$ berubah secara langsung dengan $x^n$ daripada suatu jadual, semak bahawa $\\dfrac{y}{x^n}$ adalah sama bagi setiap baris.'), T('To confirm $y$ varies directly as $x^n$ from a table, check that $y - x^n$ is the same for every row.', 'Untuk mengesahkan $y$ berubah secara langsung dengan $x^n$ daripada suatu jadual, semak bahawa $y - x^n$ adalah sama bagi setiap baris.'), T('$y = kx^n \\Rightarrow \\dfrac{y}{x^n} = k$, the same value for every row.', '$y = kx^n \\Rightarrow \\dfrac{y}{x^n} = k$, nilai yang sama bagi setiap baris.')],
    [T('Plotting $y$ against $x^n$ (instead of $x$) gives a straight line through the origin when $y$ varies directly as $x^n$.', 'Memplot $y$ melawan $x^n$ (bukan $x$) memberi garis lurus melalui asalan apabila $y$ berubah secara langsung dengan $x^n$.'), T('Plotting $y$ against $x$ always gives a straight line through the origin, whatever the power $n$ is.', 'Memplot $y$ melawan $x$ sentiasa memberi garis lurus melalui asalan, tanpa mengira kuasa $n$.'), T('With $X = x^n$, $y = kX$ is a straight line through the origin; $y$ against $x$ is a curve when $n \\neq 1$.', 'Dengan $X = x^n$, $y = kX$ ialah garis lurus melalui asalan; $y$ melawan $x$ ialah lengkung apabila $n \\neq 1$.')],
    [T('A direct variation relation $y = kx^n$ ($k \\neq 0$) always passes through the point $(0, 0)$.', 'Hubungan variasi langsung $y = kx^n$ ($k \\neq 0$) sentiasa melalui titik $(0, 0)$.'), T('A direct variation relation $y = kx^n$ may or may not pass through $(0, 0)$, depending on $k$.', 'Hubungan variasi langsung $y = kx^n$ mungkin melalui atau tidak melalui $(0, 0)$, bergantung pada $k$.'), T('When $x = 0$, $y = k(0)^n = 0$ whatever the value of $k$.', 'Apabila $x = 0$, $y = k(0)^n = 0$ walau apa pun nilai $k$.')],
    [T('In a direct variation $y = kx^n$, the constant $k$ can be negative.', 'Dalam variasi langsung $y = kx^n$, pemalar $k$ boleh menjadi negatif.'), T('In a direct variation $y = kx^n$, the constant $k$ must always be positive.', 'Dalam variasi langsung $y = kx^n$, pemalar $k$ mestilah sentiasa positif.'), T('E.g. $y = -3x$: $\\dfrac{y}{x} = -3$ is constant, so it is still a direct variation.', 'Cth. $y = -3x$: $\\dfrac{y}{x} = -3$ adalah malar, jadi ia masih variasi langsung.')],
    [T('If $y$ varies directly as $x^2$, then $x$ varying directly as $y$ is not generally true (unless $n = 1$).', 'Jika $y$ berubah secara langsung dengan $x^2$, maka $x$ berubah secara langsung dengan $y$ tidak semestinya benar (kecuali $n = 1$).'), T('If $y$ varies directly as $x^2$, then $x$ also varies directly as $y$.', 'Jika $y$ berubah secara langsung dengan $x^2$, maka $x$ juga berubah secara langsung dengan $y$.'), T('$y = kx^2 \\Rightarrow x = \\sqrt{\\dfrac{y}{k}}$ (for $x > 0$), so $x$ varies as $\\sqrt{y}$, not as $y$.', '$y = kx^2 \\Rightarrow x = \\sqrt{\\dfrac{y}{k}}$ (bagi $x > 0$), jadi $x$ berubah dengan $\\sqrt{y}$, bukan dengan $y$.')],
  ];

  const dv11_findK = (r) => {
    const pw = r.pick(DV), ph = r.pick(DVPH);
    const k = r.int(2, 6);
    const x1 = dvX(r, pw.kind);
    const x2 = retry(() => { const v = dvX(r, pw.kind); need(v !== x1); return v; });
    const y1 = k * dvVal(pw.kind, x1), y2 = k * dvVal(pw.kind, x2);
    return {
      q: T(`$y$ ${ph.en(dvXpEn(pw))}. When $x = ${x1}$, $y = ${y1}$. Find (a) the equation connecting $y$ and $x$, (b) the value of $y$ when $x = ${x2}$.`,
           `$y$ ${ph.ms(dvXpMs(pw))}. Apabila $x = ${x1}$, $y = ${y1}$. Cari (a) persamaan yang menghubungkan $y$ dengan $x$, (b) nilai $y$ apabila $x = ${x2}$.`),
      a: T(`(a) $y = ${k}${pw.tex('x')}$ (b) $y = ${y2}$`),
      w: W(`$y = k${pw.tex('x')}$`, dvK(pw, x1, y1), `(a) $y = ${k}${pw.tex('x')}$`, `(b) $y = ${dvSub(k, pw, x2)}$`),
      sp: 's',
    };
  };
  const dv11_backward = (r) => {
    const pw = r.pick([DV[0], DV[1], DV[2]]);
    const k = r.int(2, 5);
    const x1 = dvX(r, pw.kind), y1 = k * dvVal(pw.kind, x1);
    const x2 = retry(() => { const v = dvX(r, pw.kind); need(v !== x1); return v; });
    const y2 = k * dvVal(pw.kind, x2);
    return { q: T(`$y$ varies directly as ${dvXpEn(pw)}. Given $y = ${y1}$ when $x = ${x1}$, find the value of $x$ when $y = ${y2}$.`, `$y$ berubah secara langsung dengan ${dvXpMs(pw)}. Diberi $y = ${y1}$ apabila $x = ${x1}$, cari nilai $x$ apabila $y = ${y2}$.`), a: T(`$k = ${k}$; $x = ${pw.kind === 'sq' ? '\\pm ' : ''}${x2}$`), w: W(`$y = k${pw.tex('x')}$`, dvK(pw, x1, y1), `$${y2} = ${k}${pw.tex('x')} \\Rightarrow ${pw.tex('x')} = \\dfrac{${y2}}{${k}} = ${dvVal(pw.kind, x2)}$`, ...(pw.kind === 'lin' ? [] : pw.kind === 'sq' ? [`$x = \\pm\\sqrt{${dvVal(pw.kind, x2)}} = \\pm ${x2}$`] : [`$x = \\sqrt[3]{${dvVal(pw.kind, x2)}} = ${x2}$`])), sp: 's' };
  };
  const dv11_word = (r) => {
    const c = r.pick(DVCTX)(r);
    const x2 = r.int(2, 12);
    return { q: T(`${c.qEn} Write the equation connecting $${c.ys}$ and $${c.xs}$, then find $${c.ys}$ when $${c.xs} = ${x2}$.`, `${c.qMs} Tuliskan persamaan yang menghubungkan $${c.ys}$ dengan $${c.xs}$, kemudian cari $${c.ys}$ apabila $${c.xs} = ${x2}$.`), a: T(`$${c.ys} = ${c.k}${c.xs}$; $${c.ys} = ${c.k * x2}$`), w: W(`$${c.ys} = k${c.xs}$`, T(`$k$ is the fixed rate for one unit of $${c.xs}$: $k = ${c.k}$, so $${c.ys} = ${c.k}${c.xs}$`, `$k$ ialah kadar tetap bagi satu unit $${c.xs}$: $k = ${c.k}$, maka $${c.ys} = ${c.k}${c.xs}$`), `$${c.ys} = ${c.k}(${x2}) = ${c.k * x2}$`), sp: 's' };
  };
  const dv11_multiplier = (r) => {
    const pw = r.pick([DV[0], DV[1], DV[2]]);
    const factor = r.pick([2, 3]);
    const mult = Math.pow(factor, pw.kind === 'lin' ? 1 : pw.kind === 'sq' ? 2 : 3);
    return { q: T(`$y$ varies directly as ${dvXpEn(pw)}. If $x$ is multiplied by ${factor}, by what factor is $y$ multiplied?`, `$y$ berubah secara langsung dengan ${dvXpMs(pw)}. Jika $x$ didarab dengan ${factor}, $y$ didarab dengan faktor berapa?`), a: T(`$${mult}$`), w: W(pw.kind === 'lin' ? `$k(${factor}x) = ${factor}(kx) = ${factor}y$` : `$k(${factor}x)^${pwN(pw)} = ${factor}^${pwN(pw)} \\times kx^${pwN(pw)} = ${mult}y$`), sp: 'xs' };
  };
  const dv11_writeEq = (r) => {
    const pw = r.pick(DV);
    const subjEn = r.pick([['the perimeter $P$ of a square', 'its side $x$'], ['a quantity $y$', 'another quantity $x$']]);
    return { q: T(`Write, in the form $y = kx^{${pw.kind === 'sqrt' ? '1/2' : pw.kind === 'cbrt' ? '1/3' : pw.kind === 'sq' ? '2' : pw.kind === 'cb' ? '3' : '1'}}$, the statement: "$y$ ${DVPH[0].en(dvXpEn(pw))}, where $k$ is a constant."`, `Tulis, dalam bentuk $y = kx^{${pw.kind === 'sqrt' ? '1/2' : pw.kind === 'cbrt' ? '1/3' : pw.kind === 'sq' ? '2' : pw.kind === 'cb' ? '3' : '1'}}$, pernyataan: "$y$ ${DVPH[0].ms(dvXpMs(pw))}, dengan keadaan $k$ ialah pemalar."`), a: T(`$y = k${pw.tex('x')}$`), w: W(`$y \\propto ${pw.tex('x')} \\Rightarrow y = k${pw.tex('x')}$`, ...(pw.kind === 'sqrt' ? ['$x^{1/2} = \\sqrt{x}$'] : pw.kind === 'cbrt' ? ['$x^{1/3} = \\sqrt[3]{x}$'] : [])), sp: 'xs' };
  };
  const dv11_pointGraph = (r) => {
    const k = r.int(2, 6), x1 = r.int(2, 6);
    const y1 = k * x1;
    const fig = S.graph({ xr: [0, x1 + 2, 1], yr: [0, y1 + k, k], series: [{ pts: [[0, 0], [x1, y1]], dotsToo: true }] });
    return { q: T(`The graph shows $y$ against $x$ for a direct variation. It is a straight line through the origin passing through $(${x1}, ${y1})$.<br>${fig}<br>Find the gradient of the line and the equation connecting $y$ and $x$.`, `Graf menunjukkan $y$ melawan $x$ bagi suatu variasi langsung. Ia ialah garis lurus melalui asalan dan melalui $(${x1}, ${y1})$.<br>${fig}<br>Cari kecerunan garis itu dan persamaan yang menghubungkan $y$ dengan $x$.`), a: T(`Gradient $= k = ${k}$; $y = ${k}x$`), w: W(T(`Gradient $= \\dfrac{${y1} - 0}{${x1} - 0} = ${k}$`, `Kecerunan $= \\dfrac{${y1} - 0}{${x1} - 0} = ${k}$`), T(`For $y = kx$, $k$ is the gradient: $y = ${k}x$`, `Bagi $y = kx$, $k$ ialah kecerunan: $y = ${k}x$`)), sp: 's' };
  };
  const dv11_table1gap = (r) => {
    const pw = r.pick([DV[0], DV[1], DV[2]]);
    const k = r.int(2, 4);
    const xs = [1, 2, 3, 4];
    const ys = xs.map((x) => k * dvVal(pw.kind, x));
    const gap = r.int(1, 3);
    const tab = SPM.table([['$x$', ...xs.map(String)], ['$y$', ...ys.map((y, i) => (i === gap ? '' : String(y)))]]);
    return { q: T(`$y$ varies directly as ${dvXpEn(pw)}. The table shows some values of $x$ and $y$.<br>${tab}<br>Find the value of $k$ and the missing value of $y$.`, `$y$ berubah secara langsung dengan ${dvXpMs(pw)}. Jadual menunjukkan beberapa nilai $x$ dan $y$.<br>${tab}<br>Cari nilai $k$ dan nilai $y$ yang tertinggal.`), a: T(`$k = ${k}$; $y = ${ys[gap]}$ when $x = ${xs[gap]}$`, `$k = ${k}$; $y = ${ys[gap]}$ apabila $x = ${xs[gap]}$`), w: W(T(`Use a complete pair, $x = ${xs[0]}$, $y = ${ys[0]}$:`, `Guna pasangan lengkap, $x = ${xs[0]}$, $y = ${ys[0]}$:`), dvK(pw, xs[0], ys[0]), `$y = ${dvSub(k, pw, xs[gap])}$`), sp: 's' };
  };
  const dv11_mcqEq = (r) => {
    const pw = r.pick(DV);
    const right = T(`$y = k${pw.tex('x')}$`);
    const distractors = [T(`$y = \\dfrac{k}{${pw.tex('x')}}$`), T(`$y = k + ${pw.tex('x')}$`), T(`$y = kx${pw.kind === 'lin' ? '^2' : ''}$`)].filter((d) => d.en !== right.en);
    const o = mc(r, right, r.sample(distractors, 3).length === 3 ? r.sample(distractors, 3) : distractors.concat([T('$y = k - x$')]).slice(0, 3));
    return { q: cat(T(`"$y$ ${DVPH[0].en(dvXpEn(pw))}, where $k$ is a nonzero constant." Which equation represents this?<br>`, `"$y$ ${DVPH[0].ms(dvXpMs(pw))}, dengan keadaan $k$ ialah pemalar bukan sifar." Persamaan manakah mewakili ini?<br>`), o.q), a: o.a, w: T(`Direct variation: $y$ equals a constant times the quantity, $y = k${pw.tex('x')}$ (no adding, no dividing).`, `Variasi langsung: $y$ sama dengan pemalar didarab dengan kuantiti itu, $y = k${pw.tex('x')}$ (tiada tambah, tiada bahagi).`), sp: 's' };
  };
  const ge11 = [dv11_findK, dv11_backward, dv11_word, dv11_multiplier, dv11_writeEq, dv11_pointGraph, dv11_table1gap, dv11_mcqEq, tfFrame(CONCEPT_DV), pickTrueFrame(CONCEPT_DV, 2)];

  const dv11_findK_sq = (r) => {
    const pw = r.pick([DV[1], DV[2], DV[3], DV[4]]);
    const k = r.int(2, 5);
    const x1 = dvX(r, pw.kind), x2 = retry(() => { const v = dvX(r, pw.kind); need(v !== x1); return v; });
    const y1 = k * dvVal(pw.kind, x1), y2 = k * dvVal(pw.kind, x2);
    return { q: T(`$y \\propto ${pw.tex('x')}$ and $y = ${y1}$ when $x = ${x1}$. Find $y$ when $x = ${x2}$.`, `$y \\propto ${pw.tex('x')}$ dan $y = ${y1}$ apabila $x = ${x1}$. Cari $y$ apabila $x = ${x2}$.`), a: T(`$k = ${k}$; $y = ${y2}$`), w: W(`$y = k${pw.tex('x')}$`, dvK(pw, x1, y1), `$y = ${dvSub(k, pw, x2)}$`), sp: 's' };
  };
  const dv11_table2gap = (r) => {
    const pw = r.pick(DV);
    const k = r.int(2, 4);
    const xs = pw.kind === 'sqrt' ? r.sample([4, 9, 16, 25, 36], 4).sort((a, b) => a - b) : pw.kind === 'cbrt' ? r.sample([1, 8, 27, 64, 125], 4).sort((a, b) => a - b) : [1, 2, 3, 4];
    const ys = xs.map((x) => k * dvVal(pw.kind, x));
    const gaps = r.sample([0, 1, 2, 3], 2).sort((a, b) => a - b);
    const tab = SPM.table([['$x$', ...xs.map(String)], ['$y$', ...ys.map((y, i) => (gaps.includes(i) ? '' : String(y)))]]);
    const kc = [0, 1, 2, 3].find((i) => !gaps.includes(i));
    const w = W(dvK(pw, xs[kc], ys[kc]), ...gaps.map((i) => `$x = ${xs[i]}$: $y = ${dvSub(k, pw, xs[i])}$`));
    return { w, q: T(`$y$ varies directly as ${dvXpEn(pw)}. Complete the table.<br>${tab}`, `$y$ berubah secara langsung dengan ${dvXpMs(pw)}. Lengkapkan jadual.<br>${tab}`), a: T(`$k = ${k}$; ${gaps.map((i) => `$x = ${xs[i]}$: $y = ${ys[i]}$`).join(', ')}`, `$k = ${k}$; ${gaps.map((i) => `$x = ${xs[i]}$: $y = ${ys[i]}$`).join(', ')}`), sp: 's' };
  };
  const dv11_pctChange = (r) => {
    const pw = r.pick([DV[0], DV[1], DV[2]]);
    const pct = r.pick([10, 20, 25, 50]);
    const pwr = pw.kind === 'lin' ? 1 : pw.kind === 'sq' ? 2 : 3;
    const change = round((Math.pow(1 + pct / 100, pwr) - 1) * 100, 2);
    return { q: T(`$y$ varies directly as ${dvXpEn(pw)}. If $x$ is increased by ${pct}%, find the percentage increase in $y$.`, `$y$ berubah secara langsung dengan ${dvXpMs(pw)}. Jika $x$ ditambah sebanyak ${pct}%, cari peratus pertambahan $y$.`), a: T(`$${change}\\%$`), w: (() => {
      const f = 1 + pct / 100, fp = round(Math.pow(f, pwr), 6), ex = round((fp - 1) * 100, 6);
      return W(T(`New $x = ${n(f)}x$`, `Nilai baharu $x = ${n(f)}x$`), `$y_{\\text{new}} = k(${n(f)}x)${pwr > 1 ? '^' + pwr : ''} = ${n(fp)}kx${pwr > 1 ? '^' + pwr : ''} = ${n(fp)}y$`, T(`Increase $= (${n(fp)} - 1) \\times 100\\% ${ex === change ? '=' : '\\approx'} ${change}\\%$`, `Pertambahan $= (${n(fp)} - 1) \\times 100\\% ${ex === change ? '=' : '\\approx'} ${change}\\%$`));
    })(), sp: 's' };
  };
  const dv11_reverseK = (r) => {
    const pw = r.pick(DV);
    const k = fr(r.int(1, 4), r.pick([1, 2, 3]));
    const x1 = dvX(r, pw.kind);
    const y1 = Fr.mul(k, fr(dvVal(pw.kind, x1), 1));
    need(y1.d === 1);
    const x2 = retry(() => { const v = dvX(r, pw.kind); need(v !== x1); return v; });
    const y2 = Fr.mul(k, fr(dvVal(pw.kind, x2), 1));
    return { q: T(`$y$ varies directly as ${dvXpEn(pw)}. When $x = ${x1}$, $y = ${frT(y1)}$. Find $y$ when $x = ${x2}$.`, `$y$ berubah secara langsung dengan ${dvXpMs(pw)}. Apabila $x = ${x1}$, $y = ${frT(y1)}$. Cari $y$ apabila $x = ${x2}$.`), a: T(`$k = ${frT(k)}$; $y = ${frT(y2)}$`), w: W(`$y = k${pw.tex('x')}$`, dvK(pw, x1, y1.n), `$y = ${dvSub(k, pw, x2)}$`), sp: 's' };
  };
  const dv11_testTable = (r) => {
    const k = r.int(2, 5), pw = r.pick(DV);
    const xs = pw.kind === 'sqrt' ? [1, 4, 9] : pw.kind === 'cbrt' ? [1, 8, 27] : [1, 2, 3]; // roots of 2, 3 are not whole numbers
    const ys = xs.map((x) => k * dvVal(pw.kind, x));
    const tab = SPM.table([['$x$', ...xs.map(String)], ['$y$', ...ys.map(String)]]);
    return { q: T(`The table shows values of $x$ and $y$.<br>${tab}<br>By finding $\\dfrac{y}{${pw.tex('x')}}$ for each pair, show that $y$ varies directly as ${dvXpEn(pw)}, and state the value of $k$.`, `Jadual menunjukkan nilai $x$ dan $y$.<br>${tab}<br>Dengan mencari $\\dfrac{y}{${pw.tex('x')}}$ bagi setiap pasangan, tunjukkan bahawa $y$ berubah secara langsung dengan ${dvXpMs(pw)}, dan nyatakan nilai $k$.`), a: T(`$\\dfrac{y}{${pw.tex('x')}} = ${k}$ for every pair (constant), so $k = ${k}$`, `$\\dfrac{y}{${pw.tex('x')}} = ${k}$ bagi setiap pasangan (malar), maka $k = ${k}$`), w: W(`$${xs.map((x, i) => `\\dfrac{${ys[i]}}{${pw.tex(x)}}`).join(' = ')} = ${k}$`, T(`The ratio is the same for every pair, so $y = ${k}${pw.tex('x')}$.`, `Nisbah itu sama bagi setiap pasangan, maka $y = ${k}${pw.tex('x')}$.`)), sp: 'm' };
  };
  const dv11_wordSq = (r) => {
    const shape = r.pick([T('square floor', 'lantai segi empat sama'), T('square courtyard', 'halaman segi empat sama')]);
    const k = r.int(2, 5);
    const x1 = r.int(2, 6), x2 = retry(() => { const v = r.int(2, 8); need(v !== x1); return v; });
    return { q: T(`The cost, RM $C$, of tiling a ${shape.en} varies directly as the square of its side length, $x$ m, with $C = ${k * x1 * x1}$ when $x = ${x1}$. Find $C$ when $x = ${x2}$.`, `Kos, RM $C$, memasang jubin pada sebuah ${shape.ms} berubah secara langsung dengan kuasa dua panjang sisinya, $x$ m, dengan $C = ${k * x1 * x1}$ apabila $x = ${x1}$. Cari $C$ apabila $x = ${x2}$.`), a: T(`$k = ${k}$; $C = ${k * x2 * x2}$, i.e. RM${k * x2 * x2}`, `$k = ${k}$; $C = ${k * x2 * x2}$, iaitu RM${k * x2 * x2}`), w: W('$C = kx^2$', `$${k * x1 * x1} = k(${x1})^2 \\Rightarrow k = \\dfrac{${k * x1 * x1}}{${x1 * x1}} = ${k}$`, `$C = ${k}(${x2})^2 = ${k} \\times ${x2 * x2} = ${k * x2 * x2}$`), sp: 's' };
  };
  const dv11_multiStage = (r) => {
    const k = r.int(2, 4), pw = r.pick([DV[0], DV[1], DV[2]]);
    const x1 = dvX(r, pw.kind);
    const f1 = r.pick([2, 3]), f2 = r.pick([2, 3].filter((v) => v !== f1));
    const y1 = k * dvVal(pw.kind, x1);
    const x2 = x1 * f1;
    const x3 = x2 * f2;
    const y3 = k * dvVal(pw.kind, x3);
    return { q: T(`$y$ varies directly as ${dvXpEn(pw)}. $y = ${y1}$ when $x = ${x1}$. $x$ is first multiplied by ${f1}, then the new value of $x$ is multiplied by ${f2}. Find the final value of $y$.`, `$y$ berubah secara langsung dengan ${dvXpMs(pw)}. $y = ${y1}$ apabila $x = ${x1}$. $x$ mula-mula didarab dengan ${f1}, kemudian nilai $x$ yang baharu didarab dengan ${f2}. Cari nilai akhir $y$.`), a: T(`$k = ${k}$; final $x = ${x3}$; $y = ${y3}$`, `$k = ${k}$; $x = ${x3}$ akhir; $y = ${y3}$`), w: W(dvK(pw, x1, y1), T(`Final $x = ${x1} \\times ${f1} \\times ${f2} = ${x3}$`, `Nilai akhir $x = ${x1} \\times ${f1} \\times ${f2} = ${x3}$`), `$y = ${dvSub(k, pw, x3)}$`), sp: 'm' };
  };
  const gm11 = [dv11_findK_sq, dv11_table2gap, dv11_pctChange, dv11_reverseK, dv11_testTable, dv11_wordSq, dv11_multiStage, spotFrame(CONCEPT_DV), mcqFrame(CONCEPT_DV, 'direct variation', 'variasi langsung'), pickTrueFrame(CONCEPT_DV, 3)];

  const dv11_determinePower = (r) => {
    const k = r.int(2, 5), pw = r.pick([DV[0], DV[1], DV[2]]);
    const xs = [1, 2, 3, 4];
    const ys = xs.map((x) => k * dvVal(pw.kind, x));
    const tab = SPM.table([['$x$', ...xs.map(String)], ['$y$', ...ys.map(String)]]);
    const pwLabel = pw.kind === 'lin' ? 'x' : pw.kind === 'sq' ? 'x^2' : 'x^3';
    return { q: T(`The table shows values of $x$ and $y$.<br>${tab}<br>By testing $\\dfrac{y}{x}$, $\\dfrac{y}{x^2}$ and $\\dfrac{y}{x^3}$, determine which one is constant, and write the relation between $y$ and $x$.`, `Jadual menunjukkan nilai $x$ dan $y$.<br>${tab}<br>Dengan menguji $\\dfrac{y}{x}$, $\\dfrac{y}{x^2}$ dan $\\dfrac{y}{x^3}$, tentukan yang manakah malar, dan tulis hubungan antara $y$ dengan $x$.`), a: T(`$\\dfrac{y}{${pwLabel}} = ${k}$ is constant, so $y = ${k}${pwLabel}$`, `$\\dfrac{y}{${pwLabel}} = ${k}$ malar, jadi $y = ${k}${pwLabel}$`), w: W(...[1, 2, 3].map((p) => `$\\dfrac{y}{x${p > 1 ? '^' + p : ''}}$: $${xs.map((x, i) => frT(Fr.make(ys[i], Math.pow(x, p)))).join(',\\ ')}$`), T(`Only $\\dfrac{y}{${pwLabel}}$ gives the same value ($${k}$) for every column.`, `Hanya $\\dfrac{y}{${pwLabel}}$ memberi nilai yang sama ($${k}$) bagi setiap lajur.`)), sp: 'm' };
  };
  const dv11_gradientFromGraph = (r) => {
    const k = r.int(2, 5), x1 = r.int(2, 5), pw = r.pick([DV[1], DV[2]]);
    const X1 = dvVal(pw.kind, x1);
    const Y1 = k * X1;
    const pwLabel = pw.kind === 'sq' ? 'x^2' : 'x^3';
    const fig = S.graph({ xr: [0, X1 + 4, Math.max(1, Math.round((X1 + 4) / 5))], yr: [0, Y1 + k, Math.max(1, Math.round((Y1 + k) / 5))], series: [{ pts: [[0, 0], [X1, Y1]], dotsToo: true }], xlabel: T(`$${pwLabel}$`).en });
    return { q: T(`The graph of $y$ against $${pwLabel}$ is a straight line through the origin passing through $(${X1}, ${Y1})$, for a relation $y = k${pwLabel}$.<br>${fig}<br>Find the gradient of the line (the value of $k$), and hence the value of $y$ when $x = ${x1 + 1}$.`, `Graf $y$ melawan $${pwLabel}$ ialah garis lurus melalui asalan dan melalui $(${X1}, ${Y1})$, bagi hubungan $y = k${pwLabel}$.<br>${fig}<br>Cari kecerunan garis itu (nilai $k$), dan seterusnya nilai $y$ apabila $x = ${x1 + 1}$.`), a: T(`$k = ${k}$; $y = ${k * dvVal(pw.kind, x1 + 1)}$`), w: W(T(`Gradient $= \\dfrac{${Y1} - 0}{${X1} - 0} = ${k}$, so $y = ${k}${pwLabel}$`, `Kecerunan $= \\dfrac{${Y1} - 0}{${X1} - 0} = ${k}$, maka $y = ${k}${pwLabel}$`), `$y = ${dvSub(k, pw, x1 + 1)}$`), sp: 'm' };
  };
  const dv11_compareTwo = (r) => {
    const k = r.int(2, 5), pw = r.pick(DV);
    const x1 = dvX(r, pw.kind), x2 = retry(() => { const v = dvX(r, pw.kind); need(v > x1); return v; });
    const y1 = k * dvVal(pw.kind, x1), y2 = k * dvVal(pw.kind, x2);
    return { q: T(`$y$ varies directly as ${dvXpEn(pw)}. Two values are $x = ${x1}, y = ${y1}$ and $x = ${x2}, y = ${y2}$. Show that these are consistent with the same constant $k$, and find $k$.`, `$y$ berubah secara langsung dengan ${dvXpMs(pw)}. Dua nilai ialah $x = ${x1}, y = ${y1}$ dan $x = ${x2}, y = ${y2}$. Tunjukkan bahawa kedua-duanya konsisten dengan pemalar $k$ yang sama, dan cari $k$.`), a: T(`$\\dfrac{${y1}}{${pw.tex(x1)}} = \\dfrac{${y2}}{${pw.tex(x2)}} = ${k}$; $k = ${k}$`, `$\\dfrac{${y1}}{${pw.tex(x1)}} = \\dfrac{${y2}}{${pw.tex(x2)}} = ${k}$; $k = ${k}$`), w: W(dvK(pw, x1, y1), dvK(pw, x2, y2), T(`Both pairs give the same $k$, so they are consistent: $y = ${k}${pw.tex('x')}$.`, `Kedua-dua pasangan memberi $k$ yang sama, jadi kedua-duanya konsisten: $y = ${k}${pw.tex('x')}$.`)), sp: 'm' };
  };
  const dv11_explainDomain = (r) => {
    const pw = r.pick([DV[3], DV[4]]);
    const bad = r.int(-9, -1);
    const cr = Math.cbrt(bad), crEx = Number.isInteger(round(cr, 9)), crT = crEx ? `= ${round(cr, 9)}` : `\\approx ${n(round(cr, 2))}`;
    return { q: T(`$y$ varies directly as ${dvXpEn(pw)}. A student wants to find $y$ when $x = ${bad}$. ${pw.kind === 'sqrt' ? 'Explain why this is not possible using real numbers.' : 'Explain whether this is possible, and find $y$ if $k = 1$.'}`, `$y$ berubah secara langsung dengan ${dvXpMs(pw)}. Seorang murid ingin mencari $y$ apabila $x = ${bad}$. ${pw.kind === 'sqrt' ? 'Terangkan mengapa ini tidak mungkin menggunakan nombor nyata.' : 'Terangkan sama ada ini mungkin, dan cari $y$ jika $k = 1$.'}`), a: pw.kind === 'sqrt' ? T(`$\\sqrt{x}$ has no real value when $x < 0$, so $y$ cannot be found for $x = ${bad}$.`, `$\\sqrt{x}$ tiada nilai nyata apabila $x < 0$, jadi $y$ tidak dapat dicari untuk $x = ${bad}$.`) : T(`Possible: the cube root of a negative number is real; $y = \\sqrt[3]{${bad}} ${crT}$`, `Mungkin: punca kuasa tiga nombor negatif ialah nombor nyata; $y = \\sqrt[3]{${bad}} ${crT}$`), w: pw.kind === 'sqrt' ? T(`Any real number squared is $\\ge 0$, so no real number squared equals $${bad}$: $\\sqrt{${bad}}$ is not real.`, `Kuasa dua sebarang nombor nyata adalah $\\ge 0$, jadi tiada nombor nyata yang kuasa duanya $${bad}$: $\\sqrt{${bad}}$ bukan nombor nyata.`) : W(T('A negative number cubed is negative, so every real number has a real cube root.', 'Kuasa tiga nombor negatif adalah negatif, jadi setiap nombor nyata mempunyai punca kuasa tiga yang nyata.'), crEx ? `$(${round(cr, 9)})^3 = ${bad} \\Rightarrow y = 1 \\times \\sqrt[3]{${bad}} = ${round(cr, 9)}$` : `$y = 1 \\times \\sqrt[3]{${bad}} \\approx ${n(round(cr, 2))}$`), sp: 'm' };
  };
  const dv11_construct = (r) => {
    const pw = r.pick([DV[0], DV[1], DV[2]]);
    return { q: T(`Give an example of your own direct-variation equation of the form $y = k${pw.tex('x')}$ with $k$ a positive integer, and state the value of $y$ it gives when $x = 2$.`, `Berikan contoh persamaan variasi langsung anda sendiri dalam bentuk $y = k${pw.tex('x')}$ dengan $k$ integer positif, dan nyatakan nilai $y$ yang diberikannya apabila $x = 2$.`), a: T(`Any $y = k${pw.tex('x')}$ with $k$ a positive integer, e.g. $k = 3$: $y = ${3 * dvVal(pw.kind, 2)}$ when $x = 2$`, `Sebarang $y = k${pw.tex('x')}$ dengan $k$ integer positif, cth. $k = 3$: $y = ${3 * dvVal(pw.kind, 2)}$ apabila $x = 2$`), w: T(`E.g. $y = 3${pw.tex('x')}$: $y = ${dvSub(3, pw, 2)}$`, `Cth. $y = 3${pw.tex('x')}$: $y = ${dvSub(3, pw, 2)}$`), sp: 'm' };
  };
  const ga11 = [dv11_determinePower, dv11_gradientFromGraph, dv11_compareTwo, dv11_explainDomain, dv11_construct, dualSpotFrame(CONCEPT_DV), mcqFrame(CONCEPT_DV, 'direct variation', 'variasi langsung'), pickTrueFrame(CONCEPT_DV, 3)];

  SPM.extend('F5-1.1', { e: ge11, m: gm11, a: ga11 });

  /* =============================================================================================
   * F5-1.2  INVERSE VARIATION — y = k / x^n, using the same DV power-form list (reused for the
   * denominator power); x is always nonzero (and positive where a root is taken). */
  const ivTex = (pw) => (pw.kind === 'lin' ? '\\dfrac{k}{x}' : `\\dfrac{k}{${pw.tex('x')}}`);
  /** "$k = y \times x^n = … = k$" from one pair, for y = k / x^n (y may be a fraction) */
  const ivK = (pw, x, y) => {
    const X = dvVal(pw.kind, x), yv = typeof y === 'number' ? Fr.make(y, 1) : y;
    return `$k = ${frT(yv)} \\times ${pw.tex(x)}${pw.kind === 'lin' ? '' : ` = ${frT(yv)} \\times ${X}`} = ${frT(Fr.mul(yv, Fr.make(X, 1)))}$`;
  };
  /** "\dfrac{k}{x^n} = … = y" with k a number or fraction */
  const ivSub = (k, pw, x) => {
    const X = dvVal(pw.kind, x), kv = typeof k === 'number' ? Fr.make(k, 1) : k, y = Fr.div(kv, Fr.make(X, 1));
    if (kv.d !== 1) return `${frT(kv)} \\div ${pw.tex(x)}${pw.kind === 'lin' ? '' : ` = ${frT(kv)} \\div ${X}`} = ${frT(y)}`;
    return `\\dfrac{${kv.n}}{${pw.tex(x)}}${pw.kind === 'lin' ? '' : ` = \\dfrac{${kv.n}}{${X}}`} = ${frT(y)}`;
  };
  const IVPH = [
    { en: (xp) => `varies inversely as ${xp}`, ms: (xp) => `berubah secara songsang dengan ${xp}` },
    { en: (xp) => `is inversely proportional to ${xp}`, ms: (xp) => `berkadar songsang dengan ${xp}` },
  ];
  /** pick (x1, x2) whose DV-power values X1, X2 both cleanly divide a small k = m*lcm(X1,X2) */
  const ivPair = (r, kind) => {
    const C = kind === 'sqrt' ? [4, 9, 16, 25] : kind === 'cbrt' ? [1, 8, 27, 64] : kind === 'cb' ? [1, 2, 3, 4] : kind === 'sq' ? [1, 2, 3, 4, 6] : [1, 2, 3, 4, 6, 8, 12];
    const x1 = r.pick(C), x2 = retry(() => { const v = r.pick(C); need(v !== x1); return v; });
    const X1 = dvVal(kind, x1), X2 = dvVal(kind, x2);
    const L = lcm(X1, X2);
    need(L <= 300);
    const m = r.int(1, 3);
    return { x1, x2, X1, X2, k: L * m };
  };
  const IVCTX = [
    (r) => { const w = r.int(4, 10), d = r.pick([6, 8, 9, 12, 18, 24]); return { qEn: `${w} workers can finish painting a school hall in ${d} days, all working at the same constant rate. The number of days needed, $D$, varies inversely as the number of workers, $w$.`, qMs: `${w} orang pekerja boleh menyiapkan pengecatan dewan sekolah dalam ${d} hari, semuanya bekerja pada kadar malar yang sama. Bilangan hari yang diperlukan, $D$, berubah secara songsang dengan bilangan pekerja, $w$.`, k: w * d, kx: `${w} \\times ${d}`, xs: 'w', ys: 'D' }; },
    (r) => { const spd = r.pick([40, 50, 60, 80]), t = r.pick([2, 3, 4, 6]); return { qEn: `A journey of ${spd * t} km is completed at a constant speed. The time taken, $t$ hours, varies inversely as the average speed, $v$ km/h.`, qMs: `Perjalanan sejauh ${spd * t} km dilalui pada kelajuan malar. Masa yang diambil, $t$ jam, berubah secara songsang dengan kelajuan purata, $v$ km/j.`, k: spd * t, kx: `${spd * t}`, xs: 'v', ys: 't' }; },
    (r) => { const total = r.pick([120, 180, 240, 360]), pp = r.pick([2, 3, 4, 6]); return { qEn: `A fixed prize of RM${total} is shared equally among $p$ winners. The amount, RM $A$, each winner receives varies inversely as $p$.`, qMs: `Hadiah tetap RM${total} dikongsi sama rata antara $p$ orang pemenang. Jumlah, RM $A$, yang diterima setiap pemenang berubah secara songsang dengan $p$.`, k: total, kx: `${total}`, xs: 'p', ys: 'A' }; },
  ];
  const CONCEPT_IV = [
    [T('If $y$ varies inversely as $x$, the product $xy$ is constant.', 'Jika $y$ berubah secara songsang dengan $x$, hasil darab $xy$ adalah malar.'), T('If $y$ varies inversely as $x$, the ratio $\\dfrac{y}{x}$ is constant.', 'Jika $y$ berubah secara songsang dengan $x$, nisbah $\\dfrac{y}{x}$ adalah malar.'), T('$y = \\dfrac{k}{x} \\Rightarrow xy = k$, a constant.', '$y = \\dfrac{k}{x} \\Rightarrow xy = k$, iaitu pemalar.')],
    [T('If $y$ varies inversely as $x$, doubling $x$ halves $y$.', 'Jika $y$ berubah secara songsang dengan $x$, menggandakan dua $x$ akan mengurangkan $y$ kepada separuh.'), T('If $y$ varies inversely as $x$, doubling $x$ also doubles $y$.', 'Jika $y$ berubah secara songsang dengan $x$, menggandakan dua $x$ turut menggandakan dua $y$.'), '$\\dfrac{k}{2x} = \\dfrac{1}{2} \\times \\dfrac{k}{x} = \\dfrac{1}{2}y$'],
    [T('For $y = \\dfrac{k}{x}$, $x$ cannot be $0$.', 'Bagi $y = \\dfrac{k}{x}$, $x$ tidak boleh menjadi $0$.'), T('For $y = \\dfrac{k}{x}$, $x$ can be $0$, giving $y = 0$.', 'Bagi $y = \\dfrac{k}{x}$, $x$ boleh menjadi $0$, memberi $y = 0$.'), T('Division by $0$ is not defined, so $\\dfrac{k}{0}$ has no value.', 'Pembahagian dengan $0$ tidak tertakrif, jadi $\\dfrac{k}{0}$ tiada nilai.')],
    [T('If $y$ varies inversely as $x^2$, doubling $x$ makes $y$ a quarter as large.', 'Jika $y$ berubah secara songsang dengan $x^2$, menggandakan dua $x$ menjadikan $y$ satu perempat.'), T('If $y$ varies inversely as $x^2$, doubling $x$ makes $y$ half as large.', 'Jika $y$ berubah secara songsang dengan $x^2$, menggandakan dua $x$ menjadikan $y$ separuh.'), '$\\dfrac{k}{(2x)^2} = \\dfrac{1}{4} \\times \\dfrac{k}{x^2} = \\dfrac{1}{4}y$'],
    [T('The graph of $y$ against $x$ for an inverse variation does not pass through the origin.', 'Graf $y$ melawan $x$ bagi variasi songsang tidak melalui asalan.'), T('The graph of $y$ against $x$ for an inverse variation passes through the origin, like a direct variation.', 'Graf $y$ melawan $x$ bagi variasi songsang melalui asalan, seperti variasi langsung.'), T('$x = 0$ is not allowed and $y = \\dfrac{k}{x}$ is never $0$ (for $k \\neq 0$), so the graph cannot pass through $(0, 0)$.', '$x = 0$ tidak dibenarkan dan $y = \\dfrac{k}{x}$ tidak pernah $0$ (bagi $k \\neq 0$), jadi graf tidak boleh melalui $(0, 0)$.')],
    [T('Plotting $y$ against $\\dfrac{1}{x^n}$ gives a straight line through the origin when $y$ varies inversely as $x^n$.', 'Memplot $y$ melawan $\\dfrac{1}{x^n}$ memberi garis lurus melalui asalan apabila $y$ berubah secara songsang dengan $x^n$.'), T('Plotting $y$ against $x^n$ gives a straight line through the origin when $y$ varies inversely as $x^n$.', 'Memplot $y$ melawan $x^n$ memberi garis lurus melalui asalan apabila $y$ berubah secara songsang dengan $x^n$.'), T('With $X = \\dfrac{1}{x^n}$, $y = kX$ is a straight line through the origin.', 'Dengan $X = \\dfrac{1}{x^n}$, $y = kX$ ialah garis lurus melalui asalan.')],
    [T('To find $k$ from one data pair for $y \\propto \\dfrac{1}{x^n}$, compute $k = yx^n$.', 'Untuk mencari $k$ daripada satu pasangan data bagi $y \\propto \\dfrac{1}{x^n}$, hitung $k = yx^n$.'), T('To find $k$ from one data pair for $y \\propto \\dfrac{1}{x^n}$, compute $k = \\dfrac{y}{x^n}$.', 'Untuk mencari $k$ daripada satu pasangan data bagi $y \\propto \\dfrac{1}{x^n}$, hitung $k = \\dfrac{y}{x^n}$.'), '$y = \\dfrac{k}{x^n} \\Rightarrow k = yx^n$'],
    [T('As $x$ increases (for $x > 0$), $y$ decreases in an inverse variation $y = \\dfrac{k}{x^n}$ with $k > 0$.', 'Apabila $x$ bertambah (bagi $x > 0$), $y$ berkurang dalam variasi songsang $y = \\dfrac{k}{x^n}$ dengan $k > 0$.'), T('As $x$ increases, $y$ also increases in an inverse variation with $k > 0$.', 'Apabila $x$ bertambah, $y$ juga bertambah dalam variasi songsang dengan $k > 0$.'), T('A larger denominator $x^n$ gives a smaller value of $\\dfrac{k}{x^n}$ when $k > 0$.', 'Penyebut $x^n$ yang lebih besar memberi nilai $\\dfrac{k}{x^n}$ yang lebih kecil apabila $k > 0$.')],
    [T('An inverse-square relation $y \\propto \\dfrac{1}{x^2}$ and an inverse relation $y \\propto \\dfrac{1}{x}$ are different: doubling $x$ affects $y$ differently in each.', 'Hubungan songsang-kuasa-dua $y \\propto \\dfrac{1}{x^2}$ dan hubungan songsang $y \\propto \\dfrac{1}{x}$ adalah berbeza: menggandakan dua $x$ memberi kesan berbeza pada $y$ dalam setiap satu.'), T('An inverse-square relation $y \\propto \\dfrac{1}{x^2}$ behaves exactly the same as $y \\propto \\dfrac{1}{x}$.', 'Hubungan songsang-kuasa-dua $y \\propto \\dfrac{1}{x^2}$ berkelakuan sama seperti $y \\propto \\dfrac{1}{x}$.'), T('Doubling $x$: $\\dfrac{1}{x}$ becomes half as large, but $\\dfrac{1}{x^2}$ becomes a quarter.', 'Menggandakan dua $x$: $\\dfrac{1}{x}$ menjadi separuh, tetapi $\\dfrac{1}{x^2}$ menjadi satu perempat.')],
    [T('A "workers and days" inverse model assumes every worker works at the same constant rate.', 'Model songsang "pekerja dan hari" mengandaikan setiap pekerja bekerja pada kadar malar yang sama.'), T('A "workers and days" inverse model works even if workers have very different working rates.', 'Model songsang "pekerja dan hari" tetap berfungsi walaupun pekerja mempunyai kadar kerja yang sangat berbeza.'), T('$D = \\dfrac{k}{w}$ needs the total work $k = wD$ to be fixed, which holds only if every worker does the same amount each day.', '$D = \\dfrac{k}{w}$ memerlukan jumlah kerja $k = wD$ tetap, yang hanya benar jika setiap pekerja membuat jumlah kerja yang sama setiap hari.')],
    [T('To confirm $y$ varies inversely as $x$ from a table, check that $xy$ is the same for every row.', 'Untuk mengesahkan $y$ berubah secara songsang dengan $x$ daripada suatu jadual, semak bahawa $xy$ adalah sama bagi setiap baris.'), T('To confirm $y$ varies inversely as $x$ from a table, check that $x + y$ is the same for every row.', 'Untuk mengesahkan $y$ berubah secara songsang dengan $x$ daripada suatu jadual, semak bahawa $x + y$ adalah sama bagi setiap baris.'), T('$y = \\dfrac{k}{x} \\Rightarrow xy = k$, the same for every row.', '$y = \\dfrac{k}{x} \\Rightarrow xy = k$, sama bagi setiap baris.')],
    [T('For $y$ varying inversely as $\\sqrt{x}$, $x$ must be positive (not just non-negative) since $x$ is also a denominator.', 'Bagi $y$ berubah secara songsang dengan $\\sqrt{x}$, $x$ mestilah positif (bukan sekadar tidak negatif) kerana $x$ juga penyebut.'), T('For $y$ varying inversely as $\\sqrt{x}$, $x$ may be $0$.', 'Bagi $y$ berubah secara songsang dengan $\\sqrt{x}$, $x$ boleh menjadi $0$.'), T('$\\sqrt{x}$ needs $x \\ge 0$, and $\\sqrt{x}$ is in the denominator, so $x \\neq 0$: hence $x > 0$.', '$\\sqrt{x}$ memerlukan $x \\ge 0$, dan $\\sqrt{x}$ ialah penyebut, jadi $x \\neq 0$: maka $x > 0$.')],
  ];

  const iv12_findK = (r) => {
    const pw = r.pick(DV), ph = r.pick(IVPH);
    const { x1, x2, X1, X2, k } = ivPair(r, pw.kind);
    const y1 = k / X1, y2 = k / X2;
    return { q: T(`$y$ ${ph.en(dvXpEn(pw))}. When $x = ${x1}$, $y = ${y1}$. Find (a) the equation connecting $y$ and $x$, (b) the value of $y$ when $x = ${x2}$.`, `$y$ ${ph.ms(dvXpMs(pw))}. Apabila $x = ${x1}$, $y = ${y1}$. Cari (a) persamaan yang menghubungkan $y$ dengan $x$, (b) nilai $y$ apabila $x = ${x2}$.`), a: T(`(a) $y = ${ivTex(pw).replace('k', k)}$ (b) $y = ${y2}$`), w: W(`$y = ${ivTex(pw)}$`, ivK(pw, x1, y1), `(a) $y = ${ivTex(pw).replace('k', k)}$`, `(b) $y = ${ivSub(k, pw, x2)}$`), sp: 's' };
  };
  const iv12_backward = (r) => {
    const pw = r.pick([DV[0], DV[1]]);
    const { x1, x2, X1, X2, k } = ivPair(r, pw.kind);
    const y1 = k / X1, y2 = k / X2;
    return { q: T(`$y$ varies inversely as ${dvXpEn(pw)}. Given $y = ${y1}$ when $x = ${x1}$, find the value of $x$ when $y = ${y2}$.`, `$y$ berubah secara songsang dengan ${dvXpMs(pw)}. Diberi $y = ${y1}$ apabila $x = ${x1}$, cari nilai $x$ apabila $y = ${y2}$.`), a: T(`$k = ${k}$; $x = ${pw.kind === 'sq' ? '\\pm ' : ''}${x2}$`), w: W(`$y = ${ivTex(pw)}$`, ivK(pw, x1, y1), `$${y2} = \\dfrac{${k}}{${pw.tex('x')}} \\Rightarrow ${pw.tex('x')} = \\dfrac{${k}}{${y2}} = ${X2}$`, ...(pw.kind === 'sq' ? [`$x = \\pm\\sqrt{${X2}} = \\pm ${x2}$`] : [])), sp: 's' };
  };
  const iv12_word = (r) => {
    const c = r.pick(IVCTX)(r);
    const x2 = r.pick([2, 3, 4, 6].filter((v) => c.k % v === 0));
    need(x2);
    return { q: T(`${c.qEn} Write the equation connecting $${c.ys}$ and $${c.xs}$, then find $${c.ys}$ when $${c.xs} = ${x2}$.`, `${c.qMs} Tuliskan persamaan yang menghubungkan $${c.ys}$ dengan $${c.xs}$, kemudian cari $${c.ys}$ apabila $${c.xs} = ${x2}$.`), a: T(`$${c.ys} = \\dfrac{${c.k}}{${c.xs}}$; $${c.ys} = ${c.k / x2}$`), w: W(`$${c.ys} = \\dfrac{k}{${c.xs}} \\Rightarrow k = ${c.ys}${c.xs}$`, T(`From the information: $k = ${c.kx}${c.kx === String(c.k) ? '' : ` = ${c.k}`}$`, `Daripada maklumat: $k = ${c.kx}${c.kx === String(c.k) ? '' : ` = ${c.k}`}$`), `$${c.ys} = \\dfrac{${c.k}}{${x2}} = ${c.k / x2}$`), sp: 's' };
  };
  const iv12_multiplier = (r) => {
    const pw = r.pick([DV[0], DV[1], DV[2]]);
    const factor = r.pick([2, 3]);
    const pwr = pw.kind === 'lin' ? 1 : pw.kind === 'sq' ? 2 : 3;
    return { q: T(`$y$ varies inversely as ${dvXpEn(pw)}. If $x$ is multiplied by ${factor}, by what factor is $y$ multiplied?`, `$y$ berubah secara songsang dengan ${dvXpMs(pw)}. Jika $x$ didarab dengan ${factor}, $y$ didarab dengan faktor berapa?`), a: T(`$\\dfrac{1}{${Math.pow(factor, pwr)}}$`), w: W(pwr === 1 ? `$\\dfrac{k}{${factor}x} = \\dfrac{1}{${factor}} \\times \\dfrac{k}{x} = \\dfrac{1}{${factor}}y$` : `$\\dfrac{k}{(${factor}x)^${pwr}} = \\dfrac{1}{${Math.pow(factor, pwr)}} \\times \\dfrac{k}{x^${pwr}} = \\dfrac{1}{${Math.pow(factor, pwr)}}y$`), sp: 'xs' };
  };
  const iv12_writeEq = (r) => {
    const pw = r.pick(DV);
    const expo = pw.kind === 'sqrt' ? '1/2' : pw.kind === 'cbrt' ? '1/3' : pw.kind === 'sq' ? '2' : pw.kind === 'cb' ? '3' : '1';
    return { q: T(`Write, in the form $y = kx^{-${expo}}$, the statement: "$y$ ${IVPH[0].en(dvXpEn(pw))}, where $k$ is a constant."`, `Tulis, dalam bentuk $y = kx^{-${expo}}$, pernyataan: "$y$ ${IVPH[0].ms(dvXpMs(pw))}, dengan keadaan $k$ ialah pemalar."`), a: T(`$y = ${ivTex(pw).replace('k', 'k')}$`), w: W(T(`"Inversely" puts the quantity in the denominator: $y \\propto \\dfrac{1}{${pw.tex('x')}}$, so $y = ${ivTex(pw)}$`, `"Secara songsang" meletakkan kuantiti itu sebagai penyebut: $y \\propto \\dfrac{1}{${pw.tex('x')}}$, maka $y = ${ivTex(pw)}$`), `$kx^{-${expo}} = ${ivTex(pw)}$`), sp: 'xs' };
  };
  const iv12_table1gap = (r) => {
    const pw = r.pick([DV[0], DV[1]]);
    const xs = pw.kind === 'lin' ? [1, 2, 3, 4] : [1, 2, 3, 4];
    const k = pw.kind === 'lin' ? lcm(lcm(xs[0] || 1, xs[1]), lcm(xs[2], xs[3])) * r.int(1, 2) : lcm(lcm(1, 4), lcm(9, 16)) * r.int(1, 2);
    const Xs = xs.map((x) => dvVal(pw.kind, x));
    const ys = Xs.map((X) => k / X);
    need(ys.every((y) => Number.isInteger(y)));
    const gap = r.int(1, 3);
    const tab = SPM.table([['$x$', ...xs.map(String)], ['$y$', ...ys.map((y, i) => (i === gap ? '' : String(y)))]]);
    return { q: T(`$y$ varies inversely as ${dvXpEn(pw)}. The table shows some values of $x$ and $y$.<br>${tab}<br>Find the value of $k$ and the missing value of $y$.`, `$y$ berubah secara songsang dengan ${dvXpMs(pw)}. Jadual menunjukkan beberapa nilai $x$ dan $y$.<br>${tab}<br>Cari nilai $k$ dan nilai $y$ yang tertinggal.`), a: T(`$k = ${k}$; $y = ${ys[gap]}$ when $x = ${xs[gap]}$`, `$k = ${k}$; $y = ${ys[gap]}$ apabila $x = ${xs[gap]}$`), w: W(T(`Use a complete pair, $x = ${xs[0]}$, $y = ${ys[0]}$:`, `Guna pasangan lengkap, $x = ${xs[0]}$, $y = ${ys[0]}$:`), ivK(pw, xs[0], ys[0]), `$y = ${ivSub(k, pw, xs[gap])}$`), sp: 's' };
  };
  const iv12_mcqEq = (r) => {
    const pw = r.pick(DV);
    const right = T(`$y = ${ivTex(pw)}$`);
    const options = [T(`$y = k${pw.tex('x')}$`), T(`$y = k + ${pw.tex('x')}$`), T(`$y = ${pw.tex('x')} - k$`)];
    const o = mc(r, right, options);
    return { q: cat(T(`"$y$ ${IVPH[0].en(dvXpEn(pw))}, where $k$ is a nonzero constant." Which equation represents this?<br>`, `"$y$ ${IVPH[0].ms(dvXpMs(pw))}, dengan keadaan $k$ ialah pemalar bukan sifar." Persamaan manakah mewakili ini?<br>`), o.q), a: o.a, w: T(`Inverse variation: the constant is divided by the quantity, $y = ${ivTex(pw)}$.`, `Variasi songsang: pemalar dibahagi dengan kuantiti itu, $y = ${ivTex(pw)}$.`), sp: 's' };
  };
  const ge12 = [iv12_findK, iv12_backward, iv12_word, iv12_multiplier, iv12_writeEq, iv12_table1gap, iv12_mcqEq, tfFrame(CONCEPT_IV), pickTrueFrame(CONCEPT_IV, 2)];

  const iv12_findK_sq = (r) => {
    const pw = r.pick([DV[1], DV[2], DV[3], DV[4]]);
    const { x1, x2, X1, X2, k } = ivPair(r, pw.kind);
    const y1 = k / X1, y2 = k / X2;
    return { q: T(`$y \\propto \\dfrac{1}{${pw.tex('x')}}$ and $y = ${y1}$ when $x = ${x1}$. Find $y$ when $x = ${x2}$.`, `$y \\propto \\dfrac{1}{${pw.tex('x')}}$ dan $y = ${y1}$ apabila $x = ${x1}$. Cari $y$ apabila $x = ${x2}$.`), a: T(`$k = ${k}$; $y = ${y2}$`), w: W(`$y = ${ivTex(pw)}$`, ivK(pw, x1, y1), `$y = ${ivSub(k, pw, x2)}$`), sp: 's' };
  };
  const iv12_workRate = (r) => {
    const w1 = r.pick([4, 5, 6, 8, 10]), d1 = r.pick([6, 8, 9, 12, 18, 24]);
    const total = w1 * d1;
    const w2 = r.pick([2, 3, 4, 5, 6, 9, 10, 12, 18, 24, 36].filter((v) => total % v === 0 && v !== w1));
    need(w2);
    return { q: T(`${w1} identical machines can complete an order in ${d1} days, all working at the same constant rate. The number of days needed varies inversely as the number of machines used. How many days would ${w2} machines take?`, `${w1} buah mesin yang serupa boleh menyiapkan satu pesanan dalam ${d1} hari, semuanya bekerja pada kadar malar yang sama. Bilangan hari yang diperlukan berubah secara songsang dengan bilangan mesin yang digunakan. Berapa harikah yang diambil oleh ${w2} buah mesin?`), a: T(`${total / w2} days`, `${total / w2} hari`), w: W(T(`$D = \\dfrac{k}{m}$ with $k = ${w1} \\times ${d1} = ${total}$ (machine-days of work)`, `$D = \\dfrac{k}{m}$ dengan $k = ${w1} \\times ${d1} = ${total}$ (mesin-hari kerja)`), T(`$D = \\dfrac{${total}}{${w2}} = ${total / w2}$ days`, `$D = \\dfrac{${total}}{${w2}} = ${total / w2}$ hari`)), sp: 's' };
  };
  const iv12_table2gap = (r) => {
    const pw = r.pick(DV);
    const xs = pw.kind === 'sqrt' ? [1, 4, 9, 16] : pw.kind === 'cbrt' ? [1, 8, 27, 64] : [1, 2, 3, 4];
    const Xs = xs.map((x) => dvVal(pw.kind, x));
    const L = Xs.reduce((a, b) => lcm(a, b), 1);
    need(L <= 300);
    const k = L * r.int(1, 2);
    const ys = Xs.map((X) => k / X);
    const gaps = r.sample([0, 1, 2, 3], 2).sort((a, b) => a - b);
    const tab = SPM.table([['$x$', ...xs.map(String)], ['$y$', ...ys.map((y, i) => (gaps.includes(i) ? '' : String(y)))]]);
    const kc = [0, 1, 2, 3].find((i) => !gaps.includes(i));
    const w = W(ivK(pw, xs[kc], ys[kc]), ...gaps.map((i) => `$x = ${xs[i]}$: $y = ${ivSub(k, pw, xs[i])}$`));
    return { w, q: T(`$y$ varies inversely as ${dvXpEn(pw)}. Complete the table.<br>${tab}`, `$y$ berubah secara songsang dengan ${dvXpMs(pw)}. Lengkapkan jadual.<br>${tab}`), a: T(`$k = ${k}$; ${gaps.map((i) => `$x = ${xs[i]}$: $y = ${ys[i]}$`).join(', ')}`, `$k = ${k}$; ${gaps.map((i) => `$x = ${xs[i]}$: $y = ${ys[i]}$`).join(', ')}`), sp: 's' };
  };
  const iv12_testTable = (r) => {
    const pw = r.pick([DV[0], DV[1]]);
    const xs = [1, 2, 3];
    const Xs = xs.map((x) => dvVal(pw.kind, x));
    const k = Xs.reduce((a, b) => lcm(a, b), 1) * r.int(1, 2);
    const ys = Xs.map((X) => k / X);
    const tab = SPM.table([['$x$', ...xs.map(String)], ['$y$', ...ys.map(String)]]);
    return { q: T(`The table shows values of $x$ and $y$.<br>${tab}<br>By finding $y \\times ${pw.tex('x')}$ for each pair, show that $y$ varies inversely as ${dvXpEn(pw)}, and state the value of $k$.`, `Jadual menunjukkan nilai $x$ dan $y$.<br>${tab}<br>Dengan mencari $y \\times ${pw.tex('x')}$ bagi setiap pasangan, tunjukkan bahawa $y$ berubah secara songsang dengan ${dvXpMs(pw)}, dan nyatakan nilai $k$.`), a: T(`$y \\times ${pw.tex('x')} = ${k}$ for every pair (constant), so $k = ${k}$`, `$y \\times ${pw.tex('x')} = ${k}$ bagi setiap pasangan (malar), maka $k = ${k}$`), w: W(`$${xs.map((x, i) => `${ys[i]} \\times ${pw.tex(x)}`).join(' = ')} = ${k}$`, T(`The product is the same for every pair, so $y = ${ivTex(pw).replace('k', k)}$.`, `Hasil darab itu sama bagi setiap pasangan, maka $y = ${ivTex(pw).replace('k', k)}$.`)), sp: 'm' };
  };
  const iv12_pctChange = (r) => {
    const pw = r.pick([DV[0], DV[1]]);
    const pct = r.pick([20, 25, 50]);
    const pwr = pw.kind === 'lin' ? 1 : 2;
    const change = round((Math.pow(1 + pct / 100, -pwr) - 1) * 100, 2);
    return { q: T(`$y$ varies inversely as ${dvXpEn(pw)}. If $x$ is increased by ${pct}%, find the percentage decrease in $y$.`, `$y$ berubah secara songsang dengan ${dvXpMs(pw)}. Jika $x$ ditambah sebanyak ${pct}%, cari peratus pengurangan $y$.`), a: T(`$${-change}\\%$`), w: (() => {
      const f = Fr.make(100 + pct, 100), g = Fr.make(Math.pow(f.d, pwr), Math.pow(f.n, pwr)), dec = Fr.sub(Fr.make(1, 1), g);
      const ex = round((dec.n / dec.d) * 100, 6);
      return W(`$y_{\\text{new}} = \\dfrac{k}{${pwr === 1 ? `${frT(f)}x` : `\\left(${frT(f)}x\\right)^${pwr}`}} = ${frT(g)} \\times \\dfrac{k}{x${pwr > 1 ? '^' + pwr : ''}} = ${frT(g)}y$`, T(`Decrease $= \\left(1 - ${frT(g)}\\right) \\times 100\\% = ${frT(dec)} \\times 100\\% ${ex === -change ? '=' : '\\approx'} ${-change}\\%$`, `Pengurangan $= \\left(1 - ${frT(g)}\\right) \\times 100\\% = ${frT(dec)} \\times 100\\% ${ex === -change ? '=' : '\\approx'} ${-change}\\%$`));
    })(), sp: 's' };
  };
  const iv12_reverseK = (r) => {
    const pw = r.pick(DV);
    const { x1, x2, X1, X2 } = ivPair(r, pw.kind);
    const k = fr(r.int(1, 4), r.pick([2, 3]));
    const y1 = Fr.div(k, fr(X1, 1)), y2 = Fr.div(k, fr(X2, 1));
    return { q: T(`$y$ varies inversely as ${dvXpEn(pw)}. When $x = ${x1}$, $y = ${frT(y1)}$. Find $y$ when $x = ${x2}$.`, `$y$ berubah secara songsang dengan ${dvXpMs(pw)}. Apabila $x = ${x1}$, $y = ${frT(y1)}$. Cari $y$ apabila $x = ${x2}$.`), a: T(`$k = ${frT(k)}$; $y = ${frT(y2)}$`), w: W(`$y = ${ivTex(pw)}$`, ivK(pw, x1, y1), `$y = ${ivSub(k, pw, x2)}$`), sp: 's' };
  };
  const gm12 = [iv12_findK_sq, iv12_workRate, iv12_table2gap, iv12_testTable, iv12_pctChange, iv12_reverseK, spotFrame(CONCEPT_IV), mcqFrame(CONCEPT_IV, 'inverse variation', 'variasi songsang'), pickTrueFrame(CONCEPT_IV, 3)];

  const iv12_determinePower = (r) => {
    const pw = r.pick([DV[0], DV[1]]);
    const xs = [1, 2, 4];
    const Xs = xs.map((x) => dvVal(pw.kind, x));
    const k = Xs.reduce((a, b) => lcm(a, b), 1) * r.int(1, 2);
    const ys = Xs.map((X) => k / X);
    const tab = SPM.table([['$x$', ...xs.map(String)], ['$y$', ...ys.map(String)]]);
    const pwLabel = pw.kind === 'lin' ? 'x' : 'x^2';
    return { q: T(`The table shows values of $x$ and $y$.<br>${tab}<br>By testing the products $yx$ and $yx^2$, determine whether $y \\propto \\dfrac{1}{x}$ or $y \\propto \\dfrac{1}{x^2}$, and write the relation.`, `Jadual menunjukkan nilai $x$ dan $y$.<br>${tab}<br>Dengan menguji hasil darab $yx$ dan $yx^2$, tentukan sama ada $y \\propto \\dfrac{1}{x}$ atau $y \\propto \\dfrac{1}{x^2}$, dan tulis hubungannya.`), a: T(`$y${pwLabel === 'x' ? 'x' : 'x^2'} = ${k}$ is constant, so $y = \\dfrac{${k}}{${pwLabel}}$`, `$y${pwLabel === 'x' ? 'x' : 'x^2'} = ${k}$ malar, jadi $y = \\dfrac{${k}}{${pwLabel}}$`), w: W(`$yx$: $${xs.map((x, i) => ys[i] * x).join(',\\ ')}$`, `$yx^2$: $${xs.map((x, i) => ys[i] * x * x).join(',\\ ')}$`, T(`Only $y${pwLabel}$ is the same ($${k}$) for every pair, so $y = \\dfrac{${k}}{${pwLabel}}$.`, `Hanya $y${pwLabel}$ yang sama ($${k}$) bagi setiap pasangan, maka $y = \\dfrac{${k}}{${pwLabel}}$.`)), sp: 'm' };
  };
  const iv12_gradientFromGraph = (r) => {
    const pw = r.pick([DV[0], DV[1]]);
    const { x1, X1, k } = ivPair(r, pw.kind);
    const y1 = k / X1;
    const inv = pw.kind === 'lin' ? `\\dfrac{1}{x}` : `\\dfrac{1}{x^2}`;
    const t1 = round(1 / X1, 4);
    const t1T = t1 * X1 === 1 ? n(t1) : `\\dfrac{1}{${X1}}`; // 1/3, 1/6… are not exact as 4-d.p. decimals
    const fig = S.graph({ xr: [0, t1 * 1.4, round(t1 * 1.4 / 4, 4)], yr: [0, y1 * 1.3, round(y1 * 1.3 / 4, 4)], series: [{ pts: [[0, 0], [t1, y1]], dotsToo: true }], xlabel: inv, ylabel: 'y' });
    return { q: T(`The graph of $y$ against $${inv}$ is a straight line through the origin passing through $\\left(${t1T}, ${y1}\\right)$, for a relation $y = k \\times ${inv}$.<br>${fig}<br>Find the gradient of the line (the value of $k$).`, `Graf $y$ melawan $${inv}$ ialah garis lurus melalui asalan dan melalui $\\left(${t1T}, ${y1}\\right)$, bagi hubungan $y = k \\times ${inv}$.<br>${fig}<br>Cari kecerunan garis itu (nilai $k$).`), a: T(`$k = ${k}$`), w: W(T(`Gradient $= \\dfrac{${y1} - 0}{${t1T} - 0} = ${y1} \\times ${X1} = ${k}$`, `Kecerunan $= \\dfrac{${y1} - 0}{${t1T} - 0} = ${y1} \\times ${X1} = ${k}$`)), sp: 'm' };
  };
  const iv12_compareChange = (r) => {
    const which = r.chance();
    const factor = r.pick([2, 3]);
    const m1 = Math.round(100 / factor) / 100, m2 = Math.round(100 / (factor * factor)) / 100;
    return { q: T(`$P$ varies inversely as $x$, and $Q$ varies inversely as $x^2$. If $x$ is multiplied by ${factor}, which quantity decreases by a greater factor, $P$ or $Q$? Justify with the multiplying factors.`, `$P$ berubah secara songsang dengan $x$, dan $Q$ berubah secara songsang dengan $x^2$. Jika $x$ didarab dengan ${factor}, kuantiti manakah berkurang dengan faktor yang lebih besar, $P$ atau $Q$? Wajarkan dengan faktor pendarabnya.`), a: T(`$P$ is multiplied by $\\dfrac{1}{${factor}}$; $Q$ is multiplied by $\\dfrac{1}{${factor * factor}}$. $Q$ decreases by the greater factor.`, `$P$ didarab dengan $\\dfrac{1}{${factor}}$; $Q$ didarab dengan $\\dfrac{1}{${factor * factor}}$. $Q$ berkurang dengan faktor yang lebih besar.`), w: W(`$P = \\dfrac{k_1}{x} \\to \\dfrac{k_1}{${factor}x} = \\dfrac{1}{${factor}}P$`, `$Q = \\dfrac{k_2}{x^2} \\to \\dfrac{k_2}{(${factor}x)^2} = \\dfrac{1}{${factor * factor}}Q$`, `$\\dfrac{1}{${factor * factor}} < \\dfrac{1}{${factor}}$`), sp: 'm' };
  };
  const iv12_explainDomain = (r) => {
    return { q: T(`$y$ varies inversely as $x$. Explain why $x = 0$ cannot be substituted into the equation, even though $y = \\dfrac{k}{x}$ is defined for every other real value of $x$.`, `$y$ berubah secara songsang dengan $x$. Terangkan mengapa $x = 0$ tidak boleh digantikan ke dalam persamaan itu, walaupun $y = \\dfrac{k}{x}$ tertakrif bagi setiap nilai nyata $x$ yang lain.`), a: T(`Division by $0$ is not defined, so $\\dfrac{k}{0}$ has no value; $y$ has no value at $x = 0$.`, `Pembahagian dengan $0$ tidak tertakrif, jadi $\\dfrac{k}{0}$ tiada nilai; $y$ tiada nilai pada $x = 0$.`), w: T('If $\\dfrac{k}{0} = c$, then $c \\times 0 = k$; but $c \\times 0 = 0 \\neq k$ (since $k \\neq 0$), so no such $c$ exists.', 'Jika $\\dfrac{k}{0} = c$, maka $c \\times 0 = k$; tetapi $c \\times 0 = 0 \\neq k$ (kerana $k \\neq 0$), jadi $c$ itu tidak wujud.'), sp: 'm' };
  };
  const iv12_construct = (r) => {
    const pw = r.pick([DV[0], DV[1]]);
    return { q: T(`Give an example of your own inverse-variation equation of the form $y = \\dfrac{k}{${pw.tex('x')}}$ with $k$ a positive integer, and state the value of $y$ it gives when $x = 2$.`, `Berikan contoh persamaan variasi songsang anda sendiri dalam bentuk $y = \\dfrac{k}{${pw.tex('x')}}$ dengan $k$ integer positif, dan nyatakan nilai $y$ yang diberikannya apabila $x = 2$.`), a: T(`Any $y = \\dfrac{k}{${pw.tex('x')}}$ with $k$ a positive integer, e.g. $k = 12$: $y = \\dfrac{12}{${dvVal(pw.kind, 2)}}$ when $x = 2$`, `Sebarang $y = \\dfrac{k}{${pw.tex('x')}}$ dengan $k$ integer positif, cth. $k = 12$: $y = \\dfrac{12}{${dvVal(pw.kind, 2)}}$ apabila $x = 2$`), w: T(`E.g. $y = \\dfrac{12}{${pw.tex('x')}}$: $y = ${ivSub(12, pw, 2)}$`, `Cth. $y = \\dfrac{12}{${pw.tex('x')}}$: $y = ${ivSub(12, pw, 2)}$`), sp: 'm' };
  };
  const ga12 = [iv12_determinePower, iv12_gradientFromGraph, iv12_compareChange, iv12_explainDomain, iv12_construct, dualSpotFrame(CONCEPT_IV), mcqFrame(CONCEPT_IV, 'inverse variation', 'variasi songsang'), pickTrueFrame(CONCEPT_IV, 3)];

  SPM.extend('F5-1.2', { e: ge12, m: gm12, a: ga12 });

  /* =============================================================================================
   * F5-1.3  JOINT AND COMBINED VARIATION — z = k x^aP y^bP (bP in the denominator when invY).
   * Six prescribed combinations cover the syllabus examples (z=kxy, z=kx/z-style, x²/y, xy², …). */
  const JV = [
    { aP: 1, bP: 1, invY: false, phEn: 'varies jointly as $x$ and $y$', phMs: 'berubah secara bersama dengan $x$ dan $y$' },
    { aP: 2, bP: 1, invY: false, phEn: 'varies directly as the square of $x$ and directly as $y$', phMs: 'berubah secara langsung dengan kuasa dua $x$ dan secara langsung dengan $y$' },
    { aP: 1, bP: 2, invY: false, phEn: 'varies directly as $x$ and directly as the square of $y$', phMs: 'berubah secara langsung dengan $x$ dan secara langsung dengan kuasa dua $y$' },
    { aP: 1, bP: 1, invY: true, phEn: 'varies directly as $x$ and inversely as $y$', phMs: 'berubah secara langsung dengan $x$ dan secara songsang dengan $y$' },
    { aP: 2, bP: 1, invY: true, phEn: 'varies directly as the square of $x$ and inversely as $y$', phMs: 'berubah secara langsung dengan kuasa dua $x$ dan secara songsang dengan $y$' },
    { aP: 1, bP: 2, invY: true, phEn: 'varies directly as $x$ and inversely as the square of $y$', phMs: 'berubah secara langsung dengan $x$ dan secara songsang dengan kuasa dua $y$' },
  ];
  const jvXp = (p) => (p === 1 ? '' : `^${p}`);
  const jvSym = (f) => (f.invY ? `\\dfrac{kx${jvXp(f.aP)}}{y${jvXp(f.bP)}}` : `kx${jvXp(f.aP)}y${jvXp(f.bP)}`);
  const jvValK = (f, k, x, y) => (f.invY ? (k * Math.pow(x, f.aP)) / Math.pow(y, f.bP) : k * Math.pow(x, f.aP) * Math.pow(y, f.bP));
  /* worked-solution helpers: substitute numbers (bracketed) or letters into z = k x^a y^b or k x^a / y^b */
  const jvB = (v, p) => (typeof v === 'number' || v.length > 1 ? `(${v})` : v) + jvXp(p);
  const jvNum = (f, k, x, y) => (f.invY ? `\\dfrac{${k}${jvB(x, f.aP)}}{${jvB(y, f.bP).replace(/^\(([^()]+)\)$/, '$1')}}` : `${k}${jvB(x, f.aP)}${jvB(y, f.bP)}`);
  /** lines finding k from one complete row (x, y, z) */
  const jvKLines = (f, x, y, z, zs) => {
    const c = jvValK(f, 1, x, y);
    return [`$${z} = ${jvNum(f, 'k', x, y)} = ${c}k$`, `$k = \\dfrac{${z}}{${c}} = ${z / c}$`];
  };
  const jvEval = (f, k, x, y, zs) => `$${zs || 'z'} = ${jvNum(f, k, x, y)} = ${jvValK(f, k, x, y)}$`;
  /** solve z = … for x (askX) or y, given k, z and the other variable; ± when the unknown is squared */
  const jvSolve = (f, k, z, x, y, askX) => {
    const p = askX ? f.aP : f.bP, v = askX ? x : y, u = askX ? 'x' : 'y', V = Math.pow(v, p);
    const eq = `$${z} = ${askX ? jvNum(f, k, 'x', y) : jvNum(f, k, x, 'y')}$`;
    const top = askX ? (f.invY ? `${z} \\times ${Math.pow(y, f.bP)}` : z) : f.invY ? `${k} \\times ${Math.pow(x, f.aP)}` : z;
    const bot = askX ? (f.invY ? k : `${k} \\times ${Math.pow(y, f.bP)}`) : f.invY ? z : `${k} \\times ${Math.pow(x, f.aP)}`;
    const lines = [eq, `$${u}${jvXp(p)} = \\dfrac{${top}}{${bot}} = ${V}$`];
    if (p === 2) lines.push(`$${u} = \\pm\\sqrt{${V}} = \\pm ${v}$`);
    return lines;
  };
  /** pick (x, y) so that z = k·(x^aP)(y^±bP) is an integer for any integer k */
  const jvPoint = (r) => (f) => {
    if (!f.invY) return { x: r.int(2, 6), y: r.int(2, 6) };
    if (f.aP === 1 && f.bP === 1) { const y = r.int(2, 4); return { x: y * r.int(2, 5), y }; }
    if (f.aP === 2 && f.bP === 1) { const y = r.int(2, 4); return { x: y * r.int(2, 4), y }; }
    const y = r.int(2, 3); return { x: y * y * r.int(2, 5), y };
  };
  const JVCTX = [
    { f: JV[1], en: 'The volume, $V$ cm³, of a cylindrical tin varies directly as the square of its base radius, $r$ cm, and directly as its height, $h$ cm.', ms: 'Isi padu, $V$ cm³, sebuah tin berbentuk silinder berubah secara langsung dengan kuasa dua jejari tapaknya, $r$ cm, dan secara langsung dengan tingginya, $h$ cm.', xs: 'r', ys: 'h', zs: 'V', unit: '\\ \\text{cm}^3' },
    { f: JV[0], en: 'The total catering cost, RM $C$, for an event varies directly as the number of guests, $g$, and directly as the number of days, $d$, the event runs.', ms: 'Jumlah kos katering, RM $C$, bagi suatu majlis berubah secara langsung dengan bilangan tetamu, $g$, dan secara langsung dengan bilangan hari, $d$, majlis itu berlangsung.', xs: 'g', ys: 'd', zs: 'C', unit: '' },
    { f: JV[3], en: 'The time taken, $t$ hours, to transfer a file varies directly as the file size, $s$ GB, and inversely as the connection speed, $v$ GB/h.', ms: 'Masa yang diambil, $t$ jam, untuk memindahkan satu fail berubah secara langsung dengan saiz fail, $s$ GB, dan secara songsang dengan kelajuan sambungan, $v$ GB/j.', xs: 's', ys: 'v', zs: 't', unit: '' },
  ];
  const CONCEPT_JV = [
    [T('For $z = kxy$, if $y$ is held constant, $z$ is directly proportional to $x$.', 'Bagi $z = kxy$, jika $y$ dipegang malar, $z$ berkadar langsung dengan $x$.'), T('For $z = kxy$, if $y$ is held constant, $z$ is inversely proportional to $x$.', 'Bagi $z = kxy$, jika $y$ dipegang malar, $z$ berkadar songsang dengan $x$.'), T('With $y$ fixed, $z = (ky)x$, where $ky$ is a constant.', 'Dengan $y$ tetap, $z = (ky)x$, dengan keadaan $ky$ ialah pemalar.')],
    [T('To find $k$ in a joint/combined variation, one complete data row giving $x$, $y$ and $z$ together is needed.', 'Untuk mencari $k$ dalam variasi bergabung, satu baris data lengkap yang memberi $x$, $y$ dan $z$ bersama diperlukan.'), T('To find $k$ in a joint/combined variation, only the value of $x$ is needed.', 'Untuk mencari $k$ dalam variasi bergabung, hanya nilai $x$ sahaja diperlukan.'), T('E.g. $k = \\dfrac{z}{xy}$ needs the values of $x$, $y$ and $z$ from the same situation.', 'Cth. $k = \\dfrac{z}{xy}$ memerlukan nilai $x$, $y$ dan $z$ daripada situasi yang sama.')],
    [T('For $z \\propto \\dfrac{x^2}{y}$, doubling $x$ while $y$ is fixed makes $z$ four times as large.', 'Bagi $z \\propto \\dfrac{x^2}{y}$, menggandakan dua $x$ dengan $y$ tetap menjadikan $z$ empat kali ganda.'), T('For $z \\propto \\dfrac{x^2}{y}$, doubling $x$ while $y$ is fixed makes $z$ twice as large.', 'Bagi $z \\propto \\dfrac{x^2}{y}$, menggandakan dua $x$ dengan $y$ tetap menjadikan $z$ dua kali ganda.'), '$\\dfrac{k(2x)^2}{y} = 4 \\times \\dfrac{kx^2}{y}$'],
    [T('For $z \\propto \\dfrac{x}{y}$, doubling $y$ while $x$ is fixed halves $z$.', 'Bagi $z \\propto \\dfrac{x}{y}$, menggandakan dua $y$ dengan $x$ tetap mengurangkan $z$ kepada separuh.'), T('For $z \\propto \\dfrac{x}{y}$, doubling $y$ while $x$ is fixed doubles $z$.', 'Bagi $z \\propto \\dfrac{x}{y}$, menggandakan dua $y$ dengan $x$ tetap menggandakan dua $z$.'), '$\\dfrac{kx}{2y} = \\dfrac{1}{2} \\times \\dfrac{kx}{y}$'],
    [T('For $z = kxy$, if both $x$ and $y$ are doubled, $z$ becomes four times as large.', 'Bagi $z = kxy$, jika $x$ dan $y$ kedua-duanya digandakan dua, $z$ menjadi empat kali ganda.'), T('For $z = kxy$, if both $x$ and $y$ are doubled, $z$ becomes twice as large.', 'Bagi $z = kxy$, jika $x$ dan $y$ kedua-duanya digandakan dua, $z$ menjadi dua kali ganda.'), '$k(2x)(2y) = 4kxy$'],
    [T('"$z$ varies directly as $x$ and inversely as $y$" is written $z = \\dfrac{kx}{y}$.', '"$z$ berubah secara langsung dengan $x$ dan secara songsang dengan $y$" ditulis $z = \\dfrac{kx}{y}$.'), T('"$z$ varies directly as $x$ and inversely as $y$" is written $z = k(x - y)$.', '"$z$ berubah secara langsung dengan $x$ dan secara songsang dengan $y$" ditulis $z = k(x - y)$.'), T('"Directly" puts $x$ in the numerator; "inversely" puts $y$ in the denominator.', '"Secara langsung" meletakkan $x$ sebagai pengangka; "secara songsang" meletakkan $y$ sebagai penyebut.')],
    [T('When only $x$ changes in $z = \\dfrac{kx^2}{y}$, every other variable, including $y$, is assumed to stay constant.', 'Apabila hanya $x$ berubah dalam $z = \\dfrac{kx^2}{y}$, setiap pemboleh ubah lain, termasuk $y$, diandaikan kekal malar.'), T('When only $x$ changes in $z = \\dfrac{kx^2}{y}$, $y$ is assumed to change proportionally too.', 'Apabila hanya $x$ berubah dalam $z = \\dfrac{kx^2}{y}$, $y$ diandaikan turut berubah secara berkadar.'), T('To see the effect of $x$ alone, every other variable is held constant.', 'Untuk melihat kesan $x$ sahaja, setiap pemboleh ubah lain dipegang malar.')],
    [T('Using $k$ found from one relation in a different, unrelated relation gives a wrong answer.', 'Menggunakan $k$ yang diperoleh daripada satu hubungan dalam hubungan lain yang tidak berkaitan memberi jawapan yang salah.'), T('The value of $k$ is universal and can be reused across different variation relations.', 'Nilai $k$ adalah universal dan boleh digunakan semula merentasi hubungan variasi yang berbeza.'), T('Each relation has its own constant $k$, found from its own data.', 'Setiap hubungan mempunyai pemalar $k$ sendiri, yang dicari daripada datanya sendiri.')],
    [T('For $z \\propto xy^2$, tripling $y$ while $x$ is fixed makes $z$ nine times as large.', 'Bagi $z \\propto xy^2$, mengganda tigakan $y$ dengan $x$ tetap menjadikan $z$ sembilan kali ganda.'), T('For $z \\propto xy^2$, tripling $y$ while $x$ is fixed makes $z$ three times as large.', 'Bagi $z \\propto xy^2$, mengganda tigakan $y$ dengan $x$ tetap menjadikan $z$ tiga kali ganda.'), '$kx(3y)^2 = 9kxy^2$'],
    [T('In $z = \\dfrac{kx}{y}$, applying the inverse part as if it were direct (multiplying by $y$ instead of dividing) is a common error.', 'Dalam $z = \\dfrac{kx}{y}$, menggunakan bahagian songsang seolah-olah langsung (mendarab dengan $y$ dan bukan membahagi) ialah kesilapan biasa.'), T('In $z = \\dfrac{kx}{y}$, multiplying by $y$ or dividing by $y$ gives the same result.', 'Dalam $z = \\dfrac{kx}{y}$, mendarab dengan $y$ atau membahagi dengan $y$ memberi hasil yang sama.'), T('E.g. $k = 1$, $x = 6$, $y = 2$: $\\dfrac{6}{2} = 3$ but $6 \\times 2 = 12$.', 'Cth. $k = 1$, $x = 6$, $y = 2$: $\\dfrac{6}{2} = 3$ tetapi $6 \\times 2 = 12$.')],
  ];

  const jv13_findK = (r) => {
    const f = r.pick([JV[0], JV[3]]);
    const k = r.int(2, 5);
    const p1 = jvPoint(r)(f), p2 = retry(() => { const p = jvPoint(r)(f); need(p.x !== p1.x || p.y !== p1.y); return p; });
    const z1 = jvValK(f, k, p1.x, p1.y), z2 = jvValK(f, k, p2.x, p2.y);
    return { q: T(`$z$ ${f.phEn}. $z = ${z1}$ when $x = ${p1.x}$ and $y = ${p1.y}$. Find (a) the equation connecting $z$, $x$ and $y$, (b) the value of $z$ when $x = ${p2.x}$ and $y = ${p2.y}$.`, `$z$ ${f.phMs}. $z = ${z1}$ apabila $x = ${p1.x}$ dan $y = ${p1.y}$. Cari (a) persamaan yang menghubungkan $z$, $x$ dan $y$, (b) nilai $z$ apabila $x = ${p2.x}$ dan $y = ${p2.y}$.`), a: T(`(a) $z = ${jvSym(f).replace('k', k)}$ (b) $z = ${z2}$`), w: W(`$z = ${jvSym(f)}$`, ...jvKLines(f, p1.x, p1.y, z1), `(a) $z = ${jvSym(f).replace('k', k)}$`, `(b) ${jvEval(f, k, p2.x, p2.y)}`), sp: 's' };
  };
  const jv13_word = (r) => {
    const c = r.pick(JVCTX);
    const k = r.int(2, 5);
    const p1 = jvPoint(r)(c.f), p2 = retry(() => { const p = jvPoint(r)(c.f); need(p.x !== p1.x || p.y !== p1.y); return p; });
    const z1 = jvValK(c.f, k, p1.x, p1.y), z2 = jvValK(c.f, k, p2.x, p2.y);
    return { q: T(`${c.en} When $${c.xs} = ${p1.x}$ and $${c.ys} = ${p1.y}$, $${c.zs} = ${z1}$. Find (a) the equation connecting $${c.zs}$, $${c.xs}$ and $${c.ys}$, (b) $${c.zs}$ when $${c.xs} = ${p2.x}$ and $${c.ys} = ${p2.y}$.`, `${c.ms} Apabila $${c.xs} = ${p1.x}$ dan $${c.ys} = ${p1.y}$, $${c.zs} = ${z1}$. Cari (a) persamaan yang menghubungkan $${c.zs}$, $${c.xs}$ dan $${c.ys}$, (b) $${c.zs}$ apabila $${c.xs} = ${p2.x}$ dan $${c.ys} = ${p2.y}$.`), a: T(`(a) $${c.zs} = ${jvSym(c.f).replace('k', k).replace('x', c.xs).replace('y', c.ys)}$ (b) $${c.zs} = ${z2}${c.unit}$`), w: W(`$${c.zs} = ${jvSym(c.f).replace('x', c.xs).replace('y', c.ys)}$`, ...jvKLines(c.f, p1.x, p1.y, z1), `(a) $${c.zs} = ${jvSym(c.f).replace('k', k).replace('x', c.xs).replace('y', c.ys)}$`, `(b) ${jvEval(c.f, k, p2.x, p2.y, c.zs)}`), sp: 'm' };
  };
  const jv13_backward = (r) => {
    const f = r.pick([JV[0], JV[3]]);
    const k = r.int(2, 4);
    const p1 = jvPoint(r)(f);
    const z1 = jvValK(f, k, p1.x, p1.y);
    return { q: T(`$z$ ${f.phEn}. $k = ${k}$. Find $z$ when $x = ${p1.x}$ and $y = ${p1.y}$.`, `$z$ ${f.phMs}. $k = ${k}$. Cari $z$ apabila $x = ${p1.x}$ dan $y = ${p1.y}$.`), a: T(`$z = ${z1}$`), w: W(`$z = ${jvSym(f)}$`, jvEval(f, k, p1.x, p1.y)), sp: 'xs' };
  };
  const jv13_writeEq = (r) => {
    const f = r.pick(JV);
    return { q: T(`Write, using a constant $k$, the equation for: "$z$ ${f.phEn}."`, `Tulis, menggunakan pemalar $k$, persamaan bagi: "$z$ ${f.phMs}."`), a: T(`$z = ${jvSym(f)}$`), w: W(T('"Directly" multiplies (numerator); "inversely" divides (denominator).', '"Secara langsung" mendarab (pengangka); "secara songsang" membahagi (penyebut).'), `$z \\propto ${jvSym(f).replace('k', '')} \\Rightarrow z = ${jvSym(f)}$`), sp: 'xs' };
  };
  const jv13_mcqEq = (r) => {
    const f = r.pick(JV);
    const right = T(`$z = ${jvSym(f)}$`);
    const wrongSet = JV.filter((g) => g !== f).map((g) => T(`$z = ${jvSym(g)}$`));
    const o = mc(r, right, r.sample(wrongSet, 3));
    return { q: cat(T(`"$z$ ${f.phEn}, where $k$ is a nonzero constant." Which equation represents this?<br>`, `"$z$ ${f.phMs}, dengan keadaan $k$ ialah pemalar bukan sifar." Persamaan manakah mewakili ini?<br>`), o.q), a: o.a, w: W(T('"Directly" multiplies (numerator); "inversely" divides (denominator); "square" gives the power 2.', '"Secara langsung" mendarab (pengangka); "secara songsang" membahagi (penyebut); "kuasa dua" memberi kuasa 2.'), `$z = ${jvSym(f)}$`), sp: 's' };
  };
  const ge13 = [jv13_findK, jv13_word, jv13_backward, jv13_writeEq, jv13_mcqEq, tfFrame(CONCEPT_JV), pickTrueFrame(CONCEPT_JV, 2)];

  const jv13_findK_hard = (r) => {
    const f = r.pick(JV);
    const k = r.int(2, 5);
    const p1 = jvPoint(r)(f), p2 = retry(() => { const p = jvPoint(r)(f); need(p.x !== p1.x || p.y !== p1.y); return p; });
    const z1 = jvValK(f, k, p1.x, p1.y), z2 = jvValK(f, k, p2.x, p2.y);
    return { q: T(`$z$ ${f.phEn}. $z = ${z1}$ when $x = ${p1.x}$, $y = ${p1.y}$. Find $z$ when $x = ${p2.x}$, $y = ${p2.y}$.`, `$z$ ${f.phMs}. $z = ${z1}$ apabila $x = ${p1.x}$, $y = ${p1.y}$. Cari $z$ apabila $x = ${p2.x}$, $y = ${p2.y}$.`), a: T(`$k = ${k}$; $z = ${z2}$`), w: W(`$z = ${jvSym(f)}$`, ...jvKLines(f, p1.x, p1.y, z1), jvEval(f, k, p2.x, p2.y)), sp: 'm' };
  };
  const jv13_solveOther = (r) => {
    const f = r.pick([JV[0], JV[1], JV[3], JV[4]]);
    const k = r.int(2, 4);
    const p1 = jvPoint(r)(f);
    const z1 = jvValK(f, k, p1.x, p1.y);
    const askX = r.chance();
    return { q: T(`$z$ ${f.phEn}. $k = ${k}$. When $z = ${z1}$ and $${askX ? 'y' : 'x'} = ${askX ? p1.y : p1.x}$, find the value of $${askX ? 'x' : 'y'}$.`, `$z$ ${f.phMs}. $k = ${k}$. Apabila $z = ${z1}$ dan $${askX ? 'y' : 'x'} = ${askX ? p1.y : p1.x}$, cari nilai $${askX ? 'x' : 'y'}$.`), a: T(`$${askX ? 'x' : 'y'} = ${(askX ? f.aP : f.bP) === 2 ? '\\pm ' : ''}${askX ? p1.x : p1.y}$`), w: W(...jvSolve(f, k, z1, p1.x, p1.y, askX)), sp: 'm' };
  };
  const jv13_table = (r) => {
    const f = r.pick([JV[0], JV[3]]);
    const k = r.int(2, 4);
    const rows = [jvPoint(r)(f), jvPoint(r)(f), jvPoint(r)(f)];
    const zs = rows.map((p) => jvValK(f, k, p.x, p.y));
    const gap = r.int(0, 2);
    const tab = SPM.table([['$x$', ...rows.map((p) => String(p.x))], ['$y$', ...rows.map((p) => String(p.y))], ['$z$', ...zs.map((z, i) => (i === gap ? '' : String(z)))]]);
    return { q: T(`$z$ ${f.phEn}. The table shows corresponding values.<br>${tab}<br>Find the value of $k$ and the missing value of $z$.`, `$z$ ${f.phMs}. Jadual menunjukkan nilai-nilai yang berkaitan.<br>${tab}<br>Cari nilai $k$ dan nilai $z$ yang tertinggal.`), a: T(`$k = ${k}$; $z = ${zs[gap]}$`), w: (() => { const kc = gap === 0 ? 1 : 0; return W(`$z = ${jvSym(f)}$`, T(`Use a complete column: $x = ${rows[kc].x}$, $y = ${rows[kc].y}$, $z = ${zs[kc]}$`, `Guna lajur lengkap: $x = ${rows[kc].x}$, $y = ${rows[kc].y}$, $z = ${zs[kc]}$`), ...jvKLines(f, rows[kc].x, rows[kc].y, zs[kc]), jvEval(f, k, rows[gap].x, rows[gap].y)); })(), sp: 'm' };
  };
  const jv13_pctMultiplier = (r) => {
    const f = r.pick(JV);
    const fx = r.pick([2, 3]), fy = r.pick([2, 3]);
    const factorX = Fr.make(Math.pow(fx, f.aP), 1);
    const factorY = f.invY ? Fr.make(1, Math.pow(fy, f.bP)) : Fr.make(Math.pow(fy, f.bP), 1);
    const factor = Fr.mul(factorX, factorY);
    return { q: T(`$z$ ${f.phEn}. If $x$ is multiplied by ${fx} and $y$ is multiplied by ${fy} at the same time, by what factor is $z$ multiplied?`, `$z$ ${f.phMs}. Jika $x$ didarab dengan ${fx} dan $y$ didarab dengan ${fy} pada masa yang sama, $z$ didarab dengan faktor berapa?`), a: T(`$${frT(factor)}$`), w: W(`$${jvNum(f, 'k', `${fx}x`, `${fy}y`)} = ${frT(factor)} \\times ${jvSym(f)}$`, T(`Factor $= ${f.aP > 1 ? `${fx}^${f.aP}` : fx} ${f.invY ? '\\div' : '\\times'} ${f.bP > 1 ? `${fy}^${f.bP}` : fy} = ${frT(factor)}$`, `Faktor $= ${f.aP > 1 ? `${fx}^${f.aP}` : fx} ${f.invY ? '\\div' : '\\times'} ${f.bP > 1 ? `${fy}^${f.bP}` : fy} = ${frT(factor)}$`)), sp: 's' };
  };
  const gm13 = [jv13_findK_hard, jv13_solveOther, jv13_table, jv13_pctMultiplier, spotFrame(CONCEPT_JV), mcqFrame(CONCEPT_JV, 'joint/combined variation', 'variasi bergabung'), pickTrueFrame(CONCEPT_JV, 3)];

  const jv13_twoStage = (r) => {
    const f = r.pick(JV);
    const k = r.int(2, 4);
    const p1 = jvPoint(r)(f);
    const z1 = jvValK(f, k, p1.x, p1.y);
    const fx = r.pick([2, 3]), fy = r.pick([2, 3].filter((v) => v !== fx));
    const x2 = p1.x * fx, y2 = p1.y * fy;
    const z2 = jvValK(f, k, x2, y2);
    return { q: T(`$z$ ${f.phEn}. $z = ${z1}$ when $x = ${p1.x}$ and $y = ${p1.y}$. If $x$ is multiplied by ${fx} and $y$ is multiplied by ${fy}, find the new value of $z$.`, `$z$ ${f.phMs}. $z = ${z1}$ apabila $x = ${p1.x}$ dan $y = ${p1.y}$. Jika $x$ didarab dengan ${fx} dan $y$ didarab dengan ${fy}, cari nilai baharu $z$.`), a: T(`$k = ${k}$; new $x = ${x2}$, new $y = ${y2}$; $z = ${z2}$`, `$k = ${k}$; nilai baharu $x = ${x2}$, nilai baharu $y = ${y2}$; $z = ${z2}$`), w: W(...jvKLines(f, p1.x, p1.y, z1), T(`New $x = ${p1.x} \\times ${fx} = ${x2}$, new $y = ${p1.y} \\times ${fy} = ${y2}$`, `Nilai baharu $x = ${p1.x} \\times ${fx} = ${x2}$, nilai baharu $y = ${p1.y} \\times ${fy} = ${y2}$`), jvEval(f, k, x2, y2)), sp: 'l' };
  };
  const jv13_compareConditions = (r) => {
    const f = r.pick(JV);
    const k = r.int(2, 4);
    const pA = jvPoint(r)(f), pB = retry(() => { const p = jvPoint(r)(f); need(p.x !== pA.x || p.y !== pA.y); return p; });
    const zA = jvValK(f, k, pA.x, pA.y), zB = jvValK(f, k, pB.x, pB.y);
    need(zA !== zB);
    return { q: T(`$z$ ${f.phEn}, with $k = ${k}$. Condition $A$: $x = ${pA.x}$, $y = ${pA.y}$. Condition $B$: $x = ${pB.x}$, $y = ${pB.y}$. Find $z$ under each condition and state which condition gives the larger $z$.`, `$z$ ${f.phMs}, dengan $k = ${k}$. Keadaan $A$: $x = ${pA.x}$, $y = ${pA.y}$. Keadaan $B$: $x = ${pB.x}$, $y = ${pB.y}$. Cari $z$ bagi setiap keadaan dan nyatakan keadaan yang memberi $z$ yang lebih besar.`), a: T(`$z_A = ${zA}$; $z_B = ${zB}$; Condition ${zA > zB ? 'A' : 'B'} gives the larger $z$.`, `$z_A = ${zA}$; $z_B = ${zB}$; Keadaan ${zA > zB ? 'A' : 'B'} memberi $z$ yang lebih besar.`), w: W(`$z_A = ${jvNum(f, k, pA.x, pA.y)} = ${zA}$`, `$z_B = ${jvNum(f, k, pB.x, pB.y)} = ${zB}$`, `$${Math.max(zA, zB)} > ${Math.min(zA, zB)}$`), sp: 'l' };
  };
  const jv13_findFromRow = (r) => {
    const f = r.pick(JV);
    const k = r.int(2, 4);
    const rows = [jvPoint(r)(f), null];
    rows[1] = retry(() => { const p = jvPoint(r)(f); need(p.x !== rows[0].x || p.y !== rows[0].y); return p; });
    const z0 = jvValK(f, k, rows[0].x, rows[0].y);
    const askX = r.chance();
    return { q: T(`$z$ ${f.phEn}. One complete set of values is $x = ${rows[0].x}$, $y = ${rows[0].y}$, $z = ${z0}$. Use this row to find $k$, then find $${askX ? 'x' : 'y'}$ when $z = ${jvValK(f, k, rows[1].x, rows[1].y)}$ and $${askX ? 'y' : 'x'} = ${askX ? rows[1].y : rows[1].x}$.`, `$z$ ${f.phMs}. Satu set nilai lengkap ialah $x = ${rows[0].x}$, $y = ${rows[0].y}$, $z = ${z0}$. Gunakan baris ini untuk mencari $k$, kemudian cari $${askX ? 'x' : 'y'}$ apabila $z = ${jvValK(f, k, rows[1].x, rows[1].y)}$ dan $${askX ? 'y' : 'x'} = ${askX ? rows[1].y : rows[1].x}$.`), a: T(`$k = ${k}$; $${askX ? 'x' : 'y'} = ${(askX ? f.aP : f.bP) === 2 ? '\\pm ' : ''}${askX ? rows[1].x : rows[1].y}$`), w: W(`$z = ${jvSym(f)}$`, ...jvKLines(f, rows[0].x, rows[0].y, z0), ...jvSolve(f, k, jvValK(f, k, rows[1].x, rows[1].y), rows[1].x, rows[1].y, askX)), sp: 'l' };
  };
  const jv13_explain = (r) => {
    const f = r.pick([JV[3], JV[4], JV[5]]);
    return { q: T(`$z$ ${f.phEn}. A student says "since $y$ increases, $z$ must also increase." Explain why this reasoning is wrong, and describe what actually happens to $z$ as $y$ increases (with $x$ fixed).`, `$z$ ${f.phMs}. Seorang murid berkata "oleh sebab $y$ bertambah, $z$ juga mesti bertambah." Terangkan mengapa alasan ini salah, dan huraikan apa yang sebenarnya berlaku kepada $z$ apabila $y$ bertambah (dengan $x$ tetap).`), a: T(`Wrong: $z$ varies inversely as $y$ here, so as $y$ increases, $z$ decreases (with $x$ fixed), not increases.`, `Salah: $z$ berubah secara songsang dengan $y$ di sini, jadi apabila $y$ bertambah, $z$ berkurang (dengan $x$ tetap), bukan bertambah.`), w: W(`$z = ${jvSym(f)}$`, T(`$y$ is in the denominator, e.g. doubling $y$ gives $${jvNum(f, 'k', 'x', '2y')} = \\dfrac{1}{${Math.pow(2, f.bP)}} \\times ${jvSym(f)}$: $z$ becomes smaller.`, `$y$ ialah penyebut, cth. menggandakan dua $y$ memberi $${jvNum(f, 'k', 'x', '2y')} = \\dfrac{1}{${Math.pow(2, f.bP)}} \\times ${jvSym(f)}$: $z$ menjadi lebih kecil.`)), sp: 'm' };
  };
  const ga13 = [jv13_twoStage, jv13_compareConditions, jv13_findFromRow, jv13_explain, dualSpotFrame(CONCEPT_JV), mcqFrame(CONCEPT_JV, 'joint/combined variation', 'variasi bergabung'), pickTrueFrame(CONCEPT_JV, 3)];

  SPM.extend('F5-1.3', { e: ge13, m: gm13, a: ga13 });

  /* =============================================================================================
   * F5-2  MATRICES — shared helpers (entries kept in -9..9; 2x2 inverses only, per syllabus). */
  const M = (rows) => `\\begin{pmatrix} ${rows.map((row) => row.map((v) => (typeof v === 'number' ? n(v) : v)).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
  const rmat = (r, rows, cols, lo, hi) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => r.int(lo, hi)));
  const mmul = (A, B) => A.map((row) => B[0].map((_, j) => sum(row.map((v, k) => v * B[k][j]))));
  const madd = (A, B, s) => A.map((row, i) => row.map((v, j) => v + (s || 1) * B[i][j]));
  const msc = (k, A) => A.map((row) => row.map((v) => k * v));
  const mtrans = (A) => A[0].map((_, j) => A.map((row) => row[j]));
  const zeroMat = (rows, cols) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
  const idMat = (nn) => Array.from({ length: nn }, (_, i) => Array.from({ length: nn }, (_, j) => (i === j ? 1 : 0)));
  const det = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const invTex = (A) => {
    const d = det(A);
    const e = [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]].map((row) => row.map((v) => (d < 0 ? -v : v) + 0));
    return `\\dfrac{1}{${Math.abs(d)}}${M(e)}`;
  };
  const invM = (A) => { const d = det(A); return [[fr(A[1][1], d), fr(-A[0][1], d)], [fr(-A[1][0], d), fr(A[0][0], d)]]; };
  const fracM = (F) => M(F.map((row) => row.map((f) => frT(f))));
  /* ---- worked-solution helpers for matrices */
  const par = SPM.par;
  const adjM = (A) => [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]];
  /** "$\det M = (a)(d) - (b)(c) = … = det$" */
  const detLine = (A, name) => `$${name === '' ? '' : `\\det ${name || 'M'} = `}ad - bc = (${A[0][0]})(${A[1][1]}) - (${A[0][1]})(${A[1][0]}) = ${A[0][0] * A[1][1]} - ${par(A[0][1] * A[1][0])} = ${det(A)}$`;
  /** "$M^{-1} = \dfrac{1}{det}(adj)$", normalised to invTex when det < 0 */
  const invLine = (A, name) => `$${name || 'M'}^{-1} = \\dfrac{1}{${det(A)}}${M(adjM(A))}${det(A) < 0 ? ` = ${invTex(A)}` : ''}$`;
  /** matrix of worked entries: element-wise "a + (b)" or "a - (b)" */
  const ewM = (A, B, op) => M(A.map((row, i) => row.map((v, j) => `${v} ${op} ${par(B[i][j])}`)));
  /** matrix of row-by-column working "(a)(b) + (c)(d)" */
  const mulM = (A, B) => M(A.map((row) => B[0].map((_, j) => row.map((v, k) => `(${v})(${B[k][j]})`).join(' + '))));
  /** solve a single linear equation "expr = c" built by the generators: op '+', '-' or '*' (k·v) */
  const solveLin = (v, op, k, c, val) => (op === '+' ? `$${v} + ${k} = ${c} \\Rightarrow ${v} = ${c} - ${k} = ${val}$` : op === '-' ? `$${v} - ${k} = ${c} \\Rightarrow ${v} = ${c} + ${k} = ${val}$` : `$${lin(k, 0, v)} = ${c} \\Rightarrow ${v} = \\dfrac{${c}}{${k}} = ${val}$`);

  /* -------------------------------------------------------------------------------- F5-2.1 Matrices */
  const CONCEPT_MAT = [
    [T('The order of a matrix is written as (number of rows) $\\times$ (number of columns).', 'Peringkat suatu matriks ditulis sebagai (bilangan baris) $\\times$ (bilangan lajur).'), T('The order of a matrix is written as (number of columns) $\\times$ (number of rows).', 'Peringkat suatu matriks ditulis sebagai (bilangan lajur) $\\times$ (bilangan baris).'), T('E.g. $\\begin{pmatrix} 1 & 2 & 3 \\end{pmatrix}$ has 1 row and 3 columns: order $1 \\times 3$.', 'Cth. $\\begin{pmatrix} 1 & 2 & 3 \\end{pmatrix}$ mempunyai 1 baris dan 3 lajur: peringkat $1 \\times 3$.')],
    [T('The element $a_{23}$ is in row 2, column 3.', 'Unsur $a_{23}$ berada pada baris 2, lajur 3.'), T('The element $a_{23}$ is in row 3, column 2.', 'Unsur $a_{23}$ berada pada baris 3, lajur 2.'), T('In $a_{ij}$ the first subscript is the row and the second is the column.', 'Dalam $a_{ij}$, subskrip pertama ialah baris dan yang kedua ialah lajur.')],
    [T('A square matrix has the same number of rows and columns.', 'Matriks segi empat sama mempunyai bilangan baris dan lajur yang sama.'), T('A square matrix must have all its entries equal.', 'Matriks segi empat sama mesti mempunyai semua unsurnya sama.'), T('"Square" describes the shape (order $n \\times n$); the elements can be any numbers.', '"Segi empat sama" merujuk kepada bentuk (peringkat $n \\times n$); unsurnya boleh sebarang nombor.')],
    [T('A zero matrix has every entry equal to $0$.', 'Matriks sifar mempunyai setiap unsurnya bersamaan $0$.'), T('A zero matrix has a $0$ only in the top-left corner.', 'Matriks sifar hanya mempunyai $0$ di penjuru kiri atas sahaja.'), T('E.g. $O = \\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}$: every element is $0$.', 'Cth. $O = \\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}$: setiap unsur ialah $0$.')],
    [T('An identity matrix is a square matrix with $1$s on the main diagonal and $0$s elsewhere.', 'Matriks identiti ialah matriks segi empat sama dengan $1$ pada pepenjuru utama dan $0$ di tempat lain.'), T('An identity matrix has $1$ in every entry.', 'Matriks identiti mempunyai $1$ pada setiap unsur.'), T('E.g. $I = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$: $1$ on the main diagonal, $0$ elsewhere.', 'Cth. $I = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$: $1$ pada pepenjuru utama, $0$ di tempat lain.')],
    [T('A row matrix has exactly one row (order $1 \\times n$).', 'Matriks baris mempunyai tepat satu baris (peringkat $1 \\times n$).'), T('A row matrix has exactly one column (order $n \\times 1$).', 'Matriks baris mempunyai tepat satu lajur (peringkat $n \\times 1$).'), T('E.g. $\\begin{pmatrix} 4 & -1 & 7 \\end{pmatrix}$ has one row: order $1 \\times 3$.', 'Cth. $\\begin{pmatrix} 4 & -1 & 7 \\end{pmatrix}$ mempunyai satu baris: peringkat $1 \\times 3$.')],
    [T('A column matrix has exactly one column (order $n \\times 1$).', 'Matriks lajur mempunyai tepat satu lajur (peringkat $n \\times 1$).'), T('A column matrix has exactly one row (order $1 \\times n$).', 'Matriks lajur mempunyai tepat satu baris (peringkat $1 \\times n$).'), T('E.g. $\\begin{pmatrix} 4 \\\\ -1 \\end{pmatrix}$ has one column: order $2 \\times 1$.', 'Cth. $\\begin{pmatrix} 4 \\\\ -1 \\end{pmatrix}$ mempunyai satu lajur: peringkat $2 \\times 1$.')],
    [T('Two matrices are equal only if they have the same order AND every corresponding element is equal.', 'Dua matriks adalah sama hanya jika kedua-duanya mempunyai peringkat yang sama DAN setiap unsur yang bersepadan adalah sama.'), T('Two matrices are equal as long as they have the same order, even if some elements differ.', 'Dua matriks adalah sama asalkan peringkatnya sama, walaupun sesetengah unsurnya berbeza.'), T('Equal matrices: the same order and $a_{ij} = b_{ij}$ for every $i$ and $j$.', 'Matriks sama: peringkat yang sama dan $a_{ij} = b_{ij}$ bagi setiap $i$ dan $j$.')],
    [T('Two matrices of different orders can never be equal.', 'Dua matriks yang berlainan peringkat tidak sekali-kali boleh sama.'), T('Two matrices of different orders can be equal if the sum of their entries is equal.', 'Dua matriks yang berlainan peringkat boleh sama jika jumlah unsurnya sama.'), T('With different orders, some position in one matrix has no corresponding element in the other.', 'Dengan peringkat berbeza, sesuatu kedudukan dalam satu matriks tiada unsur yang bersepadan dalam matriks yang lain.')],
    [T('A $1 \\times 1$ matrix is simultaneously a row matrix, a column matrix and a square matrix.', 'Matriks $1 \\times 1$ adalah serentak matriks baris, matriks lajur dan matriks segi empat sama.'), T('A $1 \\times 1$ matrix cannot be called a square matrix.', 'Matriks $1 \\times 1$ tidak boleh dipanggil matriks segi empat sama.'), T('Order $1 \\times 1$: one row, one column, and the number of rows equals the number of columns.', 'Peringkat $1 \\times 1$: satu baris, satu lajur, dan bilangan baris sama dengan bilangan lajur.')],
    [T('The number of elements in an $m \\times n$ matrix is $mn$.', 'Bilangan unsur dalam matriks $m \\times n$ ialah $mn$.'), T('The number of elements in an $m \\times n$ matrix is $m + n$.', 'Bilangan unsur dalam matriks $m \\times n$ ialah $m + n$.'), T('$m$ rows, each with $n$ elements: $mn$ elements (e.g. a $2 \\times 3$ matrix has $6$).', '$m$ baris, setiap satu dengan $n$ unsur: $mn$ unsur (cth. matriks $2 \\times 3$ mempunyai $6$).')],
    [T('In $a_{ij}$, the row number $i$ is written before the column number $j$.', 'Dalam $a_{ij}$, nombor baris $i$ ditulis sebelum nombor lajur $j$.'), T('In $a_{ij}$, the column number $i$ is written before the row number $j$.', 'Dalam $a_{ij}$, nombor lajur $i$ ditulis sebelum nombor baris $j$.'), T('Row first, then column, just like the order "rows $\\times$ columns".', 'Baris dahulu, kemudian lajur, sama seperti peringkat "baris $\\times$ lajur".')],
  ];
  const MTYPES = [
    { key: 'row', en: 'row matrix', ms: 'matriks baris' },
    { key: 'col', en: 'column matrix', ms: 'matriks lajur' },
    { key: 'sq', en: 'square matrix', ms: 'matriks segi empat sama' },
    { key: 'zero', en: 'zero matrix', ms: 'matriks sifar' },
    { key: 'id', en: 'identity matrix', ms: 'matriks identiti' },
  ];
  const mkType = (r, key) => {
    if (key === 'row') return [Array.from({ length: r.int(2, 4) }, () => r.int(-9, 9))];
    if (key === 'col') return Array.from({ length: r.int(2, 4) }, () => [r.int(-9, 9)]);
    if (key === 'sq') return retry(() => { const nn = r.pick([2, 3]); const A = rmat(r, nn, nn, -9, 9); need(!A.every((row, i) => row.every((v, j) => v === (i === j ? 1 : 0))) && !A.every((row) => row.every((v) => v === 0))); return A; });
    if (key === 'zero') return zeroMat(r.pick([2, 3]), r.pick([2, 3]));
    return idMat(r.pick([2, 3]));
  };

  /** why a matrix is of the given type */
  const typeWhy = (A, key) => {
    const o = `$${A.length} \\times ${A[0].length}$`;
    return {
      row: T(`Order ${o}: exactly one row.`, `Peringkat ${o}: tepat satu baris.`),
      col: T(`Order ${o}: exactly one column.`, `Peringkat ${o}: tepat satu lajur.`),
      sq: T(`Order ${o}: the number of rows equals the number of columns (and it is not a zero or identity matrix).`, `Peringkat ${o}: bilangan baris sama dengan bilangan lajur (dan ia bukan matriks sifar atau identiti).`),
      zero: T(`Every element is $0$ (order ${o}).`, `Setiap unsur ialah $0$ (peringkat ${o}).`),
      id: T(`Square (order ${o}) with $1$ on the main diagonal and $0$ elsewhere.`, `Segi empat sama (peringkat ${o}) dengan $1$ pada pepenjuru utama dan $0$ di tempat lain.`),
    }[key];
  };
  const mat21_orderElement = (r) => {
    const rows = r.pick([1, 2, 2, 3, 3]), cols = r.pick([1, 2, 2, 3, 3]);
    const A = rmat(r, rows, cols, -9, 9);
    const i = r.int(0, rows - 1), j = r.int(0, cols - 1);
    const style = r.pick(['order', 'count']);
    if (style === 'order') return { q: T(`$A = ${M(A)}$. State the order of $A$ and the value of the element $a_{${i + 1}${j + 1}}$ (row ${i + 1}, column ${j + 1}).`, `$A = ${M(A)}$. Nyatakan peringkat $A$ dan nilai unsur $a_{${i + 1}${j + 1}}$ (baris ${i + 1}, lajur ${j + 1}).`), a: T(`Order $${rows} \\times ${cols}$; $a_{${i + 1}${j + 1}} = ${A[i][j]}$`, `Peringkat $${rows} \\times ${cols}$; $a_{${i + 1}${j + 1}} = ${A[i][j]}$`), w: W(T(`${rows} row(s) and ${cols} column(s): order $${rows} \\times ${cols}$ (rows first)`, `${rows} baris dan ${cols} lajur: peringkat $${rows} \\times ${cols}$ (baris dahulu)`), T(`Go to row ${i + 1}, then column ${j + 1}: $a_{${i + 1}${j + 1}} = ${A[i][j]}$`, `Pergi ke baris ${i + 1}, kemudian lajur ${j + 1}: $a_{${i + 1}${j + 1}} = ${A[i][j]}$`)), sp: 's' };
    return { q: T(`$A = ${M(A)}$. How many rows and columns does $A$ have, and how many elements does it have in total?`, `$A = ${M(A)}$. Berapakah bilangan baris dan lajur $A$, dan berapakah jumlah bilangan unsurnya?`), a: T(`${rows} row(s), ${cols} column(s); total $${rows * cols}$ elements`, `${rows} baris, ${cols} lajur; jumlah $${rows * cols}$ unsur`), w: T(`Number of elements $= ${rows} \\times ${cols} = ${rows * cols}$`, `Bilangan unsur $= ${rows} \\times ${cols} = ${rows * cols}$`), sp: 's' };
  };
  const mat21_identifyType = (r) => {
    const key = r.pick(['row', 'col', 'sq', 'zero', 'id']);
    const A = mkType(r, key);
    const tname = MTYPES.find((t) => t.key === key);
    return { q: T(`State the type of matrix $${M(A)}$ (row, column, square, zero or identity).`, `Nyatakan jenis matriks $${M(A)}$ (baris, lajur, segi empat sama, sifar atau identiti).`), a: T(SPM.cap(tname.en), SPM.cap(tname.ms)), w: typeWhy(A, key), sp: 'xs' };
  };
  const mat21_mcqType = (r) => {
    const key = r.pick(['row', 'col', 'sq', 'zero', 'id']);
    const A = mkType(r, key);
    const tname = MTYPES.find((t) => t.key === key);
    const others = MTYPES.filter((t) => t.key !== key);
    const right = T(SPM.cap(tname.en), SPM.cap(tname.ms));
    const wrong = r.sample(others, 3).map((t) => T(SPM.cap(t.en), SPM.cap(t.ms)));
    const o = mc(r, right, wrong);
    return { q: cat(T(`$${M(A)}$ is a<br>`, `$${M(A)}$ ialah suatu<br>`), o.q), a: o.a, w: typeWhy(A, key), sp: 's' };
  };
  const mat21_equalOne = (r) => {
    const x = r.int(-6, 9);
    const op = r.pick(['add', 'sub', 'mul']);
    const a1 = r.int(2, 5);
    const c = op === 'add' ? x + r.int(1, 6) : op === 'sub' ? x - r.int(1, 6) : a1 * x;
    const exprEn = op === 'add' ? `x + ${c - x}` : op === 'sub' ? `x - ${x - c}` : `${a1}x`;
    const A = rmat(r, 2, 2, -9, 9);
    const i = r.int(0, 1), j = r.int(0, 1);
    const Asym = A.map((row) => row.slice());
    Asym[i][j] = exprEn;
    const Bnum = A.map((row) => row.slice());
    Bnum[i][j] = c;
    return { q: T(`Given $${M(Asym)} = ${M(Bnum)}$, find the value of $x$.`, `Diberi $${M(Asym)} = ${M(Bnum)}$, cari nilai $x$.`), a: T(`$x = ${x}$`), w: W(T(`Corresponding elements (row ${i + 1}, column ${j + 1}) are equal:`, `Unsur yang bersepadan (baris ${i + 1}, lajur ${j + 1}) adalah sama:`), solveLin('x', op === 'add' ? '+' : op === 'sub' ? '-' : '*', op === 'add' ? c - x : op === 'sub' ? x - c : a1, c, x)), sp: 's' };
  };
  const mat21_represent = (r) => {
    const rowLabels = r.sample(SPM.bank.foods, 2);
    const colLabels = r.sample(SPM.bank.places, 3);
    const A = rmat(r, 2, 3, 0, 40);
    const rowsTxt = (lang) => rowLabels.map((f) => f[lang]).join(', ');
    const colsTxt = (lang) => colLabels.map((p) => p[lang]).join(', ');
    return { q: T(`The number of units sold of two items (rows: ${rowsTxt('en')}) at three branches (columns: ${colsTxt('en')}) is given by the matrix $${M(A)}$. State the order of this matrix and the number of ${rowLabels[1].en} sold at ${colLabels[2].en}.`, `Bilangan unit dua barang yang dijual (baris: ${rowsTxt('ms')}) di tiga cawangan (lajur: ${colsTxt('ms')}) diberikan oleh matriks $${M(A)}$. Nyatakan peringkat matriks ini dan bilangan ${rowLabels[1].ms} yang dijual di ${colLabels[2].ms}.`), a: T(`Order $2 \\times 3$; $${A[1][2]}$`, `Peringkat $2 \\times 3$; $${A[1][2]}$`), w: W(T('2 rows (items) and 3 columns (branches): order $2 \\times 3$', '2 baris (barang) dan 3 lajur (cawangan): peringkat $2 \\times 3$'), T(`${rowLabels[1].en} is row 2 and ${colLabels[2].en} is column 3: $a_{23} = ${A[1][2]}$`, `${rowLabels[1].ms} ialah baris 2 dan ${colLabels[2].ms} ialah lajur 3: $a_{23} = ${A[1][2]}$`)), sp: 's' };
  };
  const mat21_writeMatrix = (r) => {
    const items = r.sample(SPM.bank.items, 3);
    const names = r.names(2);
    const A = rmat(r, 2, 3, 1, 20);
    const rowsTxt = (lang) => names.join(', ');
    const colsTxt = (lang) => items.map((it) => it[lang]).join(', ');
    return { q: T(`${names[0]} and ${names[1]} each bought some ${colsTxt('en')}. ${names[0]} bought ${A[0].join(', ')} respectively; ${names[1]} bought ${A[1].join(', ')} respectively. Represent this information as a $2 \\times 3$ matrix, with rows ${rowsTxt('en')} and columns ${colsTxt('en')}.`, `${names[0]} dan ${names[1]} masing-masing membeli beberapa ${colsTxt('ms')}. ${names[0]} membeli ${A[0].join(', ')} masing-masing; ${names[1]} membeli ${A[1].join(', ')} masing-masing. Wakilkan maklumat ini sebagai matriks $2 \\times 3$, dengan baris ${rowsTxt('ms')} dan lajur ${colsTxt('ms')}.`), a: T(`$${M(A)}$`), w: W(T(`Row 1 (${names[0]}): $${A[0].join(',\\ ')}$; row 2 (${names[1]}): $${A[1].join(',\\ ')}$`, `Baris 1 (${names[0]}): $${A[0].join(',\\ ')}$; baris 2 (${names[1]}): $${A[1].join(',\\ ')}$`), T('Each column is one item, in the order given.', 'Setiap lajur ialah satu barang, mengikut susunan yang diberi.')), sp: 's' };
  };
  const mat21_writeSpecial = (r) => {
    const kind = r.pick(['zero23', 'zero32', 'id2', 'id3']);
    const specs = { zero23: [T('a $2 \\times 3$ zero matrix', 'matriks sifar $2 \\times 3$'), zeroMat(2, 3)], zero32: [T('a $3 \\times 2$ zero matrix', 'matriks sifar $3 \\times 2$'), zeroMat(3, 2)], id2: [T('the $2 \\times 2$ identity matrix', 'matriks identiti $2 \\times 2$'), idMat(2)], id3: [T('the $3 \\times 3$ identity matrix', 'matriks identiti $3 \\times 3$'), idMat(3)] };
    const [label, A] = specs[kind];
    return { q: T(`Write down ${label.en}.`, `Tulis ${label.ms}.`), a: T(`$${M(A)}$`), w: kind.startsWith('zero') ? T(`A zero matrix has every element $0$; order $${A.length} \\times ${A[0].length}$ means ${A.length} rows and ${A[0].length} columns.`, `Matriks sifar mempunyai setiap unsur $0$; peringkat $${A.length} \\times ${A[0].length}$ bermaksud ${A.length} baris dan ${A[0].length} lajur.`) : T('The identity matrix has $1$ on the main diagonal (top left to bottom right) and $0$ elsewhere.', 'Matriks identiti mempunyai $1$ pada pepenjuru utama (kiri atas ke kanan bawah) dan $0$ di tempat lain.'), sp: 'xs' };
  };
  const ge21 = [mat21_orderElement, mat21_identifyType, mat21_mcqType, mat21_equalOne, mat21_represent, mat21_writeMatrix, mat21_writeSpecial, tfFrame(CONCEPT_MAT), pickTrueFrame(CONCEPT_MAT, 2)];

  const mat21_equalTwo = (r) => {
    const x = r.int(-6, 9), y = r.int(-6, 9);
    const size = r.pick(['col2', 'col3', 'row3']);
    const ops = r.shuffle(['+', '-', '*']).slice(0, 2);
    const build = (v, op, k) => (op === '+' ? `${v} + ${k}` : op === '-' ? `${v} - ${k}` : `${k}${v}`);
    const kx = r.int(1, 4), ky = r.int(1, 4);
    const cx = ops[0] === '+' ? x + kx : ops[0] === '-' ? x - kx : kx * x;
    const cy = ops[1] === '+' ? y + ky : ops[1] === '-' ? y - ky : ky * y;
    const exprX = build('x', ops[0], kx), exprY = build('y', ops[1], ky);
    let Asym, Bnum;
    if (size === 'col2') { Asym = [[exprX], [exprY]]; Bnum = [[cx], [cy]]; }
    else if (size === 'row3') { const extra = r.int(-9, 9); Asym = [[exprX, extra, exprY]]; Bnum = [[cx, extra, cy]]; }
    else { const extra1 = r.int(-9, 9), extra2 = r.int(-9, 9); Asym = [[exprX, extra1], [extra2, exprY]]; Bnum = [[cx, extra1], [extra2, cy]]; }
    return { q: T(`Given $${M(Asym)} = ${M(Bnum)}$, find the values of $x$ and $y$.`, `Diberi $${M(Asym)} = ${M(Bnum)}$, cari nilai $x$ dan $y$.`), a: T(`$x = ${x}$, $y = ${y}$`), w: W(T('Equate corresponding elements:', 'Samakan unsur yang bersepadan:'), solveLin('x', ops[0], kx, cx, x), solveLin('y', ops[1], ky, cy, y)), sp: 's' };
  };
  const mat21_representQuestion = (r) => {
    const rowLabels = r.sample(SPM.bank.fruits, 2);
    const colLabels = r.sample(SPM.bank.places, 2);
    const A = rmat(r, 2, 2, 2, 30);
    return { q: T(`The price (RM per kg) of two fruits (rows: ${rowLabels[0].en}, ${rowLabels[1].en}) at two markets (columns: ${colLabels[0].en}, ${colLabels[1].en}) is $P = ${M(A)}$. (a) State the order of $P$. (b) Which market sells ${rowLabels[0].en} cheaper? (c) State the element that represents the price of ${rowLabels[1].en} at ${colLabels[1].en}.`, `Harga (RM sekilogram) dua jenis buah (baris: ${rowLabels[0].ms}, ${rowLabels[1].ms}) di dua pasar (lajur: ${colLabels[0].ms}, ${colLabels[1].ms}) ialah $P = ${M(A)}$. (a) Nyatakan peringkat $P$. (b) Pasar manakah menjual ${rowLabels[0].ms} lebih murah? (c) Nyatakan unsur yang mewakili harga ${rowLabels[1].ms} di ${colLabels[1].ms}.`), a: PT([T(`$2 \\times 2$`), A[0][0] === A[0][1] ? T('Neither: the price is the same at both markets', 'Tiada: harganya sama di kedua-dua pasar') : T(A[0][0] < A[0][1] ? colLabels[0].en : colLabels[1].en, A[0][0] < A[0][1] ? colLabels[0].ms : colLabels[1].ms), T(`$p_{22} = ${A[1][1]}$`)]), w: W(T('(a) 2 rows (fruits), 2 columns (markets)', '(a) 2 baris (buah), 2 lajur (pasar)'), T(`(b) Row 1: $p_{11} = ${A[0][0]}$, $p_{12} = ${A[0][1]}$ — compare the two prices of ${rowLabels[0].en}`, `(b) Baris 1: $p_{11} = ${A[0][0]}$, $p_{12} = ${A[0][1]}$ — bandingkan dua harga ${rowLabels[0].ms}`), T(`(c) ${rowLabels[1].en} is row 2 and ${colLabels[1].en} is column 2: $p_{22} = ${A[1][1]}$`, `(c) ${rowLabels[1].ms} ialah baris 2 dan ${colLabels[1].ms} ialah lajur 2: $p_{22} = ${A[1][1]}$`)), sp: 'm' };
  };
  const mat21_identityTest = (r) => {
    const nn = r.pick([2, 3]);
    const isId = r.chance();
    const A = isId ? idMat(nn) : retry(() => { const B = idMat(nn); const i = r.int(0, nn - 1), j = r.int(0, nn - 1); B[i][j] = r.pick([2, -1, 3, 5]); return B; });
    return { q: T(`True or False: $${M(A)}$ is the $${nn} \\times ${nn}$ identity matrix.`, `Betul atau Salah: $${M(A)}$ ialah matriks identiti $${nn} \\times ${nn}$.`), a: isId ? T('True', 'Betul') : T(`False — the identity matrix must have $1$s on the diagonal and $0$s elsewhere.`, `Salah — matriks identiti mesti mempunyai $1$ pada pepenjuru dan $0$ di tempat lain.`), w: (() => {
      if (isId) return T(`$1$ on every main-diagonal position and $0$ everywhere else, so it is the $${nn} \\times ${nn}$ identity matrix.`, `$1$ pada setiap kedudukan pepenjuru utama dan $0$ di tempat lain, jadi ia ialah matriks identiti $${nn} \\times ${nn}$.`);
      let bi = 0, bj = 0;
      A.forEach((row, i) => row.forEach((v, j) => { if (v !== (i === j ? 1 : 0)) { bi = i; bj = j; } }));
      return T(`$a_{${bi + 1}${bj + 1}} = ${A[bi][bj]}$, but it should be $${bi === bj ? 1 : 0}$ (${bi === bj ? 'main diagonal' : 'off the diagonal'}).`, `$a_{${bi + 1}${bj + 1}} = ${A[bi][bj]}$, tetapi sepatutnya $${bi === bj ? 1 : 0}$ (${bi === bj ? 'pepenjuru utama' : 'luar pepenjuru'}).`);
    })(), sp: 's' };
  };
  const mat21_compatTF = (r) => {
    const A = rmat(r, r.pick([2, 3]), r.pick([2, 3]), -9, 9);
    const canEqual = r.chance();
    const bRows = canEqual ? A.length : (A.length === 2 ? 3 : 2);
    const bCols = canEqual ? A[0].length : (A[0].length === 2 ? 3 : 2);
    const B = rmat(r, bRows, bCols, -9, 9);
    return { q: T(`$A$ has order $${A.length} \\times ${A[0].length}$ and $B$ has order $${B.length} \\times ${B[0].length}$. Can $A$ possibly equal $B$? Explain.`, `$A$ berperingkat $${A.length} \\times ${A[0].length}$ dan $B$ berperingkat $${B.length} \\times ${B[0].length}$. Bolehkah $A$ sama dengan $B$? Terangkan.`), a: canEqual ? T(`Possibly — both have order $${A.length} \\times ${A[0].length}$, so they could be equal if every corresponding element matches.`, `Mungkin — kedua-duanya berperingkat $${A.length} \\times ${A[0].length}$, jadi kedua-duanya boleh sama jika setiap unsur yang bersepadan sepadan.`) : T(`No — $A$ and $B$ have different orders, so they can never be equal.`, `Tidak — $A$ dan $B$ mempunyai peringkat yang berbeza, jadi kedua-duanya tidak sekali-kali boleh sama.`), w: T('Equal matrices must have the same order and equal corresponding elements; compare the orders first.', 'Matriks yang sama mesti mempunyai peringkat yang sama dan unsur bersepadan yang sama; bandingkan peringkat dahulu.'), sp: 'm' };
  };
  const gm21 = [mat21_equalTwo, mat21_representQuestion, mat21_identityTest, mat21_compatTF, spotFrame(CONCEPT_MAT), mcqFrame(CONCEPT_MAT, 'matrices', 'matriks'), pickTrueFrame(CONCEPT_MAT, 3)];

  const mat21_equalCoupled = (r) => {
    const x = r.int(1, 6), y = r.int(1, 5);
    const c1 = 2 * x + y, c2 = x - y;
    const extra = r.int(-9, 9);
    const Asym = [['2x + y', extra], [extra + 1, 'x - y']];
    const Bnum = [[c1, extra], [extra + 1, c2]];
    return { q: T(`Given $${M(Asym)} = ${M(Bnum)}$, form two equations and solve them to find $x$ and $y$.`, `Diberi $${M(Asym)} = ${M(Bnum)}$, bentukkan dua persamaan dan selesaikan untuk mencari $x$ dan $y$.`), a: T(`$2x + y = ${c1}$, $x - y = ${c2}$; $x = ${x}$, $y = ${y}$`), w: W(`$2x + y = ${c1}$ (1)`, `$x - y = ${c2}$ (2)`, `$(1) + (2)$: $3x = ${c1 + c2} \\Rightarrow x = ${x}$`, T(`From (2): $y = ${x} ${c2 < 0 ? '+ ' + -c2 : '- ' + c2} = ${y}$`, `Daripada (2): $y = ${x} ${c2 < 0 ? '+ ' + -c2 : '- ' + c2} = ${y}$`)), sp: 'm' };
  };
  const mat21_multiPart = (r) => {
    const rowLabels = r.sample(SPM.bank.subjects, 2);
    const names = r.names(3);
    const A = rmat(r, 2, 3, 0, 100);
    return { q: T(`The matrix $S = ${M(A)}$ shows the marks of ${names.join(', ')} (columns) in ${rowLabels[0].en} and ${rowLabels[1].en} (rows). (a) State the order of $S$. (b) State $s_{23}$ and explain what it represents. (c) Is $S$ a square matrix? Explain.`, `Matriks $S = ${M(A)}$ menunjukkan markah ${names.join(', ')} (lajur) dalam ${rowLabels[0].ms} dan ${rowLabels[1].ms} (baris). (a) Nyatakan peringkat $S$. (b) Nyatakan $s_{23}$ dan terangkan maksudnya. (c) Adakah $S$ suatu matriks segi empat sama? Terangkan.`), a: PT([T(`$2 \\times 3$`), T(`$s_{23} = ${A[1][2]}$: ${names[2]}'s mark in ${rowLabels[1].en}`, `$s_{23} = ${A[1][2]}$: markah ${names[2]} dalam ${rowLabels[1].ms}`), T(`No — it has $2$ rows and $3$ columns, which are not equal.`, `Tidak — ia mempunyai $2$ baris dan $3$ lajur, yang tidak sama.`)]), w: W(T('(a) 2 rows (subjects) and 3 columns (students)', '(a) 2 baris (mata pelajaran) dan 3 lajur (murid)'), T(`(b) Row 2 = ${rowLabels[1].en}, column 3 = ${names[2]}: $s_{23} = ${A[1][2]}$`, `(b) Baris 2 = ${rowLabels[1].ms}, lajur 3 = ${names[2]}: $s_{23} = ${A[1][2]}$`), T('(c) A square matrix needs rows = columns; $2 \\neq 3$.', '(c) Matriks segi empat sama memerlukan bilangan baris = bilangan lajur; $2 \\neq 3$.')), sp: 'l' };
  };
  const mat21_explainOrder = (r) => {
    return { q: T(`Explain why two matrices with different orders can never be equal, even if they contain the same numbers.`, `Terangkan mengapa dua matriks yang berlainan peringkat tidak sekali-kali boleh sama, walaupun kedua-duanya mengandungi nombor yang sama.`), a: T(`Equality requires a one-to-one match between corresponding elements in every row and column; matrices of different orders do not have a corresponding element for every position, so they cannot be equal.`, `Kesamaan memerlukan padanan satu-lawan-satu antara unsur yang bersepadan pada setiap baris dan lajur; matriks yang berlainan peringkat tidak mempunyai unsur yang bersepadan bagi setiap kedudukan, jadi kedua-duanya tidak boleh sama.`), w: T('E.g. $\\begin{pmatrix} 1 & 2 \\end{pmatrix}$ ($1 \\times 2$) and $\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$ ($2 \\times 1$) hold the same numbers, but $a_{12} = 2$ has no corresponding element $b_{12}$.', 'Cth. $\\begin{pmatrix} 1 & 2 \\end{pmatrix}$ ($1 \\times 2$) dan $\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$ ($2 \\times 1$) mengandungi nombor yang sama, tetapi $a_{12} = 2$ tiada unsur bersepadan $b_{12}$.'), sp: 'm' };
  };
  const mat21_identityFromX = (r) => {
    const x = r.nz(-5, 5), y = r.nz(-5, 5);
    need(x !== 1 && y !== 1);
    const k1 = 1 - x, k2 = 1 - y;
    const Asym = [[lin(1, k1, 'x'), '0'], ['0', lin(1, k2, 'y')]];
    const target = idMat(2);
    return { q: T(`Given $${M(Asym)} = ${M(target)}$ (the $2 \\times 2$ identity matrix), find $x$ and $y$.`, `Diberi $${M(Asym)} = ${M(target)}$ (matriks identiti $2 \\times 2$), cari $x$ dan $y$.`), a: T(`$x = ${x}$, $y = ${y}$`), w: W(T('The diagonal elements of $I$ are $1$:', 'Unsur pepenjuru $I$ ialah $1$:'), `$${lin(1, k1, 'x')} = 1 \\Rightarrow x = 1 ${k1 < 0 ? '+ ' + -k1 : '- ' + k1} = ${x}$`, `$${lin(1, k2, 'y')} = 1 \\Rightarrow y = 1 ${k2 < 0 ? '+ ' + -k2 : '- ' + k2} = ${y}$`), sp: 's' };
  };
  const mat21_transpose = (r) => {
    const A = rmat(r, r.pick([2, 3]), r.pick([2, 3]), -9, 9);
    return { q: T(`The transpose of a matrix $A$, written $A^{T}$, is formed by turning the rows of $A$ into columns. Given $A = ${M(A)}$, write $A^{T}$ and state its order.`, `Transpos suatu matriks $A$, ditulis $A^{T}$, dibentuk dengan menukarkan baris $A$ kepada lajur. Diberi $A = ${M(A)}$, tulis $A^{T}$ dan nyatakan peringkatnya.`), a: T(`$A^{T} = ${M(mtrans(A))}$; order $${A[0].length} \\times ${A.length}$`, `$A^{T} = ${M(mtrans(A))}$; peringkat $${A[0].length} \\times ${A.length}$`), w: W(T(`Row 1 of $A$ becomes column 1 of $A^{T}$, row 2 becomes column 2${A.length > 2 ? ', row 3 becomes column 3' : ''}.`, `Baris 1 $A$ menjadi lajur 1 $A^{T}$, baris 2 menjadi lajur 2${A.length > 2 ? ', baris 3 menjadi lajur 3' : ''}.`), T(`Order changes from $${A.length} \\times ${A[0].length}$ to $${A[0].length} \\times ${A.length}$.`, `Peringkat berubah daripada $${A.length} \\times ${A[0].length}$ kepada $${A[0].length} \\times ${A.length}$.`)), sp: 'm' };
  };
  const ga21 = [mat21_equalCoupled, mat21_multiPart, mat21_explainOrder, mat21_identityFromX, mat21_transpose, dualSpotFrame(CONCEPT_MAT), mcqFrame(CONCEPT_MAT, 'matrices', 'matriks'), pickTrueFrame(CONCEPT_MAT, 3)];

  SPM.extend('F5-2.1', { e: ge21, m: gm21, a: ga21 });

  /* -------------------------------------------------------------------- F5-2.2 Basic operations on matrices */
  const CONCEPT_OP = [
    [T('To add or subtract two matrices, they must have the same order.', 'Untuk menambah atau menolak dua matriks, kedua-duanya mesti mempunyai peringkat yang sama.'), T('Any two matrices can be added, regardless of their order.', 'Sebarang dua matriks boleh ditambah, tanpa mengira peringkatnya.'), T('Addition is element by element, so every element needs a partner in the same position.', 'Penambahan dibuat unsur demi unsur, jadi setiap unsur memerlukan pasangan pada kedudukan yang sama.')],
    [T('In $A + B$, corresponding elements of $A$ and $B$ are added.', 'Dalam $A + B$, unsur yang bersepadan bagi $A$ dan $B$ ditambah.'), T('In $A + B$, every element of $A$ is added to every element of $B$.', 'Dalam $A + B$, setiap unsur $A$ ditambah dengan setiap unsur $B$.'), '$\\begin{pmatrix} a & b \\end{pmatrix} + \\begin{pmatrix} c & d \\end{pmatrix} = \\begin{pmatrix} a + c & b + d \\end{pmatrix}$'],
    [T('$kA$ is found by multiplying every element of $A$ by $k$.', '$kA$ diperoleh dengan mendarab setiap unsur $A$ dengan $k$.'), T('$kA$ is found by adding $k$ to every element of $A$.', '$kA$ diperoleh dengan menambah $k$ pada setiap unsur $A$.'), '$k\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = \\begin{pmatrix} ka & kb \\\\ kc & kd \\end{pmatrix}$'],
    [T('$A - B$ is the same as $A + (-1)B$.', '$A - B$ adalah sama seperti $A + (-1)B$.'), T('$A - B$ gives the same matrix as $B - A$.', '$A - B$ memberi matriks yang sama seperti $B - A$.'), T('Every element of $B - A$ is the negative of the one in $A - B$: $B - A = -(A - B)$.', 'Setiap unsur $B - A$ ialah negatif unsur dalam $A - B$: $B - A = -(A - B)$.')],
    [T('For $AB$ to be defined, the number of columns of $A$ must equal the number of rows of $B$.', 'Untuk $AB$ tertakrif, bilangan lajur $A$ mestilah sama dengan bilangan baris $B$.'), T('For $AB$ to be defined, $A$ and $B$ must have the same order.', 'Untuk $AB$ tertakrif, $A$ dan $B$ mestilah mempunyai peringkat yang sama.'), T('Each row of $A$ is multiplied term by term with a column of $B$, so their lengths must match.', 'Setiap baris $A$ didarab sebutan demi sebutan dengan satu lajur $B$, jadi panjangnya mesti sama.')],
    [T('If $A$ is $m \\times n$ and $B$ is $n \\times p$, then $AB$ has order $m \\times p$.', 'Jika $A$ berperingkat $m \\times n$ dan $B$ berperingkat $n \\times p$, maka $AB$ berperingkat $m \\times p$.'), T('If $A$ is $m \\times n$ and $B$ is $n \\times p$, then $AB$ has order $n \\times n$.', 'Jika $A$ berperingkat $m \\times n$ dan $B$ berperingkat $n \\times p$, maka $AB$ berperingkat $n \\times n$.'), T('The inner numbers must match and the outer numbers give the order: $(m \\times n)(n \\times p) \\to m \\times p$.', 'Nombor dalam mesti sama dan nombor luar memberi peringkat: $(m \\times n)(n \\times p) \\to m \\times p$.')],
    [T('In general, $AB \\neq BA$ for matrices.', 'Secara amnya, $AB \\neq BA$ bagi matriks.'), T('Matrix multiplication is always commutative, so $AB = BA$.', 'Pendaraban matriks sentiasa kalis tukar tertib, jadi $AB = BA$.'), T('E.g. $\\begin{pmatrix} 1 & 1 \\\\ 0 & 0 \\end{pmatrix}\\begin{pmatrix} 1 & 0 \\\\ 1 & 0 \\end{pmatrix} = \\begin{pmatrix} 2 & 0 \\\\ 0 & 0 \\end{pmatrix}$, but in the other order the product is $\\begin{pmatrix} 1 & 1 \\\\ 1 & 1 \\end{pmatrix}$.', 'Cth. $\\begin{pmatrix} 1 & 1 \\\\ 0 & 0 \\end{pmatrix}\\begin{pmatrix} 1 & 0 \\\\ 1 & 0 \\end{pmatrix} = \\begin{pmatrix} 2 & 0 \\\\ 0 & 0 \\end{pmatrix}$, tetapi dalam tertib yang lain hasil darabnya ialah $\\begin{pmatrix} 1 & 1 \\\\ 1 & 1 \\end{pmatrix}$.')],
    [T('The entry in row $i$, column $j$ of $AB$ is found by multiplying row $i$ of $A$ with column $j$ of $B$, term by term, and summing.', 'Unsur pada baris $i$, lajur $j$ bagi $AB$ diperoleh dengan mendarab baris $i$ bagi $A$ dengan lajur $j$ bagi $B$, sebutan demi sebutan, dan menjumlahkannya.'), T('The entry in row $i$, column $j$ of $AB$ is found by multiplying the entry in row $i$, column $j$ of $A$ with the entry in row $i$, column $j$ of $B$.', 'Unsur pada baris $i$, lajur $j$ bagi $AB$ diperoleh dengan mendarab unsur pada baris $i$, lajur $j$ bagi $A$ dengan unsur pada baris $i$, lajur $j$ bagi $B$.'), '$(AB)_{ij} = a_{i1}b_{1j} + a_{i2}b_{2j} + \\cdots$'],
    [T('If $A$ is $2 \\times 3$ and $B$ is $3 \\times 2$, $AB$ (order $2 \\times 2$) and $BA$ (order $3 \\times 3$) are different matrices, not just different orderings of the same one.', 'Jika $A$ berperingkat $2 \\times 3$ dan $B$ berperingkat $3 \\times 2$, $AB$ (peringkat $2 \\times 2$) dan $BA$ (peringkat $3 \\times 3$) ialah matriks yang berbeza, bukan sekadar tertib berbeza bagi matriks yang sama.'), T('If $A$ is $2 \\times 3$ and $B$ is $3 \\times 2$, both $AB$ and $BA$ have order $2 \\times 3$.', 'Jika $A$ berperingkat $2 \\times 3$ dan $B$ berperingkat $3 \\times 2$, kedua-dua $AB$ dan $BA$ berperingkat $2 \\times 3$.'), '$(2 \\times 3)(3 \\times 2) \\to 2 \\times 2$, $(3 \\times 2)(2 \\times 3) \\to 3 \\times 3$'],
    [T('To find $2A - 3B$, scale $A$ by $2$ and $B$ by $3$ first, then subtract.', 'Untuk mencari $2A - 3B$, skalakan $A$ dengan $2$ dan $B$ dengan $3$ dahulu, kemudian tolak.'), T('To find $2A - 3B$, subtract $A$ and $B$ first, then multiply by $2 - 3 = -1$.', 'Untuk mencari $2A - 3B$, tolak $A$ dan $B$ dahulu, kemudian darab dengan $2 - 3 = -1$.'), T('The scalars act on each matrix separately: $2A - 3B$ is not $(2 - 3)(A - B)$.', 'Skalar bertindak pada setiap matriks secara berasingan: $2A - 3B$ bukan $(2 - 3)(A - B)$.')],
    [T('Multiplying a square matrix $A$ by the identity matrix leaves it unchanged: $AI = A$.', 'Mendarab matriks segi empat sama $A$ dengan matriks identiti tidak mengubahnya: $AI = A$.'), T('Multiplying a matrix by the identity matrix always doubles every entry.', 'Mendarab matriks dengan matriks identiti sentiasa menggandakan dua setiap unsur.'), '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix} = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$'],
    [T('$A + B = B + A$ for matrices of the same order (addition is commutative).', '$A + B = B + A$ bagi matriks yang berperingkat sama (penambahan adalah kalis tukar tertib).'), T('$A + B \\neq B + A$ in general, just like matrix multiplication.', '$A + B \\neq B + A$ secara amnya, sama seperti pendaraban matriks.'), T('Each element is a sum of two numbers, and $a + b = b + a$ for numbers.', 'Setiap unsur ialah hasil tambah dua nombor, dan $a + b = b + a$ bagi nombor.')],
  ];

  const mat22_addSub = (r) => {
    const rows = r.pick([2, 2, 3]), cols = r.pick([2, 3]);
    const A = rmat(r, rows, cols, -8, 8), B = rmat(r, rows, cols, -8, 8);
    const op = r.pick(['+', '-']);
    const k = r.pick([2, 3, 4]);
    const task = r.pick(['sum', 'scalar', 'both']);
    const wSc = `$${k}A = ${M(A.map((row) => row.map((v) => `${k}(${v})`)))} = ${M(msc(k, A))}$`;
    const wSum = `$A ${op} B = ${ewM(A, B, op)} = ${M(madd(A, B, op === '+' ? 1 : -1))}$`;
    if (task === 'scalar') return { q: T(`$A = ${M(A)}$. Find $${k}A$.`, `$A = ${M(A)}$. Cari $${k}A$.`), a: T(`$${M(msc(k, A))}$`), w: W(T(`Multiply every element by ${k}:`, `Darab setiap unsur dengan ${k}:`), wSc), sp: 's' };
    if (task === 'sum') return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. Find $A ${op} B$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Cari $A ${op} B$.`), a: T(`$${M(madd(A, B, op === '+' ? 1 : -1))}$`), w: W(T(`${op === '+' ? 'Add' : 'Subtract'} corresponding elements:`, `${op === '+' ? 'Tambah' : 'Tolak'} unsur yang bersepadan:`), wSum), sp: 's' };
    return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. Find $A ${op} B$ and $${k}A$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Cari $A ${op} B$ dan $${k}A$.`), a: T(`$${M(madd(A, B, op === '+' ? 1 : -1))}$; $${M(msc(k, A))}$`), w: W(wSum, wSc), sp: 's' };
  };
  const mat22_unknownSum = (r) => {
    const rows = 2, cols = 2;
    const A = rmat(r, rows, cols, -8, 8);
    const x = r.int(-9, 9);
    const i = r.int(0, 1), j = r.int(0, 1);
    const Bsym = rmat(r, rows, cols, -8, 8).map((row) => row.slice());
    Bsym[i][j] = 'x';
    const op = r.chance();
    const Csum = A.map((row, ii) => row.map((v, jj) => v + (op ? 1 : -1) * (ii === i && jj === j ? x : Bsym[ii][jj])));
    return { q: T(`$A = ${M(A)}$ and $B = ${M(Bsym)}$. Given $A ${op ? '+' : '-'} B = ${M(Csum)}$, find the value of $x$.`, `$A = ${M(A)}$ dan $B = ${M(Bsym)}$. Diberi $A ${op ? '+' : '-'} B = ${M(Csum)}$, cari nilai $x$.`), a: T(`$x = ${x}$`), w: W(T(`Row ${i + 1}, column ${j + 1}:`, `Baris ${i + 1}, lajur ${j + 1}:`), op ? `$${A[i][j]} + x = ${Csum[i][j]} \\Rightarrow x = ${Csum[i][j]} - ${par(A[i][j])} = ${x}$` : `$${A[i][j]} - x = ${Csum[i][j]} \\Rightarrow x = ${A[i][j]} - ${par(Csum[i][j])} = ${x}$`), sp: 's' };
  };
  const mat22_mcqOp = (r) => {
    const A = rmat(r, 2, 2, -6, 6), B = rmat(r, 2, 2, -6, 6);
    const right = T(`$${M(madd(A, B))}$`);
    const wrongEW = A.map((row, i) => row.map((v, j) => v * B[i][j]));
    const wrong = [T(`$${M(wrongEW)}$`), T(`$${M(madd(A, B, -1))}$`), T(`$${M(msc(2, A))}$`)];
    const o = mc(r, right, wrong);
    return { q: cat(T(`$A = ${M(A)}$ and $B = ${M(B)}$. What is $A + B$?<br>`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Apakah $A + B$?<br>`), o.q), a: o.a, w: W(T('Add corresponding elements (do not multiply them):', 'Tambah unsur yang bersepadan (jangan darab):'), `$A + B = ${ewM(A, B, '+')} = ${M(madd(A, B))}$`), sp: 's' };
  };
  const mat22_associative = (r) => {
    const A = rmat(r, 2, 2, -6, 6), B = rmat(r, 2, 2, -6, 6), C = rmat(r, 2, 2, -6, 6);
    const left = madd(madd(A, B), C), right = madd(A, madd(B, C));
    return { q: T(`$A = ${M(A)}$, $B = ${M(B)}$, $C = ${M(C)}$. Find $(A + B) + C$ and $A + (B + C)$. What do you notice?`, `$A = ${M(A)}$, $B = ${M(B)}$, $C = ${M(C)}$. Cari $(A + B) + C$ dan $A + (B + C)$. Apakah yang anda perhatikan?`), a: T(`Both equal $${M(left)}$; they are the same (addition is associative)`, `Kedua-duanya bersamaan $${M(left)}$; kedua-duanya sama (penambahan bersifat kalis sekutuan)`), w: W(`$A + B = ${M(madd(A, B))}$, $(A + B) + C = ${ewM(madd(A, B), C, '+')} = ${M(left)}$`, `$B + C = ${M(madd(B, C))}$, $A + (B + C) = ${ewM(A, madd(B, C), '+')} = ${M(right)}$`), sp: 'm' };
  };
  const ge22 = [mat22_addSub, mat22_unknownSum, mat22_mcqOp, mat22_associative, tfFrame(CONCEPT_OP), pickTrueFrame(CONCEPT_OP, 2)];

  const mat22_combined = (r) => {
    const A = rmat(r, 2, 2, -6, 6), B = rmat(r, 2, 2, -6, 6);
    const kA = r.pick([2, 3]), kB = r.pick([2, 3].filter((v) => v !== kA));
    const sign = r.chance() ? 1 : -1;
    return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. Find $${kA}A ${sign > 0 ? '+' : '-'} ${kB}B$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Cari $${kA}A ${sign > 0 ? '+' : '-'} ${kB}B$.`), a: T(`$${M(madd(msc(kA, A), msc(kB, B), sign))}$`), w: W(`$${kA}A = ${M(msc(kA, A))}$, $${kB}B = ${M(msc(kB, B))}$`, `$${kA}A ${sign > 0 ? '+' : '-'} ${kB}B = ${ewM(msc(kA, A), msc(kB, B), sign > 0 ? '+' : '-')} = ${M(madd(msc(kA, A), msc(kB, B), sign))}$`), sp: 'm' };
  };
  const mat22_mulSquare = (r) => {
    const A = rmat(r, 2, 2, -5, 5), B = rmat(r, 2, 2, -5, 5);
    return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. Find $AB$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Cari $AB$.`), a: T(`$${M(mmul(A, B))}$`), w: W(T('Row of $A$ times column of $B$, term by term, then add:', 'Baris $A$ darab lajur $B$, sebutan demi sebutan, kemudian tambah:'), `$AB = ${mulM(A, B)} = ${M(mmul(A, B))}$`), sp: 'm' };
  };
  const mat22_mulRect = (r) => {
    const shape = r.chance();
    const A = shape ? rmat(r, 2, 3, -5, 5) : rmat(r, 3, 2, -5, 5);
    const B = shape ? rmat(r, 3, 2, -5, 5) : rmat(r, 2, 3, -5, 5);
    return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. State the order of $AB$, then find $AB$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Nyatakan peringkat $AB$, kemudian cari $AB$.`), a: T(`Order $${A.length} \\times ${B[0].length}$; $AB = ${M(mmul(A, B))}$`, `Peringkat $${A.length} \\times ${B[0].length}$; $AB = ${M(mmul(A, B))}$`), w: W(`$(${A.length} \\times ${A[0].length})(${B.length} \\times ${B[0].length}) \\to ${A.length} \\times ${B[0].length}$`, `$AB = ${mulM(A, B)} = ${M(mmul(A, B))}$`), sp: 'm' };
  };
  const mat22_orderEffect = (r) => {
    const A = rmat(r, 2, 3, -4, 4), B = rmat(r, 3, 2, -4, 4);
    return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. State the orders of $AB$ and $BA$, and find $AB$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Nyatakan peringkat $AB$ dan $BA$, dan cari $AB$.`), a: T(`$AB$ is $${A.length} \\times ${B[0].length}$; $BA$ is $${B.length} \\times ${A[0].length}$; $AB = ${M(mmul(A, B))}$`, `$AB$ ialah $${A.length} \\times ${B[0].length}$; $BA$ ialah $${B.length} \\times ${A[0].length}$; $AB = ${M(mmul(A, B))}$`), w: W(`$AB$: $(2 \\times 3)(3 \\times 2) \\to 2 \\times 2$; $BA$: $(3 \\times 2)(2 \\times 3) \\to 3 \\times 3$`, `$AB = ${mulM(A, B)} = ${M(mmul(A, B))}$`), sp: 'm' };
  };
  const mat22_compareABBA = (r) => {
    const A = rmat(r, 2, 2, -4, 4), B = rmat(r, 2, 2, -4, 4);
    const AB = mmul(A, B), BA = mmul(B, A);
    const eq = A.every((row, i) => row.every((v, j) => AB[i][j] === BA[i][j]));
    return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. Find $AB$ and $BA$. Is $AB = BA$?`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Cari $AB$ dan $BA$. Adakah $AB = BA$?`), a: T(`$AB = ${M(AB)}$; $BA = ${M(BA)}$; ${eq ? 'Yes, $AB = BA$ for this pair' : 'No, $AB \\neq BA$'}`, `$AB = ${M(AB)}$; $BA = ${M(BA)}$; ${eq ? 'Ya, $AB = BA$ bagi pasangan ini' : 'Tidak, $AB \\neq BA$'}`), w: W(`$AB = ${mulM(A, B)} = ${M(AB)}$`, `$BA = ${mulM(B, A)} = ${M(BA)}$`, eq ? T('Every corresponding element agrees, so here $AB = BA$ (this does not hold in general).', 'Setiap unsur yang bersepadan sama, jadi di sini $AB = BA$ (ini tidak benar secara amnya).') : T('At least one corresponding element differs, so $AB \\neq BA$.', 'Sekurang-kurangnya satu unsur yang bersepadan berbeza, jadi $AB \\neq BA$.')), sp: 'm' };
  };
  const mat22_contextProduct = (r) => {
    const items = r.sample(SPM.bank.items, 2);
    const places = r.sample(SPM.bank.places, 2);
    const qty = rmat(r, 2, 2, 2, 15); // rows: places, columns: items
    const price = [[r.int(items[0].lo, items[0].hi)], [r.int(items[1].lo, items[1].hi)]]; // rows: items
    const revenue = mmul(qty, price);
    return { q: T(`The matrix $Q = ${M(qty)}$ shows the number of ${items[0].en} and ${items[1].en} (columns) sold at ${places[0].en} and ${places[1].en} (rows). The price vector is $P = ${M(price)}$ (RM per unit, rows: ${items[0].en}, ${items[1].en}). Find $QP$ to obtain the total revenue (RM) at each place, then state which place earned more.`, `Matriks $Q = ${M(qty)}$ menunjukkan bilangan ${items[0].ms} dan ${items[1].ms} (lajur) yang dijual di ${places[0].ms} dan ${places[1].ms} (baris). Vektor harga ialah $P = ${M(price)}$ (RM seunit, baris: ${items[0].ms}, ${items[1].ms}). Cari $QP$ untuk memperoleh jumlah hasil jualan (RM) di setiap tempat, kemudian nyatakan tempat yang memperoleh hasil jualan lebih tinggi.`), a: revenue[0][0] === revenue[1][0] ? T(`$QP = ${M(revenue)}$; both places earned the same`, `$QP = ${M(revenue)}$; kedua-dua tempat memperoleh hasil jualan yang sama`) : T(`$QP = ${M(revenue)}$; ${revenue[0][0] > revenue[1][0] ? places[0].en : places[1].en} earned more`, `$QP = ${M(revenue)}$; ${revenue[0][0] > revenue[1][0] ? places[0].ms : places[1].ms} memperoleh hasil jualan lebih tinggi`), w: W(`$(2 \\times 2)(2 \\times 1) \\to 2 \\times 1$`, `$QP = ${mulM(qty, price)} = ${M(revenue)}$`, T(`Compare RM${revenue[0][0]} (${places[0].en}) with RM${revenue[1][0]} (${places[1].en}).`, `Bandingkan RM${revenue[0][0]} (${places[0].ms}) dengan RM${revenue[1][0]} (${places[1].ms}).`)), sp: 'l' };
  };
  const gm22 = [mat22_combined, mat22_mulSquare, mat22_mulRect, mat22_orderEffect, mat22_compareABBA, mat22_contextProduct, spotFrame(CONCEPT_OP), mcqFrame(CONCEPT_OP, 'matrix operations', 'operasi matriks'), pickTrueFrame(CONCEPT_OP, 3)];

  const mat22_unknownProduct = (r) => {
    const A = rmat(r, 2, 2, -5, 5), B = rmat(r, 2, 2, -5, 5);
    const i = r.int(0, 1), j = r.int(0, 1);
    need(B[j][0] !== 0 || B[j][1] !== 0); // otherwise p is multiplied by 0 everywhere and cannot be found
    const P = mmul(A, B);
    const Asym = A.map((row) => row.slice());
    Asym[i][j] = 'p';
    const c = B[j][0] !== 0 ? 0 : 1, other = A[i][1 - j] * B[1 - j][c];
    const terms = [0, 1].map((t) => (t === j ? `p(${B[j][c]})` : `(${A[i][t]})(${B[t][c]})`)).join(' + ');
    return { q: T(`$${M(Asym)}${M(B)} = ${M(P)}$. Find $p$.`, `$${M(Asym)}${M(B)} = ${M(P)}$. Cari $p$.`), a: T(`$p = ${A[i][j]}$`), w: W(T(`Row ${i + 1} × column ${c + 1} of the product:`, `Baris ${i + 1} × lajur ${c + 1} hasil darab:`), `$${terms} = ${P[i][c]}$`, `$${lin(B[j][c], other, 'p')} = ${P[i][c]}$`, `$${lin(B[j][c], 0, 'p')} = ${P[i][c] - other} \\Rightarrow p = ${A[i][j]}$`), sp: 'm' };
  };
  const mat22_compareABBAfull = (r) => {
    const A = rmat(r, 2, 2, -5, 5), B = rmat(r, 2, 2, -5, 5);
    const AB = mmul(A, B), BA = mmul(B, A);
    need(!A.every((row, i) => row.every((v, j) => AB[i][j] === BA[i][j])));
    return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. Compute $AB$ and $BA$ fully, and explain, using your results, why matrix multiplication is generally not commutative.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Hitung $AB$ dan $BA$ sepenuhnya, dan terangkan, menggunakan keputusan anda, mengapa pendaraban matriks secara amnya bukan kalis tukar tertib.`), a: T(`$AB = ${M(AB)}$; $BA = ${M(BA)}$; since $AB \\neq BA$ (at least one corresponding element differs), this pair shows multiplication is not commutative.`, `$AB = ${M(AB)}$; $BA = ${M(BA)}$; oleh sebab $AB \\neq BA$ (sekurang-kurangnya satu unsur yang bersepadan berbeza), pasangan ini menunjukkan pendaraban bukan kalis tukar tertib.`), w: (() => {
      let di = 0, dj = 0;
      for (let i = 1; i >= 0; i--) for (let j = 1; j >= 0; j--) if (AB[i][j] !== BA[i][j]) { di = i; dj = j; }
      return W(`$AB = ${mulM(A, B)} = ${M(AB)}$`, `$BA = ${mulM(B, A)} = ${M(BA)}$`, T(`E.g. row ${di + 1}, column ${dj + 1}: $${AB[di][dj]} \\neq ${BA[di][dj]}$`, `Cth. baris ${di + 1}, lajur ${dj + 1}: $${AB[di][dj]} \\neq ${BA[di][dj]}$`));
    })(), sp: 'l' };
  };
  const mat22_contextFull = (r) => {
    const foods = r.sample(SPM.bank.foods, 3);
    const names = r.names(2);
    const qty = rmat(r, 2, 3, 1, 8);
    const price = foods.map((f) => [r.int(f.lo, f.hi)]);
    const cost = mmul(qty, price);
    return { q: T(`${names[0]} and ${names[1]} buy some food at a stall. The matrix $Q = ${M(qty)}$ (rows: ${names[0]}, ${names[1]}; columns: ${foods.map((f) => f.en1).join(', ')}) shows the number bought. The price vector is $C = ${M(price)}$ (RM, rows: ${foods.map((f) => f.en1).join(', ')}). (a) State the order of $QC$. (b) Find $QC$ and state what it represents. (c) Who spent more?`, `${names[0]} dan ${names[1]} membeli sedikit makanan di sebuah gerai. Matriks $Q = ${M(qty)}$ (baris: ${names[0]}, ${names[1]}; lajur: ${foods.map((f) => f.en1).join(', ')}) menunjukkan bilangan yang dibeli. Vektor harga ialah $C = ${M(price)}$ (RM, baris: ${foods.map((f) => f.en1).join(', ')}). (a) Nyatakan peringkat $QC$. (b) Cari $QC$ dan nyatakan maksudnya. (c) Siapakah yang berbelanja lebih banyak?`), a: PT([T(`$2 \\times 1$`), T(`$QC = ${M(cost)}$: the total amount (RM) each person spent`, `$QC = ${M(cost)}$: jumlah (RM) yang dibelanjakan oleh setiap orang`), cost[0][0] === cost[1][0] ? T('Both spent the same amount', 'Kedua-duanya berbelanja sama banyak') : T(cost[0][0] > cost[1][0] ? names[0] : names[1])]), w: W(`(a) $(2 \\times 3)(3 \\times 1) \\to 2 \\times 1$`, `(b) $QC = ${mulM(qty, price)} = ${M(cost)}$`, T(`(c) Compare RM${cost[0][0]} (${names[0]}) with RM${cost[1][0]} (${names[1]}).`, `(c) Bandingkan RM${cost[0][0]} (${names[0]}) dengan RM${cost[1][0]} (${names[1]}).`)), sp: 'l' };
  };
  const mat22_explainCompat = (r) => {
    const rA = r.pick([2, 3]), cA = r.pick([2, 3]);
    const cB = r.pick([2, 3].filter((v) => v !== cA));
    return { q: T(`$A$ has order $${rA} \\times ${cA}$. $B$ has order $${cB} \\times ${rA}$. Explain whether $AB$ is defined, and if it is, state its order.`, `$A$ berperingkat $${rA} \\times ${cA}$. $B$ berperingkat $${cB} \\times ${rA}$. Terangkan sama ada $AB$ tertakrif, dan jika ya, nyatakan peringkatnya.`), a: cA === cB ? T(`$AB$ is defined since the number of columns of $A$ ($${cA}$) equals the number of rows of $B$ ($${cB}$); order $${rA} \\times ${rA}$.`, `$AB$ tertakrif kerana bilangan lajur $A$ ($${cA}$) sama dengan bilangan baris $B$ ($${cB}$); peringkat $${rA} \\times ${rA}$.`) : T(`$AB$ is not defined since the number of columns of $A$ ($${cA}$) does not equal the number of rows of $B$ ($${cB}$).`, `$AB$ tidak tertakrif kerana bilangan lajur $A$ ($${cA}$) tidak sama dengan bilangan baris $B$ ($${cB}$).`), w: W(`$(${rA} \\times ${cA})(${cB} \\times ${rA})$`, cA === cB ? T(`The inner numbers ${cA} and ${cB} match; the outer numbers give the order $${rA} \\times ${rA}$.`, `Nombor dalam ${cA} dan ${cB} sama; nombor luar memberi peringkat $${rA} \\times ${rA}$.`) : T(`The inner numbers ${cA} and ${cB} are different, so $AB$ cannot be formed.`, `Nombor dalam ${cA} dan ${cB} berbeza, jadi $AB$ tidak dapat dibentuk.`)), sp: 'm' };
  };
  const ga22 = [mat22_unknownProduct, mat22_compareABBAfull, mat22_contextFull, mat22_explainCompat, dualSpotFrame(CONCEPT_OP), mcqFrame(CONCEPT_OP, 'matrix operations', 'operasi matriks'), pickTrueFrame(CONCEPT_OP, 3)];

  SPM.extend('F5-2.2', { e: ge22, m: gm22, a: ga22 });

  /* --------------------------------------------------------------------- F5-2.3 Inverse matrix & solving */
  const CONCEPT_INV = [
    [T('For $M = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$, $\\det M = ad - bc$.', 'Bagi $M = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$, $\\det M = ad - bc$.'), T('For $M = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$, $\\det M = ac - bd$.', 'Bagi $M = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$, $\\det M = ac - bd$.'), T('Multiply the main diagonal, then subtract the product of the other diagonal: $ad - bc$.', 'Darab unsur pepenjuru utama, kemudian tolak hasil darab pepenjuru yang satu lagi: $ad - bc$.')],
    [T('The inverse $M^{-1}$ exists only when $\\det M \\neq 0$.', 'Songsangan $M^{-1}$ wujud hanya apabila $\\det M \\neq 0$.'), T('The inverse $M^{-1}$ exists for every matrix $M$.', 'Songsangan $M^{-1}$ wujud bagi setiap matriks $M$.'), T('$M^{-1}$ contains $\\dfrac{1}{\\det M}$, which is not defined when $\\det M = 0$.', '$M^{-1}$ mengandungi $\\dfrac{1}{\\det M}$, yang tidak tertakrif apabila $\\det M = 0$.')],
    [T('To form $M^{-1}$, swap $a$ and $d$, and negate $b$ and $c$ (not swap $b$ and $c$).', 'Untuk membentuk $M^{-1}$, tukar kedudukan $a$ dan $d$, dan negatifkan $b$ dan $c$ (bukan tukar kedudukan $b$ dan $c$).'), T('To form $M^{-1}$, swap $b$ and $c$, and negate $a$ and $d$.', 'Untuk membentuk $M^{-1}$, tukar kedudukan $b$ dan $c$, dan negatifkan $a$ dan $d$.'), '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\to \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$'],
    [T('$M^{-1} = \\dfrac{1}{\\det M}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$.', '$M^{-1} = \\dfrac{1}{\\det M}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$.'), T('$M^{-1} = \\det M \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$ (without dividing by $\\det M$).', '$M^{-1} = \\det M \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$ (tanpa membahagi dengan $\\det M$).'), T('Check: $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix} = (ad - bc)I$, so dividing by $ad - bc$ gives $I$.', 'Semak: $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix} = (ad - bc)I$, jadi membahagi dengan $ad - bc$ memberi $I$.')],
    [T('$MM^{-1} = I$, the identity matrix.', '$MM^{-1} = I$, matriks identiti.'), T('$MM^{-1} = M$.', '$MM^{-1} = M$.'), T('This is the definition of the inverse: $MM^{-1} = M^{-1}M = I$.', 'Ini ialah takrif songsangan: $MM^{-1} = M^{-1}M = I$.')],
    [T('To solve $AX = B$ for $X$, compute $X = A^{-1}B$ (order matters).', 'Untuk menyelesaikan $AX = B$ bagi $X$, hitung $X = A^{-1}B$ (tertib adalah penting).'), T('To solve $AX = B$ for $X$, compute $X = BA^{-1}$.', 'Untuk menyelesaikan $AX = B$ bagi $X$, hitung $X = BA^{-1}$.'), '$A^{-1}AX = A^{-1}B \\Rightarrow IX = A^{-1}B \\Rightarrow X = A^{-1}B$'],
    [T('If $\\det A = 0$, $A$ has no inverse, so $X = A^{-1}B$ cannot be used.', 'Jika $\\det A = 0$, $A$ tidak mempunyai songsangan, jadi $X = A^{-1}B$ tidak boleh digunakan.'), T('If $\\det A = 0$, $X = A^{-1}B$ still works, treating $\\dfrac{1}{0}$ as $0$.', 'Jika $\\det A = 0$, $X = A^{-1}B$ masih boleh digunakan, dengan menganggap $\\dfrac{1}{0}$ sebagai $0$.'), T('$\\dfrac{1}{0}$ is not defined, so $A^{-1}$ does not exist and the matrix method cannot be used.', '$\\dfrac{1}{0}$ tidak tertakrif, jadi $A^{-1}$ tidak wujud dan kaedah matriks tidak boleh digunakan.')],
    [T('A determinant of $0$ means the matrix has no inverse.', 'Penentu bersamaan $0$ bermaksud matriks itu tidak mempunyai songsangan.'), T('A determinant of $0$ means the matrix must be the zero matrix.', 'Penentu bersamaan $0$ bermaksud matriks itu mestilah matriks sifar.'), T('E.g. $\\det \\begin{pmatrix} 1 & 2 \\\\ 2 & 4 \\end{pmatrix} = 4 - 4 = 0$, yet it is not the zero matrix; it simply has no inverse.', 'Cth. $\\det \\begin{pmatrix} 1 & 2 \\\\ 2 & 4 \\end{pmatrix} = 4 - 4 = 0$, tetapi ia bukan matriks sifar; ia hanya tiada songsangan.')],
    [T('When solving simultaneous equations by the matrix method, the equations are first written as a single matrix equation.', 'Apabila menyelesaikan persamaan serentak dengan kaedah matriks, persamaan itu mula-mula ditulis sebagai satu persamaan matriks.'), T('The matrix method finds the inverse of the coefficients without ever writing a matrix equation.', 'Kaedah matriks mencari songsangan pekali tanpa menulis sebarang persamaan matriks.'), T('E.g. $2x + y = 5$ and $x - y = 1$ become $\\begin{pmatrix} 2 & 1 \\\\ 1 & -1 \\end{pmatrix}\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} 5 \\\\ 1 \\end{pmatrix}$.', 'Cth. $2x + y = 5$ dan $x - y = 1$ menjadi $\\begin{pmatrix} 2 & 1 \\\\ 1 & -1 \\end{pmatrix}\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} 5 \\\\ 1 \\end{pmatrix}$.')],
    [T('A negative determinant is possible; the inverse formula still applies, using $\\dfrac{1}{\\det M}$, which is negative.', 'Penentu negatif adalah mungkin; formula songsangan masih terpakai, menggunakan $\\dfrac{1}{\\det M}$, yang bernilai negatif.'), T('A negative determinant means the matrix has no inverse.', 'Penentu negatif bermaksud matriks itu tidak mempunyai songsangan.'), T('E.g. $\\det \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix} = 4 - 6 = -2 \\neq 0$, so the inverse $-\\dfrac{1}{2}\\begin{pmatrix} 4 & -2 \\\\ -3 & 1 \\end{pmatrix}$ exists.', 'Cth. $\\det \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix} = 4 - 6 = -2 \\neq 0$, jadi songsangan $-\\dfrac{1}{2}\\begin{pmatrix} 4 & -2 \\\\ -3 & 1 \\end{pmatrix}$ wujud.')],
    [T('For a matrix with a parameter, the value that makes $\\det = 0$ is exactly the value for which no inverse exists.', 'Bagi matriks dengan parameter, nilai yang menjadikan $\\det = 0$ adalah tepat nilai yang menyebabkan tiada songsangan wujud.'), T('For a matrix with a parameter, the determinant can never become $0$.', 'Bagi matriks dengan parameter, penentu tidak boleh menjadi $0$.'), T('E.g. $\\det \\begin{pmatrix} x & 2 \\\\ 3 & 6 \\end{pmatrix} = 6x - 6 = 0$ when $x = 1$, so there is no inverse for $x = 1$.', 'Cth. $\\det \\begin{pmatrix} x & 2 \\\\ 3 & 6 \\end{pmatrix} = 6x - 6 = 0$ apabila $x = 1$, jadi tiada songsangan bagi $x = 1$.')],
    [T('The order of $A$, $X$ and $B$ must be checked to be compatible before solving $AX = B$.', 'Peringkat $A$, $X$ dan $B$ mesti disemak supaya serasi sebelum menyelesaikan $AX = B$.'), T('The orders of $A$, $X$ and $B$ never need to be checked; any matrices can be multiplied.', 'Peringkat $A$, $X$ dan $B$ tidak perlu disemak; sebarang matriks boleh didarab.'), T('E.g. if $A$ is $2 \\times 2$, then $(2 \\times 2)(2 \\times 1) \\to 2 \\times 1$, so $X$ and $B$ must both be $2 \\times 1$.', 'Cth. jika $A$ ialah $2 \\times 2$, maka $(2 \\times 2)(2 \\times 1) \\to 2 \\times 1$, jadi $X$ dan $B$ mestilah kedua-duanya $2 \\times 1$.')],
  ];

  const mat23_detFind = (r) => {
    const A = rmat(r, 2, 2, -9, 9);
    return { q: T(`Find the determinant of $M = ${M(A)}$.`, `Cari penentu bagi $M = ${M(A)}$.`), a: T(`$\\det M = ${det(A)}$`), w: W(detLine(A)), sp: 's' };
  };
  const mat23_detMCQ = (r) => {
    const A = rmat(r, 2, 2, -9, 9);
    const right = T(`$${det(A)}$`);
    const wrong = [T(`$${A[0][0] * A[1][0] - A[0][1] * A[1][1]}$`), T(`$${A[1][1] * A[0][0] + A[0][1] * A[1][0]}$`), T(`$${A[0][1] * A[1][0] - A[0][0] * A[1][1]}$`)];
    const o = mc(r, right, wrong);
    return { q: cat(T(`The determinant of $${M(A)}$ is<br>`, `Penentu bagi $${M(A)}$ ialah<br>`), o.q), a: o.a, w: W(detLine(A), T('Multiply the main diagonal first, then subtract the other product.', 'Darab pepenjuru utama dahulu, kemudian tolak hasil darab yang satu lagi.')), sp: 's' };
  };
  const mat23_existsTF = (r) => {
    const nonSing = r.chance();
    const A = nonSing ? retry(() => { const a = rmat(r, 2, 2, -6, 6); need(det(a) !== 0); return a; }) : retry(() => { const d = r.int(1, 5), k = r.int(1, 4); const a = r.int(1, 5), b = r.int(1, 4); return [[a, b], [a * k, b * k]]; });
    return { q: T(`True or False: The matrix $${M(A)}$ has an inverse.`, `Betul atau Salah: Matriks $${M(A)}$ mempunyai songsangan.`), a: nonSing ? T(`True — $\\det M = ${det(A)} \\neq 0$`, `Betul — $\\det M = ${det(A)} \\neq 0$`) : T(`False — $\\det M = 0$, so no inverse exists`, `Salah — $\\det M = 0$, jadi tiada songsangan wujud`), w: W(detLine(A), T(`$M^{-1}$ exists exactly when $\\det M \\neq 0$; here $\\det M = ${det(A)}$.`, `$M^{-1}$ wujud apabila $\\det M \\neq 0$ sahaja; di sini $\\det M = ${det(A)}$.`)), sp: 's' };
  };
  const mat23_invClean = (r) => {
    const A = retry(() => { const a = rmat(r, 2, 2, -6, 8); need(Math.abs(det(a)) === 1 || Math.abs(det(a)) === 2); return a; });
    return { q: T(`Find the inverse of $M = ${M(A)}$.`, `Cari songsangan bagi $M = ${M(A)}$.`), a: T(`$M^{-1} = ${invTex(A)}$`), w: W(detLine(A), T('Swap the two main-diagonal elements and change the signs of the other two, then divide by the determinant:', 'Tukar kedudukan dua unsur pepenjuru utama dan tukar tanda dua unsur yang lain, kemudian bahagi dengan penentu:'), invLine(A)), sp: 'm' };
  };
  const mat23_fillFormula = (r) => {
    const A = rmat(r, 2, 2, -9, 9);
    need(det(A) !== 0);
    return { q: T(`Given $M = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$ with $ad - bc \\neq 0$, complete the formula: $M^{-1} = \\dfrac{1}{?}\\begin{pmatrix} ? & ? \\\\ ? & ? \\end{pmatrix}$. Then use it to find the inverse of $${M(A)}$.`, `Diberi $M = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$ dengan $ad - bc \\neq 0$, lengkapkan formula: $M^{-1} = \\dfrac{1}{?}\\begin{pmatrix} ? & ? \\\\ ? & ? \\end{pmatrix}$. Kemudian gunakannya untuk mencari songsangan bagi $${M(A)}$.`), a: T(`$M^{-1} = \\dfrac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$; for the given matrix, $M^{-1} = ${invTex(A)}$`, `$M^{-1} = \\dfrac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$; bagi matriks yang diberi, $M^{-1} = ${invTex(A)}$`), w: W('$M^{-1} = \\dfrac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$', detLine(A), invLine(A)), sp: 'm' };
  };
  const mat23_mcqInvError = (r) => {
    const A = retry(() => { const a = rmat(r, 2, 2, -6, 6); need(Math.abs(det(a)) === 1); return a; });
    const d = det(A);
    const right = T(`$${invTex(A)}$`);
    const swapBC = `\\dfrac{1}{${Math.abs(d)}}${M([[A[0][0], A[1][0]], [A[0][1], A[1][1]]].map((row) => row.map((v) => (d < 0 ? -v : v))))}`;
    const noRecip = `${M([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]].map((row) => row.map((v) => (d < 0 ? -v : v))))}`;
    const wrongSign = `\\dfrac{1}{${Math.abs(d)}}${M([[A[1][1], A[0][1]], [A[1][0], A[0][0]]].map((row) => row.map((v) => (d < 0 ? -v : v))))}`;
    const wrong = [T(`$${swapBC}$`), T(`$${noRecip}$`), T(`$${wrongSign}$`)];
    const o = mc(r, right, wrong);
    return { q: cat(T(`The inverse of $${M(A)}$ is<br>`, `Songsangan bagi $${M(A)}$ ialah<br>`), o.q), a: o.a, w: W(detLine(A), invLine(A), T('Common errors: swapping $b$ and $c$ instead of $a$ and $d$, forgetting the minus signs, or leaving out $\\dfrac{1}{\\det M}$.', 'Kesilapan biasa: menukar kedudukan $b$ dan $c$ dan bukan $a$ dan $d$, terlupa tanda tolak, atau tertinggal $\\dfrac{1}{\\det M}$.')), sp: 's' };
  };
  const ge23 = [mat23_detFind, mat23_detMCQ, mat23_existsTF, mat23_invClean, mat23_fillFormula, mat23_mcqInvError, tfFrame(CONCEPT_INV), pickTrueFrame(CONCEPT_INV, 2)];

  const mat23_invFraction = (r) => {
    const A = retry(() => { const a = rmat(r, 2, 2, -7, 7); need(Math.abs(det(a)) >= 3 && Math.abs(det(a)) <= 12); return a; });
    return { q: T(`Find the inverse of $${M(A)}$, giving your answer with fractions where necessary.`, `Cari songsangan bagi $${M(A)}$, berikan jawapan anda dalam bentuk pecahan jika perlu.`), a: T(`$${fracM(invM(A))}$`), w: W(detLine(A), invLine(A), T('Divide every element by the determinant:', 'Bahagi setiap unsur dengan penentu:'), `$M^{-1} = ${fracM(invM(A))}$`), sp: 'm' };
  };
  const mat23_verifyFull = (r) => {
    const A = retry(() => { const a = rmat(r, 2, 2, -6, 6); need(Math.abs(det(a)) === 1 || Math.abs(det(a)) === 2); return a; });
    return { q: T(`Find $M^{-1}$ for $M = ${M(A)}$, then compute $MM^{-1}$ fully to verify it equals $I$.`, `Cari $M^{-1}$ bagi $M = ${M(A)}$, kemudian hitung $MM^{-1}$ sepenuhnya untuk mengesahkan ia bersamaan $I$.`), a: T(`$M^{-1} = ${invTex(A)}$; $MM^{-1} = ${M(idMat(2))} = I$`, `$M^{-1} = ${invTex(A)}$; $MM^{-1} = ${M(idMat(2))} = I$`), w: W(detLine(A), invLine(A), `$MM^{-1} = \\dfrac{1}{${det(A)}}${M(A)}${M(adjM(A))} = \\dfrac{1}{${det(A)}}${M(mmul(A, adjM(A)))} = ${M(idMat(2))}$`), sp: 'm' };
  };
  const mat23_solveX = (r) => {
    const A = retry(() => { const a = rmat(r, 2, 2, 1, 5); need(det(a) === 1 || det(a) === -1); return a; });
    const X = rmat(r, 2, 1, -5, 6);
    const B = mmul(A, X);
    return { q: T(`$A = ${M(A)}$ and $AX = ${M(B)}$, where $X$ is a $2 \\times 1$ matrix. Find $X$.`, `$A = ${M(A)}$ dan $AX = ${M(B)}$, dengan $X$ ialah matriks $2 \\times 1$. Cari $X$.`), a: T(`$X = A^{-1}${M(B)} = ${M(X)}$`), w: W(T('$AX = B \\Rightarrow X = A^{-1}B$ (multiply from the left).', '$AX = B \\Rightarrow X = A^{-1}B$ (darab dari sebelah kiri).'), detLine(A, 'A'), invLine(A, 'A'), `$X = \\dfrac{1}{${det(A)}}${M(adjM(A))}${M(B)} = \\dfrac{1}{${det(A)}}${M(mmul(adjM(A), B))} = ${M(X)}$`), sp: 'm' };
  };
  const mat23_paramSimple = (r) => {
    const a = r.int(1, 4), b = r.int(1, 4), c = r.int(1, 4);
    const x0 = r.nz(-6, 6);
    const D = a * x0 - b * c;
    return { q: T(`The matrix $${M([[a, b], [c, 'x']])}$ has a determinant of $${D}$. Find the value of $x$.`, `Matriks $${M([[a, b], [c, 'x']])}$ mempunyai penentu $${D}$. Cari nilai $x$.`), a: T(`$${a}x - ${b * c} = ${D}$, so $x = ${x0}$`, `$${a}x - ${b * c} = ${D}$, jadi $x = ${x0}$`), w: W(`$\\det = (${a})(x) - (${b})(${c}) = ${lin(a, -b * c, 'x')}$`, `$${lin(a, -b * c, 'x')} = ${D}$`, (a === 1 ? `$x = ${D} + ${b * c} = ${x0}$` : `$${lin(a, 0, 'x')} = ${D + b * c} \\Rightarrow x = \\dfrac{${D + b * c}}{${a}} = ${x0}$`)), sp: 'm' };
  };
  const gm23 = [mat23_invFraction, mat23_verifyFull, mat23_solveX, mat23_paramSimple, spotFrame(CONCEPT_INV), mcqFrame(CONCEPT_INV, 'the inverse matrix', 'matriks songsang'), pickTrueFrame(CONCEPT_INV, 3)];

  const mat23_simulEq = (r) => {
    return retry(() => {
      const p = r.int(-5, 6), q = r.int(-5, 6);
      need(p !== 0 || q !== 0);
      const a1 = r.int(1, 4), b1 = r.nz(-4, 4), a2 = r.int(1, 3), b2 = r.nz(-3, 3);
      need(a1 * b2 - a2 * b1 !== 0);
      const c1 = a1 * p + b1 * q, c2 = a2 * p + b2 * q;
      const eq1 = poly([[a1, 'p'], [b1, 'q']]), eq2 = poly([[a2, 'p'], [b2, 'q']]);
      return { q: T(`Write the simultaneous equations $${eq1} = ${c1}$ and $${eq2} = ${c2}$ in matrix form $${M([['a', 'b'], ['c', 'd']])}${M([['p'], ['q']])} = ${M([['e'], ['f']])}$. Hence, use the matrix method to find $p$ and $q$.`, `Tulis persamaan serentak $${eq1} = ${c1}$ dan $${eq2} = ${c2}$ dalam bentuk matriks $${M([['a', 'b'], ['c', 'd']])}${M([['p'], ['q']])} = ${M([['e'], ['f']])}$. Seterusnya, gunakan kaedah matriks untuk mencari $p$ dan $q$.`), a: T(`$${M([[a1, b1], [a2, b2]])}${M([['p'], ['q']])} = ${M([[c1], [c2]])}$; $${M([['p'], ['q']])} = ${invTex([[a1, b1], [a2, b2]])}${M([[c1], [c2]])} = ${M([[p], [q]])}$`), w: (() => {
        const A = [[a1, b1], [a2, b2]], C = [[c1], [c2]];
        return W(T('The coefficients form $A$, the unknowns form $X$ and the constants form $B$:', 'Pekali membentuk $A$, anu membentuk $X$ dan pemalar membentuk $B$:'), `$${M(A)}${M([['p'], ['q']])} = ${M(C)}$`, detLine(A, 'A'), invLine(A, 'A'), `$${M([['p'], ['q']])} = \\dfrac{1}{${det(A)}}${M(adjM(A))}${M(C)} = \\dfrac{1}{${det(A)}}${M(mmul(adjM(A), C))} = ${M([[p], [q]])}$`);
      })(), sp: 'l' };
    });
  };
  const mat23_singularParam = (r) => {
    const a = r.int(1, 3);
    const swap = r.chance();
    if (swap) {
      const k = r.int(2, 6);
      const xv = 2 * k;
      const A = [[a, k], [2 * a, 'x']];
      return { q: T(`The matrix $${M(A)}$ has no inverse. Find the value of $x$.`, `Matriks $${M(A)}$ tidak mempunyai songsangan. Cari nilai $x$.`), a: T(`$\\det = ${a}x - ${2 * a * k} = 0$, so $x = ${xv}$`, `$\\det = ${a}x - ${2 * a * k} = 0$, jadi $x = ${xv}$`), w: W(T('No inverse means the determinant is $0$:', 'Tiada songsangan bermaksud penentunya $0$:'), `$\\det = (${a})(x) - (${k})(${2 * a}) = ${lin(a, -2 * a * k, 'x')}$`, (a === 1 ? `$x - ${2 * k} = 0 \\Rightarrow x = ${xv}$` : `$${lin(a, -2 * a * k, 'x')} = 0 \\Rightarrow ${lin(a, 0, 'x')} = ${2 * a * k} \\Rightarrow x = \\dfrac{${2 * a * k}}{${a}} = ${xv}$`)), sp: 'm' };
    }
    const xv = r.int(1, 6);
    const k = 2 * xv;
    const A = [['x', a], [k, 2 * a]];
    return { q: T(`The matrix $${M(A)}$ has no inverse. Find the value of $x$.`, `Matriks $${M(A)}$ tidak mempunyai songsangan. Cari nilai $x$.`), a: T(`$\\det = ${2 * a}x - ${a * k} = 0$, so $x = ${xv}$`, `$\\det = ${2 * a}x - ${a * k} = 0$, jadi $x = ${xv}$`), w: W(T('No inverse means the determinant is $0$:', 'Tiada songsangan bermaksud penentunya $0$:'), `$\\det = (x)(${2 * a}) - (${a})(${k}) = ${lin(2 * a, -a * k, 'x')}$`, `$${lin(2 * a, -a * k, 'x')} = 0 \\Rightarrow ${lin(2 * a, 0, 'x')} = ${a * k} \\Rightarrow x = \\dfrac{${a * k}}{${2 * a}} = ${xv}$`), sp: 'm' };
  };
  const mat23_wordPricing = (r) => {
    return retry(() => {
      const it1 = r.pick(SPM.bank.items), it2 = r.pick(SPM.bank.items.filter((x) => x !== it1));
      const p1 = r.int(2, 8), p2 = r.int(2, 8);
      need(p1 !== p2);
      const n1a = r.int(2, 5), n2a = r.int(1, 4), n1b = r.int(1, 4), n2b = r.int(2, 5);
      need(n1a * n2b - n1b * n2a !== 0);
      const total1 = n1a * p1 + n2a * p2, total2 = n1b * p1 + n2b * p2;
      const names = r.pair();
      const pl = (it, cnt) => (cnt === 1 ? it.en1 : it.en);
      return { q: T(`${names[0]} buys $${n1a}$ ${pl(it1, n1a)} and $${n2a}$ ${pl(it2, n2a)} for ${rm(total1)}. ${names[1]} buys $${n1b}$ ${pl(it1, n1b)} and $${n2b}$ ${pl(it2, n2b)} for ${rm(total2)}, at the same prices. Using $x$ for the price of one ${it1.en1} and $y$ for the price of one ${it2.en1} (in RM), form two equations, write them in matrix form, and use the matrix method to find the price of each item.`, `${names[0]} membeli $${n1a}$ ${it1.ms} dan $${n2a}$ ${it2.ms} dengan harga ${rm(total1)}. ${names[1]} membeli $${n1b}$ ${it1.ms} dan $${n2b}$ ${it2.ms} dengan harga ${rm(total2)}, pada harga yang sama. Dengan menggunakan $x$ bagi harga seunit ${it1.ms} dan $y$ bagi harga seunit ${it2.ms} (dalam RM), bentukkan dua persamaan, tuliskannya dalam bentuk matriks, dan gunakan kaedah matriks untuk mencari harga setiap barang.`), a: T(`$${M([[n1a, n2a], [n1b, n2b]])}${M([['x'], ['y']])} = ${M([[total1], [total2]])}$; $x$ = ${rm(p1)}, $y$ = ${rm(p2)}`, `$${M([[n1a, n2a], [n1b, n2b]])}${M([['x'], ['y']])} = ${M([[total1], [total2]])}$; $x$ = ${rm(p1)}, $y$ = ${rm(p2)}`), w: (() => {
        const A = [[n1a, n2a], [n1b, n2b]], C = [[total1], [total2]];
        return W(`$${poly([[n1a, 'x'], [n2a, 'y']])} = ${total1}$`, `$${poly([[n1b, 'x'], [n2b, 'y']])} = ${total2}$`, `$${M(A)}${M([['x'], ['y']])} = ${M(C)}$`, detLine(A, 'A'), `$${M([['x'], ['y']])} = \\dfrac{1}{${det(A)}}${M(adjM(A))}${M(C)} = \\dfrac{1}{${det(A)}}${M(mmul(adjM(A), C))} = ${M([[p1], [p2]])}$`, T(`So one ${it1.en1} costs ${rm(p1)} and one ${it2.en1} costs ${rm(p2)}.`, `Jadi satu ${it1.ms} berharga ${rm(p1)} dan satu ${it2.ms} berharga ${rm(p2)}.`));
      })(), sp: 'l' };
    });
  };
  const mat23_compareMethods = (r) => {
    const p = r.int(1, 5), q = r.int(-4, 4);
    need(q !== 0);
    const a1 = 1, b1 = 1, c1 = p + q;
    const a2 = 1, b2 = -1, c2 = p - q;
    return { q: T(`The system $p + q = ${c1}$, $p - q = ${c2}$ can be solved either by substitution/elimination (Form 3) or by the matrix method (Form 5). Solve it using the matrix method, and state one advantage of the matrix method for larger systems.`, `Sistem $p + q = ${c1}$, $p - q = ${c2}$ boleh diselesaikan sama ada dengan kaedah penggantian/penghapusan (Tingkatan 3) atau kaedah matriks (Tingkatan 5). Selesaikan menggunakan kaedah matriks, dan nyatakan satu kelebihan kaedah matriks bagi sistem yang lebih besar.`), a: T(`$${M([[1, 1], [1, -1]])}${M([['p'], ['q']])} = ${M([[c1], [c2]])}$; $${M([['p'], ['q']])} = ${invTex([[1, 1], [1, -1]])}${M([[c1], [c2]])} = ${M([[p], [q]])}$. Advantage: the same inverse method extends directly to systems with more equations/unknowns.`, `$${M([[1, 1], [1, -1]])}${M([['p'], ['q']])} = ${M([[c1], [c2]])}$; $${M([['p'], ['q']])} = ${invTex([[1, 1], [1, -1]])}${M([[c1], [c2]])} = ${M([[p], [q]])}$. Kelebihan: kaedah songsangan yang sama boleh terus digunakan bagi sistem dengan lebih banyak persamaan/anu.`), w: (() => {
      const A = [[1, 1], [1, -1]], C = [[c1], [c2]];
      return W(`$${M(A)}${M([['p'], ['q']])} = ${M(C)}$`, detLine(A, 'A'), invLine(A, 'A'), `$${M([['p'], ['q']])} = \\dfrac{1}{${det(A)}}${M(adjM(A))}${M(C)} = \\dfrac{1}{${det(A)}}${M(mmul(adjM(A), C))} = ${M([[p], [q]])}$`);
    })(), sp: 'l' };
  };
  const mat23_fractionInverseSolve = (r) => {
    const A = retry(() => { const a = rmat(r, 2, 2, -6, 6); need(Math.abs(det(a)) >= 3 && Math.abs(det(a)) <= 7); return a; });
    const X = rmat(r, 2, 1, -4, 5);
    const B = mmul(A, X);
    return { q: T(`$A = ${M(A)}$ and $AX = ${M(B)}$. Find the matrix $X$, showing the fractional inverse clearly.`, `$A = ${M(A)}$ dan $AX = ${M(B)}$. Cari matriks $X$, dengan menunjukkan songsangan pecahan dengan jelas.`), a: T(`$A^{-1} = ${invTex(A)}$; $X = ${invTex(A)}${M(B)} = ${M(X)}$`), w: W(detLine(A, 'A'), invLine(A, 'A'), `$X = A^{-1}B = \\dfrac{1}{${det(A)}}${M(adjM(A))}${M(B)} = \\dfrac{1}{${det(A)}}${M(mmul(adjM(A), B))} = ${M(X)}$`), sp: 'l' };
  };
  const ga23 = [mat23_simulEq, mat23_singularParam, mat23_wordPricing, mat23_compareMethods, mat23_fractionInverseSolve, dualSpotFrame(CONCEPT_INV), mcqFrame(CONCEPT_INV, 'the inverse matrix', 'matriks songsang'), pickTrueFrame(CONCEPT_INV, 3)];

  SPM.extend('F5-2.3', { e: ge23, m: gm23, a: ga23 });
})();
