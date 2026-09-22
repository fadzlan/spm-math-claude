/* Variety pack x1c: F1-5.1, 5.2 (algebraic expressions), 7.1, 7.2 (linear inequalities), 11.1-11.4 (sets). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, Fr, poly, lin, gcd } = SPM;
  const T = SPM.L, S = SPM.svg, F = SPM.figs, bank = SPM.bank;

  /* ---------------------------------------------------------------- shared helpers */
  const sub = (s, m) => s.replace(/\{(\w+)\}/g, (a, k) => (k in m ? m[k] : a));
  const LT = 'xyabmnpqthw'.split('');
  const AB = 'ABCD';
  const roster = (l) => `\\{${l.join(',\\ ')}\\}`;
  const rng = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  /** MCQ: right/wrongs are ready-to-print strings; returns option line + letter of the right one */
  const mcq = (r, right, wrongs) => {
    const o = r.shuffle([right].concat(wrongs));
    return { s: o.map((t, j) => `(${AB[j]}) ${t}`).join(' &emsp; '), L: AB[o.indexOf(right)] };
  };
  /** phrase entry [en, ms, tex] with {V} {v} {W} {w} {k} {j} placeholders */
  const ph = (e, m) => T(sub(e[0], m), sub(e[1], m));
  const ex = (e, m) => sub(e[2], m);
  const yn = (b) => T(b ? 'Yes' : 'No', b ? 'Ya' : 'Tidak');

  /* ================================================================ F1-5.1 */
  const PH1 = [
    ['{k} more than {V}', '{k} lebih daripada {V}', '{v}+{k}'],
    ['{k} less than {V}', '{k} kurang daripada {V}', '{v}-{k}'],
    ['the sum of {V} and {k}', 'hasil tambah {V} dan {k}', '{v}+{k}'],
    ['{V} increased by {k}', '{V} ditambah {k}', '{v}+{k}'],
    ['{V} decreased by {k}', '{V} dikurangkan {k}', '{v}-{k}'],
    ['{k} subtracted from {V}', '{k} ditolak daripada {V}', '{v}-{k}'],
    ['{V} subtracted from {k}', '{V} ditolak daripada {k}', '{k}-{v}'],
    ['{V} more than {k}', '{V} lebih daripada {k}', '{v}+{k}'],
    ['the product of {k} and {V}', 'hasil darab {k} dan {V}', '{k}{v}'],
    ['{V} multiplied by {k}', '{V} didarab dengan {k}', '{k}{v}'],
    ['{k} times {V}', '{k} kali {V}', '{k}{v}'],
    ['{V} divided by {k}', '{V} dibahagi dengan {k}', '\\dfrac{{v}}{{k}}'],
    ['twice {V}', 'dua kali {V}', '2{v}'],
    ['half of {V}', 'separuh daripada {V}', '\\dfrac{{v}}{2}'],
    ['the square of {V}', 'kuasa dua bagi {V}', '{v}^2'],
    ['the cube of {V}', 'kuasa tiga bagi {V}', '{v}^3'],
    ['{k} added to {V}', '{k} ditambah kepada {V}', '{v}+{k}'],
  ];
  const PH2 = [
    ['twice the sum of {V} and {k}', 'dua kali hasil tambah {V} dan {k}', '2({v}+{k})'],
    ['{k} less than twice {V}', '{k} kurang daripada dua kali {V}', '2{v}-{k}'],
    ['{k} more than three times {V}', '{k} lebih daripada tiga kali {V}', '3{v}+{k}'],
    ['three times the result of subtracting {k} from {V}', 'tiga kali hasil tolak {k} daripada {V}', '3({v}-{k})'],
    ['half of the sum of {V} and {k}', 'separuh daripada hasil tambah {V} dan {k}', '\\dfrac{{v}+{k}}{2}'],
    ['the sum of {V} and {W}, divided by {k}', 'hasil tambah {V} dan {W}, dibahagi dengan {k}', '\\dfrac{{v}+{w}}{{k}}'],
    ['the product of {V} and {W}, increased by {k}', 'hasil darab {V} dan {W}, ditambah {k}', '{v}{w}+{k}'],
    ['the square of {V}, plus {k}', 'kuasa dua {V}, ditambah {k}', '{v}^2+{k}'],
    ['the square of the sum of {V} and {k}', 'kuasa dua bagi hasil tambah {V} dan {k}', '({v}+{k})^2'],
    ['{V} multiplied by {k}, then {j} is subtracted', '{V} didarab dengan {k}, kemudian ditolak {j}', '{k}{v}-{j}'],
    ['{k} is added to {V}, and the result is multiplied by {j}', '{k} ditambah kepada {V}, dan hasilnya didarab dengan {j}', '{j}({v}+{k})'],
    ['{k} times the sum of {V} and {W}', '{k} kali hasil tambah {V} dan {W}', '{k}({v}+{w})'],
    ['the sum of the square of {V} and the square of {W}', 'hasil tambah kuasa dua {V} dan kuasa dua {W}', '{v}^2+{w}^2'],
    ['{k} times {V} minus {j} times {W}', '{k} kali {V} tolak {j} kali {W}', '{k}{v}-{j}{w}'],
    ['the cube of {V}, minus {k}', 'kuasa tiga {V}, ditolak {k}', '{v}^3-{k}'],
    ['{k} less than the product of {V} and {W}', '{k} kurang daripada hasil darab {V} dan {W}', '{v}{w}-{k}'],
    ['{V} divided by {k}, then {j} is added', '{V} dibahagi dengan {k}, kemudian ditambah {j}', '\\dfrac{{v}}{{k}}+{j}'],
  ];
  const pm = (r) => {
    const [v, w] = r.sample(LT, 2), k = r.int(2, 9), j = r.int(2, 9);
    need(k !== j);
    return { V: `$${v}$`, W: `$${w}$`, v, w, k, j };
  };
  /* index-form helpers: exponent lists like [['x',3],['y',2]] */
  const rep = (l) => l.map((t) => Array(t[1]).fill(t[0]).join(' \\times ')).join(' \\times ');
  const idx = (l) => l.map((t) => (t[1] === 1 ? t[0] : `${t[0]}^{${t[1]}}`)).join('');
  const pw = (e) => (/.[+-]/.test(e) ? `(${e})` : e);
  const boxFig = (pts, sides, right) => F.polygon({ pts, sides, right, w: 270, h: 150 });
  const RECT = [[0, 0], [3, 0], [3, 2], [0, 2]];

  const e51 = [
    /* words -> expression */
    (r) => {
      const m = pm(r), e = r.pick(PH1), p = ph(e, m);
      const q = [
        T(`Write an algebraic expression for "${p.en}".`, `Tulis ungkapan algebra bagi "${p.ms}".`),
        T(`Express "${p.en}" in algebraic form.`, `Ungkapkan "${p.ms}" dalam bentuk algebra.`),
        T(`Let $${m.v}$ represent a number. What is the algebraic expression for ${p.en}?`, `Katakan $${m.v}$ mewakili suatu nombor. Apakah ungkapan algebra bagi ${p.ms}?`),
        T(`A number is represented by $${m.v}$. Write ${p.en} using $${m.v}$.`, `Suatu nombor diwakili oleh $${m.v}$. Tulis ${p.ms} menggunakan $${m.v}$.`),
      ][r.int(0, 3)];
      return { q, a: T(`$${ex(e, m)}$`), sp: 'xs' };
    },
    /* expression -> words (MCQ) */
    (r) => {
      const m = pm(r), seen = new Set(), ch = [];
      for (const e of r.shuffle(PH1)) if (!seen.has(ex(e, m)) && ch.length < 4) (seen.add(ex(e, m)), ch.push(e));
      need(ch.length === 4);
      const o = r.shuffle(ch), c = o.indexOf(ch[0]);
      const list = (l) => o.map((e, i) => `(${AB[i]}) ${ph(e, m)[l]}`).join(' &emsp; ');
      return { q: T(`Which statement matches the expression $${ex(ch[0], m)}$?<br>${list('en')}`, `Pernyataan yang manakah sepadan dengan ungkapan $${ex(ch[0], m)}$?<br>${list('ms')}`), a: T(`${AB[c]}: ${ph(ch[0], m).en}`, `${AB[c]}: ${ph(ch[0], m).ms}`), sp: 'xs' };
    },
    /* identify coefficient / variable / constant / terms */
    (r) => {
      const [v, w] = r.sample(LT, 2), c = r.int(2, 12), d = r.int(2, 9), f = r.int(2, 9);
      const sg = r.pick(['+', '-']);
      const E = `${c}${v} ${sg} ${d}${w} ${r.pick(['+', '-'])} ${f}`;
      const forms = [
        [T(`In the term $${c}${v}$, state the coefficient of $${v}$.`, `Dalam sebutan $${c}${v}$, nyatakan pekali bagi $${v}$.`), T(`$${c}$`)],
        [T(`What is the variable in the term $${c}${v}$?`, `Apakah pemboleh ubah dalam sebutan $${c}${v}$?`), T(`$${v}$`)],
        [T(`How many terms are there in the expression $${E}$?`, `Berapakah bilangan sebutan dalam ungkapan $${E}$?`), T('3')],
        [T(`State the constant term in the expression $${E}$.`, `Nyatakan sebutan pemalar dalam ungkapan $${E}$.`), T(`$${f}$`)],
        [T(`Complete: the coefficient of $${w}$ in $${d}${w}$ is ____.`, `Lengkapkan: pekali bagi $${w}$ dalam $${d}${w}$ ialah ____.`), T(`$${d}$`)],
        [T(`Write down one term with coefficient ${c} and variable $${v}$.`, `Tulis satu sebutan yang mempunyai pekali ${c} dan pemboleh ubah $${v}$.`), T(`$${c}${v}$`)],
        [T(`Which letters are the variables in $${E}$?`, `Huruf yang manakah ialah pemboleh ubah dalam $${E}$?`), T(`$${v}$ and $${w}$`, `$${v}$ dan $${w}$`)],
        [T(`In $${c}${v}$, which part is the coefficient and which is the variable? Answer in the form "coefficient, variable".`, `Dalam $${c}${v}$, bahagian manakah pekali dan yang manakah pemboleh ubah? Jawab dalam bentuk "pekali, pemboleh ubah".`), T(`$${c}$, $${v}$`)],
      ];
      const [q, a] = r.pick(forms);
      return { q, a, sp: 'xs' };
    },
    /* index form */
    (r) => {
      const [v, w] = r.sample(LT, 2), k = r.int(2, 5), c = r.int(2, 9);
      const forms = [
        [T(`Write $${rep([[v, k]])}$ in index form.`, `Tulis $${rep([[v, k]])}$ dalam bentuk indeks.`), `$${v}^{${k}}$`],
        [T(`Write $${v}^{${k}}$ as repeated multiplication.`, `Tulis $${v}^{${k}}$ sebagai pendaraban berulang.`), `$${rep([[v, k]])}$`],
        [T(`In $${v}^{${k}}$, state the base and the index.`, `Dalam $${v}^{${k}}$, nyatakan asas dan indeks.`), T(`Base: $${v}$; index: $${k}$`, `Asas: $${v}$; indeks: $${k}$`)],
        [T(`Fill in the blank: $${rep([[v, k]])} = ${v}^{\\square}$.`, `Isi tempat kosong: $${rep([[v, k]])} = ${v}^{\\square}$.`), `$${k}$`],
        [T(`Is $${rep([[v, k]])} = ${k}${v}$ correct? If not, write the correct answer.`, `Adakah $${rep([[v, k]])} = ${k}${v}$ betul? Jika tidak, tulis jawapan yang betul.`), T(`No. $${rep([[v, k]])} = ${v}^{${k}}$, whereas $${k}${v} = ${Array(k).fill(v).join(' + ')}$.`, `Tidak. $${rep([[v, k]])} = ${v}^{${k}}$, manakala $${k}${v} = ${Array(k).fill(v).join(' + ')}$.`)],
        [T(`How many times is $${v}$ multiplied in $${v}^{${k}}$?`, `Berapa kalikah $${v}$ didarab dalam $${v}^{${k}}$?`), T(`${k}`)],
        [T(`Write $${c} \\times ${rep([[v, k]])}$ in a shorter form.`, `Tulis $${c} \\times ${rep([[v, k]])}$ dalam bentuk yang lebih ringkas.`), `$${c}${v}^{${k}}$`],
        [T(`Write $${rep([[v, 2], [w, 1]])}$ using indices.`, `Tulis $${rep([[v, 2], [w, 1]])}$ menggunakan indeks.`), `$${v}^2${w}$`],
      ];
      const [q, a] = r.pick(forms);
      return { q, a: typeof a === 'string' ? T(a) : a, sp: 'xs' };
    },
    /* varying or fixed */
    (r) => {
      const c = r.int(2, 6) * (r.chance() ? 1 : 5), z = r.int(3, 8) * 10;
      const CX = [
        { en: `A taxi charges RM${c} for every kilometre. Ali travels $d$ km.`, ms: `Sebuah teksi mengenakan bayaran RM${c} bagi setiap kilometer. Ali menaiki teksi itu sejauh $d$ km.`, L: 'd', mean: T('the distance travelled', 'jarak perjalanan'), vy: [T('the total fare', 'jumlah tambang')], fx: [T(`the charge per kilometre (RM${c})`, `bayaran setiap kilometer (RM${c})`)] },
        { en: `A bus travels at a constant speed of ${z} km/h for $t$ hours.`, ms: `Sebuah bas bergerak dengan laju tetap ${z} km/j selama $t$ jam.`, L: 't', mean: T('the time taken', 'masa yang diambil'), vy: [T('the distance travelled', 'jarak yang dilalui')], fx: [T(`the speed (${z} km/h)`, `laju (${z} km/j)`)] },
        { en: `A tap fills a tank at ${c} litres per minute. The tap is on for $m$ minutes.`, ms: `Sebuah paip mengisi tangki pada kadar ${c} liter seminit. Paip itu dibuka selama $m$ minit.`, L: 'm', mean: T('the number of minutes', 'bilangan minit'), vy: [T('the volume of water in the tank', 'isi padu air dalam tangki')], fx: [T(`the rate of filling (${c} litres per minute)`, `kadar pengisian (${c} liter seminit)`)] },
        { en: `A class has ${z / 2} students. On a certain day, $n$ students are present.`, ms: `Sebuah kelas mempunyai ${z / 2} orang murid. Pada suatu hari, $n$ orang murid hadir.`, L: 'n', mean: T('the number of students present', 'bilangan murid yang hadir'), vy: [T('the number of students absent', 'bilangan murid yang tidak hadir')], fx: [T(`the number of students in the class (${z / 2})`, `bilangan murid dalam kelas (${z / 2})`)] },
        { en: `A rectangle has a fixed length of ${c + 3} cm. Its width, $w$ cm, is changed.`, ms: `Sebuah segi empat tepat mempunyai panjang tetap ${c + 3} cm. Lebarnya, $w$ cm, diubah.`, L: 'w', mean: T('the width of the rectangle', 'lebar segi empat tepat'), vy: [T('the area of the rectangle', 'luas segi empat tepat')], fx: [T(`the length (${c + 3} cm)`, `panjang (${c + 3} cm)`)] },
        { en: `Siti is $x$ years old. Her brother is ${c % 5 + 3} years older than her.`, ms: `Siti berumur $x$ tahun. Abangnya ${c % 5 + 3} tahun lebih tua daripadanya.`, L: 'x', mean: T("Siti's age", 'umur Siti'), vy: [T("her brother's age", 'umur abangnya')], fx: [T(`the age difference (${c % 5 + 3} years)`, `beza umur (${c % 5 + 3} tahun)`)] },
        { en: `A mobile plan costs RM${c + 20} a month. Farid sends $s$ text messages in a month.`, ms: `Pelan telefon bimbit berharga RM${c + 20} sebulan. Farid menghantar $s$ mesej teks dalam sebulan.`, L: 's', mean: T('the number of messages sent', 'bilangan mesej yang dihantar'), vy: [T('the number of messages left in his quota', 'bilangan mesej yang tinggal dalam kuotanya')], fx: [T(`the monthly fee (RM${c + 20})`, `bayaran bulanan (RM${c + 20})`)] },
        { en: `A cyclist rides ${c} km each hour. After $h$ hours, she stops.`, ms: `Seorang penunggang basikal mengayuh ${c} km setiap jam. Selepas $h$ jam, dia berhenti.`, L: 'h', mean: T('the number of hours cycled', 'bilangan jam berbasikal'), vy: [T('the distance cycled', 'jarak yang dikayuh')], fx: [T(`the distance cycled per hour (${c} km)`, `jarak berbasikal setiap jam (${c} km)`)] },
      ];
      const cx = r.pick(CX), f = r.int(0, 2);
      const qu = r.pick([cx.vy[0], cx.fx[0]]), isVar = cx.vy[0] === qu;
      if (f === 0) return { q: T(`${cx.en} In this situation, is ${qu.en} a variable or a fixed value?`, `${cx.ms} Dalam situasi ini, adakah ${qu.ms} ialah pemboleh ubah atau nilai tetap?`), a: T(isVar ? 'A variable (its value changes)' : 'A fixed value (it does not change)', isVar ? 'Pemboleh ubah (nilainya berubah)' : 'Nilai tetap (tidak berubah)'), sp: 's' };
      if (f === 1) {
        const first = r.chance(), A = first ? cx.vy[0] : cx.fx[0], B = first ? cx.fx[0] : cx.vy[0];
        return { q: T(`${cx.en} Which of these stays fixed: ${A.en} or ${B.en}?`, `${cx.ms} Yang manakah kekal tetap: ${A.ms} atau ${B.ms}?`), a: cx.fx[0], sp: 's' };
      }
      return { q: T(`${cx.en} State what the letter $${cx.L}$ represents and whether its value is fixed or varies.`, `${cx.ms} Nyatakan apakah yang diwakili oleh huruf $${cx.L}$ dan sama ada nilainya tetap atau berubah.`), a: T(`$${cx.L}$ is ${cx.mean.en}; it varies.`, `$${cx.L}$ ialah ${cx.mean.ms}; ia berubah.`), sp: 's' };
    },
    /* one-step quantity stories */
    (r) => {
      const [v] = r.sample(LT, 1), k = r.int(2, 9), it = r.pick(bank.items), nm = r.name();
      const forms = [
        [T(`A box contains $${v}$ pencils. Write an expression for the number of pencils in ${k} such boxes.`, `Sebuah kotak mengandungi $${v}$ batang pensel. Tulis ungkapan bagi bilangan pensel dalam ${k} kotak yang sama.`), `${k}${v}`],
        [T(`${nm} has RM$${v}$. He spends RM${k}. Write an expression for the money he has left.`, `${nm} mempunyai RM$${v}$. Dia membelanjakan RM${k}. Tulis ungkapan bagi wang yang tinggal.`), `${v}-${k}`],
        [T(`Class 1A has $${v}$ students and Class 1B has ${k} more. Write an expression for the number of students in Class 1B.`, `Kelas 1A mempunyai $${v}$ orang murid dan Kelas 1B mempunyai ${k} orang lebih ramai. Tulis ungkapan bagi bilangan murid Kelas 1B.`), `${v}+${k}`],
        [T(`A rope is $${v}$ m long. ${k} m is cut off. Write an expression for the length that remains.`, `Seutas tali panjangnya $${v}$ m. Sebanyak ${k} m dipotong. Tulis ungkapan bagi panjang yang tinggal.`), `${v}-${k}`],
        [T(`RM$${v}$ is shared equally among ${k} children. Write an expression for the amount each child receives.`, `RM$${v}$ dikongsi sama banyak antara ${k} orang kanak-kanak. Tulis ungkapan bagi jumlah yang diterima setiap kanak-kanak.`), `\\dfrac{${v}}{${k}}`],
        [T(`One ${it.en1} costs RM$${v}$. Write an expression for the cost of ${k} ${it.en}.`, `Harga sebuah ${it.ms} ialah RM$${v}$. Tulis ungkapan bagi kos ${k} ${it.ms}.`), `${k}${v}`],
        [T(`${nm} is $${v}$ years old. Write an expression for his age ${k} years from now.`, `${nm} berumur $${v}$ tahun. Tulis ungkapan bagi umurnya ${k} tahun dari sekarang.`), `${v}+${k}`],
        [T(`A ribbon $${v}$ cm long is cut into ${k} equal pieces. Write an expression for the length of one piece.`, `Sehelai reben panjangnya $${v}$ cm dipotong kepada ${k} bahagian yang sama panjang. Tulis ungkapan bagi panjang satu bahagian.`), `\\dfrac{${v}}{${k}}`],
      ];
      const [q, ans] = r.pick(forms);
      return { q, a: T(`$${ans}$`), sp: 'xs' };
    },
    /* true / false about notation */
    (r) => {
      const v = r.pick(LT), k = r.int(2, 9);
      const forms = [
        [T(`True or false: $${k}${v}$ means $${k} + ${v}$.`, `Benar atau palsu: $${k}${v}$ bermaksud $${k} + ${v}$.`), T(`False. $${k}${v}$ means $${k} \\times ${v}$.`, `Palsu. $${k}${v}$ bermaksud $${k} \\times ${v}$.`)],
        [T(`True or false: $${v} + ${v} + ${v}$ can be written as $${v}^3$.`, `Benar atau palsu: $${v} + ${v} + ${v}$ boleh ditulis sebagai $${v}^3$.`), T(`False. $${v} + ${v} + ${v} = 3${v}$, whereas $${v}^3 = ${v} \\times ${v} \\times ${v}$.`, `Palsu. $${v} + ${v} + ${v} = 3${v}$, manakala $${v}^3 = ${v} \\times ${v} \\times ${v}$.`)],
        [T(`True or false: $${v}^2$ means $${v} \\times ${v}$.`, `Benar atau palsu: $${v}^2$ bermaksud $${v} \\times ${v}$.`), T('True.', 'Benar.')],
        [T(`True or false: in $${k}${v}^2$, the coefficient of $${v}^2$ is ${k}.`, `Benar atau palsu: dalam $${k}${v}^2$, pekali bagi $${v}^2$ ialah ${k}.`), T('True.', 'Benar.')],
        [T(`True or false: $${v}$ and ${k} are both variables.`, `Benar atau palsu: $${v}$ dan ${k} kedua-duanya pemboleh ubah.`), T(`False. $${v}$ is a variable but ${k} is a constant.`, `Palsu. $${v}$ ialah pemboleh ubah tetapi ${k} ialah pemalar.`)],
        [T(`True or false: $\\dfrac{${v}}{${k}}$ is an algebraic expression.`, `Benar atau palsu: $\\dfrac{${v}}{${k}}$ ialah ungkapan algebra.`), T('True.', 'Benar.')],
      ];
      const [q, a] = r.pick(forms);
      return { q, a, sp: 'xs' };
    },
    /* classify constants and variables */
    (r) => {
      const POOL = [
        [T('the number of days in a week', 'bilangan hari dalam seminggu'), 0], [T('the number of sides of a triangle', 'bilangan sisi sebuah segi tiga'), 0],
        [T('the number of months in a year', 'bilangan bulan dalam setahun'), 0], [T('the number of minutes in an hour', 'bilangan minit dalam sejam'), 0],
        [T('the temperature outside at different times of the day', 'suhu di luar pada waktu berbeza dalam sehari'), 1], [T("Ali's height as he grows up", 'ketinggian Ali semasa dia membesar'), 1],
        [T('the price of petrol over several months', 'harga petrol dalam beberapa bulan'), 1], [T('the number of customers in a shop during the day', 'bilangan pelanggan di sebuah kedai sepanjang hari'), 1],
        [T('the number of centimetres in one metre', 'bilangan sentimeter dalam satu meter'), 0], [T('the number of students absent each day', 'bilangan murid yang tidak hadir setiap hari'), 1],
      ];
      const s = r.sample(POOL, 3);
      need(s.some((x) => x[1] === 0) && s.some((x) => x[1] === 1));
      const list = (l) => '<br>' + s.map((x, i) => `(${'abc'[i]}) ${x[0][l]}`).join('<br>');
      const ans = (l) => s.map((x, i) => `(${'abc'[i]}) ${x[1] ? (l === 'en' ? 'variable' : 'pemboleh ubah') : (l === 'en' ? 'constant' : 'pemalar')}`).join('; ');
      return { q: T(`Classify each quantity as a constant (fixed) or a variable:${list('en')}`, `Kelaskan setiap kuantiti sebagai pemalar (tetap) atau pemboleh ubah:${list('ms')}`), a: T(ans('en'), ans('ms')), sp: 's' };
    },
  ];

  const m51 = [
    /* two-operation phrases */
    (r) => {
      const m = pm(r), e = r.pick(PH2), p = ph(e, m);
      const q = r.pick([
        T(`Write an algebraic expression for "${p.en}".`, `Tulis ungkapan algebra bagi "${p.ms}".`),
        T(`Translate "${p.en}" into an algebraic expression.`, `Terjemahkan "${p.ms}" kepada ungkapan algebra.`),
        T(`Using $${m.v}$ ${e[0].includes('{W}') ? `and $${m.w}$ ` : ''}for the unknown ${e[0].includes('{W}') ? 'numbers' : 'number'}, write "${p.en}" as an expression.`, `Menggunakan $${m.v}$ ${e[0].includes('{W}') ? `dan $${m.w}$ ` : ''}bagi ${e[0].includes('{W}') ? 'nombor-nombor' : 'nombor'} yang tidak diketahui, tulis "${p.ms}" sebagai ungkapan.`),
      ]);
      return { q, a: T(`$${ex(e, m)}$`), sp: 's' };
    },
    /* two-op MCQ: brackets matter */
    (r) => {
      const m = pm(r), e = r.pick(PH2.filter((x) => !x[0].includes('{W}')));
      const right = ex(e, m);
      const pool = PH2.filter((x) => !x[0].includes('{W}') && ex(x, m) !== right).map((x) => ex(x, m));
      const wr = r.sample(pool, 3);
      const o = mcq(r, `$${right}$`, wr.map((s) => `$${s}$`));
      const p = ph(e, m);
      return { q: T(`Which expression represents "${p.en}"?<br>${o.s}`, `Ungkapan yang manakah mewakili "${p.ms}"?<br>${o.s}`), a: T(`${o.L}: $${right}$`), sp: 's' };
    },
    /* shopping */
    (r) => {
      const [it, it2] = r.sample(bank.items, 2), nm = r.name(), c = r.int(it.lo, it.hi), d = r.int(it2.lo, it2.hi), M = r.int(6, 12) * 10, note = r.pick([50, 100]), k = r.int(2, 6);
      need(c !== d);
      const forms = [
        [T(`${nm} buys $n$ ${it.en} at RM${c} each. Write an expression for the total cost in RM.`, `${nm} membeli $n$ ${it.ms} dengan harga RM${c} setiap satu. Tulis ungkapan bagi jumlah kos dalam RM.`), `${c}n`],
        [T(`${nm} buys $x$ ${it.en} at RM${c} each and $y$ ${it2.en} at RM${d} each. Write an expression for the total cost in RM.`, `${nm} membeli $x$ ${it.ms} dengan harga RM${c} setiap satu dan $y$ ${it2.ms} dengan harga RM${d} setiap satu. Tulis ungkapan bagi jumlah kos dalam RM.`), `${c}x+${d}y`],
        [T(`The price of one ${it.en1} is RM$p$. Write an expression for the cost of ${k} ${it.en} and one ${it2.en1} at RM${d}.`, `Harga sebuah ${it.ms} ialah RM$p$. Tulis ungkapan bagi kos ${k} ${it.ms} dan sebuah ${it2.ms} berharga RM${d}.`), `${k}p+${d}`],
        [T(`${nm} has RM${M}. She buys $n$ ${it.en} at RM${c} each. Write an expression for the money she has left.`, `${nm} mempunyai RM${M}. Dia membeli $n$ ${it.ms} dengan harga RM${c} setiap satu. Tulis ungkapan bagi wang yang tinggal.`), `${M}-${c}n`],
        [T(`One ${it.en1} costs RM$x$. ${nm} buys ${k} and pays with a RM${note} note. Write an expression for the change.`, `Harga sebuah ${it.ms} ialah RM$x$. ${nm} membeli ${k} dan membayar dengan not RM${note}. Tulis ungkapan bagi wang baki.`), `${note}-${k}x`],
        [T(`A ${it.en1} is normally sold for RM$p$. During a sale its price is reduced by RM${c}. Write an expression for the cost of ${k} ${it.en} during the sale.`, `Sebuah ${it.ms} biasanya dijual dengan harga RM$p$. Semasa jualan, harganya dikurangkan RM${c}. Tulis ungkapan bagi kos ${k} ${it.ms} semasa jualan.`), `${k}(p-${c})`],
        [T(`${nm} buys $n$ ${it.en} at RM${c} each and pays a delivery charge of RM${d}. Write an expression for the total payment.`, `${nm} membeli $n$ ${it.ms} dengan harga RM${c} setiap satu dan membayar caj penghantaran RM${d}. Tulis ungkapan bagi jumlah bayaran.`), `${c}n+${d}`],
      ];
      const [q, a] = r.pick(forms);
      return { q, a: T(`RM$${a}$`), sp: 's' };
    },
    /* spot the error */
    (r) => {
      const m = pm(r), nm = r.name();
      const TR = [
        ['{k} less than {V}', '{k} kurang daripada {V}', '{k}-{v}', '{v}-{k}'],
        ['{V} subtracted from {k}', '{V} ditolak daripada {k}', '{v}-{k}', '{k}-{v}'],
        ['{k} more than twice {V}', '{k} lebih daripada dua kali {V}', '2({v}+{k})', '2{v}+{k}'],
        ['twice the sum of {V} and {k}', 'dua kali hasil tambah {V} dan {k}', '2{v}+{k}', '2({v}+{k})'],
        ['{V} divided by {k}', '{V} dibahagi dengan {k}', '\\dfrac{{k}}{{v}}', '\\dfrac{{v}}{{k}}'],
        ['{k} times the sum of {V} and {j}', '{k} kali hasil tambah {V} dan {j}', '{k}{v}+{j}', '{k}({v}+{j})'],
        ['the square of {V}, plus {k}', 'kuasa dua {V}, ditambah {k}', '({v}+{k})^2', '{v}^2+{k}'],
        ['{k} less than three times {V}', '{k} kurang daripada tiga kali {V}', '{k}-3{v}', '3{v}-{k}'],
      ];
      const e = r.pick(TR), good = r.chance(0.25), shown = sub(good ? e[3] : e[2], m);
      const p = ph(e, m);
      return { q: T(`${nm} wrote "${p.en}" as $${shown}$. Is ${nm}'s answer correct? If not, write the correct expression.`, `${nm} menulis "${p.ms}" sebagai $${shown}$. Adakah jawapan ${nm} betul? Jika tidak, tulis ungkapan yang betul.`), a: good ? T('Yes, it is correct.', 'Ya, jawapan itu betul.') : T(`No. The correct expression is $${sub(e[3], m)}$.`, `Tidak. Ungkapan yang betul ialah $${sub(e[3], m)}$.`), sp: 's' };
    },
    /* index: mixed */
    (r) => {
      const [v, w, z] = r.sample(LT, 3), a = r.int(2, 4), b = r.int(2, 3), c = r.int(2, 9);
      const L = [[v, a], [w, b]], sh = r.shuffle(Array(a).fill(v).concat(Array(b).fill(w)));
      const forms = [
        [T(`Write $${sh.join(' \\times ')}$ in index form.`, `Tulis $${sh.join(' \\times ')}$ dalam bentuk indeks.`), `$${idx(L)}$`],
        [T(`Write $${idx(L)}$ as repeated multiplication.`, `Tulis $${idx(L)}$ sebagai pendaraban berulang.`), `$${rep(L)}$`],
        [T(`Write $${c} \\times ${rep([[v, a]])} \\times ${w}$ in index form.`, `Tulis $${c} \\times ${rep([[v, a]])} \\times ${w}$ dalam bentuk indeks.`), `$${c}${v}^{${a}}${w}$`],
        [T(`Write $${c}${v}^{${a}}${w}^{${b}}$ as repeated multiplication.`, `Tulis $${c}${v}^{${a}}${w}^{${b}}$ sebagai pendaraban berulang.`), `$${c} \\times ${rep(L)}$`],
        [T(`In $${idx(L)}$, how many times does $${v}$ appear as a factor, and how many times does $${w}$ appear?`, `Dalam $${idx(L)}$, berapa kalikah $${v}$ muncul sebagai faktor dan berapa kalikah $${w}$ muncul?`), T(`$${v}$: ${a} times; $${w}$: ${b} times`, `$${v}$: ${a} kali; $${w}$: ${b} kali`)],
        [T(`Write $${v} \\times ${w} \\times ${v} \\times ${z} \\times ${v} \\times ${z}$ in index form.`, `Tulis $${v} \\times ${w} \\times ${v} \\times ${z} \\times ${v} \\times ${z}$ dalam bentuk indeks.`), `$${v}^3${w}${z}^2$`],
        [T(`Which is correct: $${v} \\times ${v} \\times ${w}$ equals (A) $${v}${w}^2$, (B) $${v}^2${w}$, (C) $2${v}${w}$?`, `Yang manakah betul: $${v} \\times ${v} \\times ${w}$ sama dengan (A) $${v}${w}^2$, (B) $${v}^2${w}$, (C) $2${v}${w}$?`), T(`(B) $${v}^2${w}$`)],
        [T(`Write down the base and the index of $${w}^{${b}}$, and then write it as repeated multiplication.`, `Tulis asas dan indeks bagi $${w}^{${b}}$, kemudian tulis sebagai pendaraban berulang.`), T(`Base: $${w}$; index: $${b}$; $${rep([[w, b]])}$`, `Asas: $${w}$; indeks: $${b}$; $${rep([[w, b]])}$`)],
      ];
      const [q, ans] = r.pick(forms);
      return { q, a: typeof ans === 'string' ? T(ans) : ans, sp: 's' };
    },
    /* table -> rule */
    (r) => {
      const a = r.int(2, 8), b = r.pick([0, 0, 2, 3, 5]);
      const nm = r.pick(['n', 'p', 'k']);
      const CT = [
        [T('Number of packets', 'Bilangan bungkusan'), T('Total cost (RM)', 'Jumlah kos (RM)'), T('The total cost of the packets is given in the table.', 'Jumlah kos bungkusan diberikan dalam jadual.')],
        [T('Number of hours', 'Bilangan jam'), T('Charge (RM)', 'Bayaran (RM)'), T('The table shows the charge for hiring a bicycle.', 'Jadual menunjukkan bayaran menyewa sebuah basikal.')],
        [T('Number of rows', 'Bilangan baris'), T('Number of tiles', 'Bilangan jubin'), T('The table shows the number of tiles used in a pattern.', 'Jadual menunjukkan bilangan jubin yang digunakan dalam suatu corak.')],
        [T('Number of biscuits', 'Bilangan biskut'), T('Mass (g)', 'Jisim (g)'), T('The table shows the total mass of a box holding some identical biscuits.', 'Jadual menunjukkan jisim keseluruhan sebuah kotak yang berisi beberapa biji biskut yang serupa.')],
      ];
      const c = r.pick(CT), cols = [1, 2, 3, 4];
      const tb = (l) => SPM.table([[c[1][l]].concat(cols.map((i) => a * i + b))], { head: [c[0][l]].concat(cols), rowHead: true });
      return { q: T(`${c[2].en} Write an expression for the value in the second row when the first row is $${nm}$.<br>${tb('en')}`, `${c[2].ms} Tulis ungkapan bagi nilai dalam baris kedua apabila baris pertama ialah $${nm}$.<br>${tb('ms')}`), a: T(`$${lin(a, b, nm)}$`), w: T(`Each step adds ${a}, so the coefficient is ${a}${b ? `; the first value ${a + b} minus ${a} gives ${b}` : ''}.`, `Setiap langkah bertambah ${a}, maka pekalinya ialah ${a}${b ? `; nilai pertama ${a + b} tolak ${a} memberi ${b}` : ''}.`), sp: 's' };
    },
    /* two types of objects */
    (r) => {
      const a = r.int(2, 9) * 10, b = r.int(2, 9) * 10;
      need(a !== b);
      const CT = [
        [T('A farm has $x$ hens and $y$ goats. Write an expression for the total number of legs.', 'Sebuah ladang mempunyai $x$ ekor ayam dan $y$ ekor kambing. Tulis ungkapan bagi jumlah bilangan kaki.'), '2x+4y'],
        [T('A car park has $x$ bicycles and $y$ cars. Write an expression for the total number of wheels.', 'Sebuah tempat letak kenderaan mempunyai $x$ buah basikal dan $y$ buah kereta. Tulis ungkapan bagi jumlah bilangan roda.'), '2x+4y'],
        [T(`Aisyah has $x$ ${a}-sen coins and $y$ ${b}-sen coins. Write an expression for the total value in sen.`, `Aisyah mempunyai $x$ keping duit syiling ${a} sen dan $y$ keping duit syiling ${b} sen. Tulis ungkapan bagi jumlah nilai dalam sen.`), `${a}x+${b}y`],
        [T('A school hall has $x$ benches with 5 seats each and $y$ benches with 3 seats each. Write an expression for the total number of seats.', 'Sebuah dewan sekolah mempunyai $x$ bangku dengan 5 tempat duduk setiap satu dan $y$ bangku dengan 3 tempat duduk setiap satu. Tulis ungkapan bagi jumlah bilangan tempat duduk.'), '5x+3y'],
        [T('A cinema sells $x$ adult tickets at RM12 each and $y$ child tickets at RM7 each. Write an expression for the total sales in RM.', 'Sebuah panggung wayang menjual $x$ tiket dewasa pada harga RM12 setiap satu dan $y$ tiket kanak-kanak pada harga RM7 setiap satu. Tulis ungkapan bagi jumlah jualan dalam RM.'), '12x+7y'],
        [T('A box holds 6 eggs. Ali has $x$ full boxes and $y$ loose eggs. Write an expression for the total number of eggs.', 'Sebuah kotak memuatkan 6 biji telur. Ali mempunyai $x$ kotak penuh dan $y$ biji telur yang longgar. Tulis ungkapan bagi jumlah bilangan telur.'), '6x+y'],
      ];
      const [q, ans] = r.pick(CT);
      return { q, a: T(`$${ans}$`), sp: 's' };
    },
    /* unit conversion */
    (r) => {
      const CV = [
        ['$x$ metres to centimetres', '$x$ meter kepada sentimeter', '100x'], ['$y$ kilograms to grams', '$y$ kilogram kepada gram', '1000y'],
        ['$h$ hours to minutes', '$h$ jam kepada minit', '60h'], ['$m$ minutes to seconds', '$m$ minit kepada saat', '60m'],
        ['RM$r$ to sen', 'RM$r$ kepada sen', '100r'], ['$a$ centimetres to millimetres', '$a$ sentimeter kepada milimeter', '10a'],
        ['$k$ kilometres to metres', '$k$ kilometer kepada meter', '1000k'], ['$w$ weeks to days', '$w$ minggu kepada hari', '7w'],
        ['$p$ litres to millilitres', '$p$ liter kepada mililiter', '1000p'],
      ];
      const c = r.pick(CV);
      return { q: T(`Write an expression for the conversion of ${c[0]}.`, `Tulis ungkapan bagi penukaran ${c[1]}.`), a: T(`$${c[2]}$`), sp: 'xs' };
    },
    /* sharing */
    (r) => {
      const k = r.int(3, 9), j = r.int(2, 8), nm = r.name();
      const forms = [
        [T(`${nm} has $p$ sweets and shares them equally among ${k} friends. Write an expression for the number of sweets each friend gets.`, `${nm} mempunyai $p$ biji gula-gula dan membahagikannya sama banyak kepada ${k} orang kawan. Tulis ungkapan bagi bilangan gula-gula yang diperoleh setiap kawan.`), `\\dfrac{p}{${k}}`],
        [T(`$${'x'}$ sweets are shared equally among $y$ children. Write an expression for the number of sweets each child gets.`, `$x$ biji gula-gula dibahagikan sama banyak antara $y$ orang kanak-kanak. Tulis ungkapan bagi bilangan gula-gula yang diperoleh setiap kanak-kanak.`), '\\dfrac{x}{y}'],
        [T(`Each bag holds ${k} oranges. Write an expression for the number of bags needed to pack $n$ oranges (all bags are full).`, `Setiap beg memuatkan ${k} biji oren. Tulis ungkapan bagi bilangan beg yang diperlukan untuk mengisi $n$ biji oren (semua beg penuh).`), `\\dfrac{n}{${k}}`],
        [T(`A bill of RM$b$ is shared equally by ${k} friends. Each friend also pays RM${j} for a drink. Write an expression for what each friend pays.`, `Bil berjumlah RM$b$ dikongsi sama banyak oleh ${k} orang kawan. Setiap kawan juga membayar RM${j} untuk minuman. Tulis ungkapan bagi jumlah yang dibayar oleh setiap kawan.`), `\\dfrac{b}{${k}}+${j}`],
        [T(`A cake weighing $m$ kg is cut into ${k} equal slices. Write an expression for the mass of ${j} slices.`, `Sebiji kek berjisim $m$ kg dipotong kepada ${k} keping yang sama berat. Tulis ungkapan bagi jisim ${j} keping.`), `\\dfrac{${j}m}{${k}}\\text{ kg}`],
      ];
      const [q, a] = r.pick(forms);
      return { q, a: T(`$${a}$`), sp: 's' };
    },
  ];

  /* matchstick pattern figure: n squares in a row / n triangles in a row */
  const stickFig = (kind, cnt) => {
    let o = '';
    const u = 34, x0 = 20, y0 = 16;
    if (kind === 'sq') {
      for (let i = 0; i <= cnt; i++) o += S.line(x0 + i * u, y0, x0 + i * u, y0 + u);
      o += S.line(x0, y0, x0 + cnt * u, y0) + S.line(x0, y0 + u, x0 + cnt * u, y0 + u);
    } else {
      for (let i = 0; i < cnt; i++) {
        const a = x0 + i * u;
        o += S.line(a, y0 + u, a + u, y0 + u) + S.line(a, y0 + u, a + u / 2, y0) + S.line(a + u / 2, y0, a + u, y0 + u);
      }
    }
    return S.wrap(x0 * 2 + cnt * u + 4, y0 * 2 + u, o, 'pattern');
  };
  const a51 = [
    /* rectangle with algebraic sides: perimeter */
    (r) => {
      const x = r.pick(['x', 'a', 'y']), p = r.int(2, 5), q0 = r.int(1, 4), s = r.int(1, 4), t = r.int(1, 4), sg = r.pick([1, -1]);
      const Lx = lin(p, q0, x), Wx = lin(s, sg * t, x);
      const per = lin(2 * (p + s), 2 * (q0 + sg * t), x);
      return { fig: boxFig(RECT, { '0-1': `(${Lx}) cm`, '1-2': `(${Wx}) cm` }, [0, 1, 2, 3]), q: T(`The diagram shows a rectangle with length $(${Lx})$ cm and width $(${Wx})$ cm. (a) Write an expression for its perimeter and simplify it. (b) State the coefficient of $${x}$ in your answer.`, `Rajah menunjukkan sebuah segi empat tepat dengan panjang $(${Lx})$ cm dan lebar $(${Wx})$ cm. (a) Tulis ungkapan bagi perimeternya dan ringkaskannya. (b) Nyatakan pekali bagi $${x}$ dalam jawapan anda.`), a: T(`(a) $2[(${Lx}) + (${Wx})] = ${pw(per)}$ cm (b) $${2 * (p + s)}$`), sp: 'm' };
    },
    /* triangle with three algebraic sides */
    (r) => {
      const x = r.pick(['x', 'n', 'm']), p = r.int(1, 4), q0 = r.int(1, 5), s = r.int(1, 3), t = r.int(1, 5), u = r.int(2, 6);
      const A = lin(p, q0, x), B = lin(s, t, x), C = `${u}${x}`;
      const per = lin(p + s + u, q0 + t, x);
      return { fig: boxFig([[0, 2], [4, 2], [1.5, 0]], { '0-1': `(${A}) cm`, '1-2': `(${B}) cm`, '2-0': `${C} cm` }), q: T(`The triangle has sides $(${A})$ cm, $(${B})$ cm and $${C}$ cm. Write a simplified expression for its perimeter.`, `Segi tiga itu mempunyai sisi $(${A})$ cm, $(${B})$ cm dan $${C}$ cm. Tulis ungkapan ringkas bagi perimeternya.`), a: T(`$${pw(per)}$ cm`), sp: 'm' };
    },
    /* square: perimeter and area; cube: volume */
    (r) => {
      const x = r.pick(['x', 'a', 'p', 'k']);
      const forms = [
        [T(`A square has sides of $${x}$ cm. Write expressions for (a) its perimeter, (b) its area. Use index form for (b).`, `Sebuah segi empat sama mempunyai sisi $${x}$ cm. Tulis ungkapan bagi (a) perimeternya, (b) luasnya. Gunakan bentuk indeks bagi (b).`), T(`(a) $4${x}$ cm (b) $${x} \\times ${x} = ${x}^2$ cm$^2$`), 'm'],
        [T(`A cube has edges of $${x}$ cm. Write expressions for (a) its volume in index form, (b) the total length of all its edges.`, `Sebuah kubus mempunyai tepi $${x}$ cm. Tulis ungkapan bagi (a) isi padunya dalam bentuk indeks, (b) jumlah panjang semua tepinya.`), T(`(a) $${x}^3$ cm$^3$ (b) $12${x}$ cm`), 'm'],
        [T(`A rectangle has length $2${x}$ cm and width $${x}$ cm. Write an expression for (a) its perimeter, (b) its area.`, `Sebuah segi empat tepat mempunyai panjang $2${x}$ cm dan lebar $${x}$ cm. Tulis ungkapan bagi (a) perimeternya, (b) luasnya.`), T(`(a) $6${x}$ cm (b) $2${x}^2$ cm$^2$`), 'm'],
      ];
      const [q, a, sp] = r.pick(forms);
      return { q, a, sp };
    },
    /* interpret an expression */
    (r) => {
      const c = r.int(2, 6), d = r.int(3, 9), nm = r.name();
      need(c !== d);
      const CT = [
        [T(`A shop sells pens at RM${c} each and notebooks at RM${d} each. ${nm} buys $p$ pens and $q$ notebooks.`, `Sebuah kedai menjual pen dengan harga RM${c} setiap satu dan buku nota dengan harga RM${d} setiap satu. ${nm} membeli $p$ batang pen dan $q$ buah buku nota.`), [
          [`${c}p`, T('the total cost of the pens', 'jumlah kos pen')], [`${d}q`, T('the total cost of the notebooks', 'jumlah kos buku nota')], [`${c}p+${d}q`, T('the total amount paid', 'jumlah bayaran')], [`p+q`, T('the total number of items bought', 'jumlah bilangan barang yang dibeli')]]],
        [T(`A bakery bakes $x$ trays of buns with ${c} buns on each tray and $y$ trays of tarts with ${d} tarts on each tray.`, `Sebuah kedai roti membakar $x$ dulang roti bun dengan ${c} biji bun pada setiap dulang dan $y$ dulang tart dengan ${d} biji tart pada setiap dulang.`), [
          [`${c}x`, T('the number of buns baked', 'bilangan bun yang dibakar')], [`${d}y`, T('the number of tarts baked', 'bilangan tart yang dibakar')], [`${c}x+${d}y`, T('the total number of buns and tarts', 'jumlah bilangan bun dan tart')], [`x+y`, T('the total number of trays used', 'jumlah bilangan dulang yang digunakan')]]],
      ];
      const cx = r.pick(CT), o = r.pick(cx[1]);
      const others = cx[1].filter((z) => z !== o);
      const list = r.shuffle([o].concat(r.sample(others, 3)));
      const L = (l) => list.map((z, i) => `(${AB[i]}) ${z[1][l]}`).join(' &emsp; ');
      return { q: T(`${cx[0].en} What does the expression $${o[0]}$ represent?<br>${L('en')}`, `${cx[0].ms} Apakah yang diwakili oleh ungkapan $${o[0]}$?<br>${L('ms')}`), a: T(`${AB[list.indexOf(o)]}: ${o[1].en}`, `${AB[list.indexOf(o)]}: ${o[1].ms}`), sp: 's' };
    },
    /* justify: expressions that look alike */
    (r) => {
      const x = r.pick(LT), t = r.pick([3, 4, 5]);
      const PR = [
        [`${x}+${x}`, `${x}^2`, (v) => v + v, (v) => v * v, 'x'],
        [`3${x}`, `${x}^3`, (v) => 3 * v, (v) => v * v * v, 'x'],
        [`2${x}`, `${x}+2`, (v) => 2 * v, (v) => v + 2, 'x'],
        [`${x} \\times ${x}`, `2${x}`, (v) => v * v, (v) => 2 * v, 'x'],
        [`${x}^2`, `2${x}`, (v) => v * v, (v) => 2 * v, 'x'],
        [`4${x}`, `${x}^4`, (v) => 4 * v, (v) => v ** 4, 'x'],
      ];
      const p = r.pick(PR), A = p[2](t), B = p[3](t);
      need(A !== B);
      return { q: T(`Farid says that $${p[0]}$ and $${p[1]}$ are the same expression. Test his claim by substituting $${x} = ${t}$. Is he correct? Explain what each expression means.`, `Farid berkata bahawa $${p[0]}$ dan $${p[1]}$ ialah ungkapan yang sama. Uji dakwaannya dengan menggantikan $${x} = ${t}$. Adakah dia betul? Terangkan maksud setiap ungkapan.`), a: T(`No. When $${x} = ${t}$: $${p[0]} = ${A}$ but $${p[1]} = ${B}$, so they are different expressions.`, `Tidak. Apabila $${x} = ${t}$: $${p[0]} = ${A}$ tetapi $${p[1]} = ${B}$, maka ungkapan itu berbeza.`), sp: 'm' };
    },
    /* classify equal expressions */
    (r) => {
      const v = r.pick(LT), k = r.pick([3, 4]);
      const rep1 = Array(k).fill(v).join(' + '), rep2 = Array(k).fill(v).join(' \\times ');
      const list = r.shuffle([`${rep1}`, `${k}${v}`, `${rep2}`, `${v}^{${k}}`, `${v} + ${k}`, `${k} \\times ${k} \\times ${v}`]).slice(0);
      const ok3 = list.filter((s) => s === rep1 || s === `${k}${v}`), ok4 = list.filter((s) => s === rep2 || s === `${v}^{${k}}`);
      const show = (l) => list.map((s, i) => `(${'abcdef'[i]}) $${s}$`).join(' &emsp; ');
      const at = (s) => 'abcdef'[list.indexOf(s)];
      return { q: T(`Study the expressions below.<br>${show()}<br>Which two expressions are equal to $${k}${v}$, and which two are equal to $${v}^{${k}}$?`, `Perhatikan ungkapan di bawah.<br>${show()}<br>Yang manakah dua ungkapan yang sama dengan $${k}${v}$, dan yang manakah dua ungkapan yang sama dengan $${v}^{${k}}$?`), a: T(`Equal to $${k}${v}$: (${at(rep1)}) and (${at(`${k}${v}`)}); equal to $${v}^{${k}}$: (${at(rep2)}) and (${at(`${v}^{${k}}`)}).`, `Sama dengan $${k}${v}$: (${at(rep1)}) dan (${at(`${k}${v}`)}); sama dengan $${v}^{${k}}$: (${at(rep2)}) dan (${at(`${v}^{${k}}`)}).`), sp: 'm' };
    },
    /* patterns with figures */
    (r) => {
      const kind = r.pick(['sq', 'tr']), c = kind === 'sq' ? 3 : 2, ne = 3, nn = r.int(8, 15);
      const cnt = (k) => c * k + 1;
      const nm = kind === 'sq' ? T('squares', 'segi empat sama') : T('triangles', 'segi tiga');
      const shape = kind === 'sq' ? T('squares', 'segi empat sama') : T('equilateral triangles', 'segi tiga sama sisi');
      return { fig: stickFig(kind, ne), q: T(`Matchsticks are used to make a row of ${shape.en}. The diagram shows a row of ${ne} ${nm.en}, which uses ${cnt(ne)} matchsticks. (a) Write an expression for the number of matchsticks needed for a row of $n$ ${nm.en}. (b) How many matchsticks are needed for ${nn} ${nm.en}?`, `Batang mancis digunakan untuk membentuk satu baris ${shape.ms}. Rajah menunjukkan satu baris ${ne} ${nm.ms}, yang menggunakan ${cnt(ne)} batang mancis. (a) Tulis ungkapan bagi bilangan batang mancis yang diperlukan untuk satu baris $n$ ${nm.ms}. (b) Berapakah batang mancis yang diperlukan untuk ${nn} ${nm.ms}?`), a: T(`(a) $${c}n + 1$ (b) ${c * nn + 1}`), sp: 'm' };
    },
    /* number puzzle */
    (r) => {
      const k = r.int(2, 5), j = r.int(2, 9), d = r.int(2, 4);
      const forms = [
        [T(`I think of a number $n$. I multiply it by ${k}, then add ${j}. Write an expression for my result.`, `Saya memikirkan satu nombor $n$. Saya mendarabkannya dengan ${k}, kemudian menambah ${j}. Tulis ungkapan bagi hasil saya.`), `${k}n+${j}`],
        [T(`I think of a number $n$. I add ${j}, then multiply the result by ${k}. Write an expression for my result.`, `Saya memikirkan satu nombor $n$. Saya menambah ${j}, kemudian mendarabkan hasilnya dengan ${k}. Tulis ungkapan bagi hasil saya.`), `${k}(n+${j})`],
        [T(`I think of a number $n$. I multiply it by ${k}, add ${j}, and divide the result by ${d}. Write an expression for my final answer.`, `Saya memikirkan satu nombor $n$. Saya mendarabkannya dengan ${k}, menambah ${j}, dan membahagikan hasilnya dengan ${d}. Tulis ungkapan bagi jawapan akhir saya.`), `\\dfrac{${k}n+${j}}{${d}}`],
        [T(`I think of a number $n$. I subtract ${j} from it, then square the result. Write an expression for my final answer.`, `Saya memikirkan satu nombor $n$. Saya menolak ${j} daripadanya, kemudian mengkuasaduakan hasilnya. Tulis ungkapan bagi jawapan akhir saya.`), `(n-${j})^2`],
        [T(`I think of a number $n$. I divide it by ${d}, then subtract ${j}. Write an expression for my result.`, `Saya memikirkan satu nombor $n$. Saya membahagikannya dengan ${d}, kemudian menolak ${j}. Tulis ungkapan bagi hasil saya.`), `\\dfrac{n}{${d}}-${j}`],
        [T(`I think of a number $n$. I multiply it by itself and then multiply by ${k}. Write an expression, using an index, for my result.`, `Saya memikirkan satu nombor $n$. Saya mendarabkannya dengan dirinya sendiri dan kemudian mendarabkan dengan ${k}. Tulis ungkapan, menggunakan indeks, bagi hasil saya.`), `${k}n^2`],
      ];
      const [q, a] = r.pick(forms);
      return { q, a: T(`$${a}$`), sp: 's' };
    },
    /* mobile plan / taxi with several parts */
    (r) => {
      const a = r.int(2, 8), b = r.int(10, 30), k = r.int(3, 8), nm = r.name();
      const CT = [
        [T(`A taxi charges a flat fee of RM${b} plus RM${a} for every kilometre. ${nm} travels $d$ km.`, `Sebuah teksi mengenakan bayaran tetap RM${b} ditambah RM${a} bagi setiap kilometer. ${nm} menaiki teksi itu sejauh $d$ km.`), 'd', T('distance', 'jarak')],
        [T(`A gym charges a joining fee of RM${b} plus RM${a} for every visit. ${nm} visits the gym $d$ times.`, `Sebuah gimnasium mengenakan yuran pendaftaran RM${b} ditambah RM${a} bagi setiap lawatan. ${nm} melawat gimnasium itu sebanyak $d$ kali.`), 'd', T('number of visits', 'bilangan lawatan')],
        [T(`A printing shop charges RM${b} for a design plus RM${a} for each copy printed. ${nm} prints $d$ copies.`, `Sebuah kedai cetak mengenakan bayaran RM${b} bagi reka bentuk ditambah RM${a} bagi setiap salinan yang dicetak. ${nm} mencetak $d$ salinan.`), 'd', T('number of copies', 'bilangan salinan')],
      ];
      const c = r.pick(CT);
      return { q: T(`${c[0].en} (a) Which is the variable and which are fixed amounts? (b) Write an expression for the total charge in RM. (c) Find the charge when $d = ${k}$.`, `${c[0].ms} (a) Yang manakah pemboleh ubah dan yang manakah jumlah tetap? (b) Tulis ungkapan bagi jumlah bayaran dalam RM. (c) Cari bayaran apabila $d = ${k}$.`), a: T(`(a) Variable: the ${c[2].en} $d$; fixed: RM${b} and RM${a} per unit (b) RM$(${lin(a, b, 'd')})$ (c) RM${a * k + b}`, `(a) Pemboleh ubah: ${c[2].ms} $d$; tetap: RM${b} dan RM${a} bagi setiap unit (b) RM$(${lin(a, b, 'd')})$ (c) RM${a * k + b}`), sp: 'm' };
    },
    /* which situation fits an expression */
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9);
      need(a !== b);
      const S1 = [
        [T(`A pen costs RM${a}. What is the cost of $n$ pens?`, `Sebatang pen berharga RM${a}. Berapakah kos $n$ batang pen?`), `${a}n`],
        [T(`Ali has RM${a} and receives RM$n$ more. How much does he have?`, `Ali mempunyai RM${a} dan menerima RM$n$ lagi. Berapakah wangnya sekarang?`), `n+${a}`],
        [T(`A rope $n$ m long is cut into ${a} equal pieces. What is the length of each piece?`, `Seutas tali panjangnya $n$ m dipotong kepada ${a} bahagian yang sama panjang. Berapakah panjang setiap bahagian?`), `\\dfrac{n}{${a}}`],
        [T(`Siti has $n$ stickers and gives ${a} away. How many are left?`, `Siti mempunyai $n$ pelekat dan memberikan ${a} keping. Berapa keping yang tinggal?`), `n-${a}`],
        [T(`A rectangle has length $n$ cm and width ${a} cm. What is its area in cm$^2$?`, `Sebuah segi empat tepat mempunyai panjang $n$ cm dan lebar ${a} cm. Berapakah luasnya dalam cm$^2$?`), `${a}n`],
        [T(`A square has sides of $n$ cm. What is its perimeter?`, `Sebuah segi empat sama mempunyai sisi $n$ cm. Berapakah perimeternya?`), `4n`],
      ];
      const tgt = r.pick(S1), pool = S1.filter((z) => z[1] !== tgt[1]);
      const list = r.shuffle([tgt].concat(r.sample(pool, 2)));
      const L = (l) => list.map((z, i) => `(${AB[i]}) ${z[0][l]}`).join('<br>');
      return { q: T(`Which situation is described by the expression $${tgt[1]}$?<br>${L('en')}`, `Situasi yang manakah diterangkan oleh ungkapan $${tgt[1]}$?<br>${L('ms')}`), a: T(`${AB[list.indexOf(tgt)]}: ${tgt[0].en}`, `${AB[list.indexOf(tgt)]}: ${tgt[0].ms}`), sp: 's' };
    },
    /* journeys with two stages */
    (r) => {
      const a = r.int(2, 4), b = r.int(1, 3), d = r.pick([10, 20, 30]), v = r.pick(['v', 'x', 's']);
      const forms = [
        [T(`A car travels at $${v}$ km/h for ${a} hours and then at $(${v} + ${d})$ km/h for ${b} hours. Write an expression for the total distance travelled.`, `Sebuah kereta bergerak pada laju $${v}$ km/j selama ${a} jam dan kemudian pada laju $(${v} + ${d})$ km/j selama ${b} jam. Tulis ungkapan bagi jumlah jarak yang dilalui.`), `${a}${v}+${b}(${v}+${d})`, `${lin(a + b, b * d, v)}`],
        [T(`A cyclist rides at $${v}$ km/h for ${a} hours, rests, and then rides at $(${v} - ${b})$ km/h for ${a + 1} hours. Write an expression for the total distance.`, `Seorang penunggang basikal mengayuh pada laju $${v}$ km/j selama ${a} jam, berehat, dan kemudian mengayuh pada laju $(${v} - ${b})$ km/j selama ${a + 1} jam. Tulis ungkapan bagi jumlah jarak.`), `${a}${v}+${a + 1}(${v}-${b})`, `${lin(2 * a + 1, -b * (a + 1), v)}`],
      ];
      const [q, a0, a1] = r.pick(forms);
      return { q, a: T(`$${a0}$ (or $${a1}$ km)`), sp: 'm' };
    },
    /* form an expression, then evaluate */
    (r) => {
      const a = r.int(2, 8), b = r.int(2, 9), k = r.int(3, 9), it = r.pick(bank.items), nm = r.name();
      const forms = [
        [T(`${nm} buys $n$ ${it.en} at RM${a} each and pays RM${b} for a gift bag. (a) Write an expression for the total cost. (b) Find the total cost when $n = ${k}$.`, `${nm} membeli $n$ ${it.ms} dengan harga RM${a} setiap satu dan membayar RM${b} untuk beg hadiah. (a) Tulis ungkapan bagi jumlah kos. (b) Cari jumlah kos apabila $n = ${k}$.`), `RM$${lin(a, b, 'n')}$`, a * k + b],
        [T(`A rectangle has length $(x + ${b})$ cm and width $${a}$ cm. (a) Write an expression for its area. (b) Find the area when $x = ${k}$.`, `Sebuah segi empat tepat mempunyai panjang $(x + ${b})$ cm dan lebar $${a}$ cm. (a) Tulis ungkapan bagi luasnya. (b) Cari luas apabila $x = ${k}$.`), `$${a}(x + ${b})$ cm$^2$`, a * (k + b)],
      ];
      const [q, a0, val] = r.pick(forms);
      return { q, a: T(`(a) ${a0} (b) ${val}`), sp: 'm' };
    },
    /* which of the given are variables (context, 3 quantities, multi-part) */
    (r) => {
      const c = r.int(3, 8), nm = r.name();
      const CT = [
        [T(`A canteen sells nasi lemak at RM${c} per packet. In one day it sells $n$ packets and the sales are RM$S$.`, `Sebuah kantin menjual nasi lemak pada harga RM${c} sebungkus. Dalam sehari ia menjual $n$ bungkus dan jualannya ialah RM$S$.`), 'n', 'S', T(`the price per packet (RM${c})`, `harga sebungkus (RM${c})`), `${c}n`],
        [T(`A car uses 1 litre of petrol for every ${c + 5} km. On a trip of $d$ km it uses $L$ litres.`, `Sebuah kereta menggunakan 1 liter petrol bagi setiap ${c + 5} km. Dalam satu perjalanan sejauh $d$ km ia menggunakan $L$ liter.`), 'd', 'L', T(`the distance for 1 litre (${c + 5} km)`, `jarak bagi 1 liter (${c + 5} km)`), `\\dfrac{d}{${c + 5}}`],
      ];
      const cx = r.pick(CT);
      return { q: T(`${cx[0].en} (a) State the quantity that stays fixed. (b) State the two quantities represented by the letters $${cx[1]}$ and $${cx[2]}$ that change. (c) Write an expression for $${cx[2]}$ in terms of $${cx[1]}$.`, `${cx[0].ms} (a) Nyatakan kuantiti yang kekal tetap. (b) Nyatakan dua kuantiti yang diwakili oleh huruf $${cx[1]}$ dan $${cx[2]}$ yang berubah. (c) Tulis ungkapan bagi $${cx[2]}$ dalam sebutan $${cx[1]}$.`), a: T(`(a) ${cx[3].en} (b) both $${cx[1]}$ and $${cx[2]}$ vary (c) $${cx[2]} = ${cx[4]}$`, `(a) ${cx[3].ms} (b) $${cx[1]}$ dan $${cx[2]}$ kedua-duanya berubah (c) $${cx[2]} = ${cx[4]}$`), sp: 'm' };
    },
    /* index in geometry: area / volume from repeated multiplication */
    (r) => {
      const x = r.pick(['x', 'a', 'y']), k = r.int(2, 5);
      const forms = [
        [T(`The area of a square is found by multiplying the length by itself. A square has sides of $${x}$ cm. (a) Write its area in index form. (b) Find the area when $${x} = ${k}$.`, `Luas sebuah segi empat sama dicari dengan mendarab panjang dengan dirinya sendiri. Sebuah segi empat sama mempunyai sisi $${x}$ cm. (a) Tulis luasnya dalam bentuk indeks. (b) Cari luas apabila $${x} = ${k}$.`), T(`(a) $${x}^2$ cm$^2$ (b) ${k * k} cm$^2$`)],
        [T(`A cube has edges of $${x}$ cm. Its volume is length $\\times$ width $\\times$ height. (a) Write its volume in index form. (b) Find the volume when $${x} = ${k}$.`, `Sebuah kubus mempunyai tepi $${x}$ cm. Isi padunya ialah panjang $\\times$ lebar $\\times$ tinggi. (a) Tulis isi padunya dalam bentuk indeks. (b) Cari isi padu apabila $${x} = ${k}$.`), T(`(a) $${x}^3$ cm$^3$ (b) ${k ** 3} cm$^3$`)],
        [T(`A cuboid has a square base of side $${x}$ cm and height $${k}$ cm. Write an expression for (a) the area of the base, (b) the volume of the cuboid.`, `Sebuah kuboid mempunyai tapak segi empat sama bersisi $${x}$ cm dan tinggi $${k}$ cm. Tulis ungkapan bagi (a) luas tapak, (b) isi padu kuboid.`), T(`(a) $${x}^2$ cm$^2$ (b) $${k}${x}^2$ cm$^3$`)],
      ];
      const [q, a0] = r.pick(forms);
      return { q, a: a0, sp: 'm' };
    },
  ];
  SPM.extend('F1-5.1', { e: e51, m: m51, a: a51 });

  /* ================================================================ F1-5.2 */
  /** term = [coefficient, 'x' | 'x^2' | 'xy' | ''] ; evaluate and collect independently of the display code */
  const evT = (vs, val) => {
    let p = 1;
    vs.replace(/([a-z])(?:\^(\d))?/g, (_, l, e) => ((p *= Math.pow(val[l], e ? +e : 1)), ''));
    return p;
  };
  const evP = (ts, val) => ts.reduce((s, t) => s + t[0] * evT(t[1], val), 0);
  const key = (vs) => vs.replace(/\^\d/g, (m) => m).split(/(?=[a-z])/).sort().join('');
  const collect = (ts) => {
    const m = new Map();
    for (const [c, vs] of ts) m.set(key(vs), (m.get(key(vs)) || 0) + c);
    return [...m].map(([k, c]) => [c, k]).filter((t) => t[0] !== 0);
  };
  const VALS = { x: 3, y: -2, a: 5, b: 7, m: 2, n: 4, p: 3, q: 5, t: 2, h: 3, w: 4 };
  /** collect + self-check by substitution */
  const simp = (ts) => {
    const c = collect(ts);
    if (evP(ts, VALS) !== evP(c, VALS)) throw new Error('collect mismatch');
    return c;
  };
  const P = (ts) => poly(ts);
  const fterm = (c, vs) => {
    const a = Fr.make(Math.abs(c.n), c.d);
    const body = a.d === 1 ? (a.n === 1 && vs ? '' : n(a.n)) : `\\dfrac{${a.n}}{${a.d}}`;
    return body + vs;
  };
  const fpoly = (ts) => {
    let o = '', first = true;
    for (const [c, vs] of ts) {
      if (c.n === 0) continue;
      o += (first ? (c.n < 0 ? '-' : '') : c.n < 0 ? ' - ' : ' + ') + fterm(c, vs);
      first = false;
    }
    return o || '0';
  };
  const SIMPF = [
    (E) => T(`Simplify ${E}.`, `Ringkaskan ${E}.`),
    (E) => T(`Write ${E} in its simplest form.`, `Tulis ${E} dalam bentuk yang paling ringkas.`),
    (E) => T(`Collect the like terms in ${E}.`, `Kumpulkan sebutan serupa dalam ${E}.`),
    (E) => T(`By combining like terms, simplify ${E}.`, `Dengan menggabungkan sebutan serupa, ringkaskan ${E}.`),
    (E) => T(`Find the simplest form of ${E}.`, `Cari bentuk yang paling ringkas bagi ${E}.`),
    (E) => T(`Aina is asked to simplify ${E}. What answer should she give?`, `Aina diminta meringkaskan ${E}. Apakah jawapan yang patut diberikannya?`),
    (E) => T(`Reduce ${E} to a shorter expression.`, `Ringkaskan ${E} kepada ungkapan yang lebih pendek.`),
  ];
  const sq = (v) => `${v}^2`;
  const V2 = (r) => r.sample(LT, 2);
  const shuf = (r, ts) => {
    for (let i = 0; i < 30; i++) {
      const s = r.shuffle(ts);
      if (s[0][0] > 0) return s;
    }
    return ts;
  };

  const e52 = [
    /* two like terms */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), sg = r.pick([1, -1]);
      need(sg > 0 || a !== b);
      const forms = [[[a, v], [sg * b, v]], [[a, v], [sg * b, v], [c, '']], [[1, v], [b, v]], [[a, v], [c, ''], [sg * b, v]], [[a, v], [sg * b, v], [c, w]]];
      let ts = r.pick(forms);
      if (ts[0][0] < ts[1][0] && ts.length === 2 && sg < 0) ts = [[b + a, v], [-b, v]];
      const out = simp(ts);
      const E = `$${P(ts)}$`;
      return { q: r.pick(SIMPF.slice(0, 5))(E), a: T(`$${P(out)}$`), sp: 'xs' };
    },
    /* are they like terms */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 9), b = r.int(2, 9);
      need(a !== b);
      const PR = [[`${a}${v}`, `${b}${v}`, 1, T('same variable', 'pemboleh ubah yang sama')], [`${a}${v}`, `${b}${w}`, 0, T('different variables', 'pemboleh ubah yang berbeza')], [`${a}${v}${w}`, `${b}${w}${v}`, 1, T(`the same letters ($${v}${w}$)`, `huruf yang sama ($${v}${w}$)`)], [`${a}${v}`, `${b}${v}^2`, 0, T(`different powers of $${v}$`, `kuasa $${v}$ yang berbeza`)], [`${a}${v}^2`, `${b}${v}^2`, 1, T(`the same variable and power`, 'pemboleh ubah dan kuasa yang sama')], [`${a}${v}`, `${b}`, 0, T('one has no variable', 'satu tiada pemboleh ubah')], [`${a}`, `${b}`, 1, T('both are constants', 'kedua-duanya pemalar')]];
      const p = r.pick(PR);
      const q = r.pick([
        T(`Are $${p[0]}$ and $${p[1]}$ like terms? Give a reason.`, `Adakah $${p[0]}$ dan $${p[1]}$ sebutan serupa? Berikan sebab.`),
        T(`State whether $${p[0]}$ and $${p[1]}$ are like terms or unlike terms.`, `Nyatakan sama ada $${p[0]}$ dan $${p[1]}$ ialah sebutan serupa atau sebutan tak serupa.`),
      ]);
      return { q, a: T(`${p[2] ? 'Like terms' : 'Unlike terms'}: ${p[3].en}.`, `${p[2] ? 'Sebutan serupa' : 'Sebutan tak serupa'}: ${p[3].ms}.`), sp: 's' };
    },
    /* evaluate */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 9), b = r.int(1, 9), k = r.int(2, 6);
      const F = [
        [`${a}${v}+${b}`, a * k + b], [`${a}${v}-${b}`, a * k - b], [`${a * 2}+${v}`, a * 2 + k], [`${v}^2`, k * k], [`${a}${v}^2`, a * k * k], [`${a * k}\\div${v}`, a], [`${b + a * k}-${a}${v}`, b],
      ].map((f) => [f[0].replace(/([+-])/g, ' $1 ').replace('\\div', ' \\div '), f[1]]);
      const [E, val] = r.pick(F);
      const q = r.pick([
        T(`Find the value of $${E}$ when $${v} = ${k}$.`, `Cari nilai $${E}$ apabila $${v} = ${k}$.`),
        T(`Evaluate $${E}$ if $${v} = ${k}$.`, `Nilaikan $${E}$ jika $${v} = ${k}$.`),
        T(`Substitute $${v} = ${k}$ into $${E}$ and calculate the value.`, `Gantikan $${v} = ${k}$ ke dalam $${E}$ dan hitung nilainya.`),
        T(`What is the value of the expression $${E}$ when $${v}$ is ${k}?`, `Apakah nilai ungkapan $${E}$ apabila $${v}$ ialah ${k}?`),
      ]);
      return { q, a: T(`$${val}$`), sp: 'xs' };
    },
    /* multiply monomials */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 7), b = r.int(2, 7);
      const F = [[`${a}${v} \\times ${b}${w}`, `${a * b}${v}${w}`], [`${a}${v} \\times ${b}`, `${a * b}${v}`], [`${v} \\times ${b}${w}`, `${b}${v}${w}`], [`${a}${v} \\times ${b}${v}`, `${a * b}${v}^2`], [`${v} \\times ${v}`, `${v}^2`], [`${a}${v} \\times ${w}`, `${a}${v}${w}`]];
      const [E, ans] = r.pick(F);
      const q = r.pick([T(`Simplify $${E}$.`, `Ringkaskan $${E}$.`), T(`Find the product of $${E.split(' \\times ').join('$ and $')}$.`, `Cari hasil darab $${E.split(' \\times ').join('$ dan $')}$.`), T(`Multiply: $${E}$.`, `Darabkan: $${E}$.`)]);
      return { q, a: T(`$${ans}$`), sp: 'xs' };
    },
    /* divide monomials */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 6), b = r.int(2, 6);
      const F = [[`${a * b}${v} \\div ${a}`, `${b}${v}`], [`${a * b}${v} \\div ${b}${v}`, `${a}`], [`${a * b}${v}${w} \\div ${a}${v}`, `${b}${w}`], [`${a * b}${v}^2 \\div ${a}${v}`, `${b}${v}`], [`${a * b}${v}${w} \\div ${b}${w}`, `${a}${v}`]];
      const [E, ans] = r.pick(F);
      const q = r.pick([T(`Simplify $${E}$.`, `Ringkaskan $${E}$.`), T(`Divide: $${E}$.`, `Bahagikan: $${E}$.`), T(`Find the quotient of $${E.split(' \\div ').join('$ divided by $')}$.`, `Cari hasil bahagi $${E.split(' \\div ').join('$ dibahagi dengan $')}$.`)]);
      return { q, a: T(`$${ans}$`), sp: 'xs' };
    },
    /* fill in the blank */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 8), b = r.int(2, 8), c = r.int(2, 5);
      const F = [
        [`${a}${v} + \\square = ${a + b}${v}`, `${b}${v}`], [`${a + b}${v} - \\square = ${a}${v}`, `${b}${v}`], [`\\square \\times ${b}${w} = ${a * b}${v}${w}`, `${a}${v}`],
        [`${a * c}${v} \\div \\square = ${a}`, `${c}${v}`], [`\\square + ${b}${w} = ${a}${w} + ${b}${w}`, `${a}${w}`], [`${v} \\times \\square = ${a}${v}^2`, `${a}${v}`],
      ];
      const [E, ans] = r.pick(F);
      return { q: T(`Find the missing term: $${E}$.`, `Cari sebutan yang hilang: $${E}$.`), a: T(`$${ans}$`), sp: 'xs' };
    },
    /* true / false */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 8), b = r.int(2, 8);
      const F = [
        [`${a}${v} + ${b}${v} = ${a + b}${v}^2`, 0, T(`the powers do not change when adding: $${a}${v} + ${b}${v} = ${a + b}${v}$`, `kuasa tidak berubah semasa menambah: $${a}${v} + ${b}${v} = ${a + b}${v}$`)],
        [`${a}${v} + ${b}${w} = ${a + b}${v}${w}`, 0, T('unlike terms cannot be combined', 'sebutan tak serupa tidak boleh digabungkan')],
        [`${a}${v} \\times ${b}${w} = ${a * b}${v}${w}`, 1, T('multiply the coefficients and join the letters', 'darabkan pekali dan gabungkan huruf')],
        [`${a}${v} \\times ${b}${w} = ${a + b}${v}${w}`, 0, T(`the coefficients are multiplied: ${a} $\\times$ ${b} = ${a * b}`, `pekali didarab: ${a} $\\times$ ${b} = ${a * b}`)],
        [`${a * b}${v} \\div ${b} = ${a}${v}`, 1, T('divide the coefficients', 'bahagikan pekali')],
        [`${v} + ${v} = ${v}^2`, 0, T(`$${v} + ${v} = 2${v}$`, `$${v} + ${v} = 2${v}$`)],
        [`${a + b}${v} - ${b}${v} = ${a}${v}`, 1, T('subtract the coefficients of like terms', 'tolak pekali sebutan serupa')],
        [`${v} \\times ${v} = 2${v}`, 0, T(`$${v} \\times ${v} = ${v}^2$`, `$${v} \\times ${v} = ${v}^2$`)],
      ];
      const [E, ok, why] = r.pick(F);
      return { q: T(`True or false: $${E}$.`, `Benar atau palsu: $${E}$.`), a: T(`${ok ? 'True' : 'False'}: ${why.en}.`, `${ok ? 'Benar' : 'Palsu'}: ${why.ms}.`), sp: 's' };
    },
    /* MCQ equal to */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 8), b = r.int(2, 8), c = r.pick([2, 3, 4, 5]);
      const F = [
        [`${a}${v} + ${b}${v}`, `${a + b}${v}`, [`${a + b}${v}^2`, `${a * b}${v}`, `${a + b}`]],
        [`${a}${v} \\times ${b}${w}`, `${a * b}${v}${w}`, [`${a + b}${v}${w}`, `${a * b}${v} + ${w}`, `${a * b}${v}^${w}`.replace(`^${w}`, `${w}^2`)]],
        [`${a + b + c}${v} - ${b}${v}`, `${a + c}${v}`, [`${a + c}`, `${a + b + c}`, `${a + c}${v}^2`]],
        [`${c * a}${v} \\div ${c}`, `${a}${v}`, [`${c * a}`, `${a}`, `${a}${v}^2`]],
      ];
      const [E, right, wr] = r.pick(F);
      const o = mcq(r, `$${right}$`, wr.map((z) => `$${z}$`));
      return { q: T(`Which of the following is equal to $${E}$?<br>${o.s}`, `Yang manakah sama dengan $${E}$?<br>${o.s}`), a: T(`${o.L}: $${right}$`), sp: 'xs' };
    },
    /* spot the error */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 8), b = r.int(2, 8), nm = r.name();
      const F = [
        [`${a}${v} + ${b}${w}`, `${a + b}${v}${w}`, `${a}${v} + ${b}${w}`, T('$' + v + '$ and $' + w + '$ are unlike terms, so the expression cannot be simplified.', '$' + v + '$ dan $' + w + '$ ialah sebutan tak serupa, maka ungkapan itu tidak boleh diringkaskan.')],
        [`${a}${v} + ${b}${v}`, `${a + b}${v}^2`, `${a + b}${v}`, T('adding like terms does not change the power of the variable.', 'menambah sebutan serupa tidak mengubah kuasa pemboleh ubah.')],
        [`${a}${v} \\times ${b}${w}`, `${a + b}${v}${w}`, `${a * b}${v}${w}`, T('the coefficients must be multiplied, not added.', 'pekali mesti didarab, bukan ditambah.')],
        [`${v} \\times ${v}`, `2${v}`, `${v}^2`, T(`$${v} \\times ${v} = ${v}^2$, while $2${v}$ means $${v} + ${v}$.`, `$${v} \\times ${v} = ${v}^2$, manakala $2${v}$ bermaksud $${v} + ${v}$.`)],
      ];
      const [E, wrong, right, why] = r.pick(F);
      return { q: T(`${nm} simplified $${E}$ and got $${wrong}$. Is this correct? If not, find the correct answer and explain the mistake.`, `${nm} meringkaskan $${E}$ dan mendapat $${wrong}$. Adakah ini betul? Jika tidak, cari jawapan yang betul dan terangkan kesilapan itu.`), a: T(`No. The correct answer is $${right}$: ${why.en}`, `Tidak. Jawapan yang betul ialah $${right}$: ${why.ms}`), sp: 's' };
    },
  ];

  /* monomials: [coef, 'x^2y'] */
  const parseM = (vs) => {
    const o = {};
    vs.replace(/([a-z])(?:\^(\d))?/g, (_, l, e) => ((o[l] = (o[l] || 0) + (e ? +e : 1)), ''));
    return o;
  };
  const fmtM = (o) => Object.keys(o).sort().filter((l) => o[l] > 0).map((l) => (o[l] === 1 ? l : `${l}^${o[l]}`)).join('');
  const chkM = (res, exp) => { if (evT(res[1], VALS) * res[0] !== exp) throw new Error('monomial mismatch'); return res; };
  const mulM = (t, u) => {
    const A = parseM(t[1]), B = parseM(u[1]);
    for (const l in B) A[l] = (A[l] || 0) + B[l];
    return chkM([t[0] * u[0], fmtM(A)], t[0] * evT(t[1], VALS) * u[0] * evT(u[1], VALS));
  };
  const divM = (t, u) => {
    need(t[0] % u[0] === 0);
    const A = parseM(t[1]), B = parseM(u[1]);
    for (const l in B) { A[l] = (A[l] || 0) - B[l]; need(A[l] >= 0); }
    return chkM([t[0] / u[0], fmtM(A)], (t[0] * evT(t[1], VALS)) / (u[0] * evT(u[1], VALS)));
  };
  const P1 = (t) => poly([t]);
  const PP = (t) => (t[0] < 0 ? `(${P1(t)})` : P1(t));
  const rmono = (r, letters, lo, hi, pw) => {
    const ls = r.sample(letters, r.int(1, 2)), c = r.nz(lo, hi);
    return [c, ls.map((l) => (pw && r.chance(0.3) ? `${l}^2` : l)).join('')];
  };

  const m52 = [
    /* collect several terms */
    (r) => {
      const [v, w] = V2(r), c = [r.nz(-9, 9), r.nz(-9, 9), r.nz(-9, 9), r.nz(-9, 9)], k = r.nz(-9, 9);
      const forms = [
        [[c[0], v], [c[1], w], [c[2], v], [c[3], w]], [[c[0], v], [c[1], w], [c[2], v], [k, '']], [[c[0], v], [c[1], w], [c[2], v], [c[3], w], [k, '']],
        [[c[0], `${v}${w}`], [c[1], v], [c[2], `${v}${w}`]], [[c[0], sq(v)], [c[1], v], [c[2], sq(v)]],
      ];
      const ts = shuf(r, r.pick(forms)), out = simp(ts);
      need(out.length >= 1 && out.length < ts.length && ts[0][0] > 0);
      return { q: r.pick(SIMPF)(`$${P(ts)}$`), a: T(`$${P(out)}$`), sp: 's' };
    },
    /* multiply monomials */
    (r) => {
      const t = rmono(r, LT, -6, 9, true), u = rmono(r, LT, -6, 9, true);
      need(Math.abs(t[0]) > 1 || t[1].length > 1);
      const res = mulM(t, u), E = `${PP(t)} \\times ${PP(u)}`;
      const q = r.pick([
        T(`Simplify $${E}$.`, `Ringkaskan $${E}$.`), T(`Find the product of $${P1(t)}$ and $${P1(u)}$.`, `Cari hasil darab $${P1(t)}$ dan $${P1(u)}$.`),
        T(`Multiply $${P1(t)}$ by $${P1(u)}$ and give the answer in its simplest form.`, `Darabkan $${P1(t)}$ dengan $${P1(u)}$ dan berikan jawapan dalam bentuk teringkas.`),
      ]);
      return { q, a: T(`$${P1(res)}$`), sp: 's' };
    },
    /* divide monomials */
    (r) => {
      const u = rmono(r, LT, 2, 6, false), k = rmono(r, LT, 2, 5, true);
      const t = mulM(u, k), res = divM(t, u);
      need(t[1].length > 0);
      const q = r.pick([T(`Simplify $${P1(t)} \\div ${P1(u)}$.`, `Ringkaskan $${P1(t)} \\div ${P1(u)}$.`), T(`Divide $${P1(t)}$ by $${P1(u)}$.`, `Bahagikan $${P1(t)}$ dengan $${P1(u)}$.`), T(`Find the value of $\\dfrac{${P1(t)}}{${P1(u)}}$ in its simplest form.`, `Cari nilai $\\dfrac{${P1(t)}}{${P1(u)}}$ dalam bentuk teringkas.`)]);
      return { q, a: T(`$${P1(res)}$`), sp: 's' };
    },
    /* evaluate with two variables (some negative) */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 6), b = r.int(2, 6), x = r.int(2, 5), y = r.nz(-4, 4);
      const ts = r.pick([[[a, v], [-b, w]], [[a, v], [b, w]], [[a, `${v}${w}`], [b, v]], [[a, sq(v)], [-b, w]], [[a, v], [-b, `${v}${w}`]], [[1, sq(v)], [-1, sq(w)]]]);
      const val = { [v]: x, [w]: y }, res = evP(ts, val);
      const E = P(ts);
      const q = r.pick([
        T(`Find the value of $${E}$ when $${v} = ${x}$ and $${w} = ${y}$.`, `Cari nilai $${E}$ apabila $${v} = ${x}$ dan $${w} = ${y}$.`),
        T(`Given that $${v} = ${x}$ and $${w} = ${y}$, evaluate $${E}$.`, `Diberi $${v} = ${x}$ dan $${w} = ${y}$, nilaikan $${E}$.`),
        T(`Evaluate $${E}$ if $${w} = ${y}$ and $${v} = ${x}$.`, `Nilaikan $${E}$ jika $${w} = ${y}$ dan $${v} = ${x}$.`),
      ]);
      return { q, a: T(`$${res}$`), sp: 's' };
    },
    /* error in collecting like terms */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 8), b = r.int(2, 8), c = r.int(2, 8), d = r.int(2, 8), nm = r.name();
      need(a !== c && b !== d);
      const ts = [[a, v], [b, w], [c, v], [-d, w]], out = simp(ts);
      const wrongs = [
        [`${a + c}${v}${w}`, T('the terms in $' + v + '$ and $' + w + '$ are unlike and cannot be added together', 'sebutan $' + v + '$ dan $' + w + '$ ialah sebutan tak serupa dan tidak boleh digabungkan')],
        [poly([[a + c, v], [b + d, w]]), T(`the sign of $-${d}${w}$ was ignored`, `tanda bagi $-${d}${w}$ diabaikan`)],
        [poly([[a - c, v], [b - d, w]]), T(`$${c}${v}$ is added, not subtracted`, `$${c}${v}$ ditambah, bukan ditolak`)],
      ];
      const [bad, why] = r.pick(wrongs);
      need(bad !== P(out));
      const E = P(ts);
      return { q: T(`${nm} simplified $${E}$ and got $${bad}$. Find the correct answer and state the mistake.`, `${nm} meringkaskan $${E}$ dan mendapat $${bad}$. Cari jawapan yang betul dan nyatakan kesilapannya.`), a: T(`Correct answer: $${P(out)}$. Mistake: ${why.en}.`, `Jawapan yang betul: $${P(out)}$. Kesilapan: ${why.ms}.`), sp: 's' };
    },
    /* formulae */
    (r) => {
      const l = r.int(3, 12), w = r.int(2, 9), t = r.int(2, 8);
      need(l > w);
      const FM = [
        [T(`The perimeter of a rectangle is $P = 2l + 2w$. Find $P$ when $l = ${l}$ and $w = ${w}$.`, `Perimeter sebuah segi empat tepat ialah $P = 2l + 2w$. Cari $P$ apabila $l = ${l}$ dan $w = ${w}$.`), 2 * l + 2 * w],
        [T(`The area of a triangle is $A = \\dfrac{1}{2}bh$. Find $A$ when $b = ${2 * l}$ and $h = ${w}$.`, `Luas sebuah segi tiga ialah $A = \\dfrac{1}{2}bh$. Cari $A$ apabila $b = ${2 * l}$ dan $h = ${w}$.`), l * w],
        [T(`The cost, in RM, of hiring a hall for $h$ hours is $C = ${w * 10}h + ${l * 10}$. Find $C$ when $h = ${t}$.`, `Kos, dalam RM, menyewa sebuah dewan selama $h$ jam ialah $C = ${w * 10}h + ${l * 10}$. Cari $C$ apabila $h = ${t}$.`), w * 10 * t + l * 10],
        [T(`The distance travelled is $d = st$. Find $d$ when $s = ${l * 10}$ and $t = ${t}$.`, `Jarak yang dilalui ialah $d = st$. Cari $d$ apabila $s = ${l * 10}$ dan $t = ${t}$.`), l * 10 * t],
        [T(`The total mark of a test is $M = 2a + 3b$, where $a$ is the number of easy questions and $b$ is the number of hard questions answered correctly. Find $M$ when $a = ${l}$ and $b = ${w}$.`, `Jumlah markah suatu ujian ialah $M = 2a + 3b$, dengan $a$ ialah bilangan soalan mudah dan $b$ ialah bilangan soalan sukar yang dijawab dengan betul. Cari $M$ apabila $a = ${l}$ dan $b = ${w}$.`), 2 * l + 3 * w],
        [T(`The area of a trapezium is $A = \\dfrac{1}{2}(a + b)h$. Find $A$ when $a = ${l}$, $b = ${l + 2}$ and $h = ${2 * w}$.`, `Luas sebuah trapezium ialah $A = \\dfrac{1}{2}(a + b)h$. Cari $A$ apabila $a = ${l}$, $b = ${l + 2}$ dan $h = ${2 * w}$.`), (2 * l + 2) * w],
        [T(`The volume of a cuboid is $V = lwh$. Find $V$ when $l = ${l}$, $w = ${w}$ and $h = ${t}$.`, `Isi padu sebuah kuboid ialah $V = lwh$. Cari $V$ apabila $l = ${l}$, $w = ${w}$ dan $h = ${t}$.`), l * w * t],
      ];
      const [q, ans] = r.pick(FM);
      return { q, a: T(`${ans}`), sp: 's' };
    },
    /* shopping totals */
    (r) => {
      const [n1, n2] = r.names(2), a = r.int(2, 5), b = r.int(2, 5), c = r.int(2, 5), d = r.int(2, 5), it = r.pick(bank.items), jt = r.pick(bank.items.filter((z) => z !== it));
      const tx = a + c, ty = b + d;
      return { q: T(`The price of one ${it.en1} is RM$x$ and the price of one ${jt.en1} is RM$y$. ${n1} buys ${a} ${it.en} and ${b} ${jt.en}. ${n2} buys ${c} ${it.en} and ${d} ${jt.en}. Write the total amount spent by the two children in its simplest form.`, `Harga sebuah ${it.ms} ialah RM$x$ dan harga sebuah ${jt.ms} ialah RM$y$. ${n1} membeli ${a} ${it.ms} dan ${b} ${jt.ms}. ${n2} membeli ${c} ${it.ms} dan ${d} ${jt.ms}. Tulis jumlah wang yang dibelanjakan oleh kedua-dua kanak-kanak itu dalam bentuk teringkas.`), a: T(`RM$${P([[tx, 'x'], [ty, 'y']])}$`), w: T(`$(${a}x + ${b}y) + (${c}x + ${d}y)$`), sp: 's' };
    },
    /* MCQ simplified form with misconceptions */
    (r) => {
      const [v, w] = V2(r), a = r.int(3, 9), b = r.int(2, 8), c = r.int(2, 8);
      need(a > c && b !== c);
      const ts = [[a, v], [b, w], [-c, v]], right = P(simp(ts));
      const wr = [P([[a + c, v], [b, w]]), `${a - c + b}${v}${w}`, `${a - c + b}${v}`];
      const o = mcq(r, `$${right}$`, wr.map((z) => `$${z}$`));
      return { q: T(`Which is the simplest form of $${P(ts)}$?<br>${o.s}`, `Yang manakah bentuk paling ringkas bagi $${P(ts)}$?<br>${o.s}`), a: T(`${o.L}: $${right}$`), sp: 's' };
    },
    /* product then combine */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 5), b = r.int(2, 5), c = r.nz(-6, 6);
      const p1 = mulM([a, v], [b, w]), tot = p1[0] + c;
      need(tot !== 0 && c !== 0);
      const E = `${a}${v} \\times ${b}${w} ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}${v}${w}`;
      return { q: T(`Simplify $${E}$.`, `Ringkaskan $${E}$.`), a: T(`$${P1([tot, v + w])}$`), w: T(`$${a}${v} \\times ${b}${w} = ${a * b}${v}${w}$, then combine the like terms.`, `$${a}${v} \\times ${b}${w} = ${a * b}${v}${w}$, kemudian gabungkan sebutan serupa.`), sp: 's' };
    },
  ];

  const a52 = [
    /* fractional coefficients */
    (r) => {
      const f = () => Fr.make(r.nz(-5, 5), r.pick([2, 3, 4, 5, 6])), [v, w] = V2(r);
      const A = f(), B = f(), C = f();
      need(A.d > 1 && B.d > 1 && A.d !== B.d);
      const forms = [[[A, v], [B, v]], [[A, v], [B, w], [C, v]], [[A, v], [B, v], [Fr.make(r.nz(-3, 3)), '']]];
      const ts = r.pick(forms);
      need(ts[0][0].n > 0);
      const m = new Map();
      for (const [c, vs] of ts) m.set(vs, m.has(vs) ? Fr.add(m.get(vs), c) : c);
      const out = [...m].map(([vs, c]) => [c, vs]);
      // numeric self-check
      const num = (l) => l.reduce((s, [c, vs]) => s + (c.n / c.d) * evT(vs, VALS), 0);
      if (Math.abs(num(ts) - num(out)) > 1e-9) throw new Error('fraction mismatch');
      need(out.every((t) => t[0].n !== 0));
      return { q: r.pick(SIMPF)(`$${fpoly(ts)}$`), a: T(`$${fpoly(out)}$`), sp: 'm' };
    },
    /* substitution with negatives and powers */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 5), b = r.int(2, 6), x = r.nz(-4, -1), y = r.nz(-4, 4);
      const forms = [[[1, `${v}^3`], [-a, v]], [[a, sq(v)], [-b, v], [1, '']], [[1, sq(v)], [-1, sq(w)]], [[1, `${v}${w}`], [-1, sq(v)]], [[a, `${v}${w}`], [b, sq(w)]], [[-1, `${v}^3`], [a, sq(v)]]];
      const ts = r.pick(forms), val = { [v]: x, [w]: y };
      const res = evP(ts, val);
      const q = r.pick([
        T(`Given $${v} = ${x}$${ts.some((t) => t[1].includes(w)) ? ` and $${w} = ${y}$` : ''}, evaluate $${P(ts)}$.`, `Diberi $${v} = ${x}$${ts.some((t) => t[1].includes(w)) ? ` dan $${w} = ${y}$` : ''}, nilaikan $${P(ts)}$.`),
        T(`Find the value of $${P(ts)}$ when $${v} = ${x}$${ts.some((t) => t[1].includes(w)) ? ` and $${w} = ${y}$` : ''}. Show each substitution in brackets.`, `Cari nilai $${P(ts)}$ apabila $${v} = ${x}$${ts.some((t) => t[1].includes(w)) ? ` dan $${w} = ${y}$` : ''}. Tunjukkan setiap penggantian dalam kurungan.`),
      ]);
      return { q, a: T(`$${res}$`), sp: 'm' };
    },
    /* multi-part: simplify, evaluate, state coefficient */
    (r) => {
      const [v, w] = V2(r), c = [r.nz(-6, 8), r.nz(-6, 8), r.nz(-6, 8), r.nz(-6, 8), r.nz(-6, 8)], x = r.nz(-3, 3), y = r.nz(-3, 3);
      const ts = shuf(r, [[c[0], v], [c[1], w], [c[2], v], [c[3], w], [c[4], '']]), out = simp(ts);
      need(out.length === 3 && ts[0][0] > 0);
      const val = evP(out, { [v]: x, [w]: y });
      return { q: T(`Given the expression $${P(ts)}$: (a) simplify it; (b) state the coefficient of $${w}$ in your answer; (c) find its value when $${v} = ${x}$ and $${w} = ${y}$.`, `Diberi ungkapan $${P(ts)}$: (a) ringkaskannya; (b) nyatakan pekali $${w}$ dalam jawapan anda; (c) cari nilainya apabila $${v} = ${x}$ dan $${w} = ${y}$.`), a: T(`(a) $${P(out)}$ (b) $${out.find((t) => t[1] === w)[0]}$ (c) $${val}$`), sp: 'l' };
    },
    /* monomials, three variables, negatives */
    (r) => {
      const t = rmono(r, LT, -9, 9, true), u = rmono(r, LT, -6, 6, true);
      need(t[1] !== u[1]);
      const dv = r.chance();
      if (dv) {
        const k = mulM(t, u), res = divM(k, u);
        return { q: T(`Simplify $\\dfrac{${P1(k)}}{${P1(u)}}$.`, `Ringkaskan $\\dfrac{${P1(k)}}{${P1(u)}}$.`), a: T(`$${P1(res)}$`), sp: 's' };
      }
      const res = mulM(t, u);
      const w2 = rmono(r, LT, 2, 4, false), res2 = mulM(res, w2);
      return { q: T(`Simplify $${PP(t)} \\times ${PP(u)} \\times ${PP(w2)}$.`, `Ringkaskan $${PP(t)} \\times ${PP(u)} \\times ${PP(w2)}$.`), a: T(`$${P1(res2)}$`), sp: 's' };
    },
    /* unknown coefficient */
    (r) => {
      const [v, w] = V2(r), a = r.int(3, 9), b = r.int(2, 6), c = r.int(1, 2), d = r.int(2, 5), k = r.int(2, 8);
      const ts = [[a, v], [b, w], [-c, v], [k, w]], out = simp(ts);
      return { q: T(`The expression $${P([[a, v], [b, w], [-c, v], [1, `k${w}`]]).replace(`k${w}`, `k${w}`)}$ simplifies to $${P(out)}$, where $k$ is a constant. Find the value of $k$.`, `Ungkapan $${P([[a, v], [b, w], [-c, v], [1, `k${w}`]])}$ dapat diringkaskan kepada $${P(out)}$, dengan $k$ ialah pemalar. Cari nilai $k$.`), a: T(`$k = ${k}$`), w: T(`$${b} + k = ${b + k}$`), sp: 'm' };
    },
    /* compare / order values */
    (r) => {
      const v = r.pick(LT), x = r.nz(-4, -2);
      const F = [[`${v}^2`, (z) => z * z], [`2${v}`, (z) => 2 * z], [`-${v}`, (z) => -z], [`${v}^3`, (z) => z ** 3], [`${v} + 5`, (z) => z + 5]];
      const S3 = r.sample(F, 3);
      const vals = S3.map((f) => f[1](x));
      need(new Set(vals).size === 3);
      const order = S3.map((f, i) => [f, vals[i]]).sort((p, q) => p[1] - q[1]);
      return { q: T(`When $${v} = ${x}$, arrange the values of $${S3.map((f) => f[0]).join('$, $')}$ in ascending order.`, `Apabila $${v} = ${x}$, susun nilai bagi $${S3.map((f) => f[0]).join('$, $')}$ mengikut tertib menaik.`), a: T(order.map((o) => `$${o[0][0]} = ${o[1]}$`).join(' < ')), sp: 'm' };
    },
    /* temperature-style formulae with negative input */
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 9), t = r.nz(-6, -1), s = r.int(2, 5);
      const F = [
        [T(`A number machine takes an input $t$ and gives the output $${a}t - ${b}$. Find the output when the input is ${t}.`, `Sebuah mesin nombor menerima input $t$ dan memberi output $${a}t - ${b}$. Cari output apabila input ialah ${t}.`), a * t - b],
        [T(`The temperature in a freezer is modelled by $T = ${b} - ${a}h$, where $h$ is a number of hours. Find $T$ when $h = ${-t}$.`, `Suhu dalam sebuah peti sejuk beku dimodelkan oleh $T = ${b} - ${a}h$, dengan $h$ ialah bilangan jam. Cari $T$ apabila $h = ${-t}$.`), b - a * -t],
        [T(`A game gives points $P = ${a}x^2 - ${s}x$. Find $P$ when $x = ${t}$.`, `Sebuah permainan memberi mata $P = ${a}x^2 - ${s}x$. Cari $P$ apabila $x = ${t}$.`), a * t * t - s * t],
        [T(`Find the value of $${a}m - ${s}n$ when $m = ${t}$ and $n = ${-t}$.`, `Cari nilai $${a}m - ${s}n$ apabila $m = ${t}$ dan $n = ${-t}$.`), a * t - s * -t],
      ];
      const [q, ans] = r.pick(F);
      return { q, a: T(`${ans}`), sp: 's' };
    },
    /* find the missing coefficient in a product / quotient */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 6), b = r.nz(-6, 6), c = r.int(2, 5);
      need(Math.abs(b) > 1);
      const F = [
        [`\\square ${v} \\times ${PP([b, w])} = ${P1([a * b, v + w])}`, `${a}`],
        [`${P1([a * b, v + w])} \\div \\square ${v} = ${P1([b, w])}`, `${a}`],
        [`${P1([a, v])} \\times \\square ${w} = ${P1([a * c, v + w])}`, `${c}`],
      ];
      const [E, ans] = r.pick(F);
      return { q: T(`Find the value represented by $\\square$: $${E}$.`, `Cari nilai yang diwakili oleh $\\square$: $${E}$.`), a: T(`$${ans}$`), sp: 's' };
    },
    /* product then collect */
    (r) => {
      const [v, w] = V2(r), a = r.int(2, 5), b = r.int(2, 5), c = r.nz(-6, 6), d = r.int(2, 4), e = r.int(2, 4);
      const t1 = mulM([a, v], [b, w]), t2 = mulM([d, w], [e, v]);
      const tot = t1[0] + c + t2[0];
      need(tot !== 0 && c !== 0);
      const E = `${a}${v} \\times ${b}${w} ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}${v}${w} + ${d}${w} \\times ${e}${v}`;
      return { q: T(`Simplify $${E}$.`, `Ringkaskan $${E}$.`), a: T(`$${P1([tot, v + w])}$`), sp: 'm' };
    },
  ];
  SPM.extend('F1-5.2', { e: e52, m: m52, a: a52 });
  /* ================================================================ F1-7.1 / 7.2 shared */
  const SY = { '>': '>', '<': '<', '>=': '\\ge', '<=': '\\le' };
  const FL = { '>': '<', '<': '>', '>=': '<=', '<=': '>=' };
  const SYS = ['>', '<', '>=', '<='];
  const holds = (x, s, k) => (s === '>' ? x > k : s === '<' ? x < k : s === '>=' ? x >= k : x <= k);
  const incl = (s) => s.length === 2;
  const lv = (r) => r.pick(['x', 'y', 'a', 'b', 'm', 'n', 'p', 't', 'k', 'w']);
  /** number line rows: each row = array of sets {a,b,ia,ib} (a/b null = unbounded); hollow = excluded */
  const nline = (lo, hi, rows, W) => {
    W = W || 380;
    const pad = 28, rh = 44, H = 22 + rows.length * rh;
    const sx = (v) => pad + ((v - lo) / (hi - lo)) * (W - 2 * pad);
    let o = '';
    rows.forEach((row, i) => {
      const y = 22 + i * rh;
      o += S.arrow(pad - 14, y, W - pad + 14, y) + S.arrow(W - pad + 14, y, pad - 14, y).replace(/^/, '');
      for (let v = lo; v <= hi; v++) o += S.line(sx(v), y - 4, sx(v), y + 4, { w: 1 }) + S.text(sx(v), y + 15, String(v), { s: 11 });
      for (const st of row) {
        const x1 = st.a === null ? pad - 12 : sx(st.a), x2 = st.b === null ? W - pad + 12 : sx(st.b);
        o += S.line(x1, y, x2, y, { w: 3.4 });
        if (st.a === null) o += S.poly([[x1 + 1, y - 5], [x1 - 6, y], [x1 + 1, y + 5]], { open: true, w: 2.4 });
        if (st.b === null) o += S.poly([[x2 - 1, y - 5], [x2 + 6, y], [x2 - 1, y + 5]], { open: true, w: 2.4 });
        if (st.a !== null) o += S.circle(x1, y, 4.2, { fill: st.ia ? 'currentColor' : 'var(--bg,#fff)' });
        if (st.b !== null) o += S.circle(x2, y, 4.2, { fill: st.ib ? 'currentColor' : 'var(--bg,#fff)' });
      }
    });
    return S.wrap(W, H, o, 'number line');
  };
  /** set for "x s k" */
  const rayOf = (s, k) => (s[0] === '>' ? { a: k, b: null, ia: incl(s), ib: false } : { a: null, b: k, ia: false, ib: incl(s) });
  const cmpSym = (a, b) => (a > b ? '>' : a < b ? '<' : '=');
  const intsIn = (lo, hi, il, ih) => rng(Math.ceil(lo), Math.floor(hi)).filter((x) => (il ? x >= lo : x > lo) && (ih ? x <= hi : x < hi));
  const chain = (lo, il, hi, ih, v) => `${lo} ${il ? '\\le' : '<'} ${v || 'x'} ${ih ? '\\le' : '<'} ${hi}`;
  const lst = (l) => (l.length ? l.join(',\\ ') : '\\text{none}');

  /* ================================================================ F1-7.1 */
  const PH7 = [
    ['{V} is greater than {k}', '{V} lebih besar daripada {k}', '>'], ['{V} is less than {k}', '{V} kurang daripada {k}', '<'],
    ['{V} is at least {k}', '{V} sekurang-kurangnya {k}', '>='], ['{V} is at most {k}', '{V} selebih-lebihnya {k}', '<='],
    ['{V} is not less than {k}', '{V} tidak kurang daripada {k}', '>='], ['{V} is not more than {k}', '{V} tidak lebih daripada {k}', '<='],
    ['{V} exceeds {k}', '{V} melebihi {k}', '>'], ['{V} is greater than or equal to {k}', '{V} lebih besar daripada atau sama dengan {k}', '>='],
    ['{V} is less than or equal to {k}', '{V} kurang daripada atau sama dengan {k}', '<='], ['{V} must be more than {k}', '{V} mesti lebih daripada {k}', '>'],
    ['{V} cannot exceed {k}', '{V} tidak boleh melebihi {k}', '<='], ['{V} is smaller than {k}', '{V} lebih kecil daripada {k}', '<'],
    ['the minimum value of {V} is {k}', 'nilai minimum bagi {V} ialah {k}', '>='], ['the maximum value of {V} is {k}', 'nilai maksimum bagi {V} ialah {k}', '<='],
    ['{k} is less than {V}', '{k} kurang daripada {V}', '>'], ['{k} is greater than {V}', '{k} lebih besar daripada {V}', '<'],
  ];
  const SIT = [
    ['The minimum age to join a club is {k} years', 'Umur minimum untuk menyertai sebuah kelab ialah {k} tahun', 'a', '>=', [12, 13, 15, 16, 18]],
    ['A lift can carry at most {k} persons', 'Sebuah lif boleh membawa selebih-lebihnya {k} orang', 'p', '<=', [6, 8, 10, 12]],
    ['The pass mark of a test is at least {k}', 'Markah lulus bagi suatu ujian ialah sekurang-kurangnya {k}', 'm', '>=', [40, 45, 50]],
    ['A bag must weigh no more than {k} kg', 'Sebuah beg tidak boleh berjisim melebihi {k} kg', 'w', '<=', [5, 7, 10, 20]],
    ['A car park charges more than RM{k} per hour', 'Sebuah tempat letak kereta mengenakan bayaran lebih daripada RM{k} sejam', 'c', '>', [2, 3, 4]],
    ['The temperature in a cold room is below {k} °C', 'Suhu dalam sebuah bilik sejuk kurang daripada {k} °C', 't', '<', [4, 5, 8, 10]],
    ['A vehicle must not exceed the speed limit of {k} km/h', 'Sebuah kenderaan tidak boleh melebihi had laju {k} km/j', 'v', '<=', [60, 80, 90, 110]],
    ['A child must be at least {k} cm tall to ride the roller coaster', 'Seorang kanak-kanak mesti sekurang-kurangnya {k} cm tinggi untuk menaiki roller coaster', 'h', '>=', [110, 120, 130, 140]],
    ['The number of students in a class is fewer than {k}', 'Bilangan murid dalam sebuah kelas kurang daripada {k}', 'n', '<', [35, 40, 45]],
    ['A hall holds a maximum of {k} people', 'Sebuah dewan memuatkan maksimum {k} orang', 'p', '<=', [200, 300, 500]],
    ['At least {k} players are needed to form a team', 'Sekurang-kurangnya {k} orang pemain diperlukan untuk membentuk sebuah pasukan', 'n', '>=', [5, 7, 11]],
    ["Aina's savings exceed RM{k}", 'Simpanan Aina melebihi RM{k}', 's', '>', [100, 250, 500]],
    ['A parcel must have a mass of less than {k} kg', 'Sebuah bungkusan mesti berjisim kurang daripada {k} kg', 'm', '<', [2, 5, 10]],
    ['A water tank can hold at most {k} litres', 'Sebuah tangki air boleh memuatkan selebih-lebihnya {k} liter', 'v', '<=', [500, 1000, 2000]],
    ['A driver must be over {k} years old to hold a licence', 'Seorang pemandu mesti berumur lebih daripada {k} tahun untuk memegang lesen', 'a', '>', [16, 17, 20]],
    ['The cost of a meal is not more than RM{k}', 'Kos sebiji hidangan tidak melebihi RM{k}', 'c', '<=', [8, 10, 12]],
  ];
  const sit = (r) => {
    const e = r.pick(SIT), k = r.pick(e[4]);
    return { T: T(e[0].replace('{k}', k), e[1].replace('{k}', k)), L: e[2], s: e[3], k };
  };
  const OPS7 = [
    { s: 'adding {c} to both sides', m: 'menambah {c} pada kedua-dua belah', f: (x, c) => x + c, sg: '+' },
    { s: 'subtracting {c} from both sides', m: 'menolak {c} daripada kedua-dua belah', f: (x, c) => x - c, sg: '-' },
    { s: 'multiplying both sides by {c}', m: 'mendarab kedua-dua belah dengan {c}', f: (x, c) => x * c, sg: '\\times' },
    { s: 'dividing both sides by {c}', m: 'membahagi kedua-dua belah dengan {c}', f: (x, c) => x / c, sg: '\\div' },
  ];
  const pairGT = (r, lo, hi) => {
    const a = r.int(lo, hi), b = r.int(lo, hi);
    need(a !== b);
    return a > b ? [a, b] : [b, a];
  };
  const PT = (x) => (x < 0 ? `(${x})` : `${x}`);
  const OPN = ['+', '-', '\\times', '\\div'];

  const e71 = [
    /* words -> inequality */
    (r) => {
      const v = lv(r), k = r.int(-5, 30), e = r.pick(PH7), m = { V: `$${v}$`, k: k < 0 ? `$${k}$` : k };
      const p = T(sub(e[0], m), sub(e[1], m));
      const q = r.pick([T(`Write an inequality for "${p.en}".`, `Tulis satu ketaksamaan bagi "${p.ms}".`), T(`Express "${p.en}" using an inequality symbol.`, `Ungkapkan "${p.ms}" menggunakan simbol ketaksamaan.`), T(`Use $>$, $<$, $\\ge$ or $\\le$ to write "${p.en}".`, `Gunakan $>$, $<$, $\\ge$ atau $\\le$ untuk menulis "${p.ms}".`)]);
      const ans = e[0].startsWith('{k}') ? `${v} ${SY[e[2]]} ${k}` : `${v} ${SY[e[2]]} ${k}`;
      return { q, a: T(`$${ans}$`), sp: 'xs' };
    },
    /* inequality -> words (MCQ) */
    (r) => {
      const v = lv(r), k = r.int(1, 20), s = r.pick(SYS);
      const ws = { '>': T('is greater than', 'lebih besar daripada'), '<': T('is less than', 'kurang daripada'), '>=': T('is at least', 'sekurang-kurangnya'), '<=': T('is at most', 'selebih-lebihnya') };
      const L = (l) => SYS.map((z, i) => `(${AB[i]}) $${v}$ ${ws[z][l]} ${k}`).join(' &emsp; ');
      return { q: T(`Which statement means $${v} ${SY[s]} ${k}$?<br>${L('en')}`, `Pernyataan yang manakah bermaksud $${v} ${SY[s]} ${k}$?<br>${L('ms')}`), a: T(`${AB[SYS.indexOf(s)]}: $${v}$ ${ws[s].en} ${k}`, `${AB[SYS.indexOf(s)]}: $${v}$ ${ws[s].ms} ${k}`), sp: 'xs' };
    },
    /* number line -> inequality */
    (r) => {
      const k = r.int(-4, 5), s = r.pick(SYS), v = 'x';
      const q = r.pick([T('Write the inequality shown on the number line.', 'Tulis ketaksamaan yang ditunjukkan pada garis nombor itu.'), T('The number line shows the values of $x$ that are allowed. State the inequality.', 'Garis nombor menunjukkan nilai $x$ yang dibenarkan. Nyatakan ketaksamaan itu.'), T('State the inequality represented by the shaded part of the number line.', 'Nyatakan ketaksamaan yang diwakili oleh bahagian berlorek pada garis nombor itu.')]);
      return { q, fig: nline(k - 5, k + 5, [[rayOf(s, k)]]), a: T(`$x ${SY[s]} ${k}$`), w: T(incl(s) ? 'A filled circle means the value is included.' : 'An open circle means the value is not included.', incl(s) ? 'Bulatan penuh bermaksud nilai itu termasuk.' : 'Bulatan kosong bermaksud nilai itu tidak termasuk.'), sp: 'xs' };
    },
    /* fill in < or > */
    (r) => {
      const F = [
        () => { const a = r.int(-9, 9), b = r.int(-9, 9); need(a !== b); return [PT(a), PT(b), cmpSym(a, b)]; },
        () => { const a = r.int(-40, 40) / 10, b = r.int(-40, 40) / 10; need(a !== b); return [PT(a), PT(b), cmpSym(a, b)]; },
        () => { const b = r.int(3, 9), a = r.int(1, b - 1), d = r.int(3, 9), c = r.int(1, d - 1); need(a / b !== c / d && gcd(a, b) === 1 && gcd(c, d) === 1); return [`\\dfrac{${a}}{${b}}`, `\\dfrac{${c}}{${d}}`, cmpSym(a / b, c / d)]; },
        () => { const a = r.int(2, 12), b = r.int(2, 12); need(a * a !== b * b && a !== b); return [`${a}^2`, `${b}^2`, cmpSym(a * a, b * b)]; },
        () => { const a = r.int(-9, -1), b = r.int(1, 9); return [PT(a), PT(b), cmpSym(a, b)]; },
      ];
      const [A, B, c] = r.pick(F)();
      const q = r.pick([T(`Fill in the blank with $>$ or $<$: $${A}\\ \\square\\ ${B}$.`, `Isi tempat kosong dengan $>$ atau $<$: $${A}\\ \\square\\ ${B}$.`), T(`Which symbol makes the statement true, $>$ or $<$? $${A}\\ \\square\\ ${B}$`, `Simbol yang manakah menjadikan pernyataan itu benar, $>$ atau $<$? $${A}\\ \\square\\ ${B}$`), T(`Compare $${A}$ and $${B}$ using $>$ or $<$.`, `Bandingkan $${A}$ dan $${B}$ menggunakan $>$ atau $<$.`)]);
      return { q, a: T(`$${A} ${c} ${B}$`), sp: 'xs' };
    },
    /* true or false */
    (r) => {
      const a = r.int(-9, 9), b = r.int(-9, 9), s = r.pick(SYS);
      const ok = holds(a, s, b);
      return { q: T(`True or false: $${PT(a)} ${SY[s]} ${PT(b)}$.`, `Benar atau palsu: $${PT(a)} ${SY[s]} ${PT(b)}$.`), a: T(`${ok ? 'True' : 'False'}: ${a} ${a > b ? 'is greater than' : a < b ? 'is less than' : 'is equal to'} ${b}.`, `${ok ? 'Benar' : 'Palsu'}: ${a} ${a > b ? 'lebih besar daripada' : a < b ? 'kurang daripada' : 'sama dengan'} ${b}.`), sp: 'xs' };
    },
    /* converse */
    (r) => {
      const [a, b] = pairGT(r, -9, 12), v = r.chance();
      const A = v ? PT(a) : 'p', B = v ? PT(b) : 'q';
      return { q: T(`Write the converse of the inequality $${A} > ${B}$${v ? '' : ' (that is, for $p > q$)'}.`, `Tulis songsang bagi ketaksamaan $${A} > ${B}$${v ? '' : ' (iaitu, bagi $p > q$)'}.`), a: T(`$${B} < ${A}$`), sp: 'xs' };
    },
    /* is a value a solution? */
    (r) => {
      const v = lv(r), k = r.int(-4, 12), s = r.pick(SYS), x = k + r.int(-2, 2), ok = holds(x, s, k);
      return { q: T(`Is $${v} = ${x}$ one of the values that satisfy $${v} ${SY[s]} ${k}$? Answer yes or no.`, `Adakah $${v} = ${x}$ salah satu nilai yang memuaskan $${v} ${SY[s]} ${k}$? Jawab ya atau tidak.`), a: T(`${ok ? 'Yes' : 'No'}: $${x} ${ok ? SY[s] : SY[FL[s]]} ${k}$`, `${ok ? 'Ya' : 'Tidak'}: $${x} ${ok ? SY[s] : SY[FL[s]]} ${k}$`), sp: 'xs' };
    },
    /* situations */
    (r) => {
      const c = sit(r);
      const q = r.pick([T(`Write an inequality using $${c.L}$ for the situation: "${c.T.en}".`, `Tulis satu ketaksamaan menggunakan $${c.L}$ bagi situasi: "${c.T.ms}".`), T(`"${c.T.en}." Let the quantity be $${c.L}$. Write this as an inequality.`, `"${c.T.ms}." Katakan kuantiti itu ialah $${c.L}$. Tulis ini sebagai ketaksamaan.`)]);
      return { q, a: T(`$${c.L} ${SY[c.s]} ${c.k}$`), sp: 'xs' };
    },
    /* which of the numbers satisfy */
    (r) => {
      const v = lv(r), k = r.int(-3, 8), s = r.pick(SYS), nums = r.sample(rng(k - 3, k + 3), 4).sort((p, q) => p - q);
      const ok = nums.filter((x) => holds(x, s, k));
      need(ok.length >= 1 && ok.length <= 3);
      return { q: T(`Which of the numbers $${nums.join(',\\ ')}$ satisfy $${v} ${SY[s]} ${k}$?`, `Yang manakah antara nombor $${nums.join(',\\ ')}$ memuaskan $${v} ${SY[s]} ${k}$?`), a: T(`$${ok.join(',\\ ')}$`), sp: 's' };
    },
    /* symbol meaning */
    (r) => {
      const s = r.pick(SYS), ws = { '>': T('greater than', 'lebih besar daripada'), '<': T('less than', 'kurang daripada'), '>=': T('greater than or equal to', 'lebih besar daripada atau sama dengan'), '<=': T('less than or equal to', 'kurang daripada atau sama dengan') };
      const forms = [
        [T(`Write the meaning of the symbol $${SY[s]}$ in words.`, `Tulis maksud simbol $${SY[s]}$ dalam perkataan.`), ws[s]],
        [T(`Which symbol means "${ws[s].en}"?`, `Simbol yang manakah bermaksud "${ws[s].ms}"?`), T(`$${SY[s]}$`)],
        [T(`Does the symbol $${SY[s]}$ include the case where the two sides are equal? Answer yes or no.`, `Adakah simbol $${SY[s]}$ termasuk kes apabila kedua-dua belah sama? Jawab ya atau tidak.`), yn(incl(s))],
      ];
      const [q, a] = r.pick(forms);
      return { q, a, sp: 'xs' };
    },
    /* chain order */
    (r) => {
      const v = r.sample(rng(-9, 12), 3);
      const s = v.slice().sort((p, q) => p - q);
      return { q: T(`Write the numbers $${v.map(PT).join(',\\ ')}$ in one chain using the symbol $<$.`, `Tulis nombor $${v.map(PT).join(',\\ ')}$ dalam satu rantai menggunakan simbol $<$.`), a: T(`$${s.map(PT).join(' < ')}$`), sp: 'xs' };
    },
    /* converse in words */
    (r) => {
      const [A, B] = r.pair(), AT = [['taller than', 'shorter than', 'lebih tinggi daripada', 'lebih rendah daripada'], ['older than', 'younger than', 'lebih tua daripada', 'lebih muda daripada'], ['heavier than', 'lighter than', 'lebih berat daripada', 'lebih ringan daripada'], ['faster than', 'slower than', 'lebih laju daripada', 'lebih perlahan daripada']];
      const t = r.pick(AT);
      return { q: T(`${A} is ${t[0]} ${B}. Write the converse statement using "${t[1]}".`, `${A} ${t[2]} ${B}. Tulis pernyataan songsangnya menggunakan "${t[3]}".`), a: T(`${B} is ${t[1]} ${A}.`, `${B} ${t[3]} ${A}.`), sp: 'xs' };
    },
    /* which statement is true (MCQ) */
    (r) => {
      const a = r.int(-9, 9), b = r.int(-9, 9);
      need(a !== b);
      const right = `$${PT(a)} ${cmpSym(a, b)} ${PT(b)}$`, wrong = `$${PT(a)} ${cmpSym(b, a)} ${PT(b)}$`;
      const o = mcq(r, right, [wrong, `$${PT(a)} = ${PT(b)}$`, `$${PT(b)} ${cmpSym(b, a)} ${PT(b)}$`.replace(`${PT(b)} ${cmpSym(b, a)} ${PT(b)}`, `${PT(a)} ${cmpSym(b, a) === '>' ? '\\ge' : '\\le'} ${PT(b)}`)]);
      return { q: T(`Which of the following statements is true?<br>${o.s}`, `Pernyataan yang manakah benar?<br>${o.s}`), a: T(`${o.L}: ${right}`), sp: 'xs' };
    },
  ];

  const m71 = [
    /* range situations */
    (r) => {
      const R = [
        ['The mass of a boxer in the lightweight class is at least {a} kg but less than {b} kg', 'Jisim seorang peninju dalam kelas ringan ialah sekurang-kurangnya {a} kg tetapi kurang daripada {b} kg', 'm', [55, 60], [65, 70], 1, 0],
        ['A ride is for children whose height is more than {a} cm and at most {b} cm', 'Tunggangan itu untuk kanak-kanak yang tingginya lebih daripada {a} cm dan selebih-lebihnya {b} cm', 'h', [100, 110], [140, 150], 0, 1],
        ['The temperature of a fridge is kept between {a} °C and {b} °C, including both values', 'Suhu sebuah peti sejuk dikekalkan antara {a} °C dan {b} °C, termasuk kedua-dua nilai', 't', [2, 3], [6, 8], 1, 1],
        ['The number of pages of a project is greater than {a} but fewer than {b}', 'Bilangan halaman suatu projek lebih daripada {a} tetapi kurang daripada {b}', 'n', [10, 15], [20, 30], 0, 0],
      ];
      const e = r.pick(R), a = r.pick(e[3]), b = r.pick(e[4]), il = !!e[5], ih = !!e[6];
      const p = T(e[0].replace('{a}', a).replace('{b}', b), e[1].replace('{a}', a).replace('{b}', b));
      return { q: T(`${p.en}. Let the quantity be $${e[2]}$. Write a single inequality (a chain) for this situation.`, `${p.ms}. Katakan kuantiti itu ialah $${e[2]}$. Tulis satu ketaksamaan (rantai) bagi situasi ini.`), a: T(`$${chain(a, il, b, ih, e[2])}$`), sp: 's' };
    },
    /* list integers in a range */
    (r) => {
      const lo = r.int(-7, 3), hi = lo + r.int(3, 8), il = r.chance(), ih = r.chance(), v = lv(r);
      const l = intsIn(lo, hi, il, ih);
      const q = r.pick([
        T(`List all the integers $${v}$ such that $${chain(lo, il, hi, ih, v)}$.`, `Senaraikan semua integer $${v}$ dengan keadaan $${chain(lo, il, hi, ih, v)}$.`),
        T(`$${v}$ is an integer and $${chain(lo, il, hi, ih, v)}$. Write down all the possible values of $${v}$.`, `$${v}$ ialah integer dan $${chain(lo, il, hi, ih, v)}$. Tulis semua nilai $${v}$ yang mungkin.`),
        T(`How many integers satisfy $${chain(lo, il, hi, ih, v)}$? List them.`, `Berapakah bilangan integer yang memuaskan $${chain(lo, il, hi, ih, v)}$? Senaraikan integer itu.`),
      ]);
      return { q, a: T(`$${lst(l)}$ (${l.length})`), sp: 's' };
    },
    /* effect of an operation on an inequality (numerical) */
    (r) => {
      const [a, b] = pairGT(r, -9, 12), i = r.int(0, 3), c = r.int(2, 6) * (i > 1 && r.chance() ? -1 : 1);
      const op = OPS7[i];
      need(i !== 3 || (a % c === 0 && b % c === 0));
      const na = op.f(a, c), nb = op.f(b, c), s = cmpSym(na, nb);
      const p = T(`Given $${PT(a)} > ${PT(b)}$, find the effect of ${op.s.replace('{c}', PT(c))}. Write the new inequality.`, `Diberi $${PT(a)} > ${PT(b)}$, cari kesan ${op.m.replace('{c}', PT(c))}. Tulis ketaksamaan yang baharu.`);
      return { q: p, a: T(`$${PT(a)} ${OPN[i]} ${PT(c)} ${s} ${PT(b)} ${OPN[i]} ${PT(c)}$, i.e. $${PT(na)} ${s} ${PT(nb)}$`), w: c < 0 && i > 1 ? T('Multiplying or dividing by a negative number reverses the inequality sign.', 'Mendarab atau membahagi dengan nombor negatif menyongsangkan tanda ketaksamaan.') : undefined, sp: 's' };
    },
    /* additive inverse */
    (r) => {
      const [a, b] = pairGT(r, -8, 12), v = r.chance();
      return { q: T(`Given $${PT(a)} > ${PT(b)}$, write the inequality relating $${PT(-a)}$ and $${PT(-b)}$. What happens to the sign?`, `Diberi $${PT(a)} > ${PT(b)}$, tulis ketaksamaan yang menghubungkan $${PT(-a)}$ dan $${PT(-b)}$. Apakah yang berlaku kepada tanda itu?`), a: T(`$${PT(-a)} < ${PT(-b)}$; the sign is reversed.`, `$${PT(-a)} < ${PT(-b)}$; tanda disongsangkan.`), sp: 's' };
    },
    /* transitive in context */
    (r) => {
      const [A, B, C] = r.names(3);
      const AT = [
        [T('taller than', 'lebih tinggi daripada'), T('the tallest', 'yang paling tinggi'), T('the shortest', 'yang paling rendah')],
        [T('heavier than', 'lebih berat daripada'), T('the heaviest', 'yang paling berat'), T('the lightest', 'yang paling ringan')],
        [T('older than', 'lebih tua daripada'), T('the oldest', 'yang paling tua'), T('the youngest', 'yang paling muda')],
        [T('faster than', 'lebih laju daripada'), T('the fastest', 'yang paling laju'), T('the slowest', 'yang paling perlahan')],
        [T('scored higher than', 'mendapat markah lebih tinggi daripada'), T('scored the highest', 'mendapat markah tertinggi'), T('scored the lowest', 'mendapat markah terendah')],
      ];
      const at = r.pick(AT), top = r.chance();
      return { q: T(`${A} is ${at[0].en} ${B}, and ${B} is ${at[0].en} ${C}. Who is ${(top ? at[1] : at[2]).en}? Use the transitive property to explain.`, `${A} ${at[0].ms} ${B}, dan ${B} ${at[0].ms} ${C}. Siapakah ${(top ? at[1] : at[2]).ms}? Gunakan sifat transitif untuk menerangkan.`), a: T(`${top ? A : C}. Since ${A} > ${B} and ${B} > ${C}, then ${A} > ${C}.`, `${top ? A : C}. Oleh sebab ${A} > ${B} dan ${B} > ${C}, maka ${A} > ${C}.`), sp: 's' };
    },
    /* transitive with numbers / letters */
    (r) => {
      const [a, b, c] = r.sample(rng(-10, 20), 3).sort((p, q) => q - p);
      const forms = [
        [T(`Given $x > ${b}$ and $${b} > ${c}$, write the relationship between $x$ and ${c}.`, `Diberi $x > ${b}$ dan $${b} > ${c}$, tulis hubungan antara $x$ dan ${c}.`), `$x > ${c}$`],
        [T(`Given $${a} > y$ and $y > ${c}$, write one inequality that includes $${a}$, $y$ and $${c}$.`, `Diberi $${a} > y$ dan $y > ${c}$, tulis satu ketaksamaan yang melibatkan $${a}$, $y$ dan $${c}$.`), `$${a} > y > ${c}$`],
        [T(`If $p > q$ and $q > r$, what can you conclude about $p$ and $r$? Check with $p = ${a}$, $q = ${b}$ and $r = ${c}$.`, `Jika $p > q$ dan $q > r$, apakah kesimpulan tentang $p$ dan $r$? Semak dengan $p = ${a}$, $q = ${b}$ dan $r = ${c}$.`), T(`$p > r$. Check: $${a} > ${b} > ${c}$, so $${a} > ${c}$.`, `$p > r$. Semak: $${a} > ${b} > ${c}$, maka $${a} > ${c}$.`)],
      ];
      const [q, ans] = r.pick(forms);
      need(a > b && b > c);
      return { q, a: typeof ans === 'string' ? T(ans) : ans, sp: 's' };
    },
    /* multiplicative inverse (positive) */
    (r) => {
      const [a, b] = pairGT(r, 1, 12);
      const v = r.chance();
      return { q: T(`Given $${a} > ${b}$ (both positive), compare $\\dfrac{1}{${a}}$ and $\\dfrac{1}{${b}}$. Write the inequality.`, `Diberi $${a} > ${b}$ (kedua-duanya positif), bandingkan $\\dfrac{1}{${a}}$ dan $\\dfrac{1}{${b}}$. Tulis ketaksamaan itu.`), a: T(`$\\dfrac{1}{${a}} < \\dfrac{1}{${b}}$; the sign is reversed for positive numbers.`, `$\\dfrac{1}{${a}} < \\dfrac{1}{${b}}$; tanda disongsangkan bagi nombor positif.`), sp: 's' };
    },
    /* substitute to test */
    (r) => {
      const a = r.int(2, 5), b = r.int(1, 9), c = r.int(10, 30), x = r.int(1, 8), s = r.pick(SYS);
      const lhs = a * x + b, ok = holds(lhs, s, c);
      return { q: T(`Does $x = ${x}$ satisfy $${lin(a, b)} ${SY[s]} ${c}$? Show your working.`, `Adakah $x = ${x}$ memuaskan $${lin(a, b)} ${SY[s]} ${c}$? Tunjukkan langkah kerja anda.`), a: T(`$${a}(${x}) + ${b} = ${lhs}$; $${lhs} ${ok ? SY[s] : SY[FL[s]]} ${c}$, so ${ok ? 'yes' : 'no'}.`, `$${a}(${x}) + ${b} = ${lhs}$; $${lhs} ${ok ? SY[s] : SY[FL[s]]} ${c}$, maka ${ok ? 'ya' : 'tidak'}.`), sp: 's' };
    },
    /* claims about operations: test with numbers */
    (r) => {
      const [a, b] = pairGT(r, 1, 9), c = r.int(2, 5), nm = r.name();
      const F = [
        [T(`multiplying both sides by ${c} keeps the sign the same`, `mendarab kedua-dua belah dengan ${c} mengekalkan tanda yang sama`), `$${a} > ${b}$: $${a * c} > ${b * c}$`, 1],
        [T(`multiplying both sides by $-${c}$ keeps the sign the same`, `mendarab kedua-dua belah dengan $-${c}$ mengekalkan tanda yang sama`), `$${a} > ${b}$ but $${-a * c} < ${-b * c}$`, 0],
        [T(`adding $-${c}$ to both sides reverses the sign`, `menambah $-${c}$ pada kedua-dua belah menyongsangkan tanda`), `$${a} > ${b}$ and $${a - c} > ${b - c}$`, 0],
        [T(`subtracting ${c} from both sides keeps the sign the same`, `menolak ${c} daripada kedua-dua belah mengekalkan tanda yang sama`), `$${a} > ${b}$ and $${a - c} > ${b - c}$`, 1],
      ];
      const [cl, ev, ok] = r.pick(F);
      return { q: T(`${nm} says that, for $${a} > ${b}$, ${cl.en}. Test the claim with these numbers. Is ${nm} correct?`, `${nm} berkata bahawa, bagi $${a} > ${b}$, ${cl.ms}. Uji dakwaan itu dengan nombor ini. Adakah ${nm} betul?`), a: T(`${ok ? 'Correct' : 'Not correct'}: ${ev}`, `${ok ? 'Betul' : 'Tidak betul'}: ${ev}`), sp: 's' };
    },
    /* budget / limit */
    (r) => {
      const price = r.pick([3, 4, 5, 6, 8]), M0 = r.int(4, 9) * 10, nm = r.name(), it = r.pick(bank.items);
      need(M0 % price !== 0);
      return { q: T(`${nm} has RM${M0} and wants to buy $n$ ${it.en} at RM${price} each. Write an inequality for $n$.`, `${nm} mempunyai RM${M0} dan ingin membeli $n$ ${it.ms} dengan harga RM${price} setiap satu. Tulis satu ketaksamaan bagi $n$.`), a: T(`$${price}n \\le ${M0}$`), sp: 's' };
    },
    /* does the value fit both conditions */
    (r) => {
      const lo = r.int(1, 5) * 10, hi = lo + r.int(2, 5) * 10, x = r.pick([lo - 5, lo, lo + 5, hi, hi + 5]), il = r.chance(), ih = r.chance();
      const ok = (il ? x >= lo : x > lo) && (ih ? x <= hi : x < hi);
      const nm = r.name();
      return { q: T(`A discount applies to bills of RM$b$ where $${chain(lo, il, hi, ih, 'b')}$. ${nm}'s bill is RM${x}. Does the discount apply? Explain.`, `Diskaun dikenakan bagi bil RM$b$ dengan $${chain(lo, il, hi, ih, 'b')}$. Bil ${nm} ialah RM${x}. Adakah diskaun dikenakan? Terangkan.`), a: T(`${ok ? 'Yes' : 'No'}: ${x} ${ok ? 'satisfies both' : 'does not satisfy'} the inequality.`, `${ok ? 'Ya' : 'Tidak'}: ${x} ${ok ? 'memuaskan kedua-dua' : 'tidak memuaskan'} ketaksamaan itu.`), sp: 's' };
    },
    /* compound inequality: apply operation */
    (r) => {
      const lo = r.int(-5, 2), hi = lo + r.int(3, 7), il = r.chance(), ih = r.chance(), i = r.int(0, 2), c = r.int(2, 4);
      let f, txt, sgn;
      if (i === 0) { f = (z) => z + c; txt = [T(`Add ${c} to every part.`, `Tambah ${c} pada setiap bahagian.`), `x + ${c}`]; }
      else if (i === 1) { f = (z) => z * c; txt = [T(`Multiply every part by ${c}.`, `Darab setiap bahagian dengan ${c}.`), `${c}x`]; }
      else { f = (z) => -z; txt = [T('Multiply every part by $-1$.', 'Darab setiap bahagian dengan $-1$.'), '-x']; }
      const nlo = f(lo), nhi = f(hi), rev = i === 2;
      const A = rev ? nhi : nlo, B = rev ? nlo : nhi, iA = rev ? ih : il, iB = rev ? il : ih;
      return { q: T(`Given $${chain(lo, il, hi, ih)}$. ${txt[0].en} Write the new inequality for $${txt[1]}$.`, `Diberi $${chain(lo, il, hi, ih)}$. ${txt[0].ms} Tulis ketaksamaan baharu bagi $${txt[1]}$.`), a: T(`$${chain(A, iA, B, iB, txt[1])}$`), sp: 's' };
    },

    /* draw on a number line (answer is a figure) */
    (r) => {
      const k = r.int(-3, 5), s = r.pick(SYS), v = lv(r), f = nline(k - 5, k + 5, [[rayOf(s, k)]]);
      return { q: T(`Represent $${v} ${SY[s]} ${k}$ on a number line.`, `Wakilkan $${v} ${SY[s]} ${k}$ pada garis nombor.`), a: T(`${incl(s) ? 'Filled' : 'Open'} circle at ${k}, shaded to the ${s[0] === '>' ? 'right' : 'left'}.${f}`, `Bulatan ${incl(s) ? 'penuh' : 'kosong'} pada ${k}, dilorek ke arah ${s[0] === '>' ? 'kanan' : 'kiri'}.${f}`), sp: 'm' };
    },
    /* MCQ on a number line */
    (r) => {
      const k = r.int(-3, 5), s = r.pick(SYS), o = mcq(r, `$x ${SY[s]} ${k}$`, SYS.filter((z) => z !== s).map((z) => `$x ${SY[z]} ${k}$`));
      return { q: T(`Which inequality is represented by the number line?<br>${o.s}`, `Ketaksamaan yang manakah diwakili oleh garis nombor itu?<br>${o.s}`), fig: nline(k - 5, k + 5, [[rayOf(s, k)]]), a: T(`${o.L}: $x ${SY[s]} ${k}$`), sp: 's' };
    },
    /* error spotting */
    (r) => {
      const [a, b] = pairGT(r, -9, -2), c = r.int(2, 5), nm = r.name();
      const good = cmpSym(-a * c, -b * c);
      return { q: T(`${nm} wrote: "$${a} > ${b}$, so if I multiply both sides by $-${c}$ I get $${-a * c} > ${-b * c}$." Is ${nm} correct? Explain.`, `${nm} menulis: "$${a} > ${b}$, maka jika saya mendarab kedua-dua belah dengan $-${c}$ saya dapat $${-a * c} > ${-b * c}$." Adakah ${nm} betul? Terangkan.`), a: T(`No. Multiplying by a negative number reverses the sign, so $${a} > ${b}$ gives $${-a * c} ${good} ${-b * c}$.`, `Tidak. Mendarab dengan nombor negatif menyongsangkan tanda, maka $${a} > ${b}$ memberi $${-a * c} ${good} ${-b * c}$.`), sp: 's' };
    },
    /* "between" statements */
    (r) => {
      const lo = r.int(-5, 4), hi = lo + r.int(3, 8), v = lv(r), inc = r.chance();
      const p = inc ? T(`$${v}$ is between ${lo} and ${hi}, and can be equal to ${lo} or ${hi}`, `$${v}$ terletak antara ${lo} dengan ${hi}, dan boleh sama dengan ${lo} atau ${hi}`) : T(`$${v}$ is between ${lo} and ${hi}, but is not equal to ${lo} or ${hi}`, `$${v}$ terletak antara ${lo} dengan ${hi}, tetapi tidak sama dengan ${lo} atau ${hi}`);
      return { q: T(`Write "${p.en}" as an inequality.`, `Tulis "${p.ms}" sebagai ketaksamaan.`), a: T(`$${chain(lo, inc, hi, inc, v)}$`), sp: 's' };
    },
    /* complete relations */
    (r) => {
      const [a, b] = pairGT(r, -6, 9), c = r.int(2, 5), s = r.chance();
      const R = [[`${b}\\ \\square\\ ${a}`, '<'], [`${PT(-a)}\\ \\square\\ ${PT(-b)}`, '<'], [`${a + c}\\ \\square\\ ${b + c}`, '>'], [`${a - c}\\ \\square\\ ${b - c}`, '>']];
      const sel = r.sample(R, 3);
      return { q: T(`Given $${PT(a)} > ${PT(b)}$, fill in each blank with $>$ or $<$: ${sel.map((z, i) => `(${'abc'[i]}) $${z[0]}$`).join(' &emsp; ')}`, `Diberi $${PT(a)} > ${PT(b)}$, isi setiap tempat kosong dengan $>$ atau $<$: ${sel.map((z, i) => `(${'abc'[i]}) $${z[0]}$`).join(' &emsp; ')}`), a: T(sel.map((z, i) => `(${'abc'[i]}) $${z[1]}$`).join('; ')), sp: 's' };
    },
  ];

  const a71 = [
    /* reciprocal / zero care */
    (r) => {
      const [a, b] = pairGT(r, 1, 9), nm = r.name();
      return { q: T(`${nm} claims: "If $x > y$, then $\\dfrac{1}{x} < \\dfrac{1}{y}$." (a) Test with $x = ${a}$, $y = ${b}$. (b) Test with $x = ${b}$, $y = -${a}$. (c) Is the claim always true?`, `${nm} mendakwa: "Jika $x > y$, maka $\\dfrac{1}{x} < \\dfrac{1}{y}$." (a) Uji dengan $x = ${a}$, $y = ${b}$. (b) Uji dengan $x = ${b}$, $y = -${a}$. (c) Adakah dakwaan itu sentiasa benar?`), a: T(`(a) $\\dfrac{1}{${a}} < \\dfrac{1}{${b}}$: true. (b) $\\dfrac{1}{${b}} > -\\dfrac{1}{${a}}$: the claim fails. (c) No; it is true only when $x$ and $y$ are both positive (same side of zero).`, `(a) $\\dfrac{1}{${a}} < \\dfrac{1}{${b}}$: benar. (b) $\\dfrac{1}{${b}} > -\\dfrac{1}{${a}}$: dakwaan gagal. (c) Tidak; ia benar hanya apabila $x$ dan $y$ kedua-duanya positif (pada sebelah yang sama bagi sifar).`), sp: 'l' };
    },
    /* generalisation true/false with counterexample */
    (r) => {
      const c = r.int(2, 4);
      const CL = [
        [T('If $a > b$, then $a^2 > b^2$.', 'Jika $a > b$, maka $a^2 > b^2$.'), false, `a = 1,\\ b = -3: 1 > -3 \\text{ but } 1 < 9`],
        [T('If $a > b$, then $a + c > b + c$.', 'Jika $a > b$, maka $a + c > b + c$.'), true, ''],
        [T(`If $a > b$, then $${c}a > ${c}b$.`, `Jika $a > b$, maka $${c}a > ${c}b$.`), true, ''],
        [T(`If $a > b$, then $-${c}a > -${c}b$.`, `Jika $a > b$, maka $-${c}a > -${c}b$.`), false, `a = 2,\\ b = 1: -${2 * c} < -${c}`],
        [T('If $a > b$ and $c > d$, then $a + c > b + d$.', 'Jika $a > b$ dan $c > d$, maka $a + c > b + d$.'), true, ''],
        [T('If $a > b$ and $c > d$, then $a - c > b - d$.', 'Jika $a > b$ dan $c > d$, maka $a - c > b - d$.'), false, `a = 5,\\ b = 4,\\ c = 3,\\ d = 0: 2 < 4`],
        [T('If $a > b$ and $b > 0$, then $a^2 > b^2$.', 'Jika $a > b$ dan $b > 0$, maka $a^2 > b^2$.'), true, ''],
        [T('If $a > b$, then $\\dfrac{1}{a} < \\dfrac{1}{b}$.', 'Jika $a > b$, maka $\\dfrac{1}{a} < \\dfrac{1}{b}$.'), false, `a = 2,\\ b = -2: \\tfrac{1}{2} > -\\tfrac{1}{2}`],
        [T('If $a > b$, then $a - b > 0$.', 'Jika $a > b$, maka $a - b > 0$.'), true, ''],
      ];
      const [cl, ok, ce] = r.pick(CL);
      return { q: T(`Decide whether the following statement is always true. If not, give a counterexample.<br>${cl.en}`, `Tentukan sama ada pernyataan berikut sentiasa benar. Jika tidak, berikan contoh penyangkal.<br>${cl.ms}`), a: ok ? T('Always true.', 'Sentiasa benar.') : T(`Not always true. Counterexample: $${ce}$.`, `Tidak sentiasa benar. Contoh penyangkal: $${ce}$.`), sp: 'm' };
    },
    /* compact table of operations */
    (r) => {
      const [a, b] = pairGT(r, 3, 12), c = r.int(2, 5);
      const rows = [[`+ ${c}`, a + c, b + c], [`- ${c}`, a - c, b - c], [`\\times ${c}`, a * c, b * c], [`\\times (-${c})`, -a * c, -b * c]];
      const tb = SPM.table(rows.map((z) => [`$${z[0]}$`, `$${a} ${z[0]}\\ \\ \\square\\ \\ ${b} ${z[0]}$`]), { head: [T('Operation on both sides', 'Operasi pada kedua-dua belah').en, T('Write $>$ or $<$', 'Tulis $>$ atau $<$').en] });
      const tb2 = SPM.table(rows.map((z) => [`$${z[0]}$`, `$${a} ${z[0]}\\ \\ \\square\\ \\ ${b} ${z[0]}$`]), { head: [T('Operation on both sides', 'Operasi pada kedua-dua belah').ms, T('Write $>$ or $<$', 'Tulis $>$ atau $<$').ms] });
      return { q: T(`Given $${a} > ${b}$, fill in each blank with $>$ or $<$ to show the effect of each operation.<br>${tb}`, `Diberi $${a} > ${b}$, isi setiap tempat kosong dengan $>$ atau $<$ untuk menunjukkan kesan setiap operasi.<br>${tb2}`), a: T(rows.map((z, i) => `(${i + 1}) $${z[1]} ${cmpSym(z[1], z[2])} ${z[2]}$`).join('; ')), sp: 'm' };
    },
    /* multiplicative inverse with explanation, positive */
    (r) => {
      const [a, b] = pairGT(r, 2, 10), [c, d] = pairGT(r, 3, 15);
      need(a !== c);
      return { q: T(`(a) Given $${a} > ${b}$, write the inequality relating $\\dfrac{1}{${a}}$ and $\\dfrac{1}{${b}}$. (b) Given $${c} > ${d}$, do the same for $\\dfrac{1}{${c}}$ and $\\dfrac{1}{${d}}$. (c) State a generalisation for positive numbers $p > q$.`, `(a) Diberi $${a} > ${b}$, tulis ketaksamaan yang menghubungkan $\\dfrac{1}{${a}}$ dan $\\dfrac{1}{${b}}$. (b) Diberi $${c} > ${d}$, lakukan perkara yang sama bagi $\\dfrac{1}{${c}}$ dan $\\dfrac{1}{${d}}$. (c) Nyatakan satu generalisasi bagi nombor positif $p > q$.`), a: T(`(a) $\\dfrac{1}{${a}} < \\dfrac{1}{${b}}$ (b) $\\dfrac{1}{${c}} < \\dfrac{1}{${d}}$ (c) If $p > q > 0$, then $\\dfrac{1}{p} < \\dfrac{1}{q}$.`, `(a) $\\dfrac{1}{${a}} < \\dfrac{1}{${b}}$ (b) $\\dfrac{1}{${c}} < \\dfrac{1}{${d}}$ (c) Jika $p > q > 0$, maka $\\dfrac{1}{p} < \\dfrac{1}{q}$.`), sp: 'l' };
    },
    /* budget inequality and greatest integer */
    (r) => {
      const price = r.pick([2.5, 3, 4, 4.5, 6]), fixed = r.pick([10, 15, 20]), M0 = r.int(5, 12) * 10, it = r.pick(bank.foods);
      const nmax = Math.floor((M0 - fixed) / price);
      need((M0 - fixed) / price !== nmax);
      return { q: T(`A caterer charges a fixed fee of RM${fixed} plus RM${n(price)} for each portion. A club has a budget of at most RM${M0}. (a) Write an inequality for the number of portions, $p$. (b) State the greatest possible value of $p$.`, `Seorang pengusaha katering mengenakan yuran tetap RM${fixed} ditambah RM${n(price)} bagi setiap hidangan. Sebuah kelab mempunyai bajet selebih-lebihnya RM${M0}. (a) Tulis satu ketaksamaan bagi bilangan hidangan, $p$. (b) Nyatakan nilai $p$ yang terbesar.`), a: T(`(a) $${n(price)}p + ${fixed} \\le ${M0}$ (b) $p = ${nmax}$`), sp: 'm' };
    },
    /* number line with segment -> chain */
    (r) => {
      const lo = r.int(-5, 1), hi = lo + r.int(3, 7), il = r.chance(), ih = r.chance(), l = intsIn(lo, hi, il, ih);
      return { fig: nline(lo - 2, hi + 2, [[{ a: lo, b: hi, ia: il, ib: ih }]]), q: T('The number line shows the values of $x$. (a) Write the inequality as a chain. (b) List the integer values of $x$.', 'Garis nombor menunjukkan nilai $x$. (a) Tulis ketaksamaan itu sebagai satu rantai. (b) Senaraikan nilai integer $x$.'), a: T(`(a) $${chain(lo, il, hi, ih)}$ (b) $${lst(l)}$`), sp: 'm' };
    },
    /* two conditions "and" from words */
    (r) => {
      const lo = r.int(2, 9), hi = lo + r.int(3, 8), v = lv(r), il = r.chance(), ih = r.chance();
      const w1 = il ? T('at least', 'sekurang-kurangnya') : T('more than', 'lebih daripada'), w2 = ih ? T('at most', 'selebih-lebihnya') : T('less than', 'kurang daripada');
      const l = intsIn(lo, hi, il, ih);
      return { q: T(`An integer $${v}$ is ${w1.en} ${lo} and ${w2.en} ${hi}. (a) Write the two inequalities. (b) Combine them into one chain. (c) List all possible values of $${v}$.`, `Suatu integer $${v}$ adalah ${w1.ms} ${lo} dan ${w2.ms} ${hi}. (a) Tulis dua ketaksamaan itu. (b) Gabungkan menjadi satu rantai. (c) Senaraikan semua nilai $${v}$ yang mungkin.`), a: T(`(a) $${v} ${il ? '\\ge' : '>'} ${lo}$ and $${v} ${ih ? '\\le' : '<'} ${hi}$ (b) $${chain(lo, il, hi, ih, v)}$ (c) $${lst(l)}$`), sp: 'm' };
    },
    /* which claims follow from a > b (multi-select) */
    (r) => {
      const c = r.int(2, 5);
      const CL = [[`a + ${c} > b + ${c}`, true], [`a - ${c} > b - ${c}`, true], [`${c}a > ${c}b`, true], [`-${c}a > -${c}b`, false], [`-a > -b`, false], [`b < a`, true], [`\\dfrac{a}{${c}} < \\dfrac{b}{${c}}`, false], [`-a < -b`, true]];
      const s4 = r.sample(CL, 4);
      need(s4.some((z) => z[1]) && s4.some((z) => !z[1]));
      return { q: T(`Given $a > b$, which of the following are always true? ${s4.map((z, i) => `(${'abcd'[i]}) $${z[0]}$`).join(' &emsp; ')}`, `Diberi $a > b$, yang manakah antara berikut sentiasa benar? ${s4.map((z, i) => `(${'abcd'[i]}) $${z[0]}$`).join(' &emsp; ')}`), a: T(s4.map((z, i) => `(${'abcd'[i]}) ${z[1] ? 'true' : 'false'}`).join('; '), s4.map((z, i) => `(${'abcd'[i]}) ${z[1] ? 'benar' : 'palsu'}`).join('; ')), sp: 'm' };
    },
    /* four-number transitive chain */
    (r) => {
      const [A, B, C, D] = r.names(4), v = r.sample(rng(20, 90), 4).sort((p, q) => q - p);
      const ord = r.shuffle([[A, v[0]], [B, v[1]], [C, v[2]], [D, v[3]]]);
      const s = ord.slice().sort((p, q) => q[1] - p[1]);
      return { q: T(`In a quiz, ${ord[0][0]} scored ${ord[0][1]} marks, ${ord[1][0]} scored ${ord[1][1]}, ${ord[2][0]} scored ${ord[2][1]} and ${ord[3][0]} scored ${ord[3][1]}. Write the four names in a chain, highest score first, using $>$. Then use the transitive property to compare the highest and the lowest scorers.`, `Dalam suatu kuiz, ${ord[0][0]} mendapat ${ord[0][1]} markah, ${ord[1][0]} mendapat ${ord[1][1]}, ${ord[2][0]} mendapat ${ord[2][1]} dan ${ord[3][0]} mendapat ${ord[3][1]}. Tulis empat nama itu dalam satu rantai, markah tertinggi dahulu, menggunakan $>$. Kemudian gunakan sifat transitif untuk membandingkan pemarkah tertinggi dan terendah.`), a: T(`${s.map((z) => z[0]).join(' > ')}. By transitivity, ${s[0][0]} > ${s[3][0]}.`, `${s.map((z) => z[0]).join(' > ')}. Melalui sifat transitif, ${s[0][0]} > ${s[3][0]}.`), sp: 'm' };
    },
    /* inequality with a stated situation and integer solutions */
    (r) => {
      const c = sit(r), l = [c.k - 2, c.k - 1, c.k, c.k + 1, c.k + 2].filter((x) => holds(x, c.s, c.k));
      return { q: T(`"${c.T.en}." Write an inequality using $${c.L}$ and state which of these values are allowed: ${[c.k - 2, c.k - 1, c.k, c.k + 1, c.k + 2].join(', ')}.`, `"${c.T.ms}." Tulis satu ketaksamaan menggunakan $${c.L}$ dan nyatakan nilai yang dibenarkan antara: ${[c.k - 2, c.k - 1, c.k, c.k + 1, c.k + 2].join(', ')}.`), a: T(`$${c.L} ${SY[c.s]} ${c.k}$; allowed: ${l.join(', ')}`, `$${c.L} ${SY[c.s]} ${c.k}$; dibenarkan: ${l.join(', ')}`), sp: 's' };
    },

    /* claim with an unknown multiplier */
    (r) => {
      const [a, b] = pairGT(r, 2, 9), nm = r.name(), c = r.pick([-3, -2, 0]);
      const val = cmpSym(a * c, b * c);
      return { q: T(`${nm} says: "Since $${a} > ${b}$, we have $${a}x > ${b}x$ for every value of $x$." Test the claim with $x = ${c}$. Is it true for every $x$? State the values of $x$ for which it is true.`, `${nm} berkata: "Oleh sebab $${a} > ${b}$, maka $${a}x > ${b}x$ bagi setiap nilai $x$." Uji dakwaan itu dengan $x = ${c}$. Adakah ia benar bagi setiap $x$? Nyatakan nilai $x$ yang menjadikannya benar.`), a: T(`No. When $x = ${c}$: $${a * c} ${val} ${b * c}$. It is true only when $x > 0$ (for $x < 0$ the sign reverses; for $x = 0$ both sides are 0).`, `Tidak. Apabila $x = ${c}$: $${a * c} ${val} ${b * c}$. Ia benar hanya apabila $x > 0$ (bagi $x < 0$ tanda disongsangkan; bagi $x = 0$ kedua-dua belah ialah 0).`), sp: 'm' };
    },
    /* limits */
    (r) => {
      const CT = [
        [T('A lift has a load limit of {L} kg. Each adult has a mass of {u} kg.', 'Sebuah lif mempunyai had beban {L} kg. Setiap orang dewasa berjisim {u} kg.'), 'n', T('the greatest number of adults', 'bilangan maksimum orang dewasa')],
        [T('A truck can carry at most {L} kg. Each box has a mass of {u} kg.', 'Sebuah lori boleh membawa selebih-lebihnya {L} kg. Setiap kotak berjisim {u} kg.'), 'n', T('the greatest number of boxes', 'bilangan maksimum kotak')],
        [T('A plan gives {L} minutes of calls. Each call uses {u} minutes.', 'Sebuah pelan memberi {L} minit panggilan. Setiap panggilan menggunakan {u} minit.'), 'n', T('the greatest number of calls', 'bilangan maksimum panggilan')],
        [T('A tank holds at most {L} litres. Each bucket holds {u} litres.', 'Sebuah tangki memuatkan selebih-lebihnya {L} liter. Setiap baldi memuatkan {u} liter.'), 'n', T('the greatest number of buckets that can be emptied into the tank', 'bilangan maksimum baldi yang boleh dituang ke dalam tangki')],
      ];
      const c = r.pick(CT), u = r.pick([12, 15, 20, 25, 40]), L0 = u * r.int(5, 12) + r.int(1, u - 1);
      const mx = Math.floor(L0 / u);
      return { q: T(`${c[0].en.replace('{L}', L0).replace('{u}', u)} Let the number be $n$. (a) Write an inequality for $n$. (b) State ${c[2].en}.`, `${c[0].ms.replace('{L}', L0).replace('{u}', u)} Katakan bilangannya ialah $n$. (a) Tulis satu ketaksamaan bagi $n$. (b) Nyatakan ${c[2].ms}.`), a: T(`(a) $${u}n \\le ${L0}$ (b) ${mx}`), sp: 'm' };
    },
    /* compound: operation incl. negative, then list integers */
    (r) => {
      const lo = r.int(-4, 1), hi = lo + r.int(3, 6), il = r.chance(), ih = r.chance(), c = r.int(2, 3);
      const A = -c * hi, B = -c * lo, iA = ih, iB = il;
      const l = intsIn(A, B, iA, iB);
      return { q: T(`Given $${chain(lo, il, hi, ih)}$. (a) Multiply every part by $-${c}$ and write the new inequality for $-${c}x$. (b) List the integer values of $-${c}x$.`, `Diberi $${chain(lo, il, hi, ih)}$. (a) Darab setiap bahagian dengan $-${c}$ dan tulis ketaksamaan baharu bagi $-${c}x$. (b) Senaraikan nilai integer $-${c}x$.`), a: T(`(a) $${chain(A, iA, B, iB, `-${c}x`)}$ (b) $${lst(l)}$`), w: T('The sign reverses, so the order of the two bounds is swapped.', 'Tanda disongsangkan, maka susunan kedua-dua sempadan bertukar.'), sp: 'm' };
    },
    /* test one value in and one out */
    (r) => {
      const v = lv(r), k = r.int(3, 20), s = r.pick(SYS), inn = holds(k + 1, s, k) ? k + 1 : k - 1, out = holds(k - 1, s, k) ? k + 1 : k - 1;
      need(holds(inn, s, k) && !holds(out, s, k));
      const same = incl(s);
      return { q: T(`(a) Write "$${v}$ is ${s[0] === '>' ? 'greater than' : 'less than'}${incl(s) ? ' or equal to' : ''} ${k}" as an inequality. (b) Show that $${v} = ${inn}$ satisfies it. (c) Show that $${v} = ${out}$ does not.`, `(a) Tulis "$${v}$ ${s[0] === '>' ? 'lebih besar daripada' : 'kurang daripada'}${incl(s) ? ' atau sama dengan' : ''} ${k}" sebagai ketaksamaan. (b) Tunjukkan bahawa $${v} = ${inn}$ memuaskannya. (c) Tunjukkan bahawa $${v} = ${out}$ tidak memuaskannya.`), a: T(`(a) $${v} ${SY[s]} ${k}$ (b) $${inn} ${SY[s]} ${k}$ is true (c) $${out} ${SY[s]} ${k}$ is false because $${out} ${SY[out > k ? '>' : '<']} ${k}$`, `(a) $${v} ${SY[s]} ${k}$ (b) $${inn} ${SY[s]} ${k}$ adalah benar (c) $${out} ${SY[s]} ${k}$ adalah palsu kerana $${out} ${SY[out > k ? '>' : '<']} ${k}$`), sp: 'm' };
    },
    /* complete the rules in words */
    (r) => {
      const c = r.int(2, 6);
      const R = [
        [T(`If $a > b$, then $a + ${c}$ ____ $b + ${c}$.`, `Jika $a > b$, maka $a + ${c}$ ____ $b + ${c}$.`), '>'], [T(`If $a > b$, then $${c}a$ ____ $${c}b$.`, `Jika $a > b$, maka $${c}a$ ____ $${c}b$.`), '>'],
        [T(`If $a > b$, then $-${c}a$ ____ $-${c}b$.`, `Jika $a > b$, maka $-${c}a$ ____ $-${c}b$.`), '<'], [T(`If $a > b$, then $\\dfrac{a}{-${c}}$ ____ $\\dfrac{b}{-${c}}$.`, `Jika $a > b$, maka $\\dfrac{a}{-${c}}$ ____ $\\dfrac{b}{-${c}}$.`), '<'],
        [T(`If $a > b$, then $-a$ ____ $-b$.`, `Jika $a > b$, maka $-a$ ____ $-b$.`), '<'], [T(`If $a > b$, then $b$ ____ $a$.`, `Jika $a > b$, maka $b$ ____ $a$.`), '<'],
        [T(`If $a > b$ and $b > c$, then $a$ ____ $c$.`, `Jika $a > b$ dan $b > c$, maka $a$ ____ $c$.`), '>'],
      ];
      const sel = r.sample(R, 3);
      return { q: T(`Complete each statement with $>$ or $<$.<br>${sel.map((z, i) => `(${'abc'[i]}) ${z[0].en}`).join('<br>')}`, `Lengkapkan setiap pernyataan dengan $>$ atau $<$.<br>${sel.map((z, i) => `(${'abc'[i]}) ${z[0].ms}`).join('<br>')}`), a: T(sel.map((z, i) => `(${'abc'[i]}) $${z[1]}$`).join('; ')), sp: 's' };
    },
  ];
  SPM.extend('F1-7.1', { e: e71, m: m71, a: a71 });

  /* ================================================================ F1-7.2 */
  const holdsF = (x, s, f) => holds(x, s, f.n / f.d);
  /** solve  a x + b  s  d x + e  ; returns {s, k:Fr} and verifies by brute force */
  const solve2 = (a, b, d, e, s) => {
    const co = a - d;
    if (co === 0) throw SPM.REJECT;
    const k = Fr.make(e - b, co), ss = co < 0 ? FL[s] : s;
    for (let x = -60; x <= 60; x++) if (holds(a * x + b, s, d * x + e) !== holdsF(x, ss, k)) throw new Error('solve mismatch');
    return { s: ss, k };
  };
  const sol = (a, b, c, s) => solve2(a, b, 0, c, s);
  const stx = (o, v) => `${v || 'x'} ${SY[o.s]} ${Fr.tex(o.k)}`;
  const kv = (o) => o.k.n / o.k.d;
  const fline = (o, pad) => {
    const k = kv(o), lo = Math.floor(k) - (pad || 4), hi = Math.ceil(k) + (pad || 4);
    return nline(lo, hi, [[rayOf(o.s, k)]]);
  };
  /** build "a x + b s c" whose solution is  x dir k  (dir '>' or '<') */
  const mk = (r, dir, k, inc, o) => {
    o = o || {};
    const a = o.pos ? r.int(1, 5) : r.nz(-5, 5), b = o.nob ? 0 : r.int(-9, 9);
    const s0 = dir + (inc ? '=' : ''), s = a > 0 ? s0 : FL[s0], c = a * k + b;
    const so = sol(a, b, c, s);
    if (so.s !== s0 || kv(so) !== k) throw new Error('mk mismatch');
    return { a, b, c, s, text: `${lin(a, b)} ${SY[s]} ${c}` };
  };
  const SOLF = [
    (I) => T(`Solve ${I}.`, `Selesaikan ${I}.`),
    (I) => T(`Solve the inequality ${I}.`, `Selesaikan ketaksamaan ${I}.`),
    (I) => T(`Find the values of $x$ that satisfy ${I}.`, `Cari nilai $x$ yang memuaskan ${I}.`),
    (I) => T(`Determine the range of values of $x$ for which ${I}.`, `Tentukan julat nilai $x$ bagi ${I}.`),
    (I) => T(`Find the solution of ${I}.`, `Cari penyelesaian bagi ${I}.`),
    (I) => T(`Solve for $x$: ${I}.`, `Selesaikan untuk $x$: ${I}.`),
    (I) => T(`What values of $x$ make ${I} true?`, `Apakah nilai $x$ yang menjadikan ${I} benar?`),
    (I) => T(`Find all the possible values of $x$ if ${I}.`, `Cari semua nilai $x$ yang mungkin jika ${I}.`),
    (I) => T(`Express the solution of ${I} as an inequality in $x$.`, `Nyatakan penyelesaian bagi ${I} sebagai ketaksamaan dalam $x$.`),
    (I) => T(`By isolating $x$, work out the solution of ${I}.`, `Dengan mengasingkan $x$, hitung penyelesaian bagi ${I}.`),
    (I) => T(`Find the range of $x$ given that ${I}.`, `Cari julat $x$ diberi bahawa ${I}.`),
    (I) => T(`Aina needs to solve ${I}. Write her final answer.`, `Aina perlu menyelesaikan ${I}. Tulis jawapan akhirnya.`),
  ];
  const DOM = [
    ['positive integers', 'integer positif', (x) => x >= 1], ['whole numbers', 'nombor bulat', (x) => x >= 0], ['negative integers', 'integer negatif', (x) => x <= -1],
  ];
  const figA = (T0, f) => T(`${T0.en}${f}`, `${T0.ms}${f}`);

  const e72 = [
    /* one-step */
    (r) => {
      const s = r.pick(SYS), c = r.int(1, 9), k = r.int(2, 9), t = r.int(0, 3);
      const F = [[`x + ${c} ${SY[s]} ${c + k}`, 1, c + k - c === k], [`x - ${c} ${SY[s]} ${k}`, 1], [`${c + 1}x ${SY[s]} ${(c + 1) * k}`, 1], [`\\dfrac{x}{${c + 1}} ${SY[s]} ${k}`, 1]];
      const a = [`x ${SY[s]} ${k}`, `x ${SY[s]} ${k + c}`, `x ${SY[s]} ${k}`, `x ${SY[s]} ${k * (c + 1)}`];
      const I = `$${F[t][0]}$`;
      const so = [sol(1, c, c + k, s), sol(1, -c, k, s), sol(c + 1, 0, (c + 1) * k, s), sol(1, 0, k * (c + 1), s)][t];
      const shown = [`x ${SY[s]} ${k}`, `x ${SY[s]} ${k + c}`, `x ${SY[s]} ${k}`, `x ${SY[s]} ${k * (c + 1)}`][t];
      if (t < 3 && stx(so) !== shown) throw new Error('e72 mismatch');
      return { q: r.pick(SOLF)(I), a: T(`$${shown}$`), sp: 'xs' };
    },
    /* solve and draw */
    (r) => {
      const s = r.pick(SYS), c = r.int(1, 9), k = r.int(-3, 6), t = r.int(0, 1);
      const a0 = t ? sol(1, -c, k, s) : sol(1, c, k + c, s);
      const I = t ? `x - ${c} ${SY[s]} ${k}` : `x + ${c} ${SY[s]} ${k + c}`;
      const q = r.pick([T(`Solve $${I}$ and show the solution on a number line.`, `Selesaikan $${I}$ dan tunjukkan penyelesaian pada garis nombor.`), T(`Solve $${I}$. Represent your answer on a number line.`, `Selesaikan $${I}$. Wakilkan jawapan anda pada garis nombor.`)]);
      const k2 = t ? k + c : k;
      return { q, a: figA(T(`$${stx(a0)}$`), fline(a0)), sp: 'm' };
    },
    /* test values */
    (r) => {
      const a = r.int(2, 5), c = r.int(2, 9) * a, s = r.pick(SYS), k = c / a, nums = r.sample(rng(k - 3, k + 3), 4).sort((p, q) => p - q);
      const ok = nums.filter((x) => holds(a * x, s, c));
      need(ok.length >= 1 && ok.length < 4);
      return { q: T(`Which of the numbers $${nums.join(',\\ ')}$ satisfy $${a}x ${SY[s]} ${c}$?`, `Yang manakah antara nombor $${nums.join(',\\ ')}$ memuaskan $${a}x ${SY[s]} ${c}$?`), a: T(`$${ok.join(',\\ ')}$`), sp: 's' };
    },
    /* smallest / greatest integer */
    (r) => {
      const c = r.int(2, 9), k = r.int(-4, 9), up = r.chance(), strict = r.chance();
      const s = (up ? '>' : '<') + (strict ? '' : '=');
      const so = sol(1, c, k + c, s);
      const l = rng(-30, 30).filter((x) => holds(x + c, s, k + c));
      const ans = up ? l[0] : l[l.length - 1];
      return { q: T(`Find the ${up ? 'smallest' : 'greatest'} integer $x$ that satisfies $x + ${c} ${SY[s]} ${k + c}$.`, `Cari integer $x$ yang ${up ? 'terkecil' : 'terbesar'} yang memuaskan $x + ${c} ${SY[s]} ${k + c}$.`), a: T(`$${ans}$`), w: T(`$${stx(so)}$`), sp: 's' };
    },
    /* fill in the missing step */
    (r) => {
      const c = r.int(2, 9), k = r.int(2, 9), s = r.pick(SYS), t = r.int(0, 1);
      const F = [[`x + ${c} ${SY[s]} ${k + c}`, `x ${SY[s]} \\square`, k], [`${c}x ${SY[s]} ${c * k}`, `x ${SY[s]} \\square`, k]];
      return { q: T(`Complete the step: $${F[t][0]}\\ \\Rightarrow\\ ${F[t][1]}$.`, `Lengkapkan langkah: $${F[t][0]}\\ \\Rightarrow\\ ${F[t][1]}$.`), a: T(`$${k}$`), sp: 'xs' };
    },
    /* operation to use */
    (r) => {
      const c = r.int(2, 9), k = r.int(2, 9), t = r.int(0, 3), s = r.pick(SYS);
      const F = [
        [`x + ${c} ${SY[s]} ${k + c}`, T(`subtract ${c} from both sides`, `tolak ${c} daripada kedua-dua belah`)], [`x - ${c} ${SY[s]} ${k}`, T(`add ${c} to both sides`, `tambah ${c} pada kedua-dua belah`)],
        [`${c}x ${SY[s]} ${c * k}`, T(`divide both sides by ${c}`, `bahagi kedua-dua belah dengan ${c}`)], [`\\dfrac{x}{${c}} ${SY[s]} ${k}`, T(`multiply both sides by ${c}`, `darab kedua-dua belah dengan ${c}`)],
      ];
      return { q: T(`What operation should be done on both sides of $${F[t][0]}$ to solve it?`, `Apakah operasi yang perlu dilakukan pada kedua-dua belah $${F[t][0]}$ untuk menyelesaikannya?`), a: F[t][1], sp: 'xs' };
    },
    /* true / false claims */
    (r) => {
      const c = r.int(2, 9), k = r.int(2, 9), s = r.pick(SYS), good = r.chance();
      const shown = good ? k : k + c;
      return { q: T(`True or false: the solution of $x - ${c} ${SY[s]} ${k}$ is $x ${SY[s]} ${shown}$.`, `Benar atau palsu: penyelesaian bagi $x - ${c} ${SY[s]} ${k}$ ialah $x ${SY[s]} ${shown}$.`), a: good ? T(`False. $x - ${c} ${SY[s]} ${k}$ gives $x ${SY[s]} ${k + c}$.`, `Palsu. $x - ${c} ${SY[s]} ${k}$ memberi $x ${SY[s]} ${k + c}$.`) : T('True.', 'Benar.'), sp: 'xs' };
    },
    /* which number line? -> pick the correct description */
    (r) => {
      const c = r.int(1, 6), k = r.int(-2, 5), s = r.pick(SYS), so = sol(1, c, k + c, s);
      const wrong = FL[s];
      const o = mcq(r, `$x ${SY[s]} ${k}$`, SYS.filter((z) => z !== s).map((z) => `$x ${SY[z]} ${k}$`));
      return { q: T(`Which is the solution of $x + ${c} ${SY[s]} ${k + c}$?<br>${o.s}`, `Yang manakah penyelesaian bagi $x + ${c} ${SY[s]} ${k + c}$?<br>${o.s}`), a: T(`${o.L}: $x ${SY[s]} ${k}$`), sp: 'xs' };
    },
    /* decimals */
    (r) => {
      const s = r.pick(SYS), d = r.int(1, 9) / 10, k = r.int(5, 30) / 10, t = r.chance();
      const so = t ? sol(1, 0, k, s) : null;
      const I = t ? `x + ${n(d)} ${SY[s]} ${n(Math.round((k + d) * 10) / 10)}` : `x - ${n(d)} ${SY[s]} ${n(k)}`;
      const ans = t ? k : Math.round((k + d) * 10) / 10;
      return { q: r.pick(SOLF)(`$${I}$`), a: T(`$x ${SY[s]} ${n(ans)}$`), sp: 'xs' };
    },
    /* table of test values */
    (r) => {
      const a = r.int(2, 4), b = r.int(1, 5), k = r.int(2, 5), s = r.pick(['>', '>=']), c = a * k + b;
      const cols = rng(k - 2, k + 2), row = cols.map((x) => (holds(a * x + b, s, c) ? '\\checkmark' : '\\times'));
      const tb = (l) => SPM.table([[`$${lin(a, b)} ${SY[s]} ${c}$`].concat(cols.map(() => ''))], { head: [`$x$`].concat(cols), rowHead: true });
      const so = sol(a, b, c, s);
      return { q: T(`Test each value of $x$ in the table in the inequality $${lin(a, b)} ${SY[s]} ${c}$ (write a tick if it is true and a cross if it is false). Then solve the inequality.<br>${tb('en')}`, `Uji setiap nilai $x$ dalam jadual dalam ketaksamaan $${lin(a, b)} ${SY[s]} ${c}$ (tulis tanda betul jika benar dan tanda salah jika palsu). Kemudian selesaikan ketaksamaan itu.<br>${tb('ms')}`), a: T(cols.map((x, i) => `$x=${x}$: $${row[i]}$`).join('; ') + `. $${stx(so)}$`), sp: 's' };
    },
  ];

  const m72 = [
    /* negative coefficient */
    (r) => {
      const s = r.pick(SYS), a = -r.int(2, 6), k = r.int(-6, 6), b = r.int(-8, 8), c = a * k + b, so = sol(a, b, c, s);
      need(b !== 0);
      const q = r.pick(SOLF)(`$${lin(a, b)} ${SY[s]} ${c}$`);
      return { q, a: T(`$${stx(so)}$`), w: T(`Dividing by $${a}$ (negative) reverses the sign.`, `Membahagi dengan $${a}$ (negatif) menyongsangkan tanda.`), sp: 's' };
    },
    /* fraction form */
    (r) => {
      const s = r.pick(SYS), d = r.int(2, 5), k = r.int(-4, 8), b = r.nz(-6, 6), rhs = k + b, so = sol(1, 0, (rhs - b) * d, s);
      const neg = r.chance();
      const sg = neg ? -1 : 1, so2 = sol(sg, 0, sg * k * d, s);
      return { q: r.pick(SOLF)(`$${neg ? '-' : ''}\\dfrac{x}{${d}} ${b < 0 ? '-' : '+'} ${Math.abs(b)} ${SY[s]} ${sg * k + b}$`), a: T(`$x ${SY[neg ? FL[s] : s]} ${k * d}$`), sp: 's' };
    },
    /* solve and number line */
    (r) => {
      const s = r.pick(SYS), a = r.nz(-5, 5), k = r.int(-4, 5), b = r.nz(-9, 9), c = a * k + b, so = sol(a, b, c, s);
      const q = r.pick([T(`Solve $${lin(a, b)} ${SY[s]} ${c}$ and represent the solution on a number line.`, `Selesaikan $${lin(a, b)} ${SY[s]} ${c}$ dan wakilkan penyelesaian pada garis nombor.`), T(`Solve $${lin(a, b)} ${SY[s]} ${c}$. Draw the solution on a number line, using a filled or an open circle correctly.`, `Selesaikan $${lin(a, b)} ${SY[s]} ${c}$. Lukis penyelesaian pada garis nombor dengan bulatan penuh atau kosong yang betul.`)]);
      return { q, a: figA(T(`$${stx(so)}$`), fline(so)), sp: 'm' };
    },
    /* integer solutions */
    (r) => {
      const a = r.int(2, 5), b = r.int(-6, 6), k = r.int(3, 8), s = r.pick(['<', '<=']), d = r.pick(DOM);
      const c = a * k + b, l = rng(-30, 30).filter((x) => d[2](x) && holds(a * x + b, s, c));
      need(l.length >= 2 && l.length <= 8);
      return { q: T(`Find all the ${d[0]} that satisfy $${lin(a, b)} ${SY[s]} ${c}$.`, `Cari semua ${d[1]} yang memuaskan $${lin(a, b)} ${SY[s]} ${c}$.`), a: T(`$${lst(l)}$`), w: T(`$${stx(sol(a, b, c, s))}$`), sp: 's' };
    },
    /* error: sign not reversed */
    (r) => {
      const s = r.pick(['>', '<']), a = -r.int(2, 5), k = r.int(-5, 5), c = a * k, nm = r.name(), so = sol(a, 0, c, s);
      return { q: T(`${nm} solved $${a}x ${SY[s]} ${c}$ and wrote $x ${SY[s]} ${k}$. Is this correct? If not, give the correct solution.`, `${nm} menyelesaikan $${a}x ${SY[s]} ${c}$ dan menulis $x ${SY[s]} ${k}$. Adakah ini betul? Jika tidak, berikan penyelesaian yang betul.`), a: T(`No. Dividing by the negative number $${a}$ reverses the sign, so $${stx(so)}$.`, `Tidak. Membahagi dengan nombor negatif $${a}$ menyongsangkan tanda, maka $${stx(so)}$.`), sp: 's' };
    },
    /* simultaneous, "and", list integers */
    (r) => {
      const lo = r.int(-5, 1), hi = lo + r.int(4, 8), il = r.chance(), ih = r.chance();
      const A = mk(r, '>', lo, il), B = mk(r, '<', hi, ih), l = intsIn(lo, hi, il, ih);
      need(l.length >= 3 && l.length <= 7);
      const q = r.pick([T(`Solve the two inequalities $${A.text}$ and $${B.text}$ together, and list the integers that satisfy both.`, `Selesaikan dua ketaksamaan $${A.text}$ dan $${B.text}$ bersama-sama, dan senaraikan integer yang memuaskan kedua-duanya.`), T(`Find the integers $x$ such that $${A.text}$ and $${B.text}$.`, `Cari integer $x$ dengan keadaan $${A.text}$ dan $${B.text}$.`)]);
      return { q, a: T(`$${chain(lo, il, hi, ih)}$; $${lst(l)}$`), sp: 'm' };
    },
    /* budget word problem */
    (r) => {
      const nm = r.name(), it = r.pick(bank.items), p = r.int(it.lo, it.hi), M0 = p * r.int(4, 12) + r.int(1, p - 1 > 0 ? p - 1 : 1), f = r.pick([0, 5, 10]);
      need(M0 > f + p);
      const mx = Math.floor((M0 - f) / p);
      return { q: T(`${nm} has RM${M0}. ${f ? `A shopping bag costs RM${f}. ` : ''}Each ${it.en1} costs RM${p}. Form an inequality and find the greatest number of ${it.en} ${nm} can buy${f ? ' after buying the bag' : ''}.`, `${nm} mempunyai RM${M0}. ${f ? `Sebuah beg membeli-belah berharga RM${f}. ` : ''}Setiap ${it.ms} berharga RM${p}. Bentukkan satu ketaksamaan dan cari bilangan ${it.ms} terbanyak yang boleh dibeli oleh ${nm}${f ? ' selepas membeli beg itu' : ''}.`), a: T(`$${lin(p, f, 'n')} \\le ${M0}$; $n \\le ${Fr.tex(Fr.make(M0 - f, p))}$; ${mx}`), sp: 'm' };
    },
    /* verify with test values */
    (r) => {
      const s = r.pick(SYS), a = r.int(2, 5), k = r.int(1, 8), b = r.nz(-6, 6), c = a * k + b, so = sol(a, b, c, s);
      const inn = s[0] === '>' ? k + 1 : k - 1, out = s[0] === '>' ? k - 1 : k + 1;
      return { q: T(`Solve $${lin(a, b)} ${SY[s]} ${c}$. Then check your answer by testing $x = ${inn}$ and $x = ${out}$.`, `Selesaikan $${lin(a, b)} ${SY[s]} ${c}$. Kemudian semak jawapan anda dengan menguji $x = ${inn}$ dan $x = ${out}$.`), a: T(`$${stx(so)}$. $x = ${inn}$: $${a * inn + b} ${SY[s]} ${c}$ is true. $x = ${out}$: $${a * out + b} ${SY[s]} ${c}$ is false.`, `$${stx(so)}$. $x = ${inn}$: $${a * inn + b} ${SY[s]} ${c}$ adalah benar. $x = ${out}$: $${a * out + b} ${SY[s]} ${c}$ adalah palsu.`), sp: 'm' };
    },
    /* which inequality has this solution */
    (r) => {
      const k = r.int(-2, 6), s = r.pick(SYS), a = r.int(2, 4), b = r.int(1, 6);
      const right = `${lin(a, b)} ${SY[s]} ${a * k + b}`;
      const wr = [`${lin(a, b)} ${SY[FL[s]]} ${a * k + b}`, `${lin(a, -b)} ${SY[s]} ${a * k + b}`, `${lin(a, b)} ${SY[s]} ${a * k - b}`];
      const o = mcq(r, `$${right}$`, wr.map((z) => `$${z}$`));
      return { q: T(`Which inequality has the solution $x ${SY[s]} ${k}$?<br>${o.s}`, `Ketaksamaan yang manakah mempunyai penyelesaian $x ${SY[s]} ${k}$?<br>${o.s}`), a: T(`${o.L}: $${right}$`), sp: 's' };
    },
    /* count integers */
    (r) => {
      const lo = r.int(-5, 1), hi = lo + r.int(4, 9), il = r.chance(), ih = r.chance(), A = mk(r, '>', lo, il, { pos: true }), B = mk(r, '<', hi, ih, { pos: true }), l = intsIn(lo, hi, il, ih);
      return { q: T(`How many integers satisfy both $${A.text}$ and $${B.text}$?`, `Berapakah bilangan integer yang memuaskan kedua-dua $${A.text}$ dan $${B.text}$?`), a: T(`${l.length} (from $${chain(lo, il, hi, ih)}$)`, `${l.length} (daripada $${chain(lo, il, hi, ih)}$)`), sp: 's' };
    },
  ];

  const a72 = [
    /* unknown on both sides */
    (r) => {
      const s = r.pick(SYS), a = r.int(2, 8), d = r.int(1, 7), b = r.int(-9, 9), e = r.int(-9, 9);
      need(a !== d && b !== e);
      const so = solve2(a, b, d, e, s);
      return { q: r.pick(SOLF)(`$${lin(a, b)} ${SY[s]} ${lin(d, e)}$`), a: T(`$${stx(so)}$`), sp: 'm' };
    },
    /* both sides, some negative coefficient */
    (r) => {
      const s = r.pick(SYS), a = r.int(-6, -1), d = r.int(1, 6), b = r.int(-9, 9), e = r.int(-9, 9);
      need(a !== d);
      const so = solve2(a, b, d, e, s);
      return { q: r.pick(SOLF)(`$${lin(a, b)} ${SY[s]} ${lin(d, e)}$`), a: T(`$${stx(so)}$`), w: T('Collect $x$-terms on one side; if the coefficient of $x$ is negative, reverse the sign when dividing.', 'Kumpulkan sebutan $x$ pada satu belah; jika pekali $x$ negatif, songsangkan tanda apabila membahagi.'), sp: 'm' };
    },
    /* brackets and x on the other side */
    (r) => {
      const s = r.pick(SYS), p = r.int(2, 4), q0 = r.int(2, 6), d = r.int(1, 5), e = r.int(-9, 9);
      const so = solve2(-p, p * q0, d, e, s);
      return { q: r.pick(SOLF)(`$${p}(${q0} - x) ${SY[s]} ${d === 1 ? '' : d}x ${e < 0 ? '-' : '+'} ${Math.abs(e)}$`.replace(/\+ 0\$$/, '$')), a: T(`$${stx(so)}$`), sp: 'm' };
    },
    /* simultaneous with number lines in the answer */
    (r) => {
      const lo = r.int(-4, 1), hi = lo + r.int(3, 7), il = r.chance(), ih = r.chance();
      const A = mk(r, '>', lo, il), B = mk(r, '<', hi, ih), l = intsIn(lo, hi, il, ih);
      need(l.length >= 3 && l.length <= 6);
      const f = nline(lo - 2, hi + 2, [[rayOf(il ? '>=' : '>', lo)], [rayOf(ih ? '<=' : '<', hi)], [{ a: lo, b: hi, ia: il, ib: ih }]]);
      return { q: T(`Solve the simultaneous inequalities $${A.text}$ and $${B.text}$. Show the common solution on a number line, write it as a chain, and list the integer values of $x$.`, `Selesaikan ketaksamaan serentak $${A.text}$ dan $${B.text}$. Tunjukkan penyelesaian sepunya pada garis nombor, tulis sebagai satu rantai, dan senaraikan nilai integer $x$.`), a: figA(T(`$${chain(lo, il, hi, ih)}$; $${lst(l)}$`), f), sp: 'l' };
    },
    /* two rays in the question */
    (r) => {
      const lo = r.int(-4, 1), hi = lo + r.int(3, 7), il = r.chance(), ih = r.chance(), l = intsIn(lo, hi, il, ih);
      need(l.length >= 3 && l.length <= 6);
      const f = nline(lo - 2, hi + 2, [[rayOf(il ? '>=' : '>', lo)], [rayOf(ih ? '<=' : '<', hi)]]);
      return { fig: f, q: T('The two number lines show the solutions of two inequalities in $x$. (a) Write the inequality shown by each line. (b) Find the values of $x$ that satisfy both, and list the integers.', 'Dua garis nombor menunjukkan penyelesaian bagi dua ketaksamaan dalam $x$. (a) Tulis ketaksamaan yang ditunjukkan oleh setiap garis. (b) Cari nilai $x$ yang memuaskan kedua-duanya dan senaraikan integernya.'), a: T(`(a) $x ${il ? '\\ge' : '>'} ${lo}$; $x ${ih ? '\\le' : '<'} ${hi}$ (b) $${chain(lo, il, hi, ih)}$; $${lst(l)}$`), sp: 'm' };
    },
    /* chained inequality solved */
    (r) => {
      const a = r.int(2, 5), b = r.nz(-6, 6), lo = r.int(-3, 2), hi = lo + r.int(3, 6), il = r.chance(), ih = r.chance(), l = intsIn(lo, hi, il, ih);
      need(l.length >= 3 && l.length <= 7);
      const C1 = a * lo + b, C2 = a * hi + b;
      return { q: T(`Solve $${chain(C1, il, C2, ih, lin(a, b))}$ and list the integer values of $x$.`, `Selesaikan $${chain(C1, il, C2, ih, lin(a, b))}$ dan senaraikan nilai integer $x$.`), a: T(`$${chain(lo, il, hi, ih)}$; $${lst(l)}$`), w: T(`Subtract ${b} from every part, then divide every part by ${a}.`, `Tolak ${b} daripada setiap bahagian, kemudian bahagi setiap bahagian dengan ${a}.`), sp: 'm' };
    },
    /* least integer satisfying both */
    (r) => {
      const lo = r.int(-4, 3), hi = lo + r.int(4, 8), il = r.chance(), ih = r.chance(), A = mk(r, '>', lo, il), B = mk(r, '<', hi, ih), l = intsIn(lo, hi, il, ih);
      need(l.length >= 3 && l.length <= 7);
      const t = r.chance();
      return { q: T(`Given $${A.text}$ and $${B.text}$, find the ${t ? 'least' : 'greatest'} integer value of $x$ that satisfies both inequalities, and the sum of all the integer values.`, `Diberi $${A.text}$ dan $${B.text}$, cari nilai integer $x$ ${t ? 'terkecil' : 'terbesar'} yang memuaskan kedua-dua ketaksamaan, dan hasil tambah semua nilai integer itu.`), a: T(`${t ? l[0] : l[l.length - 1]}; sum $= ${l.reduce((p, q) => p + q, 0)}$`), w: T(`$${chain(lo, il, hi, ih)}$: $${lst(l)}$`), sp: 'm' };
    },
    /* explain the intersection, union trap */
    (r) => {
      const lo = r.int(-3, 1), hi = lo + r.int(4, 7), A = mk(r, '>', lo, false), B = mk(r, '<', hi, false), nm = r.name(), bad = hi + 1;
      return { q: T(`${nm} says that $x = ${bad}$ is a solution of both $${A.text}$ and $${B.text}$ because it satisfies the first one. Is ${nm} correct? Explain.`, `${nm} berkata bahawa $x = ${bad}$ ialah penyelesaian bagi kedua-dua $${A.text}$ dan $${B.text}$ kerana ia memuaskan yang pertama. Adakah ${nm} betul? Terangkan.`), a: T(`No. A common solution must satisfy both. $x = ${bad}$ fails $x < ${hi}$. The common solution is $${chain(lo, false, hi, false)}$.`, `Tidak. Penyelesaian sepunya mesti memuaskan kedua-duanya. $x = ${bad}$ tidak memuaskan $x < ${hi}$. Penyelesaian sepunya ialah $${chain(lo, false, hi, false)}$.`), sp: 's' };
    },
    /* fractions with x on both terms */
    (r) => {
      const p = r.int(2, 4), q0 = r.int(p + 1, 6), s = r.pick(SYS), c = r.int(1, 6), sgn = r.pick([1, -1]);
      need(p !== q0);
      const co = Fr.make(q0 + sgn * p, p * q0), k = Fr.make(c * p * q0, q0 + sgn * p);
      need(co.n !== 0);
      const ss = s;
      for (let x = -60; x <= 60; x++) if (holds(x / p + (sgn * x) / q0, s, c) !== holdsF(x, s, k)) throw new Error('fraction mismatch');
      return { q: r.pick(SOLF)(`$\\dfrac{x}{${p}} ${sgn < 0 ? '-' : '+'} \\dfrac{x}{${q0}} ${SY[s]} ${c}$`), a: T(`$x ${SY[s]} ${Fr.tex(k)}$`), sp: 'm' };
    },
    /* multiple conditions with word statement */
    (r) => {
      const a = r.int(2, 4), b = r.int(1, 6), lo = r.int(2, 8), hi = lo + r.int(3, 7), il = r.chance(), ih = r.chance(), l = intsIn(lo, hi, il, ih);
      need(l.length >= 3 && l.length <= 7);
      const C1 = a * lo + b, C2 = a * hi + b;
      return { q: T(`The value of $${lin(a, b)}$ is ${il ? 'at least' : 'more than'} ${C1} and ${ih ? 'at most' : 'less than'} ${C2}. Find the integer values of $x$.`, `Nilai $${lin(a, b)}$ adalah ${il ? 'sekurang-kurangnya' : 'lebih daripada'} ${C1} dan ${ih ? 'selebih-lebihnya' : 'kurang daripada'} ${C2}. Cari nilai integer $x$.`), a: T(`$${chain(lo, il, hi, ih)}$; $${lst(l)}$`), sp: 'm' };
    },
  ];
  SPM.extend('F1-7.2', { e: e72, m: m72, a: a72 });

  /* ================================================================ F1-11 shared: sets */
  /** X(fn): build a bilingual text from fn(L, t) where t(en, ms) picks the language */
  const X = (fn) => T(fn('en', (e) => e), fn('ms', (e, m) => m));
  const isSq = (x) => Math.sqrt(x) % 1 === 0;
  const E = (e, L) => (typeof e === 'object' ? `\\text{${e[L]}}` : typeof e === 'string' ? `\\text{${e}}` : String(e));
  const RO = (l, L) => (l.length ? `\\{${l.map((e) => E(e, L)).join(',\\ ')}\\}` : '\\varnothing');
  const ROX = (l) => X((L) => `$${RO(l, L)}$`);
  const lab = (e) => (typeof e === 'object' ? e.en.slice(0, 3) : String(e));
  const SETN = ['A', 'B', 'P', 'Q', 'C', 'S'];
  const DAYS = [['Monday', 'Isnin'], ['Tuesday', 'Selasa'], ['Wednesday', 'Rabu'], ['Thursday', 'Khamis'], ['Friday', 'Jumaat'], ['Saturday', 'Sabtu'], ['Sunday', 'Ahad']].map((d) => ({ en: d[0], ms: d[1] }));
  const MONTHS = [['January', 'Januari'], ['February', 'Februari'], ['March', 'Mac'], ['April', 'April'], ['May', 'Mei'], ['June', 'Jun'], ['July', 'Julai'], ['August', 'Ogos'], ['September', 'September'], ['October', 'Oktober'], ['November', 'November'], ['December', 'Disember']].map((d) => ({ en: d[0], ms: d[1] }));
  const SHAPES = [['triangle', 'segi tiga', 3], ['square', 'segi empat sama', 4], ['rectangle', 'segi empat tepat', 4], ['pentagon', 'pentagon', 5], ['hexagon', 'heksagon', 6], ['octagon', 'oktagon', 8]].map((d) => ({ en: d[0], ms: d[1], k: d[2] }));
  const Pr = (en, ms, f, sb, sbm) => ({ en, ms, f, sb: T(sb, sbm === undefined ? sb : sbm) });
  /** a universe: {items, xi:(L)=>tex roster, xd: T description, props:[{en,ms,f,sb}], fig: bool} */
  function makeUni(r, kind) {
    kind = kind || r.pick(['num', 'num', 'num', 'let', 'day', 'month', 'shape']);
    if (kind === 'num') {
      const N = r.pick([10, 12, 14, 15, 16, 18, 20]), items = rng(1, N), pr = [];
      for (const k of [2, 3, 4, 5, 6, 7]) pr.push(Pr(`multiples of ${k}`, `gandaan bagi ${k}`, (x) => x % k === 0, `x \\text{ is a multiple of } ${k}`, `x \\text{ ialah gandaan bagi } ${k}`));
      for (const m of [12, 18, 20, 24, 30].filter((m) => m <= N)) pr.push(Pr(`factors of ${m}`, `faktor bagi ${m}`, (x) => m % x === 0, `x \\text{ is a factor of } ${m}`, `x \\text{ ialah faktor bagi } ${m}`));
      pr.push(Pr('prime numbers', 'nombor perdana', (x) => SPM.isPrime(x), 'x \\text{ is a prime number}', 'x \\text{ ialah nombor perdana}'), Pr('perfect squares', 'nombor kuasa dua sempurna', isSq, 'x \\text{ is a perfect square}', 'x \\text{ ialah nombor kuasa dua sempurna}'), Pr('odd numbers', 'nombor ganjil', (x) => x % 2 === 1, 'x \\text{ is an odd number}', 'x \\text{ ialah nombor ganjil}'), Pr('even numbers', 'nombor genap', (x) => x % 2 === 0, 'x \\text{ is an even number}', 'x \\text{ ialah nombor genap}'));
      const t = N - r.int(3, 6);
      pr.push(Pr(`numbers greater than ${t}`, `nombor lebih besar daripada ${t}`, (x) => x > t, `x > ${t}`), Pr(`numbers less than ${t - 2}`, `nombor kurang daripada ${t - 2}`, (x) => x < t - 2, `x < ${t - 2}`));
      return { items, kind, props: pr, fig: true, xd: X((L, t2) => t2(`the integers from 1 to ${N}`, `integer dari 1 hingga ${N}`)), xsb: `\\{x : x \\text{ is an integer},\\ 1 \\le x \\le ${N}\\}`, xsbm: `\\{x : x \\text{ ialah integer},\\ 1 \\le x \\le ${N}\\}` };
    }
    if (kind === 'let') {
      const N = r.int(8, 10), items = 'abcdefghij'.slice(0, N).split(''), V = 'aeiou';
      const pr = [Pr('vowels', 'huruf vokal', (x) => V.includes(x), 'x \\text{ is a vowel}', 'x \\text{ ialah huruf vokal}'), Pr('consonants', 'huruf konsonan', (x) => !V.includes(x), 'x \\text{ is a consonant}', 'x \\text{ ialah huruf konsonan}'), Pr('letters before f', 'huruf sebelum f', (x) => x < 'f', 'x \\text{ comes before } f \\text{ in the alphabet}', 'x \\text{ terletak sebelum } f \\text{ dalam abjad}'), Pr('letters after c', 'huruf selepas c', (x) => x > 'c', 'x \\text{ comes after } c \\text{ in the alphabet}', 'x \\text{ terletak selepas } c \\text{ dalam abjad}'), Pr('letters in the word "BADGE"', 'huruf dalam perkataan "BADGE"', (x) => 'badge'.includes(x), 'x \\text{ is a letter in the word BADGE}', 'x \\text{ ialah huruf dalam perkataan BADGE}')];
      return { items, kind, props: pr, fig: true, xd: X((L, t2) => t2(`the first ${N} letters of the alphabet`, `${N} huruf pertama dalam abjad`)), xsb: `\\{x : x \\text{ is one of the first ${N} letters of the alphabet}\\}`, xsbm: `\\{x : x \\text{ ialah salah satu daripada ${N} huruf pertama dalam abjad}\\}` };
    }
    if (kind === 'day') {
      const pr = [Pr('weekend days', 'hari hujung minggu', (x) => x === DAYS[5] || x === DAYS[6], 'x \\text{ is a weekend day}', 'x \\text{ ialah hari hujung minggu}'), Pr('weekdays (Monday to Friday)', 'hari bekerja (Isnin hingga Jumaat)', (x) => DAYS.indexOf(x) < 5, 'x \\text{ is a weekday}', 'x \\text{ ialah hari bekerja}'), Pr('days from Monday to Wednesday', 'hari dari Isnin hingga Rabu', (x) => DAYS.indexOf(x) < 3, 'x \\text{ is from Monday to Wednesday}', 'x \\text{ ialah dari Isnin hingga Rabu}'), Pr('days after Wednesday', 'hari selepas Rabu', (x) => DAYS.indexOf(x) > 2, 'x \\text{ comes after Wednesday}', 'x \\text{ selepas hari Rabu}')];
      return { items: DAYS, kind, props: pr, fig: false, xd: X((L, t2) => t2('the days of the week', 'hari dalam seminggu')), xsb: '\\{x : x \\text{ is a day of the week}\\}', xsbm: '\\{x : x \\text{ ialah hari dalam seminggu}\\}' };
    }
    if (kind === 'month') {
      const D31 = [0, 2, 4, 6, 7, 9, 11];
      const pr = [Pr('months with 31 days', 'bulan yang mempunyai 31 hari', (x) => D31.includes(MONTHS.indexOf(x)), 'x \\text{ is a month with 31 days}', 'x \\text{ ialah bulan yang mempunyai 31 hari}'), Pr('months with exactly 30 days', 'bulan yang mempunyai tepat 30 hari', (x) => [3, 5, 8, 10].includes(MONTHS.indexOf(x)), 'x \\text{ is a month with exactly 30 days}', 'x \\text{ ialah bulan yang mempunyai tepat 30 hari}'), Pr('months in the first half of the year', 'bulan dalam separuh pertama tahun', (x) => MONTHS.indexOf(x) < 6, 'x \\text{ is in the first half of the year}', 'x \\text{ dalam separuh pertama tahun}'), Pr('months from October to December', 'bulan dari Oktober hingga Disember', (x) => MONTHS.indexOf(x) >= 9, 'x \\text{ is from October to December}', 'x \\text{ dari Oktober hingga Disember}')];
      return { items: MONTHS, kind, props: pr, fig: false, xd: X((L, t2) => t2('the months of the year', 'bulan dalam setahun')), xsb: '\\{x : x \\text{ is a month of the year}\\}', xsbm: '\\{x : x \\text{ ialah bulan dalam setahun}\\}' };
    }
    const pr = [Pr('shapes with 4 sides', 'bentuk yang mempunyai 4 sisi', (x) => x.k === 4, 'x \\text{ has 4 sides}', 'x \\text{ mempunyai 4 sisi}'), Pr('shapes with more than 4 sides', 'bentuk yang mempunyai lebih daripada 4 sisi', (x) => x.k > 4, 'x \\text{ has more than 4 sides}', 'x \\text{ mempunyai lebih daripada 4 sisi}'), Pr('shapes with fewer than 5 sides', 'bentuk yang mempunyai kurang daripada 5 sisi', (x) => x.k < 5, 'x \\text{ has fewer than 5 sides}', 'x \\text{ mempunyai kurang daripada 5 sisi}')];
    return { items: SHAPES, kind, props: pr, fig: false, xd: X((L, t2) => t2('the shapes triangle, square, rectangle, pentagon, hexagon and octagon', 'bentuk segi tiga, segi empat sama, segi empat tepat, pentagon, heksagon dan oktagon')), xsb: '\\{x : x \\text{ is one of the shapes given}\\}', xsbm: '\\{x : x \\text{ ialah salah satu bentuk yang diberi}\\}' };
  }
  const pset = (U, p) => U.items.filter(p.f);
  /** k distinct non-trivial sets (2 <= size <= |xi| - 2) of a universe: [{p, l}] */
  const pick2 = (r, U, k) => {
    const ok = U.props.filter((p) => { const n0 = pset(U, p).length; return n0 >= 2 && n0 <= U.items.length - 2; });
    need(ok.length >= k);
    const ps = r.sample(ok, k);
    const ls = ps.map((p) => pset(U, p).map((z) => z));
    need(new Set(ls.map((l) => l.map(lab).join())).size === k);
    return ps.map((p, i) => ({ p, l: ls[i] }));
  };
  const setb = (U, p, nm, L) => `${nm} = \\{x : x \\in \\xi,\\ ${p.sb[L]}\\}`;
  /** bounded numeric set with several descriptions */
  function numSet(r) {
    const kind = r.pick(['mult', 'mult', 'fact', 'prime', 'sq', 'odd', 'even']);
    if (kind === 'mult') { const k = r.pick([3, 4, 5, 6, 7, 8]), lo = r.int(0, 6), hi = lo + r.int(14, 34); return { l: rng(lo + 1, hi - 1).filter((x) => x % k === 0), w: T(`the multiples of ${k} between ${lo} and ${hi}`, `gandaan bagi ${k} antara ${lo} dengan ${hi}`), sb: (L) => `\\{x : ${lo} < x < ${hi},\\ x \\text{ ${L === 'en' ? 'is a multiple of' : 'ialah gandaan bagi'} } ${k}\\}` }; }
    if (kind === 'fact') { const m = r.pick([12, 18, 20, 24, 28, 30, 36, 40]); return { l: rng(1, m).filter((x) => m % x === 0), w: T(`the factors of ${m}`, `faktor bagi ${m}`), sb: (L) => `\\{x : x \\text{ ${L === 'en' ? 'is a factor of' : 'ialah faktor bagi'} } ${m}\\}` }; }
    if (kind === 'prime') { const lo = r.int(0, 20), hi = lo + r.int(10, 20); return { l: rng(lo + 1, hi - 1).filter((x) => SPM.isPrime(x)), w: T(`the prime numbers between ${lo} and ${hi}`, `nombor perdana antara ${lo} dengan ${hi}`), sb: (L) => `\\{x : ${lo} < x < ${hi},\\ x \\text{ ${L === 'en' ? 'is a prime number' : 'ialah nombor perdana'}}\\}` }; }
    if (kind === 'sq') { const hi = r.pick([30, 50, 70, 100]); return { l: rng(1, hi).filter(isSq), w: T(`the perfect squares not more than ${hi}`, `nombor kuasa dua sempurna yang tidak melebihi ${hi}`), sb: (L) => `\\{x : 1 \\le x \\le ${hi},\\ x \\text{ ${L === 'en' ? 'is a perfect square' : 'ialah nombor kuasa dua sempurna'}}\\}` }; }
    const lo = r.int(0, 10), hi = lo + r.int(8, 16), odd = kind === 'odd';
    return { l: rng(lo + 1, hi - 1).filter((x) => x % 2 === (odd ? 1 : 0)), w: odd ? T(`the odd numbers between ${lo} and ${hi}`, `nombor ganjil antara ${lo} dengan ${hi}`) : T(`the even numbers between ${lo} and ${hi}`, `nombor genap antara ${lo} dengan ${hi}`), sb: (L) => `\\{x : ${lo} < x < ${hi},\\ x \\text{ ${odd ? (L === 'en' ? 'is an odd number' : 'ialah nombor ganjil') : L === 'en' ? 'is an even number' : 'ialah nombor genap'}}\\}` };
  }
  const nset = (r, lo, hi) => retry(() => { const s = numSet(r); need(s.l.length >= (lo || 3) && s.l.length <= (hi || 9)); return s; }, 300);
  const nm2 = (r) => r.sample(SETN, 2);

  /* ================================================================ F1-11.1 */
  const LF = [
    (S0) => X((L, t) => `${t('List the elements of the set', 'Senaraikan unsur bagi set')} $${S0(L)}$.`),
    (S0) => X((L, t) => `${t('Write the set', 'Tulis set')} $${S0(L)}$ ${t('in roster form (list its elements).', 'dalam bentuk senarai (senaraikan unsurnya).')}`),
    (S0) => X((L, t) => `${t('Write down all the elements of', 'Tulis semua unsur bagi')} $${S0(L)}$.`),
    (S0) => X((L, t) => `${t('Which numbers or objects belong to', 'Nombor atau objek yang manakah tergolong dalam')} $${S0(L)}$?`),
  ];
  const e111 = [
    /* description -> roster */
    (r) => {
      const U = makeUni(r), [{ p, l }] = pick2(r, U, 1), nm = r.pick(SETN);
      const q = r.chance() ? r.pick(LF)((L) => setb(U, p, nm, L)) : X((L, t) => `${t('Let ξ be ', 'Katakan ξ ialah ')}${U.xd[L]}. ${t('Set', 'Set')} $${nm}$ ${t('is the set of', 'ialah set')} ${p[L]}. ${t('List the elements of', 'Senaraikan unsur bagi')} $${nm}$.`);
      return { q, a: X((L) => `$${nm} = ${RO(l, L)}$`), sp: 's' };
    },
    /* bounded set-builder -> roster */
    (r) => {
      const s = nset(r, 3, 8), nm = r.pick(SETN);
      return { q: r.pick(LF)((L) => `${nm} = ${s.sb(L)}`), a: X((L) => `$${nm} = ${RO(s.l, L)}$`), sp: 's' };
    },
    /* n(A) from roster */
    (r) => {
      const U = makeUni(r), [{ l }] = pick2(r, U, 1), nm = r.pick(SETN), f = r.int(0, 2);
      const q = [X((L, t) => `${t('Given', 'Diberi')} $${nm} = ${RO(l, L)}$, ${t('find', 'cari')} $n(${nm})$.`), X((L, t) => `${t('How many elements are there in the set', 'Berapakah bilangan unsur dalam set')} $${nm} = ${RO(l, L)}$?`), X((L, t) => `${t('State the number of elements of', 'Nyatakan bilangan unsur bagi')} $${nm} = ${RO(l, L)}$ ${t('using the notation', 'menggunakan tatatanda')} $n(${nm})$.`)][f];
      return { q, a: X((L) => `$n(${nm}) = ${l.length}$`), sp: 'xs' };
    },
    /* membership */
    (r) => {
      const U = makeUni(r), [{ l }] = pick2(r, U, 1), inn = r.chance(), pool = U.items.filter((x) => (l.includes(x) ? 0 : 1) === (inn ? 0 : 1)), x = r.pick(pool.length ? pool : U.items);
      const yes = l.includes(x), nm = r.pick(SETN);
      const q = r.pick([
        X((L, t) => `${t('Given', 'Diberi')} $${nm} = ${RO(l, L)}$, ${t('state whether', 'nyatakan sama ada')} $${E(x, L)} \\in ${nm}$ ${t('or', 'atau')} $${E(x, L)} \\notin ${nm}$.`),
        X((L, t) => `${t('True or false', 'Benar atau palsu')}: $${E(x, L)} \\in ${nm}$, ${t('where', 'dengan')} $${nm} = ${RO(l, L)}$.`),
        X((L, t) => `${t('Fill in the blank with', 'Isi tempat kosong dengan')} $\\in$ ${t('or', 'atau')} $\\notin$: $${E(x, L)}\\ \\square\\ ${RO(l, L)}$.`),
      ]);
      return { q, a: X((L, t) => `$${E(x, L)} ${yes ? '\\in' : '\\notin'} ${nm}$`), sp: 'xs' };
    },
    /* which is the empty set */
    (r) => {
      const k = r.int(2, 7), a = r.int(1, 8);
      const OPT = [
        [`\\{x : x \\text{ is an integer},\\ ${a} < x < ${a + 1}\\}`, `\\{x : x \\text{ ialah integer},\\ ${a} < x < ${a + 1}\\}`, 1],
        [`\\{x : x \\text{ is a prime number},\\ ${a + 1} < x < ${a + 2}\\}`, `\\{x : x \\text{ ialah nombor perdana},\\ ${a + 1} < x < ${a + 2}\\}`, 1],
        [`\\{x : x \\text{ is a multiple of } ${k},\\ ${k} \\le x \\le ${2 * k}\\}`, `\\{x : x \\text{ ialah gandaan bagi } ${k},\\ ${k} \\le x \\le ${2 * k}\\}`, 0],
        [`\\{x : x \\text{ is an integer},\\ ${a} \\le x \\le ${a + 1}\\}`, `\\{x : x \\text{ ialah integer},\\ ${a} \\le x \\le ${a + 1}\\}`, 0],
        [`\\{x : x \\text{ is an even number},\\ x = ${2 * a + 1}\\}`, `\\{x : x \\text{ ialah nombor genap},\\ x = ${2 * a + 1}\\}`, 1],
        [`\\{0\\}`, `\\{0\\}`, 0], [`\\{x : x \\text{ is a factor of } ${k + 4}\\}`, `\\{x : x \\text{ ialah faktor bagi } ${k + 4}\\}`, 0],
      ];
      const emp = r.pick(OPT.filter((o) => o[2])), non = r.sample(OPT.filter((o) => !o[2]), 3), all = r.shuffle([emp].concat(non));
      return { q: T(`Which of the following sets is the empty set?<br>${all.map((o, i) => `(${AB[i]}) $${o[0]}$`).join('<br>')}`, `Set yang manakah ialah set kosong?<br>${all.map((o, i) => `(${AB[i]}) $${o[1]}$`).join('<br>')}`), a: X((L) => `${AB[all.indexOf(emp)]}: $${emp[L === 'en' ? 0 : 1]}$ = $\\varnothing$`), sp: 's' };
    },
    /* roster -> which description (MCQ) */
    (r) => {
      const U = makeUni(r, r.pick(['num', 'num', 'let'])), ps = pick2(r, U, 4), c = ps[0], nm = r.pick(SETN);
      const o = r.shuffle(ps);
      return { q: X((L, t) => `${t('Which description matches the set', 'Huraian yang manakah sepadan dengan set')} $${nm} = ${RO(c.l, L)}$? ${t('(ξ is', '(ξ ialah')} ${U.xd[L]}.)<br>${o.map((z, i) => `(${AB[i]}) ${z.p[L]}`).join('<br>')}`), a: X((L) => `${AB[o.indexOf(c)]}: ${c.p[L]}`), sp: 's' };
    },
    /* symbols and words */
    (r) => {
      const nm = r.pick(SETN), x = r.int(2, 30), k = r.int(3, 9);
      const F = [
        [X((L, t) => t(`Write in symbols: "${x} is an element of set ${nm}".`, `Tulis dalam simbol: "${x} ialah unsur bagi set ${nm}".`)), `$${x} \\in ${nm}$`],
        [X((L, t) => t(`Write in symbols: "${x} is not an element of set ${nm}".`, `Tulis dalam simbol: "${x} bukan unsur bagi set ${nm}".`)), `$${x} \\notin ${nm}$`],
        [X((L, t) => t(`Set ${nm} has ${k} elements. Write this using $n(${nm})$.`, `Set ${nm} mempunyai ${k} unsur. Tulis ini menggunakan $n(${nm})$.`)), `$n(${nm}) = ${k}$`],
        [X((L, t) => t(`What does $n(${nm}) = ${k}$ mean?`, `Apakah maksud $n(${nm}) = ${k}$?`)), X((L, t) => t(`Set ${nm} has ${k} elements.`, `Set ${nm} mempunyai ${k} unsur.`))],
        [X((L, t) => t(`What is the name of the set that has no elements, and what symbol represents it?`, `Apakah nama set yang tidak mempunyai unsur, dan apakah simbol yang mewakilinya?`)), X((L, t) => t('The empty set, $\\varnothing$', 'Set kosong, $\\varnothing$'))],
        [X((L, t) => t(`Read the statement $${x} \\notin ${nm}$ in words.`, `Baca pernyataan $${x} \\notin ${nm}$ dalam perkataan.`)), X((L, t) => t(`${x} is not an element of ${nm}.`, `${x} bukan unsur bagi ${nm}.`))],
      ];
      const [q, a] = r.pick(F);
      return { q, a: typeof a === 'string' ? T(a) : a, sp: 'xs' };
    },
    /* number of elements of a described set in xi */
    (r) => {
      const U = makeUni(r), [{ p, l }] = pick2(r, U, 1), nm = r.pick(SETN);
      return { q: X((L, t) => `${U.xd[L] ? t('The universal set is', 'Set semesta ialah') + ' ' + U.xd[L] + '. ' : ''}${t('How many elements are in the set of', 'Berapakah bilangan unsur dalam set')} ${p[L]}?`), a: X((L, t) => `${l.length}: $${RO(l, L)}$`), sp: 's' };
    },
    /* finite / infinite recognition */
    (r) => {
      const k = r.int(2, 9), F = [
        [X((L, t) => `\\{x : x \\text{ ${t('is a multiple of', 'ialah gandaan bagi')} } ${k}\\}`), false, X((L, t) => t('the multiples never end', 'gandaan tidak pernah berakhir'))],
        [X((L, t) => `\\{x : x \\text{ ${t('is a factor of', 'ialah faktor bagi')} } ${k * 6}\\}`), true, X((L, t) => t(`it has exactly ${SPM.factors(k * 6).length} elements`, `ia mempunyai tepat ${SPM.factors(k * 6).length} unsur`))],
        [X((L, t) => `\\{x : x \\text{ ${t('is an integer', 'ialah integer')}},\\ 1 \\le x \\le ${k * 10}\\}`), true, X((L, t) => t(`it has ${k * 10} elements`, `ia mempunyai ${k * 10} unsur`))],
        [X((L, t) => `\\{x : x \\text{ ${t('is an even number', 'ialah nombor genap')}}\\}`), false, X((L, t) => t('even numbers go on forever', 'nombor genap berterusan tanpa had'))],
        [X((L, t) => `\\{x : x \\text{ ${t('is an integer', 'ialah integer')}},\\ x > ${k}\\}`), false, X((L, t) => t('there is no largest integer', 'tiada integer yang terbesar'))],
      ];
      const [s0, fin, why] = r.pick(F);
      return { q: X((L, t) => `${t('State whether the set', 'Nyatakan sama ada set')} $${s0[L]}$ ${t('is finite or infinite.', 'terhingga atau tak terhingga.')}`), a: X((L, t) => `${fin ? t('Finite', 'Terhingga') : t('Infinite', 'Tak terhingga')}: ${why[L]}.`), sp: 's' };
    },
  ];

  const m111 = [
    /* bounded set-builder -> roster and n */
    (r) => {
      const s = nset(r, 3, 9), nm = r.pick(SETN);
      const q = r.pick([
        X((L, t) => `${t('Write the set', 'Tulis set')} $${nm} = ${s.sb(L)}$ ${t('in roster form and find', 'dalam bentuk senarai dan cari')} $n(${nm})$.`),
        X((L, t) => `${t('List the elements of', 'Senaraikan unsur bagi')} $${nm} = ${s.sb(L)}$ ${t('and state', 'dan nyatakan')} $n(${nm})$.`),
      ]);
      return { q, a: X((L) => `$${nm} = ${RO(s.l, L)}$, $n(${nm}) = ${s.l.length}$`), sp: 's' };
    },
    /* roster -> set-builder (MCQ) */
    (r) => {
      const ss = [nset(r, 3, 8), nset(r, 3, 8), nset(r, 3, 8), nset(r, 3, 8)];
      need(new Set(ss.map((z) => z.l.join())).size === 4);
      const c = ss[0], o = r.shuffle(ss), nm = r.pick(SETN);
      return { q: X((L, t) => `${t('Which set-builder notation describes', 'Tatatanda pembina set yang manakah menerangkan')} $${nm} = ${RO(c.l, L)}$?<br>${o.map((z, i) => `(${AB[i]}) $${z.sb(L)}$`).join('<br>')}`), a: X((L) => `${AB[o.indexOf(c)]}: $${c.sb(L)}$`), sp: 's' };
    },
    /* equal sets */
    (r) => {
      const U = makeUni(r, 'num'), s1 = nset(r, 3, 8), [a, b] = nm2(r);
      const same = r.chance();
      let l2 = same ? s1.l.slice() : s1.l.slice(0, -1).concat([s1.l[s1.l.length - 1] + 1]);
      need(same || !s1.l.includes(l2[l2.length - 1]));
      const eq = l2.join() === s1.l.join();
      return { q: X((L, t) => `${t('Set', 'Set')} $${a} = ${s1.sb(L)}$ ${t('and set', 'dan set')} $${b} = ${RO(l2, L)}$. ${t('Are', 'Adakah')} $${a}$ ${t('and', 'dan')} $${b}$ ${t('equal sets? Give a reason.', 'set yang sama? Berikan sebab.')}`), a: X((L, t) => eq ? `${t('Yes: both have exactly the elements', 'Ya: kedua-duanya mempunyai unsur')} $${RO(l2, L)}$` : `${t('No', 'Tidak')}: $${a} = ${RO(s1.l, L)}$ ${t('but', 'tetapi')} $${b} = ${RO(l2, L)}$`), sp: 's' };
    },
    /* empty set reasoning */
    (r) => {
      const a = r.int(1, 9), k = r.int(3, 8), F = [
        [X((L, t) => `\\{x : x \\text{ ${t('is an integer', 'ialah integer')}},\\ ${a} < x < ${a + 1}\\}`), []],
        [X((L, t) => `\\{x : x \\text{ ${t('is a multiple of', 'ialah gandaan bagi')} } ${k},\\ ${k * 2 + 1} \\le x \\le ${k * 3 - 1}\\}`), []],
        [X((L, t) => `\\{x : x \\text{ ${t('is a prime number', 'ialah nombor perdana')}},\\ 23 < x < 29\\}`), []],
        [X((L, t) => `\\{x : x \\text{ ${t('is an even number', 'ialah nombor genap')}},\\ x = ${2 * a + 1}\\}`), []],
        [X((L, t) => `\\{x : x \\text{ ${t('is an integer', 'ialah integer')}},\\ ${a} \\le x < ${a + 2}\\}`), [a, a + 1]],
        [X((L, t) => `\\{x : x \\text{ ${t('is a multiple of', 'ialah gandaan bagi')} } ${k},\\ ${k * 2} \\le x \\le ${k * 3}\\}`), [k * 2, k * 3]],
      ];
      const [s0, l] = r.pick(F);
      return { q: X((L, t) => `${t('Is the set', 'Adakah set')} $${s0[L]}$ ${t('empty? List its elements if it is not empty.', 'kosong? Senaraikan unsurnya jika set itu tidak kosong.')}`), a: X((L, t) => l.length ? `${t('No', 'Tidak')}: $${RO(l, L)}$` : `${t('Yes: no number satisfies the condition, so it is', 'Ya: tiada nombor yang memuaskan syarat itu, maka ia ialah')} $\\varnothing$`), sp: 's' };
    },
    /* finite / infinite with reason and n */
    (r) => {
      const s = nset(r, 3, 9), nm = r.pick(SETN);
      const inf = r.chance(), k = r.int(3, 9);
      return { q: inf ? X((L, t) => `${t('Set', 'Set')} $${nm} = \\{x : x \\text{ ${t('is a multiple of', 'ialah gandaan bagi')} } ${k}\\}$. ${t('Can you list all the elements of', 'Bolehkah anda senaraikan semua unsur bagi')} $${nm}$? ${t('Is', 'Adakah')} $${nm}$ ${t('finite or infinite?', 'terhingga atau tak terhingga?')}`) : X((L, t) => `${t('Set', 'Set')} $${nm} = ${s.sb(L)}$. ${t('Is', 'Adakah')} $${nm}$ ${t('finite or infinite? If finite, find', 'terhingga atau tak terhingga? Jika terhingga, cari')} $n(${nm})$.`), a: inf ? X((L, t) => t(`No; $${nm}$ has no last element, so it is infinite.`, `Tidak; $${nm}$ tiada unsur terakhir, maka ia tak terhingga.`)) : X((L, t) => `${t('Finite', 'Terhingga')}, $n(${nm}) = ${s.l.length}$`), sp: 's' };
    },
    /* several membership statements */
    (r) => {
      const U = makeUni(r, r.pick(['num', 'let'])), [{ l }] = pick2(r, U, 1), nm = r.pick(SETN);
      const stm = r.sample(U.items, 4).map((x) => [x, l.includes(x)]);
      return { q: X((L, t) => `${t('Given', 'Diberi')} $${nm} = ${RO(l, L)}$. ${t('State whether each statement is true or false.', 'Nyatakan sama ada setiap pernyataan benar atau palsu.')} ${stm.map((z, i) => `(${'abcd'[i]}) $${E(z[0], L)} \\in ${nm}$`).join(' &emsp; ')}`), a: X((L, t) => stm.map((z, i) => `(${'abcd'[i]}) ${z[1] ? t('true', 'benar') : t('false', 'palsu')}`).join('; ')), sp: 's' };
    },
    /* count elements of a described set */
    (r) => {
      const k = r.int(3, 9), hi = k * r.int(4, 9) + r.int(0, k - 1), lo = 1, cnt = Math.floor(hi / k), nm = r.pick(SETN);
      return { q: X((L, t) => `${t('Set', 'Set')} $${nm} = \\{x : x \\text{ ${t('is a multiple of', 'ialah gandaan bagi')} } ${k},\\ ${lo} \\le x \\le ${hi}\\}$. ${t('Find', 'Cari')} $n(${nm})$ ${t('without listing all the elements, and state the greatest element.', 'tanpa menyenaraikan semua unsur, dan nyatakan unsur yang terbesar.')}`), a: X((L) => `$n(${nm}) = ${cnt}$; ${cnt * k}`), sp: 's' };
    },
    /* missing element */
    (r) => {
      const k = r.int(2, 7), N = k * r.int(5, 8), full = rng(1, N).filter((x) => x % k === 0), i = r.int(1, full.length - 2), nm = r.pick(SETN);
      const shown = full.map((z, j) => (j === i ? '\\square' : z));
      return { q: X((L, t) => `$${nm} = \\{x : x \\text{ ${t('is a multiple of', 'ialah gandaan bagi')} } ${k},\\ 1 \\le x \\le ${N}\\}$. ${t('Complete the roster form', 'Lengkapkan bentuk senarai')}: $${nm} = \\{${shown.join(',\\ ')}\\}$.`), a: X((L) => `$${full[i]}$`), sp: 'xs' };
    },
    /* letters of a word */
    (r) => {
      const W = ['MALAYSIA', 'KEMBOJA', 'BATIK', 'SEKOLAH', 'MATEMATIK', 'PAHANG', 'SARAWAK', 'TERENGGANU', 'KELANTAN', 'PERAK', 'SABAH'], w = r.pick(W), ls = [...new Set(w.split(''))], nm = r.pick(SETN);
      const V = ls.filter((c) => 'AEIOU'.includes(c));
      const f = r.int(0, 2);
      const q = [X((L, t) => `${t('Let', 'Katakan')} $${nm}$ ${t('be the set of different letters in the word', 'ialah set huruf yang berbeza dalam perkataan')} "${w}". ${t('List the elements of', 'Senaraikan unsur bagi')} $${nm}$ ${t('and find', 'dan cari')} $n(${nm})$.`), X((L, t) => `${t('How many different letters are in the word', 'Berapakah bilangan huruf yang berbeza dalam perkataan')} "${w}"? ${t('Write your answer as', 'Tulis jawapan anda sebagai')} $n(${nm})$.`), X((L, t) => `${t('Set', 'Set')} $${nm}$ ${t('contains the vowels in the word', 'mengandungi huruf vokal dalam perkataan')} "${w}" (${t('each letter listed once', 'setiap huruf disenaraikan sekali')}). ${t('Write', 'Tulis')} $${nm}$ ${t('in roster form.', 'dalam bentuk senarai.')}`)][f];
      const a = f === 2 ? X((L) => `$${nm} = ${RO(V.map((c) => c.toLowerCase()), L)}$`) : f === 1 ? X((L) => `$n(${nm}) = ${ls.length}$`) : X((L) => `$${nm} = ${RO(ls.map((c) => c.toLowerCase()), L)}$, $n(${nm}) = ${ls.length}$`);
      need(f !== 2 || V.length > 0);
      return { q, a, sp: 's' };
    },
    /* which set does x belong to */
    (r) => {
      const U = makeUni(r, 'num'), ps = pick2(r, U, 3), x = r.pick(U.items), a = ps.filter((z) => z.l.includes(x));
      return { q: X((L, t) => `${t('ξ is', 'ξ ialah')} ${U.xd[L]}. ${t('Set', 'Set')} $A$ = ${ps[0].p[L]}, $B$ = ${ps[1].p[L]}, $C$ = ${ps[2].p[L]}. ${t('Which of the sets', 'Set yang manakah antara')} $A$, $B$, $C$ ${t('contain the element', 'mengandungi unsur')} $${x}$?`), a: X((L, t) => a.length ? `${a.map((z) => 'ABC'[ps.indexOf(z)]).join(', ')}` : t('None of them', 'Tiada satu pun')), sp: 's' };
    },
  ];

  const a111 = [
    /* compare descriptions */
    (r) => {
      const s1 = nset(r, 3, 8), s2 = nset(r, 3, 8), [a, b] = nm2(r);
      need(s1.sb('en') !== s2.sb('en'));
      const eq = s1.l.join() === s2.l.join();
      return { q: X((L, t) => `${t('Set', 'Set')} $${a} = ${s1.sb(L)}$ ${t('and set', 'dan set')} $${b} = ${s2.sb(L)}$. ${t('List the elements of each set. Are they equal? Explain.', 'Senaraikan unsur bagi setiap set. Adakah kedua-duanya sama? Terangkan.')}`), a: X((L, t) => `$${a} = ${RO(s1.l, L)}$, $${b} = ${RO(s2.l, L)}$. ${eq ? t('Equal: they have exactly the same elements.', 'Sama: kedua-duanya mempunyai unsur yang betul-betul sama.') : t('Not equal: the elements are different.', 'Tidak sama: unsurnya berbeza.')}`), sp: 'm' };
    },
    /* least N */
    (r) => {
      const k = r.int(3, 8), c = r.int(4, 7), nm = r.pick(SETN);
      return { q: X((L, t) => `${t('Set', 'Set')} $${nm} = \\{x : x \\text{ ${t('is a multiple of', 'ialah gandaan bagi')} } ${k},\\ 1 \\le x \\le N\\}$ ${t('has', 'mempunyai')} ${c} ${t('elements. Find the least possible value of', 'unsur. Cari nilai minimum yang mungkin bagi')} $N$ ${t('and the greatest possible value of', 'dan nilai maksimum yang mungkin bagi')} $N$.`), a: X((L) => `$N_{\\min} = ${k * c}$, $N_{\\max} = ${k * (c + 1) - 1}$`), sp: 'm' };
    },
    /* equal sets, unknown */
    (r) => {
      const l = r.sample(rng(1, 15), 3), k = r.pick(rng(16, 30)), A = [l[0], l[1], 'k'], B = r.shuffle([l[1], l[0], k]), [a, b] = nm2(r);
      return { q: X((L, t) => `${t('Set', 'Set')} $${a} = \\{${A.join(',\\ ')}\\}$ ${t('and set', 'dan set')} $${b} = ${RO(B, L)}$. ${t('Given that', 'Diberi bahawa')} $${a} = ${b}$, ${t('find the value of', 'cari nilai')} $k$ ${t('and state', 'dan nyatakan')} $n(${a})$.`), a: X((L) => `$k = ${k}$, $n(${a}) = 3$`), sp: 's' };
    },
    /* {0} vs empty */
    (r) => {
      const a = r.int(1, 6);
      const F = [
        [X((L, t) => `${t('Is the set', 'Adakah set')} $\\{0\\}$ ${t('the empty set? Find its number of elements.', 'set kosong? Cari bilangan unsurnya.')}`), X((L, t) => `${t('No. It has one element, 0, so', 'Tidak. Ia mempunyai satu unsur, iaitu 0, maka')} $n(\\{0\\}) = 1$.`)],
        [X((L, t) => `${t('State', 'Nyatakan')} $n(\\varnothing)$ ${t('and', 'dan')} $n(\\{${a}\\})$. ${t('Are the two sets equal?', 'Adakah kedua-dua set itu sama?')}`), X((L, t) => `$n(\\varnothing) = 0$, $n(\\{${a}\\}) = 1$. ${t('They are not equal.', 'Kedua-duanya tidak sama.')}`)],
        [X((L, t) => `${t('Are the sets', 'Adakah set')} $\\{x : x \\text{ ${t('is an integer', 'ialah integer')}},\\ ${a} < x < ${a + 1}\\}$ ${t('and', 'dan')} $\\{x : x \\text{ ${t('is an integer', 'ialah integer')}},\\ ${a + 3} < x < ${a + 4}\\}$ ${t('equal? Explain.', 'sama? Terangkan.')}`), X((L, t) => `${t('Yes. Both are the empty set, so both have no elements.', 'Ya. Kedua-duanya ialah set kosong, maka kedua-duanya tiada unsur.')}`)],
      ];
      const [q, a0] = r.pick(F);
      return { q, a: a0, sp: 's' };
    },
    /* spot the error in a roster */
    (r) => {
      const nm = r.name(), F = [
        [X((L, t) => `\\{x : x \\text{ ${t('is a prime number', 'ialah nombor perdana')}},\\ x < 10\\}`), '1,\\ 2,\\ 3,\\ 5,\\ 7', X((L, t) => t('1 is not a prime number.', '1 bukan nombor perdana.')), '2,\\ 3,\\ 5,\\ 7'],
        [X((L, t) => `\\{x : x \\text{ ${t('is a multiple of', 'ialah gandaan bagi')} } 3,\\ 1 \\le x \\le 20\\}`), '3,\\ 6,\\ 9,\\ 12,\\ 15,\\ 18,\\ 21', X((L, t) => t('21 is greater than 20.', '21 lebih besar daripada 20.')), '3,\\ 6,\\ 9,\\ 12,\\ 15,\\ 18'],
        [X((L, t) => `\\{x : x \\text{ ${t('is a factor of', 'ialah faktor bagi')} } 12\\}`), '2,\\ 3,\\ 4,\\ 6,\\ 12', X((L, t) => t('1 is also a factor of 12.', '1 juga ialah faktor bagi 12.')), '1,\\ 2,\\ 3,\\ 4,\\ 6,\\ 12'],
        [X((L, t) => `\\{x : x \\text{ ${t('is an even number', 'ialah nombor genap')}},\\ 1 < x < 10\\}`), '2,\\ 4,\\ 6,\\ 8,\\ 10', X((L, t) => t('10 is not less than 10.', '10 tidak kurang daripada 10.')), '2,\\ 4,\\ 6,\\ 8'],
        [X((L, t) => `\\{x : x \\text{ ${t('is a factor of', 'ialah faktor bagi')} } 10\\}`), '1,\\ 2,\\ 5,\\ 10,\\ 10', X((L, t) => t('10 is written twice; each element is listed once.', '10 ditulis dua kali; setiap unsur disenaraikan sekali sahaja.')), '1,\\ 2,\\ 5,\\ 10'],
      ];
      const [s0, bad, why, good] = r.pick(F);
      return { q: X((L, t) => `${nm} ${t('wrote', 'menulis')} $${s0[L]} = \\{${bad}\\}$. ${t('Find the mistake and write the correct roster form.', 'Cari kesilapan itu dan tulis bentuk senarai yang betul.')}`), a: X((L, t) => `${why[L]} ${t('Correct', 'Betul')}: $\\{${good}\\}$.`), sp: 's' };
    },
    /* rank by number of elements */
    (r) => {
      const ss = [nset(r, 2, 10), nset(r, 2, 10), nset(r, 2, 10)];
      need(new Set(ss.map((z) => z.l.length)).size === 3 && new Set(ss.map((z) => z.w.en)).size === 3);
      const nms = ['A', 'B', 'C'], ord = ss.map((z, i) => [nms[i], z.l.length]).sort((p, q) => q[1] - p[1]);
      return { q: X((L, t) => `${t('Let', 'Katakan')} $A$ = ${ss[0].w[L]}, $B$ = ${ss[1].w[L]} ${t('and', 'dan')} $C$ = ${ss[2].w[L]}. ${t('Find', 'Cari')} $n(A)$, $n(B)$, $n(C)$ ${t('and arrange the sets from the one with the most elements to the least.', 'dan susun set itu daripada yang mempunyai unsur paling banyak kepada paling sedikit.')}`), a: X((L) => `$n(A) = ${ss[0].l.length}$, $n(B) = ${ss[1].l.length}$, $n(C) = ${ss[2].l.length}$; ${ord.map((z) => z[0]).join(', ')}`), sp: 'm' };
    },
    /* multi-part on one universe */
    (r) => {
      const U = makeUni(r), [{ p, l }] = pick2(r, U, 1), nm = r.pick(SETN), x = r.pick(U.items), y = r.pick(U.items.filter((z) => z !== x));
      return { q: X((L, t) => `${t('The universal set is', 'Set semesta ialah')} ${U.xd[L]}. ${t('Set', 'Set')} $${nm}$ = ${p[L]}. (a) ${t('List the elements of', 'Senaraikan unsur bagi')} $${nm}$. (b) ${t('Find', 'Cari')} $n(${nm})$. (c) ${t('State whether', 'Nyatakan sama ada')} $${E(x, L)} \\in ${nm}$ ${t('and whether', 'dan sama ada')} $${E(y, L)} \\in ${nm}$.`), a: X((L) => `(a) $${RO(l, L)}$ (b) $${l.length}$ (c) $${E(x, L)} ${l.includes(x) ? '\\in' : '\\notin'} ${nm}$; $${E(y, L)} ${l.includes(y) ? '\\in' : '\\notin'} ${nm}$`), sp: 'm' };
    },
    /* counting primes / factors */
    (r) => {
      const lo = r.int(1, 30), hi = lo + r.int(14, 26), l = rng(lo + 1, hi - 1).filter((x) => SPM.isPrime(x)), nm = r.pick(SETN);
      need(l.length >= 2);
      return { q: X((L, t) => `${t('Set', 'Set')} $${nm} = \\{x : ${lo} < x < ${hi},\\ x \\text{ ${t('is a prime number', 'ialah nombor perdana')}}\\}$. ${t('Find', 'Cari')} $n(${nm})$ ${t('and write down the sum of its elements.', 'dan tulis hasil tambah unsurnya.')}`), a: X((L) => `$${RO(l, L)}$; $n(${nm}) = ${l.length}$; ${l.reduce((p, q) => p + q, 0)}`), sp: 's' };
    },
    /* even factors etc: combined description */
    (r) => {
      const m = r.pick([24, 30, 36, 40, 48]), F = SPM.factors(m), k = r.pick([2, 3, 4]);
      const l = F.filter((x) => x % k === 0), nm = r.pick(SETN);
      need(l.length >= 2 && l.length < F.length);
      return { q: X((L, t) => `${t('Set', 'Set')} $${nm}$ ${t('contains the factors of', 'mengandungi faktor bagi')} ${m} ${t('that are multiples of', 'yang merupakan gandaan')} ${k}. ${t('Write', 'Tulis')} $${nm}$ ${t('in roster form and find', 'dalam bentuk senarai dan cari')} $n(${nm})$.`), a: X((L) => `$${nm} = ${RO(l, L)}$, $n(${nm}) = ${l.length}$`), sp: 's' };
    },
  ];
  SPM.extend('F1-11.1', { e: e111, m: m111, a: a111 });

  /* ================================================================ F1-11.2 .. 11.4 shared */
  const comp = (U, l) => U.items.filter((x) => !l.includes(x));
  const XI = (U, L) => `\\xi = ${RO(U.items, L)}`;
  const vfig = (U, l, shade) => S.venn1({ name: 'A', inA: l.map(lab), out: comp(U, l).map(lab), shade: shade || null });
  const XY = (t) => t; // (placeholder to keep helper list tidy)
  const two = (f1, f2) => {
    const inn = (f) => f.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    return S.wrap(560, 160, `${inn(f1)}<g transform="translate(285,0)">${inn(f2)}</g>` + S.text(8, 150, '(i)', { a: 'start', s: 12 }) + S.text(293, 150, '(ii)', { a: 'start', s: 12 }), 'Venn diagrams');
  };
  const nest = (r) => {
    const N = r.pick([12, 15, 16, 18, 20, 24]), [kb, ka] = r.pick([[2, 4], [3, 6], [2, 6], [3, 9], [5, 10], [2, 8], [4, 8]]), items = rng(1, N);
    const B = items.filter((x) => x % kb === 0), A = items.filter((x) => x % ka === 0), mid = B.filter((x) => !A.includes(x)), out = items.filter((x) => !B.includes(x));
    need(A.length >= 2 && A.length <= 4 && mid.length >= 1 && mid.length <= 5 && out.length >= 1 && out.length <= 9);
    return { N, kb, ka, items, A, B, mid, out };
  };
  const nfig = (z) => S.vennNested({ names: ['A', 'B'], inner: z.A, mid: z.mid, out: z.out });
  const nxi = (z) => `\\xi = \\{x : x \\text{ %s},\\ 1 \\le x \\le ${z.N}\\}`;
  const nxiT = (z) => X((L, t) => nxi(z).replace('%s', t('is an integer', 'ialah integer')));
  const nA = (z) => X((L, t) => t(`multiples of ${z.ka}`, `gandaan bagi ${z.ka}`)), nB = (z) => X((L, t) => t(`multiples of ${z.kb}`, `gandaan bagi ${z.kb}`));
  const useFig = (U) => U.fig;
  const numFig = (r) => makeUni(r, r.pick(['num', 'num', 'let']));

  /* ================================================================ F1-11.2 */
  const e112 = [
    /* list A' */
    (r) => {
      const U = makeUni(r), [{ l }] = pick2(r, U, 1), nm = r.pick(SETN), c = comp(U, l);
      const q = r.pick([
        X((L, t) => `$${XI(U, L)}$ ${t('and', 'dan')} $${nm} = ${RO(l, L)}$. ${t('List the elements of', 'Senaraikan unsur bagi')} $${nm}'$.`),
        X((L, t) => `${t('Given the universal set', 'Diberi set semesta')} $${XI(U, L)}$ ${t('and set', 'dan set')} $${nm} = ${RO(l, L)}$, ${t('write down', 'tulis')} $${nm}'$.`),
        X((L, t) => `${t('Find the complement of', 'Cari pelengkap bagi')} $${nm} = ${RO(l, L)}$ ${t('in the universal set', 'dalam set semesta')} $${XI(U, L)}$.`),
      ]);
      return { q, a: X((L) => `$${nm}' = ${RO(c, L)}$`), sp: 's' };
    },
    /* n(A') */
    (r) => {
      const U = makeUni(r), [{ l }] = pick2(r, U, 1), nm = r.pick(SETN);
      return { q: X((L, t) => `$${XI(U, L)}$, $${nm} = ${RO(l, L)}$. ${t('Find', 'Cari')} $n(${nm}')$.`), a: X((L) => `$n(${nm}') = ${U.items.length - l.length}$`), sp: 'xs' };
    },
    /* A' from description */
    (r) => {
      const U = makeUni(r), [{ p, l }] = pick2(r, U, 1), nm = r.pick(SETN), c = comp(U, l);
      return { q: X((L, t) => `${t('The universal set is', 'Set semesta ialah')} ${U.xd[L]}. ${t('Set', 'Set')} $${nm}$ ${t('is the set of', 'ialah set')} ${p[L]}. ${t('List the elements of', 'Senaraikan unsur bagi')} $${nm}'$.`), a: X((L) => `$${nm}' = ${RO(c, L)}$`), sp: 's' };
    },
    /* n(xi), n(A) -> n(A') */
    (r) => {
      const a = r.int(10, 40), b = r.int(3, a - 3), nm = r.pick(SETN);
      const f = r.int(0, 2);
      const q = [X((L, t) => `${t('In a universal set', 'Dalam set semesta')} $\\xi$, $n(\\xi) = ${a}$ ${t('and', 'dan')} $n(${nm}) = ${b}$. ${t('Find', 'Cari')} $n(${nm}')$.`), X((L, t) => `$n(\\xi) = ${a}$, $n(${nm}') = ${a - b}$. ${t('Find', 'Cari')} $n(${nm})$.`), X((L, t) => `$n(${nm}) = ${b}$ ${t('and', 'dan')} $n(${nm}') = ${a - b}$. ${t('Find', 'Cari')} $n(\\xi)$.`)][f];
      return { q, a: X((L) => f === 0 ? `$${a - b}$` : f === 1 ? `$${b}$` : `$${a}$`), sp: 'xs' };
    },
    /* choose an appropriate universal set */
    (r) => {
      const U = makeUni(r, r.pick(['num', 'let'])), [{ l }] = pick2(r, U, 1), nm = r.pick(SETN);
      const good = U.items, bad1 = U.items.filter((x) => x !== l[0]), bad2 = l.slice(0, -1);
      const o = r.shuffle([[good, 1], [bad1, 0], [bad2, 0]]);
      return { q: X((L, t) => `${t('Set', 'Set')} $${nm} = ${RO(l, L)}$. ${t('Which of the following can be the universal set', 'Yang manakah antara berikut boleh menjadi set semesta')} $\\xi$ ${t('so that', 'supaya')} $${nm}$ ${t('is a set inside it?', 'ialah set di dalamnya?')}<br>${o.map((z, i) => `(${AB[i]}) $${RO(z[0], L)}$`).join('<br>')}`), a: X((L) => `${AB[o.findIndex((z) => z[1])]}: $${RO(good, L)}$`), sp: 's' };
    },
    /* membership in A' */
    (r) => {
      const U = makeUni(r), [{ l }] = pick2(r, U, 1), nm = r.pick(SETN), c = comp(U, l), x = r.pick(U.items), yes = c.includes(x);
      return { q: X((L, t) => `$${XI(U, L)}$, $${nm} = ${RO(l, L)}$. ${t('Is', 'Adakah')} $${E(x, L)} \\in ${nm}'$? ${t('Explain.', 'Terangkan.')}`), a: X((L, t) => yes ? `${t('Yes: it is in', 'Ya: ia ada dalam')} $\\xi$ ${t('but not in', 'tetapi tiada dalam')} $${nm}$.` : `${t('No: it is in', 'Tidak: ia ada dalam')} $${nm}$, ${t('so it is not in', 'maka ia tiada dalam')} $${nm}'$.`), sp: 's' };
    },
    /* meaning / notation */
    (r) => {
      const nm = r.pick(SETN), F = [
        [X((L, t) => `${t('What does', 'Apakah maksud')} $${nm}'$ ${t('mean?', '?')}`), X((L, t) => t(`The set of all elements in the universal set that are not in ${nm}.`, `Set semua unsur dalam set semesta yang tidak berada dalam ${nm}.`))],
        [X((L, t) => `${t('What symbol is used for the universal set?', 'Apakah simbol yang digunakan bagi set semesta?')}`), X(() => '$\\xi$')],
        [X((L, t) => `${t('True or false: an element can belong to both', 'Benar atau palsu: suatu unsur boleh tergolong dalam kedua-dua')} $${nm}$ ${t('and', 'dan')} $${nm}'$.`), X((L, t) => t('False: an element of ξ is either in the set or in its complement, never both.', 'Palsu: unsur dalam ξ sama ada dalam set itu atau dalam pelengkapnya, tidak kedua-duanya.'))],
        [X((L, t) => `${t('True or false: every element of', 'Benar atau palsu: setiap unsur')} $${nm}'$ ${t('is an element of', 'ialah unsur bagi')} $\\xi$.`), X((L, t) => t('True.', 'Benar.'))],
      ];
      const [q, a] = r.pick(F);
      return { q, a, sp: 'xs' };
    },
    /* read A' from a diagram */
    (r) => {
      const U = numFig(r), [{ l }] = pick2(r, U, 1), c = comp(U, l);
      return { fig: vfig(U, l), q: X((L, t) => t("List the elements of A′ using the Venn diagram.", "Senaraikan unsur bagi A′ menggunakan gambar rajah Venn.")), a: X((L) => `$A' = ${RO(c, L)}$`), sp: 's' };
    },
    /* table: in A? in A'? */
    (r) => {
      const U = makeUni(r, r.pick(['num', 'let'])), [{ l }] = pick2(r, U, 1), x = r.sample(U.items, 4).sort((p, q) => U.items.indexOf(p) - U.items.indexOf(q));
      const tb = (L) => SPM.table(x.map((z) => [`$${E(z, L)}$`, '', '']), { head: [X((L2, t) => t('Element', 'Unsur'))[L], `$\\in A$ / $\\notin A$`, `$\\in A'$ / $\\notin A'$`] });
      return { q: X((L, t) => `$${XI(U, L)}$, $A = ${RO(l, L)}$. ${t("Complete the table with ∈ or ∉.", "Lengkapkan jadual dengan ∈ atau ∉.")}<br>${tb(L)}`), a: X((L) => x.map((z) => `$${E(z, L)}$: $${l.includes(z) ? '\\in A,\\ \\notin A\'' : '\\notin A,\\ \\in A\''}$`).join('; ')), sp: 's' };
    },
    /* counts */
    (r) => {
      const U = makeUni(r), [{ l }] = pick2(r, U, 1);
      return { q: X((L, t) => `$${XI(U, L)}$, $A = ${RO(l, L)}$. ${t("Find $n(\\xi)$, $n(A)$ and $n(A')$.", "Cari $n(\\xi)$, $n(A)$ dan $n(A')$.")}`), a: X((L) => `$n(\\xi) = ${U.items.length}$, $n(A) = ${l.length}$, $n(A') = ${U.items.length - l.length}$`), sp: 's' };
    },
    /* choose the correct complement */
    (r) => {
      const U = makeUni(r), [{ l }] = pick2(r, U, 1), c = comp(U, l);
      const w = [l, c.slice(1), c.concat([l[0]])], o = r.shuffle([c].concat(w));
      need(new Set(o.map((z) => z.map(lab).join())).size === 4);
      return { q: X((L, t) => `$${XI(U, L)}$, $A = ${RO(l, L)}$. ${t("Which of the following is $A'$?", "Yang manakah ialah $A'$?")}<br>${o.map((z, i) => `(${AB[i]}) $${RO(z, L)}$`).join('<br>')}`), a: X((L) => `${AB[o.indexOf(c)]}: $${RO(c, L)}$`), sp: 's' };
    },
    /* names: boys and girls */
    (r) => {
      const bs = r.sample(SPM.BOYS, r.int(2, 4)), gs = r.sample(SPM.GIRLS, r.int(2, 4)), all = r.shuffle(bs.concat(gs)), boys = r.chance();
      const l = all.filter((x) => (boys ? bs : gs).includes(x)), c = all.filter((x) => !l.includes(x));
      const R = (z) => `\\{${z.map((v) => `\\text{${v}}`).join(',\\ ')}\\}`;
      return { q: X((L, t) => `${t('The universal set', 'Set semesta')} $\\xi = ${R(all)}$ ${t('is a group of children. Set', 'ialah sekumpulan kanak-kanak. Set')} $A$ ${t('is the set of', 'ialah set')} ${boys ? t('boys', 'murid lelaki') : t('girls', 'murid perempuan')}. ${t('List the elements of', 'Senaraikan unsur bagi')} $A'$ ${t('and state what it represents.', 'dan nyatakan apa yang diwakilinya.')}`), a: X((L, t) => `$A' = ${R(c)}$ (${boys ? t('the girls', 'murid perempuan') : t('the boys', 'murid lelaki')})`), sp: 's' };
    },
    /* fill in the blank */
    (r) => {
      const nm = r.pick(SETN), F = [
        [X((L, t) => t(`The complement of ${nm}, written ${nm}′, contains the elements of ____ that are not in ${nm}.`, `Pelengkap bagi ${nm}, ditulis ${nm}′, mengandungi unsur ____ yang tidak berada dalam ${nm}.`)), X((L, t) => t('the universal set ξ', 'set semesta ξ'))],
        [X((L, t) => t(`If $n(\\xi) = 9$ and $n(${nm}) = 4$, then $n(${nm}') =$ ____.`, `Jika $n(\\xi) = 9$ dan $n(${nm}) = 4$, maka $n(${nm}') =$ ____.`)), X((L) => '$5$')],
        [X((L, t) => t(`Every element of the universal set is in ${nm} or in ____.`, `Setiap unsur dalam set semesta berada dalam ${nm} atau dalam ____.`)), X((L) => `$${nm}'$`)],
      ];
      const [q, a] = r.pick(F);
      return { q, a, sp: 'xs' };
    },
  ];

  const m112 = [
    /* infer xi from rule then A' */
    (r) => {
      const U = makeUni(r, 'num'), [{ p, l }] = pick2(r, U, 1), nm = r.pick(SETN), c = comp(U, l);
      return { q: X((L, t) => `$\\xi = ${U.xsb}$ ${t('and', 'dan')} $${nm}$ ${t('is the set of', 'ialah set')} ${p[L]}. ${t('List the elements of', 'Senaraikan unsur bagi')} $${nm}'$ ${t('and find', 'dan cari')} $n(${nm}')$.`.replace(U.xsb, L === 'en' ? U.xsb : U.xsbm)), a: X((L) => `$${nm}' = ${RO(c, L)}$, $n(${nm}') = ${c.length}$`), sp: 'm' };
    },
    /* Venn -> A, A' */
    (r) => {
      const U = numFig(r), [{ l }] = pick2(r, U, 1), c = comp(U, l);
      return { fig: vfig(U, l), q: X((L, t) => t('The Venn diagram shows the universal set ξ and set A. List the elements of (a) A, (b) A′ and state (c) n(A′).', 'Gambar rajah Venn menunjukkan set semesta ξ dan set A. Senaraikan unsur bagi (a) A, (b) A′ dan nyatakan (c) n(A′).')), a: X((L) => `(a) $${RO(l, L)}$ (b) $${RO(c, L)}$ (c) $${c.length}$`), sp: 's' };
    },
    /* find A from A' */
    (r) => {
      const U = makeUni(r), [{ l }] = pick2(r, U, 1), nm = r.pick(SETN), c = comp(U, l);
      return { q: X((L, t) => `$${XI(U, L)}$ ${t('and', 'dan')} $${nm}' = ${RO(c, L)}$. ${t('Find the set', 'Cari set')} $${nm}$ ${t('and state', 'dan nyatakan')} $n(${nm})$.`), a: X((L) => `$${nm} = ${RO(l, L)}$, $n(${nm}) = ${l.length}$`), sp: 's' };
    },
    /* statements about A' */
    (r) => {
      const U = makeUni(r), [{ l }] = pick2(r, U, 1), nm = r.pick(SETN), c = comp(U, l), x = r.sample(U.items, 4);
      return { q: X((L, t) => `$${XI(U, L)}$, $${nm} = ${RO(l, L)}$. ${t('State whether each is true or false.', 'Nyatakan sama ada setiap pernyataan benar atau palsu.')} ${x.map((z, i) => `(${'abcd'[i]}) $${E(z, L)} \\in ${nm}'$`).join(' &emsp; ')}`), a: X((L, t) => x.map((z, i) => `(${'abcd'[i]}) ${c.includes(z) ? t('true', 'benar') : t('false', 'palsu')}`).join('; ')), sp: 's' };
    },
    /* n(A) from n(xi) and n(A') with description */
    (r) => {
      const U = makeUni(r, 'num'), [{ p, l }] = pick2(r, U, 1), c = comp(U, l), nm = r.pick(SETN);
      return { q: X((L, t) => `${t('The universal set', 'Set semesta')} $\\xi$ ${t('is', 'ialah')} ${U.xd[L]}. ${t('Set', 'Set')} $${nm}'$ ${t('has', 'mempunyai')} ${c.length} ${t('elements. How many elements does', 'unsur. Berapakah bilangan unsur bagi set')} $${nm}$ ${t('have?', '?')}`), a: X((L) => `${l.length}`), sp: 's' };
    },
    /* choose xi for two sets */
    (r) => {
      const U = makeUni(r, 'num'), ps = pick2(r, U, 2), [a, b] = nm2(r);
      const sizeOK = U.items.length, opt = [[U.items, 1], [U.items.slice(0, -3), 0], [rng(2, U.items.length + 3), 0]];
      const covers = (z) => ps.every((q) => q.l.every((x) => z.includes(x)));
      const o = r.shuffle(opt);
      const good = o.filter((z) => covers(z[0]));
      need(good.length === 1 && good[0][0] === U.items);
      return { q: X((L, t) => `${t('Set', 'Set')} $${a} = ${RO(ps[0].l, L)}$ ${t('and set', 'dan set')} $${b} = ${RO(ps[1].l, L)}$ ${t('are both subsets of the universal set', 'kedua-duanya ialah subset bagi set semesta')} $\\xi$ ${t('whose elements are the integers from 1 to', 'yang unsurnya integer dari 1 hingga')} ${U.items.length}. ${t('Which set below is', 'Set yang manakah di bawah ialah')} $\\xi$?<br>${o.map((z, i) => `(${AB[i]}) $${RO(z[0], L)}$`).join('<br>')}`), a: X((L) => `${AB[o.findIndex((z) => z[1])]}: $${RO(U.items, L)}$`), sp: 's' };
    },
    /* compare n of two complements */
    (r) => {
      const U = makeUni(r, 'num'), ps = pick2(r, U, 2);
      need(ps[0].l.length !== ps[1].l.length);
      const na = U.items.length - ps[0].l.length, nb = U.items.length - ps[1].l.length;
      return { q: X((L, t) => `$${XI(U, L)}$. ${t('Set', 'Set')} $A$ = ${ps[0].p[L]}, ${t('set', 'set')} $B$ = ${ps[1].p[L]}. ${t('Find', 'Cari')} $n(A')$ ${t('and', 'dan')} $n(B')$. ${t('Which complement has more elements?', 'Pelengkap yang manakah mempunyai lebih banyak unsur?')}`), a: X((L, t) => `$n(A') = ${na}$, $n(B') = ${nb}$; ${na > nb ? "$A'$" : "$B'$"} ${t('has more elements', 'mempunyai lebih banyak unsur')}`), sp: 'm' };
    },
    /* complement of description from word context */
    (r) => {
      const U = makeUni(r, r.pick(['day', 'month', 'shape'])), [{ p, l }] = pick2(r, U, 1), c = comp(U, l), nm = r.pick(SETN);
      return { q: X((L, t) => `${t('Let the universal set be', 'Katakan set semesta ialah')} ${U.xd[L]}. ${t('Set', 'Set')} $${nm}$ = ${p[L]}. ${t('Write down', 'Tulis')} $${nm}'$ ${t('and find', 'dan cari')} $n(${nm}')$.`), a: X((L) => `$${nm}' = ${RO(c, L)}$, $n(${nm}') = ${c.length}$`), sp: 's' };
    },
    /* word problem: counting the complement */
    (r) => {
      const tot = r.int(20, 45), a = r.int(6, tot - 6), CT = [
        ['A class has {T} students. {a} of them wear glasses. Let ξ be the set of students in the class and A the set of students who wear glasses. Find n(A′) and describe A′ in words.', 'Sebuah kelas mempunyai {T} orang murid. {a} orang daripadanya memakai cermin mata. Katakan ξ ialah set murid dalam kelas itu dan A ialah set murid yang memakai cermin mata. Cari n(A′) dan huraikan A′ dalam perkataan.', 'students who do not wear glasses', 'murid yang tidak memakai cermin mata'],
        ['A school has {T} teachers. {a} of them teach Science. Let ξ be the set of teachers and A the set of teachers who teach Science. Find n(A′) and describe A′.', 'Sebuah sekolah mempunyai {T} orang guru. {a} orang daripadanya mengajar Sains. Katakan ξ ialah set guru dan A ialah set guru yang mengajar Sains. Cari n(A′) dan huraikan A′.', 'teachers who do not teach Science', 'guru yang tidak mengajar Sains'],
        ['A stall has {T} durians. {a} of them are ripe. Let ξ be the set of durians and A the set of ripe durians. Find n(A′) and describe A′.', 'Sebuah gerai mempunyai {T} biji durian. {a} biji daripadanya sudah masak. Katakan ξ ialah set durian dan A ialah set durian yang masak. Cari n(A′) dan huraikan A′.', 'durians that are not ripe', 'durian yang belum masak'],
        ['A club has {T} members. {a} of them play chess. Let ξ be the set of members and A the set of members who play chess. Find n(A′) and describe A′.', 'Sebuah kelab mempunyai {T} orang ahli. {a} orang daripadanya bermain catur. Katakan ξ ialah set ahli dan A ialah set ahli yang bermain catur. Cari n(A′) dan huraikan A′.', 'members who do not play chess', 'ahli yang tidak bermain catur'],
        ['A bus carries {T} passengers. {a} of them are children. Let ξ be the set of passengers and A the set of children. Find n(A′) and describe A′.', 'Sebuah bas membawa {T} orang penumpang. {a} orang daripadanya kanak-kanak. Katakan ξ ialah set penumpang dan A ialah set kanak-kanak. Cari n(A′) dan huraikan A′.', 'passengers who are not children', 'penumpang yang bukan kanak-kanak'],
        ['A bakery baked {T} loaves of bread. {a} loaves were sold. Let ξ be the set of loaves baked and A the set of loaves sold. Find n(A′) and describe A′.', 'Sebuah kedai roti membakar {T} keping roti. {a} keping telah dijual. Katakan ξ ialah set roti yang dibakar dan A ialah set roti yang dijual. Cari n(A′) dan huraikan A′.', 'loaves that were not sold', 'roti yang tidak dijual'],
      ];
      const c = r.pick(CT), f = (z) => z.replace('{T}', tot).replace('{a}', a);
      return { q: T(f(c[0]), f(c[1])), a: T(`$n(A') = ${tot - a}$; ${c[2]}`, `$n(A') = ${tot - a}$; ${c[3]}`), sp: 's' };
    },
    /* correct statement about complements (MCQ) */
    (r) => {
      const U = makeUni(r), [{ l }] = pick2(r, U, 1), c = comp(U, l), nm = r.pick(SETN);
      const S1 = [[`n(${nm}) + n(${nm}') = n(\\xi)`, 1], [`n(${nm}) = n(${nm}')`, 0], [`${nm} \\text{ and } ${nm}' \\text{ share an element}`, 0], [`${nm}' \\text{ contains only elements of } \\xi`, 1], [`n(${nm}') > n(\\xi)`, 0]];
      const g = r.pick(S1.filter((z) => z[1])), w = r.sample(S1.filter((z) => !z[1]), 2), o = r.shuffle([g].concat(w));
      return { q: X((L, t) => `${t('Which statement about', 'Pernyataan yang manakah tentang')} $${nm}$ ${t('and its complement', 'dan pelengkapnya')} $${nm}'$ ${t('is always true?', 'sentiasa benar?')}<br>${o.map((z, i) => `(${AB[i]}) $${z[0]}$`).join('<br>')}`), a: X((L) => `${AB[o.indexOf(g)]}: $${g[0]}$`), sp: 's' };
    },
  ];

  const a112 = [
    /* unknown set from complement described by a rule */
    (r) => {
      const U = makeUni(r, 'num'), [{ p, l }] = pick2(r, U, 1), c = comp(U, l), nm = r.pick(SETN);
      return { q: X((L, t) => `${t('The universal set is', 'Set semesta ialah')} ${U.xd[L]}. ${t('Set', 'Set')} $${nm}'$ ${t('is the set of', 'ialah set')} ${p[L]}. ${t('Find', 'Cari')} $${nm}$ ${t('and', 'dan')} $n(${nm})$.`), a: X((L) => `$${nm} = ${RO(comp(U, l), L)}$, $n(${nm}) = ${comp(U, l).length}$`), sp: 'm' };
    },
    /* compare two complements */
    (r) => {
      const U = makeUni(r, 'num'), ps = pick2(r, U, 2), ca = comp(U, ps[0].l), cb = comp(U, ps[1].l);
      return { q: X((L, t) => `$${XI(U, L)}$. ${t('Set', 'Set')} $A$ = ${ps[0].p[L]}, ${t('set', 'set')} $B$ = ${ps[1].p[L]}. ${t("Find $A'$ and $B'$. Are they equal sets? Explain.", "Cari $A'$ dan $B'$. Adakah kedua-duanya set yang sama? Terangkan.")}`), a: X((L, t) => `$A' = ${RO(ca, L)}$, $B' = ${RO(cb, L)}$. ${ca.join() === cb.join() ? t('Equal.', 'Sama.') : t('Not equal: the elements differ.', 'Tidak sama: unsurnya berbeza.')}`), sp: 'm' };
    },
    /* unknown element k */
    (r) => {
      const N = r.int(9, 14), U = { items: rng(1, N) }, l = r.sample(U.items, 4).sort((p, q) => p - q), k = r.pick(l), nm = r.pick(SETN);
      const A = l.map((z) => (z === k ? 'k' : z));
      const c = comp(U, l);
      return { q: X((L, t) => `$\\xi = ${RO(U.items, L)}$, $${nm} = \\{${A.join(',\\ ')}\\}$ ${t('and', 'dan')} $${nm}' = ${RO(c, L)}$. ${t('Find the value of', 'Cari nilai')} $k$.`), a: X((L) => `$k = ${k}$`), sp: 's' };
    },
    /* special cases */
    (r) => {
      const U = makeUni(r, 'num'), nm = r.pick(SETN);
      const F = [
        [X((L, t) => `$${XI(U, L)}$. ${t('If', 'Jika')} $${nm} = \\xi$, ${t('what is', 'apakah')} $${nm}'$? ${t('Find', 'Cari')} $n(${nm}')$.`), X((L, t) => `$${nm}' = \\varnothing$, $n(${nm}') = 0$`)],
        [X((L, t) => `$${XI(U, L)}$. ${t('If', 'Jika')} $${nm} = \\varnothing$, ${t('what is', 'apakah')} $${nm}'$? ${t('Find', 'Cari')} $n(${nm}')$.`), X((L, t) => `$${nm}' = \\xi$, $n(${nm}') = ${U.items.length}$`)],
      ];
      const [q, a] = r.pick(F);
      return { q, a, sp: 's' };
    },
    /* error spotting */
    (r) => {
      const U = makeUni(r, 'num'), [{ l }] = pick2(r, U, 1), c = comp(U, l), nm = r.pick(SETN), nn = r.name();
      const wrong = c.slice(1), miss = c[0];
      return { q: X((L, t) => `$${XI(U, L)}$, $${nm} = ${RO(l, L)}$. ${nn} ${t('wrote', 'menulis')} $${nm}' = ${RO(wrong, L)}$. ${t('Find the mistake and write the correct', 'Cari kesilapan itu dan tulis')} $${nm}'$.`), a: X((L, t) => `${t('The element', 'Unsur')} $${E(miss, L)}$ ${t('is in', 'ada dalam')} $\\xi$ ${t('but not in', 'tetapi tiada dalam')} $${nm}$, ${t('so it belongs to', 'maka ia tergolong dalam')} $${nm}'$. $${nm}' = ${RO(c, L)}$.`), sp: 's' };
    },
    /* Venn diagram + description of complement */
    (r) => {
      const U = makeUni(r, 'num'), [{ p, l }] = pick2(r, U, 1), c = comp(U, l);
      return { fig: vfig(U, l), q: X((L, t) => t('The Venn diagram shows ξ and set A. (a) List the elements of A′. (b) Describe A′ in words (for example, as a set of multiples, factors or primes).', 'Gambar rajah Venn menunjukkan ξ dan set A. (a) Senaraikan unsur bagi A′. (b) Huraikan A′ dalam perkataan (contohnya, sebagai set gandaan, faktor atau nombor perdana).')), a: X((L, t) => `(a) $${RO(c, L)}$ (b) ${t('A is the set of', 'A ialah set')} ${p[L]}; ${t('so A′ is the set of the other elements of ξ', 'maka A′ ialah set unsur lain dalam ξ')}`), sp: 'm' };
    },
    /* multi-part */
    (r) => {
      const U = makeUni(r), ps = pick2(r, U, 1), { p, l } = ps[0], c = comp(U, l), nm = r.pick(SETN), x = r.pick(U.items);
      return { q: X((L, t) => `${t('The universal set is', 'Set semesta ialah')} ${U.xd[L]}. ${t('Set', 'Set')} $${nm}$ = ${p[L]}. (a) ${t('List', 'Senaraikan')} $${nm}$. (b) ${t('List', 'Senaraikan')} $${nm}'$. (c) ${t('Find', 'Cari')} $n(${nm}) + n(${nm}')$ ${t('and compare it with', 'dan bandingkan dengan')} $n(\\xi)$. (d) ${t('Is', 'Adakah')} $${E(x, L)} \\in ${nm}'$?`), a: X((L, t) => `(a) $${RO(l, L)}$ (b) $${RO(c, L)}$ (c) $${l.length} + ${c.length} = ${U.items.length} = n(\\xi)$ (d) ${c.includes(x) ? t('yes', 'ya') : t('no', 'tidak')}`), sp: 'l' };
    },
    /* find N */
    (r) => {
      const k = r.int(3, 6), cnt = r.int(3, 6), N = k * cnt + r.int(0, k - 1), nm = r.pick(SETN), nc = N - cnt;
      return { q: X((L, t) => `$\\xi = \\{x : x \\text{ ${t('is an integer', 'ialah integer')}},\\ 1 \\le x \\le N\\}$, ${t('and', 'dan')} $${nm}$ ${t('is the set of multiples of', 'ialah set gandaan bagi')} ${k} ${t('in', 'dalam')} $\\xi$. ${t('Given that', 'Diberi bahawa')} $n(${nm}) = ${cnt}$ ${t('and', 'dan')} $n(${nm}') = ${nc}$, ${t('find', 'cari')} $N$.`), a: X((L) => `$N = ${cnt} + ${nc} = ${N}$`), sp: 's' };
    },
  ];
  SPM.extend('F1-11.2', { e: e112, m: m112, a: a112 });

  /* ================================================================ F1-11.3 */
  const sub2 = (r, l, k) => l.length > k ? r.sample(l, k).sort((p, q) => l.indexOf(p) - l.indexOf(q)) : l.slice();
  /** a pair A, B (same universe) with A inside B or not */
  const abPair = (r, inside) => {
    const U = makeUni(r, r.pick(['num', 'num', 'let'])), N = U.items.length, B = sub2(r, U.items, r.int(5, Math.min(8, N - 2)));
    let A;
    if (inside) A = sub2(r, B, r.int(2, B.length - 1));
    else { const out = U.items.filter((x) => !B.includes(x)); A = sub2(r, B, r.int(1, 3)).concat([r.pick(out)]); A.sort((p, q) => U.items.indexOf(p) - U.items.indexOf(q)); }
    return { U, A, B, bad: A.find((x) => !B.includes(x)) };
  };
  const SUBQ = [
    (a, b, A, B, L, t) => `$${a} = ${RO(A, L)}$ ${t('and', 'dan')} $${b} = ${RO(B, L)}$. ${t('Is', 'Adakah')} $${a} \\subseteq ${b}$? ${t('Give a reason.', 'Berikan sebab.')}`,
    (a, b, A, B, L, t) => `${t('Given', 'Diberi')} $${a} = ${RO(A, L)}$ ${t('and', 'dan')} $${b} = ${RO(B, L)}$, ${t('determine whether', 'tentukan sama ada')} $${a}$ ${t('is a subset of', 'ialah subset bagi')} $${b}$.`,
    (a, b, A, B, L, t) => `${t('Decide whether every element of', 'Tentukan sama ada setiap unsur')} $${a} = ${RO(A, L)}$ ${t('is in', 'terdapat dalam')} $${b} = ${RO(B, L)}$. ${t('Then write', 'Kemudian tulis')} $${a} \\subseteq ${b}$ ${t('or', 'atau')} $${a} \\nsubseteq ${b}$.`,
    (a, b, A, B, L, t) => `${t('True or false', 'Benar atau palsu')}: $${a} \\subseteq ${b}$, ${t('where', 'dengan')} $${a} = ${RO(A, L)}$ ${t('and', 'dan')} $${b} = ${RO(B, L)}$.`,
  ];
  const e113 = [
    /* is A subset of B */
    (r) => {
      const z = abPair(r, r.chance()), [a, b] = nm2(r), inside = !z.bad, f = r.pick(SUBQ);
      return { q: X((L, t) => f(a, b, z.A, z.B, L, t)), a: X((L, t) => inside ? `${t('Yes: every element of', 'Ya: setiap unsur')} $${a}$ ${t('is also in', 'juga terdapat dalam')} $${b}$.` : `${t('No: ', 'Tidak: ')}$${E(z.bad, L)} \\in ${a}$ ${t('but', 'tetapi')} $${E(z.bad, L)} \\notin ${b}$.`), sp: 's' };
    },
    /* fill in the symbol */
    (r) => {
      const z = abPair(r, r.chance()), [a, b] = nm2(r), inside = !z.bad;
      return { q: X((L, t) => `${t('Fill in the blank with', 'Isi tempat kosong dengan')} $\\subseteq$ ${t('or', 'atau')} $\\nsubseteq$: $${RO(z.A, L)}\\ \\square\\ ${RO(z.B, L)}$.`), a: X((L) => `$${RO(z.A, L)} ${inside ? '\\subseteq' : '\\nsubseteq'} ${RO(z.B, L)}$`), sp: 'xs' };
    },
    /* which is a subset (MCQ) */
    (r) => {
      const U = makeUni(r, r.pick(['num', 'let'])), B = sub2(r, U.items, 6), out = U.items.filter((x) => !B.includes(x)), nm = r.pick(SETN);
      need(out.length >= 2);
      const good = sub2(r, B, 3), w = [good.slice(0, 2).concat([out[0]]), [out[0], out[1]], B.slice(1, 3).concat([out[1]])].map((z) => z);
      const o = r.shuffle([good].concat(w));
      return { q: X((L, t) => `$${nm} = ${RO(B, L)}$. ${t('Which of the following sets is a subset of', 'Yang manakah antara set berikut ialah subset bagi')} $${nm}$?<br>${o.map((z, i) => `(${AB[i]}) $${RO(z, L)}$`).join('<br>')}`), a: X((L) => `${AB[o.indexOf(good)]}: $${RO(good, L)}$`), sp: 's' };
    },
    /* notation */
    (r) => {
      const [a, b] = nm2(r), F = [
        [X((L, t) => t(`Write "${a} is a subset of ${b}" using symbols.`, `Tulis "${a} ialah subset bagi ${b}" menggunakan simbol.`)), `$${a} \\subseteq ${b}$`],
        [X((L, t) => t(`Write "${a} is not a subset of ${b}" using symbols.`, `Tulis "${a} bukan subset bagi ${b}" menggunakan simbol.`)), `$${a} \\nsubseteq ${b}$`],
        [X((L, t) => t(`Read $${a} \\subseteq ${b}$ in words.`, `Baca $${a} \\subseteq ${b}$ dalam perkataan.`)), X((L, t) => t(`${a} is a subset of ${b}: every element of ${a} is an element of ${b}.`, `${a} ialah subset bagi ${b}: setiap unsur ${a} ialah unsur ${b}.`))],
        [X((L, t) => t(`Which symbol is used for "is an element of" and which for "is a subset of"?`, `Apakah simbol bagi "ialah unsur bagi" dan apakah simbol bagi "ialah subset bagi"?`)), '$\\in$; $\\subseteq$'],
      ];
      const [q, an] = r.pick(F);
      return { q, a: typeof an === 'string' ? T(an) : an, sp: 'xs' };
    },
    /* A subset of xi / description based */
    (r) => {
      const U = makeUni(r, 'num'), [{ p, l }] = pick2(r, U, 1), nm = r.pick(SETN);
      return { q: X((L, t) => `$${XI(U, L)}$ ${t('and set', 'dan set')} $${nm}$ = ${p[L]}. ${t('Is', 'Adakah')} $${nm} \\subseteq \\xi$? ${t('Explain.', 'Terangkan.')}`), a: X((L, t) => `${t('Yes: every element of', 'Ya: setiap unsur')} $${nm}$ ${t('is an element of', 'ialah unsur bagi')} $\\xi$ (${t('all sets in a universal set are subsets of it', 'semua set dalam set semesta ialah subset bagi set semesta itu')}).`), sp: 's' };
    },
    /* multiples: A subset of B by rule */
    (r) => {
      const U = makeUni(r, 'num'), [k1, k2] = r.pick([[2, 4], [3, 6], [4, 2], [6, 3], [2, 3], [5, 10], [10, 5], [3, 4]]);
      const A = U.items.filter((x) => x % k1 === 0), B = U.items.filter((x) => x % k2 === 0);
      need(A.length >= 2 && B.length >= 2);
      const ok = A.every((x) => B.includes(x)), bad = A.find((x) => !B.includes(x));
      return { q: X((L, t) => `$${XI(U, L)}$, $A$ = ${t(`multiples of ${k1}`, `gandaan bagi ${k1}`)}, $B$ = ${t(`multiples of ${k2}`, `gandaan bagi ${k2}`)}. ${t('List both sets and decide whether', 'Senaraikan kedua-dua set dan tentukan sama ada')} $A \\subseteq B$.`), a: X((L, t) => `$A = ${RO(A, L)}$, $B = ${RO(B, L)}$. ${ok ? t('Yes, A ⊆ B.', 'Ya, A ⊆ B.') : `${t('No: ', 'Tidak: ')}$${bad} \\in A$ ${t('but', 'tetapi')} $${bad} \\notin B$.`}`), sp: 's' };
    },
  ];

  const m113 = [
    /* elements vs subsets statements */
    (r) => {
      const U = makeUni(r, r.pick(['num', 'let'])), A = sub2(r, U.items, 3), inA = r.pick(A), out = r.pick(U.items.filter((x) => !A.includes(x))), nm = r.pick(SETN);
      const ST = [[(L) => `${E(inA, L)} \\in ${nm}`, 1], [(L) => `\\{${E(inA, L)}\\} \\subseteq ${nm}`, 1], [(L) => `\\{${E(inA, L)}\\} \\in ${nm}`, 0], [(L) => `${E(out, L)} \\in ${nm}`, 0], [(L) => `${nm} \\subseteq ${nm}`, 1], [(L) => `\\{${E(out, L)}\\} \\subseteq ${nm}`, 0], [(L) => `${E(inA, L)} \\subseteq ${nm}`, 0]];
      const four = r.sample(ST, 4);
      need(four.some((z) => z[1]) && four.some((z) => !z[1]));
      return { q: X((L, t) => `${t('Given', 'Diberi')} $${nm} = ${RO(A, L)}$. ${t('State whether each statement is true or false. (A set is a subset of itself.)', 'Nyatakan sama ada setiap pernyataan benar atau palsu. (Suatu set ialah subset bagi dirinya sendiri.)')}<br>${four.map((z, i) => `(${'abcd'[i]}) $${z[0](L)}$`).join(' &emsp; ')}`), a: X((L, t) => four.map((z, i) => `(${'abcd'[i]}) ${z[1] ? t('true', 'benar') : t('false', 'palsu')}`).join('; ')), sp: 's' };
    },
    /* nested Venn -> statements */
    (r) => {
      const z = nest(r);
      return { fig: nfig(z), q: X((L, t) => t('In the Venn diagram, A ⊆ B ⊆ ξ. (a) List the elements of A and of B. (b) Is A ⊆ B? (c) Is B ⊆ A? Give a reason for each.', 'Dalam gambar rajah Venn, A ⊆ B ⊆ ξ. (a) Senaraikan unsur bagi A dan B. (b) Adakah A ⊆ B? (c) Adakah B ⊆ A? Berikan sebab bagi setiap satu.')), a: X((L, t) => `(a) $A = ${RO(z.A, L)}$, $B = ${RO(z.B, L)}$ (b) ${t('Yes: all elements of A are in B.', 'Ya: semua unsur A ada dalam B.')} (c) ${t('No: ', 'Tidak: ')}$${z.mid[0]} \\in B$ ${t('but', 'tetapi')} $${z.mid[0]} \\notin A$.`), sp: 'm' };
    },
    /* equal sets */
    (r) => {
      const s = nset(r, 3, 8), [a, b] = nm2(r), same = r.chance(), l2 = same ? s.l.slice() : s.l.concat([s.l[s.l.length - 1] + 1]);
      need(same || !s.l.includes(l2[l2.length - 1]));
      return { q: X((L, t) => `$${a} = ${s.sb(L)}$ ${t('and', 'dan')} $${b} = ${RO(l2, L)}$. ${t('Is', 'Adakah')} $${a} \\subseteq ${b}$? ${t('Is', 'Adakah')} $${b} \\subseteq ${a}$? ${t('Are the sets equal?', 'Adakah kedua-dua set itu sama?')}`), a: X((L, t) => same ? `${t('Yes, yes; the sets are equal, so each is a subset of the other.', 'Ya, ya; kedua-dua set itu sama, maka setiap satu ialah subset bagi yang lain.')}` : `$${a} \\subseteq ${b}$ ${t('is true; but', 'benar; tetapi')} $${b} \\subseteq ${a}$ ${t('is false because', 'palsu kerana')} $${l2[l2.length - 1]} \\in ${b}$, $${l2[l2.length - 1]} \\notin ${a}$. ${t('The sets are not equal.', 'Set itu tidak sama.')}`), sp: 's' };
    },
    /* find k for A subset of B */
    (r) => {
      const B = r.sample(rng(1, 20), 6).sort((p, q) => p - q), A0 = r.sample(B, 2), k = r.pick(B.filter((x) => !A0.includes(x))), [a, b] = nm2(r);
      const A = A0.concat(['k']);
      return { q: X((L, t) => `$${a} = \\{${A.join(',\\ ')}\\}$ ${t('and', 'dan')} $${b} = ${RO(B, L)}$. ${t('Given that', 'Diberi bahawa')} $k$ ${t('is one of the numbers in', 'ialah salah satu nombor dalam')} $${b}$ ${t('that is not in', 'yang tiada dalam')} $${a}$ ${t('already, list the possible values of', 'lagi, senaraikan nilai yang mungkin bagi')} $k$ ${t('so that', 'supaya')} $${a} \\subseteq ${b}$.`), a: X((L) => `$${RO(B.filter((x) => !A0.includes(x)), L)}$`), sp: 's' };
    },
    /* counterexample */
    (r) => {
      const z = abPair(r, false), [a, b] = nm2(r);
      return { q: X((L, t) => `$${a} = ${RO(z.A, L)}$, $${b} = ${RO(z.B, L)}$. ${t('Show that', 'Tunjukkan bahawa')} $${a} \\nsubseteq ${b}$ ${t('by giving an element that belongs to', 'dengan memberi satu unsur yang tergolong dalam')} $${a}$ ${t('but not to', 'tetapi tidak dalam')} $${b}$.`), a: X((L, t) => `$${E(z.bad, L)} \\in ${a}$ ${t('but', 'tetapi')} $${E(z.bad, L)} \\notin ${b}$`), sp: 's' };
    },
    /* reverse direction */
    (r) => {
      const z = abPair(r, true), [a, b] = nm2(r);
      return { q: X((L, t) => `$${a} = ${RO(z.A, L)}$, $${b} = ${RO(z.B, L)}$. ${t('Which is true:', 'Yang manakah benar:')} $${a} \\subseteq ${b}$ ${t('or', 'atau')} $${b} \\subseteq ${a}$? ${t('Give a reason.', 'Berikan sebab.')}`), a: X((L, t) => `$${a} \\subseteq ${b}$: ${t('every element of', 'setiap unsur')} $${a}$ ${t('is in', 'ada dalam')} $${b}$; ${t('but', 'tetapi')} $${b} \\nsubseteq ${a}$ ${t('because', 'kerana')} $${E(z.B.find((x) => !z.A.includes(x)), L)} \\in ${b}$, $\\notin ${a}$.`), sp: 's' };
    },
    /* Venn -> statements about subset and complement */
    (r) => {
      const z = nest(r);
      const S1 = [['A \\subseteq B', 1], ['B \\subseteq A', 0], ['A \\subseteq \\xi', 1], ['\\xi \\subseteq B', 0], ['B \\subseteq \\xi', 1]];
      const f = r.sample(S1, 4);
      return { fig: nfig(z), q: X((L, t) => `${t('Using the Venn diagram, state whether each statement is true or false.', 'Menggunakan gambar rajah Venn, nyatakan sama ada setiap pernyataan benar atau palsu.')} ${f.map((q, i) => `(${'abcd'[i]}) $${q[0]}$`).join(' &emsp; ')}`), a: X((L, t) => f.map((q, i) => `(${'abcd'[i]}) ${q[1] ? t('true', 'benar') : t('false', 'palsu')}`).join('; ')), sp: 's' };
    },
    /* descriptions in words: subsets by rule */
    (r) => {
      const U = makeUni(r, r.pick(['day', 'month', 'shape'])), ps = pick2(r, U, 2), [a, b] = nm2(r);
      const ok = ps[0].l.every((x) => ps[1].l.includes(x)), bad = ps[0].l.find((x) => !ps[1].l.includes(x));
      return { q: X((L, t) => `${t('The universal set is', 'Set semesta ialah')} ${U.xd[L]}. $${a}$ = ${ps[0].p[L]}; $${b}$ = ${ps[1].p[L]}. ${t('Is', 'Adakah')} $${a} \\subseteq ${b}$? ${t('Explain.', 'Terangkan.')}`), a: X((L, t) => ok ? t('Yes: every element of the first set is in the second.', 'Ya: setiap unsur set pertama ada dalam set kedua.') : `${t('No: ', 'Tidak: ')}$${E(bad, L)} \\in ${a}$ ${t('but', 'tetapi')} $${E(bad, L)} \\notin ${b}$.`), sp: 's' };
    },
    /* choose sets that are subsets of a number-set */
    (r) => {
      const z = nest(r), o = [[z.A, `${z.ka}`], [z.B, `${z.kb}`]];
      return { q: X((L, t) => `$\\xi = ${RO(z.items, L)}$. ${t('Set', 'Set')} $P = ${RO(z.A, L)}$, $Q = ${RO(z.B, L)}$ ${t('and', 'dan')} $R = ${RO(z.out, L)}$. ${t('Which of these statements are true:', 'Yang manakah antara pernyataan ini benar:')} (a) $P \\subseteq Q$ (b) $Q \\subseteq P$ (c) $R \\subseteq \\xi$ (d) $P \\subseteq R$`), a: X((L, t) => `(a) ${t('true', 'benar')}; (b) ${t('false', 'palsu')}; (c) ${t('true', 'benar')}; (d) ${t('false', 'palsu')}`), sp: 's' };
    },
  ];

  const a113 = [
    /* three sets by rule */
    (r) => {
      const N = r.pick([24, 30, 36, 48, 60]), U = { items: rng(1, N) };
      const [k1, k2, k3] = r.pick([[12, 6, 3], [12, 6, 2], [8, 4, 2], [10, 5, 5], [18, 6, 3]]);
      const f = (k) => U.items.filter((x) => x % k === 0), A = f(k1), B = f(k2), C = f(k3);
      need(A.length >= 2 && C.length !== B.length);
      const fr = r.int(0, 2);
      const S1 = [[`A \\subseteq B`, A.every((x) => B.includes(x))], [`B \\subseteq C`, B.every((x) => C.includes(x))], [`A \\subseteq C`, A.every((x) => C.includes(x))], [`C \\subseteq A`, C.every((x) => A.includes(x))]];
      return { q: X((L, t) => `$\\xi = \\{x : x \\text{ ${t('is an integer', 'ialah integer')}},\\ 1 \\le x \\le ${N}\\}$. $A$ = ${t(`multiples of ${k1}`, `gandaan bagi ${k1}`)}, $B$ = ${t(`multiples of ${k2}`, `gandaan bagi ${k2}`)}, $C$ = ${t(`multiples of ${k3}`, `gandaan bagi ${k3}`)}. ${[t('State whether each is true or false:', 'Nyatakan sama ada setiap pernyataan benar atau palsu:'), t('Which of these statements are correct?', 'Yang manakah antara pernyataan ini betul?'), t('Mark each statement as true (T) or false (F):', 'Tandakan setiap pernyataan sebagai benar (B) atau palsu (P):')][fr]} ${S1.map((z, i) => `(${'abcd'[i]}) $${z[0]}$`).join(' &emsp; ')}`), a: X((L, t) => S1.map((z, i) => `(${'abcd'[i]}) ${z[1] ? t('true', 'benar') : t('false', 'palsu')}`).join('; ')), sp: 'm' };
    },
    /* mixed representation */
    (r) => {
      const z = nest(r), R = z.B;
      return { fig: nfig(z), q: X((L, t) => `${t('The Venn diagram shows the sets', 'Gambar rajah Venn menunjukkan set')} $A$, $B$ ${t('and', 'dan')} $\\xi$. ${t('Set', 'Set')} $C = ${RO(R.slice(0, 2), L)}$ ${t('and set', 'dan set')} $D$ = ${t(`multiples of ${z.kb} in ξ`, `gandaan bagi ${z.kb} dalam ξ`)}. ${t('Is', 'Adakah')} (a) $C \\subseteq B$? (b) $A \\subseteq D$? (c) $D \\subseteq A$? (d) $D = B$?`), a: X((L, t) => `(a) ${t('true', 'benar')} (b) ${t('true', 'benar')} (c) ${t('false', 'palsu')} (d) ${t('true: both are the multiples of', 'benar: kedua-duanya ialah gandaan bagi')} ${z.kb}`), sp: 'm' };
    },
    /* transitive */
    (r) => {
      const z = nest(r), C = sub2(r, z.A, 2), [a, b, c] = ['P', 'Q', 'R'];
      return { q: X((L, t) => `$R = ${RO(C, L)}$, $Q = ${RO(z.A, L)}$ ${t('and', 'dan')} $P = ${RO(z.B, L)}$. ${t('Show that', 'Tunjukkan bahawa')} $R \\subseteq Q$ ${t('and', 'dan')} $Q \\subseteq P$, ${t('and hence state the relationship between', 'dan seterusnya nyatakan hubungan antara')} $R$ ${t('and', 'dan')} $P$.`), a: X((L, t) => `${t('Every element of R is in Q, and every element of Q is in P, so', 'Setiap unsur R ada dalam Q, dan setiap unsur Q ada dalam P, maka')} $R \\subseteq P$.`), sp: 'm' };
    },
    /* misconceptions: which statements are wrong */
    (r) => {
      const U = makeUni(r, r.pick(['num', 'let'])), A = sub2(r, U.items, 4), x = A[0], nm = r.pick(SETN), nn = r.name();
      return { q: X((L, t) => `$${nm} = ${RO(A, L)}$. ${nn} ${t('writes', 'menulis')} "$${E(x, L)} \\subseteq ${nm}$" ${t('and', 'dan')} "$\\{${E(x, L)}\\} \\in ${nm}$". ${t('Explain the mistakes and write the correct statements using', 'Terangkan kesilapan itu dan tulis pernyataan yang betul menggunakan')} $\\in$ ${t('and', 'dan')} $\\subseteq$.`), a: X((L, t) => `$${E(x, L)}$ ${t('is an element, not a set, so write', 'ialah unsur, bukan set, maka tulis')} $${E(x, L)} \\in ${nm}$; $\\{${E(x, L)}\\}$ ${t('is a set, so write', 'ialah set, maka tulis')} $\\{${E(x, L)}\\} \\subseteq ${nm}$.`), sp: 'm' };
    },
    /* unknown values so that A subset of B */
    (r) => {
      const B = r.sample(rng(1, 25), 6).sort((p, q) => p - q), [i, j] = [B[1], B[3]], k = r.int(2, 6);
      const inB = B.filter((x) => x !== i && x !== j);
      return { q: X((L, t) => `$A = \\{${i},\\ ${j},\\ m\\}$ ${t('and', 'dan')} $B = ${RO(B, L)}$. ${t('Given that', 'Diberi bahawa')} $A \\subseteq B$ ${t('and', 'dan')} $A$ ${t('has exactly 3 elements, list all possible values of', 'mempunyai tepat 3 unsur, senaraikan semua nilai')} $m$ ${t('so that this is possible.', 'yang mungkin.')}`), a: X((L) => `$${RO(inB, L)}$`), sp: 's' };
    },
    /* order the sets by inclusion */
    (r) => {
      const N = r.pick([24, 30, 36]), U = { items: rng(1, N) }, ks = r.pick([[6, 3, 1], [12, 6, 2], [8, 4, 2]]), f = (k) => U.items.filter((x) => x % k === 0);
      const sets = ks.map(f), nm = r.shuffle(['A', 'B', 'C']);
      return { q: X((L, t) => `$\\xi = \\{x : x \\text{ ${t('is an integer', 'ialah integer')}},\\ 1 \\le x \\le ${N}\\}$. ${nm[0]} = ${t(`multiples of ${ks[0]}`, `gandaan bagi ${ks[0]}`)}, ${nm[1]} = ${t(`multiples of ${ks[1]}`, `gandaan bagi ${ks[1]}`)}, ${nm[2]} = ${t(`multiples of ${ks[2]}`, `gandaan bagi ${ks[2]}`)}. ${t('Write the three sets in the order', 'Tulis ketiga-tiga set itu dalam susunan')} $X \\subseteq Y \\subseteq Z$.`), a: X((L, t) => `$${nm[0]} \\subseteq ${nm[1]} \\subseteq ${nm[2]}$ (${sets.map((s0) => s0.length).join(' < ')} ${t('elements', 'unsur')})`), sp: 's' };
    },
    /* justify not subset */
    (r) => {
      const z = abPair(r, false), c = r.pick(SETN.filter((x) => x !== 'A' && x !== 'B'));
      return { q: X((L, t) => `$A = ${RO(z.A, L)}$, $B = ${RO(z.B, L)}$. ${t('Ali says A ⊆ B because A and B have some elements in common. Is Ali correct? Explain.', 'Ali berkata A ⊆ B kerana A dan B mempunyai beberapa unsur yang sama. Adakah Ali betul? Terangkan.')}`), a: X((L, t) => `${t('No. A ⊆ B needs every element of A to be in B, but', 'Tidak. A ⊆ B memerlukan setiap unsur A berada dalam B, tetapi')} $${E(z.bad, L)} \\in A$, $${E(z.bad, L)} \\notin B$.`), sp: 's' };
    },
    /* two described sets: both directions */
    (r) => {
      const U = makeUni(r, r.pick(['num', 'num', 'day', 'month', 'shape'])), ps = pick2(r, U, 2), [a, b] = nm2(r);
      const f = (x, y) => x.every((z) => y.includes(z)), ab = f(ps[0].l, ps[1].l), ba = f(ps[1].l, ps[0].l);
      const cx = (x, y) => x.find((z) => !y.includes(z));
      return { q: X((L, t) => `${t('The universal set is', 'Set semesta ialah')} ${U.xd[L]}. $${a}$ = ${ps[0].p[L]}, $${b}$ = ${ps[1].p[L]}. ${t('Decide whether (i)', 'Tentukan sama ada (i)')} $${a} \\subseteq ${b}$ ${t('and (ii)', 'dan (ii)')} $${b} \\subseteq ${a}$. ${t('Give a counterexample for each false statement.', 'Berikan contoh penyangkal bagi setiap pernyataan yang palsu.')}`), a: X((L, t) => `(i) ${ab ? t('true', 'benar') : `${t('false', 'palsu')}: $${E(cx(ps[0].l, ps[1].l), L)} \\in ${a}$, $\\notin ${b}$`} (ii) ${ba ? t('true', 'benar') : `${t('false', 'palsu')}: $${E(cx(ps[1].l, ps[0].l), L)} \\in ${b}$, $\\notin ${a}$`}`), sp: 'm' };
    },
    /* subset and complement */
    (r) => {
      const z = nest(r), ca = z.items.filter((x) => !z.A.includes(x)), cb = z.out;
      return { q: X((L, t) => `$\\xi = ${RO(z.items, L)}$, $A = ${RO(z.A, L)}$ ${t('and', 'dan')} $B = ${RO(z.B, L)}$, ${t('where', 'dengan')} $A \\subseteq B$. ${t("List $A'$ and $B'$. Is $B' \\subseteq A'$? Is $A' \\subseteq B'$?", "Senaraikan $A'$ dan $B'$. Adakah $B' \\subseteq A'$? Adakah $A' \\subseteq B'$?")}`), a: X((L, t) => `$A' = ${RO(ca, L)}$, $B' = ${RO(cb, L)}$. $B' \\subseteq A'$: ${t('true', 'benar')}; $A' \\subseteq B'$: ${t('false', 'palsu')} ($${z.mid[0]} \\in A'$, $\\notin B'$).`), sp: 'm' };
    },
    /* equal size subset */
    (r) => {
      const U = makeUni(r, 'num'), B = sub2(r, U.items, r.int(4, 6)), F = [
        [X((L, t) => `$A \\subseteq B$ ${t('and', 'dan')} $n(A) = n(B) = ${B.length}$. ${t('What can you conclude about', 'Apakah kesimpulan tentang')} $A$ ${t('and', 'dan')} $B$?`), X((L, t) => t('A = B: A has all the elements of B, since it has the same number of elements.', 'A = B: A mempunyai semua unsur B kerana bilangan unsurnya sama.'))],
        [X((L, t) => `$A \\subseteq B$ ${t('and', 'dan')} $B \\subseteq A$. ${t('What can you conclude? Give an example.', 'Apakah kesimpulannya? Berikan satu contoh.')}`), X((L, t) => `A = B. ${t('For example', 'Contohnya')}, $A = B = ${RO(B, L)}$.`)],
        [X((L, t) => `$n(A) = ${B.length - 1}$, $n(B) = ${B.length}$ ${t('and', 'dan')} $A \\subseteq B$. ${t('Can', 'Bolehkah')} $B \\subseteq A$? ${t('Explain.', 'Terangkan.')}`), X((L, t) => t('No. B has one more element than A, and that element is not in A.', 'Tidak. B mempunyai satu unsur lebih daripada A, dan unsur itu tiada dalam A.'))],
      ];
      const [q, a] = r.pick(F);
      return { q, a, sp: 's' };
    },
  ];
  SPM.extend('F1-11.3', { e: e113, m: m113, a: a113 });

  /* ================================================================ F1-11.4 */
  const RDF = [
    (t) => t('Study the Venn diagram.', 'Perhatikan gambar rajah Venn.'),
    (t) => t('The Venn diagram represents the universal set ξ and set A.', 'Gambar rajah Venn mewakili set semesta ξ dan set A.'),
    (t) => t('Use the Venn diagram to answer the question.', 'Gunakan gambar rajah Venn untuk menjawab soalan itu.'),
  ];
  /* part banks for diagram-reading questions */
  const V1S = [
    (t) => t('Study the Venn diagram.', 'Perhatikan gambar rajah Venn.'), (t) => t('The Venn diagram represents the universal set ξ and set A.', 'Gambar rajah Venn mewakili set semesta ξ dan set A.'),
    (t) => t('Use the Venn diagram to answer the question.', 'Gunakan gambar rajah Venn untuk menjawab soalan itu.'), (t) => t('The diagram shows a set A drawn inside a universal set ξ.', 'Rajah menunjukkan set A yang dilukis dalam set semesta ξ.'),
    (t) => t('In the diagram, the rectangle is ξ and the circle is A.', 'Dalam rajah, segi empat tepat ialah ξ dan bulatan ialah A.'), (t) => t('Refer to the Venn diagram.', 'Rujuk gambar rajah Venn.'),
    (t) => t('A Venn diagram is drawn for ξ and its subset A.', 'Sebuah gambar rajah Venn dilukis bagi ξ dan subsetnya A.'), (t) => t('Look carefully at the Venn diagram.', 'Lihat gambar rajah Venn itu dengan teliti.'),
  ];
  const NS = [
    (t) => t('Study the Venn diagram, where A ⊆ B ⊆ ξ.', 'Perhatikan gambar rajah Venn, dengan A ⊆ B ⊆ ξ.'), (t) => t('The Venn diagram shows the sets A and B inside the universal set ξ.', 'Gambar rajah Venn menunjukkan set A dan set B dalam set semesta ξ.'),
    (t) => t('In the diagram, circle A lies inside circle B, and both lie inside the rectangle ξ.', 'Dalam rajah, bulatan A terletak di dalam bulatan B, dan kedua-duanya di dalam segi empat tepat ξ.'), (t) => t('Use the nested Venn diagram to answer the following.', 'Gunakan gambar rajah Venn bersarang untuk menjawab yang berikut.'),
    (t) => t('A Venn diagram represents ξ, B and A, with A ⊆ B.', 'Gambar rajah Venn mewakili ξ, B dan A, dengan A ⊆ B.'), (t) => t('Refer to the diagram showing three nested regions.', 'Rujuk rajah yang menunjukkan tiga kawasan bersarang.'),
  ];
  const v1bank = (U, l, c, x) => [
    [(t) => t('List the elements of A.', 'Senaraikan unsur bagi A.'), (L) => `$${RO(l, L)}$`], [(t) => t('List the elements of A′.', 'Senaraikan unsur bagi A′.'), (L) => `$${RO(c, L)}$`],
    [(t) => t('State n(A).', 'Nyatakan n(A).'), () => `${l.length}`], [(t) => t('State n(A′).', 'Nyatakan n(A′).'), () => `${c.length}`], [(t) => t('State n(ξ).', 'Nyatakan n(ξ).'), () => `${U.items.length}`],
    [(t) => t('Write down the elements that lie outside the circle.', 'Tulis unsur yang terletak di luar bulatan.'), (L) => `$${RO(c, L)}$`], [(t) => t('How many elements lie inside the circle?', 'Berapakah bilangan unsur di dalam bulatan?'), () => `${l.length}`],
    [(t) => t(`Is ${x} an element of A or of A′?`, `Adakah ${x} unsur bagi A atau bagi A′?`), (L, t) => l.map(String).includes(String(x)) ? 'A' : 'A′'],
    [(t) => t('Write set A in roster form using set notation.', 'Tulis set A dalam bentuk senarai menggunakan tatatanda set.'), (L) => `$A = ${RO(l, L)}$`],
  ];
  const nbank = (z, x) => [
    [(t) => t('List the elements of A.', 'Senaraikan unsur bagi A.'), (L) => `$${RO(z.A, L)}$`], [(t) => t('List the elements of B.', 'Senaraikan unsur bagi B.'), (L) => `$${RO(z.B, L)}$`],
    [(t) => t('List the elements of B′.', 'Senaraikan unsur bagi B′.'), (L) => `$${RO(z.out, L)}$`], [(t) => t('List the elements of A′.', 'Senaraikan unsur bagi A′.'), (L) => `$${RO(z.items.filter((y) => !z.A.includes(y)), L)}$`],
    [(t) => t('State n(A) and n(B).', 'Nyatakan n(A) dan n(B).'), () => `${z.A.length}, ${z.B.length}`], [(t) => t('State n(ξ).', 'Nyatakan n(ξ).'), () => `${z.items.length}`],
    [(t) => t('State n(B′).', 'Nyatakan n(B′).'), () => `${z.out.length}`], [(t) => t('Write a true statement about A and B using a subset symbol.', 'Tulis satu pernyataan benar tentang A dan B menggunakan simbol subset.'), () => '$A \\subseteq B$'],
    [(t) => t('Is B ⊆ A? Give a reason.', 'Adakah B ⊆ A? Berikan sebab.'), (L, t) => `${t('No', 'Tidak')}: ${z.mid[0]} ∈ B, ${z.mid[0]} ∉ A`], [(t) => t(`Where is the number ${x} placed: inside A, inside B only, or outside B?`, `Di manakah nombor ${x} diletakkan: di dalam A, di dalam B sahaja, atau di luar B?`), (L, t) => z.A.includes(x) ? t('inside A', 'di dalam A') : z.mid.includes(x) ? t('inside B only', 'di dalam B sahaja') : t('outside B', 'di luar B')],
    [(t) => t('State the number of elements that are in B but not in A.', 'Nyatakan bilangan unsur yang berada dalam B tetapi bukan dalam A.'), () => `${z.mid.length}`],
  ];
  const ptxt = (sel, L, t, k) => (k === 1 ? sel[0][0](t) : sel.map((p, i) => `(${'abcd'[i]}) ${p[0](t)}`).join(' '));
  const patx = (sel, L, t, k) => (k === 1 ? sel[0][1](L, t) : sel.map((p, i) => `(${'abcd'[i]}) ${p[1](L, t)}`).join('; '));
  const bankQ = (r, fig, stems, bank, k) => {
    const sel = r.sample(bank, k);
    return { fig, q: X((L, t) => `${r.pick(stems)(t)} ${ptxt(sel, L, t, k)}`), a: X((L, t) => patx(sel, L, t, k)), sp: 's' };
  };
  const e114 = [
    /* read A, A', n */
    (r) => {
      const U = numFig(r), [{ l }] = pick2(r, U, 1), c = comp(U, l), f = r.int(0, 3);
      const Q = [
        [(t) => t('List the elements of set A.', 'Senaraikan unsur bagi set A.'), (L) => `$A = ${RO(l, L)}$`],
        [(t) => t("List the elements of A′.", "Senaraikan unsur bagi A′."), (L) => `$A' = ${RO(c, L)}$`],
        [(t) => t('State n(A) and n(ξ).', 'Nyatakan n(A) dan n(ξ).'), (L) => `$n(A) = ${l.length}$, $n(\\xi) = ${U.items.length}$`],
        [(t) => t('How many elements lie outside the circle?', 'Berapakah bilangan unsur yang terletak di luar bulatan?'), (L) => `${c.length}`],
      ][f];
      return { fig: vfig(U, l), q: X((L, t) => `${r.pick(RDF)(t)} ${Q[0](t)}`), a: X((L) => Q[1](L)), sp: 's' };
    },
    /* shaded region */
    (r) => {
      const U = numFig(r), [{ l }] = pick2(r, U, 1), c = comp(U, l), out = r.chance();
      return { fig: vfig(U, l, out ? 'out' : 'A'), q: X((L, t) => t("The shaded region of the Venn diagram represents which set: A or A′? List its elements.", "Kawasan berlorek pada gambar rajah Venn mewakili set yang manakah: A atau A′? Senaraikan unsurnya.")), a: X((L) => `$${out ? "A'" : 'A'} = ${RO(out ? c : l, L)}$`), sp: 's' };
    },
    /* draw: place elements */
    (r) => {
      const U = numFig(r), [{ l }] = pick2(r, U, 1), nm = 'A', f = vfig(U, l);
      return { q: X((L, t) => `$${XI(U, L)}$ ${t('and', 'dan')} $A = ${RO(l, L)}$. ${r.pick([t('Draw a Venn diagram to show ξ and A, writing every element in the correct region.', 'Lukis gambar rajah Venn untuk menunjukkan ξ dan A, dengan menulis setiap unsur pada kawasan yang betul.'), t('Show the sets ξ and A in a Venn diagram. Put each element inside or outside the circle.', 'Tunjukkan set ξ dan A dalam gambar rajah Venn. Letakkan setiap unsur di dalam atau di luar bulatan.')])}`), a: T(f, f), sp: 'l' };
    },
    /* inside or outside */
    (r) => {
      const U = numFig(r), [{ l }] = pick2(r, U, 1), x = r.pick(U.items), inn = l.includes(x);
      return { fig: vfig(U, l), q: X((L, t) => `${t('Is the element', 'Adakah unsur')} $${E(x, L)}$ ${t('inside the circle A or outside it? Write', 'berada di dalam bulatan A atau di luar bulatan? Tulis')} $${E(x, L)} \\in A$ ${t('or', 'atau')} $${E(x, L)} \\in A'$.`), a: X((L) => `$${E(x, L)} \\in ${inn ? 'A' : "A'"}$`), sp: 'xs' };
    },
    /* which diagram shows A' */
    (r) => {
      const U = numFig(r), [{ l }] = pick2(r, U, 1), first = r.chance(), tgt = r.chance();
      const fA = vfig(U, l, 'A'), fO = vfig(U, l, 'out'), f = first ? two(fO, fA) : two(fA, fO);
      const ans = first === tgt ? '(i)' : '(ii)';
      return { fig: f, q: X((L, t) => `${t('Two Venn diagrams are shown, with different regions shaded. In which diagram is', 'Dua gambar rajah Venn ditunjukkan dengan kawasan berlorek yang berbeza. Dalam gambar rajah yang manakah')} ${tgt ? "A′" : 'A'} ${t('shaded?', 'dilorekkan?')}`), a: X((L) => ans), sp: 's' };
    },
    /* complete the diagram description */
    (r) => {
      const U = numFig(r), [{ l }] = pick2(r, U, 1), c = comp(U, l);
      return { fig: vfig(U, l), q: X((L, t) => t('Complete: the rectangle represents the ____ set ξ, the circle represents set ____, and the elements outside the circle belong to ____.', 'Lengkapkan: segi empat tepat mewakili set ____ ξ, bulatan mewakili set ____, dan unsur di luar bulatan tergolong dalam ____.')), a: X((L, t) => t("universal; A; A′", 'semesta; A; A′')), sp: 's' };
    },
    /* description -> element placement (text) */
    (r) => {
      const U = makeUni(r), [{ p, l }] = pick2(r, U, 1), x = r.pick(U.items), c = comp(U, l);
      return { q: X((L, t) => `${t('In a Venn diagram, the universal set is', 'Dalam gambar rajah Venn, set semesta ialah')} ${U.xd[L]} ${t('and the circle represents', 'dan bulatan mewakili')} ${p[L]}. ${t('Should', 'Patutkah')} $${E(x, L)}$ ${t('be written inside or outside the circle?', 'ditulis di dalam atau di luar bulatan?')}`), a: X((L, t) => `${l.includes(x) ? t('Inside', 'Di dalam') : t('Outside (in the rectangle but not in the circle)', 'Di luar (dalam segi empat tepat tetapi bukan dalam bulatan)')}`), sp: 'xs' };
    },
    (r) => { const U = numFig(r), [{ l }] = pick2(r, U, 1), c = comp(U, l); return bankQ(r, vfig(U, l), V1S, v1bank(U, l, c, r.pick(U.items)), r.int(1, 2)); },
    (r) => { const U = numFig(r), [{ l }] = pick2(r, U, 1), c = comp(U, l); return bankQ(r, vfig(U, l, r.pick(['A', 'out'])), V1S, v1bank(U, l, c, r.pick(U.items)).slice(0, 7), 1); },
  ];

  const m114 = [
    /* nested read */
    (r) => {
      const z = nest(r), f = r.int(0, 3);
      const Q = [
        [(t) => t('(a) List the elements of B. (b) List the elements of A. (c) State n(B′).', '(a) Senaraikan unsur bagi B. (b) Senaraikan unsur bagi A. (c) Nyatakan n(B′).'), (L) => `(a) $${RO(z.B, L)}$ (b) $${RO(z.A, L)}$ (c) $${z.out.length}$`],
        [(t) => t("(a) List the elements of A′. (b) State n(A′) and n(B′).", "(a) Senaraikan unsur bagi A′. (b) Nyatakan n(A′) dan n(B′)."), (L) => `(a) $${RO(z.items.filter((x) => !z.A.includes(x)), L)}$ (b) $${z.items.length - z.A.length}$, $${z.out.length}$`],
        [(t) => t('State n(A), n(B) and n(ξ).', 'Nyatakan n(A), n(B) dan n(ξ).'), (L) => `$${z.A.length}$, $${z.B.length}$, $${z.items.length}$`],
        [(t) => t('Which of A and B has more elements, and by how many?', 'Antara A dan B, yang manakah mempunyai lebih banyak unsur, dan berapa banyak lebihnya?'), (L) => `B; ${z.B.length - z.A.length}`],
      ][f];
      return { fig: nfig(z), q: X((L, t) => `${r.pick([(t2) => t2('Study the Venn diagram, where A ⊆ B ⊆ ξ.', 'Perhatikan gambar rajah Venn, dengan A ⊆ B ⊆ ξ.'), (t2) => t2('The Venn diagram shows the sets A and B inside the universal set ξ.', 'Gambar rajah Venn menunjukkan set A dan set B dalam set semesta ξ.')])(t)} ${Q[0](t)}`), a: X((L) => Q[1](L)), sp: 's' };
    },
    /* draw nested */
    (r) => {
      const z = nest(r), f = nfig(z);
      return { q: X((L, t) => `$${XI(z, L)}$, $B = ${RO(z.B, L)}$ ${t('and', 'dan')} $A = ${RO(z.A, L)}$. ${t('Draw a Venn diagram to show that A ⊆ B ⊆ ξ.', 'Lukis gambar rajah Venn untuk menunjukkan bahawa A ⊆ B ⊆ ξ.')}`), a: T(f, f), sp: 'xl' };
    },
    /* translate rule description -> nested diagram */
    (r) => {
      const z = nest(r), f = nfig(z);
      return { q: X((L, t) => `$\\xi = \\{x : x \\text{ ${t('is an integer', 'ialah integer')}},\\ 1 \\le x \\le ${z.N}\\}$, $A$ = ${nA(z)[L]}, $B$ = ${nB(z)[L]}. ${t('Draw a Venn diagram to represent ξ, A and B, and find n(B′).', 'Lukis gambar rajah Venn untuk mewakili ξ, A dan B, dan cari n(B′).')}`), a: T(`$n(B') = ${z.out.length}$. ${f}`, `$n(B') = ${z.out.length}$. ${f}`), sp: 'xl' };
    },
    /* statements from the diagram */
    (r) => {
      const z = nest(r), x = r.pick(z.A), y = r.pick(z.mid), w = r.pick(z.out);
      const ST = [[`${x} \\in A`, 1], [`${y} \\in A`, 0], [`${y} \\in B`, 1], [`${w} \\in B`, 0], [`${w} \\in B'`, 1], [`${x} \\in B'`, 0], [`${y} \\in A'`, 1]];
      const f = r.sample(ST, 4);
      return { fig: nfig(z), q: X((L, t) => `${t('Using the Venn diagram, state whether each statement is true or false.', 'Menggunakan gambar rajah Venn, nyatakan sama ada setiap pernyataan benar atau palsu.')} ${f.map((q, i) => `(${'abcd'[i]}) $${q[0]}$`).join(' &emsp; ')}`), a: X((L, t) => f.map((q, i) => `(${'abcd'[i]}) ${q[1] ? t('true', 'benar') : t('false', 'palsu')}`).join('; ')), sp: 's' };
    },
    /* the diagram: describe A in words */
    (r) => {
      const U = makeUni(r, 'num'), [{ p, l }] = pick2(r, U, 1), f = vfig(U, l);
      const o = r.shuffle([p].concat(U.props.filter((q) => q.en !== p.en && pset(U, q).map(lab).join() !== l.map(lab).join()).slice(0, 3)));
      need(o.length === 4);
      return { fig: f, q: X((L, t) => t('The circle in the Venn diagram is set A. Which description fits A?', 'Bulatan dalam gambar rajah Venn ialah set A. Huraian yang manakah sesuai bagi A?') + `<br>${o.map((q, i) => `(${AB[i]}) ${q[L]}`).join('<br>')}`), a: X((L) => `${AB[o.indexOf(p)]}: ${p[L]}`), sp: 's' };
    },
    /* which region for an element (nested) */
    (r) => {
      const z = nest(r), x = r.pick(z.items), reg = z.A.includes(x) ? ['inside circle A (so also inside B)', 'di dalam bulatan A (maka juga di dalam B)'] : z.mid.includes(x) ? ['inside circle B but outside circle A', 'di dalam bulatan B tetapi di luar bulatan A'] : ['outside circle B, inside the rectangle', 'di luar bulatan B, di dalam segi empat tepat'];
      return { q: X((L, t) => `$${nxi(z).replace('%s', t('is an integer', 'ialah integer'))}$, $A$ = ${nA(z)[L]}, $B$ = ${nB(z)[L]}. ${t('In the Venn diagram for A ⊆ B ⊆ ξ, where is the number', 'Dalam gambar rajah Venn bagi A ⊆ B ⊆ ξ, di manakah nombor')} ${x} ${t('placed?', 'diletakkan?')}`), a: T(reg[0], reg[1]), sp: 's' };
    },
    /* mistakes in a drawing */
    (r) => {
      const z = nest(r), x = r.pick(z.mid), nn = r.name();
      return { q: X((L, t) => `$${nxi(z).replace('%s', t('is an integer', 'ialah integer'))}$, $A$ = ${nA(z)[L]}, $B$ = ${nB(z)[L]}. ${nn} ${t('placed', 'meletakkan')} ${x} ${t('inside circle A in a diagram of A ⊆ B ⊆ ξ. Is this correct? Explain and say where it belongs.', 'di dalam bulatan A dalam gambar rajah bagi A ⊆ B ⊆ ξ. Adakah ini betul? Terangkan dan nyatakan kedudukan yang betul.')}`), a: X((L, t) => `${t('No. ', 'Tidak. ')}${x} ${t('is a multiple of', 'ialah gandaan bagi')} ${z.kb} ${t('but not of', 'tetapi bukan bagi')} ${z.ka}, ${t('so it belongs inside B but outside A.', 'maka ia berada di dalam B tetapi di luar A.')}`), sp: 's' };
    },
    (r) => { const z = nest(r); return bankQ(r, nfig(z), NS, nbank(z, r.pick(z.items)), r.int(1, 2)); },
    (r) => { const z = nest(r); return bankQ(r, nfig(z), NS, nbank(z, r.pick(z.items)), 3); },
  ];

  const a114 = [
    /* mixed description -> nested diagram + statements */
    (r) => {
      const z = nest(r), f = nfig(z), f2 = r.int(0, 1);
      return { q: X((L, t) => `$\\xi = \\{x : x \\text{ ${t('is an integer', 'ialah integer')}},\\ 1 \\le x \\le ${z.N}\\}$, $A$ = ${nA(z)[L]}, $B$ = ${nB(z)[L]}. (a) ${t('Draw a Venn diagram for ξ, A and B.', 'Lukis gambar rajah Venn bagi ξ, A dan B.')} (b) ${t('Write the relationship between A and B using a symbol.', 'Tulis hubungan antara A dan B menggunakan satu simbol.')} (c) ${t('Find', 'Cari')} $n(B')$ ${t('and list', 'dan senaraikan')} $B'$.`), a: T(`(a) ${f} (b) $A \\subseteq B$ (c) $n(B') = ${z.out.length}$; $B' = ${RO(z.out, 'en')}$`, `(a) ${f} (b) $A \\subseteq B$ (c) $n(B') = ${z.out.length}$; $B' = ${RO(z.out, 'ms')}$`), sp: 'xl' };
    },
    /* diagram -> set-builder descriptions and statements */
    (r) => {
      const z = nest(r);
      return { fig: nfig(z), q: X((L, t) => t('The Venn diagram shows A ⊆ B ⊆ ξ, where ξ contains the integers from 1 to ' + z.N + '. (a) Describe A and B in words. (b) List A′. (c) Write a true statement using ⊆ and one using ∈.', 'Gambar rajah Venn menunjukkan A ⊆ B ⊆ ξ, dengan ξ mengandungi integer dari 1 hingga ' + z.N + '. (a) Huraikan A dan B dalam perkataan. (b) Senaraikan A′. (c) Tulis satu pernyataan benar menggunakan ⊆ dan satu menggunakan ∈.')), a: X((L, t) => `(a) A: ${nA(z)[L]}; B: ${nB(z)[L]} (b) $A' = ${RO(z.items.filter((x) => !z.A.includes(x)), L)}$ (c) $A \\subseteq B$; $${z.A[0]} \\in A$`), sp: 'l' };
    },
    /* reverse: determine the unknown element from the diagram */
    (r) => {
      const z = nest(r), k = r.pick(z.mid);
      return { fig: S.vennNested({ names: ['A', 'B'], inner: z.A, mid: z.mid.map((x) => (x === k ? 'k' : x)), out: z.out }), q: X((L, t) => `${t('In the Venn diagram, ξ contains the integers from 1 to', 'Dalam gambar rajah Venn, ξ mengandungi integer dari 1 hingga')} ${z.N}, $B$ = ${nB(z)[L]} ${t('and', 'dan')} $A$ = ${nA(z)[L]}. ${t('Find the value of the element', 'Cari nilai unsur')} $k$ ${t('in the diagram, given that', 'dalam gambar rajah itu, diberi bahawa')} $k$ ${t('is the only element missing from the region B but not A.', 'ialah satu-satunya unsur yang hilang daripada kawasan B tetapi bukan A.')}`), a: X((L) => `$k = ${k}$`), sp: 's' };
    },
    /* three diagrams: which is a subset diagram */
    (r) => {
      const U = numFig(r), [{ l }] = pick2(r, U, 1), z = nest(r), first = r.chance();
      const g1 = nfig(z), g2 = S.venn1({ name: 'A', inA: z.A.map(String), out: z.items.filter((x) => !z.A.includes(x)).map(String) });
      const f = first ? two(g1, g2) : two(g2, g1);
      return { fig: f, q: X((L, t) => `${t('Which diagram shows a subset relationship between two sets, and what is it?', 'Gambar rajah yang manakah menunjukkan hubungan subset antara dua set, dan apakah hubungan itu?')}`), a: X((L, t) => `${first ? '(i)' : '(ii)'}: $A \\subseteq B$ (${t('circle A lies completely inside circle B', 'bulatan A terletak sepenuhnya di dalam bulatan B')})`), sp: 's' };
    },
    /* reading complement from nested */
    (r) => {
      const z = nest(r), ca = z.items.filter((x) => !z.A.includes(x));
      return { fig: nfig(z), q: X((L, t) => t("Use the Venn diagram. (a) List A′. (b) List B′. (c) Is B′ ⊆ A′? Give a reason.", "Gunakan gambar rajah Venn. (a) Senaraikan A′. (b) Senaraikan B′. (c) Adakah B′ ⊆ A′? Berikan sebab.")), a: X((L, t) => `(a) $${RO(ca, L)}$ (b) $${RO(z.out, L)}$ (c) ${t('Yes: every element outside B is also outside A.', 'Ya: setiap unsur di luar B juga berada di luar A.')}`), sp: 'm' };
    },
    /* explain */
    (r) => {
      const z = nest(r), nn = r.name();
      return { fig: nfig(z), q: X((L, t) => `${nn} ${t('says that A ⊆ B is not correct because circle A is smaller than circle B. Is', 'berkata bahawa A ⊆ B tidak betul kerana bulatan A lebih kecil daripada bulatan B. Adakah')} ${nn} ${t('correct? Use the diagram to explain.', 'betul? Gunakan gambar rajah untuk menerangkan.')}`), a: X((L, t) => t('No. A ⊆ B means every element of A is in B. In the diagram, all elements of A are inside circle B.', 'Tidak. A ⊆ B bermaksud setiap unsur A ada dalam B. Dalam gambar rajah, semua unsur A berada di dalam bulatan B.')), sp: 's' };
    },
    /* letters version of complement + diagram */
    (r) => {
      const U = makeUni(r, 'let'), [{ p, l }] = pick2(r, U, 1), c = comp(U, l), f = vfig(U, l);
      return { q: X((L, t) => `${t('The universal set is', 'Set semesta ialah')} ${U.xd[L]}. $A$ = ${p[L]}. (a) ${t('Draw a Venn diagram.', 'Lukis gambar rajah Venn.')} (b) ${t('State', 'Nyatakan')} $n(A)$ ${t('and', 'dan')} $n(A')$.`), a: T(`(a) ${f} (b) $n(A) = ${l.length}$, $n(A') = ${c.length}$`), sp: 'xl' };
    },
    (r) => { const z = nest(r); return Object.assign(bankQ(r, nfig(z), NS, nbank(z, r.pick(z.items)), 4), { sp: 'l' }); },
    (r) => { const z = nest(r); return Object.assign(bankQ(r, nfig(z), NS, nbank(z, r.pick(z.items)).slice(4), 3), { sp: 'l' }); },
  ];
  SPM.extend('F1-11.4', { e: e114, m: m114, a: a114 });


})();
