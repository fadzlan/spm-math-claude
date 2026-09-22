/* Form 3 – Chapters 6 to 9 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, sum, gcd, Fr, poly, lin } = SPM;
  const S = SPM.svg;
  const F = SPM.figs;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const frT = Fr.tex;
  const rad = (d) => (d * Math.PI) / 180;
  const NTS = SPM.NTS;
  const nts = (q) => T(q.en + ' ' + NTS.en, q.ms + ' ' + NTS.ms);
  const pt = (p) => `(${n(p[0])}, ${n(p[1])})`;

  /* =============================================================== 6 */
  /** circle figure. pts: {A:deg…}; lines: ['AB','OA'…]; labels: [{at:'A', text:'x', to:'O'|'B'|'AB'}] ; tangent: {at:'T', len} */
  function cfig(o) {
    const P = {};
    const w = 260, h = 230, cx = w / 2, cy = h / 2, R = 82;
    P.O = [cx, cy];
    for (const [k, d] of Object.entries(o.pts)) P[k] = [cx + R * Math.cos(rad(d)), cy - R * Math.sin(rad(d))];
    let out = S.circle(cx, cy, R);
    for (const l of o.lines || []) out += S.line(P[l[0]][0], P[l[0]][1], P[l[1]][0], P[l[1]][1]);
    for (const k of Object.keys(o.pts)) {
      const u = [P[k][0] - cx, P[k][1] - cy];
      const L = Math.hypot(u[0], u[1]);
      out += S.dot(P[k][0], P[k][1], 2.4) + S.text(P[k][0] + (u[0] / L) * 12, P[k][1] + (u[1] / L) * 12, k, { i: true });
    }
    if (o.showO !== false) out += S.dot(cx, cy, 2.4) + S.text(cx + 8, cy + 10, 'O', { i: true });
    for (const lb of o.labels || []) {
      const A = P[lb.at];
      const tgt = lb.to.length === 2 ? [(P[lb.to[0]][0] + P[lb.to[1]][0]) / 2, (P[lb.to[0]][1] + P[lb.to[1]][1]) / 2] : P[lb.to];
      const d = [tgt[0] - A[0], tgt[1] - A[1]];
      const L = Math.hypot(d[0], d[1]) || 1;
      const k = lb.r || 24;
      out += S.text(A[0] + (d[0] / L) * k, A[1] + (d[1] / L) * k, lb.text, { s: 12 });
    }
    if (o.extra) out += o.extra(P, { cx, cy, R });
    return S.wrap(w, h, out, 'circle diagram');
  }

  const g61e = [
    (r) => {
      const x = r.int(20, 80);
      const fig = cfig({ pts: { A: 200, B: 340, C: 90 }, lines: ['OA', 'OB', 'CA', 'CB'], labels: [{ at: 'O', text: `${2 * x}°`, to: ['A', 'B'], r: 26 }, { at: 'C', text: 'x', to: 'O', r: 26 }] });
      return { q: nts(T('$O$ is the centre of the circle. Find $x$.', '$O$ ialah pusat bulatan. Cari $x$.')), fig, a: T(`$x = ${x}$ (angle at the centre is twice the angle at the circumference)`, `$x = ${x}$ (sudut di pusat ialah dua kali sudut pada lilitan)`), sp: 's' };
    },
    (r) => {
      const x = r.int(20, 60);
      const fig = cfig({ pts: { A: 180, B: 0, C: 90 }, lines: ['AB', 'CA', 'CB'], labels: [{ at: 'C', text: 'x', to: 'O', r: 24 }] });
      return { q: nts(T('$AB$ is a diameter of the circle. Find $x$ and state the property.', '$AB$ ialah diameter bulatan. Cari $x$ dan nyatakan sifat yang digunakan.')), fig, a: T('$x = 90$ (angle in a semicircle)', '$x = 90$ (sudut dalam semibulatan)'), sp: 's' };
    },
  ];
  const g61m = [
    (r) => {
      const x = r.int(25, 65), y = r.int(20, 50);
      const fig = cfig({ pts: { A: 150, B: 30, C: 260, D: 320 }, lines: ['AB', 'AC', 'BC', 'DA', 'DB'], showO: false, labels: [{ at: 'C', text: `${x}°`, to: ['A', 'B'], r: 24 }, { at: 'D', text: 'y', to: ['A', 'B'], r: 24 }] });
      return { q: nts(T(`In the diagram, $\\angle ACB = ${x}^\\circ$. Find $\\angle ADB$ and state the reason.`, `Dalam rajah, $\\angle ACB = ${x}^\\circ$. Cari $\\angle ADB$ dan nyatakan sebab.`)), fig, a: T(`$${x}^\\circ$ (angles in the same segment are equal)`, `$${x}^\\circ$ (sudut dalam tembereng yang sama adalah sama)`), sp: 's' };
    },
    (r) => {
      const c = r.int(35, 80);
      return { q: T(`In a circle with centre $O$, the angle at the circumference subtended by the minor arc $AB$ is $${c}^\\circ$. Find the reflex angle $AOB$ at the centre.`, `Dalam sebuah bulatan berpusat $O$, sudut pada lilitan yang dicangkum oleh lengkok minor $AB$ ialah $${c}^\\circ$. Cari sudut refleks $AOB$ di pusat.`), a: T(`$\\angle AOB = ${2 * c}^\\circ$ (minor); $\\angle AOB = ${360 - 2 * c}^\\circ$ (reflex)`, `$\\angle AOB = ${2 * c}^\\circ$ (minor); $\\angle AOB = ${360 - 2 * c}^\\circ$ (refleks)`), sp: 's' };
    },
  ];
  const g61a = [
    (r) => {
      const x = r.int(25, 65);
      const fig = cfig({ pts: { A: 200, B: 340, C: 90 }, lines: ['OA', 'OB', 'CA', 'CB', 'AB'], labels: [{ at: 'C', text: `${x}°`, to: 'O', r: 24 }, { at: 'A', text: 'y', to: ['O', 'B'], r: 22 }] });
      return { q: nts(T(`$O$ is the centre. $\\angle ACB = ${x}^\\circ$. Find (a) $\\angle AOB$, (b) $\\angle OAB$.`, `$O$ ialah pusat. $\\angle ACB = ${x}^\\circ$. Cari (a) $\\angle AOB$, (b) $\\angle OAB$.`)), fig, a: T(`(a) $${2 * x}^\\circ$ (b) $${90 - x}^\\circ$ (triangle $OAB$ is isosceles: $(180 - ${2 * x}) \\div 2$)`, `(a) $${2 * x}^\\circ$ (b) $${90 - x}^\\circ$ (segi tiga $OAB$ sama kaki: $(180 - ${2 * x}) \\div 2$)`), sp: 'm' };
    },
    (r) => {
      const a = r.int(30, 70), b = r.int(25, 60);
      return { q: T(`$A$, $B$, $C$ and $D$ lie on a circle with centre $O$. $\\angle BAC = ${a}^\\circ$ and $\\angle CBD = ${b}^\\circ$. Find $\\angle BOC$ and $\\angle COD$.`, `$A$, $B$, $C$ dan $D$ terletak pada sebuah bulatan berpusat $O$. $\\angle BAC = ${a}^\\circ$ dan $\\angle CBD = ${b}^\\circ$. Cari $\\angle BOC$ dan $\\angle COD$.`), a: T(`$\\angle BOC = ${2 * a}^\\circ$, $\\angle COD = ${2 * b}^\\circ$`), sp: 'm' };
    },
  ];
  const g62e = [
    (r) => {
      const a = r.int(60, 120), b = r.int(70, 110);
      const fig = cfig({ pts: { A: 150, B: 60, C: 340, D: 240 }, lines: ['AB', 'BC', 'CD', 'DA'], showO: false, labels: [{ at: 'A', text: `${a}°`, to: 'C', r: 24 }, { at: 'C', text: 'x', to: 'A', r: 24 }] });
      return { q: nts(T(`$ABCD$ is a cyclic quadrilateral with $\\angle DAB = ${a}^\\circ$. Find $\\angle BCD = x$.`, `$ABCD$ ialah sisi empat kitaran dengan $\\angle DAB = ${a}^\\circ$. Cari $\\angle BCD = x$.`)), fig, a: T(`$x = ${180 - a}$ (opposite angles of a cyclic quadrilateral add up to $180^\\circ$)`, `$x = ${180 - a}$ (sudut bertentangan sisi empat kitaran berjumlah $180^\\circ$)`), sp: 's' };
    },
  ];
  const g62m = [
    (r) => {
      const c = r.int(65, 115);
      const fig = cfig({ pts: { A: 150, B: 60, C: 340, D: 240 }, lines: ['AB', 'BC', 'CD', 'DA'], showO: false, extra: (P) => S.line(P.C[0], P.C[1], P.C[0] + 40, P.C[1] - 8) + S.text(P.C[0] + 55, P.C[1] - 10, 'E', { i: true }) + S.text(P.C[0] + 28, P.C[1] + 14, 'x', { s: 12 }) });
      return { q: nts(T(`$ABCD$ is a cyclic quadrilateral and $DC$ is produced to $E$. $\\angle DAB = ${c}^\\circ$. Find the exterior angle $\\angle BCE$.`, `$ABCD$ ialah sisi empat kitaran dan $DC$ dipanjangkan ke $E$. $\\angle DAB = ${c}^\\circ$. Cari sudut peluaran $\\angle BCE$.`)), fig, a: T(`$${c}^\\circ$ (exterior angle equals the interior opposite angle)`, `$${c}^\\circ$ (sudut peluaran sama dengan sudut pedalaman yang bertentangan)`), sp: 's' };
    },
    (r) => {
      const x = r.int(35, 70);
      return { q: T(`$O$ is the centre of a circle passing through $A$, $B$, $C$ and $D$ (a cyclic quadrilateral $ABCD$). $\\angle BOD = ${2 * x}^\\circ$ where $A$ is on the major arc. Find $\\angle BAD$ and $\\angle BCD$.`, `$O$ ialah pusat sebuah bulatan yang melalui $A$, $B$, $C$ dan $D$ (sisi empat kitaran $ABCD$). $\\angle BOD = ${2 * x}^\\circ$ dengan $A$ pada lengkok major. Cari $\\angle BAD$ dan $\\angle BCD$.`), a: T(`$\\angle BAD = ${x}^\\circ$; $\\angle BCD = ${180 - x}^\\circ$`), sp: 'm' };
    },
  ];
  const g62a = [
    (r) => {
      const x = r.int(10, 30), a = r.int(2, 4), c1 = r.int(5, 20), b = r.int(1, 3);
      const c2 = 180 - a * x - c1 - b * x;
      need(Math.abs(c2) < 40 && a !== b);
      return { q: T(`In a cyclic quadrilateral, two opposite angles are $(${lin(a, c1)})^\\circ$ and $(${lin(b, c2)})^\\circ$. Find $x$ and the two angles.`, `Dalam sebuah sisi empat kitaran, dua sudut bertentangan ialah $(${lin(a, c1)})^\\circ$ dan $(${lin(b, c2)})^\\circ$. Cari $x$ dan kedua-dua sudut itu.`), a: T(`$x = ${x}$; angles $${a * x + c1}^\\circ$ and $${b * x + c2}^\\circ$`, `$x = ${x}$; sudut $${a * x + c1}^\\circ$ dan $${b * x + c2}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(70, 110);
      return { q: T(`$ABCD$ is a cyclic quadrilateral with $AB \\parallel DC$. $\\angle ABC = ${a}^\\circ$. Find $\\angle ADC$ and $\\angle BCD$.`, `$ABCD$ ialah sisi empat kitaran dengan $AB \\parallel DC$. $\\angle ABC = ${a}^\\circ$. Cari $\\angle ADC$ dan $\\angle BCD$.`), a: T(`$\\angle ADC = ${180 - a}^\\circ$ (opposite angles of a cyclic quadrilateral); $\\angle BCD = ${180 - a}^\\circ$ (co-interior angles, $AB \\parallel DC$)`, `$\\angle ADC = ${180 - a}^\\circ$ (sudut bertentangan sisi empat kitaran); $\\angle BCD = ${180 - a}^\\circ$ (sudut dalam sebelah, $AB \\parallel DC$)`), sp: 'm' };
    },
  ];
  const g63e = [
    (r) => {
      const x = r.int(25, 65);
      const fig = cfig({ pts: { T: 90 }, lines: ['OT'], showO: true, extra: (P) => S.line(P.T[0] - 70, P.T[1], P.T[0] + 90, P.T[1]) + S.line(P.O[0], P.O[1], P.T[0] + 70, P.T[1]) + S.text(P.T[0] + 78, P.T[1] - 8, 'P', { i: true }) + S.text(P.O[0] + 20, P.O[1] - 30, `${x}°`, { s: 12 }) });
      return { q: nts(T(`$PT$ is a tangent to the circle at $T$ and $O$ is the centre. $\\angle TOP = ${x}^\\circ$. Find $\\angle OPT$.`, `$PT$ ialah tangen kepada bulatan di $T$ dan $O$ ialah pusat. $\\angle TOP = ${x}^\\circ$. Cari $\\angle OPT$.`)), fig, a: T(`$${90 - x}^\\circ$ ($OT \\perp PT$, so $\\angle OTP = 90^\\circ$)`, `$${90 - x}^\\circ$ ($OT \\perp PT$, jadi $\\angle OTP = 90^\\circ$)`), sp: 's' };
    },
  ];
  const g63m = [
    (r) => {
      const [rr, t, d] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]]);
      return { q: T(`$P$ is a point ${d} cm from the centre $O$ of a circle of radius ${rr} cm. A tangent $PT$ touches the circle at $T$. Find the length of $PT$.`, `$P$ ialah satu titik yang berjarak ${d} cm dari pusat $O$ sebuah bulatan berjejari ${rr} cm. Tangen $PT$ menyentuh bulatan di $T$. Cari panjang $PT$.`), a: T(`${t} cm`), w: T(`$PT^2 = ${d}^2 - ${rr}^2$`), sp: 's' };
    },
    (r) => {
      const t = r.int(5, 15), c = r.int(6, 12);
      return { q: T(`Tangents $PA$ and $PB$ are drawn from $P$ to a circle, touching it at $A$ and $B$. $PA = ${t}$ cm and chord $AB = ${c}$ cm. Find the perimeter of triangle $PAB$.`, `Tangen $PA$ dan $PB$ dilukis dari $P$ ke sebuah bulatan, menyentuhnya di $A$ dan $B$. $PA = ${t}$ cm dan perentas $AB = ${c}$ cm. Cari perimeter segi tiga $PAB$.`), a: T(`${2 * t + c} cm (tangents from an external point are equal)`, `${2 * t + c} cm (tangen dari satu titik luar adalah sama panjang)`), sp: 's' };
    },
  ];
  const g63a = [
    (r) => {
      const x = r.int(50, 130);
      return { q: T(`Tangents $PA$ and $PB$ touch a circle with centre $O$ at $A$ and $B$. $\\angle APB = ${x}^\\circ$. Find $\\angle AOB$ and $\\angle OAB$.`, `Tangen $PA$ dan $PB$ menyentuh sebuah bulatan berpusat $O$ di $A$ dan $B$. $\\angle APB = ${x}^\\circ$. Cari $\\angle AOB$ dan $\\angle OAB$.`), a: T(`$\\angle AOB = ${180 - x}^\\circ$ ($OAPB$ is a kite with two right angles); $\\angle OAB = ${x / 2}^\\circ$`, `$\\angle AOB = ${180 - x}^\\circ$ ($OAPB$ ialah layang-layang dengan dua sudut tegak); $\\angle OAB = ${x / 2}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const y = r.int(30, 70);
      return { q: T(`$TP$ is a tangent to a circle at $T$ and $TA$ is a chord. The angle between the tangent $TP$ and the chord $TA$ is $${y}^\\circ$. Find the angle in the alternate segment, $\\angle TBA$, where $B$ is on the circumference in the alternate segment.`, `$TP$ ialah tangen kepada sebuah bulatan di $T$ dan $TA$ ialah perentas. Sudut antara tangen $TP$ dan perentas $TA$ ialah $${y}^\\circ$. Cari sudut dalam tembereng berselang-seli, $\\angle TBA$, dengan $B$ pada lilitan dalam tembereng berselang-seli itu.`), a: T(`$${y}^\\circ$ (angle between tangent and chord equals the angle in the alternate segment)`, `$${y}^\\circ$ (sudut antara tangen dan perentas sama dengan sudut dalam tembereng berselang-seli)`), sp: 'm' };
    },
  ];
  const g64e = [
    (r) => {
      const c = r.pick([[T('touches both circles on the same side of the line joining their centres', 'menyentuh kedua-dua bulatan pada sebelah yang sama bagi garis yang menyambung pusat-pusatnya'), T('common external tangent', 'tangen sepunya luar')], [T('touches the two circles on opposite sides of the line joining their centres', 'menyentuh kedua-dua bulatan pada sebelah yang bertentangan bagi garis yang menyambung pusat-pusatnya'), T('common internal tangent', 'tangen sepunya dalam')]]);
      return { q: T(`A line ${c[0].en}. What type of common tangent is it?`, `Satu garis ${c[0].ms}. Apakah jenis tangen sepunya itu?`), a: c[1], sp: 's' };
    },
  ];
  const g64m = [
    (r) => {
      return { q: T(`Two circles with centres $O_1$ and $O_2$ have a common tangent touching them at $A$ and $B$. Find $\\angle O_1AB + \\angle O_2BA$, and state whether $O_1A \\parallel O_2B$.`, `Dua bulatan berpusat $O_1$ dan $O_2$ mempunyai satu tangen sepunya yang menyentuhnya di $A$ dan $B$. Cari $\\angle O_1AB + \\angle O_2BA$, dan nyatakan sama ada $O_1A \\parallel O_2B$.`), a: T('Both radii are perpendicular to the tangent: $90^\\circ + 90^\\circ = 180^\\circ$; yes, $O_1A \\parallel O_2B$ (co-interior angles add to $180^\\circ$).', 'Kedua-dua jejari serenjang dengan tangen: $90^\\circ + 90^\\circ = 180^\\circ$; ya, $O_1A \\parallel O_2B$ (sudut dalam sebelah berjumlah $180^\\circ$).'), sp: 's' };
    },
  ];
  const g64a = [
    (r) => {
      const [R1, R2] = r.pick([[8, 3], [10, 5], [9, 4], [12, 7]]);
      const t = r.pick([12, 24, 8, 15]);
      const D = Math.sqrt(t * t + (R1 - R2) ** 2);
      return { q: T(`Two circles of radii ${R1} cm and ${R2} cm have their centres ${n(round(D, 4))} cm apart. A common external tangent touches them at $A$ and $B$. Find the length of $AB$.`, `Dua bulatan berjejari ${R1} cm dan ${R2} cm mempunyai pusat yang berjarak ${n(round(D, 4))} cm. Satu tangen sepunya luar menyentuhnya di $A$ dan $B$. Cari panjang $AB$.`), a: T(`${t} cm`), w: T(`$AB^2 = ${n(round(D * D, 2))} - (${R1} - ${R2})^2$`), sp: 'm' };
    },
    (r) => {
      const [R1, R2, D] = r.pick([[3, 2, 13], [6, 2, 10], [4, 1, 13], [5, 3, 17]]);
      const t2 = D * D - (R1 + R2) ** 2;
      need(t2 > 0);
      return { q: T(`Two circles of radii ${R1} cm and ${R2} cm have centres ${D} cm apart. Find the length of a common internal tangent, correct to 2 decimal places.`, `Dua bulatan berjejari ${R1} cm dan ${R2} cm mempunyai pusat berjarak ${D} cm. Cari panjang tangen sepunya dalam, betul kepada 2 tempat perpuluhan.`), a: T(`${n(round(Math.sqrt(t2), 2))} cm`), w: T(`$\\sqrt{${D}^2 - (${R1} + ${R2})^2}$`), sp: 'm' };
    },
  ];
  SPM.addChapter(3, 6, T('Angles and Tangents of Circles', 'Sudut dan Tangen bagi Bulatan'), [
    { id: '6.1', en: 'Angles at the circumference and central angles subtended by an arc', ms: 'Sudut pada lilitan dan sudut pusat yang dicangkum oleh lengkok', gen: { e: g61e, m: g61m, a: g61a } },
    { id: '6.2', en: 'Cyclic quadrilaterals', ms: 'Sisi empat kitaran', gen: { e: g62e, m: g62m, a: g62a } },
    { id: '6.3', en: 'Tangents to circles', ms: 'Tangen kepada bulatan', gen: { e: g63e, m: g63m, a: g63a } },
    { id: '6.4', en: 'Common tangents', ms: 'Tangen sepunya', gen: { e: g64e, m: g64m, a: g64a } },
  ]);

  /* =============================================================== 7 */
  /** height map: rows (front→back) × cols (left→right) */
  const cell = 24;
  const gridSvg = (rows, cols, fn, labelFn) => {
    let out = '';
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) out += S.rect(6 + j * cell, 6 + i * cell, cell, cell) + (labelFn ? S.text(6 + j * cell + cell / 2, 6 + i * cell + cell / 2, labelFn(i, j), { s: 12 }) : '');
    return S.wrap(cols * cell + 12, rows * cell + 12, out, 'grid');
  };
  const stackSvg = (heights, cols) => {
    const maxH = Math.max(...heights);
    let out = '';
    for (let j = 0; j < cols; j++) for (let k = 0; k < heights[j]; k++) out += S.rect(6 + j * cell, 6 + (maxH - 1 - k) * cell, cell, cell, { fill: 'currentColor', op: 0.08 });
    return S.wrap(cols * cell + 12, maxH * cell + 12, out, 'elevation');
  };
  const heightMap = (r, rows, cols) => retry(() => {
    const m = Array.from({ length: rows }, () => Array.from({ length: cols }, () => r.int(1, 3)));
    const front = range(0, cols - 1).map((j) => Math.max(...m.map((row) => row[j])));
    const side = range(0, rows - 1).map((i) => Math.max(...m[i]));
    need(new Set(front).size > 1 && new Set(side).size > 1);
    return { m, front, side };
  });
  const planFig = (m) => gridSvg(m.length, m[0].length, null, (i, j) => m[i][j]);
  const g71e = [
    (r) => ({ q: T('A torch shines light perpendicularly onto a wall so that a flat shape is projected. Is this an orthogonal projection? Explain what "orthogonal" means here.', 'Sebuah lampu suluh menyinarkan cahaya secara serenjang ke atas dinding supaya bentuk rata diunjurkan. Adakah ini unjuran ortogon? Terangkan maksud "ortogon" di sini.'), a: T('Yes: an orthogonal projection is formed by lines (rays) perpendicular to the projection plane.', 'Ya: unjuran ortogon terbentuk oleh garis (sinar) yang serenjang dengan satah unjuran.'), sp: 's' }),
    (r) => {
      const b = r.pick([[T('a plan', 'pelan'), T('a horizontal plane, viewed from above', 'satah mengufuk, dilihat dari atas')], [T('a front elevation', 'dongakan depan'), T('a vertical plane, viewed from the front', 'satah mencancang, dilihat dari depan')], [T('a side elevation', 'dongakan sisi'), T('a vertical plane, viewed from the side', 'satah mencancang, dilihat dari sisi')]]);
      return { q: T(`On which plane, and from which direction, is ${b[0].en} formed?`, `Pada satah manakah, dan dari arah mana, ${b[0].ms} terbentuk?`), a: b[1], sp: 's' };
    },
  ];
  const g71m = [
    (r) => {
      const l = r.int(3, 8), w = r.int(2, 5), h = r.int(2, 6);
      return { q: T(`A cuboid is ${l} cm long, ${w} cm wide and ${h} cm high. State the dimensions of (a) its plan, (b) its front elevation (viewed along the width), (c) its side elevation.`, `Sebuah kuboid panjangnya ${l} cm, lebarnya ${w} cm dan tingginya ${h} cm. Nyatakan ukuran (a) pelannya, (b) dongakan depannya (dilihat sepanjang lebar), (c) dongakan sisinya.`), a: T(`(a) ${l} cm by ${w} cm (b) ${l} cm by ${h} cm (c) ${w} cm by ${h} cm`, `(a) ${l} cm kali ${w} cm (b) ${l} cm kali ${h} cm (c) ${w} cm kali ${h} cm`), sp: 's' };
    },
  ];
  const g71a = [
    (r) => {
      const { m } = heightMap(r, 2, 3);
      const total = sum(m.map((row) => sum(row)));
      return { q: T('The plan shows the number of cubes stacked at each position of a solid. The front elevation and the side elevation are viewed along the rows and columns respectively. Is the solid uniquely determined by its front and side elevations alone? Justify using this example.', 'Pelan menunjukkan bilangan kiub yang disusun pada setiap kedudukan sebuah pepejal. Dongakan depan dan dongakan sisi masing-masing dilihat sepanjang baris dan lajur. Adakah pepejal itu ditentukan secara unik oleh dongakan depan dan dongakan sisi sahaja? Berikan justifikasi menggunakan contoh ini.'), fig: planFig(m), a: T(`No. Different arrangements of cubes can give the same two elevations, for example by changing a hidden stack that is not the tallest in its row or column. The plan with heights (total ${total} cubes) is also needed.`, `Tidak. Susunan kiub yang berbeza boleh memberikan dua dongakan yang sama, misalnya dengan mengubah tindanan tersembunyi yang bukan paling tinggi dalam barisan atau lajurnya. Pelan dengan ketinggian (jumlah ${total} kiub) juga diperlukan.`), sp: 'm' };
    },
  ];
  const g72e = [
    (r) => {
      const { m, front } = heightMap(r, 2, 3);
      return { q: T('The plan shows a solid made of cubes; the number in each square is the number of cubes stacked there. Draw the front elevation, viewed from below the plan.', 'Pelan menunjukkan pepejal yang dibina daripada kiub; nombor dalam setiap petak ialah bilangan kiub yang disusun di situ. Lukis dongakan depan, dilihat dari bawah pelan.'), fig: planFig(m), a: T(stackSvg(front, 3), stackSvg(front, 3)), sp: 'l' };
    },
  ];
  const g72m = [
    (r) => {
      const { m, front, side } = heightMap(r, 3, 3);
      return { q: T('The plan shows the number of cubes stacked at each position. Draw (a) the front elevation (viewed from the bottom of the plan), (b) the side elevation (viewed from the right).', 'Pelan menunjukkan bilangan kiub yang disusun pada setiap kedudukan. Lukis (a) dongakan depan (dilihat dari bahagian bawah pelan), (b) dongakan sisi (dilihat dari kanan).'), fig: planFig(m), a: T(`(a) ${stackSvg(front, 3)} (b) ${stackSvg(side.slice().reverse(), 3)}`, `(a) ${stackSvg(front, 3)} (b) ${stackSvg(side.slice().reverse(), 3)}`), sp: 'xl' };
    },
  ];
  const g72a = [
    (r) => {
      const { m, front, side } = heightMap(r, 3, 4);
      return { q: T('The plan shows the number of cubes at each position of a solid. Draw the front elevation and the side elevation (viewed from the right), and find the total number of cubes.', 'Pelan menunjukkan bilangan kiub pada setiap kedudukan sebuah pepejal. Lukis dongakan depan dan dongakan sisi (dilihat dari kanan), dan cari jumlah bilangan kiub.'), fig: planFig(m), a: T(`Front: ${stackSvg(front, 4)} Side: ${stackSvg(side.slice().reverse(), 3)} Total: ${sum(m.map((row) => sum(row)))} cubes`, `Depan: ${stackSvg(front, 4)} Sisi: ${stackSvg(side.slice().reverse(), 3)} Jumlah: ${sum(m.map((row) => sum(row)))} kiub`), sp: 'xxl' };
    },
  ];
  const g73e = [
    (r) => {
      const k = r.pick([2, 5, 10, 20]), L = r.int(2, 9) * k;
      return { q: T(`A plan of a room is drawn to a scale of 1 : ${k}. A wall is ${L} cm long in reality. How long is it on the plan?`, `Pelan sebuah bilik dilukis dengan skala 1 : ${k}. Sebuah dinding panjangnya ${L} cm sebenarnya. Berapakah panjangnya pada pelan?`), a: T(`${L / k} cm`), sp: 's' };
    },
  ];
  const g73m = [
    (r) => {
      const k = r.pick([50, 100, 200]), l = r.int(3, 8) * k / 100, w = r.int(2, 5) * k / 100, h = r.int(2, 4) * k / 100;
      return { q: T(`A model of a shed is to be drawn to a scale of 1 : ${k}. The shed is ${n(l)} m long, ${n(w)} m wide and ${n(h)} m high. Find the drawing lengths (in cm) of the plan and the front elevation.`, `Model sebuah bangsal hendak dilukis dengan skala 1 : ${k}. Bangsal itu panjangnya ${n(l)} m, lebarnya ${n(w)} m dan tingginya ${n(h)} m. Cari panjang lukisan (dalam cm) bagi pelan dan dongakan depan.`), a: T(`Plan: ${n((l * 100) / k)} cm by ${n((w * 100) / k)} cm; front elevation: ${n((l * 100) / k)} cm by ${n((h * 100) / k)} cm`, `Pelan: ${n((l * 100) / k)} cm kali ${n((w * 100) / k)} cm; dongakan depan: ${n((l * 100) / k)} cm kali ${n((h * 100) / k)} cm`), sp: 's' };
    },
  ];
  const g73a = [
    (r) => {
      const k = r.pick([20, 50, 100]), a = r.int(4, 9), b = r.int(2, 6), c = r.int(2, 5);
      return { q: T(`A scaled front elevation of a building measures ${a} cm by ${b} cm and its scaled side elevation measures ${c} cm by ${b} cm. The scale is 1 : ${k}. Find the actual length, width, and height of the building in metres.`, `Dongakan depan berskala sebuah bangunan berukuran ${a} cm kali ${b} cm dan dongakan sisi berskalanya berukuran ${c} cm kali ${b} cm. Skalanya ialah 1 : ${k}. Cari panjang, lebar dan tinggi sebenar bangunan itu dalam meter.`), a: T(`Length ${n((a * k) / 100)} m, width ${n((c * k) / 100)} m, height ${n((b * k) / 100)} m`, `Panjang ${n((a * k) / 100)} m, lebar ${n((c * k) / 100)} m, tinggi ${n((b * k) / 100)} m`), sp: 'm' };
    },
  ];
  const g74e = [
    (r) => {
      const c = r.pick([[T('a plan that is a circle and a front elevation that is a rectangle', 'pelan yang berbentuk bulatan dan dongakan depan yang berbentuk segi empat tepat'), T('cylinder', 'silinder')], [T('a plan that is a square and a front elevation that is a triangle', 'pelan yang berbentuk segi empat sama dan dongakan depan yang berbentuk segi tiga'), T('square-based pyramid', 'piramid tapak segi empat sama')], [T('a plan that is a circle and a front elevation that is a triangle', 'pelan yang berbentuk bulatan dan dongakan depan yang berbentuk segi tiga'), T('cone', 'kon')]]);
      return { q: T(`Which solid has ${c[0].en}?`, `Pepejal manakah yang mempunyai ${c[0].ms}?`), a: c[1], sp: 's' };
    },
  ];
  const g74m = [
    (r) => {
      const { m } = heightMap(r, 2, 3);
      const total = sum(m.map((row) => sum(row)));
      return { q: T('The plan shows the number of cubes at each position of a solid. Each cube has an edge of 2 cm. Find the total volume of the solid.', 'Pelan menunjukkan bilangan kiub pada setiap kedudukan sebuah pepejal. Setiap kiub mempunyai tepi 2 cm. Cari jumlah isi padu pepejal itu.'), fig: planFig(m), a: T(`${total} cubes $\\times 8 = ${total * 8}\\ \\text{cm}^3$`, `${total} kiub $\\times 8 = ${total * 8}\\ \\text{cm}^3$`), sp: 's' };
    },
  ];
  const g74a = [
    (r) => {
      const { front, side } = heightMap(r, 3, 3);
      // enumerate every arrangement (each position occupied) that gives exactly these elevations
      let lo = Infinity, hi = 0;
      const cells = [];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cells.push([i, j, Math.min(side[i], front[j])]);
      const cur = new Array(9).fill(1);
      const rec = (k) => {
        if (k === 9) {
          for (let i = 0; i < 3; i++) if (Math.max(cur[3 * i], cur[3 * i + 1], cur[3 * i + 2]) !== side[i]) return;
          for (let j = 0; j < 3; j++) if (Math.max(cur[j], cur[3 + j], cur[6 + j]) !== front[j]) return;
          const t = sum(cur);
          lo = Math.min(lo, t); hi = Math.max(hi, t);
          return;
        }
        for (let v = 1; v <= cells[k][2]; v++) { cur[k] = v; rec(k + 1); }
      };
      rec(0);
      need(lo < hi && Number.isFinite(lo));
      return { q: T(`A solid built from cubes has a plan with 3 rows and 3 columns, and every position holds at least one cube. Its front elevation has column heights ${front.join(', ')} and its side elevation has row heights ${side.join(', ')}. State the least and the greatest number of cubes possible. Explain why the views alone do not give a unique answer.`, `Sebuah pepejal yang dibina daripada kiub mempunyai pelan dengan 3 baris dan 3 lajur, dan setiap kedudukan mempunyai sekurang-kurangnya satu kiub. Dongakan depannya mempunyai ketinggian lajur ${front.join(', ')} dan dongakan sisinya mempunyai ketinggian baris ${side.join(', ')}. Nyatakan bilangan kiub yang paling sedikit dan yang paling banyak yang mungkin. Terangkan mengapa paparan sahaja tidak memberikan jawapan yang unik.`), a: T(`Least ${lo} cubes, greatest ${hi} cubes. Hidden positions can hold different numbers of cubes without changing either elevation.`, `Paling sedikit ${lo} kiub, paling banyak ${hi} kiub. Kedudukan tersembunyi boleh mempunyai bilangan kiub yang berbeza tanpa mengubah mana-mana dongakan.`), sp: 'l' };
    },
  ];
  SPM.addChapter(3, 7, T('Plans and Elevations', 'Pelan dan Dongakan'), [
    { id: '7.1', en: 'Orthogonal projections', ms: 'Unjuran ortogon', gen: { e: g71e, m: g71m, a: g71a } },
    { id: '7.2', en: 'Plans and elevations', ms: 'Pelan dan dongakan', gen: { e: g72e, m: g72m, a: g72a } },
    { id: '7.3', en: 'Drawings to scale', ms: 'Lukisan berskala', gen: { e: g73e, m: g73m, a: g73a } },
    { id: '7.4', en: 'Problem solving', ms: 'Penyelesaian masalah', gen: { e: g74e, m: g74m, a: g74a } },
  ]);

  /* =============================================================== 8 */
  const g81e = [
    (r) => {
      const c = r.pick([
        [T('the tip of the minute hand of a clock', 'hujung jarum minit sebuah jam'), T('a circle', 'bulatan')],
        [T('a point that moves so that it is always 4 cm from a fixed point $O$', 'satu titik yang bergerak supaya sentiasa 4 cm dari titik tetap $O$'), T('a circle with centre $O$ and radius 4 cm', 'bulatan berpusat $O$ berjejari 4 cm')],
        [T('a point that moves so that it is always equidistant from two fixed points $A$ and $B$', 'satu titik yang bergerak supaya sentiasa sama jarak dari dua titik tetap $A$ dan $B$'), T('the perpendicular bisector of $AB$', 'pembahagi dua sama serenjang bagi $AB$')],
        [T('a point that moves so that it is always 3 cm from a straight line', 'satu titik yang bergerak supaya sentiasa 3 cm dari suatu garis lurus'), T('two lines parallel to the given line, 3 cm on either side', 'dua garis selari dengan garis itu, 3 cm pada kedua-dua belah')],
      ]);
      return { q: T(`Describe the locus of ${c[0].en}.`, `Huraikan lokus bagi ${c[0].ms}.`), a: c[1], sp: 's' };
    },
  ];
  const g81m = [
    (r) => {
      const d = r.int(2, 9);
      return { q: T(`Describe the locus of points that are ${d} cm from a fixed point $O$ (a) in a plane, (b) in three-dimensional space. Compare them.`, `Huraikan lokus titik yang berjarak ${d} cm dari titik tetap $O$ (a) dalam satah, (b) dalam ruang tiga dimensi. Bandingkan kedua-duanya.`), a: T(`(a) A circle of radius ${d} cm centred at $O$. (b) A sphere of radius ${d} cm centred at $O$; the circle is its cross-section.`, `(a) Bulatan berjejari ${d} cm berpusat di $O$. (b) Sfera berjejari ${d} cm berpusat di $O$; bulatan ialah keratan rentasnya.`), sp: 's' };
    },
  ];
  const g81a = [
    (r) => {
      const d = r.int(2, 5), AB = r.int(8, 12);
      return { q: T(`Points $A$ and $B$ are ${AB} cm apart. Describe the two loci needed to find a point $P$ that is ${d + 3} cm from $A$ and equidistant from $A$ and $B$, and state how many such points exist.`, `Titik $A$ dan $B$ berjarak ${AB} cm. Huraikan dua lokus yang diperlukan untuk mencari titik $P$ yang berjarak ${d + 3} cm dari $A$ dan sama jarak dari $A$ dan $B$, dan nyatakan bilangan titik sedemikian.`), a: (d + 3 > AB / 2) ? T(`Locus 1: a circle, centre A, radius ${d + 3} cm. Locus 2: the perpendicular bisector of AB. They meet at 2 points (${d + 3} > ${AB / 2}).`, `Lokus 1: bulatan, pusat A, jejari ${d + 3} cm. Lokus 2: pembahagi dua sama serenjang AB. Kedua-duanya bertemu di 2 titik (${d + 3} > ${AB / 2}).`) : (d + 3 === AB / 2 ? T(`Locus 1: a circle, centre A, radius ${d + 3} cm. Locus 2: the perpendicular bisector of AB. They touch at 1 point, the midpoint of AB.`, `Lokus 1: bulatan, pusat A, jejari ${d + 3} cm. Lokus 2: pembahagi dua sama serenjang AB. Kedua-duanya bersentuhan di 1 titik, iaitu titik tengah AB.`) : T(`Locus 1: a circle, centre A, radius ${d + 3} cm. Locus 2: the perpendicular bisector of AB. They do not meet: no such point exists (${d + 3} < ${AB / 2}).`, `Lokus 1: bulatan, pusat A, jejari ${d + 3} cm. Lokus 2: pembahagi dua sama serenjang AB. Kedua-duanya tidak bertemu: tiada titik sedemikian (${d + 3} < ${AB / 2}).`)), sp: 'l' };
    },
  ];
  const g82e = [
    (r) => {
      const R = r.int(3, 6);
      const fig = (() => { const w = 260, h = 190; return S.wrap(w, h, S.dot(130, 95, 3) + S.text(140, 105, 'O', { i: true }) + S.circle(130, 95, R * 14, { dash: true }) + S.line(20, 95 - 3 * 14, 240, 95 - 3 * 14), 'circle and line'); })();
      return { q: T(`A circle of radius ${R} cm and a straight line ${3} cm from its centre $O$ are drawn. How many points are ${R} cm from $O$ and on the line? Mark them.`, `Sebuah bulatan berjejari ${R} cm dan satu garis lurus yang berjarak 3 cm dari pusatnya $O$ dilukis. Berapakah bilangan titik yang berjarak ${R} cm dari $O$ dan berada pada garis itu? Tandakannya.`), a: T(`2 points (the line cuts the circle twice, since $3 < ${R}$)`, `2 titik (garis itu memotong bulatan dua kali, kerana $3 < ${R}$)`), sp: 'l' };
    },
  ];
  const g82m = [
    (r) => {
      const [half, rr, dd] = r.pick([[4, 5, 3], [6, 10, 8], [3, 5, 4], [5, 13, 12]]);
      return { q: T(`$A$ and $B$ are ${2 * half} cm apart. Find the distance from the midpoint of $AB$ to each point $P$ that is equidistant from $A$ and $B$ and ${rr} cm from $A$. How many such points are there?`, `$A$ dan $B$ berjarak ${2 * half} cm. Cari jarak dari titik tengah $AB$ ke setiap titik $P$ yang sama jarak dari $A$ dan $B$ dan berjarak ${rr} cm dari $A$. Berapakah bilangan titik sedemikian?`), a: T(`${dd} cm from the midpoint (on either side of $AB$): 2 points`, `${dd} cm dari titik tengah (pada kedua-dua sisi $AB$): 2 titik`), w: T(`$\\sqrt{${rr}^2 - ${half}^2} = ${dd}$`), sp: 'm' };
    },
  ];
  const g82a = [
    (r) => {
      const a = r.int(4, 6), b = r.int(6, 9);
      return { q: T(`$ABCD$ is a rectangle with $AB = ${b + 2}$ cm and $AD = ${a + 2}$ cm. Describe the region $R$ containing points inside the rectangle that are (i) at least 3 cm from $A$, (ii) closer to $AB$ than to $AD$, (iii) at most ${a} cm from $A$. What loci must be drawn?`, `$ABCD$ ialah sebuah segi empat tepat dengan $AB = ${b + 2}$ cm dan $AD = ${a + 2}$ cm. Huraikan kawasan $R$ yang mengandungi titik di dalam segi empat tepat yang (i) sekurang-kurangnya 3 cm dari $A$, (ii) lebih dekat kepada $AB$ berbanding $AD$, (iii) selebih-lebihnya ${a} cm dari $A$. Lokus apakah yang mesti dilukis?`), a: T(`Draw (1) a circle centre $A$, radius 3 cm; (2) a circle centre $A$, radius ${a} cm; (3) the bisector of $\\angle DAB$ (points equidistant from $AB$ and $AD$). $R$ is between the two circles, on the $AB$ side of the bisector.`, `Lukis (1) bulatan berpusat $A$ berjejari 3 cm; (2) bulatan berpusat $A$ berjejari ${a} cm; (3) pembahagi dua sama $\\angle DAB$ (titik sama jarak dari $AB$ dan $AD$). $R$ berada di antara dua bulatan itu, pada sisi $AB$ pembahagi dua sama itu.`), sp: 'xl' };
    },
  ];
  SPM.addChapter(3, 8, T('Loci in Two Dimensions', 'Lokus dalam Dua Dimensi'), [
    { id: '8.1', en: 'Exploration and construction of loci', ms: 'Penerokaan dan pembinaan lokus', gen: { e: g81e, m: g81m, a: g81a } },
    { id: '8.2', en: 'Intersection of loci and regions', ms: 'Persilangan lokus dan kawasan', gen: { e: g82e, m: g82m, a: g82a } },
  ]);

  /* =============================================================== 9 */
  const eqY = (m, c) => `y = ${(() => { const mx = m.d === 1 ? (m.n === 1 ? 'x' : m.n === -1 ? '-x' : `${m.n}x`) : `${m.n < 0 ? '-' : ''}\\dfrac{${Math.abs(m.n)}}{${m.d}}x`; if (m.n === 0) return frT(c); const cc = c.n === 0 ? '' : (c.n < 0 ? ' - ' : ' + ') + frT({ n: Math.abs(c.n), d: c.d }); return mx + cc; })()}`;
  const mF = (a, b) => Fr.make(a, b);
  const g91e = [
    (r) => {
      const m = r.nz(-5, 5), c = r.nz(-6, 6);
      return { q: T(`State the gradient and the $y$-intercept of the line $y = ${poly([[m, 'x'], [c, '']])}$.`, `Nyatakan kecerunan dan pintasan-$y$ bagi garis $y = ${poly([[m, 'x'], [c, '']])}$.`), a: T(`Gradient ${m}, $y$-intercept ${c}`, `Kecerunan ${m}, pintasan-$y$ ${c}`), sp: 's' };
    },
    (r) => {
      const m = r.nz(-4, 4), c = r.nz(-5, 5);
      return { q: T(`Write the equation of the line with gradient ${m} and $y$-intercept ${c}.`, `Tulis persamaan garis yang mempunyai kecerunan ${m} dan pintasan-$y$ ${c}.`), a: T(`$y = ${poly([[m, 'x'], [c, '']])}$`), sp: 's' };
    },
  ];
  const g91m = [
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5), c = a * b * r.int(1, 2);
      need(a !== b);
      const m = mF(-a, b);
      return { q: T(`Find the gradient, the $x$-intercept and the $y$-intercept of the line $${a}x + ${b}y = ${c}$.`, `Cari kecerunan, pintasan-$x$ dan pintasan-$y$ bagi garis $${a}x + ${b}y = ${c}$.`), a: T(`Gradient $${frT(m)}$; $x$-intercept: $${frT(mF(c, a))}$; $y$-intercept: $${frT(mF(c, b))}$`, `Kecerunan $${frT(m)}$; pintasan-$x$: $${frT(mF(c, a))}$; pintasan-$y$: $${frT(mF(c, b))}$`), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-4, 4), P = [r.int(-4, 4), r.int(-4, 4)];
      const c = P[1] - m * P[0];
      return { q: T(`Find the equation of the line with gradient ${m} passing through $(${P[0]}, ${P[1]})$.`, `Cari persamaan garis yang berkecerunan ${m} dan melalui $(${P[0]}, ${P[1]})$.`), a: T(`$y = ${poly([[m, 'x'], [c, '']])}$`), sp: 'm' };
    },
  ];
  const g91a = [
    (r) => {
      const P = [r.int(-3, 3), r.int(-3, 3)], Q = [P[0] + r.int(2, 4), P[1] + r.pick([1, 3, 5, -1, -3])];
      const m = mF(Q[1] - P[1], Q[0] - P[0]);
      const c = Fr.sub(mF(P[1], 1), Fr.mul(m, mF(P[0], 1)));
      return { q: T(`Find the equation of the line through $${pt(P)}$ and $${pt(Q)}$.`, `Cari persamaan garis yang melalui $${pt(P)}$ dan $${pt(Q)}$.`), a: T(`$${eqY(m, c)}$`), w: T(`Gradient $= ${frT(m)}$`, `Kecerunan $= ${frT(m)}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 8) * r.pick([1, -1]);
      const m = mF(b, a);
      return { q: T(`Find the equation of the line that cuts the $x$-axis at $(${a}, 0)$ and the $y$-axis at $(0, ${b})$.`, `Cari persamaan garis yang memotong paksi-$x$ di $(${a}, 0)$ dan paksi-$y$ di $(0, ${b})$.`), a: T(`$${eqY(mF(-b, a), mF(b, 1))}$`), w: T(`Gradient $= \\dfrac{0 - ${SPM.par(b)}}{${a} - 0}$`), sp: 'm' };
    },
  ];
  const g92e = [
    (r) => {
      const m = r.nz(-4, 4), c1 = r.int(-5, 5), c2 = r.int(-5, 5), m2 = r.pick([m, m + r.pick([1, 2, -1])]);
      need(m2 !== 0);
      const par = m === m2 && c1 !== c2;
      return { q: T(`Are the lines $y = ${poly([[m, 'x'], [c1, '']])}$ and $y = ${poly([[m2, 'x'], [c2, '']])}$ parallel? Give a reason.`, `Adakah garis $y = ${poly([[m, 'x'], [c1, '']])}$ dan $y = ${poly([[m2, 'x'], [c2, '']])}$ selari? Berikan sebab.`), a: par ? T(`Yes: both have gradient ${m}.`, `Ya: kedua-duanya berkecerunan ${m}.`) : m === m2 ? T('They have the same gradient and the same intercept: the same line.', 'Kedua-duanya mempunyai kecerunan dan pintasan yang sama: garis yang sama.') : T(`No: the gradients are ${m} and ${m2}.`, `Tidak: kecerunannya ialah ${m} dan ${m2}.`), sp: 's' };
    },
  ];
  const g92m = [
    (r) => {
      const m = r.nz(-4, 4), c = r.int(-4, 4), P = [r.int(-4, 4), r.int(-4, 4)];
      return { q: T(`Find the equation of the line passing through $${pt(P)}$ and parallel to $y = ${poly([[m, 'x'], [c, '']])}$.`, `Cari persamaan garis yang melalui $${pt(P)}$ dan selari dengan $y = ${poly([[m, 'x'], [c, '']])}$.`), a: T(`$y = ${poly([[m, 'x'], [P[1] - m * P[0], '']])}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5), c = r.int(4, 12);
      need(a !== b);
      const m = mF(-a, b);
      const P = [b * r.int(-2, 2), r.int(-3, 3)];
      const cc = Fr.sub(mF(P[1], 1), Fr.mul(m, mF(P[0], 1)));
      return { q: T(`Find the equation of the line through $${pt(P)}$ parallel to $${a}x + ${b}y = ${c}$.`, `Cari persamaan garis yang melalui $${pt(P)}$ selari dengan $${a}x + ${b}y = ${c}$.`), a: T(`$${eqY(m, cc)}$`), sp: 'm' };
    },
  ];
  const g92a = [
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5), k = r.nz(-6, 6);
      // kx + ... line 1: y = a x + b ; line 2: 2y = (k)x + 3 -> parallel when k/2 = a  -> k = 2a
      return { q: T(`The lines $y = ${a}x + ${b}$ and $2y = kx + 3$ are parallel. Find $k$.`, `Garis $y = ${a}x + ${b}$ dan $2y = kx + 3$ adalah selari. Cari $k$.`), a: T(`$k = ${2 * a}$`), w: T(`Gradient of the second line $= \\dfrac{k}{2} = ${a}$`, `Kecerunan garis kedua $= \\dfrac{k}{2} = ${a}$`), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-3, 3), c = r.int(-3, 3), P = [r.int(1, 4), r.int(-3, 3)];
      const c2 = P[1] - m * P[0];
      // parallel line through P meets y-axis at c2 ; and x-axis
      const xi = mF(-c2, m);
      return { q: T(`A line through $${pt(P)}$ is parallel to $y = ${poly([[m, 'x'], [c, '']])}$. Find its equation and the coordinates of the point where it crosses the $x$-axis.`, `Satu garis melalui $${pt(P)}$ adalah selari dengan $y = ${poly([[m, 'x'], [c, '']])}$. Cari persamaannya dan koordinat titik apabila ia memotong paksi-$x$.`), a: T(`$y = ${poly([[m, 'x'], [c2, '']])}$; $(${frT(xi)}, 0)$`), sp: 'm' };
    },
  ];
  const g92Ee = [
    (r) => {
      const m = r.pick([2, 3, 4, -2, -3, 1]);
      const P = [r.int(-3, 3), r.int(-3, 3)];
      const pm = Fr.neg(mF(1, m));
      const c = Fr.sub(mF(P[1], 1), Fr.mul(pm, mF(P[0], 1)));
      return { q: T(`Find the gradient of a line perpendicular to $y = ${poly([[m, 'x'], [1, '']])}$, and the equation of the perpendicular line through $${pt(P)}$.`, `Cari kecerunan garis yang serenjang dengan $y = ${poly([[m, 'x'], [1, '']])}$, dan persamaan garis serenjang yang melalui $${pt(P)}$.`), a: T(`Gradient $${frT(pm)}$; $${eqY(pm, c)}$`, `Kecerunan $${frT(pm)}$; $${eqY(pm, c)}$`), sp: 'm' };
    },
  ];
  const solve2 = (a1, b1, c1, a2, b2, c2) => { const det = a1 * b2 - a2 * b1; return [mF(c1 * b2 - c2 * b1, det), mF(a1 * c2 - a2 * c1, det)]; };
  const sys = (a1, b1, c1, a2, b2, c2) => `\\begin{cases} ${poly([[a1, 'x'], [b1, 'y']])} = ${c1} \\\\ ${poly([[a2, 'x'], [b2, 'y']])} = ${c2} \\end{cases}`;
  const g93e = [
    (r) => {
      const p = r.int(1, 5), q = r.int(1, 6), k = r.int(1, 3);
      // y = x + k' and x + y = s
      const s = p + q;
      const kk = q - p;
      return { q: T(`Find the point of intersection of the lines $y = x ${kk < 0 ? '-' : '+'} ${Math.abs(kk)}$ and $x + y = ${s}$.`, `Cari titik persilangan garis $y = x ${kk < 0 ? '-' : '+'} ${Math.abs(kk)}$ dan $x + y = ${s}$.`), a: T(`$(${p}, ${q})$`), sp: 'm' };
    },
  ];
  const g93m = [
    (r) => {
      const p = r.int(-4, 5), q = r.int(-4, 5), a1 = r.int(1, 4), b1 = r.int(1, 4), a2 = a1, b2 = -b1 * r.pick([1, 2]);
      need(b2 !== -b1 * 0 && (a1 * b2 - a2 * b1) !== 0);
      return { q: T(`Find the point of intersection of $${poly([[a1, 'x'], [b1, 'y']])} = ${a1 * p + b1 * q}$ and $${poly([[a2, 'x'], [b2, 'y']])} = ${a2 * p + b2 * q}$.`, `Cari titik persilangan bagi $${poly([[a1, 'x'], [b1, 'y']])} = ${a1 * p + b1 * q}$ dan $${poly([[a2, 'x'], [b2, 'y']])} = ${a2 * p + b2 * q}$.`), a: T(`$(${p}, ${q})$`), sp: 'l' };
    },
  ];
  const g93a = [
    (r) => {
      return retry(() => {
        const p = r.int(-4, 5), q = r.int(-4, 5), a1 = r.int(2, 5), b1 = r.int(2, 5), a2 = r.int(2, 5), b2 = -r.int(2, 5);
        need(a1 * b2 - a2 * b1 !== 0 && Math.abs(a1) !== Math.abs(a2));
        return { q: T(`Solve $${sys(a1, b1, a1 * p + b1 * q, a2, b2, a2 * p + b2 * q)}$ and state the coordinates of the point of intersection of the two lines.`, `Selesaikan $${sys(a1, b1, a1 * p + b1 * q, a2, b2, a2 * p + b2 * q)}$ dan nyatakan koordinat titik persilangan kedua-dua garis itu.`), a: T(`$(${p}, ${q})$`), sp: 'l' };
      });
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 6), na = r.int(1, 3), nb = r.int(2, 4);
      need(a * nb !== b * na);
      const px = a * 2 + b * 3, py = na * 2 + nb * 3;
      const [x, y] = solve2(a, b, px, na, nb, py);
      return { q: T(`Two families buy tickets: ${a} adult and ${b} child tickets cost RM${px}; ${na} adult and ${nb} child tickets cost RM${py}. Form two equations and find the price of each ticket.`, `Dua buah keluarga membeli tiket: ${a} tiket dewasa dan ${b} tiket kanak-kanak berharga RM${px}; ${na} tiket dewasa dan ${nb} tiket kanak-kanak berharga RM${py}. Bentukkan dua persamaan dan cari harga setiap tiket.`), a: T(`Adult RM${frT(x)}, child RM${frT(y)}`, `Dewasa RM${frT(x)}, kanak-kanak RM${frT(y)}`), sp: 'xl' };
    },
  ];
  SPM.addChapter(3, 9, T('Straight Lines', 'Garis Lurus'), [
    { id: '9.1', en: 'Equation of a straight line', ms: 'Persamaan garis lurus', gen: { e: g91e, m: g91m, a: g91a } },
    { id: '9.2', en: 'Parallel lines', ms: 'Garis selari', gen: { e: g92e, m: g92m, a: g92a } },
    { id: '9.2E', en: 'Perpendicular lines', ms: 'Garis serenjang', scope: 'enrichment', gen: { e: g92Ee, m: g92Ee, a: g92Ee } },
    { id: '9.3', en: 'Intersection of straight lines', ms: 'Persilangan garis lurus', gen: { e: g93e, m: g93m, a: g93a } },
  ]);
})();
