/* Form 2 – Chapters 7 to 10 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, poly, lin, sum, gcd, Fr } = SPM;
  const S = SPM.svg;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const pt = (p) => `(${n(p[0])}, ${n(p[1])})`;
  const frT = Fr.tex;

  /* =============================================================== 7 */
  const quad = (x, y) => (x > 0 && y > 0 ? 1 : x < 0 && y > 0 ? 2 : x < 0 && y < 0 ? 3 : x > 0 && y < 0 ? 4 : 0);
  const g71e = [
    (r) => {
      const P = [r.int(1, 6), r.int(1, 6)], Q = [r.int(1, 6), r.int(1, 6)];
      need(P[0] !== Q[0] && P[1] !== Q[1]);
      const fig = S.plane({ x: [0, 7], y: [0, 7], scale: 26, pts: [{ x: P[0], y: P[1], l: 'A' }, { x: Q[0], y: Q[1], l: 'B' }] });
      return { q: T('Write down the coordinates of points $A$ and $B$.', 'Tuliskan koordinat titik $A$ dan titik $B$.'), fig, a: T(`$A = ${pt(P)}$, $B = ${pt(Q)}$`), sp: 's' };
    },
    (r) => {
      const P = [r.int(1, 6), r.int(1, 6)];
      return { q: T(`Plot the point $(${P[0]}, ${P[1]})$ on a Cartesian plane. State its $x$-coordinate and $y$-coordinate.`, `Plot titik $(${P[0]}, ${P[1]})$ pada satah Cartes. Nyatakan koordinat-$x$ dan koordinat-$y$ titik itu.`), fig: S.plane({ x: [0, 7], y: [0, 7], scale: 22 }), a: T(`$x$-coordinate ${P[0]}, $y$-coordinate ${P[1]}`, `Koordinat-$x$ ${P[0]}, koordinat-$y$ ${P[1]}`), sp: 'xs' };
    },
  ];
  const g71m = [
    (r) => {
      const P = [r.nz(-6, 6), r.nz(-6, 6)];
      return { q: T(`In which quadrant does the point $${pt(P)}$ lie?`, `Dalam sukuan manakah titik $${pt(P)}$ terletak?`), a: T(`Quadrant ${['', 'I', 'II', 'III', 'IV'][quad(...P)]}`, `Sukuan ${['', 'I', 'II', 'III', 'IV'][quad(...P)]}`), sp: 'xs' };
    },
    (r) => {
      const A = [r.nz(-5, 5), r.nz(-5, 5)], B = [r.nz(-5, 5), r.nz(-5, 5)];
      need(A[0] !== B[0] && A[1] !== B[1]);
      const fig = S.plane({ x: [-6, 6], y: [-6, 6], scale: 19, pts: [{ x: A[0], y: A[1], l: 'P' }, { x: B[0], y: B[1], l: 'Q' }] });
      return { q: T('Write down the coordinates of $P$ and $Q$ and state the quadrant of each.', 'Tuliskan koordinat $P$ dan $Q$ dan nyatakan sukuan bagi setiap satu.'), fig, a: T(`$P = ${pt(A)}$ (quadrant ${quad(...A)}); $Q = ${pt(B)}$ (quadrant ${quad(...B)})`, `$P = ${pt(A)}$ (sukuan ${quad(...A)}); $Q = ${pt(B)}$ (sukuan ${quad(...B)})`), sp: 's' };
    },
  ];
  const g71a = [
    (r) => {
      const a = r.nz(-5, 5), b = r.nz(-5, 5);
      const pts = [[a, 0], [0, b], [a, b], [0, 0]];
      const on = pts.map((p) => (p[0] === 0 && p[1] === 0 ? 'the origin' : p[0] === 0 ? 'on the $y$-axis' : p[1] === 0 ? 'on the $x$-axis' : `in quadrant ${quad(...p)}`));
      const onMs = pts.map((p) => (p[0] === 0 && p[1] === 0 ? 'asalan' : p[0] === 0 ? 'pada paksi-$y$' : p[1] === 0 ? 'pada paksi-$x$' : `dalam sukuan ${quad(...p)}`));
      return { q: T(`State whether each point is on an axis, at the origin, or in a quadrant: (a) $${pt(pts[0])}$ (b) $${pt(pts[1])}$ (c) $${pt(pts[2])}$ (d) $${pt(pts[3])}$`, `Nyatakan sama ada setiap titik berada pada paksi, pada asalan, atau dalam sukuan: (a) $${pt(pts[0])}$ (b) $${pt(pts[1])}$ (c) $${pt(pts[2])}$ (d) $${pt(pts[3])}$`), a: T(on.map((o, i) => `(${'abcd'[i]}) ${o}`).join('; '), onMs.map((o, i) => `(${'abcd'[i]}) ${o}`).join('; ')), sp: 's' };
    },
    (r) => {
      const m = r.pick([1, 2, -1, -2]), c = r.int(-3, 3);
      const xs = [-2, 0, 3];
      const P = xs.map((x) => [x, m * x + c]);
      const k = r.int(5, 8);
      return { q: T(`The points $${pt(P[0])}$, $${pt(P[1])}$, $${pt(P[2])}$ and $(${k}, q)$ lie on the same straight line. Find $q$.`, `Titik $${pt(P[0])}$, $${pt(P[1])}$, $${pt(P[2])}$ dan $(${k}, q)$ terletak pada garis lurus yang sama. Cari $q$.`), a: T(`$q = ${m * k + c}$`), w: T(`The line is $y = ${poly([[m, 'x'], [c, '']])}$`, `Garis itu ialah $y = ${poly([[m, 'x'], [c, '']])}$`), sp: 'm' };
    },
  ];
  const g72e = [
    (r) => {
      const A = [r.int(-5, 5), r.int(-5, 5)], d = r.int(2, 9);
      const horiz = r.chance();
      const B = horiz ? [A[0] + d, A[1]] : [A[0], A[1] + d];
      return { q: T(`Find the distance between $A=${pt(A)}$ and $B=${pt(B)}$.`, `Cari jarak antara $A=${pt(A)}$ dan $B=${pt(B)}$.`), a: T(`${d} units`, `${d} unit`), sp: 's' };
    },
  ];
  const g72m = [
    (r) => {
      const [a, b, c] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
      const A = [r.int(-5, 3), r.int(-5, 3)], B = [A[0] + a * r.pick([1, -1]), A[1] + b * r.pick([1, -1])];
      return { q: T(`Find the distance between $P = ${pt(A)}$ and $Q = ${pt(B)}$.`, `Cari jarak antara $P = ${pt(A)}$ dan $Q = ${pt(B)}$.`), a: T(`${c} units`, `${c} unit`), w: T(`$\\sqrt{(${a})^2 + (${b})^2}$`), sp: 's' };
    },
  ];
  const g72a = [
    (r) => {
      const A = [r.int(-4, 3), r.int(-4, 3)], B = [A[0] + r.int(2, 6) * r.pick([1, -1]), A[1] + r.int(2, 6) * r.pick([1, -1])];
      const d2 = (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2;
      need(!Number.isInteger(Math.sqrt(d2)));
      return { q: T(`Find the distance between $${pt(A)}$ and $${pt(B)}$, correct to 2 decimal places.`, `Cari jarak antara $${pt(A)}$ dan $${pt(B)}$, betul kepada 2 tempat perpuluhan.`), a: T(`${n(round(Math.sqrt(d2), 2))} units`, `${n(round(Math.sqrt(d2), 2))} unit`), w: T(`$\\sqrt{${d2}}$`), sp: 's' };
    },
    (r) => {
      const [k, m] = r.pick([[3, 4], [6, 8]]);
      const A = [r.int(-3, 0), r.int(-3, 0)], B = [A[0] + k, A[1]], C = [A[0], A[1] + m];
      const per = k + m + Math.hypot(k, m);
      const fig = S.plane({ x: [-5, 8], y: [-5, 8], scale: 17, polys: [{ p: [A, B, C] }], pts: [{ x: A[0], y: A[1], l: 'A' }, { x: B[0], y: B[1], l: 'B' }, { x: C[0], y: C[1], l: 'C' }] });
      return { q: T(`The vertices of a triangle are $A=${pt(A)}$, $B=${pt(B)}$ and $C=${pt(C)}$. Find the perimeter of triangle $ABC$.`, `Bucu-bucu sebuah segi tiga ialah $A=${pt(A)}$, $B=${pt(B)}$ dan $C=${pt(C)}$. Cari perimeter segi tiga $ABC$.`), fig, a: T(`${n(per)} units`, `${n(per)} unit`), w: T(`$AB = ${k}$, $AC = ${m}$, $BC = ${n(Math.hypot(k, m))}$`), sp: 'm' };
    },
  ];
  const g73e = [
    (r) => {
      const A = [r.int(1, 6) * 2, r.int(1, 6) * 2], B = [r.int(1, 6) * 2, r.int(1, 6) * 2];
      return { q: T(`Find the midpoint of $A=${pt(A)}$ and $B=${pt(B)}$.`, `Cari titik tengah bagi $A=${pt(A)}$ dan $B=${pt(B)}$.`), a: T(`$${pt([(A[0] + B[0]) / 2, (A[1] + B[1]) / 2])}$`), w: T(`$\\left(\\dfrac{x_1 + x_2}{2}, \\dfrac{y_1 + y_2}{2}\\right)$`), sp: 's' };
    },
  ];
  const g73m = [
    (r) => {
      const A = [r.nz(-7, 7), r.nz(-7, 7)], B = [r.nz(-7, 7), r.nz(-7, 7)];
      return { q: T(`Find the midpoint of $P = ${pt(A)}$ and $Q = ${pt(B)}$.`, `Cari titik tengah bagi $P = ${pt(A)}$ dan $Q = ${pt(B)}$.`), a: T(`$${pt([(A[0] + B[0]) / 2, (A[1] + B[1]) / 2])}$`), sp: 's' };
    },
  ];
  const g73a = [
    (r) => {
      const A = [r.nz(-6, 6), r.nz(-6, 6)], M = [r.int(-5, 5), r.int(-5, 5)];
      const B = [2 * M[0] - A[0], 2 * M[1] - A[1]];
      return { q: T(`$M = ${pt(M)}$ is the midpoint of $AB$ and $A = ${pt(A)}$. Find the coordinates of $B$.`, `$M = ${pt(M)}$ ialah titik tengah $AB$ dan $A = ${pt(A)}$. Cari koordinat $B$.`), a: T(`$B = ${pt(B)}$`), w: T(`$\\dfrac{${A[0]} + x}{2} = ${M[0]}$, $\\dfrac{${A[1]} + y}{2} = ${M[1]}$`), sp: 'm' };
    },
    (r) => {
      const A = [r.int(-4, 0), r.int(-4, 0)], B = [A[0] + 6, A[1] + 8];
      const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      return { q: T(`The diagonal $AC$ of a parallelogram has ends $A = ${pt(A)}$ and $C = ${pt(B)}$. Find the midpoint of $AC$, which is also the midpoint of the other diagonal, and the length of $AC$.`, `Pepenjuru $AC$ bagi sebuah segi empat selari mempunyai hujung $A = ${pt(A)}$ dan $C = ${pt(B)}$. Cari titik tengah $AC$, yang juga titik tengah pepenjuru yang lain, dan panjang $AC$.`), a: T(`Midpoint $${pt(M)}$; $AC = 10$ units`, `Titik tengah $${pt(M)}$; $AC = 10$ unit`), sp: 'm' };
    },
  ];
  SPM.addChapter(2, 7, T('Coordinates', 'Koordinat'), [
    { id: '7.1', en: 'Coordinates in the Cartesian plane', ms: 'Koordinat dalam satah Cartes', scope: 'support', gen: { e: g71e, m: g71m, a: g71a } },
    { id: '7.2', en: 'Distance between two points', ms: 'Jarak antara dua titik', gen: { e: g72e, m: g72m, a: g72a } },
    { id: '7.3', en: 'Midpoint', ms: 'Titik tengah', gen: { e: g73e, m: g73m, a: g73a } },
  ]);

  /* =============================================================== 8 */
  const g81e = [
    (r) => {
      const a = r.int(2, 6), x = r.int(1, 9);
      return { q: T(`A function is given by $f(x) = ${a}x$. Find $f(${x})$.`, `Suatu fungsi diberi oleh $f(x) = ${a}x$. Cari $f(${x})$.`), a: T(`$${a * x}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 5);
      const xs = [1, 2, 3];
      return { q: T(`Complete the table for the rule $y = ${a}x$.<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`, `Lengkapkan jadual bagi peraturan $y = ${a}x$.<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`), a: T(`$y = ${xs.map((x) => a * x).join(', ')}$`), sp: 's' };
    },
  ];
  const g81m = [
    (r) => {
      const a = r.int(2, 5), b = r.nz(-6, 6), x = r.nz(-4, 5);
      return { q: T(`Given $f(x) = ${lin(a, b)}$, find $f(${x})$ and $f(0)$.`, `Diberi $f(x) = ${lin(a, b)}$, cari $f(${x})$ dan $f(0)$.`), a: T(`$f(${x}) = ${a * x + b}$; $f(0) = ${b}$`), sp: 's' };
    },
    (r) => {
      const isF = r.chance();
      const xs = r.sample([1, 2, 3, 4, 5], 4).sort((a, b) => a - b);
      const ys = xs.map(() => r.int(1, 9));
      const pairs = xs.map((x, i) => [x, ys[i]]);
      if (!isF) pairs.push([xs[1], ys[1] + r.int(1, 3)]);
      const list = r.shuffle(pairs).map((p) => `(${p[0]}, ${p[1]})`).join(',\\ ');
      return { q: T(`Is the relation $\\{${list}\\}$, written as (input, output), a function? Give a reason.`, `Adakah hubungan $\\{${list}\\}$, ditulis sebagai (input, output), suatu fungsi? Berikan sebab.`), a: isF ? T('Yes: each input has exactly one output.', 'Ya: setiap input mempunyai tepat satu output.') : T(`No: the input ${xs[1]} has two different outputs.`, `Tidak: input ${xs[1]} mempunyai dua output yang berbeza.`), sp: 's' };
    },
  ];
  const g81a = [
    (r) => {
      const k = r.int(2, 9);
      return { q: T(`For $f(x) = x^2$, find all possible values of $x$ for which $f(x) = ${k * k}$. Is $f$ one-to-one on the domain of all real numbers? Explain.`, `Bagi $f(x) = x^2$, cari semua nilai $x$ yang mungkin supaya $f(x) = ${k * k}$. Adakah $f$ satu dengan satu pada domain semua nombor nyata? Terangkan.`), a: T(`$x = ${k}$ or $x = -${k}$. No: two different inputs give the same output.`, `$x = ${k}$ atau $x = -${k}$. Tidak: dua input berbeza memberikan output yang sama.`), sp: 'm' };
    },
    (r) => {
      const k = r.int(2, 5);
      return { q: T(`Is $f(x) = x^2$ one-to-one when its domain is $\\{x : x \\ge 0\\}$? Compare with the domain of all real numbers.`, `Adakah $f(x) = x^2$ satu dengan satu apabila domainnya $\\{x : x \\ge 0\\}$? Bandingkan dengan domain semua nombor nyata.`), a: T('Yes, on $x \\ge 0$ each output comes from exactly one input; on all real numbers it is not, since $f(-k) = f(k)$.', 'Ya, pada $x \\ge 0$ setiap output datang daripada tepat satu input; pada semua nombor nyata ia tidak, kerana $f(-k) = f(k)$.'), sp: 'm' };
    },
  ];
  const curveTable = (a, nn, xs) => xs.map((x) => (x === 0 && nn < 0 ? null : a * Math.pow(x, nn)));
  const blank = () => S.plane({ x: [-4, 4], y: [-8, 8], scale: 17, labelStep: 2 });
  const g82e = [
    (r) => {
      const a = r.pick([1, 2]), nn = r.pick([1, 2]);
      const xs = [-2, -1, 0, 1, 2];
      const ys = curveTable(a, nn, xs);
      return { q: T(`Complete the table of values for $y = ${a === 1 ? '' : a}x${nn === 2 ? '^2' : ''}$, then plot the points and draw the graph.<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`, `Lengkapkan jadual nilai bagi $y = ${a === 1 ? '' : a}x${nn === 2 ? '^2' : ''}$, kemudian plot titik dan lukis grafnya.<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`), fig: blank(), a: T(`$y = ${ys.join(', ')}$`), sp: 'xs' };
    },
  ];
  const g82m = [
    (r) => {
      const a = r.pick([1, 2, -1, -2]), nn = 3;
      const xs = [-2, -1, 0, 1, 2];
      return { q: T(`Complete the table for $y = ${a === 1 ? '' : a === -1 ? '-' : a}x^3$ and state the value of $y$ when $x = -1.5$ using the graph (or by calculation).<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`, `Lengkapkan jadual bagi $y = ${a === 1 ? '' : a === -1 ? '-' : a}x^3$ dan nyatakan nilai $y$ apabila $x = -1.5$ menggunakan graf (atau melalui pengiraan).<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`), a: T(`$y = ${xs.map((x) => a * x ** 3).join(', ')}$; at $x = -1.5$, $y = ${n(a * -3.375)}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([2, 4, 6]);
      const xs = [-4, -2, -1, 1, 2, 4];
      const fig = S.plane({ x: [-5, 5], y: [-6, 6], scale: 18, curves: [{ f: (x) => k / x, from: -5, to: -0.3 }, { f: (x) => k / x, from: 0.3, to: 5 }] });
      return { q: T(`The graph shows $y = \\dfrac{${k}}{x}$. Complete the table for the values shown below, and explain why $x = 0$ is not included.<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`, `Graf menunjukkan $y = \\dfrac{${k}}{x}$. Lengkapkan jadual bagi nilai yang ditunjukkan di bawah, dan terangkan mengapa $x = 0$ tidak disertakan.<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`), fig, a: T(`$y = ${xs.map((x) => n(round(k / x, 2))).join(', ')}$. $\\dfrac{${k}}{0}$ is not defined.`, `$y = ${xs.map((x) => n(round(k / x, 2))).join(', ')}$. $\\dfrac{${k}}{0}$ tidak ditakrifkan.`), sp: 's' };
    },
  ];
  const g82a = [
    (r) => {
      const k = r.pick([2, 3, 4, 8]);
      return { q: T(`For $y = \\dfrac{${k}}{x}$, complete: when $x = 1$, $y = \\square$; when $x = 0.1$, $y = \\square$; when $x = 0.01$, $y = \\square$. What happens to $y$ as $x$ gets closer to 0 from the positive side?`, `Bagi $y = \\dfrac{${k}}{x}$, lengkapkan: apabila $x = 1$, $y = \\square$; apabila $x = 0.1$, $y = \\square$; apabila $x = 0.01$, $y = \\square$. Apakah yang berlaku kepada $y$ apabila $x$ menghampiri 0 dari sebelah positif?`), a: T(`$${k},\\ ${n(k * 10)},\\ ${n(k * 100)}$. $y$ becomes larger and larger.`, `$${k},\\ ${n(k * 10)},\\ ${n(k * 100)}$. $y$ menjadi semakin besar.`), sp: 's' };
    },
    (r) => {
      const a = r.pick([1, 2]);
      const fig = S.plane({ x: [-4, 4], y: [-8, 8], scale: 16, curves: [{ f: (x) => a * x * x }, { f: (x) => -a * x * x, dash: true }] });
      return { q: T(`The graph shows $y = ${a === 1 ? '' : a}x^2$ (solid) and $y = -${a === 1 ? '' : a}x^2$ (dashed). Describe two ways in which the graphs are similar and one way in which they differ.`, `Graf menunjukkan $y = ${a === 1 ? '' : a}x^2$ (penuh) dan $y = -${a === 1 ? '' : a}x^2$ (putus-putus). Huraikan dua persamaan graf-graf itu dan satu perbezaannya.`), fig, a: T('Both pass through the origin and are symmetrical about the $y$-axis. One opens upwards (values $\\ge 0$) and the other downwards (values $\\le 0$).', 'Kedua-duanya melalui asalan dan simetri pada paksi-$y$. Satu terbuka ke atas (nilai $\\ge 0$) dan satu lagi ke bawah (nilai $\\le 0$).'), sp: 'm' };
    },
  ];
  const lifeGraph = (vals, lang, ylab) => S.graph({ w: 330, h: 210, xr: [0, vals.length - 1, 1], yr: [0, Math.ceil(Math.max(...vals) / 5) * 5 + 5, 5], xlabel: lang === 'en' ? 'Time (hours)' : 'Masa (jam)', ylabel: ylab, series: [{ pts: vals.map((v, i) => [i, v]), type: 'line', dotsToo: true }] });
  const g83e = [
    (r) => {
      const vals = [r.int(2, 8)];
      for (let i = 1; i < 7; i++) vals.push(vals[i - 1] + r.int(1, 4));
      const fig = T(lifeGraph(vals, 'en', 'Height of water (cm)'), lifeGraph(vals, 'ms', 'Tinggi air (cm)'));
      return { q: T('The graph shows the height of water in a tank over time. (a) What is the height at 3 hours? (b) Is the height increasing, decreasing or constant?', 'Graf menunjukkan tinggi air dalam sebuah tangki mengikut masa. (a) Berapakah tinggi pada jam ke-3? (b) Adakah tinggi itu bertambah, berkurang atau malar?'), fig, a: T(`(a) ${vals[3]} cm (b) Increasing`, `(a) ${vals[3]} cm (b) Bertambah`), sp: 's' };
    },
  ];
  const g83m = [
    (r) => {
      const vals = [r.int(2, 8)];
      for (let i = 1; i < 7; i++) vals.push(vals[i - 1] + r.pick([1, 2, 5, 6]));
      const fig = T(lifeGraph(vals, 'en', 'Height of water (cm)'), lifeGraph(vals, 'ms', 'Tinggi air (cm)'));
      const k = r.int(1, 5) + 0.5;
      const est = (vals[Math.floor(k)] + vals[Math.ceil(k)]) / 2;
      return { q: T(`The graph shows the height of water in a tank over time. Estimate the height at ${n(k)} hours (interpolate) and state in which hour the water level rose fastest.`, `Graf menunjukkan tinggi air dalam sebuah tangki mengikut masa. Anggarkan tinggi pada jam ${n(k)} (interpolasi) dan nyatakan dalam jam yang manakah paras air naik paling cepat.`), fig, a: (() => { let bi = 0; for (let i = 0; i < 6; i++) if (vals[i + 1] - vals[i] > vals[bi + 1] - vals[bi]) bi = i; return T(`About ${n(est)} cm; fastest between hour ${bi} and hour ${bi + 1}`, `Kira-kira ${n(est)} cm; paling cepat antara jam ${bi} dan jam ${bi + 1}`); })(), sp: 's' };
    },
  ];
  const g83a = [
    (r) => {
      const vals = [r.int(2, 8)];
      for (let i = 1; i < 7; i++) vals.push(vals[i - 1] + r.int(2, 4));
      const fig = T(lifeGraph(vals, 'en', 'Height of water (cm)'), lifeGraph(vals, 'ms', 'Tinggi air (cm)'));
      const d = vals[6] - vals[0];
      return { q: T('The graph shows the height of water in a tank for the first 6 hours. Predict the height at 9 hours by extending the trend. State one reason why this prediction may not be reliable.', 'Graf menunjukkan tinggi air dalam sebuah tangki bagi 6 jam pertama. Ramalkan tinggi pada jam ke-9 dengan menyambung aliran itu. Nyatakan satu sebab mengapa ramalan ini mungkin tidak boleh dipercayai.'), fig, a: T(`About ${n(round(vals[6] + (d / 6) * 3, 1))} cm. The tank may become full, or the rate of filling may change.`, `Kira-kira ${n(round(vals[6] + (d / 6) * 3, 1))} cm. Tangki mungkin penuh, atau kadar pengisian mungkin berubah.`), sp: 'm' };
    },
  ];
  SPM.addChapter(2, 8, T('Graphs of Functions', 'Graf Fungsi'), [
    { id: '8.1', en: 'Functions', ms: 'Fungsi', gen: { e: g81e, m: g81m, a: g81a } },
    { id: '8.2', en: 'Graphs of functions', ms: 'Graf fungsi', gen: { e: g82e, m: g82m, a: g82a } },
    { id: '8.3', en: 'Interpreting and using graphs', ms: 'Mentafsir dan menggunakan graf', gen: { e: g83e, m: g83m, a: g83a } },
  ]);

  /* =============================================================== 9 */
  const hm = (t) => { const h = Math.floor(t), m = Math.round((t - h) * 60); return h ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`; };
  const hmMs = (t) => { const h = Math.floor(t), m = Math.round((t - h) * 60); return h ? (m ? `${h} j ${m} min` : `${h} j`) : `${m} min`; };
  const g91e = [
    (r) => {
      const v = r.int(3, 12) * 10, t = r.int(2, 5);
      return { q: T(`A car travels ${v * t} km in ${t} hours. Find its speed in km/h.`, `Sebuah kereta bergerak sejauh ${v * t} km dalam ${t} jam. Cari lajunya dalam km/j.`), a: T(`${v} km/h`, `${v} km/j`), sp: 'xs' };
    },
    (r) => {
      const v = r.int(4, 12) * 10, t = r.int(2, 5);
      return { q: T(`A train travels at ${v} km/h for ${t} hours. Find the distance travelled.`, `Sebuah kereta api bergerak pada ${v} km/j selama ${t} jam. Cari jarak yang dilalui.`), a: T(`${v * t} km`), sp: 'xs' };
    },
  ];
  const g91m = [
    (r) => {
      const v = r.pick([60, 80, 90, 72]), h = r.int(1, 3), m = r.pick([15, 30, 45]);
      const t = h + m / 60;
      return { q: T(`A bus travels at ${v} km/h for ${hm(t)}. Find the distance travelled.`, `Sebuah bas bergerak pada ${v} km/j selama ${hmMs(t)}. Cari jarak yang dilalui.`), a: T(`${n(v * t)} km`), sp: 's' };
    },
    (r) => {
      const v = r.pick([36, 54, 72, 90, 108]);
      return { q: T(`Convert ${v} km/h to m/s.`, `Tukarkan ${v} km/j kepada m/s.`), a: T(`${n(v / 3.6)} m/s`), w: T(`$${v} \\times \\dfrac{1000}{3600}$`), sp: 's' };
    },
    (r) => {
      const v = r.pick([60, 80, 40, 50]), d = v * r.int(2, 4) + v / 2;
      const start = r.pick([7, 8, 9]);
      const t = d / v;
      const end = start * 60 + Math.round(t * 60);
      const fmt = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      return { q: T(`Aiman leaves at ${fmt(start * 60)} for a town ${d} km away and drives at ${v} km/h. At what time does he arrive?`, `Aiman bertolak pada pukul ${fmt(start * 60)} ke sebuah bandar sejauh ${d} km dan memandu pada ${v} km/j. Pukul berapakah dia tiba?`), a: T(`${fmt(end)}`), w: T(`Time $= ${d} \\div ${v}$ = ${hm(t)}`, `Masa $= ${d} \\div ${v}$ = ${hmMs(t)}`), sp: 's' };
    },
  ];
  const g91a = [
    (r) => {
      const d = r.pick([60, 120]), v1 = r.pick([40, 30, 20]), v2 = r.pick([60, 80, 120]);
      need(v1 !== v2);
      const avg = (2 * d) / (d / v1 + d / v2);
      return { q: T(`A car travels ${d} km at ${v1} km/h and then another ${d} km at ${v2} km/h. Find the average speed for the whole journey.`, `Sebuah kereta bergerak sejauh ${d} km pada ${v1} km/j dan kemudian ${d} km lagi pada ${v2} km/j. Cari purata laju bagi keseluruhan perjalanan.`), a: T(`${n(round(avg, 2))} km/h (not ${(v1 + v2) / 2})`, `${n(round(avg, 2))} km/j (bukan ${(v1 + v2) / 2})`), w: T(`Total distance $${2 * d}$ km $\\div$ total time`, `Jumlah jarak $${2 * d}$ km $\\div$ jumlah masa`), sp: 'm' };
    },
    (r) => {
      const d1 = r.pick([90, 120, 150]), v1 = r.pick([60, 90, 75]), rest = r.pick([20, 30, 45]), d2 = r.pick([60, 100, 120]), v2 = r.pick([80, 100, 60]);
      const t = d1 / v1 + rest / 60 + d2 / v2;
      const avg = (d1 + d2) / t;
      return { q: T(`A lorry travels ${d1} km at ${v1} km/h, rests for ${rest} minutes, then travels ${d2} km at ${v2} km/h. Find (a) the total time taken, (b) the average speed for the whole journey (including the rest), correct to 1 decimal place.`, `Sebuah lori bergerak sejauh ${d1} km pada ${v1} km/j, berehat selama ${rest} minit, kemudian bergerak ${d2} km pada ${v2} km/j. Cari (a) jumlah masa yang diambil, (b) purata laju bagi keseluruhan perjalanan (termasuk rehat), betul kepada 1 tempat perpuluhan.`), a: T(`(a) ${n(round(t, 3))} h (b) ${n(round(avg, 1))} km/h`, `(a) ${n(round(t, 3))} j (b) ${n(round(avg, 1))} km/j`), sp: 'l' };
    },
  ];
  const g91Ee = [
    (r) => {
      const v1 = r.pick([60, 70, 80]), v2 = v1 + r.pick([20, 30, 40]), head = r.pick([1, 2]);
      const gap = v1 * head;
      const t = gap / (v2 - v1);
      return { q: T(`Car $P$ leaves town $A$ at ${v1} km/h. ${head} hour${head > 1 ? 's' : ''} later, car $Q$ leaves from the same place along the same road at ${v2} km/h. After how many hours from $Q$'s departure does $Q$ catch up with $P$?`, `Kereta $P$ bertolak dari bandar $A$ pada ${v1} km/j. ${head} jam kemudian, kereta $Q$ bertolak dari tempat yang sama di jalan yang sama pada ${v2} km/j. Selepas berapa jam dari waktu $Q$ bertolak, $Q$ memintas $P$?`), a: T(`${n(round(t, 2))} hours`, `${n(round(t, 2))} jam`), w: T(`Gap ${gap} km; closing speed ${v2 - v1} km/h`), sp: 'm' };
    },
  ];
  const g92e = [
    (r) => {
      const t = r.int(2, 8), a = r.int(2, 6);
      return { q: T(`A car starts from rest and reaches ${a * t} m/s after ${t} seconds. Find its acceleration.`, `Sebuah kereta bermula dari keadaan pegun dan mencapai ${a * t} m/s selepas ${t} saat. Cari pecutannya.`), a: T(`${a} m/s²`), sp: 's' };
    },
  ];
  const g92m = [
    (r) => {
      const u = r.int(2, 12), a = r.int(2, 5), t = r.int(2, 8);
      return { q: T(`A cyclist increases speed from ${u} m/s to ${u + a * t} m/s in ${t} seconds. Find the acceleration.`, `Seorang penunggang basikal meningkatkan laju daripada ${u} m/s kepada ${u + a * t} m/s dalam ${t} saat. Cari pecutannya.`), a: T(`${a} m/s²`), sp: 's' };
    },
    (r) => {
      const u = r.int(8, 30), t = r.int(2, 8);
      return { q: T(`A train travelling at ${u * t} m/s brakes uniformly and stops in ${t} seconds. Find its deceleration.`, `Sebuah kereta api yang bergerak pada ${u * t} m/s memberhentikan diri dengan brek secara seragam dalam ${t} saat. Cari nyahpecutannya.`), a: T(`Acceleration $= ${-u}$ m/s² (deceleration ${u} m/s²)`, `Pecutan $= ${-u}$ m/s² (nyahpecutan ${u} m/s²)`), sp: 's' };
    },
  ];
  const g92a = [
    (r) => {
      const a1 = r.int(2, 4), t1 = r.int(3, 6), t2 = r.int(2, 5);
      const v = a1 * t1;
      const a2 = round(v / t2, 2);
      return { q: T(`A car accelerates from rest at ${a1} m/s² for ${t1} seconds and then brakes to a stop in ${t2} seconds. Find (a) its maximum speed, (b) its deceleration.`, `Sebuah kereta memecut dari keadaan pegun pada ${a1} m/s² selama ${t1} saat dan kemudian memberhentikan diri dalam ${t2} saat. Cari (a) laju maksimumnya, (b) nyahpecutannya.`), a: T(`(a) ${v} m/s (b) ${n(a2)} m/s²`), sp: 'm' };
    },
    (r) => {
      const u = r.pick([36, 54, 72]), t = r.int(4, 10), v = u + r.pick([18, 36]);
      const a = round((v - u) / 3.6 / t, 3);
      return { q: T(`A car increases its speed from ${u} km/h to ${v} km/h in ${t} seconds. Find the acceleration in m/s².`, `Sebuah kereta meningkatkan lajunya daripada ${u} km/j kepada ${v} km/j dalam ${t} saat. Cari pecutan dalam m/s².`), a: T(`${n(a)} m/s²`), w: T(`Convert first: ${u} km/h $= ${n(u / 3.6)}$ m/s, ${v} km/h $= ${n(v / 3.6)}$ m/s`, `Tukar dahulu: ${u} km/j $= ${n(u / 3.6)}$ m/s, ${v} km/j $= ${n(v / 3.6)}$ m/s`), sp: 'm' };
    },
  ];
  SPM.addChapter(2, 9, T('Speed and Acceleration', 'Laju dan Pecutan'), [
    { id: '9.1', en: 'Speed', ms: 'Laju', gen: { e: g91e, m: g91m, a: g91a } },
    { id: '9.1E', en: 'Catch-up and relative speed', ms: 'Memintas dan laju relatif', scope: 'enrichment', gen: { e: g91Ee, m: g91Ee, a: g91Ee } },
    { id: '9.2', en: 'Acceleration', ms: 'Pecutan', gen: { e: g92e, m: g92m, a: g92a } },
  ]);

  /* ============================================================== 10 */
  const gradFig = (A, B, lab) => S.plane({ x: [-6, 6], y: [-6, 6], scale: 18, segs: [{ a: A, b: B }], lines: [{ m: (B[1] - A[1]) / (B[0] - A[0]), c: A[1] - ((B[1] - A[1]) / (B[0] - A[0])) * A[0] }], pts: [{ x: A[0], y: A[1], l: lab ? 'A' : '' }, { x: B[0], y: B[1], l: lab ? 'B' : '' }] });
  const mfr = (dy, dx) => frT(Fr.make(dy, dx));
  const g101e = [
    (r) => {
      const rise = r.int(1, 5), run = r.int(1, 6);
      return { q: T(`A ramp rises ${rise} m over a horizontal distance of ${run} m. Find its gradient.`, `Sebuah tanjakan menaik ${rise} m sepanjang jarak mengufuk ${run} m. Cari kecerunannya.`), a: T(`$${mfr(rise, run)}$`), w: T(`$\\dfrac{\\text{vertical change}}{\\text{horizontal change}}$`, `$\\dfrac{\\text{perubahan mencancang}}{\\text{perubahan mengufuk}}$`), sp: 's' };
    },
    (r) => {
      const A = [r.int(-3, 1), r.int(-3, 1)], dx = r.int(1, 4), dy = r.int(1, 4);
      const B = [A[0] + dx, A[1] + dy];
      return { q: T('Find the gradient of the line segment $AB$ shown.', 'Cari kecerunan tembereng garis $AB$ yang ditunjukkan.'), fig: gradFig(A, B, true), a: T(`$${mfr(dy, dx)}$`), sp: 's' };
    },
  ];
  const g101m = [
    (r) => {
      const A = [r.nz(-5, 5), r.nz(-5, 5)], B = [r.nz(-5, 5), r.nz(-5, 5)];
      need(A[0] !== B[0] && A[1] !== B[1]);
      return { q: T(`Find the gradient of the line through $P = ${pt(A)}$ and $Q = ${pt(B)}$.`, `Cari kecerunan garis yang melalui $P = ${pt(A)}$ dan $Q = ${pt(B)}$.`), a: T(`$${mfr(B[1] - A[1], B[0] - A[0])}$`), w: T(`$\\dfrac{${B[1]} - ${SPM.par(A[1])}}{${B[0]} - ${SPM.par(A[0])}}$`), sp: 's' };
    },
    (r) => {
      const A = [r.int(-4, 0), r.int(1, 4)], dx = r.int(1, 4), dy = r.int(1, 4);
      const B = [A[0] + dx, A[1] - dy];
      return { q: T('Find the gradient of the line shown and state whether it is positive or negative.', 'Cari kecerunan garis yang ditunjukkan dan nyatakan sama ada ia positif atau negatif.'), fig: gradFig(A, B, true), a: T(`$${mfr(-dy, dx)}$, negative`, `$${mfr(-dy, dx)}$, negatif`), sp: 's' };
    },
  ];
  const g101a = [
    (r) => {
      const m = r.pick([2, -2, 3, -1, 1]), A = [r.int(-3, 2), r.int(-3, 2)];
      const k = r.int(2, 5);
      const B = [A[0] + 1, A[1] + m], C = [A[0] + k, A[1] + m * k];
      return { q: T(`The points $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C)}$ lie on a straight line. Show that the gradient of $AB$ equals the gradient of $AC$ and explain why this is expected.`, `Titik $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C)}$ terletak pada satu garis lurus. Tunjukkan bahawa kecerunan $AB$ sama dengan kecerunan $AC$ dan terangkan mengapa ini dijangkakan.`), a: T(`Both gradients are $${m}$. On one straight line, rise ÷ run is the same for any pair of points.`, `Kedua-dua kecerunan ialah $${m}$. Pada satu garis lurus, kenaikan ÷ larian adalah sama bagi mana-mana pasangan titik.`), sp: 'm' };
    },
    (r) => {
      const m = r.pick([2, 3, -2, -3, 1, -1]), A = [r.int(-3, 3), r.int(-3, 3)], x2 = A[0] + r.int(2, 4);
      return { q: T(`The line through $A = ${pt(A)}$ and $B = (${x2}, k)$ has gradient $${m}$. Find $k$.`, `Garis yang melalui $A = ${pt(A)}$ dan $B = (${x2}, k)$ mempunyai kecerunan $${m}$. Cari $k$.`), a: T(`$k = ${A[1] + m * (x2 - A[0])}$`), sp: 'm' };
    },
    (r) => {
      const A = [r.int(-3, 3), r.int(-3, 3)];
      const vert = r.chance();
      const B = vert ? [A[0], A[1] + r.int(2, 5)] : [A[0] + r.int(2, 5), A[1]];
      return { q: T(`Find the gradient of the line through $${pt(A)}$ and $${pt(B)}$. Describe the line.`, `Cari kecerunan garis yang melalui $${pt(A)}$ dan $${pt(B)}$. Huraikan garis itu.`), a: vert ? T('The gradient is not defined (division by zero): a vertical line.', 'Kecerunan tidak ditakrifkan (pembahagian dengan sifar): garis mencancang.') : T('The gradient is $0$: a horizontal line.', 'Kecerunan ialah $0$: garis mengufuk.'), sp: 's' };
    },
  ];
  SPM.addChapter(2, 10, T('Gradient of a Straight Line', 'Kecerunan Garis Lurus'), [
    { id: '10.1', en: 'Gradient', ms: 'Kecerunan', gen: { e: g101e, m: g101m, a: g101a } },
  ]);
})();
