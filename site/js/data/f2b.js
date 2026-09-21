/* Form 2 – Chapters 4 to 6 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, poly, lin, sum, gcd, Fr } = SPM;
  const S = SPM.svg;
  const F = SPM.figs;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const rad = (d) => (d * Math.PI) / 180;
  const NTS = SPM.NTS;
  const nts = (q) => T(q.en + ' ' + NTS.en, q.ms + ' ' + NTS.ms);
  const POLY = { 3: ['triangle', 'segi tiga'], 4: ['quadrilateral', 'sisi empat'], 5: ['pentagon', 'pentagon'], 6: ['hexagon', 'heksagon'], 7: ['heptagon', 'heptagon'], 8: ['octagon', 'oktagon'], 9: ['nonagon', 'nonagon'], 10: ['decagon', 'dekagon'], 12: ['dodecagon', 'dodekagon'] };
  const pname = (k) => (POLY[k] ? POLY[k] : [`${k}-sided polygon`, `poligon ${k} sisi`]);
  const regular = (k) => Array.from({ length: k }, (_, i) => [Math.cos(rad(90 + (360 * i) / k)), -Math.sin(rad(90 + (360 * i) / k))]);
  const NREG = [5, 6, 8, 9, 10, 12, 15, 18, 20, 24];
  const deg = (v) => `${n(round(v, 2))}^\\circ`;

  /* =============================================================== 4 */
  const g41ae = [
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8]);
      return { q: T(`Find the size of one exterior angle of a regular ${pname(k)[0]}.`, `Cari saiz satu sudut peluaran bagi ${pname(k)[1]} sekata.`), a: T(`$${deg(360 / k)}$`), w: T(`$360^\\circ \\div ${k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8]);
      return { q: T(`Find the size of one interior angle of a regular ${pname(k)[0]}.`, `Cari saiz satu sudut pedalaman bagi ${pname(k)[1]} sekata.`), a: T(`$${deg(((k - 2) * 180) / k)}$`), w: T(`$\\dfrac{(${k} - 2) \\times 180^\\circ}{${k}}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([3, 4, 5, 6, 7, 8]);
      return { q: T(`How many axes of symmetry does a regular ${pname(k)[0]} have?`, `Berapakah bilangan paksi simetri bagi ${pname(k)[1]} sekata?`), a: T(`${k}`), sp: 'xs' };
    },
  ];
  const g41am = [
    (r) => {
      const k = r.pick([8, 9, 10, 12]);
      return { q: T(`A regular polygon has ${k} sides. Find (a) each exterior angle, (b) each interior angle.`, `Sebuah poligon sekata mempunyai ${k} sisi. Cari (a) setiap sudut peluaran, (b) setiap sudut pedalaman.`), a: T(`(a) $${deg(360 / k)}$ (b) $${deg(180 - 360 / k)}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick(NREG);
      return { q: T(`Each exterior angle of a regular polygon is $${deg(360 / k)}$. Find the number of sides.`, `Setiap sudut peluaran sebuah poligon sekata ialah $${deg(360 / k)}$. Cari bilangan sisi.`), a: T(`${k}`), w: T(`$360 \\div ${n(360 / k)}$`), sp: 's' };
    },
  ];
  const g41aa = [
    (r) => {
      const k = r.pick([9, 10, 12, 15, 18, 20, 24]);
      const I = 180 - 360 / k;
      return { q: T(`Each interior angle of a regular polygon is $${deg(I)}$. Find the number of sides.`, `Setiap sudut pedalaman sebuah poligon sekata ialah $${deg(I)}$. Cari bilangan sisi.`), a: T(`${k}`), w: T(`Exterior angle $= ${n(360 / k)}^\\circ$`, `Sudut peluaran $= ${n(360 / k)}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const m = r.pick([2, 3, 4, 5]);
      const e = 180 / (m + 1);
      need(Number.isInteger(360 / e) && Number.isInteger(e));
      return { q: T(`Each interior angle of a regular polygon is ${m} times its exterior angle. Find the number of sides.`, `Setiap sudut pedalaman sebuah poligon sekata ialah ${m} kali sudut peluarannya. Cari bilangan sisi.`), a: T(`${360 / e}`), w: T(`$${m}e + e = 180$, so $e = ${e}^\\circ$`, `$${m}e + e = 180$, jadi $e = ${e}^\\circ$`), sp: 'm' };
    },
  ];
  const g41be = [
    (r) => {
      const k = r.pick([3, 4, 5, 6, 8]);
      return { q: T(`To construct a regular ${pname(k)[0]} inside a circle, what should the angle at the centre between adjacent vertices be?`, `Untuk membina ${pname(k)[1]} sekata di dalam sebuah bulatan, berapakah sudut di pusat antara bucu bersebelahan?`), a: T(`$360^\\circ \\div ${k} = ${deg(360 / k)}$`), sp: 's' };
    },
  ];
  const g41bm = [
    (r) => {
      const k = r.pick([5, 6, 8, 9, 10]);
      return { q: T(`Describe how to construct a regular ${pname(k)[0]} using a circle and a protractor.`, `Huraikan cara membina ${pname(k)[1]} sekata menggunakan bulatan dan protraktor.`), a: T(`Draw a circle with centre $O$. Mark a point $P_1$ on it. Use the protractor to mark points at ${deg(360 / k)} intervals around $O$, giving $${k}$ points. Join consecutive points with straight lines.`, `Lukis bulatan berpusat $O$. Tandakan satu titik $P_1$ padanya. Gunakan protraktor untuk menanda titik pada sela ${deg(360 / k)} di sekeliling $O$, memberikan $${k}$ titik. Sambungkan titik berturutan dengan garis lurus.`), sp: 'xl' };
    },
    (r) => ({ q: T('Explain why joining points on a circle that are separated by equal central angles gives sides of equal length.', 'Terangkan mengapa menyambungkan titik pada bulatan yang dipisahkan oleh sudut pusat yang sama memberikan sisi yang sama panjang.'), a: T('Each pair of adjacent points and the centre form an isosceles triangle with two radii as equal sides and the same angle between them. These triangles are congruent (SAS), so the chords are equal.', 'Setiap pasangan titik bersebelahan dan pusat membentuk segi tiga sama kaki dengan dua jejari sebagai sisi yang sama dan sudut yang sama di antaranya. Segi tiga ini kongruen (SAS), jadi perentas adalah sama.'), sp: 'l' }),
  ];
  const g41ba = [
    (r) => {
      const ang = r.pick([50, 70, 80, 100, 110]);
      const pts = 360 / ang;
      return { q: T(`Aina tries to draw a regular polygon by marking points on a circle at every $${ang}^\\circ$ around the centre. Explain why the polygon does not close properly.`, `Aina cuba melukis poligon sekata dengan menanda titik pada bulatan pada setiap $${ang}^\\circ$ di sekeliling pusat. Terangkan mengapa poligon itu tidak tertutup dengan sempurna.`), a: T(`$360 \\div ${ang} = ${n(round(pts, 2))}$ is not a whole number, so the points do not return exactly to the starting point after a full turn. The central angle must equal $360^\\circ \\div n$ for a whole number $n$.`, `$360 \\div ${ang} = ${n(round(pts, 2))}$ bukan nombor bulat, jadi titik tidak kembali tepat ke titik permulaan selepas satu pusingan penuh. Sudut pusat mesti sama dengan $360^\\circ \\div n$ bagi suatu nombor bulat $n$.`), sp: 'm' };
    },
  ];

  const irregularFig = (k, angs, unknownIdx) => {
    const pts = regular(k).map((p, i) => [p[0] * (1 + 0.12 * Math.sin(i * 2.3)), p[1] * (1 + 0.1 * Math.cos(i * 1.7))]);
    const labels = {};
    angs.forEach((a, i) => (labels[i] = i === unknownIdx ? 'x' : `${a}°`));
    return F.polygon({ pts, names: 'ABCDEFGH'.slice(0, k).split(''), angles: labels, w: 260, h: 200, arcR: 16 });
  };
  const g42e = [
    (r) => {
      const k = r.pick([5, 6, 7, 8, 9, 10]);
      return { q: T(`Find the sum of the interior angles of a ${pname(k)[0]}.`, `Cari hasil tambah sudut pedalaman bagi ${pname(k)[1]}.`), a: T(`$(${k} - 2) \\times 180^\\circ = ${(k - 2) * 180}^\\circ$`), sp: 's' };
    },
    (r) => ({ q: T('State the sum of the exterior angles of any polygon (one exterior angle at each vertex).', 'Nyatakan hasil tambah sudut peluaran bagi mana-mana poligon (satu sudut peluaran pada setiap bucu).'), a: T('$360^\\circ$'), sp: 'xs' }),
  ];
  const g42m = [
    (r) => {
      const k = r.pick([5, 6]);
      const total = (k - 2) * 180;
      return retry(() => {
        const known = Array.from({ length: k - 1 }, () => r.int(85, 150));
        const x = total - sum(known);
        need(x > 60 && x < 170);
        const fig = irregularFig(k, known.concat([x]), k - 1);
        return { q: nts(T(`The diagram shows a ${pname(k)[0]} with angles $${known.map((a) => a + '^\\circ').join(', ')}$ and $x$. Find $x$.`, `Rajah menunjukkan ${pname(k)[1]} dengan sudut $${known.map((a) => a + '^\\circ').join(', ')}$ dan $x$. Cari $x$.`)), fig, a: T(`$x = ${x}$`), w: T(`$${total} - ${sum(known)}$`), sp: 's' };
      });
    },
    (r) => {
      const k = r.pick([7, 8, 9, 10, 12]);
      return { q: T(`The sum of the interior angles of a polygon is $${(k - 2) * 180}^\\circ$. How many sides does it have?`, `Hasil tambah sudut pedalaman sebuah poligon ialah $${(k - 2) * 180}^\\circ$. Berapakah bilangan sisinya?`), a: T(`${k}`), w: T(`$(n - 2) \\times 180 = ${(k - 2) * 180}$`), sp: 's' };
    },
  ];
  const g42a = [
    (r) => {
      const [k, coefs] = r.pick([[5, [2, 2, 2, 3, 3]], [5, [1, 2, 2, 2, 3]], [5, [3, 3, 4, 4, 4]], [6, [2, 3, 3, 4, 4, 4]], [6, [2, 2, 3, 3, 3, 3]]]);
      const val = ((k - 2) * 180) / sum(coefs);
      return { q: T(`The interior angles of a ${pname(k)[0]} are $${coefs.map((c) => (c === 1 ? 'x' : c + 'x')).join(', ')}$ (in degrees). Find $x$ and the largest angle.`, `Sudut pedalaman sebuah ${pname(k)[1]} ialah $${coefs.map((c) => (c === 1 ? 'x' : c + 'x')).join(', ')}$ (dalam darjah). Cari $x$ dan sudut yang terbesar.`), a: T(`$x = ${val}$; largest angle $${Math.max(...coefs) * val}^\\circ$`, `$x = ${val}$; sudut terbesar $${Math.max(...coefs) * val}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick(NREG);
      const ext = 360 / k;
      return { q: T(`Each exterior angle of a regular polygon is $${deg(ext)}$. Find (a) the number of sides, (b) the sum of its interior angles, (c) the size of each interior angle.`, `Setiap sudut peluaran sebuah poligon sekata ialah $${deg(ext)}$. Cari (a) bilangan sisi, (b) hasil tambah sudut pedalamannya, (c) saiz setiap sudut pedalaman.`), a: T(`(a) ${k} (b) $${(k - 2) * 180}^\\circ$ (c) $${deg(180 - ext)}$`), sp: 'm' };
    },
    (r) => {
      const ext = retry(() => { const e = Array.from({ length: 5 }, () => r.int(40, 100)); need(sum(e) < 340); return e; });
      const x = 360 - sum(ext);
      return { q: T(`A hexagon has five exterior angles measuring $${ext.map((e) => e + '^\\circ').join(', ')}$. Find the sixth exterior angle and the interior angle at that vertex.`, `Sebuah heksagon mempunyai lima sudut peluaran berukuran $${ext.map((e) => e + '^\\circ').join(', ')}$. Cari sudut peluaran yang keenam dan sudut pedalaman pada bucu itu.`), a: T(`Exterior $${x}^\\circ$; interior $${180 - x}^\\circ$`, `Peluaran $${x}^\\circ$; pedalaman $${180 - x}^\\circ$`), sp: 'm' };
    },
  ];

  SPM.addChapter(2, 4, T('Polygons', 'Poligon'), [
    { id: '4.1a', en: 'Regular polygons', ms: 'Poligon sekata', gen: { e: g41ae, m: g41am, a: g41aa } },
    { id: '4.1b', en: 'Construction of regular polygons', ms: 'Pembinaan poligon sekata', gen: { e: g41be, m: g41bm, a: g41ba } },
    { id: '4.2', en: 'Interior and exterior angles of polygons', ms: 'Sudut pedalaman dan sudut peluaran poligon', gen: { e: g42e, m: g42m, a: g42a } },
  ]);

  /* =============================================================== 5 */
  const PI = {
    exact: { en: 'Leave your answer in terms of $\\pi$.', ms: 'Tinggalkan jawapan anda dalam sebutan $\\pi$.' },
    r22: { en: 'Use $\\pi = \\frac{22}{7}$.', ms: 'Gunakan $\\pi = \\frac{22}{7}$.' },
    p3142: { en: 'Use $\\pi = 3.142$ and give the answer correct to 2 decimal places.', ms: 'Gunakan $\\pi = 3.142$ dan berikan jawapan betul kepada 2 tempat perpuluhan.' },
  };
  /** value formatter for a quantity that equals k·π (or k·π·something) */
  function withPi(kind, coef, unit) {
    const u = unit ? `\\ \\text{${unit}}` : '';
    if (kind === 'exact') return `${n(coef)}\\pi${u}`;
    if (kind === 'r22') return `${n(round((coef * 22) / 7, 4))}${u}`;
    return `${n(round(coef * 3.142, 2))}${u}`;
  }
  const piKind = (r) => r.pick(['exact', 'r22', 'p3142']);
  const radiusFor = (kind, r) => (kind === 'r22' ? r.pick([7, 14, 21, 3.5, 10.5]) : r.int(3, 12));
  const circleFig = (o) => F.circle(o);

  const g51e = [
    (r) => {
    const fig = F.circle({ pts: { A: 200, B: 340, C: 60, D: 240 }, chords: ['AB'], radii: ['OC'], extra: (P) => S.line(P.D[0], P.D[1], 2 * P.O[0] - P.D[0], 2 * P.O[1] - P.D[1]) + S.text(2 * P.O[0] - P.D[0] + 12, 2 * P.O[1] - P.D[1] + 10, 'E', { i: true }) });
    return { q: T('In the circle with centre $O$, name (a) a radius, (b) a chord that is not a diameter, (c) the diameter.', 'Dalam bulatan berpusat $O$, namakan (a) satu jejari, (b) satu perentas yang bukan diameter, (c) diameter.'), fig, a: T('(a) $OC$ (b) $AB$ (c) $DE$', '(a) $OC$ (b) $AB$ (c) $DE$'), sp: 's' };
    },
    (r) => {
      const rr = r.int(3, 15), s = r.chance();
      return s ? { q: T(`The radius of a circle is ${rr} cm. Find its diameter.`, `Jejari sebuah bulatan ialah ${rr} cm. Cari diameternya.`), a: T(`${2 * rr} cm`), sp: 'xs' } : { q: T(`The diameter of a circle is ${2 * rr} cm. Find its radius.`, `Diameter sebuah bulatan ialah ${2 * rr} cm. Cari jejarinya.`), a: T(`${rr} cm`), sp: 'xs' };
    },
    (r) => {
      const rr = r.int(3, 8);
      return { q: T(`Using a pair of compasses, construct a circle with radius ${rr} cm. Draw a diameter and label its ends $P$ and $Q$. State the length of $PQ$.`, `Dengan menggunakan jangka lukis, bina sebuah bulatan berjejari ${rr} cm. Lukis satu diameter dan labelkan hujungnya $P$ dan $Q$. Nyatakan panjang $PQ$.`), a: T(`$PQ = ${2 * rr}$ cm (a correct construction has radius ${rr} cm).`, `$PQ = ${2 * rr}$ cm (pembinaan yang betul mempunyai jejari ${rr} cm).`), sp: 'xl' };
    },
  ];
  const g51m = [
    (r) => {
      const R = r.int(4, 7), chord = r.pick([2 * R - 2, 2 * R - 3, R + 1]);
      const d = round(Math.sqrt(R * R - (chord / 2) ** 2), 1);
      return { q: T(`Construct a circle of radius ${R} cm with centre $O$. Mark a point $A$ on the circle and, with compasses, mark a point $B$ on the circle so that the chord $AB = ${chord}$ cm. Explain the step that fixes the length of $AB$.`, `Bina sebuah bulatan berjejari ${R} cm dengan pusat $O$. Tandakan titik $A$ pada bulatan dan, dengan jangka lukis, tandakan titik $B$ pada bulatan supaya perentas $AB = ${chord}$ cm. Terangkan langkah yang menetapkan panjang $AB$.`), a: T(`Set the compasses to ${chord} cm, place the point on $A$ and draw an arc cutting the circle at $B$: every point on this arc is ${chord} cm from $A$.`, `Laraskan jangka lukis kepada ${chord} cm, letakkan hujung tajam pada $A$ dan lukis lengkok yang memotong bulatan di $B$: setiap titik pada lengkok ini berjarak ${chord} cm dari $A$.`), sp: 'xl' };
    },
  ];
  const g51a = [
    (r) => {
      const R = r.pick([4, 5, 6]), a = r.pick([60, 72, 90, 120]);
      return { q: T(`Construct a sector $AOB$ with radius ${R} cm and $\\angle AOB = ${a}^\\circ$. Describe each construction step.`, `Bina sebuah sektor $AOB$ berjejari ${R} cm dan $\\angle AOB = ${a}^\\circ$. Huraikan setiap langkah pembinaan.`), a: T(`Draw $OA = ${R}$ cm. Use a protractor at $O$ to mark ${a}° from $OA$. Draw $OB = ${R}$ cm along that direction. With centre $O$ and radius ${R} cm draw the arc from $A$ to $B$.`, `Lukis $OA = ${R}$ cm. Gunakan protraktor di $O$ untuk menanda ${a}° dari $OA$. Lukis $OB = ${R}$ cm mengikut arah itu. Dengan pusat $O$ dan jejari ${R} cm lukis lengkok dari $A$ ke $B$.`), sp: 'xl' };
    },
  ];

  /** circle with a chord at distance d (pixels scaled), returns svg */
  function chordFig(R, half, d, labs) {
    const W = 260, H = 210, cx = 130, cy = 100, rp = 78;
    const dp = (d / R) * rp, hp = (half / R) * rp;
    const y = cy + dp;
    const A = [cx - hp, y], B = [cx + hp, y], M = [cx, y];
    let out = S.circle(cx, cy, rp) + S.line(A[0], A[1], B[0], B[1]) + S.line(cx, cy, M[0], M[1]) + S.line(cx, cy, A[0], A[1]);
    out += S.dot(cx, cy, 2.5) + S.rightAngle(M, [cx, cy], B, 8);
    out += S.text(cx + 8, cy - 4, 'O', { i: true }) + S.text(A[0] - 10, A[1] + 6, 'A', { i: true }) + S.text(B[0] + 10, B[1] + 6, 'B', { i: true }) + S.text(M[0] + 9, M[1] + 11, 'M', { i: true });
    if (labs.AB) out += S.text(cx, y + 24, labs.AB, { s: 12 });
    if (labs.OM) out += S.text(cx - 10, cy + dp / 2, labs.OM, { s: 12, a: 'end' });
    if (labs.OA) out += S.text(cx - hp / 2 - 12, cy + dp / 2 - 12, labs.OA, { s: 12, a: 'end' });
    return S.wrap(W, H, out, 'chord');
  }
  const g52e = [
    (r) => {
      const [h, d, R] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [4, 3, 5]]);
      const fig = chordFig(R, h, d, { AB: `${2 * h} cm` });
      return { q: T(`$O$ is the centre of the circle and $OM \\perp AB$. If $AB = ${2 * h}$ cm, find $AM$. State the property you use.`, `$O$ ialah pusat bulatan dan $OM \\perp AB$. Jika $AB = ${2 * h}$ cm, cari $AM$. Nyatakan sifat yang anda gunakan.`), fig, a: T(`$AM = ${h}$ cm (a radius perpendicular to a chord bisects the chord)`, `$AM = ${h}$ cm (jejari yang serenjang dengan perentas membahagi dua sama perentas itu)`), sp: 's' };
    },
    (r) => ({ q: T('Explain why a diameter is an axis of symmetry of a circle.', 'Terangkan mengapa diameter ialah paksi simetri bagi sebuah bulatan.'), a: T('Reflecting the circle in a diameter maps every point of the circle onto another point at the same distance from the centre, so the circle maps onto itself.', 'Pantulan bulatan pada diameter memetakan setiap titik pada bulatan kepada titik lain yang berjarak sama dari pusat, jadi bulatan itu terpetakan kepada dirinya sendiri.'), sp: 'm' }),
  ];
  const g52m = [
    (r) => {
      const d = r.int(3, 9), c = r.int(8, 20);
      return { q: T(`Two chords $AB$ and $CD$ of the same circle are equal, and $AB$ is ${d} cm from the centre. How far is $CD$ from the centre? Give the reason.`, `Dua perentas $AB$ dan $CD$ bagi bulatan yang sama adalah sama panjang, dan $AB$ berjarak ${d} cm dari pusat. Berapakah jarak $CD$ dari pusat? Berikan sebab.`), a: T(`${d} cm (equal chords are equidistant from the centre)`, `${d} cm (perentas yang sama panjang berjarak sama dari pusat)`), sp: 's' };
    },
    (r) => ({ q: T('Describe how to find the centre of a circle drawn on paper using two chords.', 'Huraikan cara mencari pusat sebuah bulatan yang dilukis di atas kertas dengan menggunakan dua perentas.'), a: T('Draw two non-parallel chords. Construct the perpendicular bisector of each chord. The two bisectors meet at the centre of the circle.', 'Lukis dua perentas yang tidak selari. Bina pembahagi dua sama serenjang bagi setiap perentas. Kedua-dua pembahagi dua sama bertemu di pusat bulatan.'), sp: 'l' }),
    (r) => {
      const a = r.int(30, 100);
      return { q: T(`In a circle, chord $AB$ subtends an arc of $${a}^\\circ$ at the centre and chord $CD$ is equal to $AB$. What arc angle does $CD$ subtend at the centre? Give the reason.`, `Dalam sebuah bulatan, perentas $AB$ mencangkum lengkok $${a}^\\circ$ di pusat dan perentas $CD$ sama panjang dengan $AB$. Berapakah sudut lengkok yang dicangkum oleh $CD$ di pusat? Berikan sebab.`), a: T(`$${a}^\\circ$ (equal chords produce equal arcs)`, `$${a}^\\circ$ (perentas sama panjang menghasilkan lengkok sama)`), sp: 's' };
    },
  ];
  const g52a = [
    (r) => {
      const [h, d, R] = r.pick([[12, 5, 13], [8, 6, 10], [15, 8, 17], [24, 7, 25], [9, 12, 15]]);
      const fig = chordFig(R, h, d, { AB: `${2 * h} cm`, OM: `${d} cm` });
      return { q: T(`In the circle with centre $O$, the chord $AB = ${2 * h}$ cm and its distance from $O$ is ${d} cm. Find the radius of the circle.`, `Dalam bulatan berpusat $O$, perentas $AB = ${2 * h}$ cm dan jaraknya dari $O$ ialah ${d} cm. Cari jejari bulatan itu.`), fig, a: T(`${R} cm`), w: T(`$AM = ${h}$; $OA^2 = ${h}^2 + ${d}^2 = ${R * R}$`), sp: 'm' };
    },
    (r) => {
      const [h, d, R] = r.pick([[12, 5, 13], [8, 6, 10], [15, 8, 17], [24, 7, 25], [9, 12, 15]]);
      const fig = chordFig(R, h, d, { OA: `${R} cm`, AB: `${2 * h} cm` });
      return { q: T(`A circle with centre $O$ has radius ${R} cm. A chord $AB$ of length ${2 * h} cm is drawn. Find the perpendicular distance $OM$ from $O$ to the chord.`, `Sebuah bulatan berpusat $O$ mempunyai jejari ${R} cm. Satu perentas $AB$ dengan panjang ${2 * h} cm dilukis. Cari jarak serenjang $OM$ dari $O$ ke perentas itu.`), fig, a: T(`${d} cm`), w: T(`$OM^2 = ${R}^2 - ${h}^2 = ${d * d}$`), sp: 'm' };
    },
  ];

  const g53e = [
    (r) => {
      const kind = piKind(r), rr = radiusFor(kind, r);
      return { q: T(`Find the circumference of a circle of radius ${n(rr)} cm. ${PI[kind].en}`, `Cari lilitan sebuah bulatan berjejari ${n(rr)} cm. ${PI[kind].ms}`), a: T(`$${withPi(kind, 2 * rr, 'cm')}$`), w: T(`$C = 2\\pi r$`), sp: 's' };
    },
    (r) => {
      const kind = piKind(r), rr = radiusFor(kind, r);
      return { q: T(`Find the area of a circle of radius ${n(rr)} cm. ${PI[kind].en}`, `Cari luas sebuah bulatan berjejari ${n(rr)} cm. ${PI[kind].ms}`), a: T(`$${withPi(kind, rr * rr, 'cm')}^2$`), w: T(`$A = \\pi r^2$`), sp: 's' };
    },
    (r) => {
      const rr = r.int(2, 6);
      const ds = [2 * rr, 2 * rr + 2, 2 * rr + 4];
      const Cs = ds.map((d) => round(d * 3.1416, 2));
      return { q: T(`The table shows the diameter $d$ and circumference $C$ of three circles. Calculate $C \\div d$ for each and state what you notice.<br>${SPM.table([['$d$ (cm)', ...ds], ['$C$ (cm)', ...Cs]], { rowHead: true })}`, `Jadual menunjukkan diameter $d$ dan lilitan $C$ bagi tiga buah bulatan. Hitung $C \\div d$ bagi setiap satu dan nyatakan pemerhatian anda.<br>${SPM.table([['$d$ (cm)', ...ds], ['$C$ (cm)', ...Cs]], { rowHead: true })}`), a: T(`$C \\div d \\approx 3.14$ each time, so $C = \\pi d$.`, `$C \\div d \\approx 3.14$ setiap kali, jadi $C = \\pi d$.`), sp: 's' };
    },
    (r) => {
      const kind = piKind(r), rr = radiusFor(kind, r);
      const semi = r.chance();
      return { q: T(`Find the area of a ${semi ? 'semicircle' : 'quadrant'} of radius ${n(rr)} cm. ${PI[kind].en}`, `Cari luas ${semi ? 'semibulatan' : 'sukuan bulatan'} berjejari ${n(rr)} cm. ${PI[kind].ms}`), a: T(`$${withPi(kind, (rr * rr) / (semi ? 2 : 4), 'cm')}^2$`), sp: 's' };
    },
  ];
  const g53m = [
    (r) => {
      const kind = piKind(r), rr = radiusFor(kind, r), th = r.pick([30, 45, 60, 72, 90, 120, 135, 150]);
      const arc = (th / 360) * 2 * rr;
      return { q: T(`A sector has radius ${n(rr)} cm and angle $${th}^\\circ$ at the centre. Find (a) the arc length, (b) the area of the sector. ${PI[kind].en}`, `Sebuah sektor berjejari ${n(rr)} cm dan bersudut $${th}^\\circ$ di pusat. Cari (a) panjang lengkok, (b) luas sektor. ${PI[kind].ms}`), a: T(`(a) $${withPi(kind, arc, 'cm')}$ (b) $${withPi(kind, (th / 360) * rr * rr, 'cm')}^2$`), w: T(`$\\dfrac{${th}}{360} \\times 2\\pi r$ and $\\dfrac{${th}}{360} \\times \\pi r^2$`), sp: 'm' };
    },
    (r) => {
      const rr = r.pick([7, 14, 21]);
      const C = 2 * (22 / 7) * rr;
      return { q: T(`The circumference of a circle is ${n(C)} cm. Find its radius. Use $\\pi = \\frac{22}{7}$.`, `Lilitan sebuah bulatan ialah ${n(C)} cm. Cari jejarinya. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${rr} cm`), sp: 's' };
    },
    (r) => {
      const kind = piKind(r), rr = radiusFor(kind, r);
      return { q: T(`Find the perimeter of a semicircle of radius ${n(rr)} cm (include the diameter). ${PI[kind].en}`, `Cari perimeter semibulatan berjejari ${n(rr)} cm (termasuk diameter). ${PI[kind].ms}`), a: T(kind === 'exact' ? `$(${n(rr)}\\pi + ${n(2 * rr)})\\ \\text{cm}$` : `$${n(round(kind === 'r22' ? (22 / 7) * rr + 2 * rr : 3.142 * rr + 2 * rr, 2))}\\ \\text{cm}$`), sp: 's' };
    },
  ];
  const g53a = [
    (r) => {
      const rr = r.pick([7, 14]);
      const straight = r.int(20, 60);
      const perExact = 2 * straight + (44 / 7) * rr;
      return { q: T(`A running track has two straight sides each ${straight} m long and two semicircular ends of radius ${rr} m. Find (a) the perimeter of the track, (b) the area enclosed. Use $\\pi = \\frac{22}{7}$.`, `Sebuah trek larian mempunyai dua sisi lurus yang masing-masing panjangnya ${straight} m dan dua hujung berbentuk semibulatan berjejari ${rr} m. Cari (a) perimeter trek itu, (b) luas yang dikelilingi. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`(a) ${n(round(perExact, 2))} m (b) ${n(round(straight * 2 * rr + (22 / 7) * rr * rr, 2))} m²`), w: T(`Perimeter $= 2 \\times ${straight} + 2\\pi(${rr})$; area $= ${straight} \\times ${2 * rr} + \\pi(${rr})^2$`), sp: 'l' };
    },
    (r) => {
      const d = r.pick([70, 84, 56, 42]);
      const C = (22 / 7) * d;
      const k = r.int(20, 80);
      return { q: T(`A wheel has a diameter of ${d} cm. How many complete turns does it make when it rolls ${k} m? Use $\\pi = \\frac{22}{7}$ and give the answer as a whole number.`, `Sebuah roda berdiameter ${d} cm. Berapakah bilangan putaran lengkap yang dibuat apabila ia bergolek sejauh ${k} m? Gunakan $\\pi = \\frac{22}{7}$ dan berikan jawapan sebagai nombor bulat.`), a: T(`${Math.floor((k * 100) / C)} turns`, `${Math.floor((k * 100) / C)} putaran`), w: T(`$C = ${n(C)}$ cm; $${k * 100} \\div ${n(C)} = ${n(round((k * 100) / C, 2))}$`), sp: 'm' };
    },
    (r) => {
      const rr = r.pick([7, 14, 21]), th = r.pick([60, 90, 120, 180, 270]);
      const arc = (th / 360) * 2 * (22 / 7) * rr;
      return { q: T(`The arc of a sector of radius ${rr} cm has length ${n(round(arc, 2))} cm. Find the angle of the sector. Use $\\pi = \\frac{22}{7}$.`, `Lengkok sebuah sektor berjejari ${rr} cm mempunyai panjang ${n(round(arc, 2))} cm. Cari sudut sektor itu. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`$${th}^\\circ$`), w: T(`$\\dfrac{\\theta}{360} \\times 2 \\times \\frac{22}{7} \\times ${rr} = ${n(round(arc, 2))}$`), sp: 'm' };
    },
    (r) => {
      const R = r.int(4, 10), w = r.int(1, 3);
      return { q: T(`A circular pond has radius ${R} m. A path of width ${w} m surrounds it. Find the area of the path in terms of $\\pi$.`, `Sebuah kolam bulat berjejari ${R} m. Satu laluan selebar ${w} m mengelilinginya. Cari luas laluan itu dalam sebutan $\\pi$.`), a: T(`$(${R + w}^2 - ${R}^2)\\pi = ${(R + w) ** 2 - R * R}\\pi\\ \\text{m}^2$`), sp: 'm' };
    },
  ];

  SPM.addChapter(2, 5, T('Circles', 'Bulatan'), [
    { id: '5.1', en: 'Properties and constructions of circles', ms: 'Sifat dan pembinaan bulatan', gen: { e: g51e, m: g51m, a: g51a } },
    { id: '5.2', en: 'Symmetrical properties of chords', ms: 'Sifat simetri perentas', gen: { e: g52e, m: g52m, a: g52a } },
    { id: '5.3', en: 'Circumference and area of a circle', ms: 'Lilitan dan luas bulatan', gen: { e: g53e, m: g53m, a: g53a } },
  ]);

  /* =============================================================== 6 */
  const SOLIDS = [
    { en: 'cube', ms: 'kubus', f: 6, e: 12, v: 8, prop: T('6 identical square faces', '6 permukaan segi empat sama yang serupa') },
    { en: 'cuboid', ms: 'kuboid', f: 6, e: 12, v: 8, prop: T('6 rectangular faces', '6 permukaan segi empat tepat') },
    { en: 'triangular prism', ms: 'prisma segi tiga', f: 5, e: 9, v: 6, prop: T('2 triangular ends and 3 rectangular faces', '2 hujung segi tiga dan 3 permukaan segi empat tepat') },
    { en: 'square-based pyramid', ms: 'piramid tapak segi empat sama', f: 5, e: 8, v: 5, prop: T('a square base and 4 triangular faces meeting at a point', 'tapak segi empat sama dan 4 permukaan segi tiga yang bertemu pada satu titik') },
    { en: 'triangular pyramid', ms: 'piramid tapak segi tiga', f: 4, e: 6, v: 4, prop: T('4 triangular faces', '4 permukaan segi tiga') },
    { en: 'pentagonal prism', ms: 'prisma segi lima', f: 7, e: 15, v: 10, prop: T('2 pentagonal ends and 5 rectangular faces', '2 hujung segi lima dan 5 permukaan segi empat tepat') },
    { en: 'hexagonal prism', ms: 'prisma segi enam', f: 8, e: 18, v: 12, prop: T('2 hexagonal ends and 6 rectangular faces', '2 hujung segi enam dan 6 permukaan segi empat tepat') },
  ];
  const CURVED = [
    { en: 'cylinder', ms: 'silinder', prop: T('two flat circular faces joined by one curved surface', 'dua permukaan rata berbentuk bulatan yang disambung oleh satu permukaan melengkung') },
    { en: 'cone', ms: 'kon', prop: T('one flat circular face, one curved surface and one vertex', 'satu permukaan rata berbentuk bulatan, satu permukaan melengkung dan satu bucu') },
    { en: 'sphere', ms: 'sfera', prop: T('one curved surface with no edges or vertices', 'satu permukaan melengkung tanpa tepi atau bucu') },
  ];
  const g61e = [
    (r) => {
      const s = r.pick(SOLIDS.concat(CURVED));
      return { q: T(`Name the solid that has ${s.prop.en}.`, `Namakan pepejal yang mempunyai ${s.prop.ms}.`), a: T(s.en, s.ms), sp: 'xs' };
    },
    (r) => {
      const s = r.pick(SOLIDS);
      return { q: T(`How many faces, edges and vertices does a ${s.en} have?`, `Berapakah bilangan permukaan, tepi dan bucu bagi ${s.ms}?`), a: T(`${s.f} faces, ${s.e} edges, ${s.v} vertices`, `${s.f} permukaan, ${s.e} tepi, ${s.v} bucu`), sp: 's' };
    },
  ];
  const g61m = [
    (r) => {
      const k = r.int(3, 9);
      const prism = r.chance();
      const name = prism ? T(`prism whose base is a ${pname(k)[0]}`, `prisma yang tapaknya ${pname(k)[1]}`) : T(`pyramid whose base is a ${pname(k)[0]}`, `piramid yang tapaknya ${pname(k)[1]}`);
      return { q: T(`Find the number of faces, edges and vertices of a ${name.en}.`, `Cari bilangan permukaan, tepi dan bucu bagi ${name.ms}.`), a: prism ? T(`${k + 2} faces, ${3 * k} edges, ${2 * k} vertices`, `${k + 2} permukaan, ${3 * k} tepi, ${2 * k} bucu`) : T(`${k + 1} faces, ${2 * k} edges, ${k + 1} vertices`, `${k + 1} permukaan, ${2 * k} tepi, ${k + 1} bucu`), sp: 's' };
    },
    (r) => ({ q: T('What is the difference between a right prism and an oblique prism? Which one has its sides perpendicular to the base?', 'Apakah perbezaan antara prisma tegak dengan prisma condong? Yang manakah mempunyai sisi yang serenjang dengan tapak?'), a: T('In a right prism the lateral edges are perpendicular to the bases and the side faces are rectangles; in an oblique prism the lateral edges lean and the side faces are parallelograms. The right prism.', 'Dalam prisma tegak, tepi sisi serenjang dengan tapak dan permukaan sisi ialah segi empat tepat; dalam prisma condong, tepi sisi condong dan permukaan sisi ialah segi empat selari. Prisma tegak.'), sp: 'm' }),
  ];
  const g61a = [
    (r) => {
      const k = r.int(5, 12);
      const e = 3 * k;
      return { q: T(`A prism has ${e} edges. (a) How many sides does its base have? (b) How many faces and vertices does it have?`, `Sebuah prisma mempunyai ${e} tepi. (a) Berapakah bilangan sisi tapaknya? (b) Berapakah bilangan permukaan dan bucu prisma itu?`), a: T(`(a) ${k} (b) ${k + 2} faces, ${2 * k} vertices`, `(a) ${k} (b) ${k + 2} permukaan, ${2 * k} bucu`), sp: 'm' };
    },
    (r) => {
      const k = r.int(4, 12);
      return { q: T(`A pyramid has ${k + 1} vertices. Find its number of (a) edges, (b) faces, and name the shape of its base.`, `Sebuah piramid mempunyai ${k + 1} bucu. Cari bilangan (a) tepi, (b) permukaan, dan namakan bentuk tapaknya.`), a: T(`(a) ${2 * k} (b) ${k + 1}; base: ${pname(k)[0]}`, `(a) ${2 * k} (b) ${k + 1}; tapak: ${pname(k)[1]}`), sp: 'm' };
    },
  ];

  const g62e = [
    (r) => {
      const bank = [
        [T('two circles and one rectangle', 'dua bulatan dan satu segi empat tepat'), T('cylinder', 'silinder')],
        [T('one circle and one sector', 'satu bulatan dan satu sektor'), T('cone', 'kon')],
        [T('one square and four triangles', 'satu segi empat sama dan empat segi tiga'), T('square-based pyramid', 'piramid tapak segi empat sama')],
        [T('two triangles and three rectangles', 'dua segi tiga dan tiga segi empat tepat'), T('triangular prism', 'prisma segi tiga')],
        [T('six rectangles', 'enam segi empat tepat'), T('cuboid', 'kuboid')],
      ];
      const b = r.pick(bank);
      return { q: T(`A net is made of ${b[0].en}. Which solid does it fold into?`, `Jaring-jaring terdiri daripada ${b[0].ms}. Pepejal manakah yang terbentuk apabila dilipat?`), a: b[1], sp: 'xs' };
    },
  ];
  const g62m = [
    (r) => {
      const rr = r.pick([7, 14, 21]), h = r.int(5, 15);
      const C = 44 * (rr / 7);
      return { q: T(`The net of a cylinder has a rectangle measuring ${n(C)} cm by ${h} cm and two circles. Find the radius of each circle. Use $\\pi = \\frac{22}{7}$.`, `Jaring-jaring sebuah silinder mempunyai satu segi empat tepat berukuran ${n(C)} cm kali ${h} cm dan dua bulatan. Cari jejari setiap bulatan. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${rr} cm`), w: T(`The ${n(C)} cm side is the circumference: $2\\pi r = ${n(C)}$`, `Sisi ${n(C)} cm ialah lilitan: $2\\pi r = ${n(C)}$`), sp: 'm' };
    },
    (r) => {
      const l = r.int(4, 12), w = r.int(3, 9), h = r.int(2, 8);
      return { q: T(`The net of a cuboid is made of 6 rectangles. The cuboid measures ${l} cm by ${w} cm by ${h} cm. Find the total area of the net.`, `Jaring-jaring sebuah kuboid terdiri daripada 6 segi empat tepat. Kuboid itu berukuran ${l} cm kali ${w} cm kali ${h} cm. Cari jumlah luas jaring-jaring itu.`), a: T(`$${2 * (l * w + l * h + w * h)}\\ \\text{cm}^2$`), sp: 'm' };
    },
  ];
  const g62a = [
    (r) => {
      const [rr, l] = r.pick([[3, 9], [4, 10], [5, 12], [6, 15], [7, 21], [2, 8]]);
      const theta = (rr / l) * 360;
      return { q: T(`The net of a cone consists of a circle of radius ${rr} cm and a sector of radius (slant height) ${l} cm. Find (a) the arc length of the sector in terms of $\\pi$, (b) the angle of the sector.`, `Jaring-jaring sebuah kon terdiri daripada satu bulatan berjejari ${rr} cm dan satu sektor berjejari (tinggi condong) ${l} cm. Cari (a) panjang lengkok sektor dalam sebutan $\\pi$, (b) sudut sektor itu.`), a: T(`(a) $${2 * rr}\\pi$ cm (b) $${n(round(theta, 2))}^\\circ$`), w: T(`Arc length $= 2\\pi r$; $\\dfrac{\\theta}{360} \\times 2\\pi(${l}) = 2\\pi(${rr})$`), sp: 'm' };
    },
    (r) => {
      const [a, h] = r.pick([[6, 4], [8, 3], [10, 12], [6, 8]]);
      const b = r.int(6, 14);
      const hyp = Math.sqrt(a * a + h * h);
      need(Number.isInteger(hyp));
      return { q: T(`The net of a triangular prism has two right-angled triangles with legs ${a} cm and ${h} cm, and three rectangles. The prism is ${b} cm long. Find the total area of the net.`, `Jaring-jaring sebuah prisma segi tiga mempunyai dua segi tiga bersudut tegak dengan sisi tegak ${a} cm dan ${h} cm, dan tiga segi empat tepat. Panjang prisma itu ${b} cm. Cari jumlah luas jaring-jaring itu.`), a: T(`$${a * h + b * (a + h + hyp)}\\ \\text{cm}^2$`), w: T(`Hypotenuse $= ${hyp}$; $2 \\times \\frac12 \\times ${a} \\times ${h} + ${b}(${a} + ${h} + ${hyp})$`), sp: 'l' };
    },
  ];

  const g63e = [
    (r) => {
      const l = r.int(3, 12), w = r.int(2, l), h = r.int(2, 10);
      return { q: T(`Find the total surface area of a cuboid measuring ${l} cm by ${w} cm by ${h} cm.`, `Cari jumlah luas permukaan sebuah kuboid berukuran ${l} cm kali ${w} cm kali ${h} cm.`), a: T(`$${2 * (l * w + l * h + w * h)}\\ \\text{cm}^2$`), sp: 's' };
    },
    (r) => {
      const kind = piKind(r), rr = radiusFor(kind, r), h = r.int(4, 15);
      return { q: T(`Find the curved surface area of a cylinder of radius ${n(rr)} cm and height ${h} cm. ${PI[kind].en}`, `Cari luas permukaan melengkung sebuah silinder berjejari ${n(rr)} cm dan tinggi ${h} cm. ${PI[kind].ms}`), a: T(`$${withPi(kind, 2 * rr * h, 'cm')}^2$`), w: T(`$2\\pi r h$`), sp: 's' };
    },
    (r) => {
      const kind = piKind(r), rr = radiusFor(kind, r), h = r.int(4, 12);
      return { q: T(`Find the total surface area of a closed cylinder of radius ${n(rr)} cm and height ${h} cm. ${PI[kind].en}`, `Cari jumlah luas permukaan sebuah silinder tertutup berjejari ${n(rr)} cm dan tinggi ${h} cm. ${PI[kind].ms}`), a: T(`$${withPi(kind, 2 * rr * h + 2 * rr * rr, 'cm')}^2$`), w: T(`$2\\pi r h + 2\\pi r^2$`), sp: 's' };
    },
  ];
  const g63m = [
    (r) => {
      const [a, b, c] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]);
      const L = r.int(5, 15);
      return { q: T(`A right triangular prism has a base that is a right-angled triangle with sides ${a} cm, ${b} cm and ${c} cm. The prism is ${L} cm long. Find its total surface area.`, `Sebuah prisma tegak segi tiga mempunyai tapak berbentuk segi tiga bersudut tegak dengan sisi ${a} cm, ${b} cm dan ${c} cm. Panjang prisma itu ${L} cm. Cari jumlah luas permukaannya.`), a: T(`$${a * b + L * (a + b + c)}\\ \\text{cm}^2$`), sp: 'm' };
    },
    (r) => {
      const [rr, l] = r.pick([[3, 5], [4, 5], [5, 13], [6, 10], [7, 25], [8, 17]]);
      const kind = piKind(r);
      return { q: T(`A right cone has base radius ${rr} cm and slant height ${l} cm. Find its total surface area. ${PI[kind].en}`, `Sebuah kon tegak mempunyai jejari tapak ${rr} cm dan tinggi condong ${l} cm. Cari jumlah luas permukaannya. ${PI[kind].ms}`), a: T(`$${withPi(kind, rr * l + rr * rr, 'cm')}^2$`), w: T(`$\\pi r l + \\pi r^2$`), sp: 'm' };
    },
    (r) => {
      const rr = r.int(2, 9);
      return { q: T(`Find the surface area of a sphere of radius ${rr} cm in terms of $\\pi$, and the total surface area of a solid hemisphere of the same radius.`, `Cari luas permukaan sebuah sfera berjejari ${rr} cm dalam sebutan $\\pi$, dan jumlah luas permukaan sebuah hemisfera pepejal yang berjejari sama.`), a: T(`Sphere: $${4 * rr * rr}\\pi\\ \\text{cm}^2$; hemisphere: $${3 * rr * rr}\\pi\\ \\text{cm}^2$`), sp: 'm' };
    },
  ];
  const g63a = [
    (r) => {
      const big = r.int(1, 3);
      const R = 3 * big, H = 4 * big, Ls = 5 * big;
      return { q: T(`A solid is formed by joining a cone of radius ${R} cm and slant height ${Ls} cm on top of a cylinder of the same radius and height ${H + 2} cm. Find the total exposed surface area in terms of $\\pi$.`, `Sebuah pepejal dibentuk dengan menyambungkan sebuah kon berjejari ${R} cm dan tinggi condong ${Ls} cm di atas sebuah silinder yang sama jejarinya dan tinggi ${H + 2} cm. Cari jumlah luas permukaan yang terdedah dalam sebutan $\\pi$.`), a: T(`$${R * Ls + 2 * R * (H + 2) + R * R}\\pi\\ \\text{cm}^2$`), w: T(`Cone curved: $\\pi r l$; cylinder curved: $2\\pi r h$; base circle: $\\pi r^2$`, `Kon melengkung: $\\pi r l$; silinder melengkung: $2\\pi r h$; bulatan tapak: $\\pi r^2$`), sp: 'l' };
    },
    (r) => {
      const l = r.int(4, 10), w = r.int(3, 8), h = r.int(3, 8);
      const A = 2 * (l * w + l * h + w * h);
      const price = r.pick([12, 15, 20]);
      return { q: T(`A closed box measures ${l} cm by ${w} cm by ${h} cm. Cardboard costs RM${price} per m². Find the cost of the cardboard for 500 such boxes (ignore overlaps and wastage).`, `Sebuah kotak tertutup berukuran ${l} cm kali ${w} cm kali ${h} cm. Kadbod berharga RM${price} per m². Cari kos kadbod untuk 500 buah kotak sebegini (abaikan pertindihan dan bahan terbuang).`), a: T(`RM${n(round((A * 500 * price) / 10000, 2))}`), w: T(`$${A} \\times 500 = ${A * 500}\\ \\text{cm}^2 = ${n(A * 500 / 10000)}\\ \\text{m}^2$`), sp: 'l' };
    },
    (r) => {
      const rr = r.pick([7, 14]);
      const h = r.int(5, 20);
      const target = 2 * (22 / 7) * rr * h;
      return { q: T(`The curved surface area of a cylinder with radius ${rr} cm is ${n(round(target, 2))} cm². Find its height. Use $\\pi = \\frac{22}{7}$.`, `Luas permukaan melengkung sebuah silinder berjejari ${rr} cm ialah ${n(round(target, 2))} cm². Cari tingginya. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${h} cm`), sp: 'm' };
    },
  ];

  const g64e = [
    (r) => {
      const l = r.int(3, 12), w = r.int(2, 9), h = r.int(2, 10);
      return { q: T(`Find the volume of a cuboid ${l} cm long, ${w} cm wide and ${h} cm high.`, `Cari isi padu sebuah kuboid yang panjangnya ${l} cm, lebarnya ${w} cm dan tingginya ${h} cm.`), a: T(`$${l * w * h}\\ \\text{cm}^3$`), sp: 's' };
    },
    (r) => {
      const kind = piKind(r), rr = radiusFor(kind, r), h = r.int(3, 15);
      return { q: T(`Find the volume of a cylinder of radius ${n(rr)} cm and height ${h} cm. ${PI[kind].en}`, `Cari isi padu sebuah silinder berjejari ${n(rr)} cm dan tinggi ${h} cm. ${PI[kind].ms}`), a: T(`$${withPi(kind, rr * rr * h, 'cm')}^3$`), w: T(`$V = \\pi r^2 h$`), sp: 's' };
    },
    (r) => {
      const b = r.int(3, 10), h = r.int(3, 10), L = r.int(4, 14);
      return { q: T(`A prism has a triangular cross-section with base ${b} cm and height ${h} cm, and length ${L} cm. Find its volume.`, `Sebuah prisma mempunyai keratan rentas segi tiga dengan tapak ${b} cm dan tinggi ${h} cm, dan panjang ${L} cm. Cari isi padunya.`), a: T(`$${n((b * h * L) / 2)}\\ \\text{cm}^3$`), w: T(`Area of cross-section $\\times$ length`, `Luas keratan rentas $\\times$ panjang`), sp: 's' };
    },
  ];
  const g64m = [
    (r) => {
      const a = r.int(3, 12), h = r.int(3, 4) * 3;
      return { q: T(`Find the volume of a right pyramid with a square base of side ${a} cm and height ${h} cm.`, `Cari isi padu sebuah piramid tegak dengan tapak segi empat sama bersisi ${a} cm dan tinggi ${h} cm.`), a: T(`$${(a * a * h) / 3}\\ \\text{cm}^3$`), w: T(`$\\frac13 \\times ${a}^2 \\times ${h}$`), sp: 's' };
    },
    (r) => {
      const kind = piKind(r), rr = radiusFor(kind, r), h = r.pick([3, 6, 9, 12]);
      return { q: T(`Find the volume of a cone of base radius ${n(rr)} cm and height ${h} cm. ${PI[kind].en}`, `Cari isi padu sebuah kon berjejari tapak ${n(rr)} cm dan tinggi ${h} cm. ${PI[kind].ms}`), a: T(`$${withPi(kind, (rr * rr * h) / 3, 'cm')}^3$`), w: T(`$\\frac13 \\pi r^2 h$`), sp: 's' };
    },
    (r) => {
      const l = r.int(20, 60), w = r.int(10, 40), h = r.int(10, 40);
      const V = l * w * h;
      return { q: T(`A rectangular tank measures ${l} cm by ${w} cm by ${h} cm. Find its capacity in litres. ($1\\ \\text{litre} = 1000\\ \\text{cm}^3$)`, `Sebuah tangki segi empat tepat berukuran ${l} cm kali ${w} cm kali ${h} cm. Cari muatannya dalam liter. ($1\\ \\text{liter} = 1000\\ \\text{cm}^3$)`), a: T(`${n(V / 1000)} litres`, `${n(V / 1000)} liter`), sp: 's' };
    },
    (r) => {
      const rr = r.int(2, 9);
      return { q: T(`Find the volume of a sphere of radius ${rr} cm in terms of $\\pi$.`, `Cari isi padu sebuah sfera berjejari ${rr} cm dalam sebutan $\\pi$.`), a: T(`$${n(round((4 * rr ** 3) / 3, 4))}\\pi\\ \\text{cm}^3$`), w: T(`$\\frac43 \\pi r^3$`), sp: 's' };
    },
  ];
  const g64a = [
    (r) => {
      const R = r.pick([7, 14]), h = r.int(10, 30), r2 = r.pick([3.5, 7, 10.5]);
      const V = (22 / 7) * R * R * h;
      const d = V / ((22 / 7) * r2 * r2);
      return { q: T(`Water from a full cylindrical tank of radius ${R} cm and height ${h} cm is poured into a cylindrical jar of radius ${n(r2)} cm. Find the height of water in the jar. Use $\\pi = \\frac{22}{7}$.`, `Air dari sebuah tangki silinder penuh berjejari ${R} cm dan tinggi ${h} cm dituang ke dalam sebuah balang silinder berjejari ${n(r2)} cm. Cari tinggi air dalam balang itu. Gunakan $\\pi = \\frac{22}{7}$.`), a: T(`${n(round(d, 2))} cm`), w: T(`$\\pi(${R})^2(${h}) = \\pi(${n(r2)})^2 H$`), sp: 'l' };
    },
    (r) => {
      const R = r.int(3, 6), n1 = r.pick([8, 27, 64]);
      const k = Math.round(Math.cbrt(n1));
      return { q: T(`A solid metal sphere of radius ${R * k} cm is melted and recast into small spheres of radius ${R} cm. How many small spheres can be made?`, `Sebuah sfera logam pepejal berjejari ${R * k} cm dicairkan dan dituang semula menjadi sfera-sfera kecil berjejari ${R} cm. Berapakah bilangan sfera kecil yang boleh dihasilkan?`), a: T(`${n1}`), w: T(`$\\left(\\dfrac{${R * k}}{${R}}\\right)^3 = ${k}^3$`), sp: 'm' };
    },
    (r) => {
      const l = r.pick([50, 60, 80]), w = r.pick([30, 40, 50]), h = r.pick([20, 30, 40]);
      const flow = r.pick([10, 12, 15, 20]);
      const V = (l * w * h) / 1000;
      return { q: T(`Water flows into an empty rectangular tank ${l} cm by ${w} cm by ${h} cm at ${flow} litres per minute. How long does it take to fill the tank? Give the answer in minutes and seconds if necessary.`, `Air mengalir ke dalam sebuah tangki segi empat tepat kosong ${l} cm kali ${w} cm kali ${h} cm pada kadar ${flow} liter seminit. Berapa lamakah masa untuk memenuhi tangki itu? Berikan jawapan dalam minit dan saat jika perlu.`), a: T(`${n(V)} litres $\\div ${flow} = ${n(round(V / flow, 3))}$ min ${V / flow * 60 % 1 === 0 ? `= ${n(V / flow * 60)} s` : ''}`, `${n(V)} liter $\\div ${flow} = ${n(round(V / flow, 3))}$ min`), sp: 'm' };
    },
  ];
  SPM.addChapter(2, 6, T('Three-Dimensional Geometrical Shapes', 'Bentuk Geometri Tiga Dimensi'), [
    { id: '6.1', en: 'Geometric properties and classification', ms: 'Sifat geometri dan pengelasan', gen: { e: g61e, m: g61m, a: g61a } },
    { id: '6.2', en: 'Nets', ms: 'Jaring-jaring', gen: { e: g62e, m: g62m, a: g62a } },
    { id: '6.3', en: 'Surface area', ms: 'Luas permukaan', gen: { e: g63e, m: g63m, a: g63a } },
    { id: '6.4', en: 'Volume', ms: 'Isi padu', gen: { e: g64e, m: g64m, a: g64a } },
  ]);
})();
