/* Form 1 – Chapters 10 to 13 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, gcd, round, need, retry, par, poly, lin, rm } = SPM;
  const S = SPM.svg;
  const F = SPM.figs;
  const T = (e, m) => ({ en: e, ms: m === undefined ? e : m });
  const NM = (r) => r.pair();
  const cm = (v) => `${n(v)} cm`;
  const fill = 'var(--bg,#fff)';

  /* ================================================== shape figures */
  /** labelled shapes for perimeter / area questions. dims in cm; drawing is scaled to fit. */
  function shape(kind, d, o) {
    o = o || {};
    const W = 250, H = 170;
    let out = '';
    const fitBox = (w, h) => { const k = Math.min(170 / w, 110 / h); return k; };
    const lab = (x, y, t, opt) => S.text(x, y, t, Object.assign({ s: 12 }, opt || {}));
    if (kind === 'rect') {
      const k = fitBox(d.l, d.w), w = d.l * k, h = d.w * k, x0 = (W - w) / 2, y0 = (H - h) / 2;
      out += S.rect(x0, y0, w, h) + lab(x0 + w / 2, y0 - 10, o.l === undefined ? cm(d.l) : o.l) + lab(x0 + w + 6, y0 + h / 2, o.w === undefined ? cm(d.w) : o.w, { a: 'start' });
      if (o.fill) out = S.rect(x0, y0, w, h, { fill: 'currentColor', op: 0.15 }) + out;
    } else if (kind === 'tri' || kind === 'obtri') {
      const k = fitBox(d.b + (kind === 'obtri' ? d.off : 0), d.h);
      const b = d.b * k, h = d.h * k, off = (kind === 'obtri' ? d.off * k : b * 0.35);
      const tot = kind === 'obtri' ? b + off : b;
      const x0 = (W - tot) / 2, y0 = (H + h) / 2;
      const A = [x0, y0], B = [x0 + b, y0];
      const apex = kind === 'obtri' ? [x0 + b + off, y0 - h] : [x0 + off, y0 - h];
      out += S.poly([A, B, apex]);
      const foot = [apex[0], y0];
      if (kind === 'obtri') out += S.line(B[0], y0, foot[0], y0, { dash: true });
      out += S.line(apex[0], apex[1], foot[0], foot[1], { dash: true }) + S.rightAngle(foot, apex, kind === 'obtri' ? [foot[0] - 20, foot[1]] : [foot[0] + 20, foot[1]], 8);
      out += lab((A[0] + B[0]) / 2, y0 + 13, cm(d.b)) + lab(apex[0] + 7, (apex[1] + y0) / 2, cm(d.h), { a: 'start' });
    } else if (kind === 'para') {
      const k = fitBox(d.b + d.off, d.h);
      const b = d.b * k, h = d.h * k, off = d.off * k;
      const x0 = (W - b - off) / 2, y0 = (H + h) / 2;
      const P = [[x0, y0], [x0 + b, y0], [x0 + b + off, y0 - h], [x0 + off, y0 - h]];
      out += S.poly(P) + S.line(P[3][0], P[3][1], P[3][0], y0, { dash: true }) + S.rightAngle([P[3][0], y0], P[3], [P[3][0] + 20, y0], 8);
      out += lab(x0 + b / 2, y0 + 13, cm(d.b)) + lab(P[3][0] + 7, y0 - h / 2, cm(d.h), { a: 'start' });
    } else if (kind === 'kite') {
      const k = fitBox(d.d2, d.d1), v = d.d1 * k, hz = d.d2 * k;
      const cx = W / 2, cy = H / 2, top = d.up * k;
      const T0 = [cx, cy - top], R = [cx + hz / 2, cy], B = [cx, cy - top + v], Lf = [cx - hz / 2, cy];
      out += S.poly([T0, R, B, Lf]) + S.line(T0[0], T0[1], B[0], B[1], { dash: true }) + S.line(Lf[0], Lf[1], R[0], R[1], { dash: true });
      out += S.rightAngle([cx, cy], [cx + 12, cy], [cx, cy - 12], 7);
      out += lab(cx + 8, (T0[1] + B[1]) / 2 + 16, cm(d.d1), { a: 'start' }) + lab(cx, cy + 12, cm(d.d2), { s: 12 });
    } else if (kind === 'trap') {
      const k = fitBox(Math.max(d.a, d.b) + d.off, d.h);
      const a = d.a * k, b = d.b * k, h = d.h * k, off = d.off * k;
      const x0 = (W - Math.max(b, a + off)) / 2, y0 = (H + h) / 2;
      const P = [[x0, y0], [x0 + b, y0], [x0 + off + a, y0 - h], [x0 + off, y0 - h]];
      out += S.poly(P) + S.line(P[3][0], P[3][1], P[3][0], y0, { dash: true }) + S.rightAngle([P[3][0], y0], P[3], [P[3][0] + 20, y0], 8);
      out += lab(x0 + off + a / 2, y0 - h - 10, o.a === undefined ? cm(d.a) : o.a) + lab(x0 + b / 2, y0 + 13, o.b === undefined ? cm(d.b) : o.b) + lab(P[3][0] + 7, y0 - h / 2, cm(d.h), { a: 'start' });
    }
    return S.wrap(W, H, out, 'shape');
  }

  /** L-shape: outer W×H with a cut-out of (W−w)×(H−h) at bottom-right. Sides labelled: top W, right h, bottom w, left H. */
  function lshape(Wd, Hd, w, h, o) {
    o = o || {};
    const k = Math.min(150 / Wd, 110 / Hd);
    const Wp = 250, Hp = 170;
    const W = Wd * k, Hh = Hd * k, ww = w * k, hh = h * k;
    const x0 = (Wp - W) / 2, y0 = (Hp - Hh) / 2;
    const P = [[x0, y0], [x0 + W, y0], [x0 + W, y0 + hh], [x0 + ww, y0 + hh], [x0 + ww, y0 + Hh], [x0, y0 + Hh]];
    let out = S.poly(P, o.fill ? { fill: 'currentColor', op: 0.15 } : {});
    const lab = (x, y, t, opt) => S.text(x, y, t, Object.assign({ s: 12 }, opt || {}));
    if (o.mode !== 'none') {
      out += lab(x0 + W / 2, y0 - 10, cm(Wd)) + lab(x0 + W + 6, y0 + hh / 2, cm(h), { a: 'start' }) + lab(x0 + ww / 2, y0 + Hh + 11, cm(w)) + lab(x0 - 6, y0 + Hh / 2, cm(Hd), { a: 'end' });
    }
    return S.wrap(Wp, Hp, out, 'L-shaped figure');
  }

  /* =============================================================== 10 */
  const g101e = [
    (r) => {
      const l = r.int(4, 15), w = r.int(2, l - 1);
      return { q: T(`Find the perimeter of the rectangle.`, `Cari perimeter segi empat tepat itu.`), fig: shape('rect', { l, w }), a: T(`${2 * (l + w)} cm`), w: T(`$2(${l} + ${w})$`), sp: 's' };
    },
    (r) => {
      const s = r.int(3, 14);
      return { q: T(`A square has sides of length ${s} cm. Find its perimeter.`, `Sebuah segi empat sama mempunyai panjang sisi ${s} cm. Cari perimeternya.`), a: T(`${4 * s} cm`), sp: 'xs' };
    },
    (r) => {
      const l = r.int(6, 15), w = r.int(3, l - 1);
      return { q: T(`The perimeter of a rectangle is ${2 * (l + w)} cm. Its length is ${l} cm. Find its width.`, `Perimeter sebuah segi empat tepat ialah ${2 * (l + w)} cm. Panjangnya ialah ${l} cm. Cari lebarnya.`), a: T(`${w} cm`), w: T(`$${l} + w = ${l + w}$`), sp: 's' };
    },
  ];
  const g101m = [
    (r) => {
      const Wd = r.int(8, 16), Hd = r.int(7, 14), w = r.int(3, Wd - 3), h = r.int(3, Hd - 3);
      return { q: T('Find the perimeter of the L-shaped figure. All angles are right angles.', 'Cari perimeter rajah berbentuk L itu. Semua sudut ialah sudut tegak.'), fig: lshape(Wd, Hd, w, h), a: T(`${2 * (Wd + Hd)} cm`), w: T(`Missing sides: $${Wd} - ${w} = ${Wd - w}$ cm and $${Hd} - ${h} = ${Hd - h}$ cm`, `Sisi yang hilang: $${Wd} - ${w} = ${Wd - w}$ cm dan $${Hd} - ${h} = ${Hd - h}$ cm`), sp: 'm' };
    },
    (r) => {
      const l = r.int(35, 95) / 10, w = r.int(20, 34) / 10;
      return { q: T(`A rectangular photograph measures ${n(l)} cm by ${n(w)} cm. Find the length of frame needed to go round its edge.`, `Sebuah gambar berbentuk segi empat tepat berukuran ${n(l)} cm kali ${n(w)} cm. Cari panjang bingkai yang diperlukan untuk mengelilingi tepinya.`), a: T(`${n(round(2 * (l + w), 1))} cm`), sp: 's' };
    },
    (r) => {
      const l = r.int(20, 60), w = r.int(10, 30);
      const est = Math.round((2 * (l + w)) * (1 + r.pick([-0.08, 0.06, 0.1, -0.12])));
      const act = 2 * (l + w);
      return { q: T(`Aina estimated the perimeter of a rectangular garden ${l} m long and ${w} m wide to be ${est} m. Calculate the actual perimeter and find the difference between her estimate and the actual value.`, `Aina menganggarkan perimeter sebuah taman berbentuk segi empat tepat berukuran ${l} m panjang dan ${w} m lebar ialah ${est} m. Hitung perimeter sebenar dan cari beza antara anggarannya dengan nilai sebenar.`), a: T(`Actual: ${act} m; difference: ${Math.abs(act - est)} m`, `Sebenar: ${act} m; beza: ${Math.abs(act - est)} m`), sp: 's' };
    },
  ];
  const g101a = [
    (r) => {
      const x = r.int(3, 9), a = r.int(2, 4), b = r.int(1, 5), c = r.int(1, 4), d = r.int(1, 5);
      const per = 2 * ((a * x + b) + (c * x + d));
      return { q: T(`The length and width of a rectangle are $(${lin(a, b)})$ cm and $(${lin(c, d)})$ cm. Its perimeter is ${per} cm. Find the value of $x$.`, `Panjang dan lebar sebuah segi empat tepat ialah $(${lin(a, b)})$ cm dan $(${lin(c, d)})$ cm. Perimeternya ialah ${per} cm. Cari nilai $x$.`), a: T(`$x = ${x}$`), w: T(`$2[(${lin(a, b)}) + (${lin(c, d)})] = ${per}$`), sp: 'm' };
    },
    (r) => {
      const Wd = r.int(9, 18), Hd = r.int(8, 15), w = r.int(3, Wd - 4), h = r.int(3, Hd - 4);
      return { q: T('Find the perimeter of the figure. (Some lengths are not given.) All angles are right angles.', 'Cari perimeter rajah itu. (Sesetengah panjang tidak diberikan.) Semua sudut ialah sudut tegak.'), fig: lshape(Wd, Hd, w, h), a: T(`${2 * (Wd + Hd)} cm`), sp: 'm' };
    },
    (r) => {
      const straight = r.int(8, 20), curve = r.int(10, 30) + r.pick([0, 0.5]);
      return { q: T(`A running track has two straight sides each ${straight} m long and two curved ends each ${n(curve)} m long. Find the distance around the track for 3 laps in kilometres.`, `Sebuah trek larian mempunyai dua sisi lurus yang masing-masing panjangnya ${straight} m dan dua hujung melengkung yang masing-masing panjangnya ${n(curve)} m. Cari jarak mengelilingi trek itu bagi 3 pusingan dalam kilometer.`), a: T(`${n(round(3 * (2 * straight + 2 * curve) / 1000, 4))} km`), w: T(`One lap $= ${n(2 * straight + 2 * curve)}$ m`, `Satu pusingan $= ${n(2 * straight + 2 * curve)}$ m`), sp: 'm' };
    },
    (r) => {
      const l = r.pick([12, 16, 20, 24]), w = r.pick([8, 10, 12, 14]);
      const post = r.pick([2, 4]);
      const per = 2 * (l + w);
      const price = r.pick([12, 15, 18]);
      return { q: T(`A rectangular plot measures ${l} m by ${w} m. A fence is built round it with a post every ${post} m. Find (a) the length of fencing, (b) the number of posts, (c) the cost of the fencing at RM${price} per metre.`, `Sebidang tanah berbentuk segi empat tepat berukuran ${l} m kali ${w} m. Sebuah pagar dibina mengelilinginya dengan satu tiang setiap ${post} m. Cari (a) panjang pagar, (b) bilangan tiang, (c) kos pagar pada harga RM${price} semeter.`), a: T(`(a) ${per} m (b) ${per / post} posts (c) RM${per * price}`, `(a) ${per} m (b) ${per / post} batang (c) RM${per * price}`), sp: 'm' };
    },
  ];

  const g102e = [
    (r) => {
      const b = r.int(4, 14), h = r.int(3, 12);
      return { q: T('Find the area of the triangle.', 'Cari luas segi tiga itu.'), fig: shape('tri', { b, h }), a: T(`$${n(b * h / 2)}\\ \\text{cm}^2$`), w: T(`$\\frac12 \\times ${b} \\times ${h}$`), sp: 's' };
    },
    (r) => {
      const b = r.int(5, 14), h = r.int(3, 10), off = r.int(2, 5);
      return { q: T('Find the area of the parallelogram.', 'Cari luas segi empat selari itu.'), fig: shape('para', { b, h, off }), a: T(`$${b * h}\\ \\text{cm}^2$`), w: T(`$${b} \\times ${h}$`), sp: 's' };
    },
    (r) => {
      const d1 = r.int(4, 14), d2 = r.int(4, 14);
      need(d1 !== d2);
      return { q: T('The diagonals of the kite are shown. Find its area.', 'Pepenjuru layang-layang ditunjukkan. Cari luasnya.'), fig: shape('kite', { d1, d2, up: d1 * 0.4 }), a: T(`$${n(d1 * d2 / 2)}\\ \\text{cm}^2$`), w: T(`$\\frac12 \\times ${d1} \\times ${d2}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(4, 9), b = a + r.int(2, 6), h = r.int(3, 9);
      return { q: T('Find the area of the trapezium.', 'Cari luas trapezium itu.'), fig: shape('trap', { a, b, h, off: r.int(1, 3) }), a: T(`$${n((a + b) * h / 2)}\\ \\text{cm}^2$`), w: T(`$\\frac12(${a} + ${b}) \\times ${h}$`), sp: 's' };
    },
  ];
  const g102m = [
    (r) => {
      const b = r.int(4, 12), h = r.int(4, 10), off = r.int(2, 5);
      return { q: T('Find the area of the obtuse-angled triangle. Take care to use the perpendicular height.', 'Cari luas segi tiga bersudut cakah itu. Pastikan anda menggunakan tinggi serenjang.'), fig: shape('obtri', { b, h, off }), a: T(`$${n(b * h / 2)}\\ \\text{cm}^2$`), sp: 's' };
    },
    (r) => {
      const d1 = r.int(5, 16), d2 = r.int(5, 16);
      need(d1 % 2 === 0 || d2 % 2 === 0);
      return { q: T(`A kite has diagonals of ${d1} cm and ${d2} cm. Find its area.`, `Sebuah layang-layang mempunyai pepenjuru ${d1} cm dan ${d2} cm. Cari luasnya.`), a: T(`$${n(d1 * d2 / 2)}\\ \\text{cm}^2$`), sp: 's' };
    },
    (r) => {
      const b = r.int(6, 16), h = r.int(4, 12);
      const area = (b * h) / 2;
      need(Number.isInteger(area));
      return { q: T(`The area of a triangle is $${area}\\ \\text{cm}^2$ and its base is ${b} cm. Find its perpendicular height.`, `Luas sebuah segi tiga ialah $${area}\\ \\text{cm}^2$ dan tapaknya ${b} cm. Cari tinggi serenjangnya.`), a: T(`${h} cm`), w: T(`$\\frac12 \\times ${b} \\times h = ${area}$`), sp: 's' };
    },
    (r) => {
    const d1 = r.int(6, 16), d2 = r.int(5, 12);
    const area = (d1 * d2) / 2;
    need(Number.isInteger(area) && d1 !== d2);
    return { q: T(`A kite has an area of $${area}\\ \\text{cm}^2$ and one diagonal of ${d1} cm. Find the other diagonal.`, `Sebuah layang-layang mempunyai luas $${area}\\ \\text{cm}^2$ dan satu pepenjuru ${d1} cm. Cari pepenjuru yang satu lagi.`), a: T(`${d2} cm`), w: T(`$\\frac12 \\times ${d1} \\times d = ${area}$`), sp: 's' };
    },
  ];
  const g102a = [
    (r) => {
      const a = r.int(4, 9), b = a + r.int(2, 7), h = r.int(3, 9);
      const area = ((a + b) * h) / 2;
      need(Number.isInteger(area));
      return { q: T(`The area of a trapezium is $${area}\\ \\text{cm}^2$. The shorter parallel side is ${a} cm and the height is ${h} cm. Find the length of the longer parallel side.`, `Luas sebuah trapezium ialah $${area}\\ \\text{cm}^2$. Sisi selari yang lebih pendek ialah ${a} cm dan tingginya ${h} cm. Cari panjang sisi selari yang lebih panjang.`), a: T(`${b} cm`), w: T(`$\\frac12(${a} + x)(${h}) = ${area}$`), sp: 'm' };
    },
    (r) => {
      const price = r.pick([12, 15, 20, 25]);
      const bm = r.pick([2, 3, 4]), hm = r.pick([1.5, 2, 2.5]);
      const area = bm * hm;
      return { q: T(`A parallelogram-shaped garden has a base of ${bm} m and a perpendicular height of ${n(hm)} m. Turf costs RM${price} per m². Find the cost of turfing the garden.`, `Sebuah taman berbentuk segi empat selari mempunyai tapak ${bm} m dan tinggi serenjang ${n(hm)} m. Rumput hamparan berharga RM${price} per m². Cari kos untuk menghampar rumput di taman itu.`), a: T(`RM${n(area * price)}`), w: T(`Area $= ${bm} \\times ${n(hm)} = ${n(area)}\\ \\text{m}^2$`, `Luas $= ${bm} \\times ${n(hm)} = ${n(area)}\\ \\text{m}^2$`), sp: 'm' };
    },
    (r) => {
      const bcm = r.int(2, 6) * 50, hcm = r.int(2, 5) * 40;
      const area = (bcm * hcm) / 2 / 10000;
      return { q: T(`A triangular sail has a base of ${bcm} cm and a perpendicular height of ${hcm} cm. Find its area in m².`, `Sebuah layar berbentuk segi tiga mempunyai tapak ${bcm} cm dan tinggi serenjang ${hcm} cm. Cari luasnya dalam m².`), a: T(`$${n(area)}\\ \\text{m}^2$`), w: T(`$\\frac12 \\times ${bcm} \\times ${hcm} = ${(bcm * hcm) / 2}\\ \\text{cm}^2$; $1\\ \\text{m}^2 = 10\\,000\\ \\text{cm}^2$`), sp: 'm' };
    },
  ];

  const g103e = [
    (r) => {
      const [l1, w1] = [r.int(6, 12), r.int(2, 5)], [l2, w2] = [r.int(4, 8), r.int(3, 6)];
      need(l1 !== l2 || w1 !== w2);
      return { q: T(`Rectangle $P$ measures ${l1} cm by ${w1} cm and rectangle $Q$ measures ${l2} cm by ${w2} cm. Find the perimeter and area of each. Which has the larger perimeter? Which has the larger area?`, `Segi empat tepat $P$ berukuran ${l1} cm kali ${w1} cm dan segi empat tepat $Q$ berukuran ${l2} cm kali ${w2} cm. Cari perimeter dan luas bagi setiap satu. Yang manakah mempunyai perimeter lebih besar? Yang manakah mempunyai luas lebih besar?`), a: T(`P: perimeter ${2 * (l1 + w1)} cm, area ${l1 * w1} cm²; Q: perimeter ${2 * (l2 + w2)} cm, area ${l2 * w2} cm². Larger perimeter: ${2 * (l1 + w1) >= 2 * (l2 + w2) ? (2 * (l1 + w1) === 2 * (l2 + w2) ? 'equal' : 'P') : 'Q'}; larger area: ${l1 * w1 === l2 * w2 ? 'equal' : l1 * w1 > l2 * w2 ? 'P' : 'Q'}.`, `P: perimeter ${2 * (l1 + w1)} cm, luas ${l1 * w1} cm²; Q: perimeter ${2 * (l2 + w2)} cm, luas ${l2 * w2} cm². Perimeter lebih besar: ${2 * (l1 + w1) === 2 * (l2 + w2) ? 'sama' : 2 * (l1 + w1) > 2 * (l2 + w2) ? 'P' : 'Q'}; luas lebih besar: ${l1 * w1 === l2 * w2 ? 'sama' : l1 * w1 > l2 * w2 ? 'P' : 'Q'}.`), sp: 'm' };
    },
  ];
  const g103m = [
    (r) => {
      const P = r.pick([16, 20, 24]);
      const half = P / 2;
      const rows = [];
      for (let l = half - 1; l >= Math.ceil(half / 2); l--) rows.push([l, half - l, l * (half - l)]);
      const best = rows.reduce((b, x) => (x[2] > b[2] ? x : b), rows[0]);
      const tab = SPM.table([['Length (cm)', ...rows.map((x) => x[0])], ['Width (cm)', ...rows.map((x) => x[1])], ['Area (cm²)', ...rows.map(() => '')]], { rowHead: true });
      const tabMs = SPM.table([['Panjang (cm)', ...rows.map((x) => x[0])], ['Lebar (cm)', ...rows.map((x) => x[1])], ['Luas (cm²)', ...rows.map(() => '')]], { rowHead: true });
      return { q: T(`Rectangles with whole-number sides have a perimeter of ${P} cm. Complete the table of areas, and state which rectangle in the table has the greatest area.<br>${tab}`, `Segi empat tepat yang sisinya nombor bulat mempunyai perimeter ${P} cm. Lengkapkan jadual luas dan nyatakan segi empat tepat dalam jadual yang mempunyai luas terbesar.<br>${tabMs}`), a: T(`Areas: ${rows.map((x) => x[2]).join(', ')} cm²; greatest: ${best[0]} cm by ${best[1]} cm`, `Luas: ${rows.map((x) => x[2]).join(', ')} cm²; terbesar: ${best[0]} cm kali ${best[1]} cm`), sp: 'm' };
    },
    (r) => {
      const A = r.pick([12, 16, 18, 24, 36]);
      const pairs = [];
      for (let l = 1; l <= A; l++) if (A % l === 0 && l <= A / l) pairs.push([l, A / l]);
      need(pairs.length >= 3);
      const per = pairs.map((p) => 2 * (p[0] + p[1]));
      return { q: T(`Rectangles with whole-number sides have an area of ${A} cm². List all such rectangles and find the perimeter of each. Which has the smallest perimeter?`, `Segi empat tepat yang sisinya nombor bulat mempunyai luas ${A} cm². Senaraikan semua segi empat tepat itu dan cari perimeter bagi setiap satu. Yang manakah mempunyai perimeter terkecil?`), a: T(pairs.map((p, i) => `${p[0]}×${p[1]}: ${per[i]} cm`).join('; ') + `; smallest: ${pairs[per.indexOf(Math.min(...per))].join(' × ')}`, pairs.map((p, i) => `${p[0]}×${p[1]}: ${per[i]} cm`).join('; ') + `; terkecil: ${pairs[per.indexOf(Math.min(...per))].join(' × ')}`), sp: 'm' };
    },
  ];
  const g103a = [
    (r) => {
      const P = r.pick([12, 16, 20]);
      const l1 = P / 2 - 1, l2 = Math.floor(P / 4);
      const w2 = P / 2 - l2;
      return { q: T(`Ali says: "Two rectangles with the same perimeter always have the same area." Use two rectangles with perimeter ${P} cm to show that his statement is false.`, `Ali berkata: "Dua segi empat tepat yang mempunyai perimeter yang sama sentiasa mempunyai luas yang sama." Gunakan dua segi empat tepat berperimeter ${P} cm untuk menunjukkan bahawa pernyataannya palsu.`), a: T(`E.g. ${l1} cm × 1 cm has area ${l1} cm²; ${l2} cm × ${w2} cm has area ${l2 * w2} cm². Same perimeter, different areas.`, `Contohnya ${l1} cm × 1 cm mempunyai luas ${l1} cm²; ${l2} cm × ${w2} cm mempunyai luas ${l2 * w2} cm². Perimeter sama, luas berlainan.`), sp: 'm' };
    },
    (r) => {
      const P = r.pick([20, 24, 28]);
      const half = P / 2;
      const areas = [];
      for (let l = 1; l < half; l++) areas.push([l, half - l, l * (half - l)]);
      const best = areas.reduce((b, x) => (x[2] > b[2] ? x : b), areas[0]);
      return { q: T(`Among all rectangles with whole-number sides and perimeter ${P} cm, find the one with the greatest area. Does this list of examples prove that a square always has the greatest area for a given perimeter? Explain.`, `Antara semua segi empat tepat yang sisinya nombor bulat dan berperimeter ${P} cm, cari yang mempunyai luas terbesar. Adakah senarai contoh ini membuktikan bahawa segi empat sama sentiasa mempunyai luas terbesar bagi perimeter tertentu? Terangkan.`), a: T(`${best[0]} cm by ${best[1]} cm (area ${best[2]} cm²). No: checking whole-number examples only supports the pattern for that family; it is not a general proof.`, `${best[0]} cm kali ${best[1]} cm (luas ${best[2]} cm²). Tidak: memeriksa contoh nombor bulat hanya menyokong corak bagi keluarga itu; ia bukan pembuktian umum.`), sp: 'm' };
    },
  ];

  /** border/frame: outer rectangle with inner rectangle shaded/unshaded */
  function border(Wd, Hd, m) {
    const k = Math.min(170 / Wd, 110 / Hd);
    const W = Wd * k, H = Hd * k, mm = m * k;
    const x0 = (250 - W) / 2, y0 = (170 - H) / 2;
    let out = S.rect(x0, y0, W, H, { fill: 'currentColor', op: 0.18 }) + S.rect(x0 + mm, y0 + mm, W - 2 * mm, H - 2 * mm, { fill });
    out += S.text(x0 + W / 2, y0 - 10, cm(Wd), { s: 12 }) + S.text(x0 + W + 6, y0 + H / 2, cm(Hd), { s: 12, a: 'start' }) + S.text(x0 + mm / 2 + 1, y0 + H / 2 + 12, cm(m), { s: 10 });
    return S.wrap(250, 170, out, 'shaded border');
  }
  /** rectangle with triangle cut out (shaded = rectangle minus triangle) */
  function rectMinusTri(l, w, b, h) {
    const k = Math.min(170 / l, 110 / w);
    const W = l * k, H = w * k;
    const x0 = (250 - W) / 2, y0 = (170 - H) / 2;
    const tb = b * k, th = h * k;
    let out = S.rect(x0, y0, W, H, { fill: 'currentColor', op: 0.18 });
    out += S.poly([[x0, y0 + H], [x0 + tb, y0 + H], [x0, y0 + H - th]], { fill });
    out += S.text(x0 + W / 2, y0 - 10, cm(l), { s: 12 }) + S.text(x0 + W + 6, y0 + H / 2, cm(w), { s: 12, a: 'start' });
    out += S.text(x0 + tb / 2, y0 + H + 11, cm(b), { s: 11 }) + S.text(x0 - 6, y0 + H - th / 2, cm(h), { s: 11, a: 'end' });
    return S.wrap(250, 170, out, 'rectangle minus triangle');
  }
  const g104e = [
    (r) => {
      const Wd = r.int(8, 16), Hd = r.int(7, 13), w = r.int(3, Wd - 3), h = r.int(3, Hd - 3);
      return { q: T('Find the area of the L-shaped figure. All angles are right angles.', 'Cari luas rajah berbentuk L itu. Semua sudut ialah sudut tegak.'), fig: lshape(Wd, Hd, w, h), a: T(`$${Wd * Hd - (Wd - w) * (Hd - h)}\\ \\text{cm}^2$`), w: T(`$${Wd} \\times ${Hd} - ${Wd - w} \\times ${Hd - h}$`), sp: 'm' };
    },
  ];
  const g104m = [
    (r) => {
      const l = r.int(8, 16), w = r.int(6, 12), b = r.int(3, l - 2), h = r.int(3, w - 1);
      const area = l * w - (b * h) / 2;
      return { q: T('Find the area of the shaded region.', 'Cari luas kawasan berlorek.'), fig: rectMinusTri(l, w, b, h), a: T(`$${n(area)}\\ \\text{cm}^2$`), w: T(`$${l} \\times ${w} - \\frac12 \\times ${b} \\times ${h}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(4, 8), b = a + r.int(3, 6), h = r.int(4, 8), l = r.int(5, 9);
      const area = ((a + b) * h) / 2 + l * h;
      return { q: T(`A figure is made up of a rectangle ${l} cm by ${h} cm joined to a trapezium with parallel sides ${a} cm and ${b} cm and height ${h} cm, the ${h} cm sides coinciding. Find the total area.`, `Sebuah rajah terdiri daripada segi empat tepat ${l} cm kali ${h} cm yang dicantumkan dengan trapezium yang sisi selarinya ${a} cm dan ${b} cm serta tinggi ${h} cm, dengan sisi ${h} cm bertindih. Cari jumlah luas.`), a: T(`$${n(area)}\\ \\text{cm}^2$`), w: T(`$${l} \\times ${h} + \\frac12(${a} + ${b}) \\times ${h}$`), sp: 'm' };
    },
    (r) => {
      const d1 = r.int(6, 14), d2 = r.int(6, 12), s = r.int(3, 5);
      return { q: T(`A kite with diagonals ${d1} cm and ${d2} cm has a square hole of side ${s} cm cut out of it. Find the area of the remaining shape.`, `Sebuah layang-layang dengan pepenjuru ${d1} cm dan ${d2} cm mempunyai satu lubang segi empat sama bersisi ${s} cm yang dipotong daripadanya. Cari luas bentuk yang tinggal.`), a: T(`$${n(d1 * d2 / 2 - s * s)}\\ \\text{cm}^2$`), w: T(`$\\frac12 \\times ${d1} \\times ${d2} - ${s}^2$`), sp: 'm' };
    },
  ];
  const g104a = [
    (r) => {
      const Wd = r.int(10, 18), Hd = r.int(8, 14), m = r.int(1, 3);
      const path = Wd * Hd - (Wd - 2 * m) * (Hd - 2 * m);
      const price = r.pick([8, 10, 12, 15]);
      return { q: T(`The diagram shows a rectangular lawn with a concrete path (shaded) of uniform width ${m} m all around it. The outer measurements are ${Wd} m by ${Hd} m. Find (a) the area of the path, (b) the cost of paving the path at RM${price} per m².`, `Rajah menunjukkan sebuah padang rumput berbentuk segi empat tepat yang dikelilingi laluan konkrit (berlorek) dengan lebar seragam ${m} m. Ukuran luar ialah ${Wd} m kali ${Hd} m. Cari (a) luas laluan itu, (b) kos memaving laluan itu pada harga RM${price} per m².`), fig: border(Wd, Hd, m), a: T(`(a) $${path}\\ \\text{m}^2$ (b) RM${path * price}`, `(a) $${path}\\ \\text{m}^2$ (b) RM${path * price}`), w: T(`$${Wd}\\times${Hd} - ${Wd - 2 * m}\\times${Hd - 2 * m}$`), sp: 'l' };
    },
    (r) => {
      const l = r.pick([6, 8, 10]), w = r.pick([4, 5, 6]);
      const cover = r.pick([20, 25, 30, 40]);
      const wall = 2 * (l + w) * 3;
      const tins = Math.ceil((wall * 2) / cover);
      const price = r.pick([60, 75, 90]);
      return { q: T(`A room ${l} m by ${w} m and 3 m high has four walls to be painted (ignore doors and windows). One tin of paint covers ${cover} m² for one coat and two coats are needed. Find the wall area, the number of tins needed and the total cost at RM${price} per tin.`, `Sebuah bilik ${l} m kali ${w} m dan tinggi 3 m mempunyai empat dinding yang hendak dicat (abaikan pintu dan tingkap). Satu tin cat meliputi ${cover} m² untuk satu lapisan dan dua lapisan diperlukan. Cari luas dinding, bilangan tin yang diperlukan dan jumlah kos pada harga RM${price} satu tin.`), a: T(`Wall area ${wall} m²; ${tins} tins; RM${tins * price}`, `Luas dinding ${wall} m²; ${tins} tin; RM${tins * price}`), w: T(`$${wall} \\times 2 \\div ${cover} = ${n(round((wall * 2) / cover, 2))}$, rounded up`, `$${wall} \\times 2 \\div ${cover} = ${n(round((wall * 2) / cover, 2))}$, dibundarkan ke atas`), sp: 'l' };
    },
    (r) => {
      const Wd = r.int(10, 16), Hd = r.int(8, 12), w = r.int(4, Wd - 4), h = r.int(4, Hd - 3);
      const area = Wd * Hd - (Wd - w) * (Hd - h);
      return { q: T('The L-shaped figure has all right angles. Some lengths are not given. Use the given lengths to find the area of the figure.', 'Rajah berbentuk L mempunyai semua sudut tegak. Sesetengah panjang tidak diberikan. Gunakan panjang yang diberi untuk mencari luas rajah itu.'), fig: lshape(Wd, Hd, w, h), a: T(`$${area}\\ \\text{cm}^2$`), sp: 'l' };
    },
  ];

  SPM.addChapter(1, 10, T('Perimeter and Area', 'Perimeter dan Luas'), [
    { id: '10.1', en: 'Perimeter', ms: 'Perimeter', gen: { e: g101e, m: g101m, a: g101a } },
    { id: '10.2', en: 'Area of triangles, parallelograms, kites and trapeziums', ms: 'Luas segi tiga, segi empat selari, layang-layang dan trapezium', gen: { e: g102e, m: g102m, a: g102a } },
    { id: '10.3', en: 'Relationship between perimeter and area', ms: 'Hubungan antara perimeter dengan luas', gen: { e: g103e, m: g103m, a: g103a } },
    { id: '10.4', en: 'Areas of composite figures and problems', ms: 'Luas bagi rajah gubahan dan penyelesaian masalah', gen: { e: g104e, m: g104m, a: g104a } },
  ]);
})();
