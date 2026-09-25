/* Variety pack x1g: F1-12.1 .. 12.5 Data Handling (see tools/PACKS.md, tools/variety.js). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, round, sum } = SPM;
  const T = SPM.L, S = SPM.svg, W = SPM.lines;
  /** 'English || Bahasa Melayu' -> bilingual text (write the two languages side by side; interpolate variables once) */
  const B = (s) => { const i = s.indexOf(' || '), ms = s.slice(i + 4); return T(s.slice(0, i) + (/\s$/.test(ms) ? ' ' : ''), ms); };
  const dual = (fn) => T(fn('en'), fn('ms'));
  const rg = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const LET = 'ABCDEFGH';
  const sub = (l, from, to) => T(l.en.split(from).join(to), l.ms.split(from).join(to));
  const cat = (...xs) => SPM.cat(...xs);
  /** multiple choice: right and wrongs are bilingual; returns {en, ms} option text and the answer text */
  const mc = (r, right, wrongs) => {
    const all = r.shuffle([right, ...wrongs]);
    const i = all.indexOf(right);
    const f = (k) => all.map((o, j) => `(${LET[j]}) ${o[k]}`).join(' ');
    return { en: f('en'), ms: f('ms'), letter: LET[i], ans: T(`(${LET[i]}) ${right.en}`, `(${LET[i]}) ${right.ms}`) };
  };
  const YN = (b) => (b ? T('Yes', 'Ya') : T('No', 'Tidak'));

  const Ln = (lang, en, ms) => (lang === 'en' ? en : ms);
  const FREQ = B('Frequency || Kekerapan'), TOTAL = B('Total || Jumlah');
  const CTXS = [
    ['Favourite sport || Sukan kegemaran', ['Football/Bola sepak', 'Badminton/Badminton', 'Netball/Bola jaring', 'Swimming/Renang', 'Sepak takraw/Sepak takraw', 'Hockey/Hoki', 'Table tennis/Pingpong']],
    ['Transport to school || Cara ke sekolah', ['Bus/Bas', 'Car/Kereta', 'Bicycle/Basikal', 'Walking/Berjalan', 'Motorcycle/Motosikal', 'Train/Tren']],
    ['Favourite fruit || Buah kegemaran', ['Mango/Mangga', 'Durian/Durian', 'Banana/Pisang', 'Rambutan/Rambutan', 'Papaya/Betik', 'Watermelon/Tembikai']],
    ['Favourite subject || Mata pelajaran kegemaran', ['Mathematics/Matematik', 'Science/Sains', 'English/B. Inggeris', 'Malay/B. Melayu', 'History/Sejarah', 'Art/Seni']],
    ['Favourite drink || Minuman kegemaran', ['Teh tarik/Teh tarik', 'Milo/Milo', 'Orange juice/Jus oren', 'Sirap/Sirap', 'Water/Air kosong', 'Coconut water/Air kelapa']],
    ['Breakfast eaten || Sarapan yang dimakan', ['Nasi lemak/Nasi lemak', 'Roti canai/Roti canai', 'Bread/Roti', 'Porridge/Bubur', 'Noodles/Mi', 'Cereal/Bijirin']],
    ['Pet owned || Haiwan peliharaan', ['Cat/Kucing', 'Fish/Ikan', 'Bird/Burung', 'Rabbit/Arnab', 'Hamster/Hamster', 'Turtle/Kura-kura']],
    ['Club joined || Kelab yang disertai', ['Scouts/Pengakap', 'Chess/Catur', 'Robotics/Robotik', 'Drama/Drama', 'Choir/Koir', 'Silat/Silat']],
    ['Favourite colour || Warna kegemaran', ['Red/Merah', 'Blue/Biru', 'Green/Hijau', 'Yellow/Kuning', 'Purple/Ungu', 'Orange/Jingga']],
    ['Festival food || Makanan perayaan', ['Ketupat/Ketupat', 'Rendang/Rendang', 'Lemang/Lemang', 'Satay/Sate', 'Murukku/Murukku', 'Kuih raya/Kuih raya']],
    ['Recess activity || Aktiviti waktu rehat', ['Eating/Makan', 'Reading/Membaca', 'Football/Bola sepak', 'Chatting/Berbual', 'Homework/Kerja rumah', 'Library/Perpustakaan']],
    ['Book borrowed || Buku yang dipinjam', ['Stories/Cerita', 'Comics/Komik', 'Science/Sains', 'History/Sejarah', 'Magazines/Majalah', 'Dictionaries/Kamus']],
  ].map((x) => ({ name: B(x[0]), cats: x[1].map((c) => { const [e, m] = c.split('/'); return T(e, m); }) }));
  /** discrete numerical contexts: name, value range, "who" */
  const NUMC = [
    ['Number of siblings || Bilangan adik-beradik', 0, 5, 'students || murid'], ['Number of pets owned || Bilangan haiwan peliharaan', 0, 4, 'students || murid'],
    ['Books read in a month || Bilangan buku yang dibaca dalam sebulan', 1, 6, 'students || murid'], ['Goals scored per match || Gol yang dijaringkan setiap perlawanan', 0, 5, 'matches || perlawanan'],
    ['Glasses of water drunk in a day || Bilangan gelas air yang diminum sehari', 2, 7, 'students || murid'], ['Library visits in a month || Bilangan kunjungan ke perpustakaan sebulan', 0, 5, 'students || murid'],
    ['Number of cousins || Bilangan sepupu', 1, 6, 'students || murid'],
  ].map((x) => ({ name: B(x[0]), lo: x[1], hi: x[2], who: B(x[3]) }));
  /** two-digit-stem contexts; v = integer value, shown as fmt(v) */
  const STEMC = [
    ['marks in a quiz || markah dalam satu kuiz', '', 12, 59, 1, ' marks || markah'], ['heights (cm) || ketinggian (cm)', ' cm', 141, 176, 1, ' cm || cm'],
    ['ages of visitors (years) || umur pengunjung (tahun)', ' years || tahun', 12, 59, 1, ''], ['masses of school bags (kg) || jisim beg sekolah (kg)', ' kg', 21, 58, 10, ' kg || kg'],
    ['travel times to school (minutes) || masa ke sekolah (minit)', ' min', 8, 49, 1, ' minutes || minit'], ['pocket money (RM) || wang saku (RM)', '', 5, 48, 1, ''],
  ].map((x) => ({ w: B(x[0]), u: x[1], lo: x[2], hi: x[3], dv: x[4] }));
  /** time-series contexts */
  const TS = [
    ['rainfall (mm) at a weather station || hujan (mm) di sebuah stesen kaji cuaca', 'Rainfall (mm) || Hujan (mm)', 40, 240, 20, 40], ['visitors (hundreds) to a museum || pengunjung (ratus) ke sebuah muzium', 'Visitors (hundreds) || Pengunjung (ratus)', 5, 40, 1, 5],
    ['books borrowed from the school library || buku yang dipinjam dari perpustakaan sekolah', 'Books borrowed || Buku dipinjam', 20, 90, 5, 10], ['bicycles sold by a shop || basikal yang dijual oleh sebuah kedai', 'Bicycles sold || Basikal dijual', 6, 36, 2, 6],
    ['students absent from school || murid yang tidak hadir ke sekolah', 'Students absent || Murid tidak hadir', 2, 18, 1, 4], ['drinks sold at a canteen stall || minuman yang dijual di sebuah gerai kantin', 'Drinks sold || Minuman dijual', 40, 160, 10, 20],
  ].map((x) => ({ w: B(x[0]), y: B(x[1]), lo: x[2], hi: x[3], st: x[4], ys: x[5] }));
  const MON = { en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ms: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'] };
  const MONF = { en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], ms: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'] };
  const PIE_TOT = [24, 30, 36, 40, 45, 60, 72, 90, 120];
  const ceilTo = (x, s) => Math.ceil(x / s) * s;
  const yAx = (mx) => { const s = mx <= 12 ? 2 : mx <= 25 ? 5 : mx <= 60 ? 10 : mx <= 120 ? 20 : 50; return { ystep: s, ymax: ceilTo(mx + 1, s) }; };

  /** categorical data: k categories, frequencies summing to total, all distinct and >= mn */
  function catData(r, k, total, mn, st) {
    const c = r.pick(CTXS); need(c.cats.length >= k);
    const cats = r.sample(c.cats, k);
    st = st || 1;
    total = total || r.pick(PIE_TOT.filter((t) => t >= k * 6));
    need(total % st === 0);
    return retry(() => {
      const cuts = r.sample(rg(1, total / st - 1), k - 1).sort((a, b) => a - b), f = [];
      let p = 0;
      for (const x of cuts.concat([total / st])) { f.push((x - p) * st); p = x; }
      need(f.every((v) => v >= (mn || 3)) && new Set(f).size === k);
      return { c, name: c.name, cats, f, total, k };
    });
  }
  /** discrete numerical data: raw list of N values in [lo,hi], every value used, frequency table */
  function numData(r, N, kmax) {
    const c = r.pick(NUMC), lo = c.lo, hi = Math.min(c.hi, lo + (kmax || 5));
    return retry(() => {
      const raw = rg(1, N).map(() => r.int(lo, hi)), vals = rg(lo, hi), f = vals.map((v) => raw.filter((x) => x === v).length);
      need(f.every((x) => x >= 1) && new Set(f).size >= f.length - 1 && Math.max(...f) <= 12);
      return { c, raw, vals, f, N, name: c.name, who: c.who };
    });
  }
  function stemData(r, N) {
    const c = r.pick(STEMC);
    return retry(() => {
      const vals = rg(1, N).map(() => r.int(c.lo, c.hi));
      const s = vals.slice().sort((a, b) => a - b);
      need(new Set(s.map((v) => Math.floor(v / 10))).size >= 3 && new Set(vals).size >= N - 2);
      return { c, vals, sorted: s };
    });
  }
  /** random walk for a time series (values are multiples of st) */
  function series(r, ts, len) {
    return retry(() => {
      let v = r.step(ts.lo + 2 * ts.st, ts.hi - 2 * ts.st, ts.st);
      const out = [];
      for (let i = 0; i < len; i++) { out.push(v); v = Math.min(ts.hi, Math.max(ts.lo, v + r.int(-3, 3) * ts.st)); }
      const mx = Math.max(...out), mn = Math.min(...out);
      need(out.indexOf(mx) === out.lastIndexOf(mx) && out.indexOf(mn) === out.lastIndexOf(mn) && new Set(out).size >= len - 2 && mx - mn >= 5 * ts.st);
      return out;
    });
  }

  /* ---------- tables ---------- */
  const BLANK = '&nbsp;&nbsp;&nbsp;&nbsp;';
  const ftab = (d, lang, o) => {
    o = o || {};
    const bl = o.blank || [];
    const head = [d.name[lang], ...d.cats.map((c) => c[lang])], row = [FREQ[lang], ...d.f.map((v, i) => (bl.includes(i) ? BLANK : v))];
    if (o.total !== undefined) { head.push(TOTAL[lang]); row.push(o.total === true ? BLANK : o.total); }
    return SPM.table([row], { head });
  };
  const vtab = (name, vals, f, lang, blank) => SPM.table([[FREQ[lang], ...f.map((v, i) => (blank && blank.includes(i) ? BLANK : v))]], { head: [name[lang], ...vals] });
  const tallyStr = (f) => { let s = ''; for (let i = 0; i < Math.floor(f / 5); i++) s += '<s>IIIII</s> '; return s + 'I'.repeat(f % 5); };

  /* ---------- charts ---------- */
  const SH = [0.16, 0.5, 0.3];
  /** bar chart: vertical or horizontal, one or more series; ymin > 0 gives a truncated axis; null value = missing bar */
  function bars(o) {
    const hz = !!o.horiz, k = o.cats.length, ns = o.series.length, ymin = o.ymin || 0, yMax = o.ticks ? o.ticks.length - 1 : o.ymax, yStep = o.ticks ? 1 : o.ystep;
    const pv = o.ticks ? (v) => { const t = o.ticks; for (let i = 0; i < t.length - 1; i++) if (v <= t[i + 1]) return i + (v - t[i]) / (t[i + 1] - t[i]); return t.length - 1; } : (v) => v;
    const W = o.w || (hz ? 340 : 76 + (Math.max(...o.cats.map((c) => String(c).length)) > 8 ? 68 : 54) * k), H = o.h || (hz ? 56 + 28 * k + (o.title ? 18 : 0) : 210);
    const pl = hz ? 88 : 44, pr = 16, pt = (o.title ? 26 : 12) + (ns > 1 ? 14 : 0), pb = 30 + (o.cl || o.vl ? 12 : 0);
    const L0 = hz ? pl : H - pb, L1 = hz ? W - pr : pt, sv = (v) => L0 + ((pv(v) - ymin) / (yMax - ymin)) * (L1 - L0);
    let out = '';
    for (let v = ymin; v <= yMax + 1e-9; v += yStep) {
      const p = sv(o.ticks ? o.ticks[v] : v), lab = o.nonum ? '' : n(o.ticks ? o.ticks[v] : round(v, 4));
      out += hz ? S.line(p, pt, p, H - pb, { w: 0.5, op: 0.3 }) + S.text(p, H - pb + 11, lab, { s: 10 }) : S.line(pl, p, W - pr, p, { w: 0.5, op: 0.3 }) + S.text(pl - 5, p, lab, { a: 'end', s: 10 });
    }
    out += S.line(pl, pt, pl, H - pb) + S.line(pl, H - pb, W - pr, H - pb);
    const c0 = hz ? pt : pl, cw = (hz ? H - pb - pt : W - pl - pr) / k, bw = (cw * 0.7) / ns;
    o.cats.forEach((c, i) => {
      const mid = c0 + (i + 0.5) * cw;
      out += hz ? S.text(pl - 5, mid, c, { a: 'end', s: 10 }) : S.text(mid, H - pb + 12, c, { s: 10 });
      o.series.forEach((vs, j) => {
        const v = vs[i], off = mid - cw * 0.35 + j * bw;
        if (v === null || v === undefined) return;
        out += hz ? S.rect(pl, off, sv(v) - pl, bw, { fill: 'currentColor', op: SH[j] }) : S.rect(off, sv(v), bw, H - pb - sv(v), { fill: 'currentColor', op: SH[j] });
        if (o.vals) out += hz ? S.text(sv(v) + 9, off + bw / 2, n(v), { s: 10 }) : S.text(off + bw / 2, sv(v) - 7, n(v), { s: 10 });
      });
    });
    if (ymin > 0 && o.brk) out += hz ? S.line(pl + 6, H - pb - 5, pl + 12, H - pb + 5) + S.line(pl + 12, H - pb - 5, pl + 18, H - pb + 5) : S.line(pl - 6, H - pb - 12, pl + 6, H - pb - 18) + S.line(pl - 6, H - pb - 6, pl + 6, H - pb - 12);
    if (o.title) out += S.text(W / 2, 10, o.title, { s: 11, b: true });
    if (ns > 1 && o.legend) o.legend.forEach((t, j) => { const x = pl + j * 90; out += S.rect(x, pt - 17, 9, 9, { fill: 'currentColor', op: SH[j] }) + S.text(x + 13, pt - 12, t, { a: 'start', s: 10 }); });
    if (o.cl) out += hz ? S.text(9, (pt + H - pb) / 2, o.cl, { s: 11, rot: -90 }) : S.text((pl + W - pr) / 2, H - 8, o.cl, { s: 11 });
    if (o.vl) out += hz ? S.text((pl + W - pr) / 2, H - 8, o.vl, { s: 11 }) : S.text(9, (pt + H - pb) / 2, o.vl, { s: 11, rot: -90 });
    return S.wrap(W, H, out, 'bar chart');
  }
  /** pie chart; labels[i] is the full text shown beside sector i */
  function pieSvg(o) {
    const r = o.r || 58, tot = sum(o.vals), W = o.w || 340, top = o.title ? 38 : 26, cy = top + r, H = cy + r + 26, cx = W / 2;
    let a = -Math.PI / 2, out = '';
    const sh = [0.08, 0.22, 0.38, 0.55, 0.14, 0.3, 0.46];
    o.vals.forEach((v, i) => {
      const da = (v / tot) * 2 * Math.PI, x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a), x2 = cx + r * Math.cos(a + da), y2 = cy + r * Math.sin(a + da);
      out += S.path(`M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${da > Math.PI ? 1 : 0} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`, { fill: 'currentColor', op: sh[i % 7] });
      const m = a + da / 2, c = Math.cos(m), s = Math.sin(m);
      out += S.text(cx + (r + 7) * c, cy + (r + (Math.abs(s) > 0.75 ? 13 : 5)) * s, o.labels[i], { a: c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle', s: 11 });
      a += da;
    });
    out += S.circle(cx, cy, r);
    if (o.title) out += S.text(W / 2, 11, o.title, { s: 11, b: true });
    return S.wrap(W, H, out, 'pie chart');
  }
  function dotSvg(vals, lo, hi, o) {
    o = o || {};
    const cnt = {};
    vals.forEach((v) => (cnt[v] = (cnt[v] || 0) + 1));
    const mx = Math.max(...Object.values(cnt)), W = Math.max(280, 36 * (hi - lo + 1) + 40), pl = 26, pr = 20, top = o.title ? 24 : 8, base = top + mx * 11 + 8, H = base + (o.xl ? 34 : 22);
    const sx = (v) => pl + ((v - lo) / (hi - lo)) * (W - pl - pr);
    let out = S.line(pl - 10, base, W - pr + 10, base);
    for (let v = lo; v <= hi; v++) {
      out += S.line(sx(v), base, sx(v), base + 4, { w: 1 }) + S.text(sx(v), base + 14, String(v), { s: 11 });
      if (o.cover !== v) for (let i = 0; i < (cnt[v] || 0); i++) out += S.circle(sx(v), base - 7 - i * 11, 4, { fill: 'currentColor' });
    }
    if (o.cover !== undefined) out += S.rect(sx(o.cover) - 12, top - 2, 24, base - top + 2, { dash: true }) + S.text(sx(o.cover), top + (base - top) / 2, '?', { s: 14 });
    if (o.title) out += S.text(W / 2, 10, o.title, { s: 11, b: true });
    if (o.xl) out += S.text(W / 2, H - 7, o.xl, { s: 11 });
    return S.wrap(W, H, out, 'dot plot');
  }
  /** histogram (touching bars, integer values) or frequency polygon */
  function hist(vals, f, o) {
    const ym = ceilTo(Math.max(...f) + 1, 2), W = o.w || 330, H = 215;
    const poly = !!o.poly, xr = poly ? [vals[0] - 1, vals[vals.length - 1] + 1, 1] : [vals[0] - 0.5, vals[vals.length - 1] + 0.5, 1];
    const pts = poly ? [[vals[0] - 1, 0], ...vals.map((v, i) => [v, f[i]]), [vals[vals.length - 1] + 1, 0]] : vals.map((v, i) => [v, f[i]]);
    return S.graph({ w: W, h: H, xr, yr: [0, ym, 2], xlabel: o.xl, ylabel: o.yl, xlabels: poly ? undefined : null, grid: o.grid === false ? false : true,
      series: [poly ? { pts, type: 'line', dotsToo: true } : { pts, type: 'bars', width: o.bw || 1 }],
      extra: (m) => (poly ? '' : vals.map((v) => S.text(m.sx(v), m.sy(0) + 11, String(v), { s: 10 })).join('')) + (o.title ? S.text(W / 2, 7, o.title, { s: 11, b: true }) : '') });
  }
  /** line graph over labelled x positions; series = [{ys, dash}] ; ymin > 0 -> truncated (mark with brk) */
  function lineSvg(o) {
    const k = o.xs.length, W = o.w || 60 + 40 * k, H = o.h || 210, ymin = o.ymin || 0, pl = 44, pr = 16, pt = (o.title ? 26 : 12) + (o.series.length > 1 ? 14 : 0), pb = 30 + (o.xl ? 12 : 0);
    const sx = (i) => pl + 10 + (i * (W - pl - pr - 20)) / Math.max(1, k - 1), sy = (v) => H - pb - ((v - ymin) / (o.ymax - ymin)) * (H - pt - pb);
    let out = '';
    for (let v = ymin; v <= o.ymax + 1e-9; v += o.ystep) out += S.line(pl, sy(v), W - pr, sy(v), { w: 0.5, op: 0.3 }) + S.text(pl - 5, sy(v), n(round(v, 4)), { a: 'end', s: 10 });
    out += S.line(pl, pt, pl, H - pb) + S.line(pl, H - pb, W - pr, H - pb);
    o.xs.forEach((x, i) => (out += S.text(sx(i), H - pb + 12, x, { s: 10 }) + S.line(sx(i), H - pb, sx(i), H - pb + 3, { w: 1 })));
    o.series.forEach((s, j) => {
      out += S.poly(s.ys.map((v, i) => [sx(i), sy(v)]), { open: true, dash: s.dash, w: 1.6 });
      s.ys.forEach((v, i) => { out += S.dot(sx(i), sy(v), 2.6); if (o.vals) out += S.text(sx(i), sy(v) - 8, n(v), { s: 9 }); });
      if (o.legend) out += S.line(pl + j * 100, pt - 12, pl + j * 100 + 18, pt - 12, { dash: s.dash, w: 1.6 }) + S.text(pl + j * 100 + 22, pt - 12, o.legend[j], { a: 'start', s: 10 });
    });
    if (ymin > 0 && o.brk) out += S.line(pl - 6, H - pb - 12, pl + 6, H - pb - 18) + S.line(pl - 6, H - pb - 6, pl + 6, H - pb - 12);
    if (o.title) out += S.text(W / 2, 10, o.title, { s: 11, b: true });
    if (o.xl) out += S.text((pl + W - pr) / 2, H - 8, o.xl, { s: 11 });
    if (o.yl) out += S.text(9, (pt + H - pb) / 2, o.yl, { s: 11, rot: -90 });
    return S.wrap(W, H, out, 'line graph');
  }
  /** pictograph (prerequisite skill): each symbol = per units; half symbol = per/2 */
  function picSvg(cats, counts, per, unitTxt, lang) {
    const rowH = 24, W = 330, H = cats.length * rowH + 40;
    let out = '';
    cats.forEach((c, i) => {
      const y = 16 + i * rowH;
      out += S.text(8, y, c, { a: 'start', s: 11 });
      const full = Math.floor(counts[i] / per);
      for (let j = 0; j < full; j++) out += S.circle(108 + j * 16, y, 6, { fill: 'currentColor', op: 0.45 });
      if (counts[i] % per) out += S.path(`M${108 + full * 16},${y - 6} A6,6 0 0 0 ${108 + full * 16},${y + 6} Z`, { fill: 'currentColor', op: 0.45 });
    });
    const ky = cats.length * rowH + 26;
    out += S.circle(20, ky, 6, { fill: 'currentColor', op: 0.45 }) + S.text(32, ky, `= ${per} ${unitTxt}`, { a: 'start', s: 11 }) + S.text(W - 8, ky, Ln(lang, 'Key', 'Kunci'), { a: 'end', s: 10, i: true });
    return S.wrap(W, H, out, 'pictograph');
  }
  /** stem-and-leaf plot as html; values are integers; stem = tens; fmt(v) shows the true value in the key */
  function stemHtml(vals, lang, fmt, unit, opt) {
    opt = opt || {};
    const stems = {};
    vals.slice().sort((a, b) => a - b).forEach((v) => (stems[Math.floor(v / 10)] = (stems[Math.floor(v / 10)] || [])).push(v % 10));
    const lo = Math.min(...Object.keys(stems).map(Number)), hi = Math.max(...Object.keys(stems).map(Number));
    const rows = rg(lo, hi).map((s) => `<tr><td style="text-align:right">${s}</td><td style="border-left:1.5px solid currentColor;text-align:left;letter-spacing:.3em">${opt.cover === s ? Ln(lang, '(covered)', '(ditutup)') : (stems[s] || []).join('') || '&nbsp;'}</td></tr>`);
    const kv = opt.key !== undefined ? opt.key : vals[Math.floor(vals.length / 2)];
    return `<table class="qt plain"><thead><tr><th>${Ln(lang, 'Stem', 'Batang')}</th><th style="text-align:left">${Ln(lang, 'Leaf', 'Daun')}</th></tr></thead><tbody>${rows.join('')}</tbody></table><div style="text-align:center;font-size:.9em">${Ln(lang, 'Key', 'Kunci')}: ${Math.floor(kv / 10)} | ${kv % 10} ${Ln(lang, 'means', 'bermaksud')} ${fmt(kv)}${unit}</div>`;
  }
  const sfmt = (dv) => (dv === 10 ? (v) => n(v / 10) : (v) => String(v));
  const angs = (f, tot) => f.map((v) => (v * 360) / tot);
  const listL = (d, arr, lang, sep, suf) => d.cats.map((c, i) => `${c[lang]}: ${arr[i]}${suf || ''}`).join(sep || '; ');
  const rawList = (d, order, lang) => order.map((i) => d.cats[i][lang]).join(', ');
  const rawOrder = (r, d) => r.shuffle(d.f.flatMap((v, i) => Array(v).fill(i)));

  /* ================================================================ 12.1 */
  const ST = [
    'Formulate a statistical question || Merumus soalan statistik', 'Collect data || Mengumpul data',
    'Organise and represent the data || Menyusun dan mewakilkan data', 'Analyse and interpret the data || Menganalisis dan mentafsir data',
    'Make inferences and predictions || Membuat inferens dan ramalan', 'Communicate the findings || Berkomunikasi dapatan',
  ].map(B);
  const STW = [
    'The wording of the question that starts the inquiry is being decided. || Perkataan bagi soalan yang memulakan inkuiri sedang ditentukan.',
    'Values are being gathered from the respondents or by measuring. || Nilai sedang dikumpul daripada responden atau dengan mengukur.',
    'The raw data are being arranged into a table or a chart. || Data mentah sedang disusun ke dalam jadual atau carta.',
    'The display is being read and compared to get information. || Paparan sedang dibaca dan dibandingkan untuk mendapatkan maklumat.',
    'The result is used to say something beyond the data that were collected. || Hasil digunakan untuk menyatakan sesuatu di luar data yang telah dikumpul.',
    'The findings are being reported to other people. || Dapatan sedang dilaporkan kepada orang lain.',
  ].map(B);
  const ACTS = [
    ['@ writes the question "What is the favourite drink of Form 1 students?" || @ menulis soalan "Apakah minuman kegemaran murid Tingkatan 1?"',
      '@ decides to ask "How many hours a day do students in our school spend online?" || @ memutuskan untuk bertanya "Berapa jam sehari murid di sekolah kita melayari internet?"',
      '@ words a clear, neutral question about how students travel to school || @ merangka soalan yang jelas dan neutral tentang cara murid ke sekolah'],
    ['@ hands out a questionnaire to 40 students chosen from all forms || @ mengedarkan soal selidik kepada 40 orang murid yang dipilih daripada semua tingkatan',
      '@ measures the height of every classmate with a tape measure || @ mengukur ketinggian setiap rakan sekelas dengan pita pengukur',
      '@ counts the vehicles passing the school gate on five mornings || @ mengira kenderaan yang melalui pintu pagar sekolah pada lima pagi'],
    ['@ tallies the answers and completes a frequency table || @ membuat tally jawapan dan melengkapkan jadual kekerapan',
      '@ draws a bar chart from the frequency table || @ melukis carta palang daripada jadual kekerapan',
      '@ converts the raw marks into a stem-and-leaf plot || @ menukar markah mentah kepada plot batang dan daun'],
    ['@ finds the category with the highest frequency and its difference from the lowest || @ mencari kategori berkekerapan tertinggi dan bezanya dengan yang terendah',
      '@ compares the heights of two bars and states which is taller || @ membandingkan tinggi dua palang dan menyatakan yang lebih tinggi',
      '@ describes the trend shown by the line graph || @ memerihalkan aliran yang ditunjukkan oleh graf garis'],
    ['@ uses the sample to estimate how many students in the whole school prefer teh tarik || @ menggunakan sampel untuk menganggar bilangan murid seluruh sekolah yang memilih teh tarik',
      '@ predicts next month\'s value from the trend and says it is only approximate || @ meramalkan nilai bulan depan daripada aliran dan menyatakan ia hanya anggaran'],
    ['@ presents the results on a poster with a title, labelled axes and the sample size || @ membentangkan dapatan pada poster dengan tajuk, paksi berlabel dan saiz sampel',
      '@ writes a report that states the findings honestly and mentions their limits || @ menulis laporan yang menyatakan dapatan dengan jujur dan menyebut had-hadnya'],
  ].map((l) => l.map(B));
  const act = (s, nm) => sub(s, '@', nm);

  /* statistical / non-statistical question bank: [question, kind, variable, type] kinds Y (statistical), F, O, V */
  const SQ = [
    ['What is the most popular sport among Form 1 students in our school? || Apakah sukan yang paling popular dalam kalangan murid Tingkatan 1 di sekolah kita?', 'Y', 'favourite sport || sukan kegemaran', 'C'],
    ['How many hours of sleep do students in our class get on a school night? || Berapa jam tidur yang diperoleh murid dalam kelas kita pada malam persekolahan?', 'Y', 'hours of sleep || jam tidur', 'K'],
    ['What are the heights of the students in Form 1 Bestari? || Berapakah ketinggian murid Tingkatan 1 Bestari?', 'Y', 'height || ketinggian', 'K'],
    ['How do students in our school usually travel to school? || Bagaimanakah murid di sekolah kita biasanya pergi ke sekolah?', 'Y', 'mode of transport || cara pengangkutan', 'C'],
    ['How many pets does each student in Form 1 have? || Berapakah bilangan haiwan peliharaan yang dimiliki oleh setiap murid Tingkatan 1?', 'Y', 'number of pets || bilangan haiwan peliharaan', 'D'],
    ['How long does it take students in our school to reach school? || Berapa lamakah masa yang diambil oleh murid di sekolah kita untuk sampai ke sekolah?', 'Y', 'travelling time || masa perjalanan', 'K'],
    ['Which subject do Form 2 students like best? || Mata pelajaran manakah yang paling digemari oleh murid Tingkatan 2?', 'Y', 'favourite subject || mata pelajaran kegemaran', 'C'],
    ['How many brothers and sisters do the students in our class have? || Berapakah bilangan adik-beradik murid dalam kelas kita?', 'Y', 'number of siblings || bilangan adik-beradik', 'D'],
    ['How many goals are scored per match in the school football league? || Berapakah bilangan gol yang dijaringkan bagi setiap perlawanan dalam liga bola sepak sekolah?', 'Y', 'goals per match || gol setiap perlawanan', 'D'],
    ['What are the masses of the school bags carried by Form 2 students? || Berapakah jisim beg sekolah yang dibawa oleh murid Tingkatan 2?', 'Y', 'mass of a school bag || jisim beg sekolah', 'K'],
    ['How many books do students in our school borrow from the library each month? || Berapakah bilangan buku yang dipinjam oleh murid di sekolah kita dari perpustakaan setiap bulan?', 'Y', 'number of books borrowed || bilangan buku yang dipinjam', 'D'],
    ['Which fruit do the farmers in Kampung Baru grow the most? || Buah manakah yang paling banyak ditanam oleh petani di Kampung Baru?', 'Y', 'type of fruit grown || jenis buah yang ditanam', 'C'],
    ['What is the capital city of Malaysia? || Apakah ibu negara Malaysia?', 'F'],
    ['How many days are there in a leap year? || Berapakah bilangan hari dalam tahun lompat?', 'F'],
    ['What is the price of one packet of nasi lemak at the canteen today? || Berapakah harga sebungkus nasi lemak di kantin hari ini?', 'F'],
    ['Who is the principal of our school? || Siapakah pengetua sekolah kita?', 'F'],
    ['How tall is Aisyah? || Berapakah ketinggian Aisyah?', 'O'],
    ['What time does Ali\'s bus arrive at school today? || Pukul berapakah bas Ali tiba di sekolah hari ini?', 'O'],
    ['How many marks did Farid score in the last Mathematics test? || Berapakah markah yang diperoleh Farid dalam ujian Matematik yang lalu?', 'O'],
    ['How many pens are in this pencil box? || Berapakah bilangan pen dalam kotak pensel ini?', 'O'],
    ['Is football better than badminton? || Adakah bola sepak lebih baik daripada badminton?', 'V'],
    ['Is Mathematics the most beautiful subject in the world? || Adakah Matematik mata pelajaran yang paling indah di dunia?', 'V'],
    ['Should the school canteen be closed forever? || Patutkah kantin sekolah ditutup selama-lamanya?', 'V'],
  ].map((x) => ({ q: B(x[0]), k: x[1], v: x[2] && B(x[2]), t: x[3] }));
  const SQY = SQ.filter((x) => x.k === 'Y'), SQN = SQ.filter((x) => x.k !== 'Y');
  const REASON = {
    Y: B('Different answers are expected from different individuals and it can be answered by collecting data. || Jawapan yang berbeza dijangka daripada individu yang berlainan dan ia boleh dijawab dengan mengumpul data.'),
    F: B('It has only one fixed answer, so there is no variability to study. || Ia hanya mempunyai satu jawapan tetap, jadi tiada kebolehubahan untuk dikaji.'),
    O: B('It asks about one particular person or object, so no variation is expected in the data. || Ia bertanya tentang seorang atau satu benda tertentu sahaja, jadi tiada variasi data dijangka.'),
    V: B('It asks for an opinion that cannot be settled by collecting data as it is worded. || Ia meminta pendapat yang tidak dapat diputuskan dengan mengumpul data seperti yang dinyatakan.'),
  };
  const TYPEL = { C: B('categorical || kategori'), D: B('numerical, discrete || berangka, diskret'), K: B('numerical, continuous || berangka, selanjar') };
  const TYPEQ = B('Look at the values: labels, counted whole numbers, or measurements on a scale? || Lihat nilainya: label, nombor bulat yang dibilang, atau ukuran pada satu skala?');
  const TYPEW = {
    C: B('The values are labels, not numbers, so the variable is categorical. || Nilainya ialah label, bukan nombor, jadi pemboleh ubah itu ialah pemboleh ubah kategori.'),
    D: B('The values are counted in whole numbers, so the variable is numerical and discrete. || Nilainya dibilang dalam nombor bulat, jadi pemboleh ubah itu berangka dan diskret.'),
    K: B('The values are measured and may take any value in a range, so the variable is numerical and continuous. || Nilainya diukur dan boleh mengambil sebarang nilai dalam satu julat, jadi pemboleh ubah itu berangka dan selanjar.'),
  };
  const SQW = B('A question is statistical only if its answers vary from one individual to another and can be found by collecting data. || Sesuatu soalan ialah soalan statistik hanya jika jawapannya berbeza-beza dari seorang individu kepada individu yang lain dan boleh diperoleh dengan mengumpul data.');
  const METHW = B('Ask how each value is obtained: by asking people (survey), by watching (observation), with an instrument (measurement) or by counting items one by one (counting). || Tanya bagaimana setiap nilai diperoleh: dengan bertanya kepada orang (tinjauan), dengan memerhati (pemerhatian), dengan alat (pengukuran) atau dengan membilang benda satu demi satu (pengiraan).');
  const VARS = [
    ['the favourite colour of a student || warna kegemaran seorang murid', 'C'], ['the type of pet owned by a family || jenis haiwan peliharaan yang dimiliki oleh sebuah keluarga', 'C'],
    ['the mode of transport used to go to school || cara pengangkutan yang digunakan untuk ke sekolah', 'C'], ['the flavour of ice cream chosen by a customer || perisa aiskrim yang dipilih oleh seorang pelanggan', 'C'],
    ['the language spoken at home || bahasa yang dituturkan di rumah', 'C'], ['the favourite subject of a student || mata pelajaran kegemaran seorang murid', 'C'],
    
    ['the number of siblings of a student || bilangan adik-beradik seorang murid', 'D'], ['the number of goals scored in a match || bilangan gol yang dijaringkan dalam satu perlawanan', 'D'],
    ['the number of books a student reads in a month || bilangan buku yang dibaca oleh seorang murid dalam sebulan', 'D'], ['the number of students in a class || bilangan murid dalam sebuah kelas', 'D'],
    ['the number of cars in a car park || bilangan kereta di sebuah tempat letak kereta', 'D'], ['the number of eggs in a tray || bilangan telur dalam sebuah dulang', 'D'],
    ['the number of text messages sent in a day || bilangan mesej teks yang dihantar dalam sehari', 'D'], 
    ['the height of a student || ketinggian seorang murid', 'K'], ['the mass of a school bag || jisim sebuah beg sekolah', 'K'],
    ['the time taken to run 100 m || masa yang diambil untuk berlari 100 m', 'K'], ['the distance from a student\'s house to school || jarak dari rumah seorang murid ke sekolah', 'K'],
    ['the volume of water in a bottle || isi padu air dalam sebotol', 'K'], 
    ['the amount of rainfall in a day || jumlah hujan dalam sehari', 'K'],
  ].map((x) => ({ v: B(x[0]), t: x[1] }));
  const METHN = ['a survey (questionnaire) || tinjauan (soal selidik)', 'observation || pemerhatian', 'measurement || pengukuran', 'counting || pengiraan'].map(B);
  const METHX = [
    'it asks people directly for their choices, opinions or habits || ia bertanya terus kepada orang tentang pilihan, pendapat atau tabiat mereka',
    'the behaviour is watched and recorded as it happens || tingkah laku dilihat dan direkodkan semasa ia berlaku',
    'the quantity must be found with an instrument such as a ruler, tape measure, scale or stopwatch || kuantiti mesti ditentukan dengan alat seperti pembaris, pita pengukur, penimbang atau jam randik',
    'the data are whole numbers of items that can be counted one by one || data ialah bilangan penuh benda yang boleh dikira satu demi satu',
  ].map(B);
  const METH = [
    ['find out which club Form 1 students want to join || mengetahui kelab yang ingin disertai oleh murid Tingkatan 1', 0], ['find how students feel about the new school timetable || mengetahui perasaan murid terhadap jadual waktu sekolah yang baharu', 0],
    ['find the favourite lunch of Form 2 students || mengetahui makanan tengah hari kegemaran murid Tingkatan 2', 0], ['find how many hours students spend on homework || mengetahui bilangan jam murid melakukan kerja rumah', 0],
    ['find how many students put their litter in the bin during recess || mengetahui bilangan murid yang membuang sampah ke dalam tong sampah semasa rehat', 1], ['find how many drivers wear seat belts at the school gate || mengetahui bilangan pemandu yang memakai tali pinggang keledar di pintu pagar sekolah', 1],
    ['record what students do in the field during recess || merekod aktiviti murid di padang semasa rehat', 1], ['find how many motorcyclists stop at a red light at a junction || mengetahui bilangan penunggang motosikal yang berhenti di lampu merah di sebuah simpang', 1],
    ['find the time taken by students to run 100 m || mengetahui masa yang diambil oleh murid untuk berlari 100 m', 2], ['find the masses of the school bags of Form 1 students || mengetahui jisim beg sekolah murid Tingkatan 1', 2],
    ['find the number of students in each school club || mengetahui bilangan murid dalam setiap kelab sekolah', 3], ['find the number of cars in the car park at 8 a.m. on different days || mengetahui bilangan kereta di tempat letak kereta pada pukul 8 pagi pada hari yang berlainan', 3],
    ['find the number of books on each shelf of the library || mengetahui bilangan buku pada setiap rak perpustakaan', 3], ['find how many red cars pass the school gate in 30 minutes || mengetahui bilangan kereta merah yang melalui pintu pagar sekolah dalam 30 minit', 3],
  ].map((x) => ({ s: B(x[0]), m: x[1] }));

  const BAD = [
    ['Don\'t you agree that the canteen food is too expensive? || Tidakkah anda bersetuju bahawa makanan kantin terlalu mahal?', 'L', 'How would you rate the price of the canteen food? (Cheap / Reasonable / Expensive) || Bagaimanakah anda menilai harga makanan kantin? (Murah / Berpatutan / Mahal)'],
    ['Wouldn\'t you say our school has the best football team? || Bukankah anda bersetuju sekolah kita mempunyai pasukan bola sepak yang terbaik?', 'L', 'How would you rate our school football team? (Very good / Good / Average / Poor) || Bagaimanakah anda menilai pasukan bola sepak sekolah kita? (Sangat baik / Baik / Sederhana / Lemah)'],
    ['Don\'t you think that reading is boring? || Tidakkah anda fikir membaca itu membosankan?', 'L', 'How much do you enjoy reading? (A lot / Some / Not much / Not at all) || Sejauh manakah anda gemar membaca? (Sangat / Sedikit / Tidak begitu / Tidak langsung)'],
    ['Which do you prefer: delicious nasi lemak or plain, boring roti bakar? || Yang manakah anda pilih: nasi lemak yang lazat atau roti bakar yang hambar dan membosankan?', 'L', 'Which do you prefer for breakfast: nasi lemak or roti bakar? || Yang manakah anda pilih untuk sarapan: nasi lemak atau roti bakar?'],
    ['Do students like the canteen? || Adakah murid suka kantin?', 'V', 'How often do you buy food from the canteen? (Every day / 3 to 4 times a week / 1 to 2 times a week / Never) || Berapa kerapkah anda membeli makanan di kantin? (Setiap hari / 3 hingga 4 kali seminggu / 1 hingga 2 kali seminggu / Tidak pernah)'],
    ['How many hours do you study and how many hours do you sleep each day? || Berapa jam anda belajar dan berapa jam anda tidur setiap hari?', 'D', 'Two separate questions: (1) How many hours do you study each day? (2) How many hours do you sleep each day? || Dua soalan berasingan: (1) Berapa jam anda belajar setiap hari? (2) Berapa jam anda tidur setiap hari?'],
    ['What is the height of the class monitor of Form 1 Bestari? || Berapakah ketinggian ketua kelas Tingkatan 1 Bestari?', 'N', 'What are the heights of the students in Form 1 Bestari? || Berapakah ketinggian murid Tingkatan 1 Bestari?'],
    ['How old is our principal? || Berapakah umur pengetua kita?', 'N', 'How old are the teachers in our school? || Berapakah umur guru di sekolah kita?'],
  ].map((x) => ({ q: B(x[0]), k: x[1], fix: B(x[2]) }));
  const BADK = {
    L: B('a leading question: it pushes the respondent towards one answer || soalan mengarahkan: ia mendorong responden kepada satu jawapan'),
    V: B('vague: the words are unclear, so people will understand it differently || kabur: perkataannya tidak jelas, jadi orang akan memahaminya secara berbeza'),
    D: B('two questions in one: it cannot be answered clearly || dua soalan dalam satu: ia tidak dapat dijawab dengan jelas'),
    O: B('the answer options are unbalanced: there is no negative choice || pilihan jawapan tidak seimbang: tiada pilihan negatif'),
    N: B('not a statistical question: it has only one answer or asks about one person || bukan soalan statistik: ia hanya mempunyai satu jawapan atau bertanya tentang seorang sahaja'),
  };
  const BADS = { L: B('leading || mengarahkan'), V: B('vague || kabur'), D: B('two questions in one || dua soalan dalam satu'), O: B('unbalanced options || pilihan tidak seimbang'), N: B('not statistical || bukan statistik') };

  /* inquiry plan bank: [question, population, variable, type, method, representation + reason] */
  const INQ = [
    ['How do Form 1 students in our school travel to school? || Bagaimanakah murid Tingkatan 1 di sekolah kita ke sekolah?', 'all Form 1 students of the school || semua murid Tingkatan 1 sekolah itu', 'mode of transport || cara pengangkutan', 'C', 0, 'bar chart or pie chart: to compare the categories || carta palang atau carta pai: untuk membandingkan kategori'],
    ['How many hours do Form 2 students sleep on a school night? || Berapa jam murid Tingkatan 2 tidur pada malam persekolahan?', 'all Form 2 students of the school || semua murid Tingkatan 2 sekolah itu', 'hours of sleep || jam tidur', 'K', 0, 'stem-and-leaf plot or dot plot: to keep every value and show the spread || plot batang dan daun atau plot titik: untuk mengekalkan setiap nilai dan menunjukkan serakan'],
    ['How many goals are scored per match in the school football league? || Berapakah gol yang dijaringkan bagi setiap perlawanan dalam liga bola sepak sekolah?', 'all matches of the league || semua perlawanan liga itu', 'goals per match || gol setiap perlawanan', 'D', 3, 'dot plot or histogram: to show how the numbers are distributed || plot titik atau histogram: untuk menunjukkan taburan nombor'],
    ['How many cars enter the school compound each morning? || Berapakah kereta yang memasuki kawasan sekolah setiap pagi?', 'all mornings of a school week || semua pagi dalam seminggu persekolahan', 'number of cars per morning || bilangan kereta setiap pagi', 'D', 3, 'bar chart or line graph over the days || carta palang atau graf garis mengikut hari'],
    ['What are the heights of the girls in Form 1? || Berapakah ketinggian murid perempuan Tingkatan 1?', 'all girls in Form 1 || semua murid perempuan Tingkatan 1', 'height || ketinggian', 'K', 2, 'histogram or stem-and-leaf plot: to see the shape of the data || histogram atau plot batang dan daun: untuk melihat bentuk data'],
    ['What is the favourite subject of the students in Form 5? || Apakah mata pelajaran kegemaran murid Tingkatan 5?', 'all Form 5 students || semua murid Tingkatan 5', 'favourite subject || mata pelajaran kegemaran', 'C', 0, 'pie chart: parts of a whole || carta pai: bahagian daripada keseluruhan'],
  ].map((x) => ({ q: B(x[0]), p: B(x[1]), v: B(x[2]), t: x[3], m: x[4], g: B(x[5]) }));

  const FLAWQ = [
    ['A student wants to find the favourite subject of all Form 1 students. Only 8 close friends are asked, and the result is presented as the choice of the whole school. || Seorang murid ingin mengetahui mata pelajaran kegemaran semua murid Tingkatan 1. Hanya 8 orang rakan rapat ditanya, dan keputusan dibentangkan sebagai pilihan seluruh sekolah.', 'The sample is too small and unrepresentative, and the conclusion is over-generalised. Ask a larger sample from every class and report only what the sample supports. || Sampel terlalu kecil dan tidak mewakili, dan kesimpulan digeneralisasikan secara berlebihan. Tanya sampel yang lebih besar daripada setiap kelas dan laporkan hanya apa yang disokong oleh sampel.'],
    ['On days when many ice creams were sold it did not rain, so a student concludes that selling ice cream stops the rain. || Pada hari banyak aiskrim dijual, hujan tidak turun, maka seorang murid membuat kesimpulan bahawa menjual aiskrim menghentikan hujan.', 'A pattern between two variables does not prove that one causes the other. State the observation only, and look for other factors such as the weather. || Corak antara dua pemboleh ubah tidak membuktikan yang satu menyebabkan yang lain. Nyatakan pemerhatian sahaja, dan cari faktor lain seperti cuaca.'],
    ['A student asks "Don\'t you agree that the canteen is dirty?" and reports that 90% agree. || Seorang murid bertanya "Tidakkah anda bersetuju kantin itu kotor?" dan melaporkan 90% bersetuju.', 'The question is leading. Use a neutral question such as "How clean is the canteen?" with balanced options. || Soalan itu mengarahkan. Gunakan soalan neutral seperti "Sejauh manakah bersihnya kantin?" dengan pilihan yang seimbang.'],
  ].map((x) => ({ s: B(x[0]), f: B(x[1]) }));

  const GEN_CTX = [
    ['the school canteen || kantin sekolah', 'Which food is bought most often at our school canteen? || Makanan apakah yang paling kerap dibeli di kantin sekolah kita?', 'type of food bought || jenis makanan yang dibeli'],
    ['sleep || tidur', 'How many hours do Form 1 students sleep on a school night? || Berapa jam murid Tingkatan 1 tidur pada malam persekolahan?', 'hours of sleep || jam tidur'],
    ['travelling to school || perjalanan ke sekolah', 'How long does it take our students to travel to school? || Berapa lamakah murid kita mengambil masa untuk ke sekolah?', 'travelling time || masa perjalanan'],
    ['pets || haiwan peliharaan', 'How many pets does each family in Form 2 have? || Berapakah haiwan peliharaan yang dimiliki oleh setiap keluarga murid Tingkatan 2?', 'number of pets || bilangan haiwan peliharaan'],
    ['Sports Day || Hari Sukan', 'Which event do Form 3 students want to take part in on Sports Day? || Acara manakah yang ingin disertai oleh murid Tingkatan 3 pada Hari Sukan?', 'event chosen || acara yang dipilih'],
    ['drinking water || minum air', 'How many glasses of water do students drink in a school day? || Berapa gelas air yang diminum oleh murid dalam sehari di sekolah?', 'number of glasses of water || bilangan gelas air'],
    ['the weather || cuaca', 'What is the highest temperature recorded in our town each day of a month? || Berapakah suhu tertinggi yang direkodkan di pekan kita setiap hari dalam sebulan?', 'highest daily temperature || suhu tertinggi harian'],
  ].map((x) => ({ c: B(x[0]), q: B(x[1]), v: B(x[2]) }));

  const g121e = [
    (r) => { const it = r.pick(SQ); return { q: T(`Is the following a statistical question? Answer Yes or No and give a reason.<br>"${it.q.en}"`, `Adakah yang berikut soalan statistik? Jawab Ya atau Tidak dan berikan sebab.<br>"${it.q.ms}"`), a: cat(YN(it.k === 'Y'), '. ', REASON[it.k]), w: W(SQW, cat(YN(it.k === 'Y'), ': ', REASON[it.k])), sp: 's' }; },
    (r) => { const right = r.pick(SQY), w = r.sample(SQN, 3), o = mc(r, right.q, w.map((x) => x.q)); return { q: T(`Which one of these is a statistical question?<br>${o.en}`, `Yang manakah antara berikut ialah soalan statistik?<br>${o.ms}`), a: T(`(${o.letter}). ${REASON.Y.en}`, `(${o.letter}). ${REASON.Y.ms}`), w: W(SQW, T(`(${o.letter}): ${REASON.Y.en}`, `(${o.letter}): ${REASON.Y.ms}`), B('Each of the other three has one fixed answer, asks about one individual, or asks only for an opinion. || Setiap satu daripada tiga yang lain mempunyai satu jawapan tetap, bertanya tentang seorang individu sahaja, atau hanya meminta pendapat.')), sp: 's' }; },
    (r) => { const right = r.pick(SQN), w = r.sample(SQY, 3), o = mc(r, right.q, w.map((x) => x.q)); return { q: T(`Which one of these is NOT a statistical question?<br>${o.en}`, `Yang manakah antara berikut BUKAN soalan statistik?<br>${o.ms}`), a: T(`(${o.letter}). ${REASON[right.k].en}`, `(${o.letter}). ${REASON[right.k].ms}`), w: W(SQW, T(`(${o.letter}): ${REASON[right.k].en}`, `(${o.letter}): ${REASON[right.k].ms}`), B('The other three expect answers that vary from one individual to another. || Tiga yang lain menjangkakan jawapan yang berbeza-beza dari seorang individu kepada yang lain.')), sp: 's' }; },
    (r) => { const v = r.pick(VARS); return { q: T(`Is the variable "${v.v.en}" categorical or numerical? If it is numerical, state whether it is discrete or continuous.`, `Adakah pemboleh ubah "${v.v.ms}" kategori atau berangka? Jika berangka, nyatakan sama ada ia diskret atau selanjar.`), a: TYPEL[v.t], w: W(TYPEQ, TYPEW[v.t]), sp: 's' }; },
    (r) => {
      const t = r.pick(['C', 'D', 'K']), right = r.pick(VARS.filter((x) => x.t === t)), w = r.sample(VARS.filter((x) => x.t !== t), 3);
      const o = mc(r, right.v, w.map((x) => x.v));
      const nm = { C: B('a categorical variable || pemboleh ubah kategori'), D: B('a discrete numerical variable || pemboleh ubah berangka diskret'), K: B('a continuous numerical variable || pemboleh ubah berangka selanjar') }[t];
      return { q: T(`Which of these is ${nm.en}?<br>${o.en}`, `Yang manakah antara berikut ialah ${nm.ms}?<br>${o.ms}`), a: o.ans, w: W(TYPEQ, cat(o.ans, ': ', TYPEW[t])), sp: 's' };
    },
    (r) => { const nm = r.name(), a = r.pick(ACTS.map((l, i) => [i, r.pick(l)])); const o = mc(r, ST[a[0]], r.sample(ST.filter((_, i) => i !== a[0]), 3)); return { q: T(`${act(a[1], nm).en}. Which stage of a statistical inquiry is this?<br>${o.en}`, `${act(a[1], nm).ms}. Peringkat manakah dalam inkuiri statistik ini?<br>${o.ms}`), a: o.ans, w: W(STW[a[0]], o.ans), sp: 's' }; },
    (r) => {
      const miss = r.int(1, 4), order = ST.filter((_, i) => i !== miss);
      return { q: T(`A student lists the stages of an inquiry in order: ${order.map((s) => s.en).join(' → ')}. One stage is missing. Which one?`, `Seorang murid menyenaraikan peringkat inkuiri mengikut turutan: ${order.map((s) => s.ms).join(' → ')}. Satu peringkat tertinggal. Yang manakah?`), a: ST[miss], w: W(B('Write the six stages of the inquiry cycle in order and compare them with the list. || Tulis enam peringkat kitaran inkuiri mengikut turutan dan bandingkannya dengan senarai itu.'), T(`The missing stage comes between "${ST[miss - 1].en}" and "${ST[miss + 1].en}": ${ST[miss].en}.`, `Peringkat yang tertinggal berada antara "${ST[miss - 1].ms}" dan "${ST[miss + 1].ms}": ${ST[miss].ms}.`)), sp: 's' };
    },
    (r) => { const it = r.pick(METH); return { q: T(`Which method of collecting data is most suitable to ${it.s.en}: a survey, observation, measurement or counting?`, `Kaedah pengumpulan data manakah yang paling sesuai untuk ${it.s.ms}: tinjauan, pemerhatian, pengukuran atau pengiraan?`), a: cat(METHN[it.m], '; ', METHX[it.m]), w: W(METHW, cat(METHX[it.m], T(' → ', ' → '), METHN[it.m])), sp: 's' }; },
    (r) => { const it = r.pick(SQY); return { q: T(`State the variable in the statistical question "${it.q.en}" and whether it is categorical or numerical.`, `Nyatakan pemboleh ubah dalam soalan statistik "${it.q.ms}" dan sama ada ia kategori atau berangka.`), a: cat(it.v, '; ', TYPEL[it.t]), w: W(B('The variable is the quantity that is recorded for each individual, and it changes from one to another. || Pemboleh ubah ialah kuantiti yang direkodkan bagi setiap individu, dan ia berubah dari seorang kepada yang lain.'), cat(it.v, T(': ', ': '), TYPEW[it.t])), sp: 's' }; },
  ];
  const ASP = [
    ['the population (who or what is studied) || populasi (siapa atau apa yang dikaji)', (x) => x.p],
    ['the variable || pemboleh ubah', (x) => x.v],
    ['the type of the variable (categorical, discrete or continuous) || jenis pemboleh ubah (kategori, diskret atau selanjar)', (x) => TYPEL[x.t]],
    ['a suitable method of collecting the data || kaedah yang sesuai untuk mengumpul data', (x) => METHN[x.m]],
    ['a suitable representation, with a reason || perwakilan yang sesuai, dengan sebab', (x) => x.g],
  ].map((x) => ({ s: B(x[0]), f: x[1] }));
  const BADCHK = B('Check the wording: does it push one answer, can it be understood in different ways, does it ask two things at once, are the options unbalanced, or has it only one answer? || Semak perkataannya: adakah ia mendorong satu jawapan, bolehkah ia difahami secara berbeza, adakah ia bertanya dua perkara sekali gus, adakah pilihannya tidak seimbang, atau adakah ia hanya mempunyai satu jawapan?');
  const FIXW = B('Rewrite it neutrally: name the variable clearly and offer balanced options, so that the answers may vary. || Tulis semula secara neutral: namakan pemboleh ubah dengan jelas dan berikan pilihan yang seimbang, supaya jawapannya boleh berbeza-beza.');
  const FLAWCHK = B('Check three things: is the sample large and representative, does the conclusion stay within the data, and is the question neutral? || Semak tiga perkara: adakah sampel besar dan mewakili, adakah kesimpulan kekal dalam lingkungan data, dan adakah soalan itu neutral?');
  const ASPW = B('Population = who is studied; variable = what is recorded for each one; its type = label, count or measurement; method = how the values are obtained; representation = the display that shows the data most clearly. || Populasi = siapa yang dikaji; pemboleh ubah = apa yang direkodkan bagi setiap satu; jenisnya = label, bilangan atau ukuran; kaedah = cara nilai diperoleh; perwakilan = paparan yang menunjukkan data dengan paling jelas.');
  const REPW = B('Match the variable to the display: categories → bar chart or pie chart; a value over time → line graph; numerical values → dot plot, stem-and-leaf plot or histogram. || Padankan pemboleh ubah dengan paparan: kategori → carta palang atau carta pai; nilai mengikut masa → graf garis; nilai berangka → plot titik, plot batang dan daun atau histogram.');
  const g121m = [
    (r) => {
      const it = r.pick(BAD), w = r.sample(Object.keys(BADK).filter((k) => k !== it.k), 3);
      const o = mc(r, BADS[it.k], w.map((k) => BADS[k]));
      return { q: T(`The survey question "${it.q.en}" is not good. What is wrong with it?<br>${o.en}`, `Soalan tinjauan "${it.q.ms}" tidak baik. Apakah kesalahannya?<br>${o.ms}`), a: T(`(${o.letter}). ${BADK[it.k].en}`, `(${o.letter}). ${BADK[it.k].ms}`), w: W(BADCHK, cat(T(`(${o.letter}) `, `(${o.letter}) `), BADK[it.k])), sp: 's' };
    },
    (r) => { const it = r.pick(BAD); return { q: T(`Rewrite the survey question "${it.q.en}" so that it is a clear, neutral statistical question.`, `Tulis semula soalan tinjauan "${it.q.ms}" supaya menjadi soalan statistik yang jelas dan neutral.`), a: cat(T('Sample answer: ', 'Contoh jawapan: '), it.fix), w: W(cat(T('What is wrong: ', 'Kesalahannya: '), BADK[it.k]), FIXW), sp: 'm' }; },
    (r) => { const it = r.pick(BAD); return { q: T(`A student plans to ask: "${it.q.en}" (a) State what is wrong with this question. (b) Write an improved question.`, `Seorang murid merancang untuk bertanya: "${it.q.ms}" (a) Nyatakan kesalahan soalan ini. (b) Tulis soalan yang lebih baik.`), a: SPM.parts([BADK[it.k], it.fix]), w: W(cat('(a) ', BADCHK), cat('(a) ', BADK[it.k]), cat('(b) ', FIXW)), sp: 'm' }; },
    (r) => {
      const it = r.pick(INQ), asp = r.sample(ASP, r.int(2, 3));
      return { q: T(`A student wants to answer the statistical question "${it.q.en}" For this inquiry, state ${asp.map((a) => a.s.en).join('; ')}.`, `Seorang murid ingin menjawab soalan statistik "${it.q.ms}" Bagi inkuiri ini, nyatakan ${asp.map((a) => a.s.ms).join('; ')}.`), a: SPM.parts(asp.map((a) => a.f(it))), w: W(ASPW, cat(T('Here the variable is ', 'Di sini pemboleh ubahnya ialah '), it.v, T(', which is ', ', iaitu '), TYPEL[it.t], '.')), sp: 'm' };
    },
    (r) => { const it = r.pick(FLAWQ); return { q: T(`Read the description and identify what is wrong in the inquiry, then suggest how to correct it.<br>${it.s.en}`, `Baca penerangan dan kenal pasti kesalahan dalam inkuiri itu, kemudian cadangkan cara membetulkannya.<br>${it.s.ms}`), a: it.f, w: W(FLAWCHK, it.f), sp: 'm' }; },
    (r) => { const c = r.pick(GEN_CTX); return { q: T(`Write a statistical question about ${c.c.en} for the students of your school. State the variable in your question.`, `Tulis satu soalan statistik tentang ${c.c.ms} untuk murid di sekolah anda. Nyatakan pemboleh ubah dalam soalan anda.`), a: cat(T('Sample answer: "', 'Contoh jawapan: "'), c.q, T('" Variable: ', '" Pemboleh ubah: '), c.v), w: W(B('A good statistical question names the group, names one variable that can be counted or measured, and expects answers that vary. || Soalan statistik yang baik menamakan kumpulan, menamakan satu pemboleh ubah yang boleh dibilang atau diukur, dan menjangkakan jawapan yang berbeza-beza.'), cat(T('Variable: ', 'Pemboleh ubah: '), c.v)), sp: 'm' }; },
    (r) => {
      const v = r.sample(VARS, 3); need(new Set(v.map((x) => x.t)).size >= 2);
      return { q: T(`Classify each variable as categorical, numerical discrete or numerical continuous: (a) ${v[0].v.en}; (b) ${v[1].v.en}; (c) ${v[2].v.en}.`, `Kelaskan setiap pemboleh ubah sebagai kategori, berangka diskret atau berangka selanjar: (a) ${v[0].v.ms}; (b) ${v[1].v.ms}; (c) ${v[2].v.ms}.`), a: SPM.parts(v.map((x) => TYPEL[x.t])), w: W(TYPEQ, cat('(a) ', TYPEW[v[0].t]), cat('(b) ', TYPEW[v[1].t]), cat('(c) ', TYPEW[v[2].t])), sp: 'm' };
    },
    (r) => {
      const ys = r.sample(SQY, r.int(2, 3)), ns = r.sample(SQN, 5 - ys.length), all = r.shuffle(ys.concat(ns));
      const ids = all.map((x, i) => (x.k === 'Y' ? LET[i] : null)).filter(Boolean);
      return { q: T(`Which of these are statistical questions? ${all.map((x, i) => `(${LET[i]}) ${x.q.en}`).join(' ')}`, `Yang manakah antara berikut ialah soalan statistik? ${all.map((x, i) => `(${LET[i]}) ${x.q.ms}`).join(' ')}`), a: T(ids.join(', ')), w: W(SQW, T(`Statistical: ${ids.join(', ')}. The others have one fixed answer, ask about one individual, or ask only for an opinion.`, `Soalan statistik: ${ids.join(', ')}. Yang lain mempunyai satu jawapan tetap, bertanya tentang seorang individu sahaja, atau hanya meminta pendapat.`)), sp: 's' };
    },
    (r) => {
      const [a, b] = r.sample(METH, 2); need(a.m !== b.m);
      return { q: T(`State the most suitable way of collecting data, and give a reason, to (a) ${a.s.en}; (b) ${b.s.en}.`, `Nyatakan cara pengumpulan data yang paling sesuai, dan berikan sebab, untuk (a) ${a.s.ms}; (b) ${b.s.ms}.`), a: SPM.parts([cat(METHN[a.m], ': ', METHX[a.m]), cat(METHN[b.m], ': ', METHX[b.m])]), w: W(METHW, cat('(a) ', METHX[a.m], T(' → ', ' → '), METHN[a.m]), cat('(b) ', METHX[b.m], T(' → ', ' → '), METHN[b.m])), sp: 'm' };
    },
  ];
  const POPS = [
    ['a school with {N} students || sebuah sekolah dengan {N} orang murid', 'students of the school || murid sekolah itu'],
    ['a Form 1 with {N} students || Tingkatan 1 dengan {N} orang murid', 'Form 1 students || murid Tingkatan 1'],
    ['a town with {N} households || sebuah pekan dengan {N} buah isi rumah', 'households of the town || isi rumah di pekan itu'],
  ].map((x) => ({ a: B(x[0]), p: B(x[1]) }));
  const g121a = [
    (r) => {
      const c = r.pick(GEN_CTX), parts = [
        ['a statistical question || soalan statistik', (x) => x.q], ['the variable and its type || pemboleh ubah dan jenisnya', (x) => x.v],
        ['how you would collect the data || cara anda mengumpul data', () => B('For example, a questionnaire or measuring the values directly, depending on the variable. || Contohnya, soal selidik atau mengukur nilai secara terus, bergantung pada pemboleh ubah.')],
        ['how you would choose a sample and one possible bias || cara anda memilih sampel dan satu kemungkinan bias', () => B('Choose students at random from every class; bias arises if only friends or one class are asked. || Pilih murid secara rawak daripada setiap kelas; bias berlaku jika hanya rakan atau satu kelas ditanya.')],
        ['how you would represent the data and why || cara anda mewakilkan data dan sebabnya', () => B('A bar chart for categories, or a dot plot or histogram for numbers, because it shows the frequencies clearly. || Carta palang untuk kategori, atau plot titik atau histogram untuk nombor, kerana ia menunjukkan kekerapan dengan jelas.')],
        ['how you would communicate your findings honestly || cara anda berkomunikasi dapatan dengan jujur', () => B('Give a title, labelled axes, sample size, and say the results apply only to the group surveyed. || Berikan tajuk, paksi berlabel, saiz sampel, dan nyatakan keputusan hanya terpakai kepada kumpulan yang ditinjau.')],
      ].map((x) => ({ s: B(x[0]), f: x[1] }));
      const pick = r.sample(parts, r.int(3, 5));
      return { q: T(`Plan a statistical inquiry about ${c.c.en}. State ${pick.map((x) => x.s.en).join('; ')}.`, `Rancang satu inkuiri statistik tentang ${c.c.ms}. Nyatakan ${pick.map((x) => x.s.ms).join('; ')}.`), a: cat(T('Sample answer. ', 'Contoh jawapan. '), SPM.parts(pick.map((x) => x.f(c)))), w: W(B('Work through the inquiry cycle in order: question → collect → organise → analyse → infer → communicate. || Ikut kitaran inkuiri mengikut turutan: soalan → kumpul → susun → analisis → inferens → komunikasi.'), cat(T('Here the question is about ', 'Di sini soalannya adalah tentang '), c.c, T('; the variable is ', '; pemboleh ubahnya ialah '), c.v, '.'), B('Each stage uses the result of the stage before it, and the sample decides how far the conclusion may be taken. || Setiap peringkat menggunakan hasil peringkat sebelumnya, dan sampel menentukan sejauh mana kesimpulan boleh dibawa.')), sp: 'l' };
    },
    (r) => {
      const [f1, f2] = r.sample(FLAWQ, 2), nm = r.name();
      return { q: T(`Two investigations were carried out by ${nm}. Investigation 1: ${f1.s.en} Investigation 2: ${f2.s.en} For each, identify the main flaw and state a correction.`, `Dua penyiasatan dijalankan oleh ${nm}. Penyiasatan 1: ${f1.s.ms} Penyiasatan 2: ${f2.s.ms} Bagi setiap satu, kenal pasti kelemahan utama dan nyatakan pembetulannya.`), a: SPM.parts([f1.f, f2.f]), w: W(FLAWCHK, B('Name the flaw first, then give a correction that removes it. || Namakan kelemahan dahulu, kemudian berikan pembetulan yang menghapuskannya.')), sp: 'l' };
    },
    (r) => {
      const qs = r.sample(INQ, 3);
      return { q: T(`Choose a suitable representation for each inquiry and justify your choice. (a) ${qs[0].q.en} (b) ${qs[1].q.en} (c) ${qs[2].q.en}`, `Pilih perwakilan yang sesuai bagi setiap inkuiri dan justifikasikan pilihan anda. (a) ${qs[0].q.ms} (b) ${qs[1].q.ms} (c) ${qs[2].q.ms}`), a: cat(T('Sample answer. ', 'Contoh jawapan. '), SPM.parts(qs.map((x) => x.g))), w: W(REPW, cat('(a) ', qs[0].v, T(' is ', ' ialah '), TYPEL[qs[0].t], '.'), cat('(b) ', qs[1].v, T(' is ', ' ialah '), TYPEL[qs[1].t], '.'), cat('(c) ', qs[2].v, T(' is ', ' ialah '), TYPEL[qs[2].t], '.')), sp: 'l' };
    },
    (r) => {
      const nm = r.name(), idx = r.int(0, 4), pick = ACTS.map((l) => act(r.pick(l), nm));
      const seq = pick.slice(); [seq[idx], seq[idx + 1]] = [seq[idx + 1], seq[idx]];
      return { q: T(`${nm} carried out these steps in this order: ${seq.map((s, i) => `${i + 1}. ${s.en}`).join('; ')}. One pair of neighbouring steps is in the wrong order. Which two steps should be swapped, and why does the order matter?`, `${nm} menjalankan langkah-langkah ini mengikut turutan: ${seq.map((s, i) => `${i + 1}. ${s.ms}`).join('; ')}. Satu pasangan langkah bersebelahan tidak mengikut turutan yang betul. Langkah manakah yang perlu ditukar, dan mengapa turutan itu penting?`), a: T(`Steps ${idx + 1} and ${idx + 2}: "${ST[idx].en}" must come before "${ST[idx + 1].en}", because each stage uses the result of the stage before it.`, `Langkah ${idx + 1} dan ${idx + 2}: "${ST[idx].ms}" mesti datang sebelum "${ST[idx + 1].ms}", kerana setiap peringkat menggunakan hasil peringkat sebelumnya.`), w: W(T(`In the inquiry cycle "${ST[idx].en}" is stage ${idx + 1} and "${ST[idx + 1].en}" is stage ${idx + 2}.`, `Dalam kitaran inkuiri, "${ST[idx].ms}" ialah peringkat ${idx + 1} dan "${ST[idx + 1].ms}" ialah peringkat ${idx + 2}.`), B('In the list the two appear the other way round, so those two neighbouring steps must be swapped. || Dalam senarai itu kedua-duanya muncul secara terbalik, jadi dua langkah bersebelahan itu mesti ditukar.')), sp: 'm' };
    },
    (r) => {
      const a = r.pick(GEN_CTX);
      const pair = r.chance() ? [a.q, B(`Do students like ${a.c.en}? || Adakah murid suka ${a.c.ms}?`)] : [B(`Do students like ${a.c.en}? || Adakah murid suka ${a.c.ms}?`), a.q];
      const gi = pair[0] === a.q ? 'A' : 'B';
      return { q: T(`Two students write questions about ${a.c.en}. (A) ${pair[0].en} (B) ${pair[1].en} Which is the better statistical question? Give two reasons.`, `Dua orang murid menulis soalan tentang ${a.c.ms}. (A) ${pair[0].ms} (B) ${pair[1].ms} Soalan manakah yang lebih baik sebagai soalan statistik? Berikan dua sebab.`), a: T(`(${gi}). It names a clear variable (${a.v.en}) that can be measured or counted, and it expects varying answers. The other is a vague yes/no question whose meaning depends on the person.`, `(${gi}). Ia menamakan pemboleh ubah yang jelas (${a.v.ms}) yang boleh diukur atau dikira, dan menjangkakan jawapan yang berbeza-beza. Soalan yang satu lagi ialah soalan ya/tidak yang kabur dan maknanya bergantung pada individu.`), w: W(SQW, T(`(${gi}) names the variable "${a.v.en}", which can be counted or measured, so the answers will vary; the other asks only for a yes or no opinion.`, `(${gi}) menamakan pemboleh ubah "${a.v.ms}" yang boleh dibilang atau diukur, jadi jawapannya akan berbeza-beza; yang satu lagi hanya meminta pendapat ya atau tidak.`)), sp: 'm' };
    },
  ];
  SPM.extend('F1-12.1', { e: g121e, m: g121m, a: g121a });

  /* ================================================================ 12.2 */
  /** choose lo..hi sub-tasks from [[qL, aL], ...]; returns {q, a} (single sentence, or (a)(b)(c) parts) */
  const LTR = ['(a) ', '(b) ', '(c) ', '(d) '];
  const multi = (r, tasks, lo, hi) => {
    const t = r.sample(tasks, Math.min(tasks.length, r.int(lo, hi)));
    const w = t.every((x) => x[2]) ? (t.length === 1 ? W(t[0][2]) : W(...t.map((x, i) => cat(LTR[i], x[2])))) : undefined;
    return t.length === 1 ? { q: t[0][0], a: t[0][1], w } : { q: SPM.parts(t.map((x) => x[0])), a: SPM.parts(t.map((x) => x[1])), w };
  };
  const imax = (f) => f.indexOf(Math.max(...f)), imin = (f) => f.indexOf(Math.min(...f));
  const catNm = (d, i) => d.cats[i];
  /** reading tasks for a categorical display; who = 'students' */
  const readTasks = (r, d) => {
    const [i, j] = r.sample(rg(0, d.k - 1), 2), mx = imax(d.f), mn = imin(d.f), tot = sum(d.f);
    const dl = (f, l) => T(f, l);
    return [
      [B('Which category is the most popular? || Kategori manakah yang paling popular?'), catNm(d, mx), T(`The largest frequency is $${d.f[mx]}$, so the answer is ${catNm(d, mx).en}.`, `Kekerapan terbesar ialah $${d.f[mx]}$, jadi jawapannya ialah ${catNm(d, mx).ms}.`)],
      [B('Which category is the least popular? || Kategori manakah yang paling kurang popular?'), catNm(d, mn), T(`The smallest frequency is $${d.f[mn]}$, so the answer is ${catNm(d, mn).en}.`, `Kekerapan terkecil ialah $${d.f[mn]}$, jadi jawapannya ialah ${catNm(d, mn).ms}.`)],
      [T(`How many students chose ${catNm(d, i).en}?`, `Berapakah murid yang memilih ${catNm(d, i).ms}?`), T(`${d.f[i]}`), T(`Read the value for ${catNm(d, i).en}: $${d.f[i]}$.`, `Baca nilai bagi ${catNm(d, i).ms}: $${d.f[i]}$.`)],
      [B('How many students were surveyed altogether? || Berapakah jumlah murid yang ditinjau?'), T(`${tot}`), T(`$${d.f.join(' + ')} = ${tot}$`)],
      [T(`How many more students chose ${catNm(d, mx).en} than ${catNm(d, mn).en}?`, `Berapa ramaikah murid yang memilih ${catNm(d, mx).ms} berbanding ${catNm(d, mn).ms}?`), T(`${d.f[mx] - d.f[mn]}`), T(`$${d.f[mx]} - ${d.f[mn]} = ${d.f[mx] - d.f[mn]}$`)],
      [T(`How many students chose ${catNm(d, i).en} or ${catNm(d, j).en}?`, `Berapakah murid yang memilih ${catNm(d, i).ms} atau ${catNm(d, j).ms}?`), T(`${d.f[i] + d.f[j]}`), T(`$${d.f[i]} + ${d.f[j]} = ${d.f[i] + d.f[j]}$`)],
      [T(`How many students did NOT choose ${catNm(d, i).en}?`, `Berapakah murid yang TIDAK memilih ${catNm(d, i).ms}?`), T(`${tot - d.f[i]}`), T(`$${tot} - ${d.f[i]} = ${tot - d.f[i]}$`)],
    ];
  };
  const barFig = (d, r, o) => {
    const ax = yAx(Math.max(...d.f)), hz = r.chance(0.35);
    return dual((l) => bars(Object.assign({ cats: d.cats.map((c) => c[l]), series: [d.f], horiz: hz, ymax: ax.ymax, ystep: ax.ystep, cl: d.name[l], vl: Ln(l, 'Number of students', 'Bilangan murid'), title: o && o.title ? d.name[l] : '' }, o && o.x)));
  };
  const intro = (d, tot) => T(`A survey on "${d.name.en}" was carried out among ${tot} students.`, `Satu tinjauan tentang "${d.name.ms}" dijalankan ke atas ${tot} orang murid.`);
  const PIEW = B('The whole circle, $360^\\circ$, represents all the students, so each sector angle is the same fraction of $360^\\circ$ as its category is of the total. || Seluruh bulatan, $360^\\circ$, mewakili semua murid, jadi setiap sudut sektor ialah pecahan daripada $360^\\circ$ yang sama seperti kategorinya daripada jumlah.');
  const g122e = [
    (r) => { const d = catData(r, r.int(3, 4), r.pick([20, 24, 30]), 2), o = rawOrder(r, d); return { q: T(`${d.name.en} of ${d.total} students: ${rawList(d, o, 'en')}. Complete a frequency table for the data.`, `${d.name.ms} bagi ${d.total} orang murid: ${rawList(d, o, 'ms')}. Lengkapkan jadual kekerapan bagi data itu.`), a: T(`${listL(d, d.f, 'en')}; total ${d.total}`, `${listL(d, d.f, 'ms')}; jumlah ${d.total}`), w: W(B('Go through the list once and tally each category, in groups of five. || Lalui senarai itu sekali dan tally setiap kategori, dalam kumpulan lima.'), T(`${listL(d, d.f, 'en')}`, `${listL(d, d.f, 'ms')}`), T(`$${d.f.join(' + ')} = ${d.total}$`)), sp: 'm' }; },
    (r) => {
      const d = catData(r, r.int(4, 5), r.pick([24, 30, 36]), 3), rows = (l) => SPM.table(d.cats.map((c, i) => [c[l], tallyStr(d.f[i]), BLANK]), { head: [d.name[l], 'Tally', FREQ[l]] });
      return { q: T(`The tally chart shows the choices of ${d.total} students.<br>${rows('en')}<br>Complete the frequency column and find the total.`, `Carta tally menunjukkan pilihan ${d.total} orang murid.<br>${rows('ms')}<br>Lengkapkan lajur kekerapan dan cari jumlahnya.`), a: T(`${d.f.join(', ')}; total ${d.total}`, `${d.f.join(', ')}; jumlah ${d.total}`), w: W(B('One complete group of tally marks is $5$, and each extra stroke adds $1$. || Satu kumpulan lengkap tanda tally ialah $5$, dan setiap coretan tambahan menambah $1$.'), T(`${d.f.map((v) => `$${Math.floor(v / 5)} \\times 5 + ${v % 5} = ${v}$`).join('; ')}`), T(`$${d.f.join(' + ')} = ${d.total}$`)), sp: 's' };
    },
    (r) => {
      const d = numData(r, r.pick([16, 20, 24, 30]), 4);
      return { q: T(`${d.name.en} recorded for ${d.N} ${d.who.en}: ${d.raw.join(', ')}. Complete the frequency table.<br>${vtab(d.name, d.vals, d.f, 'en', d.f.map((_, i) => i))}`, `${d.name.ms} yang direkodkan bagi ${d.N} ${d.who.ms}: ${d.raw.join(', ')}. Lengkapkan jadual kekerapan.<br>${vtab(d.name, d.vals, d.f, 'ms', d.f.map((_, i) => i))}`), a: T(`${d.vals.map((v, i) => `${v}: ${d.f[i]}`).join('; ')}; total ${d.N}`, `${d.vals.map((v, i) => `${v}: ${d.f[i]}`).join('; ')}; jumlah ${d.N}`), w: W(B('Go through the list once and tally each value. || Lalui senarai itu sekali dan tally setiap nilai.'), T(`${d.vals.map((v, i) => `${v}: ${d.f[i]}`).join('; ')}`), T(`$${d.f.join(' + ')} = ${d.N}$`)), sp: 's' };
    },
    (r) => { const d = catData(r, r.int(4, 6), r.pick([20, 30, 40, 60]), 2), m = multi(r, readTasks(r, d), 1, 3); return { q: cat(T('The bar chart shows the results of a survey. ', 'Carta palang menunjukkan keputusan satu tinjauan. '), m.q), fig: barFig(d, r, { title: r.chance() }), a: m.a, w: m.w, sp: 's' }; },
    (r) => {
      const d = catData(r, r.int(4, 5), r.pick([24, 30, 36, 40]), 3), m = multi(r, readTasks(r, d).concat([[B('What fraction of the students chose the most popular category? Give the answer in its simplest form. || Apakah pecahan murid yang memilih kategori paling popular? Beri jawapan dalam bentuk termudah.'), T(`$${SPM.Fr.tex(SPM.Fr.make(Math.max(...d.f), d.total))}$`), T(`$\\dfrac{${Math.max(...d.f)}}{${d.total}} = ${SPM.Fr.tex(SPM.Fr.make(Math.max(...d.f), d.total))}$`)]]), 1, 3);
      const fig = dual((l) => pieSvg({ vals: d.f, labels: d.cats.map((c, i) => `${c[l]} (${d.f[i]})`), title: d.name[l] }));
      return { q: cat(T('The pie chart shows the number of students who chose each category in a survey. ', 'Carta pai menunjukkan bilangan murid yang memilih setiap kategori dalam satu tinjauan. '), m.q), fig, a: m.a, w: m.w, sp: 's' };
    },
    (r) => {
      const d = numData(r, r.int(12, 18), 4), lo = d.vals[0], hi = d.vals[d.vals.length - 1], mx = d.f.indexOf(Math.max(...d.f)), t = r.pick(d.vals.slice(1, -1));
      need(d.f.filter((x) => x === Math.max(...d.f)).length === 1);
      const m = multi(r, [[B('How many students are there altogether? || Berapakah jumlah murid?'), T(`${d.N}`), T(`$${d.f.join(' + ')} = ${d.N}$`)], [B('Which value occurs most often? || Nilai yang manakah paling kerap berlaku?'), T(`${d.vals[mx]}`), T(`The tallest column of dots is above ${d.vals[mx]}, with $${d.f[mx]}$ dots.`, `Lajur titik tertinggi berada di atas ${d.vals[mx]}, dengan $${d.f[mx]}$ titik.`)], [T(`How many students have exactly ${t}?`, `Berapakah murid yang mempunyai tepat ${t}?`), T(`${d.f[d.vals.indexOf(t)]}`), T(`Count the dots above ${t}: $${d.f[d.vals.indexOf(t)]}$.`, `Bilang titik di atas ${t}: $${d.f[d.vals.indexOf(t)]}$.`)], [T(`How many students have more than ${t}?`, `Berapakah murid yang mempunyai lebih daripada ${t}?`), T(`${sum(d.f.filter((_, i) => d.vals[i] > t))}`), T(`$${d.f.filter((_, i) => d.vals[i] > t).join(' + ')} = ${sum(d.f.filter((_, i) => d.vals[i] > t))}$`)], [T(`How many students have at most ${t}?`, `Berapakah murid yang mempunyai selebih-lebihnya ${t}?`), T(`${sum(d.f.filter((_, i) => d.vals[i] <= t))}`), T(`$${d.f.filter((_, i) => d.vals[i] <= t).join(' + ')} = ${sum(d.f.filter((_, i) => d.vals[i] <= t))}$`)]], 2, 3);
      return { q: cat(T(`The dot plot shows the "${d.name.en}" of ${d.N} ${d.who.en}. `, `Plot titik menunjukkan "${d.name.ms}" bagi ${d.N} ${d.who.ms}. `), m.q), fig: dual((l) => dotSvg(d.raw, lo, hi, { xl: d.name[l] })), a: m.a, w: m.w, sp: 's' };
    },
    (r) => {
      const d = stemData(r, r.int(11, 16)), fm = sfmt(d.c.dv), s = d.sorted, t = s[r.int(4, s.length - 4)], k = r.pick(s);
      const m = multi(r, [[B('State the highest value. || Nyatakan nilai tertinggi.'), T(fm(s[s.length - 1]) + ''), T(`The last leaf of the bottom row gives $${fm(s[s.length - 1])}$.`, `Daun terakhir pada baris paling bawah memberikan $${fm(s[s.length - 1])}$.`)], [B('State the lowest value. || Nyatakan nilai terendah.'), T(fm(s[0]) + ''), T(`The first leaf of the top row gives $${fm(s[0])}$.`, `Daun pertama pada baris paling atas memberikan $${fm(s[0])}$.`)], [B('How many values are in the plot? || Berapakah bilangan nilai dalam plot itu?'), T(`${s.length}`), B('Count every leaf, once for each value. || Bilang setiap daun, satu bagi setiap nilai.')], [T(`How many values are greater than ${fm(t)}?`, `Berapakah nilai yang lebih besar daripada ${fm(t)}?`), T(`${s.filter((v) => v > t).length}`), T(`Count the leaves after $${fm(t)}$: $${s.filter((v) => v > t).length}$.`, `Bilang daun selepas $${fm(t)}$: $${s.filter((v) => v > t).length}$.`)], [T(`What value is shown by the stem ${Math.floor(k / 10)} and the leaf ${k % 10}?`, `Apakah nilai yang ditunjukkan oleh batang ${Math.floor(k / 10)} dan daun ${k % 10}?`), T(fm(k) + ''), T(`Stem $${Math.floor(k / 10)}$ with leaf $${k % 10}$ means $${fm(k)}$, as the key shows.`, `Batang $${Math.floor(k / 10)}$ dengan daun $${k % 10}$ bermaksud $${fm(k)}$, seperti ditunjukkan oleh kunci.`)], [B('Find the difference between the highest and the lowest values. || Cari beza antara nilai tertinggi dengan nilai terendah.'), T(n(s[s.length - 1] / d.c.dv - s[0] / d.c.dv)), T(`$${fm(s[s.length - 1])} - ${fm(s[0])} = ${n(s[s.length - 1] / d.c.dv - s[0] / d.c.dv)}$`)]], 2, 3);
      const key = s[Math.floor(s.length / 2)];
      return { q: T(`The stem-and-leaf plot shows the ${d.c.w.en} of some people.<br>${stemHtml(s, 'en', fm, d.c.u.split('|')[0], { key })}<br>${m.q.en}`, `Plot batang dan daun menunjukkan ${d.c.w.ms} bagi beberapa orang.<br>${stemHtml(s, 'ms', fm, d.c.u.split('|')[1] || d.c.u, { key })}<br>${m.q.ms}`), a: m.a, w: m.w, sp: 's' };
    },
    (r) => {
      const d = catData(r, r.int(4, 5), r.pick([20, 30, 40, 60]), 3), i = r.int(0, d.k - 1), tot = sum(d.f);
      const rest = d.f.filter((_, j) => j !== i), ask = r.chance();
      return { q: T(`${intro(d, tot).en}<br>${ftab(d, 'en', { blank: [i], total: tot })}<br>Find the missing frequency${ask ? ' and state which category is the most popular' : ''}.`, `${intro(d, tot).ms}<br>${ftab(d, 'ms', { blank: [i], total: tot })}<br>Cari kekerapan yang tertinggal${ask ? ' dan nyatakan kategori yang paling popular' : ''}.`), a: T(`$${tot} - (${rest.join(' + ')}) = ${d.f[i]}$${ask ? `; ${catNm(d, imax(d.f)).en} is the most popular` : ''}`, `$${tot} - (${rest.join(' + ')}) = ${d.f[i]}$${ask ? `; ${catNm(d, imax(d.f)).ms} paling popular` : ''}`), w: W(B('All the frequencies add up to the total. || Semua kekerapan berjumlah jumlah keseluruhan.'), T(`$${rest.join(' + ')} = ${sum(rest)}$`), T(`$${tot} - ${sum(rest)} = ${d.f[i]}$`), ...(ask ? [T(`The largest frequency is $${Math.max(...d.f)}$: ${catNm(d, imax(d.f)).en}.`, `Kekerapan terbesar ialah $${Math.max(...d.f)}$: ${catNm(d, imax(d.f)).ms}.`)] : [])), sp: 's' };
    },
    (r) => {
      const per = r.pick([2, 4, 5, 10]), k = r.int(4, 5), c = r.pick(CTXS), cats = r.sample(c.cats, k), cnt = cats.map(() => per * r.int(1, 6) + (per % 2 === 0 && r.chance() ? per / 2 : 0));
      need(new Set(cnt).size === k);
      const i = r.int(0, k - 1), mx = imax(cnt);
      const m = multi(r, [[T(`How many students chose ${cats[i].en}?`, `Berapakah murid yang memilih ${cats[i].ms}?`), T(`${cnt[i]}`), T(`$${Math.floor(cnt[i] / per)} \\times ${per}${cnt[i] % per ? ` + ${per / 2}` : ''} = ${cnt[i]}$`)], [B('How many students are shown altogether? || Berapakah jumlah murid yang ditunjukkan?'), T(`${sum(cnt)}`), T(`$${cnt.join(' + ')} = ${sum(cnt)}$`)], [B('Which category is the most popular, and by how many students does it lead the least popular? || Kategori manakah yang paling popular, dan berapa muridkah ia mendahului yang paling kurang popular?'), T(`${cats[mx].en}; ${Math.max(...cnt) - Math.min(...cnt)}`, `${cats[mx].ms}; ${Math.max(...cnt) - Math.min(...cnt)}`), T(`${cats[mx].en} has the most symbols; $${Math.max(...cnt)} - ${Math.min(...cnt)} = ${Math.max(...cnt) - Math.min(...cnt)}$`, `${cats[mx].ms} mempunyai simbol paling banyak; $${Math.max(...cnt)} - ${Math.min(...cnt)} = ${Math.max(...cnt) - Math.min(...cnt)}$`)]], 1, 3);
      return { q: cat(T(`(Prerequisite skill: reading a pictograph.) The pictograph shows "${c.name.en}". `, `(Kemahiran prasyarat: membaca piktograf.) Piktograf menunjukkan "${c.name.ms}". `), m.q), fig: dual((l) => picSvg(cats.map((x) => x[l]), cnt, per, Ln(l, 'students', 'murid'), l)), a: m.a, w: m.w, sp: 's' };
    },
    (r) => {
      const d = catData(r, 4, r.pick(PIE_TOT), 3), i = r.int(0, 3), a = d.f[i] * 360 / d.total;
      return r.chance() ? { q: T(`In a pie chart representing ${d.total} students, the sector for ${catNm(d, i).en} has an angle of $${a}^\\circ$. How many students does this sector represent?`, `Dalam sebuah carta pai yang mewakili ${d.total} orang murid, sektor bagi ${catNm(d, i).ms} mempunyai sudut $${a}^\\circ$. Berapakah murid yang diwakili oleh sektor ini?`), a: T(`$\\dfrac{${a}}{360} \\times ${d.total} = ${d.f[i]}$`), w: W(PIEW, T(`$\\dfrac{${a}}{360} \\times ${d.total} = ${d.f[i]}$`)), sp: 's' }
        : { q: T(`${d.f[i]} out of ${d.total} students chose ${catNm(d, i).en}. Find the angle of its sector in a pie chart.`, `${d.f[i]} daripada ${d.total} orang murid memilih ${catNm(d, i).ms}. Cari sudut sektornya dalam carta pai.`), a: T(`$\\dfrac{${d.f[i]}}{${d.total}} \\times 360^\\circ = ${a}^\\circ$`), w: W(PIEW, T(`$\\dfrac{${d.f[i]}}{${d.total}} \\times 360^\\circ = ${a}^\\circ$`)), sp: 's' };
    },
  ];
  const g122m = [
    (r) => {
      const d = catData(r, r.int(4, 6), r.pick(PIE_TOT), 3), a = angs(d.f, d.total), pct = r.chance(0.3), ps = [20, 25, 40, 50].filter((t) => t >= d.k * 3), tt = pct ? r.pick(ps) : d.total;
      const dd = pct ? catData(r, r.int(4, 5), r.pick([20, 25, 40, 50]), 2) : d, aa = angs(dd.f, dd.total), pc = dd.f.map((v) => (v * 100) / dd.total);
      const sub = r.chance(0.35) ? r.sample(rg(0, dd.k - 1), 2).sort() : rg(0, dd.k - 1);
      const what = pct ? T('the percentage of each category', 'peratusan bagi setiap kategori') : T('the angle of each sector', 'sudut bagi setiap sektor');
      return { q: T(`The table shows the results of a survey of ${dd.total} students.<br>${ftab(dd, 'en')}<br>Calculate ${pct ? 'the percentage' : 'the sector angle'} of ${sub.length === dd.k ? 'each category' : sub.map((i) => catNm(dd, i).en).join(' and ')}${pct ? '' : ' needed to draw a pie chart'}.`, `Jadual menunjukkan keputusan tinjauan terhadap ${dd.total} orang murid.<br>${ftab(dd, 'ms')}<br>Hitung ${pct ? 'peratusan' : 'sudut sektor'} bagi ${sub.length === dd.k ? 'setiap kategori' : sub.map((i) => catNm(dd, i).ms).join(' dan ')}${pct ? '' : ' yang diperlukan untuk melukis carta pai'}.`), a: T(sub.map((i) => `${catNm(dd, i).en}: ${pct ? n(pc[i]) + '%' : n(aa[i]) + '°'}`).join('; '), sub.map((i) => `${catNm(dd, i).ms}: ${pct ? n(pc[i]) + '%' : n(aa[i]) + '°'}`).join('; ')), w: W(pct ? B('Percentage $= \\dfrac{\\text{frequency}}{\\text{total}} \\times 100\\%$ || Peratusan $= \\dfrac{\\text{kekerapan}}{\\text{jumlah}} \\times 100\\%$') : B('Sector angle $= \\dfrac{\\text{frequency}}{\\text{total}} \\times 360^\\circ$ || Sudut sektor $= \\dfrac{\\text{kekerapan}}{\\text{jumlah}} \\times 360^\\circ$'), ...sub.map((i) => T(`${catNm(dd, i).en}: $\\dfrac{${dd.f[i]}}{${dd.total}} \\times ${pct ? '100' : '360^\\circ'} = ${pct ? n(pc[i]) + '\\%' : n(aa[i]) + '^\\circ'}$`, `${catNm(dd, i).ms}: $\\dfrac{${dd.f[i]}}{${dd.total}} \\times ${pct ? '100' : '360^\\circ'} = ${pct ? n(pc[i]) + '\\%' : n(aa[i]) + '^\\circ'}$`))), sp: 'm' };
    },
    (r) => {
      const d = catData(r, r.int(4, 5), r.pick(PIE_TOT), 3), a = angs(d.f, d.total), h = r.int(0, d.k - 1);
      const fig = dual((l) => pieSvg({ vals: d.f, labels: d.cats.map((c, i) => `${c[l]} ${i === h ? '?' : a[i] + '°'}`), title: d.name[l] }));
      return { q: T(`The pie chart shows the choices of ${d.total} students. The angle of the ${catNm(d, h).en} sector is not labelled. Find its angle and the number of students for each category.`, `Carta pai menunjukkan pilihan ${d.total} orang murid. Sudut sektor ${catNm(d, h).ms} tidak dilabelkan. Cari sudutnya dan bilangan murid bagi setiap kategori.`), fig, a: T(`${catNm(d, h).en} $= ${a[h]}^\\circ$; ${listL(d, d.f, 'en')}`, `${catNm(d, h).ms} $= ${a[h]}^\\circ$; ${listL(d, d.f, 'ms')}`), w: W(B('The angles of all the sectors add up to $360^\\circ$. || Jumlah sudut semua sektor ialah $360^\\circ$.'), T(`$360^\\circ - (${a.filter((_, q) => q !== h).map(n).join(' + ')}) = ${n(a[h])}^\\circ$`), B('Number of students $= \\dfrac{\\text{angle}}{360^\\circ} \\times \\text{total}$ || Bilangan murid $= \\dfrac{\\text{sudut}}{360^\\circ} \\times \\text{jumlah}$'), T(`${d.cats.map((c, q) => `${c.en}: $\\dfrac{${n(a[q])}}{360} \\times ${d.total} = ${d.f[q]}$`).join('; ')}`, `${d.cats.map((c, q) => `${c.ms}: $\\dfrac{${n(a[q])}}{360} \\times ${d.total} = ${d.f[q]}$`).join('; ')}`)), sp: 'm' };
    },
    (r) => {
      const s = r.pick([2, 5]), d = catData(r, r.int(4, 5), r.pick([40, 50, 60]), 4, s);
      return { q: T(`To draw a bar chart of the data, a scale of 1 cm to ${s} students is used on the vertical axis.<br>${ftab(d, 'en')}<br>Find the height of each bar in cm.`, `Untuk melukis carta palang bagi data ini, skala 1 cm kepada ${s} orang murid digunakan pada paksi mencancang.<br>${ftab(d, 'ms')}<br>Cari tinggi setiap palang dalam cm.`), a: T(d.cats.map((c, i) => `${c.en}: ${n(d.f[i] / s)} cm`).join('; '), d.cats.map((c, i) => `${c.ms}: ${n(d.f[i] / s)} cm`).join('; ')), w: W(T(`$1$ cm stands for ${s} students, so height $= \\text{frequency} \\div ${s}$.`, `$1$ cm mewakili ${s} orang murid, jadi tinggi $= \\text{kekerapan} \\div ${s}$.`), T(`${d.cats.map((c, i) => `${c.en}: $${d.f[i]} \\div ${s} = ${n(d.f[i] / s)}$ cm`).join('; ')}`, `${d.cats.map((c, i) => `${c.ms}: $${d.f[i]} \\div ${s} = ${n(d.f[i] / s)}$ cm`).join('; ')}`)), sp: 'm' };
    },
    (r) => {
      const d = catData(r, 5, r.pick([30, 36, 40, 60, 45]), 3), [i, j] = r.sample(rg(0, 4), 2), sh = d.f.filter((_, q) => q !== i && q !== j), S0 = d.total - sum(sh), diff = Math.abs(d.f[i] - d.f[j]), hi = d.f[i] > d.f[j] ? i : j, lo = hi === i ? j : i;
      const ax = yAx(Math.max(...d.f)), fig = dual((l) => bars({ cats: d.cats.map((c) => c[l]), series: [d.f.map((v, q) => (q === i || q === j ? null : v))], ymax: ax.ymax, ystep: ax.ystep, cl: d.name[l], vl: Ln(l, 'Number of students', 'Bilangan murid') }));
      return { q: T(`${d.total} students were surveyed. The bars for ${catNm(d, i).en} and ${catNm(d, j).en} have not been drawn. ${catNm(d, hi).en} was chosen by ${diff} more students than ${catNm(d, lo).en}. Find the two missing frequencies.`, `${d.total} orang murid ditinjau. Palang bagi ${catNm(d, i).ms} dan ${catNm(d, j).ms} belum dilukis. ${catNm(d, hi).ms} dipilih oleh ${diff} orang murid lebih ramai daripada ${catNm(d, lo).ms}. Cari dua kekerapan yang tertinggal.`), fig, a: T(`Sum of the two $= ${d.total} - ${sh.join(' - ')} = ${S0}$; ${catNm(d, hi).en} $= (${S0} + ${diff}) \\div 2 = ${d.f[hi]}$, ${catNm(d, lo).en} $= ${d.f[lo]}$`, `Jumlah kedua-duanya $= ${d.total} - ${sh.join(' - ')} = ${S0}$; ${catNm(d, hi).ms} $= (${S0} + ${diff}) \\div 2 = ${d.f[hi]}$, ${catNm(d, lo).ms} $= ${d.f[lo]}$`), w: W(B('All five frequencies add up to the total. || Jumlah kelima-lima kekerapan ialah jumlah keseluruhan.'), T(`$${d.total} - (${sh.join(' + ')}) = ${S0}$`), B('The two unknowns have a known sum and a known difference: the larger one $= (\\text{sum} + \\text{difference}) \\div 2$. || Dua yang tidak diketahui mempunyai hasil tambah dan beza yang diketahui: yang lebih besar $= (\\text{hasil tambah} + \\text{beza}) \\div 2$.'), T(`$(${S0} + ${diff}) \\div 2 = ${d.f[hi]}$`), T(`$${S0} - ${d.f[hi]} = ${d.f[lo]}$`)), sp: 'm' };
    },
    (r) => {
      const d = stemData(r, r.int(12, 16)), fm = sfmt(d.c.dv), u = d.c.dv === 10 ? ' kg' : '', key = d.sorted[0];
      return { q: T(`The ${d.c.w.en} of some people are: ${d.vals.map(fm).join(', ')}. Construct an ordered stem-and-leaf plot for the data, with a key.`, `${SPM.cap(d.c.w.ms)} bagi beberapa orang ialah: ${d.vals.map(fm).join(', ')}. Bina plot batang dan daun tertib bagi data itu, dengan kunci.`), a: T(stemHtml(d.sorted, 'en', fm, u, { key }), stemHtml(d.sorted, 'ms', fm, u, { key })), w: W(B('Sort the values in ascending order first. || Susun nilai mengikut tertib menaik dahulu.'), T(`${d.sorted.map(fm).join(', ')}`), B('The tens digit is the stem and the ones digit is the leaf; write every stem once, in order, then its leaves in ascending order. || Digit puluh ialah batang dan digit sa ialah daun; tulis setiap batang sekali, mengikut turutan, kemudian daunnya mengikut tertib menaik.'), T(`Add a key: $${Math.floor(key / 10)} \\mid ${key % 10}$ means ${fm(key)}${u}.`, `Tambah kunci: $${Math.floor(key / 10)} \\mid ${key % 10}$ bermaksud ${fm(key)}${u}.`)), sp: 'l' };
    },
    (r) => {
      const d = numData(r, r.int(14, 20), 5), lo = d.vals[0], hi = d.vals[d.vals.length - 1];
      return { q: T(`${d.name.en} of ${d.N} ${d.who.en}: ${d.raw.join(', ')}. Construct a dot plot for the data and state the number of dots above each value.`, `${d.name.ms} bagi ${d.N} ${d.who.ms}: ${d.raw.join(', ')}. Bina plot titik bagi data itu dan nyatakan bilangan titik di atas setiap nilai.`), a: T(dual((l) => dotSvg(d.raw, lo, hi, { xl: d.name[l] })).en + `<br>${d.vals.map((v, i) => `${v}: ${d.f[i]}`).join('; ')}`, dual((l) => dotSvg(d.raw, lo, hi, { xl: d.name[l] })).ms + `<br>${d.vals.map((v, i) => `${v}: ${d.f[i]}`).join('; ')}`), w: W(B('Draw a number line from the smallest to the largest value, then put one dot above a value for each time it appears in the list. || Lukis garis nombor dari nilai terkecil hingga terbesar, kemudian letakkan satu titik di atas sesuatu nilai bagi setiap kali ia muncul dalam senarai.'), T(`${d.vals.map((v, i) => `${v}: ${d.f[i]}`).join('; ')}`), T(`$${d.f.join(' + ')} = ${d.N}$`)), sp: 'l' };
    },
    (r) => {
      const ts = r.pick(TS), len = r.int(6, 8), v = series(r, ts, len), tab = (l) => SPM.table([[Ln(l, ts.y.en.split(' (')[0], ts.y.ms.split(' (')[0]) === '' ? '' : ts.y[l], ...v.map(() => BLANK)]], { head: [Ln(l, 'Month', 'Bulan'), ...MON[l].slice(0, len)] });
      return { q: T(`The line graph shows the ${ts.w.en}. Complete the table and find the total.<br>${tab('en')}`, `Graf garis menunjukkan ${ts.w.ms}. Lengkapkan jadual dan cari jumlahnya.<br>${tab('ms')}`), fig: dual((l) => lineSvg({ xs: MON[l].slice(0, len), series: [{ ys: v }], ymax: ceilTo(Math.max(...v) + 1, ts.ys), ystep: ts.ys, yl: ts.y[l], xl: Ln(l, 'Month', 'Bulan') })), a: T(`${v.join(', ')}; total ${sum(v)}`, `${v.join(', ')}; jumlah ${sum(v)}`), w: W(B('Read each point against the vertical scale and write it in the table. || Baca setiap titik pada skala mencancang dan tulis dalam jadual.'), T(`${v.join(', ')}`), T(`$${v.join(' + ')} = ${sum(v)}$`)), sp: 'm' };
    },
    (r) => {
      const d = catData(r, r.int(4, 5), r.pick([30, 36, 40, 60]), 3), asc = r.chance(), i = r.int(0, d.k - 1);
      const rows = (l) => SPM.table(d.cats.map((c, q) => [c[l], asc ? tallyStr(d.f[q]) : BLANK, asc ? BLANK : d.f[q]]), { head: [d.name[l], 'Tally', FREQ[l]] });
      return { q: T(`The table shows a survey of ${d.total} students.<br>${rows('en')}<br>${asc ? 'Complete the frequency column.' : 'Complete the tally column using tally marks in groups of five.'}`, `Jadual menunjukkan satu tinjauan terhadap ${d.total} orang murid.<br>${rows('ms')}<br>${asc ? 'Lengkapkan lajur kekerapan.' : 'Lengkapkan lajur tally dengan tanda tally dalam kumpulan lima.'}`), a: T(asc ? d.f.join(', ') : d.cats.map((c, q) => `${c.en}: ${tallyStr(d.f[q])}`).join('; '), asc ? d.f.join(', ') : d.cats.map((c, q) => `${c.ms}: ${tallyStr(d.f[q])}`).join('; ')), w: W(B('One crossed group of tally marks is $5$, and each single stroke after it adds $1$. || Satu kumpulan tanda tally yang berpalang ialah $5$, dan setiap coretan tunggal selepasnya menambah $1$.'), T(`${d.f.map((v) => `$${Math.floor(v / 5)} \\times 5 + ${v % 5} = ${v}$`).join('; ')}`), T(`$${d.f.join(' + ')} = ${d.total}$`)), sp: 's' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([50, 60, 70, 80]), 5, 5), ax = { ymax: ceilTo(Math.max(...d.f) + 1, 10), ystep: 10 };
      need(d.f.some((v) => v % 10 === 5));
      const fig = dual((l) => bars({ cats: d.cats.map((c) => c[l]), series: [d.f], ymax: ax.ymax, ystep: ax.ystep, cl: d.name[l], vl: Ln(l, 'Frequency', 'Kekerapan') }));
      return { q: T(`The bar chart shows the number of students for each category. The tops of some bars are half-way between two gridlines. Read the frequency of each category and find the total.`, `Carta palang menunjukkan bilangan murid bagi setiap kategori. Bahagian atas sesetengah palang berada di tengah-tengah antara dua garis grid. Baca kekerapan bagi setiap kategori dan cari jumlahnya.`), fig, a: T(`${listL(d, d.f, 'en')}; total ${d.total}`, `${listL(d, d.f, 'ms')}; jumlah ${d.total}`), w: W(B('Each gridline is $10$ students, so a bar that stops half-way between two gridlines is $5$ more than the gridline below it. || Setiap garis grid ialah $10$ orang murid, jadi palang yang berhenti di tengah-tengah antara dua garis grid ialah $5$ lebih daripada garis grid di bawahnya.'), T(`${listL(d, d.f, 'en')}`, `${listL(d, d.f, 'ms')}`), T(`$${d.f.join(' + ')} = ${d.total}$`)), sp: 'm' };
    },
  ];
  const g122a = [
    (r) => {
      const N = r.pick([24, 30, 36, 40]), d = numData(r, N, 4), ang = d.f.map((f) => (f * 360) / N), mx = d.f.indexOf(Math.max(...d.f));
      return { q: T(`${d.name.en} of ${N} ${d.who.en}: ${d.raw.join(', ')}. (a) Construct a frequency table. (b) Calculate the sector angle for each value to draw a pie chart. (c) Show that the angles add up to $360^\\circ$. (d) What percentage of the ${d.who.en} had the most common value? Give your answer to 1 decimal place.`, `${d.name.ms} bagi ${N} ${d.who.ms}: ${d.raw.join(', ')}. (a) Bina jadual kekerapan. (b) Hitung sudut sektor bagi setiap nilai untuk melukis carta pai. (c) Tunjukkan bahawa jumlah sudut ialah $360^\\circ$. (d) Berapakah peratusan ${d.who.ms} yang mempunyai nilai paling biasa? Beri jawapan betul kepada 1 tempat perpuluhan.`), a: SPM.parts([T(d.vals.map((v, i) => `${v}: ${d.f[i]}`).join('; ')), T(ang.map((a) => a + '°').join(', ')), T(`$${ang.join(' + ')} = ${sum(ang)}^\\circ$`), T(`$\\dfrac{${d.f[mx]}}{${N}} \\times 100 = ${n(round(d.f[mx] * 100 / N, 1))}\\%$`)]), w: W(B('Tally the list, then angle $= \\dfrac{\\text{frequency}}{\\text{total}} \\times 360^\\circ$. || Tally senarai itu, kemudian sudut $= \\dfrac{\\text{kekerapan}}{\\text{jumlah}} \\times 360^\\circ$.'), T(`$${d.f.join(' + ')} = ${N}$`), T(`${d.vals.map((v, i) => `${v}: $\\dfrac{${d.f[i]}}{${N}} \\times 360^\\circ = ${n(ang[i])}^\\circ$`).join('; ')}`), T(`$${ang.map(n).join(' + ')} = ${n(sum(ang))}^\\circ$`), T(`$\\dfrac{${d.f[mx]}}{${N}} \\times 100 = ${n(round(d.f[mx] * 100 / N, 1))}\\%$`)), sp: 'l' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([24, 30, 36, 40, 60]), 3), a = angs(d.f, d.total), i = r.int(0, 3);
      const fig = dual((l) => pieSvg({ vals: d.f, labels: d.cats.map((c, q) => `${c[l]} ${n(a[q])}°`), title: d.name[l] }));
      return { q: T(`The pie chart shows the choices of some students. ${d.f[i]} students chose ${catNm(d, i).en}. Find (a) the total number of students, (b) the number of students for each of the other categories.`, `Carta pai menunjukkan pilihan sekumpulan murid. ${d.f[i]} orang murid memilih ${catNm(d, i).ms}. Cari (a) jumlah bilangan murid, (b) bilangan murid bagi setiap kategori yang lain.`), fig, a: SPM.parts([T(`$${d.f[i]} \\div \\dfrac{${n(a[i])}}{360} = ${d.total}$`), T(d.cats.map((c, q) => (q === i ? null : `${c.en}: ${d.f[q]}`)).filter(Boolean).join('; '), d.cats.map((c, q) => (q === i ? null : `${c.ms}: ${d.f[q]}`)).filter(Boolean).join('; '))]), w: W(B('A sector is the same fraction of $360^\\circ$ as its category is of the total. || Sesuatu sektor ialah pecahan daripada $360^\\circ$ yang sama seperti kategorinya daripada jumlah.'), T(`$\\dfrac{${n(a[i])}}{360} \\times \\text{total} = ${d.f[i]}$`, `$\\dfrac{${n(a[i])}}{360} \\times \\text{jumlah} = ${d.f[i]}$`), T(`$\\text{total} = ${d.f[i]} \\times \\dfrac{360}{${n(a[i])}} = ${d.total}$`, `$\\text{jumlah} = ${d.f[i]} \\times \\dfrac{360}{${n(a[i])}} = ${d.total}$`), T(`${d.cats.map((c, q) => (q === i ? null : `${c.en}: $\\dfrac{${n(a[q])}}{360} \\times ${d.total} = ${d.f[q]}$`)).filter(Boolean).join('; ')}`, `${d.cats.map((c, q) => (q === i ? null : `${c.ms}: $\\dfrac{${n(a[q])}}{360} \\times ${d.total} = ${d.f[q]}$`)).filter(Boolean).join('; ')}`)), sp: 'l' };
    },
    (r) => {
      const x = r.int(2, 7), m = [r.pick([1, 2]), r.pick([2, 3]), r.pick([1, 2, 3]), r.pick([1, 2, 3, 4])], a0 = [r.int(0, 4), r.int(0, 3), r.int(-2, 2), r.int(-1, 3)], M = sum(m), A = sum(a0), tot = M * x + A, d = catData(r, 4, 60);
      need([24, 30, 36, 40, 45, 60, 72, 90, 120, 180].includes(tot) && m.every((mm, i) => mm * x + a0[i] >= 3));
      const f = m.map((mm, i) => mm * x + a0[i]), ex = m.map((mm, i) => SPM.lin(mm, a0[i], 'x'));
      return { q: T(`In a survey of ${tot} students on "${d.name.en}", the numbers choosing ${d.cats.map((c, i) => `${c.en} $${ex[i]}$`).join(', ')}. Form an equation, find $x$ and hence calculate the pie chart angle for each category.`, `Dalam satu tinjauan terhadap ${tot} orang murid tentang "${d.name.ms}", bilangan yang memilih ${d.cats.map((c, i) => `${c.ms} $${ex[i]}$`).join(', ')}. Bentukkan satu persamaan, cari $x$ dan seterusnya hitung sudut carta pai bagi setiap kategori.`), a: T(`$${SPM.lin(M, A, 'x')} = ${tot}$, $x = ${x}$; frequencies ${f.join(', ')}; angles ${f.map((v) => n(v * 360 / tot) + '°').join(', ')}`, `$${SPM.lin(M, A, 'x')} = ${tot}$, $x = ${x}$; kekerapan ${f.join(', ')}; sudut ${f.map((v) => n(v * 360 / tot) + '°').join(', ')}`), w: W(B('The four numbers add up to the total number of students. || Empat bilangan itu berjumlah jumlah bilangan murid.'), T(`$${ex.join(' + ')} = ${tot}$`), T(`$${SPM.lin(M, A, 'x')} = ${tot}$`), T(`$x = ${x}$`), T(`${d.cats.map((c, i) => `${c.en}: $${ex[i]} = ${f[i]}$`).join('; ')}`, `${d.cats.map((c, i) => `${c.ms}: $${ex[i]} = ${f[i]}$`).join('; ')}`), T(`${f.map((v) => `$\\dfrac{${v}}{${tot}} \\times 360^\\circ = ${n(v * 360 / tot)}^\\circ$`).join('; ')}`)), sp: 'l' };
    },
    (r) => {
      const N = r.int(13, 17), d = stemData(r, N), fm = sfmt(d.c.dv), s = d.sorted, stems = [...new Set(s.map((v) => Math.floor(v / 10)))], cv = r.pick(stems), vis = s.filter((v) => Math.floor(v / 10) !== cv).length, th = r.pick(stems.filter((q) => q !== cv && q !== stems[0])) * 10;
      const u = d.c.dv === 10 ? ' kg' : '', key = s.find((v) => Math.floor(v / 10) !== cv);
      return { q: T(`The stem-and-leaf plot shows the ${d.c.w.en} of ${N} people. One row is covered.<br>${stemHtml(s, 'en', fm, u, { cover: cv, key })}<br>(a) How many values are in the covered row? (b) How many people have a value of ${fm(th)} or more?`, `Plot batang dan daun menunjukkan ${d.c.w.ms} bagi ${N} orang. Satu baris ditutup.<br>${stemHtml(s, 'ms', fm, u, { cover: cv, key })}<br>(a) Berapakah bilangan nilai dalam baris yang ditutup? (b) Berapakah bilangan orang yang mempunyai nilai ${fm(th)} atau lebih?`), a: SPM.parts([T(`$${N} - ${vis} = ${N - vis}$`), T(`${s.filter((v) => v >= th).length}`)]), w: W(B('Count the leaves that can still be seen; the rest of the values are the hidden ones. || Bilang daun yang masih boleh dilihat; baki nilai ialah yang tersembunyi.'), T(`(a) $${N} - ${vis} = ${N - vis}$`), T(`(b) $${s.filter((v) => v >= th && Math.floor(v / 10) !== cv).length} + ${cv * 10 >= th ? N - vis : 0} = ${s.filter((v) => v >= th).length}$`)), sp: 'm' };
    },
    (r) => {
      const d = catData(r, r.int(4, 5), r.pick([24, 30, 36, 40, 45, 60]), 3), c = 360 / d.total, wr = r.chance() ? c + 1 : c - 1;
      need(c >= 5);
      const st = d.f.map((v) => v * wr), tb = (l) => SPM.table([[FREQ[l], ...d.f], [Ln(l, "Student's angle", 'Sudut murid'), ...st.map((v) => v + '°')]], { head: [d.name[l], ...d.cats.map((x) => x[l])] });
      return { q: T(`${d.total} students were surveyed and a student calculated the pie chart angles as shown.<br>${tb('en')}<br>(a) Show that the angles cannot be correct. (b) Explain the mistake. (c) Write the correct angles.`, `${d.total} orang murid ditinjau dan seorang murid mengira sudut carta pai seperti yang ditunjukkan.<br>${tb('ms')}<br>(a) Tunjukkan bahawa sudut-sudut itu tidak betul. (b) Terangkan kesilapan itu. (c) Tulis sudut yang betul.`), a: SPM.parts([T(`$${st.join(' + ')} = ${sum(st)}^\\circ \\neq 360^\\circ$`), T(`Each student should be $\\dfrac{360^\\circ}{${d.total}} = ${c}^\\circ$, not ${wr}.`, `Setiap murid patut $\\dfrac{360^\\circ}{${d.total}} = ${c}^\\circ$, bukan ${wr}.`), T(d.f.map((v) => v * c + '°').join(', '))]), w: W(B('The sector angles of a pie chart must add up to $360^\\circ$. || Jumlah sudut sektor sesebuah carta pai mesti $360^\\circ$.'), T(`$${st.join(' + ')} = ${sum(st)}^\\circ \\neq 360^\\circ$`), T(`One student $= \\dfrac{360^\\circ}{${d.total}} = ${c}^\\circ$, not $${wr}^\\circ$.`, `Seorang murid $= \\dfrac{360^\\circ}{${d.total}} = ${c}^\\circ$, bukan $${wr}^\\circ$.`), T(`${d.f.map((v) => `$${v} \\times ${c} = ${v * c}$`).join('; ')}`)), sp: 'l' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([40, 60]), 5, 5), ax = { ymax: ceilTo(Math.max(...d.f) + 1, 10), ystep: 10 }, a = angs(d.f, d.total), mx = imax(d.f);
      const fig = dual((l) => bars({ cats: d.cats.map((c) => c[l]), series: [d.f], ymax: ax.ymax, ystep: ax.ystep, cl: d.name[l], vl: Ln(l, 'Frequency', 'Kekerapan') }));
      return { q: T(`The bar chart shows the results of a survey. (a) Find the total number of students. (b) Calculate the pie chart angle of each category. (c) What percentage of the students chose ${catNm(d, mx).en}?`, `Carta palang menunjukkan keputusan satu tinjauan. (a) Cari jumlah bilangan murid. (b) Hitung sudut carta pai bagi setiap kategori. (c) Berapakah peratusan murid yang memilih ${catNm(d, mx).ms}?`), fig, a: SPM.parts([T(`${d.total}`), T(d.cats.map((c, i) => `${c.en}: ${n(a[i])}°`).join('; '), d.cats.map((c, i) => `${c.ms}: ${n(a[i])}°`).join('; ')), T(`${n(round(d.f[mx] * 100 / d.total, 1))}%`)]), w: W(T(`$${d.f.join(' + ')} = ${d.total}$`), B('Angle $= \\dfrac{\\text{frequency}}{\\text{total}} \\times 360^\\circ$ || Sudut $= \\dfrac{\\text{kekerapan}}{\\text{jumlah}} \\times 360^\\circ$'), T(`${d.cats.map((c, i) => `${c.en}: $\\dfrac{${d.f[i]}}{${d.total}} \\times 360^\\circ = ${n(a[i])}^\\circ$`).join('; ')}`, `${d.cats.map((c, i) => `${c.ms}: $\\dfrac{${d.f[i]}}{${d.total}} \\times 360^\\circ = ${n(a[i])}^\\circ$`).join('; ')}`), T(`$\\dfrac{${d.f[mx]}}{${d.total}} \\times 100 = ${n(round(d.f[mx] * 100 / d.total, 1))}\\%$`)), sp: 'l' };
    },
    (r) => {
      const ts = r.pick(TS), v = series(r, ts, 6), tot = sum(v) + r.int(3, 9) * ts.st * 6 + ts.st, rest = tot - sum(v), h1 = SPM.Fr.make(sum(v), tot);
      return { q: T(`The line graph shows the ${ts.w.en} in the first 6 months of a year. The total for the whole year was ${tot}. (a) Find the total for the first 6 months. (b) Find the total for the last 6 months. (c) What fraction of the yearly total occurred in the first 6 months? Give it in its simplest form.`, `Graf garis menunjukkan ${ts.w.ms} dalam 6 bulan pertama setahun. Jumlah bagi setahun ialah ${tot}. (a) Cari jumlah bagi 6 bulan pertama. (b) Cari jumlah bagi 6 bulan terakhir. (c) Apakah pecahan jumlah tahunan yang berlaku dalam 6 bulan pertama? Beri dalam bentuk termudah.`), fig: dual((l) => lineSvg({ xs: MON[l].slice(0, 6), series: [{ ys: v }], ymax: ceilTo(Math.max(...v) + 1, ts.ys), ystep: ts.ys, yl: ts.y[l], xl: Ln(l, 'Month', 'Bulan') })), a: SPM.parts([T(`${sum(v)}`), T(`$${tot} - ${sum(v)} = ${rest}$`), T(`$${SPM.Fr.tex(h1)}$`)]), w: W(T(`(a) $${v.join(' + ')} = ${sum(v)}$`), T(`(b) $${tot} - ${sum(v)} = ${rest}$`), T(`(c) $\\dfrac{${sum(v)}}{${tot}} = ${SPM.Fr.tex(h1)}$`)), sp: 'l' };
    },
    (r) => {
      const d = numData(r, r.int(14, 20), 5), lo = d.vals[0], hi = d.vals[d.vals.length - 1], cv = r.pick(d.vals.slice(1, -1)), vis = d.raw.filter((v) => v !== cv).length, mx = d.f.indexOf(Math.max(...d.f));
      need(d.f.filter((x) => x === Math.max(...d.f)).length === 1);
      return { q: T(`The dot plot shows the "${d.name.en}" of ${d.N} ${d.who.en}. The dots above ${cv} are covered. (a) How many dots are covered? (b) What is the most common value?`, `Plot titik menunjukkan "${d.name.ms}" bagi ${d.N} ${d.who.ms}. Titik di atas ${cv} ditutup. (a) Berapakah bilangan titik yang ditutup? (b) Apakah nilai yang paling biasa?`), fig: dual((l) => dotSvg(d.raw, lo, hi, { xl: d.name[l], cover: cv })), a: SPM.parts([T(`$${d.N} - ${vis} = ${d.N - vis}$`), T(`${d.vals[mx]}`)]), w: W(B('The total number of dots is given, so the covered dots are the total minus the dots you can count. || Jumlah titik diberikan, jadi titik yang ditutup ialah jumlah tolak titik yang boleh dibilang.'), T(`(a) $${d.N} - ${vis} = ${d.N - vis}$`), T(`(b) The tallest column is above ${d.vals[mx]}, with $${d.f[mx]}$ dots.`, `(b) Lajur tertinggi berada di atas ${d.vals[mx]}, dengan $${d.f[mx]}$ titik.`)), sp: 'm' };
    },
  ];
  SPM.extend('F1-12.2', { e: g122e, m: g122m, a: g122a });


  /* ================================================================ 12.3 */
  const REPN = ['bar chart || carta palang', 'pie chart || carta pai', 'line graph || graf garis', 'histogram (or frequency polygon) || histogram (atau poligon kekerapan)', 'dot plot (or stem-and-leaf plot) || plot titik (atau plot batang dan daun)'].map(B);
  const REPX = [
    'each category has its own separate bar, so the heights are easy to compare || setiap kategori mempunyai palang sendiri yang berasingan, jadi tinggi mudah dibandingkan',
    'it shows each part as a share of the whole || ia menunjukkan setiap bahagian sebagai sebahagian daripada keseluruhan',
    'it shows how a value changes over an ordered variable such as time || ia menunjukkan bagaimana nilai berubah mengikut pemboleh ubah tersusun seperti masa',
    'it shows the shape of a numerical distribution: where the values cluster and how they spread || ia menunjukkan bentuk taburan berangka: di mana nilai berkumpul dan bagaimana ia tersebar',
    'every individual value is still visible || setiap nilai individu masih kelihatan',
  ].map(B);
  const PURP = [
    ['compare the number of students who chose each of six sports || membandingkan bilangan murid yang memilih setiap satu daripada enam sukan', 0], ['compare the number of books borrowed by each of five classes || membandingkan bilangan buku yang dipinjam oleh setiap satu daripada lima kelas', 0],
    ['show what fraction of the class travels to school by each mode of transport || menunjukkan pecahan kelas yang ke sekolah dengan setiap jenis pengangkutan', 1], ['show how RM100 of pocket money is divided among different uses || menunjukkan bagaimana wang saku RM100 dibahagikan kepada pelbagai kegunaan', 1],
    ['show the percentage of each type of waste in a recycling bin || menunjukkan peratusan setiap jenis sisa dalam sebuah tong kitar semula', 1],
    ['show how the monthly rainfall changed over a year || menunjukkan bagaimana hujan bulanan berubah sepanjang setahun', 2], ['show how a student\'s marks changed over five tests || menunjukkan bagaimana markah seorang murid berubah dalam lima ujian', 2],
    ['show the shape of the distribution of the number of siblings of 30 students || menunjukkan bentuk taburan bilangan adik-beradik bagi 30 orang murid', 3], ['show where the goals per match cluster in 40 football matches || menunjukkan di mana gol setiap perlawanan berkumpul dalam 40 perlawanan bola sepak', 3],
    ['compare the distributions of the number of pets in two classes on the same axes || membandingkan taburan bilangan haiwan peliharaan dalam dua kelas pada paksi yang sama', 3],
    ['keep every individual test mark of 15 students visible while showing the spread || mengekalkan setiap markah ujian individu bagi 15 orang murid kelihatan sambil menunjukkan serakan', 4], ['show every one of 12 measured heights and how they are spread || menunjukkan setiap satu daripada 12 ketinggian yang diukur dan bagaimana ia tersebar', 4],
  ].map((x) => ({ p: B(x[0]), k: x[1] }));
  const HS = [
    ['The bars of a histogram touch each other. || Palang histogram bersentuhan antara satu sama lain.', 1, 'The horizontal axis is a continuous numerical scale with no gaps. || Paksi mengufuk ialah skala berangka selanjar tanpa jurang.'],
    ['The bars of a bar chart for categories must touch. || Palang carta palang bagi kategori mesti bersentuhan.', 0, 'Categories are separate, so the bars are separated. || Kategori berasingan, jadi palang juga berasingan.'],
    ['In a frequency polygon the plotted points are joined by straight lines. || Dalam poligon kekerapan, titik yang diplot disambung dengan garis lurus.', 1, 'That is how a frequency polygon is drawn. || Begitulah poligon kekerapan dilukis.'],
    ['A histogram is a suitable chart for the favourite colour of students. || Histogram ialah carta yang sesuai untuk warna kegemaran murid.', 0, 'Colour is categorical; use a bar chart. || Warna ialah data kategori; gunakan carta palang.'],
    ['The height of a bar in a histogram shows the frequency. || Tinggi palang dalam histogram menunjukkan kekerapan.', 1, 'The vertical axis is the frequency. || Paksi mencancang ialah kekerapan.'],
    ['A histogram and a frequency polygon can be drawn from the same frequency table. || Histogram dan poligon kekerapan boleh dilukis daripada jadual kekerapan yang sama.', 1, 'Both use the same values and frequencies. || Kedua-duanya menggunakan nilai dan kekerapan yang sama.'],
    ['A pie chart is the best way to show a change over time. || Carta pai ialah cara terbaik untuk menunjukkan perubahan mengikut masa.', 0, 'A line graph shows change over time. || Graf garis menunjukkan perubahan mengikut masa.'],
    ['The total frequency stays the same when a table is converted to a bar chart. || Jumlah kekerapan kekal sama apabila jadual ditukar kepada carta palang.', 1, 'The same data are shown, so the frequencies still add up to the same total. || Data yang sama ditunjukkan, jadi kekerapan masih berjumlah sama.'],
    ['The angles of the sectors of a pie chart add up to $180^\\circ$. || Jumlah sudut sektor carta pai ialah $180^\\circ$.', 0, 'They add up to $360^\\circ$. || Jumlahnya $360^\\circ$.'],
    ['A line graph is suitable for showing how many students chose each sport. || Graf garis sesuai untuk menunjukkan bilangan murid yang memilih setiap sukan.', 0, 'The sports have no natural order; use a bar chart. || Sukan tiada urutan semula jadi; gunakan carta palang.'],
    ['A dot plot keeps every individual value of the data. || Plot titik mengekalkan setiap nilai individu bagi data.', 1, 'Each dot stands for one value. || Setiap titik mewakili satu nilai.'],
    ['In a pie chart, a bigger angle always means a bigger number of items, even when comparing two different pie charts. || Dalam carta pai, sudut yang lebih besar sentiasa bermaksud bilangan yang lebih besar, walaupun apabila membandingkan dua carta pai berlainan.', 0, 'A bigger angle means a bigger share; the totals may differ. || Sudut yang lebih besar bermaksud bahagian yang lebih besar; jumlahnya mungkin berbeza.'],
    ['The horizontal axis of a histogram can show categories such as sports. || Paksi mengufuk histogram boleh menunjukkan kategori seperti sukan.', 0, 'It shows numerical values, so the bars are placed in numerical order. || Ia menunjukkan nilai berangka, jadi palang diletakkan mengikut turutan nombor.'],
  ].map((x) => ({ s: B(x[0]), t: !!x[1], x: B(x[2]) }));
  const both = (a, b) => T([a.en, b.en], [a.ms, b.ms]);
  const polyPts = (v, f) => [[v[0] - 1, 0], ...v.map((x, i) => [x, f[i]]), [v[v.length - 1] + 1, 0]];
  const ptsTx = (p) => p.map((q) => `(${q[0]}, ${q[1]})`).join(', ');
  const numFig = (d, l, o) => hist(d.vals, d.f, Object.assign({ xl: d.name[l], yl: FREQ[l] }, o));

  const g123e = [
    (r) => { const p = r.pick(PURP); return { q: T(`Which representation is most suitable to ${p.p.en}: a bar chart, a pie chart, a line graph, a histogram or a dot plot?`, `Perwakilan manakah yang paling sesuai untuk ${p.p.ms}: carta palang, carta pai, graf garis, histogram atau plot titik?`), a: cat(REPN[p.k], ': ', REPX[p.k]), w: W(REPW, cat(REPN[p.k], T(': ', ': '), REPX[p.k])), sp: 's' }; },
    (r) => { const p = r.pick(PURP), o = mc(r, REPN[p.k], r.sample(REPN.filter((_, i) => i !== p.k), 3)); return { q: T(`To ${p.p.en}, which representation should be used?<br>${o.en}`, `Untuk ${p.p.ms}, perwakilan manakah yang patut digunakan?<br>${o.ms}`), a: cat(o.ans, '. ', REPX[p.k]), w: W(REPW, cat(o.ans, T(': ', ': '), REPX[p.k])), sp: 's' }; },
    (r) => { const h = r.pick(HS); return { q: T(`True or false? "${h.s.en}"`, `Betul atau salah? "${h.s.ms}"`), a: cat(h.t ? T('True. ', 'Betul. ') : T('False. ', 'Salah. '), h.x), w: W(B('Test the statement against what each kind of display is for and how it is drawn. || Uji pernyataan itu berdasarkan tujuan setiap jenis paparan dan cara ia dilukis.'), cat(h.t ? T('True: ', 'Betul: ') : T('False: ', 'Salah: '), h.x)), sp: 's' }; },
    (r) => {
      const [a, b] = r.sample(HS, 2), ok = (h) => (h.t ? 'True' : 'False');
      need(a.t !== b.t);
      const o = mc(r, a.t ? a.s : b.s, [a.t ? b.s : a.s]);
      return { q: T(`Which of these statements is correct?<br>${o.en}`, `Pernyataan manakah yang betul?<br>${o.ms}`), a: cat(o.ans, '. ', a.t ? a.x : b.x), w: W(cat(T('Correct: ', 'Betul: '), a.t ? a.x : b.x), cat(T('The other statement is wrong: ', 'Pernyataan yang satu lagi salah: '), a.t ? b.x : a.x)), sp: 's' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([20, 40, 50, 25]), 2), i = r.int(0, 3), p = d.f[i] * 100 / d.total;
      const fig = dual((l) => pieSvg({ vals: d.f, labels: d.cats.map((c, q) => `${c[l]} ${n(d.f[q] * 100 / d.total)}%`), title: d.name[l] }));
      return { q: T(`The pie chart shows the results of a survey of ${d.total} students. How many students chose ${catNm(d, i).en}?`, `Carta pai menunjukkan keputusan tinjauan terhadap ${d.total} orang murid. Berapakah murid yang memilih ${catNm(d, i).ms}?`), fig, a: T(`$${n(p)}\\% \\times ${d.total} = ${d.f[i]}$`), w: W(B('A percentage in a pie chart is a share of the whole group, so apply it to the total. || Peratusan dalam carta pai ialah bahagian daripada seluruh kumpulan, jadi gunakannya pada jumlah.'), T(`$\\dfrac{${n(p)}}{100} \\times ${d.total} = ${d.f[i]}$`)), sp: 's' };
    },
    (r) => {
      const d = numData(r, r.pick([20, 24, 30]), 4), v = r.pick(d.vals), i = d.vals.indexOf(v);
      need(d.f.filter((x) => x === Math.max(...d.f)).length === 1);
      const m = multi(r, [[T(`State the frequency for ${v}.`, `Nyatakan kekerapan bagi ${v}.`), T(`${d.f[i]}`), T(`Read the height of the point above ${v}: $${d.f[i]}$.`, `Baca tinggi titik di atas ${v}: $${d.f[i]}$.`)], [B('For which value is the frequency the highest? || Bagi nilai manakah kekerapan paling tinggi?'), T(`${d.vals[d.f.indexOf(Math.max(...d.f))]}`), T(`The highest point has height $${Math.max(...d.f)}$, above ${d.vals[d.f.indexOf(Math.max(...d.f))]}.`, `Titik tertinggi mempunyai tinggi $${Math.max(...d.f)}$, di atas ${d.vals[d.f.indexOf(Math.max(...d.f))]}.`)], [B('Find the total frequency. || Cari jumlah kekerapan.'), T(`${d.N}`), T(`$${d.f.join(' + ')} = ${d.N}$`)], [B('How many points are plotted on the graph, including the two on the horizontal axis? || Berapakah bilangan titik yang diplot pada graf itu, termasuk dua titik pada paksi mengufuk?'), T(`${d.vals.length + 2}`), T(`One point for each of the ${d.vals.length} values, plus the two on the axis: $${d.vals.length} + 2 = ${d.vals.length + 2}$.`, `Satu titik bagi setiap ${d.vals.length} nilai, campur dua titik pada paksi: $${d.vals.length} + 2 = ${d.vals.length + 2}$.`)]], 2, 3);
      return { q: cat(T(`The frequency polygon shows the "${d.name.en}" of ${d.N} ${d.who.en}. `, `Poligon kekerapan menunjukkan "${d.name.ms}" bagi ${d.N} ${d.who.ms}. `), m.q), fig: dual((l) => numFig(d, l, { poly: true })), a: m.a, w: m.w, sp: 's' };
    },
    (r) => {
      const d = numData(r, r.pick([20, 24, 30]), 4), v = r.pick(d.vals), i = d.vals.indexOf(v);
      return r.chance() ? { q: T(`${vtab(d.name, d.vals, d.f, 'en')}<br>To draw a frequency polygon for this table, what are the coordinates of the point for ${v}?`, `${vtab(d.name, d.vals, d.f, 'ms')}<br>Untuk melukis poligon kekerapan bagi jadual ini, apakah koordinat titik bagi ${v}?`), a: T(`$(${v}, ${d.f[i]})$`), w: W(B('Each point of a frequency polygon is (value, frequency). || Setiap titik poligon kekerapan ialah (nilai, kekerapan).'), T(`$(${v}, ${d.f[i]})$`)), sp: 's' }
        : { q: T(`${vtab(d.name, d.vals, d.f, 'en')}<br>A frequency polygon is drawn from this table, joined to the horizontal axis at both ends. State the coordinates of the two end points.`, `${vtab(d.name, d.vals, d.f, 'ms')}<br>Sebuah poligon kekerapan dilukis daripada jadual ini dan disambung ke paksi mengufuk pada kedua-dua hujung. Nyatakan koordinat dua titik hujung.`), a: T(`$(${d.vals[0] - 1}, 0)$ and $(${d.vals[d.vals.length - 1] + 1}, 0)$`, `$(${d.vals[0] - 1}, 0)$ dan $(${d.vals[d.vals.length - 1] + 1}, 0)$`), w: W(B('The polygon is closed by joining it to the horizontal axis one step before the first value and one step after the last value, where the frequency is $0$. || Poligon ditutup dengan menyambungkannya ke paksi mengufuk satu langkah sebelum nilai pertama dan satu langkah selepas nilai terakhir, dengan kekerapan $0$.'), T(`$(${d.vals[0]} - 1, 0) = (${d.vals[0] - 1}, 0)$`), T(`$(${d.vals[d.vals.length - 1]} + 1, 0) = (${d.vals[d.vals.length - 1] + 1}, 0)$`)), sp: 's' };
    },
    (r) => {
      const ps = r.sample(PURP, 3); need(new Set(ps.map((x) => x.k)).size === 3);
      const opts = r.shuffle([0, 1, 2]);
      return { q: T(`Match each purpose with the best representation from: bar chart, pie chart, line graph, histogram, dot plot. (a) ${ps[0].p.en}. (b) ${ps[1].p.en}. (c) ${ps[2].p.en}.`, `Padankan setiap tujuan dengan perwakilan terbaik daripada: carta palang, carta pai, graf garis, histogram, plot titik. (a) ${ps[0].p.ms}. (b) ${ps[1].p.ms}. (c) ${ps[2].p.ms}.`), a: SPM.parts(ps.map((x) => REPN[x.k])), w: W(REPW, cat('(a) ', REPX[ps[0].k]), cat('(b) ', REPX[ps[1].k]), cat('(c) ', REPX[ps[2].k])), sp: 'm' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([20, 40, 50, 25]), 2), a = angs(d.f, d.total), fg = [dual((l) => bars({ cats: d.cats.map((c) => c[l]), series: [d.f], ymax: yAx(Math.max(...d.f)).ymax, ystep: yAx(Math.max(...d.f)).ystep, cl: d.name[l], vl: FREQ[l], w: 250, h: 190 })), dual((l) => pieSvg({ vals: d.f, labels: d.cats.map((c) => c[l]), r: 50, w: 250 }))], i = imax(d.f);
      return { q: T(`The bar chart and the pie chart show the same survey. (a) How many students were surveyed? (b) Which sector of the pie chart is the largest? (c) Find the angle of that sector.`, `Carta palang dan carta pai menunjukkan tinjauan yang sama. (a) Berapakah murid yang ditinjau? (b) Sektor manakah pada carta pai yang paling besar? (c) Cari sudut sektor itu.`), fig: both(fg[0], fg[1]), a: SPM.parts([T(`${d.total}`), catNm(d, i), T(`${n(a[i])}°`)]), w: W(T(`(a) $${d.f.join(' + ')} = ${d.total}$`), T(`(b) The tallest bar is ${catNm(d, i).en} with $${d.f[i]}$ students, so its sector is the largest.`, `(b) Palang tertinggi ialah ${catNm(d, i).ms} dengan $${d.f[i]}$ orang murid, jadi sektornya yang paling besar.`), T(`(c) $\\dfrac{${d.f[i]}}{${d.total}} \\times 360^\\circ = ${n(a[i])}^\\circ$`)), sp: 's' };
    },
  ];
  const g123m = [
    (r) => {
      const d = numData(r, r.pick([20, 24, 30]), 5), pts = polyPts(d.vals, d.f), fig = dual((l) => numFig(d, l, { poly: true }));
      return { q: T(`${vtab(d.name, d.vals, d.f, 'en')}<br>Write down the coordinates of the points needed to draw a frequency polygon for this table (join the polygon to the horizontal axis at both ends).`, `${vtab(d.name, d.vals, d.f, 'ms')}<br>Tuliskan koordinat titik yang diperlukan untuk melukis poligon kekerapan bagi jadual ini (sambungkan poligon ke paksi mengufuk pada kedua-dua hujung).`), a: T(`$${ptsTx(pts)}$`), w: W(B('Plot (value, frequency) for every column of the table. || Plot (nilai, kekerapan) bagi setiap lajur jadual.'), T(`$${ptsTx(pts.slice(1, -1))}$`), B('Close the polygon on the horizontal axis one step before the first value and one step after the last value. || Tutup poligon pada paksi mengufuk satu langkah sebelum nilai pertama dan satu langkah selepas nilai terakhir.'), T(`$${ptsTx([pts[0], pts[pts.length - 1]])}$`)), sp: 'm' };
    },
    (r) => {
      const d = numData(r, r.pick([20, 24, 30]), 5);
      return { q: T(`The frequency polygon shows the "${d.name.en}" of ${d.N} ${d.who.en}. Complete a frequency table from the graph and check that the total is ${d.N}.`, `Poligon kekerapan menunjukkan "${d.name.ms}" bagi ${d.N} ${d.who.ms}. Lengkapkan jadual kekerapan daripada graf dan semak bahawa jumlahnya ialah ${d.N}.`), fig: dual((l) => numFig(d, l, { poly: true })), a: T(`${d.vals.map((v, i) => `${v}: ${d.f[i]}`).join('; ')}; $${d.f.join(' + ')} = ${d.N}$`, `${d.vals.map((v, i) => `${v}: ${d.f[i]}`).join('; ')}; $${d.f.join(' + ')} = ${d.N}$`), w: W(B('Read the height of each plotted point; the two end points on the axis are not data. || Baca tinggi setiap titik yang diplot; dua titik hujung pada paksi bukan data.'), T(`${d.vals.map((v, i) => `${v}: ${d.f[i]}`).join('; ')}`), T(`$${d.f.join(' + ')} = ${d.N}$`)), sp: 'm' };
    },
    (r) => {
      const d = catData(r, r.int(4, 5), r.pick([40, 60, 120, 30]), 3, 5), a = angs(d.f, d.total);
      need(d.total % 5 === 0);
      const fig = dual((l) => pieSvg({ vals: d.f, labels: d.cats.map((c, i) => `${c[l]} ${n(a[i])}°`), title: d.name[l] })), ax = yAx(Math.max(...d.f));
      return { q: T(`The pie chart shows the choices of ${d.total} students. Convert the data into a frequency table and state the height of each bar in a bar chart drawn with a scale of 1 cm to 5 students.`, `Carta pai menunjukkan pilihan ${d.total} orang murid. Tukarkan data itu kepada jadual kekerapan dan nyatakan tinggi setiap palang dalam carta palang yang dilukis dengan skala 1 cm kepada 5 orang murid.`), fig, a: T(d.cats.map((c, i) => `${c.en}: ${d.f[i]} students, ${n(d.f[i] / 5)} cm`).join('; '), d.cats.map((c, i) => `${c.ms}: ${d.f[i]} murid, ${n(d.f[i] / 5)} cm`).join('; ')), w: W(B('Number of students $= \\dfrac{\\text{angle}}{360^\\circ} \\times \\text{total}$ || Bilangan murid $= \\dfrac{\\text{sudut}}{360^\\circ} \\times \\text{jumlah}$'), T(`${d.cats.map((c, i) => `${c.en}: $\\dfrac{${n(a[i])}}{360} \\times ${d.total} = ${d.f[i]}$`).join('; ')}`, `${d.cats.map((c, i) => `${c.ms}: $\\dfrac{${n(a[i])}}{360} \\times ${d.total} = ${d.f[i]}$`).join('; ')}`), B('With $1$ cm for $5$ students, height $= \\text{frequency} \\div 5$. || Dengan $1$ cm bagi $5$ orang murid, tinggi $= \\text{kekerapan} \\div 5$.'), T(`${d.f.map((x) => `$${x} \\div 5 = ${n(x / 5)}$ cm`).join('; ')}`)), sp: 'm' };
    },
    (r) => {
      const d = catData(r, r.int(4, 5), r.pick([40, 60, 30, 45]), 5, 5), a = angs(d.f, d.total), ax = yAx(Math.max(...d.f));
      return { q: T(`The bar chart shows the results of a survey. Convert the data to a pie chart by calculating the angle of each sector, and check that the angles add up to $360^\\circ$.`, `Carta palang menunjukkan keputusan satu tinjauan. Tukarkan data itu kepada carta pai dengan mengira sudut setiap sektor, dan semak bahawa jumlah sudut ialah $360^\\circ$.`), fig: barFig(d, r), a: T(`${d.cats.map((c, i) => `${c.en}: ${n(a[i])}°`).join('; ')}; $${a.map(n).join(' + ')} = 360$`, `${d.cats.map((c, i) => `${c.ms}: ${n(a[i])}°`).join('; ')}; $${a.map(n).join(' + ')} = 360$`), w: W(T(`Read the bars: $${d.f.join(' + ')} = ${d.total}$ students.`, `Baca palang: $${d.f.join(' + ')} = ${d.total}$ orang murid.`), B('Angle $= \\dfrac{\\text{frequency}}{\\text{total}} \\times 360^\\circ$ || Sudut $= \\dfrac{\\text{kekerapan}}{\\text{jumlah}} \\times 360^\\circ$'), T(`${d.cats.map((c, i) => `${c.en}: $\\dfrac{${d.f[i]}}{${d.total}} \\times 360^\\circ = ${n(a[i])}^\\circ$`).join('; ')}`, `${d.cats.map((c, i) => `${c.ms}: $\\dfrac{${d.f[i]}}{${d.total}} \\times 360^\\circ = ${n(a[i])}^\\circ$`).join('; ')}`), T(`$${a.map(n).join(' + ')} = 360$`)), sp: 'm' };
    },
    (r) => {
      const d = numData(r, r.pick([20, 24, 30]), 4), bad = r.int(0, d.vals.length - 1), errT = r.pick([1, 2]);
      const st = d.f.slice(); const wrong = st[bad] + errT; st[bad] = wrong;
      return { q: T(`${vtab(d.name, d.vals, d.f, 'en')}<br>A student converts this table into a histogram with bar heights ${st.join(', ')} (in the order of the values). (a) Find the total of the student's heights. (b) Which bar is wrong, and what should its height be?`, `${vtab(d.name, d.vals, d.f, 'ms')}<br>Seorang murid menukar jadual ini kepada histogram dengan tinggi palang ${st.join(', ')} (mengikut turutan nilai). (a) Cari jumlah tinggi palang murid itu. (b) Palang manakah yang salah, dan berapakah tingginya yang betul?`), a: SPM.parts([T(`$${st.join(' + ')} = ${sum(st)}$, but the original total is ${d.N}`, `$${st.join(' + ')} = ${sum(st)}$, tetapi jumlah asal ialah ${d.N}`), T(`The bar for ${d.vals[bad]}: it should be ${d.f[bad]}, not ${wrong}.`, `Palang bagi ${d.vals[bad]}: sepatutnya ${d.f[bad]}, bukan ${wrong}.`)]), w: W(T(`(a) $${st.join(' + ')} = ${sum(st)}$`), T(`(b) The table total is $${d.N}$, so the heights are $${sum(st)} - ${d.N} = ${sum(st) - d.N}$ too many.`, `(b) Jumlah dalam jadual ialah $${d.N}$, jadi tinggi palang berlebihan sebanyak $${sum(st)} - ${d.N} = ${sum(st) - d.N}$.`), T(`Comparing bar by bar, only ${d.vals[bad]} differs: $${wrong} - ${errT} = ${d.f[bad]}$.`, `Dengan membandingkan palang demi palang, hanya ${d.vals[bad]} berbeza: $${wrong} - ${errT} = ${d.f[bad]}$.`)), sp: 'm' };
    },
    (r) => {
      const d = numData(r, r.pick([20, 24, 30]), 4), sh = r.int(0, d.vals.length - 1), pts = polyPts(d.vals, d.f).map((p, i) => (i === sh + 1 ? [p[0] + 1, p[1]] : p));
      return { q: T(`${vtab(d.name, d.vals, d.f, 'en')}<br>A student writes the points for a frequency polygon as ${ptsTx(pts)}. One point is plotted at the wrong horizontal position. Find it and write the correct point.`, `${vtab(d.name, d.vals, d.f, 'ms')}<br>Seorang murid menulis titik bagi poligon kekerapan sebagai ${ptsTx(pts)}. Satu titik diplot pada kedudukan mengufuk yang salah. Cari titik itu dan tulis titik yang betul.`), a: T(`$(${d.vals[sh] + 1}, ${d.f[sh]})$ should be $(${d.vals[sh]}, ${d.f[sh]})$: each point is plotted at its own value.`, `$(${d.vals[sh] + 1}, ${d.f[sh]})$ sepatutnya $(${d.vals[sh]}, ${d.f[sh]})$: setiap titik diplot pada nilainya sendiri.`), w: W(B('Compare each point with its row in the table: the first coordinate is the value and the second is its frequency. || Bandingkan setiap titik dengan barisnya dalam jadual: koordinat pertama ialah nilai dan yang kedua ialah kekerapannya.'), T(`The frequency $${d.f[sh]}$ belongs to the value ${d.vals[sh]}, not ${d.vals[sh] + 1}.`, `Kekerapan $${d.f[sh]}$ milik nilai ${d.vals[sh]}, bukan ${d.vals[sh] + 1}.`), T(`$(${d.vals[sh] + 1}, ${d.f[sh]}) \\to (${d.vals[sh]}, ${d.f[sh]})$`)), sp: 'm' };
    },
    (r) => {
      const d1 = numData(r, r.pick([20, 24, 30]), 4), f2 = d1.vals.map(() => r.int(1, 9)), N2 = sum(f2), dif = d1.f.map((x, q) => Math.abs(x - f2[q]));
      need(f2.some((x, i) => x !== d1.f[i]) && dif.filter((x) => x === Math.max(...dif)).length === 1);
      const fig = dual((l) => bars({ cats: d1.vals.map(String), series: [d1.f, f2], ymax: yAx(Math.max(...d1.f, ...f2)).ymax, ystep: yAx(Math.max(...d1.f, ...f2)).ystep, legend: [Ln(l, 'Class A', 'Kelas A'), Ln(l, 'Class B', 'Kelas B')], cl: d1.name[l], vl: FREQ[l] })), v = r.pick(d1.vals), i = d1.vals.indexOf(v);
      const m = multi(r, [[B('How many students are in each class? || Berapakah bilangan murid dalam setiap kelas?'), T(`A: ${d1.N}; B: ${N2}`), T(`A: $${d1.f.join(' + ')} = ${d1.N}$; B: $${f2.join(' + ')} = ${N2}$`)], [T(`Which class has more students with ${v}? By how many?`, `Kelas manakah yang mempunyai lebih ramai murid dengan ${v}? Berapa ramai?`), d1.f[i] === f2[i] ? T('Equal', 'Sama') : T(`Class ${d1.f[i] > f2[i] ? 'A' : 'B'}: ${Math.abs(d1.f[i] - f2[i])}`, `Kelas ${d1.f[i] > f2[i] ? 'A' : 'B'}: ${Math.abs(d1.f[i] - f2[i])}`), d1.f[i] === f2[i] ? T(`Both bars have height $${d1.f[i]}$.`, `Kedua-dua palang mempunyai tinggi $${d1.f[i]}$.`) : T(`$${Math.max(d1.f[i], f2[i])} - ${Math.min(d1.f[i], f2[i])} = ${Math.abs(d1.f[i] - f2[i])}$`)], [B('For which value do the two classes differ most? || Bagi nilai manakah kedua-dua kelas paling berbeza?'), T(`${d1.vals[dif.indexOf(Math.max(...dif))]}`), T(`Differences: $${dif.join(',\\ ')}$; the largest, $${Math.max(...dif)}$, is at ${d1.vals[dif.indexOf(Math.max(...dif))]}.`, `Beza: $${dif.join(',\\ ')}$; yang terbesar, $${Math.max(...dif)}$, berada pada ${d1.vals[dif.indexOf(Math.max(...dif))]}.`)]], 2, 3);
      return { q: cat(T(`The graph compares "${d1.name.en}" in two classes. `, `Graf membandingkan "${d1.name.ms}" dalam dua kelas. `), m.q), fig, a: m.a, w: m.w, sp: 'm' };
    },
    (r) => {
      const c1 = r.pick([25, 30, 40]), c2 = r.pick([50, 60, 80]), x1 = r.int(3, c1 - 5), x2 = r.int(5, c2 - 5), p1 = x1 / c1, p2 = x2 / c2, ctx = r.pick(CTXS), cat1 = r.pick(ctx.cats);
      need(Math.abs(p1 - p2) > 0.03);
      return { q: T(`In Class A, ${x1} of ${c1} students chose ${cat1.en} as their answer to "${ctx.name.en}". In Class B, ${x2} of ${c2} students chose ${cat1.en}. (a) Find the percentage in each class (to 1 decimal place if needed). (b) Which class has the larger proportion? (c) Which representation would show these proportions best, and why?`, `Dalam Kelas A, ${x1} daripada ${c1} orang murid memilih ${cat1.ms} sebagai jawapan kepada "${ctx.name.ms}". Dalam Kelas B, ${x2} daripada ${c2} orang murid memilih ${cat1.ms}. (a) Cari peratusan dalam setiap kelas (betul kepada 1 tempat perpuluhan jika perlu). (b) Kelas manakah yang mempunyai kadar yang lebih besar? (c) Perwakilan manakah yang paling baik menunjukkan kadar ini, dan mengapa?`), a: SPM.parts([T(`A: $\\dfrac{${x1}}{${c1}} \\times 100 = ${n(round(p1 * 100, 1))}\\%$; B: $\\dfrac{${x2}}{${c2}} \\times 100 = ${n(round(p2 * 100, 1))}\\%$`), p1 > p2 ? T('Class A', 'Kelas A') : T('Class B', 'Kelas B'), B('Pie charts (one for each class): they show the share of the whole even though the class sizes differ. || Carta pai (satu bagi setiap kelas): ia menunjukkan bahagian daripada keseluruhan walaupun saiz kelas berbeza.')]), w: W(B('The classes are of different sizes, so compare proportions, not counts: percentage $= \\dfrac{\\text{part}}{\\text{whole}} \\times 100\\%$. || Kelas mempunyai saiz yang berbeza, jadi bandingkan kadar, bukan bilangan: peratusan $= \\dfrac{\\text{bahagian}}{\\text{keseluruhan}} \\times 100\\%$.'), T(`A: $\\dfrac{${x1}}{${c1}} \\times 100 = ${n(round(p1 * 100, 1))}\\%$`), T(`B: $\\dfrac{${x2}}{${c2}} \\times 100 = ${n(round(p2 * 100, 1))}\\%$`), T(`$${n(round(Math.max(p1, p2) * 100, 1))}\\% > ${n(round(Math.min(p1, p2) * 100, 1))}\\%$, so Class ${p1 > p2 ? 'A' : 'B'} has the larger proportion.`, `$${n(round(Math.max(p1, p2) * 100, 1))}\\% > ${n(round(Math.min(p1, p2) * 100, 1))}\\%$, jadi Kelas ${p1 > p2 ? 'A' : 'B'} mempunyai kadar yang lebih besar.`)), sp: 'l' };
    },
    (r) => {
      const ts = r.pick(TS), v = series(r, ts, r.int(5, 6)), i = r.int(0, v.length - 1);
      const dif = v.slice(1).map((x, q) => Math.abs(x - v[q]));
      let bi = 0; for (let q = 0; q < dif.length; q++) if (dif[q] > dif[bi]) bi = q;
      need(dif.filter((x) => x === dif[bi]).length === 1);
      return { q: T(`The table shows the ${ts.w.en} in ${v.length} months.<br>${SPM.table([v], { head: MON.en.slice(0, v.length) })}<br>(a) Which representation would you choose to show how it changes? (b) Between which two consecutive months was the increase or decrease the largest?`, `Jadual menunjukkan ${ts.w.ms} dalam ${v.length} bulan.<br>${SPM.table([v], { head: MON.ms.slice(0, v.length) })}<br>(a) Perwakilan manakah yang anda pilih untuk menunjukkan perubahannya? (b) Antara dua bulan berturutan yang manakah pertambahan atau pengurangan paling besar?`), a: SPM.parts([cat(REPN[2], '; ', REPX[2]), T(`${MONF.en[bi]} to ${MONF.en[bi + 1]} (change ${dif[bi]})`, `${MONF.ms[bi]} hingga ${MONF.ms[bi + 1]} (perubahan ${dif[bi]})`)]), w: W(cat('(a) ', REPX[2]), T(`(b) Differences between consecutive months: $${dif.join(',\\ ')}$`, `(b) Beza antara bulan berturutan: $${dif.join(',\\ ')}$`), T(`The largest is $${dif[bi]}$, from ${MONF.en[bi]} to ${MONF.en[bi + 1]}.`, `Yang terbesar ialah $${dif[bi]}$, dari ${MONF.ms[bi]} hingga ${MONF.ms[bi + 1]}.`)), sp: 'm' };
    },
  ];
  const g123a = [
    (r) => {
      const d = numData(r, r.pick([24, 30, 36, 40]), 4), a = d.f.map((f) => (f * 360) / d.N), pts = polyPts(d.vals, d.f);
      return { q: T(`${d.name.en} of ${d.N} ${d.who.en}: ${d.raw.join(', ')}. (a) Construct a frequency table. (b) Write the coordinates of the points of the frequency polygon. (c) Find the sector angles for a pie chart. (d) Show that the total frequency is unchanged in (a), (b) and (c).`, `${d.name.ms} bagi ${d.N} ${d.who.ms}: ${d.raw.join(', ')}. (a) Bina jadual kekerapan. (b) Tulis koordinat titik bagi poligon kekerapan. (c) Cari sudut sektor untuk carta pai. (d) Tunjukkan bahawa jumlah kekerapan tidak berubah dalam (a), (b) dan (c).`), a: SPM.parts([T(d.vals.map((v, i) => `${v}: ${d.f[i]}`).join('; ')), T(`$${ptsTx(pts)}$`), T(a.map((x) => x + '°').join(', ')), T(`$${d.f.join(' + ')} = ${d.N}$; $${a.join(' + ')} = 360$; $360^\\circ \\div ${d.N} \\times ${d.N} = 360^\\circ$`)]), w: W(B('Tally the list into a frequency table. || Tally senarai itu ke dalam jadual kekerapan.'), T(`$${d.f.join(' + ')} = ${d.N}$`), B('The polygon plots (value, frequency), closed on the horizontal axis at both ends. || Poligon memplot (nilai, kekerapan), ditutup pada paksi mengufuk di kedua-dua hujung.'), T(`$${ptsTx(pts)}$`), B('Angle $= \\dfrac{\\text{frequency}}{\\text{total}} \\times 360^\\circ$ || Sudut $= \\dfrac{\\text{kekerapan}}{\\text{jumlah}} \\times 360^\\circ$'), T(`${d.vals.map((v, i) => `${v}: $\\dfrac{${d.f[i]}}{${d.N}} \\times 360^\\circ = ${n(a[i])}^\\circ$`).join('; ')}`), B('The same total is shared out each time, so nothing is lost or added. || Jumlah yang sama diagihkan setiap kali, jadi tiada yang hilang atau bertambah.')), sp: 'xl' };
    },
    (r) => {
      const d = numData(r, r.pick([20, 24, 30]), 4), bad = r.int(0, d.vals.length - 1), h = d.f.slice(); h[bad] += r.pick([-1, 1, 2]);
      need(h[bad] > 0);
      const fig = dual((l) => hist(d.vals, h, { xl: d.name[l], yl: FREQ[l], bw: 0.6 }));
      return { q: T(`The table gives the "${d.name.en}" of ${d.N} ${d.who.en}.<br>${vtab(d.name, d.vals, d.f, 'en')}<br>A student draws the graph shown. Find two mistakes in the graph.`, `Jadual memberikan "${d.name.ms}" bagi ${d.N} ${d.who.ms}.<br>${vtab(d.name, d.vals, d.f, 'ms')}<br>Seorang murid melukis graf yang ditunjukkan. Cari dua kesilapan dalam graf itu.`), fig, a: T(`(1) The bars do not touch: a histogram for numerical data must have touching bars. (2) The bar for ${d.vals[bad]} has height ${h[bad]}; it should be ${d.f[bad]} (the heights would add up to ${sum(h)}, not ${d.N}).`, `(1) Palang tidak bersentuhan: histogram bagi data berangka mesti mempunyai palang yang bersentuhan. (2) Palang bagi ${d.vals[bad]} mempunyai tinggi ${h[bad]}; sepatutnya ${d.f[bad]} (jumlah tinggi ialah ${sum(h)}, bukan ${d.N}).`), w: W(B('Compare the graph with the table bar by bar, then check the total. || Bandingkan graf dengan jadual palang demi palang, kemudian semak jumlahnya.'), T(`$${h.join(' + ')} = ${sum(h)} \\neq ${d.N}$`), T(`Only the bar for ${d.vals[bad]} differs: $${h[bad]}$ instead of $${d.f[bad]}$.`, `Hanya palang bagi ${d.vals[bad]} berbeza: $${h[bad]}$ dan bukan $${d.f[bad]}$.`), B('For numerical data the bars of a histogram must touch, because the scale has no gaps. || Bagi data berangka, palang histogram mesti bersentuhan, kerana skalanya tiada jurang.')), sp: 'm' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([24, 30, 36, 40, 60]), 3), a = angs(d.f, d.total), i = r.int(0, 3), tt = r.pick([true, false]);
      const fig = dual((l) => pieSvg({ vals: d.f, labels: d.cats.map((c, q) => `${c[l]} ${n(a[q])}°`), title: d.name[l] }));
      return { q: T(`A pie chart shows the choices of some students, with only the sector angles given (the number of students is not stated). (a) Can you find how many students chose ${catNm(d, i).en}? Explain. (b) A note says that the total was ${d.total} students. Now find the number who chose ${catNm(d, i).en}. (c) What percentage chose ${catNm(d, i).en}?`, `Sebuah carta pai menunjukkan pilihan sekumpulan murid, dengan hanya sudut sektor diberikan (bilangan murid tidak dinyatakan). (a) Bolehkah anda mencari bilangan murid yang memilih ${catNm(d, i).ms}? Terangkan. (b) Satu nota menyatakan jumlah murid ialah ${d.total}. Sekarang cari bilangan yang memilih ${catNm(d, i).ms}. (c) Berapakah peratusan yang memilih ${catNm(d, i).ms}?`), fig, a: SPM.parts([B('No: a pie chart shows only shares, so the total is also needed. || Tidak: carta pai hanya menunjukkan bahagian, jadi jumlah juga diperlukan.'), T(`$\\dfrac{${n(a[i])}}{360} \\times ${d.total} = ${d.f[i]}$`), T(`${n(round(a[i] / 3.6, 1))}%`)]), w: W(B('A pie chart shows shares only, so the total is needed before a sector can be turned into a number of students. || Carta pai hanya menunjukkan bahagian, jadi jumlah diperlukan sebelum sesuatu sektor boleh ditukar kepada bilangan murid.'), T(`$\\dfrac{${n(a[i])}}{360} \\times ${d.total} = ${d.f[i]}$`), T(`$\\dfrac{${n(a[i])}}{360} \\times 100 = ${n(round(a[i] / 3.6, 1))}\\%$`)), sp: 'l' };
    },
    (r) => {
      const d = numData(r, r.pick([20, 24, 30]), 4), mi = r.int(1, d.vals.length - 2), pts = polyPts(d.vals, d.f), txt = pts.map((p, i) => (i === mi + 1 ? `(${p[0]}, ?)` : `(${p[0]}, ${p[1]})`)).join(', ');
      return { q: T(`A frequency polygon for the "${d.name.en}" of ${d.N} ${d.who.en} passes through the points ${txt}. Find the missing frequency and write the frequency table.`, `Sebuah poligon kekerapan bagi "${d.name.ms}" bagi ${d.N} ${d.who.ms} melalui titik ${txt}. Cari kekerapan yang tertinggal dan tulis jadual kekerapan.`), a: T(`$${d.N} - (${d.f.filter((_, q) => q !== mi).join(' + ')}) = ${d.f[mi]}$; ${d.vals.map((v, i) => `${v}: ${d.f[i]}`).join('; ')}`), w: W(B('The second coordinate of each point is a frequency, and the frequencies add up to the total. || Koordinat kedua bagi setiap titik ialah kekerapan, dan jumlah kekerapan ialah jumlah keseluruhan.'), T(`$${d.f.filter((_, q) => q !== mi).join(' + ')} = ${sum(d.f.filter((_, q) => q !== mi))}$`), T(`$${d.N} - ${sum(d.f.filter((_, q) => q !== mi))} = ${d.f[mi]}$`)), sp: 'm' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([40, 60, 30]), 5, 5), a = angs(d.f, d.total), mx = imax(d.f), mn = imin(d.f);
      const fg = [dual((l) => bars({ cats: d.cats.map((c) => c[l]), series: [d.f], ymax: yAx(Math.max(...d.f)).ymax, ystep: 10, cl: d.name[l], vl: FREQ[l], w: 250, h: 190 })), dual((l) => pieSvg({ vals: d.f, labels: d.cats.map((c, i) => `${c[l]} ${n(a[i])}°`), r: 50, w: 260 }))];
      return { q: T(`The same survey is shown as a bar chart and as a pie chart. (a) Which representation makes it easier to read the exact number of students in each category? Give a value from it. (b) Which representation shows better the fraction of all the students who chose ${catNm(d, mx).en}? Give the fraction. (c) State the difference in the number of students between ${catNm(d, mx).en} and ${catNm(d, mn).en}.`, `Tinjauan yang sama ditunjukkan sebagai carta palang dan carta pai. (a) Perwakilan manakah yang lebih mudah untuk membaca bilangan tepat murid bagi setiap kategori? Berikan satu nilai daripadanya. (b) Perwakilan manakah yang lebih baik menunjukkan pecahan semua murid yang memilih ${catNm(d, mx).ms}? Berikan pecahan itu. (c) Nyatakan beza bilangan murid antara ${catNm(d, mx).ms} dengan ${catNm(d, mn).ms}.`), fig: both(fg[0], fg[1]), a: SPM.parts([T(`The bar chart, e.g. ${catNm(d, mx).en}: ${d.f[mx]} students`, `Carta palang, contohnya ${catNm(d, mx).ms}: ${d.f[mx]} orang murid`), T(`The pie chart: $\\dfrac{${n(a[mx])}}{360} = ${SPM.Fr.tex(SPM.Fr.make(d.f[mx], d.total))}$`), T(`${d.f[mx] - d.f[mn]}`)]), w: W(T(`(a) The bar chart has a frequency scale, so $${d.f[mx]}$ can be read straight off it.`, `(a) Carta palang mempunyai skala kekerapan, jadi $${d.f[mx]}$ boleh dibaca terus daripadanya.`), T(`(b) $\\dfrac{${n(a[mx])}}{360} = ${SPM.Fr.tex(SPM.Fr.make(d.f[mx], d.total))}$`), T(`(c) $${d.f[mx]} - ${d.f[mn]} = ${d.f[mx] - d.f[mn]}$`)), sp: 'l' };
    },
    (r) => {
      const ctx = r.pick(NUMC), k = r.int(4, 5), vals = rg(ctx.lo, ctx.lo + k - 1), fA = vals.map(() => r.int(2, 9)), fB = vals.map(() => r.int(2, 9)), tA = sum(fA), tB = sum(fB);
      need(tA !== tB);
      const fig = dual((l) => lineSvg({ xs: vals.map(String), series: [{ ys: fA }, { ys: fB, dash: true }], ymax: ceilTo(Math.max(...fA, ...fB) + 1, 2), ystep: 2, legend: [Ln(l, 'Group A', 'Kumpulan A'), Ln(l, 'Group B', 'Kumpulan B')], xl: ctx.name[l], yl: FREQ[l], w: 320 }));
      return { q: T(`Two frequency polygons show "${ctx.name.en}" for Group A (solid line) and Group B (dashed line). (a) Find the total frequency for each group. (b) Which group has the larger number of items? (c) Explain why a frequency polygon is convenient for comparing the two groups.`, `Dua poligon kekerapan menunjukkan "${ctx.name.ms}" bagi Kumpulan A (garis penuh) dan Kumpulan B (garis putus-putus). (a) Cari jumlah kekerapan bagi setiap kumpulan. (b) Kumpulan manakah yang mempunyai bilangan yang lebih besar? (c) Terangkan mengapa poligon kekerapan sesuai untuk membandingkan kedua-dua kumpulan.`), fig, a: SPM.parts([T(`A: ${tA}; B: ${tB}`), T(tA > tB ? 'Group A' : 'Group B', tA > tB ? 'Kumpulan A' : 'Kumpulan B'), B('Both polygons can be drawn on the same axes, so their shapes and values can be compared directly. || Kedua-dua poligon boleh dilukis pada paksi yang sama, jadi bentuk dan nilainya boleh dibandingkan secara langsung.')]), w: W(T(`(a) A: $${fA.join(' + ')} = ${tA}$`, `(a) A: $${fA.join(' + ')} = ${tA}$`), T(`B: $${fB.join(' + ')} = ${tB}$`), T(`(b) $${Math.max(tA, tB)} > ${Math.min(tA, tB)}$, so Group ${tA > tB ? 'A' : 'B'} has more items.`, `(b) $${Math.max(tA, tB)} > ${Math.min(tA, tB)}$, jadi Kumpulan ${tA > tB ? 'A' : 'B'} mempunyai lebih banyak item.`), B('(c) Only the lines are drawn, so both can share one pair of axes and be compared point by point. || (c) Hanya garis yang dilukis, jadi kedua-duanya boleh berkongsi satu paksi dan dibandingkan titik demi titik.')), sp: 'l' };
    },
  ];
  SPM.extend('F1-12.3', { e: g123e, m: g123m, a: g123a });


  /* ================================================================ 12.4 */
  const xaxis = (r, len) => {
    if (r.chance(0.6)) return { s: (l) => MON[l].slice(0, len), f: (l, i) => MONF[l][i], at: (l, i) => Ln(l, 'in ', 'pada bulan ') + MONF[l][i], w: B('Month || Bulan') };
    const y0 = r.int(2014, 2020);
    return { s: () => rg(y0, y0 + len - 1).map(String), f: (l, i) => String(y0 + i), at: (l, i) => Ln(l, 'in ', 'pada tahun ') + (y0 + i), w: B('Year || Tahun') };
  };
  const lineFig = (v, ts, xa, o) => dual((l) => lineSvg(Object.assign({ xs: xa.s(l), series: [{ ys: v }], ymax: ceilTo(Math.max(...v) + 1, ts.ys), ystep: ts.ys, yl: ts.y[l], xl: xa.w[l] }, o)));
  const REAS = ['a special school event || satu acara khas sekolah', 'the new advertisement || iklan baharu', 'the hot weather || cuaca yang panas', 'the new school rule || peraturan sekolah yang baharu', 'the new teacher || guru yang baharu'].map(B);
  const CSM = { S: B('Supported: || Disokong: '), N: B('Not supported: || Tidak disokong: ') };
  /** statements about a series; c = kind; a = judgement with reason; fx = a corrected statement */
  function claims(r, v, ts, xa) {
    const k = v.length, mx = imax(v), i = r.int(1, k - 1), e = r.pick(REAS), d = r.pick([-2, -1, 1, 2]) * ts.st, last = v[k - 1], up = v[k - 1] > v[k - 2] && v[k - 2] > v[k - 3];
    const at = (l, j) => xa.at(l, j), Tm = (en, ms) => T(en, ms);
    const dec = v.findIndex((x, j) => j > 0 && x < v[j - 1]);
    const L = [
      { c: 'S', q: Tm(`The highest value occurred ${at('en', mx)}.`, `Nilai tertinggi berlaku ${at('ms', mx)}.`), a: Tm(`Supported: the highest point is ${v[mx]} ${at('en', mx)}.`, `Disokong: titik tertinggi ialah ${v[mx]} ${at('ms', mx)}.`) },
      { c: 'S', q: Tm(`The value ${at('en', i)} was ${v[i]}.`, `Nilai ${at('ms', i)} ialah ${v[i]}.`), a: Tm('Supported: it can be read directly from the graph.', 'Disokong: ia boleh dibaca terus daripada graf.') },
      { c: 'S', q: Tm(`The value ${at('en', i)} was ${v[i] > v[i - 1] ? 'greater' : 'less'} than the value ${at('en', i - 1)}.`, `Nilai ${at('ms', i)} ${v[i] > v[i - 1] ? 'lebih besar' : 'lebih kecil'} daripada nilai ${at('ms', i - 1)}.`), a: Tm(`Supported: ${v[i]} compared with ${v[i - 1]}.`, `Disokong: ${v[i]} berbanding ${v[i - 1]}.`) },
      { c: 'N', q: Tm(`The value ${at('en', i)} was ${v[i] + d}.`, `Nilai ${at('ms', i)} ialah ${v[i] + d}.`), a: Tm(`Not supported: the graph shows ${v[i]}, not ${v[i] + d}.`, `Tidak disokong: graf menunjukkan ${v[i]}, bukan ${v[i] + d}.`), fx: Tm(`The value ${at('en', i)} was ${v[i]}.`, `Nilai ${at('ms', i)} ialah ${v[i]}.`) },
      { c: 'N', q: B('The value increased every time. || Nilai meningkat setiap kali.'), ok: dec > 0, a: Tm(`Not supported: it fell from ${v[dec - 1]} to ${v[dec]} ${at('en', dec)}.`, `Tidak disokong: ia menurun daripada ${v[dec - 1]} kepada ${v[dec]} ${at('ms', dec)}.`), fx: Tm(`The value fell from ${v[dec - 1]} to ${v[dec]} ${at('en', dec)}.`, `Nilai menurun daripada ${v[dec - 1]} kepada ${v[dec]} ${at('ms', dec)}.`) },
      { c: 'N', q: Tm(`The value ${at('en', mx)} was the highest because of ${e.en}.`, `Nilai ${at('ms', mx)} paling tinggi kerana ${e.ms}.`), a: B('Not supported: the graph shows what happened, not why. Another factor may be the cause. || Tidak disokong: graf menunjukkan apa yang berlaku, bukan sebabnya. Faktor lain mungkin puncanya.'), fx: Tm(`The value was highest ${at('en', mx)} (${v[mx]}); the graph does not show the reason.`, `Nilai paling tinggi ${at('ms', mx)} (${v[mx]}); graf tidak menunjukkan sebabnya.`) },
      { c: 'N', q: B('The same pattern must happen everywhere in Malaysia. || Corak yang sama mesti berlaku di mana-mana sahaja di Malaysia.'), a: B('Not supported: the data come from one place only, so we cannot generalise to every place. || Tidak disokong: data hanya dari satu tempat, jadi kita tidak boleh membuat generalisasi kepada semua tempat.'), fx: B('This pattern was found in the data collected here. || Corak ini ditemui dalam data yang dikumpul di sini.') },
      { c: 'N', q: Tm(`The value next time will be exactly ${last + d}.`, `Nilai pada kali berikutnya tepat ${last + d}.`), a: B('Not supported: a prediction from a short trend is only approximate, not certain. || Tidak disokong: ramalan daripada aliran yang pendek hanya anggaran, bukan pasti.'), fx: Tm(`The value next time will probably be close to ${last}, but it may change.`, `Nilai pada kali berikutnya mungkin hampir ${last}, tetapi ia boleh berubah.`) },
      { c: 'P', ok: up, q: B('The value will probably be higher next time, but the pattern may change. || Nilai mungkin lebih tinggi pada kali berikutnya, tetapi corak boleh berubah.'), a: Tm(`A reasonable, cautious prediction: the last three values rose (${v[k - 3]}, ${v[k - 2]}, ${v[k - 1]}), but it is not certain.`, `Ramalan yang munasabah dan berhati-hati: tiga nilai terakhir meningkat (${v[k - 3]}, ${v[k - 2]}, ${v[k - 1]}), tetapi ia tidak pasti.`), fx: null },
    ].filter((x) => x.ok !== false);
    return L;
  }
  const CLSN = B('supported by the graph, a reasonable prediction, or not supported || disokong oleh graf, ramalan yang munasabah, atau tidak disokong');
  const CLAIMW = B('Test each statement against the graph itself: a value or a comparison that can be read off is supported; a cause, a generalisation to other places, or an exact future value is not. || Uji setiap pernyataan dengan graf itu sendiri: nilai atau perbandingan yang boleh dibaca ialah disokong; sebab, generalisasi kepada tempat lain, atau nilai masa depan yang tepat tidak disokong.');
  const g124e = [
    (r) => {
      const ts = r.pick(TS), len = r.int(6, 8), v = series(r, ts, len), xa = xaxis(r, len), mx = imax(v), mn = imin(v), t = ts.st * r.int(2, 4) + Math.min(...v), i = r.int(0, len - 1), j = r.int(0, len - 2);
      const m = multi(r, [[B('State the highest value and when it occurred. || Nyatakan nilai tertinggi dan bila ia berlaku.'), T(`${v[mx]}, ${xa.at('en', mx)}`, `${v[mx]}, ${xa.at('ms', mx)}`), T(`The highest point is $${v[mx]}$, ${xa.at('en', mx)}.`, `Titik tertinggi ialah $${v[mx]}$, ${xa.at('ms', mx)}.`)], [B('State the lowest value and when it occurred. || Nyatakan nilai terendah dan bila ia berlaku.'), T(`${v[mn]}, ${xa.at('en', mn)}`, `${v[mn]}, ${xa.at('ms', mn)}`), T(`The lowest point is $${v[mn]}$, ${xa.at('en', mn)}.`, `Titik terendah ialah $${v[mn]}$, ${xa.at('ms', mn)}.`)], [B('Find the total of all the values shown. || Cari jumlah semua nilai yang ditunjukkan.'), T(`${sum(v)}`), T(`$${v.join(' + ')} = ${sum(v)}$`)], [T(`How many times was the value greater than ${t}?`, `Berapa kalikah nilai lebih besar daripada ${t}?`), T(`${v.filter((x) => x > t).length}`), T(`Count the points above the level $${t}$: $${v.filter((x) => x > t).length}$.`, `Bilang titik yang berada di atas aras $${t}$: $${v.filter((x) => x > t).length}$.`)], [T(`Find the change in the value from ${xa.f('en', i)} to ${xa.f('en', len - 1)}.`, `Cari perubahan nilai dari ${xa.f('ms', i)} hingga ${xa.f('ms', len - 1)}.`), i === len - 1 ? null : T(`${v[len - 1] - v[i] >= 0 ? '+' : '-'}${Math.abs(v[len - 1] - v[i])}`), T(`Change $=$ later value $-$ earlier value: $${v[len - 1]} - ${v[i]} = ${v[len - 1] - v[i]}$.`, `Perubahan $=$ nilai kemudian $-$ nilai awal: $${v[len - 1]} - ${v[i]} = ${v[len - 1] - v[i]}$.`)]].filter((x) => x[1]), 2, 3);
      return { q: cat(T(`The line graph shows the ${ts.w.en}. `, `Graf garis menunjukkan ${ts.w.ms}. `), m.q), fig: lineFig(v, ts, xa), a: m.a, w: m.w, sp: 's' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([40, 60, 30]), 3), f2 = d.cats.map(() => r.int(3, 20)), sn = r.pick([['Boys || Lelaki', 'Girls || Perempuan'], ['Class A || Kelas A', 'Class B || Kelas B'], ['Form 1 || Tingkatan 1', 'Form 2 || Tingkatan 2']]).map(B), i = r.int(0, 3), mxB = imax(f2);
      need(new Set(f2).size === 4 && f2[i] !== d.f[i]);
      const ax = yAx(Math.max(...d.f, ...f2)), fig = dual((l) => bars({ cats: d.cats.map((c) => c[l]), series: [d.f, f2], ymax: ax.ymax, ystep: ax.ystep, legend: sn.map((x) => x[l]), cl: d.name[l], vl: Ln(l, 'Number of students', 'Bilangan murid') }));
      const m = multi(r, [[T(`In which category was the number highest for ${sn[1].en}?`, `Dalam kategori manakah bilangan paling tinggi bagi ${sn[1].ms}?`), catNm(d, mxB), T(`The tallest ${sn[1].en} bar is $${f2[mxB]}$, at ${catNm(d, mxB).en}.`, `Palang ${sn[1].ms} yang tertinggi ialah $${f2[mxB]}$, pada ${catNm(d, mxB).ms}.`)], [T(`Find the total number of students for ${sn[0].en}.`, `Cari jumlah murid bagi ${sn[0].ms}.`), T(`${d.total}`), T(`$${d.f.join(' + ')} = ${d.total}$`)], [T(`For ${catNm(d, i).en}, which group is larger, and by how many?`, `Bagi ${catNm(d, i).ms}, kumpulan manakah yang lebih besar, dan lebih berapa?`), T(`${d.f[i] > f2[i] ? sn[0].en : sn[1].en}, ${Math.abs(d.f[i] - f2[i])}`, `${d.f[i] > f2[i] ? sn[0].ms : sn[1].ms}, ${Math.abs(d.f[i] - f2[i])}`), T(`$${Math.max(d.f[i], f2[i])} - ${Math.min(d.f[i], f2[i])} = ${Math.abs(d.f[i] - f2[i])}$`)], [B('How many students are shown altogether? || Berapakah jumlah semua murid yang ditunjukkan?'), T(`${d.total + sum(f2)}`), T(`$${d.total} + ${sum(f2)} = ${d.total + sum(f2)}$`)]], 2, 3);
      return { q: cat(T(`The double bar chart compares two groups: ${sn[0].en} and ${sn[1].en}. `, `Carta palang berganda membandingkan dua kumpulan: ${sn[0].ms} dan ${sn[1].ms}. `), m.q), fig, a: m.a, w: m.w, sp: 's' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([20, 25, 40, 50]), 2), i = r.int(0, 3), mx = imax(d.f), tw = d.f.map((x) => (x * 100) / d.total);
      const m = multi(r, [[T(`What percentage of the students chose ${catNm(d, i).en}?`, `Berapakah peratusan murid yang memilih ${catNm(d, i).ms}?`), T(`${n(tw[i])}%`), T(`$\\dfrac{${d.f[i]}}{${d.total}} \\times 100 = ${n(tw[i])}\\%$`)], [B('Did more than half of the students choose the most popular category? || Adakah lebih separuh murid memilih kategori paling popular?'), YN(d.f[mx] * 2 > d.total), T(`Half of the students is $${d.total} \\div 2 = ${n(d.total / 2)}$, and the largest frequency is $${d.f[mx]}$.`, `Separuh daripada murid ialah $${d.total} \\div 2 = ${n(d.total / 2)}$, dan kekerapan terbesar ialah $${d.f[mx]}$.`)], [B('What percentage of the students did not choose the most popular category? || Berapakah peratusan murid yang tidak memilih kategori paling popular?'), T(`${n(100 - tw[mx])}%`), T(`$\\dfrac{${d.f[mx]}}{${d.total}} \\times 100 = ${n(tw[mx])}\\%$, so $100\\% - ${n(tw[mx])}\\% = ${n(100 - tw[mx])}\\%$.`, `$\\dfrac{${d.f[mx]}}{${d.total}} \\times 100 = ${n(tw[mx])}\\%$, jadi $100\\% - ${n(tw[mx])}\\% = ${n(100 - tw[mx])}\\%$.`)]], 1, 2);
      return { q: cat(intro(d, d.total), T(' ', ' '), m.q), fig: barFig(d, r), a: m.a, w: m.w, sp: 's' };
    },
    (r) => {
      const ts = r.pick(TS), len = r.int(5, 7), xa = xaxis(r, len);
      const kind = r.pick(['up', 'down', 'peak', 'zig']);
      const base = ts.lo + ts.st * 2, sp = ts.st * r.int(2, 3), v = rg(0, len - 1).map((i) => (kind === 'up' ? base + sp * i : kind === 'down' ? base + sp * (len - 1 - i) : kind === 'peak' ? base + sp * Math.min(i, len - 1 - i) : base + sp * (i % 2) * 2));
      need(Math.max(...v) <= ts.hi);
      const nm = { up: B('it increases steadily || ia meningkat dengan tetap'), down: B('it decreases steadily || ia menurun dengan tetap'), peak: B('it increases and then decreases || ia meningkat kemudian menurun'), zig: B('it goes up and down alternately || ia turun naik secara berselang-seli') };
      const o = mc(r, nm[kind], Object.keys(nm).filter((q) => q !== kind).map((q) => nm[q]));
      return { q: T(`The graph shows the ${ts.w.en}. Which statement best describes the trend?<br>${o.en}`, `Graf menunjukkan ${ts.w.ms}. Pernyataan manakah yang paling baik menerangkan aliran itu?<br>${o.ms}`), fig: lineFig(v, ts, xa), a: o.ans, w: W(T(`Reading the graph, the values are $${v.join(',\\ ')}$.`, `Membaca graf, nilainya ialah $${v.join(',\\ ')}$.`), o.ans), sp: 's' };
    },
    (r) => {
      const ts = r.pick(TS), len = r.int(5, 7), v = series(r, ts, len), xa = xaxis(r, len), cl = claims(r, v, ts, xa).filter((x) => x.c !== 'P'), c = r.pick(cl.filter((x) => x.c === 'S' || x.fx));
      return { q: T(`The graph shows the ${ts.w.en}. Is the statement "${c.q.en}" supported by the graph? Give a reason.`, `Graf menunjukkan ${ts.w.ms}. Adakah pernyataan "${c.q.ms}" disokong oleh graf? Berikan sebab.`), fig: lineFig(v, ts, xa), a: c.a, w: W(CLAIMW, c.a), sp: 's' };
    },
    (r) => {
      const d = numData(r, r.pick([20, 25, 40, 50]), 4), mx = d.f.indexOf(Math.max(...d.f)), t = r.pick(d.vals.slice(1, -1));
      need(d.f.filter((x) => x === Math.max(...d.f)).length === 1);
      const ge = sum(d.f.filter((_, i) => d.vals[i] >= t)), m = multi(r, [[B('Which value is the most common? || Nilai yang manakah paling biasa?'), T(`${d.vals[mx]}`), T(`The tallest bar stands over ${d.vals[mx]}, with height $${d.f[mx]}$.`, `Palang tertinggi berada di atas ${d.vals[mx]}, dengan tinggi $${d.f[mx]}$.`)], [T(`How many have ${t} or more?`, `Berapakah yang mempunyai ${t} atau lebih?`), T(`${ge}`), T(`$${d.f.filter((_, i) => d.vals[i] >= t).join(' + ')} = ${ge}$`)], [T(`What percentage have fewer than ${t}?`, `Berapakah peratusan yang mempunyai kurang daripada ${t}?`), T(`${n((d.N - ge) * 100 / d.N)}%`), W(T(`$${d.N} - ${ge} = ${d.N - ge}$`), T(`$\\dfrac{${d.N - ge}}{${d.N}} \\times 100 = ${n((d.N - ge) * 100 / d.N)}\\%$`))]], 2, 3);
      return { q: cat(T(`The histogram shows the "${d.name.en}" of ${d.N} ${d.who.en}. `, `Histogram menunjukkan "${d.name.ms}" bagi ${d.N} ${d.who.ms}. `), m.q), fig: dual((l) => numFig(d, l)), a: m.a, w: m.w, sp: 's' };
    },
  ];
  const PAIRS = [['Place P || Tempat P', 'Place Q || Tempat Q'], ['Site A || Lokasi A', 'Site B || Lokasi B'], ['Branch 1 || Cawangan 1', 'Branch 2 || Cawangan 2']].map((p) => p.map(B));
  const CHG = [['visitors to a museum (hundreds) || pengunjung ke sebuah muzium (ratus)', 'Visitors (hundreds) || Pengunjung (ratus)'], ['books sold at a school bookshop || buku yang dijual di kedai buku sekolah', 'Books sold || Buku dijual'], ['students in the school choir || murid dalam koir sekolah', 'Students || Murid'], ['drinks sold at the canteen || minuman yang dijual di kantin', 'Drinks sold || Minuman dijual']].map((x) => ({ w: B(x[0]), y: B(x[1]) }));
  const g124m = [
    (r) => {
      const y0 = r.int(2015, 2020), b = r.pick([2, 4, 6, 8]), base = r.step(20, 60, 2), v = rg(0, 4).map((i) => base + b * i + r.pick([-1, 0, 1])), h = r.int(1, 3);
      need((v[h - 1] + v[h + 1]) % 2 === 0);
      const ts = r.pick(CHG), est = (v[h - 1] + v[h + 1]) / 2, tb = (l) => SPM.table([[ts.y[l], ...v.map((x, i) => (i === h ? '?' : x))]], { head: [Ln(l, 'Year', 'Tahun'), ...rg(0, 4).map((i) => y0 + i)] });
      return { q: T(`The table shows the number of ${ts.w.en} in five years. The value for ${y0 + h} is missing.<br>${tb('en')}<br>(a) Estimate the missing value. (b) Give one reason why your answer is only an estimate.`, `Jadual menunjukkan bilangan ${ts.w.ms} dalam lima tahun. Nilai bagi ${y0 + h} tiada.<br>${tb('ms')}<br>(a) Anggarkan nilai yang tiada. (b) Berikan satu sebab mengapa jawapan anda hanya anggaran.`), a: SPM.parts([T(`$(${v[h - 1]} + ${v[h + 1]}) \\div 2 = ${est}$`), B('The trend is only roughly steady, so the actual value could be a little different. || Aliran hanya hampir tetap, jadi nilai sebenar mungkin sedikit berbeza.')]), w: W(B('The values rise by about the same amount each year, so take the value half-way between the two neighbours. || Nilai meningkat kira-kira sama banyak setiap tahun, jadi ambil nilai di tengah-tengah antara dua jiran.'), T(`$(${v[h - 1]} + ${v[h + 1]}) \\div 2 = ${est}$`), B('The rise is not exactly the same every year, so this is only an estimate. || Kenaikan itu tidak tepat sama setiap tahun, jadi ini hanya anggaran.')), sp: 'm' };
    },
    (r) => {
      const ts = r.pick(TS), len = r.int(5, 6), va = series(r, ts, len), vb = series(r, ts, len), xa = xaxis(r, len), pr = r.pick(PAIRS), i = r.int(0, len - 1);
      const na = va.filter((x, q) => x > vb[q]).length, dm = va.map((x, q) => Math.abs(x - vb[q])), bi = dm.indexOf(Math.max(...dm));
      need(dm.filter((x) => x === Math.max(...dm)).length === 1 && na !== len / 2);
      const fig = dual((l) => lineSvg({ xs: xa.s(l), series: [{ ys: va }, { ys: vb, dash: true }], legend: pr.map((x) => x[l]), ymax: ceilTo(Math.max(...va, ...vb) + 1, ts.ys), ystep: ts.ys, yl: ts.y[l], xl: xa.w[l] }));
      const m = multi(r, [[T(`Which was higher ${xa.at('en', i)}, and by how much?`, `Yang manakah lebih tinggi ${xa.at('ms', i)}, dan lebih berapa?`), va[i] === vb[i] ? B('Equal || Sama') : T(`${(va[i] > vb[i] ? pr[0] : pr[1]).en}, ${Math.abs(va[i] - vb[i])}`, `${(va[i] > vb[i] ? pr[0] : pr[1]).ms}, ${Math.abs(va[i] - vb[i])}`), va[i] === vb[i] ? T(`Both lines are at $${va[i]}$.`, `Kedua-dua garis berada pada $${va[i]}$.`) : T(`$${Math.max(va[i], vb[i])} - ${Math.min(va[i], vb[i])} = ${Math.abs(va[i] - vb[i])}$`)], [T(`In how many of the ${len} periods was ${pr[0].en} higher than ${pr[1].en}?`, `Dalam berapa daripada ${len} tempoh ${pr[0].ms} lebih tinggi daripada ${pr[1].ms}?`), T(`${na}`), T(`Count the times the solid line is above the dashed one: $${na}$.`, `Bilang berapa kali garis penuh berada di atas garis putus-putus: $${na}$.`)], [B('When was the difference between the two greatest, and what was it? || Bilakah beza antara keduanya paling besar, dan berapakah bezanya?'), T(`${xa.f('en', bi)}, ${dm[bi]}`, `${xa.f('ms', bi)}, ${dm[bi]}`), T(`Differences: $${dm.join(',\\ ')}$; the largest is $${dm[bi]}$, ${xa.at('en', bi)}.`, `Beza: $${dm.join(',\\ ')}$; yang terbesar ialah $${dm[bi]}$, ${xa.at('ms', bi)}.`)], [B('Which has the larger total for all the periods shown? || Yang manakah mempunyai jumlah yang lebih besar bagi semua tempoh yang ditunjukkan?'), sum(va) === sum(vb) ? B('Equal || Sama') : T(`${(sum(va) > sum(vb) ? pr[0] : pr[1]).en} (${Math.max(sum(va), sum(vb))} against ${Math.min(sum(va), sum(vb))})`, `${(sum(va) > sum(vb) ? pr[0] : pr[1]).ms} (${Math.max(sum(va), sum(vb))} berbanding ${Math.min(sum(va), sum(vb))})`), W(T(`$${va.join(' + ')} = ${sum(va)}$`), T(`$${vb.join(' + ')} = ${sum(vb)}$`))]], 2, 3);
      return { q: cat(T(`The line graph compares the ${ts.w.en} for ${pr[0].en} (solid line) and ${pr[1].en} (dashed line). `, `Graf garis membandingkan ${ts.w.ms} bagi ${pr[0].ms} (garis penuh) dan ${pr[1].ms} (garis putus-putus). `), m.q), fig, a: m.a, w: m.w, sp: 'm' };
    },
    (r) => {
      const c = r.pick(CTXS), cats = r.sample(c.cats, 4), fb = r.int(3, 7), k = r.pick([2, 3]), fa = fb * k, rest = r.sample(rg(3, 20).filter((x) => x !== fa && x !== fb), 2), f = [fa, fb, ...rest], d = { name: c.name, cats, f, total: sum(f), k: 4 };
      const p = f.map((x) => x * 100 / d.total);
      const m = multi(r, [[T(`How many times as many students chose ${cats[0].en} as ${cats[1].en}?`, `Berapa kalikah ganda murid yang memilih ${cats[0].ms} berbanding ${cats[1].ms}?`), T(`${k}`), T(`$${fa} \\div ${fb} = ${k}$`)], [T(`What fraction of the students chose ${cats[0].en}? Give your answer in its simplest form.`, `Apakah pecahan murid yang memilih ${cats[0].ms}? Beri jawapan dalam bentuk termudah.`), T(`$${SPM.Fr.tex(SPM.Fr.make(fa, d.total))}$`), T(`$\\dfrac{${fa}}{${d.total}} = ${SPM.Fr.tex(SPM.Fr.make(fa, d.total))}$`)], [T(`How many more students chose ${cats[0].en} than ${cats[1].en}?`, `Berapa ramaikah murid yang memilih ${cats[0].ms} berbanding ${cats[1].ms}?`), T(`${fa - fb}`), T(`$${fa} - ${fb} = ${fa - fb}$`)], [B('How many students were surveyed altogether? || Berapakah jumlah murid yang ditinjau?'), T(`${d.total}`), T(`$${f.join(' + ')} = ${d.total}$`)]], 2, 3);
      return { q: cat(T('The bar chart shows the results of a survey of students. ', 'Carta palang menunjukkan keputusan satu tinjauan terhadap murid. '), m.q), fig: barFig(d, r), a: m.a, w: m.w, sp: 'm' };
    },
    (r) => {
      const ts = r.pick(TS), len = r.int(5, 7), v = series(r, ts, len), xa = xaxis(r, len), cl = claims(r, v, ts, xa), pool = r.shuffle(cl), pick = pool.slice(0, 3);
      need(new Set(pick.map((x) => x.c)).size >= 2);
      return { q: T(`The graph shows the ${ts.w.en}. For each statement, say whether it is ${CLSN.en}. (a) ${pick[0].q.en} (b) ${pick[1].q.en} (c) ${pick[2].q.en}`, `Graf menunjukkan ${ts.w.ms}. Bagi setiap pernyataan, nyatakan sama ada ia ${CLSN.ms}. (a) ${pick[0].q.ms} (b) ${pick[1].q.ms} (c) ${pick[2].q.ms}`), fig: lineFig(v, ts, xa), a: SPM.parts(pick.map((x) => x.a)), w: W(CLAIMW, B('A graph shows what happened, not why it happened, and it describes only the data that were collected. || Graf menunjukkan apa yang berlaku, bukan sebabnya, dan ia hanya memerihalkan data yang telah dikumpul.')), sp: 'l' };
    },
    (r) => {
      const ts = r.pick(TS), len = r.int(5, 7), v = series(r, ts, len), xa = xaxis(r, len), cl = claims(r, v, ts, xa), good = r.sample(cl.filter((x) => x.c === 'S'), 3), bad = r.pick(cl.filter((x) => x.c === 'N'));
      const o = mc(r, bad.q, good.map((x) => x.q));
      return { q: T(`The graph shows the ${ts.w.en}. Which statement can NOT be concluded from the graph?<br>${o.en}`, `Graf menunjukkan ${ts.w.ms}. Pernyataan manakah yang TIDAK boleh disimpulkan daripada graf?<br>${o.ms}`), fig: lineFig(v, ts, xa), a: T(`(${o.letter}). ${bad.a.en}`, `(${o.letter}). ${bad.a.ms}`), w: W(CLAIMW, B('The other three options are values or comparisons that can be read straight from the graph. || Tiga pilihan yang lain ialah nilai atau perbandingan yang boleh dibaca terus daripada graf.'), T(`(${o.letter}): ${bad.a.en}`, `(${o.letter}): ${bad.a.ms}`)), sp: 's' };
    },
    (r) => {
      const c = r.pick(CHG), v1 = r.step(20, 100, 20), p = r.pick([10, 20, 25, 50]), up = r.chance(), v2 = up ? v1 * (100 + p) / 100 : v1 * (100 - p) / 100, y0 = r.int(2017, 2022);
      need(Number.isInteger(v2));
      const fig = dual((l) => bars({ cats: [String(y0), String(y0 + 1)], series: [[v1, v2]], ymax: ceilTo(Math.max(v1, v2) + 1, 20), ystep: 20, vl: c.y[l], cl: Ln(l, 'Year', 'Tahun'), w: 220, h: 190, vals: true }));
      return { q: T(`The bar chart shows the ${c.w.en} in ${y0} and ${y0 + 1}. (a) Find the ${up ? 'increase' : 'decrease'}. (b) Express the ${up ? 'increase' : 'decrease'} as a percentage of the value in ${y0}.`, `Carta palang menunjukkan ${c.w.ms} pada ${y0} dan ${y0 + 1}. (a) Cari ${up ? 'pertambahan' : 'pengurangan'}. (b) Nyatakan ${up ? 'pertambahan' : 'pengurangan'} itu sebagai peratusan nilai pada ${y0}.`), fig, a: SPM.parts([T(`$${Math.abs(v2 - v1)}$`), T(`$\\dfrac{${Math.abs(v2 - v1)}}{${v1}} \\times 100 = ${p}\\%$`)]), w: W(T(`Read the two bars: $${v1}$ and $${v2}$.`, `Baca kedua-dua palang: $${v1}$ dan $${v2}$.`), T(`$${Math.max(v1, v2)} - ${Math.min(v1, v2)} = ${Math.abs(v2 - v1)}$`), B('Percentage change $= \\dfrac{\\text{change}}{\\text{original value}} \\times 100\\%$, so divide by the earlier year. || Peratusan perubahan $= \\dfrac{\\text{perubahan}}{\\text{nilai asal}} \\times 100\\%$, jadi bahagikan dengan tahun yang lebih awal.'), T(`$\\dfrac{${Math.abs(v2 - v1)}}{${v1}} \\times 100 = ${p}\\%$`)), sp: 'm' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([20, 25, 40]), 2), f2 = d.cats.map(() => r.int(2, 12)), sn = r.pick([['Boys || Lelaki', 'Girls || Perempuan'], ['Class A || Kelas A', 'Class B || Kelas B']]).map(B), t = d.total + sum(f2), mx = imax(d.f.map((x, i) => x + f2[i]));
      need(new Set(d.f.map((x, i) => x + f2[i])).size === 4);
      const ax = yAx(Math.max(...d.f, ...f2)), fig = dual((l) => bars({ cats: d.cats.map((c) => c[l]), series: [d.f, f2], ymax: ax.ymax, ystep: ax.ystep, legend: sn.map((x) => x[l]), cl: d.name[l], vl: Ln(l, 'Number of students', 'Bilangan murid') }));
      return { q: T(`The double bar chart shows the choices of ${sn[0].en} and ${sn[1].en}. (a) Which category has the largest combined number of students? (b) What percentage of all the students are ${sn[1].en}? Give your answer to 1 decimal place.`, `Carta palang berganda menunjukkan pilihan ${sn[0].ms} dan ${sn[1].ms}. (a) Kategori manakah yang mempunyai gabungan bilangan murid paling banyak? (b) Berapakah peratusan semua murid ialah ${sn[1].ms}? Beri jawapan betul kepada 1 tempat perpuluhan.`), fig, a: SPM.parts([T(`${catNm(d, mx).en}: ${d.f[mx] + f2[mx]}`, `${catNm(d, mx).ms}: ${d.f[mx] + f2[mx]}`), T(`$\\dfrac{${sum(f2)}}{${t}} \\times 100 = ${n(round(sum(f2) * 100 / t, 1))}\\%$`)]), w: W(T(`(a) Add the two bars of each category: ${d.cats.map((c, q) => `${c.en} $${d.f[q]} + ${f2[q]} = ${d.f[q] + f2[q]}$`).join('; ')}.`, `(a) Tambah dua palang bagi setiap kategori: ${d.cats.map((c, q) => `${c.ms} $${d.f[q]} + ${f2[q]} = ${d.f[q] + f2[q]}$`).join('; ')}.`), T(`(b) $${d.total} + ${sum(f2)} = ${t}$ students altogether.`, `(b) $${d.total} + ${sum(f2)} = ${t}$ orang murid kesemuanya.`), T(`$\\dfrac{${sum(f2)}}{${t}} \\times 100 = ${n(round(sum(f2) * 100 / t, 1))}\\%$`)), sp: 'm' };
    },
  ];
  const THIRD = [
    ['umbrellas sold || payung yang dijual', 'students absent from school || murid yang tidak hadir ke sekolah', 'rainy weather || cuaca hujan'],
    ['cold drinks sold || minuman sejuk yang dijual', 'fans used in the school || kipas yang digunakan di sekolah', 'hot weather || cuaca panas'],
    ['raincoats sold || baju hujan yang dijual', 'muddy shoes at the school gate || kasut berlumpur di pintu pagar sekolah', 'rainy weather || cuaca hujan'],
    ['school uniforms sold || pakaian seragam yang dijual', 'new students registered || murid baharu yang mendaftar', 'the start of the school year || permulaan tahun persekolahan'],
  ].map((x) => x.map(B));
  const g124a = [
    (r) => {
      const ts = r.pick(TS), len = r.int(5, 7), v = series(r, ts, len), xa = xaxis(r, len), cl = claims(r, v, ts, xa), pick = r.shuffle(cl).slice(0, 4);
      need(pick.filter((x) => x.fx).length >= 2);
      return { q: T(`The graph shows the ${ts.w.en}. For each statement below, decide whether it is ${CLSN.en}. If it is not supported, rewrite it so that the graph supports it. (a) ${pick[0].q.en} (b) ${pick[1].q.en} (c) ${pick[2].q.en} (d) ${pick[3].q.en}`, `Graf menunjukkan ${ts.w.ms}. Bagi setiap pernyataan di bawah, tentukan sama ada ia ${CLSN.ms}. Jika tidak disokong, tulis semula supaya disokong oleh graf. (a) ${pick[0].q.ms} (b) ${pick[1].q.ms} (c) ${pick[2].q.ms} (d) ${pick[3].q.ms}`), fig: lineFig(v, ts, xa), a: SPM.parts(pick.map((x) => (x.fx ? T(`${x.a.en} Rewrite: "${x.fx.en}"`, `${x.a.ms} Tulis semula: "${x.fx.ms}"`) : x.a))), w: W(CLAIMW, B('To rewrite an unsupported statement, keep only the part that the graph shows and drop the cause, the generalisation or the exact prediction. || Untuk menulis semula pernyataan yang tidak disokong, kekalkan hanya bahagian yang ditunjukkan oleh graf dan buang sebab, generalisasi atau ramalan yang tepat.')), sp: 'xl' };
    },
    (r) => {
      const c = r.pick(CHG), y0 = r.int(2016, 2020), b = r.pick([2, 3, 4, 5]) * 2, base = r.step(10, 40, 2), v = rg(0, 4).map((i) => base + b * i), far = r.pick([10, 15]);
      const tb = (l) => SPM.table([[c.y[l], ...v]], { head: [Ln(l, 'Year', 'Tahun'), ...rg(0, 4).map((i) => y0 + i)] });
      return { q: T(`The table shows the ${c.w.en} for five years.<br>${tb('en')}<br>(a) Describe the pattern. (b) Predict the value for ${y0 + 5}. (c) A student uses the same pattern to predict the value for ${y0 + far}. Find the student's prediction and explain why it is less reliable than your answer in (b).`, `Jadual menunjukkan ${c.w.ms} selama lima tahun.<br>${tb('ms')}<br>(a) Huraikan coraknya. (b) Ramalkan nilai bagi ${y0 + 5}. (c) Seorang murid menggunakan corak yang sama untuk meramalkan nilai bagi ${y0 + far}. Cari ramalan murid itu dan terangkan mengapa ia kurang boleh dipercayai berbanding jawapan anda dalam (b).`), a: SPM.parts([T(`It increases by ${b} each year.`, `Ia meningkat sebanyak ${b} setiap tahun.`), T(`$${v[4]} + ${b} = ${v[4] + b}$ (approximately)`, `$${v[4]} + ${b} = ${v[4] + b}$ (anggaran)`), T(`$${v[4]} + ${far - 4} \\times ${b} = ${v[4] + (far - 4) * b}$. It is far beyond the data, so other changes are more likely to break the pattern.`, `$${v[4]} + ${far - 4} \\times ${b} = ${v[4] + (far - 4) * b}$. Ia jauh melangkaui data, jadi perubahan lain lebih berkemungkinan mengganggu corak itu.`)]), w: W(T(`The values are $${v.join(',\\ ')}$, rising by $${b}$ each year.`, `Nilainya ialah $${v.join(',\\ ')}$, meningkat sebanyak $${b}$ setiap tahun.`), T(`$${v[4]} + ${b} = ${v[4] + b}$`), T(`$${v[4]} + ${far - 4} \\times ${b} = ${v[4] + (far - 4) * b}$`), B('One step beyond the data is fairly safe; far beyond it the prediction assumes the pattern never changes. || Satu langkah selepas data agak selamat; jauh melangkauinya, ramalan itu menganggap corak tidak pernah berubah.')), sp: 'l' };
    },
    (r) => {
      const c = r.pick(CTXS), cat1 = r.pick(c.cats), s = r.pick([20, 25, 30, 40]), x = Math.round(s * r.pick([0.4, 0.5, 0.6])), cls = r.pick(['Form 1 Amanah || Tingkatan 1 Amanah', 'Form 2 Bestari || Tingkatan 2 Bestari', 'Form 3 Cekap || Tingkatan 3 Cekap']);
      const cl = B(cls);
      return { q: T(`In a survey on "${c.name.en}", ${s} students of ${cl.en} were asked. ${x} of them chose ${cat1.en}. A student concludes: "${n(x * 100 / s)}% of all students in Malaysia chose ${cat1.en}." (a) What can be concluded from the survey? (b) Why is the student's conclusion not supported? (c) How could the survey be improved?`, `Dalam satu tinjauan tentang "${c.name.ms}", ${s} orang murid ${cl.ms} ditanya. ${x} orang daripada mereka memilih ${cat1.ms}. Seorang murid membuat kesimpulan: "${n(x * 100 / s)}% daripada semua murid di Malaysia memilih ${cat1.ms}." (a) Apakah yang boleh disimpulkan daripada tinjauan itu? (b) Mengapakah kesimpulan murid itu tidak disokong? (c) Bagaimanakah tinjauan itu boleh diperbaiki?`), a: SPM.parts([T(`${x} of the ${s} students (${n(x * 100 / s)}%) in ${cl.en} chose ${cat1.en}.`, `${x} daripada ${s} orang murid (${n(x * 100 / s)}%) dalam ${cl.ms} memilih ${cat1.ms}.`), B('The sample is one class only, so it does not represent all students in Malaysia. || Sampel hanya satu kelas, jadi ia tidak mewakili semua murid di Malaysia.'), B('Ask a larger random sample from many schools and classes. || Tanya sampel rawak yang lebih besar daripada banyak sekolah dan kelas.')]), w: W(T(`$\\dfrac{${x}}{${s}} \\times 100 = ${n(x * 100 / s)}\\%$, but only of the ${s} students asked.`, `$\\dfrac{${x}}{${s}} \\times 100 = ${n(x * 100 / s)}\\%$, tetapi hanya daripada ${s} orang murid yang ditanya.`), B('A sample can describe only the group it was taken from, so the conclusion must name that group. || Sampel hanya boleh memerihalkan kumpulan asalnya, jadi kesimpulan mesti menamakan kumpulan itu.')), sp: 'l' };
    },
    (r) => {
      const ts = r.pick(TS), len = r.int(5, 6), base = series(r, ts, len), xa = xaxis(r, len), th = r.pick(THIRD), vb = base.map((x) => x + r.pick([-1, 0, 1]) * ts.st), mx = imax(base);
      need(imax(vb) === mx);
      const ax = ceilTo(Math.max(...base, ...vb) + 1, ts.ys);
      const fig = dual((l) => lineSvg({ xs: xa.s(l), series: [{ ys: base }, { ys: vb, dash: true }], legend: [th[0][l], th[1][l]], ymax: ax, ystep: ts.ys, xl: xa.w[l], w: 330 }));
      return { q: T(`The graph shows the number of ${th[0].en} (solid line) and the number of ${th[1].en} (dashed line). A student says: "Selling more of the first item causes more of the second." (a) Describe the pattern in the graph and cite two values. (b) Is the claim supported? Explain. (c) Suggest another factor that could explain the pattern.`, `Graf menunjukkan bilangan ${th[0].ms} (garis penuh) dan bilangan ${th[1].ms} (garis putus-putus). Seorang murid berkata: "Lebih banyak barang pertama dijual menyebabkan lebih banyak barang kedua." (a) Huraikan corak pada graf dan petik dua nilai. (b) Adakah tuntutan itu disokong? Terangkan. (c) Cadangkan faktor lain yang boleh menerangkan corak itu.`), fig, a: SPM.parts([T(`Both are highest ${xa.at('en', mx)} (${base[mx]} and ${vb[mx]}) and both change together.`, `Kedua-duanya paling tinggi ${xa.at('ms', mx)} (${base[mx]} dan ${vb[mx]}) dan kedua-duanya berubah bersama.`), B('Not supported: the graph shows that they rise and fall together (an association), not that one causes the other. || Tidak disokong: graf menunjukkan kedua-duanya naik dan turun bersama (perkaitan), bukan yang satu menyebabkan yang lain.'), T(`For example, ${th[2].en}.`, `Contohnya, ${th[2].ms}.`)]), w: W(T(`Both lines peak ${xa.at('en', mx)}: $${base[mx]}$ and $${vb[mx]}$, and they rise and fall together.`, `Kedua-dua garis memuncak ${xa.at('ms', mx)}: $${base[mx]}$ dan $${vb[mx]}$, dan kedua-duanya naik dan turun bersama.`), B('Two quantities that change together are associated; association alone is not proof of cause. || Dua kuantiti yang berubah bersama mempunyai perkaitan; perkaitan sahaja bukan bukti sebab.'), T(`A third factor, such as ${th[2].en}, can raise both at the same time.`, `Faktor ketiga, seperti ${th[2].ms}, boleh meningkatkan kedua-duanya pada masa yang sama.`)), sp: 'l' };
    },
    (r) => {
      const ts = r.pick(TS), len = r.int(6, 8), v = series(r, ts, len), xa = xaxis(r, len), mx = imax(v), mn = imin(v), last = v[len - 1];
      return { q: T(`The graph shows the ${ts.w.en}. Write (a) one observation with a value, (b) one inference or comparison using two values, (c) one cautious prediction, with a reason for being cautious.`, `Graf menunjukkan ${ts.w.ms}. Tulis (a) satu pemerhatian dengan nilai, (b) satu inferens atau perbandingan menggunakan dua nilai, (c) satu ramalan yang berhati-hati, dengan sebab berhati-hati.`), fig: lineFig(v, ts, xa), a: T(`Sample answer: (a) The highest value was ${v[mx]} ${xa.at('en', mx)}. (b) The value ${xa.at('en', mx)} was ${v[mx] - v[mn]} more than ${xa.at('en', mn)} (${v[mn]}). (c) The next value will probably be near ${last}, but this is uncertain because only ${len} values are shown and other factors may change it.`, `Contoh jawapan: (a) Nilai tertinggi ialah ${v[mx]} ${xa.at('ms', mx)}. (b) Nilai ${xa.at('ms', mx)} lebih ${v[mx] - v[mn]} daripada ${xa.at('ms', mn)} (${v[mn]}). (c) Nilai seterusnya mungkin hampir ${last}, tetapi ini tidak pasti kerana hanya ${len} nilai ditunjukkan dan faktor lain boleh mengubahnya.`), w: W(B('An observation reads one value off the graph; an inference compares two values; a prediction goes beyond the data, so it must be cautious. || Pemerhatian membaca satu nilai daripada graf; inferens membandingkan dua nilai; ramalan melangkaui data, jadi ia mesti berhati-hati.'), T(`Highest $${v[mx]}$, lowest $${v[mn]}$: $${v[mx]} - ${v[mn]} = ${v[mx] - v[mn]}$.`, `Tertinggi $${v[mx]}$, terendah $${v[mn]}$: $${v[mx]} - ${v[mn]} = ${v[mx] - v[mn]}$.`), T(`The last value is $${last}$, so a cautious prediction stays near it.`, `Nilai terakhir ialah $${last}$, jadi ramalan yang berhati-hati kekal berhampirannya.`)), sp: 'l' };
    },
  ];
  SPM.extend('F1-12.4', { e: g124e, m: g124m, a: g124a });


  /* ================================================================ 12.5 */
  const SB = [
    ['the favourite sport of all students in the school || sukan kegemaran semua murid di sekolah', 'students chosen at random from the school register || murid yang dipilih secara rawak daripada daftar sekolah', 'the members of the football team || ahli pasukan bola sepak', 'the students who are in the sports hall at recess || murid yang berada di dewan sukan semasa rehat', 'Form 1 students only || murid Tingkatan 1 sahaja'],
    ['how many hours Form 4 students spend on homework || bilangan jam murid Tingkatan 4 membuat kerja rumah', 'a random sample from every Form 4 class || sampel rawak daripada setiap kelas Tingkatan 4', 'the ten students with the highest marks || sepuluh orang murid yang mendapat markah tertinggi', 'the students who stay for extra classes || murid yang tinggal untuk kelas tambahan', 'one class only || satu kelas sahaja'],
    ['whether students like the canteen food || sama ada murid suka makanan kantin', 'students chosen at random from all forms || murid yang dipilih secara rawak daripada semua tingkatan', 'the students in the queue at the canteen counter || murid dalam barisan di kaunter kantin', 'the students of one class only || murid satu kelas sahaja'],
    ['how students travel to school || cara murid ke sekolah', 'a random sample from all forms and classes || sampel rawak daripada semua tingkatan dan kelas', 'the students waiting at the bus stop || murid yang menunggu di perhentian bas', 'the students who arrive late || murid yang lewat tiba'],
    ['the reading habits of students || tabiat membaca murid', 'students chosen at random from the register || murid yang dipilih secara rawak daripada daftar', 'the students found in the library || murid yang berada di perpustakaan', 'the members of the reading club || ahli kelab membaca'],
    ['the opinion of townspeople on a new playground || pendapat penduduk pekan tentang taman permainan baharu', 'households chosen at random from all parts of the town || isi rumah yang dipilih secara rawak daripada semua bahagian pekan', 'only the people living next to the site || hanya penduduk yang tinggal bersebelahan tapak itu', 'only people met at the town park || hanya orang yang ditemui di taman pekan'],
    ['how satisfied customers are with a food stall || sejauh mana pelanggan berpuas hati dengan sebuah gerai makanan', 'customers chosen at random at different times of the day || pelanggan yang dipilih secara rawak pada waktu yang berbeza dalam sehari', 'only the owner\'s friends || hanya kawan-kawan pemilik', 'only customers who write a review online || hanya pelanggan yang menulis ulasan dalam talian'],
  ].map((x) => ({ a: B(x[0]), g: B(x[1]), b: x.slice(2).map(B).map((l) => T(l.en.replace(/^only /, ''), l.ms.replace(/^hanya /, ''))) }));
  const LQ = [
    ['Don\'t you agree that homework should be banned? || Tidakkah anda bersetuju bahawa kerja rumah patut diharamkan?', 'Should homework be kept, reduced or removed? || Adakah kerja rumah patut dikekalkan, dikurangkan atau dihapuskan?'],
    ['Isn\'t our excellent school library the best in the district? || Bukankah perpustakaan sekolah kita yang cemerlang itu yang terbaik di daerah ini?', 'How does our library compare with others you have used? (Better / The same / Worse) || Bagaimanakah perpustakaan kita berbanding yang lain yang pernah anda gunakan? (Lebih baik / Sama / Lebih teruk)'],
    ['Healthy food is important, so you never buy junk food, do you? || Makanan sihat penting, jadi anda tidak pernah membeli makanan ringan yang tidak berkhasiat, bukan?', 'How often do you buy fast food? (Never / Sometimes / Often) || Berapa kerapkah anda membeli makanan segera? (Tidak pernah / Kadang-kadang / Kerap)'],
    ['Do you agree that the boring assembly should be shorter? || Adakah anda bersetuju bahawa perhimpunan yang membosankan itu patut dipendekkan?', 'How long should the assembly be? (15 min / 30 min / 45 min) || Berapa lamakah perhimpunan patut diadakan? (15 min / 30 min / 45 min)'],
    ['Wouldn\'t you say the new uniform looks terrible? || Bukankah anda bersetuju bahawa pakaian seragam baharu itu kelihatan teruk?', 'How would you describe the new uniform? (Very good / Good / Poor / Very poor) || Bagaimanakah anda menerangkan pakaian seragam baharu itu? (Sangat baik / Baik / Lemah / Sangat lemah)'],
    ['Most students love football. Do you love it too? || Kebanyakan murid suka bola sepak. Adakah anda juga suka?', 'Which sport do you like most? (Football / Badminton / Netball / Other) || Sukan manakah yang paling anda suka? (Bola sepak / Badminton / Bola jaring / Lain-lain)'],
  ].map((x) => ({ l: B(x[0]), f: B(x[1]) }));
  const GB = ['his or her own friends || kawan-kawannya sendiri', 'the members of one class || ahli satu kelas', 'the students in the canteen queue || murid dalam barisan kantin', 'the ten students with the highest marks || sepuluh orang murid yang mendapat markah tertinggi', 'Form 1 students only || murid Tingkatan 1 sahaja'].map(B);
  const ET = [
    ['It is acceptable to leave out data that do not agree with your conclusion. || Boleh mengetepikan data yang tidak sepadan dengan kesimpulan anda.', 0, 'All the data must be reported; leaving some out misleads the reader. || Semua data mesti dilaporkan; mengetepikan sebahagian mengelirukan pembaca.'],
    ['A graph should have a title and labelled axes with units. || Sesebuah graf patut mempunyai tajuk dan paksi berlabel dengan unit.', 1, 'Without them the reader cannot tell what the numbers mean. || Tanpanya pembaca tidak tahu maksud nombor itu.'],
    ['A bigger picture may be used for a bigger value even if its area grows much faster than the value. || Gambar yang lebih besar boleh digunakan bagi nilai yang lebih besar walaupun luasnya bertambah jauh lebih cepat daripada nilai.', 0, 'The area then exaggerates the difference; use bars of equal width with heights proportional to the values. || Luas itu membesar-besarkan perbezaan; gunakan palang berlebar sama dengan tinggi berkadaran dengan nilai.'],
    ['A vertical axis that does not start at zero can make a small difference look big. || Paksi mencancang yang tidak bermula pada sifar boleh menjadikan perbezaan kecil kelihatan besar.', 1, 'The bars are cut, so their heights no longer match the values. || Palang dipotong, jadi tinggi tidak lagi sepadan dengan nilai.'],
    ['Asking only your friends is a good way to find the opinion of the whole school. || Bertanya kepada kawan-kawan sahaja ialah cara yang baik untuk mengetahui pendapat seluruh sekolah.', 0, 'Friends are not a representative sample. || Kawan-kawan bukan sampel yang mewakili.'],
    ['It is acceptable to change the scale so that two very different sets of data look the same. || Boleh mengubah skala supaya dua set data yang sangat berbeza kelihatan sama.', 0, 'The reader compares the heights, so the scales must be the same or clearly stated. || Pembaca membandingkan tinggi, jadi skala mesti sama atau dinyatakan dengan jelas.'],
    ['If two things increase together, one must be causing the other. || Jika dua perkara meningkat bersama, salah satunya mesti menyebabkan yang lain.', 0, 'They may both depend on a third factor, or it may be a coincidence. || Kedua-duanya mungkin bergantung pada faktor ketiga, atau ia kebetulan.'],
    ['The sectors of a pie chart should add up to the whole. || Sektor carta pai patut berjumlah keseluruhan.', 1, 'Missing categories would hide part of the data. || Kategori yang tertinggal akan menyembunyikan sebahagian data.'],
    ['Choosing only the months that show a rise, and ignoring the rest, is honest reporting. || Memilih hanya bulan yang menunjukkan kenaikan, dan mengabaikan yang lain, ialah pelaporan yang jujur.', 0, 'This is selective and hides the full picture. || Ini memilih secara berat sebelah dan menyembunyikan gambaran penuh.'],
  ].map((x) => ({ s: B(x[0]), t: !!x[1], x: B(x[2]) }));
  const EM = [
    ['"Sales increased by 20%." || "Jualan meningkat sebanyak 20%."', 'compared with which period, and the sales of what and where || berbanding tempoh yang mana, dan jualan apa serta di mana'],
    ['"9 out of 10 students prefer our canteen." || "9 daripada 10 murid lebih suka kantin kami."', 'how many were asked, who they were and how they were chosen || berapa ramai yang ditanya, siapa mereka dan bagaimana mereka dipilih'],
    ['"The rainfall this month was 300." || "Hujan bulan ini ialah 300."', 'the unit (for example mm), the place and the month || unit (contohnya mm), tempat dan bulan'],
    ['"Our team has the best record." || "Pasukan kami mempunyai rekod terbaik."', 'the best out of which teams and in which period, and the numbers || terbaik daripada pasukan mana dan dalam tempoh mana, serta angkanya'],
    ['"The number of visitors rose sharply." || "Bilangan pengunjung meningkat dengan mendadak."', 'the actual numbers, the period and the source of the data || angka sebenar, tempoh dan sumber data'],
    ['"85% of the students passed." || "85% murid lulus."', 'how many students, which test and which class or school || berapa ramai murid, ujian yang mana dan kelas atau sekolah yang mana'],
  ].map((x) => ({ s: B(x[0]), m: B(x[1]) }));
  const OMIT = {
    title: [B('a title || tajuk'), B('Without a title the reader does not know what the data are about. || Tanpa tajuk pembaca tidak tahu tentang apa data itu.')],
    vl: [B('a label (with unit) on the vertical axis || label (dengan unit) pada paksi mencancang'), B('The reader cannot tell what the bar heights measure. || Pembaca tidak dapat mengetahui apa yang diukur oleh tinggi palang.')],
    cl: [B('a label on the horizontal axis || label pada paksi mengufuk'), B('The reader cannot tell what the categories are. || Pembaca tidak dapat mengetahui apakah kategori itu.')],
    nonum: [B('numbers on the vertical scale || nombor pada skala mencancang'), B('The values of the bars cannot be read. || Nilai palang tidak dapat dibaca.')],
    legend: [B('a key (legend) || kunci (legenda)'), B('The reader cannot tell which bar belongs to which group. || Pembaca tidak dapat mengetahui palang yang mana milik kumpulan yang mana.')],
  };
  const OK = Object.keys(OMIT);
  const trunc = (o) => o;
  const ecat = (d, l) => d.cats.map((c) => c[l]);
  const CHARTW = B('A complete chart needs four things: a title, a label with its unit on each axis, numbers on the scale, and a key whenever more than one group is drawn. || Carta yang lengkap memerlukan empat perkara: tajuk, label dengan unitnya pada setiap paksi, nombor pada skala, dan kunci apabila lebih daripada satu kumpulan dilukis.');
  const SAMPW = B('A sample is fair only if every member of the group being studied has an equal chance of being chosen. || Sampel adil hanya jika setiap ahli kumpulan yang dikaji mempunyai peluang yang sama untuk dipilih.');
  const TRUNCW = B('When the vertical axis does not start at $0$, the part of a bar you can see is (value $-$ start of the axis), not the value itself. || Apabila paksi mencancang tidak bermula pada $0$, bahagian palang yang kelihatan ialah (nilai $-$ permulaan paksi), bukan nilai itu sendiri.');
  const g125e = [
    (r) => {
      const om = r.pick(OK), d = catData(r, 4, r.pick([30, 40, 60]), 3), f2 = d.cats.map(() => r.int(3, 20)), two = om === 'legend', ax = yAx(Math.max(...d.f, ...(two ? f2 : []))), rowsH = r.chance(0.3) && !two;
      need(!two || new Set(f2).size > 2);
      const fig = dual((l) => bars({ cats: ecat(d, l), series: two ? [d.f, f2] : [d.f], horiz: rowsH, ymax: ax.ymax, ystep: ax.ystep, title: om === 'title' ? '' : d.name[l], vl: om === 'vl' ? '' : Ln(l, 'Number of students', 'Bilangan murid'), cl: om === 'cl' ? '' : d.name[l], nonum: om === 'nonum' }));
      const form = r.int(0, 2), o = mc(r, OMIT[om][0], r.sample(OK.filter((k) => k !== om), 3).map((k) => OMIT[k][0]));
      if (form === 0) return { q: T(`The chart shows the results of a survey on "${d.name.en}". Something important is missing from it. State what is missing and explain why it matters.`, `Carta menunjukkan keputusan tinjauan tentang "${d.name.ms}". Sesuatu yang penting tidak ada padanya. Nyatakan apa yang tiada dan terangkan mengapa ia penting.`), fig, a: cat(B('Missing: || Tiada: '), OMIT[om][0], '. ', OMIT[om][1]), w: W(CHARTW, cat(B('Missing here: || Yang tiada di sini: '), OMIT[om][0], '. ', OMIT[om][1])), sp: 's' };
      if (form === 1) return { q: T(`The chart shows a survey on "${d.name.en}". What is missing from the chart?<br>${o.en}`, `Carta menunjukkan tinjauan tentang "${d.name.ms}". Apakah yang tiada pada carta itu?<br>${o.ms}`), fig, a: cat(o.ans, '. ', OMIT[om][1]), w: W(CHARTW, cat(o.ans, T(': ', ': '), OMIT[om][1])), sp: 's' };
      const sug = { title: T(`"${d.name.en}: results of a survey of ${d.total} students"`, `"${d.name.ms}: keputusan tinjauan terhadap ${d.total} orang murid"`), vl: B('"Number of students" || "Bilangan murid"'), cl: T(`"${d.name.en}"`, `"${d.name.ms}"`), nonum: T(rg(0, ax.ymax / ax.ystep).map((i) => i * ax.ystep).join(', ')), legend: T(`A key such as "Group A" and "Group B", each matched to a shading.`, `Kunci seperti "Kumpulan A" dan "Kumpulan B", setiap satu dipadankan dengan satu lorekan.`) }[om];
      return { q: T(`The chart shows the results of a survey on "${d.name.en}" of ${d.total} students, but ${OMIT[om][0].en} ${om === 'nonum' ? 'are' : 'is'} missing. Write down what you would add so that the chart is complete.`, `Carta menunjukkan keputusan tinjauan tentang "${d.name.ms}" bagi ${d.total} orang murid, tetapi ${OMIT[om][0].ms} tiada. Tuliskan apa yang anda tambah supaya carta itu lengkap.`), fig, a: cat(B('For example: || Contohnya: '), sug), w: W(CHARTW, OMIT[om][1], cat(B('So add, for example: || Jadi tambah, contohnya: '), sug)), sp: 's' };
    },
    (r) => { const s = r.pick(SB), o = mc(r, s.g, r.sample(s.b, 3).slice(0, Math.min(3, s.b.length))); return { q: T(`A student wants to find out ${s.a.en}. Which group should be asked?<br>${o.en}`, `Seorang murid ingin mengetahui ${s.a.ms}. Kumpulan manakah yang patut ditanya?<br>${o.ms}`), a: cat(o.ans, B('. It is representative: everyone has a fair chance of being chosen. || . Ia mewakili: setiap orang mempunyai peluang yang adil untuk dipilih.')), w: W(SAMPW, cat(o.ans, T(': ', ': '), B('everyone in the group can be chosen. || setiap orang dalam kumpulan itu boleh dipilih.')), B('Each of the other groups leaves part of the population out, so it is biased. || Setiap kumpulan yang lain meninggalkan sebahagian populasi, jadi ia berat sebelah.')), sp: 's' }; },
    (r) => { const s = r.pick(SB), b = r.pick(s.b), nm = r.name(); return { q: T(`${nm} wants to find out ${s.a.en}, but asks only ${b.en}. Is this a good way to collect the data? Explain and suggest a better way.`, `${nm} ingin mengetahui ${s.a.ms}, tetapi hanya bertanya kepada ${b.ms}. Adakah ini cara yang baik untuk mengumpul data? Terangkan dan cadangkan cara yang lebih baik.`), a: T(`No: the sample is biased and does not represent everyone. Better: use ${s.g.en}.`, `Tidak: sampel berat sebelah dan tidak mewakili semua orang. Lebih baik: gunakan ${s.g.ms}.`), w: W(SAMPW, T(`Asking only ${b.en} leaves out everyone else, so the answers lean one way.`, `Bertanya hanya kepada ${b.ms} meninggalkan orang lain, jadi jawapannya condong ke satu arah.`), T(`Better: ${s.g.en}.`, `Lebih baik: ${s.g.ms}.`)), sp: 's' }; },
    (r) => {
      const it = r.pick(LQ), o = mc(r, it.f, [it.l]);
      return { q: T(`Which of these survey questions is neutral and fair?<br>${o.en}`, `Soalan tinjauan manakah yang neutral dan adil?<br>${o.ms}`), a: cat(o.ans, B('. The other one is a leading question that pushes people towards one answer. || . Yang satu lagi ialah soalan mengarahkan yang mendorong orang kepada satu jawapan.')), w: W(B('A fair question suggests no answer and offers balanced choices. || Soalan yang adil tidak mencadangkan sebarang jawapan dan menawarkan pilihan yang seimbang.'), T(`(${o.letter}) is worded neutrally; the other question tells the respondent what to think before answering.`, `(${o.letter}) ditulis secara neutral; soalan yang satu lagi memberitahu responden apa yang patut difikirkan sebelum menjawab.`)), sp: 's' };
    },
    (r) => { const h = r.pick(ET); return { q: T(`True or false? "${h.s.en}"`, `Betul atau salah? "${h.s.ms}"`), a: cat(h.t ? T('True. ', 'Betul. ') : T('False. ', 'Salah. '), h.x), w: W(B('Ask whether the practice leaves the reader correctly informed about all the data. || Tanya sama ada amalan itu memberikan pembaca maklumat yang betul tentang keseluruhan data.'), cat(h.t ? T('True: ', 'Betul: ') : T('False: ', 'Salah: '), h.x)), sp: 's' }; },
    (r) => { const e = r.pick(EM); return { q: T(`A poster states ${e.s.en} What information should be added so that the statement can be interpreted properly?`, `Sebuah poster menyatakan ${e.s.ms} Maklumat apakah yang patut ditambah supaya pernyataan itu dapat ditafsirkan dengan betul?`), a: cat(B('For example: || Contohnya: '), e.m), w: W(B('A figure means nothing until the reader knows who was measured, what was measured, when, and how many. || Sesuatu angka tidak bermakna sehingga pembaca tahu siapa yang diukur, apa yang diukur, bila, dan berapa ramai.'), cat(B('Missing here: || Yang tiada di sini: '), e.m)), sp: 's' }; },
  ];
  const sqFig = (a, k, shape, l) => {
    const s1 = 30, s2 = 30 * k, W = 90 + s1 + s2, H = s2 + 40;
    const sh = (x, s) => (shape === 'sq' ? S.rect(x, H - 20 - s, s, s, { fill: 'currentColor', op: 0.25 }) : S.circle(x + s / 2, H - 20 - s / 2, s / 2, { fill: 'currentColor', op: 0.25 }));
    return S.wrap(W, H, sh(20, s1) + sh(60 + s1, s2) + S.text(20 + s1 / 2, H - 8, String(a), { s: 11 }) + S.text(60 + s1 + s2 / 2, H - 8, String(a * k), { s: 11 }), 'symbols');
  };
  const g125m = [
    (r) => {
      const ymin = r.pick([50, 60, 70, 80]), k = r.pick([2, 3, 4]), b = ymin + 10, a = ymin + 10 * k, mid = ymin + 10 * r.int(1, k - 1) + 5, c = r.pick(CTXS), cats = r.sample(c.cats, 3), vals = [b, mid, a], ymax = ceilTo(a + 1, 10);
      const fig = dual((l) => bars({ cats: ecat({ cats }, l), series: [vals], ymin, ymax, ystep: 10, cl: c.name[l], vl: Ln(l, 'Number of votes', 'Bilangan undi'), title: c.name[l], horiz: r.chance(0.3) }));
      return { q: T(`The bar chart compares three groups. Its vertical axis starts at ${ymin}. (a) By reading the bar heights from the baseline, how many times as tall does the tallest bar seem to be compared with the shortest? (b) Find the true ratio of the two values (to 1 decimal place). (c) How can the chart be corrected?`, `Carta palang membandingkan tiga kumpulan. Paksi mencancangnya bermula pada ${ymin}. (a) Dengan membaca tinggi palang dari garis dasar, berapa kalikah palang tertinggi kelihatan berbanding palang terendah? (b) Cari nisbah sebenar kedua-dua nilai itu (betul kepada 1 tempat perpuluhan). (c) Bagaimanakah carta itu boleh dibetulkan?`), fig, a: SPM.parts([T(`$\\dfrac{${a} - ${ymin}}{${b} - ${ymin}} = ${k}$`), T(`$${a} \\div ${b} = ${n(round(a / b, 1))}$`), B('Start the vertical axis at 0 (or show a clearly marked axis break). || Mulakan paksi mencancang pada 0 (atau tunjukkan pemutusan paksi yang ditanda dengan jelas).')]), w: W(TRUNCW, T(`Apparent ratio: $\\dfrac{${a} - ${ymin}}{${b} - ${ymin}} = ${k}$`, `Nisbah yang kelihatan: $\\dfrac{${a} - ${ymin}}{${b} - ${ymin}} = ${k}$`), T(`True ratio: $${a} \\div ${b} = ${n(round(a / b, 1))}$`, `Nisbah sebenar: $${a} \\div ${b} = ${n(round(a / b, 1))}$`), B('With the axis starting at 0 the heights would be proportional to the values. || Dengan paksi bermula pada 0, tinggi palang akan berkadaran dengan nilai.')), sp: 'm' };
    },
    (r) => {
      const v0 = r.pick([60, 80, 100]), s = r.pick([2, 3, 4]), len = 6, ts = r.pick(CHG), xa = xaxis(r, len), v = rg(0, len - 1).map((i) => v0 + s * i), ymin = v0 - s;
      const fig = dual((l) => lineSvg({ xs: xa.s(l), series: [{ ys: v }], ymin, ymax: v[len - 1] + s, ystep: s * 2, yl: ts.y[l], xl: xa.w[l], title: ts.y[l] }));
      const pc = round((v[len - 1] - v0) * 100 / v0, 1);
      return { q: T(`The line graph shows the ${ts.w.en}. Its vertical axis starts at ${ymin}. (a) Find the percentage increase from the first to the last value (to 1 decimal place). (b) Why does the graph make the increase look large? (c) Describe how to draw a fairer graph.`, `Graf garis menunjukkan ${ts.w.ms}. Paksi mencancangnya bermula pada ${ymin}. (a) Cari peratusan pertambahan dari nilai pertama ke nilai terakhir (betul kepada 1 tempat perpuluhan). (b) Mengapakah graf itu menjadikan pertambahan kelihatan besar? (c) Terangkan cara melukis graf yang lebih adil.`), fig, a: SPM.parts([T(`$\\dfrac{${v[len - 1]} - ${v0}}{${v0}} \\times 100 = ${n(pc)}\\%$`), B('The axis starts far above 0, so the small change fills most of the height of the graph. || Paksi bermula jauh di atas 0, jadi perubahan kecil memenuhi kebanyakan tinggi graf.'), T(`Start the axis at 0 (scale 0 to ${ceilTo(v[len - 1] + 1, 20)}), or mark the axis break clearly.`, `Mulakan paksi pada 0 (skala 0 hingga ${ceilTo(v[len - 1] + 1, 20)}), atau tandakan pemutusan paksi dengan jelas.`)]), w: W(T(`$${v[len - 1]} - ${v0} = ${v[len - 1] - v0}$`), T(`$\\dfrac{${v[len - 1] - v0}}{${v0}} \\times 100 = ${n(pc)}\\%$`), TRUNCW, B('The line climbs from the bottom to the top of the grid, although the values change by only a few per cent. || Garis itu naik dari bawah ke atas grid, walaupun nilainya berubah hanya beberapa peratus.')), sp: 'm' };
    },
    (r) => {
      const y0 = r.int(2010, 2016), yrs = [y0, y0 + 1, y0 + 2, y0 + 5, y0 + 6], k = r.pick([2, 3, 4, 5]), b0 = r.step(20, 50, 2), v = yrs.map((y) => b0 + k * (y - y0)), ts = r.pick(CHG);
      const fig = dual((l) => lineSvg({ xs: yrs.map(String), series: [{ ys: v }], ymax: ceilTo(v[4] + 1, 10), ystep: 10, yl: ts.y[l], xl: Ln(l, 'Year', 'Tahun') }));
      return { q: T(`The graph shows the ${ts.w.en} in five years, with equal spaces between the plotted points. (a) By how much did the value change per year from ${yrs[0]} to ${yrs[1]}? (b) By how much did it change per year from ${yrs[2]} to ${yrs[3]}? (c) Why is the graph misleading, and how should the horizontal axis be drawn?`, `Graf menunjukkan ${ts.w.ms} dalam lima tahun, dengan jarak yang sama antara titik yang diplot. (a) Berapakah perubahan nilai setahun dari ${yrs[0]} hingga ${yrs[1]}? (b) Berapakah perubahan nilai setahun dari ${yrs[2]} hingga ${yrs[3]}? (c) Mengapakah graf itu mengelirukan, dan bagaimanakah paksi mengufuk patut dilukis?`), fig, a: SPM.parts([T(`${v[1] - v[0]}`), T(`$(${v[3]} - ${v[2]}) \\div 3 = ${(v[3] - v[2]) / 3}$`), B('Years 3 apart are drawn as far apart as years 1 apart, so the change seems suddenly steeper although the yearly change is constant. The years should be plotted at equal distances for equal time intervals. || Tahun yang berjarak 3 dilukis sama jauh dengan tahun yang berjarak 1, jadi perubahan kelihatan tiba-tiba lebih curam walaupun perubahan tahunan tetap. Tahun patut diplot pada jarak yang sama bagi sela masa yang sama.')]), w: W(T(`(a) $${v[1]} - ${v[0]} = ${v[1] - v[0]}$ in $1$ year.`, `(a) $${v[1]} - ${v[0]} = ${v[1] - v[0]}$ dalam $1$ tahun.`), T(`(b) $(${v[3]} - ${v[2]}) \\div 3 = ${(v[3] - v[2]) / 3}$ per year.`, `(b) $(${v[3]} - ${v[2]}) \\div 3 = ${(v[3] - v[2]) / 3}$ setahun.`), B('The yearly change is the same, but three years are drawn in one step, so that part of the line looks much steeper. Equal distances must stand for equal intervals of time. || Perubahan tahunan adalah sama, tetapi tiga tahun dilukis dalam satu langkah, jadi bahagian garis itu kelihatan jauh lebih curam. Jarak yang sama mesti mewakili sela masa yang sama.')), sp: 'm' };
    },
    (r) => {
      const b = r.pick([5, 10, 20]), ticks = [0, b, 2 * b, 4 * b, 8 * b], c = r.pick(CTXS), cats = r.sample(c.cats, 4), vals = ticks.slice(1);
      const fig = dual((l) => bars({ cats: ecat({ cats }, l), series: [vals], ticks, cl: c.name[l], vl: Ln(l, 'Number of students', 'Bilangan murid'), title: c.name[l] }));
      return { q: T(`The bar chart has a vertical scale marked ${ticks.join(', ')} with equal spaces between the marks. (a) Read the value of each bar. (b) Each bar looks one space taller than the one before it. How many times as large is each value as the previous one? (c) Redraw the scale so that it is not misleading.`, `Carta palang mempunyai skala mencancang bertanda ${ticks.join(', ')} dengan jarak yang sama antara tanda. (a) Baca nilai setiap palang. (b) Setiap palang kelihatan satu jarak lebih tinggi daripada palang sebelumnya. Berapa kalikah nilai setiap palang berbanding yang sebelumnya? (c) Lukis semula skala supaya tidak mengelirukan.`), fig, a: SPM.parts([T(vals.join(', ')), T('2'), T(`Use equal steps for equal amounts, for example 0, ${2 * b}, ${4 * b}, ${6 * b}, ${8 * b}.`, `Gunakan langkah yang sama bagi kuantiti yang sama, contohnya 0, ${2 * b}, ${4 * b}, ${6 * b}, ${8 * b}.`)]), w: W(T(`Read each bar at its own mark: $${vals.join(',\\ ')}$.`, `Baca setiap palang pada tandanya sendiri: $${vals.join(',\\ ')}$.`), T(`$${2 * b} \\div ${b} = 2$, $${4 * b} \\div ${2 * b} = 2$, $${8 * b} \\div ${4 * b} = 2$`), B('One step up the scale doubles the value, so bars that look evenly spaced hide values that grow much faster. || Satu langkah pada skala menggandakan nilai, jadi palang yang kelihatan berjarak sama menyembunyikan nilai yang bertambah jauh lebih cepat.')), sp: 'm' };
    },
    (r) => {
      const d = catData(r, 5, r.pick([30, 40, 60, 50]), 3), gone = r.int(0, 4), shown = d.f.filter((_, i) => i !== gone), ax = yAx(Math.max(...d.f));
      const fig = dual((l) => bars({ cats: d.cats.filter((_, i) => i !== gone).map((c) => c[l]), series: [shown], ymax: ax.ymax, ystep: ax.ystep, cl: d.name[l], vl: Ln(l, 'Number of students', 'Bilangan murid'), title: d.name[l] }));
      return { q: T(`${d.total} students were surveyed on "${d.name.en}", but the bar chart shows only ${shown.length} categories. (a) Find the total shown on the chart. (b) How many students belong to the category that was left out? (c) Explain how leaving it out could mislead a reader.`, `${d.total} orang murid ditinjau tentang "${d.name.ms}", tetapi carta palang hanya menunjukkan ${shown.length} kategori. (a) Cari jumlah yang ditunjukkan pada carta. (b) Berapakah murid dalam kategori yang ditinggalkan? (c) Terangkan bagaimana meninggalkannya boleh mengelirukan pembaca.`), fig, a: SPM.parts([T(`${sum(shown)}`), T(`$${d.total} - ${sum(shown)} = ${d.f[gone]}$`), T(`The missing category (${d.f[gone]} students) is ${d.f[gone] > Math.min(...shown) ? 'larger than some of the bars shown' : 'small'}, so the reader would think the totals and the ranking are complete when they are not.`, `Kategori yang tertinggal (${d.f[gone]} murid) ${d.f[gone] > Math.min(...shown) ? 'lebih besar daripada sesetengah palang yang ditunjukkan' : 'kecil'}, jadi pembaca akan menyangka jumlah dan kedudukan lengkap sedangkan tidak.`)]), w: W(T(`(a) $${shown.join(' + ')} = ${sum(shown)}$`), T(`(b) $${d.total} - ${sum(shown)} = ${d.f[gone]}$`), B('Every category must be shown, otherwise the reader cannot see the true total or the true order. || Setiap kategori mesti ditunjukkan, jika tidak pembaca tidak dapat melihat jumlah sebenar atau susunan sebenar.')), sp: 'm' };
    },
    (r) => {
      const q = r.pick(LQ), n0 = r.pick([50, 100, 40, 200]), p1 = r.pick([80, 85, 90]), p2 = r.pick([40, 45, 50, 55, 60]), y1 = n0 * p1 / 100, y2 = n0 * p2 / 100;
      need(Number.isInteger(y1) && Number.isInteger(y2));
      return { q: T(`Two groups of ${n0} students are asked about the same topic. Group 1 is asked "${q.l.en}" and ${y1} agree. Group 2 is asked "${q.f.en}" and ${y2} choose the first option. (a) Find the percentage in each group. (b) Find the difference in percentage points. (c) Which result is more trustworthy? Why?`, `Dua kumpulan yang setiap satunya ${n0} orang murid ditanya tentang topik yang sama. Kumpulan 1 ditanya "${q.l.ms}" dan ${y1} orang bersetuju. Kumpulan 2 ditanya "${q.f.ms}" dan ${y2} orang memilih pilihan pertama. (a) Cari peratusan dalam setiap kumpulan. (b) Cari beza dalam mata peratusan. (c) Keputusan yang manakah lebih boleh dipercayai? Mengapa?`), a: SPM.parts([T(`${p1}% and ${p2}%`), T(`${p1 - p2}`), B('Group 2: its question is neutral, while Group 1\'s question is leading and pushes people towards one answer. || Kumpulan 2: soalannya neutral, manakala soalan Kumpulan 1 mengarahkan dan mendorong orang kepada satu jawapan.')]), w: W(T(`$\\dfrac{${y1}}{${n0}} \\times 100 = ${p1}\\%$`), T(`$\\dfrac{${y2}}{${n0}} \\times 100 = ${p2}\\%$`), T(`$${p1}\\% - ${p2}\\% = ${p1 - p2}$ percentage points.`, `$${p1}\\% - ${p2}\\% = ${p1 - p2}$ mata peratusan.`), B('The two groups are the same size, so only the wording differs: a leading question changes the answers. || Kedua-dua kumpulan sama besar, jadi hanya perkataannya berbeza: soalan yang mengarahkan mengubah jawapan.')), sp: 'm' };
    },
    (r) => {
      const a = r.pick([20, 30, 40, 50]), k = r.pick([2, 3]), shape = r.pick(['sq', 'ci']), nm = shape === 'sq' ? T('squares', 'segi empat sama') : T('circles', 'bulatan'), side = shape === 'sq' ? T('sides', 'sisi') : T('diameters', 'diameter');
      return { q: T(`Sales of RM${a} thousand and RM${a * k} thousand are shown by two ${nm.en} whose ${side.en} are in the ratio 1 : ${k}. (a) Find the ratio of their areas. (b) By how many times does the display exaggerate the second value? (c) Suggest a fairer display.`, `Jualan RM${a} ribu dan RM${a * k} ribu ditunjukkan oleh dua ${nm.ms} yang ${side.ms}nya dalam nisbah 1 : ${k}. (a) Cari nisbah luas kedua-duanya. (b) Berapa kalikah paparan itu membesar-besarkan nilai kedua? (c) Cadangkan paparan yang lebih adil.`), fig: T(sqFig(a, k, shape, 'en'), sqFig(a, k, shape, 'ms')), a: SPM.parts([T(`$1 : ${k * k}$`), T(`It looks ${k * k} times as large, but the value is only ${k} times as large, so the display exaggerates it ${k} times.`, `Ia kelihatan ${k * k} kali ganda, tetapi nilainya hanya ${k} kali ganda, jadi paparan itu membesar-besarkannya ${k} kali ganda.`), B('Use bars of equal width whose heights are proportional to the values. || Gunakan palang berlebar sama dengan tinggi berkadaran dengan nilai.')]), w: W(T(`The ${side.en} are $1 : ${k}$, so the areas are $1^2 : ${k}^2 = 1 : ${k * k}$.`, `${SPM.cap(side.ms)} ialah $1 : ${k}$, jadi luasnya $1^2 : ${k}^2 = 1 : ${k * k}$.`), T(`$${k * k} \\div ${k} = ${k}$`), B('The eye compares areas, so growing both the width and the height exaggerates the difference. || Mata membandingkan luas, jadi membesarkan lebar dan tinggi sekali gus membesar-besarkan perbezaan.')), sp: 'm' };
    },
    (r) => {
      const ts = r.pick(TS), base = ts.lo + ts.st * 9, v = rg(0, 11).map((i) => base - ts.st * Math.min(i, 8) + (i > 8 ? ts.st * (i - 8) * 2 : 0));
      need(Math.max(...v) <= ts.hi && Math.min(...v) >= ts.lo && new Set(v).size > 8);
      const f2 = (vs, xs, l) => lineSvg({ xs, series: [{ ys: vs }], ymax: ceilTo(Math.max(...v) + 1, ts.ys), ystep: ts.ys, yl: ts.y[l], xl: Ln(l, 'Month', 'Bulan'), w: vs.length > 6 ? 340 : 200 });
      const fig = both(dual((l) => f2(v.slice(8), MON[l].slice(8), l)), dual((l) => f2(v, MON[l], l)));
      return { q: T(`Graph 1 shows the ${ts.w.en} for the last four months of a year only. Graph 2 shows all twelve months. A student uses Graph 1 to claim "The value has been rising strongly." (a) State the value in September and in December. (b) State the highest value in the year and when it occurred. (c) Is the claim fair? Explain.`, `Graf 1 menunjukkan ${ts.w.ms} bagi empat bulan terakhir setahun sahaja. Graf 2 menunjukkan kesemua dua belas bulan. Seorang murid menggunakan Graf 1 untuk menuntut "Nilai telah meningkat dengan kukuh." (a) Nyatakan nilai pada bulan September dan pada bulan Disember. (b) Nyatakan nilai tertinggi dalam tahun itu dan bila ia berlaku. (c) Adakah tuntutan itu adil? Terangkan.`), fig, a: SPM.parts([T(`${v[8]} and ${v[11]}`), T(`${Math.max(...v)} in ${MONF.en[imax(v)]}`, `${Math.max(...v)} pada bulan ${MONF.ms[imax(v)]}`), T(`No: the value fell from ${v[0]} in January, and the December value (${v[11]}) is still ${v[11] < v[0] ? 'below' : 'not far above'} the January value. Choosing only the last four months hides this.`, `Tidak: nilai menurun daripada ${v[0]} pada bulan Januari, dan nilai bulan Disember (${v[11]}) masih ${v[11] < v[0] ? 'di bawah' : 'tidak jauh di atas'} nilai bulan Januari. Memilih empat bulan terakhir sahaja menyembunyikan hal ini.`)]), w: W(T(`(a) September $${v[8]}$, December $${v[11]}$.`, `(a) September $${v[8]}$, Disember $${v[11]}$.`), T(`(b) The highest value of the year is $${Math.max(...v)}$, in ${MONF.en[v.indexOf(Math.max(...v))]}.`, `(b) Nilai tertinggi dalam tahun itu ialah $${Math.max(...v)}$, pada bulan ${MONF.ms[v.indexOf(Math.max(...v))]}.`), T(`(c) Over the whole year the value fell from $${v[0]}$ to $${v[11]}$, so the four-month graph tells only part of the story.`, `(c) Sepanjang tahun nilai menurun daripada $${v[0]}$ kepada $${v[11]}$, jadi graf empat bulan itu hanya menceritakan sebahagian kisah.`)), sp: 'm' };
    },
    (r) => {
      const a = r.pick([10, 20, 25]), k = r.pick([2, 3, 4]), c = r.pick(CTXS), cats = r.sample(c.cats, 2), b = a * k, h1 = 20, ymA = 20, ymB = b * ymA / a;
      const one = (val, ym, l, ttl) => bars({ cats: [ttl], series: [[val]], ymax: ym, ystep: ym / 2, w: 150, h: 170, vl: Ln(l, 'Number', 'Bilangan') });
      const fig = both(dual((l) => one(a, ymA, l, Ln(l, 'Class A', 'Kelas A'))), dual((l) => one(b, ymB, l, Ln(l, 'Class B', 'Kelas B'))));
      return { q: T(`Two bar charts show the number of students who chose ${cats[0].en} in Class A and in Class B. The bars are the same height. A student says "The numbers are about the same." (a) Read the value of each bar from its scale. (b) How many times as many students are there in Class B as in Class A? (c) Explain why the charts are misleading.`, `Dua carta palang menunjukkan bilangan murid yang memilih ${cats[0].ms} dalam Kelas A dan dalam Kelas B. Palang-palang itu sama tinggi. Seorang murid berkata "Bilangannya hampir sama." (a) Baca nilai setiap palang daripada skalanya. (b) Berapa kalikah bilangan murid dalam Kelas B berbanding Kelas A? (c) Terangkan mengapa carta-carta itu mengelirukan.`), fig, a: SPM.parts([T(`${a} and ${b}`), T(`${k}`), B('The two charts use different vertical scales, so equal bar heights do not mean equal values. Use the same scale for both. || Kedua-dua carta menggunakan skala mencancang yang berbeza, jadi palang yang sama tinggi tidak bermaksud nilai yang sama. Gunakan skala yang sama untuk kedua-duanya.')]), w: W(T(`(a) Read each bar against its own scale: Class A $${a}$, Class B $${b}$.`, `(a) Baca setiap palang pada skalanya sendiri: Kelas A $${a}$, Kelas B $${b}$.`), T(`(b) $${b} \\div ${a} = ${k}$`), B('Two charts can be compared by eye only when they use the same scale. || Dua carta hanya boleh dibandingkan dengan mata apabila kedua-duanya menggunakan skala yang sama.')), sp: 'm' };
    },
  ];
  const g125a = [
    (r) => {
      const b = r.pick(GB), ymin = r.pick([40, 50, 60]), va = ymin + 10, vb = ymin + 10 * r.pick([2, 3]), c = r.pick(CTXS), cats = r.sample(c.cats, 2), ymax = ceilTo(vb + 1, 10), s0 = r.pick([20, 25, 40]);
      const fig = dual((l) => bars({ cats: ecat({ cats }, l), series: [[va, vb]], ymin, ymax, ystep: 10, w: 240, h: 200, title: Ln(l, 'Everyone loves ' + cats[1].en + '!', 'Semua orang suka ' + cats[1].ms + '!'), vl: Ln(l, 'Votes', 'Undi') }));
      return { q: T(`To find out the opinion of the whole school on "${c.name.en}", a student asks only ${b.en}. The results are shown in a chart titled "Everyone loves ${cats[1].en}!". The vertical axis starts at ${ymin}. Bars: ${cats[0].en} ${va} votes, ${cats[1].en} ${vb} votes. (a) List three problems with the collection and display. (b) By what percentage is ${cats[1].en} really higher than ${cats[0].en}? (c) State a fair conclusion.`, `Untuk mengetahui pendapat seluruh sekolah tentang "${c.name.ms}", seorang murid hanya bertanya kepada ${b.ms}. Keputusan ditunjukkan dalam carta bertajuk "Semua orang suka ${cats[1].ms}!". Paksi mencancang bermula pada ${ymin}. Palang: ${cats[0].ms} ${va} undi, ${cats[1].ms} ${vb} undi. (a) Senaraikan tiga masalah dalam pengumpulan dan paparan. (b) Berapa peratuskah ${cats[1].ms} sebenarnya lebih tinggi daripada ${cats[0].ms}? (c) Nyatakan kesimpulan yang adil.`), fig, a: SPM.parts([T(`(1) The sample (${b.en}) is unrepresentative. (2) The axis starts at ${ymin}, so the bars are cut. (3) The title over-generalises ("everyone").`, `(1) Sampel (${b.ms}) tidak mewakili. (2) Paksi bermula pada ${ymin}, jadi palang dipotong. (3) Tajuk membuat generalisasi berlebihan ("semua orang").`), T(`$\\dfrac{${vb} - ${va}}{${va}} \\times 100 = ${n(round((vb - va) * 100 / va, 1))}\\%$`), T(`Among ${b.en}, ${cats[1].en} received ${vb} votes and ${cats[0].en} ${va}; this does not describe everyone.`, `Dalam kalangan ${b.ms}, ${cats[1].ms} mendapat ${vb} undi dan ${cats[0].ms} ${va}; ini tidak menggambarkan semua orang.`)]), w: W(SAMPW, TRUNCW, T(`$\\dfrac{${vb} - ${va}}{${va}} \\times 100 = ${n(round((vb - va) * 100 / va, 1))}\\%$`), B('A title may claim no more than the data show, and the data cover only the students who were asked. || Tajuk tidak boleh mendakwa lebih daripada apa yang ditunjukkan oleh data, dan data itu hanya merangkumi murid yang ditanya.')), sp: 'xl' };
    },
    (r) => {
      const q = r.pick(LQ), k = r.int(4, 5), miss = r.pick([10, 15, 20]), c = r.pick(CTXS), cats = r.sample(c.cats, k), tot = 100 - miss;
      const ps = retry(() => { const cuts = r.sample(rg(1, tot / 5 - 1), k - 1).sort((a, b) => a - b), f = []; let p = 0; for (const x of cuts.concat([tot / 5])) { f.push((x - p) * 5); p = x; } need(f.every((z) => z >= 10)); return f; });
      const fig = dual((l) => pieSvg({ vals: ps, labels: cats.map((x, i) => `${x[l]} ${ps[i]}%`) }));
      return { q: T(`A survey used the question "${q.l.en}" The results on "${c.name.en}" are shown in the pie chart, with no title. (a) What is wrong with the question? (b) What is wrong with the pie chart? (c) How large is the missing part? (d) Write a fairer question.`, `Satu tinjauan menggunakan soalan "${q.l.ms}" Keputusan tentang "${c.name.ms}" ditunjukkan dalam carta pai, tanpa tajuk. (a) Apakah yang tidak betul dengan soalan itu? (b) Apakah yang tidak betul dengan carta pai itu? (c) Berapakah bahagian yang tertinggal? (d) Tulis soalan yang lebih adil.`), fig, a: SPM.parts([B('It is a leading question. || Ia soalan yang mengarahkan.'), T(`It has no title, and the percentages add up to ${tot}%, not 100%.`, `Ia tiada tajuk, dan peratusan berjumlah ${tot}%, bukan 100%.`), T(`$100\\% - ${tot}\\% = ${miss}\\%$`), q.f]), w: W(B('The sectors of a pie chart must cover the whole group, so the percentages must add up to $100\\%$. || Sektor carta pai mesti meliputi seluruh kumpulan, jadi peratusan mesti berjumlah $100\\%$.'), T(`$${ps.join(' + ')} = ${tot}$`), T(`$100\\% - ${tot}\\% = ${miss}\\%$`), B('The question is leading as well, so even the percentages shown cannot be trusted. || Soalan itu juga mengarahkan, jadi peratusan yang ditunjukkan pun tidak boleh dipercayai.')), sp: 'l' };
    },
    (r) => {
      const ts = r.pick(CHG), v1 = r.step(100, 200, 20), p = r.pick([5, 10]), v2 = v1 * (100 + p) / 100, c = r.pick(['Sales have doubled! || Jualan telah meningkat dua kali ganda!', 'Huge growth! || Pertumbuhan yang besar!']);
      need(Number.isInteger(v2));
      const ymin = v1 - 20, ymax = v2 + 10, y0 = r.int(2018, 2022);
      const fig = both(dual((l) => bars({ cats: [String(y0), String(y0 + 1)], series: [[v1, v2]], ymin, ymax: ceilTo(ymax, 10), ystep: 10, w: 210, h: 190, vl: ts.y[l], title: Ln(l, ...c.split(' || ')) })), dual((l) => bars({ cats: [String(y0), String(y0 + 1)], series: [[v1, v2]], ymax: ceilTo(v2 + 1, 50), ystep: 50, w: 210, h: 190, vl: ts.y[l], title: Ln(l, 'Same data, axis from 0', 'Data sama, paksi dari 0') })));
      return { q: T(`Two charts show the ${ts.w.en} in ${y0} (${v1}) and ${y0 + 1} (${v2}). The left chart has the headline "${c.split(' || ')[0]}". (a) Find the actual percentage increase. (b) How do the two charts differ in what they suggest? (c) Is the headline supported? Write a fair headline.`, `Dua carta menunjukkan ${ts.w.ms} pada ${y0} (${v1}) dan ${y0 + 1} (${v2}). Carta kiri mempunyai tajuk utama "${c.split(' || ')[1]}". (a) Cari peratusan pertambahan yang sebenar. (b) Bagaimanakah kedua-dua carta berbeza dari segi apa yang ditunjukkan? (c) Adakah tajuk utama itu disokong? Tulis tajuk yang adil.`), fig, a: SPM.parts([T(`$\\dfrac{${v2 - v1}}{${v1}} \\times 100 = ${p}\\%$`), T(`The left chart starts its axis at ${ymin}, so the second bar looks several times taller; the right chart starts at 0 and shows a small rise.`, `Carta kiri memulakan paksinya pada ${ymin}, jadi palang kedua kelihatan beberapa kali lebih tinggi; carta kanan bermula pada 0 dan menunjukkan kenaikan kecil.`), T(`No. A fair headline: "Sales rose by ${p}%, from ${v1} to ${v2}."`, `Tidak. Tajuk utama yang adil: "Jualan meningkat ${p}%, daripada ${v1} kepada ${v2}."`)]), w: W(T(`$${v2} - ${v1} = ${v2 - v1}$`), T(`$\\dfrac{${v2 - v1}}{${v1}} \\times 100 = ${p}\\%$`), TRUNCW, T(`A rise of $${p}\\%$ is small: doubling would mean $${v1 * 2}$.`, `Kenaikan $${p}\\%$ adalah kecil: dua kali ganda bermakna $${v1 * 2}$.`)), sp: 'l' };
    },
    (r) => {
      const ymin = r.pick([40, 50, 60]), c = r.pick(CTXS), cats = r.sample(c.cats, 3), k1 = r.int(2, 3), k2 = r.int(2, 4), vals = [ymin + 10, ymin + 10 * k1, ymin + 10 * k2], ymax = ceilTo(Math.max(...vals) + 1, 10);
      need(k1 !== k2);
      const fig = dual((l) => bars({ cats: ecat({ cats }, l), series: [vals], ymin, ymax, ystep: 10, w: 250 }));
      const mx = Math.max(...vals);
      return { q: T(`A chart about "${c.name.en}" (values ${vals.join(', ')} for ${cats.map((x) => x.en).join(', ')}) is shown. (a) Identify three problems with the way it is drawn. (b) Describe how each should be corrected. (c) The tallest bar looks about ${n(round((mx - ymin) / 10, 1))} times as tall as the shortest. What is the true ratio (to 1 decimal place)?`, `Sebuah carta tentang "${c.name.ms}" (nilai ${vals.join(', ')} bagi ${cats.map((x) => x.ms).join(', ')}) ditunjukkan. (a) Kenal pasti tiga masalah pada cara ia dilukis. (b) Terangkan bagaimana setiap satu patut dibetulkan. (c) Palang tertinggi kelihatan kira-kira ${n(round((mx - ymin) / 10, 1))} kali ganda setinggi palang terendah. Berapakah nisbah sebenar (betul kepada 1 tempat perpuluhan)?`), fig, a: SPM.parts([B('There is no title; there is no label (or unit) on the vertical axis; the vertical axis does not start at 0. || Tiada tajuk; tiada label (atau unit) pada paksi mencancang; paksi mencancang tidak bermula pada 0.'), T(`Add a title such as "${c.name.en}", label the vertical axis with its unit, and start the axis at 0 (or mark a clear break).`, `Tambah tajuk seperti "${c.name.ms}", labelkan paksi mencancang dengan unitnya, dan mulakan paksi pada 0 (atau tandakan pemutusan yang jelas).`), T(`$\\dfrac{${mx}}{${ymin + 10}} = ${n(round(mx / (ymin + 10), 1))}$`)]), w: W(CHARTW, TRUNCW, T(`Apparent: $\\dfrac{${mx} - ${ymin}}{${vals[0]} - ${ymin}} = ${n(round((mx - ymin) / 10, 1))}$`, `Kelihatan: $\\dfrac{${mx} - ${ymin}}{${vals[0]} - ${ymin}} = ${n(round((mx - ymin) / 10, 1))}$`), T(`True: $\\dfrac{${mx}}{${ymin + 10}} = ${n(round(mx / (ymin + 10), 1))}$`, `Sebenar: $\\dfrac{${mx}}{${ymin + 10}} = ${n(round(mx / (ymin + 10), 1))}$`)), sp: 'l' };
    },
  ];
  SPM.extend('F1-12.5', { e: g125e, m: g125m, a: g125a });

  /*@@NEXT@@*/
})();
