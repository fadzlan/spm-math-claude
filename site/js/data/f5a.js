/* Form 5 – Chapters 1 to 4 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, sum, gcd, Fr, poly, lin, rm } = SPM;
  const S = SPM.svg;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const frT = Fr.tex;
  const fr = (a, b) => Fr.make(a, b);
  const W = SPM.lines;

  /* =============================================================== 1 */
  const g11e = [
    (r) => {
      const k = r.int(2, 9), x1 = r.int(2, 6), x2 = r.int(7, 12);
      return { q: T(`$y$ varies directly as $x$. When $x = ${x1}$, $y = ${k * x1}$. Find (a) the relation between $y$ and $x$, (b) $y$ when $x = ${x2}$.`, `$y$ berubah secara langsung dengan $x$. Apabila $x = ${x1}$, $y = ${k * x1}$. Cari (a) hubungan antara $y$ dengan $x$, (b) $y$ apabila $x = ${x2}$.`), a: T(`(a) $y = ${k}x$ (b) $${k * x2}$`), w: W(`$y = kx$`, `$${k * x1} = k(${x1}) \\Rightarrow k = ${k}$`, `(a) $y = ${k}x$`, `(b) $y = ${k}(${x2}) = ${k * x2}$`), sp: 's' };
    },
  ];
  const g11m = [
    (r) => {
      const k = r.int(2, 5), x1 = r.int(2, 4), x2 = r.int(5, 9);
      return { q: T(`$y \\propto x^2$ and $y = ${k * x1 * x1}$ when $x = ${x1}$. Find $y$ when $x = ${x2}$.`, `$y \\propto x^2$ dan $y = ${k * x1 * x1}$ apabila $x = ${x1}$. Cari $y$ apabila $x = ${x2}$.`), a: T(`$k = ${k}$; $y = ${k * x2 * x2}$`), w: W(`$y = kx^2$`, `$${k * x1 * x1} = k(${x1})^2 \\Rightarrow k = ${k}$`, `$y = ${k}(${x2})^2 = ${k * x2 * x2}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(2, 5), a = r.pick([4, 9, 16, 25]), b = r.pick([36, 49, 64]);
      return { q: T(`$y \\propto \\sqrt{x}$ and $y = ${k * Math.sqrt(a)}$ when $x = ${a}$. Find $y$ when $x = ${b}$.`, `$y \\propto \\sqrt{x}$ dan $y = ${k * Math.sqrt(a)}$ apabila $x = ${a}$. Cari $y$ apabila $x = ${b}$.`), a: T(`$k = ${k}$; $y = ${k * Math.sqrt(b)}$`), w: W(`$y = k\\sqrt{x}$`, `$${k * Math.sqrt(a)} = k\\sqrt{${a}} = ${Math.sqrt(a)}k \\Rightarrow k = ${k}$`, `$y = ${k}\\sqrt{${b}} = ${k}(${Math.sqrt(b)}) = ${k * Math.sqrt(b)}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(2, 4), xs = [1, 2, 3, 4];
      const ys = xs.map((x) => k * x * x);
      const gaps = r.sample([1, 2, 3], 2);
      const tab = (h) => SPM.table([['$x$', ...xs], ['$y$', ...ys.map((y, i) => (gaps.includes(i) ? '' : y))]]);
      return { q: T(`$y$ varies directly as $x^2$. Complete the table.<br>${tab()}`, `$y$ berubah secara langsung dengan $x^2$. Lengkapkan jadual.<br>${tab()}`), a: T(`$k = ${k}$; missing values: ${gaps.map((i) => `$x = ${xs[i]}$: $y = ${ys[i]}$`).join(', ')}`, `$k = ${k}$; nilai yang hilang: ${gaps.map((i) => `$x = ${xs[i]}$: $y = ${ys[i]}$`).join(', ')}`), w: W(`$y = kx^2$`, `$${ys[0]} = k(1)^2 \\Rightarrow k = ${k}$`, ...gaps.map((i) => `$y = ${k}(${xs[i]})^2 = ${ys[i]}$`)), sp: 's' };
    },
  ];
  const g11a = [
    (r) => {
      const k = r.int(2, 5), pw = r.pick([2, 3]);
      const xs = [1, 2, 3, 4], ys = xs.map((x) => k * Math.pow(x, pw));
      const tab = SPM.table([['$x$', ...xs], ['$y$', ...ys]]);
      return { q: T(`The table shows values of $x$ and $y$.<br>${tab}<br>Test whether $y \\propto x$, $y \\propto x^2$ or $y \\propto x^3$ by calculating $\\dfrac{y}{x^n}$, and write the relation.`, `Jadual menunjukkan nilai $x$ dan $y$.<br>${tab}<br>Uji sama ada $y \\propto x$, $y \\propto x^2$ atau $y \\propto x^3$ dengan menghitung $\\dfrac{y}{x^n}$, dan tulis hubungannya.`), a: T(`$\\dfrac{y}{x^${pw}} = ${k}$ is constant, so $y = ${k}x^${pw}$`, `$\\dfrac{y}{x^${pw}} = ${k}$ malar, jadi $y = ${k}x^${pw}$`), w: W(T(`$\\dfrac{y}{x^${pw}}$: ${xs.map((x, i) => `$\\dfrac{${ys[i]}}{${x}^${pw}} = ${k}$`).join(', ')}`), T(`(By contrast $\\dfrac{y}{x^${pw === 2 ? 3 : 2}}$ gives $${n(ys[0])}, ${n(ys[1] / Math.pow(2, pw === 2 ? 3 : 2))}, \\ldots$ – not constant.)`, `(Sebaliknya $\\dfrac{y}{x^${pw === 2 ? 3 : 2}}$ memberi $${n(ys[0])}, ${n(ys[1] / Math.pow(2, pw === 2 ? 3 : 2))}, \\ldots$ – tidak malar.)`), T(`The ratio is constant, so $y = ${k}x^${pw}$`, `Nisbah itu malar, jadi $y = ${k}x^${pw}$`)), sp: 'm' };
    },
    (r) => {
      const k = r.int(2, 4), x1 = r.int(2, 4), c = r.int(2, 3);
      const y1 = k * x1 * x1;
      const y2 = y1 * c * c;
      return { q: T(`$y$ varies directly as the square of $x$, and $y = ${y1}$ when $x = ${x1}$. When $x$ is multiplied by ${c}, by what factor is $y$ multiplied? Check by finding $y$ when $x = ${x1 * c}$.`, `$y$ berubah secara langsung dengan kuasa dua $x$, dan $y = ${y1}$ apabila $x = ${x1}$. Apabila $x$ didarab dengan ${c}, $y$ didarab dengan faktor berapa? Semak dengan mencari $y$ apabila $x = ${x1 * c}$.`), a: T(`Factor ${c * c}: $y$ changes from ${y1} to ${y2} ($k = ${k}$).`, `Faktor ${c * c}: $y$ berubah daripada ${y1} kepada ${y2} ($k = ${k}$).`), w: W(`$y = kx^2 \\Rightarrow \\dfrac{y_2}{y_1} = \\dfrac{k(${c}x)^2}{kx^2} = ${c}^2 = ${c * c}$`, `$k = \\dfrac{${y1}}{${x1}^2} = ${k}$`, T(`Check: $x = ${x1 * c}$ gives $y = ${k}(${x1 * c})^2 = ${y2}$, and $\\dfrac{${y2}}{${y1}} = ${c * c}$`, `Semak: $x = ${x1 * c}$ memberi $y = ${k}(${x1 * c})^2 = ${y2}$, dan $\\dfrac{${y2}}{${y1}} = ${c * c}$`)), sp: 'm' };
    },
  ];
  const g12e = [
    (r) => {
      const x1 = r.pick([2, 3, 4, 6]);
      const kk = x1 * r.int(2, 6);
      const x2 = r.pick([1, 2, 3, 4, 6, 12].filter((v) => kk % v === 0 && v !== x1));
      need(x2);
      return { q: T(`$y$ varies inversely as $x$. When $x = ${x1}$, $y = ${kk / x1}$. Find $y$ when $x = ${x2}$.`, `$y$ berubah secara songsang dengan $x$. Apabila $x = ${x1}$, $y = ${kk / x1}$. Cari $y$ apabila $x = ${x2}$.`), a: T(`$k = ${kk}$; $y = ${kk / x2}$`), w: W(`$y = \\dfrac{k}{x}$`, `$k = xy = ${x1} \\times ${kk / x1} = ${kk}$`, `$y = \\dfrac{${kk}}{${x2}} = ${kk / x2}$`), sp: 's' };
    },
  ];
  const g12m = [
    (r) => {
      const x1 = r.pick([2, 3, 4]), k = x1 * x1 * r.int(2, 6);
      const x2 = r.pick([1, 6, 12].filter((v) => k % (v * v) === 0));
      need(x2);
      return { q: T(`$y \\propto \\dfrac{1}{x^2}$ and $y = ${k / (x1 * x1)}$ when $x = ${x1}$. Find $y$ when $x = ${x2}$.`, `$y \\propto \\dfrac{1}{x^2}$ dan $y = ${k / (x1 * x1)}$ apabila $x = ${x1}$. Cari $y$ apabila $x = ${x2}$.`), a: T(`$k = ${k}$; $y = ${n(k / (x2 * x2))}$`), w: W(`$y = \\dfrac{k}{x^2}$`, `$k = yx^2 = ${k / (x1 * x1)}(${x1})^2 = ${k}$`, `$y = \\dfrac{${k}}{${x2}^2} = ${n(k / (x2 * x2))}$`), sp: 's' };
    },
    (r) => {
      const w = r.int(4, 8), d = r.pick([6, 8, 12, 9]);
      const w2 = r.pick([2, 3, 12, 16, 18, 24].filter((v) => (w * d) % v === 0 && v !== w));
      need(w2);
      return { q: T(`${w} workers can build a wall in ${d} days, all working at the same rate. How many days would ${w2} workers take?`, `${w} orang pekerja boleh membina sebuah dinding dalam ${d} hari, semuanya bekerja pada kadar yang sama. Berapa harikah yang diambil oleh ${w2} orang pekerja?`), a: T(`${n((w * d) / w2)} days`, `${n((w * d) / w2)} hari`), w: T(`Days $\\propto \\dfrac{1}{\\text{workers}}$: $${w} \\times ${d} = ${w * d}$`, `Hari $\\propto \\dfrac{1}{\\text{pekerja}}$: $${w} \\times ${d} = ${w * d}$`), sp: 's' };
    },
  ];
  const g12a = [
    (r) => {
      const k = r.pick([12, 24, 36]);
      const pw = r.pick([1, 2]);
      const xs = [1, 2, 3, 4], ys = xs.map((x) => n(round(k / Math.pow(x, pw), 3)));
      const tab = SPM.table([['$x$', ...xs], ['$y$', ...ys]]);
      return { q: T(`The table shows $x$ and $y$.<br>${tab}<br>Determine whether $y \\propto \\dfrac{1}{x}$ or $y \\propto \\dfrac{1}{x^2}$ by testing the products $yx$ and $yx^2$, and write the relation.`, `Jadual menunjukkan $x$ dan $y$.<br>${tab}<br>Tentukan sama ada $y \\propto \\dfrac{1}{x}$ atau $y \\propto \\dfrac{1}{x^2}$ dengan menguji hasil darab $yx$ dan $yx^2$, dan tulis hubungannya.`), a: T(`$${pw === 1 ? 'yx' : 'yx^2'} = ${k}$ is constant, so $y = \\dfrac{${k}}{x${pw === 2 ? '^2' : ''}}$`, `$${pw === 1 ? 'yx' : 'yx^2'} = ${k}$ malar, jadi $y = \\dfrac{${k}}{x${pw === 2 ? '^2' : ''}}$`), w: W(`$yx$: $${[1, 2, 4].map((x) => n(k / Math.pow(x, pw - 1))).join(', ')}$ ($x = 1, 2, 4$)`, `$yx^2$: $${[1, 2, 4].map((x) => n(k * Math.pow(x, 2 - pw))).join(', ')}$ ($x = 1, 2, 4$)`, T(`Only $${pw === 1 ? 'yx' : 'yx^2'}$ is constant ($= ${k}$), so $y = \\dfrac{${k}}{x${pw === 2 ? '^2' : ''}}$`, `Hanya $${pw === 1 ? 'yx' : 'yx^2'}$ malar ($= ${k}$), jadi $y = \\dfrac{${k}}{x${pw === 2 ? '^2' : ''}}$`)), sp: 'm' };
    },
  ];
  const g13e = [
    (r) => {
      const k = r.int(2, 5), x = r.int(2, 5), y = r.int(2, 5), z2x = r.int(3, 6), z2y = r.int(2, 6);
      return { q: T(`$z$ varies jointly as $x$ and $y$. $z = ${k * x * y}$ when $x = ${x}$ and $y = ${y}$. Find $z$ when $x = ${z2x}$ and $y = ${z2y}$.`, `$z$ berubah secara bersama dengan $x$ dan $y$. $z = ${k * x * y}$ apabila $x = ${x}$ dan $y = ${y}$. Cari $z$ apabila $x = ${z2x}$ dan $y = ${z2y}$.`), a: T(`$z = ${k}xy$; $z = ${k * z2x * z2y}$`), w: W(`$z = kxy$`, `$${k * x * y} = k(${x})(${y}) \\Rightarrow k = ${k}$`, `$z = ${k}(${z2x})(${z2y}) = ${k * z2x * z2y}$`), sp: 's' };
    },
  ];
  const g13m = [
    (r) => {
      const k = r.int(2, 4), x = r.int(2, 4), y = r.pick([2, 4, 5]);
      const z = (k * x * x) / y;
      const x2 = r.int(5, 8), y2 = r.pick([2, 5, 10]);
      return { q: T(`$z \\propto \\dfrac{x^2}{y}$ and $z = ${n(round(z, 3))}$ when $x = ${x}$ and $y = ${y}$. Find $z$ when $x = ${x2}$ and $y = ${y2}$.`, `$z \\propto \\dfrac{x^2}{y}$ dan $z = ${n(round(z, 3))}$ apabila $x = ${x}$ dan $y = ${y}$. Cari $z$ apabila $x = ${x2}$ dan $y = ${y2}$.`), a: T(`$k = ${k}$; $z = ${n(round((k * x2 * x2) / y2, 3))}$`), w: W(`$z = \\dfrac{kx^2}{y}$`, `$k = \\dfrac{zy}{x^2} = \\dfrac{${n(round(z, 3))} \\times ${y}}{${x}^2} = ${k}$`, `$z = \\dfrac{${k}(${x2})^2}{${y2}} = ${n(round((k * x2 * x2) / y2, 3))}$`), sp: 'm' };
    },
  ];
  const g13a = [
    (r) => {
      const a = r.int(2, 4), b = r.int(2, 4);
      // P varies directly as V^2 and inversely as R ; two-stage
      const P1 = 100;
      const V1 = a * 2, R1 = b * 2;
      const kk = (P1 * R1) / (V1 * V1);
      const V2 = V1 * 2, R2 = R1 * 2;
      const P2 = (kk * V2 * V2) / R2;
      return { q: T(`$P$ varies directly as $V^2$ and inversely as $R$. $P = ${P1}$ when $V = ${V1}$ and $R = ${R1}$. Find $P$ when $V$ is doubled and $R$ is doubled at the same time.`, `$P$ berubah secara langsung dengan $V^2$ dan secara songsang dengan $R$. $P = ${P1}$ apabila $V = ${V1}$ dan $R = ${R1}$. Cari $P$ apabila $V$ digandakan dan $R$ digandakan serentak.`), a: T(`$P = \\dfrac{kV^2}{R}$; $P = ${n(P2)}$ (it doubles)`, `$P = \\dfrac{kV^2}{R}$; $P = ${n(P2)}$ (ia digandakan)`), w: W(`$P = \\dfrac{kV^2}{R}$`, `$k = \\dfrac{PR}{V^2} = \\dfrac{${P1} \\times ${R1}}{${V1}^2} = ${frT(fr(P1 * R1, V1 * V1))}$`, `$P = \\dfrac{k(2V)^2}{2R} = 2 \\times \\dfrac{kV^2}{R}$`, `$P = 2 \\times ${P1} = ${n(P2)}$`), sp: 'm' };
    },
  ];
  SPM.addChapter(5, 1, T('Variation', 'Variasi'), [
    { id: '1.1', en: 'Direct variation', ms: 'Variasi langsung', gen: { e: g11e, m: g11m, a: g11a } },
    { id: '1.2', en: 'Inverse variation', ms: 'Variasi songsang', gen: { e: g12e, m: g12m, a: g12a } },
    { id: '1.3', en: 'Joint and combined variation', ms: 'Variasi bergabung', gen: { e: g13e, m: g13m, a: g13a } },
  ]);

  /* =============================================================== 2 */
  const M = (rows) => `\\begin{pmatrix} ${rows.map((row) => row.map((v) => (typeof v === 'number' ? n(v) : v)).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
  const rmat = (r, rows, cols, lo, hi) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => r.int(lo, hi)));
  const mmul = (A, B) => A.map((row) => B[0].map((_, j) => sum(row.map((v, k) => v * B[k][j]))));
  const madd = (A, B, s) => A.map((row, i) => row.map((v, j) => v + (s || 1) * B[i][j]));
  const msc = (k, A) => A.map((row) => row.map((v) => k * v));
  const det = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const invTex = (A) => {
    const d = det(A);
    const e = [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]].map((row) => row.map((v) => (d < 0 ? -v : v) + 0));
    return `\\dfrac{1}{${Math.abs(d)}}${M(e)}`;
  };
  const invM = (A) => { const d = det(A); return [[fr(A[1][1], d), fr(-A[0][1], d)], [fr(-A[1][0], d), fr(A[0][0], d)]]; };
  const fracM = (F) => M(F.map((row) => row.map((f) => frT(f))));
  /* worked-solution helpers: bracket a negative, a ± b elementwise, row × column terms */
  const pn = (v) => (v < 0 ? `(${n(v)})` : n(v));
  const ewM = (A, B, op) => M(A.map((row, i) => row.map((v, j) => `${n(v)} ${op} ${pn(B[i][j])}`)));
  const rcM = (A, B) => M(A.map((row) => B[0].map((_, j) => row.map((v, k) => `(${n(v)})(${n(B[k][j])})`).join(' + '))));
  const adjM = (A) => [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]].map((row) => row.map((v) => v + 0));
  const detLine = (A, nm) => `$${nm || '\\det A'} = (${n(A[0][0])})(${n(A[1][1])}) - (${n(A[0][1])})(${n(A[1][0])}) = ${det(A)}$`;

  const g21e = [
    (r) => {
      const A = rmat(r, r.pick([2, 3]), r.pick([2, 3]), -5, 9);
      const i = r.int(0, A.length - 1), j = r.int(0, A[0].length - 1);
      return { q: T(`$A = ${M(A)}$. State the order of $A$ and the value of the element $a_{${i + 1}${j + 1}}$ (row ${i + 1}, column ${j + 1}).`, `$A = ${M(A)}$. Nyatakan peringkat $A$ dan nilai unsur $a_{${i + 1}${j + 1}}$ (baris ${i + 1}, lajur ${j + 1}).`), a: T(`Order $${A.length} \\times ${A[0].length}$; $a_{${i + 1}${j + 1}} = ${A[i][j]}$`, `Peringkat $${A.length} \\times ${A[0].length}$; $a_{${i + 1}${j + 1}} = ${A[i][j]}$`), w: W(T(`Order = rows × columns $= ${A.length} \\times ${A[0].length}$`, `Peringkat = baris × lajur $= ${A.length} \\times ${A[0].length}$`), T(`$a_{${i + 1}${j + 1}}$ is in row ${i + 1}, column ${j + 1}: $${A[i][j]}$`, `$a_{${i + 1}${j + 1}}$ berada di baris ${i + 1}, lajur ${j + 1}: $${A[i][j]}$`)), sp: 's' };
    },
  ];
  const g21m = [
    (r) => {
      const x = r.int(-4, 8), y = r.int(-4, 8), p = r.int(1, 5);
      return { q: T(`Given $${M([[`x + ${p}`, 3], [5, 'y']])} = ${M([[x + p, 3], [5, y]])}$, find $x$ and $y$.`, `Diberi $${M([[`x + ${p}`, 3], [5, 'y']])} = ${M([[x + p, 3], [5, y]])}$, cari $x$ dan $y$.`), a: T(`$x = ${x}$, $y = ${y}$`), w: W(T('Equal matrices: corresponding elements are equal.', 'Matriks sama: unsur-unsur sepadan adalah sama.'), `$x + ${p} = ${x + p} \\Rightarrow x = ${x + p} - ${p} = ${x}$`, `$y = ${y}$`), sp: 's' };
    },
  ];
  const g21a = [
    (r) => {
      const x = r.int(1, 5), y = r.int(1, 5);
      const c1 = 2 * x + y, c2 = x - y * 1;
      return { q: T(`Given $${M([['2x + y', 4], [3, 'x - y']])} = ${M([[c1, 4], [3, c2]])}$, form two equations and find $x$ and $y$.`, `Diberi $${M([['2x + y', 4], [3, 'x - y']])} = ${M([[c1, 4], [3, c2]])}$, bentukkan dua persamaan dan cari $x$ dan $y$.`), a: T(`$2x + y = ${c1}$, $x - y = ${c2}$; $x = ${x}$, $y = ${y}$`), w: W(`$2x + y = ${c1} \\quad (1)$`, `$x - y = ${c2} \\quad (2)$`, `(1) + (2): $3x = ${c1 + c2} \\Rightarrow x = ${x}$`, `$y = ${c1} - 2(${x}) = ${y}$`), sp: 'm' };
    },
  ];
  const g22e = [
    (r) => {
      const A = rmat(r, 2, 2, -3, 8), B = rmat(r, 2, 2, -3, 8);
      const plus = r.chance();
      return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. Find $A ${plus ? '+' : '-'} B$ and $3A$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Cari $A ${plus ? '+' : '-'} B$ dan $3A$.`), a: T(`$${M(madd(A, B, plus ? 1 : -1))}$; $${M(msc(3, A))}$`), w: W(`$A ${plus ? '+' : '-'} B = ${ewM(A, B, plus ? '+' : '-')} = ${M(madd(A, B, plus ? 1 : -1))}$`, `$3A = ${M(A.map((row) => row.map((v) => `3(${n(v)})`)))} = ${M(msc(3, A))}$`), sp: 's' };
    },
  ];
  const g22m = [
    (r) => {
      const A = rmat(r, 2, 2, -2, 6), B = rmat(r, 2, 2, -2, 6);
      return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. Find $2A - 3B$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Cari $2A - 3B$.`), a: T(`$${M(madd(msc(2, A), msc(3, B), -1))}$`), w: W(`$2A = ${M(msc(2, A))}$, $3B = ${M(msc(3, B))}$`, `$2A - 3B = ${ewM(msc(2, A), msc(3, B), '-')} = ${M(madd(msc(2, A), msc(3, B), -1))}$`), sp: 'm' };
    },
    (r) => {
      const A = rmat(r, 2, 2, -2, 5), B = rmat(r, 2, 2, -2, 5);
      return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. Find $AB$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Cari $AB$.`), a: T(`$${M(mmul(A, B))}$`), w: W(T('Each element = row of $A$ × column of $B$:', 'Setiap unsur = baris $A$ × lajur $B$:'), `$AB = ${rcM(A, B)}$`, `$= ${M(mmul(A, B))}$`), sp: 'm' };
    },
    (r) => {
      const A = rmat(r, 2, 3, -2, 4), B = rmat(r, 3, 2, -2, 4);
      return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. State the order of $AB$ and $BA$ and find $AB$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Nyatakan peringkat $AB$ dan $BA$ dan cari $AB$.`), a: T(`$AB$ is $2 \\times 2$; $BA$ is $3 \\times 3$; $AB = ${M(mmul(A, B))}$`, `$AB$ ialah $2 \\times 2$; $BA$ ialah $3 \\times 3$; $AB = ${M(mmul(A, B))}$`), w: W(`$AB$: $(2 \\times 3)(3 \\times 2) \\to 2 \\times 2$; $BA$: $(3 \\times 2)(2 \\times 3) \\to 3 \\times 3$`, `$AB = ${rcM(A, B)}$`, `$= ${M(mmul(A, B))}$`), sp: 'm' };
    },
  ];
  const g22a = [
    (r) => {
      const A = rmat(r, 2, 2, 1, 4), B = rmat(r, 2, 2, 1, 4), k = r.int(1, 4);
      const Ak = [[A[0][0], k], [A[1][0], A[1][1]]];
      const Pk = mmul(Ak, B);
      return { q: T(`$${M([['p', k], [A[1][0], A[1][1]]])}${M(B)} = ${M(Pk)}$. Find $p$.`, `$${M([['p', k], [A[1][0], A[1][1]]])}${M(B)} = ${M(Pk)}$. Cari $p$.`), a: T(`$p = ${A[0][0]}$`), w: T(`Row 1 × column 1: $p(${B[0][0]}) + ${k}(${B[1][0]}) = ${Pk[0][0]}$`), sp: 'm' };
    },
    (r) => {
      const shops = [[r.int(1, 5), r.int(1, 4), r.int(2, 6)], [r.int(2, 6), r.int(1, 5), r.int(1, 4)]];
      const prices = [[r.int(1, 4), r.int(2, 5)], [r.int(2, 6), r.int(1, 4)], [r.int(1, 3), r.int(3, 6)]];
      const R = mmul(shops, prices);
      need(R[0][0] !== R[0][1]);
      return { q: T(`Two families buy fruit. The quantities (kg of apples, oranges, grapes) are $${M(shops)}$ (rows: Family 1, Family 2). The prices in RM per kg at two shops are $${M(prices)}$ (columns: Shop A, Shop B). Multiply the matrices to find the cost of each family's fruit at each shop, and state which shop is cheaper for Family 1.`, `Dua keluarga membeli buah. Kuantiti (kg epal, oren, anggur) ialah $${M(shops)}$ (baris: Keluarga 1, Keluarga 2). Harga dalam RM per kg di dua kedai ialah $${M(prices)}$ (lajur: Kedai A, Kedai B). Darabkan matriks untuk mencari kos buah setiap keluarga di setiap kedai, dan nyatakan kedai yang lebih murah bagi Keluarga 1.`), a: T(`$${M(R)}$ (RM). Family 1: ${R[0][0] <= R[0][1] ? 'Shop A' : 'Shop B'} is cheaper.`, `$${M(R)}$ (RM). Keluarga 1: ${R[0][0] <= R[0][1] ? 'Kedai A' : 'Kedai B'} lebih murah.`), w: W(`$${M(shops)}${M(prices)} = ${rcM(shops, prices)}$`, `$= ${M(R)}$`, T(`Family 1: Shop A RM${R[0][0]}, Shop B RM${R[0][1]}, so ${R[0][0] < R[0][1] ? 'Shop A' : 'Shop B'} is cheaper.`, `Keluarga 1: Kedai A RM${R[0][0]}, Kedai B RM${R[0][1]}, jadi ${R[0][0] < R[0][1] ? 'Kedai A' : 'Kedai B'} lebih murah.`)), sp: 'l' };
    },
  ];
  const g23e = [
    (r) => {
      const A = retry(() => { const a = rmat(r, 2, 2, -3, 6); need(Math.abs(det(a)) === 1 || Math.abs(det(a)) === 2); return a; });
      return { q: T(`Find the determinant of $A = ${M(A)}$ and, if it exists, the inverse of $A$.`, `Cari penentu bagi $A = ${M(A)}$ dan, jika wujud, songsangan bagi $A$.`), a: T(`$\\det A = ${det(A)}$; $A^{-1} = ${Math.abs(det(A)) === 1 ? fracM(invM(A)) : invTex(A)}$`), w: W(detLine(A), T(`$\\det A \\neq 0$, so $A^{-1}$ exists. Swap $a$ and $d$, change the signs of $b$ and $c$:`, `$\\det A \\neq 0$, jadi $A^{-1}$ wujud. Tukar kedudukan $a$ dan $d$, tukar tanda $b$ dan $c$:`), `$A^{-1} = \\dfrac{1}{${det(A)}}${M(adjM(A))} = ${Math.abs(det(A)) === 1 ? fracM(invM(A)) : invTex(A)}$`), sp: 'm' };
    },
  ];
  const g23m = [
    (r) => {
      const A = retry(() => { const a = rmat(r, 2, 2, -3, 7); need(Math.abs(det(a)) >= 3 && Math.abs(det(a)) <= 12); return a; });
      return { q: T(`Find the inverse of $${M(A)}$ and verify that $MM^{-1} = I$ for the first row and column.`, `Cari songsangan bagi $${M(A)}$ dan sahkan bahawa $MM^{-1} = I$ bagi baris dan lajur pertama.`), a: T(`$${fracM(invM(A))}$; $M M^{-1}$ (1,1) $= (${A[0][0]})(${frT(invM(A)[0][0])}) + (${A[0][1]})(${frT(invM(A)[1][0])}) = 1$`, `$${fracM(invM(A))}$; $M M^{-1}$ (1,1) $= (${A[0][0]})(${frT(invM(A)[0][0])}) + (${A[0][1]})(${frT(invM(A)[1][0])}) = 1$`), w: W(detLine(A, '\\det M'), `$M^{-1} = \\dfrac{1}{${det(A)}}${M(adjM(A))} = ${fracM(invM(A))}$`, T(`Row 1 × column 1 of $MM^{-1}$: $(${A[0][0]})(${frT(invM(A)[0][0])}) + (${A[0][1]})(${frT(invM(A)[1][0])}) = 1$ ✓`, `Baris 1 × lajur 1 bagi $MM^{-1}$: $(${A[0][0]})(${frT(invM(A)[0][0])}) + (${A[0][1]})(${frT(invM(A)[1][0])}) = 1$ ✓`)), sp: 'm' };
    },
    (r) => {
      const A = retry(() => { const a = rmat(r, 2, 2, 1, 4); need(det(a) === 1 || det(a) === -1); return a; });
      const X = rmat(r, 2, 1, -3, 5);
      const B = mmul(A, X);
      const Ai = invM(A);
      return { q: T(`$A = ${M(A)}$ and $AX = ${M(B)}$. Find the matrix $X$.`, `$A = ${M(A)}$ dan $AX = ${M(B)}$. Cari matriks $X$.`), a: T(`$X = A^{-1}${M(B)} = ${M(X)}$`), w: W(detLine(A), `$A^{-1} = \\dfrac{1}{${det(A)}}${M(adjM(A))} = ${fracM(Ai)}$`, `$X = A^{-1}(AX) = ${fracM(Ai)}${M(B)} = ${rcM(Ai.map((row) => row.map(Fr.val)), B)}$`, `$X = ${M(X)}$`), sp: 'm' };
    },
  ];
  const g23a = [
    (r) => {
      return retry(() => {
        const p = r.int(-3, 5), q = r.int(-3, 5), a1 = r.int(1, 4), b1 = r.int(1, 4), a2 = r.int(1, 3), b2 = -r.int(1, 3);
        need(a1 * b2 - a2 * b1 !== 0);
        const c1 = a1 * p + b1 * q, c2 = a2 * p + b2 * q;
        return { q: T(`Write the simultaneous equations $${poly([[a1, 'p'], [b1, 'q']])} = ${c1}$ and $${poly([[a2, 'p'], [b2, 'q']])} = ${c2}$ in the form $${M([['a', 'b'], ['c', 'd']])}${M([['p'], ['q']])} = ${M([['e'], ['f']])}$. Hence use the inverse matrix to find $p$ and $q$.`, `Tulis persamaan serentak $${poly([[a1, 'p'], [b1, 'q']])} = ${c1}$ dan $${poly([[a2, 'p'], [b2, 'q']])} = ${c2}$ dalam bentuk $${M([['a', 'b'], ['c', 'd']])}${M([['p'], ['q']])} = ${M([['e'], ['f']])}$. Seterusnya gunakan matriks songsang untuk mencari $p$ dan $q$.`), a: T(`$${M([[a1, b1], [a2, b2]])}${M([['p'], ['q']])} = ${M([[c1], [c2]])}$; $${M([['p'], ['q']])} = ${invTex([[a1, b1], [a2, b2]])}${M([[c1], [c2]])} = ${M([[p], [q]])}$`), w: (() => { const C = [[a1, b1], [a2, b2]], d = det(C), J = adjM(C).map((row) => row.map((v) => (d < 0 ? -v : v) + 0)); return W(`$${M(C)}${M([['p'], ['q']])} = ${M([[c1], [c2]])}$`, detLine(C, '\\det'), `$${M([['p'], ['q']])} = ${invTex(C)}${M([[c1], [c2]])} = \\dfrac{1}{${Math.abs(d)}}${rcM(J, [[c1], [c2]])}$`, `$= \\dfrac{1}{${Math.abs(d)}}${M(mmul(J, [[c1], [c2]]))} = ${M([[p], [q]])}$`, T(`$p = ${p}$, $q = ${q}$`, `$p = ${p}$, $q = ${q}$`)); })(), sp: 'l' };
      });
    },
    (r) => {
      const k = r.int(2, 6), a = r.int(1, 3);
      return { q: T(`The matrix $${M([[a, k], [2 * a, 'x']])}$ has no inverse. Find $x$.`, `Matriks $${M([[a, k], [2 * a, 'x']])}$ tidak mempunyai songsangan. Cari $x$.`), a: T(`$\\det = ${lin(a, 0)} - ${2 * a * k} = 0$, so $x = ${2 * k}$`, `$\\det = ${lin(a, 0)} - ${2 * a * k} = 0$, jadi $x = ${2 * k}$`), w: W(T('No inverse means the determinant is $0$.', 'Tiada songsangan bermakna penentu ialah $0$.'), `$${lin(a, 0)} - ${k}(${2 * a}) = 0$`, `$${lin(a, 0)} = ${2 * a * k} \\Rightarrow x = ${2 * k}$`), sp: 'm' };
    },
  ];
  SPM.addChapter(5, 2, T('Matrices', 'Matriks'), [
    { id: '2.1', en: 'Matrices', ms: 'Matriks', gen: { e: g21e, m: g21m, a: g21a } },
    { id: '2.2', en: 'Basic operations on matrices', ms: 'Operasi asas matriks', gen: { e: g22e, m: g22m, a: g22a } },
    { id: '2.3', en: 'Inverse matrix and solving matrix equations', ms: 'Matriks songsang dan menyelesaikan persamaan matriks', gen: { e: g23e, m: g23m, a: g23a } },
  ]);

  /* =============================================================== 3 */
  const g31e = [
    (r) => {
      const c = r.pick([[T('paying for a hospital operation', 'membayar pembedahan di hospital'), T('medical (health) insurance', 'insurans perubatan (kesihatan)'), T('Medical insurance pays hospital and surgery costs of the insured person.', 'Insurans perubatan membayar kos hospital dan pembedahan orang yang diinsuranskan.')], [T('repairing a car after an accident', 'membaiki kereta selepas kemalangan'), T('motor insurance', 'insurans motor'), T('Motor insurance covers loss or damage involving the insured vehicle.', 'Insurans motor melindungi kerugian atau kerosakan yang melibatkan kenderaan yang diinsuranskan.')], [T('providing money for a family if the breadwinner dies', 'menyediakan wang untuk keluarga jika pencari nafkah meninggal dunia'), T('life insurance', 'insurans hayat'), T('Life insurance pays a sum of money to the beneficiaries when the insured person dies.', 'Insurans hayat membayar sejumlah wang kepada penerima manfaat apabila orang yang diinsuranskan meninggal dunia.')], [T('repairing a house damaged by fire', 'membaiki rumah yang rosak akibat kebakaran'), T('fire (home) insurance', 'insurans kebakaran (rumah)'), T('Fire insurance covers damage to the insured property caused by fire.', 'Insurans kebakaran melindungi kerosakan harta yang diinsuranskan akibat kebakaran.')]]);
      return { q: T(`Which type of insurance is most suitable for ${c[0].en}?`, `Insurans jenis manakah yang paling sesuai untuk ${c[0].ms}?`), a: c[1], w: c[2], sp: 's' };
    },
  ];
  const g31m = [
    (r) => {
      const prem = r.pick([120, 180, 240]), ded = r.pick([200, 500, 1000]), limit = r.pick([20000, 50000]);
      return { q: T(`A policy has an annual premium of RM${prem}, a deductible of RM${ded} and a claim limit of RM${limit}. What do the premium, the deductible and the limit mean?`, `Sebuah polisi mempunyai premium tahunan RM${prem}, lebihan RM${ded} dan had tuntutan RM${limit}. Apakah maksud premium, lebihan dan had itu?`), a: T(`Premium: the amount paid each year for cover. Deductible: the part of each claim the policyholder pays first. Limit: the most the insurer will pay.`, `Premium: jumlah yang dibayar setiap tahun untuk perlindungan. Lebihan: bahagian setiap tuntutan yang dibayar dahulu oleh pemegang polisi. Had: jumlah maksimum yang akan dibayar oleh penanggung insurans.`), w: W(T(`The premium RM${prem} is paid every year, whether or not a claim is made.`, `Premium RM${prem} dibayar setiap tahun, sama ada tuntutan dibuat atau tidak.`), T(`E.g. a claim of ${rm(10 * ded)}: the policyholder pays the first RM${ded}, the insurer pays ${rm(9 * ded)}.`, `Contoh: tuntutan ${rm(10 * ded)}: pemegang polisi membayar RM${ded} yang pertama, penanggung insurans membayar ${rm(9 * ded)}.`), T(`The insurer never pays more than ${rm(limit)} for a claim.`, `Penanggung insurans tidak akan membayar lebih daripada ${rm(limit)} bagi suatu tuntutan.`)), sp: 'm' };
    },
  ];
  const g31a = [
    (r) => {
      const p1 = r.pick([600, 720]), d1 = 500, p2 = p1 - r.pick([120, 180]), d2 = 1500;
      const loss = r.pick([3000, 4000, 6000]);
      return { q: T(`Policy $A$ has an annual premium of RM${p1} and a deductible of RM${d1}. Policy $B$ has an annual premium of RM${p2} and a deductible of RM${d2}. If a loss of RM${loss} occurs in the year, compare the total cost to the policyholder (premium + deductible) under each policy and recommend one.`, `Polisi $A$ mempunyai premium tahunan RM${p1} dan lebihan RM${d1}. Polisi $B$ mempunyai premium tahunan RM${p2} dan lebihan RM${d2}. Jika kerugian RM${loss} berlaku dalam tahun itu, bandingkan jumlah kos kepada pemegang polisi (premium + lebihan) di bawah setiap polisi dan syorkan satu.`), a: T(`A: RM${p1 + d1}; B: RM${p2 + d2}. ${p1 + d1 <= p2 + d2 ? 'A is cheaper if a claim is made' : 'B is cheaper even after a claim'}; if no claim is made, B costs only its premium RM${p2}.`, `A: RM${p1 + d1}; B: RM${p2 + d2}. ${p1 + d1 <= p2 + d2 ? 'A lebih murah jika tuntutan dibuat' : 'B lebih murah walaupun selepas tuntutan'}; jika tiada tuntutan, B hanya RM${p2} (premium).`), w: W(T(`With a claim, policy A: RM${p1} + RM${d1} = RM${p1 + d1}`, `Dengan tuntutan, polisi A: RM${p1} + RM${d1} = RM${p1 + d1}`), T(`With a claim, policy B: RM${p2} + RM${d2} = RM${p2 + d2}`, `Dengan tuntutan, polisi B: RM${p2} + RM${d2} = RM${p2 + d2}`), T(`Without a claim: A costs RM${p1}, B costs RM${p2} (RM${p1 - p2} less).`, `Tanpa tuntutan: A berkos RM${p1}, B berkos RM${p2} (RM${p1 - p2} kurang).`), T(`A lower premium usually comes with a higher deductible.`, `Premium yang lebih rendah biasanya disertai lebihan yang lebih tinggi.`)), sp: 'l' };
    },
  ];
  const g32e = [
    (r) => {
      const rate = r.pick([4, 5, 6, 8]), sum_ = r.pick([100000, 150000, 200000, 300000]);
      return { q: T(`The premium rate for a fire policy is RM${rate} per RM1 000 of sum insured. Find the annual premium for a house insured for ${rm(sum_)}.`, `Kadar premium bagi polisi kebakaran ialah RM${rate} bagi setiap RM1 000 jumlah diinsuranskan. Cari premium tahunan bagi sebuah rumah yang diinsuranskan sebanyak ${rm(sum_)}.`), a: T(`${rm((rate * sum_) / 1000)}`), w: T(`$${rate} \\times \\dfrac{${sum_}}{1000}$`), sp: 's' };
    },
  ];
  const g32m = [
    (r) => {
      const base = r.pick([1000, 1200, 1500]), ncd = r.pick([25, 30, 38.33, 45, 55].slice(0, 4));
      return { q: T(`A motor insurance premium is ${rm(base)}. The No-Claim Discount (NCD) supplied in the policy is ${ncd}%. Find the premium payable after the NCD.`, `Premium insurans motor ialah ${rm(base)}. Diskaun Tanpa Tuntutan (NCD) yang dibekalkan dalam polisi ialah ${ncd}%. Cari premium yang perlu dibayar selepas NCD.`), a: T(`${rm(round(base * (1 - ncd / 100), 2), 2)}`), w: T(`$${base} \\times (1 - ${ncd / 100})$`), sp: 's' };
    },
  ];
  const g32a = [
    (r) => {
      const value = r.pick([200000, 300000, 400000]), cover = value * 0.8 * r.pick([0.75, 1]);
      const loss = r.pick([40000, 60000, 80000]);
      const req = 0.8 * value;
      const pay = Math.min(loss, (cover / req) * loss);
      return { q: T(`A house is worth ${rm(value)}. The policy has a co-insurance clause: the house must be insured for at least 80% of its value or the payout is reduced in proportion. The house is insured for ${rm(cover)}. Find the payout for a fire loss of ${rm(loss)}.`, `Sebuah rumah bernilai ${rm(value)}. Polisi itu mempunyai klausa ko-insurans: rumah mesti diinsuranskan sekurang-kurangnya 80% daripada nilainya atau bayaran dikurangkan secara berkadar. Rumah itu diinsuranskan sebanyak ${rm(cover)}. Cari bayaran bagi kerugian kebakaran ${rm(loss)}.`), a: T(`Required ${rm(req)}; payout $= \\dfrac{${SPM.gm(cover)}}{${SPM.gm(req)}} \\times ${SPM.gm(loss)}$ = ${rm(round(pay, 2), 2)}`, `Diperlukan ${rm(req)}; bayaran $= \\dfrac{${SPM.gm(cover)}}{${SPM.gm(req)}} \\times ${SPM.gm(loss)}$ = ${rm(round(pay, 2), 2)}`), w: W(T(`Required insurance $= 80\\% \\times ${SPM.gm(value)} = ${SPM.gm(req)}$`, `Insurans yang diperlukan $= 80\\% \\times ${SPM.gm(value)} = ${SPM.gm(req)}$`), ...(cover >= req ? [T(`Insured amount ${rm(cover)} meets the requirement, so the full loss ${rm(loss)} is paid.`, `Jumlah diinsuranskan ${rm(cover)} memenuhi syarat, jadi seluruh kerugian ${rm(loss)} dibayar.`)] : [T(`Insured amount ${rm(cover)} is less than required, so the payout is reduced:`, `Jumlah diinsuranskan ${rm(cover)} kurang daripada yang diperlukan, jadi bayaran dikurangkan:`), `$\\dfrac{${SPM.gm(cover)}}{${SPM.gm(req)}} \\times ${SPM.gm(loss)} = ${SPM.gm(round(pay, 2))}$`]), T(`Payout ${rm(round(pay, 2), 2)}`, `Bayaran ${rm(round(pay, 2), 2)}`)), sp: 'l' };
    },
  ];
  SPM.addChapter(5, 3, T('Consumer Mathematics: Insurance', 'Matematik Pengguna: Insurans'), [
    { id: '3.1', en: 'Insurance', ms: 'Insurans', gen: { e: g31e, m: g31m, a: g31a } },
    { id: '3.2', en: 'Computation in insurance', ms: 'Pengiraan dalam insurans', gen: { e: g32e, m: g32m, a: g32a } },
  ]);

  /* =============================================================== 4 */
  const bandTax = (income, bands) => {
    let left = income, tax = 0, i = 0;
    const rows = [];
    for (const [width, rate] of bands) {
      const part = Math.min(left, width === null ? left : width);
      if (part <= 0) break;
      tax += (part * rate) / 100;
      rows.push([part, rate]);
      left -= part;
    }
    return { tax, rows };
  };
  const g41e = [
    (r) => {
      const c = r.pick([[T('income tax', 'cukai pendapatan'), T('direct tax', 'cukai langsung'), T('It is paid directly by the taxpayer to the government (LHDN).', 'Ia dibayar terus oleh pembayar cukai kepada kerajaan (LHDN).')], [T('Sales and Service Tax (SST)', 'Cukai Jualan dan Perkhidmatan (SST)'), T('indirect tax', 'cukai tidak langsung'), T('It is charged on goods and services and collected by the seller, so the consumer pays it indirectly.', 'Ia dikenakan ke atas barang dan perkhidmatan dan dikutip oleh penjual, jadi pengguna membayarnya secara tidak langsung.')], [T('quit rent', 'cukai tanah'), T('direct tax', 'cukai langsung'), T('It is paid directly by the land owner to the state government.', 'Ia dibayar terus oleh pemilik tanah kepada kerajaan negeri.')], [T('import duty', 'duti import'), T('indirect tax', 'cukai tidak langsung'), T('It is charged on imported goods and passed on to consumers through the price.', 'Ia dikenakan ke atas barang import dan dipindahkan kepada pengguna melalui harga.')]]);
      return { q: T(`Classify ${c[0].en} as a direct tax or an indirect tax.`, `Kelaskan ${c[0].ms} sebagai cukai langsung atau cukai tidak langsung.`), a: c[1], w: c[2], sp: 'xs' };
    },
    (r) => {
      const bill = r.pick([80, 120, 250]), rate = r.pick([6, 8, 10]);
      return { q: T(`A restaurant bill of RM${bill} (before tax) is subject to SST of ${rate}%. Find the tax and the total amount payable.`, `Bil sebuah restoran RM${bill} (sebelum cukai) dikenakan SST ${rate}%. Cari cukai dan jumlah yang perlu dibayar.`), a: T(`Tax RM${n((bill * rate) / 100)}; total RM${n(bill * (1 + rate / 100))}`, `Cukai RM${n((bill * rate) / 100)}; jumlah RM${n(bill * (1 + rate / 100))}`), w: W(T(`Tax $= \\dfrac{${rate}}{100} \\times ${bill} = ${n((bill * rate) / 100)}$`, `Cukai $= \\dfrac{${rate}}{100} \\times ${bill} = ${n((bill * rate) / 100)}$`), T(`Total $= ${bill} + ${n((bill * rate) / 100)} = ${n(bill + (bill * rate) / 100)}$`, `Jumlah $= ${bill} + ${n((bill * rate) / 100)} = ${n(bill + (bill * rate) / 100)}$`)), sp: 's' };
    },
    (r) => {
      const inc = r.pick([48000, 60000, 72000]), rel = r.pick([9000, 12000, 15000]);
      return { q: T(`A taxpayer's annual income is ${rm(inc)} and total tax reliefs are ${rm(rel)}. Find the chargeable income.`, `Pendapatan tahunan seorang pembayar cukai ialah ${rm(inc)} dan jumlah pelepasan cukai ialah ${rm(rel)}. Cari pendapatan bercukai.`), a: T(`${rm(inc - rel)}`), w: W(T('Chargeable income = annual income − tax reliefs', 'Pendapatan bercukai = pendapatan tahunan − pelepasan cukai'), `$${SPM.gm(inc)} - ${SPM.gm(rel)} = ${SPM.gm(inc - rel)}$`, `${rm(inc - rel)}`), sp: 's' };
    },
  ];
  const g41m = [
    (r) => {
      const rent = r.pick([800, 1200, 1500]), rate = r.pick([5, 6, 8]);
      return { q: T(`The annual assessment tax on a shop is ${rate}% of its yearly rent. The monthly rent is ${rm(rent)}. Find the assessment tax payable for one year.`, `Cukai pintu tahunan sebuah kedai ialah ${rate}% daripada sewa tahunannya. Sewa bulanan ialah ${rm(rent)}. Cari cukai pintu yang perlu dibayar bagi satu tahun.`), a: T(`${rm(round((rent * 12 * rate) / 100, 2), 2)}`), w: T(`Yearly rent $= ${rent} \\times 12$`, `Sewa tahunan $= ${rent} \\times 12$`), sp: 's' };
    },
    (r) => {
      const chargeable = r.pick([28000, 35000, 42000, 50000]);
      const bands = [[5000, 0], [15000, 1], [15000, 3], [null, 8]];
      const { tax, rows } = bandTax(chargeable, bands);
      return { q: T(`Income tax is charged as follows: the first RM5 000 at 0%, the next RM15 000 at 1%, the next RM15 000 at 3%, and the rest at 8%. Find the tax on a chargeable income of ${rm(chargeable)}.`, `Cukai pendapatan dikenakan seperti berikut: RM5 000 pertama pada 0%, RM15 000 berikutnya pada 1%, RM15 000 berikutnya pada 3%, dan selebihnya pada 8%. Cari cukai bagi pendapatan bercukai ${rm(chargeable)}.`), a: T(`${rows.map((rw) => `${rw[0]} × ${rw[1]}%`).join(' + ')} = ${rm(round(tax, 2), 2)}`, `${rows.map((rw) => `${rw[0]} × ${rw[1]}%`).join(' + ')} = ${rm(round(tax, 2), 2)}`), w: W(...rows.map((rw) => `$${SPM.gm(rw[0])} \\times ${rw[1]}\\% = ${n((rw[0] * rw[1]) / 100)}$`), T(`Total tax $= ${rows.map((rw) => n((rw[0] * rw[1]) / 100)).join(' + ')} = ${n(round(tax, 2))}$`, `Jumlah cukai $= ${rows.map((rw) => n((rw[0] * rw[1]) / 100)).join(' + ')} = ${n(round(tax, 2))}$`), T(`The bands must add up to the chargeable income: $${rows.map((rw) => SPM.gm(rw[0])).join(' + ')} = ${SPM.gm(chargeable)}$`, `Jumlah semua jalur mesti sama dengan pendapatan bercukai: $${rows.map((rw) => SPM.gm(rw[0])).join(' + ')} = ${SPM.gm(chargeable)}$`)), sp: 'm' };
    },
  ];
  const g41a = [
    (r) => {
      const sal = r.pick([4500, 5000, 6000]), bonus = r.pick([6000, 9000]), reliefs = r.pick([9000, 12000, 16000]), rental = r.pick([0, 6000]);
      const gross = sal * 12 + bonus + rental;
      const chargeable = gross - reliefs;
      const { tax, rows } = bandTax(chargeable, [[5000, 0], [15000, 1], [15000, 3], [null, 8]]);
      const rebate = 400;
      return { q: T(`Aisyah earns a monthly salary of ${rm(sal)}, a bonus of ${rm(bonus)}${rental ? ` and rental income of ${rm(rental)}` : ''} in the year. Her total tax reliefs are ${rm(reliefs)}. Tax bands: first RM5 000 at 0%, next RM15 000 at 1%, next RM15 000 at 3%, the rest at 8%. She receives a tax rebate of RM${rebate}. Find her income tax payable.`, `Aisyah memperoleh gaji bulanan ${rm(sal)}, bonus ${rm(bonus)}${rental ? ` dan pendapatan sewa ${rm(rental)}` : ''} dalam tahun itu. Jumlah pelepasan cukainya ialah ${rm(reliefs)}. Kadar cukai: RM5 000 pertama pada 0%, RM15 000 berikutnya pada 1%, RM15 000 berikutnya pada 3%, selebihnya pada 8%. Dia menerima rebat cukai RM${rebate}. Cari cukai pendapatan yang perlu dibayar.`), a: T(`Gross ${rm(gross)}; chargeable ${rm(chargeable)}; tax ${rm(round(tax, 2), 2)}; payable ${rm(round(Math.max(0, tax - rebate), 2), 2)}`, `Kasar ${rm(gross)}; bercukai ${rm(chargeable)}; cukai ${rm(round(tax, 2), 2)}; perlu dibayar ${rm(round(Math.max(0, tax - rebate), 2), 2)}`), w: W(T(`Gross income $= ${sal} \\times 12 + ${bonus}${rental ? ` + ${rental}` : ''} = ${SPM.gm(gross)}$`, `Pendapatan kasar $= ${sal} \\times 12 + ${bonus}${rental ? ` + ${rental}` : ''} = ${SPM.gm(gross)}$`), T(`Chargeable income $= ${SPM.gm(gross)} - ${SPM.gm(reliefs)} = ${SPM.gm(chargeable)}$`, `Pendapatan bercukai $= ${SPM.gm(gross)} - ${SPM.gm(reliefs)} = ${SPM.gm(chargeable)}$`), T(`Tax $= ${rows.map((rw) => `${SPM.gm(rw[0])}(${rw[1]}\\%)`).join(' + ')} = ${n(round(tax, 2))}$`, `Cukai $= ${rows.map((rw) => `${SPM.gm(rw[0])}(${rw[1]}\\%)`).join(' + ')} = ${n(round(tax, 2))}$`), T(`Tax payable $= ${n(round(tax, 2))} - ${rebate} = ${n(round(Math.max(0, tax - rebate), 2))}$ (the rebate is subtracted from the tax, not from the income)`, `Cukai perlu dibayar $= ${n(round(tax, 2))} - ${rebate} = ${n(round(Math.max(0, tax - rebate), 2))}$ (rebat ditolak daripada cukai, bukan daripada pendapatan)`)), sp: 'xl' };
    },
  ];
  const g4Ee = [
    (r) => {
      const c = r.pick([
        [T('A shop owner keeps two sets of accounts, one showing lower sales to the tax authority.', 'Seorang pemilik kedai menyimpan dua set akaun, satu menunjukkan jualan yang lebih rendah kepada pihak berkuasa cukai.'), true, T('Keeping false accounts to under-declare sales is deliberate.', 'Menyimpan akaun palsu untuk mengurangkan jualan yang diisytiharkan adalah disengajakan.')],
        [T('A taxpayer claims a relief that he is entitled to, using receipts.', 'Seorang pembayar cukai menuntut pelepasan yang layak dituntutnya, menggunakan resit.'), false, T('Claiming a relief one is entitled to, with receipts, is allowed by law.', 'Menuntut pelepasan yang layak dengan resit dibenarkan oleh undang-undang.')],
        [T('An employee accidentally forgets to declare a small bank interest and corrects it when reminded.', 'Seorang pekerja terlupa mengisytiharkan faedah bank yang kecil dan membetulkannya apabila diingatkan.'), false, T('The mistake was not deliberate and was corrected.', 'Kesilapan itu tidak disengajakan dan telah dibetulkan.')],
      ]);
      return { q: T(`Is this tax evasion? Explain. "${c[0].en}"`, `Adakah ini pengelakan cukai (penipuan cukai)? Terangkan. "${c[0].ms}"`), a: c[1] ? T('Yes: deliberately hiding income is illegal and can lead to investigation, penalties, fines and imprisonment; it also reduces public revenue and is dishonest.', 'Ya: sengaja menyembunyikan pendapatan adalah menyalahi undang-undang dan boleh membawa kepada siasatan, penalti, denda dan pemenjaraan; ia juga mengurangkan hasil awam dan tidak jujur.') : T('No: this is an honest error or lawful tax planning, not deliberate evasion.', 'Tidak: ini ialah kesilapan jujur atau perancangan cukai yang sah, bukan pengelakan yang disengajakan.'), w: W(T('Tax evasion = deliberately hiding income or giving false information to pay less tax.', 'Pengelakan cukai = sengaja menyembunyikan pendapatan atau memberi maklumat palsu untuk membayar cukai yang kurang.'), c[2]), sp: 's' };
    },
  ];
  SPM.addChapter(5, 4, T('Consumer Mathematics: Taxation', 'Matematik Pengguna: Percukaian'), [
    { id: '4.1', en: 'Taxation', ms: 'Percukaian', gen: { e: g41e, m: g41m, a: g41a } },
    { id: '4.1E', en: 'Consequences of tax evasion', ms: 'Akibat pengelakan cukai', scope: 'support', gen: { e: g4Ee, m: g4Ee, a: g4Ee } },
  ]);
})();
