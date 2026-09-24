/* Form 5 – Chapters 5 to 8 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, sum, gcd, mean, median, sortNum, Fr, poly, lin, rm } = SPM;
  const S = SPM.svg;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const frT = Fr.tex;
  const fr = (a, b) => Fr.make(a, b);
  const pt = (p) => `(${n(p[0])}, ${n(p[1])})`;
  const rad = (d) => (d * Math.PI) / 180;
  const W = SPM.lines;
  const par = (x) => (x < 0 ? `(${n(x)})` : n(x));
  const tv = (v) => `\\begin{pmatrix} ${n(v[0])} \\\\ ${n(v[1])} \\end{pmatrix}`;
  /** "= 12.5" when exact to 2 dp, otherwise "\approx 12.53" */
  const eq2 = (x) => (Math.abs(round(x, 2) - x) < 1e-9 ? '= ' : '\\approx ') + n(round(x, 2));

  /* =============================================================== 5 */
  const WHY_OK = (rule) => T(`The data match ${rule}, one of the congruency conditions (SSS, SAS, ASA, AAS, RHS).`, `Data itu memenuhi ${rule}, salah satu syarat kekongruenan (SSS, SAS, ASA, AAS, RHS).`);
  const DATA = [
    { en: 'three pairs of equal corresponding sides', ms: 'tiga pasang sisi sepadan yang sama panjang', rule: 'SSS', ok: true },
    { en: 'two pairs of equal corresponding sides and the equal angles between them', ms: 'dua pasang sisi sepadan yang sama panjang dan sudut yang sama di antaranya', rule: 'SAS', ok: true },
    { en: 'two pairs of equal angles and the equal sides between them', ms: 'dua pasang sudut yang sama dan sisi yang sama di antaranya', rule: 'ASA', ok: true },
    { en: 'two pairs of equal angles and a pair of equal sides that is not between them', ms: 'dua pasang sudut yang sama dan sepasang sisi yang sama yang tidak berada di antaranya', rule: 'AAS', ok: true },
    { en: 'three pairs of equal angles only', ms: 'tiga pasang sudut yang sama sahaja', rule: 'AAA', ok: false, why: T('Equal angles fix only the shape, not the size: the triangles are similar but one may be an enlargement of the other.', 'Sudut yang sama hanya menetapkan bentuk, bukan saiz: segi tiga itu serupa tetapi satu mungkin pembesaran yang lain.') },
    { en: 'two pairs of equal sides and an equal angle that is not between them', ms: 'dua pasang sisi yang sama dan sudut yang sama yang tidak berada di antaranya', rule: 'SSA', ok: false, why: T('The angle is not between the two sides, so the third side can swing to two positions: two different triangles fit the data.', 'Sudut itu tidak diapit oleh dua sisi itu, jadi sisi ketiga boleh berayun ke dua kedudukan: dua segi tiga berbeza memenuhi data itu.') },
  ];
  const g51e = [
    (r) => {
      const a = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [7, 8, 9]]);
      const b = r.shuffle(a);
      const c = a.map((v, i) => v + (i === 0 ? 1 : 0));
      return { q: T(`Triangle $P$ has sides ${a.join(' cm, ')} cm, triangle $Q$ has sides ${b.join(' cm, ')} cm and triangle $R$ has sides ${c.join(' cm, ')} cm. Which two triangles are congruent? Give the reason.`, `Segi tiga $P$ mempunyai sisi ${a.join(' cm, ')} cm, segi tiga $Q$ mempunyai sisi ${b.join(' cm, ')} cm dan segi tiga $R$ mempunyai sisi ${c.join(' cm, ')} cm. Dua segi tiga manakah yang kongruen? Berikan sebab.`), a: T('$P$ and $Q$: all three pairs of corresponding sides are equal (SSS).', '$P$ dan $Q$: ketiga-tiga pasang sisi sepadan adalah sama (SSS).'), w: W(T(`Sorted sides: $P$: ${a.join(', ')}; $Q$: ${[...b].sort((u, v) => u - v).join(', ')}; $R$: ${c.join(', ')}`, `Sisi mengikut tertib: $P$: ${a.join(', ')}; $Q$: ${[...b].sort((u, v) => u - v).join(', ')}; $R$: ${c.join(', ')}`), T('$P$ and $Q$ have the same three lengths but $R$ does not, so $P \\equiv Q$ (SSS).', '$P$ dan $Q$ mempunyai tiga panjang yang sama tetapi $R$ tidak, jadi $P \\equiv Q$ (SSS).')), sp: 's' };
    },
  ];
  const g51m = [
    (r) => {
      const d = r.pick(DATA);
      return { q: T(`Two triangles have ${d.en}. Is this enough to prove that they are congruent? Name the condition or explain why not.`, `Dua segi tiga mempunyai ${d.ms}. Adakah ini mencukupi untuk membuktikan bahawa keduanya kongruen? Namakan syarat itu atau terangkan mengapa tidak.`), a: d.ok ? T(`Yes: ${d.rule}.`, `Ya: ${d.rule}.`) : T(`No: ${d.rule} does not guarantee congruence (e.g. similar triangles of different sizes, or two different triangles from the same two sides and a non-included angle).`, `Tidak: ${d.rule} tidak menjamin kekongruenan (cth. segi tiga serupa yang berlainan saiz, atau dua segi tiga berbeza daripada dua sisi yang sama dan sudut yang tidak diapit).`), w: W(d.ok ? WHY_OK(d.rule) : d.why), sp: 's' };
    },
    (r) => {
      const a = r.int(4, 9), b = r.int(4, 9), ang = r.pick([40, 55, 70, 100]);
      return { q: T(`Triangles $ABC$ and $PQR$ have $AB = PQ = ${a}$ cm, $AC = PR = ${b}$ cm and $\\angle A = \\angle P = ${ang}^\\circ$. Prove that they are congruent and state $\\angle B$'s corresponding angle and the side corresponding to $BC$.`, `Segi tiga $ABC$ dan $PQR$ mempunyai $AB = PQ = ${a}$ cm, $AC = PR = ${b}$ cm dan $\\angle A = \\angle P = ${ang}^\\circ$. Buktikan bahawa keduanya kongruen dan nyatakan sudut sepadan bagi $\\angle B$ dan sisi yang sepadan dengan $BC$.`), a: T('SAS: two sides and the included angle are equal. $\\angle B$ corresponds to $\\angle Q$; $BC$ corresponds to $QR$.', 'SAS: dua sisi dan sudut yang diapit adalah sama. $\\angle B$ sepadan dengan $\\angle Q$; $BC$ sepadan dengan $QR$.'), w: W(T(`$AB = PQ$, $\\angle A = \\angle P$, $AC = PR$: the equal angle lies between the two pairs of equal sides, so SAS.`, `$AB = PQ$, $\\angle A = \\angle P$, $AC = PR$: sudut yang sama diapit oleh dua pasang sisi yang sama, jadi SAS.`), T('Match the vertices in order: $A \\leftrightarrow P$, $B \\leftrightarrow Q$, $C \\leftrightarrow R$, so $\\angle B \\leftrightarrow \\angle Q$ and $BC \\leftrightarrow QR$.', 'Padankan bucu mengikut susunan: $A \\leftrightarrow P$, $B \\leftrightarrow Q$, $C \\leftrightarrow R$, jadi $\\angle B \\leftrightarrow \\angle Q$ dan $BC \\leftrightarrow QR$.')), sp: 'm' };
    },
  ];
  const g51a = [
    (r) => ({ q: T('$ABCD$ is a parallelogram with diagonal $AC$. Show that triangles $ABC$ and $CDA$ are congruent, and deduce that opposite sides are equal.', '$ABCD$ ialah sebuah segi empat selari dengan pepenjuru $AC$. Tunjukkan bahawa segi tiga $ABC$ dan $CDA$ adalah kongruen, dan deduksikan bahawa sisi bertentangan adalah sama.'), a: T('$\\angle BAC = \\angle DCA$ and $\\angle BCA = \\angle DAC$ (alternate angles) with the common side $AC$: ASA. So $\\triangle ABC \\equiv \\triangle CDA$, and corresponding sides give $AB = CD$, $BC = DA$.', '$\\angle BAC = \\angle DCA$ dan $\\angle BCA = \\angle DAC$ (sudut berselang-seli) dengan sisi sepunya $AC$: ASA. Jadi $\\triangle ABC \\equiv \\triangle CDA$, dan sisi sepadan memberikan $AB = CD$, $BC = DA$.'), w: W(T('$AB \\parallel DC$: $\\angle BAC = \\angle DCA$ (alternate angles)', '$AB \\parallel DC$: $\\angle BAC = \\angle DCA$ (sudut berselang-seli)'), T('$BC \\parallel AD$: $\\angle BCA = \\angle DAC$ (alternate angles)', '$BC \\parallel AD$: $\\angle BCA = \\angle DAC$ (sudut berselang-seli)'), T('$AC$ is common and lies between the two pairs of equal angles: ASA, so $\\triangle ABC \\equiv \\triangle CDA$', '$AC$ sisi sepunya dan diapit oleh dua pasang sudut yang sama: ASA, jadi $\\triangle ABC \\equiv \\triangle CDA$'), T('Corresponding sides: $AB = CD$ and $BC = DA$', 'Sisi sepadan: $AB = CD$ dan $BC = DA$')), sp: 'l' }),
  ];
  const enl = (P, C, k) => [C[0] + k * (P[0] - C[0]), C[1] + k * (P[1] - C[1])];
  const tri = (r, lim) => retry(() => {
    const P = [0, 1, 2].map(() => [r.int(-lim, lim), r.int(-lim, lim)]);
    need(Math.abs((P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1])) >= 4);
    return P;
  });
  const g52e = [
    (r) => {
      const P = [r.nz(-4, 4), r.nz(-4, 4)], k = r.pick([2, 3]);
      return { q: T(`Find the image of $P = ${pt(P)}$ under an enlargement with centre the origin and scale factor ${k}.`, `Cari imej bagi $P = ${pt(P)}$ di bawah pembesaran berpusat pada asalan dengan faktor skala ${k}.`), a: T(`$${pt(enl(P, [0, 0], k))}$`), w: W(T(`Centre the origin: multiply each coordinate by ${k}`, `Pusat pada asalan: darabkan setiap koordinat dengan ${k}`), `$(${k} \\times ${par(P[0])}, ${k} \\times ${par(P[1])}) = ${pt(enl(P, [0, 0], k))}$`), sp: 's' };
    },
  ];
  const g52m = [
    (r) => {
      const C = [r.int(-3, 3), r.int(-3, 3)], P = [C[0] + r.int(-4, 4), C[1] + r.int(-4, 4)], k = r.pick([2, 3, 0.5, -1]);
      need(P[0] !== C[0] || P[1] !== C[1]);
      const I = enl(P, C, k);
      need(Number.isInteger(I[0]) && Number.isInteger(I[1]));
      return { q: T(`Find the image of $P = ${pt(P)}$ under an enlargement with centre $C = ${pt(C)}$ and scale factor ${k}.`, `Cari imej bagi $P = ${pt(P)}$ di bawah pembesaran berpusat $C = ${pt(C)}$ dengan faktor skala ${k}.`), a: T(`$${pt(I)}$`), w: T(`$C + ${k}(P - C)$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 6), k = r.pick([2, 3]);
      return { q: T(`A figure is enlarged with scale factor ${k}. A side of length ${a} cm becomes ${a * k} cm. Find the scale factor if the image is reduced back to ${a} cm, and the ratio of areas (image : object) for the enlargement.`, `Sebuah rajah dibesarkan dengan faktor skala ${k}. Satu sisi berukuran ${a} cm menjadi ${a * k} cm. Cari faktor skala jika imej dikecilkan kembali kepada ${a} cm, dan nisbah luas (imej : objek) bagi pembesaran itu.`), a: T(`Scale factor $\\dfrac{1}{${k}}$; area ratio $${k * k} : 1$`, `Faktor skala $\\dfrac{1}{${k}}$; nisbah luas $${k * k} : 1$`), w: W(T(`Reduction: $k = \\dfrac{\\text{image}}{\\text{object}} = \\dfrac{${a}}{${a * k}} = \\dfrac{1}{${k}}$`, `Pengecilan: $k = \\dfrac{\\text{imej}}{\\text{objek}} = \\dfrac{${a}}{${a * k}} = \\dfrac{1}{${k}}$`), T(`Area ratio $= k^2 = ${k}^2 = ${k * k}$, so $${k * k} : 1$`, `Nisbah luas $= k^2 = ${k}^2 = ${k * k}$, jadi $${k * k} : 1$`)), sp: 's' };
    },
  ];
  const g52a = [
    (r) => {
      return retry(() => {
        const C = [r.int(-3, 3), r.int(-3, 3)], k = r.pick([2, 3, -2]);
        const P = [C[0] + r.int(-3, 3), C[1] + r.int(-3, 3)], Q = [C[0] + r.int(-3, 3), C[1] + r.int(-3, 3)];
        need(!(P[0] === C[0] && P[1] === C[1]) && !(Q[0] === C[0] && Q[1] === C[1]) && (P[0] - C[0]) * (Q[1] - C[1]) !== (P[1] - C[1]) * (Q[0] - C[0]));
        const P2 = enl(P, C, k), Q2 = enl(Q, C, k);
        return { q: T(`An enlargement maps $P = ${pt(P)}$ to $P' = ${pt(P2)}$ and $Q = ${pt(Q)}$ to $Q' = ${pt(Q2)}$. Find the scale factor and the centre of the enlargement.`, `Satu pembesaran memetakan $P = ${pt(P)}$ kepada $P' = ${pt(P2)}$ dan $Q = ${pt(Q)}$ kepada $Q' = ${pt(Q2)}$. Cari faktor skala dan pusat pembesaran itu.`), a: T(`Scale factor ${k}; centre $${pt(C)}$`, `Faktor skala ${k}; pusat $${pt(C)}$`), w: T(`Lines $PP'$ and $QQ'$ meet at the centre; $k = \\dfrac{P'Q'}{PQ}$ (negative if the image is on the opposite side).`, `Garis $PP'$ dan $QQ'$ bertemu di pusat; $k = \\dfrac{P'Q'}{PQ}$ (negatif jika imej di sebelah bertentangan).`), sp: 'l' };
      });
    },
    (r) => {
      const A = r.int(6, 20), k = r.pick([2, 3, 4]);
      return { q: T(`An object has area ${A} cm². Its image under an enlargement has area ${A * k * k} cm². Find the scale factor of the enlargement.`, `Sebuah objek mempunyai luas ${A} cm². Imejnya di bawah satu pembesaran mempunyai luas ${A * k * k} cm². Cari faktor skala pembesaran itu.`), a: T(`Scale factor ${k} (area ratio $${k * k} = ${k}^2$)`, `Faktor skala ${k} (nisbah luas $${k * k} = ${k}^2$)`), w: W(T(`Area of image $= k^2 \\times$ area of object: $k^2 = \\dfrac{${A * k * k}}{${A}} = ${k * k}$`, `Luas imej $= k^2 \\times$ luas objek: $k^2 = \\dfrac{${A * k * k}}{${A}} = ${k * k}$`), `$k = \\sqrt{${k * k}} = ${k}$`), sp: 's' };
    },
  ];
  const T1 = (P, v) => [P[0] + v[0], P[1] + v[1]];
  const rot90 = (P) => [-P[1], P[0]];
  const g53e = [
    (r) => {
      const P = [r.int(-3, 3), r.int(-3, 3)], v = [r.int(-3, 3), r.int(-3, 3)], w = [r.int(-3, 3), r.int(-3, 3)];
      const I1 = T1(P, v), I2 = T1(I1, w);
      return { q: T(`$P = ${pt(P)}$ is mapped by translation $\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix}$ followed by translation $\\begin{pmatrix} ${w[0]} \\\\ ${w[1]} \\end{pmatrix}$. Find the final image and the single translation that does this.`, `$P = ${pt(P)}$ dipetakan oleh translasi $\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix}$ diikuti oleh translasi $\\begin{pmatrix} ${w[0]} \\\\ ${w[1]} \\end{pmatrix}$. Cari imej akhir dan translasi tunggal yang menghasilkannya.`), a: T(`$${pt(I2)}$; $\\begin{pmatrix} ${v[0] + w[0]} \\\\ ${v[1] + w[1]} \\end{pmatrix}$`), w: W(`$${pt(P)} \\to (${n(P[0])} + ${par(v[0])}, ${n(P[1])} + ${par(v[1])}) = ${pt(I1)}$`, `$${pt(I1)} \\to (${n(I1[0])} + ${par(w[0])}, ${n(I1[1])} + ${par(w[1])}) = ${pt(I2)}$`, T(`Single translation: $${tv(v)} + ${tv(w)} = ${tv([v[0] + w[0], v[1] + w[1]])}$`, `Translasi tunggal: $${tv(v)} + ${tv(w)} = ${tv([v[0] + w[0], v[1] + w[1]])}$`)), sp: 's' };
    },
  ];
  const g53m = [
    (r) => {
      const P = [r.nz(-4, 4), r.nz(-4, 4)];
      const refl = [P[0], -P[1]], rot = rot90(refl);
      return { q: T(`$P = ${pt(P)}$ is first reflected in the $x$-axis, and then rotated $90^\\circ$ anticlockwise about the origin. Find the final image.`, `$P = ${pt(P)}$ mula-mula dipantulkan pada paksi-$x$, kemudian diputarkan $90^\\circ$ lawan arah jam pada asalan. Cari imej akhir.`), a: T(`After reflection $${pt(refl)}$; final image $${pt(rot)}$`, `Selepas pantulan $${pt(refl)}$; imej akhir $${pt(rot)}$`), w: W(T(`Reflection in the $x$-axis, $(x, y) \\to (x, -y)$: $${pt(P)} \\to ${pt(refl)}$`, `Pantulan pada paksi-$x$, $(x, y) \\to (x, -y)$: $${pt(P)} \\to ${pt(refl)}$`), T(`Rotation $90^\\circ$ anticlockwise about $O$, $(x, y) \\to (-y, x)$: $${pt(refl)} \\to ${pt(rot)}$`, `Putaran $90^\\circ$ lawan arah jam pada $O$, $(x, y) \\to (-y, x)$: $${pt(refl)} \\to ${pt(rot)}$`)), sp: 's' };
    },
    (r) => {
      const P = [r.int(-3, 3), r.int(-3, 3)], k = r.pick([2, 3]), v = [r.int(-3, 3), r.int(-3, 3)];
      const I = enl(P, [0, 0], k), F = T1(I, v);
      return { q: T(`$P = ${pt(P)}$ is enlarged with centre the origin and scale factor ${k}, and then translated by $\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix}$. Find the final image.`, `$P = ${pt(P)}$ dibesarkan dengan pusat pada asalan dan faktor skala ${k}, kemudian ditranslasikan oleh $\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix}$. Cari imej akhir.`), a: T(`After enlargement $${pt(I)}$; final image $${pt(F)}$`, `Selepas pembesaran $${pt(I)}$; imej akhir $${pt(F)}$`), w: W(T(`Enlargement: $(${k} \\times ${par(P[0])}, ${k} \\times ${par(P[1])}) = ${pt(I)}$`, `Pembesaran: $(${k} \\times ${par(P[0])}, ${k} \\times ${par(P[1])}) = ${pt(I)}$`), T(`Translation: $(${n(I[0])} + ${par(v[0])}, ${n(I[1])} + ${par(v[1])}) = ${pt(F)}$`, `Translasi: $(${n(I[0])} + ${par(v[0])}, ${n(I[1])} + ${par(v[1])}) = ${pt(F)}$`)), sp: 's' };
    },
  ];
  const g53a = [
    (r) => {
      const P = [r.nz(-3, 3), r.nz(-3, 3)];
      const V = (p) => [p[0], -p[1]], Wr = rot90;
      const a = Wr(V(P)), b = V(Wr(P));
      return { q: T(`Let $V$ be reflection in the $x$-axis and $W$ be rotation $90^\\circ$ anticlockwise about the origin. Find the image of $P = ${pt(P)}$ under (a) $V$ followed by $W$, (b) $W$ followed by $V$. Are they the same?`, `Katakan $V$ ialah pantulan pada paksi-$x$ dan $W$ ialah putaran $90^\\circ$ lawan arah jam pada asalan. Cari imej bagi $P = ${pt(P)}$ di bawah (a) $V$ diikuti $W$, (b) $W$ diikuti $V$. Adakah kedua-duanya sama?`), a: T(`(a) $${pt(a)}$ (b) $${pt(b)}$; ${a[0] === b[0] && a[1] === b[1] ? 'the same for this point, but not for every point' : 'not the same'}: the order matters.`, `(a) $${pt(a)}$ (b) $${pt(b)}$; ${a[0] === b[0] && a[1] === b[1] ? 'sama bagi titik ini, tetapi tidak bagi setiap titik' : 'tidak sama'}: susunan adalah penting.`), w: W(T('$V$: $(x, y) \\to (x, -y)$; $W$: $(x, y) \\to (-y, x)$', '$V$: $(x, y) \\to (x, -y)$; $W$: $(x, y) \\to (-y, x)$'), `(a) $${pt(P)} \\xrightarrow{V} ${pt(V(P))} \\xrightarrow{W} ${pt(a)}$`, `(b) $${pt(P)} \\xrightarrow{W} ${pt(Wr(P))} \\xrightarrow{V} ${pt(b)}$`), sp: 'm' };
    },
  ];
  const g54e = [
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8]);
      const nm = { 3: ['equilateral triangles', 'segi tiga sama sisi'], 4: ['squares', 'segi empat sama'], 5: ['regular pentagons', 'pentagon sekata'], 6: ['regular hexagons', 'heksagon sekata'], 8: ['regular octagons', 'oktagon sekata'] }[k];
      const ang = 180 - 360 / k, ok = Number.isInteger(360 / ang);
      return { q: T(`Can identical ${nm[0]} tessellate on their own? Use the interior angle to explain.`, `Bolehkah ${nm[1]} yang serupa bertesselasi dengan sendirinya? Gunakan sudut pedalaman untuk menerangkan.`), a: ok ? T(`Yes: the interior angle is $${n(ang)}^\\circ$ and $360 \\div ${n(ang)} = ${360 / ang}$, a whole number, so ${360 / ang} of them fit round a point.`, `Ya: sudut pedalaman ialah $${n(ang)}^\\circ$ dan $360 \\div ${n(ang)} = ${360 / ang}$, nombor bulat, jadi ${360 / ang} daripadanya muat di sekeliling satu titik.`) : T(`No: the interior angle is $${n(ang)}^\\circ$ and $360 \\div ${n(ang)} = ${n(round(360 / ang, 2))}$ is not a whole number, so gaps or overlaps remain.`, `Tidak: sudut pedalaman ialah $${n(ang)}^\\circ$ dan $360 \\div ${n(ang)} = ${n(round(360 / ang, 2))}$ bukan nombor bulat, jadi jurang atau pertindihan tetap ada.`), w: W(T(`Interior angle $= 180^\\circ - \\dfrac{360^\\circ}{${k}} = ${n(ang)}^\\circ$`, `Sudut pedalaman $= 180^\\circ - \\dfrac{360^\\circ}{${k}} = ${n(ang)}^\\circ$`), `$360 \\div ${n(ang)} ${eq2(360 / ang)}$`, T('A shape tessellates on its own only if its interior angle divides $360^\\circ$ exactly.', 'Suatu bentuk bertesselasi dengan sendirinya hanya jika sudut pedalamannya membahagi $360^\\circ$ dengan tepat.')), sp: 's' };
    },
  ];
  const g54m = [
    (r) => ({ q: T('Show that a regular octagon and a square can be used together to tessellate. Use the angles at a vertex.', 'Tunjukkan bahawa sebuah oktagon sekata dan sebuah segi empat sama boleh digunakan bersama untuk bertesselasi. Gunakan sudut pada satu bucu.'), a: T('The interior angle of a regular octagon is $135^\\circ$ and of a square $90^\\circ$: $135^\\circ + 135^\\circ + 90^\\circ = 360^\\circ$, so two octagons and one square fit exactly around a point.', 'Sudut pedalaman oktagon sekata ialah $135^\\circ$ dan segi empat sama $90^\\circ$: $135^\\circ + 135^\\circ + 90^\\circ = 360^\\circ$, jadi dua oktagon dan satu segi empat sama muat tepat di sekeliling satu titik.'), w: W(T('Regular octagon: $180^\\circ - \\dfrac{360^\\circ}{8} = 135^\\circ$; square: $90^\\circ$', 'Oktagon sekata: $180^\\circ - \\dfrac{360^\\circ}{8} = 135^\\circ$; segi empat sama: $90^\\circ$'), '$2 \\times 135^\\circ + 90^\\circ = 360^\\circ$'), sp: 'm' }),
  ];
  const g54a = [
    (r) => {
      const a = r.pick([[4, 6, 12, 90, 120, 150], [3, 12, 12, 60, 150, 150]]);
      return { q: T(`Check whether a ${a[0] === 4 ? 'square, a regular hexagon and a regular dodecagon' : 'equilateral triangle and two regular dodecagons'} can meet at a point without gaps or overlaps. Interior angles: ${a[3]}°, ${a[4]}°, ${a[5]}°.`, `Semak sama ada ${a[0] === 4 ? 'segi empat sama, heksagon sekata dan dodekagon sekata' : 'segi tiga sama sisi dan dua dodekagon sekata'} boleh bertemu pada satu titik tanpa jurang atau pertindihan. Sudut pedalaman: ${a[3]}°, ${a[4]}°, ${a[5]}°.`), a: T(`$${a[3]} + ${a[4]} + ${a[5]} = ${a[3] + a[4] + a[5]}$, which equals $360^\\circ$, so they can tessellate.`, `$${a[3]} + ${a[4]} + ${a[5]} = ${a[3] + a[4] + a[5]}$, iaitu sama dengan $360^\\circ$, jadi ia boleh bertesselasi.`), w: W(T('Shapes meet at a point without gaps or overlaps exactly when their angles there add up to $360^\\circ$.', 'Bentuk-bentuk bertemu pada satu titik tanpa jurang atau pertindihan tepat apabila sudut-sudutnya di situ berjumlah $360^\\circ$.'), `$${a[3]}^\\circ + ${a[4]}^\\circ + ${a[5]}^\\circ = ${a[3] + a[4] + a[5]}^\\circ$`), sp: 'm' };
    },
  ];
  SPM.addChapter(5, 5, T('Congruency, Enlargement and Combined Transformations', 'Kekongruenan, Pembesaran dan Gabungan Transformasi'), [
    { id: '5.1', en: 'Congruency', ms: 'Kekongruenan', gen: { e: g51e, m: g51m, a: g51a } },
    { id: '5.2', en: 'Similarity and enlargement', ms: 'Keserupaan dan pembesaran', gen: { e: g52e, m: g52m, a: g52a } },
    { id: '5.3', en: 'Combined transformations', ms: 'Gabungan transformasi', gen: { e: g53e, m: g53m, a: g53a } },
    { id: '5.4', en: 'Tessellation', ms: 'Tesselasi', gen: { e: g54e, m: g54m, a: g54a } },
  ]);

  /* =============================================================== 6 */
  const SIN = ['\\dfrac{1}{2}', '\\dfrac{\\sqrt{2}}{2}', '\\dfrac{\\sqrt{3}}{2}'], COS = SIN.slice().reverse(), TAN = ['\\dfrac{\\sqrt{3}}{3}', '1', '\\sqrt{3}'];
  const idx = { 30: 0, 45: 1, 60: 2 };
  const refAngle = (t) => (t <= 90 ? t : t <= 180 ? 180 - t : t <= 270 ? t - 180 : 360 - t);
  const quadOf = (t) => (t < 90 ? 1 : t < 180 ? 2 : t < 270 ? 3 : 4);
  const sgn = { sin: [1, 1, -1, -1], cos: [1, -1, -1, 1], tan: [1, -1, 1, -1] };
  const exact = (fn, t) => {
    const a = refAngle(t), q = quadOf(t);
    const table = fn === 'sin' ? SIN : fn === 'cos' ? COS : TAN;
    const s = sgn[fn][q - 1];
    return (s < 0 ? '-' : '') + table[idx[a]];
  };
  const NONQ = [30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330];
  const QN = ['', 'I', 'II', 'III', 'IV'];
  /** angle in quadrant q from reference angle a, as TeX "180^\circ - 30^\circ = 150^\circ" */
  const fromRef = (a, q) => (q === 1 ? `${a}^\\circ` : q === 2 ? `180^\\circ - ${a}^\\circ = ${180 - a}^\\circ` : q === 3 ? `180^\\circ + ${a}^\\circ = ${180 + a}^\\circ` : `360^\\circ - ${a}^\\circ = ${360 - a}^\\circ`);
  /** reference angle of t, as TeX */
  const refTex = (t) => { const q = quadOf(t); return q === 1 ? `${t}^\\circ` : q === 2 ? `180^\\circ - ${t}^\\circ = ${180 - t}^\\circ` : q === 3 ? `${t}^\\circ - 180^\\circ = ${t - 180}^\\circ` : `360^\\circ - ${t}^\\circ = ${360 - t}^\\circ`; };
  const quadLine = (t) => { const q = quadOf(t), lo = 90 * (q - 1); return T(`$${lo}^\\circ < ${t}^\\circ < ${lo + 90}^\\circ$, so quadrant ${QN[q]}`, `$${lo}^\\circ < ${t}^\\circ < ${lo + 90}^\\circ$, jadi sukuan ${QN[q]}`); };
  const g61e = [
    (r) => {
      const t = r.pick([25, 100, 200, 250, 300, 330, 145]);
      return { q: T(`State the quadrant in which $${t}^\\circ$ lies and the reference (associated acute) angle.`, `Nyatakan sukuan tempat $${t}^\\circ$ berada dan sudut rujukan (sudut tirus sekutu).`), a: T(`Quadrant ${['', 'I', 'II', 'III', 'IV'][quadOf(t)]}; reference angle $${refAngle(t)}^\\circ$`, `Sukuan ${['', 'I', 'II', 'III', 'IV'][quadOf(t)]}; sudut rujukan $${refAngle(t)}^\\circ$`), w: W(quadLine(t), T(`Reference angle $= ${refTex(t)}$`, `Sudut rujukan $= ${refTex(t)}$`)), sp: 's' };
    },
    (r) => {
      const c = r.pick([['\\sin 90^\\circ', '1', 90], ['\\cos 180^\\circ', '-1', 180], ['\\tan 180^\\circ', '0', 180], ['\\cos 270^\\circ', '0', 270], ['\\sin 270^\\circ', '-1', 270], ['\\tan 90^\\circ', '\\text{not defined}', 90]]);
      const P = { 90: [0, 1], 180: [-1, 0], 270: [0, -1] }[c[2]];
      const w = W(T(`On the unit circle, $${c[2]}^\\circ$ gives the point $(x, y) = ${pt(P)}$; $\\sin\\theta = y$, $\\cos\\theta = x$, $\\tan\\theta = \\dfrac{y}{x}$`, `Pada bulatan unit, $${c[2]}^\\circ$ memberikan titik $(x, y) = ${pt(P)}$; $\\sin\\theta = y$, $\\cos\\theta = x$, $\\tan\\theta = \\dfrac{y}{x}$`), c[1] === '\\text{not defined}' ? T(`$\\tan ${c[2]}^\\circ = \\dfrac{${P[1]}}{${P[0]}}$: division by zero, so not defined`, `$\\tan ${c[2]}^\\circ = \\dfrac{${P[1]}}{${P[0]}}$: pembahagian dengan sifar, jadi tidak ditakrifkan`) : `$${c[0]} = ${c[1]}$`);
      return { q: T(`Write down the value of $${c[0]}$.`, `Tuliskan nilai $${c[0]}$.`), a: c[1] === '\\text{not defined}' ? T('not defined', 'tidak ditakrifkan') : T(`$${c[1]}$`), w, sp: 'xs' };
    },
  ];
  const g61m = [
    (r) => {
      const t = r.pick(NONQ.filter((v) => v > 90)), fn = r.pick(['sin', 'cos', 'tan']);
      return { q: T(`Find the exact value of $\\${fn} ${t}^\\circ$ using the reference angle.`, `Cari nilai tepat bagi $\\${fn} ${t}^\\circ$ menggunakan sudut rujukan.`), a: T(`$${exact(fn, t)}$`), w: T(`Reference angle $${refAngle(t)}^\\circ$, quadrant ${['', 'I', 'II', 'III', 'IV'][quadOf(t)]}`, `Sudut rujukan $${refAngle(t)}^\\circ$, sukuan ${['', 'I', 'II', 'III', 'IV'][quadOf(t)]}`), sp: 's' };
    },
  ];
  const g61a = [
    (r) => {
      const [p, q, h] = r.pick([[5, 12, 13], [3, 4, 5], [8, 15, 17], [7, 24, 25]]);
      // sin t = p/h , t obtuse => cos = -q/h ; tan = -p/q
      return { q: T(`Given $\\sin\\theta = \\dfrac{${p}}{${h}}$ and $\\theta$ is obtuse, find $\\cos\\theta$ and $\\tan\\theta$.`, `Diberi $\\sin\\theta = \\dfrac{${p}}{${h}}$ dan $\\theta$ ialah sudut cakah, cari $\\cos\\theta$ dan $\\tan\\theta$.`), a: T(`$\\cos\\theta = -\\dfrac{${q}}{${h}}$, $\\tan\\theta = -\\dfrac{${p}}{${q}}$`), w: T(`Reference triangle $${p}, ${q}, ${h}$; cosine and tangent are negative in quadrant II`, `Segi tiga rujukan $${p}, ${q}, ${h}$; kosinus dan tangen negatif dalam sukuan II`), sp: 'm' };
    },
    (r) => {
      const c = r.pick([['\\sin', '\\dfrac{1}{2}', 30, 150], ['\\cos', '-\\dfrac{\\sqrt{3}}{2}', 150, 210], ['\\tan', '1', 45, 225], ['\\sin', '-\\dfrac{\\sqrt{2}}{2}', 225, 315], ['\\cos', '\\dfrac{1}{2}', 60, 300]]);
      const ra = refAngle(c[2]), neg = c[1][0] === '-', q1 = quadOf(c[2]), q2 = quadOf(c[3]);
      const w = W(T(`Reference angle: $${c[0]} ${ra}^\\circ = ${neg ? c[1].slice(1) : c[1]}$, so it is $${ra}^\\circ$`, `Sudut rujukan: $${c[0]} ${ra}^\\circ = ${neg ? c[1].slice(1) : c[1]}$, jadi ia ialah $${ra}^\\circ$`), T(`$${c[0]}\\,\\theta$ is ${neg ? 'negative' : 'positive'} in quadrants ${QN[q1]} and ${QN[q2]}`, `$${c[0]}\\,\\theta$ ${neg ? 'negatif' : 'positif'} dalam sukuan ${QN[q1]} dan ${QN[q2]}`), `$\\theta = ${fromRef(ra, q1)}$, $\\theta = ${fromRef(ra, q2)}$`);
      return { w, q: T(`Find all values of $\\theta$ from $0^\\circ$ to $360^\\circ$ for which $${c[0]}\\,\\theta = ${c[1]}$.`, `Cari semua nilai $\\theta$ dari $0^\\circ$ hingga $360^\\circ$ bagi $${c[0]}\\,\\theta = ${c[1]}$.`), a: T(`$\\theta = ${c[2]}^\\circ$ or $${c[3]}^\\circ$`, `$\\theta = ${c[2]}^\\circ$ atau $${c[3]}^\\circ$`), sp: 'm' };
    },
  ];
  const trigPts = (f, a, b, k) => range(0, 120).map((i) => [(a + ((b - a) * i) / 120), f(a + ((b - a) * i) / 120)]);
  const trigFig = (fn, amp, per, c) => S.graph({ w: 340, h: 210, xr: [0, 360, 90], yr: [-4, 4, 1], xlabel: '', series: (() => {
    if (fn === 'tan') {
      const s = [];
      for (const [a, b] of [[0, 89], [91, 269], [271, 360]]) s.push({ pts: range(0, 60).map((i) => { const x = a + ((b - a) * i) / 60; return [x, Math.max(-4, Math.min(4, Math.tan(rad(x)))) ]; }), type: 'line' });
      return s;
    }
    const f = fn === 'sin' ? (x) => amp * Math.sin(rad((360 / per) * x)) + c : (x) => amp * Math.cos(rad((360 / per) * x)) + c;
    return [{ pts: range(0, 180).map((i) => [(360 * i) / 180, f((360 * i) / 180)]), type: 'line' }];
  })() });
  const g62e = [
    (r) => {
      const fn = r.pick(['sin', 'cos', 'tan']);
      const fig = trigFig(fn, 1, 360, 0);
      return { q: T('The graph shows one of $y = \\sin x$, $y = \\cos x$ or $y = \\tan x$ for $0^\\circ \\le x \\le 360^\\circ$. Which one is it?', 'Graf menunjukkan salah satu daripada $y = \\sin x$, $y = \\cos x$ atau $y = \\tan x$ bagi $0^\\circ \\le x \\le 360^\\circ$. Yang manakah?'), fig, a: T(`$y = \\${fn} x$`), w: W({ sin: T('Starts at $(0^\\circ, 0)$, maximum $1$ at $90^\\circ$, minimum $-1$ at $270^\\circ$: sine.', 'Bermula di $(0^\\circ, 0)$, maksimum $1$ pada $90^\\circ$, minimum $-1$ pada $270^\\circ$: sinus.'), cos: T('Starts at its maximum $(0^\\circ, 1)$, minimum $-1$ at $180^\\circ$: cosine.', 'Bermula pada maksimumnya $(0^\\circ, 1)$, minimum $-1$ pada $180^\\circ$: kosinus.'), tan: T('No maximum or minimum; the graph breaks at $90^\\circ$ and $270^\\circ$ (asymptotes) and repeats every $180^\\circ$: tangent.', 'Tiada maksimum atau minimum; graf terputus pada $90^\\circ$ dan $270^\\circ$ (asimptot) dan berulang setiap $180^\\circ$: tangen.') }[fn]), sp: 's' };
    },
    (r) => ({ q: T('State the maximum and minimum values of $y = \\sin x$ and the values of $x$ (from $0^\\circ$ to $360^\\circ$) at which they occur.', 'Nyatakan nilai maksimum dan minimum bagi $y = \\sin x$ dan nilai $x$ (dari $0^\\circ$ hingga $360^\\circ$) apabila ia berlaku.'), a: T('Maximum $1$ at $x = 90^\\circ$; minimum $-1$ at $x = 270^\\circ$', 'Maksimum $1$ pada $x = 90^\\circ$; minimum $-1$ pada $x = 270^\\circ$'), w: W(T('$\\sin x$ is the $y$-coordinate of a point on the unit circle: highest at the top ($x = 90^\\circ$), lowest at the bottom ($x = 270^\\circ$).', '$\\sin x$ ialah koordinat-$y$ bagi titik pada bulatan unit: tertinggi di bahagian atas ($x = 90^\\circ$), terendah di bahagian bawah ($x = 270^\\circ$).'), '$\\sin 90^\\circ = 1$, $\\sin 270^\\circ = -1$'), sp: 's' }),
  ];
  const g62m = [
    (r) => {
      const a = r.int(2, 4), b = r.pick([2, 3]), fn = r.pick(['sin', 'cos']);
      return { q: T(`State the amplitude and the period of $y = ${a} \\${fn} ${b}x$.`, `Nyatakan amplitud dan tempoh bagi $y = ${a} \\${fn} ${b}x$.`), a: T(`Amplitude ${a}; period $${360 / b}^\\circ$`, `Amplitud ${a}; tempoh $${360 / b}^\\circ$`), w: W(T(`For $y = a \\${fn} bx$: amplitude $= |a| = ${a}$`, `Bagi $y = a \\${fn} bx$: amplitud $= |a| = ${a}$`), T(`Period $= \\dfrac{360^\\circ}{b} = \\dfrac{360^\\circ}{${b}} = ${360 / b}^\\circ$`, `Tempoh $= \\dfrac{360^\\circ}{b} = \\dfrac{360^\\circ}{${b}} = ${360 / b}^\\circ$`)), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 3), b = r.pick([1, 2]);
      return { q: T(`Sketch the graph of $y = ${a} \\sin ${b === 1 ? '' : b}x$ for $0^\\circ \\le x \\le 360^\\circ$, showing the maximum and minimum values.`, `Lakar graf $y = ${a} \\sin ${b === 1 ? '' : b}x$ bagi $0^\\circ \\le x \\le 360^\\circ$, dengan menunjukkan nilai maksimum dan minimum.`), fig: S.graph({ w: 340, h: 210, xr: [0, 360, 90], yr: [-4, 4, 1] }), a: T(`${trigFig('sin', a, 360 / b, 0)} Maximum ${a}, minimum ${-a}, ${b} cycle${b > 1 ? 's' : ''}`, `${trigFig('sin', a, 360 / b, 0)} Maksimum ${a}, minimum ${-a}, ${b} kitaran`), w: W(T(`Amplitude ${a}: maximum $${a}$, minimum $${-a}$`, `Amplitud ${a}: maksimum $${a}$, minimum $${-a}$`), T(`Period $\\dfrac{360^\\circ}{${b}} = ${360 / b}^\\circ$, so ${b} cycle${b > 1 ? 's' : ''} from $0^\\circ$ to $360^\\circ$`, `Tempoh $\\dfrac{360^\\circ}{${b}} = ${360 / b}^\\circ$, jadi ${b} kitaran dari $0^\\circ$ hingga $360^\\circ$`), T(`Maximum at $x = ${[90, 450].map((v) => v / b).filter((v) => v <= 360).join('^\\circ, ')}^\\circ$; minimum at $x = ${[270, 630].map((v) => v / b).filter((v) => v <= 360).join('^\\circ, ')}^\\circ$`, `Maksimum pada $x = ${[90, 450].map((v) => v / b).filter((v) => v <= 360).join('^\\circ, ')}^\\circ$; minimum pada $x = ${[270, 630].map((v) => v / b).filter((v) => v <= 360).join('^\\circ, ')}^\\circ$`)), sp: 'xl' };
    },
  ];
  const g62a = [
    (r) => {
      const a = r.int(1, 2), b = r.pick([1, 2]), c = r.int(0, 1);
      const fig = trigFig('cos', a, 360 / b, c);
      return { q: T('The graph is of the form $y = a \\cos bx + c$ ($a$, $b$, $c$ positive or $c = 0$). Use the maximum, the minimum and the period to find $a$, $b$ and $c$.', 'Graf itu berbentuk $y = a \\cos bx + c$ ($a$, $b$, $c$ positif atau $c = 0$). Gunakan nilai maksimum, minimum dan tempoh untuk mencari $a$, $b$ dan $c$.'), fig, a: T(`Maximum ${a + c}, minimum ${c - a}: $a = ${a}$, $c = ${c}$; period $${360 / b}^\\circ$ so $b = ${b}$`, `Maksimum ${a + c}, minimum ${c - a}: $a = ${a}$, $c = ${c}$; tempoh $${360 / b}^\\circ$ jadi $b = ${b}$`), w: W(T(`From the graph: maximum $= a + c = ${a + c}$, minimum $= c - a = ${c - a}$`, `Daripada graf: maksimum $= a + c = ${a + c}$, minimum $= c - a = ${c - a}$`), `$a = \\dfrac{${a + c} - ${par(c - a)}}{2} = ${a}$, $c = \\dfrac{${a + c} + ${par(c - a)}}{2} = ${c}$`, T(`One cycle takes $${360 / b}^\\circ$: $b = \\dfrac{360^\\circ}{${360 / b}^\\circ} = ${b}$`, `Satu kitaran mengambil $${360 / b}^\\circ$: $b = \\dfrac{360^\\circ}{${360 / b}^\\circ} = ${b}$`)), sp: 'm' };
    },
  ];
  SPM.addChapter(5, 6, T('Ratios and Graphs of Trigonometric Functions', 'Nisbah dan Graf Fungsi Trigonometri'), [
    { id: '6.1', en: 'Trigonometric ratios of any angle', ms: 'Nisbah trigonometri bagi sebarang sudut', gen: { e: g61e, m: g61m, a: g61a } },
    { id: '6.2', en: 'Graphs of trigonometric functions', ms: 'Graf fungsi trigonometri', gen: { e: g62e, m: g62m, a: g62a } },
  ]);

  /* =============================================================== 7 */
  const cls = (lo, w, k) => range(0, k - 1).map((i) => [lo + i * w, lo + (i + 1) * w - 1]);
  const mid = (c) => (c[0] + c[1]) / 2;
  const bnd = (c) => [c[0] - 0.5, c[1] + 0.5];
  const gt = (cl, fs, head, cols) => SPM.table(cl.map((c, i) => [`${c[0]}–${c[1]}`, fs[i], ...(cols ? cols[i] : [])]), { head });
  const gStats = (cl, fs) => {
    const N = sum(fs), sx = sum(cl.map((c, i) => mid(c) * fs[i])), sxx = sum(cl.map((c, i) => mid(c) * mid(c) * fs[i]));
    const m = sx / N, v = sxx / N - m * m;
    return { N, sx, sxx, m, v, sd: Math.sqrt(v) };
  };
  const f2 = (x) => n(round(x, 2));
  /** worked lines for the mean and standard deviation of grouped data (pre = optional label) */
  const sdLines = (st, pre) => {
    pre = pre || T('', '');
    return [
      T(`${pre.en}Mean $\\bar{x} = \\dfrac{\\sum fx}{\\sum f} = \\dfrac{${n(st.sx)}}{${st.N}} ${eq2(st.m)}$`, `${pre.ms}Min $\\bar{x} = \\dfrac{\\sum fx}{\\sum f} = \\dfrac{${n(st.sx)}}{${st.N}} ${eq2(st.m)}$`),
      T(`${pre.en}Standard deviation $\\sigma = \\sqrt{\\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2} = \\sqrt{\\dfrac{${n(st.sxx)}}{${st.N}} - ${f2(st.m)}^2} ${eq2(st.sd)}$`, `${pre.ms}Sisihan piawai $\\sigma = \\sqrt{\\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2} = \\sqrt{\\dfrac{${n(st.sxx)}}{${st.N}} - ${f2(st.m)}^2} ${eq2(st.sd)}$`),
    ];
  };
  /** interpolation line on the ogive: value at cumulative frequency `target` */
  const interpLine = (cl, fs, target) => {
    const cf = cfOf(fs);
    let i = 0;
    while (i < cl.length - 1 && cf[i] < target) i++;
    const prev = i ? cf[i - 1] : 0, lo = cl[i][0] - 0.5, w = cl[i][1] - cl[i][0] + 1;
    return `${n(lo)} + \\dfrac{${n(target)} - ${prev}}{${fs[i]}} \\times ${w} ${eq2(interp(cl, fs, target))}`;
  };
  const g71e = [
    (r) => {
      const cl = cls(r.pick([10, 20, 30]), 10, 4), fs = cl.map(() => r.int(2, 12));
      return { q: T(`For the class interval ${cl[1][0]}–${cl[1][1]}, state the lower and upper boundaries, the class size and the midpoint.`, `Bagi selang kelas ${cl[1][0]}–${cl[1][1]}, nyatakan sempadan bawah dan atas, saiz kelas dan titik tengah.`), a: T(`Boundaries ${bnd(cl[1])[0]} and ${bnd(cl[1])[1]}; class size 10; midpoint ${mid(cl[1])}`, `Sempadan ${bnd(cl[1])[0]} dan ${bnd(cl[1])[1]}; saiz kelas 10; titik tengah ${mid(cl[1])}`), w: W(T(`Lower boundary $= ${cl[1][0]} - 0.5 = ${bnd(cl[1])[0]}$, upper boundary $= ${cl[1][1]} + 0.5 = ${bnd(cl[1])[1]}$`, `Sempadan bawah $= ${cl[1][0]} - 0.5 = ${bnd(cl[1])[0]}$, sempadan atas $= ${cl[1][1]} + 0.5 = ${bnd(cl[1])[1]}$`), T(`Class size $= ${bnd(cl[1])[1]} - ${bnd(cl[1])[0]} = 10$`, `Saiz kelas $= ${bnd(cl[1])[1]} - ${bnd(cl[1])[0]} = 10$`), T(`Midpoint $= \\dfrac{${cl[1][0]} + ${cl[1][1]}}{2} = ${mid(cl[1])}$`, `Titik tengah $= \\dfrac{${cl[1][0]} + ${cl[1][1]}}{2} = ${mid(cl[1])}$`)), sp: 's' };
    },
    (r) => {
      const N = r.int(20, 40), sx = r.int(600, 900), sxx = Math.round(N * ((sx / N) ** 2 + r.int(20, 80)));
      const m = sx / N, v = sxx / N - m * m;
      return { q: T(`For a grouped data set, $\\sum f = ${N}$, $\\sum fx = ${sx}$ and $\\sum fx^2 = ${sxx}$. Find the mean and the standard deviation (2 decimal places).`, `Bagi satu set data terkumpul, $\\sum f = ${N}$, $\\sum fx = ${sx}$ dan $\\sum fx^2 = ${sxx}$. Cari min dan sisihan piawai (2 tempat perpuluhan).`), a: T(`Mean $${f2(m)}$; s.d. $\\sqrt{\\dfrac{${sxx}}{${N}} - ${f2(m)}^2} = ${f2(Math.sqrt(v))}$`, `Min $${f2(m)}$; s.p. $\\sqrt{\\dfrac{${sxx}}{${N}} - ${f2(m)}^2} = ${f2(Math.sqrt(v))}$`), w: W(...sdLines({ N, sx, sxx, m, sd: Math.sqrt(v) })), sp: 's' };
    },
  ];
  const g71m = [
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 4), fs = cl.map(() => r.int(2, 10));
      const st = gStats(cl, fs);
      return { q: T(`The table shows the marks of ${st.N} students.<br>${gt(cl, fs, ['Marks', 'Frequency'])}<br>Complete a table with midpoint $x$, $fx$ and $fx^2$, and find the mean and standard deviation, correct to 2 decimal places.`, `Jadual menunjukkan markah ${st.N} orang murid.<br>${gt(cl, fs, ['Markah', 'Kekerapan'])}<br>Lengkapkan jadual dengan titik tengah $x$, $fx$ dan $fx^2$, dan cari min dan sisihan piawai, betul kepada 2 tempat perpuluhan.`), a: T(`Midpoints ${cl.map(mid).join(', ')}; $\\sum fx = ${st.sx}$, $\\sum fx^2 = ${n(st.sxx)}$; mean ${f2(st.m)}; s.d. ${f2(st.sd)}`, `Titik tengah ${cl.map(mid).join(', ')}; $\\sum fx = ${st.sx}$, $\\sum fx^2 = ${n(st.sxx)}$; min ${f2(st.m)}; s.p. ${f2(st.sd)}`), w: W(T(`Midpoints $x$: ${cl.map((c) => `$\\dfrac{${c[0]} + ${c[1]}}{2} = ${mid(c)}$`).join(', ')}`, `Titik tengah $x$: ${cl.map((c) => `$\\dfrac{${c[0]} + ${c[1]}}{2} = ${mid(c)}$`).join(', ')}`), `$\\sum f = ${st.N}$, $\\sum fx = ${n(st.sx)}$, $\\sum fx^2 = ${n(st.sxx)}$`, ...sdLines(st)), sp: 'xl' };
    },
  ];
  const g71a = [
    (r) => {
      const cl = cls(10, 10, 4);
      const fA = cl.map(() => r.int(2, 12)), fB = cl.map(() => r.int(2, 12));
      const A = gStats(cl, fA), B = gStats(cl, fB);
      return { q: T(`Two classes sat the same test. Class $A$ frequencies: ${fA.join(', ')}. Class $B$ frequencies: ${fB.join(', ')} for the marks 10–19, 20–29, 30–39, 40–49. Find the mean and standard deviation of each class and say which class is more consistent.`, `Dua kelas menduduki ujian yang sama. Kekerapan Kelas $A$: ${fA.join(', ')}. Kekerapan Kelas $B$: ${fB.join(', ')} bagi markah 10–19, 20–29, 30–39, 40–49. Cari min dan sisihan piawai bagi setiap kelas dan nyatakan kelas yang lebih konsisten.`), a: T(`A: mean ${f2(A.m)}, s.d. ${f2(A.sd)}; B: mean ${f2(B.m)}, s.d. ${f2(B.sd)}. ${A.sd <= B.sd ? 'A' : 'B'} is more consistent (smaller standard deviation).`, `A: min ${f2(A.m)}, s.p. ${f2(A.sd)}; B: min ${f2(B.m)}, s.p. ${f2(B.sd)}. ${A.sd <= B.sd ? 'A' : 'B'} lebih konsisten (sisihan piawai lebih kecil).`), w: W(T('Midpoints: 14.5, 24.5, 34.5, 44.5', 'Titik tengah: 14.5, 24.5, 34.5, 44.5'), ...sdLines(A, T('A: ', 'A: ')), ...sdLines(B, T('B: ', 'B: ')), T(`The smaller standard deviation (${f2(Math.min(A.sd, B.sd))}) means the marks are less spread out: class ${A.sd <= B.sd ? 'A' : 'B'}.`, `Sisihan piawai yang lebih kecil (${f2(Math.min(A.sd, B.sd))}) bermakna markah kurang terserak: kelas ${A.sd <= B.sd ? 'A' : 'B'}.`)), sp: 'xl' };
    },
  ];
  const ogive = (cl, cf) => S.graph({ w: 340, h: 230, xr: [cl[0][0] - 0.5, cl[cl.length - 1][1] + 0.5, 10], yr: [0, Math.ceil(cf[cf.length - 1] / 10) * 10, 10], xlabel: '', series: [{ pts: [[cl[0][0] - 0.5, 0]].concat(cl.map((c, i) => [c[1] + 0.5, cf[i]])), type: 'line', dotsToo: true }] });
  const cfOf = (fs) => fs.reduce((a, v) => a.concat([(a.length ? a[a.length - 1] : 0) + v]), []);
  const interp = (cl, fs, target) => {
    const cf = cfOf(fs);
    for (let i = 0; i < cl.length; i++) if (cf[i] >= target) { const lo = cl[i][0] - 0.5, prev = i ? cf[i - 1] : 0; return lo + ((target - prev) / fs[i]) * (cl[i][1] - cl[i][0] + 1); }
    return cl[cl.length - 1][1] + 0.5;
  };
  const g72e = [
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 12));
      const cf = cfOf(fs);
      return { q: T(`Complete the cumulative frequency column and state the position of the median item.<br>${gt(cl, fs, ['Class', 'Frequency', 'Upper boundary', 'Cumulative frequency'], cl.map((c) => [c[1] + 0.5, '']))}`, `Lengkapkan lajur kekerapan longgokan dan nyatakan kedudukan item median.<br>${gt(cl, fs, ['Kelas', 'Kekerapan', 'Sempadan atas', 'Kekerapan longgokan'], cl.map((c) => [c[1] + 0.5, '']))}`), a: T(`Cumulative frequencies: ${cf.join(', ')}; median position $\\dfrac{${cf[4]}}{2} = ${cf[4] / 2}$th item`, `Kekerapan longgokan: ${cf.join(', ')}; kedudukan median $\\dfrac{${cf[4]}}{2} = ${cf[4] / 2}$`), w: W(T(`Add the frequencies one class at a time: $${fs[0]}$, ${fs.slice(1).map((f, i) => `$${cf[i]} + ${f} = ${cf[i + 1]}$`).join(', ')}`, `Tambah kekerapan satu kelas demi satu kelas: $${fs[0]}$, ${fs.slice(1).map((f, i) => `$${cf[i]} + ${f} = ${cf[i + 1]}$`).join(', ')}`), T(`Median position $= \\dfrac{N}{2} = \\dfrac{${cf[4]}}{2} = ${cf[4] / 2}$`, `Kedudukan median $= \\dfrac{N}{2} = \\dfrac{${cf[4]}}{2} = ${cf[4] / 2}$`)), sp: 'l' };
    },
  ];
  const g72m = [
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(3, 12));
      const cf = cfOf(fs), N = cf[4];
      const fig = ogive(cl, cf);
      const q1 = round(interp(cl, fs, N / 4), 2), q3 = round(interp(cl, fs, (3 * N) / 4), 2), iqr = round(q3 - q1, 2);
      const w = W(T(`$Q_1$: position $\\dfrac{${N}}{4} = ${n(N / 4)}$, $Q_1 = ${interpLine(cl, fs, N / 4)}$`, `$Q_1$: kedudukan $\\dfrac{${N}}{4} = ${n(N / 4)}$, $Q_1 = ${interpLine(cl, fs, N / 4)}$`), T(`Median: position $\\dfrac{${N}}{2} = ${n(N / 2)}$, median $= ${interpLine(cl, fs, N / 2)}$`, `Median: kedudukan $\\dfrac{${N}}{2} = ${n(N / 2)}$, median $= ${interpLine(cl, fs, N / 2)}$`), T(`$Q_3$: position $\\dfrac{3 \\times ${N}}{4} = ${n((3 * N) / 4)}$, $Q_3 = ${interpLine(cl, fs, (3 * N) / 4)}$`, `$Q_3$: kedudukan $\\dfrac{3 \\times ${N}}{4} = ${n((3 * N) / 4)}$, $Q_3 = ${interpLine(cl, fs, (3 * N) / 4)}$`), T(`IQR $= Q_3 - Q_1 = ${n(q3)} - ${n(q1)} = ${n(iqr)}$`, `JAK $= Q_3 - Q_1 = ${n(q3)} - ${n(q1)} = ${n(iqr)}$`));
      return { w, q: T(`The ogive (cumulative frequency graph) of the marks of ${N} students is shown. Estimate the median and the interquartile range.`, `Ogif (graf kekerapan longgokan) bagi markah ${N} orang murid ditunjukkan. Anggarkan median dan julat antara kuartil.`), fig, a: T(`Median $\\approx ${f2(interp(cl, fs, N / 2))}$; $Q_1 \\approx ${f2(interp(cl, fs, N / 4))}$, $Q_3 \\approx ${f2(interp(cl, fs, (3 * N) / 4))}$; IQR $\\approx ${n(iqr)}$`, `Median $\\approx ${f2(interp(cl, fs, N / 2))}$; $Q_1 \\approx ${f2(interp(cl, fs, N / 4))}$, $Q_3 \\approx ${f2(interp(cl, fs, (3 * N) / 4))}$; JAK $\\approx ${n(iqr)}$`), sp: 'm' };
    },
  ];
  const g72a = [
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(3, 12));
      const cf = cfOf(fs), N = cf[4];
      return { q: T(`The frequencies for the classes ${cl.map((c) => c[0] + '–' + c[1]).join(', ')} are ${fs.join(', ')}. Using an ogive, estimate the 30th percentile and the number of students who scored more than ${cl[3][0] - 0.5}.`, `Kekerapan bagi kelas ${cl.map((c) => c[0] + '–' + c[1]).join(', ')} ialah ${fs.join(', ')}. Dengan menggunakan ogif, anggarkan persentil ke-30 dan bilangan murid yang mendapat lebih daripada ${cl[3][0] - 0.5}.`), a: T(`$P_{30} \\approx ${f2(interp(cl, fs, 0.3 * N))}$; more than ${cl[3][0] - 0.5}: $${N} - ${cf[2]} = ${N - cf[2]}$ students`, `$P_{30} \\approx ${f2(interp(cl, fs, 0.3 * N))}$; lebih daripada ${cl[3][0] - 0.5}: $${N} - ${cf[2]} = ${N - cf[2]}$ orang murid`), w: W(T(`Cumulative frequencies: ${cf.join(', ')}`, `Kekerapan longgokan: ${cf.join(', ')}`), T(`$P_{30}$: position $\\dfrac{30}{100} \\times ${N} = ${n(0.3 * N)}$, $P_{30} = ${interpLine(cl, fs, 0.3 * N)}$`, `$P_{30}$: kedudukan $\\dfrac{30}{100} \\times ${N} = ${n(0.3 * N)}$, $P_{30} = ${interpLine(cl, fs, 0.3 * N)}$`), T(`At the upper boundary ${cl[3][0] - 0.5} the cumulative frequency is ${cf[2]}, so more than ${cl[3][0] - 0.5}: $${N} - ${cf[2]} = ${N - cf[2]}$`, `Pada sempadan atas ${cl[3][0] - 0.5} kekerapan longgokan ialah ${cf[2]}, jadi lebih daripada ${cl[3][0] - 0.5}: $${N} - ${cf[2]} = ${N - cf[2]}$`)), sp: 'l' };
    },
  ];
  const histFig = (cl, fs, lang) => S.graph({ w: 340, h: 220, xr: [cl[0][0] - 0.5, cl[cl.length - 1][1] + 0.5, cl[0][1] - cl[0][0] + 1], yr: [0, Math.ceil(Math.max(...fs) / 2) * 2 + 2, 2], xlabel: lang === 'en' ? 'Marks' : 'Markah', ylabel: lang === 'en' ? 'Frequency' : 'Kekerapan', series: [{ pts: cl.map((c, i) => [mid(c), fs[i]]), type: 'bars', width: cl[0][1] - cl[0][0] + 1 }] });
  const g73e = [
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const fig = T(histFig(cl, fs, 'en'), histFig(cl, fs, 'ms'));
      return { q: T('The histogram shows the marks of a group of students. Write the frequency table and the total number of students.', 'Histogram menunjukkan markah sekumpulan murid. Tulis jadual kekerapan dan jumlah bilangan murid.'), fig, a: T(`${cl.map((c, i) => `${c[0]}–${c[1]}: ${fs[i]}`).join('; ')}; total ${sum(fs)}`, `${cl.map((c, i) => `${c[0]}–${c[1]}: ${fs[i]}`).join('; ')}; jumlah ${sum(fs)}`), w: W(T('The height of each bar is the frequency of that class.', 'Tinggi setiap palang ialah kekerapan kelas itu.'), T(`Total $= ${fs.join(' + ')} = ${sum(fs)}$`, `Jumlah $= ${fs.join(' + ')} = ${sum(fs)}$`)), sp: 'm' };
    },
  ];
  const g73m = [
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const pts = [[cl[0][0] - 5.5, 0]].concat(cl.map((c, i) => [mid(c), fs[i]])).concat([[cl[4][1] + 5.5, 0]]);
      return { q: T(`Draw a histogram and a frequency polygon for this data.<br>${gt(cl, fs, ['Marks', 'Frequency'])}<br>State the midpoints used for the frequency polygon.`, `Lukis histogram dan poligon kekerapan bagi data ini.<br>${gt(cl, fs, ['Markah', 'Kekerapan'])}<br>Nyatakan titik tengah yang digunakan untuk poligon kekerapan.`), a: T(`Midpoints ${cl.map(mid).join(', ')}, plus the midpoints ${pts[0][0]} and ${pts[pts.length - 1][0]} with frequency 0. ${histFig(cl, fs, 'en')}`, `Titik tengah ${cl.map(mid).join(', ')}, serta titik tengah ${pts[0][0]} dan ${pts[pts.length - 1][0]} dengan kekerapan 0. ${histFig(cl, fs, 'ms')}`), w: W(T(`Midpoint $= \\dfrac{\\text{lower limit} + \\text{upper limit}}{2}$, e.g. $\\dfrac{${cl[0][0]} + ${cl[0][1]}}{2} = ${mid(cl[0])}$`, `Titik tengah $= \\dfrac{\\text{had bawah} + \\text{had atas}}{2}$, cth. $\\dfrac{${cl[0][0]} + ${cl[0][1]}}{2} = ${mid(cl[0])}$`), T(`Join the tops of the bars at the midpoints, and close the polygon at the midpoints of the empty classes on each side: $${pts[0][0]}$ and $${pts[pts.length - 1][0]}$ (frequency 0).`, `Sambungkan bahagian atas palang pada titik tengah, dan tutup poligon pada titik tengah kelas kosong di setiap hujung: $${pts[0][0]}$ dan $${pts[pts.length - 1][0]}$ (kekerapan 0).`)), sp: 'xl' };
    },
  ];
  const g73a = [
    (r) => {
      const cl = cls(10, 10, 4), fs = cl.map(() => r.int(3, 10)), miss = r.int(0, 3);
      const N = sum(fs);
      const shown = fs.map((v, i) => (i === miss ? '?' : v));
      return { q: T(`The frequencies of a histogram with classes ${cl.map((c) => c[0] + '–' + c[1]).join(', ')} are ${shown.join(', ')}. The total number of students is ${N}. Find the missing frequency and compare the shape of the distribution with a distribution that has its tallest bar at the last class.`, `Kekerapan sebuah histogram dengan kelas ${cl.map((c) => c[0] + '–' + c[1]).join(', ')} ialah ${shown.join(', ')}. Jumlah bilangan murid ialah ${N}. Cari kekerapan yang hilang dan bandingkan bentuk taburan itu dengan taburan yang mempunyai palang tertinggi pada kelas terakhir.`), a: T(`Missing frequency ${fs[miss]} ($${N} - ${N - fs[miss]}$). A distribution with the tallest bar in the last class is skewed towards high marks.`, `Kekerapan yang hilang ${fs[miss]} ($${N} - ${N - fs[miss]}$). Taburan yang mempunyai palang tertinggi pada kelas terakhir adalah condong ke arah markah tinggi.`), w: W(T(`Missing frequency $= ${N} - (${fs.filter((_, i) => i !== miss).join(' + ')}) = ${N} - ${N - fs[miss]} = ${fs[miss]}$`, `Kekerapan yang hilang $= ${N} - (${fs.filter((_, i) => i !== miss).join(' + ')}) = ${N} - ${N - fs[miss]} = ${fs[miss]}$`), T(`Tallest bar here: class ${cl[fs.indexOf(Math.max(...fs))][0]}–${cl[fs.indexOf(Math.max(...fs))][1]}; when the tallest bar is the last class, most of the data are at the high end.`, `Palang tertinggi di sini: kelas ${cl[fs.indexOf(Math.max(...fs))][0]}–${cl[fs.indexOf(Math.max(...fs))][1]}; apabila palang tertinggi ialah kelas terakhir, kebanyakan data berada di hujung tinggi.`)), sp: 'l' };
    },
  ];
  const g74e = [
    (r) => {
      const c = r.pick([[T('How many hours of sleep do Form 5 students in our school get on a school night?', 'Berapa jam tidur yang diperoleh murid Tingkatan 5 di sekolah kita pada malam persekolahan?'), T('hours of sleep (numerical)', 'jam tidur (berangka)'), T('a survey', 'tinjauan')], [T('How many books do students borrow from the library in a month?', 'Berapa buah buku yang dipinjam murid dari perpustakaan dalam sebulan?'), T('number of books (numerical)', 'bilangan buku (berangka)'), T('library records', 'rekod perpustakaan')]]);
      return { q: T(`For the statistical question "${c[0].en}", state the variable and a suitable way of collecting the data.`, `Bagi soalan statistik "${c[0].ms}", nyatakan pemboleh ubah dan cara yang sesuai untuk mengumpul data.`), a: T(`Variable: ${c[1].en}. Collection: ${c[2].en}.`, `Pemboleh ubah: ${c[1].ms}. Pengumpulan: ${c[2].ms}.`), w: W(T('The variable is the quantity measured for each individual; its values are counts or measurements, so it is numerical.', 'Pemboleh ubah ialah kuantiti yang diukur bagi setiap individu; nilainya ialah bilangan atau ukuran, jadi ia berangka.'), T(`Choose a method that records that quantity directly: ${c[2].en}.`, `Pilih kaedah yang merekod kuantiti itu secara terus: ${c[2].ms}.`)), sp: 's' };
    },
  ];
  const g74m = [
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 5), fs = cl.map(() => r.int(2, 12)), st = gStats(cl, fs);
      return { q: T(`A mini-project recorded the daily screen time (minutes) of students; the grouped data are below.<br>${gt(cl, fs, ['Minutes', 'Frequency'])}<br>Choose a suitable graph, calculate the mean and standard deviation, and write one sentence describing what they show.`, `Satu projek mini merekod masa skrin harian (minit) murid; data terkumpul adalah di bawah.<br>${gt(cl, fs, ['Minit', 'Kekerapan'])}<br>Pilih graf yang sesuai, hitung min dan sisihan piawai, dan tulis satu ayat yang menerangkan apa yang ditunjukkannya.`), a: T(`Histogram; mean ${f2(st.m)} minutes, s.d. ${f2(st.sd)} minutes: the students spend about ${Math.round(st.m)} minutes a day on screens, with a spread of about ${Math.round(st.sd)} minutes.`, `Histogram; min ${f2(st.m)} minit, s.p. ${f2(st.sd)} minit: murid menghabiskan kira-kira ${Math.round(st.m)} minit sehari pada skrin, dengan serakan kira-kira ${Math.round(st.sd)} minit.`), w: W(T('Continuous grouped data: a histogram suits it.', 'Data terkumpul selanjar: histogram sesuai.'), `$\\sum f = ${st.N}$, $\\sum fx = ${n(st.sx)}$, $\\sum fx^2 = ${n(st.sxx)}$`, ...sdLines(st)), sp: 'xl' };
    },
  ];
  const g74a = [
    (r) => ({ q: T('Describe the steps of a full statistical investigation for the question "Is there a difference in the mean time taken to travel to school between boys and girls in Form 5?" Justify your choice of sample, graphs and measures.', 'Huraikan langkah-langkah satu inkuiri statistik lengkap bagi soalan "Adakah terdapat perbezaan dalam min masa perjalanan ke sekolah antara murid lelaki dengan murid perempuan Tingkatan 5?" Justifikasikan pilihan sampel, graf dan ukuran anda.'), a: T('1 Formulate the question and variables. 2 Choose a random sample of boys and girls from every class. 3 Collect times in minutes with a short questionnaire. 4 Organise into equal class intervals. 5 Draw two frequency polygons or box plots on the same scale. 6 Compare the means and standard deviations. 7 Conclude within the limits of the sample and communicate with the graphs.', '1 Rumuskan soalan dan pemboleh ubah. 2 Pilih sampel rawak murid lelaki dan perempuan daripada setiap kelas. 3 Kumpulkan masa dalam minit dengan soal selidik ringkas. 4 Susun ke dalam selang kelas yang sama. 5 Lukis dua poligon kekerapan atau plot kotak pada skala yang sama. 6 Bandingkan min dan sisihan piawai. 7 Buat kesimpulan dalam had sampel dan komunikasikan dengan graf.'), w: W(T('Follow the investigation cycle: question → data collection → organise → represent → analyse → interpret and conclude.', 'Ikut kitaran inkuiri: soalan → pengumpulan data → susun → wakilkan → analisis → tafsir dan buat kesimpulan.'), T('To compare two groups, use the same class intervals and scale, then compare a measure of centre (mean) and a measure of spread (standard deviation).', 'Untuk membandingkan dua kumpulan, gunakan selang kelas dan skala yang sama, kemudian bandingkan sukatan kecenderungan memusat (min) dan sukatan serakan (sisihan piawai).')), sp: 'xxl' }),
  ];
  SPM.addChapter(5, 7, T('Measures of Dispersion of Grouped Data', 'Sukatan Serakan Data Terkumpul'), [
    { id: '7.1', en: 'Dispersion of grouped data', ms: 'Serakan data terkumpul', gen: { e: g71e, m: g71m, a: g71a } },
    { id: '7.2', en: 'Cumulative frequency, ogives and box plots', ms: 'Kekerapan longgokan, ogif dan plot kotak', gen: { e: g72e, m: g72m, a: g72a } },
    { id: '7.3', en: 'Histograms and frequency polygons', ms: 'Histogram dan poligon kekerapan', gen: { e: g73e, m: g73m, a: g73a } },
    { id: '7.4', en: 'Statistical mini-project', ms: 'Projek mini statistik', gen: { e: g74e, m: g74m, a: g74a } },
  ]);

  /* =============================================================== 8 */
  const CYCLE = [T('Identify and define the problem', 'Kenal pasti dan takrifkan masalah'), T('Make assumptions and identify variables', 'Buat andaian dan kenal pasti pemboleh ubah'), T('Formulate the mathematical model', 'Rumuskan model matematik'), T('Solve the model', 'Selesaikan model'), T('Interpret and validate the solution', 'Tafsir dan sahkan penyelesaian'), T('Report the findings', 'Laporkan dapatan')];
  const g81e = [
    (r) => {
      const ord = r.shuffle(range(0, 5));
      const L = 'ABCDEF';
      return { q: T(`The stages of the mathematical modelling cycle are shown in the wrong order: ${ord.map((o, i) => `(${L[i]}) ${CYCLE[o].en}`).join('; ')}. Write the letters in the correct order.`, `Peringkat kitaran pemodelan matematik ditunjukkan dalam susunan yang salah: ${ord.map((o, i) => `(${L[i]}) ${CYCLE[o].ms}`).join('; ')}. Tulis huruf-huruf itu mengikut susunan yang betul.`), a: T(range(0, 5).map((k) => L[ord.indexOf(k)]).join(' → ')), w: W(T(`The cycle: ${CYCLE.map((c) => c.en).join(' → ')}.`, `Kitaran: ${CYCLE.map((c) => c.ms).join(' → ')}.`), T(`Find each stage's letter in that order: ${range(0, 5).map((k) => L[ord.indexOf(k)]).join(' → ')}`, `Cari huruf setiap peringkat mengikut susunan itu: ${range(0, 5).map((k) => L[ord.indexOf(k)]).join(' → ')}`)), sp: 's' };
    },
  ];
  const g81m = [
    (r) => {
      const c = r.pick([[T('the cost of running a stall depends on the number of customers', 'kos menjalankan sebuah gerai bergantung pada bilangan pelanggan'), T('the cost per customer is constant; there are no discounts', 'kos bagi setiap pelanggan adalah malar; tiada diskaun')], [T('a plant grows taller each week', 'sepokok tumbuhan bertambah tinggi setiap minggu'), T('the growth rate stays the same; there is enough water and light', 'kadar pertumbuhan kekal sama; air dan cahaya mencukupi')]]);
      return { q: T(`In modelling the situation "${c[0].en}", state one variable, and one assumption that would be made.`, `Dalam memodelkan situasi "${c[0].ms}", nyatakan satu pemboleh ubah, dan satu andaian yang akan dibuat.`), a: T(`Variables: the quantity that changes and the time or number it depends on. Assumption: ${c[1].en}.`, `Pemboleh ubah: kuantiti yang berubah dan masa atau bilangan yang menjadi puncanya. Andaian: ${c[1].ms}.`), w: W(T('A variable is a quantity that changes in the situation (and what it depends on).', 'Pemboleh ubah ialah kuantiti yang berubah dalam situasi itu (dan apa yang mempengaruhinya).'), T('An assumption simplifies the real situation so that a simple model (e.g. linear) can be written.', 'Andaian memudahkan situasi sebenar supaya model yang ringkas (cth. linear) boleh ditulis.')), sp: 's' };
    },
  ];
  const g81a = g81m;
  const g82e = [
    (r) => {
      const m = r.int(2, 6), c = r.int(10, 40), x = r.int(3, 12);
      return { q: T(`A gym charges a joining fee of RM${c} and RM${m} per visit. The total cost is $C = ${m}n + ${c}$ for $n$ visits. Find the cost of ${x} visits and interpret the values ${m} and ${c}.`, `Sebuah gimnasium mengenakan yuran pendaftaran RM${c} dan RM${m} bagi setiap lawatan. Jumlah kos ialah $C = ${m}n + ${c}$ bagi $n$ lawatan. Cari kos ${x} lawatan dan tafsirkan nilai ${m} dan ${c}.`), a: T(`RM${m * x + c}; ${m} is the cost per visit (rate of change) and ${c} is the joining fee (initial value).`, `RM${m * x + c}; ${m} ialah kos setiap lawatan (kadar perubahan) dan ${c} ialah yuran pendaftaran (nilai awal).`), w: W(`$C = ${m}(${x}) + ${c} = ${m * x} + ${c} = ${m * x + c}$`, T(`In $C = mn + c$, $m = ${m}$ is added for every visit and $c = ${c}$ is the cost when $n = 0$.`, `Dalam $C = mn + c$, $m = ${m}$ ditambah bagi setiap lawatan dan $c = ${c}$ ialah kos apabila $n = 0$.`)), sp: 's' };
    },
  ];
  const g82m = [
    (r) => {
      const m = r.int(2, 6), c = r.int(5, 30);
      const xs = [0, 2, 4];
      const tab = SPM.table([['$x$', ...xs], ['$y$', ...xs.map((x) => m * x + c)]]);
      return { q: T(`The table shows values that follow a linear model.<br>${tab}<br>Show that the differences are constant, and find the model $y = mx + c$.`, `Jadual menunjukkan nilai yang mengikut model linear.<br>${tab}<br>Tunjukkan bahawa perbezaannya malar, dan cari model $y = mx + c$.`), a: T(`Differences in $y$ are ${2 * m} for equal steps of 2 in $x$; $m = ${m}$, $c = ${c}$; $y = ${m}x + ${c}$`, `Perbezaan $y$ ialah ${2 * m} bagi langkah sama 2 dalam $x$; $m = ${m}$, $c = ${c}$; $y = ${m}x + ${c}$`), w: W(`$${m * 2 + c} - ${c} = ${2 * m}$, $${m * 4 + c} - ${m * 2 + c} = ${2 * m}$`, T(`Gradient $m = \\dfrac{\\text{change in } y}{\\text{change in } x} = \\dfrac{${2 * m}}{2} = ${m}$`, `Kecerunan $m = \\dfrac{\\text{perubahan } y}{\\text{perubahan } x} = \\dfrac{${2 * m}}{2} = ${m}$`), T(`At $x = 0$, $y = ${c}$, so $c = ${c}$: $y = ${m}x + ${c}$`, `Pada $x = 0$, $y = ${c}$, jadi $c = ${c}$: $y = ${m}x + ${c}$`)), sp: 'm' };
    },
  ];
  const g82a = [
    (r) => {
      const fa = r.pick([30, 40]), ra = r.pick([0.1, 0.2]), fb = r.pick([10, 20]), rb = ra + r.pick([0.1, 0.15]);
      const x = (fa - fb) / (rb - ra);
      return { q: T(`Plan $A$ costs RM${fa} a month plus RM${ra.toFixed(2)} per minute. Plan $B$ costs RM${fb} a month plus RM${rb.toFixed(2)} per minute. Write a model for each plan, find the number of minutes at which the costs are equal, and state which plan is cheaper for more minutes than that.`, `Pelan $A$ berharga RM${fa} sebulan ditambah RM${ra.toFixed(2)} seminit. Pelan $B$ berharga RM${fb} sebulan ditambah RM${rb.toFixed(2)} seminit. Tulis model bagi setiap pelan, cari bilangan minit apabila kos sama, dan nyatakan pelan yang lebih murah bagi minit yang melebihi itu.`), a: T(`$C_A = ${fa} + ${ra}m$, $C_B = ${fb} + ${n(rb)}m$; equal at $m = ${n(round(x, 1))}$ minutes; for more minutes, Plan A is cheaper (smaller rate).`, `$C_A = ${fa} + ${ra}m$, $C_B = ${fb} + ${n(rb)}m$; sama pada $m = ${n(round(x, 1))}$ minit; bagi minit yang lebih banyak, Pelan A lebih murah (kadar lebih kecil).`), w: W(`$${fa} + ${ra}m = ${fb} + ${n(rb)}m$`, `$${fa} - ${fb} = ${n(rb)}m - ${ra}m$`, `$${fa - fb} = ${n(round(rb - ra, 2))}m$`, `$m = \\dfrac{${fa - fb}}{${n(round(rb - ra, 2))}} ${Math.abs(round(x, 1) - x) < 1e-9 ? '=' : '\\approx'} ${n(round(x, 1))}$`, T('Beyond that, the plan with the smaller rate per minute (Plan A) costs less.', 'Selepas itu, pelan dengan kadar seminit yang lebih kecil (Pelan A) lebih murah.')), sp: 'l' };
    },
  ];
  const g83e = [
    (r) => {
      const v = r.pick([10, 15, 20, 25]), t = r.pick([1, 2, 3]);
      need(v * t - 5 * t * t > 0);
      return { w: W(`$h = ${v}(${t}) - 5(${t})^2 = ${v * t} - ${5 * t * t} = ${v * t - 5 * t * t}$`),  q: T(`The height of a ball thrown upwards is $h = ${v}t - 5t^2$ metres after $t$ seconds. Find the height after ${t} second${t > 1 ? 's' : ''}.`, `Ketinggian sebiji bola yang dilontar ke atas ialah $h = ${v}t - 5t^2$ meter selepas $t$ saat. Cari ketinggian selepas ${t} saat.`), a: T(`${v * t - 5 * t * t} m`), sp: 's' };
    },
  ];
  const g83m = [
    (r) => {
      const t0 = r.pick([2, 3, 4]);
      const v = 5 * t0;
      return { q: T(`The height of a ball is $h = ${v}t - 5t^2$ metres after $t$ seconds. Find the time when the ball returns to the ground ($h = 0$).`, `Ketinggian sebiji bola ialah $h = ${v}t - 5t^2$ meter selepas $t$ saat. Cari masa apabila bola kembali ke tanah ($h = 0$).`), a: T(`$5t(${t0} - t) = 0$; $t = ${t0}$ s (reject $t = 0$)`, `$5t(${t0} - t) = 0$; $t = ${t0}$ s (tolak $t = 0$)`), w: W(`$${v}t - 5t^2 = 0$`, `$5t(${t0} - t) = 0$`, T(`$t = 0$ or $t = ${t0}$`, `$t = 0$ atau $t = ${t0}$`), T(`$t = 0$ is the moment it is thrown, so it returns to the ground at $t = ${t0}$ s.`, `$t = 0$ ialah saat bola dilontar, jadi bola kembali ke tanah pada $t = ${t0}$ s.`)), sp: 'm' };
    },
    (r) => {
      const a = r.int(1, 3), b = r.int(1, 3), c = r.int(1, 4);
      const xs = [0, 1, 2, 3, 4];
      const ys = xs.map((x) => a * x * x + b * x + c);
      return { q: T(`The table shows $x$ and $y$: ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ')}. Show that a quadratic model is suitable by finding the second differences.`, `Jadual menunjukkan $x$ dan $y$: ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ')}. Tunjukkan bahawa model kuadratik sesuai dengan mencari perbezaan kedua.`), a: T(`First differences ${ys.slice(1).map((y, i) => y - ys[i]).join(', ')}; second differences all ${2 * a}: constant, so the model is quadratic.`, `Perbezaan pertama ${ys.slice(1).map((y, i) => y - ys[i]).join(', ')}; perbezaan kedua semuanya ${2 * a}: malar, jadi modelnya kuadratik.`), w: W(T(`First differences: ${ys.slice(1).map((y, i) => `$${y} - ${ys[i]} = ${y - ys[i]}$`).join(', ')}`, `Perbezaan pertama: ${ys.slice(1).map((y, i) => `$${y} - ${ys[i]} = ${y - ys[i]}$`).join(', ')}`), T(`Second differences: ${ys.slice(2).map((y, i) => `$${y - ys[i + 1]} - ${ys[i + 1] - ys[i]} = ${y - 2 * ys[i + 1] + ys[i]}$`).join(', ')}`, `Perbezaan kedua: ${ys.slice(2).map((y, i) => `$${y - ys[i + 1]} - ${ys[i + 1] - ys[i]} = ${y - 2 * ys[i + 1] + ys[i]}$`).join(', ')}`), T('Equal first differences mean linear; equal second differences mean quadratic.', 'Perbezaan pertama yang sama bermakna linear; perbezaan kedua yang sama bermakna kuadratik.')), sp: 'm' };
    },
  ];
  const g83a = [
    (r) => {
      const w = r.int(4, 9), P = r.pick([24, 28, 32, 36]);
      const l = P / 2 - w;
      need(l !== w);
      return { q: T(`A rectangular pen has perimeter ${P} m. Its width is $x$ m. Write a model for the area $A$, find $x$ when the area is ${w * l} m², and explain why the two solutions give the same pen.`, `Sebuah kandang segi empat tepat mempunyai perimeter ${P} m. Lebarnya ialah $x$ m. Tulis model bagi luas $A$, cari $x$ apabila luasnya ${w * l} m², dan terangkan mengapa dua penyelesaian itu memberikan kandang yang sama.`), a: T(`$A = x(${P / 2} - x)$; $x^2 - ${P / 2}x + ${w * l} = 0$, $x = ${w}$ or $x = ${l}$: the width and length swap, so it is the same pen.`, `$A = x(${P / 2} - x)$; $x^2 - ${P / 2}x + ${w * l} = 0$, $x = ${w}$ atau $x = ${l}$: lebar dan panjang bertukar, jadi ia kandang yang sama.`), w: W(T(`Width + length $= \\dfrac{${P}}{2} = ${P / 2}$, so length $= ${P / 2} - x$ and $A = x(${P / 2} - x)$`, `Lebar + panjang $= \\dfrac{${P}}{2} = ${P / 2}$, jadi panjang $= ${P / 2} - x$ dan $A = x(${P / 2} - x)$`), `$x(${P / 2} - x) = ${w * l}$`, `$x^2 - ${P / 2}x + ${w * l} = 0$`, `$(x - ${Math.min(w, l)})(x - ${Math.max(w, l)}) = 0$`, T(`$x = ${w}$ (length ${l} m) or $x = ${l}$ (length ${w} m)`, `$x = ${w}$ (panjang ${l} m) atau $x = ${l}$ (panjang ${w} m)`)), sp: 'l' };
    },
  ];
  const g84e = [
    (r) => {
      const a = r.pick([100, 200, 500]), rate = r.pick([2, 5, 10]), t = r.int(2, 4);
      return { q: T(`A savings amount of RM${a} grows by ${rate}% each year. The model is $y = ${a}(${n(1 + rate / 100)})^x$. Find the amount after ${t} years.`, `Jumlah simpanan RM${a} bertambah ${rate}% setiap tahun. Modelnya ialah $y = ${a}(${n(1 + rate / 100)})^x$. Cari jumlah selepas ${t} tahun.`), a: T(rm(round(a * Math.pow(1 + rate / 100, t), 2))), w: W(`$y = ${a}(${n(1 + rate / 100)})^{${t}} ${eq2(a * Math.pow(1 + rate / 100, t))}$`, T(`Growth of ${rate}% a year multiplies the amount by $1 + \\dfrac{${rate}}{100} = ${n(1 + rate / 100)}$ each year.`, `Pertumbuhan ${rate}% setahun mendarab jumlah dengan $1 + \\dfrac{${rate}}{100} = ${n(1 + rate / 100)}$ setiap tahun.`)), sp: 's' };
    },
  ];
  const g84m = [
    (r) => {
      const a = r.pick([2, 3, 5]), b = r.pick([2, 3]);
      const xs = [0, 1, 2, 3], ys = xs.map((x) => a * Math.pow(b, x));
      return { q: T(`The number of bacteria is ${ys.join(', ')} at times $x = 0, 1, 2, 3$ hours. Show that the ratios of successive values are constant, and find the model $y = ab^x$.`, `Bilangan bakteria ialah ${ys.join(', ')} pada masa $x = 0, 1, 2, 3$ jam. Tunjukkan bahawa nisbah nilai berturutan adalah malar, dan cari model $y = ab^x$.`), a: T(`Ratios $${ys[1] / ys[0]}$, $${ys[2] / ys[1]}$, $${ys[3] / ys[2]}$ are all ${b}; $a = ${a}$, $b = ${b}$; $y = ${a}(${b})^x$`, `Nisbah $${ys[1] / ys[0]}$, $${ys[2] / ys[1]}$, $${ys[3] / ys[2]}$ semuanya ${b}; $a = ${a}$, $b = ${b}$; $y = ${a}(${b})^x$`), w: W(`$\\dfrac{${ys[1]}}{${ys[0]}} = \\dfrac{${ys[2]}}{${ys[1]}} = \\dfrac{${ys[3]}}{${ys[2]}} = ${b}$`, T(`At $x = 0$: $y = ab^0 = a = ${a}$; the common ratio is $b = ${b}$`, `Pada $x = 0$: $y = ab^0 = a = ${a}$; nisbah sepunya ialah $b = ${b}$`), `$y = ${a}(${b})^x$`), sp: 'm' };
    },
  ];
  const g84a = [
    (r) => {
      const a = r.pick([50, 100, 200]), rate = r.pick([10, 20, 25]);
      const target = 2 * a;
      let t = 0, v = a;
      while (v < target) { v *= 1 + rate / 100; t++; }
      return { q: T(`A population of ${a} grows by ${rate}% each year: $P = ${a}(${n(1 + rate / 100)})^t$. Find the smallest whole number of years for the population to double, by trying values of $t$.`, `Satu populasi ${a} bertambah ${rate}% setiap tahun: $P = ${a}(${n(1 + rate / 100)})^t$. Cari bilangan tahun bulat terkecil supaya populasi menjadi dua kali ganda, dengan mencuba nilai $t$.`), a: T(`$t = ${t}$ years (population ${n(round(a * Math.pow(1 + rate / 100, t), 1))})`, `$t = ${t}$ tahun (populasi ${n(round(a * Math.pow(1 + rate / 100, t), 1))})`), w: W(T(`Double means $P \\ge 2 \\times ${a} = ${target}$`, `Dua kali ganda bermakna $P \\ge 2 \\times ${a} = ${target}$`), `$t = ${t - 1}$: $P = ${a}(${n(1 + rate / 100)})^{${t - 1}} ${eq2(a * Math.pow(1 + rate / 100, t - 1))} < ${target}$`, `$t = ${t}$: $P = ${a}(${n(1 + rate / 100)})^{${t}} ${eq2(a * Math.pow(1 + rate / 100, t))} \\ge ${target}$`), sp: 'm' };
    },
  ];
  const g85e = [
    (r) => ({ q: T('List four things that a good report on a mathematical modelling task should include.', 'Senaraikan empat perkara yang perlu ada dalam laporan tugasan pemodelan matematik yang baik.'), a: T('The problem statement; the assumptions and variables (with units); the model chosen and why; the calculations or graphs; the interpretation in context; and a conclusion with any limitations.', 'Pernyataan masalah; andaian dan pemboleh ubah (dengan unit); model yang dipilih dan sebabnya; pengiraan atau graf; tafsiran dalam konteks; dan kesimpulan dengan sebarang had.'), w: W(T('A report should let a reader follow every stage of the modelling cycle: the problem, the assumptions, the model, the working, the interpretation and the limitations.', 'Laporan harus membolehkan pembaca mengikuti setiap peringkat kitaran pemodelan: masalah, andaian, model, pengiraan, tafsiran dan had.')), sp: 'm' }),
  ];
  const g86Ee = [
    (r) => {
      const P = r.pick([20, 24, 32, 40]);
      return { q: T(`A rectangle has perimeter ${P} cm. Write the area as a function of the width $x$ and find the dimensions that give the greatest area (use the axis of symmetry).`, `Sebuah segi empat tepat mempunyai perimeter ${P} cm. Tulis luas sebagai fungsi lebar $x$ dan cari ukuran yang memberikan luas terbesar (gunakan paksi simetri).`), a: T(`$A = x(${P / 2} - x)$; axis $x = ${P / 4}$: a square ${P / 4} cm by ${P / 4} cm, area ${(P / 4) ** 2} cm²`, `$A = x(${P / 2} - x)$; paksi $x = ${P / 4}$: segi empat sama ${P / 4} cm kali ${P / 4} cm, luas ${(P / 4) ** 2} cm²`), w: W(T(`Length $= ${P / 2} - x$, so $A = x(${P / 2} - x)$`, `Panjang $= ${P / 2} - x$, jadi $A = x(${P / 2} - x)$`), T(`$A = 0$ at $x = 0$ and $x = ${P / 2}$; the axis of symmetry is halfway: $x = \\dfrac{0 + ${P / 2}}{2} = ${P / 4}$`, `$A = 0$ pada $x = 0$ dan $x = ${P / 2}$; paksi simetri berada di tengah-tengah: $x = \\dfrac{0 + ${P / 2}}{2} = ${P / 4}$`), `$A = ${P / 4}(${P / 2} - ${P / 4}) = ${(P / 4) ** 2}$`), sp: 'l' };
    },
  ];
  SPM.addChapter(5, 8, T('Mathematical Modelling', 'Pemodelan Matematik'), [
    { id: '8.1', en: 'The mathematical modelling cycle', ms: 'Kitaran pemodelan matematik', gen: { e: g81e, m: g81m, a: g81a } },
    { id: '8.2', en: 'Linear models', ms: 'Model linear', gen: { e: g82e, m: g82m, a: g82a } },
    { id: '8.3', en: 'Quadratic models', ms: 'Model kuadratik', gen: { e: g83e, m: g83m, a: g83a } },
    { id: '8.4', en: 'Exponential models', ms: 'Model eksponen', gen: { e: g84e, m: g84m, a: g84a } },
    { id: '8.5', en: 'Reporting and communicating findings', ms: 'Melapor dan mengkomunikasikan dapatan', gen: { e: g85e, m: g85e, a: g85e } },
    { id: '8.6', en: 'Other model structures and optimisation', ms: 'Struktur model lain dan pengoptimuman', scope: 'enrichment', gen: { e: g86Ee, m: g86Ee, a: g86Ee } },
  ]);
})();
