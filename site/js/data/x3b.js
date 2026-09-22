/* Variety pack x3b: extra generators for F3 Ch4 (Scale Drawings), Ch5 (Trigonometric Ratios),
 * Ch9 (Straight Lines). See tools/PACKS.md. */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, Fr, poly, lin, rm, fx } = SPM;
  const T = SPM.L, S = SPM.svg, F = SPM.figs;
  const frT = Fr.tex;
  const rad = (d) => (d * Math.PI) / 180;
  const mF = (a, b) => Fr.make(a, b);
  const pt = (P) => `(${n(P[0])}, ${n(P[1])})`;

  /* =============================================================== 4 : Scale Drawings */
  /** rectangle of gw x gh grid squares drawn inside a slightly larger grid (so it reads as "on a grid") */
  function gridRectFig(gw, gh, o) {
    o = o || {};
    const cell = o.cell || 22;
    const cols = gw + 2, rows = gh + 2;
    const W = cols * cell + 14, H = rows * cell + 14;
    let out = '';
    for (let i = 0; i <= cols; i++) out += S.line(7 + i * cell, 7, 7 + i * cell, 7 + rows * cell, { w: 0.5, op: 0.35 });
    for (let j = 0; j <= rows; j++) out += S.line(7, 7 + j * cell, 7 + cols * cell, 7 + j * cell, { w: 0.5, op: 0.35 });
    out += S.rect(7 + cell, 7 + cell, gw * cell, gh * cell, { w: 1.8 });
    if (o.label) out += S.text(7 + cell + (gw * cell) / 2, 7 + cell + gh * cell + 13, o.label, { s: 11 });
    return S.wrap(W, H, out, 'shape on a square grid');
  }
  /** L-shaped plan: outer gw x gh grid, with a cw x ch corner notch removed (top-right) */
  function gridLFig(gw, gh, cw, ch, o) {
    o = o || {};
    const cell = o.cell || 22;
    const cols = gw + 2, rows = gh + 2;
    const W = cols * cell + 14, H = rows * cell + 14;
    const ox = 7 + cell, oy = 7 + cell;
    let out = '';
    for (let i = 0; i <= cols; i++) out += S.line(7 + i * cell, 7, 7 + i * cell, 7 + rows * cell, { w: 0.5, op: 0.35 });
    for (let j = 0; j <= rows; j++) out += S.line(7, 7 + j * cell, 7 + cols * cell, 7 + j * cell, { w: 0.5, op: 0.35 });
    const P = [
      [ox, oy + gh * cell], [ox, oy], [ox + gw * cell, oy], [ox + gw * cell, oy + ch * cell],
      [ox + (gw - cw) * cell, oy + ch * cell], [ox + (gw - cw) * cell, oy + gh * cell],
    ];
    out += S.poly(P, { w: 1.8 });
    return S.wrap(W, H, out, 'L-shaped plan on a square grid');
  }
  const SCALES_MODEL = [10, 20, 25, 50, 100];
  const SCALES_PLAN = [50, 100, 200, 500];
  const SCALES_MAP = [2, 5, 10, 20, 25];
  const modelCtx = [T('a toy car', 'sebuah kereta mainan'), T('a model aeroplane', 'sebuah model kapal terbang'), T('a scale model of a building', 'sebuah model berskala sebuah bangunan'), T('a photograph', 'sebuah gambar foto'), T('a model ship', 'sebuah model kapal'), T('a model train', 'sebuah model keretapi'), T('an action figure', 'sebuah patung aksi'), T('a dollhouse', 'sebuah rumah patung'), T('a poster', 'sebuah poster'), T('a robot model', 'sebuah model robot'), T('a model bridge', 'sebuah model jambatan'), T('a model motorcycle', 'sebuah model motosikal'), T('a diecast lorry', 'sebuah lori diecast'), T('a die-cast bus', 'sebuah bas diecast')];
  const planCtx = [T('a house', 'sebuah rumah'), T('a classroom', 'sebuah bilik darjah'), T('a school hall', 'sebuah dewan sekolah'), T('a garden', 'sebuah taman'), T('a factory floor', 'lantai sebuah kilang'), T('a library', 'sebuah perpustakaan'), T('a swimming pool', 'sebuah kolam renang'), T('an office', 'sebuah pejabat'), T('a car park', 'sebuah tempat letak kereta'), T('a shopping mall', 'sebuah pusat membeli-belah'), T('a badminton hall', 'sebuah dewan badminton'), T('a canteen', 'sebuah kantin'), T('a museum', 'sebuah muzium'), T('a farmhouse', 'sebuah rumah ladang'), T('a clinic', 'sebuah klinik')];
  const mapCtx = [T('two towns', 'dua buah bandar'), T('two schools', 'dua buah sekolah'), T('a town and a jetty', 'sebuah bandar dan sebuah jeti'), T('a hospital and a school', 'sebuah hospital dan sebuah sekolah'), T('a village and a town', 'sebuah kampung dan sebuah bandar'), T('two railway stations', 'dua buah stesen keretapi'), T('an airport and a hotel', 'sebuah lapangan terbang dan sebuah hotel'), T('two lakes', 'dua buah tasik'), T('a police station and a fire station', 'sebuah balai polis dan sebuah balai bomba'), T('two national parks', 'dua buah taman negara'), T('a market and a mosque', 'sebuah pasar dan sebuah masjid'), T('two islands', 'dua buah pulau')];

  const g41e = [
    (r) => {
      const k = r.pick(SCALES_MODEL), d = r.int(2, 12), c = r.pick(modelCtx);
      return { q: T(`${SPM.cap(c.en)} is drawn to a scale of 1 : ${k}. A part measures ${d} cm on the drawing. Find its actual length in cm.`, `${SPM.cap(c.ms)} dilukis dengan skala 1 : ${k}. Satu bahagiannya berukuran ${d} cm pada lukisan. Cari panjang sebenarnya dalam cm.`), a: T(`${d * k} cm`), w: T(`$${d} \\times ${k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick(SCALES_PLAN), m = r.int(2, 12), c = r.pick(planCtx);
      const dcm = round((m * 100) / k, 2);
      need(Number.isInteger(dcm * 4));
      return { q: T(`A plan of ${c.en} is drawn to a scale of 1 : ${k}. If the actual length of a wall is ${m} m, find its length on the plan in cm.`, `Sebuah pelan ${c.ms} dilukis dengan skala 1 : ${k}. Jika panjang sebenar sebuah dinding ialah ${m} m, cari panjangnya pada pelan dalam cm.`), a: T(`${n(dcm)} cm`), w: T(`$${m} \\text{ m} = ${m * 100}$ cm; $${m * 100} \\div ${k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick(SCALES_MAP), d = r.int(2, 12), c = r.pick(mapCtx);
      return { q: T(`On a map with scale 1 : ${k * 100000}, the distance between ${c.en} is ${d} cm. Find the actual distance in km.`, `Pada sebuah peta berskala 1 : ${k * 100000}, jarak antara ${c.ms} ialah ${d} cm. Cari jarak sebenar dalam km.`), a: T(`${n(d * k)} km`), w: T(`1 cm mewakili ${k} km`), sp: 's' };
    },
    (r) => {
      const k = r.pick([100, 200, 500, 1000]), d = r.int(2, 9);
      return { q: T(`State the actual length, in metres, represented by ${d} cm on a drawing of scale 1 : ${k}.`, `Nyatakan panjang sebenar, dalam meter, yang diwakili oleh ${d} cm pada sebuah lukisan berskala 1 : ${k}.`), a: T(`${n((d * k) / 100)} m`), sp: 's' };
    },
    (r) => {
      const k = r.pick(SCALES_MODEL.concat(SCALES_PLAN)), which = r.chance();
      return { q: T(`In the scale 1 : ${k}, what does the number ${which ? '1' : k} represent — the drawing length or the actual length?`, `Dalam skala 1 : ${k}, apakah yang diwakili oleh nombor ${which ? '1' : k} — panjang lukisan atau panjang sebenar?`), a: which ? T('The drawing length (1 unit on the drawing).', 'Panjang lukisan (1 unit pada lukisan).') : T('The actual length (in the same unit).', 'Panjang sebenar (dalam unit yang sama).'), sp: 'xs' };
    },
    (r) => {
      const k = r.pick(SCALES_PLAN), c = r.pick(planCtx);
      return { q: T(`A scale of 1 : ${k} means 1 cm on the drawing represents how many centimetres in actual length? State the answer also in metres.`, `Skala 1 : ${k} bermaksud 1 cm pada lukisan mewakili berapa sentimeter dalam panjang sebenar? Nyatakan jawapan juga dalam meter.`), a: T(`${k} cm $= ${n(k / 100)}$ m`), sp: 'xs' };
    },
    (r) => {
      const km = r.pick([1, 2, 5, 10]), d = r.int(2, 9), c = r.pick(mapCtx);
      const actual = d * km;
      return { q: T(`On a map, 1 cm represents ${km} km. The distance between ${c.en} is ${actual} km. Find the distance between them on the map, in cm.`, `Pada sebuah peta, 1 cm mewakili ${km} km. Jarak antara ${c.ms} ialah ${actual} km. Cari jarak antara keduanya pada peta, dalam cm.`), a: T(`${d} cm`), sp: 's' };
    },
    (r) => {
      const gw = r.int(2, 5), gh = r.int(2, 4), u = r.pick([1, 2, 5, 10]);
      const fig = gridRectFig(gw, gh);
      return { q: T(`The diagram shows a plan of a rectangular garden drawn on a square grid, where each grid square represents ${u} m by ${u} m. Find the actual length and width of the garden.`, `Rajah menunjukkan pelan sebuah taman segi empat tepat yang dilukis pada grid segi empat sama, dengan setiap petak grid mewakili ${u} m kali ${u} m.  Cari panjang dan lebar sebenar taman itu.`), fig, a: T(`Length $= ${gw * u}$ m, width $= ${gh * u}$ m`, `Panjang $= ${gw * u}$ m, lebar $= ${gh * u}$ m`), sp: 's' };
    },
    (r) => {
      const k1 = r.pick([50, 100]), k2 = r.pick([200, 500]);
      return { q: T(`Which of the two scales, 1 : ${k1} or 1 : ${k2}, will produce a larger (less reduced) drawing of the same object? Give a reason.`, `Antara dua skala 1 : ${k1} atau 1 : ${k2}, yang manakah akan menghasilkan lukisan objek yang sama dengan lebih besar (kurang dikecilkan)? Berikan sebab.`), a: T(`1 : ${k1}, because a smaller ratio $n$ means the drawing is reduced by a smaller factor.`, `1 : ${k1}, kerana nisbah $n$ yang lebih kecil bermaksud lukisan itu dikecilkan dengan faktor yang lebih kecil.`), sp: 's' };
    },
    (r) => {
      const k = r.pick(SCALES_MODEL), c = r.pick(modelCtx);
      const actCm = r.int(2, 12) * k;
      return { q: T(`${SPM.cap(c.en)} has an actual part of length ${actCm} cm. It is drawn to a scale of 1 : ${k}. Find the length of this part on the drawing, in cm.`, `${SPM.cap(c.ms)} mempunyai satu bahagian yang panjang sebenarnya ${actCm} cm. Ia dilukis dengan skala 1 : ${k}. Cari panjang bahagian ini pada lukisan, dalam cm.`), a: T(`${actCm / k} cm`), sp: 's' };
    },
    (r) => {
      const k = r.pick([5, 10, 20, 25]), d = r.int(3, 15);
      return { q: T(`An engineering drawing of a small part uses a scale of 1 : ${k}. The part measures ${d} mm on the drawing. Find its actual length, in mm.`, `Sebuah lukisan kejuruteraan sesuatu bahagian kecil menggunakan skala 1 : ${k}. Bahagian itu berukuran ${d} mm pada lukisan. Cari panjang sebenarnya, dalam mm.`), a: T(`${d * k} mm`), sp: 's' };
    },
    (r) => {
      const k = r.pick(SCALES_PLAN.concat(SCALES_MODEL));
      return { q: T(`Write the scale "1 is to ${k}" in the ratio form used on scale drawings.`, `Tulis skala "1 berbanding ${k}" dalam bentuk nisbah yang digunakan pada lukisan berskala.`), a: T(`$1 : ${k}$`), sp: 'xs' };
    },
    (r) => {
      const k1 = r.pick([50, 100]), k2 = k1 * 2;
      return { q: T(`The same object is drawn twice: once at scale 1 : ${k1} and once at scale 1 : ${k2}. True or false: the 1 : ${k1} drawing is larger than the 1 : ${k2} drawing. Explain briefly.`, `Objek yang sama dilukis dua kali: sekali pada skala 1 : ${k1} dan sekali pada skala 1 : ${k2}. Betul atau salah: lukisan berskala 1 : ${k1} adalah lebih besar daripada lukisan berskala 1 : ${k2}. Terangkan secara ringkas.`), a: T(`True: 1 : ${k1} has a smaller reduction ratio, so its drawing lengths are ${k2 / k1} times as long as the 1 : ${k2} drawing.`, `Betul: 1 : ${k1} mempunyai nisbah pengecilan yang lebih kecil, jadi panjang lukisannya ${k2 / k1} kali panjang lukisan 1 : ${k2}.`), sp: 's' };
    },
    (r) => {
      const u = r.pick([2, 4, 5, 10]), squares = r.int(2, 6), actual = u * squares, c = r.pick(planCtx);
      return { q: T(`A wall in a plan of ${c.en} has actual length ${actual} m. On a scale drawing where each grid square represents ${u} m, how many grid squares long should the wall be drawn?`, `Satu dinding dalam pelan ${c.ms} mempunyai panjang sebenar ${actual} m. Pada lukisan berskala di mana setiap petak grid mewakili ${u} m, berapa petak grid panjangnya dinding itu patut dilukis?`), a: T(`${squares} grid squares`, `${squares} petak grid`), sp: 'xs' };
    },
    (r) => {
      const gw = r.int(2, 5), gh = r.int(2, 4), u = r.pick([2, 3, 5]);
      const fig = gridRectFig(gw, gh);
      const claimL = gw * u, claimW = (gh + r.pick([-1, 1])) * u;
      const ok = claimW === gh * u;
      return { q: T(`The diagram shows a rectangular plot on a square grid, where each grid square represents ${u} m by ${u} m. A sign states the plot's actual size as ${claimL} m by ${claimW} m. Is the sign correct? Give a reason.`, `Rajah menunjukkan sebidang tanah segi empat tepat pada grid segi empat sama, dengan setiap petak grid mewakili ${u} m kali ${u} m. Sebuah papan tanda menyatakan saiz sebenar tanah itu ialah ${claimL} m kali ${claimW} m. Adakah papan tanda itu betul? Berikan sebab.`), fig, a: ok ? T(`Yes, ${claimL} m by ${claimW} m matches ${gw} × ${gh} grid squares at ${u} m each.`, `Ya, ${claimL} m kali ${claimW} m sepadan dengan ${gw} × ${gh} petak grid pada ${u} m setiap satu.`) : T(`No: the width should be ${gh * u} m (${gh} squares × ${u} m), not ${claimW} m.`, `Tidak: lebarnya sepatutnya ${gh * u} m (${gh} petak × ${u} m), bukan ${claimW} m.`), sp: 's' };
    },
    (r) => {
      const k = r.pick(SCALES_MODEL), lCm = r.int(3, 10), wCm = r.int(2, lCm - 1), c = r.pick(modelCtx);
      return { q: SPM.cat(T(`${SPM.cap(c.en)} is drawn to a scale of 1 : ${k}, measuring ${lCm} cm by ${wCm} cm on the drawing. Find `, `${SPM.cap(c.ms)} dilukis dengan skala 1 : ${k}, berukuran ${lCm} cm kali ${wCm} cm pada lukisan. Cari `), SPM.parts([T('the actual length, in cm', 'panjang sebenar, dalam cm'), T('the actual width, in cm', 'lebar sebenar, dalam cm')])), a: T(`(a) ${lCm * k} cm (b) ${wCm * k} cm`, `(a) ${lCm * k} cm (b) ${wCm * k} cm`), sp: 'm' };
    },
  ];

  const g41m = [
    (r) => {
      const cmDraw = r.int(2, 9), mAct = r.int(2, 9) * r.pick([1, 2]);
      need(Math.round((mAct * 100) / cmDraw) === (mAct * 100) / cmDraw);
      const k = (mAct * 100) / cmDraw;
      const c = r.pick(planCtx);
      return { q: T(`A wall of ${c.en} is ${cmDraw} cm long on a plan and ${mAct} m long in actual size. Find the scale of the plan in the form 1 : $n$.`, `Sebuah dinding ${c.ms} berukuran ${cmDraw} cm pada pelan dan ${mAct} m dalam saiz sebenar. Cari skala pelan itu dalam bentuk 1 : $n$.`), a: T(`1 : ${k}`), w: T(`$${mAct}$ m $= ${mAct * 100}$ cm; $${mAct * 100} \\div ${cmDraw} = ${k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick(SCALES_MAP), cm1 = r.int(2, 6), cm2 = r.int(2, 6);
      const c1 = r.pick(mapCtx), total = (cm1 + cm2) * k;
      return { q: T(`On a map of scale 1 : ${k * 100000}, town $P$ is ${cm1} cm from town $Q$, and town $Q$ is a further ${cm2} cm from town $R$ along the same straight road. Find the actual distance from $P$ to $R$, in km.`, `Pada peta berskala 1 : ${k * 100000}, bandar $P$ berjarak ${cm1} cm dari bandar $Q$, dan bandar $Q$ pula berjarak ${cm2} cm lagi dari bandar $R$ di sepanjang jalan lurus yang sama. Cari jarak sebenar dari $P$ ke $R$, dalam km.`), a: T(`${n(total)} km`), w: T(`$(${cm1} + ${cm2}) \\times ${k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick(SCALES_PLAN), gw = r.int(2, 6), gh = r.int(2, 5);
      const fig = gridRectFig(gw, gh);
      return { q: T(`The diagram shows a rectangular plot drawn on a square grid, where each grid square represents an actual length of ${n(k / 100)} m. Using the scale 1 : ${k}, find the actual perimeter of the plot, in m.`, `Rajah menunjukkan sebidang tanah segi empat tepat yang dilukis pada grid segi empat sama, dengan setiap petak grid mewakili panjang sebenar ${n(k / 100)} m. Menggunakan skala 1 : ${k}, cari perimeter sebenar tanah itu, dalam m.`), fig, a: T(`${n(2 * (gw + gh) * k / 100)} m`), w: T(`Sides: $${gw}$ and $${gh}$ grid squares $\\Rightarrow$ perimeter $= 2(${gw}+${gh})$ squares`), sp: 'm' };
    },
    (r) => {
      const k1 = r.pick([50, 100]), k2 = k1 * r.pick([2, 4]);
      const dAct = r.int(3, 8) * k1;
      const d1 = dAct / k1, d2 = dAct / k2;
      return { q: T(`A wall is drawn as ${n(d1)} cm on a plan of scale 1 : ${k1}. If the same wall is redrawn on a new plan of scale 1 : ${k2}, find its new length on the drawing, in cm.`, `Sebuah dinding dilukis sepanjang ${n(d1)} cm pada pelan berskala 1 : ${k1}. Jika dinding yang sama dilukis semula pada pelan baharu berskala 1 : ${k2}, cari panjang barunya pada lukisan, dalam cm.`), a: T(`${n(d2)} cm`), w: T(`Actual length $= ${n(d1)} \\times ${k1} = ${dAct}$ cm; new drawing $= ${dAct} \\div ${k2}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick(SCALES_PLAN), maxCm = r.pick([15, 20, 25, 30]), actM = r.int(20, 60);
      const need1 = (actM * 100) / k;
      const ok = need1 <= maxCm;
      return { q: T(`A designer wants to draw a wall of actual length ${actM} m on paper no wider than ${maxCm} cm, using a scale of 1 : ${k}. Will the drawing fit on the paper? Show your working.`, `Seorang pereka ingin melukis dinding sepanjang ${actM} m pada kertas yang lebarnya tidak melebihi ${maxCm} cm, menggunakan skala 1 : ${k}. Adakah lukisan itu muat pada kertas? Tunjukkan kerja anda.`), a: ok ? T(`Yes: drawing length $= ${n(need1)}$ cm $\\le ${maxCm}$ cm.`, `Ya: panjang lukisan $= ${n(need1)}$ cm $\\le ${maxCm}$ cm.`) : T(`No: drawing length $= ${n(need1)}$ cm $> ${maxCm}$ cm.`, `Tidak: panjang lukisan $= ${n(need1)}$ cm $> ${maxCm}$ cm.`), sp: 'm' };
    },
    (r) => {
      const k = r.pick(SCALES_PLAN), c = r.pick(planCtx);
      const lenCm = r.int(4, 10), widCm = r.int(3, lenCm - 1);
      const lenA = (lenCm * k) / 100, widA = (widCm * k) / 100;
      return { q: SPM.cat(T(`On a plan of ${c.en} with scale 1 : ${k}, a room measures ${lenCm} cm by ${widCm} cm. Find `, `Pada pelan ${c.ms} berskala 1 : ${k}, sebuah bilik berukuran ${lenCm} cm kali ${widCm} cm. Cari `), SPM.parts([T('the actual length, in m', 'panjang sebenar, dalam m'), T('the actual width, in m', 'lebar sebenar, dalam m')])), a: T(`(a) ${n(lenA)} m (b) ${n(widA)} m`, `(a) ${n(lenA)} m (b) ${n(widA)} m`), sp: 'm' };
    },
    (r) => {
      const cmDraw1 = r.int(3, 8), actA1 = cmDraw1 * r.pick([50, 100]);
      const cmDraw2 = r.int(3, 8);
      const kWrong = actA1 / cmDraw1;
      const actA2 = cmDraw2 * kWrong;
      const claimedA2 = actA2 + r.pick([-1, 1]) * r.int(1, 3) * kWrong;
      const consistent = false;
      return { q: T(`A plan shows two walls of the same building. One wall is ${cmDraw1} cm on the plan and ${actA1} cm in actual length. A second wall is ${cmDraw2} cm on the plan and is claimed to be ${n(claimedA2)} cm in actual length. Is this claim consistent with the scale used for the first wall? Justify your answer.`, `Sebuah pelan menunjukkan dua dinding bangunan yang sama. Satu dinding berukuran ${cmDraw1} cm pada pelan dan ${actA1} cm dalam panjang sebenar. Dinding kedua pula berukuran ${cmDraw2} cm pada pelan dan didakwa ${n(claimedA2)} cm dalam panjang sebenar. Adakah dakwaan ini konsisten dengan skala yang digunakan untuk dinding pertama? Berikan justifikasi.`), a: T(`No: the scale from wall 1 is 1 : ${kWrong}, so wall 2 should be $${cmDraw2} \\times ${kWrong} = ${n(actA2)}$ cm, not ${n(claimedA2)} cm.`, `Tidak: skala daripada dinding pertama ialah 1 : ${kWrong}, jadi dinding kedua sepatutnya $${cmDraw2} \\times ${kWrong} = ${n(actA2)}$ cm, bukan ${n(claimedA2)} cm.`), sp: 'l' };
    },
    (r) => {
      const m2 = r.pick([2, 4, 5, 10, 20, 50]);
      return { q: T(`A scale drawing uses the statement "1 cm represents ${n(m2)} m". Write this scale in the ratio form $1 : n$.`, `Sebuah lukisan berskala menggunakan pernyataan "1 cm mewakili ${n(m2)} m". Tulis skala ini dalam bentuk nisbah $1 : n$.`), a: T(`$1 : ${m2 * 100}$`), w: T(`$${n(m2)}$ m $= ${m2 * 100}$ cm`), sp: 'm' };
    },
    (r) => {
      const km = r.pick([3, 4, 6, 8]), cmDraw = r.pick([1, 2, 4]);
      const kRatio = (km * 100000) / cmDraw;
      const c = r.pick(mapCtx);
      return { q: T(`On a map, ${c.en} are ${cmDraw} cm apart, representing an actual distance of ${km} km. Find the scale of the map in the form $1 : n$.`, `Pada sebuah peta, ${c.ms} berjarak ${cmDraw} cm, mewakili jarak sebenar ${km} km. Cari skala peta itu dalam bentuk $1 : n$.`), a: T(`1 : ${SPM.gt(kRatio)}`, `1 : ${SPM.gt(kRatio)}`), w: T(`$${km}$ km $= ${SPM.gt(km * 100000)}$ cm; $\\div ${cmDraw}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick(SCALES_PLAN), room1 = r.int(3, 6), room2 = r.int(3, 6), c = r.pick(planCtx);
      const A1 = (room1 * k) / 100, A2 = (room2 * k) / 100;
      return { q: T(`On a plan of ${c.en} drawn to scale 1 : ${k}, one wall is ${room1} cm long and an adjoining wall is ${room2} cm long. Find the actual total length of the two walls together, in m.`, `Pada pelan ${c.ms} berskala 1 : ${k}, satu dinding berukuran ${room1} cm dan dinding bersebelahan berukuran ${room2} cm. Cari jumlah panjang sebenar kedua-dua dinding itu bersama, dalam m.`), a: T(`${n(A1 + A2)} m`), w: T(`$(${room1}+${room2}) \\times ${k} \\div 100$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick(SCALES_PLAN), gw = r.int(3, 6), gh = r.int(2, 5), c = r.pick(planCtx);
      const rows = [[T('Length', 'Panjang'), `${gw} cm`, T('?', '?')], [T('Width', 'Lebar'), `${gh} cm`, `${n((gh * k) / 100)} m`]];
      const tbl = SPM.table(rows.map((row) => [row[0].en, row[1], row[2].en || row[2]]), { head: [T('Side', 'Sisi').en, T('Drawing length', 'Panjang lukisan').en, T('Actual length', 'Panjang sebenar').en], rowHead: true });
      const tblMs = SPM.table(rows.map((row) => [row[0].ms, row[1], row[2].ms || row[2]]), { head: [T('Side', 'Sisi').ms, T('Drawing length', 'Panjang lukisan').ms, T('Actual length', 'Panjang sebenar').ms], rowHead: true });
      return { q: SPM.cat(T(`The table shows measurements from a plan of ${c.en} drawn to scale 1 : ${k}. Complete the table by finding the missing actual length.`, `Jadual menunjukkan ukuran daripada pelan ${c.ms} yang dilukis dengan skala 1 : ${k}. Lengkapkan jadual dengan mencari panjang sebenar yang tertinggal.`), T(tbl, tblMs)), a: T(`${n((gw * k) / 100)} m`), sp: 's' };
    },
    (r) => {
      const bigK = r.pick([25000, 50000, 100000]), km = r.pick([2, 3, 5, 6, 8]), c = r.pick(mapCtx);
      const dcm = round((km * 100000) / bigK, 3);
      need(Number.isInteger(dcm * 100));
      return { q: T(`A real map has scale 1 : ${SPM.gt(bigK)}. If the actual distance between ${c.en} is ${km} km, find the distance between them on the map, in cm.`, `Sebuah peta sebenar berskala 1 : ${SPM.gt(bigK)}. Jika jarak sebenar antara ${c.ms} ialah ${km} km, cari jarak antara keduanya pada peta, dalam cm.`), a: T(`${n(dcm)} cm`), w: T(`$${km}$ km $= ${SPM.gt(km * 100000)}$ cm; $\\div ${SPM.gt(bigK)}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick(SCALES_MODEL), dCm = r.int(3, 9), realH = r.int(2, 5);
      const actCm = dCm * k, actM = actCm / 100;
      const taller = actM > realH;
      return { q: T(`A model aeroplane is drawn to a scale of 1 : ${k}. Its wingspan is ${dCm} cm on the model. Find the actual wingspan in m, and state whether it is longer than a bus of length ${realH} m.`, `Sebuah model kapal terbang dilukis dengan skala 1 : ${k}. Jarak sayapnya ialah ${dCm} cm pada model. Cari jarak sayap sebenar dalam m, dan nyatakan sama ada ia lebih panjang daripada sebuah bas sepanjang ${realH} m.`), a: T(`${n(actM)} m; ${taller ? 'longer' : 'shorter'} than the bus`, `${n(actM)} m; ${taller ? 'lebih panjang' : 'lebih pendek'} daripada bas itu`), sp: 'm' };
    },
  ];

  const travellerCtx = [T('a driver', 'seorang pemandu'), T('a motorcyclist', 'seorang penunggang motosikal'), T('a cyclist', 'seorang penunggang basikal'), T('a bus driver', 'seorang pemandu bas'), T('a lorry driver', 'seorang pemandu lori')];
  const g41a = [
    (r) => {
      const k = r.pick([50000, 100000, 250000]), d = r.int(3, 10), sp = r.pick([50, 60, 90]);
      const litrePerKm = r.pick([0.06, 0.08, 0.1]), price = r.pick([2.05, 2.15, 2.30]), c = r.pick(mapCtx), tv = r.pick(travellerCtx);
      const km = (d * k) / 100000;
      return { q: T(`On a map of scale 1 : ${k}, the distance between ${c.en} is ${d} cm. ${SPM.cap(tv.en)} travels this route at an average speed of ${sp} km/h, using fuel at a rate of ${n(litrePerKm)} litres per km, at RM${n(price)} per litre. Find (a) the actual distance in km, (b) the time taken in hours, correct to 2 decimal places, (c) the total cost of fuel, correct to the nearest RM.`, `Pada peta berskala 1 : ${k}, jarak antara ${c.ms} ialah ${d} cm. ${SPM.cap(tv.ms)} memandu laluan ini pada purata laju ${sp} km/j, menggunakan bahan api pada kadar ${n(litrePerKm)} liter per km, pada harga RM${n(price)} seliter. Cari (a) jarak sebenar dalam km, (b) masa yang diambil dalam jam, betul kepada 2 tempat perpuluhan, (c) jumlah kos bahan api, betul kepada RM yang terdekat.`), a: T(`(a) ${n(km)} km (b) ${n(round(km / sp, 2))} h (c) RM${Math.round(km * litrePerKm * price)}`, `(a) ${n(km)} km (b) ${n(round(km / sp, 2))} j (c) RM${Math.round(km * litrePerKm * price)}`), sp: 'l' };
    },
    (r) => {
      const k1 = r.pick([50, 100]), gw = r.int(3, 6), gh = r.int(2, 4);
      const k2 = k1 * 2;
      const fig = gridRectFig(gw, gh);
      const perimA = 2 * (gw + gh) * k1 / 100;
      return { q: T(`The diagram shows a plot of land drawn on a square grid at a scale of 1 : ${k1}, where each grid square has a side of 1 cm on the drawing. (a) Find the actual perimeter of the plot, in m. (b) The plot is to be redrawn at a scale of 1 : ${k2} instead. State the new dimensions of the drawing, in grid squares.`, `Rajah menunjukkan sebidang tanah yang dilukis pada grid segi empat sama pada skala 1 : ${k1}, dengan setiap petak grid bersisi 1 cm pada lukisan. (a) Cari perimeter sebenar tanah itu, dalam m. (b) Tanah itu hendak dilukis semula pada skala 1 : ${k2}. Nyatakan dimensi baharu lukisan itu, dalam petak grid.`), fig, a: T(`(a) ${n(perimA)} m (b) $${gw / 2}$ by $${gh / 2}$ grid squares`, `(a) ${n(perimA)} m (b) $${gw / 2}$ kali $${gh / 2}$ petak grid`), sp: 'l' };
    },
    (r) => {
      const gw = r.int(3, 5), gh = r.int(2, 4), cw = r.int(1, gw - 1), ch = r.int(1, gh - 1);
      need(cw < gw && ch < gh);
      const u = r.pick([2, 3, 5]);
      const fig = gridLFig(gw, gh, cw, ch);
      const area = (gw * gh - cw * ch) * u * u;
      const lc = r.pick([T('a plot of land', 'sebidang tanah'), T('a park', 'sebuah taman rekreasi'), T('a padi field', 'sebuah sawah padi'), T('a school field', 'sebuah padang sekolah')]);
      return { q: T(`The diagram shows the L-shaped plan of ${lc.en} drawn on a square grid, where each grid square represents ${u} m by ${u} m. Find the actual area of the plot, in m².`, `Rajah menunjukkan pelan berbentuk L bagi ${lc.ms} yang dilukis pada grid segi empat sama, dengan setiap petak grid mewakili ${u} m kali ${u} m. Cari luas sebenar tanah itu, dalam m².`), fig, a: T(`${area} m²`, `${area} m²`), w: T(`$(${gw} \\times ${gh} - ${cw} \\times ${ch}) \\times ${u}^2$`), sp: 'm' };
    },
    (r) => {
      const actM = r.int(20, 60), k = r.pick(SCALES_PLAN);
      const dcm = (actM * 100) / k;
      const scale2 = r.pick(SCALES_PLAN.filter((x) => x !== k));
      const dcm2 = (actM * 100) / scale2;
      const c = r.pick(planCtx);
      return { q: T(`A wall in a plan of ${c.en} has actual length ${actM} m and is drawn using scale 1 : ${k}. A student instead uses scale 1 : ${scale2}. Without evaluating both drawing lengths exactly, state which scale gives the longer drawing, then verify by calculation.`, `Satu dinding dalam pelan ${c.ms} mempunyai panjang sebenar ${actM} m dan dilukis menggunakan skala 1 : ${k}. Seorang murid pula menggunakan skala 1 : ${scale2}. Tanpa mengira kedua-dua panjang lukisan dengan tepat, nyatakan skala manakah yang menghasilkan lukisan yang lebih panjang, kemudian sahkan dengan pengiraan.`), a: T(`Scale 1 : ${Math.min(k, scale2)} gives the longer drawing (smaller ratio $n$ means less reduction). $${n(dcm)}$ cm vs $${n(dcm2)}$ cm.`, `Skala 1 : ${Math.min(k, scale2)} menghasilkan lukisan yang lebih panjang (nisbah $n$ yang lebih kecil bermaksud pengurangan yang lebih sedikit). $${n(dcm)}$ cm berbanding $${n(dcm2)}$ cm.`), sp: 'l' };
    },
    (r) => {
      const k = r.pick(SCALES_MAP), leg1 = r.int(3, 6), leg2 = r.int(3, 6);
      const total = (leg1 + leg2) * k;
      const sp1 = r.pick([40, 50, 60]), tv = r.pick(travellerCtx);
      const time = total / sp1;
      const restH = Math.floor(time), restMin = Math.round((time - restH) * 60);
      return { q: T(`${SPM.cap(tv.en)} rides from town $A$ to town $B$, a map distance of ${leg1} cm, then from $B$ to town $C$, a further map distance of ${leg2} cm, all on a map of scale 1 : ${k * 100000}. The journey is made at a constant average speed of ${sp1} km/h. Find the total time taken for the whole journey, in hours and minutes.`, `${SPM.cap(tv.ms)} bergerak dari bandar $A$ ke bandar $B$, jarak peta sejauh ${leg1} cm, kemudian dari $B$ ke bandar $C$, jarak peta sejauh ${leg2} cm lagi, semuanya pada peta berskala 1 : ${k * 100000}. Perjalanan itu dibuat pada purata laju malar ${sp1} km/j. Cari jumlah masa yang diambil untuk keseluruhan perjalanan itu, dalam jam dan minit.`), a: T(`${restH} h ${restMin} min`, `${restH} j ${restMin} minit`), w: T(`Actual distance $= (${leg1}+${leg2}) \\times ${k} = ${total}$ km`), sp: 'l' };
    },
    (r) => {
      const actM = r.int(30, 80), maxCm = r.pick([12, 15, 20]);
      const opts = SCALES_PLAN.filter((k) => (actM * 100) / k <= maxCm);
      need(opts.length >= 1 && opts.length < SCALES_PLAN.length);
      const best = Math.min(...opts);
      const dcm = (actM * 100) / best;
      const c = r.pick(planCtx);
      return { q: T(`A drawing of ${c.en} must fit on paper no wider than ${maxCm} cm. A wall has actual length ${actM} m. From the scales $\\{${SCALES_PLAN.join(', ')}\\}$ (each written as $1:n$), choose the smallest $n$ that still lets the wall fit on the paper, and state the resulting drawing length.`, `Lukisan ${c.ms} mesti muat pada kertas yang lebarnya tidak melebihi ${maxCm} cm. Sebuah dinding mempunyai panjang sebenar ${actM} m. Daripada skala $\\{${SCALES_PLAN.join(', ')}\\}$ (setiap satu ditulis sebagai $1:n$), pilih nilai $n$ yang terkecil yang masih membolehkan dinding itu muat pada kertas, dan nyatakan panjang lukisan yang terhasil.`), a: T(`$n = ${best}$; drawing length $= ${n(dcm)}$ cm`, `$n = ${best}$; panjang lukisan $= ${n(dcm)}$ cm`), sp: 'l' };
    },
    (r) => {
      const k = r.pick([50, 100, 200]), gw = r.int(3, 6), gh = r.int(2, 4), rate = r.pick([15, 20, 25]);
      const fig = gridRectFig(gw, gh);
      const perimA = 2 * (gw + gh) * k / 100;
      return { q: T(`The diagram shows a rectangular garden drawn on a square grid at linear scale 1 : ${k}, where each grid square has a side of 1 cm on the drawing. A fence is to be built around the garden at a cost of RM${rate} per metre. Find the actual perimeter of the garden, and the total cost of the fence.`, `Rajah menunjukkan sebuah taman segi empat tepat yang dilukis pada grid segi empat sama pada skala linear 1 : ${k}, dengan setiap petak grid bersisi 1 cm pada lukisan. Sebuah pagar hendak dibina mengelilingi taman itu pada kos RM${rate} setiap meter. Cari perimeter sebenar taman itu, dan jumlah kos pagar itu.`), fig, a: T(`${n(perimA)} m; RM${n(perimA * rate)}`, `${n(perimA)} m; RM${n(perimA * rate)}`), sp: 'l' };
    },
  ];

  SPM.extend('F3-4.1', { e: g41e, m: g41m, a: g41a });

  const landCtx = [T('a garden', 'sebuah taman'), T('a park', 'sebuah taman rekreasi'), T('a plot of land', 'sebuah bidang tanah'), T('a farm', 'sebuah ladang'), T('a school field', 'sebuah padang sekolah'), T('a housing lot', 'sebuah lot perumahan'), T('an orchard', 'sebuah dusun'), T('a paddy field', 'sebuah sawah padi'), T('a playground', 'sebuah taman permainan'), T('a car park', 'sebuah tempat letak kereta')];
  const photoCtx = [T('a photograph', 'sebuah gambar foto'), T('a poster', 'sebuah poster'), T('a painting', 'sebuah lukisan'), T('a postage stamp', 'sebuah setem pos'), T('a banner', 'sebuah sepanduk'), T('a wall mural', 'sebuah mural dinding')];
  const g42e = [
    (r) => {
      const k = r.pick([2, 3, 4, 5, 6, 8, 10]);
      return { q: T(`Two similar figures have linear scale $1 : ${k}$. State the ratio of their areas.`, `Dua rajah serupa mempunyai skala linear $1 : ${k}$. Nyatakan nisbah luas kedua-duanya.`), a: T(`$1 : ${k * k}$`), sp: 'xs' };
    },
    (r) => {
      const k = r.pick([2, 3, 4, 5]), A = r.int(2, 15), c = r.pick(landCtx);
      return { q: T(`A plan drawn to a linear scale of 1 : ${k} shows ${c.en} with plan area ${A} cm². Find the actual area, in cm².`, `Sebuah pelan yang dilukis pada skala linear 1 : ${k} menunjukkan ${c.ms} dengan luas pelan ${A} cm². Cari luas sebenar, dalam cm².`), a: T(`${A * k * k} cm²`), w: T(`Area scale $= 1 : ${k * k}$`, `Skala luas $= 1 : ${k * k}$`), sp: 's' };
    },
    (r) => {
      const k = r.pick([2, 3, 4]);
      return { q: T(`True or false: if the linear scale of a drawing is 1 : ${k}, then the area scale is also 1 : ${k}. Give a reason.`, `Betul atau salah: jika skala linear sebuah lukisan ialah 1 : ${k}, maka skala luasnya juga 1 : ${k}. Berikan sebab.`), a: T(`False: the area scale is $1 : ${k * k}$ (the square of the linear scale), not $1 : ${k}$.`, `Salah: skala luas ialah $1 : ${k * k}$ (kuasa dua skala linear), bukan $1 : ${k}$.`), sp: 's' };
    },
    (r) => {
      const k = r.pick([10, 20, 25, 50]);
      return { q: T(`Write the area scale that corresponds to a linear scale of $1 : ${k}$.`, `Tulis skala luas yang sepadan dengan skala linear $1 : ${k}$.`), a: T(`$1 : ${k * k}$`), sp: 'xs' };
    },
    (r) => {
      const k = r.pick([2, 3, 4, 5]), actA = k * k * r.int(2, 8), c = r.pick(landCtx);
      return { q: T(`A plan of ${c.en} is drawn to a linear scale of 1 : ${k}. The actual area is ${actA} cm². Find the plan area, in cm².`, `Pelan ${c.ms} dilukis pada skala linear 1 : ${k}. Luas sebenarnya ialah ${actA} cm². Cari luas pelan, dalam cm².`), a: T(`${actA / (k * k)} cm²`), sp: 's' };
    },
    (r) => {
      const k = r.pick([2, 4, 5, 10]), c = r.pick(photoCtx);
      return { q: T(`${SPM.cap(c.en)} is reduced with a linear scale of 1 : ${k} to fit a frame. What is the area scale of the reduction?`, `${SPM.cap(c.ms)} dikecilkan dengan skala linear 1 : ${k} supaya muat pada bingkai. Apakah skala luas pengecilan itu?`), a: T(`$1 : ${k * k}$`), sp: 'xs' };
    },
    (r) => {
      const k = r.pick([3, 4, 5]);
      return { q: T(`A student says the area scale for a linear scale of $1 : ${k}$ is $1 : ${2 * k}$. Is the student correct? State the correct area scale.`, `Seorang murid berkata skala luas bagi skala linear $1 : ${k}$ ialah $1 : ${2 * k}$. Adakah murid itu betul? Nyatakan skala luas yang betul.`), a: T(`No; the correct area scale is $1 : ${k * k}$.`, `Tidak; skala luas yang betul ialah $1 : ${k * k}$.`), sp: 's' };
    },
    (r) => {
      const k = r.pick([2, 3, 4, 5, 6]), c = r.pick(landCtx);
      return { q: T(`${SPM.cap(c.en)} is drawn at a linear scale of $1 : ${k}$. Fill in the blank: the actual area is ____ times the plan area.`, `${SPM.cap(c.ms)} dilukis pada skala linear $1 : ${k}$. Isikan tempat kosong: luas sebenar ialah ____ kali luas pelan.`), a: T(`${k * k}`), sp: 'xs' };
    },
    (r) => {
      const k = r.pick([2, 3, 4]), c1 = r.pick(photoCtx), c2 = r.pick(landCtx);
      return { q: T(`${SPM.cap(c1.en)} and a plan of ${c2.en} are both drawn at a linear scale of $1 : ${k}$. Do they have the same area scale? Explain.`, `${SPM.cap(c1.ms)} dan pelan ${c2.ms} kedua-duanya dilukis pada skala linear $1 : ${k}$. Adakah kedua-duanya mempunyai skala luas yang sama? Terangkan.`), a: T(`Yes: the area scale depends only on the linear scale, so both are $1 : ${k * k}$.`, `Ya: skala luas hanya bergantung pada skala linear, jadi kedua-duanya ialah $1 : ${k * k}$.`), sp: 's' };
    },
  ];
  const g42m = [
    (r) => {
      const k = r.pick([100, 200, 500]), A = r.int(4, 25), c = r.pick(landCtx);
      return { q: T(`On a plan of ${c.en} with linear scale 1 : ${k}, the plan area is ${A} cm². Find the actual area, in m².`, `Pada pelan ${c.ms} berskala linear 1 : ${k}, luas pelan ialah ${A} cm². Cari luas sebenar, dalam m².`), a: T(`${n((A * k * k) / 10000)} m²`), w: T(`Area scale $= 1 : ${k * k}$; $1$ m² $= 10\\,000$ cm²`), sp: 's' };
    },
    (r) => {
      const k = r.pick([2, 3, 4, 5]), actA = k * k * r.int(2, 10), c = r.pick(landCtx);
      return { q: T(`Two similar plots of land have a linear scale of $1 : ${k}$. If the actual area of the larger plot is ${actA} m², find the area of the smaller plot, in m². (Context: ${c.en}.)`, `Dua bidang tanah serupa mempunyai skala linear $1 : ${k}$. Jika luas sebenar bidang yang lebih besar ialah ${actA} m², cari luas bidang yang lebih kecil, dalam m². (Konteks: ${c.ms}.)`), a: T(`${n(actA / (k * k))} m²`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([2, 3, 4, 5]), planA = r.int(2, 8);
      const actA = planA * k * k;
      const wrong = planA * k;
      return { q: T(`A student says that a plan of linear scale 1 : ${k} with plan area ${planA} cm² has actual area ${wrong} cm². Explain the student's error and state the correct actual area.`, `Seorang murid berkata bahawa pelan berskala linear 1 : ${k} dengan luas pelan ${planA} cm² mempunyai luas sebenar ${wrong} cm². Terangkan kesilapan murid itu dan nyatakan luas sebenar yang betul.`), a: T(`The student used the linear scale instead of the area scale $1 : ${k * k}$. Correct actual area $= ${actA}$ cm².`, `Murid itu menggunakan skala linear dan bukannya skala luas $1 : ${k * k}$. Luas sebenar yang betul $= ${actA}$ cm².`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([100, 200, 250, 500]), actA = k * k * r.int(1, 6) / 10000, c = r.pick(landCtx);
      const planA = round((actA * 10000) / (k * k), 4);
      need(Number.isInteger(planA * 100));
      return { q: T(`${SPM.cap(c.en)} has actual area ${n(actA)} m². It is drawn on a plan of linear scale 1 : ${k}. Find the plan area, in cm².`, `${SPM.cap(c.ms)} mempunyai luas sebenar ${n(actA)} m². Ia dilukis pada pelan berskala linear 1 : ${k}. Cari luas pelan, dalam cm².`), a: T(`${n(planA)} cm²`), w: T(`$${n(actA)}$ m² $= ${n(actA * 10000)}$ cm²; $\\div ${k * k}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([2, 3, 4]), planA1 = r.int(2, 6), c = r.pick(landCtx);
      const actA = planA1 * k * k;
      const k2 = k * 2;
      const planA2 = actA / (k2 * k2);
      return { q: T(`${SPM.cap(c.en)} has plan area ${planA1} cm² on a drawing of linear scale 1 : ${k}. Find its plan area, in cm², if it were redrawn at linear scale 1 : ${k2} instead.`, `${SPM.cap(c.ms)} mempunyai luas pelan ${planA1} cm² pada lukisan berskala linear 1 : ${k}. Cari luas pelannya, dalam cm², jika ia dilukis semula pada skala linear 1 : ${k2}.`), a: T(`${n(planA2)} cm²`), w: T(`Actual area $= ${planA1} \\times ${k * k} = ${actA}$ cm²; new plan area $= ${actA} \\div ${k2 * k2}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([2, 3, 4, 5]), planA = r.int(2, 6), price = r.pick([5, 8, 10]), c = r.pick(landCtx);
      const actA = planA * k * k;
      return { q: T(`A plan of ${c.en} at linear scale 1 : ${k} has plan area ${planA} cm². Find the actual area in cm², and the cost of fertiliser needed at RM${price} per 100 cm² of actual area.`, `Pelan ${c.ms} pada skala linear 1 : ${k} mempunyai luas pelan ${planA} cm². Cari luas sebenar dalam cm², dan kos baja yang diperlukan pada RM${price} setiap 100 cm² luas sebenar.`), a: T(`${actA} cm²; RM${n((actA / 100) * price)}`, `${actA} cm²; RM${n((actA / 100) * price)}`), sp: 'm' };
    },
  ];
  const g42a = [
    (r) => {
      const planA = r.int(2, 6), actA = planA * r.pick([4, 9, 16, 25, 100]), c = r.pick(landCtx);
      const kk = actA / planA, k = Math.round(Math.sqrt(kk));
      need(k * k === kk);
      return { q: T(`A plan of ${c.en} has plan area ${planA} cm² and the actual area is ${actA} cm². Find the linear scale of the plan, in the form $1 : n$.`, `Sebuah pelan ${c.ms} mempunyai luas pelan ${planA} cm² dan luas sebenar ${actA} cm². Cari skala linear pelan itu, dalam bentuk $1 : n$.`), a: T(`1 : ${k}`), w: T(`Area scale $= 1 : ${kk}$, so linear scale $= 1 : \\sqrt{${kk}}$`), sp: 'm' };
    },
    (r) => {
      const linK = r.pick([2, 3, 5]), planA = r.int(2, 6), actA = planA * linK * linK, c = r.pick(landCtx);
      const claimK = linK * 2;
      return { q: T(`A surveyor claims that a plan of ${c.en} with plan area ${planA} cm² and actual area ${actA} cm² was drawn at linear scale $1 : ${claimK}$. Verify this claim by finding the linear scale that the numbers actually give.`, `Seorang juruukur mendakwa pelan ${c.ms} dengan luas pelan ${planA} cm² dan luas sebenar ${actA} cm² dilukis pada skala linear $1 : ${claimK}$. Sahkan dakwaan ini dengan mencari skala linear yang sebenarnya diberikan oleh nombor tersebut.`), a: T(`Area scale $= 1 : ${linK * linK}$, so the linear scale is $1 : ${linK}$, not $1 : ${claimK}$. The claim is wrong.`, `Skala luas $= 1 : ${linK * linK}$, jadi skala linearnya ialah $1 : ${linK}$, bukan $1 : ${claimK}$. Dakwaan itu salah.`), sp: 'l' };
    },
    (r) => {
      const k = r.pick([100, 200, 500]), planA = r.int(2, 5), price = r.pick([30, 40, 50]), c = r.pick(landCtx);
      const actA = (planA * k * k) / 10000;
      const half = actA / 2;
      return { q: T(`${SPM.cap(c.en)} has plan area ${planA} cm² on a drawing of linear scale 1 : ${k}. Half of the actual land is to be sold at RM${price} per m². Find (a) the actual area of the land in m², (b) the amount raised from selling half of it.`, `${SPM.cap(c.ms)} mempunyai luas pelan ${planA} cm² pada lukisan berskala linear 1 : ${k}. Separuh daripada tanah sebenar itu akan dijual pada RM${price} setiap m². Cari (a) luas sebenar tanah itu dalam m², (b) jumlah wang yang diperoleh daripada menjual separuh daripadanya.`), a: T(`(a) ${n(actA)} m² (b) RM${n(half * price)}`, `(a) ${n(actA)} m² (b) RM${n(half * price)}`), sp: 'l' };
    },
    (r) => {
      const k = r.pick([50, 100, 200]), gw = r.int(2, 5), gh = r.int(2, 4);
      const fig = gridRectFig(gw, gh);
      const price = r.pick([8, 12, 15, 20]);
      const actA = gw * gh * k * k / 10000;
      return { q: T(`The diagram shows a rectangular plot drawn on a square grid at linear scale 1 : ${k}, where each grid square has a side of 1 cm on the drawing. Find the actual area of the plot in m², and the cost of grass to cover it at RM${price} per m².`, `Rajah menunjukkan sebidang tanah segi empat tepat yang dilukis pada grid segi empat sama pada skala linear 1 : ${k}, dengan setiap petak grid bersisi 1 cm pada lukisan. Cari luas sebenar tanah itu dalam m², dan kos rumput untuk menutupnya pada harga RM${price} per m².`), fig, a: T(`${n(actA)} m²; RM${n(actA * price)}`, `${n(actA)} m²; RM${n(actA * price)}`), sp: 'l' };
    },
    (r) => {
      const k = r.pick([100, 200, 500]), gw = r.int(3, 6), gh = r.int(2, 5), price = r.pick([25, 40, 60]), c = r.pick(landCtx);
      const fig = gridRectFig(gw, gh);
      const actA = (gw * gh * k * k) / 10000;
      return { q: T(`The diagram shows ${c.en} drawn on a square grid at linear scale 1 : ${k}, where each grid square has a side of 1 cm on the drawing. The land is for sale at RM${price} per m². Find the actual area, in m², and the total selling price.`, `Rajah menunjukkan ${c.ms} yang dilukis pada grid segi empat sama pada skala linear 1 : ${k}, dengan setiap petak grid bersisi 1 cm pada lukisan. Tanah itu dijual pada RM${price} setiap m². Cari luas sebenar, dalam m², dan jumlah harga jualan.`), fig, a: T(`${n(actA)} m²; RM${SPM.gt(round(actA * price, 0))}`, `${n(actA)} m²; RM${SPM.gt(round(actA * price, 0))}`), sp: 'l' };
    },
    (r) => {
      const pool = [2, 3, 4, 5, 6];
      const planA = r.int(2, 4), k1 = r.pick(pool), k2 = r.pick(pool.filter((x) => x !== k1));
      const actA = planA * k1 * k1;
      const planA2 = actA / (k2 * k2);
      const smaller = planA2 < planA;
      return { q: T(`The same plot of land is drawn on two plans: Plan $A$ at linear scale 1 : ${k1} with plan area ${planA} cm², and Plan $B$ at linear scale 1 : ${k2}. Find the plan area of Plan $B$, in cm², and state which plan has the smaller drawing.`, `Sebidang tanah yang sama dilukis pada dua pelan: Pelan $A$ pada skala linear 1 : ${k1} dengan luas pelan ${planA} cm², dan Pelan $B$ pada skala linear 1 : ${k2}. Cari luas pelan $B$, dalam cm², dan nyatakan pelan manakah mempunyai lukisan yang lebih kecil.`), a: T(`${n(planA2)} cm²; Plan ${smaller ? '$B$' : '$A$'} is smaller.`, `${n(planA2)} cm²; Pelan ${smaller ? '$B$' : '$A$'} lebih kecil.`), w: T(`Actual area $= ${planA} \\times ${k1 * k1} = ${actA}$ cm²`), sp: 'l' };
    },
  ];

  SPM.extend('F3-4.2', { e: g42e, m: g42m, a: g42a });

  /* =============================================================== 5 : Trigonometric Ratios */
  /** right-angled triangle, right angle at B. sides: ab, bc, ac string labels; at:'A'|'C' angle vertex; ang: label */
  function triFig(o) {
    const w = o.w || 180, h = o.h || 130;
    const W = 220, H = 160;
    const x0 = (W - w) / 2, y0 = (H + h) / 2;
    const B = [x0, y0], C = [x0 + w, y0], A = [x0, y0 - h];
    let out = S.poly([A, B, C]) + S.rightAngle(B, C, A, 10);
    out += S.text(A[0] - 12, A[1] - 4, 'A', { i: true }) + S.text(B[0] - 12, B[1] + 8, 'B', { i: true }) + S.text(C[0] + 12, C[1] + 8, 'C', { i: true });
    const cen = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    if (o.ab) out += S.sideLabel(A, B, cen, o.ab, 14);
    if (o.bc) out += S.sideLabel(B, C, cen, o.bc, 12);
    if (o.ac) out += S.sideLabel(A, C, cen, o.ac, 16);
    if (o.at === 'A') out += S.arc(A, B, C, 24, o.ang, { gap: 15 });
    if (o.at === 'C') out += S.arc(C, B, A, 24, o.ang, { gap: 15 });
    return S.wrap(W, H, out, 'right-angled triangle');
  }
  /** ground scene: a vertical object of drawing-height h at x=0, an observer at distance d, dashed horizontal
   * reference at the vertex where the angle sits. mode 'elev' marks angle at observer (looking up);
   * 'dep' marks angle at the top of the object (looking down). */
  function sceneFig(d, h, ang, mode) {
    const W = 250, H = 160, pad = 24, groundY = H - 30;
    const sc = Math.min((W - 2 * pad - 30) / d, (groundY - 26) / h);
    const baseX = pad + 8, obsX = baseX + d * sc, topY = groundY - h * sc;
    let out = S.line(pad, groundY, W - pad, groundY, { w: 1.3 });
    out += S.line(baseX, groundY, baseX, topY, { w: 2 });
    out += S.rightAngle([baseX, groundY], [baseX, topY], [obsX, groundY], 9);
    out += S.dot(obsX, groundY, 2.5) + S.text(obsX, groundY + 12, 'P', { i: true });
    if (mode === 'elev') {
      out += S.line(obsX, groundY, obsX - 28, groundY, { dash: true });
      out += S.line(obsX, groundY, baseX, topY, { w: 1.3 });
      out += S.arc([obsX, groundY], [baseX, groundY], [baseX, topY], 22, ang, { gap: 14 });
    } else {
      out += S.line(baseX, topY, baseX - 28, topY, { dash: true });
      out += S.line(baseX, topY, obsX, groundY, { w: 1.3 });
      out += S.arc([baseX, topY], [baseX - 28, topY], [obsX, groundY], 22, ang, { gap: 14 });
    }
    return S.wrap(W, H, out, mode === 'elev' ? 'angle of elevation scene' : 'angle of depression scene');
  }
  /** schematic cuboid in cabinet projection. o = {lLab, wLab, hLab, diag:'base'|'space', diagLab} */
  function cuboidFig(o) {
    o = o || {};
    const W = 108, H = 74, D = 52;
    const ox = 36, oy = 118;
    const A = [ox, oy], B = [ox + W, oy], C = [ox + W, oy - H], Dp = [ox, oy - H];
    const dx = D * 0.6, dy = -D * 0.5;
    const E = [A[0] + dx, A[1] + dy], F = [B[0] + dx, B[1] + dy], G = [C[0] + dx, C[1] + dy], Hh = [Dp[0] + dx, Dp[1] + dy];
    let out = S.poly([A, B, C, Dp]);
    out += S.line(B[0], B[1], F[0], F[1]) + S.line(C[0], C[1], G[0], G[1]) + S.line(Dp[0], Dp[1], Hh[0], Hh[1]);
    out += S.line(F[0], F[1], G[0], G[1]) + S.line(G[0], G[1], Hh[0], Hh[1]);
    out += S.line(A[0], A[1], E[0], E[1], { dash: true }) + S.line(E[0], E[1], F[0], F[1], { dash: true }) + S.line(E[0], E[1], Hh[0], Hh[1], { dash: true });
    if (o.diag === 'base') { out += S.line(A[0], A[1], F[0], F[1], { w: 1.6 }); out += S.rightAngle(B, A, F, 8); }
    if (o.diag === 'space') { out += S.line(A[0], A[1], G[0], G[1], { w: 1.6 }); }
    if (o.wLab) out += S.text((A[0] + B[0]) / 2, A[1] + 13, o.wLab, { s: 11 });
    if (o.hLab) out += S.text(A[0] - 15, (A[1] + Dp[1]) / 2, o.hLab, { s: 11 });
    if (o.lLab) out += S.text((B[0] + F[0]) / 2 + 12, (B[1] + F[1]) / 2 - 3, o.lLab, { s: 11 });
    return S.wrap(ox + W + dx + 24, oy + 14, out, 'cuboid');
  }
  const TRI51 = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 12, 15], [20, 21, 29]];
  const trigCtx = [T('A ladder leaning against a wall', 'Sebuah tangga yang bersandar pada dinding'), T('A ramp leading up to a stage', 'Sebuah tanjakan menuju ke pentas'), T('A kite string pulled taut from a hand to the kite', 'Tali layang-layang yang tegang dari tangan ke layang-layang'), T('A zip-line cable from a tower to the ground', 'Kabel zip-line dari sebuah menara ke tanah'), T('A guy wire holding up a flagpole', 'Seutas tali penyokong yang menegakkan tiang bendera'), T('A plank used as a bridge over a ditch', 'Sekeping papan yang digunakan sebagai jambatan merentasi parit'), T('A skateboard ramp', 'Sebuah tanjakan papan luncur'), T('An extension ladder resting against a roof', 'Sebuah tangga sambungan yang bersandar pada bumbung'), T('A rope from the top of a tent pole to a peg on the ground', 'Seutas tali dari puncak tiang khemah ke pancang di tanah'), T('A slide in a playground', 'Sebuah gelongsor di taman permainan')];
  const exactBank = [
    ['\\sin 30^\\circ', '\\dfrac{1}{2}'], ['\\cos 60^\\circ', '\\dfrac{1}{2}'], ['\\tan 45^\\circ', '1'],
    ['\\sin 90^\\circ', '1'], ['\\cos 90^\\circ', '0'], ['\\tan 0^\\circ', '0'], ['\\sin 0^\\circ', '0'], ['\\cos 0^\\circ', '1'],
    ['\\cos 30^\\circ', '\\dfrac{\\sqrt{3}}{2}'], ['\\sin 60^\\circ', '\\dfrac{\\sqrt{3}}{2}'], ['\\sin 45^\\circ', '\\dfrac{1}{\\sqrt{2}}'],
    ['\\cos 45^\\circ', '\\dfrac{1}{\\sqrt{2}}'], ['\\tan 30^\\circ', '\\dfrac{1}{\\sqrt{3}}'], ['\\tan 60^\\circ', '\\sqrt{3}'],
  ];
  const g51e = [
    (r) => {
      const [a, b, c] = r.pick(TRI51.slice(0, 4)), at = r.pick(['A', 'C']);
      const AB = a, BC = b, AC = c;
      const opp = at === 'A' ? BC : AB, adj = at === 'A' ? AB : BC;
      const which = r.pick(['all', 'sin', 'cos', 'tan']);
      const fig = triFig({ ab: `${AB} cm`, bc: `${BC} cm`, ac: `${AC} cm`, at, ang: '\\theta' });
      const ans = which === 'all' ? T(`$\\sin\\theta = \\dfrac{${opp}}{${AC}}$, $\\cos\\theta = \\dfrac{${adj}}{${AC}}$, $\\tan\\theta = \\dfrac{${opp}}{${adj}}$`) : which === 'sin' ? T(`$\\sin\\theta = \\dfrac{${opp}}{${AC}}$`) : which === 'cos' ? T(`$\\cos\\theta = \\dfrac{${adj}}{${AC}}$`) : T(`$\\tan\\theta = \\dfrac{${opp}}{${adj}}$`);
      const task = which === 'all' ? T('write down $\\sin\\theta$, $\\cos\\theta$ and $\\tan\\theta$ as fractions', 'tuliskan $\\sin\\theta$, $\\cos\\theta$ dan $\\tan\\theta$ sebagai pecahan') : T(`find $\\${which}\\,\\theta$ as a fraction`, `cari $\\${which}\\,\\theta$ sebagai pecahan`);
      return { q: T(`In the right-angled triangle $ABC$, ${task.en}.`, `Dalam segi tiga bersudut tegak $ABC$, ${task.ms}.`), fig, a: ans, sp: 's' };
    },
    (r) => {
      const c = r.pick(exactBank);
      return { q: T(`State the exact value of $${c[0]}$.`, `Nyatakan nilai tepat bagi $${c[0]}$.`), a: T(`$${c[1]}$`), sp: 'xs' };
    },
    (r) => {
      const c = r.pick(exactBank);
      return { q: T(`Fill in the blank: $${c[0]} = $ ____.`, `Isikan tempat kosong: $${c[0]} = $ ____.`), a: T(`$${c[1]}$`), sp: 'xs' };
    },
    (r) => {
      const [a, b, c] = r.pick(TRI51.slice(0, 4)), at = r.pick(['A', 'C']);
      const opp = at === 'A' ? b : a, adj = at === 'A' ? a : b;
      const fig = triFig({ ab: `${a} cm`, bc: `${b} cm`, ac: `${c} cm`, at, ang: '\\theta' });
      const which = r.pick(['sin', 'cos', 'tan']);
      const val = which === 'sin' ? `\\dfrac{${opp}}{${c}}` : which === 'cos' ? `\\dfrac{${adj}}{${c}}` : `\\dfrac{${opp}}{${adj}}`;
      return { q: T(`In the right-angled triangle $ABC$, find $\\${which}\\,\\theta$.`, `Dalam segi tiga bersudut tegak $ABC$, cari $\\${which}\\,\\theta$.`), fig, a: T(`$${val}$`), sp: 's' };
    },
    (r) => {
      const parts = [T('the opposite side and the hypotenuse', 'sisi bertentangan dan hipotenus'), T('the adjacent side and the hypotenuse', 'sisi bersebelahan dan hipotenus'), T('the opposite and adjacent sides', 'sisi bertentangan dan sisi bersebelahan')];
      const idx = r.int(0, 2), names = ['sine', 'cosine', 'tangent'], namesMs = ['sin', 'kos', 'tan'];
      return { q: T(`Which trigonometric ratio uses ${parts[idx].en}: sine, cosine or tangent?`, `Nisbah trigonometri manakah yang menggunakan ${parts[idx].ms}: sin, kos atau tan?`), a: T(names[idx], namesMs[idx]), sp: 'xs' };
    },
    (r) => {
      const [a, b, c] = r.pick(TRI51.slice(0, 4)), at = r.pick(['A', 'C']);
      const fig = triFig({ ab: `${a} cm`, bc: `${b} cm`, ac: `${c} cm`, at, ang: '\\theta' });
      const opp = at === 'A' ? b : a, adj = at === 'A' ? a : b;
      const side = r.pick([['AB', at === 'A' ? 'adjacent' : 'opposite', at === 'A' ? 'bersebelahan' : 'bertentangan'], ['BC', at === 'A' ? 'opposite' : 'adjacent', at === 'A' ? 'bertentangan' : 'bersebelahan'], ['AC', 'hypotenuse', 'hipotenus']]);
      return { q: T(`In the right-angled triangle $ABC$ with the angle $\\theta$ marked at $${at}$, is side $${side[0]}$ the opposite side, the adjacent side, or the hypotenuse?`, `Dalam segi tiga bersudut tegak $ABC$ dengan sudut $\\theta$ ditandakan di $${at}$, adakah sisi $${side[0]}$ ialah sisi bertentangan, sisi bersebelahan, atau hipotenus?`), fig, a: T(side[1], side[2]), sp: 'xs' };
    },
    (r) => {
      const t = r.pick([20, 35, 40, 55, 65, 72]), which = r.pick(['sin', 'cos', 'tan']);
      const v = which === 'sin' ? Math.sin(rad(t)) : which === 'cos' ? Math.cos(rad(t)) : Math.tan(rad(t));
      return { q: T(`Use a calculator to find $\\${which} ${t}^\\circ$, correct to 4 decimal places.`, `Gunakan kalkulator untuk mencari $\\${which} ${t}^\\circ$, betul kepada 4 tempat perpuluhan.`), a: T(`$${n(round(v, 4))}$`), sp: 'xs' };
    },
    (r) => {
      const c = r.pick([90, 0]);
      return { q: T(`True or false: $\\tan ${c}^\\circ$ is a defined, finite number. Give a reason.`, `Betul atau salah: $\\tan ${c}^\\circ$ ialah nombor terhingga yang ditakrifkan. Berikan sebab.`), a: c === 90 ? T('False: at $90^\\circ$ the adjacent side becomes 0, so $\\tan 90^\\circ$ has no value (division by zero).', 'Salah: pada $90^\\circ$ sisi bersebelahan menjadi 0, jadi $\\tan 90^\\circ$ tidak ditakrifkan (bahagi dengan sifar).') : T('True: $\\tan 0^\\circ = 0$, a defined finite value.', 'Betul: $\\tan 0^\\circ = 0$, satu nilai terhingga yang ditakrifkan.'), sp: 's' };
    },
    (r) => {
      const bank = [['\\sin', '\\dfrac{1}{2}', 30], ['\\sin', '\\dfrac{\\sqrt{3}}{2}', 60], ['\\sin', '\\dfrac{1}{\\sqrt{2}}', 45], ['\\cos', '\\dfrac{1}{2}', 60], ['\\cos', '\\dfrac{\\sqrt{3}}{2}', 30], ['\\cos', '\\dfrac{1}{\\sqrt{2}}', 45], ['\\tan', '1', 45], ['\\tan', '\\sqrt{3}', 60], ['\\tan', '\\dfrac{1}{\\sqrt{3}}', 30]];
      const [fn, v, ang] = r.pick(bank);
      return { q: T(`Given that $${fn}\\,\\theta = ${v}$ where $\\theta$ is acute, state the value of $\\theta$.`, `Diberi $${fn}\\,\\theta = ${v}$ dengan $\\theta$ ialah sudut tirus, nyatakan nilai $\\theta$.`), a: T(`$\\theta = ${ang}^\\circ$`), sp: 'xs' };
    },
    (r) => {
      const fn = r.pick(['\\sin', '\\cos', '\\tan']), fnMs = fn, t1 = r.pick([15, 20]), t2 = t1 + r.pick([30, 40, 50]);
      need(t2 < 90);
      const larger = fn === '\\cos' ? t1 : t2;
      return { q: T(`Without using a calculator, state which is larger: $${fn} ${t1}^\\circ$ or $${fn} ${t2}^\\circ$?`, `Tanpa menggunakan kalkulator, nyatakan yang manakah lebih besar: $${fn} ${t1}^\\circ$ atau $${fn} ${t2}^\\circ$?`), a: T(`$${fn} ${larger}^\\circ$`), sp: 'xs' };
    },
    (r) => {
      const wrong = r.pick([['\\sin', T('opposite over adjacent', 'bertentangan berbanding bersebelahan')], ['\\cos', T('opposite over hypotenuse', 'bertentangan berbanding hipotenus')], ['\\tan', T('adjacent over hypotenuse', 'bersebelahan berbanding hipotenus')]]);
      const [fn, wr] = wrong;
      const correct = fn === '\\sin' ? T('opposite over hypotenuse', 'bertentangan berbanding hipotenus') : fn === '\\cos' ? T('adjacent over hypotenuse', 'bersebelahan berbanding hipotenus') : T('opposite over adjacent', 'bertentangan berbanding bersebelahan');
      return { q: T(`A student says $${fn}\\,\\theta$ is ${wr.en}. Is this correct? State the correct definition.`, `Seorang murid berkata $${fn}\\,\\theta$ ialah ${wr.ms}. Adakah ini betul? Nyatakan takrif yang betul.`), a: T(`No; $${fn}\\,\\theta$ is ${correct.en}.`, `Tidak; $${fn}\\,\\theta$ ialah ${correct.ms}.`), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick(TRI51.slice(0, 4)), ctx = r.pick(trigCtx), which = r.pick(['sin', 'cos', 'tan']);
      const opp = b, adj = a;
      const fig = triFig({ ab: `${a} m`, bc: `${b} m`, ac: `${c} m`, at: 'C', ang: '\\theta' });
      const val = which === 'sin' ? `\\dfrac{${opp}}{${c}}` : which === 'cos' ? `\\dfrac{${adj}}{${c}}` : `\\dfrac{${opp}}{${adj}}`;
      return { q: T(`${ctx.en} makes a right angle with the ground at its foot, as shown, with the angle $\\theta$ marked where it meets the ground. Find $\\${which}\\,\\theta$.`, `${ctx.ms} membentuk sudut tegak dengan tanah di kakinya, seperti yang ditunjukkan, dengan sudut $\\theta$ ditandakan di tempat ia bertemu tanah. Cari $\\${which}\\,\\theta$.`), fig, a: T(`$${val}$`), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick(TRI51.slice(0, 4)), ctx = r.pick(trigCtx), which = r.pick(['sin', 'cos', 'tan']);
      const fig = triFig({ ab: `${a} m`, bc: `${b} m`, ac: `${c} m`, at: 'A', ang: '\\theta' });
      const val = which === 'sin' ? `\\dfrac{${a}}{${c}}` : which === 'cos' ? `\\dfrac{${b}}{${c}}` : `\\dfrac{${a}}{${b}}`;
      return { q: T(`Based on the right-angled triangle formed by ${ctx.ms === ctx.en ? ctx.en.toLowerCase() : ctx.en[0].toLowerCase() + ctx.en.slice(1)}, with the sides shown, express $\\${which}\\,\\theta$ in its simplest fractional form.`, `Berdasarkan segi tiga bersudut tegak yang dibentuk oleh ${ctx.ms[0].toLowerCase() + ctx.ms.slice(1)}, dengan sisi-sisinya seperti yang ditunjukkan, ungkapkan $\\${which}\\,\\theta$ dalam bentuk pecahan termudah.`), fig, a: T(`$${val}$`), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick(TRI51.slice(0, 4)), ctx = r.pick(trigCtx), which = r.pick(['sin', 'cos', 'tan']);
      const fig = triFig({ ab: `${a} m`, bc: `${b} m`, ac: `${c} m`, at: 'C', ang: '\\theta' });
      const val = which === 'sin' ? `\\dfrac{${b}}{${c}}` : which === 'cos' ? `\\dfrac{${a}}{${c}}` : `\\dfrac{${b}}{${a}}`;
      return { q: T(`Complete the blank for the right-angled triangle formed by ${ctx.en[0].toLowerCase() + ctx.en.slice(1)}: $\\${which}\\,\\theta = \\dfrac{\\text{?}}{\\text{?}}$.`, `Lengkapkan tempat kosong bagi segi tiga bersudut tegak yang dibentuk oleh ${ctx.ms[0].toLowerCase() + ctx.ms.slice(1)}: $\\${which}\\,\\theta = \\dfrac{\\text{?}}{\\text{?}}$.`), fig, a: T(`$\\${which}\\,\\theta = ${val}$`), sp: 's' };
    },
    (r) => {
      const [ctx1, ctx2] = r.sample(trigCtx, 2);
      const [p1, q1] = r.pick(TRI51.slice(0, 5)), [p2, q2] = r.pick(TRI51.slice(0, 5).filter((t) => t[1] / t[0] !== q1 / p1));
      const steeper1 = q1 / p1 > q2 / p2;
      return { q: T(`${ctx1.en} rises ${q1} m over a horizontal run of ${p1} m. ${SPM.cap(ctx2.en)} rises ${q2} m over a horizontal run of ${p2} m. Which one is steeper (makes the bigger angle with the ground)?`, `${ctx1.ms} naik ${q1} m merentasi jarak mengufuk ${p1} m. ${SPM.cap(ctx2.ms)} naik ${q2} m merentasi jarak mengufuk ${p2} m. Yang manakah lebih curam (membentuk sudut yang lebih besar dengan tanah)?`), a: steeper1 ? T('The first one.', 'Yang pertama.') : T('The second one.', 'Yang kedua.'), sp: 's' };
    },
  ];
  const g51m = [
    (r) => {
      const [a, b, c] = r.pick(TRI51), at = r.pick(['A', 'C']);
      const opp = at === 'A' ? b : a, adj = at === 'A' ? a : b;
      const fig = triFig({ ab: `${a} cm`, bc: `${b} cm`, ac: 'x', at, ang: '\\theta' });
      const which = r.pick(['all', 'tan']);
      return { q: T(`Find $x$ using Pythagoras' theorem, then write down $\\sin\\theta$, $\\cos\\theta$ and $\\tan\\theta$.`, `Cari $x$ menggunakan teorem Pythagoras, kemudian tuliskan $\\sin\\theta$, $\\cos\\theta$ dan $\\tan\\theta$.`), fig, a: T(`$x = ${c}$; $\\sin\\theta = \\dfrac{${opp}}{${c}}$, $\\cos\\theta = \\dfrac{${adj}}{${c}}$, $\\tan\\theta = \\dfrac{${opp}}{${adj}}$`), sp: 'm' };
    },
    (r) => {
      const t1 = r.pick([15, 25, 35, 50]), t2 = t1 + r.pick([15, 20, 25]), t3 = t2 + r.pick([15, 20]);
      need(t3 < 90);
      const fn = r.pick(['sin', 'cos', 'tan']);
      const nameEn = fn === 'sin' ? 'sine' : fn === 'cos' ? 'cosine' : 'tangent', nameMs = fn === 'sin' ? 'sin' : fn === 'cos' ? 'kos' : 'tan';
      const asc = fn === 'cos' ? `\\${fn} ${t3}^\\circ < \\${fn} ${t2}^\\circ < \\${fn} ${t1}^\\circ` : `\\${fn} ${t1}^\\circ < \\${fn} ${t2}^\\circ < \\${fn} ${t3}^\\circ`;
      const trend = fn === 'cos' ? T('decreases', 'menurun') : T('increases', 'meningkat');
      return { q: T(`Without using a calculator, arrange $\\${fn} ${t1}^\\circ$, $\\${fn} ${t2}^\\circ$ and $\\${fn} ${t3}^\\circ$ in ascending order. State the general pattern you used.`, `Tanpa menggunakan kalkulator, susun $\\${fn} ${t1}^\\circ$, $\\${fn} ${t2}^\\circ$ dan $\\${fn} ${t3}^\\circ$ mengikut tertib menaik. Nyatakan corak am yang anda gunakan.`), a: T(`$${asc}$; ${nameEn} ${trend.en} as the angle increases.`, `$${asc}$; ${nameMs} ${trend.ms} apabila sudut meningkat.`), sp: 's' };
    },
    (r) => {
      const rows = [['$30^\\circ$', '$45^\\circ$', '$60^\\circ$'], ['$\\dfrac{1}{2}$', '?', '$\\dfrac{\\sqrt{3}}{2}$']];
      const which = r.pick(['sin', 'cos']);
      const midVal = which === 'sin' ? '\\dfrac{1}{\\sqrt{2}}' : '\\dfrac{1}{\\sqrt{2}}';
      const row0 = which === 'sin' ? ['$\\dfrac{1}{2}$', '?', '$\\dfrac{\\sqrt{3}}{2}$'] : ['$\\dfrac{\\sqrt{3}}{2}$', '?', '$\\dfrac{1}{2}$'];
      const tbl = SPM.table([['$\\' + which + '\\,\\theta$', ...row0]], { head: ['$\\theta$', '$30^\\circ$', '$45^\\circ$', '$60^\\circ$'], rowHead: true });
      return { q: SPM.cat(T('The table shows some exact values of a trigonometric ratio. Complete the table by finding the missing value.', 'Jadual menunjukkan beberapa nilai tepat sesuatu nisbah trigonometri. Lengkapkan jadual dengan mencari nilai yang tertinggal.'), T(tbl)), a: T(`$${midVal}$`), sp: 's' };
    },
    (r) => {
      const t = r.pick([25, 30, 40, 50, 60]);
      const s = round(Math.sin(rad(t)), 4), c = round(Math.cos(rad(t)), 4), tt = round(Math.tan(rad(t)), 4);
      return { q: T(`Given $\\sin ${t}^\\circ \\approx ${n(s)}$ and $\\cos ${t}^\\circ \\approx ${n(c)}$, use the identity $\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$ to find $\\tan ${t}^\\circ$, correct to 3 decimal places.`, `Diberi $\\sin ${t}^\\circ \\approx ${n(s)}$ dan $\\cos ${t}^\\circ \\approx ${n(c)}$, gunakan identiti $\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$ untuk mencari $\\tan ${t}^\\circ$, betul kepada 3 tempat perpuluhan.`), a: T(`$${n(round(s / c, 3))}$`), sp: 's' };
    },
    (r) => {
      const t = r.pick([['\\sin', 3, 5, 4], ['\\cos', 4, 5, 3], ['\\tan', 3, 4, 5], ['\\sin', 5, 13, 12], ['\\cos', 12, 13, 5]]);
      const [fn, u, v, w] = t;
      const want = r.pick(['cos', 'tan', 'sin'].filter((x) => `\\${x}` !== fn));
      let sinv, cosv, tanv;
      if (fn === '\\sin') { sinv = `\\dfrac{${u}}{${v}}`; cosv = `\\dfrac{${w}}{${v}}`; tanv = `\\dfrac{${u}}{${w}}`; }
      else if (fn === '\\cos') { cosv = `\\dfrac{${u}}{${v}}`; sinv = `\\dfrac{${w}}{${v}}`; tanv = `\\dfrac{${w}}{${u}}`; }
      else { tanv = `\\dfrac{${u}}{${v}}`; sinv = `\\dfrac{${u}}{${w}}`; cosv = `\\dfrac{${v}}{${w}}`; }
      const given = fn === '\\sin' ? sinv : fn === '\\cos' ? cosv : tanv;
      const ansV = want === 'sin' ? sinv : want === 'cos' ? cosv : tanv;
      return { q: T(`Given that $${fn}\\,\\theta = ${given}$ where $\\theta$ is acute, construct a right-angled triangle and find $\\${want}\\,\\theta$.`, `Diberi $${fn}\\,\\theta = ${given}$ dengan $\\theta$ ialah sudut tirus, bina segi tiga bersudut tegak dan cari $\\${want}\\,\\theta$.`), a: T(`$\\${want}\\,\\theta = ${ansV}$`), sp: 'm' };
    },
    (r) => {
      return { q: T(`Explain, in terms of the sides of a right-angled triangle, why $\\tan\\theta$ has no finite value when $\\theta = 90^\\circ$.`, `Terangkan, dari segi sisi-sisi sebuah segi tiga bersudut tegak, mengapa $\\tan\\theta$ tidak mempunyai nilai terhingga apabila $\\theta = 90^\\circ$.`), a: T('As $\\theta \\to 90^\\circ$, the adjacent side shrinks to 0, so $\\tan\\theta = \\dfrac{\\text{opposite}}{\\text{adjacent}}$ would need division by 0, which has no value.', 'Apabila $\\theta \\to 90^\\circ$, sisi bersebelahan mengecil kepada 0, jadi $\\tan\\theta = \\dfrac{\\text{bertentangan}}{\\text{bersebelahan}}$ memerlukan pembahagian dengan 0, yang tidak ditakrifkan.'), sp: 's' };
    },
    (r) => {
      const opts = [T('$\\dfrac{1}{\\sqrt{3}}$', '\\dfrac{1}{\\sqrt{3}}'), T('$\\sqrt{3}$', '\\sqrt{3}'), T('$\\dfrac{\\sqrt{3}}{3}$', '\\dfrac{\\sqrt{3}}{3}'), T('$3$', '3')];
      return { q: T(`Which of these are equal to $\\tan 30^\\circ$: $\\dfrac{1}{\\sqrt{3}}$, $\\sqrt{3}$, $\\dfrac{\\sqrt{3}}{3}$, or $3$? (There may be more than one.)`, `Yang manakah sama dengan $\\tan 30^\\circ$: $\\dfrac{1}{\\sqrt{3}}$, $\\sqrt{3}$, $\\dfrac{\\sqrt{3}}{3}$, atau $3$? (Mungkin lebih daripada satu.)`), a: T(`$\\dfrac{1}{\\sqrt{3}}$ and $\\dfrac{\\sqrt{3}}{3}$ (they are equivalent, rationalised forms).`, `$\\dfrac{1}{\\sqrt{3}}$ dan $\\dfrac{\\sqrt{3}}{3}$ (kedua-duanya bentuk setara yang telah dinisbahkan).`), sp: 's' };
    },
    (r) => {
      const bad = [['\\sin', 1.4], ['\\cos', -1.2], ['\\sin', 2], ['\\cos', 1.8]];
      const [fn, v] = r.pick(bad);
      return { q: T(`A student calculates $${fn} 50^\\circ$ and gets $${n(v)}$. Without using a calculator, explain why this result must be wrong.`, `Seorang murid mengira $${fn} 50^\\circ$ dan mendapat $${n(v)}$. Tanpa menggunakan kalkulator, terangkan mengapa keputusan ini pasti salah.`), a: T(`For any acute angle, $${fn}\\,\\theta$ must lie between 0 and 1 (it is a ratio of a shorter side to the hypotenuse), so a value of $${n(v)}$ is impossible.`, `Bagi mana-mana sudut tirus, $${fn}\\,\\theta$ mestilah di antara 0 dan 1 (ia nisbah sisi yang lebih pendek berbanding hipotenus), jadi nilai $${n(v)}$ adalah mustahil.`), sp: 's' };
    },
    (r) => {
      const fn = r.pick(['\\sin', '\\cos']), t30 = r.int(10, 40), t60 = 90 - t30;
      const other = fn === '\\sin' ? '\\cos' : '\\sin';
      return { q: T(`Given that $${fn} ${t30}^\\circ = ${other} ${t60}^\\circ$, explain this relationship using the two acute angles of a right-angled triangle.`, `Diberi $${fn} ${t30}^\\circ = ${other} ${t60}^\\circ$, terangkan perkaitan ini menggunakan dua sudut tirus segi tiga bersudut tegak.`), a: T(`The two acute angles sum to $90^\\circ$, so the side opposite $${t30}^\\circ$ is the side adjacent to $${t60}^\\circ$; both ratios use the same two sides over the same hypotenuse, so they are equal.`, `Dua sudut tirus itu berjumlah $90^\\circ$, jadi sisi bertentangan dengan $${t30}^\\circ$ ialah sisi bersebelahan dengan $${t60}^\\circ$; kedua-dua nisbah menggunakan dua sisi yang sama berbanding hipotenus yang sama, jadi kedua-duanya sama.`), sp: 'm' };
    },
    (r) => {
      const [a, b] = r.pick(TRI51.slice(0, 5)), ctx = r.pick(trigCtx), which = r.pick(['sin', 'cos', 'tan']);
      const fig = triFig({ ab: `${a} m`, bc: `${b} m`, ac: 'x', at: 'C', ang: '\\theta' });
      const c = Math.round(Math.hypot(a, b));
      const val = which === 'sin' ? `\\dfrac{${b}}{${c}}` : which === 'cos' ? `\\dfrac{${a}}{${c}}` : `\\dfrac{${b}}{${a}}`;
      return { q: T(`${ctx.en} forms a right-angled triangle with the ground, with two of the sides as shown. First find the length of the third side using Pythagoras' theorem, then find $\\${which}\\,\\theta$.`, `${ctx.ms} membentuk segi tiga bersudut tegak dengan tanah, dengan dua daripada sisinya seperti yang ditunjukkan. Cari dahulu panjang sisi ketiga menggunakan teorem Pythagoras, kemudian cari $\\${which}\\,\\theta$.`), fig, a: T(`Third side $= ${c}$ m; $\\${which}\\,\\theta = ${val}$`), sp: 'm' };
    },
    (r) => {
      const wrong = r.pick([['\\sin', T('opposite over adjacent', 'bertentangan berbanding bersebelahan')], ['\\cos', T('opposite over hypotenuse', 'bertentangan berbanding hipotenus')], ['\\tan', T('adjacent over hypotenuse', 'bersebelahan berbanding hipotenus')]]);
      const [fn, wr] = wrong, ctx = r.pick(trigCtx);
      const correct = fn === '\\sin' ? T('opposite over hypotenuse', 'bertentangan berbanding hipotenus') : fn === '\\cos' ? T('adjacent over hypotenuse', 'bersebelahan berbanding hipotenus') : T('opposite over adjacent', 'bertentangan berbanding bersebelahan');
      return { q: T(`For the right-angled triangle formed by ${ctx.en[0].toLowerCase() + ctx.en.slice(1)} and the ground, a student writes $${fn}\\,\\theta$ as ${wr.en}. Is this correct? Give the correct definition.`, `Bagi segi tiga bersudut tegak yang dibentuk oleh ${ctx.ms[0].toLowerCase() + ctx.ms.slice(1)} dan tanah, seorang murid menulis $${fn}\\,\\theta$ sebagai ${wr.ms}. Adakah ini betul? Berikan takrif yang betul.`), a: T(`No; $${fn}\\,\\theta$ is ${correct.en}.`, `Tidak; $${fn}\\,\\theta$ ialah ${correct.ms}.`), sp: 's' };
    },
    (r) => {
      const [a, b] = r.pick(TRI51.slice(0, 5)), ctx = r.pick(trigCtx);
      const bigger = b > a;
      return { q: T(`${ctx.en} makes an angle $\\theta$ with the ground. Without finding $\\theta$ exactly, state whether $\\theta$ is greater than or less than $45^\\circ$, given that the vertical rise is ${b} m and the horizontal run is ${a} m.`, `${ctx.ms} membentuk sudut $\\theta$ dengan tanah. Tanpa mencari $\\theta$ secara tepat, nyatakan sama ada $\\theta$ lebih besar atau lebih kecil daripada $45^\\circ$, diberi kenaikan menegak ialah ${b} m dan jarak mengufuk ialah ${a} m.`), a: T(`${bigger ? 'Greater' : 'Less'} than $45^\\circ$, since $\\tan\\theta = \\dfrac{${b}}{${a}}$ is ${bigger ? 'greater' : 'less'} than 1.`, `${bigger ? 'Lebih besar' : 'Lebih kecil'} daripada $45^\\circ$, kerana $\\tan\\theta = \\dfrac{${b}}{${a}}$ ${bigger ? 'lebih besar' : 'lebih kecil'} daripada 1.`), sp: 'm' };
    },
    (r) => {
      const [ctx1, ctx2] = r.sample(trigCtx, 2);
      const [p1, q1] = r.pick(TRI51.slice(0, 5)), [p2, q2] = r.pick(TRI51.slice(0, 5).filter((t) => t[1] / t[0] !== q1 / p1));
      const bigger1 = q1 / p1 > q2 / p2;
      return { q: T(`${ctx1.en} rises ${q1} m over a horizontal run of ${p1} m, while ${ctx2.en[0].toLowerCase() + ctx2.en.slice(1)} rises ${q2} m over a horizontal run of ${p2} m. Without calculating either angle exactly, state which one makes the larger angle with the ground.`, `${ctx1.ms} naik ${q1} m merentasi jarak mengufuk ${p1} m, manakala ${ctx2.ms[0].toLowerCase() + ctx2.ms.slice(1)} naik ${q2} m merentasi jarak mengufuk ${p2} m. Tanpa mengira mana-mana sudut secara tepat, nyatakan yang manakah membentuk sudut yang lebih besar dengan tanah.`), a: bigger1 ? T(`The first, since $\\dfrac{${q1}}{${p1}} > \\dfrac{${q2}}{${p2}}$ (its $\\tan\\theta$ is larger).`, `Yang pertama, kerana $\\dfrac{${q1}}{${p1}} > \\dfrac{${q2}}{${p2}}$ ($\\tan\\theta$ lebih besar).`) : T(`The second, since $\\dfrac{${q2}}{${p2}} > \\dfrac{${q1}}{${p1}}$ (its $\\tan\\theta$ is larger).`, `Yang kedua, kerana $\\dfrac{${q2}}{${p2}} > \\dfrac{${q1}}{${p1}}$ ($\\tan\\theta$ lebih besar).`), sp: 'm' };
    },
  ];
  const g51a = [
    (r) => {
      const t = r.pick([['\\sin', 3, 5, 4], ['\\sin', 5, 13, 12], ['\\sin', 8, 17, 15], ['\\cos', 4, 5, 3], ['\\cos', 12, 13, 5], ['\\tan', 3, 4, 5], ['\\tan', 5, 12, 13], ['\\tan', 20, 21, 29]]);
      const [fn, u, v, w] = t;
      let sinv, cosv, tanv;
      if (fn === '\\sin') { sinv = `\\dfrac{${u}}{${v}}`; cosv = `\\dfrac{${w}}{${v}}`; tanv = `\\dfrac{${u}}{${w}}`; }
      else if (fn === '\\cos') { cosv = `\\dfrac{${u}}{${v}}`; sinv = `\\dfrac{${w}}{${v}}`; tanv = `\\dfrac{${w}}{${u}}`; }
      else { tanv = `\\dfrac{${u}}{${v}}`; sinv = `\\dfrac{${u}}{${w}}`; cosv = `\\dfrac{${v}}{${w}}`; }
      const given = fn === '\\sin' ? sinv : fn === '\\cos' ? cosv : tanv;
      const others = fn === '\\sin' ? [`\\cos\\theta = ${cosv}`, `\\tan\\theta = ${tanv}`] : fn === '\\cos' ? [`\\sin\\theta = ${sinv}`, `\\tan\\theta = ${tanv}`] : [`\\sin\\theta = ${sinv}`, `\\cos\\theta = ${cosv}`];
      return { q: T(`Given that $${fn}\\,\\theta = ${given}$ where $\\theta$ is acute, find the other two trigonometric ratios by constructing a right-angled triangle. Hence, state whether $\\theta$ is greater than or less than $45^\\circ$.`, `Diberi $${fn}\\,\\theta = ${given}$ dengan $\\theta$ ialah sudut tirus, cari dua nisbah trigonometri yang lain dengan membina sebuah segi tiga bersudut tegak. Seterusnya, nyatakan sama ada $\\theta$ lebih besar atau lebih kecil daripada $45^\\circ$.`), a: T(`$${others.join(',\\quad ')}$; $\\theta$ is ${u < w || (fn === '\\tan' && u < v) ? 'less' : 'greater'} than $45^\\circ$ since $\\tan\\theta ${(fn === '\\tan' ? u / v : fn === '\\sin' ? u / w : v / u) < 1 ? '<' : '>'} 1$.`, `$${others.join(',\\quad ')}$; $\\theta$ ${(fn === '\\tan' ? u / v : fn === '\\sin' ? u / w : v / u) < 1 ? 'lebih kecil' : 'lebih besar'} daripada $45^\\circ$ kerana $\\tan\\theta ${(fn === '\\tan' ? u / v : fn === '\\sin' ? u / w : v / u) < 1 ? '<' : '>'} 1$.`), sp: 'l' };
    },
    (r) => {
      const t = r.pick([20, 35, 40, 55, 70]);
      return { q: T(`Use a calculator to find $\\sin ${t}^\\circ$, $\\cos ${t}^\\circ$ and $\\tan ${t}^\\circ$ correct to 4 decimal places. Verify that $\\tan ${t}^\\circ = \\dfrac{\\sin ${t}^\\circ}{\\cos ${t}^\\circ}$.`, `Gunakan kalkulator untuk mencari $\\sin ${t}^\\circ$, $\\cos ${t}^\\circ$ dan $\\tan ${t}^\\circ$ betul kepada 4 tempat perpuluhan. Sahkan bahawa $\\tan ${t}^\\circ = \\dfrac{\\sin ${t}^\\circ}{\\cos ${t}^\\circ}$.`), a: T(`${n(round(Math.sin(rad(t)), 4))}, ${n(round(Math.cos(rad(t)), 4))}, ${n(round(Math.tan(rad(t)), 4))}; $${n(round(Math.sin(rad(t)), 4))} \\div ${n(round(Math.cos(rad(t)), 4))} \\approx ${n(round(Math.tan(rad(t)), 3))}$`), sp: 'm' };
    },
    (r) => {
      const exprs = [
        [`\\sin 30^\\circ + \\cos 60^\\circ`, `1`],
        [`\\tan 45^\\circ \\times \\cos 60^\\circ`, `\\dfrac{1}{2}`],
        [`\\sin 60^\\circ \\times \\cos 30^\\circ`, `\\dfrac{3}{4}`],
        [`2\\sin 30^\\circ + \\tan 60^\\circ`, `1 + \\sqrt{3}`],
        [`\\cos 45^\\circ \\times \\sin 45^\\circ`, `\\dfrac{1}{2}`],
        [`\\tan 60^\\circ - \\tan 30^\\circ`, `\\dfrac{2\\sqrt{3}}{3}`],
        [`\\sin 90^\\circ - \\cos 0^\\circ`, `0`],
        [`3\\cos 60^\\circ + 2\\sin 0^\\circ`, `\\dfrac{3}{2}`],
        [`\\tan 0^\\circ + \\tan 45^\\circ + \\tan 60^\\circ`, `1 + \\sqrt{3}`],
        [`\\dfrac{\\sin 30^\\circ}{\\cos 30^\\circ}`, `\\dfrac{\\sqrt{3}}{3}`],
        [`(\\sin 45^\\circ)^2 + (\\cos 45^\\circ)^2`, `1`],
        [`\\cos 30^\\circ \\times \\cos 30^\\circ`, `\\dfrac{3}{4}`],
        [`4\\sin 30^\\circ \\times \\tan 45^\\circ`, `2`],
        [`\\tan 45^\\circ - \\sin 90^\\circ`, `0`],
        [`\\sin 60^\\circ \\div \\cos 60^\\circ`, `\\sqrt{3}`],
      ];
      const e = r.pick(exprs);
      return { q: T(`Without using a calculator, evaluate $${e[0]}$, giving your answer as an exact value.`, `Tanpa menggunakan kalkulator, nilaikan $${e[0]}$, dengan memberi jawapan anda sebagai nilai tepat.`), a: T(`$${e[1]}$`), w: T(`Substitute the exact special-angle values and simplify.`, `Gantikan nilai tepat sudut istimewa dan permudahkan.`), sp: 'm' };
    },
    (r) => {
      const t1 = r.pick([10, 20, 30]), t2 = 90 - t1;
      return { q: T(`Without a calculator, explain why $\\sin ${t1}^\\circ = \\cos ${t2}^\\circ$, using the fact that the two acute angles of a right-angled triangle sum to $90^\\circ$.`, `Tanpa kalkulator, terangkan mengapa $\\sin ${t1}^\\circ = \\cos ${t2}^\\circ$, dengan menggunakan hakikat bahawa dua sudut tirus segi tiga bersudut tegak berjumlah $90^\\circ$.`), a: T(`In a right-angled triangle with acute angles $${t1}^\\circ$ and $${t2}^\\circ$, the side opposite $${t1}^\\circ$ is the side adjacent to $${t2}^\\circ$, and both share the same hypotenuse, so $\\sin ${t1}^\\circ = \\dfrac{\\text{opp}}{\\text{hyp}} = \\cos ${t2}^\\circ$.`, `Dalam segi tiga bersudut tegak dengan sudut tirus $${t1}^\\circ$ dan $${t2}^\\circ$, sisi bertentangan dengan $${t1}^\\circ$ ialah sisi bersebelahan dengan $${t2}^\\circ$, dan kedua-duanya berkongsi hipotenus yang sama, jadi $\\sin ${t1}^\\circ = \\dfrac{\\text{bertentangan}}{\\text{hipotenus}} = \\cos ${t2}^\\circ$.`), sp: 'l' };
    },
    (r) => {
      return { q: T(`Show algebraically that $\\dfrac{1}{\\sqrt{3}}$ and $\\dfrac{\\sqrt{3}}{3}$ are equal, and explain why both are acceptable exact forms of $\\tan 30^\\circ$.`, `Tunjukkan secara algebra bahawa $\\dfrac{1}{\\sqrt{3}}$ dan $\\dfrac{\\sqrt{3}}{3}$ adalah sama, dan terangkan mengapa kedua-duanya bentuk tepat yang boleh diterima bagi $\\tan 30^\\circ$.`), a: T(`$\\dfrac{1}{\\sqrt{3}} = \\dfrac{1}{\\sqrt{3}} \\times \\dfrac{\\sqrt{3}}{\\sqrt{3}} = \\dfrac{\\sqrt{3}}{3}$; multiplying by $\\dfrac{\\sqrt{3}}{\\sqrt{3}} = 1$ rationalises the denominator without changing the value.`, `$\\dfrac{1}{\\sqrt{3}} = \\dfrac{1}{\\sqrt{3}} \\times \\dfrac{\\sqrt{3}}{\\sqrt{3}} = \\dfrac{\\sqrt{3}}{3}$; mendarab dengan $\\dfrac{\\sqrt{3}}{\\sqrt{3}} = 1$ menisbahkan penyebut tanpa mengubah nilai.`), sp: 'm' };
    },
    (r) => {
      const fn = r.pick(['\\sin', '\\cos', '\\tan']), v = fn === '\\tan' ? r.pick([0.36, 0.7, 1.19, 2.14]) : r.pick([0.34, 0.52, 0.71, 0.88]);
      const t = round((fn === '\\sin' ? Math.asin(v) : fn === '\\cos' ? Math.acos(v) : Math.atan(v)) * 180 / Math.PI, 1);
      return { q: T(`Given that $${fn}\\,\\theta = ${n(v)}$ where $\\theta$ is acute, use a calculator to find $\\theta$, correct to 1 decimal place.`, `Diberi $${fn}\\,\\theta = ${n(v)}$ dengan $\\theta$ ialah sudut tirus, gunakan kalkulator untuk mencari $\\theta$, betul kepada 1 tempat perpuluhan.`), a: T(`$\\theta = ${n(t)}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const [a, b, c] = r.pick(TRI51), ctx = r.pick(trigCtx);
      const fig = triFig({ ab: `${a} m`, bc: `${b} m`, ac: `${c} m`, at: 'C', ang: '\\theta' });
      const t = round((Math.atan(b / a) * 180) / Math.PI, 1);
      return { q: T(`${ctx.en} forms a right-angled triangle with the ground, with all three sides as shown. Find all three trigonometric ratios of $\\theta$ as fractions, and hence find $\\theta$ using a calculator, correct to 1 decimal place.`, `${ctx.ms} membentuk segi tiga bersudut tegak dengan tanah, dengan ketiga-tiga sisinya seperti yang ditunjukkan. Cari ketiga-tiga nisbah trigonometri $\\theta$ sebagai pecahan, dan seterusnya cari $\\theta$ menggunakan kalkulator, betul kepada 1 tempat perpuluhan.`), fig, a: T(`$\\sin\\theta = \\dfrac{${b}}{${c}}$, $\\cos\\theta = \\dfrac{${a}}{${c}}$, $\\tan\\theta = \\dfrac{${b}}{${a}}$; $\\theta = ${n(t)}^\\circ$`), sp: 'l' };
    },
    (r) => {
      const fn = r.pick(['\\sin', '\\cos', '\\tan']), ctx = r.pick(trigCtx);
      const trend = fn === '\\cos' ? T('decreases towards 0', 'menurun ke arah 0') : T('increases towards its maximum', 'meningkat ke arah maksimumnya');
      return { q: T(`For ${ctx.en[0].toLowerCase() + ctx.en.slice(1)}, if the angle $\\theta$ it makes with the ground increases (it becomes steeper), explain what happens to the value of $${fn}\\,\\theta$.`, `Bagi ${ctx.ms[0].toLowerCase() + ctx.ms.slice(1)}, jika sudut $\\theta$ yang dibentuknya dengan tanah semakin meningkat (menjadi lebih curam), terangkan apa yang berlaku kepada nilai $${fn}\\,\\theta$.`), a: T(`As $\\theta$ increases towards $90^\\circ$, $${fn}\\,\\theta$ ${trend.en}.`, `Apabila $\\theta$ meningkat ke arah $90^\\circ$, $${fn}\\,\\theta$ ${trend.ms}.`), sp: 'm' };
    },
    (r) => {
      const ctx = r.pick(trigCtx), [a, b, c] = r.pick(TRI51);
      const t = round((Math.atan(b / a) * 180) / Math.PI, 1);
      return { q: T(`${ctx.en} has length ${c} m (the hypotenuse of the right triangle it forms with the ground). If its foot is ${a} m from the base of the vertical object, find $\\theta$ using the inverse cosine function, correct to 1 decimal place, and verify your answer using the inverse tangent function instead.`, `${ctx.ms} berpanjang ${c} m (hipotenus segi tiga bersudut tegak yang dibentuknya dengan tanah). Jika kakinya berjarak ${a} m dari tapak objek menegak itu, cari $\\theta$ menggunakan fungsi kosinus songsang, betul kepada 1 tempat perpuluhan, dan sahkan jawapan anda menggunakan fungsi tangen songsang.`), a: T(`$\\theta = \\cos^{-1}\\left(\\dfrac{${a}}{${c}}\\right) = ${n(t)}^\\circ$; check: $\\tan^{-1}\\left(\\dfrac{${b}}{${a}}\\right) = ${n(t)}^\\circ$ also.`, `$\\theta = \\cos^{-1}\\left(\\dfrac{${a}}{${c}}\\right) = ${n(t)}^\\circ$; semak: $\\tan^{-1}\\left(\\dfrac{${b}}{${a}}\\right) = ${n(t)}^\\circ$ juga.`), sp: 'l' };
    },
    (r) => {
      const [ctx1, ctx2] = r.sample(trigCtx, 2);
      const [p1, q1, h1] = r.pick(TRI51), [p2, q2, h2] = r.pick(TRI51.filter((t) => t[1] / t[0] !== q1 / p1));
      const t1 = round((Math.atan(q1 / p1) * 180) / Math.PI, 1), t2 = round((Math.atan(q2 / p2) * 180) / Math.PI, 1);
      return { q: T(`${ctx1.en} rises ${q1} m over a horizontal run of ${p1} m, while ${ctx2.en[0].toLowerCase() + ctx2.en.slice(1)} rises ${q2} m over a horizontal run of ${p2} m. Calculate the angle each makes with the ground, correct to 1 decimal place, and state the difference between the two angles.`, `${ctx1.ms} naik ${q1} m merentasi jarak mengufuk ${p1} m, manakala ${ctx2.ms[0].toLowerCase() + ctx2.ms.slice(1)} naik ${q2} m merentasi jarak mengufuk ${p2} m. Kira sudut yang dibentuk oleh setiap satu dengan tanah, betul kepada 1 tempat perpuluhan, dan nyatakan perbezaan antara kedua-dua sudut itu.`), a: T(`$${n(t1)}^\\circ$ and $${n(t2)}^\\circ$; difference $= ${n(round(Math.abs(t1 - t2), 1))}^\\circ$`, `$${n(t1)}^\\circ$ dan $${n(t2)}^\\circ$; perbezaan $= ${n(round(Math.abs(t1 - t2), 1))}^\\circ$`), sp: 'l' };
    },
  ];
  SPM.extend('F3-5.1', { e: g51e, m: g51m, a: g51a });

  /* =============================================================== 5.2 : Applications of Trigonometric Ratios */
  const towerCtx = [T('a tree', 'sebuah pokok'), T('a flagpole', 'sebuah tiang bendera'), T('a building', 'sebuah bangunan'), T('a tower', 'sebuah menara'), T('a mosque minaret', 'sebuah menara masjid'), T('a factory chimney', 'sebuah cerobong kilang'), T('a lighthouse', 'sebuah rumah api'), T('a communications mast', 'sebuah tiang komunikasi'), T('a coconut tree', 'sebuah pokok kelapa'), T('a water tower', 'sebuah menara air')];
  const stringCtx = [T('A kite string', 'Tali layang-layang'), T('A guy wire', 'Seutas tali penyokong'), T('A support cable', 'Sebuah kabel penyokong'), T('A zip-line cable', 'Sebuah kabel zip-line'), T('A tent rope', 'Seutas tali khemah'), T('A mooring rope', 'Seutas tali pengikat'), T('A clothes line', 'Seutas tali kain'), T('An anchor chain', 'Seutas rantai sauh')];
  const gE = (r) => r.pick([25, 30, 35, 40, 50, 55, 60, 65]);
  const g52e = [
    (r) => {
      const t = gE(r), adj = r.int(5, 20), ctx = r.pick(towerCtx);
      const fig = triFig({ bc: `${adj} m`, ab: 'x', at: 'C', ang: `${t}^\\circ` });
      const x = adj * Math.tan(rad(t));
      return { q: T(`A wire is fixed from the top of ${ctx.en} to a point on the ground ${adj} m from its base, making an angle of $${t}^\\circ$ with the ground. Find the height $x$ of ${ctx.en.replace('a ', 'the ')}, correct to 2 decimal places.`, `Seutas dawai dipasang dari puncak ${ctx.ms} ke satu titik di tanah yang berjarak ${adj} m dari tapaknya, membentuk sudut $${t}^\\circ$ dengan tanah. Cari tinggi $x$ ${ctx.ms.replace('sebuah ', '')}, betul kepada 2 tempat perpuluhan.`), a: T(`$x = ${n(round(x, 2))}$ m`), w: T(`$\\tan ${t}^\\circ = \\dfrac{x}{${adj}}$`), sp: 's' };
    },
    (r) => {
      const t = gE(r), hyp = r.int(6, 20), sc = r.pick(stringCtx);
      const x = hyp * Math.sin(rad(t));
      const fig = triFig({ ac: `${hyp} m`, ab: 'x', at: 'C', ang: `${t}^\\circ` });
      return { q: T(`${sc.en} of length ${hyp} m is pulled taut and makes an angle of $${t}^\\circ$ with the ground. Find the height $x$ of its top point above the ground, correct to 2 decimal places.`, `${sc.ms} sepanjang ${hyp} m ditegangkan dan membentuk sudut $${t}^\\circ$ dengan tanah. Cari ketinggian $x$ hujung atasnya dari tanah, betul kepada 2 tempat perpuluhan.`), fig, a: T(`$x = ${n(round(x, 2))}$ m`), w: T(`$\\sin ${t}^\\circ = \\dfrac{x}{${hyp}}$`), sp: 's' };
    },
    (r) => {
      const t = gE(r), hyp = r.int(6, 20);
      const x = hyp * Math.cos(rad(t));
      const fig = triFig({ ac: `${hyp} m`, bc: 'x', at: 'A', ang: `${t}^\\circ` });
      return { q: T(`A ladder of length ${hyp} m leans against a wall, making an angle of $${t}^\\circ$ with the ground. Find the horizontal distance $x$ from the foot of the ladder to the wall, correct to 2 decimal places.`, `Sebuah tangga sepanjang ${hyp} m bersandar pada dinding, membentuk sudut $${t}^\\circ$ dengan tanah. Cari jarak mengufuk $x$ dari kaki tangga ke dinding, betul kepada 2 tempat perpuluhan.`), fig, a: T(`$x = ${n(round(x, 2))}$ m`), w: T(`$\\cos ${t}^\\circ = \\dfrac{x}{${hyp}}$`), sp: 's' };
    },
    (r) => {
      const t = gE(r), adj = r.int(5, 20), sc = r.pick(stringCtx);
      const x = adj / Math.cos(rad(t));
      const fig = triFig({ ab: `${adj} m`, ac: 'x', at: 'C', ang: `${t}^\\circ` });
      return { q: T(`${sc.en} runs from a point ${adj} m from the base of a pole to the top of the pole, making an angle of $${t}^\\circ$ with the ground. Write the equation linking $x$ (the length of ${sc.en.toLowerCase()}), ${adj} and $${t}^\\circ$, then find $x$ correct to 2 decimal places.`, `${sc.ms} terbentang dari satu titik yang berjarak ${adj} m dari tapak sebatang tiang ke puncak tiang itu, membentuk sudut $${t}^\\circ$ dengan tanah. Tulis persamaan yang menghubungkan $x$ (panjang ${sc.ms.toLowerCase()}), ${adj} dan $${t}^\\circ$, kemudian cari $x$ betul kepada 2 tempat perpuluhan.`), fig, a: T(`$\\cos ${t}^\\circ = \\dfrac{${adj}}{x}$; $x = ${n(round(x, 2))}$ m`), sp: 's' };
    },
    (r) => {
      const [ctx1, ctx2] = r.sample(towerCtx, 2), t1 = gE(r), t2 = gE(r);
      const d1 = r.int(5, 20), d2 = r.int(5, 20);
      const h1 = round(d1 * Math.tan(rad(t1)), 2), h2 = round(d2 * Math.tan(rad(t2)), 2);
      need(h1 !== h2);
      const larger = h1 > h2;
      return { q: T(`A wire to the top of ${ctx1.en} makes an angle of $${t1}^\\circ$ with the ground from a point ${d1} m away, while a wire to the top of ${ctx2.en[0].toLowerCase() + ctx2.en.slice(1)} makes an angle of $${t2}^\\circ$ from a point ${d2} m away. Without calculating exactly, and then by calculating, state which one is taller.`, `Dawai ke puncak ${ctx1.ms} membentuk sudut $${t1}^\\circ$ dengan tanah dari satu titik yang berjarak ${d1} m, manakala dawai ke puncak ${ctx2.ms[0].toLowerCase() + ctx2.ms.slice(1)} membentuk sudut $${t2}^\\circ$ dari satu titik yang berjarak ${d2} m. Tanpa mengira secara tepat, dan kemudian dengan mengira, nyatakan yang manakah lebih tinggi.`), a: T(`${larger ? 'The first' : 'The second'}: heights are ${n(h1)} m and ${n(h2)} m.`, `${larger ? 'Yang pertama' : 'Yang kedua'}: tingginya ialah ${n(h1)} m dan ${n(h2)} m.`), sp: 's' };
    },
    (r) => {
      const t = gE(r), adj = r.int(5, 20), fn = r.pick(['\\sin', '\\cos', '\\tan']);
      return { q: T(`In a right-angled triangle, an acute angle is $${t}^\\circ$ and the side involved with the known length ${adj} m gives $${fn} ${t}^\\circ = \\dfrac{x}{${adj}}$. Write down the value of $x$ without simplifying, then evaluate it correct to 2 decimal places.`, `Dalam sebuah segi tiga bersudut tegak, satu sudut tirus ialah $${t}^\\circ$ dan sisi yang terlibat dengan panjang ${adj} m yang diketahui memberikan $${fn} ${t}^\\circ = \\dfrac{x}{${adj}}$. Tuliskan nilai $x$ tanpa memudahkan, kemudian nilaikan betul kepada 2 tempat perpuluhan.`), a: T(`$x = ${adj} ${fn === '\\sin' ? '\\sin' : fn === '\\cos' ? '\\cos' : '\\tan'} ${t}^\\circ = ${n(round(adj * (fn === '\\sin' ? Math.sin(rad(t)) : fn === '\\cos' ? Math.cos(rad(t)) : Math.tan(rad(t))), 2))}$`), sp: 's' };
    },
    (r) => {
      const t = gE(r), hyp = r.int(8, 20), ctx = r.pick(towerCtx);
      const opp = round(hyp * Math.sin(rad(t)), 2), adj = round(hyp * Math.cos(rad(t)), 2);
      return { q: T(`A support cable of length ${hyp} m runs from the top of ${ctx.en} to the ground, making an angle of $${t}^\\circ$ with the ground. Which ratio (sine, cosine or tangent) should be used to find the height of ${ctx.en.replace('a ', 'the ')}? Do not solve.`, `Kabel penyokong sepanjang ${hyp} m dipasang dari puncak ${ctx.ms} ke tanah, membentuk sudut $${t}^\\circ$ dengan tanah. Nisbah manakah (sin, kos atau tan) yang patut digunakan untuk mencari tinggi ${ctx.ms.replace('sebuah ', '')}? Jangan selesaikan.`), a: T('Sine, since the height is opposite the angle and the cable length is the hypotenuse.', 'Sin, kerana tinggi itu bertentangan dengan sudut dan panjang kabel ialah hipotenus.'), sp: 'xs' };
    },
    (r) => {
      const t = gE(r), adj = r.int(5, 20), ctx = r.pick(towerCtx);
      const larger = t > 45;
      return { q: T(`${SPM.cap(ctx.en)} casts a line of sight from its top to a point ${adj} m from its base at an angle of $${t}^\\circ$ to the ground. Without calculating, state whether the height of ${ctx.en.replace('a ', 'the ')} is larger or smaller than ${adj} m.`, `${SPM.cap(ctx.ms)} membentuk garis pandang dari puncaknya ke satu titik yang berjarak ${adj} m dari tapaknya pada sudut $${t}^\\circ$ dengan tanah. Tanpa mengira, nyatakan sama ada tinggi ${ctx.ms.replace('sebuah ', '')} adalah lebih besar atau lebih kecil daripada ${adj} m.`), a: T(`${larger ? 'Larger' : 'Smaller'}, since $\\tan ${t}^\\circ$ is ${larger ? 'greater' : 'less'} than 1.`, `${larger ? 'Lebih besar' : 'Lebih kecil'}, kerana $\\tan ${t}^\\circ$ ${larger ? 'lebih besar' : 'lebih kecil'} daripada 1.`), sp: 's' };
    },
  ];
  const g52m = [
    (r) => {
      const t = gE(r), adj = r.int(5, 18), sc = r.pick(stringCtx);
      const hyp = adj / Math.cos(rad(t));
      const fig = triFig({ ab: `${adj} m`, ac: 'x', at: 'C', ang: `${t}^\\circ` });
      return { q: T(`${sc.en} is stretched from a point ${adj} m from the base of a post to the top of the post, making an angle of $${t}^\\circ$ with the ground, as shown. Find its length $x$, correct to 2 decimal places.`, `${sc.ms} direntang dari satu titik yang berjarak ${adj} m dari tapak sebatang tiang ke puncak tiang itu, membentuk sudut $${t}^\\circ$ dengan tanah, seperti yang ditunjukkan. Cari panjangnya $x$, betul kepada 2 tempat perpuluhan.`), fig, a: T(`$x = ${n(round(hyp, 2))}$ m`), w: T(`$\\cos ${t}^\\circ = \\dfrac{${adj}}{x}$, so $x = \\dfrac{${adj}}{\\cos ${t}^\\circ}$`), sp: 's' };
    },
    (r) => {
      const t = gE(r), opp = r.int(4, 15), ctx = r.pick(towerCtx);
      const hyp = opp / Math.sin(rad(t));
      const fig = triFig({ ab: `${opp} m`, ac: 'x', at: 'C', ang: `${t}^\\circ` });
      return { q: T(`A cable of length $x$ runs from a point on the ground to the top of ${ctx.en}, which is ${opp} m tall, making an angle of $${t}^\\circ$ with the ground. Find the length of the cable, correct to 2 decimal places.`, `Sebuah kabel sepanjang $x$ terbentang dari satu titik di tanah ke puncak ${ctx.ms} yang setinggi ${opp} m, membentuk sudut $${t}^\\circ$ dengan tanah. Cari panjang kabel itu, betul kepada 2 tempat perpuluhan.`), fig, a: T(`$x = ${n(round(hyp, 2))}$ m`), w: T(`$\\sin ${t}^\\circ = \\dfrac{${opp}}{x}$, so $x = \\dfrac{${opp}}{\\sin ${t}^\\circ}$`), sp: 's' };
    },
    (r) => {
      const t = gE(r), opp = r.int(4, 15), ctx = r.pick(towerCtx);
      const adj = opp / Math.tan(rad(t));
      const fig = triFig({ bc: 'x', ab: `${opp} m`, at: 'C', ang: `${t}^\\circ` });
      return { q: T(`From a point $x$ m from the base of ${ctx.en}, which is ${opp} m tall, the angle to the top is $${t}^\\circ$. Find $x$, correct to 2 decimal places.`, `Dari satu titik yang berjarak $x$ m dari tapak ${ctx.ms} yang setinggi ${opp} m, sudut ke puncaknya ialah $${t}^\\circ$. Cari $x$, betul kepada 2 tempat perpuluhan.`), fig, a: T(`$x = ${n(round(adj, 2))}$ m`), w: T(`$\\tan ${t}^\\circ = \\dfrac{${opp}}{x}$, so $x = \\dfrac{${opp}}{\\tan ${t}^\\circ}$`), sp: 's' };
    },
    (r) => {
      const [a, b] = r.pick([[3, 4], [5, 8], [7, 10], [6, 11], [9, 14]]), ctx = r.pick(towerCtx);
      const ang = (Math.atan(a / b) * 180) / Math.PI;
      const fig = triFig({ ab: `${a} m`, bc: `${b} m`, at: 'C', ang: '\\theta' });
      return { q: T(`${SPM.cap(ctx.en)} is ${a} m tall and stands ${b} m from an observer. Find the angle of elevation $\\theta$ of the top of ${ctx.en.replace('a ', 'the ')} from the observer, correct to 1 decimal place.`, `${SPM.cap(ctx.ms)} setinggi ${a} m berdiri sejauh ${b} m dari seorang pemerhati. Cari sudut dongakan $\\theta$ ke puncak ${ctx.ms.replace('sebuah ', '')} dari pemerhati itu, betul kepada 1 tempat perpuluhan.`), fig, a: T(`$\\theta = ${n(round(ang, 1))}^\\circ$`), w: T(`$\\tan\\theta = \\dfrac{${a}}{${b}}$`), sp: 's' };
    },
    (r) => {
      const [a, c] = r.pick([[3, 5], [5, 13], [8, 17], [6, 10], [9, 15]]), sc = r.pick(stringCtx);
      const ang = (Math.acos(a / c) * 180) / Math.PI;
      const fig = triFig({ ab: `${a} m`, ac: `${c} m`, at: 'A', ang: '\\theta' });
      return { q: T(`${sc.en} of length ${c} m is anchored ${a} m from the base of a post. Find the angle $\\theta$ it makes with the ground, correct to 1 decimal place.`, `${sc.ms} sepanjang ${c} m disauh pada jarak ${a} m dari tapak sebatang tiang. Cari sudut $\\theta$ yang dibentuknya dengan tanah, betul kepada 1 tempat perpuluhan.`), fig, a: T(`$\\theta = ${n(round(ang, 1))}^\\circ$`), w: T(`$\\cos\\theta = \\dfrac{${a}}{${c}}$`), sp: 's' };
    },
    (r) => {
      const hyp = r.pick([3, 3.5, 4, 4.5, 5]), t = gE(r), windowH = r.pick([2, 2.5, 3]);
      const reach = round(hyp * Math.sin(rad(t)), 2);
      const safe = reach >= windowH;
      return { q: T(`A ladder of length ${n(hyp)} m is placed against a wall at an angle of $${t}^\\circ$ to the ground. A window sill is ${n(windowH)} m above the ground. Find the height the ladder reaches, and state whether it is high enough to reach the window sill.`, `Sebuah tangga sepanjang ${n(hyp)} m disandarkan pada dinding pada sudut $${t}^\\circ$ dengan tanah. Bingkai tingkap berada ${n(windowH)} m dari tanah. Cari tinggi yang dicapai oleh tangga itu, dan nyatakan sama ada ia cukup tinggi untuk mencapai bingkai tingkap.`), a: T(`${n(reach)} m; ${safe ? 'high enough' : 'not high enough'}.`, `${n(reach)} m; ${safe ? 'cukup tinggi' : 'tidak cukup tinggi'}.`), sp: 'm' };
    },
    (r) => {
      const h = r.int(6, 20), s = r.int(4, 15), ctx = r.pick(towerCtx);
      const ang = round((Math.atan(h / s) * 180) / Math.PI, 1);
      return { q: T(`${SPM.cap(ctx.en)} of height ${h} m casts a shadow ${s} m long on level ground. Find the angle of elevation of the sun, correct to 1 decimal place.`, `${SPM.cap(ctx.ms)} setinggi ${h} m membentuk bayang sepanjang ${s} m di atas tanah yang rata. Cari sudut dongakan matahari, betul kepada 1 tempat perpuluhan.`), a: T(`$${n(ang)}^\\circ$`), w: T(`$\\tan\\theta = \\dfrac{${h}}{${s}}$`), sp: 'm' };
    },
    (r) => {
      const w = r.int(4, 10), l = r.int(w + 2, 16);
      const ang = round((Math.atan(w / l) * 180) / Math.PI, 1);
      const diag = round(Math.hypot(w, l), 2);
      return { q: SPM.cat(T(`A rectangular field measures ${l} m by ${w} m. Find `, `Sebuah padang segi empat tepat berukuran ${l} m kali ${w} m. Cari `), SPM.parts([T('the length of the diagonal, correct to 2 decimal places', 'panjang pepenjuru, betul kepada 2 tempat perpuluhan'), T('the angle the diagonal makes with the longer side, correct to 1 decimal place', 'sudut yang dibentuk oleh pepenjuru dengan sisi yang lebih panjang, betul kepada 1 tempat perpuluhan')])), a: T(`(a) ${n(diag)} m (b) ${n(ang)}$^\\circ$`, `(a) ${n(diag)} m (b) ${n(ang)}$^\\circ$`), sp: 'm' };
    },
    (r) => {
      const t = gE(r), hyp = r.int(6, 20);
      const opp = round(hyp * Math.sin(rad(t)), 2), adj = round(hyp * Math.cos(rad(t)), 2);
      const fig = triFig({ ac: `${hyp} m`, ab: 'x', at: 'C', ang: `${t}^\\circ` });
      return { q: SPM.cat(T(`A rope of length ${hyp} m is anchored to the ground and makes an angle of $${t}^\\circ$ with the ground. Find `, `Seutas tali sepanjang ${hyp} m disauh ke tanah dan membentuk sudut $${t}^\\circ$ dengan tanah. Cari `), SPM.parts([T('the height of the top of the rope above the ground, correct to 2 decimal places', 'tinggi hujung atas tali dari tanah, betul kepada 2 tempat perpuluhan'), T('the horizontal distance from the anchor point to the point directly below the top, correct to 2 decimal places', 'jarak mengufuk dari titik sauh ke titik tepat di bawah hujung atas, betul kepada 2 tempat perpuluhan')])), fig, a: T(`(a) ${n(opp)} m (b) ${n(adj)} m`, `(a) ${n(opp)} m (b) ${n(adj)} m`), sp: 'm' };
    },
    (r) => {
      const [ctx1, ctx2] = r.sample(towerCtx, 2);
      const h1 = r.int(8, 25), d1 = r.int(4, 15), h2 = r.int(8, 25), d2 = r.int(4, 15);
      const ang1 = round((Math.atan(h1 / d1) * 180) / Math.PI, 1), ang2 = round((Math.atan(h2 / d2) * 180) / Math.PI, 1);
      need(ang1 !== ang2);
      const larger = ang1 > ang2;
      return { q: T(`${ctx1.en[0].toUpperCase() + ctx1.en.slice(1)} of height ${h1} m is viewed from a point ${d1} m from its base, and ${ctx2.en[0].toLowerCase() + ctx2.en.slice(1)} of height ${h2} m is viewed from a point ${d2} m from its base. Calculate the angle of elevation in each case, correct to 1 decimal place, and state which angle is larger.`, `${ctx1.ms[0].toUpperCase() + ctx1.ms.slice(1)} setinggi ${h1} m dilihat dari satu titik yang berjarak ${d1} m dari tapaknya, dan ${ctx2.ms[0].toLowerCase() + ctx2.ms.slice(1)} setinggi ${h2} m dilihat dari satu titik yang berjarak ${d2} m dari tapaknya. Kira sudut dongakan bagi setiap kes, betul kepada 1 tempat perpuluhan, dan nyatakan sudut manakah yang lebih besar.`), a: T(`$${n(ang1)}^\\circ$ and $${n(ang2)}^\\circ$; the ${larger ? 'first' : 'second'} is larger.`, `$${n(ang1)}^\\circ$ dan $${n(ang2)}^\\circ$; yang ${larger ? 'pertama' : 'kedua'} lebih besar.`), sp: 'm' };
    },
    (r) => {
      const h = r.int(6, 20), s = r.int(4, 15), claim = r.int(20, 70), ctx = r.pick(towerCtx);
      const actual = round((Math.atan(h / s) * 180) / Math.PI, 1);
      const ok = Math.abs(actual - claim) < 0.5;
      return { q: T(`${SPM.cap(ctx.en)} of height ${h} m casts a shadow ${s} m long. A student estimates the angle of elevation of the sun to be $${claim}^\\circ$. Calculate the actual angle, correct to 1 decimal place, and state whether the student's estimate is reasonable (within $0.5^\\circ$).`, `${SPM.cap(ctx.ms)} setinggi ${h} m membentuk bayang sepanjang ${s} m. Seorang murid menganggarkan sudut dongakan matahari sebagai $${claim}^\\circ$. Kira sudut sebenar, betul kepada 1 tempat perpuluhan, dan nyatakan sama ada anggaran murid itu munasabah (dalam lingkungan $0.5^\\circ$).`), a: T(`$${n(actual)}^\\circ$; the estimate is ${ok ? 'reasonable' : 'not reasonable'}.`, `$${n(actual)}^\\circ$; anggaran itu ${ok ? 'munasabah' : 'tidak munasabah'}.`), sp: 'm' };
    },
  ];
  const groundObjCtx = [T('a boat', 'sebuah bot'), T('a car', 'sebuah kereta'), T('a buoy', 'sebuah pelampung'), T('a cyclist', 'seorang penunggang basikal'), T('a swimmer', 'seorang perenang'), T('a small fishing boat', 'sebuah bot nelayan kecil'), T('a kayak', 'sebuah kayak')];
  const g52a = [
    (r) => {
      const d = r.int(20, 60), t = r.pick([25, 30, 35, 40, 50]), ctx = r.pick(towerCtx);
      const h = round(d * Math.tan(rad(t)), 2);
      const fig = sceneFig(d, h, `${t}^\\circ`, 'elev');
      return { q: T(`From a point on level ground ${d} m from the foot of ${ctx.en}, the angle of elevation of the top is $${t}^\\circ$, as shown. Find the height of ${ctx.en.replace('a ', 'the ')}, correct to 2 decimal places.`, `Dari satu titik di tanah rata yang berjarak ${d} m dari kaki ${ctx.ms}, sudut dongakan puncaknya ialah $${t}^\\circ$, seperti yang ditunjukkan. Cari tinggi ${ctx.ms.replace('sebuah ', '')}, betul kepada 2 tempat perpuluhan.`), fig, a: T(`${n(h)} m`), w: T(`$\\tan ${t}^\\circ = \\dfrac{h}{${d}}$`), sp: 'm' };
    },
    (r) => {
      const h = r.int(15, 50), t = r.pick([20, 25, 30, 35, 40]), ctx = r.pick(groundObjCtx), tw = r.pick(towerCtx.filter((x) => x.en !== 'a tree' && x.en !== 'a coconut tree'));
      const d = round(h / Math.tan(rad(t)), 2);
      const fig = sceneFig(d > 40 ? 40 : d, h, `${t}^\\circ`, 'dep');
      return { q: T(`From the top of ${tw.en}, of height ${h} m, the angle of depression of ${ctx.en} on the water/ground is $${t}^\\circ$, as shown. Find the horizontal distance from the foot of ${tw.en.replace('a ', 'the ')} to ${ctx.en}, correct to 2 decimal places.`, `Dari puncak ${tw.ms} setinggi ${h} m, sudut tunduk ${ctx.ms} di air/tanah ialah $${t}^\\circ$, seperti yang ditunjukkan. Cari jarak mengufuk dari kaki ${tw.ms.replace('sebuah ', '')} ke ${ctx.ms}, betul kepada 2 tempat perpuluhan.`), fig, a: T(`${n(d)} m`), w: T(`$\\tan ${t}^\\circ = \\dfrac{${h}}{d}$`), sp: 'm' };
    },
    (r) => {
      const H = r.int(10, 20), d = r.int(15, 40), t1 = r.pick([15, 20, 25]), t2 = r.pick([35, 40, 45]);
      need(t2 > t1);
      const tw = r.pick(towerCtx.filter((x) => x.en === 'a tower' || x.en === 'a communications mast' || x.en === 'a lighthouse'));
      const dist = H / Math.tan(rad(t1));
      const extraH = dist * Math.tan(rad(t2));
      const total = round(H + extraH, 2);
      return { q: T(`From the top of a building of height ${H} m, the angle of depression of the base of ${tw.en} nearby is $${t1}^\\circ$, and the angle of elevation of the top of ${tw.en.replace('a ', 'the ')} is $${t2}^\\circ$. Find the height of ${tw.en.replace('a ', 'the ')}, correct to 2 decimal places.`, `Dari puncak sebuah bangunan setinggi ${H} m, sudut tunduk ke tapak ${tw.ms} yang berdekatan ialah $${t1}^\\circ$, dan sudut dongak ke puncak ${tw.ms.replace('sebuah ', '')} ialah $${t2}^\\circ$. Cari tinggi ${tw.ms.replace('sebuah ', '')}, betul kepada 2 tempat perpuluhan.`), a: T(`${n(total)} m`), w: T(`Distance $= \\dfrac{${H}}{\\tan ${t1}^\\circ} = ${n(round(dist, 2))}$ m; extra height $= ${n(round(dist, 2))} \\times \\tan ${t2}^\\circ$; total $= ${H} + $ extra`), sp: 'l' };
    },
    (r) => {
      const L = r.pick([4, 4.5, 5, 5.5, 6]), t1 = r.pick([50, 55, 60]), t2 = r.pick([30, 35, 40]);
      need(t2 < t1);
      const h1 = round(L * Math.sin(rad(t1)), 2), h2 = round(L * Math.sin(rad(t2)), 2);
      const drop = round(h1 - h2, 2);
      return { q: T(`A ladder of fixed length ${n(L)} m leans against a wall at an angle of $${t1}^\\circ$ to the ground. The foot of the ladder is then pulled away from the wall until it makes an angle of $${t2}^\\circ$ instead. Find how much lower the top of the ladder now rests on the wall, correct to 2 decimal places.`, `Sebuah tangga bersaiz tetap ${n(L)} m bersandar pada dinding pada sudut $${t1}^\\circ$ dengan tanah. Kaki tangga itu kemudian ditarik menjauhi dinding sehingga ia membentuk sudut $${t2}^\\circ$ pula. Cari berapa lebih rendah hujung atas tangga itu berada pada dinding sekarang, betul kepada 2 tempat perpuluhan.`), a: T(`${n(drop)} m`), w: T(`$${n(L)}\\sin ${t1}^\\circ - ${n(L)}\\sin ${t2}^\\circ$`), sp: 'l' };
    },
    (r) => {
      const l = r.int(6, 12), w = r.int(4, l - 1), h = r.int(3, 8);
      const bd = round(Math.hypot(l, w), 2);
      const ang = round((Math.atan(h / bd) * 180) / Math.PI, 1);
      const fig = cuboidFig({ lLab: `${l} cm`, wLab: `${w} cm`, hLab: `${h} cm`, diag: 'base' });
      return { q: T(`The diagram shows a cuboid with length ${l} cm, width ${w} cm and height ${h} cm. Find (a) the length of the base diagonal, correct to 2 decimal places, (b) the angle between the space diagonal and the base, correct to 1 decimal place.`, `Rajah menunjukkan sebuah kuboid dengan panjang ${l} cm, lebar ${w} cm dan tinggi ${h} cm. Cari (a) panjang pepenjuru tapak, betul kepada 2 tempat perpuluhan, (b) sudut antara pepenjuru ruang dengan tapak, betul kepada 1 tempat perpuluhan.`), fig, a: T(`(a) ${n(bd)} cm (b) ${n(ang)}$^\\circ$`, `(a) ${n(bd)} cm (b) ${n(ang)}$^\\circ$`), w: T(`Base diagonal $= \\sqrt{${l}^2 + ${w}^2}$; angle $= \\tan^{-1}\\left(\\dfrac{${h}}{\\text{base diagonal}}\\right)$`), sp: 'l' };
    },
    (r) => {
      const l = r.int(6, 12), w = r.int(4, l - 1), h = r.int(3, 8);
      const bd = Math.hypot(l, w);
      const sd = round(Math.hypot(bd, h), 2);
      const ang = round((Math.asin(h / Math.hypot(bd, h)) * 180) / Math.PI, 1);
      const fig = cuboidFig({ lLab: `${l} cm`, wLab: `${w} cm`, hLab: `${h} cm`, diag: 'space' });
      return { q: T(`The diagram shows a cuboid with length ${l} cm, width ${w} cm and height ${h} cm. Find the length of the space diagonal (shown), correct to 2 decimal places, and the angle it makes with the base, correct to 1 decimal place.`, `Rajah menunjukkan sebuah kuboid dengan panjang ${l} cm, lebar ${w} cm dan tinggi ${h} cm. Cari panjang pepenjuru ruang (ditunjukkan), betul kepada 2 tempat perpuluhan, dan sudut yang dibentuknya dengan tapak, betul kepada 1 tempat perpuluhan.`), fig, a: T(`${n(sd)} cm; ${n(ang)}$^\\circ$`, `${n(sd)} cm; ${n(ang)}$^\\circ$`), w: T(`Base diagonal $= \\sqrt{${l}^2+${w}^2} = ${n(round(bd, 2))}$ cm; space diagonal $= \\sqrt{${n(round(bd, 2))}^2 + ${h}^2}$`), sp: 'l' };
    },
    (r) => {
      const base = r.pick([6, 8, 10]), height = r.int(4, 10);
      const halfDiag = round((base * Math.SQRT2) / 2, 2);
      const slant = round(Math.hypot(halfDiag, height), 2);
      const ang = round((Math.atan(height / halfDiag) * 180) / Math.PI, 1);
      return { q: T(`A right pyramid has a square base of side ${base} cm and height ${height} cm (measured from the centre of the base to the apex). Find the angle between a slant edge (from a base corner to the apex) and the base, correct to 1 decimal place.`, `Sebuah piramid tegak mempunyai tapak segi empat sama bersisi ${base} cm dan tinggi ${height} cm (diukur dari pusat tapak ke apeks). Cari sudut antara tepi condong (dari bucu tapak ke apeks) dengan tapak, betul kepada 1 tempat perpuluhan.`), a: T(`${n(ang)}$^\\circ$`), w: T(`Half base diagonal $= \\dfrac{${base}\\sqrt{2}}{2} = ${n(halfDiag)}$ cm; $\\tan\\theta = \\dfrac{${height}}{${n(halfDiag)}}$`), sp: 'l' };
    },
    (r) => {
      const h = r.int(20, 50), t1 = r.pick([15, 18, 20]), t2 = r.pick([30, 35, 40]);
      need(t2 > t1);
      const d1 = round(h / Math.tan(rad(t1)), 2), d2 = round(h / Math.tan(rad(t2)), 2);
      const sailed = round(d1 - d2, 2);
      return { q: T(`From the top of a lighthouse ${h} m tall, the angle of depression of a ship is $${t1}^\\circ$. The ship sails directly towards the lighthouse, and after some time the angle of depression becomes $${t2}^\\circ$. Find the distance sailed by the ship, correct to 2 decimal places.`, `Dari puncak sebuah rumah api setinggi ${h} m, sudut tunduk sebuah kapal ialah $${t1}^\\circ$. Kapal itu belayar terus ke arah rumah api, dan selepas beberapa ketika sudut tunduk menjadi $${t2}^\\circ$. Cari jarak yang dilayari oleh kapal itu, betul kepada 2 tempat perpuluhan.`), a: T(`${n(sailed)} m`), w: T(`$\\dfrac{${h}}{\\tan ${t1}^\\circ} - \\dfrac{${h}}{\\tan ${t2}^\\circ}$`), sp: 'l' };
    },
    (r) => {
      const [ctx1, ctx2] = r.sample(towerCtx, 2), h1 = r.int(10, 25), h2 = r.int(10, 25), t1 = r.pick([25, 30, 35]), t2 = r.pick([25, 30, 35]);
      const d1 = round(h1 / Math.tan(rad(t1)), 2), d2 = round(h2 / Math.tan(rad(t2)), 2);
      const total = round(d1 + d2, 2);
      return { q: T(`${SPM.cap(ctx1.en)} and ${ctx2.en[0].toLowerCase() + ctx2.en.slice(1)} stand on level ground on opposite sides of a point $P$ between them, in a straight line. ${SPM.cap(ctx1.en)} is ${h1} m tall and the angle of elevation of its top from $P$ is $${t1}^\\circ$; ${ctx2.en[0].toLowerCase() + ctx2.en.slice(1)} is ${h2} m tall and the angle of elevation of its top from $P$ is $${t2}^\\circ$. Find the distance between the bases of the two structures, correct to 2 decimal places.`, `${SPM.cap(ctx1.ms)} dan ${ctx2.ms[0].toLowerCase() + ctx2.ms.slice(1)} berdiri di atas tanah rata pada sisi bertentangan suatu titik $P$ di antara keduanya, pada satu garis lurus. ${SPM.cap(ctx1.ms)} setinggi ${h1} m dan sudut dongakan puncaknya dari $P$ ialah $${t1}^\\circ$; ${ctx2.ms[0].toLowerCase() + ctx2.ms.slice(1)} setinggi ${h2} m dan sudut dongakan puncaknya dari $P$ ialah $${t2}^\\circ$. Cari jarak antara tapak kedua-dua struktur itu, betul kepada 2 tempat perpuluhan.`), a: T(`${n(total)} m`), w: T(`$\\dfrac{${h1}}{\\tan ${t1}^\\circ} + \\dfrac{${h2}}{\\tan ${t2}^\\circ}$`), sp: 'l' };
    },
  ];
  SPM.extend('F3-5.2', { e: g52e, m: g52m, a: g52a });

  /* =============================================================== 9 : Straight Lines */
  const eqY = (m, c) => {
    const mx = m.n === 0 ? '' : m.d === 1 ? (m.n === 1 ? 'x' : m.n === -1 ? '-x' : `${m.n}x`) : `${m.n < 0 ? '-' : ''}\\dfrac{${Math.abs(m.n)}}{${m.d}}x`;
    if (m.n === 0) return `y = ${frT(c)}`;
    const cc = c.n === 0 ? '' : c.n < 0 ? ' - ' + frT({ n: Math.abs(c.n), d: c.d }) : ' + ' + frT(c);
    return `y = ${mx}${cc}`;
  };
  const planCtx9 = [T('a taxi fare', 'tambang teksi'), T('a phone plan', 'pelan telefon'), T('a car rental charge', 'caj sewa kereta'), T('a printing shop charge', 'caj kedai percetakan'), T('a plumber’s call-out fee', 'yuran panggilan tukang paip'), T('a water bill', 'bil air'), T('a parking charge', 'caj tempat letak kereta'), T('a catering package', 'pakej katering'), T('a gym membership', 'keahlian gim'), T('a bicycle rental charge', 'caj sewa basikal'), T('an internet data plan', 'pelan data internet'), T('a delivery service charge', 'caj perkhidmatan penghantaran')];
  const g91e = [
    (r) => {
      const m = r.nz(-5, 5), c = r.nz(-6, 6);
      return { q: T(`State the gradient and the $y$-intercept of the line $y = ${poly([[m, 'x'], [c, '']])}$.`, `Nyatakan kecerunan dan pintasan-$y$ bagi garis $y = ${poly([[m, 'x'], [c, '']])}$.`), a: T(`Gradient ${m}, $y$-intercept ${c}`, `Kecerunan ${m}, pintasan-$y$ ${c}`), sp: 's' };
    },
    (r) => {
      const [c1, c2] = r.sample(planCtx9, 2), m1 = r.int(2, 6), m2 = r.int(2, 6), b = r.int(5, 20);
      need(m1 !== m2);
      return { q: T(`${SPM.cap(c1.en)} and ${c2.en} both have the same fixed cost RM${b}, but ${c1.en} charges RM${m1} per unit while ${c2.en} charges RM${m2} per unit. Which one has the steeper cost graph?`, `${SPM.cap(c1.ms)} dan ${c2.ms} mempunyai kos tetap yang sama RM${b}, tetapi ${c1.ms} mengenakan RM${m1} setiap unit manakala ${c2.ms} mengenakan RM${m2} setiap unit. Yang manakah mempunyai graf kos yang lebih curam?`), a: m1 > m2 ? T(c1.en, c1.ms) : T(c2.en, c2.ms), sp: 'xs' };
    },
    (r) => {
      const m = r.nz(-4, 4), c = r.nz(-5, 5);
      return { q: T(`Write the equation of the line with gradient ${m} and $y$-intercept ${c}.`, `Tulis persamaan garis yang mempunyai kecerunan ${m} dan pintasan-$y$ ${c}.`), a: T(`$y = ${poly([[m, 'x'], [c, '']])}$`), sp: 's' };
    },
    (r) => {
      const m = r.nz(-5, 5), c = r.nz(-6, 6);
      return { q: T(`At which point does the line $y = ${poly([[m, 'x'], [c, '']])}$ cross the $y$-axis?`, `Di titik manakah garis $y = ${poly([[m, 'x'], [c, '']])}$ memotong paksi-$y$?`), a: T(`$(0, ${c})$`), sp: 'xs' };
    },
    (r) => {
      const m = r.nz(-5, 5), x0 = r.nz(-4, 4);
      const c = -m * x0;
      return { q: T(`Find the $x$-intercept of the line $y = ${poly([[m, 'x'], [c, '']])}$.`, `Cari pintasan-$x$ bagi garis $y = ${poly([[m, 'x'], [c, '']])}$.`), a: T(`$(${x0}, 0)$`), sp: 's' };
    },
    (r) => {
      const m = r.nz(-4, 4), c = r.nz(-5, 5), P = [r.int(-4, 4), r.int(-4, 4)];
      const onLine = P[1] === m * P[0] + c;
      return { q: T(`Is the point $${pt(P)}$ on the line $y = ${poly([[m, 'x'], [c, '']])}$? Show your check.`, `Adakah titik $${pt(P)}$ terletak pada garis $y = ${poly([[m, 'x'], [c, '']])}$? Tunjukkan semakan anda.`), a: onLine ? T('Yes, it satisfies the equation.', 'Ya, ia memenuhi persamaan itu.') : T(`No: substituting gives $y = ${m * P[0] + c}$, not ${P[1]}.`, `Tidak: menggantikan memberi $y = ${m * P[0] + c}$, bukan ${P[1]}.`), sp: 's' };
    },
    (r) => {
      const k = r.nz(-5, 5), vert = r.chance();
      return { q: vert ? T(`Write the equation of the vertical line passing through $(${k}, 3)$.`, `Tulis persamaan garis mencancang yang melalui $(${k}, 3)$.`) : T(`Write the equation of the horizontal line passing through $(3, ${k})$.`, `Tulis persamaan garis mengufuk yang melalui $(3, ${k})$.`), a: vert ? T(`$x = ${k}$`) : T(`$y = ${k}$`), sp: 'xs' };
    },
    (r) => {
      const m1 = r.nz(-5, 5), m2 = r.nz(-5, 5);
      need(Math.abs(m1) !== Math.abs(m2));
      return { q: T(`Which line is steeper: $y = ${poly([[m1, 'x'], [1, '']])}$ or $y = ${poly([[m2, 'x'], [2, '']])}$?`, `Garis manakah yang lebih curam: $y = ${poly([[m1, 'x'], [1, '']])}$ atau $y = ${poly([[m2, 'x'], [2, '']])}$?`), a: Math.abs(m1) > Math.abs(m2) ? T(`$y = ${poly([[m1, 'x'], [1, '']])}$, since $|${m1}| > |${m2}|$.`) : T(`$y = ${poly([[m2, 'x'], [2, '']])}$, since $|${m2}| > |${m1}|$.`), sp: 's' };
    },
    (r) => {
      const m = r.nz(-4, 4), c = r.nz(-5, 5);
      const P = r.int(-3, 3);
      return { q: T(`Fill in the blank: for the line $y = ${poly([[m, 'x'], [c, '']])}$, when $x = ${P}$, $y = $ ____.`, `Isikan tempat kosong: bagi garis $y = ${poly([[m, 'x'], [c, '']])}$, apabila $x = ${P}$, $y = $ ____.`), a: T(`$${m * P + c}$`), sp: 'xs' };
    },
    (r) => {
      const m = r.int(1, 5), c = r.int(5, 30), sc = r.pick(planCtx9);
      return { q: T(`The cost of ${sc.en} is $y = ${poly([[m, 'x'], [c, '']])}$ (in RM) for $x$ units used. State the fixed cost and the cost per additional unit.`, `Kos ${sc.ms} ialah $y = ${poly([[m, 'x'], [c, '']])}$ (dalam RM) bagi $x$ unit yang digunakan. Nyatakan kos tetap dan kos bagi setiap unit tambahan.`), a: T(`Fixed cost RM${c}; RM${m} per additional unit`, `Kos tetap RM${c}; RM${m} bagi setiap unit tambahan`), sp: 's' };
    },
    (r) => {
      const m = r.int(1, 5), c = r.int(5, 30), sc = r.pick(planCtx9), x1 = r.int(2, 8);
      return { q: T(`The cost of ${sc.en} is $y = ${poly([[m, 'x'], [c, '']])}$ (in RM) for $x$ units. Find the cost when $x = ${x1}$.`, `Kos ${sc.ms} ialah $y = ${poly([[m, 'x'], [c, '']])}$ (dalam RM) bagi $x$ unit. Cari kos apabila $x = ${x1}$.`), a: T(`RM${m * x1 + c}`), sp: 's' };
    },
    (r) => {
      const m = r.nz(-5, 5), c = r.nz(-6, 6), y1 = r.int(-4, 4);
      const x1 = mF(y1 - c, m);
      need(x1.d === 1);
      return { q: T(`For the line $y = ${poly([[m, 'x'], [c, '']])}$, find the value of $x$ when $y = ${y1}$.`, `Bagi garis $y = ${poly([[m, 'x'], [c, '']])}$, cari nilai $x$ apabila $y = ${y1}$.`), a: T(`$x = ${frT(x1)}$`), sp: 's' };
    },
    (r) => {
      const [c1, c2] = r.sample(planCtx9, 2), m1 = r.int(2, 6), b1 = r.int(5, 20), m2 = r.int(2, 6), b2 = r.int(5, 20);
      need(m1 !== m2 || b1 !== b2);
      return { q: T(`${SPM.cap(c1.en)} has $y$-intercept RM${b1} and ${c2.en} has $y$-intercept RM${b2}. Which one has the higher starting (fixed) cost?`, `${SPM.cap(c1.ms)} mempunyai pintasan-$y$ RM${b1} dan ${c2.ms} mempunyai pintasan-$y$ RM${b2}. Yang manakah mempunyai kos permulaan (tetap) yang lebih tinggi?`), a: b1 > b2 ? T(c1.en, c1.ms) : T(c2.en, c2.ms), sp: 'xs' };
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
    (r) => {
      const P = [r.int(-3, 3), r.int(-3, 3)], Q = [P[0] + r.int(1, 4), P[1] + r.pick([1, 2, 3, -1, -2, -3]) * r.int(1, 2)];
      const dx = Q[0] - P[0], dy = Q[1] - P[1];
      need(dy % dx === 0);
      const m = dy / dx, c = P[1] - m * P[0];
      return { q: T(`Find the equation of the line passing through $${pt(P)}$ and $${pt(Q)}$.`, `Cari persamaan garis yang melalui $${pt(P)}$ dan $${pt(Q)}$.`), a: T(`$y = ${poly([[m, 'x'], [c, '']])}$`), w: T(`Gradient $= \\dfrac{${dy}}{${dx}} = ${m}$`), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-4, 4), P = [r.int(-3, 3), r.int(-4, 4)];
      const c = P[1] - m * P[0];
      return { q: T(`The line $y = kx + ${c}$ passes through the point $${pt(P)}$. Find the value of $k$.`, `Garis $y = kx + ${c}$ melalui titik $${pt(P)}$. Cari nilai $k$.`), a: T(`$k = ${m}$`), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-4, 4), c = r.nz(-5, 5), xs = r.sample([-2, -1, 0, 1, 2, 3], 4).sort((a, b) => a - b);
      const rows = [xs.map(String), xs.map((x) => String(m * x + c))];
      const tbl = SPM.table([[T('$x$', '$x$').en, ...rows[0]], [T('$y$', '$y$').en, ...rows[1]]]);
      return { q: SPM.cat(T('The table shows values that satisfy a linear equation. ', 'Jadual menunjukkan nilai yang memenuhi suatu persamaan linear. '), T(tbl), T(' Find the equation of the line.', ' Cari persamaan garis itu.')), a: T(`$y = ${poly([[m, 'x'], [c, '']])}$`), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-4, 4), c = r.nz(-5, 5), P = [r.int(-4, 4), r.int(-4, 4)];
      const claimed = m * P[0] + c + r.pick([-2, -1, 1, 2]);
      const real = m * P[0] + c;
      return { q: T(`A student claims the point $(${P[0]}, ${claimed})$ lies on the line $y = ${poly([[m, 'x'], [c, '']])}$. Verify this claim.`, `Seorang murid mendakwa titik $(${P[0]}, ${claimed})$ terletak pada garis $y = ${poly([[m, 'x'], [c, '']])}$. Sahkan dakwaan ini.`), a: T(`False: when $x = ${P[0]}$, $y = ${real}$, not ${claimed}.`, `Salah: apabila $x = ${P[0]}$, $y = ${real}$, bukan ${claimed}.`), sp: 'm' };
    },
    (r) => {
      const m = r.int(2, 6), c0 = r.int(10, 40), sc = r.pick(planCtx9);
      const x1 = r.int(2, 6), y1 = m * x1 + c0;
      return { q: T(`For ${sc.en}, the cost for ${x1} units is RM${y1}, and each additional unit costs RM${m} more. Form a linear equation $y = mx + c$ for the cost $y$ (RM) of $x$ units.`, `Bagi ${sc.ms}, kos untuk ${x1} unit ialah RM${y1}, dan setiap unit tambahan menelan kos RM${m} lagi. Bentukkan satu persamaan linear $y = mx + c$ bagi kos $y$ (RM) untuk $x$ unit.`), a: T(`$y = ${poly([[m, 'x'], [c0, '']])}$`), w: T(`$c = ${y1} - ${m} \\times ${x1} = ${c0}$`), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-4, 4), c = r.nz(-5, 5);
      const wrongC = r.pick([m, -c, c + m]);
      const opts = r.shuffle([`y = ${poly([[m, 'x'], [c, '']])}`, `y = ${poly([[m, 'x'], [wrongC, '']])}`, `y = ${poly([[-m, 'x'], [c, '']])}`]);
      return { q: T(`A line has gradient ${m} and $y$-intercept ${c}. Which of these is its equation: $${opts[0]}$, $${opts[1]}$, or $${opts[2]}$?`, `Satu garis mempunyai kecerunan ${m} dan pintasan-$y$ ${c}. Yang manakah persamaannya: $${opts[0]}$, $${opts[1]}$, atau $${opts[2]}$?`), a: T(`$y = ${poly([[m, 'x'], [c, '']])}$`), sp: 's' };
    },
    (r) => {
      const [c1, c2] = r.sample(planCtx9, 2), m1 = r.int(2, 8), b1 = r.int(5, 20), m2 = r.int(2, 8), b2 = r.int(5, 20);
      need(m1 !== m2 && b1 !== b2);
      const x = r.int(3, 10);
      const y1 = m1 * x + b1, y2 = m2 * x + b2;
      return { q: T(`${SPM.cap(c1.en)} costs $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM) for $x$ units, and ${c2.en} costs $y = ${poly([[m2, 'x'], [b2, '']])}$ (RM) for $x$ units. Which is cheaper for ${x} units, and by how much?`, `${SPM.cap(c1.ms)} berharga $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM) bagi $x$ unit, dan ${c2.ms} berharga $y = ${poly([[m2, 'x'], [b2, '']])}$ (RM) bagi $x$ unit. Yang manakah lebih murah untuk ${x} unit, dan berapa bezanya?`), a: y1 < y2 ? T(`${c1.en[0].toUpperCase() + c1.en.slice(1)}, by RM${y2 - y1}.`, `${c1.ms[0].toUpperCase() + c1.ms.slice(1)}, sebanyak RM${y2 - y1}.`) : T(`${c2.en[0].toUpperCase() + c2.en.slice(1)}, by RM${y1 - y2}.`, `${c2.ms[0].toUpperCase() + c2.ms.slice(1)}, sebanyak RM${y1 - y2}.`), sp: 'm' };
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
    (r) => {
      const m = r.nz(-4, 4), x0 = r.nz(-4, 4), c = -m * x0;
      const px = r.int(-3, 3);
      need(px !== x0);
      const py = m * px + c;
      return { q: T(`The line $y = mx + c$ has $x$-intercept $${x0}$ and passes through $${pt([px, py])}$. Find the values of $m$ and $c$.`, `Garis $y = mx + c$ mempunyai pintasan-$x$ $${x0}$ dan melalui $${pt([px, py])}$. Cari nilai $m$ dan $c$.`), a: T(`$m = ${m}$, $c = ${c}$`), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-3, 3), P = [r.int(-3, 2), r.int(-3, 3)];
      const Q = [P[0] + r.int(1, 3), P[1] + m * r.int(1, 3)];
      const R = [Q[0] + r.int(1, 3), Q[1] + m * r.int(1, 3)];
      const mPQ = (Q[1] - P[1]) / (Q[0] - P[0]), mQR = (R[1] - Q[1]) / (R[0] - Q[0]);
      return { q: T(`Determine whether the points $${pt(P)}$, $${pt(Q)}$ and $${pt(R)}$ are collinear (lie on the same straight line).`, `Tentukan sama ada titik $${pt(P)}$, $${pt(Q)}$ dan $${pt(R)}$ adalah kolinear (terletak pada garis lurus yang sama).`), a: mPQ === mQR ? T(`Yes: gradient of $PQ$ = gradient of $QR$ = ${mPQ}.`, `Ya: kecerunan $PQ$ = kecerunan $QR$ = ${mPQ}.`) : T(`No: gradient of $PQ = ${n(mPQ)}$ but gradient of $QR = ${n(mQR)}$.`, `Tidak: kecerunan $PQ = ${n(mPQ)}$ tetapi kecerunan $QR = ${n(mQR)}$.`), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-4, 4), c1 = r.nz(-5, 5), P = [r.int(-3, 3), r.int(-3, 3)];
      const c2 = P[1] - m * P[0];
      return { q: T(`Find the equation of the line through $${pt(P)}$ that is parallel to $y = ${poly([[m, 'x'], [c1, '']])}$.`, `Cari persamaan garis yang melalui $${pt(P)}$ dan selari dengan $y = ${poly([[m, 'x'], [c1, '']])}$.`), a: T(`$y = ${poly([[m, 'x'], [c2, '']])}$`), sp: 'm' };
    },
    (r) => {
      const m = r.int(2, 5), c0 = r.int(10, 30), sc = r.pick(planCtx9), x1 = r.int(2, 5), x2 = x1 + r.int(2, 4);
      const y1 = m * x1 + c0, y2 = m * x2 + c0;
      return { q: SPM.cat(T(`For ${sc.en}, ${x1} units cost RM${y1} and ${x2} units cost RM${y2}. `, `Bagi ${sc.ms}, ${x1} unit berharga RM${y1} dan ${x2} unit berharga RM${y2}. `), SPM.parts([T('Form a linear equation for the cost $y$ in terms of $x$', 'Bentukkan satu persamaan linear bagi kos $y$ dalam sebutan $x$'), T('Hence, find the cost of 10 units', 'Seterusnya, cari kos bagi 10 unit')])), a: T(`(a) $y = ${poly([[m, 'x'], [c0, '']])}$ (b) RM${m * 10 + c0}`, `(a) $y = ${poly([[m, 'x'], [c0, '']])}$ (b) RM${m * 10 + c0}`), sp: 'l' };
    },
    (r) => {
      const m = r.nz(-3, 3), c = r.nz(-4, 4);
      return { q: T(`Explain why the lines $y = ${poly([[m, 'x'], [c, '']])}$ and $${2}y = ${poly([[2 * m, 'x'], [2 * c, '']])}$ are actually the same line.`, `Terangkan mengapa garis $y = ${poly([[m, 'x'], [c, '']])}$ dan $${2}y = ${poly([[2 * m, 'x'], [2 * c, '']])}$ sebenarnya garis yang sama.`), a: T('Dividing the second equation by 2 gives exactly the first equation, so every point satisfying one also satisfies the other.', 'Membahagikan persamaan kedua dengan 2 memberikan tepat persamaan pertama, jadi setiap titik yang memenuhi satu turut memenuhi yang lain.'), sp: 'm' };
    },
    (r) => {
      const sc = r.pick(planCtx9), m = r.int(2, 6), c0 = r.int(10, 30), budget = r.int(60, 150);
      const xMax = mF(budget - c0, m);
      return { q: T(`For ${sc.en}, the cost is $y = ${poly([[m, 'x'], [c0, '']])}$ (RM) for $x$ units. A customer has a budget of RM${budget}. Find the maximum whole number of units the customer can afford.`, `Bagi ${sc.ms}, kosnya ialah $y = ${poly([[m, 'x'], [c0, '']])}$ (RM) bagi $x$ unit. Seorang pelanggan mempunyai bajet RM${budget}. Cari bilangan unit nombor bulat maksimum yang mampu dibeli oleh pelanggan itu.`), a: T(`${Math.floor(xMax.n / xMax.d)} units`, `${Math.floor(xMax.n / xMax.d)} unit`), w: T(`$x \\le \\dfrac{${budget} - ${c0}}{${m}} = ${frT(xMax)}$`), sp: 'm' };
    },
    (r) => {
      const [c1, c2] = r.sample(planCtx9, 2), m1 = r.int(2, 8), b1 = r.int(5, 20), b2 = r.int(5, 20);
      need(b1 !== b2);
      return { q: T(`${SPM.cap(c1.en)} costs $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM) for $x$ units, and ${c2.en} costs $y = ${poly([[m1, 'x'], [b2, '']])}$ (RM) for $x$ units — both have the same rate per unit. Without finding any specific cost, explain which is cheaper for every value of $x$, and why the two lines are parallel.`, `${SPM.cap(c1.ms)} berharga $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM) bagi $x$ unit, dan ${c2.ms} berharga $y = ${poly([[m1, 'x'], [b2, '']])}$ (RM) bagi $x$ unit — kedua-duanya mempunyai kadar setiap unit yang sama. Tanpa mencari sebarang kos tertentu, terangkan yang manakah lebih murah untuk setiap nilai $x$, dan mengapa kedua-dua garis itu selari.`), a: b1 < b2 ? T(`${SPM.cap(c1.en)} is always cheaper (smaller $y$-intercept). The lines are parallel because they share the same gradient ${m1}.`, `${SPM.cap(c1.ms)} sentiasa lebih murah (pintasan-$y$ yang lebih kecil). Garis-garis itu selari kerana kedua-duanya mempunyai kecerunan ${m1} yang sama.`) : T(`${SPM.cap(c2.en)} is always cheaper (smaller $y$-intercept). The lines are parallel because they share the same gradient ${m1}.`, `${SPM.cap(c2.ms)} sentiasa lebih murah (pintasan-$y$ yang lebih kecil). Garis-garis itu selari kerana kedua-duanya mempunyai kecerunan ${m1} yang sama.`), sp: 'm' };
    },
    (r) => {
      const P = [r.int(-4, 4), r.int(-4, 4)], Q = [r.int(-4, 4), r.int(-4, 4)];
      need(P[0] !== Q[0] && P[1] !== Q[1]);
      const m = mF(Q[1] - P[1], Q[0] - P[0]);
      const k = r.pick([2, 3, -1, -2]);
      const R = [P[0] + k * m.d, P[1] + k * m.n];
      need(R[0] !== Q[0] || R[1] !== Q[1]);
      return { q: T(`Show that the point $${pt(R)}$ lies on the line through $${pt(P)}$ and $${pt(Q)}$, without first finding the full equation of the line.`, `Tunjukkan bahawa titik $${pt(R)}$ terletak pada garis yang melalui $${pt(P)}$ dan $${pt(Q)}$, tanpa mencari persamaan penuh garis itu terlebih dahulu.`), a: T(`Gradient of $PQ = ${frT(m)}$; gradient from $P$ to $${pt(R)} = \\dfrac{${m.n}}{${m.d}} = ${frT(m)}$, the same, so the point lies on the line.`, `Kecerunan $PQ = ${frT(m)}$; kecerunan dari $P$ ke $${pt(R)} = \\dfrac{${m.n}}{${m.d}} = ${frT(m)}$, sama, jadi titik itu terletak pada garis itu.`), sp: 'm' };
    },
  ];
  SPM.extend('F3-9.1', { e: g91e, m: g91m, a: g91a });

  /* =============================================================== 9.2 : Parallel Lines (core) */
  const g92e = [
    (r) => {
      const m = r.nz(-5, 5), c1 = r.int(-5, 5);
      return { q: T(`Fill in the blank so that the two lines are parallel: $y = ${poly([[m, 'x'], [c1, '']])}$ and $y = ${'\\_\\_\\_'}x - 2$.`, `Isikan tempat kosong supaya kedua-dua garis selari: $y = ${poly([[m, 'x'], [c1, '']])}$ dan $y = ${'\\_\\_\\_'}x - 2$.`), a: T(`$${m}$`), sp: 'xs' };
    },
    (r) => {
      const m = r.nz(-4, 4), c1 = r.int(-5, 5), c2 = r.int(-5, 5), m2 = r.pick([m, m + r.pick([1, 2, -1])]);
      need(m2 !== 0);
      const par = m === m2 && c1 !== c2;
      return { q: T(`Are the lines $y = ${poly([[m, 'x'], [c1, '']])}$ and $y = ${poly([[m2, 'x'], [c2, '']])}$ parallel? Give a reason.`, `Adakah garis $y = ${poly([[m, 'x'], [c1, '']])}$ dan $y = ${poly([[m2, 'x'], [c2, '']])}$ selari? Berikan sebab.`), a: par ? T(`Yes: both have gradient ${m}.`, `Ya: kedua-duanya berkecerunan ${m}.`) : m === m2 ? T('They have the same gradient and the same intercept: the same line.', 'Kedua-duanya mempunyai kecerunan dan pintasan yang sama: garis yang sama.') : T(`No: the gradients are ${m} and ${m2}.`, `Tidak: kecerunannya ialah ${m} dan ${m2}.`), sp: 's' };
    },
    (r) => {
      const m = r.nz(-5, 5);
      return { q: T(`State the gradient of any line that is parallel to $y = ${poly([[m, 'x'], [1, '']])}$.`, `Nyatakan kecerunan mana-mana garis yang selari dengan $y = ${poly([[m, 'x'], [1, '']])}$.`), a: T(`$${m}$`), sp: 'xs' };
    },
    (r) => {
      const lines = r.sample([1, 2, 3, -1, -2, -3, 4], 3);
      const [a1, a2, a3] = lines;
      const dup = r.pick([0, 1, 2]);
      const vals = [a1, a2, a3];
      vals[(dup + 1) % 3] = vals[dup];
      const cs = r.sample([1, 2, 3, 4, 5], 3);
      return { q: T(`Three lines are $y = ${vals[0]}x + ${cs[0]}$, $y = ${vals[1]}x + ${cs[1]}$ and $y = ${vals[2]}x + ${cs[2]}$. Which two of these are parallel?`, `Tiga garis ialah $y = ${vals[0]}x + ${cs[0]}$, $y = ${vals[1]}x + ${cs[1]}$ dan $y = ${vals[2]}x + ${cs[2]}$. Yang manakah dua daripadanya selari?`), a: T(`The lines with gradient ${vals[dup]}.`, `Garis-garis yang berkecerunan ${vals[dup]}.`), sp: 's' };
    },
    (r) => {
      const m = r.nz(-4, 4), c1 = r.nz(-5, 5), c2 = r.nz(-5, 5);
      need(c1 !== c2);
      return { q: T(`True or false: the lines $y = ${poly([[m, 'x'], [c1, '']])}$ and $y = ${poly([[m, 'x'], [c2, '']])}$ intersect at some point.`, `Betul atau salah: garis $y = ${poly([[m, 'x'], [c1, '']])}$ dan $y = ${poly([[m, 'x'], [c2, '']])}$ bersilang pada satu titik.`), a: T('False: they have the same gradient and different intercepts, so they are parallel and never meet.', 'Salah: kedua-duanya berkecerunan sama dan pintasan berbeza, jadi kedua-duanya selari dan tidak pernah bertemu.'), sp: 's' };
    },
    (r) => {
      const m = r.nz(-4, 4), P = [r.int(-3, 3), r.int(-3, 3)];
      const c = P[1] - m * P[0];
      return { q: T(`Write the equation of the line through the origin that is parallel to $y = ${poly([[m, 'x'], [1, '']])}$.`, `Tulis persamaan garis yang melalui asalan dan selari dengan $y = ${poly([[m, 'x'], [1, '']])}$.`), a: T(`$y = ${m}x$`), sp: 's' };
    },
    (r) => {
      const [c1, c2] = r.sample(planCtx9, 2), m1 = r.int(2, 6);
      return { q: T(`${SPM.cap(c1.en)} and ${c2.en} both charge RM${m1} per unit, but with different fixed costs. Are their cost graphs (cost $y$ against units $x$) parallel? Give a reason.`, `${SPM.cap(c1.ms)} dan ${c2.ms} kedua-duanya mengenakan RM${m1} setiap unit, tetapi dengan kos tetap yang berbeza. Adakah graf kos mereka (kos $y$ melawan unit $x$) selari? Berikan sebab.`), a: T(`Yes: both graphs have the same gradient ${m1}.`, `Ya: kedua-dua graf mempunyai kecerunan yang sama ${m1}.`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5), m2 = r.nz(-4, 4);
      need(mF(-a, b).n !== mF(m2, 1).n || mF(-a, b).d !== mF(m2, 1).d);
      const m1 = mF(-a, b);
      return { q: T(`Is the line $${a}x + ${b}y = 6$ parallel to $y = ${m2}x + 1$? Give a reason.`, `Adakah garis $${a}x + ${b}y = 6$ selari dengan $y = ${m2}x + 1$? Berikan sebab.`), a: T(`No: rearranging gives gradient $${frT(m1)}$, not ${m2}.`, `Tidak: menyusun semula memberi kecerunan $${frT(m1)}$, bukan ${m2}.`), sp: 's' };
    },
    (r) => {
      const [c1, c2] = r.sample(planCtx9, 2), m1 = r.int(2, 6), m2 = r.int(2, 6);
      need(m1 !== m2);
      return { q: T(`${SPM.cap(c1.en)} charges RM${m1} per unit and ${c2.en} charges RM${m2} per unit (different fixed costs). Are their cost graphs parallel?`, `${SPM.cap(c1.ms)} mengenakan RM${m1} setiap unit dan ${c2.ms} mengenakan RM${m2} setiap unit (kos tetap berbeza). Adakah graf kos mereka selari?`), a: T(`No: the gradients ${m1} and ${m2} are different.`, `Tidak: kecerunan ${m1} dan ${m2} adalah berbeza.`), sp: 'xs' };
    },
    (r) => {
      const k = r.int(2, 4), a = r.int(2, 4), b = r.int(2, 4), c1 = r.int(2, 10), c2 = r.int(2, 10);
      need(c1 !== k * c2 || 6 !== k * 6);
      return { q: T(`Without rearranging, are $${a}x + ${b}y = ${c1}$ and $${a * k}x + ${b * k}y = ${c2}$ parallel? Give a reason.`, `Tanpa menyusun semula, adakah $${a}x + ${b}y = ${c1}$ dan $${a * k}x + ${b * k}y = ${c2}$ selari? Berikan sebab.`), a: T(`Yes: the second equation's $x$ and $y$ coefficients are both ${k} times the first's, so both rearrange to the same gradient.`, `Ya: pekali $x$ dan $y$ persamaan kedua adalah ${k} kali persamaan pertama, jadi kedua-duanya disusun semula kepada kecerunan yang sama.`), sp: 's' };
    },
    (r) => {
      const sc = r.pick(planCtx9), m = r.nz(-5, 5);
      return { q: T(`For ${sc.en}, a graph of cost against units is parallel to $y = ${poly([[m, 'x'], [1, '']])}$. State the gradient of the graph for ${sc.en.toLowerCase()}.`, `Bagi ${sc.ms}, graf kos melawan unit selari dengan $y = ${poly([[m, 'x'], [1, '']])}$. Nyatakan kecerunan graf bagi ${sc.ms.toLowerCase()}.`), a: T(`$${m}$`), sp: 'xs' };
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
    (r) => {
      const a1 = r.int(2, 6), b1 = r.int(2, 6), a2 = r.int(2, 6), b2 = r.int(2, 6), sc = r.pick(planCtx9);
      need(a1 !== b1 && a2 !== b2);
      const m1 = mF(-a1, b1), m2 = mF(-a2, b2);
      const par = m1.n === m2.n && m1.d === m2.d;
      return { q: T(`Two branches of ${sc.en} have cost equations $${a1}x + ${b1}y = 20$ and $${a2}x + ${b2}y = 15$ (RM $y$ for $x$ units). Determine whether the two branches have parallel cost graphs.`, `Dua cawangan ${sc.ms} mempunyai persamaan kos $${a1}x + ${b1}y = 20$ dan $${a2}x + ${b2}y = 15$ (RM $y$ bagi $x$ unit). Tentukan sama ada kedua-dua cawangan mempunyai graf kos yang selari.`), a: par ? T(`Yes: both rearrange to gradient $${frT(m1)}$.`, `Ya: kedua-duanya disusun semula kepada kecerunan $${frT(m1)}$.`) : T(`No: gradients are $${frT(m1)}$ and $${frT(m2)}$.`, `Tidak: kecerunannya ialah $${frT(m1)}$ dan $${frT(m2)}$.`), sp: 'm' };
    },
    (r) => {
      const a1 = r.int(2, 5), b1 = r.int(2, 5), a2 = r.int(2, 5), b2 = r.int(2, 5);
      need(a1 !== b1 && a2 !== b2);
      const m1 = mF(-a1, b1), m2 = mF(-a2, b2);
      const par = m1.n === m2.n && m1.d === m2.d;
      return { q: T(`Determine, showing your working, whether $${a1}x + ${b1}y = 5$ and $${a2}x + ${b2}y = 9$ are parallel.`, `Tentukan, dengan menunjukkan kerja anda, sama ada $${a1}x + ${b1}y = 5$ dan $${a2}x + ${b2}y = 9$ adalah selari.`), a: par ? T(`Yes: both rearrange to gradient $${frT(m1)}$.`, `Ya: kedua-duanya disusun semula kepada kecerunan $${frT(m1)}$.`) : T(`No: gradients are $${frT(m1)}$ and $${frT(m2)}$.`, `Tidak: kecerunannya ialah $${frT(m1)}$ dan $${frT(m2)}$.`), sp: 'm' };
    },
    (r) => {
      const [c1, c2] = r.sample(planCtx9, 2), m1 = r.int(2, 6), b1 = r.int(5, 20), P = r.int(3, 10);
      return { q: T(`${SPM.cap(c1.en)} has cost equation $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM for $x$ units). ${c2.en} charges the same rate per unit but costs RM${m1 * P + b1 + r.pick([10, 15, 20])} for ${P} units. Find the cost equation for ${c2.en.toLowerCase()}.`, `${SPM.cap(c1.ms)} mempunyai persamaan kos $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM bagi $x$ unit). ${c2.ms} mengenakan kadar yang sama setiap unit tetapi berharga RM${m1 * P + b1 + r.pick([10, 15, 20])} untuk ${P} unit. Cari persamaan kos bagi ${c2.ms.toLowerCase()}.`), a: T(`$y = ${m1}x + c$ for some fixed cost $c$ found from the given data point (same gradient ${m1} as ${c1.en.toLowerCase()}).`, `$y = ${m1}x + c$ bagi suatu kos tetap $c$ yang dicari daripada titik data yang diberikan (kecerunan yang sama ${m1} seperti ${c1.ms.toLowerCase()}).`), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-4, 4), P = [r.int(-3, 3), r.int(-3, 3)];
      const c2 = P[1] - m * P[0];
      const opts = r.shuffle([`y = ${poly([[m, 'x'], [c2, '']])}`, `y = ${poly([[m, 'x'], [c2 + r.pick([1, -1, 2]), '']])}`, `y = ${poly([[-m, 'x'], [c2, '']])}`]);
      return { q: T(`Which of these lines passes through $${pt(P)}$ and is parallel to $y = ${m}x$: $${opts[0]}$, $${opts[1]}$, or $${opts[2]}$?`, `Yang manakah antara garis-garis ini melalui $${pt(P)}$ dan selari dengan $y = ${m}x$: $${opts[0]}$, $${opts[1]}$, atau $${opts[2]}$?`), a: T(`$y = ${poly([[m, 'x'], [c2, '']])}$`), sp: 'm' };
    },
    (r) => {
      const rows = [['$L_1$', '$y = 2x + 1$'], ['$L_2$', '$4x - 2y = 6$'], ['$L_3$', '$y = -2x + 5$']];
      const tbl = SPM.table(rows);
      return { q: SPM.cat(T('The table shows three lines. ', 'Jadual menunjukkan tiga garis. '), T(tbl), T(' Which two lines are parallel?', ' Garis manakah yang selari?')), a: T('$L_1$ and $L_2$ (both have gradient 2).', '$L_1$ dan $L_2$ (kedua-duanya berkecerunan 2).'), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-4, 4), c1 = r.nz(-5, 5), P = [r.int(-4, 4), r.int(-4, 4)];
      const c2 = P[1] - m * P[0];
      need(c1 !== c2);
      return { q: T(`A line parallel to $y = ${poly([[m, 'x'], [c1, '']])}$ passes through $${pt(P)}$. Find its $y$-intercept.`, `Satu garis yang selari dengan $y = ${poly([[m, 'x'], [c1, '']])}$ melalui $${pt(P)}$. Cari pintasan-$y$ nya.`), a: T(`$${c2}$`), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-5, 5), c1 = r.nz(-4, 4);
      return { q: T(`Find the value of $p$ such that $y = px + ${c1}$ is parallel to $y = ${poly([[m, 'x'], [3, '']])}$.`, `Cari nilai $p$ supaya $y = px + ${c1}$ selari dengan $y = ${poly([[m, 'x'], [3, '']])}$.`), a: T(`$p = ${m}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 6);
      need(a !== b);
      return { q: T(`The line $${a}x + ${b}y = k$ is parallel to $y = ${frT(mF(-a, b))}x + 5$ for every value of $k$. Give one example value of $k$, and explain why $k$ does not affect whether the lines are parallel.`, `Garis $${a}x + ${b}y = k$ selari dengan $y = ${frT(mF(-a, b))}x + 5$ bagi setiap nilai $k$. Berikan satu contoh nilai $k$, dan terangkan mengapa $k$ tidak mempengaruhi sama ada garis-garis itu selari.`), a: T(`E.g. $k = ${a + b}$; the gradient of $${a}x + ${b}y = k$ is $-\\dfrac{${a}}{${b}}$ regardless of $k$, since $k$ only shifts the $y$-intercept, not the gradient.`, `Cth. $k = ${a + b}$; kecerunan $${a}x + ${b}y = k$ ialah $-\\dfrac{${a}}{${b}}$ tanpa mengira $k$, kerana $k$ hanya mengubah pintasan-$y$, bukan kecerunan.`), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-4, 4), c1 = r.int(-4, 4), P = [r.int(-4, 4), r.int(-4, 4)];
      const c2 = P[1] - m * P[0];
      const xi = m === 0 ? null : mF(-c2, m);
      return { q: SPM.cat(T(`A line through $${pt(P)}$ is parallel to $y = ${poly([[m, 'x'], [c1, '']])}$. Find `, `Satu garis yang melalui $${pt(P)}$ selari dengan $y = ${poly([[m, 'x'], [c1, '']])}$. Cari `), SPM.parts([T('its equation', 'persamaannya'), T('its $x$-intercept', 'pintasan-$x$ nya')])), a: T(`(a) $y = ${poly([[m, 'x'], [c2, '']])}$ (b) $${xi ? frT(xi) : '\\text{none (horizontal line)}'}$`, `(a) $y = ${poly([[m, 'x'], [c2, '']])}$ (b) $${xi ? frT(xi) : '\\text{tiada (garis mengufuk)}'}$`), sp: 'l' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5), c1 = r.int(4, 15), P = [r.int(-3, 3), r.int(-3, 3)];
      need(a !== b);
      const m = mF(-a, b);
      const cc = Fr.sub(mF(P[1], 1), Fr.mul(m, mF(P[0], 1)));
      return { q: T(`Line $L_1$: $${a}x + ${b}y = ${c1}$. Line $L_2$ is parallel to $L_1$ and passes through $${pt(P)}$. (a) Find the gradient of $L_1$. (b) Find the equation of $L_2$ in the form $y = mx + c$.`, `Garis $L_1$: $${a}x + ${b}y = ${c1}$. Garis $L_2$ selari dengan $L_1$ dan melalui $${pt(P)}$. (a) Cari kecerunan $L_1$. (b) Cari persamaan $L_2$ dalam bentuk $y = mx + c$.`), a: T(`(a) $${frT(m)}$ (b) $${eqY(m, cc)}$`), sp: 'l' };
    },
    (r) => {
      const m = r.nz(-4, 4), c1 = r.nz(-5, 5), P = [r.int(-4, 4), r.int(-4, 4)], sc = r.pick(planCtx9);
      const c2 = P[1] - m * P[0];
      need(c1 !== c2);
      return { q: T(`For ${sc.en}, one branch's cost is $y = ${poly([[m, 'x'], [c1, '']])}$ (RM for $x$ units). A second branch has a parallel cost graph and charges RM${P[1]} for ${P[0]} units. Find the cost equation for the second branch, and state its fixed cost.`, `Bagi ${sc.ms}, kos satu cawangan ialah $y = ${poly([[m, 'x'], [c1, '']])}$ (RM bagi $x$ unit). Cawangan kedua mempunyai graf kos yang selari dan mengenakan RM${P[1]} untuk ${P[0]} unit. Cari persamaan kos bagi cawangan kedua, dan nyatakan kos tetapnya.`), a: T(`$y = ${poly([[m, 'x'], [c2, '']])}$; fixed cost RM${c2}`, `$y = ${poly([[m, 'x'], [c2, '']])}$; kos tetap RM${c2}`), sp: 'm' };
    },
  ];
  const g92a = [
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5), k = r.nz(-6, 6);
      return { q: T(`The lines $y = ${a}x + ${b}$ and $2y = kx + 3$ are parallel. Find $k$.`, `Garis $y = ${a}x + ${b}$ dan $2y = kx + 3$ adalah selari. Cari $k$.`), a: T(`$k = ${2 * a}$`), w: T(`Gradient of the second line $= \\dfrac{k}{2} = ${a}$`, `Kecerunan garis kedua $= \\dfrac{k}{2} = ${a}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(3, 8), k = r.nz(-6, 6);
      need(a !== b);
      return { q: T(`The lines $${a}x + ${b}y = 10$ and $${b}y = kx + 4$ are parallel. Find $k$.`, `Garis $${a}x + ${b}y = 10$ dan $${b}y = kx + 4$ adalah selari. Cari $k$.`), a: T(`$k = ${-a}$`), w: T(`Gradient of the first line $= -\\dfrac{${a}}{${b}}$; second line's gradient $= \\dfrac{k}{${b}}$, so $k = ${-a}$`, `Kecerunan garis pertama $= -\\dfrac{${a}}{${b}}$; kecerunan garis kedua $= \\dfrac{k}{${b}}$, jadi $k = ${-a}$`), sp: 'm' };
    },
    (r) => {
      const m = r.nz(-3, 3), c = r.int(-3, 3), P = [r.int(1, 4), r.int(-3, 3)];
      const c2 = P[1] - m * P[0];
      const xi = mF(-c2, m);
      return { q: T(`A line through $${pt(P)}$ is parallel to $y = ${poly([[m, 'x'], [c, '']])}$. Find its equation and the coordinates of the point where it crosses the $x$-axis.`, `Satu garis melalui $${pt(P)}$ adalah selari dengan $y = ${poly([[m, 'x'], [c, '']])}$. Cari persamaannya dan koordinat titik apabila ia memotong paksi-$x$.`), a: T(`$y = ${poly([[m, 'x'], [c2, '']])}$; $(${frT(xi)}, 0)$`), sp: 'm' };
    },
    (r) => {
      const A = [r.int(-3, 1), r.int(-3, 1)], B = [A[0] + r.int(2, 4), A[1] + r.pick([1, 2, 3, -1, -2])];
      const m = mF(B[1] - A[1], B[0] - A[0]);
      const C = [r.int(0, 3), r.int(0, 3)];
      const cC = Fr.sub(mF(C[1], 1), Fr.mul(m, mF(C[0], 1)));
      return { q: T(`The line through $${pt(A)}$ and $${pt(B)}$ represents one side of a parallelogram. Find the equation of the parallel side passing through $${pt(C)}$.`, `Garis yang melalui $${pt(A)}$ dan $${pt(B)}$ mewakili satu sisi sebuah segi empat selari. Cari persamaan sisi selari yang melalui $${pt(C)}$.`), a: T(`$${eqY(m, cC)}$`), w: T(`Gradient of the given side $= ${frT(m)}$`, `Kecerunan sisi yang diberi $= ${frT(m)}$`), sp: 'l' };
    },
    (r) => {
      const [c1, c2] = r.sample(planCtx9, 2), m1 = r.int(2, 6), b1 = r.int(5, 20), x1 = r.int(3, 8);
      const y1 = m1 * x1 + b1 + r.int(5, 15);
      const b2 = y1 - m1 * x1;
      return { q: T(`${SPM.cap(c1.en)} costs $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM) for $x$ units. ${c2.en} has a graph parallel to this one, and costs RM${y1} for ${x1} units. Find the cost equation for ${c2.en.toLowerCase()}, and state which service is cheaper overall.`, `${SPM.cap(c1.ms)} berharga $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM) bagi $x$ unit. ${c2.ms} mempunyai graf yang selari dengan ini, dan berharga RM${y1} untuk ${x1} unit. Cari persamaan kos bagi ${c2.ms.toLowerCase()}, dan nyatakan perkhidmatan manakah yang lebih murah secara keseluruhan.`), a: T(`$y = ${poly([[m1, 'x'], [b2, '']])}$; ${b2 < b1 ? c2.en : c1.en} is cheaper overall (smaller fixed cost, same rate).`, `$y = ${poly([[m1, 'x'], [b2, '']])}$; ${b2 < b1 ? c2.ms : c1.ms} lebih murah secara keseluruhan (kos tetap yang lebih kecil, kadar yang sama).`), sp: 'l' };
    },
    (r) => {
      const m = r.nz(-4, 4);
      return { q: T(`Explain, in terms of gradient, why two distinct parallel lines never intersect.`, `Terangkan, dari segi kecerunan, mengapa dua garis selari yang berbeza tidak pernah bersilang.`), a: T('If they intersected, that common point would satisfy both equations; since both lines have the same gradient but different intercepts, solving the two equations simultaneously leads to a contradiction (no solution), so they cannot meet.', 'Jika kedua-duanya bersilang, titik sepunya itu akan memenuhi kedua-dua persamaan; oleh kerana kedua-dua garis mempunyai kecerunan yang sama tetapi pintasan yang berbeza, menyelesaikan kedua-dua persamaan serentak membawa kepada percanggahan (tiada penyelesaian), jadi kedua-duanya tidak boleh bertemu.'), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5), P = [r.int(-3, 3), r.int(-3, 3)], k = r.int(2, 4);
      need(a !== b);
      const cNew = a * P[0] + b * P[1];
      return { q: T(`Find the value of $c$ such that the line $${a}x + ${b}y = c$ passes through $${pt(P)}$ (this line is automatically parallel to $${a}x + ${b}y = ${cNew + k}$).`, `Cari nilai $c$ supaya garis $${a}x + ${b}y = c$ melalui $${pt(P)}$ (garis ini secara automatik selari dengan $${a}x + ${b}y = ${cNew + k}$).`), a: T(`$c = ${cNew}$`), w: T(`Substitute $${pt(P)}$: $${a}(${P[0]}) + ${b}(${P[1]})$`), sp: 'm' };
    },
    (r) => {
      const [c1, c2] = r.sample(planCtx9, 2), m1 = r.int(2, 6), b1 = r.int(10, 25), diff = r.int(5, 15);
      return { q: T(`${SPM.cap(c1.en)} and ${c2.en} have parallel cost graphs (same rate RM${m1} per unit), with ${c1.en.toLowerCase()} always costing RM${diff} more than ${c2.en.toLowerCase()} for the same number of units. If ${c1.en.toLowerCase()} costs $y = ${poly([[m1, 'x'], [b1, '']])}$, find the cost equation for ${c2.en.toLowerCase()}.`, `${SPM.cap(c1.ms)} dan ${c2.ms} mempunyai graf kos yang selari (kadar yang sama RM${m1} setiap unit), dengan ${c1.ms.toLowerCase()} sentiasa RM${diff} lebih mahal daripada ${c2.ms.toLowerCase()} bagi bilangan unit yang sama. Jika ${c1.ms.toLowerCase()} berharga $y = ${poly([[m1, 'x'], [b1, '']])}$, cari persamaan kos bagi ${c2.ms.toLowerCase()}.`), a: T(`$y = ${poly([[m1, 'x'], [b1 - diff, '']])}$`), sp: 'm' };
    },
    (r) => {
      const A = [r.int(-3, 0), r.int(-3, 0)], B = [A[0] + r.int(2, 4), A[1] + r.pick([1, 2, 3, -1, -2])];
      const D = [r.int(0, 3), r.int(0, 3)];
      const m = mF(B[1] - A[1], B[0] - A[0]);
      const C = [D[0] + (B[0] - A[0]), D[1] + (B[1] - A[1])];
      return { q: T(`$PQRS$ is a parallelogram with $P = ${pt(A)}$, $Q = ${pt(B)}$ and $S = ${pt(D)}$. Since $PQ$ is parallel to $SR$ and equal in length, find the coordinates of $R$, then find the equation of line $SR$.`, `$PQRS$ ialah segi empat selari dengan $P = ${pt(A)}$, $Q = ${pt(B)}$ dan $S = ${pt(D)}$. Oleh kerana $PQ$ selari dengan $SR$ dan sama panjang, cari koordinat $R$, kemudian cari persamaan garis $SR$.`), a: T(`$R = ${pt(C)}$; $${eqY(m, Fr.sub(mF(D[1], 1), Fr.mul(m, mF(D[0], 1))))}$`), sp: 'l' };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 6), c1 = r.int(5, 20), P = [r.int(-3, 3), r.int(-3, 3)];
      need(a !== b);
      const cNew = a * P[0] + b * P[1];
      const m = mF(-a, b);
      return { q: SPM.cat(T(`A line $L$ is parallel to $${a}x + ${b}y = ${c1}$ and passes through $${pt(P)}$. Find `, `Satu garis $L$ selari dengan $${a}x + ${b}y = ${c1}$ dan melalui $${pt(P)}$. Cari `), SPM.parts([T('the equation of $L$ in the form $ax + by = c$', 'persamaan $L$ dalam bentuk $ax + by = c$'), T('the gradient of $L$', 'kecerunan $L$')])), a: T(`(a) $${a}x + ${b}y = ${cNew}$ (b) $${frT(m)}$`), sp: 'l' };
    },
    (r) => {
      const [c1, c2, c3] = r.sample(planCtx9, 3), m1 = r.int(2, 8), b1 = r.int(5, 20), b2 = r.int(5, 20), m2 = r.int(2, 8), b3 = r.int(5, 20);
      need(m1 !== m2 && b1 !== b2);
      return { q: T(`${SPM.cap(c1.en)} costs $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM), ${c2.en} costs $y = ${poly([[m1, 'x'], [b2, '']])}$ (RM), and ${c3.en} costs $y = ${poly([[m2, 'x'], [b3, '']])}$ (RM), all for $x$ units. Which two of the three services have parallel cost graphs, and what does that mean about how their costs change as $x$ increases?`, `${SPM.cap(c1.ms)} berharga $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM), ${c2.ms} berharga $y = ${poly([[m1, 'x'], [b2, '']])}$ (RM), dan ${c3.ms} berharga $y = ${poly([[m2, 'x'], [b3, '']])}$ (RM), semuanya bagi $x$ unit. Yang manakah dua daripada tiga perkhidmatan itu mempunyai graf kos yang selari, dan apakah maksudnya tentang bagaimana kos mereka berubah apabila $x$ meningkat?`), a: T(`${c1.en} and ${c2.en[0].toLowerCase() + c2.en.slice(1)} (both gradient ${m1}): their costs increase at the same rate per unit, always differing by a constant amount.`, `${c1.ms} dan ${c2.ms[0].toLowerCase() + c2.ms.slice(1)} (kedua-duanya berkecerunan ${m1}): kos mereka meningkat pada kadar yang sama setiap unit, sentiasa berbeza dengan jumlah yang tetap.`), sp: 'l' };
    },
  ];
  SPM.extend('F3-9.2', { e: g92e, m: g92m, a: g92a });

  /* =============================================================== 9.2E : Perpendicular Lines (enrichment) */
  const PERPM = [2, 3, 4, -2, -3, -4, 1, -1];
  const pathCtx = [T('a hiking trail', 'sebuah laluan mendaki'), T('a cycling path', 'sebuah laluan berbasikal'), T('a canal', 'sebuah kanal'), T('a fence line', 'sebuah garis pagar'), T('a property boundary', 'sempadan hartanah'), T('a corridor', 'sebuah koridor'), T('a driveway', 'sebuah laluan masuk kereta'), T('a garden path', 'sebuah laluan taman'), T('an irrigation channel', 'sebuah saluran pengairan'), T('a footbridge', 'sebuah jejambat')];
  const g92Ee = [
    (r) => {
      const m = r.pick(PERPM);
      const pm = Fr.neg(mF(1, m));
      return { q: T(`State the gradient of a line that is perpendicular to a line with gradient ${m}.`, `Nyatakan kecerunan garis yang berserenjang dengan garis yang berkecerunan ${m}.`), a: T(`$${frT(pm)}$`), sp: 'xs' };
    },
    (r) => {
      const m1 = r.pick(PERPM), m2 = r.pick(PERPM);
      const perp = Math.abs(m1 * m2 + 1) < 1e-9;
      return { q: T(`Are two lines with gradients ${m1} and ${m2} perpendicular? Check using $m_1 \\times m_2$.`, `Adakah dua garis yang berkecerunan ${m1} dan ${m2} berserenjang? Semak menggunakan $m_1 \\times m_2$.`), a: perp ? T(`Yes: $${m1} \\times ${m2} = -1$.`) : T(`No: $${m1} \\times ${m2} = ${m1 * m2}$, not $-1$.`), sp: 's' };
    },
    (r) => {
      return { q: T(`Fill in the blank: two lines are perpendicular if the product of their gradients equals ____.`, `Isikan tempat kosong: dua garis berserenjang jika hasil darab kecerunan mereka bersamaan ____.`), a: T('$-1$'), sp: 'xs' };
    },
    (r) => {
      const m = r.pick(PERPM);
      return { q: T(`True or false: a line perpendicular to $y = ${m}x + 3$ has the same gradient, ${m}.`, `Betul atau salah: garis yang berserenjang dengan $y = ${m}x + 3$ mempunyai kecerunan yang sama, ${m}.`), a: T(`False: a perpendicular line has gradient $${frT(Fr.neg(mF(1, m)))}$ (the negative reciprocal), not ${m}.`, `Salah: garis berserenjang mempunyai kecerunan $${frT(Fr.neg(mF(1, m)))}$ (salingan negatif), bukan ${m}.`), sp: 's' };
    },
    (r) => {
      const m = r.pick(PERPM);
      return { q: T(`Two roads meet at right angles. One road follows the line $y = ${m}x + 2$. State the gradient of the other road.`, `Dua jalan bertemu pada sudut tegak. Satu jalan mengikut garis $y = ${m}x + 2$. Nyatakan kecerunan jalan yang satu lagi.`), a: T(`$${frT(Fr.neg(mF(1, m)))}$`), sp: 'xs' };
    },
    (r) => {
      const [p1, p2] = r.sample(pathCtx, 2), m = r.pick(PERPM);
      return { q: T(`${SPM.cap(p1.en)} follows $y = ${m}x + 1$, and ${p2.en} crosses it at right angles. State the gradient of ${p2.en}.`, `${SPM.cap(p1.ms)} mengikut $y = ${m}x + 1$, dan ${p2.ms} melintasinya pada sudut tegak. Nyatakan kecerunan ${p2.ms}.`), a: T(`$${frT(Fr.neg(mF(1, m)))}$`), sp: 'xs' };
    },
    (r) => {
      const [p1, p2] = r.sample(pathCtx, 2), m1 = r.pick(PERPM), m2 = r.pick(PERPM);
      const perp = Math.abs(m1 * m2 + 1) < 1e-9;
      return { q: T(`${SPM.cap(p1.en)} has gradient ${m1} and ${p2.en} has gradient ${m2} on a map grid. Are they perpendicular?`, `${SPM.cap(p1.ms)} mempunyai kecerunan ${m1} dan ${p2.ms} mempunyai kecerunan ${m2} pada grid peta. Adakah kedua-duanya berserenjang?`), a: perp ? T('Yes.', 'Ya.') : T('No.', 'Tidak.'), sp: 'xs' };
    },
    (r) => {
      const p1 = r.pick(pathCtx), m = r.pick(PERPM);
      return { q: T(`${SPM.cap(p1.en)} on a map has gradient ${m}. A wall is built perpendicular to it. Fill in the blank: the wall's gradient is ____.`, `${SPM.cap(p1.ms)} pada peta mempunyai kecerunan ${m}. Sebuah tembok dibina berserenjang dengannya. Isikan tempat kosong: kecerunan tembok itu ialah ____.`), a: T(`$${frT(Fr.neg(mF(1, m)))}$`), sp: 'xs' };
    },
  ];
  const g92Em = [
    (r) => {
      const m = r.pick(PERPM);
      const P = [r.int(-3, 3), r.int(-3, 3)];
      const pm = Fr.neg(mF(1, m));
      const c = Fr.sub(mF(P[1], 1), Fr.mul(pm, mF(P[0], 1)));
      return { q: T(`Find the gradient of a line perpendicular to $y = ${poly([[m, 'x'], [1, '']])}$, and the equation of the perpendicular line through $${pt(P)}$.`, `Cari kecerunan garis yang serenjang dengan $y = ${poly([[m, 'x'], [1, '']])}$, dan persamaan garis serenjang yang melalui $${pt(P)}$.`), a: T(`Gradient $${frT(pm)}$; $${eqY(pm, c)}$`, `Kecerunan $${frT(pm)}$; $${eqY(pm, c)}$`), sp: 'm' };
    },
    (r) => {
      const [p1, p2] = r.sample(pathCtx, 2), m = r.pick(PERPM), P = [r.int(-3, 3), r.int(-3, 3)];
      const pm = Fr.neg(mF(1, m));
      const c = Fr.sub(mF(P[1], 1), Fr.mul(pm, mF(P[0], 1)));
      return { q: T(`${SPM.cap(p1.en)} follows $y = ${poly([[m, 'x'], [1, '']])}$. ${SPM.cap(p2.en)} is perpendicular to it and passes through $${pt(P)}$. Find the equation of ${p2.en.toLowerCase()}.`, `${SPM.cap(p1.ms)} mengikut $y = ${poly([[m, 'x'], [1, '']])}$. ${SPM.cap(p2.ms)} berserenjang dengannya dan melalui $${pt(P)}$. Cari persamaan ${p2.ms.toLowerCase()}.`), a: T(`$${eqY(pm, c)}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5), c = r.int(4, 12), P = [r.int(-3, 3), r.int(-3, 3)];
      need(a !== b);
      const m = mF(-a, b);
      const pm = Fr.neg(Fr.div(mF(1, 1), m));
      const cc = Fr.sub(mF(P[1], 1), Fr.mul(pm, mF(P[0], 1)));
      return { q: T(`Find the equation of the line through $${pt(P)}$ perpendicular to $${a}x + ${b}y = ${c}$.`, `Cari persamaan garis yang melalui $${pt(P)}$ berserenjang dengan $${a}x + ${b}y = ${c}$.`), a: T(`$${eqY(pm, cc)}$`), w: T(`Gradient of given line $= ${frT(m)}$, so perpendicular gradient $= ${frT(pm)}$`, `Kecerunan garis yang diberi $= ${frT(m)}$, jadi kecerunan serenjang $= ${frT(pm)}$`), sp: 'm' };
    },
    (r) => {
      const m = r.pick(PERPM), c1 = r.nz(-4, 4);
      const pm = Fr.neg(mF(1, m));
      return { q: T(`Find the value of $p$ such that $y = px + ${c1}$ is perpendicular to $y = ${poly([[m, 'x'], [2, '']])}$.`, `Cari nilai $p$ supaya $y = px + ${c1}$ berserenjang dengan $y = ${poly([[m, 'x'], [2, '']])}$.`), a: T(`$p = ${frT(pm)}$`), sp: 'm' };
    },
    (r) => {
      const m1 = r.pick(PERPM), m2 = r.pick(PERPM.filter((x) => x !== m1));
      const perp = Math.abs(m1 * m2 + 1) < 1e-9;
      return { q: T(`Line $A$: $y = ${m1}x + 3$. Line $B$: $y = ${m2}x - 2$. Determine, showing your check, whether $A$ and $B$ are perpendicular.`, `Garis $A$: $y = ${m1}x + 3$. Garis $B$: $y = ${m2}x - 2$. Tentukan, dengan menunjukkan semakan anda, sama ada $A$ dan $B$ berserenjang.`), a: perp ? T(`Yes: $${m1} \\times ${m2} = -1$.`) : T(`No: $${m1} \\times ${m2} = ${m1 * m2} \\ne -1$.`), sp: 'm' };
    },
    (r) => {
      const m = r.pick(PERPM), sc = r.pick(planCtx9);
      const pm = Fr.neg(mF(1, m));
      return { q: T(`A delivery route for ${sc.en} follows $y = ${poly([[m, 'x'], [2, '']])}$ on a map grid. A second route crosses it at right angles at the point where $x = 0$. Find the equation of the second route.`, `Laluan penghantaran untuk ${sc.ms} mengikut $y = ${poly([[m, 'x'], [2, '']])}$ pada grid peta. Laluan kedua melintasinya pada sudut tegak di titik $x = 0$. Cari persamaan laluan kedua.`), a: T(`$${eqY(pm, mF(2, 1))}$`), sp: 'm' };
    },
  ];
  const g92Ea = [
    (r) => {
      const a = r.int(2, 5), t = r.int(2, 4), b = a * t, k = -t, bconst = r.int(2, 8);
      return { q: T(`The lines $y = ${a}x + ${bconst}$ and $${b}y = kx + 3$ are perpendicular. Find $k$.`, `Garis $y = ${a}x + ${bconst}$ dan $${b}y = kx + 3$ adalah berserenjang. Cari $k$.`), a: T(`$k = ${k}$`), w: T(`Gradient of second line $= \\dfrac{k}{${b}}$; need $${a} \\times \\dfrac{k}{${b}} = -1$`, `Kecerunan garis kedua $= \\dfrac{k}{${b}}$; perlu $${a} \\times \\dfrac{k}{${b}} = -1$`), sp: 'l' };
    },
    (r) => {
      const m = r.pick(PERPM), P = [r.int(1, 4), r.int(-3, 3)];
      const pm = Fr.neg(mF(1, m));
      const c = Fr.sub(mF(P[1], 1), Fr.mul(pm, mF(P[0], 1)));
      const xInt = Fr.div(Fr.neg(c), pm);
      return { q: T(`A line perpendicular to $y = ${poly([[m, 'x'], [1, '']])}$ passes through $${pt(P)}$. Find its equation and its $x$-intercept.`, `Satu garis yang berserenjang dengan $y = ${poly([[m, 'x'], [1, '']])}$ melalui $${pt(P)}$. Cari persamaannya dan pintasan-$x$ nya.`), a: T(`$${eqY(pm, c)}$; $x$-intercept $${frT(xInt)}$`, `$${eqY(pm, c)}$; pintasan-$x$ $${frT(xInt)}$`), sp: 'l' };
    },
    (r) => {
      const A = [r.int(-2, 1), r.int(-2, 1)], B = [A[0] + r.int(2, 4), A[1] + r.pick([1, 2, 3, -1, -2])];
      const m = mF(B[1] - A[1], B[0] - A[0]);
      const pm = Fr.neg(Fr.div(mF(1, 1), m));
      const s = r.int(1, 2);
      const D = [A[0] + s * pm.d, A[1] + s * pm.n];
      return { q: T(`$ABCD$ is a rectangle with $A = ${pt(A)}$, $B = ${pt(B)}$ and $D = ${pt(D)}$. Since $AD$ is perpendicular to $AB$, find the gradient of $AD$ and verify it using the coordinates of $A$ and $D$.`, `$ABCD$ ialah segi empat tepat dengan $A = ${pt(A)}$, $B = ${pt(B)}$ dan $D = ${pt(D)}$. Oleh kerana $AD$ berserenjang dengan $AB$, cari kecerunan $AD$ dan sahkan menggunakan koordinat $A$ dan $D$.`), a: T(`Gradient of $AB = ${frT(m)}$, so gradient of $AD = ${frT(pm)}$ (negative reciprocal); from $A$ and $D$: gradient $= \\dfrac{${D[1]} - (${A[1]})}{${D[0]} - (${A[0]})} = ${frT(pm)}$. ✓`, `Kecerunan $AB = ${frT(m)}$, jadi kecerunan $AD = ${frT(pm)}$ (salingan negatif); daripada $A$ dan $D$: kecerunan $= \\dfrac{${D[1]} - (${A[1]})}{${D[0]} - (${A[0]})} = ${frT(pm)}$. ✓`), sp: 'l' };
    },
    (r) => {
      const [c1, c2, c3] = r.sample(planCtx9, 3), m1 = r.pick(PERPM), m2 = r.pick(PERPM.filter((x) => x !== m1));
      const m3 = Fr.neg(mF(1, m1));
      return { q: T(`Three delivery routes have gradients: ${c1.en} $= ${m1}$, ${c2.en} $= ${m2}$, ${c3.en} $= ${frT(m3)}$. Which two routes are perpendicular to each other?`, `Tiga laluan penghantaran mempunyai kecerunan: ${c1.ms} $= ${m1}$, ${c2.ms} $= ${m2}$, ${c3.ms} $= ${frT(m3)}$. Laluan manakah dua daripadanya berserenjang antara satu sama lain?`), a: T(`${c1.en} and ${c3.en[0].toLowerCase() + c3.en.slice(1)}, since $${m1} \\times ${frT(m3)} = -1$.`, `${c1.ms} dan ${c3.ms[0].toLowerCase() + c3.ms.slice(1)}, kerana $${m1} \\times ${frT(m3)} = -1$.`), sp: 'l' };
    },
  ];
  SPM.extend('F3-9.2E', { e: g92Ee, m: g92Em, a: g92Ea });

  /* =============================================================== 9.3 : Intersection of Straight Lines */
  const solve2 = (a1, b1, c1, a2, b2, c2) => {
    const det = a1 * b2 - a2 * b1;
    return [mF(c1 * b2 - c2 * b1, det), mF(a1 * c2 - a2 * c1, det)];
  };
  const sys = (a1, b1, c1, a2, b2, c2) => `\\begin{cases} ${poly([[a1, 'x'], [b1, 'y']])} = ${c1} \\\\ ${poly([[a2, 'x'], [b2, 'y']])} = ${c2} \\end{cases}`;
  const g93e = [
    (r) => {
      const p = r.int(1, 5), q = r.int(1, 6), k = r.int(1, 3);
      const s = p + q, kk = q - p;
      return { q: T(`Find the point of intersection of the lines $y = x ${kk < 0 ? '-' : '+'} ${Math.abs(kk)}$ and $x + y = ${s}$.`, `Cari titik persilangan garis $y = x ${kk < 0 ? '-' : '+'} ${Math.abs(kk)}$ dan $x + y = ${s}$.`), a: T(`$(${p}, ${q})$`), sp: 'm' };
    },
    (r) => {
      const p = r.int(-3, 4), q = r.int(-3, 4), a1 = r.int(1, 4), b1 = r.int(1, 4);
      const dx = r.pick([0, 1, -1]), dy = dx === 0 ? r.pick([1, -1]) : r.pick([0, 1, -1]);
      const claim = [p + dx, q + dy];
      const c1 = a1 * p + b1 * q;
      const y2at = p + q;
      const lhs1 = a1 * claim[0] + b1 * claim[1];
      const fails1 = lhs1 !== c1;
      return { q: T(`A student claims that $${pt(claim)}$ is the point of intersection of $${poly([[a1, 'x'], [b1, 'y']])} = ${c1}$ and $x + y = ${y2at}$. Verify this claim by substitution.`, `Seorang murid mendakwa $${pt(claim)}$ ialah titik persilangan bagi $${poly([[a1, 'x'], [b1, 'y']])} = ${c1}$ dan $x + y = ${y2at}$. Sahkan dakwaan ini dengan penggantian.`), a: T(`Incorrect: substituting into the first equation gives $${lhs1} ${fails1 ? '\\ne' : '='} ${c1}$${fails1 ? '' : `, but into $x+y$ gives $${claim[0] + claim[1]} \\ne ${y2at}$`}.`, `Salah: menggantikan ke dalam persamaan pertama memberi $${lhs1} ${fails1 ? '\\ne' : '='} ${c1}$${fails1 ? '' : `, tetapi ke dalam $x+y$ memberi $${claim[0] + claim[1]} \\ne ${y2at}$`}.`), sp: 's' };
    },
    (r) => {
      const P = [r.int(-3, 3), r.int(-3, 3)];
      const fig = S.plane({ x: [-4, 4], y: [-4, 4], scale: 24, lines: [{ m: 1, c: P[1] - P[0] }, { m: -1, c: P[1] + P[0] }], pts: [{ x: P[0], y: P[1], l: 'P' }] });
      return { q: T('The diagram shows two straight lines. State the coordinates of their point of intersection, $P$.', 'Rajah menunjukkan dua garis lurus. Nyatakan koordinat titik persilangan mereka, $P$.'), fig, a: T(`$${pt(P)}$`), sp: 's' };
    },
    (r) => {
      const [c1, c2] = r.sample(planCtx9, 2), m1 = r.int(2, 6), b1 = r.int(5, 20), m2 = r.int(2, 6), b2 = r.int(5, 20), x0 = r.int(2, 8);
      need(m1 !== m2);
      const y1 = m1 * x0 + b1, y2 = m2 * x0 + b2;
      const same = y1 === y2;
      return { q: T(`${SPM.cap(c1.en)} costs $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM) and ${c2.en} costs $y = ${poly([[m2, 'x'], [b2, '']])}$ (RM), both for $x$ units. Do they cost the same for ${x0} units?`, `${SPM.cap(c1.ms)} berharga $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM) dan ${c2.ms} berharga $y = ${poly([[m2, 'x'], [b2, '']])}$ (RM), kedua-duanya bagi $x$ unit. Adakah kos mereka sama untuk ${x0} unit?`), a: same ? T(`Yes, both cost RM${y1}.`, `Ya, kedua-duanya berharga RM${y1}.`) : T(`No: RM${y1} vs RM${y2}.`, `Tidak: RM${y1} berbanding RM${y2}.`), sp: 's' };
    },
    (r) => {
      const a = r.int(1, 4), b = r.int(1, 4), P = [r.int(1, 4), r.int(1, 4)];
      const c = a * P[0] + b * P[1];
      return { q: T(`The lines $y = ${P[1]}$ and $${a}x + ${b}y = ${c}$ intersect at a point with $y = ${P[1]}$. Find the $x$-coordinate of the intersection point.`, `Garis $y = ${P[1]}$ dan $${a}x + ${b}y = ${c}$ bersilang pada satu titik dengan $y = ${P[1]}$. Cari koordinat-$x$ titik persilangan itu.`), a: T(`$x = ${P[0]}$`), sp: 's' };
    },
  ];
  const g93m = [
    (r) => {
      const p = r.int(-4, 5), q = r.int(-4, 5), a1 = r.int(1, 4), b1 = r.int(1, 4), a2 = a1, b2 = -b1 * r.pick([1, 2]);
      need((a1 * b2 - a2 * b1) !== 0);
      return { q: T(`Find the point of intersection of $${poly([[a1, 'x'], [b1, 'y']])} = ${a1 * p + b1 * q}$ and $${poly([[a2, 'x'], [b2, 'y']])} = ${a2 * p + b2 * q}$.`, `Cari titik persilangan bagi $${poly([[a1, 'x'], [b1, 'y']])} = ${a1 * p + b1 * q}$ dan $${poly([[a2, 'x'], [b2, 'y']])} = ${a2 * p + b2 * q}$.`), a: T(`$(${p}, ${q})$`), sp: 'l' };
    },
    (r) => {
      const p = r.int(-4, -1), q = r.int(1, 5), a1 = r.int(1, 3), b1 = r.int(1, 3), a2 = r.int(1, 3), b2 = -r.int(1, 3);
      need(a1 * b2 - a2 * b1 !== 0);
      const [x, y] = solve2(a1, b1, a1 * p + b1 * q, a2, b2, a2 * p + b2 * q);
      return { q: T(`Find the point of intersection of $${poly([[a1, 'x'], [b1, 'y']])} = ${a1 * p + b1 * q}$ and $${poly([[a2, 'x'], [b2, 'y']])} = ${a2 * p + b2 * q}$.`, `Cari titik persilangan bagi $${poly([[a1, 'x'], [b1, 'y']])} = ${a1 * p + b1 * q}$ dan $${poly([[a2, 'x'], [b2, 'y']])} = ${a2 * p + b2 * q}$.`), a: T(`$(${frT(x)}, ${frT(y)})$`), sp: 'l' };
    },
    (r) => {
      const [c1, c2] = r.sample(planCtx9, 2), m1 = r.int(2, 8), b1 = r.int(5, 25), m2 = r.int(2, 8), b2 = r.int(5, 25);
      need(m1 !== m2);
      const x0 = mF(b2 - b1, m1 - m2);
      need(x0.d === 1 && x0.n > 0);
      const y0 = m1 * x0.n + b1;
      return { q: T(`${SPM.cap(c1.en)} costs $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM) and ${c2.en} costs $y = ${poly([[m2, 'x'], [b2, '']])}$ (RM), both for $x$ units. Find the number of units for which the two cost the same, and state that cost.`, `${SPM.cap(c1.ms)} berharga $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM) dan ${c2.ms} berharga $y = ${poly([[m2, 'x'], [b2, '']])}$ (RM), kedua-duanya bagi $x$ unit. Cari bilangan unit yang menjadikan kos kedua-duanya sama, dan nyatakan kos itu.`), a: T(`${x0.n} units, RM${y0}`, `${x0.n} unit, RM${y0}`), sp: 'm' };
    },
    (r) => {
      const p = r.int(-3, 4), q = r.int(-3, 4), a1 = r.int(1, 4), b1 = r.int(1, 4), a2 = r.int(1, 4), b2 = r.nz(-4, 4);
      need(a1 * b2 - a2 * b1 !== 0 && (a2 !== a1 || b2 !== b1));
      const claim = [p + r.pick([0, 0, 1]), q + r.pick([0, 0, -1])];
      const c1 = a1 * p + b1 * q, c2 = a2 * p + b2 * q;
      const ok = claim[0] === p && claim[1] === q;
      return { q: T(`Verify whether $${pt(claim)}$ satisfies both $${poly([[a1, 'x'], [b1, 'y']])} = ${c1}$ and $${poly([[a2, 'x'], [b2, 'y']])} = ${c2}$, and hence state whether it is their point of intersection.`, `Sahkan sama ada $${pt(claim)}$ memenuhi kedua-dua $${poly([[a1, 'x'], [b1, 'y']])} = ${c1}$ dan $${poly([[a2, 'x'], [b2, 'y']])} = ${c2}$, dan seterusnya nyatakan sama ada ia titik persilangan mereka.`), a: ok ? T('Yes, it satisfies both equations.', 'Ya, ia memenuhi kedua-dua persamaan.') : T('No, it does not satisfy at least one equation.', 'Tidak, ia tidak memenuhi sekurang-kurangnya satu persamaan.'), sp: 'm' };
    },
    (r) => {
      const P = [r.int(-3, 3), r.int(-3, 3)], m2 = r.nz(-3, 3);
      need(m2 !== 1);
      const c2 = P[1] - m2 * P[0];
      const fig = S.plane({ x: [-4, 4], y: [-4, 4], scale: 24, lines: [{ m: 1, c: P[1] - P[0] }, { m: m2, c: c2 }] });
      return { q: T('The diagram shows the graphs of two linear equations. Read off the coordinates of their point of intersection.', 'Rajah menunjukkan graf dua persamaan linear. Bacakan koordinat titik persilangan mereka.'), fig, a: T(`$${pt(P)}$`), sp: 's' };
    },
    (r) => {
      const price1 = r.int(2, 6), price2 = r.int(2, 5), [it1, it2] = r.sample(SPM.bank.items, 2);
      const n1 = r.int(2, 5), n2 = r.int(2, 5), n3 = r.int(1, 4), n4 = r.int(1, 4);
      need(n1 * n4 !== n2 * n3);
      const total1 = n1 * price1 + n2 * price2, total2 = n3 * price1 + n4 * price2;
      const [x, y] = solve2(n1, n2, total1, n3, n4, total2);
      return { q: T(`${n1} ${it1.en} and ${n2} ${it2.en} cost RM${total1} in total; ${n3} ${it1.en} and ${n4} ${it2.en} cost RM${total2} in total. Form two linear equations and find the price of each ${it1.en1}.`, `${n1} ${it1.ms} dan ${n2} ${it2.ms} berharga RM${total1} kesemuanya; ${n3} ${it1.ms} dan ${n4} ${it2.ms} berharga RM${total2} kesemuanya. Bentukkan dua persamaan linear dan cari harga setiap ${it1.ms}.`), a: T(`${it1.en1} RM${frT(x)}, ${it2.en1} RM${frT(y)}`, `${it1.ms} RM${frT(x)}, ${it2.ms} RM${frT(y)}`), sp: 'xl' };
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
    (r) => {
      const [c1, c2] = r.sample(planCtx9, 2), m1 = r.int(2, 8), b1 = r.int(5, 25), m2 = r.int(2, 8), b2 = r.int(5, 25);
      need(m1 !== m2 && b1 !== b2);
      const x0 = mF(b2 - b1, m1 - m2);
      need(x0.d === 1 && x0.n > 0);
      const y0 = m1 * x0.n + b1;
      const cheaperFew = b1 < b2 ? c1 : c2;
      return { q: T(`${SPM.cap(c1.en)} costs $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM) and ${c2.en} costs $y = ${poly([[m2, 'x'], [b2, '']])}$ (RM), both for $x$ units. Find the break-even number of units, then advise a customer who expects to use only a few units: which is cheaper, ${c1.en.toLowerCase()} or ${c2.en.toLowerCase()}?`, `${SPM.cap(c1.ms)} berharga $y = ${poly([[m1, 'x'], [b1, '']])}$ (RM) dan ${c2.ms} berharga $y = ${poly([[m2, 'x'], [b2, '']])}$ (RM), kedua-duanya bagi $x$ unit. Cari bilangan unit pulang modal, kemudian nasihatkan pelanggan yang menjangkakan hanya menggunakan beberapa unit sahaja: yang manakah lebih murah, ${c1.ms.toLowerCase()} atau ${c2.ms.toLowerCase()}?`), a: T(`Break-even at ${x0.n} units (RM${y0}); for few units, ${cheaperFew.en} is cheaper (smaller fixed cost).`, `Pulang modal pada ${x0.n} unit (RM${y0}); untuk beberapa unit sahaja, ${cheaperFew.ms} lebih murah (kos tetap yang lebih kecil).`), sp: 'l' };
    },
    (r) => {
      const a1 = r.int(2, 5), b1 = r.int(2, 5), a2 = r.int(2, 5), b2 = -r.int(2, 5), p = r.int(-3, 4), q = r.int(-3, 4);
      need(a1 * b2 - a2 * b1 !== 0);
      const c1 = a1 * p + b1 * q, c2 = a2 * p + b2 * q;
      return { q: SPM.cat(T(`Given the lines $${poly([[a1, 'x'], [b1, 'y']])} = ${c1}$ and $${poly([[a2, 'x'], [b2, 'y']])} = ${c2}$, `, `Diberi garis $${poly([[a1, 'x'], [b1, 'y']])} = ${c1}$ dan $${poly([[a2, 'x'], [b2, 'y']])} = ${c2}$, `), SPM.parts([T('find their point of intersection', 'cari titik persilangan mereka'), T('verify your answer by substituting into both original equations', 'sahkan jawapan anda dengan menggantikannya ke dalam kedua-dua persamaan asal')])), a: T(`(a) $${pt([p, q])}$ (b) Both equations are satisfied by $${pt([p, q])}$.`, `(a) $${pt([p, q])}$ (b) Kedua-dua persamaan dipenuhi oleh $${pt([p, q])}$.`), sp: 'l' };
    },
  ];
  SPM.extend('F3-9.3', { e: g93e, m: g93m, a: g93a });
})();
