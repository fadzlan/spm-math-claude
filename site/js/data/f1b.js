/* Form 1 – Chapters 6 to 9 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, gcd, round, Fr, poly, lin, need, retry } = SPM;
  const S = SPM.svg;
  const F = SPM.figs;
  const T = (e, m) => ({ en: e, ms: m === undefined ? e : m });
  const par = SPM.par;
  const fr = (a, b) => Fr.make(a, b);
  const frT = Fr.tex;
  const NTS = SPM.NTS;
  const withNTS = (q) => T(q.en + ' ' + NTS.en, q.ms + ' ' + NTS.ms);
  const cases = (a1, b1, c1, a2, b2, c2) => `\\begin{cases} ${poly([[a1, 'x'], [b1, 'y']])} = ${c1} \\\\ ${poly([[a2, 'x'], [b2, 'y']])} = ${c2} \\end{cases}`;
  const eq = (a, b, c) => `${poly([[a, 'x'], [b, 'y']])} = ${c}`;
  const NM = (r) => r.pair();

  /* =============================================================== 6 */
  const g61e = [
    (r) => {
      const A = r.int(2, 5), B = r.int(1, 9), C = r.int(10, 30), D = r.int(2, 5), E = r.int(1, 8), G = r.int(2, 9), H = r.int(2, 12);
      const opts = [
        [`${A}x + ${B} = ${C}`, true], [`y = ${D}x - ${E}`, true], [`x^2 - ${B} = ${C}`, false],
        [`\\dfrac{${G}}{x} = ${A}`, false], [`xy = ${H}`, false], [`\\dfrac{x}{${A}} - ${E} = ${D}`, true],
      ];
      const four = r.shuffle(r.shuffle(opts.filter((o) => o[1])).slice(0, 2).concat(r.shuffle(opts.filter((o) => !o[1])).slice(0, 2)));
      const L = ['A', 'B', 'C', 'D'];
      const list = four.map((o, i) => `(${L[i]}) $${o[0]}$`).join('\\quad ');
      const ans = four.map((o, i) => (o[1] ? L[i] : null)).filter(Boolean).join(', ');
      return { q: T(`Which of the following are linear equations? ${list}`, `Antara yang berikut, yang manakah persamaan linear? ${list}`), a: T(ans), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 5), x = r.int(1, 6), b = r.int(1, 9);
      const good = r.chance();
      const c = a * x + b;
      const test = good ? x : x + r.int(1, 3);
      return { q: T(`Is $x = ${test}$ a solution of the equation $${a}x + ${b} = ${c}$? Show your working.`, `Adakah $x = ${test}$ suatu penyelesaian bagi persamaan $${a}x + ${b} = ${c}$? Tunjukkan langkah kerja anda.`), a: T(good ? 'Yes' : 'No', good ? 'Ya' : 'Tidak'), w: T(`LHS $= ${a}(${test}) + ${b} = ${a * test + b}$, RHS $= ${c}$`), sp: 's' };
    },
  ];
  const g61m = [
    (r) => {
      const a = r.int(2, 6), b = r.int(1, 9), c = r.int(15, 40), k = r.int(2, 9);
      const f = r.pick([
        [T(`A number $x$ is multiplied by ${a} and then ${b} is added. The result is ${c}.`, `Suatu nombor $x$ didarab dengan ${a} dan kemudian ${b} ditambah. Hasilnya ialah ${c}.`), `${a}x + ${b} = ${c}`],
        [T(`${b} is subtracted from ${a} times a number $x$. The result is ${c}.`, `${b} ditolak daripada ${a} kali suatu nombor $x$. Hasilnya ialah ${c}.`), `${a}x - ${b} = ${c}`],
        [T(`The sum of a number $x$ and ${b} is divided by ${a} to give ${k}.`, `Hasil tambah suatu nombor $x$ dan ${b} dibahagi dengan ${a} memberikan ${k}.`), `\\dfrac{x + ${b}}{${a}} = ${k}`],
      ]);
      return { q: T(`Write an equation for the statement: ${f[0].en}`, `Tulis satu persamaan bagi pernyataan: ${f[0].ms}`), a: T(`$${f[1]}$`), sp: 's' };
    },
    (r) => {
      const p = r.int(3, 9), c = r.int(2, 5), n1 = r.int(2, 5);
      const [nm] = NM(r);
      const tot = p * n1 + c;
      return { q: T(`${nm} buys ${n1} pens costing RM$x$ each and a ruler costing RM${c}. The total cost is RM${tot}. Form an equation and find $x$.`, `${nm} membeli ${n1} batang pen berharga RM$x$ sebatang dan sebuah pembaris berharga RM${c}. Jumlah kos ialah RM${tot}. Bentukkan satu persamaan dan cari $x$.`), a: T(`$${n1}x + ${c} = ${tot}$; $x = ${p}$`), sp: 's' };
    },
  ];
  const g61a = [
    (r) => {
      const a = r.int(2, 4), b = r.int(5, 20), c = r.int(2, 4);
      const x = r.int(10, 30);
      // angles on a straight line: (a x + b) + (c x + d) = 180, choose x then d
      const d = 180 - a * x - b - c * x;
      need(d > -60 && d < 60 && a * x + b < 175 && c * x + d > 5);
      return { q: T(`Two angles on a straight line are $(${lin(a, b)})^\\circ$ and $(${lin(c, d)})^\\circ$. Form an equation and find the value of $x$.`, `Dua sudut pada satu garis lurus ialah $(${lin(a, b)})^\\circ$ dan $(${lin(c, d)})^\\circ$. Bentukkan satu persamaan dan cari nilai $x$.`), a: T(`$${lin(a + c, b + d)} = 180$; $x = ${x}$`), sp: 's' };
    },
    (r) => {
      const x = r.int(3, 9), a = r.int(2, 4), b = r.int(1, 6);
      const w = r.int(2, 5);
      const per = 2 * ((a * x + b) + (x + w));
      return { q: T(`A rectangle has length $(${lin(a, b)})$ cm and width $(x + ${w})$ cm. Its perimeter is ${per} cm. Form an equation and find $x$.`, `Sebuah segi empat tepat mempunyai panjang $(${lin(a, b)})$ cm dan lebar $(x + ${w})$ cm. Perimeternya ialah ${per} cm. Bentukkan satu persamaan dan cari $x$.`), a: T(`$2[(${lin(a, b)}) + (x + ${w})] = ${per}$; $x = ${x}$`), sp: 's' };
    },
    (r) => {
      const x = r.int(8, 14), k = r.int(3, 4);
      const [nm] = NM(r);
      const yrs = r.int(2, 6);
      const total = k * x + x + 2 * yrs;
      return {
        q: T(`${nm} is $x$ years old. ${nm}'s mother is ${k} times as old. The sum of their ages ${yrs} years from now will be ${total}. Form an equation and find $x$.`, `${nm} berumur $x$ tahun. Ibu ${nm} berumur ${k} kali ganda umur ${nm}. Jumlah umur mereka ${yrs} tahun lagi ialah ${total}. Bentukkan satu persamaan dan cari $x$.`),
        a: T(`$(x + ${yrs}) + (${k}x + ${yrs}) = ${total}$; $x = ${x}$`), sp: 's',
      };
    },
  ];

  /* ---- 6.2 one variable */
  const g62e = [
    (r) => { const x = r.int(1, 15), a = r.int(1, 12); return { q: T(`Solve $x + ${a} = ${x + a}$.`, `Selesaikan $x + ${a} = ${x + a}$.`), a: T(`$x = ${x}$`), sp: 'xs' }; },
    (r) => { const x = r.int(2, 12), a = r.int(2, 9); return { q: T(`Solve $${a}x = ${a * x}$.`, `Selesaikan $${a}x = ${a * x}$.`), a: T(`$x = ${x}$`), sp: 'xs' }; },
    (r) => { const x = r.int(2, 10), a = r.int(2, 6); return { q: T(`Solve $\\dfrac{x}{${a}} = ${x}$.`, `Selesaikan $\\dfrac{x}{${a}} = ${x}$.`), a: T(`$x = ${a * x}$`), sp: 'xs' }; },
    (r) => { const x = r.int(1, 10), a = r.int(2, 6), b = r.int(1, 9); const s = r.sign(); return { q: T(`Solve $${a}x ${s < 0 ? '-' : '+'} ${b} = ${a * x + s * b}$.`, `Selesaikan $${a}x ${s < 0 ? '-' : '+'} ${b} = ${a * x + s * b}$.`), a: T(`$x = ${x}$`), w: T(`$${a}x = ${a * x}$`), sp: 's' }; },
  ];
  const g62m = [
    (r) => {
      const x = r.int(-6, 9), a = r.int(3, 7), c = r.int(1, a - 1), b = r.int(-9, 9), d = (a - c) * x + b;
      need(x !== 0);
      return { q: T(`Solve $${lin(a, b)} = ${lin(c, d)}$.`, `Selesaikan $${lin(a, b)} = ${lin(c, d)}$.`), a: T(`$x = ${x}$`), w: T(`$${a - c}x = ${d - b}$`), sp: 'm' };
    },
    (r) => {
      const x = r.int(-5, 8), a = r.int(2, 6), b = r.int(1, 6), s = r.sign();
      return { q: T(`Solve $${a}(x ${s < 0 ? '-' : '+'} ${b}) = ${a * (x + s * b)}$.`, `Selesaikan $${a}(x ${s < 0 ? '-' : '+'} ${b}) = ${a * (x + s * b)}$.`), a: T(`$x = ${x}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 5), x = r.int(-8, 8) * a, b = r.int(1, 6);
      const y = x / a;
      return { q: T(`Solve $\\dfrac{x}{${a}} + ${b} = ${y + b}$.`, `Selesaikan $\\dfrac{x}{${a}} + ${b} = ${y + b}$.`), a: T(`$x = ${x}$`), sp: 'm' };
    },
    (r) => {
      // answer a fraction
      const a = r.int(2, 6), b = r.int(2, 9), c = r.int(1, 12);
      const x = fr(c - b, a);
      need(x.d !== 1);
      return { q: T(`Solve $${a}x + ${b} = ${c}$.`, `Selesaikan $${a}x + ${b} = ${c}$.`), a: T(`$x = ${frT(x)}$`), sp: 'm' };
    },
  ];
  const g62a = [
    (r) => {
      // (x+p)/q = (r x + s)/t with integer solution
      const x = r.int(-4, 8);
      const q = r.pick([2, 3, 4]), t = r.pick([3, 5, 6]);
      need(q !== t);
      const p = r.int(1, 6), rr = r.int(1, 4);
      // (x+p)/q = (rr x + s)/t -> choose s so that equality holds: t(x+p) = q(rr x + s)  => s = (t(x+p) - q rr x)/q
      const num = t * (x + p) - q * rr * x;
      need(num % q === 0);
      const s = num / q;
      need(Math.abs(s) < 12 && s !== 0);
      return { q: T(`Solve $\\dfrac{x + ${p}}{${q}} = \\dfrac{${lin(rr, s)}}{${t}}$.`, `Selesaikan $\\dfrac{x + ${p}}{${q}} = \\dfrac{${lin(rr, s)}}{${t}}$.`), a: T(`$x = ${x}$`), w: T(`Cross-multiply: $${t}(x + ${p}) = ${q}(${lin(rr, s)})$`, `Darab silang: $${t}(x + ${p}) = ${q}(${lin(rr, s)})$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 7), b = r.int(1, 9), c = r.int(2, 7), d = r.int(1, 9);
      need(a !== c);
      const x = fr(d - b, a + c);
      need(x.n !== 0);
      return { q: T(`Solve $${lin(a, b)} = ${lin(-c, d)}$. Give your answer as a fraction in its simplest form if necessary.`, `Selesaikan $${lin(a, b)} = ${lin(-c, d)}$. Berikan jawapan sebagai pecahan dalam bentuk termudah jika perlu.`), a: T(`$x = ${frT(x)}$`), sp: 'm' };
    },
    (r) => {
      const x = r.int(2, 9), a = r.int(2, 5), b = r.int(2, 5);
      const [nm] = NM(r);
      const total = x + (x + a) + (x + 2 * a);
      return { q: T(`The sum of three numbers is ${total}. The second is ${a} more than the first and the third is ${a} more than the second. Form an equation and find the three numbers.`, `Hasil tambah tiga nombor ialah ${total}. Nombor kedua lebih ${a} daripada nombor pertama dan nombor ketiga lebih ${a} daripada nombor kedua. Bentukkan satu persamaan dan cari ketiga-tiga nombor itu.`), a: T(`$x + (x + ${a}) + (x + ${2 * a}) = ${total}$; ${x}, ${x + a}, ${x + 2 * a}`, `$x + (x + ${a}) + (x + ${2 * a}) = ${total}$; ${x}, ${x + a}, ${x + 2 * a}`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 8), b = r.int(1, 9), c = r.int(2, 9), d = r.int(1, 9);
      need(a !== c && (d - b) % (a - c) !== 0);
      const x = fr(d - b, a - c);
      return { q: T(`Solve $${lin(a, b)} = ${lin(c, d)}$.`, `Selesaikan $${lin(a, b)} = ${lin(c, d)}$.`), a: T(`$x = ${frT(x)}$`), sp: 'm' };
    },
  ];

  /* ---- 6.3 two variables: ordered pairs */
  const g63e = [
    (r) => {
      const a = r.int(2, 4), b = r.int(1, 3), x = r.int(1, 4), y = r.int(1, 5);
      const c = a * x + b * y;
      const good = r.chance();
      const tx = good ? x : x + 1, ty = y;
      return { q: T(`Is $(${tx}, ${ty})$ a solution of $${a}x + ${b === 1 ? '' : b}y = ${c}$?`, `Adakah $(${tx}, ${ty})$ satu penyelesaian bagi $${a}x + ${b === 1 ? '' : b}y = ${c}$?`), a: T(good ? 'Yes' : 'No', good ? 'Ya' : 'Tidak'), w: T(`$${a}(${tx}) + ${b}(${ty}) = ${a * tx + b * ty}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(1, 4), b = r.int(1, 3), x = r.int(1, 5), y = r.int(0, 5);
      const c = a * x + b * y;
      const x2 = r.int(0, 5);
      need((c - a * x2) % b === 0);
      return { q: T(`Given $${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${c}$, find the value of $y$ when $x = ${x2}$.`, `Diberi $${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${c}$, cari nilai $y$ apabila $x = ${x2}$.`), a: T(`$y = ${(c - a * x2) / b}$`), sp: 's' };
    },
  ];
  const g63m = [
    (r) => {
      const a = r.int(1, 3), b = r.int(1, 3), x0 = r.int(-2, 2), y0 = r.int(-2, 3);
      const c = a * x0 + b * y0;
      const xs = [-2, 0, 2];
      need(xs.every((x) => (c - a * x) % b === 0));
      const ys = xs.map((x) => (c - a * x) / b);
      const tab = SPM.table([['$x$', ...xs.map((v) => '$' + v + '$')], ['$y$', ...xs.map(() => '')]], { rowHead: false });
      return { q: T(`Complete the table of values for $${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${c}$.`, `Lengkapkan jadual nilai bagi $${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${c}$.`), fig: undefined, tab, a: T(`$y = ${ys.join(', ')}$ for $x = ${xs.join(', ')}$`, `$y = ${ys.join(', ')}$ bagi $x = ${xs.join(', ')}$`), sp: 's' };
    },
    (r) => {
      const p = r.int(3, 8), c = r.int(2, 6);
      const x = r.int(2, 5), y = r.int(2, 5);
      const tot = p * x + c * y;
      return { q: T(`A shop sells notebooks at RM${p} each and pens at RM${c} each. A customer buys $x$ notebooks and $y$ pens and pays RM${tot}. Write an equation in $x$ and $y$, and state one possible pair $(x, y)$.`, `Sebuah kedai menjual buku nota pada harga RM${p} sebuah dan pen pada harga RM${c} sebatang. Seorang pelanggan membeli $x$ buah buku nota dan $y$ batang pen dan membayar RM${tot}. Tulis satu persamaan dalam $x$ dan $y$, dan nyatakan satu pasangan $(x, y)$ yang mungkin.`), a: T(`$${p}x + ${c}y = ${tot}$; e.g. $(${x}, ${y})$`), sp: 's' };
    },
  ];
  // attach table into the question text for those generators that provide one
  const withTable = (fn) => (r, ctx) => {
    const q = fn(r, ctx);
    if (q.tab) q.q = T(q.q.en + '<br>' + q.tab, q.q.ms + '<br>' + q.tab);
    delete q.tab;
    return q;
  };
  g63m[0] = withTable(g63m[0]);
  const g63a = [
    (r) => {
      const x = r.int(1, 4), y = r.int(-3, 3), b = r.int(2, 5);
      const k = r.int(2, 6);
      const c = k * x + b * y;
      return { q: T(`Given that $(${x}, ${y})$ is a solution of $kx + ${b}y = ${c}$, find the value of $k$.`, `Diberi bahawa $(${x}, ${y})$ ialah satu penyelesaian bagi $kx + ${b}y = ${c}$, cari nilai $k$.`), a: T(`$k = ${k}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(1, 3), b = r.int(2, 4);
      const c = r.int(8, 16);
      const sols = [];
      for (let x = 1; x < c; x++) for (let y = 1; y < c; y++) if (a * x + b * y === c) sols.push(`(${x}, ${y})`);
      need(sols.length >= 2 && sols.length <= 6);
      return { q: T(`List all the ordered pairs $(x, y)$ of positive integers that satisfy $${a === 1 ? '' : a}x + ${b}y = ${c}$.`, `Senaraikan semua pasangan tertib $(x, y)$ integer positif yang memenuhi $${a === 1 ? '' : a}x + ${b}y = ${c}$.`), a: T(`$${sols.join(',\\ ')}$`), sp: 'm' };
    },
  ];

  /* ---- 6.4 graphs of linear equations */
  const blankPlane = (x0, x1, y0, y1) => S.plane({ x: [x0, x1], y: [y0, y1], scale: 20 });
  const g64e = [
    (r) => {
      const k = r.nz(-4, 4);
      const vert = r.chance();
      const fig = vert ? S.plane({ x: [-5, 5], y: [-4, 4], scale: 22, vlines: [k] }) : S.plane({ x: [-5, 5], y: [-4, 4], scale: 22, lines: [{ m: 0, c: k }] });
      return { q: T('State the equation of the straight line shown.', 'Nyatakan persamaan garis lurus yang ditunjukkan.'), fig, a: T(`$${vert ? 'x' : 'y'} = ${k}$`), sp: 'xs' };
    },
    (r) => {
      const k = r.nz(-5, 5);
      const vert = r.chance();
      const eqn = `${vert ? 'x' : 'y'} = ${k}`;
      return { q: T(`Is the line $${eqn}$ horizontal or vertical? State one point that lies on it.`, `Adakah garis $${eqn}$ mengufuk atau mencancang? Nyatakan satu titik yang terletak pada garis itu.`), a: vert ? T(`Vertical; e.g. $(${k}, 2)$`, `Mencancang; cth. $(${k}, 2)$`) : T(`Horizontal; e.g. $(2, ${k})$`, `Mengufuk; cth. $(2, ${k})$`), sp: 's' };
    },
    (r) => {
      const m = r.nz(-3, 3), c = r.int(-2, 2);
      const xs = [-1, 0, 1, 2];
      const ys = xs.map((x) => m * x + c);
      const tab = SPM.table([['$x$', ...xs.map((v) => '$' + v + '$')], ['$y$', ...xs.map(() => '')]]);
      return { q: T(`Complete the table for $y = ${poly([[m, 'x'], [c, '']])}$. Then plot the points and draw the straight line on the Cartesian plane.<br>${tab}`, `Lengkapkan jadual bagi $y = ${poly([[m, 'x'], [c, '']])}$. Kemudian plot titik-titik dan lukis garis lurus pada satah Cartes.<br>${tab}`), fig: blankPlane(-3, 3, -5, 5), a: T(`$y = ${ys.join(', ')}$; points $${xs.map((x, i) => '(' + x + ',' + ys[i] + ')').join(', ')}$`, `$y = ${ys.join(', ')}$; titik $${xs.map((x, i) => '(' + x + ',' + ys[i] + ')').join(', ')}$`), sp: 'xs' };
    },
  ];
  const g64m = [
    (r) => {
      const m = r.pick([-2, -1, 1, 2]), c = r.int(-2, 2);
      const fig = S.plane({ x: [-5, 5], y: [-5, 5], scale: 22, lines: [{ m, c }], pts: [{ x: 0, y: c, l: '' }, { x: 1, y: m + c, l: '' }] });
      const eq_ = `y = ${poly([[m, 'x'], [c, '']])}`;
      const xi = m !== 0 ? -c / m : null;
      const yesPt = r.int(-2, 2);
      const on = r.chance();
      const P = [yesPt, m * yesPt + c + (on ? 0 : r.pick([1, -1, 2]))];
      return {
        q: T(`The straight line $${eq_}$ is drawn below. (a) State the $y$-intercept. (b) Determine whether the point $(${P[0]}, ${P[1]})$ lies on the line.`, `Garis lurus $${eq_}$ dilukis di bawah. (a) Nyatakan pintasan-$y$. (b) Tentukan sama ada titik $(${P[0]}, ${P[1]})$ terletak pada garis itu.`),
        fig, a: T(`(a) $${c}$ (b) ${on ? 'Yes' : 'No'}`, `(a) $${c}$ (b) ${on ? 'Ya' : 'Tidak'}`), w: T(`$${m}(${yesPt}) + (${c}) = ${m * yesPt + c}$`), sp: 's',
      };
    },
    (r) => {
      const a = r.int(1, 3), b = r.int(1, 3);
      const x0 = r.int(1, 3), y0 = r.int(1, 3);
      const c = a * x0 + b * y0;
      need(c % a === 0 && c % b === 0);
      return { q: T(`Find the intercepts on the $x$-axis and the $y$-axis of the line $${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${c}$.`, `Cari pintasan pada paksi-$x$ dan paksi-$y$ bagi garis $${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${c}$.`), a: T(`$x$-intercept: $${c / a}$; $y$-intercept: $${c / b}$`, `Pintasan-$x$: $${c / a}$; pintasan-$y$: $${c / b}$`), w: T(`Put $y = 0$ then $x = 0$`, `Ambil $y = 0$ kemudian $x = 0$`), sp: 's' };
    },
    (r) => {
      const m = r.pick([-1, 1, 2, -2]), c = r.int(-3, 3);
      const xs = [-2, -1, 0, 1, 2];
      const ys = xs.map((x) => m * x + c);
      const tab = SPM.table([['$x$', ...xs.map((v) => '$' + v + '$')], ['$y$', ...xs.map(() => '')]]);
      return { q: T(`Complete the table of values for $y = ${poly([[m, 'x'], [c, '']])}$ and draw its graph. State the coordinates of the point where the line crosses the $x$-axis or the $y$-axis. <br>${tab}`, `Lengkapkan jadual nilai bagi $y = ${poly([[m, 'x'], [c, '']])}$ dan lukis grafnya. Nyatakan koordinat titik apabila garis itu menyilang paksi-$x$ atau paksi-$y$.<br>${tab}`), fig: blankPlane(-4, 4, -6, 6), a: T(`$y = ${ys.join(', ')}$; crosses the $y$-axis at $(0, ${c})$`, `$y = ${ys.join(', ')}$; menyilang paksi-$y$ di $(0, ${c})$`), sp: 'xs' };
    },
  ];
  const g64a = [
    (r) => {
      const m = r.pick([-2, -1, 1, 2]), c = r.int(-3, 3);
      const k = r.int(-3, 3);
      const xi = (k - c) / m;
      need(Number.isInteger(xi) && Math.abs(xi) <= 4);
      const fig = S.plane({ x: [-5, 5], y: [-5, 5], scale: 22, lines: [{ m, c }, { m: 0, c: k, dash: true }], pts: [{ x: xi, y: k, l: 'P' }] });
      return { q: T(`The diagram shows the line $y = ${poly([[m, 'x'], [c, '']])}$ and the horizontal line $y = ${k}$. Write down the coordinates of their point of intersection $P$.`, `Rajah menunjukkan garis $y = ${poly([[m, 'x'], [c, '']])}$ dan garis mengufuk $y = ${k}$. Tuliskan koordinat titik persilangan $P$ bagi kedua-dua garis itu.`), fig, a: T(`$P = (${xi}, ${k})$`), sp: 's' };
    },
    (r) => {
      const xI = r.int(2, 5), yI = r.int(2, 5);
      // line px + qy = l passes (xI,0) and (0,yI): choose l so that p = l/xI and q = l/yI are integers
      const l = SPM.lcm(xI, yI) * r.int(1, 2);
      const p = l / xI, q = l / yI;
      return { q: T(`The line $px + qy = ${l}$ cuts the $x$-axis at $(${xI}, 0)$ and the $y$-axis at $(0, ${yI})$. Find the values of $p$ and $q$.`, `Garis $px + qy = ${l}$ memotong paksi-$x$ di $(${xI}, 0)$ dan paksi-$y$ di $(0, ${yI})$. Cari nilai $p$ dan $q$.`), a: T(`$p = ${p}$, $q = ${q}$`), w: T(`$${xI}p = ${l}$ and $${yI}q = ${l}$`), sp: 's' };
    },
    (r) => {
      const m = r.pick([1, 2]), c = r.int(1, 3);
      const p = r.int(1, 3);
      const y = m * p + c;
      return { q: T(`On the same axes, draw the lines $y = ${poly([[m, 'x'], [c, '']])}$ and $x = ${p}$. Write down the coordinates of the point where the two lines meet, and explain why this point satisfies both equations.`, `Pada paksi yang sama, lukis garis $y = ${poly([[m, 'x'], [c, '']])}$ dan $x = ${p}$. Tuliskan koordinat titik pertemuan kedua-dua garis dan terangkan mengapa titik itu memenuhi kedua-dua persamaan.`), fig: blankPlane(-3, 5, -3, 8), a: T(`$(${p}, ${y})$: it lies on both lines`, `$(${p}, ${y})$: ia terletak pada kedua-dua garis`), sp: 'xs' };
    },
  ];

  /* ---- 6.5 & 6.6 simultaneous equations */
  function sysFrom(r, opts) {
    opts = opts || {};
    return retry(() => {
      const p = opts.p !== undefined ? opts.p : r.int(-5, 6),
        q = opts.q !== undefined ? opts.q : r.int(-5, 6);
      const R = opts.range || 4;
      const a1 = r.nz(-R, R), b1 = r.nz(-R, R), a2 = r.nz(-R, R), b2 = r.nz(-R, R);
      const det = a1 * b2 - a2 * b1;
      need(det !== 0);
      const c1 = a1 * p + b1 * q, c2 = a2 * p + b2 * q;
      return { a1, b1, c1, a2, b2, c2, p, q };
    });
  }
  const showSys = (s) => `\\begin{cases} ${eq(s.a1, s.b1, s.c1)} \\\\ ${eq(s.a2, s.b2, s.c2)} \\end{cases}`;
  const g65e = [
    (r) => {
      const p = r.int(2, 8), q = r.int(1, p - 1);
      return { q: T(`The sum of two numbers $x$ and $y$ is ${p + q} and their difference is ${p - q}. Write two linear equations for this situation.`, `Hasil tambah dua nombor $x$ dan $y$ ialah ${p + q} dan beza antara kedua-duanya ialah ${p - q}. Tulis dua persamaan linear bagi situasi ini.`), a: T(`$x + y = ${p + q}$, $x - y = ${p - q}$`), sp: 's' };
    },
    (r) => {
      const p = r.int(-3, 4), q = r.int(-3, 4);
      const m1 = r.pick([1, 2, -1, -2]), m2 = r.pick([1, -1, 3, -3, 2, -2]);
      need(m1 !== m2);
      // lines y = m1 (x - p) + q  and y = m2 (x - p) + q  intersect at (p,q)
      const c1 = q - m1 * p, c2 = q - m2 * p;
      need(Math.abs(c1) <= 4 && Math.abs(c2) <= 4);
      const fig = S.plane({ x: [-5, 5], y: [-5, 5], scale: 22, lines: [{ m: m1, c: c1 }, { m: m2, c: c2 }], pts: [{ x: p, y: q, l: '' }] });
      return { q: T(`The two lines $y = ${poly([[m1, 'x'], [c1, '']])}$ and $y = ${poly([[m2, 'x'], [c2, '']])}$ are drawn below. Write down the solution of the simultaneous equations.`, `Dua garis $y = ${poly([[m1, 'x'], [c1, '']])}$ dan $y = ${poly([[m2, 'x'], [c2, '']])}$ dilukis di bawah. Tuliskan penyelesaian bagi persamaan serentak itu.`), fig, a: T(`$x = ${p}$, $y = ${q}$`), sp: 's' };
    },
  ];
  const classify = (a1, b1, c1, a2, b2, c2) => {
    const det = a1 * b2 - a2 * b1;
    if (det !== 0) return 'one';
    return a1 * c2 - a2 * c1 === 0 && b1 * c2 - b2 * c1 === 0 ? 'inf' : 'none';
  };
  const g65m = [
    (r) => {
      const kind = r.pick(['one', 'none', 'inf']);
      let a1 = r.nz(-4, 4), b1 = r.nz(-4, 4), c1 = r.int(-8, 8), a2, b2, c2;
      const k = r.pick([2, 3, -1, -2]);
      if (kind === 'one') {
        do { a2 = r.nz(-4, 4); b2 = r.nz(-4, 4); c2 = r.int(-8, 8); } while (classify(a1, b1, c1, a2, b2, c2) !== 'one');
      } else if (kind === 'none') {
        a2 = a1 * k; b2 = b1 * k; c2 = c1 * k + r.pick([1, 2, 3]);
      } else { a2 = a1 * k; b2 = b1 * k; c2 = c1 * k; }
      const text = { one: T('one solution', 'satu penyelesaian'), none: T('no solution', 'tiada penyelesaian'), inf: T('infinitely many solutions', 'penyelesaian yang tidak terhingga banyaknya') };
      return { q: T(`Without solving, state whether the simultaneous equations $${showSys({ a1, b1, c1, a2, b2, c2 })}$ have one solution, no solution or infinitely many solutions. Give a reason.`, `Tanpa menyelesaikannya, nyatakan sama ada persamaan serentak $${showSys({ a1, b1, c1, a2, b2, c2 })}$ mempunyai satu penyelesaian, tiada penyelesaian atau penyelesaian yang tidak terhingga banyaknya. Berikan sebab.`), a: text[classify(a1, b1, c1, a2, b2, c2)], w: kind === 'one' ? T('The lines have different gradients and intersect once.', 'Garis-garis itu mempunyai kecerunan berbeza dan bersilang sekali.') : kind === 'none' ? T('Same gradient but different intercepts: parallel lines.', 'Kecerunan sama tetapi pintasan berbeza: garis selari.') : T('The two equations represent the same line (coincident).', 'Kedua-dua persamaan mewakili garis yang sama (berhimpit).'), sp: 's' };
    },
    (r) => {
      const price1 = r.int(2, 6), price2 = r.int(3, 9);
      const n1 = r.int(2, 4), n2 = r.int(1, 3), m1 = r.int(1, 3), m2 = r.int(2, 4);
      need(n1 * m2 !== n2 * m1);
      const tot1 = n1 * price1 + n2 * price2, tot2 = m1 * price1 + m2 * price2;
      return { q: T(`${n1} kg of rice and ${n2} kg of sugar cost RM${tot1}. ${m1} kg of rice and ${m2} kg of sugar cost RM${tot2}. Let RM$x$ be the price of 1 kg of rice and RM$y$ the price of 1 kg of sugar. Write two linear equations.`, `${n1} kg beras dan ${n2} kg gula berharga RM${tot1}. ${m1} kg beras dan ${m2} kg gula berharga RM${tot2}. Andaikan RM$x$ ialah harga 1 kg beras dan RM$y$ ialah harga 1 kg gula. Tulis dua persamaan linear.`), a: T(`$${eq(n1, n2, tot1)}$; $${eq(m1, m2, tot2)}$`), sp: 's' };
    },
  ];
  const g65a = [
    (r) => {
      const s = sysFrom(r, { range: 5 });
      const t = r.pick(['x', 'y']);
      return { q: T(`Show that $(x, y) = (${s.p}, ${s.q})$ is a solution of $${eq(s.a1, s.b1, s.c1)}$ but decide whether it is a solution of $${eq(s.a2, s.b2, s.c2 + 1)}$. Hence state whether it is a solution of the simultaneous equations.`, `Tunjukkan bahawa $(x, y) = (${s.p}, ${s.q})$ ialah penyelesaian bagi $${eq(s.a1, s.b1, s.c1)}$ dan tentukan sama ada ia penyelesaian bagi $${eq(s.a2, s.b2, s.c2 + 1)}$. Seterusnya nyatakan sama ada ia penyelesaian bagi persamaan serentak itu.`), a: T(`It satisfies the first equation only (the second gives ${s.c2} not ${s.c2 + 1}), so it is not a solution of the pair.`, `Ia hanya memenuhi persamaan pertama (yang kedua memberi ${s.c2} bukan ${s.c2 + 1}), jadi ia bukan penyelesaian bagi pasangan itu.`), sp: 'm' };
    },
    (r) => {
      const a = r.nz(-3, 3), b = r.nz(-3, 3), c = r.int(-6, 6);
      const k = r.pick([2, 3, -2]);
      const kind = r.pick(['none', 'inf']);
      const c2 = kind === 'none' ? c * k + r.pick([1, -1, 4]) : c * k;
      return { q: T(`The equations $${eq(a, b, c)}$ and $${eq(a * k, b * k, c2)}$ are represented by two lines on a graph. Decide, using cross-products of the coefficients, whether the lines intersect once, are parallel or coincide.`, `Persamaan $${eq(a, b, c)}$ dan $${eq(a * k, b * k, c2)}$ diwakili oleh dua garis pada satu graf. Tentukan, menggunakan hasil darab silang pekali, sama ada garis-garis itu bersilang sekali, selari atau berhimpit.`), a: kind === 'none' ? T('Parallel (no solution)', 'Selari (tiada penyelesaian)') : T('Coincident (infinitely many solutions)', 'Berhimpit (penyelesaian tak terhingga)'), sp: 'm' };
    },
  ];

  const g66e = [
    (r) => {
      const p = r.int(1, 7), q = r.int(1, 6), k = r.int(1, 4);
      // y = x + k ; x + y = s
      const x = p, y = p + k;
      return { q: T(`Solve by substitution: $y = x + ${k}$, $x + y = ${x + y}$.`, `Selesaikan dengan penggantian: $y = x + ${k}$, $x + y = ${x + y}$.`), a: T(`$x = ${x}$, $y = ${y}$`), w: T(`$x + (x + ${k}) = ${x + y}$`), sp: 'm' };
    },
    (r) => {
      const x = r.int(1, 6), y = r.int(1, 6), a = r.int(1, 3), b = r.int(1, 4);
      return { q: T(`Solve by elimination: $\\begin{cases} x + ${b}y = ${x + b * y} \\\\ x - ${b}y = ${x - b * y} \\end{cases}$`, `Selesaikan dengan penyingkiran: $\\begin{cases} x + ${b}y = ${x + b * y} \\\\ x - ${b}y = ${x - b * y} \\end{cases}$`), a: T(`$x = ${x}$, $y = ${y}$`), sp: 'm' };
    },
  ];
  const g66m = [
    (r) => {
      const p = r.int(-4, 6), q = r.int(-4, 6), a = r.int(1, 4), b = r.int(1, 4);
      const s = { a1: a, b1: b, c1: a * p + b * q, a2: r.pick([-1, 1]) * a, b2: r.pick([1, -1]) * b * -1, c2: 0 };
      s.a2 = a; s.b2 = -b; s.c2 = a * p - b * q;
      return { q: T(`Solve the simultaneous equations by elimination: $${showSys(s)}$`, `Selesaikan persamaan serentak dengan kaedah penyingkiran: $${showSys(s)}$`), a: T(`$x = ${p}$, $y = ${q}$`), w: T(`Add the equations to eliminate $y$.`, `Tambah kedua-dua persamaan untuk menyingkirkan $y$.`), sp: 'm' };
    },
    (r) => {
      const p = r.int(-4, 6), q = r.int(-4, 6), a = r.int(2, 4), c = r.int(1, 3);
      // y = a x + c ... solve by substitution
      const yy = a * p + c;
      const x0 = p, y0 = yy;
      const k = r.int(1, 3);
      const s2 = k * x0 + y0;
      return { q: T(`Solve by substitution: $y = ${lin(a, c)}$ and $${k === 1 ? '' : k}x + y = ${s2}$.`, `Selesaikan dengan penggantian: $y = ${lin(a, c)}$ dan $${k === 1 ? '' : k}x + y = ${s2}$.`), a: T(`$x = ${x0}$, $y = ${y0}$`), sp: 'm' };
    },
    (r) => {
      const s = sysFrom(r, { range: 3 });
      need(Math.abs(s.a1) !== Math.abs(s.a2) && Math.abs(s.b1) !== Math.abs(s.b2) === false || true);
      const fig = S.plane({ x: [-6, 6], y: [-6, 6], scale: 18, lines: (() => { const l = []; for (const [a, b, c] of [[s.a1, s.b1, s.c1], [s.a2, s.b2, s.c2]]) { if (b !== 0) l.push({ m: -a / b, c: c / b }); } return l; })(), pts: [{ x: s.p, y: s.q, l: '' }] });
      need(Math.abs(s.p) <= 5 && Math.abs(s.q) <= 5 && Math.abs(s.c1 / s.b1) <= 6 && Math.abs(s.c2 / s.b2) <= 6);
      return { q: T(`The graph shows the lines $${eq(s.a1, s.b1, s.c1)}$ and $${eq(s.a2, s.b2, s.c2)}$. Use the graph to write down the solution of the simultaneous equations, then verify it in both equations.`, `Graf menunjukkan garis $${eq(s.a1, s.b1, s.c1)}$ dan $${eq(s.a2, s.b2, s.c2)}$. Gunakan graf untuk menulis penyelesaian bagi persamaan serentak itu, kemudian sahkannya dalam kedua-dua persamaan.`), fig, a: T(`$x = ${s.p}$, $y = ${s.q}$`), sp: 's' };
    },
  ];
  const g66a = [
    (r) => {
      const s = sysFrom(r, { range: 5 });
      need(Math.abs(s.a1) !== Math.abs(s.a2) && Math.abs(s.b1) !== Math.abs(s.b2));
      return { q: T(`Solve the simultaneous equations $${showSys(s)}$ and check your answer in both equations.`, `Selesaikan persamaan serentak $${showSys(s)}$ dan semak jawapan anda dalam kedua-dua persamaan.`), a: T(`$x = ${s.p}$, $y = ${s.q}$`), w: T(`Check: $${s.a1}(${par(s.p)}) + (${s.b1})(${par(s.q)}) = ${s.c1}$; $${s.a2}(${par(s.p)}) + (${s.b2})(${par(s.q)}) = ${s.c2}$`, `Semak: $${s.a1}(${par(s.p)}) + (${s.b1})(${par(s.q)}) = ${s.c1}$; $${s.a2}(${par(s.p)}) + (${s.b2})(${par(s.q)}) = ${s.c2}$`), sp: 'l' };
    },
    (r) => {
      // fractional solution
      const a1 = r.int(1, 4), b1 = r.int(1, 4), a2 = r.int(1, 4), b2 = -r.int(1, 4), c1 = r.int(1, 12), c2 = r.int(1, 12);
      const det = a1 * b2 - a2 * b1;
      need(det !== 0);
      const x = fr(c1 * b2 - c2 * b1, det), y = fr(a1 * c2 - a2 * c1, det);
      need(x.d !== 1 && x.d <= 12 && y.d <= 12 && (x.d !== 1 || y.d !== 1));
      return { q: T(`Solve $${showSys({ a1, b1, c1, a2, b2, c2 })}$. Give fractional answers in their simplest form.`, `Selesaikan $${showSys({ a1, b1, c1, a2, b2, c2 })}$. Berikan jawapan pecahan dalam bentuk termudah.`), a: T(`$x = ${frT(x)}$, $y = ${frT(y)}$`), sp: 'l' };
    },
  ];

  /* ---- 6.7 problems */
  const g67e = [
    (r) => {
      const x = r.int(4, 12), y = r.int(2, x - 2);
      const it = r.pick([[T('pens', 'batang pen'), T('rulers', 'batang pembaris')], [T('apples', 'biji epal'), T('oranges', 'biji oren')]]);
      return { q: T(`Let $x$ be the number of ${it[0].en} and $y$ the number of ${it[1].en}. The total number of items is ${x + y} and there are ${x - y} more ${it[0].en} than ${it[1].en}. Form two equations and solve them.`, `Andaikan $x$ ialah bilangan ${it[0].ms} dan $y$ ialah bilangan ${it[1].ms}. Jumlah bilangan barang ialah ${x + y} dan terdapat ${x - y} lebih ${it[0].ms} berbanding ${it[1].ms}. Bentukkan dua persamaan dan selesaikannya.`), a: T(`$x + y = ${x + y}$, $x - y = ${x - y}$; $x = ${x}$, $y = ${y}$`), sp: 'l' };
    },
  ];
  const g67m = [
    (r) => {
      const ad = r.int(8, 15), ch = r.int(4, ad - 2);
      const na = r.int(2, 4), nc = r.int(2, 4), na2 = r.int(1, 3), nc2 = r.int(3, 6);
      need(na * nc2 !== nc * na2);
      const tot1 = na * ad + nc * ch, tot2 = na2 * ad + nc2 * ch;
      return { q: T(`${na} adult tickets and ${nc} child tickets cost RM${tot1}. ${na2} adult ticket${na2 > 1 ? 's' : ''} and ${nc2} child tickets cost RM${tot2}. Find the price of an adult ticket and of a child ticket.`, `${na} tiket dewasa dan ${nc} tiket kanak-kanak berharga RM${tot1}. ${na2} tiket dewasa dan ${nc2} tiket kanak-kanak berharga RM${tot2}. Cari harga sekeping tiket dewasa dan sekeping tiket kanak-kanak.`), a: T(`Adult RM${ad}, child RM${ch}`, `Dewasa RM${ad}, kanak-kanak RM${ch}`), w: T(`$${na}x + ${nc}y = ${tot1}$, $${na2}x + ${nc2}y = ${tot2}$`), sp: 'xl' };
    },
    (r) => {
      const [nm, nm2] = NM(r);
      const y = r.int(10, 16), k = r.int(2, 4), gap = r.int(2, 5);
      const x = y + gap * 1;
      // ages: sum and difference
      return { q: T(`The sum of the ages of ${nm} and ${nm2} is ${x + y} years. ${nm} is ${gap} years older than ${nm2}. Define two variables, form two equations and find their ages.`, `Jumlah umur ${nm} dan ${nm2} ialah ${x + y} tahun. ${nm} lebih tua ${gap} tahun daripada ${nm2}. Tentukan dua pemboleh ubah, bentukkan dua persamaan dan cari umur mereka.`), a: T(`${nm}: ${x}, ${nm2}: ${y}`), sp: 'l' };
    },
    (r) => {
      const l = r.int(6, 14), w = r.int(3, l - 1);
      return { q: T(`The perimeter of a rectangle is ${2 * (l + w)} cm and its length is ${l - w} cm more than its width. Find the length and the width.`, `Perimeter sebuah segi empat tepat ialah ${2 * (l + w)} cm dan panjangnya lebih ${l - w} cm daripada lebarnya. Cari panjang dan lebar itu.`), a: T(`Length ${l} cm, width ${w} cm`, `Panjang ${l} cm, lebar ${w} cm`), sp: 'l' };
    },
  ];
  const g67a = [
    (r) => {
      const pa = r.int(9, 22), pc = r.int(4, pa - 3);
      const na = r.int(2, 5), nc = r.int(2, 5), na2 = r.int(1, 4), nc2 = r.int(3, 8);
      need(na * nc2 !== nc * na2);
      const [nm] = NM(r);
      const fa = r.int(1, 3), fc = r.int(2, 4);
      const cost1 = na * pa + nc * pc, cost2 = na2 * pa + nc2 * pc;
      const family = fa * pa + fc * pc;
      return { q: T(`At a zoo, ${na} adult tickets and ${nc} child tickets cost RM${cost1}, while ${na2} adult ticket${na2 > 1 ? 's' : ''} and ${nc2} child tickets cost RM${cost2}. (a) Find the price of each type of ticket. (b) ${nm}'s family has ${fa} adult${fa > 1 ? 's' : ''} and ${fc} children. How much do they pay, and how much would they save with a family package priced at RM${family - 5}?`, `Di sebuah zoo, ${na} tiket dewasa dan ${nc} tiket kanak-kanak berharga RM${cost1}, manakala ${na2} tiket dewasa dan ${nc2} tiket kanak-kanak berharga RM${cost2}. (a) Cari harga setiap jenis tiket. (b) Keluarga ${nm} terdiri daripada ${fa} orang dewasa dan ${fc} orang kanak-kanak. Berapakah bayaran mereka, dan berapakah penjimatan jika mereka membeli pakej keluarga berharga RM${family - 5}?`), a: T(`(a) Adult RM${pa}, child RM${pc} (b) RM${family}; saves RM5`, `(a) Dewasa RM${pa}, kanak-kanak RM${pc} (b) RM${family}; jimat RM5`), sp: 'xxl' };
    },
    (r) => {
      const [nm] = NM(r);
      const n20 = r.int(4, 14), n50 = r.int(3, 12);
      const total = n20 * 20 + n50 * 50;
      return { q: T(`${nm} has ${n20 + n50} coins made up of 20-sen and 50-sen coins. Their total value is RM${n(total / 100)}. Find the number of coins of each kind.`, `${nm} mempunyai ${n20 + n50} keping syiling yang terdiri daripada syiling 20 sen dan 50 sen. Jumlah nilainya ialah RM${n(total / 100)}. Cari bilangan setiap jenis syiling.`), a: T(`${n20} coins of 20 sen and ${n50} coins of 50 sen`, `${n20} keping syiling 20 sen dan ${n50} keping syiling 50 sen`), w: T(`$x + y = ${n20 + n50}$, $20x + 50y = ${total}$`), sp: 'xl' };
    },
  ];

  SPM.addChapter(1, 6, T('Linear Equations', 'Persamaan Linear'), [
    { id: '6.1', en: 'Linear equations and equalities', ms: 'Persamaan linear dan kesamaan', gen: { e: g61e, m: g61m, a: g61a } },
    { id: '6.2', en: 'Linear equations in one variable', ms: 'Persamaan linear dalam satu pemboleh ubah', gen: { e: g62e, m: g62m, a: g62a } },
    { id: '6.3', en: 'Linear equations in two variables', ms: 'Persamaan linear dalam dua pemboleh ubah', gen: { e: g63e, m: g63m, a: g63a } },
    { id: '6.4', en: 'Graphs of linear equations in two variables', ms: 'Graf persamaan linear dalam dua pemboleh ubah', gen: { e: g64e, m: g64m, a: g64a } },
    { id: '6.5', en: 'Simultaneous linear equations in two variables', ms: 'Persamaan linear serentak dalam dua pemboleh ubah', gen: { e: g65e, m: g65m, a: g65a } },
    { id: '6.6', en: 'Solving simultaneous linear equations', ms: 'Menyelesaikan persamaan linear serentak', gen: { e: g66e, m: g66m, a: g66a } },
    { id: '6.7', en: 'Problems involving simultaneous equations', ms: 'Masalah yang melibatkan persamaan serentak', gen: { e: g67e, m: g67m, a: g67a } },
  ]);

  /* =============================================================== 7 */
  const sym = { '>': '>', '<': '<', '>=': '\\ge', '<=': '\\le' };
  const flip = { '>': '<', '<': '>', '>=': '<=', '<=': '>=' };
  const inWords = (s) => ({
    '>': T('greater than', 'lebih besar daripada'), '<': T('less than', 'kurang daripada'),
    '>=': T('greater than or equal to', 'lebih besar daripada atau sama dengan'), '<=': T('less than or equal to', 'kurang daripada atau sama dengan'),
  }[s]);
  /** number line for x (dir) k, incl */
  function ineqLine(dir, k, incl, lo, hi) {
    const pts = [{ v: k, hollow: !incl, ray: dir === '>' ? 1 : -1 }];
    return S.numberLine({ min: lo, max: hi, step: 1, points: pts, width: 380 });
  }
  const g71e = [
    (r) => {
      const k = r.int(-5, 12);
      const s = r.pick(['>', '<', '>=', '<=']);
      const words = { '>': T('greater than', 'lebih besar daripada'), '<': T('less than', 'kurang daripada'), '>=': T('at least', 'sekurang-kurangnya'), '<=': T('at most', 'selebih-lebihnya') };
      return { q: T(`Write an inequality for "$x$ is ${words[s].en} ${k}".`, `Tulis satu ketaksamaan bagi "$x$ ${words[s].ms} ${k}".`), a: T(`$x ${sym[s]} ${k}$`), sp: 'xs' };
    },
    (r) => {
      const k = r.int(-4, 6);
      const dir = r.pick(['>', '<']);
      const incl = r.chance();
      const s = dir + (incl ? '=' : '');
      return { q: T('Write the inequality represented by the number line.', 'Tulis ketaksamaan yang diwakili oleh garis nombor itu.'), fig: ineqLine(dir, k, incl, k - 5, k + 5), a: T(`$x ${sym[s]} ${k}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(-9, 9), b = r.int(-9, 9);
      need(a !== b);
      const s = a > b ? '>' : '<';
      return { q: T(`Fill in the blank with $<$ or $>$: $${par(a)}\\ \\square\\ ${par(b)}$. Then write the converse inequality.`, `Isi tempat kosong dengan $<$ atau $>$: $${par(a)}\\ \\square\\ ${par(b)}$. Kemudian tulis ketaksamaan songsangnya.`), a: T(`$${par(a)} ${sym[s]} ${par(b)}$; converse: $${par(b)} ${sym[flip[s]]} ${par(a)}$`, `$${par(a)} ${sym[s]} ${par(b)}$; songsang: $${par(b)} ${sym[flip[s]]} ${par(a)}$`), sp: 's' };
    },
  ];
  const g71m = [
    (r) => {
      const c = r.pick([
        [T('The pass mark is at least 40 marks', 'Markah lulus ialah sekurang-kurangnya 40 markah'), 'm', '>=', 40],
        [T('A lift can carry at most 8 persons', 'Sebuah lif boleh membawa selebih-lebihnya 8 orang'), 'p', '<=', 8],
        [T('The minimum age to register is 18 years', 'Umur minimum untuk mendaftar ialah 18 tahun'), 'a', '>=', 18],
        [T('A bag must weigh less than 7 kg', 'Sebuah beg mesti berjisim kurang daripada 7 kg'), 'w', '<', 7],
        [T('A car park charges more than RM2 per hour', 'Sebuah tempat letak kereta mengenakan bayaran lebih daripada RM2 sejam'), 'c', '>', 2],
      ]);
      const [a, v, s, k] = [c[0], c[1], c[2], c[3]];
      return { q: T(`Write an inequality for each situation using $${v}$: "${a.en}".`, `Tulis satu ketaksamaan bagi situasi berikut menggunakan $${v}$: "${a.ms}".`), a: T(`$${v} ${sym[s]} ${k}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(-8, 4), b = a + r.int(4, 9);
      const inclA = r.chance(), inclB = r.chance();
      const list = [];
      for (let x = a; x <= b; x++) if ((x > a || inclA) && (x < b || inclB)) list.push(x);
      return { q: T(`List all the integers $x$ that satisfy $${a} ${inclA ? '\\le' : '<'} x ${inclB ? '\\le' : '<'} ${b}$.`, `Senaraikan semua integer $x$ yang memuaskan $${a} ${inclA ? '\\le' : '<'} x ${inclB ? '\\le' : '<'} ${b}$.`), a: T(`$${list.join(',\\ ')}$`), sp: 's' };
    },
    (r) => {
      const A = r.int(-6, 9), B = r.int(-6, 9), cc = r.nz(-4, 4);
      need(A > B);
      return { q: T(`Given $${A} > ${par(B)}$, (a) write the converse, (b) write the relationship between $${par(-A)}$ and $${par(-B)}$, (c) add $${par(cc)}$ to both sides and write the new inequality.`, `Diberi $${A} > ${par(B)}$, (a) tulis songsangnya, (b) tulis hubungan antara $${par(-A)}$ dan $${par(-B)}$, (c) tambah $${par(cc)}$ pada kedua-dua belah dan tulis ketaksamaan baharu.`), a: T(`(a) $${par(B)} < ${A}$ (b) $${par(-A)} < ${par(-B)}$ (c) $${A + cc} > ${B + cc}$`), sp: 'm' };
    },
  ];
  const g71a = [
    (r) => {
      const a = r.int(2, 9), b = r.int(1, a - 1);
      need(a > b);
      const k = r.pick([2, 3, 4]);
      return { q: T(`(a) Given $${a} > ${b}$, multiply both sides by $-${k}$. What happens to the inequality sign? (b) Verify by evaluating both sides.`, `(a) Diberi $${a} > ${b}$, darabkan kedua-dua belah dengan $-${k}$. Apakah yang berlaku kepada tanda ketaksamaan? (b) Sahkan dengan menilai kedua-dua belah.`), a: T(`(a) The sign reverses: $${-k * a} < ${-k * b}$ (b) $${-k * a}$ is less than $${-k * b}$`, `(a) Tanda berbalik: $${-k * a} < ${-k * b}$ (b) $${-k * a}$ kurang daripada $${-k * b}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(a + 1, 9);
      return { q: T(`Ali claims: "If $x > y$, then $\\dfrac{1}{x} < \\dfrac{1}{y}$." Test this with $x = ${b}$, $y = ${a}$ (both positive) and with $x = 2$, $y = -3$. Is the claim always true?`, `Ali mendakwa: "Jika $x > y$, maka $\\dfrac{1}{x} < \\dfrac{1}{y}$." Uji dakwaan ini dengan $x = ${b}$, $y = ${a}$ (kedua-duanya positif) dan dengan $x = 2$, $y = -3$. Adakah dakwaan itu sentiasa benar?`), a: T(`No. It holds for positive numbers ($\\dfrac{1}{${b}} < \\dfrac{1}{${a}}$) but fails when they have opposite signs: $\\dfrac{1}{2} > -\\dfrac{1}{3}$.`, `Tidak. Ia benar bagi nombor positif ($\\dfrac{1}{${b}} < \\dfrac{1}{${a}}$) tetapi gagal apabila tandanya berlawanan: $\\dfrac{1}{2} > -\\dfrac{1}{3}$.`), sp: 'm' };
    },
    (r) => {
      const total = r.int(4, 9) * 10, price = r.pick([3, 4, 5, 6]);
      const maxN = Math.floor(total / price);
      return { q: T(`Aina has RM${total}. Each notebook costs RM${price}. Let $n$ be the number of notebooks she can buy. Write an inequality for $n$ and state the greatest possible value of $n$.`, `Aina mempunyai RM${total}. Sebuah buku nota berharga RM${price}. Andaikan $n$ ialah bilangan buku nota yang boleh dibelinya. Tulis satu ketaksamaan bagi $n$ dan nyatakan nilai $n$ yang terbesar.`), a: T(`$${price}n \\le ${total}$; $n = ${maxN}$`), sp: 'm' };
    },
  ];

  /** inequality "a x + b s c" with solution x dir k */
  function ineqFor(r, dir, k, incl) {
    const a = r.nz(-5, 5);
    const b = r.int(-9, 9);
    const c = a * k + b;
    const s0 = dir + (incl ? '=' : '');
    const s = a > 0 ? s0 : flip[s0];
    return { text: `${lin(a, b)} ${sym[s]} ${c}`, a, b, c, s };
  }
  const solSym = (dir, incl) => sym[dir + (incl ? '=' : '')];
  const g72e = [
    (r) => {
      const k = r.int(1, 9), c = r.int(1, 8);
      const s = r.pick(['>', '<', '>=', '<=']);
      return { q: T(`Solve $x - ${c} ${sym[s]} ${k}$.`, `Selesaikan $x - ${c} ${sym[s]} ${k}$.`), a: T(`$x ${sym[s]} ${k + c}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 6), k = r.int(2, 9);
      const s = r.pick(['>', '<', '>=', '<=']);
      return { q: T(`Solve $${a}x ${sym[s]} ${a * k}$.`, `Selesaikan $${a}x ${sym[s]} ${a * k}$.`), a: T(`$x ${sym[s]} ${k}$`), sp: 'xs' };
    },
    (r) => {
      const k = r.int(-4, 6), incl = r.chance(), dir = r.pick(['>', '<']);
      const iq = ineqFor(r, dir, k, incl);
      need(iq.a > 0);
      return { q: T(`Solve $${iq.text}$ and show the solution on a number line.`, `Selesaikan $${iq.text}$ dan tunjukkan penyelesaian pada garis nombor.`), fig: undefined, a: T(`$x ${solSym(dir, incl)} ${k}$`), sp: 's' };
    },
  ];
  const g72m = [
    (r) => {
      const a = r.int(2, 6), k = r.int(-6, 8), b = r.int(1, 9);
      const dir = r.pick(['>', '<']);
      const incl = r.chance();
      const c = a * k + b;
      const s0 = dir + (incl ? '=' : '');
      const q = `${a}x + ${b} ${sym[s0]} ${c}`;
      return { q: T(`Solve $${q}$ and represent the solution on a number line.`, `Selesaikan $${q}$ dan wakilkan penyelesaian pada garis nombor.`), fig: ineqLine(dir, k, incl, Math.min(k - 4, -1), Math.max(k + 4, 1)), a: T(`$x ${solSym(dir, incl)} ${k}$`), w: T(`The number line above shows the answer.`, `Garis nombor di atas menunjukkan jawapan.`), sp: 's' };
    },
    (r) => {
      const a = -r.int(2, 5), k = r.int(-6, 5);
      const dir = r.pick(['>', '<']), incl = r.chance();
      // a x s c with a<0
      const s0 = dir + (incl ? '=' : '');
      const given = flip[s0];
      const c = a * k;
      return { q: T(`Solve $${a}x ${sym[given]} ${c}$.`, `Selesaikan $${a}x ${sym[given]} ${c}$.`), a: T(`$x ${sym[s0]} ${k}$`), w: T(`Dividing by $${a}$ (a negative number) reverses the sign.`, `Membahagi dengan $${a}$ (nombor negatif) menyongsangkan tanda.`), sp: 's' };
    },
    (r) => {
      const lo = r.int(-4, 2), hi = lo + r.int(4, 8);
      const incl1 = r.chance(), incl2 = r.chance();
      const i1 = ineqFor(r, '>', lo, incl1), i2 = ineqFor(r, '<', hi, incl2);
      const list = [];
      for (let x = lo - 1; x <= hi + 1; x++) if ((incl1 ? x >= lo : x > lo) && (incl2 ? x <= hi : x < hi)) list.push(x);
      need(list.length >= 3 && list.length <= 7);
      return { q: T(`List all the integers $x$ that satisfy both $${i1.text}$ and $${i2.text}$.`, `Senaraikan semua integer $x$ yang memuaskan kedua-dua $${i1.text}$ dan $${i2.text}$.`), a: T(`$${list.join(',\\ ')}$`), w: T(`$x ${solSym('>', incl1)} ${lo}$ and $x ${solSym('<', incl2)} ${hi}$`), sp: 'm' };
    },
  ];
  const g72a = [
    (r) => {
      const a = r.int(2, 4), b = r.int(2, 6), c = r.int(1, 3), d = r.int(1, 9);
      // a(b - x) > x + d  -> ab - a x > x + d -> ab - d > (a+1) x -> x < (ab-d)/(a+1)
      const num = a * b - d, den = a + 1;
      const s = r.pick(['>', '>=']);
      const sol = fr(num, den);
      const solS = s === '>' ? '<' : '\\le';
      return { q: T(`Solve $${a}(${b} - x) ${sym[s]} x + ${d}$.`, `Selesaikan $${a}(${b} - x) ${sym[s]} x + ${d}$.`), a: T(`$x ${solS === '<' ? '<' : '\\le'} ${frT(sol)}$`), sp: 'm' };
    },
    (r) => {
      const lo = r.int(-3, 1), hi = lo + r.int(4, 7);
      const i1 = ineqFor(r, '>', lo, r.chance()), i2 = ineqFor(r, '<', hi, r.chance());
      // parse inclusive from text sign
      const inc1 = /\\ge/.test(i1.text) || /\\le/.test(i1.text) ? null : null;
      const incl1 = i1.s.includes('=') , incl2 = i2.s.includes('=');
      const list = [];
      for (let x = lo - 1; x <= hi + 1; x++) if ((incl1 ? x >= lo : x > lo) && (incl2 ? x <= hi : x < hi)) list.push(x);
      const chain = `${lo} ${incl1 ? '\\le' : '<'} x ${incl2 ? '\\le' : '<'} ${hi}`;
      need(list.length >= 3 && list.length <= 7);
      return { q: T(`Solve the simultaneous inequalities $${i1.text}$ and $${i2.text}$. Write the common solution as a single chained inequality and list the integer values of $x$.`, `Selesaikan ketaksamaan serentak $${i1.text}$ dan $${i2.text}$. Tulis penyelesaian sepunya sebagai satu ketaksamaan berantai dan senaraikan nilai integer $x$.`), a: T(`$${chain}$; $${list.join(',\\ ')}$`), sp: 'l' };
    },
    (r) => {
      const price = r.pick([2.5, 3, 4, 4.5]), fixed = r.pick([15, 20, 25]);
      const budget = r.pick([60, 70, 80, 90]);
      const maxN = Math.floor((budget - fixed) / price);
      return { q: T(`A caterer charges RM${fixed} for delivery plus RM${price} per meal. Aisyah's budget is at most RM${budget}. Form an inequality and find the greatest number of meals she can order.`, `Seorang pengusaha katering mengenakan RM${fixed} untuk penghantaran ditambah RM${price} bagi setiap hidangan. Bajet Aisyah selebih-lebihnya RM${budget}. Bentukkan satu ketaksamaan dan cari bilangan hidangan maksimum yang boleh ditempahnya.`), a: T(`$${fixed} + ${price}n \\le ${budget}$; $n = ${maxN}$`), sp: 'm' };
    },
  ];
  SPM.addChapter(1, 7, T('Linear Inequalities', 'Ketaksamaan Linear'), [
    { id: '7.1', en: 'Inequalities', ms: 'Ketaksamaan', gen: { e: g71e, m: g71m, a: g71a } },
    { id: '7.2', en: 'Linear inequalities in one variable', ms: 'Ketaksamaan linear dalam satu pemboleh ubah', gen: { e: g72e, m: g72m, a: g72a } },
  ]);

  /* =============================================================== 8 */
  const angType = (t) => (t < 90 ? T('acute', 'akut') : t === 90 ? T('right', 'tegak') : t < 180 ? T('obtuse', 'cakah') : t === 180 ? T('straight', 'lurus') : T('reflex', 'refleks'));
  const rot = (deg, r) => deg;
  const g81e = [
    (r) => {
      const t = r.pick([r.int(15, 85), 90, r.int(95, 170), 180, r.int(190, 340)]);
      const fig = F.fan({ rays: [0, t === 180 ? 179.9 : t], labels: { 0: '?' }, w: 210, h: 170, arcR: 24 });
      return { q: T('Name the type of the angle marked $?$ in the diagram.', 'Namakan jenis sudut yang bertanda $?$ dalam rajah.'), fig, a: angType(t), sp: 'xs' };
    },
    (r) => {
      const t = r.pick([25, 48, 72, 90, 104, 135, 160, 180, 215, 275, 310]);
      return { q: T(`Classify an angle of $${t}^\\circ$ as acute, right, obtuse, straight or reflex.`, `Kelaskan sudut $${t}^\\circ$ sebagai akut, tegak, cakah, lurus atau refleks.`), a: angType(t), sp: 'xs' };
    },
    (r) => {
      const pts = [[0, 0], [4, 0], [4, 3], [0, 3]];
      const fig = F.polygon({ pts, names: ['A', 'B', 'C', 'D'], right: [0, 1, 2, 3], w: 200, h: 150 });
      return { q: T('ABCD is a rectangle. Name (a) a pair of parallel lines, (b) a pair of perpendicular lines.', 'ABCD ialah sebuah segi empat tepat. Namakan (a) sepasang garis selari, (b) sepasang garis serenjang.'), fig, a: T('(a) $AB \\parallel DC$ (or $AD \\parallel BC$) (b) $AB \\perp BC$ (or any two adjacent sides)', '(a) $AB \\parallel DC$ (atau $AD \\parallel BC$) (b) $AB \\perp BC$ (atau mana-mana dua sisi bersebelahan)'), sp: 's' };
    },
    (r) => {
      const fig = F.polygon({ pts: [[0, 0], [5, 0], [2.5, -4]], names: ['P', 'Q', 'R'], ticks: { '0-2': 1, '1-2': 1 }, w: 220, h: 170 });
      return { q: T('In triangle $PQR$, the tick marks show line segments of equal length. Name the pair of congruent line segments.', 'Dalam segi tiga $PQR$, tanda palang menunjukkan tembereng garis yang sama panjang. Namakan sepasang tembereng garis yang kongruen.'), fig, a: T('$PR$ and $QR$', '$PR$ dan $QR$'), sp: 'xs' };
    },
  ];
  const g81m = [
    (r) => {
      const t = r.pick([35, 52, 68, 75, 115, 128, 142]);
      const base = r.pick([0, 20, 40]);
      const fig = F.fan({ rays: [base, base + t], labels: { 0: '' }, w: 230, h: 170, arcR: 26 });
      return { q: T('Estimate the size of the angle shown, then measure it with a protractor. State the difference between your estimate and the measured value.', 'Anggarkan saiz sudut yang ditunjukkan, kemudian ukurnya dengan protraktor. Nyatakan beza antara anggaran anda dengan nilai ukuran.'), fig, a: T(`About $${t}^\\circ$ (accept $\\pm 2^\\circ$)`, `Kira-kira $${t}^\\circ$ (terima $\\pm 2^\\circ$)`), sp: 's' };
    },
    (r) => {
      const t = r.int(20, 170);
      return { q: T(`An angle is $${t}^\\circ$. Find the size of the corresponding reflex angle.`, `Satu sudut ialah $${t}^\\circ$. Cari saiz sudut refleks yang sepadan.`), a: T(`$${360 - t}^\\circ$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(4, 9) + r.pick([0, 0.5]), t = r.pick([50, 65, 70, 110, 125]);
      return { q: T(`Using a ruler and a protractor, draw a line segment $PQ = ${a}$ cm. At $P$, draw $\\angle QPR = ${t}^\\circ$. Label your diagram.`, `Dengan menggunakan pembaris dan protraktor, lukis tembereng garis $PQ = ${a}$ cm. Pada $P$, lukis $\\angle QPR = ${t}^\\circ$. Labelkan rajah anda.`), a: T(`A correct drawing has $PQ = ${a}$ cm and $\\angle QPR = ${t}^\\circ$ (tolerance $\\pm 2^\\circ$ / $\\pm 1$ mm).`, `Lukisan yang betul mempunyai $PQ = ${a}$ cm dan $\\angle QPR = ${t}^\\circ$ (toleransi $\\pm 2^\\circ$ / $\\pm 1$ mm).`), sp: 'xl' };
    },
  ];
  const g81a = [
    (r) => {
      const t = r.int(30, 150);
      const base = r.pick([100, 130, 200, 250, 300]);
      const fig = F.fan({ rays: [base % 360, (base + t) % 360], labels: { 0: '?' }, w: 230, h: 190, arcR: 26 });
      return { q: T(`The angle marked $?$ is drawn in a non-standard position. (a) State the type of angle. (b) The angle is $${t}^\\circ$. What is the size of the reflex angle at the same point?`, `Sudut yang bertanda $?$ dilukis dalam kedudukan bukan piawai. (a) Nyatakan jenis sudut itu. (b) Sudut itu ialah $${t}^\\circ$. Apakah saiz sudut refleks pada titik yang sama?`), fig, a: T(`(a) ${angType(t).en} (b) $${360 - t}^\\circ$`, `(a) ${angType(t).ms} (b) $${360 - t}^\\circ$`), sp: 's' };
    },
    (r) => {
      const act = r.int(40, 130);
      const est = [act + r.pick([-4, -3, 3, 5]), act + r.pick([-15, 12, 20]), act + r.pick([-30, 25, 35])].map((v) => Math.max(10, v));
      need(new Set(est).size === 3);
      const names = r.names(3);
      const best = est.reduce((b, v, i) => (Math.abs(v - act) < Math.abs(est[b] - act) ? i : b), 0);
      return { q: T(`The measured size of an angle is $${act}^\\circ$. ${names[0]} estimated $${est[0]}^\\circ$, ${names[1]} estimated $${est[1]}^\\circ$ and ${names[2]} estimated $${est[2]}^\\circ$. Whose estimate is most reasonable? Give a reason.`, `Saiz ukuran suatu sudut ialah $${act}^\\circ$. ${names[0]} menganggarkan $${est[0]}^\\circ$, ${names[1]} menganggarkan $${est[1]}^\\circ$ dan ${names[2]} menganggarkan $${est[2]}^\\circ$. Anggaran siapakah yang paling munasabah? Berikan sebab.`), a: T(`${names[best]}'s: the difference is only $${Math.abs(est[best] - act)}^\\circ$, the smallest.`, `${names[best]}: bezanya hanya $${Math.abs(est[best] - act)}^\\circ$, iaitu yang terkecil.`), sp: 's' };
    },
  ];

  const g82e = [
    (r) => {
      const t = r.int(10, 80);
      const k = r.pick([['complement', 'pelengkap', 90], ['supplement', 'penyokong', 180]]);
      const kk = k[2] === 90 ? t : r.int(20, 160);
      return { q: T(`Find the ${k[0]} of $${kk}^\\circ$.`, `Cari sudut ${k[1]} bagi $${kk}^\\circ$.`), a: T(`$${k[2] - kk}^\\circ$`), sp: 'xs' };
    },
    (r) => {
      const t = r.int(30, 150);
      const fig = F.fan({ rays: [0, t, 180], labels: { 0: `${t}°`, 1: 'x' }, w: 260, h: 150, arcR: 28, through: [] });
      return { q: T('Find the value of $x$. State the property used.', 'Cari nilai $x$. Nyatakan sifat yang digunakan.'), fig, a: T(`$x = ${180 - t}$ (angles on a straight line add up to $180^\\circ$)`, `$x = ${180 - t}$ (sudut pada garis lurus berjumlah $180^\\circ$)`), sp: 's' };
    },
    (r) => {
      const a = r.int(60, 130), b = r.int(50, 120);
      const c = 360 - a - b;
      need(c > 20 && c < 200);
      const rays = [0, a, a + b];
      const fig = F.fan({ rays, labels: { 0: `${a}°`, 1: `${b}°`, 2: 'x' }, w: 250, h: 210, arcR: 26 });
      return { q: T('Find the value of $x$. State the property used.', 'Cari nilai $x$. Nyatakan sifat yang digunakan.'), fig, a: T(`$x = ${c}$ (angles at a point add up to $360^\\circ$)`, `$x = ${c}$ (sudut pada satu titik berjumlah $360^\\circ$)`), sp: 's' };
    },
  ];
  const g82m = [
    (r) => {
      const t = r.int(35, 145);
      need(t !== 90);
      // rays 0, t, 180, 180+t: sector 0 = t, sector 1 = 180 - t, sector 2 = t
      const fig = F.fan({ rays: [0, t, 180, 180 + t], labels: { 0: `${t}°`, 1: 'x', 2: 'y' }, w: 260, h: 210, arcR: 26 });
      return {
        q: T('Two straight lines intersect as shown. Find the values of $x$ and $y$, giving a reason for each.', 'Dua garis lurus bersilang seperti yang ditunjukkan. Cari nilai $x$ dan $y$, dengan memberi sebab bagi setiap jawapan.'), fig,
        a: T(`$x = ${180 - t}$ (angles on a straight line); $y = ${t}$ (vertically opposite angle)`, `$x = ${180 - t}$ (sudut pada garis lurus); $y = ${t}$ (sudut bertentang bucu)`), sp: 'm',
      };
    },
    (r) => {
      const a = r.int(20, 80), b = r.int(30, 90), c = r.int(20, 60);
      const d = 180 - a - b - c;
      need(d > 15);
      const fig = F.fan({ rays: [0, a, a + b, a + b + c, 180], labels: { 0: `${a}°`, 1: `${b}°`, 2: `${c}°`, 3: 'x' }, w: 260, h: 160, arcR: 26 });
      return { q: T('The diagram shows a straight line and rays from a point. Find $x$.', 'Rajah menunjukkan garis lurus dan sinar dari satu titik. Cari $x$.'), fig, a: T(`$x = ${d}$`), sp: 's' };
    },
    (r) => {
      const pair = r.pick([['complementary', 'pelengkap', 90], ['supplementary', 'penyokong', 180], ['conjugate', 'konjugat', 360]]);
      const a = pair[2] === 360 ? r.int(100, 250) : r.int(20, pair[2] - 20);
      const b = pair[2] - a;
      return { q: T(`Two angles measure $${a}^\\circ$ and $${b}^\\circ$. What special name is given to such a pair of angles?`, `Dua sudut berukuran $${a}^\\circ$ dan $${b}^\\circ$. Apakah nama khas bagi pasangan sudut sebegini?`), a: T(`${pair[0]} angles (sum $= ${pair[2]}^\\circ$)`, `sudut ${pair[1]} (hasil tambah $= ${pair[2]}^\\circ$)`), sp: 'xs' };
    },
  ];
  const g82a = [
    (r) => {
      const x = r.int(10, 30), a = r.int(2, 3), b = r.int(2, 4);
      const c1 = r.int(5, 20);
      const c2 = 180 - a * x - c1 - b * x;
      need(c2 > -30 && c2 < 40 && a * x + c1 > 10 && b * x + c2 > 10);
      const fig = F.fan({ rays: [0, a * x + c1, 180], labels: { 0: `(${lin(a, c1)})°`, 1: `(${lin(b, c2)})°` }, w: 290, h: 150, arcR: 30 });
      return { q: T('Find the value of $x$ and hence the size of each angle.', 'Cari nilai $x$ dan seterusnya saiz setiap sudut.'), fig, a: T(`$x = ${x}$; angles: $${a * x + c1}^\\circ$ and $${b * x + c2}^\\circ$`, `$x = ${x}$; sudut: $${a * x + c1}^\\circ$ dan $${b * x + c2}^\\circ$`), w: T(`$(${lin(a, c1)}) + (${lin(b, c2)}) = 180$`), sp: 'm' };
    },
    (r) => {
      const x = r.int(8, 20), a = r.int(2, 4), c1 = r.int(-10, 15), b = r.int(1, 3), c2 = r.int(5, 30);
      // vertically opposite angles equal: (a x + c1) = (b x + c2) ... need a != b
      need(a !== b);
      // choose x from equality
      const xx = (c2 - c1) / (a - b);
      need(Number.isInteger(xx) && xx > 4 && xx < 40 && a * xx + c1 > 15 && a * xx + c1 < 170);
      const v = a * xx + c1;
      const fig = F.fan({ rays: [0, 100, 180, 280], labels: { 0: `(${lin(a, c1)})°`, 2: `(${lin(b, c2)})°`, 1: 'y' }, w: 270, h: 210, arcR: 28 });
      return { q: T('Two lines intersect. Find the values of $x$ and $y$.', 'Dua garis bersilang. Cari nilai $x$ dan $y$.'), fig: F.fan({ rays: [0, 80, 180, 260], labels: { 0: `(${lin(a, c1)})°`, 2: `(${lin(b, c2)})°`, 1: 'y' }, w: 270, h: 210, arcR: 28 }), a: T(`$x = ${xx}$, $y = ${180 - v}$`), w: T(`Vertically opposite angles are equal.`, `Sudut bertentang bucu adalah sama.`), sp: 'm' };
    },
  ];

  const g83e = [
    (r) => {
    const t = r.int(35, 145);
    need(t !== 90);
    const rels = [
      { from: ['U', 'ne'], to: ['L', 'ne'], name: T('corresponding angles', 'sudut sepadan') },
      { from: ['U', 'se'], to: ['L', 'nw'], name: T('alternate angles', 'sudut berselang-seli') },
      { from: ['U', 'sw'], to: ['L', 'ne'], name: T('alternate angles', 'sudut berselang-seli') },
      { from: ['U', 'se'], to: ['L', 'ne'], name: T('co-interior angles', 'sudut dalam sebelah') },
      { from: ['U', 'sw'], to: ['L', 'nw'], name: T('co-interior angles', 'sudut dalam sebelah') },
      { from: ['U', 'nw'], to: ['L', 'nw'], name: T('corresponding angles', 'sudut sepadan') },
    ];
    const rel = r.pick(rels);
    const given = F.parSize(rel.from[1], t);
    const sol = F.parSize(rel.to[1], t);
    const fig = F.parallel({ t, marks: [{ at: rel.from[0], pos: rel.from[1], label: `${given}°` }, { at: rel.to[0], pos: rel.to[1], label: 'x' }], names: true });
    return { q: T('In the diagram, $PQ$ is parallel to $RS$. Find the value of $x$ and name the type of angle pair.', 'Dalam rajah, $PQ$ adalah selari dengan $RS$. Cari nilai $x$ dan namakan jenis pasangan sudut itu.'), fig, a: T(`$x = ${sol}$ (${rel.name.en})`, `$x = ${sol}$ (${rel.name.ms})`), sp: 's' };
    },
  ];
  const g83m = [
    (r) => {
      const t = r.int(40, 140);
      need(t !== 90);
      // known angle at U (ne) = t, ask y at L (se): L se = 180 - t ; also chain: find x at L sw (=t? sw=t) -> co-interior etc
      const fig = F.parallel({ t, marks: [{ at: 'U', pos: 'ne', label: `${t}°` }, { at: 'L', pos: 'se', label: 'x' }, { at: 'L', pos: 'nw', label: 'y' }], names: true });
      return { q: T('In the diagram, $PQ \\parallel RS$. Find the values of $x$ and $y$, giving a reason for each.', 'Dalam rajah, $PQ \\parallel RS$. Cari nilai $x$ dan $y$, dengan memberi sebab bagi setiap jawapan.'), fig, a: T(`$x = ${180 - t}$ (corresponding angle $${t}^\\circ$, then angles on a straight line); $y = ${180 - t}$ (co-interior/alternate)`, `$x = ${180 - t}$ (sudut sepadan $${t}^\\circ$, kemudian sudut pada garis lurus); $y = ${180 - t}$ (sudut dalam sebelah/berselang-seli)`), sp: 'm' };
    },
    (r) => {
      const t = r.int(40, 140);
      need(t !== 90);
      const ok = r.chance();
      const other = ok ? t : t + r.pick([-8, -6, 6, 8, 10]);
      const fig = F.parallel({ t, lowerAngle: ok ? 0 : t - other, marks: [{ at: 'U', pos: 'ne', label: `${t}°` }, { at: 'L', pos: 'ne', label: `${other}°` }], names: true });
      return { q: T('The diagram shows two lines $PQ$ and $RS$ cut by a transversal. Are $PQ$ and $RS$ parallel? Give a reason.', 'Rajah menunjukkan dua garis $PQ$ dan $RS$ dipotong oleh satu garis rentas. Adakah $PQ$ dan $RS$ selari? Berikan sebab.'), fig, a: ok ? T(`Yes. The corresponding angles are equal ($${t}^\\circ = ${other}^\\circ$).`, `Ya. Sudut sepadan adalah sama ($${t}^\\circ = ${other}^\\circ$).`) : T(`No. The corresponding angles are not equal ($${t}^\\circ \\ne ${other}^\\circ$).`, `Tidak. Sudut sepadan tidak sama ($${t}^\\circ \\ne ${other}^\\circ$).`), sp: 's' };
    },
  ];
  const zigzag = (al, be, lab, w, h) => {
    const yU = 40, yL = h - 40;
    const A = [w / 2 - 70, yU], B = [w / 2 - 40, yL], X = [w / 2 + 50, (yU + yL) / 2];
    let out = S.line(20, yU, w - 20, yU) + S.line(20, yL, w - 20, yL);
    out += S.line(A[0], A[1], X[0], X[1]) + S.line(B[0], B[1], X[0], X[1]);
    for (const y of [yU, yL]) out += S.poly([[w - 60, y - 5], [w - 52, y], [w - 60, y + 5]], { open: true, w: 1.1 });
    out += S.arc(A, [A[0] + 50, A[1]], X, 26, al, { gap: 14 }) + S.arc(B, [B[0] + 50, B[1]], X, 26, be, { gap: 14 });
    out += S.arc(X, A, B, 22, lab, { gap: 14 });
    out += S.text(A[0] - 10, A[1] - 12, 'A', { i: true }) + S.text(B[0] - 10, B[1] + 12, 'B', { i: true }) + S.text(X[0] + 12, X[1], 'X', { i: true });
    return S.wrap(w, h, out, 'parallel lines and angles');
  };
  const g83a = [
    (r) => {
      const al = r.int(25, 70), be = r.int(25, 75);
      // angle A X B as al + be (angles measured on X's side)
      const fig = zigzag(`${al}°`, `${be}°`, 'x', 300, 190);
      return { q: T('The two horizontal lines are parallel. Find the value of $x$. (Hint: draw an auxiliary line through $X$ parallel to the given lines.)', 'Dua garis mengufuk adalah selari. Cari nilai $x$. (Petunjuk: lukis satu garis bantu melalui $X$ yang selari dengan garis yang diberi.)'), fig, a: T(`$x = ${al + be}$ ($${al}^\\circ + ${be}^\\circ$, alternate angles with the auxiliary line)`, `$x = ${al + be}$ ($${al}^\\circ + ${be}^\\circ$, sudut berselang-seli dengan garis bantu)`), sp: 'm' };
    },
    (r) => {
      const t = r.int(50, 130);
      need(t !== 90);
      const a = r.int(2, 3), b = r.int(1, 2);
      // known: co-interior: (a x + c) + t' = 180 with t' = t  -> a x + c = 180 - t
      const x = r.int(10, 30);
      const c = 180 - t - a * x;
      need(Math.abs(c) < 40 && c !== 0);
      const fig = F.parallel({ t, marks: [{ at: 'U', pos: 'se', label: `(${lin(a, c)})°` }, { at: 'L', pos: 'ne', label: `${t}°` }], names: true });
      return { q: T('$PQ \\parallel RS$. Form an equation and find $x$.', '$PQ \\parallel RS$. Bentukkan satu persamaan dan cari $x$.'), fig, a: T(`$${lin(a, c)} + ${t} = 180$; $x = ${x}$ (co-interior angles)`, `$${lin(a, c)} + ${t} = 180$; $x = ${x}$ (sudut dalam sebelah)`), sp: 'm' };
    },
  ];

  const elevFig = (kind, lab, w, h) => {
    w = w || 300; h = h || 190;
    const O = kind === 'depr' ? [50, 45] : [50, h - 40];
    const P = kind === 'depr' ? [w - 60, h - 40] : [w - 60, 45];
    let out = S.line(O[0], O[1], w - 20, O[1], { dash: true });
    out += S.line(O[0], O[1], P[0], P[1]);
    out += S.arc(O, [w - 20, O[1]], P, 42, lab, { gap: 16 });
    out += S.dot(O[0], O[1], 3) + S.dot(P[0], P[1], 3);
    out += S.text(O[0] - 12, O[1], kind === 'depr' ? 'A' : 'B', { i: true }) + S.text(P[0] + 12, P[1], kind === 'depr' ? 'B' : 'A', { i: true });
    return S.wrap(w, h, out, kind === 'depr' ? 'angle of depression' : 'angle of elevation');
  };
  const g84e = [
    (r) => {
      const kind = r.pick(['depr', 'elev']);
      const fig = elevFig(kind, 'x');
      const who = kind === 'depr' ? T('an observer at $A$ looking down at a boat at $B$', 'seorang pemerhati di $A$ melihat ke bawah sebuah bot di $B$') : T('an observer at $B$ looking up at a bird at $A$', 'seorang pemerhati di $B$ melihat ke atas seekor burung di $A$');
      return { q: T(`The diagram shows ${who.en}. The dashed line is horizontal. Is the angle marked $x$ an angle of elevation or an angle of depression?`, `Rajah menunjukkan ${who.ms}. Garis putus-putus adalah mengufuk. Adakah sudut bertanda $x$ sudut dongakan atau sudut tunduk?`), fig, a: kind === 'depr' ? T('Angle of depression', 'Sudut tunduk') : T('Angle of elevation', 'Sudut dongakan'), sp: 's' };
    },
    (r) => {
      const t = r.int(15, 60);
      return { q: T(`From the top of a lighthouse, the angle of depression of a boat is $${t}^\\circ$. Sketch a diagram to show this angle and label it.`, `Dari puncak sebuah rumah api, sudut tunduk sebuah bot ialah $${t}^\\circ$. Lakarkan satu rajah untuk menunjukkan sudut ini dan labelkannya.`), a: T(`A horizontal line from the top of the lighthouse; the line of sight down to the boat; the angle between them (below the horizontal) is $${t}^\\circ$.`, `Garis mengufuk dari puncak rumah api; garis penglihatan ke bawah ke arah bot; sudut antara keduanya (di bawah garis mengufuk) ialah $${t}^\\circ$.`), sp: 'l' };
    },
  ];
  const g84m = [
    (r) => {
      const t = r.int(15, 60);
      const fig = elevFig('depr', `${t}°`);
      return { q: T(`From point $A$ on a cliff, the angle of depression of a boat $B$ is $${t}^\\circ$. Find the angle of elevation of $A$ from $B$. Give a reason.`, `Dari titik $A$ di atas sebuah cenuk, sudut tunduk bot $B$ ialah $${t}^\\circ$. Cari sudut dongakan $A$ dari $B$. Berikan sebab.`), fig, a: T(`$${t}^\\circ$ (alternate angles, since the horizontal lines are parallel)`, `$${t}^\\circ$ (sudut berselang-seli, kerana garis-garis mengufuk adalah selari)`), sp: 's' };
    },
    (r) => {
      const t = r.int(20, 65);
      return { q: T(`A boy at $P$ looks up at a kite at $Q$ with an angle of elevation of $${t}^\\circ$. State the angle of depression of $P$ from $Q$.`, `Seorang budak lelaki di $P$ melihat ke atas sebuah layang-layang di $Q$ dengan sudut dongakan $${t}^\\circ$. Nyatakan sudut tunduk $P$ dari $Q$.`), a: T(`$${t}^\\circ$`), sp: 's' };
    },
  ];
  const g84a = [
    (r) => {
      const t = r.int(20, 55);
      return { q: T(`From the top $T$ of a vertical tower, the angle of depression of a car $C$ on level ground is $${t}^\\circ$. Find (a) the angle of elevation of $T$ from $C$, (b) the angle between the line of sight $TC$ and the tower.`, `Dari puncak $T$ sebuah menara tegak, sudut tunduk sebuah kereta $C$ di atas tanah rata ialah $${t}^\\circ$. Cari (a) sudut dongakan $T$ dari $C$, (b) sudut antara garis penglihatan $TC$ dengan menara.`), a: T(`(a) $${t}^\\circ$ (b) $${90 - t}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(20, 40), b = r.int(a + 10, 65);
      return { q: T(`Anwar stands on the 20th floor and sees a car park at an angle of depression of $${b}^\\circ$. Farah, on a higher floor of the same building, sees the same spot at an angle of depression of $${a}^\\circ$. State the angles of elevation of each of them from the spot, and find the difference between the two angles.`, `Anwar berdiri di tingkat 20 dan melihat sebuah tempat letak kereta pada sudut tunduk $${b}^\\circ$. Farah, di tingkat yang lebih tinggi dalam bangunan yang sama, melihat tempat yang sama pada sudut tunduk $${a}^\\circ$. Nyatakan sudut dongakan bagi setiap orang dari tempat itu, dan cari beza antara kedua-dua sudut.`), a: T(`Anwar: $${b}^\\circ$; Farah: $${a}^\\circ$; difference $${b - a}^\\circ$`, `Anwar: $${b}^\\circ$; Farah: $${a}^\\circ$; beza $${b - a}^\\circ$`), sp: 'm' };
    },
  ];

  const CONSTR = [
    { name: T('perpendicular bisector of a line segment', 'pembahagi dua sama serenjang bagi suatu tembereng garis'), steps: [T('Set the compass to more than half the length of $AB$.', 'Laraskan jangka lukis kepada lebih daripada separuh panjang $AB$.'), T('With centre $A$, draw an arc above and below $AB$.', 'Dengan pusat $A$, lukis lengkok di atas dan di bawah $AB$.'), T('With the same radius and centre $B$, draw arcs to cross the first two arcs.', 'Dengan jejari yang sama dan pusat $B$, lukis lengkok yang menyilang dua lengkok pertama.'), T('Join the two intersection points with a ruler.', 'Sambungkan dua titik persilangan dengan pembaris.')], why: T('Every point on the line is equidistant from $A$ and $B$ because the arcs have equal radii.', 'Setiap titik pada garis itu sama jarak dari $A$ dan $B$ kerana lengkok-lengkok mempunyai jejari yang sama.') },
    { name: T('bisector of an angle', 'pembahagi dua sama sudut'), steps: [T('With the compass at the vertex, draw an arc cutting both arms of the angle.', 'Dengan jangka lukis di bucu, lukis lengkok yang memotong kedua-dua lengan sudut.'), T('With the compass at each intersection point in turn, draw two arcs of equal radius that cross inside the angle.', 'Dengan jangka lukis di setiap titik persilangan bergilir-gilir, lukis dua lengkok berjejari sama yang bersilang di dalam sudut.'), T('Draw a line from the vertex through the crossing point.', 'Lukis garis dari bucu melalui titik silangan itu.')], why: T('The two triangles formed are congruent (SSS), so the two angles are equal.', 'Dua segi tiga yang terbentuk adalah kongruen (SSS), jadi kedua-dua sudut adalah sama.') },
    { name: T('a $60^\\circ$ angle', 'sudut $60^\\circ$'), steps: [T('Draw a line $PQ$ and, with centre $P$, draw an arc cutting $PQ$ at $R$.', 'Lukis garis $PQ$ dan dengan pusat $P$, lukis lengkok yang memotong $PQ$ di $R$.'), T('With the same radius and centre $R$, draw an arc cutting the first arc at $S$.', 'Dengan jejari yang sama dan pusat $R$, lukis lengkok yang memotong lengkok pertama di $S$.'), T('Join $P$ to $S$; then $\\angle SPQ = 60^\\circ$.', 'Sambungkan $P$ ke $S$; maka $\\angle SPQ = 60^\\circ$.')], why: T('$PR = PS = RS$, so triangle $PRS$ is equilateral.', '$PR = PS = RS$, jadi segi tiga $PRS$ ialah segi tiga sama sisi.') },
    { name: T('a perpendicular to a line through a point $P$ on the line', 'serenjang kepada satu garis melalui titik $P$ pada garis itu'), steps: [T('With centre $P$, draw arcs cutting the line at $A$ and $B$ on either side.', 'Dengan pusat $P$, lukis lengkok yang memotong garis itu di $A$ dan $B$ pada kedua-dua belah.'), T('With centres $A$ and $B$ and a larger equal radius, draw arcs that cross above the line.', 'Dengan pusat $A$ dan $B$ dan jejari sama yang lebih besar, lukis lengkok yang bersilang di atas garis.'), T('Join $P$ to the crossing point.', 'Sambungkan $P$ ke titik silangan itu.')], why: T('$P$ is the midpoint of $AB$, and the crossing point is equidistant from $A$ and $B$, so the line is the perpendicular bisector of $AB$.', '$P$ ialah titik tengah $AB$, dan titik silangan sama jarak dari $A$ dan $B$, jadi garis itu ialah pembahagi dua sama serenjang bagi $AB$.') },
  ];
  const g85e = [
    (r) => {
      const c = r.pick(CONSTR);
      const wrong = r.sample(CONSTR.filter((x) => x !== c), 2);
      const opts = r.shuffle([c, ...wrong]);
      const L = ['A', 'B', 'C'];
      const list = opts.map((o, i) => `(${L[i]}) ${o.name.en}`).join('; ');
      const list2 = opts.map((o, i) => `(${L[i]}) ${o.name.ms}`).join('; ');
      return { q: T(`Which construction is described by these steps? "${c.steps.map((s) => s.en).join(' ')}" Choose from: ${list}.`, `Pembinaan manakah yang diterangkan oleh langkah-langkah ini? "${c.steps.map((s) => s.ms).join(' ')}" Pilih daripada: ${list2}.`), a: T(`(${L[opts.indexOf(c)]}) ${c.name.en}`, `(${L[opts.indexOf(c)]}) ${c.name.ms}`), sp: 's' };
    },
  ];
  const g85m = [
    (r) => {
      const c = r.pick(CONSTR);
      const order = r.shuffle(c.steps.map((_, i) => i));
      const L = ['A', 'B', 'C', 'D'];
      const list = order.map((o, i) => `(${L[i]}) ${c.steps[o].en}`).join(' ');
      const list2 = order.map((o, i) => `(${L[i]}) ${c.steps[o].ms}`).join(' ');
      const ans = c.steps.map((_, i) => L[order.indexOf(i)]).join(' → ');
      return { q: T(`The steps for constructing ${c.name.en} are shown in the wrong order. Write the correct order. ${list}`, `Langkah-langkah untuk membina ${c.name.ms} ditunjukkan dalam susunan yang salah. Tulis susunan yang betul. ${list2}`), a: T(ans), sp: 's' };
    },
    (r) => {
      const c = r.pick(CONSTR);
      return { q: T(`Explain why the construction of ${c.name.en} gives the required result.`, `Terangkan mengapa pembinaan ${c.name.ms} memberikan hasil yang dikehendaki.`), a: c.why, sp: 'm' };
    },
  ];
  const g85a = [
    (r) => {
      const ab = r.int(5, 8), A = r.pick([45, 50, 60]), B = r.pick([45, 60, 70]);
      const C = 180 - A - B;
      const ac = round((ab * Math.sin((B * Math.PI) / 180)) / Math.sin((C * Math.PI) / 180), 1);
      const bc = round((ab * Math.sin((A * Math.PI) / 180)) / Math.sin((C * Math.PI) / 180), 1);
      return { q: T(`Using a ruler, a compass and a protractor as needed, construct triangle $ABC$ with $AB = ${ab}$ cm, $\\angle BAC = ${A}^\\circ$ and $\\angle ABC = ${B}^\\circ$. Measure $\\angle ACB$ and the length of $AC$.`, `Dengan menggunakan pembaris, jangka lukis dan protraktor jika perlu, bina segi tiga $ABC$ dengan $AB = ${ab}$ cm, $\\angle BAC = ${A}^\\circ$ dan $\\angle ABC = ${B}^\\circ$. Ukur $\\angle ACB$ dan panjang $AC$.`), a: T(`$\\angle ACB = ${C}^\\circ$; $AC \\approx ${ac}$ cm ($BC \\approx ${bc}$ cm), tolerance $\\pm 2$ mm.`, `$\\angle ACB = ${C}^\\circ$; $AC \\approx ${ac}$ cm ($BC \\approx ${bc}$ cm), toleransi $\\pm 2$ mm.`), sp: 'xxl' };
    },
    (r) => {
      const d = r.int(4, 7);
      return { q: T(`Construct a line segment $AB = ${d + 2}$ cm. Construct the perpendicular bisector of $AB$ and mark on it a point $P$ which is ${d} cm from $A$. Measure $PB$ and give a reason for your answer.`, `Bina tembereng garis $AB = ${d + 2}$ cm. Bina pembahagi dua sama serenjang bagi $AB$ dan tandakan padanya satu titik $P$ yang berjarak ${d} cm dari $A$. Ukur $PB$ dan berikan sebab bagi jawapan anda.`), a: T(`$PB = ${d}$ cm, because every point on the perpendicular bisector is equidistant from $A$ and $B$.`, `$PB = ${d}$ cm, kerana setiap titik pada pembahagi dua sama serenjang adalah sama jarak dari $A$ dan $B$.`), sp: 'xxl' };
    },
  ];

  SPM.addChapter(1, 8, T('Lines and Angles', 'Garis dan Sudut'), [
    { id: '8.1', en: 'Lines, line segments and angles', ms: 'Garis, tembereng garis dan sudut', gen: { e: g81e, m: g81m, a: g81a } },
    { id: '8.2', en: 'Angles related to intersecting lines', ms: 'Sudut yang berkaitan dengan garis bersilang', gen: { e: g82e, m: g82m, a: g82a } },
    { id: '8.3', en: 'Angles related to parallel lines and transversals', ms: 'Sudut yang berkaitan dengan garis selari dan garis rentas', gen: { e: g83e, m: g83m, a: g83a } },
    { id: '8.4', en: 'Angles of elevation and depression', ms: 'Sudut dongakan dan sudut tunduk', gen: { e: g84e, m: g84m, a: g84a } },
    { id: '8.5', en: 'Geometric constructions', ms: 'Pembinaan geometri', gen: { e: g85e, m: g85m, a: g85a } },
  ]);

  /* =============================================================== 9 */
  const POLY = ['', '', '', 'triangle', 'quadrilateral', 'pentagon', 'hexagon', 'heptagon', 'octagon', 'nonagon', 'decagon'];
  const POLYMS = ['', '', '', 'segi tiga', 'sisi empat', 'pentagon', 'heksagon', 'heptagon', 'oktagon', 'nonagon', 'dekagon'];
  const regularPts = (k, rot0) => Array.from({ length: k }, (_, i) => [Math.cos((2 * Math.PI * i) / k + (rot0 || Math.PI / 2)), -Math.sin((2 * Math.PI * i) / k + (rot0 || Math.PI / 2))]);
  const g91e = [
    (r) => {
      const k = r.int(3, 10);
      return { q: T(`Name the polygon that has ${k} sides.`, `Namakan poligon yang mempunyai ${k} sisi.`), a: T(POLY[k], POLYMS[k]), sp: 'xs' };
    },
    (r) => {
      const k = r.int(5, 10);
      return { q: T(`A ${POLY[k]} has how many (a) vertices, (b) diagonals that can be drawn from one vertex?`, `Sebuah ${POLYMS[k]} mempunyai berapa banyak (a) bucu, (b) pepenjuru yang boleh dilukis dari satu bucu?`), a: T(`(a) ${k} (b) ${k - 3}`), sp: 's' };
    },
    (r) => {
      const k = r.int(5, 7);
      const names = 'ABCDEFG'.slice(0, k).split('');
      const fig = F.polygon({ pts: regularPts(k), names, w: 210, h: 190 });
      const order = names.join('');
      const i0 = r.int(0, k - 1);
      const valid = order.slice(i0) + order.slice(0, i0);
      const rev = valid.split('').reverse().join('');
      const bad = (() => { const a = valid.split(''); [a[1], a[2]] = [a[2], a[1]]; return a.join(''); })();
      const opts = r.shuffle([[valid, true], [bad, false]]);
      return { q: T(`Which of these is a valid name for the polygon shown: ${opts[0][0]} or ${opts[1][0]}?`, `Antara berikut, yang manakah nama yang sah bagi poligon yang ditunjukkan: ${opts[0][0]} atau ${opts[1][0]}?`), fig, a: T(`${valid} (the vertices are listed in order around the polygon)`, `${valid} (bucu disenaraikan mengikut susunan di sekeliling poligon)`), sp: 's' };
    },
  ];
  const g91m = [
    (r) => {
      const ks = r.sample([4, 5, 6, 7, 8, 9], 3).sort((a, b) => a - b);
      const rows = [['Sides', ...ks.map((k) => '')], ['Vertices', ...ks.map(() => '')]];
      const which = r.pick(['diag1', 'total']);
      const tab = SPM.table([['$n$', ...ks.map((k) => `$${k}$`)], [which === 'diag1' ? '$n-3$' : '$\\frac{n(n-3)}{2}$', ...ks.map(() => '')]]);
      return { q: T(`Complete the table for a polygon with $n$ sides. Row 2 gives ${which === 'diag1' ? 'the number of diagonals from one vertex' : 'the total number of diagonals'}.<br>${tab}`, `Lengkapkan jadual bagi poligon dengan $n$ sisi. Baris 2 memberi ${which === 'diag1' ? 'bilangan pepenjuru dari satu bucu' : 'jumlah bilangan pepenjuru'}.<br>${tab}`), a: T(`$${ks.map((k) => (which === 'diag1' ? k - 3 : (k * (k - 3)) / 2)).join(',\\ ')}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(5, 12);
      return { q: T(`Find the total number of diagonals in a polygon with ${k} sides.`, `Cari jumlah bilangan pepenjuru dalam poligon yang mempunyai ${k} sisi.`), a: T(`$\\dfrac{${k}(${k}-3)}{2} = ${(k * (k - 3)) / 2}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(5, 7);
      const names = 'PQRSTUV'.slice(0, k).split('');
      const start = r.int(0, k - 1);
      const dir = r.chance();
      const arr = [];
      for (let i = 0; i < k; i++) arr.push(names[(start + (dir ? i : -i) + 2 * k) % k]);
      return { q: T(`A ${POLY[k]} has vertices ${names.join(', ')} in order. Write one valid name for the polygon starting from vertex ${names[start]} and going ${dir ? 'in the same direction' : 'in the opposite direction'} as ${names.join('')}.`, `Sebuah ${POLYMS[k]} mempunyai bucu ${names.join(', ')} mengikut susunan. Tulis satu nama yang sah bagi poligon itu bermula dari bucu ${names[start]} dan bergerak ${dir ? 'dalam arah yang sama' : 'dalam arah bertentangan'} dengan ${names.join('')}.`), a: T(arr.join('')), sp: 's' };
    },
  ];
  const g91a = [
    (r) => {
      const k = r.int(6, 12);
      const d = (k * (k - 3)) / 2;
      return { q: T(`A polygon has ${d} diagonals in total. Find the number of sides of the polygon.`, `Sebuah poligon mempunyai ${d} pepenjuru kesemuanya. Cari bilangan sisi poligon itu.`), a: T(`${k} sides`, `${k} sisi`), w: T(`$\\dfrac{n(n-3)}{2} = ${d}$, so $n(n-3) = ${2 * d}$`), sp: 'm' };
    },
    (r) => {
      const k = r.int(6, 9);
      const names = 'ABCDEFGHI'.slice(0, k).split('');
      const bad = names[0] + names[2] + names[1] + names.slice(3).join('');
      return { q: T(`The polygon $${names.join('')}$ has ${k} vertices labelled in order. Explain why $${bad}$ is not a valid name for this polygon.`, `Poligon $${names.join('')}$ mempunyai ${k} bucu yang dilabel mengikut susunan. Terangkan mengapa $${bad}$ bukan nama yang sah bagi poligon ini.`), a: T(`In ${bad}, $${names[0]}$ is followed by $${names[2]}$ although $${names[0]}$ and $${names[2]}$ are not adjacent vertices. Consecutive letters must be neighbouring vertices.`, `Dalam ${bad}, $${names[0]}$ diikuti oleh $${names[2]}$ walaupun $${names[0]}$ dan $${names[2]}$ bukan bucu bersebelahan. Huruf berturutan mesti bucu berjiran.`), sp: 'm' };
    },
    (r) => {
      const k = r.int(7, 12);
      return { q: T(`From one vertex of a polygon, ${k - 3} diagonals can be drawn. (a) How many sides does the polygon have? (b) How many diagonals does it have in total?`, `Dari satu bucu sebuah poligon, ${k - 3} pepenjuru boleh dilukis. (a) Berapakah bilangan sisi poligon itu? (b) Berapakah jumlah pepenjurunya?`), a: T(`(a) ${k} (b) ${(k * (k - 3)) / 2}`), sp: 'm' };
    },
  ];
  const g91Se = [
    (r) => {
      const conv = r.chance();
      const pts = conv ? [[0, 0], [5, 0], [6, 3], [2.5, 5], [-1, 3]] : [[0, 0], [5, 0], [5, 5], [2.5, 2], [0, 5]];
      const fig = F.polygon({ pts, names: ['A', 'B', 'C', 'D', 'E'], w: 210, h: 190 });
      return { q: T('State whether the pentagon shown is convex or concave, and give a reason.', 'Nyatakan sama ada pentagon yang ditunjukkan ialah cembung atau cekung, dan berikan sebab.'), fig, a: conv ? T('Convex: all interior angles are less than $180^\\circ$.', 'Cembung: semua sudut pedalaman kurang daripada $180^\\circ$.') : T('Concave: one interior angle is greater than $180^\\circ$ (at $D$).', 'Cekung: satu sudut pedalaman melebihi $180^\\circ$ (di $D$).'), sp: 's' };
    },
    (r) => {
      const k = r.int(3, 8);
      const kind = r.pick([[T('all sides equal and all angles equal', 'semua sisi sama dan semua sudut sama'), true], [T('all sides equal but angles not all equal', 'semua sisi sama tetapi sudut tidak semua sama'), false], [T('sides of different lengths', 'sisi-sisi berlainan panjang'), false]]);
      return { q: T(`A polygon with ${k} sides has ${kind[0].en}. Is it a regular polygon?`, `Sebuah poligon dengan ${k} sisi mempunyai ${kind[0].ms}. Adakah ia poligon sekata?`), a: kind[1] ? T('Yes', 'Ya') : T('No — a regular polygon needs both equal sides and equal angles.', 'Tidak — poligon sekata memerlukan sisi sama dan sudut sama.'), sp: 's' };
    },
  ];

  const triTypeAng = (a, b, c) => (Math.max(a, b, c) < 90 ? T('acute-angled', 'bersudut akut') : Math.max(a, b, c) === 90 ? T('right-angled', 'bersudut tegak') : T('obtuse-angled', 'bersudut cakah'));
  const g92e = [
    (r) => {
      const a = r.int(30, 80), b = r.int(30, 80);
      need(a + b < 150);
      const c = 180 - a - b;
      const fig = F.triangle({ a, b, angles: { A: `${a}°`, B: `${b}°`, C: 'x' } });
      return { q: withNTS(T('Find the value of $x$.', 'Cari nilai $x$.')), fig, a: T(`$x = ${c}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(20, 100), b = r.int(20, 100);
      const c = 180 - a - b;
      need(c > 10 && a !== 90 && b !== 90);
      return { q: T(`The angles of a triangle are $${a}^\\circ$, $${b}^\\circ$ and $${c}^\\circ$. Classify the triangle by its angles.`, `Sudut-sudut sebuah segi tiga ialah $${a}^\\circ$, $${b}^\\circ$ dan $${c}^\\circ$. Kelaskan segi tiga itu mengikut sudutnya.`), a: triTypeAng(a, b, c), sp: 'xs' };
    },
    (r) => {
      const type = r.pick([[T('all three sides equal', 'ketiga-tiga sisi sama'), T('equilateral', 'sama sisi')], [T('two sides equal', 'dua sisi sama'), T('isosceles', 'sama kaki')], [T('no sides equal', 'tiada sisi yang sama'), T('scalene', 'tak sama sisi')]]);
      return { q: T(`Name the triangle that has ${type[0].en}.`, `Namakan segi tiga yang mempunyai ${type[0].ms}.`), a: type[1], sp: 'xs' };
    },
  ];
  const g92m = [
    (r) => {
      const a = r.int(30, 80), b = r.int(30, 80);
      need(a + b < 150 && a !== b);
      const fig = F.triangle({ a, b, angles: { A: `${a}°`, B: `${b}°` }, ext: { from: 'A', at: 'B', label: 'x' } });
      return { q: withNTS(T('Find the value of $x$. State the property used.', 'Cari nilai $x$. Nyatakan sifat yang digunakan.')), fig, a: T(`$x = ${a + (180 - a - b)}$ (exterior angle = sum of the two interior opposite angles)`, `$x = ${a + (180 - a - b)}$ (sudut peluaran = hasil tambah dua sudut pedalaman yang bertentangan)`), sp: 's' };
    },
    (r) => {
      const apex = r.pick([true, false]);
      const g = r.int(30, 80);
      if (apex) {
        const A = r.int(30, 130);
        const b = (180 - A) / 2;
        need(Number.isInteger(b));
        return { q: T(`An isosceles triangle has an apex angle of $${A}^\\circ$. Find the size of each base angle.`, `Sebuah segi tiga sama kaki mempunyai sudut puncak $${A}^\\circ$. Cari saiz setiap sudut tapak.`), a: T(`$${b}^\\circ$`), sp: 's' };
      }
      const B = r.int(30, 80);
      return { q: T(`An isosceles triangle has a base angle of $${B}^\\circ$. Find the apex angle.`, `Sebuah segi tiga sama kaki mempunyai sudut tapak $${B}^\\circ$. Cari sudut puncak.`), a: T(`$${180 - 2 * B}^\\circ$`), sp: 's' };
    },
    (r) => {
      const b = r.int(35, 70);
      const fig = F.triangle({ a: b, b, angles: { A: `${b}°`, C: 'x' }, ticks: { AC: 1, BC: 1 } });
      return { q: withNTS(T('The triangle is isosceles ($AC = BC$). Find $x$.', 'Segi tiga itu sama kaki ($AC = BC$). Cari $x$.')), fig, a: T(`$x = ${180 - 2 * b}$`), sp: 's' };
    },
  ];
  const g92a = [
    (r) => {
      const x = r.int(10, 30);
      const a = r.int(1, 3), b = r.int(1, 2), c = r.int(2, 3);
      const c1 = r.int(-10, 10), c2 = r.int(-15, 15);
      const A = a + b + c;
      const cc = 180 - A * x - c1 - c2;
      need(cc === 0 || true);
      // angles (a x + c1), (b x + c2), (c x + k) sum 180 -> k = 180 - A x - c1 - c2
      const k = 180 - A * x - c1 - c2;
      need(Math.abs(k) < 40);
      return { q: T(`The angles of a triangle are $(${lin(a, c1)})^\\circ$, $(${lin(b, c2)})^\\circ$ and $(${lin(c, k)})^\\circ$. Find the value of $x$ and the size of the largest angle.`, `Sudut-sudut sebuah segi tiga ialah $(${lin(a, c1)})^\\circ$, $(${lin(b, c2)})^\\circ$ dan $(${lin(c, k)})^\\circ$. Cari nilai $x$ dan saiz sudut yang terbesar.`), a: T(`$x = ${x}$; largest angle $${Math.max(a * x + c1, b * x + c2, c * x + k)}^\\circ$`, `$x = ${x}$; sudut terbesar $${Math.max(a * x + c1, b * x + c2, c * x + k)}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const x = r.int(10, 25);
      const i1 = r.int(1, 2), i2 = r.int(1, 2), e = r.int(3, 4);
      const c1 = r.int(5, 20), c2 = r.int(10, 30);
      const ext = i1 * x + c1 + i2 * x + c2;
      // exterior = e x + k  => k = ext - e x
      const k = ext - e * x;
      need(e !== i1 + i2 && Math.abs(k) < 60 && ext < 175);
      return { q: T(`The exterior angle of a triangle is $(${lin(e, k)})^\\circ$ and the two interior opposite angles are $(${lin(i1, c1)})^\\circ$ and $(${lin(i2, c2)})^\\circ$. Find $x$.`, `Sudut peluaran sebuah segi tiga ialah $(${lin(e, k)})^\\circ$ dan dua sudut pedalaman yang bertentangan ialah $(${lin(i1, c1)})^\\circ$ dan $(${lin(i2, c2)})^\\circ$. Cari $x$.`), a: T(`$x = ${x}$`), w: T(`$${lin(e, k)} = (${lin(i1, c1)}) + (${lin(i2, c2)})$`), sp: 'm' };
    },
    (r) => {
      const b = r.int(40, 70), p = r.int(20, 40), c = r.int(35, 60);
      const adc = b + p;
      const dac = 180 - c - adc;
      need(dac > 10 && adc < 130);
      const fig = F.polygon({ pts: [[2.5, -4], [0, 0], [7, 0]], names: ['A', 'B', 'C'], w: 280, h: 190, extra: (P, Cn) => {
        const D = [P[1][0] + (P[2][0] - P[1][0]) * 0.42, P[1][1]];
        return S.line(P[0][0], P[0][1], D[0], D[1]) + S.text(D[0], D[1] + 14, 'D', { i: true }) + S.arc(P[1], P[2], P[0], 20, `${b}°`, { gap: 13 }) + S.arc(P[0], P[1], D, 26, `${p}°`, { gap: 13 }) + S.arc(P[2], P[0], P[1], 22, `${c}°`, { gap: 14 });
      } });
      return { q: withNTS(T(`In triangle $ABC$, $D$ is a point on $BC$. $\\angle ABC = ${b}^\\circ$, $\\angle BAD = ${p}^\\circ$ and $\\angle ACB = ${c}^\\circ$. Find (a) $\\angle ADC$, (b) $\\angle DAC$.`, `Dalam segi tiga $ABC$, $D$ ialah satu titik pada $BC$. $\\angle ABC = ${b}^\\circ$, $\\angle BAD = ${p}^\\circ$ dan $\\angle ACB = ${c}^\\circ$. Cari (a) $\\angle ADC$, (b) $\\angle DAC$.`)), fig, a: T(`(a) $${adc}^\\circ$ (exterior angle of $\\triangle ABD$) (b) $${dac}^\\circ$`, `(a) $${adc}^\\circ$ (sudut peluaran $\\triangle ABD$) (b) $${dac}^\\circ$`), sp: 'l' };
    },
  ];

  const QUAD = {
    kite: T('kite', 'layang-layang'), rhombus: T('rhombus', 'rombus'), parallelogram: T('parallelogram', 'segi empat selari'), rectangle: T('rectangle', 'segi empat tepat'), square: T('square', 'segi empat sama'), trapezium: T('trapezium', 'trapezium'),
  };
  const g93e = [
    (r) => {
      const a = r.int(60, 120), b = r.int(60, 110), c = r.int(60, 110);
      const d = 360 - a - b - c;
      need(d > 20 && d < 170);
      const fig = F.polygon({ pts: [[0, 0], [5, 0.5], [4.4, -3.5], [0.6, -3]], names: ['A', 'B', 'C', 'D'], angles: { 0: `${a}°`, 1: `${b}°`, 2: `${c}°`, 3: 'x' }, w: 260, h: 190 });
      return { q: withNTS(T('Find the value of $x$.', 'Cari nilai $x$.')), fig, a: T(`$x = ${d}$`), sp: 's' };
    },
    (r) => {
      const props = [
        [T('four equal sides and four right angles', 'empat sisi sama panjang dan empat sudut tegak'), 'square'],
        [T('two pairs of equal opposite sides, four right angles and unequal adjacent sides', 'dua pasang sisi bertentangan yang sama panjang, empat sudut tegak dan sisi bersebelahan tidak sama'), 'rectangle'],
        [T('four equal sides but no right angles', 'empat sisi sama panjang tetapi tiada sudut tegak'), 'rhombus'],
        [T('exactly one pair of parallel sides', 'tepat sepasang sisi selari'), 'trapezium'],
        [T('two pairs of adjacent equal sides and diagonals that cross at right angles', 'dua pasang sisi bersebelahan yang sama panjang dan pepenjuru yang bersilang tegak'), 'kite'],
        [T('two pairs of parallel sides but no right angles and unequal adjacent sides', 'dua pasang sisi selari, tiada sudut tegak dan sisi bersebelahan tidak sama'), 'parallelogram'],
      ];
      const p = r.pick(props);
      return { q: T(`Name the quadrilateral that has ${p[0].en}.`, `Namakan sisi empat yang mempunyai ${p[0].ms}.`), a: QUAD[p[1]], sp: 'xs' };
    },
  ];
  const g93m = [
    (r) => {
      const a = r.int(50, 120);
      const fig = F.polygon({ pts: [[0, 0], [5, 0], [6.5, -3], [1.5, -3]], names: ['P', 'Q', 'R', 'S'], angles: { 0: `${a}°`, 1: 'x', 2: 'y' }, w: 270, h: 180 });
      return { q: withNTS(T('$PQRS$ is a parallelogram. Find $x$ and $y$.', '$PQRS$ ialah sebuah segi empat selari. Cari $x$ dan $y$.')), fig, a: T(`$x = ${180 - a}$ (co-interior angles); $y = ${a}$ (opposite angles are equal)`, `$x = ${180 - a}$ (sudut dalam sebelah); $y = ${a}$ (sudut bertentang adalah sama)`), sp: 's' };
    },
    (r) => {
      const a = r.int(50, 130), b = r.int(50, 130);
      // kite: one pair of opposite angles equal
      const c = 360 - 2 * a - b;
      need(c > 20 && c < 170 && b !== a);
      const fig = F.polygon({ pts: [[2.5, 0], [5, -2.2], [2.5, -5.5], [0, -2.2]], names: ['A', 'B', 'C', 'D'], angles: { 0: `${b}°`, 1: `${a}°`, 2: 'x', 3: `${a}°` }, w: 240, h: 200 });
      return { q: withNTS(T('$ABCD$ is a kite. Find $x$.', '$ABCD$ ialah sebuah layang-layang. Cari $x$.')), fig, a: T(`$x = ${c}$`), w: T(`$${b} + ${a} + x + ${a} = 360$`), sp: 's' };
    },
    (r) => {
      const a = r.int(60, 120), b = r.int(60, 120);
      const fig = F.polygon({ pts: [[1, 0], [4, 0], [5.5, -3], [0, -3]], names: ['A', 'B', 'C', 'D'], angles: { 3: `${a}°`, 2: `${b}°`, 0: 'x', 1: 'y' }, w: 270, h: 180 });
      return { q: withNTS(T('$ABCD$ is a trapezium with $AB \\parallel DC$. Find $x$ and $y$.', '$ABCD$ ialah sebuah trapezium dengan $AB \\parallel DC$. Cari $x$ dan $y$.')), fig, a: T(`$x = ${180 - a}$, $y = ${180 - b}$ (co-interior angles between parallel lines)`, `$x = ${180 - a}$, $y = ${180 - b}$ (sudut dalam sebelah antara garis selari)`), sp: 's' };
    },
  ];
  const g93a = [
    (r) => {
    const x = r.int(15, 30), a = r.int(2, 3), c1 = r.int(0, 20), b = r.int(1, 2), c2 = r.int(10, 30), c = r.int(2, 3);
    const k = 360 - (a + b + c + 1) * x - c1 - c2;
    need(Math.abs(k) < 60);
    return { q: T(`The four angles of a quadrilateral are $(${lin(a, c1)})^\\circ$, $(${lin(b, c2)})^\\circ$, $(${lin(c, k)})^\\circ$ and $x^\\circ$. Find the value of $x$ and the largest angle.`, `Empat sudut sebuah sisi empat ialah $(${lin(a, c1)})^\\circ$, $(${lin(b, c2)})^\\circ$, $(${lin(c, k)})^\\circ$ dan $x^\\circ$. Cari nilai $x$ dan sudut yang terbesar.`), a: T(`$x = ${x}$; largest angle $${Math.max(a * x + c1, b * x + c2, c * x + k, x)}^\\circ$`, `$x = ${x}$; sudut terbesar $${Math.max(a * x + c1, b * x + c2, c * x + k, x)}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const a = r.pick([50, 60, 70, 80, 100, 110, 120, 130]);
      const half = a / 2;
      return { q: T(`$ABCD$ is a rhombus with $\\angle ABC = ${a}^\\circ$. The diagonals $AC$ and $BD$ meet at $M$. Find (a) $\\angle BAD$, (b) $\\angle ABD$, (c) $\\angle AMB$.`, `$ABCD$ ialah sebuah rombus dengan $\\angle ABC = ${a}^\\circ$. Pepenjuru $AC$ dan $BD$ bertemu di $M$. Cari (a) $\\angle BAD$, (b) $\\angle ABD$, (c) $\\angle AMB$.`), a: T(`(a) $${180 - a}^\\circ$ (b) $${half}^\\circ$ (c) $90^\\circ$`), w: T('Diagonals of a rhombus bisect the angles and meet at right angles.', 'Pepenjuru rombus membahagi dua sama sudut dan bertemu secara serenjang.'), sp: 'm' };
    },
    (r) => {
      const a = r.int(60, 110), t = r.int(30, 70);
      const fig = F.polygon({ pts: [[0, 0], [5, 0], [5, -3.5], [1.2, -3.5]], names: ['A', 'B', 'C', 'D'], w: 270, h: 190, extra: (P) => S.line(P[0][0], P[0][1], P[2][0], P[2][1]) + S.arc(P[0], P[1], P[2], 24, `${t}°`, { gap: 15 }) });
      return { q: withNTS(T(`In the quadrilateral $ABCD$, diagonal $AC$ is drawn. $\\angle BAC = ${t}^\\circ$, $\\angle ABC = 90^\\circ$ and $\\angle ADC = ${a}^\\circ$. Find $\\angle BCA$ and $\\angle DAC + \\angle DCA$.`, `Dalam sisi empat $ABCD$, pepenjuru $AC$ dilukis. $\\angle BAC = ${t}^\\circ$, $\\angle ABC = 90^\\circ$ dan $\\angle ADC = ${a}^\\circ$. Cari $\\angle BCA$ dan $\\angle DAC + \\angle DCA$.`)), fig, a: T(`$\\angle BCA = ${90 - t}^\\circ$; $\\angle DAC + \\angle DCA = ${180 - a}^\\circ$`), sp: 'l' };
    },
  ];

  SPM.addChapter(1, 9, T('Basic Polygons', 'Poligon Asas'), [
    { id: '9.1', en: 'Polygons', ms: 'Poligon', gen: { e: g91e, m: g91m, a: g91a } },
    { id: '9.1S', en: 'Classification of polygons (supporting)', ms: 'Pengelasan poligon (sokongan)', scope: 'support', gen: { e: g91Se, m: g91Se, a: g91Se } },
    { id: '9.2', en: 'Properties of triangles and interior/exterior angles', ms: 'Sifat segi tiga dan sudut pedalaman/sudut peluaran', gen: { e: g92e, m: g92m, a: g92a } },
    { id: '9.3', en: 'Properties of quadrilaterals and interior/exterior angles', ms: 'Sifat sisi empat dan sudut pedalaman/sudut peluaran', gen: { e: g93e, m: g93m, a: g93a } },
  ]);
})();
