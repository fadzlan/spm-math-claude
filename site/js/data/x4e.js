/* Variety pack x4e: F4 Chapter 8 "Measures of Dispersion of Ungrouped Data" (F4-8.1.1, 8.1.2, 8.2.1-8.2.5). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, sum, mean, sortNum, median, Fr, poly, lin, rm, table, parts, need, retry } = SPM;
  const T = SPM.L, S = SPM.svg;
  const W = SPM.lines;

  /* ---------------------------------------------------------------- stats helpers */
  const list = (v) => v.join(',\\ ');
  /* quartiles: KSSM textbook median-of-halves method (exclude overall median when N odd) */
  const quart = (v) => {
    const s = sortNum(v), m = s.length >> 1;
    const lo = s.slice(0, m), hi = s.slice(s.length % 2 ? m + 1 : m);
    return { min: s[0], q1: median(lo), med: median(s), q3: median(hi), max: s[s.length - 1], sorted: s };
  };
  const varp = (v) => sum(v.map((x) => x * x)) / v.length - Math.pow(mean(v), 2); // population variance
  const sd = (v) => Math.sqrt(varp(v));
  const f2 = (x) => n(round(x, 2));
  const rnd = (r, k, lo, hi) => Array.from({ length: k }, () => r.int(lo, hi));
  const rndDistinctish = (r, k, lo, hi) => { need(hi - lo + 1 >= Math.ceil(k / 2)); return rnd(r, k, lo, hi); };

  /* ---------------------------------------------------------------- working helpers */
  const par = SPM.par;
  const rg = (v) => Math.max(...v) - Math.min(...v);
  const ordE = (k) => k + (k % 10 === 1 && k % 100 !== 11 ? 'st' : k % 10 === 2 && k % 100 !== 12 ? 'nd' : k % 10 === 3 && k % 100 !== 13 ? 'rd' : 'th');
  const lb = (g) => (g ? `${g}: ` : '');
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  /** Range = max - min = … */
  const rangeW = (v, g) => T(`${lb(g)}Range $= ${n(Math.max(...v))} - ${par(Math.min(...v))} = ${n(rg(v))}$`, `${lb(g)}Julat $= ${n(Math.max(...v))} - ${par(Math.min(...v))} = ${n(rg(v))}$`);
  /** median from its position in the ordered data */
  const medW = (v, g) => {
    const s = sortNum(v), N = s.length, k = N >> 1;
    return N % 2
      ? T(`${lb(g)}$N = ${N}$, median = ${ordE(k + 1)} value $= ${n(s[k])}$`, `${lb(g)}$N = ${N}$, median = nilai ke-${k + 1} $= ${n(s[k])}$`)
      : T(`${lb(g)}$N = ${N}$, median = mean of the ${ordE(k)} and ${ordE(k + 1)} values $= \\dfrac{${n(s[k - 1])} + ${n(s[k])}}{2} = ${n(median(s))}$`, `${lb(g)}$N = ${N}$, median = purata nilai ke-${k} dan ke-${k + 1} $= \\dfrac{${n(s[k - 1])} + ${n(s[k])}}{2} = ${n(median(s))}$`);
  };
  /** median of an ordered half, with the averaging step when its length is even */
  const q2 = (h) => (h.length % 2 ? n(h[h.length >> 1]) : `\\dfrac{${n(h[(h.length >> 1) - 1])} + ${n(h[h.length >> 1])}}{2} = ${n(median(h))}`);
  /** Q1 and Q3 by the median-of-halves method (optionally the ordered data first) */
  const quartW = (v, g, showOrder) => {
    const s = sortNum(v), m = s.length >> 1, lo = s.slice(0, m), hi = s.slice(s.length % 2 ? m + 1 : m);
    return [...(showOrder ? [T(`${lb(g)}Ordered: $${list(s)}$`, `${lb(g)}Tertib: $${list(s)}$`)] : []),
      T(`${lb(g)}Lower half $${list(lo)}$: $Q_1 = ${q2(lo)}$`, `${lb(g)}Separuh bawah $${list(lo)}$: $Q_1 = ${q2(lo)}$`),
      T(`${lb(g)}Upper half $${list(hi)}$: $Q_3 = ${q2(hi)}$`, `${lb(g)}Separuh atas $${list(hi)}$: $Q_3 = ${q2(hi)}$`)];
  };
  const iqrW = (v, g) => { const q = quart(v); return T(`${lb(g)}IQR $= Q_3 - Q_1 = ${n(q.q3)} - ${n(q.q1)} = ${n(q.q3 - q.q1)}$`, `${lb(g)}JAK $= Q_3 - Q_1 = ${n(q.q3)} - ${n(q.q1)} = ${n(q.q3 - q.q1)}$`); };
  /** "=" when the 2-dp value is exact, "≈" otherwise */
  const eq2 = (x) => (n(round(x, 2)) === n(x) ? '=' : '\\approx');
  const rt4 = (x) => n(round(x, 4));
  /** mean, variance (and s.d.) from N, Σx, Σx² – freq = true labels them Σf, Σfx, Σfx² */
  const varW = (N, S, SS, opt) => {
    opt = opt || {};
    const f = opt.freq ? 'f' : '', m = S / N, vr = SS / N - m * m;
    const out = [];
    if (!opt.noSums) out.push(`$\\sum ${f}x = ${n(S)}$, $\\sum ${f}x^2 = ${n(SS)}$, $${opt.freq ? '\\sum f' : 'N'} = ${N}$`);
    if (!opt.noMean) out.push(`$\\bar{x} = \\dfrac{${n(S)}}{${N}} ${eq2(m)} ${f2(m)}$`);
    out.push(`$\\sigma^2 = \\dfrac{\\sum ${f}x^2}{${opt.freq ? '\\sum f' : 'N'}} - \\bar{x}^2 = \\dfrac{${n(SS)}}{${N}} - \\left(\\dfrac{${n(S)}}{${N}}\\right)^2 ${eq2(vr)} ${f2(vr)}$`);
    if (opt.sd) out.push(`$\\sigma = \\sqrt{${rt4(vr)}} ${eq2(Math.sqrt(vr))} ${f2(Math.sqrt(vr))}$`);
    return out;
  };
  const varV = (v, opt) => varW(v.length, sum(v), sum(v.map((x) => x * x)), opt);
  /** unique mode of a list, or null when several values tie */
  const mode1 = (v) => {
    const cnt = {}; v.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1));
    const top = Math.max(...Object.values(cnt)), ks = Object.keys(cnt).filter((k) => cnt[k] === top);
    return ks.length === 1 ? { m: +ks[0], f: top } : null;
  };

  /* ---------------------------------------------------------------- figures */
  const dotFig = (groups, lo, hi) => {
    const W = 320, rowH = 58, pl = 20, pr = 14, H = 30 + groups.length * rowH;
    const sx = (x) => pl + ((x - lo) / (hi - lo)) * (W - pl - pr);
    let out = '';
    groups.forEach((g, gi) => {
      const base = 30 + gi * rowH + rowH - 22;
      out += S.line(pl - 6, base, W - pr + 6, base);
      const cnt = {};
      g.values.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1));
      for (let x = lo; x <= hi; x++) {
        out += S.line(sx(x), base, sx(x), base + 3, { w: 1 });
        if (gi === groups.length - 1) out += S.text(sx(x), base + 12, String(x), { s: 10 });
        for (let i = 0; i < (cnt[x] || 0); i++) out += S.circle(sx(x), base - 7 - i * 9, 3.4, { fill: 'currentColor' });
      }
      if (g.label) out += S.text(pl - 4, base - rowH + 26, g.label, { a: 'start', s: 11, b: true });
    });
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
    const st = hi - lo > 40 ? 10 : hi - lo > 16 ? 5 : 2;
    for (let x = Math.ceil(lo / st) * st; x <= hi; x += st) out += S.line(sx(x), base, sx(x), base + 3, { w: 1 }) + S.text(sx(x), base + 12, String(x), { s: 10 });
    return S.wrap(W, H, out, 'box plot');
  };
  /* stem-and-leaf, 2-digit data (stem = tens digit); optional second group -> back-to-back plot */
  const stemLeaf = (a, b) => {
    const lo = Math.floor(Math.min(...a, ...(b || a)) / 10), hi = Math.floor(Math.max(...a, ...(b || a)) / 10);
    const leavesOf = (v) => { const m = {}; sortNum(v).forEach((x) => { const s = Math.floor(x / 10), l = x % 10; (m[s] = m[s] || []).push(l); }); return m; };
    const la = leavesOf(a), lb = b ? leavesOf(b) : null;
    let rows = '';
    for (let s = lo; s <= hi; s++) {
      if (lb) rows += `<tr><td style="text-align:right;padding:1px 6px;letter-spacing:2px">${(la[s] || []).slice().reverse().join(' ')}</td><td style="text-align:center;padding:1px 6px;border-left:1px solid currentColor;border-right:1px solid currentColor;font-weight:bold">${s}</td><td style="text-align:left;padding:1px 6px;letter-spacing:2px">${(lb[s] || []).join(' ')}</td></tr>`;
      else rows += `<tr><td style="text-align:right;padding:1px 6px;border-right:1px solid currentColor;font-weight:bold">${s}</td><td style="text-align:left;padding:1px 6px;letter-spacing:2px">${(la[s] || []).join(' ')}</td></tr>`;
    }
    const tbl = `<table class="qt" style="border-collapse:collapse;margin:4px 0">${rows}</table>`;
    const ex = a[0];
    const key = (lang) => (lang === 'en' ? `Key: ${Math.floor(ex / 10)} | ${ex % 10} = ${ex}` : `Kunci: ${Math.floor(ex / 10)} | ${ex % 10} = ${ex}`);
    return T(tbl + `<div style="font-size:.85em">${key('en')}</div>`, tbl + `<div style="font-size:.85em">${key('ms')}</div>`);
  };

  /* ---------------------------------------------------------------- context banks */
  const CTX = [ // numeric-data contexts: {en, ms, lo, hi}
    { en: 'the marks (out of 50) scored by students in a quiz', ms: 'markah (daripada 50) yang diperoleh murid dalam satu kuiz', lo: 10, hi: 50 },
    { en: 'the time (in minutes) taken by workers to complete a task', ms: 'masa (dalam minit) yang diambil oleh pekerja untuk menyiapkan satu tugasan', lo: 5, hi: 40 },
    { en: 'the daily maximum temperature (in °C) recorded in a town', ms: 'suhu maksimum harian (dalam °C) yang direkodkan di sebuah bandar', lo: 22, hi: 36 },
    { en: 'the mass (in kg) of parcels sent by a courier', ms: 'jisim (dalam kg) bungkusan yang dihantar oleh syarikat kurier', lo: 1, hi: 20 },
    { en: 'the number of customers served by a shop each day', ms: 'bilangan pelanggan yang dilayan oleh sebuah kedai setiap hari', lo: 10, hi: 60 },
    { en: 'the delivery time (in minutes) of food orders', ms: 'masa penghantaran (dalam minit) pesanan makanan', lo: 10, hi: 45 },
    { en: 'the number of goals scored by a team in each match', ms: 'bilangan gol yang dijaringkan oleh sepasukan dalam setiap perlawanan', lo: 0, hi: 9 },
    { en: 'the monthly rainfall (in mm) recorded at a station', ms: 'hujan bulanan (dalam mm) yang direkodkan di sebuah stesen', lo: 50, hi: 99 },
    { en: 'the height (in cm) of seedlings in a nursery', ms: 'ketinggian (dalam cm) anak pokok di sebuah tapak semaian', lo: 10, hi: 40 },
    { en: 'the typing speed (in words per minute) of office staff', ms: 'kelajuan menaip (dalam patah perkataan seminit) kakitangan pejabat', lo: 20, hi: 80 },
    { en: 'the price (in RM) of items sold at a flea market', ms: 'harga (dalam RM) barangan yang dijual di pasar jaja', lo: 5, hi: 50 },
    { en: 'the age (in years) of members of a badminton club', ms: 'umur (dalam tahun) ahli sebuah kelab badminton', lo: 12, hi: 45 },
    { en: 'the waiting time (in minutes) of customers at a clinic', ms: 'masa menunggu (dalam minit) pelanggan di sebuah klinik', lo: 2, hi: 60 },
    { en: 'the number of books read by students in a month', ms: 'bilangan buku yang dibaca oleh murid dalam sebulan', lo: 0, hi: 12 },
    { en: 'the number of fish caught by fishermen in a day', ms: 'bilangan ikan yang ditangkap oleh nelayan dalam sehari', lo: 2, hi: 30 },
  ];
  const SQ = [ // [en, ms, isStatistical]
    ['the heights of students in a Form 4 class', 'ketinggian murid dalam satu kelas Tingkatan 4', true],
    ['the number of days in a week', 'bilangan hari dalam seminggu', false],
    ['the time each student takes to run 100 m', 'masa yang diambil setiap murid untuk berlari 100 m', true],
    ['how many sides a triangle has', 'bilangan sisi sebuah segi tiga', false],
    ['the amount of pocket money students receive daily', 'jumlah wang saku yang diterima murid setiap hari', true],
    ['the number of planets in the solar system', 'bilangan planet dalam sistem suria', false],
    ['the marks scored by students in a mathematics quiz', 'markah yang diperoleh murid dalam satu kuiz matematik', true],
    ['the boiling point of water at sea level', 'takat didih air di aras laut', false],
    ['the number of hours students spend on homework each night', 'bilangan jam murid meluangkan masa untuk kerja rumah setiap malam', true],
    ['the number of days in the month of January', 'bilangan hari dalam bulan Januari', false],
    ['the shoe sizes of students in a school', 'saiz kasut murid di sebuah sekolah', true],
    ['the number of wheels on a bicycle', 'bilangan roda pada sebuah basikal', false],
    ['the daily temperature in a town over a month', 'suhu harian di sebuah bandar sepanjang sebulan', true],
    ['the number of centimetres in a metre', 'bilangan sentimeter dalam satu meter', false],
    ['the amount of rainfall recorded each day in a town', 'jumlah hujan yang direkodkan setiap hari di sebuah bandar', true],
    ['the number of sides on a stop sign', 'bilangan sisi pada sebuah papan tanda berhenti', false],
    ['the resting heart rate of students in a class', 'kadar denyutan jantung rehat murid dalam sebuah kelas', true],
    ['the number of legs an ant has', 'bilangan kaki seekor semut', false],
    ['the number of text messages students send in a day', 'bilangan mesej teks yang dihantar murid dalam sehari', true],
    ['the freezing point of water in degrees Celsius', 'takat beku air dalam darjah Celsius', false],
    ['the number of goals scored by a football team each match', 'bilangan gol yang dijaringkan oleh sepasukan bola sepak setiap perlawanan', true],
    ['the number of minutes in an hour', 'bilangan minit dalam sejam', false],
  ];
  /* the one-line test for a statistical question */
  const sqWhy = (yes) => (yes
    ? T('Test: would different people or occasions give different answers? Yes, so the answers vary (variability).', 'Ujian: adakah orang atau keadaan berlainan memberi jawapan berbeza? Ya, jadi jawapannya berbeza-beza (kepelbagaian).')
    : T('Test: would different people or occasions give different answers? No, there is one fixed answer, so there is no variability.', 'Ujian: adakah orang atau keadaan berlainan memberi jawapan berbeza? Tidak, hanya ada satu jawapan tetap, jadi tiada kepelbagaian.'));
  const CATS = [ // settings for planning an inquiry: [en, ms]
    ['students in your school', 'murid di sekolah anda'],
    ['members of a school sports team', 'ahli sebuah pasukan sukan sekolah'],
    ['customers at the school canteen', 'pelanggan di kantin sekolah'],
    ['households in your neighbourhood', 'isi rumah di kawasan kejiranan anda'],
    ['workers at a small factory', 'pekerja di sebuah kilang kecil'],
    ['passengers on a bus route', 'penumpang di sebuah laluan bas'],
    ['visitors to a public library', 'pengunjung ke sebuah perpustakaan awam'],
    ['patients at a clinic', 'pesakit di sebuah klinik'],
    ['stallholders at a night market', 'peniaga di sebuah pasar malam'],
    ['members of a badminton club', 'ahli sebuah kelab badminton'],
    ['farmers in a village', 'petani di sebuah kampung'],
    ['shoppers at a supermarket', 'pembeli-belah di sebuah pasar raya'],
    ['residents of an apartment block', 'penduduk sebuah blok pangsapuri'],
    ['drivers using a toll road', 'pemandu yang menggunakan sebuah lebuh raya bertol'],
  ];
  const METHOD = [['a survey questionnaire', 'soal selidik'], ['an interview', 'temu bual'], ['an experiment', 'eksperimen'], ['direct observation', 'pemerhatian terus']];

  /* =============================================================== 8.1.1 Meaning of dispersion */
  const g811e = [
    (r) => { // classify statistical vs not, explain
      const q = r.pick(SQ);
      return { q: T(`Is "${q[0]}" a statistical question (one whose answers are expected to vary)? Explain briefly.`, `Adakah "${q[1]}" satu soalan statistik (satu soalan yang jawapannya dijangka berbeza-beza)? Terangkan secara ringkas.`),
        a: q[2] ? T('Yes: different people or occasions give different values, so an answer varies.', 'Ya: orang atau keadaan berlainan memberikan nilai yang berbeza, jadi jawapannya berbeza-beza.') : T('No: the value is fixed/the same for everyone, so there is no variability.', 'Tidak: nilainya tetap/sama untuk semua, jadi tiada kepelbagaian.'), w: W(sqWhy(q[2])), sp: 's' };
    },
    (r) => { // MCQ: pick the statistical question among 3 distractors
      const yes = SQ.filter((s) => s[2]), no = SQ.filter((s) => !s[2]);
      const correct = r.pick(yes), wrong = r.sample(no, 3);
      const opts = r.shuffle([correct, ...wrong]);
      const letters = ['A', 'B', 'C', 'D'];
      const mk = (k) => opts.map((o, i) => `${letters[i]}. ${o[k]}`).join('<br>');
      const idx = opts.indexOf(correct);
      return { q: T(`Which of the following is a statistical question?<br>${mk(0)}`, `Yang manakah antara berikut ialah soalan statistik?<br>${mk(1)}`), a: T(`${letters[idx]}. ${correct[0]} (its answers are expected to vary)`, `${letters[idx]}. ${correct[1]} (jawapannya dijangka berbeza-beza)`), w: W(sqWhy(true), T('The other three options each have one fixed answer, so they are not statistical questions.', 'Tiga pilihan lain masing-masing mempunyai satu jawapan tetap, jadi ia bukan soalan statistik.')), sp: 'm' };
    },
    (r) => { // does this produce data with spread (dispersion) or a single fixed value
      const q = r.pick(SQ);
      return { q: T(`If data were collected on ${q[0]}, would the values collected show dispersion (spread out) or all be the same? State your answer.`, `Jika data dikumpul tentang ${q[1]}, adakah nilai yang dikumpul menunjukkan serakan (bertaburan) atau semuanya sama? Nyatakan jawapan anda.`),
        a: q[2] ? T('Dispersion: the collected values differ from one another.', 'Serakan: nilai yang dikumpul berbeza antara satu sama lain.') : T('All the same: the value never changes, so there is no dispersion.', 'Semuanya sama: nilainya tidak pernah berubah, jadi tiada serakan.'), w: W(sqWhy(q[2]), q[2] ? T('Values that vary are spread out, i.e. they show dispersion.', 'Nilai yang berbeza-beza bertaburan, iaitu menunjukkan serakan.') : T('Identical values have zero spread, i.e. no dispersion.', 'Nilai yang sama mempunyai serakan sifar, iaitu tiada serakan.')), sp: 's' };
    },
    (r) => { // true/false with correction
      const q = r.pick(SQ);
      const claim = r.chance();
      const statement = claim ? q[2] : !q[2];
      return { q: T(`True or False: "${q[0]}" ${statement ? 'is' : 'is not'} a statistical question. Justify your answer.`, `Betul atau Salah: "${q[1]}" ${statement ? 'ialah' : 'bukan'} satu soalan statistik. Berikan justifikasi.`),
        a: claim
          ? (q[2] ? T('True: its answers are expected to vary across individuals/occasions.', 'Betul: jawapannya dijangka berbeza-beza antara individu/keadaan.') : T('True: the value is fixed for everyone/always the same, so there is no variability.', 'Betul: nilainya tetap untuk semua/sentiasa sama, jadi tiada kepelbagaian.'))
          : (q[2] ? T('False: it is a statistical question, since its answers are expected to vary across individuals/occasions.', 'Salah: ia ialah soalan statistik, kerana jawapannya dijangka berbeza-beza antara individu/keadaan.') : T('False: it is not a statistical question, since the value is fixed for everyone/always the same.', 'Salah: ia bukan soalan statistik, kerana nilainya tetap untuk semua/sentiasa sama.')), w: W(sqWhy(q[2]), q[2] ? T('So it is a statistical question.', 'Jadi ia ialah soalan statistik.') : T('So it is not a statistical question.', 'Jadi ia bukan soalan statistik.')), sp: 's' };
    },
  ];
  const g811m = [
    (r) => { // write own statistical question + method
      const c = r.pick(CATS);
      return { q: T(`Write a statistical question about ${c[0]} whose answers are expected to vary. State one suitable method to collect the data, and one reason the answers would vary.`, `Tulis satu soalan statistik tentang ${c[1]} yang jawapannya dijangka berbeza-beza. Nyatakan satu kaedah yang sesuai untuk mengumpul data, dan satu sebab jawapannya akan berbeza-beza.`),
        a: T(`E.g. a suitable question, a data-collection method such as a questionnaire/interview/observation given to a sample of ${c[0]}, and a reason such as different individuals or occasions naturally differ.`, `Cth. satu soalan yang sesuai, kaedah pengumpulan data seperti soal selidik/temu bual/pemerhatian kepada satu sampel ${c[1]}, dan sebab seperti individu atau keadaan yang berlainan sememangnya berbeza.`), w: W(T('A statistical question must have answers that vary, e.g. "How many hours do … spend on … each week?", not a single fixed fact.', 'Soalan statistik mesti mempunyai jawapan yang berbeza-beza, cth. "Berapa jam … meluangkan masa untuk … setiap minggu?", bukan satu fakta tetap.'), T('Then name how the data are collected (questionnaire, interview, observation or experiment) and why individuals differ.', 'Kemudian nyatakan cara data dikumpul (soal selidik, temu bual, pemerhatian atau eksperimen) dan sebab individu berbeza.')), sp: 'l' };
    },
    (r) => { // interpret described spread (tight vs wide)
      const c = r.pick(CTX);
      const [na, nb] = [r.pick(['tightly clustered around one value', 'clustered tightly together']), r.pick(['spread widely across the scale', 'scattered far apart'])];
      const tight = r.pick(['A', 'B']);
      return { q: T(`Dot plots of ${c.en} for Group A and Group B are compared on the same scale. Group A's dots are ${tight === 'A' ? na : nb}, while Group B's dots are ${tight === 'A' ? nb : na}. Which group is more consistent (less dispersed), and which shows greater dispersion?`, `Plot titik bagi ${c.ms} untuk Kumpulan A dan Kumpulan B dibandingkan pada skala yang sama. Titik Kumpulan A ${tight === 'A' ? 'terkumpul rapat di sekitar satu nilai' : 'bertaburan luas merentasi skala'}, manakala titik Kumpulan B ${tight === 'A' ? 'bertaburan luas merentasi skala' : 'terkumpul rapat di sekitar satu nilai'}. Kumpulan manakah lebih konsisten (kurang serakan), dan kumpulan manakah menunjukkan serakan lebih besar?`),
        a: T(`Group ${tight} (tightly clustered) is more consistent; Group ${tight === 'A' ? 'B' : 'A'} (spread widely) shows greater dispersion.`, `Kumpulan ${tight} (terkumpul rapat) lebih konsisten; Kumpulan ${tight === 'A' ? 'B' : 'A'} (bertaburan luas) menunjukkan serakan lebih besar.`), w: W(T('On the same scale, dots close together mean the values differ little (small dispersion); dots far apart mean large dispersion.', 'Pada skala yang sama, titik yang rapat bermaksud nilai berbeza sedikit (serakan kecil); titik yang berjauhan bermaksud serakan besar.'), T(`Less dispersion = more consistent, so Group ${tight} is more consistent.`, `Kurang serakan = lebih konsisten, jadi Kumpulan ${tight} lebih konsisten.`)), sp: 'm' };
    },
    (r) => { // critique a weak yes/no "statistical" question
      const c = r.pick([['Do you like durian?', 'Adakah anda suka durian?'], ['Is football your favourite sport?', 'Adakah bola sepak sukan kegemaran anda?'], ['Do you own a smartphone?', 'Adakah anda memiliki telefon pintar?']]);
      return { q: T(`A student says the survey question "${c[0]}" (answered Yes/No) is a good statistical question because different people may answer differently. Explain why a fixed set of categories like Yes/No still counts as data with variability, but state one limitation of this question compared with asking for a numeric quantity.`, `Seorang murid berkata soalan tinjauan "${c[1]}" (dijawab Ya/Tidak) ialah soalan statistik yang baik kerana orang berlainan mungkin memberi jawapan berbeza. Terangkan mengapa satu set kategori tetap seperti Ya/Tidak masih dikira sebagai data yang mempunyai kepelbagaian, tetapi nyatakan satu batasan soalan ini berbanding menanya suatu kuantiti berangka.`),
        a: T('The answers still vary between Yes and No across respondents, so there is variability; however, a Yes/No question gives far less detail about spread than a numeric answer (e.g. a rating or a measured quantity), which limits what can be said about dispersion.', 'Jawapannya masih berbeza antara Ya dan Tidak dalam kalangan responden, jadi terdapat kepelbagaian; namun, soalan Ya/Tidak memberikan jauh lebih sedikit perincian tentang serakan berbanding jawapan berangka (cth. penilaian atau kuantiti yang diukur), yang menghadkan apa yang boleh dikatakan tentang serakan.'), w: W(T('Variability only needs different respondents to be able to give different answers, which Yes/No allows.', 'Kepelbagaian hanya memerlukan responden berlainan boleh memberi jawapan berbeza, dan Ya/Tidak membenarkannya.'), T('But with only two categories we cannot measure how far apart the answers are (no range, interquartile range or standard deviation).', 'Tetapi dengan hanya dua kategori, kita tidak dapat mengukur sejauh mana jawapan berbeza (tiada julat, julat antara kuartil atau sisihan piawai).')), sp: 'm' };
    },
    (r) => { // compare collection methods
      const c = r.pick(CTX), m = r.sample(METHOD, 2);
      return { q: T(`To investigate ${c.en}, state one advantage and one disadvantage of using ${m[0][0]} compared with using ${m[1][0]}.`, `Untuk menyiasat ${c.ms}, nyatakan satu kelebihan dan satu kekurangan menggunakan ${m[0][1]} berbanding menggunakan ${m[1][1]}.`),
        a: T(`E.g. ${m[0][0]} may be faster/cheaper to carry out but ${m[1][0]} may give more accurate or detailed data; the best choice depends on time, cost and the accuracy needed.`, `Cth. ${m[0][1]} mungkin lebih cepat/murah dijalankan tetapi ${m[1][1]} mungkin memberikan data yang lebih tepat atau terperinci; pilihan terbaik bergantung pada masa, kos dan ketepatan yang diperlukan.`), w: W(T('Compare the two methods on time, cost, sample size reached and accuracy/detail of the data.', 'Bandingkan kedua-dua kaedah dari segi masa, kos, saiz sampel yang dicapai dan ketepatan/perincian data.')), sp: 'm' };
    },
  ];
  const g811a = [
    (r) => { // design a full inquiry
      const c = r.pick(CATS);
      return { q: T(`Design a small statistical inquiry about ${c[0]}. State (a) a statistical question, (b) the population or sample and a method of collecting the data, (c) a suitable representation to display the data, and (d) one feature of that representation that would reveal how dispersed the data are.`, `Rekakan satu penyiasatan statistik kecil tentang ${c[1]}. Nyatakan (a) satu soalan statistik, (b) populasi atau sampel serta satu kaedah mengumpul data, (c) satu perwakilan yang sesuai untuk memaparkan data, dan (d) satu ciri perwakilan itu yang dapat mendedahkan sejauh mana data itu tersebar.`),
        a: T('E.g. (a) an answerable question expected to vary, (b) a random sample of the group with a stated collection method, (c) a dot plot, stem-and-leaf plot or boxplot, (d) how tightly/widely the points, leaves or box are spread indicates the dispersion.', 'Cth. (a) satu soalan yang boleh dijawab dan dijangka berbeza-beza, (b) satu sampel rawak kumpulan itu dengan kaedah pengumpulan yang dinyatakan, (c) plot titik, plot batang-dan-daun atau plot kotak, (d) sejauh mana titik, daun atau kotak itu tersebar rapat/luas menunjukkan serakan.'), w: W(T('Follow the inquiry cycle: pose a question → collect data → represent the data → interpret the spread.', 'Ikut kitaran penyiasatan: kemukakan soalan → kumpul data → wakilkan data → tafsir serakan.'), T('For (d): the width of the plot (range) or of the box (interquartile range) shows the dispersion.', 'Bagi (d): kelebaran plot (julat) atau kotak (julat antara kuartil) menunjukkan serakan.')), sp: 'l' };
    },
    (r) => { // critique a flawed inquiry (sampling bias)
      const flaw = r.pick([
        ['She asks only 5 of her closest friends, who share similar habits, and claims the result applies to the whole school.', 'Dia hanya bertanya kepada 5 orang rakan karibnya, yang mempunyai tabiat serupa, dan mendakwa keputusan itu terpakai untuk seluruh sekolah.'],
        ['He asks a leading question, "Don’t you agree that Mathematics is the best subject?", which pushes respondents toward one answer.', 'Dia menanya soalan memujuk, "Bukankah anda bersetuju Matematik ialah mata pelajaran terbaik?", yang mendorong responden ke arah satu jawapan.'],
        ['She only records data from students who volunteer to answer, so shy or busy students are left out.', 'Dia hanya merekodkan data daripada murid yang sukarela menjawab, jadi murid yang pemalu atau sibuk tertinggal.'],
        ['He measures only one student’s reaction time and presents it as if it represents the whole class.', 'Dia hanya mengukur masa reaksi seorang murid dan membentangkannya seolah-olah ia mewakili seluruh kelas.'],
        ['She surveys students only during a chess club meeting and generalises the result to all students in the school.', 'Dia meninjau murid hanya semasa mesyuarat kelab catur dan menyamaratakan keputusan itu kepada semua murid di sekolah.'],
        ['He rounds every recorded time to the nearest 10 minutes, hiding most of the natural variation in the data.', 'Dia membundarkan setiap masa yang direkodkan kepada 10 minit terdekat, menyembunyikan sebahagian besar variasi semula jadi dalam data.'],
        ['She excludes the two lowest scores from her data set without any stated reason before calculating the average.', 'Dia mengecualikan dua markah terendah daripada set datanya tanpa sebarang sebab yang dinyatakan sebelum mengira purata.'],
        ['He collects data on only one day of the week and claims it represents a typical week.', 'Dia mengumpul data pada hanya satu hari dalam seminggu dan mendakwa ia mewakili seminggu yang biasa.'],
      ]);
      return { q: T(`A student investigates whether Form 4 students prefer Mathematics. ${flaw[0]} Identify one weakness in the data collection and suggest an improvement.`, `Seorang murid menyiasat sama ada murid Tingkatan 4 gemar Matematik. ${flaw[1]} Kenal pasti satu kelemahan dalam pengumpulan data itu dan cadangkan satu penambahbaikan.`),
        a: T('The sample/question is biased or too small to represent the population; a random, sufficiently large sample and a neutrally worded question would give a fairer result.', 'Sampel/soalan itu berat sebelah atau terlalu kecil untuk mewakili populasi; sampel rawak yang cukup besar dan soalan yang neutral akan memberikan keputusan yang lebih adil.'), w: W(T('Ask: does every member of the population have a fair chance to be included, and is the question neutral?', 'Tanya: adakah setiap ahli populasi mempunyai peluang yang adil untuk dipilih, dan adakah soalannya neutral?'), T('Here the answer is no, so the data do not represent all Form 4 students.', 'Di sini jawapannya tidak, jadi data itu tidak mewakili semua murid Tingkatan 4.')), sp: 'm' };
    },
    (r) => { // fair comparison of representations
      const issue = r.pick([
        ['one dot plot uses a scale of 0-10 and the other uses a scale of 0-100', 'satu plot titik menggunakan skala 0-10 dan satu lagi menggunakan skala 0-100'],
        ['the two stem-and-leaf plots use different-sized classes (a different key) without saying so', 'kedua-dua plot batang-dan-daun menggunakan saiz kelas berlainan (kunci berbeza) tanpa dinyatakan'],
        ['one plot starts its axis at 20 instead of 0, making its spread look larger than it really is', 'satu plot memulakan paksinya pada 20 dan bukan 0, menjadikan serakannya kelihatan lebih besar daripada sebenar'],
        ['one group has 10 observations plotted and the other has only 3, but they are drawn at the same visual width', 'satu kumpulan mempunyai 10 cerapan yang diplot dan satu lagi hanya 3, tetapi kedua-duanya dilukis pada lebar visual yang sama'],
        ['the two plots record the attribute in different units (one in cm, the other in mm) without conversion', 'kedua-dua plot merekodkan atribut dalam unit berlainan (satu dalam cm, satu lagi dalam mm) tanpa penukaran'],
      ]);
      return { q: T(`Two representations of the same attribute for two groups are compared, but ${issue[0]}. Explain why comparing them directly would be misleading, and state what should be done to make the comparison fair.`, `Dua perwakilan bagi atribut yang sama untuk dua kumpulan dibandingkan, tetapi ${issue[1]}. Terangkan mengapa perbandingan terus adalah mengelirukan, dan nyatakan apa yang perlu dilakukan supaya perbandingan itu adil.`),
        a: T('Different scales/axes distort the visual impression of spread even if the underlying dispersion is similar; both representations must use the same scale, key and axis range for a fair, valid comparison.', 'Skala/paksi yang berbeza mengherotkan gambaran visual serakan walaupun serakan sebenar adalah serupa; kedua-dua perwakilan mesti menggunakan skala, kunci dan julat paksi yang sama untuk perbandingan yang adil dan sah.'), w: W(T('Spread is judged by eye from the plot, so a change of scale, key, axis start or unit changes how spread out the data look.', 'Serakan dinilai secara visual daripada plot, jadi perubahan skala, kunci, permulaan paksi atau unit mengubah rupa taburan data.'), T('Redraw both on a common scale (same units, key and axis range) before comparing.', 'Lukis semula kedua-duanya pada skala sepunya (unit, kunci dan julat paksi yang sama) sebelum membandingkan.')), sp: 'm' };
    },
    (r) => { // simulated data disclosure
      const c = r.pick(CTX);
      return { q: T(`A report presents made-up numbers for ${c.en} without saying they are simulated, giving the impression the data were actually collected. Explain why this is a problem and what should have been done instead.`, `Satu laporan membentangkan nombor rekaan bagi ${c.ms} tanpa menyatakan ia adalah simulasi, memberi gambaran seolah-olah data itu benar-benar dikumpul. Terangkan mengapa ini bermasalah dan apa yang sepatutnya dilakukan.`),
        a: T('Presenting simulated data as if it were real is misleading and undermines trust in the conclusion; any simulated or made-up data must be clearly labelled as such.', 'Membentangkan data simulasi seolah-olah ia benar adalah mengelirukan dan menjejaskan kepercayaan terhadap kesimpulan; sebarang data simulasi atau rekaan mesti dilabelkan dengan jelas sedemikian.'), w: W(T('Readers assume reported data were really collected; hidden simulation makes the conclusion untrustworthy.', 'Pembaca menganggap data yang dilaporkan benar-benar dikumpul; simulasi yang disembunyikan menjadikan kesimpulan tidak boleh dipercayai.'), T('Fix: label the data as simulated, or collect real data.', 'Pembetulan: labelkan data sebagai simulasi, atau kumpul data sebenar.')), sp: 'm' };
    },
    (r) => { // population vs sample, and why a sample is used
      const c = r.pick(CATS);
      return { q: T(`A researcher wants to investigate an attribute of ${c[0]} but cannot collect data from every single one of them. Explain the difference between the population and a sample in this situation, and give one reason a well-chosen sample can still give a useful conclusion.`, `Seorang penyelidik ingin menyiasat satu atribut ${c[1]} tetapi tidak dapat mengumpul data daripada setiap seorang daripada mereka. Terangkan perbezaan antara populasi dan sampel dalam situasi ini, dan berikan satu sebab sampel yang dipilih dengan baik masih boleh memberikan kesimpulan yang berguna.`),
        a: T('The population is the entire group of interest; a sample is a smaller, manageable part of it. If the sample is chosen randomly and is large enough, its spread and centre should reasonably reflect the population’s, allowing a useful conclusion without measuring everyone.', 'Populasi ialah keseluruhan kumpulan yang dikaji; sampel ialah sebahagian kecil daripadanya yang lebih terurus. Jika sampel dipilih secara rawak dan cukup besar, serakan dan pusatnya sepatutnya mencerminkan populasi dengan munasabah, membolehkan kesimpulan berguna dibuat tanpa mengukur setiap orang.'), w: W(T(`Population = all ${c[0]}; sample = the part actually measured.`, `Populasi = semua ${c[1]}; sampel = bahagian yang benar-benar diukur.`), T('A random, large enough sample is representative, so its results can be generalised.', 'Sampel rawak yang cukup besar adalah mewakili, jadi keputusannya boleh digeneralisasikan.')), sp: 'm' };
    },
    (r) => { // overreach: causation vs association / overgeneralising a conclusion
      const over = r.pick([
        ['concludes that eating more of a certain food directly causes better exam marks, based only on a survey that found both tend to be higher together', 'membuat kesimpulan bahawa memakan lebih banyak sejenis makanan secara langsung menyebabkan markah peperiksaan lebih baik, hanya berdasarkan tinjauan yang mendapati kedua-duanya cenderung lebih tinggi bersama'],
        ['concludes that every student in the school shares the same opinion, based on a survey of only one class', 'membuat kesimpulan bahawa setiap murid di sekolah berkongsi pendapat yang sama, berdasarkan tinjauan hanya satu kelas'],
        ['claims the data prove a trend will continue next year, based on only two data points', 'mendakwa data itu membuktikan sesuatu arah aliran akan berterusan tahun depan, berdasarkan hanya dua titik data'],
      ]);
      return { q: T(`A report ${over[0]}. Explain why this conclusion goes beyond what the data support.`, `Satu laporan ${over[1]}. Terangkan mengapa kesimpulan ini melangkaui apa yang disokong oleh data.`),
        a: T('An association between two quantities, a small sample, or too few data points cannot by itself establish a cause, represent an entire population, or confirm a future trend; a supported conclusion must match the scope, size and design of the data actually collected.', 'Perkaitan antara dua kuantiti, sampel yang kecil, atau titik data yang terlalu sedikit tidak boleh dengan sendirinya membuktikan sebab, mewakili keseluruhan populasi, atau mengesahkan arah aliran masa depan; kesimpulan yang disokong mesti sepadan dengan skop, saiz dan reka bentuk data yang benar-benar dikumpul.'), w: W(T('Check the conclusion against the data: association is not cause, one class is not the whole school, two points are not a trend.', 'Semak kesimpulan dengan data: perkaitan bukan sebab, satu kelas bukan seluruh sekolah, dua titik bukan arah aliran.')), sp: 'm' };
    },
  ];
  SPM.extend('F4-8.1.1', { e: g811e, m: g811m, a: g811a });

  /* =============================================================== 8.1.2 Compare representations */
  const DOTCTX = [
    { en: 'the number of books read by students in a month', ms: 'bilangan buku yang dibaca oleh murid dalam sebulan', lo: 0, hi: 8 },
    { en: 'the number of siblings each student has', ms: 'bilangan adik-beradik yang dimiliki setiap murid', lo: 0, hi: 6 },
    { en: 'the number of pets owned by families in a survey', ms: 'bilangan haiwan peliharaan yang dimiliki oleh keluarga dalam satu tinjauan', lo: 0, hi: 6 },
    { en: 'the number of goals scored by a team in each match', ms: 'bilangan gol yang dijaringkan oleh sepasukan dalam setiap perlawanan', lo: 0, hi: 8 },
    { en: 'the number of hours students spend on homework each night', ms: 'bilangan jam murid meluangkan masa untuk kerja rumah setiap malam', lo: 0, hi: 6 },
    { en: 'the rating (out of 10) given by customers for a service', ms: 'penilaian (daripada 10) yang diberikan oleh pelanggan bagi suatu perkhidmatan', lo: 1, hi: 10 },
    { en: 'the number of correct answers out of 10 in a spelling test', ms: 'bilangan jawapan betul daripada 10 dalam satu ujian ejaan', lo: 0, hi: 10 },
    { en: 'the number of text messages sent by students in an hour', ms: 'bilangan mesej teks yang dihantar oleh murid dalam sejam', lo: 0, hi: 8 },
    { en: 'the number of absences of students in a term', ms: 'bilangan ketidakhadiran murid dalam satu penggal', lo: 0, hi: 7 },
    { en: 'the number of cups of water drunk by students in a school day', ms: 'bilangan cawan air yang diminum murid dalam sehari persekolahan', lo: 1, hi: 8 },
  ];
  const STEMCTX = CTX.filter((c) => c.lo >= 10 && c.hi <= 99).concat([
    { en: 'the mass (in grams) of eggs collected from a farm', ms: 'jisim (dalam gram) telur yang dikumpul daripada sebuah ladang', lo: 40, hi: 70 },
    { en: 'the number of visitors to a museum each day', ms: 'bilangan pengunjung ke sebuah muzium setiap hari', lo: 10, hi: 90 },
  ]);
  const genGroup = (r, c, k) => retry(() => { const v = rnd(r, k, c.lo, c.hi); need(new Set(v).size >= 3 && Math.max(...v) - Math.min(...v) >= 3); return v; });
  const g812e = [
    (r) => { // two dot plots by eye -- more spread out
      const c = r.pick(DOTCTX), a = genGroup(r, c, 9), b = genGroup(r, c, 9);
      const fig = dotFig([{ label: 'A', values: a }, { label: 'B', values: b }], c.lo, c.hi);
      const ra = Math.max(...a) - Math.min(...a), rb = Math.max(...b) - Math.min(...b);
      need(ra !== rb);
      return { q: T(`The dot plots compare ${c.en} for Group A and Group B on the same scale. State which group's data is more spread out (dispersed), and support your answer with the range of each group.`, `Plot titik membandingkan ${c.ms} bagi Kumpulan A dan Kumpulan B pada skala yang sama. Nyatakan kumpulan yang datanya lebih bertaburan (berserak), dan sokong jawapan anda dengan julat setiap kumpulan.`), fig,
        a: T(`Range: A $= ${ra}$, B $= ${rb}$. Group ${ra > rb ? 'A' : 'B'} is more spread out.`, `Julat: A $= ${ra}$, B $= ${rb}$. Kumpulan ${ra > rb ? 'A' : 'B'} lebih bertaburan.`), w: W(rangeW(a, 'A'), rangeW(b, 'B'), T(`The larger range means the data are more spread out: Group ${ra > rb ? 'A' : 'B'}.`, `Julat lebih besar bermaksud data lebih bertaburan: Kumpulan ${ra > rb ? 'A' : 'B'}.`)), sp: 'm' };
    },
    (r) => { // stem-leaf key reading
      const c = r.pick(STEMCTX), v = genGroup(r, c, 10);
      const fig = stemLeaf(v);
      const s = sortNum(v);
      const task = r.pick(['count', 'min', 'max']);
      const q = task === 'count' ? T('How many data values are recorded in this stem-and-leaf plot?', 'Berapakah bilangan nilai data yang direkodkan dalam plot batang-dan-daun ini?')
        : task === 'min' ? T('What is the smallest value recorded in this stem-and-leaf plot?', 'Apakah nilai terkecil yang direkodkan dalam plot batang-dan-daun ini?')
        : T('What is the largest value recorded in this stem-and-leaf plot?', 'Apakah nilai terbesar yang direkodkan dalam plot batang-dan-daun ini?');
      return { q: T(`The stem-and-leaf plot shows ${c.en}. ${q.en}`, `Plot batang-dan-daun menunjukkan ${c.ms}. ${q.ms}`), fig,
        a: T(String(task === 'count' ? v.length : task === 'min' ? s[0] : s[s.length - 1]), String(task === 'count' ? v.length : task === 'min' ? s[0] : s[s.length - 1])),
        w: W(task === 'count' ? T(`Each leaf is one value; count all the leaves: $${v.length}$`, `Setiap daun ialah satu nilai; kira semua daun: $${v.length}$`)
          : task === 'min' ? T(`Smallest value = first leaf of the lowest stem: stem $${Math.floor(s[0] / 10)}$, leaf $${s[0] % 10}$, i.e. $${s[0]}$`, `Nilai terkecil = daun pertama pada batang terendah: batang $${Math.floor(s[0] / 10)}$, daun $${s[0] % 10}$, iaitu $${s[0]}$`)
          : T(`Largest value = last leaf of the highest stem: stem $${Math.floor(s[s.length - 1] / 10)}$, leaf $${s[s.length - 1] % 10}$, i.e. $${s[s.length - 1]}$`, `Nilai terbesar = daun terakhir pada batang tertinggi: batang $${Math.floor(s[s.length - 1] / 10)}$, daun $${s[s.length - 1] % 10}$, iaitu $${s[s.length - 1]}$`)), sp: 's' };
    },
    (r) => { // single dot plot -- mode / range
      const c = r.pick(DOTCTX), v = genGroup(r, c, 10);
      const cnt = {}; v.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1));
      const mode = Object.keys(cnt).reduce((best, k) => (cnt[k] > cnt[best] ? k : best), String(v[0]));
      const fig = dotFig([{ values: v }], c.lo, c.hi);
      const task = r.pick(['mode', 'range']);
      const md = mode1(v);
      need(task !== 'mode' || md);
      return { q: T(`The dot plot shows ${c.en}. State the ${task === 'mode' ? 'mode' : 'range'} of the data.`, `Plot titik menunjukkan ${c.ms}. Nyatakan ${task === 'mode' ? 'mod' : 'julat'} data itu.`), fig,
        a: T(String(task === 'mode' ? mode : Math.max(...v) - Math.min(...v)), String(task === 'mode' ? mode : Math.max(...v) - Math.min(...v))),
        w: W(task === 'mode' ? T(`The tallest column of dots is at $${mode}$ ($${cnt[mode]}$ dots), so the mode is $${mode}$.`, `Lajur titik paling tinggi berada pada $${mode}$ ($${cnt[mode]}$ titik), jadi mod ialah $${mode}$.`) : rangeW(v)), sp: 's' };
    },
    (r) => { // eyeball which group has higher typical (mode) cluster
      const c = r.pick(DOTCTX), a = genGroup(r, c, 9), b = genGroup(r, c, 9);
      const fig = dotFig([{ label: 'A', values: a }, { label: 'B', values: b }], c.lo, c.hi);
      const cntOf = (v) => { const cnt = {}; v.forEach((x) => (cnt[x] = (cnt[x] || 0) + 1)); return +Object.keys(cnt).reduce((best, k) => (cnt[k] > cnt[best] ? k : best), String(v[0])); };
      const ma = cntOf(a), mb = cntOf(b);
      need(ma !== mb && mode1(a) && mode1(b));
      return { q: T(`Without calculating, use the dot plots of ${c.en} to state which group, A or B, appears to have the higher typical (most common) value.`, `Tanpa mengira, gunakan plot titik bagi ${c.ms} untuk menyatakan kumpulan yang manakah, A atau B, kelihatan mempunyai nilai tipikal (paling kerap) yang lebih tinggi.`), fig,
        a: T(`Group ${ma > mb ? 'A' : 'B'} (its cluster of dots is centred at a higher value).`, `Kumpulan ${ma > mb ? 'A' : 'B'} (kelompok titiknya berpusat pada nilai yang lebih tinggi).`), w: W(T(`Tallest column of dots: A at $${ma}$, B at $${mb}$.`, `Lajur titik paling tinggi: A pada $${ma}$, B pada $${mb}$.`), T(`$${Math.max(ma, mb)} > ${Math.min(ma, mb)}$, so Group ${ma > mb ? 'A' : 'B'} has the higher typical value.`, `$${Math.max(ma, mb)} > ${Math.min(ma, mb)}$, jadi Kumpulan ${ma > mb ? 'A' : 'B'} mempunyai nilai tipikal lebih tinggi.`)), sp: 's' };
    },
    (r) => { // back-to-back stem-leaf, inspect which side has more values above a threshold
      const c = r.pick(STEMCTX), a = genGroup(r, c, 9), b = genGroup(r, c, 9);
      const fig = stemLeaf(a, b);
      const thr = Math.round((c.lo + c.hi) / 2 / 10) * 10;
      need(thr > c.lo && thr < c.hi);
      const na = a.filter((x) => x > thr).length, nb = b.filter((x) => x > thr).length;
      need(na !== nb);
      return { q: T(`The back-to-back stem-and-leaf plot compares ${c.en} for Group A (left) and Group B (right). Which group has more values above ${thr}?`, `Plot batang-dan-daun belakang-ke-belakang membandingkan ${c.ms} bagi Kumpulan A (kiri) dan Kumpulan B (kanan). Kumpulan manakah mempunyai lebih banyak nilai melebihi ${thr}?`), fig,
        a: T(`Group ${na > nb ? 'A' : 'B'}: ${na} value${na === 1 ? '' : 's'} above ${thr} for A, ${nb} for B.`, `Kumpulan ${na > nb ? 'A' : 'B'}: ${na} nilai melebihi ${thr} bagi A, ${nb} bagi B.`),
        w: W(...[['A', a, na], ['B', b, nb]].map(([g, v, k]) => { const up = sortNum(v.filter((x) => x > thr)); return k ? T(`${g}: values above $${thr}$ are $${list(up)}$, i.e. $${k}$ values`, `${g}: nilai melebihi $${thr}$ ialah $${list(up)}$, iaitu $${k}$ nilai`) : T(`${g}: no values above $${thr}$`, `${g}: tiada nilai melebihi $${thr}$`); })), sp: 'm' };
    },
  ];
  const g812m = [
    (r) => { // construct + compare median & range, dot plot or stem-leaf chosen at random
      const useStem = r.chance();
      const c = r.pick(useStem ? STEMCTX : DOTCTX);
      const a = genGroup(r, c, useStem ? 9 : 8), b = genGroup(r, c, useStem ? 9 : 8);
      need(rg(a) !== rg(b));
      const fig = useStem ? stemLeaf(a, b) : dotFig([{ label: 'A', values: a }, { label: 'B', values: b }], c.lo, c.hi);
      const rep = useStem ? T('back-to-back stem-and-leaf plot', 'plot batang-dan-daun belakang-ke-belakang') : T('pair of dot plots', 'pasangan plot titik');
      return { q: T(`The ${rep.en} shows ${c.en} for Group A and Group B. Compare the median and the range of the two groups, and state which group is more consistent.`, `${SPM.cap ? SPM.cap(rep.ms) : rep.ms} menunjukkan ${c.ms} bagi Kumpulan A dan Kumpulan B. Bandingkan median dan julat kedua-dua kumpulan, dan nyatakan kumpulan yang lebih konsisten.`), fig,
        a: T(`Median: A $= ${n(median(a))}$, B $= ${n(median(b))}$. Range: A $= ${Math.max(...a) - Math.min(...a)}$, B $= ${Math.max(...b) - Math.min(...b)}$. ${(Math.max(...a) - Math.min(...a)) <= (Math.max(...b) - Math.min(...b)) ? 'A' : 'B'} has the smaller range, so it is more consistent.`, `Median: A $= ${n(median(a))}$, B $= ${n(median(b))}$. Julat: A $= ${Math.max(...a) - Math.min(...a)}$, B $= ${Math.max(...b) - Math.min(...b)}$. ${(Math.max(...a) - Math.min(...a)) <= (Math.max(...b) - Math.min(...b)) ? 'A' : 'B'} mempunyai julat yang lebih kecil, jadi lebih konsisten.`),
        w: W(medW(a, 'A'), medW(b, 'B'), rangeW(a, 'A'), rangeW(b, 'B'), T(`Smaller range = less dispersion = more consistent: Group ${rg(a) < rg(b) ? 'A' : 'B'}.`, `Julat lebih kecil = kurang serakan = lebih konsisten: Kumpulan ${rg(a) < rg(b) ? 'A' : 'B'}.`)), sp: 'l' };
    },
    (r) => { // identify unusual value / gap
      const c = r.pick(DOTCTX);
      const core = genGroup(r, c, 8);
      need(c.hi - c.lo >= 5);
      const out = r.pick([c.lo, c.hi]);
      need(Math.abs(out - median(core)) >= 3 && core.every((x) => Math.abs(x - out) >= 2));
      const v = core.concat([out]);
      const fig = dotFig([{ values: v }], c.lo, c.hi);
      return { q: T(`The dot plot shows ${c.en}. One value is noticeably separated from the rest. Identify this unusual value, and describe how it affects the overall spread of the data compared with the rest of the data.`, `Plot titik menunjukkan ${c.ms}. Satu nilai jelas terasing daripada yang lain. Kenal pasti nilai luar biasa ini, dan huraikan bagaimana ia menjejaskan serakan keseluruhan data berbanding data yang lain.`), fig,
        a: T(`The unusual value is ${out}. It lies far from the main cluster of the data, so it stretches the range and makes the overall spread noticeably larger than that of the main cluster alone.`, `Nilai luar biasa itu ialah ${out}. Ia terletak jauh daripada kelompok utama data, jadi ia meregangkan julat dan menjadikan serakan keseluruhan jelas lebih besar berbanding kelompok utama sahaja.`),
        w: W(T(`The main cluster lies from $${Math.min(...core)}$ to $${Math.max(...core)}$; $${out}$ stands apart with a gap.`, `Kelompok utama terletak dari $${Math.min(...core)}$ hingga $${Math.max(...core)}$; $${out}$ terasing dengan satu jurang.`), T(`Range with it $= ${Math.max(...v)} - ${Math.min(...v)} = ${rg(v)}$; without it $= ${Math.max(...core)} - ${Math.min(...core)} = ${rg(core)}$.`, `Julat dengannya $= ${Math.max(...v)} - ${Math.min(...v)} = ${rg(v)}$; tanpanya $= ${Math.max(...core)} - ${Math.min(...core)} = ${rg(core)}$.`)), sp: 'm' };
    },
    (r) => { // common scale requirement + one qualitative feature not in summary stats
      const c = r.pick(r.chance() ? DOTCTX : STEMCTX);
      const rep = c.hi <= 10 ? T('dot plots', 'plot titik') : T('stem-and-leaf plots', 'plot batang-dan-daun');
      return { q: T(`Two ${rep.en} comparing ${c.en} for two groups are drawn using the same scale and the same key. Explain why using a common scale is necessary for the comparison to be fair, and name one feature (a cluster, a gap or an unusual value) that a ${rep.en.replace(/s$/, '')} can reveal but a single summary statistic such as the mean cannot.`, `Dua ${rep.ms} yang membandingkan ${c.ms} bagi dua kumpulan dilukis menggunakan skala yang sama dan kunci yang sama. Terangkan mengapa penggunaan skala yang sama diperlukan supaya perbandingan itu adil, dan namakan satu ciri (kelompok, jurang atau nilai luar biasa) yang dapat didedahkan oleh ${rep.ms} tetapi tidak oleh satu statistik ringkasan seperti min.`),
        a: T('A common scale ensures the visual distance between points fairly reflects the actual difference in values, so neither group looks artificially more or less spread out; a plot can show clusters, gaps or unusual values, which a single number like the mean hides.', 'Skala yang sama memastikan jarak visual antara titik mencerminkan perbezaan nilai sebenar dengan adil, jadi tiada kumpulan yang kelihatan lebih atau kurang bertaburan secara tidak sebenar; satu plot boleh menunjukkan kelompok, jurang atau nilai luar biasa, yang disembunyikan oleh satu nombor seperti min.'), w: W(T('Spread is judged from the distance between points, which depends on the scale, so both plots need the same scale and key.', 'Serakan dinilai daripada jarak antara titik, yang bergantung pada skala, jadi kedua-dua plot memerlukan skala dan kunci yang sama.'), T('The mean is one number: it cannot show where values cluster, where gaps are, or which value is unusual.', 'Min ialah satu nombor: ia tidak dapat menunjukkan di mana nilai berkelompok, di mana jurang wujud, atau nilai yang luar biasa.')), sp: 'm' };
    },
    (r) => { // back-to-back stem-leaf: median/mode/range directly from plot
      const c = r.pick(STEMCTX), a = genGroup(r, c, 9), b = genGroup(r, c, 9);
      need(median(a) !== median(b));
      const fig = stemLeaf(a, b);
      return { q: T(`The back-to-back stem-and-leaf plot compares ${c.en} for Group A (left) and Group B (right). State the median of each group and hence say which group has the higher typical value.`, `Plot batang-dan-daun belakang-ke-belakang membandingkan ${c.ms} bagi Kumpulan A (kiri) dan Kumpulan B (kanan). Nyatakan median setiap kumpulan dan seterusnya katakan kumpulan yang manakah mempunyai nilai tipikal lebih tinggi.`), fig,
        a: T(`Median: A $= ${n(median(a))}$, B $= ${n(median(b))}$. Group ${median(a) >= median(b) ? 'A' : 'B'} has the higher typical value.`, `Median: A $= ${n(median(a))}$, B $= ${n(median(b))}$. Kumpulan ${median(a) >= median(b) ? 'A' : 'B'} mempunyai nilai tipikal lebih tinggi.`),
        w: W(T('Group A leaves are read from right to left (outwards from the stem).', 'Daun Kumpulan A dibaca dari kanan ke kiri (keluar dari batang).'), medW(a, 'A'), medW(b, 'B'), T(`The higher median is Group ${median(a) > median(b) ? 'A' : 'B'}.`, `Median lebih tinggi ialah Kumpulan ${median(a) > median(b) ? 'A' : 'B'}.`)), sp: 'm' };
    },
  ];
  const g812a = [
    (r) => { // full comparison: median, range, cluster/gap/unusual value, overlap
      const c = r.pick(STEMCTX);
      const a = genGroup(r, c, 8).concat([r.pick([c.lo, c.hi])]);
      const odd = a[a.length - 1];
      need(a.slice(0, -1).every((x) => Math.abs(x - odd) >= 5));
      const b = genGroup(r, c, 9);
      const fig = stemLeaf(a, b);
      const qa = quart(a), qb = quart(b);
      const overlap = Math.max(0, Math.min(qa.max, qb.max) - Math.max(qa.min, qb.min));
      return { q: T(`The back-to-back stem-and-leaf plot compares ${c.en} for Group A (left, includes an unusual value) and Group B (right). Compare the median and range of the two groups, identify the unusual value in Group A, and state whether the two groups' ranges of values overlap.`, `Plot batang-dan-daun belakang-ke-belakang membandingkan ${c.ms} bagi Kumpulan A (kiri, mengandungi satu nilai luar biasa) dan Kumpulan B (kanan). Bandingkan median dan julat kedua-dua kumpulan, kenal pasti nilai luar biasa dalam Kumpulan A, dan nyatakan sama ada julat nilai kedua-dua kumpulan bertindih.`), fig,
        a: T(`Median: A $= ${n(median(a))}$, B $= ${n(median(b))}$. Range: A $= ${qa.max - qa.min}$, B $= ${qb.max - qb.min}$. Unusual value in A: ${a[a.length - 1]}. The ranges ${overlap > 0 ? `overlap (by about ${n(overlap)})` : 'do not overlap'}.`, `Median: A $= ${n(median(a))}$, B $= ${n(median(b))}$. Julat: A $= ${qa.max - qa.min}$, B $= ${qb.max - qb.min}$. Nilai luar biasa dalam A: ${a[a.length - 1]}. Julat kedua-dua kumpulan ${overlap > 0 ? `bertindih (lebih kurang ${n(overlap)})` : 'tidak bertindih'}.`),
        w: W(medW(a, 'A'), medW(b, 'B'), rangeW(a, 'A'), rangeW(b, 'B'), T(`$${odd}$ is separated from the other values of A by a gap, so it is the unusual value.`, `$${odd}$ terasing daripada nilai lain A oleh satu jurang, jadi ia nilai luar biasa.`),
          T(`A spans $${qa.min}$ to $${qa.max}$, B spans $${qb.min}$ to $${qb.max}$` + (overlap > 0 ? `: common part $${Math.max(qa.min, qb.min)}$ to $${Math.min(qa.max, qb.max)}$.` : ': no common part.'), `A merangkumi $${qa.min}$ hingga $${qa.max}$, B merangkumi $${qb.min}$ hingga $${qb.max}$` + (overlap > 0 ? `: bahagian sepunya $${Math.max(qa.min, qb.min)}$ hingga $${Math.min(qa.max, qb.max)}$.` : ': tiada bahagian sepunya.'))), sp: 'l' };
    },
    (r) => { // match data to the correct dot plot among two candidates
      const c = r.pick(DOTCTX), v = genGroup(r, c, 8);
      const s = sortNum(v);
      const bad = v.slice(); const idx = r.int(0, bad.length - 1);
      let nv; do { nv = r.int(c.lo, c.hi); } while (nv === bad[idx]);
      bad[idx] = nv;
      const order = r.chance();
      const A = dotFig([{ label: '1', values: order ? v : bad }], c.lo, c.hi);
      const B = dotFig([{ label: '2', values: order ? bad : v }], c.lo, c.hi);
      const correctLabel = order ? '1' : '2';
      return { q: T(`The data set is $${list(s)}$ (${c.en}). Two dot plots, 1 and 2, are shown below; only one correctly represents this data. State which one is correct, and identify the one error in the other.`, `Set data ialah $${list(s)}$ (${c.ms}). Dua plot titik, 1 dan 2, ditunjukkan di bawah; hanya satu yang mewakili data ini dengan betul. Nyatakan yang manakah betul, dan kenal pasti satu kesilapan pada plot yang satu lagi.`), fig: A + B,
        a: T(`Plot ${correctLabel} is correct. The other plot has the value ${bad[idx]} instead of ${v[idx]} (one point is in the wrong position).`, `Plot ${correctLabel} adalah betul. Plot yang satu lagi mempunyai nilai ${bad[idx]} dan bukan ${v[idx]} (satu titik berada pada kedudukan yang salah).`),
        w: W(T('Count the dots above each value and compare with the data list.', 'Kira titik di atas setiap nilai dan bandingkan dengan senarai data.'), T(`Plot ${correctLabel === '1' ? '2' : '1'} has one dot too many at $${bad[idx]}$ and one too few at $${v[idx]}$, so Plot ${correctLabel} is correct.`, `Plot ${correctLabel === '1' ? '2' : '1'} mempunyai satu titik terlebih pada $${bad[idx]}$ dan satu titik terkurang pada $${v[idx]}$, jadi Plot ${correctLabel} betul.`)), sp: 'l' };
    },
    (r) => { // critique different-scale comparison then redo numerically
      const c = r.pick(STEMCTX);
      const a = genGroup(r, c, 9), b = genGroup(r, c, 9);
      const ra = Math.max(...a) - Math.min(...a), rb = Math.max(...b) - Math.min(...b);
      need(ra !== rb);
      const fig = stemLeaf(a, b);
      return { q: T(`A student compares Group A and Group B by looking at two separate dot plots drawn with different axis scales, and concludes (wrongly) that the group whose plot looks visually wider must have the larger range. The actual data are shown in the back-to-back stem-and-leaf plot below, on a common scale. Explain the flaw in the student's method, then use the plot to state the correct range of each group and which group is really more spread out.`, `Seorang murid membandingkan Kumpulan A dan Kumpulan B dengan melihat dua plot titik berasingan yang dilukis dengan skala paksi yang berbeza, dan membuat kesimpulan (salah) bahawa kumpulan yang plotnya kelihatan lebih lebar secara visual pasti mempunyai julat yang lebih besar. Data sebenar ditunjukkan dalam plot batang-dan-daun belakang-ke-belakang di bawah, pada skala yang sama. Terangkan kelemahan kaedah murid itu, kemudian gunakan plot itu untuk menyatakan julat sebenar setiap kumpulan dan kumpulan manakah yang sebenarnya lebih bertaburan.`), fig,
        a: T(`Different axis scales make visual width unreliable for comparing spread. From the plot (common scale): range A $= ${ra}$, range B $= ${rb}$. Group ${ra > rb ? 'A' : 'B'} is really more spread out.`, `Skala paksi yang berbeza menjadikan lebar visual tidak boleh dipercayai untuk membandingkan serakan. Daripada plot (skala sama): julat A $= ${ra}$, julat B $= ${rb}$. Kumpulan ${ra > rb ? 'A' : 'B'} sebenarnya lebih bertaburan.`),
        w: W(T('Visual width depends on the scale chosen, so plots must share a scale before spread is compared.', 'Lebar visual bergantung pada skala yang dipilih, jadi plot mesti berkongsi skala sebelum serakan dibandingkan.'), rangeW(a, 'A'), rangeW(b, 'B'), T(`Larger range: Group ${ra > rb ? 'A' : 'B'}.`, `Julat lebih besar: Kumpulan ${ra > rb ? 'A' : 'B'}.`)), sp: 'l' };
    },
    (r) => { // dot plots: gap/cluster + overlap discussion
      const c = r.pick(DOTCTX);
      const a = genGroup(r, c, 8), b = genGroup(r, c, 8);
      const fig = dotFig([{ label: 'A', values: a }, { label: 'B', values: b }], c.lo, c.hi);
      const qa = quart(a), qb = quart(b);
      const overlap = Math.max(0, Math.min(qa.max, qb.max) - Math.max(qa.min, qb.min));
      return { q: T(`The dot plots compare ${c.en} for Group A and Group B on the same scale. Describe the overall shape of each group's dots (whether tightly clustered, evenly spread, or containing gaps), compare their ranges, and state whether the two groups' values overlap.`, `Plot titik membandingkan ${c.ms} bagi Kumpulan A dan Kumpulan B pada skala yang sama. Huraikan bentuk keseluruhan titik setiap kumpulan (sama ada terkumpul rapat, tersebar sekata, atau mengandungi jurang), bandingkan julat mereka, dan nyatakan sama ada nilai kedua-dua kumpulan bertindih.`), fig,
        a: T(`Range: A $= ${qa.max - qa.min}$, B $= ${qb.max - qb.min}$. The values of A and B ${overlap > 0 ? `overlap, over about ${n(overlap)} unit(s)` : 'do not overlap'}; describe each group's dots as clustered, evenly spread or gapped by direct inspection of the plot.`, `Julat: A $= ${qa.max - qa.min}$, B $= ${qb.max - qb.min}$. Nilai A dan B ${overlap > 0 ? `bertindih, sekitar ${n(overlap)} unit` : 'tidak bertindih'}; huraikan titik setiap kumpulan sebagai terkumpul, tersebar sekata atau berjurang berdasarkan pemeriksaan terus plot itu.`),
        w: W(rangeW(a, 'A'), rangeW(b, 'B'), T(`A spans $${qa.min}$ to $${qa.max}$, B spans $${qb.min}$ to $${qb.max}$` + (overlap > 0 ? `: both contain $${Math.max(qa.min, qb.min)}$ to $${Math.min(qa.max, qb.max)}$, so they overlap.` : ', so they do not overlap.'), `A merangkumi $${qa.min}$ hingga $${qa.max}$, B merangkumi $${qb.min}$ hingga $${qb.max}$` + (overlap > 0 ? `: kedua-duanya mengandungi $${Math.max(qa.min, qb.min)}$ hingga $${Math.min(qa.max, qb.max)}$, jadi bertindih.` : ', jadi tidak bertindih.'))), sp: 'l' };
    },
  ];
  SPM.extend('F4-8.1.2', { e: g812e, m: g812m, a: g812a });

  /* =============================================================== 8.2.1 Measures of dispersion */
  const FREQCTX = [
    { en: 'the number of siblings of students in a class', ms: 'bilangan adik-beradik murid dalam satu kelas', xEn: 'Number of siblings ($x$)', xMs: 'Bilangan adik-beradik ($x$)', xs: [0, 1, 2, 3, 4] },
    { en: 'the number of pets owned by families surveyed', ms: 'bilangan haiwan peliharaan yang dimiliki keluarga yang ditinjau', xEn: 'Number of pets ($x$)', xMs: 'Bilangan haiwan peliharaan ($x$)', xs: [0, 1, 2, 3] },
    { en: 'the number of goals scored by a team in matches this season', ms: 'bilangan gol yang dijaringkan oleh sepasukan dalam perlawanan musim ini', xEn: 'Goals ($x$)', xMs: 'Gol ($x$)', xs: [0, 1, 2, 3, 4] },
    { en: 'the number of books read by students in a month', ms: 'bilangan buku yang dibaca murid dalam sebulan', xEn: 'Books read ($x$)', xMs: 'Buku dibaca ($x$)', xs: [0, 1, 2, 3, 4] },
    { en: 'the number of correct answers in a 5-question quiz', ms: 'bilangan jawapan betul dalam kuiz 5 soalan', xEn: 'Correct answers ($x$)', xMs: 'Jawapan betul ($x$)', xs: [1, 2, 3, 4, 5] },
    { en: 'the number of hours of homework done by students each night', ms: 'bilangan jam kerja rumah yang dilakukan murid setiap malam', xEn: 'Hours ($x$)', xMs: 'Jam ($x$)', xs: [0, 1, 2, 3, 4] },
    { en: 'the number of cars sold by a dealer each day', ms: 'bilangan kereta yang dijual oleh sebuah peniaga setiap hari', xEn: 'Cars sold ($x$)', xMs: 'Kereta dijual ($x$)', xs: [0, 1, 2, 3, 4] },
  ];
  const freqTbl = (c, fs) => T(table([['Frequency ($f$)', ...fs]], { head: [c.xEn, ...c.xs] }), table([['Kekerapan ($f$)', ...fs]], { head: [c.xMs, ...c.xs] }));
  const genFreq = (r, c) => retry(() => { const fs = c.xs.map(() => r.int(1, 6)); need(sum(fs) >= 8); const v = c.xs.flatMap((x, i) => Array(fs[i]).fill(x)); return { fs, v }; });
  const UNITX = [['cm', 'cm'], ['kg', 'kg'], ['minutes', 'minit'], ['marks', 'markah'], ['RM', 'RM']];

  const g821e = [
    (r) => { // range only
      const c = r.pick(CTX), v = genGroup(r, c, r.int(6, 9));
      return { q: T(`Find the range of the data on ${c.en}: $${list(sortNum(v))}$.`, `Cari julat bagi data ${c.ms}: $${list(sortNum(v))}$.`), a: T(`$${Math.max(...v) - Math.min(...v)}$`), w: W(rangeW(v)), sp: 's' };
    },
    (r) => { // Q1 and Q3 only (no IQR asked)
      const c = r.pick(CTX), v = genGroup(r, c, r.int(6, 9)), q = quart(v);
      return { q: T(`The data on ${c.en} are $${list(sortNum(v))}$ (already in order). State $Q_1$ and $Q_3$.`, `Data ${c.ms} ialah $${list(sortNum(v))}$ (telah tersusun). Nyatakan $Q_1$ dan $Q_3$.`), a: T(`$Q_1 = ${n(q.q1)}$, $Q_3 = ${n(q.q3)}$`), w: W(...quartW(v)), sp: 's' };
    },
    (r) => { // IQR only
      const v = rnd(r, r.pick([7, 8, 9]), 5, 45), q = quart(v);
      return { q: T(`The data $${list(v)}$ are listed. Find the interquartile range.`, `Data $${list(v)}$ disenaraikan. Cari julat antara kuartil.`), a: T(`Ordered: $${list(sortNum(v))}$. $Q_1 = ${n(q.q1)}$, $Q_3 = ${n(q.q3)}$, IQR $= ${n(q.q3 - q.q1)}$`, `Tertib: $${list(sortNum(v))}$. $Q_1 = ${n(q.q1)}$, $Q_3 = ${n(q.q3)}$, JAK $= ${n(q.q3 - q.q1)}$`), w: W(...quartW(v, null, true), iqrW(v)), sp: 's' };
    },
    (r) => { // variance/sd plug straight from N, Sx, Sxx (small, easy numbers)
      const N = r.pick([4, 5]), sx = r.int(N * 3, N * 8), sxx = sum(rnd(r, N, 2, 9).map((x) => x * x)) + sx; // ensure sxx large enough for a sensible variance
      const m = sx / N, vr = sxx / N - m * m;
      need(vr > 0);
      return { q: T(`For a set of $${N}$ numbers, $\\sum x = ${sx}$ and $\\sum x^2 = ${sxx}$. Find the variance.`, `Bagi satu set $${N}$ nombor, $\\sum x = ${sx}$ dan $\\sum x^2 = ${sxx}$. Cari varians.`), a: T(`$\\dfrac{${sxx}}{${N}} - \\left(\\dfrac{${sx}}{${N}}\\right)^2 = ${f2(vr)}$`), w: W(...varW(N, sx, sxx, { noSums: true })), sp: 's' };
    },
    (r) => { // units
      const u = r.pick(UNITX), m = r.pick(['range', 'IQR', 'standard deviation', 'variance']);
      const mm = { range: T('range', 'julat'), IQR: T('interquartile range', 'julat antara kuartil'), 'standard deviation': T('standard deviation', 'sisihan piawai'), variance: T('variance', 'varians') }[m];
      const ans = m === 'variance' ? T(`${u[0]}$^2$`, `${u[1]}$^2$`) : T(u[0], u[1]);
      return { q: T(`A data set is measured in ${u[0]}. What is the unit of the ${mm.en}?`, `Satu set data diukur dalam ${u[1]}. Apakah unit bagi ${mm.ms}?`), a: ans, w: W(T('Range, interquartile range and standard deviation have the same unit as the data; the variance is a square, so its unit is squared.', 'Julat, julat antara kuartil dan sisihan piawai mempunyai unit yang sama dengan data; varians ialah kuasa dua, jadi unitnya kuasa dua.')), sp: 'xs' };
    },
    (r) => { // interpret sd (MCQ)
      const c = r.pick(CTX), sdv = r.pick([2, 3, 4, 5, 6]), meanv = r.int(20, 40);
      const opts = r.shuffle([
        T(`the values typically differ from the mean (${meanv}) by about ${sdv}`, `nilai biasanya berbeza daripada min (${meanv}) sebanyak lebih kurang ${sdv}`),
        T(`all the values lie between $0$ and ${sdv}`, `semua nilai terletak antara $0$ dan ${sdv}`),
        T(`half of the values are below ${sdv}`, `separuh daripada nilai berada di bawah ${sdv}`),
        T(`the most frequent value is ${sdv}`, `nilai paling kerap ialah ${sdv}`),
      ]);
      const letters = ['A', 'B', 'C', 'D'];
      const correctIdx = opts.findIndex((o) => o.en.startsWith('the values typically'));
      const mk = (k) => opts.map((o, i) => `${letters[i]}. ${o[k]}`).join('<br>');
      return { q: T(`For ${c.en}, the mean is ${meanv} and the standard deviation is ${sdv}. Which statement best interprets the standard deviation?<br>${mk('en')}`, `Bagi ${c.ms}, min ialah ${meanv} dan sisihan piawai ialah ${sdv}. Pernyataan manakah yang paling tepat mentafsir sisihan piawai itu?<br>${mk('ms')}`), a: T(`${letters[correctIdx]}`, `${letters[correctIdx]}`), w: W(T(`The standard deviation measures how far the values typically lie from the mean, so ${letters[correctIdx]}.`, `Sisihan piawai mengukur jarak biasa nilai-nilai dari min, jadi ${letters[correctIdx]}.`), T('It is not a bound on the values, a median or a mode.', 'Ia bukan had bagi nilai, bukan median dan bukan mod.')), sp: 's' };
    },
    (r) => { // read mean & Sf from a frequency table (no variance yet)
      const c = r.pick(FREQCTX), { fs, v } = genFreq(r, c);
      const fig = freqTbl(c, fs);
      return { q: T(`The table shows ${c.en}.<br>${fig.en}<br>Find $\\sum f$ and the mean.`, `Jadual menunjukkan ${c.ms}.<br>${fig.ms}<br>Cari $\\sum f$ dan min.`), a: T(`$\\sum f = ${sum(fs)}$; mean $= ${f2(mean(v))}$`, `$\\sum f = ${sum(fs)}$; min $= ${f2(mean(v))}$`),
        w: W(`$\\sum f = ${fs.join(' + ')} = ${sum(fs)}$`, `$\\sum fx = ${c.xs.map((x, i) => `${x}(${fs[i]})`).join(' + ')} = ${sum(v)}$`, T(`Mean $= \\dfrac{\\sum fx}{\\sum f} = \\dfrac{${sum(v)}}{${sum(fs)}} ${eq2(mean(v))} ${f2(mean(v))}$`, `Min $= \\dfrac{\\sum fx}{\\sum f} = \\dfrac{${sum(v)}}{${sum(fs)}} ${eq2(mean(v))} ${f2(mean(v))}$`)), sp: 'm' };
    },
  ];
  const g821m = [
    (r) => { // all four measures + short interpretation
      const c = r.pick(CTX), v = genGroup(r, c, r.int(7, 9));
      const q = quart(v);
      return { q: T(`For the data on ${c.en}, $${list(sortNum(v))}$, find the range, the interquartile range, the variance and the standard deviation (2 decimal places).`, `Bagi data ${c.ms}, $${list(sortNum(v))}$, cari julat, julat antara kuartil, varians dan sisihan piawai (2 tempat perpuluhan).`),
        a: T(`Range $= ${q.max - q.min}$; IQR $= ${n(q.q3 - q.q1)}$; variance $= ${f2(varp(v))}$; s.d. $= ${f2(sd(v))}$`, `Julat $= ${q.max - q.min}$; JAK $= ${n(q.q3 - q.q1)}$; varians $= ${f2(varp(v))}$; s.p. $= ${f2(sd(v))}$`),
        w: W(rangeW(v), ...quartW(v), iqrW(v), ...varV(v, { sd: true })), sp: 'l' };
    },
    (r) => { // frequency table: mean and variance/sd via shortcut formula
      const c = r.pick(FREQCTX), { fs, v } = genFreq(r, c);
      const fig = freqTbl(c, fs);
      const sfx = sum(c.xs.map((x, i) => x * fs[i])), sfxx = sum(c.xs.map((x, i) => x * x * fs[i]));
      return { q: T(`The table shows ${c.en}.<br>${fig.en}<br>Find the mean and the variance, using $\\sigma^2 = \\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2$.`, `Jadual menunjukkan ${c.ms}.<br>${fig.ms}<br>Cari min dan varians, menggunakan $\\sigma^2 = \\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2$.`),
        a: T(`Mean $= ${f2(mean(v))}$; variance $= ${f2(varp(v))}$`, `Min $= ${f2(mean(v))}$; varians $= ${f2(varp(v))}$`), w: W(...varW(sum(fs), sfx, sfxx, { freq: true })), sp: 'l' };
    },
    (r) => { // complete a partly-filled fx/fx^2 table then find mean
      const c = r.pick(FREQCTX), { fs, v } = genFreq(r, c);
      const fx = c.xs.map((x, i) => x * fs[i]), fxx = c.xs.map((x, i) => x * x * fs[i]);
      const hideI = r.int(0, c.xs.length - 1);
      const fxRow = fx.map((val, i) => (i === hideI ? '?' : val));
      const tblEn = table([['Frequency ($f$)', ...fs], ['$fx$', ...fxRow]], { head: [c.xEn, ...c.xs] });
      const tblMs = table([['Kekerapan ($f$)', ...fs], ['$fx$', ...fxRow]], { head: [c.xMs, ...c.xs] });
      return { q: T(`The table shows ${c.en}, with one $fx$ value missing.<br>${tblEn}<br>Find the missing value, and hence find $\\sum fx$ and the mean.`, `Jadual menunjukkan ${c.ms}, dengan satu nilai $fx$ tertinggal.<br>${tblMs}<br>Cari nilai yang tertinggal, dan seterusnya cari $\\sum fx$ dan min.`),
        a: T(`Missing value $= ${fx[hideI]}$; $\\sum fx = ${sum(fx)}$; mean $= ${f2(mean(v))}$`, `Nilai tertinggal $= ${fx[hideI]}$; $\\sum fx = ${sum(fx)}$; min $= ${f2(mean(v))}$`),
        w: W(`$fx = ${c.xs[hideI]} \\times ${fs[hideI]} = ${fx[hideI]}$`, `$\\sum fx = ${fx.join(' + ')} = ${sum(fx)}$`, T(`Mean $= \\dfrac{${sum(fx)}}{${sum(fs)}} ${eq2(mean(v))} ${f2(mean(v))}$`, `Min $= \\dfrac{${sum(fx)}}{${sum(fs)}} ${eq2(mean(v))} ${f2(mean(v))}$`)), sp: 'l' };
    },
    (r) => { // compare range vs IQR, choose the more suitable / consistent
      const c = r.pick(CTX), a = genGroup(r, c, 8), b = genGroup(r, c, 8);
      const qa = quart(a), qb = quart(b);
      need((qa.q3 - qa.q1) !== (qb.q3 - qb.q1));
      return { q: T(`Data set $A$: $${list(sortNum(a))}$. Data set $B$: $${list(sortNum(b))}$ (${c.en}). Calculate the range and interquartile range of each, and state which set is more consistent.`, `Set data $A$: $${list(sortNum(a))}$. Set data $B$: $${list(sortNum(b))}$ (${c.ms}). Kira julat dan julat antara kuartil bagi setiap set, dan nyatakan set yang manakah lebih konsisten.`),
        a: T(`$A$: range ${qa.max - qa.min}, IQR ${n(qa.q3 - qa.q1)}; $B$: range ${qb.max - qb.min}, IQR ${n(qb.q3 - qb.q1)}. ${(qa.q3 - qa.q1) <= (qb.q3 - qb.q1) ? 'A' : 'B'} is more consistent (smaller IQR).`, `$A$: julat ${qa.max - qa.min}, JAK ${n(qa.q3 - qa.q1)}; $B$: julat ${qb.max - qb.min}, JAK ${n(qb.q3 - qb.q1)}. ${(qa.q3 - qa.q1) <= (qb.q3 - qb.q1) ? 'A' : 'B'} lebih konsisten (JAK lebih kecil).`),
        w: W(rangeW(a, 'A'), ...quartW(a, 'A'), iqrW(a, 'A'), rangeW(b, 'B'), ...quartW(b, 'B'), iqrW(b, 'B'), T(`Smaller IQR (the middle 50% is less spread out): ${(qa.q3 - qa.q1) < (qb.q3 - qb.q1) ? 'A' : 'B'} is more consistent.`, `JAK lebih kecil (50% di tengah kurang bertaburan): ${(qa.q3 - qa.q1) < (qb.q3 - qb.q1) ? 'A' : 'B'} lebih konsisten.`)), sp: 'l' };
    },
    (r) => { // spot-the-error (raw list), several distractor types
      const c = r.pick(CTX), v = genGroup(r, c, r.int(6, 9));
      const s = sortNum(v), q = quart(v), N = v.length;
      const correctVar = varp(v), correctSD = sd(v);
      const kind = r.pick(['order', 'n1', 'reversed', 'reportsd']);
      let wrongVal, correctVal, task, wl;
      if (kind === 'order') {
        // simulate the mistake of not sorting first: split the unsorted list into halves directly
        const m = v.length >> 1, lo = v.slice(0, m), hi = v.slice(v.length % 2 ? m + 1 : m);
        const wQ1 = median(lo), wQ3 = median(hi);
        need(wQ1 !== q.q1 || wQ3 !== q.q3);
        task = T('finding the quartiles directly from the data as listed, without first arranging it in ascending order', 'mencari kuartil terus daripada data seperti yang disenaraikan, tanpa menyusunnya mengikut tertib menaik dahulu');
        wrongVal = T(`$Q_1 = ${n(wQ1)}$, $Q_3 = ${n(wQ3)}$`, `$Q_1 = ${n(wQ1)}$, $Q_3 = ${n(wQ3)}$`);
        correctVal = T(`$Q_1 = ${n(q.q1)}$, $Q_3 = ${n(q.q3)}$ (data must be ordered first: $${list(s)}$)`, `$Q_1 = ${n(q.q1)}$, $Q_3 = ${n(q.q3)}$ (data mesti disusun mengikut tertib dahulu: $${list(s)}$)`);
        wl = [T('Quartiles are positions in the ordered data, so arrange the data first.', 'Kuartil ialah kedudukan dalam data tersusun, jadi susun data dahulu.'), ...quartW(v, null, true)];
      } else if (kind === 'n1') {
        const wrongVar = sum(v.map((x) => (x - mean(v)) ** 2)) / (N - 1);
        task = T(`using $N - 1 = ${N - 1}$ in the denominator instead of $N = ${N}$`, `menggunakan $N - 1 = ${N - 1}$ sebagai penyebut dan bukan $N = ${N}$`);
        wrongVal = T(`variance $= ${f2(wrongVar)}$`, `varians $= ${f2(wrongVar)}$`);
        correctVal = T(`variance $= ${f2(correctVar)}$ (this chapter uses the population formula, denominator $N$)`, `varians $= ${f2(correctVar)}$ (bab ini menggunakan rumus populasi, penyebut $N$)`);
        wl = [T(`Divide by $N = ${N}$, not by $N - 1$.`, `Bahagi dengan $N = ${N}$, bukan dengan $N - 1$.`), ...varV(v)];
      } else if (kind === 'reversed') {
        const wrongVar = Math.pow(mean(v), 2) - sum(v.map((x) => x * x)) / N;
        task = T('computing $\\bar{x}^2 - \\dfrac{\\sum x^2}{N}$ (the two terms swapped)', 'mengira $\\bar{x}^2 - \\dfrac{\\sum x^2}{N}$ (kedua-dua sebutan tertukar)');
        wrongVal = T(`variance $= ${f2(wrongVar)}$ (negative, which is impossible)`, `varians $= ${f2(wrongVar)}$ (negatif, iaitu mustahil)`);
        correctVal = T(`variance $= \\dfrac{\\sum x^2}{N} - \\bar{x}^2 = ${f2(correctVar)}$`, `varians $= \\dfrac{\\sum x^2}{N} - \\bar{x}^2 = ${f2(correctVar)}$`);
        wl = [T('A variance can never be negative: the mean of the squares comes first, then subtract the square of the mean.', 'Varians tidak mungkin negatif: min kuasa dua didahulukan, kemudian tolak kuasa dua min.'), ...varV(v)];
      } else {
        task = T('stopping after finding the variance and calling that value the standard deviation', 'berhenti selepas mendapat varians dan menamakan nilai itu sisihan piawai');
        wrongVal = T(`s.d. $= ${f2(correctVar)}$`, `s.p. $= ${f2(correctVar)}$`);
        correctVal = T(`s.d. $= \\sqrt{${f2(correctVar)}} = ${f2(correctSD)}$ (square root of the variance)`, `s.p. $= \\sqrt{${f2(correctVar)}} = ${f2(correctSD)}$ (punca kuasa dua varians)`);
        wl = [...varV(v, { sd: true }), T('The standard deviation is the square root of the variance.', 'Sisihan piawai ialah punca kuasa dua varians.')];
      }
      return { q: T(`A student finds a measure of dispersion for the data $${list(v)}$ (${c.en}) by ${task.en}. This gives ${wrongVal.en}. Identify the mistake and state the correct value.`, `Seorang murid mencari satu sukatan serakan bagi data $${list(v)}$ (${c.ms}) dengan ${task.ms}. Ini memberikan ${wrongVal.ms}. Kenal pasti kesilapan itu dan nyatakan nilai yang betul.`),
        a: correctVal, w: W(...wl), sp: 'm' };
    },
  ];
  const g821a = [
    (r) => { // N, Sx, Sxx -> mean, variance, sd (harder numbers), embedded in a context
      const c = r.pick(CTX), N = r.int(6, 12), sx = r.int(N * 4, N * 12), sxx = Math.round(N * ((sx / N) ** 2 + r.int(3, 12)));
      const m = sx / N, vr = sxx / N - m * m;
      return { q: T(`For ${N} values of ${c.en}, $\\sum x = ${sx}$ and $\\sum x^2 = ${sxx}$. Find the mean, the variance and the standard deviation (2 decimal places).`, `Bagi ${N} nilai ${c.ms}, $\\sum x = ${sx}$ dan $\\sum x^2 = ${sxx}$. Cari min, varians dan sisihan piawai (2 tempat perpuluhan).`), a: T(`Mean $${f2(m)}$; variance $${f2(vr)}$; s.d. $${f2(Math.sqrt(vr))}$`, `Min $${f2(m)}$; varians $${f2(vr)}$; s.p. $${f2(Math.sqrt(vr))}$`), w: W(...varW(N, sx, sxx, { noSums: true, sd: true })), sp: 'm' };
    },
    (r) => { // missing value from stated mean (raw list), embedded in a context
      const c = r.pick(CTX), v = genGroup(r, c, 5), x = r.int(c.lo, c.hi), full = v.concat([x]);
      need(sum(full) % 3 === 0); // mean exact to 2 d.p., so the sixth value can be recovered exactly
      return { q: T(`Five values of ${c.en} are $${list(v)}$. A sixth value is added so that the mean of the six values is ${f2(mean(full))}. Find the sixth value and the new range.`, `Lima nilai ${c.ms} ialah $${list(v)}$. Satu nilai keenam ditambah supaya min bagi enam nilai itu ialah ${f2(mean(full))}. Cari nilai keenam itu dan julat baharu.`), a: T(`Sixth value $= ${x}$; new range $= ${Math.max(...full) - Math.min(...full)}$`, `Nilai keenam $= ${x}$; julat baharu $= ${Math.max(...full) - Math.min(...full)}$`), w: W(T(`Sum of six values $= 6 \\times ${f2(mean(full))} = ${sum(full)}$`, `Hasil tambah enam nilai $= 6 \\times ${f2(mean(full))} = ${sum(full)}$`), T(`Sixth value $= ${sum(full)} - ${sum(v)} = ${x}$`, `Nilai keenam $= ${sum(full)} - ${sum(v)} = ${x}$`), rangeW(full)), sp: 'm' };
    },
    (r) => { // missing value from stated mean, asks for new variance instead of new range
      const c = r.pick(CTX), v = genGroup(r, c, 5), x = r.int(c.lo, c.hi), full = v.concat([x]);
      need(sum(full) % 3 === 0); // mean exact to 2 d.p.
      return { q: T(`Five values of ${c.en} are $${list(v)}$. A sixth value is added so that the mean of the six values is ${f2(mean(full))}. Find the sixth value, and hence find the variance of the six values.`, `Lima nilai ${c.ms} ialah $${list(v)}$. Satu nilai keenam ditambah supaya min bagi enam nilai itu ialah ${f2(mean(full))}. Cari nilai keenam itu, dan seterusnya cari varians bagi enam nilai itu.`), a: T(`Sixth value $= ${x}$; variance $= ${f2(varp(full))}$`, `Nilai keenam $= ${x}$; varians $= ${f2(varp(full))}$`), w: W(T(`Sum of six values $= 6 \\times ${f2(mean(full))} = ${sum(full)}$`, `Hasil tambah enam nilai $= 6 \\times ${f2(mean(full))} = ${sum(full)}$`), T(`Sixth value $= ${sum(full)} - ${sum(v)} = ${x}$`, `Nilai keenam $= ${sum(full)} - ${sum(v)} = ${x}$`), ...varV(full, { noMean: true })), sp: 'm' };
    },
    (r) => { // construct your own example from a stated five-number summary (N=6, so Q1/Q3 land cleanly)
      const c = r.pick(CTX);
      const gap1 = r.int(2, 5), gap2 = r.int(2, 5), gap3 = r.int(2, 5), gap4 = r.int(2, 5);
      const q1 = c.lo + gap1, med = q1 + gap2, q3 = med + gap3, mx = q3 + gap4;
      need(mx <= c.hi + 25);
      const example = [c.lo, q1, med, med, q3, mx]; // 6 sorted values: median-of-halves gives clean Q1, median, Q3
      const built = quart(example);
      need(built.q1 === q1 && built.med === med && built.q3 === q3 && built.min === c.lo && built.max === mx);
      return { q: T(`Construct a list of 6 values of ${c.en} whose minimum is ${c.lo}, $Q_1 = ${q1}$, median $= ${med}$, $Q_3 = ${q3}$ and maximum $= ${mx}$. (Many correct lists are possible; give one.)`, `Bina satu senarai 6 nilai ${c.ms} yang minimumnya ${c.lo}, $Q_1 = ${q1}$, median $= ${med}$, $Q_3 = ${q3}$ dan maksimum $= ${mx}$. (Banyak senarai yang betul adalah mungkin; berikan satu.)`),
        a: T(`E.g. $${list(example)}$ (ordering gives $Q_1 = ${q1}$, median $= ${med}$, $Q_3 = ${q3}$).`, `Cth. $${list(example)}$ (penyusunan memberi $Q_1 = ${q1}$, median $= ${med}$, $Q_3 = ${q3}$).`),
        w: W(T(`With 6 ordered values: median = mean of the 3rd and 4th values, so make both $${med}$.`, `Dengan 6 nilai tersusun: median = purata nilai ke-3 dan ke-4, jadi jadikan kedua-duanya $${med}$.`), T(`$Q_1$ = middle of the lower half (2nd value) $= ${q1}$; $Q_3$ = middle of the upper half (5th value) $= ${q3}$.`, `$Q_1$ = nilai tengah separuh bawah (nilai ke-2) $= ${q1}$; $Q_3$ = nilai tengah separuh atas (nilai ke-5) $= ${q3}$.`), T(`1st value $= ${c.lo}$ (minimum), 6th value $= ${mx}$ (maximum).`, `Nilai ke-1 $= ${c.lo}$ (minimum), nilai ke-6 $= ${mx}$ (maksimum).`)), sp: 'm' };
    },
    (r) => { // missing frequency from stated N (Sf)
      const c = r.pick(FREQCTX), fs = c.xs.map(() => r.int(1, 5));
      const hideI = r.int(0, c.xs.length - 1);
      const totalN = sum(fs) + r.int(1, 3); // will replace hidden entry so total matches
      const missing = totalN - (sum(fs) - fs[hideI]);
      need(missing >= 1 && missing <= 9);
      const trueFs = fs.slice(); trueFs[hideI] = missing;
      const v = c.xs.flatMap((x, i) => Array(trueFs[i]).fill(x));
      const shownFs = trueFs.map((f, i) => (i === hideI ? '$k$' : f));
      const tblEn = table([['Frequency ($f$)', ...shownFs]], { head: [c.xEn, ...c.xs] });
      const tblMs = table([['Kekerapan ($f$)', ...shownFs]], { head: [c.xMs, ...c.xs] });
      return { q: T(`The table shows ${c.en}. The total number of data values is ${totalN}.<br>${tblEn}<br>Find $k$, and hence find the mean.`, `Jadual menunjukkan ${c.ms}. Jumlah bilangan nilai data ialah ${totalN}.<br>${tblMs}<br>Cari $k$, dan seterusnya cari min.`),
        a: T(`$k = ${missing}$; mean $= ${f2(mean(v))}$`, `$k = ${missing}$; min $= ${f2(mean(v))}$`),
        w: W(`$${trueFs.map((f, i) => (i === hideI ? 'k' : f)).join(' + ')} = ${totalN} \\Rightarrow k = ${totalN} - ${totalN - missing} = ${missing}$`, `$\\sum fx = ${c.xs.map((x, i) => `${x}(${trueFs[i]})`).join(' + ')} = ${sum(v)}$`, T(`Mean $= \\dfrac{${sum(v)}}{${totalN}} ${eq2(mean(v))} ${f2(mean(v))}$`, `Min $= \\dfrac{${sum(v)}}{${totalN}} ${eq2(mean(v))} ${f2(mean(v))}$`)), sp: 'l' };
    },
    (r) => { // complete a partially-given table with two missing cells (f and fx^2), then variance
      const c = r.pick(FREQCTX), { fs, v } = genFreq(r, c);
      const fx = c.xs.map((x, i) => x * fs[i]), fxx = c.xs.map((x, i) => x * x * fs[i]);
      const tblEn = table([['Frequency ($f$)', ...fs], ['$fx$', ...fx], ['$fx^2$', ...fxx]], { head: [c.xEn, ...c.xs] });
      const tblMs = table([['Kekerapan ($f$)', ...fs], ['$fx$', ...fx], ['$fx^2$', ...fxx]], { head: [c.xMs, ...c.xs] });
      return { q: T(`The complete $x, f, fx, fx^2$ table for ${c.en} is shown.<br>${tblEn}<br>Find the mean and the standard deviation (2 decimal places), and state one advantage of the standard deviation over the range as a measure of spread here.`, `Jadual lengkap $x, f, fx, fx^2$ bagi ${c.ms} ditunjukkan.<br>${tblMs}<br>Cari min dan sisihan piawai (2 tempat perpuluhan), dan nyatakan satu kelebihan sisihan piawai berbanding julat sebagai sukatan serakan di sini.`),
        a: T(`Mean $= ${f2(mean(v))}$; s.d. $= ${f2(sd(v))}$. The standard deviation uses every value in the data, not only the two extremes.`, `Min $= ${f2(mean(v))}$; s.p. $= ${f2(sd(v))}$. Sisihan piawai menggunakan setiap nilai dalam data, bukan hanya dua nilai ekstrem.`),
        w: W(`$\\sum f = ${sum(fs)}$, $\\sum fx = ${fx.join(' + ')} = ${sum(fx)}$, $\\sum fx^2 = ${fxx.join(' + ')} = ${sum(fxx)}$`, ...varW(sum(fs), sum(fx), sum(fxx), { freq: true, noSums: true, sd: true })), sp: 'l' };
    },
    (r) => { // find an unknown value in a list given the range or a quartile constraint
      const v = rnd(r, 5, 6, 20), rg = r.int(10, 18);
      const xMin = Math.min(...v);
      const xMax = xMin + rg;
      need(xMax > Math.max(...v) + 1 && xMax < 40);
      const full = v.concat([xMax]);
      return { q: T(`The data $${list(v)}$ together with one more value $x$ have a range of ${rg}. Given that $x$ is the largest value, find $x$ and the interquartile range of the complete data set.`, `Data $${list(v)}$ bersama satu lagi nilai $x$ mempunyai julat ${rg}. Diberi $x$ ialah nilai terbesar, cari $x$ dan julat antara kuartil bagi set data lengkap itu.`),
        a: (() => { const q = quart(full); return T(`$x = ${xMax}$; IQR $= ${n(q.q3 - q.q1)}$`, `$x = ${xMax}$; JAK $= ${n(q.q3 - q.q1)}$`); })(), w: W(T(`Range = largest - smallest, so $x = ${xMin} + ${rg} = ${xMax}$`, `Julat = terbesar - terkecil, jadi $x = ${xMin} + ${rg} = ${xMax}$`), ...quartW(full, null, true), iqrW(full)), sp: 'm' };
    },
  ];
  SPM.extend('F4-8.2.1', { e: g821e, m: g821m, a: g821a });

  /* =============================================================== 8.2.2 Advantages and disadvantages */
  const MEAS = { range: T('range', 'julat'), iqr: T('interquartile range', 'julat antara kuartil'), variance: T('variance', 'varians'), sd: T('standard deviation', 'sisihan piawai') };
  const DESC = [ // [en, ms, key]
    ['it is the quickest to calculate, using only the largest and smallest values', 'ia paling cepat dikira, hanya menggunakan nilai terbesar dan terkecil', 'range'],
    ['it describes the spread of the middle 50% of the data and resists extreme values', 'ia menerangkan serakan 50% data di tengah dan tahan terhadap nilai ekstrem', 'iqr'],
    ['it uses every value in the data set and is useful for further algebraic/statistical work, but its unit is squared', 'ia menggunakan setiap nilai dalam set data dan berguna untuk kerja algebra/statistik selanjutnya, tetapi unitnya kuasa dua', 'variance'],
    ['it uses every value in the data set and has the same unit as the original data, making it easy to interpret', 'ia menggunakan setiap nilai dalam set data dan mempunyai unit yang sama seperti data asal, menjadikannya mudah ditafsir', 'sd'],
    ['it is highly sensitive to a single very large or very small value', 'ia sangat sensitif terhadap satu nilai yang sangat besar atau sangat kecil', 'range'],
    ['it ignores half of the ordered data (the smallest 25% and the largest 25%)', 'ia mengabaikan separuh daripada data tersusun (25% terkecil dan 25% terbesar)', 'iqr'],
    ['it is the square of the standard deviation', 'ia ialah kuasa dua sisihan piawai', 'variance'],
    ['it is the square root of the variance', 'ia ialah punca kuasa dua varians', 'sd'],
    ['it is found from just the maximum value minus the minimum value', 'ia diperoleh daripada nilai maksimum tolak nilai minimum sahaja', 'range'],
    ['it is found from $Q_3 - Q_1$', 'ia diperoleh daripada $Q_3 - Q_1$', 'iqr'],
    ['it requires calculating $\\sum x^2$ over all the data before taking a square root at the end', 'ia memerlukan pengiraan $\\sum x^2$ ke atas semua data sebelum punca kuasa dua diambil pada akhir', 'sd'],
    ['it gives the full span of the data set in one number, but that number can be misleading if there is an outlier', 'ia memberikan keseluruhan lingkungan set data dalam satu nombor, tetapi nombor itu boleh mengelirukan jika terdapat nilai terpencil', 'range'],
  ];
  const TFCLAIM = [ // [en, ms, isTrue]
    ['The range only depends on the largest and smallest values, so it ignores the pattern of the values in between.', 'Julat hanya bergantung pada nilai terbesar dan terkecil, jadi ia mengabaikan corak nilai di antaranya.', true],
    ['The interquartile range is more resistant to an extreme value than the range.', 'Julat antara kuartil lebih tahan terhadap nilai ekstrem berbanding julat.', true],
    ['The variance is always easier to interpret directly than the standard deviation, because it uses a simpler formula.', 'Varians sentiasa lebih mudah ditafsir secara terus berbanding sisihan piawai, kerana ia menggunakan formula yang lebih ringkas.', false],
    ['The standard deviation uses every value in the data set, unlike the range, which uses only two.', 'Sisihan piawai menggunakan setiap nilai dalam set data, tidak seperti julat, yang hanya menggunakan dua nilai.', true],
    ['The interquartile range uses every value in the data set.', 'Julat antara kuartil menggunakan setiap nilai dalam set data.', false],
    ['A larger standard deviation always means the data set has a larger range.', 'Sisihan piawai yang lebih besar sentiasa bermaksud set data itu mempunyai julat yang lebih besar.', false],
    ['The variance is measured in squared units of the original data.', 'Varians diukur dalam unit kuasa dua data asal.', true],
    ['The range is the easiest and quickest measure of dispersion to calculate.', 'Julat ialah sukatan serakan yang paling mudah dan cepat dikira.', true],
    ['The standard deviation is completely unaffected by an extreme value in the data.', 'Sisihan piawai langsung tidak terjejas oleh nilai ekstrem dalam data.', false],
    ['The interquartile range describes the spread of the middle 50% of the ordered data.', 'Julat antara kuartil menerangkan serakan 50% data tersusun di tengah.', true],
    ['Two data sets with the same range must have the same standard deviation.', 'Dua set data dengan julat yang sama pasti mempunyai sisihan piawai yang sama.', false],
    ['The range can be calculated without arranging the data in order first.', 'Julat boleh dikira tanpa menyusun data mengikut tertib dahulu.', true],
    ['A smaller standard deviation always indicates a smaller range.', 'Sisihan piawai yang lebih kecil sentiasa menunjukkan julat yang lebih kecil.', false],
    ['Finding the interquartile range requires the data to be arranged in order first.', 'Mencari julat antara kuartil memerlukan data disusun mengikut tertib dahulu.', true],
  ];
  /* one-line definition of each measure, used as the reason in the working */
  const DEFN = {
    range: T('Range = largest value - smallest value: only two values are used.', 'Julat = nilai terbesar - nilai terkecil: hanya dua nilai digunakan.'),
    iqr: T('Interquartile range $= Q_3 - Q_1$: the spread of the middle 50% of the ordered data.', 'Julat antara kuartil $= Q_3 - Q_1$: serakan 50% data tersusun di tengah.'),
    variance: T('Variance $= \\dfrac{\\sum x^2}{N} - \\bar{x}^2$: uses every value, and its unit is squared.', 'Varians $= \\dfrac{\\sum x^2}{N} - \\bar{x}^2$: menggunakan setiap nilai, dan unitnya kuasa dua.'),
    sd: T('Standard deviation $= \\sqrt{\\text{variance}}$: uses every value, in the same unit as the data.', 'Sisihan piawai $= \\sqrt{\\text{varians}}$: menggunakan setiap nilai, dalam unit yang sama dengan data.'),
  };
  /* why each TFCLAIM statement is true/false (same order as TFCLAIM) */
  const CE1 = T('Counter-example: $\\{0, 0, 8, 8\\}$ has $\\sigma = 4$ and range $8$, while $\\{0, 5, 5, 5, 5, 10\\}$ has $\\sigma \\approx 2.89$ and range $10$.', 'Contoh penyangkal: $\\{0, 0, 8, 8\\}$ mempunyai $\\sigma = 4$ dan julat $8$, manakala $\\{0, 5, 5, 5, 5, 10\\}$ mempunyai $\\sigma \\approx 2.89$ dan julat $10$.');
  const TFWHY = [
    T('Range = maximum - minimum uses only those two values.', 'Julat = maksimum - minimum hanya menggunakan dua nilai itu.'),
    T('An extreme value changes the maximum or minimum (so the range) but hardly moves $Q_1$ and $Q_3$.', 'Nilai ekstrem mengubah maksimum atau minimum (jadi julat) tetapi hampir tidak menggerakkan $Q_1$ dan $Q_3$.'),
    T('The variance is in squared units, so the standard deviation (original unit) is the easier one to interpret.', 'Varians dalam unit kuasa dua, jadi sisihan piawai (unit asal) lebih mudah ditafsir.'),
    T('$\\sigma^2 = \\dfrac{\\sum x^2}{N} - \\bar{x}^2$ involves every $x$; the range uses only the maximum and minimum.', '$\\sigma^2 = \\dfrac{\\sum x^2}{N} - \\bar{x}^2$ melibatkan setiap $x$; julat hanya menggunakan maksimum dan minimum.'),
    T('IQR $= Q_3 - Q_1$ uses only the two quartiles, not every value.', 'JAK $= Q_3 - Q_1$ hanya menggunakan dua kuartil, bukan setiap nilai.'),
    CE1,
    T('The variance averages squared deviations, so its unit is the square of the data unit.', 'Varians ialah purata sisihan kuasa dua, jadi unitnya kuasa dua unit data.'),
    T('It needs only the largest and smallest values and one subtraction.', 'Ia hanya memerlukan nilai terbesar dan terkecil serta satu penolakan.'),
    T('Every value, including the extreme one, enters $\\sum x^2$, so the standard deviation changes.', 'Setiap nilai, termasuk nilai ekstrem, masuk ke dalam $\\sum x^2$, jadi sisihan piawai berubah.'),
    T('Between $Q_1$ (25%) and $Q_3$ (75%) lie the middle 50% of the ordered data.', 'Antara $Q_1$ (25%) dan $Q_3$ (75%) terletak 50% data tersusun di tengah.'),
    T('Counter-example: $\\{0, 0, 8, 8\\}$ has $\\sigma = 4$ and $\\{0, 4, 4, 8\\}$ has $\\sigma \\approx 2.83$, but both have range $8$.', 'Contoh penyangkal: $\\{0, 0, 8, 8\\}$ mempunyai $\\sigma = 4$ dan $\\{0, 4, 4, 8\\}$ mempunyai $\\sigma \\approx 2.83$, tetapi kedua-duanya mempunyai julat $8$.'),
    T('The largest and smallest values can be picked out by scanning the list; no full ordering is needed.', 'Nilai terbesar dan terkecil boleh dikenal pasti dengan meneliti senarai; penyusunan penuh tidak diperlukan.'),
    CE1,
    T('Quartiles are positions in the ordered data, so the data must be ordered first.', 'Kuartil ialah kedudukan dalam data tersusun, jadi data mesti disusun dahulu.'),
  ];
  const SCEN = [ // [en, ms, recommendedKey, reasonEn, reasonMs]
    ['a data set is known to contain a data-entry error that created one extreme, unrealistic value', 'satu set data diketahui mengandungi satu kesilapan kemasukan data yang mencipta satu nilai ekstrem yang tidak realistik', 'iqr', 'the IQR is resistant to extreme values, so it is not distorted by the error', 'JAK tahan terhadap nilai ekstrem, jadi ia tidak terjejas oleh kesilapan itu'],
    ['you need a very quick, rough sense of the spread with minimal calculation', 'anda memerlukan gambaran kasar serakan dengan cepat dan pengiraan yang minimum', 'range', 'the range needs only the largest and smallest values', 'julat hanya memerlukan nilai terbesar dan terkecil'],
    ['the spread will be used in further statistical calculations that require an algebraically convenient measure', 'serakan itu akan digunakan dalam pengiraan statistik selanjutnya yang memerlukan sukatan yang mudah dari segi algebra', 'variance', 'variance is based on squared deviations, which are easier to combine algebraically than absolute or ranked measures', 'varians berasaskan sisihan kuasa dua, yang lebih mudah digabungkan dari segi algebra berbanding sukatan mutlak atau berpangkat'],
    ['the spread needs to be communicated to a non-technical audience in the original unit of measurement', 'serakan itu perlu disampaikan kepada khalayak bukan teknikal dalam unit ukuran asal', 'sd', 'the standard deviation has the same unit as the data, unlike variance, which is squared', 'sisihan piawai mempunyai unit yang sama seperti data, tidak seperti varians, yang kuasa dua'],
    ['two classes are compared for consistency, and one class has a single student with an unusually low mark', 'dua kelas dibandingkan dari segi konsistensi, dan satu kelas mempunyai seorang murid dengan markah yang luar biasa rendah', 'iqr', 'the IQR describes the typical middle 50% of marks without being pulled by the one low outlier', 'JAK menerangkan 50% markah tengah yang tipikal tanpa terjejas oleh satu nilai terpencil yang rendah'],
    ['every observation must be used, and the result will be compared using its original unit rather than a squared one', 'setiap cerapan mesti digunakan, dan keputusan itu akan dibandingkan menggunakan unit asalnya dan bukan unit kuasa dua', 'sd', 'standard deviation uses all the data and restores the original unit by taking a square root', 'sisihan piawai menggunakan semua data dan memulihkan unit asal dengan mengambil punca kuasa dua'],
    ['there is no time to arrange the data in order, and only a rough first impression of the spread is needed', 'tiada masa untuk menyusun data mengikut tertib, dan hanya gambaran kasar pertama tentang serakan diperlukan', 'range', 'the range can be found directly from the largest and smallest values without ordering the rest of the data', 'julat boleh dicari terus daripada nilai terbesar dan terkecil tanpa menyusun selebihnya data'],
    ['the values will later be substituted into a further formula that specifically requires squared deviations', 'nilai itu akan kemudiannya digantikan ke dalam satu formula selanjutnya yang khusus memerlukan sisihan kuasa dua', 'variance', 'variance is exactly the mean squared deviation, so it plugs directly into such a formula', 'varians ialah tepat min sisihan kuasa dua, jadi ia boleh terus digunakan dalam formula sedemikian'],
    ['a coach wants to compare how consistent two athletes’ timed laps are, using every lap they ran, in seconds', 'seorang jurulatih ingin membandingkan sejauh mana konsisten pusingan masa dua orang atlet, menggunakan setiap pusingan yang mereka lari, dalam saat', 'sd', 'the standard deviation uses every recorded lap and reports the spread directly in seconds', 'sisihan piawai menggunakan setiap pusingan yang direkodkan dan melaporkan serakan terus dalam saat'],
  ];
  const g822e = [
    (r) => { // MCQ: which measure is described
      const d = r.pick(DESC);
      const others = Object.keys(MEAS).filter((k) => k !== d[2]);
      const opts = r.shuffle([d[2], ...r.sample(others, 3)]);
      const letters = ['A', 'B', 'C', 'D'];
      const mk = (k) => opts.map((key, i) => `${letters[i]}. ${MEAS[key][k]}`).join('<br>');
      const idx = opts.indexOf(d[2]);
      return { q: T(`Which measure of dispersion is being described? "${d[0]}"<br>${mk('en')}`, `Sukatan serakan yang manakah diterangkan? "${d[1]}"<br>${mk('ms')}`), a: T(`${letters[idx]}. ${MEAS[d[2]].en}`, `${letters[idx]}. ${MEAS[d[2]].ms}`), w: W(DEFN[d[2]], T(`This matches the description, so ${letters[idx]}.`, `Ini sepadan dengan penerangan itu, jadi ${letters[idx]}.`)), sp: 'm' };
    },
    (r) => { // true/false claim
      const c = r.pick(TFCLAIM);
      return { q: T(`True or False: "${c[0]}"`, `Betul atau Salah: "${c[1]}"`), a: c[2] ? T('True.', 'Betul.') : T('False.', 'Salah.'), w: W(TFWHY[TFCLAIM.indexOf(c)]), sp: 's' };
    },
    (r) => { // most/least affected by an extreme value
      const which = r.pick(['most', 'least']);
      return { q: T(`Which measure of dispersion is ${which === 'most' ? 'most' : 'least'} affected by a single extreme value: the range or the interquartile range?`, `Sukatan serakan yang manakah ${which === 'most' ? 'paling terjejas' : 'paling kurang terjejas'} oleh satu nilai ekstrem: julat atau julat antara kuartil?`),
        a: which === 'most' ? T('The range (it depends directly on the maximum and minimum).', 'Julat (ia bergantung terus pada nilai maksimum dan minimum).') : T('The interquartile range (it ignores the most extreme quarter on each side).', 'Julat antara kuartil (ia mengabaikan suku paling ekstrem pada setiap hujung).'), w: W(DEFN.range, DEFN.iqr, T('An extreme value is the maximum or minimum, so it changes the range directly but barely moves $Q_1$ and $Q_3$.', 'Nilai ekstrem ialah maksimum atau minimum, jadi ia mengubah julat secara terus tetapi hampir tidak menggerakkan $Q_1$ dan $Q_3$.')), sp: 's' };
    },
    (r) => { // fill in the blank on range's calculation requirement
      return { q: T('Fill in the blank: The range is quick to calculate because it only needs the ___ and ___ values of the data set.', 'Isi tempat kosong: Julat cepat dikira kerana ia hanya memerlukan nilai ___ dan ___ bagi set data itu.'),
        a: T('largest (maximum) and smallest (minimum)', 'terbesar (maksimum) dan terkecil (minimum)'), w: W(DEFN.range), sp: 's' };
    },
    (r) => { // unit relationship variance vs sd
      const u = r.pick(UNITX);
      return { q: T(`A data set is measured in ${u[0]}. If the variance is $V$ ${u[0]}$^2$, what expression gives the standard deviation, and in what unit?`, `Satu set data diukur dalam ${u[1]}. Jika varians ialah $V$ ${u[1]}$^2$, apakah ungkapan yang memberikan sisihan piawai, dan dalam unit apakah?`),
        a: T(`$\\sqrt{V}$, in ${u[0]}`, `$\\sqrt{V}$, dalam ${u[1]}`), w: W(T(`Standard deviation $= \\sqrt{\\text{variance}} = \\sqrt{V}$`, `Sisihan piawai $= \\sqrt{\\text{varians}} = \\sqrt{V}$`), T(`Square root of ${u[0]}$^2$ gives ${u[0]}.`, `Punca kuasa dua ${u[1]}$^2$ memberi ${u[1]}.`)), sp: 's' };
    },
    (r) => { // spot the error: student confuses range/IQR formula
      const wrongIsRange = r.chance();
      return { q: T(`A student writes: "the interquartile range is $\\text{maximum} - \\text{minimum}$." Is this correct? If not, give the correct formula.`, `Seorang murid menulis: "julat antara kuartil ialah $\\text{maksimum} - \\text{minimum}$." Adakah ini betul? Jika tidak, berikan formula yang betul.`),
        a: T('No, that is the formula for the range. The interquartile range is $Q_3 - Q_1$.', 'Tidak, itu ialah formula bagi julat. Julat antara kuartil ialah $Q_3 - Q_1$.'), w: W(DEFN.range, DEFN.iqr), sp: 's' };
    },
    (r) => { // which measures need the data ordered first
      return { q: T('Which of these measures of dispersion require the data to be arranged in order before they can be found: the range, or the interquartile range?', 'Antara sukatan serakan ini, yang manakah memerlukan data disusun mengikut tertib sebelum ia boleh dicari: julat, atau julat antara kuartil?'),
        a: T('The interquartile range (quartiles are positions in the ordered data); the range only needs the maximum and minimum, which can be found without full ordering.', 'Julat antara kuartil (kuartil ialah kedudukan dalam data tersusun); julat hanya memerlukan nilai maksimum dan minimum, yang boleh dicari tanpa penyusunan penuh.'), w: W(T('$Q_1$ and $Q_3$ are the values a quarter and three quarters of the way through the ordered list, so ordering is needed.', '$Q_1$ dan $Q_3$ ialah nilai pada suku pertama dan suku ketiga senarai tersusun, jadi penyusunan diperlukan.'), T('The maximum and minimum can be picked out by scanning the list.', 'Maksimum dan minimum boleh dikenal pasti dengan meneliti senarai.')), sp: 's' };
    },
  ];
  const g822m = [
    (r) => { // matching: 3 scenarios to 3 measures (medium-sized version of the advanced 4-way match)
      const picks = r.sample(SCEN, 3);
      const list3 = picks.map((p, i) => `(${i + 1}) ${p[0]}`).join('; ');
      const list3m = picks.map((p, i) => `(${i + 1}) ${p[1]}`).join('; ');
      return { q: T(`Match each situation to the most suitable measure of dispersion (range, interquartile range, variance or standard deviation): ${list3}.`, `Padankan setiap situasi dengan sukatan serakan yang paling sesuai (julat, julat antara kuartil, varians atau sisihan piawai): ${list3m}.`),
        a: T(picks.map((p, i) => `(${i + 1}) ${MEAS[p[2]].en}`).join('; '), picks.map((p, i) => `(${i + 1}) ${MEAS[p[2]].ms}`).join('; ')),
        w: W(...picks.map((p, i) => T(`(${i + 1}) ${cap(MEAS[p[2]].en)}: ${p[3]}.`, `(${i + 1}) ${cap(MEAS[p[2]].ms)}: ${p[4]}.`))), sp: 'm' };
    },
    (r) => { // why sd preferred over variance for reporting (context-wrapped)
      const c = r.pick(CTX);
      return { q: T(`For a report on ${c.en}, explain in one or two sentences why the standard deviation is generally preferred over the variance for describing the spread, even though both use every value in the data.`, `Untuk satu laporan tentang ${c.ms}, terangkan dalam satu atau dua ayat mengapa sisihan piawai secara umumnya lebih digemari berbanding varians untuk menerangkan serakan, walaupun kedua-duanya menggunakan setiap nilai dalam data.`),
        a: T('The standard deviation is in the same unit as the original data, so it can be interpreted directly, whereas the variance is in squared units, which usually has no direct real-world meaning.', 'Sisihan piawai berada dalam unit yang sama seperti data asal, jadi ia boleh ditafsir secara terus, manakala varians berada dalam unit kuasa dua, yang biasanya tidak mempunyai makna dunia sebenar yang terus.'), w: W(DEFN.variance, DEFN.sd, T('So the standard deviation can be compared directly with the data values.', 'Jadi sisihan piawai boleh dibandingkan terus dengan nilai data.')), sp: 'm' };
    },
    (r) => { // equal IQR, different range -> what it suggests
      const c = r.pick(CTX);
      return { q: T(`Two data sets on ${c.en} have the same interquartile range, but Data Set A has a much larger range than Data Set B. Explain what this suggests about extreme values in the two data sets.`, `Dua set data ${c.ms} mempunyai julat antara kuartil yang sama, tetapi Set Data A mempunyai julat yang jauh lebih besar daripada Set Data B. Terangkan apa yang ini menunjukkan tentang nilai ekstrem dalam kedua-dua set data itu.`),
        a: T('Since the middle 50% of the two data sets are equally spread (equal IQR) but A’s overall range is much larger, Data Set A most likely contains one or more extreme values (outliers) beyond the middle 50%, while Data Set B does not.', 'Oleh sebab 50% data tengah kedua-dua set adalah sama serakannya (JAK sama) tetapi julat keseluruhan A jauh lebih besar, Set Data A berkemungkinan besar mengandungi satu atau lebih nilai ekstrem (nilai terpencil) di luar 50% tengah, manakala Set Data B tidak.'), w: W(T('Equal IQR: the middle 50% of each set is equally spread.', 'JAK sama: 50% data tengah setiap set sama serakannya.'), T('Range = maximum - minimum depends on the two end values, so a much larger range for A comes from values far out at the ends.', 'Julat = maksimum - minimum bergantung pada dua nilai hujung, jadi julat A yang jauh lebih besar datang daripada nilai yang jauh di hujung.')), sp: 'm' };
    },
    (r) => { // outlier: range vs IQR, which is better, calculate both
      const c = r.pick(CTX), v = genGroup(r, c, 7).concat([r.pick([c.lo, c.hi + Math.round((c.hi - c.lo) * 1.5)])]);
      const out = v[v.length - 1];
      need(v.slice(0, -1).every((x) => Math.abs(x - out) >= (c.hi - c.lo) / 4)); // the extra value really is extreme
      const q = quart(v);
      return { q: T(`The data on ${c.en}, $${list(v)}$, include one extreme value. Calculate the range and the interquartile range, then state which is the more suitable measure of spread here and why.`, `Data ${c.ms}, $${list(v)}$, mengandungi satu nilai ekstrem. Kira julat dan julat antara kuartil, kemudian nyatakan yang manakah sukatan serakan yang lebih sesuai di sini dan sebabnya.`),
        a: T(`Range $= ${q.max - q.min}$; IQR $= ${n(q.q3 - q.q1)}$. The IQR is more suitable, since it is not distorted by the extreme value.`, `Julat $= ${q.max - q.min}$; JAK $= ${n(q.q3 - q.q1)}$. JAK lebih sesuai, kerana ia tidak terjejas oleh nilai ekstrem itu.`),
        w: W(rangeW(v), ...quartW(v, null, true), iqrW(v), T(`The range is inflated by the extreme value $${out}$; the IQR uses only the middle 50%.`, `Julat dibesarkan oleh nilai ekstrem $${out}$; JAK hanya menggunakan 50% di tengah.`)), sp: 'l' };
    },
    (r) => { // scenario -> recommend a measure
      const s = r.pick(SCEN);
      return { q: T(`Suppose ${s[0]}. Which measure of dispersion would you recommend using, and why?`, `Andaikan ${s[1]}. Sukatan serakan yang manakah anda cadangkan digunakan, dan mengapa?`),
        a: T(`${MEAS[s[2]].en}, because ${s[3]}.`, `${MEAS[s[2]].ms}, kerana ${s[4]}.`), w: W(DEFN[s[2]], T(`Key need here: ${s[3]}.`, `Keperluan utama di sini: ${s[4]}.`)), sp: 'm' };
    },
    (r) => { // interpreting variance vs sd
      const c = r.pick(CTX), u = c.en.match(/\(in ([^()]*)\)/);
      const unit = u ? u[1] : 'units';
      const varv = r.pick([16, 25, 36, 49, 64, 9]);
      return { q: T(`The variance of a data set on ${c.en} is ${varv} (${unit})$^2$. Explain why this value is difficult to interpret directly, then state the standard deviation and its unit.`, `Varians bagi satu set data ${c.ms} ialah ${varv} (${unit})$^2$. Terangkan mengapa nilai ini sukar ditafsir secara terus, kemudian nyatakan sisihan piawai dan unitnya.`),
        a: T(`The squared unit, (${unit})$^2$, has no direct real-world meaning; the standard deviation is $\\sqrt{${varv}} = ${Math.sqrt(varv)}$ ${unit}, which is easy to interpret since it matches the original data's unit.`, `Unit kuasa dua, (${unit})$^2$, tidak mempunyai makna dunia sebenar yang terus; sisihan piawai ialah $\\sqrt{${varv}} = ${Math.sqrt(varv)}$ ${unit}, yang mudah ditafsir kerana ia sepadan dengan unit data asal.`), w: W(T(`Standard deviation $= \\sqrt{\\text{variance}} = \\sqrt{${varv}} = ${Math.sqrt(varv)}$`, `Sisihan piawai $= \\sqrt{\\text{varians}} = \\sqrt{${varv}} = ${Math.sqrt(varv)}$`), T(`Unit: $\\sqrt{(\\text{unit})^2}$ = ${unit}.`, `Unit: $\\sqrt{(\\text{unit})^2}$ = ${unit}.`)), sp: 'm' };
    },
    (r) => { // critique a misleading range-based claim
      const c = r.pick(CTX), a = genGroup(r, c, 6).concat([r.pick([c.lo, c.hi + Math.round((c.hi - c.lo) * 1.2)])]);
      const b = genGroup(r, c, 7);
      const ra = Math.max(...a) - Math.min(...a), rb = Math.max(...b) - Math.min(...b);
      const qa = quart(a), qb = quart(b);
      need(ra > rb && a.slice(0, -1).every((x) => Math.abs(x - a[a.length - 1]) >= (c.hi - c.lo) / 4));
      return { q: T(`Group A: $${list(a)}$; Group B: $${list(b)}$ (${c.en}). A report claims Group B is more consistent than Group A because Group B's range (${rb}) is smaller than Group A's range (${ra}). Group A contains one extreme value. Explain why this conclusion may be misleading, and support your answer by calculating the interquartile range of each group.`, `Kumpulan A: $${list(a)}$; Kumpulan B: $${list(b)}$ (${c.ms}). Satu laporan mendakwa Kumpulan B lebih konsisten daripada Kumpulan A kerana julat Kumpulan B (${rb}) lebih kecil daripada julat Kumpulan A (${ra}). Kumpulan A mengandungi satu nilai ekstrem. Terangkan mengapa kesimpulan ini mungkin mengelirukan, dan sokong jawapan anda dengan mengira julat antara kuartil setiap kumpulan.`),
        a: T(`The range is distorted by Group A's extreme value; IQR: A $= ${n(qa.q3 - qa.q1)}$, B $= ${n(qb.q3 - qb.q1)}$. Comparing the IQR instead may reverse or change the conclusion about consistency.`, `Julat terjejas oleh nilai ekstrem Kumpulan A; JAK: A $= ${n(qa.q3 - qa.q1)}$, B $= ${n(qb.q3 - qb.q1)}$. Membandingkan JAK sebaliknya boleh mengubah atau membalikkan kesimpulan tentang konsistensi.`),
        w: W(T(`The range of A is inflated by the extreme value $${a[a.length - 1]}$.`, `Julat A dibesarkan oleh nilai ekstrem $${a[a.length - 1]}$.`), ...quartW(a, 'A', true), iqrW(a, 'A'), ...quartW(b, 'B', true), iqrW(b, 'B'),
          (qa.q3 - qa.q1) === (qb.q3 - qb.q1) ? T('Equal IQRs: the middle 50% of both groups is equally consistent.', 'JAK sama: 50% data tengah kedua-dua kumpulan sama konsisten.') : T(`By IQR, Group ${(qa.q3 - qa.q1) < (qb.q3 - qb.q1) ? 'A' : 'B'} is more consistent.`, `Berdasarkan JAK, Kumpulan ${(qa.q3 - qa.q1) < (qb.q3 - qb.q1) ? 'A' : 'B'} lebih konsisten.`)), sp: 'l' };
    },
    (r) => { // give one advantage AND one disadvantage of a named measure
      const key = r.pick(Object.keys(MEAS));
      const advDis = {
        range: [T('it is very quick to calculate', 'ia sangat cepat dikira'), T('it is highly sensitive to a single extreme value and uses only two of the data values', 'ia sangat sensitif terhadap satu nilai ekstrem dan hanya menggunakan dua daripada nilai data')],
        iqr: [T('it resists extreme values and describes the middle 50% of the data', 'ia tahan terhadap nilai ekstrem dan menerangkan 50% data di tengah'), T('it ignores the smallest 25% and the largest 25% of the ordered data', 'ia mengabaikan 25% terkecil dan 25% terbesar data tersusun')],
        variance: [T('it uses every value in the data set and is convenient for further algebraic work', 'ia menggunakan setiap nilai dalam set data dan mudah untuk kerja algebra selanjutnya'), T('its unit is the square of the original unit, which is hard to interpret directly', 'unitnya ialah kuasa dua unit asal, yang sukar ditafsir secara terus')],
        sd: [T('it uses every value in the data set and has the same unit as the original data', 'ia menggunakan setiap nilai dalam set data dan mempunyai unit yang sama seperti data asal'), T('it needs more calculation than the range and is still sensitive to extreme values', 'ia memerlukan lebih banyak pengiraan berbanding julat dan masih sensitif terhadap nilai ekstrem')],
      }[key];
      return { q: T(`State one advantage and one disadvantage of using the ${MEAS[key].en} as a measure of dispersion.`, `Nyatakan satu kelebihan dan satu kekurangan menggunakan ${MEAS[key].ms} sebagai sukatan serakan.`),
        a: T(`Advantage: ${advDis[0].en}. Disadvantage: ${advDis[1].en}.`, `Kelebihan: ${advDis[0].ms}. Kekurangan: ${advDis[1].ms}.`), w: W(DEFN[key]), sp: 'm' };
    },
  ];
  const g822a = [
    (r) => { // matching: 4 scenarios to the 4 measures, one-to-one, with justification required
      need(SCEN.filter((s) => s[2] === 'range').length && SCEN.filter((s) => s[2] === 'iqr').length && SCEN.filter((s) => s[2] === 'variance').length && SCEN.filter((s) => s[2] === 'sd').length);
      const picks = ['range', 'iqr', 'variance', 'sd'].map((k) => r.pick(SCEN.filter((s) => s[2] === k)));
      const order = r.shuffle(picks);
      const list4 = order.map((p, i) => `(${i + 1}) ${p[0]}`).join('; ');
      const list4m = order.map((p, i) => `(${i + 1}) ${p[1]}`).join('; ');
      return { q: T(`Each of the four situations below calls for a different one of the four measures of dispersion (range, interquartile range, variance, standard deviation), with no measure used twice. Match each situation to its measure, with a one-phrase reason: ${list4}.`, `Setiap satu daripada empat situasi di bawah memerlukan satu sukatan serakan yang berbeza daripada keempat-empat sukatan (julat, julat antara kuartil, varians, sisihan piawai), tanpa sukatan yang sama digunakan dua kali. Padankan setiap situasi dengan sukatannya, berserta satu sebab ringkas: ${list4m}.`),
        a: T(order.map((p, i) => `(${i + 1}) ${MEAS[p[2]].en} — ${p[3]}`).join('; '), order.map((p, i) => `(${i + 1}) ${MEAS[p[2]].ms} — ${p[4]}`).join('; ')),
        w: W(T('Match the clearest one first, then eliminate: each measure is used once.', 'Padankan yang paling jelas dahulu, kemudian singkirkan: setiap sukatan digunakan sekali.'), ...['range', 'iqr', 'variance', 'sd'].map((k) => DEFN[k])), sp: 'l' };
    },
    (r) => { // full multi-measure justification with an outlier
      const c = r.pick(CTX), v = genGroup(r, c, 7).concat([r.pick([c.lo, c.hi + Math.round((c.hi - c.lo) * 1.4)])]);
      need(v.slice(0, -1).every((x) => Math.abs(x - v[v.length - 1]) >= (c.hi - c.lo) / 4)); // the extra value really is extreme
      const q = quart(v);
      return { q: T(`The data on ${c.en}, $${list(v)}$, include one extreme value. Calculate the range, the interquartile range, the variance and the standard deviation. State which of these four measures is resistant to the extreme value and which are sensitive to it, then recommend the most suitable measure for describing this data set's typical spread, with a reason.`, `Data ${c.ms}, $${list(v)}$, mengandungi satu nilai ekstrem. Kira julat, julat antara kuartil, varians dan sisihan piawai. Nyatakan sukatan manakah antara keempat-empat ini yang tahan terhadap nilai ekstrem itu dan yang manakah sensitif terhadapnya, kemudian cadangkan sukatan yang paling sesuai untuk menerangkan serakan tipikal set data ini, berserta sebab.`),
        a: T(`Range $= ${q.max - q.min}$; IQR $= ${n(q.q3 - q.q1)}$; variance $= ${f2(varp(v))}$; s.d. $= ${f2(sd(v))}$. The IQR is resistant to the extreme value; the range, variance and standard deviation are all sensitive to it. The IQR is recommended for describing the typical spread here.`, `Julat $= ${q.max - q.min}$; JAK $= ${n(q.q3 - q.q1)}$; varians $= ${f2(varp(v))}$; s.p. $= ${f2(sd(v))}$. JAK tahan terhadap nilai ekstrem itu; julat, varians dan sisihan piawai semuanya sensitif terhadapnya. JAK disyorkan untuk menerangkan serakan tipikal di sini.`),
        w: W(rangeW(v), ...quartW(v, null, true), iqrW(v), ...varV(v, { sd: true }), T(`The extreme value $${v[v.length - 1]}$ enters the range and $\\sum x^2$ directly, but not $Q_1$ or $Q_3$.`, `Nilai ekstrem $${v[v.length - 1]}$ masuk terus ke dalam julat dan $\\sum x^2$, tetapi tidak ke dalam $Q_1$ atau $Q_3$.`)), sp: 'l' };
    },
    (r) => { // critique an oversimplified claim
      const claim = r.pick([
        ['"The variance is always the best measure of dispersion because it uses every value in the data set."', '"Varians sentiasa merupakan sukatan serakan yang terbaik kerana ia menggunakan setiap nilai dalam set data."'],
        ['"The standard deviation should always be used instead of the range, since a bigger measure is always more informative."', '"Sisihan piawai sepatutnya sentiasa digunakan berbanding julat, kerana sukatan yang lebih besar sentiasa lebih memberi maklumat."'],
        ['"Since the interquartile range ignores half the data, it should never be used."', '"Oleh sebab julat antara kuartil mengabaikan separuh data, ia tidak sepatutnya sekali-kali digunakan."'],
      ]);
      return { q: T(`A student claims: ${claim[0]} Explain why this is an oversimplification, referring to at least one weakness of the recommended measure and one situation in which another measure would be more suitable.`, `Seorang murid mendakwa: ${claim[1]} Terangkan mengapa ini terlalu ringkas, dengan merujuk sekurang-kurangnya satu kelemahan sukatan yang disyorkan dan satu situasi apabila sukatan lain lebih sesuai.`),
        a: T('No single measure is universally best: variance has squared units and is sensitive to extremes (better replaced by IQR when outliers are present); a larger value is not automatically more useful, since standard deviation needs more calculation and is also sensitive to extremes, so range can still suffice for a quick check; and IQR, though it ignores half the data, is exactly what makes it resistant to extremes, which is valuable when robustness matters.', 'Tiada satu sukatan yang sentiasa terbaik: varians mempunyai unit kuasa dua dan sensitif terhadap nilai ekstrem (lebih baik digantikan dengan JAK apabila terdapat nilai terpencil); nilai yang lebih besar tidak semestinya lebih berguna, kerana sisihan piawai memerlukan lebih banyak pengiraan dan juga sensitif terhadap nilai ekstrem, jadi julat masih memadai untuk semakan pantas; dan JAK, walaupun mengabaikan separuh data, itulah justeru yang menjadikannya tahan terhadap nilai ekstrem, yang bernilai apabila kekukuhan penting.'), w: W(...['range', 'iqr', 'variance', 'sd'].map((k) => DEFN[k]), T('Each has a strength and a weakness, so the best choice depends on the data (outliers?) and the purpose.', 'Setiap satu mempunyai kekuatan dan kelemahan, jadi pilihan terbaik bergantung pada data (ada nilai terpencil?) dan tujuannya.')), sp: 'l' };
    },
    (r) => { // recommend for a non-technical report, justified on 3 criteria
      const c = r.pick(CTX);
      return { q: T(`A researcher must compare the consistency of two data sets on ${c.en} for a report to a non-technical audience. Recommend a single measure of dispersion, justifying your choice in terms of (a) interpretability, (b) robustness to outliers, and (c) unit.`, `Seorang penyelidik perlu membandingkan konsistensi dua set data tentang ${c.ms} untuk satu laporan kepada khalayak bukan teknikal. Cadangkan satu sukatan serakan, dengan menjustifikasikan pilihan anda dari segi (a) kebolehtafsiran, (b) kekukuhan terhadap nilai terpencil, dan (c) unit.`),
        a: T('Standard deviation is generally recommended for a non-technical report: (a) it is more directly interpretable than variance since it shares the data’s unit, (b) it is more informative than the range as it uses every value, though (c) like the range it remains sensitive to outliers, so the data should first be checked for extreme values or the IQR used instead if any are found.', 'Sisihan piawai secara umumnya disyorkan untuk laporan bukan teknikal: (a) ia lebih mudah ditafsir berbanding varians kerana ia berkongsi unit data, (b) ia lebih memberi maklumat berbanding julat kerana ia menggunakan setiap nilai, walaupun (c) seperti julat ia masih sensitif terhadap nilai terpencil, jadi data perlu disemak dahulu untuk nilai ekstrem atau JAK digunakan sebaliknya jika ditemui.'), w: W(T('(a) The standard deviation is in the original unit; the variance is squared.', '(a) Sisihan piawai dalam unit asal; varians dalam unit kuasa dua.'), T('(b) Range, variance and standard deviation are all affected by outliers; only the IQR resists them.', '(b) Julat, varians dan sisihan piawai semuanya terjejas oleh nilai terpencil; hanya JAK tahan terhadapnya.'), T('(c) $\\sigma = \\sqrt{\\sigma^2}$ has the same unit as the data.', '(c) $\\sigma = \\sqrt{\\sigma^2}$ mempunyai unit yang sama dengan data.')), sp: 'l' };
    },
    (r) => { // rank all four measures by sensitivity to an outlier, using real computed values
      const c = r.pick(CTX), core = genGroup(r, c, 7);
      const out = c.hi + Math.round((c.hi - c.lo) * 1.5);
      const before = core, after = core.concat([out]);
      const qb = quart(before), qa = quart(after);
      /* rank by actual percentage change, not by a "typical" order */
      const ms4 = [['iqr', qb.q3 - qb.q1, qa.q3 - qa.q1], ['sd', sd(before), sd(after)], ['variance', varp(before), varp(after)], ['range', qb.max - qb.min, qa.max - qa.min]]
        .map(([k, b0, a0]) => ({ k, b0, a0, pc: b0 > 0 ? (Math.abs(a0 - b0) / b0) * 100 : NaN }));
      need(ms4.every((m) => m.pc === m.pc) && new Set(ms4.map((m) => round(m.pc, 1))).size === 4);
      const rk = ms4.slice().sort((x, y) => x.pc - y.pc);
      return { q: T(`For the data on ${c.en}, $${list(before)}$, one extreme value ${out} is then added. Calculate the range, interquartile range, variance and standard deviation before and after, then rank the four measures from least affected to most affected by the addition (as a percentage or ratio change, or by inspection).`, `Bagi data ${c.ms}, $${list(before)}$, satu nilai ekstrem ${out} kemudian ditambah. Kira julat, julat antara kuartil, varians dan sisihan piawai sebelum dan selepas, kemudian susun keempat-empat sukatan itu daripada paling kurang terjejas kepada paling terjejas oleh penambahan itu (sebagai peratusan atau nisbah perubahan, atau melalui pemeriksaan).`),
        a: T(`Before: range ${qb.max - qb.min}, IQR ${n(qb.q3 - qb.q1)}, variance ${f2(varp(before))}, s.d. ${f2(sd(before))}. After: range ${qa.max - qa.min}, IQR ${n(qa.q3 - qa.q1)}, variance ${f2(varp(after))}, s.d. ${f2(sd(after))}. Least to most affected: ${rk.map((m) => MEAS[m.k].en).join(', ')}.`, `Sebelum: julat ${qb.max - qb.min}, JAK ${n(qb.q3 - qb.q1)}, varians ${f2(varp(before))}, s.p. ${f2(sd(before))}. Selepas: julat ${qa.max - qa.min}, JAK ${n(qa.q3 - qa.q1)}, varians ${f2(varp(after))}, s.p. ${f2(sd(after))}. Paling kurang kepada paling terjejas: ${rk.map((m) => MEAS[m.k].ms).join(', ')}.`),
        w: W(T('Before:', 'Sebelum:'), rangeW(before), ...quartW(before, null, true), iqrW(before), ...varV(before, { sd: true }),
          T('After:', 'Selepas:'), rangeW(after), ...quartW(after, null, true), iqrW(after), ...varV(after, { sd: true }),
          ...ms4.map((m) => { const pc = `${n(round(m.pc, 1)) === n(m.pc) ? '=' : '\\approx'} ${n(round(m.pc, 1))}\\%`; return T(`${cap(MEAS[m.k].en)}: $${f2(m.b0)} \\to ${f2(m.a0)}$, change $${pc}$`, `${cap(MEAS[m.k].ms)}: $${f2(m.b0)} \\to ${f2(m.a0)}$, perubahan $${pc}$`); }),
          T('Order the percentage changes from smallest to largest.', 'Susun peratusan perubahan daripada terkecil kepada terbesar.')), sp: 'l' };
    },
  ];
  SPM.extend('F4-8.2.2', { e: g822e, m: g822m, a: g822a });

  /* =============================================================== 8.2.3 Boxplots */
  /** reading the five-number summary off a boxplot */
  const boxRead = (q) => [
    T(`Left end of the whisker: minimum $= ${n(q.min)}$; left edge of the box: $Q_1 = ${n(q.q1)}$`, `Hujung kiri sesungguk: minimum $= ${n(q.min)}$; tepi kiri kotak: $Q_1 = ${n(q.q1)}$`),
    T(`Line inside the box: median $= ${n(q.med)}$`, `Garis dalam kotak: median $= ${n(q.med)}$`),
    T(`Right edge of the box: $Q_3 = ${n(q.q3)}$; right end of the whisker: maximum $= ${n(q.max)}$`, `Tepi kanan kotak: $Q_3 = ${n(q.q3)}$; hujung kanan sesungguk: maksimum $= ${n(q.max)}$`)];
  const iqrQ = (q, g) => T(`${lb(g)}IQR $= Q_3 - Q_1 = ${n(q.q3)} - ${n(q.q1)} = ${n(q.q3 - q.q1)}$`, `${lb(g)}JAK $= Q_3 - Q_1 = ${n(q.q3)} - ${n(q.q1)} = ${n(q.q3 - q.q1)}$`);
  const whiskW = (q) => [
    T(`Left whisker $= Q_1 - \\text{min} = ${n(q.q1)} - ${n(q.min)} = ${n(q.q1 - q.min)}$`, `Sesungguk kiri $= Q_1 - \\text{min} = ${n(q.q1)} - ${n(q.min)} = ${n(q.q1 - q.min)}$`),
    T(`Right whisker $= \\text{max} - Q_3 = ${n(q.max)} - ${n(q.q3)} = ${n(q.max - q.q3)}$`, `Sesungguk kanan $= \\text{max} - Q_3 = ${n(q.max)} - ${n(q.q3)} = ${n(q.max - q.q3)}$`)];
  const boxScale = (q) => [Math.floor(q.min / 5) * 5 - (q.min % 5 === 0 ? 5 : 0), Math.ceil(q.max / 5) * 5 + (q.max % 5 === 0 ? 5 : 0)];
  const g823e = [
    (r) => { // full five-number summary read
      const c = r.pick(CTX), v = genGroup(r, c, 9), q = quart(v);
      const [lo, hi] = boxScale(q);
      const fig = boxFig([q], lo, hi);
      return { q: T(`The boxplot shows ${c.en}. Read off the five-number summary (minimum, $Q_1$, median, $Q_3$, maximum).`, `Plot kotak menunjukkan ${c.ms}. Baca ringkasan lima nombor (minimum, $Q_1$, median, $Q_3$, maksimum).`), fig,
        a: T(`${q.min}, ${n(q.q1)}, ${n(q.med)}, ${n(q.q3)}, ${q.max}`), w: W(...boxRead(q)), sp: 's' };
    },
    (r) => { // single value read
      const c = r.pick(CTX), v = genGroup(r, c, 9), q = quart(v);
      const [lo, hi] = boxScale(q);
      const fig = boxFig([q], lo, hi);
      const which = r.pick(['min', 'q1', 'med', 'q3', 'max']);
      const label = { min: T('minimum', 'minimum'), q1: T('first quartile, $Q_1$', 'kuartil pertama, $Q_1$'), med: T('median', 'median'), q3: T('third quartile, $Q_3$', 'kuartil ketiga, $Q_3$'), max: T('maximum', 'maksimum') }[which];
      return { q: T(`The boxplot shows ${c.en}. State the ${label.en} of the data.`, `Plot kotak menunjukkan ${c.ms}. Nyatakan ${label.ms} data itu.`), fig, a: T(String(n(q[which]))),
        w: W({ min: T('Minimum = left end of the left whisker.', 'Minimum = hujung kiri sesungguk kiri.'), q1: T('$Q_1$ = left edge of the box.', '$Q_1$ = tepi kiri kotak.'), med: T('Median = the line inside the box.', 'Median = garis di dalam kotak.'), q3: T('$Q_3$ = right edge of the box.', '$Q_3$ = tepi kanan kotak.'), max: T('Maximum = right end of the right whisker.', 'Maksimum = hujung kanan sesungguk kanan.') }[which], `$${n(q[which])}$`), sp: 's' };
    },
    (r) => { // range/IQR directly from the boxplot
      const c = r.pick(CTX), v = genGroup(r, c, 9), q = quart(v);
      const [lo, hi] = boxScale(q);
      const fig = boxFig([q], lo, hi);
      const which = r.pick(['range', 'iqr']);
      return { q: T(`The boxplot shows ${c.en}. Find the ${which === 'range' ? 'range' : 'interquartile range'} of the data.`, `Plot kotak menunjukkan ${c.ms}. Cari ${which === 'range' ? 'julat' : 'julat antara kuartil'} data itu.`), fig,
        a: T(`$${which === 'range' ? q.max - q.min : n(q.q3 - q.q1)}$`),
        w: W(which === 'range' ? T(`Range = right whisker end - left whisker end $= ${q.max} - ${q.min} = ${q.max - q.min}$`, `Julat = hujung sesungguk kanan - hujung sesungguk kiri $= ${q.max} - ${q.min} = ${q.max - q.min}$`) : T(`IQR = right edge of box - left edge of box $= ${n(q.q3)} - ${n(q.q1)} = ${n(q.q3 - q.q1)}$`, `JAK = tepi kanan kotak - tepi kiri kotak $= ${n(q.q3)} - ${n(q.q1)} = ${n(q.q3 - q.q1)}$`)), sp: 's' };
    },
    (r) => { // box edges vs min/max misconception
      const c = r.pick(CTX), v = genGroup(r, c, 9), q = quart(v);
      const [lo, hi] = boxScale(q);
      const fig = boxFig([q], lo, hi);
      return { q: T(`The boxplot shows ${c.en}. A student says the left edge of the box is the minimum value. Is this correct? State the actual minimum and the actual left edge of the box.`, `Plot kotak menunjukkan ${c.ms}. Seorang murid berkata tepi kiri kotak ialah nilai minimum. Adakah ini betul? Nyatakan minimum sebenar dan tepi kiri kotak sebenar.`), fig,
        a: T(`No: the left edge of the box is $Q_1 = ${n(q.q1)}$, not the minimum. The actual minimum is ${q.min} (the left end of the whisker).`, `Tidak: tepi kiri kotak ialah $Q_1 = ${n(q.q1)}$, bukan minimum. Minimum sebenar ialah ${q.min} (hujung kiri sesungguk).`),
        w: W(T('The box spans $Q_1$ to $Q_3$; the whiskers extend out to the minimum and maximum.', 'Kotak merentang dari $Q_1$ hingga $Q_3$; sesungguk memanjang ke minimum dan maksimum.'), boxRead(q)[0]), sp: 'm' };
    },
    (r) => { // possible / impossible value
      const c = r.pick(CTX), v = genGroup(r, c, 9), q = quart(v);
      const [lo, hi] = boxScale(q);
      const fig = boxFig([q], lo, hi);
      const inside = r.chance();
      const val = inside ? r.int(q.min, q.max) : (r.chance() ? q.min - r.int(1, 5) : q.max + r.int(1, 5));
      return { q: T(`The boxplot shows ${c.en}. Based on the boxplot, could the value ${n(val)} be one of the data values? Explain.`, `Plot kotak menunjukkan ${c.ms}. Berdasarkan plot kotak, bolehkah nilai ${n(val)} menjadi salah satu nilai data itu? Terangkan.`), fig,
        a: inside ? T(`Possibly: ${n(val)} lies within the data's range ($${q.min}$ to $${q.max}$).`, `Berkemungkinan: ${n(val)} terletak dalam julat data itu ($${q.min}$ hingga $${q.max}$).`) : T(`No: ${n(val)} lies outside the data's range ($${q.min}$ to $${q.max}$), so it cannot be one of the values shown.`, `Tidak: ${n(val)} terletak di luar julat data itu ($${q.min}$ hingga $${q.max}$), jadi ia tidak boleh menjadi salah satu nilai yang ditunjukkan.`),
        w: W(T(`Every data value lies between the minimum $${q.min}$ and the maximum $${q.max}$.`, `Setiap nilai data terletak antara minimum $${q.min}$ dan maksimum $${q.max}$.`),
          inside ? T(`$${q.min} \\le ${n(val)} \\le ${q.max}$, so it could be a value (the boxplot cannot confirm it is).`, `$${q.min} \\le ${n(val)} \\le ${q.max}$, jadi ia mungkin satu nilai (plot kotak tidak dapat mengesahkannya).`)
            : val < q.min ? T(`$${n(val)} < ${q.min}$, below the minimum.`, `$${n(val)} < ${q.min}$, di bawah minimum.`) : T(`$${n(val)} > ${q.max}$, above the maximum.`, `$${n(val)} > ${q.max}$, di atas maksimum.`)), sp: 'm' };
    },
  ];
  const g823m = [
    (r) => { // construct from a list, state range & IQR
      const c = r.pick(CTX), v = genGroup(r, c, r.pick([9, 10, 11])), q = quart(v);
      const [lo, hi] = boxScale(q);
      const fig = boxFig([q], lo, hi);
      return { q: T(`The data on ${c.en} are $${list(sortNum(v))}$. Construct a boxplot for this data, and state the range and the interquartile range.`, `Data ${c.ms} ialah $${list(sortNum(v))}$. Bina plot kotak bagi data ini, dan nyatakan julat dan julat antara kuartil.`),
        a: T(`${fig} Five-number summary: ${q.min}, ${n(q.q1)}, ${n(q.med)}, ${n(q.q3)}, ${q.max}; range ${q.max - q.min}; IQR ${n(q.q3 - q.q1)}`, `${fig} Ringkasan lima nombor: ${q.min}, ${n(q.q1)}, ${n(q.med)}, ${n(q.q3)}, ${q.max}; julat ${q.max - q.min}; JAK ${n(q.q3 - q.q1)}`),
        w: W(medW(v), ...quartW(v), rangeW(v), iqrW(v), T('Draw the box from $Q_1$ to $Q_3$ with a line at the median, and whiskers out to the minimum and maximum, on a scale.', 'Lukis kotak dari $Q_1$ hingga $Q_3$ dengan garis pada median, dan sesungguk hingga minimum dan maksimum, pada satu skala.')), sp: 'l' };
    },
    (r) => { // two boxplots on common scale: compare median & IQR, choose more consistent
      const c = r.pick(CTX), a = quart(genGroup(r, c, 9)), b = quart(genGroup(r, c, 9));
      need(a.q3 - a.q1 !== b.q3 - b.q1);
      a.label = 'A'; b.label = 'B';
      const lo = Math.min(...boxScale(a), ...boxScale(b)), hi = Math.max(...boxScale(a), ...boxScale(b));
      const fig = boxFig([a, b], lo, hi);
      return { q: T(`Two boxplots compare ${c.en} for Class A and Class B on the same scale. State the median and the interquartile range of each class, and say which class is more consistent.`, `Dua plot kotak membandingkan ${c.ms} bagi Kelas A dan Kelas B pada skala yang sama. Nyatakan median dan julat antara kuartil setiap kelas, dan katakan kelas yang manakah lebih konsisten.`), fig,
        a: T(`Median: A $= ${n(a.med)}$, B $= ${n(b.med)}$. IQR: A $= ${n(a.q3 - a.q1)}$, B $= ${n(b.q3 - b.q1)}$. ${(a.q3 - a.q1) <= (b.q3 - b.q1) ? 'A' : 'B'} is more consistent (smaller IQR).`, `Median: A $= ${n(a.med)}$, B $= ${n(b.med)}$. JAK: A $= ${n(a.q3 - a.q1)}$, B $= ${n(b.q3 - b.q1)}$. ${(a.q3 - a.q1) <= (b.q3 - b.q1) ? 'A' : 'B'} lebih konsisten (JAK lebih kecil).`),
        w: W(T(`Median = line inside each box: A $= ${n(a.med)}$, B $= ${n(b.med)}$`, `Median = garis dalam setiap kotak: A $= ${n(a.med)}$, B $= ${n(b.med)}$`), iqrQ(a, 'A'), iqrQ(b, 'B'), T(`Smaller IQR (shorter box) = more consistent: Class ${a.q3 - a.q1 < b.q3 - b.q1 ? 'A' : 'B'}.`, `JAK lebih kecil (kotak lebih pendek) = lebih konsisten: Kelas ${a.q3 - a.q1 < b.q3 - b.q1 ? 'A' : 'B'}.`)), sp: 'l' };
    },
    (r) => { // shape description via whisker lengths & median position
      const c = r.pick(CTX), v = genGroup(r, c, 9), q = quart(v);
      const [lo, hi] = boxScale(q);
      const fig = boxFig([q], lo, hi);
      const leftWhisker = q.q1 - q.min, rightWhisker = q.max - q.q3;
      const ratio = Math.max(leftWhisker, rightWhisker) / Math.max(0.5, Math.min(leftWhisker, rightWhisker));
      const roughlySym = ratio <= 1.4;
      return { q: T(`The boxplot shows ${c.en}. Compare the length of the left whisker with the right whisker, and describe whether the data set appears roughly symmetric or skewed.`, `Plot kotak menunjukkan ${c.ms}. Bandingkan panjang sesungguk kiri dengan sesungguk kanan, dan huraikan sama ada set data itu kelihatan lebih kurang simetri atau senget.`), fig,
        a: T(`Left whisker $= ${n(leftWhisker)}$, right whisker $= ${n(rightWhisker)}$. ${roughlySym ? 'The whiskers are close in length, suggesting a roughly symmetric spread.' : leftWhisker > rightWhisker ? 'The left whisker is clearly longer, suggesting the data is more spread out on the lower side.' : 'The right whisker is clearly longer, suggesting the data is more spread out on the upper side.'}`, `Sesungguk kiri $= ${n(leftWhisker)}$, sesungguk kanan $= ${n(rightWhisker)}$. ${roughlySym ? 'Sesungguk hampir sama panjang, menunjukkan serakan yang lebih kurang simetri.' : leftWhisker > rightWhisker ? 'Sesungguk kiri jelas lebih panjang, menunjukkan data lebih bertaburan di bahagian bawah.' : 'Sesungguk kanan jelas lebih panjang, menunjukkan data lebih bertaburan di bahagian atas.'}`),
        w: W(...whiskW(q), T('Whiskers of similar length suggest symmetry; a clearly longer whisker shows the data stretch further on that side.', 'Sesungguk yang hampir sama panjang menunjukkan simetri; sesungguk yang jelas lebih panjang menunjukkan data lebih terentang pada bahagian itu.')), sp: 'm' };
    },
    (r) => { // equal-width intervals misconception
      const c = r.pick(CTX), v = genGroup(r, c, 9), q = quart(v);
      const [lo, hi] = boxScale(q);
      const fig = boxFig([q], lo, hi);
      return { q: T(`The boxplot shows ${c.en}. The four intervals between the minimum, $Q_1$, median, $Q_3$ and maximum may look like different widths. Does an interval that looks wider always contain more data values than a narrower one? Explain.`, `Plot kotak menunjukkan ${c.ms}. Empat selang antara minimum, $Q_1$, median, $Q_3$ dan maksimum mungkin kelihatan berbeza lebarnya. Adakah selang yang kelihatan lebih lebar sentiasa mengandungi lebih banyak nilai data berbanding selang yang lebih sempit? Terangkan.`), fig,
        a: T('No: each of the four intervals represents about a quarter of the ordered data values (roughly equal counts), regardless of how wide it looks. A wider interval only means those values are more spread out, not that there are more of them.', 'Tidak: setiap satu daripada empat selang mewakili lebih kurang satu perempat nilai data tersusun (bilangan yang lebih kurang sama), tanpa mengira lebar kelihatannya. Selang yang lebih lebar hanya bermaksud nilai itu lebih bertaburan, bukan bilangannya lebih banyak.'),
        w: W(T('Minimum, $Q_1$, median, $Q_3$ and maximum cut the ordered data into four parts of about 25% each.', 'Minimum, $Q_1$, median, $Q_3$ dan maksimum membahagikan data tersusun kepada empat bahagian, setiap satu lebih kurang 25%.'), T('So width shows how spread out a quarter of the data is, not how many values it holds.', 'Jadi lebar menunjukkan serakan satu perempat data, bukan bilangan nilainya.')), sp: 'm' };
    },
  ];
  const g823a = [
    (r) => { // match boxplot to the correct five-number summary among two candidates
      const c = r.pick(CTX), v = genGroup(r, c, 9), q = quart(v);
      const wrongField = r.pick(['q1', 'med', 'q3']);
      const bad = Object.assign({}, q);
      bad[wrongField] = wrongField === 'med' ? n(round((q.q1 + q.med) / 2, 1)) : n(round((q[wrongField] + (wrongField === 'q1' ? q.min : q.max)) / 2, 1));
      need(+bad[wrongField] !== q[wrongField]); // otherwise both boxplots are identical
      const [lo, hi] = boxScale(q);
      const order = r.chance();
      const A = boxFig([Object.assign({}, order ? q : bad, { label: '1' })], lo, hi);
      const B = boxFig([Object.assign({}, order ? bad : q, { label: '2' })], lo, hi);
      const correctLabel = order ? '1' : '2';
      return { q: T(`The data on ${c.en} are $${list(sortNum(v))}$. Two boxplots, 1 and 2, are shown; only one correctly represents this data's five-number summary. State which one is correct, and identify the error in the other.`, `Data ${c.ms} ialah $${list(sortNum(v))}$. Dua plot kotak, 1 dan 2, ditunjukkan; hanya satu yang mewakili ringkasan lima nombor data ini dengan betul. Nyatakan yang manakah betul, dan kenal pasti kesilapan pada yang satu lagi.`), fig: A + B,
        a: T(`Plot ${correctLabel} is correct. The other plot shows the ${wrongField === 'q1' ? '$Q_1$' : wrongField === 'med' ? 'median' : '$Q_3$'} in the wrong position (should be ${n(q[wrongField])}, not ${bad[wrongField]}).`, `Plot ${correctLabel} adalah betul. Plot yang satu lagi menunjukkan ${wrongField === 'q1' ? '$Q_1$' : wrongField === 'med' ? 'median' : '$Q_3$'} pada kedudukan yang salah (sepatutnya ${n(q[wrongField])}, bukan ${bad[wrongField]}).`),
        w: W(medW(v), ...quartW(v), T(`Five-number summary: $${q.min}, ${n(q.q1)}, ${n(q.med)}, ${n(q.q3)}, ${q.max}$; compare it with each boxplot.`, `Ringkasan lima nombor: $${q.min}, ${n(q.q1)}, ${n(q.med)}, ${n(q.q3)}, ${q.max}$; bandingkan dengan setiap plot kotak.`)), sp: 'l' };
    },
    (r) => { // what CAN and CANNOT be determined from a boxplot
      const c = r.pick(CTX), v = genGroup(r, c, 9), q = quart(v);
      const [lo, hi] = boxScale(q);
      const fig = boxFig([q], lo, hi);
      const cannot = r.pick([T('the exact number of data values', 'bilangan tepat nilai data'), T('the mean of the data', 'min data itu'), T('the mode of the data', 'mod data itu')]);
      return { q: T(`The boxplot shows ${c.en}. Can you determine ${cannot.en} directly from this boxplot? Explain, and state two things you CAN determine from it.`, `Plot kotak menunjukkan ${c.ms}. Bolehkah anda menentukan ${cannot.ms} secara terus daripada plot kotak ini? Terangkan, dan nyatakan dua perkara yang BOLEH anda tentukan daripadanya.`), fig,
        a: T(`No, an ordinary boxplot does not show ${cannot.en}. You CAN determine the five-number summary (minimum, $Q_1$, median, $Q_3$, maximum), and hence the range and interquartile range.`, `Tidak, plot kotak biasa tidak menunjukkan ${cannot.ms}. Anda BOLEH menentukan ringkasan lima nombor (minimum, $Q_1$, median, $Q_3$, maksimum), dan seterusnya julat dan julat antara kuartil.`),
        w: W(T('A boxplot is drawn from five numbers only; the individual values between them are not shown.', 'Plot kotak dilukis daripada lima nombor sahaja; nilai individu di antaranya tidak ditunjukkan.'), ...boxRead(q), T(`So range $= ${q.max} - ${q.min} = ${q.max - q.min}$ and IQR $= ${n(q.q3)} - ${n(q.q1)} = ${n(q.q3 - q.q1)}$ can be found.`, `Jadi julat $= ${q.max} - ${q.min} = ${q.max - q.min}$ dan JAK $= ${n(q.q3)} - ${n(q.q1)} = ${n(q.q3 - q.q1)}$ boleh dicari.`)), sp: 'm' };
    },
    (r) => { // critique an unjustified symmetry claim using real (unequal) whiskers
      const c = r.pick(CTX), v = genGroup(r, c, 9), q = quart(v);
      const leftWhisker0 = q.q1 - q.min, rightWhisker0 = q.max - q.q3;
      need(Math.max(leftWhisker0, rightWhisker0) / Math.max(0.5, Math.min(leftWhisker0, rightWhisker0)) >= 1.5);
      const [lo, hi] = boxScale(q);
      const fig = boxFig([q], lo, hi);
      const leftWhisker = leftWhisker0, rightWhisker = rightWhisker0;
      return { q: T(`The boxplot shows ${c.en}. A student claims the data set is symmetric because the median line divides the box into two halves. Comment on this claim, referring to the actual whisker lengths shown.`, `Plot kotak menunjukkan ${c.ms}. Seorang murid mendakwa set data itu simetri kerana garis median membahagikan kotak kepada dua bahagian. Beri komen tentang dakwaan ini, dengan merujuk kepada panjang sesungguk sebenar yang ditunjukkan.`), fig,
        a: T(`The claim is not fully justified: the median splitting the box does not by itself establish symmetry, since the whiskers differ noticeably in length (left $= ${n(leftWhisker)}$, right $= ${n(rightWhisker)}$), which indicates the data is skewed rather than symmetric.`, `Dakwaan itu tidak wajar sepenuhnya: median membahagikan kotak tidak dengan sendirinya membuktikan simetri, kerana sesungguk berbeza panjang dengan ketara (kiri $= ${n(leftWhisker)}$, kanan $= ${n(rightWhisker)}$), yang menunjukkan data itu senget dan bukan simetri.`),
        w: W(...whiskW(q), T('Symmetry needs both a central median line and whiskers of similar length; here the whiskers differ clearly.', 'Simetri memerlukan garis median di tengah dan sesungguk yang hampir sama panjang; di sini sesungguk jelas berbeza.')), sp: 'l' };
    },
    (r) => { // compare 3 boxplots, choose based on stated purpose
      const c = r.pick(CTX);
      const qs = [quart(genGroup(r, c, 8)), quart(genGroup(r, c, 8)), quart(genGroup(r, c, 8))];
      const labels = ['A', 'B', 'C'];
      qs.forEach((q, i) => (q.label = labels[i]));
      const lo = Math.min(...qs.flatMap(boxScale)), hi = Math.max(...qs.flatMap(boxScale));
      const fig = boxFig(qs, lo, hi);
      const purpose = r.pick(['highest', 'consistent']);
      const key4 = purpose === 'highest' ? qs.map((q) => q.med) : qs.map((q) => q.q3 - q.q1);
      need(key4.filter((x) => x === (purpose === 'highest' ? Math.max(...key4) : Math.min(...key4))).length === 1); // a unique best class
      const best = purpose === 'highest' ? qs.reduce((p, q) => (q.med > p.med ? q : p)).label : qs.reduce((p, q) => (q.q3 - q.q1 < p.q3 - p.q1 ? q : p)).label;
      return { q: T(`Boxplots for classes A, B and C on ${c.en} are compared on the same scale. Which class should be chosen if the goal is to find the class with the ${purpose === 'highest' ? 'highest typical (median) value' : 'most consistent (smallest spread) performance'}? Justify with the relevant statistic(s) for each class.`, `Plot kotak bagi kelas A, B dan C tentang ${c.ms} dibandingkan pada skala yang sama. Kelas manakah patut dipilih jika matlamatnya ialah mencari kelas dengan ${purpose === 'highest' ? 'nilai tipikal (median) tertinggi' : 'prestasi paling konsisten (serakan terkecil)'}? Justifikasikan dengan statistik berkaitan bagi setiap kelas.`), fig,
        a: T(`Median: A $= ${n(qs[0].med)}$, B $= ${n(qs[1].med)}$, C $= ${n(qs[2].med)}$. IQR: A $= ${n(qs[0].q3 - qs[0].q1)}$, B $= ${n(qs[1].q3 - qs[1].q1)}$, C $= ${n(qs[2].q3 - qs[2].q1)}$. Class ${best} best meets the stated goal.`, `Median: A $= ${n(qs[0].med)}$, B $= ${n(qs[1].med)}$, C $= ${n(qs[2].med)}$. JAK: A $= ${n(qs[0].q3 - qs[0].q1)}$, B $= ${n(qs[1].q3 - qs[1].q1)}$, C $= ${n(qs[2].q3 - qs[2].q1)}$. Kelas ${best} paling memenuhi matlamat yang dinyatakan.`),
        w: W(...(purpose === 'highest' ? [T(`Median = line inside each box: A $= ${n(qs[0].med)}$, B $= ${n(qs[1].med)}$, C $= ${n(qs[2].med)}$`, `Median = garis dalam setiap kotak: A $= ${n(qs[0].med)}$, B $= ${n(qs[1].med)}$, C $= ${n(qs[2].med)}$`), T(`Highest median: Class ${best}.`, `Median tertinggi: Kelas ${best}.`)]
          : [...qs.map((q) => iqrQ(q, q.label)), T(`Smallest IQR (shortest box): Class ${best}.`, `JAK terkecil (kotak terpendek): Kelas ${best}.`)])), sp: 'l' };
    },
  ];
  SPM.extend('F4-8.2.3', { e: g823e, m: g823m, a: g823a });

  /* =============================================================== 8.2.4 Effects of changes to data */
  const g824e = [
    (r) => { // translation: add constant b, state new mean and unchanged spread
      const c = r.pick(CTX), v = genGroup(r, c, 6), b = r.pick([-5, -3, -2, 2, 3, 5, 8]);
      const which = r.pick(['range', 'sd']);
      const orig = which === 'range' ? Math.max(...v) - Math.min(...v) : sd(v);
      return { q: T(`The data on ${c.en}, $${list(v)}$, have mean ${f2(mean(v))} and ${which === 'range' ? 'range' : 'standard deviation'} ${which === 'range' ? orig : f2(orig)}. If ${b} is added to every value, state the new mean and the new ${which === 'range' ? 'range' : 'standard deviation'}.`, `Data ${c.ms}, $${list(v)}$, mempunyai min ${f2(mean(v))} dan ${which === 'range' ? 'julat' : 'sisihan piawai'} ${which === 'range' ? orig : f2(orig)}. Jika ${b} ditambah kepada setiap nilai, nyatakan min baharu dan ${which === 'range' ? 'julat' : 'sisihan piawai'} baharu.`),
        a: T(`New mean $= ${f2(mean(v) + b)}$; ${which === 'range' ? 'range' : 'standard deviation'} unchanged ($${which === 'range' ? orig : f2(orig)}$).`, `Min baharu $= ${f2(mean(v) + b)}$; ${which === 'range' ? 'julat' : 'sisihan piawai'} tidak berubah ($${which === 'range' ? orig : f2(orig)}$).`),
        w: W(T(`Every value increases by $${b}$, so the mean does too: $${f2(mean(v))} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${f2(mean(v) + b)}$`, `Setiap nilai bertambah $${b}$, jadi min juga: $${f2(mean(v))} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${f2(mean(v) + b)}$`), T('All values shift by the same amount, so the distances between them (the spread) do not change.', 'Semua nilai dianjak dengan jumlah yang sama, jadi jarak antaranya (serakan) tidak berubah.')), sp: 's' };
    },
    (r) => { // scaling: multiply by positive constant a
      const c = r.pick(CTX), v = genGroup(r, c, 6), a = r.pick([2, 3, 4]);
      const q = quart(v);
      return { q: T(`The data on ${c.en}, $${list(v)}$, have range ${q.max - q.min} and interquartile range ${n(q.q3 - q.q1)}. If every value is multiplied by ${a}, state the new range and the new interquartile range.`, `Data ${c.ms}, $${list(v)}$, mempunyai julat ${q.max - q.min} dan julat antara kuartil ${n(q.q3 - q.q1)}. Jika setiap nilai didarab dengan ${a}, nyatakan julat baharu dan julat antara kuartil baharu.`),
        a: T(`New range $= ${a} \\times ${q.max - q.min} = ${a * (q.max - q.min)}$; new IQR $= ${a} \\times ${n(q.q3 - q.q1)} = ${n(a * (q.q3 - q.q1))}$.`, `Julat baharu $= ${a} \\times ${q.max - q.min} = ${a * (q.max - q.min)}$; JAK baharu $= ${a} \\times ${n(q.q3 - q.q1)} = ${n(a * (q.q3 - q.q1))}$.`),
        w: W(T(`Multiplying every value by $${a}$ multiplies every distance between values by $${a}$, so both measures are multiplied by $${a}$.`, `Mendarab setiap nilai dengan $${a}$ mendarab setiap jarak antara nilai dengan $${a}$, jadi kedua-dua sukatan didarab dengan $${a}$.`), `$${a} \\times ${q.max - q.min} = ${a * (q.max - q.min)}$, $${a} \\times ${n(q.q3 - q.q1)} = ${n(a * (q.q3 - q.q1))}$`), sp: 's' };
    },
    (r) => { // true/false: does adding a constant double the variance?
      const claimWrong = r.chance();
      return { q: T(`True or False: "Adding the same constant to every value in a data set increases its variance."`, `Betul atau Salah: "Menambah pemalar yang sama kepada setiap nilai dalam satu set data meningkatkan variansnya."`),
        a: T('False: adding a constant shifts every value by the same amount, so the spread (and hence the variance) is unchanged.', 'Salah: menambah pemalar menganjak setiap nilai dengan jumlah yang sama, jadi serakan (dan justeru varians) tidak berubah.'),
        w: W(T('For $y = x + k$: $\\bar{y} = \\bar{x} + k$, so $y - \\bar{y} = x - \\bar{x}$ for every value.', 'Bagi $y = x + k$: $\\bar{y} = \\bar{x} + k$, jadi $y - \\bar{y} = x - \\bar{x}$ bagi setiap nilai.'), T('The deviations from the mean are unchanged, so the variance is unchanged: the statement is false.', 'Sisihan dari min tidak berubah, jadi varians tidak berubah: pernyataan itu salah.')), sp: 's' };
    },
    (r) => { // which measures stay unchanged under translation
      const k = r.pick([4, 6, 7, 9]);
      return { q: T(`If the constant ${k} is added to every value in a data set, which of these remain unchanged: the mean, the range, the variance?`, `Jika pemalar ${k} ditambah kepada setiap nilai dalam satu set data, yang manakah antara ini tidak berubah: min, julat, varians?`),
        a: T(`The range and the variance remain unchanged; only the mean changes (it increases by ${k}).`, `Julat dan varians tidak berubah; hanya min yang berubah (ia meningkat sebanyak ${k}).`),
        w: W(T(`New mean $= \\bar{x} + ${k}$.`, `Min baharu $= \\bar{x} + ${k}$.`), T(`New range $= (\\text{max} + ${k}) - (\\text{min} + ${k}) = \\text{max} - \\text{min}$; the deviations from the mean are also unchanged, so the variance is the same.`, `Julat baharu $= (\\text{max} + ${k}) - (\\text{min} + ${k}) = \\text{max} - \\text{min}$; sisihan dari min juga tidak berubah, jadi varians sama.`)), sp: 's' };
    },
    (r) => { // concrete tiny example: add constant, recompute range directly
      const v = rnd(r, 5, 3, 15), k = r.pick([2, 3, 4, 5]);
      const w = v.map((x) => x + k);
      return { q: T(`The data $${list(v)}$ become $${list(w)}$ after ${k} is added to every value. Verify that the range is unchanged by calculating both ranges.`, `Data $${list(v)}$ menjadi $${list(w)}$ selepas ${k} ditambah kepada setiap nilai. Sahkan bahawa julat tidak berubah dengan mengira kedua-dua julat.`),
        a: T(`Original range $= ${Math.max(...v) - Math.min(...v)}$; new range $= ${Math.max(...w) - Math.min(...w)}$ — the same.`, `Julat asal $= ${Math.max(...v) - Math.min(...v)}$; julat baharu $= ${Math.max(...w) - Math.min(...w)}$ — sama.`),
        w: W(T(`Original: range $= ${Math.max(...v)} - ${Math.min(...v)} = ${rg(v)}$`, `Asal: julat $= ${Math.max(...v)} - ${Math.min(...v)} = ${rg(v)}$`), T(`New: range $= ${Math.max(...w)} - ${Math.min(...w)} = ${rg(w)}$`, `Baharu: julat $= ${Math.max(...w)} - ${Math.min(...w)} = ${rg(w)}$`), T(`The $+${k}$ cancels in the subtraction.`, `$+${k}$ terbatal dalam penolakan.`)), sp: 's' };
    },
  ];
  const g824m = [
    (r) => { // full y = ax + b, including negative a
      const c = r.pick(CTX), v = genGroup(r, c, 6), a = r.pick([2, 3, -2, -3, 0.5]), b = r.int(1, 6);
      const q = quart(v), rg = q.max - q.min, iqr = q.q3 - q.q1;
      const M0 = round(mean(v), 2), S0 = round(sd(v), 2); // the (rounded) values the student is given
      return { q: T(`Each value $x$ in the data on ${c.en} is changed to $y = ${a}x + ${b}$. The original mean is ${f2(mean(v))}, range ${rg}, interquartile range ${n(iqr)} and standard deviation ${f2(sd(v))}. Find the new mean, range, interquartile range and standard deviation.`, `Setiap nilai $x$ dalam data ${c.ms} ditukar kepada $y = ${a}x + ${b}$. Min asal ialah ${f2(mean(v))}, julat ${rg}, julat antara kuartil ${n(iqr)} dan sisihan piawai ${f2(sd(v))}. Cari min, julat, julat antara kuartil dan sisihan piawai baharu.`),
        a: T(`Mean $= ${f2(a * M0 + b)}$; range $= ${f2(Math.abs(a) * rg)}$; IQR $= ${f2(Math.abs(a) * iqr)}$; s.d. $= ${f2(Math.abs(a) * S0)}$.`, `Min $= ${f2(a * M0 + b)}$; julat $= ${f2(Math.abs(a) * rg)}$; JAK $= ${f2(Math.abs(a) * iqr)}$; s.p. $= ${f2(Math.abs(a) * S0)}$.`),
        w: W(T(`Mean: $${a}(${n(M0)}) + ${b} = ${f2(a * M0 + b)}$`, `Min: $${a}(${n(M0)}) + ${b} = ${f2(a * M0 + b)}$`), T(`Spread is multiplied by $|${a}| = ${Math.abs(a)}$; adding $${b}$ does not change it.`, `Serakan didarab dengan $|${a}| = ${Math.abs(a)}$; menambah $${b}$ tidak mengubahnya.`),
          T(`Range $= ${Math.abs(a)} \\times ${rg} = ${f2(Math.abs(a) * rg)}$, IQR $= ${Math.abs(a)} \\times ${n(iqr)} = ${f2(Math.abs(a) * iqr)}$, s.d. $= ${Math.abs(a)} \\times ${n(S0)} = ${f2(Math.abs(a) * S0)}$`, `Julat $= ${Math.abs(a)} \\times ${rg} = ${f2(Math.abs(a) * rg)}$, JAK $= ${Math.abs(a)} \\times ${n(iqr)} = ${f2(Math.abs(a) * iqr)}$, s.p. $= ${Math.abs(a)} \\times ${n(S0)} = ${f2(Math.abs(a) * S0)}$`)), sp: 'm' };
    },
    (r) => { // add a value, recompute directly (no universal rule)
      const c = r.pick(CTX), v = genGroup(r, c, 7), newVal = r.int(c.lo, c.hi);
      const w = v.concat([newVal]);
      const rg0 = Math.max(...v) - Math.min(...v), rg1 = Math.max(...w) - Math.min(...w);
      return { q: T(`The data on ${c.en} are $${list(v)}$, with mean ${f2(mean(v))} and range ${rg0}. A new value, ${newVal}, is added. Find the new mean and the new range, and state whether the range increased, decreased or stayed the same.`, `Data ${c.ms} ialah $${list(v)}$, dengan min ${f2(mean(v))} dan julat ${rg0}. Satu nilai baharu, ${newVal}, ditambah. Cari min baharu dan julat baharu, dan nyatakan sama ada julat meningkat, menurun atau tidak berubah.`),
        a: T(`New mean $= ${f2(mean(w))}$; new range $= ${rg1}$, which has ${rg1 > rg0 ? 'increased' : rg1 < rg0 ? 'decreased' : 'stayed the same'}.`, `Min baharu $= ${f2(mean(w))}$; julat baharu $= ${rg1}$, yang telah ${rg1 > rg0 ? 'meningkat' : rg1 < rg0 ? 'menurun' : 'tidak berubah'}.`),
        w: W(T(`New mean $= \\dfrac{${sum(v)} + ${newVal}}{${w.length}} = \\dfrac{${sum(w)}}{${w.length}} ${eq2(mean(w))} ${f2(mean(w))}$`, `Min baharu $= \\dfrac{${sum(v)} + ${newVal}}{${w.length}} = \\dfrac{${sum(w)}}{${w.length}} ${eq2(mean(w))} ${f2(mean(w))}$`), T(`New range $= ${Math.max(...w)} - ${Math.min(...w)} = ${rg1}$ (was $${rg0}$)`, `Julat baharu $= ${Math.max(...w)} - ${Math.min(...w)} = ${rg1}$ (asalnya $${rg0}$)`),
          T(newVal > Math.max(...v) || newVal < Math.min(...v) ? 'The new value lies outside the old minimum-maximum, so the range grows.' : 'The new value lies within the old minimum-maximum, so the range is unchanged.', newVal > Math.max(...v) || newVal < Math.min(...v) ? 'Nilai baharu terletak di luar minimum-maksimum lama, jadi julat bertambah.' : 'Nilai baharu terletak dalam minimum-maksimum lama, jadi julat tidak berubah.')), sp: 'm' };
    },
    (r) => { // remove a value, recompute
      const c = r.pick(CTX), v = genGroup(r, c, 8);
      const idx = r.pick(['min', 'max', 'mid']);
      const s = sortNum(v);
      const removeVal = idx === 'min' ? s[0] : idx === 'max' ? s[s.length - 1] : s[Math.floor(s.length / 2)];
      const removeAt = v.indexOf(removeVal);
      const w = v.slice(0, removeAt).concat(v.slice(removeAt + 1));
      const rg0 = Math.max(...v) - Math.min(...v), rg1 = Math.max(...w) - Math.min(...w);
      return { q: T(`The data on ${c.en} are $${list(v)}$. The value ${removeVal} is removed. Find the mean and range before and after removal, and state the effect on the range.`, `Data ${c.ms} ialah $${list(v)}$. Nilai ${removeVal} dikeluarkan. Cari min dan julat sebelum dan selepas pengeluaran, dan nyatakan kesannya ke atas julat.`),
        a: T(`Before: mean ${f2(mean(v))}, range ${rg0}. After: mean ${f2(mean(w))}, range ${rg1}. The range has ${rg1 > rg0 ? 'increased' : rg1 < rg0 ? 'decreased' : 'stayed the same'}.`, `Sebelum: min ${f2(mean(v))}, julat ${rg0}. Selepas: min ${f2(mean(w))}, julat ${rg1}. Julat telah ${rg1 > rg0 ? 'meningkat' : rg1 < rg0 ? 'menurun' : 'tidak berubah'}.`),
        w: W(T(`Before: mean $= \\dfrac{${sum(v)}}{${v.length}} ${eq2(mean(v))} ${f2(mean(v))}$, range $= ${Math.max(...v)} - ${Math.min(...v)} = ${rg0}$`, `Sebelum: min $= \\dfrac{${sum(v)}}{${v.length}} ${eq2(mean(v))} ${f2(mean(v))}$, julat $= ${Math.max(...v)} - ${Math.min(...v)} = ${rg0}$`),
          T(`After: mean $= \\dfrac{${sum(v)} - ${removeVal}}{${w.length}} = \\dfrac{${sum(w)}}{${w.length}} ${eq2(mean(w))} ${f2(mean(w))}$, range $= ${Math.max(...w)} - ${Math.min(...w)} = ${rg1}$`, `Selepas: min $= \\dfrac{${sum(v)} - ${removeVal}}{${w.length}} = \\dfrac{${sum(w)}}{${w.length}} ${eq2(mean(w))} ${f2(mean(w))}$, julat $= ${Math.max(...w)} - ${Math.min(...w)} = ${rg1}$`)), sp: 'm' };
    },
    (r) => { // spot the error: variance scaled by a instead of a^2, or order not reversed for a<0
      const c = r.pick(CTX), v = genGroup(r, c, 6), a = r.pick([2, 3, -2, -3]), b = r.int(1, 5);
      const kind = r.pick(['varScale', 'order']);
      const origVar = round(varp(v), 2), newVar = a * a * origVar; // work from the variance as given (2 d.p.)
      if (kind === 'varScale') {
        const wrongVar = Math.abs(a) * origVar;
        return { q: T(`Each value $x$ in the data on ${c.en} (original variance ${f2(origVar)}) is changed to $y = ${a}x + ${b}$. A student calculates the new variance as $|a| \\times$ original variance $= ${f2(wrongVar)}$. Is this correct? State the correct new variance.`, `Setiap nilai $x$ dalam data ${c.ms} (varians asal ${f2(origVar)}) ditukar kepada $y = ${a}x + ${b}$. Seorang murid mengira varians baharu sebagai $|a| \\times$ varians asal $= ${f2(wrongVar)}$. Adakah ini betul? Nyatakan varians baharu yang betul.`),
          a: T(`No: variance scales by $a^2$, not $|a|$. Correct new variance $= a^2 \\times ${f2(origVar)} = ${f2(newVar)}$.`, `Tidak: varians berskala mengikut $a^2$, bukan $|a|$. Varians baharu yang betul $= a^2 \\times ${f2(origVar)} = ${f2(newVar)}$.`),
          w: W(T('Spread (s.d.) is multiplied by $|a|$, so the variance, a square, is multiplied by $a^2$; $b$ has no effect.', 'Serakan (s.p.) didarab dengan $|a|$, jadi varians, iaitu kuasa dua, didarab dengan $a^2$; $b$ tiada kesan.'), `$(${a})^2 \\times ${f2(origVar)} = ${a * a} \\times ${f2(origVar)} = ${f2(newVar)}$`), sp: 'm' };
      }
      const mn = Math.min(...v), mx = Math.max(...v);
      const wrongMin = a * mn + b, wrongMax = a * mx + b; // student keeps the old order
      const trueMin = Math.min(a * mn + b, a * mx + b), trueMax = Math.max(a * mn + b, a * mx + b);
      return { q: T(`In the data on ${c.en}, the minimum is ${mn} and the maximum is ${mx}. Each value $x$ is changed to $y = ${a}x + ${b}$ (note $a < 0$). A student says the new minimum is $${a} \\times ${mn} + ${b} = ${wrongMin}$ and the new maximum is $${a} \\times ${mx} + ${b} = ${wrongMax}$. Is this correct? Explain.`, `Dalam data ${c.ms}, minimum ialah ${mn} dan maksimum ialah ${mx}. Setiap nilai $x$ ditukar kepada $y = ${a}x + ${b}$ (ambil perhatian $a < 0$). Seorang murid berkata minimum baharu ialah $${a} \\times ${mn} + ${b} = ${wrongMin}$ dan maksimum baharu ialah $${a} \\times ${mx} + ${b} = ${wrongMax}$. Adakah ini betul? Terangkan.`),
        a: T(`No: since $a < 0$, multiplying reverses the order. The new minimum is actually ${trueMin} (from the old maximum) and the new maximum is ${trueMax} (from the old minimum).`, `Tidak: oleh sebab $a < 0$, pendaraban membalikkan tertib. Minimum baharu sebenarnya ialah ${trueMin} (daripada maksimum lama) dan maksimum baharu ialah ${trueMax} (daripada minimum lama).`),
        w: W(`$${a}(${mn}) + ${b} = ${a * mn + b}$, $${a}(${mx}) + ${b} = ${a * mx + b}$`, T(`$${trueMin} < ${trueMax}$: multiplying by a negative number reverses the order, so the old maximum gives the new minimum.`, `$${trueMin} < ${trueMax}$: pendaraban dengan nombor negatif membalikkan tertib, jadi maksimum lama memberi minimum baharu.`)), sp: 'm' };
    },
    (r) => { // unit conversion as a real-life a,b transform
      const conv = r.pick([['minutes', 'seconds', 60, 'minit', 'saat'], ['kg', 'g', 1000, 'kg', 'g'], ['m', 'cm', 100, 'm', 'cm'], ['RM', 'sen', 100, 'RM', 'sen']]);
      const v = rnd(r, 6, 2, 15);
      const S0 = round(sd(v), 2); // the s.d. as given
      return { q: T(`A data set of measurements in ${conv[0]} is $${list(v)}$, with standard deviation ${f2(sd(v))}. If every value is converted to ${conv[1]} (multiply by ${conv[2]}), find the new standard deviation, in ${conv[1]}.`, `Satu set data ukuran dalam ${conv[3]} ialah $${list(v)}$, dengan sisihan piawai ${f2(sd(v))}. Jika setiap nilai ditukar kepada ${conv[4]} (darab dengan ${conv[2]}), cari sisihan piawai baharu, dalam ${conv[4]}.`),
        a: T(`$${conv[2]} \\times ${f2(S0)} = ${f2(conv[2] * S0)}$ ${conv[1]}`, `$${conv[2]} \\times ${f2(S0)} = ${f2(conv[2] * S0)}$ ${conv[4]}`),
        w: W(T(`Multiplying every value by $${conv[2]}$ multiplies the standard deviation by $${conv[2]}$.`, `Mendarab setiap nilai dengan $${conv[2]}$ mendarab sisihan piawai dengan $${conv[2]}$.`), `$${conv[2]} \\times ${f2(S0)} = ${f2(conv[2] * S0)}$`), sp: 'm' };
    },
  ];
  const g824a = [
    (r) => { // inverse: find original stats from transformed new mean & sd
      const a = r.pick([2, 3, -2, 0.5]), b = r.int(1, 8);
      const newMean = r.int(10, 40), newSD = r.pick([4, 6, 8, 10, 12]);
      const oldMean = (newMean - b) / a, oldSD = newSD / Math.abs(a);
      return { q: T(`Every value $x$ in a data set is transformed to $y = ${a}x + ${b}$. The transformed data have mean ${newMean} and standard deviation ${newSD}. Find the mean and standard deviation of the original data.`, `Setiap nilai $x$ dalam satu set data ditukar kepada $y = ${a}x + ${b}$. Data terubah mempunyai min ${newMean} dan sisihan piawai ${newSD}. Cari min dan sisihan piawai data asal.`),
        a: T(`Original mean $= \\dfrac{${newMean} - ${b}}{${a}} = ${f2(oldMean)}$; original s.d. $= \\dfrac{${newSD}}{${Math.abs(a)}} = ${f2(oldSD)}$.`, `Min asal $= \\dfrac{${newMean} - ${b}}{${a}} = ${f2(oldMean)}$; s.p. asal $= \\dfrac{${newSD}}{${Math.abs(a)}} = ${f2(oldSD)}$.`),
        w: W(`$\\bar{y} = ${a}\\bar{x} + ${b} \\Rightarrow ${newMean} = ${a}\\bar{x} + ${b} \\Rightarrow \\bar{x} = \\dfrac{${newMean} - ${b}}{${a}} ${eq2(oldMean)} ${f2(oldMean)}$`, `$\\sigma_y = |${a}|\\,\\sigma_x \\Rightarrow \\sigma_x = \\dfrac{${newSD}}{${Math.abs(a)}} = ${f2(oldSD)}$`, T(`The $+${b}$ affects only the mean, not the standard deviation.`, `$+${b}$ hanya menjejaskan min, bukan sisihan piawai.`)), sp: 'm' };
    },
    (r) => { // outlier before/after, multi-measure, graphical description
      const c = r.pick(CTX), v = genGroup(r, c, 7), out = c.hi + Math.round((c.hi - c.lo) * 1.3);
      const w = v.concat([out]);
      const qb = quart(v), qa = quart(w);
      return { q: T(`The data on ${c.en}, $${list(v)}$, are joined by an extreme value, ${out}. Find the range, interquartile range and standard deviation before and after this value is added (2 decimal places for the standard deviation), and explain why a dot plot of the new data would look noticeably stretched out on one side compared with the original.`, `Data ${c.ms}, $${list(v)}$, ditambah dengan satu nilai ekstrem, ${out}. Cari julat, julat antara kuartil dan sisihan piawai sebelum dan selepas nilai ini ditambah (2 tempat perpuluhan bagi sisihan piawai), dan terangkan mengapa plot titik data baharu akan kelihatan jelas teregang pada satu bahagian berbanding data asal.`),
        a: T(`Before: range ${qb.max - qb.min}, IQR ${n(qb.q3 - qb.q1)}, s.d. ${f2(sd(v))}. After: range ${qa.max - qa.min}, IQR ${n(qa.q3 - qa.q1)}, s.d. ${f2(sd(w))}. The extreme value ${out} sits far from the rest of the data, so the dot plot gains an isolated point far to the right, stretching the horizontal spread mainly on the upper side, while the interquartile range changes only slightly since it is resistant to the extreme value.`, `Sebelum: julat ${qb.max - qb.min}, JAK ${n(qb.q3 - qb.q1)}, s.p. ${f2(sd(v))}. Selepas: julat ${qa.max - qa.min}, JAK ${n(qa.q3 - qa.q1)}, s.p. ${f2(sd(w))}. Nilai ekstrem ${out} terletak jauh daripada data yang lain, jadi plot titik memperoleh satu titik terpencil jauh di kanan, meregangkan serakan mendatar terutamanya di bahagian atas, manakala julat antara kuartil hanya berubah sedikit kerana ia tahan terhadap nilai ekstrem itu.`),
        w: W(T('Before:', 'Sebelum:'), rangeW(v), ...quartW(v, null, true), iqrW(v), ...varV(v, { sd: true }), T('After:', 'Selepas:'), rangeW(w), ...quartW(w, null, true), iqrW(w), ...varV(w, { sd: true })), sp: 'l' };
    },
    (r) => { // determine inserted value from a new stated mean, then discuss variance effect
      const v = rnd(r, 6, 5, 20), x = r.int(5, 25), full = v.concat([x]);
      need(sum(full) % 7 === 0); // the stated mean must be exact, or x cannot be recovered
      return { q: T(`Six numbers are $${list(v)}$. A seventh number is added so that the mean of the seven numbers becomes ${f2(mean(full))}. Find the seventh number, then explain (without recalculating) whether the variance must increase, must decrease, or could do either, once this value is included.`, `Enam nombor ialah $${list(v)}$. Nombor ketujuh ditambah supaya min bagi tujuh nombor itu menjadi ${f2(mean(full))}. Cari nombor ketujuh itu, kemudian terangkan (tanpa mengira semula) sama ada varians mesti meningkat, mesti menurun, atau boleh sama ada satu, setelah nilai ini disertakan.`),
        a: T(`Seventh number $= ${x}$. The variance could increase, decrease or barely change: it depends on how far the new value is from the new mean, not just on a value being added, so it must be recalculated to know for certain.`, `Nombor ketujuh $= ${x}$. Varians boleh meningkat, menurun atau hampir tidak berubah: ia bergantung pada sejauh mana nilai baharu itu daripada min baharu, bukan sekadar kerana satu nilai ditambah, jadi ia mesti dikira semula untuk mengetahui dengan pasti.`), w: W(T(`Sum of seven numbers $= 7 \\times ${f2(mean(full))} = ${sum(full)}$`, `Hasil tambah tujuh nombor $= 7 \\times ${f2(mean(full))} = ${sum(full)}$`), T(`Seventh number $= ${sum(full)} - ${sum(v)} = ${x}$`, `Nombor ketujuh $= ${sum(full)} - ${sum(v)} = ${x}$`), T('A value close to the mean lowers the variance; a value far from it raises the variance.', 'Nilai yang hampir dengan min mengurangkan varians; nilai yang jauh daripadanya meningkatkan varians.')), sp: 'm' };
    },
    (r) => { // ethics: undisclosed removal of an inconvenient outlier
      const c = r.pick(CTX), v = genGroup(r, c, 7), out = c.hi + Math.round((c.hi - c.lo) * 1.3);
      const w = v.concat([out]);
      return { q: T(`A report on ${c.en} contains the value ${out}, far higher than the rest of the data $${list(v)}$. To make the standard deviation look smaller, the analyst quietly removes ${out} without mentioning it. Explain why this is inappropriate, and state what should be done instead.`, `Satu laporan tentang ${c.ms} mengandungi nilai ${out}, jauh lebih tinggi daripada data yang lain $${list(v)}$. Untuk menjadikan sisihan piawai kelihatan lebih kecil, penganalisis secara senyap mengeluarkan ${out} tanpa menyebutnya. Terangkan mengapa ini tidak sesuai, dan nyatakan apa yang patut dilakukan sebagai gantinya.`),
        a: T(`Silently removing an inconvenient value hides information and can mislead readers about the true spread of the data; any extreme value should instead be investigated, and if excluded, the reason must be disclosed and the conclusion compared with and without it (here s.d. is ${f2(sd(w))} with it and ${f2(sd(v))} without it).`, `Mengeluarkan nilai yang mengganggu secara senyap menyembunyikan maklumat dan boleh mengelirukan pembaca tentang serakan sebenar data; sebaliknya, sebarang nilai ekstrem perlu disiasat, dan jika dikecualikan, sebabnya mesti didedahkan dan kesimpulan dibandingkan dengan dan tanpanya (di sini s.p. ialah ${f2(sd(w))} dengannya dan ${f2(sd(v))} tanpanya).`),
        w: W(T(`With $${out}$:`, `Dengan $${out}$:`), ...varV(w, { sd: true }), T(`Without $${out}$:`, `Tanpa $${out}$:`), ...varV(v, { sd: true }), T('Report both, and state why a value is excluded.', 'Laporkan kedua-duanya, dan nyatakan sebab sesuatu nilai dikecualikan.')), sp: 'l' };
    },
    (r) => { // test a claimed invariant (common misconception combining scale + shift)
      const a = r.pick([2, 3, 4]), b = r.int(2, 10);
      return { q: T(`A student claims: "If you multiply every value by ${a} and then add ${b}, the interquartile range becomes ${a} times the original interquartile range, plus ${b}." Is this claim correct? State the correct general rule for how the IQR changes under $y = ${a}x + ${b}$.`, `Seorang murid mendakwa: "Jika anda darab setiap nilai dengan ${a} dan kemudian tambah ${b}, julat antara kuartil menjadi ${a} kali julat antara kuartil asal, tambah ${b}." Adakah dakwaan ini betul? Nyatakan peraturan am yang betul untuk bagaimana JAK berubah di bawah $y = ${a}x + ${b}$.`),
        a: T(`No: adding a constant $b$ shifts every value equally and does not affect spread. The correct rule is $\\text{IQR}_y = |a| \\times \\text{IQR}_x$ (the $+${b}$ has no effect on the IQR at all).`, `Tidak: menambah pemalar $b$ menganjak setiap nilai secara sama rata dan tidak menjejaskan serakan. Peraturan yang betul ialah $\\text{JAK}_y = |a| \\times \\text{JAK}_x$ ($+${b}$ langsung tidak menjejaskan JAK).`),
        w: W(`$\\text{IQR}_y = (${a}Q_3 + ${b}) - (${a}Q_1 + ${b}) = ${a}(Q_3 - Q_1) = ${a} \\times \\text{IQR}_x$`, T(`The $+${b}$ cancels, so the claim is wrong.`, `$+${b}$ terbatal, jadi dakwaan itu salah.`)), sp: 'm' };
    },
  ];
  SPM.extend('F4-8.2.4', { e: g824e, m: g824m, a: g824a });

  /* =============================================================== 8.2.5 Compare distributions */
  const SUBJ = [ // pairs of entities being compared: [en, ms]
    ['two students', 'dua orang murid'],
    ['two machines', 'dua buah mesin'],
    ['two branches of a shop', 'dua cawangan sebuah kedai'],
    ['two badminton players', 'dua orang pemain badminton'],
    ['two delivery riders', 'dua orang penunggang penghantaran'],
    ['two farms', 'dua buah ladang'],
    ['two classes', 'dua buah kelas'],
    ['two factories', 'dua buah kilang'],
  ];
  /** mean of a raw list */
  const meanW = (v, g) => T(`${lb(g)}mean $= \\dfrac{${sum(v)}}{${v.length}} ${eq2(mean(v))} ${f2(mean(v))}$`, `${lb(g)}min $= \\dfrac{${sum(v)}}{${v.length}} ${eq2(mean(v))} ${f2(mean(v))}$`);
  const setHead = (g) => T(`Set ${g}:`, `Set ${g}:`);
  const g825e2 = [
    (r) => { // mean & range comparison
      const c = r.pick(CTX), a = genGroup(r, c, 7), b = genGroup(r, c, 7);
      const ra = Math.max(...a) - Math.min(...a), rb = Math.max(...b) - Math.min(...b);
      need(f2(mean(a)) !== f2(mean(b)) && ra !== rb); // a tie would make "higher"/"more spread out" ambiguous
      return { q: T(`Set $A$: $${list(sortNum(a))}$. Set $B$: $${list(sortNum(b))}$ (${c.en}). Find the mean and range of each set, and state which set has the higher typical value and which is more spread out.`, `Set $A$: $${list(sortNum(a))}$. Set $B$: $${list(sortNum(b))}$ (${c.ms}). Cari min dan julat setiap set, dan nyatakan set yang mempunyai nilai tipikal lebih tinggi dan set yang lebih bertaburan.`),
        a: T(`$A$: mean ${f2(mean(a))}, range ${ra}; $B$: mean ${f2(mean(b))}, range ${rb}. Higher typical value: ${mean(a) >= mean(b) ? 'A' : 'B'}; more spread out: ${ra >= rb ? 'A' : 'B'}.`, `$A$: min ${f2(mean(a))}, julat ${ra}; $B$: min ${f2(mean(b))}, julat ${rb}. Nilai tipikal lebih tinggi: ${mean(a) >= mean(b) ? 'A' : 'B'}; lebih bertaburan: ${ra >= rb ? 'A' : 'B'}.`),
        w: W(meanW(a, 'A'), rangeW(a, 'A'), meanW(b, 'B'), rangeW(b, 'B'), T(`Higher mean: ${mean(a) > mean(b) ? 'A' : 'B'}; larger range (more spread out): ${ra > rb ? 'A' : 'B'}.`, `Min lebih tinggi: ${mean(a) > mean(b) ? 'A' : 'B'}; julat lebih besar (lebih bertaburan): ${ra > rb ? 'A' : 'B'}.`)), sp: 'l' };
    },
    (r) => { // read off which is more consistent from given mean & sd pairs
      const s = r.pick(SUBJ), meanA = r.int(20, 40), sdA = r.pick([2, 3, 4, 5]), meanB = meanA + r.pick([-3, -2, 2, 3]), sdB = r.pick([2, 3, 4, 5].filter((x) => x !== sdA));
      return { q: T(`For ${s[0]}, A has mean ${meanA} and standard deviation ${sdA}; B has mean ${meanB} and standard deviation ${sdB}. Which has the higher typical value, and which is more consistent?`, `Bagi ${s[1]}, A mempunyai min ${meanA} dan sisihan piawai ${sdA}; B mempunyai min ${meanB} dan sisihan piawai ${sdB}. Yang manakah mempunyai nilai tipikal lebih tinggi, dan yang manakah lebih konsisten?`),
        a: T(`Higher typical value: ${meanA >= meanB ? 'A' : 'B'}. More consistent: ${sdA <= sdB ? 'A' : 'B'} (smaller standard deviation).`, `Nilai tipikal lebih tinggi: ${meanA >= meanB ? 'A' : 'B'}. Lebih konsisten: ${sdA <= sdB ? 'A' : 'B'} (sisihan piawai lebih kecil).`),
        w: W(T(`Typical value: compare means, $${Math.max(meanA, meanB)} > ${Math.min(meanA, meanB)}$, so ${meanA > meanB ? 'A' : 'B'}.`, `Nilai tipikal: bandingkan min, $${Math.max(meanA, meanB)} > ${Math.min(meanA, meanB)}$, jadi ${meanA > meanB ? 'A' : 'B'}.`), T(`Consistency: smaller standard deviation, $${Math.min(sdA, sdB)} < ${Math.max(sdA, sdB)}$, so ${sdA < sdB ? 'A' : 'B'}.`, `Konsistensi: sisihan piawai lebih kecil, $${Math.min(sdA, sdB)} < ${Math.max(sdA, sdB)}$, jadi ${sdA < sdB ? 'A' : 'B'}.`)), sp: 's' };
    },
    (r) => { // conceptual: which pair of statistics for a fair comparison
      const c = r.pick(CTX);
      return { q: T(`To compare ${c.en} for two groups fairly, name one measure of central tendency and one measure of dispersion you would report together.`, `Untuk membandingkan ${c.ms} bagi dua kumpulan secara adil, namakan satu sukatan kecenderungan memusat dan satu sukatan serakan yang akan anda laporkan bersama.`),
        a: T('E.g. the mean (or median) together with the standard deviation (or interquartile range) — one number alone does not describe both the typical level and the consistency of the data.', 'Cth. min (atau median) bersama sisihan piawai (atau julat antara kuartil) — satu nombor sahaja tidak menerangkan kedua-dua paras tipikal dan konsistensi data.'),
        w: W(T('A measure of central tendency gives the typical level; a measure of dispersion gives the consistency. A fair comparison needs one of each.', 'Sukatan kecenderungan memusat memberi paras tipikal; sukatan serakan memberi konsistensi. Perbandingan yang adil memerlukan satu daripada setiap satu.')), sp: 's' };
    },
    (r) => { // insufficient evidence: only means given
      const s = r.pick(SUBJ), meanA = r.int(20, 40), meanB = meanA + r.pick([-4, -3, 3, 4]);
      return { q: T(`For ${s[0]}, you are told only that A has a mean of ${meanA} and B has a mean of ${meanB}. Can you conclude which one is more consistent? Explain.`, `Bagi ${s[1]}, anda hanya diberitahu bahawa A mempunyai min ${meanA} dan B mempunyai min ${meanB}. Bolehkah anda membuat kesimpulan yang manakah lebih konsisten? Terangkan.`),
        a: T('No: the mean describes only the typical level, not the spread. A measure of dispersion (such as the range, IQR or standard deviation) for each group is needed before consistency can be compared.', 'Tidak: min hanya menerangkan paras tipikal, bukan serakan. Satu sukatan serakan (seperti julat, JAK atau sisihan piawai) bagi setiap kumpulan diperlukan sebelum konsistensi boleh dibandingkan.'),
        w: W(T(`Two groups can have means ${meanA} and ${meanB} with any spread at all, so the means say nothing about consistency.`, `Dua kumpulan boleh mempunyai min ${meanA} dan ${meanB} dengan sebarang serakan, jadi min tidak memberi maklumat tentang konsistensi.`)), sp: 's' };
    },
  ];
  const g825m2 = [
    (r) => { // compute mean & sd, conclude level + consistency
      const c = r.pick(CTX), a = genGroup(r, c, 7), b = genGroup(r, c, 7);
      need(f2(mean(a)) !== f2(mean(b)) && f2(sd(a)) !== f2(sd(b))); // no ties in either conclusion
      return { q: T(`Set $A$: $${list(a)}$. Set $B$: $${list(b)}$ (${c.en}). Calculate the mean and the standard deviation of each set (2 decimal places), and write a conclusion comparing the two sets' typical level and consistency.`, `Set $A$: $${list(a)}$. Set $B$: $${list(b)}$ (${c.ms}). Kira min dan sisihan piawai setiap set (2 tempat perpuluhan), dan tulis satu kesimpulan yang membandingkan paras tipikal dan konsistensi kedua-dua set.`),
        a: T(`$A$: mean ${f2(mean(a))}, s.d. ${f2(sd(a))}; $B$: mean ${f2(mean(b))}, s.d. ${f2(sd(b))}. Set ${mean(a) >= mean(b) ? 'A' : 'B'} has the higher typical value; Set ${sd(a) <= sd(b) ? 'A' : 'B'} is more consistent (smaller standard deviation).`, `$A$: min ${f2(mean(a))}, s.p. ${f2(sd(a))}; $B$: min ${f2(mean(b))}, s.p. ${f2(sd(b))}. Set ${mean(a) >= mean(b) ? 'A' : 'B'} mempunyai nilai tipikal lebih tinggi; Set ${sd(a) <= sd(b) ? 'A' : 'B'} lebih konsisten (sisihan piawai lebih kecil).`),
        w: W(setHead('A'), ...varV(a, { sd: true }), setHead('B'), ...varV(b, { sd: true }), T(`Higher mean: ${mean(a) > mean(b) ? 'A' : 'B'}; smaller standard deviation (more consistent): ${sd(a) < sd(b) ? 'A' : 'B'}.`, `Min lebih tinggi: ${mean(a) > mean(b) ? 'A' : 'B'}; sisihan piawai lebih kecil (lebih konsisten): ${sd(a) < sd(b) ? 'A' : 'B'}.`)), sp: 'l' };
    },
    (r) => { // outlier present -> justify median+IQR over mean+sd
      const c = r.pick(CTX), a = genGroup(r, c, 6).concat([c.hi + Math.round((c.hi - c.lo) * 1.3)]), b = genGroup(r, c, 7);
      const qa = quart(a), qb = quart(b);
      return { q: T(`Set $A$: $${list(a)}$; Set $B$: $${list(b)}$ (${c.en}). Set $A$ contains one extreme value. Compare the two sets using the median and interquartile range, and explain why these are more suitable here than the mean and standard deviation.`, `Set $A$: $${list(a)}$; Set $B$: $${list(b)}$ (${c.ms}). Set $A$ mengandungi satu nilai ekstrem. Bandingkan kedua-dua set menggunakan median dan julat antara kuartil, dan terangkan mengapa ini lebih sesuai di sini berbanding min dan sisihan piawai.`),
        a: T(`Median: A $= ${n(qa.med)}$, B $= ${n(qb.med)}$. IQR: A $= ${n(qa.q3 - qa.q1)}$, B $= ${n(qb.q3 - qb.q1)}$. The median and IQR are more suitable because they resist the extreme value in Set A, unlike the mean and standard deviation, which it would distort.`, `Median: A $= ${n(qa.med)}$, B $= ${n(qb.med)}$. JAK: A $= ${n(qa.q3 - qa.q1)}$, B $= ${n(qb.q3 - qb.q1)}$. Median dan JAK lebih sesuai kerana ia tahan terhadap nilai ekstrem dalam Set A, tidak seperti min dan sisihan piawai, yang akan terjejas olehnya.`),
        w: W(medW(a, 'A'), ...quartW(a, 'A', true), iqrW(a, 'A'), medW(b, 'B'), ...quartW(b, 'B', true), iqrW(b, 'B'), T(`The extreme value $${a[a.length - 1]}$ pulls the mean up and inflates $\\sum x^2$, but the median and quartiles depend only on positions.`, `Nilai ekstrem $${a[a.length - 1]}$ menarik min ke atas dan membesarkan $\\sum x^2$, tetapi median dan kuartil hanya bergantung pada kedudukan.`)), sp: 'l' };
    },
    (r) => { // machines/workers: which is better for consistent output
      const s = r.pick(SUBJ), c = r.pick(CTX), a = genGroup(r, c, 7), b = genGroup(r, c, 7);
      need(f2(sd(a)) !== f2(sd(b)));
      return { q: T(`For ${s[0]} (A and B), data on ${c.en} are recorded: A: $${list(a)}$; B: $${list(b)}$. If consistent performance matters most, which one should be chosen? Support your answer with the standard deviation of each.`, `Bagi ${s[1]} (A dan B), data ${c.ms} direkodkan: A: $${list(a)}$; B: $${list(b)}$. Jika prestasi yang konsisten paling penting, yang manakah patut dipilih? Sokong jawapan anda dengan sisihan piawai setiap satu.`),
        a: T(`s.d.: A $= ${f2(sd(a))}$, B $= ${f2(sd(b))}$. ${sd(a) <= sd(b) ? 'A' : 'B'} should be chosen, since it has the smaller standard deviation and so is more consistent.`, `s.p.: A $= ${f2(sd(a))}$, B $= ${f2(sd(b))}$. ${sd(a) <= sd(b) ? 'A' : 'B'} patut dipilih, kerana ia mempunyai sisihan piawai yang lebih kecil dan justeru lebih konsisten.`),
        w: W(setHead('A'), ...varV(a, { sd: true }), setHead('B'), ...varV(b, { sd: true }), T(`Smaller standard deviation: ${sd(a) < sd(b) ? 'A' : 'B'}.`, `Sisihan piawai lebih kecil: ${sd(a) < sd(b) ? 'A' : 'B'}.`)), sp: 'l' };
    },
    (r) => { // unfair comparison: different sample sizes or units
      const c = r.pick(CTX);
      const issue = r.pick([
        ['Data Set A has 40 recorded values while Data Set B has only 5', 'Set Data A mempunyai 40 nilai yang direkodkan manakala Set Data B hanya mempunyai 5'],
        ['Data Set A was measured in a different unit from Data Set B without conversion', 'Set Data A diukur dalam unit yang berbeza daripada Set Data B tanpa penukaran'],
        ['Data Set A was collected on a public holiday while Data Set B was collected on a normal working day', 'Set Data A dikumpul pada hari cuti umum manakala Set Data B dikumpul pada hari bekerja biasa'],
      ]);
      return { q: T(`A report compares the mean and standard deviation of two data sets on ${c.en}, but ${issue[0]}. Explain why this comparison may not be fair, and state what should be checked or matched before comparing.`, `Satu laporan membandingkan min dan sisihan piawai dua set data tentang ${c.ms}, tetapi ${issue[1]}. Terangkan mengapa perbandingan ini mungkin tidak adil, dan nyatakan apa yang perlu disemak atau dipadankan sebelum membandingkan.`),
        a: T('Differences in sample size, unit or collection conditions can make the two summary statistics not truly comparable; before comparing, the data should be checked for a similar sample size, common unit, and comparable collection conditions (or the differences should be explicitly accounted for).', 'Perbezaan dari segi saiz sampel, unit atau keadaan pengumpulan boleh menjadikan kedua-dua statistik ringkasan itu tidak benar-benar boleh dibandingkan; sebelum membandingkan, data perlu disemak untuk saiz sampel yang serupa, unit yang sama, dan keadaan pengumpulan yang setanding (atau perbezaan itu perlu diambil kira secara jelas).'),
        w: W(T('A fair comparison needs the two data sets to be alike in everything except the groups being compared: sample size, unit and collection conditions.', 'Perbandingan yang adil memerlukan kedua-dua set data serupa dalam segala hal kecuali kumpulan yang dibandingkan: saiz sampel, unit dan keadaan pengumpulan.')), sp: 'm' };
    },
  ];
  const g825a2 = [
    (r) => { // trade-off: higher mean but higher spread too
      const c = r.pick(CTX), a = genGroup(r, c, 8), b = genGroup(r, c, 8);
      need(mean(a) > mean(b) && sd(a) > sd(b) && f2(mean(a)) !== f2(mean(b)) && f2(sd(a)) !== f2(sd(b)));
      return { q: T(`Two suppliers' deliveries are compared on ${c.en}: Supplier $A$: $${list(a)}$; Supplier $B$: $${list(b)}$. Calculate the mean and standard deviation of each. Supplier $A$ has the higher mean but also the higher standard deviation. Discuss which supplier you would recommend, considering both level and consistency, for a buyer who values reliability.`, `Penghantaran dua pembekal dibandingkan dari segi ${c.ms}: Pembekal $A$: $${list(a)}$; Pembekal $B$: $${list(b)}$. Kira min dan sisihan piawai setiap satu. Pembekal $A$ mempunyai min lebih tinggi tetapi juga sisihan piawai lebih tinggi. Bincangkan pembekal yang manakah anda syorkan, dengan mengambil kira paras dan konsistensi, untuk pembeli yang mengutamakan kebolehpercayaan.`),
        a: T(`Mean: A $= ${f2(mean(a))}$, B $= ${f2(mean(b))}$. S.d.: A $= ${f2(sd(a))}$, B $= ${f2(sd(b))}$. There is a trade-off: A performs higher on average, but B is more consistent; for a buyer who values reliability, Supplier $B$ may be preferred despite its lower mean, since a smaller spread means more predictable outcomes.`, `Min: A $= ${f2(mean(a))}$, B $= ${f2(mean(b))}$. S.p.: A $= ${f2(sd(a))}$, B $= ${f2(sd(b))}$. Terdapat pertukaran: A menunjukkan prestasi purata lebih tinggi, tetapi B lebih konsisten; bagi pembeli yang mengutamakan kebolehpercayaan, Pembekal $B$ mungkin lebih digemari walaupun minnya lebih rendah, kerana serakan yang lebih kecil bermaksud hasil yang lebih boleh diramal.`),
        w: W(T('Supplier A:', 'Pembekal A:'), ...varV(a, { sd: true }), T('Supplier B:', 'Pembekal B:'), ...varV(b, { sd: true }), T('Reliability means small spread, so weigh the smaller standard deviation of B against the higher mean of A.', 'Kebolehpercayaan bermaksud serakan kecil, jadi timbang sisihan piawai B yang lebih kecil berbanding min A yang lebih tinggi.')), sp: 'l' };
    },
    (r) => { // justify choice of statistics based on outlier presence, then decide
      const c = r.pick(CTX), a = genGroup(r, c, 6).concat([c.hi + Math.round((c.hi - c.lo) * 1.3)]), b = genGroup(r, c, 7);
      const qa = quart(a), qb = quart(b);
      need(qa.med !== qb.med && qa.q3 - qa.q1 !== qb.q3 - qb.q1); // both decisions must be clear-cut
      return { q: T(`Data Set $A$: $${list(a)}$; Data Set $B$: $${list(b)}$ (${c.en}). Set $A$ contains an outlier. Justify which pair of statistics (mean & standard deviation, or median & interquartile range) is more appropriate for comparing these two sets, then use your chosen pair to decide which set has the higher typical level and which is more consistent.`, `Set Data $A$: $${list(a)}$; Set Data $B$: $${list(b)}$ (${c.ms}). Set $A$ mengandungi satu nilai terpencil. Justifikasikan pasangan statistik yang manakah (min & sisihan piawai, atau median & julat antara kuartil) lebih sesuai untuk membandingkan kedua-dua set ini, kemudian gunakan pasangan pilihan anda untuk menentukan set yang mempunyai paras tipikal lebih tinggi dan yang lebih konsisten.`),
        a: T(`Median and IQR are more appropriate here, since they resist the outlier in Set A. Median: A $= ${n(qa.med)}$, B $= ${n(qb.med)}$. IQR: A $= ${n(qa.q3 - qa.q1)}$, B $= ${n(qb.q3 - qb.q1)}$. Higher typical level: ${qa.med >= qb.med ? 'A' : 'B'}; more consistent: ${(qa.q3 - qa.q1) <= (qb.q3 - qb.q1) ? 'A' : 'B'}.`, `Median dan JAK lebih sesuai di sini, kerana ia tahan terhadap nilai terpencil dalam Set A. Median: A $= ${n(qa.med)}$, B $= ${n(qb.med)}$. JAK: A $= ${n(qa.q3 - qa.q1)}$, B $= ${n(qb.q3 - qb.q1)}$. Paras tipikal lebih tinggi: ${qa.med >= qb.med ? 'A' : 'B'}; lebih konsisten: ${(qa.q3 - qa.q1) <= (qb.q3 - qb.q1) ? 'A' : 'B'}.`),
        w: W(T(`The outlier $${a[a.length - 1]}$ would distort the mean and standard deviation of A, so use the median and IQR.`, `Nilai terpencil $${a[a.length - 1]}$ akan mengherotkan min dan sisihan piawai A, jadi guna median dan JAK.`), medW(a, 'A'), ...quartW(a, 'A', true), iqrW(a, 'A'), medW(b, 'B'), ...quartW(b, 'B', true), iqrW(b, 'B'),
          T(`Higher median: ${qa.med > qb.med ? 'A' : 'B'}; smaller IQR: ${qa.q3 - qa.q1 < qb.q3 - qb.q1 ? 'A' : 'B'}.`, `Median lebih tinggi: ${qa.med > qb.med ? 'A' : 'B'}; JAK lebih kecil: ${qa.q3 - qa.q1 < qb.q3 - qb.q1 ? 'A' : 'B'}.`)), sp: 'l' };
    },
    (r) => { // insufficient evidence, mismatched conditions
      const s = r.pick(SUBJ);
      const reason = r.pick([
        ['sample sizes are very different (one has 3 recorded values, the other has 50)', 'saiz sampel sangat berbeza (satu mempunyai 3 nilai direkodkan, satu lagi mempunyai 50)'],
        ['the two groups were measured under very different conditions (one during a heatwave, one during normal weather)', 'kedua-dua kumpulan diukur di bawah keadaan yang sangat berbeza (satu semasa gelombang panas, satu lagi semasa cuaca biasa)'],
        ['only the range of each group is available, and one group has a known extreme value while the other does not', 'hanya julat setiap kumpulan tersedia, dan satu kumpulan diketahui mempunyai nilai ekstrem manakala satu lagi tidak'],
      ]);
      return { q: T(`You are asked to decide which of ${s[0]} is more consistent, but ${reason[0]}. Explain why the evidence available may be insufficient to draw a reliable conclusion, and state what additional information or matching would be needed.`, `Anda diminta menentukan ${s[1]} yang manakah lebih konsisten, tetapi ${reason[1]}. Terangkan mengapa bukti yang ada mungkin tidak mencukupi untuk membuat kesimpulan yang boleh dipercayai, dan nyatakan maklumat tambahan atau pemadanan apakah yang diperlukan.`),
        a: T('When sample sizes, measurement conditions or the specific statistics available differ greatly or use a measure sensitive to outliers without disclosure, a direct comparison can be unreliable; a fair conclusion needs comparable sample sizes and conditions, and a dispersion measure (matched to whether outliers are present) computed for both groups on the same basis.', 'Apabila saiz sampel, keadaan pengukuran atau statistik khusus yang tersedia berbeza dengan ketara, atau menggunakan sukatan yang sensitif terhadap nilai terpencil tanpa pendedahan, perbandingan terus boleh menjadi tidak boleh dipercayai; kesimpulan yang adil memerlukan saiz sampel dan keadaan yang setanding, dan satu sukatan serakan (dipadankan dengan ada tidaknya nilai terpencil) dikira bagi kedua-dua kumpulan atas asas yang sama.'),
        w: W(T('A conclusion is only as reliable as the comparison: the groups must be measured on the same basis, with enough data, using a suitable measure of dispersion for both.', 'Kesimpulan hanya boleh dipercayai jika perbandingannya adil: kumpulan mesti diukur atas asas yang sama, dengan data yang mencukupi, menggunakan sukatan serakan yang sesuai bagi kedua-duanya.')), sp: 'm' };
    },
    (r) => { // three-way comparison with purpose-dependent recommendation
      const c = r.pick(CTX);
      const groups = ['A', 'B', 'C'].map(() => genGroup(r, c, 7));
      const stats = groups.map((g) => ({ mean: mean(g), sd: sd(g) }));
      const topM = Math.max(...stats.map((s) => s.mean)), lowS = Math.min(...stats.map((s) => s.sd));
      need(stats.filter((s) => f2(s.mean) === f2(topM)).length === 1 && stats.filter((s) => f2(s.sd) === f2(lowS)).length === 1); // unique winners
      const bestMean = stats.reduce((best, s, i) => (s.mean > stats[best].mean ? i : best), 0);
      const bestSD = stats.reduce((best, s, i) => (s.sd < stats[best].sd ? i : best), 0);
      const lbl = ['A', 'B', 'C'];
      return { q: T(`Three groups are compared on ${c.en}: $A$: $${list(groups[0])}$; $B$: $${list(groups[1])}$; $C$: $${list(groups[2])}$. Calculate the mean and standard deviation of each group. State which group you would recommend (i) if only the highest typical value matters, and (ii) if only consistency matters, explaining whether the same group is recommended both times.`, `Tiga kumpulan dibandingkan dari segi ${c.ms}: $A$: $${list(groups[0])}$; $B$: $${list(groups[1])}$; $C$: $${list(groups[2])}$. Kira min dan sisihan piawai setiap kumpulan. Nyatakan kumpulan yang anda syorkan (i) jika hanya nilai tipikal tertinggi penting, dan (ii) jika hanya konsistensi penting, dengan menjelaskan sama ada kumpulan yang sama disyorkan pada kedua-dua kali.`),
        a: T(`Mean: A $= ${f2(stats[0].mean)}$, B $= ${f2(stats[1].mean)}$, C $= ${f2(stats[2].mean)}$. S.d.: A $= ${f2(stats[0].sd)}$, B $= ${f2(stats[1].sd)}$, C $= ${f2(stats[2].sd)}$. (i) Highest typical value: Group ${lbl[bestMean]}. (ii) Most consistent: Group ${lbl[bestSD]}. ${bestMean === bestSD ? 'The same group is best on both criteria.' : 'Different groups are best on each criterion, so the final choice depends on which purpose (level or consistency) matters more.'}`, `Min: A $= ${f2(stats[0].mean)}$, B $= ${f2(stats[1].mean)}$, C $= ${f2(stats[2].mean)}$. S.p.: A $= ${f2(stats[0].sd)}$, B $= ${f2(stats[1].sd)}$, C $= ${f2(stats[2].sd)}$. (i) Nilai tipikal tertinggi: Kumpulan ${lbl[bestMean]}. (ii) Paling konsisten: Kumpulan ${lbl[bestSD]}. ${bestMean === bestSD ? 'Kumpulan yang sama adalah terbaik bagi kedua-dua kriteria.' : 'Kumpulan berlainan adalah terbaik bagi setiap kriteria, jadi pilihan akhir bergantung pada matlamat manakah (paras atau konsistensi) yang lebih penting.'}`),
        w: W(...groups.flatMap((g, i) => [T(`Group ${lbl[i]}:`, `Kumpulan ${lbl[i]}:`), ...varV(g, { sd: true })]), T(`(i) Largest mean: ${lbl[bestMean]}. (ii) Smallest standard deviation: ${lbl[bestSD]}.`, `(i) Min terbesar: ${lbl[bestMean]}. (ii) Sisihan piawai terkecil: ${lbl[bestSD]}.`)), sp: 'l' };
    },
  ];
  SPM.extend('F4-8.2.5', { e: g825e2, m: g825m2, a: g825a2 });
})();
