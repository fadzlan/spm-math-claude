/* Form 4 – Chapters 6 to 10 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, sum, gcd, mean, median, sortNum, Fr, poly, lin, rm } = SPM;
  const S = SPM.svg;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const frT = Fr.tex;
  const fr = (a, b) => Fr.make(a, b);

  /* =============================================================== 6 */
  const SYM = { '>': '>', '>=': '\\ge', '<': '<', '<=': '\\le' };
  /** display an inequality object {a,b,c,op} in a friendly form */
  const showIneq = (q) => {
    const s = SYM[q.op];
    if (q.b === 0) return `x ${q.a < 0 ? SYM[{ '>': '<', '>=': '<=', '<': '>', '<=': '>=' }[q.op]] : s} ${n(q.c / q.a)}`;
    if (q.a === 0) return `y ${q.b < 0 ? SYM[{ '>': '<', '>=': '<=', '<': '>', '<=': '>=' }[q.op]] : s} ${n(q.c / q.b)}`;
    return `${poly([[q.a, 'x'], [q.b, 'y']])} ${s} ${q.c}`;
  };
  const sat = (q, x, y) => { const v = q.a * x + q.b * y; return q.op === '>' ? v > q.c : q.op === '>=' ? v >= q.c : q.op === '<' ? v < q.c : v <= q.c; };
  const planeI = (ineqs, shade, extra) => S.plane(Object.assign({ x: [-2, 8], y: [-2, 8], scale: 20, ineqs, shade }, extra || {}));

  const g61e = [
    (r) => {
      const P = [r.int(1, 5), r.int(1, 5)], c = r.int(3, 8), op = r.pick(['>', '<']);
      const q = { a: 1, b: 1, c, op };
      return { q: T(`Does the point $(${P[0]}, ${P[1]})$ satisfy the inequality $x + y ${SYM[op]} ${c}$?`, `Adakah titik $(${P[0]}, ${P[1]})$ memenuhi ketaksamaan $x + y ${SYM[op]} ${c}$?`), a: T(`${sat(q, ...P) ? 'Yes' : 'No'}: $${P[0]} + ${P[1]} = ${P[0] + P[1]}$`, `${sat(q, ...P) ? 'Ya' : 'Tidak'}: $${P[0]} + ${P[1]} = ${P[0] + P[1]}$`), sp: 's' };
    },
  ];
  const g61m = [
    (r) => {
      const a = r.int(2, 5) * 10, b = r.int(3, 6) * 10 + 5, tot = r.pick([300, 400, 500]);
      return { q: T(`The total cost of $x$ tickets at RM${a} each and $y$ tickets at RM${b} each is not more than RM${tot}. Write an inequality in $x$ and $y$.`, `Jumlah kos $x$ keping tiket pada harga RM${a} sekeping dan $y$ keping tiket pada harga RM${b} sekeping tidak melebihi RM${tot}. Tulis satu ketaksamaan dalam $x$ dan $y$.`), a: T(`$${a}x + ${b}y \\le ${tot}$`), sp: 's' };
    },
  ];
  const g61a = [
    (r) => {
      const h1 = r.int(2, 4), h2 = r.int(1, 3), H = r.pick([40, 60, 80]), minA = r.int(3, 6);
      return { q: T(`A factory makes two types of bags, $x$ of type $A$ and $y$ of type $B$. Type $A$ needs ${h1} hours of machine time and type $B$ needs ${h2} hours; the machine is available for at most ${H} hours. At least ${minA} bags of type $A$ must be made, and the number of type $B$ must not exceed twice the number of type $A$. Write three inequalities.`, `Sebuah kilang membuat dua jenis beg, $x$ beg jenis $A$ dan $y$ beg jenis $B$. Jenis $A$ memerlukan ${h1} jam masa mesin dan jenis $B$ memerlukan ${h2} jam; mesin itu boleh digunakan selama selebih-lebihnya ${H} jam. Sekurang-kurangnya ${minA} beg jenis $A$ mesti dibuat, dan bilangan jenis $B$ tidak boleh melebihi dua kali bilangan jenis $A$. Tulis tiga ketaksamaan.`), a: T(`$${h1}x + ${h2}y \\le ${H}$; $x \\ge ${minA}$; $y \\le 2x$`), sp: 'm' };
    },
  ];
  const g62e = [
    (r) => {
      const c = r.int(3, 6), op = r.pick(['>', '<', '>=', '<=']);
      const q = { a: 1, b: 1, c, op };
      return { q: T(`Draw the line $x + y = ${c}$ (dashed if the inequality is strict) and shade the region $x + y ${SYM[op]} ${c}$.`, `Lukis garis $x + y = ${c}$ (putus-putus jika ketaksamaan itu ketat) dan lorekkan rantau $x + y ${SYM[op]} ${c}$.`), fig: S.plane({ x: [-2, 8], y: [-2, 8], scale: 20 }), a: T(planeI([q], true), planeI([q], true)), sp: 'xl' };
    },
  ];
  const g62m = [
    (r) => {
      const k = r.int(2, 5), h = r.int(2, 5);
      const A = { a: 1, b: 0, c: k, op: r.pick(['>=', '<=']) };
      const B = { a: 0, b: 1, c: h, op: r.pick(['>=', '<=']) };
      const fig = planeI([A, B], true);
      return { q: T('Write the two inequalities that define the shaded region (a solid line means the boundary is included).', 'Tulis dua ketaksamaan yang menentukan kawasan berlorek (garis penuh bermaksud sempadan disertakan).'), fig, a: T(`$${showIneq(A)}$ and $${showIneq(B)}$`), sp: 's' };
    },
  ];
  const g62a = [
    (r) => {
      return retry(() => {
        const k = r.int(1, 3), h = r.int(4, 7), m = r.pick([1, 2]);
        // region: x >= k, y <= h, y >= m x  (triangle-ish)
        const A = { a: 1, b: 0, c: k, op: '>=' }, B = { a: 0, b: 1, c: h, op: '<=' }, C = { a: -m, b: 1, c: 0, op: '>=' };
        const fig = planeI([A, B, C], true);
        return { q: T('The shaded region is bounded by three lines (all solid). Write the three inequalities that define it.', 'Kawasan berlorek dibatasi oleh tiga garis (semuanya penuh). Tulis tiga ketaksamaan yang menentukannya.'), fig, a: T(`$${showIneq(A)}$, $${showIneq(B)}$, $y \\ge ${m === 1 ? '' : m}x$`), sp: 'm' };
      });
    },
    (r) => {
      const A = { a: 1, b: 1, c: r.int(6, 8), op: '<=' }, B = { a: 1, b: 0, c: r.int(1, 2), op: '>=' }, C = { a: 0, b: 1, c: r.int(1, 2), op: '>=' };
      return { q: T(`Shade the region that satisfies all of $x + y \\le ${A.c}$, $x \\ge ${B.c}$ and $y \\ge ${C.c}$, and state the coordinates of one point in the region.`, `Lorekkan rantau yang memenuhi semua $x + y \\le ${A.c}$, $x \\ge ${B.c}$ dan $y \\ge ${C.c}$, dan nyatakan koordinat satu titik dalam rantau itu.`), fig: S.plane({ x: [-2, 8], y: [-2, 8], scale: 20 }), a: T(`${planeI([A, B, C], true)} e.g. $(${B.c + 1}, ${C.c + 1})$`, `${planeI([A, B, C], true)} cth. $(${B.c + 1}, ${C.c + 1})$`), sp: 'xl' };
    },
  ];
  SPM.addChapter(4, 6, T('Linear Inequalities in Two Variables', 'Ketaksamaan Linear dalam Dua Pemboleh Ubah'), [
    { id: '6.1', en: 'Linear inequalities in two variables', ms: 'Ketaksamaan linear dalam dua pemboleh ubah', gen: { e: g61e, m: g61m, a: g61a } },
    { id: '6.2', en: 'Systems of linear inequalities', ms: 'Sistem ketaksamaan linear', gen: { e: g62e, m: g62m, a: g62a } },
  ]);

  /* =============================================================== 7 */
  const gPts = (pts, lang, opts) => S.graph(Object.assign({ w: 330, h: 220, series: [{ pts, type: 'line', dotsToo: true }] }, opts));
  const distFig = (pts, xmax, ymax, lang) => S.graph({ w: 330, h: 220, xr: [0, xmax, xmax > 8 ? 2 : 1], yr: [0, ymax, ymax > 60 ? 20 : 10], xlabel: lang === 'en' ? 'Time (h)' : 'Masa (j)', ylabel: lang === 'en' ? 'Distance (km)' : 'Jarak (km)', series: [{ pts, type: 'line', dotsToo: true }] });
  const g71e = [
    (r) => {
      const t = r.int(2, 4), v = r.pick([10, 15, 20, 30]);
      const pts = [[0, 0], [t, t * v]];
      const fig = T(distFig(pts, t + 1, t * v + 20, 'en'), distFig(pts, t + 1, t * v + 20, 'ms'));
      return { q: T(`The graph shows a journey. Find the speed during the journey (in km/h).`, `Graf menunjukkan satu perjalanan. Cari laju sepanjang perjalanan (dalam km/j).`), fig, a: T(`${v} km/h`, `${v} km/j`), w: T(`$\\dfrac{${t * v}}{${t}}$`), sp: 's' };
    },
  ];
  const g71m = [
    (r) => {
      const v1 = r.pick([20, 30, 40]), t1 = r.int(1, 2), rest = r.int(1, 2), t3 = r.int(1, 3);
      const d = v1 * t1;
      const pts = [[0, 0], [t1, d], [t1 + rest, d], [t1 + rest + t3, 0]];
      const T3 = t1 + rest + t3;
      const ymax = Math.ceil((d + 10) / 10) * 10;
      const fig = T(distFig(pts, T3, ymax, 'en'), distFig(pts, T3, ymax, 'ms'));
      const back = d / t3;
      return { q: T('The distance-time graph shows a cyclist going out from home, resting, and returning. Find (a) the speed on the way out, (b) how long the cyclist rests, (c) the speed on the way back.', 'Graf jarak-masa menunjukkan seorang penunggang basikal keluar dari rumah, berehat, dan pulang. Cari (a) laju semasa pergi, (b) tempoh berehat, (c) laju semasa pulang.'), fig, a: T(`(a) ${v1} km/h (b) ${rest} h (c) ${n(round(back, 2))} km/h towards home`, `(a) ${v1} km/j (b) ${rest} j (c) ${n(round(back, 2))} km/j menuju ke rumah`), sp: 'm' };
    },
  ];
  const g71a = [
    (r) => {
      const v1 = r.pick([20, 30]), v2 = r.pick([40, 60]), delay = r.int(1, 2), D = r.pick([180, 240]);
      // A leaves at t=0 with v1; B leaves at t=delay with v2 same direction. meeting: v1 t = v2 (t - delay)
      const t = (v2 * delay) / (v2 - v1);
      const d = v1 * t;
      const ymax = D + 20;
      const ptsA = [[0, 0], [D / v1, D]], ptsB = [[delay, 0], [delay + D / v2, D]];
      const xmax = Math.ceil(D / v1) + 1;
      const f = (lang) => S.graph({ w: 330, h: 220, xr: [0, xmax, 1], yr: [0, ymax, 40], xlabel: lang === 'en' ? 'Time (h)' : 'Masa (j)', ylabel: lang === 'en' ? 'Distance (km)' : 'Jarak (km)', series: [{ pts: ptsA, type: 'line' }, { pts: ptsB, type: 'line', dash: true }] });
      return { q: T(`Two cars travel along the same road from town $P$. Car $A$ (solid) leaves at time 0 and Car $B$ (dashed) leaves ${delay} hour${delay > 1 ? 's' : ''} later. Find the speed of each car, and the time and distance from $P$ at which $B$ overtakes $A$.`, `Dua buah kereta bergerak di jalan yang sama dari bandar $P$. Kereta $A$ (garis penuh) bertolak pada masa 0 dan Kereta $B$ (putus-putus) bertolak ${delay} jam kemudian. Cari laju setiap kereta, dan masa serta jarak dari $P$ apabila $B$ memintas $A$.`), fig: T(f('en'), f('ms')), a: T(`$A$: ${v1} km/h; $B$: ${v2} km/h; they meet at $t = ${n(round(t, 2))}$ h, ${n(round(d, 1))} km from $P$`, `$A$: ${v1} km/j; $B$: ${v2} km/j; bertemu pada $t = ${n(round(t, 2))}$ j, ${n(round(d, 1))} km dari $P$`), sp: 'l' };
    },
  ];
  const speedFig = (pts, xmax, ymax, lang) => S.graph({ w: 330, h: 220, xr: [0, xmax, xmax > 12 ? 2 : 1], yr: [0, ymax, ymax > 30 ? 10 : 5], xlabel: lang === 'en' ? 'Time (s)' : 'Masa (s)', ylabel: lang === 'en' ? 'Speed (m/s)' : 'Laju (m/s)', series: [{ pts, type: 'line', dotsToo: true }] });
  const g72e = [
    (r) => {
      const t1 = r.int(2, 6), v = r.int(2, 5) * t1;
      const pts = [[0, 0], [t1, v]];
      const fig = T(speedFig(pts, t1 + 1, v + 4, 'en'), speedFig(pts, t1 + 1, v + 4, 'ms'));
      return { q: T('The speed-time graph shows a car accelerating uniformly from rest. Find the acceleration.', 'Graf laju-masa menunjukkan sebuah kereta memecut secara seragam dari keadaan pegun. Cari pecutannya.'), fig, a: T(`${n(v / t1)} m/s²`), sp: 's' };
    },
  ];
  const g72m = [
    (r) => {
      const t1 = r.int(2, 5), v = r.pick([10, 12, 16, 20]), tu = r.int(3, 8), t3 = r.int(2, 5);
      const pts = [[0, 0], [t1, v], [t1 + tu, v], [t1 + tu + t3, 0]];
      const xm = t1 + tu + t3;
      const fig = T(speedFig(pts, xm, v + 5, 'en'), speedFig(pts, xm, v + 5, 'ms'));
      const dist = (v * (tu + xm)) / 2;
      return { q: T('The graph shows the motion of a train. Find (a) the acceleration in the first stage, (b) the time for which the speed is uniform, (c) the deceleration in the last stage, (d) the total distance travelled.', 'Graf menunjukkan gerakan sebuah kereta api. Cari (a) pecutan pada peringkat pertama, (b) tempoh laju seragam, (c) nyahpecutan pada peringkat terakhir, (d) jumlah jarak yang dilalui.'), fig, a: T(`(a) ${n(round(v / t1, 2))} m/s² (b) ${tu} s (c) ${n(round(v / t3, 2))} m/s² (d) ${n(dist)} m`, `(a) ${n(round(v / t1, 2))} m/s² (b) ${tu} s (c) ${n(round(v / t3, 2))} m/s² (d) ${n(dist)} m`), w: T(`Area of trapezium $= \\frac12(${tu} + ${xm}) \\times ${v}$`, `Luas trapezium $= \\frac12(${tu} + ${xm}) \\times ${v}$`), sp: 'm' };
    },
  ];
  const g72a = [
    (r) => {
      const t1 = r.int(3, 6), tu = r.int(4, 9), t3 = r.int(3, 6), v = r.int(4, 10) * 2;
      const xm = t1 + tu + t3, D = (v * (tu + xm)) / 2;
      const f = (lang) => S.graph({ w: 330, h: 220, xr: [0, xm, 2], yr: [0, 30, 10], xlabel: lang === 'en' ? 'Time (s)' : 'Masa (s)', ylabel: lang === 'en' ? 'Speed (m/s)' : 'Laju (m/s)', series: [{ pts: [[0, 0], [t1, 20], [t1 + tu, 20], [xm, 0]], type: 'line' }], extra: (m) => S.text(m.sx(t1) - 6, m.sy(20) - 10, 'v', { i: true }) });
      return { q: T(`A particle accelerates uniformly from rest to a speed of $v$ m/s in ${t1} s, moves at $v$ m/s for ${tu} s, then decelerates uniformly to rest in ${t3} s. The total distance travelled is ${n(D)} m. Find $v$.`, `Satu zarah memecut secara seragam dari keadaan pegun kepada laju $v$ m/s dalam ${t1} s, bergerak pada $v$ m/s selama ${tu} s, kemudian nyahpecut secara seragam sehingga berhenti dalam ${t3} s. Jumlah jarak yang dilalui ialah ${n(D)} m. Cari $v$.`), a: T(`$v = ${v}$`), w: T(`$\\frac12(${tu} + ${xm})v = ${n(D)}$`), sp: 'm' };
    },
  ];
  SPM.addChapter(4, 7, T('Graphs of Motion', 'Graf Gerakan'), [
    { id: '7.1', en: 'Distance-time graphs', ms: 'Graf jarak-masa', gen: { e: g71e, m: g71m, a: g71a } },
    { id: '7.2', en: 'Speed-time graphs', ms: 'Graf laju-masa', gen: { e: g72e, m: g72m, a: g72a } },
  ]);

  /* =============================================================== 8 */
  const list = (v) => v.join(',\\ ');
  const quart = (v) => {
    const s = sortNum(v), m = s.length >> 1;
    const lo = s.slice(0, m), hi = s.slice(s.length % 2 ? m + 1 : m);
    return { min: s[0], q1: median(lo), med: median(s), q3: median(hi), max: s[s.length - 1] };
  };
  const varp = (v) => sum(v.map((x) => x * x)) / v.length - Math.pow(mean(v), 2);
  const sd = (v) => Math.sqrt(varp(v));
  const f2 = (x) => n(round(x, 2));
  const rand = (r, k, lo, hi) => Array.from({ length: k }, () => r.int(lo, hi));
  const dotFig = (v, lo, hi) => {
    const W = 320, H = 110, pl = 20, pr = 14, base = H - 26;
    const sx = (x) => pl + ((x - lo) / (hi - lo)) * (W - pl - pr);
    let out = S.line(pl - 6, base, W - pr + 6, base);
    const cnt = {}; v.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1));
    for (let x = lo; x <= hi; x++) { out += S.text(sx(x), base + 12, String(x), { s: 10 }) + S.line(sx(x), base, sx(x), base + 3, { w: 1 }); for (let i = 0; i < (cnt[x] || 0); i++) out += S.circle(sx(x), base - 7 - i * 10, 3.6, { fill: 'currentColor' }); }
    return S.wrap(W, H, out, 'dot plot');
  };
  const boxFig = (rows, lo, hi) => {
    const W = 330, H = 40 + rows.length * 46, pl = 20, pr = 14;
    const sx = (x) => pl + ((x - lo) / (hi - lo)) * (W - pl - pr);
    let out = '';
    rows.forEach((b, i) => {
      const y = 20 + i * 46;
      out += S.line(sx(b.min), y, sx(b.q1), y) + S.line(sx(b.q3), y, sx(b.max), y) + S.rect(sx(b.q1), y - 12, sx(b.q3) - sx(b.q1), 24) + S.line(sx(b.med), y - 12, sx(b.med), y + 12, { w: 2 });
      out += S.line(sx(b.min), y - 6, sx(b.min), y + 6) + S.line(sx(b.max), y - 6, sx(b.max), y + 6);
      if (b.label) out += S.text(pl - 4, y - 18, b.label, { a: 'start', s: 10 });
    });
    const base = H - 16;
    out += S.line(pl, base, W - pr, base);
    const st = (hi - lo) > 40 ? 10 : (hi - lo) > 16 ? 5 : 2;
    for (let x = Math.ceil(lo / st) * st; x <= hi; x += st) out += S.line(sx(x), base, sx(x), base + 3, { w: 1 }) + S.text(sx(x), base + 12, String(x), { s: 10 });
    return S.wrap(W, H, out, 'box plot');
  };

  const g811e = [
    (r) => {
      const c = r.pick([[T('the heights of Form 4 students', 'ketinggian murid Tingkatan 4'), true], [T('the number of days in a week', 'bilangan hari dalam seminggu'), false], [T('the time students take to travel to school', 'masa yang diambil murid untuk ke sekolah'), true], [T('how many sides a triangle has', 'bilangan sisi sebuah segi tiga'), false]]);
      return { q: T(`Would the data on ${c[0].en} show variability (dispersion)? Explain.`, `Adakah data tentang ${c[0].ms} menunjukkan kepelbagaian (serakan)? Terangkan.`), a: c[1] ? T('Yes: different people or occasions give different values, so the data are spread out.', 'Ya: orang atau keadaan yang berlainan memberikan nilai yang berbeza, jadi data itu tersebar.') : T('No: the value is always the same, so there is no spread.', 'Tidak: nilainya sentiasa sama, jadi tiada serakan.'), sp: 's' };
    },
  ];
  const g811m = [
    (r) => ({ q: T('Write a statistical question about students in your school whose answers are expected to vary, and state one suitable way to collect data for it.', 'Tulis satu soalan statistik tentang murid di sekolah anda yang jawapannya dijangka berbeza-beza, dan nyatakan satu cara yang sesuai untuk mengumpul data.'), a: T('E.g. "How many hours per week do Form 4 students spend on sport?" Collect the data with a short questionnaire given to a random sample from each class.', 'Cth. "Berapa jam seminggu murid Tingkatan 4 menghabiskan masa untuk sukan?" Kumpul data dengan soal selidik ringkas kepada sampel rawak dari setiap kelas.'), sp: 'm' }),
  ];
  const g811a = g811m;
  const g812e = [
    (r) => {
      const a = rand(r, 10, 3, 7), b = rand(r, 10, 1, 9);
      const A = dotFig(a, 1, 9), B = dotFig(b, 1, 9);
      return { q: T('The dot plots show the marks (out of 9) of two groups. Which group has the more spread-out marks? Give a reason.', 'Plot titik menunjukkan markah (daripada 9) bagi dua kumpulan. Kumpulan manakah yang markahnya lebih bertaburan? Berikan sebab.'), fig: T([A, B], [A, B]), a: T(`Group 2 (right) has range ${Math.max(...b) - Math.min(...b)} compared with ${Math.max(...a) - Math.min(...a)} for Group 1, so its marks are more spread out.`, `Kumpulan 2 (kanan) mempunyai julat ${Math.max(...b) - Math.min(...b)} berbanding ${Math.max(...a) - Math.min(...a)} bagi Kumpulan 1, jadi markahnya lebih bertaburan.`), sp: 's' };
    },
  ];
  const g812m = [
    (r) => {
      const a = rand(r, 9, 40, 80), b = rand(r, 9, 40, 80);
      const st = (v) => sortNum(v).join(', ');
      return { q: T(`Group $A$ marks: ${a.join(', ')}. Group $B$ marks: ${b.join(', ')}. Compare the two groups' centre (median) and spread (range).`, `Markah Kumpulan $A$: ${a.join(', ')}. Markah Kumpulan $B$: ${b.join(', ')}. Bandingkan pusat (median) dan serakan (julat) bagi kedua-dua kumpulan.`), a: T(`$A$: median ${n(median(a))}, range ${Math.max(...a) - Math.min(...a)}; $B$: median ${n(median(b))}, range ${Math.max(...b) - Math.min(...b)}.`, `$A$: median ${n(median(a))}, julat ${Math.max(...a) - Math.min(...a)}; $B$: median ${n(median(b))}, julat ${Math.max(...b) - Math.min(...b)}.`), sp: 'l' };
    },
  ];
  const g812a = g812m;
  const g821e = [
    (r) => {
      const v = rand(r, r.pick([6, 8, 9]), 5, 40);
      const q = quart(v);
      return { q: T(`Find the range and the interquartile range of $${list(v)}$.`, `Cari julat dan julat antara kuartil bagi $${list(v)}$.`), a: T(`Ordered: $${list(sortNum(v))}$. Range $= ${q.max - q.min}$; $Q_1 = ${n(q.q1)}$, $Q_3 = ${n(q.q3)}$, IQR $= ${n(q.q3 - q.q1)}$`, `Tertib: $${list(sortNum(v))}$. Julat $= ${q.max - q.min}$; $Q_1 = ${n(q.q1)}$, $Q_3 = ${n(q.q3)}$, JAK $= ${n(q.q3 - q.q1)}$`), sp: 's' };
    },
  ];
  const g821m = [
    (r) => {
      const v = rand(r, 6, 2, 12);
      return { q: T(`Find the mean, variance and standard deviation of $${list(v)}$ (population; give the standard deviation to 2 decimal places).`, `Cari min, varians dan sisihan piawai bagi $${list(v)}$ (populasi; berikan sisihan piawai betul kepada 2 tempat perpuluhan).`), a: T(`Mean $= ${f2(mean(v))}$; variance $= \\dfrac{\\sum x^2}{N} - \\bar{x}^2 = ${f2(varp(v))}$; s.d. $= ${f2(sd(v))}$`, `Min $= ${f2(mean(v))}$; varians $= \\dfrac{\\sum x^2}{N} - \\bar{x}^2 = ${f2(varp(v))}$; s.p. $= ${f2(sd(v))}$`), w: T(`$\\sum x = ${sum(v)}$, $\\sum x^2 = ${sum(v.map((x) => x * x))}$`), sp: 'l' };
    },
    (r) => {
      const xs = [1, 2, 3, 4, 5], fs = xs.map(() => r.int(1, 6));
      const v = xs.flatMap((x, i) => Array(fs[i]).fill(x));
      const tab = (h) => SPM.table([[h[1], ...fs]], { head: [h[0], ...xs] });
      return { q: T(`The table shows the number of goals scored in some matches.<br>${tab(['Goals ($x$)', 'Frequency ($f$)'])}<br>Find the mean and standard deviation (population), correct to 2 decimal places.`, `Jadual menunjukkan bilangan gol yang dijaringkan dalam beberapa perlawanan.<br>${tab(['Gol ($x$)', 'Kekerapan ($f$)'])}<br>Cari min dan sisihan piawai (populasi), betul kepada 2 tempat perpuluhan.`), a: T(`Mean $= ${f2(mean(v))}$, s.d. $= ${f2(sd(v))}$`, `Min $= ${f2(mean(v))}$, s.p. $= ${f2(sd(v))}$`), w: T(`$\\sum fx = ${sum(xs.map((x, i) => x * fs[i]))}$, $\\sum fx^2 = ${sum(xs.map((x, i) => x * x * fs[i]))}$, $\\sum f = ${sum(fs)}$`), sp: 'l' };
    },
  ];
  const g821a = [
    (r) => {
      const N = r.int(5, 10), sx = r.int(30, 60), mean_ = sx / N;
      const sxx = Math.round(N * (mean_ * mean_ + r.int(2, 9)));
      const var_ = sxx / N - mean_ * mean_;
      return { q: T(`For ${N} numbers, $\\sum x = ${sx}$ and $\\sum x^2 = ${sxx}$. Find the mean, the variance and the standard deviation (2 decimal places).`, `Bagi ${N} nombor, $\\sum x = ${sx}$ dan $\\sum x^2 = ${sxx}$. Cari min, varians dan sisihan piawai (2 tempat perpuluhan).`), a: T(`Mean $${f2(mean_)}$; variance $${f2(var_)}$; s.d. $${f2(Math.sqrt(var_))}$`, `Min $${f2(mean_)}$; varians $${f2(var_)}$; s.p. $${f2(Math.sqrt(var_))}$`), sp: 'm' };
    },
    (r) => {
      const v = rand(r, 5, 4, 14);
      const x = r.int(4, 14);
      const N = 6, full = v.concat([x]);
      return { q: T(`Five numbers are $${list(v)}$. A sixth number is added so that the mean of the six numbers is ${f2(mean(full))}. Find the sixth number.`, `Lima nombor ialah $${list(v)}$. Nombor keenam ditambah supaya min bagi enam nombor itu ialah ${f2(mean(full))}. Cari nombor keenam itu.`), a: T(`$${x}$`), w: T(`$6 \\times ${f2(mean(full))} - ${sum(v)}$`), sp: 'm' };
    },
  ];
  const g822e = [
    (r) => {
      const c = r.pick([
        [T('a quick estimate of the spread using only the largest and smallest values', 'anggaran pantas serakan menggunakan nilai terbesar dan terkecil sahaja'), T('range', 'julat')],
        [T('the spread of the middle 50% of the data, not affected by extreme values', 'serakan bagi 50% data di tengah, tidak terjejas oleh nilai ekstrem'), T('interquartile range', 'julat antara kuartil')],
        [T('a measure of spread that uses every value in the data', 'ukuran serakan yang menggunakan setiap nilai dalam data'), T('standard deviation', 'sisihan piawai')],
      ]);
      return { q: T(`Which measure of dispersion (range, interquartile range or standard deviation) is described? "${c[0].en}"`, `Ukuran serakan yang manakah (julat, julat antara kuartil atau sisihan piawai) yang diterangkan? "${c[0].ms}"`), a: c[1], sp: 's' };
    },
  ];
  const g822m = [
    (r) => {
      const v = rand(r, 7, 20, 40).concat([r.int(80, 100)]);
      const q = quart(v);
      return { q: T(`The data $${list(v)}$ include one extreme value. Which is a better measure of spread here: the range or the interquartile range? Calculate both.`, `Data $${list(v)}$ mengandungi satu nilai ekstrem. Yang manakah ukuran serakan yang lebih baik di sini: julat atau julat antara kuartil? Hitung kedua-duanya.`), a: T(`Range $= ${q.max - q.min}$; IQR $= ${n(q.q3 - q.q1)}$. The IQR is better because the extreme value ${q.max} inflates the range.`, `Julat $= ${q.max - q.min}$; JAK $= ${n(q.q3 - q.q1)}$. JAK lebih baik kerana nilai ekstrem ${q.max} membesarkan julat.`), sp: 'm' };
    },
  ];
  const g822a = g822m;
  const g823e = [
    (r) => {
      const v = rand(r, 9, 10, 60), q = quart(v);
      const fig = boxFig([q], Math.floor(q.min / 10) * 10, Math.ceil(q.max / 10) * 10);
      return { q: T('Read the five-number summary from the boxplot (minimum, $Q_1$, median, $Q_3$, maximum).', 'Baca ringkasan lima nombor daripada plot kotak (minimum, $Q_1$, median, $Q_3$, maksimum).'), fig, a: T(`${q.min}, ${n(q.q1)}, ${n(q.med)}, ${n(q.q3)}, ${q.max}`), sp: 's' };
    },
  ];
  const g823m = [
    (r) => {
      const v = rand(r, r.pick([9, 11]), 8, 60), q = quart(v);
      const fig = boxFig([q], Math.floor(q.min / 10) * 10, Math.ceil(q.max / 10) * 10);
      return { q: T(`Construct a boxplot for the data $${list(v)}$. State the range and the interquartile range.`, `Bina plot kotak bagi data $${list(v)}$. Nyatakan julat dan julat antara kuartil.`), a: T(`${fig} Five-number summary: ${q.min}, ${n(q.q1)}, ${n(q.med)}, ${n(q.q3)}, ${q.max}; range ${q.max - q.min}; IQR ${n(q.q3 - q.q1)}`, `${fig} Ringkasan lima nombor: ${q.min}, ${n(q.q1)}, ${n(q.med)}, ${n(q.q3)}, ${q.max}; julat ${q.max - q.min}; JAK ${n(q.q3 - q.q1)}`), sp: 'l' };
    },
  ];
  const g823a = [
    (r) => {
      const a = quart(rand(r, 9, 20, 60)), b = quart(rand(r, 9, 10, 80));
      const lo = 0, hi = 80;
      a.label = 'A'; b.label = 'B';
      const fig = boxFig([a, b], lo, hi);
      return { q: T('The boxplots show the marks of two classes on the same scale. Compare the medians and the interquartile ranges of the two classes and state which class is more consistent.', 'Plot kotak menunjukkan markah dua buah kelas pada skala yang sama. Bandingkan median dan julat antara kuartil kedua-dua kelas dan nyatakan kelas yang lebih konsisten.'), fig, a: T(`Median: A ${n(a.med)}, B ${n(b.med)}. IQR: A ${n(a.q3 - a.q1)}, B ${n(b.q3 - b.q1)}. ${a.q3 - a.q1 <= b.q3 - b.q1 ? 'A' : 'B'} has the smaller IQR, so it is more consistent.`, `Median: A ${n(a.med)}, B ${n(b.med)}. JAK: A ${n(a.q3 - a.q1)}, B ${n(b.q3 - b.q1)}. ${a.q3 - a.q1 <= b.q3 - b.q1 ? 'A' : 'B'} mempunyai JAK yang lebih kecil, jadi lebih konsisten.`), sp: 'm' };
    },
  ];
  const g824e = [
    (r) => {
      const v = rand(r, 6, 5, 20), k = r.int(2, 9);
      return { q: T(`The data $${list(v)}$ have mean ${f2(mean(v))} and standard deviation ${f2(sd(v))}. ${k} is added to every value. State the new mean and the new standard deviation.`, `Data $${list(v)}$ mempunyai min ${f2(mean(v))} dan sisihan piawai ${f2(sd(v))}. ${k} ditambah kepada setiap nilai. Nyatakan min baharu dan sisihan piawai baharu.`), a: T(`Mean ${f2(mean(v) + k)}; standard deviation unchanged (${f2(sd(v))})`, `Min ${f2(mean(v) + k)}; sisihan piawai tidak berubah (${f2(sd(v))})`), sp: 's' };
    },
  ];
  const g824m = [
    (r) => {
      const v = rand(r, 6, 5, 20), a = r.pick([2, 3, -2, 0.5]), b = r.int(1, 5);
      const y = v.map((x) => a * x + b);
      return { q: T(`Each value $x$ in a data set is changed to $y = ${a}x + ${b}$. The original mean is ${f2(mean(v))}, range ${Math.max(...v) - Math.min(...v)} and standard deviation ${f2(sd(v))}. Find the new mean, range and standard deviation.`, `Setiap nilai $x$ dalam satu set data ditukar kepada $y = ${a}x + ${b}$. Min asal ialah ${f2(mean(v))}, julat ${Math.max(...v) - Math.min(...v)} dan sisihan piawai ${f2(sd(v))}. Cari min, julat dan sisihan piawai baharu.`), a: T(`Mean ${f2(a * mean(v) + b)}; range ${f2(Math.abs(a) * (Math.max(...v) - Math.min(...v)))}; s.d. ${f2(Math.abs(a) * sd(v))}`, `Min ${f2(a * mean(v) + b)}; julat ${f2(Math.abs(a) * (Math.max(...v) - Math.min(...v)))}; s.p. ${f2(Math.abs(a) * sd(v))}`), sp: 'm' };
    },
  ];
  const g824a = [
    (r) => {
      const v = rand(r, 7, 12, 22), out = r.int(60, 90);
      const w = v.concat([out]);
      return { q: T(`The data $${list(v)}$ are joined by an extreme value ${out}. Find the mean and standard deviation before and after the value is added (2 decimal places) and describe the effect.`, `Data $${list(v)}$ ditambah dengan satu nilai ekstrem ${out}. Cari min dan sisihan piawai sebelum dan selepas nilai itu ditambah (2 tempat perpuluhan) dan huraikan kesannya.`), a: T(`Before: mean ${f2(mean(v))}, s.d. ${f2(sd(v))}. After: mean ${f2(mean(w))}, s.d. ${f2(sd(w))}. Both increase; the standard deviation increases greatly.`, `Sebelum: min ${f2(mean(v))}, s.p. ${f2(sd(v))}. Selepas: min ${f2(mean(w))}, s.p. ${f2(sd(w))}. Kedua-duanya meningkat; sisihan piawai meningkat dengan banyak.`), sp: 'l' };
    },
  ];
  const g825e = [
    (r) => {
      const A = rand(r, 8, 30, 70), B = rand(r, 8, 30, 70);
      return { q: T(`Set $A$: $${list(A)}$; set $B$: $${list(B)}$. Find the median and interquartile range of each and state which set has the higher typical value and which is more spread out.`, `Set $A$: $${list(A)}$; set $B$: $${list(B)}$. Cari median dan julat antara kuartil bagi setiap set dan nyatakan set yang mempunyai nilai tipikal lebih tinggi dan set yang lebih bertaburan.`), a: (() => { const a = quart(A), b = quart(B); return T(`A: median ${n(a.med)}, IQR ${n(a.q3 - a.q1)}; B: median ${n(b.med)}, IQR ${n(b.q3 - b.q1)}. Higher median: ${a.med >= b.med ? 'A' : 'B'}; more spread out: ${a.q3 - a.q1 >= b.q3 - b.q1 ? 'A' : 'B'}.`, `A: median ${n(a.med)}, JAK ${n(a.q3 - a.q1)}; B: median ${n(b.med)}, JAK ${n(b.q3 - b.q1)}. Median lebih tinggi: ${a.med >= b.med ? 'A' : 'B'}; lebih bertaburan: ${a.q3 - a.q1 >= b.q3 - b.q1 ? 'A' : 'B'}.`); })(), sp: 'l' };
    },
  ];
  SPM.addChapter(4, 8, T('Measures of Dispersion of Ungrouped Data', 'Sukatan Serakan Data Tak Terkumpul'), [
    { id: '8.1.1', en: 'Meaning of dispersion', ms: 'Maksud serakan', gen: { e: g811e, m: g811m, a: g811a } },
    { id: '8.1.2', en: 'Compare representations', ms: 'Membandingkan perwakilan data', gen: { e: g812e, m: g812m, a: g812a } },
    { id: '8.2.1', en: 'Measures of dispersion', ms: 'Sukatan serakan', gen: { e: g821e, m: g821m, a: g821a } },
    { id: '8.2.2', en: 'Advantages and disadvantages', ms: 'Kelebihan dan kekurangan', gen: { e: g822e, m: g822m, a: g822a } },
    { id: '8.2.3', en: 'Boxplots', ms: 'Plot kotak', gen: { e: g823e, m: g823m, a: g823a } },
    { id: '8.2.4', en: 'Effects of changes to data', ms: 'Kesan perubahan data', gen: { e: g824e, m: g824m, a: g824a } },
    { id: '8.2.5', en: 'Compare distributions', ms: 'Membandingkan taburan', gen: { e: g825e, m: g825e, a: g825e } },
  ]);

  /* =============================================================== 9 */
  const P = (a, b) => frT(fr(a, b));
  const g91e = [
    (r) => {
      const c = r.pick([[T('Two cards are drawn one after another, and the first card is put back before the second is drawn.', 'Dua keping kad ditarik satu demi satu, dan kad pertama dimasukkan semula sebelum kad kedua ditarik.'), T('with replacement (independent)', 'dengan pengembalian (tak bersandar)')], [T('Two sweets are taken from a bag one after another and eaten.', 'Dua biji gula-gula diambil daripada sebuah beg satu demi satu dan dimakan.'), T('without replacement (dependent)', 'tanpa pengembalian (bersandar)')]]);
      return { q: T(`${c[0].en} Is this with or without replacement? Are the events independent or dependent?`, `${c[0].ms} Adakah ini dengan atau tanpa pengembalian? Adakah peristiwa itu tak bersandar atau bersandar?`), a: c[1], sp: 's' };
    },
    (r) => {
      const c = r.pick([[T('A: the number is even; B: the number is odd (one die roll)', 'A: nombor genap; B: nombor ganjil (satu golekan dadu)'), true], [T('A: the number is even; B: the number is greater than 4 (one die roll)', 'A: nombor genap; B: nombor lebih besar daripada 4 (satu golekan dadu)'), false]]);
      return { q: T(`Are the events mutually exclusive? ${c[0].en}`, `Adakah peristiwa itu saling eksklusif? ${c[0].ms}`), a: c[1] ? T('Yes: no number is both even and odd.', 'Ya: tiada nombor yang genap dan ganjil.') : T('No: 6 is both even and greater than 4.', 'Tidak: 6 ialah genap dan lebih besar daripada 4.'), sp: 's' };
    },
  ];
  const g91m = [
    (r) => {
      const c = r.pick([['H', 'T'], ['1', '2', '3']]);
      const pairs = c.flatMap((a) => c.map((b) => `(${a}, ${b})`));
      return { q: T(`A ${c.length === 2 ? 'coin is tossed twice' : 'spinner with sectors 1, 2 and 3 is spun twice'}. List the sample space as ordered pairs.`, `${c.length === 2 ? 'Sekeping syiling dilambung dua kali' : 'Sebuah pemutar dengan sektor 1, 2 dan 3 diputar dua kali'}. Senaraikan ruang sampel sebagai pasangan tertib.`), a: T(`$\\{${pairs.join(',\\ ')}\\}$ (${pairs.length} outcomes)`, `$\\{${pairs.join(',\\ ')}\\}$ (${pairs.length} kesudahan)`), sp: 's' };
    },
  ];
  const g91a = [
    (r) => ({ q: T('Ali says: "Mutually exclusive events are always independent." Use the events $A$: a fair die shows 1 and $B$: the same die shows 2 to show that he is wrong.', 'Ali berkata: "Peristiwa saling eksklusif sentiasa tak bersandar." Gunakan peristiwa $A$: dadu adil menunjukkan 1 dan $B$: dadu yang sama menunjukkan 2 untuk menunjukkan bahawa dia salah.'), a: T('$A$ and $B$ cannot both happen, so they are mutually exclusive: $P(A \\text{ and } B) = 0$. But $P(A) \\times P(B) = \\dfrac{1}{36} \\neq 0$. Independent events would need $P(A \\text{ and } B) = P(A) \\times P(B)$.', '$A$ dan $B$ tidak boleh berlaku serentak, jadi saling eksklusif: $P(A \\text{ dan } B) = 0$. Tetapi $P(A) \\times P(B) = \\dfrac{1}{36} \\neq 0$. Peristiwa tak bersandar memerlukan $P(A \\text{ dan } B) = P(A) \\times P(B)$.'), sp: 'm' }),
  ];
  const g92e = [
    (r) => {
      const rows = range(1, 6).map((a) => range(1, 6).map((b) => a + b));
      const tgt = r.int(5, 9);
      const cnt = rows.flat().filter((v) => v === tgt).length;
      return { q: T(`Two fair dice are rolled and the sums are shown in a table of 36 outcomes. Find $P(\\text{sum} = ${tgt})$.`, `Dua biji dadu adil digolek dan hasil tambahnya ditunjukkan dalam jadual 36 kesudahan. Cari $P(\\text{hasil tambah} = ${tgt})$.`), a: T(`$${P(cnt, 36)}$`), sp: 's' };
    },
  ];
  const g92m = [
    (r) => {
      const pa = r.int(2, 4), pb = r.int(2, 4), both = r.int(1, 2);
      const tot = 12;
      return { q: T(`In a group of ${tot} students, ${pa + both} play the guitar ($A$) and ${pb + both} play the piano ($B$), and ${both} play both. Find $P(A)$, $P(B)$, $P(A \\cap B)$ and verify that $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ using the number who play at least one instrument.`, `Dalam sekumpulan ${tot} orang murid, ${pa + both} orang bermain gitar ($A$) dan ${pb + both} orang bermain piano ($B$), dan ${both} orang bermain kedua-duanya. Cari $P(A)$, $P(B)$, $P(A \\cap B)$ dan sahkan bahawa $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ menggunakan bilangan murid yang bermain sekurang-kurangnya satu alat muzik.`), a: T(`$P(A) = ${P(pa + both, tot)}$, $P(B) = ${P(pb + both, tot)}$, $P(A \\cap B) = ${P(both, tot)}$; $P(A \\cup B) = ${P(pa + pb + both, tot)}$, and ${pa + both} + ${pb + both} - ${both} = ${pa + pb + both} students ✓`), sp: 'l' };
    },
  ];
  const g92a = [
    (r) => ({ q: T('A student claims that $P(A \\cup B) = P(A) + P(B)$ always. Give an example where this fails, and state the condition under which it is correct.', 'Seorang murid mendakwa bahawa $P(A \\cup B) = P(A) + P(B)$ sentiasa benar. Berikan satu contoh apabila ia gagal, dan nyatakan syarat apabila ia betul.'), a: T('For one die, $A$: even, $B$: greater than 3. $P(A) + P(B) = \\dfrac{3}{6} + \\dfrac{3}{6} = 1$ but $P(A \\cup B) = \\dfrac{4}{6}$ (2, 4, 5, 6). It is correct only when $A$ and $B$ are mutually exclusive.', 'Bagi satu dadu, $A$: genap, $B$: lebih besar daripada 3. $P(A) + P(B) = \\dfrac{3}{6} + \\dfrac{3}{6} = 1$ tetapi $P(A \\cup B) = \\dfrac{4}{6}$ (2, 4, 5, 6). Ia betul hanya apabila $A$ dan $B$ saling eksklusif.'), sp: 'm' }),
  ];
  const g93e = [
    (r) => {
      const k = r.int(1, 6), m = r.int(1, 6);
      return { q: T(`A fair die is rolled twice. Find the probability of getting ${k} on the first roll and ${m} on the second.`, `Sebiji dadu adil digolek dua kali. Cari kebarangkalian mendapat ${k} pada golekan pertama dan ${m} pada golekan kedua.`), a: T(`$\\dfrac{1}{6} \\times \\dfrac{1}{6} = \\dfrac{1}{36}$`), sp: 's' };
    },
  ];
  const g93m = [
    (r) => {
      const red = r.int(3, 6), blue = r.int(2, 5), N = red + blue;
      const RR = fr(red * (red - 1), N * (N - 1)), BB = fr(blue * (blue - 1), N * (N - 1)), same = Fr.add(RR, BB);
      return { q: T(`A bag has ${red} red and ${blue} blue balls. Two balls are drawn one after another without replacement. Find the probability that (a) both are red, (b) the two balls have the same colour.`, `Sebuah beg mengandungi ${red} biji bola merah dan ${blue} biji bola biru. Dua biji bola ditarik satu demi satu tanpa pengembalian. Cari kebarangkalian bahawa (a) kedua-duanya merah, (b) kedua-dua bola berwarna sama.`), a: T(`(a) $\\dfrac{${red}}{${N}} \\times \\dfrac{${red - 1}}{${N - 1}} = ${frT(RR)}$ (b) $${frT(same)}$`), sp: 'l' };
    },
  ];
  const g93a = [
    (r) => {
      const red = r.int(3, 5), blue = r.int(3, 5), green = r.int(2, 4), N = red + blue + green;
      const p = fr(red * (red - 1) * (red - 2), N * (N - 1) * (N - 2));
      need(red >= 3);
      return { q: T(`A bag has ${red} red, ${blue} blue and ${green} green balls. Three balls are drawn without replacement. Find the probability that all three are red.`, `Sebuah beg mengandungi ${red} biji bola merah, ${blue} biru dan ${green} hijau. Tiga biji bola ditarik tanpa pengembalian. Cari kebarangkalian ketiga-tiganya merah.`), a: T(`$\\dfrac{${red}}{${N}} \\times \\dfrac{${red - 1}}{${N - 1}} \\times \\dfrac{${red - 2}}{${N - 2}} = ${frT(p)}$`), sp: 'l' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5);
      return { q: T(`The probability that Aina is late on any school day is $\\dfrac{1}{${a + 3}}$, independently each day. Find the probability that she is late on exactly one of two days.`, `Kebarangkalian Aina lewat pada mana-mana hari persekolahan ialah $\\dfrac{1}{${a + 3}}$, secara bebas setiap hari. Cari kebarangkalian dia lewat pada tepat satu daripada dua hari.`), a: T(`$2 \\times \\dfrac{1}{${a + 3}} \\times \\dfrac{${a + 2}}{${a + 3}} = ${frT(fr(2 * (a + 2), (a + 3) * (a + 3)))}$`), sp: 'l' };
    },
  ];
  const g94Ee = [
    (r) => {
      const p = r.pick([[1, 5], [1, 4], [2, 5], [1, 10]]), N = r.pick([100, 200, 400, 500]);
      return { q: T(`The probability that a bulb is faulty is $${P(p[0], p[1])}$. Of ${N} bulbs, how many are expected to be faulty?`, `Kebarangkalian sebiji mentol rosak ialah $${P(p[0], p[1])}$. Daripada ${N} biji mentol, berapakah bilangan yang dijangka rosak?`), a: T(`${(N * p[0]) / p[1]}`), sp: 's' };
    },
  ];
  SPM.addChapter(4, 9, T('Probability of Combined Events', 'Kebarangkalian Peristiwa Bergabung'), [
    { id: '9.1', en: 'Combined events and event relationships', ms: 'Peristiwa bergabung dan hubungan peristiwa', gen: { e: g91e, m: g91m, a: g91a } },
    { id: '9.2', en: 'Conjecturing and verifying probability rules', ms: 'Membuat konjektur dan mengesahkan petua kebarangkalian', gen: { e: g92e, m: g92m, a: g92a } },
    { id: '9.3', en: 'Probability of combined events', ms: 'Kebarangkalian peristiwa bergabung', gen: { e: g93e, m: g93m, a: g93a } },
    { id: '9.4', en: 'Extension applications', ms: 'Aplikasi lanjutan', scope: 'extension', gen: { e: g94Ee, m: g94Ee, a: g94Ee } },
  ]);

  /* ============================================================== 10 */
  const STAGES = [T('Set financial goals', 'Tetapkan matlamat kewangan'), T('Evaluate your current financial status', 'Nilai status kewangan semasa'), T('Create a financial plan', 'Buat pelan kewangan'), T('Carry out the plan', 'Laksanakan pelan'), T('Review and revise the plan', 'Semak dan ubah suai pelan')];
  const g101e = [
    (r) => {
      const ord = r.shuffle(range(0, 4));
      return { q: T(`The stages of the financial management cycle are listed in the wrong order: ${ord.map((o, i) => `(${'ABCDE'[i]}) ${STAGES[o].en}`).join('; ')}. Write the letters in the correct order.`, `Peringkat kitaran pengurusan kewangan disenaraikan dengan susunan yang salah: ${ord.map((o, i) => `(${'ABCDE'[i]}) ${STAGES[o].ms}`).join('; ')}. Tulis huruf-huruf itu mengikut susunan yang betul.`), a: T(range(0, 4).map((k) => 'ABCDE'[ord.indexOf(k)]).join(' → ')), sp: 's' };
    },
    (r) => {
      const c = r.pick([[T('Save RM500 for a school trip in 3 months', 'Menyimpan RM500 untuk lawatan sekolah dalam 3 bulan'), T('short-term', 'jangka pendek')], [T('Save for a house deposit in 15 years', 'Menyimpan untuk deposit rumah dalam 15 tahun'), T('long-term', 'jangka panjang')], [T('Buy a new phone next month', 'Membeli telefon baharu bulan depan'), T('short-term', 'jangka pendek')]]);
      return { q: T(`Is this a short-term or a long-term financial goal? "${c[0].en}"`, `Adakah ini matlamat kewangan jangka pendek atau jangka panjang? "${c[0].ms}"`), a: c[1], sp: 's' };
    },
  ];
  const g101m = [
    (r) => {
      const goal = r.pick([1200, 1800, 2400, 3000]), mo = r.pick([6, 8, 10, 12]);
      need((goal / mo) % 1 === 0);
      return { q: T(`Aiman wants to save ${rm(goal)} for a laptop in ${mo} months. How much must he save each month? Write the goal in SMART form.`, `Aiman ingin menyimpan ${rm(goal)} untuk sebuah komputer riba dalam ${mo} bulan. Berapakah yang mesti disimpannya setiap bulan? Tulis matlamat itu dalam bentuk SMART.`), a: T(`${rm(goal / mo)} per month. Example: "Save ${rm(goal / mo)} every month for ${mo} months to buy a laptop costing ${rm(goal)}."`, `${rm(goal / mo)} sebulan. Contoh: "Simpan ${rm(goal / mo)} setiap bulan selama ${mo} bulan untuk membeli komputer riba berharga ${rm(goal)}."`), sp: 's' };
    },
  ];
  const g101a = [
    (r) => {
      const inc = r.pick([3000, 3500, 4000]), rent = r.pick([800, 1000]), food = r.pick([600, 800]), trans = r.pick([300, 400]), other = r.pick([200, 300]);
      const goal = r.pick([2000, 3000, 4000]), mo = r.pick([10, 12, 16]);
      const need_ = goal / mo;
      const surplus = inc - (rent + food + trans + other);
      return { q: T(`Siti earns ${rm(inc)} a month. Her expenses are rent ${rm(rent)}, food ${rm(food)}, transport ${rm(trans)} and others ${rm(other)}. She wants to save ${rm(goal)} in ${mo} months. (a) Find her monthly surplus. (b) How much must she save each month? (c) Is her goal achievable? Suggest one action.`, `Siti memperoleh ${rm(inc)} sebulan. Perbelanjaannya ialah sewa ${rm(rent)}, makanan ${rm(food)}, pengangkutan ${rm(trans)} dan lain-lain ${rm(other)}. Dia ingin menyimpan ${rm(goal)} dalam ${mo} bulan. (a) Cari lebihan bulanannya. (b) Berapakah yang mesti disimpannya setiap bulan? (c) Adakah matlamatnya boleh dicapai? Cadangkan satu tindakan.`), a: T(`(a) ${rm(surplus)} (b) ${rm(round(need_, 2), need_ % 1 ? 2 : 0)} (c) ${surplus >= need_ ? 'Yes: the surplus is enough.' : 'No: the surplus is too small; reduce variable expenses or extend the time.'}`, `(a) ${rm(surplus)} (b) ${rm(round(need_, 2), need_ % 1 ? 2 : 0)} (c) ${surplus >= need_ ? 'Ya: lebihan mencukupi.' : 'Tidak: lebihan terlalu kecil; kurangkan perbelanjaan boleh ubah atau lanjutkan tempoh.'}`), sp: 'l' };
    },
  ];
  const g102e = [
    (r) => {
      const inc = r.pick([2500, 3000, 3500]), fixed = r.pick([1000, 1200]), varr = r.pick([700, 900, 1400]);
      const s = inc - fixed - varr;
      return { q: T(`Monthly income is ${rm(inc)}. Fixed expenses are ${rm(fixed)} and variable expenses are ${rm(varr)}. Find the surplus or deficit.`, `Pendapatan bulanan ialah ${rm(inc)}. Perbelanjaan tetap ialah ${rm(fixed)} dan perbelanjaan boleh ubah ialah ${rm(varr)}. Cari lebihan atau defisit.`), a: T(`${s >= 0 ? 'Surplus' : 'Deficit'} of ${rm(Math.abs(s))}`, `${s >= 0 ? 'Lebihan' : 'Defisit'} sebanyak ${rm(Math.abs(s))}`), sp: 's' };
    },
  ];
  const g102m = [
    (r) => {
      const inc = r.pick([3000, 4000, 5000]);
      const pcts = [50, 30, 10, 10];
      return { q: T(`Farid divides his monthly income of ${rm(inc)} into needs 50%, wants 30%, savings 10% and a contingency fund 10%. Find the amount for each.`, `Farid membahagikan pendapatan bulanannya ${rm(inc)} kepada keperluan 50%, kehendak 30%, simpanan 10% dan dana kontingensi 10%. Cari jumlah bagi setiap satu.`), a: T(`Needs ${rm(inc * 0.5)}, wants ${rm(inc * 0.3)}, savings ${rm(inc * 0.1)}, contingency ${rm(inc * 0.1)}`, `Keperluan ${rm(inc * 0.5)}, kehendak ${rm(inc * 0.3)}, simpanan ${rm(inc * 0.1)}, kontingensi ${rm(inc * 0.1)}`), sp: 's' };
    },
  ];
  const g102a = [
    (r) => {
      const inc = [r.pick([2800, 3000]), r.pick([2800, 3200]), r.pick([3000, 3400])];
      const exp = [r.pick([2500, 2900, 3100]), r.pick([2600, 3300]), r.pick([2700, 3500])];
      const net = inc.map((v, i) => v - exp[i]);
      const cum = net.reduce((a, v) => a.concat([(a.length ? a[a.length - 1] : 0) + v]), []);
      return { q: T(`The table shows Ali's income and expenses (RM) over three months. Find the surplus or deficit for each month and the cumulative balance after three months.<br>${SPM.table([['Income', ...inc], ['Expenses', ...exp]], { head: ['', 'Month 1', 'Month 2', 'Month 3'], rowHead: true })}`, `Jadual menunjukkan pendapatan dan perbelanjaan Ali (RM) selama tiga bulan. Cari lebihan atau defisit bagi setiap bulan dan baki terkumpul selepas tiga bulan.<br>${SPM.table([['Pendapatan', ...inc], ['Perbelanjaan', ...exp]], { head: ['', 'Bulan 1', 'Bulan 2', 'Bulan 3'], rowHead: true })}`), a: T(`${net.map((v, i) => `Month ${i + 1}: ${v >= 0 ? '+' : '-'}RM${Math.abs(v)}`).join('; ')}; cumulative ${cum[2] >= 0 ? '+' : '-'}RM${Math.abs(cum[2])}`, `${net.map((v, i) => `Bulan ${i + 1}: ${v >= 0 ? '+' : '-'}RM${Math.abs(v)}`).join('; ')}; terkumpul ${cum[2] >= 0 ? '+' : '-'}RM${Math.abs(cum[2])}`), sp: 'm' };
    },
  ];
  const g103Ee = [
    (r) => {
      const base = r.pick([2000, 2500]), com = r.pick([5, 8, 10]), base2 = base + r.pick([500, 1000]);
      const sales = (base2 - base) / (com / 100);
      return { q: T(`Job $A$ pays a fixed salary of ${rm(base2)} per month. Job $B$ pays ${rm(base)} plus ${com}% commission on sales. At what monthly sales amount do the two jobs pay the same?`, `Kerja $A$ membayar gaji tetap ${rm(base2)} sebulan. Kerja $B$ membayar ${rm(base)} ditambah ${com}% komisen ke atas jualan. Pada jumlah jualan bulanan berapakah kedua-dua kerja membayar sama?`), a: T(`${rm(sales)}`), w: T(`$${base} + ${n(com / 100)}s = ${base2}$`), sp: 'm' };
    },
  ];
  SPM.addChapter(4, 10, T('Consumer Mathematics: Financial Management', 'Matematik Pengguna: Pengurusan Kewangan'), [
    { id: '10.1', en: 'Financial planning and management', ms: 'Perancangan dan pengurusan kewangan', gen: { e: g101e, m: g101m, a: g101a } },
    { id: '10.2', en: 'Budget and cash-flow calculations', ms: 'Pengiraan belanjawan dan aliran tunai', scope: 'support', gen: { e: g102e, m: g102m, a: g102a } },
    { id: '10.3', en: 'Cross-topic financial calculations', ms: 'Pengiraan kewangan merentas topik', scope: 'enrichment', gen: { e: g103Ee, m: g103Ee, a: g103Ee } },
  ]);
})();
