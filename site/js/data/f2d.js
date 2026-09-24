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
  const W = SPM.lines, pv = SPM.par;

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
      return { q: T(`Name the transformation: ${b[0].en}`, `Namakan transformasi: ${b[0].ms}`), a: b[1], w: W(T('Match the movement: a slide is a translation, a flip over a line is a reflection, a turn about a point is a rotation.', 'Padankan pergerakan: gelongsoran ialah translasi, balikan pada satu garis ialah pantulan, putaran pada satu titik ialah putaran.'), T(`The description given is a ${b[1].en}.`, `Perihalan yang diberi ialah ${b[1].ms}.`)), sp: 'xs' };
    },
    (r) => {
      const t = r.pick([['translation', 'translasi', true], ['reflection', 'pantulan', true], ['rotation', 'putaran', true], ['enlargement', 'pembesaran', false]]);
      return { q: T(`Is a ${t[0]} an isometry? Give a reason.`, `Adakah ${t[1]} suatu isometri? Berikan sebab.`), a: t[2] ? T('Yes: the image has the same shape and size as the object (lengths and angles are preserved).', 'Ya: imej mempunyai bentuk dan saiz yang sama dengan objek (panjang dan sudut dikekalkan).') : T('No: the size of the image differs from the object, so lengths are not preserved.', 'Tidak: saiz imej berbeza daripada objek, jadi panjang tidak dikekalkan.'), w: W(T('An isometry keeps every length and every angle unchanged, so the image is congruent to the object.', 'Isometri mengekalkan setiap panjang dan setiap sudut, jadi imej kongruen dengan objek.'), t[2] ? T(`A ${t[0]} only moves, flips or turns the shape, so it is an isometry.`, `${SPM.cap(t[1])} hanya menggerakkan, membalikkan atau memutarkan bentuk itu, jadi ia suatu isometri.`) : T(`An ${t[0]} multiplies every length by the scale factor, so it is not an isometry.`, `${SPM.cap(t[1])} mendarabkan setiap panjang dengan faktor skala, jadi ia bukan isometri.`)), sp: 's' };
    },
  ];
  const g111m = [
    (r) => {
      const t = r.pick([['reflection', 'pantulan', 'orientation (the image is a mirror image)', 'orientasi (imej ialah imej cermin)'], ['translation', 'translasi', 'position only; orientation and size stay the same', 'kedudukan sahaja; orientasi dan saiz kekal sama'], ['rotation', 'putaran', 'position and direction it faces; size and shape stay the same', 'kedudukan dan arah yang dihadapi; saiz dan bentuk kekal sama']]);
      return { q: T(`Under a ${t[0]}, side lengths and angles do not change. State what does change.`, `Di bawah ${t[1]}, panjang sisi dan sudut tidak berubah. Nyatakan apakah yang berubah.`), a: T(t[2], t[3]), w: W(T(`A ${t[0]} is an isometry, so the image is congruent to the object: lengths and angles are fixed.`, `${SPM.cap(t[1])} ialah isometri, jadi imej kongruen dengan objek: panjang dan sudut adalah tetap.`), T(`What changes is the ${t[2]}.`, `Apa yang berubah ialah ${t[3]}.`)), sp: 's' };
    },
    (r) => {
      const O = tri(r, 3), I = O.map((p) => [p[0] + 3, p[1] - 2]);
      return { q: T(`Triangle $ABC$ is mapped to triangle $A'B'C'$ as shown. Name the vertex that corresponds to $B$, and state two properties preserved by the transformation.`, `Segi tiga $ABC$ dipetakan kepada segi tiga $A'B'C'$ seperti yang ditunjukkan. Namakan bucu yang sepadan dengan $B$, dan nyatakan dua sifat yang dikekalkan oleh transformasi itu.`), fig: trFig(O, I), a: T(`$B'$; side lengths and angle sizes are preserved`, `$B'$; panjang sisi dan saiz sudut dikekalkan`), w: W(T('Corresponding vertices are named in the same order: $A \\to A\'$, $B \\to B\'$, $C \\to C\'$.', 'Bucu sepadan dinamakan mengikut tertib yang sama: $A \\to A\'$, $B \\to B\'$, $C \\to C\'$.'), T('Every vertex has moved by the same slide, so the transformation is a translation, an isometry.', 'Setiap bucu bergerak dengan gelongsoran yang sama, jadi transformasi itu ialah translasi, suatu isometri.'), T('Therefore side lengths and angle sizes are preserved.', 'Oleh itu panjang sisi dan saiz sudut dikekalkan.')), sp: 's' };
    },
  ];
  const g111a = [
    (r) => {
      const O = [[0, 0], [2, 0], [0, 2]].map((p) => [p[0] + r.int(-2, 1), p[1] + r.int(-2, 1)]);
      const I = [O[0], [O[0][0] + 4, O[0][1]], [O[0][0], O[0][1] + 4]];
      return { q: T(`Triangle $ABC$ with vertices $${pts(O)}$ is mapped to $A'B'C'$ with vertices $${pts(I)}$. Show that the mapping is not an isometry by comparing the lengths of $AB$ and $A'B'$.`, `Segi tiga $ABC$ dengan bucu $${pts(O)}$ dipetakan kepada $A'B'C'$ dengan bucu $${pts(I)}$. Tunjukkan bahawa pemetaan itu bukan isometri dengan membandingkan panjang $AB$ dan $A'B'$.`), a: T('$AB = 2$ but $A\'B\' = 4$: the length changes, so it is not an isometry.', '$AB = 2$ tetapi $A\'B\' = 4$: panjang berubah, jadi ia bukan isometri.'), w: W(T(`$AB$: from $${pt(O[0])}$ to $${pt(O[1])}$, so $AB = 2$ units.`, `$AB$: dari $${pt(O[0])}$ ke $${pt(O[1])}$, jadi $AB = 2$ unit.`), T(`$A'B'$: from $${pt(I[0])}$ to $${pt(I[1])}$, so $A'B' = 4$ units.`, `$A'B'$: dari $${pt(I[0])}$ ke $${pt(I[1])}$, jadi $A'B' = 4$ unit.`), T('$AB \\neq A\'B\'$, so lengths are not preserved and the mapping is not an isometry.', '$AB \\neq A\'B\'$, jadi panjang tidak dikekalkan dan pemetaan itu bukan isometri.')), sp: 'm' };
    },
  ];
  const g112e = [
    (r) => {
      const P = [r.int(-4, 4), r.int(-4, 4)], v = [r.int(-4, 4), r.int(-4, 4)];
      need(v[0] !== 0 || v[1] !== 0);
      return { q: T(`Find the image of $P = ${pt(P)}$ under the translation $${tvec(v)}$.`, `Cari imej bagi $P = ${pt(P)}$ di bawah translasi $${tvec(v)}$.`), a: T(`$${pt([P[0] + v[0], P[1] + v[1]])}$`), w: W(T('Image $=$ object $+$ translation vector.', 'Imej $=$ objek $+$ vektor translasi.'), `$(${n(P[0])} + ${pv(v[0])},\\ ${n(P[1])} + ${pv(v[1])}) = ${pt([P[0] + v[0], P[1] + v[1]])}$`), sp: 's' };
    },
  ];
  const g112m = [
    (r) => {
      const O = tri(r, 3), v = [r.int(-4, 4), r.int(-4, 4)];
      need(v[0] !== 0 || v[1] !== 0);
      const I = O.map((p) => [p[0] + v[0], p[1] + v[1]]);
      need(inWin(I, 8));
      return { q: T(`Triangle $ABC$ is shown. Find the coordinates of its image under the translation $${tvec(v)}$.`, `Segi tiga $ABC$ ditunjukkan. Cari koordinat imejnya di bawah translasi $${tvec(v)}$.`), fig: trFig(O, null), a: T(`$${pts(I)}$`), w: W(T(`Add $${tvec(v)}$ to each vertex.`, `Tambah $${tvec(v)}$ kepada setiap bucu.`), ...O.map((p, i) => `$${NAMES[i]}${pt(p)} \\to ${NAMES[i]}'${pt(I[i])}$`)), sp: 'm' };
    },
    (r) => {
      const P = [r.int(-4, 4), r.int(-4, 4)], v = [r.int(-5, 5), r.int(-5, 5)];
      need(v[0] !== 0 || v[1] !== 0);
      const Q = [P[0] + v[0], P[1] + v[1]];
      return { q: T(`$P = ${pt(P)}$ is mapped to $P' = ${pt(Q)}$ by a translation. Write the translation vector.`, `$P = ${pt(P)}$ dipetakan kepada $P' = ${pt(Q)}$ oleh satu translasi. Tulis vektor translasi itu.`), a: T(`$${tvec(v)}$`), w: W(T('Translation vector $=$ image $-$ object.', 'Vektor translasi $=$ imej $-$ objek.'), `$\\begin{pmatrix} ${n(Q[0])} - ${pv(P[0])} \\\\ ${n(Q[1])} - ${pv(P[1])} \\end{pmatrix} = ${tvec(v)}$`), sp: 's' };
    },
  ];
  const g112a = [
    (r) => {
      const I = tri(r, 4), v = [r.int(-5, 5), r.int(-5, 5)];
      need(v[0] !== 0 && v[1] !== 0);
      const O = I.map((p) => [p[0] - v[0], p[1] - v[1]]);
      need(inWin(O, 8) && O.some((p) => p[0] < 0) && O.some((p) => p[0] > 0));
      return { q: T(`Triangle $A'B'C'$ with vertices $${pts(I)}$ is the image of $ABC$ under the translation $${tvec(v)}$. Find the coordinates of $A$, $B$ and $C$.`, `Segi tiga $A'B'C'$ dengan bucu $${pts(I)}$ ialah imej bagi $ABC$ di bawah translasi $${tvec(v)}$. Cari koordinat $A$, $B$ dan $C$.`), a: T(`$${pts(O)}$`), w: W(T(`Object $=$ image $-$ $${tvec(v)}$.`, `Objek $=$ imej $-$ $${tvec(v)}$.`), ...I.map((p, i) => `$${NAMES[i]}'${pt(p)} \\to ${NAMES[i]}${pt(O[i])}$`)), sp: 'm' };
    },
  ];
  const g113e = [
    (r) => {
      const O = tri(r, 4), ax = r.pick(['x-axis', 'y-axis']);
      const I = O.map((p) => refl(p, ax));
      return { q: T(`Find the coordinates of the image of triangle $ABC$ under a reflection in the ${ax === 'x-axis' ? '$x$-axis' : '$y$-axis'}.`, `Cari koordinat imej bagi segi tiga $ABC$ di bawah pantulan pada ${ax === 'x-axis' ? 'paksi-$x$' : 'paksi-$y$'}.`), fig: trFig(O, null), a: T(`$${pts(I)}$`), w: W(ax === 'x-axis' ? T('Reflection in the $x$-axis: $(x,\\ y) \\to (x,\\ -y)$.', 'Pantulan pada paksi-$x$: $(x,\\ y) \\to (x,\\ -y)$.') : T('Reflection in the $y$-axis: $(x,\\ y) \\to (-x,\\ y)$.', 'Pantulan pada paksi-$y$: $(x,\\ y) \\to (-x,\\ y)$.'), ...O.map((p, i) => `$${NAMES[i]}${pt(p)} \\to ${NAMES[i]}'${pt(I[i])}$`)), sp: 'm' };
    },
    (r) => {
      const P = [r.nz(-6, 6), r.nz(-6, 6)], ax = r.pick(['x-axis', 'y-axis']);
      return { q: T(`Find the image of $${pt(P)}$ under a reflection in the ${ax === 'x-axis' ? '$x$-axis' : '$y$-axis'}.`, `Cari imej bagi $${pt(P)}$ di bawah pantulan pada ${ax === 'x-axis' ? 'paksi-$x$' : 'paksi-$y$'}.`), a: T(`$${pt(refl(P, ax))}$`), w: W(ax === 'x-axis' ? T('Reflection in the $x$-axis: $(x,\\ y) \\to (x,\\ -y)$.', 'Pantulan pada paksi-$x$: $(x,\\ y) \\to (x,\\ -y)$.') : T('Reflection in the $y$-axis: $(x,\\ y) \\to (-x,\\ y)$.', 'Pantulan pada paksi-$y$: $(x,\\ y) \\to (-x,\\ y)$.'), `$${pt(P)} \\to ${pt(refl(P, ax))}$`), sp: 's' };
    },
  ];
  const g113m = [
    (r) => {
      const k = r.int(-3, 3), horiz = r.chance();
      const line = (horiz ? 'y=' : 'x=') + k;
      const P = [r.int(-5, 5), r.int(-5, 5)];
      return { q: T(`Find the image of $${pt(P)}$ under a reflection in the line $${horiz ? 'y' : 'x'} = ${k}$.`, `Cari imej bagi $${pt(P)}$ di bawah pantulan pada garis $${horiz ? 'y' : 'x'} = ${k}$.`), a: T(`$${pt(refl(P, line))}$`), w: W(T(`The mirror line is ${horiz ? 'horizontal' : 'vertical'}, so only the $${horiz ? 'y' : 'x'}$-coordinate changes.`, `Garis cermin itu ${horiz ? 'mengufuk' : 'menegak'}, jadi hanya koordinat-$${horiz ? 'y' : 'x'}$ berubah.`), T('The distance to the line is kept, on the other side.', 'Jarak ke garis itu dikekalkan, di sebelah yang satu lagi.'), `$${horiz ? 'y' : 'x'}' = 2(${n(k)}) - ${pv(horiz ? P[1] : P[0])} = ${n(2 * k - (horiz ? P[1] : P[0]))}$`, `$${pt(refl(P, line))}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(-3, 3), P = [r.int(-5, 5), r.int(-4, 4)];
      const Q = [2 * k - P[0], P[1]];
      need(Q[0] !== P[0]);
      return { q: T(`$P = ${pt(P)}$ is mapped to $P' = ${pt(Q)}$ by a reflection. Find the equation of the mirror line.`, `$P = ${pt(P)}$ dipetakan kepada $P' = ${pt(Q)}$ oleh satu pantulan. Cari persamaan garis cermin.`), a: T(`$x = ${k}$`), w: W(T('The mirror line is the perpendicular bisector of $PP\'$.', 'Garis cermin ialah pembahagi dua sama serenjang bagi $PP\'$.'), T('Only the $x$-coordinate changed, so the mirror line is vertical.', 'Hanya koordinat-$x$ berubah, jadi garis cermin itu menegak.'), `$x = \\dfrac{${pv(P[0])} + ${pv(Q[0])}}{2} = ${n(k)}$`), sp: 's' };
    },
  ];
  const g113a = [
    (r) => {
      const O = tri(r, 4), line = r.pick(['y=x', 'y=-x']);
      const I = O.map((p) => refl(p, line));
      return { q: T(`Triangle $A'B'C'$ with vertices $${pts(I)}$ is the image of $ABC$ under a reflection in the line $${line.replace('=', ' = ')}$. Find the coordinates of $A$, $B$ and $C$.`, `Segi tiga $A'B'C'$ dengan bucu $${pts(I)}$ ialah imej bagi $ABC$ di bawah pantulan pada garis $${line.replace('=', ' = ')}$. Cari koordinat $A$, $B$ dan $C$.`), a: T(`$${pts(O)}$`), w: W(T(line === 'y=x' ? 'Reflection in $y = x$ swaps the coordinates: $(x,\\ y) \\to (y,\\ x)$.' : 'Reflection in $y = -x$: $(x,\\ y) \\to (-y,\\ -x)$.', line === 'y=x' ? 'Pantulan pada $y = x$ menukar koordinat: $(x,\\ y) \\to (y,\\ x)$.' : 'Pantulan pada $y = -x$: $(x,\\ y) \\to (-y,\\ -x)$.'), T('A reflection is its own inverse, so apply the same rule to each image vertex.', 'Pantulan ialah songsangan dirinya sendiri, jadi gunakan hukum yang sama pada setiap bucu imej.'), ...I.map((p, i) => `$${NAMES[i]}'${pt(p)} \\to ${NAMES[i]}${pt(O[i])}$`)), sp: 'm' };
    },
    (r) => {
      const a = r.int(1, 5), b = r.int(-5, -1);
      const P = [a, b], Q = [b, a];
      return { q: T(`$P = ${pt(P)}$ is reflected to $P' = ${pt(Q)}$. Find the equation of the mirror line and justify it.`, `$P = ${pt(P)}$ dipantulkan kepada $P' = ${pt(Q)}$. Cari persamaan garis cermin dan berikan justifikasi.`), a: T('$y = x$: the midpoint of $PP\'$ lies on it and $PP\'$ has gradient $-1$, perpendicular to the line.', '$y = x$: titik tengah $PP\'$ terletak padanya dan $PP\'$ mempunyai kecerunan $-1$, serenjang dengan garis itu.'), w: W(T(`Midpoint of $PP'$: $\\left(\\dfrac{${pv(a)} + ${pv(b)}}{2},\\ \\dfrac{${pv(b)} + ${pv(a)}}{2}\\right) = ${pt([(a + b) / 2, (a + b) / 2])}$`), T(`Gradient of $PP'$: $\\dfrac{${pv(a)} - ${pv(b)}}{${pv(b)} - ${pv(a)}} = -1$`), T('The midpoint has equal coordinates, so it lies on $y = x$; and gradient $-1$ is perpendicular to the gradient $1$ of $y = x$.', 'Titik tengah mempunyai koordinat yang sama, jadi ia terletak pada $y = x$; dan kecerunan $-1$ serenjang dengan kecerunan $1$ bagi $y = x$.'), T('Mirror line: $y = x$', 'Garis cermin: $y = x$')), sp: 'm' };
    },
  ];
  const g114e = [
    (r) => {
      const P = [r.nz(-5, 5), r.nz(-5, 5)], d = r.pick([90, 180, 270]);
      const dir = d === 270 ? T('$270^\\circ$ anticlockwise (or $90^\\circ$ clockwise)', '$270^\\circ$ lawan arah jam (atau $90^\\circ$ ikut arah jam)') : T(`$${d}^\\circ$ anticlockwise`, `$${d}^\\circ$ lawan arah jam`);
      return { q: T(`Find the image of $${pt(P)}$ under a rotation of ${dir.en} about the origin.`, `Cari imej bagi $${pt(P)}$ di bawah putaran ${dir.ms} pada asalan.`), a: T(`$${pt(rot(P, [0, 0], d))}$`), w: W(T(`Rule about the origin: $(x,\\ y) \\to ${d === 90 ? '(-y,\\ x)' : d === 180 ? '(-x,\\ -y)' : '(y,\\ -x)'}$`, `Hukum pada asalan: $(x,\\ y) \\to ${d === 90 ? '(-y,\\ x)' : d === 180 ? '(-x,\\ -y)' : '(y,\\ -x)'}$`), `$${pt(P)} \\to ${pt(rot(P, [0, 0], d))}$`), sp: 's' };
    },
  ];
  const g114m = [
    (r) => {
      const C = [r.int(-3, 3), r.int(-3, 3)], P = [C[0] + r.int(1, 4), C[1] + r.int(-3, 3)], d = r.pick([90, 180]);
      const dd = [P[0] - C[0], P[1] - C[1]], rr = d === 90 ? [-dd[1], dd[0]] : [-dd[0], -dd[1]];
      return { q: T(`Find the image of $P = ${pt(P)}$ under a rotation of $${d}^\\circ$ anticlockwise about $C = ${pt(C)}$.`, `Cari imej bagi $P = ${pt(P)}$ di bawah putaran $${d}^\\circ$ lawan arah jam pada $C = ${pt(C)}$.`), a: T(`$${pt(rot(P, C, d))}$`), w: W(T(`Measure $P$ from the centre: $${pt(P)} - ${pt(C)} = ${pt(dd)}$`, `Ukur $P$ dari pusat: $${pt(P)} - ${pt(C)} = ${pt(dd)}$`), T(`Turn $${d}^\\circ$ anticlockwise: $(x,\\ y) \\to ${d === 90 ? '(-y,\\ x)' : '(-x,\\ -y)'}$, so $${pt(dd)} \\to ${pt(rr)}$`, `Putarkan $${d}^\\circ$ lawan arah jam: $(x,\\ y) \\to ${d === 90 ? '(-y,\\ x)' : '(-x,\\ -y)'}$, jadi $${pt(dd)} \\to ${pt(rr)}$`), T(`Add the centre back: $${pt(rr)} + ${pt(C)} = ${pt(rot(P, C, d))}$`, `Tambah semula pusat: $${pt(rr)} + ${pt(C)} = ${pt(rot(P, C, d))}$`)), sp: 'm' };
    },
    (r) => {
      const P = [r.int(1, 5), r.int(1, 4)], d = r.pick([90, 180, 270]);
      const Q = rot(P, [0, 0], d);
      return { q: T(`$P = ${pt(P)}$ is mapped to $P' = ${pt(Q)}$ by a rotation about the origin. Describe the rotation fully (angle and direction).`, `$P = ${pt(P)}$ dipetakan kepada $P' = ${pt(Q)}$ oleh satu putaran pada asalan. Huraikan putaran itu sepenuhnya (sudut dan arah).`), a: T(d === 270 ? '$90^\\circ$ clockwise about the origin (or $270^\\circ$ anticlockwise)' : `$${d}^\\circ$ anticlockwise about the origin`, d === 270 ? '$90^\\circ$ ikut arah jam pada asalan (atau $270^\\circ$ lawan arah jam)' : `$${d}^\\circ$ lawan arah jam pada asalan`), w: W(T(`Compare the coordinates: $${pt(P)} \\to ${pt(Q)}$`, `Bandingkan koordinat: $${pt(P)} \\to ${pt(Q)}$`), T(d === 90 ? 'This is the rule $(x,\\ y) \\to (-y,\\ x)$, a quarter-turn anticlockwise.' : d === 180 ? 'This is the rule $(x,\\ y) \\to (-x,\\ -y)$, a half-turn.' : 'This is the rule $(x,\\ y) \\to (y,\\ -x)$, a quarter-turn clockwise.', d === 90 ? 'Ini hukum $(x,\\ y) \\to (-y,\\ x)$, satu per empat pusingan lawan arah jam.' : d === 180 ? 'Ini hukum $(x,\\ y) \\to (-x,\\ -y)$, separuh pusingan.' : 'Ini hukum $(x,\\ y) \\to (y,\\ -x)$, satu per empat pusingan ikut arah jam.'), T('The origin is the only point left unmoved, so it is the centre of rotation.', 'Asalan ialah satu-satunya titik yang tidak bergerak, jadi ia pusat putaran.')), sp: 's' };
    },
  ];
  const g114a = [
    (r) => {
      const C = [r.int(-3, 3), r.int(-3, 3)], P = [C[0] + r.int(1, 4), C[1] + r.int(-3, 3)], Q = [C[0] + r.int(-4, -1), C[1] + r.int(1, 4)], d = 90;
      need(P[1] !== C[1] || Q[0] !== C[0]);
      const P2 = rot(P, C, d), Q2 = rot(Q, C, d);
      return { q: T(`A rotation of $90^\\circ$ anticlockwise maps $P = ${pt(P)}$ to $P' = ${pt(P2)}$ and $Q = ${pt(Q)}$ to $Q' = ${pt(Q2)}$. Find the centre of rotation.`, `Satu putaran $90^\\circ$ lawan arah jam memetakan $P = ${pt(P)}$ kepada $P' = ${pt(P2)}$ dan $Q = ${pt(Q)}$ kepada $Q' = ${pt(Q2)}$. Cari pusat putaran.`), a: T(`Centre $${pt(C)}$`, `Pusat $${pt(C)}$`), w: W(T('The centre of a rotation is equidistant from every point and its image.', 'Pusat putaran berada pada jarak yang sama daripada setiap titik dan imejnya.'), T('So it lies on the perpendicular bisector of $PP\'$ and also on the perpendicular bisector of $QQ\'$; draw both and take their point of intersection.', 'Jadi ia terletak pada pembahagi dua sama serenjang bagi $PP\'$ dan juga bagi $QQ\'$; lukis kedua-duanya dan ambil titik persilangannya.'), T(`Check: a $90^\\circ$ anticlockwise turn about $${pt(C)}$ sends $${pt(P)}$ to $${pt(P2)}$ and $${pt(Q)}$ to $${pt(Q2)}$.`, `Semak: putaran $90^\\circ$ lawan arah jam pada $${pt(C)}$ menghantar $${pt(P)}$ ke $${pt(P2)}$ dan $${pt(Q)}$ ke $${pt(Q2)}$.`), T(`Centre $= ${pt(C)}$`, `Pusat $= ${pt(C)}$`)), sp: 'l' };
    },
    (r) => {
      const O = tri(r, 3), C = [r.int(-2, 2), r.int(-2, 2)];
      const I = O.map((p) => rot(p, C, 180));
      const M = [(O[0][0] + I[0][0]) / 2, (O[0][1] + I[0][1]) / 2];
      return { q: T(`Triangle $ABC$ with vertices $${pts(O)}$ is mapped to $A'B'C'$ with vertices $${pts(I)}$ by a half-turn ($180^\\circ$) rotation. Find the centre of the rotation.`, `Segi tiga $ABC$ dengan bucu $${pts(O)}$ dipetakan kepada $A'B'C'$ dengan bucu $${pts(I)}$ oleh putaran separuh pusingan ($180^\\circ$). Cari pusat putaran itu.`), a: T(`Centre $${pt(M)}$ (the midpoint of $AA'$)`, `Pusat $${pt(M)}$ (titik tengah $AA'$)`), w: W(T('In a half-turn, the centre is the midpoint of every object–image pair.', 'Dalam separuh pusingan, pusat ialah titik tengah bagi setiap pasangan objek–imej.'), T(`Use $A${pt(O[0])}$ and $A'${pt(I[0])}$:`, `Gunakan $A${pt(O[0])}$ dan $A'${pt(I[0])}$:`), `$\\left(\\dfrac{${pv(O[0][0])} + ${pv(I[0][0])}}{2},\\ \\dfrac{${pv(O[0][1])} + ${pv(I[0][1])}}{2}\\right) = ${pt(M)}$`, T(`Centre $= ${pt(M)}$`, `Pusat $= ${pt(M)}$`)), sp: 'm' };
    },
  ];
  const SHAPES = [['equilateral triangle', 'segi tiga sama sisi', 3], ['square', 'segi empat sama', 4], ['regular pentagon', 'pentagon sekata', 5], ['regular hexagon', 'heksagon sekata', 6], ['regular octagon', 'oktagon sekata', 8], ['rectangle (not a square)', 'segi empat tepat (bukan segi empat sama)', 2], ['parallelogram (not a rhombus)', 'segi empat selari (bukan rombus)', 2]];
  const g115e = [
    (r) => {
      const s = r.pick(SHAPES);
      return { q: T(`State the order of rotational symmetry of a ${s[0]}.`, `Nyatakan peringkat simetri putaran bagi ${s[1]}.`), a: T(`${s[2]}`), w: W(T('The order of rotational symmetry is the number of positions in one full turn in which the shape looks exactly the same.', 'Peringkat simetri putaran ialah bilangan kedudukan dalam satu pusingan penuh yang menjadikan bentuk itu kelihatan serupa.'), T(`A ${s[0]} fits onto itself ${s[2]} times in $360^\\circ$, so the order is ${s[2]}.`, `${SPM.cap(s[1])} bertindih dengan dirinya ${s[2]} kali dalam $360^\\circ$, jadi peringkatnya ialah ${s[2]}.`)), sp: 'xs' };
    },
  ];
  const g115m = [
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8, 9, 10, 12]);
      return { q: T(`A figure has rotational symmetry of order ${k}. Find the smallest angle of rotation that maps the figure onto itself.`, `Sebuah rajah mempunyai simetri putaran peringkat ${k}. Cari sudut putaran terkecil yang memetakan rajah itu kepada dirinya sendiri.`), a: T(`$${n(round(360 / k, 2))}^\\circ$`), w: W(T('Smallest angle $= \\dfrac{360^\\circ}{\\text{order}}$', 'Sudut terkecil $= \\dfrac{360^\\circ}{\\text{peringkat}}$'), `$= \\dfrac{360^\\circ}{${k}} = ${n(round(360 / k, 2))}^\\circ$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8, 9, 10, 12, 15]);
      return { q: T(`The smallest angle of rotational symmetry of a figure is $${n(360 / k)}^\\circ$. State its order of rotational symmetry.`, `Sudut simetri putaran terkecil bagi sebuah rajah ialah $${n(360 / k)}^\\circ$. Nyatakan peringkat simetri putarannya.`), a: T(`${k}`), w: W(T('Order $= \\dfrac{360^\\circ}{\\text{smallest angle}}$', 'Peringkat $= \\dfrac{360^\\circ}{\\text{sudut terkecil}}$'), `$= \\dfrac{360^\\circ}{${n(360 / k)}^\\circ} = ${k}$`), sp: 's' };
    },
  ];
  const g115a = [
    (r) => {
      const k = r.pick([4, 5, 6, 8]);
      const angs = range(1, k - 1).map((i) => n(round((360 * i) / k, 2)) + '^\\circ');
      return { q: T(`A design has rotational symmetry of order ${k}. List all the angles (less than $360^\\circ$) through which it can be rotated to coincide with itself, and explain why no smaller angle than $${n(round(360 / k, 2))}^\\circ$ works.`, `Sebuah reka bentuk mempunyai simetri putaran peringkat ${k}. Senaraikan semua sudut (kurang daripada $360^\\circ$) yang boleh diputarkan supaya reka bentuk itu bertindih dengan dirinya, dan terangkan mengapa tiada sudut yang lebih kecil daripada $${n(round(360 / k, 2))}^\\circ$ berkesan.`), a: T(`$${angs.join(',\\ ')}$. There are exactly ${k} positions in one full turn, equally spaced by $360^\\circ \\div ${k}$.`, `$${angs.join(',\\ ')}$. Terdapat tepat ${k} kedudukan dalam satu pusingan penuh, berjarak sama sebanyak $360^\\circ \\div ${k}$.`), w: W(T(`Order ${k} means the design coincides with itself every $360^\\circ \\div ${k} = ${n(round(360 / k, 2))}^\\circ$.`, `Peringkat ${k} bermakna reka bentuk itu bertindih dengan dirinya setiap $360^\\circ \\div ${k} = ${n(round(360 / k, 2))}^\\circ$.`), T(`The multiples below $360^\\circ$ are $${angs.join(',\\ ')}$.`, `Gandaan di bawah $360^\\circ$ ialah $${angs.join(',\\ ')}$.`), T(`A smaller angle would give more than ${k} matching positions in one full turn, contradicting order ${k}.`, `Sudut yang lebih kecil akan memberikan lebih daripada ${k} kedudukan bertindih dalam satu pusingan penuh, bercanggah dengan peringkat ${k}.`)), sp: 'm' };
    },
  ];
  const TRI = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [7, 8, 9], [4, 6, 9]];
  const g116e = [
    (r) => {
      const a = r.pick(TRI), b = a.slice();
      const c = r.pick(TRI.filter((t) => t !== a));
      return { q: T(`Triangle $P$ has sides ${a.join(' cm, ')} cm and triangle $Q$ has sides ${b.join(' cm, ')} cm. Triangle $R$ has sides ${c.join(' cm, ')} cm. Which two triangles are congruent?`, `Segi tiga $P$ mempunyai sisi ${a.join(' cm, ')} cm dan segi tiga $Q$ mempunyai sisi ${b.join(' cm, ')} cm. Segi tiga $R$ mempunyai sisi ${c.join(' cm, ')} cm. Dua segi tiga manakah yang kongruen?`), a: T('$P$ and $Q$ (all three corresponding sides equal)', '$P$ dan $Q$ (ketiga-tiga sisi sepadan sama)'), w: W(T('Two triangles are congruent when all three pairs of corresponding sides are equal (SSS).', 'Dua segi tiga kongruen apabila ketiga-tiga pasangan sisi sepadan adalah sama (SSS).'), T(`$P$ and $Q$ both have sides ${a.join(' cm, ')} cm; $R$ has ${c.join(' cm, ')} cm, which do not match.`, `$P$ dan $Q$ kedua-duanya mempunyai sisi ${a.join(' cm, ')} cm; $R$ mempunyai ${c.join(' cm, ')} cm, yang tidak sepadan.`)), sp: 's' };
    },
  ];
  const g116m = [
    (r) => {
      const a = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10]]);
      const kind = r.pick(['cong', 'sim', 'none']);
      const k = r.pick([2, 3]);
      const b = kind === 'cong' ? a.slice().reverse() : kind === 'sim' ? a.map((v) => v * k) : [a[0] + 1, a[1], a[2] + 1];
      const ans = { cong: T('Congruent', 'Kongruen'), sim: T(`Similar but not congruent (scale factor ${k})`, `Serupa tetapi tidak kongruen (faktor skala ${k})`), none: T('Neither', 'Tiada satu pun') }[kind];
      return { q: T(`Triangle $A$ has sides ${a.join(' cm, ')} cm and triangle $B$ has sides ${b.join(' cm, ')} cm. Classify the pair as congruent, similar only, or neither.`, `Segi tiga $A$ mempunyai sisi ${a.join(' cm, ')} cm dan segi tiga $B$ mempunyai sisi ${b.join(' cm, ')} cm. Kelaskan pasangan itu sebagai kongruen, serupa sahaja, atau tiada satu pun.`), a: ans, w: W(T('Put both sets of sides in order, then compare the ratios of corresponding sides.', 'Susun kedua-dua set sisi mengikut tertib, kemudian bandingkan nisbah sisi sepadan.'), kind === 'cong' ? T(`$B$ has the same three lengths as $A$, ${a.join(' cm, ')} cm, so every ratio is $1$: the triangles are congruent.`, `$B$ mempunyai tiga panjang yang sama dengan $A$, ${a.join(' cm, ')} cm, jadi setiap nisbah ialah $1$: segi tiga itu kongruen.`) : kind === 'sim' ? T(`$${a.map((v) => `\\dfrac{${v * k}}{${v}}`).join(' = ')} = ${k}$`) : T(`$\\dfrac{${b[0]}}{${a[0]}} = ${n(round(b[0] / a[0], 3))}$ but $\\dfrac{${b[1]}}{${a[1]}} = ${n(round(b[1] / a[1], 3))}$`), kind === 'sim' ? T(`All three ratios are equal, so the triangles are similar; the lengths differ, so they are not congruent (scale factor ${k}).`, `Ketiga-tiga nisbah adalah sama, jadi segi tiga itu serupa; panjangnya berbeza, jadi ia tidak kongruen (faktor skala ${k}).`) : kind === 'none' ? T('The ratios are not all equal, so the triangles are neither similar nor congruent.', 'Nisbah tidak semuanya sama, jadi segi tiga itu bukan serupa dan bukan kongruen.') : T('Equal corresponding sides means congruent (SSS).', 'Sisi sepadan yang sama bermakna kongruen (SSS).')), sp: 's' };
    },
  ];
  const g116a = [
    (r) => {
      const k = r.pick([2, 3]), a = r.pick([[3, 4], [5, 12], [6, 8]]);
      const c = Math.hypot(a[0], a[1]);
      const A = [[0, 0], [a[0], 0], [0, a[1]]], B = [[0, 0], [a[0] * k, 0], [0, a[1] * k]];
      return { q: T(`Right-angled triangle $ABC$ has vertices $${pts(A)}$ and $DEF$ has vertices $${pts(B)}$. Show that the triangles are similar but not congruent, and state the scale factor.`, `Segi tiga bersudut tegak $ABC$ mempunyai bucu $${pts(A)}$ dan $DEF$ mempunyai bucu $${pts(B)}$. Tunjukkan bahawa segi tiga itu serupa tetapi tidak kongruen, dan nyatakan faktor skala.`), a: T(`Both have a right angle; sides ${a[0]}, ${a[1]}, ${n(c)} and ${a[0] * k}, ${a[1] * k}, ${n(c * k)}: ratios all ${k}, so similar; sizes differ, so not congruent. Scale factor ${k}.`, `Kedua-duanya mempunyai sudut tegak; sisi ${a[0]}, ${a[1]}, ${n(c)} dan ${a[0] * k}, ${a[1] * k}, ${n(c * k)}: nisbah semuanya ${k}, jadi serupa; saiz berbeza, jadi tidak kongruen. Faktor skala ${k}.`), w: W(T(`$ABC$: legs $${a[0]}$ and $${a[1]}$, hypotenuse $\\sqrt{${a[0]}^2 + ${a[1]}^2} = ${n(c)}$.`, `$ABC$: kaki $${a[0]}$ dan $${a[1]}$, hipotenus $\\sqrt{${a[0]}^2 + ${a[1]}^2} = ${n(c)}$.`), T(`$DEF$: legs $${a[0] * k}$ and $${a[1] * k}$, hypotenuse $${n(c * k)}$.`, `$DEF$: kaki $${a[0] * k}$ dan $${a[1] * k}$, hipotenus $${n(c * k)}$.`), `$\\dfrac{${a[0] * k}}{${a[0]}} = \\dfrac{${a[1] * k}}{${a[1]}} = \\dfrac{${n(c * k)}}{${n(c)}} = ${k}$`, T(`Both triangles have a right angle and all ratios equal ${k}, so they are similar; the lengths differ, so they are not congruent. Scale factor ${k}.`, `Kedua-dua segi tiga mempunyai sudut tegak dan semua nisbah bersamaan ${k}, jadi ia serupa; panjangnya berbeza, jadi ia tidak kongruen. Faktor skala ${k}.`)), sp: 'm' };
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
      return { q: T(`The number of pets owned by 20 students: ${vals.join(', ')}. Complete the frequency table and check that the frequencies add up to 20.<br>${tab(['Pets', 'Frequency'])}`, `Bilangan haiwan peliharaan yang dimiliki oleh 20 orang murid: ${vals.join(', ')}. Lengkapkan jadual kekerapan dan semak bahawa jumlah kekerapan ialah 20.<br>${tab(['Haiwan', 'Kekerapan'])}`), a: T(range(1, k).map((v, i) => `${v}: ${cnt[i]}`).join('; ') + ' (total 20)', range(1, k).map((v, i) => `${v}: ${cnt[i]}`).join('; ') + ' (jumlah 20)'), w: W(T('Go through the list once, making one tally mark for each value, then count the tallies.', 'Lalui senarai sekali, membuat satu turus bagi setiap nilai, kemudian kira turus itu.'), T(range(1, k).map((v, i) => `${v}: ${cnt[i]}`).join('; '), range(1, k).map((v, i) => `${v}: ${cnt[i]}`).join('; ')), T(`Check the total: $${cnt.join(' + ')} = ${sum(cnt)}$, which matches the 20 students.`, `Semak jumlah: $${cnt.join(' + ')} = ${sum(cnt)}$, yang sepadan dengan 20 orang murid.`)), sp: 's' };
    },
  ];
  const g121m = [
    (r) => {
      const vals = Array.from({ length: 20 }, () => r.int(31, 89));
      const bins = [[30, 39], [40, 49], [50, 59], [60, 69], [70, 79], [80, 89]];
      const cnt = bins.map(([a, b]) => vals.filter((v) => v >= a && v <= b).length);
      return { q: T(`The marks of 20 students in a test are: ${vals.join(', ')}. Construct a grouped frequency table using the class intervals 30–39, 40–49, …, 80–89.`, `Markah 20 orang murid dalam satu ujian ialah: ${vals.join(', ')}. Bina jadual kekerapan terkumpul menggunakan selang kelas 30–39, 40–49, …, 80–89.`), a: T(bins.map((b, i) => `${b[0]}–${b[1]}: ${cnt[i]}`).join('; '), bins.map((b, i) => `${b[0]}–${b[1]}: ${cnt[i]}`).join('; ')), w: W(T('Take each class interval in turn and count how many of the marks fall inside it.', 'Ambil setiap selang kelas satu demi satu dan kira berapa banyak markah yang berada di dalamnya.'), T(bins.map((b, i) => `${b[0]}–${b[1]}: ${cnt[i]}`).join('; '), bins.map((b, i) => `${b[0]}–${b[1]}: ${cnt[i]}`).join('; ')), T(`Check the total: $${cnt.join(' + ')} = ${sum(cnt)}$.`, `Semak jumlah: $${cnt.join(' + ')} = ${sum(cnt)}$.`)), sp: 'l' };
    },
  ];
  const g121a = [
    (r) => {
      const topics = [
        [T('how much time Form 2 students spend on homework each evening', 'jumlah masa murid Tingkatan 2 menghabiskan kerja rumah setiap petang'), T('minutes per evening (continuous)', 'minit setiap petang (selanjar)'), T('groups of 15 minutes (0–14, 15–29, …)', 'kumpulan 15 minit (0–14, 15–29, …)')],
        [T('the heights of Form 2 students', 'ketinggian murid Tingkatan 2'), T('height in cm (continuous)', 'ketinggian dalam cm (selanjar)'), T('groups of 5 cm (140–144, 145–149, …)', 'kumpulan 5 cm (140–144, 145–149, …)')],
      ];
      const t = r.pick(topics);
      return { q: T(`Plan a data collection to investigate ${t[0].en}. State the population, the variable and unit, the method of collection, and suitable class intervals for grouping. Justify your choices.`, `Rancang pengumpulan data untuk menyiasat ${t[0].ms}. Nyatakan populasi, pemboleh ubah dan unit, kaedah pengumpulan, dan selang kelas yang sesuai untuk pengumpulan data. Berikan justifikasi bagi pilihan anda.`), a: T(`Population: all Form 2 students (use a random sample from each class). Variable: ${t[1].en}. Method: a short questionnaire or measurement. Classes: ${t[2].en}, chosen so that there are about 5–8 equal-width classes.`, `Populasi: semua murid Tingkatan 2 (gunakan sampel rawak daripada setiap kelas). Pemboleh ubah: ${t[1].ms}. Kaedah: soal selidik ringkas atau pengukuran. Kelas: ${t[2].ms}, dipilih supaya terdapat kira-kira 5–8 kelas berlebar sama.`), w: W(T('A data collection plan needs four things: the population (who), the variable and its unit (what), the method of collection (how), and suitable class intervals for grouping.', 'Rancangan pengumpulan data memerlukan empat perkara: populasi (siapa), pemboleh ubah dan unitnya (apa), kaedah pengumpulan (bagaimana), dan selang kelas yang sesuai untuk pengumpulan data.'), T('Take a random sample so that the data represent the whole population.', 'Ambil sampel rawak supaya data mewakili keseluruhan populasi.'), T('Choose about 5 to 8 classes of equal width: too few hides the pattern, too many leaves most classes almost empty.', 'Pilih kira-kira 5 hingga 8 kelas berlebar sama: terlalu sedikit menyembunyikan corak, terlalu banyak menjadikan kebanyakan kelas hampir kosong.')), sp: 'xl' };
    },
  ];
  const g122e = [
    (r) => {
      const v = Array.from({ length: r.int(5, 7) }, () => r.int(1, 9));
      const cnt = {};
      v.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1));
      const mx = Math.max(...Object.values(cnt));
      const modes = Object.keys(cnt).filter((k) => cnt[k] === mx);
      return { q: T(`Find the mode of the data: $${list(v)}$.`, `Cari mod bagi data: $${list(v)}$.`), a: modes.length === v.length ? T('No mode (every value occurs once)', 'Tiada mod (setiap nilai berlaku sekali)') : T(`$${modes.join(' \\text{ and } ')}$ (frequency ${mx})`, `$${modes.join(' \\text{ dan } ')}$ (kekerapan ${mx})`), w: W(T('The mode is the value that occurs most often, so count how many times each value appears.', 'Mod ialah nilai yang paling kerap berlaku, jadi kira berapa kali setiap nilai muncul.'), T(Object.keys(cnt).map((key) => `${key}: ${cnt[key]}`).join('; '), Object.keys(cnt).map((key) => `${key}: ${cnt[key]}`).join('; ')), modes.length === v.length ? T('Every value occurs exactly once, so there is no mode.', 'Setiap nilai berlaku tepat sekali, jadi tiada mod.') : T(`The highest frequency is ${mx}, so the mode is ${modes.join(' and ')}.`, `Kekerapan tertinggi ialah ${mx}, jadi modnya ialah ${modes.join(' dan ')}.`)), sp: 's' };
    },
    (r) => {
      const v = Array.from({ length: r.pick([5, 7, 9]) }, () => r.int(2, 30));
      return { q: T(`Find the median of $${list(v)}$.`, `Cari median bagi $${list(v)}$.`), a: T(`$${n(median(v))}$ (ordered: $${list(sortNum(v))}$)`), w: W(T('Arrange the values in order of size, then take the middle one.', 'Susun nilai mengikut tertib saiz, kemudian ambil nilai tengah.'), `$${list(sortNum(v))}$`, T(`There are ${v.length} values, so the median is the ${(v.length + 1) / 2}th one: $${n(median(v))}$.`, `Terdapat ${v.length} nilai, jadi median ialah yang ke-${(v.length + 1) / 2}: $${n(median(v))}$.`)), sp: 's' };
    },
    (r) => {
      const k = r.pick([4, 5]);
      const v = retry(() => { const a = Array.from({ length: k }, () => r.int(1, 15)); need(sum(a) % k === 0 || false); return a; });
      return { q: T(`Find the mean of $${list(v)}$.`, `Cari min bagi $${list(v)}$.`), a: T(`$${n(sum(v) / k)}$`), w: W(T('Mean $= \\dfrac{\\text{sum of the values}}{\\text{number of values}}$', 'Min $= \\dfrac{\\text{hasil tambah nilai}}{\\text{bilangan nilai}}$'), `$= \\dfrac{${v.join(' + ')}}{${k}} = \\dfrac{${sum(v)}}{${k}} = ${n(sum(v) / k)}$`), sp: 's' };
    },
  ];
  const freqTab = (xs, fs, h) => SPM.table([[h[1], ...fs]], { head: [h[0], ...xs] });
  const g122m = [
    (r) => {
      const v = Array.from({ length: r.pick([6, 8, 10]) }, () => r.int(5, 40));
      return { q: T(`Find the median of $${list(v)}$.`, `Cari median bagi $${list(v)}$.`), a: T(`$${n(median(v))}$`), w: W(T('Arrange the values in order of size.', 'Susun nilai mengikut tertib saiz.'), `$${list(sortNum(v))}$`, T(`There are ${v.length} values, an even number, so the median is the mean of the ${v.length / 2}th and ${v.length / 2 + 1}th values.`, `Terdapat ${v.length} nilai, iaitu bilangan genap, jadi median ialah min bagi nilai ke-${v.length / 2} dan ke-${v.length / 2 + 1}.`), `$\\dfrac{${sortNum(v)[v.length / 2 - 1]} + ${sortNum(v)[v.length / 2]}}{2} = ${n(median(v))}$`), sp: 's' };
    },
    (r) => {
      const xs = range(1, 5), fs = xs.map(() => r.int(1, 8));
      const tot = sum(fs), sx = sum(xs.map((x, i) => x * fs[i]));
      return { q: T(`The table shows the number of goals scored in some matches.<br>${freqTab(xs, fs, ['Goals', 'Frequency'])}<br>Find the mean number of goals per match, correct to 2 decimal places.`, `Jadual menunjukkan bilangan gol yang dijaringkan dalam beberapa perlawanan.<br>${freqTab(xs, fs, ['Gol', 'Kekerapan'])}<br>Cari min bilangan gol setiap perlawanan, betul kepada 2 tempat perpuluhan.`), a: T(`$\\dfrac{${sx}}{${tot}} = ${fmtMean(sx / tot)}$`), w: W(T('For a frequency table, mean $= \\dfrac{\\sum fx}{\\sum f}$.', 'Bagi jadual kekerapan, min $= \\dfrac{\\sum fx}{\\sum f}$.'), `$\\sum fx = ${xs.map((x, i) => `${x} \\times ${fs[i]}`).join(' + ')} = ${sx}$`, `$\\sum f = ${fs.join(' + ')} = ${tot}$`, `$\\dfrac{${sx}}{${tot}} = ${fmtMean(sx / tot)}$`), sp: 'm' };
    },
  ];
  const g122a = [
    (r) => {
      const n1 = r.int(10, 20), m1 = r.int(50, 80), n2 = r.int(10, 20), m2 = r.int(50, 80);
      const tot = n1 + n2, mean_ = (n1 * m1 + n2 * m2) / tot;
      return { q: T(`Class A has ${n1} students with a mean mark of ${m1} and Class B has ${n2} students with a mean mark of ${m2}. Find the mean mark of all ${tot} students, correct to 2 decimal places.`, `Kelas A mempunyai ${n1} orang murid dengan markah min ${m1} dan Kelas B mempunyai ${n2} orang murid dengan markah min ${m2}. Cari markah min bagi kesemua ${tot} orang murid, betul kepada 2 tempat perpuluhan.`), a: T(`${fmtMean(mean_)}`), w: W(T('Combined mean $= \\dfrac{\\text{total of all the marks}}{\\text{total number of students}}$', 'Min gabungan $= \\dfrac{\\text{jumlah semua markah}}{\\text{jumlah bilangan murid}}$'), `$${n1} \\times ${m1} = ${n1 * m1}$`, `$${n2} \\times ${m2} = ${n2 * m2}$`, `$\\dfrac{${n1 * m1} + ${n2 * m2}}{${tot}} = \\dfrac{${n1 * m1 + n2 * m2}}{${tot}} = ${fmtMean(mean_)}$`), sp: 'm' };
    },
    (r) => {
      const k = r.int(5, 7), m = r.int(8, 15);
      const v = Array.from({ length: k - 1 }, () => r.int(m - 5, m + 5));
      const x = m * k - sum(v);
      need(x > 0);
      return { q: T(`The mean of ${k} numbers is ${m}. ${k - 1} of the numbers are $${list(v)}$. Find the remaining number.`, `Min bagi ${k} nombor ialah ${m}. ${k - 1} daripada nombor itu ialah $${list(v)}$. Cari nombor yang tinggal.`), a: T(`$${x}$`), w: W(T(`Total of all ${k} numbers $= ${k} \\times ${m} = ${k * m}$`, `Jumlah kesemua ${k} nombor $= ${k} \\times ${m} = ${k * m}$`), `$${v.join(' + ')} = ${sum(v)}$`, `$${k * m} - ${sum(v)} = ${x}$`), sp: 'm' };
    },
  ];

  const classes = (lo, w, k) => range(0, k - 1).map((i) => [lo + i * w, lo + (i + 1) * w - 1]);
  const gTab = (cl, fs, h, extra) => SPM.table(cl.map((c, i) => [`${c[0]}–${c[1]}`, fs[i], ...(extra ? extra[i] : [])]), { head: [h[0], h[1], ...(extra ? h.slice(2) : [])] });
  const g123e = [
    (r) => {
      const cl = classes(r.pick([0, 10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const mi = fs.indexOf(Math.max(...fs));
      need(fs.filter((f) => f === Math.max(...fs)).length === 1);
      return { q: T(`The table shows the time (in minutes) taken by students to complete a task.<br>${gTab(cl, fs, ['Time', 'Frequency'])}<br>State the modal class and the midpoint of each class.`, `Jadual menunjukkan masa (dalam minit) yang diambil oleh murid untuk menyiapkan satu tugasan.<br>${gTab(cl, fs, ['Masa', 'Kekerapan'])}<br>Nyatakan kelas mod dan titik tengah bagi setiap kelas.`), a: T(`Modal class ${cl[mi][0]}–${cl[mi][1]}; midpoints ${cl.map((c) => (c[0] + c[1]) / 2).join(', ')}`, `Kelas mod ${cl[mi][0]}–${cl[mi][1]}; titik tengah ${cl.map((c) => (c[0] + c[1]) / 2).join(', ')}`), w: W(T('The modal class is the class with the highest frequency.', 'Kelas mod ialah kelas dengan kekerapan tertinggi.'), T(`The highest frequency is ${Math.max(...fs)}, in the class ${cl[mi][0]}–${cl[mi][1]}.`, `Kekerapan tertinggi ialah ${Math.max(...fs)}, dalam kelas ${cl[mi][0]}–${cl[mi][1]}.`), T('Midpoint $= \\dfrac{\\text{lower limit} + \\text{upper limit}}{2}$', 'Titik tengah $= \\dfrac{\\text{had bawah} + \\text{had atas}}{2}$'), T(cl.map((c) => `$\\dfrac{${c[0]} + ${c[1]}}{2} = ${(c[0] + c[1]) / 2}$`).join('; '), cl.map((c) => `$\\dfrac{${c[0]} + ${c[1]}}{2} = ${(c[0] + c[1]) / 2}$`).join('; '))), sp: 'm' };
    },
  ];
  const g123m = [
    (r) => {
      const cl = classes(r.pick([0, 10, 20]), 10, 4), fs = cl.map(() => r.int(2, 10));
      const mids = cl.map((c) => (c[0] + c[1]) / 2);
      const sx = sum(mids.map((m, i) => m * fs[i])), tot = sum(fs);
      return { q: T(`The table shows the marks of a group of students.<br>${gTab(cl, fs, ['Marks', 'Frequency'])}<br>Complete the midpoint column and estimate the mean mark.`, `Jadual menunjukkan markah sekumpulan murid.<br>${gTab(cl, fs, ['Markah', 'Kekerapan'])}<br>Lengkapkan lajur titik tengah dan anggarkan markah min.`), a: T(`Midpoints ${mids.join(', ')}; estimated mean $= \\dfrac{${sx}}{${tot}} = ${fmtMean(sx / tot)}$`, `Titik tengah ${mids.join(', ')}; min anggaran $= \\dfrac{${sx}}{${tot}} = ${fmtMean(sx / tot)}$`), w: W(T('For grouped data, use the midpoint of each class as $x$ and estimate the mean with $\\dfrac{\\sum fx}{\\sum f}$.', 'Bagi data terkumpul, gunakan titik tengah setiap kelas sebagai $x$ dan anggarkan min dengan $\\dfrac{\\sum fx}{\\sum f}$.'), T(`Midpoints: ${mids.join(', ')}`, `Titik tengah: ${mids.join(', ')}`), `$\\sum fx = ${mids.map((mm, i) => `${mm} \\times ${fs[i]}`).join(' + ')} = ${sx}$`, `$\\sum f = ${fs.join(' + ')} = ${tot}$`, `$\\dfrac{${sx}}{${tot}} = ${fmtMean(sx / tot)}$`), sp: 'l' };
    },
  ];
  const g123a = [
    (r) => {
      const vals = Array.from({ length: 15 }, () => r.int(0, 39));
      const cl = classes(0, 10, 4);
      const fs = cl.map((c) => vals.filter((v) => v >= c[0] && v <= c[1]).length);
      const mids = cl.map((c) => (c[0] + c[1]) / 2);
      const sx = sum(mids.map((m, i) => m * fs[i]));
      return { q: T(`The number of texts sent by 15 students in a day: ${vals.join(', ')}. Group the data into the classes 0–9, 10–19, 20–29 and 30–39, and estimate the mean number of texts. Compare it with the exact mean.`, `Bilangan mesej yang dihantar oleh 15 orang murid dalam sehari: ${vals.join(', ')}. Kumpulkan data itu ke dalam kelas 0–9, 10–19, 20–29 dan 30–39, dan anggarkan min bilangan mesej. Bandingkan dengan min tepat.`), a: T(`Frequencies ${fs.join(', ')}; estimated mean ${fmtMean(sx / 15)}; exact mean ${fmtMean(sum(vals) / 15)}`, `Kekerapan ${fs.join(', ')}; min anggaran ${fmtMean(sx / 15)}; min tepat ${fmtMean(sum(vals) / 15)}`), w: W(T('Count how many values fall in each class, then use the class midpoints to estimate the mean.', 'Kira berapa banyak nilai dalam setiap kelas, kemudian gunakan titik tengah kelas untuk menganggar min.'), T(`Frequencies: ${fs.join(', ')}; midpoints: ${mids.join(', ')}`, `Kekerapan: ${fs.join(', ')}; titik tengah: ${mids.join(', ')}`), `$\\dfrac{${sx}}{15} = ${fmtMean(sx / 15)}$`, `$\\dfrac{${sum(vals)}}{15} = ${fmtMean(sum(vals) / 15)}$`, T('The estimate differs a little because grouping replaces every value in a class by the class midpoint.', 'Anggaran berbeza sedikit kerana pengumpulan menggantikan setiap nilai dalam sesuatu kelas dengan titik tengah kelas itu.')), sp: 'xl' };
    },
  ];
  const g124e = [
    (r) => {
      const c = r.pick([
        [T('the most popular shoe size to stock in a shop', 'saiz kasut paling popular untuk distok di sebuah kedai'), T('mode', 'mod'), T('it shows the most common value', 'ia menunjukkan nilai yang paling biasa')],
        [T('a typical house price when a few mansions are very expensive', 'harga rumah biasa apabila beberapa rumah agam sangat mahal'), T('median', 'median'), T('extreme values distort the mean', 'nilai ekstrem menjejaskan min')],
        [T('the average test mark of a class with no unusual marks', 'markah ujian purata bagi sebuah kelas tanpa markah luar biasa'), T('mean', 'min'), T('it uses every value', 'ia menggunakan setiap nilai')],
      ]);
      return { q: T(`Which measure is most suitable for ${c[0].en}: mean, median or mode? Give one reason.`, `Ukuran manakah yang paling sesuai untuk ${c[0].ms}: min, median atau mod? Berikan satu sebab.`), a: T(`${c[1].en}: ${c[2].en}.`, `${c[1].ms}: ${c[2].ms}.`), w: W(T('The mode is the most common value, the median is the middle value (best when a few extreme values would distort the mean), and the mean uses every value (best when the data have no extremes).', 'Mod ialah nilai paling biasa, median ialah nilai tengah (terbaik apabila beberapa nilai ekstrem akan menjejaskan min), dan min menggunakan setiap nilai (terbaik apabila data tiada nilai ekstrem).'), T(`Here the ${c[1].en} is the most suitable, because ${c[2].en}.`, `Di sini ${c[1].ms} yang paling sesuai, kerana ${c[2].ms}.`)), sp: 's' };
    },
  ];
  const g124m = [
    (r) => {
      const A = Array.from({ length: 7 }, () => r.int(40, 80)), B = Array.from({ length: 7 }, () => r.int(30, 90));
      const rng = (v) => Math.max(...v) - Math.min(...v);
      return { q: T(`The marks of two groups are: Group A: $${list(A)}$; Group B: $${list(B)}$. Find the mean and range of each group and say which group has more consistent marks.`, `Markah dua kumpulan ialah: Kumpulan A: $${list(A)}$; Kumpulan B: $${list(B)}$. Cari min dan julat bagi setiap kumpulan dan nyatakan kumpulan yang markahnya lebih konsisten.`), a: T(`A: mean ${fmtMean(mean(A))}, range ${rng(A)}; B: mean ${fmtMean(mean(B))}, range ${rng(B)}. ${rng(A) === rng(B) ? 'The two ranges are equal, so the two groups are equally consistent.' : `Group ${rng(A) < rng(B) ? 'A' : 'B'} has the smaller range, so its marks are more consistent.`}`, `A: min ${fmtMean(mean(A))}, julat ${rng(A)}; B: min ${fmtMean(mean(B))}, julat ${rng(B)}. ${rng(A) === rng(B) ? 'Kedua-dua julat adalah sama, jadi kedua-dua kumpulan sama konsisten.' : `Kumpulan ${rng(A) < rng(B) ? 'A' : 'B'} mempunyai julat yang lebih kecil, jadi markahnya lebih konsisten.`}`), w: W(T('Mean $= \\dfrac{\\text{sum}}{\\text{number of values}}$; range $=$ largest $-$ smallest; the smaller range means the more consistent data.', 'Min $= \\dfrac{\\text{hasil tambah}}{\\text{bilangan nilai}}$; julat $=$ terbesar $-$ terkecil; julat yang lebih kecil bermakna data yang lebih konsisten.'), T(`A: $\\dfrac{${sum(A)}}{7} = ${fmtMean(mean(A))}$, range $${Math.max(...A)} - ${Math.min(...A)} = ${rng(A)}$`, `A: $\\dfrac{${sum(A)}}{7} = ${fmtMean(mean(A))}$, julat $${Math.max(...A)} - ${Math.min(...A)} = ${rng(A)}$`), T(`B: $\\dfrac{${sum(B)}}{7} = ${fmtMean(mean(B))}$, range $${Math.max(...B)} - ${Math.min(...B)} = ${rng(B)}$`, `B: $\\dfrac{${sum(B)}}{7} = ${fmtMean(mean(B))}$, julat $${Math.max(...B)} - ${Math.min(...B)} = ${rng(B)}$`), rng(A) === rng(B) ? T('The ranges are equal, so neither group is more consistent.', 'Julatnya sama, jadi tiada kumpulan yang lebih konsisten.') : T(`Group ${rng(A) < rng(B) ? 'A' : 'B'} has the smaller range, so its marks are more consistent.`, `Kumpulan ${rng(A) < rng(B) ? 'A' : 'B'} mempunyai julat yang lebih kecil, jadi markahnya lebih konsisten.`)), sp: 'l' };
    },
  ];
  const g124a = [
    (r) => {
      const v = Array.from({ length: 6 }, () => r.int(20, 35));
      const out = r.int(90, 120);
      const all = v.concat([out]);
      return { q: T(`A shop's daily sales (RM hundred) for 7 days are $${list(all)}$. Find the mean and median. Which is a better description of a typical day's sales, and why?`, `Jualan harian sebuah kedai (RM ratus) selama 7 hari ialah $${list(all)}$. Cari min dan median. Yang manakah menggambarkan jualan sehari yang biasa dengan lebih baik, dan mengapa?`), a: T(`Mean ${fmtMean(mean(all))}, median ${n(median(all))}. The median is better: the extreme value ${out} pulls the mean up.`, `Min ${fmtMean(mean(all))}, median ${n(median(all))}. Median lebih baik: nilai ekstrem ${out} menarik min ke atas.`), w: W(T('The mean uses every value, so one very large value pulls it up; the median is the middle value in order and is hardly affected.', 'Min menggunakan setiap nilai, jadi satu nilai yang sangat besar menariknya ke atas; median ialah nilai tengah mengikut tertib dan hampir tidak terjejas.'), `$\\dfrac{${sum(all)}}{7} = ${fmtMean(mean(all))}$`, T(`In order: $${list(sortNum(all))}$, so the median is $${n(median(all))}$.`, `Mengikut tertib: $${list(sortNum(all))}$, jadi median ialah $${n(median(all))}$.`), T(`The single large value ${out} makes the mean much bigger than a typical day, so the median describes a typical day better.`, `Nilai besar tunggal ${out} menjadikan min jauh lebih besar daripada hari biasa, jadi median menggambarkan hari biasa dengan lebih baik.`)), sp: 'l' };
    },
  ];
  const g125e = [
    (r) => {
      const v = Array.from({ length: 5 }, () => r.int(5, 20));
      const m = mean(v);
      need(Number.isInteger(m));
      return { q: T(`The mean of $${list(v)}$ is ${m}. What is the mean if another value equal to ${m} is added? Explain.`, `Min bagi $${list(v)}$ ialah ${m}. Apakah min jika satu nilai lain yang sama dengan ${m} ditambah? Terangkan.`), a: T(`Still ${m}: adding the mean itself does not change the mean.`, `Masih ${m}: menambah min itu sendiri tidak mengubah min.`), w: W(T(`Total of the ${v.length} values $= ${v.length} \\times ${m} = ${v.length * m}$`, `Jumlah ${v.length} nilai $= ${v.length} \\times ${m} = ${v.length * m}$`), `$\\dfrac{${v.length * m} + ${m}}{${v.length + 1}} = \\dfrac{${v.length * m + m}}{${v.length + 1}} = ${m}$`, T('Adding a value equal to the mean leaves the mean unchanged.', 'Menambah satu nilai yang sama dengan min membiarkan min tidak berubah.')), sp: 's' };
    },
  ];
  const g125m = [
    (r) => {
      const k = r.int(4, 6), m = r.int(8, 16);
      const v = Array.from({ length: k - 1 }, () => r.int(m - 4, m + 4));
      const x = m * k - sum(v);
      need(x > 0);
      return { q: T(`The mean of ${k} numbers is ${m}. ${k - 1} of the numbers are $${list(v)}$. Find the missing number.`, `Min bagi ${k} nombor ialah ${m}. ${k - 1} daripada nombor itu ialah $${list(v)}$. Cari nombor yang hilang.`), a: T(`$${x}$`), w: W(T(`Total of all ${k} numbers $= ${k} \\times ${m} = ${k * m}$`, `Jumlah kesemua ${k} nombor $= ${k} \\times ${m} = ${k * m}$`), `$${v.join(' + ')} = ${sum(v)}$`, `$${k * m} - ${sum(v)} = ${x}$`), sp: 's' };
    },
    (r) => {
      const v = Array.from({ length: 5 }, () => r.int(4, 20));
      const k = r.pick([2, 3, 5]), add = r.pick([true, false]);
      return { q: T(`The mean of a data set is ${fmtMean(mean(v))}. Every value is ${add ? 'increased by' : 'multiplied by'} ${k}. Find the new mean.`, `Min bagi satu set data ialah ${fmtMean(mean(v))}. Setiap nilai ${add ? 'ditambah dengan' : 'didarab dengan'} ${k}. Cari min baharu.`), a: T(`${fmtMean(add ? mean(v) + k : mean(v) * k)}`), w: W(add ? T(`Adding ${k} to every value adds ${k} to the mean as well.`, `Menambah ${k} kepada setiap nilai turut menambah ${k} kepada min.`) : T(`Multiplying every value by ${k} multiplies the total by ${k}, so the mean is multiplied by ${k} too.`, `Mendarab setiap nilai dengan ${k} mendarabkan jumlah dengan ${k}, jadi min juga didarab dengan ${k}.`), `$${fmtMean(mean(v))} ${add ? '+' : '\\times'} ${k} = ${fmtMean(add ? mean(v) + k : mean(v) * k)}$`), sp: 's' };
    },
  ];
  const g125a = [
    (r) => {
      const k = r.int(5, 8), m1 = r.int(10, 20), d = r.int(1, 3);
      const x = (m1 + d) * (k + 1) - m1 * k;
      return { q: T(`The mean of ${k} numbers is ${m1}. When one more number is included, the mean becomes ${m1 + d}. Find the new number.`, `Min bagi ${k} nombor ialah ${m1}. Apabila satu nombor lagi dimasukkan, min menjadi ${m1 + d}. Cari nombor baharu itu.`), a: T(`$${x}$`), w: W(T(`Total of the first ${k} numbers $= ${k} \\times ${m1} = ${k * m1}$`, `Jumlah ${k} nombor pertama $= ${k} \\times ${m1} = ${k * m1}$`), T(`New total $= ${k + 1} \\times ${m1 + d} = ${(k + 1) * (m1 + d)}$`, `Jumlah baharu $= ${k + 1} \\times ${m1 + d} = ${(k + 1) * (m1 + d)}$`), `$${(k + 1) * (m1 + d)} - ${k * m1} = ${x}$`), sp: 'm' };
    },
    (r) => {
      const v = Array.from({ length: 6 }, () => r.int(20, 30)).concat([r.int(60, 80)]);
      const out = v[6];
      const w = v.slice(0, 6);
      return { q: T(`The data $${list(v)}$ include one extreme value. Find the mean and median with and without ${out}. Which measure is affected more?`, `Data $${list(v)}$ mengandungi satu nilai ekstrem. Cari min dan median dengan dan tanpa ${out}. Ukuran yang manakah lebih terjejas?`), a: T(`With: mean ${fmtMean(mean(v))}, median ${n(median(v))}. Without: mean ${fmtMean(mean(w))}, median ${n(median(w))}. The mean changes more.`, `Dengan: min ${fmtMean(mean(v))}, median ${n(median(v))}. Tanpa: min ${fmtMean(mean(w))}, median ${n(median(w))}. Min lebih banyak berubah.`), w: W(T(`With ${out}: mean $= \\dfrac{${sum(v)}}{7} = ${fmtMean(mean(v))}$, median $= ${n(median(v))}$.`, `Dengan ${out}: min $= \\dfrac{${sum(v)}}{7} = ${fmtMean(mean(v))}$, median $= ${n(median(v))}$.`), T(`Without ${out}: mean $= \\dfrac{${sum(w)}}{6} = ${fmtMean(mean(w))}$, median $= ${n(median(w))}$.`, `Tanpa ${out}: min $= \\dfrac{${sum(w)}}{6} = ${fmtMean(mean(w))}$, median $= ${n(median(w))}$.`), T(`The mean changes by ${fmtMean(Math.abs(mean(v) - mean(w)))} while the median changes by ${n(round(Math.abs(median(v) - median(w)), 2))}, so the mean is affected far more by the extreme value.`, `Min berubah sebanyak ${fmtMean(Math.abs(mean(v) - mean(w)))} manakala median berubah sebanyak ${n(round(Math.abs(median(v) - median(w)), 2))}, jadi min jauh lebih terjejas oleh nilai ekstrem.`)), sp: 'l' };
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
      return { q: T(`List the sample space when ${o[0].en}.`, `Senaraikan ruang sampel apabila ${o[0].ms}.`), a: T(`$\\{${o[1]}\\}$`), w: W(T('The sample space is the list of every possible outcome of the experiment.', 'Ruang sampel ialah senarai setiap kesudahan yang mungkin bagi eksperimen itu.'), T(`Listing them: $\\{${o[1]}\\}$.`, `Menyenaraikannya: $\\{${o[1]}\\}$.`)), sp: 's' };
    },
  ];
  const g131m = [
    (r) => {
      const trials = r.pick([40, 50, 60, 100]);
      const heads = Math.round(trials * r.pick([0.42, 0.45, 0.48, 0.55, 0.6]));
      return { q: T(`A coin is tossed ${trials} times and lands heads ${heads} times. Find the experimental probability of heads, and compare it with the theoretical probability.`, `Sebiji syiling dilambung ${trials} kali dan mendarat kepala sebanyak ${heads} kali. Cari kebarangkalian eksperimen mendapat kepala, dan bandingkan dengan kebarangkalian teori.`), a: T(`Experimental $= \\dfrac{${heads}}{${trials}} = ${n(round(heads / trials, 3))}$; theoretical $= \\dfrac{1}{2} = 0.5$`, `Eksperimen $= \\dfrac{${heads}}{${trials}} = ${n(round(heads / trials, 3))}$; teori $= \\dfrac{1}{2} = 0.5$`), w: W(T('Experimental probability $= \\dfrac{\\text{number of times the event happened}}{\\text{number of trials}}$', 'Kebarangkalian eksperimen $= \\dfrac{\\text{bilangan kali peristiwa berlaku}}{\\text{bilangan percubaan}}$'), `$= \\dfrac{${heads}}{${trials}} = ${n(round(heads / trials, 3))}$`, T('A fair coin has two equally likely outcomes, so the theoretical probability is $\\dfrac{1}{2} = 0.5$.', 'Syiling adil mempunyai dua kesudahan sama boleh jadi, jadi kebarangkalian teori ialah $\\dfrac{1}{2} = 0.5$.'), T('The experimental value is close to the theoretical value but need not be exactly equal to it.', 'Nilai eksperimen hampir dengan nilai teori tetapi tidak semestinya sama dengannya.')), sp: 's' };
    },
  ];
  const g131a = [
    (r) => {
      const ns = [10, 50, 200, 1000];
      const hs = ns.map((k, i) => Math.round(k * (0.5 + [0.2, 0.08, 0.03, 0.008][i] * r.pick([-1, 1]))));
      const tab = (h) => SPM.table([[h[1], ...ns], [h[2], ...hs], [h[3], ...ns.map(() => '')]], { rowHead: true });
      return { q: T(`A coin is tossed several times. Complete the table of experimental probabilities of heads and describe what happens as the number of tosses increases.<br>${tab(['', 'Tosses', 'Heads', 'P(heads)'])}`, `Sebiji syiling dilambung beberapa kali. Lengkapkan jadual kebarangkalian eksperimen mendapat kepala dan huraikan apa yang berlaku apabila bilangan lambungan bertambah.<br>${tab(['', 'Lambungan', 'Kepala', 'P(kepala)'])}`), a: T(`${hs.map((h, i) => n(round(h / ns[i], 3))).join(', ')}. The experimental probability tends to get closer to the theoretical value 0.5 as the number of trials grows.`, `${hs.map((h, i) => n(round(h / ns[i], 3))).join(', ')}. Kebarangkalian eksperimen cenderung menghampiri nilai teori 0.5 apabila bilangan percubaan bertambah.`), w: W(T('For each column, experimental probability $= \\dfrac{\\text{heads}}{\\text{tosses}}$.', 'Bagi setiap lajur, kebarangkalian eksperimen $= \\dfrac{\\text{kepala}}{\\text{lambungan}}$.'), T(ns.map((kk, i) => `$\\dfrac{${hs[i]}}{${kk}} = ${n(round(hs[i] / kk, 3))}$`).join('; '), ns.map((kk, i) => `$\\dfrac{${hs[i]}}{${kk}} = ${n(round(hs[i] / kk, 3))}$`).join('; ')), T('As the number of tosses grows the values settle closer to the theoretical probability $0.5$.', 'Apabila bilangan lambungan bertambah, nilainya semakin menghampiri kebarangkalian teori $0.5$.')), sp: 'm' };
    },
  ];
  const g132e = [
    (r) => {
      const k = r.int(1, 6);
      return { q: T(`A fair die is rolled. Find the probability of getting ${k}.`, `Sebiji dadu adil digolek. Cari kebarangkalian mendapat ${k}.`), a: T(`$\\dfrac{1}{6}$`), w: W(T('$P(\\text{event}) = \\dfrac{\\text{number of favourable outcomes}}{\\text{total number of outcomes}}$', '$P(\\text{peristiwa}) = \\dfrac{\\text{bilangan kesudahan yang diingini}}{\\text{jumlah kesudahan}}$'), T(`A die has 6 equally likely outcomes and exactly one of them is ${k}.`, `Dadu mempunyai 6 kesudahan sama boleh jadi dan tepat satu daripadanya ialah ${k}.`), `$\\dfrac{1}{6}$`), sp: 's' };
    },
    (r) => {
      const red = r.int(2, 8), blue = r.int(2, 8);
      return { q: T(`A box contains ${red} red balls and ${blue} blue balls. A ball is picked at random. Find the probability that it is red.`, `Sebuah kotak mengandungi ${red} biji bola merah dan ${blue} biji bola biru. Sebiji bola dipilih secara rawak. Cari kebarangkalian bola itu berwarna merah.`), a: T(`$${P(red, red + blue)}$`), w: W(T('$P(\\text{event}) = \\dfrac{\\text{number of favourable outcomes}}{\\text{total number of outcomes}}$', '$P(\\text{peristiwa}) = \\dfrac{\\text{bilangan kesudahan yang diingini}}{\\text{jumlah kesudahan}}$'), `$${red} + ${blue} = ${red + blue}$`, `$\\dfrac{${red}}{${red + blue}} = ${P(red, red + blue)}$`), sp: 's' };
    },
  ];
  const g132m = [
    (r) => {
      const ev = r.pick([['an even number', 'nombor genap', [2, 4, 6]], ['a prime number', 'nombor perdana', [2, 3, 5]], ['a number greater than 4', 'nombor lebih besar daripada 4', [5, 6]], ['a multiple of 3', 'gandaan 3', [3, 6]]]);
      return { q: T(`A fair die is rolled. Find the probability of getting ${ev[0]}.`, `Sebiji dadu adil digolek. Cari kebarangkalian mendapat ${ev[1]}.`), a: T(`$${P(ev[2].length, 6)}$`), w: W(T(`List the favourable outcomes: $${ev[2].join(',\\ ')}$ — ${ev[2].length} out of the 6 equally likely outcomes.`, `Senaraikan kesudahan yang diingini: $${ev[2].join(',\\ ')}$ — ${ev[2].length} daripada 6 kesudahan sama boleh jadi.`), `$\\dfrac{${ev[2].length}}{6} = ${P(ev[2].length, 6)}$`), sp: 's' };
    },
    (r) => {
      const w = r.pick([['MATEMATIK', 9, 3], ['SEKOLAH', 7, 3], ['BADMINTON', 9, 3]]);
      const vow = w[0].split('').filter((c) => 'AEIOU'.includes(c)).length;
      return { q: T(`A letter is chosen at random from the word ${w[0]}. Find the probability that it is a vowel.`, `Satu huruf dipilih secara rawak daripada perkataan ${w[0]}. Cari kebarangkalian huruf itu ialah vokal.`), a: T(`$${P(vow, w[0].length)}$`), w: W(T(`${w[0]} has ${w[0].length} letters, of which ${vow} are vowels.`, `${w[0]} mempunyai ${w[0].length} huruf, dan ${vow} daripadanya ialah vokal.`), `$\\dfrac{${vow}}{${w[0].length}} = ${P(vow, w[0].length)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([10, 12, 20, 25]);
      const ev = r.pick([['a multiple of 5', 'gandaan 5', (v) => v % 5 === 0], ['an even number', 'nombor genap', (v) => v % 2 === 0], ['a prime number', 'nombor perdana', SPM.isPrime]]);
      const cnt = range(1, k).filter(ev[2]).length;
      return { q: T(`A card is drawn at random from cards numbered 1 to ${k}. Find the probability that the number is ${ev[0]}.`, `Sekeping kad dipilih secara rawak daripada kad bernombor 1 hingga ${k}. Cari kebarangkalian nombor itu ialah ${ev[1]}.`), a: T(`$${P(cnt, k)}$`), w: W(T(`Among 1 to ${k}, the numbers that are ${ev[0]} are ${range(1, k).filter(ev[2]).join(', ')} — ${cnt} of them.`, `Antara 1 hingga ${k}, nombor yang ialah ${ev[1]} ialah ${range(1, k).filter(ev[2]).join(', ')} — ${cnt} daripadanya.`), `$\\dfrac{${cnt}}{${k}} = ${P(cnt, k)}$`), sp: 's' };
    },
  ];
  const g132a = [
    (r) => {
      const other = r.int(4, 10), num = r.pick([[2, 5], [1, 3], [3, 7], [2, 3]]);
      const nn = Math.round((num[0] * other) / (num[1] - num[0]));
      need((num[0] * other) % (num[1] - num[0]) === 0);
      return { q: T(`A bag has ${other} red balls and some blue balls. The probability of picking a blue ball is $${P(num[0], num[1])}$. Find the number of blue balls.`, `Sebuah beg mengandungi ${other} biji bola merah dan beberapa biji bola biru. Kebarangkalian memilih bola biru ialah $${P(num[0], num[1])}$. Cari bilangan bola biru.`), a: T(`${nn}`), w: W(T(`Let the number of blue balls be $n$, so there are $n + ${other}$ balls altogether.`, `Biar bilangan bola biru ialah $n$, jadi terdapat $n + ${other}$ biji bola kesemuanya.`), `$\\dfrac{n}{n + ${other}} = ${P(num[0], num[1])}$`, `$${num[1]}n = ${num[0]}(n + ${other})$`, `$${num[1] - num[0]}n = ${num[0] * other}$`, `$n = ${nn}$`), sp: 'm' };
    },
    (r) => {
      const trials = r.pick([60, 120, 300]);
      return { q: T(`A fair die is rolled ${trials} times. Estimate the number of times an even number is expected, and the number of times a 6 is expected.`, `Sebiji dadu adil digolek ${trials} kali. Anggarkan bilangan kali nombor genap dijangka muncul, dan bilangan kali 6 dijangka muncul.`), a: T(`Even: ${trials / 2}; 6: ${trials / 6}`, `Genap: ${trials / 2}; 6: ${trials / 6}`), w: W(T('Expected number of times $=$ probability $\\times$ number of trials.', 'Bilangan kali dijangka $=$ kebarangkalian $\\times$ bilangan percubaan.'), `$P(\\text{even}) = \\dfrac{3}{6} = \\dfrac{1}{2}$`, `$\\dfrac{1}{2} \\times ${trials} = ${trials / 2}$`, `$\\dfrac{1}{6} \\times ${trials} = ${trials / 6}$`), sp: 'm' };
    },
  ];
  SPM.addChapter(2, 13, T('Simple Probability', 'Kebarangkalian Mudah'), [
    { id: '13.1', en: 'Experimental probability vs theoretical probability', ms: 'Kebarangkalian eksperimen lawan kebarangkalian teori', gen: { e: g131e, m: g131m, a: g131a } },
    { id: '13.2', en: 'Theoretical probability of equally likely outcomes', ms: 'Kebarangkalian teori bagi kesudahan sama boleh jadi', gen: { e: g132e, m: g132m, a: g132a } },
  ]);
})();
