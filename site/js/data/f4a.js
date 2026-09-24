/* Form 4 – Chapters 1 to 3 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, sum, gcd, Fr, poly, lin } = SPM;
  const S = SPM.svg;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const frT = Fr.tex;
  const Q = (a, b, c) => poly([[a, 'x^2'], [b, 'x'], [c, '']]);
  const fac = (u, p) => `(${lin(u, p)})`;
  const fr = (a, b) => Fr.make(a, b);
  const ZS = SPM.zeroSteps, W = SPM.lines;
  /** negative numbers in brackets for substitutions: -3 -> (-3) */
  const pn = (v) => (v < 0 ? `(${n(v)})` : n(v));
  /** a(x)^2 + b(x) + c with the value of x substituted, signs tidy */
  const subQ = (a, b, c, x) => poly([[a, `(${n(x)})^2`], [b, `(${n(x)})`], [c, '']]);

  /* =============================================================== 1 */
  const g11e = [
    (r) => {
      const a = r.nz(-5, 5), b = r.nz(-6, 6), c = r.nz(-9, 9);
      return { q: T(`For the quadratic expression $${Q(a, b, c)}$, state the values of $a$, $b$ and $c$ in $ax^2 + bx + c$.`, `Bagi ungkapan kuadratik $${Q(a, b, c)}$, nyatakan nilai $a$, $b$ dan $c$ dalam $ax^2 + bx + c$.`), a: T(`$a = ${a}$, $b = ${b}$, $c = ${c}$`), w: T(`$a$ is the coefficient of $x^2$, $b$ the coefficient of $x$, $c$ the constant term: $a = ${a}$, $b = ${b}$, $c = ${c}$`, `$a$ ialah pekali $x^2$, $b$ pekali $x$, $c$ sebutan pemalar: $a = ${a}$, $b = ${b}$, $c = ${c}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(1, 4), b = r.int(1, 6), c = r.int(1, 8);
      const opts = [[`${Q(a, b, c)}`, true], [`${lin(b, c)}`, false], [`x^3 + ${a}x`, false], [`${a}x^2 + \\dfrac{${b}}{x}`, false]];
      const list = r.shuffle(opts);
      return { q: T(`Which of the following is a quadratic expression in $x$? ${list.map((o, i) => `(${'ABCD'[i]}) $${o[0]}$`).join('  ')}`, `Antara yang berikut, yang manakah ungkapan kuadratik dalam $x$? ${list.map((o, i) => `(${'ABCD'[i]}) $${o[0]}$`).join('  ')}`), a: T(`(${'ABCD'[list.findIndex((o) => o[1])]})`), w: W(T(`$${Q(a, b, c)}$: one variable, highest power of $x$ is 2, all powers whole numbers – quadratic`, `$${Q(a, b, c)}$: satu pemboleh ubah, kuasa tertinggi $x$ ialah 2, semua kuasa nombor bulat – kuadratik`), T(`The others: highest power 1 (linear), highest power 3, or a term $\\dfrac{${b}}{x}$ (power $-1$)`, `Yang lain: kuasa tertinggi 1 (linear), kuasa tertinggi 3, atau sebutan $\\dfrac{${b}}{x}$ (kuasa $-1$)`)), sp: 's' };
    },
  ];
  const g11m = [
    (r) => {
      const p = r.int(2, 6), k = r.int(2, 12);
      return { q: T(`Write $x(x + ${p}) = ${k}$ in the form $ax^2 + bx + c = 0$ and state $a$, $b$, $c$.`, `Tulis $x(x + ${p}) = ${k}$ dalam bentuk $ax^2 + bx + c = 0$ dan nyatakan $a$, $b$, $c$.`), a: T(`$x^2 + ${p}x - ${k} = 0$; $a = 1$, $b = ${p}$, $c = -${k}$`), w: W(`$x^2 + ${p}x = ${k}$`, T(`Bring $${k}$ to the left: $x^2 + ${p}x - ${k} = 0$`, `Pindahkan $${k}$ ke kiri: $x^2 + ${p}x - ${k} = 0$`), `$a = 1$, $b = ${p}$, $c = -${k}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 5), c = r.int(1, 6);
      return { q: T(`Is $y = ${a}x^2 + ${c}$ a quadratic function? Is $y = ${a}x + ${c}$? Give a reason.`, `Adakah $y = ${a}x^2 + ${c}$ suatu fungsi kuadratik? Adakah $y = ${a}x + ${c}$? Berikan sebab.`), a: T('The first is (highest power 2, $a \\neq 0$); the second is not (it is linear).', 'Yang pertama ya (kuasa tertinggi 2, $a \\neq 0$); yang kedua bukan (ia linear).'), w: W(T(`$y = ${a}x^2 + ${c}$: highest power of $x$ is 2 and $a = ${a} \\neq 0$, so it is quadratic ($b = 0$ is allowed)`, `$y = ${a}x^2 + ${c}$: kuasa tertinggi $x$ ialah 2 dan $a = ${a} \\neq 0$, maka ia kuadratik ($b = 0$ dibenarkan)`), T(`$y = ${a}x + ${c}$: highest power of $x$ is 1, so it is linear, not quadratic`, `$y = ${a}x + ${c}$: kuasa tertinggi $x$ ialah 1, maka ia linear, bukan kuadratik`)), sp: 's' };
    },
  ];
  const g11a = [
    (r) => {
      const k = r.int(2, 6), b = r.int(1, 6);
      return { q: T(`$f(x) = (k - ${k})x^2 + ${lin(b, 1)}$ is a quadratic function. What condition must $k$ satisfy?`, `$f(x) = (k - ${k})x^2 + ${lin(b, 1)}$ ialah fungsi kuadratik. Apakah syarat yang mesti dipenuhi oleh $k$?`), a: T(`$k \\neq ${k}$ (so that $a \\neq 0$)`, `$k \\neq ${k}$ (supaya $a \\neq 0$)`), w: W(T(`A quadratic function needs the coefficient of $x^2$ to be non-zero: $k - ${k} \\neq 0$`, `Fungsi kuadratik memerlukan pekali $x^2$ bukan sifar: $k - ${k} \\neq 0$`), `$k \\neq ${k}$`), sp: 's' };
    },
  ];
  const g12e = [
    (r) => {
      const up = r.chance(), a = r.int(1, 3), c = r.int(-4, 4);
      const fig = S.plane({ x: [-5, 5], y: [-6, 8], scale: 16, curves: [{ f: (x) => (up ? 1 : -1) * a * x * x + c }], labelStep: 2 });
      return { q: T('The graph of $y = ax^2 + bx + c$ with $b = 0$ is shown. State (a) whether $a$ is positive or negative, (b) the value of $c$, (c) the equation of the axis of symmetry.', 'Graf $y = ax^2 + bx + c$ dengan $b = 0$ ditunjukkan. Nyatakan (a) sama ada $a$ positif atau negatif, (b) nilai $c$, (c) persamaan paksi simetri.'), fig, a: T(`(a) ${up ? 'positive' : 'negative'} (b) $c = ${c}$ (c) $x = 0$`, `(a) ${up ? 'positif' : 'negatif'} (b) $c = ${c}$ (c) $x = 0$`), w: W(T(`(a) The graph opens ${up ? 'upwards (minimum point)' : 'downwards (maximum point)'}, so $a ${up ? '>' : '<'} 0$`, `(a) Graf terbuka ke ${up ? 'atas (titik minimum)' : 'bawah (titik maksimum)'}, maka $a ${up ? '>' : '<'} 0$`), T(`(b) The graph cuts the $y$-axis at $(0, ${c})$, so $c = ${c}$`, `(b) Graf memotong paksi-$y$ di $(0, ${c})$, maka $c = ${c}$`), T(`(c) The turning point lies on the $y$-axis, so the axis of symmetry is $x = 0$`, `(c) Titik pusingan terletak pada paksi-$y$, maka paksi simetri ialah $x = 0$`)), sp: 's' };
    },
  ];
  const g12m = [
    (r) => {
      const a = r.pick([1, 2, 3]), b = a + r.pick([1, 2]);
      return { q: T(`Compare the graphs of $y = ${a === 1 ? '' : a}x^2$ and $y = ${b}x^2$. Which is narrower? What is their common minimum point?`, `Bandingkan graf $y = ${a === 1 ? '' : a}x^2$ dan $y = ${b}x^2$. Yang manakah lebih sempit? Apakah titik minimum sepunya?`), a: T(`$y = ${b}x^2$ is narrower (larger $a$); common minimum point $(0, 0)$`, `$y = ${b}x^2$ lebih sempit ($a$ lebih besar); titik minimum sepunya $(0, 0)$`), w: W(T(`The larger the value of $a$, the narrower the graph: $${b} > ${a}$`, `Semakin besar nilai $a$, semakin sempit graf: $${b} > ${a}$`), T(`Both have $b = 0$, $c = 0$ and $a > 0$, so both have minimum point $(0, 0)$`, `Kedua-duanya ada $b = 0$, $c = 0$ dan $a > 0$, maka kedua-duanya mempunyai titik minimum $(0, 0)$`)), sp: 's' };
    },
    (r) => {
      // axis of symmetry inferred from a pair of equal outputs (table-based), not the -b/2a formula
      const a = r.nz(-3, 3), m = r.int(-3, 3), d = r.int(1, 3), c = r.int(-5, 5);
      const b = -2 * a * m; // ensures f(m-d) = f(m+d)
      const x1 = m - d, x2 = m + d;
      const y = a * x1 * x1 + b * x1 + c;
      return { q: T(`For $y = ${Q(a, b, c)}$, the table shows two points with the same $y$-value.${SPM.table([['$x$', x1, x2], ['$y$', n(y), n(y)]], { rowHead: true })}State the $y$-intercept and, using the table, the equation of the axis of symmetry.`, `Bagi $y = ${Q(a, b, c)}$, jadual menunjukkan dua titik dengan nilai $y$ yang sama.${SPM.table([['$x$', x1, x2], ['$y$', n(y), n(y)]], { rowHead: true })}Nyatakan pintasan-$y$ dan, menggunakan jadual, persamaan paksi simetri.`), a: T(`$y$-intercept ${c}; axis $x = ${m}$ (midway between $x = ${x1}$ and $x = ${x2}$)`, `Pintasan-$y$ ${c}; paksi $x = ${m}$ (di tengah-tengah $x = ${x1}$ dan $x = ${x2}$)`), w: W(T(`$y$-intercept $= c = ${c}$`, `Pintasan-$y$ $= c = ${c}$`), T(`Points with equal $y$-values are symmetric about the axis: $x = \\dfrac{${x1} + ${pn(x2)}}{2} = ${m}$`, `Titik dengan nilai $y$ yang sama adalah simetri pada paksi: $x = \\dfrac{${x1} + ${pn(x2)}}{2} = ${m}$`)), sp: 'm' };
    },
  ];
  const g12a = [
    (r) => {
      // minimum/maximum read from a value table, not the vertex-form/formula shortcut
      const a = r.pick([1, 2, -1, -2]), p = r.int(-2, 2), q = r.int(-4, 4);
      const b = -2 * a * p, c = a * p * p + q;
      const xs = [p - 2, p - 1, p, p + 1, p + 2];
      const ys = xs.map((x) => a * x * x + b * x + c);
      const tbl = SPM.table([['$x$', ...xs], ['$f(x)$', ...ys.map(n)]], { rowHead: true });
      return { q: T(`The table shows values of $f(x) = ${Q(a, b, c)}$.${tbl}Using the table, state whether $f(x)$ has a minimum or maximum value in this range, and give that value and the corresponding $x$.`, `Jadual menunjukkan nilai $f(x) = ${Q(a, b, c)}$.${tbl}Menggunakan jadual, nyatakan sama ada $f(x)$ mempunyai nilai minimum atau maksimum dalam julat ini, dan berikan nilai itu serta $x$ yang sepadan.`), a: T(`${a > 0 ? 'Minimum' : 'Maximum'} value $${q}$ at $x = ${p}$`, `Nilai ${a > 0 ? 'minimum' : 'maksimum'} $${q}$ pada $x = ${p}$`), w: W(T(`$a = ${a} ${a > 0 ? '>' : '<'} 0$, so the graph has a ${a > 0 ? 'minimum' : 'maximum'} point`, `$a = ${a} ${a > 0 ? '>' : '<'} 0$, maka graf mempunyai titik ${a > 0 ? 'minimum' : 'maksimum'}`), T(`The values are symmetric about $x = ${p}$: $f(${p - 1}) = f(${p + 1}) = ${n(ys[1])}$`, `Nilai-nilai itu simetri pada $x = ${p}$: $f(${p - 1}) = f(${p + 1}) = ${n(ys[1])}$`), T(`${a > 0 ? 'Smallest' : 'Largest'} value: $f(${p}) = ${q}$`, `Nilai ${a > 0 ? 'terkecil' : 'terbesar'}: $f(${p}) = ${q}$`)), sp: 'm' };
    },
  ];
  const g13e = [
    (r) => {
      const p = r.int(2, 6), q = r.int(2, 6);
      return { q: T(`A rectangle has length $(x + ${p})$ cm and width $x$ cm. Write a quadratic function $A(x)$ for its area.`, `Sebuah segi empat tepat mempunyai panjang $(x + ${p})$ cm dan lebar $x$ cm. Tulis fungsi kuadratik $A(x)$ bagi luasnya.`), a: T(`$A(x) = x(x + ${p}) = x^2 + ${p}x$`), w: W(T('Area = length × width', 'Luas = panjang × lebar'), `$A(x) = (x + ${p}) \\times x$`, `$A(x) = x^2 + ${p}x$`), sp: 's' };
    },
    (r) => {
      const p = r.int(1, 6), q = r.int(1, 6);
      return { q: T(`The function $f(x) = (x - ${p})(x - ${q})$. Write down the values of $x$ for which $f(x) = 0$.`, `Fungsi $f(x) = (x - ${p})(x - ${q})$. Tuliskan nilai $x$ apabila $f(x) = 0$.`), a: T(`$x = ${p}$ or $x = ${q}$`, `$x = ${p}$ atau $x = ${q}$`), w: W(...ZS(1, -p, 1, -q)), sp: 's' };
    },
  ];
  const g13m = [
    (r) => {
      const p = r.int(2, 5), A = r.pick([24, 35, 40, 48, 60]);
      return { q: T(`The area of a rectangle with length $(x + ${p})$ cm and width $x$ cm is ${A} cm². Form a quadratic equation in $x$ and write it in the form $ax^2 + bx + c = 0$.`, `Luas sebuah segi empat tepat berpanjang $(x + ${p})$ cm dan berlebar $x$ cm ialah ${A} cm². Bentukkan persamaan kuadratik dalam $x$ dan tulis dalam bentuk $ax^2 + bx + c = 0$.`), a: T(`$x^2 + ${p}x - ${A} = 0$`), w: W(T('Area = length × width', 'Luas = panjang × lebar'), `$x(x + ${p}) = ${A}$`, `$x^2 + ${p}x = ${A}$`, `$x^2 + ${p}x - ${A} = 0$`), sp: 's' };
    },
  ];
  const g13a = [
    (r) => {
      const p = r.int(1, 5), q = r.int(-6, -1);
      return { q: T(`The graph of a quadratic function $f(x)$ cuts the $x$-axis at $x = ${p}$ and $x = ${q}$ and has $f(0) = ${2 * p * q}$. Find $f(x)$ in the form $ax^2 + bx + c$ and explain what the roots represent.`, `Graf fungsi kuadratik $f(x)$ memotong paksi-$x$ pada $x = ${p}$ dan $x = ${q}$ dan $f(0) = ${2 * p * q}$. Cari $f(x)$ dalam bentuk $ax^2 + bx + c$ dan terangkan apa yang diwakili oleh punca-punca itu.`), a: T(`$f(x) = a(x - ${p})(x ${q < 0 ? '+' : '-'} ${Math.abs(q)})$ with $f(0) = ${p * q}a = ${2 * p * q}$ so $a = 2$: $f(x) = ${Q(2, -2 * (p + q), 2 * p * q)}$. The roots are the $x$-values where the graph meets the $x$-axis, i.e. where $f(x) = 0$.`, `$f(x) = a(x - ${p})(x ${q < 0 ? '+' : '-'} ${Math.abs(q)})$ dengan $f(0) = ${p * q}a = ${2 * p * q}$ jadi $a = 2$: $f(x) = ${Q(2, -2 * (p + q), 2 * p * q)}$. Punca ialah nilai $x$ apabila graf bertemu paksi-$x$, iaitu apabila $f(x) = 0$.`), w: W(`$f(x) = a(x - ${p})(x + ${-q})$`, `$f(0) = a(0 - ${p})(0 + ${-q}) = ${p * q}a$`, `$${p * q}a = ${2 * p * q} \\Rightarrow a = 2$`, `$f(x) = 2(${Q(1, -(p + q), p * q)}) = ${Q(2, -2 * (p + q), 2 * p * q)}$`), sp: 'm' };
    },
  ];
  /** "two numbers with product P and sum S are a and b" – the search step of factorising x^2 + Sx + P */
  const pairLine = (a, b) => T(`Two numbers with product $${a * b}$ and sum $${a + b}$: $${a}$ and $${b}$`, `Dua nombor dengan hasil darab $${a * b}$ dan hasil tambah $${a + b}$: $${a}$ dan $${b}$`);
  const g14e = [
    (r) => {
      const p = r.nz(-6, 6), q = r.nz(-6, 6);
      const f = (v) => `(x ${v < 0 ? '-' : '+'} ${Math.abs(v)})`;
      return { q: T(`Solve $${f(p)}${f(q)} = 0$.`, `Selesaikan $${f(p)}${f(q)} = 0$.`), a: T(`$x = ${-p}$ or $x = ${-q}$`, `$x = ${-p}$ atau $x = ${-q}$`), w: W(...ZS(1, p, 1, q).slice(1)), sp: 's' };
    },
    (r) => {
      const p = r.nz(-8, 8), q = r.nz(-8, 8);
      need(p !== -q);
      return { q: T(`Solve $${Q(1, p + q, p * q)} = 0$ by factorisation.`, `Selesaikan $${Q(1, p + q, p * q)} = 0$ dengan pemfaktoran.`), a: T(`$x = ${-p}$ or $x = ${-q}$`, `$x = ${-p}$ atau $x = ${-q}$`), w: W(pairLine(p, q), ...ZS(1, p, 1, q)), sp: 'm' };
    },
  ];
  const g14m = [
    (r) => {
      const u = r.pick([2, 3]), p = r.int(1, 4), q = r.nz(-4, 4);
      need(gcd(u, Math.abs(q)) === 1);
      return { q: T(`Solve $${Q(u, u * q + p, p * q)} = 0$.`, `Selesaikan $${Q(u, u * q + p, p * q)} = 0$.`), a: T(`$x = ${frT(fr(-p, u))}$ or $x = ${-q}$`, `$x = ${frT(fr(-p, u))}$ atau $x = ${-q}$`), w: W(...ZS(u, p, 1, q)), sp: 'm' };
    },
    (r) => {
      const a = r.int(1, 6), b = -r.int(1, 6);
      need(a + b !== 0);
      const bb = a + b;
      return { q: T(`Solve $x^2 ${bb < 0 ? '-' : '+'} ${Math.abs(bb)}x = ${-a * b}$.`, `Selesaikan $x^2 ${bb < 0 ? '-' : '+'} ${Math.abs(bb)}x = ${-a * b}$.`), a: T(`$x = ${-a}$ or $x = ${-b}$`, `$x = ${-a}$ atau $x = ${-b}$`), w: W(`$${Q(1, bb, a * b)} = 0$`, ...ZS(1, a, 1, b)), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 8);
      return { q: T(`Solve $x^2 = ${a * a}$ and $x^2 - ${a}x = 0$.`, `Selesaikan $x^2 = ${a * a}$ dan $x^2 - ${a}x = 0$.`), a: T(`$x = \\pm ${a}$; $x = 0$ or $x = ${a}$`, `$x = \\pm ${a}$; $x = 0$ atau $x = ${a}$`), w: W(`$x^2 = ${a * a} \\Rightarrow x = \\pm\\sqrt{${a * a}} = \\pm ${a}$`, ...ZS(1, 0, 1, -a)), sp: 'm' };
    },
  ];
  const g14a = [
    (r) => {
      const a = r.int(2, 4), p = r.int(1, 3), q = r.int(1, 4);
      need(gcd(a, q) === 1);
      // (a x - p)(x + q) = a x^2 + (aq - p)x - pq
      const b = a * q - p, c = -p * q;
      return { q: T(`Solve $${Q(a, b, c)} = 0$.`, `Selesaikan $${Q(a, b, c)} = 0$.`), a: T(`$x = ${frT(fr(p, a))}$ or $x = ${-q}$`, `$x = ${frT(fr(p, a))}$ atau $x = ${-q}$`), w: W(...ZS(a, -p, 1, q)), sp: 'm' };
    },
    (r) => {
      const u = r.int(2, 3), v = r.int(1, 2), p = r.nz(-4, 4), q = r.nz(-4, 4);
      // (u x + p)(v x + q) = uv x^2 + (uq + vp) x + pq ; present as uv x^2 + ... = k x form
      const A = u * v, B = u * q + v * p, C = p * q;
      need(gcd(u, Math.abs(p)) === 1 && gcd(v, Math.abs(q)) === 1 && !Fr.eq(fr(-p, u), fr(-q, v)));
      const extra = r.int(1, 3);
      return { q: T(`Solve $${A}x^2 + ${n(B + extra)}x ${C < 0 ? '-' : '+'} ${Math.abs(C)} = ${extra}x$.`.replace('+ -', '- '), `Selesaikan $${A}x^2 + ${n(B + extra)}x ${C < 0 ? '-' : '+'} ${Math.abs(C)} = ${extra}x$.`.replace('+ -', '- ')), a: T(`$x = ${frT(fr(-p, u))}$ or $x = ${frT(fr(-q, v))}$`, `$x = ${frT(fr(-p, u))}$ atau $x = ${frT(fr(-q, v))}$`), w: W(T(`Move $${extra}x$ to the left: $${Q(A, B, C)} = 0$`, `Pindahkan $${extra}x$ ke kiri: $${Q(A, B, C)} = 0$`), ...ZS(u, p, v, q)), sp: 'm' };
    },
  ];
  const g15e = [
    (r) => {
      const p = r.int(-4, 0), q = r.int(1, 4);
      const fig = S.plane({ x: [-6, 6], y: [-8, 8], scale: 15, labelStep: 2, curves: [{ f: (x) => (x - p) * (x - q) }] });
      return { q: T('The graph of a quadratic function is shown. State the $x$-intercepts, the $y$-intercept and whether the graph has a maximum or a minimum point.', 'Graf suatu fungsi kuadratik ditunjukkan. Nyatakan pintasan-$x$, pintasan-$y$ dan sama ada graf itu mempunyai titik maksimum atau minimum.'), fig, a: T(`$x$-intercepts ${p} and ${q}; $y$-intercept ${p * q}; minimum point`, `Pintasan-$x$ ${p} dan ${q}; pintasan-$y$ ${p * q}; titik minimum`), w: W(T(`The graph cuts the $x$-axis at $x = ${p}$ and $x = ${q}$`, `Graf memotong paksi-$x$ pada $x = ${p}$ dan $x = ${q}$`), T(`It cuts the $y$-axis at $(0, ${p * q})$`, `Graf memotong paksi-$y$ di $(0, ${p * q})$`), T('It opens upwards, so it has a minimum point', 'Graf terbuka ke atas, maka ia mempunyai titik minimum')), sp: 's' };
    },
  ];
  const g15m = [
    (r) => {
      const a = r.pick([1, -1, 2]), p = r.int(-1, 1), q = r.int(-3, 3);
      const b = -2 * a * p, c = a * p * p + q;
      const xs = range(-3, 3);
      const tab = SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]]);
      return { q: T(`Complete the table of values for $y = ${Q(a, b, c)}$ and sketch its graph, showing the axis of symmetry and the ${a > 0 ? 'minimum' : 'maximum'} point.<br>${tab}`, `Lengkapkan jadual nilai bagi $y = ${Q(a, b, c)}$ dan lakar grafnya, dengan menunjukkan paksi simetri dan titik ${a > 0 ? 'minimum' : 'maksimum'}.<br>${tab}`), fig: S.plane({ x: [-4, 4], y: [-8, 10], scale: 14, labelStep: 2 }), a: T(`$y = ${xs.map((x) => a * x * x + b * x + c).join(', ')}$; axis $x = ${p}$; ${a > 0 ? 'minimum' : 'maximum'} point $(${p}, ${q})$`, `$y = ${xs.map((x) => a * x * x + b * x + c).join(', ')}$; paksi $x = ${p}$; titik ${a > 0 ? 'minimum' : 'maksimum'} $(${p}, ${q})$`), w: W(T(`Substitute each $x$, e.g. $x = ${xs[0]}$: $y = ${subQ(a, b, c, xs[0])} = ${a * xs[0] * xs[0] + b * xs[0] + c}$`, `Gantikan setiap $x$, cth. $x = ${xs[0]}$: $y = ${subQ(a, b, c, xs[0])} = ${a * xs[0] * xs[0] + b * xs[0] + c}$`), T(`Axis of symmetry: $x = -\\dfrac{b}{2a} = -\\dfrac{${b}}{2(${a})} = ${p}$`, `Paksi simetri: $x = -\\dfrac{b}{2a} = -\\dfrac{${b}}{2(${a})} = ${p}$`), T(`$x = ${p}$: $y = ${subQ(a, b, c, p)} = ${q}$, ${a > 0 ? 'minimum' : 'maximum'} point $(${p}, ${q})$ since $a ${a > 0 ? '>' : '<'} 0$`, `$x = ${p}$: $y = ${subQ(a, b, c, p)} = ${q}$, titik ${a > 0 ? 'minimum' : 'maksimum'} $(${p}, ${q})$ kerana $a ${a > 0 ? '>' : '<'} 0$`)), sp: 'xs' };
    },
  ];
  const g15a = [
    (r) => {
      const p = r.int(1, 3), q = r.int(-3, -1), a = r.pick([1, 2, -1]);
      const fig = S.plane({ x: [-5, 5], y: [-10, 10], scale: 14, labelStep: 2, curves: [{ f: (x) => a * (x - p) * (x - q) }], pts: [{ x: 0, y: a * p * q, l: '' }] });
      return { q: T(`The graph of a quadratic function cuts the $x$-axis at $x = ${q}$ and $x = ${p}$ and the $y$-axis at $(0, ${a * p * q})$. Find the equation of the function.`, `Graf suatu fungsi kuadratik memotong paksi-$x$ pada $x = ${q}$ dan $x = ${p}$ dan paksi-$y$ di $(0, ${a * p * q})$. Cari persamaan fungsi itu.`), fig, a: T(`$y = ${a === 1 ? '' : a === -1 ? '-' : a}(x - ${p})(x + ${-q})$, i.e. $y = ${Q(a, -a * (p + q), a * p * q)}$`, `$y = ${a === 1 ? '' : a === -1 ? '-' : a}(x - ${p})(x + ${-q})$, iaitu $y = ${Q(a, -a * (p + q), a * p * q)}$`), w: W(T(`Roots $${p}$ and $${q}$: $y = a(x - ${p})(x + ${-q})$`, `Punca $${p}$ dan $${q}$: $y = a(x - ${p})(x + ${-q})$`), T(`Substitute $(0, ${a * p * q})$: $a(0 - ${p})(0 + ${-q}) = ${a * p * q}$`, `Gantikan $(0, ${a * p * q})$: $a(0 - ${p})(0 + ${-q}) = ${a * p * q}$`), `$${p * q}a = ${a * p * q} \\Rightarrow a = ${a}$`, `$y = ${Q(a, -a * (p + q), a * p * q)}$`), sp: 'm' };
    },
  ];
  const g16e = [
    (r) => {
      const a = r.int(2, 6), b = a + r.int(1, 5), A = a * b;
      return { q: T(`The length of a rectangle is $${b - a}$ cm more than its width $x$ cm. Its area is ${A} cm². Form an equation and find the width.`, `Panjang sebuah segi empat tepat lebih $${b - a}$ cm daripada lebarnya $x$ cm. Luasnya ialah ${A} cm². Bentukkan persamaan dan cari lebarnya.`), a: T(`$x(x + ${b - a}) = ${A}$; $x = ${a}$ cm (reject $x = -${b}$)`, `$x(x + ${b - a}) = ${A}$; $x = ${a}$ cm (tolak $x = -${b}$)`), w: W(`$x(x + ${b - a}) = ${A}$`, `$${Q(1, b - a, -A)} = 0$`, pairLine(-a, b), ...ZS(1, -a, 1, b), T(`A width cannot be negative, so reject $x = -${b}$: width $= ${a}$ cm`, `Lebar tidak boleh negatif, maka tolak $x = -${b}$: lebar $= ${a}$ cm`)), sp: 'm' };
    },
  ];
  const g16m = [
    (r) => {
      const a = r.int(3, 9);
      return { q: T(`The product of two consecutive positive integers is ${a * (a + 1)}. Form a quadratic equation and find the integers.`, `Hasil darab dua integer positif berturutan ialah ${a * (a + 1)}. Bentukkan persamaan kuadratik dan cari integer itu.`), a: T(`$x(x + 1) = ${a * (a + 1)}$; $${a}$ and $${a + 1}$`, `$x(x + 1) = ${a * (a + 1)}$; $${a}$ dan $${a + 1}$`), w: W(T(`Let the integers be $x$ and $x + 1$: $x(x + 1) = ${a * (a + 1)}$`, `Katakan integer itu $x$ dan $x + 1$: $x(x + 1) = ${a * (a + 1)}$`), `$${Q(1, 1, -a * (a + 1))} = 0$`, pairLine(-a, a + 1), ...ZS(1, -a, 1, a + 1), T(`The integers are positive, so $x = ${a}$: $${a}$ and $${a + 1}$`, `Integer itu positif, maka $x = ${a}$: $${a}$ dan $${a + 1}$`)), sp: 'm' };
    },
  ];
  const g16a = [
    (r) => {
      const s = r.int(3, 8), h = r.int(2, 6);
      // triangle base (x+h... ) area: 1/2 x (x + k) = A
      const x = s, k = r.int(1, 5);
      const A = (x * (x + k)) / 2;
      need(Number.isInteger(A));
      return { q: T(`The base of a triangle is $x$ cm and its height is $(x + ${k})$ cm. The area is ${A} cm². Form and solve a quadratic equation to find $x$, and state which solution is rejected.`, `Tapak sebuah segi tiga ialah $x$ cm dan tingginya $(x + ${k})$ cm. Luasnya ialah ${A} cm². Bentukkan dan selesaikan persamaan kuadratik untuk mencari $x$, dan nyatakan penyelesaian yang ditolak.`), a: T(`$\\dfrac{1}{2}x(x + ${k}) = ${A}$, $x^2 + ${k}x - ${2 * A} = 0$; $x = ${x}$; reject $x = -${x + k}$ (length cannot be negative)`, `$\\dfrac{1}{2}x(x + ${k}) = ${A}$, $x^2 + ${k}x - ${2 * A} = 0$; $x = ${x}$; tolak $x = -${x + k}$ (panjang tidak boleh negatif)`), w: W(`$\\dfrac{1}{2}x(x + ${k}) = ${A}$`, `$x^2 + ${k}x = ${2 * A}$`, `$x^2 + ${k}x - ${2 * A} = 0$`, pairLine(-x, x + k), ...ZS(1, -x, 1, x + k), T(`A length cannot be negative, so reject $x = -${x + k}$: $x = ${x}$`, `Panjang tidak boleh negatif, maka tolak $x = -${x + k}$: $x = ${x}$`)), sp: 'l' };
    },
  ];
  SPM.addChapter(4, 1, T('Quadratic Functions and Equations in One Variable', 'Fungsi dan Persamaan Kuadratik dalam Satu Pemboleh Ubah'), [
    { id: '1.1', en: 'Characteristics of quadratic expressions, functions and equations', ms: 'Ciri-ciri ungkapan, fungsi dan persamaan kuadratik', gen: { e: g11e, m: g11m, a: g11a } },
    { id: '1.2', en: 'Effects of a, b and c', ms: 'Kesan a, b dan c', gen: { e: g12e, m: g12m, a: g12a } },
    { id: '1.3', en: 'Forming a quadratic function and interpreting roots', ms: 'Membentuk fungsi kuadratik dan mentafsir punca', gen: { e: g13e, m: g13m, a: g13a } },
    { id: '1.4', en: 'Solving quadratic equations by factorisation', ms: 'Menyelesaikan persamaan kuadratik dengan pemfaktoran', gen: { e: g14e, m: g14m, a: g14a } },
    { id: '1.5', en: 'Sketching and matching quadratic graphs', ms: 'Melakar dan memadankan graf kuadratik', gen: { e: g15e, m: g15m, a: g15a } },
    { id: '1.6', en: 'Problems involving quadratic equations', ms: 'Masalah yang melibatkan persamaan kuadratik', gen: { e: g16e, m: g16m, a: g16a } },
  ]);

  /* =============================================================== 2 */
  const DIG = '0123456789';
  const toBase = (v, b) => (v === 0 ? '0' : (() => { let s = ''; while (v > 0) { s = DIG[v % b] + s; v = Math.floor(v / b); } return s; })());
  const fromBase = (s, b) => s.split('').reduce((t, d) => t * b + +d, 0);
  const nb = (s, b) => `${s}_{${b}}`;
  /** place-value expansion d x b^k + … of digit string s (a digit may be a letter such as k) */
  const expand = (s, b) => s.split('').map((d, i) => `${d} \\times ${b}^{${s.length - 1 - i}}`).join(' + ');
  /** repeated division of v by b: one line per division, then read the remainders upwards */
  const divSteps = (v, b) => {
    const out = [];
    for (let x = v; x > 0; x = Math.floor(x / b)) out.push(T(`$${x} \\div ${b} = ${Math.floor(x / b)}$ remainder $${x % b}$`, `$${x} \\div ${b} = ${Math.floor(x / b)}$ baki $${x % b}$`));
    out.push(T(`Read the remainders from bottom to top: $${nb(toBase(v, b), b)}$`, `Baca baki dari bawah ke atas: $${nb(toBase(v, b), b)}$`));
    return out;
  };
  const g21e = [
    (r) => {
      const b = r.pick([2, 5, 8]), v = r.int(5, 50);
      const s = toBase(v, b);
      return { q: T(`Convert $${nb(s, b)}$ to a number in base 10.`, `Tukarkan $${nb(s, b)}$ kepada nombor dalam asas 10.`), a: T(`$${v}$`), w: T(`$${nb(s, b)} = ${expand(s, b)} = ${v}$`), sp: 's' };
    },
    (r) => {
      const b = r.pick([2, 5, 8]), v = r.int(9, 50);
      return { q: T(`Convert $${v}$ to a number in base ${b}.`, `Tukarkan $${v}$ kepada nombor dalam asas ${b}.`), a: T(`$${nb(toBase(v, b), b)}$`), w: W(...divSteps(v, b)), sp: 's' };
    },
  ];
  const g21m = [
    (r) => {
      const b = r.int(2, 9), v = r.int(100, 500);
      return { q: T(`Convert $${v}$ to base ${b}.`, `Tukarkan $${v}$ kepada asas ${b}.`), a: T(`$${nb(toBase(v, b), b)}$`), w: W(...divSteps(v, b)), sp: 'm' };
    },
    (r) => {
      const [b1, b2] = r.sample([2, 3, 4, 5, 6, 7, 8, 9], 2);
      const v = r.int(20, 200);
      return { q: T(`Convert $${nb(toBase(v, b1), b1)}$ to base ${b2}.`, `Tukarkan $${nb(toBase(v, b1), b1)}$ kepada asas ${b2}.`), a: T(`$${nb(toBase(v, b2), b2)}$`), w: W(T(`Base ${b1} → base 10: $${nb(toBase(v, b1), b1)} = ${expand(toBase(v, b1), b1)} = ${v}$`, `Asas ${b1} → asas 10: $${nb(toBase(v, b1), b1)} = ${expand(toBase(v, b1), b1)} = ${v}$`), T(`Base 10 → base ${b2}:`, `Asas 10 → asas ${b2}:`), ...divSteps(v, b2)), sp: 'm' };
    },
  ];
  const addBase = (a, b, base) => toBase(fromBase(a, base) + fromBase(b, base), base);
  const g21a = [
    (r) => {
      const base = r.pick([5, 6, 7, 8]);
      const a = toBase(r.int(60, 300), base), b = toBase(r.int(60, 300), base);
      const add = r.chance();
      const va = fromBase(a, base), vb = fromBase(b, base);
      need(add || va > vb);
      return { q: T(`Calculate $${nb(a, base)} ${add ? '+' : '-'} ${nb(b, base)}$, giving the answer in base ${base}.`, `Hitung $${nb(a, base)} ${add ? '+' : '-'} ${nb(b, base)}$, dengan memberikan jawapan dalam asas ${base}.`), a: T(`$${nb(toBase(add ? va + vb : va - vb, base), base)}$`), w: W(`$${nb(a, base)} = ${expand(a, base)} = ${va}$`, `$${nb(b, base)} = ${expand(b, base)} = ${vb}$`, `$${va} ${add ? '+' : '-'} ${vb} = ${add ? va + vb : va - vb}$`, ...divSteps(add ? va + vb : va - vb, base)), sp: 'm' };
    },
    (r) => {
      const base = r.pick([5, 6, 7, 8, 9]);
      const v = r.int(30, 150);
      const s = toBase(v, base);
      const pos = r.int(0, s.length - 1);
      const shown = s.slice(0, pos) + 'k' + s.slice(pos + 1);
      return { q: T(`The number $${nb(shown, base)}$ in base ${base} equals ${v} in base 10. Find the digit $k$.`, `Nombor $${nb(shown, base)}$ dalam asas ${base} sama dengan ${v} dalam asas 10. Cari digit $k$.`), a: T(`$k = ${s[pos]}$`), w: W(`$${expand(shown, base)} = ${v}$`, `$${poly([[base ** (s.length - 1 - pos), 'k'], [v - (+s[pos]) * base ** (s.length - 1 - pos), '']])} = ${v}$`, `$${base ** (s.length - 1 - pos) === 1 ? '' : base ** (s.length - 1 - pos)}k = ${(+s[pos]) * base ** (s.length - 1 - pos)} \\Rightarrow k = ${s[pos]}$`), sp: 'm' };
    },
  ];
  const g21Ee = [
    (r) => {
      const v = r.int(20, 250);
      const b2 = toBase(v, 2);
      const pad = b2.padStart(Math.ceil(b2.length / 3) * 3, '0');
      const oct = toBase(v, 8);
      return { q: T(`Convert $${nb(b2, 2)}$ to base 8 by grouping the digits in threes.`, `Tukarkan $${nb(b2, 2)}$ kepada asas 8 dengan mengumpulkan digit dalam kumpulan tiga.`), a: T(`$${pad.match(/.{3}/g).join('\\ ')}$ gives $${nb(oct, 8)}$`, `$${pad.match(/.{3}/g).join('\\ ')}$ memberi $${nb(oct, 8)}$`), w: W(T(`Group from the right in threes${pad !== b2 ? ', adding zeros in front' : ''}: $${pad.match(/.{3}/g).join('\\ ')}$`, `Kumpulkan dari kanan dalam kumpulan tiga${pad !== b2 ? ', tambah sifar di hadapan' : ''}: $${pad.match(/.{3}/g).join('\\ ')}$`), T(`Each group of three is one base 8 digit: $${pad.match(/.{3}/g).map((g) => `${nb(g, 2)} = ${parseInt(g, 2)}`).join(',\\ ')}$`, `Setiap kumpulan tiga ialah satu digit asas 8: $${pad.match(/.{3}/g).map((g) => `${nb(g, 2)} = ${parseInt(g, 2)}`).join(',\\ ')}$`), `$${nb(b2, 2)} = ${nb(oct, 8)}$`), sp: 'm' };
    },
  ];
  SPM.addChapter(4, 2, T('Number Bases', 'Asas Nombor'), [
    { id: '2.1', en: 'Number bases', ms: 'Asas nombor', gen: { e: g21e, m: g21m, a: g21a } },
    { id: '2.1E', en: 'Base 2 and base 8 grouping', ms: 'Pengumpulan asas 2 dan asas 8', scope: 'enrichment', gen: { e: g21Ee, m: g21Ee, a: g21Ee } },
  ]);

  /* =============================================================== 3 */
  const STM = [
    { s: T('5 is a prime number.', '5 ialah nombor perdana.'), v: true, why: T('The only factors of 5 are 1 and 5.', 'Faktor bagi 5 hanyalah 1 dan 5.'), neg: T('5 is not a prime number.', '5 bukan nombor perdana.') },
    { s: T('12 is a multiple of 5.', '12 ialah gandaan 5.'), v: false, why: T('$12 \\div 5 = 2.4$ is not a whole number.', '$12 \\div 5 = 2.4$ bukan nombor bulat.'), neg: T('12 is not a multiple of 5.', '12 bukan gandaan 5.') },
    { s: T('A triangle has three sides.', 'Sebuah segi tiga mempunyai tiga sisi.'), v: true, why: T('By definition, a triangle is a polygon with three sides.', 'Mengikut takrif, segi tiga ialah poligon dengan tiga sisi.'), neg: T('A triangle does not have three sides.', 'Sebuah segi tiga tidak mempunyai tiga sisi.') },
    { s: T('$7 + 6 = 14$.', '$7 + 6 = 14$.'), v: false, why: T('$7 + 6 = 13$, not 14.', '$7 + 6 = 13$, bukan 14.'), neg: T('$7 + 6 \\neq 14$.', '$7 + 6 \\neq 14$.') },
    { s: T('The square root of 49 is 7.', 'Punca kuasa dua bagi 49 ialah 7.'), v: true, why: T('$7^2 = 7 \\times 7 = 49$.', '$7^2 = 7 \\times 7 = 49$.'), neg: T('The square root of 49 is not 7.', 'Punca kuasa dua bagi 49 bukan 7.') },
    { s: T('$2^3 = 6$.', '$2^3 = 6$.'), v: false, why: T('$2^3 = 2 \\times 2 \\times 2 = 8$, not 6.', '$2^3 = 2 \\times 2 \\times 2 = 8$, bukan 6.'), neg: T('$2^3 \\neq 6$.', '$2^3 \\neq 6$.') },
  ];
  const NON = [T('What is the capital of Malaysia?', 'Apakah ibu negara Malaysia?'), T('Close the door.', 'Tutup pintu itu.'), T('What a lovely day!', 'Alangkah indahnya hari ini!'), T('Is 8 an even number?', 'Adakah 8 nombor genap?')];
  const g31e = [
    (r) => {
      const st = r.pick(STM), non = r.pick(NON);
      const list = r.shuffle([[st.s, true], [non, false]]);
      return { q: T(`Which of these is a statement? (A) ${list[0][0].en} (B) ${list[1][0].en} State its truth value.`, `Antara yang berikut, yang manakah pernyataan? (A) ${list[0][0].ms} (B) ${list[1][0].ms} Nyatakan nilai kebenarannya.`), a: T(`(${list[0][1] ? 'A' : 'B'}); ${st.v ? 'true' : 'false'}`, `(${list[0][1] ? 'A' : 'B'}); ${st.v ? 'benar' : 'palsu'}`), w: W(T(`A statement is a sentence that is either true or false – not a question, command or exclamation: (${list[0][1] ? 'A' : 'B'})`, `Pernyataan ialah ayat yang sama ada benar atau palsu – bukan soalan, arahan atau seruan: (${list[0][1] ? 'A' : 'B'})`), T(`${st.why.en} So it is ${st.v ? 'true' : 'false'}.`, `${st.why.ms} Maka ia ${st.v ? 'benar' : 'palsu'}.`)), sp: 's' };
    },
    (r) => {
      const st = r.pick(STM);
      return { q: T(`Write the negation of the statement: "${st.s.en}" Is the negation true or false?`, `Tulis penafian bagi pernyataan: "${st.s.ms}" Adakah penafian itu benar atau palsu?`), a: T(`${st.neg.en} ${st.v ? 'False' : 'True'}`, `${st.neg.ms} ${st.v ? 'Palsu' : 'Benar'}`), w: W(T('Negation: insert "not" – it reverses the truth value.', 'Penafian: masukkan "bukan"/"tidak" – nilai kebenaran bertukar.'), T(`${st.why.en} The statement is ${st.v ? 'true' : 'false'}, so its negation is ${st.v ? 'false' : 'true'}.`, `${st.why.ms} Pernyataan itu ${st.v ? 'benar' : 'palsu'}, maka penafiannya ${st.v ? 'palsu' : 'benar'}.`)), sp: 's' };
    },
  ];
  const g31m = [
    (r) => {
      const D = r.pick([[[2, 4, 6, 8, 10], 'even numbers', 'nombor genap'], [[3, 6, 9, 12], 'multiples of 3', 'gandaan 3']]);
      const set = D[0];
      const k = D[2].includes('3') ? 3 : 2;
      return { q: T(`Set $S = \\{${set.join(', ')}\\}$. Write the negation of "All elements of $S$ are ${k === 3 ? 'odd' : 'greater than 3'}" and determine which of the two statements is true.`, `Set $S = \\{${set.join(', ')}\\}$. Tulis penafian bagi "Semua unsur $S$ ialah ${k === 3 ? 'ganjil' : 'lebih besar daripada 3'}" dan tentukan yang manakah antara dua pernyataan itu benar.`), a: k === 3 ? T('"At least one element of $S$ is not odd (is even)." The negation is true (e.g. 6); the original is false.', '"Sekurang-kurangnya satu unsur $S$ bukan ganjil (genap)." Penafian itu benar (cth. 6); pernyataan asal palsu.') : T('"At least one element of $S$ is not greater than 3." The negation is true (2 is not greater than 3); the original is false.', '"Sekurang-kurangnya satu unsur $S$ tidak lebih besar daripada 3." Penafian itu benar (2 tidak lebih besar daripada 3); pernyataan asal palsu.'), w: W(T('The negation of "All … are …" is "At least one … is not …" (not "All … are not …").', 'Penafian bagi "Semua … ialah …" ialah "Sekurang-kurangnya satu … bukan …" (bukan "Semua … bukan …").'), k === 3 ? T('$6 \\in S$ is even, so "all are odd" is false and its negation is true.', '$6 \\in S$ ialah genap, maka "semua ganjil" palsu dan penafiannya benar.') : T('$2 \\in S$ and $2 < 3$, so "all are greater than 3" is false and its negation is true.', '$2 \\in S$ dan $2 < 3$, maka "semua lebih besar daripada 3" palsu dan penafiannya benar.')), sp: 's' };
    },
    (r) => {
      const p = r.pick(STM), q = r.pick(STM.filter((x) => x !== p));
      const and = r.chance();
      const v = and ? p.v && q.v : p.v || q.v;
      return { q: T(`Statement $p$: "${p.s.en}" Statement $q$: "${q.s.en}" State whether "$p$ ${and ? 'and' : 'or'} $q$" is true or false.`, `Pernyataan $p$: "${p.s.ms}" Pernyataan $q$: "${q.s.ms}" Nyatakan sama ada "$p$ ${and ? 'dan' : 'atau'} $q$" benar atau palsu.`), a: T(`${v ? 'True' : 'False'} ($p$ is ${p.v ? 'true' : 'false'}, $q$ is ${q.v ? 'true' : 'false'})`, `${v ? 'Benar' : 'Palsu'} ($p$ ${p.v ? 'benar' : 'palsu'}, $q$ ${q.v ? 'benar' : 'palsu'})`), w: W(T(`$p$: ${p.why.en} ($p$ is ${p.v ? 'true' : 'false'})`, `$p$: ${p.why.ms} ($p$ ${p.v ? 'benar' : 'palsu'})`), T(`$q$: ${q.why.en} ($q$ is ${q.v ? 'true' : 'false'})`, `$q$: ${q.why.ms} ($q$ ${q.v ? 'benar' : 'palsu'})`), and ? T(`"$p$ and $q$" is true only when both are true: ${v ? 'true' : 'false'}`, `"$p$ dan $q$" benar hanya apabila kedua-duanya benar: ${v ? 'benar' : 'palsu'}`) : T(`"$p$ or $q$" is true when at least one is true: ${v ? 'true' : 'false'}`, `"$p$ atau $q$" benar apabila sekurang-kurangnya satu benar: ${v ? 'benar' : 'palsu'}`)), sp: 's' };
    },
  ];
  const g31a = [
    (r) => {
      const c = r.pick([['p and q', 'p dan q', true, 'both $p$ and $q$ are true', '$p$ dan $q$ kedua-duanya benar'], ['p or q', 'p atau q', false, 'both $p$ and $q$ are false', '$p$ dan $q$ kedua-duanya palsu']]);
      return c[2]
        ? { q: T('The compound statement "$p$ and $q$" is true. What can you say about the truth values of $p$ and $q$?', 'Pernyataan majmuk "$p$ dan $q$" adalah benar. Apakah yang boleh anda katakan tentang nilai kebenaran $p$ dan $q$?'), a: T('Both $p$ and $q$ must be true.', '$p$ dan $q$ mesti kedua-duanya benar.'), w: T('"$p$ and $q$" is true only in the row where $p$ is true and $q$ is true; if either were false, "$p$ and $q$" would be false.', '"$p$ dan $q$" benar hanya dalam baris dengan $p$ benar dan $q$ benar; jika salah satu palsu, "$p$ dan $q$" palsu.'), sp: 's' }
        : { q: T('The compound statement "$p$ or $q$" is false. What can you say about the truth values of $p$ and $q$?', 'Pernyataan majmuk "$p$ atau $q$" adalah palsu. Apakah yang boleh anda katakan tentang nilai kebenaran $p$ dan $q$?'), a: T('Both $p$ and $q$ must be false.', '$p$ dan $q$ mesti kedua-duanya palsu.'), w: T('"$p$ or $q$" is true as soon as one of $p$, $q$ is true, so it is false only when both are false.', '"$p$ atau $q$" benar jika salah satu daripada $p$, $q$ benar, maka ia palsu hanya apabila kedua-duanya palsu.'), sp: 's' };
    },
    (r) => ({ q: T('Complete the truth table for $p$ and $q$ giving the truth value of $p \\wedge q$ and $p \\vee q$ for all four combinations of truth values of $p$ and $q$.', 'Lengkapkan jadual kebenaran bagi $p$ dan $q$ dengan memberikan nilai kebenaran bagi $p \\wedge q$ dan $p \\vee q$ untuk keempat-empat gabungan nilai kebenaran $p$ dan $q$.'), a: T(SPM.table([['T', 'T', 'T', 'T'], ['T', 'F', 'F', 'T'], ['F', 'T', 'F', 'T'], ['F', 'F', 'F', 'F']], { head: ['$p$', '$q$', '$p \\wedge q$', '$p \\vee q$'] }), SPM.table([['B', 'B', 'B', 'B'], ['B', 'P', 'P', 'B'], ['P', 'B', 'P', 'B'], ['P', 'P', 'P', 'P']], { head: ['$p$', '$q$', '$p \\wedge q$', '$p \\vee q$'] })), w: W(T('$p \\wedge q$ ($p$ and $q$) is true only when both $p$ and $q$ are true.', '$p \\wedge q$ ($p$ dan $q$) benar hanya apabila $p$ dan $q$ kedua-duanya benar.'), T('$p \\vee q$ ($p$ or $q$) is false only when both $p$ and $q$ are false.', '$p \\vee q$ ($p$ atau $q$) palsu hanya apabila $p$ dan $q$ kedua-duanya palsu.')), sp: 'm' }),
  ];
  const IMP = [
    { p: T('a number is divisible by 6', 'suatu nombor boleh dibahagi tepat dengan 6'), q: T('it is divisible by 3', 'ia boleh dibahagi tepat dengan 3'), iv: true, cv: false, cex: T('9 is divisible by 3 but not by 6', '9 boleh dibahagi tepat dengan 3 tetapi tidak dengan 6') },
    { p: T('a shape is a square', 'suatu bentuk ialah segi empat sama'), q: T('it is a rectangle', 'ia ialah segi empat tepat'), iv: true, cv: false, cex: T('a rectangle 3 cm by 5 cm is not a square', 'segi empat tepat 3 cm kali 5 cm bukan segi empat sama') },
    { p: T('$x = 3$', '$x = 3$'), q: T('$x^2 = 9$', '$x^2 = 9$'), iv: true, cv: false, cex: T('$x = -3$ gives $x^2 = 9$', '$x = -3$ memberikan $x^2 = 9$') },
    { p: T('a number ends with 0', 'suatu nombor berakhir dengan 0'), q: T('it is divisible by 5', 'ia boleh dibahagi tepat dengan 5'), iv: true, cv: false, cex: T('15 is divisible by 5 but does not end with 0', '15 boleh dibahagi tepat dengan 5 tetapi tidak berakhir dengan 0') },
  ];
  const g32e = [
    (r) => {
      const c = r.pick(IMP);
      return { q: T(`Write the converse of the implication "If ${c.p.en}, then ${c.q.en}."`, `Tulis akas bagi implikasi "Jika ${c.p.ms}, maka ${c.q.ms}."`), a: T(`If ${c.q.en}, then ${c.p.en}.`, `Jika ${c.q.ms}, maka ${c.p.ms}.`), w: W(T('The converse of "If $p$, then $q$" is "If $q$, then $p$": swap the antecedent and the consequent.', 'Akas bagi "Jika $p$, maka $q$" ialah "Jika $q$, maka $p$": tukar antejadian dengan akibat.'), T(`$p$: ${c.p.en}; $q$: ${c.q.en}`, `$p$: ${c.p.ms}; $q$: ${c.q.ms}`)), sp: 's' };
    },
  ];
  const g32m = [
    (r) => {
      const c = r.pick(IMP);
      return { q: T(`For the implication "If ${c.p.en}, then ${c.q.en}", write (a) the converse, (b) the inverse, (c) the contrapositive, and state whether each is true or false.`, `Bagi implikasi "Jika ${c.p.ms}, maka ${c.q.ms}", tulis (a) akas, (b) songsang, (c) kontrapositif, dan nyatakan sama ada setiap satu benar atau palsu.`), a: T(`(a) If ${c.q.en}, then ${c.p.en}: false (${c.cex.en}). (b) If not (${c.p.en}), then not (${c.q.en}): false (same counterexample). (c) If not (${c.q.en}), then not (${c.p.en}): true (equivalent to the original).`, `(a) Jika ${c.q.ms}, maka ${c.p.ms}: palsu (${c.cex.ms}). (b) Jika bukan (${c.p.ms}), maka bukan (${c.q.ms}): palsu (contoh bertentang yang sama). (c) Jika bukan (${c.q.ms}), maka bukan (${c.p.ms}): benar (setara dengan yang asal).`), w: W(T('Converse: if $q$, then $p$. Inverse: if $\\sim p$, then $\\sim q$. Contrapositive: if $\\sim q$, then $\\sim p$.', 'Akas: jika $q$, maka $p$. Songsangan: jika $\\sim p$, maka $\\sim q$. Kontrapositif: jika $\\sim q$, maka $\\sim p$.'), T(`The original implication is true, and the contrapositive always has the same truth value, so (c) is true.`, `Implikasi asal adalah benar, dan kontrapositif sentiasa mempunyai nilai kebenaran yang sama, maka (c) benar.`), T(`Counterexample to the converse: ${c.cex.en}; the inverse is equivalent to the converse, so it is false too.`, `Contoh bertentang bagi akas: ${c.cex.ms}; songsangan setara dengan akas, maka ia juga palsu.`)), sp: 'l' };
    },
  ];
  const notEn = (x) => `it is not true that ${x}`;
  const notMs = (x) => `tidak benar bahawa ${x}`;
  const KINDS = [
    { valid: true, prem: (c) => [c.p.en, c.p.ms], concl: (c) => [c.q.en, c.q.ms], how: T('Form: if $p$, then $q$; $p$ is true; therefore $q$ is true. This is a valid form.', 'Bentuk: jika $p$, maka $q$; $p$ benar; maka $q$ benar. Ini bentuk hujah yang sah.') },
    { valid: false, prem: (c) => [c.q.en, c.q.ms], concl: (c) => [c.p.en, c.p.ms], how: T('Premise 2 states the consequent $q$ and concludes $p$ – this uses the converse, which is not a valid form.', 'Premis 2 menyatakan akibat $q$ dan menyimpulkan $p$ – ini menggunakan akas, bukan bentuk hujah yang sah.') },
    { valid: true, prem: (c) => [notEn(c.q.en), notMs(c.q.ms)], concl: (c) => [notEn(c.p.en), notMs(c.p.ms)], how: T('Form: if $p$, then $q$; $q$ is not true; therefore $p$ is not true. This is a valid form (it uses the contrapositive).', 'Bentuk: jika $p$, maka $q$; bukan $q$; maka bukan $p$. Ini bentuk hujah yang sah (ia menggunakan kontrapositif).') },
    { valid: false, prem: (c) => [notEn(c.p.en), notMs(c.p.ms)], concl: (c) => [notEn(c.q.en), notMs(c.q.ms)], how: T('Premise 2 denies the antecedent $p$ and concludes "not $q$" – this uses the inverse, which is not a valid form.', 'Premis 2 menafikan antejadian $p$ dan menyimpulkan "bukan $q$" – ini menggunakan songsangan, bukan bentuk hujah yang sah.') },
  ];
  const g32a = [
    (r) => {
      const k = r.pick(KINDS), c = r.pick(IMP);
      const pr = k.prem(c), co = k.concl(c);
      return { q: T(`Premise 1: If ${c.p.en}, then ${c.q.en}. Premise 2: ${pr[0]}. Conclusion: ${co[0]}. Is the argument valid? Explain.`, `Premis 1: Jika ${c.p.ms}, maka ${c.q.ms}. Premis 2: ${pr[1]}. Kesimpulan: ${co[1]}. Adakah hujah itu sah? Terangkan.`), a: k.valid ? T('Valid: whenever both premises are true, the conclusion must be true.', 'Sah: apabila kedua-dua premis benar, kesimpulan mesti benar.') : T(`Not valid: both premises can be true while the conclusion is false (${c.cex.en}).`, `Tidak sah: kedua-dua premis boleh benar sementara kesimpulan palsu (${c.cex.ms}).`), w: W(k.how, ...(k.valid ? [] : [T(`Counterexample: ${c.cex.en}.`, `Contoh bertentang: ${c.cex.ms}.`)])), sp: 'm' };
    },
  ];
  SPM.addChapter(4, 3, T('Logical Reasoning', 'Penaakulan Logik'), [
    { id: '3.1', en: 'Statements', ms: 'Pernyataan', gen: { e: g31e, m: g31m, a: g31a } },
    { id: '3.2', en: 'Arguments', ms: 'Hujah', gen: { e: g32e, m: g32m, a: g32a } },
  ]);
})();
