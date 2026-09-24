/* Form 2 – Chapters 7 to 10 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, poly, lin, sum, gcd, Fr, par } = SPM;
  const S = SPM.svg;
  const T = SPM.L, W = SPM.lines;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const pt = (p) => `(${n(p[0])}, ${n(p[1])})`;
  const frT = Fr.tex;
  /* ---- shared working helpers ---- */
  const pn = (v) => (v > 0 ? T('positive', 'positif') : T('negative', 'negatif'));
  /** substituted linear expression, e.g. subLin(2, -3, 5) -> "2(5) - 3" */
  const subLin = (m, c, x) => {
    const xt = `(${n(x)})`;
    const mt = m === 1 ? n(x) : m === -1 ? `-${xt}` : `${n(m)}${xt}`;
    return `${mt}${c === 0 ? '' : c > 0 ? ` + ${n(c)}` : ` - ${n(-c)}`}`;
  };
  const midLine = (A, B) => `\\left(\\dfrac{${n(A[0])} + ${par(B[0])}}{2},\\ \\dfrac{${n(A[1])} + ${par(B[1])}}{2}\\right)`;
  const apx = (v, dp) => (Math.abs(round(v, dp) - v) < 1e-12 ? '=' : '\\approx');
  const distLine = (dx, dy) => `\\sqrt{(${n(dx)})^2 + (${n(dy)})^2} = \\sqrt{${dx * dx} + ${dy * dy}}`;

  /* =============================================================== 7 */
  const quad = (x, y) => (x > 0 && y > 0 ? 1 : x < 0 && y > 0 ? 2 : x < 0 && y < 0 ? 3 : x > 0 && y < 0 ? 4 : 0);
  const g71e = [
    (r) => {
      const P = [r.int(1, 6), r.int(1, 6)], Q = [r.int(1, 6), r.int(1, 6)];
      need(P[0] !== Q[0] && P[1] !== Q[1]);
      const fig = S.plane({ x: [0, 7], y: [0, 7], scale: 26, pts: [{ x: P[0], y: P[1], l: 'A' }, { x: Q[0], y: Q[1], l: 'B' }] });
      return { q: T('Write down the coordinates of points $A$ and $B$.', 'Tuliskan koordinat titik $A$ dan titik $B$.'), fig, a: T(`$A = ${pt(P)}$, $B = ${pt(Q)}$`), w: W(T('Read the $x$-coordinate first (across), then the $y$-coordinate (up).', 'Baca koordinat-$x$ dahulu (mengufuk), kemudian koordinat-$y$ (mencancang).'), T(`$A$: ${P[0]} across, ${P[1]} up $= ${pt(P)}$`, `$A$: ${P[0]} ke kanan, ${P[1]} ke atas $= ${pt(P)}$`), T(`$B$: ${Q[0]} across, ${Q[1]} up $= ${pt(Q)}$`, `$B$: ${Q[0]} ke kanan, ${Q[1]} ke atas $= ${pt(Q)}$`)), sp: 's' };
    },
    (r) => {
      const P = [r.int(1, 6), r.int(1, 6)];
      return { q: T(`Plot the point $(${P[0]}, ${P[1]})$ on a Cartesian plane. State its $x$-coordinate and $y$-coordinate.`, `Plot titik $(${P[0]}, ${P[1]})$ pada satah Cartes. Nyatakan koordinat-$x$ dan koordinat-$y$ titik itu.`), fig: S.plane({ x: [0, 7], y: [0, 7], scale: 22 }), a: T(`$x$-coordinate ${P[0]}, $y$-coordinate ${P[1]}`, `Koordinat-$x$ ${P[0]}, koordinat-$y$ ${P[1]}`), w: W(T('In $(x, y)$ the first number is the $x$-coordinate and the second is the $y$-coordinate.', 'Dalam $(x, y)$, nombor pertama ialah koordinat-$x$ dan nombor kedua ialah koordinat-$y$.'), T(`From the origin: ${P[0]} unit${P[0] > 1 ? 's' : ''} to the right, then ${P[1]} unit${P[1] > 1 ? 's' : ''} up.`, `Dari asalan: ${P[0]} unit ke kanan, kemudian ${P[1]} unit ke atas.`), T(`$x$-coordinate ${P[0]}, $y$-coordinate ${P[1]}`, `Koordinat-$x$ ${P[0]}, koordinat-$y$ ${P[1]}`)), sp: 'xs' };
    },
  ];
  const g71m = [
    (r) => {
      const P = [r.nz(-6, 6), r.nz(-6, 6)];
      return { q: T(`In which quadrant does the point $${pt(P)}$ lie?`, `Dalam sukuan manakah titik $${pt(P)}$ terletak?`), a: T(`Quadrant ${['', 'I', 'II', 'III', 'IV'][quad(...P)]}`, `Sukuan ${['', 'I', 'II', 'III', 'IV'][quad(...P)]}`), w: W(T(`Signs: $x = ${n(P[0])}$ is ${pn(P[0]).en}, $y = ${n(P[1])}$ is ${pn(P[1]).en}.`, `Tanda: $x = ${n(P[0])}$ ialah ${pn(P[0]).ms}, $y = ${n(P[1])}$ ialah ${pn(P[1]).ms}.`), T('Quadrants I, II, III, IV have signs $(+, +)$, $(-, +)$, $(-, -)$, $(+, -)$.', 'Sukuan I, II, III, IV mempunyai tanda $(+, +)$, $(-, +)$, $(-, -)$, $(+, -)$.'), T(`Quadrant ${['', 'I', 'II', 'III', 'IV'][quad(...P)]}`, `Sukuan ${['', 'I', 'II', 'III', 'IV'][quad(...P)]}`)), sp: 'xs' };
    },
    (r) => {
      const A = [r.nz(-5, 5), r.nz(-5, 5)], B = [r.nz(-5, 5), r.nz(-5, 5)];
      need(A[0] !== B[0] && A[1] !== B[1]);
      const fig = S.plane({ x: [-6, 6], y: [-6, 6], scale: 19, pts: [{ x: A[0], y: A[1], l: 'P' }, { x: B[0], y: B[1], l: 'Q' }] });
      const qd = (lab, p) => T(`$${lab} = ${pt(p)}$: $x$ ${pn(p[0]).en}, $y$ ${pn(p[1]).en}, so quadrant ${quad(...p)}`, `$${lab} = ${pt(p)}$: $x$ ${pn(p[0]).ms}, $y$ ${pn(p[1]).ms}, maka sukuan ${quad(...p)}`);
      return { q: T('Write down the coordinates of $P$ and $Q$ and state the quadrant of each.', 'Tuliskan koordinat $P$ dan $Q$ dan nyatakan sukuan bagi setiap satu.'), fig, a: T(`$P = ${pt(A)}$ (quadrant ${quad(...A)}); $Q = ${pt(B)}$ (quadrant ${quad(...B)})`, `$P = ${pt(A)}$ (sukuan ${quad(...A)}); $Q = ${pt(B)}$ (sukuan ${quad(...B)})`), w: W(T('Read each point as (across, up); the pair of signs fixes the quadrant.', 'Baca setiap titik sebagai (mengufuk, mencancang); pasangan tanda menentukan sukuan.'), qd('P', A), qd('Q', B)), sp: 's' };
    },
  ];
  const g71a = [
    (r) => {
      const a = r.nz(-5, 5), b = r.nz(-5, 5);
      const pts = [[a, 0], [0, b], [a, b], [0, 0]];
      const on = pts.map((p) => (p[0] === 0 && p[1] === 0 ? 'the origin' : p[0] === 0 ? 'on the $y$-axis' : p[1] === 0 ? 'on the $x$-axis' : `in quadrant ${quad(...p)}`));
      const onMs = pts.map((p) => (p[0] === 0 && p[1] === 0 ? 'asalan' : p[0] === 0 ? 'pada paksi-$y$' : p[1] === 0 ? 'pada paksi-$x$' : `dalam sukuan ${quad(...p)}`));
      const rw = pts.map((p, i) => {
        const lab = `(${'abcd'[i]}) $${pt(p)}$: `;
        if (p[0] === 0 && p[1] === 0) return T(`${lab}both coordinates are $0$, so it is ${on[i]}`, `${lab}kedua-dua koordinat ialah $0$, jadi ia ${onMs[i]}`);
        if (p[0] === 0) return T(`${lab}$x = 0$, so it is ${on[i]}`, `${lab}$x = 0$, jadi ia ${onMs[i]}`);
        if (p[1] === 0) return T(`${lab}$y = 0$, so it is ${on[i]}`, `${lab}$y = 0$, jadi ia ${onMs[i]}`);
        return T(`${lab}$x$ ${pn(p[0]).en}, $y$ ${pn(p[1]).en}, so it is ${on[i]}`, `${lab}$x$ ${pn(p[0]).ms}, $y$ ${pn(p[1]).ms}, jadi ia ${onMs[i]}`);
      });
      return { q: T(`State whether each point is on an axis, at the origin, or in a quadrant: (a) $${pt(pts[0])}$ (b) $${pt(pts[1])}$ (c) $${pt(pts[2])}$ (d) $${pt(pts[3])}$`, `Nyatakan sama ada setiap titik berada pada paksi, pada asalan, atau dalam sukuan: (a) $${pt(pts[0])}$ (b) $${pt(pts[1])}$ (c) $${pt(pts[2])}$ (d) $${pt(pts[3])}$`), a: T(on.map((o, i) => `(${'abcd'[i]}) ${o}`).join('; '), onMs.map((o, i) => `(${'abcd'[i]}) ${o}`).join('; ')), w: W(T('A point lies on the $x$-axis when $y = 0$, on the $y$-axis when $x = 0$, and at the origin when both are $0$; otherwise the two signs give the quadrant.', 'Titik terletak pada paksi-$x$ apabila $y = 0$, pada paksi-$y$ apabila $x = 0$, dan pada asalan apabila kedua-duanya $0$; jika tidak, dua tanda itu memberikan sukuan.'), ...rw), sp: 's' };
    },
    (r) => {
      const m = r.pick([1, 2, -1, -2]), c = r.int(-3, 3);
      const xs = [-2, 0, 3];
      const P = xs.map((x) => [x, m * x + c]);
      const k = r.int(5, 8);
      return { q: T(`The points $${pt(P[0])}$, $${pt(P[1])}$, $${pt(P[2])}$ and $(${k}, q)$ lie on the same straight line. Find $q$.`, `Titik $${pt(P[0])}$, $${pt(P[1])}$, $${pt(P[2])}$ dan $(${k}, q)$ terletak pada garis lurus yang sama. Cari $q$.`), a: T(`$q = ${m * k + c}$`), w: W(T(`From $${pt(P[1])}$ to $${pt(P[2])}$: $x$ increases by $3$ and $y$ changes by $${n(3 * m)}$, so a step of $1$ in $x$ changes $y$ by $${n(m)}$.`, `Dari $${pt(P[1])}$ ke $${pt(P[2])}$: $x$ bertambah $3$ dan $y$ berubah $${n(3 * m)}$, jadi langkah $1$ pada $x$ mengubah $y$ sebanyak $${n(m)}$.`), T(`The line passes through $${pt(P[1])}$, so $y = ${poly([[m, 'x'], [c, '']])}$.`, `Garis itu melalui $${pt(P[1])}$, jadi $y = ${poly([[m, 'x'], [c, '']])}$.`), `$q = ${subLin(m, c, k)} = ${m * k + c}$`), sp: 'm' };
    },
  ];
  const g72e = [
    (r) => {
      const A = [r.int(-5, 5), r.int(-5, 5)], d = r.int(2, 9);
      const horiz = r.chance();
      const B = horiz ? [A[0] + d, A[1]] : [A[0], A[1] + d];
      return { q: T(`Find the distance between $A=${pt(A)}$ and $B=${pt(B)}$.`, `Cari jarak antara $A=${pt(A)}$ dan $B=${pt(B)}$.`), a: T(`${d} units`, `${d} unit`), w: W(horiz ? T('The two points have the same $y$-coordinate, so $AB$ is horizontal: subtract the $x$-coordinates.', 'Kedua-dua titik mempunyai koordinat-$y$ yang sama, jadi $AB$ mengufuk: tolak koordinat-$x$.') : T('The two points have the same $x$-coordinate, so $AB$ is vertical: subtract the $y$-coordinates.', 'Kedua-dua titik mempunyai koordinat-$x$ yang sama, jadi $AB$ mencancang: tolak koordinat-$y$.'), horiz ? `$AB = ${n(B[0])} - ${par(A[0])} = ${d}$` : `$AB = ${n(B[1])} - ${par(A[1])} = ${d}$`, T(`${d} units`, `${d} unit`)), sp: 's' };
    },
  ];
  const g72m = [
    (r) => {
      const [a, b, c] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
      const A = [r.int(-5, 3), r.int(-5, 3)], B = [A[0] + a * r.pick([1, -1]), A[1] + b * r.pick([1, -1])];
      const dx = B[0] - A[0], dy = B[1] - A[1];
      return { q: T(`Find the distance between $P = ${pt(A)}$ and $Q = ${pt(B)}$.`, `Cari jarak antara $P = ${pt(A)}$ dan $Q = ${pt(B)}$.`), a: T(`${c} units`, `${c} unit`), w: W('$PQ = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$', `$= ${distLine(dx, dy)}$`, T(`$= \\sqrt{${c * c}} = ${c}$ units`, `$= \\sqrt{${c * c}} = ${c}$ unit`)), sp: 's' };
    },
  ];
  const g72a = [
    (r) => {
      const A = [r.int(-4, 3), r.int(-4, 3)], B = [A[0] + r.int(2, 6) * r.pick([1, -1]), A[1] + r.int(2, 6) * r.pick([1, -1])];
      const d2 = (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2;
      need(!Number.isInteger(Math.sqrt(d2)));
      const dx = B[0] - A[0], dy = B[1] - A[1];
      return { q: T(`Find the distance between $${pt(A)}$ and $${pt(B)}$, correct to 2 decimal places.`, `Cari jarak antara $${pt(A)}$ dan $${pt(B)}$, betul kepada 2 tempat perpuluhan.`), a: T(`${n(round(Math.sqrt(d2), 2))} units`, `${n(round(Math.sqrt(d2), 2))} unit`), w: W('$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$', `$= ${distLine(dx, dy)} = \\sqrt{${d2}}$`, T(`$= ${n(round(Math.sqrt(d2), 2))}$ units (2 d.p.)`, `$= ${n(round(Math.sqrt(d2), 2))}$ unit (2 t.p.)`)), sp: 's' };
    },
    (r) => {
      const [k, m] = r.pick([[3, 4], [6, 8]]);
      const A = [r.int(-3, 0), r.int(-3, 0)], B = [A[0] + k, A[1]], C = [A[0], A[1] + m];
      const per = k + m + Math.hypot(k, m);
      const fig = S.plane({ x: [-5, 8], y: [-5, 8], scale: 17, polys: [{ p: [A, B, C] }], pts: [{ x: A[0], y: A[1], l: 'A' }, { x: B[0], y: B[1], l: 'B' }, { x: C[0], y: C[1], l: 'C' }] });
      return { q: T(`The vertices of a triangle are $A=${pt(A)}$, $B=${pt(B)}$ and $C=${pt(C)}$. Find the perimeter of triangle $ABC$.`, `Bucu-bucu sebuah segi tiga ialah $A=${pt(A)}$, $B=${pt(B)}$ dan $C=${pt(C)}$. Cari perimeter segi tiga $ABC$.`), fig, a: T(`${n(per)} units`, `${n(per)} unit`), w: W(T(`$AB$ is horizontal and $AC$ is vertical: $AB = ${k}$, $AC = ${m}$.`, `$AB$ mengufuk dan $AC$ mencancang: $AB = ${k}$, $AC = ${m}$.`), `$BC = \\sqrt{${k}^2 + ${m}^2} = \\sqrt{${k * k + m * m}} = ${n(Math.hypot(k, m))}$`, T(`Perimeter $= ${k} + ${m} + ${n(Math.hypot(k, m))} = ${n(per)}$ units`, `Perimeter $= ${k} + ${m} + ${n(Math.hypot(k, m))} = ${n(per)}$ unit`)), sp: 'm' };
    },
  ];
  const g73e = [
    (r) => {
      const A = [r.int(1, 6) * 2, r.int(1, 6) * 2], B = [r.int(1, 6) * 2, r.int(1, 6) * 2];
      const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      return { q: T(`Find the midpoint of $A=${pt(A)}$ and $B=${pt(B)}$.`, `Cari titik tengah bagi $A=${pt(A)}$ dan $B=${pt(B)}$.`), a: T(`$${pt(M)}$`), w: W('$M = \\left(\\dfrac{x_1 + x_2}{2},\\ \\dfrac{y_1 + y_2}{2}\\right)$', `$= ${midLine(A, B)}$`, `$= \\left(\\dfrac{${A[0] + B[0]}}{2},\\ \\dfrac{${A[1] + B[1]}}{2}\\right) = ${pt(M)}$`), sp: 's' };
    },
  ];
  const g73m = [
    (r) => {
      const A = [r.nz(-7, 7), r.nz(-7, 7)], B = [r.nz(-7, 7), r.nz(-7, 7)];
      const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      return { q: T(`Find the midpoint of $P = ${pt(A)}$ and $Q = ${pt(B)}$.`, `Cari titik tengah bagi $P = ${pt(A)}$ dan $Q = ${pt(B)}$.`), a: T(`$${pt(M)}$`), w: W('$M = \\left(\\dfrac{x_1 + x_2}{2},\\ \\dfrac{y_1 + y_2}{2}\\right)$', `$= ${midLine(A, B)}$`, `$= \\left(\\dfrac{${A[0] + B[0]}}{2},\\ \\dfrac{${A[1] + B[1]}}{2}\\right) = ${pt(M)}$`), sp: 's' };
    },
  ];
  const g73a = [
    (r) => {
      const A = [r.nz(-6, 6), r.nz(-6, 6)], M = [r.int(-5, 5), r.int(-5, 5)];
      const B = [2 * M[0] - A[0], 2 * M[1] - A[1]];
      return { q: T(`$M = ${pt(M)}$ is the midpoint of $AB$ and $A = ${pt(A)}$. Find the coordinates of $B$.`, `$M = ${pt(M)}$ ialah titik tengah $AB$ dan $A = ${pt(A)}$. Cari koordinat $B$.`), a: T(`$B = ${pt(B)}$`), w: W(T(`Let $B = (x, y)$. Then $\\dfrac{${A[0]} + x}{2} = ${M[0]}$ and $\\dfrac{${A[1]} + y}{2} = ${M[1]}$.`, `Katakan $B = (x, y)$. Maka $\\dfrac{${A[0]} + x}{2} = ${M[0]}$ dan $\\dfrac{${A[1]} + y}{2} = ${M[1]}$.`), `$x = 2(${M[0]}) - ${par(A[0])} = ${B[0]}$`, `$y = 2(${M[1]}) - ${par(A[1])} = ${B[1]}$`, `$B = ${pt(B)}$`), sp: 'm' };
    },
    (r) => {
      const A = [r.int(-4, 0), r.int(-4, 0)], B = [A[0] + 6, A[1] + 8];
      const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      return { q: T(`The diagonal $AC$ of a parallelogram has ends $A = ${pt(A)}$ and $C = ${pt(B)}$. Find the midpoint of $AC$, which is also the midpoint of the other diagonal, and the length of $AC$.`, `Pepenjuru $AC$ bagi sebuah segi empat selari mempunyai hujung $A = ${pt(A)}$ dan $C = ${pt(B)}$. Cari titik tengah $AC$, yang juga titik tengah pepenjuru yang lain, dan panjang $AC$.`), a: T(`Midpoint $${pt(M)}$; $AC = 10$ units`, `Titik tengah $${pt(M)}$; $AC = 10$ unit`), w: W(T(`(a) Midpoint $= ${midLine(A, B)} = ${pt(M)}$`, `(a) Titik tengah $= ${midLine(A, B)} = ${pt(M)}$`), '(b) $AC = \\sqrt{(6)^2 + (8)^2} = \\sqrt{100} = 10$', T(`Midpoint $${pt(M)}$; $AC = 10$ units`, `Titik tengah $${pt(M)}$; $AC = 10$ unit`)), sp: 'm' };
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
      return { q: T(`A function is given by $f(x) = ${a}x$. Find $f(${x})$.`, `Suatu fungsi diberi oleh $f(x) = ${a}x$. Cari $f(${x})$.`), a: T(`$${a * x}$`), w: W(T(`Substitute $x = ${x}$ into $f(x) = ${a}x$.`, `Gantikan $x = ${x}$ ke dalam $f(x) = ${a}x$.`), `$f(${x}) = ${a} \\times ${x} = ${a * x}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 5);
      const xs = [1, 2, 3];
      return { q: T(`Complete the table for the rule $y = ${a}x$.<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`, `Lengkapkan jadual bagi peraturan $y = ${a}x$.<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`), a: T(`$y = ${xs.map((x) => a * x).join(', ')}$`), w: W(T(`Multiply each value of $x$ by $${a}$.`, `Darab setiap nilai $x$ dengan $${a}$.`), `$${xs.map((x) => `${a} \\times ${x} = ${a * x}`).join(',\\ ')}$`, `$y = ${xs.map((x) => a * x).join(', ')}$`), sp: 's' };
    },
  ];
  const g81m = [
    (r) => {
      const a = r.int(2, 5), b = r.nz(-6, 6), x = r.nz(-4, 5);
      return { q: T(`Given $f(x) = ${lin(a, b)}$, find $f(${x})$ and $f(0)$.`, `Diberi $f(x) = ${lin(a, b)}$, cari $f(${x})$ dan $f(0)$.`), a: T(`$f(${x}) = ${a * x + b}$; $f(0) = ${b}$`), w: W(T(`Substitute each value into $f(x) = ${lin(a, b)}$.`, `Gantikan setiap nilai ke dalam $f(x) = ${lin(a, b)}$.`), `$f(${x}) = ${subLin(a, b, x)} = ${a * x + b}$`, `$f(0) = ${subLin(a, b, 0)} = ${b}$`, T('$f(0)$ is simply the constant term.', '$f(0)$ ialah sebutan pemalar sahaja.')), sp: 's' };
    },
    (r) => {
      const isF = r.chance();
      const xs = r.sample([1, 2, 3, 4, 5], 4).sort((a, b) => a - b);
      const ys = xs.map(() => r.int(1, 9));
      const pairs = xs.map((x, i) => [x, ys[i]]);
      let alt = null;
      if (!isF) { alt = ys[1] + r.int(1, 3); pairs.push([xs[1], alt]); }
      const list = r.shuffle(pairs).map((p) => `(${p[0]}, ${p[1]})`).join(',\\ ');
      return { q: T(`Is the relation $\\{${list}\\}$, written as (input, output), a function? Give a reason.`, `Adakah hubungan $\\{${list}\\}$, ditulis sebagai (input, output), suatu fungsi? Berikan sebab.`), a: isF ? T('Yes: each input has exactly one output.', 'Ya: setiap input mempunyai tepat satu output.') : T(`No: the input ${xs[1]} has two different outputs.`, `Tidak: input ${xs[1]} mempunyai dua output yang berbeza.`), w: isF ? W(T('Check the first numbers (the inputs): none of them is repeated.', 'Semak nombor pertama (input): tiada satu pun yang berulang.'), T('So every input has exactly one output: it is a function.', 'Jadi setiap input mempunyai tepat satu output: ia suatu fungsi.')) : W(T(`Check the first numbers (the inputs): $${xs[1]}$ appears twice, paired with $${ys[1]}$ and with $${alt}$.`, `Semak nombor pertama (input): $${xs[1]}$ muncul dua kali, dipadankan dengan $${ys[1]}$ dan dengan $${alt}$.`), T('One input with two different outputs breaks the rule, so it is not a function.', 'Satu input dengan dua output berbeza melanggar syarat itu, jadi ia bukan fungsi.')), sp: 's' };
    },
  ];
  const g81a = [
    (r) => {
      const k = r.int(2, 9);
      return { q: T(`For $f(x) = x^2$, find all possible values of $x$ for which $f(x) = ${k * k}$. Is $f$ one-to-one on the domain of all real numbers? Explain.`, `Bagi $f(x) = x^2$, cari semua nilai $x$ yang mungkin supaya $f(x) = ${k * k}$. Adakah $f$ satu dengan satu pada domain semua nombor nyata? Terangkan.`), a: T(`$x = ${k}$ or $x = -${k}$. No: two different inputs give the same output.`, `$x = ${k}$ atau $x = -${k}$. Tidak: dua input berbeza memberikan output yang sama.`), w: W(`$x^2 = ${k * k}$`, T(`$x = ${k}$ or $x = -${k}$, since $(${k})^2 = (-${k})^2 = ${k * k}$.`, `$x = ${k}$ atau $x = -${k}$, kerana $(${k})^2 = (-${k})^2 = ${k * k}$.`), T('Two different inputs give the same output, so $f$ is not one-to-one on all real numbers.', 'Dua input berbeza memberikan output yang sama, jadi $f$ bukan satu dengan satu pada semua nombor nyata.')), sp: 'm' };
    },
    (r) => {
      const k = r.int(2, 5);
      return { q: T(`Is $f(x) = x^2$ one-to-one when its domain is $\\{x : x \\ge 0\\}$? Compare with the domain of all real numbers.`, `Adakah $f(x) = x^2$ satu dengan satu apabila domainnya $\\{x : x \\ge 0\\}$? Bandingkan dengan domain semua nombor nyata.`), a: T('Yes, on $x \\ge 0$ each output comes from exactly one input; on all real numbers it is not, since $f(-k) = f(k)$.', 'Ya, pada $x \\ge 0$ setiap output datang daripada tepat satu input; pada semua nombor nyata ia tidak, kerana $f(-k) = f(k)$.'), w: W(T('On $x \\ge 0$ the negative inputs are removed, so each output $x^2$ comes from one input only.', 'Pada $x \\ge 0$ input negatif dibuang, jadi setiap output $x^2$ datang daripada satu input sahaja.'), T(`On all real numbers this fails, for example $f(-${k}) = f(${k}) = ${k * k}$.`, `Pada semua nombor nyata ini gagal, contohnya $f(-${k}) = f(${k}) = ${k * k}$.`), T('Yes on $x \\ge 0$ (one-to-one); many-to-one on all real numbers.', 'Ya pada $x \\ge 0$ (satu dengan satu); banyak dengan satu pada semua nombor nyata.')), sp: 'm' };
    },
  ];
  const curveTable = (a, nn, xs) => xs.map((x) => (x === 0 && nn < 0 ? null : a * Math.pow(x, nn)));
  const blank = () => S.plane({ x: [-4, 4], y: [-8, 8], scale: 17, labelStep: 2 });
  const g82e = [
    (r) => {
      const a = r.pick([1, 2]), nn = r.pick([1, 2]);
      const xs = [-2, -1, 0, 1, 2];
      const ys = curveTable(a, nn, xs);
      const sub = (x) => `${a === 1 ? '' : a + ' \\times '}(${x})${nn === 2 ? '^2' : ''}`;
      const wk = a === 1 && nn === 1
        ? W(T('Here $y = x$, so each output is the same as its input.', 'Di sini $y = x$, jadi setiap output sama dengan inputnya.'), `$y = ${ys.join(', ')}$`)
        : W(T('Substitute each value of $x$ into the rule.', 'Gantikan setiap nilai $x$ ke dalam peraturan itu.'), `$${xs.map((x, i) => `${sub(x)} = ${ys[i]}`).join(',\\ ')}$`, nn === 2 ? T('A negative number squared is positive, so the curve is symmetrical about the $y$-axis.', 'Kuasa dua nombor negatif ialah positif, jadi lengkung itu simetri pada paksi-$y$.') : T('The points lie on a straight line through the origin.', 'Titik-titik itu terletak pada garis lurus yang melalui asalan.'));
      return { q: T(`Complete the table of values for $y = ${a === 1 ? '' : a}x${nn === 2 ? '^2' : ''}$, then plot the points and draw the graph.<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`, `Lengkapkan jadual nilai bagi $y = ${a === 1 ? '' : a}x${nn === 2 ? '^2' : ''}$, kemudian plot titik dan lukis grafnya.<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`), fig: blank(), a: T(`$y = ${ys.join(', ')}$`), w: wk, sp: 'xs' };
    },
  ];
  const g82m = [
    (r) => {
      const a = r.pick([1, 2, -1, -2]), nn = 3;
      const xs = [-2, -1, 0, 1, 2];
      return { q: T(`Complete the table for $y = ${a === 1 ? '' : a === -1 ? '-' : a}x^3$ and state the value of $y$ when $x = -1.5$ using the graph (or by calculation).<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`, `Lengkapkan jadual bagi $y = ${a === 1 ? '' : a === -1 ? '-' : a}x^3$ dan nyatakan nilai $y$ apabila $x = -1.5$ menggunakan graf (atau melalui pengiraan).<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`), a: T(`$y = ${xs.map((x) => a * x ** 3).join(', ')}$; at $x = -1.5$, $y = ${n(a * -3.375)}$`), w: (() => { const cf = a === 1 ? '' : a === -1 ? '-' : `${a} \\times `; return W(T('Cube each value of $x$, then apply the coefficient.', 'Kuasa tigakan setiap nilai $x$, kemudian gunakan pekalinya.'), `$${xs.map((x) => `${cf}(${x})^3 = ${a * x ** 3}`).join(',\\ ')}$`, `$x = -1.5$: $y = ${cf}(-1.5)^3 = ${n(a * -3.375)}$`); })(), sp: 'm' };
    },
    (r) => {
      const k = r.pick([2, 4, 6]);
      const xs = [-4, -2, -1, 1, 2, 4];
      const fig = S.plane({ x: [-5, 5], y: [-6, 6], scale: 18, curves: [{ f: (x) => k / x, from: -5, to: -0.3 }, { f: (x) => k / x, from: 0.3, to: 5 }] });
      return { q: T(`The graph shows $y = \\dfrac{${k}}{x}$. Complete the table for the values shown below, and explain why $x = 0$ is not included.<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`, `Graf menunjukkan $y = \\dfrac{${k}}{x}$. Lengkapkan jadual bagi nilai yang ditunjukkan di bawah, dan terangkan mengapa $x = 0$ tidak disertakan.<br>${SPM.table([['$x$', ...xs], ['$y$', ...xs.map(() => '')]])}`), fig, a: T(`$y = ${xs.map((x) => n(round(k / x, 2))).join(', ')}$. $\\dfrac{${k}}{0}$ is not defined.`, `$y = ${xs.map((x) => n(round(k / x, 2))).join(', ')}$. $\\dfrac{${k}}{0}$ tidak ditakrifkan.`), w: W(T(`Divide $${k}$ by each value of $x$.`, `Bahagikan $${k}$ dengan setiap nilai $x$.`), `$${xs.map((x) => `\\dfrac{${k}}{${x}} = ${n(round(k / x, 2))}`).join(',\\ ')}$`, T('$x = 0$ is left out because $\\dfrac{' + k + '}{0}$ needs division by zero, which is not defined.', '$x = 0$ ditinggalkan kerana $\\dfrac{' + k + '}{0}$ memerlukan pembahagian dengan sifar, yang tidak ditakrifkan.')), sp: 's' };
    },
  ];
  const g82a = [
    (r) => {
      const k = r.pick([2, 3, 4, 8]);
      return { q: T(`For $y = \\dfrac{${k}}{x}$, complete: when $x = 1$, $y = \\square$; when $x = 0.1$, $y = \\square$; when $x = 0.01$, $y = \\square$. What happens to $y$ as $x$ gets closer to 0 from the positive side?`, `Bagi $y = \\dfrac{${k}}{x}$, lengkapkan: apabila $x = 1$, $y = \\square$; apabila $x = 0.1$, $y = \\square$; apabila $x = 0.01$, $y = \\square$. Apakah yang berlaku kepada $y$ apabila $x$ menghampiri 0 dari sebelah positif?`), a: T(`$${k},\\ ${n(k * 10)},\\ ${n(k * 100)}$. $y$ becomes larger and larger.`, `$${k},\\ ${n(k * 10)},\\ ${n(k * 100)}$. $y$ menjadi semakin besar.`), w: W(`$\\dfrac{${k}}{1} = ${k}$`, `$\\dfrac{${k}}{0.1} = ${n(k * 10)}$`, `$\\dfrac{${k}}{0.01} = ${n(k * 100)}$`, T('Dividing by a smaller and smaller positive number gives a larger and larger answer, so $y$ grows without limit.', 'Membahagi dengan nombor positif yang semakin kecil memberikan jawapan yang semakin besar, jadi $y$ bertambah tanpa had.')), sp: 's' };
    },
    (r) => {
      const a = r.pick([1, 2]);
      const fig = S.plane({ x: [-4, 4], y: [-8, 8], scale: 16, curves: [{ f: (x) => a * x * x }, { f: (x) => -a * x * x, dash: true }] });
      return { q: T(`The graph shows $y = ${a === 1 ? '' : a}x^2$ (solid) and $y = -${a === 1 ? '' : a}x^2$ (dashed). Describe two ways in which the graphs are similar and one way in which they differ.`, `Graf menunjukkan $y = ${a === 1 ? '' : a}x^2$ (penuh) dan $y = -${a === 1 ? '' : a}x^2$ (putus-putus). Huraikan dua persamaan graf-graf itu dan satu perbezaannya.`), fig, a: T('Both pass through the origin and are symmetrical about the $y$-axis. One opens upwards (values $\\ge 0$) and the other downwards (values $\\le 0$).', 'Kedua-duanya melalui asalan dan simetri pada paksi-$y$. Satu terbuka ke atas (nilai $\\ge 0$) dan satu lagi ke bawah (nilai $\\le 0$).'), w: W(T('When $x = 0$ both rules give $y = 0$, so both curves pass through the origin.', 'Apabila $x = 0$ kedua-dua peraturan memberikan $y = 0$, jadi kedua-dua lengkung melalui asalan.'), T('Replacing $x$ by $-x$ does not change $x^2$, so both are symmetrical about the $y$-axis.', 'Menggantikan $x$ dengan $-x$ tidak mengubah $x^2$, jadi kedua-duanya simetri pada paksi-$y$.'), T(`Since $x^2 \\ge 0$, $y = ${a === 1 ? '' : a}x^2$ gives $y \\ge 0$ (opens upwards) while $y = -${a === 1 ? '' : a}x^2$ gives $y \\le 0$ (opens downwards).`, `Oleh sebab $x^2 \\ge 0$, $y = ${a === 1 ? '' : a}x^2$ memberikan $y \\ge 0$ (terbuka ke atas) manakala $y = -${a === 1 ? '' : a}x^2$ memberikan $y \\le 0$ (terbuka ke bawah).`)), sp: 'm' };
    },
  ];
  const lifeGraph = (vals, lang, ylab) => S.graph({ w: 330, h: 210, xr: [0, vals.length - 1, 1], yr: [0, Math.ceil(Math.max(...vals) / 5) * 5 + 5, 5], xlabel: lang === 'en' ? 'Time (hours)' : 'Masa (jam)', ylabel: ylab, series: [{ pts: vals.map((v, i) => [i, v]), type: 'line', dotsToo: true }] });
  const g83e = [
    (r) => {
      const vals = [r.int(2, 8)];
      for (let i = 1; i < 7; i++) vals.push(vals[i - 1] + r.int(1, 4));
      const fig = T(lifeGraph(vals, 'en', 'Height of water (cm)'), lifeGraph(vals, 'ms', 'Tinggi air (cm)'));
      return { q: T('The graph shows the height of water in a tank over time. (a) What is the height at 3 hours? (b) Is the height increasing, decreasing or constant?', 'Graf menunjukkan tinggi air dalam sebuah tangki mengikut masa. (a) Berapakah tinggi pada jam ke-3? (b) Adakah tinggi itu bertambah, berkurang atau malar?'), fig, a: T(`(a) ${vals[3]} cm (b) Increasing`, `(a) ${vals[3]} cm (b) Bertambah`), w: W(T('(a) Go to 3 hours on the horizontal axis and read the height of the point above it.', '(a) Pergi ke jam ke-3 pada paksi mengufuk dan baca tinggi titik di atasnya.'), T(`The point is at ${vals[3]} cm.`, `Titik itu berada pada ${vals[3]} cm.`), T(`(b) The graph rises from ${vals[0]} cm to ${vals[6]} cm, so the height is increasing.`, `(b) Graf naik daripada ${vals[0]} cm kepada ${vals[6]} cm, jadi tinggi itu bertambah.`)), sp: 's' };
    },
  ];
  const g83m = [
    (r) => {
      const vals = [r.int(2, 8)];
      for (let i = 1; i < 7; i++) vals.push(vals[i - 1] + r.pick([1, 2, 5, 6]));
      const fig = T(lifeGraph(vals, 'en', 'Height of water (cm)'), lifeGraph(vals, 'ms', 'Tinggi air (cm)'));
      const k = r.int(1, 5) + 0.5;
      const est = (vals[Math.floor(k)] + vals[Math.ceil(k)]) / 2;
      const lo = Math.floor(k), hi = Math.ceil(k);
      let bi0 = 0; for (let i = 0; i < 6; i++) if (vals[i + 1] - vals[i] > vals[bi0 + 1] - vals[bi0]) bi0 = i;
      return { q: T(`The graph shows the height of water in a tank over time. Estimate the height at ${n(k)} hours (interpolate) and state in which hour the water level rose fastest.`, `Graf menunjukkan tinggi air dalam sebuah tangki mengikut masa. Anggarkan tinggi pada jam ${n(k)} (interpolasi) dan nyatakan dalam jam yang manakah paras air naik paling cepat.`), fig, a: (() => { let bi = 0; for (let i = 0; i < 6; i++) if (vals[i + 1] - vals[i] > vals[bi + 1] - vals[bi]) bi = i; return T(`About ${n(est)} cm; fastest between hour ${bi} and hour ${bi + 1}`, `Kira-kira ${n(est)} cm; paling cepat antara jam ${bi} dan jam ${bi + 1}`); })(), w: W(T(`At ${lo} hours the height is ${vals[lo]} cm and at ${hi} hours it is ${vals[hi]} cm.`, `Pada jam ${lo} tinggi ialah ${vals[lo]} cm dan pada jam ${hi} ialah ${vals[hi]} cm.`), T(`Halfway between them: $\\dfrac{${vals[lo]} + ${vals[hi]}}{2} = ${n(est)}$ cm.`, `Di tengah-tengah antaranya: $\\dfrac{${vals[lo]} + ${vals[hi]}}{2} = ${n(est)}$ cm.`), T(`Rises each hour: ${vals.slice(1).map((v, i) => v - vals[i]).join(', ')} cm; the largest is between hour ${bi0} and hour ${bi0 + 1}.`, `Kenaikan setiap jam: ${vals.slice(1).map((v, i) => v - vals[i]).join(', ')} cm; yang terbesar ialah antara jam ${bi0} dan jam ${bi0 + 1}.`)), sp: 's' };
    },
  ];
  const g83a = [
    (r) => {
      const vals = [r.int(2, 8)];
      for (let i = 1; i < 7; i++) vals.push(vals[i - 1] + r.int(2, 4));
      const fig = T(lifeGraph(vals, 'en', 'Height of water (cm)'), lifeGraph(vals, 'ms', 'Tinggi air (cm)'));
      const d = vals[6] - vals[0];
      return { q: T('The graph shows the height of water in a tank for the first 6 hours. Predict the height at 9 hours by extending the trend. State one reason why this prediction may not be reliable.', 'Graf menunjukkan tinggi air dalam sebuah tangki bagi 6 jam pertama. Ramalkan tinggi pada jam ke-9 dengan menyambung aliran itu. Nyatakan satu sebab mengapa ramalan ini mungkin tidak boleh dipercayai.'), fig, a: T(`About ${n(round(vals[6] + (d / 6) * 3, 1))} cm. The tank may become full, or the rate of filling may change.`, `Kira-kira ${n(round(vals[6] + (d / 6) * 3, 1))} cm. Tangki mungkin penuh, atau kadar pengisian mungkin berubah.`), w: W(T(`In 6 hours the height rose from ${vals[0]} cm to ${vals[6]} cm, a rise of ${d} cm.`, `Dalam 6 jam tinggi naik daripada ${vals[0]} cm kepada ${vals[6]} cm, kenaikan sebanyak ${d} cm.`), `$\\dfrac{${d}}{6} = ${n(round(d / 6, 3))}$`, `$${vals[6]} + 3 \\times ${n(round(d / 6, 3))} = ${n(round(vals[6] + (d / 6) * 3, 1))}$`, T('This is an extrapolation beyond the recorded data: the tank may become full, or the rate of filling may change.', 'Ini ialah ekstrapolasi di luar data yang direkodkan: tangki mungkin penuh, atau kadar pengisian mungkin berubah.')), sp: 'm' };
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
      return { q: T(`A car travels ${v * t} km in ${t} hours. Find its speed in km/h.`, `Sebuah kereta bergerak sejauh ${v * t} km dalam ${t} jam. Cari lajunya dalam km/j.`), a: T(`${v} km/h`, `${v} km/j`), w: W(T('Speed $=$ distance $\\div$ time.', 'Laju $=$ jarak $\\div$ masa.'), `$${v * t} \\div ${t} = ${v}$`, T(`${v} km/h`, `${v} km/j`)), sp: 'xs' };
    },
    (r) => {
      const v = r.int(4, 12) * 10, t = r.int(2, 5);
      return { q: T(`A train travels at ${v} km/h for ${t} hours. Find the distance travelled.`, `Sebuah kereta api bergerak pada ${v} km/j selama ${t} jam. Cari jarak yang dilalui.`), a: T(`${v * t} km`), w: W(T('Distance $=$ speed $\\times$ time.', 'Jarak $=$ laju $\\times$ masa.'), `$${v} \\times ${t} = ${v * t}$`, T(`${v * t} km`)), sp: 'xs' };
    },
  ];
  const g91m = [
    (r) => {
      const v = r.pick([60, 80, 90, 72]), h = r.int(1, 3), m = r.pick([15, 30, 45]);
      const t = h + m / 60;
      return { q: T(`A bus travels at ${v} km/h for ${hm(t)}. Find the distance travelled.`, `Sebuah bas bergerak pada ${v} km/j selama ${hmMs(t)}. Cari jarak yang dilalui.`), a: T(`${n(v * t)} km`), w: W(T(`Change the time to hours: ${hm(t)} $= ${n(t)}$ h.`, `Tukar masa kepada jam: ${hmMs(t)} $= ${n(t)}$ j.`), T('Distance $=$ speed $\\times$ time.', 'Jarak $=$ laju $\\times$ masa.'), `$${v} \\times ${n(t)} = ${n(v * t)}$`, T(`${n(v * t)} km`)), sp: 's' };
    },
    (r) => {
      const v = r.pick([36, 54, 72, 90, 108]);
      return { q: T(`Convert ${v} km/h to m/s.`, `Tukarkan ${v} km/j kepada m/s.`), a: T(`${n(v / 3.6)} m/s`), w: W(T('$1$ km $= 1000$ m and $1$ hour $= 3600$ s.', '$1$ km $= 1000$ m dan $1$ jam $= 3600$ s.'), `$${v} \\times \\dfrac{1000}{3600} = ${v} \\div 3.6 = ${n(v / 3.6)}$`, T(`${n(v / 3.6)} m/s`)), sp: 's' };
    },
    (r) => {
      const v = r.pick([60, 80, 40, 50]), d = v * r.int(2, 4) + v / 2;
      const start = r.pick([7, 8, 9]);
      const t = d / v;
      const end = start * 60 + Math.round(t * 60);
      const fmt = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      return { q: T(`Aiman leaves at ${fmt(start * 60)} for a town ${d} km away and drives at ${v} km/h. At what time does he arrive?`, `Aiman bertolak pada pukul ${fmt(start * 60)} ke sebuah bandar sejauh ${d} km dan memandu pada ${v} km/j. Pukul berapakah dia tiba?`), a: T(`${fmt(end)}`), w: W(T('Time $=$ distance $\\div$ speed.', 'Masa $=$ jarak $\\div$ laju.'), T(`$${d} \\div ${v} = ${n(t)}$ h, which is ${hm(t)}.`, `$${d} \\div ${v} = ${n(t)}$ j, iaitu ${hmMs(t)}.`), T(`Leaving at ${fmt(start * 60)} and adding ${hm(t)} gives ${fmt(end)}.`, `Bertolak pada ${fmt(start * 60)} dan menambah ${hmMs(t)} memberikan ${fmt(end)}.`)), sp: 's' };
    },
  ];
  const g91a = [
    (r) => {
      const d = r.pick([60, 120]), v1 = r.pick([40, 30, 20]), v2 = r.pick([60, 80, 120]);
      need(v1 !== v2);
      const avg = (2 * d) / (d / v1 + d / v2);
      return { q: T(`A car travels ${d} km at ${v1} km/h and then another ${d} km at ${v2} km/h. Find the average speed for the whole journey.`, `Sebuah kereta bergerak sejauh ${d} km pada ${v1} km/j dan kemudian ${d} km lagi pada ${v2} km/j. Cari purata laju bagi keseluruhan perjalanan.`), a: T(`${n(round(avg, 2))} km/h (not ${(v1 + v2) / 2})`, `${n(round(avg, 2))} km/j (bukan ${(v1 + v2) / 2})`), w: W(T(`First stage: $\\dfrac{${d}}{${v1}} = ${n(round(d / v1, 3))}$ h`, `Peringkat pertama: $\\dfrac{${d}}{${v1}} = ${n(round(d / v1, 3))}$ j`), T(`Second stage: $\\dfrac{${d}}{${v2}} = ${n(round(d / v2, 3))}$ h`, `Peringkat kedua: $\\dfrac{${d}}{${v2}} = ${n(round(d / v2, 3))}$ j`), T(`Average speed $= \\dfrac{\\text{total distance}}{\\text{total time}} = \\dfrac{${2 * d}}{${n(round(d / v1 + d / v2, 3))}} ${apx(avg, 2)} ${n(round(avg, 2))}$ km/h`, `Purata laju $= \\dfrac{\\text{jumlah jarak}}{\\text{jumlah masa}} = \\dfrac{${2 * d}}{${n(round(d / v1 + d / v2, 3))}} ${apx(avg, 2)} ${n(round(avg, 2))}$ km/j`), T(`More time is spent at the slower speed, so the answer is not $\\dfrac{${v1} + ${v2}}{2}$.`, `Lebih banyak masa dihabiskan pada laju yang lebih perlahan, jadi jawapannya bukan $\\dfrac{${v1} + ${v2}}{2}$.`)), sp: 'm' };
    },
    (r) => {
      const d1 = r.pick([90, 120, 150]), v1 = r.pick([60, 90, 75]), rest = r.pick([20, 30, 45]), d2 = r.pick([60, 100, 120]), v2 = r.pick([80, 100, 60]);
      const t = d1 / v1 + rest / 60 + d2 / v2;
      const avg = (d1 + d2) / t;
      return { q: T(`A lorry travels ${d1} km at ${v1} km/h, rests for ${rest} minutes, then travels ${d2} km at ${v2} km/h. Find (a) the total time taken, (b) the average speed for the whole journey (including the rest), correct to 1 decimal place.`, `Sebuah lori bergerak sejauh ${d1} km pada ${v1} km/j, berehat selama ${rest} minit, kemudian bergerak ${d2} km pada ${v2} km/j. Cari (a) jumlah masa yang diambil, (b) purata laju bagi keseluruhan perjalanan (termasuk rehat), betul kepada 1 tempat perpuluhan.`), a: T(`(a) ${n(round(t, 3))} h (b) ${n(round(avg, 1))} km/h`, `(a) ${n(round(t, 3))} j (b) ${n(round(avg, 1))} km/j`), w: W(T(`Stage 1: $\\dfrac{${d1}}{${v1}} = ${n(round(d1 / v1, 4))}$ h`, `Peringkat 1: $\\dfrac{${d1}}{${v1}} = ${n(round(d1 / v1, 4))}$ j`), T(`Rest: $\\dfrac{${rest}}{60} = ${n(round(rest / 60, 4))}$ h`, `Rehat: $\\dfrac{${rest}}{60} = ${n(round(rest / 60, 4))}$ j`), T(`Stage 2: $\\dfrac{${d2}}{${v2}} = ${n(round(d2 / v2, 4))}$ h`, `Peringkat 2: $\\dfrac{${d2}}{${v2}} = ${n(round(d2 / v2, 4))}$ j`), T(`(a) Total time $= ${n(round(t, 3))}$ h`, `(a) Jumlah masa $= ${n(round(t, 3))}$ j`), T(`(b) Average speed $= \\dfrac{\\text{total distance}}{\\text{total time}} = \\dfrac{${d1 + d2}}{${n(round(t, 3))}} \\approx ${n(round(avg, 1))}$ km/h`, `(b) Purata laju $= \\dfrac{\\text{jumlah jarak}}{\\text{jumlah masa}} = \\dfrac{${d1 + d2}}{${n(round(t, 3))}} \\approx ${n(round(avg, 1))}$ km/j`)), sp: 'l' };
    },
  ];
  const g91Ee = [
    (r) => {
      const v1 = r.pick([60, 70, 80]), v2 = v1 + r.pick([20, 30, 40]), head = r.pick([1, 2]);
      const gap = v1 * head;
      const t = gap / (v2 - v1);
      return { q: T(`Car $P$ leaves town $A$ at ${v1} km/h. ${head} hour${head > 1 ? 's' : ''} later, car $Q$ leaves from the same place along the same road at ${v2} km/h. After how many hours from $Q$'s departure does $Q$ catch up with $P$?`, `Kereta $P$ bertolak dari bandar $A$ pada ${v1} km/j. ${head} jam kemudian, kereta $Q$ bertolak dari tempat yang sama di jalan yang sama pada ${v2} km/j. Selepas berapa jam dari waktu $Q$ bertolak, $Q$ memintas $P$?`), a: T(`${n(round(t, 2))} hours`, `${n(round(t, 2))} jam`), w: W(T(`When $Q$ starts, $P$ is already ahead by $${v1} \\times ${head} = ${gap}$ km.`, `Apabila $Q$ bertolak, $P$ sudah mendahului sejauh $${v1} \\times ${head} = ${gap}$ km.`), T(`$Q$ closes the gap at $${v2} - ${v1} = ${v2 - v1}$ km/h.`, `$Q$ menutup jurang itu pada $${v2} - ${v1} = ${v2 - v1}$ km/j.`), `$\\dfrac{${gap}}{${v2 - v1}} ${apx(t, 2)} ${n(round(t, 2))}$`, T(`${n(round(t, 2))} hours after $Q$ starts.`, `${n(round(t, 2))} jam selepas $Q$ bertolak.`)), sp: 'm' };
    },
  ];
  const g92e = [
    (r) => {
      const t = r.int(2, 8), a = r.int(2, 6);
      return { q: T(`A car starts from rest and reaches ${a * t} m/s after ${t} seconds. Find its acceleration.`, `Sebuah kereta bermula dari keadaan pegun dan mencapai ${a * t} m/s selepas ${t} saat. Cari pecutannya.`), a: T(`${a} m/s²`), w: W(T('Acceleration $=$ change in speed $\\div$ time taken.', 'Pecutan $=$ perubahan laju $\\div$ masa yang diambil.'), `$\\dfrac{${a * t} - 0}{${t}} = ${a}$`, T(`${a} m/s²`)), sp: 's' };
    },
  ];
  const g92m = [
    (r) => {
      const u = r.int(2, 12), a = r.int(2, 5), t = r.int(2, 8);
      return { q: T(`A cyclist increases speed from ${u} m/s to ${u + a * t} m/s in ${t} seconds. Find the acceleration.`, `Seorang penunggang basikal meningkatkan laju daripada ${u} m/s kepada ${u + a * t} m/s dalam ${t} saat. Cari pecutannya.`), a: T(`${a} m/s²`), w: W(T('Acceleration $=$ change in speed $\\div$ time taken.', 'Pecutan $=$ perubahan laju $\\div$ masa yang diambil.'), `$\\dfrac{${u + a * t} - ${u}}{${t}} = ${a}$`, T(`${a} m/s²`)), sp: 's' };
    },
    (r) => {
      const u = r.int(8, 30), t = r.int(2, 8);
      return { q: T(`A train travelling at ${u * t} m/s brakes uniformly and stops in ${t} seconds. Find its deceleration.`, `Sebuah kereta api yang bergerak pada ${u * t} m/s memberhentikan diri dengan brek secara seragam dalam ${t} saat. Cari nyahpecutannya.`), a: T(`Acceleration $= ${-u}$ m/s² (deceleration ${u} m/s²)`, `Pecutan $= ${-u}$ m/s² (nyahpecutan ${u} m/s²)`), w: W(T('Acceleration $=$ (final speed $-$ initial speed) $\\div$ time.', 'Pecutan $=$ (laju akhir $-$ laju awal) $\\div$ masa.'), `$\\dfrac{0 - ${u * t}}{${t}} = ${-u}$`, T(`The negative sign shows slowing down: a deceleration of ${u} m/s².`, `Tanda negatif menunjukkan perlahan: nyahpecutan ${u} m/s².`)), sp: 's' };
    },
  ];
  const g92a = [
    (r) => {
      const a1 = r.int(2, 4), t1 = r.int(3, 6), t2 = r.int(2, 5);
      const v = a1 * t1;
      const a2 = round(v / t2, 2);
      return { q: T(`A car accelerates from rest at ${a1} m/s² for ${t1} seconds and then brakes to a stop in ${t2} seconds. Find (a) its maximum speed, (b) its deceleration.`, `Sebuah kereta memecut dari keadaan pegun pada ${a1} m/s² selama ${t1} saat dan kemudian memberhentikan diri dalam ${t2} saat. Cari (a) laju maksimumnya, (b) nyahpecutannya.`), a: T(`(a) ${v} m/s (b) ${n(a2)} m/s²`), w: W(`(a) $v = 0 + ${a1} \\times ${t1} = ${v}$`, T(`The maximum speed is ${v} m/s.`, `Laju maksimum ialah ${v} m/s.`), `(b) $\\dfrac{0 - ${v}}{${t2}} ${apx(-v / t2, 2)} ${n(-a2)}$`, T(`So the deceleration is ${n(a2)} m/s².`, `Jadi nyahpecutannya ialah ${n(a2)} m/s².`)), sp: 'm' };
    },
    (r) => {
      const u = r.pick([36, 54, 72]), t = r.int(4, 10), v = u + r.pick([18, 36]);
      const a = round((v - u) / 3.6 / t, 3);
      return { q: T(`A car increases its speed from ${u} km/h to ${v} km/h in ${t} seconds. Find the acceleration in m/s².`, `Sebuah kereta meningkatkan lajunya daripada ${u} km/j kepada ${v} km/j dalam ${t} saat. Cari pecutan dalam m/s².`), a: T(`${n(a)} m/s²`), w: W(T('Change both speeds to m/s first, by dividing by $3.6$.', 'Tukar kedua-dua laju kepada m/s dahulu, dengan membahagi dengan $3.6$.'), `$${u} \\div 3.6 = ${n(u / 3.6)}$, $${v} \\div 3.6 = ${n(v / 3.6)}$`, `$\\dfrac{${n(v / 3.6)} - ${n(u / 3.6)}}{${t}} ${apx((v - u) / 3.6 / t, 3)} ${n(a)}$`, T(`${n(a)} m/s²`)), sp: 'm' };
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
      return { q: T(`A ramp rises ${rise} m over a horizontal distance of ${run} m. Find its gradient.`, `Sebuah tanjakan menaik ${rise} m sepanjang jarak mengufuk ${run} m. Cari kecerunannya.`), a: T(`$${mfr(rise, run)}$`), w: W(T('Gradient $= \\dfrac{\\text{vertical change}}{\\text{horizontal change}}$.', 'Kecerunan $= \\dfrac{\\text{perubahan mencancang}}{\\text{perubahan mengufuk}}$.'), `$= \\dfrac{${rise}}{${run}}${mfr(rise, run) === `\\dfrac{${rise}}{${run}}` ? '' : ` = ${mfr(rise, run)}`}$`), sp: 's' };
    },
    (r) => {
      const A = [r.int(-3, 1), r.int(-3, 1)], dx = r.int(1, 4), dy = r.int(1, 4);
      const B = [A[0] + dx, A[1] + dy];
      return { q: T('Find the gradient of the line segment $AB$ shown.', 'Cari kecerunan tembereng garis $AB$ yang ditunjukkan.'), fig: gradFig(A, B, true), a: T(`$${mfr(dy, dx)}$`), w: W(T('Gradient $= \\dfrac{\\text{vertical change}}{\\text{horizontal change}}$.', 'Kecerunan $= \\dfrac{\\text{perubahan mencancang}}{\\text{perubahan mengufuk}}$.'), T(`From $A$ to $B$: ${dx} across and ${dy} up.`, `Dari $A$ ke $B$: ${dx} ke kanan dan ${dy} ke atas.`), `$\\dfrac{${dy}}{${dx}}${mfr(dy, dx) === `\\dfrac{${dy}}{${dx}}` ? '' : ` = ${mfr(dy, dx)}`}$`), sp: 's' };
    },
  ];
  const g101m = [
    (r) => {
      const A = [r.nz(-5, 5), r.nz(-5, 5)], B = [r.nz(-5, 5), r.nz(-5, 5)];
      need(A[0] !== B[0] && A[1] !== B[1]);
      return { q: T(`Find the gradient of the line through $P = ${pt(A)}$ and $Q = ${pt(B)}$.`, `Cari kecerunan garis yang melalui $P = ${pt(A)}$ dan $Q = ${pt(B)}$.`), a: T(`$${mfr(B[1] - A[1], B[0] - A[0])}$`), w: W(T('Gradient $= \\dfrac{y_2 - y_1}{x_2 - x_1}$.', 'Kecerunan $= \\dfrac{y_2 - y_1}{x_2 - x_1}$.'), `$= \\dfrac{${B[1]} - ${par(A[1])}}{${B[0]} - ${par(A[0])}} = \\dfrac{${B[1] - A[1]}}{${B[0] - A[0]}}${mfr(B[1] - A[1], B[0] - A[0]) === `\\dfrac{${B[1] - A[1]}}{${B[0] - A[0]}}` ? '' : ` = ${mfr(B[1] - A[1], B[0] - A[0])}`}$`), sp: 's' };
    },
    (r) => {
      const A = [r.int(-4, 0), r.int(1, 4)], dx = r.int(1, 4), dy = r.int(1, 4);
      const B = [A[0] + dx, A[1] - dy];
      return { q: T('Find the gradient of the line shown and state whether it is positive or negative.', 'Cari kecerunan garis yang ditunjukkan dan nyatakan sama ada ia positif atau negatif.'), fig: gradFig(A, B, true), a: T(`$${mfr(-dy, dx)}$, negative`, `$${mfr(-dy, dx)}$, negatif`), w: W(T(`From one marked point to the other: ${dx} across and ${dy} down.`, `Dari satu titik yang ditanda ke titik yang lain: ${dx} ke kanan dan ${dy} ke bawah.`), `$\\dfrac{-${dy}}{${dx}} = ${mfr(-dy, dx)}$`, T('The line falls from left to right, so the gradient is negative.', 'Garis turun dari kiri ke kanan, jadi kecerunannya negatif.')), sp: 's' };
    },
  ];
  const g101a = [
    (r) => {
      const m = r.pick([2, -2, 3, -1, 1]), A = [r.int(-3, 2), r.int(-3, 2)];
      const k = r.int(2, 5);
      const B = [A[0] + 1, A[1] + m], C = [A[0] + k, A[1] + m * k];
      return { q: T(`The points $A = ${pt(A)}$, $B = ${pt(B)}$ and $C = ${pt(C)}$ lie on a straight line. Show that the gradient of $AB$ equals the gradient of $AC$ and explain why this is expected.`, `Titik $A = ${pt(A)}$, $B = ${pt(B)}$ dan $C = ${pt(C)}$ terletak pada satu garis lurus. Tunjukkan bahawa kecerunan $AB$ sama dengan kecerunan $AC$ dan terangkan mengapa ini dijangkakan.`), a: T(`Both gradients are $${m}$. On one straight line, rise ÷ run is the same for any pair of points.`, `Kedua-dua kecerunan ialah $${m}$. Pada satu garis lurus, kenaikan ÷ larian adalah sama bagi mana-mana pasangan titik.`), w: W(`$m_{AB} = \\dfrac{${n(B[1])} - ${par(A[1])}}{${n(B[0])} - ${par(A[0])}} = \\dfrac{${m}}{1} = ${m}$`, `$m_{AC} = \\dfrac{${n(C[1])} - ${par(A[1])}}{${n(C[0])} - ${par(A[0])}} = \\dfrac{${m * k}}{${k}} = ${m}$`, T('On one straight line the rise and the run grow in the same proportion, so rise ÷ run is the same for any pair of points on it.', 'Pada satu garis lurus, kenaikan dan larian bertambah dalam kadar yang sama, jadi kenaikan ÷ larian adalah sama bagi mana-mana pasangan titik padanya.')), sp: 'm' };
    },
    (r) => {
      const m = r.pick([2, 3, -2, -3, 1, -1]), A = [r.int(-3, 3), r.int(-3, 3)], x2 = A[0] + r.int(2, 4);
      return { q: T(`The line through $A = ${pt(A)}$ and $B = (${x2}, k)$ has gradient $${m}$. Find $k$.`, `Garis yang melalui $A = ${pt(A)}$ dan $B = (${x2}, k)$ mempunyai kecerunan $${m}$. Cari $k$.`), a: T(`$k = ${A[1] + m * (x2 - A[0])}$`), w: W(`$\\dfrac{k - ${par(A[1])}}{${x2} - ${par(A[0])}} = ${m}$`, `$k - ${par(A[1])} = ${m} \\times ${x2 - A[0]} = ${m * (x2 - A[0])}$`, `$k = ${m * (x2 - A[0])} ${A[1] >= 0 ? `+ ${A[1]}` : `- ${-A[1]}`} = ${A[1] + m * (x2 - A[0])}$`), sp: 'm' };
    },
    (r) => {
      const A = [r.int(-3, 3), r.int(-3, 3)];
      const vert = r.chance();
      const B = vert ? [A[0], A[1] + r.int(2, 5)] : [A[0] + r.int(2, 5), A[1]];
      return { q: T(`Find the gradient of the line through $${pt(A)}$ and $${pt(B)}$. Describe the line.`, `Cari kecerunan garis yang melalui $${pt(A)}$ dan $${pt(B)}$. Huraikan garis itu.`), a: vert ? T('The gradient is not defined (division by zero): a vertical line.', 'Kecerunan tidak ditakrifkan (pembahagian dengan sifar): garis mencancang.') : T('The gradient is $0$: a horizontal line.', 'Kecerunan ialah $0$: garis mengufuk.'), w: vert ? W(T('The two points have the same $x$-coordinate, so the horizontal change is $0$.', 'Dua titik itu mempunyai koordinat-$x$ yang sama, jadi perubahan mengufuk ialah $0$.'), T(`$\\dfrac{${B[1] - A[1]}}{0}$ is not defined: you cannot divide by zero.`, `$\\dfrac{${B[1] - A[1]}}{0}$ tidak ditakrifkan: tidak boleh membahagi dengan sifar.`), T('The line is vertical.', 'Garis itu mencancang.')) : W(T('The two points have the same $y$-coordinate, so the vertical change is $0$.', 'Dua titik itu mempunyai koordinat-$y$ yang sama, jadi perubahan mencancang ialah $0$.'), `$\\dfrac{0}{${B[0] - A[0]}} = 0$`, T('The line is horizontal.', 'Garis itu mengufuk.')), sp: 's' };
    },
  ];
  SPM.addChapter(2, 10, T('Gradient of a Straight Line', 'Kecerunan Garis Lurus'), [
    { id: '10.1', en: 'Gradient', ms: 'Kecerunan', gen: { e: g101e, m: g101m, a: g101a } },
  ]);
})();
