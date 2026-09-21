/* Form 2 – Chapters 11 to 13 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, sum, gcd, mean, median, sortNum, Fr } = SPM;
  const S = SPM.svg;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const pt = (p) => `(${n(p[0])}, ${n(p[1])})`;
  const pts = (list) => list.map(pt).join(',\\ ');
  const frT = Fr.tex;

  /* =============================================================== 11 */
  const NAMES = ['A', 'B', 'C', 'D'];
  const rot = (p, c, d) => {
    const dx = p[0] - c[0], dy = p[1] - c[1];
    const [x, y] = d === 90 ? [-dy, dx] : d === 180 ? [-dx, -dy] : [dy, -dx];
    return [c[0] + x, c[1] + y];
  };
  const refl = (p, line) => {
    if (line === 'x-axis') return [p[0], -p[1]];
    if (line === 'y-axis') return [-p[0], p[1]];
    if (line === 'y=x') return [p[1], p[0]];
    if (line === 'y=-x') return [-p[1], -p[0]];
    const m = /^([xy])=(-?\d+)$/.exec(line);
    return m[1] === 'x' ? [2 * +m[2] - p[0], p[1]] : [p[0], 2 * +m[2] - p[1]];
  };
  const inWin = (list, lim) => list.every((p) => Math.abs(p[0]) <= lim && Math.abs(p[1]) <= lim);
  const tri = (r, lim) => retry(() => {
    const P = [0, 1, 2].map(() => [r.int(-lim, lim), r.int(-lim, lim)]);
    const area2 = (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1]);
    need(Math.abs(area2) >= 4 && new Set(P.map(String)).size === 3);
    return P;
  });
  /** figure with object (solid) and optional image (dashed) */
  const trFig = (obj, img, extra) => {
    const win = 8;
    const polys = [{ p: obj }];
    const points = obj.map((p, i) => ({ x: p[0], y: p[1], l: NAMES[i], dx: 8, dy: -9 }));
    if (img) {
      polys.push({ p: img, dash: true });
      img.forEach((p, i) => points.push({ x: p[0], y: p[1], l: NAMES[i] + "'", dx: 9, dy: -9 }));
    }
    return S.plane({ x: [-win, win], y: [-win, win], scale: 15, labelStep: 2, polys, pts: points, lines: (extra && extra.lines) || [], vlines: (extra && extra.vlines) || [] });
  };
  const tvec = (v) => `\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix}`;

  const g111e = [
    (r) => {
      const bank = [
        [T('A shape slides 4 units to the right and 2 units up without turning.', 'Sebuah bentuk digelongsor 4 unit ke kanan dan 2 unit ke atas tanpa berputar.'), T('translation', 'translasi')],
        [T('A shape is flipped over a mirror line.', 'Sebuah bentuk dibalikkan pada garis cermin.'), T('reflection', 'pantulan')],
        [T('A shape is turned through a quarter-turn about a fixed point.', 'Sebuah bentuk diputarkan satu per empat pusingan pada satu titik tetap.'), T('rotation', 'putaran')],
      ];
      const b = r.pick(bank);
      return { q: T(`Name the transformation: ${b[0].en}`, `Namakan transformasi: ${b[0].ms}`), a: b[1], sp: 'xs' };
    },
    (r) => {
      const t = r.pick([['translation', 'translasi', true], ['reflection', 'pantulan', true], ['rotation', 'putaran', true], ['enlargement', 'pembesaran', false]]);
      return { q: T(`Is a ${t[0]} an isometry? Give a reason.`, `Adakah ${t[1]} suatu isometri? Berikan sebab.`), a: t[2] ? T('Yes: the image has the same shape and size as the object (lengths and angles are preserved).', 'Ya: imej mempunyai bentuk dan saiz yang sama dengan objek (panjang dan sudut dikekalkan).') : T('No: the size of the image differs from the object, so lengths are not preserved.', 'Tidak: saiz imej berbeza daripada objek, jadi panjang tidak dikekalkan.'), sp: 's' };
    },
  ];
  const g111m = [
    (r) => {
      const t = r.pick([['reflection', 'pantulan', 'orientation (the image is a mirror image)', 'orientasi (imej ialah imej cermin)'], ['translation', 'translasi', 'position only; orientation and size stay the same', 'kedudukan sahaja; orientasi dan saiz kekal sama'], ['rotation', 'putaran', 'position and direction it faces; size and shape stay the same', 'kedudukan dan arah yang dihadapi; saiz dan bentuk kekal sama']]);
      return { q: T(`Under a ${t[0]}, side lengths and angles do not change. State what does change.`, `Di bawah ${t[1]}, panjang sisi dan sudut tidak berubah. Nyatakan apakah yang berubah.`), a: T(t[2], t[3]), sp: 's' };
    },
    (r) => {
      const O = tri(r, 3), I = O.map((p) => [p[0] + 3, p[1] - 2]);
      return { q: T(`Triangle $ABC$ is mapped to triangle $A'B'C'$ as shown. Name the vertex that corresponds to $B$, and state two properties preserved by the transformation.`, `Segi tiga $ABC$ dipetakan kepada segi tiga $A'B'C'$ seperti yang ditunjukkan. Namakan bucu yang sepadan dengan $B$, dan nyatakan dua sifat yang dikekalkan oleh transformasi itu.`), fig: trFig(O, I), a: T(`$B'$; side lengths and angle sizes are preserved`, `$B'$; panjang sisi dan saiz sudut dikekalkan`), sp: 's' };
    },
  ];
  const g111a = [
    (r) => {
      const O = [[0, 0], [2, 0], [0, 2]].map((p) => [p[0] + r.int(-2, 1), p[1] + r.int(-2, 1)]);
      const I = [O[0], [O[0][0] + 4, O[0][1]], [O[0][0], O[0][1] + 4]];
      return { q: T(`Triangle $ABC$ with vertices $${pts(O)}$ is mapped to $A'B'C'$ with vertices $${pts(I)}$. Show that the mapping is not an isometry by comparing the lengths of $AB$ and $A'B'$.`, `Segi tiga $ABC$ dengan bucu $${pts(O)}$ dipetakan kepada $A'B'C'$ dengan bucu $${pts(I)}$. Tunjukkan bahawa pemetaan itu bukan isometri dengan membandingkan panjang $AB$ dan $A'B'$.`), a: T('$AB = 2$ but $A\'B\' = 4$: the length changes, so it is not an isometry.', '$AB = 2$ tetapi $A\'B\' = 4$: panjang berubah, jadi ia bukan isometri.'), sp: 'm' };
    },
  ];
  const g112e = [
    (r) => {
      const P = [r.int(-4, 4), r.int(-4, 4)], v = [r.int(-4, 4), r.int(-4, 4)];
      need(v[0] !== 0 || v[1] !== 0);
      return { q: T(`Find the image of $P = ${pt(P)}$ under the translation $${tvec(v)}$.`, `Cari imej bagi $P = ${pt(P)}$ di bawah translasi $${tvec(v)}$.`), a: T(`$${pt([P[0] + v[0], P[1] + v[1]])}$`), sp: 's' };
    },
  ];
  const g112m = [
    (r) => {
      const O = tri(r, 3), v = [r.int(-4, 4), r.int(-4, 4)];
      need(v[0] !== 0 || v[1] !== 0);
      const I = O.map((p) => [p[0] + v[0], p[1] + v[1]]);
      need(inWin(I, 8));
      return { q: T(`Triangle $ABC$ is shown. Find the coordinates of its image under the translation $${tvec(v)}$.`, `Segi tiga $ABC$ ditunjukkan. Cari koordinat imejnya di bawah translasi $${tvec(v)}$.`), fig: trFig(O, null), a: T(`$${pts(I)}$`), sp: 'm' };
    },
    (r) => {
      const P = [r.int(-4, 4), r.int(-4, 4)], v = [r.int(-5, 5), r.int(-5, 5)];
      need(v[0] !== 0 || v[1] !== 0);
      const Q = [P[0] + v[0], P[1] + v[1]];
      return { q: T(`$P = ${pt(P)}$ is mapped to $P' = ${pt(Q)}$ by a translation. Write the translation vector.`, `$P = ${pt(P)}$ dipetakan kepada $P' = ${pt(Q)}$ oleh satu translasi. Tulis vektor translasi itu.`), a: T(`$${tvec(v)}$`), sp: 's' };
    },
  ];
  const g112a = [
    (r) => {
      const I = tri(r, 4), v = [r.int(-5, 5), r.int(-5, 5)];
      need(v[0] !== 0 && v[1] !== 0);
      const O = I.map((p) => [p[0] - v[0], p[1] - v[1]]);
      need(inWin(O, 8) && O.some((p) => p[0] < 0) && O.some((p) => p[0] > 0));
      return { q: T(`Triangle $A'B'C'$ with vertices $${pts(I)}$ is the image of $ABC$ under the translation $${tvec(v)}$. Find the coordinates of $A$, $B$ and $C$.`, `Segi tiga $A'B'C'$ dengan bucu $${pts(I)}$ ialah imej bagi $ABC$ di bawah translasi $${tvec(v)}$. Cari koordinat $A$, $B$ dan $C$.`), a: T(`$${pts(O)}$`), w: T('Subtract the vector from each image point.', 'Tolak vektor daripada setiap titik imej.'), sp: 'm' };
    },
  ];
  const g113e = [
    (r) => {
      const O = tri(r, 4), ax = r.pick(['x-axis', 'y-axis']);
      const I = O.map((p) => refl(p, ax));
      return { q: T(`Find the coordinates of the image of triangle $ABC$ under a reflection in the ${ax === 'x-axis' ? '$x$-axis' : '$y$-axis'}.`, `Cari koordinat imej bagi segi tiga $ABC$ di bawah pantulan pada ${ax === 'x-axis' ? 'paksi-$x$' : 'paksi-$y$'}.`), fig: trFig(O, null), a: T(`$${pts(I)}$`), sp: 'm' };
    },
    (r) => {
      const P = [r.nz(-6, 6), r.nz(-6, 6)], ax = r.pick(['x-axis', 'y-axis']);
      return { q: T(`Find the image of $${pt(P)}$ under a reflection in the ${ax === 'x-axis' ? '$x$-axis' : '$y$-axis'}.`, `Cari imej bagi $${pt(P)}$ di bawah pantulan pada ${ax === 'x-axis' ? 'paksi-$x$' : 'paksi-$y$'}.`), a: T(`$${pt(refl(P, ax))}$`), sp: 's' };
    },
  ];
  const g113m = [
    (r) => {
      const k = r.int(-3, 3), horiz = r.chance();
      const line = (horiz ? 'y=' : 'x=') + k;
      const P = [r.int(-5, 5), r.int(-5, 5)];
      return { q: T(`Find the image of $${pt(P)}$ under a reflection in the line $${horiz ? 'y' : 'x'} = ${k}$.`, `Cari imej bagi $${pt(P)}$ di bawah pantulan pada garis $${horiz ? 'y' : 'x'} = ${k}$.`), a: T(`$${pt(refl(P, line))}$`), w: T(`Distance to the line is preserved on the other side.`, `Jarak ke garis dikekalkan di sebelah yang satu lagi.`), sp: 's' };
    },
    (r) => {
      const k = r.int(-3, 3), P = [r.int(-5, 5), r.int(-4, 4)];
      const Q = [2 * k - P[0], P[1]];
      need(Q[0] !== P[0]);
      return { q: T(`$P = ${pt(P)}$ is mapped to $P' = ${pt(Q)}$ by a reflection. Find the equation of the mirror line.`, `$P = ${pt(P)}$ dipetakan kepada $P' = ${pt(Q)}$ oleh satu pantulan. Cari persamaan garis cermin.`), a: T(`$x = ${k}$`), w: T('The mirror line is the perpendicular bisector of $PP\'$.', 'Garis cermin ialah pembahagi dua sama serenjang bagi $PP\'$.'), sp: 's' };
    },
  ];
  const g113a = [
    (r) => {
      const O = tri(r, 4), line = r.pick(['y=x', 'y=-x']);
      const I = O.map((p) => refl(p, line));
      return { q: T(`Triangle $A'B'C'$ with vertices $${pts(I)}$ is the image of $ABC$ under a reflection in the line $${line.replace('=', ' = ')}$. Find the coordinates of $A$, $B$ and $C$.`, `Segi tiga $A'B'C'$ dengan bucu $${pts(I)}$ ialah imej bagi $ABC$ di bawah pantulan pada garis $${line.replace('=', ' = ')}$. Cari koordinat $A$, $B$ dan $C$.`), a: T(`$${pts(O)}$`), w: T(line === 'y=x' ? 'Reflection in $y = x$ swaps $x$ and $y$.' : 'Reflection in $y = -x$ maps $(x, y)$ to $(-y, -x)$.', line === 'y=x' ? 'Pantulan pada $y = x$ menukar $x$ dan $y$.' : 'Pantulan pada $y = -x$ memetakan $(x, y)$ kepada $(-y, -x)$.'), sp: 'm' };
    },
    (r) => {
      const a = r.int(1, 5), b = r.int(-5, -1);
      const P = [a, b], Q = [b, a];
      return { q: T(`$P = ${pt(P)}$ is reflected to $P' = ${pt(Q)}$. Find the equation of the mirror line and justify it.`, `$P = ${pt(P)}$ dipantulkan kepada $P' = ${pt(Q)}$. Cari persamaan garis cermin dan berikan justifikasi.`), a: T('$y = x$: the midpoint of $PP\'$ lies on it and $PP\'$ has gradient $-1$, perpendicular to the line.', '$y = x$: titik tengah $PP\'$ terletak padanya dan $PP\'$ mempunyai kecerunan $-1$, serenjang dengan garis itu.'), sp: 'm' };
    },
  ];
  const g114e = [
    (r) => {
      const P = [r.nz(-5, 5), r.nz(-5, 5)], d = r.pick([90, 180, 270]);
      const dir = d === 270 ? T('$270^\\circ$ anticlockwise (or $90^\\circ$ clockwise)', '$270^\\circ$ lawan arah jam (atau $90^\\circ$ ikut arah jam)') : T(`$${d}^\\circ$ anticlockwise`, `$${d}^\\circ$ lawan arah jam`);
      return { q: T(`Find the image of $${pt(P)}$ under a rotation of ${dir.en} about the origin.`, `Cari imej bagi $${pt(P)}$ di bawah putaran ${dir.ms} pada asalan.`), a: T(`$${pt(rot(P, [0, 0], d))}$`), sp: 's' };
    },
  ];
  const g114m = [
    (r) => {
      const C = [r.int(-3, 3), r.int(-3, 3)], P = [C[0] + r.int(1, 4), C[1] + r.int(-3, 3)], d = r.pick([90, 180]);
      return { q: T(`Find the image of $P = ${pt(P)}$ under a rotation of $${d}^\\circ$ anticlockwise about $C = ${pt(C)}$.`, `Cari imej bagi $P = ${pt(P)}$ di bawah putaran $${d}^\\circ$ lawan arah jam pada $C = ${pt(C)}$.`), a: T(`$${pt(rot(P, C, d))}$`), sp: 'm' };
    },
    (r) => {
      const P = [r.int(1, 5), r.int(1, 4)], d = r.pick([90, 180, 270]);
      const Q = rot(P, [0, 0], d);
      return { q: T(`$P = ${pt(P)}$ is mapped to $P' = ${pt(Q)}$ by a rotation about the origin. Describe the rotation fully (angle and direction).`, `$P = ${pt(P)}$ dipetakan kepada $P' = ${pt(Q)}$ oleh satu putaran pada asalan. Huraikan putaran itu sepenuhnya (sudut dan arah).`), a: T(d === 270 ? '$90^\\circ$ clockwise about the origin (or $270^\\circ$ anticlockwise)' : `$${d}^\\circ$ anticlockwise about the origin`, d === 270 ? '$90^\\circ$ ikut arah jam pada asalan (atau $270^\\circ$ lawan arah jam)' : `$${d}^\\circ$ lawan arah jam pada asalan`), sp: 's' };
    },
  ];
  const g114a = [
    (r) => {
      const C = [r.int(-3, 3), r.int(-3, 3)], P = [C[0] + r.int(1, 4), C[1] + r.int(-3, 3)], Q = [C[0] + r.int(-4, -1), C[1] + r.int(1, 4)], d = 90;
      need(P[1] !== C[1] || Q[0] !== C[0]);
      const P2 = rot(P, C, d), Q2 = rot(Q, C, d);
      return { q: T(`A rotation of $90^\\circ$ anticlockwise maps $P = ${pt(P)}$ to $P' = ${pt(P2)}$ and $Q = ${pt(Q)}$ to $Q' = ${pt(Q2)}$. Find the centre of rotation.`, `Satu putaran $90^\\circ$ lawan arah jam memetakan $P = ${pt(P)}$ kepada $P' = ${pt(P2)}$ dan $Q = ${pt(Q)}$ kepada $Q' = ${pt(Q2)}$. Cari pusat putaran.`), a: T(`Centre $${pt(C)}$`, `Pusat $${pt(C)}$`), w: T('The centre lies on the perpendicular bisector of $PP\'$ and of $QQ\'$.', 'Pusat terletak pada pembahagi dua sama serenjang bagi $PP\'$ dan $QQ\'$.'), sp: 'l' };
    },
    (r) => {
      const O = tri(r, 3), C = [r.int(-2, 2), r.int(-2, 2)];
      const I = O.map((p) => rot(p, C, 180));
      const M = [(O[0][0] + I[0][0]) / 2, (O[0][1] + I[0][1]) / 2];
      return { q: T(`Triangle $ABC$ with vertices $${pts(O)}$ is mapped to $A'B'C'$ with vertices $${pts(I)}$ by a half-turn ($180^\\circ$) rotation. Find the centre of the rotation.`, `Segi tiga $ABC$ dengan bucu $${pts(O)}$ dipetakan kepada $A'B'C'$ dengan bucu $${pts(I)}$ oleh putaran separuh pusingan ($180^\\circ$). Cari pusat putaran itu.`), a: T(`Centre $${pt(M)}$ (the midpoint of $AA'$)`, `Pusat $${pt(M)}$ (titik tengah $AA'$)`), sp: 'm' };
    },
  ];
  const SHAPES = [['equilateral triangle', 'segi tiga sama sisi', 3], ['square', 'segi empat sama', 4], ['regular pentagon', 'pentagon sekata', 5], ['regular hexagon', 'heksagon sekata', 6], ['regular octagon', 'oktagon sekata', 8], ['rectangle (not a square)', 'segi empat tepat (bukan segi empat sama)', 2], ['parallelogram (not a rhombus)', 'segi empat selari (bukan rombus)', 2]];
  const g115e = [
    (r) => {
      const s = r.pick(SHAPES);
      return { q: T(`State the order of rotational symmetry of a ${s[0]}.`, `Nyatakan peringkat simetri putaran bagi ${s[1]}.`), a: T(`${s[2]}`), sp: 'xs' };
    },
  ];
  const g115m = [
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8, 9, 10, 12]);
      return { q: T(`A figure has rotational symmetry of order ${k}. Find the smallest angle of rotation that maps the figure onto itself.`, `Sebuah rajah mempunyai simetri putaran peringkat ${k}. Cari sudut putaran terkecil yang memetakan rajah itu kepada dirinya sendiri.`), a: T(`$${n(round(360 / k, 2))}^\\circ$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8, 9, 10, 12, 15]);
      return { q: T(`The smallest angle of rotational symmetry of a figure is $${n(360 / k)}^\\circ$. State its order of rotational symmetry.`, `Sudut simetri putaran terkecil bagi sebuah rajah ialah $${n(360 / k)}^\\circ$. Nyatakan peringkat simetri putarannya.`), a: T(`${k}`), sp: 's' };
    },
  ];
  const g115a = [
    (r) => {
      const k = r.pick([4, 5, 6, 8]);
      const angs = range(1, k - 1).map((i) => n(round((360 * i) / k, 2)) + '^\\circ');
      return { q: T(`A design has rotational symmetry of order ${k}. List all the angles (less than $360^\\circ$) through which it can be rotated to coincide with itself, and explain why no smaller angle than $${n(round(360 / k, 2))}^\\circ$ works.`, `Sebuah reka bentuk mempunyai simetri putaran peringkat ${k}. Senaraikan semua sudut (kurang daripada $360^\\circ$) yang boleh diputarkan supaya reka bentuk itu bertindih dengan dirinya, dan terangkan mengapa tiada sudut yang lebih kecil daripada $${n(round(360 / k, 2))}^\\circ$ berkesan.`), a: T(`$${angs.join(',\\ ')}$. There are exactly ${k} positions in one full turn, equally spaced by $360^\\circ \\div ${k}$.`, `$${angs.join(',\\ ')}$. Terdapat tepat ${k} kedudukan dalam satu pusingan penuh, berjarak sama sebanyak $360^\\circ \\div ${k}$.`), sp: 'm' };
    },
  ];
  const TRI = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [7, 8, 9], [4, 6, 9]];
  const g116e = [
    (r) => {
      const a = r.pick(TRI), b = a.slice();
      const c = r.pick(TRI.filter((t) => t !== a));
      return { q: T(`Triangle $P$ has sides ${a.join(' cm, ')} cm and triangle $Q$ has sides ${b.join(' cm, ')} cm. Triangle $R$ has sides ${c.join(' cm, ')} cm. Which two triangles are congruent?`, `Segi tiga $P$ mempunyai sisi ${a.join(' cm, ')} cm dan segi tiga $Q$ mempunyai sisi ${b.join(' cm, ')} cm. Segi tiga $R$ mempunyai sisi ${c.join(' cm, ')} cm. Dua segi tiga manakah yang kongruen?`), a: T('$P$ and $Q$ (all three corresponding sides equal)', '$P$ dan $Q$ (ketiga-tiga sisi sepadan sama)'), sp: 's' };
    },
  ];
  const g116m = [
    (r) => {
      const a = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10]]);
      const kind = r.pick(['cong', 'sim', 'none']);
      const k = r.pick([2, 3]);
      const b = kind === 'cong' ? a.slice().reverse() : kind === 'sim' ? a.map((v) => v * k) : [a[0] + 1, a[1], a[2] + 1];
      const ans = { cong: T('Congruent', 'Kongruen'), sim: T(`Similar but not congruent (scale factor ${k})`, `Serupa tetapi tidak kongruen (faktor skala ${k})`), none: T('Neither', 'Tiada satu pun') }[kind];
      return { q: T(`Triangle $A$ has sides ${a.join(' cm, ')} cm and triangle $B$ has sides ${b.join(' cm, ')} cm. Classify the pair as congruent, similar only, or neither.`, `Segi tiga $A$ mempunyai sisi ${a.join(' cm, ')} cm dan segi tiga $B$ mempunyai sisi ${b.join(' cm, ')} cm. Kelaskan pasangan itu sebagai kongruen, serupa sahaja, atau tiada satu pun.`), a: ans, sp: 's' };
    },
  ];
  const g116a = [
    (r) => {
      const k = r.pick([2, 3]), a = r.pick([[3, 4], [5, 12], [6, 8]]);
      const c = Math.hypot(a[0], a[1]);
      const A = [[0, 0], [a[0], 0], [0, a[1]]], B = [[0, 0], [a[0] * k, 0], [0, a[1] * k]];
      return { q: T(`Right-angled triangle $ABC$ has vertices $${pts(A)}$ and $DEF$ has vertices $${pts(B)}$. Show that the triangles are similar but not congruent, and state the scale factor.`, `Segi tiga bersudut tegak $ABC$ mempunyai bucu $${pts(A)}$ dan $DEF$ mempunyai bucu $${pts(B)}$. Tunjukkan bahawa segi tiga itu serupa tetapi tidak kongruen, dan nyatakan faktor skala.`), a: T(`Both have a right angle; sides ${a[0]}, ${a[1]}, ${n(c)} and ${a[0] * k}, ${a[1] * k}, ${n(c * k)}: ratios all ${k}, so similar; sizes differ, so not congruent. Scale factor ${k}.`, `Kedua-duanya mempunyai sudut tegak; sisi ${a[0]}, ${a[1]}, ${n(c)} dan ${a[0] * k}, ${a[1] * k}, ${n(c * k)}: nisbah semuanya ${k}, jadi serupa; saiz berbeza, jadi tidak kongruen. Faktor skala ${k}.`), sp: 'm' };
    },
  ];
  SPM.addChapter(2, 11, T('Isometric Transformations', 'Transformasi Isometri'), [
    { id: '11.1', en: 'Transformations and isometries', ms: 'Transformasi dan isometri', gen: { e: g111e, m: g111m, a: g111a } },
    { id: '11.2', en: 'Translation', ms: 'Translasi', gen: { e: g112e, m: g112m, a: g112a } },
    { id: '11.3', en: 'Reflection', ms: 'Pantulan', gen: { e: g113e, m: g113m, a: g113a } },
    { id: '11.4', en: 'Rotation', ms: 'Putaran', gen: { e: g114e, m: g114m, a: g114a } },
    { id: '11.5', en: 'Rotational symmetry', ms: 'Simetri putaran', gen: { e: g115e, m: g115m, a: g115a } },
    { id: '11.6', en: 'Congruency and similarity', ms: 'Kekongruenan dan keserupaan', gen: { e: g116e, m: g116m, a: g116a } },
  ]);

  /* =============================================================== 12 */
  const list = (v) => v.join(',\\ ');
  const fmtMean = (x) => n(round(x, 2));
  const g121e = [
    (r) => {
      const k = r.int(4, 5);
      const vals = Array.from({ length: 20 }, () => r.int(1, k));
      const cnt = range(1, k).map((v) => vals.filter((x) => x === v).length);
      need(cnt.every((c) => c >= 1));
      const tab = (h) => SPM.table([['Tally', ...range(1, k).map(() => '')], [h[1], ...range(1, k).map(() => '')]], { head: [h[0], ...range(1, k)] });
      return { q: T(`The number of pets owned by 20 students: ${vals.join(', ')}. Complete the frequency table and check that the frequencies add up to 20.<br>${tab(['Pets', 'Frequency'])}`, `Bilangan haiwan peliharaan yang dimiliki oleh 20 orang murid: ${vals.join(', ')}. Lengkapkan jadual kekerapan dan semak bahawa jumlah kekerapan ialah 20.<br>${tab(['Haiwan', 'Kekerapan'])}`), a: T(range(1, k).map((v, i) => `${v}: ${cnt[i]}`).join('; ') + ' (total 20)', range(1, k).map((v, i) => `${v}: ${cnt[i]}`).join('; ') + ' (jumlah 20)'), sp: 's' };
    },
  ];
  const g121m = [
    (r) => {
      const vals = Array.from({ length: 20 }, () => r.int(31, 89));
      const bins = [[30, 39], [40, 49], [50, 59], [60, 69], [70, 79], [80, 89]];
      const cnt = bins.map(([a, b]) => vals.filter((v) => v >= a && v <= b).length);
      return { q: T(`The marks of 20 students in a test are: ${vals.join(', ')}. Construct a grouped frequency table using the class intervals 30–39, 40–49, …, 80–89.`, `Markah 20 orang murid dalam satu ujian ialah: ${vals.join(', ')}. Bina jadual kekerapan terkumpul menggunakan selang kelas 30–39, 40–49, …, 80–89.`), a: T(bins.map((b, i) => `${b[0]}–${b[1]}: ${cnt[i]}`).join('; '), bins.map((b, i) => `${b[0]}–${b[1]}: ${cnt[i]}`).join('; ')), sp: 'l' };
    },
  ];
  const g121a = [
    (r) => {
      const topics = [
        [T('how much time Form 2 students spend on homework each evening', 'jumlah masa murid Tingkatan 2 menghabiskan kerja rumah setiap petang'), T('minutes per evening (continuous)', 'minit setiap petang (selanjar)'), T('groups of 15 minutes (0–14, 15–29, …)', 'kumpulan 15 minit (0–14, 15–29, …)')],
        [T('the heights of Form 2 students', 'ketinggian murid Tingkatan 2'), T('height in cm (continuous)', 'ketinggian dalam cm (selanjar)'), T('groups of 5 cm (140–144, 145–149, …)', 'kumpulan 5 cm (140–144, 145–149, …)')],
      ];
      const t = r.pick(topics);
      return { q: T(`Plan a data collection to investigate ${t[0].en}. State the population, the variable and unit, the method of collection, and suitable class intervals for grouping. Justify your choices.`, `Rancang pengumpulan data untuk menyiasat ${t[0].ms}. Nyatakan populasi, pemboleh ubah dan unit, kaedah pengumpulan, dan selang kelas yang sesuai untuk pengumpulan data. Berikan justifikasi bagi pilihan anda.`), a: T(`Population: all Form 2 students (use a random sample from each class). Variable: ${t[1].en}. Method: a short questionnaire or measurement. Classes: ${t[2].en}, chosen so that there are about 5–8 equal-width classes.`, `Populasi: semua murid Tingkatan 2 (gunakan sampel rawak daripada setiap kelas). Pemboleh ubah: ${t[1].ms}. Kaedah: soal selidik ringkas atau pengukuran. Kelas: ${t[2].ms}, dipilih supaya terdapat kira-kira 5–8 kelas berlebar sama.`), sp: 'xl' };
    },
  ];
  const g122e = [
    (r) => {
      const v = Array.from({ length: r.int(5, 7) }, () => r.int(1, 9));
      const cnt = {};
      v.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1));
      const mx = Math.max(...Object.values(cnt));
      const modes = Object.keys(cnt).filter((k) => cnt[k] === mx);
      return { q: T(`Find the mode of the data: $${list(v)}$.`, `Cari mod bagi data: $${list(v)}$.`), a: modes.length === v.length ? T('No mode (every value occurs once)', 'Tiada mod (setiap nilai berlaku sekali)') : T(`$${modes.join(' \\text{ and } ')}$ (frequency ${mx})`, `$${modes.join(' \\text{ dan } ')}$ (kekerapan ${mx})`), sp: 's' };
    },
    (r) => {
      const v = Array.from({ length: r.pick([5, 7, 9]) }, () => r.int(2, 30));
      return { q: T(`Find the median of $${list(v)}$.`, `Cari median bagi $${list(v)}$.`), a: T(`$${n(median(v))}$ (ordered: $${list(sortNum(v))}$)`), sp: 's' };
    },
    (r) => {
      const k = r.pick([4, 5]);
      const v = retry(() => { const a = Array.from({ length: k }, () => r.int(1, 15)); need(sum(a) % k === 0 || false); return a; });
      return { q: T(`Find the mean of $${list(v)}$.`, `Cari min bagi $${list(v)}$.`), a: T(`$${n(sum(v) / k)}$`), sp: 's' };
    },
  ];
  const freqTab = (xs, fs, h) => SPM.table([[h[1], ...fs]], { head: [h[0], ...xs] });
  const g122m = [
    (r) => {
      const v = Array.from({ length: r.pick([6, 8, 10]) }, () => r.int(5, 40));
      return { q: T(`Find the median of $${list(v)}$.`, `Cari median bagi $${list(v)}$.`), a: T(`$${n(median(v))}$`), w: T(`Ordered: $${list(sortNum(v))}$; average of the two middle values`, `Tertib: $${list(sortNum(v))}$; purata dua nilai tengah`), sp: 's' };
    },
    (r) => {
      const xs = range(1, 5), fs = xs.map(() => r.int(1, 8));
      const tot = sum(fs), sx = sum(xs.map((x, i) => x * fs[i]));
      return { q: T(`The table shows the number of goals scored in some matches.<br>${freqTab(xs, fs, ['Goals', 'Frequency'])}<br>Find the mean number of goals per match, correct to 2 decimal places.`, `Jadual menunjukkan bilangan gol yang dijaringkan dalam beberapa perlawanan.<br>${freqTab(xs, fs, ['Gol', 'Kekerapan'])}<br>Cari min bilangan gol setiap perlawanan, betul kepada 2 tempat perpuluhan.`), a: T(`$\\dfrac{${sx}}{${tot}} = ${fmtMean(sx / tot)}$`), sp: 'm' };
    },
  ];
  const g122a = [
    (r) => {
      const n1 = r.int(10, 20), m1 = r.int(50, 80), n2 = r.int(10, 20), m2 = r.int(50, 80);
      const tot = n1 + n2, mean_ = (n1 * m1 + n2 * m2) / tot;
      return { q: T(`Class A has ${n1} students with a mean mark of ${m1} and Class B has ${n2} students with a mean mark of ${m2}. Find the mean mark of all ${tot} students, correct to 2 decimal places.`, `Kelas A mempunyai ${n1} orang murid dengan markah min ${m1} dan Kelas B mempunyai ${n2} orang murid dengan markah min ${m2}. Cari markah min bagi kesemua ${tot} orang murid, betul kepada 2 tempat perpuluhan.`), a: T(`${fmtMean(mean_)}`), w: T(`$\\dfrac{${n1} \\times ${m1} + ${n2} \\times ${m2}}{${tot}}$`), sp: 'm' };
    },
    (r) => {
      const k = r.int(5, 7), m = r.int(8, 15);
      const v = Array.from({ length: k - 1 }, () => r.int(m - 5, m + 5));
      const x = m * k - sum(v);
      need(x > 0);
      return { q: T(`The mean of ${k} numbers is ${m}. ${k - 1} of the numbers are $${list(v)}$. Find the remaining number.`, `Min bagi ${k} nombor ialah ${m}. ${k - 1} daripada nombor itu ialah $${list(v)}$. Cari nombor yang tinggal.`), a: T(`$${x}$`), w: T(`$${k} \\times ${m} - ${sum(v)}$`), sp: 'm' };
    },
  ];

  const classes = (lo, w, k) => range(0, k - 1).map((i) => [lo + i * w, lo + (i + 1) * w - 1]);
  const gTab = (cl, fs, h, extra) => SPM.table(cl.map((c, i) => [`${c[0]}–${c[1]}`, fs[i], ...(extra ? extra[i] : [])]), { head: [h[0], h[1], ...(extra ? h.slice(2) : [])] });
  const g123e = [
    (r) => {
      const cl = classes(r.pick([0, 10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const mi = fs.indexOf(Math.max(...fs));
      need(fs.filter((f) => f === Math.max(...fs)).length === 1);
      return { q: T(`The table shows the time (in minutes) taken by students to complete a task.<br>${gTab(cl, fs, ['Time', 'Frequency'])}<br>State the modal class and the midpoint of each class.`, `Jadual menunjukkan masa (dalam minit) yang diambil oleh murid untuk menyiapkan satu tugasan.<br>${gTab(cl, fs, ['Masa', 'Kekerapan'])}<br>Nyatakan kelas mod dan titik tengah bagi setiap kelas.`), a: T(`Modal class ${cl[mi][0]}–${cl[mi][1]}; midpoints ${cl.map((c) => (c[0] + c[1]) / 2).join(', ')}`, `Kelas mod ${cl[mi][0]}–${cl[mi][1]}; titik tengah ${cl.map((c) => (c[0] + c[1]) / 2).join(', ')}`), sp: 'm' };
    },
  ];
  const g123m = [
    (r) => {
      const cl = classes(r.pick([0, 10, 20]), 10, 4), fs = cl.map(() => r.int(2, 10));
      const mids = cl.map((c) => (c[0] + c[1]) / 2);
      const sx = sum(mids.map((m, i) => m * fs[i])), tot = sum(fs);
      return { q: T(`The table shows the marks of a group of students.<br>${gTab(cl, fs, ['Marks', 'Frequency'])}<br>Complete the midpoint column and estimate the mean mark.`, `Jadual menunjukkan markah sekumpulan murid.<br>${gTab(cl, fs, ['Markah', 'Kekerapan'])}<br>Lengkapkan lajur titik tengah dan anggarkan markah min.`), a: T(`Midpoints ${mids.join(', ')}; estimated mean $= \\dfrac{${sx}}{${tot}} = ${fmtMean(sx / tot)}$`, `Titik tengah ${mids.join(', ')}; min anggaran $= \\dfrac{${sx}}{${tot}} = ${fmtMean(sx / tot)}$`), sp: 'l' };
    },
  ];
  const g123a = [
    (r) => {
      const vals = Array.from({ length: 15 }, () => r.int(0, 39));
      const cl = classes(0, 10, 4);
      const fs = cl.map((c) => vals.filter((v) => v >= c[0] && v <= c[1]).length);
      const mids = cl.map((c) => (c[0] + c[1]) / 2);
      const sx = sum(mids.map((m, i) => m * fs[i]));
      return { q: T(`The number of texts sent by 15 students in a day: ${vals.join(', ')}. Group the data into the classes 0–9, 10–19, 20–29 and 30–39, and estimate the mean number of texts. Compare it with the exact mean.`, `Bilangan mesej yang dihantar oleh 15 orang murid dalam sehari: ${vals.join(', ')}. Kumpulkan data itu ke dalam kelas 0–9, 10–19, 20–29 dan 30–39, dan anggarkan min bilangan mesej. Bandingkan dengan min tepat.`), a: T(`Frequencies ${fs.join(', ')}; estimated mean ${fmtMean(sx / 15)}; exact mean ${fmtMean(sum(vals) / 15)}`, `Kekerapan ${fs.join(', ')}; min anggaran ${fmtMean(sx / 15)}; min tepat ${fmtMean(sum(vals) / 15)}`), sp: 'xl' };
    },
  ];
  const g124e = [
    (r) => {
      const c = r.pick([
        [T('the most popular shoe size to stock in a shop', 'saiz kasut paling popular untuk distok di sebuah kedai'), T('mode', 'mod'), T('it shows the most common value', 'ia menunjukkan nilai yang paling biasa')],
        [T('a typical house price when a few mansions are very expensive', 'harga rumah biasa apabila beberapa rumah agam sangat mahal'), T('median', 'median'), T('extreme values distort the mean', 'nilai ekstrem menjejaskan min')],
        [T('the average test mark of a class with no unusual marks', 'markah ujian purata bagi sebuah kelas tanpa markah luar biasa'), T('mean', 'min'), T('it uses every value', 'ia menggunakan setiap nilai')],
      ]);
      return { q: T(`Which measure is most suitable for ${c[0].en}: mean, median or mode? Give one reason.`, `Ukuran manakah yang paling sesuai untuk ${c[0].ms}: min, median atau mod? Berikan satu sebab.`), a: T(`${c[1].en}: ${c[2].en}.`, `${c[1].ms}: ${c[2].ms}.`), sp: 's' };
    },
  ];
  const g124m = [
    (r) => {
      const A = Array.from({ length: 7 }, () => r.int(40, 80)), B = Array.from({ length: 7 }, () => r.int(30, 90));
      const rng = (v) => Math.max(...v) - Math.min(...v);
      return { q: T(`The marks of two groups are: Group A: $${list(A)}$; Group B: $${list(B)}$. Find the mean and range of each group and say which group has more consistent marks.`, `Markah dua kumpulan ialah: Kumpulan A: $${list(A)}$; Kumpulan B: $${list(B)}$. Cari min dan julat bagi setiap kumpulan dan nyatakan kumpulan yang markahnya lebih konsisten.`), a: T(`A: mean ${fmtMean(mean(A))}, range ${rng(A)}; B: mean ${fmtMean(mean(B))}, range ${rng(B)}. ${rng(A) < rng(B) ? 'A' : rng(A) > rng(B) ? 'B' : 'Equal'} has the smaller range, so its marks are more consistent.`, `A: min ${fmtMean(mean(A))}, julat ${rng(A)}; B: min ${fmtMean(mean(B))}, julat ${rng(B)}. ${rng(A) < rng(B) ? 'A' : rng(A) > rng(B) ? 'B' : 'Sama'} mempunyai julat yang lebih kecil, jadi markahnya lebih konsisten.`), sp: 'l' };
    },
  ];
  const g124a = [
    (r) => {
      const v = Array.from({ length: 6 }, () => r.int(20, 35));
      const out = r.int(90, 120);
      const all = v.concat([out]);
      return { q: T(`A shop's daily sales (RM hundred) for 7 days are $${list(all)}$. Find the mean and median. Which is a better description of a typical day's sales, and why?`, `Jualan harian sebuah kedai (RM ratus) selama 7 hari ialah $${list(all)}$. Cari min dan median. Yang manakah menggambarkan jualan sehari yang biasa dengan lebih baik, dan mengapa?`), a: T(`Mean ${fmtMean(mean(all))}, median ${n(median(all))}. The median is better: the extreme value ${out} pulls the mean up.`, `Min ${fmtMean(mean(all))}, median ${n(median(all))}. Median lebih baik: nilai ekstrem ${out} menarik min ke atas.`), sp: 'l' };
    },
  ];
  const g125e = [
    (r) => {
      const v = Array.from({ length: 5 }, () => r.int(5, 20));
      const m = mean(v);
      need(Number.isInteger(m));
      return { q: T(`The mean of $${list(v)}$ is ${m}. What is the mean if another value equal to ${m} is added? Explain.`, `Min bagi $${list(v)}$ ialah ${m}. Apakah min jika satu nilai lain yang sama dengan ${m} ditambah? Terangkan.`), a: T(`Still ${m}: adding the mean itself does not change the mean.`, `Masih ${m}: menambah min itu sendiri tidak mengubah min.`), sp: 's' };
    },
  ];
  const g125m = [
    (r) => {
      const k = r.int(4, 6), m = r.int(8, 16);
      const v = Array.from({ length: k - 1 }, () => r.int(m - 4, m + 4));
      const x = m * k - sum(v);
      need(x > 0);
      return { q: T(`The mean of ${k} numbers is ${m}. ${k - 1} of the numbers are $${list(v)}$. Find the missing number.`, `Min bagi ${k} nombor ialah ${m}. ${k - 1} daripada nombor itu ialah $${list(v)}$. Cari nombor yang hilang.`), a: T(`$${x}$`), sp: 's' };
    },
    (r) => {
      const v = Array.from({ length: 5 }, () => r.int(4, 20));
      const k = r.pick([2, 3, 5]), add = r.pick([true, false]);
      return { q: T(`The mean of a data set is ${fmtMean(mean(v))}. Every value is ${add ? 'increased by' : 'multiplied by'} ${k}. Find the new mean.`, `Min bagi satu set data ialah ${fmtMean(mean(v))}. Setiap nilai ${add ? 'ditambah dengan' : 'didarab dengan'} ${k}. Cari min baharu.`), a: T(`${fmtMean(add ? mean(v) + k : mean(v) * k)}`), sp: 's' };
    },
  ];
  const g125a = [
    (r) => {
      const k = r.int(5, 8), m1 = r.int(10, 20), d = r.int(1, 3);
      const x = (m1 + d) * (k + 1) - m1 * k;
      return { q: T(`The mean of ${k} numbers is ${m1}. When one more number is included, the mean becomes ${m1 + d}. Find the new number.`, `Min bagi ${k} nombor ialah ${m1}. Apabila satu nombor lagi dimasukkan, min menjadi ${m1 + d}. Cari nombor baharu itu.`), a: T(`$${x}$`), w: T(`$${m1 + d} \\times ${k + 1} - ${m1} \\times ${k}$`), sp: 'm' };
    },
    (r) => {
      const v = Array.from({ length: 6 }, () => r.int(20, 30)).concat([r.int(60, 80)]);
      const out = v[6];
      const w = v.slice(0, 6);
      return { q: T(`The data $${list(v)}$ include one extreme value. Find the mean and median with and without ${out}. Which measure is affected more?`, `Data $${list(v)}$ mengandungi satu nilai ekstrem. Cari min dan median dengan dan tanpa ${out}. Ukuran yang manakah lebih terjejas?`), a: T(`With: mean ${fmtMean(mean(v))}, median ${n(median(v))}. Without: mean ${fmtMean(mean(w))}, median ${n(median(w))}. The mean changes more.`, `Dengan: min ${fmtMean(mean(v))}, median ${n(median(v))}. Tanpa: min ${fmtMean(mean(w))}, median ${n(median(w))}. Min lebih banyak berubah.`), sp: 'l' };
    },
  ];
  SPM.addChapter(2, 12, T('Measures of Central Tendencies', 'Sukatan Kecenderungan Memusat'), [
    { id: '12.1', en: 'Data collection and organisation', ms: 'Pengumpulan dan pengorganisasian data', gen: { e: g121e, m: g121m, a: g121a } },
    { id: '12.2', en: 'Measures of central tendencies', ms: 'Sukatan kecenderungan memusat', gen: { e: g122e, m: g122m, a: g122a } },
    { id: '12.3', en: 'Grouped data', ms: 'Data terkumpul', gen: { e: g123e, m: g123m, a: g123a } },
    { id: '12.4', en: 'Choosing, predicting and comparing', ms: 'Memilih, meramal dan membandingkan', gen: { e: g124e, m: g124m, a: g124a } },
    { id: '12.5', en: 'Effects of data changes', ms: 'Kesan perubahan data', gen: { e: g125e, m: g125m, a: g125a } },
  ]);

  /* =============================================================== 13 */
  const P = (a, b) => frT(Fr.make(a, b));
  const g131e = [
    (r) => {
      const o = r.pick([[T('a fair coin is tossed', 'sebiji syiling adil dilambung'), 'H, T'], [T('a fair die is rolled', 'sebiji dadu adil digolek'), '1, 2, 3, 4, 5, 6'], [T('a spinner with 4 equal sectors numbered 1 to 4 is spun', 'sebuah pemutar dengan 4 sektor sama bernombor 1 hingga 4 diputar'), '1, 2, 3, 4']]);
      return { q: T(`List the sample space when ${o[0].en}.`, `Senaraikan ruang sampel apabila ${o[0].ms}.`), a: T(`$\\{${o[1]}\\}$`), sp: 's' };
    },
  ];
  const g131m = [
    (r) => {
      const trials = r.pick([40, 50, 60, 100]);
      const heads = Math.round(trials * r.pick([0.42, 0.45, 0.48, 0.55, 0.6]));
      return { q: T(`A coin is tossed ${trials} times and lands heads ${heads} times. Find the experimental probability of heads, and compare it with the theoretical probability.`, `Sebiji syiling dilambung ${trials} kali dan mendarat kepala sebanyak ${heads} kali. Cari kebarangkalian eksperimen mendapat kepala, dan bandingkan dengan kebarangkalian teori.`), a: T(`Experimental $= \\dfrac{${heads}}{${trials}} = ${n(round(heads / trials, 3))}$; theoretical $= \\dfrac{1}{2} = 0.5$`, `Eksperimen $= \\dfrac{${heads}}{${trials}} = ${n(round(heads / trials, 3))}$; teori $= \\dfrac{1}{2} = 0.5$`), sp: 's' };
    },
  ];
  const g131a = [
    (r) => {
      const ns = [10, 50, 200, 1000];
      const hs = ns.map((k, i) => Math.round(k * (0.5 + [0.2, 0.08, 0.03, 0.008][i] * r.pick([-1, 1]))));
      const tab = (h) => SPM.table([[h[1], ...ns], [h[2], ...hs], [h[3], ...ns.map(() => '')]], { rowHead: true });
      return { q: T(`A coin is tossed several times. Complete the table of experimental probabilities of heads and describe what happens as the number of tosses increases.<br>${tab(['', 'Tosses', 'Heads', 'P(heads)'])}`, `Sebiji syiling dilambung beberapa kali. Lengkapkan jadual kebarangkalian eksperimen mendapat kepala dan huraikan apa yang berlaku apabila bilangan lambungan bertambah.<br>${tab(['', 'Lambungan', 'Kepala', 'P(kepala)'])}`), a: T(`${hs.map((h, i) => n(round(h / ns[i], 3))).join(', ')}. The experimental probability tends to get closer to the theoretical value 0.5 as the number of trials grows.`, `${hs.map((h, i) => n(round(h / ns[i], 3))).join(', ')}. Kebarangkalian eksperimen cenderung menghampiri nilai teori 0.5 apabila bilangan percubaan bertambah.`), sp: 'm' };
    },
  ];
  const g132e = [
    (r) => {
      const k = r.int(1, 6);
      return { q: T(`A fair die is rolled. Find the probability of getting ${k}.`, `Sebiji dadu adil digolek. Cari kebarangkalian mendapat ${k}.`), a: T(`$\\dfrac{1}{6}$`), sp: 's' };
    },
    (r) => {
      const red = r.int(2, 8), blue = r.int(2, 8);
      return { q: T(`A box contains ${red} red balls and ${blue} blue balls. A ball is picked at random. Find the probability that it is red.`, `Sebuah kotak mengandungi ${red} biji bola merah dan ${blue} biji bola biru. Sebiji bola dipilih secara rawak. Cari kebarangkalian bola itu berwarna merah.`), a: T(`$${P(red, red + blue)}$`), sp: 's' };
    },
  ];
  const g132m = [
    (r) => {
      const ev = r.pick([['an even number', 'nombor genap', [2, 4, 6]], ['a prime number', 'nombor perdana', [2, 3, 5]], ['a number greater than 4', 'nombor lebih besar daripada 4', [5, 6]], ['a multiple of 3', 'gandaan 3', [3, 6]]]);
      return { q: T(`A fair die is rolled. Find the probability of getting ${ev[0]}.`, `Sebiji dadu adil digolek. Cari kebarangkalian mendapat ${ev[1]}.`), a: T(`$${P(ev[2].length, 6)}$`), sp: 's' };
    },
    (r) => {
      const w = r.pick([['MATEMATIK', 9, 3], ['SEKOLAH', 7, 3], ['BADMINTON', 9, 3]]);
      const vow = w[0].split('').filter((c) => 'AEIOU'.includes(c)).length;
      return { q: T(`A letter is chosen at random from the word ${w[0]}. Find the probability that it is a vowel.`, `Satu huruf dipilih secara rawak daripada perkataan ${w[0]}. Cari kebarangkalian huruf itu ialah vokal.`), a: T(`$${P(vow, w[0].length)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([10, 12, 20, 25]);
      const ev = r.pick([['a multiple of 5', 'gandaan 5', (v) => v % 5 === 0], ['an even number', 'nombor genap', (v) => v % 2 === 0], ['a prime number', 'nombor perdana', SPM.isPrime]]);
      const cnt = range(1, k).filter(ev[2]).length;
      return { q: T(`A card is drawn at random from cards numbered 1 to ${k}. Find the probability that the number is ${ev[0]}.`, `Sekeping kad dipilih secara rawak daripada kad bernombor 1 hingga ${k}. Cari kebarangkalian nombor itu ialah ${ev[1]}.`), a: T(`$${P(cnt, k)}$`), sp: 's' };
    },
  ];
  const g132a = [
    (r) => {
      const other = r.int(4, 10), num = r.pick([[2, 5], [1, 3], [3, 7], [2, 3]]);
      const nn = Math.round((num[0] * other) / (num[1] - num[0]));
      need((num[0] * other) % (num[1] - num[0]) === 0);
      return { q: T(`A bag has ${other} red balls and some blue balls. The probability of picking a blue ball is $${P(num[0], num[1])}$. Find the number of blue balls.`, `Sebuah beg mengandungi ${other} biji bola merah dan beberapa biji bola biru. Kebarangkalian memilih bola biru ialah $${P(num[0], num[1])}$. Cari bilangan bola biru.`), a: T(`${nn}`), w: T(`$\\dfrac{n}{n + ${other}} = ${P(num[0], num[1])}$`), sp: 'm' };
    },
    (r) => {
      const trials = r.pick([60, 120, 300]);
      return { q: T(`A fair die is rolled ${trials} times. Estimate the number of times an even number is expected, and the number of times a 6 is expected.`, `Sebiji dadu adil digolek ${trials} kali. Anggarkan bilangan kali nombor genap dijangka muncul, dan bilangan kali 6 dijangka muncul.`), a: T(`Even: ${trials / 2}; 6: ${trials / 6}`, `Genap: ${trials / 2}; 6: ${trials / 6}`), sp: 'm' };
    },
  ];
  SPM.addChapter(2, 13, T('Simple Probability', 'Kebarangkalian Mudah'), [
    { id: '13.1', en: 'Experimental probability vs theoretical probability', ms: 'Kebarangkalian eksperimen lawan kebarangkalian teori', gen: { e: g131e, m: g131m, a: g131a } },
    { id: '13.2', en: 'Theoretical probability of equally likely outcomes', ms: 'Kebarangkalian teori bagi kesudahan sama boleh jadi', gen: { e: g132e, m: g132m, a: g132a } },
  ]);
})();
