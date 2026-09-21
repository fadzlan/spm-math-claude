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

  /* =============================================================== 1 */
  const g11e = [
    (r) => {
      const k = r.int(2, 9), x1 = r.int(2, 6), x2 = r.int(7, 12);
      return { q: T(`$y$ varies directly as $x$. When $x = ${x1}$, $y = ${k * x1}$. Find (a) the relation between $y$ and $x$, (b) $y$ when $x = ${x2}$.`, `$y$ berubah secara langsung dengan $x$. Apabila $x = ${x1}$, $y = ${k * x1}$. Cari (a) hubungan antara $y$ dengan $x$, (b) $y$ apabila $x = ${x2}$.`), a: T(`(a) $y = ${k}x$ (b) $${k * x2}$`), sp: 's' };
    },
  ];
  const g11m = [
    (r) => {
      const k = r.int(2, 5), x1 = r.int(2, 4), x2 = r.int(5, 9);
      return { q: T(`$y \\propto x^2$ and $y = ${k * x1 * x1}$ when $x = ${x1}$. Find $y$ when $x = ${x2}$.`, `$y \\propto x^2$ dan $y = ${k * x1 * x1}$ apabila $x = ${x1}$. Cari $y$ apabila $x = ${x2}$.`), a: T(`$k = ${k}$; $y = ${k * x2 * x2}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(2, 5), a = r.pick([4, 9, 16, 25]), b = r.pick([36, 49, 64]);
      return { q: T(`$y \\propto \\sqrt{x}$ and $y = ${k * Math.sqrt(a)}$ when $x = ${a}$. Find $y$ when $x = ${b}$.`, `$y \\propto \\sqrt{x}$ dan $y = ${k * Math.sqrt(a)}$ apabila $x = ${a}$. Cari $y$ apabila $x = ${b}$.`), a: T(`$k = ${k}$; $y = ${k * Math.sqrt(b)}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(2, 4), xs = [1, 2, 3, 4];
      const ys = xs.map((x) => k * x * x);
      const gaps = r.sample([1, 2, 3], 2);
      const tab = (h) => SPM.table([['$x$', ...xs], ['$y$', ...ys.map((y, i) => (gaps.includes(i) ? '' : y))]]);
      return { q: T(`$y$ varies directly as $x^2$. Complete the table.<br>${tab()}`, `$y$ berubah secara langsung dengan $x^2$. Lengkapkan jadual.<br>${tab()}`), a: T(`$k = ${k}$; missing values: ${gaps.map((i) => `$x = ${xs[i]}$: $y = ${ys[i]}$`).join(', ')}`, `$k = ${k}$; nilai yang hilang: ${gaps.map((i) => `$x = ${xs[i]}$: $y = ${ys[i]}$`).join(', ')}`), sp: 's' };
    },
  ];
  const g11a = [
    (r) => {
      const k = r.int(2, 5), pw = r.pick([2, 3]);
      const xs = [1, 2, 3, 4], ys = xs.map((x) => k * Math.pow(x, pw));
      const tab = SPM.table([['$x$', ...xs], ['$y$', ...ys]]);
      return { q: T(`The table shows values of $x$ and $y$.<br>${tab}<br>Test whether $y \\propto x$, $y \\propto x^2$ or $y \\propto x^3$ by calculating $\\dfrac{y}{x^n}$, and write the relation.`, `Jadual menunjukkan nilai $x$ dan $y$.<br>${tab}<br>Uji sama ada $y \\propto x$, $y \\propto x^2$ atau $y \\propto x^3$ dengan menghitung $\\dfrac{y}{x^n}$, dan tulis hubungannya.`), a: T(`$\\dfrac{y}{x^${pw}} = ${k}$ is constant, so $y = ${k}x^${pw}$`, `$\\dfrac{y}{x^${pw}} = ${k}$ malar, jadi $y = ${k}x^${pw}$`), sp: 'm' };
    },
    (r) => {
      const k = r.int(2, 4), x1 = r.int(2, 4), c = r.int(2, 3);
      const y1 = k * x1 * x1;
      const y2 = y1 * c * c;
      return { q: T(`$y$ varies directly as the square of $x$. When $x$ is multiplied by ${c}, by what factor is $y$ multiplied? Check with $x = ${x1}$ and $x = ${x1 * c}$.`, `$y$ berubah secara langsung dengan kuasa dua $x$. Apabila $x$ didarab dengan ${c}, $y$ didarab dengan faktor berapa? Semak dengan $x = ${x1}$ dan $x = ${x1 * c}$.`), a: T(`Factor ${c * c}: $y$ changes from ${y1} to ${y2} ($k = ${k}$).`, `Faktor ${c * c}: $y$ berubah daripada ${y1} kepada ${y2} ($k = ${k}$).`), sp: 'm' };
    },
  ];
  const g12e = [
    (r) => {
      const x1 = r.pick([2, 3, 4, 6]);
      const kk = x1 * r.int(2, 6);
      const x2 = r.pick([1, 2, 3, 4, 6, 12].filter((v) => kk % v === 0 && v !== x1));
      need(x2);
      return { q: T(`$y$ varies inversely as $x$. When $x = ${x1}$, $y = ${kk / x1}$. Find $y$ when $x = ${x2}$.`, `$y$ berubah secara songsang dengan $x$. Apabila $x = ${x1}$, $y = ${kk / x1}$. Cari $y$ apabila $x = ${x2}$.`), a: T(`$k = ${kk}$; $y = ${kk / x2}$`), sp: 's' };
    },
  ];
  const g12m = [
    (r) => {
      const x1 = r.pick([2, 3, 4]), k = x1 * x1 * r.int(2, 6);
      const x2 = r.pick([1, 6, 12].filter((v) => k % (v * v) === 0));
      need(x2);
      return { q: T(`$y \\propto \\dfrac{1}{x^2}$ and $y = ${k / (x1 * x1)}$ when $x = ${x1}$. Find $y$ when $x = ${x2}$.`, `$y \\propto \\dfrac{1}{x^2}$ dan $y = ${k / (x1 * x1)}$ apabila $x = ${x1}$. Cari $y$ apabila $x = ${x2}$.`), a: T(`$k = ${k}$; $y = ${n(k / (x2 * x2))}$`), sp: 's' };
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
      return { q: T(`The table shows $x$ and $y$.<br>${tab}<br>Determine whether $y \\propto \\dfrac{1}{x}$ or $y \\propto \\dfrac{1}{x^2}$ by testing the products $yx$ and $yx^2$, and write the relation.`, `Jadual menunjukkan $x$ dan $y$.<br>${tab}<br>Tentukan sama ada $y \\propto \\dfrac{1}{x}$ atau $y \\propto \\dfrac{1}{x^2}$ dengan menguji hasil darab $yx$ dan $yx^2$, dan tulis hubungannya.`), a: T(`$${pw === 1 ? 'yx' : 'yx^2'} = ${k}$ is constant, so $y = \\dfrac{${k}}{x${pw === 2 ? '^2' : ''}}$`, `$${pw === 1 ? 'yx' : 'yx^2'} = ${k}$ malar, jadi $y = \\dfrac{${k}}{x${pw === 2 ? '^2' : ''}}$`), sp: 'm' };
    },
  ];
  const g13e = [
    (r) => {
      const k = r.int(2, 5), x = r.int(2, 5), y = r.int(2, 5), z2x = r.int(3, 6), z2y = r.int(2, 6);
      return { q: T(`$z$ varies jointly as $x$ and $y$. $z = ${k * x * y}$ when $x = ${x}$ and $y = ${y}$. Find $z$ when $x = ${z2x}$ and $y = ${z2y}$.`, `$z$ berubah secara bersama dengan $x$ dan $y$. $z = ${k * x * y}$ apabila $x = ${x}$ dan $y = ${y}$. Cari $z$ apabila $x = ${z2x}$ dan $y = ${z2y}$.`), a: T(`$z = ${k}xy$; $z = ${k * z2x * z2y}$`), sp: 's' };
    },
  ];
  const g13m = [
    (r) => {
      const k = r.int(2, 4), x = r.int(2, 4), y = r.pick([2, 4, 5]);
      const z = (k * x * x) / y;
      const x2 = r.int(5, 8), y2 = r.pick([2, 5, 10]);
      return { q: T(`$z \\propto \\dfrac{x^2}{y}$ and $z = ${n(round(z, 3))}$ when $x = ${x}$ and $y = ${y}$. Find $z$ when $x = ${x2}$ and $y = ${y2}$.`, `$z \\propto \\dfrac{x^2}{y}$ dan $z = ${n(round(z, 3))}$ apabila $x = ${x}$ dan $y = ${y}$. Cari $z$ apabila $x = ${x2}$ dan $y = ${y2}$.`), a: T(`$k = ${k}$; $z = ${n(round((k * x2 * x2) / y2, 3))}$`), sp: 'm' };
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
      return { q: T(`$P$ varies directly as $V^2$ and inversely as $R$. $P = ${P1}$ when $V = ${V1}$ and $R = ${R1}$. Find $P$ when $V$ is doubled and $R$ is doubled at the same time.`, `$P$ berubah secara langsung dengan $V^2$ dan secara songsang dengan $R$. $P = ${P1}$ apabila $V = ${V1}$ dan $R = ${R1}$. Cari $P$ apabila $V$ digandakan dan $R$ digandakan serentak.`), a: T(`$P = \\dfrac{kV^2}{R}$; $P = ${n(P2)}$ (it doubles)`, `$P = \\dfrac{kV^2}{R}$; $P = ${n(P2)}$ (ia digandakan)`), sp: 'm' };
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

  const g21e = [
    (r) => {
      const A = rmat(r, r.pick([2, 3]), r.pick([2, 3]), -5, 9);
      const i = r.int(0, A.length - 1), j = r.int(0, A[0].length - 1);
      return { q: T(`$A = ${M(A)}$. State the order of $A$ and the value of the element $a_{${i + 1}${j + 1}}$ (row ${i + 1}, column ${j + 1}).`, `$A = ${M(A)}$. Nyatakan peringkat $A$ dan nilai unsur $a_{${i + 1}${j + 1}}$ (baris ${i + 1}, lajur ${j + 1}).`), a: T(`Order $${A.length} \\times ${A[0].length}$; $a_{${i + 1}${j + 1}} = ${A[i][j]}$`, `Peringkat $${A.length} \\times ${A[0].length}$; $a_{${i + 1}${j + 1}} = ${A[i][j]}$`), sp: 's' };
    },
  ];
  const g21m = [
    (r) => {
      const x = r.int(-4, 8), y = r.int(-4, 8), p = r.int(1, 5);
      return { q: T(`Given $${M([[`x + ${p}`, 3], [5, 'y']])} = ${M([[x + p, 3], [5, y]])}$, find $x$ and $y$.`, `Diberi $${M([[`x + ${p}`, 3], [5, 'y']])} = ${M([[x + p, 3], [5, y]])}$, cari $x$ dan $y$.`), a: T(`$x = ${x}$, $y = ${y}$`), sp: 's' };
    },
  ];
  const g21a = [
    (r) => {
      const x = r.int(1, 5), y = r.int(1, 5);
      const c1 = 2 * x + y, c2 = x - y * 1;
      return { q: T(`Given $${M([['2x + y', 4], [3, 'x - y']])} = ${M([[c1, 4], [3, c2]])}$, form two equations and find $x$ and $y$.`, `Diberi $${M([['2x + y', 4], [3, 'x - y']])} = ${M([[c1, 4], [3, c2]])}$, bentukkan dua persamaan dan cari $x$ dan $y$.`), a: T(`$2x + y = ${c1}$, $x - y = ${c2}$; $x = ${x}$, $y = ${y}$`), sp: 'm' };
    },
  ];
  const g22e = [
    (r) => {
      const A = rmat(r, 2, 2, -3, 8), B = rmat(r, 2, 2, -3, 8);
      const plus = r.chance();
      return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. Find $A ${plus ? '+' : '-'} B$ and $3A$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Cari $A ${plus ? '+' : '-'} B$ dan $3A$.`), a: T(`$${M(madd(A, B, plus ? 1 : -1))}$; $${M(msc(3, A))}$`), sp: 's' };
    },
  ];
  const g22m = [
    (r) => {
      const A = rmat(r, 2, 2, -2, 6), B = rmat(r, 2, 2, -2, 6);
      return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. Find $2A - 3B$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Cari $2A - 3B$.`), a: T(`$${M(madd(msc(2, A), msc(3, B), -1))}$`), sp: 'm' };
    },
    (r) => {
      const A = rmat(r, 2, 2, -2, 5), B = rmat(r, 2, 2, -2, 5);
      return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. Find $AB$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Cari $AB$.`), a: T(`$${M(mmul(A, B))}$`), sp: 'm' };
    },
    (r) => {
      const A = rmat(r, 2, 3, -2, 4), B = rmat(r, 3, 2, -2, 4);
      return { q: T(`$A = ${M(A)}$ and $B = ${M(B)}$. State the order of $AB$ and $BA$ and find $AB$.`, `$A = ${M(A)}$ dan $B = ${M(B)}$. Nyatakan peringkat $AB$ dan $BA$ dan cari $AB$.`), a: T(`$AB$ is $2 \\times 2$; $BA$ is $3 \\times 3$; $AB = ${M(mmul(A, B))}$`, `$AB$ ialah $2 \\times 2$; $BA$ ialah $3 \\times 3$; $AB = ${M(mmul(A, B))}$`), sp: 'm' };
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
      return { q: T(`Two families buy fruit. The quantities (kg of apples, oranges, grapes) are ${M(shops)} (rows: Family 1, Family 2). The prices in RM per kg at two shops are ${M(prices)} (columns: Shop A, Shop B). Multiply the matrices to find the cost of each family's fruit at each shop, and state which shop is cheaper for Family 1.`, `Dua keluarga membeli buah. Kuantiti (kg epal, oren, anggur) ialah ${M(shops)} (baris: Keluarga 1, Keluarga 2). Harga dalam RM per kg di dua kedai ialah ${M(prices)} (lajur: Kedai A, Kedai B). Darabkan matriks untuk mencari kos buah setiap keluarga di setiap kedai, dan nyatakan kedai yang lebih murah bagi Keluarga 1.`), a: T(`$${M(R)}$ (RM). Family 1: ${R[0][0] <= R[0][1] ? 'Shop A' : 'Shop B'} is cheaper.`, `$${M(R)}$ (RM). Keluarga 1: ${R[0][0] <= R[0][1] ? 'Kedai A' : 'Kedai B'} lebih murah.`), sp: 'l' };
    },
  ];
  const g23e = [
    (r) => {
      const A = retry(() => { const a = rmat(r, 2, 2, -3, 6); need(Math.abs(det(a)) === 1 || Math.abs(det(a)) === 2); return a; });
      return { q: T(`Find the determinant of $A = ${M(A)}$ and, if it exists, the inverse of $A$.`, `Cari penentu bagi $A = ${M(A)}$ dan, jika wujud, songsangan bagi $A$.`), a: T(`$\\det A = ${det(A)}$; $A^{-1} = ${invTex(A)}$`), sp: 'm' };
    },
  ];
  const g23m = [
    (r) => {
      const A = retry(() => { const a = rmat(r, 2, 2, -3, 7); need(Math.abs(det(a)) >= 3 && Math.abs(det(a)) <= 12); return a; });
      return { q: T(`Find the inverse of $${M(A)}$ and verify that $MM^{-1} = I$ for the first row and column.`, `Cari songsangan bagi $${M(A)}$ dan sahkan bahawa $MM^{-1} = I$ bagi baris dan lajur pertama.`), a: T(`$${fracM(invM(A))}$; $M M^{-1}$ (1,1) $= ${A[0][0]}(${frT(invM(A)[0][0])}) + ${A[0][1]}(${frT(invM(A)[1][0])}) = 1$`), sp: 'm' };
    },
    (r) => {
      const A = retry(() => { const a = rmat(r, 2, 2, 1, 4); need(det(a) === 1 || det(a) === -1); return a; });
      const X = rmat(r, 2, 1, -3, 5);
      const B = mmul(A, X);
      const Ai = invM(A);
      return { q: T(`$A = ${M(A)}$ and $AX = ${M(B)}$. Find the matrix $X$.`, `$A = ${M(A)}$ dan $AX = ${M(B)}$. Cari matriks $X$.`), a: T(`$X = A^{-1}${M(B)} = ${M(X)}$`), sp: 'm' };
    },
  ];
  const g23a = [
    (r) => {
      return retry(() => {
        const p = r.int(-3, 5), q = r.int(-3, 5), a1 = r.int(1, 4), b1 = r.int(1, 4), a2 = r.int(1, 3), b2 = -r.int(1, 3);
        need(a1 * b2 - a2 * b1 !== 0);
        const c1 = a1 * p + b1 * q, c2 = a2 * p + b2 * q;
        return { q: T(`Write the simultaneous equations $${poly([[a1, 'p'], [b1, 'q']])} = ${c1}$ and $${poly([[a2, 'p'], [b2, 'q']])} = ${c2}$ in the form $${M([['a', 'b'], ['c', 'd']])}${M([['p'], ['q']])} = ${M([['e'], ['f']])}$. Hence use the inverse matrix to find $p$ and $q$.`, `Tulis persamaan serentak $${poly([[a1, 'p'], [b1, 'q']])} = ${c1}$ dan $${poly([[a2, 'p'], [b2, 'q']])} = ${c2}$ dalam bentuk $${M([['a', 'b'], ['c', 'd']])}${M([['p'], ['q']])} = ${M([['e'], ['f']])}$. Seterusnya gunakan matriks songsang untuk mencari $p$ dan $q$.`), a: T(`$${M([[a1, b1], [a2, b2]])}${M([['p'], ['q']])} = ${M([[c1], [c2]])}$; $${M([['p'], ['q']])} = ${invTex([[a1, b1], [a2, b2]])}${M([[c1], [c2]])} = ${M([[p], [q]])}$`), sp: 'l' };
      });
    },
    (r) => {
      const k = r.int(2, 6), a = r.int(1, 3);
      return { q: T(`The matrix $${M([[a, k], [2 * a, 'x']])}$ has no inverse. Find $x$.`, `Matriks $${M([[a, k], [2 * a, 'x']])}$ tidak mempunyai songsangan. Cari $x$.`), a: T(`$\\det = ${a}x - ${2 * a * k} = 0$, so $x = ${2 * k}$`), sp: 'm' };
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
      const c = r.pick([[T('paying for a hospital operation', 'membayar pembedahan di hospital'), T('medical (health) insurance', 'insurans perubatan (kesihatan)')], [T('repairing a car after an accident', 'membaiki kereta selepas kemalangan'), T('motor insurance', 'insurans motor')], [T('providing money for a family if the breadwinner dies', 'menyediakan wang untuk keluarga jika pencari nafkah meninggal dunia'), T('life insurance', 'insurans hayat')], [T('repairing a house damaged by fire', 'membaiki rumah yang rosak akibat kebakaran'), T('fire (home) insurance', 'insurans kebakaran (rumah)')]]);
      return { q: T(`Which type of insurance is most suitable for ${c[0].en}?`, `Insurans jenis manakah yang paling sesuai untuk ${c[0].ms}?`), a: c[1], sp: 's' };
    },
  ];
  const g31m = [
    (r) => {
      const prem = r.pick([120, 180, 240]), ded = r.pick([200, 500, 1000]), limit = r.pick([20000, 50000]);
      return { q: T(`A policy has an annual premium of RM${prem}, a deductible of RM${ded} and a claim limit of RM${limit}. What do the premium, the deductible and the limit mean?`, `Sebuah polisi mempunyai premium tahunan RM${prem}, deduktibel RM${ded} dan had tuntutan RM${limit}. Apakah maksud premium, deduktibel dan had itu?`), a: T(`Premium: the amount paid each year for cover. Deductible: the part of each claim the policyholder pays first. Limit: the most the insurer will pay.`, `Premium: jumlah yang dibayar setiap tahun untuk perlindungan. Deduktibel: bahagian setiap tuntutan yang dibayar dahulu oleh pemegang polisi. Had: jumlah maksimum yang akan dibayar oleh penanggung insurans.`), sp: 'm' };
    },
  ];
  const g31a = [
    (r) => {
      const p1 = r.pick([600, 720]), d1 = 500, p2 = p1 - r.pick([120, 180]), d2 = 1500;
      const loss = r.pick([3000, 4000, 6000]);
      return { q: T(`Policy $A$ has an annual premium of RM${p1} and a deductible of RM${d1}. Policy $B$ has an annual premium of RM${p2} and a deductible of RM${d2}. If a loss of RM${loss} occurs in the year, compare the total cost to the policyholder (premium + deductible) under each policy and recommend one.`, `Polisi $A$ mempunyai premium tahunan RM${p1} dan deduktibel RM${d1}. Polisi $B$ mempunyai premium tahunan RM${p2} dan deduktibel RM${d2}. Jika kerugian RM${loss} berlaku dalam tahun itu, bandingkan jumlah kos kepada pemegang polisi (premium + deduktibel) di bawah setiap polisi dan syorkan satu.`), a: T(`A: RM${p1 + d1}; B: RM${p2 + d2}. ${p1 + d1 <= p2 + d2 ? 'A is cheaper if a claim is made' : 'B is cheaper even after a claim'}; if no claim is made, B costs only its premium RM${p2}.`, `A: RM${p1 + d1}; B: RM${p2 + d2}. ${p1 + d1 <= p2 + d2 ? 'A lebih murah jika tuntutan dibuat' : 'B lebih murah walaupun selepas tuntutan'}; jika tiada tuntutan, B hanya RM${p2} (premium).`), sp: 'l' };
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
      return { q: T(`A house is worth ${rm(value)}. The policy has a co-insurance clause: the house must be insured for at least 80% of its value or the payout is reduced in proportion. The house is insured for ${rm(cover)}. Find the payout for a fire loss of ${rm(loss)}.`, `Sebuah rumah bernilai ${rm(value)}. Polisi itu mempunyai klausa ko-insurans: rumah mesti diinsuranskan sekurang-kurangnya 80% daripada nilainya atau bayaran dikurangkan secara berkadar. Rumah itu diinsuranskan sebanyak ${rm(cover)}. Cari bayaran bagi kerugian kebakaran ${rm(loss)}.`), a: T(`Required ${rm(req)}; payout $= \\dfrac{${cover}}{${req}} \\times ${loss} = ${rm(round(pay, 2), 2)}$`, `Diperlukan ${rm(req)}; bayaran $= \\dfrac{${cover}}{${req}} \\times ${loss} = ${rm(round(pay, 2), 2)}$`), sp: 'l' };
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
      const c = r.pick([[T('income tax', 'cukai pendapatan'), T('direct tax', 'cukai langsung')], [T('Sales and Service Tax (SST)', 'Cukai Jualan dan Perkhidmatan (SST)'), T('indirect tax', 'cukai tidak langsung')], [T('quit rent', 'cukai tanah'), T('direct tax', 'cukai langsung')], [T('import duty', 'duti import'), T('indirect tax', 'cukai tidak langsung')]]);
      return { q: T(`Classify ${c[0].en} as a direct tax or an indirect tax.`, `Kelaskan ${c[0].ms} sebagai cukai langsung atau cukai tidak langsung.`), a: c[1], sp: 'xs' };
    },
    (r) => {
      const bill = r.pick([80, 120, 250]), rate = r.pick([6, 8, 10]);
      return { q: T(`A restaurant bill of RM${bill} (before tax) is subject to SST of ${rate}%. Find the tax and the total amount payable.`, `Bil sebuah restoran RM${bill} (sebelum cukai) dikenakan SST ${rate}%. Cari cukai dan jumlah yang perlu dibayar.`), a: T(`Tax RM${n((bill * rate) / 100)}; total RM${n(bill * (1 + rate / 100))}`, `Cukai RM${n((bill * rate) / 100)}; jumlah RM${n(bill * (1 + rate / 100))}`), sp: 's' };
    },
    (r) => {
      const inc = r.pick([48000, 60000, 72000]), rel = r.pick([9000, 12000, 15000]);
      return { q: T(`A taxpayer's annual income is ${rm(inc)} and total tax reliefs are ${rm(rel)}. Find the chargeable income.`, `Pendapatan tahunan seorang pembayar cukai ialah ${rm(inc)} dan jumlah pelepasan cukai ialah ${rm(rel)}. Cari pendapatan bercukai.`), a: T(`${rm(inc - rel)}`), sp: 's' };
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
      return { q: T(`Income tax is charged as follows: the first RM5 000 at 0%, the next RM15 000 at 1%, the next RM15 000 at 3%, and the rest at 8%. Find the tax on a chargeable income of ${rm(chargeable)}.`, `Cukai pendapatan dikenakan seperti berikut: RM5 000 pertama pada 0%, RM15 000 berikutnya pada 1%, RM15 000 berikutnya pada 3%, dan selebihnya pada 8%. Cari cukai bagi pendapatan bercukai ${rm(chargeable)}.`), a: T(`${rows.map((rw) => `${rw[0]} × ${rw[1]}%`).join(' + ')} = ${rm(round(tax, 2), 2)}`, `${rows.map((rw) => `${rw[0]} × ${rw[1]}%`).join(' + ')} = ${rm(round(tax, 2), 2)}`), sp: 'm' };
    },
  ];
  const g41a = [
    (r) => {
      const sal = r.pick([4500, 5000, 6000]), bonus = r.pick([6000, 9000]), reliefs = r.pick([9000, 12000, 16000]), rental = r.pick([0, 6000]);
      const gross = sal * 12 + bonus + rental;
      const chargeable = gross - reliefs;
      const { tax } = bandTax(chargeable, [[5000, 0], [15000, 1], [15000, 3], [null, 8]]);
      const rebate = 400;
      return { q: T(`Aisyah earns a monthly salary of ${rm(sal)}, a bonus of ${rm(bonus)}${rental ? ` and rental income of ${rm(rental)}` : ''} in the year. Her total tax reliefs are ${rm(reliefs)}. Tax bands: first RM5 000 at 0%, next RM15 000 at 1%, next RM15 000 at 3%, the rest at 8%. She receives a tax rebate of RM${rebate}. Find her income tax payable.`, `Aisyah memperoleh gaji bulanan ${rm(sal)}, bonus ${rm(bonus)}${rental ? ` dan pendapatan sewa ${rm(rental)}` : ''} dalam tahun itu. Jumlah pelepasan cukainya ialah ${rm(reliefs)}. Kadar cukai: RM5 000 pertama pada 0%, RM15 000 berikutnya pada 1%, RM15 000 berikutnya pada 3%, selebihnya pada 8%. Dia menerima rebat cukai RM${rebate}. Cari cukai pendapatan yang perlu dibayar.`), a: T(`Gross ${rm(gross)}; chargeable ${rm(chargeable)}; tax ${rm(round(tax, 2), 2)}; payable ${rm(round(Math.max(0, tax - rebate), 2), 2)}`, `Kasar ${rm(gross)}; bercukai ${rm(chargeable)}; cukai ${rm(round(tax, 2), 2)}; perlu dibayar ${rm(round(Math.max(0, tax - rebate), 2), 2)}`), sp: 'xl' };
    },
  ];
  const g4Ee = [
    (r) => {
      const c = r.pick([
        [T('A shop owner keeps two sets of accounts, one showing lower sales to the tax authority.', 'Seorang pemilik kedai menyimpan dua set akaun, satu menunjukkan jualan yang lebih rendah kepada pihak berkuasa cukai.'), true],
        [T('A taxpayer claims a relief that he is entitled to, using receipts.', 'Seorang pembayar cukai menuntut pelepasan yang layak dituntutnya, menggunakan resit.'), false],
        [T('An employee accidentally forgets to declare a small bank interest and corrects it when reminded.', 'Seorang pekerja terlupa mengisytiharkan faedah bank yang kecil dan membetulkannya apabila diingatkan.'), false],
      ]);
      return { q: T(`Is this tax evasion? Explain. "${c[0].en}"`, `Adakah ini pengelakan cukai secara haram (penipuan cukai)? Terangkan. "${c[0].ms}"`), a: c[1] ? T('Yes: deliberately hiding income is illegal and can lead to investigation, penalties, fines and imprisonment; it also reduces public revenue and is dishonest.', 'Ya: sengaja menyembunyikan pendapatan adalah menyalahi undang-undang dan boleh membawa kepada siasatan, penalti, denda dan pemenjaraan; ia juga mengurangkan hasil awam dan tidak jujur.') : T('No: this is an honest error or lawful tax planning, not deliberate evasion.', 'Tidak: ini ialah kesilapan jujur atau perancangan cukai yang sah, bukan pengelakan yang disengajakan.'), sp: 's' };
    },
  ];
  SPM.addChapter(5, 4, T('Consumer Mathematics: Taxation', 'Matematik Pengguna: Percukaian'), [
    { id: '4.1', en: 'Taxation', ms: 'Percukaian', gen: { e: g41e, m: g41m, a: g41a } },
    { id: '4.1E', en: 'Consequences of tax evasion', ms: 'Akibat pengelakan cukai', scope: 'support', gen: { e: g4Ee, m: g4Ee, a: g4Ee } },
  ]);
})();
