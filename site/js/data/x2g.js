/* Variety pack x2g: F2-12.1–12.5 (Measures of Central Tendencies) and F2-13.1–13.2 (Simple Probability). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, sum, mean, median, sortNum, Fr, round, cap } = SPM;
  const T = SPM.L, S = SPM.svg, W = SPM.lines;
  const list = (v) => v.join(',\\ ');
  const fm = (x) => SPM.fx(x, 2);
  const ord = (k) => k + (k % 100 > 10 && k % 100 < 14 ? 'th' : ['th', 'st', 'nd', 'rd'][k % 10 > 3 ? 0 : k % 10]);
  const P2 = (s) => s.split(',').map((x) => x.split('/'));
  const rl = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const rg = (v) => Math.max(...v) - Math.min(...v);
  const cnt = (v) => { const c = {}; v.forEach((x) => (c[x] = (c[x] || 0) + 1)); return c; };
  /** all modes (numbers); [] when every value occurs equally often (no mode) */
  const modesOf = (v) => { const c = cnt(v), k = Object.keys(c), mx = Math.max(...Object.values(c)); const m = k.filter((x) => c[x] === mx).map(Number); return m.length === k.length ? [] : m; };
  const tri = (r, lo, hi) => Math.round((r.int(lo, hi) + r.int(lo, hi)) / 2);
  const tally = (k) => (k >= 5 ? ('<s>||||</s> ').repeat(Math.floor(k / 5)) : '') + '|'.repeat(k % 5);
  const tabL = (i, rows, head) => SPM.table(rows, { head: head.map((h) => h.split('|')[i]) });
  const FQ = 'Frequency|Kekerapan', CI = 'Class interval|Selang kelas', CT = 'Category|Kategori';
  /* statistics contexts: 'english|malay|lowest|highest'; {k} = number of observations */
  const DATA = [
    'number of goals scored by a team in {k} matches|bilangan gol yang dijaringkan oleh sebuah pasukan dalam {k} perlawanan|0|6',
    'number of books borrowed by {k} students in a month|bilangan buku yang dipinjam oleh {k} orang murid dalam sebulan|1|12',
    'marks obtained by {k} students in a quiz (out of 20)|markah yang diperoleh {k} orang murid dalam satu kuiz (daripada 20)|6|20',
    'time in minutes taken by {k} students to travel to school|masa dalam minit yang diambil oleh {k} orang murid untuk ke sekolah|5|40',
    'rainfall in mm on {k} days|kuantiti hujan dalam mm pada {k} hari|0|30',
    'masses in kg of {k} parcels|jisim dalam kg bagi {k} bungkusan|2|25',
    'number of customers at a nasi lemak stall on {k} days|bilangan pelanggan di sebuah gerai nasi lemak pada {k} hari|20|80',
    'heights in cm of {k} chilli seedlings|ketinggian dalam cm bagi {k} anak pokok cili|10|45',
    'pocket money in RM received by {k} students|wang saku dalam RM yang diterima oleh {k} orang murid|2|15',
    'number of eggs collected from a farm on {k} days|bilangan telur yang dikutip dari sebuah ladang pada {k} hari|30|70',
    'number of text messages sent by {k} students in a day|bilangan mesej teks yang dihantar oleh {k} orang murid dalam sehari|5|40',
    'noon temperature in °C on {k} days|suhu tengah hari dalam °C pada {k} hari|28|36',
    'number of pages read by {k} students last night|bilangan muka surat yang dibaca oleh {k} orang murid semalam|10|60',
    'shoe sizes of {k} students|saiz kasut {k} orang murid|3|10',
    'number of visitors to the school library on {k} days|bilangan pengunjung ke perpustakaan sekolah pada {k} hari|30|90',
    'number of passengers on {k} bus trips|bilangan penumpang dalam {k} perjalanan bas|10|45',
    'scores of {k} players in a computer game|skor {k} orang pemain dalam satu permainan komputer|30|95',
    'ages of {k} members of a youth club|umur {k} orang ahli sebuah kelab belia|12|18',
    'number of sit-ups done by {k} students in one minute|bilangan bangkit tubi yang dibuat oleh {k} orang murid dalam satu minit|15|45',
    'distances in km cycled by {k} cyclists|jarak dalam km yang dikayuh oleh {k} orang penunggang basikal|3|25',
    'number of durians harvested from {k} trees|bilangan durian yang dituai daripada {k} batang pokok|5|30',
    'lengths in cm of {k} ribbons|panjang dalam cm bagi {k} utas reben|20|60',
    'number of students absent from a class on {k} days|bilangan murid yang tidak hadir ke sebuah kelas pada {k} hari|0|8',
    'prices in RM of {k} lunch sets|harga dalam RM bagi {k} set makan tengah hari|4|14',
  ].map((s) => { const p = s.split('|'); return { en: p[0], ms: p[1], lo: +p[2], hi: +p[3] }; });
  const BIG = DATA.filter((d) => d.hi - d.lo >= 20);
  const dsc = (d, k, i) => (i ? d.ms : d.en).replace('{k}', k);
  /** category contexts (12.1) */
  const CAT = [
    ['favourite sport|sukan kegemaran', 'football/bola sepak,badminton/badminton,netball/bola jaring,swimming/renang,hockey/hoki,sepak takraw/sepak takraw'],
    ['favourite fruit|buah kegemaran', 'mango/mangga,banana/pisang,durian/durian,papaya/betik,rambutan/rambutan,watermelon/tembikai'],
    ['way of travelling to school|cara ke sekolah', 'bus/bas,car/kereta,bicycle/basikal,walking/berjalan kaki,motorcycle/motosikal'],
    ['pet kept at home|haiwan peliharaan di rumah', 'cat/kucing,fish/ikan,rabbit/arnab,bird/burung,hamster/hamster'],
    ['favourite canteen drink|minuman kegemaran di kantin', 'teh tarik/teh tarik,sirap bandung/sirap bandung,orange juice/jus oren,plain water/air kosong,Milo/Milo'],
    ['favourite subject|subjek kegemaran', 'Mathematics/Matematik,Science/Sains,History/Sejarah,English/Bahasa Inggeris,Art/Pendidikan Seni'],
    ['favourite colour|warna kegemaran', 'red/merah,blue/biru,green/hijau,yellow/kuning,purple/ungu'],
    ['favourite hobby|hobi kegemaran', 'reading/membaca,gaming/bermain permainan video,drawing/melukis,cooking/memasak,gardening/berkebun'],
    ['favourite local dish|makanan tempatan kegemaran', 'nasi lemak/nasi lemak,roti canai/roti canai,laksa/laksa,satay/sate,char kuey teow/char kuey teow'],
    ['favourite recess snack|makanan ringan kegemaran waktu rehat', 'curry puff/karipap,kuih/kuih,fried banana/pisang goreng,sandwich/sandwic,apam balik/apam balik'],
  ].map((c) => { const t = c[0].split('|'); return { en: t[0], ms: t[1], its: P2(c[1]) }; });
  /** k observations of a category context: {c, its, idx, fs} with every category present */
  const catData = (r, k, m) => {
    const c = r.pick(CAT), its = r.sample(c.its, m);
    const idx = Array.from({ length: k }, () => r.int(0, m - 1));
    const fs = its.map((_, j) => idx.filter((x) => x === j).length);
    need(fs.every((f) => f >= 2) && fs.some((f) => f >= 6));
    return { c, its, idx, fs };
  };
  /** equal-width classes 10–19… : starting value s, width w, k classes */
  const cls = (s, w, k) => rl(0, k - 1).map((i) => [s + i * w, s + i * w + w - 1]);
  const cs = (c) => c[0] + '–' + c[1];
  const inC = (v, c) => v >= c[0] && v <= c[1];
  /** raw observations of context d grouped with width w (4–7 classes): {cl, vals, fs} */
  const groupSet = (r, d, N, w) => {
    const s = Math.floor(d.lo / w) * w, k = Math.ceil((d.hi + 1 - s) / w);
    need(k >= 4 && k <= 7);
    const cl = cls(s, w, k), vals = Array.from({ length: N }, () => tri(r, d.lo, d.hi));
    return { cl, vals, fs: cl.map((c) => vals.filter((v) => inC(v, c)).length) };
  };
  const gTab = (i, cl, fs, head) => SPM.table(cl.map((c, j) => [cs(c), fs[j]]), { head: (head || [CI, FQ]).map((h) => h.split('|')[i]) });
  const YES = T('Yes', 'Ya'), NO = T('No', 'Tidak');
  /* ---- shared by 12.2–12.5: small-integer contexts, ungrouped tables and figures ---- */
  const UF = [
    'number of goals scored in each of {k} matches|bilangan gol yang dijaringkan dalam setiap satu daripada {k} perlawanan|0|6|Goals|Gol|matches|perlawanan',
    'number of brothers and sisters of {k} students|bilangan adik-beradik bagi {k} orang murid|0|6|Siblings|Adik-beradik|students|murid',
    'shoe sizes of {k} students|saiz kasut {k} orang murid|3|9|Shoe size|Saiz kasut|students|murid',
    'number of books read last month by {k} students|bilangan buku yang dibaca oleh {k} orang murid pada bulan lepas|0|7|Books|Buku|students|murid',
    'number of cars owned by {k} households|bilangan kereta yang dimiliki oleh {k} buah isi rumah|0|6|Cars|Kereta|households|isi rumah',
    'number of correct answers of {k} students in a 10-question quiz|bilangan jawapan betul {k} orang murid dalam kuiz 10 soalan|3|10|Score|Skor|students|murid',
    'number of days absent from school in a term by {k} students|bilangan hari tidak hadir ke sekolah dalam satu penggal bagi {k} orang murid|0|7|Days|Hari|students|murid',
    'number of cracked eggs in each of {k} trays|bilangan telur retak dalam setiap satu daripada {k} dulang|0|6|Cracked eggs|Telur retak|trays|dulang',
    'number of people living in {k} households|bilangan orang yang tinggal dalam {k} buah isi rumah|1|8|People|Orang|households|isi rumah',
  ].map((s) => { const p = s.split('|'); return { en: p[0], ms: p[1], lo: +p[2], hi: +p[3], h: p[4] + '|' + p[5], who: p[6] + '|' + p[7] }; });
  /** ungrouped frequency data: k consecutive values with frequencies */
  const ufSet = (r, K) => {
    const u = r.pick(UF), k = K || r.int(4, 6), s = r.int(u.lo, u.hi - k + 1), xs = rl(s, s + k - 1), fs = xs.map(() => r.int(1, 9));
    return { u, xs, fs, N: sum(fs), sx: sum(xs.map((x, i) => x * fs[i])) };
  };
  const expand = (xs, fs) => xs.reduce((a, x, i) => a.concat(Array(fs[i]).fill(x)), []);
  /** where the median sits among N ordered values ('the 7th value' / 'the mean of the 6th and 7th values') */
  const posTxt = (N, i) => (N % 2 ? (i ? `nilai ke-${(N + 1) / 2}` : `the ${ord((N + 1) / 2)} value`) : (i ? `min bagi nilai ke-${N / 2} dan ke-${N / 2 + 1}` : `the mean of the ${ord(N / 2)} and ${ord(N / 2 + 1)} values`));
  const medLine = (N, md) => T(`With ${N} values in order, the median is ${posTxt(N, 0)}: $${n(md)}$`, `Dengan ${N} nilai yang tersusun, median ialah ${posTxt(N, 1)}: $${n(md)}$`);
  /** 'value x frequency' product line for an ungrouped table */
  const fxLine = (xs, fs, tot) => T(`$\\sum fx = ${xs.map((x, i) => `${x} \\times ${fs[i]}`).join(' + ')} = ${tot}$`);
  /** coefficient in front of a letter: 1 -> '', -1 -> '-' */
  const co = (c) => (c === 1 ? '' : c === -1 ? '-' : String(c));
  const nr = (x) => n(round(x, 6));
  const cof = (c) => (c === 1 ? '' : c === -1 ? '-' : nr(c));
  const cntLine = (v) => { const c = cnt(v), ks = sortNum(Object.keys(c).map(Number)); return T(ks.map((x) => `${x}: ${c[x]}`).join('; ')); };
  const ufTab = (i, U, fs) => SPM.table([[FQ.split('|')[i]].concat(fs || U.fs)], { head: [U.u.h.split('|')[i]].concat(U.xs) });
  /** bar chart of frequencies (bilingual figure) */
  const barFig = (U, fs) => {
    const mx = Math.max(...(fs || U.fs)), st = mx > 10 ? 2 : 1, ym = Math.ceil(mx / st) * st + st;
    const mk = (i) => S.bar({ cats: U.xs.map(String), vals: fs || U.fs, ymax: ym, ystep: st, ylabel: FQ.split('|')[i], w: 300, h: 190 });
    return T(mk(0), mk(1));
  };
  /** dot plot of a list of integers */
  const dotFig = (vals) => {
    const lo = Math.min(...vals), hi = Math.max(...vals), c = cnt(vals), mx = Math.max(...Object.values(c)), st = hi - lo > 14 ? 2 : 1, W = 34 + (hi - lo + 1) * 24, H = 40 + mx * 15;
    let o = S.line(14, H - 24, W - 10, H - 24);
    for (let v = lo; v <= hi; v++) {
      const x = 28 + (v - lo) * 24;
      o += S.line(x, H - 24, x, H - 20);
      if ((v - lo) % st === 0) o += S.text(x, H - 9, String(v), { s: 11 });
      for (let q = 0; q < (c[v] || 0); q++) o += S.circle(x, H - 33 - q * 15, 5, { fill: 'currentColor' });
    }
    return S.wrap(W, H, o, 'dot plot');
  };
  /** stem-and-leaf plot (values 10–99) */
  const stemTab = (i, vals, unit) => {
    const v = sortNum(vals), st = {};
    v.forEach((x) => (st[Math.floor(x / 10)] = (st[Math.floor(x / 10)] || []).concat(x % 10)));
    const ks = Object.keys(st), k0 = +ks[0];
    const rows = rl(k0, +ks[ks.length - 1]).map((s) => [s, (st[s] || []).join(' ')]);
    const t = SPM.table(rows, { head: ['Stem|Batang', 'Leaf|Daun'].map((h) => h.split('|')[i]) });
    return t + `<br>${i ? 'Kunci' : 'Key'}: ${rows[0][0]} | ${st[k0][0]} ${i ? 'bermaksud' : 'means'} ${k0 * 10 + st[k0][0]}${unit ? ' ' + unit : ''}`;
  };
  /** pictograph: labels, values (multiples of key) */
  const picTab = (i, hd, labels, vals, key, what) => SPM.table(labels.map((l, j) => [l, '●'.repeat(vals[j] / key)]), { head: [hd.split('|')[i], ''] }) + `<br>${i ? 'Kunci' : 'Key'}: ● = ${key} ${what.split('|')[i]}`;

  /* ====================================================== F2-12.1 Data collection and organisation */
  const STAT = [
    ['How many hours of sleep do Form 2 students get on a school night?', 'Berapa jam tidurkah yang diperoleh murid Tingkatan 2 pada malam persekolahan?', 1],
    ['Which fruit is the most popular among the students in our school?', 'Buah apakah yang paling popular dalam kalangan murid di sekolah kita?', 1],
    ['How long do Form 2 students take to travel to school?', 'Berapa lamakah murid Tingkatan 2 mengambil masa untuk ke sekolah?', 1],
    ['How much money do students spend at the canteen each day?', 'Berapakah wang yang dibelanjakan oleh murid di kantin setiap hari?', 1],
    ['How many text messages do teenagers send in a day?', 'Berapakah bilangan mesej teks yang dihantar oleh remaja dalam sehari?', 1],
    ['What is the most common shoe size in Form 2?', 'Apakah saiz kasut yang paling biasa dalam Tingkatan 2?', 1],
    ['How many sides does a hexagon have?', 'Berapakah bilangan sisi sebuah heksagon?', 0],
    ['What is the capital city of Malaysia?', 'Apakah ibu negara Malaysia?', 0],
    ['What is 25% of 80?', 'Berapakah 25% daripada 80?', 0],
    ['How tall is Aisyah?', 'Berapakah ketinggian Aisyah?', 0],
    ['What is the mass of this bag of rice?', 'Berapakah jisim beg beras ini?', 0],
    ['At what time does our school assembly start?', 'Pada pukul berapakah perhimpunan sekolah kita bermula?', 0],
  ];
  const SRC = [
    ['Aiman measures the heights of 30 classmates with a tape measure.', 'Aiman mengukur ketinggian 30 orang rakan sekelas dengan pita pengukur.', 1],
    ['A teacher gives a questionnaire to the students to find out their favourite sport.', 'Seorang guru memberikan soal selidik kepada murid untuk mengetahui sukan kegemaran mereka.', 1],
    ['Mei Ling counts the vehicles that pass the school gate between 7 a.m. and 8 a.m.', 'Mei Ling mengira kenderaan yang melalui pintu pagar sekolah antara pukul 7 pagi dengan 8 pagi.', 1],
    ['Farid interviews 20 shoppers at a pasar malam about how much they spend.', 'Farid menemu bual 20 orang pembeli di pasar malam tentang jumlah wang yang mereka belanjakan.', 1],
    ['A student copies the monthly rainfall figures of Kuching from a website of the Meteorological Department.', 'Seorang murid menyalin angka hujan bulanan di Kuching daripada laman web Jabatan Meteorologi.', 0],
    ['Hafiz uses the population of each state published in a report of the Department of Statistics.', 'Hafiz menggunakan populasi setiap negeri yang diterbitkan dalam laporan Jabatan Perangkaan.', 0],
    ['Priya uses the football league results printed in a newspaper.', 'Priya menggunakan keputusan liga bola sepak yang dicetak dalam akhbar.', 0],
    ['A student uses the numbers of visitors to Langkawi given in a tourism magazine.', 'Seorang murid menggunakan bilangan pelancong ke Langkawi yang diberikan dalam majalah pelancongan.', 0],
  ];
  const INV = [
    ['how much time Form 2 students spend on homework each evening|berapa lama murid Tingkatan 2 menghabiskan masa untuk kerja rumah setiap petang', 'all Form 2 students of the school (or a random sample from each class)|semua murid Tingkatan 2 di sekolah (atau sampel rawak daripada setiap kelas)', 'time in minutes (measured, so continuous)|masa dalam minit (diukur, maka selanjar)', 'a questionnaire given to the sampled students|soal selidik yang diberikan kepada murid yang dipilih', 'classes of 15 minutes: 0–14, 15–29, 30–44, …|kelas 15 minit: 0–14, 15–29, 30–44, …'],
    ['the heights of Form 2 students|ketinggian murid Tingkatan 2', 'all Form 2 students, or a random sample of students from each class|semua murid Tingkatan 2, atau sampel rawak murid daripada setiap kelas', 'height in cm, measured to the nearest cm|ketinggian dalam cm, diukur kepada cm yang terdekat', 'measuring each student with the same tape measure|mengukur setiap murid dengan pita pengukur yang sama', 'classes of 5 cm: 140–144, 145–149, …|kelas 5 cm: 140–144, 145–149, …'],
    ['how much pocket money students bring to school|berapa banyak wang saku yang dibawa oleh murid ke sekolah', 'students of Form 1 to Form 3 (a random sample from each form)|murid Tingkatan 1 hingga Tingkatan 3 (sampel rawak daripada setiap tingkatan)', 'pocket money in RM to the nearest RM|wang saku dalam RM kepada RM yang terdekat', 'a short questionnaire answered anonymously|soal selidik ringkas yang dijawab tanpa nama', 'classes of RM2: 0–1, 2–3, 4–5, …|kelas RM2: 0–1, 2–3, 4–5, …'],
    ['the number of books students borrow from the library in a term|bilangan buku yang dipinjam oleh murid dari perpustakaan dalam satu penggal', 'all students who are library members, using the library records|semua murid yang menjadi ahli perpustakaan, menggunakan rekod perpustakaan', 'number of books (counted, so discrete)|bilangan buku (dikira, maka diskret)', 'reading the library records (secondary data) or asking students (primary data)|membaca rekod perpustakaan (data sekunder) atau bertanya kepada murid (data primer)', 'classes of 3 books: 0–2, 3–5, 6–8, …|kelas 3 buah buku: 0–2, 3–5, 6–8, …'],
    ['how far students live from school|jarak rumah murid dari sekolah', 'a random sample of students from every form|sampel rawak murid daripada setiap tingkatan', 'distance in km, to the nearest km|jarak dalam km, kepada km yang terdekat', 'asking students to give the distance from their home address|meminta murid memberikan jarak dari alamat rumah mereka', 'classes of 2 km: 0–1, 2–3, 4–5, …|kelas 2 km: 0–1, 2–3, 4–5, …'],
    ['the time students take to run 100 m|masa yang diambil oleh murid untuk berlari 100 m', 'all Form 2 boys (or all Form 2 girls) who take part in the test|semua murid lelaki Tingkatan 2 (atau semua murid perempuan Tingkatan 2) yang menyertai ujian', 'time in seconds, measured with a stopwatch|masa dalam saat, diukur dengan jam randik', 'timing each student with the same stopwatch at the same track|memasa setiap murid dengan jam randik yang sama di trek yang sama', 'classes of 2 seconds: 12–13, 14–15, 16–17, …|kelas 2 saat: 12–13, 14–15, 16–17, …'],
  ];
  const PARTS = [['State the population.', 'Nyatakan populasi.'], ['State the variable and its unit.', 'Nyatakan pemboleh ubah dan unitnya.'], ['Suggest a method of collecting the data.', 'Cadangkan satu kaedah mengumpul data.'], ['Suggest suitable class intervals for the data.', 'Cadangkan selang kelas yang sesuai untuk data itu.']];
  const BIAS = [
    ['To find the favourite sport of all the students in the school, Farid asks only the members of the football team.', 'Untuk mengetahui sukan kegemaran semua murid di sekolah, Farid bertanya kepada ahli pasukan bola sepak sahaja.', 'The sample is biased: football players are more likely to choose football and the other students are not represented.', 'Sampel itu berat sebelah: pemain bola sepak lebih cenderung memilih bola sepak dan murid lain tidak diwakili.'],
    ['To find how long Form 2 students spend on homework, Siti asks the 5 friends who sit next to her.', 'Untuk mengetahui berapa lama murid Tingkatan 2 menghabiskan masa untuk kerja rumah, Siti bertanya kepada 5 orang kawan yang duduk di sebelahnya.', 'The sample is too small and was not chosen at random, so it may not represent all Form 2 students.', 'Sampel terlalu kecil dan tidak dipilih secara rawak, maka mungkin tidak mewakili semua murid Tingkatan 2.'],
    ['A fruit seller asks only customers who are buying durians which fruit is the most popular in the town.', 'Seorang penjual buah bertanya kepada pelanggan yang membeli durian sahaja tentang buah yang paling popular di bandar itu.', 'The sample is biased: people buying durians are likely to choose durian, so it does not represent the whole town.', 'Sampel itu berat sebelah: pembeli durian cenderung memilih durian, maka tidak mewakili seluruh bandar.'],
    ['To find out how students travel to school, Kumar surveys the students waiting at the school bus stop.', 'Untuk mengetahui cara murid ke sekolah, Kumar membuat tinjauan terhadap murid yang menunggu di perhentian bas sekolah.', 'Students who walk, cycle or come by car are missed, so the sample is biased towards bus users.', 'Murid yang berjalan kaki, berbasikal atau menaiki kereta tidak dimasukkan, maka sampel berat sebelah kepada pengguna bas.'],
    ['A canteen operator asks only the students in the queue for nasi lemak whether they prefer rice or noodles.', 'Pengendali kantin bertanya kepada murid yang beratur untuk membeli nasi lemak sahaja sama ada mereka lebih suka nasi atau mi.', 'Students who are queuing for rice are likely to prefer rice, so the sample is biased.', 'Murid yang beratur untuk membeli nasi cenderung lebih suka nasi, maka sampel berat sebelah.'],
    ['Mei Ling measures the heights of 8 students in the school choir and says that this is the typical height of all Form 2 students.', 'Mei Ling mengukur ketinggian 8 orang murid dalam koir sekolah dan mengatakan bahawa itu ialah ketinggian biasa semua murid Tingkatan 2.', 'Eight students from one group is a small sample and may not represent all Form 2 students.', 'Lapan orang murid daripada satu kumpulan ialah sampel yang kecil dan mungkin tidak mewakili semua murid Tingkatan 2.'],
  ];
  const ge121 = [
    /* tally -> frequency table */
    (r) => {
      const k = r.int(16, 24), { c, its, idx, fs } = catData(r, k, r.int(4, 5));
      const tb = (i) => tabL(i, its.map((x) => [x[i], '', '']), [CT, 'Tally|Tally', FQ]);
      const mx = its[fs.indexOf(Math.max(...fs))];
      need(fs.filter((f) => f === Math.max(...fs)).length === 1);
      const ask = r.pick([['', ''], [' and state the total of the frequencies', ' dan nyatakan jumlah kekerapan'], [' and state the most popular choice', ' dan nyatakan pilihan yang paling popular']]);
      const wl = [T('Go through the list once and put one tally stroke against each answer.', 'Baca senarai itu sekali dan letakkan satu tanda tally bagi setiap jawapan.'),
        T(its.map((x, j) => `${x[0]}: ${tally(fs[j])} = ${fs[j]}`).join('; '), its.map((x, j) => `${x[1]}: ${tally(fs[j])} = ${fs[j]}`).join('; ')),
        T(`Check: $${fs.join(' + ')} = ${k}$`, `Semak: $${fs.join(' + ')} = ${k}$`)];
      if (ask[0].includes('total')) wl.push(T(`Total of the frequencies $= ${k}$`, `Jumlah kekerapan $= ${k}$`));
      else if (ask[0]) wl.push(T(`The highest frequency is ${Math.max(...fs)}, so the most popular choice is ${mx[0]}.`, `Kekerapan tertinggi ialah ${Math.max(...fs)}, maka pilihan yang paling popular ialah ${mx[1]}.`));
      const w = W(...wl);
      return { q: T(`${k} students were asked about their ${c.en}. Their answers were:<br>${idx.map((j) => its[j][0]).join(', ')}.<br>Complete the tally and frequency table${ask[0]}.<br>${tb(0)}`, `${k} orang murid ditanya tentang ${c.ms} mereka. Jawapan mereka ialah:<br>${idx.map((j) => its[j][1]).join(', ')}.<br>Lengkapkan jadual tally dan kekerapan${ask[1]}.<br>${tb(1)}`), a: T(its.map((x, j) => `${x[0]}: ${fs[j]}`).join('; '), its.map((x, j) => `${x[1]}: ${fs[j]}`).join('; ')), w, sp: 'm' };
    },
    /* read a tally chart */
    (r) => {
      const { c, its, fs } = catData(r, 20, r.int(4, 5)), tot = sum(fs);
      const tb = (i) => tabL(i, its.map((x, j) => [x[i], tally(fs[j])]), [CT, 'Tally|Tally']);
      const ask = r.int(0, 2), a = r.int(0, its.length - 1);
      const qs = [[`Write the frequency of each ${'category'}.`, 'Tulis kekerapan bagi setiap kategori.'], [`How many students were surveyed altogether?`, `Berapakah bilangan murid yang dikaji kesemuanya?`], [`How many more students chose ${its[a][0]} than the least popular choice?`, `Berapa orang lebih ramaikah murid yang memilih ${its[a][1]} berbanding pilihan yang paling kurang popular?`]][ask];
      const ans = [[its.map((x, j) => `${x[0]}: ${fs[j]}`).join('; '), its.map((x, j) => `${x[1]}: ${fs[j]}`).join('; ')], [`$${tot}$ students`, `$${tot}$ orang murid`], [`$${fs[a]} - ${Math.min(...fs)} = ${fs[a] - Math.min(...fs)}$`, `$${fs[a]} - ${Math.min(...fs)} = ${fs[a] - Math.min(...fs)}$`]][ask];
      need(ask < 2 || fs[a] > Math.min(...fs));
      const mn = Math.min(...fs), lst = its[fs.indexOf(mn)];
      const wl = [T('A group of five strokes stands for 5, so count the groups of five and then the single strokes.', 'Satu kumpulan lima tanda mewakili 5, maka bilang kumpulan lima dahulu dan kemudian tanda tunggal.'),
        T(its.map((x, j) => `${x[0]}: ${fs[j]}`).join('; '), its.map((x, j) => `${x[1]}: ${fs[j]}`).join('; '))];
      if (ask === 1) wl.push(T(`$${fs.join(' + ')} = ${tot}$`));
      if (ask === 2) wl.push(T(`The least popular choice is ${lst[0]}, with ${mn}.`, `Pilihan yang paling kurang popular ialah ${lst[1]}, dengan ${mn}.`), T(`$${fs[a]} - ${mn} = ${fs[a] - mn}$`));
      return { q: T(`The tally chart shows the ${c.en} of a group of students.<br>${tb(0)}<br>${qs[0]}`, `Carta tally menunjukkan ${c.ms} sekumpulan murid.<br>${tb(1)}<br>${qs[1]}`), a: T(ans[0], ans[1]), w: W(...wl), sp: 's' };
    },
    /* missing frequency from the total */
    (r) => {
      const m = r.int(4, 5), { c, its, fs } = catData(r, r.int(20, 30), m), miss = r.int(0, m - 1), tot = sum(fs);
      const tb = (i) => tabL(i, its.map((x, j) => [x[i], j === miss ? '?' : fs[j]]), [CT, FQ]);
      return { q: T(`${tot} students were asked about their ${c.en}. The results are shown in the table.<br>${tb(0)}<br>Find the missing frequency.`, `${tot} orang murid ditanya tentang ${c.ms} mereka. Keputusan ditunjukkan dalam jadual.<br>${tb(1)}<br>Cari kekerapan yang hilang.`), a: T(`$${tot} - ${fs.filter((_, j) => j !== miss).join(' - ')} = ${fs[miss]}$`), w: W(T('The frequencies must add up to the number of students surveyed.', 'Kekerapan mesti berjumlah bilangan murid yang ditinjau.'), T(`Known frequencies: $${fs.filter((_, j) => j !== miss).join(' + ')} = ${sum(fs) - fs[miss]}$`, `Kekerapan yang diketahui: $${fs.filter((_, j) => j !== miss).join(' + ')} = ${sum(fs) - fs[miss]}$`), T(`$${tot} - ${sum(fs) - fs[miss]} = ${fs[miss]}$`)), sp: 's' };
    },
    /* draw tally marks */
    (r) => {
      const c = r.pick(CAT), it = r.pick(c.its), f = r.int(7, 23);
      return { q: T(`In a survey on ${c.en}, ${f} students chose ${it[0]}. Show this number using tally marks.`, `Dalam satu tinjauan tentang ${c.ms}, ${f} orang murid memilih ${it[1]}. Tunjukkan bilangan ini menggunakan tanda tally.`), a: T(tally(f) + ` (${Math.floor(f / 5)} groups of five and ${f % 5} more)`, tally(f) + ` (${Math.floor(f / 5)} kumpulan lima dan ${f % 5} lagi)`), w: W(T(`Tally marks are grouped in fives: $${f} = ${Math.floor(f / 5)} \\times 5 + ${f % 5}$`, `Tanda tally dikumpulkan dalam lima: $${f} = ${Math.floor(f / 5)} \\times 5 + ${f % 5}$`), T(`So draw ${Math.floor(f / 5)} group${Math.floor(f / 5) > 1 ? 's' : ''} of five and ${f % 5} single stroke${f % 5 === 1 ? '' : 's'}: ` + tally(f), `Maka lukis ${Math.floor(f / 5)} kumpulan lima dan ${f % 5} tanda tunggal: ` + tally(f))), sp: 's' };
    },
    /* is it a statistical question? */
    (r) => {
      const s = r.pick(STAT);
      return { q: T(`Is the following a statistical question? Give a reason.<br>"${s[0]}"`, `Adakah yang berikut satu soalan statistik? Berikan sebab.<br>"${s[1]}"`), a: s[2] ? T('Yes. The answers vary from one person to another, so data must be collected.', 'Ya. Jawapan berbeza-beza antara seseorang dengan yang lain, maka data perlu dikumpulkan.') : T('No. It has only one fixed answer, so there is no variation in the data.', 'Tidak. Ia hanya mempunyai satu jawapan tetap, maka tiada kebolehubahan dalam data.'), w: W(T('Test: would asking different people (or measuring on different occasions) give different answers?', 'Ujian: adakah bertanya kepada orang yang berlainan (atau mengukur pada masa yang berlainan) memberikan jawapan yang berbeza?'), s[2] ? T('Yes, the answers vary, so a set of data has to be collected and summarised — it is a statistical question.', 'Ya, jawapannya berbeza-beza, maka satu set data perlu dikumpulkan dan diringkaskan — ia soalan statistik.') : T('No, the answer is the same every time and can be found once, so no data set is needed.', 'Tidak, jawapannya sama setiap kali dan boleh dicari sekali sahaja, maka tiada set data diperlukan.')), sp: 's' };
    },
    /* primary or secondary */
    (r) => {
      const s = r.pick(SRC);
      return { q: T(`State whether the data is primary data or secondary data.<br>${s[0]}`, `Nyatakan sama ada data itu data primer atau data sekunder.<br>${s[1]}`), a: s[2] ? T('Primary data: it is collected directly by the person who will use it.', 'Data primer: ia dikumpulkan sendiri secara langsung oleh orang yang akan menggunakannya.') : T('Secondary data: it was already collected by someone else.', 'Data sekunder: ia telah dikumpulkan oleh orang lain.'), w: W(T('Ask: who collected the data — the user, or somebody else?', 'Tanya: siapa yang mengumpul data itu — pengguna sendiri, atau orang lain?'), s[2] ? T('Here it is measured, counted or asked first-hand by the user, so it is primary data.', 'Di sini ia diukur, dibilang atau ditanya sendiri oleh pengguna, maka ia data primer.') : T('Here it is taken from a report, website or newspaper published by somebody else, so it is secondary data.', 'Di sini ia diambil daripada laporan, laman web atau akhbar yang diterbitkan oleh orang lain, maka ia data sekunder.')), sp: 's' };
    },
    /* which class contains v / class size */
    (r) => {
      const d = r.pick(BIG), w = r.pick([5, 10]), k = r.int(4, 6), s = r.pick([0, 10, 20]), cl = cls(s, w, k), v = r.int(s, s + w * k - 1);
      const j = cl.findIndex((c) => inC(v, c));
      return { q: T(`The data on the ${dsc(d, 'some', 0)} are grouped into the classes ${cl.map(cs).join(', ')}.<br>(a) In which class does the value ${v} belong?<br>(b) State the class size (width) of each class.`, `Data tentang ${dsc(d, 'beberapa', 1)} dikumpulkan ke dalam kelas ${cl.map(cs).join(', ')}.<br>(a) Dalam kelas manakah nilai ${v} berada?<br>(b) Nyatakan saiz kelas (lebar) bagi setiap kelas.`), a: SPM.lines(T(`(a) ${cs(cl[j])}`, `(a) ${cs(cl[j])}`), T(`(b) $${w}$`, `(b) $${w}$`)), w: W(T(`(a) $${cl[j][0]} \\le ${v} \\le ${cl[j][1]}$, so ${v} belongs to ${cs(cl[j])}.`, `(a) $${cl[j][0]} \\le ${v} \\le ${cl[j][1]}$, maka ${v} berada dalam ${cs(cl[j])}.`), T(`(b) Class size $= ${cl[0][1]} - ${cl[0][0]} + 1 = ${w}$ (count the whole numbers in one class).`, `(b) Saiz kelas $= ${cl[0][1]} - ${cl[0][0]} + 1 = ${w}$ (bilang nombor bulat dalam satu kelas).`)), sp: 's' };
    },
    /* count the values in a class */
    (r) => {
      const d = r.pick(BIG), N = r.int(14, 20), vals = Array.from({ length: N }, () => tri(r, d.lo, d.hi)), w = r.pick([5, 10]), s = Math.floor(r.int(d.lo, d.hi - w) / w) * w, c = [s, s + w - 1];
      const f = vals.filter((v) => inC(v, c)).length;
      need(f >= 1 && f <= N - 3);
      const sel = vals.filter((v) => inC(v, c));
      return { q: T(`${cap(dsc(d, N, 0))}:<br>${vals.join(', ')}.<br>How many of the values lie in the class ${cs(c)}?`, `${cap(dsc(d, N, 1))}:<br>${vals.join(', ')}.<br>Berapakah bilangan nilai yang terletak dalam kelas ${cs(c)}?`), a: T(`$${f}$`), w: W(T(`Pick out every value from ${c[0]} to ${c[1]} (both included): $${list(sel)}$`, `Pilih setiap nilai dari ${c[0]} hingga ${c[1]} (termasuk kedua-duanya): $${list(sel)}$`), T(`Count them: $${f}$`, `Bilang: $${f}$`)), sp: 's' };
    },
    /* read a grouped table */
    (r) => {
      const d = r.pick(BIG), w = r.pick([5, 10]), g = groupSet(r, d, r.int(24, 40), w), { cl, fs } = g, N = g.vals.length, mx = Math.max(...fs);
      need(fs.filter((f) => f === mx).length === 1 && fs.every((f) => f > 0));
      const j = r.int(0, cl.length - 1), ask = r.int(0, 3);
      const Q = [[`How many observations are there in total?`, `Berapakah jumlah cerapan?`, `$${N}$`], [`State the frequency of the class ${cs(cl[j])}.`, `Nyatakan kekerapan bagi kelas ${cs(cl[j])}.`, `$${fs[j]}$`], [`Which class has the highest frequency?`, `Kelas manakah yang mempunyai kekerapan tertinggi?`, cs(cl[fs.indexOf(mx)])], [`How many observations are in the last two classes?`, `Berapakah bilangan cerapan dalam dua kelas terakhir?`, `$${fs[fs.length - 1] + fs[fs.length - 2]}$`]][ask];
      const wl = [[T('The total number of observations is the sum of all the frequencies.', 'Jumlah cerapan ialah hasil tambah semua kekerapan.'), T(`$${fs.join(' + ')} = ${N}$`)],
        [T(`Read the frequency in the row ${cs(cl[j])}.`, `Baca kekerapan dalam baris ${cs(cl[j])}.`), T(`$${fs[j]}$`)],
        [T(`Compare the frequencies $${fs.join(',\\ ')}$; the largest is $${mx}$.`, `Bandingkan kekerapan $${fs.join(',\\ ')}$; yang terbesar ialah $${mx}$.`), T(`It is in the class ${cs(cl[fs.indexOf(mx)])}.`, `Ia berada dalam kelas ${cs(cl[fs.indexOf(mx)])}.`)],
        [T(`Add the frequencies of ${cs(cl[cl.length - 2])} and ${cs(cl[cl.length - 1])}.`, `Tambah kekerapan bagi ${cs(cl[cl.length - 2])} dan ${cs(cl[cl.length - 1])}.`), T(`$${fs[fs.length - 2]} + ${fs[fs.length - 1]} = ${fs[fs.length - 1] + fs[fs.length - 2]}$`)]][ask];
      return { q: T(`The table shows the ${dsc(d, N, 0)}.<br>${gTab(0, cl, fs)}<br>${Q[0]}`, `Jadual menunjukkan ${dsc(d, N, 1)}.<br>${gTab(1, cl, fs)}<br>${Q[1]}`), a: T(Q[2]), w: W(...wl), sp: 's' };
    },
  ];
  /* grouped-data contexts: title, meaning of "f in class c", raw-value range, allowed class widths */
  const GI = [
    ['marks of students in a Mathematics test|markah murid dalam satu ujian Matematik', '{f} students scored {c} marks|{f} orang murid mendapat {c} markah', 'Marks|Markah', 20, 99, [10]],
    ['time in minutes taken by students to complete a puzzle|masa dalam minit yang diambil oleh murid untuk menyiapkan satu teka-teki', '{f} students took {c} minutes to complete the puzzle|{f} orang murid mengambil {c} minit untuk menyiapkan teka-teki itu', 'Time (min)|Masa (min)', 10, 44, [5]],
    ['masses in kg of chickens on a farm|jisim dalam kg ayam di sebuah ladang', '{f} chickens have a mass of {c} kg|{f} ekor ayam mempunyai jisim {c} kg', 'Mass (kg)|Jisim (kg)', 10, 39, [5]],
    ['daily sales in RM of a food stall|jualan harian dalam RM sebuah gerai makanan', 'on {f} days the sales were {c} ringgit|pada {f} hari jualan ialah {c} ringgit', 'Sales (RM)|Jualan (RM)', 100, 199, [10]],
    ['number of visitors to a museum each day|bilangan pengunjung ke sebuah muzium setiap hari', 'on {f} days the museum had {c} visitors|pada {f} hari muzium itu dikunjungi {c} orang', 'Visitors|Pengunjung', 30, 74, [5]],
    ['ages in years of the people in a kampung|umur dalam tahun penduduk sebuah kampung', '{f} people are aged {c} years|{f} orang berumur {c} tahun', 'Age (years)|Umur (tahun)', 10, 69, [10]],
    ['distances in km travelled by cyclists in a charity ride|jarak dalam km yang dikayuh oleh penunggang basikal dalam satu kayuhan amal', '{f} cyclists travelled {c} km|{f} orang penunggang basikal mengayuh {c} km', 'Distance (km)|Jarak (km)', 5, 34, [5]],
    ['number of sit-ups done by students in one minute|bilangan bangkit tubi yang dibuat oleh murid dalam satu minit', '{f} students did {c} sit-ups|{f} orang murid membuat {c} bangkit tubi', 'Sit-ups|Bangkit tubi', 10, 39, [5]],
    ['electricity bills in RM of some households|bil elektrik dalam RM beberapa isi rumah', '{f} households paid {c} ringgit|{f} isi rumah membayar {c} ringgit', 'Bill (RM)|Bil (RM)', 40, 99, [10]],
    ['heights in cm of students in a class|ketinggian dalam cm murid dalam sebuah kelas', '{f} students have a height of {c} cm|{f} orang murid mempunyai ketinggian {c} cm', 'Height (cm)|Tinggi (cm)', 140, 169, [5]],
  ].map((g) => { const a = g[0].split('|'), b = g[1].split('|'), h = g[2].split('|'); return { en: a[0], ms: a[1], me: b[0], mm: b[1], he: h[0], hm: h[1], lo: g[3], hi: g[4], ws: g[5] }; });
  /** a grouped set of a GI context: classes from lo, width w, frequencies drawn from a hump shape */
  const giSet = (r, g, k) => {
    const w = r.pick(g.ws), K = k || r.int(4, 6), cl = cls(g.lo, w, K);
    const peak = r.int(1, K - 2), fs = cl.map((_, j) => Math.max(1, r.int(4, 9) - 2 * Math.abs(j - peak) + r.int(0, 2)));
    return { cl, fs, w };
  };
  const giTab = (i, g, S0, fs) => gTab(i, S0.cl, fs || S0.fs, [g.he + '|' + g.hm, FQ]);
  const gm121 = [
    /* construct a grouped table from raw data */
    (r) => {
      const d = r.pick(BIG), w = r.pick([5, 10]), N = r.int(20, 28), g = groupSet(r, d, N, w), { cl, vals, fs } = g, mx = Math.max(...fs);
      need(fs.filter((f) => f === mx).length === 1);
      const ask = r.int(0, 2), th = cl[r.int(1, cl.length - 2)][0];
      const A = [[' Then state the modal class.', ' Kemudian nyatakan kelas mod.', `; modal class ${cs(cl[fs.indexOf(mx)])}`, `; kelas mod ${cs(cl[fs.indexOf(mx)])}`], [` Then find how many values are ${th} or more.`, ` Kemudian cari bilangan nilai yang ${th} atau lebih.`, `; ${th} or more: $${sum(vals.map((v) => (v >= th ? 1 : 0)))}$`, `; ${th} atau lebih: $${sum(vals.map((v) => (v >= th ? 1 : 0)))}$`], ['', '', '', '']][ask];
      const ti = cl.findIndex((c) => c[0] === th);
      const wl = [T('Go through the list once, putting a tally stroke in the class each value belongs to.', 'Baca senarai itu sekali, letakkan satu tanda tally dalam kelas tempat setiap nilai berada.'),
        T(cl.map((c, j) => `${cs(c)}: ${fs[j]}`).join('; ')),
        T(`Check: $${fs.join(' + ')} = ${N}$`, `Semak: $${fs.join(' + ')} = ${N}$`)];
      if (ask === 0) wl.push(T(`The highest frequency is $${mx}$, so the modal class is ${cs(cl[fs.indexOf(mx)])}.`, `Kekerapan tertinggi ialah $${mx}$, maka kelas mod ialah ${cs(cl[fs.indexOf(mx)])}.`));
      if (ask === 1) wl.push(T(`${th} or more covers the classes from ${cs(cl[ti])} onwards: $${fs.slice(ti).join(' + ')} = ${sum(fs.slice(ti))}$`, `${th} atau lebih merangkumi kelas dari ${cs(cl[ti])} seterusnya: $${fs.slice(ti).join(' + ')} = ${sum(fs.slice(ti))}$`));
      return { q: T(`${cap(dsc(d, N, 0))}:<br>${vals.join(', ')}.<br>Construct a grouped frequency table using the classes ${cs(cl[0])}, ${cs(cl[1])}, …, ${cs(cl[cl.length - 1])}.${A[0]}`, `${cap(dsc(d, N, 1))}:<br>${vals.join(', ')}.<br>Bina jadual kekerapan terkumpul menggunakan kelas ${cs(cl[0])}, ${cs(cl[1])}, …, ${cs(cl[cl.length - 1])}.${A[1]}`), a: T(cl.map((c, j) => `${cs(c)}: ${fs[j]}`).join('; ') + A[2], cl.map((c, j) => `${cs(c)}: ${fs[j]}`).join('; ') + A[3]), w: W(...wl), sp: 'l' };
    },
    /* how many classes are needed */
    (r) => {
      const d = r.pick(BIG), w = r.pick([5, 10]), lo = r.int(d.lo, d.lo + 8), hi = r.int(lo + 3 * w, lo + 6 * w - 1), s = Math.floor(lo / w) * w, k = Math.floor((hi - s) / w) + 1;
      return { q: T(`In a study of the ${dsc(d, 'some', 0)}, the smallest value is ${lo} and the largest value is ${hi}. The data are grouped into classes of width ${w} starting from ${s} (${cs([s, s + w - 1])}, ${cs([s + w, s + 2 * w - 1])}, …).<br>How many classes are needed to include every value? State the first class and the last class.`, `Dalam satu kajian tentang ${dsc(d, 'beberapa', 1)}, nilai terkecil ialah ${lo} dan nilai terbesar ialah ${hi}. Data dikumpulkan ke dalam kelas berlebar ${w} bermula dari ${s} (${cs([s, s + w - 1])}, ${cs([s + w, s + 2 * w - 1])}, …).<br>Berapakah bilangan kelas yang diperlukan untuk memasukkan semua nilai? Nyatakan kelas pertama dan kelas terakhir.`), a: T(`${k} classes: first ${cs([s, s + w - 1])}, last ${cs([s + (k - 1) * w, s + k * w - 1])}`, `${k} kelas: pertama ${cs([s, s + w - 1])}, terakhir ${cs([s + (k - 1) * w, s + k * w - 1])}`), w: W(T(`Start at ${s} and add ${w} each time, until the class containing ${hi} is reached:`, `Mula dari ${s} dan tambah ${w} setiap kali, sehingga sampai kelas yang mengandungi ${hi}:`), T(rl(0, k - 1).map((i) => cs([s + i * w, s + i * w + w - 1])).join(', ')), T(`The last class ${cs([s + (k - 1) * w, s + k * w - 1])} contains ${hi}, so $${k}$ classes are needed.`, `Kelas terakhir ${cs([s + (k - 1) * w, s + k * w - 1])} mengandungi ${hi}, maka $${k}$ kelas diperlukan.`)), sp: 's' };
    },
    /* choose a class size */
    (r) => {
      const d = r.pick(BIG), lo = r.int(d.lo, d.lo + 5), K = r.pick([4, 5, 6]), hi = r.int(lo + 4 * K, lo + 9 * K), w = Math.ceil((hi - lo + 1) / K);
      const c = cls(lo, w, K);
      return { q: T(`The ${dsc(d, 'some', 0)} range from ${lo} to ${hi}. Ali wants to group them into ${K} classes of equal width, starting from ${lo}, with no gaps and no overlaps.<br>What is the smallest whole-number class width he can use? Write down the classes.`, `${cap(dsc(d, 'beberapa', 1))} berjulat dari ${lo} hingga ${hi}. Ali mahu mengumpulkannya ke dalam ${K} kelas berlebar sama, bermula dari ${lo}, tanpa sela dan tanpa pertindihan.<br>Apakah lebar kelas nombor bulat yang terkecil yang boleh digunakannya? Tulis kelas-kelas itu.`), a: T(`Width $${w}$: ${c.map(cs).join(', ')}`, `Lebar $${w}$: ${c.map(cs).join(', ')}`), w: W(T(`Whole numbers to cover: $${hi} - ${lo} + 1 = ${hi - lo + 1}$`, `Nombor bulat yang perlu dirangkumi: $${hi} - ${lo} + 1 = ${hi - lo + 1}$`), T(`Width must satisfy $${K} \\times \\text{width} \\ge ${hi - lo + 1}$`, `Lebar mesti memenuhi $${K} \\times \\text{lebar} \\ge ${hi - lo + 1}$`), T(`$${K} \\times ${w - 1} = ${K * (w - 1)}$ is too small, $${K} \\times ${w} = ${K * w} \\ge ${hi - lo + 1}$, so the width is $${w}$.`, `$${K} \\times ${w - 1} = ${K * (w - 1)}$ terlalu kecil, $${K} \\times ${w} = ${K * w} \\ge ${hi - lo + 1}$, maka lebarnya ialah $${w}$.`), T(c.map(cs).join(', '))), sp: 's' };
    },
    /* meaning of a frequency */
    (r) => {
      const g = r.pick(GI), S0 = giSet(r, g), j = r.int(0, S0.cl.length - 1), f = S0.fs[j], c = cs(S0.cl[j]);
      const m = (i) => (i ? g.mm : g.me).replace('{f}', f).replace('{c}', c);
      return { q: T(`The table shows the ${g.en}.<br>${giTab(0, g, S0)}<br>Explain what the frequency ${f} in the class ${c} means.`, `Jadual menunjukkan ${g.ms}.<br>${giTab(1, g, S0)}<br>Terangkan maksud kekerapan ${f} dalam kelas ${c}.`), a: T(`It means that ${m(0)}.`, `Ini bermaksud ${m(1)}.`), w: W(T(`The row ${c} is the class; the number ${f} beside it is its frequency.`, `Baris ${c} ialah kelas itu; nombor ${f} di sebelahnya ialah kekerapannya.`), T(`A frequency counts how many observations fall in that class, so ${m(0)}.`, `Kekerapan membilang bilangan cerapan yang jatuh dalam kelas itu, maka ${m(1)}.`), T('The table does not show the individual values, only how many are in each class.', 'Jadual tidak menunjukkan nilai individu, hanya bilangan dalam setiap kelas.')), sp: 's' };
    },
    /* percentage or fraction in a class */
    (r) => {
      const g = r.pick(GI), N = r.pick([20, 25, 40, 50]), K = r.int(4, 5), w = r.pick(g.ws), cl = cls(g.lo, w, K);
      const fs = Array(K).fill(1);
      for (let q = 0; q < N - K; q++) fs[r.int(0, K - 1)]++;
      const j = r.int(0, K - 1), pc = (100 * fs[j]) / N, ask = r.int(0, 1);
      const fr = Fr.make(fs[j] + fs[(j + 1) % K], N);
      const S0 = { cl, fs };
      const j2 = (j + 1) % K, ftot = fs[j] + fs[j2];
      const wF = ask ? W(T(`Add the two frequencies: $${fs[j]} + ${fs[j2]} = ${ftot}$`, `Tambah kedua-dua kekerapan: $${fs[j]} + ${fs[j2]} = ${ftot}$`), T(`Total number of observations $= ${N}$`, `Jumlah cerapan $= ${N}$`), T(`$\\dfrac{${ftot}}{${N}} = ${Fr.tex(fr)}$`))
        : W(T(`${fs[j]} of the ${N} observations lie in ${cs(cl[j])}.`, `${fs[j]} daripada ${N} cerapan terletak dalam ${cs(cl[j])}.`), T(`$\\dfrac{${fs[j]}}{${N}} \\times 100\\% = ${n(pc)}\\%$`));
      return { q: T(`The table shows the ${g.en}.<br>${giTab(0, g, S0)}<br>${ask ? `What fraction of the observations lie in the classes ${cs(cl[j])} and ${cs(cl[(j + 1) % K])} together? Give the answer in its simplest form.` : `What percentage of the observations lie in the class ${cs(cl[j])}?`}`, `Jadual menunjukkan ${g.ms}.<br>${giTab(1, g, S0)}<br>${ask ? `Berapakah pecahan cerapan yang terletak dalam kelas ${cs(cl[j])} dan ${cs(cl[(j + 1) % K])} bersama-sama? Beri jawapan dalam bentuk termudah.` : `Berapakah peratusan cerapan yang terletak dalam kelas ${cs(cl[j])}?`}`), a: ask ? T(`$${Fr.tex(fr)}$`) : T(`$\\dfrac{${fs[j]}}{${N}} \\times 100\\% = ${n(pc)}\\%$`), w: wF, sp: 's' };
    },
    /* missing frequency (grouped) */
    (r) => {
      const g = r.pick(GI), S0 = giSet(r, g), N = sum(S0.fs), j = r.int(0, S0.cl.length - 1);
      const shown = S0.fs.map((f, i) => (i === j ? '?' : f));
      const tb = (i) => giTab(i, g, S0, shown);
      return { q: T(`The table shows the ${g.en}. There are ${N} observations altogether.<br>${tb(0)}<br>Find the frequency of the class ${cs(S0.cl[j])}.`, `Jadual menunjukkan ${g.ms}. Terdapat ${N} cerapan kesemuanya.<br>${tb(1)}<br>Cari kekerapan bagi kelas ${cs(S0.cl[j])}.`), a: T(`$${S0.fs[j]}$`), w: W(T('All the frequencies add up to the number of observations.', 'Semua kekerapan berjumlah bilangan cerapan.'), T(`Known frequencies: $${S0.fs.filter((_, i) => i !== j).join(' + ')} = ${N - S0.fs[j]}$`, `Kekerapan yang diketahui: $${S0.fs.filter((_, i) => i !== j).join(' + ')} = ${N - S0.fs[j]}$`), T(`$${N} - ${N - S0.fs[j]} = ${S0.fs[j]}$`)), sp: 's' };
    },
    /* spot the error in a table */
    (r) => {
      const g = r.pick(GI), w = r.pick(g.ws), K = 4, kind = r.int(0, 3), cl = cls(g.lo, w, K), fs = cl.map(() => r.int(3, 9));
      const j = r.int(1, kind === 2 ? K - 2 : K - 1), tot = kind === 3 ? sum(fs) + r.pick([-4, -3, -2, 2, 3, 4]) : sum(fs);
      const rows = cl.map((c) => cs(c));
      let txt, wtx;
      if (kind === 0) { rows[j] = `${cl[j][0] - 1}–${cl[j][1]}`; txt = [`the classes ${rows[j - 1]} and ${rows[j]} overlap (the value ${cl[j][0] - 1} belongs to both)`, `kelas ${rows[j - 1]} dan ${rows[j]} bertindih (nilai ${cl[j][0] - 1} tergolong dalam kedua-duanya)`]; wtx = [`${cl[j][0] - 1}$ is the upper limit of ${rows[j - 1]} and also the lower limit of ${rows[j]}, so such a value would be counted twice.`, `${cl[j][0] - 1}$ ialah had atas ${rows[j - 1]} dan juga had bawah ${rows[j]}, maka nilai itu akan dibilang dua kali.`]; }
      else if (kind === 1) { rows[j] = `${cl[j][0] + 1}–${cl[j][1]}`; txt = [`there is a gap between the classes ${rows[j - 1]} and ${rows[j]} (the value ${cl[j][0]} has no class)`, `terdapat sela antara kelas ${rows[j - 1]} dengan ${rows[j]} (nilai ${cl[j][0]} tiada kelas)`]; wtx = [`${cl[j][0]}$ is greater than the upper limit ${cl[j - 1][1]} of ${rows[j - 1]} but smaller than the lower limit ${cl[j][0] + 1} of ${rows[j]}, so it has no class.`, `${cl[j][0]}$ lebih besar daripada had atas ${cl[j - 1][1]} bagi ${rows[j - 1]} tetapi lebih kecil daripada had bawah ${cl[j][0] + 1} bagi ${rows[j]}, maka ia tiada kelas.`]; }
      else if (kind === 2) { rows[j] = `${cl[j][0]}–${cl[j][1] + w}`; txt = [`the class ${rows[j]} has a different width from the others and overlaps the next class`, `kelas ${rows[j]} mempunyai lebar yang berbeza daripada kelas lain dan bertindih dengan kelas seterusnya`]; wtx = [`${cl[j][1] + w} - ${cl[j][0]} + 1 = ${2 * w}$, not ${w}, and it runs past the start of ${rows[j + 1]}.`, `${cl[j][1] + w} - ${cl[j][0]} + 1 = ${2 * w}$, bukan ${w}, dan ia melepasi permulaan ${rows[j + 1]}.`]; }
      else { txt = [`the stated total is wrong: the frequencies add up to ${sum(fs)}, not ${tot}`, `jumlah yang dinyatakan salah: kekerapan berjumlah ${sum(fs)}, bukan ${tot}`]; wtx = [`${fs.join(' + ')} = ${sum(fs)}$, but the table states ${tot}.`, `${fs.join(' + ')} = ${sum(fs)}$, tetapi jadual menyatakan ${tot}.`]; }
      const tb = (i) => SPM.table(rows.map((x, q) => [x, fs[q]]).concat([[i ? 'Jumlah' : 'Total', tot]]), { head: [i ? g.hm : g.he, FQ.split('|')[i]] });
      return { q: T(`A student groups the ${g.en} in this table.<br>${tb(0)}<br>Find what is wrong with the table.`, `Seorang murid mengumpulkan ${g.ms} dalam jadual ini.<br>${tb(1)}<br>Cari kesalahan dalam jadual itu.`), a: T(`The problem: ${txt[0]}.`, `Masalahnya: ${txt[1]}.`), w: W(T('Check three things: equal class widths, no gaps and no overlaps between classes, and frequencies that add up to the stated total.', 'Semak tiga perkara: lebar kelas yang sama, tiada sela dan tiada pertindihan antara kelas, dan kekerapan yang berjumlah sama dengan jumlah yang dinyatakan.'), T('$' + wtx[0], '$' + wtx[1])), sp: 's' };
    },
  ];
  const ga121 = [
    /* plan a data collection */
    (r) => {
      const v = r.pick(INV), ps = r.sample([0, 1, 2, 3], 3).sort(), e = v.map((x) => x.split('|'));
      const ans = [e[1], e[2], e[3], e[4]];
      const L2 = (i) => SPM.parts([T(PARTS[ps[0]][0], PARTS[ps[0]][1]), T(PARTS[ps[1]][0], PARTS[ps[1]][1]), T(PARTS[ps[2]][0], PARTS[ps[2]][1])])[i ? 'ms' : 'en'];
      const HINT = [T('Population: the whole group the question is about — not just the students who are easy to ask.', 'Populasi: seluruh kumpulan yang berkaitan dengan soalan itu — bukan hanya murid yang senang ditanya.'),
        T('Variable: what is measured or counted, together with its unit; say whether it is counted (discrete) or measured (continuous).', 'Pemboleh ubah: apa yang diukur atau dibilang, beserta unitnya; nyatakan sama ada ia dibilang (diskret) atau diukur (selanjar).'),
        T('Method: how the data are obtained — questionnaire, interview, measuring, or existing records.', 'Kaedah: cara data diperoleh — soal selidik, temu bual, pengukuran, atau rekod sedia ada.'),
        T('Class intervals: equal width, no gaps, no overlaps, and wide enough to cover every value in about 5 to 8 classes.', 'Selang kelas: lebar sama, tiada sela, tiada pertindihan, dan cukup luas untuk merangkumi setiap nilai dalam kira-kira 5 hingga 8 kelas.')];
      return { q: T(`A group of students wants to find out ${e[0][0]}.<br>${L2(0)}`, `Sekumpulan murid mahu mengetahui ${e[0][1]}.<br>${L2(1)}`), a: SPM.parts(ps.map((p) => T(ans[p][0], ans[p][1]))), w: W(...ps.map((p, i) => SPM.cat(T(`(${'abc'[i]}) `), HINT[p])), T('Any reasonable, well-justified answer is accepted.', 'Sebarang jawapan yang munasabah dan berasas diterima.')), sp: 'l' };
    },
    /* critique a sample */
    (r) => {
      const b = r.pick(BIAS), ask = r.int(0, 1);
      return { q: T(`${b[0]}<br>${ask ? 'Explain why the conclusion may not be true for the whole group, and suggest one way to improve the survey.' : 'Give one reason why the data collected may not represent everybody, and say how the sampling could be improved.'}`, `${b[1]}<br>${ask ? 'Terangkan mengapa kesimpulan itu mungkin tidak benar bagi seluruh kumpulan, dan cadangkan satu cara untuk memperbaiki tinjauan itu.' : 'Berikan satu sebab mengapa data yang dikumpulkan mungkin tidak mewakili semua orang, dan nyatakan cara pensampelan boleh diperbaiki.'}`), a: T(`${b[2]} Improve: choose students at random from every class or group.`, `${b[3]} Pembaikan: pilih murid secara rawak daripada setiap kelas atau kumpulan.`), w: W(T('Ask two questions: who is in the sample, and who is left out of it?', 'Tanya dua soalan: siapa yang ada dalam sampel, dan siapa yang tertinggal daripadanya?'), T('A sample can represent a population only if it is chosen at random from the whole population and is large enough.', 'Sampel hanya boleh mewakili populasi jika ia dipilih secara rawak daripada seluruh populasi dan cukup besar.'), T('Here the group asked is not a random cross-section of the whole population, so the result is biased and cannot be extended to everybody.', 'Di sini kumpulan yang ditanya bukan keratan rentas rawak bagi seluruh populasi, maka keputusannya berat sebelah dan tidak boleh diluaskan kepada semua orang.')), sp: 'm' };
    },
    /* group raw data, then read the table */
    (r) => {
      const d = r.pick(BIG), w = r.pick([5, 10]), N = r.int(24, 32), g = groupSet(r, d, N, w), { cl, vals, fs } = g, mx = Math.max(...fs);
      need(fs.filter((f) => f === mx).length === 1);
      const ti = r.int(2, cl.length - 1), th = cl[ti][0], top = sum(vals.map((v) => (v >= th ? 1 : 0)));
      return { q: T(`${cap(dsc(d, N, 0))}:<br>${vals.join(', ')}.<br>(a) Construct a grouped frequency table with the classes ${cs(cl[0])}, ${cs(cl[1])}, …, ${cs(cl[cl.length - 1])}.<br>(b) State the class with the highest frequency.<br>(c) How many values are ${th} or more? What fraction of all the values is this?`, `${cap(dsc(d, N, 1))}:<br>${vals.join(', ')}.<br>(a) Bina jadual kekerapan terkumpul dengan kelas ${cs(cl[0])}, ${cs(cl[1])}, …, ${cs(cl[cl.length - 1])}.<br>(b) Nyatakan kelas yang mempunyai kekerapan tertinggi.<br>(c) Berapakah bilangan nilai yang ${th} atau lebih? Berapakah pecahan daripada semua nilai itu?`), a: SPM.parts([T(cl.map((c, j) => `${cs(c)}: ${fs[j]}`).join('; ')), T(cs(cl[fs.indexOf(mx)])), T(`$${top}$; $${Fr.tex(Fr.make(top, N))}$`)]), w: W(T('(a) Go through the list once, tallying each value into its class.', '(a) Baca senarai itu sekali, tally setiap nilai ke dalam kelasnya.'), T(`${cl.map((c, j) => `${cs(c)}: ${fs[j]}`).join('; ')} — check: $${fs.join(' + ')} = ${N}$`, `${cl.map((c, j) => `${cs(c)}: ${fs[j]}`).join('; ')} — semak: $${fs.join(' + ')} = ${N}$`), T(`(b) The largest frequency is $${mx}$, in ${cs(cl[fs.indexOf(mx)])}.`, `(b) Kekerapan terbesar ialah $${mx}$, dalam ${cs(cl[fs.indexOf(mx)])}.`), T(`(c) ${th} or more covers ${cs(cl[ti])} onwards: $${fs.slice(ti).join(' + ')} = ${top}$`, `(c) ${th} atau lebih merangkumi ${cs(cl[ti])} seterusnya: $${fs.slice(ti).join(' + ')} = ${top}$`), T(`Fraction $= \\dfrac{${top}}{${N}}${Fr.make(top, N).d === N ? '' : ` = ${Fr.tex(Fr.make(top, N))}`}$`, `Pecahan $= \\dfrac{${top}}{${N}}${Fr.make(top, N).d === N ? '' : ` = ${Fr.tex(Fr.make(top, N))}`}$`)), sp: 'xl' };
    },
    /* algebraic missing frequencies */
    (r) => {
      const g = r.pick(GI), S0 = giSet(r, g, 4), x = r.int(2, 6), k = r.pick([2, 3]), a = r.int(3, 9), b = r.int(3, 9), tot = a + x + k * x + b;
      const sh = [a, 'x', k + 'x', b];
      const tb = (i) => SPM.table(S0.cl.map((c, j) => [cs(c), j === 1 ? '$x$' : j === 2 ? `$${k}x$` : sh[j]]), { head: [g.he + '|' + g.hm, FQ].map((h) => h.split('|')[i]) });
      return { q: T(`The table shows the ${g.en}. The frequency of the second class is $x$ and the frequency of the third class is $${k}x$. There are ${tot} observations altogether.<br>${tb(0)}<br>(a) Form an equation in $x$ and solve it.<br>(b) State the frequency of the modal class.`, `Jadual menunjukkan ${g.ms}. Kekerapan kelas kedua ialah $x$ dan kekerapan kelas ketiga ialah $${k}x$. Terdapat ${tot} cerapan kesemuanya.<br>${tb(1)}<br>(a) Bentukkan persamaan dalam $x$ dan selesaikannya.<br>(b) Nyatakan kekerapan kelas mod.`), a: SPM.parts([T(`$${a} + x + ${k}x + ${b} = ${tot}$, so $x = ${x}$`, `$${a} + x + ${k}x + ${b} = ${tot}$, maka $x = ${x}$`), T(`$${Math.max(a, x, k * x, b)}$`)]), w: W(T(`(a) The frequencies add up to the total: $${a} + x + ${k}x + ${b} = ${tot}$`, `(a) Kekerapan berjumlah jumlah keseluruhan: $${a} + x + ${k}x + ${b} = ${tot}$`), T(`$${k + 1}x + ${a + b} = ${tot}$`), T(`$${k + 1}x = ${tot} - ${a + b} = ${tot - a - b}$`), T(`$x = ${x}$`), T(`(b) The frequencies are $${a},\\ ${x},\\ ${k * x},\\ ${b}$, so the modal class has frequency $${Math.max(a, x, k * x, b)}$.`, `(b) Kekerapan ialah $${a},\\ ${x},\\ ${k * x},\\ ${b}$, maka kelas mod mempunyai kekerapan $${Math.max(a, x, k * x, b)}$.`)), sp: 'm' };
    },
    /* mixed units in raw data */
    (r) => {
      const N = r.int(7, 9), vals = Array.from({ length: N }, () => r.int(140, 175)), j = r.int(0, N - 1), bad = vals[j];
      const shown = vals.map((v, i) => (i === j ? n(bad / 100) : v));
      return { q: T(`The heights of ${N} students were recorded (in cm) as: ${shown.join(', ')}.<br>(a) Which value is recorded in a different unit? Give the reason.<br>(b) Correct it, and state the class of width 5 that contains it (starting from 140: 140–144, 145–149, …).`, `Ketinggian ${N} orang murid direkodkan (dalam cm) sebagai: ${shown.join(', ')}.<br>(a) Nilai yang manakah direkodkan dalam unit yang berbeza? Berikan sebab.<br>(b) Betulkan nilai itu, dan nyatakan kelas berlebar 5 yang mengandunginya (bermula dari 140: 140–144, 145–149, …).`), a: SPM.parts([T(`${n(bad / 100)}: it is in metres, but the others are in cm`, `${n(bad / 100)}: ia dalam meter, tetapi yang lain dalam cm`), T(`${n(bad / 100)} m = ${bad} cm; class ${cs([140 + 5 * Math.floor((bad - 140) / 5), 144 + 5 * Math.floor((bad - 140) / 5)])}`, `${n(bad / 100)} m = ${bad} cm; kelas ${cs([140 + 5 * Math.floor((bad - 140) / 5), 144 + 5 * Math.floor((bad - 140) / 5)])}`)]), w: W(T(`(a) All the other readings are about 140–175, but ${n(bad / 100)} is far too small for a height in cm — it is a height in metres.`, `(a) Semua bacaan lain kira-kira 140–175, tetapi ${n(bad / 100)} terlalu kecil bagi ketinggian dalam cm — ia ketinggian dalam meter.`), T(`(b) $${n(bad / 100)} \\times 100 = ${bad}$ cm`, `(b) $${n(bad / 100)} \\times 100 = ${bad}$ cm`), T(`$${140 + 5 * Math.floor((bad - 140) / 5)} \\le ${bad} \\le ${144 + 5 * Math.floor((bad - 140) / 5)}$, so it lies in ${cs([140 + 5 * Math.floor((bad - 140) / 5), 144 + 5 * Math.floor((bad - 140) / 5)])}.`, `$${140 + 5 * Math.floor((bad - 140) / 5)} \\le ${bad} \\le ${144 + 5 * Math.floor((bad - 140) / 5)}$, maka ia terletak dalam ${cs([140 + 5 * Math.floor((bad - 140) / 5), 144 + 5 * Math.floor((bad - 140) / 5)])}.`)), sp: 'm' };
    },
    /* find the miscounted frequency */
    (r) => {
      const k = r.int(18, 24), { c, its, idx, fs } = catData(r, k, r.int(4, 5)), j = r.int(0, its.length - 1), err = r.pick([-2, -1, 1, 2]);
      need(fs[j] + err >= 1);
      const shown = fs.map((f, i) => (i === j ? f + err : f));
      const tb = (i) => tabL(i, its.map((x, q) => [x[i], shown[q]]), [CT, FQ]);
      return { q: T(`${k} students were asked about their ${c.en}. The answers were:<br>${idx.map((q) => its[q][0]).join(', ')}.<br>A student made this frequency table.<br>${tb(0)}<br>(a) Find the total of the frequencies. Why is it wrong?<br>(b) Find the frequency that was counted wrongly and correct it.`, `${k} orang murid ditanya tentang ${c.ms} mereka. Jawapannya ialah:<br>${idx.map((q) => its[q][1]).join(', ')}.<br>Seorang murid membuat jadual kekerapan ini.<br>${tb(1)}<br>(a) Cari jumlah kekerapan. Mengapakah jumlah itu salah?<br>(b) Cari kekerapan yang dikira dengan salah dan betulkannya.`), a: SPM.parts([T(`$${sum(shown)}$, but there are only ${k} students`, `$${sum(shown)}$, tetapi hanya ada ${k} orang murid`), T(`${its[j][0]}: ${shown[j]} should be ${fs[j]}`, `${its[j][1]}: ${shown[j]} sepatutnya ${fs[j]}`)]), w: W(T(`(a) Add the frequencies in the table: $${shown.join(' + ')} = ${sum(shown)}$`, `(a) Tambah kekerapan dalam jadual: $${shown.join(' + ')} = ${sum(shown)}$`), T(`Only ${k} students were asked, so the total must be $${k}$ — the table is out by $${Math.abs(sum(shown) - k)}$.`, `Hanya ${k} orang murid ditanya, maka jumlahnya mesti $${k}$ — jadual tersasar sebanyak $${Math.abs(sum(shown) - k)}$.`), T(`(b) Count each choice in the list again: ${its.map((x, q) => `${x[0]} ${fs[q]}`).join(', ')}.`, `(b) Bilang semula setiap pilihan dalam senarai itu: ${its.map((x, q) => `${x[1]} ${fs[q]}`).join(', ')}.`), T(`Only ${its[j][0]} differs: the table shows ${shown[j]} but the correct frequency is ${fs[j]}.`, `Hanya ${its[j][1]} berbeza: jadual menunjukkan ${shown[j]} tetapi kekerapan yang betul ialah ${fs[j]}.`)), sp: 'm' };
    },
    /* classify three sources */
    (r) => {
      const ss = r.sample(SRC, 3), np = ss.filter((s) => s[2]).length;
      need(np >= 1 && np <= 2);
      return { q: T(`State whether each of the following uses primary data or secondary data.<br>(a) ${ss[0][0]}<br>(b) ${ss[1][0]}<br>(c) ${ss[2][0]}<br>(d) Give one advantage of using primary data.`, `Nyatakan sama ada setiap yang berikut menggunakan data primer atau data sekunder.<br>(a) ${ss[0][1]}<br>(b) ${ss[1][1]}<br>(c) ${ss[2][1]}<br>(d) Berikan satu kelebihan menggunakan data primer.`), a: SPM.parts([...ss.map((s) => (s[2] ? T('Primary', 'Primer') : T('Secondary', 'Sekunder'))), T('You control what is collected and how, so it fits the question.', 'Anda mengawal perkara yang dikumpul dan caranya, maka ia sesuai dengan soalan.')]), w: W(T('Primary data are collected first-hand by the person who will use them; secondary data are taken from a source somebody else has already published.', 'Data primer dikumpulkan sendiri secara langsung oleh orang yang akan menggunakannya; data sekunder diambil daripada sumber yang telah diterbitkan oleh orang lain.'), ...ss.map((s, i) => T(`(${'abc'[i]}) ${s[2] ? 'measured, counted or asked in person → primary' : 'copied from a report, website or newspaper → secondary'}`, `(${'abc'[i]}) ${s[2] ? 'diukur, dibilang atau ditanya sendiri → primer' : 'disalin daripada laporan, laman web atau akhbar → sekunder'}`)), T('(d) Primary data are collected for your own question, so they are up to date and you know exactly how they were obtained.', '(d) Data primer dikumpulkan untuk soalan anda sendiri, maka ia terkini dan anda tahu dengan tepat cara ia diperoleh.')), sp: 'm' };
    },
    /* start value / class count reasoning */
    (r) => {
      const d = r.pick(BIG), w = r.pick([5, 10]), K = r.int(4, 6), s = Math.floor(d.lo / w) * w, e = s + K * w - 1, v = r.int(s + w, e - 1), b = Math.floor((v - s) / w);
      return { q: T(`A student groups the ${dsc(d, 'some', 0)} into the classes ${s}–${s + w}, ${s + w}–${s + 2 * w}, ${s + 2 * w}–${s + 3 * w}, …<br>(a) Explain why a value such as ${s + w} causes a problem.<br>(b) Rewrite the first three classes so that every whole number belongs to exactly one class, keeping the class width ${w}.<br>(c) In which class does ${v} belong?`, `Seorang murid mengumpulkan ${dsc(d, 'beberapa', 1)} ke dalam kelas ${s}–${s + w}, ${s + w}–${s + 2 * w}, ${s + 2 * w}–${s + 3 * w}, …<br>(a) Terangkan mengapa nilai seperti ${s + w} menimbulkan masalah.<br>(b) Tulis semula tiga kelas pertama supaya setiap nombor bulat tergolong dalam tepat satu kelas, dengan lebar kelas ${w} dikekalkan.<br>(c) Dalam kelas manakah ${v} berada?`), a: SPM.parts([T(`${s + w} belongs to two classes, so the classes overlap`, `${s + w} tergolong dalam dua kelas, maka kelas bertindih`), T(`${cs([s, s + w - 1])}, ${cs([s + w, s + 2 * w - 1])}, ${cs([s + 2 * w, s + 3 * w - 1])}`), T(cs([s + b * w, s + b * w + w - 1]))]), w: W(T(`(a) $${s + w}$ is the upper limit of ${s}–${s + w} and also the lower limit of ${s + w}–${s + 2 * w}, so it would be counted twice.`, `(a) $${s + w}$ ialah had atas ${s}–${s + w} dan juga had bawah ${s + w}–${s + 2 * w}, maka ia akan dibilang dua kali.`), T(`(b) End each class one less than the start of the next: ${cs([s, s + w - 1])}, ${cs([s + w, s + 2 * w - 1])}, ${cs([s + 2 * w, s + 3 * w - 1])} — each still holds ${w} whole numbers.`, `(b) Akhiri setiap kelas satu kurang daripada permulaan kelas berikutnya: ${cs([s, s + w - 1])}, ${cs([s + w, s + 2 * w - 1])}, ${cs([s + 2 * w, s + 3 * w - 1])} — setiap satu masih mengandungi ${w} nombor bulat.`), T(`(c) $${s + b * w} \\le ${v} \\le ${s + b * w + w - 1}$, so ${v} lies in ${cs([s + b * w, s + b * w + w - 1])}.`, `(c) $${s + b * w} \\le ${v} \\le ${s + b * w + w - 1}$, maka ${v} terletak dalam ${cs([s + b * w, s + b * w + w - 1])}.`)), sp: 'm' };
    },
  ];
  SPM.extend('F2-12.1', { e: ge121, m: gm121, a: ga121 });

  /* ====================================================== F2-12.2 Measures of central tendencies */
  const dl = (r, d, k) => Array.from({ length: k }, () => tri(r, d.lo, d.hi));
  const TF = [
    ['The mean of a set of numbers must be one of the numbers in the set.|Min bagi satu set nombor mestilah salah satu nombor dalam set itu.', 0, 'For example, the mean of 2 and 3 is 2.5.|Contohnya, min bagi 2 dan 3 ialah 2.5.'],
    ['A set of data can have more than one mode.|Satu set data boleh mempunyai lebih daripada satu mod.', 1, 'Two values can occur equally often, most often.|Dua nilai boleh berlaku dengan kekerapan sama yang paling tinggi.'],
    ['The mode is always the largest value in the data.|Mod sentiasa ialah nilai terbesar dalam data.', 0, 'The mode is the value that occurs most often.|Mod ialah nilai yang paling kerap berlaku.'],
    ['The data must be arranged in order before the median is found.|Data mesti disusun mengikut tertib sebelum median dicari.', 1, 'The median is the middle value of the ordered data.|Median ialah nilai tengah bagi data yang tersusun.'],
    ['If every value in the data is different, there is no mode.|Jika setiap nilai dalam data berbeza, tiada mod.', 1, 'No value occurs more often than another.|Tiada nilai yang berlaku lebih kerap daripada yang lain.'],
    ['For 10 values arranged in order, the median is the 5th value.|Bagi 10 nilai yang tersusun, median ialah nilai ke-5.', 0, 'It is the mean of the 5th and 6th values.|Ia ialah min bagi nilai ke-5 dan ke-6.'],
    ['The mean is the sum of the values divided by the number of values.|Min ialah hasil tambah nilai dibahagi dengan bilangan nilai.', 1, 'This is the definition of the mean.|Ini ialah takrif min.'],
    ['The median of 9 values arranged in order is the 5th value.|Median bagi 9 nilai yang tersusun ialah nilai ke-5.', 1, 'The middle position is (9 + 1) ÷ 2 = 5.|Kedudukan tengah ialah (9 + 1) ÷ 2 = 5.'],
  ].map((t) => { const a = t[0].split('|'), b = t[2].split('|'); return [a[0], a[1], t[1], b[0], b[1]]; });
  const DEF = [
    ['the value that occurs most often|nilai yang paling kerap berlaku', 'mode|mod'],
    ['the sum of all the values divided by the number of values|hasil tambah semua nilai dibahagi dengan bilangan nilai', 'mean|min'],
    ['the middle value when the data are arranged in order|nilai tengah apabila data disusun mengikut tertib', 'median|median'],
  ].map((d) => d.map((x) => x.split('|')));
  const ge122 = [
    /* mode of a list (unique / two modes / none) */
    (r) => {
      const d = r.pick(DATA), k = r.int(7, 10), kind = r.int(0, 2);
      const v = retry(() => { const a = dl(r, d, k); const m = modesOf(a); need(kind === 2 ? m.length === 2 : kind === 1 ? m.length === 1 : m.length === 1); return a; });
      const m = modesOf(v), mxc = Math.max(...Object.values(cnt(v)));
      return { q: T(`${cap(dsc(d, k, 0))}: ${v.join(', ')}.<br>${kind === 2 ? 'State the mode(s) of the data.' : 'Find the mode.'}`, `${cap(dsc(d, k, 1))}: ${v.join(', ')}.<br>${kind === 2 ? 'Nyatakan mod bagi data itu.' : 'Cari mod.'}`), a: T(`$${m.join(' \\text{ and } ')}$`, `$${m.join(' \\text{ dan } ')}$`), w: W(T('Count how many times each value occurs.', 'Bilang berapa kali setiap nilai berlaku.'), cntLine(v), m.length > 1 ? T(`Two values occur $${mxc}$ times each, so the data have two modes: $${m.join(' \\text{ and } ')}$`, `Dua nilai berlaku $${mxc}$ kali setiap satu, maka data itu mempunyai dua mod: $${m.join(' \\text{ dan } ')}$`) : T(`The highest count is $${mxc}$, so the mode is $${m[0]}$.`, `Bilangan tertinggi ialah $${mxc}$, maka mod ialah $${m[0]}$.`)), sp: 's' };
    },
    /* median of an odd number of values */
    (r) => {
      const d = r.pick(DATA), k = r.pick([5, 7, 9]), v = dl(r, d, k), o = sortNum(v);
      need(new Set(v).size === k);
      return { q: T(`${cap(dsc(d, k, 0))}: ${v.join(', ')}.<br>Arrange the values in order and find the median.`, `${cap(dsc(d, k, 1))}: ${v.join(', ')}.<br>Susun nilai mengikut tertib dan cari median.`), a: T(`$${n(median(v))}$`), w: W(T(`In ascending order: $${list(o)}$`, `Mengikut tertib menaik: $${list(o)}$`), T(`Middle position $= \\dfrac{${k} + 1}{2} = ${(k + 1) / 2}$`, `Kedudukan tengah $= \\dfrac{${k} + 1}{2} = ${(k + 1) / 2}$`), T(`The ${ord((k + 1) / 2)} value is $${n(median(v))}$.`, `Nilai ke-${(k + 1) / 2} ialah $${n(median(v))}$.`)), sp: 's' };
    },
    /* mean, clean answer */
    (r) => {
      const d = r.pick(DATA), k = r.pick([4, 5, 6]), v = dl(r, d, k);
      need(sum(v) % k === 0 && new Set(v).size > 2);
      return { q: T(`${cap(dsc(d, k, 0))}: ${v.join(', ')}.<br>Calculate the mean.`, `${cap(dsc(d, k, 1))}: ${v.join(', ')}.<br>Hitung min.`), a: T(`$\\dfrac{${sum(v)}}{${k}} = ${sum(v) / k}$`), w: W(T('Mean $= \\dfrac{\\text{sum of the values}}{\\text{number of values}}$', 'Min $= \\dfrac{\\text{hasil tambah nilai}}{\\text{bilangan nilai}}$'), T(`$${v.join(' + ')} = ${sum(v)}$`), T(`$\\dfrac{${sum(v)}}{${k}} = ${sum(v) / k}$`)), sp: 's' };
    },
    /* mode from a frequency table */
    (r) => {
      const U = ufSet(r), mx = Math.max(...U.fs);
      need(U.fs.filter((f) => f === mx).length === 1);
      return { q: T(`The table shows the ${dsc(U.u, U.N, 0)}.<br>${ufTab(0, U)}<br>State the mode.`, `Jadual menunjukkan ${dsc(U.u, U.N, 1)}.<br>${ufTab(1, U)}<br>Nyatakan mod.`), a: T(`$${U.xs[U.fs.indexOf(mx)]}$ (frequency ${mx})`, `$${U.xs[U.fs.indexOf(mx)]}$ (kekerapan ${mx})`), w: W(T(`The frequencies are $${U.fs.join(',\\ ')}$; the largest is $${mx}$.`, `Kekerapan ialah $${U.fs.join(',\\ ')}$; yang terbesar ialah $${mx}$.`), T(`It stands under the value ${U.xs[U.fs.indexOf(mx)]}, so the mode is $${U.xs[U.fs.indexOf(mx)]}$.`, `Ia berada di bawah nilai ${U.xs[U.fs.indexOf(mx)]}, maka mod ialah $${U.xs[U.fs.indexOf(mx)]}$.`), T('The mode is the value itself, not its frequency.', 'Mod ialah nilai itu sendiri, bukan kekerapannya.')), sp: 's' };
    },
    /* bar chart: mode and total */
    (r) => {
      const U = ufSet(r), mx = Math.max(...U.fs);
      need(U.fs.filter((f) => f === mx).length === 1);
      return { q: T(`The bar chart shows the ${dsc(U.u, U.N, 0)}.<br>(a) State the mode.<br>(b) How many are there altogether?`, `Carta palang menunjukkan ${dsc(U.u, U.N, 1)}.<br>(a) Nyatakan mod.<br>(b) Berapakah jumlah kesemuanya?`), fig: barFig(U), a: SPM.parts([T(`$${U.xs[U.fs.indexOf(mx)]}$`), T(`$${U.N}$`)]), w: W(T(`(a) The tallest bar has height $${mx}$, above ${U.xs[U.fs.indexOf(mx)]}, so the mode is $${U.xs[U.fs.indexOf(mx)]}$.`, `(a) Palang tertinggi mempunyai tinggi $${mx}$, di atas ${U.xs[U.fs.indexOf(mx)]}, maka mod ialah $${U.xs[U.fs.indexOf(mx)]}$.`), T(`(b) Add the heights of all the bars: $${U.fs.join(' + ')} = ${U.N}$`, `(b) Tambah tinggi semua palang: $${U.fs.join(' + ')} = ${U.N}$`)), sp: 's' };
    },
    /* sum from the mean */
    (r) => {
      const d = r.pick(DATA), k = r.int(5, 12), m = r.int(Math.max(d.lo + 1, 3), d.hi);
      return { q: T(`The mean of the ${dsc(d, k, 0)} is ${m}. Find the sum of all the ${k} values.`, `Min bagi ${dsc(d, k, 1)} ialah ${m}. Cari jumlah bagi kesemua ${k} nilai itu.`), a: T(`$${m} \\times ${k} = ${m * k}$`), w: W(T('Mean $= \\dfrac{\\text{sum}}{\\text{number of values}}$, so sum $=$ mean $\\times$ number of values.', 'Min $= \\dfrac{\\text{hasil tambah}}{\\text{bilangan nilai}}$, maka hasil tambah $=$ min $\\times$ bilangan nilai.'), T(`$${m} \\times ${k} = ${m * k}$`)), sp: 's' };
    },
    /* position of the median */
    (r) => {
      const k = r.pick([9, 11, 13, 15, 21, 25, 31]), d = r.pick(DATA);
      return { q: T(`The ${dsc(d, k, 0)} are arranged in order of size. Which value (position) is the median?`, `${cap(dsc(d, k, 1))} disusun mengikut tertib saiz. Nilai yang ke berapakah median itu?`), a: T(`The ${ord((k + 1) / 2)} value: $\\dfrac{${k} + 1}{2} = ${(k + 1) / 2}$`, `Nilai ke-${(k + 1) / 2}: $\\dfrac{${k} + 1}{2} = ${(k + 1) / 2}$`), w: W(T(`For an odd number of ordered values the median is in position $\\dfrac{n + 1}{2}$.`, `Bagi bilangan nilai tersusun yang ganjil, median berada pada kedudukan $\\dfrac{n + 1}{2}$.`), T(`$\\dfrac{${k} + 1}{2} = ${(k + 1) / 2}$`), T(`So the median is the ${ord((k + 1) / 2)} value; the data must be in order first.`, `Maka median ialah nilai ke-${(k + 1) / 2}; data mesti disusun dahulu.`)), sp: 's' };
    },
    /* true or false */
    (r) => {
      const t = r.pick(TF);
      return { q: T(`True or false? Give a reason.<br>"${t[0]}"`, `Benar atau palsu? Berikan sebab.<br>"${t[1]}"`), a: T(`${t[2] ? 'True' : 'False'}. ${t[3]}`, `${t[2] ? 'Benar' : 'Palsu'}. ${t[4]}`), w: W(T(t[2] ? 'Compare the statement with the definition of the measure.' : 'One counterexample is enough to show that a statement is false.', t[2] ? 'Bandingkan pernyataan itu dengan takrif ukuran berkenaan.' : 'Satu contoh penyangkal sudah cukup untuk menunjukkan sesuatu pernyataan itu palsu.'), T(t[3], t[4]), T(t[2] ? 'So the statement is true.' : 'So the statement is false.', t[2] ? 'Maka pernyataan itu benar.' : 'Maka pernyataan itu palsu.')), sp: 's' };
    },
    /* name the measure */
    (r) => {
      const t = r.pick(DEF), o = r.shuffle(['mean', 'median', 'mode']), ms = { mean: 'min', median: 'median', mode: 'mod' };
      return { q: T(`Which measure is ${t[0][0]}?<br>${o.map((x, i) => `${'ABC'[i]}. ${x}`).join('&emsp;')}`, `Ukuran manakah ialah ${t[0][1]}?<br>${o.map((x, i) => `${'ABC'[i]}. ${ms[x]}`).join('&emsp;')}`), a: T(`${'ABC'[o.indexOf(t[1][0])]}. ${t[1][0]}`, `${'ABC'[o.indexOf(t[1][0])]}. ${t[1][1]}`), w: W(T('Mean: add all the values and divide by how many there are. Median: the middle value when the data are in order. Mode: the value that occurs most often.', 'Min: tambah semua nilai dan bahagi dengan bilangannya. Median: nilai tengah apabila data disusun mengikut tertib. Mod: nilai yang paling kerap berlaku.'), T(`"${cap(t[0][0])}" is the definition of the ${t[1][0]}, option ${'ABC'[o.indexOf(t[1][0])]}.`, `"${cap(t[0][1])}" ialah takrif ${t[1][1]}, pilihan ${'ABC'[o.indexOf(t[1][0])]}.`)), sp: 'xs' };
    },
    /* pictograph */
    (r) => {
      const U = ufSet(r, r.int(4, 5)), key = r.pick([2, 5, 10]), vs = U.fs.map((f) => f * key / 1), mx = Math.max(...vs);
      need(vs.filter((v) => v === mx).length === 1);
      const wh = U.u.who.split('|');
      return { q: T(`The pictograph shows the ${dsc(U.u, 'some', 0)}.<br>${picTab(0, U.u.h, U.xs, vs, key, U.u.who)}<br>(a) State the mode.<br>(b) How many ${wh[0]} are represented altogether?`, `Piktograf menunjukkan ${dsc(U.u, 'beberapa', 1)}.<br>${picTab(1, U.u.h, U.xs, vs, key, U.u.who)}<br>(a) Nyatakan mod.<br>(b) Berapakah ${wh[1]} yang diwakili kesemuanya?`), a: SPM.parts([T(`$${U.xs[vs.indexOf(mx)]}$`), T(`$${sum(vs)}$`)]), w: W(T(`Each ● stands for ${key}, so the frequencies are $${vs.join(',\\ ')}$.`, `Setiap ● mewakili ${key}, maka kekerapannya ialah $${vs.join(',\\ ')}$.`), T(`(a) The largest frequency is $${mx}$, for the value ${U.xs[vs.indexOf(mx)]}.`, `(a) Kekerapan terbesar ialah $${mx}$, bagi nilai ${U.xs[vs.indexOf(mx)]}.`), T(`(b) $${vs.join(' + ')} = ${sum(vs)}$`)), sp: 's' };
    },
    /* dot plot: mode */
    (r) => {
      const U = ufSet(r, r.int(5, 6)), mx = Math.max(...U.fs);
      need(U.fs.filter((f) => f === mx).length === 1 && mx <= 6);
      const vals = expand(U.xs, U.fs);
      return { q: T(`The dot plot shows the ${dsc(U.u, vals.length, 0)}.<br>State the mode and the number of dots in the plot.`, `Plot titik menunjukkan ${dsc(U.u, vals.length, 1)}.<br>Nyatakan mod dan bilangan titik dalam plot itu.`), fig: dotFig(vals), a: T(`Mode $= ${U.xs[U.fs.indexOf(mx)]}$; ${vals.length} dots`, `Mod $= ${U.xs[U.fs.indexOf(mx)]}$; ${vals.length} titik`), w: W(T(`Count the dots in each column: $${U.fs.join(',\\ ')}$`, `Bilang titik dalam setiap lajur: $${U.fs.join(',\\ ')}$`), T(`The tallest column has $${mx}$ dots, above ${U.xs[U.fs.indexOf(mx)]}, so the mode is $${U.xs[U.fs.indexOf(mx)]}$.`, `Lajur tertinggi mempunyai $${mx}$ titik, di atas ${U.xs[U.fs.indexOf(mx)]}, maka mod ialah $${U.xs[U.fs.indexOf(mx)]}$.`), T(`Total dots $= ${U.fs.join(' + ')} = ${vals.length}$`, `Jumlah titik $= ${U.fs.join(' + ')} = ${vals.length}$`)), sp: 's' };
    },
  ];
  const gm122 = [
    /* median of an even number of values */
    (r) => {
      const d = r.pick(DATA), k = r.pick([6, 8, 10]), v = dl(r, d, k), o = sortNum(v), m = median(v);
      need(new Set(v).size >= k - 1 && o[k / 2 - 1] !== o[k / 2]);
      return { q: T(`${cap(dsc(d, k, 0))}: ${v.join(', ')}.<br>Find the median.`, `${cap(dsc(d, k, 1))}: ${v.join(', ')}.<br>Cari median.`), a: T(`$${n(m)}$`), w: W(T(`In ascending order: $${list(o)}$`, `Mengikut tertib menaik: $${list(o)}$`), T(`With ${k} values there is no single middle one, so take the mean of the ${ord(k / 2)} and ${ord(k / 2 + 1)} values.`, `Dengan ${k} nilai, tiada satu nilai tengah tunggal, maka ambil min bagi nilai ke-${k / 2} dan ke-${k / 2 + 1}.`), T(`$\\dfrac{${o[k / 2 - 1]} + ${o[k / 2]}}{2} = ${n(m)}$`)), sp: 's' };
    },
    /* mean from a frequency table */
    (r) => {
      const U = ufSet(r), dp = U.sx % U.N === 0 ? 0 : 2;
      return { q: T(`The table shows the ${dsc(U.u, U.N, 0)}.<br>${ufTab(0, U)}<br>Calculate the mean${dp ? ', correct to 2 decimal places' : ''}.`, `Jadual menunjukkan ${dsc(U.u, U.N, 1)}.<br>${ufTab(1, U)}<br>Hitung min${dp ? ', betul kepada 2 tempat perpuluhan' : ''}.`), a: T(`$\\dfrac{${U.sx}}{${U.N}} = ${fm(U.sx / U.N)}$`), w: W(fxLine(U.xs, U.fs, U.sx), T(`$\\sum f = ${U.fs.join(' + ')} = ${U.N}$`), T(`Mean $= \\dfrac{\\sum fx}{\\sum f} = \\dfrac{${U.sx}}{${U.N}} = ${fm(U.sx / U.N)}$`, `Min $= \\dfrac{\\sum fx}{\\sum f} = \\dfrac{${U.sx}}{${U.N}} = ${fm(U.sx / U.N)}$`), T('Multiply each value by its frequency — do not just average the values in the top row.', 'Darabkan setiap nilai dengan kekerapannya — jangan hanya ambil purata nilai dalam baris atas.')), sp: 'm' };
    },
    /* median from a frequency table */
    (r) => {
      const U = ufSet(r), all = expand(U.xs, U.fs), md = median(all);
      return { q: T(`The table shows the ${dsc(U.u, U.N, 0)}.<br>${ufTab(0, U)}<br>Find the median.`, `Jadual menunjukkan ${dsc(U.u, U.N, 1)}.<br>${ufTab(1, U)}<br>Cari median.`), a: T(`$${n(md)}$`), w: W(T(`Total frequency $= ${U.fs.join(' + ')} = ${U.N}$`, `Jumlah kekerapan $= ${U.fs.join(' + ')} = ${U.N}$`), T(`The table already lists the values in order; the running totals are $${U.fs.map((f, i) => sum(U.fs.slice(0, i + 1))).join(',\\ ')}$.`, `Jadual sudah menyenaraikan nilai mengikut tertib; jumlah terkumpulnya ialah $${U.fs.map((f, i) => sum(U.fs.slice(0, i + 1))).join(',\\ ')}$.`), medLine(U.N, md)), sp: 'm' };
    },
    /* bar chart: mean / median / mode */
    (r) => {
      const U = retry(() => { const u = ufSet(r); const m0 = Math.max(...u.fs); need(u.fs.filter((f) => f === m0).length === 1 && u.sx % u.N === 0); return u; });
      const mx = Math.max(...U.fs), mo = U.xs[U.fs.indexOf(mx)], md = median(expand(U.xs, U.fs)), mn = U.sx / U.N;
      return { q: T(`The bar chart shows the ${dsc(U.u, U.N, 0)}.<br>Find the mode, the median and the mean.`, `Carta palang menunjukkan ${dsc(U.u, U.N, 1)}.<br>Cari mod, median dan min.`), fig: barFig(U), a: SPM.lines(T(`Mode $= ${mo}$`, `Mod $= ${mo}$`), T(`Median $= ${n(md)}$`), T(`Mean $= ${mn}$`, `Min $= ${mn}$`)), w: W(T(`Read the frequencies from the bars: $${U.fs.join(',\\ ')}$`, `Baca kekerapan daripada palang: $${U.fs.join(',\\ ')}$`), T(`Mode: the tallest bar is above ${mo}, so the mode is $${mo}$.`, `Mod: palang tertinggi berada di atas ${mo}, maka mod ialah $${mo}$.`), T(`Total $= ${U.fs.join(' + ')} = ${U.N}$`, `Jumlah $= ${U.fs.join(' + ')} = ${U.N}$`), medLine(U.N, md), fxLine(U.xs, U.fs, U.sx), T(`Mean $= \\dfrac{${U.sx}}{${U.N}} = ${mn}$`, `Min $= \\dfrac{${U.sx}}{${U.N}} = ${mn}$`)), sp: 'l' };
    },
    /* pictograph: mean */
    (r) => {
      const U = ufSet(r, 4), key = r.pick([2, 3, 5]), vs = U.fs.map((f) => f * key), tot = sum(vs), sx = sum(U.xs.map((x, i) => x * vs[i]));
      return { q: T(`The pictograph shows the ${dsc(U.u, 'some', 0)}.<br>${picTab(0, U.u.h, U.xs, vs, key, U.u.who)}<br>Find the mean${sx % tot ? ', correct to 2 decimal places' : ''}.`, `Piktograf menunjukkan ${dsc(U.u, 'beberapa', 1)}.<br>${picTab(1, U.u.h, U.xs, vs, key, U.u.who)}<br>Cari min${sx % tot ? ', betul kepada 2 tempat perpuluhan' : ''}.`), a: T(`$\\dfrac{${sx}}{${tot}} = ${fm(sx / tot)}$`), w: W(T(`Each ● stands for ${key}, so the frequencies are $${vs.join(',\\ ')}$.`, `Setiap ● mewakili ${key}, maka kekerapannya ialah $${vs.join(',\\ ')}$.`), fxLine(U.xs, vs, sx), T(`$\\sum f = ${vs.join(' + ')} = ${tot}$`), T(`Mean $= \\dfrac{${sx}}{${tot}} = ${fm(sx / tot)}$`, `Min $= \\dfrac{${sx}}{${tot}} = ${fm(sx / tot)}$`)), sp: 'm' };
    },
    /* stem and leaf */
    (r) => {
      const d = r.pick(DATA.filter((x) => x.lo >= 10 && x.hi <= 99)), k = r.pick([11, 12, 13, 15]), v = dl(r, d, k), ask = r.int(0, 2), m = modesOf(v);
      need(new Set(v.map((x) => Math.floor(x / 10))).size >= 3);
      need(ask !== 0 || m.length === 1);
      need(ask !== 1 || sum(v) % k === 0);
      const A = [[`Find the mode.`, `Cari mod.`, `$${m[0]}$`], [`Find the mean.`, `Cari min.`, `$${sum(v) / k}$`], [`Find the median.`, `Cari median.`, `$${n(median(v))}$`]][ask];
      const o = sortNum(v);
      const wl = [T(`Read the values off the plot (stem = tens, leaf = units): $${list(o)}$`, `Baca nilai daripada plot itu (batang = puluh, daun = sa): $${list(o)}$`)];
      if (ask === 0) wl.push(T(`The value that occurs most often is $${m[0]}$.`, `Nilai yang paling kerap berlaku ialah $${m[0]}$.`));
      if (ask === 1) wl.push(T(`$${o.join(' + ')} = ${sum(v)}$`), T(`Mean $= \\dfrac{${sum(v)}}{${k}} = ${sum(v) / k}$`, `Min $= \\dfrac{${sum(v)}}{${k}} = ${sum(v) / k}$`));
      if (ask === 2) wl.push(T('The leaves are already in order in the plot.', 'Daun dalam plot itu sudah tersusun mengikut tertib.'), medLine(k, median(v)));
      return { q: T(`The stem-and-leaf plot shows the ${dsc(d, k, 0)}.<br>${stemTab(0, v)}<br>${A[0]}`, `Plot batang-dan-daun menunjukkan ${dsc(d, k, 1)}.<br>${stemTab(1, v)}<br>${A[1]}`), a: T(A[2]), w: W(...wl), sp: 's' };
    },
    /* dot plot: mean and median */
    (r) => {
      const U = ufSet(r, r.int(5, 6)), mx = Math.max(...U.fs);
      need(mx <= 6 && U.N % 2 === 1 && U.sx % U.N === 0);
      const vals = expand(U.xs, U.fs);
      return { q: T(`The dot plot shows the ${dsc(U.u, vals.length, 0)}.<br>Find the median and the mean.`, `Plot titik menunjukkan ${dsc(U.u, vals.length, 1)}.<br>Cari median dan min.`), fig: dotFig(vals), a: T(`Median $= ${n(median(vals))}$; mean $= ${U.sx / U.N}$`, `Median $= ${n(median(vals))}$; min $= ${U.sx / U.N}$`), w: W(T(`Read the values off the dots, in order: $${list(sortNum(vals))}$`, `Baca nilai daripada titik, mengikut tertib: $${list(sortNum(vals))}$`), medLine(U.N, median(vals)), fxLine(U.xs, U.fs, U.sx), T(`Mean $= \\dfrac{${U.sx}}{${U.N}} = ${U.sx / U.N}$`, `Min $= \\dfrac{${U.sx}}{${U.N}} = ${U.sx / U.N}$`)), sp: 'm' };
    },
    /* mean to given accuracy */
    (r) => {
      const d = r.pick(BIG), k = r.int(6, 9), v = dl(r, d, k), dp = r.pick([1, 2]);
      need(sum(v) % k !== 0 && round(sum(v) / k, dp) !== sum(v) / k);
      const p10 = Math.pow(10, dp + 2), trunc = SPM.fx(Math.floor((sum(v) / k) * p10) / p10, dp + 2);
      return { q: T(`${cap(dsc(d, k, 0))}: ${v.join(', ')}.<br>Calculate the mean, correct to ${dp} decimal place${dp > 1 ? 's' : ''}.`, `${cap(dsc(d, k, 1))}: ${v.join(', ')}.<br>Hitung min, betul kepada ${dp} tempat perpuluhan.`), a: T(`$\\dfrac{${sum(v)}}{${k}} = ${SPM.fx(sum(v) / k, dp)}$`), w: W(T(`$${v.join(' + ')} = ${sum(v)}$`), T(`$\\dfrac{${sum(v)}}{${k}} = ${trunc}\\ldots$`), T(`Rounded to ${dp} decimal place${dp > 1 ? 's' : ''}: $${SPM.fx(sum(v) / k, dp)}$`, `Dibundarkan kepada ${dp} tempat perpuluhan: $${SPM.fx(sum(v) / k, dp)}$`)), sp: 's' };
    },
    /* all three measures */
    (r) => {
      const d = r.pick(DATA), k = r.pick([7, 9]), v = dl(r, d, k), m = modesOf(v);
      need(m.length === 1 && sum(v) % k === 0);
      return { q: T(`${cap(dsc(d, k, 0))}: ${v.join(', ')}.<br>Find (a) the mode, (b) the median, (c) the mean.`, `${cap(dsc(d, k, 1))}: ${v.join(', ')}.<br>Cari (a) mod, (b) median, (c) min.`), a: SPM.parts([T(`$${m[0]}$`), T(`$${n(median(v))}$`), T(`$${sum(v) / k}$`)]), w: W(T(`In ascending order: $${list(sortNum(v))}$`, `Mengikut tertib menaik: $${list(sortNum(v))}$`), T(`(a) The value that occurs most often is $${m[0]}$.`, `(a) Nilai yang paling kerap berlaku ialah $${m[0]}$.`), SPM.cat(T('(b) '), medLine(k, median(v))), T(`(c) $${sortNum(v).join(' + ')} = ${sum(v)}$, so the mean is $\\dfrac{${sum(v)}}{${k}} = ${sum(v) / k}$.`, `(c) $${sortNum(v).join(' + ')} = ${sum(v)}$, maka minnya ialah $\\dfrac{${sum(v)}}{${k}} = ${sum(v) / k}$.`)), sp: 'm' };
    },
    /* MCQ median of unordered data */
    (r) => {
      const v = Array.from({ length: 5 }, () => r.int(2, 30)), o = sortNum(v), md = o[2];
      need(new Set(v).size === 5 && v[2] !== md);
      const opts = r.shuffle([md, v[2], Math.round(sum(v) / 5), o[1]]);
      need(new Set(opts).size === 4);
      return { q: T(`What is the median of $${list(v)}$?<br>${opts.map((x, i) => `${'ABCD'[i]}. ${x}`).join('&emsp;')}`, `Apakah median bagi $${list(v)}$?<br>${opts.map((x, i) => `${'ABCD'[i]}. ${x}`).join('&emsp;')}`), a: T(`${'ABCD'[opts.indexOf(md)]}. ${md}`), w: W(T(`Order first: $${list(o)}$`, `Susun dahulu: $${list(o)}$`), T(`With 5 values the median is the 3rd one: $${md}$`, `Dengan 5 nilai, median ialah yang ke-3: $${md}$`), T(`Do not take the middle number of the unsorted list ($${v[2]}$).`, `Jangan ambil nombor tengah senarai yang belum disusun ($${v[2]}$).`)), sp: 'xs' };
    },
    /* missing value from the mean */
    (r) => {
      const d = r.pick(DATA), k = r.int(5, 8), m = r.int(Math.max(d.lo + 1, 4), d.hi - 1), v = Array.from({ length: k - 1 }, () => r.int(Math.max(1, m - 5), m + 5)), x = m * k - sum(v);
      need(x >= Math.max(1, d.lo));
      return { q: T(`The mean of ${k} numbers is ${m}. ${k - 1} of the numbers are $${list(v)}$. Find the other number.`, `Min bagi ${k} nombor ialah ${m}. ${k - 1} daripada nombor itu ialah $${list(v)}$. Cari nombor yang satu lagi.`), a: T(`$${m} \\times ${k} - ${sum(v)} = ${x}$`), w: W(T(`Sum of all ${k} numbers $= ${m} \\times ${k} = ${m * k}$`, `Hasil tambah kesemua ${k} nombor $= ${m} \\times ${k} = ${m * k}$`), T(`Sum of the ${k - 1} known numbers $= ${v.join(' + ')} = ${sum(v)}$`, `Hasil tambah ${k - 1} nombor yang diketahui $= ${v.join(' + ')} = ${sum(v)}$`), T(`$${m * k} - ${sum(v)} = ${x}$`)), sp: 's' };
    },
  ];
  const GRP = [['boys', 'murid lelaki', 'girls', 'murid perempuan', 'mass', 'jisim', ' kg', ' kg', 40, 65], ['students in Class A', 'murid Kelas A', 'students in Class B', 'murid Kelas B', 'mark', 'markah', '', '', 55, 85], ['men', 'lelaki', 'women', 'wanita', 'age', 'umur', ' years', ' tahun', 25, 60], ['Form 1 students', 'murid Tingkatan 1', 'Form 2 students', 'murid Tingkatan 2', 'time to run 100 m', 'masa berlari 100 m', ' s', ' s', 14, 22]];
  const ga122 = [
    /* combined mean of two groups (mean of the whole, or of one group) */
    (r) => {
      const g = r.pick(GRP), a = r.int(10, 20), b = r.int(10, 30), m1 = r.int(g[8], g[9]), m2 = r.int(g[8], g[9]), unk = r.int(0, 1), tot = a + b;
      need(a !== b && m1 !== m2 && (a * m1 + b * m2) % tot === 0);
      const m = (a * m1 + b * m2) / tot;
      const en = unk ? `There are ${a} ${g[0]} and ${b} ${g[2]}. The mean ${g[4]} of the ${a} ${g[0]} is ${m1}${g[6]} and the mean ${g[4]} of all ${tot} together is ${m}${g[6]}. Find the mean ${g[4]} of the ${b} ${g[2]}.` : `The mean ${g[4]} of ${a} ${g[0]} is ${m1}${g[6]} and the mean ${g[4]} of ${b} ${g[2]} is ${m2}${g[6]}. Find the mean ${g[4]} of all ${tot} together.`;
      const ms = unk ? `Terdapat ${a} ${g[1]} dan ${b} ${g[3]}. Min ${g[5]} bagi ${a} ${g[1]} ialah ${m1}${g[7]} dan min ${g[5]} bagi kesemua ${tot} orang bersama-sama ialah ${m}${g[7]}. Cari min ${g[5]} bagi ${b} ${g[3]}.` : `Min ${g[5]} bagi ${a} ${g[1]} ialah ${m1}${g[7]} dan min ${g[5]} bagi ${b} ${g[3]} ialah ${m2}${g[7]}. Cari min ${g[5]} bagi kesemua ${tot} orang bersama-sama.`;
      const wl = unk
        ? [T(`Total of all ${tot} $= ${m} \\times ${tot} = ${m * tot}$`, `Jumlah kesemua ${tot} $= ${m} \\times ${tot} = ${m * tot}$`), T(`Total of the ${a} ${g[0]} $= ${a} \\times ${m1} = ${a * m1}$`, `Jumlah bagi ${a} ${g[1]} $= ${a} \\times ${m1} = ${a * m1}$`), T(`Total of the ${b} ${g[2]} $= ${m * tot} - ${a * m1} = ${b * m2}$`, `Jumlah bagi ${b} ${g[3]} $= ${m * tot} - ${a * m1} = ${b * m2}$`), T(`Mean $= \\dfrac{${b * m2}}{${b}} = ${m2}$`, `Min $= \\dfrac{${b * m2}}{${b}} = ${m2}$`)]
        : [T(`Total of the ${a} ${g[0]} $= ${a} \\times ${m1} = ${a * m1}$`, `Jumlah bagi ${a} ${g[1]} $= ${a} \\times ${m1} = ${a * m1}$`), T(`Total of the ${b} ${g[2]} $= ${b} \\times ${m2} = ${b * m2}$`, `Jumlah bagi ${b} ${g[3]} $= ${b} \\times ${m2} = ${b * m2}$`), T(`Combined mean $= \\dfrac{${a * m1} + ${b * m2}}{${tot}} = \\dfrac{${a * m1 + b * m2}}{${tot}} = ${m}$`, `Min gabungan $= \\dfrac{${a * m1} + ${b * m2}}{${tot}} = \\dfrac{${a * m1 + b * m2}}{${tot}} = ${m}$`), T('Do not just average the two means: the groups are of different sizes.', 'Jangan hanya mengambil purata dua min itu: saiz kedua-dua kumpulan berbeza.')];
      return { q: T(en, ms), a: unk ? T(`$\\dfrac{${m} \\times ${tot} - ${a} \\times ${m1}}{${b}} = ${m2}$`) : T(`$\\dfrac{${a} \\times ${m1} + ${b} \\times ${m2}}{${tot}} = ${m}$`), w: W(...wl), sp: 'm' };
    },
    /* two frequency tables combined */
    (r) => {
      const U = ufSet(r, 4), f2 = U.xs.map(() => r.int(1, 9)), N2 = sum(f2), sx2 = sum(U.xs.map((x, i) => x * f2[i])), N = U.N + N2, sx = U.sx + sx2;
      const cl = r.pick([['Class A', 'Class B', 'Kelas A', 'Kelas B'], ['Group 1', 'Group 2', 'Kumpulan 1', 'Kumpulan 2'], ['Boys', 'Girls', 'Lelaki', 'Perempuan']]);
      const tb = (i) => SPM.table([[cl[i * 2]].concat(U.fs), [cl[i * 2 + 1]].concat(f2)], { head: [U.u.h.split('|')[i]].concat(U.xs) });
      return { q: T(`The table shows the ${dsc(U.u, 'some', 0)} for two groups. The numbers in the rows are frequencies.<br>${tb(0)}<br>Find the mean of the two groups combined, correct to 2 decimal places.`, `Jadual menunjukkan ${dsc(U.u, 'beberapa', 1)} bagi dua kumpulan. Nombor dalam baris ialah kekerapan.<br>${tb(1)}<br>Cari min bagi kedua-dua kumpulan digabungkan, betul kepada 2 tempat perpuluhan.`), a: T(`$\\dfrac{${U.sx} + ${sx2}}{${U.N} + ${N2}} = ${fm(sx / N)}$`), w: W(SPM.cat(T('Row 1: ', 'Baris 1: '), fxLine(U.xs, U.fs, U.sx)), T(`$\\sum f = ${U.fs.join(' + ')} = ${U.N}$`), SPM.cat(T('Row 2: ', 'Baris 2: '), fxLine(U.xs, f2, sx2)), T(`$\\sum f = ${f2.join(' + ')} = ${N2}$`), T(`Combined mean $= \\dfrac{${U.sx} + ${sx2}}{${U.N} + ${N2}} = \\dfrac{${sx}}{${N}} = ${fm(sx / N)}$`, `Min gabungan $= \\dfrac{${U.sx} + ${sx2}}{${U.N} + ${N2}} = \\dfrac{${sx}}{${N}} = ${fm(sx / N)}$`)), sp: 'm' };
    },
    /* unknown x in the data: mean then median */
    (r) => {
      const k = r.pick([2, 3]), x = r.int(3, 9), a = r.int(1, 12), b = r.int(1, 12), c = r.int(1, 12), v = [a, x, b, k * x, c], m = sum(v) / 5;
      need(Number.isInteger(m) && new Set(v).size === 5);
      return { q: T(`The five numbers $${a},\\ x,\\ ${b},\\ ${k}x,\\ ${c}$ have a mean of ${m}.<br>(a) Find the value of $x$.<br>(b) Hence find the median of the five numbers.`, `Lima nombor $${a},\\ x,\\ ${b},\\ ${k}x,\\ ${c}$ mempunyai min ${m}.<br>(a) Cari nilai $x$.<br>(b) Seterusnya cari median bagi lima nombor itu.`), a: SPM.parts([T(`$${a + b + c} + ${k + 1}x = ${5 * m}$, so $x = ${x}$`, `$${a + b + c} + ${k + 1}x = ${5 * m}$, maka $x = ${x}$`), T(`$${list(sortNum(v))}$; median $= ${n(median(v))}$`, `$${list(sortNum(v))}$; median $= ${n(median(v))}$`)]), w: W(T(`(a) Sum of the five numbers $= ${m} \\times 5 = ${5 * m}$`, `(a) Hasil tambah lima nombor itu $= ${m} \\times 5 = ${5 * m}$`), T(`$${a} + x + ${b} + ${k}x + ${c} = ${5 * m}$`), T(`$${k + 1}x + ${a + b + c} = ${5 * m}$`), T(`$${k + 1}x = ${5 * m - a - b - c}$, so $x = ${x}$`, `$${k + 1}x = ${5 * m - a - b - c}$, maka $x = ${x}$`), T(`(b) The numbers are $${list(v)}$; in order: $${list(sortNum(v))}$`, `(b) Nombor itu ialah $${list(v)}$; mengikut tertib: $${list(sortNum(v))}$`), T(`The 3rd value is the median: $${n(median(v))}$`, `Nilai ke-3 ialah median: $${n(median(v))}$`)), sp: 'm' };
    },
    /* missing frequency from the mean */
    (r) => {
      const U = ufSet(r, 5), j = r.int(1, 3), kk = r.int(2, 9), xj = U.xs[j], S0 = U.sx - xj * U.fs[j], N0 = U.N - U.fs[j], f = U.fs.slice();
      const N = N0 + kk, sx = S0 + xj * kk;
      need(sx % N === 0 && N > 10 && xj * N !== sx);
      const m = sx / N, sh = U.fs.map((v, i) => (i === j ? 'k' : v)).map((v, i) => (i === j ? '$k$' : v));
      const tb = (i) => SPM.table([[FQ.split('|')[i]].concat(sh)], { head: [U.u.h.split('|')[i]].concat(U.xs) });
      return { q: T(`The table shows the ${dsc(U.u, 'some', 0)}. The mean is ${m}.<br>${tb(0)}<br>Form an equation and find the value of $k$.`, `Jadual menunjukkan ${dsc(U.u, 'beberapa', 1)}. Min ialah ${m}.<br>${tb(1)}<br>Bentukkan satu persamaan dan cari nilai $k$.`), a: T(`$\\dfrac{${S0} + ${xj}k}{${N0} + k} = ${m}$, so $k = ${kk}$`, `$\\dfrac{${S0} + ${xj}k}{${N0} + k} = ${m}$, maka $k = ${kk}$`), w: W(T(`$\\sum fx = ${U.xs.map((x, i) => (i === j ? `${x}k` : `${x} \\times ${U.fs[i]}`)).join(' + ')} = ${S0} + ${xj}k$`), T(`$\\sum f = ${U.fs.map((v, i) => (i === j ? 'k' : v)).join(' + ')} = ${N0} + k$`), T(`$\\dfrac{${S0} + ${xj}k}{${N0} + k} = ${m}$`), T(`$${S0} + ${xj}k = ${m} \\times ${N0} + ${m}k = ${m * N0} + ${m}k$`), T(`$${co(xj - m)}k = ${m * N0 - S0}$`), T(`$k = ${kk}$`)), sp: 'm' };
    },
    /* construct a data set */
    (r) => {
      const md = r.int(4, 9), mo = r.int(2, md - 1), v = sortNum([mo, mo, md, r.int(md + 1, 15), r.int(md + 1, 15)]);
      need(sum(v) % 5 === 0 && modesOf(v).length === 1 && v[2] === md && v[3] !== v[4]);
      return { q: T(`Write down a set of five whole numbers with a mode of ${mo}, a median of ${md} and a mean of ${sum(v) / 5}.`, `Tulis satu set lima nombor bulat dengan mod ${mo}, median ${md} dan min ${sum(v) / 5}.`), a: T(`One possible set: $${list(v)}$`, `Satu set yang mungkin: $${list(v)}$`), w: W(T(`Write five numbers in order with ${md} in the middle (the median), and make ${mo} appear twice so it is the mode.`, `Tulis lima nombor mengikut tertib dengan ${md} di tengah (median), dan jadikan ${mo} muncul dua kali supaya ia menjadi mod.`), T(`$${list(v)}$`), T(`Check: median $= ${v[2]}$, mode $= ${mo}$, and $${v.join(' + ')} = ${sum(v)}$, so the mean is $\\dfrac{${sum(v)}}{5} = ${sum(v) / 5}$.`, `Semak: median $= ${v[2]}$, mod $= ${mo}$, dan $${v.join(' + ')} = ${sum(v)}$, maka min ialah $\\dfrac{${sum(v)}}{5} = ${sum(v) / 5}$.`), T('Other sets are possible.', 'Set lain juga mungkin.')), sp: 'm' };
    },
    /* mixture of two prices */
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 6), p = r.int(6, 15), q = r.int(6, 15), f = r.pick([['nuts', 'kacang'], ['rice', 'beras'], ['coffee beans', 'biji kopi'], ['dried anchovies', 'ikan bilis kering']]);
      need(p !== q && (a * p + b * q) % (a + b) === 0);
      return { q: T(`A shopkeeper mixes ${a} kg of ${f[0]} costing RM${p} per kg with ${b} kg of ${f[0]} costing RM${q} per kg. Find the mean cost per kg of the mixture.`, `Seorang penjual mencampurkan ${a} kg ${f[1]} berharga RM${p} sekilogram dengan ${b} kg ${f[1]} berharga RM${q} sekilogram. Cari kos min sekilogram bagi campuran itu.`), a: T(`$\\dfrac{${a} \\times ${p} + ${b} \\times ${q}}{${a + b}} = \\text{RM}${(a * p + b * q) / (a + b)}$`), w: W(T(`Cost of the first lot $= ${a} \\times ${p} = ${a * p}$`, `Kos lot pertama $= ${a} \\times ${p} = ${a * p}$`), T(`Cost of the second lot $= ${b} \\times ${q} = ${b * q}$`, `Kos lot kedua $= ${b} \\times ${q} = ${b * q}$`), T(`Total cost $= ${a * p + b * q}$ for $${a} + ${b} = ${a + b}$ kg`, `Jumlah kos $= ${a * p + b * q}$ bagi $${a} + ${b} = ${a + b}$ kg`), T(`Mean cost $= \\dfrac{${a * p + b * q}}{${a + b}} = \\text{RM}${(a * p + b * q) / (a + b)}$ per kg`, `Kos min $= \\dfrac{${a * p + b * q}}{${a + b}} = \\text{RM}${(a * p + b * q) / (a + b)}$ sekilogram`)), sp: 'm' };
    },
    /* mark needed for a target mean */
    (r) => {
      const k = r.int(3, 6), m = r.int(60, 80), d = r.int(2, 5), x = (m + d) * (k + 1) - m * k, nm = r.name();
      need(x <= 100);
      return { q: T(`${nm}'s mean mark in ${k} tests is ${m}. What mark must ${nm} obtain in the next test so that the mean of all ${k + 1} tests becomes ${m + d}?`, `Markah min ${nm} dalam ${k} ujian ialah ${m}. Apakah markah yang mesti diperoleh ${nm} dalam ujian seterusnya supaya min bagi kesemua ${k + 1} ujian menjadi ${m + d}?`), a: T(`$${m + d} \\times ${k + 1} - ${m} \\times ${k} = ${x}$`), w: W(T(`Total of the first ${k} tests $= ${m} \\times ${k} = ${m * k}$`, `Jumlah markah ${k} ujian pertama $= ${m} \\times ${k} = ${m * k}$`), T(`Total needed for ${k + 1} tests $= ${m + d} \\times ${k + 1} = ${(m + d) * (k + 1)}$`, `Jumlah yang diperlukan bagi ${k + 1} ujian $= ${m + d} \\times ${k + 1} = ${(m + d) * (k + 1)}$`), T(`Next mark $= ${(m + d) * (k + 1)} - ${m * k} = ${x}$`, `Markah seterusnya $= ${(m + d) * (k + 1)} - ${m * k} = ${x}$`)), sp: 'm' };
    },
    /* median of an even list with an unknown */
    (r) => {
      const v = sortNum(r.distinct(6, 2, 40)), x = v[3], med = (v[2] + x) / 2, sh = v.map((t, i) => (i === 3 ? 'x' : t));
      return { q: T(`Six numbers in ascending order are $${list(sh)}$. The median is ${n(med)}. Find the value of $x$.`, `Enam nombor dalam tertib menaik ialah $${list(sh)}$. Mediannya ialah ${n(med)}. Cari nilai $x$.`), a: T(`$x = ${x}$`), w: W(T(`With 6 numbers in order, the median is the mean of the 3rd and 4th: $\\dfrac{${v[2]} + x}{2} = ${n(med)}$`, `Dengan 6 nombor yang tersusun, median ialah min bagi yang ke-3 dan ke-4: $\\dfrac{${v[2]} + x}{2} = ${n(med)}$`), T(`$${v[2]} + x = ${2 * med}$`), T(`$x = ${2 * med} - ${v[2]} = ${x}$`)), sp: 'm' };
    },
      /* bar chart for one group, table for the other */
    (r) => {
      const U = ufSet(r, 4), f2 = U.xs.map(() => r.int(1, 9)), N2 = sum(f2), sx2 = sum(U.xs.map((x, i) => x * f2[i])), N = U.N + N2, sx = U.sx + sx2;
      const tb = (i) => SPM.table([[i ? 'Kumpulan B' : 'Group B'].concat(f2)], { head: [U.u.h.split('|')[i]].concat(U.xs) });
      return { q: T(`The bar chart shows the ${dsc(U.u, 'some', 0)} for Group A. The table shows the same data for Group B.<br>${tb(0)}<br>Find the mean for all the data of the two groups, correct to 2 decimal places.`, `Carta palang menunjukkan ${dsc(U.u, 'beberapa', 1)} bagi Kumpulan A. Jadual menunjukkan data yang sama bagi Kumpulan B.<br>${tb(1)}<br>Cari min bagi semua data kedua-dua kumpulan, betul kepada 2 tempat perpuluhan.`), fig: barFig(U), a: T(`$\\dfrac{${U.sx} + ${sx2}}{${U.N} + ${N2}} = ${fm(sx / N)}$`), w: W(T(`Group A, read from the bars: frequencies $${U.fs.join(',\\ ')}$`, `Kumpulan A, dibaca daripada palang: kekerapan $${U.fs.join(',\\ ')}$`), SPM.cat(T('Group A: ', 'Kumpulan A: '), fxLine(U.xs, U.fs, U.sx)), T(`$\\sum f = ${U.fs.join(' + ')} = ${U.N}$`), SPM.cat(T('Group B: ', 'Kumpulan B: '), fxLine(U.xs, f2, sx2)), T(`$\\sum f = ${f2.join(' + ')} = ${N2}$`), T(`Mean $= \\dfrac{${U.sx} + ${sx2}}{${U.N} + ${N2}} = \\dfrac{${sx}}{${N}} = ${fm(sx / N)}$`, `Min $= \\dfrac{${U.sx} + ${sx2}}{${U.N} + ${N2}} = \\dfrac{${sx}}{${N}} = ${fm(sx / N)}$`)), sp: 'm' };
    },
    /* mean of the removed values */
    (r) => {
      const d = r.pick(BIG), k = r.int(6, 10), j = r.int(2, 4), m = r.int(d.lo + 5, d.hi - 5), m2 = r.int(d.lo, d.hi), rest = k - j;
      need(m2 !== m && (k * m - rest * m2) % j === 0 && (k * m - rest * m2) / j > 0);
      const m3 = (k * m - rest * m2) / j;
      return { q: T(`The mean of the ${dsc(d, k, 0)} is ${m}. When ${j} of the values are removed, the mean of the remaining ${rest} values is ${m2}. Find the mean of the ${j} values that were removed.`, `Min bagi ${dsc(d, k, 1)} ialah ${m}. Apabila ${j} nilai dikeluarkan, min bagi ${rest} nilai yang tinggal ialah ${m2}. Cari min bagi ${j} nilai yang dikeluarkan itu.`), a: T(`$\\dfrac{${k} \\times ${m} - ${rest} \\times ${m2}}{${j}} = ${m3}$`), w: W(T(`Total of all ${k} values $= ${k} \\times ${m} = ${k * m}$`, `Jumlah kesemua ${k} nilai $= ${k} \\times ${m} = ${k * m}$`), T(`Total of the ${rest} values left $= ${rest} \\times ${m2} = ${rest * m2}$`, `Jumlah ${rest} nilai yang tinggal $= ${rest} \\times ${m2} = ${rest * m2}$`), T(`Total removed $= ${k * m} - ${rest * m2} = ${k * m - rest * m2}$`, `Jumlah yang dikeluarkan $= ${k * m} - ${rest * m2} = ${k * m - rest * m2}$`), T(`Mean $= \\dfrac{${k * m - rest * m2}}{${j}} = ${m3}$`, `Min $= \\dfrac{${k * m - rest * m2}}{${j}} = ${m3}$`)), sp: 'm' };
    },
    /* two unknown frequencies: simultaneous equations */
    (r) => {
      const U = ufSet(r, 5), [i1, i2] = r.sample([0, 1, 2, 3, 4], 2).sort(), a = U.fs[i1], b = U.fs[i2], N = U.N, sx = U.sx;
      need(sx % N === 0 || true);
      const m = sx / N;
      need(Number.isInteger(m * 10) && N >= 14);
      const sh = U.fs.map((v, i) => (i === i1 ? '$p$' : i === i2 ? '$q$' : v));
      const tb = (i) => SPM.table([[FQ.split('|')[i]].concat(sh)], { head: [U.u.h.split('|')[i]].concat(U.xs) });
      const x1 = U.xs[i1], x2 = U.xs[i2], S = a + b, rhs = x1 * a + x2 * b, rest = sx - rhs;
      const lhs = [x1 ? `${co(x1)}p` : '', x2 ? `${co(x2)}q` : ''].filter(Boolean).join(' + ');
      const solve = x1 === 0
        ? [T(`$${co(x2)}q = ${rhs}$, so $q = ${b}$`, `$${co(x2)}q = ${rhs}$, maka $q = ${b}$`), T(`$p = ${S} - ${b} = ${a}$`)]
        : [T(`Substitute $q = ${S} - p$: $${co(x1)}p + ${co(x2)}(${S} - p) = ${rhs}$`, `Gantikan $q = ${S} - p$: $${co(x1)}p + ${co(x2)}(${S} - p) = ${rhs}$`), T(`$${co(x1 - x2)}p = ${rhs - x2 * S}$`), T(`$p = ${a}$, $q = ${S} - ${a} = ${b}$`)];
      return { q: T(`The table shows the ${dsc(U.u, N, 0)}. The mean is ${n(m)}.<br>${tb(0)}<br>Form two equations in $p$ and $q$ and solve them.`, `Jadual menunjukkan ${dsc(U.u, N, 1)}. Min ialah ${n(m)}.<br>${tb(1)}<br>Bentukkan dua persamaan dalam $p$ dan $q$ dan selesaikannya.`), a: T(`$p + q = ${S}$ and $${lhs} = ${rhs}$; $p = ${a}$, $q = ${b}$`, `$p + q = ${S}$ dan $${lhs} = ${rhs}$; $p = ${a}$, $q = ${b}$`), w: W(T(`$\\sum f = ${U.fs.map((f, i) => (i === i1 ? 'p' : i === i2 ? 'q' : f)).join(' + ')} = ${N}$, so $p + q = ${N} - ${N - S} = ${S}$`, `$\\sum f = ${U.fs.map((f, i) => (i === i1 ? 'p' : i === i2 ? 'q' : f)).join(' + ')} = ${N}$, maka $p + q = ${N} - ${N - S} = ${S}$`), T(`$\\sum fx = ${n(m)} \\times ${N} = ${sx}$`), T(`$${lhs}${rest ? ` + ${rest}` : ''} = ${sx}$, so $${lhs} = ${rhs}$`, `$${lhs}${rest ? ` + ${rest}` : ''} = ${sx}$, maka $${lhs} = ${rhs}$`), ...solve), sp: 'l' };
    },
    /* stem-and-leaf: mean and median compared */
    (r) => {
      const d = r.pick(DATA.filter((x) => x.lo >= 10 && x.hi <= 99)), k = r.pick([9, 11, 13]), v = dl(r, d, k);
      need(sum(v) % k === 0 && new Set(v.map((x) => Math.floor(x / 10))).size >= 3 && median(v) !== sum(v) / k);
      const mn = sum(v) / k, md = median(v);
      return { q: T(`The stem-and-leaf plot shows the ${dsc(d, k, 0)}.<br>${stemTab(0, v)}<br>(a) Find the mean.<br>(b) Find the median.<br>(c) Which is greater, the mean or the median?`, `Plot batang-dan-daun menunjukkan ${dsc(d, k, 1)}.<br>${stemTab(1, v)}<br>(a) Cari min.<br>(b) Cari median.<br>(c) Yang manakah lebih besar, min atau median?`), a: SPM.parts([T(`$${mn}$`), T(`$${n(md)}$`), mn > md ? T('The mean', 'Min') : T('The median', 'Median')]), w: W(T(`Read the values off the plot, in order: $${list(sortNum(v))}$`, `Baca nilai daripada plot itu, mengikut tertib: $${list(sortNum(v))}$`), T(`(a) $${sortNum(v).join(' + ')} = ${sum(v)}$, so the mean is $\\dfrac{${sum(v)}}{${k}} = ${mn}$.`, `(a) $${sortNum(v).join(' + ')} = ${sum(v)}$, maka min ialah $\\dfrac{${sum(v)}}{${k}} = ${mn}$.`), SPM.cat(T('(b) '), medLine(k, md)), T(`(c) $${mn} ${mn > md ? '>' : '<'} ${n(md)}$, so the ${mn > md ? 'mean' : 'median'} is greater.`, `(c) $${mn} ${mn > md ? '>' : '<'} ${n(md)}$, maka ${mn > md ? 'min' : 'median'} lebih besar.`)), sp: 'm' };
    },
  ];
  SPM.extend('F2-12.2', { e: ge122, m: gm122, a: ga122 });

  /* ====================================================== F2-12.3 Grouped data */
  const gsetM = (r, g, k) => { const S0 = giSet(r, g, k); S0.mids = S0.cl.map((c) => (c[0] + c[1]) / 2); S0.N = sum(S0.fs); S0.fx = S0.mids.map((m, i) => m * S0.fs[i]); S0.sx = sum(S0.fx); return S0; };
  /** table with class, frequency and optional midpoint / fx columns (cells hidden when show is false) */
  const gTab4 = (i, g, S0, mid, fx, fs) => {
    const h = [g.he + '|' + g.hm, FQ, 'Midpoint, x|Titik tengah, x', 'fx|fx'].slice(0, 2 + (mid ? 1 : 0) + (fx ? 1 : 0)).map((x) => x.split('|')[i]);
    return SPM.table(S0.cl.map((c, j) => [cs(c), (fs || S0.fs)[j]].concat(mid ? [mid === 2 ? S0.mids[j] : ''] : []).concat(fx ? [fx === 2 ? S0.fx[j] : ''] : [])), { head: h });
  };
  const uniqMax = (fs) => fs.filter((f) => f === Math.max(...fs)).length === 1;
  /** the three standard lines of an estimated mean from a grouped table */
  const midW = (S0) => [T(`Midpoint of each class: $${S0.mids.map(n).join(',\\ ')}$`, `Titik tengah setiap kelas: $${S0.mids.map(n).join(',\\ ')}$`),
    fxLine(S0.mids.map(n), S0.fs, n(S0.sx)),
    T(`$\\sum f = ${S0.fs.join(' + ')} = ${S0.N}$`)];
  const meanLine = (sx, N, val) => T(`Estimated mean $= \\dfrac{${n(sx)}}{${N}} = ${val}$`, `Min anggaran $= \\dfrac{${n(sx)}}{${N}} = ${val}$`);
  const barCls = (S0, g) => { const mk = (i) => S.bar({ cats: S0.cl.map(cs), vals: S0.fs, ymax: Math.ceil((Math.max(...S0.fs) + 1) / 2) * 2, ystep: 2, xlabel: (i ? g.hm : g.he), ylabel: FQ.split('|')[i], w: 340, h: 200 }); return T(mk(0), mk(1)); };
  const TF3 = [
    ['The mean calculated from a grouped frequency table is only an estimate.|Min yang dikira daripada jadual kekerapan terkumpul hanyalah satu anggaran.', 1, 'The individual values are not known, so the class midpoints are used.|Nilai individu tidak diketahui, maka titik tengah kelas digunakan.'],
    ['The modal class is the class with the highest frequency.|Kelas mod ialah kelas yang mempunyai kekerapan tertinggi.', 1, 'It is the class that contains the most observations.|Ia ialah kelas yang mengandungi cerapan paling banyak.'],
    ['The midpoint of the class 10–19 is 15.|Titik tengah bagi kelas 10–19 ialah 15.', 0, 'The midpoint is (10 + 19) ÷ 2 = 14.5.|Titik tengah ialah (10 + 19) ÷ 2 = 14.5.'],
    ['The estimated mean is found by dividing Σfx by Σf.|Min anggaran diperoleh dengan membahagikan Σfx dengan Σf.', 1, 'x is the class midpoint and f is the frequency.|x ialah titik tengah kelas dan f ialah kekerapan.'],
    ['The modal class must contain the mode of the original data.|Kelas mod mesti mengandungi mod bagi data asal.', 0, 'The mode of the original data may lie in another class.|Mod bagi data asal mungkin terletak dalam kelas lain.'],
    ['The estimated mean always lies between the lowest and highest class midpoints.|Min anggaran sentiasa terletak antara titik tengah kelas terendah dengan tertinggi.', 1, 'It is a weighted average of the midpoints.|Ia ialah purata berpemberat bagi titik tengah.'],
  ].map((t) => { const a = t[0].split('|'), b = t[2].split('|'); return [a[0], a[1], t[1], b[0], b[1]]; });
  const ge123 = [
    /* modal class from a table */
    (r) => {
      const g = r.pick(GI), S0 = giSet(r, g), mx = Math.max(...S0.fs), ask = r.int(0, 1);
      need(uniqMax(S0.fs));
      return { q: T(`The table shows the ${g.en}.<br>${giTab(0, g, S0)}<br>State the modal class${ask ? ' and its frequency' : ''}.`, `Jadual menunjukkan ${g.ms}.<br>${giTab(1, g, S0)}<br>Nyatakan kelas mod${ask ? ' dan kekerapannya' : ''}.`), a: T(`${cs(S0.cl[S0.fs.indexOf(mx)])}${ask ? ` (frequency ${mx})` : ''}`, `${cs(S0.cl[S0.fs.indexOf(mx)])}${ask ? ` (kekerapan ${mx})` : ''}`), w: W(T('The modal class is the class with the highest frequency.', 'Kelas mod ialah kelas yang mempunyai kekerapan tertinggi.'), T(`Frequencies: $${S0.fs.join(',\\ ')}$; the largest is $${mx}$.`, `Kekerapan: $${S0.fs.join(',\\ ')}$; yang terbesar ialah $${mx}$.`), T(`So the modal class is ${cs(S0.cl[S0.fs.indexOf(mx)])}.`, `Maka kelas mod ialah ${cs(S0.cl[S0.fs.indexOf(mx)])}.`)), sp: 's' };
    },
    /* modal class from a bar chart of classes */
    (r) => {
      const g = r.pick(GI), S0 = giSet(r, g);
      need(uniqMax(S0.fs));
      return { q: T(`The bar chart shows the ${g.en}. State the modal class.`, `Carta palang menunjukkan ${g.ms}. Nyatakan kelas mod.`), fig: barCls(S0, g), a: T(cs(S0.cl[S0.fs.indexOf(Math.max(...S0.fs))])), w: W(T(`Read the height of each bar: $${S0.fs.join(',\\ ')}$`, `Baca tinggi setiap palang: $${S0.fs.join(',\\ ')}$`), T(`The tallest bar has frequency $${Math.max(...S0.fs)}$, so the modal class is ${cs(S0.cl[S0.fs.indexOf(Math.max(...S0.fs))])}.`, `Palang tertinggi mempunyai kekerapan $${Math.max(...S0.fs)}$, maka kelas mod ialah ${cs(S0.cl[S0.fs.indexOf(Math.max(...S0.fs))])}.`)), sp: 's' };
    },
    /* midpoints of given classes */
    (r) => {
      const w = r.pick([3, 5, 10]), s = r.step(0, 60, w), k = r.int(3, 4), cl = cls(s, w, k);
      return { q: T(`The classes of a grouped frequency table are ${cl.map(cs).join(', ')}. Find the midpoint of each class.`, `Kelas bagi satu jadual kekerapan terkumpul ialah ${cl.map(cs).join(', ')}. Cari titik tengah bagi setiap kelas.`), a: T(cl.map((c) => `$${n((c[0] + c[1]) / 2)}$`).join(', ')), w: W(T('Midpoint $= \\dfrac{\\text{lower limit} + \\text{upper limit}}{2}$', 'Titik tengah $= \\dfrac{\\text{had bawah} + \\text{had atas}}{2}$'), ...cl.map((c) => T(`$\\dfrac{${c[0]} + ${c[1]}}{2} = ${n((c[0] + c[1]) / 2)}$`))), sp: 's' };
    },
    /* midpoint of a class written with inequalities */
    (r) => {
      const w = r.pick([5, 10, 20]), s = r.step(0, 100, w), sy = r.pick(['x', 't', 'm']);
      return { q: T(`A class in a grouped frequency table is $${s} \\le ${sy} < ${s + w}$. Find its midpoint and its class width.`, `Satu kelas dalam jadual kekerapan terkumpul ialah $${s} \\le ${sy} < ${s + w}$. Cari titik tengah dan lebar kelas itu.`), a: T(`Midpoint $= ${s + w / 2}$; class width $= ${w}$`, `Titik tengah $= ${s + w / 2}$; lebar kelas $= ${w}$`), w: W(T(`The class runs from $${s}$ up to (but not including) $${s + w}$.`, `Kelas itu bermula dari $${s}$ hingga (tetapi tidak termasuk) $${s + w}$.`), T(`Class width $= ${s + w} - ${s} = ${w}$`, `Lebar kelas $= ${s + w} - ${s} = ${w}$`), T(`Midpoint $= \\dfrac{${s} + ${s + w}}{2} = ${s + w / 2}$`, `Titik tengah $= \\dfrac{${s} + ${s + w}}{2} = ${s + w / 2}$`)), sp: 's' };
    },
    /* find the other end of a class from its midpoint */
    (r) => {
      const w = r.pick([5, 9, 10]), lo = r.int(10, 60), hi = lo + w - 1, ask = r.int(0, 1);
      return { q: T(`${ask ? `The class ${lo}– has a midpoint of ${(lo + hi) / 2}. Find the upper limit of the class.` : `A class ends at ${hi} and has a midpoint of ${(lo + hi) / 2}. Find the lower limit of the class.`}`, `${ask ? `Kelas ${lo}– mempunyai titik tengah ${(lo + hi) / 2}. Cari had atas kelas itu.` : `Satu kelas berakhir pada ${hi} dan mempunyai titik tengah ${(lo + hi) / 2}. Cari had bawah kelas itu.`}`), a: T(`$${ask ? hi : lo}$`), w: W(T(`The midpoint is halfway between the two limits: $\\dfrac{${lo} + ${hi}}{2} = ${(lo + hi) / 2}$`, `Titik tengah terletak di tengah-tengah antara dua had: $\\dfrac{${lo} + ${hi}}{2} = ${(lo + hi) / 2}$`), T(`So ${ask ? 'upper' : 'lower'} limit $= 2 \\times ${(lo + hi) / 2} - ${ask ? lo : hi} = ${ask ? hi : lo}$`, `Maka had ${ask ? 'atas' : 'bawah'} $= 2 \\times ${(lo + hi) / 2} - ${ask ? lo : hi} = ${ask ? hi : lo}$`)), sp: 's' };
    },
    /* fx of one row */
    (r) => {
      const g = r.pick(GI), S0 = gsetM(r, g), j = r.int(0, S0.cl.length - 1);
      return { q: T(`In a grouped frequency table for the ${g.en}, the class ${cs(S0.cl[j])} has a frequency of ${S0.fs[j]}. Find the midpoint of the class and the value of $fx$ for this class.`, `Dalam jadual kekerapan terkumpul bagi ${g.ms}, kelas ${cs(S0.cl[j])} mempunyai kekerapan ${S0.fs[j]}. Cari titik tengah kelas itu dan nilai $fx$ bagi kelas ini.`), a: T(`Midpoint $= ${S0.mids[j]}$; $fx = ${S0.mids[j]} \\times ${S0.fs[j]} = ${S0.fx[j]}$`, `Titik tengah $= ${S0.mids[j]}$; $fx = ${S0.mids[j]} \\times ${S0.fs[j]} = ${S0.fx[j]}$`), w: W(T(`Midpoint $= \\dfrac{${S0.cl[j][0]} + ${S0.cl[j][1]}}{2} = ${n(S0.mids[j])}$`, `Titik tengah $= \\dfrac{${S0.cl[j][0]} + ${S0.cl[j][1]}}{2} = ${n(S0.mids[j])}$`), T(`$fx = f \\times x = ${S0.fs[j]} \\times ${n(S0.mids[j])} = ${n(S0.fx[j])}$`), T('In a grouped table $x$ always means the class midpoint.', 'Dalam jadual terkumpul, $x$ sentiasa bermaksud titik tengah kelas.')), sp: 's' };
    },
    /* total frequency / observations below a value */
    (r) => {
      const g = r.pick(GI), S0 = giSet(r, g), j = r.int(1, S0.cl.length - 2), ask = r.int(0, 1), lim = S0.cl[j][0];
      const c = sum(S0.fs.slice(0, j));
      return { q: T(`The table shows the ${g.en}.<br>${giTab(0, g, S0)}<br>${ask ? `How many observations are less than ${lim}?` : 'How many observations are there altogether?'}`, `Jadual menunjukkan ${g.ms}.<br>${giTab(1, g, S0)}<br>${ask ? `Berapakah bilangan cerapan yang kurang daripada ${lim}?` : 'Berapakah jumlah cerapan kesemuanya?'}`), a: T(`$${ask ? c : sum(S0.fs)}$`), w: ask ? W(T(`Values less than ${lim} are those in the classes before ${cs(S0.cl[j])}.`, `Nilai yang kurang daripada ${lim} ialah nilai dalam kelas sebelum ${cs(S0.cl[j])}.`), T(`$${S0.fs.slice(0, j).join(' + ')} = ${c}$`)) : W(T('Add every frequency in the table.', 'Tambah setiap kekerapan dalam jadual.'), T(`$${S0.fs.join(' + ')} = ${sum(S0.fs)}$`)), sp: 's' };
    },
    /* true / false or estimated */
    (r) => {
      const t = r.pick(TF3);
      return { q: T(`True or false? Give a reason.<br>"${t[0]}"`, `Benar atau palsu? Berikan sebab.<br>"${t[1]}"`), a: T(`${t[2] ? 'True' : 'False'}. ${t[3]}`, `${t[2] ? 'Benar' : 'Palsu'}. ${t[4]}`), w: W(T(t[2] ? 'Check the statement against how a grouped frequency table is used.' : 'Check the statement against how a grouped frequency table is used — one counterexample makes it false.', t[2] ? 'Semak pernyataan itu dengan cara jadual kekerapan terkumpul digunakan.' : 'Semak pernyataan itu dengan cara jadual kekerapan terkumpul digunakan — satu contoh penyangkal menjadikannya palsu.'), T(t[3], t[4]), T(t[2] ? 'So the statement is true.' : 'So the statement is false.', t[2] ? 'Maka pernyataan itu benar.' : 'Maka pernyataan itu palsu.')), sp: 's' };
    },
    /* what does x stand for? */
    (r) => {
      const g = r.pick(GI), S0 = gsetM(r, g, 4), j = r.int(0, 3), o = r.shuffle([['the class midpoint', 'titik tengah kelas'], ['the lower limit of the class', 'had bawah kelas'], ['the class width', 'lebar kelas'], ['the frequency', 'kekerapan']]);
      return { q: T(`To estimate the mean of the ${g.en}, a student uses the formula estimated mean $= \\dfrac{\\sum fx}{\\sum f}$. What does $x$ represent?<br>${o.map((x, i) => `${'ABCD'[i]}. ${x[0]}`).join('&emsp;')}`, `Untuk menganggar min bagi ${g.ms}, seorang murid menggunakan rumus min anggaran $= \\dfrac{\\sum fx}{\\sum f}$. Apakah yang diwakili oleh $x$?<br>${o.map((x, i) => `${'ABCD'[i]}. ${x[1]}`).join('&emsp;')}`), a: T(`${'ABCD'[o.findIndex((x) => x[0] === 'the class midpoint')]}. the class midpoint`, `${'ABCD'[o.findIndex((x) => x[0] === 'the class midpoint')]}. titik tengah kelas`), w: W(T('The individual values in a class are not known, so each class is represented by one value: its midpoint.', 'Nilai individu dalam sesuatu kelas tidak diketahui, maka setiap kelas diwakili oleh satu nilai: titik tengahnya.'), T(`In $\\sum fx$, $f$ is the frequency and $x$ is that midpoint — option ${'ABCD'[o.findIndex((x) => x[0] === 'the class midpoint')]}.`, `Dalam $\\sum fx$, $f$ ialah kekerapan dan $x$ ialah titik tengah itu — pilihan ${'ABCD'[o.findIndex((x) => x[0] === 'the class midpoint')]}.`)), sp: 'xs' };
    },
  ];
  const gm123 = [
    /* complete midpoint and fx columns, then estimate the mean */
    (r) => {
      const g = r.pick(GI), S0 = gsetM(r, g);
      return { q: T(`The table shows the ${g.en}.<br>${gTab4(0, g, S0, 1, 1)}<br>Complete the columns for the midpoint and $fx$, and hence calculate the estimated mean, correct to 2 decimal places.`, `Jadual menunjukkan ${g.ms}.<br>${gTab4(1, g, S0, 1, 1)}<br>Lengkapkan lajur titik tengah dan $fx$, dan seterusnya hitung min anggaran, betul kepada 2 tempat perpuluhan.`), a: T(`Midpoints ${S0.mids.join(', ')}; $fx$: ${S0.fx.join(', ')}; estimated mean $= \\dfrac{${n(S0.sx)}}{${S0.N}} = ${fm(S0.sx / S0.N)}$`, `Titik tengah ${S0.mids.join(', ')}; $fx$: ${S0.fx.join(', ')}; min anggaran $= \\dfrac{${n(S0.sx)}}{${S0.N}} = ${fm(S0.sx / S0.N)}$`), w: W(...midW(S0), meanLine(S0.sx, S0.N, fm(S0.sx / S0.N))), sp: 'l' };
    },
    /* estimated mean from the table (midpoints supplied) */
    (r) => {
      const g = r.pick(GI), S0 = gsetM(r, g);
      return { q: T(`The table shows the ${g.en}.<br>${gTab4(0, g, S0, 2, 0)}<br>Calculate the estimated mean, correct to 2 decimal places.`, `Jadual menunjukkan ${g.ms}.<br>${gTab4(1, g, S0, 2, 0)}<br>Hitung min anggaran, betul kepada 2 tempat perpuluhan.`), a: T(`$\\dfrac{${n(S0.sx)}}{${S0.N}} = ${fm(S0.sx / S0.N)}$`), w: W(...midW(S0), meanLine(S0.sx, S0.N, fm(S0.sx / S0.N))), sp: 'm' };
    },
    /* estimated mean from a bar chart of classes */
    (r) => {
      const g = r.pick(GI), S0 = gsetM(r, g, r.int(4, 5));
      return { q: T(`The bar chart shows the ${g.en}. Estimate the mean, correct to 2 decimal places.`, `Carta palang menunjukkan ${g.ms}. Anggarkan min, betul kepada 2 tempat perpuluhan.`), fig: barCls(S0, g), a: T(`Estimated mean $= \\dfrac{${n(S0.sx)}}{${S0.N}} = ${fm(S0.sx / S0.N)}$`, `Min anggaran $= \\dfrac{${n(S0.sx)}}{${S0.N}} = ${fm(S0.sx / S0.N)}$`), w: W(T(`Read the frequency of each class from the bars: $${S0.fs.join(',\\ ')}$`, `Baca kekerapan setiap kelas daripada palang: $${S0.fs.join(',\\ ')}$`), ...midW(S0), meanLine(S0.sx, S0.N, fm(S0.sx / S0.N))), sp: 'l' };
    },
    /* modal class and estimated mean of a table with inequality classes */
    (r) => {
      const g = r.pick(GI), S0 = gsetM(r, g, 4), w = S0.w, hd = (i) => [g[i ? 'hm' : 'he'], FQ.split('|')[i]];
      need(uniqMax(S0.fs));
      const tb = (i) => SPM.table(S0.cl.map((c, j) => [`$${c[0]} \\le x < ${c[0] + w}$`, S0.fs[j]]), { head: hd(i) });
      const mids = S0.cl.map((c) => c[0] + w / 2), sx = sum(mids.map((m, j) => m * S0.fs[j]));
      return { q: T(`The table shows the ${g.en}.<br>${tb(0)}<br>(a) State the modal class.<br>(b) Calculate the estimated mean, correct to 2 decimal places.`, `Jadual menunjukkan ${g.ms}.<br>${tb(1)}<br>(a) Nyatakan kelas mod.<br>(b) Hitung min anggaran, betul kepada 2 tempat perpuluhan.`), a: SPM.parts([T(`$${S0.cl[S0.fs.indexOf(Math.max(...S0.fs))][0]} \\le x < ${S0.cl[S0.fs.indexOf(Math.max(...S0.fs))][0] + w}$`), T(`$\\dfrac{${n(sx)}}{${S0.N}} = ${fm(sx / S0.N)}$`)]), w: W(T(`(a) The highest frequency is $${Math.max(...S0.fs)}$, in the class $${S0.cl[S0.fs.indexOf(Math.max(...S0.fs))][0]} \\le x < ${S0.cl[S0.fs.indexOf(Math.max(...S0.fs))][0] + w}$.`, `(a) Kekerapan tertinggi ialah $${Math.max(...S0.fs)}$, dalam kelas $${S0.cl[S0.fs.indexOf(Math.max(...S0.fs))][0]} \\le x < ${S0.cl[S0.fs.indexOf(Math.max(...S0.fs))][0] + w}$.`), T(`(b) Midpoint of $${S0.cl[0][0]} \\le x < ${S0.cl[0][0] + w}$ is $\\dfrac{${S0.cl[0][0]} + ${S0.cl[0][0] + w}}{2} = ${n(mids[0])}$; all midpoints: $${mids.map(n).join(',\\ ')}$`, `(b) Titik tengah bagi $${S0.cl[0][0]} \\le x < ${S0.cl[0][0] + w}$ ialah $\\dfrac{${S0.cl[0][0]} + ${S0.cl[0][0] + w}}{2} = ${n(mids[0])}$; semua titik tengah: $${mids.map(n).join(',\\ ')}$`), fxLine(mids.map(n), S0.fs, n(sx)), T(`$\\sum f = ${S0.fs.join(' + ')} = ${S0.N}$`), meanLine(sx, S0.N, fm(sx / S0.N))), sp: 'l' };
    },
    /* percentage in the modal class / fraction above a limit */
    (r) => {
      const g = r.pick(GI), N = r.pick([20, 25, 40, 50]), K = r.int(4, 5), cl = cls(g.lo, r.pick(g.ws), K), fs = Array(K).fill(1);
      for (let q = 0; q < N - K; q++) fs[r.int(0, K - 1)]++;
      need(uniqMax(fs) && fs.every((f) => f <= N / 2));
      const S0 = { cl, fs }, mx = Math.max(...fs), j = r.int(1, K - 1), above = sum(fs.slice(j));
      return { q: T(`The table shows the ${g.en}.<br>${giTab(0, g, S0)}<br>(a) State the modal class and the percentage of the observations that lie in it.<br>(b) What fraction of the observations are ${cl[j][0]} or more? Give your answer in its simplest form.`, `Jadual menunjukkan ${g.ms}.<br>${giTab(1, g, S0)}<br>(a) Nyatakan kelas mod dan peratusan cerapan yang terletak di dalamnya.<br>(b) Berapakah pecahan cerapan yang ${cl[j][0]} atau lebih? Beri jawapan dalam bentuk termudah.`), a: SPM.parts([T(`${cs(cl[fs.indexOf(mx)])}; $${n((100 * mx) / N)}\\%$`), T(`$${Fr.tex(Fr.make(above, N))}$`)]), w: W(T(`(a) The highest frequency is $${mx}$, so the modal class is ${cs(cl[fs.indexOf(mx)])}.`, `(a) Kekerapan tertinggi ialah $${mx}$, maka kelas mod ialah ${cs(cl[fs.indexOf(mx)])}.`), T(`$\\dfrac{${mx}}{${N}} \\times 100\\% = ${n((100 * mx) / N)}\\%$`), T(`(b) ${cl[j][0]} or more covers the classes from ${cs(cl[j])} onwards: $${fs.slice(j).join(' + ')} = ${above}$`, `(b) ${cl[j][0]} atau lebih merangkumi kelas dari ${cs(cl[j])} seterusnya: $${fs.slice(j).join(' + ')} = ${above}$`), T(`$\\dfrac{${above}}{${N}}${Fr.make(above, N).d === N ? '' : ` = ${Fr.tex(Fr.make(above, N))}`}$`)), sp: 'm' };
    },
    /* compare the modal classes of two groups */
    (r) => {
      const g = r.pick(GI), A = giSet(r, g, 4), B = { cl: A.cl, fs: A.cl.map(() => r.int(2, 12)) };
      need(uniqMax(A.fs) && uniqMax(B.fs) && A.fs.indexOf(Math.max(...A.fs)) !== B.fs.indexOf(Math.max(...B.fs)));
      const tb = (i) => SPM.table(A.cl.map((c, j) => [cs(c), A.fs[j], B.fs[j]]), { head: [g.he + '|' + g.hm, 'Group A|Kumpulan A', 'Group B|Kumpulan B'].map((h) => h.split('|')[i]) });
      const ja = A.fs.indexOf(Math.max(...A.fs)), jb = B.fs.indexOf(Math.max(...B.fs));
      return { q: T(`The table shows the frequencies of the ${g.en} for two groups.<br>${tb(0)}<br>State the modal class of each group. Which group has the higher modal class?`, `Jadual menunjukkan kekerapan ${g.ms} bagi dua kumpulan.<br>${tb(1)}<br>Nyatakan kelas mod bagi setiap kumpulan. Kumpulan manakah yang mempunyai kelas mod lebih tinggi?`), a: T(`A: ${cs(A.cl[ja])}; B: ${cs(A.cl[jb])}; Group ${ja > jb ? 'A' : 'B'} has the higher modal class.`, `A: ${cs(A.cl[ja])}; B: ${cs(A.cl[jb])}; Kumpulan ${ja > jb ? 'A' : 'B'} mempunyai kelas mod yang lebih tinggi.`), w: W(T(`Group A: frequencies $${A.fs.join(',\\ ')}$, largest $${Math.max(...A.fs)}$ → ${cs(A.cl[ja])}`, `Kumpulan A: kekerapan $${A.fs.join(',\\ ')}$, terbesar $${Math.max(...A.fs)}$ → ${cs(A.cl[ja])}`), T(`Group B: frequencies $${B.fs.join(',\\ ')}$, largest $${Math.max(...B.fs)}$ → ${cs(A.cl[jb])}`, `Kumpulan B: kekerapan $${B.fs.join(',\\ ')}$, terbesar $${Math.max(...B.fs)}$ → ${cs(A.cl[jb])}`), T(`${cs(A.cl[Math.max(ja, jb)])} covers larger values than ${cs(A.cl[Math.min(ja, jb)])}, so Group ${ja > jb ? 'A' : 'B'} has the higher modal class.`, `${cs(A.cl[Math.max(ja, jb)])} merangkumi nilai yang lebih besar daripada ${cs(A.cl[Math.min(ja, jb)])}, maka Kumpulan ${ja > jb ? 'A' : 'B'} mempunyai kelas mod yang lebih tinggi.`)), sp: 'm' };
    },
    /* estimated or exact? */
    (r) => {
      const g = r.pick(GI), S0 = gsetM(r, g, 4), m = fm(S0.sx / S0.N), nm = r.name(), jm = S0.fs.indexOf(Math.max(...S0.fs));
      return { q: T(`${nm} uses class midpoints to calculate a mean of ${m} from a grouped frequency table of the ${g.en}. ${nm} says, "The mean of the original data is exactly ${m}." Is ${nm} correct? Explain.`, `${nm} menggunakan titik tengah kelas untuk mengira min ${m} daripada jadual kekerapan terkumpul bagi ${g.ms}. ${nm} berkata, "Min bagi data asal tepat ${m}." Adakah ${nm} betul? Terangkan.`), a: T(`No. The value ${m} is only an estimated mean, because the actual values in each class are not known and the midpoint is used to represent them.`, `Tidak. Nilai ${m} hanyalah min anggaran, kerana nilai sebenar dalam setiap kelas tidak diketahui dan titik tengah digunakan untuk mewakilinya.`), w: W(T(`The class ${cs(S0.cl[jm])}, for example, has frequency ${S0.fs[jm]}, but the table does not say what those ${S0.fs[jm]} values actually are.`, `Kelas ${cs(S0.cl[jm])}, contohnya, mempunyai kekerapan ${S0.fs[jm]}, tetapi jadual tidak menyatakan nilai sebenar bagi ${S0.fs[jm]} cerapan itu.`), T(`Each of them is replaced by the midpoint ${n(S0.mids[jm])}, so $\\sum fx = ${n(S0.sx)}$ is itself an estimate.`, `Setiap satu digantikan dengan titik tengah ${n(S0.mids[jm])}, maka $\\sum fx = ${n(S0.sx)}$ itu sendiri satu anggaran.`), T(`So ${m} is an estimated mean, not the exact mean of the original data.`, `Maka ${m} ialah min anggaran, bukan min tepat bagi data asal.`)), sp: 's' };
    },
    /* class from raw values, midpoint of the class containing a value */
    (r) => {
      const g = r.pick(GI), S0 = gsetM(r, g, 5), j = r.int(0, 4), v = r.int(S0.cl[j][0], S0.cl[j][1]);
      return { q: T(`The ${g.en} are grouped in the classes ${S0.cl.map(cs).join(', ')}. The value ${v} is recorded. In which class is it placed, and what value represents it when the mean is estimated?`, `${cap(g.ms)} dikumpulkan dalam kelas ${S0.cl.map(cs).join(', ')}. Nilai ${v} direkodkan. Dalam kelas manakah nilai itu diletakkan, dan apakah nilai yang mewakilinya apabila min dianggarkan?`), a: T(`Class ${cs(S0.cl[j])}; represented by its midpoint ${S0.mids[j]}`, `Kelas ${cs(S0.cl[j])}; diwakili oleh titik tengahnya ${S0.mids[j]}`), w: W(T(`$${S0.cl[j][0]} \\le ${v} \\le ${S0.cl[j][1]}$, so ${v} goes into the class ${cs(S0.cl[j])}.`, `$${S0.cl[j][0]} \\le ${v} \\le ${S0.cl[j][1]}$, maka ${v} diletakkan dalam kelas ${cs(S0.cl[j])}.`), T(`When the mean is estimated every value in a class is replaced by the midpoint: $\\dfrac{${S0.cl[j][0]} + ${S0.cl[j][1]}}{2} = ${n(S0.mids[j])}$`, `Apabila min dianggarkan, setiap nilai dalam sesuatu kelas digantikan dengan titik tengah: $\\dfrac{${S0.cl[j][0]} + ${S0.cl[j][1]}}{2} = ${n(S0.mids[j])}$`)), sp: 's' };
    },
  ];
  const ga123 = [
    /* raw data -> grouped -> estimated mean vs exact mean */
    (r) => {
      const d = r.pick(BIG), w = r.pick([5, 10]), N = r.int(12, 16), G = groupSet(r, d, N, w), mids = G.cl.map((c) => (c[0] + c[1]) / 2), sx = sum(mids.map((m, j) => m * G.fs[j])), ex = sum(G.vals);
      need(Math.abs(sx / N - ex / N) > 0.001);
      return { q: T(`${cap(dsc(d, N, 0))}: ${G.vals.join(', ')}.<br>(a) Group the data into the classes ${cs(G.cl[0])}, ${cs(G.cl[1])}, …, ${cs(G.cl[G.cl.length - 1])}.<br>(b) Estimate the mean from the grouped data, correct to 2 decimal places.<br>(c) Calculate the exact mean from the original data and explain why the two values differ.`, `${cap(dsc(d, N, 1))}: ${G.vals.join(', ')}.<br>(a) Kumpulkan data itu ke dalam kelas ${cs(G.cl[0])}, ${cs(G.cl[1])}, …, ${cs(G.cl[G.cl.length - 1])}.<br>(b) Anggarkan min daripada data terkumpul, betul kepada 2 tempat perpuluhan.<br>(c) Hitung min tepat daripada data asal dan terangkan mengapa kedua-dua nilai itu berbeza.`), a: SPM.parts([T(G.cl.map((c, j) => `${cs(c)}: ${G.fs[j]}`).join('; ')), T(`$\\dfrac{${n(sx)}}{${N}} = ${fm(sx / N)}$`), T(`Exact mean $= \\dfrac{${ex}}{${N}} = ${fm(ex / N)}$. The estimate uses class midpoints instead of the real values.`, `Min tepat $= \\dfrac{${ex}}{${N}} = ${fm(ex / N)}$. Anggaran menggunakan titik tengah kelas, bukan nilai sebenar.`)]), w: W(T(`(a) Tally each value into its class: ${G.cl.map((c, j) => `${cs(c)}: ${G.fs[j]}`).join('; ')} — check: $${G.fs.join(' + ')} = ${N}$`, `(a) Tally setiap nilai ke dalam kelasnya: ${G.cl.map((c, j) => `${cs(c)}: ${G.fs[j]}`).join('; ')} — semak: $${G.fs.join(' + ')} = ${N}$`), T(`(b) Midpoints: $${mids.map(n).join(',\\ ')}$`, `(b) Titik tengah: $${mids.map(n).join(',\\ ')}$`), fxLine(mids.map(n), G.fs, n(sx)), meanLine(sx, N, fm(sx / N)), T(`(c) Exact mean $= \\dfrac{${ex}}{${N}} = ${fm(ex / N)}$`, `(c) Min tepat $= \\dfrac{${ex}}{${N}} = ${fm(ex / N)}$`), T('The two differ because the estimate replaces every value in a class by the midpoint instead of using the real values.', 'Kedua-duanya berbeza kerana anggaran menggantikan setiap nilai dalam sesuatu kelas dengan titik tengah, bukan menggunakan nilai sebenar.')), sp: 'xl' };
    },
    /* missing frequency from the estimated mean */
    (r) => {
      const g = r.pick(GI), S0 = gsetM(r, g, r.int(4, 5)), j = r.int(0, S0.cl.length - 1), kk = S0.fs[j], N0 = S0.N - kk, S00 = S0.sx - S0.mids[j] * kk;
      const m = S0.sx / S0.N;
      need(Number.isInteger(m * 10) && N0 > 5 && S0.mids[j] !== m);
      const sh = S0.fs.map((f, q) => (q === j ? '$k$' : f));
      const tb = (i) => SPM.table(S0.cl.map((c, q) => [cs(c), sh[q]]), { head: [g.he + '|' + g.hm, FQ].map((h) => h.split('|')[i]) });
      return { q: T(`The table shows the ${g.en}. The estimated mean is ${n(m)}.<br>${tb(0)}<br>Find the value of $k$.`, `Jadual menunjukkan ${g.ms}. Min anggaran ialah ${n(m)}.<br>${tb(1)}<br>Cari nilai $k$.`), a: T(`$\\dfrac{${n(S00)} + ${S0.mids[j]}k}{${N0} + k} = ${n(m)}$, so $k = ${kk}$`, `$\\dfrac{${n(S00)} + ${S0.mids[j]}k}{${N0} + k} = ${n(m)}$, maka $k = ${kk}$`), w: W(T(`Midpoints: $${S0.mids.map(n).join(',\\ ')}$`, `Titik tengah: $${S0.mids.map(n).join(',\\ ')}$`), T(`$\\sum fx = ${S0.mids.map((mi, q) => (q === j ? `${n(mi)}k` : `${n(mi)} \\times ${S0.fs[q]}`)).join(' + ')} = ${nr(S00)} + ${n(S0.mids[j])}k$`), T(`$\\sum f = ${S0.fs.map((f, q) => (q === j ? 'k' : f)).join(' + ')} = ${N0} + k$`), T(`$\\dfrac{${nr(S00)} + ${n(S0.mids[j])}k}{${N0} + k} = ${n(m)}$`), T(`$${nr(S00)} + ${n(S0.mids[j])}k = ${n(m)} \\times ${N0} + ${n(m)}k = ${nr(m * N0)} + ${n(m)}k$`), T(`$${cof(round(S0.mids[j] - m, 6))}k = ${nr(m * N0 - S00)}$`), T(`$k = ${kk}$`)), sp: 'l' };
    },
    /* limits of the true mean */
    (r) => {
      const g = r.pick(GI), S0 = gsetM(r, g, 4), lo = sum(S0.cl.map((c, j) => c[0] * S0.fs[j])) / S0.N, hi = sum(S0.cl.map((c, j) => c[1] * S0.fs[j])) / S0.N;
      return { q: T(`The table shows the ${g.en}.<br>${giTab(0, g, S0)}<br>(a) Calculate the estimated mean.<br>(b) Calculate the smallest and the largest possible value of the actual mean, by using the lower and the upper limit of each class. Give all answers correct to 2 decimal places.`, `Jadual menunjukkan ${g.ms}.<br>${giTab(1, g, S0)}<br>(a) Hitung min anggaran.<br>(b) Hitung nilai terkecil dan terbesar yang mungkin bagi min sebenar, dengan menggunakan had bawah dan had atas setiap kelas. Beri semua jawapan betul kepada 2 tempat perpuluhan.`), a: SPM.parts([T(`$${fm(S0.sx / S0.N)}$`), T(`$${fm(lo)}$ and $${fm(hi)}$`, `$${fm(lo)}$ dan $${fm(hi)}$`)]), w: W(SPM.cat(T('(a) '), midW(S0)[0]), midW(S0)[1], midW(S0)[2], meanLine(S0.sx, S0.N, fm(S0.sx / S0.N)), T(`(b) Smallest possible: give every value its class lower limit: $\\sum fx = ${S0.cl.map((c, j) => `${c[0]} \\times ${S0.fs[j]}`).join(' + ')} = ${nr(lo * S0.N)}$`, `(b) Terkecil yang mungkin: beri setiap nilai had bawah kelasnya: $\\sum fx = ${S0.cl.map((c, j) => `${c[0]} \\times ${S0.fs[j]}`).join(' + ')} = ${nr(lo * S0.N)}$`), T(`$\\dfrac{${nr(lo * S0.N)}}{${S0.N}} = ${fm(lo)}$`), T(`Largest possible: use the upper limits: $\\sum fx = ${S0.cl.map((c, j) => `${c[1]} \\times ${S0.fs[j]}`).join(' + ')} = ${nr(hi * S0.N)}$`, `Terbesar yang mungkin: gunakan had atas: $\\sum fx = ${S0.cl.map((c, j) => `${c[1]} \\times ${S0.fs[j]}`).join(' + ')} = ${nr(hi * S0.N)}$`), T(`$\\dfrac{${nr(hi * S0.N)}}{${S0.N}} = ${fm(hi)}$`)), sp: 'l' };
    },
    /* error: lower limits used instead of midpoints */
    (r) => {
      const g = r.pick(GI), S0 = gsetM(r, g, 4), bad = sum(S0.cl.map((c, j) => c[0] * S0.fs[j])) / S0.N, nm = r.name();
      return { q: T(`The table shows the ${g.en}.<br>${giTab(0, g, S0)}<br>${nm} estimated the mean by multiplying each frequency by the lower limit of its class and got ${fm(bad)}.<br>(a) What mistake did ${nm} make?<br>(b) Find the correct estimated mean, correct to 2 decimal places.`, `Jadual menunjukkan ${g.ms}.<br>${giTab(1, g, S0)}<br>${nm} menganggar min dengan mendarabkan setiap kekerapan dengan had bawah kelasnya dan mendapat ${fm(bad)}.<br>(a) Apakah kesilapan yang dilakukan oleh ${nm}?<br>(b) Cari min anggaran yang betul, betul kepada 2 tempat perpuluhan.`), a: SPM.parts([T('The midpoint of each class should be used, not the lower limit.', 'Titik tengah setiap kelas patut digunakan, bukan had bawah.'), T(`$${fm(S0.sx / S0.N)}$`)]), w: W(T(`(a) Using the lower limits gives $\\dfrac{${S0.cl.map((c, j) => `${c[0]} \\times ${S0.fs[j]}`).join(' + ')}}{${S0.N}} = ${fm(bad)}$, which is too small: a class such as ${cs(S0.cl[0])} is represented by ${S0.cl[0][0]} instead of its midpoint ${n(S0.mids[0])}.`, `(a) Menggunakan had bawah memberikan $\\dfrac{${S0.cl.map((c, j) => `${c[0]} \\times ${S0.fs[j]}`).join(' + ')}}{${S0.N}} = ${fm(bad)}$, yang terlalu kecil: kelas seperti ${cs(S0.cl[0])} diwakili oleh ${S0.cl[0][0]} dan bukan titik tengahnya ${n(S0.mids[0])}.`), SPM.cat(T('(b) '), midW(S0)[0]), midW(S0)[1], midW(S0)[2], meanLine(S0.sx, S0.N, fm(S0.sx / S0.N))), sp: 'l' };
    },
    /* two tables combined */
    (r) => {
      const g = r.pick(GI), A = gsetM(r, g, 4), fb = A.cl.map(() => r.int(1, 12)), Nb = sum(fb), sb = sum(A.mids.map((m, j) => m * fb[j])), N = A.N + Nb, sx = A.sx + sb;
      const tb = (i) => SPM.table(A.cl.map((c, j) => [cs(c), A.fs[j], fb[j]]), { head: [g.he + '|' + g.hm, 'Group A|Kumpulan A', 'Group B|Kumpulan B'].map((h) => h.split('|')[i]) });
      return { q: T(`The table shows the frequencies of the ${g.en} for two groups.<br>${tb(0)}<br>Estimate the mean for the two groups together, correct to 2 decimal places.`, `Jadual menunjukkan kekerapan ${g.ms} bagi dua kumpulan.<br>${tb(1)}<br>Anggarkan min bagi kedua-dua kumpulan bersama-sama, betul kepada 2 tempat perpuluhan.`), a: T(`$\\dfrac{${n(A.sx)} + ${n(sb)}}{${A.N} + ${Nb}} = ${fm(sx / N)}$`), w: W(T(`Midpoints: $${A.mids.map(n).join(',\\ ')}$`, `Titik tengah: $${A.mids.map(n).join(',\\ ')}$`), SPM.cat(T('Group A: ', 'Kumpulan A: '), fxLine(A.mids.map(n), A.fs, n(A.sx))), T(`$\\sum f = ${A.fs.join(' + ')} = ${A.N}$`), SPM.cat(T('Group B: ', 'Kumpulan B: '), fxLine(A.mids.map(n), fb, n(sb))), T(`$\\sum f = ${fb.join(' + ')} = ${Nb}$`), T(`Estimated mean $= \\dfrac{${n(A.sx)} + ${n(sb)}}{${A.N} + ${Nb}} = \\dfrac{${n(sx)}}{${N}} = ${fm(sx / N)}$`, `Min anggaran $= \\dfrac{${n(A.sx)} + ${n(sb)}}{${A.N} + ${Nb}} = \\dfrac{${n(sx)}}{${N}} = ${fm(sx / N)}$`)), sp: 'l' };
    },
    /* two unknown frequencies: simultaneous equations */
    (r) => {
      const g = r.pick(GI), S0 = gsetM(r, g, 5), [i1, i2] = r.sample([0, 1, 2, 3, 4], 2).sort(), a = S0.fs[i1], b = S0.fs[i2], m = S0.sx / S0.N;
      need(Number.isInteger(m * 10) && S0.N >= 20);
      const sh = S0.fs.map((f, q) => (q === i1 ? '$p$' : q === i2 ? '$q$' : f));
      const tb = (i) => SPM.table(S0.cl.map((c, q) => [cs(c), sh[q]]), { head: [g.he + '|' + g.hm, FQ].map((h) => h.split('|')[i]) });
      const m1 = S0.mids[i1], m2 = S0.mids[i2], S = a + b, rhs = m1 * a + m2 * b;
      return { q: T(`The table shows the ${g.en}. There are ${S0.N} observations and the estimated mean is ${n(m)}.<br>${tb(0)}<br>Find the values of $p$ and $q$.`, `Jadual menunjukkan ${g.ms}. Terdapat ${S0.N} cerapan dan min anggaran ialah ${n(m)}.<br>${tb(1)}<br>Cari nilai $p$ dan $q$.`), a: T(`$p = ${a}$, $q = ${b}$`), w: W(T(`Midpoints: $${S0.mids.map(n).join(',\\ ')}$`, `Titik tengah: $${S0.mids.map(n).join(',\\ ')}$`), T(`$\\sum f = ${S0.fs.map((f, q) => (q === i1 ? 'p' : q === i2 ? 'q' : f)).join(' + ')} = ${S0.N}$, so $p + q = ${S0.N} - ${S0.N - S} = ${S}$`, `$\\sum f = ${S0.fs.map((f, q) => (q === i1 ? 'p' : q === i2 ? 'q' : f)).join(' + ')} = ${S0.N}$, maka $p + q = ${S0.N} - ${S0.N - S} = ${S}$`), T(`$\\sum fx = ${n(m)} \\times ${S0.N} = ${nr(S0.sx)}$`), T(`$${n(m1)}p + ${n(m2)}q = ${nr(S0.sx)} - ${nr(S0.sx - rhs)} = ${nr(rhs)}$`), T(`Substitute $q = ${S} - p$: $${n(m1)}p + ${n(m2)}(${S} - p) = ${nr(rhs)}$`, `Gantikan $q = ${S} - p$: $${n(m1)}p + ${n(m2)}(${S} - p) = ${nr(rhs)}$`), T(`$${cof(round(m1 - m2, 6))}p = ${nr(rhs - m2 * S)}$`), T(`$p = ${a}$, $q = ${S} - ${a} = ${b}$`)), sp: 'xl' };
    },
  ];
  SPM.extend('F2-12.3', { e: ge123, m: gm123, a: ga123 });

  /* ====================================================== F2-12.4 Choosing, predicting and comparing */
  const sp3 = (rows) => rows.map((x) => x.split('|'));
  const MEAS = sp3([
    'the most popular flavour of ice cream that a shop should stock|perisa aiskrim paling popular yang patut distok oleh sebuah kedai|mode|It shows the most common choice.|Ia menunjukkan pilihan yang paling biasa.',
    'the shoe size that a shop should order most of|saiz kasut yang patut ditempah paling banyak oleh sebuah kedai|mode|The most frequent size sells most.|Saiz yang paling kerap dijual paling banyak.',
    'the most popular dish on a canteen menu|hidangan paling popular dalam menu kantin|mode|The data are categories, so only the mode can be used.|Data ialah kategori, maka hanya mod yang boleh digunakan.',
    'a typical house price in a town with a few very expensive mansions|harga rumah biasa di sebuah bandar yang mempunyai beberapa rumah agam yang sangat mahal|median|The extreme prices pull the mean up, but do not affect the median much.|Harga ekstrem menarik min ke atas, tetapi tidak banyak menjejaskan median.',
    'a typical monthly salary in a company where the owner earns much more than the workers|gaji bulanan biasa dalam sebuah syarikat yang pemiliknya berpendapatan jauh lebih tinggi daripada pekerja|median|The owner’s salary is an extreme value that distorts the mean.|Gaji pemilik ialah nilai ekstrem yang menjejaskan min.',
    'a typical waiting time when one customer waited for an unusually long time|masa menunggu biasa apabila seorang pelanggan menunggu terlalu lama|median|One very long time would distort the mean.|Satu masa yang sangat lama akan menjejaskan min.',
    'a typical daily rainfall in a month with one day of flash flood|hujan harian biasa dalam sebulan yang mempunyai satu hari banjir kilat|median|The flood day is an extreme value.|Hari banjir ialah nilai ekstrem.',
    'the average mark of a class where the marks are between 50 and 80 and every mark should count|markah purata sebuah kelas yang markahnya antara 50 dengan 80 dan setiap markah perlu dikira|mean|There are no extreme values and the mean uses every value.|Tiada nilai ekstrem dan min menggunakan setiap nilai.',
    'the average daily sales of a stall, used to estimate the sales for a whole month|jualan harian purata sebuah gerai, untuk menganggar jualan sebulan|mean|Mean × number of days gives the total, so every day must count.|Min × bilangan hari memberikan jumlah, maka setiap hari mesti dikira.',
    'the average mass of the bags of rice on a lorry, to find the total load|jisim purata beg beras dalam sebuah lori, untuk mencari jumlah muatan|mean|Total = mean × number, so all values must be included.|Jumlah = min × bilangan, maka semua nilai mesti dimasukkan.',
    'the average height of the players in a basketball team where the heights are similar|ketinggian purata pemain sebuah pasukan bola keranjang yang ketinggiannya hampir sama|mean|No extreme values, so the mean uses all the information.|Tiada nilai ekstrem, maka min menggunakan semua maklumat.',
    'the colour of school bag that most students prefer|warna beg sekolah yang paling digemari oleh kebanyakan murid|mode|Colours cannot be added, so use the most common one.|Warna tidak boleh ditambah, maka gunakan yang paling biasa.',
  ]);
  const MNAME = { mean: ['mean', 'min'], median: ['median', 'median'], mode: ['mode', 'mod'] };
  /** two-group comparison contexts: names, quantity, direction (1 higher is better, 0 lower is better), value range */
  const CMP = sp3([
    'Aiman|Bala|Aiman|Bala|marks in 6 tests|markah dalam 6 ujian|1|50|95',
    'Machine P|Machine Q|Mesin P|Mesin Q|masses in g of 6 packets of sugar filled by the machine|jisim dalam g bagi 6 paket gula yang diisi oleh mesin|2|240|260',
    'Runner X|Runner Y|Pelari X|Pelari Y|times in seconds in 6 races|masa dalam saat dalam 6 perlumbaan|0|12|17',
    'Farm A|Farm B|Ladang A|Ladang B|eggs collected on 6 days|telur yang dikutip dalam 6 hari|1|40|80',
    'Shop P|Shop Q|Kedai P|Kedai Q|daily sales in RM hundred on 6 days|jualan harian dalam RM ratus dalam 6 hari|1|20|70',
    'Route 1|Route 2|Laluan 1|Laluan 2|travel times in minutes on 6 days|masa perjalanan dalam minit dalam 6 hari|0|20|50',
    'Siti|Farah|Siti|Farah|scores in 6 archery rounds|skor dalam 6 pusingan memanah|1|60|95',
    'Fertiliser A|Fertiliser B|Baja A|Baja B|heights in cm of 6 plants|ketinggian dalam cm bagi 6 pokok|1|20|60',
    'Class 2A|Class 2B|Kelas 2A|Kelas 2B|scores in a general knowledge quiz|skor dalam kuiz pengetahuan am|1|30|90',
    'Stall X|Stall Y|Gerai X|Gerai Y|number of customers served in 6 hours|bilangan pelanggan yang dilayan dalam 6 jam|1|10|45',
  ]).map((c) => ({ e: [c[0], c[1]], m: [c[2], c[3]], q: [c[4], c[5]], hb: +c[6], lo: +c[7], hi: +c[8] }));
  const OUT = sp3([
    'monthly income in RM hundred of 7 people in a village, including one rich landowner|pendapatan bulanan dalam RM ratus bagi 7 orang di sebuah kampung, termasuk seorang tuan tanah kaya|15|30|90|150',
    'prices in RM thousand of 7 houses on a road, including one large bungalow|harga dalam RM ribu bagi 7 buah rumah di sebuah jalan, termasuk sebuah banglo besar|220|320|900|1500',
    'times in minutes that 7 customers waited in a queue, including one very long delay|masa dalam minit 7 orang pelanggan menunggu dalam barisan, termasuk satu kelewatan yang sangat lama|3|9|40|60',
    'number of texts sent in a day by 7 students, including one who sent a very large number|bilangan mesej teks yang dihantar dalam sehari oleh 7 orang murid, termasuk seorang yang menghantar amat banyak|8|25|90|150',
    'daily rainfall in mm on 7 days, including one day of a flash flood|hujan harian dalam mm pada 7 hari, termasuk satu hari banjir kilat|2|15|80|150',
    'ages of 7 members of a badminton club, including the founder who is much older|umur 7 orang ahli sebuah kelab badminton, termasuk pengasas yang jauh lebih tua|14|20|55|70',
  ]).map((o) => ({ en: o[0], ms: o[1], lo: +o[2], hi: +o[3], olo: +o[4], ohi: +o[5] }));
  const withMean = (r, k, m, lo, hi) => retry(() => { const a = Array.from({ length: k - 1 }, () => r.int(lo, hi)), x = m * k - sum(a); need(x >= lo && x <= hi); return r.shuffle(a.concat(x)); }, 300);
  /** two sets for a comparison context: integer means, different means and ranges */
  const cmpSets = (r, c, k) => {
    const K = k || 6, m1 = r.int(c.lo + 8, c.hi - 8), m2 = m1 + r.pick([-3, -2, -1, 1, 2, 3]);
    const A = withMean(r, K, m1, c.lo, c.hi), B = withMean(r, K, m2, c.lo, c.hi);
    need(rg(A) !== rg(B) && Math.abs(rg(A) - rg(B)) >= 3 && rg(A) >= 4 && rg(B) >= 4);
    return { A, B, mA: m1, mB: m2, rA: rg(A), rB: rg(B) };
  };
  const cmpTxt = (c, S0, i) => {
    const nm = c[i ? 'm' : 'e'], hi = S0.mA > S0.mB ? nm[0] : nm[1], sm = S0.rA < S0.rB ? nm[0] : nm[1];
    return i ? `${hi} mempunyai min yang lebih tinggi (${Math.max(S0.mA, S0.mB)} berbanding ${Math.min(S0.mA, S0.mB)}); ${sm} mempunyai julat yang lebih kecil (${Math.min(S0.rA, S0.rB)} berbanding ${Math.max(S0.rA, S0.rB)}), maka lebih konsisten.` : `${hi} has the higher mean (${Math.max(S0.mA, S0.mB)} compared with ${Math.min(S0.mA, S0.mB)}); ${sm} has the smaller range (${Math.min(S0.rA, S0.rB)} compared with ${Math.max(S0.rA, S0.rB)}), so it is more consistent.`;
  };
  const fmn = (x) => (Number.isInteger(x) ? n(x) : fm(x));
  /** 'A: 3 + 4 = 7, mean = 7/2 = 3.5; range = 4 - 3 = 1' */
  const statLine = (en, ms, v) => T(`${en}: $${v.join(' + ')} = ${sum(v)}$, mean $= \\dfrac{${sum(v)}}{${v.length}} = ${fmn(mean(v))}$; range $= ${Math.max(...v)} - ${Math.min(...v)} = ${rg(v)}$`, `${ms}: $${v.join(' + ')} = ${sum(v)}$, min $= \\dfrac{${sum(v)}}{${v.length}} = ${fmn(mean(v))}$; julat $= ${Math.max(...v)} - ${Math.min(...v)} = ${rg(v)}$`);
  const CRIT = sp3([
    'Team A has a smaller range than Team B, so Team A must have scored more points.|Pasukan A mempunyai julat yang lebih kecil daripada Pasukan B, maka Pasukan A mesti menjaringkan lebih banyak mata.|Range measures the spread, not the size of the scores. The means must be compared.|Julat mengukur serakan, bukan saiz skor. Min perlu dibandingkan.',
    'The mean height of 8 students is 158 cm, so every student in the school is about 158 cm tall.|Tinggi min 8 orang murid ialah 158 cm, maka setiap murid di sekolah itu tingginya kira-kira 158 cm.|Eight students are a small sample and the heights vary, so this cannot be claimed for the whole school.|Lapan orang murid ialah sampel yang kecil dan ketinggian berbeza-beza, maka ini tidak boleh dituntut bagi seluruh sekolah.',
    'The mean is higher than the median, so the mean is always the best measure to use.|Min lebih tinggi daripada median, maka min sentiasa ukuran terbaik untuk digunakan.|The best measure depends on the data; extreme values raise the mean, so the median may be more typical.|Ukuran terbaik bergantung pada data; nilai ekstrem menaikkan min, maka median mungkin lebih mewakili.',
    'Ali says: "The mode of the shoe sizes is 7, so the mean shoe size is also 7."|Ali berkata: "Mod saiz kasut ialah 7, maka min saiz kasut juga 7."|The mean and the mode are different measures and are usually not equal.|Min dan mod ialah ukuran yang berbeza dan biasanya tidak sama.',
    'Both groups have a mean mark of 60, so their performances are exactly the same.|Kedua-dua kumpulan mempunyai markah min 60, maka prestasi mereka betul-betul sama.|The spread may differ; one group may have marks that vary widely. The range should also be compared.|Serakan mungkin berbeza; satu kumpulan mungkin mempunyai markah yang sangat berbeza-beza. Julat juga patut dibandingkan.',
    'Sales rose in each of the last 3 days, so sales will certainly keep rising next week.|Jualan meningkat pada setiap satu daripada 3 hari lepas, maka jualan pasti terus meningkat minggu depan.|Three days are too few to be sure; a prediction from data is not a certainty.|Tiga hari terlalu sedikit untuk pasti; ramalan daripada data bukan kepastian.',
  ]);
  const TF4 = [
    ['A smaller range means that the data are less spread out.|Julat yang lebih kecil bermaksud data kurang berserak.', 1, 'The range is the difference between the largest and smallest values.|Julat ialah beza antara nilai terbesar dengan terkecil.'],
    ['Range = smallest value − largest value.|Julat = nilai terkecil − nilai terbesar.', 0, 'The range is the largest value minus the smallest value.|Julat ialah nilai terbesar tolak nilai terkecil.'],
    ['A very large value affects the median more than it affects the mean.|Satu nilai yang sangat besar menjejaskan median lebih daripada min.', 0, 'It pulls the mean up, but the median hardly changes.|Ia menarik min ke atas, tetapi median hampir tidak berubah.'],
    ['Two data sets with the same mean must have the same range.|Dua set data yang mempunyai min yang sama mesti mempunyai julat yang sama.', 0, 'For example 4, 6, 8 and 1, 6, 11 both have mean 6, but their ranges are 4 and 10.|Contohnya 4, 6, 8 dan 1, 6, 11 kedua-duanya bermin 6, tetapi julatnya 4 dan 10.'],
    ['The mode is suitable for describing categories such as favourite colours.|Mod sesuai untuk menghuraikan kategori seperti warna kegemaran.', 1, 'Categories cannot be added or ordered, but they can be counted.|Kategori tidak boleh ditambah atau disusun, tetapi boleh dibilang.'],
  ].map((t) => { const a = t[0].split('|'), b = t[2].split('|'); return [a[0], a[1], t[1], b[0], b[1]]; });
  const ge124 = [
    /* which measure? (open) */
    (r) => {
      const c = r.pick(MEAS);
      return { q: T(`Which measure of central tendency (mean, median or mode) is most suitable for ${c[0]}? Give a reason.`, `Ukuran kecenderungan memusat yang manakah (min, median atau mod) paling sesuai untuk ${c[1]}? Berikan satu sebab.`), a: T(`${cap(MNAME[c[2]][0])}. ${c[3]}`, `${cap(MNAME[c[2]][1])}. ${c[4]}`), w: W(T('Use the mode for categories or "the most common" choice, the median when a few extreme values would distort the mean, and the mean when the values are alike and every value must count.', 'Gunakan mod bagi kategori atau pilihan "yang paling biasa", median apabila beberapa nilai ekstrem akan menjejaskan min, dan min apabila nilai-nilainya hampir sama dan setiap nilai perlu dikira.'), T(`Here: ${c[3]}`, `Di sini: ${c[4]}`), T(`So the ${MNAME[c[2]][0]} is the most suitable.`, `Maka ${MNAME[c[2]][1]} paling sesuai.`)), sp: 's' };
    },
    /* which measure? (MCQ) */
    (r) => {
      const c = r.pick(MEAS), o = r.shuffle(['mean', 'median', 'mode']);
      return { q: T(`A student wants to describe ${c[0]}. Which measure should be used?<br>${o.map((x, i) => `${'ABC'[i]}. ${MNAME[x][0]}`).join('&emsp;')}`, `Seorang murid mahu menghuraikan ${c[1]}. Ukuran manakah yang patut digunakan?<br>${o.map((x, i) => `${'ABC'[i]}. ${MNAME[x][1]}`).join('&emsp;')}`), a: T(`${'ABC'[o.indexOf(c[2])]}. ${MNAME[c[2]][0]}`, `${'ABC'[o.indexOf(c[2])]}. ${MNAME[c[2]][1]}`), w: W(T('Mode for categories or the most common choice; median when extreme values would distort the mean; mean when every value must count.', 'Mod bagi kategori atau pilihan yang paling biasa; median apabila nilai ekstrem akan menjejaskan min; min apabila setiap nilai perlu dikira.'), T(`${c[3]}`, `${c[4]}`), T(`So the answer is ${'ABC'[o.indexOf(c[2])]}, the ${MNAME[c[2]][0]}.`, `Maka jawapannya ialah ${'ABC'[o.indexOf(c[2])]}, ${MNAME[c[2]][1]}.`)), sp: 'xs' };
    },
    /* range of a list */
    (r) => {
      const d = r.pick(DATA), k = r.int(6, 9), v = dl(r, d, k);
      need(rg(v) >= 3);
      return { q: T(`${cap(dsc(d, k, 0))}: ${v.join(', ')}.<br>Find the range of the data.`, `${cap(dsc(d, k, 1))}: ${v.join(', ')}.<br>Cari julat bagi data itu.`), a: T(`$${Math.max(...v)} - ${Math.min(...v)} = ${rg(v)}$`), w: W(T('Range $=$ largest value $-$ smallest value', 'Julat $=$ nilai terbesar $-$ nilai terkecil'), T(`Largest $= ${Math.max(...v)}$, smallest $= ${Math.min(...v)}$`, `Terbesar $= ${Math.max(...v)}$, terkecil $= ${Math.min(...v)}$`), T(`$${Math.max(...v)} - ${Math.min(...v)} = ${rg(v)}$`)), sp: 's' };
    },
    /* range from a frequency table or bar chart */
    (r) => {
      const U = ufSet(r, r.int(5, 6)), z = r.int(0, 1), U2 = { u: U.u, xs: U.xs.slice(), fs: U.fs.slice() };
      const bar = r.chance(0.5);
      U2.fs[0] = z ? 0 : U2.fs[0]; U2.fs[U2.fs.length - 1] = z ? U2.fs[U2.fs.length - 1] : U2.fs[U2.fs.length - 1];
      const nz = U2.xs.filter((_, i) => U2.fs[i] > 0);
      return { q: T(`The ${bar ? 'bar chart' : 'table'} shows the ${dsc(U.u, sum(U2.fs), 0)}.<br>${bar ? '' : ufTab(0, U2)}Find the range of the data.`, `${bar ? 'Carta palang' : 'Jadual'} menunjukkan ${dsc(U.u, sum(U2.fs), 1)}.<br>${bar ? '' : ufTab(1, U2)}Cari julat bagi data itu.`), fig: bar ? barFig(U2) : undefined, a: T(`$${nz[nz.length - 1]} - ${nz[0]} = ${nz[nz.length - 1] - nz[0]}$`), w: W(T(`Only the values with a frequency of at least 1 occur: $${nz.join(',\\ ')}$`, `Hanya nilai yang mempunyai kekerapan sekurang-kurangnya 1 berlaku: $${nz.join(',\\ ')}$`), T(`Range $= ${nz[nz.length - 1]} - ${nz[0]} = ${nz[nz.length - 1] - nz[0]}$`, `Julat $= ${nz[nz.length - 1]} - ${nz[0]} = ${nz[nz.length - 1] - nz[0]}$`), T('The range uses the data values, not the frequencies.', 'Julat menggunakan nilai data, bukan kekerapan.')), sp: 's' };
    },
    /* true or false */
    (r) => {
      const t = r.pick(TF4);
      return { q: T(`True or false? Give a reason.<br>"${t[0]}"`, `Benar atau palsu? Berikan sebab.<br>"${t[1]}"`), a: T(`${t[2] ? 'True' : 'False'}. ${t[3]}`, `${t[2] ? 'Benar' : 'Palsu'}. ${t[4]}`), w: W(T(t[2] ? 'Check the statement against the meaning of range and of the measures of central tendency.' : 'Check the statement against the definitions — one counterexample is enough to make it false.', t[2] ? 'Semak pernyataan itu dengan maksud julat dan ukuran kecenderungan memusat.' : 'Semak pernyataan itu dengan takrifnya — satu contoh penyangkal sudah cukup untuk menjadikannya palsu.'), T(t[3], t[4]), T(t[2] ? 'So the statement is true.' : 'So the statement is false.', t[2] ? 'Maka pernyataan itu benar.' : 'Maka pernyataan itu palsu.')), sp: 's' };
    },
    /* compare given means and ranges */
    (r) => {
      const c = r.pick(CMP), S0 = cmpSets(r, c), md = c.hb === 2 ? 1 : 0;
      return { q: T(`The ${c.q[0]} of ${c.e[0]} have a mean of ${S0.mA} and a range of ${S0.rA}. For ${c.e[1]}, the mean is ${S0.mB} and the range is ${S0.rB}.<br>Which one has the more consistent results? Give a reason.`, `${cap(c.q[1])} bagi ${c.m[0]} mempunyai min ${S0.mA} dan julat ${S0.rA}. Bagi ${c.m[1]}, min ialah ${S0.mB} dan julat ialah ${S0.rB}.<br>Yang manakah mempunyai keputusan yang lebih konsisten? Berikan sebab.`), a: T(`${S0.rA < S0.rB ? c.e[0] : c.e[1]}: the smaller range (${Math.min(S0.rA, S0.rB)}) means the values are less spread out.`, `${S0.rA < S0.rB ? c.m[0] : c.m[1]}: julat yang lebih kecil (${Math.min(S0.rA, S0.rB)}) bermaksud nilai kurang berserak.`), w: W(T('Consistency is about spread, so compare the ranges, not the means.', 'Kekonsistenan berkaitan serakan, maka bandingkan julat, bukan min.'), T(`$${Math.min(S0.rA, S0.rB)} < ${Math.max(S0.rA, S0.rB)}$`), T(`${S0.rA < S0.rB ? c.e[0] : c.e[1]} has the smaller range, so its results are more consistent.`, `${S0.rA < S0.rB ? c.m[0] : c.m[1]} mempunyai julat yang lebih kecil, maka keputusannya lebih konsisten.`)), sp: 's' };
    },
    /* the measure most affected by a very large value */
    (r) => {
      const v = Array.from({ length: 5 }, () => r.int(4, 9)), big = r.int(40, 90), all = v.concat([big]);
      need(median(v) !== sum(v) / 5);
      return { q: T(`A set of data is $${list(all)}$. Which of the mean, median and mode is changed most by the value ${big}? Find the mean and median of the data with and without ${big}.`, `Satu set data ialah $${list(all)}$. Antara min, median dan mod, yang manakah paling terjejas oleh nilai ${big}? Cari min dan median data itu dengan dan tanpa ${big}.`), a: T(`With: mean $${fm(mean(all))}$, median $${n(median(all))}$; without: mean $${fm(mean(v))}$, median $${n(median(v))}$. The mean is affected most.`, `Dengan: min $${fm(mean(all))}$, median $${n(median(all))}$; tanpa: min $${fm(mean(v))}$, median $${n(median(v))}$. Min paling terjejas.`), w: W(T(`With ${big}: $${all.join(' + ')} = ${sum(all)}$, mean $= \\dfrac{${sum(all)}}{6} = ${fm(mean(all))}$`, `Dengan ${big}: $${all.join(' + ')} = ${sum(all)}$, min $= \\dfrac{${sum(all)}}{6} = ${fm(mean(all))}$`), T(`In order: $${list(sortNum(all))}$, median $= ${n(median(all))}$`, `Mengikut tertib: $${list(sortNum(all))}$, median $= ${n(median(all))}$`), T(`Without ${big}: $${v.join(' + ')} = ${sum(v)}$, mean $= \\dfrac{${sum(v)}}{5} = ${fm(mean(v))}$; median $= ${n(median(v))}$`, `Tanpa ${big}: $${v.join(' + ')} = ${sum(v)}$, min $= \\dfrac{${sum(v)}}{5} = ${fm(mean(v))}$; median $= ${n(median(v))}$`), T(`The mean changes by $${fm(Math.abs(mean(all) - mean(v)))}$ but the median only by $${n(Math.abs(median(all) - median(v)))}$, and the mode is unchanged because ${big} occurs only once.`, `Min berubah sebanyak $${fm(Math.abs(mean(all) - mean(v)))}$ tetapi median hanya $${n(Math.abs(median(all) - median(v)))}$, dan mod tidak berubah kerana ${big} berlaku sekali sahaja.`)), sp: 'm' };
    },
  ];
  const gm124 = [
    /* compare two data sets: mean and range */
    (r) => {
      const c = r.pick(CMP), S0 = cmpSets(r, c);
      return { q: T(`The ${c.q[0]} of ${c.e[0]} and ${c.e[1]} are:<br>${c.e[0]}: ${S0.A.join(', ')}<br>${c.e[1]}: ${S0.B.join(', ')}<br>Find the mean and the range for each, and state who has the more consistent results.`, `${cap(c.q[1])} bagi ${c.m[0]} dan ${c.m[1]} ialah:<br>${c.m[0]}: ${S0.A.join(', ')}<br>${c.m[1]}: ${S0.B.join(', ')}<br>Cari min dan julat bagi setiap satu, dan nyatakan siapa yang mempunyai keputusan yang lebih konsisten.`), a: T(`${c.e[0]}: mean ${S0.mA}, range ${S0.rA}; ${c.e[1]}: mean ${S0.mB}, range ${S0.rB}. ${cmpTxt(c, S0, 0)}`, `${c.m[0]}: min ${S0.mA}, julat ${S0.rA}; ${c.m[1]}: min ${S0.mB}, julat ${S0.rB}. ${cmpTxt(c, S0, 1)}`), w: W(statLine(c.e[0], c.m[0], S0.A), statLine(c.e[1], c.m[1], S0.B), T(`The means are ${S0.mA} and ${S0.mB}; the ranges are ${S0.rA} and ${S0.rB}.`, `Minnya ialah ${S0.mA} dan ${S0.mB}; julatnya ialah ${S0.rA} dan ${S0.rB}.`), T(`A smaller range means less spread, so ${S0.rA < S0.rB ? c.e[0] : c.e[1]} is the more consistent.`, `Julat yang lebih kecil bermaksud kurang serakan, maka ${S0.rA < S0.rB ? c.m[0] : c.m[1]} lebih konsisten.`)), sp: 'l' };
    },
    /* one very large value: mean vs median */
    (r) => {
      const o = r.pick(OUT), v = Array.from({ length: 6 }, () => r.int(o.lo, o.hi)), big = r.int(o.olo, o.ohi), all = r.shuffle(v.concat([big]));
      need(new Set(v).size >= 5);
      return { q: T(`The ${o.en}: ${all.join(', ')}.<br>(a) Find the mean and the median.<br>(b) Which measure describes a typical value better? Explain.`, `${cap(o.ms)}: ${all.join(', ')}.<br>(a) Cari min dan median.<br>(b) Ukuran manakah yang menggambarkan nilai biasa dengan lebih baik? Terangkan.`), a: SPM.parts([T(`Mean $= ${fm(mean(all))}$; median $= ${n(median(all))}$`, `Min $= ${fm(mean(all))}$; median $= ${n(median(all))}$`), T(`The median. The extreme value ${big} pulls the mean up to ${fm(mean(all))}, which is greater than all the other values.`, `Median. Nilai ekstrem ${big} menarik min naik kepada ${fm(mean(all))}, yang lebih besar daripada semua nilai lain.`)]), w: W(T(`(a) $${all.join(' + ')} = ${sum(all)}$, so the mean is $\\dfrac{${sum(all)}}{7} = ${fm(mean(all))}$.`, `(a) $${all.join(' + ')} = ${sum(all)}$, maka min ialah $\\dfrac{${sum(all)}}{7} = ${fm(mean(all))}$.`), T(`In order: $${list(sortNum(all))}$`, `Mengikut tertib: $${list(sortNum(all))}$`), medLine(7, median(all)), T(`(b) Six of the seven values lie between ${Math.min(...v)} and ${Math.max(...v)}, but ${big} is far above them.`, `(b) Enam daripada tujuh nilai terletak antara ${Math.min(...v)} dengan ${Math.max(...v)}, tetapi ${big} jauh lebih tinggi.`), T(`That one value pulls the mean up to ${fm(mean(all))}; the median ${n(median(all))} still sits among the other values, so it describes a typical value better.`, `Satu nilai itu menarik min naik kepada ${fm(mean(all))}; median ${n(median(all))} masih berada dalam kalangan nilai lain, maka ia menggambarkan nilai biasa dengan lebih baik.`)), sp: 'l' };
    },
    /* predict from the mean */
    (r) => {
      const c = r.pick([['a stall sells an average of', 'sebuah gerai menjual purata', 'nasi lemak packets a day', 'bungkus nasi lemak sehari', 'nasi lemak packets', 'bungkus nasi lemak'], ['a library is visited by an average of', 'sebuah perpustakaan dikunjungi oleh purata', 'students a day', 'orang murid sehari', 'visitors', 'pengunjung'], ['a farm collects an average of', 'sebuah ladang mengutip purata', 'eggs a day', 'biji telur sehari', 'eggs', 'biji telur'], ['a car park has an average of', 'sebuah tempat letak kereta menerima purata', 'cars a day', 'kereta sehari', 'cars', 'kereta']]), m = r.int(20, 90), days = r.pick([7, 14, 30]);
      return { q: T(`Over 10 days, ${c[0]} ${m} ${c[2]}. Use the mean to predict the number of ${c[4]} in ${days} days. Give one reason why the prediction may not be exact.`, `Dalam tempoh 10 hari, ${c[1]} ${m} ${c[3]}. Gunakan min untuk meramalkan bilangan ${c[5]} dalam ${days} hari. Berikan satu sebab mengapa ramalan itu mungkin tidak tepat.`), a: T(`$${m} \\times ${days} = ${m * days}$. The daily numbers vary and the next days may differ from the 10 days observed.`, `$${m} \\times ${days} = ${m * days}$. Bilangan harian berbeza-beza dan hari-hari seterusnya mungkin berbeza daripada 10 hari yang dicerap.`), w: W(T('Total $=$ mean $\\times$ number of days.', 'Jumlah $=$ min $\\times$ bilangan hari.'), T(`$${m} \\times ${days} = ${m * days}$`), T('A mean of 10 days is only an estimate of what happens next: the daily figures vary, and weather, holidays or promotions can change them.', 'Min bagi 10 hari hanyalah anggaran bagi apa yang akan berlaku seterusnya: angka harian berbeza-beza, dan cuaca, cuti atau promosi boleh mengubahnya.')), sp: 's' };
    },
    /* choose a person / team with evidence */
    (r) => {
      const c = r.pick(CMP.filter((x) => x.hb !== 2)), S0 = cmpSets(r, c), k = 6;
      const better = (c.hb === 1 ? S0.mA > S0.mB : S0.mA < S0.mB) ? c.e[0] : c.e[1], bm = (c.hb === 1 ? S0.mA > S0.mB : S0.mA < S0.mB) ? c.m[0] : c.m[1];
      return { q: T(`The ${c.q[0]} of ${c.e[0]} and ${c.e[1]} are:<br>${c.e[0]}: ${S0.A.join(', ')}<br>${c.e[1]}: ${S0.B.join(', ')}<br>Only one can be chosen for a competition. Using the mean and the range, decide who should be chosen and give your reasons.`, `${cap(c.q[1])} bagi ${c.m[0]} dan ${c.m[1]} ialah:<br>${c.m[0]}: ${S0.A.join(', ')}<br>${c.m[1]}: ${S0.B.join(', ')}<br>Hanya seorang boleh dipilih untuk suatu pertandingan. Dengan menggunakan min dan julat, tentukan siapa yang patut dipilih dan berikan sebab anda.`), a: T(`${c.e[0]}: mean ${S0.mA}, range ${S0.rA}; ${c.e[1]}: mean ${S0.mB}, range ${S0.rB}. ${better} has the ${c.hb === 1 ? 'higher' : 'lower'} mean, which is better here; ${cmpTxt(c, S0, 0).split('; ')[1]} Choose ${better} if the typical level matters most; another choice is acceptable if it is supported by these numbers.`, `${c.m[0]}: min ${S0.mA}, julat ${S0.rA}; ${c.m[1]}: min ${S0.mB}, julat ${S0.rB}. ${bm} mempunyai min yang ${c.hb === 1 ? 'lebih tinggi' : 'lebih rendah'}, yang lebih baik di sini; ${cmpTxt(c, S0, 1).split('; ')[1]} Pilih ${bm} jika tahap biasa paling penting; pilihan lain diterima jika disokong oleh angka-angka ini.`), w: W(statLine(c.e[0], c.m[0], S0.A), statLine(c.e[1], c.m[1], S0.B), T(`Here a ${c.hb === 1 ? 'higher' : 'lower'} value is better, and $${c.hb === 1 ? Math.max(S0.mA, S0.mB) + ' > ' + Math.min(S0.mA, S0.mB) : Math.min(S0.mA, S0.mB) + ' < ' + Math.max(S0.mA, S0.mB)}$, so ${better} has the better mean.`, `Di sini nilai yang ${c.hb === 1 ? 'lebih tinggi' : 'lebih rendah'} lebih baik, dan $${c.hb === 1 ? Math.max(S0.mA, S0.mB) + ' > ' + Math.min(S0.mA, S0.mB) : Math.min(S0.mA, S0.mB) + ' < ' + Math.max(S0.mA, S0.mB)}$, maka ${bm} mempunyai min yang lebih baik.`), T(`The ranges are ${S0.rA} and ${S0.rB}, so ${S0.rA < S0.rB ? c.e[0] : c.e[1]} is the more consistent; state which of the two reasons you use.`, `Julatnya ialah ${S0.rA} dan ${S0.rB}, maka ${S0.rA < S0.rB ? c.m[0] : c.m[1]} lebih konsisten; nyatakan sebab yang mana anda gunakan.`)), sp: 'l' };
    },
    /* critique a statement */
    (r) => {
      const c = r.pick(CRIT);
      return { q: T(`A student makes this statement. Is it a good conclusion? Explain.<br>"${c[0]}"`, `Seorang murid membuat pernyataan ini. Adakah ia satu kesimpulan yang baik? Terangkan.<br>"${c[1]}"`), a: T(`No. ${c[2]}`, `Tidak. ${c[3]}`), w: W(T('Check what the measure quoted actually tells you, and whether the data support such a wide conclusion.', 'Semak apa yang sebenarnya ditunjukkan oleh ukuran yang dipetik, dan sama ada data menyokong kesimpulan yang seluas itu.'), T(c[2], c[3]), T('So the conclusion is not justified.', 'Maka kesimpulan itu tidak berasas.')), sp: 's' };
    },
    /* categorical data: mode */
    (r) => {
      const { c, its, fs } = catData(r, r.pick([20, 25, 40]), r.int(4, 5)), N = sum(fs), mx = Math.max(...fs);
      need(uniqMax(fs));
      const tb = (i) => tabL(i, its.map((x, j) => [x[i], fs[j]]), [CT, FQ]);
      return { q: T(`${N} students were asked about their ${c.en}.<br>${tb(0)}<br>(a) Which choice should a canteen or school shop provide the most of? Use a suitable measure.<br>(b) Why is the mean not suitable for this data?`, `${N} orang murid ditanya tentang ${c.ms} mereka.<br>${tb(1)}<br>(a) Pilihan manakah yang patut disediakan paling banyak oleh kantin atau kedai sekolah? Gunakan ukuran yang sesuai.<br>(b) Mengapakah min tidak sesuai untuk data ini?`), a: SPM.parts([T(`${its[fs.indexOf(mx)][0]} (the mode, frequency ${mx})`, `${its[fs.indexOf(mx)][1]} (mod, kekerapan ${mx})`), T('The data are categories, not numbers, so they cannot be added and divided.', 'Data ialah kategori, bukan nombor, maka tidak boleh ditambah dan dibahagi.')]), w: W(T(`(a) Compare the frequencies $${fs.join(',\\ ')}$; the largest is $${mx}$.`, `(a) Bandingkan kekerapan $${fs.join(',\\ ')}$; yang terbesar ialah $${mx}$.`), T(`The modal choice is ${its[fs.indexOf(mx)][0]}, so that is the one to provide most of.`, `Pilihan mod ialah ${its[fs.indexOf(mx)][1]}, maka itulah yang patut disediakan paling banyak.`), T(`(b) The answers are ${c.en} — categories, not numbers. They cannot be added up and divided, so no mean exists here; only the mode can be used.`, `(b) Jawapannya ialah ${c.ms} — kategori, bukan nombor. Ia tidak boleh ditambah dan dibahagi, maka tiada min di sini; hanya mod boleh digunakan.`)), sp: 'm' };
    },
    /* frequency table: mean, mode and range */
    (r) => {
      const U = ufSet(r, 5), mx = Math.max(...U.fs);
      need(uniqMax(U.fs) && U.sx % U.N === 0);
      return { q: T(`The table shows the ${dsc(U.u, U.N, 0)}.<br>${ufTab(0, U)}<br>Find the mode, the mean and the range.`, `Jadual menunjukkan ${dsc(U.u, U.N, 1)}.<br>${ufTab(1, U)}<br>Cari mod, min dan julat.`), a: T(`Mode $= ${U.xs[U.fs.indexOf(mx)]}$; mean $= ${U.sx / U.N}$; range $= ${U.xs[4] - U.xs[0]}$`, `Mod $= ${U.xs[U.fs.indexOf(mx)]}$; min $= ${U.sx / U.N}$; julat $= ${U.xs[4] - U.xs[0]}$`), w: W(T(`Mode: the largest frequency is $${mx}$, under the value ${U.xs[U.fs.indexOf(mx)]}.`, `Mod: kekerapan terbesar ialah $${mx}$, di bawah nilai ${U.xs[U.fs.indexOf(mx)]}.`), fxLine(U.xs, U.fs, U.sx), T(`$\\sum f = ${U.fs.join(' + ')} = ${U.N}$`), T(`Mean $= \\dfrac{${U.sx}}{${U.N}} = ${U.sx / U.N}$`, `Min $= \\dfrac{${U.sx}}{${U.N}} = ${U.sx / U.N}$`), T(`Range $= ${U.xs[4]} - ${U.xs[0]} = ${U.xs[4] - U.xs[0]}$ (largest value $-$ smallest value)`, `Julat $= ${U.xs[4]} - ${U.xs[0]} = ${U.xs[4] - U.xs[0]}$ (nilai terbesar $-$ nilai terkecil)`)), sp: 'm' };
    },
  ];
  const ga124 = [
    /* three data sets */
    (r) => {
      const c = r.pick(CMP.filter((x) => x.hb === 1)), K = 6, ms = r.sample([c.lo + 12, c.lo + 15, c.lo + 18, c.lo + 21, c.lo + 9], 3), sets = ms.map((m) => withMean(r, K, m, c.lo, c.hi)), rgs = sets.map(rg);
      need(new Set(rgs).size === 3 && new Set(ms).size === 3);
      const nm = ['A', 'B', 'C'], iH = ms.indexOf(Math.max(...ms)), iC = rgs.indexOf(Math.min(...rgs));
      return { q: T(`Three groups A, B and C recorded the ${c.q[0]}.<br>A: ${sets[0].join(', ')}<br>B: ${sets[1].join(', ')}<br>C: ${sets[2].join(', ')}<br>(a) Find the mean and the range of each group.<br>(b) Which group has the highest typical value, and which is the most consistent? Is it possible that they are the same group? Explain.`, `Tiga kumpulan A, B dan C merekodkan ${c.q[1]}.<br>A: ${sets[0].join(', ')}<br>B: ${sets[1].join(', ')}<br>C: ${sets[2].join(', ')}<br>(a) Cari min dan julat bagi setiap kumpulan.<br>(b) Kumpulan manakah yang mempunyai nilai biasa tertinggi, dan yang manakah paling konsisten? Adakah kedua-duanya mungkin kumpulan yang sama? Terangkan.`), a: SPM.parts([T(nm.map((x, i) => `${x}: mean ${ms[i]}, range ${rgs[i]}`).join('; '), nm.map((x, i) => `${x}: min ${ms[i]}, julat ${rgs[i]}`).join('; ')), T(`Highest mean: ${nm[iH]}. Smallest range (most consistent): ${nm[iC]}. ${iH === iC ? 'They are the same group.' : 'They are different groups: a high mean does not guarantee small spread.'}`, `Min tertinggi: ${nm[iH]}. Julat terkecil (paling konsisten): ${nm[iC]}. ${iH === iC ? 'Kedua-duanya kumpulan yang sama.' : 'Kedua-duanya kumpulan yang berbeza: min yang tinggi tidak menjamin serakan yang kecil.'}`)]), w: W(SPM.cat(T('(a) ', '(a) '), statLine('A', 'A', sets[0])), statLine('B', 'B', sets[1]), statLine('C', 'C', sets[2]), T(`(b) Means: ${ms.join(', ')} — the highest is ${Math.max(...ms)}, group ${nm[iH]}.`, `(b) Min: ${ms.join(', ')} — yang tertinggi ialah ${Math.max(...ms)}, kumpulan ${nm[iH]}.`), T(`Ranges: ${rgs.join(', ')} — the smallest is ${Math.min(...rgs)}, group ${nm[iC]}.`, `Julat: ${rgs.join(', ')} — yang terkecil ialah ${Math.min(...rgs)}, kumpulan ${nm[iC]}.`), T(iH === iC ? 'Here they happen to be the same group: it has both the highest typical value and the smallest spread.' : 'They are different groups here — the mean measures the level and the range measures the spread, so one group can win on one and lose on the other. The same group can also win both.', iH === iC ? 'Di sini kedua-duanya kebetulan kumpulan yang sama: ia mempunyai nilai biasa tertinggi dan serakan terkecil.' : 'Di sini kedua-duanya kumpulan yang berbeza — min mengukur tahap dan julat mengukur serakan, maka satu kumpulan boleh menang pada satu dan kalah pada yang lain. Kumpulan yang sama juga boleh menang kedua-duanya.')), sp: 'xl' };
    },
    /* mean vs median: what does it suggest? */
    (r) => {
      const o = r.pick(OUT), v = Array.from({ length: 6 }, () => r.int(o.lo, o.hi)), big = r.int(o.olo, o.ohi), all = r.shuffle(v.concat([big])), mn = mean(all), md = median(all);
      const idx = r.int(0, 1);
      return { q: T(`The ${o.en}: ${all.join(', ')}.<br>(a) Calculate the mean, the median and the range.<br>(b) The mean is much greater than the median. What does this tell you about the data?<br>(c) A report should give a typical value for the group. Which measure should it use, and what is the effect on the range if ${big} is left out?`, `${cap(o.ms)}: ${all.join(', ')}.<br>(a) Hitung min, median dan julat.<br>(b) Min jauh lebih besar daripada median. Apakah yang ditunjukkan oleh perkara ini tentang data itu?<br>(c) Satu laporan patut memberikan nilai biasa bagi kumpulan itu. Ukuran manakah yang patut digunakan, dan apakah kesan ke atas julat jika ${big} ditinggalkan?`), a: SPM.parts([T(`Mean $${fm(mn)}$, median $${n(md)}$, range $${rg(all)}$`, `Min $${fm(mn)}$, median $${n(md)}$, julat $${rg(all)}$`), T('There is an extreme high value that pulls the mean up.', 'Terdapat satu nilai ekstrem yang tinggi yang menarik min ke atas.'), T(`The median. Without ${big} the range becomes ${rg(v)} (from ${rg(all)}).`, `Median. Tanpa ${big}, julat menjadi ${rg(v)} (daripada ${rg(all)}).`)]), w: W(T(`(a) $${all.join(' + ')} = ${sum(all)}$, mean $= \\dfrac{${sum(all)}}{7} = ${fm(mn)}$`, `(a) $${all.join(' + ')} = ${sum(all)}$, min $= \\dfrac{${sum(all)}}{7} = ${fm(mn)}$`), T(`In order: $${list(sortNum(all))}$, median $= ${n(md)}$, range $= ${Math.max(...all)} - ${Math.min(...all)} = ${rg(all)}$`, `Mengikut tertib: $${list(sortNum(all))}$, median $= ${n(md)}$, julat $= ${Math.max(...all)} - ${Math.min(...all)} = ${rg(all)}$`), T(`(b) $${fm(mn)} > ${n(md)}$: one value, ${big}, is far above the rest and pulls the mean up.`, `(b) $${fm(mn)} > ${n(md)}$: satu nilai, iaitu ${big}, jauh lebih tinggi daripada yang lain dan menarik min ke atas.`), T(`(c) The median is not affected by that one value, so use the median. Without ${big} the range falls from $${rg(all)}$ to $${Math.max(...v)} - ${Math.min(...v)} = ${rg(v)}$.`, `(c) Median tidak terjejas oleh nilai itu, maka gunakan median. Tanpa ${big}, julat turun daripada $${rg(all)}$ kepada $${Math.max(...v)} - ${Math.min(...v)} = ${rg(v)}$.`)), sp: 'xl' };
    },
    /* sampling claims */
    (r) => {
      const k = r.pick([8, 10, 12]), N = r.pick([200, 300, 400, 500]), m = r.int(15, 40), c = r.pick([['time in minutes that students take to travel to school', 'masa dalam minit yang diambil oleh murid untuk ke sekolah'], ['number of hours students spend on their phones each week', 'bilangan jam murid menggunakan telefon setiap minggu'], ['pocket money in RM that students bring', 'wang saku dalam RM yang dibawa oleh murid']]);
      return { q: T(`Ravi asks ${k} students from Form 2A about the ${c[0]}. The mean of their answers is ${m}. He writes: "All ${N} students in the school have a mean of ${m}." Comment on his conclusion and suggest how to make it more reliable.`, `Ravi bertanya kepada ${k} orang murid Tingkatan 2A tentang ${c[1]}. Min jawapan mereka ialah ${m}. Dia menulis: "Semua ${N} orang murid di sekolah itu mempunyai min ${m}." Berikan ulasan tentang kesimpulannya dan cadangkan cara untuk menjadikannya lebih boleh dipercayai.`), a: T(`The mean ${m} describes only the ${k} students asked. They may not represent all ${N} students. A larger random sample from every form would give a more reliable estimate.`, `Min ${m} hanya menggambarkan ${k} orang murid yang ditanya. Mereka mungkin tidak mewakili semua ${N} orang murid. Sampel rawak yang lebih besar daripada setiap tingkatan akan memberikan anggaran yang lebih boleh dipercayai.`), w: W(T(`The sample is $${k}$ out of $${N}$ students, all from one class.`, `Sampelnya ialah $${k}$ daripada $${N}$ orang murid, semuanya daripada satu kelas.`), T(`So the mean ${m} describes those ${k} students only; another class could easily give a different mean.`, `Maka min ${m} hanya menggambarkan ${k} orang murid itu; kelas lain mudah memberikan min yang berbeza.`), T('To make it reliable: take a larger sample, chosen at random from every class and every form.', 'Untuk menjadikannya boleh dipercayai: ambil sampel yang lebih besar, dipilih secara rawak daripada setiap kelas dan setiap tingkatan.')), sp: 'm' };
    },
    /* two shops: mean, median, range */
    (r) => {
      const c = r.pick(['daily sales in RM hundred|jualan harian dalam RM ratus'.split('|'), 'number of customers per day|bilangan pelanggan sehari'.split('|')]), K = 7, m1 = r.int(30, 50), A = withMean(r, K, m1, 15, 85), B = withMean(r, K, m1 + r.int(1, 3), 15, 85);
      need(median(A) !== median(B) && rg(A) !== rg(B) && Math.abs(mean(A) - mean(B)) > 0);
      const nA = 'Shop A', nB = 'Shop B';
      return { q: T(`The ${c[0]} of Shop A and Shop B for 7 days are:<br>Shop A: ${A.join(', ')}<br>Shop B: ${B.join(', ')}<br>(a) Find the mean, median and range of each shop.<br>(b) A trader wants to rent the shop with the higher typical sales. Which shop should he choose? Support your answer with numbers.`, `${cap(c[1])} bagi Kedai A dan Kedai B selama 7 hari ialah:<br>Kedai A: ${A.join(', ')}<br>Kedai B: ${B.join(', ')}<br>(a) Cari min, median dan julat bagi setiap kedai.<br>(b) Seorang peniaga mahu menyewa kedai yang mempunyai jualan biasa yang lebih tinggi. Kedai manakah yang patut dipilihnya? Sokong jawapan anda dengan angka.`), a: SPM.parts([T(`A: mean ${fm(mean(A))}, median ${n(median(A))}, range ${rg(A)}; B: mean ${fm(mean(B))}, median ${n(median(B))}, range ${rg(B)}`, `A: min ${fm(mean(A))}, median ${n(median(A))}, julat ${rg(A)}; B: min ${fm(mean(B))}, median ${n(median(B))}, julat ${rg(B)}`), T(`Shop ${mean(A) > mean(B) ? 'A' : 'B'} has the higher mean and Shop ${median(A) > median(B) ? 'A' : 'B'} the higher median; a choice is acceptable if it is justified with these values (e.g. also consider the smaller range: Shop ${rg(A) < rg(B) ? 'A' : 'B'}).`, `Kedai ${mean(A) > mean(B) ? 'A' : 'B'} mempunyai min yang lebih tinggi dan Kedai ${median(A) > median(B) ? 'A' : 'B'} median yang lebih tinggi; pilihan diterima jika dijustifikasikan dengan nilai-nilai ini (contohnya pertimbangkan juga julat yang lebih kecil: Kedai ${rg(A) < rg(B) ? 'A' : 'B'}).`)]), w: W(SPM.cat(T('(a) ', '(a) '), statLine('Shop A', 'Kedai A', A)), T(`In order: $${list(sortNum(A))}$, median $= ${n(median(A))}$`, `Mengikut tertib: $${list(sortNum(A))}$, median $= ${n(median(A))}$`), statLine('Shop B', 'Kedai B', B), T(`In order: $${list(sortNum(B))}$, median $= ${n(median(B))}$`, `Mengikut tertib: $${list(sortNum(B))}$, median $= ${n(median(B))}$`), T(`(b) Mean: $${fmn(mean(A))}$ against $${fmn(mean(B))}$; median: $${n(median(A))}$ against $${n(median(B))}$.`, `(b) Min: $${fmn(mean(A))}$ berbanding $${fmn(mean(B))}$; median: $${n(median(A))}$ berbanding $${n(median(B))}$.`), T(`Shop ${mean(A) > mean(B) ? 'A' : 'B'} has the higher mean and Shop ${median(A) > median(B) ? 'A' : 'B'} the higher median; quote the figures you rely on, and mention the smaller range (Shop ${rg(A) < rg(B) ? 'A' : 'B'}) as extra evidence.`, `Kedai ${mean(A) > mean(B) ? 'A' : 'B'} mempunyai min yang lebih tinggi dan Kedai ${median(A) > median(B) ? 'A' : 'B'} median yang lebih tinggi; petik angka yang anda gunakan, dan sebut julat yang lebih kecil (Kedai ${rg(A) < rg(B) ? 'A' : 'B'}) sebagai bukti tambahan.`)), sp: 'l' };
    },
    /* unknown value so that means agree, then compare ranges */
    (r) => {
      const c = r.pick(CMP.filter((x) => x.hb !== 2)), K = 5, m = r.int(c.lo + 10, c.hi - 10), A = withMean(r, K, m, c.lo, c.hi), rest = Array.from({ length: K - 1 }, () => r.int(c.lo, c.hi)), x = m * K - sum(rest);
      need(x >= c.lo && x <= c.hi && rg(A) !== rg(rest.concat([x])));
      const B = rest.concat([x]);
      return { q: T(`The ${c.q[0].replace('6', '5')} of ${c.e[0]} are ${A.join(', ')}. For ${c.e[1]} they are ${rest.join(', ')} and $x$. The two mean values are equal.<br>(a) Find the value of $x$.<br>(b) Find the range of each set and say which is more consistent.`, `${cap(c.q[1].replace('6', '5'))} bagi ${c.m[0]} ialah ${A.join(', ')}. Bagi ${c.m[1]} ialah ${rest.join(', ')} dan $x$. Kedua-dua nilai min itu sama.<br>(a) Cari nilai $x$.<br>(b) Cari julat bagi setiap set dan nyatakan yang mana lebih konsisten.`), a: SPM.parts([T(`$x = ${m} \\times ${K} - ${sum(rest)} = ${x}$`), T(`${c.e[0]}: ${rg(A)}; ${c.e[1]}: ${rg(B)}. ${rg(A) < rg(B) ? c.e[0] : c.e[1]} is more consistent.`, `${c.m[0]}: ${rg(A)}; ${c.m[1]}: ${rg(B)}. ${rg(A) < rg(B) ? c.m[0] : c.m[1]} lebih konsisten.`)]), w: W(T(`(a) Mean of ${c.e[0]} $= \\dfrac{${A.join(' + ')}}{${K}} = \\dfrac{${sum(A)}}{${K}} = ${m}$`, `(a) Min bagi ${c.m[0]} $= \\dfrac{${A.join(' + ')}}{${K}} = \\dfrac{${sum(A)}}{${K}} = ${m}$`), T(`The second set has the same mean, so its total is also $${m} \\times ${K} = ${m * K}$.`, `Set kedua mempunyai min yang sama, maka jumlahnya juga $${m} \\times ${K} = ${m * K}$.`), T(`$x = ${m * K} - (${rest.join(' + ')}) = ${m * K} - ${sum(rest)} = ${x}$`), T(`(b) ${c.e[0]}: $${Math.max(...A)} - ${Math.min(...A)} = ${rg(A)}$; ${c.e[1]}: $${Math.max(...B)} - ${Math.min(...B)} = ${rg(B)}$`, `(b) ${c.m[0]}: $${Math.max(...A)} - ${Math.min(...A)} = ${rg(A)}$; ${c.m[1]}: $${Math.max(...B)} - ${Math.min(...B)} = ${rg(B)}$`), T(`Equal means, but the smaller range belongs to ${rg(A) < rg(B) ? c.e[0] : c.e[1]}, which is therefore more consistent.`, `Min sama, tetapi julat yang lebih kecil dimiliki oleh ${rg(A) < rg(B) ? c.m[0] : c.m[1]}, maka ia lebih konsisten.`)), sp: 'l' };
    },
    /* removing the extreme value: effect on all measures */
    (r) => {
      const o = r.pick(OUT), v = Array.from({ length: 6 }, () => r.int(o.lo, o.hi)), big = r.int(o.olo, o.ohi), all = v.concat([big]);
      need(new Set(v).size >= 5);
      const tb = (i) => SPM.table([[i ? 'Min' : 'Mean', '', ''], [i ? 'Median' : 'Median', '', ''], [i ? 'Julat' : 'Range', '', '']], { head: ['', i ? 'Dengan ' + big : 'With ' + big, i ? 'Tanpa ' + big : 'Without ' + big] });
      const shown = r.shuffle(all.slice());
      return { q: T(`The ${o.en}: ${shown.join(', ')}.<br>Complete the table for the data with and without the value ${big}, and state which measure changes the most.<br>${tb(0)}`, `${cap(o.ms)}: ${shown.join(', ')}.<br>Lengkapkan jadual bagi data dengan dan tanpa nilai ${big}, dan nyatakan ukuran yang paling banyak berubah.<br>${tb(1)}`), a: T(`Mean ${fm(mean(all))} → ${fm(mean(v))}; median ${n(median(all))} → ${n(median(v))}; range ${rg(all)} → ${rg(v)}. The range changes the most; the mean is also strongly affected, the median much less.`, `Min ${fm(mean(all))} → ${fm(mean(v))}; median ${n(median(all))} → ${n(median(v))}; julat ${rg(all)} → ${rg(v)}. Julat paling banyak berubah; min juga banyak terjejas, median jauh kurang.`), w: W(T(`With ${big}: $${all.join(' + ')} = ${sum(all)}$, mean $= \\dfrac{${sum(all)}}{7} = ${fm(mean(all))}$; in order $${list(sortNum(all))}$, median $= ${n(median(all))}$, range $= ${rg(all)}$`, `Dengan ${big}: $${all.join(' + ')} = ${sum(all)}$, min $= \\dfrac{${sum(all)}}{7} = ${fm(mean(all))}$; mengikut tertib $${list(sortNum(all))}$, median $= ${n(median(all))}$, julat $= ${rg(all)}$`), T(`Without ${big}: $${v.join(' + ')} = ${sum(v)}$, mean $= \\dfrac{${sum(v)}}{6} = ${fm(mean(v))}$; in order $${list(sortNum(v))}$, median $= ${n(median(v))}$, range $= ${rg(v)}$`, `Tanpa ${big}: $${v.join(' + ')} = ${sum(v)}$, min $= \\dfrac{${sum(v)}}{6} = ${fm(mean(v))}$; mengikut tertib $${list(sortNum(v))}$, median $= ${n(median(v))}$, julat $= ${rg(v)}$`), T(`Changes: mean $${fm(Math.abs(mean(all) - mean(v)))}$, median $${n(Math.abs(median(all) - median(v)))}$, range $${rg(all) - rg(v)}$ — the range changes most and the median least, because the median depends only on position.`, `Perubahan: min $${fm(Math.abs(mean(all) - mean(v)))}$, median $${n(Math.abs(median(all) - median(v)))}$, julat $${rg(all) - rg(v)}$ — julat paling banyak berubah dan median paling sedikit, kerana median hanya bergantung pada kedudukan.`)), sp: 'l' };
    },
    /* combined-group comparison with a decision */
    (r) => {
      const c = r.pick(CMP.filter((x) => x.hb !== 2)), K = 6, m1 = r.int(c.lo + 10, c.hi - 15), A = withMean(r, K, m1, c.lo, c.hi), K2 = r.pick([4, 5]), m2 = m1 + r.pick([-4, -3, 3, 4]), B = withMean(r, K2, m2, c.lo, c.hi);
      need(rg(A) !== rg(B));
      const tot = K + K2, cm = (K * mean(A) + K2 * mean(B)) / tot;
      return { q: T(`${c.e[0]}'s ${c.q[0]} for ${K} occasions are ${A.join(', ')}. ${c.e[1]}'s for ${K2} occasions are ${B.join(', ')}.<br>(a) Find the mean and range of each.<br>(b) Find the combined mean of all ${tot} occasions together.<br>(c) Comment on whether the combined mean is a fair summary of both.`, `${c.q[1]} ${c.m[0]} untuk ${K} kali ialah ${A.join(', ')}. ${c.m[1]} untuk ${K2} kali ialah ${B.join(', ')}.<br>(a) Cari min dan julat bagi setiap satu.<br>(b) Cari min gabungan bagi kesemua ${tot} kali itu.<br>(c) Berikan ulasan sama ada min gabungan itu adalah ringkasan yang adil bagi kedua-duanya.`), a: SPM.parts([T(`${c.e[0]}: mean ${fm(mean(A))}, range ${rg(A)}; ${c.e[1]}: mean ${fm(mean(B))}, range ${rg(B)}`, `${c.m[0]}: min ${fm(mean(A))}, julat ${rg(A)}; ${c.m[1]}: min ${fm(mean(B))}, julat ${rg(B)}`), T(`$\\dfrac{${K} \\times ${fm(mean(A))} + ${K2} \\times ${fm(mean(B))}}{${tot}} = ${fm(cm)}$`), T('It is fair only if both are equally important to compare; since the numbers of occasions differ, the combined mean is weighted more towards the larger group.', 'Ia adil hanya jika kedua-duanya sama penting untuk dibandingkan; oleh kerana bilangan kali berbeza, min gabungan lebih berat sebelah kepada kumpulan yang lebih besar.')]), w: W(SPM.cat(T('(a) ', '(a) '), statLine(c.e[0], c.m[0], A)), statLine(c.e[1], c.m[1], B), T(`(b) Combined total $= ${sum(A)} + ${sum(B)} = ${sum(A) + sum(B)}$ over $${K} + ${K2} = ${tot}$ occasions`, `(b) Jumlah gabungan $= ${sum(A)} + ${sum(B)} = ${sum(A) + sum(B)}$ bagi $${K} + ${K2} = ${tot}$ kali`), T(`$\\dfrac{${sum(A) + sum(B)}}{${tot}} = ${fm(cm)}$`), T(`(c) ${c.e[0]} contributes ${K} of the ${tot} values and ${c.e[1]} only ${K2}, so the combined mean lies closer to ${K > K2 ? c.e[0] : c.e[1]}'s mean; it is a fair summary of the ${tot} occasions together, but not a fair way to compare the two.`, `(c) ${c.m[0]} menyumbang ${K} daripada ${tot} nilai dan ${c.m[1]} hanya ${K2}, maka min gabungan lebih hampir dengan min ${K > K2 ? c.m[0] : c.m[1]}; ia ringkasan yang adil bagi ${tot} kali itu secara keseluruhan, tetapi bukan cara yang adil untuk membandingkan kedua-duanya.`)), sp: 'xl' };
    },
    /* same range, different mean: range alone is not enough */
    (r) => {
      const c = r.pick(CMP.filter((x) => x.hb !== 2)), K = 6, m1 = r.int(c.lo + 10, c.hi - 15), A = withMean(r, K, m1, c.lo, c.hi), m2 = m1 + r.pick([4, 5, 6, -4, -5, -6]), B = retry(() => { const b = withMean(r, K, m2, c.lo, c.hi); need(rg(b) === rg(A)); return b; }, 500);
      return { q: T(`The ${c.q[0]} of ${c.e[0]} are ${A.join(', ')}, and of ${c.e[1]} are ${B.join(', ')}.<br>(a) Show that both sets have the same range.<br>(b) Explain why the range alone does not tell you which group performed better, and state which group has the better typical result.`, `${cap(c.q[1])} bagi ${c.m[0]} ialah ${A.join(', ')}, dan bagi ${c.m[1]} ialah ${B.join(', ')}.<br>(a) Tunjukkan bahawa kedua-dua set mempunyai julat yang sama.<br>(b) Terangkan mengapa julat sahaja tidak menunjukkan kumpulan yang mana berprestasi lebih baik, dan nyatakan kumpulan yang mempunyai keputusan biasa yang lebih baik.`), a: SPM.parts([T(`Both ranges $= ${rg(A)}$`), T(`Range only measures spread, not level. ${(c.hb === 1) === (m1 > m2) ? c.e[0] : c.e[1]} has the ${c.hb === 1 ? 'higher' : 'lower'} mean (${c.hb === 1 ? Math.max(m1, m2) : Math.min(m1, m2)} against ${c.hb === 1 ? Math.min(m1, m2) : Math.max(m1, m2)}), so its typical result is better.`, `Julat hanya mengukur serakan, bukan tahap. ${(c.hb === 1) === (m1 > m2) ? c.m[0] : c.m[1]} mempunyai min yang ${c.hb === 1 ? 'lebih tinggi' : 'lebih rendah'} (${c.hb === 1 ? Math.max(m1, m2) : Math.min(m1, m2)} berbanding ${c.hb === 1 ? Math.min(m1, m2) : Math.max(m1, m2)}), maka keputusan biasanya lebih baik.`)]), w: W(T(`(a) ${c.e[0]}: $${Math.max(...A)} - ${Math.min(...A)} = ${rg(A)}$`, `(a) ${c.m[0]}: $${Math.max(...A)} - ${Math.min(...A)} = ${rg(A)}$`), T(`${c.e[1]}: $${Math.max(...B)} - ${Math.min(...B)} = ${rg(B)}$ — the same range.`, `${c.m[1]}: $${Math.max(...B)} - ${Math.min(...B)} = ${rg(B)}$ — julat yang sama.`), T(`(b) Equal ranges only say the values are equally spread out; they say nothing about the level.`, `(b) Julat yang sama hanya menunjukkan nilai sama-sama berserak; ia tidak menyatakan apa-apa tentang tahapnya.`), T(`Means: $\\dfrac{${sum(A)}}{${K}} = ${m1}$ and $\\dfrac{${sum(B)}}{${K}} = ${m2}$, so ${(c.hb === 1) === (m1 > m2) ? c.e[0] : c.e[1]} has the better typical result.`, `Min: $\\dfrac{${sum(A)}}{${K}} = ${m1}$ dan $\\dfrac{${sum(B)}}{${K}} = ${m2}$, maka ${(c.hb === 1) === (m1 > m2) ? c.m[0] : c.m[1]} mempunyai keputusan biasa yang lebih baik.`)), sp: 'l' };
    },
  ];
  SPM.extend('F2-12.4', { e: ge124, m: gm124, a: ga124 });

  /* ====================================================== F2-12.5 Effects of data changes */
  const NM5 = ['mean', 'median', 'mode', 'range'].map((x) => T(x, { mean: 'min', median: 'median', mode: 'mod', range: 'julat' }[x]));
  const allMMM = (v) => ({ mean: mean(v), median: median(v), mode: modesOf(v), range: rg(v) });
  const g5set = (r, d, k) => { const v = dl(r, d, k); return v; };
  const ge125 = [
    /* add a value equal to the mean: unchanged */
    (r) => {
      const d = r.pick(DATA), k = r.int(4, 6), v = g5set(r, d, k);
      need(Number.isInteger(mean(v)));
      const m = mean(v);
      return { q: T(`The mean of $${list(v)}$ is ${m}. A new value equal to ${m} is added to the data. What is the new mean? Explain.`, `Min bagi $${list(v)}$ ialah ${m}. Satu nilai baharu yang sama dengan ${m} ditambah kepada data itu. Apakah min baharu? Terangkan.`), a: T(`Still ${m}: adding a value equal to the mean does not change the mean.`, `Masih ${m}: menambah nilai yang sama dengan min tidak mengubah min.`), w: W(T(`Old sum $= ${v.join(' + ')} = ${sum(v)}$`, `Hasil tambah lama $= ${v.join(' + ')} = ${sum(v)}$`), T(`New sum $= ${sum(v)} + ${m} = ${sum(v) + m}$, and there are now $${k + 1}$ values.`, `Hasil tambah baharu $= ${sum(v)} + ${m} = ${sum(v) + m}$, dan kini terdapat $${k + 1}$ nilai.`), T(`New mean $= \\dfrac{${sum(v) + m}}{${k + 1}} = ${m}$`, `Min baharu $= \\dfrac{${sum(v) + m}}{${k + 1}} = ${m}$`), T('Adding a value equal to the mean never changes the mean.', 'Menambah nilai yang sama dengan min tidak pernah mengubah min.')), sp: 's' };
    },
    /* missing value given the mean */
    (r) => {
      const d = r.pick(DATA), k = r.int(4, 6), m = r.int(Math.max(d.lo + 1, 3), d.hi), v = Array.from({ length: k - 1 }, () => r.int(Math.max(1, m - 4), m + 4)), x = m * k - sum(v);
      need(x >= Math.max(1, d.lo) && x <= d.hi);
      return { q: T(`The mean of the ${dsc(d, k, 0)} is ${m}. ${k - 1} of the values are $${list(v)}$. Find the missing value.`, `Min bagi ${dsc(d, k, 1)} ialah ${m}. ${k - 1} daripada nilai itu ialah $${list(v)}$. Cari nilai yang hilang.`), a: T(`$${m} \\times ${k} - ${sum(v)} = ${x}$`), w: W(T(`Sum of all ${k} values $= ${m} \\times ${k} = ${m * k}$`, `Hasil tambah kesemua ${k} nilai $= ${m} \\times ${k} = ${m * k}$`), T(`Sum of the given values $= ${v.join(' + ')} = ${sum(v)}$`, `Hasil tambah nilai yang diberi $= ${v.join(' + ')} = ${sum(v)}$`), T(`Missing value $= ${m * k} - ${sum(v)} = ${x}$`, `Nilai yang hilang $= ${m * k} - ${sum(v)} = ${x}$`)), sp: 's' };
    },
    /* new mean when a constant is added to every value */
    (r) => {
      const d = r.pick(DATA), k = r.int(4, 6), v = g5set(r, d, k), c0 = r.int(2, 10);
      const op = r.pick(['add', 'sub']), mv = round(mean(v), 2);
      need(op === 'add' || mv - c0 > 0);
      return { q: T(`The mean of a data set is ${fm(mv)}. Every value is ${op === 'add' ? 'increased' : 'decreased'} by ${c0}. Find the new mean.`, `Min bagi satu set data ialah ${fm(mv)}. Setiap nilai ${op === 'add' ? 'ditambah' : 'dikurangkan'} sebanyak ${c0}. Cari min baharu.`), a: T(`${fm(op === 'add' ? mv + c0 : mv - c0)}`), w: W(T(`Every value ${op === 'add' ? 'goes up' : 'goes down'} by ${c0}, so the total changes by ${c0} for each value and the mean ${op === 'add' ? 'goes up' : 'goes down'} by ${c0} as well.`, `Setiap nilai ${op === 'add' ? 'bertambah' : 'berkurang'} sebanyak ${c0}, maka jumlahnya berubah sebanyak ${c0} bagi setiap nilai dan min juga ${op === 'add' ? 'bertambah' : 'berkurang'} sebanyak ${c0}.`), T(`New mean $= ${fm(mv)} ${op === 'add' ? '+' : '-'} ${c0} = ${fm(op === 'add' ? mv + c0 : mv - c0)}$`, `Min baharu $= ${fm(mv)} ${op === 'add' ? '+' : '-'} ${c0} = ${fm(op === 'add' ? mv + c0 : mv - c0)}$`)), sp: 's' };
    },
    /* new mean when every value is scaled */
    (r) => {
      const d = r.pick(DATA), k = r.int(4, 6), v = g5set(r, d, k), c0 = r.pick([2, 3, 4]), mv = round(mean(v), 2);
      return { q: T(`The mean of a data set is ${fm(mv)}. Every value is multiplied by ${c0}. Find the new mean.`, `Min bagi satu set data ialah ${fm(mv)}. Setiap nilai didarab dengan ${c0}. Cari min baharu.`), a: T(`${fm(mv * c0)}`), w: W(T(`Multiplying every value by ${c0} multiplies the total by ${c0}, and the number of values does not change.`, `Mendarabkan setiap nilai dengan ${c0} mendarabkan jumlahnya dengan ${c0}, dan bilangan nilai tidak berubah.`), T(`New mean $= ${fm(mv)} \\times ${c0} = ${fm(mv * c0)}$`, `Min baharu $= ${fm(mv)} \\times ${c0} = ${fm(mv * c0)}$`)), sp: 's' };
    },
    /* effect on range when adding a constant */
    (r) => {
      const d = r.pick(DATA), k = r.int(5, 7), v = g5set(r, d, k), c0 = r.int(2, 10);
      return { q: T(`The range of a data set is ${rg(v)}. Every value is increased by ${c0}. Find the new range.`, `Julat bagi satu set data ialah ${rg(v)}. Setiap nilai ditambah sebanyak ${c0}. Cari julat baharu.`), a: T(`$${rg(v)}$ (unchanged: adding a constant to every value does not change the spread)`, `$${rg(v)}$ (tidak berubah: menambah pemalar kepada setiap nilai tidak mengubah serakan)`), w: W(T(`New range $= (\\text{largest} + ${c0}) - (\\text{smallest} + ${c0})$`, `Julat baharu $= (\\text{terbesar} + ${c0}) - (\\text{terkecil} + ${c0})$`), T(`$= \\text{largest} - \\text{smallest} = ${rg(v)}$`, `$= \\text{terbesar} - \\text{terkecil} = ${rg(v)}$`), T(`The $+${c0}$ cancels, so the spread is unchanged.`, `Tambahan $+${c0}$ terhapus, maka serakan tidak berubah.`)), sp: 's' };
    },
    /* effect on range when scaling */
    (r) => {
      const d = r.pick(DATA), k = r.int(5, 7), v = g5set(r, d, k), c0 = r.pick([2, 3]);
      return { q: T(`The range of a data set is ${rg(v)}. Every value is multiplied by ${c0}. Find the new range.`, `Julat bagi satu set data ialah ${rg(v)}. Setiap nilai didarab dengan ${c0}. Cari julat baharu.`), a: T(`$${rg(v)} \\times ${c0} = ${rg(v) * c0}$`), w: W(T(`New range $= (\\text{largest} \\times ${c0}) - (\\text{smallest} \\times ${c0}) = ${c0} \\times (\\text{largest} - \\text{smallest})$`, `Julat baharu $= (\\text{terbesar} \\times ${c0}) - (\\text{terkecil} \\times ${c0}) = ${c0} \\times (\\text{terbesar} - \\text{terkecil})$`), T(`$= ${c0} \\times ${rg(v)} = ${rg(v) * c0}$`), T(`Multiplying every value by ${c0} multiplies the spread by ${c0} as well.`, `Mendarabkan setiap nilai dengan ${c0} turut mendarabkan serakan dengan ${c0}.`)), sp: 's' };
    },
    /* true or false about effects */
    (r) => {
      const t = r.pick([
        ['Removing the smallest value from a data set can only increase the mean or keep it the same.|Mengeluarkan nilai terkecil daripada satu set data hanya boleh menaikkan min atau mengekalkannya.', 1, 'The smallest value is at most equal to the mean, so removing it cannot lower the mean.|Nilai terkecil paling banyak sama dengan min, maka mengeluarkannya tidak boleh menurunkan min.'],
        ['Adding a value to a data set always increases the mean.|Menambah satu nilai kepada set data sentiasa menaikkan min.', 0, 'It increases the mean only if the added value is greater than the current mean.|Ia menaikkan min hanya jika nilai yang ditambah lebih besar daripada min semasa.'],
        ['If every value in a data set is doubled, the range is also doubled.|Jika setiap nilai dalam satu set data digandakan dua, julat juga digandakan dua.', 1, 'The largest and smallest values both double, so their difference also doubles.|Nilai terbesar dan terkecil kedua-duanya digandakan dua, maka bezanya juga digandakan dua.'],
        ['If every value in a data set is increased by the same amount, the mode stays the same value plus that amount.|Jika setiap nilai dalam satu set data ditambah dengan amaun yang sama, mod kekal sebagai nilai yang sama tambah amaun itu.', 1, 'The value that occurred most often is still the most frequent after the same shift.|Nilai yang paling kerap berlaku masih paling kerap selepas anjakan yang sama.'],
      ]);
      return { q: T(`True or false? Give a reason.<br>"${t[0].split('|')[0]}"`, `Benar atau palsu? Berikan sebab.<br>"${t[0].split('|')[1]}"`), a: T(`${t[1] ? 'True' : 'False'}. ${t[2].split('|')[0]}`, `${t[1] ? 'Benar' : 'Palsu'}. ${t[2].split('|')[1]}`), w: W(T(t[1] ? 'Think about what happens to the total and to the number of values.' : 'Look for a case in which the statement fails — one counterexample is enough.', t[1] ? 'Fikirkan apa yang berlaku kepada jumlah dan bilangan nilai.' : 'Cari satu kes yang menyebabkan pernyataan itu gagal — satu contoh penyangkal sudah cukup.'), T(t[2].split('|')[0], t[2].split('|')[1]), T(t[1] ? 'So the statement is true.' : 'So the statement is false.', t[1] ? 'Maka pernyataan itu benar.' : 'Maka pernyataan itu palsu.')), sp: 's' };
    },
    /* removing the mode: does the mode change? */
    (r) => {
      const d = r.pick(DATA), k = r.int(6, 8), v = retry(() => { const a = g5set(r, d, k); need(modesOf(a).length === 1); return a; });
      const m = modesOf(v)[0], cM = v.filter((x) => x === m).length, one = v.slice();
      one.splice(one.indexOf(m), 1);
      const nm2 = modesOf(one), same = nm2.length === 1 && nm2[0] === m;
      const done = (i) => (nm2.length ? `$${nm2.join(i ? ' \\text{ dan } ' : ' \\text{ and } ')}$` : (i ? 'Tiada mod' : 'No mode'));
      return { q: T(`The data $${list(v)}$ has mode ${m}. One value equal to ${m} is removed. State the new mode, if any.`, `Data $${list(v)}$ mempunyai mod ${m}. Satu nilai yang sama dengan ${m} dikeluarkan.<br>Nyatakan mod baharu, jika ada.`), a: T(same ? `Still $${m}$` : done(0), same ? `Masih $${m}$` : done(1)), w: W(T(`After the removal, ${m} occurs ${cM - 1} time${cM - 1 === 1 ? '' : 's'}. Count the remaining values:`, `Selepas pengeluaran itu, ${m} berlaku ${cM - 1} kali. Bilang nilai yang tinggal:`), cntLine(one), T(same ? `${m} is still the most frequent, so the mode is still $${m}$.` : nm2.length ? `The most frequent value is now ${done(0)}.` : 'Every remaining value occurs equally often, so there is no mode.', same ? `${m} masih paling kerap, maka mod masih $${m}$.` : nm2.length ? `Nilai yang paling kerap kini ialah ${done(1)}.` : 'Setiap nilai yang tinggal berlaku sama kerap, maka tiada mod.')), sp: 's' };
    },
  ];
  const gm125 = [
    /* new mean after one value added */
    (r) => {
      const d = r.pick(DATA), k = r.int(5, 8), v = g5set(r, d, k), x = r.int(d.lo, d.hi), all = v.concat([x]);
      return { q: T(`The mean of $${list(v)}$ is ${fm(mean(v))}. The value ${x} is added to the data. Find the new mean, correct to 2 decimal places if needed.`, `Min bagi $${list(v)}$ ialah ${fm(mean(v))}. Nilai ${x} ditambah kepada data itu. Cari min baharu, betul kepada 2 tempat perpuluhan jika perlu.`), a: T(`$\\dfrac{${sum(v)} + ${x}}{${k + 1}} = ${fm(mean(all))}$`), w: W(T(`Old sum $= ${v.join(' + ')} = ${sum(v)}$`, `Hasil tambah lama $= ${v.join(' + ')} = ${sum(v)}$`), T(`New sum $= ${sum(v)} + ${x} = ${sum(v) + x}$, and there are now $${k + 1}$ values.`, `Hasil tambah baharu $= ${sum(v)} + ${x} = ${sum(v) + x}$, dan kini terdapat $${k + 1}$ nilai.`), T(`New mean $= \\dfrac{${sum(v) + x}}{${k + 1}} = ${fm(mean(all))}$`, `Min baharu $= \\dfrac{${sum(v) + x}}{${k + 1}} = ${fm(mean(all))}$`), T(`Divide by ${k + 1}, not ${k}: there is one more value now.`, `Bahagi dengan ${k + 1}, bukan ${k}: kini ada satu nilai lagi.`)), sp: 's' };
    },
    /* new mean after removing a value */
    (r) => {
      const d = r.pick(DATA), k = r.int(6, 9), v = g5set(r, d, k), j = r.int(0, k - 1), out = v[j], w = v.filter((_, i) => i !== j);
      return { q: T(`The mean of $${list(v)}$ is ${fm(mean(v))}. The value ${out} is removed. Find the new mean, correct to 2 decimal places if needed.`, `Min bagi $${list(v)}$ ialah ${fm(mean(v))}. Nilai ${out} dikeluarkan. Cari min baharu, betul kepada 2 tempat perpuluhan jika perlu.`), a: T(`$\\dfrac{${sum(v)} - ${out}}{${k - 1}} = ${fm(mean(w))}$`), w: W(T(`Old sum $= ${v.join(' + ')} = ${sum(v)}$`, `Hasil tambah lama $= ${v.join(' + ')} = ${sum(v)}$`), T(`New sum $= ${sum(v)} - ${out} = ${sum(v) - out}$, and $${k - 1}$ values are left.`, `Hasil tambah baharu $= ${sum(v)} - ${out} = ${sum(v) - out}$, dan tinggal $${k - 1}$ nilai.`), T(`New mean $= \\dfrac{${sum(v) - out}}{${k - 1}} = ${fm(mean(w))}$`, `Min baharu $= \\dfrac{${sum(v) - out}}{${k - 1}} = ${fm(mean(w))}$`)), sp: 's' };
    },
    /* find the value that was added, given both means */
    (r) => {
      const dd = r.pick(DATA), k = r.int(5, 8), m1 = r.int(Math.max(dd.lo + 2, 8), Math.min(dd.hi - 2, 20)), v = withMean(r, k, m1, dd.lo, dd.hi), dch = r.pick([1, -1, 2, -2]), m2 = round(m1 + dch * r.pick([0.5, 1, 1.5]), 1), x = m2 * (k + 1) - sum(v);
      need(x >= dd.lo && x <= dd.hi && Number.isInteger(x));
      return { q: T(`The mean of the ${dsc(dd, k, 0)} is ${m1}. When one more value is added, the mean becomes ${n(m2)}. Find the value that was added.`, `Min bagi ${dsc(dd, k, 1)} ialah ${m1}. Apabila satu nilai lagi ditambah, min menjadi ${n(m2)}. Cari nilai yang ditambah itu.`), a: T(`$${n(m2)} \\times ${k + 1} - ${m1} \\times ${k} = ${n(x)}$`), w: W(T(`Sum of the first ${k} values $= ${m1} \\times ${k} = ${m1 * k}$`, `Hasil tambah ${k} nilai pertama $= ${m1} \\times ${k} = ${m1 * k}$`), T(`Sum of all ${k + 1} values $= ${n(m2)} \\times ${k + 1} = ${nr(m2 * (k + 1))}$`, `Hasil tambah kesemua ${k + 1} nilai $= ${n(m2)} \\times ${k + 1} = ${nr(m2 * (k + 1))}$`), T(`Added value $= ${nr(m2 * (k + 1))} - ${m1 * k} = ${n(x)}$`, `Nilai yang ditambah $= ${nr(m2 * (k + 1))} - ${m1 * k} = ${n(x)}$`)), sp: 'm' };
    },
    /* find the value that was removed, given both means */
    (r) => {
      const dd = r.pick(DATA), k = r.int(6, 9), m1 = r.int(Math.max(dd.lo + 2, 8), Math.min(dd.hi - 2, 20)), v = withMean(r, k, m1, dd.lo, dd.hi), m2 = m1 + r.pick([-2, -1, 1, 2]), x = m1 * k - m2 * (k - 1);
      need(x >= dd.lo && x <= dd.hi);
      return { q: T(`The mean of the ${dsc(dd, k, 0)} is ${m1}. One value is removed and the mean of the remaining ${k - 1} values becomes ${m2}. Find the value that was removed.`, `Min bagi ${dsc(dd, k, 1)} ialah ${m1}. Satu nilai dikeluarkan dan min bagi ${k - 1} nilai yang tinggal menjadi ${m2}. Cari nilai yang dikeluarkan itu.`), a: T(`$${m1} \\times ${k} - ${m2} \\times (${k} - 1) = ${x}$`), w: W(T(`Sum of all ${k} values $= ${m1} \\times ${k} = ${m1 * k}$`, `Hasil tambah kesemua ${k} nilai $= ${m1} \\times ${k} = ${m1 * k}$`), T(`Sum of the ${k - 1} remaining values $= ${m2} \\times ${k - 1} = ${m2 * (k - 1)}$`, `Hasil tambah ${k - 1} nilai yang tinggal $= ${m2} \\times ${k - 1} = ${m2 * (k - 1)}$`), T(`Removed value $= ${m1 * k} - ${m2 * (k - 1)} = ${x}$`, `Nilai yang dikeluarkan $= ${m1 * k} - ${m2 * (k - 1)} = ${x}$`)), sp: 'm' };
    },
    /* scaling with add: new mean */
    (r) => {
      const d = r.pick(DATA), k = r.int(4, 6), v = g5set(r, d, k), a0 = r.pick([2, 3]), b0 = r.int(1, 10), op = r.pick(['ax+b', 'a(x+b)']);
      const mv = round(mean(v), 2), nm = op === 'ax+b' ? a0 * mv + b0 : a0 * (mv + b0);
      return { q: T(`The mean of a data set is ${fm(mv)}. Every value $x$ is changed to $${op === 'ax+b' ? `${a0}x + ${b0}` : `${a0}(x + ${b0})`}$. Find the new mean.`, `Min bagi satu set data ialah ${fm(mv)}. Setiap nilai $x$ ditukar kepada $${op === 'ax+b' ? `${a0}x + ${b0}` : `${a0}(x + ${b0})`}$. Cari min baharu.`), a: T(`${fm(nm)}`), w: W(T('The same change is made to every value, so make it to the mean.', 'Perubahan yang sama dibuat kepada setiap nilai, maka buat perubahan itu kepada min.'), T(`New mean $= ${op === 'ax+b' ? `${a0} \\times ${fm(mv)} + ${b0}` : `${a0} \\times (${fm(mv)} + ${b0})`}$`, `Min baharu $= ${op === 'ax+b' ? `${a0} \\times ${fm(mv)} + ${b0}` : `${a0} \\times (${fm(mv)} + ${b0})`}$`), T(`$= ${fm(nm)}$`)), sp: 'm' };
    },
    /* find x given new mean after scaling (reverse) */
    (r) => {
      const d = r.pick(DATA), k = r.int(4, 6), v = g5set(r, d, k), a0 = r.pick([2, 3, 4]), mv = round(mean(v), 2), nm = a0 * mv;
      return { q: T(`The mean of a data set is $m$. Every value is multiplied by ${a0} and the new mean becomes ${fm(nm)}. Find the value of $m$.`, `Min bagi satu set data ialah $m$. Setiap nilai didarab dengan ${a0} dan min baharu menjadi ${fm(nm)}. Cari nilai $m$.`), a: T(`$m = ${fm(nm)} \\div ${a0} = ${fm(mv)}$`), w: W(T(`Multiplying every value by ${a0} multiplies the mean by ${a0}, so $${a0}m = ${fm(nm)}$.`, `Mendarabkan setiap nilai dengan ${a0} mendarabkan min dengan ${a0}, maka $${a0}m = ${fm(nm)}$.`), T(`$m = ${fm(nm)} \\div ${a0} = ${fm(mv)}$`)), sp: 'm' };
    },
    /* median unaffected / affected by removing extreme */
    (r) => {
      const d = r.pick(DATA), k = r.pick([7, 9]), v = retry(() => { const a = g5set(r, d, k); need(new Set(a).size === k); return a; }), o = sortNum(v), out = r.pick([o[0], o[o.length - 1]]), w = v.filter((x) => x !== out);
      return { q: T(`The data $${list(v)}$ has median ${n(median(v))}. The value ${out} (an extreme value) is removed. Find the new median and state whether it changed by much.`, `Data $${list(v)}$ mempunyai median ${n(median(v))}. Nilai ${out} (nilai ekstrem) dikeluarkan. Cari median baharu dan nyatakan sama ada ia banyak berubah.`), a: T(`New median $= ${n(median(w))}$. It changed only slightly (or not at all): the median depends on position, not on the size of the extreme value.`, `Median baharu $= ${n(median(w))}$. Ia hanya berubah sedikit (atau tidak langsung): median bergantung pada kedudukan, bukan saiz nilai ekstrem.`), w: W(T(`In order, without ${out}: $${list(sortNum(w))}$`, `Mengikut tertib, tanpa ${out}: $${list(sortNum(w))}$`), medLine(k - 1, median(w)), T(`It moved from $${n(median(v))}$ to $${n(median(w))}$, a change of $${n(Math.abs(median(v) - median(w)))}$: removing a value from one end only shifts the middle position by half a place.`, `Ia berubah daripada $${n(median(v))}$ kepada $${n(median(w))}$, perubahan sebanyak $${n(Math.abs(median(v) - median(w)))}$: mengeluarkan satu nilai dari hujung hanya menganjak kedudukan tengah sebanyak setengah tempat.`)), sp: 'm' };
    },
    /* which measures change when a value is added */
    (r) => {
      const d = r.pick(DATA), k = r.pick([6, 7]), v = retry(() => { const a = g5set(r, d, k); need(modesOf(a).length === 1); return a; }), x = r.int(d.lo, d.hi), all = v.concat([x]).sort((p, q) => p - q);
      const A = allMMM(v), B = allMMM(all);
      const chg = (nm, same) => (same ? T(`${nm.en} unchanged`, `${nm.ms} tidak berubah`) : T(`${nm.en} changed`, `${nm.ms} berubah`));
      return { q: T(`The data $${list(v)}$ has mean ${fm(A.mean)}, median ${n(A.median)}, mode ${A.mode.join('/')} and range ${A.range}. The value ${x} is added. State, with brief working, whether each of the mean, median, mode and range changes.`, `Data $${list(v)}$ mempunyai min ${fm(A.mean)}, median ${n(A.median)}, mod ${A.mode.join('/')} dan julat ${A.range}. Nilai ${x} ditambah. Nyatakan, dengan kerja kerja ringkas, sama ada setiap satu min, median, mod dan julat berubah.`), a: SPM.lines(chg(NM5[0], A.mean === B.mean), chg(NM5[1], A.median === B.median), chg(NM5[2], A.mode.join() === B.mode.join()), chg(NM5[3], A.range === B.range)), w: W(T(`New data in order: $${list(all)}$`, `Data baharu mengikut tertib: $${list(all)}$`), T(`Mean: $\\dfrac{${sum(v)} + ${x}}{${k + 1}} = ${fm(B.mean)}$, so it ${A.mean === B.mean ? 'does not change' : 'changes'} (was ${fm(A.mean)}).`, `Min: $\\dfrac{${sum(v)} + ${x}}{${k + 1}} = ${fm(B.mean)}$, maka ia ${A.mean === B.mean ? 'tidak berubah' : 'berubah'} (dahulu ${fm(A.mean)}).`), T(`Median: ${n(A.median)} → ${n(B.median)} (${posTxt(k + 1, 0)} now).`, `Median: ${n(A.median)} → ${n(B.median)} (kini ${posTxt(k + 1, 1)}).`), T(`Mode: ${A.mode.join('/')} → ${B.mode.join('/')}; range: $${A.range}$ → $${B.range}$ (largest $${Math.max(...all)}$, smallest $${Math.min(...all)}$).`, `Mod: ${A.mode.join('/')} → ${B.mode.join('/')}; julat: $${A.range}$ → $${B.range}$ (terbesar $${Math.max(...all)}$, terkecil $${Math.min(...all)}$).`)), sp: 'l' };
    },
  ];
  const ga125 = [
    /* find new number from mean changing (add) */
    (r) => {
      const dd = r.pick(DATA), k = r.int(5, 8), m1 = r.int(Math.max(dd.lo + 2, 10), Math.min(dd.hi - 2, 20)), d = r.pick([1, 2, 3]), v = withMean(r, k, m1, dd.lo, dd.hi), x = (m1 + d) * (k + 1) - sum(v);
      need(x >= dd.lo && x <= dd.hi);
      return { q: T(`The mean of the ${dsc(dd, k, 0)} is ${m1}. When one more value is included, the mean becomes ${m1 + d}. Find the new value.`, `Min bagi ${dsc(dd, k, 1)} ialah ${m1}. Apabila satu nilai lagi dimasukkan, min menjadi ${m1 + d}. Cari nilai baharu itu.`), a: T(`$${m1 + d} \\times ${k + 1} - ${m1} \\times ${k} = ${x}$`), w: W(T(`Sum of the first ${k} values $= ${m1} \\times ${k} = ${m1 * k}$`, `Hasil tambah ${k} nilai pertama $= ${m1} \\times ${k} = ${m1 * k}$`), T(`Sum of all ${k + 1} values $= ${m1 + d} \\times ${k + 1} = ${(m1 + d) * (k + 1)}$`, `Hasil tambah kesemua ${k + 1} nilai $= ${m1 + d} \\times ${k + 1} = ${(m1 + d) * (k + 1)}$`), T(`New value $= ${(m1 + d) * (k + 1)} - ${m1 * k} = ${x}$`, `Nilai baharu $= ${(m1 + d) * (k + 1)} - ${m1 * k} = ${x}$`)), sp: 'm' };
    },
    /* mean and median with/without extreme value: which affected more */
    (r) => {
      const d = r.pick(DATA), k = r.pick([6, 7]), v = g5set(r, d, k), big = r.int(d.hi + Math.round((d.hi - d.lo) * 0.6) + 1, d.hi + Math.round((d.hi - d.lo) * 1.5) + 3), all = v.concat([big]);
      need(median(v) !== median(all) || true);
      return { q: T(`The data $${list(all)}$ include one extreme value. Find the mean and median with and without ${big}. Which measure is affected more?`, `Data $${list(all)}$ mengandungi satu nilai ekstrem. Cari min dan median dengan dan tanpa ${big}. Ukuran yang manakah lebih terjejas?`), a: T(`With: mean ${fm(mean(all))}, median ${n(median(all))}. Without: mean ${fm(mean(v))}, median ${n(median(v))}. The mean changes more.`, `Dengan: min ${fm(mean(all))}, median ${n(median(all))}. Tanpa: min ${fm(mean(v))}, median ${n(median(v))}. Min lebih banyak berubah.`), w: W(T(`With ${big}: $${all.join(' + ')} = ${sum(all)}$, mean $= \\dfrac{${sum(all)}}{${k + 1}} = ${fm(mean(all))}$`, `Dengan ${big}: $${all.join(' + ')} = ${sum(all)}$, min $= \\dfrac{${sum(all)}}{${k + 1}} = ${fm(mean(all))}$`), T(`In order: $${list(sortNum(all))}$`, `Mengikut tertib: $${list(sortNum(all))}$`), medLine(k + 1, median(all)), T(`Without ${big}: mean $= \\dfrac{${sum(v)}}{${k}} = ${fm(mean(v))}$; in order $${list(sortNum(v))}$, median $= ${n(median(v))}$`, `Tanpa ${big}: min $= \\dfrac{${sum(v)}}{${k}} = ${fm(mean(v))}$; mengikut tertib $${list(sortNum(v))}$, median $= ${n(median(v))}$`), T(`The mean moves by $${fm(Math.abs(mean(all) - mean(v)))}$ but the median only by $${n(Math.abs(median(all) - median(v)))}$, because the median depends on position, not on size.`, `Min beralih sebanyak $${fm(Math.abs(mean(all) - mean(v)))}$ tetapi median hanya $${n(Math.abs(median(all) - median(v)))}$, kerana median bergantung pada kedudukan, bukan saiz.`)), sp: 'l' };
    },
    /* two-step: find x, then find the new median/mode */
    (r) => {
      const dd = r.pick(DATA), k = r.int(5, 7), m = r.int(Math.max(dd.lo + 1, 8), Math.min(dd.hi - 1, 15)), v = Array.from({ length: k - 1 }, () => r.int(Math.max(dd.lo, m - 5), Math.min(dd.hi, m + 5))), x = m * k - sum(v);
      need(x >= dd.lo && x <= dd.hi);
      const all = sortNum(v.concat([x]));
      return { q: T(`The mean of the ${dsc(dd, k, 0)} is ${m}. ${k - 1} of the values are $${list(v)}$.<br>(a) Find the missing value.<br>(b) Hence, find the median of the ${k} values.`, `Min bagi ${dsc(dd, k, 1)} ialah ${m}. ${k - 1} daripada nilai itu ialah $${list(v)}$.<br>(a) Cari nilai yang hilang.<br>(b) Seterusnya, cari median bagi ${k} nilai itu.`), a: SPM.parts([T(`$${m} \\times ${k} - ${sum(v)} = ${x}$`), T(`$${n(median(all))}$`)]), w: W(T(`(a) Sum of all ${k} values $= ${m} \\times ${k} = ${m * k}$`, `(a) Hasil tambah kesemua ${k} nilai $= ${m} \\times ${k} = ${m * k}$`), T(`Sum of the given values $= ${v.join(' + ')} = ${sum(v)}$`, `Hasil tambah nilai yang diberi $= ${v.join(' + ')} = ${sum(v)}$`), T(`Missing value $= ${m * k} - ${sum(v)} = ${x}$`, `Nilai yang hilang $= ${m * k} - ${sum(v)} = ${x}$`), T(`(b) All ${k} values in order: $${list(all)}$`, `(b) Kesemua ${k} nilai mengikut tertib: $${list(all)}$`), medLine(k, median(all))), sp: 'm' };
    },
    /* scaling applied twice: common misconception check */
    (r) => {
      const d = r.pick(DATA), k = r.int(4, 6), v = g5set(r, d, k), a0 = r.pick([2, 3]), b0 = r.int(1, 8), mv = round(mean(v), 2);
      const correct = a0 * mv + b0, wrong = a0 * (mv + b0) + b0;
      return { q: T(`The mean of a data set is ${fm(mv)}. Every value $x$ is changed to $${a0}x + ${b0}$.<br>(a) Find the new mean.<br>(b) A student calculates the new mean as $${a0} \\times (${fm(mv)} + ${b0}) + ${b0} = ${fm(wrong)}$. Explain the student's mistake.`, `Min bagi satu set data ialah ${fm(mv)}. Setiap nilai $x$ ditukar kepada $${a0}x + ${b0}$.<br>(a) Cari min baharu.<br>(b) Seorang murid mengira min baharu sebagai $${a0} \\times (${fm(mv)} + ${b0}) + ${b0} = ${fm(wrong)}$. Terangkan kesilapan murid itu.`), a: SPM.parts([T(`$${a0} \\times ${fm(mv)} + ${b0} = ${fm(correct)}$`), T(`The student added ${b0} twice; the rule $a\\bar{x} + b$ should be applied once to the mean, not applied and then added again.`, `Murid itu menambah ${b0} dua kali; peraturan $a\\bar{x} + b$ patut digunakan sekali kepada min, bukan digunakan dan kemudian ditambah lagi.`)]), w: W(T(`(a) The same rule is applied to every value, so apply it to the mean: new mean $= ${a0}\\bar{x} + ${b0}$.`, `(a) Peraturan yang sama digunakan pada setiap nilai, maka gunakannya pada min: min baharu $= ${a0}\\bar{x} + ${b0}$.`), T(`$= ${a0} \\times ${fm(mv)} + ${b0} = ${fm(a0 * mv)} + ${b0} = ${fm(correct)}$`), T(`(b) The student's expression $${a0} \\times (${fm(mv)} + ${b0}) + ${b0}$ adds ${b0} inside the bracket and again outside, i.e. $${a0}x + ${a0 * b0} + ${b0} = ${a0}x + ${a0 * b0 + b0}$.`, `(b) Ungkapan murid itu $${a0} \\times (${fm(mv)} + ${b0}) + ${b0}$ menambah ${b0} di dalam kurungan dan sekali lagi di luar, iaitu $${a0}x + ${a0 * b0} + ${b0} = ${a0}x + ${a0 * b0 + b0}$.`), T(`That gives ${fm(wrong)} instead of ${fm(correct)}.`, `Itu memberikan ${fm(wrong)} dan bukan ${fm(correct)}.`)), sp: 'l' };
    },
    /* effect of removing an outlier: mean, median and range together */
    (r) => {
      const d = r.pick(DATA), k = r.pick([6, 7]), v = g5set(r, d, k), big = r.int(d.hi + Math.round((d.hi - d.lo) * 0.7) + 1, d.hi + Math.round((d.hi - d.lo) * 1.8) + 4), all = r.shuffle(v.concat([big]));
      const A = allMMM(all), B = allMMM(v);
      return { q: T(`${cap(dsc(d, k + 1, 0))}, including one extreme value: ${all.join(', ')}.<br>(a) Find the mean, median and range of the data.<br>(b) The extreme value is removed. Find the new mean, median and range.<br>(c) Which measures were affected most and least by removing the extreme value?`, `${cap(dsc(d, k + 1, 1))}, termasuk satu nilai ekstrem: ${all.join(', ')}.<br>(a) Cari min, median dan julat bagi data itu.<br>(b) Nilai ekstrem itu dikeluarkan. Cari min, median dan julat baharu.<br>(c) Ukuran manakah yang paling terjejas dan paling kurang terjejas oleh pengeluaran nilai ekstrem itu?`), a: SPM.parts([T(`Mean ${fm(A.mean)}, median ${n(A.median)}, range ${A.range}`, `Min ${fm(A.mean)}, median ${n(A.median)}, julat ${A.range}`), T(`Mean ${fm(B.mean)}, median ${n(B.median)}, range ${B.range}`, `Min ${fm(B.mean)}, median ${n(B.median)}, julat ${B.range}`), T('The range (and mean) are affected most; the median changes the least, since it depends only on the middle position.', 'Julat (dan min) paling terjejas; median berubah paling sedikit, kerana ia hanya bergantung pada kedudukan tengah.')]), w: W(T(`(a) $${all.join(' + ')} = ${sum(all)}$, mean $= \\dfrac{${sum(all)}}{${k + 1}} = ${fm(A.mean)}$`, `(a) $${all.join(' + ')} = ${sum(all)}$, min $= \\dfrac{${sum(all)}}{${k + 1}} = ${fm(A.mean)}$`), T(`In order: $${list(sortNum(all))}$, median $= ${n(A.median)}$, range $= ${Math.max(...all)} - ${Math.min(...all)} = ${A.range}$`, `Mengikut tertib: $${list(sortNum(all))}$, median $= ${n(A.median)}$, julat $= ${Math.max(...all)} - ${Math.min(...all)} = ${A.range}$`), T(`(b) Without ${big}: $${v.join(' + ')} = ${sum(v)}$, mean $= \\dfrac{${sum(v)}}{${k}} = ${fm(B.mean)}$`, `(b) Tanpa ${big}: $${v.join(' + ')} = ${sum(v)}$, min $= \\dfrac{${sum(v)}}{${k}} = ${fm(B.mean)}$`), T(`In order: $${list(sortNum(v))}$, median $= ${n(B.median)}$, range $= ${Math.max(...v)} - ${Math.min(...v)} = ${B.range}$`, `Mengikut tertib: $${list(sortNum(v))}$, median $= ${n(B.median)}$, julat $= ${Math.max(...v)} - ${Math.min(...v)} = ${B.range}$`), T(`(c) Changes: range $${A.range - B.range}$, mean $${fm(Math.abs(A.mean - B.mean))}$, median $${n(Math.abs(A.median - B.median))}$ — the range is affected most, the median least.`, `(c) Perubahan: julat $${A.range - B.range}$, min $${fm(Math.abs(A.mean - B.mean))}$, median $${n(Math.abs(A.median - B.median))}$ — julat paling terjejas, median paling sedikit.`)), sp: 'xl' };
    },
    /* find both x and y from two conditions (sum and one more constraint) */
    (r) => {
      const dd = r.pick(DATA), k = r.int(5, 7), m = r.int(Math.max(dd.lo + 1, 8), Math.min(dd.hi - 1, 15)), v = Array.from({ length: k - 2 }, () => r.int(Math.max(dd.lo, m - 5), Math.min(dd.hi, m + 5))), diff = r.int(1, 5), s2 = m * k - sum(v), y = Math.round((s2 - diff) / 2), x = y + diff;
      need(x !== y && x >= dd.lo && y >= dd.lo && x <= dd.hi && y <= dd.hi && x + y === s2);
      return { q: T(`The mean of the ${dsc(dd, k, 0)} is ${m}. ${k - 2} of the values are $${list(v)}$. The other two values are $x$ and $y$, where $x - y = ${diff}$. Find the values of $x$ and $y$.`, `Min bagi ${dsc(dd, k, 1)} ialah ${m}. ${k - 2} daripada nilai itu ialah $${list(v)}$. Dua nilai lagi ialah $x$ dan $y$, dengan $x - y = ${diff}$. Cari nilai $x$ dan $y$.`), a: T(`$x + y = ${s2}$ and $x - y = ${diff}$, so $x = ${x}$, $y = ${y}$`, `$x + y = ${s2}$ dan $x - y = ${diff}$, maka $x = ${x}$, $y = ${y}$`), w: W(T(`Sum of all ${k} values $= ${m} \\times ${k} = ${m * k}$`, `Hasil tambah kesemua ${k} nilai $= ${m} \\times ${k} = ${m * k}$`), T(`The ${k - 2} known values add up to $${v.join(' + ')} = ${sum(v)}$, so $x + y = ${m * k} - ${sum(v)} = ${s2}$.`, `${k - 2} nilai yang diketahui berjumlah $${v.join(' + ')} = ${sum(v)}$, maka $x + y = ${m * k} - ${sum(v)} = ${s2}$.`), T(`With $x - y = ${diff}$, adding the two equations gives $2x = ${s2} + ${diff} = ${s2 + diff}$.`, `Dengan $x - y = ${diff}$, menambah kedua-dua persamaan memberikan $2x = ${s2} + ${diff} = ${s2 + diff}$.`), T(`$x = ${x}$, so $y = ${s2} - ${x} = ${y}$`, `$x = ${x}$, maka $y = ${s2} - ${x} = ${y}$`)), sp: 'l' };
    },
    /* reverse: original mean from new mean after a known scaling and one more change */
    (r) => {
      const dd = r.pick(DATA), k = r.int(5, 8), a0 = r.pick([2, 3]), b0 = r.int(1, 10), origM = r.int(Math.max(dd.lo + 1, 4), Math.min(dd.hi - 1, 15)), newM = a0 * origM + b0;
      return { q: T(`A data set of the ${dsc(dd, k, 0)} has a mean of $m$. Every value is multiplied by ${a0} and then increased by ${b0}; the new mean is ${newM}. Find the value of $m$.`, `Satu set data bagi ${dsc(dd, k, 1)} mempunyai min $m$. Setiap nilai didarab dengan ${a0} dan kemudian ditambah dengan ${b0}; min baharu ialah ${newM}. Cari nilai $m$.`), a: T(`$${a0}m + ${b0} = ${newM}$, so $m = ${origM}$`, `$${a0}m + ${b0} = ${newM}$, maka $m = ${origM}$`), w: W(T(`Multiplying every value by ${a0} multiplies the mean by ${a0}; adding ${b0} to every value adds ${b0} to the mean.`, `Mendarabkan setiap nilai dengan ${a0} mendarabkan min dengan ${a0}; menambah ${b0} pada setiap nilai menambah ${b0} pada min.`), T(`$${a0}m + ${b0} = ${newM}$`), T(`$${a0}m = ${newM} - ${b0} = ${a0 * origM}$`), T(`$m = ${a0 * origM} \\div ${a0} = ${origM}$`)), sp: 'm' };
    },
  ];
  const ge125x = [
    /* range from a table, before and after adding an extra value */
    (r) => {
      const U = ufSet(r, r.int(5, 6)), lo = U.xs[0], hi = U.xs[U.xs.length - 1], big = hi + r.int(2, 6);
      return { q: T(`The table shows the ${dsc(U.u, U.N, 0)}.<br>${ufTab(0, U)}<br>The range is ${hi - lo}. A new observation of ${big} is added. Find the new range.`, `Jadual menunjukkan ${dsc(U.u, U.N, 1)}.<br>${ufTab(1, U)}<br>Julatnya ialah ${hi - lo}. Satu cerapan baharu ${big} ditambah. Cari julat baharu.`), a: T(`$${big} - ${lo} = ${big - lo}$`), w: W(T(`${big} is larger than every value in the table, so it becomes the new largest value; the smallest is still ${lo}.`, `${big} lebih besar daripada setiap nilai dalam jadual, maka ia menjadi nilai terbesar yang baharu; yang terkecil masih ${lo}.`), T(`New range $= ${big} - ${lo} = ${big - lo}$`, `Julat baharu $= ${big} - ${lo} = ${big - lo}$`)), sp: 's' };
    },
    /* mode unaffected by adding a value equal to the current mode */
    (r) => {
      const U = ufSet(r, r.int(4, 5)), mx = Math.max(...U.fs);
      need(U.fs.filter((f) => f === mx).length === 1);
      const mo = U.xs[U.fs.indexOf(mx)];
      return { q: T(`The table shows the ${dsc(U.u, U.N, 0)}. The mode is ${mo}.<br>${ufTab(0, U)}<br>One more observation of ${mo} is added. State the new mode. Has it changed?`, `Jadual menunjukkan ${dsc(U.u, U.N, 1)}. Modnya ialah ${mo}.<br>${ufTab(1, U)}<br>Satu cerapan lagi ${mo} ditambah. Nyatakan mod baharu. Adakah ia berubah?`), a: T(`Still $${mo}$: it has not changed, since ${mo} was already the most frequent value.`, `Masih $${mo}$: ia tidak berubah, kerana ${mo} sudah pun nilai yang paling kerap.`), w: W(T(`The frequency of ${mo} goes up from $${mx}$ to $${mx + 1}$; every other frequency stays the same.`, `Kekerapan ${mo} naik daripada $${mx}$ kepada $${mx + 1}$; kekerapan lain kekal sama.`), T(`$${mx + 1}$ is still the largest frequency, so the mode is still $${mo}$ — it has not changed.`, `$${mx + 1}$ masih kekerapan terbesar, maka mod masih $${mo}$ — ia tidak berubah.`)), sp: 's' };
    },
    /* fill in the blank: sum stays / mean rule */
    (r) => {
      const d = r.pick(DATA), k = r.int(4, 7), v = g5set(r, d, k);
      return { q: T(`The ${dsc(d, k, 0)} are $${list(v)}$, with a sum of ____ and a mean of ____.`, `${cap(dsc(d, k, 1))} ialah $${list(v)}$, dengan hasil tambah ____ dan min ____.`), a: T(`Sum $= ${sum(v)}$; mean $= ${fm(mean(v))}$`, `Hasil tambah $= ${sum(v)}$; min $= ${fm(mean(v))}$`), w: W(T(`$${v.join(' + ')} = ${sum(v)}$`), T(`There are ${k} values, so the mean is $\\dfrac{${sum(v)}}{${k}} = ${fm(mean(v))}$.`, `Terdapat ${k} nilai, maka min ialah $\\dfrac{${sum(v)}}{${k}} = ${fm(mean(v))}$.`)), sp: 's' };
    },
    /* MCQ: effect of adding a large value on the mean */
    (r) => {
      const d = r.pick(DATA), k = r.int(4, 6), v = g5set(r, d, k), big = d.hi + r.int(5, 20);
      const opts = r.shuffle(['increase', 'decrease', 'stay the same']), msOpt = { increase: 'meningkat', decrease: 'menurun', 'stay the same': 'kekal sama' };
      return { q: T(`The ${dsc(d, k, 0)} are $${list(v)}$. A new value of ${big}, which is larger than all the others, is added. Will the mean increase, decrease or stay the same?<br>${opts.map((x, i) => `${'ABC'[i]}. ${x}`).join('&emsp;')}`, `${cap(dsc(d, k, 1))} ialah $${list(v)}$. Satu nilai baharu ${big}, yang lebih besar daripada semua yang lain, ditambah. Adakah min meningkat, menurun atau kekal sama?<br>${opts.map((x, i) => `${'ABC'[i]}. ${msOpt[x]}`).join('&emsp;')}`), a: T(`${'ABC'[opts.indexOf('increase')]}. increase`, `${'ABC'[opts.indexOf('increase')]}. meningkat`), w: W(T(`Old mean $= \\dfrac{${sum(v)}}{${k}} = ${fm(mean(v))}$`, `Min lama $= \\dfrac{${sum(v)}}{${k}} = ${fm(mean(v))}$`), T(`New mean $= \\dfrac{${sum(v)} + ${big}}{${k + 1}} = ${fm((sum(v) + big) / (k + 1))}$`, `Min baharu $= \\dfrac{${sum(v)} + ${big}}{${k + 1}} = ${fm((sum(v) + big) / (k + 1))}$`), T(`Adding a value above the mean always raises the mean, so the answer is ${'ABC'[opts.indexOf('increase')]}.`, `Menambah nilai yang lebih besar daripada min sentiasa menaikkan min, maka jawapannya ialah ${'ABC'[opts.indexOf('increase')]}.`)), sp: 'xs' };
    },
  ];
  const gm125x = [
    /* bar chart before, table after: new mean */
    (r) => {
      const U = ufSet(r, 4), j = r.int(0, 3), add = r.int(1, 5);
      const nf = U.fs.map((f, i) => (i === j ? f + add : f)), nN = U.N + add, nsx = U.sx + U.xs[j] * add;
      return { q: T(`The bar chart shows the ${dsc(U.u, U.N, 0)}. ${add} more observations of ${U.xs[j]} are recorded. Find the new mean, correct to 2 decimal places.`, `Carta palang menunjukkan ${dsc(U.u, U.N, 1)}. ${add} lagi cerapan ${U.xs[j]} direkodkan. Cari min baharu, betul kepada 2 tempat perpuluhan.`), fig: barFig(U), a: T(`$\\dfrac{${U.sx} + ${U.xs[j]} \\times ${add}}{${U.N} + ${add}} = ${fm(nsx / nN)}$`), w: W(T(`From the bars: frequencies $${U.fs.join(',\\ ')}$`, `Daripada palang: kekerapan $${U.fs.join(',\\ ')}$`), fxLine(U.xs, U.fs, U.sx), T(`$\\sum f = ${U.fs.join(' + ')} = ${U.N}$`), T(`The ${add} new observation${add === 1 ? '' : 's'} of ${U.xs[j]} add $${U.xs[j]} \\times ${add} = ${U.xs[j] * add}$ to $\\sum fx$ and $${add}$ to $\\sum f$.`, `${add} cerapan baharu ${U.xs[j]} menambah $${U.xs[j]} \\times ${add} = ${U.xs[j] * add}$ kepada $\\sum fx$ dan $${add}$ kepada $\\sum f$.`), T(`New mean $= \\dfrac{${U.sx} + ${U.xs[j] * add}}{${U.N} + ${add}} = \\dfrac{${nsx}}{${nN}} = ${fm(nsx / nN)}$`, `Min baharu $= \\dfrac{${U.sx} + ${U.xs[j] * add}}{${U.N} + ${add}} = \\dfrac{${nsx}}{${nN}} = ${fm(nsx / nN)}$`)), sp: 'm' };
    },
    /* dot plot: median before and after removing the largest value */
    (r) => {
      const U = ufSet(r, r.int(5, 6));
      need(Math.max(...U.fs) <= 6);
      const vals = expand(U.xs, U.fs), big = Math.max(...vals), w = vals.filter((v) => v !== big).concat(vals.filter((v) => v === big).slice(1));
      need(vals.length >= 7);
      return { q: T(`The dot plot shows the ${dsc(U.u, vals.length, 0)}. One observation of ${big} (the largest) is removed. Find the median before and after removing it.`, `Plot titik menunjukkan ${dsc(U.u, vals.length, 1)}. Satu cerapan ${big} (yang terbesar) dikeluarkan. Cari median sebelum dan selepas ia dikeluarkan.`), fig: dotFig(vals), a: T(`Before: $${n(median(vals))}$; after: $${n(median(w))}$`, `Sebelum: $${n(median(vals))}$; selepas: $${n(median(w))}$`), w: W(T(`Reading the dots in order: $${list(sortNum(vals))}$`, `Membaca titik mengikut tertib: $${list(sortNum(vals))}$`), medLine(vals.length, median(vals)), T(`After removing one ${big}: $${list(sortNum(w))}$`, `Selepas mengeluarkan satu ${big}: $${list(sortNum(w))}$`), medLine(w.length, median(w))), sp: 'm' };
    },
    /* spot the error in a "new mean" calculation */
    (r) => {
      const d = r.pick(DATA), k = r.int(4, 6), v = g5set(r, d, k), x = r.int(d.lo, d.hi), nm = r.name();
      const wrong = round((sum(v) + x) / k, 2), correct = round((sum(v) + x) / (k + 1), 2);
      return { q: T(`The ${dsc(d, k, 0)} are $${list(v)}$, with a mean of ${fm(mean(v))}. The value ${x} is added. ${nm} calculates the new mean as $\\dfrac{${sum(v)} + ${x}}{${k}} = ${wrong}$.<br>(a) What mistake did ${nm} make?<br>(b) Find the correct new mean.`, `${cap(dsc(d, k, 1))} ialah $${list(v)}$, dengan min ${fm(mean(v))}. Nilai ${x} ditambah. ${nm} mengira min baharu sebagai $\\dfrac{${sum(v)} + ${x}}{${k}} = ${wrong}$.<br>(a) Apakah kesilapan yang dilakukan oleh ${nm}?<br>(b) Cari min baharu yang betul.`), a: SPM.parts([T(`${nm} divided by the old number of values, ${k}, instead of the new total, ${k + 1}.`, `${nm} membahagikan dengan bilangan nilai lama, ${k}, bukan jumlah baharu, ${k + 1}.`), T(`$\\dfrac{${sum(v)} + ${x}}{${k + 1}} = ${correct}$`)]), w: W(T(`(a) The numerator $${sum(v)} + ${x} = ${sum(v) + x}$ is the sum of ${k + 1} values, but ${nm} divided it by ${k}.`, `(a) Pengangka $${sum(v)} + ${x} = ${sum(v) + x}$ ialah hasil tambah ${k + 1} nilai, tetapi ${nm} membahagikannya dengan ${k}.`), T(`(b) $\\dfrac{${sum(v) + x}}{${k + 1}} = ${correct}$`), T(`Always divide by the new number of values.`, `Sentiasa bahagi dengan bilangan nilai yang baharu.`)), sp: 'l' };
    },
    /* pictograph: new mean after a change in key reading (frequency correction) */
    (r) => {
      const U = ufSet(r, 4), key = r.pick([2, 5]), vs = U.fs.map((f) => f * key), j = r.int(0, 3), err = key;
      const shown = vs.map((v, i) => (i === j ? v + err : v));
      const trueSx = sum(U.xs.map((x, i) => x * vs[i])), trueN = sum(vs);
      return { q: T(`The pictograph is meant to show the ${dsc(U.u, 'some', 0)}, with key ● = ${key}.<br>${picTab(0, U.u.h, U.xs, shown, key, U.u.who)}<br>On checking, the frequency of ${U.xs[j]} was miscounted by one symbol too many. Correct the table and find the mean, correct to 2 decimal places.`, `Piktograf ini sepatutnya menunjukkan ${dsc(U.u, 'beberapa', 1)}, dengan kunci ● = ${key}.<br>${picTab(1, U.u.h, U.xs, shown, key, U.u.who)}<br>Selepas disemak, kekerapan ${U.xs[j]} tersilap dikira satu simbol lebih banyak. Betulkan jadual dan cari min, betul kepada 2 tempat perpuluhan.`), a: T(`$\\dfrac{${trueSx}}{${trueN}} = ${fm(trueSx / trueN)}$`), w: W(T(`Each ● stands for ${key}, so the frequencies shown are $${shown.join(',\\ ')}$.`, `Setiap ● mewakili ${key}, maka kekerapan yang ditunjukkan ialah $${shown.join(',\\ ')}$.`), T(`One symbol too many for ${U.xs[j]}: $${shown[j]} - ${key} = ${vs[j]}$, so the corrected frequencies are $${vs.join(',\\ ')}$.`, `Satu simbol terlebih bagi ${U.xs[j]}: $${shown[j]} - ${key} = ${vs[j]}$, maka kekerapan yang betul ialah $${vs.join(',\\ ')}$.`), fxLine(U.xs, vs, trueSx), T(`$\\sum f = ${vs.join(' + ')} = ${trueN}$`), T(`Mean $= \\dfrac{${trueSx}}{${trueN}} = ${fm(trueSx / trueN)}$`, `Min $= \\dfrac{${trueSx}}{${trueN}} = ${fm(trueSx / trueN)}$`)), sp: 'm' };
    },
    /* true/false: does removing the largest value always reduce the range? */
    (r) => {
      const d = r.pick(DATA), k = r.int(5, 7), v = g5set(r, d, k), o = sortNum(v);
      need(o.filter((x) => x === o[o.length - 1]).length === 1);
      const w = v.filter((x) => x !== o[o.length - 1]);
      return { q: T(`The ${dsc(d, k, 0)} are $${list(v)}$. If the largest value is removed, does the range always decrease? Check with this data set.`, `${cap(dsc(d, k, 1))} ialah $${list(v)}$. Jika nilai terbesar dikeluarkan, adakah julat sentiasa berkurang? Semak dengan set data ini.`), a: T(`Range: $${rg(v)} \\to ${rg(w)}$. Yes here (it decreases whenever the removed value was strictly the maximum), unless another value is tied for the maximum.`, `Julat: $${rg(v)} \\to ${rg(w)}$. Ya di sini (ia berkurang apabila nilai yang dikeluarkan ialah maksimum secara ketat), kecuali ada nilai lain yang seri dengan maksimum.`), w: W(T(`Before: $${Math.max(...v)} - ${Math.min(...v)} = ${rg(v)}$`, `Sebelum: $${Math.max(...v)} - ${Math.min(...v)} = ${rg(v)}$`), T(`After removing ${Math.max(...v)}, the largest value is ${Math.max(...w)}: $${Math.max(...w)} - ${Math.min(...w)} = ${rg(w)}$`, `Selepas mengeluarkan ${Math.max(...v)}, nilai terbesar ialah ${Math.max(...w)}: $${Math.max(...w)} - ${Math.min(...w)} = ${rg(w)}$`), T('It decreases here, but not always: if two values are tied for the largest, removing one of them leaves the range unchanged.', 'Julat berkurang di sini, tetapi bukan sentiasa: jika dua nilai seri sebagai yang terbesar, mengeluarkan salah satu daripadanya mengekalkan julat.')), sp: 's' };
    },
  ];
  SPM.extend('F2-12.5', { e: ge125.concat(ge125x), m: gm125.concat(gm125x), a: ga125 });

  /* ====================================================== shared: F2-13 Simple Probability ---- */
  const P = (a, b) => Fr.tex(Fr.make(a, b));
  const Pv = (a, b) => Fr.make(a, b);
  const pct = (a, b) => n(round((100 * a) / b, 2));
  /** '\dfrac{3}{6} = \dfrac{1}{2}', with the simplification shown only when it changes something */
  const frLine = (a, b) => `\\dfrac{${a}}{${b}}${Fr.make(a, b).d === b ? '' : ` = ${P(a, b)}`}`;
  const dec = (a, b) => n(round(a / b, 4));
  const WORDS = ['MATEMATIK', 'SEKOLAH', 'BADMINTON', 'MALAYSIA', 'KALKULATOR', 'UNIVERSITI', 'PERPUSTAKAAN', 'KOMPUTER', 'STATISTIK', 'GEOGRAFI', 'BENDERA', 'KELUARGA', 'KESIHATAN', 'PENDIDIKAN'];
  const vowels = (w) => w.split('').filter((c) => 'AEIOU'.includes(c)).length;
  const letCount = (w, c) => w.split('').filter((x) => x === c).length;
  const COLOURS = [['red', 'merah'], ['blue', 'biru'], ['green', 'hijau'], ['yellow', 'kuning'], ['white', 'putih'], ['black', 'hitam'], ['orange', 'jingga'], ['purple', 'ungu']];
  const OBJ = [['balls|bola', 'ball|bola'], ['marbles|guli', 'marble|guli'], ['counters|kaunter', 'counter|kaunter'], ['cards|kad', 'card|kad'], ['beads|manik', 'bead|manik']].map((s) => s[0].split('|').concat(s[1].split('|')));
  /** a box of coloured objects: 2-4 colours, distinct counts, total <= cap. Returns {obj, cols:[{en,ms,cnt}], tot} */
  const boxSet = (r, cap, kmin, kmax) => {
    const obj = r.pick(OBJ), k = r.int(kmin || 2, kmax || 4), cs = r.sample(COLOURS, k);
    const cnt = Array.from({ length: k }, () => r.int(2, Math.max(3, Math.floor((cap || 30) / k))));
    need(sum(cnt) <= (cap || 30) && new Set(cnt).size === k);
    return { obj, cols: cs.map((c, i) => ({ en: c[0], ms: c[1], cnt: cnt[i] })), tot: sum(cnt) };
  };
  const boxTxt = (b, i) => b.cols.map((c) => `${c.cnt} ${i ? c.ms : c.en} ${i ? b.obj[1] : b.obj[0]}`).join(i ? ' dan ' : ' and ');
  /** a spinner with n equal sectors labelled 1..n or with names */
  const SPFIG = (labels) => {
    const k = labels.length, R = 55, cx = 65, cy = 65;
    let o = '';
    for (let i = 0; i < k; i++) {
      const a0 = (2 * Math.PI * i) / k - Math.PI / 2, a1 = (2 * Math.PI * (i + 1)) / k - Math.PI / 2;
      o += S.path(`M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} A${R},${R} 0 0 1 ${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)} Z`);
      const am = (a0 + a1) / 2;
      o += S.text(cx + R * 0.62 * Math.cos(am), cy + R * 0.62 * Math.sin(am), String(labels[i]), { s: 12 });
    }
    o += S.dot(cx, cy, 2);
    return S.wrap(130, 130, o, 'spinner');
  };
  const EVWORDS = [
    ['an even number|nombor genap', (v) => v % 2 === 0], ['an odd number|nombor ganjil', (v) => v % 2 === 1],
    ['a prime number|nombor perdana', (v) => SPM.isPrime(v)], ['a multiple of 3|gandaan 3', (v) => v % 3 === 0],
    ['a multiple of 5|gandaan 5', (v) => v % 5 === 0], ['a perfect square|nombor kuasa dua sempurna', (v) => Number.isInteger(Math.sqrt(v))],
    ['a factor of 12|faktor bagi 12', (v) => 12 % v === 0], ['greater than 4|lebih besar daripada 4', (v) => v > 4],
    ['at most 3|selebih-lebihnya 3', (v) => v <= 3], ['a single-digit number|nombor satu digit', (v) => v < 10],
  ].map((e) => { const t = e[0].split('|'); return { en: t[0], ms: t[1], f: e[1] }; });

  /* ====================================================== F2-13.1 Experimental vs theoretical probability */
  const TRIALS = [['a fair coin is tossed|sebiji syiling adil dilambung', 'H, T', 2, 'heads|kepala', 1], ['a fair six-sided die is rolled|sebiji dadu adil bersisi enam digolek', '1, 2, 3, 4, 5, 6', 6, 'a six|angka enam', 1], ['a spinner with 4 equal sectors numbered 1 to 4 is spun|sebuah pemutar dengan 4 sektor sama bernombor 1 hingga 4 diputar', '1, 2, 3, 4', 4, 'the number 4|nombor 4', 1], ['a spinner with 5 equal sectors numbered 1 to 5 is spun|sebuah pemutar dengan 5 sektor sama bernombor 1 hingga 5 diputar', '1, 2, 3, 4, 5', 5, 'the number 1|nombor 1', 1], ['a card is drawn from 4 cards labelled A, B, C, D|sekeping kad diambil daripada 4 keping kad berlabel A, B, C, D', 'A, B, C, D', 4, 'card A|kad A', 1], ['a spinner with 3 equal sectors coloured red, green and blue is spun|sebuah pemutar dengan 3 sektor sama berwarna merah, hijau dan biru diputar', 'red, green, blue', 3, 'red|merah', 1]].map((t) => { const p = t[0].split('|'), ev = t[3].split('|'); return { en: p[0], ms: p[1], ss: t[1], n: t[2], evEn: ev[0], evMs: ev[1], evN: t[4] }; });
  const IMPOSS = [
    ['getting a 7 when a fair six-sided die is rolled once|mendapat 7 apabila sebiji dadu adil bersisi enam digolek sekali', 0],
    ['getting heads or tails when a fair coin is tossed|mendapat kepala atau ekor apabila sebiji syiling adil dilambung', 1],
    ['drawing a red ball from a box that contains only blue balls|mengeluarkan bola merah daripada kotak yang hanya mengandungi bola biru', 0],
    ['the sun rising tomorrow|matahari terbit esok', 1],
    ['rolling a number less than 10 on a fair six-sided die|mendapat nombor kurang daripada 10 pada dadu adil bersisi enam', 1],
    ['picking a vowel from the letters of the word "SEKOLAH"|memilih vokal daripada huruf perkataan "SEKOLAH"', -1],
    ['getting a number greater than 6 on a fair six-sided die|mendapat nombor lebih besar daripada 6 pada dadu adil bersisi enam', 0],
    ['choosing a March birthday from a class where nobody was born in March|memilih hari lahir bulan Mac daripada sebuah kelas yang tiada seorang pun dilahirkan pada bulan Mac', 0],
    ['picking an odd number from the cards numbered 2, 4, 6, 8|memilih nombor ganjil daripada kad bernombor 2, 4, 6, 8', 0],
    ['rolling an even or an odd number on a fair six-sided die|mendapat nombor genap atau ganjil pada dadu adil bersisi enam', 1],
  ].map((t) => { const p = t[0].split('|'); return { en: p[0], ms: p[1], v: t[1] }; });
  const g131e = [
    /* list the sample space */
    (r) => {
      const t = r.pick(TRIALS);
      return { q: T(`List the sample space when ${t.en}.`, `Senaraikan ruang sampel apabila ${t.ms}.`), a: T(`$\\{${t.ss}\\}$ (${t.n} outcomes)`, `$\\{${t.ss}\\}$ (${t.n} kesudahan)`), w: W(T('The sample space is the set of every outcome that can happen.', 'Ruang sampel ialah set bagi setiap kesudahan yang boleh berlaku.'), T(`List them once each: $\\{${t.ss}\\}$`, `Senaraikan setiap satu sekali: $\\{${t.ss}\\}$`), T(`That is $${t.n}$ equally likely outcomes.`, `Itu ialah $${t.n}$ kesudahan yang sama boleh jadi.`)), sp: 's' };
    },
    /* number of outcomes in the sample space */
    (r) => {
      const t = r.pick(TRIALS);
      return { q: T(`When ${t.en}, how many possible outcomes are there?`, `Apabila ${t.ms}, berapakah bilangan kesudahan yang mungkin?`), a: T(`$${t.n}$`), w: W(T(`The sample space is $\\{${t.ss}\\}$.`, `Ruang sampelnya ialah $\\{${t.ss}\\}$.`), T(`Counting the outcomes gives $${t.n}$.`, `Membilang kesudahan memberikan $${t.n}$.`)), sp: 'xs' };
    },
    /* experimental probability from a simple count */
    (r) => {
      const t = r.pick(TRIALS.slice(0, 2)), trials = r.pick([20, 25, 40, 50]), f = r.int(Math.round(trials * 0.3), Math.round(trials * 0.7));
      return { q: T(`${cap(t.en)} ${trials} times. ${cap(t.evEn)} occurs ${f} times. Find the experimental probability of ${t.evEn}.`, `${cap(t.ms)} sebanyak ${trials} kali. ${cap(t.evMs)} berlaku sebanyak ${f} kali. Cari kebarangkalian eksperimen bagi ${t.evMs}.`), a: T(`$\\dfrac{${f}}{${trials}} = ${dec(f, trials)}$`), w: W(T('Experimental probability $= \\dfrac{\\text{number of times the event happens}}{\\text{number of trials}}$', 'Kebarangkalian eksperimen $= \\dfrac{\\text{bilangan kali peristiwa berlaku}}{\\text{bilangan percubaan}}$'), T(`$= \\dfrac{${f}}{${trials}} = ${dec(f, trials)}$`)), sp: 's' };
    },
    /* impossible / certain / neither */
    (r) => {
      const t = r.pick(IMPOSS);
      const ans = t.v === 0 ? T('Impossible (probability 0).', 'Mustahil (kebarangkalian 0).') : t.v === 1 ? T('Certain (probability 1).', 'Pasti (kebarangkalian 1).') : T('Neither impossible nor certain (probability is strictly between 0 and 1).', 'Bukan mustahil dan bukan pasti (kebarangkalian terletak secara ketat antara 0 dan 1).');
      return { q: T(`Is the following event impossible, certain, or neither? Give the probability if it is impossible or certain.<br>"${t.en}"`, `Adakah peristiwa berikut mustahil, pasti, atau bukan kedua-duanya? Berikan kebarangkalian jika ia mustahil atau pasti.<br>"${t.ms}"`), a: ans, w: W(T('Ask how many outcomes of the sample space make the event happen.', 'Tanya berapa banyak kesudahan dalam ruang sampel yang menyebabkan peristiwa itu berlaku.'), t.v === 0 ? T('None of them do, so the event can never happen: $P = 0$.', 'Tiada satu pun, maka peristiwa itu tidak mungkin berlaku: $P = 0$.') : t.v === 1 ? T('All of them do, so the event always happens: $P = 1$.', 'Kesemuanya, maka peristiwa itu sentiasa berlaku: $P = 1$.') : T('Some do and some do not, so the probability lies strictly between $0$ and $1$.', 'Ada yang ya dan ada yang tidak, maka kebarangkaliannya terletak secara ketat antara $0$ dan $1$.')), sp: 's' };
    },
    /* define terms */
    (r) => {
      const d = r.pick([['experiment|eksperimen', 'an action that is carried out to produce results that can be observed|satu tindakan yang dijalankan untuk menghasilkan keputusan yang boleh dicerap'], ['outcome|kesudahan', 'a possible result of an experiment|hasil yang mungkin daripada satu eksperimen'], ['sample space|ruang sampel', 'the set of all possible outcomes of an experiment|set semua kesudahan yang mungkin bagi satu eksperimen'], ['event|peristiwa', 'a set of one or more outcomes of an experiment|satu set yang mengandungi satu atau lebih kesudahan bagi satu eksperimen']]);
      const t = d[0].split('|'), m = d[1].split('|');
      return { q: T(`In probability, what is meant by "${t[0]}"?`, `Dalam kebarangkalian, apakah maksud "${t[1]}"?`), a: T(cap(m[0]) + '.', cap(m[1]) + '.'), w: W(T(`${cap(t[0])} means ${m[0]}.`, `${cap(t[1])} bermaksud ${m[1]}.`), T('Example: rolling a die is the experiment, getting a 3 is an outcome, $\\{1, 2, 3, 4, 5, 6\\}$ is the sample space, and "an even number" is an event.', 'Contoh: menggolek dadu ialah eksperimen, mendapat 3 ialah kesudahan, $\\{1, 2, 3, 4, 5, 6\\}$ ialah ruang sampel, dan "nombor genap" ialah peristiwa.')), sp: 's' };
    },
    /* theoretical probability of the reference event, to compare with */
    (r) => {
      const t = r.pick(TRIALS);
      return { q: T(`When ${t.en}, find the theoretical probability of ${t.evEn}.`, `Apabila ${t.ms}, cari kebarangkalian teori bagi ${t.evMs}.`), a: T(`$${P(t.evN, t.n)}$`), w: W(T(`The ${t.n} outcomes $\\{${t.ss}\\}$ are equally likely.`, `${t.n} kesudahan $\\{${t.ss}\\}$ adalah sama boleh jadi.`), T('Theoretical probability $= \\dfrac{\\text{number of favourable outcomes}}{\\text{number of outcomes in the sample space}}$', 'Kebarangkalian teori $= \\dfrac{\\text{bilangan kesudahan yang dikehendaki}}{\\text{bilangan kesudahan dalam ruang sampel}}$'), T(`$= ${frLine(t.evN, t.n)}$`)), sp: 's' };
    },
    /* box of balls: list the sample space and count outcomes */
    (r) => {
      const b = boxSet(r, 20, 2, 3);
      return { q: T(`A box contains ${boxTxt(b, 0)}. One ${b.obj[2]} is drawn at random. List the possible colours (the sample space) and state how many ${b.obj[0]} there are altogether.`, `Sebuah kotak mengandungi ${boxTxt(b, 1)}. Satu ${b.obj[3]} dipilih secara rawak. Senaraikan warna yang mungkin (ruang sampel) dan nyatakan jumlah ${b.obj[1]} kesemuanya.`), a: T(`{${b.cols.map((c) => c.en).join(', ')}}; ${b.tot} ${b.obj[0]}`, `{${b.cols.map((c) => c.ms).join(', ')}}; ${b.tot} ${b.obj[1]}`), w: W(T(`The colours that can be drawn are the sample space: {${b.cols.map((c) => c.en).join(', ')}}.`, `Warna yang boleh dipilih ialah ruang sampel: {${b.cols.map((c) => c.ms).join(', ')}}.`), T(`Total $= ${b.cols.map((c) => c.cnt).join(' + ')} = ${b.tot}$`, `Jumlah $= ${b.cols.map((c) => c.cnt).join(' + ')} = ${b.tot}$`)), sp: 's' };
    },
    /* letter-word: sample space when a letter is chosen */
    (r) => {
      const w = r.pick(WORDS);
      return { q: T(`A letter is chosen at random from the letters of the word "${w}". How many possible outcomes are there?`, `Satu huruf dipilih secara rawak daripada huruf perkataan "${w}". Berapakah bilangan kesudahan yang mungkin?`), a: T(`$${w.length}$ (one for each letter, including repeats)`, `$${w.length}$ (satu bagi setiap huruf, termasuk yang berulang)`), w: W(T(`Count the letters of "${w}" one by one: $${w.length}$.`, `Bilang huruf "${w}" satu demi satu: $${w.length}$.`), new Set(w.split('')).size === w.length ? T('Every letter is one equally likely outcome.', 'Setiap huruf ialah satu kesudahan yang sama boleh jadi.') : T(`A repeated letter gives a separate outcome each time, so the answer is $${w.length}$ and not ${new Set(w.split('')).size} (the number of different letters).`, `Huruf yang berulang memberikan kesudahan berasingan setiap kali, maka jawapannya ialah $${w.length}$ dan bukan ${new Set(w.split('')).size} (bilangan huruf yang berbeza).`)), sp: 's' };
    },
    /* MCQ: impossible vs certain probability value */
    (r) => {
      const t = r.pick(IMPOSS.filter((x) => x.v !== -1)), opts = r.shuffle([0, 1, 0.5]);
      return { q: T(`What is the probability of the event "${t.en}"?<br>${opts.map((x, i) => `${'ABC'[i]}. ${x}`).join('&emsp;')}`, `Apakah kebarangkalian peristiwa "${t.ms}"?<br>${opts.map((x, i) => `${'ABC'[i]}. ${x}`).join('&emsp;')}`), a: T(`${'ABC'[opts.indexOf(t.v)]}. ${t.v}`), w: W(t.v === 0 ? T('No outcome makes this event happen, so it is impossible.', 'Tiada kesudahan yang menyebabkan peristiwa ini berlaku, maka ia mustahil.') : T('Every outcome makes this event happen, so it is certain.', 'Setiap kesudahan menyebabkan peristiwa ini berlaku, maka ia pasti.'), T(`$P = ${t.v}$, option ${'ABC'[opts.indexOf(t.v)]}.`, `$P = ${t.v}$, pilihan ${'ABC'[opts.indexOf(t.v)]}.`)), sp: 'xs' };
    },
  ];
  const g131m = [
    /* experimental vs theoretical, compare and explain */
    (r) => {
      const t = r.pick(TRIALS), trials = r.pick([30, 40, 50, 60, 80, 100]), thp = t.evN / t.n, f = Math.round(trials * (thp + r.pick([-0.15, -0.1, -0.06, 0.06, 0.1, 0.15])));
      need(f >= 1 && f <= trials - 1);
      return { q: T(`${cap(t.en)} ${trials} times and ${t.evEn} occurs ${f} times.<br>(a) Find the experimental probability of ${t.evEn}.<br>(b) Find the theoretical probability of ${t.evEn}.<br>(c) Explain why the two values may not be equal.`, `${cap(t.ms)} sebanyak ${trials} kali dan ${t.evMs} berlaku sebanyak ${f} kali.<br>(a) Cari kebarangkalian eksperimen bagi ${t.evMs}.<br>(b) Cari kebarangkalian teori bagi ${t.evMs}.<br>(c) Terangkan mengapa kedua-dua nilai itu mungkin tidak sama.`), a: SPM.parts([T(`$\\dfrac{${f}}{${trials}} = ${dec(f, trials)}$`), T(`$${P(t.evN, t.n)} = ${dec(t.evN, t.n)}$`), T('The experimental probability depends on chance in a limited number of trials, so it can differ from the theoretical value; it tends to get closer with more trials.', 'Kebarangkalian eksperimen bergantung pada peluang dalam bilangan percubaan yang terhad, maka ia boleh berbeza daripada nilai teori; ia cenderung semakin hampir dengan lebih banyak percubaan.')]), w: W(T(`(a) Experimental: $\\dfrac{\\text{number of times it happened}}{\\text{number of trials}} = \\dfrac{${f}}{${trials}} = ${dec(f, trials)}$`, `(a) Eksperimen: $\\dfrac{\\text{bilangan kali ia berlaku}}{\\text{bilangan percubaan}} = \\dfrac{${f}}{${trials}} = ${dec(f, trials)}$`), T(`(b) The sample space $\\{${t.ss}\\}$ has $${t.n}$ equally likely outcomes, of which $${t.evN}$ gives the event: $${frLine(t.evN, t.n)} = ${dec(t.evN, t.n)}$`, `(b) Ruang sampel $\\{${t.ss}\\}$ mempunyai $${t.n}$ kesudahan sama boleh jadi, dan $${t.evN}$ daripadanya memberikan peristiwa itu: $${frLine(t.evN, t.n)} = ${dec(t.evN, t.n)}$`), T(`(c) $${dec(f, trials)}$ and $${dec(t.evN, t.n)}$ need not be equal: ${trials} trials are affected by chance. With more trials the experimental value usually moves closer to the theoretical one.`, `(c) $${dec(f, trials)}$ dan $${dec(t.evN, t.n)}$ tidak semestinya sama: ${trials} percubaan dipengaruhi oleh peluang. Dengan lebih banyak percubaan, nilai eksperimen biasanya menghampiri nilai teori.`)), sp: 'l' };
    },
    /* complete a frequency table then compute experimental probability */
    (r) => {
      const t = r.pick(TRIALS.filter((x) => x.n <= 6)), trials = r.pick([30, 40, 50]);
      const fs = Array.from({ length: t.n }, () => r.int(Math.floor(trials / t.n) - 2, Math.floor(trials / t.n) + 3));
      const diff = trials - sum(fs);
      fs[r.int(0, t.n - 1)] += diff;
      need(fs.every((f) => f >= 1) && sum(fs) === trials);
      const outs = t.ss.split(', ');
      const tb = (i) => SPM.table([[FQ.split('|')[i]].concat(fs)], { head: [i ? 'Kesudahan' : 'Outcome'].concat(outs) });
      const j = r.int(0, outs.length - 1);
      return { q: T(`${cap(t.en)} ${trials} times. The results are shown in the table.<br>${tb(0)}<br>Find the experimental probability of getting ${outs[j]}.`, `${cap(t.ms)} sebanyak ${trials} kali. Keputusan ditunjukkan dalam jadual.<br>${tb(1)}<br>Cari kebarangkalian eksperimen mendapat ${outs[j]}.`), a: T(`$\\dfrac{${fs[j]}}{${trials}} = ${dec(fs[j], trials)}$`), w: W(T(`The table gives ${outs[j]} a frequency of $${fs[j]}$, out of $${fs.join(' + ')} = ${trials}$ trials.`, `Jadual memberikan ${outs[j]} kekerapan $${fs[j]}$, daripada $${fs.join(' + ')} = ${trials}$ percubaan.`), T(`$\\dfrac{${fs[j]}}{${trials}} = ${dec(fs[j], trials)}$`)), sp: 'm' };
    },
    /* two experiments, different trial counts, compare closeness to theoretical */
    (r) => {
      const t = r.pick(TRIALS.slice(0, 2)), thp = t.evN / t.n, small = r.pick([10, 20]), big = r.pick([100, 200]);
      const fS = Math.round(small * (thp + r.pick([-0.2, 0.2]))), fB = Math.round(big * (thp + r.pick([-0.03, 0.03])));
      need(fS >= 1 && fS <= small - 1 && fB >= 1 && fB <= big - 1);
      return { q: T(`${cap(t.en)} ${small} times, giving ${t.evEn} ${fS} times. It is then repeated ${big} times, giving ${t.evEn} ${fB} times.<br>(a) Find the experimental probability from each set of trials.<br>(b) Which is closer to the theoretical probability of ${dec(t.evN, t.n)}? Why?`, `${cap(t.ms)} sebanyak ${small} kali, memberikan ${t.evMs} sebanyak ${fS} kali. Ia kemudian diulang sebanyak ${big} kali, memberikan ${t.evMs} sebanyak ${fB} kali.<br>(a) Cari kebarangkalian eksperimen daripada setiap set percubaan.<br>(b) Yang manakah lebih hampir dengan kebarangkalian teori ${dec(t.evN, t.n)}? Mengapa?`), a: SPM.parts([T(`$\\dfrac{${fS}}{${small}} = ${dec(fS, small)}$ and $\\dfrac{${fB}}{${big}} = ${dec(fB, big)}$`, `$\\dfrac{${fS}}{${small}} = ${dec(fS, small)}$ dan $\\dfrac{${fB}}{${big}} = ${dec(fB, big)}$`), T(`The ${big}-trial value, since experimental probability tends to approach the theoretical value as the number of trials increases.`, `Nilai ${big} percubaan, kerana kebarangkalian eksperimen cenderung menghampiri nilai teori apabila bilangan percubaan bertambah.`)]), w: W(T(`(a) $\\dfrac{${fS}}{${small}} = ${dec(fS, small)}$ and $\\dfrac{${fB}}{${big}} = ${dec(fB, big)}$`, `(a) $\\dfrac{${fS}}{${small}} = ${dec(fS, small)}$ dan $\\dfrac{${fB}}{${big}} = ${dec(fB, big)}$`), T(`(b) Distance from $${dec(t.evN, t.n)}$: $${n(round(Math.abs(fS / small - thp), 4))}$ against $${n(round(Math.abs(fB / big - thp), 4))}$.`, `(b) Jarak daripada $${dec(t.evN, t.n)}$: $${n(round(Math.abs(fS / small - thp), 4))}$ berbanding $${n(round(Math.abs(fB / big - thp), 4))}$.`), T(`The ${big}-trial value is closer, because more trials even out the effect of chance.`, `Nilai ${big} percubaan lebih hampir, kerana lebih banyak percubaan meratakan kesan peluang.`)), sp: 'l' };
    },
    /* which of two claims is impossible/certain, explain */
    (r) => {
      const t = r.pick(IMPOSS.filter((x) => x.v !== -1));
      return { q: T(`A student says: "${t.en[0].toUpperCase() + t.en.slice(1)} has a probability of 0.5." Comment on this claim.`, `Seorang murid berkata: "${t.ms[0].toUpperCase() + t.ms.slice(1)} mempunyai kebarangkalian 0.5." Berikan ulasan tentang dakwaan ini.`), a: t.v === 0 ? T('This is wrong: the event is impossible, so its probability is 0, not 0.5.', 'Ini salah: peristiwa itu mustahil, maka kebarangkaliannya ialah 0, bukan 0.5.') : T('This is wrong: the event is certain, so its probability is 1, not 0.5.', 'Ini salah: peristiwa itu pasti, maka kebarangkaliannya ialah 1, bukan 0.5.'), w: W(T('A probability of $0.5$ would mean that half of the equally likely outcomes give the event.', 'Kebarangkalian $0.5$ bermaksud separuh daripada kesudahan yang sama boleh jadi memberikan peristiwa itu.'), t.v === 0 ? T('Here no outcome at all gives the event, so the probability is $0$.', 'Di sini tiada satu pun kesudahan memberikan peristiwa itu, maka kebarangkaliannya ialah $0$.') : T('Here every outcome gives the event, so the probability is $1$.', 'Di sini setiap kesudahan memberikan peristiwa itu, maka kebarangkaliannya ialah $1$.'), T('The claim is therefore wrong.', 'Maka dakwaan itu salah.')), sp: 's' };
    },
      /* bar chart of trial results: experimental probability */
    (r) => {
      const t = r.pick(TRIALS.filter((x) => x.n <= 6)), trials = r.pick([30, 40, 50]);
      const outs = t.ss.split(', ');
      const fs = Array.from({ length: t.n }, () => r.int(Math.floor(trials / t.n) - 2, Math.floor(trials / t.n) + 3));
      fs[r.int(0, t.n - 1)] += trials - sum(fs);
      need(fs.every((f) => f >= 1) && sum(fs) === trials);
      const mk = (i) => S.bar({ cats: outs, vals: fs, ymax: Math.ceil((Math.max(...fs) + 1) / 2) * 2, ystep: 2, ylabel: i ? 'Kekerapan' : 'Frequency', w: 300, h: 190 });
      const j = r.int(0, outs.length - 1);
      return { q: T(`The bar chart shows the results of ${trials} trials of "${t.en}". Find the experimental probability of getting ${outs[j]}.`, `Carta palang menunjukkan keputusan ${trials} percubaan bagi "${t.ms}". Cari kebarangkalian eksperimen mendapat ${outs[j]}.`), fig: T(mk(0), mk(1)), a: T(`$\\dfrac{${fs[j]}}{${trials}} = ${dec(fs[j], trials)}$`), w: W(T(`Read the bars: $${fs.join(',\\ ')}$, and $${fs.join(' + ')} = ${trials}$ trials in all.`, `Baca palang: $${fs.join(',\\ ')}$, dan $${fs.join(' + ')} = ${trials}$ percubaan kesemuanya.`), T(`The bar for ${outs[j]} has height $${fs[j]}$.`, `Palang bagi ${outs[j]} mempunyai tinggi $${fs[j]}$.`), T(`$\\dfrac{${fs[j]}}{${trials}} = ${dec(fs[j], trials)}$`)), sp: 'm' };
    },
    /* MCQ: which trial count gives the more reliable estimate */
    (r) => {
      const small = r.pick([10, 15, 20]), big = r.pick([300, 500, 1000]);
      const opts = r.shuffle([`${small} trials`, `${big} trials`, 'both are equally reliable']);
      const optsMs = { [`${small} trials`]: `${small} percubaan`, [`${big} trials`]: `${big} percubaan`, 'both are equally reliable': 'kedua-duanya sama boleh dipercayai' };
      return { q: T(`An experiment is repeated ${small} times and also ${big} times. Which gives a more reliable estimate of the theoretical probability?<br>${opts.map((x, i) => `${'ABC'[i]}. ${x}`).join('&emsp;')}`, `Satu eksperimen diulang sebanyak ${small} kali dan juga ${big} kali. Yang manakah memberikan anggaran yang lebih boleh dipercayai bagi kebarangkalian teori?<br>${opts.map((x, i) => `${'ABC'[i]}. ${optsMs[x]}`).join('&emsp;')}`), a: T(`${'ABC'[opts.indexOf(`${big} trials`)]}. ${big} trials`, `${'ABC'[opts.indexOf(`${big} trials`)]}. ${big} percubaan`), w: W(T(`In only ${small} trials one lucky or unlucky run changes the fraction a lot; in ${big} trials it hardly moves it.`, `Dalam ${small} percubaan sahaja, satu rentetan bernasib baik atau buruk mengubah pecahan itu dengan banyak; dalam ${big} percubaan ia hampir tidak berubah.`), T(`So the ${big} trials give the more reliable estimate: option ${'ABC'[opts.indexOf(`${big} trials`)]}.`, `Maka ${big} percubaan memberikan anggaran yang lebih boleh dipercayai: pilihan ${'ABC'[opts.indexOf(`${big} trials`)]}.`)), sp: 'xs' };
    },
    /* fill in the blank: probability values */
    (r) => {
      const t = r.pick(TRIALS);
      return { q: T(`When ${t.en}, the theoretical probability of ${t.evEn} is ____, expressed as a decimal correct to 2 decimal places it is ____.`, `Apabila ${t.ms}, kebarangkalian teori bagi ${t.evMs} ialah ____, dinyatakan sebagai perpuluhan betul kepada 2 tempat perpuluhan ialah ____.`), a: T(`$${P(t.evN, t.n)}$; $${SPM.fx(t.evN / t.n, 2)}$`), w: W(T(`Sample space $\\{${t.ss}\\}$: favourable outcomes $${t.evN}$, outcomes in all $${t.n}$.`, `Ruang sampel $\\{${t.ss}\\}$: kesudahan yang dikehendaki $${t.evN}$, jumlah kesudahan $${t.n}$.`), T(`$${frLine(t.evN, t.n)}$`), T(`As a decimal: $${t.evN} \\div ${t.n} = ${SPM.fx(t.evN / t.n, 2)}$`, `Sebagai perpuluhan: $${t.evN} \\div ${t.n} = ${SPM.fx(t.evN / t.n, 2)}$`)), sp: 's' };
    },
    /* ball box: experimental probability with replacement, compared with theoretical */
    (r) => {
      const b = boxSet(r, 20, 2, 2), c0 = b.cols[0], trials = r.pick([25, 30, 40]), thp = c0.cnt / b.tot, f = Math.round(trials * (thp + r.pick([-0.12, -0.08, 0.08, 0.12])));
      need(f >= 1 && f <= trials - 1);
      return { q: T(`A box contains ${boxTxt(b, 0)}. A ${b.obj[2]} is drawn at random and then put back, and this is repeated ${trials} times. A ${b.obj[2]} of ${c0.en} colour is drawn ${f} times.<br>(a) Find the experimental probability of drawing ${c0.en}.<br>(b) Find the theoretical probability of drawing ${c0.en}.`, `Sebuah kotak mengandungi ${boxTxt(b, 1)}. Satu ${b.obj[3]} dipilih secara rawak dan dikembalikan, dan ini diulang sebanyak ${trials} kali. Satu ${b.obj[3]} berwarna ${c0.ms} dipilih sebanyak ${f} kali.<br>(a) Cari kebarangkalian eksperimen memilih warna ${c0.ms}.<br>(b) Cari kebarangkalian teori memilih warna ${c0.ms}.`), a: SPM.parts([T(`$\\dfrac{${f}}{${trials}} = ${dec(f, trials)}$`), T(`$${P(c0.cnt, b.tot)} = ${dec(c0.cnt, b.tot)}$`)]), w: W(T(`(a) Experimental: $\\dfrac{\\text{times it happened}}{\\text{trials}} = \\dfrac{${f}}{${trials}} = ${dec(f, trials)}$`, `(a) Eksperimen: $\\dfrac{\\text{bilangan kali berlaku}}{\\text{percubaan}} = \\dfrac{${f}}{${trials}} = ${dec(f, trials)}$`), T(`(b) The box holds $${b.cols.map((c) => c.cnt).join(' + ')} = ${b.tot}$ ${b.obj[0]}, of which $${c0.cnt}$ are ${c0.en}.`, `(b) Kotak itu mengandungi $${b.cols.map((c) => c.cnt).join(' + ')} = ${b.tot}$ ${b.obj[1]}, dan $${c0.cnt}$ daripadanya berwarna ${c0.ms}.`), T(`$${frLine(c0.cnt, b.tot)} = ${dec(c0.cnt, b.tot)}$`), T('The drawn object is replaced each time, so the theoretical probability stays the same for every trial.', 'Objek yang dipilih dikembalikan setiap kali, maka kebarangkalian teori kekal sama bagi setiap percubaan.')), sp: 'm' };
    },
    /* MCQ: which experimental result is closest to the theoretical probability */
    (r) => {
      const t = r.pick(TRIALS.slice(0, 2)), thp = t.evN / t.n, trials = r.pick([40, 50]);
      const near = Math.round(trials * thp), far1 = near + r.int(4, 8), far2 = Math.max(1, near - r.int(4, 8));
      need(far1 <= trials - 1 && far2 >= 1 && far2 !== near);
      const opts = r.shuffle([near, far1, far2]);
      return { q: T(`${cap(t.en)} ${trials} times. Which number of times getting ${t.evEn} would give an experimental probability closest to the theoretical value?<br>${opts.map((x, i) => `${'ABC'[i]}. ${x} times`).join('&emsp;')}`, `${cap(t.ms)} sebanyak ${trials} kali. Bilangan kali manakah untuk mendapat ${t.evMs} akan memberikan kebarangkalian eksperimen paling hampir dengan nilai teori?<br>${opts.map((x, i) => `${'ABC'[i]}. ${x} kali`).join('&emsp;')}`), a: T(`${'ABC'[opts.indexOf(near)]}. ${near} times`, `${'ABC'[opts.indexOf(near)]}. ${near} kali`), w: W(T(`Theoretical probability $= ${frLine(t.evN, t.n)}$`, `Kebarangkalian teori $= ${frLine(t.evN, t.n)}$`), T(`Expected number of times $= ${P(t.evN, t.n)} \\times ${trials} = ${near}$`, `Bilangan kali yang dijangka $= ${P(t.evN, t.n)} \\times ${trials} = ${near}$`), T(`So ${near} times is the closest: option ${'ABC'[opts.indexOf(near)]}.`, `Maka ${near} kali paling hampir: pilihan ${'ABC'[opts.indexOf(near)]}.`)), sp: 'xs' };
    },
  ];
  const g131a = [
    /* multi-trial table: describe the tendency */
    (r) => {
      const t = r.pick(TRIALS.slice(0, 2)), thp = t.evN / t.n;
      const ns = [10, 50, 200, 1000];
      const hs = ns.map((k, i) => Math.round(k * (thp + [0.2, 0.08, 0.03, 0.008][i] * r.pick([-1, 1]))));
      const tab = (i) => SPM.table([[i ? 'Percubaan' : 'Trials', ...ns], [i ? 'Kekerapan' : 'Frequency', ...hs], [i ? 'K. eksperimen' : 'P(experimental)', ...ns.map(() => '')]], { rowHead: true });
      return { q: T(`${cap(t.en)} several times. Complete the table of experimental probabilities of ${t.evEn} and describe what happens as the number of trials increases.<br>${tab(0)}`, `${cap(t.ms)} beberapa kali. Lengkapkan jadual kebarangkalian eksperimen bagi ${t.evMs} dan huraikan apa yang berlaku apabila bilangan percubaan bertambah.<br>${tab(1)}`), a: T(`${hs.map((h, i) => n(round(h / ns[i], 3))).join(', ')}. The experimental probability tends to get closer to the theoretical value ${dec(t.evN, t.n)} as the number of trials grows.`, `${hs.map((h, i) => n(round(h / ns[i], 3))).join(', ')}. Kebarangkalian eksperimen cenderung menghampiri nilai teori ${dec(t.evN, t.n)} apabila bilangan percubaan bertambah.`), w: W(T('Each cell is $\\dfrac{\\text{frequency}}{\\text{number of trials}}$.', 'Setiap sel ialah $\\dfrac{\\text{kekerapan}}{\\text{bilangan percubaan}}$.'), ...ns.map((k0, i) => T(`$\\dfrac{${hs[i]}}{${k0}} = ${n(round(hs[i] / ns[i], 3))}$`)), T(`The theoretical probability is $${frLine(t.evN, t.n)} = ${dec(t.evN, t.n)}$, and the values move towards it as the number of trials grows.`, `Kebarangkalian teori ialah $${frLine(t.evN, t.n)} = ${dec(t.evN, t.n)}$, dan nilai-nilai itu menghampirinya apabila bilangan percubaan bertambah.`)), sp: 'm' };
    },
    /* estimate a probability from a large data set, recognise it need not equal the theoretical value */
    (r) => {
      const t = r.pick(TRIALS.slice(0, 2)), trials = r.pick([500, 800, 1000]), thp = t.evN / t.n, f = Math.round(trials * (thp + r.pick([-0.02, -0.015, 0.015, 0.02])));
      return { q: T(`The experiment "${t.en}" is repeated ${trials} times, and ${t.evEn} occurs ${f} times.<br>(a) Estimate the probability of ${t.evEn} from this data.<br>(b) Is this estimate certain to equal the theoretical probability exactly? Explain.`, `Eksperimen "${t.ms}" diulang sebanyak ${trials} kali, dan ${t.evMs} berlaku sebanyak ${f} kali.<br>(a) Anggarkan kebarangkalian ${t.evMs} daripada data ini.<br>(b) Adakah anggaran ini pasti sama dengan kebarangkalian teori secara tepat? Terangkan.`), a: SPM.parts([T(`$\\dfrac{${f}}{${trials}} = ${dec(f, trials)}$`), T(`No. It is only a close estimate; small chance variations mean it need not exactly equal the theoretical probability of ${dec(t.evN, t.n)}, even with many trials.`, `Tidak. Ia hanya anggaran yang hampir; variasi peluang yang kecil bermaksud ia tidak semestinya sama tepat dengan kebarangkalian teori ${dec(t.evN, t.n)}, walaupun dengan banyak percubaan.`)]), w: W(T(`(a) $\\dfrac{${f}}{${trials}} = ${dec(f, trials)}$`), T(`(b) The theoretical value is $${frLine(t.evN, t.n)} = ${dec(t.evN, t.n)}$; the estimate ${dec(f, trials)} is close but not equal.`, `(b) Nilai teori ialah $${frLine(t.evN, t.n)} = ${dec(t.evN, t.n)}$; anggaran ${dec(f, trials)} hampir tetapi tidak sama.`), T(`The result depends on how the ${trials} trials happened to fall, so it is only an estimate; more trials usually bring it closer still, but never guarantee an exact match.`, `Keputusan bergantung pada cara ${trials} percubaan itu berlaku, maka ia hanya anggaran; lebih banyak percubaan biasanya menjadikannya lebih hampir, tetapi tidak menjamin padanan yang tepat.`)), sp: 'l' };
    },
    /* design/critique: identify impossible vs certain vs neither, three cases */
    (r) => {
      const ts = r.sample(IMPOSS, 3);
      return { q: T(`Classify each event as impossible, certain, or neither.<br>(a) ${ts[0].en}<br>(b) ${ts[1].en}<br>(c) ${ts[2].en}`, `Kelaskan setiap peristiwa sebagai mustahil, pasti, atau bukan kedua-duanya.<br>(a) ${ts[0].ms}<br>(b) ${ts[1].ms}<br>(c) ${ts[2].ms}`), a: SPM.parts(ts.map((t) => (t.v === 0 ? T('Impossible', 'Mustahil') : t.v === 1 ? T('Certain', 'Pasti') : T('Neither', 'Bukan kedua-duanya')))), w: W(T('For each event, ask how many outcomes of the sample space make it happen: none $\\to$ impossible ($P = 0$), all $\\to$ certain ($P = 1$), some $\\to$ neither.', 'Bagi setiap peristiwa, tanya berapa banyak kesudahan dalam ruang sampel yang menyebabkannya berlaku: tiada $\\to$ mustahil ($P = 0$), semua $\\to$ pasti ($P = 1$), sebahagian $\\to$ bukan kedua-duanya.'), ...ts.map((t, i) => T(`(${'abc'[i]}) ${t.v === 0 ? 'no outcome gives it → impossible' : t.v === 1 ? 'every outcome gives it → certain' : 'only some outcomes give it → neither'}`, `(${'abc'[i]}) ${t.v === 0 ? 'tiada kesudahan memberikannya → mustahil' : t.v === 1 ? 'setiap kesudahan memberikannya → pasti' : 'hanya sebahagian kesudahan memberikannya → bukan kedua-duanya'}`))), sp: 'm' };
    },
    /* compare two events' experimental results across trial sizes, draw conclusion with reasoning */
    (r) => {
      const t = r.pick(TRIALS.slice(0, 2)), thp = t.evN / t.n;
      const a1 = r.pick([20, 25]), b1 = r.pick([200, 250]);
      const fa = Math.round(a1 * (thp + r.pick([-0.2, 0.2]))), fb = Math.round(b1 * (thp + r.pick([-0.02, 0.02])));
      need(fa >= 1 && fa <= a1 - 1);
      return { q: T(`Amir carries out the experiment "${t.en}" ${a1} times and gets ${t.evEn} ${fa} times. Farah repeats it ${b1} times and gets ${t.evEn} ${fb} times.<br>(a) Calculate each experimental probability.<br>(b) Whose result is more reliable as an estimate of the theoretical probability? Justify your answer using the number of trials.`, `Amir menjalankan eksperimen "${t.ms}" sebanyak ${a1} kali dan mendapat ${t.evMs} sebanyak ${fa} kali. Farah mengulanginya sebanyak ${b1} kali dan mendapat ${t.evMs} sebanyak ${fb} kali.<br>(a) Hitung setiap kebarangkalian eksperimen.<br>(b) Keputusan siapakah yang lebih boleh dipercayai sebagai anggaran kebarangkalian teori? Justifikasikan jawapan anda menggunakan bilangan percubaan.`), a: SPM.parts([T(`Amir: $\\dfrac{${fa}}{${a1}} = ${dec(fa, a1)}$; Farah: $\\dfrac{${fb}}{${b1}} = ${dec(fb, b1)}$`), T(`Farah's, because a larger number of trials generally gives an experimental probability closer to the theoretical value.`, `Farah, kerana bilangan percubaan yang lebih besar secara umumnya memberikan kebarangkalian eksperimen yang lebih hampir dengan nilai teori.`)]), w: W(T(`(a) Amir: $\\dfrac{${fa}}{${a1}} = ${dec(fa, a1)}$`, `(a) Amir: $\\dfrac{${fa}}{${a1}} = ${dec(fa, a1)}$`), T(`Farah: $\\dfrac{${fb}}{${b1}} = ${dec(fb, b1)}$`), T(`(b) The theoretical value is $${frLine(t.evN, t.n)} = ${dec(t.evN, t.n)}$.`, `(b) Nilai teori ialah $${frLine(t.evN, t.n)} = ${dec(t.evN, t.n)}$.`), T(`Amir used only ${a1} trials and Farah ${b1}; with more trials chance evens out, so Farah's estimate is the more reliable.`, `Amir hanya menggunakan ${a1} percubaan dan Farah ${b1}; dengan lebih banyak percubaan, kesan peluang menjadi rata, maka anggaran Farah lebih boleh dipercayai.`)), sp: 'l' };
    },
  ];
  SPM.extend('F2-13.1', { e: g131e, m: g131m, a: g131a });

  /* ====================================================== F2-13.2 Theoretical probability of equally likely outcomes */
  const DICEN = [6, 8, 10, 12];
  const CARDN = [10, 12, 15, 16, 18, 20, 24, 25, 30, 32, 36, 40];
  const pctOf = (a, b) => n(round((100 * a) / b, 2));
  const g132e = [
    /* P(specific number on a die) */
    (r) => {
      const nD = r.pick(DICEN), k = r.int(1, nD);
      return { q: T(`A fair ${nD}-sided die, numbered 1 to ${nD}, is rolled. Find the probability of getting ${k}.`, `Sebiji dadu adil bersisi ${nD}, bernombor 1 hingga ${nD}, digolek. Cari kebarangkalian mendapat ${k}.`), a: T(`$${P(1, nD)}$`), w: W(T(`The sample space is $\\{1, 2, \\ldots, ${nD}\\}$: $${nD}$ equally likely outcomes.`, `Ruang sampelnya ialah $\\{1, 2, \\ldots, ${nD}\\}$: $${nD}$ kesudahan yang sama boleh jadi.`), T(`Only one of them is ${k}, so $P = ${frLine(1, nD)}$.`, `Hanya satu daripadanya ialah ${k}, maka $P = ${frLine(1, nD)}$.`)), sp: 's' };
    },
    /* P(colour) from a box */
    (r) => {
      const b = boxSet(r, 30, 2, 2), c0 = r.pick(b.cols);
      return { q: T(`A box contains ${boxTxt(b, 0)}. A ${b.obj[2]} is picked at random. Find the probability that it is ${c0.en}.`, `Sebuah kotak mengandungi ${boxTxt(b, 1)}. Satu ${b.obj[3]} dipilih secara rawak. Cari kebarangkalian ${b.obj[3]} itu berwarna ${c0.ms}.`), a: T(`$${P(c0.cnt, b.tot)}$`), w: W(T(`Total $= ${b.cols.map((c) => c.cnt).join(' + ')} = ${b.tot}$`, `Jumlah $= ${b.cols.map((c) => c.cnt).join(' + ')} = ${b.tot}$`), T(`$${c0.cnt}$ of them are ${c0.en}.`, `$${c0.cnt}$ daripadanya berwarna ${c0.ms}.`), T(`$P = ${frLine(c0.cnt, b.tot)}$`)), sp: 's' };
    },
    /* P(number in a range) from cards 1..n */
    (r) => {
      const nC = r.pick(CARDN), lo = r.int(1, Math.floor(nC / 2)), hi = r.int(lo + 2, nC);
      const cnt = hi - lo + 1;
      return { q: T(`A card is drawn at random from cards numbered 1 to ${nC}. Find the probability that the number is between ${lo} and ${hi} inclusive.`, `Sekeping kad dipilih secara rawak daripada kad bernombor 1 hingga ${nC}. Cari kebarangkalian nombor itu antara ${lo} dan ${hi} termasuk kedua-duanya.`), a: T(`$${P(cnt, nC)}$`), w: W(T(`The numbers from ${lo} to ${hi} are $${hi} - ${lo} + 1 = ${cnt}$ cards (count both ends).`, `Nombor dari ${lo} hingga ${hi} ialah $${hi} - ${lo} + 1 = ${cnt}$ keping kad (bilang kedua-dua hujung).`), T(`$P = ${frLine(cnt, nC)}$`)), sp: 's' };
    },
    /* P(specific letter card / colour) from a spinner */
    (r) => {
      const k = r.int(3, 8), j = r.int(1, k);
      return { q: T(`A spinner has ${k} equal sectors numbered 1 to ${k}. Find the probability that the pointer lands on ${j}.`, `Sebuah pemutar mempunyai ${k} sektor sama bernombor 1 hingga ${k}. Cari kebarangkalian penunjuk berhenti pada ${j}.`), a: T(`$${P(1, k)}$`), w: W(T(`The ${k} sectors are equal, so each is equally likely.`, `${k} sektor itu sama besar, maka setiap satu sama boleh jadi.`), T(`One sector out of ${k} is numbered ${j}: $P = ${frLine(1, k)}$.`, `Satu sektor daripada ${k} bernombor ${j}: $P = ${frLine(1, k)}$.`)), sp: 's' };
    },
    /* complement, simple */
    (r) => {
      const b = boxSet(r, 30, 2, 2), c0 = r.pick(b.cols);
      return { q: T(`A box contains ${boxTxt(b, 0)}. A ${b.obj[2]} is picked at random. Find the probability that it is not ${c0.en}.`, `Sebuah kotak mengandungi ${boxTxt(b, 1)}. Satu ${b.obj[3]} dipilih secara rawak. Cari kebarangkalian ${b.obj[3]} itu bukan berwarna ${c0.ms}.`), a: T(`$${P(b.tot - c0.cnt, b.tot)}$`), w: W(T(`Total $= ${b.tot}$, of which $${c0.cnt}$ are ${c0.en}.`, `Jumlah $= ${b.tot}$, dan $${c0.cnt}$ daripadanya berwarna ${c0.ms}.`), T(`Not ${c0.en}: $${b.tot} - ${c0.cnt} = ${b.tot - c0.cnt}$`, `Bukan ${c0.ms}: $${b.tot} - ${c0.cnt} = ${b.tot - c0.cnt}$`), T(`$P = ${frLine(b.tot - c0.cnt, b.tot)}$ (or $1 - ${P(c0.cnt, b.tot)}$)`, `$P = ${frLine(b.tot - c0.cnt, b.tot)}$ (atau $1 - ${P(c0.cnt, b.tot)}$)`)), sp: 's' };
    },
    /* express P as decimal or percentage */
    (r) => {
      const nD = r.pick(DICEN.slice(0, 2)), evs = EVWORDS.filter((e) => rl(1, nD).filter(e.f).length > 0 && rl(1, nD).filter(e.f).length < nD);
      const ev = r.pick(evs), cnt = rl(1, nD).filter(ev.f).length, kind = r.pick(['decimal', 'percentage']);
      return { q: T(`A fair ${nD}-sided die, numbered 1 to ${nD}, is rolled. Find, as a ${kind}, the probability of getting ${ev.en}.`, `Sebiji dadu adil bersisi ${nD}, bernombor 1 hingga ${nD}, digolek. Cari, sebagai ${kind === 'decimal' ? 'perpuluhan' : 'peratusan'}, kebarangkalian mendapat ${ev.ms}.`), a: kind === 'decimal' ? T(`$${dec(cnt, nD)}$`) : T(`$${pctOf(cnt, nD)}\\%$`), w: W(T(`The outcomes that give ${ev.en} are $${rl(1, nD).filter(ev.f).join(',\\ ')}$ — $${cnt}$ out of $${nD}$.`, `Kesudahan yang memberikan ${ev.ms} ialah $${rl(1, nD).filter(ev.f).join(',\\ ')}$ — $${cnt}$ daripada $${nD}$.`), T(`$P = ${frLine(cnt, nD)}$`), kind === 'decimal' ? T(`As a decimal: $${cnt} \\div ${nD} = ${dec(cnt, nD)}$`, `Sebagai perpuluhan: $${cnt} \\div ${nD} = ${dec(cnt, nD)}$`) : T(`As a percentage: $\\dfrac{${cnt}}{${nD}} \\times 100\\% = ${pctOf(cnt, nD)}\\%$`, `Sebagai peratusan: $\\dfrac{${cnt}}{${nD}} \\times 100\\% = ${pctOf(cnt, nD)}\\%$`)), sp: 's' };
    },
    /* P(vowel) in a short word */
    (r) => {
      const w = r.pick(WORDS), v = vowels(w);
      return { q: T(`A letter is chosen at random from the letters of the word "${w}". Find the probability that it is a vowel.`, `Satu huruf dipilih secara rawak daripada huruf perkataan "${w}". Cari kebarangkalian huruf itu ialah vokal.`), a: T(`$${P(v, w.length)}$`), w: W(T(`"${w}" has $${w.length}$ letters, each equally likely.`, `"${w}" mempunyai $${w.length}$ huruf, setiap satu sama boleh jadi.`), T(`The vowels are ${w.split('').filter((c) => 'AEIOU'.includes(c)).join(', ')} — $${v}$ of them.`, `Vokalnya ialah ${w.split('').filter((c) => 'AEIOU'.includes(c)).join(', ')} — $${v}$ daripadanya.`), T(`$P = ${frLine(v, w.length)}$`)), sp: 's' };
    },
  ];
  const g132m = [
    /* compound event on a die (even/prime/multiple/etc) */
    (r) => {
      const nD = r.pick(DICEN.slice(0, 2)), ev = r.pick(EVWORDS.filter((e) => { const c = rl(1, nD).filter(e.f).length; return c > 0 && c < nD; }));
      const cnt = rl(1, nD).filter(ev.f).length;
      return { q: T(`A fair ${nD}-sided die, numbered 1 to ${nD}, is rolled. Find the probability of getting ${ev.en}.`, `Sebiji dadu adil bersisi ${nD}, bernombor 1 hingga ${nD}, digolek. Cari kebarangkalian mendapat ${ev.ms}.`), a: T(`$${P(cnt, nD)}$`), w: W(T(`Sample space: $\\{1, 2, \\ldots, ${nD}\\}$, $${nD}$ equally likely outcomes.`, `Ruang sampel: $\\{1, 2, \\ldots, ${nD}\\}$, $${nD}$ kesudahan yang sama boleh jadi.`), T(`${cap(ev.en)}: $${rl(1, nD).filter(ev.f).join(',\\ ')}$ — that is $${cnt}$ outcomes.`, `${cap(ev.ms)}: $${rl(1, nD).filter(ev.f).join(',\\ ')}$ — iaitu $${cnt}$ kesudahan.`), T(`$P = ${frLine(cnt, nD)}$`)), sp: 's' };
    },
    /* complement, expressed after finding P(E) */
    (r) => {
      const nD = r.pick(DICEN.slice(0, 2)), ev = r.pick(EVWORDS.filter((e) => { const c = rl(1, nD).filter(e.f).length; return c > 0 && c < nD; }));
      const cnt = rl(1, nD).filter(ev.f).length;
      return { q: T(`A fair ${nD}-sided die, numbered 1 to ${nD}, is rolled.<br>(a) Find the probability of getting ${ev.en}.<br>(b) Hence, find the probability of not getting ${ev.en}.`, `Sebiji dadu adil bersisi ${nD}, bernombor 1 hingga ${nD}, digolek.<br>(a) Cari kebarangkalian mendapat ${ev.ms}.<br>(b) Seterusnya, cari kebarangkalian tidak mendapat ${ev.ms}.`), a: SPM.parts([T(`$${P(cnt, nD)}$`), T(`$1 - ${P(cnt, nD)} = ${P(nD - cnt, nD)}$`)]), w: W(T(`(a) ${cap(ev.en)}: $${rl(1, nD).filter(ev.f).join(',\\ ')}$ — $${cnt}$ of the $${nD}$ outcomes, so $P = ${frLine(cnt, nD)}$.`, `(a) ${cap(ev.ms)}: $${rl(1, nD).filter(ev.f).join(',\\ ')}$ — $${cnt}$ daripada $${nD}$ kesudahan, maka $P = ${frLine(cnt, nD)}$.`), T(`(b) An event and its complement have probabilities adding up to $1$.`, `(b) Suatu peristiwa dan pelengkapnya mempunyai kebarangkalian yang berjumlah $1$.`), T(`$1 - ${P(cnt, nD)} = ${P(nD - cnt, nD)}$`), T(`Check: the other $${nD} - ${cnt} = ${nD - cnt}$ outcomes give the same fraction.`, `Semak: $${nD} - ${cnt} = ${nD - cnt}$ kesudahan yang lain memberikan pecahan yang sama.`)), sp: 'm' };
    },
    /* fraction/decimal/percentage conversion, box of balls */
    (r) => {
      const b = boxSet(r, 40, 2, 3), c0 = r.pick(b.cols);
      return { q: T(`A box contains ${boxTxt(b, 0)}. A ${b.obj[2]} is picked at random. Find the probability that it is ${c0.en}, giving your answer as a fraction, a decimal and a percentage.`, `Sebuah kotak mengandungi ${boxTxt(b, 1)}. Satu ${b.obj[3]} dipilih secara rawak. Cari kebarangkalian ${b.obj[3]} itu berwarna ${c0.ms}, dengan jawapan sebagai pecahan, perpuluhan dan peratusan.`), a: T(`$${P(c0.cnt, b.tot)} = ${dec(c0.cnt, b.tot)} = ${pctOf(c0.cnt, b.tot)}\\%$`), w: W(T(`Total $= ${b.cols.map((c) => c.cnt).join(' + ')} = ${b.tot}$, of which $${c0.cnt}$ are ${c0.en}.`, `Jumlah $= ${b.cols.map((c) => c.cnt).join(' + ')} = ${b.tot}$, dan $${c0.cnt}$ daripadanya berwarna ${c0.ms}.`), T(`Fraction: $${frLine(c0.cnt, b.tot)}$`, `Pecahan: $${frLine(c0.cnt, b.tot)}$`), T(`Decimal: $${c0.cnt} \\div ${b.tot} = ${dec(c0.cnt, b.tot)}$`, `Perpuluhan: $${c0.cnt} \\div ${b.tot} = ${dec(c0.cnt, b.tot)}$`), T(`Percentage: $${dec(c0.cnt, b.tot)} \\times 100\\% = ${pctOf(c0.cnt, b.tot)}\\%$`, `Peratusan: $${dec(c0.cnt, b.tot)} \\times 100\\% = ${pctOf(c0.cnt, b.tot)}\\%$`)), sp: 'm' };
    },
    /* letters of a word: consonant / specific letter / not a given letter */
    (r) => {
      const w = r.pick(WORDS), letters = [...new Set(w.split(''))], L0 = r.pick(letters), c0 = letCount(w, L0), task = r.pick(['spec', 'consonant', 'not']);
      const cons = w.length - vowels(w);
      const q1 = task === 'spec' ? [`Find the probability that it is the letter ${L0}.`, `Cari kebarangkalian huruf itu ialah huruf ${L0}.`, P(c0, w.length)] : task === 'consonant' ? [`Find the probability that it is a consonant.`, `Cari kebarangkalian huruf itu ialah konsonan.`, P(cons, w.length)] : [`Find the probability that it is not the letter ${L0}.`, `Cari kebarangkalian huruf itu bukan huruf ${L0}.`, P(w.length - c0, w.length)];
      return { q: T(`A letter is chosen at random from the letters of the word "${w}". ${q1[0]}`, `Satu huruf dipilih secara rawak daripada huruf perkataan "${w}". ${q1[1]}`), a: T(`$${q1[2]}$`), w: W(T(`"${w}" has $${w.length}$ letters, each an equally likely outcome.`, `"${w}" mempunyai $${w.length}$ huruf, setiap satu kesudahan yang sama boleh jadi.`), task === 'spec' ? T(`The letter ${L0} appears $${c0}$ time${c0 > 1 ? 's' : ''}, so $P = ${frLine(c0, w.length)}$.`, `Huruf ${L0} muncul $${c0}$ kali, maka $P = ${frLine(c0, w.length)}$.`) : task === 'consonant' ? T(`The vowels are ${w.split('').filter((x) => 'AEIOU'.includes(x)).join(', ')}, so there are $${w.length} - ${vowels(w)} = ${cons}$ consonants and $P = ${frLine(cons, w.length)}$.`, `Vokalnya ialah ${w.split('').filter((x) => 'AEIOU'.includes(x)).join(', ')}, maka terdapat $${w.length} - ${vowels(w)} = ${cons}$ konsonan dan $P = ${frLine(cons, w.length)}$.`) : T(`${L0} appears $${c0}$ time${c0 > 1 ? 's' : ''}, so the other $${w.length} - ${c0} = ${w.length - c0}$ letters are "not ${L0}" and $P = ${frLine(w.length - c0, w.length)}$.`, `${L0} muncul $${c0}$ kali, maka $${w.length} - ${c0} = ${w.length - c0}$ huruf yang lain ialah "bukan ${L0}" dan $P = ${frLine(w.length - c0, w.length)}$.`)), sp: 'm' };
    },
    /* expected frequency over N repetitions */
    (r) => {
      const nD = r.pick(DICEN.slice(0, 2)), ev = r.pick(EVWORDS.filter((e) => { const c = rl(1, nD).filter(e.f).length; return c > 0 && c < nD; })), cnt = rl(1, nD).filter(ev.f).length;
      const trials = nD * r.pick([5, 10, 15, 20]);
      return { q: T(`A fair ${nD}-sided die, numbered 1 to ${nD}, is rolled ${trials} times. How many times would you expect to get ${ev.en}?`, `Sebiji dadu adil bersisi ${nD}, bernombor 1 hingga ${nD}, digolek ${trials} kali. Berapa kalikah anda jangkakan mendapat ${ev.ms}?`), a: T(`$${P(cnt, nD)} \\times ${trials} = ${(cnt * trials) / nD}$`), w: W(T(`${cap(ev.en)}: $${rl(1, nD).filter(ev.f).join(',\\ ')}$, so $P = ${frLine(cnt, nD)}$.`, `${cap(ev.ms)}: $${rl(1, nD).filter(ev.f).join(',\\ ')}$, maka $P = ${frLine(cnt, nD)}$.`), T('Expected frequency $=$ probability $\\times$ number of trials.', 'Kekerapan jangkaan $=$ kebarangkalian $\\times$ bilangan percubaan.'), T(`$${P(cnt, nD)} \\times ${trials} = ${(cnt * trials) / nD}$`)), sp: 'm' };
    },
    /* probability from a table/chart of counts */
    (r) => {
      const U = ufSet(r, r.int(4, 5)), j = r.int(0, U.xs.length - 1), gt = r.chance(0.5), thresh = U.xs[r.int(1, U.xs.length - 2)];
      const cntAbove = sum(U.fs.filter((f, i) => (gt ? U.xs[i] >= thresh : U.xs[i] === U.xs[j])));
      const target = gt ? cntAbove : U.fs[j];
      const wh = U.u.who.split('|');
      return { q: T(`The table shows the ${dsc(U.u, U.N, 0)}.<br>${ufTab(0, U)}<br>One of these ${U.N} ${wh[0]} is chosen at random. Find the probability that its value is ${gt ? `${thresh} or more` : U.xs[j]}.`, `Jadual menunjukkan ${dsc(U.u, U.N, 1)}.<br>${ufTab(1, U)}<br>Satu daripada ${U.N} ${wh[1]} ini dipilih secara rawak. Cari kebarangkalian nilainya ${gt ? `${thresh} atau lebih` : U.xs[j]}.`), a: T(`$${P(target, U.N)}$`), w: W(T(`Total $= ${U.fs.join(' + ')} = ${U.N}$`, `Jumlah $= ${U.fs.join(' + ')} = ${U.N}$`), gt ? T(`Values ${thresh} or more: $${U.fs.filter((f, i) => U.xs[i] >= thresh).join(' + ')} = ${target}$`, `Nilai ${thresh} atau lebih: $${U.fs.filter((f, i) => U.xs[i] >= thresh).join(' + ')} = ${target}$`) : T(`The frequency of ${U.xs[j]} is $${target}$.`, `Kekerapan ${U.xs[j]} ialah $${target}$.`), T(`$P = ${frLine(target, U.N)}$`)), sp: 'm' };
    },
    /* MCQ: correct sample space size for repeated-letter word */
    (r) => {
      const w = r.pick(WORDS.filter((x) => new Set(x.split('')).size !== x.length)), distinctN = new Set(w.split('')).size;
      const opts = r.shuffle([w.length, distinctN]);
      return { q: T(`A letter is chosen at random from the word "${w}". What is the size of the sample space (the total number of equally likely outcomes)?<br>${opts.map((x, i) => `${'AB'[i]}. ${x}`).join('&emsp;')}`, `Satu huruf dipilih secara rawak daripada perkataan "${w}". Apakah saiz ruang sampel (jumlah kesudahan sama boleh jadi)?<br>${opts.map((x, i) => `${'AB'[i]}. ${x}`).join('&emsp;')}`), a: T(`${'AB'[opts.indexOf(w.length)]}. ${w.length}`), w: T(`Every letter card counts separately, even if some letters repeat (${distinctN} distinct letters, but ${w.length} letter cards).`, `Setiap kad huruf dikira berasingan, walaupun sesetengah huruf berulang (${distinctN} huruf berbeza, tetapi ${w.length} kad huruf).`), sp: 'xs' };
    },
  ];
  const g132a = [
    /* find unknown count given a probability */
    (r) => {
      const other = r.int(4, 12), num = r.pick([[2, 5], [1, 3], [3, 7], [2, 3], [3, 8], [1, 4]]);
      const nn = (num[0] * other) / (num[1] - num[0]);
      need(Number.isInteger(nn) && nn >= 1 && nn <= 30);
      const b = r.pick(OBJ), col = r.pick(COLOURS), col2 = r.pick(COLOURS.filter((c) => c !== col));
      const art = /^[aeiou]/i.test(col[0]) ? 'an' : 'a';
      return { q: T(`A bag has ${other} ${col2[0]} ${b[0]} and some ${col[0]} ${b[0]}. The probability of picking ${art} ${col[0]} ${b[2]} is $${P(num[0], num[1])}$. Find the number of ${col[0]} ${b[0]}.`, `Sebuah beg mengandungi ${other} ${b[1]} ${col2[1]} dan beberapa ${b[1]} ${col[1]}. Kebarangkalian memilih ${b[3]} ${col[1]} ialah $${P(num[0], num[1])}$. Cari bilangan ${b[1]} ${col[1]}.`), a: T(`${nn}`), w: W(T(`Let $n$ be the number of ${col[0]} ${b[0]}; the bag then holds $n + ${other}$ ${b[0]}.`, `Biar $n$ ialah bilangan ${b[1]} ${col[1]}; beg itu mengandungi $n + ${other}$ ${b[1]}.`), T(`$\\dfrac{n}{n + ${other}} = ${P(num[0], num[1])}$`), T(`$${co(num[1])}n = ${num[0] === 1 ? `n + ${other}` : `${num[0]}(n + ${other}) = ${co(num[0])}n + ${num[0] * other}`}$`), num[1] - num[0] === 1 ? T(`$n = ${nn}$`) : T(`$${co(num[1] - num[0])}n = ${num[0] * other}$, so $n = ${nn}$`, `$${co(num[1] - num[0])}n = ${num[0] * other}$, maka $n = ${nn}$`)), sp: 'm' };
    },
    /* expected frequency, two events, over N repetitions */
    (r) => {
      const nD = r.pick(DICEN.slice(0, 2)), trials = nD * r.pick([10, 15, 20, 30]);
      const ev1 = r.pick(EVWORDS.filter((e) => { const c = rl(1, nD).filter(e.f).length; return c > 0 && c < nD; }));
      const rest = EVWORDS.filter((e) => e !== ev1 && (() => { const c = rl(1, nD).filter(e.f).length; return c > 0 && c < nD; })());
      const ev2 = r.pick(rest);
      const c1 = rl(1, nD).filter(ev1.f).length, c2 = rl(1, nD).filter(ev2.f).length;
      return { q: T(`A fair ${nD}-sided die, numbered 1 to ${nD}, is rolled ${trials} times. Find the expected number of times of getting (a) ${ev1.en}, (b) ${ev2.en}.`, `Sebiji dadu adil bersisi ${nD}, bernombor 1 hingga ${nD}, digolek ${trials} kali. Cari bilangan kali yang dijangka untuk mendapat (a) ${ev1.ms}, (b) ${ev2.ms}.`), a: SPM.parts([T(`$${P(c1, nD)} \\times ${trials} = ${(c1 * trials) / nD}$`), T(`$${P(c2, nD)} \\times ${trials} = ${(c2 * trials) / nD}$`)]), w: W(T('Expected frequency $=$ probability $\\times$ number of rolls.', 'Kekerapan jangkaan $=$ kebarangkalian $\\times$ bilangan golekan.'), T(`(a) ${cap(ev1.en)}: $${rl(1, nD).filter(ev1.f).join(',\\ ')}$, so $P = ${frLine(c1, nD)}$ and $${P(c1, nD)} \\times ${trials} = ${(c1 * trials) / nD}$.`, `(a) ${cap(ev1.ms)}: $${rl(1, nD).filter(ev1.f).join(',\\ ')}$, maka $P = ${frLine(c1, nD)}$ dan $${P(c1, nD)} \\times ${trials} = ${(c1 * trials) / nD}$.`), T(`(b) ${cap(ev2.en)}: $${rl(1, nD).filter(ev2.f).join(',\\ ')}$, so $P = ${frLine(c2, nD)}$ and $${P(c2, nD)} \\times ${trials} = ${(c2 * trials) / nD}$.`, `(b) ${cap(ev2.ms)}: $${rl(1, nD).filter(ev2.f).join(',\\ ')}$, maka $P = ${frLine(c2, nD)}$ dan $${P(c2, nD)} \\times ${trials} = ${(c2 * trials) / nD}$.`), T('These are expected numbers, not guaranteed ones.', 'Ini ialah bilangan yang dijangka, bukan bilangan yang pasti.')), sp: 'l' };
    },
    /* redefine a smaller sample space: choose from those who passed / satisfy a condition */
    (r) => {
      const U = ufSet(r, r.int(4, 5)), thresh = U.xs[r.int(1, U.xs.length - 2)];
      const pass = U.xs.map((x, i) => (x >= thresh ? U.fs[i] : 0));
      const passN = sum(pass), j = r.int(0, U.xs.length - 1);
      need(passN >= 4 && passN < U.N && U.xs[j] >= thresh);
      const wh = U.u.who.split('|');
      return { q: T(`The table shows the ${dsc(U.u, U.N, 0)}.<br>${ufTab(0, U)}<br>Only the ${wh[0]} whose value is ${thresh} or more are considered. One of these is chosen at random. Find the probability that its value is exactly ${U.xs[j]}.`, `Jadual menunjukkan ${dsc(U.u, U.N, 1)}.<br>${ufTab(1, U)}<br>Hanya ${wh[1]} yang nilainya ${thresh} atau lebih dipertimbangkan. Satu daripadanya dipilih secara rawak. Cari kebarangkalian nilainya tepat ${U.xs[j]}.`), a: T(`$${P(U.fs[j], passN)}$ (out of the ${passN} ${wh[0]} with value ${thresh} or more, not all ${U.N})`, `$${P(U.fs[j], passN)}$ (daripada ${passN} ${wh[1]} yang nilainya ${thresh} atau lebih, bukan kesemua ${U.N})`), w: W(T(`Only the values ${thresh} or more count now: $${U.fs.filter((f, i) => U.xs[i] >= thresh).join(' + ')} = ${passN}$.`, `Hanya nilai ${thresh} atau lebih dikira sekarang: $${U.fs.filter((f, i) => U.xs[i] >= thresh).join(' + ')} = ${passN}$.`), T(`So the sample space is $${passN}$, not $${U.N}$.`, `Maka ruang sampelnya ialah $${passN}$, bukan $${U.N}$.`), T(`The frequency of ${U.xs[j]} is $${U.fs[j]}$, so $P = ${frLine(U.fs[j], passN)}$.`, `Kekerapan ${U.xs[j]} ialah $${U.fs[j]}$, maka $P = ${frLine(U.fs[j], passN)}$.`)), sp: 'l' };
    },
    /* combined word + colour context: not reducing to lowest terms distractor check */
    (r) => {
      const w = r.pick(WORDS), L0 = r.pick([...new Set(w.split(''))]), c0 = letCount(w, L0), nm = r.name();
      const g0 = Fr.make(c0, w.length);
      need(g0.d !== w.length);
      return { q: T(`A letter is chosen at random from the word "${w}". ${nm} writes the probability of getting the letter ${L0} as $\\dfrac{${c0}}{${w.length}}$ and leaves it like that.<br>(a) Is this answer in its simplest form? If not, simplify it.<br>(b) What is the probability, as a percentage, correct to 1 decimal place?`, `Satu huruf dipilih secara rawak daripada perkataan "${w}". ${nm} menulis kebarangkalian mendapat huruf ${L0} sebagai $\\dfrac{${c0}}{${w.length}}$ dan membiarkannya begitu.<br>(a) Adakah jawapan ini dalam bentuk termudah? Jika tidak, permudahkannya.<br>(b) Berapakah kebarangkaliannya, sebagai peratusan, betul kepada 1 tempat perpuluhan?`), a: SPM.parts([T(`No; simplest form is $${Fr.tex(g0)}$`, `Tidak; bentuk termudah ialah $${Fr.tex(g0)}$`), T(`$${n(round((100 * c0) / w.length, 1))}\\%$`)]), w: W(T(`(a) The letter ${L0} appears $${c0}$ time${c0 > 1 ? 's' : ''} among the $${w.length}$ letters, so $P = \\dfrac{${c0}}{${w.length}}$ is correct but not simplified.`, `(a) Huruf ${L0} muncul $${c0}$ kali daripada $${w.length}$ huruf, maka $P = \\dfrac{${c0}}{${w.length}}$ betul tetapi belum dipermudah.`), T(`Divide both by $${SPM.gcd(c0, w.length)}$: $\\dfrac{${c0}}{${w.length}} = ${Fr.tex(g0)}$`, `Bahagikan kedua-duanya dengan $${SPM.gcd(c0, w.length)}$: $\\dfrac{${c0}}{${w.length}} = ${Fr.tex(g0)}$`), T(`(b) $\\dfrac{${c0}}{${w.length}} \\times 100\\% = ${n(round((100 * c0) / w.length, 1))}\\%$`)), sp: 'l' };
    },
    /* reverse expected frequency: find the number of trials */
    (r) => {
      const nD = r.pick(DICEN.slice(0, 2)), ev = r.pick(EVWORDS.filter((e) => { const c = rl(1, nD).filter(e.f).length; return c > 0 && c < nD; })), cnt = rl(1, nD).filter(ev.f).length;
      const g0 = Fr.make(cnt, nD), k2 = r.int(3, 9), exp0 = k2 * g0.n, trials = k2 * g0.d;
      return { q: T(`A fair ${nD}-sided die, numbered 1 to ${nD}, is rolled $N$ times. The expected number of times of getting ${ev.en} is ${exp0}. Find the value of $N$.`, `Sebiji dadu adil bersisi ${nD}, bernombor 1 hingga ${nD}, digolek $N$ kali. Bilangan kali yang dijangka untuk mendapat ${ev.ms} ialah ${exp0}. Cari nilai $N$.`), a: T(`$N = ${exp0} \\div ${P(cnt, nD)} = ${trials}$`), w: W(T(`${cap(ev.en)}: $${rl(1, nD).filter(ev.f).join(',\\ ')}$, so $P = ${frLine(cnt, nD)}$.`, `${cap(ev.ms)}: $${rl(1, nD).filter(ev.f).join(',\\ ')}$, maka $P = ${frLine(cnt, nD)}$.`), T('Expected frequency $=$ probability $\\times$ number of rolls.', 'Kekerapan jangkaan $=$ kebarangkalian $\\times$ bilangan golekan.'), T(`$${P(cnt, nD)} \\times N = ${exp0}$`), T(`$N = ${exp0} \\div ${P(cnt, nD)} = ${trials}$`)), sp: 'm' };
    },
    /* two-stage table: build then find probability, with complement */
    (r) => {
      const b = boxSet(r, 40, 3, 3), c0 = r.pick(b.cols), c1 = r.pick(b.cols.filter((c) => c !== c0));
      return { q: T(`A box contains ${boxTxt(b, 0)}. A ${b.obj[2]} is picked at random.<br>(a) Find the probability that it is ${c0.en} or ${c1.en}.<br>(b) Find the probability that it is neither ${c0.en} nor ${c1.en}.`, `Sebuah kotak mengandungi ${boxTxt(b, 1)}. Satu ${b.obj[3]} dipilih secara rawak.<br>(a) Cari kebarangkalian ${b.obj[3]} itu berwarna ${c0.ms} atau ${c1.ms}.<br>(b) Cari kebarangkalian ${b.obj[3]} itu bukan berwarna ${c0.ms} dan bukan ${c1.ms}.`), a: SPM.parts([T(`$${P(c0.cnt + c1.cnt, b.tot)}$`), T(`$${P(b.tot - c0.cnt - c1.cnt, b.tot)}$`)]), w: W(T(`Total $= ${b.cols.map((c) => c.cnt).join(' + ')} = ${b.tot}$`, `Jumlah $= ${b.cols.map((c) => c.cnt).join(' + ')} = ${b.tot}$`), T(`(a) ${cap(c0.en)} or ${c1.en}: $${c0.cnt} + ${c1.cnt} = ${c0.cnt + c1.cnt}$, so $P = ${frLine(c0.cnt + c1.cnt, b.tot)}$.`, `(a) ${cap(c0.ms)} atau ${c1.ms}: $${c0.cnt} + ${c1.cnt} = ${c0.cnt + c1.cnt}$, maka $P = ${frLine(c0.cnt + c1.cnt, b.tot)}$.`), T(`(b) The rest: $${b.tot} - ${c0.cnt + c1.cnt} = ${b.tot - c0.cnt - c1.cnt}$, so $P = ${frLine(b.tot - c0.cnt - c1.cnt, b.tot)}$.`, `(b) Yang selebihnya: $${b.tot} - ${c0.cnt + c1.cnt} = ${b.tot - c0.cnt - c1.cnt}$, maka $P = ${frLine(b.tot - c0.cnt - c1.cnt, b.tot)}$.`), T(`The two answers add up to $1$, as they must.`, `Kedua-dua jawapan berjumlah $1$, sebagaimana yang sepatutnya.`)), sp: 'm' };
    },
  ];
  SPM.extend('F2-13.2', { e: g132e, m: g132m, a: g132a });
})();
