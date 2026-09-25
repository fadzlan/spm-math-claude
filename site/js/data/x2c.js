/* Variety pack x2c: F2 Chapter 4 (Polygons) and Chapter 5 (Circles). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, sum, gcd, rm } = SPM;
  const fixA = (t) => (typeof t === 'string' ? t.replace(/\b([Aa]) (?=octagon|8-sided|11-sided|18-sided)/g, '$1n ') : t);
  const T = (en, ms) => SPM.L(fixA(en), ms);
  const S = SPM.svg, F = SPM.figs;
  const W = SPM.lines;
  const rad = (d) => (d * Math.PI) / 180;
  const LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const D = (v) => `${n(round(v, 2))}^\\circ`;
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const perm = (r, k) => r.shuffle(Array.from({ length: k }, (_, i) => i));
  /* polygon names (en, ms) */
  const NM = { 3: ['triangle', 'segi tiga'], 4: ['quadrilateral', 'sisi empat'], 5: ['pentagon', 'pentagon'], 6: ['hexagon', 'heksagon'], 7: ['heptagon', 'heptagon'], 8: ['octagon', 'oktagon'], 9: ['nonagon', 'nonagon'], 10: ['decagon', 'dekagon'], 12: ['dodecagon', 'dodekagon'] };
  const art = (s) => (/^([aeiou]|8|11|18)/.test(s) ? 'an ' : 'a ') + s;
  const pn = (k) => NM[k] || [`${k}-sided polygon`, `poligon ${k} sisi`];
  const rn = (k) => (k === 3 ? ['equilateral triangle', 'segi tiga sama sisi'] : k === 4 ? ['square', 'segi empat sama'] : NM[k] ? [`regular ${NM[k][0]}`, `${NM[k][1]} sekata`] : [`regular ${k}-sided polygon`, `poligon sekata ${k} sisi`]);
  const rna = (k) => { const [e, m] = rn(k); return [art(e), m]; };
  const pna = (k) => { const [e, m] = pn(k); return [art(e), m]; };
  const NC = [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36];
  const ext = (k) => 360 / k, itr = (k) => 180 - 360 / k, ssum = (k) => (k - 2) * 180;
  /** multiple choice: returns { text, ans } ; right/wrong are numbers, fmt(v) gives the option text */
  function mcq(r, right, wrong, fmt) {
    const vals = [right];
    for (const w of wrong) if (w > 0 && !vals.some((v) => Math.abs(v - w) < 1e-9)) vals.push(w);
    need(vals.length >= 4);
    const o = r.shuffle(vals.slice(0, 4));
    return { text: '<br>' + o.map((v, i) => `${'ABCD'[i]}. ${fmt(v)}`).join('&emsp;'), ans: `${'ABCD'[o.indexOf(right)]}. ${fmt(right)}` };
  }
  /** figure of a polygon with points `pts` (y down); o.more = extra points to fit; o.extra(P, M, C) */
  function polyFig(pts, o) {
    o = o || {};
    const w = o.w || 260, h = o.h || 200, k = pts.length;
    const all = F.fit(pts.concat(o.more || []), w, h, o.pad || 30);
    const P = all.slice(0, k), M = all.slice(k), C = F.cen(P);
    let out = S.poly(P);
    for (let i = 0; i < k; i++) {
      const pv = P[(i + k - 1) % k], nx = P[(i + 1) % k];
      if (o.names) out += S.outLabel(P[i], C, o.names[i], 13);
      if (o.right && o.right.includes(i)) out += S.rightAngle(P[i], pv, nx, 9);
      else if (o.angles && o.angles[i] !== undefined && o.angles[i] !== null) out += S.arc(P[i], pv, nx, o.arcR || 18, o.angles[i], { gap: 13 });
    }
    for (const [key, t] of Object.entries(o.ticks || {})) { const [a, b] = key.split('-').map(Number); out += S.tick(P[a], P[b], t); }
    for (const [key, lab] of Object.entries(o.sides || {})) { const [a, b] = key.split('-').map(Number); out += S.sideLabel(P[a], P[b], C, lab, 11); }
    if (o.extra) out += o.extra(P, M, C);
    return S.wrap(w, h, out, 'polygon');
  }
  /** regular k-gon, bottom side horizontal, V0 bottom-left, V1 bottom-right */
  const regPts = (k) => Array.from({ length: k }, (_, i) => { const t = rad(-90 - 180 / k + (360 * i) / k); return [Math.cos(t), -Math.sin(t)]; });
  /** regular polygon with the side extended beyond vertex i; the exterior angle at V_i is labelled */
  function extFig(k, i, label, nameless) {
    const pts = regPts(k), A = pts[(i + k - 1) % k], B = pts[i];
    const E = [B[0] + (B[0] - A[0]) * 0.7, B[1] + (B[1] - A[1]) * 0.7];
    return polyFig(pts, { more: [E], names: nameless ? null : LET.slice(0, k).split(''), extra: (P, M) => S.line(P[i][0], P[i][1], M[0][0], M[0][1]) + S.arc(P[i], M[0], P[(i + 1) % k], 22, label, { gap: 15 }) });
  }
  /** irregular convex polygon with the given interior angles (degrees, in order) – sides chosen so the figure closes */
  function anglePoly(r, angs) {
    const k = angs.length;
    return retry(() => {
      const th = [0];
      for (let i = 1; i < k; i++) th.push(th[i - 1] + 180 - angs[i]);
      const L = Array.from({ length: k }, () => 1 + r.next());
      const cx = (i) => Math.cos(rad(th[i])), sy = (i) => Math.sin(rad(th[i]));
      let sx = 0, sY = 0;
      for (let i = 0; i < k - 2; i++) { sx += L[i] * cx(i); sY += L[i] * sy(i); }
      const a = k - 2, b = k - 1, det = cx(a) * sy(b) - cx(b) * sy(a);
      need(Math.abs(det) > 0.15);
      L[a] = (-sx * sy(b) + sY * cx(b)) / det;
      L[b] = (-cx(a) * sY + sy(a) * sx) / det;
      need(L[a] > 0.35 && L[b] > 0.35);
      const pts = [[0, 0]];
      for (let i = 0; i < k - 1; i++) pts.push([pts[i][0] + L[i] * cx(i), pts[i][1] - L[i] * sy(i)]);
      return pts;
    }, 300);
  }

  /* ======================================================= F2-4.1a Regular polygons */
  const TF41 = [
    ['All the sides of a regular polygon are equal, and all its angles are equal.', 'Semua sisi sebuah poligon sekata adalah sama panjang dan semua sudutnya sama besar.', true, 'This is the definition of a regular polygon.', 'Ini ialah takrifan poligon sekata.', 'Regular means BOTH: all sides equal AND all angles equal.', 'Sekata bermaksud KEDUA-DUANYA: semua sisi sama panjang DAN semua sudut sama besar.'],
    ['A rhombus is a regular polygon.', 'Sebuah rombus ialah poligon sekata.', false, 'Its sides are equal but its angles are not all equal (unless it is a square).', 'Sisinya sama panjang tetapi sudutnya tidak semua sama (kecuali segi empat sama).', 'Test both conditions: sides equal — yes; angles equal — no, so it is not regular.', 'Uji kedua-dua syarat: sisi sama — ya; sudut sama — tidak, maka ia bukan sekata.'],
    ['A rectangle is a regular polygon.', 'Sebuah segi empat tepat ialah poligon sekata.', false, 'Its angles are equal but its sides are not all equal (unless it is a square).', 'Sudutnya sama tetapi sisinya tidak semua sama (kecuali segi empat sama).', 'Test both conditions: angles equal — yes; sides equal — no, so it is not regular.', 'Uji kedua-dua syarat: sudut sama — ya; sisi sama — tidak, maka ia bukan sekata.'],
    ['The exterior angle of a regular polygon becomes smaller when the number of sides increases.', 'Sudut peluaran poligon sekata menjadi lebih kecil apabila bilangan sisi bertambah.', true, 'Exterior angle $= 360^\\circ \\div n$, which decreases as $n$ increases.', 'Sudut peluaran $= 360^\\circ \\div n$, yang berkurang apabila $n$ bertambah.', 'Check with numbers: $360^\\circ \\div 6 = 60^\\circ$ but $360^\\circ \\div 10 = 36^\\circ$.', 'Semak dengan nombor: $360^\\circ \\div 6 = 60^\\circ$ tetapi $360^\\circ \\div 10 = 36^\\circ$.'],
    ['Each interior angle of a regular polygon can be $180^\\circ$.', 'Setiap sudut pedalaman poligon sekata boleh bersaiz $180^\\circ$.', false, 'The exterior angle would be $0^\\circ$, but it is $360^\\circ \\div n > 0^\\circ$.', 'Sudut peluaran akan menjadi $0^\\circ$, tetapi ia ialah $360^\\circ \\div n > 0^\\circ$.', 'Interior angle $= 180^\\circ - \\dfrac{360^\\circ}{n}$, which is always less than $180^\\circ$.', 'Sudut pedalaman $= 180^\\circ - \\dfrac{360^\\circ}{n}$, yang sentiasa kurang daripada $180^\\circ$.'],
    ['A regular polygon with $n$ sides has $n$ axes of symmetry.', 'Poligon sekata dengan $n$ sisi mempunyai $n$ paksi simetri.', true, 'Each axis passes through the centre, and there are $n$ of them.', 'Setiap paksi melalui pusat, dan terdapat $n$ paksi.', 'For example a square has $4$ axes and a regular hexagon has $6$.', 'Contohnya segi empat sama mempunyai $4$ paksi dan heksagon sekata mempunyai $6$ paksi.'],
    ['Each interior angle of a regular hexagon is $60^\\circ$.', 'Setiap sudut pedalaman heksagon sekata ialah $60^\\circ$.', false, '$60^\\circ$ is the exterior angle; the interior angle is $180^\\circ - 60^\\circ = 120^\\circ$.', '$60^\\circ$ ialah sudut peluaran; sudut pedalaman ialah $180^\\circ - 60^\\circ = 120^\\circ$.', 'Exterior angle $= 360^\\circ \\div 6 = 60^\\circ$, so the interior angle is $120^\\circ$.', 'Sudut peluaran $= 360^\\circ \\div 6 = 60^\\circ$, maka sudut pedalamannya $120^\\circ$.'],
    ['At any vertex of a regular polygon, the interior angle and the exterior angle add up to $180^\\circ$.', 'Pada mana-mana bucu poligon sekata, sudut pedalaman dan sudut peluaran berjumlah $180^\\circ$.', true, 'They lie on a straight line.', 'Kedua-duanya terletak pada satu garis lurus.', 'Angles on a straight line add up to $180^\\circ$.', 'Sudut pada garis lurus berjumlah $180^\\circ$.'],
    ['A polygon whose sides are all equal must be a regular polygon.', 'Poligon yang semua sisinya sama panjang mestilah poligon sekata.', false, 'A rhombus has four equal sides but its angles are not all equal.', 'Rombus mempunyai empat sisi sama panjang tetapi sudutnya tidak semua sama.', 'Equal sides alone is not enough; the angles must be equal too.', 'Sisi sama panjang sahaja tidak mencukupi; sudutnya juga mesti sama besar.'],
    ['A regular polygon has an exterior angle of $45^\\circ$ if it has 8 sides.', 'Poligon sekata mempunyai sudut peluaran $45^\\circ$ jika ia mempunyai 8 sisi.', true, '$360^\\circ \\div 8 = 45^\\circ$.', '$360^\\circ \\div 8 = 45^\\circ$.', 'Check with the formula: $n = 360^\\circ \\div 45^\\circ = 8$.', 'Semak dengan rumus: $n = 360^\\circ \\div 45^\\circ = 8$.'],
    ['The sum of the exterior angles of a regular pentagon is smaller than that of a regular decagon.', 'Hasil tambah sudut peluaran pentagon sekata lebih kecil daripada dekagon sekata.', false, 'Both sums equal $360^\\circ$.', 'Kedua-dua hasil tambah ialah $360^\\circ$.', 'The exterior angles of any polygon add up to $360^\\circ$, whatever $n$ is.', 'Sudut peluaran mana-mana poligon berjumlah $360^\\circ$, tidak kira nilai $n$.'],
    ['An equilateral triangle is a regular polygon.', 'Segi tiga sama sisi ialah poligon sekata.', true, 'Its three sides are equal and its three angles are each $60^\\circ$.', 'Ketiga-tiga sisinya sama panjang dan setiap sudutnya $60^\\circ$.', 'Sides: $3$ equal. Angles: $180^\\circ \\div 3 = 60^\\circ$ each — both conditions hold.', 'Sisi: $3$ sama panjang. Sudut: $180^\\circ \\div 3 = 60^\\circ$ setiap satu — kedua-dua syarat dipenuhi.'],
  ];
  const CTX41 = [ // [en context (uses {A}), ms]
    ['A stop sign is the shape of a regular octagon.', 'Papan tanda berhenti berbentuk oktagon sekata.', 8],
    ['A nut has the shape of a regular hexagon.', 'Sebuah nat berbentuk heksagon sekata.', 6],
    ['Each cell of a honeycomb is a regular hexagon.', 'Setiap sel sarang lebah ialah heksagon sekata.', 6],
    ['A garden gazebo has a base in the shape of a regular octagon.', 'Sebuah gazebo taman mempunyai tapak berbentuk oktagon sekata.', 8],
    ['A park is designed in the shape of a regular pentagon.', 'Sebuah taman direka berbentuk pentagon sekata.', 5],
    ['A tile is the shape of a regular decagon.', 'Sebuah jubin berbentuk dekagon sekata.', 10],
    ['A road sign is in the shape of an equilateral triangle.', 'Sebuah papan tanda jalan berbentuk segi tiga sama sisi.', 3],
    ['A decorative tray is a regular dodecagon.', 'Sebuah dulang hiasan berbentuk dodekagon sekata.', 12],
  ];
  const g41e = [
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8, 9, 10, 12]), [a, am] = rna(k), v = r.int(0, 3), e = ext(k);
      const q = [
        T(`Find the size of each exterior angle of ${a}.`, `Cari saiz setiap sudut peluaran bagi ${am}.`),
        T(`A robot walks once round the edge of ${a}. At every vertex it turns through the exterior angle. Through what angle does it turn at each vertex?`, `Sebuah robot berjalan satu pusingan di sekeliling tepi ${am}. Pada setiap bucu ia berpusing melalui sudut peluaran. Berapakah sudut putaran robot itu pada setiap bucu?`),
        T(`Complete: each exterior angle of ${a} $= 360^\\circ \\div \\ \\underline{\\qquad} = \\underline{\\qquad}$.`, `Lengkapkan: setiap sudut peluaran bagi ${am} $= 360^\\circ \\div \\ \\underline{\\qquad} = \\underline{\\qquad}$.`),
        T(`Write down the size of one exterior angle of ${a}, using $\\dfrac{360^\\circ}{n}$.`, `Tuliskan saiz satu sudut peluaran bagi ${am}, dengan menggunakan $\\dfrac{360^\\circ}{n}$.`),
      ][v];
      return { q, a: v === 2 ? T(`$${k}$ ; $${D(e)}$`) : T(`$${D(e)}$`), w: W(T(`Exterior angle $= \\dfrac{360^\\circ}{n}$`, `Sudut peluaran $= \\dfrac{360^\\circ}{n}$`), `$360^\\circ \\div ${k} = ${D(e)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8, 9, 10, 12]), [a, am] = rna(k), v = r.int(0, 2), e = ext(k);
      const q = [
        T(`Find the size of each interior angle of ${a}.`, `Cari saiz setiap sudut pedalaman bagi ${am}.`),
        T(`The exterior angle of ${a} is $${D(e)}$. Find its interior angle.`, `Sudut peluaran bagi ${am} ialah $${D(e)}$. Cari sudut pedalamannya.`),
        T(`Each interior angle of ${a} is marked on a card. Which number of degrees must be written on the card?`, `Setiap sudut pedalaman bagi ${am} ditanda pada sekeping kad. Berapa darjahkah yang mesti ditulis pada kad itu?`),
      ][v];
      return { q, a: T(`$${D(itr(k))}$`), w: W(T(`Exterior angle $= 360^\\circ \\div ${k} = ${D(e)}$`, `Sudut peluaran $= 360^\\circ \\div ${k} = ${D(e)}$`), `$180^\\circ - ${D(e)} = ${D(itr(k))}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 7, 8, 9, 10, 12]), [a, am] = rna(k), v = r.int(0, 2);
      const q = [
        T(`How many axes of symmetry does ${a} have?`, `Berapakah bilangan paksi simetri bagi ${am}?`),
        T(`A regular polygon has ${k} axes of symmetry. How many sides does it have and what is it called?`, `Sebuah poligon sekata mempunyai ${k} paksi simetri. Berapakah bilangan sisinya dan apakah namanya?`),
        T(`Draw ${a} and all of its axes of symmetry. How many axes did you draw?`, `Lukis ${am} dan semua paksi simetrinya. Berapakah bilangan paksi yang anda lukis?`),
      ][v];
      return { q, a: v === 1 ? T(`${k} sides; ${pn(k)[0]}`, `${k} sisi; ${pn(k)[1]} sekata`) : T(`${k}`), w: v === 1 ? W(T(`A regular polygon with $n$ sides has $n$ axes of symmetry, so $n = ${k}$.`, `Poligon sekata dengan $n$ sisi mempunyai $n$ paksi simetri, maka $n = ${k}$.`), T(`${k} sides: ${art(pn(k)[0])}.`, `${k} sisi: ${pn(k)[1]}.`)) : W(T(`Every axis of symmetry of a regular polygon passes through its centre — one for each side or vertex.`, `Setiap paksi simetri poligon sekata melalui pusatnya — satu bagi setiap sisi atau bucu.`), T(`Number of axes $= n = ${k}$`, `Bilangan paksi $= n = ${k}$`)), sp: v === 2 ? 'm' : 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), v = r.int(0, 2);
      return v === 0 ? { q: T(`How many sides has a ${pn(k)[0]}?`, `Berapakah bilangan sisi bagi ${pn(k)[1]}?`), a: T(`${k}`), w: W(T(`The name tells the number of sides: ${art(pn(k)[0])} has ${k} sides.`, `Nama itu memberitahu bilangan sisi: ${pn(k)[1]} mempunyai ${k} sisi.`)), sp: 'xs' }
        : v === 1 ? { q: T(`What is the name of a polygon with ${k} sides? How many vertices does it have?`, `Apakah nama poligon yang mempunyai ${k} sisi? Berapakah bilangan bucunya?`), a: T(`${cap(pn(k)[0])}; ${k} vertices`, `${cap(pn(k)[1])}; ${k} bucu`), w: W(T(`${k} sides: ${art(pn(k)[0])}.`, `${k} sisi: ${pn(k)[1]}.`), T(`A polygon has as many vertices as sides, so there are ${k} vertices.`, `Poligon mempunyai bilangan bucu yang sama dengan bilangan sisi, maka terdapat ${k} bucu.`)), sp: 's' }
        : { q: T(`A regular ${pn(k)[0]} has $n$ sides. State the value of $n$ and the number of exterior angles (one at each vertex).`, `${cap(pn(k)[1])} sekata mempunyai $n$ sisi. Nyatakan nilai $n$ dan bilangan sudut peluaran (satu pada setiap bucu).`), a: T(`$n = ${k}$; ${k} exterior angles`, `$n = ${k}$; ${k} sudut peluaran`), w: W(T(`${cap(pn(k)[0])}: $n = ${k}$.`, `${cap(pn(k)[1])}: $n = ${k}$.`), T(`There is one exterior angle at each of the ${k} vertices, so there are ${k}.`, `Terdapat satu sudut peluaran pada setiap ${k} bucu, maka terdapat ${k}.`)), sp: 's' };
    },
    (r) => {
      const [se, sm, tv, re, rm2, we, wm] = r.pick(TF41);
      return { q: T(`True or false? "${se}" Give a reason.`, `Betul atau salah? "${sm}" Berikan satu sebab.`), a: T(`${tv ? 'True' : 'False'}. ${re}`, `${tv ? 'Betul' : 'Salah'}. ${rm2}`), w: W(T(we, wm), T(`So the statement is ${tv ? 'true' : 'false'}.`, `Maka pernyataan itu ${tv ? 'betul' : 'salah'}.`)), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), i = r.int(1, k - 1);
      return { q: nts(T(`The diagram shows a regular polygon with one side extended. Find $x$.`, `Rajah menunjukkan sebuah poligon sekata dengan satu sisi dipanjangkan. Cari $x$.`)), fig: extFig(k, i, 'x'), a: T(`$x = ${D(ext(k))}$`), w: W(T(`Count the sides in the diagram: ${k}.`, `Bilang sisi dalam rajah: ${k}.`), `$x = 360^\\circ \\div ${k} = ${D(ext(k))}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), i = r.int(0, k - 1);
      return { q: T(`The diagram shows a regular ${pn(k)[0]}. Find the value of $x$.`, `Rajah menunjukkan ${pn(k)[1]} sekata. Cari nilai $x$.`), fig: polyFig(regPts(k), { angles: { [i]: 'x' } }), a: T(`$x = ${D(itr(k))}$`), w: W(`$360^\\circ \\div ${k} = ${D(ext(k))}$`, `$x = 180^\\circ - ${D(ext(k))} = ${D(itr(k))}$`), sp: 's' };
    },
    (r) => {
      const ks = r.sample([3, 4, 5, 6, 8, 9, 10, 12], 4).sort((a, b) => a - b), col = r.int(0, 2);
      const head = ['$n$', 'Exterior angle', 'Interior angle'], headM = ['$n$', 'Sudut peluaran', 'Sudut pedalaman'];
      const cell = (k, c) => (c === 0 ? `${k}` : c === 1 ? `$${D(ext(k))}$` : `$${D(itr(k))}$`);
      const row = (k, bl) => [0, 1, 2].map((c) => (c === bl ? '?' : cell(k, c)));
      const rows = ks.map((k, i) => row(k, i === 0 && col !== 0 ? col : i === 1 ? (col === 0 ? 1 : 0) : -1));
      const ans = ks.slice(0, 2).map((k, i) => [i === 0 && col !== 0 ? col : (col === 0 ? 1 : 0), k]);
      const asW = ans.map(([c, k]) => (c === 0 ? `$n = ${k}$` : c === 1 ? `$${D(ext(k))}$` : `$${D(itr(k))}$`));
      const steps = ans.map(([c, k]) => (c === 0 ? `$n = 360^\\circ \\div ${D(ext(k))} = ${k}$` : c === 1 ? `$360^\\circ \\div ${k} = ${D(ext(k))}$` : `$180^\\circ - ${D(ext(k))} = ${D(itr(k))}$`));
      return { q: T(`The table gives the angles of some regular polygons. Fill in each "?".<br>${SPM.table(rows, { head })}`, `Jadual memberi sudut beberapa poligon sekata. Isikan setiap "?".<br>${SPM.table(rows, { head: headM })}`), a: T(asW.join(' ; ')), w: W(T(`Exterior angle $= \\dfrac{360^\\circ}{n}$, interior angle $= 180^\\circ -$ exterior angle.`, `Sudut peluaran $= \\dfrac{360^\\circ}{n}$, sudut pedalaman $= 180^\\circ -$ sudut peluaran.`), ...steps), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), [a, am] = rna(k), m = mcq(r, ext(k), [itr(k), 180 / k, 360 / (k + 1), 360 - itr(k), ext(k) * 2], (v) => `$${D(v)}$`);
      return { q: T(`What is the size of each exterior angle of ${a}?${m.text}`, `Berapakah saiz setiap sudut peluaran bagi ${am}?${m.text}`), a: T(m.ans), w: W(`$360^\\circ \\div ${k} = ${D(ext(k))}$`, T(`The interior angle $${D(itr(k))}$ is the usual wrong choice.`, `Sudut pedalaman $${D(itr(k))}$ ialah pilihan salah yang biasa.`)), sp: 's' };
    },
    (r) => {
      const k = r.pick(NC), e = ext(k), v = r.int(0, 2);
      return [
        { q: T(`At a vertex of a regular polygon the exterior angle is $${D(e)}$. Find the interior angle at that vertex.`, `Pada satu bucu poligon sekata, sudut peluaran ialah $${D(e)}$. Cari sudut pedalaman pada bucu itu.`), a: T(`$${D(itr(k))}$`), w: W(T(`Interior and exterior angle at a vertex add up to $180^\\circ$.`, `Sudut pedalaman dan sudut peluaran pada satu bucu berjumlah $180^\\circ$.`), `$180^\\circ - ${D(e)} = ${D(itr(k))}$`) },
        { q: T(`At a vertex of a regular polygon the interior angle is $${D(itr(k))}$. Find the exterior angle at that vertex.`, `Pada satu bucu poligon sekata, sudut pedalaman ialah $${D(itr(k))}$. Cari sudut peluaran pada bucu itu.`), a: T(`$${D(e)}$`), w: W(T(`Interior and exterior angle at a vertex add up to $180^\\circ$.`, `Sudut pedalaman dan sudut peluaran pada satu bucu berjumlah $180^\\circ$.`), `$180^\\circ - ${D(itr(k))} = ${D(e)}$`) },
        { q: T(`Complete: interior angle $+$ exterior angle $= \\underline{\\qquad}$. Hence find the interior angle when the exterior angle is $${D(e)}$.`, `Lengkapkan: sudut pedalaman $+$ sudut peluaran $= \\underline{\\qquad}$. Seterusnya cari sudut pedalaman apabila sudut peluaran ialah $${D(e)}$.`), a: T(`$180^\\circ$ ; $${D(itr(k))}$`), w: W(T(`They lie on a straight line, so the sum is $180^\\circ$.`, `Kedua-duanya terletak pada garis lurus, maka hasil tambahnya $180^\\circ$.`), `$180^\\circ - ${D(e)} = ${D(itr(k))}$`) },
      ].map((o) => Object.assign(o, { sp: 's' }))[v];
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), v = r.int(0, 2), e = ext(k);
      return { q: [T(`Each exterior angle of a regular polygon is $${D(e)}$. Find the number of sides.`, `Setiap sudut peluaran sebuah poligon sekata ialah $${D(e)}$. Cari bilangan sisi poligon itu.`), T(`A robot walks round a regular polygon and turns through $${D(e)}$ at each vertex. How many vertices does the polygon have?`, `Sebuah robot berjalan mengelilingi poligon sekata dan berpusing $${D(e)}$ pada setiap bucu. Berapakah bilangan bucu poligon itu?`), T(`For a regular polygon, $n = 360^\\circ \\div \\text{exterior angle}$. Use this to find $n$ when the exterior angle is $${D(e)}$.`, `Bagi poligon sekata, $n = 360^\\circ \\div \\text{sudut peluaran}$. Gunakan rumus ini untuk mencari $n$ apabila sudut peluaran ialah $${D(e)}$.`)][v], a: T(`${k}`), w: T(`$360 \\div ${n(e)} = ${k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8, 10, 12]), s = r.int(3, 15), [a, am] = rna(k);
      return { q: T(`Each side of ${a} is ${s} cm long. Find its perimeter.`, `Setiap sisi ${am} panjangnya ${s} cm. Cari perimeternya.`), a: T(`${k * s} cm`), w: W(T(`Perimeter $=$ number of sides $\\times$ length of one side`, `Perimeter $=$ bilangan sisi $\\times$ panjang satu sisi`), `$${k} \\times ${s} = ${k * s}$ cm`), sp: 's' };
    },
    (r) => {
      const ks = r.sample([3, 4, 5, 6, 8, 10, 12], 3), asc = r.chance();
      const o = ks.slice().sort((x, y) => (asc ? x - y : y - x));
      const list = (i) => ks.map((k) => rn(k)[i]).join(', ');
      const ans = (i) => o.map((k) => `${rn(k)[i]} ($${D(itr(k))}$)`).join(asc ? ' < ' : ' > ');
      return { q: T(`Arrange these regular polygons in ${asc ? 'ascending' : 'descending'} order of the size of one interior angle: ${list(0)}.`, `Susun poligon sekata ini mengikut tertib ${asc ? 'menaik' : 'menurun'} saiz satu sudut pedalaman: ${list(1)}.`), a: T(ans(0), ans(1)), w: W(T(`Interior angle $= 180^\\circ - \\dfrac{360^\\circ}{n}$`, `Sudut pedalaman $= 180^\\circ - \\dfrac{360^\\circ}{n}$`), ...ks.map((k) => `$n = ${k}$: $180^\\circ - 360^\\circ \\div ${k} = ${D(itr(k))}$`), T(ans(0), ans(1))), sp: 's' };
    },
    (r) => {
      const v = r.int(0, 4), k = r.pick([5, 6, 8, 9, 10, 12]);
      const q = [
        ['The exterior angle of a regular polygon with $n$ sides is $\\dfrac{\\ \\underline{\\qquad}\\ }{n}$.', 'Sudut peluaran poligon sekata dengan $n$ sisi ialah $\\dfrac{\\ \\underline{\\qquad}\\ }{n}$.', '$360^\\circ$'],
        ['The interior angle of a regular polygon with $n$ sides is $180^\\circ - \\dfrac{\\ \\underline{\\qquad}\\ }{n}$.', 'Sudut pedalaman poligon sekata dengan $n$ sisi ialah $180^\\circ - \\dfrac{\\ \\underline{\\qquad}\\ }{n}$.', '$360^\\circ$'],
        [`A regular polygon with ${k} sides is called a regular \\underline{\\qquad}.`.replace(/\\underline\{\\qquad\}/, '________'), `Poligon sekata dengan ${k} sisi dipanggil ________ sekata.`, `${pn(k)[0]}`, `${pn(k)[1]}`],
        ['The number of axes of symmetry of a regular polygon is equal to its number of ________.', 'Bilangan paksi simetri poligon sekata sama dengan bilangan ________ nya.', 'sides', 'sisi'],
        ['In a regular polygon, all the sides have the same ________ and all the angles have the same ________.', 'Dalam poligon sekata, semua sisi mempunyai ________ yang sama dan semua sudut mempunyai ________ yang sama.', 'length; size', 'panjang; saiz'],
      ][v];
      const ex = [
        T(`The exterior angles of any polygon add up to $360^\\circ$, shared equally by the $n$ vertices.`, `Sudut peluaran mana-mana poligon berjumlah $360^\\circ$, dikongsi sama rata oleh $n$ bucu.`),
        T(`Interior angle $= 180^\\circ -$ exterior angle, and the exterior angle is $\\dfrac{360^\\circ}{n}$.`, `Sudut pedalaman $= 180^\\circ -$ sudut peluaran, dan sudut peluaran ialah $\\dfrac{360^\\circ}{n}$.`),
        T(`A polygon is named after its number of sides: ${k} sides gives ${art(pn(k)[0])}.`, `Poligon dinamakan mengikut bilangan sisinya: ${k} sisi memberi ${pn(k)[1]}.`),
        T(`Each axis of symmetry passes through one vertex or the midpoint of one side, so there are as many axes as sides.`, `Setiap paksi simetri melalui satu bucu atau titik tengah satu sisi, maka bilangan paksi sama dengan bilangan sisi.`),
        T(`This is the definition of a regular polygon — both conditions must hold.`, `Ini ialah takrifan poligon sekata — kedua-dua syarat mesti dipenuhi.`),
      ][v];
      return { q: T(`Fill in the blank: ${q[0]}`, `Isi tempat kosong: ${q[1]}`), a: T(q[2], q[3] || q[2]), w: W(ex, T(`Answer: ${q[2]}`, `Jawapan: ${q[3] || q[2]}`)), sp: 'xs' };
    },
    (r) => {
      const [ce, cm, k] = r.pick(CTX41), v = r.int(0, 1);
      return { q: T(`${ce} Find the size of each ${v ? 'interior' : 'exterior'} angle.`, `${cm} Cari saiz setiap sudut ${v ? 'pedalaman' : 'peluaran'}.`), a: T(`$${D(v ? itr(k) : ext(k))}$`), w: v ? W(T(`The shape has ${k} sides, so the exterior angle is $360^\\circ \\div ${k} = ${D(ext(k))}$.`, `Bentuk itu mempunyai ${k} sisi, maka sudut peluarannya $360^\\circ \\div ${k} = ${D(ext(k))}$.`), `$180^\\circ - ${D(ext(k))} = ${D(itr(k))}$`) : W(T(`The shape has ${k} sides.`, `Bentuk itu mempunyai ${k} sisi.`), `$360^\\circ \\div ${k} = ${D(ext(k))}$`), sp: 's' };
    },
  ];
  const g41m = [
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24, 30]), v = r.int(0, 2);
      return { q: [T(`A regular polygon has ${k} sides. Find (a) each exterior angle, (b) each interior angle.`, `Sebuah poligon sekata mempunyai ${k} sisi. Cari (a) setiap sudut peluaran, (b) setiap sudut pedalaman.`), T(`Calculate the exterior angle and the interior angle of a regular ${k}-sided polygon. Check that the two angles add up to $180^\\circ$.`, `Hitung sudut peluaran dan sudut pedalaman bagi poligon sekata ${k} sisi. Semak bahawa kedua-dua sudut itu berjumlah $180^\\circ$.`), T(`Two students each draw a regular polygon with ${k} sides. Nurul finds the exterior angle and Ali finds the interior angle. What answers should they get?`, `Dua orang murid masing-masing melukis poligon sekata dengan ${k} sisi. Nurul mencari sudut peluaran dan Ali mencari sudut pedalaman. Apakah jawapan yang sepatutnya mereka peroleh?`)][v], a: T(`$${D(ext(k))}$ ; $${D(itr(k))}$`), w: W(`$360^\\circ \\div ${k} = ${D(ext(k))}$`, `$180^\\circ - ${D(ext(k))} = ${D(itr(k))}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24, 30, 36]), v = r.int(0, 3), e = ext(k), I = itr(k);
      return { q: [T(`Each exterior angle of a regular polygon is $${D(e)}$. Find the number of sides and name the polygon if it has a name.`, `Setiap sudut peluaran poligon sekata ialah $${D(e)}$. Cari bilangan sisi dan namakan poligon itu jika ia mempunyai nama.`), T(`A regular polygon is drawn so that it turns through $${D(e)}$ at every vertex when its edge is traced. How many sides does it have?`, `Sebuah poligon sekata dilukis supaya apabila tepinya dijejaki, ia berpusing $${D(e)}$ pada setiap bucu. Berapakah bilangan sisinya?`), T(`The exterior angles of a regular polygon are each $${D(e)}$. How many exterior angles are there altogether?`, `Setiap sudut peluaran poligon sekata ialah $${D(e)}$. Berapakah jumlah bilangan sudut peluaran?`), T(`Each interior angle of a regular polygon is $${D(I)}$. Find the number of sides.`, `Setiap sudut pedalaman poligon sekata ialah $${D(I)}$. Cari bilangan sisi.`)][v], a: T(v === 0 && NM[k] ? `${k} sides (${NM[k][0]})` : `${k}`, v === 0 && NM[k] ? `${k} sisi (${NM[k][1]})` : `${k}`), w: v === 3 ? T(`Exterior angle $= 180^\\circ - ${D(I)} = ${D(e)}$; $360 \\div ${n(e)} = ${k}$`) : T(`$360 \\div ${n(e)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20]), [a, am] = rna(k), v = r.int(0, 3), e = ext(k), I = itr(k);
      const WR = [
        [`each interior angle of ${a} is $\\dfrac{360^\\circ}{${k}} = ${D(e)}$`, `setiap sudut pedalaman bagi ${am} ialah $\\dfrac{360^\\circ}{${k}} = ${D(e)}$`, `$${D(e)}$ is the exterior angle. Interior angle $= 180^\\circ - ${D(e)} = ${D(I)}$.`, `$${D(e)}$ ialah sudut peluaran. Sudut pedalaman $= 180^\\circ - ${D(e)} = ${D(I)}$.`],
        [`each interior angle of ${a} is $(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, `setiap sudut pedalaman bagi ${am} ialah $(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, `$${D(ssum(k))}$ is the sum of all the interior angles; it must be divided by ${k}: $${D(ssum(k))} \\div ${k} = ${D(I)}$.`, `$${D(ssum(k))}$ ialah hasil tambah semua sudut pedalaman; ia mesti dibahagi dengan ${k}: $${D(ssum(k))} \\div ${k} = ${D(I)}$.`],
        [`each exterior angle of ${a} is $\\dfrac{180^\\circ}{${k}} = ${D(180 / k)}$`, `setiap sudut peluaran bagi ${am} ialah $\\dfrac{180^\\circ}{${k}} = ${D(180 / k)}$`, `The exterior angles add up to $360^\\circ$, not $180^\\circ$: $360^\\circ \\div ${k} = ${D(e)}$.`, `Sudut peluaran berjumlah $360^\\circ$, bukan $180^\\circ$: $360^\\circ \\div ${k} = ${D(e)}$.`],
        [`each interior angle of ${a} is $180^\\circ \\times ${k} = ${D(180 * k)}$`, `setiap sudut pedalaman bagi ${am} ialah $180^\\circ \\times ${k} = ${D(180 * k)}$`, `An interior angle of a polygon cannot exceed $180^\\circ$. The correct value is $180^\\circ - 360^\\circ \\div ${k} = ${D(I)}$.`, `Sudut pedalaman poligon tidak boleh melebihi $180^\\circ$. Nilai yang betul ialah $180^\\circ - 360^\\circ \\div ${k} = ${D(I)}$.`],
      ][v];
      const who = r.pick([['Farid', 'he'], ['Siti', 'she'], ['Kumar', 'he'], ['Mei Ling', 'she']]);
      return { q: T(`${who[0]} says that ${WR[0]}. Find the mistake and give the correct answer.`, `${who[0]} berkata ${WR[1]}. Cari kesilapan itu dan berikan jawapan yang betul.`), a: T(WR[2], WR[3]), w: v === 2 ? W(T(`The exterior angles of a polygon add up to $360^\\circ$, not $180^\\circ$.`, `Sudut peluaran poligon berjumlah $360^\\circ$, bukan $180^\\circ$.`), T(`Exterior angle $= 360^\\circ \\div ${k} = ${D(e)}$`, `Sudut peluaran $= 360^\\circ \\div ${k} = ${D(e)}$`)) : W(T(`Exterior angle $= 360^\\circ \\div ${k} = ${D(e)}$`, `Sudut peluaran $= 360^\\circ \\div ${k} = ${D(e)}$`), T(`Interior angle $= 180^\\circ - ${D(e)} = ${D(I)}$`, `Sudut pedalaman $= 180^\\circ - ${D(e)} = ${D(I)}$`)), sp: 's' };
    },
    (r) => {
      const v = r.int(0, 2), yes = r.chance(0.5);
      const k = r.pick([9, 10, 12, 15, 18, 20]);
      const e = yes ? ext(k) : r.pick([25, 35, 50, 70, 80, 100, 14, 16, 22]), I = 180 - e;
      const ok = Number.isInteger(360 / e);
      const src = v === 0 ? T(`Can a regular polygon have an exterior angle of $${D(e)}$? Explain.`, `Bolehkah sebuah poligon sekata mempunyai sudut peluaran $${D(e)}$? Terangkan.`) : v === 1 ? T(`Can a regular polygon have an interior angle of $${D(I)}$? Explain.`, `Bolehkah sebuah poligon sekata mempunyai sudut pedalaman $${D(I)}$? Terangkan.`) : T(`Aina wants to draw a regular polygon with each exterior angle $${D(e)}$. Is it possible? If so, how many sides?`, `Aina ingin melukis poligon sekata yang setiap sudut peluarannya $${D(e)}$. Adakah ia mungkin? Jika ya, berapakah bilangan sisinya?`);
      return { q: src, a: ok ? T(`Yes. $n = 360 \\div ${n(e)} = ${360 / e}$ sides.`, `Ya. $n = 360 \\div ${n(e)} = ${360 / e}$ sisi.`) : T(`No. $360 \\div ${n(e)} = ${n(round(360 / e, 2))}\\ldots$ is not a whole number, so the number of sides would not be an integer.`, `Tidak. $360 \\div ${n(e)} = ${n(round(360 / e, 2))}\\ldots$ bukan nombor bulat, maka bilangan sisi bukan integer.`), w: W(T(`For a regular polygon, $n = 360^\\circ \\div$ exterior angle.`, `Bagi poligon sekata, $n = 360^\\circ \\div$ sudut peluaran.`), ...(v === 1 ? [T(`Exterior angle $= 180^\\circ - ${D(I)} = ${D(e)}$`, `Sudut peluaran $= 180^\\circ - ${D(I)} = ${D(e)}$`)] : []), `$360 \\div ${n(e)} = ${ok ? 360 / e : n(round(360 / e, 2)) + '\\ldots'}$`, ok ? T(`This is a whole number, so the polygon exists: ${360 / e} sides.`, `Ini nombor bulat, maka poligon itu wujud: ${360 / e} sisi.`) : T(`$n$ must be a whole number, so no such regular polygon exists.`, `$n$ mesti nombor bulat, maka poligon sekata itu tidak wujud.`)), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), v = r.int(0, 2), i = 0;
      const ang = ext(k), In = itr(k);
      const fig = polyFig(regPts(k), { names: LET.slice(0, k).split(''), extra: (P, M, C) => S.line(C[0], C[1], P[0][0], P[0][1]) + S.line(C[0], C[1], P[1][0], P[1][1]) + S.dot(C[0], C[1], 2.5) + S.text(C[0] + 2, C[1] - 10, 'O', { i: true }) + (v === 0 ? S.arc(C, P[0], P[1], 18, 'x', { gap: 12 }) : S.arc(P[0], P[1], C, 20, 'x', { gap: 13 })) });
      return { q: T(`The diagram shows a regular ${pn(k)[0]} with centre $O$. Find $x$.`, `Rajah menunjukkan ${pn(k)[1]} sekata berpusat $O$. Cari $x$.`), fig, a: v === 0 ? T(`$x = \\angle AOB = ${D(ang)}$`) : T(`$x = \\angle OAB = ${D(In / 2)}$`), w: v === 0 ? T(`$360^\\circ \\div ${k}$ (the ${k} equal angles at $O$)`, `$360^\\circ \\div ${k}$ (${k} sudut sama di $O$)`) : T(`$\\triangle OAB$ is isosceles: $(180^\\circ - ${D(ang)}) \\div 2$`, `$\\triangle OAB$ ialah segi tiga sama kaki: $(180^\\circ - ${D(ang)}) \\div 2$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), s = r.int(3, 12), v = r.int(0, 2), [a, am] = rna(k);
      return { q: [T(`The perimeter of ${a} is ${k * s} cm. Find the length of each side and the size of each exterior angle.`, `Perimeter ${am} ialah ${k * s} cm. Cari panjang setiap sisi dan saiz setiap sudut peluaran.`), T(`A regular polygon has sides of ${s} cm and a perimeter of ${k * s} cm. Find the size of each interior angle.`, `Sebuah poligon sekata mempunyai sisi ${s} cm dan perimeter ${k * s} cm. Cari saiz setiap sudut pedalaman.`), T(`A wire ${k * s} cm long is bent into a regular polygon with sides of ${s} cm each. Find the exterior angle of the polygon.`, `Seutas dawai sepanjang ${k * s} cm dibengkokkan menjadi poligon sekata dengan setiap sisi ${s} cm. Cari sudut peluaran poligon itu.`)][v], a: v === 0 ? T(`${s} cm ; $${D(ext(k))}$`) : T(`$${D(v === 1 ? itr(k) : ext(k))}$`), w: W(`$n = ${k * s} \\div ${s} = ${k}$`, `$360^\\circ \\div ${k} = ${D(ext(k))}$`, `$180^\\circ - ${D(ext(k))} = ${D(itr(k))}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24]), a1 = r.pick([2, 3, 4, 5]), b = r.int(1, 30), v = r.int(0, 1);
      const x = (ext(k) - b) / a1;
      need(Number.isInteger(x) && x > 0);
      const I = itr(k), xs = (I - b) / a1;
      return v === 0 ? { q: T(`Each exterior angle of a regular ${k}-sided polygon is $(${a1}x + ${b})^\\circ$. Find the value of $x$.`, `Setiap sudut peluaran poligon sekata ${k} sisi ialah $(${a1}x + ${b})^\\circ$. Cari nilai $x$.`), a: T(`$x = ${x}$`), w: T(`$${a1}x + ${b} = 360 \\div ${k} = ${n(ext(k))}$`), sp: 's' }
        : (Number.isInteger(xs) ? { q: T(`Each interior angle of a regular ${k}-sided polygon is $(${a1}x + ${b})^\\circ$. Find the value of $x$.`, `Setiap sudut pedalaman poligon sekata ${k} sisi ialah $(${a1}x + ${b})^\\circ$. Cari nilai $x$.`), a: T(`$x = ${xs}$`), w: T(`$${a1}x + ${b} = 180 - 360 \\div ${k} = ${n(I)}$`), sp: 's' } : need(false));
    },
    (r) => {
      const [p, q2] = r.sample([5, 6, 8, 9, 10, 12, 15, 18], 2), v = r.int(0, 2), a = Math.min(p, q2), b = Math.max(p, q2);
      const [ea, eb] = [rn(a), rn(b)];
      return { q: [T(`Regular polygon $P$ has ${a} sides and regular polygon $Q$ has ${b} sides. Find the difference between their interior angles.`, `Poligon sekata $P$ mempunyai ${a} sisi dan poligon sekata $Q$ mempunyai ${b} sisi. Cari beza antara sudut pedalaman kedua-duanya.`), T(`Compare ${art(ea[0])} and ${art(eb[0])}. Which has the bigger exterior angle, and by how many degrees?`, `Bandingkan ${ea[1]} dengan ${eb[1]}. Yang manakah mempunyai sudut peluaran lebih besar, dan lebih berapa darjah?`), T(`The number of sides of regular polygon $A$ is ${a}. Regular polygon $B$ has ${b} sides. Find the ratio of the exterior angle of $A$ to that of $B$ in its simplest form.`, `Bilangan sisi poligon sekata $A$ ialah ${a}. Poligon sekata $B$ mempunyai ${b} sisi. Cari nisbah sudut peluaran $A$ kepada sudut peluaran $B$ dalam bentuk termudah.`)][v], a: v === 0 ? T(`$${D(itr(b) - itr(a))}$`) : v === 1 ? T(`${cap(ea[0])}; $${D(ext(a) - ext(b))}$ more`, `${cap(ea[1])}; lebih $${D(ext(a) - ext(b))}$`) : T(`$${b / gcd(a, b)} : ${a / gcd(a, b)}$`), w: v === 0 ? W(`$180^\\circ - 360^\\circ \\div ${a} = ${D(itr(a))}$`, `$180^\\circ - 360^\\circ \\div ${b} = ${D(itr(b))}$`, `$${D(itr(b))} - ${D(itr(a))} = ${D(itr(b) - itr(a))}$`) : v === 1 ? W(`$360^\\circ \\div ${a} = ${D(ext(a))}$`, `$360^\\circ \\div ${b} = ${D(ext(b))}$`, `$${D(ext(a))} - ${D(ext(b))} = ${D(ext(a) - ext(b))}$`, T(`Fewer sides gives the bigger exterior angle.`, `Bilangan sisi yang lebih sedikit memberi sudut peluaran yang lebih besar.`)) : W(`$${D(ext(a))} : ${D(ext(b))}$`, T(`Divide both by $${gcd(360 / a, 360 / b)}$:`, `Bahagi kedua-duanya dengan $${gcd(360 / a, 360 / b)}$:`), `$${b / gcd(a, b)} : ${a / gcd(a, b)}$`), sp: 's' };
    },
    (r) => {
      const ks = r.sample([5, 6, 8, 9, 10, 12, 15, 18], 3);
      const rows = ks.map((k, i) => (i === 0 ? [`?`, `$${D(ext(k))}$`, '?'] : i === 1 ? ['?', '?', `$${D(itr(k))}$`] : [`${k}`, '?', '?']));
      const ans = ks.map((k, i) => (i === 0 ? `$n = ${k}$, $${D(itr(k))}$` : i === 1 ? `$n = ${k}$, $${D(ext(k))}$` : `$${D(ext(k))}$, $${D(itr(k))}$`)).join(' ; ');
      const st = ks.map((k, i) => (i === 0 ? `$n = 360^\\circ \\div ${D(ext(k))} = ${k}$, $180^\\circ - ${D(ext(k))} = ${D(itr(k))}$` : i === 1 ? `$180^\\circ - ${D(itr(k))} = ${D(ext(k))}$, $n = 360^\\circ \\div ${D(ext(k))} = ${k}$` : `$360^\\circ \\div ${k} = ${D(ext(k))}$, $180^\\circ - ${D(ext(k))} = ${D(itr(k))}$`));
      return { q: T(`Complete the table for three regular polygons.<br>${SPM.table(rows, { head: ['$n$', 'Exterior angle', 'Interior angle'] })}`, `Lengkapkan jadual bagi tiga poligon sekata.<br>${SPM.table(rows, { head: ['$n$', 'Sudut peluaran', 'Sudut pedalaman'] })}`), a: T(ans), w: W(T(`Use exterior angle $= \\dfrac{360^\\circ}{n}$ and interior angle $= 180^\\circ -$ exterior angle.`, `Guna sudut peluaran $= \\dfrac{360^\\circ}{n}$ dan sudut pedalaman $= 180^\\circ -$ sudut peluaran.`), ...st), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), I = itr(k), m = mcq(r, k, [k + 2, k - 1, Math.round(I / 10) * 1 + 1, 2 * k, k + 4], (v) => `${v}`);
      return { q: T(`Each interior angle of a regular polygon is $${D(I)}$. How many sides does it have?${m.text}`, `Setiap sudut pedalaman poligon sekata ialah $${D(I)}$. Berapakah bilangan sisinya?${m.text}`), a: T(m.ans), w: W(`$180^\\circ - ${D(I)} = ${D(ext(k))}$`, `$n = 360 \\div ${n(ext(k))} = ${k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24]), v = r.int(0, 1), e = ext(k), I = itr(k), d = I - e, g = gcd(I, e);
      return { q: v === 0 ? T(`Each interior angle of a regular polygon is $${D(d)}$ more than its exterior angle. Find the number of sides.`, `Setiap sudut pedalaman sebuah poligon sekata adalah $${D(d)}$ lebih besar daripada sudut peluarannya. Cari bilangan sisi.`) : T(`The ratio of an interior angle to an exterior angle of a regular polygon is $${I / g} : ${e / g}$. Find the number of sides.`, `Nisbah sudut pedalaman kepada sudut peluaran bagi sebuah poligon sekata ialah $${I / g} : ${e / g}$. Cari bilangan sisi.`), a: T(`${k}`), w: T(`Let the exterior angle be $e$: interior $= 180^\\circ - e$. Solve to get $e = ${D(e)}$, so $n = 360 \\div ${n(e)}$.`, `Katakan sudut peluaran ialah $e$: sudut pedalaman $= 180^\\circ - e$. Selesaikan untuk mendapat $e = ${D(e)}$, maka $n = 360 \\div ${n(e)}$.`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8, 9, 10, 12]), v = r.int(0, 1), I = itr(k), e = ext(k);
      const nm = rn(k);
      return { q: v === 0 ? T(`A regular polygon has each interior angle $${D(I)}$. What is the name of the polygon?`, `Setiap sudut pedalaman sebuah poligon sekata ialah $${D(I)}$. Apakah nama poligon itu?`) : T(`A regular polygon has each exterior angle $${D(e)}$. What is the name of the polygon?`, `Setiap sudut peluaran sebuah poligon sekata ialah $${D(e)}$. Apakah nama poligon itu?`), a: T(cap(nm[0]), cap(nm[1])), w: T(`$n = 360 \\div ${n(e)} = ${k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), i = r.int(1, k - 1);
      return { q: nts(T(`The diagram shows part of a regular polygon. One side is extended and the exterior angle is $${D(ext(k))}$. How many sides does the polygon have?`, `Rajah menunjukkan sebahagian poligon sekata. Satu sisi dipanjangkan dan sudut peluarannya ialah $${D(ext(k))}$. Berapakah bilangan sisi poligon itu?`)), fig: extFig(k, i, `${n(ext(k))}°`, true), a: T(`${k}`), w: W(T(`Count the sides in the diagram, or use $n = 360^\\circ \\div$ exterior angle.`, `Bilang sisi dalam rajah, atau guna $n = 360^\\circ \\div$ sudut peluaran.`), `$360 \\div ${n(ext(k))} = ${k}$`), sp: 's' };
    },
    (r) => {
      const [ce, cm, k] = r.pick(CTX41), s = r.int(20, 60), v = r.int(0, 1);
      return { q: T(`${ce} Each side is ${s} cm long. Find (a) the interior angle, (b) the perimeter.`, `${cm} Setiap sisinya panjangnya ${s} cm. Cari (a) sudut pedalaman, (b) perimeter.`), a: T(`(a) $${D(itr(k))}$ (b) ${k * s} cm`, `(a) $${D(itr(k))}$ (b) ${k * s} cm`), w: W(T(`The shape has ${k} equal sides.`, `Bentuk itu mempunyai ${k} sisi yang sama panjang.`), `(a) $360^\\circ \\div ${k} = ${D(ext(k))}$, $180^\\circ - ${D(ext(k))} = ${D(itr(k))}$`, `(b) $${k} \\times ${s} = ${k * s}$ cm`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), e = ext(k), v = r.int(0, 5);
      const C = [['A Ferris wheel has', 'Sebuah roda Ferris mempunyai', 'cabins evenly spaced round the wheel', 'kabin yang diletakkan sama jarak di sekeliling roda'], ['A round table has', 'Sebuah meja bulat mempunyai', 'chairs evenly spaced round it', 'kerusi yang diletakkan sama jarak di sekelilingnya'], ['A clock-like dial has', 'Sebuah dail seperti jam mempunyai', 'marks evenly spaced round its edge', 'tanda yang sama jarak di sekeliling tepinya']][v % 3];
      const j = r.int(2, Math.min(4, k - 1)), t = v < 3;
      return { q: t ? T(`${C[0]} ${k} ${C[2]}. The centre of the wheel is $O$. Find the angle at $O$ between two neighbouring ones.`, `${C[1]} ${k} ${C[3]}. Pusatnya ialah $O$. Cari sudut di $O$ antara dua yang bersebelahan.`) : T(`${C[0]} ${k} ${C[2]}. Find the angle at the centre between two of them that are ${j} places apart, counted round the shorter way.`, `${C[1]} ${k} ${C[3]}. Cari sudut di pusat antara dua daripadanya yang berjarak ${j} kedudukan, dikira melalui laluan yang lebih pendek.`), a: t ? T(`$${D(e)}$`) : T(`$${D(e * j)}$`), w: W(T(`The ${k} equal angles at the centre share one full turn.`, `${k} sudut sama besar di pusat berkongsi satu putaran penuh.`), `$360^\\circ \\div ${k}${t ? '' : ` \\times ${j}`} = ${D(t ? e : e * j)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), v = r.int(0, 3), I = itr(k), e = ext(k);
      const q = [[`What fraction of a straight angle ($180^\\circ$) is each interior angle of a regular polygon with exterior angle $${D(e)}$?`, `Berapakah pecahan sudut lurus ($180^\\circ$) yang diwakili oleh setiap sudut pedalaman poligon sekata yang sudut peluarannya $${D(e)}$?`, `$\\dfrac{${I / gcd(I, 180)}}{${180 / gcd(I, 180)}}$`], [`What fraction of a full turn ($360^\\circ$) is each exterior angle of a regular polygon with ${k} sides?`, `Berapakah pecahan satu putaran penuh ($360^\\circ$) yang diwakili oleh setiap sudut peluaran poligon sekata dengan ${k} sisi?`, `$\\dfrac{1}{${k}}$`], [`Express the interior angle of a regular polygon with ${k} sides as a percentage of a straight angle, correct to the nearest whole number.`, `Nyatakan sudut pedalaman poligon sekata dengan ${k} sisi sebagai peratusan sudut lurus, betul kepada nombor bulat terdekat.`, `${Math.round((I / 180) * 100)}\\%`.replace(/^/, '$') + '$'], [`The exterior angle of a regular polygon is ${n(round(e / 360 * 100, 2))}\\% of a full turn. How many sides does it have?`.replace(/\\%/, '%'), `Sudut peluaran sebuah poligon sekata ialah ${n(round(e / 360 * 100, 2))}% daripada satu putaran penuh. Berapakah bilangan sisinya?`, `${k}`]][v];
      const wq = [
        W(`$180^\\circ - ${D(e)} = ${D(I)}$`, `$\\dfrac{${I}}{180} = \\dfrac{${I / gcd(I, 180)}}{${180 / gcd(I, 180)}}$`),
        W(`$360^\\circ \\div ${k} = ${D(ext(k))}$`, `$\\dfrac{${n(ext(k))}}{360} = \\dfrac{1}{${k}}$`),
        W(`$180^\\circ - 360^\\circ \\div ${k} = ${D(I)}$`, `$\\dfrac{${I}}{180} \\times 100\\% = ${n(round((I / 180) * 100, 2))}\\%$`, T(`Correct to the nearest whole number: $${Math.round((I / 180) * 100)}\\%$`, `Betul kepada nombor bulat terdekat: $${Math.round((I / 180) * 100)}\\%$`)),
        W(`$${n(round((e / 360) * 100, 2))}\\% \\times 360^\\circ = ${D(e)}$`, `$n = 360 \\div ${n(e)} = ${k}$`),
      ][v];
      return { q: T(q[0], q[1]), a: T(q[2]), w: wq, sp: 's' };
    },
    (r) => {
      const [a, b] = r.sample([5, 6, 8, 9, 10, 12, 15, 18, 20, 24], 2), v = r.int(0, 3), lo = Math.min(a, b), hi = Math.max(a, b);
      return { q: [T(`Without calculating, decide which is larger: the interior angle of a regular ${lo}-sided polygon or of a regular ${hi}-sided polygon. Explain.`, `Tanpa mengira, tentukan yang mana lebih besar: sudut pedalaman poligon sekata ${lo} sisi atau poligon sekata ${hi} sisi. Terangkan.`), T(`Which regular polygon has the smaller exterior angle, one with ${lo} sides or one with ${hi} sides? Give a reason.`, `Poligon sekata yang manakah mempunyai sudut peluaran lebih kecil, yang mempunyai ${lo} sisi atau ${hi} sisi? Berikan sebab.`), T(`Alia says: "A polygon with more sides has a bigger exterior angle." Is she correct? Test her statement with regular polygons of ${lo} and ${hi} sides.`, `Alia berkata: "Poligon yang mempunyai lebih banyak sisi mempunyai sudut peluaran yang lebih besar." Adakah dia betul? Uji pernyataannya dengan poligon sekata ${lo} sisi dan ${hi} sisi.`), T(`As the number of sides of a regular polygon increases, what happens to (a) the exterior angle, (b) the interior angle? Illustrate with ${lo} sides and ${hi} sides.`, `Apabila bilangan sisi poligon sekata bertambah, apakah yang berlaku kepada (a) sudut peluaran, (b) sudut pedalaman? Ilustrasikan dengan ${lo} sisi dan ${hi} sisi.`)][v], a: [T(`The ${hi}-sided one: $${D(itr(hi))}$ compared with $${D(itr(lo))}$ (smaller exterior angle, so larger interior angle).`, `Yang ${hi} sisi: $${D(itr(hi))}$ berbanding $${D(itr(lo))}$ (sudut peluaran lebih kecil, maka sudut pedalaman lebih besar).`), T(`The ${hi}-sided one: $${D(ext(hi))}$ compared with $${D(ext(lo))}$, because $360^\\circ$ is shared among more angles.`, `Yang ${hi} sisi: $${D(ext(hi))}$ berbanding $${D(ext(lo))}$, kerana $360^\\circ$ dikongsi oleh lebih banyak sudut.`), T(`No. $${D(ext(lo))}$ for ${lo} sides is bigger than $${D(ext(hi))}$ for ${hi} sides; the exterior angle decreases.`, `Tidak. $${D(ext(lo))}$ bagi ${lo} sisi lebih besar daripada $${D(ext(hi))}$ bagi ${hi} sisi; sudut peluaran berkurang.`), T(`(a) it decreases: $${D(ext(lo))} \\to ${D(ext(hi))}$ (b) it increases: $${D(itr(lo))} \\to ${D(itr(hi))}$`, `(a) berkurang: $${D(ext(lo))} \\to ${D(ext(hi))}$ (b) bertambah: $${D(itr(lo))} \\to ${D(itr(hi))}$`)][v], w: W(`$360^\\circ \\div ${lo} = ${D(ext(lo))}$`, `$360^\\circ \\div ${hi} = ${D(ext(hi))}$`, `$180^\\circ - ${D(ext(lo))} = ${D(itr(lo))}$`, `$180^\\circ - ${D(ext(hi))} = ${D(itr(hi))}$`, T(`With more sides the exterior angle gets smaller, so the interior angle gets larger.`, `Dengan lebih banyak sisi, sudut peluaran menjadi lebih kecil, maka sudut pedalaman menjadi lebih besar.`)), sp: 's' };
    },
    (r) => {
      const ks = r.sample([3, 4, 5, 6, 8, 9, 10, 12], 3), v = r.int(0, 1);
      const o = r.shuffle(ks);
      const A = (k) => (v === 0 ? `$${D(ext(k))}$` : `$${D(itr(k))}$`);
      const sh = r.shuffle(ks);
      return { q: T(`Match each regular polygon with the size of its ${v === 0 ? 'exterior' : 'interior'} angle.<br>${o.map((k) => `${rn(k)[0]}`).join(' ; ')}<br>${sh.map((k) => A(k)).join(' ; ')}`, `Padankan setiap poligon sekata dengan saiz sudut ${v === 0 ? 'peluaran' : 'pedalaman'}nya.<br>${o.map((k) => `${rn(k)[1]}`).join(' ; ')}<br>${sh.map((k) => A(k)).join(' ; ')}`), a: T(o.map((k) => `${rn(k)[0]} $\\to$ ${A(k)}`).join(' ; '), o.map((k) => `${rn(k)[1]} $\\to$ ${A(k)}`).join(' ; ')), w: W(T(v === 0 ? `Exterior angle $= \\dfrac{360^\\circ}{n}$` : `Interior angle $= 180^\\circ - \\dfrac{360^\\circ}{n}$`, v === 0 ? `Sudut peluaran $= \\dfrac{360^\\circ}{n}$` : `Sudut pedalaman $= 180^\\circ - \\dfrac{360^\\circ}{n}$`), ...o.map((k) => T(`${rn(k)[0]}, $n = ${k}$: ${A(k)}`, `${rn(k)[1]}, $n = ${k}$: ${A(k)}`))), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), v = r.int(0, 2), I = itr(k);
      const C = [['A carpenter makes a wooden frame in the shape of a regular polygon. The two neighbouring pieces meet at an angle of', 'Seorang tukang kayu membuat bingkai kayu berbentuk poligon sekata. Dua kepingan yang bersebelahan bertemu pada sudut', 'How many pieces of wood are needed?', 'Berapakah bilangan kepingan kayu yang diperlukan?'], ['A garden is fenced in the shape of a regular polygon. At each corner post the fence turns through an angle of', 'Sebuah taman dipagar berbentuk poligon sekata. Pada setiap tiang penjuru, pagar membelok sebanyak', 'How many posts are used?', 'Berapakah bilangan tiang yang digunakan?'], ['A pattern is made from a regular polygon with each interior angle of', 'Satu corak dibuat daripada poligon sekata dengan setiap sudut pedalaman', 'How many sides does the polygon have?', 'Berapakah bilangan sisi poligon itu?']][v];
      const val = v === 1 ? ext(k) : I;
      return { q: T(`${C[0]} $${D(val)}$. ${C[2]}`, `${C[1]} $${D(val)}$. ${C[3]}`), a: T(`${k}`), w: W(T(`Turning at a corner is the exterior angle: $360^\\circ \\div n = ${D(ext(k))}$`, `Belokan di penjuru ialah sudut peluaran: $360^\\circ \\div n = ${D(ext(k))}$`), `$n = 360 \\div ${n(ext(k))} = ${k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), v = r.int(0, 3), s = r.int(3, 12), P = k * s;
      return { q: [T(`A regular polygon has perimeter ${P} cm and each side ${s} cm. Find its exterior angle.`, `Sebuah poligon sekata mempunyai perimeter ${P} cm dan setiap sisi ${s} cm. Cari sudut peluarannya.`), T(`The perimeter of a regular polygon is ${P} cm and each side is ${s} cm. Find its interior angle.`, `Perimeter sebuah poligon sekata ialah ${P} cm dan setiap sisinya ${s} cm. Cari sudut pedalamannya.`), T(`A regular polygon has exterior angle $${D(ext(k))}$ and perimeter ${P} cm. Find the length of one side.`, `Sebuah poligon sekata mempunyai sudut peluaran $${D(ext(k))}$ dan perimeter ${P} cm. Cari panjang satu sisi.`), T(`A regular polygon has interior angle $${D(itr(k))}$ and sides of ${s} cm. Find its perimeter.`, `Sebuah poligon sekata mempunyai sudut pedalaman $${D(itr(k))}$ dan sisi ${s} cm. Cari perimeternya.`)][v], a: [T(`$${D(ext(k))}$`), T(`$${D(itr(k))}$`), T(`${s} cm`), T(`${P} cm`)][v], w: [
        W(`$n = ${P} \\div ${s} = ${k}$`, `$360^\\circ \\div ${k} = ${D(ext(k))}$`),
        W(`$n = ${P} \\div ${s} = ${k}$`, `$360^\\circ \\div ${k} = ${D(ext(k))}$`, `$180^\\circ - ${D(ext(k))} = ${D(itr(k))}$`),
        W(`$n = 360^\\circ \\div ${D(ext(k))} = ${k}$`, `$${P} \\div ${k} = ${s}$ cm`),
        W(`$180^\\circ - ${D(itr(k))} = ${D(ext(k))}$`, `$n = 360^\\circ \\div ${D(ext(k))} = ${k}$`, `$${k} \\times ${s} = ${P}$ cm`),
      ][v], sp: 's' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24]), v = r.int(0, 2), e = ext(k), I = itr(k);
      return { q: [T(`Show that if the interior angle of a regular polygon is $${D(I)}$, the polygon cannot be a hexagon or an octagon.`, `Tunjukkan bahawa jika sudut pedalaman sebuah poligon sekata ialah $${D(I)}$, poligon itu tidak boleh menjadi heksagon atau oktagon.`), T(`Ali says a regular octagon has an exterior angle of $${D(e)}$. Without finding the number of sides, explain why he is wrong.`, `Ali berkata oktagon sekata mempunyai sudut peluaran $${D(e)}$. Tanpa mencari bilangan sisi, terangkan mengapa dia salah.`), T(`A regular hexagon and a regular polygon $R$ have exterior angles $60^\\circ$ and $${D(e)}$ respectively. Which has the larger interior angle? Find the difference.`, `Sebuah heksagon sekata dan sebuah poligon sekata $R$ mempunyai sudut peluaran $60^\\circ$ dan $${D(e)}$ masing-masing. Yang manakah mempunyai sudut pedalaman lebih besar? Cari bezanya.`)][v], a: [T(`A regular hexagon has interior angle $120^\\circ$ and a regular octagon $135^\\circ$, but $${D(I)}$ is different from both.`, `Heksagon sekata mempunyai sudut pedalaman $120^\\circ$ dan oktagon sekata $135^\\circ$, tetapi $${D(I)}$ berbeza daripada kedua-duanya.`), T(`The exterior angle of a regular octagon is $360^\\circ \\div 8 = 45^\\circ$, not $${D(e)}$.`, `Sudut peluaran oktagon sekata ialah $360^\\circ \\div 8 = 45^\\circ$, bukan $${D(e)}$.`), T(`$R$: $${D(I)}$ compared with $120^\\circ$; the difference is $${D(I - 120)}$.`, `$R$: $${D(I)}$ berbanding $120^\\circ$; bezanya $${D(I - 120)}$.`)][v], w: [
        W(`$180^\\circ - 360^\\circ \\div 6 = 120^\\circ$`, `$180^\\circ - 360^\\circ \\div 8 = 135^\\circ$`, T(`Neither equals $${D(I)}$, so the polygon is neither: $n = 360 \\div ${n(e)} = ${k}$.`, `Kedua-duanya tidak sama dengan $${D(I)}$, maka poligon itu bukan salah satu daripadanya: $n = 360 \\div ${n(e)} = ${k}$.`)),
        W(T(`An octagon has $8$ sides.`, `Oktagon mempunyai $8$ sisi.`), `$360^\\circ \\div 8 = 45^\\circ \\ne ${D(e)}$`),
        W(`$180^\\circ - 60^\\circ = 120^\\circ$`, `$180^\\circ - ${D(e)} = ${D(I)}$`, `$${D(I)} - 120^\\circ = ${D(I - 120)}$`),
      ][v], sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), e = ext(k), v = r.int(0, 2);
      const fig = polyFig(regPts(k), { names: LET.slice(0, k).split(''), extra: (P) => S.line(P[0][0], P[0][1], P[2][0], P[2][1]) + S.arc(P[0], P[1], P[2], 20, `${n(e / 2)}°`, { gap: 15 }) });
      return { q: nts(T(`The diagram shows a regular polygon $ABCD\\ldots$ with the diagonal $AC$. $\\angle BAC = ${D(e / 2)}$. Find ${v === 0 ? 'the number of sides' : v === 1 ? '$\\angle ABC$' : 'the exterior angle of the polygon'}.`, `Rajah menunjukkan poligon sekata $ABCD\\ldots$ dengan pepenjuru $AC$. $\\angle BAC = ${D(e / 2)}$. Cari ${v === 0 ? 'bilangan sisi' : v === 1 ? '$\\angle ABC$' : 'sudut peluaran poligon itu'}.`)), fig, a: T(v === 0 ? `${k}` : v === 1 ? `$${D(itr(k))}$` : `$${D(e)}$`), w: T(`$\\angle ABC = 180^\\circ - 2 \\times ${D(e / 2)} = ${D(itr(k))}$`), sp: 'm' };
    },
  ];
  const nts = (q) => T(q.en + ' ' + SPM.NTS.en, q.ms + ' ' + SPM.NTS.ms);
  /** two regular polygons (k1 above, k2 below) sharing side AB; x marks the gap at A */
  function twoFig(k1, k2, lab) {
    const build = (k, sg) => { const pts = [[0, 0]]; let th = 0; for (let i = 1; i < k; i++) { pts.push([pts[i - 1][0] + Math.cos(rad(th)), pts[i - 1][1] + sg * Math.sin(rad(th))]); th += 360 / k; } return pts; };
    const a = build(k1, -1), b = build(k2, 1).slice(1);
    const all = F.fit(a.concat(b), 280, 220, 26), P1 = all.slice(0, k1), P2 = [P1[0]].concat(all.slice(k1));
    let out = S.poly(P1) + S.poly(P2) + S.arc(P1[0], P1[k1 - 1], P2[k2 - 1], 20, lab, { gap: 14 });
    out += S.pointLabel(P1[0], 'A', 10, -12) + S.pointLabel(P1[1], 'B', 8, -12);
    return S.wrap(280, 220, out, 'two polygons');
  }
  /** regular polygon ABC… (V0 = B, V1 = C, V(k-1) = A); AB and DC produced meet at P below BC */
  function meetFig(k, lab) {
    const V = regPts(k), nm = (i) => LET[(i + 1) % k];
    const d1 = [V[0][0] - V[k - 1][0], V[0][1] - V[k - 1][1]], d2 = [V[1][0] - V[2][0], V[1][1] - V[2][1]];
    const det = d1[0] * -d2[1] + d2[0] * d1[1];
    const t = ((V[1][0] - V[0][0]) * -d2[1] + d2[0] * (V[1][1] - V[0][1])) / det;
    const Pp = [V[0][0] + t * d1[0], V[0][1] + t * d1[1]];
    return polyFig(V, { more: [Pp], names: V.map((_, i) => nm(i)), h: 210, extra: (P, M) => S.line(P[0][0], P[0][1], M[0][0], M[0][1]) + S.line(P[1][0], P[1][1], M[0][0], M[0][1]) + S.arc(M[0], P[0], P[1], 20, lab, { gap: 14 }) + S.text(M[0][0], M[0][1] + 13, 'P', { i: true }) });
  }
  const g41a = [
    (r) => {
      const [k1, k2] = r.pick([[5, 4], [6, 4], [6, 5], [8, 4], [5, 5], [6, 6], [8, 6], [10, 5], [12, 4], [8, 8], [10, 6], [9, 5]]);
      const x = 360 - itr(k1) - itr(k2), v = r.int(0, 1);
      need(x < 180);
      const [a1, m1] = rn(k1), [a2, m2] = rn(k2);
      return { q: nts(T(`The diagram shows a ${a1} and a ${a2} which share the side $AB$. Find $x$.`, `Rajah menunjukkan ${m1} dan ${m2} yang berkongsi sisi $AB$. Cari $x$.`)), fig: twoFig(k1, k2, 'x'), a: T(`$x = ${D(x)}$`), w: W(T(`The three angles at that point make one full turn.`, `Tiga sudut pada titik itu membentuk satu putaran penuh.`), `$x = 360^\\circ - ${D(itr(k1))} - ${D(itr(k2))} = ${D(x)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), e = ext(k);
      return { q: nts(T(`$ABCD\\ldots$ is a regular polygon with ${k} sides. The sides $AB$ and $DC$ are produced to meet at $P$. Find $\\angle BPC$.`, `$ABCD\\ldots$ ialah poligon sekata dengan ${k} sisi. Sisi $AB$ dan $DC$ dipanjangkan untuk bertemu di $P$. Cari $\\angle BPC$.`)), fig: meetFig(k, 'x'), a: T(`$${D(180 - 2 * e)}$`), w: W(T(`$\\angle PBC = \\angle PCB = ${D(e)}$ (each is an exterior angle of the polygon)`, `$\\angle PBC = \\angle PCB = ${D(e)}$ (setiap satu ialah sudut peluaran poligon)`), `$\\angle BPC = 180^\\circ - 2 \\times ${D(e)} = ${D(180 - 2 * e)}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), v = r.int(0, 1), e = ext(k), I = itr(k);
      const ans = v === 0 ? e / 2 : I - e / 2;
      const fig = polyFig(regPts(k), { names: LET.slice(0, k).split(''), extra: (P) => S.line(P[0][0], P[0][1], P[2][0], P[2][1]) + (v === 0 ? S.arc(P[0], P[1], P[2], 20, 'x', { gap: 13 }) : S.arc(P[2], P[0], P[3], 18, 'x', { gap: 13 })) });
      return { q: T(`$ABCD\\ldots$ is a regular polygon with ${k} sides. Find $\\angle ${v === 0 ? 'BAC' : 'ACD'}$.`, `$ABCD\\ldots$ ialah poligon sekata dengan ${k} sisi. Cari $\\angle ${v === 0 ? 'BAC' : 'ACD'}$.`), fig, a: T(`$${D(ans)}$`), w: v === 0 ? T(`$\\triangle ABC$ is isosceles with $\\angle ABC = ${D(I)}$: $(180^\\circ - ${D(I)}) \\div 2$`, `$\\triangle ABC$ ialah segi tiga sama kaki dengan $\\angle ABC = ${D(I)}$: $(180^\\circ - ${D(I)}) \\div 2$`) : T(`$\\angle BCD = ${D(I)}$ and $\\angle ACB = ${D((180 - I) / 2)}$: $${D(I)} - ${D((180 - I) / 2)}$`, `$\\angle BCD = ${D(I)}$ dan $\\angle ACB = ${D((180 - I) / 2)}$: $${D(I)} - ${D((180 - I) / 2)}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24]), a1 = r.pick([2, 3, 4, 5]), c = r.pick([2, 3, 4, 5, 6]), x = r.int(4, 30), e = ext(k), I = itr(k);
      const b = e - a1 * x, d = I - c * x;
      need(b >= 1 && b <= 30 && Math.abs(d) >= 1 && Math.abs(d) <= 170 && a1 !== c);
      const dd = d > 0 ? `+ ${d}` : `- ${-d}`;
      return { q: T(`In a regular polygon, each exterior angle is $(${a1}x + ${b})^\\circ$ and each interior angle is $(${c}x ${dd})^\\circ$. Find (a) the value of $x$, (b) the number of sides.`, `Dalam sebuah poligon sekata, setiap sudut peluaran ialah $(${a1}x + ${b})^\\circ$ dan setiap sudut pedalaman ialah $(${c}x ${dd})^\\circ$. Cari (a) nilai $x$, (b) bilangan sisi.`), a: T(`(a) $x = ${x}$ (b) ${k}`), w: T(`$(${a1}x + ${b}) + (${c}x ${dd}) = 180$; exterior angle $= ${D(e)}$, $n = 360 \\div ${n(e)}$`, `$(${a1}x + ${b}) + (${c}x ${dd}) = 180$; sudut peluaran $= ${D(e)}$, $n = 360 \\div ${n(e)}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), s = r.pick([2, 3, 4, 5, 6]), v = r.int(0, 2), e = ext(k);
      return { q: [T(`A robot moves ${s} m forward and then turns left through $${D(e)}$. It repeats this until it first returns to its starting point, facing its original direction. How many moves does it make, and how far does it travel?`, `Sebuah robot bergerak ${s} m ke hadapan dan kemudian membelok ke kiri sebanyak $${D(e)}$. Ia mengulangi langkah ini sehingga kembali ke titik permulaan buat kali pertama, menghadap arah asal. Berapakah bilangan pergerakan dan jarak yang dilalui?`), T(`A robot walks round a regular polygon of side ${s} m. It turns left through the same angle at each corner and makes ${k} moves to return to its starting point. Find the angle it turns through at each corner and the total distance it walks.`, `Sebuah robot berjalan mengelilingi poligon sekata bersisi ${s} m. Ia membelok ke kiri dengan sudut yang sama pada setiap bucu dan membuat ${k} pergerakan untuk kembali ke titik permulaan. Cari sudut belokan pada setiap bucu dan jumlah jarak yang dilalui.`), T(`A turtle in a computer program draws a regular polygon by repeating: "forward ${s} cm, turn right $${D(e)}$". Find the number of sides of the polygon, its perimeter and the interior angle at each vertex.`, `Seekor penyu dalam atur cara komputer melukis poligon sekata dengan mengulang: "ke hadapan ${s} cm, belok kanan $${D(e)}$". Cari bilangan sisi poligon, perimeternya dan sudut pedalaman pada setiap bucu.`)][v], a: v === 0 ? T(`${k} moves; ${k * s} m`, `${k} pergerakan; ${k * s} m`) : v === 1 ? T(`$${D(e)}$ ; ${k * s} m`) : T(`${k} sides; ${k * s} cm; $${D(itr(k))}$`, `${k} sisi; ${k * s} cm; $${D(itr(k))}$`), w: T(`$360^\\circ \\div ${n(e)} = ${k}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24, 30, 36]), s = r.pick([4, 5, 6, 8, 10]), I = itr(k);
      return { q: T(`Each interior angle of a regular polygon is $${D(I)}$ and each side is ${s} cm. Find (a) the exterior angle, (b) the number of sides, (c) the sum of all the interior angles, (d) the perimeter.`, `Setiap sudut pedalaman sebuah poligon sekata ialah $${D(I)}$ dan setiap sisinya ${s} cm. Cari (a) sudut peluaran, (b) bilangan sisi, (c) hasil tambah semua sudut pedalaman, (d) perimeter.`), a: T(`(a) $${D(ext(k))}$ (b) ${k} (c) $${D(ssum(k))}$ (d) ${k * s} cm`), w: W(`$180^\\circ - ${D(I)} = ${D(ext(k))}$`, `$n = 360 \\div ${n(ext(k))} = ${k}$`, `$${k} \\times ${s} = ${k * s}$ cm`), sp: 'l' };
    },
    (r) => {
      const X = r.pick([140, 150, 160, 165, 170, 175]), need2 = Math.floor(360 / (180 - X)) + 1, v = r.int(0, 1);
      return { q: v === 0 ? T(`Find the smallest number of sides that a regular polygon can have if each interior angle is greater than $${X}^\\circ$.`, `Cari bilangan sisi terkecil yang boleh dimiliki oleh sebuah poligon sekata jika setiap sudut pedalamannya lebih besar daripada $${X}^\\circ$.`) : T(`Each exterior angle of a regular polygon is less than $${180 - X}^\\circ$. What is the smallest possible number of sides?`, `Setiap sudut peluaran sebuah poligon sekata kurang daripada $${180 - X}^\\circ$. Berapakah bilangan sisi terkecil yang mungkin?`), a: T(`${need2}`), w: T(`Exterior angle $\\lt ${180 - X}^\\circ$, so $n \\gt 360 \\div ${180 - X} = ${n(360 / (180 - X))}$`), sp: 's' };
    },
    (r) => {
      const [p, q2] = r.sample([5, 6, 8, 9, 10, 12, 15, 18, 20, 24], 2);
      const a = Math.min(p, q2), b = Math.max(p, q2), v = r.int(0, 1);
      return { q: v === 0 ? T(`Regular polygon $P$ has an exterior angle of $${D(ext(a))}$ and regular polygon $Q$ has an exterior angle of $${D(ext(b))}$. Which polygon has more sides, and how many more?`, `Poligon sekata $P$ mempunyai sudut peluaran $${D(ext(a))}$ dan poligon sekata $Q$ mempunyai sudut peluaran $${D(ext(b))}$. Poligon yang manakah mempunyai lebih banyak sisi, dan lebih berapa?`) : T(`Two regular polygons have interior angles of $${D(itr(a))}$ and $${D(itr(b))}$. Find the total number of sides of the two polygons.`, `Dua poligon sekata mempunyai sudut pedalaman $${D(itr(a))}$ dan $${D(itr(b))}$. Cari jumlah bilangan sisi kedua-dua poligon.`), a: v === 0 ? T(`$Q$ has ${b - a} more sides (${b} and ${a})`, `$Q$ mempunyai ${b - a} lebih sisi (${b} dan ${a})`) : T(`${a + b}`), w: v === 0 ? W(`$P$: $n = 360^\\circ \\div ${D(ext(a))} = ${a}$`, `$Q$: $n = 360^\\circ \\div ${D(ext(b))} = ${b}$`, `$${b} - ${a} = ${b - a}$`, T(`The smaller exterior angle belongs to the polygon with more sides.`, `Sudut peluaran yang lebih kecil dimiliki oleh poligon yang mempunyai lebih banyak sisi.`)) : W(`$180^\\circ - ${D(itr(a))} = ${D(ext(a))}$, $n = 360^\\circ \\div ${D(ext(a))} = ${a}$`, `$180^\\circ - ${D(itr(b))} = ${D(ext(b))}$, $n = 360^\\circ \\div ${D(ext(b))} = ${b}$`, `$${a} + ${b} = ${a + b}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), v = r.int(0, 1), ang = ext(k);
      const fig = polyFig(regPts(k), { names: LET.slice(0, k).split(''), extra: (P, M, C) => S.line(C[0], C[1], P[0][0], P[0][1]) + S.line(C[0], C[1], P[1][0], P[1][1]) + S.dot(C[0], C[1], 2.5) + S.text(C[0], C[1] - 10, 'O', { i: true }) + (v === 0 ? S.arc(C, P[0], P[1], 18, `${n(ang)}°`, { gap: 15 }) : S.arc(P[0], P[1], C, 20, `${n(itr(k) / 2)}°`, { gap: 15 })) });
      return { q: nts(T(`The diagram shows a regular polygon with centre $O$. ${v === 0 ? `$\\angle AOB = ${D(ang)}$. Find the number of sides.` : `$\\angle OAB = ${D(itr(k) / 2)}$. Find the number of sides.`}`, `Rajah menunjukkan poligon sekata berpusat $O$. ${v === 0 ? `$\\angle AOB = ${D(ang)}$. Cari bilangan sisi.` : `$\\angle OAB = ${D(itr(k) / 2)}$. Cari bilangan sisi.`}`)), fig, a: T(`${k}`), w: v === 0 ? T(`$360 \\div ${n(ang)}$`) : T(`Interior angle $= 2 \\times ${D(itr(k) / 2)} = ${D(itr(k))}$; exterior $= ${D(ang)}$; $n = 360 \\div ${n(ang)}$`, `Sudut pedalaman $= 2 \\times ${D(itr(k) / 2)} = ${D(itr(k))}$; sudut peluaran $= ${D(ang)}$; $n = 360 \\div ${n(ang)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), e = ext(k), v = r.int(0, 1);
      return { q: nts(T(`$ABCD\\ldots$ is a regular polygon. The sides $AB$ and $DC$ are produced to meet at $P$ and $\\angle BPC = ${D(180 - 2 * e)}$. Find ${v === 0 ? 'the number of sides of the polygon' : 'the interior angle of the polygon'}.`, `$ABCD\\ldots$ ialah poligon sekata. Sisi $AB$ dan $DC$ dipanjangkan untuk bertemu di $P$ dan $\\angle BPC = ${D(180 - 2 * e)}$. Cari ${v === 0 ? 'bilangan sisi poligon itu' : 'sudut pedalaman poligon itu'}.`)), fig: meetFig(k, `${n(180 - 2 * e)}°`), a: T(v === 0 ? `${k}` : `$${D(itr(k))}$`), w: T(`$\\angle PBC = (180^\\circ - ${D(180 - 2 * e)}) \\div 2 = ${D(e)}$, the exterior angle; $n = 360 \\div ${n(e)}$`, `$\\angle PBC = (180^\\circ - ${D(180 - 2 * e)}) \\div 2 = ${D(e)}$, sudut peluaran; $n = 360 \\div ${n(e)}$`), sp: 'm' };
    },
    (r) => {
      const m = r.pick([2, 3, 4]), k = r.pick([6, 8, 9, 10, 12, 15, 18, 20, 24, 30]), v = r.int(0, 1);
      const d = 360 / k - 360 / (m * k);
      need(Number.isInteger(d * 100) && d >= 1);
      return { q: v === 0 ? T(`Regular polygon $Q$ has ${m} times as many sides as regular polygon $P$. Their exterior angles differ by $${D(d)}$. Find the number of sides of $P$.`, `Poligon sekata $Q$ mempunyai ${m} kali ganda bilangan sisi poligon sekata $P$. Sudut peluaran kedua-duanya berbeza $${D(d)}$. Cari bilangan sisi $P$.`) : T(`Regular polygon $Q$ has ${m} times as many sides as regular polygon $P$. Their interior angles differ by $${D(d)}$. Find the number of sides of $P$ and of $Q$.`, `Poligon sekata $Q$ mempunyai ${m} kali ganda bilangan sisi poligon sekata $P$. Sudut pedalaman kedua-duanya berbeza $${D(d)}$. Cari bilangan sisi $P$ dan $Q$.`), a: v === 0 ? T(`${k}`) : T(`${k} and ${m * k}`, `${k} dan ${m * k}`), w: T(`Let $P$ have $n$ sides: the difference of the exterior angles is $\\dfrac{360^\\circ}{n} - \\dfrac{360^\\circ}{${m}n}$ (the difference of the interior angles is the same).`, `Katakan $P$ mempunyai $n$ sisi: beza sudut peluaran ialah $\\dfrac{360^\\circ}{n} - \\dfrac{360^\\circ}{${m}n}$ (beza sudut pedalaman adalah sama).`), sp: 'm' };
    },
    (r) => {
      const m = r.pick([2, 3, 4]), nq = r.pick([3, 4, 5, 6, 8, 9, 10]), diff = (m - 1) * nq, v = r.int(0, 1), np = m * nq;
      need(Number.isInteger(360 / np) && Number.isInteger(360 / nq));
      return { q: v === 0 ? T(`The exterior angle of regular polygon $Q$ is ${m} times the exterior angle of regular polygon $P$. $P$ has ${diff} more sides than $Q$. Find the number of sides of each polygon.`, `Sudut peluaran poligon sekata $Q$ ialah ${m} kali sudut peluaran poligon sekata $P$. $P$ mempunyai ${diff} lebih sisi daripada $Q$. Cari bilangan sisi setiap poligon.`) : T(`Regular polygon $P$ has ${diff} more sides than regular polygon $Q$, and the exterior angle of $Q$ is ${m} times that of $P$. Find the exterior angle of each polygon.`, `Poligon sekata $P$ mempunyai ${diff} lebih sisi daripada poligon sekata $Q$, dan sudut peluaran $Q$ ialah ${m} kali sudut peluaran $P$. Cari sudut peluaran setiap poligon.`), a: v === 0 ? T(`$P$: ${np} sides, $Q$: ${nq} sides`, `$P$: ${np} sisi, $Q$: ${nq} sisi`) : T(`$P$: $${D(360 / np)}$, $Q$: $${D(360 / nq)}$`), w: T(`Let $Q$ have $n$ sides, so $P$ has $${m}n$ sides and $n + ${diff} = ${m}n$.`, `Katakan $Q$ mempunyai $n$ sisi, maka $P$ mempunyai $${m}n$ sisi dan $n + ${diff} = ${m}n$.`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), v = r.int(0, 2), I = itr(k);
      return { q: [T(`Squares are drawn outside a regular ${pn(k)[0]} on two neighbouring sides, so that the squares meet at the common vertex. Find the angle between the free sides of the two squares at that vertex.`, `Dua segi empat sama dilukis di luar ${pn(k)[1]} sekata pada dua sisi yang bersebelahan, supaya kedua-dua segi empat sama itu bertemu pada bucu sepunya. Cari sudut antara sisi bebas kedua-dua segi empat sama itu pada bucu tersebut.`), T(`Equilateral triangles are drawn outside a regular ${pn(k)[0]} on two neighbouring sides. Find the angle at the shared vertex between the two triangles (the angle not inside the polygon or a triangle).`, `Dua segi tiga sama sisi dilukis di luar ${pn(k)[1]} sekata pada dua sisi yang bersebelahan. Cari sudut pada bucu sepunya antara kedua-dua segi tiga itu (sudut yang tidak berada dalam poligon atau segi tiga).`), T(`A regular ${pn(k)[0]} and a square share a side. Find the sum of their two interior angles at one end of the shared side, and hence the angle outside both shapes there.`, `${cap(pn(k)[1])} sekata dan sebuah segi empat sama berkongsi satu sisi. Cari hasil tambah kedua-dua sudut pedalaman pada satu hujung sisi sepunya itu, dan seterusnya sudut di luar kedua-dua bentuk di situ.`)][v], a: [T(`$360^\\circ - ${D(I)} - 90^\\circ - 90^\\circ = ${D(180 - I)}$`), T(`$360^\\circ - ${D(I)} - 60^\\circ - 60^\\circ = ${D(240 - I)}$`), T(`$${D(I + 90)}$ ; $${D(270 - I)}$`)][v], w: W(`$180^\\circ - 360^\\circ \\div ${k} = ${D(I)}$`, ...[
        [T(`The angles round that vertex make one full turn.`, `Sudut di sekeliling bucu itu membentuk satu putaran lengkap.`), `$${D(I)} + 90^\\circ + 90^\\circ + x = 360^\\circ$`, `$x = ${D(180 - I)}$`],
        [T(`The angles round that vertex make one full turn.`, `Sudut di sekeliling bucu itu membentuk satu putaran lengkap.`), `$${D(I)} + 60^\\circ + 60^\\circ + x = 360^\\circ$`, `$x = ${D(240 - I)}$`],
        [`$${D(I)} + 90^\\circ = ${D(I + 90)}$`, `$360^\\circ - ${D(I + 90)} = ${D(270 - I)}$`],
      ][v]), sp: 's' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24]), a1 = r.pick([2, 3, 4, 5]), x = r.int(3, 25), e = ext(k), v = r.int(0, 1), b = e - a1 * x;
      need(b >= 1 && b <= 25);
      return { q: v === 0 ? T(`A regular polygon has exterior angle $(${a1}x + ${b})^\\circ$ and ${k} sides. Find $x$ and the interior angle.`, `Sebuah poligon sekata mempunyai sudut peluaran $(${a1}x + ${b})^\\circ$ dan ${k} sisi. Cari $x$ dan sudut pedalaman.`) : T(`The number of sides of a regular polygon is ${k}. Its exterior angle is $(${a1}x + ${b})^\\circ$. Find the value of $x$ and hence its interior angle.`, `Bilangan sisi sebuah poligon sekata ialah ${k}. Sudut peluarannya ialah $(${a1}x + ${b})^\\circ$. Cari nilai $x$ dan seterusnya sudut pedalamannya.`), a: T(`$x = ${x}$ ; $${D(itr(k))}$`), w: W(`$360^\\circ \\div ${k} = ${D(e)}$`, `$${a1}x + ${b} = ${n(e)}$`, `$x = ${x}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), v = r.int(0, 4), e = ext(k), I = itr(k);
      const fm = (x) => `$${D(x)}$`;
      const M = [
        [`Which statement about a regular polygon with ${k} sides is correct?`, `Pernyataan manakah tentang poligon sekata dengan ${k} sisi yang betul?`, [`each exterior angle is ${D(e)}`, `each interior angle is ${D(e)}`, `each exterior angle is ${D(I)}`, `each exterior angle is ${D(180 / k)}`], 0],
        [`A regular polygon has an interior angle that is $${D(I - e)}$ larger than its exterior angle. Which shows the correct number of sides?`, `Sebuah poligon sekata mempunyai sudut pedalaman yang $${D(I - e)}$ lebih besar daripada sudut peluarannya. Yang manakah menunjukkan bilangan sisi yang betul?`, [`${k}`, `${k + 3}`, `${Math.max(3, k - 2)}`, `${2 * k}`], 0],
        [`The exterior angle of a regular polygon is $${D(e)}$. Which of these is the interior angle?`, `Sudut peluaran sebuah poligon sekata ialah $${D(e)}$. Yang manakah sudut pedalamannya?`, [`${D(I)}`, `${D(e)}`, `${D(180 + e)}`, `${D(360 - e)}`], 0],
        [`If each interior angle of a regular polygon is $${D(I)}$, how many degrees do all its exterior angles add up to?`, `Jika setiap sudut pedalaman poligon sekata ialah $${D(I)}$, berapa darjahkah hasil tambah semua sudut peluarannya?`, [`360^\\circ`, `${D(I * k)}`, `180^\\circ`, `${D(I)}`], 0],
        [`The polygon with each exterior angle $${D(e)}$ has the same number of axes of symmetry as which number?`, `Poligon dengan setiap sudut peluaran $${D(e)}$ mempunyai bilangan paksi simetri yang sama dengan nombor yang mana?`, [`${k}`, `${k - 1}`, `${k + 1}`, `${2 * k}`], 0],
      ][v];
      const fo = (o) => (o.includes('\\circ') && !o.includes('$') ? o.replace(/(\d[\d.]*\^\\circ)/g, '$$$1$$') : o);
      const opts = r.shuffle(M[2]);
      need(new Set(opts).size === 4);
      const idx = opts.indexOf(M[2][0]);
      const txt = '<br>' + opts.map((o, i) => `${'ABCD'[i]}. ${fo(o)}`).join('&emsp;');
      const wq = [
        W(`$360^\\circ \\div ${k} = ${D(e)}$`, `$180^\\circ - ${D(e)} = ${D(I)}$`),
        W(T(`Interior $-$ exterior $= (180^\\circ - e) - e = ${D(I - e)}$, so $e = ${D(e)}$.`, `Pedalaman $-$ peluaran $= (180^\\circ - e) - e = ${D(I - e)}$, maka $e = ${D(e)}$.`), `$n = 360^\\circ \\div ${D(e)} = ${k}$`),
        W(`$180^\\circ - ${D(e)} = ${D(I)}$`, T(`The interior and exterior angles at a vertex lie on a straight line.`, `Sudut pedalaman dan sudut peluaran pada satu bucu terletak pada garis lurus.`)),
        W(T(`The exterior angles of any polygon add up to $360^\\circ$, whatever the interior angle is.`, `Sudut peluaran mana-mana poligon berjumlah $360^\\circ$, tidak kira sudut pedalamannya.`)),
        W(`$n = 360^\\circ \\div ${D(e)} = ${k}$`, T(`A regular polygon with $n$ sides has $n$ axes of symmetry.`, `Poligon sekata dengan $n$ sisi mempunyai $n$ paksi simetri.`)),
      ][v];
      return { q: T(M[0] + txt, M[1] + txt), a: T(`${'ABCD'[idx]}. ${fo(M[2][0])}`), w: wq, sp: 's' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24]), v = r.int(0, 2), e = ext(k), I = itr(k), [a, am] = rna(k);
      const WR = [
        [`Kumar finds the number of sides from an interior angle of $${D(I)}$ by calculating $360 \\div ${I} = ${n(round(360 / I, 2))}$. Explain his mistake and find the correct number of sides.`, `Kumar mencari bilangan sisi daripada sudut pedalaman $${D(I)}$ dengan mengira $360 \\div ${I} = ${n(round(360 / I, 2))}$. Terangkan kesilapannya dan cari bilangan sisi yang betul.`, `He used the interior angle instead of the exterior angle. $180^\\circ - ${D(I)} = ${D(e)}$, so $n = 360 \\div ${n(e)} = ${k}$.`, `Dia menggunakan sudut pedalaman, bukan sudut peluaran. $180^\\circ - ${D(I)} = ${D(e)}$, maka $n = 360 \\div ${n(e)} = ${k}$.`],
        [`To find the interior angle of ${a}, Hafiz calculates $180^\\circ - ${k} = ${180 - k}^\\circ$. What did he do wrong? Find the correct interior angle.`, `Untuk mencari sudut pedalaman ${am}, Hafiz mengira $180^\\circ - ${k} = ${180 - k}^\\circ$. Apakah kesilapannya? Cari sudut pedalaman yang betul.`, `He subtracted the number of sides instead of the exterior angle $360^\\circ \\div ${k} = ${D(e)}$. Interior angle $= ${D(I)}$.`, `Dia menolak bilangan sisi, bukan sudut peluaran $360^\\circ \\div ${k} = ${D(e)}$. Sudut pedalaman $= ${D(I)}$.`],
        [`Priya says that a regular polygon with exterior angle $${D(e)}$ has $${D(e)} \\times 360$ sides. Explain the error and find the correct number of sides.`, `Priya berkata poligon sekata dengan sudut peluaran $${D(e)}$ mempunyai $${D(e)} \\times 360$ sisi. Terangkan kesilapan itu dan cari bilangan sisi yang betul.`, `The number of sides is $360^\\circ \\div \\text{exterior angle} = 360 \\div ${n(e)} = ${k}$, not the product.`, `Bilangan sisi ialah $360^\\circ \\div \\text{sudut peluaran} = 360 \\div ${n(e)} = ${k}$, bukan hasil darab.`],
      ][v];
      return { q: T(WR[0], WR[1]), a: T(WR[2], WR[3]), w: [
        W(T(`The formula uses the exterior angle, not the interior angle.`, `Rumus itu menggunakan sudut peluaran, bukan sudut pedalaman.`), `$180^\\circ - ${D(I)} = ${D(e)}$`, `$n = 360 \\div ${n(e)} = ${k}$`),
        W(T(`Subtract the exterior angle from $180^\\circ$, not the number of sides.`, `Tolak sudut peluaran daripada $180^\\circ$, bukan bilangan sisi.`), `$360^\\circ \\div ${k} = ${D(e)}$`, `$180^\\circ - ${D(e)} = ${D(I)}$`),
        W(T(`$360^\\circ$ is shared among the exterior angles, so divide, not multiply.`, `$360^\\circ$ dikongsi oleh sudut peluaran, maka bahagi, bukan darab.`), `$n = 360 \\div ${n(e)} = ${k}$`),
      ][v], sp: 'm' };
    },
    (r) => {
      const [k1, k2] = r.pick([[5, 4], [6, 4], [6, 5], [8, 4], [5, 5], [6, 6], [8, 6], [10, 5], [12, 4], [8, 8], [10, 6], [9, 5]]);
      const x = 360 - itr(k1) - itr(k2), v = r.int(0, 1);
      need(x < 180);
      return { q: nts(v === 0 ? T(`A regular ${pn(k1)[0]} and another regular polygon $Q$ share the side $AB$, as shown. The angle $x$ outside both polygons at $A$ is $${D(x)}$. Find the number of sides of $Q$.`, `${cap(pn(k1)[1])} sekata dan satu lagi poligon sekata $Q$ berkongsi sisi $AB$, seperti dalam rajah. Sudut $x$ di luar kedua-dua poligon pada $A$ ialah $${D(x)}$. Cari bilangan sisi $Q$.`) : T(`Two regular polygons, one with ${k1} sides and one with ${k2} sides, share the side $AB$. Find the angle $x$ outside both polygons at $A$ and the total number of sides of the two polygons.`, `Dua poligon sekata, satu dengan ${k1} sisi dan satu lagi dengan ${k2} sisi, berkongsi sisi $AB$. Cari sudut $x$ di luar kedua-dua poligon pada $A$ dan jumlah bilangan sisi kedua-dua poligon itu.`)), fig: twoFig(k1, k2, 'x'), a: v === 0 ? T(`${k2}`) : T(`$${D(x)}$ ; ${k1 + k2 - 0}`), w: T(`Interior angle of $Q = 360^\\circ - ${D(itr(k1))} - ${D(x)} = ${D(itr(k2))}$`, `Sudut pedalaman $Q = 360^\\circ - ${D(itr(k1))} - ${D(x)} = ${D(itr(k2))}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), v = r.int(0, 2), s = r.int(3, 10), ang = ext(k), I = itr(k);
      const [a, am] = rna(k);
      return { q: [T(`${cap(a)} $ABCD\\ldots$ has centre $O$ and sides of ${s} cm. Triangle $OAB$ is drawn. Find $\\angle AOB$, $\\angle OAB$ and state what type of triangle $OAB$ is.`, `${cap(am)} $ABCD\\ldots$ berpusat $O$ dan bersisi ${s} cm. Segi tiga $OAB$ dilukis. Cari $\\angle AOB$, $\\angle OAB$ dan nyatakan jenis segi tiga $OAB$.`), T(`Explain why $OA = OB$ and hence why $\\angle OAB = \\angle OBA$ in ${a} $ABCD\\ldots$ with centre $O$. Find $\\angle OAB$.`, `Terangkan mengapa $OA = OB$ dan seterusnya mengapa $\\angle OAB = \\angle OBA$ dalam ${am} $ABCD\\ldots$ berpusat $O$. Cari $\\angle OAB$.`), T(`${cap(a)} with centre $O$ is divided into ${k} identical triangles by joining $O$ to each vertex. Find the angles of each triangle.`, `${cap(am)} berpusat $O$ dibahagikan kepada ${k} segi tiga yang serupa dengan menyambung $O$ ke setiap bucu. Cari sudut bagi setiap segi tiga itu.`)][v], a: v === 1 ? T(`$O$ is equidistant from all vertices; $\\angle OAB = ${D(I / 2)}$`, `$O$ sama jarak dari semua bucu; $\\angle OAB = ${D(I / 2)}$`) : T(`$\\angle AOB = ${D(ang)}$, $\\angle OAB = ${D(I / 2)}$; isosceles${k === 6 ? ' (equilateral, since all angles are $60^\\circ$)' : ''}`, `$\\angle AOB = ${D(ang)}$, $\\angle OAB = ${D(I / 2)}$; sama kaki${k === 6 ? ' (sama sisi, kerana semua sudut $60^\\circ$)' : ''}`), w: W(T(`The ${k} triangles at $O$ share the full turn: $\\angle AOB = 360^\\circ \\div ${k} = ${D(ang)}$`, `${k} segi tiga di $O$ berkongsi satu putaran penuh: $\\angle AOB = 360^\\circ \\div ${k} = ${D(ang)}$`), T(`$OA = OB$ because $O$ is the same distance from every vertex, so $\\triangle OAB$ is isosceles.`, `$OA = OB$ kerana $O$ sama jarak dari setiap bucu, maka $\\triangle OAB$ ialah segi tiga sama kaki.`), `$\\angle OAB = (180^\\circ - ${D(ang)}) \\div 2 = ${D(I / 2)}$`), sp: 'm' };
    },
    (r) => {
      const N = r.pick([12, 15, 20, 24, 30]), v = r.int(0, 2);
      const ok = []; for (let q = 3; q <= N; q++) if (360 % q === 0) ok.push(q);
      return { q: [T(`For which regular polygons with at most ${N} sides is the exterior angle a whole number of degrees? List all the values of $n$.`, `Bagi poligon sekata yang manakah dengan paling banyak ${N} sisi, sudut peluarannya ialah bilangan bulat darjah? Senaraikan semua nilai $n$.`), T(`How many regular polygons with $3 \\le n \\le ${N}$ sides have a whole-number interior angle?`, `Berapakah bilangan poligon sekata dengan $3 \\le n \\le ${N}$ sisi yang mempunyai sudut pedalaman berupa bilangan bulat?`), T(`Find the largest number of sides $n \\le ${N}$ of a regular polygon whose exterior angle is a whole number of degrees.`, `Cari bilangan sisi terbesar $n \\le ${N}$ bagi poligon sekata yang sudut peluarannya ialah bilangan bulat darjah.`)][v], a: v === 0 ? T(ok.map((q) => `${q}`).join(', ')) : v === 1 ? T(`${ok.length}`) : T(`${ok[ok.length - 1]}`), w: T(`$n$ must divide $360$.`, `$n$ mesti membahagi $360$.`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24]), s = r.int(4, 12), v = r.int(0, 2), e = ext(k), I = itr(k);
      const [a, am] = rna(k);
      return { q: [T(`${cap(a)} has sides of ${s} cm. A path is walked round the outside; at each corner the walker turns through the exterior angle. Find the total distance and the total angle turned in one lap.`, `${cap(am)} mempunyai sisi ${s} cm. Seseorang berjalan di sekeliling bahagian luarnya; pada setiap penjuru dia membelok melalui sudut peluaran. Cari jumlah jarak dan jumlah sudut belokan dalam satu pusingan.`), T(`A cyclist rides once round a regular track made of ${k} straight sections each ${s * 10} m long. Find the angle he turns at each corner and the total distance ridden.`, `Seorang penunggang basikal menunggang sekali mengelilingi trek sekata yang terdiri daripada ${k} bahagian lurus, setiap satu ${s * 10} m panjang. Cari sudut yang dibelok pada setiap penjuru dan jumlah jarak yang ditunggang.`), T(`A regular ${k}-sided garden has a fence of ${k * s} m altogether. A gate takes up one whole side. Find the length of fencing needed and the angle between two neighbouring fence panels inside the garden.`, `Sebuah taman sekata ${k} sisi dipagar dengan jumlah ${k * s} m. Satu pintu gerbang mengambil satu sisi penuh. Cari panjang pagar yang diperlukan dan sudut antara dua panel pagar yang bersebelahan di dalam taman.`)][v], a: v === 0 ? T(`${k * s} cm ; $360^\\circ$`) : v === 1 ? T(`$${D(e)}$ ; ${k * s * 10} m`) : T(`${(k - 1) * s} m ; $${D(I)}$`), w: [
        W(`$${k} \\times ${s} = ${k * s}$ cm`, T(`One lap is one full turn, and the exterior angles of any polygon add up to $360^\\circ$.`, `Satu pusingan ialah satu putaran penuh, dan sudut peluaran mana-mana poligon berjumlah $360^\\circ$.`)),
        W(`$360^\\circ \\div ${k} = ${D(e)}$`, `$${k} \\times ${s * 10} = ${k * s * 10}$ m`),
        W(T(`One side $= ${k * s} \\div ${k} = ${s}$ m`, `Satu sisi $= ${k * s} \\div ${k} = ${s}$ m`), `$${k * s} - ${s} = ${(k - 1) * s}$ m`, `$180^\\circ - 360^\\circ \\div ${k} = ${D(I)}$`),
      ][v], sp: 'm' };
    },
  ];
  /*A41*/

  SPM.extend('F2-4.1a', { e: g41e, m: g41m, a: g41a });

  /* ======================================================= F2-4.1b Construction of regular polygons */
  const ELEM = [3, 4, 6, 8, 12]; // exact ruler-and-compasses (elementary)
  const PROT = [5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]; // whole-degree centre angles for a protractor
  /** construction figure: circle with n equally spaced points A, B, C…; o.chords 'all' | count, o.lab = label of angle AOB */
  function conFig(k, o) {
    o = o || {};
    const names = LET.slice(0, k).split(''), pts = {};
    names.forEach((c, i) => (pts[c] = 90 + (360 * i) / k));
    const ch = [];
    const nc = o.chords === 'all' ? k : o.chords || 0;
    for (let i = 0; i < nc; i++) ch.push(names[i] + names[(i + 1) % k]);
    const rad2 = (o.radii || []).map((c) => 'O' + c);
    return F.circle({ pts, chords: ch, radii: rad2, r: 76, w: 230, h: 210, extra: (P) => (o.lab ? S.arc(P.O, P.A, P.B, 22, o.lab, { gap: 13 }) : '') + (o.extra ? o.extra(P) : '') });
  }
  const STEP = {
    P: (k) => [
      [`Draw a circle with centre $O$ and mark a point $P_1$ on the circle.`, `Lukis satu bulatan berpusat $O$ dan tanda satu titik $P_1$ pada bulatan.`],
      [`Draw the radius $OP_1$.`, `Lukis jejari $OP_1$.`],
      [`Place the protractor at $O$ and mark the angle $360^\\circ \\div ${k} = ${D(360 / k)}$ from $OP_1$ to get $P_2$ on the circle.`, `Letakkan protraktor di $O$ dan tanda sudut $360^\\circ \\div ${k} = ${D(360 / k)}$ daripada $OP_1$ untuk mendapat $P_2$ pada bulatan.`],
      [`Repeat from each new radius until ${k} points are marked round the circle.`, `Ulang dari setiap jejari baharu sehingga ${k} titik ditanda di sekeliling bulatan.`],
      [`Join the ${k} points in order with a ruler.`, `Sambungkan ${k} titik itu mengikut urutan dengan pembaris.`],
    ],
    H: () => [
      [`Draw a circle with centre $O$ and radius $r$; mark a point $P_1$ on it.`, `Lukis bulatan berpusat $O$ dan berjejari $r$; tanda titik $P_1$ padanya.`],
      [`Keep the compasses set to the radius $r$.`, `Kekalkan jangka lukis pada jejari $r$.`],
      [`With the compass point on $P_1$, draw an arc that cuts the circle at $P_2$.`, `Dengan hujung jangka lukis di $P_1$, lukis satu lengkok yang memotong bulatan di $P_2$.`],
      [`Move the compass point to each new point in turn to mark $P_3, P_4, P_5, P_6$.`, `Alihkan hujung jangka lukis ke setiap titik baharu secara bergilir untuk menanda $P_3, P_4, P_5, P_6$.`],
      [`Join $P_1, P_2, \\ldots, P_6$ in order with a ruler.`, `Sambungkan $P_1, P_2, \\ldots, P_6$ mengikut urutan dengan pembaris.`],
    ],
    S: () => [
      [`Draw a circle with centre $O$ and draw a diameter $P_1P_3$.`, `Lukis bulatan berpusat $O$ dan lukis diameter $P_1P_3$.`],
      [`Construct the perpendicular bisector of $P_1P_3$; it passes through $O$.`, `Bina pembahagi dua sama serenjang $P_1P_3$; ia melalui $O$.`],
      [`Label the points where it meets the circle $P_2$ and $P_4$.`, `Labelkan titik di mana ia bertemu bulatan sebagai $P_2$ dan $P_4$.`],
      [`Join $P_1P_2$, $P_2P_3$, $P_3P_4$ and $P_4P_1$ with a ruler.`, `Sambungkan $P_1P_2$, $P_2P_3$, $P_3P_4$ dan $P_4P_1$ dengan pembaris.`],
    ],
    T: () => [
      [`Draw a circle with centre $O$ and mark $P_1$ on it.`, `Lukis bulatan berpusat $O$ dan tanda $P_1$ padanya.`],
      [`Using the radius of the circle as the compass setting, mark off six points $P_1, \\ldots, P_6$ round the circle.`, `Dengan menggunakan jejari bulatan sebagai tetapan jangka lukis, tanda enam titik $P_1, \\ldots, P_6$ di sekeliling bulatan.`],
      [`Join alternate points $P_1P_3$, $P_3P_5$ and $P_5P_1$ with a ruler.`, `Sambungkan titik berselang-seli $P_1P_3$, $P_3P_5$ dan $P_5P_1$ dengan pembaris.`],
    ],
    O: () => [
      [`Construct a square $P_1P_3P_5P_7$ inside the circle with centre $O$ using perpendicular diameters.`, `Bina segi empat sama $P_1P_3P_5P_7$ di dalam bulatan berpusat $O$ menggunakan diameter yang berserenjang.`],
      [`Bisect each right angle at $O$, e.g. $\\angle P_1OP_3$.`, `Bahagi dua sama setiap sudut tegak di $O$, cth. $\\angle P_1OP_3$.`],
      [`Mark the points $P_2, P_4, P_6, P_8$ where the bisectors meet the circle.`, `Tanda titik $P_2, P_4, P_6, P_8$ di mana pembahagi dua sama bertemu bulatan.`],
      [`Join the eight points in order with a ruler.`, `Sambungkan lapan titik itu mengikut urutan dengan pembaris.`],
    ],
    D: () => [
      [`Construct a regular hexagon $P_1P_3P_5P_7P_9P_{11}$ in the circle with centre $O$ using the radius as the compass setting.`, `Bina heksagon sekata $P_1P_3P_5P_7P_9P_{11}$ dalam bulatan berpusat $O$ dengan menggunakan jejari sebagai tetapan jangka lukis.`],
      [`Bisect each $60^\\circ$ angle at $O$ between neighbouring vertices.`, `Bahagi dua sama setiap sudut $60^\\circ$ di $O$ antara bucu bersebelahan.`],
      [`Mark the six new points where the bisectors meet the circle.`, `Tanda enam titik baharu di mana pembahagi dua sama bertemu bulatan.`],
      [`Join the twelve points in order with a ruler.`, `Sambungkan dua belas titik itu mengikut urutan dengan pembaris.`],
    ],
  };
  const METHOD = { P: 'ruler and protractor', H: 'a hexagon by ruler and compasses', S: 'a square by ruler and compasses', T: 'an equilateral triangle by ruler and compasses', O: 'an octagon by ruler and compasses', D: 'a dodecagon by ruler and compasses' };
  const METHOD_MS = { P: 'pembaris dan protraktor', H: 'heksagon dengan pembaris dan jangka lukis', S: 'segi empat sama dengan pembaris dan jangka lukis', T: 'segi tiga sama sisi dengan pembaris dan jangka lukis', O: 'oktagon dengan pembaris dan jangka lukis', D: 'dodekagon dengan pembaris dan jangka lukis' };
  const BAD = [
    [`Set the compasses to a different radius for each arc.`, `Tetapkan jangka lukis pada jejari yang berbeza bagi setiap lengkok.`, 'the arcs would not all be the same distance from the centre'],
    [`Measure the angles from the previous chord instead of from the centre $O$.`, `Ukur sudut daripada perentas sebelumnya, bukan daripada pusat $O$.`, 'the angles must be at the centre $O$'],
    [`Draw the polygon first, then draw a circle round it.`, `Lukis poligon dahulu, kemudian lukis bulatan mengelilinginya.`, 'the circle must be drawn first so that the vertices lie on it'],
    [`Use a compass setting equal to the diameter instead of the radius.`, `Gunakan tetapan jangka lukis sama dengan diameter, bukan jejari.`, 'the setting must equal the radius'],
  ];
  const stepsOf = (m, k) => STEP[m](k);
  /** shuffled numbered steps -> {text en/ms, order} */
  function shuffledSteps(r, st) {
    const idx = perm(r, st.length);
    const li = (i) => `${'ABCDE'[i]}. `;
    return { en: '<br>' + idx.map((j, i) => li(i) + st[j][0]).join('<br>'), ms: '<br>' + idx.map((j, i) => li(i) + st[j][1]).join('<br>'), order: st.map((_, j) => 'ABCDE'[idx.indexOf(j)]).join(', ') };
  }
  const MM = ['P', 'H', 'S', 'T', 'O', 'D'];
  const mk = (m, r) => { const k = m === 'P' ? r.pick(PROT) : { H: 6, S: 4, T: 3, O: 8, D: 12 }[m]; return k; };
  const nOf = { H: 6, S: 4, T: 3, O: 8, D: 12 };
  const g41be = [
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20]), v = r.int(0, 4), [a, am] = rna(k);
      return { q: [T(`To construct ${a} inside a circle, what should the angle at the centre be between two neighbouring vertices?`, `Untuk membina ${am} di dalam sebuah bulatan, berapakah sudut di pusat antara dua bucu yang bersebelahan?`), T(`A student marks ${k} equally spaced points on a circle with centre $O$. What is the size of $\\angle P_1OP_2$ for two neighbouring points?`, `Seorang murid menanda ${k} titik yang sama jarak pada bulatan berpusat $O$. Berapakah saiz $\\angle P_1OP_2$ bagi dua titik yang bersebelahan?`), T(`Complete: the angle at the centre for a regular polygon with $n$ sides is $\\underline{\\qquad} \\div n$. Use it for $n = ${k}$.`, `Lengkapkan: sudut di pusat bagi poligon sekata dengan $n$ sisi ialah $\\underline{\\qquad} \\div n$. Gunakannya untuk $n = ${k}$.`), T(`Divide the full turn at the centre into ${k} equal angles. Find the size of each angle.`, `Bahagikan satu putaran penuh di pusat kepada ${k} sudut yang sama. Cari saiz setiap sudut.`), T(`You want a regular ${k}-gon with all vertices on one circle. Through what angle must you turn about $O$ from one vertex to the next?`, `Anda mahu poligon sekata ${k} sisi dengan semua bucu pada satu bulatan. Melalui sudut berapakah anda mesti berpusing pada $O$ dari satu bucu ke bucu seterusnya?`)][v], a: T(v === 2 ? `$360^\\circ$ ; $${D(360 / k)}$` : `$${D(360 / k)}$`), w: T(`$360^\\circ \\div ${k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8, 9, 10, 12]), v = r.int(0, 3), [a, am] = rna(k);
      const fig = conFig(k, { chords: 'all', lab: 'x' });
      return { q: nts(T(`The diagram shows ${a} $ABC\\ldots$ constructed inside a circle with centre $O$. Find the angle $x$ at the centre.`, `Rajah menunjukkan ${am} $ABC\\ldots$ yang dibina di dalam bulatan berpusat $O$. Cari sudut $x$ di pusat.`)), fig, a: T(`$x = ${D(360 / k)}$`), w: T(`$360^\\circ \\div ${k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick(ELEM), [a, am] = rna(k);
      const m = k === 6 ? 'H' : k === 4 ? 'S' : k === 3 ? 'T' : k === 8 ? 'O' : 'D';
      return { q: T(`Which tools are needed to construct ${a} by the method of ${METHOD[m]}? Choose from: ruler, pair of compasses, protractor.`, `Alat apakah yang diperlukan untuk membina ${am} dengan kaedah ${METHOD_MS[m]}? Pilih daripada: pembaris, jangka lukis, protraktor.`), a: T(`Ruler and a pair of compasses (no protractor needed).`, `Pembaris dan jangka lukis (protraktor tidak diperlukan).`), w: W(T(`The method only steps equal arcs round the circle or bisects angles — both are compass work.`, `Kaedah ini hanya menanda lengkok sama di sekeliling bulatan atau membahagi dua sama sudut — kedua-duanya kerja jangka lukis.`), T(`The ruler joins the marked points, and no angle has to be measured, so no protractor is needed.`, `Pembaris menyambung titik yang ditanda, dan tiada sudut perlu diukur, maka protraktor tidak diperlukan.`)), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), v = r.int(0, 2), [a, am] = rna(k);
      return { q: [T(`How many points must be marked on the circle to construct ${a}? How many chords are then drawn?`, `Berapakah bilangan titik yang perlu ditanda pada bulatan untuk membina ${am}? Berapakah bilangan perentas yang kemudian dilukis?`), T(`A regular polygon is constructed by joining ${k} equally spaced points on a circle. How many sides and how many vertices does it have?`, `Sebuah poligon sekata dibina dengan menyambung ${k} titik yang sama jarak pada bulatan. Berapakah bilangan sisi dan bucunya?`), T(`In constructing ${a} on a circle, how many equal angles does the protractor mark around the centre?`, `Semasa membina ${am} pada satu bulatan, berapakah bilangan sudut sama yang ditanda protraktor di sekeliling pusat?`)][v], a: v === 0 ? T(`${k} points, ${k} chords`, `${k} titik, ${k} perentas`) : v === 1 ? T(`${k} sides, ${k} vertices`, `${k} sisi, ${k} bucu`) : T(`${k}`), w: [
        W(T(`One point for each vertex: ${k}.`, `Satu titik bagi setiap bucu: ${k}.`), T(`Joining neighbouring points gives one chord per side: ${k} chords.`, `Menyambung titik bersebelahan memberi satu perentas bagi setiap sisi: ${k} perentas.`)),
        W(T(`A polygon has as many vertices as sides, so ${k} sides and ${k} vertices.`, `Poligon mempunyai bilangan bucu yang sama dengan bilangan sisi, maka ${k} sisi dan ${k} bucu.`)),
        W(T(`One central angle for each side.`, `Satu sudut pusat bagi setiap sisi.`), `$360^\\circ \\div ${k} = ${D(360 / k)}$`, T(`marked ${k} times.`, `ditanda ${k} kali.`)),
      ][v], sp: 's' };
    },
    (r) => {
      const [se, sm, tv, re, rm2, we, wm] = r.pick([
        ['In the construction of a regular polygon in a circle, all vertices lie on the circle.', 'Dalam pembinaan poligon sekata dalam sebuah bulatan, semua bucu terletak pada bulatan itu.', true, 'That is why they are all the same distance from the centre.', 'Itulah sebabnya semua bucu sama jarak dari pusat.', 'Every vertex is marked on the circle, so all of them are one radius from $O$.', 'Setiap bucu ditanda pada bulatan, maka semuanya berjarak satu jejari dari $O$.'],
        ['A compass setting equal to the radius of a circle marks off a chord equal to the radius.', 'Tetapan jangka lukis yang sama dengan jejari bulatan menanda perentas yang sama dengan jejari.', true, 'This gives a $60^\\circ$ angle at the centre, so six such chords fit round the circle.', 'Ini memberi sudut $60^\\circ$ di pusat, maka enam perentas sebegini muat mengelilingi bulatan.', 'The chord and the two radii form an equilateral triangle, so the angle at $O$ is $60^\\circ$ and six chords fit.', 'Perentas dan dua jejari membentuk segi tiga sama sisi, maka sudut di $O$ ialah $60^\\circ$ dan enam perentas muat.'],
        ['The centre angle for a regular octagon is $60^\\circ$.', 'Sudut pusat bagi oktagon sekata ialah $60^\\circ$.', false, '$360^\\circ \\div 8 = 45^\\circ$.', '$360^\\circ \\div 8 = 45^\\circ$.', 'Central angle $= 360^\\circ \\div n$, so $360^\\circ \\div 8 = 45^\\circ$.', 'Sudut pusat $= 360^\\circ \\div n$, maka $360^\\circ \\div 8 = 45^\\circ$.'],
        ['To construct a regular hexagon in a circle you must use a protractor.', 'Untuk membina heksagon sekata dalam bulatan anda mesti menggunakan protraktor.', false, 'A ruler and compasses set to the radius are enough.', 'Pembaris dan jangka lukis yang ditetapkan pada jejari sudah memadai.', 'Stepping the radius round the circle six times already marks the six vertices, so no angle has to be measured.', 'Menanda jejari mengelilingi bulatan enam kali sudah menanda enam bucu, maka tiada sudut perlu diukur.'],
        ['A regular polygon can be drawn by rotating one vertex about the centre through equal angles.', 'Poligon sekata boleh dilukis dengan memutarkan satu bucu pada pusat melalui sudut yang sama.', true, 'A rotation about $O$ keeps the distance from $O$ the same, so every image lies on the circle.', 'Putaran pada $O$ mengekalkan jarak dari $O$, maka setiap imej terletak pada bulatan.', 'A rotation about $O$ keeps the distance from $O$, so every image is on the same circle.', 'Putaran pada $O$ mengekalkan jarak dari $O$, maka setiap imej berada pada bulatan yang sama.'],
        ['The centre angle of a regular polygon is the same as its interior angle.', 'Sudut pusat poligon sekata sama dengan sudut pedalamannya.', false, 'The centre angle is $360^\\circ \\div n$, which equals the exterior angle, not the interior angle.', 'Sudut pusat ialah $360^\\circ \\div n$, sama dengan sudut peluaran, bukan sudut pedalaman.', 'Central angle $= 360^\\circ \\div n$ (the exterior angle); the interior angle is $180^\\circ - 360^\\circ \\div n$.', 'Sudut pusat $= 360^\\circ \\div n$ (sudut peluaran); sudut pedalaman ialah $180^\\circ - 360^\\circ \\div n$.'],
        ['Paper folding a round piece of paper in half three times gives eight equal sectors.', 'Melipat kertas bulat separuh sebanyak tiga kali menghasilkan lapan sektor yang sama.', true, '$2 \\times 2 \\times 2 = 8$ sectors of $45^\\circ$ each, which give the vertices of a regular octagon.', '$2 \\times 2 \\times 2 = 8$ sektor, masing-masing $45^\\circ$, yang memberi bucu oktagon sekata.', 'Each fold doubles the number of parts: $2 \\to 4 \\to 8$.', 'Setiap lipatan menggandakan bilangan bahagian: $2 \\to 4 \\to 8$.'],
      ]);
      return { q: T(`True or false? "${se}" Give a reason.`, `Betul atau salah? "${sm}" Berikan satu sebab.`), a: T(`${tv ? 'True' : 'False'}. ${re}`, `${tv ? 'Betul' : 'Salah'}. ${rm2}`), w: W(T(we, wm), T(`So the statement is ${tv ? 'true' : 'false'}.`, `Maka pernyataan itu ${tv ? 'betul' : 'salah'}.`)), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), c = ext(k), v = r.int(0, 2);
      return { q: [T(`Mei Ling constructs a regular polygon by marking an angle of $${D(c)}$ at the centre of a circle each time. Find the number of sides of the polygon.`, `Mei Ling membina poligon sekata dengan menanda sudut $${D(c)}$ di pusat bulatan setiap kali. Cari bilangan sisi poligon itu.`), T(`The angle marked at the centre is $${D(c)}$. How many equal angles fit round the point $O$, and what is the name of the polygon?`, `Sudut yang ditanda di pusat ialah $${D(c)}$. Berapakah bilangan sudut sama yang muat di sekeliling titik $O$, dan apakah nama poligon itu?`), T(`A regular polygon is constructed inside a circle using central angles of $${D(c)}$. Find the number of vertices.`, `Sebuah poligon sekata dibina di dalam bulatan menggunakan sudut pusat $${D(c)}$. Cari bilangan bucu.`)][v], a: v === 1 && NM[k] ? T(`${k}; ${NM[k][0]}`, `${k}; ${NM[k][1]}`) : T(`${k}`), w: T(`$360 \\div ${n(c)} = ${k}$`), sp: 's' };
    },
    (r) => {
      const ks = r.sample(PROT, 4).sort((a, b) => a - b);
      const rows = ks.map((k) => [`${k}`, '?']);
      return { q: T(`Complete the table of central angles used to construct regular polygons in a circle.<br>${SPM.table(rows, { head: ['Number of sides', 'Angle at the centre'] })}`, `Lengkapkan jadual sudut pusat yang digunakan untuk membina poligon sekata dalam bulatan.<br>${SPM.table(rows, { head: ['Bilangan sisi', 'Sudut di pusat'] })}`), a: T(ks.map((k) => `${k}: $${D(360 / k)}$`).join(' ; ')), w: W(T(`Angle at the centre $= \\dfrac{360^\\circ}{n}$`, `Sudut di pusat $= \\dfrac{360^\\circ}{n}$`), ...ks.map((k) => `$360^\\circ \\div ${k} = ${D(360 / k)}$`)), sp: 'm' };
    },
    (r) => {
      const v = r.int(0, 5);
      const Q = [
        ['Which instrument is used to draw a circle?', 'Alat manakah yang digunakan untuk melukis bulatan?', 'A pair of compasses.', 'Jangka lukis.'],
        ['Which instrument is used to measure the angle at the centre?', 'Alat manakah yang digunakan untuk mengukur sudut di pusat?', 'A protractor.', 'Protraktor.'],
        ['Which instrument is used to join the marked points with straight lines?', 'Alat manakah yang digunakan untuk menyambung titik yang ditanda dengan garis lurus?', 'A ruler.', 'Pembaris.'],
        ['What is the name of the fixed point at the middle of the circle from which all vertices are the same distance?', 'Apakah nama titik tetap di tengah bulatan yang menjadi jarak yang sama bagi semua bucu?', 'The centre, $O$.', 'Pusat, $O$.'],
        ['What do we call the distance from the centre of the circle to a vertex of the polygon on it?', 'Apakah nama jarak dari pusat bulatan ke satu bucu poligon padanya?', 'The radius.', 'Jejari.'],
        ['What do we call a line segment joining two points on a circle, such as a side of the polygon?', 'Apakah nama tembereng garis yang menyambung dua titik pada bulatan, seperti sisi poligon itu?', 'A chord.', 'Perentas.'],
      ][v];
      const ex = [
        T(`The compasses hold one fixed radius while the pencil turns round the centre.`, `Jangka lukis mengekalkan satu jejari tetap sambil pensel berputar mengelilingi pusat.`),
        T(`Angles in degrees are measured with a protractor.`, `Sudut dalam darjah diukur dengan protraktor.`),
        T(`The straight chords that become the sides are drawn with a ruler.`, `Perentas lurus yang menjadi sisi dilukis dengan pembaris.`),
        T(`Every vertex is the same distance — one radius — from it.`, `Setiap bucu berada pada jarak yang sama — satu jejari — daripadanya.`),
        T(`It is the distance from the centre to any point on the circle.`, `Ia ialah jarak dari pusat ke mana-mana titik pada bulatan.`),
        T(`A chord joins two points on the circle; each side of the polygon is a chord.`, `Perentas menyambung dua titik pada bulatan; setiap sisi poligon ialah perentas.`),
      ][v];
      return { q: T(Q[0], Q[1]), a: T(Q[2], Q[3]), w: W(ex, T(Q[2], Q[3])), sp: 'xs' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8, 9, 10, 12]), v = r.int(0, 2);
      const fig = conFig(k, { chords: 'all' });
      return { q: nts([T(`The diagram shows a regular polygon constructed on a circle. How many sides does it have, and what is its name?`, `Rajah menunjukkan poligon sekata yang dibina pada sebuah bulatan. Berapakah bilangan sisinya, dan apakah namanya?`), T(`Count the points marked on the circle in the diagram. How many sides has the polygon and what is the angle at the centre for each side?`, `Kira titik yang ditanda pada bulatan dalam rajah. Berapakah bilangan sisi poligon itu dan berapakah sudut di pusat bagi setiap sisi?`), T(`In the diagram the points are equally spaced round the circle. Find the number of vertices and hence the angle at the centre between neighbouring vertices.`, `Dalam rajah, titik-titik itu sama jarak di sekeliling bulatan. Cari bilangan bucu dan seterusnya sudut di pusat antara bucu yang bersebelahan.`)][v]), fig, a: v === 0 ? T(`${k} sides; ${rn(k)[0]}`, `${k} sisi; ${rn(k)[1]}`) : T(`${k} sides; $${D(360 / k)}$`, `${k} sisi; $${D(360 / k)}$`), w: W(T(`Count the points (or the chords) in the diagram: ${k}.`, `Bilang titik (atau perentas) dalam rajah: ${k}.`), v === 0 ? T(`${k} equal sides: ${rn(k)[0]}.`, `${k} sisi sama: ${rn(k)[1]}.`) : `$360^\\circ \\div ${k} = ${D(360 / k)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), v = r.int(0, 2);
      const fig = conFig(k, { radii: ['A', 'B', 'C'], chords: 0 });
      return { q: nts([T(`In the diagram, $O$ is the centre of the circle and $A$, $B$, $C$ are points on it. Compare $OA$, $OB$ and $OC$ and give a reason.`, `Dalam rajah, $O$ ialah pusat bulatan dan $A$, $B$, $C$ ialah titik pada bulatan. Bandingkan $OA$, $OB$ dan $OC$ dan berikan sebab.`), T(`Points $A$, $B$ and $C$ lie on a circle with centre $O$. Are $OA$, $OB$, $OC$ equal? Why does this matter for constructing a regular polygon?`, `Titik $A$, $B$ dan $C$ terletak pada bulatan berpusat $O$. Adakah $OA$, $OB$, $OC$ sama? Mengapa ini penting untuk membina poligon sekata?`), T(`In the diagram $OA = 5$ cm. Write down $OB$ and $OC$ and say why.`, `Dalam rajah, $OA = 5$ cm. Tuliskan $OB$ dan $OC$ dan nyatakan sebabnya.`)][v]), fig, a: v === 2 ? T(`$OB = OC = 5$ cm; they are radii of the same circle.`, `$OB = OC = 5$ cm; kesemuanya jejari bulatan yang sama.`) : T(`They are equal because they are all radii of the same circle; so all vertices are the same distance from $O$.`, `Ia sama kerana semuanya jejari bulatan yang sama; maka semua bucu sama jarak dari $O$.`), w: W(T(`$A$, $B$ and $C$ are on the circle, so $OA$, $OB$ and $OC$ are radii of that circle.`, `$A$, $B$ dan $C$ berada pada bulatan, maka $OA$, $OB$ dan $OC$ ialah jejari bulatan itu.`), v === 2 ? `$OB = OC = OA = 5$ cm` : T(`All radii of one circle are equal, which is what keeps every vertex the same distance from $O$.`, `Semua jejari satu bulatan adalah sama, dan inilah yang mengekalkan setiap bucu pada jarak yang sama dari $O$.`)), sp: 's' };
    },
    (r) => {
      const k = r.pick(ELEM), v = r.int(0, 2), [a, am] = rna(k);
      const bad = r.sample([7, 9, 11, 13, 14], 3);
      const o = r.shuffle([k].concat(bad)), idx = o.indexOf(k);
      const txt = '<br>' + o.map((x, i) => `${'ABCD'[i]}. ${x} ${x === 1 ? '' : ''}sides`).join('&emsp;');
      const txtm = '<br>' + o.map((x, i) => `${'ABCD'[i]}. ${x} sisi`).join('&emsp;');
      return { q: [T(`Which regular polygon can be constructed exactly using only a ruler and a pair of compasses with the equal-arc or bisecting methods?${txt}`, `Poligon sekata yang manakah boleh dibina dengan tepat menggunakan pembaris dan jangka lukis sahaja dengan kaedah lengkok sama atau membahagi dua sama?${txtm}`), T(`A student says she can construct a regular polygon using only compasses and a ruler. Which number of sides is possible with the elementary methods (arcs of the radius, perpendicular diameters, bisecting angles)?${txt}`, `Seorang murid berkata dia boleh membina poligon sekata dengan jangka lukis dan pembaris sahaja. Bilangan sisi yang manakah mungkin dengan kaedah asas (lengkok berjejari, diameter berserenjang, membahagi dua sama sudut)?${txtm}`), T(`Choose the polygon that can be constructed with ruler and compasses only.${txt}`, `Pilih poligon yang boleh dibina dengan pembaris dan jangka lukis sahaja.${txtm}`)][v], a: T(`${'ABCD'[idx]}. ${k} sides`, `${'ABCD'[idx]}. ${k} sisi`), w: W(T(`The elementary ruler-and-compasses methods give $3$, $4$, $6$, $8$ and $12$ sides (equal arcs of the radius, perpendicular diameters, then repeated bisecting).`, `Kaedah asas pembaris dan jangka lukis memberi $3$, $4$, $6$, $8$ dan $12$ sisi (lengkok berjejari sama, diameter berserenjang, kemudian membahagi dua sama berulang).`), T(`Only ${k} is in that list, so it is the answer.`, `Hanya ${k} ada dalam senarai itu, maka itulah jawapannya.`)), sp: 's' };
    },
    (r) => {
      const t = r.int(1, 4), v = r.int(0, 1), parts = 2 ** t;
      return { q: v === 0 ? T(`A circular piece of paper is folded in half ${t} time${t > 1 ? 's' : ''} and unfolded. How many equal sectors are formed, and what is the angle of each at the centre?`, `Sekeping kertas bulat dilipat separuh sebanyak ${t} kali dan dibuka semula. Berapakah bilangan sektor yang sama terbentuk, dan berapakah sudut setiap satu di pusat?`) : T(`A round paper is folded exactly in half ${t} time${t > 1 ? 's' : ''}, with the centre always on the fold. The fold lines are drawn as radii. Find the central angle between neighbouring fold lines.`, `Kertas bulat dilipat tepat separuh sebanyak ${t} kali, dengan pusat sentiasa pada lipatan. Garis lipatan dilukis sebagai jejari. Cari sudut pusat antara garis lipatan yang bersebelahan.`), a: v === 0 ? T(`${parts} sectors; $${D(360 / parts)}$`, `${parts} sektor; $${D(360 / parts)}$`) : T(`$${D(360 / parts)}$`), w: W(T(`Each fold doubles the number of equal parts, starting from $1$.`, `Setiap lipatan menggandakan bilangan bahagian sama, bermula daripada $1$.`), `$2^{${t}} = ${parts}$`, `$360^\\circ \\div ${parts} = ${D(360 / parts)}$`), sp: 's' };
    },
    (r) => {
      const [m, k] = [r.pick(['H', 'S', 'T']), 0], st = stepsOf(m, 6), sh = shuffledSteps(r, st);
      const nm = { H: ['regular hexagon', 'heksagon sekata'], S: ['square', 'segi empat sama'], T: ['equilateral triangle', 'segi tiga sama sisi'] }[m];
      return { q: T(`The steps to construct a ${nm[0]} in a circle are given in jumbled order. Write the correct order.${sh.en}`, `Langkah untuk membina ${nm[1]} dalam bulatan diberi dalam susunan bercelaru. Tulis susunan yang betul.${sh.ms}`), a: T(sh.order), w: W(T(`Work in the order of the construction: draw the circle and the first point, mark the other points round the circle, then join them.`, `Ikut urutan pembinaan: lukis bulatan dan titik pertama, tanda titik lain di sekeliling bulatan, kemudian sambungkannya.`), T(`Correct order: ${sh.order}`, `Susunan yang betul: ${sh.order}`)), sp: 's' };
    },
    (r) => {
      const R = r.int(3, 12), v = r.int(0, 2);
      return { q: [T(`A regular hexagon is constructed inside a circle of radius ${R} cm. What is the length of each side?`, `Sebuah heksagon sekata dibina di dalam bulatan berjejari ${R} cm. Berapakah panjang setiap sisi?`), T(`To construct a regular hexagon with ruler and compasses, the compass is set to the radius of the circle. If the radius is ${R} cm, what should the compass setting be?`, `Untuk membina heksagon sekata dengan pembaris dan jangka lukis, jangka lukis ditetapkan pada jejari bulatan. Jika jejari ialah ${R} cm, berapakah tetapan jangka lukis?`), T(`The compass setting used to construct a regular hexagon in a circle is ${R} cm. What is the diameter of the circle?`, `Tetapan jangka lukis yang digunakan untuk membina heksagon sekata dalam bulatan ialah ${R} cm. Berapakah diameter bulatan itu?`)][v], a: T(v === 2 ? `${2 * R} cm` : `${R} cm`), w: W(T(`In a regular hexagon the six triangles at the centre are equilateral, so each side equals the radius.`, `Dalam heksagon sekata, enam segi tiga di pusat ialah segi tiga sama sisi, maka setiap sisi sama dengan jejari.`), v === 2 ? T(`Diameter $= 2 \\times ${R} = ${2 * R}$ cm`, `Diameter $= 2 \\times ${R} = ${2 * R}$ cm`) : T(`So the answer is $${R}$ cm.`, `Maka jawapannya ialah $${R}$ cm.`)), sp: 'xs' };
    },
    (r) => {
      const k = r.pick([3, 4, 6, 8, 12]), v = r.int(0, 2), [a, am] = rna(k);
      const blank = [
        [`To construct ${a} with ruler and compasses, the angle at the centre must be ________ degrees.`, `Untuk membina ${am} dengan pembaris dan jangka lukis, sudut di pusat mestilah ________ darjah.`, `${360 / k}`],
        [`The ${k} vertices of ${a} in a circle are marked ________ degrees apart.`, `${k} bucu ${am} dalam bulatan ditanda berjarak ________ darjah.`, `${360 / k}`],
        [`${cap(a)} in a circle has ${k} equal chords, and its centre angle is $360^\\circ \\div$ ________.`, `${cap(am)} dalam bulatan mempunyai ${k} perentas sama, dan sudut pusatnya ialah $360^\\circ \\div$ ________.`, `${k}`],
      ][v];
      return { q: T(`Fill in the blank: ${blank[0]}`, `Isi tempat kosong: ${blank[1]}`), a: T(blank[2]), w: v === 2 ? W(T(`There is one equal chord for each side, so $n = ${k}$.`, `Terdapat satu perentas sama bagi setiap sisi, maka $n = ${k}$.`)) : W(T(`The full turn at the centre is shared equally by the ${k} vertices.`, `Satu putaran penuh di pusat dikongsi sama rata oleh ${k} bucu.`), `$360 \\div ${k} = ${360 / k}$`), sp: 'xs' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), v = r.int(0, 3), c = ext(k);
      const q = [
        [`A regular polygon is drawn by joining points on a circle that are $${D(c)}$ apart at the centre. What is its name?`, `Sebuah poligon sekata dilukis dengan menyambung titik pada bulatan yang berjarak $${D(c)}$ di pusat. Apakah namanya?`, cap(rn(k)[0]), cap(rn(k)[1])],
        [`The central angle of a regular polygon is $${D(c)}$. How many equal chords (sides) are drawn?`, `Sudut pusat sebuah poligon sekata ialah $${D(c)}$. Berapakah bilangan perentas (sisi) yang sama dilukis?`, `${k}`, `${k}`],
        [`Which regular polygon has a central angle of $${D(c)}$? Give the number of vertices.`, `Poligon sekata yang manakah mempunyai sudut pusat $${D(c)}$? Berikan bilangan bucu.`, `${cap(rn(k)[0])}; ${k} vertices`, `${cap(rn(k)[1])}; ${k} bucu`],
        [`Points are marked round a circle at $${D(c)}$ intervals. How many points are marked before the first one is reached again?`, `Titik ditanda di sekeliling bulatan pada sela $${D(c)}$. Berapakah bilangan titik yang ditanda sebelum titik pertama dicapai semula?`, `${k}`, `${k}`],
      ][v];
      return { q: T(q[0], q[1]), a: T(q[2], q[3]), w: T(`$360 \\div ${n(c)} = ${k}$`), sp: 's' };
    },
    (r) => {
      const [ce, cm, k] = r.pick([['A logo is designed as a regular hexagon inside a circle.', 'Sebuah logo direka sebagai heksagon sekata di dalam bulatan.', 6], ['A stage is built in the shape of a regular octagon inscribed in a circle.', 'Sebuah pentas dibina berbentuk oktagon sekata terterap dalam bulatan.', 8], ['A clock face has 12 marks equally spaced round a circle and they are joined to make a regular polygon.', 'Muka jam mempunyai 12 tanda yang sama jarak di sekeliling bulatan dan ditanda untuk membentuk poligon sekata.', 12], ['A garden bed is designed as an equilateral triangle inside a circular pond.', 'Sebuah batas taman direka sebagai segi tiga sama sisi di dalam kolam bulat.', 3], ['A square patio is drawn with its corners on a circle.', 'Sebuah anjung segi empat sama dilukis dengan sudutnya pada satu bulatan.', 4], ['A regular decagon is drawn on a circular table cloth for a pattern.', 'Dekagon sekata dilukis pada alas meja bulat untuk sesuatu corak.', 10], ['A nine-pointed decoration is drawn by marking 9 equally spaced points on a circle.', 'Hiasan sembilan titik dilukis dengan menanda 9 titik sama jarak pada bulatan.', 9], ['A pentagon-shaped flower bed has its 5 vertices on a circular path.', 'Batas bunga berbentuk pentagon mempunyai 5 bucu pada laluan bulat.', 5]]);
      return { q: T(`${ce} Find the angle at the centre of the circle between two neighbouring vertices.`, `${cm} Cari sudut di pusat bulatan antara dua bucu yang bersebelahan.`), a: T(`$${D(360 / k)}$`), w: T(`$360^\\circ \\div ${k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick(ELEM), v = r.int(0, 3), c = ext(k);
      const o = r.shuffle([c, itr(k), 360 / (k + 2), 2 * c]), idx = o.indexOf(c);
      need(new Set(o).size === 4);
      const txt = '<br>' + o.map((x, i) => `${'ABCD'[i]}. $${D(x)}$`).join('&emsp;');
      const [a, am] = rna(k);
      return { q: [T(`What is the angle at the centre when constructing ${a} in a circle?${txt}`, `Berapakah sudut di pusat apabila membina ${am} dalam sebuah bulatan?${txt}`), T(`Select the angle between neighbouring radii to a vertex of ${a} in a circle.${txt}`, `Pilih sudut antara jejari bersebelahan ke bucu bagi ${am} dalam bulatan.${txt}`), T(`Which of the following is the central angle of ${a}?${txt}`, `Yang manakah sudut pusat bagi ${am}?${txt}`), T(`For a circle construction of ${a}, each chord subtends which angle at the centre?${txt}`, `Bagi pembinaan ${am} dalam bulatan, setiap perentas mencangkum sudut yang mana di pusat?${txt}`)][v], a: T(`${'ABCD'[idx]}. $${D(c)}$`), w: W(T(`The angle at the centre is the full turn shared by the ${k} vertices.`, `Sudut di pusat ialah satu putaran penuh yang dikongsi oleh ${k} bucu.`), `$360^\\circ \\div ${k} = ${D(c)}$`, T(`The interior angle $${D(itr(k))}$ is the usual wrong choice.`, `Sudut pedalaman $${D(itr(k))}$ ialah pilihan salah yang biasa.`)), sp: 's' };
    },
    (r) => {
      const v = r.int(0, 3);
      const Q = [
        ['In constructing a regular hexagon with compasses set to the radius, how many arcs are drawn to mark the points $P_2, \\ldots, P_6$ after $P_1$?', 'Dalam pembinaan heksagon sekata dengan jangka lukis ditetapkan pada jejari, berapakah bilangan lengkok yang dilukis untuk menanda titik $P_2, \\ldots, P_6$ selepas $P_1$?', '5'],
        ['How many points, including the starting point $P_1$, are marked round the circle when constructing a regular hexagon with compasses?', 'Berapakah bilangan titik, termasuk titik permulaan $P_1$, yang ditanda di sekeliling bulatan semasa membina heksagon sekata dengan jangka lukis?', '6'],
        ['How many chords does a ruler draw to complete a regular hexagon once the six points are marked?', 'Berapakah bilangan perentas yang dilukis dengan pembaris untuk melengkapkan heksagon sekata selepas enam titik ditanda?', '6'],
        ['How many chords are drawn to complete an equilateral triangle from six marked points by joining alternate points?', 'Berapakah bilangan perentas yang dilukis untuk melengkapkan segi tiga sama sisi daripada enam titik yang ditanda dengan menyambung titik berselang-seli?', '3'],
      ][v];
      const ex = [
        T(`$P_1$ is already marked, so only the other five points need an arc: $6 - 1 = 5$.`, `$P_1$ sudah ditanda, maka hanya lima titik lain memerlukan lengkok: $6 - 1 = 5$.`),
        T(`A hexagon has $6$ vertices, so $6$ points are marked.`, `Heksagon mempunyai $6$ bucu, maka $6$ titik ditanda.`),
        T(`One chord for each side: a hexagon has $6$ sides.`, `Satu perentas bagi setiap sisi: heksagon mempunyai $6$ sisi.`),
        T(`Joining alternate points of six gives $6 \\div 2 = 3$ chords.`, `Menyambung titik berselang-seli daripada enam memberi $6 \\div 2 = 3$ perentas.`),
      ][v];
      return { q: T(Q[0], Q[1]), a: T(Q[2]), w: W(ex, T(`Answer: ${Q[2]}`, `Jawapan: ${Q[2]}`)), sp: 'xs' };
    },
  ];
  const meth = (r) => { const m = r.pick(MM); return [m, m === 'P' ? r.pick(PROT) : nOf[m]]; };
  const mDesc = (m, k) => (m === 'P' ? [`a regular ${pn(k)[0]} using a ruler and a protractor`, `${pn(k)[1]} sekata dengan menggunakan pembaris dan protraktor`] : [`a ${METHOD[m]}`.replace('a a ', 'a ').replace('a an ', 'an '), METHOD_MS[m]]);
  const g41bm = [
    (r) => {
      const [m, k] = meth(r), st = stepsOf(m, k), sh = shuffledSteps(r, st), v = r.int(0, 2), d = mDesc(m, k);
      return { q: [T(`The steps for constructing ${d[0]} are listed in the wrong order. Write the letters in the correct order.${sh.en}`, `Langkah untuk membina ${d[1]} disenaraikan dalam susunan yang salah. Tulis huruf mengikut susunan yang betul.${sh.ms}`), T(`Arrange these construction steps (${d[0]}) into the correct sequence.${sh.en}`, `Susun langkah pembinaan ini (${d[1]}) mengikut urutan yang betul.${sh.ms}`), T(`A student wrote the following steps for ${d[0]} on separate cards. In which order should the cards be used?${sh.en}`, `Seorang murid menulis langkah berikut untuk ${d[1]} pada kad yang berasingan. Mengikut urutan apakah kad itu patut digunakan?${sh.ms}`)][v], a: T(sh.order), w: W(T(`Follow the construction in order: draw the circle and the first point, mark the remaining points round the circle, then join them with a ruler.`, `Ikut urutan pembinaan: lukis bulatan dan titik pertama, tanda titik yang selebihnya di sekeliling bulatan, kemudian sambungkannya dengan pembaris.`), T(`Correct order: ${sh.order}`, `Susunan yang betul: ${sh.order}`)), sp: 's' };
    },
    (r) => {
      const [m, k] = meth(r), st = stepsOf(m, k).slice(), b = r.pick(BAD), pos = r.int(1, st.length - 2), d = mDesc(m, k);
      const orig = st[pos];
      st[pos] = [b[0], b[1]];
      const li = st.map((x, i) => [`${i + 1}. ${x[0]}`, `${i + 1}. ${x[1]}`]);
      return { q: T(`A student lists the steps to construct ${d[0]}. One step is wrong. Identify the wrong step, say why it is wrong and rewrite it correctly.<br>${li.map((x) => x[0]).join('<br>')}`, `Seorang murid menyenaraikan langkah untuk membina ${d[1]}. Satu langkah adalah salah. Kenal pasti langkah yang salah, nyatakan mengapa ia salah dan tulis semula dengan betul.<br>${li.map((x) => x[1]).join('<br>')}`), a: T(`Step ${pos + 1}: ${b[2]}. Correct step: ${orig[0]}`, `Langkah ${pos + 1}: ${{ 'the arcs would not all be the same distance from the centre': 'lengkok tidak semuanya sama jarak dari pusat', 'the angles must be at the centre $O$': 'sudut mesti berada di pusat $O$', 'the circle must be drawn first so that the vertices lie on it': 'bulatan mesti dilukis dahulu supaya bucu terletak padanya', 'the setting must equal the radius': 'tetapan mesti sama dengan jejari' }[b[2]]}. Langkah betul: ${orig[1]}`), w: W(T(`Check each step against the method: the circle is drawn first, the compass setting stays at the radius, and every angle is measured at the centre $O$.`, `Semak setiap langkah dengan kaedahnya: bulatan dilukis dahulu, tetapan jangka lukis kekal pada jejari, dan setiap sudut diukur di pusat $O$.`), T(`Step ${pos + 1} breaks this rule, so replace it with: ${orig[0]}`, `Langkah ${pos + 1} melanggar peraturan ini, maka gantikannya dengan: ${orig[1]}`)), sp: 'm' };
    },
    (r) => {
      const [m, k] = meth(r), st = stepsOf(m, k), pos = r.int(1, st.length - 2), d = mDesc(m, k);
      const li = st.map((x, i) => (i === pos ? ['_____________', '_____________'] : x)).map((x, i) => [`${i + 1}. ${x[0]}`, `${i + 1}. ${x[1]}`]);
      return { q: T(`Complete the missing step ${pos + 1} in the construction of ${d[0]}.<br>${li.map((x) => x[0]).join('<br>')}`, `Lengkapkan langkah ${pos + 1} yang tertinggal dalam pembinaan ${d[1]}.<br>${li.map((x) => x[1]).join('<br>')}`), a: T(st[pos][0], st[pos][1]), w: W(T(`Read the steps before and after the gap: step ${pos} is done and step ${pos + 2} needs its result.`, `Baca langkah sebelum dan selepas ruang kosong: langkah ${pos} telah dibuat dan langkah ${pos + 2} memerlukan hasilnya.`), T(`Missing step: ${st[pos][0]}`, `Langkah yang tertinggal: ${st[pos][1]}`)), sp: 'm' };
    },
    (r) => {
      const R = r.int(3, 9), v = r.int(0, 3), s = r.int(3, 8);
      const fig = conFig(6, { chords: 'all', radii: ['A', 'B'], extra: () => '' });
      return { q: ([
        T(`A regular hexagon $ABCDEF$ is constructed in a circle of radius ${R} cm by marking off the radius six times round the circle. Find the perimeter of the hexagon.`, `Heksagon sekata $ABCDEF$ dibina dalam bulatan berjejari ${R} cm dengan menanda jejari itu sebanyak enam kali mengelilingi bulatan. Cari perimeter heksagon itu.`),
        T(`The perimeter of a regular hexagon constructed in a circle is ${6 * R} cm. What compass setting (radius of the circle) was used?`, `Perimeter sebuah heksagon sekata yang dibina dalam bulatan ialah ${6 * R} cm. Apakah tetapan jangka lukis (jejari bulatan) yang digunakan?`),
        T(`A regular hexagon with sides ${s} cm is to be constructed with ruler and compasses. Find the radius of the circle to draw and the diameter.`, `Sebuah heksagon sekata bersisi ${s} cm hendak dibina dengan pembaris dan jangka lukis. Cari jejari bulatan yang perlu dilukis dan diameternya.`),
        T(`In the diagram, $ABCDEF$ is a regular hexagon in a circle with centre $O$ and $OA = ${R}$ cm. Find $AB$ and explain why triangle $OAB$ is equilateral.`, `Dalam rajah, $ABCDEF$ ialah heksagon sekata dalam bulatan berpusat $O$ dan $OA = ${R}$ cm. Cari $AB$ dan terangkan mengapa segi tiga $OAB$ sama sisi.`),
      ][v]), fig: v === 3 ? fig : undefined, a: [T(`${6 * R} cm`), T(`${R} cm`), T(`radius ${s} cm; diameter ${2 * s} cm`, `jejari ${s} cm; diameter ${2 * s} cm`), T(`$AB = ${R}$ cm. $OA = OB$ (radii) and $\\angle AOB = 360^\\circ \\div 6 = 60^\\circ$, so the other two angles are $(180^\\circ - 60^\\circ) \\div 2 = 60^\\circ$.`, `$AB = ${R}$ cm. $OA = OB$ (jejari) dan $\\angle AOB = 360^\\circ \\div 6 = 60^\\circ$, maka dua sudut lain ialah $(180^\\circ - 60^\\circ) \\div 2 = 60^\\circ$.`)][v], w: W(T(`In a regular hexagon each side equals the radius of the circle.`, `Dalam heksagon sekata, setiap sisi sama dengan jejari bulatan.`), ...[
        [`$6 \\times ${R} = ${6 * R}$ cm`],
        [`$${6 * R} \\div 6 = ${R}$ cm`],
        [T(`Radius $= ${s}$ cm`, `Jejari $= ${s}$ cm`), T(`Diameter $= 2 \\times ${s} = ${2 * s}$ cm`, `Diameter $= 2 \\times ${s} = ${2 * s}$ cm`)],
        [`$AB = OA = ${R}$ cm`, `$\\angle AOB = 360^\\circ \\div 6 = 60^\\circ$`, `$\\angle OAB = \\angle OBA = (180^\\circ - 60^\\circ) \\div 2 = 60^\\circ$`],
      ][v]), sp: v === 3 ? 'm' : 's' };
    },
    (r) => {
      const k = r.pick([7, 11, 13, 14, 17, 19]), c = round(360 / k, 2), rd = Math.round(360 / k), gap = 360 - k * rd, v = r.int(0, 2);
      need(gap !== 0);
      return { q: [T(`A student wants to construct a regular ${k}-sided polygon with a protractor that reads to the nearest degree. Find $360^\\circ \\div ${k}$ (2 decimal places) and the angle he will actually mark.`, `Seorang murid mahu membina poligon sekata ${k} sisi dengan protraktor yang membaca kepada darjah terdekat. Cari $360^\\circ \\div ${k}$ (2 tempat perpuluhan) dan sudut yang sebenarnya akan ditandanya.`), T(`For a regular ${k}-gon the angle at the centre is not a whole number of degrees. If it is rounded to the nearest degree, what is the angle marked, and what is the total of all ${k} marked angles?`, `Bagi poligon sekata ${k} sisi, sudut di pusat bukan bilangan bulat darjah. Jika dibundarkan kepada darjah terdekat, apakah sudut yang ditanda dan berapakah jumlah kesemua ${k} sudut yang ditanda?`), T(`Hafiz marks ${k} angles of $${rd}^\\circ$ round the centre of a circle to construct a regular polygon. By how many degrees does the last side fail to close the polygon?`, `Hafiz menanda ${k} sudut $${rd}^\\circ$ di sekeliling pusat bulatan untuk membina poligon sekata. Berapa darjahkah sisi terakhir tidak menutup poligon?`)][v], a: v === 0 ? T(`$${c}^\\circ$ ; $${rd}^\\circ$`) : v === 1 ? T(`$${rd}^\\circ$ ; $${k * rd}^\\circ$ (not $360^\\circ$)`, `$${rd}^\\circ$ ; $${k * rd}^\\circ$ (bukan $360^\\circ$)`) : T(`$${Math.abs(gap)}^\\circ$`), w: W(`$360 \\div ${k} = ${c}$`, T(`To the nearest degree the protractor can only mark $${rd}^\\circ$.`, `Kepada darjah terdekat, protraktor hanya boleh menanda $${rd}^\\circ$.`), `$${k} \\times ${rd} = ${k * rd}$`, `$360 - ${k * rd} = ${gap}$`, T(`So the ${k} marked angles miss a full turn by $${Math.abs(gap)}^\\circ$ and the polygon does not close exactly.`, `Maka ${k} sudut yang ditanda tersasar daripada satu putaran penuh sebanyak $${Math.abs(gap)}^\\circ$ dan poligon tidak tertutup dengan tepat.`)), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), ang = ext(k), v = r.int(0, 3);
      const rot = [
        [`In dynamic geometry software, a point $P_1$ is rotated about $O$ through $${D(ang)}$ again and again, and consecutive images are joined. What polygon is formed, and how many rotations are needed to return to $P_1$?`, `Dalam perisian geometri dinamik, satu titik $P_1$ diputarkan pada $O$ sebanyak $${D(ang)}$ berulang kali, dan imej berturutan disambungkan. Poligon apakah yang terbentuk, dan berapakah bilangan putaran yang diperlukan untuk kembali ke $P_1$?`, `${rn(k)[0]}; ${k} rotations`, `${rn(k)[1]}; ${k} putaran`],
        [`To build a regular ${pn(k)[0]} in dynamic geometry software, by what angle should the centre $O$ rotate the vertex $P_1$ each time?`, `Untuk membina ${pn(k)[1]} sekata dalam perisian geometri dinamik, melalui sudut berapakah pusat $O$ perlu memutarkan bucu $P_1$ setiap kali?`, `${D(ang)}`, `${D(ang)}`],
        [`A vertex is rotated ${k - 1} times about $O$ through $${D(ang)}$ each time, giving images $P_2, \\ldots, P_{${k}}$. What is the total angle turned from $P_1$ to $P_{${k}}$ and how far short of a full turn is it?`, `Satu bucu diputarkan ${k - 1} kali pada $O$ sebanyak $${D(ang)}$ setiap kali, menghasilkan imej $P_2, \\ldots, P_{${k}}$. Berapakah jumlah sudut yang diputar dari $P_1$ ke $P_{${k}}$ dan kurang berapa daripada satu putaran penuh?`, `${D(ang * (k - 1))}; ${D(ang)}`, `${D(ang * (k - 1))}; ${D(ang)}`],
        [`After rotating $P_1$ about $O$ through $${D(ang)}$ the image is $P_2$. Explain why $OP_2 = OP_1$ and hence why $P_1P_2$ equals every other side.`, `Selepas memutarkan $P_1$ pada $O$ sebanyak $${D(ang)}$, imej ialah $P_2$. Terangkan mengapa $OP_2 = OP_1$ dan seterusnya mengapa $P_1P_2$ sama dengan setiap sisi yang lain.`, `A rotation keeps the distance from $O$, so all points lie on one circle. Each pair of neighbouring points has the same angle $${D(ang)}$ at $O$ and the same distances, so the chords (sides) are equal.`, `Putaran mengekalkan jarak dari $O$, maka semua titik terletak pada satu bulatan. Setiap pasangan titik bersebelahan mempunyai sudut $${D(ang)}$ yang sama di $O$ dan jarak yang sama, maka perentas (sisi) adalah sama.`],
      ][v];
      const ex = [
        W(`$360^\\circ \\div ${D(ang)} = ${k}$`, T(`So ${k} rotations return to $P_1$ and the ${k} images are the vertices of ${art(rn(k)[0])}.`, `Maka ${k} putaran kembali ke $P_1$ dan ${k} imej itu ialah bucu ${rn(k)[1]}.`)),
        W(T(`One vertex must move to the next, so the rotation angle is the central angle.`, `Satu bucu mesti bergerak ke bucu seterusnya, maka sudut putaran ialah sudut pusat.`), `$360^\\circ \\div ${k} = ${D(ang)}$`),
        W(`$${k - 1} \\times ${D(ang)} = ${D(ang * (k - 1))}$`, `$360^\\circ - ${D(ang * (k - 1))} = ${D(ang)}$`),
        W(T(`A rotation about $O$ does not change the distance from $O$, so $OP_2 = OP_1$.`, `Putaran pada $O$ tidak mengubah jarak dari $O$, maka $OP_2 = OP_1$.`), T(`Every pair of neighbouring points has the same two radii and the same angle $${D(ang)}$ at $O$, so all the chords are equal.`, `Setiap pasangan titik bersebelahan mempunyai dua jejari yang sama dan sudut $${D(ang)}$ yang sama di $O$, maka semua perentas adalah sama.`)),
      ][v];
      return { q: T(rot[0], rot[1]), a: T(rot[2], rot[3]), w: ex, sp: v === 3 ? 'm' : 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12]), m2 = r.int(2, k - 2), ang = ext(k);
      const fig = conFig(k, { chords: m2, lab: 'x' });
      return { q: nts(T(`The diagram shows the first ${m2} sides of a regular polygon being constructed inside a circle, centre $O$. Find $x$ and the number of further sides that still need to be drawn to complete the polygon.`, `Rajah menunjukkan ${m2} sisi pertama sebuah poligon sekata yang sedang dibina di dalam bulatan berpusat $O$. Cari $x$ dan bilangan sisi lagi yang masih perlu dilukis untuk melengkapkan poligon itu.`)), fig, a: T(`$x = ${D(ang)}$ ... `.replace(' ... ', '') + `; ${k - m2} sides`, `$x = ${D(ang)}$; ${k - m2} sisi`), w: T(`There are ${k} equally spaced points, so $x = 360^\\circ \\div ${k}$.`, `Terdapat ${k} titik yang sama jarak, maka $x = 360^\\circ \\div ${k}$.`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), v = r.int(0, 3), ang = ext(k);
      const opts = [ang, itr(k), 180 / k, 360 / (k + 1)];
      need(new Set(opts).size === 4);
      const o = r.shuffle(opts), idx = o.indexOf(ang);
      const txt = '<br>' + o.map((x, i) => `${'ABCD'[i]}. $${D(x)}$`).join('&emsp;');
      const [a, am] = rna(k);
      return { q: [T(`Which angle should be marked at the centre to construct ${a} by the circle-and-protractor method?${txt}`, `Sudut yang manakah patut ditanda di pusat untuk membina ${am} dengan kaedah bulatan dan protraktor?${txt}`), T(`Ali uses a circle and a protractor. Which angle at $O$ gives vertices of ${a}?${txt}`, `Ali menggunakan bulatan dan protraktor. Sudut manakah pada $O$ yang memberi bucu bagi ${am}?${txt}`), T(`Choose the correct central angle for a ${k}-sided regular polygon inscribed in a circle.${txt}`, `Pilih sudut pusat yang betul bagi poligon sekata ${k} sisi yang terterap dalam bulatan.${txt}`), T(`Aina needs equal chords round a circle to make ${k} equal sides. Which central angle must each chord subtend?${txt}`, `Aina memerlukan perentas yang sama di sekeliling bulatan untuk membuat ${k} sisi yang sama. Berapakah sudut pusat yang mesti dicangkum oleh setiap perentas?${txt}`)][v], a: T(`${'ABCD'[idx]}. $${D(ang)}$`), w: T(`$360^\\circ \\div ${k}$; the other values are the interior angle and wrong divisions.`, `$360^\\circ \\div ${k}$; nilai lain ialah sudut pedalaman dan pembahagian yang salah.`), sp: 's' };
    },
    (r) => {
      const v = r.int(0, 3);
      const Q = [
        [`Explain why the six points marked round a circle with the compasses set to the radius give a regular hexagon.`, `Terangkan mengapa enam titik yang ditanda di sekeliling bulatan dengan jangka lukis ditetapkan pada jejari memberi heksagon sekata.`, `Each arc has length equal to the radius, so triangle $OP_1P_2$ has three equal sides and $\\angle P_1OP_2 = 60^\\circ$. Six angles of $60^\\circ$ make $360^\\circ$, so the chords are equal and the polygon closes.`, `Setiap lengkok mempunyai panjang sama dengan jejari, maka segi tiga $OP_1P_2$ mempunyai tiga sisi yang sama dan $\\angle P_1OP_2 = 60^\\circ$. Enam sudut $60^\\circ$ berjumlah $360^\\circ$, maka perentas adalah sama dan poligon tertutup.`],
        [`Explain why the four points where two perpendicular diameters meet the circle form the vertices of a square.`, `Terangkan mengapa empat titik di mana dua diameter berserenjang bertemu bulatan membentuk bucu sebuah segi empat sama.`, `The four angles at $O$ are each $90^\\circ$, so the four chords are equal (equal central angles) and the polygon has four equal sides; its angles are also equal by symmetry.`, `Empat sudut di $O$ masing-masing $90^\\circ$, maka empat perentas adalah sama (sudut pusat sama) dan poligon mempunyai empat sisi sama; sudutnya juga sama melalui simetri.`],
        [`Why must all the vertices of a regular polygon constructed by the circle method lie on the circle?`, `Mengapa semua bucu poligon sekata yang dibina dengan kaedah bulatan mesti terletak pada bulatan?`, `Each vertex is marked on the circumference, so it is a radius away from $O$; hence all vertices are the same distance from the centre.`, `Setiap bucu ditanda pada lilitan, maka ia berjarak satu jejari dari $O$; oleh itu semua bucu sama jarak dari pusat.`],
        [`Why are the sides of a polygon equal when the angles between neighbouring radii are all equal?`, `Mengapa sisi sebuah poligon adalah sama apabila sudut antara jejari bersebelahan semuanya sama?`, `The triangles formed by two radii and a side are identical (two equal radii with the same included angle), so the third sides are equal.`, `Segi tiga yang dibentuk oleh dua jejari dan satu sisi adalah serupa (dua jejari sama dengan sudut kandung yang sama), maka sisi ketiga adalah sama.`],
      ][v];
      const ex = [
        W(`$OP_1 = OP_2 = P_1P_2 = r$`, `$\\angle P_1OP_2 = 60^\\circ$`, `$6 \\times 60^\\circ = 360^\\circ$`),
        W(`$360^\\circ \\div 4 = 90^\\circ$`, T(`Equal central angles with equal radii give four equal chords.`, `Sudut pusat yang sama dengan jejari yang sama memberi empat perentas yang sama.`)),
        W(T(`Every point of the circle is one radius from $O$.`, `Setiap titik pada bulatan berjarak satu jejari dari $O$.`), T(`Marking the vertices on the circle therefore makes them all the same distance from the centre.`, `Menanda bucu pada bulatan menjadikan semuanya sama jarak dari pusat.`)),
        W(T(`Each side and the two radii to its ends form a triangle with two equal radii and the same angle between them.`, `Setiap sisi dan dua jejari ke hujungnya membentuk segi tiga dengan dua jejari sama dan sudut yang sama di antaranya.`), T(`Congruent triangles have equal third sides, so the sides of the polygon are equal.`, `Segi tiga kongruen mempunyai sisi ketiga yang sama, maka sisi poligon adalah sama.`)),
      ][v];
      return { q: T(Q[0], Q[1]), a: T(Q[2], Q[3]), w: ex, sp: 'm' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24, 30]), x = r.int(2, 12), a1 = r.pick([2, 3, 4, 5]), c = ext(k), b = c - a1 * x;
      need(b >= 1 && b <= 40);
      return { q: T(`The angle marked at the centre when constructing a regular polygon is $(${a1}x + ${b})^\\circ$, and the polygon has ${k} sides. Find $x$.`, `Sudut yang ditanda di pusat semasa membina poligon sekata ialah $(${a1}x + ${b})^\\circ$, dan poligon itu mempunyai ${k} sisi. Cari $x$.`), a: T(`$x = ${x}$`), w: T(`$${a1}x + ${b} = ${n(c)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), v = r.int(0, 3), c = ext(k);
      const seq = [
        [`Draw a circle with centre $O$ and mark $A$ on it.`, `Lukis bulatan berpusat $O$ dan tanda $A$ padanya.`],
        [`Rotate $A$ about $O$ through $${D(c)}$ to get $B$.`, `Putarkan $A$ pada $O$ sebanyak $${D(c)}$ untuk mendapat $B$.`],
        [`Continue rotating each new point through $${D(c)}$ until ${k} points are marked.`, `Teruskan memutarkan setiap titik baharu sebanyak $${D(c)}$ sehingga ${k} titik ditanda.`],
        [`Join consecutive points with line segments.`, `Sambungkan titik berturutan dengan tembereng garis.`],
      ];
      const sh = shuffledSteps(r, seq);
      return { q: [T(`These are the operations in a dynamic geometry construction of a regular polygon. Put them in the correct order.${sh.en}`, `Berikut ialah operasi dalam pembinaan poligon sekata menggunakan geometri dinamik. Susunkannya mengikut urutan yang betul.${sh.ms}`), T(`Write the letters in the order in which the operations must be carried out to construct a regular ${k}-sided polygon with software.${sh.en}`, `Tulis huruf mengikut urutan operasi yang mesti dilakukan untuk membina poligon sekata ${k} sisi menggunakan perisian.${sh.ms}`), T(`In geometry software, Aina builds a regular polygon by rotation. Arrange her steps.${sh.en}`, `Dalam perisian geometri, Aina membina poligon sekata dengan putaran. Susun langkah-langkahnya.${sh.ms}`), T(`Arrange the software steps for making a polygon with central angle $${D(c)}$.${sh.en}`, `Susun langkah perisian untuk membuat poligon dengan sudut pusat $${D(c)}$.${sh.ms}`)][v], a: T(sh.order), w: W(T(`Draw the circle and the first point, rotate it repeatedly through $${D(c)}$ until ${k} points exist, then join them.`, `Lukis bulatan dan titik pertama, putarkannya berulang kali sebanyak $${D(c)}$ sehingga ${k} titik wujud, kemudian sambungkannya.`), T(`Correct order: ${sh.order}`, `Susunan yang betul: ${sh.order}`)), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24]), c = ext(k), v = r.int(0, 2), t = r.int(2, 4);
      const rot = [
        [`In dynamic geometry software, $A$ is rotated about $O$ through $${D(c)}$ to get $B$, and $B$ is rotated through $${D(c)}$ to get $C$. Find $\\angle AOC$.`, `Dalam perisian geometri dinamik, $A$ diputarkan pada $O$ sebanyak $${D(c)}$ untuk mendapat $B$, dan $B$ diputarkan sebanyak $${D(c)}$ untuk mendapat $C$. Cari $\\angle AOC$.`, `$${D(2 * c)}$`],
        [`The points $P_1, P_2, \\ldots$ are obtained by rotating about $O$ through $${D(c)}$ each time. Find the angle $\\angle P_1OP_${t + 1}$ after ${t} rotations.`.replace(`P_${t + 1}$`, `P_{${t + 1}}$`), `Titik $P_1, P_2, \\ldots$ diperoleh dengan memutar pada $O$ sebanyak $${D(c)}$ setiap kali. Cari sudut $\\angle P_1OP_{${t + 1}}$ selepas ${t} putaran.`, `$${D(t * c)}$`],
        [`A vertex is rotated about the centre of a circle through $${D(c)}$ each time. After how many rotations does it first return to its original position?`, `Satu bucu diputarkan pada pusat bulatan sebanyak $${D(c)}$ setiap kali. Selepas berapa putarankah ia kembali ke kedudukan asal buat kali pertama?`, `${k}`],
      ][v];
      need(t * c < 360 || v !== 1);
      const ex = [W(`$\\angle AOC = 2 \\times ${D(c)} = ${D(2 * c)}$`), W(`$${t} \\times ${D(c)} = ${D(t * c)}$`), W(T(`The point returns when the angles turned make one full turn.`, `Titik itu kembali apabila sudut yang diputar membentuk satu putaran penuh.`), `$360^\\circ \\div ${D(c)} = ${k}$`)][v];
      return { q: T(rot[0], rot[1]), a: T(rot[2]), w: ex, sp: 's' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8, 9, 10, 12]), v = r.int(0, 2), [a, am] = rna(k);
      return { q: [T(`A regular polygon with ${k} vertices is constructed inside a circle with centre $O$. How many axes of symmetry does it have, and do they all pass through $O$?`, `Poligon sekata dengan ${k} bucu dibina di dalam bulatan berpusat $O$. Berapakah bilangan paksi simetri yang dimilikinya, dan adakah semuanya melalui $O$?`), T(`Explain why the centre $O$ of the circle lies on every axis of symmetry of ${a} drawn inside it.`, `Terangkan mengapa pusat $O$ bulatan terletak pada setiap paksi simetri bagi ${am} yang dilukis di dalamnya.`), T(`How many lines of symmetry does the completed construction of ${a} have?`, `Berapakah bilangan garis simetri yang dimiliki oleh pembinaan ${am} yang telah siap?`)][v], a: v === 1 ? T(`Each axis is a diameter of the circle (or passes through equal vertices), and all diameters pass through $O$.`, `Setiap paksi ialah diameter bulatan (atau melalui bucu yang sama), dan semua diameter melalui $O$.`) : v === 0 ? T(`${k} axes; yes, all pass through $O$.`, `${k} paksi; ya, semuanya melalui $O$.`) : T(`${k}`), w: W(T(`A regular polygon with $n$ sides has $n$ axes of symmetry, so here there are ${k}.`, `Poligon sekata dengan $n$ sisi mempunyai $n$ paksi simetri, maka di sini terdapat ${k}.`), T(`Each axis is a line of the circle's symmetry as well, so it is a diameter and passes through $O$.`, `Setiap paksi juga merupakan garis simetri bulatan itu, maka ia ialah diameter dan melalui $O$.`)), sp: 's' };
    },
    (r) => {
      const ks = r.sample(PROT, 3).sort((a, b) => a - b);
      const rows = ks.map((k) => [`${k}`, '?', '?']);
      return { q: T(`Complete the table for constructing regular polygons in a circle with a protractor.<br>${SPM.table(rows, { head: ['Number of sides', 'Angle at the centre', 'Number of chords'] })}`, `Lengkapkan jadual pembinaan poligon sekata dalam bulatan dengan protraktor.<br>${SPM.table(rows, { head: ['Bilangan sisi', 'Sudut di pusat', 'Bilangan perentas'] })}`), a: T(ks.map((k) => `${k}: $${D(360 / k)}$, ${k}`).join(' ; ')), w: W(T(`Angle at the centre $= \\dfrac{360^\\circ}{n}$, and one chord is drawn for each side.`, `Sudut di pusat $= \\dfrac{360^\\circ}{n}$, dan satu perentas dilukis bagi setiap sisi.`), ...ks.map((k) => `$360^\\circ \\div ${k} = ${D(360 / k)}$; ${k}`)), sp: 'm' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24]), c = ext(k), s = r.int(2, 6), v = r.int(0, 1);
      return { q: v === 0 ? T(`Farid draws the first ${s} radii of a regular ${k}-sided polygon starting at $OP_1$, each $${D(c)}$ apart. What is the angle between the first radius $OP_1$ and the last one drawn?`, `Farid melukis ${s} jejari pertama poligon sekata ${k} sisi bermula dari $OP_1$, masing-masing berjarak $${D(c)}$. Berapakah sudut antara jejari pertama $OP_1$ dan jejari terakhir yang dilukis?`) : T(`A student draws ${s} chords of a regular ${k}-sided polygon in order. Through what total angle at $O$ have the chords passed, and how many more chords are needed?`, `Seorang murid melukis ${s} perentas poligon sekata ${k} sisi mengikut urutan. Melalui jumlah sudut berapakah di $O$ perentas itu telah melepasi, dan berapakah bilangan perentas lagi yang diperlukan?`), a: v === 0 ? T(`$${D((s - 1) * c)}$`) : T(`$${D(s * c)}$ ; ${k - s} more`, `$${D(s * c)}$ ; ${k - s} lagi`), w: v === 0 ? W(T(`${s} radii leave ${s - 1} gaps of $${D(c)}$ between the first and the last.`, `${s} jejari meninggalkan ${s - 1} selang $${D(c)}$ antara yang pertama dan yang terakhir.`), `$${s - 1} \\times ${D(c)} = ${D((s - 1) * c)}$`) : W(T(`Each chord subtends $${D(c)}$ at $O$.`, `Setiap perentas mencangkum $${D(c)}$ di $O$.`), `$${s} \\times ${D(c)} = ${D(s * c)}$`, `$${k} - ${s} = ${k - s}$`), sp: 's' };
    },
  ];
  const g41ba = [
    (r) => {
      const ang = r.pick([25, 35, 50, 70, 80, 100, 110, 130, 140, 150]), v = r.int(0, 2), f = Math.floor(360 / ang), gap = 360 - f * ang;
      need(360 % ang !== 0);
      const near = [[45, 8], [60, 6], [72, 5], [90, 4], [120, 3], [40, 9], [36, 10], [30, 12]].filter((x) => Math.abs(x[0] - ang) <= 20).map((x) => x[0]);
      return { q: [T(`Aina tries to draw a regular polygon by marking points on a circle at every $${ang}^\\circ$ round the centre. Explain why the polygon cannot close properly, and state how many full angles fit and the angle left over.`, `Aina cuba melukis poligon sekata dengan menanda titik pada bulatan pada setiap $${ang}^\\circ$ di sekeliling pusat. Terangkan mengapa poligon itu tidak dapat tertutup dengan betul, dan nyatakan berapa sudut penuh yang muat dan sudut yang berbaki.`), T(`Farid marks points $${ang}^\\circ$ apart round a circle and joins them to make a regular polygon. Show that this is not possible.`, `Farid menanda titik berjarak $${ang}^\\circ$ di sekeliling bulatan dan menyambungkannya untuk membuat poligon sekata. Tunjukkan bahawa ini tidak mungkin.`), T(`Is it possible to construct a regular polygon using a central angle of $${ang}^\\circ$ each time? Explain by dividing $360^\\circ$ by $${ang}^\\circ$.`, `Adakah mungkin membina poligon sekata dengan menggunakan sudut pusat $${ang}^\\circ$ setiap kali? Terangkan dengan membahagi $360^\\circ$ dengan $${ang}^\\circ$.`)][v], a: T(`$360 \\div ${ang} = ${n(round(360 / ang, 2))}\\ldots$ is not a whole number, so the points do not return exactly to the start: ${f} angles fit and $${gap}^\\circ$ is left over.`, `$360 \\div ${ang} = ${n(round(360 / ang, 2))}\\ldots$ bukan nombor bulat, maka titik tidak kembali tepat ke permulaan: ${f} sudut muat dan $${gap}^\\circ$ berbaki.`), w: W(T(`The marks close only if the central angle divides $360^\\circ$ exactly.`, `Tanda itu tertutup hanya jika sudut pusat membahagi $360^\\circ$ dengan tepat.`), `$360 \\div ${ang} = ${n(round(360 / ang, 2))}\\ldots$`, `$${f} \\times ${ang} = ${f * ang}$`, `$360 - ${f * ang} = ${gap}$`, T(`${f} angles fit and $${gap}^\\circ$ is left over, so the last point does not land on the first.`, `${f} sudut muat dan $${gap}^\\circ$ berbaki, maka titik terakhir tidak jatuh pada titik pertama.`)), sp: 'm' };
    },
    (r) => {
      const R = r.int(4, 9), c = R + r.pick([1, 2, -1]), v = r.int(0, 1);
      return { q: v === 0 ? T(`Kumar draws a circle of radius ${R} cm and sets his compasses to ${c} cm to construct a regular hexagon. Explain why the six arcs will not fit exactly round the circle, and state the correct compass setting.`, `Kumar melukis bulatan berjejari ${R} cm dan menetapkan jangka lukisnya pada ${c} cm untuk membina heksagon sekata. Terangkan mengapa enam lengkok tidak akan muat tepat di sekeliling bulatan, dan nyatakan tetapan jangka lukis yang betul.`) : T(`Siti wants a regular hexagon of side ${R} cm. She draws a circle of radius ${c} cm and steps round with a ${R} cm compass setting. Explain what goes wrong and how to correct it.`, `Siti mahu heksagon sekata bersisi ${R} cm. Dia melukis bulatan berjejari ${c} cm dan menanda sekeliling dengan tetapan jangka lukis ${R} cm. Terangkan apa yang salah dan cara membetulkannya.`), a: v === 0 ? T(`The setting must equal the radius, ${R} cm, so that each chord subtends $60^\\circ$ at the centre. With ${c} cm the angle is not $60^\\circ$, so six chords do not make $360^\\circ$.`, `Tetapan mesti sama dengan jejari, ${R} cm, supaya setiap perentas mencangkum $60^\\circ$ di pusat. Dengan ${c} cm sudutnya bukan $60^\\circ$, maka enam perentas tidak berjumlah $360^\\circ$.`) : T(`For a hexagon the side equals the radius, so the circle must have radius ${R} cm, not ${c} cm. Draw a circle of radius ${R} cm.`, `Bagi heksagon, sisi sama dengan jejari, maka bulatan mesti berjejari ${R} cm, bukan ${c} cm. Lukis bulatan berjejari ${R} cm.`), w: W(T(`Six chords fit round the circle only when each subtends $360^\\circ \\div 6 = 60^\\circ$ at the centre.`, `Enam perentas muat mengelilingi bulatan hanya apabila setiap satu mencangkum $360^\\circ \\div 6 = 60^\\circ$ di pusat.`), T(`That happens only when the chord equals the radius, because then the triangle at $O$ is equilateral.`, `Itu berlaku hanya apabila perentas sama dengan jejari, kerana segi tiga di $O$ menjadi segi tiga sama sisi.`), v === 0 ? T(`Here $${c} \\ne ${R}$, so set the compasses to $${R}$ cm.`, `Di sini $${c} \\ne ${R}$, maka tetapkan jangka lukis pada $${R}$ cm.`) : T(`Here the radius $${c}$ cm does not match the side $${R}$ cm, so draw the circle with radius $${R}$ cm.`, `Di sini jejari $${c}$ cm tidak sepadan dengan sisi $${R}$ cm, maka lukis bulatan berjejari $${R}$ cm.`)), sp: 'm' };
    },
    (r) => {
      const st = r.pick([[3, 6], [4, 8], [6, 12], [8, 16], [12, 24]]), t = r.int(1, 3), k = st[0] * 2 ** (t - 1), start = st[0];
      const kk = start * 2 ** t, v = r.int(0, 2);
      need(kk <= 48);
      const c0 = 360 / start, c1 = 360 / kk;
      return { q: [T(`A regular ${pn(start)[0]} is constructed in a circle. The angle at the centre is bisected ${t === 1 ? 'once' : t + ' times in succession'} for every sector to obtain more vertices. How many sides does the new polygon have, and what is the new angle at the centre?`, `${cap(pn(start)[1])} sekata dibina dalam bulatan. Sudut di pusat dibahagi dua sama ${t === 1 ? 'sekali' : t + ' kali berturutan'} bagi setiap sektor untuk mendapat lebih banyak bucu. Berapakah bilangan sisi poligon baharu itu, dan berapakah sudut baharu di pusat?`), T(`The centre angle of a construction is $${D(c0)}$. It is bisected ${t === 1 ? 'once' : t + ' times'} for each sector. Find the number of sides of the resulting polygon.`, `Sudut pusat suatu pembinaan ialah $${D(c0)}$. Ia dibahagi dua sama ${t === 1 ? 'sekali' : t + ' kali'} bagi setiap sektor. Cari bilangan sisi poligon yang terhasil.`), T(`A regular polygon with ${kk} sides is constructed by repeatedly bisecting angles, starting from a ${pn(start)[0]}. How many times were the central angles bisected, and what is the final central angle?`, `Poligon sekata dengan ${kk} sisi dibina dengan membahagi dua sama sudut berulang kali, bermula daripada ${pn(start)[1]}. Berapa kalikah sudut pusat dibahagi dua sama, dan berapakah sudut pusat akhir?`)][v], a: v === 0 ? T(`${kk} sides; $${D(c1)}$`, `${kk} sisi; $${D(c1)}$`) : v === 1 ? T(`${kk}`) : T(`${t} time${t > 1 ? 's' : ''}; $${D(c1)}$`, `${t} kali; $${D(c1)}$`), w: W(T(`Each bisection halves the central angle and doubles the number of sides.`, `Setiap pembahagian dua sama memisahduakan sudut pusat dan menggandakan bilangan sisi.`), `$360^\\circ \\div ${start} = ${D(c0)}$`, `$${start} \\times 2^{${t}} = ${kk}$`, `$360^\\circ \\div ${kk} = ${D(c1)}$`), sp: 's' };
    },
    (r) => {
      const R = r.pick([7, 14, 21]), v = r.int(0, 1);
      const per = 6 * R, cir = (44 * R) / 7;
      return { q: v === 0 ? T(`A regular hexagon is constructed inside a circle of radius ${R} cm using the compasses method. Find (a) the perimeter of the hexagon, (b) the circumference of the circle (use $\\pi = \\frac{22}{7}$), (c) by how much the circumference is longer than the perimeter.`, `Sebuah heksagon sekata dibina di dalam bulatan berjejari ${R} cm dengan kaedah jangka lukis. Cari (a) perimeter heksagon, (b) lilitan bulatan (guna $\\pi = \\frac{22}{7}$), (c) berapa lebih panjang lilitan daripada perimeter.`) : T(`Explain why the perimeter of a regular hexagon inside a circle of radius ${R} cm is shorter than the circumference of the circle. Support your answer with calculations (use $\\pi = \\frac{22}{7}$).`, `Terangkan mengapa perimeter heksagon sekata di dalam bulatan berjejari ${R} cm lebih pendek daripada lilitan bulatan itu. Sokong jawapan anda dengan pengiraan (guna $\\pi = \\frac{22}{7}$).`), a: v === 0 ? T(`(a) ${per} cm (b) ${cir} cm (c) ${n(round(cir - per, 2))} cm`) : T(`Perimeter of hexagon $= 6 \\times ${R} = ${per}$ cm; circumference $= ${cir}$ cm. The sides are straight chords, each shorter than the arc it cuts off, so the perimeter is shorter.`, `Perimeter heksagon $= 6 \\times ${R} = ${per}$ cm; lilitan $= ${cir}$ cm. Sisi ialah perentas lurus, setiap satu lebih pendek daripada lengkok yang dipotongnya, maka perimeternya lebih pendek.`), w: W(T(`Side of the hexagon $=$ radius $= ${R}$ cm.`, `Sisi heksagon $=$ jejari $= ${R}$ cm.`), `$6 \\times ${R} = ${per}$ cm`, `$2 \\times \\dfrac{22}{7} \\times ${R} = ${cir}$ cm`, `$${cir} - ${per} = ${n(round(cir - per, 2))}$ cm`, T(`Each side is a straight chord, shorter than the arc it cuts off, so the perimeter is less than the circumference.`, `Setiap sisi ialah perentas lurus, lebih pendek daripada lengkok yang dipotongnya, maka perimeter kurang daripada lilitan.`)), sp: 'm' };
    },
    (r) => {
      const [m, k] = meth(r), d = mDesc(m, k), st = stepsOf(m, k), v = r.int(0, 1);
      return { q: v === 0 ? T(`Write down the steps, in order, to construct ${d[0]}.`, `Tuliskan langkah, mengikut urutan, untuk membina ${d[1]}.`) : T(`Describe how to construct ${d[0]}. Say what tools are used at each step.`, `Huraikan cara membina ${d[1]}. Nyatakan alat yang digunakan pada setiap langkah.`), a: T(st.map((x, i) => `${i + 1}. ${x[0]}`).join('<br>'), st.map((x, i) => `${i + 1}. ${x[1]}`).join('<br>')), w: W(T(`Every circle construction follows the same plan: draw the circle, fix the first vertex, mark the remaining vertices equally round the circle, then join them.`, `Setiap pembinaan dalam bulatan mengikut rancangan yang sama: lukis bulatan, tetapkan bucu pertama, tanda bucu selebihnya sama jarak di sekeliling bulatan, kemudian sambungkannya.`), T(`${m === 'P' ? `Here the equal marks are made with a protractor, using $360^\\circ \\div ${k} = ${D(360 / k)}$.` : `Here the equal marks are made with compasses only, so no angle is measured.`}`, `${m === 'P' ? `Di sini tanda sama dibuat dengan protraktor, menggunakan $360^\\circ \\div ${k} = ${D(360 / k)}$.` : `Di sini tanda sama dibuat dengan jangka lukis sahaja, maka tiada sudut diukur.`}`)), sp: 'xl' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), v = r.int(0, 2), ang = ext(k);
      const good = [
        [`Equal angles at the centre give equal chords, so the sides are equal; and the points are on a circle so the polygon is regular.`, `Sudut sama di pusat memberi perentas sama, maka sisi adalah sama; dan titik terletak pada bulatan maka poligon itu sekata.`],
        [`Equal angles at the centre give equal chords; each of the ${k} chords is a side.`, `Sudut sama di pusat memberi perentas sama; setiap ${k} perentas ialah satu sisi.`],
        [`A rotation about $O$ through $${D(ang)}$ keeps distances and angles, so each new side is congruent to the previous one.`, `Putaran pada $O$ sebanyak $${D(ang)}$ mengekalkan jarak dan sudut, maka setiap sisi baharu kongruen dengan sisi sebelumnya.`],
      ][v];
      const bad = [
        [`The angle at the centre is $${D(itr(k))}$, which is the same as the interior angle.`, `Sudut di pusat ialah $${D(itr(k))}$, sama dengan sudut pedalaman.`],
        [`The chords are equal because they all have the same colour.`, `Perentas adalah sama kerana semuanya berwarna sama.`],
        [`The sides are equal because we measure them with a ruler at the end.`, `Sisi adalah sama kerana kita mengukurnya dengan pembaris pada akhirnya.`],
      ];
      const o = r.shuffle([good].concat(bad)), idx = o.indexOf(good);
      return { q: T(`Which is the correct reason why the polygon constructed with equal central angles of $${D(ang)}$ is regular?<br>${o.map((x, i) => `${'ABCD'[i]}. ${x[0]}`).join('<br>')}`, `Yang manakah sebab yang betul mengapa poligon yang dibina dengan sudut pusat sama $${D(ang)}$ ialah sekata?<br>${o.map((x, i) => `${'ABCD'[i]}. ${x[1]}`).join('<br>')}`), a: T(`${'ABCD'[idx]}. ${good[0]}`, `${'ABCD'[idx]}. ${good[1]}`), w: W(T(`Two radii and a side make a triangle; equal radii with the same angle $${D(ang)}$ at $O$ give congruent triangles, so all the sides are equal.`, `Dua jejari dan satu sisi membentuk segi tiga; jejari yang sama dengan sudut $${D(ang)}$ yang sama di $O$ memberi segi tiga kongruen, maka semua sisi adalah sama.`), T(`The central angle is $360^\\circ \\div ${k} = ${D(ang)}$, not the interior angle $${D(itr(k))}$; colour and measuring afterwards prove nothing.`, `Sudut pusat ialah $360^\\circ \\div ${k} = ${D(ang)}$, bukan sudut pedalaman $${D(itr(k))}$; warna dan ukuran selepas itu tidak membuktikan apa-apa.`)), sp: 's' };
    },
    (r) => {
      const [k1, k2] = r.pick([[6, 12], [4, 8], [3, 6], [8, 16], [3, 12]]), v = r.int(0, 1);
      const a1 = ext(k1), a2 = ext(k2);
      return { q: v === 0 ? T(`Compare constructing a regular ${pn(k1)[0]} and a regular ${pn(k2)[0]} in a circle with a protractor. Find the central angle used in each and the number of marks in each. How is the second angle related to the first?`, `Bandingkan pembinaan ${pn(k1)[1]} sekata dan ${pn(k2)[1]} sekata dalam bulatan dengan protraktor. Cari sudut pusat yang digunakan dan bilangan tanda bagi setiap satu. Bagaimanakah sudut kedua berkait dengan sudut pertama?`) : T(`Two students construct polygons in circles of the same radius: one uses $${D(a1)}$ at the centre and the other uses $${D(a2)}$. Name each polygon. Which has the shorter sides? Give a reason.`, `Dua orang murid membina poligon dalam bulatan berjejari sama: seorang menggunakan $${D(a1)}$ di pusat dan seorang lagi menggunakan $${D(a2)}$. Namakan setiap poligon. Yang manakah mempunyai sisi lebih pendek? Berikan sebab.`), a: v === 0 ? T(`$${D(a1)}$ (${k1} marks) and $${D(a2)}$ (${k2} marks); the second angle is ${a2 === a1 / 2 ? 'half' : 'a fraction'} of the first (${k2 / k1} times as many points).`.replace('a fraction', `$\\dfrac{${a2}}{${a1}}$`), `$${D(a1)}$ (${k1} tanda) dan $${D(a2)}$ (${k2} tanda); sudut kedua ialah ${a2 === a1 / 2 ? 'separuh' : `$\\dfrac{${a2}}{${a1}}$`} daripada yang pertama (${k2 / k1} kali ganda bilangan titik).`) : T(`${cap(pn(k1)[0])} and ${pn(k2)[0]}; the ${pn(k2)[0]} has shorter sides because its central angle $${D(a2)}$ is smaller, so each chord is shorter.`, `${cap(pn(k1)[1])} dan ${pn(k2)[1]}; ${pn(k2)[1]} mempunyai sisi lebih pendek kerana sudut pusatnya $${D(a2)}$ lebih kecil, maka setiap perentas lebih pendek.`), w: W(`$360^\\circ \\div ${k1} = ${D(a1)}$`, `$360^\\circ \\div ${k2} = ${D(a2)}$`, T(`${k2 / k1} times as many points means the central angle is ${k2 / k1} times smaller, and a smaller central angle cuts a shorter chord.`, `${k2 / k1} kali ganda bilangan titik bermakna sudut pusat ${k2 / k1} kali lebih kecil, dan sudut pusat yang lebih kecil memotong perentas yang lebih pendek.`)), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), I = itr(k), v = r.int(0, 2);
      const fig = conFig(k, { chords: 'all', radii: ['A', 'B'], extra: (P) => (v === 0 ? S.arc(P.A, P.B, P.O, 20, 'x', { gap: 12 }) : v === 1 ? S.arc(P.A, P.O, P.B, 20, 'y', { gap: 12 }) : S.arc(P.O, P.A, P.B, 20, 'z', { gap: 12 })) });
      return { q: nts(T(`A regular ${k}-sided polygon $ABC\\ldots$ is constructed on a circle with centre $O$. Find ${v === 0 ? '$\\angle OAB$ (marked $x$)' : v === 1 ? '$\\angle OAB$ (marked $y$)' : '$\\angle AOB$ (marked $z$)'}${v === 2 ? '' : ', giving your reasons'}.`, `Sebuah poligon sekata ${k} sisi $ABC\\ldots$ dibina pada bulatan berpusat $O$. Cari ${v === 0 ? '$\\angle OAB$ (ditanda $x$)' : v === 1 ? '$\\angle OAB$ (ditanda $y$)' : '$\\angle AOB$ (ditanda $z$)'}${v === 2 ? '' : ', dengan menyatakan alasan anda'}.`)), fig, a: T(v === 2 ? `$${D(ext(k))}$` : `$${D(I / 2)}$`), w: T(`$\\angle AOB = ${D(ext(k))}$ and $OA = OB$ (radii), so $\\angle OAB = (180^\\circ - ${D(ext(k))}) \\div 2$`, `$\\angle AOB = ${D(ext(k))}$ dan $OA = OB$ (jejari), maka $\\angle OAB = (180^\\circ - ${D(ext(k))}) \\div 2$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), v = r.int(0, 2), c = ext(k), I = itr(k);
      return { q: [T(`A regular polygon is constructed with a central angle of $${D(c)}$. Find (a) the number of sides, (b) the exterior angle, (c) the interior angle, (d) the sum of the interior angles.`, `Sebuah poligon sekata dibina dengan sudut pusat $${D(c)}$. Cari (a) bilangan sisi, (b) sudut peluaran, (c) sudut pedalaman, (d) hasil tambah sudut pedalaman.`), T(`Explain why the angle at the centre used in the construction of a regular polygon equals its exterior angle. Use ${k} sides as an example.`, `Terangkan mengapa sudut di pusat yang digunakan dalam pembinaan poligon sekata sama dengan sudut peluarannya. Gunakan ${k} sisi sebagai contoh.`), T(`After constructing a regular polygon with ${k} vertices on a circle, Nurul measures an interior angle of the polygon with a protractor. What reading should she expect, and how is it related to the central angle $${D(c)}$?`, `Selepas membina poligon sekata dengan ${k} bucu pada bulatan, Nurul mengukur satu sudut pedalaman poligon itu dengan protraktor. Apakah bacaan yang dijangka, dan bagaimanakah ia berkait dengan sudut pusat $${D(c)}$?`)][v], a: v === 0 ? T(`(a) ${k} (b) $${D(c)}$ (c) $${D(I)}$ (d) $${D(ssum(k))}$`) : v === 1 ? T(`Both equal $360^\\circ \\div ${k} = ${D(c)}$: the central angles and the exterior angles each add up to one full turn shared by ${k} equal parts.`, `Kedua-duanya $360^\\circ \\div ${k} = ${D(c)}$: sudut pusat dan sudut peluaran masing-masing berjumlah satu putaran penuh yang dikongsi oleh ${k} bahagian sama.`) : T(`$${D(I)}$; interior angle $= 180^\\circ - ${D(c)}$.`, `$${D(I)}$; sudut pedalaman $= 180^\\circ - ${D(c)}$.`), w: [
        W(`$n = 360^\\circ \\div ${D(c)} = ${k}$`, T(`Exterior angle $= ${D(c)}$`, `Sudut peluaran $= ${D(c)}$`), T(`Interior angle $= 180^\\circ - ${D(c)} = ${D(I)}$`, `Sudut pedalaman $= 180^\\circ - ${D(c)} = ${D(I)}$`), `$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`),
        W(T(`The ${k} central angles fill one full turn, and so do the ${k} exterior angles.`, `${k} sudut pusat memenuhi satu putaran penuh, begitu juga ${k} sudut peluaran.`), `$360^\\circ \\div ${k} = ${D(c)}$`),
        W(T(`The central angle equals the exterior angle.`, `Sudut pusat sama dengan sudut peluaran.`), `$180^\\circ - ${D(c)} = ${D(I)}$`),
      ][v], sp: v === 0 ? 'm' : 's' };
    },
    (r) => {
      const [m, k] = meth(r), d = mDesc(m, k), v = r.int(0, 2), st = stepsOf(m, k);
      return { q: [T(`Plan the construction of ${d[0]}: list the tools needed and the evidence (marks, arcs) you must leave on the paper.`, `Rancang pembinaan ${d[1]}: senaraikan alat yang diperlukan dan bukti (tanda, lengkok) yang mesti ditinggalkan pada kertas.`), T(`A construction of ${d[0]} is marked out of 4 marks: 1 mark each for the circle, the equally spaced points, the joined sides and correct construction marks. Describe what the examiner looks for.`, `Pembinaan ${d[1]} diberi 4 markah: 1 markah setiap satu untuk bulatan, titik sama jarak, sisi yang disambung dan tanda pembinaan yang betul. Huraikan apa yang dicari oleh pemeriksa.`), T(`Explain the purpose of each step in the construction of ${d[0]}.`, `Terangkan tujuan setiap langkah dalam pembinaan ${d[1]}.`)][v], a: T((v === 1 ? 'Circle with centre $O$ (1); equally spaced points (1); sides joined with a ruler (1); construction arcs or angle marks left visible (1).<br>' : '') + st.map((x, i) => `${i + 1}. ${x[0]}`).join('<br>'), (v === 1 ? 'Bulatan berpusat $O$ (1); titik sama jarak (1); sisi disambung dengan pembaris (1); lengkok pembinaan atau tanda sudut dikekalkan (1).<br>' : '') + st.map((x, i) => `${i + 1}. ${x[1]}`).join('<br>')), w: W(T(`Tools: a pair of compasses for the circle${m === 'P' ? ' and a protractor for the equal angles' : ' and for the equal arcs'}, and a ruler for the sides.`, `Alat: jangka lukis untuk bulatan${m === 'P' ? ' dan protraktor untuk sudut yang sama' : ' dan untuk lengkok yang sama'}, dan pembaris untuk sisi.`), T(`Evidence to leave: the circle with centre $O$, the ${k} equally spaced marks${m === 'P' ? ` made with $360^\\circ \\div ${k} = ${D(360 / k)}$` : ' made by the arcs'}, and the joined sides.`, `Bukti yang perlu ditinggalkan: bulatan berpusat $O$, ${k} tanda sama jarak${m === 'P' ? ` yang dibuat dengan $360^\\circ \\div ${k} = ${D(360 / k)}$` : ' yang dibuat oleh lengkok'}, dan sisi yang disambung.`)), sp: 'xl' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]), v = r.int(0, 2);
      return { q: [T(`Prove that ${k} central angles of $360^\\circ \\div ${k}$ fill the whole turn exactly and hence that the polygon closes after ${k} steps.`, `Buktikan bahawa ${k} sudut pusat $360^\\circ \\div ${k}$ memenuhi satu putaran penuh dengan tepat dan seterusnya poligon tertutup selepas ${k} langkah.`), T(`Show that if the central angle is $${D(360 / k)}$, the ${k}th point coincides with the first point, so no extra side is needed.`, `Tunjukkan bahawa jika sudut pusat ialah $${D(360 / k)}$, titik ke-${k} bertindih dengan titik pertama, maka tiada sisi tambahan diperlukan.`), T(`Explain why exactly ${k} equal central angles, and not ${k + 1}, are needed for a regular ${k}-sided polygon.`, `Terangkan mengapa tepat ${k} sudut pusat yang sama, dan bukan ${k + 1}, diperlukan bagi poligon sekata ${k} sisi.`)][v], a: v === 2 ? T(`Each central angle is $360^\\circ \\div ${k}$, so ${k} of them fill $360^\\circ$; a further one would go past the starting point.`, `Setiap sudut pusat ialah $360^\\circ \\div ${k}$, maka ${k} daripadanya memenuhi $360^\\circ$; satu lagi akan melepasi titik permulaan.`) : T(`$${k} \\times ${D(360 / k)} = 360^\\circ$, a full turn, so the ${k}th rotation brings the point back to the start.`, `$${k} \\times ${D(360 / k)} = 360^\\circ$, satu putaran penuh, maka putaran ke-${k} membawa titik kembali ke permulaan.`), w: W(`$360^\\circ \\div ${k} = ${D(360 / k)}$`, `$${k} \\times ${D(360 / k)} = 360^\\circ$`, T(`The ${k} central angles use up exactly one full turn, so the ${k}th point is the first point again and a ${k + 1}th angle would overshoot.`, `${k} sudut pusat itu menggunakan tepat satu putaran penuh, maka titik ke-${k} ialah titik pertama semula dan sudut ke-${k + 1} akan melepasinya.`)), sp: 'm' };
    },
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24]), x = r.int(3, 20), a1 = r.pick([2, 3, 4]), c = ext(k), b = c - a1 * x;
      need(b >= 1 && b <= 20);
      return { q: T(`A polygon is constructed on a circle using central angles of $(${a1}x + ${b})^\\circ$. The interior angle of the polygon is $(${180 - c})^\\circ$... `.replace(/ The interior.*$/, '') + ` The polygon has ${k} vertices. Find $x$, and hence the interior angle at each vertex.`, `Sebuah poligon dibina pada bulatan dengan sudut pusat $(${a1}x + ${b})^\\circ$. Poligon itu mempunyai ${k} bucu. Cari $x$, dan seterusnya sudut pedalaman pada setiap bucu.`), a: T(`$x = ${x}$ ; $${D(itr(k))}$`), w: W(T(`The central angle equals the exterior angle: $360^\\circ \\div ${k} = ${D(c)}$.`, `Sudut pusat sama dengan sudut peluaran: $360^\\circ \\div ${k} = ${D(c)}$.`), `$${a1}x + ${b} = ${n(c)}$`, `$${a1}x = ${n(c - b)}$`, `$x = ${x}$`, `$180^\\circ - ${D(c)} = ${D(itr(k))}$`), sp: 'm' };
    },
    (r) => {
      const [se, sm, tv, re, rm2, we, wm] = r.pick([
        ['A regular pentagon can be constructed with only a ruler and a protractor set to $72^\\circ$.', 'Pentagon sekata boleh dibina dengan pembaris dan protraktor yang ditetapkan pada $72^\\circ$ sahaja.', true, 'The central angle is $360^\\circ \\div 5 = 72^\\circ$, which can be marked with a protractor.', 'Sudut pusat ialah $360^\\circ \\div 5 = 72^\\circ$, yang boleh ditanda dengan protraktor.', '$360^\\circ \\div 5 = 72^\\circ$, a whole number of degrees, so a protractor can mark it.', '$360^\\circ \\div 5 = 72^\\circ$, bilangan bulat darjah, maka protraktor boleh menandanya.'],
        ['If two chords of a circle subtend equal angles at the centre, they are equal in length.', 'Jika dua perentas sebuah bulatan mencangkum sudut yang sama di pusat, kedua-duanya sama panjang.', true, 'The triangles formed with the centre are congruent (two equal radii and the same included angle).', 'Segi tiga yang dibentuk dengan pusat adalah kongruen (dua jejari sama dan sudut kandung yang sama).', 'Two radii and the chord make a triangle; equal radii and equal included angles give congruent triangles.', 'Dua jejari dan perentas membentuk segi tiga; jejari sama dan sudut kandung sama memberi segi tiga kongruen.'],
        ['A regular polygon with 7 sides can be marked exactly using whole-degree angles.', 'Poligon sekata 7 sisi boleh ditanda dengan tepat menggunakan sudut darjah bulat.', false, '$360 \\div 7 \\approx 51.43$, which is not a whole number, so a whole-degree protractor gives only an approximation.', '$360 \\div 7 \\approx 51.43$, bukan nombor bulat, maka protraktor darjah bulat hanya memberi anggaran.', '$360 \\div 7 = 51.43\\ldots$, not a whole number.', '$360 \\div 7 = 51.43\\ldots$, bukan nombor bulat.'],
        ['The angle at the centre gets larger as the number of sides of the regular polygon increases.', 'Sudut di pusat bertambah besar apabila bilangan sisi poligon sekata bertambah.', false, 'It equals $360^\\circ \\div n$, which gets smaller as $n$ increases.', 'Ia sama dengan $360^\\circ \\div n$, yang bertambah kecil apabila $n$ bertambah.', 'Compare $360^\\circ \\div 6 = 60^\\circ$ with $360^\\circ \\div 12 = 30^\\circ$.', 'Bandingkan $360^\\circ \\div 6 = 60^\\circ$ dengan $360^\\circ \\div 12 = 30^\\circ$.'],
        ['Bisecting each central angle of a regular hexagon gives the vertices of a regular dodecagon.', 'Membahagi dua sama setiap sudut pusat heksagon sekata memberi bucu dodekagon sekata.', true, 'Twelve angles of $30^\\circ$ result; equal central angles give equal chords.', 'Dua belas sudut $30^\\circ$ terhasil; sudut pusat yang sama memberi perentas yang sama.', '$60^\\circ \\div 2 = 30^\\circ$ and $360^\\circ \\div 30^\\circ = 12$.', '$60^\\circ \\div 2 = 30^\\circ$ dan $360^\\circ \\div 30^\\circ = 12$.'],
        ['In constructing a square with compasses, the two diameters must be perpendicular.', 'Dalam pembinaan segi empat sama dengan jangka lukis, kedua-dua diameter mesti berserenjang.', true, 'Perpendicular diameters give four central angles of $90^\\circ$, so equal chords.', 'Diameter berserenjang memberi empat sudut pusat $90^\\circ$, maka perentas yang sama.', '$360^\\circ \\div 4 = 90^\\circ$, so the two diameters must cross at right angles.', '$360^\\circ \\div 4 = 90^\\circ$, maka kedua-dua diameter mesti bersilang bersudut tegak.'],
        ['Joining every second point of a regular hexagon drawn in a circle gives a regular polygon with 3 sides.', 'Menyambung setiap titik kedua heksagon sekata yang dilukis dalam bulatan memberi poligon sekata 3 sisi.', true, 'The three chords each subtend $120^\\circ$ at the centre, so they are equal: an equilateral triangle.', 'Tiga perentas masing-masing mencangkum $120^\\circ$ di pusat, maka sama panjang: segi tiga sama sisi.', 'Every second point is $2 \\times 60^\\circ = 120^\\circ$ apart, and $360^\\circ \\div 120^\\circ = 3$.', 'Setiap titik kedua berjarak $2 \\times 60^\\circ = 120^\\circ$, dan $360^\\circ \\div 120^\\circ = 3$.'],
        ['A dynamic geometry rotation through $50^\\circ$ repeated about $O$ gives a regular polygon after a whole number of turns.', 'Putaran geometri dinamik sebanyak $50^\\circ$ yang diulang pada $O$ memberi poligon sekata selepas bilangan pusingan bulat.', false, '$360 \\div 50 = 7.2$ is not a whole number, so the points do not return to the start after a whole number of rotations.', '$360 \\div 50 = 7.2$ bukan nombor bulat, maka titik tidak kembali ke permulaan selepas bilangan putaran bulat.', '$360 \\div 50 = 7.2$, not a whole number.', '$360 \\div 50 = 7.2$, bukan nombor bulat.'],
      ]);
      return { q: T(`Decide whether the statement is true or false, and justify your answer: "${se}"`, `Tentukan sama ada pernyataan itu betul atau salah, dan justifikasikan jawapan anda: "${sm}"`), a: T(`${tv ? 'True' : 'False'}. ${re}`, `${tv ? 'Betul' : 'Salah'}. ${rm2}`), w: W(T(we, wm), T(`So the statement is ${tv ? 'true' : 'false'}.`, `Maka pernyataan itu ${tv ? 'betul' : 'salah'}.`)), sp: 'm' };
    },
    (r) => {
      const k = r.pick([8, 9, 10, 12, 15, 18, 20, 24]), j = r.pick([2, 3]), c = ext(k), v = r.int(0, 1);
      need(k % j !== 0 || true);
      const g = gcd(k, j), sides = k / g, ang2 = (360 * j) / k;
      need(sides >= 3);
      return { q: v === 0 ? T(`${k} points are marked equally spaced on a circle. Joining every ${j === 2 ? 'second' : 'third'} point in turn gives a closed shape. Find the angle at the centre between joined points and the number of sides of the shape.`, `${k} titik ditanda sama jarak pada bulatan. Menyambung setiap titik ${j === 2 ? 'kedua' : 'ketiga'} secara berturutan memberi bentuk tertutup. Cari sudut di pusat antara titik yang disambung dan bilangan sisi bentuk itu.`) : T(`Starting from a regular polygon constructed with ${k} vertices, Amir joins every ${j === 2 ? 'second' : 'third'} vertex. What angle does each new chord subtend at the centre, and how many chords are needed to return to the start?`, `Bermula dengan poligon sekata yang dibina dengan ${k} bucu, Amir menyambung setiap bucu ${j === 2 ? 'kedua' : 'ketiga'}. Berapakah sudut yang dicangkum oleh setiap perentas baharu di pusat, dan berapakah bilangan perentas yang diperlukan untuk kembali ke permulaan?`), a: T(`$${D(ang2)}$ ; ${sides}`), w: T(`$${j} \\times ${D(c)}$; the shape closes after $${k} \\div ${g}$ chords.`, `$${j} \\times ${D(c)}$; bentuk tertutup selepas $${k} \\div ${g}$ perentas.`), sp: 'm' };
    },
  ];
  SPM.extend('F2-4.1b', { e: g41be, m: g41bm, a: g41ba });

  /* ======================================================= F2-4.2 Interior and exterior angles of polygons */
  const NM2 = [3, 4, 5, 6, 7, 8, 9, 10, 12];
  const degs = (a) => a.map((v) => `${v}^\\circ`).join(', ');
  const vn = (k) => LET.slice(0, k).split('');
  /** irregular convex polygon figure: interior angle labels (index -> label) */
  function irrFig(r, angs, labels, opt) {
    const pts = anglePoly(r, angs);
    return polyFig(pts, Object.assign({ names: vn(angs.length), angles: labels, w: 270, h: 200, arcR: 17 }, opt || {}));
  }
  /** random interior angles of a convex k-gon summing to (k-2)*180, each between lo and hi */
  function randAngles(r, k, lo, hi) {
    return retry(() => {
      const a = Array.from({ length: k - 1 }, () => r.step(lo, hi, 5));
      const x = ssum(k) - sum(a);
      need(x >= lo && x <= hi && x % 5 === 0);
      return r.shuffle(a.concat([x]));
    }, 500);
  }
  /** polygon with exterior angles marked: ext labels; each side extended beyond the vertex */
  function irrExtFig(r, angs, labels) {
    const pts = anglePoly(r, angs), k = pts.length, more = [], ext2 = [];
    const cx = F.cen(pts);
    for (let i = 0; i < k; i++) {
      const A = pts[(i + k - 1) % k], B = pts[i];
      const ln = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
      const u = [(B[0] - A[0]) / ln, (B[1] - A[1]) / ln];
      more.push([B[0] + u[0] * 0.45, B[1] + u[1] * 0.45]);
    }
    return polyFig(pts, { more, names: vn(k), w: 280, h: 220, pad: 34, extra: (P, M) => P.map((p, i) => S.line(p[0], p[1], M[i][0], M[i][1]) + (labels[i] ? S.arc(p, M[i], P[(i + 1) % k], 17, labels[i], { gap: 13 }) : '')).join('') });
  }
  const g42e = [
    (r) => {
      const k = r.pick(NM2), v = r.int(0, 5), [a, am] = pna(k), s = ssum(k);
      return { q: [T(`Find the sum of the interior angles of ${a}.`, `Cari hasil tambah sudut pedalaman bagi ${am}.`), T(`A polygon has ${k} sides. Calculate the sum of its interior angles.`, `Sebuah poligon mempunyai ${k} sisi. Hitung hasil tambah sudut pedalamannya.`), T(`Use the formula $(n - 2) \\times 180^\\circ$ to find the sum of the interior angles of ${a}.`, `Gunakan rumus $(n - 2) \\times 180^\\circ$ untuk mencari hasil tambah sudut pedalaman bagi ${am}.`), T(`${cap(a)} is divided into triangles by drawing all the diagonals from one vertex. How many triangles are formed, and what is the sum of the interior angles of the polygon?`, `${cap(am)} dibahagikan kepada segi tiga dengan melukis semua pepenjuru dari satu bucu. Berapakah bilangan segi tiga yang terbentuk, dan berapakah hasil tambah sudut pedalaman poligon itu?`), T(`How many degrees do the interior angles of ${a} add up to?`, `Berapa darjahkah sudut pedalaman bagi ${am} berjumlah?`), T(`The interior angles of a ${k}-sided polygon are measured and added. What total should be obtained?`, `Sudut pedalaman sebuah poligon ${k} sisi diukur dan ditambah. Apakah jumlah yang sepatutnya diperoleh?`)][v], a: v === 3 ? T(`${k - 2} triangles; $${D(s)}$`, `${k - 2} segi tiga; $${D(s)}$`) : T(`$${D(s)}$`), w: W(T(`Sum of interior angles $= (n - 2) \\times 180^\\circ$`, `Hasil tambah sudut pedalaman $= (n - 2) \\times 180^\\circ$`), `$(${k} - 2) \\times 180^\\circ = ${D(s)}$`), sp: 's' };
    },
    (r) => {
      const v = r.int(0, 4);
      const Q = [
        ['State the sum of the exterior angles of any polygon (one at each vertex).', 'Nyatakan hasil tambah sudut peluaran bagi mana-mana poligon (satu pada setiap bucu).', '$360^\\circ$'],
        ['Does the sum of the exterior angles of a decagon differ from that of a triangle? Explain.', 'Adakah hasil tambah sudut peluaran bagi sebuah dekagon berbeza daripada segi tiga? Terangkan.', 'No. The sum of the exterior angles of any polygon is $360^\\circ$.'],
        ['Complete: the exterior angles of any polygon add up to ________ degrees.', 'Lengkapkan: sudut peluaran mana-mana poligon berjumlah ________ darjah.', '360'],
        ['A person walks once round the edge of a polygon, turning at each vertex through the exterior angle. What is the total angle turned?', 'Seseorang berjalan sekali mengelilingi tepi sebuah poligon, membelok pada setiap bucu melalui sudut peluaran. Berapakah jumlah sudut yang dibelok?', '$360^\\circ$ (one full turn)'],
        ['What is the sum of the exterior angles of a pentagon if the pentagon is not regular?', 'Berapakah hasil tambah sudut peluaran sebuah pentagon jika pentagon itu tidak sekata?', '$360^\\circ$'],
      ][v];
      return { q: T(Q[0], Q[1]), a: T(Q[2], Q[2].startsWith('No.') ? 'Tidak. Hasil tambah sudut peluaran mana-mana poligon ialah $360^\\circ$.' : Q[2].replace('(one full turn)', '(satu putaran penuh)')), w: W(T(`Walk once round the boundary: at each vertex you turn through the exterior angle, and you end up facing the way you started.`, `Berjalan sekali mengelilingi sempadan: pada setiap bucu anda membelok melalui sudut peluaran, dan anda berakhir menghadap arah asal.`), T(`That is one full turn, so the exterior angles add up to $360^\\circ$ for every polygon, regular or not.`, `Itu ialah satu putaran penuh, maka sudut peluaran berjumlah $360^\\circ$ bagi setiap poligon, sekata atau tidak.`)), sp: 's' };
    },
    (r) => {
      const k = r.pick(NM2), s = ssum(k), v = r.int(0, 3);
      return { q: [T(`The sum of the interior angles of a polygon is $${D(s)}$. How many sides does it have?`, `Hasil tambah sudut pedalaman sebuah poligon ialah $${D(s)}$. Berapakah bilangan sisinya?`), T(`The interior angles of a polygon add up to $${D(s)}$. Name the polygon.`, `Sudut pedalaman sebuah poligon berjumlah $${D(s)}$. Namakan poligon itu.`), T(`A polygon has interior angles totalling $${D(s)}$. Find $n$ from $(n - 2) \\times 180 = ${s}$.`, `Sebuah poligon mempunyai sudut pedalaman berjumlah $${D(s)}$. Cari $n$ daripada $(n - 2) \\times 180 = ${s}$.`), T(`Find the number of vertices of a polygon whose interior angles sum to $${D(s)}$.`, `Cari bilangan bucu sebuah poligon yang sudut pedalamannya berjumlah $${D(s)}$.`)][v], a: v === 1 && NM[k] ? T(`${cap(NM[k][0])} (${k} sides)`, `${cap(NM[k][1])} (${k} sisi)`) : T(`${k}`), w: W(T(`$(n - 2) \\times 180^\\circ = ${D(s)}$`, `$(n - 2) \\times 180^\\circ = ${D(s)}$`), `$n - 2 = ${s} \\div 180 = ${s / 180}$`, `$n = ${k}$`), sp: 's' };
    },
    (r) => {
      const ks = r.sample([3, 4, 5, 6, 7, 8, 9, 10, 12], 4).sort((a, b) => a - b), c = r.int(0, 1);
      const rows = ks.map((k) => [`${k}`, c ? '?' : `${D(ssum(k))}`.replace(/^/, '$') + '$']);
      const rows2 = ks.map((k, i) => (i % 2 ? [`${k}`, '?'] : [`?`, `$${D(ssum(k))}$`]));
      return { q: T(`Complete the table.<br>${SPM.table(rows2, { head: ['Number of sides', 'Sum of interior angles'] })}`, `Lengkapkan jadual.<br>${SPM.table(rows2, { head: ['Bilangan sisi', 'Hasil tambah sudut pedalaman'] })}`), a: T(ks.map((k, i) => (i % 2 ? `$${D(ssum(k))}$` : `${k}`)).join(' ; ')), w: W(T(`Sum of interior angles $= (n - 2) \\times 180^\\circ$`, `Hasil tambah sudut pedalaman $= (n - 2) \\times 180^\\circ$`), ...ks.map((k, i) => (i % 2 ? `$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$` : `$n = ${ssum(k)} \\div 180 + 2 = ${k}$`))), sp: 'm' };
    },
    (r) => {
      const [tf] = [r.pick([
        ['The sum of the interior angles of a quadrilateral is $360^\\circ$.', 'Hasil tambah sudut pedalaman sebuah sisi empat ialah $360^\\circ$.', true, '$(4 - 2) \\times 180^\\circ = 360^\\circ$.', '$(4 - 2) \\times 180^\\circ = 360^\\circ$.'],
        ['The sum of the interior angles of a hexagon is $720^\\circ$.', 'Hasil tambah sudut pedalaman sebuah heksagon ialah $720^\\circ$.', true, '$(6 - 2) \\times 180^\\circ = 720^\\circ$.', '$(6 - 2) \\times 180^\\circ = 720^\\circ$.'],
        ['The sum of the interior angles of a pentagon is $360^\\circ$.', 'Hasil tambah sudut pedalaman sebuah pentagon ialah $360^\\circ$.', false, 'It is $(5 - 2) \\times 180^\\circ = 540^\\circ$; $360^\\circ$ is the exterior sum.', 'Ia ialah $(5 - 2) \\times 180^\\circ = 540^\\circ$; $360^\\circ$ ialah hasil tambah sudut peluaran.'],
        ['The exterior angles of an octagon add up to $1080^\\circ$.', 'Sudut peluaran sebuah oktagon berjumlah $1080^\\circ$.', false, '$1080^\\circ$ is the interior sum; the exterior angles add up to $360^\\circ$.', '$1080^\\circ$ ialah hasil tambah sudut pedalaman; sudut peluaran berjumlah $360^\\circ$.'],
        ['A polygon with more sides has a larger sum of interior angles.', 'Poligon yang mempunyai lebih banyak sisi mempunyai hasil tambah sudut pedalaman yang lebih besar.', true, 'Each extra side adds $180^\\circ$.', 'Setiap sisi tambahan menambah $180^\\circ$.'],
        ['The sum of the exterior angles of a polygon depends on the number of sides.', 'Hasil tambah sudut peluaran sebuah poligon bergantung pada bilangan sisi.', false, 'It is always $360^\\circ$.', 'Ia sentiasa $360^\\circ$.'],
        ['Interior angle + exterior angle = $180^\\circ$ at every vertex of a polygon.', 'Sudut pedalaman + sudut peluaran = $180^\\circ$ pada setiap bucu poligon.', true, 'They form a straight line.', 'Kedua-duanya membentuk garis lurus.'],
        ['The sum of the interior angles of a triangle is $180^\\circ$, so the sum for any polygon is $180^\\circ$.', 'Hasil tambah sudut pedalaman segi tiga ialah $180^\\circ$, maka hasil tambah bagi mana-mana poligon ialah $180^\\circ$.', false, 'A polygon with $n$ sides divides into $n - 2$ triangles, so the sum is $(n - 2) \\times 180^\\circ$.', 'Poligon $n$ sisi boleh dibahagi kepada $n - 2$ segi tiga, maka hasil tambahnya $(n - 2) \\times 180^\\circ$.'],
      ])];
      return { q: T(`True or false? "${tf[0]}" Give a reason.`, `Betul atau salah? "${tf[1]}" Berikan satu sebab.`), a: T(`${tf[2] ? 'True' : 'False'}. ${tf[3]}`, `${tf[2] ? 'Betul' : 'Salah'}. ${tf[4]}`), w: W(T(`Interior sum $= (n - 2) \\times 180^\\circ$; exterior sum $= 360^\\circ$ always.`, `Hasil tambah pedalaman $= (n - 2) \\times 180^\\circ$; hasil tambah peluaran $= 360^\\circ$ sentiasa.`), T(tf[3], tf[4]), T(`So the statement is ${tf[2] ? 'true' : 'false'}.`, `Maka pernyataan itu ${tf[2] ? 'betul' : 'salah'}.`)), sp: 's' };
    },
    (r) => {
      const e = r.int(20, 160), v = r.int(0, 3);
      const I = 180 - e;
      return { q: [T(`The interior angle of a polygon at a vertex is $${D(I)}$. Find the exterior angle at that vertex.`, `Sudut pedalaman sebuah poligon pada satu bucu ialah $${D(I)}$. Cari sudut peluaran pada bucu itu.`), T(`The exterior angle at a vertex of a polygon is $${D(e)}$. Find the interior angle at that vertex.`, `Sudut peluaran pada satu bucu sebuah poligon ialah $${D(e)}$. Cari sudut pedalaman pada bucu itu.`), T(`At a vertex of a polygon, the interior angle and exterior angle lie on a straight line. If the interior angle is $${D(I)}$, what is the exterior angle?`, `Pada satu bucu poligon, sudut pedalaman dan sudut peluaran terletak pada garis lurus. Jika sudut pedalaman ialah $${D(I)}$, berapakah sudut peluarannya?`), T(`Complete: interior angle $+ ${D(e)} = \\underline{\\qquad}$. Hence find the interior angle.`, `Lengkapkan: sudut pedalaman $+ ${D(e)} = \\underline{\\qquad}$. Seterusnya cari sudut pedalaman.`)][v], a: T(v === 0 || v === 2 ? `$${D(e)}$` : v === 1 ? `$${D(I)}$` : `$180^\\circ$ ; $${D(I)}$`), w: W(T(`Interior angle $+$ exterior angle $= 180^\\circ$ (straight line).`, `Sudut pedalaman $+$ sudut peluaran $= 180^\\circ$ (garis lurus).`), `$180^\\circ - ${D(v === 0 || v === 2 ? I : e)} = ${D(v === 0 || v === 2 ? e : I)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6]), angs = randAngles(r, k, 60, 150), i = r.int(0, k - 1);
      need(angs.every((a) => a > 30 && a < 170));
      const labels = {}; angs.forEach((a, j) => (labels[j] = j === i ? 'x' : `${a}°`));
      const known = angs.filter((_, j) => j !== i);
      return { q: nts(T(`The diagram shows a ${pn(k)[0]}. Find the value of $x$.`, `Rajah menunjukkan sebuah ${pn(k)[1]}. Cari nilai $x$.`)), fig: irrFig(r, angs, labels), a: T(`$x = ${D(angs[i])}$`), w: W(`$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, `$x = ${ssum(k)} - (${known.join(' + ')}) = ${angs[i]}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([4, 5, 6, 7, 8]), e = randAngles(r, k, 30, 110);
      const v = r.int(0, 1);
      const ext2 = e.map((a) => 180 - a);
      // exterior angles of a convex polygon sum to 360
      const known = ext2.slice(0, k - 1), x = 360 - sum(known);
      need(x > 10 && x < 170);
      const ok = ext2.slice(0, k - 1);
      return { q: T(`A ${pn(k)[0]} has ${k - 1} exterior angles of ${ok.map((a) => a + '^\\circ').map((a) => `$${a}$`).join(', ')}. Find the ${k}th exterior angle.`, `Sebuah ${pn(k)[1]} mempunyai ${k - 1} sudut peluaran ${ok.map((a) => `$${a}^\\circ$`).join(', ')}. Cari sudut peluaran ke-${k}.`), a: T(`$${D(x)}$`), w: W(T(`The exterior angles of any polygon add up to $360^\\circ$.`, `Sudut peluaran mana-mana poligon berjumlah $360^\\circ$.`), `$360 - (${ok.join(' + ')}) = ${x}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 7, 8]), v = r.int(0, 3), angs = randAngles(r, k, 40, 150), i = r.int(0, k - 1);
      const known = angs.filter((_, j) => j !== i), [a, am] = pna(k), ctx = r.pick(ctx42.filter((c) => c[2] >= 4)).slice(0, 2);
      return { q: [T(`${cap(a)} has interior angles ${known.map((x) => `$${x}^\\circ$`).join(', ')} and $x$. Find $x$.`, `${cap(am)} mempunyai sudut pedalaman ${known.map((x) => `$${x}^\\circ$`).join(', ')} dan $x$. Cari $x$.`), T(`${k - 1} of the angles inside ${a} are ${known.map((x) => `$${x}^\\circ$`).join(', ')}. Write down the equation for the last angle $x$ and solve it.`, `${k - 1} sudut di dalam ${am} ialah ${known.map((x) => `$${x}^\\circ$`).join(', ')}. Tulis persamaan bagi sudut terakhir $x$ dan selesaikan.`), T(`The sum of ${k - 1} interior angles of ${a} is $${D(sum(known))}$. What is the last interior angle?`, `Hasil tambah ${k - 1} sudut pedalaman ${am} ialah $${D(sum(known))}$. Berapakah sudut pedalaman yang terakhir?`), T(`Complete: the ${k} interior angles of ${a} add up to $\\underline{\\qquad}^\\circ$, so the missing angle is $\\underline{\\qquad}^\\circ$ if the others are ${known.map((x) => `$${x}^\\circ$`).join(', ')}.`, `Lengkapkan: ${k} sudut pedalaman ${am} berjumlah $\\underline{\\qquad}^\\circ$, maka sudut yang tidak diketahui ialah $\\underline{\\qquad}^\\circ$ jika sudut lain ialah ${known.map((x) => `$${x}^\\circ$`).join(', ')}.`)][v], a: v === 3 ? T(`$${ssum(k)}^\\circ$ ; $${angs[i]}^\\circ$`) : T(`$${D(angs[i])}$`), w: W(`$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, `$${known.join(' + ')} = ${sum(known)}$`, `$x = ${ssum(k)} - ${sum(known)} = ${angs[i]}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick(SHAPES), v = r.int(0, 3), [a, am] = pna(k);
      return { q: [T(`How many triangles are formed when all the diagonals from one vertex of ${a} are drawn?`, `Berapakah bilangan segi tiga yang terbentuk apabila semua pepenjuru dari satu bucu ${am} dilukis?`), T(`Diagonals are drawn from one vertex of ${a} to divide it into triangles. How many triangles are there and what is the sum of the angles in all of them?`, `Pepenjuru dilukis dari satu bucu ${am} untuk membahagikannya kepada segi tiga. Berapakah bilangan segi tiga dan berapakah hasil tambah sudut dalam kesemuanya?`), T(`${cap(a)} is split into triangles from one corner. Find the number of triangles.`, `${cap(am)} dipecahkan kepada segi tiga dari satu penjuru. Cari bilangan segi tiga.`), T(`From one vertex of ${a}, how many diagonals can be drawn?`, `Dari satu bucu ${am}, berapakah bilangan pepenjuru yang boleh dilukis?`)][v], a: v === 1 ? T(`${k - 2} triangles; $${D(ssum(k))}$`, `${k - 2} segi tiga; $${D(ssum(k))}$`) : v === 3 ? T(`${k - 3}`) : T(`${k - 2}`), w: v === 3 ? W(T(`A diagonal cannot go to the vertex itself nor to the two vertices next to it.`, `Pepenjuru tidak boleh menuju ke bucu itu sendiri mahupun ke dua bucu di sebelahnya.`), `$${k} - 3 = ${k - 3}$`) : W(T(`The $${k - 3}$ diagonals from one vertex cut the polygon into triangles.`, `$${k - 3}$ pepenjuru dari satu bucu memotong poligon kepada segi tiga.`), `$${k} - 2 = ${k - 2}$`, ...(v === 1 ? [`$${k - 2} \\times 180^\\circ = ${D(ssum(k))}$`] : [])), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10]), [a, am] = pna(k), fig = polyFig(regPts(k), { names: vn(k), extra: (P) => P.slice(2, k - 1).map((p) => S.line(P[0][0], P[0][1], p[0], p[1])).join('') });
      return { q: nts(T(`The diagram shows ${a} $ABC\\ldots$ divided into triangles by diagonals from $A$. Write down the number of triangles and the sum of the interior angles of the ${pn(k)[0]}.`, `Rajah menunjukkan ${am} $ABC\\ldots$ yang dibahagikan kepada segi tiga oleh pepenjuru dari $A$. Tuliskan bilangan segi tiga dan hasil tambah sudut pedalaman ${pn(k)[1]} itu.`)), fig, a: T(`${k - 2} triangles; $${D(ssum(k))}$`, `${k - 2} segi tiga; $${D(ssum(k))}$`), w: W(T(`Count the triangles in the diagram, or use $n - 2$.`, `Bilang segi tiga dalam rajah, atau guna $n - 2$.`), `$${k} - 2 = ${k - 2}$`, `$${k - 2} \\times 180^\\circ = ${D(ssum(k))}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick(SHAPES), v = r.int(0, 3), [a, am] = pna(k);
      return { q: [T(`What is the sum of the exterior angles of ${a}?`, `Berapakah hasil tambah sudut peluaran ${am}?`), T(`One exterior angle is drawn at each vertex of ${a}. Find the sum of these ${k} exterior angles.`, `Satu sudut peluaran dilukis pada setiap bucu ${am}. Cari hasil tambah ${k} sudut peluaran itu.`), T(`Does the sum of the exterior angles of ${a} depend on its number of sides? State the sum.`, `Adakah hasil tambah sudut peluaran ${am} bergantung pada bilangan sisinya? Nyatakan hasil tambahnya.`), T(`A robot walks once round the boundary of ${a} and turns through each exterior angle. What is the total angle it turns?`, `Sebuah robot berjalan sekali mengelilingi sempadan ${am} dan berpusing melalui setiap sudut peluaran. Berapakah jumlah sudut yang dipusingkan?`)][v], a: T(v === 2 ? `No; $360^\\circ$` : `$360^\\circ$`, v === 2 ? `Tidak; $360^\\circ$` : `$360^\\circ$`), w: W(T(`Going once round the boundary of any polygon is one complete turn.`, `Berjalan sekali mengelilingi sempadan mana-mana poligon ialah satu putaran lengkap.`), T(`So the ${k} exterior angles add up to $360^\\circ$ — the number of sides makes no difference.`, `Maka ${k} sudut peluaran itu berjumlah $360^\\circ$ — bilangan sisi tidak mengubahnya.`)), sp: 's' };
    },
    (r) => {
      const sh = r.pick(SPECIAL), ang = sh[2](r), v = r.int(0, 2);
      need(ang.every((x) => x > 20 && x < 170) && sum(ang) === 360);
      const i = r.int(0, 3);
      const known = ang.filter((_, j) => j !== i);
      return { q: [T(`Three angles of a ${sh[0]} are ${known.map((x) => `$${x}^\\circ$`).join(', ')}. Find the fourth angle.`, `Tiga sudut sebuah ${sh[1]} ialah ${known.map((x) => `$${x}^\\circ$`).join(', ')}. Cari sudut keempat.`), T(`A quadrilateral has three angles ${known.map((x) => `$${x}^\\circ$`).join(', ')}. Find the fourth angle.`, `Sebuah sisi empat mempunyai tiga sudut ${known.map((x) => `$${x}^\\circ$`).join(', ')}. Cari sudut keempat.`), T(`$ABCD$ is a ${sh[0]}. Angles $A$, $B$, $C$ are ${known.map((x) => `$${x}^\\circ$`).join(', ')}. Find $\\angle D$.`, `$ABCD$ ialah sebuah ${sh[1]}. Sudut $A$, $B$, $C$ ialah ${known.map((x) => `$${x}^\\circ$`).join(', ')}. Cari $\\angle D$.`)][v], a: T(`$${D(ang[i])}$`), w: W(T(`The four interior angles of a quadrilateral add up to $360^\\circ$.`, `Empat sudut pedalaman sisi empat berjumlah $360^\\circ$.`), `$360 - (${known.join(' + ')}) = ${ang[i]}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 7]), angs = randAngles(r, k, 40, 140), i = r.int(0, k - 1), ext2 = angs.map((a) => 180 - a), labels = {};
      ext2.forEach((a, j) => (labels[j] = j === i ? 'x' : `${a}°`));
      return { q: nts(T(`The diagram shows a ${pn(k)[0]} with all its exterior angles marked except $x$. Find $x$.`, `Rajah menunjukkan sebuah ${pn(k)[1]} dengan semua sudut peluarannya ditanda kecuali $x$. Cari $x$.`)), fig: irrExtFig(r, angs, labels), a: T(`$x = ${D(ext2[i])}$`), w: W(T(`The exterior angles of any polygon add up to $360^\\circ$.`, `Sudut peluaran mana-mana poligon berjumlah $360^\\circ$.`), `$${ext2.filter((_, j) => j !== i).join(' + ')} = ${360 - ext2[i]}$`, `$x = 360 - ${360 - ext2[i]} = ${ext2[i]}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick(SHAPES), s = ssum(k), v = r.int(0, 2), [a, am] = pna(k);
      const sq = r.shuffle([360, s]);
      return { q: [T(`The sum of the interior angles of ${a} is $${D(s)}$. What is the sum of its exterior angles?`, `Hasil tambah sudut pedalaman ${am} ialah $${D(s)}$. Berapakah hasil tambah sudut peluarannya?`), T(`Which is bigger for ${a}: the sum of its interior angles or the sum of its exterior angles? State both sums.`, `Yang manakah lebih besar bagi ${am}: hasil tambah sudut pedalaman atau hasil tambah sudut peluaran? Nyatakan kedua-dua hasil tambah.`), T(`Find the difference between the sum of the interior angles and the sum of the exterior angles of ${a}.`, `Cari beza antara hasil tambah sudut pedalaman dengan hasil tambah sudut peluaran ${am}.`)][v], a: v === 0 ? T(`$360^\\circ$`) : v === 1 ? (k === 4 ? T(`They are equal: $360^\\circ$ each.`, `Kedua-duanya sama: $360^\\circ$ setiap satu.`) : k === 3 ? T(`Exterior: $360^\\circ$ is bigger than interior $180^\\circ$.`, `Peluaran: $360^\\circ$ lebih besar daripada pedalaman $180^\\circ$.`) : T(`Interior: $${D(s)}$ is bigger than exterior $360^\\circ$.`, `Pedalaman: $${D(s)}$ lebih besar daripada peluaran $360^\\circ$.`)) : T(`$${D(Math.abs(s - 360))}$`), w: v === 0 ? W(T(`The exterior angles of any polygon add up to $360^\\circ$, whatever the interior sum is.`, `Sudut peluaran mana-mana poligon berjumlah $360^\\circ$, tidak kira hasil tambah pedalamannya.`)) : W(`$(${k} - 2) \\times 180^\\circ = ${D(s)}$`, T(`Exterior sum $= 360^\\circ$`, `Hasil tambah peluaran $= 360^\\circ$`), s >= 360 ? `$${s} - 360 = ${s - 360}$` : `$360 - ${s} = ${360 - s}$`), sp: 's' };
    },
  ];
  /** chevron (parallel marker) on segment P->Q pointing along the direction P->Q */
  function chev(P, Q) {
    const mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2, l = Math.hypot(Q[0] - P[0], Q[1] - P[1]) || 1, u = [(Q[0] - P[0]) / l, (Q[1] - P[1]) / l], nn = [-u[1], u[0]];
    return S.poly([[mx - 5 * u[0] + 5 * nn[0], my - 5 * u[1] + 5 * nn[1]], [mx + 3 * u[0], my + 3 * u[1]], [mx - 5 * u[0] - 5 * nn[0], my - 5 * u[1] - 5 * nn[1]]], { open: true, w: 1.2 });
  }
  /** polygon (angles in order) with parallel markers on sides given as index pairs [[i,j],..]; labels as irrFig */
  function parFig(r, angs, labels, pairs) {
    const pts = anglePoly(r, angs);
    return polyFig(pts, { names: vn(angs.length), angles: labels, w: 280, h: 200, arcR: 17, extra: (P) => pairs.map(([i, j]) => chev(P[i], P[j])).join('') });
  }
  const ctx42 = [
    ['A wooden frame is in the shape of a pentagon.', 'Sebuah bingkai kayu berbentuk pentagon.', 5],
    ['A plot of land is in the shape of a hexagon.', 'Sebidang tanah berbentuk heksagon.', 6],
    ['A park is in the shape of a quadrilateral.', 'Sebuah taman berbentuk sisi empat.', 4],
    ['A tile design is in the shape of a heptagon.', 'Satu reka bentuk jubin berbentuk heptagon.', 7],
    ['A garden fence encloses a piece of land in the shape of an octagon.', 'Pagar kebun mengelilingi sebidang tanah berbentuk oktagon.', 8],
  ];
  const SHAPES = [3, 4, 5, 6, 7, 8, 9, 10, 12];
  const SPECIAL = [
    ['parallelogram', 'segi empat selari', (r) => { const a = r.step(50, 110, 5); return [a, 180 - a, a, 180 - a]; }, 'opposite angles are equal and adjacent angles add up to $180^\\circ$', 'sudut bertentangan sama dan sudut bersebelahan berjumlah $180^\\circ$'],
    ['kite', 'lauyang', (r) => { const a = r.step(60, 110, 5), b = r.step(40, 90, 5); return [a, b, 360 - 2 * a - b, a]; }, 'the two angles between unequal sides are equal', 'dua sudut di antara sisi yang tidak sama adalah sama'],
    ['rhombus', 'rombus', (r) => { const a = r.step(50, 110, 5); return [a, 180 - a, a, 180 - a]; }, 'opposite angles are equal', 'sudut bertentangan adalah sama'],
    ['isosceles trapezium', 'trapezium sama kaki', (r) => { const a = r.step(50, 110, 5); return [a, a, 180 - a, 180 - a]; }, 'the angles on the same parallel side are equal', 'sudut pada sisi selari yang sama adalah sama'],
  ];
  const g42m = [
    (r) => {
      const k = r.pick([4, 5, 6, 7, 8]), angs = randAngles(r, k, 70, 160), i = r.int(0, k - 1), j = (i + 1 + r.int(0, k - 2)) % k;
      need(angs[i] === angs[j] || true);
      // two unknown equal angles x
      const x = r.pick([80, 90, 100, 105, 110, 115, 120, 125, 130]);
      const rest = angs.slice(0, k - 2), tot = ssum(k) - 2 * x;
      const a2 = retry(() => { const a = Array.from({ length: k - 2 }, () => r.step(70, 170, 5)); need(sum(a) === tot); return a; }, 800);
      const all = [x, x].concat(a2);
      const labels = { 0: 'x', 1: 'x' }; a2.forEach((a, t) => (labels[t + 2] = `${a}°`));
      return { q: nts(T(`The diagram shows a ${pn(k)[0]} in which two of the angles are both equal to $x$. Find $x$.`, `Rajah menunjukkan sebuah ${pn(k)[1]} yang dua sudutnya sama dengan $x$. Cari $x$.`)), fig: irrFig(r, all, labels), a: T(`$x = ${D(x)}$`), w: W(`$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, `$2x = ${ssum(k)} - (${a2.join(' + ')}) = ${2 * x}$`, `$x = ${x}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8]), angs = randAngles(r, k, 70, 165), i = r.int(0, k - 1);
      const known = angs.filter((_, j) => j !== i), v = r.int(0, 3);
      const list = known.map((a) => `$${a}^\\circ$`).join(', '), [a, am] = pna(k);
      return { q: [T(`${k - 1} of the interior angles of ${a} are ${list}. Find the remaining angle.`, `${k - 1} sudut pedalaman ${am} ialah ${list}. Cari sudut yang tinggal.`), T(`In ${a}, the angles at ${k - 1} vertices are ${list}. Calculate the angle at the last vertex.`, `Dalam ${am}, sudut pada ${k - 1} bucu ialah ${list}. Hitung sudut pada bucu terakhir.`), T(`A surveyor measures ${k - 1} interior angles of a ${k}-sided field: ${list}. Find the ${k}th angle.`, `Seorang juruukur mengukur ${k - 1} sudut pedalaman sebuah padang ${k} sisi: ${list}. Cari sudut ke-${k}.`), T(`${k - 1} corners of ${a} measure ${list}. What is the size of the last corner?`, `${k - 1} penjuru ${am} berukuran ${list}. Berapakah saiz penjuru terakhir?`)][v], a: T(`$${D(angs[i])}$`), w: W(`$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, `$${ssum(k)} - (${known.join(' + ')}) = ${angs[i]}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([4, 5, 6]), angs = randAngles(r, k, 70, 150), i = r.int(0, k - 1);
      const ext2 = angs.map((a) => 180 - a), labels = {};
      ext2.forEach((a, j) => (labels[j] = j === i ? 'x' : `${a}°`));
      return { q: nts(T(`The diagram shows a ${pn(k)[0]} with one side extended at each vertex. Find $x$.`, `Rajah menunjukkan sebuah ${pn(k)[1]} dengan satu sisi dipanjangkan pada setiap bucu. Cari $x$.`)), fig: irrExtFig(r, angs, labels), a: T(`$x = ${D(ext2[i])}$`), w: W(T(`The exterior angles of any polygon add up to $360^\\circ$.`, `Sudut peluaran mana-mana poligon berjumlah $360^\\circ$.`), `$x = 360 - (${ext2.filter((_, j) => j !== i).join(' + ')}) = ${ext2[i]}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([4, 5, 6, 7, 8]), v = r.int(0, 3);
      const rem = r.pick([2, 3]);
      const [c1, c2, c3] = r.pick(ctx42.filter((c) => c[2] === k).concat(ctx42.filter((c) => c[2] === k)));
      const angs = randAngles(r, k, 70, 165), i = 0;
      const known = angs.slice(1);
      return { q: T(`${c1} Its interior angles are ${known.map((a) => `$${a}^\\circ$`).join(', ')} and one more angle. Find the missing angle.`, `${c2} Sudut pedalamannya ialah ${known.map((a) => `$${a}^\\circ$`).join(', ')} dan satu lagi sudut. Cari sudut yang tidak diketahui.`), a: T(`$${D(angs[0])}$`), w: W(`$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, `$${ssum(k)} - (${known.join(' + ')}) = ${angs[0]}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), I = itr(k), v = r.int(0, 3), s = ssum(k);
      return { q: [T(`Each interior angle of a regular polygon is $${D(I)}$. Find the sum of all its interior angles.`, `Setiap sudut pedalaman sebuah poligon sekata ialah $${D(I)}$. Cari hasil tambah semua sudut pedalamannya.`), T(`The sum of the interior angles of a regular polygon is $${D(s)}$. Find the size of each interior angle.`, `Hasil tambah sudut pedalaman sebuah poligon sekata ialah $${D(s)}$. Cari saiz setiap sudut pedalamannya.`), T(`The sum of the interior angles of a regular polygon is $${D(s)}$. Find each exterior angle.`, `Hasil tambah sudut pedalaman sebuah poligon sekata ialah $${D(s)}$. Cari setiap sudut peluarannya.`), T(`Each exterior angle of a regular polygon is $${D(ext(k))}$. Find the sum of its interior angles.`, `Setiap sudut peluaran sebuah poligon sekata ialah $${D(ext(k))}$. Cari hasil tambah sudut pedalamannya.`)][v], a: T(v === 1 ? `$${D(I)}$` : v === 2 ? `$${D(ext(k))}$` : `$${D(s)}$`), w: v === 1 ? T(`$${s} \\div ${k}$`) : v === 2 ? T(`$360 \\div ${k}$`) : T(`$(${k} - 2) \\times 180^\\circ$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([4, 5, 6]), d = r.pick([10, 15, 20, 25, 30]), v = r.int(0, 1);
      const x = (ssum(k) - d * ((k * (k - 1)) / 2)) / k;
      need(Number.isInteger(x) && x > 20 && x + d * (k - 1) < 175);
      const terms = Array.from({ length: k }, (_, i) => (i === 0 ? 'x' : `x + ${d * i}`));
      return { q: T(`The interior angles of a ${pn(k)[0]} are $${terms.map((t) => `(${t})^\\circ`).join(', ')}$. Find $x$ and the largest angle.`, `Sudut pedalaman sebuah ${pn(k)[1]} ialah $${terms.map((t) => `(${t})^\\circ`).join(', ')}$. Cari $x$ dan sudut terbesar.`), a: T(`$x = ${x}$ ; $${D(x + d * (k - 1))}$`), w: W(T(`Add the ${k} angles and use $(n - 2) \\times 180^\\circ$.`, `Tambah ${k} sudut itu dan guna $(n - 2) \\times 180^\\circ$.`), `$${k}x + ${d * (k * (k - 1)) / 2} = ${ssum(k)}$`, `$${k}x = ${ssum(k) - d * (k * (k - 1)) / 2}$`, `$x = ${x}$`, `$x + ${d * (k - 1)} = ${x + d * (k - 1)}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10, 12]), v = r.int(0, 3), t = r.int(1, 3), s = ssum(k);
      return { q: [T(`How much larger is the sum of the interior angles of a ${pn(k + t)[0]} than that of a ${pn(k)[0]}?`, `Berapa lebih besarkah hasil tambah sudut pedalaman ${pn(k + t)[1]} berbanding ${pn(k)[1]}?`), T(`A polygon with ${k} sides gains ${t} extra side${t > 1 ? 's' : ''}. By how many degrees does the sum of its interior angles increase?`, `Sebuah poligon dengan ${k} sisi bertambah ${t} sisi. Berapa darjahkah hasil tambah sudut pedalamannya bertambah?`), T(`The sum of the interior angles of ${pna(k)[0]} is $${D(s)}$. What is the sum for a polygon with ${t} more side${t > 1 ? 's' : ''}?`, `Hasil tambah sudut pedalaman ${pna(k)[1]} ialah $${D(s)}$. Berapakah hasil tambah bagi poligon dengan ${t} lebih sisi?`), T(`Nurul says each extra side of a polygon adds $${t * 180}^\\circ$ to the interior sum. For how many extra sides is she correct?`, `Nurul berkata setiap sisi tambahan pada sebuah poligon menambah $${t * 180}^\\circ$ kepada hasil tambah sudut pedalaman. Bagi berapa sisi tambahankah dia betul?`)][v], a: v === 2 ? T(`$${D(s + 180 * t)}$`) : v === 3 ? T(`${t} extra side${t > 1 ? 's' : ''} ($${t} \\times 180^\\circ$)`, `${t} sisi tambahan ($${t} \\times 180^\\circ$)`) : T(`$${D(180 * t)}$`), w: W(T(`Each extra side adds one more triangle, so $180^\\circ$ more.`, `Setiap sisi tambahan menambah satu segi tiga lagi, maka $180^\\circ$ lagi.`), ...(v === 2 ? [`$${s} + ${t} \\times 180 = ${s + 180 * t}$`] : v === 3 ? [`$${t * 180} \\div 180 = ${t}$`] : [`$(${k + t} - 2) \\times 180^\\circ = ${D(ssum(k + t))}$`, `$(${k} - 2) \\times 180^\\circ = ${D(s)}$`, `$${ssum(k + t)} - ${s} = ${180 * t}$`])), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10]), v = r.int(0, 3), [a, am] = pna(k), s = ssum(k), sq = r.pick(ctx42.map((c) => c[2]));
      const wrong = [[`180 \\times ${k} = ${180 * k}`, s, 'used $n \\times 180^\\circ$ instead of $(n - 2) \\times 180^\\circ$'], [`(${k} - 1) \\times 180 = ${(k - 1) * 180}`, s, 'used $n - 1$ instead of $n - 2$'], [`360 \\div ${k} = ${round(360 / k, 2)}`, s, 'found an exterior angle of a regular polygon, not the sum of the interior angles'], [`(${k} + 2) \\times 180 = ${(k + 2) * 180}`, s, 'added $2$ instead of subtracting $2$']][v];
      const wm = ['menggunakan $n \\times 180^\\circ$ dan bukan $(n - 2) \\times 180^\\circ$', 'menggunakan $n - 1$ dan bukan $n - 2$', 'mencari sudut peluaran poligon sekata, bukan hasil tambah sudut pedalaman', 'menambah $2$ dan bukan menolak $2$'][v];
      return { q: T(`To find the sum of the interior angles of ${a}, Hafiz calculates $${wrong[0]}$. Find his mistake and give the correct sum.`, `Untuk mencari hasil tambah sudut pedalaman ${am}, Hafiz mengira $${wrong[0]}$. Cari kesilapannya dan berikan hasil tambah yang betul.`), a: T(`He ${wrong[2]}. Correct sum $= (${k} - 2) \\times 180^\\circ = ${D(s)}$.`, `Dia ${wm}. Hasil tambah yang betul $= (${k} - 2) \\times 180^\\circ = ${D(s)}$.`), w: W(T(`Diagonals from one vertex cut an $n$-sided polygon into $n - 2$ triangles, so the interior sum is $(n - 2) \\times 180^\\circ$.`, `Pepenjuru dari satu bucu memotong poligon $n$ sisi kepada $n - 2$ segi tiga, maka hasil tambah pedalaman ialah $(n - 2) \\times 180^\\circ$.`), `$(${k} - 2) \\times 180^\\circ = ${k - 2} \\times 180^\\circ = ${D(s)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10, 12]), s = ssum(k), v = r.int(0, 1);
      const o = [s, 180 * k, (k - 1) * 180, (k - 3) * 180, 360, 180 * (k + 2)], opts = r.shuffle([s].concat(r.sample(o.slice(1), 3))), idx = opts.indexOf(s);
      need(new Set(opts).size === 4);
      const txt = '<br>' + opts.map((x, i) => `${'ABCD'[i]}. $${D(x)}$`).join('&emsp;');
      const [a, am] = pna(k);
      return { q: v === 0 ? T(`What is the sum of the interior angles of ${a}?${txt}`, `Berapakah hasil tambah sudut pedalaman ${am}?${txt}`) : T(`The interior angles of a polygon with ${k} sides add up to which of the following?${txt}`, `Sudut pedalaman sebuah poligon dengan ${k} sisi berjumlah yang manakah berikut?${txt}`), a: T(`${'ABCD'[idx]}. $${D(s)}$`), w: W(T(`A polygon with $n$ sides splits into $n - 2$ triangles.`, `Poligon dengan $n$ sisi terbahagi kepada $n - 2$ segi tiga.`), `$(${k} - 2) \\times 180^\\circ = ${D(s)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10]), angs = randAngles(r, k, 80, 160), v = r.int(0, 2);
      const a1 = angs[0], a2 = angs[1];
      const eq = retry(() => { const a = r.step(90, 150, 5), m = k - 2, x = (ssum(k) - a1 - a2) / m; need(Number.isInteger(x) && x >= 60 && x <= 170 && m >= 2); return x; }, 600);
      const m = k - 2;
      return { q: T(`${k === 5 ? 'A pentagon' : `A ${pn(k)[0]}`} has two angles of $${a1}^\\circ$ and $${a2}^\\circ$. The remaining ${m} angles are all equal. Find the size of each of the remaining angles.`, `Sebuah ${pn(k)[1]} mempunyai dua sudut $${a1}^\\circ$ dan $${a2}^\\circ$. ${m} sudut yang lain adalah sama. Cari saiz setiap sudut yang lain itu.`), a: T(`$${D(eq)}$`), w: W(`$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, `$${ssum(k)} - ${a1} - ${a2} = ${ssum(k) - a1 - a2}$`, `$${ssum(k) - a1 - a2} \\div ${m} = ${eq}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10, 12]), I = itr(k), v = r.int(0, 2), e = ext(k);
      need(Number.isInteger(I));
      return { q: [T(`An interior angle of a polygon is $${D(I)}$ and its exterior angle is $x$. Find $x$ and then the sum of all the exterior angles of the polygon.`, `Satu sudut pedalaman sebuah poligon ialah $${D(I)}$ dan sudut peluarannya ialah $x$. Cari $x$ dan kemudian hasil tambah semua sudut peluaran poligon itu.`), T(`The interior angle at one vertex of a polygon is 4 times the exterior angle at the same vertex. Find both angles.`, `Sudut pedalaman pada satu bucu sebuah poligon ialah 4 kali sudut peluaran pada bucu yang sama. Cari kedua-dua sudut itu.`), T(`At a vertex of a polygon the interior angle is $${D(I)}$ more than... `.replace(/ more than.*$/, '') + ` The exterior angle at the same vertex is $${D(e)}$. Are these angles possible at the same vertex? Explain.`, `Pada satu bucu sebuah poligon, sudut pedalaman ialah $${D(I)}$. Sudut peluaran pada bucu yang sama ialah $${D(e)}$. Adakah sudut ini mungkin pada bucu yang sama? Terangkan.`)][v], a: v === 0 ? T(`$x = ${D(180 - I)}$ ; $360^\\circ$`) : v === 1 ? T(`Interior $${D(144)}$, exterior $${D(36)}$`) : T(`Yes: $${D(I)} + ${D(e)} = 180^\\circ$.`, `Ya: $${D(I)} + ${D(e)} = 180^\\circ$.`), w: [
        W(`$x = 180^\\circ - ${D(I)} = ${D(180 - I)}$`, T(`The exterior angles of any polygon add up to $360^\\circ$, whatever the number of sides.`, `Sudut peluaran mana-mana poligon berjumlah $360^\\circ$, tidak kira bilangan sisi.`)),
        W(T(`Let the exterior angle be $x$; the interior angle is then $4x$.`, `Katakan sudut peluaran ialah $x$; sudut pedalaman ialah $4x$.`), `$4x + x = 180^\\circ$`, `$5x = 180^\\circ$`, `$x = 36^\\circ$`, `$4 \\times 36^\\circ = 144^\\circ$`),
        W(T(`At a vertex the interior and exterior angles lie on a straight line.`, `Pada satu bucu, sudut pedalaman dan sudut peluaran terletak pada garis lurus.`), `$${D(I)} + ${D(e)} = 180^\\circ$`, T(`The two angles do add up to $180^\\circ$, so they are possible.`, `Kedua-dua sudut itu berjumlah $180^\\circ$, maka ia mungkin.`)),
      ][v], sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10]), ang = randAngles(r, k, 70, 160), [a, am] = pna(k), v = r.int(0, 3);
      const mx = Math.max(...ang), mn = Math.min(...ang);
      return { q: [T(`The interior angles of ${a} are ${ang.slice(0, k - 1).map((x) => `$${x}^\\circ$`).join(', ')} and $x$. Find $x$ and state whether $x$ is the largest angle.`, `Sudut pedalaman ${am} ialah ${ang.slice(0, k - 1).map((x) => `$${x}^\\circ$`).join(', ')} dan $x$. Cari $x$ dan nyatakan sama ada $x$ ialah sudut terbesar.`), T(`${cap(a)} has ${k} interior angles: ${ang.slice(0, k - 1).map((x) => `$${x}^\\circ$`).join(', ')} and $y$. Calculate $y$ and the exterior angle at that vertex.`, `${cap(am)} mempunyai ${k} sudut pedalaman: ${ang.slice(0, k - 1).map((x) => `$${x}^\\circ$`).join(', ')} dan $y$. Hitung $y$ dan sudut peluaran pada bucu itu.`), T(`${k - 1} interior angles of ${a} are ${ang.slice(0, k - 1).map((x) => `$${x}^\\circ$`).join(', ')}. Find the last interior angle and the sum of all its exterior angles.`, `${k - 1} sudut pedalaman ${am} ialah ${ang.slice(0, k - 1).map((x) => `$${x}^\\circ$`).join(', ')}. Cari sudut pedalaman yang terakhir dan hasil tambah semua sudut peluarannya.`), T(`Find the exterior angles at each vertex of ${a} whose interior angles are ${ang.slice(0, k - 1).map((x) => `$${x}^\\circ$`).join(', ')} and $x$. Check that all the exterior angles add up to $360^\\circ$.`, `Cari sudut peluaran pada setiap bucu ${am} yang sudut pedalamannya ialah ${ang.slice(0, k - 1).map((x) => `$${x}^\\circ$`).join(', ')} dan $x$. Semak bahawa semua sudut peluaran berjumlah $360^\\circ$.`)][v], a: v === 0 ? T(`$x = ${D(ang[k - 1])}$; ${ang[k - 1] === mx ? 'yes' : 'no'}`, `$x = ${D(ang[k - 1])}$; ${ang[k - 1] === mx ? 'ya' : 'tidak'}`) : v === 1 ? T(`$y = ${D(ang[k - 1])}$ ; $${D(180 - ang[k - 1])}$`) : v === 2 ? T(`$${D(ang[k - 1])}$ ; $360^\\circ$`) : T(`${ang.map((x) => `$${D(180 - x)}$`).join(', ')}; total $360^\\circ$`, `${ang.map((x) => `$${D(180 - x)}$`).join(', ')}; jumlah $360^\\circ$`), w: W(`$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, `$${ang.slice(0, k - 1).join(' + ')} = ${sum(ang.slice(0, k - 1))}$`, `$${ssum(k)} - ${sum(ang.slice(0, k - 1))} = ${ang[k - 1]}$`, ...(v === 0 ? [T(`The largest of the ${k} angles is $${mx}^\\circ$, so the answer is ${ang[k - 1] === mx ? 'yes' : 'no'}.`, `Sudut terbesar antara ${k} sudut itu ialah $${mx}^\\circ$, maka jawapannya ${ang[k - 1] === mx ? 'ya' : 'tidak'}.`)] : v === 1 ? [`$180^\\circ - ${ang[k - 1]}^\\circ = ${D(180 - ang[k - 1])}$`] : v === 2 ? [T(`The exterior angles of any polygon add up to $360^\\circ$.`, `Sudut peluaran mana-mana poligon berjumlah $360^\\circ$.`)] : [T(`Exterior angle $= 180^\\circ -$ interior angle at each vertex:`, `Sudut peluaran $= 180^\\circ -$ sudut pedalaman pada setiap bucu:`), `$${ang.map((x) => 180 - x).join(' + ')} = 360$`])), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8]), c = r.pick([3, 4, 5]), a = r.step(100, 150, 5), [nm, nmm] = pna(k);
      const rest = k - c, x = (ssum(k) - c * a) / rest;
      need(rest >= 2 && Number.isInteger(x) && x >= 60 && x < 175);
      const v = r.int(0, 2);
      return { q: [T(`${cap(nm)} has ${c} angles of $${D(a)}$ and ${rest} equal angles $x$. Find $x$.`, `${cap(nmm)} mempunyai ${c} sudut $${D(a)}$ dan ${rest} sudut sama $x$. Cari $x$.`), T(`In ${nm}, ${c} interior angles are $${D(a)}$ each and the other ${rest} are equal. Find the size of each of these ${rest} angles and the exterior angle at one of them.`, `Dalam ${nmm}, ${c} sudut pedalaman ialah $${D(a)}$ setiap satu dan ${rest} lagi adalah sama. Cari saiz setiap ${rest} sudut itu dan sudut peluaran pada salah satunya.`), T(`${cap(nm)} has interior angles $${D(a)}$ (${c} times) and $x$ (${rest} times). Form an equation and find $x$.`, `${cap(nmm)} mempunyai sudut pedalaman $${D(a)}$ (${c} kali) dan $x$ (${rest} kali). Bentuk persamaan dan cari $x$.`)][v], a: v === 1 ? T(`$${D(x)}$ ; $${D(180 - x)}$`) : T(`$x = ${D(x)}$`), w: W(`$${rest}x + ${c} \\times ${a} = ${ssum(k)}$`, `$${rest}x = ${ssum(k) - c * a}$`, `$x = ${x}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8]), a1 = r.pick([2, 3]), b = r.pick([10, 20, 30]), [nm, nmm] = pna(k);
      const coefs = [1, a1].concat(Array(k - 2).fill(0)).slice(0, k);
      const x = retry(() => { const xv = r.int(20, 60); return xv; }, 5);
      // angles: x, x+b, 2x, ... choose form and solve
      const forms = [['x', 1, 0], ['x + ' + b, 1, b], [a1 + 'x', a1, 0]];
      const use = [forms[0], forms[1], forms[2]].concat(Array.from({ length: k - 3 }, () => forms[r.int(0, 2)]));
      const cs = sum(use.map((f) => f[1])), cn = sum(use.map((f) => f[2]));
      need((ssum(k) - cn) % cs === 0);
      const xv = (ssum(k) - cn) / cs;
      need(xv >= 20 && use.every((f) => f[1] * xv + f[2] < 170));
      const shown = use.map((f) => `(${f[0]})^\\circ`);
      return { q: T(`The interior angles of ${nm} are $${shown.join(', ')}$. Find $x$ and the largest interior angle.`, `Sudut pedalaman ${nmm} ialah $${shown.join(', ')}$. Cari $x$ dan sudut pedalaman terbesar.`), a: T(`$x = ${xv}$ ; $${D(Math.max(...use.map((f) => f[1] * xv + f[2])))}$`), w: W(`$${cs}x${cn ? ' + ' + cn : ''} = ${ssum(k)}$`, `$${cs}x = ${ssum(k) - cn}$`, `$x = ${xv}$`), sp: 'm' };
    },
    (r) => {
      const sh = r.pick(SPECIAL.slice(0, 1).concat(SPECIAL.slice(3))), a = r.int(3, 9) * 5, x = r.int(10, 40);
      const isPar = sh[0] === 'parallelogram', isTrap = sh[0] === 'isosceles trapezium';
      const p = r.pick([2, 3, 4]), q = r.pick([10, 15, 20]);
      // isosceles trapezium: base angles equal: (px + q) and (x + q2): choose x then angles
      if (isPar) {
        const A = p * x + q, B = 180 - A;
        need(A > 30 && A < 150);
        return { q: T(`In the parallelogram $ABCD$, $\\angle A = (${p}x + ${q})^\\circ$ and $\\angle B = ${D(B)}$. Find $x$.`, `Dalam segi empat selari $ABCD$, $\\angle A = (${p}x + ${q})^\\circ$ dan $\\angle B = ${D(B)}$. Cari $x$.`), a: T(`$x = ${x}$`), w: W(T(`In a parallelogram, adjacent angles are co-interior, so they add up to $180^\\circ$.`, `Dalam segi empat selari, sudut bersebelahan ialah sudut pedalaman sepihak, maka berjumlah $180^\\circ$.`), `$${p}x + ${q} = 180 - ${B} = ${180 - B}$`, `$${p}x = ${180 - B - q}$`, `$x = ${x}$`), sp: 's' };
      }
      const A = p * x + q, C = 180 - A;
      need(A > 30 && A < 150);
      return { q: T(`In the isosceles trapezium $ABCD$ with $AB \\parallel DC$, $\\angle A = \\angle B = (${p}x + ${q})^\\circ$ and $\\angle C = ${D(C)}$. Find $x$.`, `Dalam trapezium sama kaki $ABCD$ dengan $AB \\parallel DC$, $\\angle A = \\angle B = (${p}x + ${q})^\\circ$ dan $\\angle C = ${D(C)}$. Cari $x$.`), a: T(`$x = ${x}$`), w: T(`$\\angle B + \\angle C = 180^\\circ$ (co-interior angles)`), sp: 's' };
    },
  ];
  const g42a = [
    (r) => {
      const k = r.pick([4, 5, 6]), v = r.int(0, 3);
      const rt = retry(() => { const q = Array.from({ length: k }, () => r.int(1, 6)); const t = sum(q); need(gcd(t, 360) === t || 360 % t === 0 || (ssum(k) % t === 0)); return q; }, 400);
      const t = sum(rt), tot = v < 2 ? ssum(k) : 360;
      need(tot % t === 0);
      const u = tot / t, vals = rt.map((q) => q * u);
      need(v >= 2 ? vals.every((a) => a < 170) : vals.every((a) => a < 175));
      const ratio = rt.join(' : '), big = Math.max(...vals), sm = Math.min(...vals);
      const kind = v < 2 ? ['interior', 'pedalaman'] : ['exterior', 'peluaran'];
      return { q: [T(`The interior angles of a ${pn(k)[0]} are in the ratio $${ratio}$. Find the largest angle.`, `Sudut pedalaman sebuah ${pn(k)[1]} berada dalam nisbah $${ratio}$. Cari sudut terbesar.`), T(`The angles of a ${pn(k)[0]} are in the ratio $${ratio}$. Find the size of the smallest angle.`, `Sudut sebuah ${pn(k)[1]} berada dalam nisbah $${ratio}$. Cari saiz sudut terkecil.`), T(`The exterior angles of a ${pn(k)[0]} are in the ratio $${ratio}$. Find the largest exterior angle.`, `Sudut peluaran sebuah ${pn(k)[1]} berada dalam nisbah $${ratio}$. Cari sudut peluaran terbesar.`), T(`The exterior angles of a ${pn(k)[0]} are in the ratio $${ratio}$. Find the smallest interior angle.`, `Sudut peluaran sebuah ${pn(k)[1]} berada dalam nisbah $${ratio}$. Cari sudut pedalaman terkecil.`)][v], a: v === 0 ? T(`$${D(big)}$`) : v === 1 ? T(`$${D(sm)}$`) : v === 2 ? T(`$${D(big)}$`) : T(`$${D(180 - big)}$`), w: W(T(`The ${kind[0]} angles add up to $${tot}^\\circ$.`, `Sudut ${kind[1]} berjumlah $${tot}^\\circ$.`), `$${rt.join(' + ')} = ${t}$`, T(`One part $= ${tot} \\div ${t} = ${u}$`, `Satu bahagian $= ${tot} \\div ${t} = ${u}$`), v === 1 ? `$${Math.min(...rt)} \\times ${u} = ${sm}$` : `$${Math.max(...rt)} \\times ${u} = ${big}$`, ...(v === 3 ? [`$180 - ${big} = ${180 - big}$`] : [])), sp: 'm' };
    },
    (r) => {
      const k = r.pick([4, 5, 6]), a1 = r.pick([2, 3, 4]), x = r.int(15, 45), v = r.int(0, 1);
      const coefs = retry(() => { const c = Array.from({ length: k }, () => r.pick([1, 1, 2, 2, 3])); const t = sum(c); need(ssum(k) % t === 0); return c; }, 300);
      const t = sum(coefs), xv = ssum(k) / t;
      need(coefs.every((c) => c * xv < 170) && xv >= 20);
      const labels = {}; coefs.forEach((c, j) => (labels[j] = c === 1 ? 'x' : `${c}x`));
      const fig = irrFig(r, coefs.map((c) => c * xv), labels);
      const big = Math.max(...coefs) * xv;
      return { q: nts(v === 0 ? T(`The diagram shows a ${pn(k)[0]}. Find the value of $x$ and the largest angle.`, `Rajah menunjukkan sebuah ${pn(k)[1]}. Cari nilai $x$ dan sudut terbesar.`) : T(`The interior angles of the ${pn(k)[0]} in the diagram are marked in terms of $x$. Solve for $x$ and find the size of each angle.`, `Sudut pedalaman ${pn(k)[1]} dalam rajah ditanda dalam sebutan $x$. Selesaikan untuk $x$ dan cari saiz setiap sudut.`)), fig, a: v === 0 ? T(`$x = ${xv}$ ; $${D(big)}$`) : T(`$x = ${xv}$ ; ${coefs.map((c) => `$${D(c * xv)}$`).join(', ')}`), w: T(`$${coefs.map((c) => (c === 1 ? 'x' : c + 'x')).join(' + ')} = ${ssum(k)}$`), sp: 'm' };
    },
    (r) => {
      const [k, va] = r.pick([[4, 'q'], [4, 'q'], [5, 'p']]);
      if (k === 4) {
        const A = r.step(60, 120, 5), B = r.step(60, 120, 5), C = 180 - B, D2 = 180 - A;
        const labels = { 0: `${A}°`, 1: `${B}°`, 2: 'x', 3: 'y' }, pairs = [[0, 1], [3, 2]];
        const pts = null;
        const v = r.int(0, 1);
        const angs = [A, B, C, D2];
        return { q: nts(v === 0 ? T(`In the diagram, $ABCD$ is a quadrilateral with $AB \\parallel DC$. Find $x$ and $y$.`, `Dalam rajah, $ABCD$ ialah sebuah sisi empat dengan $AB \\parallel DC$. Cari $x$ dan $y$.`) : T(`$ABCD$ is a trapezium with $AB$ parallel to $DC$. Find $\\angle C$ (marked $x$) and $\\angle D$ (marked $y$).`, `$ABCD$ ialah sebuah trapezium dengan $AB$ selari dengan $DC$. Cari $\\angle C$ (ditanda $x$) dan $\\angle D$ (ditanda $y$).`)), fig: parFig(r, angs, labels, pairs), a: T(`$x = ${D(C)}$, $y = ${D(D2)}$`), w: T(`Co-interior angles between parallel lines: $\\angle B + \\angle C = 180^\\circ$, $\\angle A + \\angle D = 180^\\circ$.`, `Sudut dalam berselang seli antara garis selari: $\\angle B + \\angle C = 180^\\circ$, $\\angle A + \\angle D = 180^\\circ$.`), sp: 'm' };
      }
      const B = r.step(70, 120, 5), A = r.step(80, 140, 5), E = r.step(80, 150, 5), C = 180 - B, Dd = 360 - A - E;
      need(Dd > 60 && Dd < 170);
      const labels = { 0: `${A}°`, 1: `${B}°`, 2: `${C}°`, 3: 'x', 4: `${E}°` };
      return { q: nts(T(`In the pentagon $ABCDE$, $AB \\parallel DC$. Find $x$.`, `Dalam pentagon $ABCDE$, $AB \\parallel DC$. Cari $x$.`)), fig: parFig(r, [A, B, C, Dd, E], labels, [[0, 1], [3, 2]]), a: T(`$x = ${D(Dd)}$`), w: T(`$\\angle C = 180^\\circ - ${D(B)}$ (co-interior angles); $x = ${ssum(5)}^\\circ - (${A} + ${B} + ${C} + ${E})^\\circ$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([6, 7, 8, 9, 10, 11, 12]), I = r.pick([120, 125, 130, 135, 140, 145, 150, 155]), v = r.int(0, 1);
      const x = ssum(k) - (k - 1) * I;
      need(x >= 50 && x <= 175);
      return { q: v === 0 ? T(`A ${pn(k)[0]} has ${k - 1} interior angles of $${D(I)}$ each. Find the remaining angle.`, `Sebuah ${pn(k)[1]} mempunyai ${k - 1} sudut pedalaman yang masing-masing $${D(I)}$. Cari sudut yang tinggal.`) : T(`In a ${pn(k)[0]}, all the interior angles are $${D(I)}$ except one. Find the odd one out.`, `Dalam sebuah ${pn(k)[1]}, semua sudut pedalaman ialah $${D(I)}$ kecuali satu. Cari sudut yang berbeza itu.`), a: T(`$${D(x)}$`), w: W(`$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, `$${k - 1} \\times ${I} = ${(k - 1) * I}$`, `$${ssum(k)} - ${(k - 1) * I} = ${x}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(7, 16), I = r.pick([120, 125, 130, 135, 140, 145, 150, 155, 160]), x = ssum(k) - (k - 1) * I, v = r.int(0, 1);
      need(x >= 50 && x <= 175);
      return { q: T(`All the interior angles of a polygon are $${D(I)}$ except one which is $${D(x)}$. Find the number of sides of the polygon.`, `Semua sudut pedalaman sebuah poligon ialah $${D(I)}$ kecuali satu yang bersaiz $${D(x)}$. Cari bilangan sisi poligon itu.`), a: T(`${k}`), w: W(`$(n - 2) \\times 180 = ${I}(n - 1) + ${x}$`, `$180n - 360 = ${I}n - ${I} + ${x}$`, `$${180 - I}n = ${360 - I + x}$`, `$n = ${k}$`), sp: 'm' };
    },
    (r) => {
      const k = r.int(6, 15), e = r.pick([20, 24, 30, 40]), v = r.int(0, 1);
      const last = 360 - (k - 1) * e;
      need(last > 0 && last < 170 && last !== e);
      return { q: T(`A polygon has ${k - 1} exterior angles of $${D(e)}$ and one exterior angle of $${D(last)}$. Find the number of sides of the polygon.`, `Sebuah poligon mempunyai ${k - 1} sudut peluaran $${D(e)}$ dan satu sudut peluaran $${D(last)}$. Cari bilangan sisi poligon itu.`), a: T(`${k}`), w: W(T(`The exterior angles of any polygon add up to $360^\\circ$.`, `Sudut peluaran mana-mana poligon berjumlah $360^\\circ$.`), `$360 - ${last} = ${(k - 1) * e}$`, `$${(k - 1) * e} \\div ${e} = ${k - 1}$`, `$n = ${k - 1} + 1 = ${k}$`), sp: 'm' };
    },
    (r) => {
      const m = r.pick([2, 3, 4, 5, 6, 8]), n2 = 2 * m + 2, v = r.int(0, 2);
      return { q: [T(`The sum of the interior angles of a polygon is ${m} times the sum of its exterior angles. Find the number of sides.`, `Hasil tambah sudut pedalaman sebuah poligon ialah ${m} kali hasil tambah sudut peluarannya. Cari bilangan sisi.`), T(`For a polygon, (sum of interior angles) $= ${m} \\times$ (sum of exterior angles). How many vertices does it have?`, `Bagi sebuah poligon, (hasil tambah sudut pedalaman) $= ${m} \\times$ (hasil tambah sudut peluaran). Berapakah bilangan bucunya?`), T(`The interior angles of a polygon add up to $${D(360 * m)}$. Show that it has ${n2} sides.`, `Sudut pedalaman sebuah poligon berjumlah $${D(360 * m)}$. Tunjukkan bahawa ia mempunyai ${n2} sisi.`)][v], a: T(v === 2 ? `$(n - 2) \\times 180 = ${360 * m}$, so $n - 2 = ${2 * m}$ and $n = ${n2}$.` : `${n2}`), w: W(`$(n - 2) \\times 180 = ${m} \\times 360 = ${m * 360}$`, `$n - 2 = ${m * 360} \\div 180 = ${2 * m}$`, `$n = ${n2}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10]), v = r.int(0, 3);
      const d = 2 * r.int(1, 3);
      return { q: [T(`A ${pn(k)[0]} is divided into triangles by drawing all the diagonals from one vertex. Explain why the sum of the interior angles of the ${pn(k)[0]} is $(${k} - 2) \\times 180^\\circ$.`, `Sebuah ${pn(k)[1]} dibahagikan kepada segi tiga dengan melukis semua pepenjuru dari satu bucu. Terangkan mengapa hasil tambah sudut pedalaman ${pn(k)[1]} ialah $(${k} - 2) \\times 180^\\circ$.`), T(`Show that the exterior angles of a ${pn(k)[0]} add up to $360^\\circ$ if its interior angles add up to $${D(ssum(k))}$.`, `Tunjukkan bahawa sudut peluaran sebuah ${pn(k)[1]} berjumlah $360^\\circ$ jika sudut pedalamannya berjumlah $${D(ssum(k))}$.`), T(`Explain, using the number of triangles, why the sum of the interior angles goes up by $180^\\circ$ each time a side is added.`, `Terangkan, dengan menggunakan bilangan segi tiga, mengapa hasil tambah sudut pedalaman bertambah $180^\\circ$ setiap kali satu sisi ditambah.`), T(`A polygon has ${k} vertices. Write the sum of its interior angles and the sum of its exterior angles, and use them to find the sum of all its interior and exterior angles together.`, `Sebuah poligon mempunyai ${k} bucu. Tulis hasil tambah sudut pedalamannya dan hasil tambah sudut peluarannya, dan gunakannya untuk mencari jumlah semua sudut pedalaman dan sudut peluaran bersama.`)][v], a: v === 0 ? T(`The diagonals from one vertex make ${k - 2} triangles. Each triangle has angle sum $180^\\circ$, so the total is $${k - 2} \\times 180^\\circ = ${D(ssum(k))}$.`, `Pepenjuru dari satu bucu membentuk ${k - 2} segi tiga. Setiap segi tiga mempunyai hasil tambah sudut $180^\\circ$, maka jumlahnya $${k - 2} \\times 180^\\circ = ${D(ssum(k))}$.`) : v === 1 ? T(`At each vertex interior $+$ exterior $= 180^\\circ$, so the sum of all is $${k} \\times 180^\\circ = ${D(180 * k)}$; then exterior sum $= ${D(180 * k)} - ${D(ssum(k))} = 360^\\circ$.`, `Pada setiap bucu pedalaman $+$ peluaran $= 180^\\circ$, maka jumlah semuanya $${k} \\times 180^\\circ = ${D(180 * k)}$; maka hasil tambah peluaran $= ${D(180 * k)} - ${D(ssum(k))} = 360^\\circ$.`) : v === 2 ? T(`One more side makes one more triangle, and each triangle adds $180^\\circ$.`, `Satu sisi tambahan menghasilkan satu lagi segi tiga, dan setiap segi tiga menambah $180^\\circ$.`) : T(`Interior sum $${D(ssum(k))}$; exterior sum $360^\\circ$; total $${D(180 * k)}$.`, `Hasil tambah pedalaman $${D(ssum(k))}$; hasil tambah peluaran $360^\\circ$; jumlah $${D(180 * k)}$.`), w: [
        W(T(`The diagonals from one vertex make ${k - 2} triangles.`, `Pepenjuru dari satu bucu membentuk ${k - 2} segi tiga.`), `$${k - 2} \\times 180^\\circ = ${D(ssum(k))}$`),
        W(T(`At each of the ${k} vertices, interior $+$ exterior $= 180^\\circ$.`, `Pada setiap ${k} bucu, pedalaman $+$ peluaran $= 180^\\circ$.`), `$${k} \\times 180^\\circ = ${D(180 * k)}$`, `$${180 * k} - ${ssum(k)} = 360$`),
        W(T(`One more side makes exactly one more triangle in the fan from one vertex.`, `Satu sisi tambahan menghasilkan tepat satu lagi segi tiga dalam kipas segi tiga dari satu bucu.`), `$1 \\times 180^\\circ = 180^\\circ$`),
        W(`$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, T(`Exterior sum $= 360^\\circ$`, `Hasil tambah peluaran $= 360^\\circ$`), `$${ssum(k)} + 360 = ${180 * k}$`),
      ][v], sp: 'm' };
    },
    (r) => {
      const k = r.pick([4, 5, 6]), a = r.step(60, 100, 5);
      const refl = r.pick([[30, 40, 50], [25, 35, 45], [40, 50, 60], [20, 30, 40], [35, 45, 55]]);
      const x = 360 - sum(refl);
      return { q: T(`An arrowhead-shaped quadrilateral has interior angles $${refl.map((a) => a + '^\\circ').join(', ')}$ and a reflex angle $x$. Find $x$.`, `Sisi empat berbentuk kepala anak panah mempunyai sudut pedalaman $${refl.map((a) => a + '^\\circ').join(', ')}$ dan satu sudut refleks $x$. Cari $x$.`), a: T(`$x = ${D(x)}$`), w: T(`$360^\\circ - (${refl.join(' + ')})^\\circ$; the angle sum of a quadrilateral is $360^\\circ$ even when one angle is reflex.`, `$360^\\circ - (${refl.join(' + ')})^\\circ$; hasil tambah sudut sisi empat ialah $360^\\circ$ walaupun satu sudut adalah refleks.`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10]), t = r.int(2, 3), v = r.int(0, 1);
      const [k2] = [k + t];
      const d = 180 * t;
      return { q: v === 0 ? T(`Polygon $P$ has ${t} more sides than polygon $Q$. The sums of their interior angles differ by $${D(d)}$. Find the number of sides of $P$ if $Q$ has ${k}.`, `Poligon $P$ mempunyai ${t} sisi lebih daripada poligon $Q$. Hasil tambah sudut pedalaman keduanya berbeza $${D(d)}$. Cari bilangan sisi $P$ jika $Q$ mempunyai ${k}.`) : T(`The sums of the interior angles of two polygons are $${D(ssum(k))}$ and $${D(ssum(k2))}$. Find the number of sides of each polygon and the difference in their numbers of sides.`, `Hasil tambah sudut pedalaman dua poligon ialah $${D(ssum(k))}$ dan $${D(ssum(k2))}$. Cari bilangan sisi setiap poligon dan beza bilangan sisi keduanya.`), a: v === 0 ? T(`${k2}`) : T(`${k} and ${k2}; difference ${t}`, `${k} dan ${k2}; beza ${t}`), w: v === 0 ? W(T(`Each extra side adds $180^\\circ$ to the interior sum.`, `Setiap sisi tambahan menambah $180^\\circ$ kepada hasil tambah pedalaman.`), `$${d} \\div 180 = ${t}$`, `$${k} + ${t} = ${k2}$`) : W(`$n = ${ssum(k)} \\div 180 + 2 = ${k}$`, `$n = ${ssum(k2)} \\div 180 + 2 = ${k2}$`, `$${k2} - ${k} = ${t}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8]), a = r.pick([100, 105, 110, 115, 120]), v = r.int(0, 1);
      const [c1, c2] = r.pick([['Ali', 'Siti'], ['Farid', 'Mei Ling']]);
      const tot = ssum(k), m = k - 3;
      const x = (tot - 3 * a) / m;
      need(Number.isInteger(x) && m > 0 && x > 60 && x < 170);
      return { q: T(`A ${pn(k)[0]} has 3 angles of $${D(a)}$. The other ${m} angle${m > 1 ? 's are' : ' is'} equal to $x$. Find $x$${m > 1 ? '' : ' and comment on the shape'}.`, `Sebuah ${pn(k)[1]} mempunyai 3 sudut $${D(a)}$. ${m} sudut yang lain ${m > 1 ? 'sama dengan' : 'ialah'} $x$. Cari $x$${m > 1 ? '' : ' dan berikan ulasan tentang bentuk itu'}.`), a: T(`$x = ${D(x)}$`), w: W(`$(${k} - 2) \\times 180^\\circ = ${D(tot)}$`, `$${m}x = ${tot} - 3 \\times ${a} = ${tot - 3 * a}$`, `$x = ${x}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10]), a1 = r.int(3, Math.min(k - 1, 7)), b1 = k + 2 - a1, v = r.int(0, 2);
      need(b1 >= 3 && a1 <= b1);
      return { q: [T(`A straight line joining two vertices divides a ${pn(k)[0]} into a ${pn(a1)[0]} and a ${pn(b1)[0]}. Find the sum of the interior angles of each smaller polygon and the total of the two sums.`, `Satu garis lurus yang menyambung dua bucu membahagikan ${pn(k)[1]} kepada ${pn(a1)[1]} dan ${pn(b1)[1]}. Cari hasil tambah sudut pedalaman setiap poligon yang lebih kecil dan jumlah kedua-dua hasil tambah itu.`), T(`A ${pn(k)[0]} is cut along a diagonal into a ${pn(a1)[0]} and a ${pn(b1)[0]}. Find the sum of the interior angles of each part and compare the total with the interior angle sum of the whole ${pn(k)[0]}.`, `Sebuah ${pn(k)[1]} dipotong sepanjang pepenjuru menjadi ${pn(a1)[1]} dan ${pn(b1)[1]}. Cari hasil tambah sudut pedalaman setiap bahagian dan bandingkan jumlahnya dengan hasil tambah sudut pedalaman seluruh ${pn(k)[1]}.`), T(`A diagonal splits a polygon with ${k} sides into a polygon with ${a1} sides and a polygon with ${b1} sides. Find the difference between the total of the interior angles of the two parts and the interior angle sum of the original polygon.`, `Satu pepenjuru membelah poligon ${k} sisi kepada poligon ${a1} sisi dan poligon ${b1} sisi. Cari beza antara jumlah sudut pedalaman kedua-dua bahagian dengan hasil tambah sudut pedalaman poligon asal.`)][v], a: v === 2 ? T(`$${D(ssum(a1) + ssum(b1) - ssum(k))}$`) : T(`$${D(ssum(a1))}$ and $${D(ssum(b1))}$; total $${D(ssum(a1) + ssum(b1))}$, which is $${D(ssum(a1) + ssum(b1) - ssum(k))}$ more than $${D(ssum(k))}$.`, `$${D(ssum(a1))}$ dan $${D(ssum(b1))}$; jumlah $${D(ssum(a1) + ssum(b1))}$, iaitu $${D(ssum(a1) + ssum(b1) - ssum(k))}$ lebih daripada $${D(ssum(k))}$.`), w: W(`$(${a1} - 2) \\times 180^\\circ = ${D(ssum(a1))}$`, `$(${b1} - 2) \\times 180^\\circ = ${D(ssum(b1))}$`, `$${ssum(a1)} + ${ssum(b1)} = ${ssum(a1) + ssum(b1)}$`, `$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, T(`The diagonal is shared, so $${a1} + ${b1} = ${k} + 2$ and the two totals are the same: the difference is $0^\\circ$.`, `Pepenjuru itu dikongsi, maka $${a1} + ${b1} = ${k} + 2$ dan kedua-dua jumlah adalah sama: bezanya $0^\\circ$.`)), sp: 'm' };
    },
    (r) => {
      const shp = r.pick([
        ['L', [[0, 0], [4, 0], [4, 2], [2, 2], [2, 4], [0, 4]], [0, 1, 2, 4, 5], 3, 1, 'an L-shaped hexagon', 'heksagon berbentuk L'],
        ['T', [[0, 0], [6, 0], [6, 2], [4, 2], [4, 4], [2, 4], [2, 2], [0, 2]], [0, 1, 2, 4, 5, 7], 3, 2, 'a T-shaped octagon', 'oktagon berbentuk T'],
        ['U', [[0, 0], [6, 0], [6, 4], [4, 4], [4, 2], [2, 2], [2, 4], [0, 4]], [0, 1, 2, 3, 6, 7], 4, 2, 'a U-shaped octagon', 'oktagon berbentuk U'],
        ['cross', [[2, 0], [4, 0], [4, 2], [6, 2], [6, 4], [4, 4], [4, 6], [2, 6], [2, 4], [0, 4], [0, 2], [2, 2]], [0, 1, 3, 4, 6, 7, 9, 10], 2, 4, 'a cross-shaped polygon with 12 sides', 'poligon berbentuk palang dengan 12 sisi'],
      ]);
      const [tag, pts, rts, rf, cnt, en, ms] = shp;
      const k = pts.length, refl = [];
      for (let i = 0; i < k; i++) if (!rts.includes(i)) refl.push(i);
      const fig = polyFig(pts, { right: rts, names: vn(k), w: 240, h: 190, extra: (P, M, C) => refl.map((i) => { const u = [P[i][0] - C[0], P[i][1] - C[1]], l = Math.hypot(u[0], u[1]) || 1; return S.text(P[i][0] - (u[0] / l) * 16, P[i][1] - (u[1] / l) * 16, 'x', { i: true, s: 12 }); }).join('') });
      const x = (ssum(k) - 90 * rts.length) / refl.length;
      return { q: nts(T(`The diagram shows ${en}. All the angles marked with a right-angle sign are $90^\\circ$ and the ${refl.length} reflex angle${refl.length > 1 ? 's marked' : ' marked'} $x$ ${refl.length > 1 ? 'are equal' : 'is the only other angle'}. Find $x$.`, `Rajah menunjukkan ${ms}. Semua sudut yang bertanda sudut tegak ialah $90^\\circ$ dan ${refl.length} sudut refleks yang ditanda $x$ ${refl.length > 1 ? 'adalah sama' : 'ialah satu-satunya sudut yang lain'}. Cari $x$.`)), fig, a: T(`$x = ${D(x)}$`), w: W(`$(${k} - 2) \\times 180^\\circ = ${D(ssum(k))}$`, `$${refl.length}x + ${rts.length} \\times 90 = ${ssum(k)}$`, ...(refl.length > 1 ? [`$${refl.length}x = ${ssum(k) - 90 * rts.length}$`] : []), `$x = ${x}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10]), m = r.pick([2, 3]), q = m * (k - 2) + 2, v = r.int(0, 1);
      return { q: v === 0 ? T(`The sum of the interior angles of polygon $Q$ is ${m} times the sum of the interior angles of a ${pn(k)[0]}. How many sides does $Q$ have?`, `Hasil tambah sudut pedalaman poligon $Q$ ialah ${m} kali hasil tambah sudut pedalaman ${pn(k)[1]}. Berapakah bilangan sisi $Q$?`) : T(`Polygon $P$ is ${pna(k)[0]}. Polygon $Q$ has interior angles adding up to ${m} times those of $P$. Find the number of sides of $Q$.`, `Poligon $P$ ialah ${pna(k)[1]}. Poligon $Q$ mempunyai sudut pedalaman berjumlah ${m} kali ganda $P$. Cari bilangan sisi $Q$.`), a: T(`${q}`), w: W(`$(n - 2) \\times 180 = ${m} \\times ${ssum(k)} = ${m * ssum(k)}$`, `$n - 2 = ${m * ssum(k)} \\div 180 = ${q - 2}$`, `$n = ${q}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10, 12]), v = r.int(0, 2), s = ssum(k);
      const good = [[`The sum of the interior angles of a ${pn(k)[0]} is $${D(s)}$.`, `Hasil tambah sudut pedalaman ${pn(k)[1]} ialah $${D(s)}$.`], [`A ${pn(k)[0]} can be split into ${k - 2} triangles from one vertex.`, `${cap(pn(k)[1])} boleh dipecahkan kepada ${k - 2} segi tiga dari satu bucu.`], [`The sum of the exterior angles of a ${pn(k)[0]} is $360^\\circ$.`, `Hasil tambah sudut peluaran ${pn(k)[1]} ialah $360^\\circ$.`]][v];
      const bad = [[`The sum of the exterior angles of a ${pn(k)[0]} is $${D(s)}$.`, `Hasil tambah sudut peluaran ${pn(k)[1]} ialah $${D(s)}$.`], [`The sum of the interior angles of a ${pn(k)[0]} is $${D(180 * k)}$.`, `Hasil tambah sudut pedalaman ${pn(k)[1]} ialah $${D(180 * k)}$.`], [`A ${pn(k)[0]} can be split into ${k} triangles from one vertex.`, `${cap(pn(k)[1])} boleh dipecahkan kepada ${k} segi tiga dari satu bucu.`], [`Each interior angle of a ${pn(k)[0]} is $${D(round(s / k, 2))}$ (whether or not it is regular).`, `Setiap sudut pedalaman ${pn(k)[1]} ialah $${D(round(s / k, 2))}$ (sama ada sekata atau tidak).`]];
      const o = r.shuffle([good].concat(r.sample(bad.filter((b) => b[0] !== good[0]), 3))), idx = o.indexOf(good);
      return { q: T(`Which statement is correct?<br>${o.map((x, i) => `${'ABCD'[i]}. ${x[0]}`).join('<br>')}`, `Pernyataan manakah yang betul?<br>${o.map((x, i) => `${'ABCD'[i]}. ${x[1]}`).join('<br>')}`), a: T(`${'ABCD'[idx]}. ${good[0]}`, `${'ABCD'[idx]}. ${good[1]}`), w: W(T(`For every polygon: interior sum $= (n - 2) \\times 180^\\circ$, exterior sum $= 360^\\circ$, and $n - 2$ triangles fan out from one vertex.`, `Bagi setiap poligon: hasil tambah pedalaman $= (n - 2) \\times 180^\\circ$, hasil tambah peluaran $= 360^\\circ$, dan $n - 2$ segi tiga terbentuk dari satu bucu.`), `$(${k} - 2) \\times 180^\\circ = ${D(s)}$`, T(`Only option ${'ABCD'[idx]} agrees with these.`, `Hanya pilihan ${'ABCD'[idx]} menepati semua ini.`)), sp: 's' };
    },
  ];
  /*END42*/
  SPM.extend('F2-4.2', { e: g42e, m: g42m, a: g42a });

  /* ======================================================= F2-5.1 Properties and constructions of circles */
  const PARTS = {
    radius: ['radius', 'jejari'], diameter: ['diameter', 'diameter'], chord: ['chord', 'perentas'], arc: ['arc', 'lengkok'],
    sector: ['sector', 'sektor'], segment: ['segment', 'tembereng'], circumference: ['circumference', 'lilitan'],
  };
  const CDEF = { radius: ['a line from the centre to a point on the circle', 'garis dari pusat ke satu titik pada bulatan'], diameter: ['a chord through the centre', 'perentas yang melalui pusat'], chord: ['a line joining two points on the circle', 'garis yang menyambung dua titik pada bulatan'], arc: ['a part of the circumference', 'sebahagian daripada lilitan'], sector: ['a region bounded by two radii and an arc', 'kawasan yang dibatasi oleh dua jejari dan satu lengkok'], segment: ['a region bounded by a chord and an arc', 'kawasan yang dibatasi oleh satu perentas dan satu lengkok'], circumference: ['the whole distance round the circle', 'keseluruhan jarak mengelilingi bulatan'] };
  /** circle with one highlighted part; returns svg. kind in PARTS */
  function partFig(kind, a1, a2) {
    const pts = { P: a1, Q: a2 };
    return F.circle({ pts, r: 76, w: 230, h: 210, extra: (P, m) => {
      const { cx, cy, r } = m, A = P.P, B = P.Q;
      const arcPath = (u, v) => `M${A[0].toFixed(1)},${A[1].toFixed(1)} A${r},${r} 0 ${(((a2 - a1 + 360) % 360) > 180) ? 1 : 0} 0 ${B[0].toFixed(1)},${B[1].toFixed(1)}`;
      if (kind === 'radius') return S.line(cx, cy, A[0], A[1], { w: 3 });
      if (kind === 'diameter') return S.line(A[0], A[1], 2 * cx - A[0], 2 * cy - A[1], { w: 3 }) + S.text(2 * cx - A[0] - 12 * Math.cos(rad(a1)), 2 * cy - A[1] + 12 * Math.sin(rad(a1)), 'R', { i: true });
      if (kind === 'chord') return S.line(A[0], A[1], B[0], B[1], { w: 3 });
      if (kind === 'arc') return S.path(arcPath(), { w: 3.4 });
      if (kind === 'circumference') return S.circle(cx, cy, r, { w: 3.4 });
      if (kind === 'sector') return S.path(`M${cx},${cy} L${A[0].toFixed(1)},${A[1].toFixed(1)} A${r},${r} 0 ${(((a2 - a1 + 360) % 360) > 180) ? 1 : 0} 0 ${B[0].toFixed(1)},${B[1].toFixed(1)} Z`, { fill: 'currentColor', op: 0.22 });
      return S.path(`${arcPath()} Z`, { fill: 'currentColor', op: 0.22 }) + S.line(A[0], A[1], B[0], B[1]);
    } });
  }
  const CIRC_CTX = [
    ['a round table', 'sebuah meja bulat', 'cm', 30, 90], ['a dinner plate', 'sebuah pinggan makan', 'cm', 7, 15], ['a bicycle wheel', 'sebuah roda basikal', 'cm', 14, 35], ['a circular pond', 'sebuah kolam bulat', 'm', 2, 15],
    ['a coin', 'sebiji duit syiling', 'cm', 1, 2], ['a circular trampoline', 'sebuah trampolin bulat', 'm', 2, 4], ['a round pizza', 'sebiji piza bulat', 'cm', 10, 20], ['a clock face', 'sebuah muka jam', 'cm', 7, 20],
    ['a drum', 'sebuah gendang', 'cm', 15, 40], ['a circular flower bed', 'sebuah batas bunga bulat', 'm', 2, 6],
  ];
  const g51e = [
    (r) => {
      const kind = r.pick(['radius', 'diameter', 'chord', 'arc', 'sector', 'segment']), a1 = r.pick([20, 40, 60, 100]), a2 = r.pick([150, 200, 250, 300]), v = r.int(0, 2);
      const fig = partFig(kind, a1, a2);
      return { q: [T(`In the diagram, which part of the circle is shown ${kind === 'sector' || kind === 'segment' ? 'shaded' : 'in bold'}?`, `Dalam rajah, bahagian bulatan yang manakah ${kind === 'sector' || kind === 'segment' ? 'berlorek' : 'ditebalkan'}?`), T(`The ${kind === 'sector' || kind === 'segment' ? 'shaded region' : 'bold part'} of the circle with centre $O$ has a special name. What is it?`, `${kind === 'sector' || kind === 'segment' ? 'Kawasan berlorek' : 'Bahagian tebal'} pada bulatan berpusat $O$ mempunyai nama khas. Apakah namanya?`), T(`Name the part of the circle drawn ${kind === 'sector' || kind === 'segment' ? 'shaded' : 'in bold'} in the figure.`, `Namakan bahagian bulatan yang ${kind === 'sector' || kind === 'segment' ? 'dilorek' : 'ditebalkan'} dalam rajah.`)][v], fig, a: T(cap(PARTS[kind][0]), cap(PARTS[kind][1])), w: W(T(`The ${PARTS[kind][0]} is ${CDEF[kind][0]}.`, `${cap(PARTS[kind][1])} ialah ${CDEF[kind][1]}.`), T(`That is what the diagram shows, so it is the ${PARTS[kind][0]}.`, `Itulah yang ditunjukkan rajah, maka ia ialah ${PARTS[kind][1]}.`)), sp: 'xs' };
    },
    (r) => {
      const c = r.pick(CIRC_CTX), rr = r.int(c[3], c[4]), s = r.chance(), u = c[2], v = r.int(0, 1);
      return { q: s ? T(`${cap(c[0])} has a radius of ${rr} ${u}. Find its diameter.`, `${cap(c[1])} mempunyai jejari ${rr} ${u}. Cari diameternya.`) : T(`${cap(c[0])} has a diameter of ${2 * rr} ${u}. Find its radius.`, `${cap(c[1])} mempunyai diameter ${2 * rr} ${u}. Cari jejarinya.`), a: T(s ? `${2 * rr} ${u}` : `${rr} ${u}`), w: T(s ? `$d = 2r$` : `$r = d \\div 2$`), sp: 'xs' };
    },
    (r) => {
      const t = r.int(0, 6);
      const Q = [
        ['A line segment joining two points on a circle is called a ________.', 'Tembereng garis yang menyambung dua titik pada bulatan dipanggil ________.', 'chord', 'perentas', 'Both ends lie on the circle, but it need not pass through the centre.', 'Kedua-dua hujungnya terletak pada bulatan, tetapi ia tidak semestinya melalui pusat.'],
        ['A chord that passes through the centre of a circle is called a ________.', 'Perentas yang melalui pusat bulatan dipanggil ________.', 'diameter', 'diameter', 'It is the longest chord, of length $2r$.', 'Ia ialah perentas terpanjang, berukuran $2r$.'],
        ['The distance from the centre of a circle to any point on the circle is the ________.', 'Jarak dari pusat bulatan ke mana-mana titik pada bulatan ialah ________.', 'radius', 'jejari', 'Every point on the circle is this same distance from the centre.', 'Setiap titik pada bulatan berada pada jarak yang sama ini dari pusat.'],
        ['The distance round a circle is called its ________.', 'Jarak mengelilingi sebuah bulatan dipanggil ________.', 'circumference', 'lilitan', 'It is the perimeter of the circle — a curve, not a straight line.', 'Ia ialah perimeter bulatan — satu lengkung, bukan garis lurus.'],
        ['A part of the circumference of a circle is called an ________.', 'Sebahagian daripada lilitan bulatan dipanggil ________.', 'arc', 'lengkok', 'It is part of that curve, so it is not straight.', 'Ia sebahagian daripada lengkung itu, maka ia tidak lurus.'],
        ['The region bounded by two radii and an arc is called a ________.', 'Kawasan yang dibatasi oleh dua jejari dan satu lengkok dipanggil ________.', 'sector', 'sektor', 'Two straight radii and a curve — like a slice of cake.', 'Dua jejari lurus dan satu lengkung — seperti sehiris kek.'],
        ['The region bounded by a chord and an arc is called a ________.', 'Kawasan yang dibatasi oleh satu perentas dan satu lengkok dipanggil ________.', 'segment', 'tembereng', 'One straight chord and a curve — the piece the chord cuts off.', 'Satu perentas lurus dan satu lengkung — bahagian yang dipotong oleh perentas.'],
      ][t];
      return { q: T(`Fill in the blank: ${Q[0]}`, `Isi tempat kosong: ${Q[1]}`), a: T(Q[2], Q[3]), w: W(T(Q[4], Q[5]), T(`So the missing word is "${Q[2]}".`, `Maka perkataan yang tertinggal ialah "${Q[3]}".`)), sp: 'xs' };
    },
    (r) => {
      const [se, sm, tv, re, rm2] = r.pick([
        ['The diameter of a circle is twice its radius.', 'Diameter sebuah bulatan ialah dua kali jejarinya.', true, '$d = 2r$.', '$d = 2r$.'],
        ['The diameter is the longest chord of a circle.', 'Diameter ialah perentas terpanjang bagi sebuah bulatan.', true, 'Any other chord is shorter than the diameter.', 'Mana-mana perentas lain lebih pendek daripada diameter.'],
        ['Every chord of a circle passes through the centre.', 'Setiap perentas sebuah bulatan melalui pusat.', false, 'Only a diameter passes through the centre.', 'Hanya diameter yang melalui pusat.'],
        ['A radius is a chord.', 'Jejari ialah satu perentas.', false, 'A chord joins two points on the circle; a radius has one end at the centre.', 'Perentas menyambung dua titik pada bulatan; jejari mempunyai satu hujung di pusat.'],
        ['A circle has only one diameter.', 'Sebuah bulatan hanya mempunyai satu diameter.', false, 'It has infinitely many diameters, all of the same length.', 'Ia mempunyai banyak diameter yang sama panjang.'],
        ['All radii of a circle are equal in length.', 'Semua jejari sebuah bulatan sama panjang.', true, 'Every point on the circle is the same distance from the centre.', 'Setiap titik pada bulatan adalah sama jarak dari pusat.'],
        ['A sector is bounded by two radii and an arc.', 'Sektor dibatasi oleh dua jejari dan satu lengkok.', true, 'This is the definition of a sector.', 'Ini ialah takrifan sektor.'],
        ['A semicircle is a segment whose chord is a diameter.', 'Semibulatan ialah tembereng yang perentasnya ialah diameter.', true, 'Cutting a circle along a diameter gives two equal semicircles.', 'Memotong bulatan sepanjang diameter menghasilkan dua semibulatan yang sama.'],
        ['A quadrant is a sector with an angle of $90^\\circ$ at the centre.', 'Sukuan bulatan ialah sektor dengan sudut $90^\\circ$ di pusat.', true, 'A quarter of a full turn ($360^\\circ \\div 4 = 90^\\circ$).', 'Suku daripada satu putaran penuh ($360^\\circ \\div 4 = 90^\\circ$).'],
        ['A chord can be longer than the diameter of the same circle.', 'Sebuah perentas boleh lebih panjang daripada diameter bulatan yang sama.', false, 'The diameter is the longest chord.', 'Diameter ialah perentas terpanjang.'],
        ['The centre of a circle lies on the circle.', 'Pusat sebuah bulatan terletak pada bulatan itu.', false, 'The centre is inside the circle, a radius away from every point on it.', 'Pusat berada di dalam bulatan, sejauh satu jejari dari setiap titik padanya.'],
        ['A sector with an angle of $180^\\circ$ is a semicircle.', 'Sektor dengan sudut $180^\\circ$ ialah semibulatan.', true, 'Half of a full turn gives half of the circle.', 'Separuh putaran penuh memberi separuh bulatan.'],
        ['A circle with radius 6 cm has a diameter of 3 cm.', 'Bulatan berjejari 6 cm mempunyai diameter 3 cm.', false, 'The diameter is $2 \\times 6 = 12$ cm.', 'Diameternya ialah $2 \\times 6 = 12$ cm.'],
        ['Two circles with the same radius are the same size.', 'Dua bulatan yang berjejari sama adalah sama saiz.', true, 'Their diameters are equal too, so one fits exactly on the other.', 'Diameter kedua-duanya juga sama, maka satu boleh tepat dengan yang lain.'],
        ['An arc is always a straight line.', 'Lengkok sentiasa garis lurus.', false, 'An arc is a curved part of the circumference.', 'Lengkok ialah sebahagian melengkung daripada lilitan.'],
        ['A segment is bounded by two radii and an arc.', 'Tembereng dibatasi oleh dua jejari dan satu lengkok.', false, 'That describes a sector. A segment is bounded by a chord and an arc.', 'Itu menerangkan sektor. Tembereng dibatasi oleh satu perentas dan satu lengkok.'],
        ['The compasses must be set to the diameter to draw a circle of a given radius.', 'Jangka lukis mesti ditetapkan pada diameter untuk melukis bulatan dengan jejari yang diberi.', false, 'It must be set to the radius.', 'Ia mesti ditetapkan pada jejari.'],
        ['A diameter divides a circle into two equal semicircles.', 'Diameter membahagi bulatan kepada dua semibulatan yang sama.', true, 'A diameter is an axis of symmetry of the circle.', 'Diameter ialah paksi simetri bulatan.'],
      ]);
      return { q: T(`True or false? "${se}" Explain.`, `Betul atau salah? "${sm}" Terangkan.`), a: T(`${tv ? 'True' : 'False'}. ${re}`, `${tv ? 'Betul' : 'Salah'}. ${rm2}`), w: W(T(`Check the statement against the definitions: $d = 2r$, a chord joins two points on the circle, a sector is bounded by two radii and an arc, and a segment by a chord and an arc.`, `Semak pernyataan itu dengan takrifan: $d = 2r$, perentas menyambung dua titik pada bulatan, sektor dibatasi oleh dua jejari dan satu lengkok, dan tembereng oleh satu perentas dan satu lengkok.`), T(re, rm2), T(`So the statement is ${tv ? 'true' : 'false'}.`, `Maka pernyataan itu ${tv ? 'betul' : 'salah'}.`)), sp: 's' };
    },
    (r) => {
      const c = r.pick(CIRC_CTX), d = 2 * r.int(c[3], c[4]), v = r.int(0, 2);
      return { q: [T(`To draw a circle for ${c[0]} with a diameter of ${d} ${c[2]}, to what length should the compasses be set?`, `Untuk melukis bulatan bagi ${c[1]} dengan diameter ${d} ${c[2]}, kepada panjang berapakah jangka lukis perlu ditetapkan?`), T(`A circle with diameter ${d} ${c[2]} is to be drawn with compasses. What radius should be set?`, `Sebuah bulatan dengan diameter ${d} ${c[2]} hendak dilukis dengan jangka lukis. Apakah jejari yang perlu ditetapkan?`), T(`Aina sets her compasses to ${d / 2} ${c[2]} to draw a circle. What is the diameter of her circle?`, `Aina menetapkan jangka lukisnya pada ${d / 2} ${c[2]} untuk melukis bulatan. Berapakah diameter bulatannya?`)][v], a: T(v === 2 ? `${d} ${c[2]}` : `${d / 2} ${c[2]}`), w: W(T(`The compasses are always set to the radius, not the diameter.`, `Jangka lukis sentiasa ditetapkan pada jejari, bukan diameter.`), v === 2 ? `$d = 2 \\times ${d / 2} = ${d}$` : `$r = ${d} \\div 2 = ${d / 2}$`), sp: 'xs' };
    },
    (r) => {
      const a1 = r.pick([30, 45, 60, 80]), k = r.int(0, 2), rr = r.int(3, 12);
      const fig = F.circle({ pts: { A: 200, B: 20, C: 110 }, radii: ['OC'], chords: ['AB'], r: 76, w: 230, h: 210 });
      return { q: nts([T(`In the circle with centre $O$, $AB$ is a straight line through $O$ and $OC = ${rr}$ cm. Find the length of $AB$.`, `Dalam bulatan berpusat $O$, $AB$ ialah garis lurus yang melalui $O$ dan $OC = ${rr}$ cm. Cari panjang $AB$.`), T(`In the diagram $AB$ is a diameter of the circle with centre $O$ and $OC = ${rr}$ cm. Find the diameter.`, `Dalam rajah $AB$ ialah diameter bulatan berpusat $O$ dan $OC = ${rr}$ cm. Cari diameter itu.`), T(`$O$ is the centre of the circle. If $OC = ${rr}$ cm, find $OA$ and $AB$ ($AB$ passes through $O$).`, `$O$ ialah pusat bulatan. Jika $OC = ${rr}$ cm, cari $OA$ dan $AB$ ($AB$ melalui $O$).`)][k]), fig, a: k === 2 ? T(`$OA = ${rr}$ cm ; $AB = ${2 * rr}$ cm`) : T(`${2 * rr} cm`), w: W(T(`$OC$ is a radius, so the radius is ${rr} cm and $OA = OB = ${rr}$ cm.`, `$OC$ ialah jejari, maka jejarinya ${rr} cm dan $OA = OB = ${rr}$ cm.`), `$AB = 2 \\times ${rr} = ${2 * rr}$ cm`), sp: 's' };
    },
    (r) => {
      const kind = r.pick(['radius', 'diameter', 'chord', 'sector', 'segment', 'arc']), t = r.int(0, 2);
      const D2 = { radius: ['A line from the centre to the circumference.', 'Garis dari pusat ke lilitan.'], diameter: ['A chord through the centre.', 'Perentas yang melalui pusat.'], chord: ['A line joining two points on the circle.', 'Garis yang menyambung dua titik pada bulatan.'], sector: ['A region bounded by two radii and an arc.', 'Kawasan yang dibatasi oleh dua jejari dan satu lengkok.'], segment: ['A region bounded by a chord and an arc.', 'Kawasan yang dibatasi oleh satu perentas dan satu lengkok.'], arc: ['A part of the circumference.', 'Sebahagian daripada lilitan.'] };
      const others = r.sample(Object.keys(D2).filter((x) => x !== kind), 3), opts = r.shuffle([kind].concat(others)), idx = opts.indexOf(kind);
      const txt = '<br>' + opts.map((o, i) => `${'ABCD'[i]}. ${PARTS[o][0]}`).join('&emsp;'), txtm = '<br>' + opts.map((o, i) => `${'ABCD'[i]}. ${PARTS[o][1]}`).join('&emsp;');
      return { q: T(`Which term matches the description "${D2[kind][0]}"?${txt}`, `Istilah manakah yang sepadan dengan keterangan "${D2[kind][1]}"?${txtm}`), a: T(`${'ABCD'[idx]}. ${PARTS[kind][0]}`, `${'ABCD'[idx]}. ${PARTS[kind][1]}`), w: W(T(`${cap(PARTS[kind][0])}: ${D2[kind][0]}`, `${cap(PARTS[kind][1])}: ${D2[kind][1]}`)), sp: 'xs' };
    },
    (r) => {
      const R = r.int(2, 15), v = r.int(0, 3);
      return { q: [T(`What is the length of the longest chord in a circle of radius ${R} cm?`, `Apakah panjang perentas terpanjang dalam sebuah bulatan berjejari ${R} cm?`), T(`A circle has radius ${R} cm. Is it possible to draw a chord of length ${2 * R + 2} cm in it? Explain.`, `Sebuah bulatan mempunyai jejari ${R} cm. Adakah mungkin melukis perentas sepanjang ${2 * R + 2} cm di dalamnya? Terangkan.`), T(`Chord $AB$ has length ${2 * R} cm in a circle of radius ${R} cm. What can you say about $AB$?`, `Perentas $AB$ mempunyai panjang ${2 * R} cm dalam sebuah bulatan berjejari ${R} cm. Apakah yang dapat anda katakan tentang $AB$?`), T(`Find the length of the longest chord in a circle whose diameter is ${2 * R} cm.`, `Cari panjang perentas terpanjang dalam sebuah bulatan yang diameternya ${2 * R} cm.`)][v], a: v === 0 ? T(`${2 * R} cm`) : v === 1 ? T(`No. The longest chord is the diameter, ${2 * R} cm.`, `Tidak. Perentas terpanjang ialah diameter, ${2 * R} cm.`) : v === 2 ? T(`It is a diameter (it passes through the centre).`, `Ia ialah diameter (ia melalui pusat).`) : T(`${2 * R} cm`), w: W(T(`The longest chord of a circle is the diameter, because it is the only chord through the centre.`, `Perentas terpanjang sebuah bulatan ialah diameter, kerana ia satu-satunya perentas yang melalui pusat.`), `$d = 2 \\times ${R} = ${2 * R}$ cm`, ...(v === 1 ? [T(`$${2 * R + 2} > ${2 * R}$, so no such chord exists.`, `$${2 * R + 2} > ${2 * R}$, maka perentas itu tidak wujud.`)] : v === 2 ? [T(`$AB = ${2 * R}$ cm is exactly the diameter, so $AB$ passes through $O$.`, `$AB = ${2 * R}$ cm ialah tepat diameter, maka $AB$ melalui $O$.`)] : [])), sp: 's' };
    },
    (r) => {
      const t = r.int(0, 7), R = r.int(3, 12), th = r.pick([30, 45, 60, 90, 120]);
      const Q = [
        ['Which instrument is needed to draw a circle of radius 5 cm: a ruler only, a protractor only or a pair of compasses with a ruler?', 'Alat manakah yang diperlukan untuk melukis bulatan berjejari 5 cm: pembaris sahaja, protraktor sahaja atau jangka lukis bersama pembaris?', 'A pair of compasses (set to 5 cm using the ruler).', 'Jangka lukis (ditetapkan pada 5 cm dengan pembaris).'],
        [`Which instruments are needed to construct a sector with radius ${R} cm and angle $${th}^\\circ$?`, `Alat manakah yang diperlukan untuk membina sektor berjejari ${R} cm dan bersudut $${th}^\\circ$?`, 'A ruler (or compasses) for the radii and arc, and a protractor for the angle.', 'Pembaris (atau jangka lukis) untuk jejari dan lengkok, dan protraktor untuk sudut.'],
        [`Which instrument sets the length ${R} cm when constructing a chord of that length on a circle?`, `Alat manakah yang menetapkan panjang ${R} cm semasa membina perentas sepanjang itu pada bulatan?`, 'The pair of compasses, set against the ruler.', 'Jangka lukis, ditetapkan menggunakan pembaris.'],
        [`A student needs a diameter through a point $P$ on a circle whose centre $O$ is known. Which single tool is enough to draw it?`, `Seorang murid memerlukan diameter melalui titik $P$ pada bulatan yang pusat $O$ nya diketahui. Alat tunggal manakah yang mencukupi untuk melukisnya?`, 'A ruler: draw the line from $P$ through $O$ to the other side.', 'Pembaris: lukis garis dari $P$ melalui $O$ ke sisi yang satu lagi.'],
        [`How many measurements (lengths or angles) are needed to construct a circle?`, `Berapakah bilangan ukuran (panjang atau sudut) yang diperlukan untuk membina sebuah bulatan?`, 'One: the radius (or the diameter).', 'Satu: jejari (atau diameter).'],
        [`How many measurements are needed to construct a sector of a circle?`, `Berapakah bilangan ukuran yang diperlukan untuk membina sektor sebuah bulatan?`, 'Two: the radius and the angle at the centre.', 'Dua: jejari dan sudut di pusat.'],
        [`What must be marked first before a circle can be drawn with compasses?`, `Apakah yang mesti ditanda dahulu sebelum bulatan boleh dilukis dengan jangka lukis?`, 'The centre $O$.', 'Pusat $O$.'],
        [`Which of these is not needed to construct a circle: the centre, the radius, the circumference?`, `Yang manakah antara ini tidak diperlukan untuk membina sebuah bulatan: pusat, jejari, lilitan?`, 'The circumference: it is drawn, not given.', 'Lilitan: ia dilukis, bukan diberi.'],
      ][t];
      return { q: T(Q[0], Q[1]), a: T(Q[2], Q[3]), w: W(T(`A circle is fixed by its centre and one length, the radius; an angle at the centre needs a protractor.`, `Bulatan ditentukan oleh pusatnya dan satu panjang, iaitu jejari; sudut di pusat memerlukan protraktor.`), T(Q[2], Q[3])), sp: 's' };
    },
  ];
  const CSTEP = {
    C1: (R) => [[`Set the compasses to a radius of ${R} cm using the ruler.`, `Tetapkan jangka lukis pada jejari ${R} cm menggunakan pembaris.`], [`Mark the centre $O$ with a point.`, `Tanda pusat $O$ dengan satu titik.`], [`Place the compass point on $O$ and draw the circle.`, `Letakkan hujung jangka lukis pada $O$ dan lukis bulatan.`]],
    C2: () => [[`Draw a circle with centre $O$ and mark a point $P$ on the circle.`, `Lukis bulatan berpusat $O$ dan tanda titik $P$ pada bulatan.`], [`Place the ruler along $PO$ and draw a line through $O$ that extends beyond $O$.`, `Letakkan pembaris di sepanjang $PO$ dan lukis garis melalui $O$ yang dipanjangkan melepasi $O$.`], [`Mark the point $Q$ where the line meets the circle again.`, `Tanda titik $Q$ di mana garis bertemu bulatan sekali lagi.`], [`$PQ$ is the diameter through $P$.`, `$PQ$ ialah diameter yang melalui $P$.`]],
    C3: (R, c) => [[`Draw a circle of radius ${R} cm with centre $O$ and mark a point $A$ on it.`, `Lukis bulatan berjejari ${R} cm berpusat $O$ dan tanda titik $A$ padanya.`], [`Set the compasses to ${c} cm, the required length of the chord.`, `Tetapkan jangka lukis pada ${c} cm, panjang perentas yang diperlukan.`], [`With the compass point on $A$, draw an arc that cuts the circle at $B$.`, `Dengan hujung jangka lukis pada $A$, lukis satu lengkok yang memotong bulatan di $B$.`], [`Join $A$ and $B$ with a ruler; $AB = ${c}$ cm.`, `Sambungkan $A$ dan $B$ dengan pembaris; $AB = ${c}$ cm.`]],
    C4: (R, th) => [[`Draw a line $OA$ of length ${R} cm.`, `Lukis garis $OA$ sepanjang ${R} cm.`], [`Place the protractor at $O$ and mark an angle of $${th}^\\circ$ from $OA$.`, `Letakkan protraktor di $O$ dan tanda sudut $${th}^\\circ$ daripada $OA$.`], [`Draw $OB$ of length ${R} cm along this direction.`, `Lukis $OB$ sepanjang ${R} cm mengikut arah ini.`], [`With centre $O$ and radius ${R} cm draw the arc $AB$.`, `Dengan pusat $O$ dan jejari ${R} cm lukis lengkok $AB$.`]],
  };
  const CNAME = { C1: ['a circle of a given radius', 'bulatan dengan jejari yang diberi'], C2: ['a diameter through a point on a circle whose centre is known', 'diameter melalui satu titik pada bulatan yang pusatnya diketahui'], C3: ['a chord of a given length through a point on a circle', 'perentas dengan panjang yang diberi melalui satu titik pada bulatan'], C4: ['a sector with a given radius and angle', 'sektor dengan jejari dan sudut yang diberi'] };
  function conArgs(r) {
    const key = r.pick(['C1', 'C2', 'C3', 'C4']), R = r.int(3, 8), c = r.int(3, 2 * R - 1), th = r.pick([30, 40, 45, 60, 72, 90, 120, 135]);
    return [key, key === 'C3' ? CSTEP.C3(R, c) : key === 'C4' ? CSTEP.C4(R, th) : key === 'C1' ? CSTEP.C1(R) : CSTEP.C2()];
  }
  const g51m = [
    (r) => {
      const [key, st] = conArgs(r), sh = shuffledSteps(r, st), v = r.int(0, 2);
      return { q: [T(`The steps for constructing ${CNAME[key][0]} are in the wrong order. Write the letters in the correct order.${sh.en}`, `Langkah untuk membina ${CNAME[key][1]} disusun dalam urutan yang salah. Tulis huruf mengikut urutan yang betul.${sh.ms}`), T(`Arrange the steps to construct ${CNAME[key][0]}.${sh.en}`, `Susun langkah untuk membina ${CNAME[key][1]}.${sh.ms}`), T(`Put these instructions for ${CNAME[key][0]} in order.${sh.en}`, `Susun arahan ini bagi ${CNAME[key][1]} mengikut turutan.${sh.ms}`)][v], a: T(sh.order), w: W(T(`Construct in order: set the tool to the given measurement, mark the fixed point, then draw and join.`, `Bina mengikut urutan: tetapkan alat pada ukuran yang diberi, tanda titik tetap, kemudian lukis dan sambungkan.`), T(`Correct order: ${sh.order}`, `Susunan yang betul: ${sh.order}`)), sp: 's' };
    },
    (r) => {
      const [key, st0] = conArgs(r), st = st0.slice(), pos = r.int(1, st.length - 1);
      const BADS = [[`Draw the arc with the compass point at the centre $O$ instead of at $A$.`, `Lukis lengkok dengan hujung jangka lukis di pusat $O$ dan bukan di $A$.`, 'the arc must be centred on $A$ to mark points at that distance from $A$'], [`Use the protractor at the end $A$ instead of the centre $O$.`, `Gunakan protraktor di hujung $A$ dan bukan di pusat $O$.`, 'the angle of a sector is measured at the centre $O$'], [`Choose the compass setting at random.`, `Pilih tetapan jangka lukis secara rawak.`, 'the setting must equal the required length']];
      const b = r.pick(BADS), orig = st[pos];
      st[pos] = [b[0], b[1]];
      return { q: T(`One of the steps for constructing ${CNAME[key][0]} is incorrect. Find it and correct it.<br>${st.map((x, i) => `${i + 1}. ${x[0]}`).join('<br>')}`, `Satu langkah untuk membina ${CNAME[key][1]} adalah salah. Cari dan betulkannya.<br>${st.map((x, i) => `${i + 1}. ${x[1]}`).join('<br>')}`), a: T(`Step ${pos + 1} is wrong. Correct step: ${orig[0]}`, `Langkah ${pos + 1} salah. Langkah yang betul: ${orig[1]}`), w: W(T(`Check each step: the compass setting must equal the required length, the compass point must sit on the point the distance is measured from, and the angle of a sector is measured at the centre $O$.`, `Semak setiap langkah: tetapan jangka lukis mesti sama dengan panjang yang diperlukan, hujung jangka lukis mesti berada pada titik yang jaraknya diukur, dan sudut sektor diukur di pusat $O$.`), T(`Step ${pos + 1} breaks this, so it should read: ${orig[0]}`, `Langkah ${pos + 1} melanggarnya, maka ia sepatutnya berbunyi: ${orig[1]}`)), sp: 's' };
    },
    (r) => {
      const [key, st] = conArgs(r), pos = r.int(1, st.length - 2);
      return { q: T(`Fill in the missing step ${pos + 1} in the construction of ${CNAME[key][0]}.<br>${st.map((x, i) => `${i + 1}. ${i === pos ? '____________' : x[0]}`).join('<br>')}`, `Isi langkah ${pos + 1} yang tertinggal dalam pembinaan ${CNAME[key][1]}.<br>${st.map((x, i) => `${i + 1}. ${i === pos ? '____________' : x[1]}`).join('<br>')}`), a: T(st[pos][0], st[pos][1]), w: W(T(`Look at what step ${pos} has produced and what step ${pos + 2} needs.`, `Lihat apa yang dihasilkan oleh langkah ${pos} dan apa yang diperlukan oleh langkah ${pos + 2}.`), T(`Missing step: ${st[pos][0]}`, `Langkah yang tertinggal: ${st[pos][1]}`)), sp: 's' };
    },
    (r) => {
      const R = r.int(3, 12), c = r.int(2, 2 * R - 1), v = r.int(0, 2), th = 60;
      return { q: [T(`$OA$ and $OB$ are radii of a circle of radius ${R} cm and $AB$ is a chord of ${c} cm. Find the perimeter of triangle $OAB$.`, `$OA$ dan $OB$ ialah jejari bulatan berjejari ${R} cm dan $AB$ ialah perentas ${c} cm. Cari perimeter segi tiga $OAB$.`), T(`A chord $AB$ of length ${c} cm is drawn in a circle with centre $O$ and radius ${R} cm. What type of triangle is $OAB$? Find $OA + OB + AB$.`, `Perentas $AB$ sepanjang ${c} cm dilukis dalam bulatan berpusat $O$ dan berjejari ${R} cm. Apakah jenis segi tiga $OAB$? Cari $OA + OB + AB$.`), T(`The compasses are set to ${R} cm. A circle is drawn with centre $O$ and the compass point is then moved to a point $A$ on the circle to draw an arc cutting the circle at $B$. What is the length $AB$?`.replace('What is the length $AB$?', 'What is the length of the chord $AB$, and what is the type of triangle $OAB$?'), `Jangka lukis ditetapkan pada ${R} cm. Bulatan dilukis berpusat $O$ dan hujung jangka lukis kemudian dialihkan ke titik $A$ pada bulatan untuk melukis lengkok yang memotong bulatan di $B$. Berapakah panjang perentas $AB$, dan apakah jenis segi tiga $OAB$?`)][v], a: v === 2 ? T(`$AB = ${R}$ cm; equilateral triangle`, `$AB = ${R}$ cm; segi tiga sama sisi`) : v === 1 ? T(`Isosceles; ${2 * R + c} cm`, `Sama kaki; ${2 * R + c} cm`) : T(`${2 * R + c} cm`), w: W(T(`$OA$ and $OB$ are radii of the same circle, so $OA = OB$ and triangle $OAB$ is isosceles.`, `$OA$ dan $OB$ ialah jejari bulatan yang sama, maka $OA = OB$ dan segi tiga $OAB$ ialah segi tiga sama kaki.`), v === 2 ? T(`The compasses stayed at ${R} cm, so $AB = ${R}$ cm as well: all three sides are equal.`, `Jangka lukis kekal pada ${R} cm, maka $AB = ${R}$ cm juga: ketiga-tiga sisi sama panjang.`) : `$${R} + ${R} + ${c} = ${2 * R + c}$ cm`), sp: 's' };
    },
    (r) => {
      const R = r.int(4, 20), rr = r.int(1, R - 2), v = r.int(0, 2);
      return { q: [T(`Two circles have the same centre $O$, with radii ${R} cm and ${rr} cm. Find the width of the ring between them.`, `Dua bulatan mempunyai pusat $O$ yang sama, dengan jejari ${R} cm dan ${rr} cm. Cari lebar gelang di antara kedua-duanya.`), T(`A circular pond of radius ${rr} m is surrounded by a path of width ${R - rr} m. Find the diameter of the outer edge of the path.`, `Sebuah kolam bulat berjejari ${rr} m dikelilingi laluan selebar ${R - rr} m. Cari diameter pinggir luar laluan itu.`), T(`Concentric circles have diameters ${2 * R} cm and ${2 * rr} cm. Find the difference between their radii.`, `Bulatan sepusat mempunyai diameter ${2 * R} cm dan ${2 * rr} cm. Cari beza antara jejari kedua-duanya.`)][v], a: T(v === 0 ? `${R - rr} cm` : v === 1 ? `${2 * R} m` : `${R - rr} cm`), w: W(T(`The two circles share a centre, so the ring is the difference of the radii.`, `Kedua-dua bulatan berkongsi pusat, maka gelang itu ialah beza jejari.`), v === 1 ? `$${rr} + ${R - rr} = ${R}$ cm, $d = 2 \\times ${R} = ${2 * R}$ cm` : `$${R} - ${rr} = ${R - rr}$ cm`), sp: 's' };
    },
    (r) => {
      const d = r.pick([4, 5, 6, 8, 10, 12]), rowN = r.int(3, 9), v = r.int(0, 2), c = r.pick([['a coin', 'sekeping duit syiling'], ['a bottle cap', 'sebiji penutup botol'], ['a button', 'sebutir butang'], ['a biscuit', 'sekeping biskut']]);
      return { q: [T(`${rowN} identical circular discs, each of diameter ${d} cm, are placed in a straight row so that neighbouring discs touch. Find the length of the row.`, `${rowN} cakera bulat yang serupa, setiap satu berdiameter ${d} cm, diletakkan dalam satu baris lurus supaya cakera bersebelahan bersentuhan. Cari panjang baris itu.`), T(`How many circles of radius ${d / 2} cm can be placed in a straight row along a line of length ${d * rowN} cm if neighbouring circles touch?`, `Berapakah bilangan bulatan berjejari ${d / 2} cm yang boleh diletakkan dalam satu baris lurus di sepanjang garis ${d * rowN} cm jika bulatan bersebelahan bersentuhan?`), T(`${cap(c[0])} has radius ${d / 2} cm. How many such items can fit in a row along a shelf ${d * rowN} cm long?`, `${cap(c[1])} mempunyai jejari ${d / 2} cm. Berapakah bilangan barang sebegini yang muat dalam satu baris di sepanjang rak ${d * rowN} cm?`)][v], a: v === 0 ? T(`${d * rowN} cm`) : T(`${rowN}`), w: W(T(`Each disc takes up one diameter along the row.`, `Setiap cakera mengambil satu diameter di sepanjang baris itu.`), v === 0 ? `$${rowN} \\times ${d} = ${d * rowN}$ cm` : `$${d * rowN} \\div ${d} = ${rowN}$`), sp: 's' };
    },
    (r) => {
      const th = r.pick([30, 45, 60, 72, 90, 120, 180, 40, 36, 24, 20, 15, 10]), v = r.int(0, 3);
      const nm = th === 90 ? ['quadrant', 'sukuan bulatan'] : th === 180 ? ['semicircle', 'semibulatan'] : ['sector', 'sektor'];
      return { q: [T(`How many sectors with an angle of $${th}^\\circ$ at the centre make a complete circle?`, `Berapakah bilangan sektor bersudut $${th}^\\circ$ di pusat yang membentuk satu bulatan lengkap?`), T(`A circular cake is cut into equal sectors, each with an angle of $${th}^\\circ$ at the centre. How many slices are there?`, `Sebiji kek bulat dipotong kepada sektor yang sama, setiap satu bersudut $${th}^\\circ$ di pusat. Berapakah bilangan hirisan?`), T(`A sector has a centre angle of $${th}^\\circ$. What fraction of the whole circle is it? What is it called if it is special?`, `Sebuah sektor mempunyai sudut pusat $${th}^\\circ$. Berapakah pecahan bulatan penuh yang diwakilinya? Apakah namanya jika ia istimewa?`), T(`A circle is divided into sectors of $${th}^\\circ$. Find the size of the angle left over if the sectors are cut one after the other until no more fit.`, `Sebuah bulatan dibahagikan kepada sektor $${th}^\\circ$. Cari saiz sudut yang berbaki jika sektor dipotong satu demi satu sehingga tiada lagi yang muat.`)][v], a: v === 0 || v === 1 ? T(`${n(360 / th)}`) : v === 2 ? T(`$\\dfrac{${th / gcd(th, 360)}}{${360 / gcd(th, 360)}}$; ${th === 90 || th === 180 ? nm[0] : 'a sector'}`, `$\\dfrac{${th / gcd(th, 360)}}{${360 / gcd(th, 360)}}$; ${th === 90 || th === 180 ? nm[1] : 'sektor'}`) : T(`$${D(360 - Math.floor(360 / th) * th)}$`), w: W(T(`The angles at the centre must fill one full turn, $360^\\circ$.`, `Sudut di pusat mesti memenuhi satu putaran penuh, $360^\\circ$.`), v === 3 ? `$${Math.floor(360 / th)} \\times ${th} = ${Math.floor(360 / th) * th}$, $360 - ${Math.floor(360 / th) * th} = ${360 - Math.floor(360 / th) * th}$` : v === 2 ? `$\\dfrac{${th}}{360} = \\dfrac{${th / gcd(th, 360)}}{${360 / gcd(th, 360)}}$` : `$360 \\div ${th} = ${n(360 / th)}$`), sp: 's' };
    },
    (r) => {
      const rows = r.sample([3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15], 4), col = r.int(0, 1);
      const cells = rows.map((x, i) => (i < 2 ? (col ? [`${x}`, '?'] : ['?', `${2 * x}`]) : (col ? [`?`, `${2 * x}`] : [`${x}`, '?'])));
      const asw = rows.map((x, i) => (i < 2 ? (col ? `$d = ${2 * x}$ cm` : `$r = ${x}$ cm`) : (col ? `$r = ${x}$ cm` : `$d = ${2 * x}$ cm`)));
      return { q: T(`Complete the table of radii and diameters of some circles (all in cm).<br>${SPM.table(cells, { head: ['Radius $r$', 'Diameter $d$'] })}`, `Lengkapkan jadual jejari dan diameter beberapa bulatan (semuanya dalam cm).<br>${SPM.table(cells, { head: ['Jejari $r$', 'Diameter $d$'] })}`), a: T(asw.join(' ; ')), w: W(T(`$d = 2r$ and $r = d \\div 2$`, `$d = 2r$ dan $r = d \\div 2$`), ...rows.map((x, i) => ((i < 2 ? col : !col) ? `$d = 2 \\times ${x} = ${2 * x}$` : `$r = ${2 * x} \\div 2 = ${x}$`))), sp: 'm' };
    },
    (r) => {
      const v = r.int(0, 3);
      const Q = [
        ['Why must the compass be kept at the same setting while drawing a circle?', 'Mengapa jangka lukis mesti dikekalkan pada tetapan yang sama semasa melukis bulatan?', 'All points on a circle are the same distance (the radius) from the centre.', 'Semua titik pada bulatan adalah sama jarak (jejari) dari pusat.'],
        ['Explain why the centre of the circle must be marked before the circle is drawn.', 'Terangkan mengapa pusat bulatan mesti ditanda sebelum bulatan dilukis.', 'The compass point is placed on the centre; the pencil then traces all points at the radius from it.', 'Hujung jangka lukis diletakkan pada pusat; pensel kemudian menjejak semua titik pada jarak jejari darinya.'],
        ['When constructing a sector, why is the angle measured at the centre $O$ and not on the arc?', 'Semasa membina sektor, mengapa sudut diukur di pusat $O$ dan bukan pada lengkok?', 'A sector is bounded by two radii which meet at $O$; the angle between them is at $O$.', 'Sektor dibatasi oleh dua jejari yang bertemu di $O$; sudut antaranya ialah di $O$.'],
        ['To draw a chord of a given length from a point $A$ on the circle, the compass point is placed on $A$. Why?', 'Untuk melukis perentas dengan panjang yang diberi dari titik $A$ pada bulatan, hujung jangka lukis diletakkan pada $A$. Mengapa?', 'Every point at the given distance from $A$ lies on the arc; where it cuts the circle gives the other end $B$.', 'Setiap titik pada jarak yang diberi dari $A$ terletak pada lengkok; tempat ia memotong bulatan memberi hujung $B$ yang lain.'],
      ][v];
      return { q: T(Q[0], Q[1]), a: T(Q[2], Q[3]), w: W(T(`Every point of a circle is the same distance — one radius — from the centre.`, `Setiap titik bulatan berada pada jarak yang sama — satu jejari — dari pusat.`), T(Q[2], Q[3])), sp: 's' };
    },
    (r) => {
      const a = r.int(3, 20), b = r.int(3, 20), v = r.int(0, 3);
      need(a !== 2 * b && b !== 2 * a && a !== b);
      const bigger = a > b;
      return { q: [T(`Circle $A$ has a radius of ${a} cm and circle $B$ has a diameter of ${b} cm. Which circle is bigger?`, `Bulatan $A$ berjejari ${a} cm dan bulatan $B$ berdiameter ${b} cm. Bulatan manakah lebih besar?`), T(`Circle $P$ has a diameter of ${a} cm and circle $Q$ has a radius of ${b} cm. Which circle is larger and by how much is its diameter greater?`, `Bulatan $P$ berdiameter ${a} cm dan bulatan $Q$ berjejari ${b} cm. Bulatan manakah lebih besar dan berapa lebihkah diameternya?`), T(`Compare the diameters of a circle of radius ${a} cm and a circle of diameter ${b} cm.`, `Bandingkan diameter bulatan berjejari ${a} cm dengan bulatan berdiameter ${b} cm.`), T(`Ali draws a circle with radius ${a} cm and Siti draws one with diameter ${b} cm. Whose circle is smaller?`, `Ali melukis bulatan berjejari ${a} cm dan Siti melukis bulatan berdiameter ${b} cm. Bulatan siapakah lebih kecil?`)][v], a: v === 0 ? T(`$A$ has diameter ${2 * a} cm and $B$ has ${b} cm; ${2 * a > b ? '$A$' : '$B$'} is bigger.`, `$A$ berdiameter ${2 * a} cm dan $B$ ${b} cm; ${2 * a > b ? '$A$' : '$B$'} lebih besar.`) : v === 1 ? (a > 2 * b ? T(`$P$ is larger: ${a} cm against ${2 * b} cm, by ${a - 2 * b} cm.`, `$P$ lebih besar: ${a} cm berbanding ${2 * b} cm, iaitu ${a - 2 * b} cm lebih.`) : T(`$Q$ is larger: ${2 * b} cm against ${a} cm, by ${2 * b - a} cm.`, `$Q$ lebih besar: ${2 * b} cm berbanding ${a} cm, iaitu ${2 * b - a} cm lebih.`)) : v === 2 ? T(`${2 * a} cm and ${b} cm`) : T(`${2 * a < b ? 'Ali' : 'Siti'} (diameters ${2 * a} cm and ${b} cm)`, `${2 * a < b ? 'Ali' : 'Siti'} (diameter ${2 * a} cm dan ${b} cm)`), w: W(T(`Compare like with like: change every radius into a diameter first.`, `Bandingkan perkara yang sama: tukar setiap jejari kepada diameter dahulu.`), v === 1 ? `$2 \\times ${b} = ${2 * b}$ cm` : `$2 \\times ${a} = ${2 * a}$ cm`, v === 1 ? (a > 2 * b ? `$${a} - ${2 * b} = ${a - 2 * b}$ cm` : `$${2 * b} - ${a} = ${2 * b - a}$ cm`) : T(`Now compare $${2 * a}$ cm with $${b}$ cm.`, `Kini bandingkan $${2 * a}$ cm dengan $${b}$ cm.`)), sp: 's' };
    },
  ];
  const g51a = [
    (r) => {
      const s = r.int(4, 20), v = r.int(0, 3), R = s / 2;
      return { q: [T(`The largest possible circle is drawn inside a square of side ${s} cm. Find its radius and diameter.`, `Bulatan terbesar yang mungkin dilukis di dalam sebuah segi empat sama bersisi ${s} cm. Cari jejari dan diameternya.`), T(`A circle just touches all four sides of a square. The diameter of the circle is ${s} cm. Find the side of the square and the radius of the circle.`, `Sebuah bulatan menyentuh keempat-empat sisi sebuah segi empat sama. Diameter bulatan ialah ${s} cm. Cari sisi segi empat sama itu dan jejari bulatan.`), T(`A square is drawn round a circle of radius ${R} cm so that each side touches the circle. Find the perimeter of the square.`, `Sebuah segi empat sama dilukis mengelilingi bulatan berjejari ${R} cm supaya setiap sisi menyentuh bulatan. Cari perimeter segi empat sama itu.`), T(`A circular lid has radius ${R} cm. It fits exactly into a square box. Find the side of the box and the perimeter of the square base.`, `Sebuah penutup bulat berjejari ${R} cm. Ia muat tepat dalam sebuah kotak segi empat sama. Cari sisi kotak itu dan perimeter tapak segi empat sama.`)][v], a: v === 0 ? T(`radius ${R} cm; diameter ${s} cm`, `jejari ${R} cm; diameter ${s} cm`) : v === 1 ? T(`side ${s} cm; radius ${R} cm`, `sisi ${s} cm; jejari ${R} cm`) : v === 2 ? T(`${4 * s} cm`) : T(`side ${s} cm; ${4 * s} cm`, `sisi ${s} cm; ${4 * s} cm`), w: T(`The diameter of the circle equals the side of the square.`, `Diameter bulatan sama dengan sisi segi empat sama.`), sp: 's' };
    },
    (r) => {
      const w = r.pick([12, 16, 20, 24, 30]), l = r.pick([36, 48, 60, 72, 90]), d = r.pick([4, 6, 8, 12]), v = r.int(0, 1);
      need(w % d === 0 && l % d === 0 && w !== l);
      return { q: v === 0 ? T(`Circular discs of diameter ${d} cm are cut from a rectangular sheet ${l} cm by ${w} cm, arranged in rows and columns with no gaps. How many discs can be cut?`, `Cakera bulat berdiameter ${d} cm dipotong daripada kepingan segi empat tepat ${l} cm kali ${w} cm, disusun dalam baris dan lajur tanpa jurang. Berapakah bilangan cakera yang boleh dipotong?`) : T(`A rectangular tray ${l} cm by ${w} cm holds round cookies of radius ${d / 2} cm placed in a grid so that neighbours touch. How many cookies fit?`, `Sebuah dulang segi empat tepat ${l} cm kali ${w} cm memuatkan biskut bulat berjejari ${d / 2} cm yang disusun dalam grid supaya jiran bersentuhan. Berapakah bilangan biskut yang muat?`), a: T(`${(l / d) * (w / d)}`), w: T(`$${l} \\div ${d} = ${l / d}$ per row; $${w} \\div ${d} = ${w / d}$ rows`, `$${l} \\div ${d} = ${l / d}$ setiap baris; $${w} \\div ${d} = ${w / d}$ baris`), sp: 's' };
    },
    (r) => {
      const R = r.int(4, 12), c = 2 * R + r.pick([1, 2, 3]), v = r.int(0, 2);
      return { q: [T(`Hafiz wants to draw a chord $AB$ of length ${c} cm in a circle of radius ${R} cm. Explain why this is impossible.`, `Hafiz mahu melukis perentas $AB$ sepanjang ${c} cm dalam bulatan berjejari ${R} cm. Terangkan mengapa ini mustahil.`), T(`Explain why no chord of a circle with diameter ${2 * R} cm can be ${c} cm long.`, `Terangkan mengapa tiada perentas bagi bulatan berdiameter ${2 * R} cm yang boleh sepanjang ${c} cm.`), T(`A student sets compasses to ${c} cm to mark a chord from $A$ on a circle of radius ${R} cm, but the arc never meets the circle. Explain and state the largest setting that works.`, `Seorang murid menetapkan jangka lukis pada ${c} cm untuk menanda perentas dari $A$ pada bulatan berjejari ${R} cm, tetapi lengkok tidak bertemu bulatan. Terangkan dan nyatakan tetapan terbesar yang boleh digunakan.`)][v], a: T(`The longest chord is the diameter, ${2 * R} cm, and ${c} cm is longer than that.${v === 2 ? ` The largest setting is ${2 * R} cm.` : ''}`, `Perentas terpanjang ialah diameter, ${2 * R} cm, dan ${c} cm lebih panjang daripada itu.${v === 2 ? ` Tetapan terbesar ialah ${2 * R} cm.` : ''}`), w: W(T(`The longest chord of a circle is its diameter.`, `Perentas terpanjang sebuah bulatan ialah diameternya.`), `$d = 2 \\times ${R} = ${2 * R}$ cm`, `$${c} > ${2 * R}$`, T(`So no chord of ${c} cm can be drawn${v === 2 ? `; the largest possible setting is ${2 * R} cm.` : '.'}`, `Maka tiada perentas ${c} cm boleh dilukis${v === 2 ? `; tetapan terbesar yang mungkin ialah ${2 * R} cm.` : '.'}`)), sp: 's' };
    },
    (r) => {
      const R = r.int(3, 10), v = r.int(0, 3), th = r.pick([60, 72, 90, 120, 45, 40, 30, 36]);
      const st = CSTEP.C4(R, th);
      return { q: [T(`Write down the steps to construct a sector of radius ${R} cm and angle $${th}^\\circ$, and state where each tool is used.`, `Tuliskan langkah untuk membina sektor berjejari ${R} cm dan bersudut $${th}^\\circ$, dan nyatakan di mana setiap alat digunakan.`), T(`Describe how to construct the sector $AOB$ with $OA = OB = ${R}$ cm and $\\angle AOB = ${th}^\\circ$.`, `Huraikan cara membina sektor $AOB$ dengan $OA = OB = ${R}$ cm dan $\\angle AOB = ${th}^\\circ$.`), T(`A pie chart slice is a sector of radius ${R} cm and angle $${th}^\\circ$. List the construction steps.`, `Satu hirisan carta pai ialah sektor berjejari ${R} cm dan bersudut $${th}^\\circ$. Senaraikan langkah pembinaan.`), T(`Construct (describe) a sector with radius ${R} cm and angle $${th}^\\circ$. What fraction of the whole circle is the sector?`, `Bina (huraikan) sektor berjejari ${R} cm dan bersudut $${th}^\\circ$. Berapakah pecahan bulatan penuh yang diwakili sektor itu?`)][v], a: T(st.map((x, i) => `${i + 1}. ${x[0]}`).join('<br>') + (v === 3 ? `<br>Fraction $= \\dfrac{${th / gcd(th, 360)}}{${360 / gcd(th, 360)}}$` : ''), st.map((x, i) => `${i + 1}. ${x[1]}`).join('<br>') + (v === 3 ? `<br>Pecahan $= \\dfrac{${th / gcd(th, 360)}}{${360 / gcd(th, 360)}}$` : '')), w: W(T(`A sector needs two measurements: the radius ${R} cm (ruler or compasses) and the angle $${th}^\\circ$ at the centre (protractor).`, `Sektor memerlukan dua ukuran: jejari ${R} cm (pembaris atau jangka lukis) dan sudut $${th}^\\circ$ di pusat (protraktor).`), T(`Draw $OA$, measure the angle at $O$, draw $OB$ of the same length, then draw the arc $AB$ with centre $O$.`, `Lukis $OA$, ukur sudut di $O$, lukis $OB$ sepanjang yang sama, kemudian lukis lengkok $AB$ berpusat $O$.`), ...(v === 3 ? [`$\\dfrac{${th}}{360} = \\dfrac{${th / gcd(th, 360)}}{${360 / gcd(th, 360)}}$`] : [])), sp: 'xl' };
    },
    (r) => {
      const R = r.int(3, 9), c = r.int(3, 2 * R - 1), v = r.int(0, 2);
      const st = CSTEP.C3(R, c);
      return { q: [T(`Describe how to construct a chord $AB$ of length ${c} cm through the point $A$ on a circle of radius ${R} cm.`, `Huraikan cara membina perentas $AB$ sepanjang ${c} cm melalui titik $A$ pada bulatan berjejari ${R} cm.`), T(`Give the construction steps for a chord of ${c} cm from a given point on the circumference of a circle of radius ${R} cm. Explain the step that fixes the chord length.`, `Berikan langkah pembinaan perentas ${c} cm dari satu titik pada lilitan bulatan berjejari ${R} cm. Terangkan langkah yang menentukan panjang perentas.`), T(`Construct a circle of radius ${R} cm and a chord of length ${c} cm. Then measure the distance from the centre to the chord (perpendicular). State which tool you use for each step.`, `Bina bulatan berjejari ${R} cm dan perentas sepanjang ${c} cm. Kemudian ukur jarak dari pusat ke perentas (serenjang). Nyatakan alat yang digunakan bagi setiap langkah.`)][v], a: T(st.map((x, i) => `${i + 1}. ${x[0]}`).join('<br>'), st.map((x, i) => `${i + 1}. ${x[1]}`).join('<br>')), w: W(T(`The chord length is fixed by the compass setting: ${c} cm, with the compass point on $A$.`, `Panjang perentas ditentukan oleh tetapan jangka lukis: ${c} cm, dengan hujung jangka lukis pada $A$.`), T(`The arc of radius ${c} cm about $A$ meets the circle at $B$, so $AB = ${c}$ cm.`, `Lengkok berjejari ${c} cm berpusat $A$ bertemu bulatan di $B$, maka $AB = ${c}$ cm.`), T(`This works because ${c} cm is less than the diameter ${2 * R} cm.`, `Ini berjaya kerana ${c} cm kurang daripada diameter ${2 * R} cm.`)), sp: 'xl' };
    },
    (r) => {
      const d = r.pick([50, 60, 80, 100, 120]), v = r.int(0, 1), k = r.int(2, 5);
      const c = r.pick([CIRC_CTX[0], CIRC_CTX[8]]);
      return { q: v === 0 ? T(`${cap(c[0])} has a diameter of ${d} cm. What is the smallest square (side length) it can be placed in, and what is the perimeter of that square?`, `${cap(c[1])} berdiameter ${d} cm. Apakah sisi segi empat sama terkecil yang boleh memuatkannya, dan berapakah perimeter segi empat sama itu?`) : T(`${k} circles, each of radius ${d / 2} cm, touch in a straight line inside a rectangle that just contains them. Find the length and width of the rectangle.`, `${k} bulatan, setiap satu berjejari ${d / 2} cm, bersentuhan dalam satu garis lurus di dalam sebuah segi empat tepat yang tepat memuatkannya. Cari panjang dan lebar segi empat tepat itu.`), a: v === 0 ? T(`${d} cm; ${4 * d} cm`) : T(`length ${k * d} cm; width ${d} cm`, `panjang ${k * d} cm; lebar ${d} cm`), w: W(T(`The circle just fits when the side of the square equals the diameter.`, `Bulatan muat tepat apabila sisi segi empat sama bersamaan dengan diameter.`), v === 0 ? `$4 \\times ${d} = ${4 * d}$ cm` : `$${k} \\times ${d} = ${k * d}$ cm, $${d}$ cm`), sp: 's' };
    },
    (r) => {
      const R = r.int(5, 15), pt = r.int(1, R - 1), v = r.int(0, 1);
      return { q: v === 0 ? T(`$P$ is a point inside a circle of radius ${R} cm with centre $O$, and $OP = ${pt}$ cm. The chord through $P$ is the longest possible. State its length and name it.`, `$P$ ialah satu titik di dalam bulatan berjejari ${R} cm berpusat $O$, dan $OP = ${pt}$ cm. Perentas yang melalui $P$ adalah yang terpanjang. Nyatakan panjangnya dan namakannya.`) : T(`Through a point $P$ inside a circle of radius ${R} cm, ${pt} cm from the centre $O$, the diameter $AB$ is drawn. Find $AB$, $PA$ and $PB$ if $P$ lies between $O$ and $B$.`, `Melalui titik $P$ di dalam bulatan berjejari ${R} cm, ${pt} cm dari pusat $O$, diameter $AB$ dilukis. Cari $AB$, $PA$ dan $PB$ jika $P$ terletak di antara $O$ dan $B$.`), a: v === 0 ? T(`${2 * R} cm; the diameter`, `${2 * R} cm; diameter`) : T(`$AB = ${2 * R}$ cm; $PA = ${R + pt}$ cm; $PB = ${R - pt}$ cm`), w: W(T(`The longest chord through any interior point is the one through the centre — the diameter.`, `Perentas terpanjang melalui mana-mana titik dalaman ialah yang melalui pusat — diameter.`), `$AB = 2 \\times ${R} = ${2 * R}$ cm`, ...(v === 1 ? [`$PB = ${R} - ${pt} = ${R - pt}$ cm`, `$PA = ${R} + ${pt} = ${R + pt}$ cm`] : [])), sp: 's' };
    },
    (r) => {
      const d1 = r.pick([6, 8, 10, 12, 14]), d2 = r.pick([16, 18, 20, 24]), v = r.int(0, 2);
      return { q: [T(`A circle of diameter ${d1} cm is drawn with the same centre as a circle of radius ${d2 / 2} cm. What is the width of the ring between them?`, `Sebuah bulatan berdiameter ${d1} cm dilukis dengan pusat yang sama seperti bulatan berjejari ${d2 / 2} cm. Berapakah lebar gelang di antara kedua-duanya?`), T(`Two concentric circles have diameters ${d1} cm and ${d2} cm. A radius of the larger circle is drawn. What length of it lies outside the smaller circle?`, `Dua bulatan sepusat mempunyai diameter ${d1} cm dan ${d2} cm. Satu jejari bulatan yang lebih besar dilukis. Berapakah panjangnya yang terletak di luar bulatan yang lebih kecil?`), T(`A circular garden of diameter ${d1} m has a path of width 2 m around it. Find the diameter of the circle formed by the outer edge of the path.`, `Sebuah taman bulat berdiameter ${d1} m mempunyai laluan selebar 2 m di sekelilingnya. Cari diameter bulatan yang dibentuk oleh pinggir luar laluan itu.`)][v], a: v === 2 ? T(`${d1 + 4} m`) : T(`${(d2 - d1) / 2} cm`), w: W(T(`Work with radii: the ring is the difference of the two radii.`, `Gunakan jejari: gelang itu ialah beza dua jejari.`), v === 2 ? `$${d1} + 2 \\times 2 = ${d1 + 4}$ m` : `$${d2} \\div 2 - ${d1} \\div 2 = ${d2 / 2} - ${d1 / 2} = ${(d2 - d1) / 2}$ cm`), sp: 's' };
    },
    (r) => {
      const c = r.pick([CIRC_CTX[6], CIRC_CTX[7], CIRC_CTX[8]]), d = r.pick([20, 24, 30, 36, 40]), s = d + 2 * r.pick([2, 4, 5, 6, 8]), v = r.int(0, 2), g = (s - d) / 2;
      return { q: [T(`${cap(c[0])} of diameter ${d} cm is placed at the centre of a square board of side ${s} cm. Find the gap between the circle and each side of the board.`, `${cap(c[1])} berdiameter ${d} cm diletakkan di tengah papan segi empat sama bersisi ${s} cm. Cari jurang antara bulatan dengan setiap sisi papan.`), T(`${cap(c[0])} with radius ${d / 2} cm is centred on a square mat of side ${s} cm. How wide is the border of the mat that is not covered on each side?`, `${cap(c[1])} berjejari ${d / 2} cm diletakkan di tengah tikar segi empat sama bersisi ${s} cm. Berapakah lebar pinggir tikar yang tidak ditutup pada setiap sisi?`), T(`A square of side ${s} cm has ${c[0]} of diameter ${d} cm at its centre, and the square is to be cut to the smallest square that just holds it. By how much does each side shrink?`, `Sebuah segi empat sama bersisi ${s} cm mempunyai ${c[1]} berdiameter ${d} cm di tengahnya, dan segi empat sama itu dipotong kepada segi empat sama terkecil yang tepat memuatkannya. Berapa banyakkah setiap sisi berkurang?`)][v], a: T(v === 2 ? `${s - d} cm` : `${g} cm`), w: T(`$(${s} - ${d}) \\div 2$`), sp: 's' };
    },
    (r) => {
      const c = r.pick([CIRC_CTX[1], CIRC_CTX[6], CIRC_CTX[7]]), m = r.pick([2, 3, 4]), rr = r.int(2, 9), v = r.int(0, 3);
      return { q: [T(`The radius of a larger ${c[0].replace(/^an? /, '')} is ${m} times that of a smaller one, which has diameter ${2 * rr} cm. Find the diameter of the larger one.`, `Jejari ${c[1].replace(/^(sebuah|sebiji|seorang) /, '')} yang lebih besar ialah ${m} kali ganda jejari yang lebih kecil, yang berdiameter ${2 * rr} cm. Cari diameter yang lebih besar.`), T(`Circle $A$ has radius ${rr} cm. Circle $B$ has a diameter that is ${m} times the diameter of $A$. Find the radius of $B$.`, `Bulatan $A$ berjejari ${rr} cm. Bulatan $B$ mempunyai diameter ${m} kali ganda diameter $A$. Cari jejari $B$.`), T(`The diameters of two circles are ${2 * rr} cm and ${2 * rr * m} cm. How many times as long as the smaller radius is the larger radius?`, `Diameter dua bulatan ialah ${2 * rr} cm dan ${2 * rr * m} cm. Berapa kali gandakah jejari yang lebih besar berbanding jejari yang lebih kecil?`), T(`Two circles have radii ${rr} cm and ${m * rr} cm. Find the difference between their diameters.`, `Dua bulatan mempunyai jejari ${rr} cm dan ${m * rr} cm. Cari beza antara diameter kedua-duanya.`)][v], a: T(v === 0 ? `${2 * rr * m} cm` : v === 1 ? `${rr * m} cm` : v === 2 ? `${m}` : `${2 * rr * (m - 1)} cm`), w: W(T(`Doubling or tripling a radius does the same to the diameter, since $d = 2r$.`, `Menggandakan jejari melakukan perkara yang sama kepada diameter, kerana $d = 2r$.`), [`$${m} \\times ${2 * rr} = ${2 * rr * m}$ cm`, `$${m} \\times ${2 * rr} = ${2 * rr * m}$ cm, $r = ${2 * rr * m} \\div 2 = ${rr * m}$ cm`, `$${2 * rr * m} \\div ${2 * rr} = ${m}$`, `$${2 * rr * m} - ${2 * rr} = ${2 * rr * (m - 1)}$ cm`][v]), sp: 's' };
    },
    (r) => {
      const k = r.int(2, 6), d = r.pick([6, 8, 10, 12]), v = r.int(0, 1), c = r.pick(['coins', 'wheels', 'discs', 'plates']), cm = { coins: 'duit syiling', wheels: 'roda', discs: 'cakera', plates: 'pinggan' }[c];
      return { q: v === 0 ? T(`${k} ${c} of radius ${d / 2} cm are arranged in a line with each touching the next. A string is stretched along the top of the line from the left edge of the first to the right edge of the last. How long is the string?`, `${k} ${cm} berjejari ${d / 2} cm disusun dalam satu garis dengan setiap satu menyentuh yang seterusnya. Seutas tali dibentang di sepanjang bahagian atas garis itu dari tepi kiri yang pertama ke tepi kanan yang terakhir. Berapakah panjang tali itu?`) : T(`The distance from the centre of the first to the centre of the last of ${k} touching ${c} in a line is ${(k - 1) * d} cm. Find the diameter of each.`, `Jarak dari pusat yang pertama ke pusat yang terakhir bagi ${k} ${cm} yang bersentuhan dalam satu garis ialah ${(k - 1) * d} cm. Cari diameter setiap satu.`), a: T(`${v === 0 ? k * d : d} cm`), w: v === 1 ? W(T(`From the first centre to the last there are ${k - 1} gaps, each one diameter long.`, `Dari pusat pertama ke pusat terakhir terdapat ${k - 1} selang, setiap satu sepanjang satu diameter.`), `$${(k - 1) * d} \\div ${k - 1} = ${d}$ cm`) : W(T(`The string covers ${k} whole discs, each one diameter wide.`, `Tali itu meliputi ${k} cakera penuh, setiap satu selebar satu diameter.`), `$${k} \\times ${d} = ${k * d}$ cm`), sp: 's' };
    },
  ];
  /*END51*/
  SPM.extend('F2-5.1', { e: g51e, m: g51m, a: g51a });

  /* ======================================================= F2-5.2 Symmetrical properties of chords */
  const TRI = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [15, 20, 25], [7, 24, 25], [20, 21, 29], [10, 24, 26], [9, 40, 41], [12, 35, 37], [18, 24, 30], [15, 36, 39]];
  const tri = (r) => { const t = r.pick(TRI), sw = r.chance(); return sw ? [t[1], t[0], t[2]] : [t[0], t[1], t[2]]; }; // [h, d, R]
  /** circle with chord(s). o.chords: [{h, d, ang(deg, svg), n:['A','B','M'], lab:{AB, OM}, right, tick}], o.R, o.radius:['A'] draw OA, o.extC:{label} */
  function chFig(o) {
    const W = 260, H = 220, cx = 130, cy = 110, rp = 82, sc = rp / o.R;
    let out = S.circle(cx, cy, rp) + S.dot(cx, cy, 2.5) + S.text(cx - 9, cy - 9, 'O', { i: true });
    const feet = [];
    (o.chords || []).forEach((c, k) => {
      const th = rad(c.ang === undefined ? 90 : c.ang), u = [Math.cos(th), Math.sin(th)], t = [-u[1], u[0]];
      const M = [cx + c.d * sc * u[0], cy + c.d * sc * u[1]], A = [M[0] - c.h * sc * t[0], M[1] - c.h * sc * t[1]], B = [M[0] + c.h * sc * t[0], M[1] + c.h * sc * t[1]];
      out += S.line(A[0], A[1], B[0], B[1]);
      const nm = c.n || ['A', 'B', 'M'];
      out += S.dot(A[0], A[1], 2) + S.dot(B[0], B[1], 2);
      out += S.text(A[0] - 11 * t[0], A[1] - 11 * t[1], nm[0], { i: true }) + S.text(B[0] + 11 * t[0], B[1] + 11 * t[1], nm[1], { i: true });
      if (c.d > 0) {
        out += S.line(cx, cy, M[0], M[1]);
        out += S.text(M[0] - 7 * u[0] + 11 * t[0], M[1] - 7 * u[1] + 11 * t[1], nm[2], { i: true });
        if (c.right !== false) out += S.rightAngle(M, [cx, cy], B, 8);
      }
      if (c.lab && c.lab.AB) out += S.text(M[0] + 16 * u[0], M[1] + 16 * u[1], c.lab.AB, { s: 12 });
      if (c.lab && c.lab.OM) out += S.text(cx + c.d * sc * u[0] / 2 - 12 * t[0] * -1, cy + c.d * sc * u[1] / 2 + 12 * t[1] * -1, c.lab.OM, { s: 12 });
      if (c.tick) { out += S.tick(A, M, c.tick) + S.tick(M, B, c.tick); }
      if (o.radius) out += S.line(cx, cy, A[0], A[1]) + (c.lab && c.lab.OA ? S.text((cx + A[0]) / 2 - 8, (cy + A[1]) / 2 - 8, c.lab.OA, { s: 12 }) : '');
      feet.push({ M, A, B, u, t });
    });
    if (o.extC) {
      const f = feet[0], C = [cx + rp * f.u[0], cy + rp * f.u[1]];
      out += S.line(f.M[0], f.M[1], C[0], C[1]) + S.dot(C[0], C[1], 2) + S.text(C[0] + 10 * f.u[0], C[1] + 10 * f.u[1], 'C', { i: true });
      if (o.extC.label) out += S.text(f.M[0] + 10 * f.u[0] + 16 * f.t[0], f.M[1] + 10 * f.u[1] + 16 * f.t[1], o.extC.label, { s: 12 });
    }
    return S.wrap(W, H, out, 'chord');
  }
  const CH_CTX = [
    ['a circular window of radius', 'sebuah tingkap bulat berjejari', 'a horizontal bar', 'satu palang mendatar'], ['a round plate of radius', 'sebuah pinggan bulat berjejari', 'a straight crack', 'satu retakan lurus'],
    ['a circular pond of radius', 'sebuah kolam bulat berjejari', 'a wooden plank', 'sekeping papan kayu'], ['a circular mirror of radius', 'sebuah cermin bulat berjejari', 'a straight strip of tape', 'satu jalur pita lurus'],
    ['a round pizza of radius', 'sebiji piza bulat berjejari', 'a straight cut', 'satu potongan lurus'],
  ];
  const g52e = [
    (r) => {
      const [h, d, R] = tri(r), v = r.int(0, 3), ang = r.pick([90, 45, 135, 0, 180]);
      const fig = chFig({ R, chords: [{ h, d, ang, lab: { AB: `${2 * h} cm` } }] });
      return { q: nts([T(`$O$ is the centre of the circle and $OM \\perp AB$. If $AB = ${2 * h}$ cm, find $AM$.`, `$O$ ialah pusat bulatan dan $OM \\perp AB$. Jika $AB = ${2 * h}$ cm, cari $AM$.`), T(`In the diagram $OM$ is perpendicular to the chord $AB$ of a circle with centre $O$. Given $AB = ${2 * h}$ cm, find $MB$. Give the reason.`, `Dalam rajah $OM$ berserenjang dengan perentas $AB$ bagi bulatan berpusat $O$. Diberi $AB = ${2 * h}$ cm, cari $MB$. Berikan sebab.`), T(`A radius $OM$ is perpendicular to the chord $AB$, which has length ${2 * h} cm. Find the length $AM$.`, `Satu jejari $OM$ berserenjang dengan perentas $AB$ yang panjangnya ${2 * h} cm. Cari panjang $AM$.`), T(`The perpendicular from the centre $O$ meets the chord $AB = ${2 * h}$ cm at $M$. What is the length of $AM$? State the property used.`, `Garis serenjang dari pusat $O$ bertemu perentas $AB = ${2 * h}$ cm di $M$. Berapakah panjang $AM$? Nyatakan sifat yang digunakan.`)][v]), fig, a: T(`$AM = ${h}$ cm. The perpendicular from the centre bisects the chord.`, `$AM = ${h}$ cm. Serenjang dari pusat membahagi dua sama perentas.`), w: W(T(`The perpendicular from the centre of a circle to a chord bisects the chord.`, `Serenjang dari pusat bulatan ke perentas membahagi dua sama perentas itu.`), `$AM = MB = ${2 * h} \\div 2 = ${h}$ cm`), sp: 's' };
    },
    (r) => {
      const [h, d, R] = tri(r), v = r.int(0, 2), ang = r.pick([90, 0, 45, 225]);
      const fig = chFig({ R, chords: [{ h, d, ang, lab: { AB: '' }, tick: 1, right: false }] });
      return { q: nts([T(`In the circle with centre $O$, $M$ is the midpoint of the chord $AB$. Find $\\angle OMA$ and state the reason.`, `Dalam bulatan berpusat $O$, $M$ ialah titik tengah perentas $AB$. Cari $\\angle OMA$ dan nyatakan sebab.`), T(`The line $OM$ joins the centre $O$ to the midpoint $M$ of the chord $AB$. What is the size of the angle between $OM$ and $AB$?`, `Garis $OM$ menyambung pusat $O$ dengan titik tengah $M$ perentas $AB$. Berapakah saiz sudut antara $OM$ dan $AB$?`), T(`$M$ is the midpoint of the chord $AB$ (see the tick marks). Explain why $OM$ is perpendicular to $AB$.`, `$M$ ialah titik tengah perentas $AB$ (lihat tanda pada rajah). Terangkan mengapa $OM$ berserenjang dengan $AB$.`)][v]), fig, a: v === 2 ? T(`A line from the centre to the midpoint of a chord is perpendicular to the chord (converse of the bisecting property); also $OA = OB$ so triangle $OAB$ is isosceles.`, `Garis dari pusat ke titik tengah perentas berserenjang dengan perentas (songsangan sifat membahagi dua sama); juga $OA = OB$ maka segi tiga $OAB$ sama kaki.`) : T(`$90^\\circ$. A line from the centre to the midpoint of a chord is perpendicular to the chord.`, `$90^\\circ$. Garis dari pusat ke titik tengah perentas berserenjang dengan perentas.`), w: W(T(`$OA = OB$ (radii), so triangle $OAB$ is isosceles and $OM$ is its median.`, `$OA = OB$ (jejari), maka segi tiga $OAB$ sama kaki dan $OM$ ialah median segi tiga itu.`), T(`In an isosceles triangle the median to the base is also perpendicular to it, so $\\angle OMA = 90^\\circ$.`, `Dalam segi tiga sama kaki, median ke tapak juga berserenjang dengannya, maka $\\angle OMA = 90^\\circ$.`)), sp: 's' };
    },
    (r) => {
      const [h, d, R] = tri(r), v = r.int(0, 3);
      const fig = chFig({ R, chords: [{ h, d, ang: 90, lab: { AB: `${h} cm` }, right: true }] });
      return { q: nts([T(`$OM \\perp AB$ and $AM = ${h}$ cm. Find the length of the chord $AB$.`, `$OM \\perp AB$ dan $AM = ${h}$ cm. Cari panjang perentas $AB$.`), T(`In the circle with centre $O$, the radius perpendicular to the chord $AB$ meets it at $M$ with $AM = ${h}$ cm. Find $AB$.`, `Dalam bulatan berpusat $O$, jejari yang berserenjang dengan perentas $AB$ bertemu perentas itu di $M$ dengan $AM = ${h}$ cm. Cari $AB$.`), T(`The perpendicular $OM$ from the centre to the chord $AB$ satisfies $MB = ${h}$ cm. What is $AB$?`, `Serenjang $OM$ dari pusat ke perentas $AB$ memenuhi $MB = ${h}$ cm. Berapakah $AB$?`), T(`$M$ is the foot of the perpendicular from the centre $O$ to the chord $AB$, and $AM = ${h}$ cm. Find $MB$ and $AB$.`, `$M$ ialah kaki serenjang dari pusat $O$ ke perentas $AB$, dan $AM = ${h}$ cm. Cari $MB$ dan $AB$.`)][v]), fig, a: v === 3 ? T(`$MB = ${h}$ cm ; $AB = ${2 * h}$ cm`) : T(`$AB = ${2 * h}$ cm`), w: W(T(`The perpendicular from the centre of a circle to a chord bisects the chord.`, `Serenjang dari pusat bulatan ke perentas membahagi dua sama perentas itu.`), `$AM = MB = ${h}$ cm`, `$AB = 2 \\times ${h} = ${2 * h}$ cm`), sp: 's' };
    },
    (r) => {
      const v = r.int(0, 5);
      const Q = [
        ['Every diameter of a circle is an axis of symmetry. How many axes of symmetry does a circle have?', 'Setiap diameter sebuah bulatan ialah paksi simetri. Berapakah bilangan paksi simetri yang dimiliki sebuah bulatan?', 'Infinitely many (one for every diameter).', 'Tak terhingga banyaknya (satu bagi setiap diameter).'],
        ['Explain why a diameter is an axis of symmetry of a circle.', 'Terangkan mengapa diameter ialah paksi simetri bagi sebuah bulatan.', 'Reflecting the circle in a diameter maps every point on the circle to another point at the same distance from the centre, so the circle maps onto itself.', 'Pantulan bulatan pada diameter memetakan setiap titik pada bulatan ke titik lain pada jarak yang sama dari pusat, maka bulatan dipetakan kepada dirinya sendiri.'],
        ['A point $P$ on a circle is reflected in a diameter to $P^\\prime$. Is $P^\\prime$ on the circle? Explain.', 'Titik $P$ pada sebuah bulatan dipantulkan pada diameter ke $P^\\prime$. Adakah $P^\\prime$ terletak pada bulatan? Terangkan.', 'Yes. A reflection in a diameter maps the circle onto itself.', 'Ya. Pantulan pada diameter memetakan bulatan kepada dirinya sendiri.'],
        ['A circular paper is folded so that the two halves coincide exactly. What does the fold line represent?', 'Sekeping kertas bulat dilipat supaya kedua-dua bahagian bertindih tepat. Apakah yang diwakili oleh garis lipatan itu?', 'A diameter (an axis of symmetry).', 'Satu diameter (paksi simetri).'],
        ['Does the perpendicular bisector of a chord pass through the centre of the circle?', 'Adakah pembahagi dua sama serenjang bagi suatu perentas melalui pusat bulatan?', 'Yes, it passes through the centre $O$.', 'Ya, ia melalui pusat $O$.'],
        ['Complete: the line from the centre perpendicular to a chord ________ the chord.', 'Lengkapkan: garis dari pusat yang berserenjang dengan perentas ________ perentas itu.', 'bisects', 'membahagi dua sama'],
      ][v];
      return { q: T(Q[0], Q[1]), a: T(Q[2], Q[3]), w: W(T(`A diameter is an axis of symmetry, and the perpendicular bisector of a chord passes through the centre.`, `Diameter ialah paksi simetri, dan pembahagi dua sama serenjang suatu perentas melalui pusat.`), T(Q[2], Q[3])), sp: 's' };
    },
    (r) => {
      const d = r.int(2, 12), h = r.int(4, 14), v = r.int(0, 3), R = Math.round(Math.sqrt(d * d + h * h) * 10) / 10;
      const eq = r.int(0, 1);
      return { q: [T(`Two chords $AB$ and $CD$ of the same circle are equal. $AB$ is ${d} cm from the centre $O$. How far is $CD$ from $O$? Give the reason.`, `Dua perentas $AB$ dan $CD$ bagi bulatan yang sama adalah sama panjang. $AB$ berjarak ${d} cm dari pusat $O$. Berapa jauhkah $CD$ dari $O$? Berikan sebab.`), T(`In a circle with centre $O$, chords $PQ$ and $RS$ are equal in length. If the perpendicular distance from $O$ to $PQ$ is ${d} cm, find the perpendicular distance from $O$ to $RS$.`, `Dalam bulatan berpusat $O$, perentas $PQ$ dan $RS$ sama panjang. Jika jarak serenjang dari $O$ ke $PQ$ ialah ${d} cm, cari jarak serenjang dari $O$ ke $RS$.`), T(`Chords $AB$ and $CD$ of a circle are the same distance, ${d} cm, from the centre. Compare their lengths and give a reason.`, `Perentas $AB$ dan $CD$ bagi sebuah bulatan berjarak sama, ${d} cm, dari pusat. Bandingkan panjang kedua-duanya dan berikan sebab.`), T(`The chords $EF$ and $GH$ of a circle are both ${d} cm away from the centre. If $EF = ${2 * h}$ cm, find $GH$.`, `Perentas $EF$ dan $GH$ bagi sebuah bulatan kedua-duanya berjarak ${d} cm dari pusat. Jika $EF = ${2 * h}$ cm, cari $GH$.`)][v], a: v === 2 ? T(`They are equal in length: chords equidistant from the centre are equal.`, `Kedua-duanya sama panjang: perentas yang sama jarak dari pusat adalah sama panjang.`) : v === 3 ? T(`$GH = ${2 * h}$ cm (equidistant chords are equal).`, `$GH = ${2 * h}$ cm (perentas yang sama jarak adalah sama panjang).`) : T(`${d} cm. Equal chords are equidistant from the centre.`, `${d} cm. Perentas yang sama panjang adalah sama jarak dari pusat.`), w: W(T(`Chords of the same circle are equal if and only if they are the same distance from the centre.`, `Perentas bulatan yang sama adalah sama panjang jika dan hanya jika ia sama jarak dari pusat.`), T(`So the second chord is also ${d} cm from the centre.`, `Maka perentas kedua juga berjarak ${d} cm dari pusat.`)), sp: 's' };
    },
    (r) => {
      const [h, d, R] = tri(r), v = r.int(0, 2), ang2 = r.pick([0, 180, 270]);
      const fig = chFig({ R, chords: [{ h, d, ang: 90, n: ['A', 'B', 'M'], lab: { AB: `${2 * h} cm`, OM: `${d} cm` }, right: true }, { h, d, ang: 200, n: ['C', 'D', 'N'], lab: { OM: `${d} cm` }, right: true }] });
      return { q: nts([T(`In the diagram $AB = CD$. If $OM = ${d}$ cm, what is the length of $ON$?`, `Dalam rajah $AB = CD$. Jika $OM = ${d}$ cm, berapakah panjang $ON$?`), T(`$AB$ and $CD$ are chords of the circle with $OM \\perp AB$ and $ON \\perp CD$. Given that $AB = CD$ and $OM = ${d}$ cm, find $ON$.`, `$AB$ dan $CD$ ialah perentas bulatan dengan $OM \\perp AB$ dan $ON \\perp CD$. Diberi $AB = CD$ dan $OM = ${d}$ cm, cari $ON$.`), T(`The two chords in the diagram are equal. What can you say about $ON$ and $OM$?`, `Kedua-dua perentas dalam rajah adalah sama. Apakah yang dapat anda katakan tentang $ON$ dan $OM$?`)][v]), fig: chFig({ R, chords: [{ h, d, ang: 90, n: ['A', 'B', 'M'], lab: { OM: `${d} cm` }, tick: 1 }, { h, d, ang: 200, n: ['C', 'D', 'N'], tick: 1 }] }), a: v === 2 ? T(`$ON = OM$: equal chords are equidistant from the centre.`, `$ON = OM$: perentas yang sama panjang adalah sama jarak dari pusat.`) : T(`$ON = ${d}$ cm`), w: W(T(`Chords of the same circle are equal if and only if they are the same distance from the centre.`, `Perentas bulatan yang sama adalah sama panjang jika dan hanya jika ia sama jarak dari pusat.`), `$ON = OM = ${d}$ cm`), sp: 's' };
    },
    (r) => {
      const a = r.int(20, 160), v = r.int(0, 2);
      return { q: [T(`In a circle with centre $O$, the arcs $AB$ and $CD$ are equal. What can you say about the chords $AB$ and $CD$?`, `Dalam bulatan berpusat $O$, lengkok $AB$ dan $CD$ adalah sama. Apakah yang dapat anda katakan tentang perentas $AB$ dan $CD$?`), T(`The chords $PQ$ and $RS$ of a circle are equal. Compare the arcs $PQ$ and $RS$ (minor arcs).`, `Perentas $PQ$ dan $RS$ bagi sebuah bulatan adalah sama. Bandingkan lengkok $PQ$ dan $RS$ (lengkok minor).`), T(`True or false: in the same circle, unequal chords cut off equal arcs. Explain.`, `Betul atau salah: dalam bulatan yang sama, perentas yang tidak sama memotong lengkok yang sama. Terangkan.`)][v], a: v === 0 ? T(`The chords are equal: equal arcs have equal chords.`, `Perentas adalah sama: lengkok yang sama mempunyai perentas yang sama.`) : v === 1 ? T(`The arcs are equal: equal chords cut off equal arcs.`, `Lengkok adalah sama: perentas yang sama memotong lengkok yang sama.`) : T(`False. Equal arcs correspond to equal chords, so unequal chords cut off unequal arcs.`, `Salah. Lengkok yang sama sepadan dengan perentas yang sama, maka perentas yang tidak sama memotong lengkok yang tidak sama.`), w: W(T(`Equal arcs of one circle subtend equal angles at the centre, and equal angles at the centre give congruent triangles, hence equal chords.`, `Lengkok yang sama bagi satu bulatan mencangkum sudut yang sama di pusat, dan sudut yang sama di pusat memberi segi tiga kongruen, maka perentas yang sama.`), T(`So equal arcs and equal chords always go together; unequal chords cut off unequal arcs.`, `Maka lengkok yang sama dan perentas yang sama sentiasa seiring; perentas yang tidak sama memotong lengkok yang tidak sama.`)), sp: 's' };
    },
    (r) => {
      const [h, d, R] = tri(r), v = r.int(0, 3);
      const fig = chFig({ R, chords: [{ h, d, ang: r.pick([90, 45, 270]), lab: { AB: '' } }] });
      return { q: nts([T(`Complete the reasoning: in the circle with centre $O$, $OM \\perp AB$. So $AM = \\underline{\\qquad}$ because the perpendicular from the centre to a chord ________ the chord.`, `Lengkapkan penaakulan: dalam bulatan berpusat $O$, $OM \\perp AB$. Maka $AM = \\underline{\\qquad}$ kerana serenjang dari pusat ke perentas ________ perentas itu.`), T(`Fill in the blanks: $OM \\perp AB$ so $M$ is the ________ of $AB$ and $\\angle OMA = \\underline{\\qquad}^\\circ$.`, `Isi tempat kosong: $OM \\perp AB$ maka $M$ ialah ________ bagi $AB$ dan $\\angle OMA = \\underline{\\qquad}^\\circ$.`), T(`Complete: the perpendicular bisector of a chord always passes through the ________ of the circle.`, `Lengkapkan: pembahagi dua sama serenjang suatu perentas sentiasa melalui ________ bulatan.`), T(`Complete: $OA = OB$ because they are ________ of the circle, so triangle $OAB$ is ________.`, `Lengkapkan: $OA = OB$ kerana kedua-duanya ialah ________ bulatan, maka segi tiga $OAB$ ialah ________.`)][v]), fig, a: v === 0 ? T(`$MB$ ; bisects`, `$MB$ ; membahagi dua sama`) : v === 1 ? T(`midpoint ; $90$`, `titik tengah ; $90$`) : v === 2 ? T(`centre`, `pusat`) : T(`radii ; isosceles`, `jejari ; sama kaki`), w: W(T(`The perpendicular from the centre of a circle to a chord bisects the chord.`, `Serenjang dari pusat bulatan ke perentas membahagi dua sama perentas itu.`), T(`It also makes a right angle with the chord, and $OA = OB$ are radii, so triangle $OAB$ is isosceles.`, `Ia juga membentuk sudut tegak dengan perentas itu, dan $OA = OB$ ialah jejari, maka segi tiga $OAB$ sama kaki.`)), sp: 's' };
    },
    (r) => {
      const [h, d, R] = tri(r), o = r.pick(OBJ), task = r.int(0, 1), st = r.int(0, 2);
      const A = { en: o[0], ms: o[1] }, B = { en: o[2], ms: o[3], bm: o[3].replace(/^(satu|sekeping|seutas|sebatang|sebuah|sebiji) /, '') };
      const Be = B.en.replace(/^an? /, 'the '), Bm = B.ms;
      const q = task === 0
        ? [T(`${cap(B.en)} is fixed across ${A.en}, ${2 * h} cm long, with its ends on the edge. A line from the centre meets it at right angles at $M$. Find the length from one end to $M$.`, `${cap(B.ms)} dipasang melintasi ${A.ms}, sepanjang ${2 * h} cm, dengan hujungnya pada tepi. Garis dari pusat bertemu dengannya secara serenjang di $M$. Cari panjang dari satu hujung ke $M$.`), T(`A line from the centre of ${A.en} meets ${B.en} of length ${2 * h} cm (ends on the edge) at right angles at $M$. How far is $M$ from each end?`, `Garis dari pusat ${A.ms} bertemu ${B.ms} sepanjang ${2 * h} cm (hujung pada tepi) secara serenjang di $M$. Berapa jauhkah $M$ dari setiap hujung?`), T(`${cap(A.en)} has ${B.en} across it, ${2 * h} cm long. The perpendicular from the centre to ${Be} meets it at $M$. Find the distance from $M$ to an end.`, `${cap(A.ms)} mempunyai ${B.ms} melintasinya, sepanjang ${2 * h} cm. Serenjang dari pusat ke ${Bm} bertemu di $M$. Cari jarak dari $M$ ke satu hujung.`)][st]
        : [T(`The perpendicular from the centre of ${A.en} meets ${B.en} at $M$, which is ${h} cm from one end. Find the total length of ${Be}.`, `Serenjang dari pusat ${A.ms} bertemu ${B.ms} di $M$, yang berjarak ${h} cm dari satu hujung. Cari jumlah panjang ${Bm}.`), T(`${cap(B.en)} spans ${A.en} with its ends on the edge. Its middle point $M$ is found by a line from the centre at right angles; $M$ is ${h} cm from one end. How long is ${Be}?`, `${cap(B.ms)} merentangi ${A.ms} dengan hujungnya pada tepi. Titik tengahnya $M$ ditemui dengan garis dari pusat secara serenjang; $M$ berjarak ${h} cm dari satu hujung. Berapakah panjang ${Bm}?`), T(`In ${A.en}, a line from the centre meets ${B.en} at right angles, ${h} cm from one end. Find the length of ${Be}.`, `Dalam ${A.ms}, garis dari pusat bertemu ${B.ms} secara serenjang, ${h} cm dari satu hujung. Cari panjang ${Bm}.`)][st];
      return { q, a: T(task === 0 ? `${h} cm` : `${2 * h} cm`), w: T(`The perpendicular from the centre bisects the chord.`, `Serenjang dari pusat membahagi dua sama perentas.`), sp: 's' };
    },
    (r) => {
      const d = r.int(2, 14), h = r.int(4, 16), o = r.pick(OBJ), st = r.int(0, 2), task = r.int(0, 1);
      const A = { en: o[0], ms: o[1] }, B = { en: o[2], ms: o[3], bm: o[3].replace(/^(satu|sekeping|seutas|sebatang|sebuah|sebiji) /, '') };
      const q = task === 0
        ? [T(`Two equal pieces, ${B.en.replace(/^an? /, '')}s of the same length, are fixed across ${A.en} with their ends on the edge. One is ${d} cm from the centre. How far is the other from the centre?`, `Dua kepingan yang sama, ${B.ms} yang sama panjang, dipasang melintasi ${A.ms} dengan hujung pada tepi. Satu berjarak ${d} cm dari pusat. Berapa jauhkah yang satu lagi dari pusat?`), T(`${cap(A.en)} has two equal chords marked on it, for example two identical ${B.en.replace(/^an? /, '')}s. If one is ${d} cm from the centre, how far is the second one?`, `${cap(A.ms)} mempunyai dua perentas sama yang ditanda padanya, contohnya dua ${B.bm} yang serupa. Jika satu berjarak ${d} cm dari pusat, berapa jauhkah yang kedua?`), T(`Two ${B.en.replace(/^an? /, '')}s of equal length lie across ${A.en}, ends on the edge. The first is ${d} cm from the centre. State the distance of the second from the centre and why.`, `Dua ${B.bm} sama panjang terletak melintasi ${A.ms}, hujung pada tepi. Yang pertama berjarak ${d} cm dari pusat. Nyatakan jarak yang kedua dari pusat dan sebabnya.`)][st]
        : [T(`Two ${B.en.replace(/^an? /, '')}s lie across ${A.en}, both ends on the edge, and both are ${d} cm from the centre. One is ${2 * h} cm long. How long is the other?`, `Dua ${B.bm} terletak melintasi ${A.ms}, kedua-dua hujung pada tepi, dan kedua-duanya berjarak ${d} cm dari pusat. Satu sepanjang ${2 * h} cm. Berapakah panjang yang lain?`), T(`${cap(A.en)} has two chords at the same distance ${d} cm from the centre. One chord is ${2 * h} cm. Find the other chord's length.`, `${cap(A.ms)} mempunyai dua perentas pada jarak yang sama ${d} cm dari pusat. Satu perentas ialah ${2 * h} cm. Cari panjang perentas yang satu lagi.`), T(`Two ${B.en.replace(/^an? /, '')}s across ${A.en}, both ${d} cm from its centre, have ends on the edge. If one is ${2 * h} cm long, what can you say about the other?`, `Dua ${B.bm} melintasi ${A.ms}, kedua-duanya berjarak ${d} cm dari pusatnya, mempunyai hujung pada tepi. Jika satu sepanjang ${2 * h} cm, apakah yang dapat anda katakan tentang yang lain?`)][st];
      return { q, a: T(task === 0 ? `${d} cm (equal chords are equidistant from the centre)` : `${2 * h} cm (chords equidistant from the centre are equal)`, task === 0 ? `${d} cm (perentas sama panjang sama jarak dari pusat)` : `${2 * h} cm (perentas sama jarak dari pusat adalah sama panjang)`), w: W(T(`Chords of the same circle are equal if and only if they are the same distance from the centre.`, `Perentas bulatan yang sama adalah sama panjang jika dan hanya jika ia sama jarak dari pusat.`), T(task === 0 ? `Equal chords, so the second is also ${d} cm from the centre.` : `Same distance from the centre, so the second chord is also ${2 * h} cm long.`, task === 0 ? `Perentas sama panjang, maka yang kedua juga berjarak ${d} cm dari pusat.` : `Jarak dari pusat sama, maka perentas kedua juga sepanjang ${2 * h} cm.`)), sp: 's' };
    },
  ];
  const LSTEP = {
    A: () => [[`Draw two chords $AB$ and $CD$ of the circle that are not parallel.`, `Lukis dua perentas $AB$ dan $CD$ bulatan itu yang tidak selari.`], [`Construct the perpendicular bisector of $AB$.`, `Bina pembahagi dua sama serenjang $AB$.`], [`Construct the perpendicular bisector of $CD$.`, `Bina pembahagi dua sama serenjang $CD$.`], [`Mark the point $O$ where the two bisectors meet: this is the centre.`, `Tanda titik $O$ di mana kedua-dua pembahagi dua sama bertemu: ini ialah pusat.`], [`Measure $OA$ with a ruler to find the radius.`, `Ukur $OA$ dengan pembaris untuk mencari jejari.`]],
  };
  /* context bank for chord problems: object (with article), straight thing across it (with article) */
  const OBJ = [
    ['a circular window', 'sebuah tingkap bulat', 'a horizontal bar', 'satu palang mendatar'], ['a round pond', 'sebuah kolam bulat', 'a wooden plank', 'sekeping papan kayu'],
    ['a circular mirror', 'sebuah cermin bulat', 'a strip of tape', 'satu jalur pita'], ['a round pizza', 'sebiji piza bulat', 'a straight cut', 'satu potongan lurus'],
    ['a round drum skin', 'kulit gendang bulat', 'a straight rope', 'seutas tali lurus'], ['a circular plate', 'sebuah pinggan bulat', 'a straight crack', 'satu retakan lurus'],
    ['a manhole cover', 'sebuah penutup lubang got', 'a metal strip', 'satu jalur logam'], ['a circular glass lens', 'sebuah kanta kaca bulat', 'a scratch', 'satu calar lurus'],
    ['a round trampoline', 'sebuah trampolin bulat', 'a safety pole', 'satu tiang keselamatan'], ['a circular stage', 'sebuah pentas bulat', 'a straight beam', 'satu alang lurus'],
    ['a round clock face', 'sebuah muka jam bulat', 'a piece of string', 'seutas benang'], ['a circular garden', 'sebuah taman bulat', 'a straight path', 'satu laluan lurus'],
  ];
  const g52m = [
    (r) => {
      const [h, d, R] = tri(r), v = r.int(0, 3), ang = r.pick([90, 270, 45, 0]);
      const c = r.pick(CH_CTX);
      const fig = chFig({ R, chords: [{ h, d, ang, lab: { AB: `${2 * h} cm`, OM: `${d} cm` } }], radius: false });
      return { q: nts([T(`In the circle with centre $O$, $OM \\perp AB$, $AB = ${2 * h}$ cm and $OM = ${d}$ cm. Find the radius of the circle.`, `Dalam bulatan berpusat $O$, $OM \\perp AB$, $AB = ${2 * h}$ cm dan $OM = ${d}$ cm. Cari jejari bulatan itu.`), T(`The chord $AB$ of a circle is ${2 * h} cm long and is ${d} cm from the centre $O$. Calculate the radius.`, `Perentas $AB$ sebuah bulatan panjangnya ${2 * h} cm dan berjarak ${d} cm dari pusat $O$. Hitung jejari.`), T(`${cap(c[2])} of length ${2 * h} cm is fixed across ${c[0].replace(/ radius$/, '').replace(/ of$/, '')}, ${d} cm from its centre. Find the radius.`.replace(/ across (an? )?[^,]*,/, ' across a circular object,'), `${cap(c[3])} sepanjang ${2 * h} cm dipasang melintasi satu objek bulat, ${d} cm dari pusatnya. Cari jejari.`), T(`A chord of length ${2 * h} cm lies ${d} cm from the centre of a circle. Use Pythagoras' theorem to find the radius.`, `Satu perentas sepanjang ${2 * h} cm terletak ${d} cm dari pusat sebuah bulatan. Gunakan teorem Pythagoras untuk mencari jejari.`)][v]), fig, a: T(`${R} cm`), w: T(`$R^2 = ${h}^2 + ${d}^2 = ${h * h + d * d}$`), sp: 'm' };
    },
    (r) => {
      const [h, d, R] = tri(r), v = r.int(0, 3), c = r.pick(CH_CTX);
      const fig = chFig({ R, chords: [{ h, d, ang: r.pick([90, 0, 135]), lab: { AB: `${2 * h} cm` } }], radius: true });
      return { q: nts([T(`In the circle with centre $O$ and radius ${R} cm, the chord $AB = ${2 * h}$ cm. Find the perpendicular distance $OM$ from $O$ to $AB$.`, `Dalam bulatan berpusat $O$ berjejari ${R} cm, perentas $AB = ${2 * h}$ cm. Cari jarak serenjang $OM$ dari $O$ ke $AB$.`), T(`${cap(c[0])} ${R} cm has ${c[2]} ${2 * h} cm long across it. How far is it from the centre?`, `${cap(c[1])} ${R} cm mempunyai ${c[3]} sepanjang ${2 * h} cm melintanginya. Berapa jauhkah ia dari pusat?`), T(`A chord of ${2 * h} cm is drawn in a circle of radius ${R} cm. Find its distance from the centre.`, `Satu perentas ${2 * h} cm dilukis dalam bulatan berjejari ${R} cm. Cari jaraknya dari pusat.`), T(`$AB$ is a chord of a circle of radius ${R} cm and $M$ is its midpoint. If $AB = ${2 * h}$ cm, find $OM$.`, `$AB$ ialah perentas bulatan berjejari ${R} cm dan $M$ ialah titik tengahnya. Jika $AB = ${2 * h}$ cm, cari $OM$.`)][v]), fig, a: T(`${d} cm`), w: T(`$OM^2 = ${R}^2 - ${h}^2 = ${d * d}$`), sp: 'm' };
    },
    (r) => {
      const [h, d, R] = tri(r), v = r.int(0, 3), c = r.pick(CH_CTX);
      const fig = chFig({ R, chords: [{ h, d, ang: r.pick([90, 270, 0]), lab: { OM: `${d} cm`, OA: `${R} cm` } }], radius: true });
      return { q: nts([T(`In the circle with centre $O$, radius ${R} cm, $OM \\perp AB$ and $OM = ${d}$ cm. Find the length of the chord $AB$.`, `Dalam bulatan berpusat $O$, berjejari ${R} cm, $OM \\perp AB$ dan $OM = ${d}$ cm. Cari panjang perentas $AB$.`), T(`${cap(c[0])} ${R} cm has ${c[2]} placed ${d} cm from its centre. How long is it?`, `${cap(c[1])} ${R} cm mempunyai ${c[3]} yang diletakkan ${d} cm dari pusatnya. Berapakah panjangnya?`), T(`A chord lies ${d} cm from the centre of a circle of radius ${R} cm. Find its length.`, `Satu perentas terletak ${d} cm dari pusat bulatan berjejari ${R} cm. Cari panjangnya.`), T(`Find $AM$ and hence $AB$ if $OA = ${R}$ cm and $OM = ${d}$ cm, where $OM \\perp AB$.`, `Cari $AM$ dan seterusnya $AB$ jika $OA = ${R}$ cm dan $OM = ${d}$ cm, dengan $OM \\perp AB$.`)][v]), fig, a: T(`${2 * h} cm`), w: T(`$AM^2 = ${R}^2 - ${d}^2 = ${h * h}$, so $AM = ${h}$; $AB = 2 \\times ${h}$`, `$AM^2 = ${R}^2 - ${d}^2 = ${h * h}$, maka $AM = ${h}$; $AB = 2 \\times ${h}$`), sp: 'm' };
    },
    (r) => {
      const p = r.int(2, 8), q = p + r.int(1, 5), v = r.int(0, 3);
      const [x, y] = r.chance() ? [p, q] : [q, p];
      return { q: [T(`Chord $AB$ is ${x} cm from the centre of a circle and chord $CD$ is ${y} cm from the centre. Which chord is longer? Give a reason.`, `Perentas $AB$ berjarak ${x} cm dari pusat sebuah bulatan dan perentas $CD$ berjarak ${y} cm dari pusat. Perentas manakah lebih panjang? Berikan sebab.`), T(`In the same circle, the distances of two chords from the centre are ${x} cm and ${y} cm. Which chord is nearer to the centre and which is longer?`, `Dalam bulatan yang sama, jarak dua perentas dari pusat ialah ${x} cm dan ${y} cm. Perentas manakah lebih dekat dengan pusat dan yang manakah lebih panjang?`), T(`Two chords of a circle are ${x} cm and ${y} cm from the centre. Without calculating, decide which is longer.`, `Dua perentas sebuah bulatan berjarak ${x} cm dan ${y} cm dari pusat. Tanpa mengira, tentukan yang mana lebih panjang.`), T(`Alia says: "the chord further from the centre is longer." Test her claim with chords ${x} cm and ${y} cm from the centre of a circle.`, `Alia berkata: "perentas yang lebih jauh dari pusat lebih panjang." Uji dakwaannya dengan perentas berjarak ${x} cm dan ${y} cm dari pusat bulatan.`)][v], a: v === 3 ? T(`She is wrong. The chord ${p} cm from the centre (nearer) is longer.`, `Dia salah. Perentas ${p} cm dari pusat (lebih dekat) lebih panjang.`) : T(`The chord ${p} cm from the centre is longer: the closer a chord is to the centre, the longer it is (the diameter is longest).`, `Perentas ${p} cm dari pusat lebih panjang: semakin dekat perentas dengan pusat, semakin panjang ia (diameter paling panjang).`), w: W(T(`The nearer a chord is to the centre, the longer it is; the diameter passes through the centre and is the longest chord.`, `Semakin dekat perentas dengan pusat, semakin panjang ia; diameter melalui pusat dan merupakan perentas terpanjang.`), `$${Math.min(x, y)} < ${Math.max(x, y)}$`, T(`So the chord ${p} cm from the centre is the longer one.`, `Maka perentas ${p} cm dari pusat ialah yang lebih panjang.`)), sp: 's' };
    },
    (r) => {
      const st = LSTEP.A(), sh = shuffledSteps(r, st), v = r.int(0, 2);
      return { q: [T(`The steps for finding the centre and radius of a circle drawn on paper are in the wrong order. Write the correct order.${sh.en}`, `Langkah untuk mencari pusat dan jejari bulatan yang dilukis di atas kertas disusun dalam urutan yang salah. Tulis urutan yang betul.${sh.ms}`), T(`Arrange these instructions for locating the centre of an unmarked circle.${sh.en}`, `Susun arahan ini untuk mencari pusat bulatan yang tidak bertanda.${sh.ms}`), T(`Siti finds the centre of a round plate with chords. Put her steps in order.${sh.en}`, `Siti mencari pusat sebuah pinggan bulat dengan perentas. Susun langkahnya mengikut urutan.${sh.ms}`)][v], a: T(sh.order), w: W(T(`The perpendicular bisector of any chord passes through the centre, so two of them meet at the centre.`, `Pembahagi dua sama serenjang mana-mana perentas melalui pusat, maka dua daripadanya bertemu di pusat.`), T(`Draw the chords first, then their perpendicular bisectors, then measure from the crossing point.`, `Lukis perentas dahulu, kemudian pembahagi dua sama serenjangnya, kemudian ukur dari titik persilangan.`), T(`Correct order: ${sh.order}`, `Susunan yang betul: ${sh.order}`)), sp: 's' };
    },
    (r) => {
      const v = r.int(0, 4);
      const Q = [
        ['Why do we need two chords, and not just one, to locate the centre of a circle?', 'Mengapa kita memerlukan dua perentas, dan bukan satu sahaja, untuk mencari pusat sebuah bulatan?', 'The perpendicular bisector of one chord is only a line through the centre; the centre is where two such lines meet.', 'Pembahagi dua sama serenjang satu perentas hanyalah satu garis yang melalui pusat; pusat ialah tempat dua garis sebegitu bertemu.'],
        ['Why should the two chords used to find the centre not be parallel?', 'Mengapa dua perentas yang digunakan untuk mencari pusat tidak boleh selari?', 'The perpendicular bisectors of parallel chords are parallel (or the same line), so they would not meet at a single point.', 'Pembahagi dua sama serenjang perentas selari adalah selari (atau garis yang sama), maka ia tidak bertemu pada satu titik.'],
        ['Why does the point where the two perpendicular bisectors meet lie at the centre?', 'Mengapa titik di mana dua pembahagi dua sama serenjang bertemu terletak di pusat?', 'The perpendicular bisector of each chord passes through the centre, so the only point on both is the centre.', 'Pembahagi dua sama serenjang setiap perentas melalui pusat, maka satu-satunya titik pada kedua-duanya ialah pusat.'],
        ['After finding the centre $O$ of a circle, how is its radius found?', 'Selepas mencari pusat $O$ sebuah bulatan, bagaimanakah jejarinya dicari?', 'Measure the distance from $O$ to any point on the circle.', 'Ukur jarak dari $O$ ke mana-mana titik pada bulatan.'],
        ['A circular piece of paper is folded so that two points $A$ and $B$ on its edge coincide. What can you say about the fold line?', 'Sekeping kertas bulat dilipat supaya dua titik $A$ dan $B$ pada tepinya bertindih. Apakah yang dapat anda katakan tentang garis lipatan?', 'It is the perpendicular bisector of $AB$ and so passes through the centre.', 'Ia ialah pembahagi dua sama serenjang $AB$ dan melalui pusat.'],
      ][v];
      return { q: T(Q[0], Q[1]), a: T(Q[2], Q[3]), w: W(T(`Every perpendicular bisector of a chord passes through the centre, so the centre is where two such lines cross.`, `Setiap pembahagi dua sama serenjang perentas melalui pusat, maka pusat ialah tempat dua garis sebegitu bersilang.`), T(Q[2], Q[3])), sp: 's' };
    },
    (r) => {
      const th = r.pick([20, 25, 30, 35, 40, 50, 55, 60, 65]), v = r.int(0, 3);
      const fig = chFig({ R: 5, chords: [{ h: 4, d: 3, ang: 90, right: true }], radius: true });
      return { q: nts([T(`$OM \\perp AB$ in a circle with centre $O$ and $\\angle AOM = ${th}^\\circ$. Find $\\angle AOB$.`, `$OM \\perp AB$ dalam bulatan berpusat $O$ dan $\\angle AOM = ${th}^\\circ$. Cari $\\angle AOB$.`), T(`$M$ is the midpoint of the chord $AB$ and $\\angle AOM = ${th}^\\circ$. Find $\\angle OAB$.`, `$M$ ialah titik tengah perentas $AB$ dan $\\angle AOM = ${th}^\\circ$. Cari $\\angle OAB$.`), T(`In the diagram, $OM$ bisects the chord $AB$ at right angles. Given $\\angle OAB = ${90 - th}^\\circ$, find $\\angle AOM$.`, `Dalam rajah, $OM$ membahagi dua sama perentas $AB$ secara serenjang. Diberi $\\angle OAB = ${90 - th}^\\circ$, cari $\\angle AOM$.`), T(`The perpendicular $OM$ from the centre to the chord $AB$ makes $\\angle AOM = ${th}^\\circ$. Find $\\angle AOB$ and $\\angle OBA$.`, `Serenjang $OM$ dari pusat ke perentas $AB$ membentuk $\\angle AOM = ${th}^\\circ$. Cari $\\angle AOB$ dan $\\angle OBA$.`)][v]), fig, a: v === 0 ? T(`$${D(2 * th)}$`) : v === 1 ? T(`$${D(90 - th)}$`) : v === 2 ? T(`$${D(th)}$`) : T(`$${D(2 * th)}$ ; $${D(90 - th)}$`), w: T(`Triangles $OAM$ and $OBM$ are congruent (right angle, common side $OM$, $OA = OB$).`, `Segi tiga $OAM$ dan $OBM$ adalah kongruen (sudut tegak, sisi sepunya $OM$, $OA = OB$).`), sp: 's' };
    },
    (r) => {
      const rows = r.sample(TRI, 3).map((t) => (r.chance() ? [t[0], t[1], t[2]] : [t[1], t[0], t[2]]));
      const blank = rows.map((t) => r.int(0, 2));
      const cell = (t, i, b) => (b === i ? '?' : `${i === 0 ? 2 * t[0] : t[i]}`);
      const cells = rows.map((t, k) => [0, 1, 2].map((i) => cell(t, i, blank[k])));
      const ans = rows.map((t, k) => `${['AB', 'd', 'R'][blank[k]]} = ${blank[k] === 0 ? 2 * t[0] : t[blank[k]]}`);
      return { q: T(`In each row, a chord of length $AB$ (cm) is at a perpendicular distance $d$ (cm) from the centre of a circle of radius $R$ (cm). Find the missing value.<br>${SPM.table(cells, { head: ['$AB$', '$d$', '$R$'] })}`, `Dalam setiap baris, perentas sepanjang $AB$ (cm) berada pada jarak serenjang $d$ (cm) dari pusat bulatan berjejari $R$ (cm). Cari nilai yang tidak diketahui.<br>${SPM.table(cells, { head: ['$AB$', '$d$', '$R$'] })}`), a: T(ans.join(' ; ')), w: W(T(`Half the chord, the distance from the centre and the radius form a right-angled triangle: $\\left(\\dfrac{AB}{2}\\right)^2 + d^2 = R^2$.`, `Separuh perentas, jarak dari pusat dan jejari membentuk segi tiga bersudut tegak: $\\left(\\dfrac{AB}{2}\\right)^2 + d^2 = R^2$.`), ...rows.map((t, k) => (blank[k] === 0 ? `$AB = 2\\sqrt{${t[2]}^2 - ${t[1]}^2} = 2 \\times ${t[0]} = ${2 * t[0]}$` : blank[k] === 1 ? `$d = \\sqrt{${t[2]}^2 - ${t[0]}^2} = ${t[1]}$` : `$R = \\sqrt{${t[0]}^2 + ${t[1]}^2} = ${t[2]}$`))), sp: 'm' };
    },
    (r) => {
      const [h, d, R] = tri(r), v = r.int(0, 2), k = r.int(1, 3);
      return { q: [T(`Two equal chords $AB$ and $CD$ of a circle of radius ${R} cm each have length ${2 * h} cm. Find the distance of each chord from the centre.`, `Dua perentas sama $AB$ dan $CD$ bagi bulatan berjejari ${R} cm masing-masing panjangnya ${2 * h} cm. Cari jarak setiap perentas dari pusat.`), T(`A circle of radius ${R} cm has a chord $PQ$ of length ${2 * h} cm. A second chord $RS$ is equal to $PQ$. Find the distance of $RS$ from the centre.`, `Sebuah bulatan berjejari ${R} cm mempunyai perentas $PQ$ sepanjang ${2 * h} cm. Perentas kedua $RS$ sama dengan $PQ$. Cari jarak $RS$ dari pusat.`), T(`In a circle of radius ${R} cm, two chords are each ${d} cm from the centre. Find the length of each chord.`, `Dalam bulatan berjejari ${R} cm, dua perentas masing-masing berjarak ${d} cm dari pusat. Cari panjang setiap perentas.`)][v], a: v === 2 ? T(`${2 * h} cm`) : T(`${d} cm`), w: T(`Equal chords are equidistant from the centre; $d^2 = ${R}^2 - ${h}^2$`, `Perentas sama adalah sama jarak dari pusat; $d^2 = ${R}^2 - ${h}^2$`), sp: 'm' };
    },
    (r) => {
      const [h, d, R] = tri(r), o = r.pick(OBJ), task = r.int(0, 2), st = r.int(0, 2);
      const A = { en: o[0], ms: o[1] }, B = { en: o[2], ms: o[3], bm: o[3].replace(/^(satu|sekeping|seutas|sebatang|sebuah|sebiji) /, '') };
      const q = [
        [[T(`${cap(B.en)} ${2 * h} cm long is placed across ${A.en} so that its ends touch the edge and it is ${d} cm from the centre. Find the radius of ${A.en.replace(/^an? /, 'the ')}.`, `${cap(B.ms)} sepanjang ${2 * h} cm diletakkan melintasi ${A.ms} supaya hujungnya menyentuh tepi dan berjarak ${d} cm dari pusat. Cari jejari ${A.ms.replace(/^(sebuah|sebiji) /, '')} itu.`), T(`The ends of ${B.en} touch the edge of ${A.en}. The length is ${2 * h} cm and its distance from the centre is ${d} cm. What is the radius?`, `Hujung ${B.bm} itu menyentuh tepi ${A.ms}. Panjangnya ${2 * h} cm dan jaraknya dari pusat ${d} cm. Berapakah jejarinya?`), T(`${cap(A.en)} has ${B.en} across it, ${2 * h} cm long and ${d} cm from the centre. Calculate the radius of ${A.en.replace(/^an? /, 'the ')}.`, `${cap(A.ms)} mempunyai ${B.ms} melintasinya, sepanjang ${2 * h} cm dan berjarak ${d} cm dari pusat. Hitung jejari ${A.ms.replace(/^(sebuah|sebiji) /, '')} itu.`)][st], T(`${R} cm`), `$R^2 = ${h}^2 + ${d}^2$`],
        [[T(`${cap(A.en)} has a radius of ${R} cm. ${cap(B.en)} of length ${2 * h} cm has both ends on the edge. How far is it from the centre?`, `${cap(A.ms)} berjejari ${R} cm. ${cap(B.ms)} sepanjang ${2 * h} cm mempunyai kedua-dua hujung pada tepi. Berapa jauhkah ia dari pusat?`), T(`${cap(B.en)} with its ends on the rim of ${A.en} of radius ${R} cm is ${2 * h} cm long. Find its distance from the centre.`, `${cap(B.ms)} yang hujungnya pada bibir ${A.ms} berjejari ${R} cm panjangnya ${2 * h} cm. Cari jaraknya dari pusat.`), T(`The radius of ${A.en} is ${R} cm. ${cap(B.en)} joins two points on its edge and is ${2 * h} cm long. Find the perpendicular distance from the centre to it.`, `Jejari ${A.ms} ialah ${R} cm. ${cap(B.ms)} menyambung dua titik pada tepinya dan panjangnya ${2 * h} cm. Cari jarak serenjang dari pusat ke garis itu.`)][st], T(`${d} cm`), `$d^2 = ${R}^2 - ${h}^2$`],
        [[T(`${cap(A.en)} has a radius of ${R} cm. ${cap(B.en)} is fixed across it with both ends on the edge, ${d} cm from the centre. How long is it?`, `${cap(A.ms)} berjejari ${R} cm. ${cap(B.ms)} dipasang melintasinya dengan kedua-dua hujung pada tepi, ${d} cm dari pusat. Berapakah panjangnya?`), T(`${cap(B.en)} is ${d} cm from the centre of ${A.en} of radius ${R} cm, with its ends on the edge. Find its length.`, `${cap(B.ms)} berjarak ${d} cm dari pusat ${A.ms} berjejari ${R} cm, dengan hujungnya pada tepi. Cari panjangnya.`), T(`In ${A.en} of radius ${R} cm, ${B.en} is placed ${d} cm from the centre and reaches the edge at both ends. What is its length?`, `Dalam ${A.ms} berjejari ${R} cm, ${B.ms} diletakkan ${d} cm dari pusat dan sampai ke tepi pada kedua-dua hujung. Berapakah panjangnya?`)][st], T(`${2 * h} cm`), `$(\\tfrac{1}{2}\\text{ length})^2 = ${R}^2 - ${d}^2$`],
      ][task];
      return { q: q[0], a: q[1], w: T(q[2]), sp: 'm' };
    },
    (r) => {
      const [h, d, R] = tri(r), o = r.pick(OBJ), task = r.int(0, 1), st = r.int(0, 2);
      const A = { en: o[0], ms: o[1] }, B = { en: o[2], ms: o[3], bm: o[3].replace(/^(satu|sekeping|seutas|sebatang|sebuah|sebiji) /, '') }, Ae = A.en.replace(/^an? /, 'the '), Am = A.ms.replace(/^(sebuah|sebiji) /, '');
      const qs = task === 0
        ? [T(`${cap(B.en)} is fixed across ${A.en} with both ends on its edge. Its length is ${2 * h} cm and it is ${d} cm from the centre. Find the diameter of ${Ae}.`, `${cap(B.ms)} dipasang melintasi ${A.ms} dengan kedua-dua hujung pada tepinya. Panjangnya ${2 * h} cm dan jaraknya ${d} cm dari pusat. Cari diameter ${Am} itu.`), T(`Find the diameter of ${A.en} if ${B.en} of length ${2 * h} cm, whose ends are on the edge, is ${d} cm from the centre.`, `Cari diameter ${A.ms} jika ${B.ms} sepanjang ${2 * h} cm, yang hujungnya pada tepi, berjarak ${d} cm dari pusat.`), T(`The ends of ${B.en} ${2 * h} cm long lie on the edge of ${A.en}; it is ${d} cm from the centre. Calculate the diameter.`, `Hujung ${B.bm} itu sepanjang ${2 * h} cm terletak pada tepi ${A.ms}; ia berjarak ${d} cm dari pusat. Hitung diameter.`)]
        : [T(`${cap(A.en)} has radius ${R} cm. Would ${B.en} of length ${2 * R + 2} cm fit across it? Explain, and give the longest length that fits.`, `${cap(A.ms)} berjejari ${R} cm. Adakah ${B.ms} sepanjang ${2 * R + 2} cm muat melintanginya? Terangkan, dan berikan panjang terpanjang yang muat.`), T(`Can ${B.en} ${2 * R + 2} cm long be placed across ${A.en} of radius ${R} cm? What is the longest possible?`, `Bolehkah ${B.ms} sepanjang ${2 * R + 2} cm diletakkan melintasi ${A.ms} berjejari ${R} cm? Berapakah yang terpanjang yang mungkin?`), T(`${cap(A.en)} has a diameter of ${2 * R} cm. State the longest straight piece that can go across it and where it must be placed.`, `${cap(A.ms)} berdiameter ${2 * R} cm. Nyatakan kepingan lurus terpanjang yang boleh melintanginya dan di mana ia mesti diletakkan.`)];
      return { q: qs[st], a: task === 0 ? T(`${2 * R} cm`) : T(`No. The longest is ${2 * R} cm (the diameter, through the centre).`, `Tidak. Yang terpanjang ialah ${2 * R} cm (diameter, melalui pusat).`), w: task === 0 ? T(`$R^2 = ${h}^2 + ${d}^2$; diameter $= 2R$`) : undefined, w: W(task === 0 ? W(T(`The perpendicular from the centre of a circle to a chord bisects the chord.`, `Serenjang dari pusat bulatan ke perentas membahagi dua sama perentas itu.`), `$\\left(\\dfrac{${2 * h}}{2}\\right)^2 + ${d}^2 = R^2$`, `$${h * h} + ${d * d} = ${R * R}$`, `$R = ${R}$ cm`, `$d = 2 \\times ${R} = ${2 * R}$ cm`) : W(T(`The longest chord of a circle is the diameter, through the centre.`, `Perentas terpanjang sebuah bulatan ialah diameter, yang melalui pusat.`), `$2 \\times ${R} = ${2 * R}$ cm`, `$${2 * R + 2} > ${2 * R}$`)), sp: 'm' };
    },
    (r) => {
      const [h, d, R] = tri(r), o = r.pick(OBJ), st = r.int(0, 2), s = R - d;
      const A = { en: o[0], ms: o[1] }, B = { en: o[2], ms: o[3], bm: o[3].replace(/^(satu|sekeping|seutas|sebatang|sebuah|sebiji) /, '') }, Ae = A.en.replace(/^an? /, 'the '), Am = A.ms.replace(/^(sebuah|sebiji) /, '');
      const qs = [T(`${cap(B.en)} of length ${2 * h} cm has both ends on the edge of ${A.en}. The shortest distance from ${B.en.replace(/^an? /, 'the ')} to the edge (measured through the centre's direction) is ${s} cm. Find the radius of ${Ae}.`, `${cap(B.ms)} sepanjang ${2 * h} cm mempunyai kedua-dua hujung pada tepi ${A.ms}. Jarak terpendek dari ${B.ms} ke tepi (diukur dalam arah pusat) ialah ${s} cm. Cari jejari ${Am} itu.`), T(`${cap(A.en)} has ${B.en} ${2 * h} cm long across it, ending on the edge. The edge is ${s} cm beyond the middle of ${B.en.replace(/^an? /, 'the ')}, along the line through the centre. Find the radius.`, `${cap(A.ms)} mempunyai ${B.ms} sepanjang ${2 * h} cm melintasinya, berakhir pada tepi. Tepi berada ${s} cm di luar bahagian tengah ${B.bm} itu, di sepanjang garis melalui pusat. Cari jejari.`), T(`The radius of ${A.en} is unknown. ${cap(B.en)} of length ${2 * h} cm has its ends on the edge and its middle point is ${s} cm from the edge measured along the perpendicular through the centre. Find the radius.`, `Jejari ${A.ms} tidak diketahui. ${cap(B.ms)} sepanjang ${2 * h} cm mempunyai hujung pada tepi dan titik tengahnya berjarak ${s} cm dari tepi diukur sepanjang serenjang melalui pusat. Cari jejari.`)];
      return { q: qs[st], a: T(`${R} cm`), w: T(`$R^2 = ${h}^2 + (R - ${s})^2$`), sp: 'm' };
    },
  ];
  const g52a = [
    (r) => {
      const [h, d, R] = tri(r), v = r.int(0, 3), s = R - d;
      const CT = [['a circular tunnel cross-section', 'keratan rentas terowong bulat'], ['a round pipe', 'sebatang paip bulat'], ['a circular window', 'sebuah tingkap bulat'], ['a round dish', 'sebuah pinggan bulat']];
      const c = r.pick(CT);
      const fig = chFig({ R, chords: [{ h, d, ang: 90, lab: { AB: `${2 * h} cm` } }], extC: { label: `${s} cm` } });
      return { q: nts([T(`In the diagram, $C$ is on the circle and $OC \\perp AB$ meets $AB$ at $M$. $AB = ${2 * h}$ cm and $MC = ${s}$ cm. Find the radius of the circle.`, `Dalam rajah, $C$ terletak pada bulatan dan $OC \\perp AB$ bertemu $AB$ di $M$. $AB = ${2 * h}$ cm dan $MC = ${s}$ cm. Cari jejari bulatan.`), T(`The radius $OC$ is perpendicular to the chord $AB$, meeting it at $M$. If $AB = ${2 * h}$ cm and $MC = ${s}$ cm, let $OA = R$. Form an equation for $R$ and solve it.`, `Jejari $OC$ berserenjang dengan perentas $AB$ dan bertemu di $M$. Jika $AB = ${2 * h}$ cm dan $MC = ${s}$ cm, katakan $OA = R$. Bentuk persamaan bagi $R$ dan selesaikan.`), T(`In ${c[0]}, the chord is ${2 * h} cm wide and the depth from the chord to the arc is ${s} cm along the perpendicular through the centre. Find the radius.`, `Dalam ${c[1]}, perentas selebar ${2 * h} cm dan kedalaman dari perentas ke lengkok ialah ${s} cm sepanjang serenjang melalui pusat. Cari jejari.`), T(`A chord $AB = ${2 * h}$ cm has its midpoint $M$ ${s} cm from the nearest point $C$ on the circle, along the line through the centre. Find the radius and the distance $OM$.`, `Perentas $AB = ${2 * h}$ cm mempunyai titik tengah $M$ berjarak ${s} cm dari titik terdekat $C$ pada bulatan, di sepanjang garis melalui pusat. Cari jejari dan jarak $OM$.`)][v]), fig: v === 2 ? undefined : fig, a: v === 3 ? T(`${R} cm ; ${d} cm`) : T(`${R} cm`), w: T(`$R^2 = ${h}^2 + (R - ${s})^2$`), sp: 'm' };
    },
    (r) => {
      const R = r.pick([10, 13, 15, 17, 25]), pairs = { 10: [[6, 8], [8, 6]], 13: [[5, 12], [12, 5]], 15: [[9, 12], [12, 9]], 17: [[8, 15], [15, 8]], 25: [[7, 24], [24, 7], [15, 20], [20, 15]] }[R];
      const [h1, h2] = [pairs[0][0], pairs[0][1]], d1 = Math.sqrt(R * R - h1 * h1), d2 = Math.sqrt(R * R - h2 * h2), v = r.int(0, 2);
      need(Number.isInteger(d1) && Number.isInteger(d2) && d1 !== d2);
      return { q: [T(`$AB$ and $CD$ are parallel chords on opposite sides of the centre of a circle of radius ${R} cm. $AB = ${2 * h1}$ cm and $CD = ${2 * h2}$ cm. Find the distance between the chords.`, `$AB$ dan $CD$ ialah perentas selari pada sisi bertentangan pusat bulatan berjejari ${R} cm. $AB = ${2 * h1}$ cm dan $CD = ${2 * h2}$ cm. Cari jarak antara kedua-dua perentas.`), T(`Two parallel chords of lengths ${2 * h1} cm and ${2 * h2} cm lie on the same side of the centre of a circle of radius ${R} cm. Find the distance between them.`, `Dua perentas selari sepanjang ${2 * h1} cm dan ${2 * h2} cm terletak pada sisi yang sama pusat bulatan berjejari ${R} cm. Cari jarak antara kedua-duanya.`), T(`In a circle of radius ${R} cm, parallel chords of lengths ${2 * h1} cm and ${2 * h2} cm are drawn. Find the two possible distances between them.`, `Dalam bulatan berjejari ${R} cm, perentas selari sepanjang ${2 * h1} cm dan ${2 * h2} cm dilukis. Cari dua jarak yang mungkin antara kedua-duanya.`)][v], a: v === 0 ? T(`${d1 + d2} cm`) : v === 1 ? T(`${Math.abs(d1 - d2)} cm`) : T(`${d1 + d2} cm (opposite sides) or ${Math.abs(d1 - d2)} cm (same side)`, `${d1 + d2} cm (sisi bertentangan) atau ${Math.abs(d1 - d2)} cm (sisi yang sama)`), w: T(`Distances from the centre: $\\sqrt{${R}^2 - ${h1}^2} = ${d1}$ and $\\sqrt{${R}^2 - ${h2}^2} = ${d2}$`), sp: 'm' };
    },
    (r) => {
      const [h, d, R] = tri(r), x = r.int(2, 9), a1 = r.pick([2, 3]), b1 = r.int(1, 8), v = r.int(0, 1);
      const AMv = a1 * x + b1, need2 = (AMv - b1) % 1 === 0;
      const c1 = r.int(1, 4), MBv = AMv, k2 = MBv - c1 * x;
      need(k2 > 0 && a1 !== c1);
      const AM = `${a1}x + ${b1}`, MB = `${c1}x + ${k2}`;
      return { q: v === 0 ? T(`$O$ is the centre of a circle, $OM \\perp AB$, $AM = (${AM})$ cm and $MB = (${MB})$ cm. Find $x$ and the length of $AB$.`, `$O$ ialah pusat bulatan, $OM \\perp AB$, $AM = (${AM})$ cm dan $MB = (${MB})$ cm. Cari $x$ dan panjang $AB$.`) : T(`The perpendicular from the centre $O$ to the chord $AB$ meets it at $M$. Given $AM = (${AM})$ cm and $MB = (${MB})$ cm, find the value of $x$ and hence $AM$.`, `Serenjang dari pusat $O$ ke perentas $AB$ bertemu di $M$. Diberi $AM = (${AM})$ cm dan $MB = (${MB})$ cm, cari nilai $x$ dan seterusnya $AM$.`), a: v === 0 ? T(`$x = ${x}$ ; $AB = ${2 * AMv}$ cm`) : T(`$x = ${x}$ ; $AM = ${AMv}$ cm`), w: T(`$AM = MB$ (perpendicular from the centre bisects the chord): $${AM} = ${MB}$`, `$AM = MB$ (serenjang dari pusat membahagi dua sama perentas): $${AM} = ${MB}$`), sp: 'm' };
    },
    (r) => {
      const [h, d, R] = tri(r), x = r.int(2, 8), a1 = r.pick([2, 3, 4]), b1 = r.int(1, 6), c1 = r.pick([1, 2, 5]);
      const ON = a1 * x + b1, k2 = ON - c1 * x;
      need(k2 > 0 && a1 !== c1);
      return { q: T(`Chords $AB$ and $CD$ of a circle with centre $O$ are equal. $OM \\perp AB$ with $OM = (${c1 === 1 ? '' : c1}x + ${k2})$ cm and $ON \\perp CD$ with $ON = (${a1}x + ${b1})$ cm. Find $x$ and the distance of each chord from the centre.`, `Perentas $AB$ dan $CD$ bulatan berpusat $O$ adalah sama. $OM \\perp AB$ dengan $OM = (${c1 === 1 ? '' : c1}x + ${k2})$ cm dan $ON \\perp CD$ dengan $ON = (${a1}x + ${b1})$ cm. Cari $x$ dan jarak setiap perentas dari pusat.`), a: T(`$x = ${x}$ ; ${ON} cm`), w: T(`Equal chords are equidistant from the centre, so $OM = ON$.`, `Perentas yang sama panjang adalah sama jarak dari pusat, maka $OM = ON$.`), sp: 'm' };
    },
    (r) => {
      const [h, d, R] = tri(r), v = r.int(0, 2);
      const fig = chFig({ R, chords: [{ h, d, ang: 90, n: ['A', 'B', 'M'], lab: { AB: `${2 * h} cm` } }, { h, d, ang: 0, n: ['C', 'D', 'N'], tick: 1 }] });
      return { q: nts([T(`In the diagram $AB = CD = ${2 * h}$ cm and the radius of the circle is ${R} cm. Find (a) $OM$, (b) $ON$, (c) the distance from $O$ to $CD$.`, `Dalam rajah $AB = CD = ${2 * h}$ cm dan jejari bulatan ialah ${R} cm. Cari (a) $OM$, (b) $ON$, (c) jarak dari $O$ ke $CD$.`), T(`The chords $AB$ and $CD$ in the diagram are equal, each ${2 * h} cm long, in a circle of radius ${R} cm. Calculate $OM$ and $ON$.`, `Perentas $AB$ dan $CD$ dalam rajah adalah sama, masing-masing ${2 * h} cm panjang, dalam bulatan berjejari ${R} cm. Hitung $OM$ dan $ON$.`), T(`Show that the chords $AB$ and $CD$ (both ${2 * h} cm) in a circle of radius ${R} cm are equidistant from $O$, and find that distance.`, `Tunjukkan bahawa perentas $AB$ dan $CD$ (kedua-duanya ${2 * h} cm) dalam bulatan berjejari ${R} cm sama jarak dari $O$, dan cari jarak itu.`)][v]), fig, a: v === 0 ? T(`(a) ${d} cm (b) ${d} cm (c) ${d} cm`) : T(`${d} cm and ${d} cm`, `${d} cm dan ${d} cm`), w: T(`$OM = ON = \\sqrt{${R}^2 - ${h}^2}$`), sp: 'm' };
    },
    (r) => {
      const v = r.int(0, 3);
      const Q = [
        ['Explain how you would find the centre of a circle that has been cut out of card, using only a ruler, a pair of compasses and a pencil. Why does the method work?', 'Terangkan bagaimana anda mencari pusat sebuah bulatan yang dipotong daripada kad, dengan hanya pembaris, jangka lukis dan pensel. Mengapa kaedah itu berkesan?', 'Draw two non-parallel chords, construct the perpendicular bisector of each, and mark where they meet. The perpendicular bisector of a chord passes through the centre, so their intersection is the centre.', 'Lukis dua perentas yang tidak selari, bina pembahagi dua sama serenjang setiap satu, dan tanda tempat kedua-duanya bertemu. Pembahagi dua sama serenjang perentas melalui pusat, maka persilangannya ialah pusat.'],
        ['A student draws only one chord and its perpendicular bisector and says the centre is where the bisector meets the circle. Explain her mistake.', 'Seorang murid hanya melukis satu perentas dan pembahagi dua sama serenjangnya dan berkata pusat ialah tempat pembahagi itu bertemu bulatan. Terangkan kesilapannya.', 'The bisector passes through the centre but the centre could be anywhere along it; it meets the circle at the ends of a diameter. A second chord is needed.', 'Pembahagi itu melalui pusat tetapi pusat boleh berada di mana-mana sepanjangnya; ia bertemu bulatan pada hujung diameter. Perentas kedua diperlukan.'],
        ['Chords $AB$ and $CD$ of a circle are parallel. Explain why their perpendicular bisectors do not help to find the centre directly, and suggest what to do.', 'Perentas $AB$ dan $CD$ bagi sebuah bulatan adalah selari. Terangkan mengapa pembahagi dua sama serenjang kedua-duanya tidak membantu mencari pusat secara langsung, dan cadangkan apa yang perlu dilakukan.', 'Their perpendicular bisectors coincide (the same line), so they meet everywhere. Draw a third chord that is not parallel to them and use its bisector.', 'Pembahagi dua sama serenjang kedua-duanya bertindih (garis yang sama), maka ia bertemu di mana-mana. Lukis perentas ketiga yang tidak selari dengannya dan gunakan pembahagi dua sama serenjangnya.'],
        ['The perpendicular bisectors of two chords of a circle meet at $O$. Show that $O$ is equidistant from $A$, $B$, $C$ and $D$ where $AB$ and $CD$ are the chords.', 'Pembahagi dua sama serenjang dua perentas sebuah bulatan bertemu di $O$. Tunjukkan bahawa $O$ sama jarak dari $A$, $B$, $C$ dan $D$ dengan $AB$ dan $CD$ ialah perentas.', 'Any point on the perpendicular bisector of $AB$ is equidistant from $A$ and $B$, and likewise for $CD$. So $OA = OB$ and $OC = OD$, and since both bisectors pass through the centre, $O$ is the centre and all four distances equal the radius.', 'Mana-mana titik pada pembahagi dua sama serenjang $AB$ sama jarak dari $A$ dan $B$, begitu juga bagi $CD$. Maka $OA = OB$ dan $OC = OD$, dan kerana kedua-dua pembahagi melalui pusat, $O$ ialah pusat dan keempat-empat jarak sama dengan jejari.'],
      ][v];
      return { q: T(Q[0], Q[1]), a: T(Q[2], Q[3]), w: W(T(`Every perpendicular bisector of a chord is a line of symmetry of the circle, so it passes through the centre.`, `Setiap pembahagi dua sama serenjang perentas ialah paksi simetri bulatan, maka ia melalui pusat.`), T(`One bisector only gives a line through the centre; two non-parallel bisectors cross exactly at the centre, which is then equidistant from all four chord ends (they are all radii).`, `Satu pembahagi sahaja hanya memberi satu garis melalui pusat; dua pembahagi yang tidak selari bersilang tepat di pusat, yang kemudiannya sama jarak dari keempat-empat hujung perentas (semuanya jejari).`), T(Q[2], Q[3])), sp: 'l' };
    },
    (r) => {
      const [h, d, R] = tri(r), v = r.int(0, 2);
      return { q: [T(`The chord $AB$ of a circle is ${2 * h} cm and its distance from the centre is ${d} cm. A second chord is drawn at half that distance from the centre... `.replace(/ A second.*$/, '') + ` Find the radius, and hence state the length of the longest chord.`, `Perentas $AB$ sebuah bulatan ialah ${2 * h} cm dan jaraknya dari pusat ialah ${d} cm. Cari jejari, dan seterusnya nyatakan panjang perentas terpanjang.`), T(`In a circle, chord $AB = ${2 * h}$ cm is ${d} cm from the centre $O$. Find $OA$ and the perimeter of triangle $OAB$.`, `Dalam sebuah bulatan, perentas $AB = ${2 * h}$ cm berjarak ${d} cm dari pusat $O$. Cari $OA$ dan perimeter segi tiga $OAB$.`), T(`A chord of length ${2 * h} cm is ${d} cm from the centre of a circle. Find the area of triangle $OAB$ where $O$ is the centre.`, `Satu perentas sepanjang ${2 * h} cm berjarak ${d} cm dari pusat sebuah bulatan. Cari luas segi tiga $OAB$ dengan $O$ ialah pusat.`)][v], a: v === 0 ? T(`${R} cm ; ${2 * R} cm`) : v === 1 ? T(`$OA = ${R}$ cm ; ${2 * R + 2 * h} cm`) : T(`${h * d} cm$^2$`.replace(/^/, '$').replace('cm$^2$', '\\text{ cm}^2$')), w: W(T(`The perpendicular from the centre of a circle to a chord bisects the chord.`, `Serenjang dari pusat bulatan ke perentas membahagi dua sama perentas itu.`), `$\\left(\\dfrac{${2 * h}}{2}\\right)^2 + ${d}^2 = R^2$`, `$${h * h} + ${d * d} = ${R * R}$`, `$R = ${R}$ cm`, ...(v === 0 ? [`$2 \\times ${R} = ${2 * R}$ cm`] : v === 1 ? [`$${R} + ${R} + ${2 * h} = ${2 * R + 2 * h}$ cm`] : [`$\\dfrac{1}{2} \\times ${2 * h} \\times ${d} = ${h * d}$`])), sp: 'm' };
    },
    (r) => {
      const R = r.pick([10, 13, 15, 17, 25]), pr = { 10: [6, 8], 13: [5, 12], 15: [9, 12], 17: [8, 15], 25: [7, 24] }[R], [h1, h2] = pr;
      const d1 = Math.sqrt(R * R - h1 * h1), d2 = Math.sqrt(R * R - h2 * h2), o = r.pick(OBJ), st = r.int(0, 2), same = r.chance();
      const A = { en: o[0], ms: o[1] }, B = { en: o[2], ms: o[3], bm: o[3].replace(/^(satu|sekeping|seutas|sebatang|sebuah|sebiji) /, '') }, Bs = B.en.replace(/^an? /, '');
      const q = [T(`Two parallel ${Bs}s of lengths ${2 * h1} cm and ${2 * h2} cm are placed across ${A.en} of radius ${R} cm, with their ends on the edge, on ${same ? 'the same side of' : 'opposite sides of'} the centre. How far apart are they?`, `Dua ${B.bm} selari sepanjang ${2 * h1} cm dan ${2 * h2} cm diletakkan melintasi ${A.ms} berjejari ${R} cm, dengan hujung pada tepi, pada ${same ? 'sisi yang sama' : 'sisi bertentangan'} pusat. Berapakah jarak antara kedua-duanya?`), T(`${cap(A.en)} of radius ${R} cm has two parallel ${Bs}s across it, ${2 * h1} cm and ${2 * h2} cm long, ${same ? 'both on one side of' : 'one on each side of'} the centre. Find the distance between them.`, `${cap(A.ms)} berjejari ${R} cm mempunyai dua ${B.bm} selari melintasinya, sepanjang ${2 * h1} cm dan ${2 * h2} cm, ${same ? 'kedua-duanya pada satu sisi' : 'satu pada setiap sisi'} pusat. Cari jarak antara kedua-duanya.`), T(`The radius of ${A.en} is ${R} cm. Parallel ${Bs}s of ${2 * h1} cm and ${2 * h2} cm are fixed across it, ${same ? 'on the same side of' : 'on opposite sides of'} the centre. Calculate the gap between them.`, `Jejari ${A.ms} ialah ${R} cm. ${B.ms} selari sepanjang ${2 * h1} cm dan ${2 * h2} cm dipasang melintasinya, ${same ? 'pada sisi yang sama' : 'pada sisi bertentangan'} pusat. Hitung jurang antara kedua-duanya.`)][st];
      return { q, a: T(`${same ? Math.abs(d1 - d2) : d1 + d2} cm`), w: T(`Distances from the centre: ${d1} cm and ${d2} cm`, `Jarak dari pusat: ${d1} cm dan ${d2} cm`), sp: 'm' };
    },
    (r) => {
      const [h, d, R] = tri(r), k = r.pick([1, 2, 3]), o = r.pick(OBJ), st = r.int(0, 2);
      const A = { en: o[0], ms: o[1] }, B = { en: o[2], ms: o[3], bm: o[3].replace(/^(satu|sekeping|seutas|sebatang|sebuah|sebiji) /, '') }, Bs = B.en.replace(/^an? /, '');
      const [h2, d2, R2] = [null];
      // second chord at distance d2 from centre, using the same circle (R): choose from triples with the same R
      const alt = TRI.filter((t) => t[2] === R && t[0] !== h && t[1] !== d && (t[1] !== h));
      need(alt.length > 0);
      const t2 = alt[0];
      const hh = t2[0], dd = t2[1];
      need(hh !== h && dd !== d);
      const q = [T(`${cap(B.en)} of length ${2 * h} cm is fixed across ${A.en} with its ends on the edge, ${d} cm from the centre. A second ${Bs} is fixed ${dd} cm from the centre. Find the length of the second ${Bs}.`, `${cap(B.ms)} sepanjang ${2 * h} cm dipasang melintasi ${A.ms} dengan hujung pada tepi, berjarak ${d} cm dari pusat. ${cap(B.ms)} kedua dipasang berjarak ${dd} cm dari pusat. Cari panjang ${B.ms} kedua itu.`), T(`Across ${A.en}, ${B.en} of length ${2 * h} cm lies ${d} cm from the centre. Find the length of another ${Bs} that lies ${dd} cm from the centre (ends on the edge).`, `Melintasi ${A.ms}, ${B.ms} sepanjang ${2 * h} cm terletak ${d} cm dari pusat. Cari panjang ${B.ms} lain yang terletak ${dd} cm dari pusat (hujung pada tepi).`), T(`First find the radius of ${A.en}, given that ${B.en} ${2 * h} cm long with its ends on the edge is ${d} cm from the centre. Then find the length of a ${Bs} ${dd} cm from the centre.`, `Mula-mula cari jejari ${A.ms}, diberi ${B.ms} sepanjang ${2 * h} cm dengan hujung pada tepi berjarak ${d} cm dari pusat. Kemudian cari panjang ${B.ms} yang berjarak ${dd} cm dari pusat.`)][st];
      return { q, a: T(`${2 * hh} cm`), w: T(`$R = ${R}$; $h^2 = ${R}^2 - ${dd}^2$`), sp: 'm' };
    },
  ];
  /*END52*/
  SPM.extend('F2-5.2', { e: g52e, m: g52m, a: g52a });

  /* ======================================================= F2-5.3 Circumference and area of a circle */
  const FR = SPM.Fr;
  const fnum = (x) => FR.make(Math.round(x * 4), 4); // exact fraction from a number with at most 2 dp in quarters
  const PNOTE = {
    exact: ['Leave your answer in terms of $\\pi$.', 'Tinggalkan jawapan anda dalam sebutan $\\pi$.'],
    r22: ['Use $\\pi = \\frac{22}{7}$.', 'Gunakan $\\pi = \\frac{22}{7}$.'],
    p3142: ['Use $\\pi = 3.142$ and give the answer correct to 2 decimal places.', 'Gunakan $\\pi = 3.142$ dan berikan jawapan betul kepada 2 tempat perpuluhan.'],
    p314: ['Use $\\pi = 3.14$ and give the answer correct to 2 decimal places.', 'Gunakan $\\pi = 3.14$ dan berikan jawapan betul kepada 2 tempat perpuluhan.'],
  };
  const pkind = (r) => r.pick(['exact', 'r22', 'p3142', 'p314']);
  /** the value of pi actually used, as maths text */
  const PIS = { exact: '\\pi', r22: '\\dfrac{22}{7}', p3142: '3.142', p314: '3.14' };
  /** radius (a number) suited to the π-kind: multiples of 7 (or 3.5) for 22/7 */
  const prad = (kind, r, lo, hi) => (kind === 'r22' ? r.pick([7, 14, 21, 3.5, 10.5, 28, 35].filter((v) => (!lo || v >= lo) && (!hi || v <= hi))) : r.int(lo || 2, hi || 15));
  /** value coef·π in the chosen mode: returns { s: tex-string (no $), note: [en, ms], v: number } */
  function pv(kind, fr, unit, pow) {
    const u = unit ? `\\ \\text{${unit}}${pow === 2 ? '^2' : ''}` : '';
    if (kind === 'exact') {
      const num = fr.n === 1 ? '' : fr.n;
      return { s: (fr.d === 1 ? `${fr.n === 1 ? '' : fr.n}\\pi` : `\\dfrac{${num}\\pi}{${fr.d}}`) + u, note: PNOTE.exact, v: (fr.n / fr.d) * Math.PI };
    }
    const k = kind === 'r22' ? 22 / 7 : kind === 'p3142' ? 3.142 : 3.14;
    const val = (fr.n / fr.d) * k;
    if (kind === 'r22') {
      const w = FR.mul(fr, FR.make(22, 7));
      const exact = 100 % w.d === 0;
      return { s: n(round(val, 2)) + u, note: exact ? PNOTE.r22 : [PNOTE.r22[0] + ' Give the answer correct to 2 decimal places.', PNOTE.r22[1] + ' Berikan jawapan betul kepada 2 tempat perpuluhan.'], v: val };
    }
    return { s: n(round(val, 2)) + u, note: PNOTE[kind], v: val };
  }
  const NT = (p) => T(p.note[0], p.note[1]);
  const Cf = (r) => FR.mul(FR.make(2), fnum(r)), Af = (r) => FR.mul(fnum(r), fnum(r));
  const sect = (th) => FR.make(th, 360);
  const CTXC = CIRC_CTX;
  const g53e = [
    (r) => {
      const kind = pkind(r), rr = prad(kind, r, 2, 15), task = r.int(0, 3), st = r.int(0, 2), u = r.pick(['cm', 'm']);
      const d = 2 * rr;
      const p = pv(kind, task === 0 || task === 1 ? Cf(rr) : Af(rr), u, task >= 2 ? 2 : 1);
      const N = p.note;
      const q = [
        [`Find the circumference of a circle of radius ${n(rr)} ${u}.`, `Cari lilitan sebuah bulatan berjejari ${n(rr)} ${u}.`],
        [`Find the circumference of a circle of diameter ${n(d)} ${u}.`, `Cari lilitan sebuah bulatan berdiameter ${n(d)} ${u}.`],
        [`Find the area of a circle of radius ${n(rr)} ${u}.`, `Cari luas sebuah bulatan berjejari ${n(rr)} ${u}.`],
        [`Find the area of a circle of diameter ${n(d)} ${u}.`, `Cari luas sebuah bulatan berdiameter ${n(d)} ${u}.`],
      ][task];
      const fr2 = [`Calculate: ${q[0].replace(/^Find /, '')}`, null, `Determine ${q[0].replace(/^Find /, '')}`];
      const en = st === 0 ? q[0] : st === 1 ? `Calculate ${q[0].replace(/^Find /, '')}` : `What is ${q[0].replace(/^Find /, '').replace(/\.$/, '')}?`;
      const ms = st === 0 ? q[1] : st === 1 ? `Hitung ${q[1].replace(/^Cari /, '')}` : `Berapakah ${q[1].replace(/^Cari /, '').replace(/\.$/, '')}?`;
      return { q: T(`${en} ${N[0]}`, `${ms} ${N[1]}`), a: T(`$${p.s}$`), w: task < 2 ? T(`$C = ${task === 0 ? '2\\pi r' : '\\pi d'}$`) : T(`$A = \\pi r^2$`), sp: 's' };
    },
    (r) => {
      const kind0 = pkind(r), kind = kind0, c = r.pick(CTXC.filter((q) => q[0] !== 'a coin' && (kind0 !== 'r22' || [7, 14, 21, 28, 3.5, 10.5, 35].some((v) => v >= q[3] && v <= q[4])))), rr = prad(kind, r, c[3], c[4]), task = r.int(0, 3);
      const d = 2 * rr, u = c[2];
      const p = pv(kind, task % 2 === 0 ? Cf(rr) : Af(rr), u, task % 2 === 0 ? 1 : 2);
      const q = [
        [`${cap(c[0])} has a diameter of ${n(d)} ${u}. Find the distance round its edge.`, `${cap(c[1])} berdiameter ${n(d)} ${u}. Cari jarak mengelilingi tepinya.`],
        [`${cap(c[0])} has a radius of ${n(rr)} ${u}. Find the area of its surface.`, `${cap(c[1])} berjejari ${n(rr)} ${u}. Cari luas permukaannya.`],
        [`The radius of ${c[0]} is ${n(rr)} ${u}. Find the length of its circumference.`, `Jejari ${c[1]} ialah ${n(rr)} ${u}. Cari panjang lilitannya.`],
        [`The diameter of ${c[0]} is ${n(d)} ${u}. Calculate the area it covers.`, `Diameter ${c[1]} ialah ${n(d)} ${u}. Hitung luas yang ditutupinya.`],
      ][task];
      return { q: T(`${q[0]} ${p.note[0]}`, `${q[1]} ${p.note[1]}`), a: T(`$${p.s}$`), w: W(T(task % 2 === 0 ? `$C = \\pi d$` : `$A = \\pi r^2$`, task % 2 === 0 ? `$C = \\pi d$` : `$A = \\pi r^2$`), ...(task === 3 ? [`$r = ${n(d)} \\div 2 = ${n(rr)}$`] : []), `$= ${PIS[kind]} \\times ${task % 2 === 0 ? n(d) : `${n(rr)}^2`} = ${p.s}$`), sp: 's' };
    },
    (r) => {
      const v = r.int(0, 7);
      const Q = [
        ['The circumference of a circle is given by $C = \\underline{\\qquad}\\ d$.', 'Lilitan sebuah bulatan diberi oleh $C = \\underline{\\qquad}\\ d$.', '$\\pi$'],
        ['The area of a circle of radius $r$ is $A = \\pi \\times \\underline{\\qquad}$.', 'Luas bulatan berjejari $r$ ialah $A = \\pi \\times \\underline{\\qquad}$.', '$r^2$'],
        ['The circumference of a circle of radius $r$ is $C = \\underline{\\qquad}\\ r$.', 'Lilitan bulatan berjejari $r$ ialah $C = \\underline{\\qquad}\\ r$.', '$2\\pi$'],
        ['For any circle, $C \\div d$ is approximately ________.', 'Bagi mana-mana bulatan, $C \\div d$ adalah lebih kurang ________.', '3.14 ($\\pi$)'],
        ['The area of a circle of diameter $d$ is $A = \\pi \\times \\left(\\underline{\\qquad}\\right)^2$.', 'Luas bulatan berdiameter $d$ ialah $A = \\pi \\times \\left(\\underline{\\qquad}\\right)^2$.', '$\\dfrac{d}{2}$'],
        ['The ratio of the circumference of a circle to its diameter is called ________.', 'Nisbah lilitan bulatan kepada diameternya dipanggil ________.', '$\\pi$'],
        ['If the radius of a circle is doubled, its circumference is multiplied by ________.', 'Jika jejari sebuah bulatan digandakan, lilitannya didarab dengan ________.', '2'],
        ['If the radius of a circle is doubled, its area is multiplied by ________.', 'Jika jejari sebuah bulatan digandakan, luasnya didarab dengan ________.', '4'],
      ][v];
      return { q: T(`Fill in the blank: ${Q[0]}`, `Isi tempat kosong: ${Q[1]}`), a: T(Q[2]), w: W(T(`Remember $C = \\pi d = 2\\pi r$, $A = \\pi r^2$, and $\\pi = C \\div d$ for every circle.`, `Ingat $C = \\pi d = 2\\pi r$, $A = \\pi r^2$, dan $\\pi = C \\div d$ bagi setiap bulatan.`), T(`So the missing part is ${Q[2]}.`, `Maka bahagian yang tertinggal ialah ${Q[2]}.`)), sp: 'xs' };
    },
    (r) => {
      const kind = pkind(r), rr = prad(kind, r, 3, 15), semi = r.chance(), task = r.int(0, 1), u = r.pick(['cm', 'm']);
      const fig = (() => { const w = 240, h = 150, cx = 120, cy = 110, R = 80; return S.wrap(w, h, semi ? S.path(`M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy} Z`, { fill: 'currentColor', op: 0.15 }) + S.line(cx - R, cy + 12, cx + R, cy + 12, { w: 0.8 }) + S.text(cx, cy + 24, `${n(2 * rr)} ${u}`, { s: 12 }) : S.path(`M${cx - 45},${cy + 20} L${cx - 45},${cy + 20 - R} A${R},${R} 0 0 1 ${cx - 45 + R},${cy + 20} Z`, { fill: 'currentColor', op: 0.15 }) + S.text(cx - 45 + R / 2, cy + 34, `${n(rr)} ${u}`, { s: 12 }) + S.rightAngle([cx - 45, cy + 20], [cx - 45, cy + 20 - R], [cx - 45 + R, cy + 20], 9), w, h + 20, 'shape'); })();
      const p = task === 0 ? pv(kind, FR.mul(Af(rr), FR.make(1, semi ? 2 : 4)), u, 2) : pv(kind, FR.mul(Cf(rr), FR.make(1, semi ? 2 : 4)), u, 1);
      return { q: T(`${task === 0 ? 'Find the area' : 'Find the length of the curved edge'} of the ${semi ? `semicircle of diameter ${n(2 * rr)} ${u}` : `quadrant of radius ${n(rr)} ${u}`} shown. ${p.note[0]}`, `${task === 0 ? 'Cari luas' : 'Cari panjang tepi melengkung'} ${semi ? `semibulatan berdiameter ${n(2 * rr)} ${u}` : `sukuan bulatan berjejari ${n(rr)} ${u}`} dalam rajah. ${p.note[1]}`), fig, a: T(`$${p.s}$`), w: T(semi ? `Half of the circle` : `A quarter of the circle`, semi ? `Separuh bulatan` : `Suku bulatan`), sp: 's' };
    },
    (r) => {
      const kind = 'r22', rr = r.pick([7, 14, 21, 3.5, 10.5]), task = r.int(0, 1), u = r.pick(['cm', 'm']), st = r.int(0, 2);
      const C = 2 * rr * 22 / 7, A = rr * rr * 22 / 7;
      return { q: task === 0 ? [T(`The circumference of a circle is ${n(C)} ${u}. Find its radius. Use $\\pi = \\frac{22}{7}$.`, `Lilitan sebuah bulatan ialah ${n(C)} ${u}. Cari jejarinya. Gunakan $\\pi = \\frac{22}{7}$.`), T(`A circle has a circumference of ${n(C)} ${u}. Calculate its diameter. Use $\\pi = \\frac{22}{7}$.`, `Sebuah bulatan mempunyai lilitan ${n(C)} ${u}. Hitung diameternya. Gunakan $\\pi = \\frac{22}{7}$.`), T(`Given that the distance round a circle is ${n(C)} ${u}, find the length of its radius. Use $\\pi = \\frac{22}{7}$.`, `Diberi jarak mengelilingi sebuah bulatan ialah ${n(C)} ${u}, cari panjang jejarinya. Gunakan $\\pi = \\frac{22}{7}$.`)][st] : [T(`The area of a circle is ${n(A)} ${u}$^2$. Find its radius. Use $\\pi = \\frac{22}{7}$.`.replace(`${u}$^2$`, `$\\text{${u}}^2$`), `Luas sebuah bulatan ialah ${n(A)} $\\text{${u}}^2$. Cari jejarinya. Gunakan $\\pi = \\frac{22}{7}$.`), T(`A circle has area ${n(A)} $\\text{${u}}^2$. Find its radius. Use $\\pi = \\frac{22}{7}$.`, `Sebuah bulatan mempunyai luas ${n(A)} $\\text{${u}}^2$. Cari jejarinya. Gunakan $\\pi = \\frac{22}{7}$.`), T(`The area of a circular region is ${n(A)} $\\text{${u}}^2$. Calculate its diameter. Use $\\pi = \\frac{22}{7}$.`, `Luas sebuah kawasan bulat ialah ${n(A)} $\\text{${u}}^2$. Hitung diameternya. Gunakan $\\pi = \\frac{22}{7}$.`)][st], a: T(task === 0 ? (st === 1 ? `${2 * rr} ${u}` : `${rr} ${u}`) : (st === 2 ? `${2 * rr} ${u}` : `${rr} ${u}`)), w: task === 0 ? T(`$r = C \\div 2\\pi$`) : T(`$r^2 = A \\div \\pi$`), sp: 's' };
    },
    (r) => {
      const rs = r.sample([2, 3, 4, 5, 6, 7, 8, 10], 3).sort((a, b) => a - b), kind = pkind(r), col = r.int(0, 1);
      const rows = rs.map((x, i) => (i === 0 ? [`${x}`, `${2 * x}`, '?'] : i === 1 ? [`?`, `${2 * x}`, '?'] : [`${x}`, '?', '?']));
      const ps = rs.map((x) => pv(kind, col === 0 ? Cf(x) : Af(x), '', 1).s);
      const head = ['$r$ (cm)', '$d$ (cm)', col === 0 ? '$C$ (cm)' : '$A$ ($\\text{cm}^2$)'];
      const headM = head;
      const asw = rs.map((x, i) => (i === 0 ? `$${ps[i]}$` : i === 1 ? `$r = ${x}$ ; $${ps[i]}$` : `$d = ${2 * x}$ ; $${ps[i]}$`));
      return { q: T(`Complete the table for three circles. ${PNOTE[kind][0]}<br>${SPM.table(rows, { head })}`, `Lengkapkan jadual bagi tiga bulatan. ${PNOTE[kind][1]}<br>${SPM.table(rows, { head: headM })}`), a: T(asw.join(' ; ')), w: W(T(col === 0 ? `$C = 2\\pi r$ and $d = 2r$` : `$A = \\pi r^2$ and $d = 2r$`, col === 0 ? `$C = 2\\pi r$ dan $d = 2r$` : `$A = \\pi r^2$ dan $d = 2r$`), ...rs.map((x, i) => (i === 1 ? `$r = ${2 * x} \\div 2 = ${x}$, $${col === 0 ? `2\\pi \\times ${x}` : `\\pi \\times ${x}^2`} = ${ps[i]}$` : i === 2 ? `$d = 2 \\times ${x} = ${2 * x}$, $${col === 0 ? `2\\pi \\times ${x}` : `\\pi \\times ${x}^2`} = ${ps[i]}$` : `$${col === 0 ? `2\\pi \\times ${x}` : `\\pi \\times ${x}^2`} = ${ps[i]}$`))), sp: 'm' };
    },
    (r) => {
      const [se, sm, tv, re, rm2] = r.pick([
        ['If the radius of a circle is doubled, its circumference is doubled.', 'Jika jejari sebuah bulatan digandakan, lilitannya digandakan.', true, '$C = 2\\pi r$ is proportional to $r$.', '$C = 2\\pi r$ berkadar terus dengan $r$.'],
        ['If the radius of a circle is doubled, its area is doubled.', 'Jika jejari sebuah bulatan digandakan, luasnya digandakan.', false, '$A = \\pi r^2$, so the area becomes 4 times as large.', '$A = \\pi r^2$, maka luas menjadi 4 kali ganda.'],
        ['The circumference of a circle is always greater than three times its diameter.', 'Lilitan sebuah bulatan sentiasa lebih besar daripada tiga kali diameternya.', true, '$C = \\pi d$ and $\\pi > 3$.', '$C = \\pi d$ dan $\\pi > 3$.'],
        ['The area of a circle with diameter 10 cm is $\\pi \\times 10^2$.', 'Luas bulatan berdiameter 10 cm ialah $\\pi \\times 10^2$.', false, 'The radius is 5 cm, so the area is $\\pi \\times 5^2$.', 'Jejarinya 5 cm, maka luasnya $\\pi \\times 5^2$.'],
        ['A circle with circumference $10\\pi$ cm has a radius of 5 cm.', 'Bulatan berlilitan $10\\pi$ cm mempunyai jejari 5 cm.', true, '$2\\pi r = 10\\pi$ gives $r = 5$.', '$2\\pi r = 10\\pi$ memberi $r = 5$.'],
        ['The units of the area of a circle are the same as the units of its circumference.', 'Unit luas sebuah bulatan sama dengan unit lilitannya.', false, 'Area is in square units, e.g. $\\text{cm}^2$, while circumference is in $\\text{cm}$.', 'Luas dalam unit persegi, cth. $\\text{cm}^2$, manakala lilitan dalam $\\text{cm}$.'],
        ['The ratio $C \\div d$ is the same for every circle.', 'Nisbah $C \\div d$ adalah sama bagi setiap bulatan.', true, 'It always equals $\\pi$.', 'Ia sentiasa sama dengan $\\pi$.'],
        ['The area of a semicircle of radius $r$ is $\\pi r^2$.', 'Luas semibulatan berjejari $r$ ialah $\\pi r^2$.', false, 'It is half of the circle: $\\dfrac{1}{2}\\pi r^2$.', 'Ia separuh daripada bulatan: $\\dfrac{1}{2}\\pi r^2$.'],
      ]);
      return { q: T(`True or false? "${se}" Explain.`, `Betul atau salah? "${sm}" Terangkan.`), a: T(`${tv ? 'True' : 'False'}. ${re}`, `${tv ? 'Betul' : 'Salah'}. ${rm2}`), w: W(T(`Use $C = 2\\pi r = \\pi d$ and $A = \\pi r^2$: the circumference is proportional to $r$, but the area is proportional to $r^2$.`, `Guna $C = 2\\pi r = \\pi d$ dan $A = \\pi r^2$: lilitan berkadar terus dengan $r$, tetapi luas berkadar dengan $r^2$.`), T(re, rm2), T(`So the statement is ${tv ? 'true' : 'false'}.`, `Maka pernyataan itu ${tv ? 'betul' : 'salah'}.`)), sp: 's' };
    },
    (r) => {
      const rr = r.int(2, 6), ds = [2 * rr, 2 * rr + 2, 2 * rr + 4], Cs = ds.map((d) => round(d * 3.1416, 2)), v = r.int(0, 2);
      return { q: [T(`The table shows the diameter $d$ and circumference $C$ of three circles. Calculate $C \\div d$ for each (correct to 2 decimal places) and state what you notice.<br>${SPM.table([['$d$ (cm)', ...ds], ['$C$ (cm)', ...Cs]], { rowHead: true })}`, `Jadual menunjukkan diameter $d$ dan lilitan $C$ bagi tiga bulatan. Hitung $C \\div d$ bagi setiap satu (betul kepada 2 tempat perpuluhan) dan nyatakan apa yang anda perhatikan.<br>${SPM.table([['$d$ (cm)', ...ds], ['$C$ (cm)', ...Cs]], { rowHead: true })}`), T(`Three circular objects are measured: the diameters are ${ds.join(', ')} cm and the circumferences are ${Cs.join(', ')} cm. Find $C \\div d$ for each. What is the value approximately, and what does it show?`, `Tiga objek bulat diukur: diameternya ${ds.join(', ')} cm dan lilitannya ${Cs.join(', ')} cm. Cari $C \\div d$ bagi setiap satu. Berapakah nilainya kira-kira, dan apakah yang ditunjukkannya?`), T(`Nurul measures the distance round three round tins with a string: ${Cs.join(' cm, ')} cm, and their diameters ${ds.join(' cm, ')} cm. Calculate the ratio circumference : diameter for each tin.`, `Nurul mengukur jarak mengelilingi tiga tin bulat dengan tali: ${Cs.join(' cm, ')} cm, dan diameternya ${ds.join(' cm, ')} cm. Hitung nisbah lilitan : diameter bagi setiap tin.`)][v], a: T(`$${ds.map((d, i) => n(round(Cs[i] / d, 2))).join(', ')}$; the ratio is always about $3.14$ ($\\pi$)`, `$${ds.map((d, i) => n(round(Cs[i] / d, 2))).join(', ')}$; nisbahnya sentiasa lebih kurang $3.14$ ($\\pi$)`), w: W(...ds.map((dd, i) => `$${Cs[i]} \\div ${dd} = ${n(round(Cs[i] / dd, 2))}$`), T(`Every ratio is about $3.14$ — this constant is $\\pi$, and it is the same for every circle.`, `Setiap nisbah lebih kurang $3.14$ — pemalar ini ialah $\\pi$, dan ia sama bagi setiap bulatan.`)), sp: 'm' };
    },
  ];
  /** sector diagram: radius label rl, angle th (≤ 180 uses arc mark, larger too) */
  function secFig(rl, th, names) {
    const W = 240, H = 200, cx = 70, cy = 110, R = 92, a = rad(th), A = [cx + R, cy], B = [cx + R * Math.cos(a), cy - R * Math.sin(a)];
    const nm = names || ['O', 'A', 'B'], big = th > 180 ? 1 : 0;
    let out = S.path(`M${cx},${cy} L${A[0]},${cy} A${R},${R} 0 ${big} 0 ${B[0].toFixed(1)},${B[1].toFixed(1)} Z`, { fill: 'currentColor', op: 0.15 });
    out += S.path(`M${cx + 24},${cy} A24,24 0 ${big} 0 ${(cx + 24 * Math.cos(a)).toFixed(1)},${(cy - 24 * Math.sin(a)).toFixed(1)}`, { w: 1 });
    const m = a / 2;
    out += S.text(cx + 44 * Math.cos(m) + 8, cy - 44 * Math.sin(m), `${th}°`, { s: 12 }) + S.text(cx + R / 2, cy + 13, rl, { s: 12 });
    out += S.text(cx - 9, cy + 9, nm[0], { i: true }) + S.text(A[0] + 10, A[1] + 4, nm[1], { i: true }) + S.text(B[0] + 8 * Math.cos(a), B[1] - 10 * Math.sin(a) - 2, nm[2], { i: true });
    return S.wrap(W, H, out, 'sector');
  }
  const SCTX = [
    ['a slice of pizza', 'sehiris piza', 'pizza', 'cm'], ['a fan-shaped garden bed', 'batas taman berbentuk kipas', 'bed', 'm'], ['a sprinkler that waters a sector of lawn', 'penyiram yang menyiram sektor rumput', 'lawn', 'm'],
    ['a windscreen wiper blade sweep', 'sapuan bilah wiper cermin depan', 'wiper', 'cm'], ['a paper hand fan', 'sebuah kipas tangan kertas', 'fan', 'cm'], ['a lighthouse beam', 'pancaran rumah api', 'beam', 'km'],
  ];
  const g53m = [
    (r) => {
      const kind = pkind(r), rr = prad(kind, r, 3, 15), th = r.pick([30, 45, 60, 72, 90, 120, 135, 150, 40, 36, 20, 100, 80]), task = r.int(0, 2), u = r.pick(['cm', 'm']);
      const arc = pv(kind, FR.mul(sect(th), Cf(rr)), u, 1), ar = pv(kind, FR.mul(sect(th), Af(rr)), u, 2);
      const nt = (task === 0 ? arc : task === 1 ? ar : arc).note;
      const fig = secFig(`${n(rr)} ${u}`, th);
      const q = [[`The diagram shows a sector $AOB$ of a circle. Find the length of the arc $AB$.`, `Rajah menunjukkan sektor $AOB$ sebuah bulatan. Cari panjang lengkok $AB$.`], [`The diagram shows a sector $AOB$ with centre $O$. Find its area.`, `Rajah menunjukkan sektor $AOB$ berpusat $O$. Cari luasnya.`], [`For the sector $AOB$ shown, find (a) the arc length, (b) the area.`, `Bagi sektor $AOB$ yang ditunjukkan, cari (a) panjang lengkok, (b) luas.`]][task];
      return { q: nts(T(`${q[0].replace(/^(.*)$/, '$1')} ${nt[0]}`, `${q[1]} ${nt[1]}`)), fig, a: task === 0 ? T(`$${arc.s}$`) : task === 1 ? T(`$${ar.s}$`) : T(`(a) $${arc.s}$ (b) $${ar.s}$`), w: T(`Arc $= \\dfrac{${th}}{360} \\times 2\\pi r$; area $= \\dfrac{${th}}{360} \\times \\pi r^2$`, `Lengkok $= \\dfrac{${th}}{360} \\times 2\\pi r$; luas $= \\dfrac{${th}}{360} \\times \\pi r^2$`), sp: 'm' };
    },
    (r) => {
      const kind = pkind(r), rr = prad(kind, r, 3, 21), th = r.pick([30, 45, 60, 90, 120, 150, 180, 240, 270]), c = r.pick(SCTX), task = r.int(0, 1), u = c[3];
      const arc = pv(kind, FR.mul(sect(th), Cf(rr)), u, 1), ar = pv(kind, FR.mul(sect(th), Af(rr)), u, 2), p = task === 0 ? arc : ar;
      return { q: T(`${cap(c[0])} forms a sector of radius ${n(rr)} ${u} and angle $${th}^\\circ$. Find ${task === 0 ? 'the length of its curved edge' : 'its area'}. ${p.note[0]}`, `${cap(c[1])} membentuk sektor berjejari ${n(rr)} ${u} dan bersudut $${th}^\\circ$. Cari ${task === 0 ? 'panjang tepi melengkungnya' : 'luasnya'}. ${p.note[1]}`), a: T(`$${p.s}$`), w: W(T(`A sector of angle $${th}^\\circ$ is $\\dfrac{${th}}{360}$ of the whole circle.`, `Sektor bersudut $${th}^\\circ$ ialah $\\dfrac{${th}}{360}$ daripada bulatan penuh.`), T(task === 0 ? `Arc $= \\dfrac{${th}}{360} \\times 2\\pi r$` : `Area $= \\dfrac{${th}}{360} \\times \\pi r^2$`, task === 0 ? `Lengkok $= \\dfrac{${th}}{360} \\times 2\\pi r$` : `Luas $= \\dfrac{${th}}{360} \\times \\pi r^2$`), `$= \\dfrac{${th}}{360} \\times ${PIS[kind]} \\times ${task === 0 ? `2 \\times ${n(rr)}` : `${n(rr)}^2`} = ${p.s}$`), sp: 's' };
    },
    (r) => {
      const kind = pkind(r), rr = prad(kind, r, 3, 15), sh = r.pick(['semi', 'quad', 'sector']), th = sh === 'sector' ? r.pick([60, 120, 90, 45, 30, 150]) : sh === 'semi' ? 180 : 90, u = r.pick(['cm', 'm']);
      const arc = pv(kind, FR.mul(sect(th), Cf(rr)), u, 1);
      // perimeter = arc + straight edges
      const straight = sh === 'semi' ? 2 * rr : 2 * rr; // diameter or two radii
      let per;
      if (kind === 'exact') per = `${arc.s.replace(/\\ \\text\{[^}]*\}$/, '')} + ${n(straight)}\\ \\text{${u}}`.replace(/^(.*)\\ \\text\{[^}]*\}$/, '$1');
      else per = null;
      const arcNum = arc.v, perN = arcNum + straight;
      const ansS = kind === 'exact' ? `(${arc.s.replace(/\\ \\text\{[^}]*\}$/, '')} + ${n(straight)})\\ \\text{${u}}` : `${n(round(perN, 2))}\\ \\text{${u}}`;
      if (kind !== 'exact') need(true);
      const name = sh === 'semi' ? ['semicircle of diameter ' + n(2 * rr) + ' ' + u, 'semibulatan berdiameter ' + n(2 * rr) + ' ' + u] : sh === 'quad' ? ['quadrant of radius ' + n(rr) + ' ' + u, 'sukuan bulatan berjejari ' + n(rr) + ' ' + u] : [`sector of radius ${n(rr)} ${u} and angle ${th}°`, `sektor berjejari ${n(rr)} ${u} dan bersudut ${th}°`];
      // for 22/7 exactness of sum: arcs computed on multiples of 7 only produce terminating decimals when 100 % den = 0
      if (kind === 'r22') { const w = FR.mul(FR.mul(sect(th), Cf(rr)), FR.make(22, 7)); need(100 % w.d === 0); }
      return { q: T(`Find the perimeter of a ${name[0]}. Remember to include the straight edge${sh === 'semi' ? '' : 's'}. ${arc.note[0]}`, `Cari perimeter ${name[1]}. Ingat untuk memasukkan sisi lurus. ${arc.note[1]}`), a: T(`$${ansS}$`), w: T(`Arc length $+ ${sh === 'semi' ? 'diameter' : '2 \\times \\text{radius}'}$`, `Panjang lengkok $+ ${sh === 'semi' ? 'diameter' : '2 \\times \\text{jejari}'}$`), sp: 's' };
    },
    (r) => {
      const kind = pkind(r), R = prad(kind, r, 6, 21), rr = prad(kind, r, 2, R - 1), c = r.pick([['a circular pond', 'sebuah kolam bulat', 'a path', 'satu laluan'], ['a round flower bed', 'sebuah batas bunga bulat', 'a border of grass', 'satu sempadan rumput'], ['a circular fountain', 'sebuah air pancut bulat', 'a tiled edge', 'satu tepi berjubin']]), st = r.int(0, 1), u = 'm';
      need(R > rr);
      const w = FR.sub(Af(R), Af(rr)), p = pv(kind, w, u, 2);
      const fig = (() => { const W = 220, H = 190, cx = 110, cy = 95, RR = 84, rp = RR * rr / R; return S.wrap(W, H, S.path(`M${cx - RR},${cy} A${RR},${RR} 0 1 0 ${cx + RR},${cy} A${RR},${RR} 0 1 0 ${cx - RR},${cy} M${cx - rp},${cy} A${rp},${rp} 0 1 1 ${cx + rp},${cy} A${rp},${rp} 0 1 1 ${cx - rp},${cy}`, { fill: 'currentColor', op: 0.16 }) + S.circle(cx, cy, RR) + S.circle(cx, cy, rp) + S.dot(cx, cy, 2) + S.line(cx, cy, cx + rp, cy) + S.line(cx + rp, cy, cx + RR, cy, { w: 2.2 }) + S.text(cx + rp / 2, cy - 8, `${n(rr)}`, { s: 11 }) + S.text(cx + (rp + RR) / 2, cy + 12, `${n(R)}`, { s: 11 }), 'ring'); })();
      return { q: nts(st === 0 ? T(`The diagram shows two concentric circles with radii ${n(rr)} ${u} and ${n(R)} ${u}. Find the area of the shaded ring. ${p.note[0]}`, `Rajah menunjukkan dua bulatan sepusat dengan jejari ${n(rr)} ${u} dan ${n(R)} ${u}. Cari luas gelang berlorek. ${p.note[1]}`) : T(`${cap(c[0])} of radius ${n(rr)} ${u} is surrounded by ${c[2]} so that the outer edge is a circle of radius ${n(R)} ${u}. Find the area of ${c[2]}. ${p.note[0]}`, `${cap(c[1])} berjejari ${n(rr)} ${u} dikelilingi ${c[3]} supaya tepi luar ialah bulatan berjejari ${n(R)} ${u}. Cari luas ${c[3]}. ${p.note[1]}`)), fig: st === 0 ? fig : undefined, a: T(`$${p.s}$`), w: T(`$\\pi R^2 - \\pi r^2$ (not $\\pi (R - r)^2$)`, `$\\pi R^2 - \\pi r^2$ (bukan $\\pi (R - r)^2$)`), sp: 's' };
    },
    (r) => {
      const d = r.pick([28, 35, 42, 56, 70, 84, 14, 21, 49]), turns = r.int(5, 60), v = r.int(0, 3), ct = r.pick(['bicycle', 'lorry', 'motorcycle', 'trolley']), cm = { bicycle: 'basikal', lorry: 'lori', motorcycle: 'motosikal', trolley: 'troli' }[ct];
      const C = (22 * d) / 7, dist = C * turns;
      return { q: [T(`A ${ct} wheel has a diameter of ${d} cm. Find the distance travelled in one complete turn. Use $\\pi = \\frac{22}{7}$.`, `Roda ${cm} berdiameter ${d} cm. Cari jarak yang dilalui dalam satu putaran lengkap. Gunakan $\\pi = \\frac{22}{7}$.`), T(`The wheel of a ${ct} has a diameter of ${d} cm. How far does the ${ct} move when the wheel makes ${turns} complete turns? Give the answer in metres. Use $\\pi = \\frac{22}{7}$.`, `Roda ${cm} berdiameter ${d} cm. Berapa jauhkah ${cm} itu bergerak apabila roda membuat ${turns} putaran lengkap? Berikan jawapan dalam meter. Gunakan $\\pi = \\frac{22}{7}$.`), T(`A ${ct} wheel of diameter ${d} cm rolls along a road. How many complete turns does it make while the ${ct} travels ${n(dist / 100)} m? Use $\\pi = \\frac{22}{7}$.`, `Roda ${cm} berdiameter ${d} cm bergolek di sepanjang jalan. Berapakah bilangan putaran lengkap yang dibuat semasa ${cm} bergerak ${n(dist / 100)} m? Gunakan $\\pi = \\frac{22}{7}$.`), T(`How many metres does a ${ct} wheel of radius ${n(d / 2)} cm travel in ${turns} revolutions? Use $\\pi = \\frac{22}{7}$.`, `Berapa meterkah jarak yang dilalui roda ${cm} berjejari ${n(d / 2)} cm dalam ${turns} pusingan? Gunakan $\\pi = \\frac{22}{7}$.`)][v], a: v === 0 ? T(`${C} cm`) : v === 2 ? T(`${turns}`) : T(`${n(dist / 100)} m`), w: T(`$C = \\pi d = \\dfrac{22}{7} \\times ${d} = ${C}$ cm`), sp: 's' };
    },
    (r) => {
      const kind = pkind(r), rr = prad(kind, r, 3, 15), price = r.pick([3, 4, 5, 6, 8, 10, 12]), c = r.pick([['a circular garden', 'sebuah taman bulat', 'fence', 'pagar', 'fencing']]), v = r.int(0, 2), u = 'm';
      const C = pv(kind, Cf(rr), u, 1);
      const Cv = C.v || 0;
      const useExact = kind !== 'exact';
      need(useExact);
      const cost = round(Cv * price, 2);
      const Ar = pv(kind, Af(rr), u, 2), rate = r.pick([2, 3, 4, 5, 8]);
      const costA = round(Ar.v * rate, 2);
      return { q: v === 0 ? T(`A circular garden has a radius of ${n(rr)} m. A fence is built round its edge at a cost of RM${price} per metre. Find the cost of the fence. ${C.note[0].replace('correct to 2 decimal places', 'correct to 2 decimal places')}`, `Sebuah taman bulat berjejari ${n(rr)} m. Pagar dibina di sekeliling tepinya dengan kos RM${price} setiap meter. Cari kos pagar itu. ${C.note[1]}`) : v === 1 ? T(`The circular top of a table has a radius of ${n(rr)} m. It is painted at RM${rate} per square metre. Find the cost of painting the top. ${Ar.note[0]}`, `Permukaan atas sebuah meja bulat berjejari ${n(rr)} m. Ia dicat dengan kos RM${rate} setiap meter persegi. Cari kos mengecat permukaan atas itu. ${Ar.note[1]}`) : T(`Grass seed is sown on a circular lawn of diameter ${n(2 * rr)} m at RM${rate} per square metre. Find the total cost. ${Ar.note[0]}`, `Benih rumput ditabur di atas padang bulat berdiameter ${n(2 * rr)} m dengan kos RM${rate} setiap meter persegi. Cari jumlah kos. ${Ar.note[1]}`), a: T(v === 0 ? `RM${n(cost)}` : `RM${n(costA)}`), w: T(v === 0 ? `Cost $= C \\times ${price}$` : `Cost $= A \\times ${rate}$`, v === 0 ? `Kos $= C \\times ${price}$` : `Kos $= A \\times ${rate}$`), sp: 's' };
    },
    (r) => {
      const kind = pkind(r), rr = prad(kind, r, 3, 14), L = r.int(4, 20), u = 'cm', v = r.int(0, 1);
      const w2 = 2 * rr;
      const fig = (() => { const W = 260, H = 150, sc = 100 / Math.max(L, w2) * 1.3; const lx = 40, ty = 30, hh = w2 * sc, ww = L * sc; const rp = hh / 2; return S.wrap(W, H, S.path(`M${lx},${ty} L${lx + ww},${ty} A${rp},${rp} 0 0 1 ${lx + ww},${ty + hh} L${lx},${ty + hh} Z`, { fill: 'currentColor', op: 0.15 }) + S.text(lx + ww / 2, ty + hh + 14, `${L} ${u}`, { s: 12 }) + S.text(lx - 20, ty + hh / 2, `${n(w2)} ${u}`, { s: 12 }), 'shape'); })();
      const semiA = FR.mul(Af(rr), FR.make(1, 2)), area = pv(kind, semiA, u, 2), semiP = pv(kind, Cf(rr), u, 1);
      let ans;
      if (v === 0) {
        if (kind === 'exact') ans = `(${L * w2} + ${area.s.replace(/\\ \\text\{[^}]*\}\^2$/, '')})\\ \\text{${u}}^2`;
        else ans = `${n(round(L * w2 + area.v, 2))}\\ \\text{${u}}^2`;
      } else {
        const semiArc = pv(kind, FR.mul(Cf(rr), FR.make(1, 2)), u, 1);
        if (kind === 'exact') ans = `(${2 * L + w2} + ${semiArc.s.replace(/\\ \\text\{[^}]*\}$/, '')})\\ \\text{${u}}`;
        else ans = `${n(round(2 * L + w2 - w2 + semiArc.v + w2, 2))}\\ \\text{${u}}`;
      }
      if (kind === 'r22') { const wch = FR.mul(FR.mul(Af(rr), FR.make(1, 2)), FR.make(22, 7)); need(100 % wch.d === 0); const c2 = FR.mul(Cf(rr), FR.make(11, 7)); need(100 % c2.d === 0); }
      const pnt = v === 0 ? area.note : semiP.note;
      return { q: nts(T(`The diagram shows a rectangle ${L} ${u} by ${n(w2)} ${u} with a semicircle on one of its ${n(w2)} ${u} sides. Find the ${v === 0 ? 'total area' : 'perimeter'} of the shape. ${pnt[0]}`, `Rajah menunjukkan sebuah segi empat tepat ${L} ${u} kali ${n(w2)} ${u} dengan semibulatan pada satu sisinya yang ${n(w2)} ${u}. Cari ${v === 0 ? 'jumlah luas' : 'perimeter'} bentuk itu. ${pnt[1]}`)), fig, a: T(`$${ans}$`), w: v === 0 ? T(`Rectangle plus semicircle of radius ${n(rr)} ${u}`, `Segi empat tepat tambah semibulatan berjejari ${n(rr)} ${u}`) : T(`Two lengths of ${L} ${u}, one side of ${n(w2)} ${u} and the semicircular arc`, `Dua panjang ${L} ${u}, satu sisi ${n(w2)} ${u} dan lengkok separuh bulatan`), sp: 'm' };
    },
    (r) => {
      const v = r.int(0, 3);
      const Q = [
        ['A circle is cut into many thin equal sectors that are arranged alternately to form a shape close to a rectangle. If the radius is $r$, what are the height and the length (base) of this rectangle?', 'Sebuah bulatan dipotong kepada banyak sektor nipis yang sama dan disusun secara berselang-seli untuk membentuk bentuk yang hampir dengan segi empat tepat. Jika jejari ialah $r$, apakah tinggi dan panjang (tapak) segi empat tepat ini?', 'Height $= r$; base $= \\pi r$ (half the circumference).', 'Tinggi $= r$; tapak $= \\pi r$ (separuh lilitan).'],
        ['Use your answer about the rearranged sectors to show that the area of a circle is $\\pi r^2$.', 'Gunakan jawapan anda tentang sektor yang disusun semula untuk menunjukkan bahawa luas sebuah bulatan ialah $\\pi r^2$.', 'Area of rectangle $=$ base $\\times$ height $= \\pi r \\times r = \\pi r^2$, and the area is unchanged by rearranging.', 'Luas segi empat tepat $=$ tapak $\\times$ tinggi $= \\pi r \\times r = \\pi r^2$, dan luas tidak berubah apabila disusun semula.'],
        ['Why is the shape made from a finite number of sectors only an approximation of a rectangle, and what happens as the number of sectors increases?', 'Mengapa bentuk yang dibuat daripada bilangan sektor terhingga hanyalah anggaran segi empat tepat, dan apakah yang berlaku apabila bilangan sektor bertambah?', 'The edges are slightly curved (arcs). As more, thinner sectors are used, the arcs become almost straight and the shape gets closer to a rectangle.', 'Tepinya sedikit melengkung (lengkok). Apabila lebih banyak sektor yang lebih nipis digunakan, lengkok menjadi hampir lurus dan bentuk semakin menghampiri segi empat tepat.'],
        ['Show that $C = \\pi d$ implies $C = 2\\pi r$.', 'Tunjukkan bahawa $C = \\pi d$ membawa kepada $C = 2\\pi r$.', 'The diameter is twice the radius, so $d = 2r$ and $C = \\pi d = \\pi \\times 2r = 2\\pi r$.', 'Diameter ialah dua kali jejari, maka $d = 2r$ dan $C = \\pi d = \\pi \\times 2r = 2\\pi r$.'],
      ][v];
      return { q: T(Q[0], Q[1]), a: T(Q[2], Q[3]), w: W(T(`Cut the circle into many thin sectors and lay them head to tail: the height of the strip is the radius $r$ and its base is half the circumference.`, `Potong bulatan kepada banyak sektor nipis dan susunnya berselang-seli: tinggi jalur itu ialah jejari $r$ dan tapaknya separuh lilitan.`), `$\\dfrac{1}{2} \\times 2\\pi r = \\pi r$`, `$A = \\pi r \\times r = \\pi r^2$`, T(`Also $d = 2r$, so $C = \\pi d = 2\\pi r$.`, `Juga $d = 2r$, maka $C = \\pi d = 2\\pi r$.`)), sp: v === 2 ? 'm' : 's' };
    },
    (r) => {
      const rr = r.pick([7, 14, 21]), th = r.pick([30, 45, 60, 90, 120, 150, 180, 240, 270]), v = r.int(0, 2);
      const arc = (th / 360) * 2 * (22 / 7) * rr, area = (th / 360) * (22 / 7) * rr * rr;
      need(Math.abs(arc * 100 - Math.round(arc * 100)) < 1e-6 && Math.abs(area * 100 - Math.round(area * 100)) < 1e-6);
      return { q: [T(`The arc of a sector of radius ${rr} cm has length ${n(round(arc, 2))} cm. Find the angle of the sector. Use $\\pi = \\frac{22}{7}$.`, `Lengkok sebuah sektor berjejari ${rr} cm mempunyai panjang ${n(round(arc, 2))} cm. Cari sudut sektor itu. Gunakan $\\pi = \\frac{22}{7}$.`), T(`A sector of a circle of radius ${rr} cm has area ${n(round(area, 2))} $\\text{cm}^2$. Find the angle at the centre. Use $\\pi = \\frac{22}{7}$.`, `Sektor sebuah bulatan berjejari ${rr} cm mempunyai luas ${n(round(area, 2))} $\\text{cm}^2$. Cari sudut di pusat. Gunakan $\\pi = \\frac{22}{7}$.`), T(`The curved edge of a sector is ${n(round(arc, 2))} cm and the radius is ${rr} cm. What fraction of the whole circle is the sector, and what is its angle? Use $\\pi = \\frac{22}{7}$.`, `Tepi melengkung sebuah sektor ialah ${n(round(arc, 2))} cm dan jejarinya ${rr} cm. Berapakah pecahan bulatan penuh yang diwakili sektor itu, dan berapakah sudutnya? Gunakan $\\pi = \\frac{22}{7}$.`)][v], a: v === 2 ? T(`$\\dfrac{${th / gcd(th, 360)}}{${360 / gcd(th, 360)}}$ ; $${th}^\\circ$`) : T(`$${th}^\\circ$`), w: T(`$\\dfrac{\\theta}{360} = \\dfrac{\\text{arc}}{\\text{circumference}}$`, `$\\dfrac{\\theta}{360} = \\dfrac{\\text{lengkok}}{\\text{lilitan}}$`), sp: 'm' };
    },
    (r) => {
      const r1 = r.int(2, 9), m2 = r.pick([2, 3, 4, 5]), kind = pkind(r), v = r.int(0, 3);
      const r2 = r1 * m2;
      const p = v === 0 ? pv(kind, Cf(r2 - r1), 'cm', 1) : null;
      return { q: [T(`The radius of circle $B$ is ${m2} times the radius of circle $A$. Find the ratio (a) of their circumferences, (b) of their areas.`, `Jejari bulatan $B$ ialah ${m2} kali jejari bulatan $A$. Cari nisbah (a) lilitan kedua-duanya, (b) luas kedua-duanya.`), T(`Circle $A$ has radius ${r1} cm and circle $B$ has radius ${r2} cm. By how many times is the area of $B$ larger than the area of $A$?`, `Bulatan $A$ berjejari ${r1} cm dan bulatan $B$ berjejari ${r2} cm. Berapa kalikah luas $B$ lebih besar daripada luas $A$?`), T(`The radius of a circle is increased from ${r1} cm to ${r2} cm. By what factor do the circumference and the area increase?`, `Jejari sebuah bulatan ditambah daripada ${r1} cm kepada ${r2} cm. Dengan faktor berapakah lilitan dan luas bertambah?`), T(`A circle's radius is multiplied by ${m2}. Write down the factor by which its circumference is multiplied, and the factor for its area.`, `Jejari sebuah bulatan didarab dengan ${m2}. Tuliskan faktor lilitannya didarab, dan faktor bagi luasnya.`)][v], a: v === 1 ? T(`${m2 * m2} times`, `${m2 * m2} kali`) : T(`(a) $1 : ${m2}$ (b) $1 : ${m2 * m2}$`.replace('(a)', v === 0 ? '(a)' : '(a)').replace(/^/, ''), `(a) $1 : ${m2}$ (b) $1 : ${m2 * m2}$`), w: W(T(`$C = 2\\pi r$, so the circumferences are in the same ratio as the radii.`, `$C = 2\\pi r$, maka lilitan berada dalam nisbah yang sama dengan jejari.`), `$1 : ${m2}$`, T(`$A = \\pi r^2$, so the areas are in the ratio of the squares.`, `$A = \\pi r^2$, maka luas berada dalam nisbah kuasa dua.`), `$1^2 : ${m2}^2 = 1 : ${m2 * m2}$`), sp: 's' };
    },
  ];
  const stripU = (s) => s.replace(/\\ \\text\{[^}]*\}(\^2)?$/, '');
  const g53a = [
    (r) => {
      const kind = pkind(r), rr = prad(kind, r, 3, 14), sh = r.pick(['sqCirc', 'quart', 'rectSemi']), u = r.pick(['cm', 'm']);
      const s = 2 * rr;
      let area, fig, en, ms;
      const W = 240, H = 200;
      if (sh === 'sqCirc') {
        area = FR.sub(FR.make(s * s), Af(rr));
        fig = S.wrap(W, H, S.rect(50, 20, 140, 140, { fill: 'currentColor', op: 0.2 }) + S.circle(120, 90, 70, { fill: 'var(--bg,#fff)' }) + S.text(120, 176, `${s} ${u}`, { s: 12 }), 'square');
        en = `The diagram shows a circle that just touches all four sides of a square of side ${s} ${u}. Find the area of the shaded region.`; ms = `Rajah menunjukkan sebuah bulatan yang menyentuh keempat-empat sisi sebuah segi empat sama bersisi ${s} ${u}. Cari luas kawasan berlorek.`;
      } else if (sh === 'quart') {
        area = FR.sub(FR.make(s * s), FR.mul(Af(s / 2 === Math.floor(s / 2) ? s : s), FR.make(1, 4)));
        fig = S.wrap(W, H, S.rect(50, 20, 140, 140, { fill: 'currentColor', op: 0.2 }) + S.path('M50,160 L50,20 A140,140 0 0 1 190,160 Z', { fill: 'var(--bg,#fff)' }) + S.text(120, 176, `${s} ${u}`, { s: 12 }), 'square');
        en = `The diagram shows a square of side ${s} ${u} with a quadrant of a circle of radius ${s} ${u} centred at one corner. Find the area of the shaded region.`; ms = `Rajah menunjukkan sebuah segi empat sama bersisi ${s} ${u} dengan sukuan bulatan berjejari ${s} ${u} berpusat pada satu penjuru. Cari luas kawasan berlorek.`;
      } else {
        const L = r.int(5, 18);
        area = FR.sub(FR.make(L * s), FR.mul(Af(rr), FR.make(1, 2)));
        const sc = 120 / Math.max(L, s) * 1.15, ww = L * sc, hh = s * sc;
        fig = S.wrap(W + 20, H - 40, S.rect(30, 20, ww, hh, { fill: 'currentColor', op: 0.2 }) + S.path(`M${30 + ww},20 A${hh / 2},${hh / 2} 0 0 0 ${30 + ww},${20 + hh} Z`, { fill: 'var(--bg,#fff)' }) + S.text(30 + ww / 2, 20 + hh + 14, `${L} ${u}`, { s: 12 }) + S.text(16, 20 + hh / 2, `${s}`, { s: 12 }), 'rectangle');
        en = `The diagram shows a rectangle ${L} ${u} by ${s} ${u} from which a semicircle, with a ${s} ${u} side of the rectangle as diameter, has been cut out. Find the area of the shaded region.`; ms = `Rajah menunjukkan sebuah segi empat tepat ${L} ${u} kali ${s} ${u} yang darinya satu semibulatan, dengan sisi ${s} ${u} segi empat tepat sebagai diameter, telah dipotong. Cari luas kawasan berlorek.`;
      }
      const p = pv(kind, sh === 'sqCirc' ? Af(rr) : sh === 'quart' ? FR.mul(Af(s), FR.make(1, 4)) : FR.mul(Af(rr), FR.make(1, 2)), u, 2);
      // total shaded
      const sq = sh === 'rectSemi' ? Math.round(FR.val(FR.sub(FR.make(0), FR.make(0)))) : 0;
      const fullArea = sh === 'rectSemi' ? null : s * s;
      let ans;
      const cutStr = stripU(p.s);
      const base = sh === 'rectSemi' ? Number(en.match(/rectangle (\d+)/)[1]) * s : s * s;
      if (kind === 'exact') ans = `(${base} - ${cutStr})\\ \\text{${u}}^2`;
      else ans = `${n(round(base - p.v, 2))}\\ \\text{${u}}^2`;
      if (kind === 'r22') { const wch = FR.mul(sh === 'sqCirc' ? Af(rr) : sh === 'quart' ? FR.mul(Af(s), FR.make(1, 4)) : FR.mul(Af(rr), FR.make(1, 2)), FR.make(22, 7)); need(100 % wch.d === 0); }
      return { q: nts(T(`${en} ${p.note[0]}`, `${ms} ${p.note[1]}`)), fig, a: T(`$${ans}$`), w: T(`Shaded area $=$ area of ${sh === 'sqCirc' ? 'square' : sh === 'quart' ? 'square' : 'rectangle'} $-$ area of ${sh === 'sqCirc' ? 'circle' : sh === 'quart' ? 'quadrant' : 'semicircle'}`, `Luas berlorek $=$ luas ${sh === 'sqCirc' ? 'segi empat sama' : sh === 'quart' ? 'segi empat sama' : 'segi empat tepat'} $-$ luas ${sh === 'sqCirc' ? 'bulatan' : sh === 'quart' ? 'sukuan bulatan' : 'semibulatan'}`), sp: 'm' };
    },
    (r) => {
      const rr = r.pick([7, 14, 21]), s = r.int(20, 80), v = r.int(0, 2);
      const per = 2 * s + (44 / 7) * rr, ar = 2 * rr * s + (22 / 7) * rr * rr;
      const W = 280, H = 140, sc = 1.2, ww = 150, hh = 70;
      const fig = S.wrap(W, H, S.path(`M70,35 L${70 + ww},35 A35,35 0 0 1 ${70 + ww},105 L70,105 A35,35 0 0 1 70,35 Z`, { fill: 'currentColor', op: 0.15 }) + S.text(70 + ww / 2, 25, `${s} m`, { s: 12 }) + S.line(70 + ww + 35, 70, 70 + ww, 70, { w: 0.8 }) + S.text(70 + ww + 19, 62, `${rr} m`, { s: 11 }), 'track');
      return { q: nts([T(`A running track has two straight sides each ${s} m long and two semicircular ends of radius ${rr} m. Find (a) the perimeter of the track, (b) the area enclosed. Use $\\pi = \\frac{22}{7}$.`, `Sebuah trek larian mempunyai dua sisi lurus, setiap satu ${s} m panjang dan dua hujung separuh bulatan berjejari ${rr} m. Cari (a) perimeter trek itu, (b) luas yang dikelilingi. Gunakan $\\pi = \\frac{22}{7}$.`), T(`The diagram shows the plan of a field: a rectangle with a semicircle at each end. Find the distance of one lap and the area of the field. Use $\\pi = \\frac{22}{7}$.`, `Rajah menunjukkan pelan sebuah padang: segi empat tepat dengan semibulatan pada setiap hujung. Cari jarak satu pusingan dan luas padang itu. Gunakan $\\pi = \\frac{22}{7}$.`), T(`Ali runs ${v === 2 ? 5 : 3} laps of the track shown (straight sides ${s} m, semicircular ends of radius ${rr} m). Find the distance he runs and the area of the inside of the track. Use $\\pi = \\frac{22}{7}$.`, `Ali berlari ${v === 2 ? 5 : 3} pusingan trek yang ditunjukkan (sisi lurus ${s} m, hujung separuh bulatan berjejari ${rr} m). Cari jarak yang dilarinya dan luas bahagian dalam trek. Gunakan $\\pi = \\frac{22}{7}$.`)][v]), fig, a: v === 2 ? T(`${n(per * 5)} m ; ${n(ar)} $\\text{m}^2$`.replace('$\\text{m}^2$', '$\\text{m}^2$')) : v === 1 ? T(`${n(per)} m ; ${n(ar)} $\\text{m}^2$`) : v === 0 ? T(`(a) ${n(per)} m (b) ${n(ar)} $\\text{m}^2$`) : T(`${n(per * 3)} m ; ${n(ar)} $\\text{m}^2$`), w: T(`The two semicircles make one full circle of radius ${rr} m.`, `Dua semibulatan membentuk satu bulatan penuh berjejari ${rr} m.`), sp: 'm' };
    },
    (r) => {
      const rr = r.pick([7, 14, 21, 28]), th = r.pick([60, 90, 120, 180, 270, 45, 30]), v = r.int(0, 2);
      const arc = (th / 360) * 2 * (22 / 7) * rr, area = (th / 360) * (22 / 7) * rr * rr;
      need(Math.abs(arc * 100 - Math.round(arc * 100)) < 1e-6 && Math.abs(area * 100 - Math.round(area * 100)) < 1e-6);
      const per = arc + 2 * rr;
      return { q: [T(`A sector of a circle has radius ${rr} cm and angle $${th}^\\circ$. Find (a) its perimeter, (b) its area. Use $\\pi = \\frac{22}{7}$.`, `Sebuah sektor bulatan berjejari ${rr} cm dan bersudut $${th}^\\circ$. Cari (a) perimeternya, (b) luasnya. Gunakan $\\pi = \\frac{22}{7}$.`), T(`The perimeter of a sector of radius ${rr} cm and angle $${th}^\\circ$ is the arc length plus two radii. Find the perimeter and the ratio of the arc length to the total perimeter (in its simplest form). Use $\\pi = \\frac{22}{7}$.`, `Perimeter sebuah sektor berjejari ${rr} cm dan bersudut $${th}^\\circ$ ialah panjang lengkok tambah dua jejari. Cari perimeter dan nisbah panjang lengkok kepada jumlah perimeter (dalam bentuk termudah). Gunakan $\\pi = \\frac{22}{7}$.`), T(`A cake of radius ${rr} cm is cut into a slice with angle $${th}^\\circ$ at the centre. Find the area of the top of the slice and the length of the crust. Use $\\pi = \\frac{22}{7}$.`, `Sebiji kek berjejari ${rr} cm dipotong menjadi satu hirisan dengan sudut $${th}^\\circ$ di pusat. Cari luas permukaan atas hirisan dan panjang kerak. Gunakan $\\pi = \\frac{22}{7}$.`)][v], a: v === 0 ? T(`(a) ${n(round(per, 2))} cm (b) ${n(round(area, 2))} $\\text{cm}^2$`) : v === 1 ? (() => { const g = gcd(Math.round(arc * 100), Math.round(per * 100)); return T(`${n(round(per, 2))} cm ; $${Math.round(arc * 100) / g} : ${Math.round(per * 100) / g}$`); })() : T(`${n(round(area, 2))} $\\text{cm}^2$ ; ${n(round(arc, 2))} cm`), w: W(T(`The sector is $\\dfrac{${th}}{360}$ of the whole circle.`, `Sektor itu ialah $\\dfrac{${th}}{360}$ daripada bulatan penuh.`), T(`Arc $= \\dfrac{${th}}{360} \\times 2 \\times \\dfrac{22}{7} \\times ${rr} = ${n(round(arc, 2))}$ cm`, `Lengkok $= \\dfrac{${th}}{360} \\times 2 \\times \\dfrac{22}{7} \\times ${rr} = ${n(round(arc, 2))}$ cm`), T(`Perimeter $= ${n(round(arc, 2))} + 2 \\times ${rr} = ${n(round(per, 2))}$ cm`, `Perimeter $= ${n(round(arc, 2))} + 2 \\times ${rr} = ${n(round(per, 2))}$ cm`), T(`Area $= \\dfrac{${th}}{360} \\times \\dfrac{22}{7} \\times ${rr}^2 = ${n(round(area, 2))}\\ \\text{cm}^2$`, `Luas $= \\dfrac{${th}}{360} \\times \\dfrac{22}{7} \\times ${rr}^2 = ${n(round(area, 2))}\\ \\text{cm}^2$`)), sp: 'm' };
    },
    (r) => {
      const d = r.pick([28, 35, 42, 56, 70, 84, 14, 21]), turns = r.int(50, 500), v = r.int(0, 2);
      const C = (22 * d) / 7, dist = (C * turns) / 100;
      const perMin = r.pick([60, 100, 120, 150, 200]);
      const speedKmh = (C * perMin * 60) / 100000;
      return { q: [T(`A wheel makes ${turns} complete turns to travel ${n(dist)} m. Find the diameter of the wheel in centimetres. Use $\\pi = \\frac{22}{7}$.`, `Sebuah roda membuat ${turns} putaran lengkap untuk bergerak ${n(dist)} m. Cari diameter roda itu dalam sentimeter. Gunakan $\\pi = \\frac{22}{7}$.`), T(`The wheel of a bicycle has diameter ${d} cm and turns ${perMin} times a minute. Find the speed of the bicycle in kilometres per hour. Use $\\pi = \\frac{22}{7}$.`, `Roda sebuah basikal berdiameter ${d} cm dan berpusing ${perMin} kali seminit. Cari laju basikal itu dalam kilometer sejam. Gunakan $\\pi = \\frac{22}{7}$.`), T(`A car wheel of radius ${n(d / 2)} cm rotates ${turns} times. How far does the car travel, in metres? Use $\\pi = \\frac{22}{7}$.`, `Roda sebuah kereta berjejari ${n(d / 2)} cm berpusing ${turns} kali. Berapa jauhkah kereta itu bergerak, dalam meter? Gunakan $\\pi = \\frac{22}{7}$.`)][v], a: v === 0 ? T(`${d} cm`) : v === 1 ? T(`${n(round(speedKmh, 2))} km/h`) : T(`${n(dist)} m`), w: v === 1 ? T(`Distance per minute $= ${n(C * perMin)}$ cm; per hour $= ${n(C * perMin * 60)}$ cm`, `Jarak seminit $= ${n(C * perMin)}$ cm; sejam $= ${n(C * perMin * 60)}$ cm`) : T(`$C = \\pi d$`), sp: 'm' };
    },
    (r) => {
      const R = r.pick([21, 28, 35, 14]), rr = r.pick([7, 14]), th = r.pick([90, 120, 60, 180, 150, 45, 30]);
      need(R > rr);
      const ar = (th / 360) * (22 / 7) * (R * R - rr * rr);
      need(Math.abs(ar * 100 - Math.round(ar * 100)) < 1e-6);
      const v = r.int(0, 1);
      return { q: v === 0 ? T(`A windscreen wiper has a blade from ${rr} cm to ${R} cm from its pivot and it sweeps through an angle of $${th}^\\circ$. Find the area swept by the blade. Use $\\pi = \\frac{22}{7}$.`, `Sebuah wiper cermin depan mempunyai bilah dari ${rr} cm hingga ${R} cm dari pemutarnya dan menyapu melalui sudut $${th}^\\circ$. Cari luas yang disapu oleh bilah itu. Gunakan $\\pi = \\frac{22}{7}$.`) : T(`Two arcs with the same centre $O$ and radii ${rr} cm and ${R} cm are cut by two radii making $${th}^\\circ$. Find the area of the region between the arcs and the radii. Use $\\pi = \\frac{22}{7}$.`, `Dua lengkok berpusat $O$ yang sama dengan jejari ${rr} cm dan ${R} cm dipotong oleh dua jejari yang membentuk $${th}^\\circ$. Cari luas kawasan antara lengkok dan jejari itu. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${n(round(ar, 2))} $\\text{cm}^2$`), w: T(`Sector of radius ${R} $-$ sector of radius ${rr}`.replace('$-$', '-'), `Sektor berjejari ${R} - sektor berjejari ${rr}`), sp: 'm' };
    },
    (r) => {
      const L = r.pick([7, 14, 21, 28]), sh = r.pick([['a corner of a rectangular shed', 'sebuah penjuru bangsal segi empat tepat', 3, 4], ['the middle of one wall of a long fence', 'tengah satu dinding pagar yang panjang', 1, 2], ['the outside corner of a square barn', 'penjuru luar sebuah kandang segi empat sama', 3, 4]]), v = r.int(0, 1);
      const frac = sh[2] / sh[3], area = frac * (22 / 7) * L * L;
      need(Math.abs(area * 100 - Math.round(area * 100)) < 1e-6);
      const ct = r.pick([['A goat', 'Seekor kambing', 'grass', 'rumput'], ['A cow', 'Seekor lembu', 'grass', 'rumput'], ['A dog', 'Seekor anjing', 'the ground', 'tanah']]);
      return { q: T(`${ct[0]} is tied by a rope of length ${L} m to ${sh[0]}. It can graze over a ${sh[2] === 1 ? 'half' : 'three-quarter'} circle. Find the area of ${ct[2]} it can reach. Use $\\pi = \\frac{22}{7}$.`, `${ct[1]} ditambat dengan tali sepanjang ${L} m pada ${sh[1]}. Ia boleh meragut pada ${sh[2] === 1 ? 'separuh' : 'tiga perempat'} bulatan. Cari luas ${ct[3]} yang boleh dicapainya. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${n(round(area, 2))} $\\text{m}^2$`), w: T(`Fraction of circle $= \\dfrac{${sh[2]}}{${sh[3]}}$`, `Pecahan bulatan $= \\dfrac{${sh[2]}}{${sh[3]}}$`), sp: 'm' };
    },
    (r) => {
      const d1 = r.pick([20, 24, 30, 36]), d2 = r.pick([10, 12, 15, 18]), p1 = r.pick([10, 12, 14, 18, 20]), v = r.int(0, 1);
      need(d1 > d2);
      const a1 = 3.14 * (d1 / 2) ** 2, a2 = 3.14 * (d2 / 2) ** 2;
      const price2 = r.pick([4, 5, 6, 8]), price1 = round(price2 * (d1 * d1) / (d2 * d2) + r.pick([-1, 1, 2]), 0);
      need(price1 > 0);
      const c1 = price1 / a1, c2 = price2 / a2;
      return { q: T(`A ${d1} cm pizza costs RM${price1} and a ${d2} cm pizza costs RM${price2}. Which pizza gives more pizza per ringgit? Compare the price per square centimetre. Use $\\pi = 3.14$.`, `Piza ${d1} cm berharga RM${price1} dan piza ${d2} cm berharga RM${price2}. Piza manakah memberi lebih banyak piza bagi setiap ringgit? Bandingkan harga setiap sentimeter persegi. Gunakan $\\pi = 3.14$.`), a: T(`${d1} cm: RM${n(round(c1, 4))} per $\\text{cm}^2$; ${d2} cm: RM${n(round(c2, 4))} per $\\text{cm}^2$. The ${c1 < c2 ? d1 : d2} cm pizza is better value.`, `${d1} cm: RM${n(round(c1, 4))} setiap $\\text{cm}^2$; ${d2} cm: RM${n(round(c2, 4))} setiap $\\text{cm}^2$. Piza ${c1 < c2 ? d1 : d2} cm lebih bernilai.`), w: W(T(`Area $= \\pi r^2$, and the radius is half the diameter.`, `Luas $= \\pi r^2$, dan jejari ialah separuh diameter.`), `$3.14 \\times ${d1 / 2}^2 = ${n(round(a1, 2))}$`, `$3.14 \\times ${d2 / 2}^2 = ${n(round(a2, 2))}$`, `$${price1} \\div ${n(round(a1, 2))} \\approx ${n(round(c1, 4))}$`, `$${price2} \\div ${n(round(a2, 2))} \\approx ${n(round(c2, 4))}$`, T(`The lower price per $\\text{cm}^2$ is the better buy: the ${c1 < c2 ? d1 : d2} cm pizza.`, `Harga setiap $\\text{cm}^2$ yang lebih rendah lebih berbaloi: piza ${c1 < c2 ? d1 : d2} cm.`)), sp: 'm' };
    },
    (r) => {
      const k = r.pick([1, 2, 3, 4]), v = r.int(0, 2);
      const kk = k === 1 ? '' : `${k}`, eqA = k === 1 ? 'A = C' : `A = ${k}C`, eqB = k === 1 ? '\\pi r^2 = 2\\pi r' : `\\pi r^2 = ${k} \\times 2\\pi r`;
      return { q: [T(`The area of a circle is numerically equal to ${k === 1 ? '' : k + ' times '}its circumference. Find the radius.`, `Luas sebuah bulatan sama nilainya dengan ${k === 1 ? '' : k + ' kali '}lilitannya. Cari jejari.`), T(`Find the radius of the circle for which the number giving its area is ${k === 1 ? 'equal to' : k + ' times'} the number giving its circumference.`, `Cari jejari bulatan yang nombor luasnya ${k === 1 ? 'sama dengan' : k + ' kali'} nombor lilitannya.`), T(`For a certain circle, $${eqA}$ numerically. Use $${eqB}$ to find $r$.`, `Bagi sebuah bulatan tertentu, $${eqA}$ secara berangka. Gunakan $${eqB}$ untuk mencari $r$.`)][v], a: T(`$r = ${2 * k}$`), w: T(`$${eqB}$, so $r = ${2 * k}$`), sp: 's' };
    },
    (r) => {
      const L = r.pick([7, 14, 21]), t = r.pick([10, 15, 20, 30, 40, 45]), v = r.int(0, 1);
      const arc = (t / 60) * 2 * (22 / 7) * L;
      need(Math.abs(arc * 100 - Math.round(arc * 100)) < 1e-6);
      return { q: v === 0 ? T(`The minute hand of a clock is ${L} cm long. How far does its tip move in ${t} minutes? Use $\\pi = \\frac{22}{7}$.`, `Jarum minit sebuah jam panjangnya ${L} cm. Berapa jauhkah hujungnya bergerak dalam ${t} minit? Gunakan $\\pi = \\frac{22}{7}$.`) : T(`A clock's minute hand has length ${L} cm. Find the area swept by the hand in ${t} minutes. Use $\\pi = \\frac{22}{7}$.`, `Jarum minit sebuah jam mempunyai panjang ${L} cm. Cari luas yang disapu oleh jarum itu dalam ${t} minit. Gunakan $\\pi = \\frac{22}{7}$.`), a: v === 0 ? T(`${n(round(arc, 2))} cm`) : T(`${n(round((t / 60) * (22 / 7) * L * L, 2))} $\\text{cm}^2$`), w: T(`In ${t} minutes the hand turns through $\\dfrac{${t}}{60} \\times 360^\\circ = ${t * 6}^\\circ$`, `Dalam ${t} minit jarum berpusing $\\dfrac{${t}}{60} \\times 360^\\circ = ${t * 6}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const kind = pkind(r), rr = prad(kind, r, 3, 14), v = r.int(0, 2);
      const wrongs = [
        [`Ali calculates the circumference of a circle of radius ${n(rr)} cm as $\\pi \\times ${n(rr)}^2$. What is his mistake? Find the correct circumference.`, `Ali mengira lilitan bulatan berjejari ${n(rr)} cm sebagai $\\pi \\times ${n(rr)}^2$. Apakah kesilapannya? Cari lilitan yang betul.`, 'He used the area formula; circumference $= 2\\pi r$.', 'Dia menggunakan rumus luas; lilitan $= 2\\pi r$.', Cf(rr), 'cm', 1],
        [`Siti says the area of a circle of diameter ${n(2 * rr)} cm is $\\pi \\times ${n(2 * rr)}^2$. What is her mistake? Find the correct area.`, `Siti berkata luas bulatan berdiameter ${n(2 * rr)} cm ialah $\\pi \\times ${n(2 * rr)}^2$. Apakah kesilapannya? Cari luas yang betul.`, 'She used the diameter instead of the radius; area $= \\pi r^2$ with $r = ' + n(rr) + '$.', 'Dia menggunakan diameter, bukan jejari; luas $= \\pi r^2$ dengan $r = ' + n(rr) + '$.', Af(rr), 'cm', 2],
        [`Kumar finds the area of a semicircle of radius ${n(rr)} cm as $\\pi \\times ${n(rr)}^2$. Explain his mistake and give the correct area.`, `Kumar mencari luas semibulatan berjejari ${n(rr)} cm sebagai $\\pi \\times ${n(rr)}^2$. Terangkan kesilapannya dan berikan luas yang betul.`, 'That is the area of the whole circle; a semicircle is half of it.', 'Itu ialah luas seluruh bulatan; semibulatan ialah separuhnya.', FR.mul(Af(rr), FR.make(1, 2)), 'cm', 2],
      ][v];
      const p = pv(kind, wrongs[4], wrongs[5], wrongs[6]);
      return { q: T(`${wrongs[0]} ${p.note[0]}`, `${wrongs[1]} ${p.note[1]}`), a: T(`${wrongs[2]} Correct value: $${p.s}$`, `${wrongs[3]} Nilai betul: $${p.s}$`), w: W(T(`Use the right formula: $C = 2\\pi r$ (not $\\pi r^2$), $A = \\pi r^2$ with the radius (not the diameter), and a semicircle is half a circle.`, `Guna rumus yang betul: $C = 2\\pi r$ (bukan $\\pi r^2$), $A = \\pi r^2$ dengan jejari (bukan diameter), dan semibulatan ialah separuh bulatan.`), T(`Correct value: $${p.s}$`, `Nilai betul: $${p.s}$`)), sp: 'm' };
    },
    (r) => {
      const rr = r.int(4, 14), v = r.int(0, 2), kind = 'p314', side = 2 * rr;
      const frac = (3.14 * rr * rr) / (side * side);
      return { q: [T(`A circular photo of radius ${rr} cm is mounted in a square frame of side ${side} cm. Find the percentage of the frame covered by the photo. Use $\\pi = 3.14$ and give the answer correct to 1 decimal place.`, `Sekeping gambar bulat berjejari ${rr} cm dipasang dalam bingkai segi empat sama bersisi ${side} cm. Cari peratusan bingkai yang ditutupi gambar. Gunakan $\\pi = 3.14$ dan berikan jawapan betul kepada 1 tempat perpuluhan.`), T(`A circle of radius ${rr} cm is drawn inside a square of side ${side} cm touching all four sides. What percentage of the square is not covered by the circle? Use $\\pi = 3.14$; give the answer to 1 decimal place.`, `Sebuah bulatan berjejari ${rr} cm dilukis di dalam segi empat sama bersisi ${side} cm dan menyentuh keempat-empat sisi. Berapakah peratusan segi empat sama yang tidak ditutupi bulatan? Gunakan $\\pi = 3.14$; berikan jawapan kepada 1 tempat perpuluhan.`), T(`A circular rug of diameter ${side} cm lies on a square mat of side ${side} cm. Find the area of the mat not covered by the rug. Use $\\pi = 3.14$.`, `Sebuah permaidani bulat berdiameter ${side} cm terletak di atas tikar segi empat sama bersisi ${side} cm. Cari luas tikar yang tidak ditutupi permaidani. Gunakan $\\pi = 3.14$.`)][v], a: v === 0 ? T(`${n(round(frac * 100, 1))}%`) : v === 1 ? T(`${n(round((1 - frac) * 100, 1))}%`) : T(`${n(round(side * side - 3.14 * rr * rr, 2))} $\\text{cm}^2$`), w: W(T(`Circle: $3.14 \\times ${rr}^2 = ${n(round(3.14 * rr * rr, 2))}$`, `Bulatan: $3.14 \\times ${rr}^2 = ${n(round(3.14 * rr * rr, 2))}$`), T(`Square: $${side}^2 = ${side * side}$`, `Segi empat sama: $${side}^2 = ${side * side}$`), v === 0 ? `$\\dfrac{${n(round(3.14 * rr * rr, 2))}}{${side * side}} \\times 100\\% = ${n(round(frac * 100, 1))}\\%$` : v === 1 ? `$100\\% - ${n(round(frac * 100, 1))}\\% = ${n(round((1 - frac) * 100, 1))}\\%$` : `$${side * side} - ${n(round(3.14 * rr * rr, 2))} = ${n(round(side * side - 3.14 * rr * rr, 2))}$`), sp: 'm' };
    },
    (r) => {
      const rr = r.pick([7, 14, 21]), w2 = 2 * rr, L = r.int(10, 40), c = r.pick([['a Norman window (a rectangle with a semicircle on top)', 'tingkap Norman (segi empat tepat dengan semibulatan di atas)'], ['a tunnel entrance shaped like a rectangle topped by a semicircle', 'pintu masuk terowong berbentuk segi empat tepat dengan semibulatan di atas'], ['a gate opening with a semicircular arch', 'bukaan pintu pagar dengan gerbang separuh bulatan']]), v = r.int(0, 2);
      const per = w2 + 2 * L + (22 / 7) * rr, ar = w2 * L + 0.5 * (22 / 7) * rr * rr;
      need(Math.abs(per * 100 - Math.round(per * 100)) < 1e-6 && Math.abs(ar * 100 - Math.round(ar * 100)) < 1e-6);
      const price = r.pick([5, 8, 10, 12]);
      return { q: [T(`${cap(c[0])} is ${w2} cm wide and the rectangular part is ${L} cm high. Find the length of the frame round the whole shape (the bottom is included). Use $\\pi = \\frac{22}{7}$.`, `${cap(c[1])} lebarnya ${w2} cm dan bahagian segi empat tepat tingginya ${L} cm. Cari panjang bingkai mengelilingi seluruh bentuk (bahagian bawah termasuk). Gunakan $\\pi = \\frac{22}{7}$.`), T(`${cap(c[0])} has width ${w2} cm and straight sides ${L} cm. Find its area. Use $\\pi = \\frac{22}{7}$.`, `${cap(c[1])} berlebar ${w2} cm dan sisi lurus ${L} cm. Cari luasnya. Gunakan $\\pi = \\frac{22}{7}$.`), T(`${cap(c[0])} is ${w2} cm wide with straight sides of ${L} cm. Its glass costs RM${price} per 100 $\\text{cm}^2$. Find the cost of the glass (to the nearest sen). Use $\\pi = \\frac{22}{7}$.`, `${cap(c[1])} berlebar ${w2} cm dengan sisi lurus ${L} cm. Kaca berharga RM${price} setiap 100 $\\text{cm}^2$. Cari kos kaca (kepada sen terdekat). Gunakan $\\pi = \\frac{22}{7}$.`)][v], a: T(v === 0 ? `${n(round(per, 2))} cm` : v === 1 ? `${n(round(ar, 2))} $\\text{cm}^2$` : `RM${n(round((ar / 100) * price, 2))}`), w: W(T(`The shape is a rectangle ${w2} cm by ${L} cm with a semicircle of radius ${rr} cm on top.`, `Bentuk itu ialah segi empat tepat ${w2} cm kali ${L} cm dengan semibulatan berjejari ${rr} cm di atasnya.`), T(`Curved edge $= \\dfrac{1}{2} \\times 2 \\times \\dfrac{22}{7} \\times ${rr} = ${n(round((22 / 7) * rr, 2))}$ cm`, `Lengkok $= \\dfrac{1}{2} \\times 2 \\times \\dfrac{22}{7} \\times ${rr} = ${n(round((22 / 7) * rr, 2))}$ cm`), v === 0 ? T(`Perimeter $= ${w2} + 2 \\times ${L} + ${n(round((22 / 7) * rr, 2))} = ${n(round(per, 2))}$ cm`, `Perimeter $= ${w2} + 2 \\times ${L} + ${n(round((22 / 7) * rr, 2))} = ${n(round(per, 2))}$ cm`) : T(`Area $= ${w2} \\times ${L} + \\dfrac{1}{2} \\times \\dfrac{22}{7} \\times ${rr}^2 = ${n(round(ar, 2))}\\ \\text{cm}^2$`, `Luas $= ${w2} \\times ${L} + \\dfrac{1}{2} \\times \\dfrac{22}{7} \\times ${rr}^2 = ${n(round(ar, 2))}\\ \\text{cm}^2$`), ...(v === 2 ? [T(`Cost $= ${n(round(ar, 2))} \\div 100 \\times ${price} = ${n(round((ar / 100) * price, 2))}$, that is RM${n(round((ar / 100) * price, 2))}`, `Kos $= ${n(round(ar, 2))} \\div 100 \\times ${price} = ${n(round((ar / 100) * price, 2))}$, iaitu RM${n(round((ar / 100) * price, 2))}`)] : [])), sp: 'm' };
    },
    (r) => {
      const rr = r.pick([7, 14, 21]), v = r.int(0, 2), kind = r.pick(['semi', 'quad']);
      const per = kind === 'semi' ? (22 / 7) * rr + 2 * rr : 0.5 * (22 / 7) * rr + 2 * rr;
      need(Math.abs(per * 100 - Math.round(per * 100)) < 1e-6);
      return { q: [T(`The perimeter of a ${kind === 'semi' ? 'semicircle' : 'quadrant'} is ${n(round(per, 2))} cm. Find its radius. Use $\\pi = \\frac{22}{7}$.`, `Perimeter ${kind === 'semi' ? 'sebuah semibulatan' : 'sebuah sukuan bulatan'} ialah ${n(round(per, 2))} cm. Cari jejarinya. Gunakan $\\pi = \\frac{22}{7}$.`), T(`A ${kind === 'semi' ? 'semicircular' : 'quarter-circle'} piece of card has a perimeter of ${n(round(per, 2))} cm. Find the radius, and then the area of the card. Use $\\pi = \\frac{22}{7}$.`, `Sekeping kad ${kind === 'semi' ? 'separuh bulatan' : 'suku bulatan'} mempunyai perimeter ${n(round(per, 2))} cm. Cari jejari, dan seterusnya luas kad itu. Gunakan $\\pi = \\frac{22}{7}$.`), T(`The straight edge${kind === 'semi' ? '' : 's'} and curved edge of a ${kind === 'semi' ? 'semicircle' : 'quadrant'} together measure ${n(round(per, 2))} cm. Find the diameter of the circle it comes from. Use $\\pi = \\frac{22}{7}$.`, `Sisi lurus dan sisi melengkung ${kind === 'semi' ? 'semibulatan' : 'sukuan bulatan'} berukuran ${n(round(per, 2))} cm secara keseluruhan. Cari diameter bulatan asalnya. Gunakan $\\pi = \\frac{22}{7}$.`)][v], a: v === 0 ? T(`${rr} cm`) : v === 1 ? T(`radius ${rr} cm ; area ${n(round((kind === 'semi' ? 0.5 : 0.25) * (22 / 7) * rr * rr, 2))} $\\text{cm}^2$`, `jejari ${rr} cm ; luas ${n(round((kind === 'semi' ? 0.5 : 0.25) * (22 / 7) * rr * rr, 2))} $\\text{cm}^2$`) : T(`${2 * rr} cm`), w: T(kind === 'semi' ? `$P = \\pi r + 2r = \\dfrac{36}{7}r$` : `$P = \\dfrac{1}{2}\\pi r + 2r = \\dfrac{18}{7}r$`), sp: 'm' };
    },
    (r) => {
      const d1 = r.pick([14, 21, 28, 35, 42, 56, 70]), d2 = r.pick([7, 14, 21, 28]), t1 = r.pick([20, 30, 40, 60, 80, 100]), c = r.pick([['gear wheels', 'roda gear'], ['pulleys', 'takal'], ['rollers', 'penggelek']]);
      need(d1 > d2 && (d1 * t1) % d2 === 0);
      const dist = ((22 * d1) / 7) * t1;
      return { q: T(`A large wheel of diameter ${d1} cm makes ${t1} turns to roll along a track. How many turns does a small wheel of diameter ${d2} cm make to roll along the same track? Use $\\pi = \\frac{22}{7}$.`, `Sebuah roda besar berdiameter ${d1} cm membuat ${t1} putaran untuk bergolek di sepanjang landasan. Berapakah bilangan putaran yang dibuat oleh roda kecil berdiameter ${d2} cm untuk bergolek di sepanjang landasan yang sama? Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${(d1 * t1) / d2}`), w: T(`Distance $= ${n(dist)}$ cm; turns $= ${n(dist)} \\div ${n((22 * d2) / 7)}$`), sp: 'm' };
    },
    (r) => {
      const d = r.pick([4, 6, 8, 10, 12]), a = r.int(2, 5), b = r.int(2, 5), L = d * a, W = d * b, u = 'cm', c = r.pick([['cookie dough', 'doh biskut', 'cookies', 'biskut'], ['a metal sheet', 'kepingan logam', 'discs', 'cakera'], ['a card', 'kad', 'circles', 'bulatan']]), v = r.int(0, 1);
      need(a * b >= 4 && a !== b);
      const used = a * b * 3.14 * (d / 2) ** 2, waste = L * W - used;
      return { q: v === 0 ? T(`${d}-cm ${c[2]} are cut from a rectangular piece of ${c[0]} ${L} cm by ${W} cm, in rows with no gaps between them. How many can be cut, and what area is left over? Use $\\pi = 3.14$.`, `${c[3]} ${d} cm dipotong daripada sekeping ${c[1]} segi empat tepat ${L} cm kali ${W} cm, dalam baris tanpa jurang di antaranya. Berapakah bilangan yang boleh dipotong, dan berapakah luas yang berbaki? Gunakan $\\pi = 3.14$.`) : T(`A rectangular sheet ${L} cm by ${W} cm is used to cut as many discs of diameter ${d} cm as possible, arranged in a grid. Find the total area of the discs and the percentage of the sheet wasted (1 decimal place). Use $\\pi = 3.14$.`, `Sekeping helaian segi empat tepat ${L} cm kali ${W} cm digunakan untuk memotong sebanyak mungkin cakera berdiameter ${d} cm, disusun dalam grid. Cari jumlah luas cakera dan peratusan helaian yang terbuang (1 tempat perpuluhan). Gunakan $\\pi = 3.14$.`), a: v === 0 ? T(`${a * b} ; ${n(round(waste, 2))} $\\text{cm}^2$`) : T(`${n(round(used, 2))} $\\text{cm}^2$ ; ${n(round((waste / (L * W)) * 100, 1))}%`), w: SPM.lines(T(`Each disc takes up a ${d} cm by ${d} cm square, so they fit in whole rows and columns.`, `Setiap cakera mengambil ruang ${d} cm kali ${d} cm, maka ia muat dalam baris dan lajur penuh.`), `$${L} \\div ${d} = ${a}$`, `$${W} \\div ${d} = ${b}$`, `$${a} \\times ${b} = ${a * b}$`, T(`One disc $= 3.14 \\times ${d / 2}^2 = ${n(round(3.14 * (d / 2) ** 2, 2))}\\ \\text{cm}^2$`, `Satu cakera $= 3.14 \\times ${d / 2}^2 = ${n(round(3.14 * (d / 2) ** 2, 2))}\\ \\text{cm}^2$`), `$${a * b} \\times ${n(round(3.14 * (d / 2) ** 2, 2))} = ${n(round(used, 2))}$`, `$${L} \\times ${W} - ${n(round(used, 2))} = ${n(round(waste, 2))}$`, ...(v === 1 ? [`$\\dfrac{${n(round(waste, 2))}}{${L * W}} \\times 100\\% = ${n(round((waste / (L * W)) * 100, 1))}\\%$`] : [])), sp: 'm' };
    },
  ];
  /*END53*/
  SPM.extend('F2-5.3', { e: g53e, m: g53m, a: g53a });
})();
