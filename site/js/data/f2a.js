/* Form 2 – Chapters 1 to 3 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, par, poly, lin, sum, gcd, Fr } = SPM;
  const S = SPM.svg;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const frT = Fr.tex;

  /* =============================================================== 1 */
  const seqStr = (list) => list.map((v) => n(v)).join(',\\ ');
  const arith = (a, d, k) => range(0, k - 1).map((i) => round(a + d * i, 6));

  /** row of k squares built from matchsticks (4 for the first, +3 each) */
  function matchSquares(k) {
    const s = 26, x0 = 6, y0 = 12;
    let out = '';
    for (let i = 0; i < k; i++) out += S.rect(x0 + i * s, y0, s, s);
    return out;
  }
  function figSeq(kind, ks) {
    const gap = 16;
    let x = 0, out = '';
    const parts = [];
    for (const k of ks) {
      let w, inner;
      if (kind === 'square') { w = k * 26 + 12; inner = matchSquares(k); }
      else {
        // row of k triangles (2k+1 sticks): alternate up/down
        const s = 26, h = 23;
        w = ((k + 1) * s) / 2 * 1 + 14;
        inner = '';
        for (let i = 0; i < k; i++) {
          const bx = 6 + (i * s) / 2;
          if (i % 2 === 0) inner += S.poly([[bx, 12 + h], [bx + s, 12 + h], [bx + s / 2, 12]]);
          else inner += S.poly([[bx, 12], [bx + s, 12], [bx + s / 2, 12 + h]]);
        }
      }
      parts.push({ w, inner, k });
    }
    const total = parts.reduce((s2, p) => s2 + p.w + gap, 0);
    let cx = 4;
    for (const p of parts) {
      out += `<g transform="translate(${cx},0)">${p.inner}${S.text(p.w / 2 + 2, 62, `Fig. ${p.k}`, { s: 11 })}</g>`;
      cx += p.w + gap;
    }
    return S.wrap(total + 8, 72, out, 'matchstick pattern');
  }
  const figSeqL = (kind, ks) => T(figSeq(kind, ks).replace(/Fig\./g, 'Fig.'), figSeq(kind, ks).replace(/Fig\./g, 'Rajah'));

  const g11e = [
    (r) => {
      const d = r.pick([2, 3, 4, 5, 6, 7]), a = r.int(1, 9);
      const l = arith(a, d, 6);
      return { q: T(`Complete the pattern: $${seqStr(l.slice(0, 4))},\\ \\square,\\ \\square$`, `Lengkapkan pola: $${seqStr(l.slice(0, 4))},\\ \\square,\\ \\square$`), a: T(`$${l[4]},\\ ${l[5]}$ (add ${d} each time)`, `$${l[4]},\\ ${l[5]}$ (tambah ${d} setiap kali)`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(30, 60), d = r.int(3, 7);
      const l = arith(a, -d, 6);
      return { q: T(`Describe the pattern and write the next two numbers: $${seqStr(l.slice(0, 4))},\\ \\ldots$`, `Huraikan pola itu dan tulis dua nombor berikutnya: $${seqStr(l.slice(0, 4))},\\ \\ldots$`), a: T(`Subtract ${d} each time: $${l[4]},\\ ${l[5]}$`, `Tolak ${d} setiap kali: $${l[4]},\\ ${l[5]}$`), sp: 'xs' };
    },
    (r) => {
      const k = r.pick([2, 3, 4, 5, 6, 7, 8, 9]);
      return { q: T(`List the first five multiples of ${k}. What is the difference between consecutive numbers?`, `Senaraikan lima gandaan pertama bagi ${k}. Apakah beza antara nombor berturutan?`), a: T(`$${seqStr(arith(k, k, 5))}$; difference ${k}`, `$${seqStr(arith(k, k, 5))}$; beza ${k}`), sp: 'xs' };
    },
  ];
  const g11m = [
    (r) => {
      const a = r.int(1, 5), m = r.pick([2, 3]);
      const l = range(0, 5).map((i) => a * Math.pow(m, i));
      return { q: T(`Find the next two numbers in the pattern $${seqStr(l.slice(0, 4))},\\ \\ldots$ and state the rule.`, `Cari dua nombor berikutnya dalam pola $${seqStr(l.slice(0, 4))},\\ \\ldots$ dan nyatakan peraturannya.`), a: T(`$${l[4]},\\ ${l[5]}$ (multiply by ${m})`, `$${l[4]},\\ ${l[5]}$ (darab dengan ${m})`), sp: 's' };
    },
    (r) => {
      const cube = r.chance();
      const l = range(1, 7).map((i) => (cube ? i ** 3 : i * i));
      return { q: T(`The numbers $${seqStr(l.slice(0, 4))},\\ \\ldots$ form a pattern of ${cube ? 'cube' : 'square'} numbers. Write the next three numbers.`, `Nombor $${seqStr(l.slice(0, 4))},\\ \\ldots$ membentuk pola nombor ${cube ? 'kuasa tiga' : 'kuasa dua'}. Tulis tiga nombor berikutnya.`), a: T(`$${seqStr(l.slice(4, 7))}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(1, 4), b = r.int(1, 4);
      need(a !== b || true);
      const l = [a, b];
      for (let i = 2; i < 8; i++) l.push(l[i - 1] + l[i - 2]);
      return { q: T(`In the pattern $${seqStr(l.slice(0, 5))},\\ \\ldots$ each term is formed from the two terms before it. Find the next two terms.`, `Dalam pola $${seqStr(l.slice(0, 5))},\\ \\ldots$ setiap sebutan dibentuk daripada dua sebutan sebelumnya. Cari dua sebutan berikutnya.`), a: T(`$${l[5]},\\ ${l[6]}$ (add the previous two terms)`, `$${l[5]},\\ ${l[6]}$ (tambah dua sebutan sebelumnya)`), sp: 's' };
    },
  ];
  const g11a = [
    (r) => {
      const fig = figSeqL('square', [1, 2, 3]);
      return { q: T('The diagram shows a pattern of squares made with matchsticks. (a) Describe the rule for adding the next figure. (b) How many matchsticks are needed for Figure 6?', 'Rajah menunjukkan pola segi empat sama yang dibina menggunakan batang mancis. (a) Huraikan peraturan untuk menambah rajah berikutnya. (b) Berapakah bilangan batang mancis yang diperlukan untuk Rajah 6?'), fig, a: T('(a) Each new figure adds 3 matchsticks (one more square). (b) $4 + 3 \\times 5 = 19$', '(a) Setiap rajah baharu menambah 3 batang mancis (satu segi empat sama lagi). (b) $4 + 3 \\times 5 = 19$'), sp: 'l' };
    },
    (r) => {
      const fig = figSeqL('tri', [1, 2, 3, 4]);
      return { q: T('Triangles are joined in a row using matchsticks as shown. (a) Write the number of matchsticks in Figures 1 to 4. (b) Find the number for Figure 8.', 'Segi tiga disambung dalam satu baris menggunakan batang mancis seperti yang ditunjukkan. (a) Tulis bilangan batang mancis dalam Rajah 1 hingga 4. (b) Cari bilangannya untuk Rajah 8.'), fig, a: T('(a) 3, 5, 7, 9 (b) 17', '(a) 3, 5, 7, 9 (b) 17'), sp: 'l' };
    },
  ];
  const g11Ee = [
    (r) => {
      const l = range(1, 6).map((k) => k * k + 1);
      return { q: T(`The differences between consecutive terms of $${seqStr(l.slice(0, 4))},\\ \\ldots$ are not constant. Find the next two terms and suggest a rule for the $n$th term.`, `Beza antara sebutan berturutan bagi $${seqStr(l.slice(0, 4))},\\ \\ldots$ tidak malar. Cari dua sebutan berikutnya dan cadangkan peraturan bagi sebutan ke-$n$.`), a: T(`$${l[4]},\\ ${l[5]}$; $T_n = n^2 + 1$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 4), c = r.int(1, 3);
      const odd = range(0, 2).map((i) => a + 5 * i), even = range(0, 2).map((i) => b + 3 * i);
      const l = [];
      for (let i = 0; i < 3; i++) l.push(odd[i], even[i]);
      return { q: T(`The pattern $${seqStr(l)},\\ \\ldots$ is made of two interleaved sequences (odd-numbered terms and even-numbered terms). Find the next two terms.`, `Pola $${seqStr(l)},\\ \\ldots$ terdiri daripada dua jujukan yang berselang-seli (sebutan ganjil dan sebutan genap). Cari dua sebutan berikutnya.`), a: T(`$${a + 15},\\ ${b + 9}$`), sp: 's' };
    },
  ];

  const g12e = [
    (r) => {
      const a = r.int(2, 12), d = r.int(2, 8);
      return { q: T(`The first term of a sequence is $T_1 = ${a}$ and each term is ${d} more than the one before. Find $T_5$.`, `Sebutan pertama suatu jujukan ialah $T_1 = ${a}$ dan setiap sebutan lebih ${d} daripada sebutan sebelumnya. Cari $T_5$.`), a: T(`$T_5 = ${a + 4 * d}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(1, 8), d = r.int(2, 6);
      const l = arith(a, d, 4);
      return { q: T(`Write down the next term of the sequence $${seqStr(l)},\\ \\ldots$ and state $T_2$.`, `Tulis sebutan berikutnya bagi jujukan $${seqStr(l)},\\ \\ldots$ dan nyatakan $T_2$.`), a: T(`Next term: ${l[3] + d}; $T_2 = ${l[1]}$`, `Sebutan berikutnya: ${l[3] + d}; $T_2 = ${l[1]}$`), sp: 'xs' };
    },
  ];
  const g12m = [
    (r) => {
      const a = r.int(2, 9), d = r.int(2, 7), k = r.pick([10, 12, 15, 20]);
      return { q: T(`The sequence $${seqStr(arith(a, d, 4))},\\ \\ldots$ continues in the same way. Find $T_{${k}}$.`, `Jujukan $${seqStr(arith(a, d, 4))},\\ \\ldots$ diteruskan dengan cara yang sama. Cari $T_{${k}}$.`), a: T(`$T_{${k}} = ${a + (k - 1) * d}$`), w: T(`$T_n = ${a} + (n-1)\\times ${d}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 9), d = r.int(3, 7);
      const yes = r.chance();
      const N = r.int(9, 20);
      const v = yes ? a + (N - 1) * d : a + (N - 1) * d + r.int(1, d - 1);
      return { q: T(`Is ${v} a term of the sequence $${seqStr(arith(a, d, 4))},\\ \\ldots$? If it is, state which term.`, `Adakah ${v} suatu sebutan bagi jujukan $${seqStr(arith(a, d, 4))},\\ \\ldots$? Jika ya, nyatakan sebutan yang ke berapa.`), a: yes ? T(`Yes, $T_{${N}}$`, `Ya, $T_{${N}}$`) : T(`No: $(${v} - ${a}) \\div ${d} = ${n(round((v - a) / d, 3))}$, so $n$ is not a whole number.`, `Tidak: $(${v} - ${a}) \\div ${d} = ${n(round((v - a) / d, 3))}$, jadi $n$ bukan nombor bulat.`), sp: 's' };
    },
  ];
  const g12a = [
    (r) => {
      const a = r.int(20, 50), d = r.int(2, 6);
      const N = r.int(6, 12);
      const v = a - (N - 1) * d;
      return { q: T(`In the sequence $${seqStr(arith(a, -d, 4))},\\ \\ldots$, which term is equal to ${v}?`, `Dalam jujukan $${seqStr(arith(a, -d, 4))},\\ \\ldots$, sebutan yang ke berapakah sama dengan ${v}?`), a: T(`$T_{${N}}$`), w: T(`$${a} - ${d}(n-1) = ${v}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(1, 5) + 0.5, d = r.pick([0.5, 1.5, 2.5]);
      const N = r.int(7, 14);
      return { q: T(`The sequence $${seqStr(arith(a, d, 4))},\\ \\ldots$ increases by a constant amount. Find $T_{${N}}$.`, `Jujukan $${seqStr(arith(a, d, 4))},\\ \\ldots$ bertambah dengan jumlah yang malar. Cari $T_{${N}}$.`), a: T(`$${n(a + (N - 1) * d)}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(4, 12), d = r.int(3, 7);
      const target = a + 10 * d + r.pick([0, 1]);
      const yes = (target - a) % d === 0;
      return { q: T(`Determine whether ${target} is a term of the sequence $${seqStr(arith(a, d, 4))},\\ \\ldots$. Show that the term number is (or is not) a positive integer.`, `Tentukan sama ada ${target} ialah sebutan bagi jujukan $${seqStr(arith(a, d, 4))},\\ \\ldots$. Tunjukkan bahawa nombor sebutan ialah (atau bukan) integer positif.`), a: yes ? T(`Yes: $n = (${target} - ${a}) \\div ${d} + 1 = ${(target - a) / d + 1}$`, `Ya: $n = (${target} - ${a}) \\div ${d} + 1 = ${(target - a) / d + 1}$`) : T(`No: $n = (${target} - ${a}) \\div ${d} + 1 = ${n(round((target - a) / d + 1, 3))}$, not an integer.`, `Tidak: $n = (${target} - ${a}) \\div ${d} + 1 = ${n(round((target - a) / d + 1, 3))}$, bukan integer.`), sp: 'm' };
    },
  ];
  const g12Ee = g11Ee;

  const g13e = [
    (r) => {
      const a = r.int(2, 6), b = r.int(1, 5);
      const l = range(1, 4).map((i) => a * i + b);
      return { q: T(`The first four terms of a sequence are $${seqStr(l)}$. Write the $n$th term $T_n$.`, `Empat sebutan pertama suatu jujukan ialah $${seqStr(l)}$. Tulis sebutan ke-$n$, $T_n$.`), a: T(`$T_n = ${lin(a, b, 'n')}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(1, 6);
      const k = r.int(5, 12);
      return { q: T(`Given $T_n = ${lin(a, b, 'n')}$, find $T_{${k}}$.`, `Diberi $T_n = ${lin(a, b, 'n')}$, cari $T_{${k}}$.`), a: T(`$${a * k + b}$`), sp: 'xs' };
    },
  ];
  const g13m = [
    (r) => {
      const a = r.int(2, 6), c = r.int(15, 30);
      const l = range(1, 4).map((i) => c - a * i);
      return { q: T(`Find the formula for $T_n$ of the sequence $${seqStr(l)},\\ \\ldots$ and use it to check $T_5$.`, `Cari rumus bagi $T_n$ bagi jujukan $${seqStr(l)},\\ \\ldots$ dan gunakannya untuk menyemak $T_5$.`), a: T(`$T_n = ${c} - ${a}n$; $T_5 = ${c - 5 * a}$`), sp: 's' };
    },
    (r) => {
      const fig = figSeqL('tri', [1, 2, 3, 4]);
      const k = r.int(10, 30);
      return { q: T(`The diagram shows triangles joined in a row using matchsticks. Find a formula for the number of matchsticks in Figure $n$, and hence the number in Figure ${k}.`, `Rajah menunjukkan segi tiga yang disambung dalam satu baris menggunakan batang mancis. Cari rumus bagi bilangan batang mancis dalam Rajah $n$, dan seterusnya bilangannya dalam Rajah ${k}.`), fig, a: T(`$T_n = 2n + 1$; Figure ${k}: ${2 * k + 1}`, `$T_n = 2n + 1$; Rajah ${k}: ${2 * k + 1}`), sp: 'l' };
    },
  ];
  const g13a = [
    (r) => {
      const fig = figSeqL('square', [1, 2, 3]);
      const k = r.int(15, 40);
      return { q: T(`Squares are joined in a row using matchsticks as shown. (a) Find a formula for the number of matchsticks $T_n$ in Figure $n$. (b) Find $T_{${k}}$. (c) Which figure uses ${3 * (k + 3) + 1} matchsticks?`, `Segi empat sama disambung dalam satu baris menggunakan batang mancis seperti yang ditunjukkan. (a) Cari rumus bagi bilangan batang mancis $T_n$ dalam Rajah $n$. (b) Cari $T_{${k}}$. (c) Rajah yang manakah menggunakan ${3 * (k + 3) + 1} batang mancis?`), fig, a: T(`(a) $T_n = 3n + 1$ (b) ${3 * k + 1} (c) Figure ${k + 3}`, `(a) $T_n = 3n + 1$ (b) ${3 * k + 1} (c) Rajah ${k + 3}`), sp: 'xl' };
    },
    (r) => {
      const a = r.int(5, 12), d = r.int(3, 6), w = r.int(6, 12);
      const [p] = r.pair();
      return { q: T(`${p} saves RM${a} in week 1, RM${a + d} in week 2, RM${a + 2 * d} in week 3, and so on. (a) How much does ${p} save in week $n$? (b) How much is saved in week ${w}? (c) Find the total saved after 4 weeks.`, `${p} menyimpan RM${a} pada minggu pertama, RM${a + d} pada minggu kedua, RM${a + 2 * d} pada minggu ketiga, dan seterusnya. (a) Berapakah simpanan ${p} pada minggu ke-$n$? (b) Berapakah simpanan pada minggu ke-${w}? (c) Cari jumlah simpanan selepas 4 minggu.`), a: T(`(a) RM$(${a} + ${d}(n-1))$ (b) RM${a + d * (w - 1)} (c) RM${a * 4 + d * 6}`, `(a) RM$(${a} + ${d}(n-1))$ (b) RM${a + d * (w - 1)} (c) RM${a * 4 + d * 6}`), sp: 'l' };
    },
    (r) => {
      const a = r.int(3, 6), d = r.int(3, 5), rows = r.int(10, 16);
      return { q: T(`A hall has ${a} seats in the first row and each row has ${d} seats more than the row in front. Find the number of seats in row $n$ and in row ${rows}.`, `Sebuah dewan mempunyai ${a} tempat duduk pada baris pertama dan setiap baris mempunyai ${d} tempat duduk lebih daripada baris di hadapannya. Cari bilangan tempat duduk pada baris ke-$n$ dan pada baris ke-${rows}.`), a: T(`$T_n = ${a} + ${d}(n-1)$; row ${rows}: ${a + d * (rows - 1)}`, `$T_n = ${a} + ${d}(n-1)$; baris ${rows}: ${a + d * (rows - 1)}`), sp: 'm' };
    },
  ];
  const g13Ee = [
    (r) => {
      const a = r.int(3, 8), d = r.int(2, 5), thr = r.int(60, 120);
      const first = Math.floor((thr - a) / d) + 2;
      return { q: T(`For the sequence $T_n = ${lin(d, a - d, 'n')}$, find the first term that is greater than ${thr}.`, `Bagi jujukan $T_n = ${lin(d, a - d, 'n')}$, cari sebutan pertama yang lebih besar daripada ${thr}.`), a: T(`$n = ${first}$; $T_{${first}} = ${d * first + a - d}$`), sp: 'm' };
    },
  ];

  SPM.addChapter(2, 1, T('Patterns and Sequences', 'Pola dan Jujukan'), [
    { id: '1.1', en: 'Patterns', ms: 'Pola', gen: { e: g11e, m: g11m, a: g11a } },
    { id: '1.2', en: 'Sequences', ms: 'Jujukan', gen: { e: g12e, m: g12m, a: g12a } },
    { id: '1.3', en: 'Generalisation and problem solving', ms: 'Generalisasi dan penyelesaian masalah', gen: { e: g13e, m: g13m, a: g13a } },
    { id: '1.E', en: 'Extended rule families', ms: 'Keluarga peraturan lanjutan', scope: 'enrichment', gen: { e: g11Ee, m: g11Ee, a: g13Ee } },
  ]);

  /* =============================================================== 2 */
  const X = (a, b, c) => poly([[a, 'x^2'], [b, 'x'], [c, '']]); // ax^2+bx+c
  const br = (a, b) => `(${lin(a, b)})`;
  const g21e = [
    (r) => {
      const a = r.int(2, 6), b = r.nz(-6, 6), c = r.nz(-9, 9);
      return { q: T(`Expand $${a}(${lin(b, c)})$.`, `Kembangkan $${a}(${lin(b, c)})$.`), a: T(`$${lin(a * b, a * c)}$`), sp: 'xs' };
    },
    (r) => {
      const p = r.int(1, 6), q = r.int(1, 6);
      return { q: T(`Expand $(x + ${p})(x + ${q})$.`, `Kembangkan $(x + ${p})(x + ${q})$.`), a: T(`$${X(1, p + q, p * q)}$`), sp: 's' };
    },
  ];
  const g21m = [
    (r) => {
      const a = r.int(2, 4), b = r.nz(-6, 6), c = r.int(1, 3), d = r.nz(-6, 6);
      return { q: T(`Expand $${br(a, b)}${br(c, d)}$.`, `Kembangkan $${br(a, b)}${br(c, d)}$.`), a: T(`$${X(a * c, a * d + b * c, b * d)}$`), sp: 's' };
    },
    (r) => {
      const s = r.chance();
      const p = r.int(2, 8);
      return { q: T(`Expand $(x ${s ? '+' : '-'} ${p})^2$.`, `Kembangkan $(x ${s ? '+' : '-'} ${p})^2$.`), a: T(`$${X(1, s ? 2 * p : -2 * p, p * p)}$`), sp: 's' };
    },
    (r) => {
      const b = r.int(1, 5), c = r.nz(-4, 4), d = r.int(1, 5), f = r.nz(-4, 4);
      const p1 = [1, b + c, b * c], p2 = [1, d + f, d * f];
      return { q: T(`Expand and simplify $(x + ${b})(x ${c < 0 ? '-' : '+'} ${Math.abs(c)}) + (x + ${d})(x ${f < 0 ? '-' : '+'} ${Math.abs(f)})$.`, `Kembangkan dan ringkaskan $(x + ${b})(x ${c < 0 ? '-' : '+'} ${Math.abs(c)}) + (x + ${d})(x ${f < 0 ? '-' : '+'} ${Math.abs(f)})$.`), a: T(`$${X(2, p1[1] + p2[1], p1[2] + p2[2])}$`), sp: 'm' };
    },
  ];
  const g21a = [
    (r) => {
      const a = r.int(2, 4), b = r.nz(-4, 4), c = r.int(1, 3), d = r.nz(-5, 5);
      const p = r.nz(-5, 5), q = r.nz(-5, 5);
      const sq = [a * a, 2 * a * b, b * b];
      const pr = [1, p + q, p * q];
      return { q: T(`Expand and simplify $${br(a, b)}^2 - (x ${p < 0 ? '-' : '+'} ${Math.abs(p)})(x ${q < 0 ? '-' : '+'} ${Math.abs(q)})$.`, `Kembangkan dan ringkaskan $${br(a, b)}^2 - (x ${p < 0 ? '-' : '+'} ${Math.abs(p)})(x ${q < 0 ? '-' : '+'} ${Math.abs(q)})$.`), a: T(`$${X(sq[0] - pr[0], sq[1] - pr[1], sq[2] - pr[2])}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([99, 98, 101, 102, 49, 51, 199]);
      const base = k > 150 ? 200 : k > 75 ? 100 : 50;
      const d = k - base;
      return { q: T(`By using $(a + b)^2 = a^2 + 2ab + b^2$ or $(a - b)^2 = a^2 - 2ab + b^2$, evaluate $${k}^2$ without a calculator.`, `Dengan menggunakan $(a + b)^2 = a^2 + 2ab + b^2$ atau $(a - b)^2 = a^2 - 2ab + b^2$, hitung $${k}^2$ tanpa kalkulator.`), a: T(`$(${base} ${d < 0 ? '-' : '+'} ${Math.abs(d)})^2 = ${k * k}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(41, 78), b = r.int(2, 9);
      const c = a - 2 * b;
      return { q: T(`Use $a^2 - b^2 = (a + b)(a - b)$ to evaluate $${a}^2 - ${c}^2$ without a calculator.`, `Gunakan $a^2 - b^2 = (a + b)(a - b)$ untuk menghitung $${a}^2 - ${c}^2$ tanpa kalkulator.`), a: T(`$(${a} + ${c})(${a} - ${c}) = ${a + c} \\times ${2 * b} = ${(a + c) * 2 * b}$`), sp: 'm' };
    },
  ];

  const g22e = [
    (r) => {
      const k = r.int(2, 6), a = r.int(1, 5), b = r.int(1, 7);
      return { q: T(`Factorise $${lin(k * a, k * b)}$.`, `Faktorkan $${lin(k * a, k * b)}$.`), a: T(`$${k}(${lin(a, b)})$`), sp: 'xs' };
    },
    (r) => {
      const p = r.int(1, 6), q = r.int(1, 6);
      return { q: T(`Factorise $${X(1, p + q, p * q)}$.`, `Faktorkan $${X(1, p + q, p * q)}$.`), a: T(`$(x + ${p})(x + ${q})$`), sp: 's' };
    },
  ];
  const g22m = [
    (r) => {
      const p = r.nz(-8, 8), q = r.nz(-8, 8);
      need(p !== -q);
      const f = (v) => `(x ${v < 0 ? '-' : '+'} ${Math.abs(v)})`;
      return { q: T(`Factorise $${X(1, p + q, p * q)}$.`, `Faktorkan $${X(1, p + q, p * q)}$.`), a: T(`$${f(p)}${f(q)}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 9), k = r.pick([1, 2, 3]);
      return r.chance()
        ? { q: T(`Factorise $x^2 - ${a * a}$.`, `Faktorkan $x^2 - ${a * a}$.`), a: T(`$(x + ${a})(x - ${a})$`), sp: 's' }
        : { q: T(`Factorise $${4 * k * k}x^2 - ${a * a}$.`, `Faktorkan $${4 * k * k}x^2 - ${a * a}$.`), a: T(`$(${2 * k}x + ${a})(${2 * k}x - ${a})$`), sp: 's' };
    },
    (r) => {
      const u = r.pick([2, 3]), p = r.int(1, 5), q = r.nz(-5, 5);
      need(gcd(u, Math.abs(q)) === 1);
      return { q: T(`Factorise $${X(u, u * q + p, p * q)}$.`, `Faktorkan $${X(u, u * q + p, p * q)}$.`), a: T(`$${br(u, p)}${br(1, q)}$`), sp: 'm' };
    },
  ];
  const g22a = [
    (r) => {
      const k = r.int(2, 5), a = r.int(2, 6);
      return { q: T(`Factorise completely $${k}x^2 - ${k * a * a}$.`, `Faktorkan sepenuhnya $${k}x^2 - ${k * a * a}$.`), a: T(`$${k}(x + ${a})(x - ${a})$`), sp: 'm' };
    },
    (r) => {
      const u = r.int(2, 6), v = r.int(1, 4), p = r.int(1, 5), q = r.nz(-5, 5);
      need(gcd(u, p) === 1 && gcd(v, Math.abs(q)) === 1 && u !== v);
      return { q: T(`Factorise $${X(u * v, u * q + v * p, p * q)}$.`, `Faktorkan $${X(u * v, u * q + v * p, p * q)}$.`), a: T(`$${br(u, p)}${br(v, q)}$`), sp: 'm' };
    },
    (r) => {
      const p = r.int(1, 6), q = r.int(1, 6);
      need(p !== q);
      return { q: T(`Factorise $-x^2 + ${p + q}x - ${p * q}$ by first taking out $-1$.`, `Faktorkan $-x^2 + ${p + q}x - ${p * q}$ dengan mengeluarkan $-1$ terlebih dahulu.`), a: T(`$-(x - ${p})(x - ${q})$`), sp: 'm' };
    },
  ];
  const fmtF = (num, den) => `\\dfrac{${num}}{${den}}`;
  const g23e = [
    (r) => {
      const a = r.int(1, 5), b = r.int(1, 5), k = r.int(2, 6);
      return { q: T(`Simplify $\\dfrac{${a}x}{${k}} + \\dfrac{${b}x}{${k}}$.`, `Ringkaskan $\\dfrac{${a}x}{${k}} + \\dfrac{${b}x}{${k}}$.`), a: T(`$${(() => { const nu = a + b; const g = gcd(nu, k); return g === k ? (nu / g === 1 ? 'x' : nu / g + 'x') : `\\dfrac{${nu / g === 1 ? '' : nu / g}x}{${k / g}}`; })()}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5), m = r.pick(['x', 'y']);
      return { q: T(`Simplify $\\dfrac{${a}${m}}{${b}} \\times \\dfrac{${b * 2}}{${m}}$.`, `Ringkaskan $\\dfrac{${a}${m}}{${b}} \\times \\dfrac{${b * 2}}{${m}}$.`), a: T(`$${2 * a}$`), sp: 's' };
    },
  ];
  const g23m = [
    (r) => {
      const a = r.int(1, 4), b = r.int(1, 4);
      return { q: T(`Simplify $\\dfrac{x + ${a}}{3} + \\dfrac{x - ${b}}{6}$.`, `Ringkaskan $\\dfrac{x + ${a}}{3} + \\dfrac{x - ${b}}{6}$.`), a: T(`$\\dfrac{${lin(3, 2 * a - b)}}{6}$`), w: T(`$\\dfrac{2(x + ${a}) + (x - ${b})}{6}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 7);
      return { q: T(`Simplify $\\dfrac{x^2 - ${a * a}}{x + ${a}} \\times \\dfrac{3}{x - ${a}}$.`, `Ringkaskan $\\dfrac{x^2 - ${a * a}}{x + ${a}} \\times \\dfrac{3}{x - ${a}}$.`), a: T(`$3$ (for $x \\neq \\pm ${a}$)`, `$3$ (bagi $x \\neq \\pm ${a}$)`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 6);
      need(a !== b);
      return { q: T(`Simplify $\\dfrac{${a}x}{${b}y} \\div \\dfrac{${a}}{y}$.`, `Ringkaskan $\\dfrac{${a}x}{${b}y} \\div \\dfrac{${a}}{y}$.`), a: T(`$\\dfrac{x}{${b}}$`), sp: 'm' };
    },
  ];
  const g23a = [
    (r) => {
      const a = r.int(1, 4), b = a + r.int(1, 3), p = r.int(1, 3), q = r.int(1, 3);
      const nu = poly([[p + q, 'x'], [p * b + q * a, '']]);
      return { q: T(`Simplify $\\dfrac{${p}}{x + ${a}} + \\dfrac{${q}}{x + ${b}}$.`, `Ringkaskan $\\dfrac{${p}}{x + ${a}} + \\dfrac{${q}}{x + ${b}}$.`), a: T(`$\\dfrac{${nu}}{(x + ${a})(x + ${b})}$`), sp: 'l' };
    },
    (r) => {
      const a = r.int(2, 5);
      const k = r.int(1, 3);
      // k/(x-a) - k/(x+a) = 2ak / (x^2 - a^2)
      return { q: T(`Simplify $\\dfrac{${k}}{x - ${a}} - \\dfrac{${k}}{x + ${a}}$. Give your answer with a fully factorised denominator.`, `Ringkaskan $\\dfrac{${k}}{x - ${a}} - \\dfrac{${k}}{x + ${a}}$. Berikan jawapan anda dengan penyebut yang difaktorkan sepenuhnya.`), a: T(`$\\dfrac{${2 * a * k}}{(x - ${a})(x + ${a})}$`), sp: 'l' };
    },
    (r) => {
      const p = r.int(1, 5), q = r.int(1, 5);
      need(p !== q);
      return { q: T(`Simplify $\\dfrac{x^2 + ${p + q}x + ${p * q}}{x^2 - ${p * p}} \\div \\dfrac{x + ${q}}{x - ${p}}$.`, `Ringkaskan $\\dfrac{x^2 + ${p + q}x + ${p * q}}{x^2 - ${p * p}} \\div \\dfrac{x + ${q}}{x - ${p}}$.`), a: T('$1$ (for values of $x$ that keep every denominator non-zero)', '$1$ (bagi nilai $x$ yang menjadikan setiap penyebut tidak sifar)'), w: T(`$\\dfrac{(x+${p})(x+${q})}{(x+${p})(x-${p})} \\times \\dfrac{x-${p}}{x+${q}}$`), sp: 'l' };
    },
  ];
  SPM.addChapter(2, 2, T('Factorisation and Algebraic Fractions', 'Pemfaktoran dan Pecahan Algebra'), [
    { id: '2.1', en: 'Expansion', ms: 'Kembangan', gen: { e: g21e, m: g21m, a: g21a } },
    { id: '2.2', en: 'Factorisation', ms: 'Pemfaktoran', gen: { e: g22e, m: g22m, a: g22a } },
    { id: '2.3', en: 'Algebraic expressions and algebraic fractions', ms: 'Ungkapan algebra dan pecahan algebra', gen: { e: g23e, m: g23m, a: g23a } },
  ]);

  /* =============================================================== 3 */
  const VARN = [['C', 'p', 'n'], ['P', 'x', 'y'], ['T', 'a', 'b']];
  const g31e = [
    (r) => {
      const p = r.int(2, 9), f = r.int(5, 20);
      return { q: T(`A taxi charges a fixed fare of RM${f} plus RM${p} for each kilometre. Write a formula for the total charge $C$ (in RM) for a journey of $d$ km.`, `Sebuah teksi mengenakan tambang tetap RM${f} ditambah RM${p} bagi setiap kilometer. Tulis satu rumus bagi jumlah caj $C$ (dalam RM) bagi perjalanan sejauh $d$ km.`), a: T(`$C = ${p}d + ${f}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(3, 9);
      return { q: T(`The perimeter $P$ of a rectangle has length $l$ and width $w$. Write a formula for $P$. Then find $P$ when $l = ${a + 3}$ and $w = ${a}$.`, `Perimeter $P$ sebuah segi empat tepat mempunyai panjang $l$ dan lebar $w$. Tulis satu rumus bagi $P$. Kemudian cari $P$ apabila $l = ${a + 3}$ dan $w = ${a}$.`), a: T(`$P = 2(l + w)$; $P = ${2 * (2 * a + 3)}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(1, 9), x = r.int(2, 7);
      return { q: T(`Given $y = ${a}x + ${b}$, find $y$ when $x = ${x}$.`, `Diberi $y = ${a}x + ${b}$, cari $y$ apabila $x = ${x}$.`), a: T(`$y = ${a * x + b}$`), sp: 'xs' };
    },
  ];
  const g31m = [
    (r) => {
      const a = r.int(3, 8), b = r.int(2, 6), c = r.int(2, 6);
      return { q: T(`A hall hire costs RM${a * 10} per hour for the first ${b} hours and RM${a * 6} per hour after that. Write a formula for the cost $C$ of hiring the hall for $h$ hours, where $h > ${b}$.`, `Sewa dewan berharga RM${a * 10} sejam bagi ${b} jam pertama dan RM${a * 6} sejam selepas itu. Tulis satu rumus bagi kos $C$ untuk menyewa dewan selama $h$ jam, dengan $h > ${b}$.`), a: T(`$C = ${a * 10 * b} + ${a * 6}(h - ${b})$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 6);
      return { q: T(`The average $m$ of three numbers $p$, $q$ and $r$ is given by a formula. Write it, and find $m$ when $p = ${a}$, $q = ${a + 3}$ and $r = ${a + 7}$.`, `Purata $m$ bagi tiga nombor $p$, $q$ dan $r$ diberi oleh satu rumus. Tulis rumus itu, dan cari $m$ apabila $p = ${a}$, $q = ${a + 3}$ dan $r = ${a + 7}$.`), a: T(`$m = \\dfrac{p + q + r}{3}$; $m = ${n(round((3 * a + 10) / 3, 2))}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.nz(-4, 4), x = r.nz(-5, 5);
      return { q: T(`Given $y = ${a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$, find $y$ when $x = ${x}$.`, `Diberi $y = ${a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$, cari $y$ apabila $x = ${x}$.`), a: T(`$y = ${a * x + b}$`), sp: 's' };
    },
  ];
  const g31a = [
    (r) => {
      const a = r.int(3, 6), f = r.int(5, 12), d = r.int(5, 15);
      return { q: T(`A mobile plan costs RM${f} a month plus RM0.${a} per minute of calls. Write a formula for the monthly bill $B$ (in RM) for $t$ minutes. Find $B$ when $t = ${d * 10}$ minutes.`, `Pelan telefon bimbit berharga RM${f} sebulan ditambah RM0.${a} seminit panggilan. Tulis satu rumus bagi bil bulanan $B$ (dalam RM) bagi $t$ minit. Cari $B$ apabila $t = ${d * 10}$ minit.`), a: T(`$B = ${f} + 0.${a}t$; $B = ${n(round(f + (a / 10) * d * 10, 2))}$`), sp: 'm' };
    },
  ];
  const g32e = [
    (r) => {
      const a = r.int(2, 9), s = r.chance();
      return s ? { q: T(`Make $x$ the subject of $y = x + ${a}$.`, `Jadikan $x$ sebagai perkara rumus bagi $y = x + ${a}$.`), a: T(`$x = y - ${a}$`), sp: 'xs' } : { q: T(`Make $x$ the subject of $y = ${a}x$.`, `Jadikan $x$ sebagai perkara rumus bagi $y = ${a}x$.`), a: T(`$x = \\dfrac{y}{${a}}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 6);
      return { q: T(`Make $t$ the subject of $v = ${a}t$.`, `Jadikan $t$ sebagai perkara rumus bagi $v = ${a}t$.`), a: T(`$t = \\dfrac{v}{${a}}$`), sp: 'xs' };
    },
  ];
  const g32m = [
    (r) => {
      const a = r.int(2, 6), b = r.int(1, 9);
      return { q: T(`Make $x$ the subject of $y = ${a}x + ${b}$.`, `Jadikan $x$ sebagai perkara rumus bagi $y = ${a}x + ${b}$.`), a: T(`$x = \\dfrac{y - ${b}}{${a}}$`), sp: 's' };
    },
    (r) => ({ q: T('Make $h$ the subject of $A = \\dfrac{1}{2}(a + b)h$.', 'Jadikan $h$ sebagai perkara rumus bagi $A = \\dfrac{1}{2}(a + b)h$.'), a: T('$h = \\dfrac{2A}{a + b}$'), sp: 's' }),
    (r) => {
      const a = r.int(2, 5);
      return { q: T(`Make $r$ the subject of $P = ${a}(l + r)$.`, `Jadikan $r$ sebagai perkara rumus bagi $P = ${a}(l + r)$.`), a: T(`$r = \\dfrac{P}{${a}} - l$`), sp: 's' };
    },
  ];
  const g32a = [
    (r) => ({ q: T('Make $t$ the subject of $v = u + at$, then find $t$ when $v = 30$, $u = 6$ and $a = 4$.', 'Jadikan $t$ sebagai perkara rumus bagi $v = u + at$, kemudian cari $t$ apabila $v = 30$, $u = 6$ dan $a = 4$.'), a: T('$t = \\dfrac{v - u}{a}$; $t = 6$'), sp: 'm' }),
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5);
      need(a !== b);
      return { q: T(`Make $x$ the subject of $y = ${a}x - ${b}(x - z)$.`, `Jadikan $x$ sebagai perkara rumus bagi $y = ${a}x - ${b}(x - z)$.`), a: T(`$x = \\dfrac{y - ${b}z}{${a - b}}$`), w: T(`$y = ${a}x - ${b}x + ${b}z$`), sp: 'm' };
    },
    (r) => ({ q: T('Make $c$ the subject of $\\dfrac{a + c}{b} = d$, then evaluate $c$ when $a = 3$, $b = 4$ and $d = 5$.', 'Jadikan $c$ sebagai perkara rumus bagi $\\dfrac{a + c}{b} = d$, kemudian nilaikan $c$ apabila $a = 3$, $b = 4$ dan $d = 5$.'), a: T('$c = bd - a$; $c = 17$'), sp: 'm' }),
  ];
  const g32Ee = [
    (r) => ({ q: T('Make $r$ the subject of $A = \\pi r^2$ where $r > 0$.', 'Jadikan $r$ sebagai perkara rumus bagi $A = \\pi r^2$ dengan $r > 0$.'), a: T('$r = \\sqrt{\\dfrac{A}{\\pi}}$'), sp: 's' }),
    (r) => {
      const k = r.int(2, 9);
      return { q: T(`Make $x$ the subject of $y = \\dfrac{${k}}{x}$. State any value that $x$ and $y$ cannot take.`, `Jadikan $x$ sebagai perkara rumus bagi $y = \\dfrac{${k}}{x}$. Nyatakan sebarang nilai yang tidak boleh diambil oleh $x$ dan $y$.`), a: T(`$x = \\dfrac{${k}}{y}$; $x \\neq 0$ and $y \\neq 0$`), sp: 's' };
    },
  ];
  const g33e = [
    (r) => {
      const a = r.int(2, 7), x = r.int(2, 9), y = a * x + 3;
      return { q: T(`The formula $y = ${a}x + 3$ is used. Find $x$ when $y = ${y}$.`, `Rumus $y = ${a}x + 3$ digunakan. Cari $x$ apabila $y = ${y}$.`), a: T(`$x = ${x}$`), sp: 's' };
    },
  ];
  const g33m = [
    (r) => {
      const a = r.int(2, 6);
      return { q: T(`In $C = ${a}n + 10$, what happens to $C$ when $n$ increases by 1? What is the value of $C$ when $n = 0$, and what does it represent if $C$ is a cost in RM?`, `Dalam $C = ${a}n + 10$, apakah yang berlaku kepada $C$ apabila $n$ bertambah 1? Apakah nilai $C$ apabila $n = 0$, dan apakah maksudnya jika $C$ ialah kos dalam RM?`), a: T(`$C$ increases by ${a}. When $n = 0$, $C = 10$: a fixed charge of RM10.`, `$C$ bertambah ${a}. Apabila $n = 0$, $C = 10$: caj tetap RM10.`), sp: 's' };
    },
    (r) => {
      const u = r.int(2, 8), a = r.int(2, 5), t = r.int(2, 6);
      const v = u + a * t;
      return { q: T(`The formula $v = u + at$ is used. Find $a$ when $v = ${v}$, $u = ${u}$ and $t = ${t}$.`, `Rumus $v = u + at$ digunakan. Cari $a$ apabila $v = ${v}$, $u = ${u}$ dan $t = ${t}$.`), a: T(`$a = ${a}$`), sp: 's' };
    },
  ];
  const g33a = [
    (r) => {
      const l = r.int(4, 9), w = r.int(2, l - 1);
      return { q: T(`For $A = lw$, find how $A$ changes when (a) $l$ is doubled and $w$ stays the same, (b) both $l$ and $w$ are doubled. Use $l = ${l}$, $w = ${w}$ to check.`, `Bagi $A = lw$, cari bagaimana $A$ berubah apabila (a) $l$ digandakan dan $w$ kekal sama, (b) kedua-dua $l$ dan $w$ digandakan. Gunakan $l = ${l}$, $w = ${w}$ untuk menyemak.`), a: T(`Original: $A = ${l * w}$. (a) $A = ${2 * l * w}$: doubled. (b) $A = ${4 * l * w}$: four times.`, `Asal: $A = ${l * w}$. (a) $A = ${2 * l * w}$: digandakan. (b) $A = ${4 * l * w}$: empat kali ganda.`), sp: 'm' };
    },
  ];
  const g34e = [
    (r) => {
      const c = r.int(2, 6), f = r.int(10, 25), n1 = r.int(4, 12);
      return { q: T(`The cost of printing $n$ posters is $C = ${c}n + ${f}$ (in RM). Find the cost of printing ${n1} posters.`, `Kos mencetak $n$ keping poster ialah $C = ${c}n + ${f}$ (dalam RM). Cari kos mencetak ${n1} keping poster.`), a: T(`RM${c * n1 + f}`), sp: 's' };
    },
  ];
  const g34m = [
    (r) => {
      const c = r.int(2, 6), f = r.int(10, 25), n1 = r.int(4, 12);
      const tot = c * n1 + f;
      return { q: T(`The cost of printing $n$ posters is $C = ${c}n + ${f}$ (in RM). Make $n$ the subject and find how many posters can be printed for RM${tot}.`, `Kos mencetak $n$ keping poster ialah $C = ${c}n + ${f}$ (dalam RM). Jadikan $n$ perkara rumus dan cari bilangan poster yang boleh dicetak dengan RM${tot}.`), a: T(`$n = \\dfrac{C - ${f}}{${c}}$; $n = ${n1}$`), sp: 'm' };
    },
    (r) => {
      const F = r.int(2, 9) * 10;
      const C = round(((F - 32) * 5) / 9, 1);
      return { q: T(`The formula $F = \\dfrac{9}{5}C + 32$ converts a temperature from degrees Celsius to degrees Fahrenheit. (a) Make $C$ the subject. (b) Find $C$ when $F = ${F}$. Give the answer to 1 decimal place.`, `Rumus $F = \\dfrac{9}{5}C + 32$ menukar suhu daripada darjah Celsius kepada darjah Fahrenheit. (a) Jadikan $C$ perkara rumus. (b) Cari $C$ apabila $F = ${F}$. Berikan jawapan betul kepada 1 tempat perpuluhan.`), a: T(`(a) $C = \\dfrac{5}{9}(F - 32)$ (b) $${n(C)}$`), sp: 'm' };
    },
  ];
  const g34a = [
    (r) => {
      const l = r.int(6, 14), w = r.int(3, l - 2), h = r.int(3, 9);
      const V = l * w * h;
      return { q: T(`The volume of a cuboid is $V = lwh$. (a) Make $h$ the subject. (b) A cuboid has $V = ${V}\\ \\text{cm}^3$, $l = ${l}$ cm and $w = ${w}$ cm. Find $h$. (c) Find the total surface area $2(lw + lh + wh)$.`, `Isi padu sebuah kuboid ialah $V = lwh$. (a) Jadikan $h$ perkara rumus. (b) Sebuah kuboid mempunyai $V = ${V}\\ \\text{cm}^3$, $l = ${l}$ cm dan $w = ${w}$ cm. Cari $h$. (c) Cari jumlah luas permukaan $2(lw + lh + wh)$.`), a: T(`(a) $h = \\dfrac{V}{lw}$ (b) ${h} cm (c) $${2 * (l * w + l * h + w * h)}\\ \\text{cm}^2$`), sp: 'l' };
    },
  ];
  SPM.addChapter(2, 3, T('Algebraic Formulae', 'Rumus Algebra'), [
    { id: '3.1', en: 'Forming formulae', ms: 'Membentuk rumus', gen: { e: g31e, m: g31m, a: g31a } },
    { id: '3.2', en: 'Changing the subject', ms: 'Menukar perkara rumus', gen: { e: g32e, m: g32m, a: g32a } },
    { id: '3.3', en: 'Relating variables and determining values', ms: 'Menghubungkait pemboleh ubah dan menentukan nilai', gen: { e: g33e, m: g33m, a: g33a } },
    { id: '3.4', en: 'Problems involving formulae', ms: 'Masalah yang melibatkan rumus', gen: { e: g34e, m: g34m, a: g34a } },
    { id: '3.E', en: 'Rational and root inversions', ms: 'Songsangan nisbah dan punca', scope: 'extension', gen: { e: g32Ee, m: g32Ee, a: g32Ee } },
  ]);
})();
