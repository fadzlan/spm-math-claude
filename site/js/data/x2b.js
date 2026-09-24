/* Variety pack x2b: extra generators for F2-3.1, 3.2, 3.3, 3.4, 3.E (Algebraic Formulae) and F2-10.1 (Gradient). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, Fr, poly, lin, rm, round, gcd, par } = SPM;
  const T = SPM.L, Q = SPM.cat, P = SPM.parts, S = SPM.svg, W = SPM.lines;
  const OPT = 'ABCD';
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] === undefined ? '{' + k + '}' : o[k]));
  const tf = (en, ms, o) => T(fill(en, o), fill(ms, o));
  /* multiple choice: { q: options html, ans: '(B) $..$' } */
  function mcq(r, correct, wrongs, fmt) {
    fmt = fmt || ((x) => `$${x}$`);
    const all = [correct].concat(wrongs);
    need(new Set(all.map((x) => fmt(x))).size === all.length);
    const order = r.shuffle(all);
    return { q: order.map((x, k) => `(${OPT[k]}) ${fmt(x)}`).join(' &emsp; '), ans: `(${OPT[order.indexOf(correct)]}) ${fmt(correct)}` };
  }
  const B = () => SPM.bank;

  /* ===== linear "fixed + rate" contexts (used by 3.1, 3.3, 3.4) =====
   * y = a x + b (up) or y = b - a x (down).  c.e/c.m: sentence with {a} {b}. */
  const ctx = (e, m, y, x, yv, xv, up, a, b, xr, u, am, bm) => ({ e, m, y, x, yv, xv, up, a, b, xr, u, am, bm });
  const CT = [
    ctx('A taxi charges a fixed fare of RM{b} plus RM{a} for every kilometre travelled.', 'Sebuah teksi mengenakan tambang tetap RM{b} ditambah RM{a} bagi setiap kilometer perjalanan.', ['the total fare (in RM)', 'jumlah tambang (dalam RM)'], ['the distance travelled (in km)', 'jarak perjalanan (dalam km)'], 'C', 'd', 1, [2, 5], [3, 10], [3, 25], ['RM', '', ''], ['the charge per kilometre', 'caj bagi setiap kilometer'], ['the fixed fare', 'tambang tetap']),
    ctx('A hall is hired for a deposit of RM{b} plus RM{a} for every hour of use.', 'Sebuah dewan disewa dengan deposit RM{b} ditambah RM{a} bagi setiap jam penggunaan.', ['the total hire charge (in RM)', 'jumlah bayaran sewa (dalam RM)'], ['the number of hours', 'bilangan jam'], 'C', 'h', 1, [20, 60, 10], [50, 200, 50], [2, 8], ['RM', '', ''], ['the charge per hour', 'caj bagi setiap jam'], ['the deposit', 'deposit']),
    ctx('A shop charges RM{b} to set up a design and RM{a} to print each T-shirt.', 'Sebuah kedai mengenakan RM{b} untuk menyediakan reka bentuk dan RM{a} untuk mencetak setiap helai baju-T.', ['the total cost (in RM)', 'jumlah kos (dalam RM)'], ['the number of T-shirts printed', 'bilangan baju-T yang dicetak'], 'C', 'n', 1, [5, 15], [20, 60, 10], [5, 30], ['RM', '', ''], ['the cost of printing one T-shirt', 'kos mencetak sehelai baju-T'], ['the set-up charge', 'caj penyediaan']),
    ctx('A gym charges a joining fee of RM{b} and a monthly fee of RM{a}.', 'Sebuah gim mengenakan yuran pendaftaran RM{b} dan yuran bulanan RM{a}.', ['the total amount paid (in RM)', 'jumlah bayaran (dalam RM)'], ['the number of months', 'bilangan bulan'], 'T', 'm', 1, [30, 80, 10], [20, 100, 10], [2, 12], ['RM', '', ''], ['the monthly fee', 'yuran bulanan'], ['the joining fee', 'yuran pendaftaran']),
    ctx('A photographer charges a booking fee of RM{b} and RM{a} for every hour of shooting.', 'Seorang jurugambar mengenakan yuran tempahan RM{b} dan RM{a} bagi setiap jam sesi fotografi.', ['the total fee (in RM)', 'jumlah bayaran (dalam RM)'], ['the number of hours', 'bilangan jam'], 'F', 't', 1, [40, 100, 10], [50, 150, 10], [1, 6], ['RM', '', ''], ['the fee per hour', 'bayaran sejam'], ['the booking fee', 'yuran tempahan']),
    ctx('A mobile plan has a monthly fee of RM{b} and charges RM{a} for every extra GB of data used.', 'Pelan telefon bimbit mempunyai bayaran bulanan RM{b} dan mengenakan RM{a} bagi setiap GB data tambahan yang digunakan.', ['the monthly bill (in RM)', 'bil bulanan (dalam RM)'], ['the extra data used (in GB)', 'data tambahan yang digunakan (dalam GB)'], 'B', 'g', 1, [2, 6], [20, 50, 5], [1, 10], ['RM', '', ''], ['the charge per extra GB', 'caj bagi setiap GB tambahan'], ['the monthly fee', 'bayaran bulanan']),
    ctx('Farid has RM{b} in his savings and saves another RM{a} every week.', 'Farid mempunyai RM{b} dalam simpanannya dan menyimpan RM{a} lagi setiap minggu.', ['his total savings (in RM)', 'jumlah simpanannya (dalam RM)'], ['the number of weeks', 'bilangan minggu'], 'S', 'w', 1, [5, 20], [20, 100, 10], [2, 20], ['RM', '', ''], ['the amount saved each week', 'jumlah yang disimpan setiap minggu'], ['the savings at the start', 'simpanan pada permulaan']),
    ctx('A seedling is {b} cm tall and grows {a} cm every week.', 'Sebatang anak benih setinggi {b} cm dan tumbuh {a} cm setiap minggu.', ['its height (in cm)', 'ketinggiannya (dalam cm)'], ['the number of weeks', 'bilangan minggu'], 'H', 't', 1, [2, 6], [10, 30], [1, 10], ['', ' cm', ' cm'], ['the growth each week', 'pertumbuhan setiap minggu'], ['the height at the start', 'ketinggian pada permulaan']),
    ctx('A tank already holds {b} litres of water. A tap adds {a} litres every minute.', 'Sebuah tangki sudah mengandungi {b} liter air. Sebuah paip menambah {a} liter setiap minit.', ['the volume of water in the tank (in litres)', 'isi padu air dalam tangki (dalam liter)'], ['the number of minutes the tap is open', 'bilangan minit paip dibuka'], 'V', 't', 1, [5, 20], [50, 200, 10], [2, 15], ['', ' litres', ' liter'], ['the litres added each minute', 'liter yang ditambah setiap minit'], ['the volume at the start', 'isi padu pada permulaan']),
    ctx('A caterer charges RM{a} for each guest plus RM{b} for delivery.', 'Seorang pengusaha katering mengenakan RM{a} bagi setiap tetamu ditambah RM{b} untuk penghantaran.', ['the total charge (in RM)', 'jumlah caj (dalam RM)'], ['the number of guests', 'bilangan tetamu'], 'C', 'g', 1, [8, 25], [30, 80, 10], [10, 60], ['RM', '', ''], ['the charge per guest', 'caj bagi setiap tetamu'], ['the delivery charge', 'caj penghantaran']),
    ctx('A candle is {b} cm long when lit and burns down by {a} cm every hour.', 'Sebatang lilin panjangnya {b} cm apabila dinyalakan dan susut {a} cm setiap jam.', ['the length of the candle (in cm)', 'panjang lilin (dalam cm)'], ['the number of hours it has burned', 'bilangan jam ia terbakar'], 'L', 't', 0, [2, 4], [20, 30], [1, 5], ['', ' cm', ' cm'], ['the length burned each hour', 'panjang yang terbakar setiap jam'], ['the length at the start', 'panjang pada permulaan']),
    ctx('A phone battery is at {b}% when it is unplugged and drains {a}% every hour of use.', 'Bateri telefon berada pada {b}% apabila dicabut daripada pengecas dan susut {a}% bagi setiap jam penggunaan.', ['the battery level (in %)', 'paras bateri (dalam %)'], ['the number of hours of use', 'bilangan jam penggunaan'], 'B', 't', 0, [5, 10], [80, 100, 10], [1, 6], ['', '%', '%'], ['the percentage drained each hour', 'peratusan yang susut setiap jam'], ['the level at the start', 'paras pada permulaan']),
    ctx('An oil drum contains {b} litres of oil. Oil is drawn out at {a} litres every minute.', 'Sebuah dram mengandungi {b} liter minyak. Minyak dikeluarkan sebanyak {a} liter setiap minit.', ['the amount of oil left (in litres)', 'jumlah minyak yang tinggal (dalam liter)'], ['the number of minutes', 'bilangan minit'], 'V', 't', 0, [3, 10], [100, 300, 10], [2, 10], ['', ' litres', ' liter'], ['the litres drawn out each minute', 'liter yang dikeluarkan setiap minit'], ['the amount at the start', 'jumlah pada permulaan']),
    ctx('At the foot of a hill the temperature is {b} °C. It falls by {a} °C for every kilometre climbed.', 'Di kaki bukit, suhunya ialah {b} °C. Suhu menurun {a} °C bagi setiap kilometer yang didaki.', ['the temperature (in °C)', 'suhu (dalam °C)'], ['the height climbed (in km)', 'ketinggian yang didaki (dalam km)'], 'T', 'h', 0, [4, 7], [26, 34], [1, 4], ['', ' °C', ' °C'], ['the fall in temperature per kilometre', 'penurunan suhu bagi setiap kilometer'], ['the temperature at the foot of the hill', 'suhu di kaki bukit']),
  ];
  const sent = (c, d) => tf(c.e, c.m, d);
  const nm = (c) => (k) => T(c[k][0], c[k][1]);
  const vT = (c, v) => T(`${c.u[0]}${v}${c.u[1]}`, `${c.u[0]}${v}${c.u[2]}`);
  const fm = (c, a, b) => c.yv + ' = ' + (c.up ? lin(a, b, c.xv) : poly([[b, ''], [-a, c.xv]]));
  const dr = (r, c) => {
    const a = r.step(c.a[0], c.a[1], c.a[2] || 1), b = r.step(c.b[0], c.b[1], c.b[2] || 1), x = r.int(c.xr[0], c.xr[1]);
    const y = c.up ? a * x + b : b - a * x;
    need(y > 0);
    return { a, b, x, y };
  };
  const YV = (c) => `$${c.yv}$`, XV = (c) => `$${c.xv}$`;
  /* working lines for the "fixed + rate" contexts */
  const ctxL = (c, d) => (c.up
    ? T(`${cap(c.am[0])} $= ${d.a}$ multiplies ${XV(c)}; ${c.bm[0]} $= ${d.b}$ is the constant.`,
      `${cap(c.am[1])} $= ${d.a}$ didarab dengan ${XV(c)}; ${c.bm[1]} $= ${d.b}$ ialah pemalar.`)
    : T(`${cap(c.bm[0])} $= ${d.b}$ is the starting value; ${c.am[0]} $= ${d.a}$ is taken away for each unit of ${XV(c)}.`,
      `${cap(c.bm[1])} $= ${d.b}$ ialah nilai permulaan; ${c.am[1]} $= ${d.a}$ ditolak bagi setiap unit ${XV(c)}.`));
  const fmL = (c, a, b, pre) => (pre || '') + `$${fm(c, a, b)}$`;
  const askF = (c) => T(` Write a formula for ${c.y[0]}, ${YV(c)}, in terms of ${c.x[0]}, ${XV(c)}.`, ` Tulis satu rumus bagi ${c.y[1]}, ${YV(c)}, dalam sebutan ${c.x[1]}, ${XV(c)}.`);
  const pn = (c) => T(`${c.y[0]}, ${YV(c)},`, `${c.y[1]}, ${YV(c)},`);
  const evalAt = (c, d, x) => (c.up ? d.a * x + d.b : d.b - d.a * x);
  const subL = (c, d, x, pre) => (pre || '') + `$${c.yv} = ${c.up ? `${d.a}(${x}) + ${d.b}` : `${d.b} - ${d.a}(${x})`} = ${evalAt(c, d, x)}$`;
  const solveL = (c, d, y, pre) => (pre || '') + (c.up
    ? `$${d.a}${c.xv} + ${d.b} = ${y}$, $${d.a}${c.xv} = ${y - d.b}$, $${c.xv} = ${(y - d.b) / d.a}$`
    : `$${d.b} - ${d.a}${c.xv} = ${y}$, $${d.a}${c.xv} = ${d.b - y}$, $${c.xv} = ${(d.b - y) / d.a}$`);

  /* ===== phrase -> formula list (k, m: small constants) ===== */
  const PH = [
    ['${y}$ is {k} more than ${x}$', '${y}$ ialah {k} lebih daripada ${x}$', '{x} + {k}', ['{k} - {x}', '{k}{x}', '{x} - {k}'], '"More than" means add, so start with ${x}$ and add {k}.', '"Lebih daripada" bermaksud tambah, jadi mulakan dengan ${x}$ dan tambah {k}.'],
    ['${y}$ is {k} less than ${x}$', '${y}$ ialah {k} kurang daripada ${x}$', '{x} - {k}', ['{k} - {x}', '{x} + {k}', '{k}{x}'], '"Less than" means subtract, and the order is reversed: ${x}$ minus {k}.', '"Kurang daripada" bermaksud tolak, dan susunannya terbalik: ${x}$ tolak {k}.'],
    ['${y}$ is {m} times ${x}$', '${y}$ ialah {m} kali ${x}$', '{m}{x}', ['\\dfrac{{x}}{{m}}', '{x} + {m}', '{x}^{{m}}'], '"{m} times" means multiply ${x}$ by {m}.', '"{m} kali" bermaksud darab ${x}$ dengan {m}.'],
    ['${y}$ is {k} more than {m} times ${x}$', '${y}$ ialah {k} lebih daripada {m} kali ${x}$', '{m}{x} + {k}', ['{m}({x} + {k})', '{k}{x} + {m}', '{m} + {k}{x}'], 'Multiply first, then add: {m} lots of ${x}$, then {k} more.', 'Darab dahulu, kemudian tambah: {m} kumpulan ${x}$, kemudian tambah {k}.'],
    ['${y}$ is {k} less than {m} times ${x}$', '${y}$ ialah {k} kurang daripada {m} kali ${x}$', '{m}{x} - {k}', ['{k} - {m}{x}', '{m}({x} - {k})', '{k}{x} - {m}'], 'Multiply first, then take {k} away from the product {m}${x}$.', 'Darab dahulu, kemudian tolak {k} daripada hasil darab {m}${x}$.'],
    ['${y}$ is {m} times the sum of ${x}$ and ${z}$', '${y}$ ialah {m} kali hasil tambah ${x}$ dan ${z}$', '{m}({x} + {z})', ['{m}{x} + {z}', '{m} + {x} + {z}', '{m}{x}{z}'], 'The sum is worked out first, so it needs brackets before multiplying by {m}.', 'Hasil tambah dikira dahulu, jadi ia perlu diletakkan dalam kurungan sebelum didarab dengan {m}.'],
    ['${y}$ is the difference between ${x}$ and ${z}$, multiplied by {m}', '${y}$ ialah beza antara ${x}$ dan ${z}$, didarab dengan {m}', '{m}({x} - {z})', ['{m}{x} - {z}', '{x} - {m}{z}', '{m}({z} - {x})'], 'Find the difference ${x} - {z}$ first, then multiply the whole bracket by {m}.', 'Cari beza ${x} - {z}$ dahulu, kemudian darab keseluruhan kurungan dengan {m}.'],
    ['${y}$ is half of the sum of ${x}$ and ${z}$', '${y}$ ialah separuh daripada hasil tambah ${x}$ dan ${z}$', '\\dfrac{{x} + {z}}{2}', ['\\dfrac{{x}}{2} + {z}', '2({x} + {z})', '{x} + \\dfrac{{z}}{2}'], '"Half of the sum" means add first, then divide the whole sum by 2.', '"Separuh daripada hasil tambah" bermaksud tambah dahulu, kemudian bahagi keseluruhan hasil tambah dengan 2.'],
    ['${y}$ is the product of ${x}$ and ${z}$, divided by {m}', '${y}$ ialah hasil darab ${x}$ dan ${z}$, dibahagi dengan {m}', '\\dfrac{{x}{z}}{{m}}', ['\\dfrac{{x}}{{m}} + {z}', '{m}{x}{z}', '\\dfrac{{m}}{{x}{z}}'], 'The product ${x}{z}$ is the numerator and {m} is the denominator.', 'Hasil darab ${x}{z}$ ialah pengangka dan {m} ialah penyebut.'],
    ['${y}$ is the square of ${x}$, increased by {k}', '${y}$ ialah kuasa dua ${x}$, ditambah {k}', '{x}^2 + {k}', ['({x} + {k})^2', '2{x} + {k}', '{x}^2 + {k}^2'], 'Square ${x}$ first, then add {k}: only ${x}$ is squared.', 'Kuasa duakan ${x}$ dahulu, kemudian tambah {k}: hanya ${x}$ yang dikuasaduakan.'],
    ['${y}$ is the square of the sum of ${x}$ and {k}', '${y}$ ialah kuasa dua bagi hasil tambah ${x}$ dan {k}', '({x} + {k})^2', ['{x}^2 + {k}^2', '{x}^2 + {k}', '2({x} + {k})'], 'The whole sum is squared, so it must be inside brackets before the power is applied.', 'Keseluruhan hasil tambah dikuasaduakan, jadi ia mesti berada dalam kurungan sebelum kuasa dikenakan.'],
    ['${y}$ is {k} minus the square of ${x}$', '${y}$ ialah {k} ditolak kuasa dua ${x}$', '{k} - {x}^2', ['({k} - {x})^2', '{x}^2 - {k}', '{k} - 2{x}'], 'Square ${x}$ first, then subtract that square from {k}.', 'Kuasa duakan ${x}$ dahulu, kemudian tolak kuasa dua itu daripada {k}.'],
    ['${y}$ is ${x}$ divided by {m}, and then {k} is added', '${y}$ ialah ${x}$ dibahagi dengan {m}, kemudian {k} ditambah', '\\dfrac{{x}}{{m}} + {k}', ['\\dfrac{{x} + {k}}{{m}}', '{m}{x} + {k}', '\\dfrac{{m}}{{x}} + {k}'], 'Only ${x}$ is divided by {m}; the {k} is added afterwards.', 'Hanya ${x}$ dibahagi dengan {m}; {k} ditambah selepas itu.'],
    ['{k} is added to ${x}$ and the result is divided by {m} to give ${y}$', '{k} ditambah kepada ${x}$ dan hasilnya dibahagi dengan {m} untuk mendapat ${y}$', '\\dfrac{{x} + {k}}{{m}}', ['\\dfrac{{x}}{{m}} + {k}', '{m}({x} + {k})', '\\dfrac{{m}}{{x} + {k}}'], 'The addition is done first, so ${x} + {k}$ is the whole numerator.', 'Penambahan dilakukan dahulu, jadi ${x} + {k}$ ialah keseluruhan pengangka.'],
    ['${y}$ is {k} times the cube of ${x}$', '${y}$ ialah {k} kali kuasa tiga ${x}$', '{k}{x}^3', ['({k}{x})^3', '{k}{x}^2', '{x}^3 + {k}'], 'Cube ${x}$ first, then multiply the cube by {k}.', 'Kuasa tigakan ${x}$ dahulu, kemudian darab kuasa tiga itu dengan {k}.'],
    ['${y}$ is the mean of ${x}$, ${z}$ and ${w}$', '${y}$ ialah min bagi ${x}$, ${z}$ dan ${w}$', '\\dfrac{{x} + {z} + {w}}{3}', ['{x} + {z} + \\dfrac{{w}}{3}', '\\dfrac{{x}{z}{w}}{3}', '3({x} + {z} + {w})'], 'Mean = sum of the three values divided by 3.', 'Min = hasil tambah ketiga-tiga nilai dibahagi dengan 3.'],
    ['${y}$ is {m} times ${x}$ minus {k} times ${z}$', '${y}$ ialah {m} kali ${x}$ ditolak {k} kali ${z}$', '{m}{x} - {k}{z}', ['{k}{x} - {m}{z}', '({m}{x} - {k}){z}', '{m}{x} + {k}{z}'], 'Two separate products: {m}${x}$ and {k}${z}$, then subtract the second from the first.', 'Dua hasil darab berasingan: {m}${x}$ dan {k}${z}$, kemudian tolak yang kedua daripada yang pertama.'],
    ['{m} times ${y}$ is equal to ${x}$ plus {k}', '{m} kali ${y}$ sama dengan ${x}$ campur {k}', '{m}{y} = {x} + {k}', ['{y} = {m}{x} + {k}', '{y} + {m} = {x} + {k}', '{m}({y} + {x}) = {k}'], 'Here {m}${y}$ is on the left of the equals sign, so the formula is not yet solved for ${y}$.', 'Di sini {m}${y}$ berada di sebelah kiri tanda sama dengan, jadi rumus ini belum diselesaikan bagi ${y}$.'],
    ['${y}$ is ${x}$ per cent of ${z}$', '${y}$ ialah ${x}$ peratus daripada ${z}$', '\\dfrac{{x}{z}}{100}', ['\\dfrac{{x}}{100} + {z}', '100{x}{z}', '\\dfrac{{z}}{100{x}}'], '"Per cent of" means hundredths, so divide the product ${x}{z}$ by 100.', '"Peratus daripada" bermaksud perseratus, jadi bahagi hasil darab ${x}{z}$ dengan 100.'],
    ['${y}$ is the sum of ${x}$ and ${z}$, subtracted from {k}', '${y}$ ialah {k} ditolak hasil tambah ${x}$ dan ${z}$', '{k} - ({x} + {z})', ['{k} - {x} + {z}', '({x} + {z}) - {k}', '{k}({x} + {z})'], '"Subtracted from {k}" means start at {k} and take the whole sum away, so brackets are needed.', '"Ditolak daripada {k}" bermaksud mulakan dengan {k} dan tolak keseluruhan hasil tambah itu, jadi kurungan diperlukan.'],
  ];
  const LETS = [['y', 'x', 'z', 'w'], ['p', 'q', 'r', 's'], ['V', 'a', 'b', 'c'], ['T', 'u', 'v', 't'], ['M', 'm', 'n', 'q'], ['A', 'e', 'f', 'g']];
  const phDraw = (r) => {
    const [y, x, z, w] = r.pick(LETS);
    const o = { y, x, z, w, k: r.int(2, 9), m: r.int(2, 9) };
    const ph = r.pick(PH);
    return { ph, o, i: PH.indexOf(ph), left: ph[2].indexOf('{y} =') < 0 };
  };
  const phFormula = (d, rhs) => (d.left ? `${d.o.y} = ${fill(rhs, d.o)}` : fill(rhs, d.o));

  /* ===== geometry formulae (name, letters, formula, evaluator) ===== */
  const SH = [
    ['the perimeter $P$ of a rectangle of length $l$ and width $w$', 'perimeter $P$ sebuah segi empat tepat yang panjangnya $l$ dan lebarnya $w$', 'P = 2(l + w)', ['l', 'w'], (v) => 2 * (v.l + v.w), 'cm', 'Perimeter is the total of the four sides: $l + w + l + w = 2(l + w)$.', 'Perimeter ialah jumlah keempat-empat sisi: $l + w + l + w = 2(l + w)$.', (v) => `P = 2(${v.l} + ${v.w}) = 2(${v.l + v.w})`],
    ['the perimeter $P$ of a square of side $s$', 'perimeter $P$ sebuah segi empat sama yang sisinya $s$', 'P = 4s', ['s'], (v) => 4 * v.s, 'cm', 'All four sides are equal, so $P = s + s + s + s = 4s$.', 'Keempat-empat sisi sama panjang, jadi $P = s + s + s + s = 4s$.', (v) => `P = 4(${v.s})`],
    ['the perimeter $P$ of an equilateral triangle of side $a$', 'perimeter $P$ sebuah segi tiga sama sisi yang sisinya $a$', 'P = 3a', ['a'], (v) => 3 * v.a, 'cm', 'All three sides are equal, so $P = a + a + a = 3a$.', 'Ketiga-tiga sisi sama panjang, jadi $P = a + a + a = 3a$.', (v) => `P = 3(${v.a})`],
    ['the perimeter $P$ of an isosceles triangle with two equal sides $a$ and a base $b$', 'perimeter $P$ sebuah segi tiga sama kaki yang mempunyai dua sisi sama $a$ dan tapak $b$', 'P = 2a + b', ['a', 'b'], (v) => 2 * v.a + v.b, 'cm', 'Two equal sides plus the base: $P = a + a + b = 2a + b$.', 'Dua sisi sama tambah tapak: $P = a + a + b = 2a + b$.', (v) => `P = 2(${v.a}) + ${v.b}`],
    ['the area $A$ of a triangle with base $b$ and height $h$', 'luas $A$ sebuah segi tiga yang tapaknya $b$ dan tingginya $h$', 'A = \\dfrac{1}{2}bh', ['b', 'h'], (v) => (v.b * v.h) / 2, 'cm$^2$', 'A triangle is half of a rectangle with the same base and height.', 'Segi tiga ialah separuh daripada segi empat tepat yang sama tapak dan tingginya.', (v) => `A = \\dfrac{1}{2}(${v.b})(${v.h})`],
    ['the area $A$ of a parallelogram with base $b$ and height $h$', 'luas $A$ sebuah segi empat selari yang tapaknya $b$ dan tingginya $h$', 'A = bh', ['b', 'h'], (v) => v.b * v.h, 'cm$^2$', 'Cut off one end triangle and move it across: the parallelogram becomes a rectangle of base $b$ and height $h$.', 'Potong satu segi tiga di hujung dan alihkannya: segi empat selari itu menjadi segi empat tepat bertapak $b$ dan tinggi $h$.', (v) => `A = (${v.b})(${v.h})`],
    ['the area $A$ of a trapezium with parallel sides $a$ and $b$ and height $h$', 'luas $A$ sebuah trapezium yang sisi selarinya $a$ dan $b$ dan tingginya $h$', 'A = \\dfrac{1}{2}(a + b)h', ['a', 'b', 'h'], (v) => ((v.a + v.b) * v.h) / 2, 'cm$^2$', 'Take the average of the two parallel sides, then multiply by the height.', 'Ambil purata dua sisi selari, kemudian darab dengan tinggi.', (v) => `A = \\dfrac{1}{2}(${v.a} + ${v.b})(${v.h}) = \\dfrac{1}{2}(${v.a + v.b})(${v.h})`],
    ['the area $A$ of a rhombus with diagonals $p$ and $q$', 'luas $A$ sebuah rombus yang pepenjurunya $p$ dan $q$', 'A = \\dfrac{1}{2}pq', ['p', 'q'], (v) => (v.p * v.q) / 2, 'cm$^2$', 'The diagonals cut the rhombus into four right-angled triangles, giving half the product of the diagonals.', 'Pepenjuru membahagi rombus kepada empat segi tiga bersudut tegak, memberi separuh hasil darab pepenjuru.', (v) => `A = \\dfrac{1}{2}(${v.p})(${v.q})`],
    ['the volume $V$ of a cuboid with length $l$, width $w$ and height $h$', 'isi padu $V$ sebuah kuboid yang panjangnya $l$, lebarnya $w$ dan tingginya $h$', 'V = lwh', ['l', 'w', 'h'], (v) => v.l * v.w * v.h, 'cm$^3$', 'Volume = area of the base $lw$ multiplied by the height $h$.', 'Isi padu = luas tapak $lw$ didarab dengan tinggi $h$.', (v) => `V = (${v.l})(${v.w})(${v.h})`],
    ['the volume $V$ of a cube of side $s$', 'isi padu $V$ sebuah kubus yang sisinya $s$', 'V = s^3', ['s'], (v) => v.s ** 3, 'cm$^3$', 'Every edge of a cube is the same, so $V = s \\times s \\times s = s^3$.', 'Setiap rusuk kubus adalah sama, jadi $V = s \\times s \\times s = s^3$.', (v) => `V = ${v.s}^3`],
    ['the total surface area $A$ of a cube of side $s$', 'jumlah luas permukaan $A$ sebuah kubus yang sisinya $s$', 'A = 6s^2', ['s'], (v) => 6 * v.s * v.s, 'cm$^2$', 'A cube has 6 square faces, each of area $s^2$.', 'Kubus mempunyai 6 permukaan segi empat sama, setiap satu berluas $s^2$.', (v) => `A = 6(${v.s})^2 = 6(${v.s * v.s})`],
    ['the perimeter $P$ of a regular polygon with $n$ sides, each of length $a$', 'perimeter $P$ sebuah poligon sekata yang mempunyai $n$ sisi, setiap satunya $a$', 'P = na', ['n', 'a'], (v) => v.n * v.a, 'cm', 'A regular polygon has $n$ equal sides, each of length $a$.', 'Poligon sekata mempunyai $n$ sisi sama panjang, setiap satu $a$.', (v) => `P = (${v.n})(${v.a})`],
    ['the sum $S$ of the interior angles of a polygon with $n$ sides', 'hasil tambah $S$ sudut pedalaman sebuah poligon yang mempunyai $n$ sisi', 'S = 180^\\circ(n - 2)', ['n'], (v) => 180 * (v.n - 2), 'degrees', 'A polygon with $n$ sides splits into $n - 2$ triangles, each with an angle sum of $180^\\circ$.', 'Poligon bersisi $n$ terbahagi kepada $n - 2$ segi tiga, setiap satu dengan hasil tambah sudut $180^\\circ$.', (v) => `S = 180^\\circ(${v.n} - 2) = 180^\\circ \\times ${v.n - 2}`],
    ['the surface area $A$ of the four walls of a room with length $l$, width $w$ and height $h$', 'luas $A$ empat dinding sebuah bilik yang panjangnya $l$, lebarnya $w$ dan tingginya $h$', 'A = 2h(l + w)', ['l', 'w', 'h'], (v) => 2 * v.h * (v.l + v.w), 'm$^2$', 'Two walls are $l \\times h$ and two are $w \\times h$, so $A = 2lh + 2wh = 2h(l + w)$.', 'Dua dinding ialah $l \\times h$ dan dua lagi $w \\times h$, jadi $A = 2lh + 2wh = 2h(l + w)$.', (v) => `A = 2(${v.h})(${v.l} + ${v.w}) = 2(${v.h})(${v.l + v.w})`],
  ];
  const shVals = (r, sh) => {
    const v = {};
    for (const k of sh[3]) v[k] = k === 'n' ? r.int(5, 9) : r.int(3, 12);
    return v;
  };
  const shUnit = (u) => (u === 'degrees' ? T('°', '°') : T(' ' + u, ' ' + u));

  /* ===== 3.1 easy ===== */
  const e31 = [
    (r) => { const c = r.pick(CT), d = dr(r, c); return { q: Q(sent(c, d), askF(c)), a: T(`$${fm(c, d.a, d.b)}$`), w: W(ctxL(c, d), fmL(c, d.a, d.b)), sp: 's' }; },
    (r) => {
      const c = r.pick(CT), d = dr(r, c);
      return { q: Q(sent(c, d), ' ', P([Q('Write a formula for ', pn(c), ' in terms of ', XV(c), '.'), T(`Find ${YV(c)} when ${XV(c)} = ${d.x}.`, `Cari ${YV(c)} apabila ${XV(c)} = ${d.x}.`)])), a: P([T(`$${fm(c, d.a, d.b)}$`), T(`$${c.yv} = ${d.y}$`)]), w: W(ctxL(c, d), fmL(c, d.a, d.b, '(a) '), subL(c, d, d.x, '(b) ')), sp: 'm' };
    },
    (r) => {
      const c = r.pick(CT), d = dr(r, c), f = fm(c, d.a, d.b);
      return { q: T(`In the formula $${f}$, ${YV(c)} is ${c.y[0]} and ${XV(c)} is ${c.x[0]}. What do the numbers ${d.a} and ${d.b} represent?`, `Dalam rumus $${f}$, ${YV(c)} ialah ${c.y[1]} dan ${XV(c)} ialah ${c.x[1]}. Apakah yang diwakili oleh nombor ${d.a} dan ${d.b}?`), a: T(`${d.a}: ${c.am[0]}; ${d.b}: ${c.bm[0]}.`, `${d.a}: ${c.am[1]}; ${d.b}: ${c.bm[1]}.`), w: W(T(`$${d.a}$ multiplies ${XV(c)}, so it is the amount for each unit of ${c.x[0]}.`, `$${d.a}$ didarab dengan ${XV(c)}, jadi ia ialah amaun bagi setiap unit ${c.x[1]}.`), T(`$${d.b}$ stands alone, so it does not depend on ${XV(c)}: it is ${c.bm[0]}.`, `$${d.b}$ berdiri sendiri, jadi ia tidak bergantung pada ${XV(c)}: ia ialah ${c.bm[1]}.`)), sp: 's' };
    },
    (r) => {
      const c = r.pick(CT), d = dr(r, c);
      const blank = c.up ? `${c.yv} = \\square\\, ${c.xv} + \\square` : `${c.yv} = \\square - \\square\\, ${c.xv}`;
      return { q: Q(sent(c, d), T(` Complete the formula for ${c.y[0]} in terms of ${c.x[0]}: $${blank}$`, ` Lengkapkan rumus bagi ${c.y[1]} dalam sebutan ${c.x[1]}: $${blank}$`)), a: T(`$${fm(c, d.a, d.b)}$`), w: W(ctxL(c, d), fmL(c, d.a, d.b)), sp: 's' };
    },
    (r) => {
      const d = phDraw(r), rhs = d.ph[2];
      return { q: T(`Write as a formula: "${fill(d.ph[0], d.o)}."`, `Tulis sebagai satu rumus: "${fill(d.ph[1], d.o)}."`), a: T(`$${phFormula(d, rhs)}$`), w: W(tf(d.ph[4], d.ph[5], d.o), `$${phFormula(d, rhs)}$`), sp: 's' };
    },
    (r) => {
      const d = phDraw(r), rhs = d.ph[2], sh = d.left ? (x) => `${d.o.y} = ${fill(x, d.o)}` : (x) => fill(x, d.o);
      const m = mcq(r, sh(rhs), d.ph[3].map(sh));
      return { q: T(`Which formula matches the statement "${fill(d.ph[0], d.o)}"?<br>${m.q}`, `Rumus yang manakah sepadan dengan pernyataan "${fill(d.ph[1], d.o)}"?<br>${m.q}`), a: T(m.ans), w: W(tf(d.ph[4], d.ph[5], d.o), `$${sh(rhs)}$`), sp: 'xs' };
    },
    (r) => {
      const sh = r.pick(SH);
      return { q: T(`Write a formula for ${sh[0]}.`, `Tulis satu rumus bagi ${sh[1]}.`), a: T(`$${sh[2]}$`), w: W(T(sh[6], sh[7]), `$${sh[2]}$`), sp: 's' };
    },
    (r) => {
      const sh = r.pick(SH.filter((s) => s[5] !== 'degrees' || true)), v = shVals(r, sh);
      const vals = sh[3].map((k) => `$${k} = ${v[k]}$`).join(', ');
      const ans = sh[4](v);
      return { q: T(`The formula for ${sh[0]} is $${sh[2]}$. Find its value when ${vals}.`, `Rumus bagi ${sh[1]} ialah $${sh[2]}$. Cari nilainya apabila ${vals}.`), a: T(`$${n(ans)}$`), w: W(`$${sh[2]}$`, `$${sh[8](v)} = ${n(ans)}$`), sp: 's' };
    },
    (r) => {
      const it = r.pick(B().items), p = r.int(it.lo, it.hi + 2), t = r.int(3, 9);
      const f = r.pick([0, 1, 2]);
      if (f === 0) return { q: T(`One ${it.en1} costs RM${p}. Write a formula for the total cost $C$ (in RM) of $n$ ${it.en}.`, `Harga sebuah ${it.ms} ialah RM${p}. Tulis satu rumus bagi jumlah kos $C$ (dalam RM) bagi $n$ ${it.ms}.`), a: T(`$C = ${p}n$`), w: W(T(`One ${it.en1} costs RM${p}, so $n$ of them cost $${p} \\times n$.`, `Harga sebuah ${it.ms} ialah RM${p}, jadi $n$ buah berharga $${p} \\times n$.`), `$C = ${p}n$`), sp: 's' };
      if (f === 1) return { q: T(`A prize of RM$T$ is shared equally among $n$ winners. Write a formula for the amount $s$ (in RM) that each winner receives.`, `Hadiah RM$T$ dibahagi sama banyak kepada $n$ orang pemenang. Tulis satu rumus bagi jumlah $s$ (dalam RM) yang diterima oleh setiap pemenang.`), a: T('$s = \\dfrac{T}{n}$'), w: W(T('Sharing equally means dividing the total prize by the number of winners.', 'Membahagi sama banyak bermaksud membahagi jumlah hadiah dengan bilangan pemenang.'), '$s = \\dfrac{T}{n}$'), sp: 's' };
      return { q: T(`A cyclist rides at a constant speed of $v$ km/h for $t$ hours. Write a formula for the distance $d$ (in km) travelled.`, `Seorang penunggang basikal menunggang pada laju malar $v$ km/j selama $t$ jam. Tulis satu rumus bagi jarak $d$ (dalam km) yang dilalui.`), a: T('$d = vt$'), w: W(T('Distance = speed $\\times$ time.', 'Jarak = laju $\\times$ masa.'), '$d = vt$'), sp: 's' };
    },
    (r) => {
      const cs = [['s = vt', 's, v, t', '(none)'], ['y = 4x + 9', 'x, y', '4, 9'], ['d = 60t', 'd, t', '60'], ['V = lwh', 'V, l, w, h', '(none)'], ['I = \\dfrac{Prt}{100}', 'I, P, r, t', '100'], ['F = \\dfrac{9}{5}C + 32', 'F, C', '9, 5, 32'], ['p = 3q - 2', 'p, q', '3, 2']];
      const c = r.pick(cs);
      return { q: T(`In the formula $${c[0]}$, name the variables and the constants (fixed numbers).`, `Dalam rumus $${c[0]}$, namakan pemboleh ubah dan pemalar (nombor tetap).`), a: T(`Variables: $${c[1]}$; constants: ${c[2] === '(none)' ? 'none' : '$' + c[2] + '$'}.`, `Pemboleh ubah: $${c[1]}$; pemalar: ${c[2] === '(none)' ? 'tiada' : '$' + c[2] + '$'}.`), w: W(T(`In $${c[0]}$ every letter stands for a quantity that can change, so the letters are the variables; a number that stays the same in every case is a constant.`, `Dalam $${c[0]}$ setiap huruf mewakili kuantiti yang boleh berubah, jadi huruf-huruf itu ialah pemboleh ubah; nombor yang kekal sama dalam setiap keadaan ialah pemalar.`)), sp: 's' };
    },
  ];

  /* ===== 3.1 medium ===== */
  const TIER = [
    ['A car park charges RM{a} per hour for the first {h0} hours and RM{b} per hour after that.', 'Sebuah tempat letak kereta mengenakan RM{a} sejam bagi {h0} jam pertama dan RM{b} sejam selepas itu.', ['the parking fee $C$ (in RM)', 'bayaran parkir $C$ (dalam RM)'], ['hours parked', 'jam meletak kereta'], 'C', 'h'],
    ['A courier company charges RM{a} per kg for the first {h0} kg of a parcel and RM{b} per kg for every extra kilogram.', 'Sebuah syarikat kurier mengenakan RM{a} sekilogram bagi {h0} kg pertama sesebuah bungkusan dan RM{b} sekilogram bagi setiap kilogram tambahan.', ['the delivery charge $C$ (in RM)', 'caj penghantaran $C$ (dalam RM)'], ['mass of the parcel in kg', 'jisim bungkusan dalam kg'], 'C', 'm'],
    ['A taxi charges RM{a} for each of the first {h0} km and RM{b} for each km after that.', 'Sebuah teksi mengenakan RM{a} bagi setiap km untuk {h0} km pertama dan RM{b} bagi setiap km selepas itu.', ['the fare $F$ (in RM)', 'tambang $F$ (dalam RM)'], ['distance in km', 'jarak dalam km'], 'F', 'd'],
    ['A tuition centre charges RM{a} for each of the first {h0} lessons in a month and RM{b} for each extra lesson.', 'Sebuah pusat tuisyen mengenakan RM{a} bagi setiap satu daripada {h0} sesi pertama dalam sebulan dan RM{b} bagi setiap sesi tambahan.', ['the monthly fee $T$ (in RM)', 'yuran bulanan $T$ (dalam RM)'], ['lessons attended', 'sesi yang dihadiri'], 'T', 'n'],
    ['A bicycle shop hires out a bicycle at RM{a} per hour for the first {h0} hours and RM{b} per hour for the remaining time.', 'Sebuah kedai menyewakan basikal dengan kadar RM{a} sejam bagi {h0} jam pertama dan RM{b} sejam bagi baki masa.', ['the hire charge $C$ (in RM)', 'bayaran sewa $C$ (dalam RM)'], ['hours of hire', 'jam sewaan'], 'C', 't'],
  ];
  const tierDraw = (r) => {
    const t = r.pick(TIER), a = r.int(3, 9), b = r.int(2, 8), h0 = r.int(2, 5);
    need(a !== b);
    return { t, a, b, h0, o: { a, b, h0 }, f: `${t[4]} = ${a * h0} + ${b}(${t[5]} - ${h0})`, ex: `${t[4]} = ${poly([[b, t[5]], [(a - b) * h0, '']])}`, cond: `${t[5]} > ${h0}` };
  };
  const tierW = (d) => [T(`First ${d.h0}: $${d.a} \\times ${d.h0} = ${d.a * d.h0}$`, `${d.h0} yang pertama: $${d.a} \\times ${d.h0} = ${d.a * d.h0}$`), T(`After that: $${d.b}$ for each of the $${d.t[5]} - ${d.h0}$ remaining.`, `Selepas itu: $${d.b}$ bagi setiap satu daripada $${d.t[5]} - ${d.h0}$ yang selebihnya.`), `$${d.f}$`, T(`Expanded: $${d.ex}$`, `Dikembangkan: $${d.ex}$`)];
  const tierAsk = (d) => T(` Write a formula for ${d.t[2][0]} when the ${d.t[3][0]} $${d.t[5]}$ is more than ${d.h0}.`, ` Tulis satu rumus bagi ${d.t[2][1]} apabila ${d.t[3][1]} $${d.t[5]}$ melebihi ${d.h0}.`);
  /* table of a linear relation */
  const XS = [[1, 2, 3, 4], [2, 4, 6, 8], [0, 1, 2, 3], [5, 10, 15, 20], [3, 6, 9, 12], [10, 20, 30, 40]];
  const tbl = (c, xs, ys) => SPM.table([[`$${c.xv}$`].concat(xs.map(n)), [`$${c.yv}$`].concat(ys.map(n))], { rowHead: true });
  const tabW = (c, d, xs, ys, i0, i1) => { i0 = i0 || 0; i1 = i1 === undefined ? 1 : i1; const st = xs[i1] - xs[i0], dv = Math.abs(ys[i1] - ys[i0]); return [
    T(`When ${XV(c)} increases by $${st}$, ${YV(c)} ${c.up ? 'increases' : 'decreases'} by $${dv}$, so the rate is $${dv} \\div ${st} = ${d.a}$.`, `Apabila ${XV(c)} bertambah $${st}$, ${YV(c)} ${c.up ? 'bertambah' : 'berkurang'} $${dv}$, jadi kadarnya ialah $${dv} \\div ${st} = ${d.a}$.`),
    T(`When $${c.xv} = ${xs[i0]}$, $${c.yv} = ${ys[i0]}$, so the constant is $${ys[i0]} ${c.up ? '-' : '+'} ${d.a} \\times ${xs[i0]} = ${d.b}$.`, `Apabila $${c.xv} = ${xs[i0]}$, $${c.yv} = ${ys[i0]}$, jadi pemalarnya ialah $${ys[i0]} ${c.up ? '-' : '+'} ${d.a} \\times ${xs[i0]} = ${d.b}$.`)]; };
  const PAT = [['triangles', 'segi tiga', 3], ['squares', 'segi empat sama', 4], ['pentagons', 'pentagon', 5], ['hexagons', 'heksagon', 6]];
  const wrongs = (c, a, b) => c.up ? [`${c.yv} = ${lin(b, a, c.xv)}`, `${c.yv} = ${a}(${c.xv} + ${b})`, `${c.yv} = ${a + b}${c.xv}`] : [`${c.yv} = ${poly([[a, c.xv], [-b, '']])}`, `${c.yv} = ${b}(${c.xv} - ${a})`, `${c.yv} = ${b - a}${c.xv}`];
  const whyWrong = (c, a, b, i) => [
    T(`${a} is ${c.am[0]}, so it multiplies ${XV(c)}; ${b} is ${c.bm[0]}.`, `${a} ialah ${c.am[1]}, jadi ia didarab dengan ${XV(c)}; ${b} ialah ${c.bm[1]}.`),
    T(`Bracket error: only ${XV(c)} is multiplied by ${a}; ${b} (${c.bm[0]}) is not multiplied.`, `Kesilapan kurungan: hanya ${XV(c)} yang didarab dengan ${a}; ${b} (${c.bm[1]}) tidak didarab.`),
    T(`The numbers ${a} and ${b} cannot be combined: one is multiplied by ${XV(c)} and the other is not.`, `Nombor ${a} dan ${b} tidak boleh digabungkan: satu didarab dengan ${XV(c)} dan satu lagi tidak.`),
  ][i];
  const SHE = [
    (k, m) => [`The length of a rectangle is ${k} cm more than its width $w$ cm. Write a formula for its perimeter $P$ in terms of $w$.`, `Panjang sebuah segi empat tepat ialah ${k} cm lebih daripada lebarnya, $w$ cm. Tulis satu rumus bagi perimeternya $P$ dalam sebutan $w$.`, `P = ${poly([[4, 'w'], [2 * k, '']])}`, `Length $= w + ${k}$, so $P = 2(w + ${k} + w) = 2(2w + ${k}) = ${poly([[4, 'w'], [2 * k, '']])}$`, `Panjang $= w + ${k}$, jadi $P = 2(w + ${k} + w) = 2(2w + ${k}) = ${poly([[4, 'w'], [2 * k, '']])}$`],
    (k, m) => [`The length of a rectangle is ${k} cm more than its width $w$ cm. Write a formula for its area $A$ in terms of $w$.`, `Panjang sebuah segi empat tepat ialah ${k} cm lebih daripada lebarnya, $w$ cm. Tulis satu rumus bagi luasnya $A$ dalam sebutan $w$.`, `A = w(w + ${k}) = w^2 + ${k}w`, `Length $= w + ${k}$, so $A = w(w + ${k}) = w^2 + ${k}w$`, `Panjang $= w + ${k}$, jadi $A = w(w + ${k}) = w^2 + ${k}w$`],
    (k, m) => [`The length of a rectangle is ${m} times its width $w$ cm. Write a formula for its perimeter $P$ in terms of $w$.`, `Panjang sebuah segi empat tepat ialah ${m} kali lebarnya, $w$ cm. Tulis satu rumus bagi perimeternya $P$ dalam sebutan $w$.`, `P = ${2 * (m + 1)}w`, `Length $= ${m}w$, so $P = 2(${m}w + w) = 2(${m + 1}w) = ${2 * (m + 1)}w$`, `Panjang $= ${m}w$, jadi $P = 2(${m}w + w) = 2(${m + 1}w) = ${2 * (m + 1)}w$`],
    (k, m) => [`The height of a triangle is ${k} cm less than its base $b$ cm. Write a formula for its area $A$ in terms of $b$.`, `Tinggi sebuah segi tiga ialah ${k} cm kurang daripada tapaknya, $b$ cm. Tulis satu rumus bagi luasnya $A$ dalam sebutan $b$.`, `A = \\dfrac{1}{2}b(b - ${k})`, `Height $= b - ${k}$, so $A = \\dfrac{1}{2} \\times b \\times (b - ${k})$`, `Tinggi $= b - ${k}$, jadi $A = \\dfrac{1}{2} \\times b \\times (b - ${k})$`],
    (k, m) => [`An isosceles triangle has two equal sides of $x$ cm and a base that is ${k} cm shorter than each equal side. Write a formula for its perimeter $P$.`, `Sebuah segi tiga sama kaki mempunyai dua sisi sama panjang $x$ cm dan tapak yang ${k} cm lebih pendek daripada setiap sisi yang sama. Tulis satu rumus bagi perimeternya $P$.`, `P = ${poly([[3, 'x'], [-k, '']])}`, `Base $= x - ${k}$, so $P = x + x + (x - ${k}) = ${poly([[3, 'x'], [-k, '']])}$`, `Tapak $= x - ${k}$, jadi $P = x + x + (x - ${k}) = ${poly([[3, 'x'], [-k, '']])}$`],
    (k, m) => [`The three sides of a triangle are $x$ cm, $(x + ${k})$ cm and $(x + ${2 * k})$ cm. Write a formula for its perimeter $P$.`, `Tiga sisi sebuah segi tiga ialah $x$ cm, $(x + ${k})$ cm dan $(x + ${2 * k})$ cm. Tulis satu rumus bagi perimeternya $P$.`, `P = ${poly([[3, 'x'], [3 * k, '']])}`, `Add the three sides: $P = x + (x + ${k}) + (x + ${2 * k}) = ${poly([[3, 'x'], [3 * k, '']])}$`, `Tambah ketiga-tiga sisi: $P = x + (x + ${k}) + (x + ${2 * k}) = ${poly([[3, 'x'], [3 * k, '']])}$`],
    (k, m) => [`A trapezium has parallel sides $x$ cm and $(x + ${k})$ cm, and a height of ${m} cm. Write a formula for its area $A$.`, `Sebuah trapezium mempunyai sisi selari $x$ cm dan $(x + ${k})$ cm, dan tinggi ${m} cm. Tulis satu rumus bagi luasnya $A$.`, `A = \\dfrac{1}{2}(2x + ${k})(${m}) = ${m}x + ${Fr.tex(Fr.make(m * k, 2))}`, `Add the parallel sides, halve, then multiply by the height: $A = \\dfrac{1}{2}(x + x + ${k})(${m})$`, `Tambah sisi selari, bahagi dua, kemudian darab dengan tinggi: $A = \\dfrac{1}{2}(x + x + ${k})(${m})$`],
    (k, m) => [`A strip ${k} cm wide is added to one side of a square of side $x$ cm to make a rectangle. Write a formula for the perimeter $P$ of the rectangle.`, `Satu jalur selebar ${k} cm ditambah pada satu sisi sebuah segi empat sama yang sisinya $x$ cm untuk membentuk sebuah segi empat tepat. Tulis satu rumus bagi perimeter $P$ segi empat tepat itu.`, `P = ${poly([[4, 'x'], [2 * k, '']])}`, `The rectangle is $x$ by $(x + ${k})$, so $P = 2(x + x + ${k}) = ${poly([[4, 'x'], [2 * k, '']])}$`, `Segi empat tepat itu $x$ kali $(x + ${k})$, jadi $P = 2(x + x + ${k}) = ${poly([[4, 'x'], [2 * k, '']])}$`],
    (k, m) => [`A cuboid has a square base of side $x$ cm and a height that is ${k} cm more than $x$. Write a formula for its volume $V$.`, `Sebuah kuboid mempunyai tapak segi empat sama bersisi $x$ cm dan tinggi yang ${k} cm lebih daripada $x$. Tulis satu rumus bagi isi padunya $V$.`, `V = x^2(x + ${k})`, `Base area $= x^2$ and height $= x + ${k}$, so $V = x^2(x + ${k})$`, `Luas tapak $= x^2$ dan tinggi $= x + ${k}$, jadi $V = x^2(x + ${k})$`],
    (k, m) => [`A square has sides of length $(x + ${k})$ cm. Write a formula for its perimeter $P$ and its area $A$.`, `Sebuah segi empat sama mempunyai sisi $(x + ${k})$ cm. Tulis rumus bagi perimeternya $P$ dan luasnya $A$.`, `P = 4(x + ${k}) = ${poly([[4, 'x'], [4 * k, '']])};\\ A = (x + ${k})^2`, `$P = 4(x + ${k})$ and $A = (x + ${k})(x + ${k}) = (x + ${k})^2$`, `$P = 4(x + ${k})$ dan $A = (x + ${k})(x + ${k}) = (x + ${k})^2$`],
  ];
  const PCT = [
    (r) => { const d = r.pick([10, 20, 25, 30, 40, 50]), f = (100 - d) / 100; return ['An item with marked price RM$p$ is sold at a discount of ' + d + '%. Write a formula for the selling price $S$ (in RM).', 'Sebuah barang berharga tanda RM$p$ dijual dengan diskaun ' + d + '%. Tulis satu rumus bagi harga jualan $S$ (dalam RM).', `S = ${n(f)}p`, `Paying $${100 - d}\\%$ of $p$ gives $S = \\dfrac{${100 - d}}{100}p = ${n(f)}p$`, `Membayar $${100 - d}\\%$ daripada $p$ memberi $S = \\dfrac{${100 - d}}{100}p = ${n(f)}p$`]; },
    (r) => { const t = r.pick([6, 8, 10]); return ['A restaurant adds ' + t + '% tax to the food bill of RM$b$. Write a formula for the total amount $T$ (in RM) to be paid.', 'Sebuah restoran menambah cukai ' + t + '% pada bil makanan RM$b$. Tulis satu rumus bagi jumlah bayaran $T$ (dalam RM).', `T = ${n(1 + t / 100)}b`, `Total $= 100\\% + ${t}\\% = ${100 + t}\\%$ of $b$, so $T = \\dfrac{${100 + t}}{100}b = ${n(1 + t / 100)}b$`, `Jumlah $= 100\\% + ${t}\\% = ${100 + t}\\%$ daripada $b$, jadi $T = \\dfrac{${100 + t}}{100}b = ${n(1 + t / 100)}b$`]; },
    (r) => { const c = r.pick([2, 4, 5, 8, 10]), b = r.int(6, 15) * 100; return ['A salesman earns a basic salary of RM' + b + ' plus a commission of ' + c + '% of his sales RM$s$. Write a formula for his monthly income $W$ (in RM).', 'Seorang jurujual mendapat gaji pokok RM' + b + ' ditambah komisen ' + c + '% daripada jualannya RM$s$. Tulis satu rumus bagi pendapatan bulanannya $W$ (dalam RM).', `W = ${b} + ${n(c / 100)}s`, `Commission $= \\dfrac{${c}}{100}s = ${n(c / 100)}s$, then add the basic salary $${b}$`, `Komisen $= \\dfrac{${c}}{100}s = ${n(c / 100)}s$, kemudian tambah gaji pokok $${b}$`]; },
    (r) => { const P_ = r.int(2, 9) * 1000, rt = r.pick([2, 3, 4, 5, 6]); return ['RM' + rm(P_).slice(2) + ' is deposited at a simple interest rate of ' + rt + '% per year. Write a formula for the interest $I$ (in RM) earned after $t$ years.', 'RM' + rm(P_).slice(2) + ' didepositkan pada kadar faedah mudah ' + rt + '% setahun. Tulis satu rumus bagi faedah $I$ (dalam RM) yang diperoleh selepas $t$ tahun.', `I = ${n((P_ * rt) / 100)}t`, `$I = \\dfrac{Prt}{100} = \\dfrac{${P_} \\times ${rt} \\times t}{100} = ${n((P_ * rt) / 100)}t$`, `$I = \\dfrac{Prt}{100} = \\dfrac{${P_} \\times ${rt} \\times t}{100} = ${n((P_ * rt) / 100)}t$`]; },
    (r) => { const P_ = r.int(2, 9) * 1000, rt = r.pick([2, 4, 5]); return ['RM' + rm(P_).slice(2) + ' is deposited at a simple interest rate of ' + rt + '% per year. Write a formula for the total savings $A$ (in RM) after $t$ years.', 'RM' + rm(P_).slice(2) + ' didepositkan pada kadar faedah mudah ' + rt + '% setahun. Tulis satu rumus bagi jumlah simpanan $A$ (dalam RM) selepas $t$ tahun.', `A = ${P_} + ${n((P_ * rt) / 100)}t`, `Interest $= \\dfrac{${P_} \\times ${rt} \\times t}{100} = ${n((P_ * rt) / 100)}t$; add it to the money put in, $${P_}$`, `Faedah $= \\dfrac{${P_} \\times ${rt} \\times t}{100} = ${n((P_ * rt) / 100)}t$; tambah kepada wang yang didepositkan, $${P_}$`]; },
    (r) => { const p = r.pick([10, 20, 25, 30, 40]); return ['A trader buys goods for RM$c$ and sells them at a profit of ' + p + '%. Write a formula for the selling price $S$ (in RM).', 'Seorang peniaga membeli barang dengan harga RM$c$ dan menjualnya dengan untung ' + p + '%. Tulis satu rumus bagi harga jualan $S$ (dalam RM).', `S = ${n(1 + p / 100)}c`, `Selling price $= 100\\% + ${p}\\% = ${100 + p}\\%$ of $c$, so $S = \\dfrac{${100 + p}}{100}c = ${n(1 + p / 100)}c$`, `Harga jualan $= 100\\% + ${p}\\% = ${100 + p}\\%$ daripada $c$, jadi $S = \\dfrac{${100 + p}}{100}c = ${n(1 + p / 100)}c$`]; },
  ];
  const m31 = [
    (r) => { const d = tierDraw(r); return { q: Q(tf(d.t[0], d.t[1], d.o), tierAsk(d)), a: T(`$${d.f}$`), w: W(...tierW(d)), sp: 'm' }; },
    (r) => {
      const d = tierDraw(r), x = d.h0 + r.int(2, 6), v = d.a * d.h0 + d.b * (x - d.h0);
      return { q: Q(tf(d.t[0], d.t[1], d.o), ' ', P([tierAsk(d), T(`Use your formula to find the amount payable for ${x} (${d.t[3][0]}).`, `Gunakan rumus anda untuk mencari amaun yang perlu dibayar bagi ${x} (${d.t[3][1]}).`)])), a: P([T(`$${d.f}$`), T(`RM${v}`)]), w: W(...tierW(d), `(b) $${d.a * d.h0} + ${d.b}(${x} - ${d.h0}) = ${d.a * d.h0} + ${d.b * (x - d.h0)} = ${v}$`), sp: 'm' };
    },
    (r) => {
      const c = r.pick(CT), d = dr(r, c), xs = r.pick(c.up ? XS : XS.slice(0, 3)), ys = xs.map((x) => (c.up ? d.a * x + d.b : d.b - d.a * x));
      need(ys.every((y) => y > 0));
      return { q: T(`The table shows ${c.y[0]} for different values of ${c.x[0]}.<br>${tbl(c, xs, ys)}Write a formula for ${YV(c)} in terms of ${XV(c)}.`, `Jadual menunjukkan ${c.y[1]} bagi nilai ${c.x[1]} yang berbeza.<br>${tbl(c, xs, ys)}Tulis satu rumus bagi ${YV(c)} dalam sebutan ${XV(c)}.`), a: T(`$${fm(c, d.a, d.b)}$`), w: W(...tabW(c, d, xs, ys), fmL(c, d.a, d.b)), sp: 'm' };
    },
    (r) => {
      const c = r.pick(CT), d = dr(r, c), xs = r.pick(c.up ? XS : XS.slice(0, 3)), ys = xs.map((x) => (c.up ? d.a * x + d.b : d.b - d.a * x));
      need(ys.every((y) => y > 0));
      const k = r.int(1, 3), hid = ys.slice(); hid[k] = null;
      const x2 = xs[k], vis = [0, 1, 2, 3].filter((i) => i !== k);
      return { q: T(`The table shows ${c.y[0]} for different values of ${c.x[0]}. One entry is missing.<br>${tbl(c, xs, hid.map((y) => (y === null ? '?' : y)))}(a) Write a formula for ${YV(c)}. (b) Find the missing value.`, `Jadual menunjukkan ${c.y[1]} bagi nilai ${c.x[1]} yang berbeza. Satu nilai tidak diberikan.<br>${tbl(c, xs, hid.map((y) => (y === null ? '?' : y)))}(a) Tulis satu rumus bagi ${YV(c)}. (b) Cari nilai yang tidak diberikan.`), a: T(`(a) $${fm(c, d.a, d.b)}$ (b) $${ys[k]}$`), w: W(...tabW(c, d, xs, ys, vis[0], vis[1]), fmL(c, d.a, d.b, '(a) '), subL(c, d, x2, '(b) ')), sp: 'm' };
    },
    (r) => {
      const p = r.pick(PAT), f = r.int(0, 2), k = r.int(6, 15);
      const rows = [1, 2, 3, 4].map((i) => (p[2] - 1) * i + 1);
      const tb = SPM.table([['$n$', '1', '2', '3', '4'], ['$S$'].concat(rows.map(String))], { rowHead: true });
      const s = p[2] - 1, N = s * k + 1;
      const base = T(`Matchsticks are used to make ${p[0]} joined in a row. The table shows the number of matchsticks $S$ for $n$ ${p[0]}.<br>${tb}`, `Batang mancis digunakan untuk membentuk ${p[1]} yang bersambung dalam satu baris. Jadual menunjukkan bilangan batang mancis $S$ bagi $n$ ${p[1]}.<br>${tb}`);
      const fo = `S = ${lin(s, 1, 'n')}`;
      const wb = [T(`The number of matchsticks goes up by $${s}$ each time, so the formula contains $${s}n$.`, `Bilangan batang mancis bertambah $${s}$ setiap kali, jadi rumus itu mengandungi $${s}n$.`), T(`When $n = 1$, $S = ${rows[0]}$, so the constant is $${rows[0]} - ${s} = 1$.`, `Apabila $n = 1$, $S = ${rows[0]}$, jadi pemalarnya ialah $${rows[0]} - ${s} = 1$.`), `$${fo}$`];
      if (f === 0) return { q: Q(base, 'Write a formula for $S$ in terms of $n$.'), a: T(`$${fo}$`), w: W(...wb), sp: 's' };
      if (f === 1) return { q: Q(base, P([T('Write a formula for $S$ in terms of $n$.', 'Tulis satu rumus bagi $S$ dalam sebutan $n$.'), T(`How many matchsticks are needed for ${k} ${p[0]}?`, `Berapakah batang mancis yang diperlukan bagi ${k} ${p[1]}?`)])), a: P([T(`$${fo}$`), T(`${N}`)]), w: W(...wb, `(b) $S = ${s}(${k}) + 1 = ${N}$`), sp: 'm' };
      return { q: Q(base, P([T('Write a formula for $S$ in terms of $n$.', 'Tulis satu rumus bagi $S$ dalam sebutan $n$.'), T(`Ali has ${N} matchsticks. How many ${p[0]} can he make?`, `Ali mempunyai ${N} batang mancis. Berapakah ${p[1]} yang boleh dibentuknya?`)])), a: P([T(`$${fo}$`), T(`${k}`)]), w: W(...wb, `(b) $${s}n + 1 = ${N}$`, `$${s}n = ${N - 1}$, $n = ${k}$`), sp: 'm' };
    },
    (r) => {
      const s = r.pick([2, 4, 6]), e = r.int(1, 3), k = r.int(8, 15);
      const rows = [1, 2, 3, 4].map((i) => s * i + 2 * e);
      const tb = SPM.table([['$n$', '1', '2', '3', '4'], ['$S$'].concat(rows.map(String))], { rowHead: true });
      return { q: T(`Tables are arranged end to end in a row for a banquet. The table shows the number of seats $S$ for $n$ tables.<br>${tb}Write a formula for $S$ and find the number of seats for ${k} tables.`, `Meja disusun hujung ke hujung dalam satu baris untuk sebuah jamuan. Jadual menunjukkan bilangan tempat duduk $S$ bagi $n$ meja.<br>${tb}Tulis satu rumus bagi $S$ dan cari bilangan tempat duduk bagi ${k} meja.`), a: T(`$S = ${lin(s, 2 * e, 'n')}$; ${s * k + 2 * e}`), w: W(T(`Each extra table adds $${s}$ seats, so the formula contains $${s}n$.`, `Setiap meja tambahan menambah $${s}$ tempat duduk, jadi rumus itu mengandungi $${s}n$.`), T(`When $n = 1$, $S = ${rows[0]}$, so the constant is $${rows[0]} - ${s} = ${2 * e}$.`, `Apabila $n = 1$, $S = ${rows[0]}$, jadi pemalarnya ialah $${rows[0]} - ${s} = ${2 * e}$.`), `$S = ${lin(s, 2 * e, 'n')}$`, `$S = ${s}(${k}) + ${2 * e} = ${s * k + 2 * e}$`), sp: 'm' };
    },
    (r) => { const k = r.int(2, 9), m = r.int(2, 5), q = r.pick(SHE)(k, m); return { q: T(q[0], q[1]), a: T(`$${q[2]}$`), w: W(T(q[3], q[4]), `$${q[2]}$`), sp: 'm' }; },
    (r) => { const f = r.pick(PCT)(r); return { q: T(f[0], f[1]), a: T(`$${f[2]}$`), w: W(T(f[3], f[4]), `$${f[2]}$`), sp: 'm' }; },
    (r) => {
      const m = r.int(2, 4), k = r.int(1, 6), t = r.int(2, 8), v = r.int(0, 2), nm2 = r.name();
      const en = [`${nm2} is $x$ years old. Her father is ${k} years older than ${m} times her age. Write a formula for the sum $S$ of their ages after ${t} years.`, `${nm2} is $x$ years old. Her father is ${k} years older than ${m} times her age. Write a formula for the difference $D$ between their ages.`, `${nm2} is $x$ years old and her brother is ${k} years older. Their mother is ${m} times as old as ${nm2}. Write a formula for the sum $S$ of the three ages.`];
      const ms = [`${nm2} berumur $x$ tahun. Ayahnya ${k} tahun lebih tua daripada ${m} kali umurnya. Tulis satu rumus bagi hasil tambah $S$ umur mereka selepas ${t} tahun.`, `${nm2} berumur $x$ tahun. Ayahnya ${k} tahun lebih tua daripada ${m} kali umurnya. Tulis satu rumus bagi beza $D$ antara umur mereka.`, `${nm2} berumur $x$ tahun dan abangnya ${k} tahun lebih tua. Ibu mereka ${m} kali ganda umur ${nm2}. Tulis satu rumus bagi hasil tambah $S$ ketiga-tiga umur itu.`];
      const an = [`S = (x + ${t}) + (${m}x + ${k} + ${t}) = ${lin(m + 1, k + 2 * t, 'x')}`, `D = (${m}x + ${k}) - x = ${lin(m - 1, k, 'x')}`, `S = x + (x + ${k}) + ${m}x = ${lin(m + 2, k, 'x')}`];
      const wen = [`${nm2}'s age after ${t} years: $x + ${t}$. Her father now: $${lin(m, k, 'x')}$, and after ${t} years: $${lin(m, k + t, 'x')}$.`,
        `Her father is $${lin(m, k, 'x')}$ and ${nm2} is $x$.`,
        `${nm2}: $x$; her brother: $x + ${k}$; their mother: $${m}x$.`];
      const wms = [`Umur ${nm2} selepas ${t} tahun: $x + ${t}$. Umur ayahnya sekarang: $${lin(m, k, 'x')}$, dan selepas ${t} tahun: $${lin(m, k + t, 'x')}$.`,
        `Ayahnya berumur $${lin(m, k, 'x')}$ dan ${nm2} berumur $x$.`,
        `${nm2}: $x$; abangnya: $x + ${k}$; ibu mereka: $${m}x$.`];
      return { q: T(en[v], ms[v]), a: T(`$${an[v]}$`), w: W(T(wen[v], wms[v]), `$${an[v]}$`), sp: 'm' };
    },
    (r) => {
      const c = r.pick(CT), d = dr(r, c), i = r.int(0, 2), w = wrongs(c, d.a, d.b);
      return { q: Q(sent(c, d), T(` A student wrote $${w[i]}$ as the formula for ${c.y[0]} in terms of ${c.x[0]}. Explain the mistake and write the correct formula.`, ` Seorang pelajar menulis $${w[i]}$ sebagai rumus bagi ${c.y[1]} dalam sebutan ${c.x[1]}. Terangkan kesilapan itu dan tulis rumus yang betul.`)), a: Q(whyWrong(c, d.a, d.b, i), T(` Correct formula: $${fm(c, d.a, d.b)}$`, ` Rumus yang betul: $${fm(c, d.a, d.b)}$`)), w: W(ctxL(c, d), fmL(c, d.a, d.b)), sp: 'm' };
    },
    (r) => {
      const c = r.pick(CT), d = dr(r, c), w = wrongs(c, d.a, d.b), f = fm(c, d.a, d.b);
      const m = mcq(r, f, w);
      return { q: Q(sent(c, d), T(` Which formula gives ${c.y[0]} in terms of ${c.x[0]}?<br>${m.q}`, ` Rumus yang manakah memberi ${c.y[1]} dalam sebutan ${c.x[1]}?<br>${m.q}`)), a: T(m.ans), w: W(ctxL(c, d), fmL(c, d.a, d.b)), sp: 'xs' };
    },
    (r) => {
      const [i1, i2] = r.sample(B().items, 2), p = r.int(i1.lo, i1.hi + 1), q = r.int(i2.lo, i2.hi + 1), v = r.int(0, 1), N = r.int(6, 12) * 10;
      need(N > 5 * (p + q));
      return v === 0 ? { q: T(`A ${i1.en1} costs RM${p} and a ${i2.en1} costs RM${q}. Write a formula for the total cost $C$ (in RM) of $x$ ${i1.en} and $y$ ${i2.en}.`, `Harga sebuah ${i1.ms} ialah RM${p} dan harga sebuah ${i2.ms} ialah RM${q}. Tulis satu rumus bagi jumlah kos $C$ (dalam RM) bagi $x$ ${i1.ms} dan $y$ ${i2.ms}.`), a: T(`$C = ${p}x + ${q}y$`), w: W(T(`$x$ ${i1.en} cost $${p}x$ and $y$ ${i2.en} cost $${q}y$.`, `$x$ ${i1.ms} berharga $${p}x$ dan $y$ ${i2.ms} berharga $${q}y$.`), `$C = ${p}x + ${q}y$`), sp: 's' }
        : { q: T(`A ${i1.en1} costs RM${p} and a ${i2.en1} costs RM${q}. Ali buys $x$ ${i1.en} and $y$ ${i2.en} and pays with RM${N}. Write a formula for the change $R$ (in RM) he receives.`, `Harga sebuah ${i1.ms} ialah RM${p} dan harga sebuah ${i2.ms} ialah RM${q}. Ali membeli $x$ ${i1.ms} dan $y$ ${i2.ms} dan membayar dengan RM${N}. Tulis satu rumus bagi baki $R$ (dalam RM) yang diterimanya.`), a: T(`$R = ${N} - ${p}x - ${q}y$`), w: W(T(`$x$ ${i1.en} cost $${p}x$ and $y$ ${i2.en} cost $${q}y$, so the total is $${p}x + ${q}y$.`, `$x$ ${i1.ms} berharga $${p}x$ dan $y$ ${i2.ms} berharga $${q}y$, jadi jumlahnya ialah $${p}x + ${q}y$.`), T('Change = money paid minus total cost.', 'Baki = wang yang dibayar tolak jumlah kos.'), `$R = ${N} - (${p}x + ${q}y) = ${N} - ${p}x - ${q}y$`), sp: 's' };
    },
    (r) => {
      const a = r.int(50, 90), b = r.int(50, 90), v = r.int(0, 2);
      const h2 = a % 4 + 2, h3 = b % 3 + 1;
      const nm2 = r.girl();
      const T0 = [T(`${nm2} scored ${a} and ${b} marks in two tests. She scores $x$ marks in a third test. Write a formula for the mean mark $M$ of the three tests.`, `${nm2} mendapat ${a} dan ${b} markah dalam dua ujian. Dia mendapat $x$ markah dalam ujian ketiga. Tulis satu rumus bagi markah min $M$ bagi ketiga-tiga ujian itu.`), T(`A car travels for $t$ hours at 60 km/h and then for ${h2} hours at 80 km/h. Write a formula for the total distance $D$ (in km).`, `Sebuah kereta bergerak selama $t$ jam pada 60 km/j dan kemudian selama ${h2} jam pada 80 km/j. Tulis satu rumus bagi jumlah jarak $D$ (dalam km).`), T(`A car travels for ${h2} hours at $v$ km/h and then for ${h3} hours at 80 km/h. Write a formula for the average speed $A$ (in km/h) for the whole journey.`, `Sebuah kereta bergerak selama ${h2} jam pada $v$ km/j dan kemudian selama ${h3} jam pada 80 km/j. Tulis satu rumus bagi laju purata $A$ (dalam km/j) bagi keseluruhan perjalanan.`)];
      const AN = [`M = \\dfrac{${a + b} + x}{3}`, `D = ${60}t + ${80 * h2}`, `A = \\dfrac{${h2}v + ${80 * h3}}{${h2 + h3}}`];
      const WN = [T('Mean = sum of the three marks divided by 3.', 'Min = hasil tambah ketiga-tiga markah dibahagi dengan 3.'), T('Distance = speed $\\times$ time, and the two parts are added.', 'Jarak = laju $\\times$ masa, dan kedua-dua bahagian ditambah.'), T('Average speed = total distance divided by total time.', 'Laju purata = jumlah jarak dibahagi dengan jumlah masa.')];
      const WS = [`$M = \\dfrac{${a} + ${b} + x}{3}$`, `$D = 60t + 80(${h2}) = ${60}t + ${80 * h2}$`, `$A = \\dfrac{${h2}v + 80(${h3})}{${h2} + ${h3}}$`];
      return { q: T0[v], a: T(`$${AN[v]}$`), w: W(WN[v], WS[v], `$${AN[v]}$`), sp: 'm' };
    },
  ];
  /* ===== 3.1 advanced ===== */
  const PU = [['gyms', 'gim', 'month', 'months', 'bulan'], ['photographers', 'jurugambar', 'hour', 'hours', 'jam'], ['phone plans', 'pelan telefon', 'GB of data', 'GB of data', 'GB data'], ['taxi companies', 'syarikat teksi', 'kilometre', 'kilometres', 'kilometer'], ['caterers', 'pengusaha katering', 'guest', 'guests', 'tetamu'], ['printing shops', 'kedai cetak', 'poster', 'posters', 'poster']];
  const CS = [
    (r, k) => [`A rectangular garden measures $l$ m by $w$ m. A path ${k} m wide surrounds the garden. Write a formula for the area $A$ of the path.`, `Sebuah taman segi empat tepat berukuran $l$ m kali $w$ m. Sebuah denai selebar ${k} m mengelilingi taman itu. Tulis satu rumus bagi luas denai $A$.`, `A = (l + ${2 * k})(w + ${2 * k}) - lw = ${poly([[2 * k, 'l'], [2 * k, 'w'], [4 * k * k, '']])}`, ['l', 'w'], (v) => (v.l + 2 * k) * (v.w + 2 * k) - v.l * v.w, [4, 12], 'm$^2$', `The outer rectangle is $(l + ${2 * k})$ by $(w + ${2 * k})$; the path is the outer area minus the garden area.`, `Segi empat tepat luar ialah $(l + ${2 * k})$ kali $(w + ${2 * k})$; luas denai ialah luas luar tolak luas taman.`],
    (r, k) => [`A square piece of card has sides of $x$ cm. A square of side ${k} cm is cut from each corner. Write a formula for the area $A$ of the card that remains.`, `Sekeping kad segi empat sama bersisi $x$ cm. Sebuah segi empat sama bersisi ${k} cm dipotong daripada setiap penjuru. Tulis satu rumus bagi luas kad yang tinggal $A$.`, `A = x^2 - 4(${k})^2 = x^2 - ${4 * k * k}`, ['x'], (v) => v.x * v.x - 4 * k * k, [2 * k + 2, 2 * k + 12], 'cm$^2$', `Four corner squares of area $${k}^2 = ${k * k}$ each are cut away: $4 \\times ${k * k} = ${4 * k * k}$.`, `Empat segi empat sama penjuru yang masing-masing berluas $${k}^2 = ${k * k}$ dipotong: $4 \\times ${k * k} = ${4 * k * k}$.`],
    (r, k) => [`An open box is made from a square piece of card of side $x$ cm by cutting a square of side ${k} cm from each corner and folding up the sides. Write a formula for the volume $V$ of the box.`, `Sebuah kotak tanpa penutup dibuat daripada sekeping kad segi empat sama bersisi $x$ cm dengan memotong segi empat sama bersisi ${k} cm di setiap penjuru dan melipat sisi ke atas. Tulis satu rumus bagi isi padu kotak $V$.`, `V = ${k}(x - ${2 * k})^2`, ['x'], (v) => k * (v.x - 2 * k) ** 2, [2 * k + 2, 2 * k + 12], 'cm$^3$', `Each side loses ${k} cm at both ends, so the base is $(x - ${2 * k})$ by $(x - ${2 * k})$ and the height is ${k} cm.`, `Setiap sisi kehilangan ${k} cm di kedua-dua hujung, jadi tapaknya $(x - ${2 * k})$ kali $(x - ${2 * k})$ dan tingginya ${k} cm.`],
    (r, k) => [`A rectangle $x$ cm by $y$ cm has a square of side ${k} cm cut from one corner to make an L-shape. Write a formula for the area $A$ of the L-shape.`, `Sebuah segi empat tepat $x$ cm kali $y$ cm dipotong satu segi empat sama bersisi ${k} cm di satu penjuru untuk membentuk bentuk L. Tulis satu rumus bagi luas bentuk L itu $A$.`, `A = xy - ${k * k}`, ['x', 'y'], (v) => v.x * v.y - k * k, [k + 2, k + 12], 'cm$^2$', `The rectangle has area $xy$; the square cut out has area $${k}^2 = ${k * k}$.`, `Luas segi empat tepat ialah $xy$; luas segi empat sama yang dipotong ialah $${k}^2 = ${k * k}$.`],
    (r, k) => [`A square lawn of side $x$ m has a square flower bed of side ${k} m in the middle. Write a formula for the area $A$ of grass.`, `Sebuah padang rumput segi empat sama bersisi $x$ m mempunyai sebuah petak bunga segi empat sama bersisi ${k} m di tengahnya. Tulis satu rumus bagi luas rumput $A$.`, `A = x^2 - ${k * k}`, ['x'], (v) => v.x * v.x - k * k, [k + 2, k + 15], 'm$^2$', `The lawn has area $x^2$; the flower bed takes away $${k}^2 = ${k * k}$.`, `Luas padang ialah $x^2$; petak bunga menolak $${k}^2 = ${k * k}$.`],
  ];
  const CP = [
    (r) => { const p = r.int(8, 20), k = r.int(3, 6), f = r.int(2, 6); return [`Each ticket costs RM${p}. Tickets are bought in groups of ${k}, and there is a booking fee of RM${f} per order. Write a formula for the total cost $C$ (in RM) of $g$ groups of tickets.`, `Setiap tiket berharga RM${p}. Tiket dibeli dalam kumpulan ${k} keping dan terdapat yuran tempahan RM${f} bagi setiap pesanan. Tulis satu rumus bagi jumlah kos $C$ (dalam RM) bagi $g$ kumpulan tiket.`, `C = ${p * k}g + ${f}`, `One group costs $${p} \\times ${k} = ${p * k}$, so $g$ groups cost $${p * k}g$; the fee $${f}$ is added once.`, `Satu kumpulan berharga $${p} \\times ${k} = ${p * k}$, jadi $g$ kumpulan berharga $${p * k}g$; yuran $${f}$ ditambah sekali sahaja.`]; },
    (r) => { const e = r.pick([10, 12, 15, 20]), p = r.pick([2, 3]); return [`A car uses 1 litre of petrol for every ${e} km. Petrol costs RM${p} per litre. The car travels for $t$ hours at a speed of $v$ km/h. Write a formula for the cost $C$ (in RM) of the petrol used.`, `Sebuah kereta menggunakan 1 liter petrol bagi setiap ${e} km. Petrol berharga RM${p} seliter. Kereta itu bergerak selama $t$ jam pada laju $v$ km/j. Tulis satu rumus bagi kos $C$ (dalam RM) petrol yang digunakan.`, `C = \\dfrac{${p}vt}{${e}}`, `Distance $= vt$ km, so the petrol used is $\\dfrac{vt}{${e}}$ litres, each costing $${p}$.`, `Jarak $= vt$ km, jadi petrol yang digunakan ialah $\\dfrac{vt}{${e}}$ liter, setiap satu berharga $${p}$.`]; },
    (r) => { const w = r.int(6, 12), h = r.int(6, 9), b = r.int(20, 80); return [`A worker earns RM${w} per hour and works ${h} hours a day. At the end of the month he also receives a bonus of RM${b}. Write a formula for his total earnings $E$ (in RM) if he works $d$ days.`, `Seorang pekerja mendapat RM${w} sejam dan bekerja ${h} jam sehari. Pada hujung bulan dia juga menerima bonus RM${b}. Tulis satu rumus bagi jumlah pendapatannya $E$ (dalam RM) jika dia bekerja selama $d$ hari.`, `E = ${w * h}d + ${b}`, `One day's pay is $${w} \\times ${h} = ${w * h}$, so $d$ days give $${w * h}d$; the bonus $${b}$ is added once.`, `Gaji sehari ialah $${w} \\times ${h} = ${w * h}$, jadi $d$ hari memberi $${w * h}d$; bonus $${b}$ ditambah sekali sahaja.`]; },
    (r) => { const p = r.int(20, 50), k = r.int(2, 6); return [`A room is a rectangle $x$ m wide and $(x + ${k})$ m long. The floor is covered with tiles costing RM${p} per square metre. Write a formula for the cost $C$ (in RM).`, `Sebuah bilik berbentuk segi empat tepat dengan lebar $x$ m dan panjang $(x + ${k})$ m. Lantainya ditutup dengan jubin berharga RM${p} semeter persegi. Tulis satu rumus bagi kos $C$ (dalam RM).`, `C = ${p}x(x + ${k}) = ${p}x^2 + ${p * k}x`, `Floor area $= x(x + ${k})$, and each square metre costs $${p}$.`, `Luas lantai $= x(x + ${k})$, dan setiap meter persegi berharga $${p}$.`]; },
    (r) => { const m = r.int(2, 4), p = r.int(4, 9); return [`The length of a rectangular field is ${m} times its width $w$ m. Fencing costs RM${p} per metre. Write a formula for the cost $C$ (in RM) of fencing the whole field.`, `Panjang sebuah padang segi empat tepat ialah ${m} kali lebarnya, $w$ m. Kos pagar ialah RM${p} semeter. Tulis satu rumus bagi kos $C$ (dalam RM) memagar seluruh padang itu.`, `C = ${p} \\times 2(w + ${m}w) = ${2 * p * (m + 1)}w`, `Perimeter $= 2(w + ${m}w) = ${2 * (m + 1)}w$, and each metre of fence costs $${p}$.`, `Perimeter $= 2(w + ${m}w) = ${2 * (m + 1)}w$, dan setiap meter pagar berharga $${p}$.`]; },
    (r) => { const k = r.int(4, 8), q = r.int(6, 12), p = r.int(2, 5); return [`A box holds ${k} packets and each packet contains ${q} biscuits. Each biscuit costs ${p} sen. Write a formula for the total cost $M$ (in sen) of the biscuits in $b$ boxes.`, `Sebuah kotak mengandungi ${k} paket dan setiap paket mengandungi ${q} keping biskut. Setiap biskut berharga ${p} sen. Tulis satu rumus bagi jumlah kos $M$ (dalam sen) biskut dalam $b$ kotak.`, `M = ${k * q * p}b`, `One box holds $${k} \\times ${q} = ${k * q}$ biscuits, so one box costs $${k * q} \\times ${p} = ${k * q * p}$ sen.`, `Satu kotak mengandungi $${k} \\times ${q} = ${k * q}$ keping biskut, jadi satu kotak berharga $${k * q} \\times ${p} = ${k * q * p}$ sen.`]; },
  ];
  const EQV = [
    (k, j, m) => ({ a: `${k}x + ${j}`, b: `${k}(x + ${j})`, fa: (x) => k * x + j, fb: (x) => k * (x + j), eq: 0 }),
    (k, j, m) => ({ a: `${k}(x + ${j})`, b: `${k}x + ${k * j}`, fa: (x) => k * (x + j), fb: (x) => k * x + k * j, eq: 1 }),
    (k, j, m) => ({ a: `${k}(x - ${j})`, b: `${k}x - ${j}`, fa: (x) => k * (x - j), fb: (x) => k * x - j, eq: 0 }),
    (k, j, m) => ({ a: `${k}(x - ${j})`, b: `${k}x - ${k * j}`, fa: (x) => k * (x - j), fb: (x) => k * x - k * j, eq: 1 }),
    (k, j, m) => ({ a: `\\dfrac{x + ${k}}{${m}}`, b: `\\dfrac{x}{${m}} + ${k}`, fa: (x) => (x + k) / m, fb: (x) => x / m + k, eq: 0 }),
    (k, j, m) => ({ a: `\\dfrac{x + ${k}}{${m}}`, b: `\\dfrac{x}{${m}} + \\dfrac{${k}}{${m}}`, fa: (x) => (x + k) / m, fb: (x) => x / m + k / m, eq: 1 }),
    (k, j, m) => ({ a: `(x + ${k})^2`, b: `x^2 + ${k * k}`, fa: (x) => (x + k) ** 2, fb: (x) => x * x + k * k, eq: 0 }),
    (k, j, m) => ({ a: `(x + ${k})^2`, b: `x^2 + ${2 * k}x + ${k * k}`, fa: (x) => (x + k) ** 2, fb: (x) => x * x + 2 * k * x + k * k, eq: 1 }),
    (k, j, m) => ({ a: `${k}x - ${m}(x - ${j})`, b: `${k - m}x + ${m * j}`, fa: (x) => k * x - m * (x - j), fb: (x) => (k - m) * x + m * j, eq: 1 }),
    (k, j, m) => ({ a: `${k}x - ${m}(x - ${j})`, b: `${k - m}x - ${m * j}`, fa: (x) => k * x - m * (x - j), fb: (x) => (k - m) * x - m * j, eq: 0 }),
  ];
  const a31 = [
    (r) => {
      const c = r.pick(CT), d = dr(r, c), x2 = r.int(c.xr[0], c.xr[1]), d2 = { x: x2, y: evalAt(c, d, x2) };
      need(d2.y > 0 && d2.x !== d.x);
      return { q: Q(sent(c, d), ' ', P([T(`Write a formula for ${c.y[0]}, ${YV(c)}, in terms of ${XV(c)}.`, `Tulis satu rumus bagi ${c.y[1]}, ${YV(c)}, dalam sebutan ${XV(c)}.`), T(`Find ${YV(c)} when ${XV(c)} = ${d.x}.`, `Cari ${YV(c)} apabila ${XV(c)} = ${d.x}.`), T(`Find ${XV(c)} when ${YV(c)} = ${d2.y}.`, `Cari ${XV(c)} apabila ${YV(c)} = ${d2.y}.`)])), a: P([T(`$${fm(c, d.a, d.b)}$`), T(`$${c.yv} = ${d.y}$`), T(`$${c.xv} = ${x2}$`)]), w: W(ctxL(c, d), fmL(c, d.a, d.b, '(a) '), subL(c, d, d.x, '(b) '), solveL(c, d, d2.y, '(c) ')), sp: 'l' };
    },
    (r) => {
      const c = r.pick(CT), d = dr(r, c), x2 = r.int(c.xr[0], c.xr[1]), y2 = evalAt(c, d, x2);
      need(y2 > 0 && x2 !== d.x);
      return { q: Q(sent(c, d), ' ', P([T(`Write a formula for ${YV(c)} in terms of ${XV(c)}.`, `Tulis satu rumus bagi ${YV(c)} dalam sebutan ${XV(c)}.`), T(`State what the number ${d.a} in your formula represents.`, `Nyatakan maksud nombor ${d.a} dalam rumus anda.`), T(`Find ${XV(c)} when ${YV(c)} = ${y2}.`, `Cari ${XV(c)} apabila ${YV(c)} = ${y2}.`)])), a: P([T(`$${fm(c, d.a, d.b)}$`), T(c.am[0] + '.', c.am[1] + '.'), T(`$${c.xv} = ${x2}$`)]), w: W(ctxL(c, d), fmL(c, d.a, d.b, '(a) '), T(`(b) $${d.a}$ multiplies ${XV(c)}, so it is ${c.am[0]}.`, `(b) $${d.a}$ didarab dengan ${XV(c)}, jadi ia ialah ${c.am[1]}.`), solveL(c, d, y2, '(c) ')), sp: 'l' };
    },
    (r) => {
      const u = r.pick(PU), n0 = r.int(4, 15), a1 = r.int(2, 6), a2 = a1 + r.int(1, 4), b2 = r.int(1, 6) * 5, b1 = b2 + (a2 - a1) * n0, k = r.int(2, 6);
      const cost = a1 * n0 + b1, x3 = n0 + k;
      return { q: T(`Two ${u[0]} offer these charges (in RM), where $n$ is the number of ${u[3]}: company $P$ charges a fixed fee of RM${b1} plus RM${a1} for each ${u[2]}; company $Q$ charges a fixed fee of RM${b2} plus RM${a2} for each ${u[2]}.<br>(a) Write formulae for the charges $C_P$ and $C_Q$. (b) Find the value of $n$ for which both companies charge the same amount, and state that amount. (c) Which company is cheaper for $n = ${x3}$? Give the difference in RM.`, `Dua ${u[1]} menawarkan caj berikut (dalam RM), dengan $n$ ialah bilangan ${u[4]}: syarikat $P$ mengenakan yuran tetap RM${b1} ditambah RM${a1} bagi setiap ${u[4]}; syarikat $Q$ mengenakan yuran tetap RM${b2} ditambah RM${a2} bagi setiap ${u[4]}.<br>(a) Tulis rumus bagi caj $C_P$ dan $C_Q$. (b) Cari nilai $n$ apabila kedua-dua syarikat mengenakan amaun yang sama, dan nyatakan amaun itu. (c) Syarikat yang manakah lebih murah bagi $n = ${x3}$? Beri perbezaannya dalam RM.`), a: T(`(a) $C_P = ${lin(a1, b1, 'n')}$, $C_Q = ${lin(a2, b2, 'n')}$ (b) $n = ${n0}$, RM${cost} (c) $P$ is cheaper by RM${(a2 - a1) * k}`, `(a) $C_P = ${lin(a1, b1, 'n')}$, $C_Q = ${lin(a2, b2, 'n')}$ (b) $n = ${n0}$, RM${cost} (c) $P$ lebih murah sebanyak RM${(a2 - a1) * k}`), w: W(`(a) $C_P = ${lin(a1, b1, 'n')}$, $C_Q = ${lin(a2, b2, 'n')}$`, T('(b) Equal charges: set the two formulae equal.', '(b) Caj sama: samakan kedua-dua rumus.'), `$${lin(a1, b1, 'n')} = ${lin(a2, b2, 'n')}$`, `$${b1 - b2} = ${a2 - a1}n$, $n = ${n0}$`, `$C_P = ${a1}(${n0}) + ${b1} = ${cost}$`, `(c) $C_P = ${a1}(${x3}) + ${b1} = ${a1 * x3 + b1}$, $C_Q = ${a2}(${x3}) + ${b2} = ${a2 * x3 + b2}$`, T(`$P$ is cheaper by $${a2 * x3 + b2} - ${a1 * x3 + b1} = ${(a2 - a1) * k}$.`, `$P$ lebih murah sebanyak $${a2 * x3 + b2} - ${a1 * x3 + b1} = ${(a2 - a1) * k}$.`)), sp: 'l' };
    },
    (r) => {
      const k = r.int(1, 4), q = r.pick(CS)(r, k), vals = {};
      const v = {};
      for (const key of q[3]) v[key] = r.int(q[5][0], q[5][1]);
      const unit = q[6];
      const list = q[3].map((key) => `$${key} = ${v[key]}$`).join(', ');
      return { q: T(q[0] + ` Find $A$ when ${list}.`.replace('$A$', q[2].startsWith('V') ? '$V$' : '$A$'), q[1] + ` Cari ${q[2].startsWith('V') ? '$V$' : '$A$'} apabila ${list}.`), a: T(`$${q[2]}$; $${q[2][0]} = ${n(q[4](v))}$ ${unit}`), w: W(T(q[7], q[8]), `$${q[2]}$`, T(`Substituting ${list}: $${q[2][0]} = ${n(q[4](v))}$ ${unit}`, `Menggantikan ${list}: $${q[2][0]} = ${n(q[4](v))}$ ${unit}`)), sp: 'l' };
    },
    (r) => {
      const q = r.int(3, 5), kind = r.int(0, 3), s = [1, 2, 2, 3][kind], f1 = [1, 2, 2, 3][kind], f0 = [0, 0, 1, 0][kind];
      const first = poly([[f1, 'n'], [f0, '']]);
      const S1 = q * f1, S0 = q * f0 + (s * q * (q - 1)) / 2;
      const nn = r.int(3, 20);
      const seq = Array.from({ length: q }, (_, i) => f1 * nn + f0 + s * i), tot = seq.reduce((a, b) => a + b, 0);
      const kn = [['integers', 'integer'], ['even numbers', 'nombor genap'], ['odd numbers', 'nombor ganjil'], ['multiples of 3', 'gandaan 3']][kind];
      const qw = [['three', 'tiga'], ['four', 'empat'], ['five', 'lima']][q - 3];
      const seqEx = Array.from({ length: q }, (_, i) => poly([[f1, 'n'], [f0 + s * i, '']])).join(',\\ ');
      return { q: T(`The smallest of ${qw[0]} consecutive ${kn[0]} is $${first}$. (a) Write a formula for the sum $S$ of the ${qw[0]} numbers in terms of $n$. (b) The sum is ${tot}. Find the ${qw[0]} numbers.`, `Yang terkecil antara ${qw[1]} ${kn[1]} berturutan ialah $${first}$. (a) Tulis satu rumus bagi hasil tambah $S$ bagi ${qw[1]} nombor itu dalam sebutan $n$. (b) Hasil tambahnya ialah ${tot}. Cari ${qw[1]} nombor itu.`), a: T(`(a) $S = ${lin(S1, S0, 'n')}$ (b) $${seq.join(',\\ ')}$`), w: W(T(`The ${qw[0]} numbers are $${seqEx}$.`, `${cap(qw[1])} nombor itu ialah $${seqEx}$.`), `(a) $S = ${lin(S1, S0, 'n')}$`, `(b) $${lin(S1, S0, 'n')} = ${tot}$`, `$${S1}n = ${tot - S0}$, $n = ${nn}$`, T(`The numbers are $${seq.join(',\\ ')}$.`, `Nombor itu ialah $${seq.join(',\\ ')}$.`)), sp: 'l' };
    },
    (r) => { const f = r.pick(CP)(r); return { q: T(f[0], f[1]), a: T(`$${f[2]}$`), w: W(T(f[3], f[4]), `$${f[2]}$`), sp: 'm' }; },
    (r) => {
      const t = r.pick([['tank', 'tangki'], ['swimming pool', 'kolam renang']]), V0 = r.int(2, 10) * 10, aa = r.int(12, 30), bb = r.int(2, 10), t0 = r.int(5, 20);
      need(aa > bb);
      const Vf = V0 + (aa - bb) * t0;
      return { q: T(`A ${t[0]} contains ${V0} litres of water. A tap fills it at ${aa} litres per minute while a drain empties it at ${bb} litres per minute. Both are open. (a) Write a formula for the volume $V$ (in litres) after $t$ minutes. (b) The ${t[0]} holds at most ${Vf} litres. How long does it take to fill?`, `Sebuah ${t[1]} mengandungi ${V0} liter air. Sebuah paip mengisinya pada kadar ${aa} liter seminit manakala sebuah longkang mengosongkannya pada kadar ${bb} liter seminit. Kedua-duanya dibuka. (a) Tulis satu rumus bagi isi padu $V$ (dalam liter) selepas $t$ minit. (b) ${t[1][0].toUpperCase() + t[1].slice(1)} itu memuatkan paling banyak ${Vf} liter. Berapa lamakah masa yang diambil untuk penuh?`), a: T(`(a) $V = ${lin(aa - bb, V0, 't')}$ (b) ${t0} minutes`, `(a) $V = ${lin(aa - bb, V0, 't')}$ (b) ${t0} minit`), w: W(T(`Net rate $= ${aa} - ${bb} = ${aa - bb}$ litres per minute.`, `Kadar bersih $= ${aa} - ${bb} = ${aa - bb}$ liter seminit.`), `(a) $V = ${lin(aa - bb, V0, 't')}$`, `(b) $${lin(aa - bb, V0, 't')} = ${Vf}$`, `$${aa - bb}t = ${Vf - V0}$, $t = ${t0}$`), sp: 'l' };
    },
    (r) => {
      const k = r.int(2, 5), j = r.int(2, 6), m = r.int(2, 4), i = r.int(0, EQV.length - 1), o = EQV[i](k, j, m);
      need(k !== m);
      const t = m * r.int(1, 5);
      const va = o.fa(t), vb = o.fb(t);
      need(o.eq ? Math.abs(va - vb) < 1e-9 : Math.abs(va - vb) > 1e-9);
      const nm2 = r.pair();
      return { q: T(`${nm2[0]} writes $y = ${o.a}$ and ${nm2[1]} writes $y = ${o.b}$ for the same relationship. By substituting $x = ${t}$ into both, decide whether the two formulae could be equivalent. Then say whether they are equivalent for all values of $x$.`, `${nm2[0]} menulis $y = ${o.a}$ dan ${nm2[1]} menulis $y = ${o.b}$ bagi hubungan yang sama. Dengan menggantikan $x = ${t}$ ke dalam kedua-duanya, tentukan sama ada kedua-dua rumus itu boleh setara. Kemudian nyatakan sama ada keduanya setara bagi semua nilai $x$.`), a: T(`Values: ${n(round(va, 4))} and ${n(round(vb, 4))}. ` + (o.eq ? 'They are equivalent (one expands/simplifies to the other).' : 'The values differ, so they are not equivalent.'), `Nilai: ${n(round(va, 4))} dan ${n(round(vb, 4))}. ` + (o.eq ? 'Kedua-duanya setara (satu boleh dikembangkan/dipermudahkan kepada yang lain).' : 'Nilai berbeza, jadi kedua-duanya tidak setara.')), w: W(T(`Substitute $x = ${t}$ into $${o.a}$: value $${n(round(va, 4))}$.`, `Gantikan $x = ${t}$ ke dalam $${o.a}$: nilainya $${n(round(va, 4))}$.`), T(`Substitute $x = ${t}$ into $${o.b}$: value $${n(round(vb, 4))}$.`, `Gantikan $x = ${t}$ ke dalam $${o.b}$: nilainya $${n(round(vb, 4))}$.`), o.eq ? T('The values agree, and expanding one expression gives the other, so the formulae are equivalent for every value of $x$.', 'Nilainya sama, dan mengembangkan satu ungkapan memberi ungkapan yang satu lagi, jadi kedua-dua rumus itu setara bagi setiap nilai $x$.') : T('One counter-example is enough: the values differ, so the formulae are not equivalent.', 'Satu contoh penyangkal sudah memadai: nilainya berbeza, jadi kedua-dua rumus itu tidak setara.')), sp: 'm' };
    },
    (r) => {
      const c = r.pick(CT), d = dr(r, c), xs = r.pick(c.up ? XS.slice(0, 5) : XS.slice(0, 3)), ys = xs.map((x) => evalAt(c, d, x));
      need(ys.every((y) => y > 0) && xs.length === 4);
      const k = r.int(0, 3), off = r.pick([-2, -1, 1, 2]) * r.int(1, 3), sh = ys.slice();
      need(ys[k] + off > 0);
      sh[k] = ys[k] + off;
      return { q: T(`A formula $${fm(c, d.a, d.b)}$ describes ${c.y[0]} (${YV(c)}) for different values of ${c.x[0]} (${XV(c)}). The table below contains one wrong value.<br>${tbl(c, xs, sh)}Identify the wrong value and write the correct one.`, `Satu rumus $${fm(c, d.a, d.b)}$ menerangkan ${c.y[1]} (${YV(c)}) bagi nilai ${c.x[1]} (${XV(c)}) yang berbeza. Jadual di bawah mengandungi satu nilai yang salah.<br>${tbl(c, xs, sh)}Kenal pasti nilai yang salah dan tulis nilai yang betul.`), a: T(`When $${c.xv} = ${xs[k]}$: ${sh[k]} is wrong; it should be ${ys[k]}.`, `Apabila $${c.xv} = ${xs[k]}$: ${sh[k]} salah; nilai yang betul ialah ${ys[k]}.`), w: W(T('Test every value with the formula.', 'Uji setiap nilai dengan rumus itu.'), subL(c, d, xs[k]), T(`The table shows $${sh[k]}$, so that entry is wrong.`, `Jadual menunjukkan $${sh[k]}$, jadi nilai itu salah.`)), sp: 'm' };
    },
    (r) => {
      const d = tierDraw(r), x = d.h0 + r.int(2, 7), v = d.a * d.h0 + d.b * (x - d.h0);
      return { q: Q(tf(d.t[0], d.t[1], d.o), ' ', P([tierAsk(d), T(`Find the amount payable for ${x} (${d.t[3][0]}).`, `Cari amaun yang perlu dibayar bagi ${x} (${d.t[3][1]}).`), T(`The amount paid is RM${v}. Find the ${d.t[3][0]}.`, `Amaun yang dibayar ialah RM${v}. Cari ${d.t[3][1]}.`)])), a: P([T(`$${d.f}$`), T(`RM${v}`), T(`${x}`)]), w: W(...tierW(d), `(b) $${d.a * d.h0} + ${d.b}(${x} - ${d.h0}) = ${d.a * d.h0} + ${d.b * (x - d.h0)} = ${v}$`, `(c) $${d.a * d.h0} + ${d.b}(${d.t[5]} - ${d.h0}) = ${v}$`, `$${d.b}(${d.t[5]} - ${d.h0}) = ${v - d.a * d.h0}$, $${d.t[5]} - ${d.h0} = ${(v - d.a * d.h0) / d.b}$, $${d.t[5]} = ${x}$`), sp: 'l' };
    },
    (r) => {
      const p = r.pick(PAT), k = r.int(2, 5), s = p[2] - 2, N0 = r.int(6, 15), Pn = k * (s * N0 + 2);
      return { q: T(`$n$ ${p[0]}, each of side ${k} cm, are joined edge to edge in a row so that each neighbouring pair shares one side. (a) Find the perimeter of 1, 2 and 3 of them. (b) Write a formula for the perimeter $P$ (in cm) of $n$ ${p[0]}. (c) A row has a perimeter of ${Pn} cm. How many ${p[0]} are in the row?`, `$n$ ${p[1]} sekata, setiap satunya bersisi ${k} cm, dicantumkan sisi dengan sisi dalam satu baris supaya setiap pasangan yang bercantum berkongsi satu sisi. (a) Cari perimeter bagi 1, 2 dan 3 bentuk itu. (b) Tulis satu rumus bagi perimeter $P$ (dalam cm) bagi $n$ ${p[1]}. (c) Satu baris mempunyai perimeter ${Pn} cm. Berapakah ${p[1]} dalam baris itu?`), a: T(`(a) ${k * p[2]}, ${k * (p[2] + s)}, ${k * (p[2] + 2 * s)} cm (b) $P = ${poly([[k * s, 'n'], [2 * k, '']])}$ (c) ${N0}`), w: W(T(`One shape shows ${p[2]} sides, but each join hides $2$ of them, so each shape after the first adds $${s}$ to the number of sides.`, `Satu bentuk menunjukkan ${p[2]} sisi, tetapi setiap cantuman melindungi $2$ daripadanya, jadi setiap bentuk selepas yang pertama menambah $${s}$ kepada bilangan sisi.`), `(a) $${k} \\times ${p[2]} = ${k * p[2]}$, $${k} \\times ${p[2] + s} = ${k * (p[2] + s)}$, $${k} \\times ${p[2] + 2 * s} = ${k * (p[2] + 2 * s)}$`, `(b) $P = ${k}(${lin(s, 2, 'n')}) = ${poly([[k * s, 'n'], [2 * k, '']])}$`, `(c) $${poly([[k * s, 'n'], [2 * k, '']])} = ${Pn}$`, `$${k * s}n = ${Pn - 2 * k}$, $n = ${N0}$`), sp: 'l' };
    },
  ];
  SPM.extend('F2-3.1', { e: e31, m: m31, a: a31 });

  /* ===== tiny TeX evaluator: used to verify every rearrangement by back-substitution ===== */
  function texEval(src, V) {
    const s = src.replace(/\s+/g, '').replace(/\\left|\\right|\\,|\\ |\\!/g, '').replace(/\\d?frac/g, '\\f').replace(/\\times|\\cdot/g, '*').replace(/\\div/g, '/').replace(/\^\\circ/g, '');
    let i = 0;
    const fail = () => { throw SPM.REJECT; };
    function atom() {
      const c = s[i] || '';
      if (c === '(') { i++; const v = expr(); if (s[i++] !== ')') fail(); return v; }
      if (c === '{') { i++; const v = expr(); if (s[i++] !== '}') fail(); return v; }
      if (s.startsWith('\\f', i)) { i += 2; const a = atom(); return a / atom(); }
      if (s.startsWith('\\sqrt', i)) { i += 5; return Math.sqrt(atom()); }
      if (s.startsWith('\\pi', i)) { i += 3; return 22 / 7; }
      if (/[\d.]/.test(c)) { const j = i; while (/[\d.]/.test(s[i] || '')) i++; return parseFloat(s.slice(j, i)); }
      if (/[a-zA-Z]/.test(c)) { i++; if (V[c] === undefined) fail(); return V[c]; }
      return fail();
    }
    const pow = () => { let v = atom(); while (s[i] === '^') { i++; v = Math.pow(v, atom()); } return v; };
    const un = () => (s[i] === '-' ? (i++, -un()) : pow());
    function term() {
      let v = un();
      for (;;) {
        const c = s[i];
        if (c === '*') { i++; v *= un(); } else if (c === '/') { i++; v /= un(); } else if (c && /[\d.a-zA-Z(\\{]/.test(c)) v *= pow(); else return v;
      }
    }
    function expr() { let v = term(); while (s[i] === '+' || s[i] === '-') { const o = s[i++]; const t = term(); v = o === '+' ? v + t : v - t; } return v; }
    const v = expr();
    if (i !== s.length) fail();
    return v;
  }

  /* ===== families of formulae: eq, answers for each possible subject, plausible wrong answers, restrictions ===== */
  const FM = (eq, subs, bads, cond, vr, dom, pm) => ({ eq, subs, bads: bads || {}, cond, vr, dom, pm });
  const FL = (eq, dEn, dMs, subs, bads, vr, cond) => ({ eq, D: [dEn, dMs], subs, bads: bads || {}, vr, cond, lit: 1 });
  const GE = [
    FM('{y} = {x} + {a}', { x: '{y} - {a}', a: '{y} - {x}' }, { x: ['{y} + {a}', '{a} - {y}', '{a}{y}'], a: ['{y} + {x}', '{x} - {y}', '{x}{y}'] }),
    FM('{y} = {x} - {a}', { x: '{y} + {a}', a: '{x} - {y}' }, { x: ['{y} - {a}', '{a} - {y}', '\\dfrac{{y}}{{a}}'], a: ['{y} - {x}', '{y} + {x}', '\\dfrac{{x}}{{y}}'] }),
    FM('{y} = {a} - {x}', { x: '{a} - {y}', a: '{y} + {x}' }, { x: ['{y} - {a}', '{y} + {a}', '{a}{y}'], a: ['{y} - {x}', '{x} - {y}', '{x}{y}'] }),
    FM('{y} = {x} + {k}', { x: '{y} - {k}' }, { x: ['{y} + {k}', '{k} - {y}', '{k}{y}'] }),
    FM('{y} = {x} - {k}', { x: '{y} + {k}' }, { x: ['{y} - {k}', '{k} - {y}', '\\dfrac{{y}}{{k}}'] }),
    FM('{y} = {a}{x}', { x: '\\dfrac{{y}}{{a}}', a: '\\dfrac{{y}}{{x}}' }, { x: ['{a}{y}', '{y} - {a}', '\\dfrac{{a}}{{y}}'], a: ['{x}{y}', '{y} - {x}', '\\dfrac{{x}}{{y}}'] }),
    FM('{y} = {k}{x}', { x: '\\dfrac{{y}}{{k}}' }, { x: ['{k}{y}', '{y} - {k}', '\\dfrac{{k}}{{y}}'] }),
    FM('{y} = \\dfrac{{x}}{{a}}', { x: '{a}{y}', a: '\\dfrac{{x}}{{y}}' }, { x: ['\\dfrac{{y}}{{a}}', '{y} - {a}', '\\dfrac{{a}}{{y}}'], a: ['{x}{y}', '\\dfrac{{y}}{{x}}', '{y} - {x}'] }),
    FM('{y} = \\dfrac{{x}}{{k}}', { x: '{k}{y}' }, { x: ['\\dfrac{{y}}{{k}}', '{y} - {k}', '\\dfrac{{k}}{{y}}'] }),
  ];
  const GM = [
    FM('{y} = {k}{x} + {m}', { x: '\\dfrac{{y} - {m}}{{k}}' }, { x: ['\\dfrac{{y} + {m}}{{k}}', '\\dfrac{{y}}{{k}} - {m}', '{y} - \\dfrac{{m}}{{k}}'] }),
    FM('{y} = {a}{x} + {b}', { x: '\\dfrac{{y} - {b}}{{a}}', a: '\\dfrac{{y} - {b}}{{x}}', b: '{y} - {a}{x}' }, { x: ['\\dfrac{{y} + {b}}{{a}}', '\\dfrac{{y}}{{a}} - {b}', '{y} - \\dfrac{{b}}{{a}}'], a: ['\\dfrac{{y} + {b}}{{x}}', '\\dfrac{{y}}{{x}} - {b}', '{y} - {b} - {x}'] }),
    FM('{y} = {k}{x} - {m}', { x: '\\dfrac{{y} + {m}}{{k}}' }, { x: ['\\dfrac{{y} - {m}}{{k}}', '\\dfrac{{y}}{{k}} + {m}', '{y} + \\dfrac{{m}}{{k}}'] }),
    FM('{y} = {m} - {k}{x}', { x: '\\dfrac{{m} - {y}}{{k}}' }, { x: ['\\dfrac{{y} - {m}}{{k}}', '{m} - \\dfrac{{y}}{{k}}', '\\dfrac{{y} + {m}}{{k}}'] }),
    FM('{y} = {a}({x} + {b})', { x: '\\dfrac{{y}}{{a}} - {b}', a: '\\dfrac{{y}}{{x} + {b}}', b: '\\dfrac{{y}}{{a}} - {x}' }, { x: ['\\dfrac{{y}}{{a}} + {b}', '\\dfrac{{y} - {b}}{{a}}', '{y} - {a} - {b}'], b: ['\\dfrac{{y}}{{a}} + {x}', '{y} - {a}{x}', '\\dfrac{{y} - {x}}{{a}}'] }),
    FM('{y} = {k}({x} + {m})', { x: '\\dfrac{{y}}{{k}} - {m}' }, { x: ['\\dfrac{{y}}{{k}} + {m}', '\\dfrac{{y} - {m}}{{k}}', '{y} - {k} - {m}'] }),
    FM('{y} = {a}({x} - {b})', { x: '\\dfrac{{y}}{{a}} + {b}', b: '{x} - \\dfrac{{y}}{{a}}' }, { x: ['\\dfrac{{y}}{{a}} - {b}', '\\dfrac{{y} + {b}}{{a}}', '\\dfrac{{y}}{{a} + {b}}'], b: ['\\dfrac{{y}}{{a}} - {x}', '{x} - {y}', '{x} + \\dfrac{{y}}{{a}}'] }),
    FM('{y} = \\dfrac{{x} + {b}}{{a}}', { x: '{a}{y} - {b}', b: '{a}{y} - {x}', a: '\\dfrac{{x} + {b}}{{y}}' }, { x: ['{a}{y} + {b}', '\\dfrac{{y}}{{a}} - {b}', '{y} - {b}'], b: ['{a}{y} + {x}', '\\dfrac{{y}}{{a}} - {x}', '{y} - {x}'] }),
    FM('{y} = \\dfrac{{x}}{{a}} + {b}', { x: '{a}({y} - {b})', b: '{y} - \\dfrac{{x}}{{a}}' }, { x: ['{a}{y} - {b}', '\\dfrac{{y} - {b}}{{a}}', '{a}{y} + {b}'], b: ['\\dfrac{{x}}{{a}} - {y}', '{y} - {x}{a}', '{y} + \\dfrac{{x}}{{a}}'] }),
    FM('{y} = \\dfrac{{x}}{{k}} - {m}', { x: '{k}({y} + {m})' }, { x: ['{k}{y} + {m}', '\\dfrac{{y} + {m}}{{k}}', '{k}({y} - {m})'] }),
    FM('{y} = \\dfrac{{x} - {m}}{{k}}', { x: '{k}{y} + {m}' }, { x: ['{k}{y} - {m}', '\\dfrac{{y} + {m}}{{k}}', '{k}({y} + {m})'] }),
    FM('{y} = {a}{x} + {b}{c}', { x: '\\dfrac{{y} - {b}{c}}{{a}}', c: '\\dfrac{{y} - {a}{x}}{{b}}' }, { x: ['\\dfrac{{y} + {b}{c}}{{a}}', '\\dfrac{{y}}{{a}} - {b}{c}', '{y} - {a} - {b}{c}'], c: ['\\dfrac{{y} + {a}{x}}{{b}}', '\\dfrac{{y}}{{b}} - {a}{x}', '{y} - {a}{x} - {b}'] }),
    FM('{a}{x} + {b} = {c}', { x: '\\dfrac{{c} - {b}}{{a}}', b: '{c} - {a}{x}' }, { x: ['\\dfrac{{c} + {b}}{{a}}', '\\dfrac{{c}}{{a}} - {b}', '{c} - {b} - {a}'], b: ['{c} + {a}{x}', '{a}{x} - {c}', '\\dfrac{{c} - {x}}{{a}}'] }),
    FM('{y} = \\dfrac{{a}}{{b}}{x}', { x: '\\dfrac{{b}{y}}{{a}}', a: '\\dfrac{{b}{y}}{{x}}' }, { x: ['\\dfrac{{a}{y}}{{b}}', '\\dfrac{{y}}{{a}{b}}', '\\dfrac{{a}}{{b}{y}}'] }),
    FM('{y} = \\dfrac{1}{2}{a}{x}', { x: '\\dfrac{2{y}}{{a}}', a: '\\dfrac{2{y}}{{x}}' }, { x: ['\\dfrac{{y}}{2{a}}', '\\dfrac{{a}}{2{y}}', '2{y} - {a}'], a: ['\\dfrac{{y}}{2{x}}', '2{y} - {x}', '\\dfrac{{x}}{2{y}}'] }),
    FM('{y} = {a}{x} + {b}{x}', { x: '\\dfrac{{y}}{{a} + {b}}' }, { x: ['\\dfrac{{y}}{{a}} + \\dfrac{{y}}{{b}}', '\\dfrac{{y}}{{a}{b}}', '{y} - {a} - {b}'] }, '{a} + {b} \\neq 0'),
    FM('{a}{x} + {b}{y} = {c}', { x: '\\dfrac{{c} - {b}{y}}{{a}}', y: '\\dfrac{{c} - {a}{x}}{{b}}' }, { x: ['\\dfrac{{c} + {b}{y}}{{a}}', '\\dfrac{{c} - {b}}{{a}{y}}', '\\dfrac{{c}}{{a}} - {b}{y}'], y: ['\\dfrac{{c} + {a}{x}}{{b}}', '\\dfrac{{c} - {a}}{{b}{x}}', '\\dfrac{{c}}{{b}} - {a}{x}'] }),
    FM('{k}{x} + {m}{y} = {a}', { x: '\\dfrac{{a} - {m}{y}}{{k}}', y: '\\dfrac{{a} - {k}{x}}{{m}}' }, { x: ['\\dfrac{{a} + {m}{y}}{{k}}', '\\dfrac{{a}}{{k}} - {m}{y}', '{a} - {m}{y} - {k}'], y: ['\\dfrac{{a} + {k}{x}}{{m}}', '\\dfrac{{a}}{{m}} - {k}{x}', '{a} - {k}{x} - {m}'] }),
    FM('{y} = {k} - \\dfrac{{x}}{{m}}', { x: '{m}({k} - {y})' }, { x: ['{m}{k} - {y}', '{k} - {m}{y}', '\\dfrac{{k} - {y}}{{m}}'] }),
    FM('{y} = \\dfrac{{a}{x}}{{b}} + {c}', { x: '\\dfrac{{b}({y} - {c})}{{a}}' }, { x: ['\\dfrac{{b}{y} - {c}}{{a}}', '\\dfrac{{a}({y} - {c})}{{b}}', '\\dfrac{{b}({y} + {c})}{{a}}'] }),
  ];
  const GA = [
    FM('{y} = {a}({x} + {b}) + {c}', { x: '\\dfrac{{y} - {c}}{{a}} - {b}', b: '\\dfrac{{y} - {c}}{{a}} - {x}' }, { x: ['\\dfrac{{y} - {c}}{{a}} + {b}', '\\dfrac{{y} - {c} - {b}}{{a}}', '\\dfrac{{y} - {a}{b} + {c}}{{a}}'] }),
    FM('{y} = {a}{x} + {b}({x} + {c})', { x: '\\dfrac{{y} - {b}{c}}{{a} + {b}}' }, { x: ['\\dfrac{{y} - {b}{c}}{{a}}', '\\dfrac{{y} - {c}}{{a} + {b}}', '\\dfrac{{y}}{{a} + {b}} - {c}'] }, '{a} + {b} \\neq 0'),
    FM('{a}{x} + {b} = {c}{x} + {d}', { x: '\\dfrac{{d} - {b}}{{a} - {c}}' }, { x: ['\\dfrac{{b} - {d}}{{a} - {c}}', '\\dfrac{{d} - {b}}{{a} + {c}}', '\\dfrac{{d} + {b}}{{a} - {c}}'] }, '{a} \\neq {c}'),
    FM('{y} = {a}({x} + {b}) - {c}({x} - {d})', { x: '\\dfrac{{y} - {a}{b} - {c}{d}}{{a} - {c}}' }, { x: ['\\dfrac{{y} - {a}{b} + {c}{d}}{{a} - {c}}', '\\dfrac{{y} - {b} - {d}}{{a} - {c}}', '\\dfrac{{y} - {a}{b} - {c}{d}}{{a} + {c}}'] }, '{a} \\neq {c}'),
    FM('\\dfrac{{a}{x} + {b}}{{c}} = {y}', { x: '\\dfrac{{c}{y} - {b}}{{a}}', b: '{c}{y} - {a}{x}' }, { x: ['\\dfrac{{y} - {b}}{{a}{c}}', '{c}{y} + {b}', '\\dfrac{{c}{y}}{{a}} - {b}'] }),
    FM('{y} = \\dfrac{{a}({x} + {b})}{{c}}', { x: '\\dfrac{{c}{y}}{{a}} - {b}' }, { x: ['\\dfrac{{c}{y}}{{a}} + {b}', '\\dfrac{{c}{y} - {b}}{{a}}', '\\dfrac{{a}{y}}{{c}} - {b}'] }),
    FM('\\dfrac{{x}}{{a}} + \\dfrac{{y}}{{b}} = 1', { x: '{a}\\left(1 - \\dfrac{{y}}{{b}}\\right)', y: '{b}\\left(1 - \\dfrac{{x}}{{a}}\\right)' }, { x: ['{a}\\left(1 + \\dfrac{{y}}{{b}}\\right)', '{a} - \\dfrac{{y}}{{b}}', '1 - \\dfrac{{a}{y}}{{b}}'], y: ['{b}\\left(1 + \\dfrac{{x}}{{a}}\\right)', '{b} - \\dfrac{{x}}{{a}}', '1 - \\dfrac{{b}{x}}{{a}}'] }),
    FM('{y} = \\dfrac{{a}}{{b}}({x} + {c})', { x: '\\dfrac{{b}{y}}{{a}} - {c}' }, { x: ['\\dfrac{{b}{y}}{{a}} + {c}', '\\dfrac{{a}{y}}{{b}} - {c}', '\\dfrac{{b}({y} - {c})}{{a}}'] }),
    FM('\\dfrac{{x} + {a}}{{b}} = \\dfrac{{y} - {c}}{{d}}', { x: '\\dfrac{{b}({y} - {c})}{{d}} - {a}', y: '\\dfrac{{d}({x} + {a})}{{b}} + {c}' }, { x: ['\\dfrac{{b}({y} - {c})}{{d}} + {a}', '\\dfrac{{d}({y} - {c})}{{b}} - {a}', '\\dfrac{{b}{y} - {c}}{{d}} - {a}'], y: ['\\dfrac{{d}({x} + {a})}{{b}} - {c}', '\\dfrac{{b}({x} + {a})}{{d}} + {c}', '\\dfrac{{d}{x} + {a}}{{b}} + {c}'] }),
    FM('{k}({y} - {x}) = {m}{x} + {a}', { x: '\\dfrac{{k}{y} - {a}}{{kp}}' }, { x: ['\\dfrac{{k}{y} + {a}}{{kp}}', '\\dfrac{{k}{y} - {a}}{{km}}', '\\dfrac{{k}{y} - {a}}{{m}}'] }),
    FM('{a}({x} + {y}) = {b}({x} - {y})', { x: '\\dfrac{({a} + {b}){y}}{{b} - {a}}' }, { x: ['\\dfrac{({a} + {b}){y}}{{a} - {b}}', '\\dfrac{({a} - {b}){y}}{{a} + {b}}', '\\dfrac{({b} - {a}){y}}{{a} + {b}}'] }, '{a} \\neq {b}'),
    FM('{y} = {a} + \\dfrac{{x} - {b}}{{c}}', { x: '{c}({y} - {a}) + {b}' }, { x: ['{c}({y} - {a}) - {b}', '{c}({y} + {a}) + {b}', '\\dfrac{{y} - {a}}{{c}} + {b}'] }),
    FM('{y} = {k}({x} - {a}) + {m}', { x: '\\dfrac{{y} - {m}}{{k}} + {a}' }, { x: ['\\dfrac{{y} - {m}}{{k}} - {a}', '\\dfrac{{y} + {m}}{{k}} + {a}', '\\dfrac{{y} - {m} + {a}}{{k}}'] }),
    FM('\\dfrac{{y}}{{a}} = \\dfrac{{x}}{{b}} + {c}', { x: '{b}\\left(\\dfrac{{y}}{{a}} - {c}\\right)' }, { x: ['{b}\\left(\\dfrac{{y}}{{a}} + {c}\\right)', '\\dfrac{{y}}{{a}{b}} - {c}', '\\dfrac{{b}{y}}{{a}} - {c}'] }),
  ];
  const FLe = [
    FL('s = vt', 'distance, speed and time', 'jarak, laju dan masa', { v: '\\dfrac{s}{t}', t: '\\dfrac{s}{v}' }, { v: ['st', 's - t', '\\dfrac{t}{s}'], t: ['sv', 's - v', '\\dfrac{v}{s}'] }),
    FL('A = lw', 'the area, length and width of a rectangle', 'luas, panjang dan lebar sebuah segi empat tepat', { l: '\\dfrac{A}{w}', w: '\\dfrac{A}{l}' }, { l: ['Aw', 'A - w', '\\dfrac{w}{A}'], w: ['Al', 'A - l', '\\dfrac{l}{A}'] }),
    FL('V = lwh', 'the volume of a cuboid', 'isi padu sebuah kuboid', { h: '\\dfrac{V}{lw}', l: '\\dfrac{V}{wh}' }, { h: ['\\dfrac{V}{l} - w', 'Vlw', '\\dfrac{lw}{V}'], l: ['\\dfrac{V}{w} - h', 'Vwh', '\\dfrac{wh}{V}'] }),
    FL('P = a + b + c', 'the perimeter of a triangle', 'perimeter sebuah segi tiga', { c: 'P - a - b', a: 'P - b - c' }, { c: ['P + a + b', 'a + b - P', 'P - a + b'], a: ['P + b + c', 'b + c - P', 'P - b + c'] }),
    FL('K = C + 273', 'temperature in kelvin ($K$) and degrees Celsius ($C$)', 'suhu dalam kelvin ($K$) dan darjah Celsius ($C$)', { C: 'K - 273' }, { C: ['K + 273', '273 - K', '273K'] }),
    FL('A = \\dfrac{1}{2}bh', 'the area of a triangle with base $b$ and height $h$', 'luas sebuah segi tiga yang bertapak $b$ dan bertinggi $h$', { b: '\\dfrac{2A}{h}', h: '\\dfrac{2A}{b}' }, { b: ['\\dfrac{A}{2h}', '2Ah', '\\dfrac{h}{2A}'], h: ['\\dfrac{A}{2b}', '2Ab', '\\dfrac{b}{2A}'] }),
  ];
  const FLm = [
    FL('P = 2(l + w)', 'the perimeter of a rectangle', 'perimeter sebuah segi empat tepat', { l: '\\dfrac{P}{2} - w', w: '\\dfrac{P}{2} - l' }, { l: ['\\dfrac{P - w}{2}', 'P - 2w', '\\dfrac{P}{2} + w'], w: ['\\dfrac{P - l}{2}', 'P - 2l', '\\dfrac{P}{2} + l'] }),
    FL('A = \\dfrac{1}{2}(a + b)h', 'the area of a trapezium', 'luas sebuah trapezium', { h: '\\dfrac{2A}{a + b}', a: '\\dfrac{2A}{h} - b' }, { h: ['\\dfrac{2A}{a} + b', '\\dfrac{A}{2(a + b)}', '2A(a + b)'], a: ['\\dfrac{2A - b}{h}', '\\dfrac{A}{2h} - b', '\\dfrac{2A}{h} + b'] }),
    FL('I = \\dfrac{PRT}{100}', 'simple interest', 'faedah mudah', { P: '\\dfrac{100I}{RT}', R: '\\dfrac{100I}{PT}', T: '\\dfrac{100I}{PR}' }, { P: ['\\dfrac{I}{100RT}', '\\dfrac{RT}{100I}', '100I - RT'], R: ['\\dfrac{I}{100PT}', '\\dfrac{PT}{100I}', '100I - PT'], T: ['\\dfrac{I}{100PR}', '\\dfrac{PR}{100I}', '100I - PR'] }),
    FL('F = \\dfrac{9}{5}C + 32', 'temperature in degrees Fahrenheit ($F$) and degrees Celsius ($C$)', 'suhu dalam darjah Fahrenheit ($F$) dan darjah Celsius ($C$)', { C: '\\dfrac{5}{9}(F - 32)' }, { C: ['\\dfrac{5}{9}F - 32', '\\dfrac{9}{5}(F - 32)', '\\dfrac{5(F + 32)}{9}'] }, { F: [50, 68, 86, 104, 122, 140, 41, 59, 77, 95, 113], C: [0, 5, 10, 15, 20, 25, 30, 35, 40] }),
    FL('v = u + at', 'the final velocity $v$, initial velocity $u$, acceleration $a$ and time $t$', 'halaju akhir $v$, halaju awal $u$, pecutan $a$ dan masa $t$', { u: 'v - at', a: '\\dfrac{v - u}{t}', t: '\\dfrac{v - u}{a}' }, { u: ['v + at', '\\dfrac{v}{at}', '\\dfrac{v - a}{t}'], a: ['\\dfrac{v + u}{t}', 'v - u - t', '\\dfrac{v}{t} - u'], t: ['\\dfrac{v + u}{a}', 'v - u - a', '\\dfrac{v}{a} - u'] }),
    FL('C = nP + D', 'the total cost $C$ of $n$ items of price $P$ each plus a delivery charge $D$', 'jumlah kos $C$ bagi $n$ barang berharga $P$ setiap satu ditambah caj penghantaran $D$', { n: '\\dfrac{C - D}{P}', P: '\\dfrac{C - D}{n}', D: 'C - nP' }, { n: ['\\dfrac{C + D}{P}', '\\dfrac{C}{P} - D', 'C - D - P'], P: ['\\dfrac{C + D}{n}', '\\dfrac{C}{n} - D', 'C - D - n'], D: ['C + nP', 'nP - C', '\\dfrac{C}{nP}'] }),
    FL('M = \\dfrac{a + b + c}{3}', 'the mean $M$ of three numbers $a$, $b$ and $c$', 'min $M$ bagi tiga nombor $a$, $b$ dan $c$', { c: '3M - a - b', a: '3M - b - c' }, { c: ['\\dfrac{M}{3} - a - b', '3M + a + b', '3(M - a - b)'], a: ['\\dfrac{M}{3} - b - c', '3M + b + c', '3(M - b - c)'] }),
    FL('y = mx + c', 'a straight line with gradient $m$ and $y$-intercept $c$', 'garis lurus yang kecerunannya $m$ dan pintasan-$y$ $c$', { m: '\\dfrac{y - c}{x}', x: '\\dfrac{y - c}{m}', c: 'y - mx' }, { m: ['\\dfrac{y + c}{x}', '\\dfrac{y}{x} - c', 'y - c - x'], x: ['\\dfrac{y + c}{m}', '\\dfrac{y}{m} - c', 'y - c - m'], c: ['mx - y', 'y + mx', '\\dfrac{y}{mx}'] }),
    FL('C = 2\\pi r', 'the circumference $C$ of a circle of radius $r$', 'lilitan $C$ bagi bulatan yang berjejari $r$', { r: '\\dfrac{C}{2\\pi}' }, { r: ['2\\pi C', '\\dfrac{2C}{\\pi}', '\\dfrac{C}{\\pi}'] }, { C: [44, 88, 132, 176, 220], r: [7, 14, 21] }),
    FL('V = \\pi r^2 h', 'the volume $V$ of a cylinder of radius $r$ and height $h$', 'isi padu $V$ sebuah silinder berjejari $r$ dan bertinggi $h$', { h: '\\dfrac{V}{\\pi r^2}' }, { h: ['\\dfrac{V}{\\pi r}', '\\dfrac{V}{\\pi} - r^2', 'V\\pi r^2'] }, { V: [154, 308, 462, 616], r: [7] }),
    FL('A = 2\\pi rh', 'the curved surface area $A$ of a cylinder of radius $r$ and height $h$', 'luas permukaan melengkung $A$ sebuah silinder berjejari $r$ dan bertinggi $h$', { h: '\\dfrac{A}{2\\pi r}', r: '\\dfrac{A}{2\\pi h}' }, { h: ['\\dfrac{2\\pi r}{A}', '\\dfrac{A}{2\\pi} - r', '\\dfrac{A}{\\pi r}'] }, { A: [88, 132, 176, 264, 308], r: [7, 14], h: [7, 14] }),
    FL('S = 180(n - 2)', 'the sum $S$ of the interior angles (in degrees) of a polygon with $n$ sides', 'hasil tambah $S$ sudut pedalaman (dalam darjah) sebuah poligon yang mempunyai $n$ sisi', { n: '\\dfrac{S}{180} + 2' }, { n: ['\\dfrac{S + 2}{180}', '\\dfrac{S}{180 - 2}', '\\dfrac{S}{180} - 2'] }, { S: [540, 720, 900, 1080, 1260, 1440, 1620] }),
  ];
  const FLa = [
    FL('s = ut + \\dfrac{1}{2}at^2', 'the distance $s$ travelled in time $t$ with initial speed $u$ and acceleration $a$', 'jarak $s$ yang dilalui dalam masa $t$ dengan laju awal $u$ dan pecutan $a$', { u: '\\dfrac{2s - at^2}{2t}', a: '\\dfrac{2(s - ut)}{t^2}' }, { u: ['\\dfrac{s - at^2}{t}', 's - \\dfrac{1}{2}at', '\\dfrac{2s - at^2}{t}'], a: ['\\dfrac{2s - ut}{t^2}', '\\dfrac{2(s - ut)}{t}', '\\dfrac{s - ut}{2t^2}'] }),
    FL('S = \\dfrac{n}{2}(a + l)', 'the sum $S$ of $n$ numbers in a list with first number $a$ and last number $l$', 'hasil tambah $S$ bagi $n$ nombor dalam satu senarai dengan nombor pertama $a$ dan nombor terakhir $l$', { l: '\\dfrac{2S}{n} - a', a: '\\dfrac{2S}{n} - l', n: '\\dfrac{2S}{a + l}' }, { l: ['\\dfrac{2S - a}{n}', '\\dfrac{S}{2n} - a', '\\dfrac{2S}{n} + a'], a: ['\\dfrac{2S - l}{n}', '\\dfrac{S}{2n} - l', '\\dfrac{2S}{n} + l'], n: ['\\dfrac{2S}{a} + l', '\\dfrac{S}{2(a + l)}', '2S(a + l)'] }),
    FL('E = \\dfrac{1}{2}mv^2', 'the kinetic energy $E$ of a body of mass $m$ moving with speed $v$', 'tenaga kinetik $E$ bagi suatu jasad berjisim $m$ yang bergerak dengan laju $v$', { m: '\\dfrac{2E}{v^2}' }, { m: ['\\dfrac{E}{2v^2}', '\\dfrac{2E}{v}', '2Ev^2'] }),
    FL('V = \\dfrac{1}{3}\\pi r^2 h', 'the volume $V$ of a cone of radius $r$ and height $h$', 'isi padu $V$ sebuah kon berjejari $r$ dan bertinggi $h$', { h: '\\dfrac{3V}{\\pi r^2}' }, { h: ['\\dfrac{V}{3\\pi r^2}', '\\dfrac{3V}{\\pi r}', '\\dfrac{V}{\\pi r^2} - 3'] }, { V: [154, 308, 462, 616], r: [7], h: [3, 6, 9] }),
    FL('A = \\dfrac{1}{2}(a + b)h', 'the area of a trapezium', 'luas sebuah trapezium', { b: '\\dfrac{2A}{h} - a', h: '\\dfrac{2A}{a + b}' }, { b: ['\\dfrac{2A - a}{h}', '\\dfrac{A}{2h} - a', '\\dfrac{2A}{h} + a'] }),
    FL('I = \\dfrac{PRT}{100}', 'simple interest', 'faedah mudah', { P: '\\dfrac{100I}{RT}', R: '\\dfrac{100I}{PT}', T: '\\dfrac{100I}{PR}' }, { P: ['\\dfrac{I}{100RT}', '\\dfrac{RT}{100I}', '100I - RT'] }),
  ];

  /* ===== rearrangement steps for every (formula, subject) pair, keyed by the equation template ===== */
  const WK = {
    '{y} = {x} + {a}': { x: ['{x} + {a} = {y}', '{x} = {y} - {a}'], a: ['{x} + {a} = {y}', '{a} = {y} - {x}'] },
    '{y} = {x} - {a}': { x: ['{x} - {a} = {y}', '{x} = {y} + {a}'], a: ['{x} - {a} = {y}', '{x} - {y} = {a}', '{a} = {x} - {y}'] },
    '{y} = {a} - {x}': { x: ['{a} - {x} = {y}', '{a} - {y} = {x}', '{x} = {a} - {y}'], a: ['{a} - {x} = {y}', '{a} = {y} + {x}'] },
    '{y} = {x} + {k}': { x: ['{x} + {k} = {y}', '{x} = {y} - {k}'] },
    '{y} = {x} - {k}': { x: ['{x} - {k} = {y}', '{x} = {y} + {k}'] },
    '{y} = {a}{x}': { x: ['{a}{x} = {y}', '{x} = \\dfrac{{y}}{{a}}'], a: ['{a}{x} = {y}', '{a} = \\dfrac{{y}}{{x}}'] },
    '{y} = {k}{x}': { x: ['{k}{x} = {y}', '{x} = \\dfrac{{y}}{{k}}'] },
    '{y} = \\dfrac{{x}}{{a}}': { x: ['\\dfrac{{x}}{{a}} = {y}', '{x} = {a}{y}'], a: ['\\dfrac{{x}}{{a}} = {y}', '{x} = {a}{y}', '{a} = \\dfrac{{x}}{{y}}'] },
    '{y} = \\dfrac{{x}}{{k}}': { x: ['\\dfrac{{x}}{{k}} = {y}', '{x} = {k}{y}'] },
    '{y} = {k}{x} + {m}': { x: ['{k}{x} + {m} = {y}', '{k}{x} = {y} - {m}', '{x} = \\dfrac{{y} - {m}}{{k}}'] },
    '{y} = {a}{x} + {b}': { x: ['{a}{x} + {b} = {y}', '{a}{x} = {y} - {b}', '{x} = \\dfrac{{y} - {b}}{{a}}'], a: ['{a}{x} = {y} - {b}', '{a} = \\dfrac{{y} - {b}}{{x}}'], b: ['{b} = {y} - {a}{x}'] },
    '{y} = {k}{x} - {m}': { x: ['{k}{x} - {m} = {y}', '{k}{x} = {y} + {m}', '{x} = \\dfrac{{y} + {m}}{{k}}'] },
    '{y} = {m} - {k}{x}': { x: ['{m} - {k}{x} = {y}', '{m} - {y} = {k}{x}', '{x} = \\dfrac{{m} - {y}}{{k}}'] },
    '{y} = {a}({x} + {b})': { x: ['{a}({x} + {b}) = {y}', '{x} + {b} = \\dfrac{{y}}{{a}}', '{x} = \\dfrac{{y}}{{a}} - {b}'], a: ['{a}({x} + {b}) = {y}', '{a} = \\dfrac{{y}}{{x} + {b}}'], b: ['{x} + {b} = \\dfrac{{y}}{{a}}', '{b} = \\dfrac{{y}}{{a}} - {x}'] },
    '{y} = {k}({x} + {m})': { x: ['{k}({x} + {m}) = {y}', '{x} + {m} = \\dfrac{{y}}{{k}}', '{x} = \\dfrac{{y}}{{k}} - {m}'] },
    '{y} = {a}({x} - {b})': { x: ['{a}({x} - {b}) = {y}', '{x} - {b} = \\dfrac{{y}}{{a}}', '{x} = \\dfrac{{y}}{{a}} + {b}'], b: ['{x} - {b} = \\dfrac{{y}}{{a}}', '{b} = {x} - \\dfrac{{y}}{{a}}'] },
    '{y} = \\dfrac{{x} + {b}}{{a}}': { x: ['\\dfrac{{x} + {b}}{{a}} = {y}', '{x} + {b} = {a}{y}', '{x} = {a}{y} - {b}'], b: ['{x} + {b} = {a}{y}', '{b} = {a}{y} - {x}'], a: ['{x} + {b} = {a}{y}', '{a} = \\dfrac{{x} + {b}}{{y}}'] },
    '{y} = \\dfrac{{x}}{{a}} + {b}': { x: ['\\dfrac{{x}}{{a}} + {b} = {y}', '\\dfrac{{x}}{{a}} = {y} - {b}', '{x} = {a}({y} - {b})'], b: ['{b} = {y} - \\dfrac{{x}}{{a}}'] },
    '{y} = \\dfrac{{x}}{{k}} - {m}': { x: ['\\dfrac{{x}}{{k}} - {m} = {y}', '\\dfrac{{x}}{{k}} = {y} + {m}', '{x} = {k}({y} + {m})'] },
    '{y} = \\dfrac{{x} - {m}}{{k}}': { x: ['\\dfrac{{x} - {m}}{{k}} = {y}', '{x} - {m} = {k}{y}', '{x} = {k}{y} + {m}'] },
    '{y} = {a}{x} + {b}{c}': { x: ['{a}{x} + {b}{c} = {y}', '{a}{x} = {y} - {b}{c}', '{x} = \\dfrac{{y} - {b}{c}}{{a}}'], c: ['{b}{c} = {y} - {a}{x}', '{c} = \\dfrac{{y} - {a}{x}}{{b}}'] },
    '{a}{x} + {b} = {c}': { x: ['{a}{x} = {c} - {b}', '{x} = \\dfrac{{c} - {b}}{{a}}'], b: ['{b} = {c} - {a}{x}'] },
    '{y} = \\dfrac{{a}}{{b}}{x}': { x: ['\\dfrac{{a}{x}}{{b}} = {y}', '{a}{x} = {b}{y}', '{x} = \\dfrac{{b}{y}}{{a}}'], a: ['{a}{x} = {b}{y}', '{a} = \\dfrac{{b}{y}}{{x}}'] },
    '{y} = \\dfrac{1}{2}{a}{x}': { x: ['\\dfrac{1}{2}{a}{x} = {y}', '{a}{x} = 2{y}', '{x} = \\dfrac{2{y}}{{a}}'], a: ['{a}{x} = 2{y}', '{a} = \\dfrac{2{y}}{{x}}'] },
    '{y} = {a}{x} + {b}{x}': { x: ['({a} + {b}){x} = {y}', '{x} = \\dfrac{{y}}{{a} + {b}}'] },
    '{a}{x} + {b}{y} = {c}': { x: ['{a}{x} = {c} - {b}{y}', '{x} = \\dfrac{{c} - {b}{y}}{{a}}'], y: ['{b}{y} = {c} - {a}{x}', '{y} = \\dfrac{{c} - {a}{x}}{{b}}'] },
    '{k}{x} + {m}{y} = {a}': { x: ['{k}{x} = {a} - {m}{y}', '{x} = \\dfrac{{a} - {m}{y}}{{k}}'], y: ['{m}{y} = {a} - {k}{x}', '{y} = \\dfrac{{a} - {k}{x}}{{m}}'] },
    '{y} = {k} - \\dfrac{{x}}{{m}}': { x: ['\\dfrac{{x}}{{m}} = {k} - {y}', '{x} = {m}({k} - {y})'] },
    '{y} = \\dfrac{{a}{x}}{{b}} + {c}': { x: ['\\dfrac{{a}{x}}{{b}} = {y} - {c}', '{a}{x} = {b}({y} - {c})', '{x} = \\dfrac{{b}({y} - {c})}{{a}}'] },
    '{y} = {a}({x} + {b}) + {c}': { x: ['{a}({x} + {b}) = {y} - {c}', '{x} + {b} = \\dfrac{{y} - {c}}{{a}}', '{x} = \\dfrac{{y} - {c}}{{a}} - {b}'], b: ['{x} + {b} = \\dfrac{{y} - {c}}{{a}}', '{b} = \\dfrac{{y} - {c}}{{a}} - {x}'] },
    '{y} = {a}{x} + {b}({x} + {c})': { x: ['{y} = {a}{x} + {b}{x} + {b}{c}', '({a} + {b}){x} = {y} - {b}{c}', '{x} = \\dfrac{{y} - {b}{c}}{{a} + {b}}'] },
    '{a}{x} + {b} = {c}{x} + {d}': { x: ['{a}{x} - {c}{x} = {d} - {b}', '({a} - {c}){x} = {d} - {b}', '{x} = \\dfrac{{d} - {b}}{{a} - {c}}'] },
    '{y} = {a}({x} + {b}) - {c}({x} - {d})': { x: ['{y} = {a}{x} + {a}{b} - {c}{x} + {c}{d}', '({a} - {c}){x} = {y} - {a}{b} - {c}{d}', '{x} = \\dfrac{{y} - {a}{b} - {c}{d}}{{a} - {c}}'] },
    '\\dfrac{{a}{x} + {b}}{{c}} = {y}': { x: ['{a}{x} + {b} = {c}{y}', '{a}{x} = {c}{y} - {b}', '{x} = \\dfrac{{c}{y} - {b}}{{a}}'], b: ['{a}{x} + {b} = {c}{y}', '{b} = {c}{y} - {a}{x}'] },
    '{y} = \\dfrac{{a}({x} + {b})}{{c}}': { x: ['{a}({x} + {b}) = {c}{y}', '{x} + {b} = \\dfrac{{c}{y}}{{a}}', '{x} = \\dfrac{{c}{y}}{{a}} - {b}'] },
    '\\dfrac{{x}}{{a}} + \\dfrac{{y}}{{b}} = 1': { x: ['\\dfrac{{x}}{{a}} = 1 - \\dfrac{{y}}{{b}}', '{x} = {a}\\left(1 - \\dfrac{{y}}{{b}}\\right)'], y: ['\\dfrac{{y}}{{b}} = 1 - \\dfrac{{x}}{{a}}', '{y} = {b}\\left(1 - \\dfrac{{x}}{{a}}\\right)'] },
    '{y} = \\dfrac{{a}}{{b}}({x} + {c})': { x: ['{a}({x} + {c}) = {b}{y}', '{x} + {c} = \\dfrac{{b}{y}}{{a}}', '{x} = \\dfrac{{b}{y}}{{a}} - {c}'] },
    '\\dfrac{{x} + {a}}{{b}} = \\dfrac{{y} - {c}}{{d}}': { x: ['{d}({x} + {a}) = {b}({y} - {c})', '{x} + {a} = \\dfrac{{b}({y} - {c})}{{d}}', '{x} = \\dfrac{{b}({y} - {c})}{{d}} - {a}'], y: ['{d}({x} + {a}) = {b}({y} - {c})', '{y} - {c} = \\dfrac{{d}({x} + {a})}{{b}}', '{y} = \\dfrac{{d}({x} + {a})}{{b}} + {c}'] },
    '{k}({y} - {x}) = {m}{x} + {a}': { x: ['{k}{y} - {k}{x} = {m}{x} + {a}', '{k}{y} - {a} = {m}{x} + {k}{x}', '{kp}{x} = {k}{y} - {a}', '{x} = \\dfrac{{k}{y} - {a}}{{kp}}'] },
    '{a}({x} + {y}) = {b}({x} - {y})': { x: ['{a}{x} + {a}{y} = {b}{x} - {b}{y}', '{a}{y} + {b}{y} = {b}{x} - {a}{x}', '({a} + {b}){y} = ({b} - {a}){x}', '{x} = \\dfrac{({a} + {b}){y}}{{b} - {a}}'] },
    '{y} = {a} + \\dfrac{{x} - {b}}{{c}}': { x: ['\\dfrac{{x} - {b}}{{c}} = {y} - {a}', '{x} - {b} = {c}({y} - {a})', '{x} = {c}({y} - {a}) + {b}'] },
    '{y} = {k}({x} - {a}) + {m}': { x: ['{k}({x} - {a}) = {y} - {m}', '{x} - {a} = \\dfrac{{y} - {m}}{{k}}', '{x} = \\dfrac{{y} - {m}}{{k}} + {a}'] },
    '\\dfrac{{y}}{{a}} = \\dfrac{{x}}{{b}} + {c}': { x: ['\\dfrac{{x}}{{b}} = \\dfrac{{y}}{{a}} - {c}', '{x} = {b}\\left(\\dfrac{{y}}{{a}} - {c}\\right)'] },
    's = vt': { v: ['vt = s', 'v = \\dfrac{s}{t}'], t: ['vt = s', 't = \\dfrac{s}{v}'] },
    'A = lw': { l: ['lw = A', 'l = \\dfrac{A}{w}'], w: ['lw = A', 'w = \\dfrac{A}{l}'] },
    'V = lwh': { h: ['lwh = V', 'h = \\dfrac{V}{lw}'], l: ['lwh = V', 'l = \\dfrac{V}{wh}'] },
    'P = a + b + c': { c: ['a + b + c = P', 'c = P - a - b'], a: ['a + b + c = P', 'a = P - b - c'] },
    'K = C + 273': { C: ['C + 273 = K', 'C = K - 273'] },
    'A = \\dfrac{1}{2}bh': { b: ['\\dfrac{1}{2}bh = A', 'bh = 2A', 'b = \\dfrac{2A}{h}'], h: ['\\dfrac{1}{2}bh = A', 'bh = 2A', 'h = \\dfrac{2A}{b}'] },
    'P = 2(l + w)': { l: ['2(l + w) = P', 'l + w = \\dfrac{P}{2}', 'l = \\dfrac{P}{2} - w'], w: ['2(l + w) = P', 'l + w = \\dfrac{P}{2}', 'w = \\dfrac{P}{2} - l'] },
    'A = \\dfrac{1}{2}(a + b)h': { h: ['(a + b)h = 2A', 'h = \\dfrac{2A}{a + b}'], a: ['(a + b)h = 2A', 'a + b = \\dfrac{2A}{h}', 'a = \\dfrac{2A}{h} - b'], b: ['(a + b)h = 2A', 'a + b = \\dfrac{2A}{h}', 'b = \\dfrac{2A}{h} - a'] },
    'I = \\dfrac{PRT}{100}': { P: ['PRT = 100I', 'P = \\dfrac{100I}{RT}'], R: ['PRT = 100I', 'R = \\dfrac{100I}{PT}'], T: ['PRT = 100I', 'T = \\dfrac{100I}{PR}'] },
    'F = \\dfrac{9}{5}C + 32': { C: ['\\dfrac{9}{5}C = F - 32', 'C = \\dfrac{5}{9}(F - 32)'] },
    'v = u + at': { u: ['u = v - at'], a: ['at = v - u', 'a = \\dfrac{v - u}{t}'], t: ['at = v - u', 't = \\dfrac{v - u}{a}'] },
    'C = nP + D': { n: ['nP = C - D', 'n = \\dfrac{C - D}{P}'], P: ['nP = C - D', 'P = \\dfrac{C - D}{n}'], D: ['D = C - nP'] },
    'M = \\dfrac{a + b + c}{3}': { c: ['a + b + c = 3M', 'c = 3M - a - b'], a: ['a + b + c = 3M', 'a = 3M - b - c'] },
    'y = mx + c': { m: ['mx = y - c', 'm = \\dfrac{y - c}{x}'], x: ['mx = y - c', 'x = \\dfrac{y - c}{m}'], c: ['c = y - mx'] },
    'C = 2\\pi r': { r: ['2\\pi r = C', 'r = \\dfrac{C}{2\\pi}'] },
    'V = \\pi r^2 h': { h: ['\\pi r^2 h = V', 'h = \\dfrac{V}{\\pi r^2}'], r: ['\\pi r^2 h = V', 'r^2 = \\dfrac{V}{\\pi h}', 'r = \\sqrt{\\dfrac{V}{\\pi h}}'] },
    'A = 2\\pi rh': { h: ['2\\pi rh = A', 'h = \\dfrac{A}{2\\pi r}'], r: ['2\\pi rh = A', 'r = \\dfrac{A}{2\\pi h}'] },
    'S = 180(n - 2)': { n: ['180(n - 2) = S', 'n - 2 = \\dfrac{S}{180}', 'n = \\dfrac{S}{180} + 2'] },
    's = ut + \\dfrac{1}{2}at^2': { u: ['2s = 2ut + at^2', '2ut = 2s - at^2', 'u = \\dfrac{2s - at^2}{2t}'], a: ['2s = 2ut + at^2', 'at^2 = 2s - 2ut', 'a = \\dfrac{2(s - ut)}{t^2}'] },
    'S = \\dfrac{n}{2}(a + l)': { l: ['n(a + l) = 2S', 'a + l = \\dfrac{2S}{n}', 'l = \\dfrac{2S}{n} - a'], a: ['n(a + l) = 2S', 'a + l = \\dfrac{2S}{n}', 'a = \\dfrac{2S}{n} - l'], n: ['n(a + l) = 2S', 'n = \\dfrac{2S}{a + l}'] },
    'E = \\dfrac{1}{2}mv^2': { m: ['mv^2 = 2E', 'm = \\dfrac{2E}{v^2}'], v: ['mv^2 = 2E', 'v^2 = \\dfrac{2E}{m}', 'v = \\sqrt{\\dfrac{2E}{m}}'] },
    'V = \\dfrac{1}{3}\\pi r^2 h': { h: ['\\pi r^2 h = 3V', 'h = \\dfrac{3V}{\\pi r^2}'] },
    '{y} = \\dfrac{{a}}{{x}}': { x: ['{x}{y} = {a}', '{x} = \\dfrac{{a}}{{y}}'] },
    '{y} = \\dfrac{{k}}{{x}}': { x: ['{x}{y} = {k}', '{x} = \\dfrac{{k}}{{y}}'] },
    '{y} = {x}^2': { x: ['{x}^2 = {y}', '{x} = \\sqrt{{y}}'] },
    '{y} = \\sqrt{{x}}': { x: ['\\sqrt{{x}} = {y}', '{x} = {y}^2'] },
    '{y} = \\dfrac{{a}}{{x} + {b}}': { x: ['({x} + {b}){y} = {a}', '{x} + {b} = \\dfrac{{a}}{{y}}', '{x} = \\dfrac{{a}}{{y}} - {b}'] },
    '{y} = {a}{x}^2': { x: ['{a}{x}^2 = {y}', '{x}^2 = \\dfrac{{y}}{{a}}', '{x} = \\sqrt{\\dfrac{{y}}{{a}}}'] },
    '{y} = {x}^2 + {a}': { x: ['{x}^2 + {a} = {y}', '{x}^2 = {y} - {a}', '{x} = \\sqrt{{y} - {a}}'] },
    '{y} = \\sqrt{{x} + {a}}': { x: ['\\sqrt{{x} + {a}} = {y}', '{x} + {a} = {y}^2', '{x} = {y}^2 - {a}'] },
    '\\dfrac{{y}}{{x}} = \\dfrac{{a}}{{b}}': { x: ['{b}{y} = {a}{x}', '{x} = \\dfrac{{b}{y}}{{a}}'] },
    '{y} = {k}{x}^2': { x: ['{k}{x}^2 = {y}', '{x}^2 = \\dfrac{{y}}{{k}}', '{x} = \\sqrt{\\dfrac{{y}}{{k}}}'] },
    '{y} = \\dfrac{{a}}{{x}} + {b}': { x: ['\\dfrac{{a}}{{x}} = {y} - {b}', '{x}({y} - {b}) = {a}', '{x} = \\dfrac{{a}}{{y} - {b}}'] },
    '{y} = \\dfrac{{a}}{{x} - {b}}': { x: ['({x} - {b}){y} = {a}', '{x} - {b} = \\dfrac{{a}}{{y}}', '{x} = \\dfrac{{a}}{{y}} + {b}'] },
    '{y} = \\dfrac{{a}}{{b}{x}}': { x: ['{b}{x}{y} = {a}', '{x} = \\dfrac{{a}}{{b}{y}}'], b: ['{b}{x}{y} = {a}', '{b} = \\dfrac{{a}}{{x}{y}}'] },
    '{y} = \\dfrac{{a}}{{x}^2}': { x: ['{x}^2{y} = {a}', '{x}^2 = \\dfrac{{a}}{{y}}', '{x} = \\sqrt{\\dfrac{{a}}{{y}}}'] },
    '{y} = {a}({x} + {b})^2': { x: ['({x} + {b})^2 = \\dfrac{{y}}{{a}}', '{x} + {b} = \\sqrt{\\dfrac{{y}}{{a}}}', '{x} = \\sqrt{\\dfrac{{y}}{{a}}} - {b}'] },
    '{y} = \\sqrt{{a}{x} + {b}}': { x: ['{a}{x} + {b} = {y}^2', '{a}{x} = {y}^2 - {b}', '{x} = \\dfrac{{y}^2 - {b}}{{a}}'] },
    '{y} = \\sqrt{\\dfrac{{x}}{{a}}}': { x: ['\\dfrac{{x}}{{a}} = {y}^2', '{x} = {a}{y}^2'] },
    '{y} = \\dfrac{{a}}{\\sqrt{{x}}}': { x: ['{y}\\sqrt{{x}} = {a}', '\\sqrt{{x}} = \\dfrac{{a}}{{y}}', '{x} = \\dfrac{{a}^2}{{y}^2}'] },
    '{y}^2 = {x}^2 + {a}': { x: ['{x}^2 = {y}^2 - {a}', '{x} = \\sqrt{{y}^2 - {a}}'] },
    '\\dfrac{{a}}{{x}} = \\dfrac{{b}}{{y}}': { x: ['{a}{y} = {b}{x}', '{x} = \\dfrac{{a}{y}}{{b}}'], y: ['{a}{y} = {b}{x}', '{y} = \\dfrac{{b}{x}}{{a}}'] },
    '{y} = \\dfrac{{a}{x} + {b}}{{x} - {c}}': { x: ['{y}({x} - {c}) = {a}{x} + {b}', '{x}{y} - {a}{x} = {b} + {c}{y}', '{x}({y} - {a}) = {b} + {c}{y}', '{x} = \\dfrac{{b} + {c}{y}}{{y} - {a}}'] },
    '{y} = \\dfrac{{x} + {a}}{{x} - {b}}': { x: ['{y}({x} - {b}) = {x} + {a}', '{x}{y} - {x} = {a} + {b}{y}', '{x}({y} - 1) = {a} + {b}{y}', '{x} = \\dfrac{{a} + {b}{y}}{{y} - 1}'] },
    '{y} = \\dfrac{{x}}{{x} + {a}}': { x: ['{y}({x} + {a}) = {x}', '{a}{y} = {x} - {x}{y}', '{a}{y} = {x}(1 - {y})', '{x} = \\dfrac{{a}{y}}{1 - {y}}'] },
    '{y} = \\dfrac{{a}{x}}{{x} + {b}}': { x: ['{y}({x} + {b}) = {a}{x}', '{b}{y} = {a}{x} - {x}{y}', '{b}{y} = {x}({a} - {y})', '{x} = \\dfrac{{b}{y}}{{a} - {y}}'] },
    '\\dfrac{{x} + {a}}{{x} - {b}} = \\dfrac{{c}}{{d}}': { x: ['{d}({x} + {a}) = {c}({x} - {b})', '{d}{x} + {a}{d} = {c}{x} - {b}{c}', '{a}{d} + {b}{c} = {c}{x} - {d}{x}', '{x}({c} - {d}) = {a}{d} + {b}{c}', '{x} = \\dfrac{{a}{d} + {b}{c}}{{c} - {d}}'] },
    '\\dfrac{1}{{x}} + \\dfrac{1}{{a}} = \\dfrac{1}{{y}}': { x: ['\\dfrac{1}{{x}} = \\dfrac{1}{{y}} - \\dfrac{1}{{a}}', '\\dfrac{1}{{x}} = \\dfrac{{a} - {y}}{{a}{y}}', '{x} = \\dfrac{{a}{y}}{{a} - {y}}'] },
    '{y} = \\dfrac{2{a}{x}}{{a} + {x}}': { x: ['{y}({a} + {x}) = 2{a}{x}', '{a}{y} = 2{a}{x} - {x}{y}', '{a}{y} = {x}(2{a} - {y})', '{x} = \\dfrac{{a}{y}}{2{a} - {y}}'] },
    '{y} = \\sqrt{\\dfrac{{a}{x} + {b}}{{c}}}': { x: ['\\dfrac{{a}{x} + {b}}{{c}} = {y}^2', '{a}{x} + {b} = {c}{y}^2', '{x} = \\dfrac{{c}{y}^2 - {b}}{{a}}'] },
    '{y} = {a}\\sqrt{{x}} + {b}': { x: ['{a}\\sqrt{{x}} = {y} - {b}', '\\sqrt{{x}} = \\dfrac{{y} - {b}}{{a}}', '{x} = \\left(\\dfrac{{y} - {b}}{{a}}\\right)^2'] },
    '{y} = \\sqrt{{x}^2 + {a}}': { x: ['{x}^2 + {a} = {y}^2', '{x}^2 = {y}^2 - {a}', '{x} = \\sqrt{{y}^2 - {a}}'] },
    '{y} = \\dfrac{{x}^2}{{a}} - {b}': { x: ['\\dfrac{{x}^2}{{a}} = {y} + {b}', '{x}^2 = {a}({y} + {b})', '{x} = \\sqrt{{a}({y} + {b})}'] },
    'A = \\pi r^2': { r: ['\\pi r^2 = A', 'r^2 = \\dfrac{A}{\\pi}', 'r = \\sqrt{\\dfrac{A}{\\pi}}'] },
    '\\dfrac{1}{R} = \\dfrac{1}{a} + \\dfrac{1}{b}': { R: ['\\dfrac{1}{R} = \\dfrac{a + b}{ab}', 'R = \\dfrac{ab}{a + b}'], b: ['\\dfrac{1}{b} = \\dfrac{1}{R} - \\dfrac{1}{a}', '\\dfrac{1}{b} = \\dfrac{a - R}{aR}', 'b = \\dfrac{aR}{a - R}'] },
    '\\dfrac{1}{f} = \\dfrac{1}{u} + \\dfrac{1}{v}': { v: ['\\dfrac{1}{v} = \\dfrac{1}{f} - \\dfrac{1}{u}', '\\dfrac{1}{v} = \\dfrac{u - f}{uf}', 'v = \\dfrac{uf}{u - f}'], u: ['\\dfrac{1}{u} = \\dfrac{1}{f} - \\dfrac{1}{v}', '\\dfrac{1}{u} = \\dfrac{v - f}{vf}', 'u = \\dfrac{vf}{v - f}'] },
    'v = \\dfrac{2ab}{a + b}': { b: ['v(a + b) = 2ab', 'av = 2ab - bv', 'av = b(2a - v)', 'b = \\dfrac{av}{2a - v}'] },
  };
  /* ===== building one instance: pick a family, letters, subject; verify by back-substitution ===== */
  const LY = ['y', 'P', 'T', 'V', 'F', 'S', 'A', 'C', 'D', 'W'], LX = ['x', 't', 'r', 'n', 'w', 'h', 'u', 'z'], LO = ['a', 'b', 'c', 'd', 'm', 'p', 'q', 's', 'v', 'g'];
  const chk = (I, V) => {
    try {
      const sv = texEval(I.ans, V), W = Object.assign({}, V, { [I.s]: sv });
      return Number.isFinite(sv) && Math.abs(texEval(I.L, W) - texEval(I.R, W)) < 1e-7 * (1 + Math.abs(sv));
    } catch (e) { return false; }
  };
  function inst(r, pool, o) {
    o = o || {};
    const f = r.pick(pool), O = {};
    if (!f.lit) {
      O.y = r.pick(LY); O.x = r.pick(LX);
      const os = r.sample(LO, 4);
      O.a = os[0]; O.b = os[1]; O.c = os[2]; O.d = os[3];
      O.k = r.int(2, 9); O.m = r.int(2, 9);
      need(O.k !== O.m);
      O.kp = O.k + O.m; O.km = Math.abs(O.k - O.m);
    }
    let keys = Object.keys(f.subs);
    if (o.bad) keys = keys.filter((k) => (f.bads[k] || []).length >= 3);
    if (o.cond) keys = keys.filter((k) => (typeof f.cond === 'object' ? f.cond[k] : f.cond));
    if (o.two) need(keys.length >= 2);
    need(keys.length);
    const key = r.pick(keys), s = f.lit ? key : O[key];
    const eq = fill(f.eq, O), ans = fill(f.subs[key], O), parts = eq.split(' = ');
    const vs = [...new Set(eq.replace(/\\[a-zA-Z]+/g, '').match(/[a-zA-Z]/g))];
    const I = { f, O, key, s, eq, ans, wst: ((WK[f.eq] || {})[key] || []).map((t) => fill(t, O)), L: parts[0], R: parts[1], others: vs.filter((v) => v !== s), bads: (f.bads[key] || []).map((b) => fill(b, O)), cond: f.cond && fill(typeof f.cond === 'object' ? f.cond[key] : f.cond, O), dom: f.dom && fill(f.dom, O), pm: f.pm, pi: eq.indexOf('\\pi') >= 0, D: f.D, vr: f.vr };
    const V = {};
    for (const v of I.others) V[v] = f.vr && f.vr[v] ? r.pick(f.vr[v]) : r.int(2, 9);
    need(chk(I, V));
    if (o.two) {
      const k2 = r.pick(keys.filter((k) => k !== key));
      I.s2 = f.lit ? k2 : O[k2]; I.ans2 = fill(f.subs[k2], O); I.wst2 = ((WK[f.eq] || {})[k2] || []).map((t) => fill(t, O));
      const J = { s: I.s2, ans: I.ans2, L: I.L, R: I.R };
      const V2 = {};
      for (const v of vs.filter((v) => v !== I.s2)) V2[v] = f.vr && f.vr[v] ? r.pick(f.vr[v]) : r.int(2, 9);
      need(chk(J, V2));
    }
    return I;
  }
  /* named formulae whose letters may sensibly be negative (the rest are lengths, money, counts, times) */
  const NEGOK = { 'K = C + 273': 1, 'F = \\dfrac{9}{5}C + 32': 1, 'y = mx + c': 1, 'M = \\dfrac{a + b + c}{3}': 1 };
  const negOk = (I, neg) => neg && !(I.f.lit && !NEGOK[I.f.eq]);
  /* values for the "hence find" parts: integer answer, equation verified again */
  function pickV(r, I, neg) {
    neg = negOk(I, neg);
    for (let t = 0; t < 120; t++) {
      const V = {};
      for (const v of I.others) V[v] = I.vr && I.vr[v] ? r.pick(I.vr[v]) : neg ? r.nz(-9, 12) : r.int(1, 12);
      let sv;
      try { sv = texEval(I.ans, V); } catch (e) { continue; }
      if (!Number.isFinite(sv) || Math.abs(sv - Math.round(sv)) > 1e-9 || sv === 0 || Math.abs(sv) > 250 || (!neg && sv < 0)) continue;
      sv = Math.round(sv);
      const W = Object.assign({}, V, { [I.s]: sv });
      if (Math.abs(texEval(I.L, W) - texEval(I.R, W)) > 1e-7) continue;
      return { V, sv, W, z: texEval(I.L, W) };
    }
    throw SPM.REJECT;
  }
  const vtxt = (I, V) => I.others.map((v) => `$${v} = ${V[v]}$`).join(', ');
  const piN = (I) => (I.pi ? T(' (Use $\\pi = \\dfrac{22}{7}$.)', ' (Gunakan $\\pi = \\dfrac{22}{7}$.)') : '');
  const SE = (I) => `$${I.s} = ${I.ans}$`;
  const EQ = (I) => `$${I.eq}${I.dom ? ',\\ ' + I.dom : ''}$`;
  const S_ = (I) => `$${I.s}$`;
  /* substitute the drawn values into a TeX expression, leaving \commands alone */
  const subTex = (tex, V) => tex.replace(/\\[a-zA-Z]+|[a-zA-Z]/g, (t, off) => {
    if (t[0] === '\\' || V[t] === undefined) return t;
    let i = off - 1; while (tex[i] === ' ') i--;
    let j = off + 1; while (tex[j] === ' ') j++;
    const safe = (ch, set) => ch === undefined || set.indexOf(ch) >= 0;
    const ok = safe(tex[i], '{([=+-,*/^') && safe(tex[j], '})]=+-,*/^\\');
    return V[t] < 0 || !ok ? '(' + n(V[t]) + ')' : n(V[t]);
  });
  const wsteps = (I, pre, st) => ((st || I.wst).length ? (st || I.wst) : [`${I.s} = ${I.ans}`]).map((t, i) => (i === 0 ? pre || '' : '') + `$${t}$`);
  const wsteps2 = (I, pre) => (I.wst2 && I.wst2.length ? I.wst2 : [`${I.s2} = ${I.ans2}`]).map((t, i) => (i === 0 ? pre || '' : '') + `$${t}$`);
  const wsub = (I, v, pre) => (pre || '') + `$${I.s} = ${subTex(I.ans, v.V)} = ${v.sv}$`;
  const WD = [
    ['Make {S} the subject of {E}.', 'Jadikan {S} sebagai perkara rumus bagi {E}.'],
    ['Rearrange {E} to make {S} the subject.', 'Susun semula {E} supaya {S} menjadi perkara rumus.'],
    ['Express {S} in terms of the other letters in {E}.', 'Ungkapkan {S} dalam sebutan huruf-huruf lain dalam {E}.'],
    ['Change the subject of {E} to {S}.', 'Tukarkan perkara rumus bagi {E} kepada {S}.'],
    ['From {E}, find a formula for {S}.', 'Daripada {E}, cari satu rumus bagi {S}.'],
  ];
  const wq = (k, I) => tf(WD[k][0], WD[k][1], { S: S_(I), E: EQ(I) });
  const plain = (pool, k, sp, o) => (r) => { const I = inst(r, pool, o); return { q: wq(k, I), a: T(SE(I)), w: W(...wsteps(I)), sp }; };
  const ctxPlain = (pool, sp) => (r) => {
    const I = inst(r, pool);
    return { q: T(`The formula connecting ${I.D[0]} is ${EQ(I)}. Make ${S_(I)} the subject.`, `Rumus yang menghubungkan ${I.D[1]} ialah ${EQ(I)}. Jadikan ${S_(I)} sebagai perkara rumus.`), a: T(SE(I)), w: W(...wsteps(I)), sp };
  };
  const ctxEval = (pool, neg) => (r) => {
    const I = inst(r, pool), v = pickV(r, I, neg);
    return { q: Q(T(`The formula for ${I.D[0]} is ${EQ(I)}. Make ${S_(I)} the subject, and hence find ${S_(I)} when ${vtxt(I, v.V)}.`, `Rumus bagi ${I.D[1]} ialah ${EQ(I)}. Jadikan ${S_(I)} sebagai perkara rumus, dan seterusnya cari ${S_(I)} apabila ${vtxt(I, v.V)}.`), piN(I)), a: T(`${SE(I)}; $${I.s} = ${v.sv}$`), w: W(...wsteps(I), wsub(I, v)), sp: 'm' };
  };
  const evalQ = (pool, neg) => (r) => {
    const I = inst(r, pool), v = pickV(r, I, neg);
    return { q: Q(T(`Make ${S_(I)} the subject of ${EQ(I)}. Hence find the value of ${S_(I)} when ${vtxt(I, v.V)}.`, `Jadikan ${S_(I)} sebagai perkara rumus bagi ${EQ(I)}. Seterusnya, cari nilai ${S_(I)} apabila ${vtxt(I, v.V)}.`), piN(I)), a: T(`${SE(I)}; $${I.s} = ${v.sv}$`), w: W(...wsteps(I), wsub(I, v)), sp: 'm' };
  };
  const partsQ = (pool, neg) => (r) => {
    const I = inst(r, pool), v = pickV(r, I, neg);
    return { q: Q(T(`Given that ${EQ(I)}. `, `Diberi ${EQ(I)}. `), P([T(`Express ${S_(I)} in terms of the other letters.`, `Ungkapkan ${S_(I)} dalam sebutan huruf-huruf yang lain.`), Q(T(`Find ${S_(I)} when ${vtxt(I, v.V)}.`, `Cari ${S_(I)} apabila ${vtxt(I, v.V)}.`), piN(I))])), a: P([T(SE(I)), T(`$${I.s} = ${v.sv}$`)]), w: W(...wsteps(I, '(a) '), wsub(I, v, '(b) ')), sp: 'm' };
  };
  const mcqQ = (pool) => (r) => {
    const I = inst(r, pool, { bad: 1 }), fm2 = (x) => `$${I.s} = ${x}$`;
    const m = mcq(r, I.ans, I.bads.slice(0, 3), fm2);
    return { q: T(`Which of the following is the result of making ${S_(I)} the subject of ${EQ(I)}?<br>${m.q}`, `Yang manakah hasil menjadikan ${S_(I)} sebagai perkara rumus bagi ${EQ(I)}?<br>${m.q}`), a: T(m.ans), w: W(...wsteps(I)), sp: 'xs' };
  };
  const wrongQ = (pool, neg) => (r) => {
    const I = inst(r, pool, { bad: 1 }), v = pickV(r, I, neg), bad = r.pick(I.bads);
    let bv;
    try { bv = texEval(bad, v.V); } catch (e) { bv = NaN; }
    need(Number.isFinite(bv) && Math.abs(bv - v.sv) > 1e-9);
    const b2 = n(round(bv, 2));
    return { q: Q(T(`${r.name()} made ${S_(I)} the subject of ${EQ(I)} and wrote $${I.s} = ${bad}$. By substituting ${vtxt(I, v.V)}, show that this formula is wrong, and write the correct formula.`, `${r.name()} menjadikan ${S_(I)} sebagai perkara rumus bagi ${EQ(I)} dan menulis $${I.s} = ${bad}$. Dengan menggantikan ${vtxt(I, v.V)}, tunjukkan bahawa rumus ini salah, dan tulis rumus yang betul.`), piN(I)), a: T(`The wrong formula gives $${I.s} = ${b2}$, but the true value is ${v.sv}. Correct: ${SE(I)}`, `Rumus yang salah memberi $${I.s} = ${b2}$, tetapi nilai sebenar ialah ${v.sv}. Betul: ${SE(I)}`), w: W(T(`The given formula gives $${subTex(bad, v.V)} = ${b2}$.`, `Rumus yang diberi memberi $${subTex(bad, v.V)} = ${b2}$.`), ...wsteps(I), wsub(I, v), T('The two values differ, so the given formula is wrong.', 'Kedua-dua nilai berbeza, jadi rumus yang diberi itu salah.')), sp: 'm' };
  };
  const wrongQ2 = (pool) => (r) => {
    const I = inst(r, pool, { bad: 1 }), v = pickV(r, I), bad = r.pick(I.bads), [n1, n2] = r.pair();
    let bv;
    try { bv = texEval(bad, v.V); } catch (e) { bv = NaN; }
    need(Number.isFinite(bv) && Math.abs(bv - v.sv) > 1e-9);
    const first = r.chance(), A1 = first ? I.ans : bad, A2 = first ? bad : I.ans;
    return { q: Q(T(`From ${EQ(I)}, ${n1} writes $${I.s} = ${A1}$ and ${n2} writes $${I.s} = ${A2}$. Decide who is correct by testing both formulae with ${vtxt(I, v.V)}.`, `Daripada ${EQ(I)}, ${n1} menulis $${I.s} = ${A1}$ dan ${n2} menulis $${I.s} = ${A2}$. Tentukan siapa yang betul dengan menguji kedua-dua rumus dengan ${vtxt(I, v.V)}.`), piN(I)), a: T(`${first ? n1 : n2} is correct: ${SE(I)} gives ${v.sv}; the other formula gives ${n(round(bv, 2))}.`, `${first ? n1 : n2} betul: ${SE(I)} memberi ${v.sv}; rumus yang satu lagi memberi ${n(round(bv, 2))}.`), w: W(...wsteps(I), wsub(I, v), T(`The other formula gives $${subTex(bad, v.V)} = ${n(round(bv, 2))}$, so it is wrong.`, `Rumus yang satu lagi memberi $${subTex(bad, v.V)} = ${n(round(bv, 2))}$, jadi ia salah.`)), sp: 'm' };
  };
  const verifyQ = (pool, neg) => (r) => {
    const I = inst(r, pool), v = pickV(r, I, neg);
    return { q: Q(T(`Given that ${SE(I)} is the result of making ${S_(I)} the subject of ${EQ(I)}: (a) find ${S_(I)} when ${vtxt(I, v.V)}; (b) check your answer by substituting all the values into ${EQ(I)}.`, `Diberi ${SE(I)} ialah hasil menjadikan ${S_(I)} sebagai perkara rumus bagi ${EQ(I)}: (a) cari ${S_(I)} apabila ${vtxt(I, v.V)}; (b) semak jawapan anda dengan menggantikan semua nilai ke dalam ${EQ(I)}.`), piN(I)), a: T(`(a) $${I.s} = ${v.sv}$ (b) both sides equal $${n(round(v.z, 4))}$`, `(a) $${I.s} = ${v.sv}$ (b) kedua-dua belah sama dengan $${n(round(v.z, 4))}$`), w: W(...wsteps(I), wsub(I, v, '(a) '), T(`(b) Put every value into ${EQ(I)}: both sides give $${n(round(v.z, 4))}$, so the answer checks out.`, `(b) Masukkan setiap nilai ke dalam ${EQ(I)}: kedua-dua belah memberi $${n(round(v.z, 4))}$, jadi jawapan itu disahkan.`)), sp: 'm' };
  };
  const tfQ = (pool) => (r) => {
    const I = inst(r, pool, { bad: 1 }), v = pickV(r, I), good = r.chance(), cand = good ? I.ans : r.pick(I.bads);
    let cv;
    try { cv = texEval(cand, v.V); } catch (e) { cv = NaN; }
    need(Number.isFinite(cv) && (good || Math.abs(cv - v.sv) > 1e-9));
    return { q: Q(T(`Is $${I.s} = ${cand}$ a correct rearrangement of ${EQ(I)}? Test it with ${vtxt(I, v.V)} and answer Yes or No.`, `Adakah $${I.s} = ${cand}$ satu penyusunan semula yang betul bagi ${EQ(I)}? Ujinya dengan ${vtxt(I, v.V)} dan jawab Ya atau Tidak.`), piN(I)), a: good ? T(`Yes: it gives $${I.s} = ${v.sv}$, which satisfies ${EQ(I)}. Correct.`, `Ya: ia memberi $${I.s} = ${v.sv}$, yang memuaskan ${EQ(I)}. Betul.`) : T(`No: it gives ${n(round(cv, 2))}, but the true value is ${v.sv}. The correct formula is ${SE(I)}.`, `Tidak: ia memberi ${n(round(cv, 2))}, tetapi nilai sebenar ialah ${v.sv}. Rumus yang betul ialah ${SE(I)}.`), w: W(...wsteps(I), wsub(I, v), good ? T('The formula in the question gives the same value, so the rearrangement is correct.', 'Rumus dalam soalan memberi nilai yang sama, jadi penyusunan semula itu betul.') : T(`The formula in the question gives $${subTex(cand, v.V)} = ${n(round(cv, 2))}$, which is different.`, `Rumus dalam soalan memberi $${subTex(cand, v.V)} = ${n(round(cv, 2))}$, yang berbeza.`)), sp: 's' };
  };
  const blankQ = (pool) => (r) => {
    const I = inst(r, pool);
    return { q: T(`Complete: if ${EQ(I)}, then $${I.s} = \\square$`, `Lengkapkan: jika ${EQ(I)}, maka $${I.s} = \\square$`), a: T(SE(I)), w: W(...wsteps(I)), sp: 's' };
  };
  const twoQ = (pool) => (r) => {
    const I = inst(r, pool, { two: 1 });
    return { q: Q(T(`Given ${EQ(I)}: `, `Diberi ${EQ(I)}: `), P([T(`make $${I.s}$ the subject;`, `jadikan $${I.s}$ sebagai perkara rumus;`), T(`make $${I.s2}$ the subject of the same formula.`, `jadikan $${I.s2}$ sebagai perkara rumus bagi rumus yang sama.`)])), a: P([T(SE(I)), T(`$${I.s2} = ${I.ans2}$`)]), w: W(...wsteps(I, '(a) '), ...wsteps2(I, '(b) ')), sp: 'm' };
  };
  const restrictQ = (pool) => (r) => {
    const I = inst(r, pool, { cond: 1 });
    return { q: T(`Make ${S_(I)} the subject of ${EQ(I)}. State the condition on the other letters for which your formula is defined.`, `Jadikan ${S_(I)} sebagai perkara rumus bagi ${EQ(I)}. Nyatakan syarat bagi huruf-huruf lain supaya rumus anda tertakrif.`), a: T(`${SE(I)}, where $${I.cond}$`, `${SE(I)}, dengan $${I.cond}$`), w: W(...wsteps(I), T(`The formula only works when $${I.cond}$, because a denominator can never be zero.`, `Rumus ini hanya sah apabila $${I.cond}$, kerana penyebut tidak boleh sifar.`)), sp: 'm' };
  };
  const cmpVals = (pool) => (r) => {
    const I = inst(r, pool, { cond: 1 }), v = pickV(r, I);
    return { q: T(`In the formula ${EQ(I)}, ${S_(I)} is made the subject. Why must $${I.cond}$ hold? Use the rearranged formula to explain, and find ${S_(I)} when ${vtxt(I, v.V)}.`, `Dalam rumus ${EQ(I)}, ${S_(I)} dijadikan perkara rumus. Mengapakah $${I.cond}$ mesti dipenuhi? Gunakan rumus yang disusun semula untuk menerangkan, dan cari ${S_(I)} apabila ${vtxt(I, v.V)}.`), a: T(`${SE(I)}. The denominator would be zero if $${I.cond.replace('\\neq', '=')}$, and division by zero is not possible. $${I.s} = ${v.sv}$.`, `${SE(I)}. Penyebut akan menjadi sifar jika $${I.cond.replace('\\neq', '=')}$, dan pembahagian dengan sifar tidak tertakrif. $${I.s} = ${v.sv}$.`), w: W(...wsteps(I), T(`If $${I.cond.replace('\\neq', '=')}$ the denominator is zero, and division by zero is not defined; that is why $${I.cond}$ is needed.`, `Jika $${I.cond.replace('\\neq', '=')}$ penyebutnya sifar, dan pembahagian dengan sifar tidak tertakrif; itulah sebabnya $${I.cond}$ diperlukan.`), wsub(I, v)), sp: 'm' };
  };
/*EXPORT*/
  const e32 = [
    plain(GE, 0, 'xs'), plain(GE, 1, 'xs'), plain(GE, 2, 'xs'), plain(GE, 3, 'xs'), plain(GE, 4, 'xs'),
    ctxPlain(FLe, 's'), ctxEval(FLe), evalQ(GE), mcqQ(GE), tfQ(GE), blankQ(GE), twoQ(GE), partsQ(GE),
  ];
  const m32 = [
    plain(GM, 0, 's'), plain(GM, 1, 's'), plain(GM, 2, 's'), plain(GM, 3, 's'), plain(GM, 4, 's'),
    ctxPlain(FLm, 's'), ctxEval(FLm), ctxEval(FLm, 1), evalQ(GM), evalQ(GM, 1), partsQ(GM), mcqQ(GM), wrongQ(GM), wrongQ2(GM), verifyQ(GM), tfQ(GM), twoQ(GM), blankQ(GM),
  ];
  const a32 = [
    plain(GA, 0, 'm'), plain(GA, 2, 'm'), plain(GA, 3, 'm'), plain(GA, 4, 'm'), restrictQ(GA), cmpVals(GA), evalQ(GA), evalQ(GA, 1), partsQ(GA), verifyQ(GA), mcqQ(GA), wrongQ(GA), wrongQ2(GA), twoQ(GA), tfQ(GA),
    ctxPlain(FLa, 'm'), ctxEval(FLa), ctxEval(FLm.concat(FLa), 1), mcqQ(FLa), wrongQ(FLa), wrongQ2(FLa), verifyQ(FLm), twoQ(FLm),
  ];
  SPM.extend('F2-3.2', { e: e32, m: m32, a: a32 });

  /* ===== 3.3 Relating variables and determining values ===== */
  const frF = (r, pool, neg, dec) => {
    const I = inst(r, pool);
    need(/^[A-Za-z]$/.test(I.L));
    neg = negOk(I, neg);
    const vs = I.others.concat([I.s]).filter((v) => v !== I.L);
    for (let t = 0; t < 100; t++) {
      const V = {};
      for (const v of vs) V[v] = I.vr && I.vr[v] ? r.pick(I.vr[v]) : dec ? r.step(1, 12, 0.5) : neg ? r.nz(-9, 12) : r.int(1, 12);
      let z;
      try { z = texEval(I.R, V); } catch (e) { continue; }
      if (!Number.isFinite(z) || Math.abs(z) > 600 || Math.abs(z * 100 - Math.round(z * 100)) > 1e-6 || (!dec && Math.abs(z - Math.round(z)) > 1e-9) || z === 0) continue;
      I.V = V; I.z = Math.round(z * 100) / 100; I.vs = vs;
      return I;
    }
    throw SPM.REJECT;
  };
  const vt2 = (I) => I.vs.map((v) => `$${v} = ${I.V[v]}$`).join(', ');
  const FW = [
    ['Given that {E}, find the value of {L} when {V}.', 'Diberi {E}, cari nilai {L} apabila {V}.'],
    ['Use the formula {E} to calculate {L} when {V}.', 'Gunakan rumus {E} untuk mengira {L} apabila {V}.'],
    ['Substitute {V} into {E} to find {L}.', 'Gantikan {V} ke dalam {E} untuk mencari {L}.'],
  ];
  const fwdQ = (pool, k, neg, dec) => (r) => {
    const I = frF(r, pool, neg, dec), o = { E: EQ(I), L: `$${I.L}$`, V: vt2(I) };
    return { q: Q(tf(FW[k][0], FW[k][1], o), piN(I)), a: T(`$${I.L} = ${n(I.z)}$`), w: W(`$${I.L} = ${subTex(I.R, I.V)}$`, `$${I.L} = ${n(I.z)}$`), sp: 's' };
  };
  const fwdCtx = (pool, neg) => (r) => {
    const I = frF(r, pool, neg);
    return { q: Q(T(`The formula for ${I.D[0]} is ${EQ(I)}. Find the value of $${I.L}$ when ${vt2(I)}.`, `Rumus bagi ${I.D[1]} ialah ${EQ(I)}. Cari nilai $${I.L}$ apabila ${vt2(I)}.`), piN(I)), a: T(`$${I.L} = ${n(I.z)}$`), w: W(`$${I.L} = ${subTex(I.R, I.V)}$`, `$${I.L} = ${n(I.z)}$`), sp: 's' };
  };
  const revQ = (pool, neg) => (r) => {
    const I = inst(r, pool), v = pickV(r, I, neg), V = Object.assign({}, v.V);
    const vals = I.others.map((x) => `$${x} = ${V[x]}$`).join(', ');
    return { q: Q(T(`In the formula ${EQ(I)}, ${vals}. Find the value of $${I.s}$.`, `Dalam rumus ${EQ(I)}, ${vals}. Cari nilai $${I.s}$.`), piN(I)), a: T(`$${I.s} = ${v.sv}$`), w: W(...wsteps(I), wsub(I, v)), sp: 's' };
  };
  const shQ = (r) => {
    const sh = r.pick(SH), v = shVals(r, sh), vals = sh[3].map((k) => `$${k} = ${v[k]}$`).join(', ');
    return { q: T(`Use the formula $${sh[2]}$ for ${sh[0]} to find its value when ${vals}.`, `Gunakan rumus $${sh[2]}$ bagi ${sh[1]} untuk mencari nilainya apabila ${vals}.`), a: T(`$${n(sh[4](v))}$${sh[5] === 'degrees' ? '°' : ' ' + sh[5]}`), w: W(`$${sh[8](v)} = ${n(sh[4](v))}$`), sp: 's' };
  };
  const ctxLin = (mode) => (r) => {
    const c = r.pick(CT), d = dr(r, c), f = fm(c, d.a, d.b);
    const x2 = r.int(c.xr[0], c.xr[1]), y2 = evalAt(c, d, x2);
    need(y2 > 0);
    const head = T(`${SPM.cap(c.y[0])} is given by $${f}$, where ${XV(c)} is ${c.x[0]}. `, `${SPM.cap(c.y[1])} diberi oleh $${f}$, dengan ${XV(c)} ialah ${c.x[1]}. `);
    if (mode === 0) return { q: Q(head, T(`Find ${YV(c)} when ${XV(c)} = ${x2}.`, `Cari ${YV(c)} apabila ${XV(c)} = ${x2}.`)), a: T(`$${c.yv} = ${y2}$`), w: W(subL(c, d, x2)), sp: 's' };
    if (mode === 1) return { q: Q(head, T(`Find ${XV(c)} when ${YV(c)} = ${y2}.`, `Cari ${XV(c)} apabila ${YV(c)} = ${y2}.`)), a: T(`$${c.xv} = ${x2}$`), w: W(solveL(c, d, y2)), sp: 's' };
    if (mode === 2) return { q: Q(head, P([T(`Find ${YV(c)} when ${XV(c)} = ${x2}.`, `Cari ${YV(c)} apabila ${XV(c)} = ${x2}.`), T(`Find ${XV(c)} when ${YV(c)} = ${d.y}.`, `Cari ${XV(c)} apabila ${YV(c)} = ${d.y}.`)])), a: P([T(`$${c.yv} = ${y2}$`), T(`$${c.xv} = ${d.x}$`)]), w: W(subL(c, d, x2, '(a) '), solveL(c, d, d.y, '(b) ')), sp: 'm' };
    if (mode === 3) { const k = r.int(2, 5); return { q: Q(head, T(`By how much does ${YV(c)} ${c.up ? 'increase' : 'decrease'} when ${XV(c)} increases by ${k}?`, `Berapakah ${c.up ? 'pertambahan' : 'pengurangan'} ${YV(c)} apabila ${XV(c)} bertambah ${k}?`)), a: vT(c, d.a * k), w: W(T(`${YV(c)} ${c.up ? 'goes up' : 'goes down'} by $${d.a}$ for every $1$ added to ${XV(c)}.`, `${YV(c)} ${c.up ? 'bertambah' : 'berkurang'} $${d.a}$ bagi setiap $1$ yang ditambah kepada ${XV(c)}.`), `$${d.a} \\times ${k} = ${d.a * k}$`), sp: 's' }; }
    if (mode === 4) return { q: Q(head, T(`Which quantity depends on the other? Find ${YV(c)} when ${XV(c)} = 0 and say what it means.`, `Kuantiti yang manakah bergantung pada yang satu lagi? Cari ${YV(c)} apabila ${XV(c)} = 0 dan nyatakan maksudnya.`)), a: T(`${YV(c)} depends on ${XV(c)}. When ${XV(c)} = 0, ${YV(c)} = ${d.b}: ${c.bm[0]}.`, `${YV(c)} bergantung pada ${XV(c)}. Apabila ${XV(c)} = 0, ${YV(c)} = ${d.b}: ${c.bm[1]}.`), w: W(subL(c, d, 0), T(`With $${c.xv} = 0$ nothing has been used yet, so ${YV(c)} is ${c.bm[0]} on its own.`, `Apabila $${c.xv} = 0$ belum ada penggunaan, jadi ${YV(c)} ialah ${c.bm[1]} sahaja.`)), sp: 's' };
    const x3 = x2 + r.int(1, 4), y3 = evalAt(c, d, x3);
    need(y3 > 0);
    return { q: Q(head, T(`Compare the values of ${YV(c)} when ${XV(c)} = ${x2} and when ${XV(c)} = ${x3}. Which is greater and by how much?`, `Bandingkan nilai ${YV(c)} apabila ${XV(c)} = ${x2} dan apabila ${XV(c)} = ${x3}. Yang manakah lebih besar dan berapakah bezanya?`)), a: T(`${y2} and ${y3}; the value at ${XV(c)} = ${y3 > y2 ? x3 : x2} is greater by ${Math.abs(y3 - y2)}.`, `${y2} dan ${y3}; nilai pada ${XV(c)} = ${y3 > y2 ? x3 : x2} lebih besar sebanyak ${Math.abs(y3 - y2)}.`), w: W(subL(c, d, x2), subL(c, d, x3), `$${Math.max(y2, y3)} - ${Math.min(y2, y3)} = ${Math.abs(y3 - y2)}$`), sp: 's' };
  };
  /* tables of values */
  const TFe = ['{k}{x} + {m}', '{k}{x} - {m}', '{m} - {x}', '{k}{x}', '{x} + {m}', '{k}{x} + 1'];
  const TFm = ['{x}^2 + {m}', '{k}{x}^2', '{x}^2 - {k}{x}', '({x} + {m})^2', '\\dfrac{{x}}{2} + {m}', '{m} - {k}{x}', '{x}^3', '\\dfrac{{x}^2 + {m}}{2}', '{k}{x}^2 - {m}', '{x}^2 - {k}'];
  const XSe = [[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 4, 6, 8, 10], [0, 2, 4, 6, 8], [1, 3, 5, 7, 9]];
  const XSm = [[-2, -1, 0, 1, 2], [-3, -2, -1, 0, 1], [-4, -2, 0, 2, 4], [-1, 0, 1, 2, 3], [-2, 0, 2, 4, 6]];
  const tabF = (list, xss, rev) => (r) => {
    const O = { k: r.int(2, 5), m: r.int(1, 9), x: r.pick(['x', 't', 'n', 'p']) }, yv = r.pick(['y', 'P', 'V', 'C', 'T']);
    const rhs = fill(r.pick(list), O), xs = r.pick(xss), ys = xs.map((x) => texEval(rhs, { [O.x]: x }));
    need(ys.every((y) => Number.isFinite(y) && Number.isInteger(y)));
    const hide = r.sample([0, 1, 2, 3, 4], r.int(2, 3)).sort();
    const hy = ys.map((y, i) => (hide.includes(i) && !rev ? '?' : y)), hx = xs.map((x, i) => (hide.includes(i) && rev ? '?' : x));
    if (rev) need(new Set(ys).size === ys.length);
    const tb = SPM.table([[`$${O.x}$`].concat(hx.map(n)), [`$${yv}$`].concat(hy.map(n))], { rowHead: true });
    const lab = rev ? O.x : yv, vals = hide.map((i) => (rev ? xs[i] : ys[i]));
    return { q: T(`The table shows some values of $${yv} = ${rhs}$.<br>${tb}Find the missing values of $${lab}$.`, `Jadual menunjukkan beberapa nilai bagi $${yv} = ${rhs}$.<br>${tb}Cari nilai-nilai $${lab}$ yang tidak diberikan.`), a: T(`$${lab}$: ${vals.join(', ')}`), w: W(T('Substitute each value into the formula.', 'Gantikan setiap nilai ke dalam rumus itu.'), ...hide.map((i) => (rev
      ? T(`$${yv} = ${ys[i]}$: $${subTex(rhs, { [O.x]: xs[i] })} = ${ys[i]}$, so $${O.x} = ${xs[i]}$.`, `$${yv} = ${ys[i]}$: $${subTex(rhs, { [O.x]: xs[i] })} = ${ys[i]}$, jadi $${O.x} = ${xs[i]}$.`)
      : `$${O.x} = ${xs[i]}$: $${yv} = ${subTex(rhs, { [O.x]: xs[i] })} = ${ys[i]}$`))), sp: 'm' };
  };
  /* effect of changing variables */
  const ELP = [
    ['A = lw', 'the area of a rectangle', 'luas sebuah segi empat tepat', ['l', 'w']], ['s = vt', 'the distance travelled at constant speed', 'jarak yang dilalui pada laju malar', ['v', 't']],
    ['A = \\dfrac{1}{2}bh', 'the area of a triangle', 'luas sebuah segi tiga', ['b', 'h']], ['V = lwh', 'the volume of a cuboid', 'isi padu sebuah kuboid', ['l', 'w', 'h']],
    ['C = 2\\pi r', 'the circumference of a circle', 'lilitan sebuah bulatan', ['r']], ['A = \\pi r^2', 'the area of a circle', 'luas sebuah bulatan', ['r']],
    ['V = \\pi r^2 h', 'the volume of a cylinder', 'isi padu sebuah silinder', ['r', 'h']], ['V = s^3', 'the volume of a cube', 'isi padu sebuah kubus', ['s']],
    ['A = 6s^2', 'the surface area of a cube', 'luas permukaan sebuah kubus', ['s']], ['t = \\dfrac{d}{v}', 'the time taken for a journey', 'masa yang diambil bagi satu perjalanan', ['d', 'v']],
    ['n = \\dfrac{C}{p}', 'the number of items bought', 'bilangan barang yang dibeli', ['C', 'p']], ['I = \\dfrac{PRT}{100}', 'simple interest', 'faedah mudah', ['P', 'R', 'T']],
  ];
  const CH = [[2, 'doubled', 'digandakan'], [0.5, 'halved', 'dikurangkan separuh'], [3, 'tripled', 'digandakan tiga kali'], [1 / 3, 'divided by 3', 'dibahagi 3'], [4, 'multiplied by 4', 'didarab 4'], [1.1, 'increased by 10%', 'bertambah 10%'], [0.8, 'decreased by 20%', 'berkurang 20%'], [1.5, 'increased by 50%', 'bertambah 50%']];
  const rTxt = (q) => {
    if (Math.abs(q - 1) < 1e-9) return ['unchanged', 'tidak berubah'];
    if (q > 1) { const p = round((q - 1) * 100, 4); if (Math.abs(q - Math.round(q)) < 1e-9) return q === 2 ? ['doubled', 'digandakan'] : [`multiplied by ${Math.round(q)}`, `didarab ${Math.round(q)}`]; return [`increased by ${n(p)}%`, `bertambah ${n(p)}%`]; }
    const iv = 1 / q;
    if (Math.abs(iv - Math.round(iv)) < 1e-9) return iv === 2 ? ['halved', 'dikurangkan separuh'] : [`divided by ${Math.round(iv)}`, `dibahagi ${Math.round(iv)}`];
    const p = round((1 - q) * 100, 4); return [`decreased by ${n(p)}%`, `berkurang ${n(p)}%`];
  };
  const effect = (r, many, pct) => {
    const f = r.pick(ELP), vs = many ? r.sample(f[3], Math.min(2, f[3].length)) : [r.pick(f[3])], eq = f[0], L = eq[0];
    const chs = vs.map(() => r.pick(pct ? CH : CH.slice(0, 5)));
    let q0 = null;
    for (let t = 0; t < 4; t++) {
      const V = {}; for (const v of f[3]) V[v] = r.int(2, 9);
      const rhs = eq.split(' = ')[1], a = texEval(rhs, V), W = Object.assign({}, V);
      vs.forEach((v, i) => (W[v] = V[v] * chs[i][0]));
      const q1 = texEval(rhs, W) / a;
      if (q0 !== null) need(Math.abs(q1 - q0) < 1e-9);
      q0 = q1;
    }
    const V0 = {}; for (const v of f[3]) V0[v] = r.int(2, 9);
    const rhs0 = eq.split(' = ')[1], b0 = texEval(rhs0, V0), W0 = Object.assign({}, V0);
    vs.forEach((v, i) => (W0[v] = V0[v] * chs[i][0]));
    const a0 = texEval(rhs0, W0);
    need(Math.abs(a0 / b0 - q0) < 1e-9);
    return { f, vs, chs, txt: rTxt(q0), eq, V0, W0, b0: round(b0, 4), a0: round(a0, 4), q0: round(q0, 4) };
  };
  const effVals = (e, V) => e.f[3].map((v) => `$${v} = ${n(round(V[v], 4))}$`).join(', ');
  const effW = (e) => [
    T(`Try ${effVals(e, e.V0)}: $${e.eq[0]} = ${n(e.b0)}$.`, `Cuba ${effVals(e, e.V0)}: $${e.eq[0]} = ${n(e.b0)}$.`),
    T(`After the change, ${effVals(e, e.W0)}: $${e.eq[0]} = ${n(e.a0)}$.`, `Selepas perubahan, ${effVals(e, e.W0)}: $${e.eq[0]} = ${n(e.a0)}$.`),
    T(`$${n(e.a0)} \\div ${n(e.b0)} = ${n(e.q0)}$, so $${e.eq[0]}$ is ${e.txt[0]}.`, `$${n(e.a0)} \\div ${n(e.b0)} = ${n(e.q0)}$, jadi $${e.eq[0]}$ ${e.txt[1]}.`)];
  const effQ = (many, pct) => (r) => {
    const e = effect(r, many, pct), who = e.vs.map((v, i) => `$${v}$ is ${e.chs[i][1]}`).join(' and '), whoM = e.vs.map((v, i) => `$${v}$ ${e.chs[i][2]}`).join(' dan ');
    const rest = e.f[3].filter((v) => !e.vs.includes(v));
    return { q: T(`In the formula $${e.eq}$ (${e.f[1]}), ${who}${rest.length ? ' while the other letters stay the same' : ''}. What happens to $${e.eq[0]}$?`, `Dalam rumus $${e.eq}$ (${e.f[2]}), ${whoM}${rest.length ? ' manakala huruf-huruf lain kekal sama' : ''}. Apakah yang berlaku kepada $${e.eq[0]}$?`), a: T(`$${e.eq[0]}$ is ${e.txt[0]}.`, `$${e.eq[0]}$ ${e.txt[1]}.`), w: W(...effW(e)), sp: 's' };
  };
  const effMcq = (many) => (r) => {
    const e = effect(r, many, 0), who = e.vs.map((v, i) => `$${v}$ is ${e.chs[i][1]}`).join(' and '), whoM = e.vs.map((v, i) => `$${v}$ ${e.chs[i][2]}`).join(' dan ');
    const all = [['unchanged', 'tidak berubah'], ['doubled', 'digandakan'], ['halved', 'dikurangkan separuh'], ['multiplied by 4', 'didarab 4'], ['multiplied by 8', 'didarab 8'], ['divided by 4', 'dibahagi 4'], ['tripled', 'digandakan tiga kali']];
    const ok = all.findIndex((x) => x[0] === e.txt[0]);
    need(ok >= 0);
    const opts = [all[ok]].concat(r.sample(all.filter((_, i) => i !== ok), 3)), ord = r.shuffle(opts);
    const L = (k) => ord.map((x, i) => `(${OPT[i]}) ${x[k]}`).join(' &emsp; ');
    const ans = `(${OPT[ord.indexOf(all[ok])]}) `;
    return { q: T(`In $${e.eq}$, ${who}. Then $${e.eq[0]}$ is<br>${L(0)}`, `Dalam $${e.eq}$, ${whoM}. Maka $${e.eq[0]}$<br>${L(1)}`), a: T(ans + all[ok][0], ans + all[ok][1]), w: W(...effW(e)), sp: 'xs' };
  };
  const PIF = [
    ['the circumference of a circle of radius {r} cm', 'lilitan sebuah bulatan berjejari {r} cm', 'C = 2\\pi r', (v, p) => 2 * p * v.r, { r: [3, 14] }, 'cm', (vv, pt) => `C = 2 \\times ${pt} \\times ${vv.r}`],
    ['the area of a circle of radius {r} cm', 'luas sebuah bulatan berjejari {r} cm', 'A = \\pi r^2', (v, p) => p * v.r * v.r, { r: [3, 14] }, 'cm$^2$', (vv, pt) => `A = ${pt} \\times ${vv.r}^2`],
    ['the volume of a cylinder of radius {r} cm and height {h} cm', 'isi padu sebuah silinder berjejari {r} cm dan tinggi {h} cm', 'V = \\pi r^2 h', (v, p) => p * v.r * v.r * v.h, { r: [3, 10], h: [4, 15] }, 'cm$^3$', (vv, pt) => `V = ${pt} \\times ${vv.r}^2 \\times ${vv.h}`],
    ['the volume of a cone of radius {r} cm and height {h} cm', 'isi padu sebuah kon berjejari {r} cm dan tinggi {h} cm', 'V = \\dfrac{1}{3}\\pi r^2 h', (v, p) => (p * v.r * v.r * v.h) / 3, { r: [3, 10], h: [4, 15] }, 'cm$^3$', (vv, pt) => `V = \\dfrac{1}{3} \\times ${pt} \\times ${vv.r}^2 \\times ${vv.h}`],
    ['the volume of a sphere of radius {r} cm', 'isi padu sebuah sfera berjejari {r} cm', 'V = \\dfrac{4}{3}\\pi r^3', (v, p) => (4 * p * v.r ** 3) / 3, { r: [2, 9] }, 'cm$^3$', (vv, pt) => `V = \\dfrac{4}{3} \\times ${pt} \\times ${vv.r}^3`],
    ['the curved surface area of a cylinder of radius {r} cm and height {h} cm', 'luas permukaan melengkung sebuah silinder berjejari {r} cm dan tinggi {h} cm', 'A = 2\\pi rh', (v, p) => 2 * p * v.r * v.h, { r: [3, 10], h: [4, 15] }, 'cm$^2$', (vv, pt) => `A = 2 \\times ${pt} \\times ${vv.r} \\times ${vv.h}`],
  ];
  const piQ = (exact) => (r) => {
    const f = r.pick(PIF), v = {};
    for (const k of Object.keys(f[4])) v[k] = exact && k === 'r' ? r.pick([7, 14, 21]) : r.int(f[4][k][0], f[4][k][1]);
    const p = exact ? 22 / 7 : 3.142, val = f[3](v, p);
    if (exact) need(Math.abs(val - Math.round(val)) < 1e-9 || Math.abs(val * 10 - Math.round(val * 10)) < 1e-9);
    const pi = exact ? '\\pi = \\dfrac{22}{7}' : '\\pi = 3.142';
    const lo = fill(f[0], v), lm = fill(f[1], v);
    return { q: T(`Use the formula $${f[2]}$ with $${pi}$ to calculate ${lo}${exact ? '' : '. Give your answer correct to 1 decimal place'}.`, `Gunakan rumus $${f[2]}$ dengan $${pi}$ untuk mengira ${lm}${exact ? '' : '. Berikan jawapan betul kepada 1 tempat perpuluhan'}.`), a: T(`$${exact ? n(round(val, 2)) : fx(val, 1)}$ ${f[5]}`), w: W(`$${f[2]}$`, `$${f[6](v, exact ? '\\dfrac{22}{7}' : '3.142')}$`, exact ? `$= ${n(round(val, 2))}$ ${f[5]}` : T(`$= ${n(round(val, 4))} \\approx ${fx(val, 1)}$ ${f[5]} (1 d.p.)`, `$= ${n(round(val, 4))} \\approx ${fx(val, 1)}$ ${f[5]} (1 t.p.)`)), sp: 's' };
  };
  const fx = SPM.fx;
  const signErr = (r) => {
    const I = frF(r, GM, 1), nv = I.vs.filter((v) => I.V[v] < 0);
    need(nv.length >= 1);
    const W = Object.assign({}, I.V); for (const v of nv) W[v] = Math.abs(W[v]);
    const wz = texEval(I.R, W);
    need(Number.isFinite(wz) && Math.abs(wz - I.z) > 1e-9);
    return { q: T(`${r.name()} substituted ${vt2(I)} into ${EQ(I)} and obtained $${I.L} = ${n(round(wz, 2))}$. Find the mistake and give the correct value of $${I.L}$.`, `${r.name()} menggantikan ${vt2(I)} ke dalam ${EQ(I)} dan mendapat $${I.L} = ${n(round(wz, 2))}$. Cari kesilapannya dan berikan nilai $${I.L}$ yang betul.`), a: T(`The negative sign was ignored when substituting. Correct: $${I.L} = ${n(I.z)}$.`, `Tanda negatif diabaikan semasa penggantian. Betul: $${I.L} = ${n(I.z)}$.`), w: SPM.lines(T(`Substituting with the signs kept: $${I.L} = ${subTex(I.R, I.V)} = ${n(I.z)}$.`, `Menggantikan dengan tanda dikekalkan: $${I.L} = ${subTex(I.R, I.V)} = ${n(I.z)}$.`), T(`Dropping the minus sign gives $${subTex(I.R, W)} = ${n(round(wz, 2))}$, which is the wrong value.`, `Menggugurkan tanda tolak memberi $${subTex(I.R, W)} = ${n(round(wz, 2))}$, iaitu nilai yang salah.`)), sp: 'm' };
  };
  const chains = [
    (r) => { const C = r.int(2, 9) * 5, F = (C * 9) / 5 + 32; return { q: T(`A liquid has a temperature of ${F}°F. Use $F = \\dfrac{9}{5}C + 32$ to find its temperature $C$ in °C, and then use $K = C + 273$ to find its temperature in kelvin.`, `Suhu suatu cecair ialah ${F}°F. Gunakan $F = \\dfrac{9}{5}C + 32$ untuk mencari suhunya $C$ dalam °C, kemudian gunakan $K = C + 273$ untuk mencari suhunya dalam kelvin.`), a: T(`$C = ${C}$; $K = ${C + 273}$`), w: W(`$\\dfrac{9}{5}C + 32 = ${F}$`, `$\\dfrac{9}{5}C = ${F - 32}$`, `$C = ${F - 32} \\times \\dfrac{5}{9} = ${C}$`, `$K = ${C} + 273 = ${C + 273}$`), sp: 'm' }; },
    (r) => { const P_ = r.int(2, 9) * 500, R = r.pick([2, 3, 4, 5, 6]), t = r.int(2, 6), I = (P_ * R * t) / 100; return { q: T(`The simple interest is $I = \\dfrac{PRT}{100}$ and the total amount is $A = P + I$. Find $A$ (in RM) when $P = ${P_}$, $R = ${R}$ and $T = ${t}$.`, `Faedah mudah ialah $I = \\dfrac{PRT}{100}$ dan jumlah amaun ialah $A = P + I$. Cari $A$ (dalam RM) apabila $P = ${P_}$, $R = ${R}$ dan $T = ${t}$.`), a: T(`$I = ${I}$; $A = ${P_ + I}$`), w: W(`$I = \\dfrac{${P_} \\times ${R} \\times ${t}}{100} = ${I}$`, `$A = ${P_} + ${I} = ${P_ + I}$`), sp: 'm' }; },
    (r) => { const v = r.int(4, 9) * 10, t = r.int(2, 5), v2 = r.pick([50, 60, 80, 100].filter((x) => (v * t) % x === 0)); need(v2 !== undefined && v2 !== v); return { q: T(`Ali drives at ${v} km/h for ${t} hours, using $s = vt$. He then covers the same distance on a return trip at ${v2} km/h. Use $t = \\dfrac{s}{v}$ to find the time taken on the return trip.`, `Ali memandu pada ${v} km/j selama ${t} jam, menggunakan $s = vt$. Kemudian dia menempuh jarak yang sama dalam perjalanan pulang pada ${v2} km/j. Gunakan $t = \\dfrac{s}{v}$ untuk mencari masa yang diambil bagi perjalanan pulang.`), a: T(`$s = ${v * t}$ km; $t = ${n((v * t) / v2)}$ hours`, `$s = ${v * t}$ km; $t = ${n((v * t) / v2)}$ jam`), w: W(`$s = ${v} \\times ${t} = ${v * t}$`, `$t = \\dfrac{${v * t}}{${v2}} = ${n((v * t) / v2)}$`), sp: 'm' }; },
  ];
  const constK = (r) => {
    const k = r.int(2, 6), c = r.int(1, 9), x1 = r.int(2, 6), x2 = x1 + r.int(2, 6), f = r.int(0, 2);
    const forms = [
      [`y = kx + ${c}`, k * x1 + c, (x) => k * x + c, `y = ${k}x + ${c}`, [`${k * x1 + c} = k(${x1}) + ${c}`, `k(${x1}) = ${k * x1}`, `k = ${k}`, `y = ${k}(${x2}) + ${c} = ${k * x2 + c}`]],
      [`y = kx - ${c}`, k * x1 - c, (x) => k * x - c, `y = ${k}x - ${c}`, [`${k * x1 - c} = k(${x1}) - ${c}`, `k(${x1}) = ${k * x1}`, `k = ${k}`, `y = ${k}(${x2}) - ${c} = ${k * x2 - c}`]],
      [`y = kx^2 + ${c}`, k * x1 * x1 + c, (x) => k * x * x + c, `y = ${k}x^2 + ${c}`, [`${k * x1 * x1 + c} = k(${x1})^2 + ${c}`, `k(${x1 * x1}) = ${k * x1 * x1}`, `k = ${k}`, `y = ${k}(${x2})^2 + ${c} = ${k * x2 * x2 + c}`]]];
    const F = forms[f];
    return { q: T(`In the formula $${F[0]}$, $y = ${F[1]}$ when $x = ${x1}$. Find the value of $k$, and hence find $y$ when $x = ${x2}$.`, `Dalam rumus $${F[0]}$, $y = ${F[1]}$ apabila $x = ${x1}$. Cari nilai $k$, dan seterusnya cari $y$ apabila $x = ${x2}$.`), a: T(`$k = ${k}$; $${F[3]}$; $y = ${F[2](x2)}$`), w: W(...F[4].map((t) => `$${t}$`)), sp: 'm' };
  };
  const tabK = (r) => {
    const k = r.int(2, 5), c = r.int(1, 9), xs = r.pick([[1, 2, 3, 4], [2, 4, 6, 8], [0, 1, 2, 3], [3, 6, 9, 12]]), ys = xs.map((x) => k * x + c);
    const h = r.int(1, 3), x1 = xs[h];
    const hy = ys.map((y, i) => (i === h ? y : i === (h + 1) % 4 ? '?' : i === (h + 2) % 4 ? '?' : y));
    const idx = [0, 1, 2, 3].filter((i) => hy[i] === '?');
    return { q: T(`The values in the table follow $y = kx + ${c}$, where $k$ is a constant.<br>${SPM.table([['$x$'].concat(xs.map(String)), ['$y$'].concat(hy.map(String))], { rowHead: true })}Find $k$ and the missing values of $y$.`, `Nilai dalam jadual mengikut $y = kx + ${c}$, dengan $k$ ialah pemalar.<br>${SPM.table([['$x$'].concat(xs.map(String)), ['$y$'].concat(hy.map(String))], { rowHead: true })}Cari $k$ dan nilai $y$ yang tidak diberikan.`), a: T(`$k = ${k}$; missing $y$: ${idx.map((i) => ys[i]).join(', ')}`, `$k = ${k}$; $y$ yang tidak diberikan: ${idx.map((i) => ys[i]).join(', ')}`), w: W(T(`Use a column that is given: $x = ${x1}$, $y = ${ys[h]}$.`, `Gunakan lajur yang diberi: $x = ${x1}$, $y = ${ys[h]}$.`), `$${ys[h]} = k(${x1}) + ${c}$`, `$k(${x1}) = ${ys[h] - c}$, $k = ${k}$`, ...idx.map((i) => `$x = ${xs[i]}$: $y = ${k}(${xs[i]}) + ${c} = ${ys[i]}$`)), sp: 'm' };
  };
  const e33 = [
    fwdQ(GE, 0), fwdQ(GE, 1), fwdQ(GE, 2), fwdCtx(FLe), shQ, ctxLin(0), ctxLin(1), ctxLin(3), ctxLin(4), tabF(TFe, XSe, 0), tabF(TFe, XSe, 1), effQ(0, 0), effMcq(0), revQ(GE),
  ];
  const m33 = [
    fwdQ(GM, 0, 1), fwdQ(GM, 1, 1), fwdQ(GM, 2, 0, 1), fwdCtx(FLm), fwdCtx(FLm, 1), revQ(GM, 1), revQ(FLm), piQ(0), piQ(1), ctxLin(2), ctxLin(5), tabF(TFm, XSm, 0), tabF(TFm, XSe, 0), effQ(1, 0), effMcq(1), signErr,
  ];
  const a33 = [
    fwdQ(GA, 0, 1), fwdQ(GA, 1, 0, 1), revQ(GA, 1), revQ(FLa), fwdCtx(FLa), effQ(1, 1), effQ(0, 1), constK, tabK, ...chains,
  ];
  SPM.extend('F2-3.3', { e: e33, m: m33, a: a33 });

  /* ===== 3.4 Problems involving formulae: scenario models ===== */
  // sc(lead, relation-in-words, eq, numeric constants, variables) ; a variable = [letter, en, ms, lo, hi, step] (no range = computed subject of the formula)
  const sc = (lead, rel, eq, nums, vars) => ({ lead, rel, eq, nums, vars });
  const SCN = [
    sc(['A school hires a bus for an outing.', 'Sebuah sekolah menyewa bas untuk satu lawatan.'], ['The hire charge is RM{p} plus RM{q} for each student.', 'Bayaran sewa ialah RM{p} ditambah RM{q} bagi setiap pelajar.'], 'C = {p} + {q}n', { p: [200, 400, 50], q: [6, 15, 1] }, [['C', 'the total cost (in RM)', 'jumlah kos (dalam RM)'], ['n', 'the number of students', 'bilangan pelajar', 20, 45, 1]]),
    sc(['A coach travels along the North-South Expressway.', 'Sebuah bas ekspres bergerak di Lebuhraya Utara-Selatan.'], ['The distance travelled is the average speed multiplied by the time taken.', 'Jarak yang dilalui ialah laju purata didarab dengan masa yang diambil.'], 'd = vt', {}, [['d', 'the distance (in km)', 'jarak (dalam km)'], ['v', 'the average speed (in km/h)', 'laju purata (dalam km/j)', 60, 110, 10], ['t', 'the time taken (in hours)', 'masa yang diambil (dalam jam)', 1.5, 6, 0.5]]),
    sc(['Encik Kumar drives a car.', 'Encik Kumar memandu sebuah kereta.'], ['The car travels {p} km on each litre of petrol.', 'Kereta itu bergerak sejauh {p} km bagi setiap liter petrol.'], 'd = {p}f', { p: [8, 15, 1] }, [['d', 'the distance travelled (in km)', 'jarak yang dilalui (dalam km)'], ['f', 'the petrol used (in litres)', 'petrol yang digunakan (dalam liter)', 5, 40, 1]]),
    sc(['A shop gives a discount on all its goods.', 'Sebuah kedai memberi diskaun ke atas semua barangannya.'], ['After the discount, the selling price is {c} times the marked price.', 'Selepas diskaun, harga jualan ialah {c} kali harga tanda.'], 'S = {c}p', { c: { l: [0.9, 0.8, 0.75, 0.7, 0.6, 0.5] } }, [['S', 'the selling price (in RM)', 'harga jualan (dalam RM)'], ['p', 'the marked price (in RM)', 'harga tanda (dalam RM)', 20, 300, 10]]),
    sc(['Nurul sat for three tests.', 'Nurul menduduki tiga ujian.'], ['The mean mark is the total of the three marks divided by 3.', 'Markah min ialah jumlah tiga markah itu dibahagi dengan 3.'], 'M = \\dfrac{a + b + c}{3}', {}, [['M', 'the mean mark', 'markah min'], ['a', 'the mark in the first test', 'markah dalam ujian pertama', 40, 95, 1], ['b', 'the mark in the second test', 'markah dalam ujian kedua', 40, 95, 1], ['c', 'the mark in the third test', 'markah dalam ujian ketiga', 40, 95, 1]]),
    sc(['A rectangular field is being fenced.', 'Sebuah padang segi empat tepat sedang dipagar.'], ['The perimeter is twice the sum of the length and the width.', 'Perimeter ialah dua kali hasil tambah panjang dan lebar.'], 'P = 2(l + w)', {}, [['P', 'the perimeter (in m)', 'perimeter (dalam m)'], ['l', 'the length (in m)', 'panjang (dalam m)', 10, 40, 1], ['w', 'the width (in m)', 'lebar (dalam m)', 5, 25, 1]]),
    sc(['A garden plot is in the shape of a trapezium.', 'Sebidang tanah taman berbentuk trapezium.'], ['The area is half of the sum of the two parallel sides multiplied by the height.', 'Luas ialah separuh daripada hasil tambah dua sisi selari didarab dengan tinggi.'], 'A = \\dfrac{1}{2}(a + b)h', {}, [['A', 'the area (in m$^2$)', 'luas (dalam m$^2$)'], ['a', 'the length of one parallel side (in m)', 'panjang satu sisi selari (dalam m)', 4, 14, 1], ['b', 'the length of the other parallel side (in m)', 'panjang sisi selari yang satu lagi (dalam m)', 4, 14, 1], ['h', 'the height (in m)', 'tinggi (dalam m)', 2, 10, 1]]),
    sc(['A fish tank is in the shape of a cuboid.', 'Sebuah akuarium berbentuk kuboid.'], ['The volume is the length multiplied by the width multiplied by the height.', 'Isi padu ialah panjang didarab lebar didarab tinggi.'], 'V = lwh', {}, [['V', 'the volume (in cm$^3$)', 'isi padu (dalam cm$^3$)'], ['l', 'the length (in cm)', 'panjang (dalam cm)', 20, 60, 10], ['w', 'the width (in cm)', 'lebar (dalam cm)', 20, 40, 10], ['h', 'the height (in cm)', 'tinggi (dalam cm)', 20, 50, 10]]),
    sc(['A circular pond has a fence around it.', 'Sebuah kolam bulat mempunyai pagar mengelilinginya.'], ['The length of the fence is twice pi multiplied by the radius (use $\\pi = \\dfrac{22}{7}$).', 'Panjang pagar ialah dua kali pi didarab dengan jejari (gunakan $\\pi = \\dfrac{22}{7}$).'], 'C = 2\\pi r', {}, [['C', 'the length of the fence (in m)', 'panjang pagar (dalam m)'], ['r', 'the radius of the pond (in m)', 'jejari kolam (dalam m)', { l: [7, 14, 21, 28, 35] }]]),
    sc(['A weather report gives the temperature in degrees Celsius.', 'Laporan cuaca memberi suhu dalam darjah Celsius.'], ['To change to degrees Fahrenheit, multiply the Celsius temperature by 9/5 and add 32.', 'Untuk menukar kepada darjah Fahrenheit, darabkan suhu Celsius dengan 9/5 dan tambah 32.'], 'F = \\dfrac{9}{5}C + 32', {}, [['F', 'the temperature in degrees Fahrenheit', 'suhu dalam darjah Fahrenheit'], ['C', 'the temperature in degrees Celsius', 'suhu dalam darjah Celsius', 0, 40, 5]]),
    sc(['Aminah puts money in a savings account.', 'Aminah menyimpan wang dalam akaun simpanan.'], ['The simple interest is the principal multiplied by the rate and the number of years, divided by 100.', 'Faedah mudah ialah prinsipal didarab dengan kadar dan bilangan tahun, dibahagi dengan 100.'], 'I = \\dfrac{PRT}{100}', {}, [['I', 'the interest (in RM)', 'faedah (dalam RM)'], ['P', 'the principal (in RM)', 'prinsipal (dalam RM)', 1000, 8000, 500], ['R', 'the interest rate (% per year)', 'kadar faedah (% setahun)', 2, 6, 1], ['T', 'the time (in years)', 'tempoh (dalam tahun)', 1, 5, 1]]),
    sc(['A traveller changes dollars into ringgit.', 'Seorang pelancong menukar dolar kepada ringgit.'], ['One dollar is worth RM{q}.', 'Satu dolar bernilai RM{q}.'], 'R = {q}u', { q: { l: [4.2, 4.4, 4.5, 4.6, 4.8] } }, [['R', 'the amount in ringgit (in RM)', 'jumlah dalam ringgit (dalam RM)'], ['u', 'the amount in dollars', 'jumlah dalam dolar', 10, 100, 10]]),
    sc(['In a football league, teams earn points for wins and draws.', 'Dalam satu liga bola sepak, pasukan mendapat mata bagi kemenangan dan seri.'], ['A win gives 3 points and a draw gives 1 point.', 'Satu kemenangan memberi 3 mata dan satu keputusan seri memberi 1 mata.'], 'P = 3w + d', {}, [['P', 'the total points', 'jumlah mata'], ['w', 'the number of wins', 'bilangan kemenangan', 3, 12, 1], ['d', 'the number of draws', 'bilangan keputusan seri', 1, 8, 1]]),
    sc(['A cinema sells adult and child tickets.', 'Sebuah panggung wayang menjual tiket dewasa dan tiket kanak-kanak.'], ['An adult ticket costs RM{p} and a child ticket costs RM{q}.', 'Tiket dewasa berharga RM{p} dan tiket kanak-kanak berharga RM{q}.'], 'T = {p}a + {q}c', { p: [12, 18, 1], q: [6, 10, 1] }, [['T', 'the total cost (in RM)', 'jumlah kos (dalam RM)'], ['a', 'the number of adult tickets', 'bilangan tiket dewasa', 2, 6, 1], ['c', 'the number of child tickets', 'bilangan tiket kanak-kanak', 2, 8, 1]]),
    sc(['A prize is shared equally among some students.', 'Satu hadiah dikongsi sama banyak antara beberapa orang pelajar.'], ['Each student gets the total prize divided by the number of students.', 'Setiap pelajar mendapat jumlah hadiah dibahagi dengan bilangan pelajar.'], 's = \\dfrac{T}{n}', {}, [['s', 'the amount each student gets (in RM)', 'jumlah yang diterima setiap pelajar (dalam RM)'], ['T', 'the total prize (in RM)', 'jumlah hadiah (dalam RM)', 120, 600, 20], ['n', 'the number of students', 'bilangan pelajar', 2, 12, 1]]),
    sc(['A factory worker is paid by the hour.', 'Seorang pekerja kilang dibayar mengikut jam.'], ['Normal hours are paid at RM{p} per hour and overtime hours at RM{q} per hour.', 'Jam biasa dibayar RM{p} sejam dan jam kerja lebih masa dibayar RM{q} sejam.'], 'W = {p}h + {q}x', { p: [8, 14, 1], q: [12, 20, 1] }, [['W', 'the total wages (in RM)', 'jumlah upah (dalam RM)'], ['h', 'the number of normal hours', 'bilangan jam biasa', 100, 160, 10], ['x', 'the number of overtime hours', 'bilangan jam lebih masa', 4, 20, 1]]),
    sc(['A room is to be painted.', 'Sebuah bilik hendak dicat.'], ['The area of the four walls is twice the height multiplied by the sum of the length and the width.', 'Luas empat dinding ialah dua kali tinggi didarab dengan hasil tambah panjang dan lebar.'], 'A = 2h(l + w)', {}, [['A', 'the area of the walls (in m$^2$)', 'luas dinding (dalam m$^2$)'], ['l', 'the length of the room (in m)', 'panjang bilik (dalam m)', 3, 8, 1], ['w', 'the width of the room (in m)', 'lebar bilik (dalam m)', 3, 6, 1], ['h', 'the height of the room (in m)', 'tinggi bilik (dalam m)', 3, 4, 1]]),
    sc(['A runner\'s speed is measured in kilometres per hour.', 'Laju seorang pelari diukur dalam kilometer sejam.'], ['To change a speed from km/h to m/s, multiply by 5 and divide by 18.', 'Untuk menukar laju daripada km/j kepada m/s, darabkan dengan 5 dan bahagi dengan 18.'], 'v = \\dfrac{5u}{18}', {}, [['v', 'the speed in m/s', 'laju dalam m/s'], ['u', 'the speed in km/h', 'laju dalam km/j', { l: [18, 36, 54, 72, 90, 108, 126] }]]),
    sc(['A farmer fences a rectangular pen against a wall.', 'Seorang petani memagar sebuah reban segi empat tepat di tepi dinding.'], ['Fencing is needed for the two lengths and one width, and costs RM{p} per metre.', 'Pagar diperlukan bagi dua panjang dan satu lebar, dan berharga RM{p} semeter.'], 'C = {p}(2l + w)', { p: [8, 20, 1] }, [['C', 'the cost of fencing (in RM)', 'kos pagar (dalam RM)'], ['l', 'the length (in m)', 'panjang (dalam m)', 5, 15, 1], ['w', 'the width (in m)', 'lebar (dalam m)', 4, 12, 1]]),
    sc(['A water tank is being emptied.', 'Sebuah tangki air sedang dikosongkan.'], ['The tank holds {p} litres at first and loses {q} litres every minute.', 'Pada mulanya tangki mengandungi {p} liter dan kehilangan {q} liter setiap minit.'], 'V = {p} - {q}t', { p: [400, 900, 100], q: [10, 30, 5] }, [['V', 'the water left (in litres)', 'air yang tinggal (dalam liter)'], ['t', 'the time (in minutes)', 'masa (dalam minit)', 2, 20, 1]]),
  ];
  const IRR = [['The event is held on a Saturday.', 'Acara itu diadakan pada hari Sabtu.'], ['Farid has been doing this for 3 years.', 'Farid telah melakukannya selama 3 tahun.'], ['The weather was sunny that day.', 'Cuaca cerah pada hari itu.'], ['There are 24 students in the class.', 'Terdapat 24 orang murid dalam kelas itu.']];
  function setup(r, S, o) {
    o = o || {};
    const O = {};
    for (const [k, v] of Object.entries(S.nums)) O[k] = v.l ? r.pick(v.l) : r.step(v[0], v[1], v[2]);
    const eq = fill(S.eq, O), parts = eq.split(' = '), spec = S.vars.map((v) => ({ s: v[0], en: v[1], ms: v[2], rg: v.length > 3 ? v.slice(3) : null }));
    for (let t = 0; t < 40; t++) {
      const V = {};
      for (const v of spec) if (v.rg) V[v.s] = v.rg[0] && v.rg[0].l ? r.pick(v.rg[0].l) : r.step(v.rg[0], v.rg[1], v.rg[2]);
      let z;
      try { z = texEval(parts[1], V); } catch (e) { continue; }
      if (!Number.isFinite(z) || z <= 0 || Math.abs(z * 100 - Math.round(z * 100)) > 1e-6) continue;
      if (!Object.values(O).some((x) => x % 1) && !spec.some((v) => v.rg && v.rg[2] % 1) && Math.abs(z - Math.round(z)) > 1e-9) continue;
      V[spec[0].s] = Math.round(z * 100) / 100;
      return { S, O, eq, R: parts[1], spec, V, L: spec[0], ins: spec.slice(1), rel: tf(S.rel[0], S.rel[1], O), lead: T(S.lead[0], S.lead[1]) };
    }
    throw SPM.REJECT;
  }
  const wh = (I) => T(', where ' + I.spec.map((v) => `$${v.s}$ is ${v.en}`).join(', ').replace(/, ([^,]*)$/, ' and $1'), ', dengan ' + I.spec.map((v) => `$${v.s}$ ialah ${v.ms}`).join(', ').replace(/, ([^,]*)$/, ' dan $1'));
  const gv = (v, val) => T(`$${v.s} = ${n(val)}$`);
  const gl = (I, vs, V) => Q(...vs.flatMap((v, i) => (i ? [', ', gv(v, (V || I.V)[v.s])] : [gv(v, (V || I.V)[v.s])])));
  const less = (V, k) => { const o = Object.assign({}, V); delete o[k]; return o; };
  const fx2 = (I, k) => (k === 'L' ? I.L : I.ins[k]);
  const dir34 = (irr) => (r) => {
    const I = setup(r, r.pick(SCN)), ir = r.pick(IRR);
    return { q: Q(I.lead, irr ? T(` ${ir[0]}`, ` ${ir[1]}`) : '', T(` The formula is $${I.eq}$`, ` Rumusnya ialah $${I.eq}$`), wh(I), T(`. Find the value of $${I.L.s}$ when `, `. Cari nilai $${I.L.s}$ apabila `), gl(I, I.ins), irr ? T(' (ignore any information that is not needed).', ' (abaikan sebarang maklumat yang tidak diperlukan).') : '.'), a: T(`$${I.L.s} = ${n(I.V[I.L.s])}$`), w: W(`$${I.L.s} = ${subTex(I.R, I.V)}$`, `$${I.L.s} = ${n(I.V[I.L.s])}$`), sp: 's' };
  };
  const form34 = (ev) => (r) => {
    const I = setup(r, r.pick(SCN)), tail = ev ? T(` Then find $${I.L.s}$ when `, ` Kemudian cari $${I.L.s}$ apabila `) : '';
    return { q: Q(I.lead, ' ', I.rel, T(` Write a formula for $${I.L.s}$ in terms of the other letters`, ` Tulis satu rumus bagi $${I.L.s}$ dalam sebutan huruf-huruf yang lain`), wh(I), '.', tail, ev ? Q(gl(I, I.ins), '.') : ''), a: T(`$${I.eq}$${ev ? `; $${I.L.s} = ${n(I.V[I.L.s])}$` : ''}`), w: W(T('Write each quantity as a letter and put the relation into symbols.', 'Tulis setiap kuantiti sebagai huruf dan ubah hubungan itu kepada simbol.'), `$${I.eq}$`, ...(ev ? [`$${I.L.s} = ${subTex(I.R, I.V)} = ${n(I.V[I.L.s])}$`] : [])), sp: ev ? 'm' : 's' };
  };
  const rev34 = (viaRel) => (r) => {
    const I = setup(r, r.pick(SCN)), k = r.int(0, I.ins.length - 1), t = I.ins[k], rest = I.ins.filter((_, i) => i !== k);
    const given = Q(gv(I.L, I.V[I.L.s]), rest.length ? ', ' : '', gl(I, rest));
    return { q: Q(I.lead, ' ', viaRel ? Q(I.rel, T(` Form a formula for $${I.L.s}$`, ` Bentukkan satu rumus bagi $${I.L.s}$`), wh(I), T(', and use it to find $', ', dan gunakannya untuk mencari $')) : Q(T(`The formula is $${I.eq}$`, `Rumusnya ialah $${I.eq}$`), wh(I), T('. Find $', '. Cari $')), `${t.s}$`, T(` when `, ` apabila `), given, '.'), a: T(viaRel ? `$${I.eq}$; $${t.s} = ${n(I.V[t.s])}$` : `$${t.s} = ${n(I.V[t.s])}$`), w: W(...(viaRel ? [`$${I.eq}$`] : []), T('Substitute the values that are known, then solve for the unknown letter.', 'Gantikan nilai yang diketahui, kemudian selesaikan untuk huruf yang tidak diketahui.'), `$${n(I.V[I.L.s])} = ${subTex(I.R, less(I.V, t.s))}$`, `$${t.s} = ${n(I.V[t.s])}$`), sp: 'm' };
  };
  const tab34 = (r) => {
    const I = setup(r, r.pick(SCN)), k = r.int(0, I.ins.length - 1), t = I.ins[k], rest = I.ins.filter((_, i) => i !== k);
    need(t.rg && !t.rg[0].l && t.rg[2] >= 1);
    const xs = [0, 1, 2, 3].map((i) => I.V[t.s] + (i - 1) * t.rg[2]);
    need(xs.every((x) => x >= t.rg[0] - 2 * t.rg[2]));
    const ys = xs.map((x) => texEval(I.R, Object.assign({}, I.V, { [t.s]: x })));
    need(ys.every((y) => Number.isFinite(y) && y > 0 && Math.abs(y * 100 - Math.round(y * 100)) < 1e-6));
    const h = r.int(0, 3), hy = ys.map((y, i) => (i === h ? '?' : n(y)));
    const tb = SPM.table([[`$${t.s}$`].concat(xs.map(n)), [`$${I.L.s}$`].concat(hy)], { rowHead: true });
    return { q: Q(I.lead, T(` Using $${I.eq}$`, ` Menggunakan $${I.eq}$`), wh(I), T(', the table shows values of ', ', jadual menunjukkan nilai '), `$${I.L.s}$`, T(` for four values of $${t.s}$`, ` bagi empat nilai $${t.s}$`), rest.length ? Q(T(' when ', ' apabila '), gl(I, rest)) : '', '.<br>', tb, T(`Find the missing value.`, `Cari nilai yang tidak diberikan.`)), a: T(`$${I.L.s} = ${n(ys[h])}$`), w: W(`$${t.s} = ${n(xs[h])}$`, `$${I.L.s} = ${subTex(I.R, Object.assign({}, I.V, { [t.s]: xs[h] }))} = ${n(ys[h])}$`), sp: 'm' };
  };
  const cmp34 = (r) => {
    const I = setup(r, r.pick(SCN)), V2 = {};
    for (const v of I.ins) V2[v.s] = v.rg[0] && v.rg[0].l ? r.pick(v.rg[0].l) : r.step(v.rg[0], v.rg[1], v.rg[2]);
    let z2;
    try { z2 = texEval(I.R, V2); } catch (e) { need(false); }
    need(Number.isFinite(z2) && z2 > 0 && Math.abs(z2 * 100 - Math.round(z2 * 100)) < 1e-6 && Math.abs(z2 - I.V[I.L.s]) > 1e-9);
    const [n1, n2] = r.pair(), z1 = I.V[I.L.s];
    return { q: Q(I.lead, T(` The formula is $${I.eq}$`, ` Rumusnya ialah $${I.eq}$`), wh(I), T(`. ${n1} uses `, `. ${n1} menggunakan `), gl(I, I.ins), T(` and ${n2} uses `, ` dan ${n2} menggunakan `), gl(I, I.ins, V2), T(`. Whose value of $${I.L.s}$ is greater, and by how much?`, `. Nilai $${I.L.s}$ siapakah yang lebih besar, dan berapakah bezanya?`)), a: T(`${n1}: ${n(z1)}; ${n2}: ${n(round(z2, 2))}. ${z2 > z1 ? n2 : n1} has the greater value, by ${n(round(Math.abs(z2 - z1), 2))}.`, `${n1}: ${n(z1)}; ${n2}: ${n(round(z2, 2))}. ${z2 > z1 ? n2 : n1} mempunyai nilai yang lebih besar, sebanyak ${n(round(Math.abs(z2 - z1), 2))}.`), w: W(T(`${n1}: $${I.L.s} = ${subTex(I.R, I.V)} = ${n(z1)}$`, `${n1}: $${I.L.s} = ${subTex(I.R, I.V)} = ${n(z1)}$`), T(`${n2}: $${I.L.s} = ${subTex(I.R, V2)} = ${n(round(z2, 2))}$`, `${n2}: $${I.L.s} = ${subTex(I.R, V2)} = ${n(round(z2, 2))}$`), `$${n(round(Math.max(z1, z2), 2))} - ${n(round(Math.min(z1, z2), 2))} = ${n(round(Math.abs(z2 - z1), 2))}$`), sp: 'm' };
  };
  const multi34 = (r) => {
    const I = setup(r, r.pick(SCN)), k = r.int(0, I.ins.length - 1), t = I.ins[k], rest = I.ins.filter((_, i) => i !== k), d = r.int(1, 3);
    need(t.rg && !t.rg[0].l);
    const st = t.rg[2], W = Object.assign({}, I.V, { [t.s]: I.V[t.s] + d * st }), z3 = texEval(I.R, W);
    need(Number.isFinite(z3) && Math.abs(z3 * 100 - Math.round(z3 * 100)) < 1e-6);
    const ch = round(z3 - I.V[I.L.s], 2);
    return { q: Q(I.lead, ' ', I.rel, T(` (a) Form a formula for $${I.L.s}$`, ` (a) Bentukkan satu rumus bagi $${I.L.s}$`), wh(I), T(`. (b) Find $${I.L.s}$ when `, `. (b) Cari $${I.L.s}$ apabila `), gl(I, I.ins), T(`. (c) If $${I.L.s} = ${n(I.V[I.L.s])}$`, `. (c) Jika $${I.L.s} = ${n(I.V[I.L.s])}$`), rest.length ? Q(T(' and ', ' dan '), gl(I, rest)) : '', T(', find $', ', cari $'), `${t.s}$. `, T(`(d) Find how $${I.L.s}$ changes if $${t.s}$ increases by ${n(d * st)} in part (b).`, `(d) Cari bagaimana $${I.L.s}$ berubah jika $${t.s}$ bertambah ${n(d * st)} dalam bahagian (b).`)), a: T(`(a) $${I.eq}$ (b) $${n(I.V[I.L.s])}$ (c) $${n(I.V[t.s])}$ (d) ${ch >= 0 ? 'increases' : 'decreases'} by ${n(Math.abs(ch))}`, `(a) $${I.eq}$ (b) $${n(I.V[I.L.s])}$ (c) $${n(I.V[t.s])}$ (d) ${ch >= 0 ? 'bertambah' : 'berkurang'} sebanyak ${n(Math.abs(ch))}`), w: SPM.lines(`(a) $${I.eq}$`, `(b) $${I.L.s} = ${subTex(I.R, I.V)} = ${n(I.V[I.L.s])}$`, `(c) $${n(I.V[I.L.s])} = ${subTex(I.R, less(I.V, t.s))}$, $${t.s} = ${n(I.V[t.s])}$`, `(d) $${t.s} = ${n(I.V[t.s] + d * st)}$: $${I.L.s} = ${subTex(I.R, W)} = ${n(round(z3, 2))}$`, T(`$${n(round(z3, 2))} - ${n(I.V[I.L.s])} = ${n(ch)}$, so $${I.L.s}$ ${ch >= 0 ? 'increases' : 'decreases'} by ${n(Math.abs(ch))}.`, `$${n(round(z3, 2))} - ${n(I.V[I.L.s])} = ${n(ch)}$, jadi $${I.L.s}$ ${ch >= 0 ? 'bertambah' : 'berkurang'} sebanyak ${n(Math.abs(ch))}.`)), sp: 'l' };
  };
  const budget34 = (r) => {
    const I = setup(r, r.pick(SCN)), k = r.int(0, I.ins.length - 1), t = I.ins[k], rest = I.ins.filter((_, i) => i !== k);
    need(t.rg && !t.rg[0].l && t.rg[2] === 1 && rest.every((v) => true));
    const f = (x) => texEval(I.R, Object.assign({}, I.V, { [t.s]: x }));
    need(f(t.rg[1]) > f(t.rg[0]) && I.V[t.s] > t.rg[0]);
    const bud = Math.round(f(I.V[t.s]) + (f(I.V[t.s] + 1) - f(I.V[t.s])) * r.pick([0.3, 0.5, 0.7]));
    need(bud >= f(I.V[t.s]) && bud < f(I.V[t.s] + 1));
    let best = I.V[t.s];
    for (let x = I.V[t.s]; x < 1000 && f(x) <= bud; x++) best = x;
    return { q: Q(I.lead, T(` The formula is $${I.eq}$`, ` Rumusnya ialah $${I.eq}$`), wh(I), rest.length ? Q(T('. Given ', '. Diberi '), gl(I, rest)) : '.', T(`${rest.length ? ', find' : ' Find'} the greatest whole number value of $${t.s}$ for which $${I.L.s}$ does not exceed ${bud}.`, `${rest.length ? ', cari' : ' Cari'} nilai $${t.s}$ (nombor bulat) yang terbesar supaya $${I.L.s}$ tidak melebihi ${bud}.`)), a: T(`$${t.s} = ${best}$ (it gives $${I.L.s} = ${n(round(f(best), 2))}$)`, `$${t.s} = ${best}$ (ia memberi $${I.L.s} = ${n(round(f(best), 2))}$)`), w: W(T(`Try whole-number values of $${t.s}$ until $${I.L.s}$ passes ${bud}.`, `Cuba nilai nombor bulat $${t.s}$ sehingga $${I.L.s}$ melebihi ${bud}.`), `$${t.s} = ${best}$: $${I.L.s} = ${subTex(I.R, Object.assign({}, I.V, { [t.s]: best }))} = ${n(round(f(best), 2))}$`, `$${t.s} = ${best + 1}$: $${I.L.s} = ${subTex(I.R, Object.assign({}, I.V, { [t.s]: best + 1 }))} = ${n(round(f(best + 1), 2))}$`, T(`The second value is more than ${bud}, so the greatest possible value is $${t.s} = ${best}$.`, `Nilai kedua melebihi ${bud}, jadi nilai terbesar yang mungkin ialah $${t.s} = ${best}$.`)), sp: 'm' };
  };
  const e34 = [dir34(0), form34(0), dir34(1), tab34];
  const m34 = [rev34(0), rev34(1), form34(1), cmp34, tab34, rev34(0), dir34(1)];
  const a34 = [multi34, budget34, rev34(1), cmp34, multi34, budget34, rev34(0)];
  SPM.extend('F2-3.4', { e: e34, m: m34, a: a34 });

  /* ===== 3.E Rational and root inversions (extension) ===== */
  const NQ = '{x} \\neq 0,\\ {y} \\neq 0';
  const GX1 = [
    FM('{y} = \\dfrac{{a}}{{x}}', { x: '\\dfrac{{a}}{{y}}' }, { x: ['\\dfrac{{y}}{{a}}', '{a}{y}', '{a} - {y}'] }, NQ),
    FM('{y} = \\dfrac{{k}}{{x}}', { x: '\\dfrac{{k}}{{y}}' }, { x: ['\\dfrac{{y}}{{k}}', '{k}{y}', '{k} - {y}'] }, NQ),
    FM('{y} = {x}^2', { x: '\\sqrt{{y}}' }, { x: ['\\dfrac{{y}}{2}', '{y}^2', '2{y}'] }, '{y} \\geq 0', 0, '{x} > 0', 1),
    FM('{y} = \\sqrt{{x}}', { x: '{y}^2' }, { x: ['\\sqrt{{y}}', '2{y}', '\\dfrac{{y}}{2}'] }, '{y} \\geq 0'),
    FM('{y} = \\dfrac{{a}}{{x} + {b}}', { x: '\\dfrac{{a}}{{y}} - {b}' }, { x: ['\\dfrac{{a} - {b}}{{y}}', '\\dfrac{{a}}{{y}} + {b}', '\\dfrac{{y}}{{a}} - {b}'] }, '{x} \\neq -{b},\\ {y} \\neq 0'),
    FM('{y} = {a}{x}^2', { x: '\\sqrt{\\dfrac{{y}}{{a}}}' }, { x: ['\\dfrac{\\sqrt{{y}}}{{a}}', '\\sqrt{{y}} - {a}', '\\sqrt{{a}{y}}'] }, '{y} \\geq 0', 0, '{x} > 0', 1),
    FM('{y} = {x}^2 + {a}', { x: '\\sqrt{{y} - {a}}' }, { x: ['\\sqrt{{y}} - {a}', '\\sqrt{{y}} + {a}', '{y} - {a}'] }, '{y} \\geq {a}', 0, '{x} > 0', 1),
    FM('{y} = \\sqrt{{x} + {a}}', { x: '{y}^2 - {a}' }, { x: ['{y}^2 + {a}', '({y} - {a})^2', '\\sqrt{{y}} - {a}'] }, '{y} \\geq 0'),
    FM('\\dfrac{{y}}{{x}} = \\dfrac{{a}}{{b}}', { x: '\\dfrac{{b}{y}}{{a}}' }, { x: ['\\dfrac{{a}{y}}{{b}}', '\\dfrac{{y}}{{a}{b}}', '\\dfrac{{a}}{{b}{y}}'] }, '{x} \\neq 0,\\ {a} \\neq 0'),
    FM('{y} = {k}{x}^2', { x: '\\sqrt{\\dfrac{{y}}{{k}}}' }, { x: ['\\dfrac{\\sqrt{{y}}}{{k}}', '\\sqrt{{y}} - {k}', '\\sqrt{{k}{y}}'] }, '{y} \\geq 0', 0, '{x} > 0', 1),
  ];
  const GX2 = [
    FM('{y} = \\dfrac{{a}}{{x}} + {b}', { x: '\\dfrac{{a}}{{y} - {b}}' }, { x: ['\\dfrac{{a}}{{y}} - {b}', '\\dfrac{{a} - {b}}{{y}}', '\\dfrac{{y} - {b}}{{a}}'] }, '{x} \\neq 0,\\ {y} \\neq {b}'),
    FM('{y} = \\dfrac{{a}}{{x} - {b}}', { x: '\\dfrac{{a}}{{y}} + {b}' }, { x: ['\\dfrac{{a}}{{y}} - {b}', '\\dfrac{{a} + {b}}{{y}}', '\\dfrac{{y}}{{a}} + {b}'] }, '{x} \\neq {b},\\ {y} \\neq 0'),
    FM('{y} = \\dfrac{{a}}{{b}{x}}', { x: '\\dfrac{{a}}{{b}{y}}', b: '\\dfrac{{a}}{{x}{y}}' }, { x: ['\\dfrac{{a}{y}}{{b}}', '\\dfrac{{b}{y}}{{a}}', '\\dfrac{{a}}{{b}} - {y}'] }, NQ),
    FM('{y} = \\dfrac{{a}}{{x}^2}', { x: '\\sqrt{\\dfrac{{a}}{{y}}}' }, { x: ['\\dfrac{\\sqrt{{a}}}{{y}}', '\\sqrt{{a}{y}}', '\\dfrac{{a}}{\\sqrt{{y}}}'] }, '{y} > 0', 0, '{x} > 0', 1),
    FM('{y} = {a}({x} + {b})^2', { x: '\\sqrt{\\dfrac{{y}}{{a}}} - {b}' }, { x: ['\\sqrt{\\dfrac{{y}}{{a}}} + {b}', '\\sqrt{\\dfrac{{y}}{{a}} - {b}}', '\\dfrac{\\sqrt{{y}}}{{a}} - {b}'] }, '{y} \\geq 0', 0, '{x} + {b} > 0'),
    FM('{y} = \\sqrt{{a}{x} + {b}}', { x: '\\dfrac{{y}^2 - {b}}{{a}}' }, { x: ['\\dfrac{{y} - {b}^2}{{a}}', '\\dfrac{{y}^2 + {b}}{{a}}', '{y}^2 - {b} - {a}'] }, '{y} \\geq 0'),
    FM('{y} = \\sqrt{\\dfrac{{x}}{{a}}}', { x: '{a}{y}^2' }, { x: ['{a}\\sqrt{{y}}', '\\dfrac{{y}^2}{{a}}', '\\dfrac{{y}}{{a}}'] }, '{y} \\geq 0'),
    FM('{y} = \\dfrac{{a}}{\\sqrt{{x}}}', { x: '\\dfrac{{a}^2}{{y}^2}' }, { x: ['\\dfrac{{a}}{{y}^2}', '\\dfrac{{a}^2}{{y}}', '\\left(\\dfrac{{y}}{{a}}\\right)^2'] }, '{x} > 0,\\ {y} > 0'),
    FM('{y}^2 = {x}^2 + {a}', { x: '\\sqrt{{y}^2 - {a}}' }, { x: ['\\sqrt{{y}^2} - {a}', '{y} - \\sqrt{{a}}', '\\sqrt{{y}^2 + {a}}'] }, '{y}^2 \\geq {a}', 0, '{x} > 0', 1),
    FM('\\dfrac{{a}}{{x}} = \\dfrac{{b}}{{y}}', { x: '\\dfrac{{a}{y}}{{b}}', y: '\\dfrac{{b}{x}}{{a}}' }, { x: ['\\dfrac{{b}{y}}{{a}}', '\\dfrac{{a}}{{b}{y}}', '\\dfrac{{a}{b}}{{y}}'] }, NQ),
  ];
  const GX3 = [
    FM('{y} = \\dfrac{{a}{x} + {b}}{{x} - {c}}', { x: '\\dfrac{{b} + {c}{y}}{{y} - {a}}' }, { x: ['\\dfrac{{b} - {c}{y}}{{y} - {a}}', '\\dfrac{{b} + {c}{y}}{{y} + {a}}', '\\dfrac{{b} + {c}}{{y} - {a}}'] }, '{x} \\neq {c},\\ {y} \\neq {a}'),
    FM('{y} = \\dfrac{{x} + {a}}{{x} - {b}}', { x: '\\dfrac{{a} + {b}{y}}{{y} - 1}' }, { x: ['\\dfrac{{a} - {b}{y}}{{y} - 1}', '\\dfrac{{a} + {b}{y}}{{y} + 1}', '\\dfrac{{a} + {b}}{{y} - 1}'] }, '{x} \\neq {b},\\ {y} \\neq 1'),
    FM('{y} = \\dfrac{{x}}{{x} + {a}}', { x: '\\dfrac{{a}{y}}{1 - {y}}' }, { x: ['\\dfrac{{a}{y}}{1 + {y}}', '\\dfrac{{a}}{1 - {y}}', '\\dfrac{{y}}{{a}(1 - {y})}'] }, '{x} \\neq -{a},\\ {y} \\neq 1'),
    FM('{y} = \\dfrac{{a}{x}}{{x} + {b}}', { x: '\\dfrac{{b}{y}}{{a} - {y}}' }, { x: ['\\dfrac{{b}{y}}{{a} + {y}}', '\\dfrac{{a}{y}}{{b} - {y}}', '\\dfrac{{b}{y}}{{a}} - {y}'] }, '{x} \\neq -{b},\\ {y} \\neq {a}'),
    FM('\\dfrac{{x} + {a}}{{x} - {b}} = \\dfrac{{c}}{{d}}', { x: '\\dfrac{{a}{d} + {b}{c}}{{c} - {d}}' }, { x: ['\\dfrac{{a}{d} - {b}{c}}{{c} - {d}}', '\\dfrac{{a}{d} + {b}{c}}{{c} + {d}}', '\\dfrac{{a}{c} + {b}{d}}{{c} - {d}}'] }, '{x} \\neq {b},\\ {c} \\neq {d}'),
    FM('\\dfrac{1}{{x}} + \\dfrac{1}{{a}} = \\dfrac{1}{{y}}', { x: '\\dfrac{{a}{y}}{{a} - {y}}' }, { x: ['{y} - {a}', '\\dfrac{{a}{y}}{{a} + {y}}', '\\dfrac{1}{{y}} - \\dfrac{1}{{a}}'] }, '{x} \\neq 0,\\ {a} \\neq {y}'),
    FM('{y} = \\dfrac{2{a}{x}}{{a} + {x}}', { x: '\\dfrac{{a}{y}}{2{a} - {y}}' }, { x: ['\\dfrac{{a}{y}}{2{a} + {y}}', '\\dfrac{{y}}{2{a} - {y}}', '\\dfrac{2{a}{y}}{{a} - {y}}'] }, '{x} \\neq -{a},\\ {y} \\neq 2{a}'),
    FM('{y} = \\sqrt{\\dfrac{{a}{x} + {b}}{{c}}}', { x: '\\dfrac{{c}{y}^2 - {b}}{{a}}' }, { x: ['\\dfrac{\\sqrt{{c}}{y} - {b}}{{a}}', '\\dfrac{{c}{y}^2 + {b}}{{a}}', '\\dfrac{{c}{y} - {b}}{{a}}'] }, '{y} \\geq 0'),
    FM('{y} = {a}\\sqrt{{x}} + {b}', { x: '\\left(\\dfrac{{y} - {b}}{{a}}\\right)^2' }, { x: ['\\dfrac{({y} - {b})^2}{{a}}', '\\left(\\dfrac{{y} + {b}}{{a}}\\right)^2', '\\dfrac{{y} - {b}}{{a}^2}'] }, '{y} \\geq {b}'),
    FM('{y} = \\sqrt{{x}^2 + {a}}', { x: '\\sqrt{{y}^2 - {a}}' }, { x: ['\\sqrt{{y}^2 + {a}}', '{y} - \\sqrt{{a}}', '\\sqrt{{y} - {a}}'] }, '{y}^2 \\geq {a}', 0, '{x} > 0', 1),
    FM('{y} = \\dfrac{{x}^2}{{a}} - {b}', { x: '\\sqrt{{a}({y} + {b})}' }, { x: ['\\sqrt{{a}{y}} + {b}', '\\sqrt{{a}({y} - {b})}', '{a}\\sqrt{{y} + {b}}'] }, '{y} + {b} \\geq 0', 0, '{x} > 0', 1),
  ];
  const FLx = [
    FL('A = \\pi r^2', 'the area $A$ of a circle of radius $r$ (take $r > 0$)', 'luas $A$ sebuah bulatan berjejari $r$ (ambil $r > 0$)', { r: '\\sqrt{\\dfrac{A}{\\pi}}' }, { r: ['\\dfrac{A}{\\pi}', '\\sqrt{A\\pi}', '\\dfrac{\\sqrt{A}}{\\pi}'] }, { A: [154, 616, 1386, 2464] }, 'A \\geq 0'),
    FL('V = \\pi r^2 h', 'the volume $V$ of a cylinder of radius $r$ and height $h$ (take $r > 0$)', 'isi padu $V$ sebuah silinder berjejari $r$ dan bertinggi $h$ (ambil $r > 0$)', { r: '\\sqrt{\\dfrac{V}{\\pi h}}' }, { r: ['\\sqrt{\\dfrac{V}{\\pi}} - h', '\\dfrac{V}{\\pi h}', '\\dfrac{\\sqrt{V}}{\\pi h}'] }, { V: [154, 308, 616, 1232, 462], h: [1, 2, 4, 3] }, 'h \\neq 0'),
    FL('E = \\dfrac{1}{2}mv^2', 'the kinetic energy $E$ of a body of mass $m$ moving at speed $v$ (take $v > 0$)', 'tenaga kinetik $E$ bagi suatu jasad berjisim $m$ yang bergerak dengan laju $v$ (ambil $v > 0$)', { v: '\\sqrt{\\dfrac{2E}{m}}' }, { v: ['\\sqrt{\\dfrac{E}{2m}}', '\\dfrac{2E}{m}', '\\sqrt{2Em}'] }, { E: [8, 18, 32, 50, 72, 98, 128], m: [1, 2, 4] }, 'm \\neq 0'),
    FL('\\dfrac{1}{R} = \\dfrac{1}{a} + \\dfrac{1}{b}', 'the total resistance $R$ of two resistors $a$ and $b$ connected in parallel (all positive)', 'jumlah rintangan $R$ bagi dua perintang $a$ dan $b$ yang disambung secara selari (semuanya positif)', { R: '\\dfrac{ab}{a + b}', b: '\\dfrac{aR}{a - R}' }, { R: ['a + b', '\\dfrac{a + b}{ab}', '\\dfrac{1}{a} + \\dfrac{1}{b}'], b: ['R - a', '\\dfrac{aR}{a + R}', '\\dfrac{1}{R} - \\dfrac{1}{a}'] }, 0, 'a \\neq R'),
    FL('\\dfrac{1}{f} = \\dfrac{1}{u} + \\dfrac{1}{v}', 'the focal length $f$ of a lens, with object distance $u$ and image distance $v$ (all positive)', 'panjang fokus $f$ sebuah kanta, dengan jarak objek $u$ dan jarak imej $v$ (semuanya positif)', { v: '\\dfrac{uf}{u - f}', u: '\\dfrac{vf}{v - f}' }, { v: ['\\dfrac{uf}{u + f}', 'f - u', '\\dfrac{1}{f} - \\dfrac{1}{u}'], u: ['\\dfrac{vf}{v + f}', 'f - v', '\\dfrac{1}{f} - \\dfrac{1}{v}'] }, 0, { v: 'u \\neq f', u: 'v \\neq f' }),
    FL('v = \\dfrac{2ab}{a + b}', 'the average speed $v$ (in km/h) of a journey with equal distances travelled at speeds $a$ and $b$', 'laju purata $v$ (dalam km/j) bagi satu perjalanan dengan jarak yang sama dilalui pada laju $a$ dan $b$', { b: '\\dfrac{av}{2a - v}' }, { b: ['\\dfrac{av}{2a + v}', '\\dfrac{v}{2a - v}', '2v - a'] }, 0, 'v \\neq 2a'),
  ];
  const dom3E = (pool) => (r) => {
    const I = inst(r, pool, { cond: 1 });
    return { q: T(`Make ${S_(I)} the subject of ${EQ(I)}. State any values that the letters cannot take.`, `Jadikan ${S_(I)} sebagai perkara rumus bagi ${EQ(I)}. Nyatakan sebarang nilai yang tidak boleh diambil oleh huruf-huruf itu.`), a: T(`${SE(I)}, where $${I.cond}$`, `${SE(I)}, dengan $${I.cond}$`), w: W(...wsteps(I), T(`The formula makes sense only when $${I.cond}$${/neq/.test(I.cond) ? ', because a denominator can never be zero' : ', because a square root needs a value that is not negative'}.`, `Rumus ini bermakna hanya apabila $${I.cond}$${/neq/.test(I.cond) ? ', kerana penyebut tidak boleh sifar' : ', kerana punca kuasa dua memerlukan nilai yang tidak negatif'}.`)), sp: 'm' };
  };
  const bothQ = (pool) => (r) => {
    const I = inst(r, pool.filter((f) => f.pm));
    return { q: T(`Make ${S_(I)} the subject of $${I.eq}$, giving both possible values of ${S_(I)}. Which value is taken if ${S_(I)} is a length?`, `Jadikan ${S_(I)} sebagai perkara rumus bagi $${I.eq}$, dengan memberi kedua-dua nilai ${S_(I)} yang mungkin. Nilai yang manakah diambil jika ${S_(I)} ialah suatu panjang?`), a: T(`$${I.s} = \\pm ${I.ans}$; for a length, $${I.s} = ${I.ans}$ (positive root).`, `$${I.s} = \\pm ${I.ans}$; bagi suatu panjang, $${I.s} = ${I.ans}$ (punca positif).`), w: W(...wsteps(I), T(`Taking the square root gives two answers, $${I.s} = \\pm ${I.ans}$.`, `Mengambil punca kuasa dua memberi dua jawapan, $${I.s} = \\pm ${I.ans}$.`), T('A length cannot be negative, so only the positive root is used.', 'Suatu panjang tidak boleh negatif, jadi hanya punca positif digunakan.')), sp: 's' };
  };
  const e35 = [plain(GX1, 0, 's'), plain(GX1, 1, 's'), plain(GX1, 3, 's'), dom3E(GX1), bothQ(GX1), evalQ(GX1), mcqQ(GX1), tfQ(GX1), blankQ(GX1), partsQ(GX1), verifyQ(GX1), ctxPlain(FLx.slice(0, 3), 's')];
  const m35 = [plain(GX2, 0, 's'), plain(GX2, 2, 's'), plain(GX2, 4, 's'), dom3E(GX2), bothQ(GX2), evalQ(GX2), mcqQ(GX2), tfQ(GX2), wrongQ(GX2), wrongQ2(GX2), verifyQ(GX2), partsQ(GX2), ctxPlain(FLx, 's'), ctxEval(FLx.slice(0, 3)), twoQ(GX2)];
  const a35 = [plain(GX3, 0, 'm'), plain(GX3, 1, 'm'), plain(GX3, 4, 'm'), dom3E(GX3), evalQ(GX3), mcqQ(GX3), tfQ(GX3), wrongQ(GX3), wrongQ2(GX3), verifyQ(GX3), partsQ(GX3), ctxPlain(FLx.slice(3), 'm'), ctxEval(FLx.slice(3)), wrongQ(FLx), verifyQ(FLx), twoQ(FLx.concat(GX3))];
  SPM.extend('F2-3.E', { e: e35, m: m35, a: a35 });

  /* ===== 10.1 Gradient ===== */
  const pt = (p) => `(${n(p[0])}, ${n(p[1])})`;
  const gt = (dy, dx) => Fr.tex(Fr.make(dy, dx));
  const CU = [['A wheelchair ramp', 'Sebuah tanjakan kerusi roda'], ['A roof', 'Sebuah bumbung'], ['A staircase', 'Sebuah tangga'], ['A hill road', 'Sebuah jalan di bukit'], ['A conveyor belt', 'Sebuah tali sawat'], ['A skateboard ramp', 'Sebuah tanjakan papan luncur'], ['A cable-car line', 'Sebuah laluan kereta kabel']];
  const CD = [['A playground slide', 'Sebuah gelongsor'], ['A zip-line', 'Sebuah tali luncur'], ['A drainage pipe', 'Sebuah paip saliran'], ['A water slide', 'Sebuah gelongsor air']];
  const rrT = (c, up, v, h) => T(`${c[0]} ${up ? 'rises' : 'falls'} ${v} m over a horizontal distance of ${h} m.`, `${c[1]} ${up ? 'naik' : 'turun'} ${v} m sepanjang jarak mengufuk ${h} m.`);
  /* figure: line through A, B on a grid, optional rise/run triangle and labels */
  const gFig = (A, B, o) => {
    o = o || {};
    const m = (B[1] - A[1]) / (B[0] - A[0]), C = [B[0], A[1]];
    const pts = [{ x: A[0], y: A[1], l: o.lab ? 'A' : '' }, { x: B[0], y: B[1], l: o.lab ? 'B' : '' }];
    return S.plane({ x: o.x || [-6, 6], y: o.y || [-6, 6], scale: o.sc || 20, lines: isFinite(m) ? [{ m, c: A[1] - m * A[0] }] : [], vlines: isFinite(m) ? [] : [A[0]], pts, segs: o.tri ? [{ a: A, b: C, dash: 1 }, { a: C, b: B, dash: 1 }] : [], extra: o.tri && o.num ? ({ sx, sy }) => S.text(sx((A[0] + C[0]) / 2), sy(A[1]) + (B[1] > A[1] ? 12 : -12), Math.abs(B[0] - A[0]), { s: 11 }) + S.text(sx(C[0]) + (B[0] > A[0] ? 12 : -12), sy((A[1] + B[1]) / 2), Math.abs(B[1] - A[1]), { s: 11 }) : null });
  };
  const line2 = (r, o) => {
    o = o || {};
    const A = [r.int(-4, 1), r.int(-4, 1)], dx = r.int(1, 4), dy = r.int(1, 4) * (o.neg ? -1 : 1);
    const B = [A[0] + dx, A[1] + dy];
    need(Math.abs(B[1]) <= 5 && Math.abs(B[0]) <= 5);
    return [A, B];
  };
  const P2 = (r, o) => { // two points, general
    o = o || {};
    const A = [r.int(o.lo || -5, o.hi || 5), r.int(o.lo || -5, o.hi || 5)], B = [r.int(o.lo || -5, o.hi || 5), r.int(o.lo || -5, o.hi || 5)];
    need(A[0] !== B[0] && A[1] !== B[1]);
    if (o.pos) need((B[1] - A[1]) * (B[0] - A[0]) > 0);
    if (o.negm) need((B[1] - A[1]) * (B[0] - A[0]) < 0);
    if (o.int) need((B[1] - A[1]) % (B[0] - A[0]) === 0);
    return [A, B];
  };
  const mOf = (A, B) => Fr.make(B[1] - A[1], B[0] - A[0]);
  const dirW = (m) => (m > 0 ? ['rises from left to right', 'naik dari kiri ke kanan'] : m < 0 ? ['falls from left to right', 'turun dari kiri ke kanan'] : ['is horizontal', 'adalah mengufuk']);

  const e101 = [
    (r) => { const k = r.int(-5, 5), h = r.chance(), A = [r.int(-4, 0), k], B = [A[0] + r.int(2, 6), k], f = r.int(0, 1); const V = h ? [B, A] : [[k, A[0]], [k, B[0]]]; return { q: h ? [T(`Find the gradient of the horizontal line $y = ${k}$.`, `Cari kecerunan garis mengufuk $y = ${k}$.`), T(`What is the gradient of the line through $${pt(A)}$ and $${pt(B)}$?`, `Apakah kecerunan garis yang melalui $${pt(A)}$ dan $${pt(B)}$?`)][f] : [T(`What is the gradient of the vertical line $x = ${k}$?`, `Apakah kecerunan garis mencancang $x = ${k}$?`), T(`What is the gradient of the line through $${pt(V[0])}$ and $${pt(V[1])}$?`, `Apakah kecerunan garis yang melalui $${pt(V[0])}$ dan $${pt(V[1])}$?`)][f], a: h ? T('$0$ (a horizontal line)', '$0$ (garis mengufuk)') : T('Undefined (a vertical line)', 'Tidak tertakrif (garis mencancang)'), w: W(h ? T('A horizontal line has no vertical change, so gradient $= \\dfrac{0}{\\text{horizontal change}} = 0$.', 'Garis mengufuk tiada perubahan mencancang, jadi kecerunan $= \\dfrac{0}{\\text{perubahan mengufuk}} = 0$.') : T('A vertical line has a horizontal change of $0$, so the gradient would be $\\dfrac{\\text{vertical change}}{0}$, and division by $0$ is not defined.', 'Garis mencancang mempunyai perubahan mengufuk $0$, jadi kecerunannya ialah $\\dfrac{\\text{perubahan mencancang}}{0}$, dan pembahagian dengan $0$ tidak tertakrif.')), sp: 's' }; },
    (r) => { const ms = [r.pick([2, 3, 4]), r.pick([-1, -2, -3]), 0, 'u']; const L = r.shuffle(ms).slice(0, 4); const nm = 'ABCD'; const rows = L.map((m, i) => { const x0 = r.int(-3, 2); return m === 'u' ? [[x0, 0], [x0, r.int(2, 5)]] : [[x0, r.int(-3, 3)], null, m]; }); const P_ = L.map((m) => { const A = [r.int(-3, 2), r.int(-3, 2)]; return m === 'u' ? [A, [A[0], A[1] + r.int(2, 4)]] : [A, [A[0] + r.int(1, 3), A[1] + m * r.int(1, 3)]]; }); const G = (A, B) => (B[0] === A[0] ? 'not defined' : B[1] === A[1] ? 'zero' : (B[1] - A[1]) / (B[0] - A[0]) > 0 ? 'positive' : 'negative'); const Gm = { 'not defined': 'tidak tertakrif', zero: 'sifar', positive: 'positif', negative: 'negatif' }; const list = P_.map((p, i) => `(${nm[i]}) ${pt(p[0])} ${T('and', 'dan').en} ${pt(p[1])}`); const listM = P_.map((p, i) => `(${nm[i]}) ${pt(p[0])} dan ${pt(p[1])}`); return { q: T(`For each pair of points, state whether the gradient of the line through them is positive, negative, zero or not defined.<br>${list.join('<br>')}`, `Bagi setiap pasangan titik, nyatakan sama ada kecerunan garis yang melalui kedua-duanya positif, negatif, sifar atau tidak tertakrif.<br>${listM.join('<br>')}`), a: T(P_.map((p, i) => `(${nm[i]}) ${G(p[0], p[1])}`).join('; '), P_.map((p, i) => `(${nm[i]}) ${Gm[G(p[0], p[1])]}`).join('; ')), w: W(...P_.map((p, i) => T(`(${nm[i]}) vertical change $${p[1][1] - p[0][1]}$, horizontal change $${p[1][0] - p[0][0]}$: ${G(p[0], p[1])}.`, `(${nm[i]}) perubahan mencancang $${p[1][1] - p[0][1]}$, perubahan mengufuk $${p[1][0] - p[0][0]}$: ${Gm[G(p[0], p[1])]}.`))), sp: 'm' }; },
    (r) => { const S_ = [['A horizontal line has a gradient of 0.', 'Garis mengufuk mempunyai kecerunan 0.', 1, 'A horizontal line has no vertical change, so its gradient is $\\dfrac{0}{\\text{horizontal change}} = 0$.', 'Garis mengufuk tiada perubahan mencancang, jadi kecerunannya ialah $\\dfrac{0}{\\text{perubahan mengufuk}} = 0$.'], ['A vertical line has a gradient of 0.', 'Garis mencancang mempunyai kecerunan 0.', 0, 'A vertical line has a horizontal change of $0$, so its gradient is not defined, not $0$.', 'Garis mencancang mempunyai perubahan mengufuk $0$, jadi kecerunannya tidak tertakrif, bukan $0$.'], ['A line that rises from left to right has a positive gradient.', 'Garis yang naik dari kiri ke kanan mempunyai kecerunan positif.', 1, 'Moving to the right, $y$ increases, so both changes have the same sign and the gradient is positive.', 'Bergerak ke kanan, $y$ bertambah, jadi kedua-dua perubahan mempunyai tanda yang sama dan kecerunannya positif.'], ['A line that falls from left to right has a positive gradient.', 'Garis yang turun dari kiri ke kanan mempunyai kecerunan positif.', 0, 'A falling line has a negative gradient, because $y$ decreases while $x$ increases.', 'Garis yang menurun mempunyai kecerunan negatif, kerana $y$ berkurang apabila $x$ bertambah.'], ['Gradient = horizontal change ÷ vertical change.', 'Kecerunan = perubahan mengufuk ÷ perubahan mencancang.', 0, 'The fraction is the other way round: vertical change divided by horizontal change.', 'Pecahan itu terbalik: perubahan mencancang dibahagi dengan perubahan mengufuk.'], ['Gradient = vertical change ÷ horizontal change.', 'Kecerunan = perubahan mencancang ÷ perubahan mengufuk.', 1, 'That is the definition of gradient: rise divided by run.', 'Itulah takrif kecerunan: kenaikan dibahagi dengan larian.'], ['A vertical line has no defined gradient because the horizontal change is 0.', 'Garis mencancang tidak mempunyai kecerunan tertakrif kerana perubahan mengufuk ialah 0.', 1, 'Division by $0$ is not defined, so a vertical line has no gradient.', 'Pembahagian dengan $0$ tidak tertakrif, jadi garis mencancang tiada kecerunan.'], ['Every straight line has a gradient that is a number.', 'Setiap garis lurus mempunyai kecerunan yang merupakan satu nombor.', 0, 'A vertical line is a straight line, but its gradient is not defined, so it is not a number.', 'Garis mencancang ialah garis lurus, tetapi kecerunannya tidak tertakrif, jadi ia bukan satu nombor.'], ['A line with gradient 3 is steeper than a line with gradient 2.', 'Garis yang berkecerunan 3 lebih curam daripada garis yang berkecerunan 2.', 1, 'Steepness is measured by the size of the gradient, and $3 > 2$.', 'Kecuraman diukur dengan saiz kecerunan, dan $3 > 2$.'], ['The gradient of a straight line is the same wherever it is measured on the line.', 'Kecerunan sebuah garis lurus adalah sama di mana-mana ia diukur pada garis itu.', 1, 'Any two points on the line give similar right-angled triangles, so rise divided by run is always the same.', 'Mana-mana dua titik pada garis itu memberi segi tiga bersudut tegak yang serupa, jadi kenaikan dibahagi larian sentiasa sama.']]; const s = r.pick(S_); return { q: T(`True or false: "${s[0]}"`, `Betul atau palsu: "${s[1]}"`), a: T(s[2] ? 'True.' : 'False.', s[2] ? 'Betul.' : 'Palsu.'), w: W(T(s[3], s[4])), sp: 'xs' }; },
  ];
  const m101 = [
    (r) => { const ms = r.sample([[3, 1], [-2, 1], [1, 2], [-3, 2], [5, 1], [-1, 3], [2, 3], [-4, 1]], 3), L = ['P', 'Q', 'R'], st = ms.map((m) => Math.abs(m[0] / m[1])); need(new Set(st).size === 3); const im = st.indexOf(Math.max(...st)); return { q: T(`Three lines have gradients ${ms.map((m, i) => `$${L[i]}$: $${gt(m[0], m[1])}$`).join(', ')}. Which line is the steepest? Which lines fall from left to right?`, `Tiga garis mempunyai kecerunan ${ms.map((m, i) => `$${L[i]}$: $${gt(m[0], m[1])}$`).join(', ')}. Garis yang manakah paling curam? Garis yang manakah turun dari kiri ke kanan?`), a: T(`Steepest: ${L[im]} (largest $|m|$). Falling: ${ms.map((m, i) => (m[0] < 0 ? L[i] : '')).filter(Boolean).join(', ') || 'none'}.`, `Paling curam: ${L[im]} ($|m|$ terbesar). Menurun: ${ms.map((m, i) => (m[0] < 0 ? L[i] : '')).filter(Boolean).join(', ') || 'tiada'}.`), w: W(T(`Ignore the signs and compare sizes: ${ms.map((m, i) => `${L[i]} gives $${n(round(Math.abs(m[0] / m[1]), 4))}$`).join(', ')}.`, `Abaikan tanda dan bandingkan saiz: ${ms.map((m, i) => `${L[i]} memberi $${n(round(Math.abs(m[0] / m[1]), 4))}$`).join(', ')}.`), T(`The largest size is ${L[im]}, so ${L[im]} is the steepest.`, `Saiz terbesar ialah ${L[im]}, jadi ${L[im]} paling curam.`), T('A line falls from left to right exactly when its gradient is negative.', 'Garis turun dari kiri ke kanan apabila kecerunannya negatif.')), sp: 's' }; },
    (r) => { const p = r.pick([5, 8, 10, 12, 15, 20]), run = r.pick([50, 100, 200, 250, 400]); need((p * run) % 100 === 0); return { q: T(`A road has a gradient of ${p}%. How many metres does it rise for every ${run} m travelled horizontally?`, `Sebatang jalan mempunyai kecerunan ${p}%. Berapa meterkah jalan itu naik bagi setiap ${run} m yang dilalui secara mengufuk?`), a: T(`${(p * run) / 100} m`), w: W(T(`A gradient of ${p}% means the road rises $${p}$ m for every $100$ m travelled horizontally.`, `Kecerunan ${p}% bermaksud jalan itu naik $${p}$ m bagi setiap $100$ m yang dilalui secara mengufuk.`), `$\\dfrac{${p}}{100} \\times ${run} = ${(p * run) / 100}$`), sp: 's' }; },
  ];
  const a101 = [
    (r) => { const a = r.int(2, 8), b = r.int(2, 8) * r.pick([1, -1]); need(a !== Math.abs(b) || b > 0); const m = Fr.make(-b, a); const w = r.int(0, 1); return { q: w ? T(`A line meets the $x$-axis at $(${a}, 0)$ and the $y$-axis at $(0, ${b})$. Find its gradient.`, `Satu garis bertemu paksi-$x$ di $(${a}, 0)$ dan paksi-$y$ di $(0, ${b})$. Cari kecerunannya.`) : T(`The $x$-intercept of a line is ${a} and its $y$-intercept is ${b}. Use $m = -\\dfrac{b}{a}$, where $a$ is the $x$-intercept and $b$ is the $y$-intercept, to find the gradient.`, `Pintasan-$x$ suatu garis ialah ${a} dan pintasan-$y$ nya ialah ${b}. Gunakan $m = -\\dfrac{b}{a}$, dengan $a$ ialah pintasan-$x$ dan $b$ ialah pintasan-$y$, untuk mencari kecerunan.`), a: T(`$${Fr.tex(m)}$`), w: W(T(`The line passes through $(${a}, 0)$ and $(0, ${b})$.`, `Garis itu melalui $(${a}, 0)$ dan $(0, ${b})$.`), `$m = \\dfrac{${b} - 0}{0 - ${a}} = ${Fr.tex(m)}$`), sp: 's' }; },
    (r) => { const a = r.int(2, 6), b = r.int(2, 6) * r.pick([1, -1]), m = Fr.make(-b, a); return { q: T(`The line shown crosses the axes at two points. Find its gradient.`, `Garis yang ditunjukkan memotong paksi pada dua titik. Cari kecerunannya.`), fig: S.plane({ x: [-7, 7], y: [-7, 7], scale: 18, lines: [{ m: -b / a, c: b }], pts: [{ x: a, y: 0, l: `(${a}, 0)`, dy: b > 0 ? 12 : -12, dx: 4 }, { x: 0, y: b, l: `(0, ${b})`, dx: 24, dy: b > 0 ? -6 : 8 }] }), a: T(`$${Fr.tex(m)}$`), w: W(T(`Read the two points off the graph: $(${a}, 0)$ and $(0, ${b})$.`, `Baca dua titik daripada graf: $(${a}, 0)$ dan $(0, ${b})$.`), `$m = \\dfrac{${b} - 0}{0 - ${a}} = ${Fr.tex(m)}$`), sp: 's' }; },
    (r) => { const m = r.pick([2, 3, -2, -3, 1, -1, 4]), A = [r.int(-3, 3), r.int(-3, 3)], k1 = r.int(1, 3), k2 = r.int(2, 5); need(k1 !== k2); const P1 = [A[0] + k1, A[1] + m * k1], P2_ = [A[0] + k1 + k2, A[1] + m * (k1 + k2)]; return { q: T(`The points $A${pt(A)}$, $B${pt(P1)}$ and $C${pt(P2_)}$ lie on a straight line. (a) Find the gradient of $AB$. (b) Find the gradient of $AC$. (c) Explain why your answers to (a) and (b) are the same.`, `Titik $A${pt(A)}$, $B${pt(P1)}$ dan $C${pt(P2_)}$ terletak pada satu garis lurus. (a) Cari kecerunan $AB$. (b) Cari kecerunan $AC$. (c) Terangkan mengapa jawapan anda bagi (a) dan (b) sama.`), a: T(`(a) $${m}$ (b) $${m}$ (c) The gradient of a straight line is constant: the ratio rise ÷ run is the same for any two points on it (similar triangles).`, `(a) $${m}$ (b) $${m}$ (c) Kecerunan garis lurus adalah malar: nisbah kenaikan ÷ larian adalah sama bagi mana-mana dua titik padanya (segi tiga serupa).`), w: W(`(a) $\\dfrac{${P1[1]} - ${par(A[1])}}{${P1[0]} - ${par(A[0])}} = \\dfrac{${P1[1] - A[1]}}{${P1[0] - A[0]}} = ${m}$`, `(b) $\\dfrac{${P2_[1]} - ${par(A[1])}}{${P2_[0]} - ${par(A[0])}} = \\dfrac{${P2_[1] - A[1]}}{${P2_[0] - A[0]}} = ${m}$`, T('(c) The two right-angled triangles are similar, so rise ÷ run gives the same value for any two points on one straight line.', '(c) Dua segi tiga bersudut tegak itu serupa, jadi kenaikan ÷ larian memberi nilai yang sama bagi mana-mana dua titik pada satu garis lurus.')), sp: 'l' }; },
    (r) => { const R = [['A tank is filled with water', 'Sebuah tangki diisi air', 'litres', 'liter', 'minutes', 'minit'], ['A swimming pool is filled', 'Sebuah kolam renang diisi', 'm$^3$', 'm$^3$', 'hours', 'jam'], ['A bath is filled', 'Sebuah tab mandi diisi', 'litres', 'liter', 'minutes', 'minit']], c = r.pick(R), t1 = r.int(1, 3), dt = r.int(2, 6), y0 = r.int(1, 5) * 10, q = r.int(2, 9) * 5, y1 = y0 + q * t1, y2 = y0 + q * (t1 + dt); const fig = S.graph({ w: 300, h: 200, xr: [0, 10, 1], yr: [0, Math.ceil((y0 + q * (t1 + dt + 1) + 5) / 20) * 20, Math.ceil((y0 + q * (t1 + dt + 1) + 5) / 20) * 4], xlabel: c[4], ylabel: c[2], series: [{ pts: [[0, y0], [t1 + dt + 1, y0 + q * (t1 + dt + 1)]], type: 'line' }], extra: ({ sx, sy }) => S.dot(sx(t1), sy(y1), 3) + S.dot(sx(t1 + dt), sy(y2), 3) + S.text(sx(t1), sy(y1) - 10, `(${t1}, ${y1})`, { s: 10 }) + S.text(sx(t1 + dt) + 4, sy(y2) + 12, `(${t1 + dt}, ${y2})`, { s: 10 }) }); return { q: T(`${c[0]}. The graph shows the amount (in ${c[2]}) against the time (in ${c[4]}). Find the gradient of the graph and state what it represents.`, `${c[1]}. Graf menunjukkan jumlah (dalam ${c[3]}) melawan masa (dalam ${c[5]}). Cari kecerunan graf itu dan nyatakan apa yang diwakilinya.`), fig, a: T(`$${q}$: the rate of filling, ${q} ${c[2]} per ${c[4].slice(0, -1)}.`, `$${q}$: kadar pengisian, ${q} ${c[3]} setiap ${c[5]}.`), w: W(T(`Two points on the graph: $(${t1}, ${y1})$ and $(${t1 + dt}, ${y2})$.`, `Dua titik pada graf: $(${t1}, ${y1})$ dan $(${t1 + dt}, ${y2})$.`), `$\\dfrac{${y2} - ${y1}}{${t1 + dt} - ${t1}} = \\dfrac{${y2 - y1}}{${dt}} = ${q}$`, T(`The gradient is the rate of filling: ${q} ${c[2]} per ${c[4].slice(0, -1)}.`, `Kecerunan ialah kadar pengisian: ${q} ${c[3]} setiap ${c[5]}.`)), sp: 'm' }; },
    (r) => { const x0 = r.int(-3, 3), x1 = r.int(-3, 3); need(x0 !== x1); const y0 = r.int(-2, 2), y1 = y0 + r.int(2, 5); return { q: T(`Line $l_1$ passes through $(${x0}, ${y0})$ and $(${x0}, ${y1})$. Line $l_2$ passes through $(${x1}, ${y0})$ and $(${x1}, ${y1})$. Are $l_1$ and $l_2$ parallel? Can we say their gradients are equal?`, `Garis $l_1$ melalui $(${x0}, ${y0})$ dan $(${x0}, ${y1})$. Garis $l_2$ melalui $(${x1}, ${y0})$ dan $(${x1}, ${y1})$. Adakah $l_1$ dan $l_2$ selari? Bolehkah kita katakan kecerunan kedua-duanya sama?`), a: T('Both lines are vertical, so they are parallel. Their gradients are not defined, so we cannot say the gradients are equal numbers.', 'Kedua-dua garis mencancang, jadi keduanya selari. Kecerunan keduanya tidak tertakrif, jadi kita tidak boleh mengatakan kecerunan itu ialah nombor yang sama.'), w: W(T(`Both points of $l_1$ have $x = ${x0}$ and both points of $l_2$ have $x = ${x1}$, so each line is vertical.`, `Kedua-dua titik $l_1$ mempunyai $x = ${x0}$ dan kedua-dua titik $l_2$ mempunyai $x = ${x1}$, jadi setiap garis adalah mencancang.`), T('Two vertical lines never meet, so they are parallel.', 'Dua garis mencancang tidak pernah bertemu, jadi keduanya selari.'), T('For each line the horizontal change is $0$, so neither gradient is a number and they cannot be called equal.', 'Bagi setiap garis perubahan mengufuk ialah $0$, jadi kecerunan kedua-duanya bukan nombor dan tidak boleh dikatakan sama.')), sp: 'm' }; },
    (r) => { const m1 = r.pick([[-3, 1], [3, 1], [-5, 2], [2, 1], [-4, 3], [1, 2]]), m2 = r.pick([[2, 1], [-2, 1], [1, 1], [-1, 1], [3, 2], [-3, 2], [4, 1]]); need(Math.abs(m1[0] / m1[1]) !== Math.abs(m2[0] / m2[1])); const bigger = Fr.val(Fr.make(...m1)) > Fr.val(Fr.make(...m2)) ? 1 : 2, steep = Math.abs(m1[0] / m1[1]) > Math.abs(m2[0] / m2[1]) ? 1 : 2; return { q: T(`Line $p$ has gradient $${gt(m1[0], m1[1])}$ and line $q$ has gradient $${gt(m2[0], m2[1])}$. (a) Which line has the greater gradient? (b) Which line is steeper? (c) Explain why these answers may differ.`, `Garis $p$ berkecerunan $${gt(m1[0], m1[1])}$ dan garis $q$ berkecerunan $${gt(m2[0], m2[1])}$. (a) Garis yang manakah mempunyai kecerunan lebih besar? (b) Garis yang manakah lebih curam? (c) Terangkan mengapa jawapan-jawapan ini mungkin berbeza.`), a: T(`(a) ${bigger === 1 ? 'p' : 'q'} (b) ${steep === 1 ? 'p' : 'q'} (c) Steepness depends on $|m|$; the sign only shows direction.`, `(a) ${bigger === 1 ? 'p' : 'q'} (b) ${steep === 1 ? 'p' : 'q'} (c) Kecuraman bergantung pada $|m|$; tanda hanya menunjukkan arah.`), w: W(T(`(a) As numbers: $p$ has $${n(round(m1[0] / m1[1], 4))}$ and $q$ has $${n(round(m2[0] / m2[1], 4))}$, so ${bigger === 1 ? 'p' : 'q'} has the greater gradient.`, `(a) Sebagai nombor: $p$ mempunyai $${n(round(m1[0] / m1[1], 4))}$ dan $q$ mempunyai $${n(round(m2[0] / m2[1], 4))}$, jadi ${bigger === 1 ? 'p' : 'q'} mempunyai kecerunan yang lebih besar.`), T(`(b) Ignoring the signs: $${n(round(Math.abs(m1[0] / m1[1]), 4))}$ and $${n(round(Math.abs(m2[0] / m2[1]), 4))}$, so ${steep === 1 ? 'p' : 'q'} is steeper.`, `(b) Tanpa mengira tanda: $${n(round(Math.abs(m1[0] / m1[1]), 4))}$ dan $${n(round(Math.abs(m2[0] / m2[1]), 4))}$, jadi ${steep === 1 ? 'p' : 'q'} lebih curam.`), T('(c) A negative gradient is a small number but can still belong to a steep line, because steepness uses the size only.', '(c) Kecerunan negatif ialah nombor yang kecil tetapi masih boleh menjadi garis yang curam, kerana kecuraman hanya menggunakan saiznya.')), sp: 'm' }; },
    (r) => { const a = r.int(2, 6), b = r.int(2, 6), m = Fr.make(-b, a), t = r.int(1, 3); const mm = mcq(r, `${Fr.tex(m)}`, [`${Fr.tex(Fr.make(b, a))}`, `${Fr.tex(Fr.make(-a, b))}`, `${Fr.tex(Fr.make(a, b))}`]); need(a !== b); return { q: T(`A line meets the axes at $(${a}, 0)$ and $(0, ${b})$. Which of the following is its gradient?<br>${mm.q}`, `Satu garis bertemu paksi di $(${a}, 0)$ dan $(0, ${b})$. Yang manakah kecerunannya?<br>${mm.q}`), a: T(mm.ans), w: W(`$m = \\dfrac{${b} - 0}{0 - ${a}} = ${Fr.tex(m)}$`, T('Going from the $x$-axis to the $y$-axis, $x$ decreases while $y$ increases, so the gradient is negative.', 'Dari paksi-$x$ ke paksi-$y$, $x$ berkurang manakala $y$ bertambah, jadi kecerunannya negatif.')), sp: 'xs' }; },
    (r) => { const p = r.int(1, 4), a = r.int(1, 3), b = r.int(a + 1, 6); const m = Fr.make(b - 2 * a + 0, 1); const A = [p, a * p], B = [3 * p, b * p]; return { q: T(`Find the gradient of the line through $(p, ${a}p)$ and $(3p, ${b}p)$, where $p \\neq 0$.`, `Cari kecerunan garis yang melalui $(p, ${a}p)$ dan $(3p, ${b}p)$, dengan $p \\neq 0$.`), a: T(`$${gt((b - a), 2)}$`), w: W(`$\\dfrac{${b}p - ${a}p}{3p - p} = \\dfrac{${b - a}p}{2p}$`, T(`Since $p \\neq 0$, cancel $p$: $${gt(b - a, 2)}$.`, `Oleh sebab $p \\neq 0$, batalkan $p$: $${gt(b - a, 2)}$.`)), sp: 'm' }; },
  ];
  /* ---- representation x task framework: each representation gives a line (dy, dx, description, figure); each task asks something different about it ---- */
  const sgnPick = (r, sg) => (sg ? sg : r.pick([1, -1]));
  const rampReps = CU.map((c) => ({ lv: 'e', kind: 'ramp', make: (r) => { const v = r.int(1, 8), h = r.int(2, 14); need(v !== h); return { kind: 'ramp', dy: v, dx: h, desc: rrT(c, 1, v, h), u: ['m', 'm'] }; } })).concat(CD.map((c) => ({ lv: 'm', kind: 'ramp', make: (r) => { const v = r.int(1, 8), h = r.int(2, 14); need(v !== h); return { kind: 'ramp', dy: -v, dx: h, desc: rrT(c, 0, v, h), u: ['m', 'm'] }; } })));
  const coordDesc = [
    (A, B) => T(`The points $A${pt(A)}$ and $B${pt(B)}$ lie on a straight line.`, `Titik $A${pt(A)}$ dan $B${pt(B)}$ terletak pada satu garis lurus.`),
    (A, B) => T(`A straight line passes through $P${pt(A)}$ and $Q${pt(B)}$.`, `Satu garis lurus melalui $P${pt(A)}$ dan $Q${pt(B)}$.`),
    (A, B) => T(`The line segment joining $M${pt(A)}$ and $N${pt(B)}$ is drawn on a coordinate plane.`, `Tembereng garis yang menyambungkan $M${pt(A)}$ dan $N${pt(B)}$ dilukis pada satah koordinat.`),
    (A, B) => T(`On a map grid (1 unit = 1 km), a straight road runs from the school $S${pt(A)}$ to the market $M${pt(B)}$.`, `Pada grid peta (1 unit = 1 km), sebatang jalan lurus bermula dari sekolah $S${pt(A)}$ ke pasar $M${pt(B)}$.`),
    (A, B) => T(`On a treasure map a straight path leads from the tree $T${pt(A)}$ to the cave $C${pt(B)}$ (1 unit = 10 m).`, `Pada peta harta karun, satu lorong lurus bermula dari pokok $T${pt(A)}$ ke gua $C${pt(B)}$ (1 unit = 10 m).`),
  ];
  const ptRep = (i, sg, lv, lo, hi) => ({ lv, kind: 'pt', make: (r) => { const s = sgnPick(r, sg); const [A, B] = P2(r, { lo, hi }); need((B[1] - A[1]) * s * (B[0] - A[0]) > 0); const [a, b] = A[0] < B[0] ? [A, B] : [B, A]; return { kind: 'pt', A: a, B: b, dy: b[1] - a[1], dx: b[0] - a[0], desc: coordDesc[i](a, b) }; } });
  const figRep = (tri, sg, lv, txt) => ({ lv, kind: 'fig', make: (r) => { const [A, B] = line2(r, { neg: sgnPick(r, sg) < 0 }); return { kind: 'fig', A, B, dy: B[1] - A[1], dx: B[0] - A[0], fig: gFig(A, B, { lab: 1, tri }), desc: T(txt[0], txt[1]) }; } });
  const tabRep = (sg, lv) => ({ lv, kind: 'tab', gi: 1, make: (r) => { const s = sgnPick(r, sg), A = [r.int(-3, 3), r.int(-3, 3)], m = r.int(1, 4) * s, dx = r.pick([1, 2, 3]); const xs = [0, 1, 2, 3].map((i) => A[0] + i * dx), ys = xs.map((x) => A[1] + m * (x - A[0])); return { kind: 'tab', dy: m * dx, dx, A: [xs[0], ys[0]], B: [xs[1], ys[1]], desc: T(`The table shows the coordinates of four points on a straight line.<br>${SPM.table([['$x$'].concat(xs.map(n)), ['$y$'].concat(ys.map(n))], { rowHead: true })}`, `Jadual menunjukkan koordinat empat titik pada satu garis lurus.<br>${SPM.table([['$x$'].concat(xs.map(n)), ['$y$'].concat(ys.map(n))], { rowHead: true })}`) }; } });
  const pl = (t, w) => (t === 1 ? w.replace(/s$/, '') : w);
  const RATE = [['A tank is being filled with water', 'Sebuah tangki sedang diisi air', 'minutes', 'minit', 'the tank holds', 'tangki itu mengandungi', (y) => `${y} litres`, (y) => `${y} liter`, 'litres', 'liter', 1], ['A swimming pool is being filled', 'Sebuah kolam renang sedang diisi', 'hours', 'jam', 'the pool holds', 'kolam itu mengandungi', (y) => `${y} m$^3$ of water`, (y) => `${y} m$^3$ air`, 'm$^3$', 'm$^3$', 1], ['A plant is growing', 'Sebatang pokok sedang bertumbuh', 'weeks', 'minggu', 'the plant is', 'pokok itu setinggi', (y) => `${y} cm tall`, (y) => `${y} cm`, 'cm', 'cm', 1], ['A savings account grows steadily', 'Sebuah akaun simpanan bertambah dengan stabil', 'months', 'bulan', 'the account holds', 'akaun itu mengandungi', (y) => `RM${y}`, (y) => `RM${y}`, 'RM', 'RM', 1], ['A candle is burning down', 'Sebatang lilin sedang terbakar', 'hours', 'jam', 'the candle is', 'lilin itu sepanjang', (y) => `${y} cm long`, (y) => `${y} cm`, 'cm', 'cm', 0], ['A tank is being emptied', 'Sebuah tangki sedang dikosongkan', 'minutes', 'minit', 'the tank holds', 'tangki itu mengandungi', (y) => `${y} litres`, (y) => `${y} liter`, 'litres', 'liter', 0], ['A phone battery is draining', 'Bateri sebuah telefon sedang susut', 'hours', 'jam', 'the battery is at', 'bateri itu berada pada', (y) => `${y}%`, (y) => `${y}%`, '%', '%', 0], ['A cyclist rides along a straight road', 'Seorang penunggang basikal menunggang di jalan lurus', 'hours', 'jam', 'the cyclist has travelled', 'penunggang itu telah bergerak sejauh', (y) => `${y} km`, (y) => `${y} km`, 'km', 'km', 1]];
  const rateReps = RATE.map((c) => ({ lv: c[10] ? 'm' : 'a', kind: 'rate', gi: 1, make: (r) => { const q = r.int(2, 9) * (c[10] ? 1 : -1), t1 = r.int(0, 3), dt = r.int(2, 6), y0 = r.int(4, 10) * 10; const y1 = y0 + q * t1, y2 = y0 + q * (t1 + dt); need(y1 > 0 && y2 > 0); return { kind: 'rate', dy: q * dt, dx: dt, A: [t1, y1], B: [t1 + dt, y2], u: [c[8], c[2]], desc: T(`${c[0]}. After ${t1} ${pl(t1, c[2])} ${c[4]} ${c[6](y1)}, and after ${t1 + dt} ${c[2]} ${c[4]} ${c[6](y2)}. The graph is a straight line.`, `${c[1]}. Selepas ${t1} ${c[3]}, ${c[5]} ${c[7](y1)}, dan selepas ${t1 + dt} ${c[3]}, ${c[5]} ${c[7](y2)}. Graf ialah satu garis lurus.`), ctx: [c[2], c[3], c[8], c[9]] }; } }));
  const miscReps = [
    { lv: 'e', kind: 'ramp', make: (r) => { const a = r.int(12, 20), b = r.int(20, 32); need(a < b); return { kind: 'ramp', dy: a, dx: b, desc: T(`Each step of a staircase has a riser (height) of ${a} cm and a tread (depth) of ${b} cm.`, `Setiap anak tangga mempunyai tinggi ${a} cm dan kedalaman ${b} cm.`), u: ['cm', 'cm'] }; } },
    { lv: 'e', kind: 'ramp', make: (r) => { const h = r.int(3, 9), d = r.int(1, 6); need(h !== d); return { kind: 'ramp', dy: h, dx: d, desc: T(`A ladder leans against a wall. Its top is ${h} m above the ground and its foot is ${d} m from the wall.`, `Sebuah tangga bersandar pada dinding. Bahagian atasnya ${h} m dari tanah dan kakinya ${d} m dari dinding.`), u: ['m', 'm'] }; } },
    { lv: 'm', kind: 'ramp', un: 1, make: (r) => { const k = r.int(5, 20); return { kind: 'ramp', dy: 1, dx: k, desc: T(`A road sign warns of a slope of 1 in ${k}, meaning it rises 1 m for every ${k} m travelled horizontally.`, `Sebuah papan tanda jalan memberi amaran cerun 1 dalam ${k}, iaitu naik 1 m bagi setiap ${k} m yang dilalui secara mengufuk.`), u: ['m', 'm'] }; } },
    { lv: 'a', kind: 'ic', make: (r) => { const a = r.int(2, 8), b = r.int(2, 8) * r.pick([1, -1]); need(a !== Math.abs(b)); return { kind: 'ic', dy: -b, dx: a, A: [0, b], B: [a, 0], desc: T(`A line crosses the $x$-axis at $(${a}, 0)$ and the $y$-axis at $(0, ${b})$.`, `Satu garis memotong paksi-$x$ di $(${a}, 0)$ dan paksi-$y$ di $(0, ${b})$.`) }; } },
  ];
  const REPS = [
    ptRep(0, 1, 'e', 0, 8), ptRep(1, 1, 'e', 0, 8), ptRep(2, 1, 'e', 0, 8), ptRep(0, -1, 'm', -6, 6), ptRep(1, -1, 'm', -6, 6), ptRep(2, 0, 'm', -6, 6), ptRep(3, 0, 'm', 0, 9), ptRep(4, 0, 'm', 0, 9), ptRep(0, 0, 'a', -8, 8), ptRep(1, 0, 'a', -8, 8),
    figRep(1, 1, 'e', ['The diagram shows a line $AB$ with a right-angled triangle drawn on the grid.', 'Rajah menunjukkan satu garis $AB$ dengan sebuah segi tiga bersudut tegak dilukis pada grid.']), figRep(0, 1, 'e', ['The diagram shows the line $AB$ drawn on a square grid.', 'Rajah menunjukkan garis $AB$ yang dilukis pada grid segi empat sama.']), figRep(0, -1, 'm', ['The line $AB$ is drawn on a square grid.', 'Garis $AB$ dilukis pada grid segi empat sama.']), figRep(1, -1, 'm', ['The line $AB$ and a right-angled triangle are drawn on the grid.', 'Garis $AB$ dan sebuah segi tiga bersudut tegak dilukis pada grid.']), figRep(0, 0, 'a', ['On the grid, a straight line passes through the labelled points $A$ and $B$.', 'Pada grid, satu garis lurus melalui titik berlabel $A$ dan $B$.']),
    tabRep(1, 'e'), tabRep(-1, 'm'), tabRep(0, 'a'),
  ].concat(rampReps, rateReps, miscReps);
  const mfmt = (dy, dx) => Fr.tex(Fr.make(dy, dx));
  /* the standard gradient calculation, as a working line */
  const simp = (D) => (mfmt(D.dy, D.dx) === `\\dfrac{${D.dy}}{${D.dx}}` ? '' : ` = ${mfmt(D.dy, D.dx)}`);
  const gradL = (D) => (D.A
    ? T(`Gradient $= \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{${D.B[1]} - ${par(D.A[1])}}{${D.B[0]} - ${par(D.A[0])}} = \\dfrac{${D.dy}}{${D.dx}}${simp(D)}$`,
      `Kecerunan $= \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{${D.B[1]} - ${par(D.A[1])}}{${D.B[0]} - ${par(D.A[0])}} = \\dfrac{${D.dy}}{${D.dx}}${simp(D)}$`)
    : T(`Gradient $= \\dfrac{\\text{vertical change}}{\\text{horizontal change}} = \\dfrac{${D.dy}}{${D.dx}}${simp(D)}$`,
      `Kecerunan $= \\dfrac{\\text{perubahan mencancang}}{\\text{perubahan mengufuk}} = \\dfrac{${D.dy}}{${D.dx}}${simp(D)}$`));
  const TK = [
    ['e', (r, D) => ({ ask: T(`Find the gradient of the line.`, `Cari kecerunan garis itu.`), a: T(`$${mfmt(D.dy, D.dx)}$`), w: W(gradL(D)), sp: 's' })],
    ['e', (r, D) => ({ ask: T(`State whether the gradient is positive or negative, and whether the line rises or falls from left to right.`, `Nyatakan sama ada kecerunan positif atau negatif, dan sama ada garis naik atau turun dari kiri ke kanan.`), a: T(D.dy > 0 ? 'Positive; it rises from left to right.' : 'Negative; it falls from left to right.', D.dy > 0 ? 'Positif; garis naik dari kiri ke kanan.' : 'Negatif; garis turun dari kiri ke kanan.'), w: W(gradL(D), T(`The gradient is ${D.dy > 0 ? 'positive' : 'negative'}, so the line ${D.dy > 0 ? 'rises' : 'falls'} from left to right.`, `Kecerunannya ${D.dy > 0 ? 'positif' : 'negatif'}, jadi garis itu ${D.dy > 0 ? 'naik' : 'turun'} dari kiri ke kanan.`)), sp: 's' })],
    ['e', (r, D) => ({ ask: T(`State the vertical change and the horizontal change, and hence find the gradient.`, `Nyatakan perubahan mencancang dan perubahan mengufuk, dan seterusnya cari kecerunan.`), a: T(`Vertical change ${D.dy}, horizontal change ${D.dx}; gradient $${mfmt(D.dy, D.dx)}$`, `Perubahan mencancang ${D.dy}, perubahan mengufuk ${D.dx}; kecerunan $${mfmt(D.dy, D.dx)}$`), w: W(T(`Vertical change $= ${D.dy}$, horizontal change $= ${D.dx}$.`, `Perubahan mencancang $= ${D.dy}$, perubahan mengufuk $= ${D.dx}$.`), `$\\dfrac{${D.dy}}{${D.dx}} = ${mfmt(D.dy, D.dx)}$`), sp: 's' })],
    ['e', (r, D) => ({ ask: T(`A second line is parallel to this one. What is the gradient of the second line?`, `Satu garis kedua adalah selari dengan garis ini. Apakah kecerunan garis kedua itu?`), a: T(`$${mfmt(D.dy, D.dx)}$ (parallel lines have equal gradients)`, `$${mfmt(D.dy, D.dx)}$ (garis selari mempunyai kecerunan yang sama)`), w: W(gradL(D), T('Parallel lines never meet, so they have the same gradient.', 'Garis selari tidak pernah bertemu, jadi kecerunannya sama.')), sp: 's' })],
    ['e', (r, D) => { const g = Fr.make(D.dy, D.dx); need(Math.abs(D.dy) !== Math.abs(D.dx)); const m = mcq(r, mfmt(D.dy, D.dx), [mfmt(D.dx, D.dy), mfmt(-D.dy, D.dx), mfmt(D.dy + 1, D.dx)]); return { ask: T(`Which of these is the gradient?<br>${m.q}`, `Yang manakah kecerunannya?<br>${m.q}`), a: T(m.ans), w: W(gradL(D), T('Take care: vertical change goes on top, not the other way round.', 'Berhati-hati: perubahan mencancang di atas, bukan sebaliknya.')), sp: 'xs' }; }],
    ['e', (r, D) => ({ ask: T(`Does the gradient change if the two points are taken in the opposite order? Explain with a calculation.`, `Adakah kecerunan berubah jika dua titik itu diambil dalam susunan yang bertentangan? Terangkan dengan satu pengiraan.`), a: T(`No: $\\dfrac{${-D.dy}}{${-D.dx}} = ${mfmt(D.dy, D.dx)}$, the same value.`, `Tidak: $\\dfrac{${-D.dy}}{${-D.dx}} = ${mfmt(D.dy, D.dx)}$, nilai yang sama.`), w: W(gradL(D), T(`Taking the points the other way round: $\\dfrac{${-D.dy}}{${-D.dx}} = ${mfmt(D.dy, D.dx)}$.`, `Mengambil titik dalam susunan bertentangan: $\\dfrac{${-D.dy}}{${-D.dx}} = ${mfmt(D.dy, D.dx)}$.`), T('Both the top and the bottom change sign, so the two minus signs cancel and the gradient is unchanged.', 'Kedua-dua pengangka dan penyebut bertukar tanda, jadi kedua-dua tanda tolak saling menghapus dan kecerunan tidak berubah.')), sp: 's' }), (p) => p.kind !== 'ramp'],
    ['e', (r, D) => { need(Math.abs(D.dy) !== Math.abs(D.dx)); const ok = r.chance(), g = ok ? mfmt(D.dy, D.dx) : r.pick([mfmt(D.dx, D.dy), mfmt(-D.dy, D.dx)]); need(ok || g !== mfmt(D.dy, D.dx)); return { ask: T(`True or false: the gradient is $${g}$.`, `Betul atau palsu: kecerunannya ialah $${g}$.`), a: ok ? T('True.', 'Betul.') : T(`False; the gradient is $${mfmt(D.dy, D.dx)}$.`, `Palsu; kecerunannya ialah $${mfmt(D.dy, D.dx)}$.`), w: W(gradL(D), ok ? T(`This is the value given, so the statement is true.`, `Inilah nilai yang diberi, jadi pernyataan itu betul.`) : T(`The value given, $${g}$, is different, so the statement is false.`, `Nilai yang diberi, $${g}$, adalah berbeza, jadi pernyataan itu palsu.`)), sp: 'xs' }; }],
    ['e', (r, D) => ({ ask: T(`Complete: gradient $= \\dfrac{\\text{vertical change}}{\\text{horizontal change}} = \\dfrac{\\square}{\\square} = \\square$`, `Lengkapkan: kecerunan $= \\dfrac{\\text{perubahan mencancang}}{\\text{perubahan mengufuk}} = \\dfrac{\\square}{\\square} = \\square$`), a: T(`$\\dfrac{${D.dy}}{${D.dx}} = ${mfmt(D.dy, D.dx)}$`), w: W(T(`The vertical change is $${D.dy}$ and the horizontal change is $${D.dx}$.`, `Perubahan mencancang ialah $${D.dy}$ dan perubahan mengufuk ialah $${D.dx}$.`), `$\\dfrac{${D.dy}}{${D.dx}} = ${mfmt(D.dy, D.dx)}$`), sp: 's' })],
    ['m', (r, D) => { need(gcd(Math.abs(D.dy), D.dx) > 1 && Fr.make(D.dy, D.dx).d > 1); return { ask: T(`Write the gradient as a fraction in its simplest form.`, `Tulis kecerunan sebagai pecahan dalam bentuk termudah.`), a: T(`$${mfmt(D.dy, D.dx)}$`), w: W(gradL(D), T(`Divide the top and the bottom by $${gcd(Math.abs(D.dy), D.dx)}$: $\\dfrac{${D.dy}}{${D.dx}} = ${mfmt(D.dy, D.dx)}$.`, `Bahagi pengangka dan penyebut dengan $${gcd(Math.abs(D.dy), D.dx)}$: $\\dfrac{${D.dy}}{${D.dx}} = ${mfmt(D.dy, D.dx)}$.`)), sp: 's' }; }, (p) => !p.gi && !p.un],
    ['m', (r, D) => { need([2, 4, 5, 8, 10, 20, 25, 50].includes(D.dx / gcd(Math.abs(D.dy), D.dx)) || [2, 4, 5, 8, 10, 20, 25].includes(Fr.make(D.dy, D.dx).d)); return { ask: T(`Write the gradient as a decimal.`, `Tulis kecerunan sebagai perpuluhan.`), a: T(`$${n(D.dy / D.dx)}$`), w: W(gradL(D), T(`As a decimal: $${mfmt(D.dy, D.dx)} = ${n(D.dy / D.dx)}$.`, `Dalam bentuk perpuluhan: $${mfmt(D.dy, D.dx)} = ${n(D.dy / D.dx)}$.`)), sp: 's' }; }, (p) => !p.gi],
    ['m', (r, D) => { const k = r.int(2, 5), s = D.dy < 0; if (D.kind === 'rate') { need(D.dy > 0 || Math.abs(D.dy) * k <= D.B[1]); return { ask: T(`By how much does the amount ${s ? 'decrease' : 'increase'} in ${D.dx * k} ${D.ctx[0]}?`, `Berapakah amaun ${s ? 'berkurang' : 'bertambah'} dalam ${D.dx * k} ${D.ctx[1]}?`), a: T(`${Math.abs(D.dy) * k} ${D.ctx[2]}`, `${Math.abs(D.dy) * k} ${D.ctx[3]}`), w: W(T(`In ${D.dx} ${D.ctx[0]} the amount changes by $${Math.abs(D.dy)}$ ${D.ctx[2]}.`, `Dalam ${D.dx} ${D.ctx[1]} amaun berubah sebanyak $${Math.abs(D.dy)}$ ${D.ctx[3]}.`), `$${Math.abs(D.dy)} \\times ${k} = ${Math.abs(D.dy) * k}$`), sp: 's' }; } return { ask: T(`How far does the line ${s ? 'fall' : 'rise'} for a horizontal change of ${D.dx * k} units?`, `Berapa jauhkah garis itu ${s ? 'turun' : 'naik'} bagi perubahan mengufuk sebanyak ${D.dx * k} unit?`), a: T(`${Math.abs(D.dy) * k} units`, `${Math.abs(D.dy) * k} unit`), w: W(gradL(D), T(`A horizontal change of $${D.dx}$ goes with a vertical change of $${Math.abs(D.dy)}$, and $${D.dx * k}$ is $${k}$ times as much.`, `Perubahan mengufuk $${D.dx}$ sepadan dengan perubahan mencancang $${Math.abs(D.dy)}$, dan $${D.dx * k}$ ialah $${k}$ kali ganda.`), `$${Math.abs(D.dy)} \\times ${k} = ${Math.abs(D.dy) * k}$`), sp: 's' }; }],
    ['m', (r, D) => { const k = r.int(2, 5), s = D.dy < 0; if (D.kind === 'rate') { need(D.dy > 0 || Math.abs(D.dy) * k <= D.B[1]); return { ask: T(`How long does it take for the amount to ${s ? 'decrease' : 'increase'} by ${Math.abs(D.dy) * k} ${D.ctx[2]}?`, `Berapa lamakah masa yang diambil untuk amaun itu ${s ? 'berkurang' : 'bertambah'} sebanyak ${Math.abs(D.dy) * k} ${D.ctx[3]}?`), a: T(`${D.dx * k} ${D.ctx[0]}`, `${D.dx * k} ${D.ctx[1]}`), w: W(T(`In ${D.dx} ${D.ctx[0]} the amount changes by $${Math.abs(D.dy)}$ ${D.ctx[2]}.`, `Dalam ${D.dx} ${D.ctx[1]} amaun berubah sebanyak $${Math.abs(D.dy)}$ ${D.ctx[3]}.`), `$${Math.abs(D.dy) * k} \\div ${Math.abs(D.dy)} = ${k}$`, `$${k} \\times ${D.dx} = ${D.dx * k}$`), sp: 's' }; } return { ask: T(`The line ${s ? 'falls' : 'rises'} ${Math.abs(D.dy) * k} units. What is the horizontal change?`, `Garis itu ${s ? 'turun' : 'naik'} ${Math.abs(D.dy) * k} unit. Berapakah perubahan mengufuk?`), a: T(`${D.dx * k} units`, `${D.dx * k} unit`), w: W(gradL(D), `$${Math.abs(D.dy) * k} \\div ${Math.abs(D.dy)} = ${k}$`, `$${k} \\times ${D.dx} = ${D.dx * k}$`), sp: 's' }; }],
    ['m', (r, D) => { const g2 = r.pick([[2, 1], [-2, 1], [1, 2], [-3, 1], [3, 2], [-1, 2], [4, 1], [-1, 3]]); const a1 = Math.abs(D.dy / D.dx), a2 = Math.abs(g2[0] / g2[1]); need(Math.abs(a1 - a2) > 1e-9); return { ask: T(`A second line has gradient $${gt(g2[0], g2[1])}$. Which of the two lines is steeper?`, `Satu garis kedua berkecerunan $${gt(g2[0], g2[1])}$. Yang manakah antara kedua-dua garis itu lebih curam?`), a: T(a1 > a2 ? 'The first line (larger $|m|$).' : 'The second line (larger $|m|$).', a1 > a2 ? 'Garis pertama ($|m|$ lebih besar).' : 'Garis kedua ($|m|$ lebih besar).'), w: W(gradL(D), T(`Ignore the signs: the first gradient has size $${n(round(a1, 4))}$ and the second has size $${n(round(a2, 4))}$.`, `Abaikan tanda: kecerunan pertama bersaiz $${n(round(a1, 4))}$ dan yang kedua bersaiz $${n(round(a2, 4))}$.`), T(`${a1 > a2 ? 'The first' : 'The second'} size is larger, so ${a1 > a2 ? 'the first' : 'the second'} line is steeper.`, `Saiz ${a1 > a2 ? 'pertama' : 'kedua'} lebih besar, jadi garis ${a1 > a2 ? 'pertama' : 'kedua'} lebih curam.`)), sp: 's' }; }],
    ['m', (r, D) => { need(Math.abs(D.dy) !== Math.abs(D.dx)); const t = r.int(0, 1); const w = [[mfmt(D.dx, D.dy), 'inverted the fraction (horizontal ÷ vertical)', 'menyongsangkan pecahan (mengufuk ÷ mencancang)'], [mfmt(-D.dy, D.dx), 'gave the wrong sign', 'memberi tanda yang salah']][t]; return { ask: T(`A student says the gradient is $${w[0]}$. Find the mistake and give the correct gradient.`, `Seorang pelajar berkata kecerunannya ialah $${w[0]}$. Cari kesilapannya dan berikan kecerunan yang betul.`), a: T(`The student ${w[1]}. Correct: $${mfmt(D.dy, D.dx)}$.`, `Pelajar itu ${w[2]}. Betul: $${mfmt(D.dy, D.dx)}$.`), w: SPM.lines(T(`The student ${w[1]}.`, `Pelajar itu ${w[2]}.`), gradL(D)), sp: 's' }; }],
    ['m', (r, D) => { need(D.kind === 'ramp' || D.kind === 'rate'); const s = D.dy < 0; return { ask: D.kind === 'ramp' ? T(`Find the gradient. What does it tell you about the slope for every 1 ${D.u[1]} across?`, `Cari kecerunan. Apakah yang diberitahunya tentang cerun bagi setiap 1 ${D.u[1]} melintang?`) : T(`Find the gradient of the graph and say what it means (include the units).`, `Cari kecerunan graf itu dan nyatakan maksudnya (sertakan unit).`), a: D.kind === 'ramp' ? T(`$${mfmt(D.dy, D.dx)}$: it ${s ? 'falls' : 'rises'} $${mfmt(Math.abs(D.dy), D.dx)}$ ${D.u[0]} for every 1 ${D.u[1]} across.`, `$${mfmt(D.dy, D.dx)}$: ia ${s ? 'turun' : 'naik'} $${mfmt(Math.abs(D.dy), D.dx)}$ ${D.u[0]} bagi setiap 1 ${D.u[1]} melintang.`) : T(`$${n(D.dy / D.dx)}$: ${s ? 'decreases' : 'increases'} by ${Math.abs(D.dy / D.dx)} ${D.u[0]} per ${D.ctx[0].replace(/s$/, '')}.`, `$${n(D.dy / D.dx)}$: ${s ? 'berkurang' : 'bertambah'} ${Math.abs(D.dy / D.dx)} ${D.ctx[3]} setiap ${D.ctx[1]}.`), w: W(gradL(D), D.kind === 'ramp' ? T(`So for every 1 ${D.u[1]} across it ${s ? 'falls' : 'rises'} $${mfmt(Math.abs(D.dy), D.dx)}$ ${D.u[0]}.`, `Jadi bagi setiap 1 ${D.u[1]} melintang ia ${s ? 'turun' : 'naik'} $${mfmt(Math.abs(D.dy), D.dx)}$ ${D.u[0]}.`) : T(`So the amount ${s ? 'decreases' : 'increases'} by $${n(Math.abs(D.dy / D.dx))}$ ${D.u[0]} per ${D.ctx[0].replace(/s$/, '')}.`, `Jadi amaun itu ${s ? 'berkurang' : 'bertambah'} $${n(Math.abs(D.dy / D.dx))}$ ${D.ctx[3]} setiap ${D.ctx[1]}.`)), sp: 's' }; }, (p) => p.kind === 'ramp' || p.kind === 'rate'],
    ['a', (r, D) => { need(D.A && D.kind !== 'ic'); const t = r.pick([-3, -2, 3, 4]), x3 = D.B[0] + t * D.dx, y3 = D.B[1] + t * D.dy; need(D.kind !== 'rate' || (x3 > 0 && y3 > 0)); return { ask: T(`The point $C(${x3}, k)$ lies on the same line. Find the value of $k$.`, `Titik $C(${x3}, k)$ terletak pada garis yang sama. Cari nilai $k$.`), a: T(`$k = ${y3}$`), w: W(gradL(D), T(`$C$ is on the same line, so the gradient from $${pt(D.B)}$ to $C$ is the same:`, `$C$ terletak pada garis yang sama, jadi kecerunan dari $${pt(D.B)}$ ke $C$ adalah sama:`), `$\\dfrac{k - ${par(D.B[1])}}{${x3} - ${par(D.B[0])}} = ${mfmt(D.dy, D.dx)}$`, `$k - ${par(D.B[1])} = ${t * D.dy}$`, `$k = ${y3}$`), sp: 'm' }; }, (p) => p.kind !== 'ramp' && p.kind !== 'ic'],
    ['a', (r, D) => { need(D.A && D.kind !== 'ic'); const on = r.chance(), t = r.pick([-2, 3, 4]), C = [D.B[0] + t * D.dx, D.B[1] + t * D.dy + (on ? 0 : r.pick([-1, 1, 2]))]; need(D.kind !== 'rate' || (C[0] > 0 && C[1] > 0)); return { ask: T(`Use gradients to decide whether $C${pt(C)}$ lies on the same line.`, `Gunakan kecerunan untuk menentukan sama ada $C${pt(C)}$ terletak pada garis yang sama.`), a: T(`Gradient from the second point to $C$: $${gt(C[1] - D.B[1], C[0] - D.B[0])}$, ${on ? 'equal to' : 'not equal to'} $${mfmt(D.dy, D.dx)}$; so $C$ ${on ? 'is' : 'is not'} on the line.`, `Kecerunan dari titik kedua ke $C$: $${gt(C[1] - D.B[1], C[0] - D.B[0])}$, ${on ? 'sama dengan' : 'tidak sama dengan'} $${mfmt(D.dy, D.dx)}$; jadi $C$ ${on ? 'terletak' : 'tidak terletak'} pada garis itu.`), w: W(gradL(D), T(`Gradient from $${pt(D.B)}$ to $C$: $\\dfrac{${C[1]} - ${par(D.B[1])}}{${C[0]} - ${par(D.B[0])}} = ${gt(C[1] - D.B[1], C[0] - D.B[0])}$`, `Kecerunan dari $${pt(D.B)}$ ke $C$: $\\dfrac{${C[1]} - ${par(D.B[1])}}{${C[0]} - ${par(D.B[0])}} = ${gt(C[1] - D.B[1], C[0] - D.B[0])}$`), on ? T('The two gradients are equal, so the three points lie on one straight line.', 'Kedua-dua kecerunan sama, jadi ketiga-tiga titik terletak pada satu garis lurus.') : T('The two gradients are different, so $C$ is not on the line.', 'Kedua-dua kecerunan berbeza, jadi $C$ tidak terletak pada garis itu.')), sp: 'm' }; }, (p) => p.kind !== 'ramp' && p.kind !== 'ic'],
    ['a', (r, D) => { need(D.A); const t = r.int(1, 3), P0 = [r.int(-4, 4), r.int(-4, 4)], E = [P0[0] + t * D.dx, P0[1] + t * D.dy]; return { ask: T(`A second line through $D${pt(P0)}$ is parallel to this line and passes through $E(${E[0]}, k)$. Find $k$.`, `Satu garis kedua yang melalui $D${pt(P0)}$ selari dengan garis ini dan melalui $E(${E[0]}, k)$. Cari $k$.`), a: T(`$k = ${E[1]}$`), w: W(gradL(D), T(`Parallel lines have the same gradient, so the line through $D$ and $E$ also has gradient $${mfmt(D.dy, D.dx)}$.`, `Garis selari mempunyai kecerunan yang sama, jadi garis melalui $D$ dan $E$ juga berkecerunan $${mfmt(D.dy, D.dx)}$.`), `$\\dfrac{k - ${par(P0[1])}}{${E[0]} - ${par(P0[0])}} = ${mfmt(D.dy, D.dx)}$`, `$k - ${par(P0[1])} = ${t * D.dy}$`, `$k = ${E[1]}$`), sp: 'm' }; }, (p) => p.kind === 'pt' || p.kind === 'fig' || p.kind === 'tab'],
    ['a', (r, D) => { need(D.A && D.kind !== 'ic'); const t = r.pick([-2, 3, 4]), P1 = [D.B[0] + t * D.dx, D.B[1] + t * D.dy]; need(D.kind !== 'rate' || (P1[0] > 0 && P1[1] > 0)); return { ask: T(`Give the coordinates of another point on the line, and use gradients to check that it lies on it.`, `Berikan koordinat satu lagi titik pada garis itu, dan gunakan kecerunan untuk menyemak bahawa ia terletak pada garis itu.`), a: T(`For example $${pt(P1)}$: gradient from the second point is $${gt(P1[1] - D.B[1], P1[0] - D.B[0])}$, the same as $${mfmt(D.dy, D.dx)}$.`, `Contohnya $${pt(P1)}$: kecerunan dari titik kedua ialah $${gt(P1[1] - D.B[1], P1[0] - D.B[0])}$, sama dengan $${mfmt(D.dy, D.dx)}$.`), w: W(gradL(D), T(`Starting at $${pt(D.B)}$, add $${t * D.dx}$ to $x$ and $${t * D.dy}$ to $y$ to reach $${pt(P1)}$.`, `Bermula di $${pt(D.B)}$, tambah $${t * D.dx}$ kepada $x$ dan $${t * D.dy}$ kepada $y$ untuk sampai ke $${pt(P1)}$.`), T(`Check: $\\dfrac{${P1[1]} - ${par(D.B[1])}}{${P1[0]} - ${par(D.B[0])}} = ${gt(P1[1] - D.B[1], P1[0] - D.B[0])}$, the same gradient.`, `Semak: $\\dfrac{${P1[1]} - ${par(D.B[1])}}{${P1[0]} - ${par(D.B[0])}} = ${gt(P1[1] - D.B[1], P1[0] - D.B[0])}$, kecerunan yang sama.`)), sp: 'm' }; }, (p) => p.kind !== 'ramp' && p.kind !== 'ic'],
    ['a', (r, D) => ({ ask: T(`Find the gradient using $m = -\\dfrac{b}{a}$, where $a$ is the $x$-intercept and $b$ is the $y$-intercept, and check it using the two points.`, `Cari kecerunan menggunakan $m = -\\dfrac{b}{a}$, dengan $a$ ialah pintasan-$x$ dan $b$ ialah pintasan-$y$, dan semak dengan menggunakan dua titik itu.`), a: T(`$${mfmt(D.dy, D.dx)}$`), w: W(T(`Here $a = ${D.B[0]}$ and $b = ${D.A[1]}$, so $m = -\\dfrac{${par(D.A[1])}}{${D.B[0]}} = ${mfmt(D.dy, D.dx)}$.`, `Di sini $a = ${D.B[0]}$ dan $b = ${D.A[1]}$, jadi $m = -\\dfrac{${par(D.A[1])}}{${D.B[0]}} = ${mfmt(D.dy, D.dx)}$.`), T('Check with the two points:', 'Semak dengan dua titik itu:'), gradL(D)), sp: 's' }), (p) => p.kind === 'ic'],
  ];
  const lvNum = { e: 0, m: 1, a: 2 };
  const fwk = { e: [], m: [], a: [] };
  for (const rep of REPS) for (const tk of TK) {
    if (tk[2] && !tk[2](rep)) continue; // this task cannot be asked about this representation
    const lv = ['e', 'm', 'a'][Math.max(lvNum[rep.lv], lvNum[tk[0]])];
    fwk[lv].push((r) => {
      const D = rep.make(r), t = tk[1](r, D);
      return { q: Q(D.desc, ' ', t.ask), fig: D.fig, a: t.a, w: t.w, sp: t.sp };
    });
  }
  SPM.extend('F2-10.1', { e: e101.concat(fwk.e), m: m101.concat(fwk.m), a: a101.concat(fwk.a) });
/*END*/
})();
