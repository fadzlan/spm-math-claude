/* Form 2 – Chapters 1 to 3 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, par, poly, lin, sum, gcd, Fr } = SPM;
  const S = SPM.svg;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const frT = Fr.tex;
  /* ---- worked-solution helpers (W = SPM.lines) ---- */
  const W = SPM.lines;
  /** "5 + 3 = 8,\ 8 + 3 = 11" for a constant-difference list */
  const addSteps = (l, d, from, cnt) => `$${Array.from({ length: cnt }, (_, i) => from + i).map((i) => `${n(l[i - 1])} ${d < 0 ? '-' : '+'} ${n(Math.abs(d))} = ${n(l[i])}`).join(',\\ ')}$`;
  /** "Two numbers with product … and sum …: … and …" */
  const pairLine = (a, b) => T(`Two numbers with product $${a * b}$ and sum $${a + b}$: $${a}$ and $${b}$`, `Dua nombor dengan hasil darab $${a * b}$ dan hasil tambah $${a + b}$: $${a}$ dan $${b}$`);

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
      return { q: T(`Complete the pattern: $${seqStr(l.slice(0, 4))},\\ \\square,\\ \\square$`, `Lengkapkan pola: $${seqStr(l.slice(0, 4))},\\ \\square,\\ \\square$`), a: T(`$${l[4]},\\ ${l[5]}$ (add ${d} each time)`, `$${l[4]},\\ ${l[5]}$ (tambah ${d} setiap kali)`), w: W(T(`Differences: $${l.slice(1, 4).map((v, i) => n(v - l[i])).join(',\\ ')}$ – the same each time, so add ${d}.`, `Beza: $${l.slice(1, 4).map((v, i) => n(v - l[i])).join(',\\ ')}$ – sama setiap kali, jadi tambah ${d}.`), addSteps(l, d, 4, 2)), sp: 'xs' };
    },
    (r) => {
      const a = r.int(30, 60), d = r.int(3, 7);
      const l = arith(a, -d, 6);
      return { q: T(`Describe the pattern and write the next two numbers: $${seqStr(l.slice(0, 4))},\\ \\ldots$`, `Huraikan pola itu dan tulis dua nombor berikutnya: $${seqStr(l.slice(0, 4))},\\ \\ldots$`), a: T(`Subtract ${d} each time: $${l[4]},\\ ${l[5]}$`, `Tolak ${d} setiap kali: $${l[4]},\\ ${l[5]}$`), w: W(T(`Differences: $${l.slice(1, 4).map((v, i) => n(v - l[i])).join(',\\ ')}$ – each number is ${d} less than the one before.`, `Beza: $${l.slice(1, 4).map((v, i) => n(v - l[i])).join(',\\ ')}$ – setiap nombor ialah ${d} kurang daripada nombor sebelumnya.`), addSteps(l, -d, 4, 2)), sp: 'xs' };
    },
    (r) => {
      const k = r.pick([2, 3, 4, 5, 6, 7, 8, 9]);
      return { q: T(`List the first five multiples of ${k}. What is the difference between consecutive numbers?`, `Senaraikan lima gandaan pertama bagi ${k}. Apakah beza antara nombor berturutan?`), a: T(`$${seqStr(arith(k, k, 5))}$; difference ${k}`, `$${seqStr(arith(k, k, 5))}$; beza ${k}`), w: W(`$${[1, 2, 3, 4, 5].map((i) => `${k} \\times ${i} = ${k * i}`).join(',\\ ')}$`, T(`Each multiple is ${k} more than the one before, so the difference is ${k}.`, `Setiap gandaan ialah ${k} lebih daripada gandaan sebelumnya, jadi bezanya ialah ${k}.`)), sp: 'xs' };
    },
  ];
  const g11m = [
    (r) => {
      const a = r.int(1, 5), m = r.pick([2, 3]);
      const l = range(0, 5).map((i) => a * Math.pow(m, i));
      return { q: T(`Find the next two numbers in the pattern $${seqStr(l.slice(0, 4))},\\ \\ldots$ and state the rule.`, `Cari dua nombor berikutnya dalam pola $${seqStr(l.slice(0, 4))},\\ \\ldots$ dan nyatakan peraturannya.`), a: T(`$${l[4]},\\ ${l[5]}$ (multiply by ${m})`, `$${l[4]},\\ ${l[5]}$ (darab dengan ${m})`), w: W(T(`The differences are not constant, but $${l[1]} \\div ${l[0]} = ${m}$ and $${l[2]} \\div ${l[1]} = ${m}$: multiply by ${m} each time.`, `Bezanya tidak malar, tetapi $${l[1]} \\div ${l[0]} = ${m}$ dan $${l[2]} \\div ${l[1]} = ${m}$: darab dengan ${m} setiap kali.`), `$${l[3]} \\times ${m} = ${l[4]},\\ ${l[4]} \\times ${m} = ${l[5]}$`), sp: 's' };
    },
    (r) => {
      const cube = r.chance();
      const l = range(1, 7).map((i) => (cube ? i ** 3 : i * i));
      return { q: T(`The numbers $${seqStr(l.slice(0, 4))},\\ \\ldots$ form a pattern of ${cube ? 'cube' : 'square'} numbers. Write the next three numbers.`, `Nombor $${seqStr(l.slice(0, 4))},\\ \\ldots$ membentuk pola nombor ${cube ? 'kuasa tiga' : 'kuasa dua'}. Tulis tiga nombor berikutnya.`), a: T(`$${seqStr(l.slice(4, 7))}$`), w: W(T(`The listed numbers are $1^${cube ? 3 : 2}, 2^${cube ? 3 : 2}, 3^${cube ? 3 : 2}, 4^${cube ? 3 : 2}$, so the next ones use $5$, $6$ and $7$.`, `Nombor yang disenaraikan ialah $1^${cube ? 3 : 2}, 2^${cube ? 3 : 2}, 3^${cube ? 3 : 2}, 4^${cube ? 3 : 2}$, jadi yang berikutnya menggunakan $5$, $6$ dan $7$.`), `$${[5, 6, 7].map((i) => `${i}^${cube ? 3 : 2} = ${cube ? i ** 3 : i * i}`).join(',\\ ')}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(1, 4), b = r.int(1, 4);
      need(a !== b || true);
      const l = [a, b];
      for (let i = 2; i < 8; i++) l.push(l[i - 1] + l[i - 2]);
      return { q: T(`In the pattern $${seqStr(l.slice(0, 5))},\\ \\ldots$ each term is formed from the two terms before it. Find the next two terms.`, `Dalam pola $${seqStr(l.slice(0, 5))},\\ \\ldots$ setiap sebutan dibentuk daripada dua sebutan sebelumnya. Cari dua sebutan berikutnya.`), a: T(`$${l[5]},\\ ${l[6]}$ (add the previous two terms)`, `$${l[5]},\\ ${l[6]}$ (tambah dua sebutan sebelumnya)`), w: W(T(`Test the rule on the terms given: $${l[0]} + ${l[1]} = ${l[2]}$, $${l[1]} + ${l[2]} = ${l[3]}$, $${l[2]} + ${l[3]} = ${l[4]}$`, `Uji peraturan itu pada sebutan yang diberi: $${l[0]} + ${l[1]} = ${l[2]}$, $${l[1]} + ${l[2]} = ${l[3]}$, $${l[2]} + ${l[3]} = ${l[4]}$`), `$${l[3]} + ${l[4]} = ${l[5]}$`, `$${l[4]} + ${l[5]} = ${l[6]}$`), sp: 's' };
    },
  ];
  const g11a = [
    (r) => {
      const fig = figSeqL('square', [1, 2, 3]);
      return { q: T('The diagram shows a pattern of squares made with matchsticks. (a) Describe the rule for adding the next figure. (b) How many matchsticks are needed for Figure 6?', 'Rajah menunjukkan pola segi empat sama yang dibina menggunakan batang mancis. (a) Huraikan peraturan untuk menambah rajah berikutnya. (b) Berapakah bilangan batang mancis yang diperlukan untuk Rajah 6?'), fig, a: T('(a) Each new figure adds 3 matchsticks (one more square). (b) $4 + 3 \\times 5 = 19$', '(a) Setiap rajah baharu menambah 3 batang mancis (satu segi empat sama lagi). (b) $4 + 3 \\times 5 = 19$'), w: W(T('(a) Counting the matchsticks gives $4,\\ 7,\\ 10$: each new square shares one side with the last, so only 3 new matchsticks are needed.', '(a) Membilang batang mancis memberi $4,\\ 7,\\ 10$: setiap segi empat sama baharu berkongsi satu sisi dengan yang sebelumnya, jadi hanya 3 batang mancis baharu diperlukan.'), T('(b) From Figure 1 to Figure 6 there are 5 steps of 3.', '(b) Dari Rajah 1 ke Rajah 6 terdapat 5 langkah sebanyak 3.'), '$4 + 3 \\times 5 = 19$'), sp: 'l' };
    },
    (r) => {
      const fig = figSeqL('tri', [1, 2, 3, 4]);
      return { q: T('Triangles are joined in a row using matchsticks as shown. (a) Write the number of matchsticks in Figures 1 to 4. (b) Find the number for Figure 8.', 'Segi tiga disambung dalam satu baris menggunakan batang mancis seperti yang ditunjukkan. (a) Tulis bilangan batang mancis dalam Rajah 1 hingga 4. (b) Cari bilangannya untuk Rajah 8.'), fig, a: T('(a) 3, 5, 7, 9 (b) 17', '(a) 3, 5, 7, 9 (b) 17'), w: W(T('(a) The first triangle needs 3 matchsticks; each extra triangle shares one side, so it needs only 2 more: $3,\\ 5,\\ 7,\\ 9$.', '(a) Segi tiga pertama memerlukan 3 batang mancis; setiap segi tiga tambahan berkongsi satu sisi, jadi ia memerlukan hanya 2 lagi: $3,\\ 5,\\ 7,\\ 9$.'), T('(b) From Figure 1 to Figure 8 there are 7 steps of 2.', '(b) Dari Rajah 1 ke Rajah 8 terdapat 7 langkah sebanyak 2.'), '$3 + 2 \\times 7 = 17$'), sp: 'l' };
    },
  ];
  const g11Ee = [
    (r) => {
      const l = range(1, 6).map((k) => k * k + 1);
      return { q: T(`The differences between consecutive terms of $${seqStr(l.slice(0, 4))},\\ \\ldots$ are not constant. Find the next two terms and suggest a rule for the $n$th term.`, `Beza antara sebutan berturutan bagi $${seqStr(l.slice(0, 4))},\\ \\ldots$ tidak malar. Cari dua sebutan berikutnya dan cadangkan peraturan bagi sebutan ke-$n$.`), a: T(`$${l[4]},\\ ${l[5]}$; $T_n = n^2 + 1$`), w: W(T('Differences: $3,\\ 5,\\ 7$ – the odd numbers, which is the pattern of the square numbers.', 'Beza: $3,\\ 5,\\ 7$ – nombor ganjil, iaitu pola nombor kuasa dua sempurna.'), T('Each term is $1$ more than a square number: $1^2 + 1 = 2$, $2^2 + 1 = 5$, $3^2 + 1 = 10$, $4^2 + 1 = 17$.', 'Setiap sebutan ialah $1$ lebih daripada nombor kuasa dua: $1^2 + 1 = 2$, $2^2 + 1 = 5$, $3^2 + 1 = 10$, $4^2 + 1 = 17$.'), `$T_5 = 5^2 + 1 = ${l[4]}$, $T_6 = 6^2 + 1 = ${l[5]}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 4), c = r.int(1, 3);
      const odd = range(0, 2).map((i) => a + 5 * i), even = range(0, 2).map((i) => b + 3 * i);
      const l = [];
      for (let i = 0; i < 3; i++) l.push(odd[i], even[i]);
      return { q: T(`The pattern $${seqStr(l)},\\ \\ldots$ is made of two interleaved sequences (odd-numbered terms and even-numbered terms). Find the next two terms.`, `Pola $${seqStr(l)},\\ \\ldots$ terdiri daripada dua jujukan yang berselang-seli (sebutan ganjil dan sebutan genap). Cari dua sebutan berikutnya.`), a: T(`$${a + 15},\\ ${b + 9}$`), w: W(T(`Terms in the odd positions: $${a},\\ ${a + 5},\\ ${a + 10}$ – add 5 each time.`, `Sebutan pada kedudukan ganjil: $${a},\\ ${a + 5},\\ ${a + 10}$ – tambah 5 setiap kali.`), T(`Terms in the even positions: $${b},\\ ${b + 3},\\ ${b + 6}$ – add 3 each time.`, `Sebutan pada kedudukan genap: $${b},\\ ${b + 3},\\ ${b + 6}$ – tambah 3 setiap kali.`), `$${a + 10} + 5 = ${a + 15}$, $${b + 6} + 3 = ${b + 9}$`), sp: 's' };
    },
  ];

  const g12e = [
    (r) => {
      const a = r.int(2, 12), d = r.int(2, 8);
      return { q: T(`The first term of a sequence is $T_1 = ${a}$ and each term is ${d} more than the one before. Find $T_5$.`, `Sebutan pertama suatu jujukan ialah $T_1 = ${a}$ dan setiap sebutan lebih ${d} daripada sebutan sebelumnya. Cari $T_5$.`), a: T(`$T_5 = ${a + 4 * d}$`), w: W(T('$T_n = T_1 + (n - 1)d$', '$T_n = T_1 + (n - 1)d$'), T(`From $T_1$ to $T_5$ there are 4 steps of ${d}.`, `Dari $T_1$ ke $T_5$ terdapat 4 langkah sebanyak ${d}.`), `$T_5 = ${a} + 4 \\times ${d} = ${a + 4 * d}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(1, 8), d = r.int(2, 6);
      const l = arith(a, d, 4);
      return { q: T(`Write down the next term of the sequence $${seqStr(l)},\\ \\ldots$ and state $T_2$.`, `Tulis sebutan berikutnya bagi jujukan $${seqStr(l)},\\ \\ldots$ dan nyatakan $T_2$.`), a: T(`Next term: ${l[3] + d}; $T_2 = ${l[1]}$`, `Sebutan berikutnya: ${l[3] + d}; $T_2 = ${l[1]}$`), w: W(T(`Common difference: $${l[1]} - ${l[0]} = ${d}$`, `Beza sepunya: $${l[1]} - ${l[0]} = ${d}$`), `$${l[3]} + ${d} = ${l[3] + d}$`, T(`$T_2$ is the second term in the list: $${l[1]}$`, `$T_2$ ialah sebutan kedua dalam senarai: $${l[1]}$`)), sp: 'xs' };
    },
  ];
  const g12m = [
    (r) => {
      const a = r.int(2, 9), d = r.int(2, 7), k = r.pick([10, 12, 15, 20]);
      return { q: T(`The sequence $${seqStr(arith(a, d, 4))},\\ \\ldots$ continues in the same way. Find $T_{${k}}$.`, `Jujukan $${seqStr(arith(a, d, 4))},\\ \\ldots$ diteruskan dengan cara yang sama. Cari $T_{${k}}$.`), a: T(`$T_{${k}} = ${a + (k - 1) * d}$`), w: W(T(`$T_1 = ${a}$ and the common difference is $${d}$.`, `$T_1 = ${a}$ dan beza sepunya ialah $${d}$.`), `$T_n = ${a} + (n - 1) \\times ${d}$`, `$T_{${k}} = ${a} + ${k - 1} \\times ${d} = ${a + (k - 1) * d}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 9), d = r.int(3, 7);
      const yes = r.chance();
      const N = r.int(9, 20);
      const v = yes ? a + (N - 1) * d : a + (N - 1) * d + r.int(1, d - 1);
      return { q: T(`Is ${v} a term of the sequence $${seqStr(arith(a, d, 4))},\\ \\ldots$? If it is, state which term.`, `Adakah ${v} suatu sebutan bagi jujukan $${seqStr(arith(a, d, 4))},\\ \\ldots$? Jika ya, nyatakan sebutan yang ke berapa.`), a: yes ? T(`Yes, $T_{${N}}$`, `Ya, $T_{${N}}$`) : T(`No: $(${v} - ${a}) \\div ${d} = ${n(round((v - a) / d, 3))}$, so $n$ is not a whole number.`, `Tidak: $(${v} - ${a}) \\div ${d} = ${n(round((v - a) / d, 3))}$, jadi $n$ bukan nombor bulat.`), w: W(T(`$T_1 = ${a}$, common difference $${d}$, so $T_n = ${a} + (n - 1) \\times ${d}$.`, `$T_1 = ${a}$, beza sepunya $${d}$, jadi $T_n = ${a} + (n - 1) \\times ${d}$.`), `$${a} + (n - 1) \\times ${d} = ${v}$`, `$n - 1 = (${v} - ${a}) \\div ${d} = ${n(round((v - a) / d, 3))}$`, yes ? T(`$n = ${N}$, a whole number, so ${v} is the ${N}th term.`, `$n = ${N}$, satu nombor bulat, jadi ${v} ialah sebutan ke-${N}.`) : T('A term number must be a whole number, so it is not a term of the sequence.', 'Nombor sebutan mestilah nombor bulat, jadi ia bukan sebutan bagi jujukan itu.')), sp: 's' };
    },
  ];
  const g12a = [
    (r) => {
      const a = r.int(20, 50), d = r.int(2, 6);
      const N = r.int(6, 12);
      const v = a - (N - 1) * d;
      return { q: T(`In the sequence $${seqStr(arith(a, -d, 4))},\\ \\ldots$, which term is equal to ${v}?`, `Dalam jujukan $${seqStr(arith(a, -d, 4))},\\ \\ldots$, sebutan yang ke berapakah sama dengan ${v}?`), a: T(`$T_{${N}}$`), w: W(T(`$T_1 = ${a}$ and each term is ${d} less, so $T_n = ${a} - ${d}(n - 1)$.`, `$T_1 = ${a}$ dan setiap sebutan kurang ${d}, jadi $T_n = ${a} - ${d}(n - 1)$.`), `$${a} - ${d}(n - 1) = ${v}$`, `$n - 1 = (${a} - ${v}) \\div ${d} = ${N - 1}$`, `$n = ${N}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(1, 5) + 0.5, d = r.pick([0.5, 1.5, 2.5]);
      const N = r.int(7, 14);
      return { q: T(`The sequence $${seqStr(arith(a, d, 4))},\\ \\ldots$ increases by a constant amount. Find $T_{${N}}$.`, `Jujukan $${seqStr(arith(a, d, 4))},\\ \\ldots$ bertambah dengan jumlah yang malar. Cari $T_{${N}}$.`), a: T(`$${n(a + (N - 1) * d)}$`), w: W(T(`Common difference: $${n(a + d)} - ${n(a)} = ${n(d)}$`, `Beza sepunya: $${n(a + d)} - ${n(a)} = ${n(d)}$`), `$T_{${N}} = ${n(a)} + ${N - 1} \\times ${n(d)} = ${n(a + (N - 1) * d)}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(4, 12), d = r.int(3, 7);
      const target = a + 10 * d + r.pick([0, 1]);
      const yes = (target - a) % d === 0;
      return { q: T(`Determine whether ${target} is a term of the sequence $${seqStr(arith(a, d, 4))},\\ \\ldots$. Show that the term number is (or is not) a positive integer.`, `Tentukan sama ada ${target} ialah sebutan bagi jujukan $${seqStr(arith(a, d, 4))},\\ \\ldots$. Tunjukkan bahawa nombor sebutan ialah (atau bukan) integer positif.`), a: yes ? T(`Yes: $n = (${target} - ${a}) \\div ${d} + 1 = ${(target - a) / d + 1}$`, `Ya: $n = (${target} - ${a}) \\div ${d} + 1 = ${(target - a) / d + 1}$`) : T(`No: $n = (${target} - ${a}) \\div ${d} + 1 = ${n(round((target - a) / d + 1, 3))}$, not an integer.`, `Tidak: $n = (${target} - ${a}) \\div ${d} + 1 = ${n(round((target - a) / d + 1, 3))}$, bukan integer.`), w: W(T(`$T_1 = ${a}$ and the common difference is $${d}$.`, `$T_1 = ${a}$ dan beza sepunya ialah $${d}$.`), `$${a} + (n - 1) \\times ${d} = ${target}$`, `$n = (${target} - ${a}) \\div ${d} + 1 = ${n(round((target - a) / d + 1, 3))}$`, yes ? T('This is a positive integer, so it is a term of the sequence.', 'Ini ialah integer positif, jadi ia ialah sebutan bagi jujukan itu.') : T('A term number must be a positive integer, so it is not a term of the sequence.', 'Nombor sebutan mestilah integer positif, jadi ia bukan sebutan bagi jujukan itu.')), sp: 'm' };
    },
  ];
  const g12Ee = g11Ee;

  const g13e = [
    (r) => {
      const a = r.int(2, 6), b = r.int(1, 5);
      const l = range(1, 4).map((i) => a * i + b);
      return { q: T(`The first four terms of a sequence are $${seqStr(l)}$. Write the $n$th term $T_n$.`, `Empat sebutan pertama suatu jujukan ialah $${seqStr(l)}$. Tulis sebutan ke-$n$, $T_n$.`), a: T(`$T_n = ${lin(a, b, 'n')}$`), w: W(T(`Common difference: $${l[1]} - ${l[0]} = ${a}$, so $T_n = ${a}n + c$.`, `Beza sepunya: $${l[1]} - ${l[0]} = ${a}$, jadi $T_n = ${a}n + c$.`), `$${a}(1) + c = ${l[0]}$, $c = ${b}$`, `$T_n = ${lin(a, b, 'n')}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(1, 6);
      const k = r.int(5, 12);
      return { q: T(`Given $T_n = ${lin(a, b, 'n')}$, find $T_{${k}}$.`, `Diberi $T_n = ${lin(a, b, 'n')}$, cari $T_{${k}}$.`), a: T(`$${a * k + b}$`), w: W(T(`Substitute $n = ${k}$:`, `Gantikan $n = ${k}$:`), `$T_{${k}} = ${a}(${k}) + ${b} = ${a * k} + ${b} = ${a * k + b}$`), sp: 'xs' };
    },
  ];
  const g13m = [
    (r) => {
      const a = r.int(2, 6), c = r.int(15, 30);
      const l = range(1, 4).map((i) => c - a * i);
      return { q: T(`Find the formula for $T_n$ of the sequence $${seqStr(l)},\\ \\ldots$ and use it to check $T_5$.`, `Cari rumus bagi $T_n$ bagi jujukan $${seqStr(l)},\\ \\ldots$ dan gunakannya untuk menyemak $T_5$.`), a: T(`$T_n = ${c} - ${a}n$; $T_5 = ${c - 5 * a}$`), w: W(T(`The terms fall by ${a} each time: $${l[1]} - ${l[0]} = ${-a}$, so $T_n = -${a}n + k$.`, `Sebutan menyusut ${a} setiap kali: $${l[1]} - ${l[0]} = ${-a}$, jadi $T_n = -${a}n + k$.`), `$-${a}(1) + k = ${l[0]}$, $k = ${c}$`, `$T_n = ${c} - ${a}n$`, `$T_5 = ${c} - ${a}(5) = ${c} - ${5 * a} = ${c - 5 * a}$`), sp: 's' };
    },
    (r) => {
      const fig = figSeqL('tri', [1, 2, 3, 4]);
      const k = r.int(10, 30);
      return { q: T(`The diagram shows triangles joined in a row using matchsticks. Find a formula for the number of matchsticks in Figure $n$, and hence the number in Figure ${k}.`, `Rajah menunjukkan segi tiga yang disambung dalam satu baris menggunakan batang mancis. Cari rumus bagi bilangan batang mancis dalam Rajah $n$, dan seterusnya bilangannya dalam Rajah ${k}.`), fig, a: T(`$T_n = 2n + 1$; Figure ${k}: ${2 * k + 1}`, `$T_n = 2n + 1$; Rajah ${k}: ${2 * k + 1}`), w: W(T('Counting the matchsticks gives $3,\\ 5,\\ 7,\\ 9$ – 2 more each time, so $T_n = 2n + c$.', 'Membilang batang mancis memberi $3,\\ 5,\\ 7,\\ 9$ – 2 lebih setiap kali, jadi $T_n = 2n + c$.'), '$2(1) + c = 3$, $c = 1$, so $T_n = 2n + 1$', `$T_{${k}} = 2(${k}) + 1 = ${2 * k} + 1 = ${2 * k + 1}$`), sp: 'l' };
    },
  ];
  const g13a = [
    (r) => {
      const fig = figSeqL('square', [1, 2, 3]);
      const k = r.int(15, 40);
      return { q: T(`Squares are joined in a row using matchsticks as shown. (a) Find a formula for the number of matchsticks $T_n$ in Figure $n$. (b) Find $T_{${k}}$. (c) Which figure uses ${3 * (k + 3) + 1} matchsticks?`, `Segi empat sama disambung dalam satu baris menggunakan batang mancis seperti yang ditunjukkan. (a) Cari rumus bagi bilangan batang mancis $T_n$ dalam Rajah $n$. (b) Cari $T_{${k}}$. (c) Rajah yang manakah menggunakan ${3 * (k + 3) + 1} batang mancis?`), fig, a: T(`(a) $T_n = 3n + 1$ (b) ${3 * k + 1} (c) Figure ${k + 3}`, `(a) $T_n = 3n + 1$ (b) ${3 * k + 1} (c) Rajah ${k + 3}`), w: W(T('(a) The counts are $4,\\ 7,\\ 10$: each new square adds 3 matchsticks, so $T_n = 3n + c$; $3(1) + c = 4$ gives $c = 1$.', '(a) Bilangannya ialah $4,\\ 7,\\ 10$: setiap segi empat sama baharu menambah 3 batang mancis, jadi $T_n = 3n + c$; $3(1) + c = 4$ memberi $c = 1$.'), `$\\text{(b)}\\ T_{${k}} = 3(${k}) + 1 = ${3 * k} + 1 = ${3 * k + 1}$`, T(`(c) Solve $3n + 1 = ${3 * (k + 3) + 1}$: $3n = ${3 * (k + 3)}$, $n = ${k + 3}$`, `(c) Selesaikan $3n + 1 = ${3 * (k + 3) + 1}$: $3n = ${3 * (k + 3)}$, $n = ${k + 3}$`)), sp: 'xl' };
    },
    (r) => {
      const a = r.int(5, 12), d = r.int(3, 6), w = r.int(6, 12);
      const [p] = r.pair();
      return { q: T(`${p} saves RM${a} in week 1, RM${a + d} in week 2, RM${a + 2 * d} in week 3, and so on. (a) How much does ${p} save in week $n$? (b) How much is saved in week ${w}? (c) Find the total saved after 4 weeks.`, `${p} menyimpan RM${a} pada minggu pertama, RM${a + d} pada minggu kedua, RM${a + 2 * d} pada minggu ketiga, dan seterusnya. (a) Berapakah simpanan ${p} pada minggu ke-$n$? (b) Berapakah simpanan pada minggu ke-${w}? (c) Cari jumlah simpanan selepas 4 minggu.`), a: T(`(a) RM$(${a} + ${d}(n-1))$ (b) RM${a + d * (w - 1)} (c) RM${a * 4 + d * 6}`, `(a) RM$(${a} + ${d}(n-1))$ (b) RM${a + d * (w - 1)} (c) RM${a * 4 + d * 6}`), w: W(T(`(a) Week 1 is ${a} and each week adds ${d}, so week $n$ is $${a} + ${d}(n - 1)$.`, `(a) Minggu pertama ialah ${a} dan setiap minggu menambah ${d}, jadi minggu ke-$n$ ialah $${a} + ${d}(n - 1)$.`), `$\\text{(b)}\\ ${a} + ${d}(${w} - 1) = ${a} + ${d * (w - 1)} = ${a + d * (w - 1)}$`, T(`(c) The first four weeks are $${a},\\ ${a + d},\\ ${a + 2 * d},\\ ${a + 3 * d}$: $${a} + ${a + d} + ${a + 2 * d} + ${a + 3 * d} = ${a * 4 + d * 6}$`, `(c) Empat minggu pertama ialah $${a},\\ ${a + d},\\ ${a + 2 * d},\\ ${a + 3 * d}$: $${a} + ${a + d} + ${a + 2 * d} + ${a + 3 * d} = ${a * 4 + d * 6}$`)), sp: 'l' };
    },
    (r) => {
      const a = r.int(3, 6), d = r.int(3, 5), rows = r.int(10, 16);
      return { q: T(`A hall has ${a} seats in the first row and each row has ${d} seats more than the row in front. Find the number of seats in row $n$ and in row ${rows}.`, `Sebuah dewan mempunyai ${a} tempat duduk pada baris pertama dan setiap baris mempunyai ${d} tempat duduk lebih daripada baris di hadapannya. Cari bilangan tempat duduk pada baris ke-$n$ dan pada baris ke-${rows}.`), a: T(`$T_n = ${a} + ${d}(n-1)$; row ${rows}: ${a + d * (rows - 1)}`, `$T_n = ${a} + ${d}(n-1)$; baris ${rows}: ${a + d * (rows - 1)}`), w: W(T(`Row 1 has ${a} seats and each later row adds ${d}, so row $n$ has $${a} + ${d}(n - 1)$ seats.`, `Baris pertama mempunyai ${a} tempat duduk dan setiap baris seterusnya menambah ${d}, jadi baris ke-$n$ mempunyai $${a} + ${d}(n - 1)$ tempat duduk.`), T(`From row 1 to row ${rows} there are ${rows - 1} steps.`, `Dari baris 1 ke baris ${rows} terdapat ${rows - 1} langkah.`), `$${a} + ${d}(${rows} - 1) = ${a} + ${d * (rows - 1)} = ${a + d * (rows - 1)}$`), sp: 'm' };
    },
  ];
  const g13Ee = [
    (r) => {
      const a = r.int(3, 8), d = r.int(2, 5), thr = r.int(60, 120);
      const first = Math.floor((thr - a) / d) + 2;
      return { q: T(`For the sequence $T_n = ${lin(d, a - d, 'n')}$, find the first term that is greater than ${thr}.`, `Bagi jujukan $T_n = ${lin(d, a - d, 'n')}$, cari sebutan pertama yang lebih besar daripada ${thr}.`), a: T(`$n = ${first}$; $T_{${first}} = ${d * first + a - d}$`), w: W(T(`Solve $${lin(d, a - d, 'n')} > ${thr}$:`, `Selesaikan $${lin(d, a - d, 'n')} > ${thr}$:`), `$${d}n > ${thr} ${a - d < 0 ? '+' : '-'} ${Math.abs(a - d)} = ${thr - (a - d)}$`, `$n > ${n(round((thr - (a - d)) / d, 3))}$`, T(`The smallest whole number greater than this is $n = ${first}$: $T_{${first}} = ${d}(${first}) ${a - d < 0 ? '-' : '+'} ${Math.abs(a - d)} = ${d * first + a - d}$`, `Nombor bulat terkecil yang lebih besar daripada ini ialah $n = ${first}$: $T_{${first}} = ${d}(${first}) ${a - d < 0 ? '-' : '+'} ${Math.abs(a - d)} = ${d * first + a - d}$`)), sp: 'm' };
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
      return { q: T(`Expand $${a}(${lin(b, c)})$.`, `Kembangkan $${a}(${lin(b, c)})$.`), a: T(`$${lin(a * b, a * c)}$`), w: W(T(`Multiply each term inside the bracket by ${a}:`, `Darabkan setiap sebutan di dalam kurungan dengan ${a}:`), `$${a} \\times ${lin(b, 0)} = ${lin(a * b, 0)}$, $${a} \\times ${c} = ${a * c}$`, `$${lin(a * b, a * c)}$`), sp: 'xs' };
    },
    (r) => {
      const p = r.int(1, 6), q = r.int(1, 6);
      return { q: T(`Expand $(x + ${p})(x + ${q})$.`, `Kembangkan $(x + ${p})(x + ${q})$.`), a: T(`$${X(1, p + q, p * q)}$`), w: W(T('Multiply each term of the first bracket by each term of the second:', 'Darabkan setiap sebutan kurungan pertama dengan setiap sebutan kurungan kedua:'), `$x^2 + ${q}x + ${p}x + ${p * q}$`, T(`Collect the $x$ terms: $${q}x + ${p}x = ${p + q}x$`, `Kumpulkan sebutan $x$: $${q}x + ${p}x = ${p + q}x$`), `$${X(1, p + q, p * q)}$`), sp: 's' };
    },
  ];
  const g21m = [
    (r) => {
      const a = r.int(2, 4), b = r.nz(-6, 6), c = r.int(1, 3), d = r.nz(-6, 6);
      return { q: T(`Expand $${br(a, b)}${br(c, d)}$.`, `Kembangkan $${br(a, b)}${br(c, d)}$.`), a: T(`$${X(a * c, a * d + b * c, b * d)}$`), w: W(T('Multiply each term of the first bracket by each term of the second:', 'Darabkan setiap sebutan kurungan pertama dengan setiap sebutan kurungan kedua:'), `$${poly([[a * c, 'x^2'], [a * d, 'x'], [b * c, 'x'], [b * d, '']])}$`, T('Collect the like terms:', 'Kumpulkan sebutan serupa:'), `$${X(a * c, a * d + b * c, b * d)}$`), sp: 's' };
    },
    (r) => {
      const s = r.chance();
      const p = r.int(2, 8);
      return { q: T(`Expand $(x ${s ? '+' : '-'} ${p})^2$.`, `Kembangkan $(x ${s ? '+' : '-'} ${p})^2$.`), a: T(`$${X(1, s ? 2 * p : -2 * p, p * p)}$`), w: W(T(`$(x ${s ? '+' : '-'} ${p})^2$ means $(x ${s ? '+' : '-'} ${p})(x ${s ? '+' : '-'} ${p})$.`, `$(x ${s ? '+' : '-'} ${p})^2$ bermaksud $(x ${s ? '+' : '-'} ${p})(x ${s ? '+' : '-'} ${p})$.`), `$x^2 ${s ? '+' : '-'} ${p}x ${s ? '+' : '-'} ${p}x + ${p * p}$`, `$= ${X(1, s ? 2 * p : -2 * p, p * p)}$`, T('The middle term is twice the product, and the last term is positive because two negatives multiply to a positive.', 'Sebutan tengah ialah dua kali hasil darab, dan sebutan terakhir positif kerana dua negatif didarab memberi positif.')), sp: 's' };
    },
    (r) => {
      const b = r.int(1, 5), c = r.nz(-4, 4), d = r.int(1, 5), f = r.nz(-4, 4);
      const p1 = [1, b + c, b * c], p2 = [1, d + f, d * f];
      return { q: T(`Expand and simplify $(x + ${b})(x ${c < 0 ? '-' : '+'} ${Math.abs(c)}) + (x + ${d})(x ${f < 0 ? '-' : '+'} ${Math.abs(f)})$.`, `Kembangkan dan ringkaskan $(x + ${b})(x ${c < 0 ? '-' : '+'} ${Math.abs(c)}) + (x + ${d})(x ${f < 0 ? '-' : '+'} ${Math.abs(f)})$.`), a: T(`$${X(2, p1[1] + p2[1], p1[2] + p2[2])}$`), w: W(T('Expand each product separately:', 'Kembangkan setiap hasil darab secara berasingan:'), `$(x + ${b})(${lin(1, c)}) = ${X(1, p1[1], p1[2])}$`, `$(x + ${d})(${lin(1, f)}) = ${X(1, p2[1], p2[2])}$`, T('Add the two expansions and collect like terms:', 'Tambah kedua-dua kembangan dan kumpulkan sebutan serupa:'), `$${X(2, p1[1] + p2[1], p1[2] + p2[2])}$`), sp: 'm' };
    },
  ];
  const g21a = [
    (r) => {
      const a = r.int(2, 4), b = r.nz(-4, 4), c = r.int(1, 3), d = r.nz(-5, 5);
      const p = r.nz(-5, 5), q = r.nz(-5, 5);
      const sq = [a * a, 2 * a * b, b * b];
      const pr = [1, p + q, p * q];
      return { q: T(`Expand and simplify $${br(a, b)}^2 - (x ${p < 0 ? '-' : '+'} ${Math.abs(p)})(x ${q < 0 ? '-' : '+'} ${Math.abs(q)})$.`, `Kembangkan dan ringkaskan $${br(a, b)}^2 - (x ${p < 0 ? '-' : '+'} ${Math.abs(p)})(x ${q < 0 ? '-' : '+'} ${Math.abs(q)})$.`), a: T(`$${X(sq[0] - pr[0], sq[1] - pr[1], sq[2] - pr[2])}$`), w: W(`$${br(a, b)}^2 = ${X(sq[0], sq[1], sq[2])}$`, `$(${lin(1, p)})(${lin(1, q)}) = ${X(pr[0], pr[1], pr[2])}$`, T('Subtract, changing the sign of every term in the second expansion:', 'Tolak, dengan menukar tanda setiap sebutan dalam kembangan kedua:'), `$${X(sq[0] - pr[0], sq[1] - pr[1], sq[2] - pr[2])}$`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([99, 98, 101, 102, 49, 51, 199]);
      const base = k > 150 ? 200 : k > 75 ? 100 : 50;
      const d = k - base;
      return { q: T(`By using $(a + b)^2 = a^2 + 2ab + b^2$ or $(a - b)^2 = a^2 - 2ab + b^2$, evaluate $${k}^2$ without a calculator.`, `Dengan menggunakan $(a + b)^2 = a^2 + 2ab + b^2$ atau $(a - b)^2 = a^2 - 2ab + b^2$, hitung $${k}^2$ tanpa kalkulator.`), a: T(`$(${base} ${d < 0 ? '-' : '+'} ${Math.abs(d)})^2 = ${k * k}$`), w: W(T(`Write ${k} as ${base} ${d < 0 ? '-' : '+'} ${Math.abs(d)}, so $a = ${base}$ and $b = ${Math.abs(d)}$.`, `Tulis ${k} sebagai ${base} ${d < 0 ? '-' : '+'} ${Math.abs(d)}, jadi $a = ${base}$ dan $b = ${Math.abs(d)}$.`), `$${base}^2 = ${base * base}$, $2ab = 2 \\times ${base} \\times ${Math.abs(d)} = ${2 * base * Math.abs(d)}$, $${Math.abs(d)}^2 = ${d * d}$`, `$${base * base} ${d < 0 ? '-' : '+'} ${2 * base * Math.abs(d)} + ${d * d} = ${k * k}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(41, 78), b = r.int(2, 9);
      const c = a - 2 * b;
      return { q: T(`Use $a^2 - b^2 = (a + b)(a - b)$ to evaluate $${a}^2 - ${c}^2$ without a calculator.`, `Gunakan $a^2 - b^2 = (a + b)(a - b)$ untuk menghitung $${a}^2 - ${c}^2$ tanpa kalkulator.`), a: T(`$(${a} + ${c})(${a} - ${c}) = ${a + c} \\times ${2 * b} = ${(a + c) * 2 * b}$`), w: W(T(`Here $a = ${a}$ and $b = ${c}$:`, `Di sini $a = ${a}$ dan $b = ${c}$:`), `$${a}^2 - ${c}^2 = (${a} + ${c})(${a} - ${c})$`, `$= ${a + c} \\times ${2 * b} = ${(a + c) * 2 * b}$`, T('Factorising first turns two squarings into one easy multiplication.', 'Memfaktorkan dahulu menukar dua pengkuasaduaan kepada satu pendaraban mudah.')), sp: 'm' };
    },
  ];

  const g22e = [
    (r) => {
      const k = r.int(2, 6), a = r.int(1, 5), b = r.int(1, 7);
      return { q: T(`Factorise $${lin(k * a, k * b)}$.`, `Faktorkan $${lin(k * a, k * b)}$.`), a: T(`$${k}(${lin(a, b)})$`), w: W(T(`The highest common factor of $${k * a}x$ and $${k * b}$ is $${k}$.`, `Faktor sepunya terbesar bagi $${k * a}x$ dan $${k * b}$ ialah $${k}$.`), `$${k * a}x \\div ${k} = ${a === 1 ? 'x' : a + 'x'}$, $${k * b} \\div ${k} = ${b}$`, `$${lin(k * a, k * b)} = ${k}(${lin(a, b)})$`), sp: 'xs' };
    },
    (r) => {
      const p = r.int(1, 6), q = r.int(1, 6);
      return { q: T(`Factorise $${X(1, p + q, p * q)}$.`, `Faktorkan $${X(1, p + q, p * q)}$.`), a: T(`$(x + ${p})(x + ${q})$`), w: W(pairLine(p, q), `$${X(1, p + q, p * q)} = (x + ${p})(x + ${q})$`), sp: 's' };
    },
  ];
  const g22m = [
    (r) => {
      const p = r.nz(-8, 8), q = r.nz(-8, 8);
      need(p !== -q);
      const f = (v) => `(x ${v < 0 ? '-' : '+'} ${Math.abs(v)})`;
      return { q: T(`Factorise $${X(1, p + q, p * q)}$.`, `Faktorkan $${X(1, p + q, p * q)}$.`), a: T(`$${f(p)}${f(q)}$`), w: W(pairLine(p, q), `$${X(1, p + q, p * q)} = ${f(p)}${f(q)}$`, ...(p * q < 0 ? [T('A negative constant term means the two numbers have opposite signs.', 'Sebutan pemalar yang negatif bermakna kedua-dua nombor itu bertanda bertentangan.')] : [])), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 9), k = r.pick([1, 2, 3]);
      const dots = T('Difference of two squares: $p^2 - q^2 = (p + q)(p - q)$.', 'Beza dua kuasa dua: $p^2 - q^2 = (p + q)(p - q)$.');
      return r.chance()
        ? { q: T(`Factorise $x^2 - ${a * a}$.`, `Faktorkan $x^2 - ${a * a}$.`), a: T(`$(x + ${a})(x - ${a})$`), w: W(dots, `$x^2 - ${a * a} = x^2 - ${a}^2$`, `$= (x + ${a})(x - ${a})$`), sp: 's' }
        : { q: T(`Factorise $${4 * k * k}x^2 - ${a * a}$.`, `Faktorkan $${4 * k * k}x^2 - ${a * a}$.`), a: T(`$(${2 * k}x + ${a})(${2 * k}x - ${a})$`), w: W(dots, `$${4 * k * k}x^2 - ${a * a} = (${2 * k}x)^2 - ${a}^2$`, `$= (${2 * k}x + ${a})(${2 * k}x - ${a})$`), sp: 's' };
    },
    (r) => {
      const u = r.pick([2, 3]), p = r.int(1, 5), q = r.nz(-5, 5);
      need(gcd(u, Math.abs(q)) === 1);
      return { q: T(`Factorise $${X(u, u * q + p, p * q)}$.`, `Faktorkan $${X(u, u * q + p, p * q)}$.`), a: T(`$${br(u, p)}${br(1, q)}$`), w: W(T(`Split the middle term: two numbers with product $${u} \\times ${p * q < 0 ? `(${p * q})` : p * q} = ${u * p * q}$ and sum $${u * q + p}$ are $${u * q}$ and $${p}$.`, `Pisahkan sebutan tengah: dua nombor dengan hasil darab $${u} \\times ${p * q < 0 ? `(${p * q})` : p * q} = ${u * p * q}$ dan hasil tambah $${u * q + p}$ ialah $${u * q}$ dan $${p}$.`), `$= ${poly([[u, 'x^2'], [u * q, 'x'], [p, 'x'], [p * q, '']])}$`, T('Group in pairs and take out the common factor:', 'Kumpulkan berpasangan dan keluarkan faktor sepunya:'), `$= ${u}x(${lin(1, q)}) + ${p}(${lin(1, q)}) = ${br(u, p)}${br(1, q)}$`), sp: 'm' };
    },
  ];
  const g22a = [
    (r) => {
      const k = r.int(2, 5), a = r.int(2, 6);
      return { q: T(`Factorise completely $${k}x^2 - ${k * a * a}$.`, `Faktorkan sepenuhnya $${k}x^2 - ${k * a * a}$.`), a: T(`$${k}(x + ${a})(x - ${a})$`), w: W(T(`Take out the common factor $${k}$ first:`, `Keluarkan faktor sepunya $${k}$ terlebih dahulu:`), `$${k}x^2 - ${k * a * a} = ${k}(x^2 - ${a * a})$`, T('Now $x^2 - ' + a * a + ' = x^2 - ' + a + '^2$ is a difference of two squares:', 'Kini $x^2 - ' + a * a + ' = x^2 - ' + a + '^2$ ialah beza dua kuasa dua:'), `$= ${k}(x + ${a})(x - ${a})$`), sp: 'm' };
    },
    (r) => {
      const u = r.int(2, 6), v = r.int(1, 4), p = r.int(1, 5), q = r.nz(-5, 5);
      need(gcd(u, p) === 1 && gcd(v, Math.abs(q)) === 1 && u !== v);
      return { q: T(`Factorise $${X(u * v, u * q + v * p, p * q)}$.`, `Faktorkan $${X(u * v, u * q + v * p, p * q)}$.`), a: T(`$${br(u, p)}${br(v, q)}$`), w: W(T(`Multiply the first and last coefficients: $${u * v} \\times ${p * q < 0 ? `(${p * q})` : p * q} = ${u * v * p * q}$. Two numbers with this product and sum $${u * q + v * p}$ are $${u * q}$ and $${v * p}$.`, `Darabkan pekali pertama dengan pekali terakhir: $${u * v} \\times ${p * q < 0 ? `(${p * q})` : p * q} = ${u * v * p * q}$. Dua nombor dengan hasil darab ini dan hasil tambah $${u * q + v * p}$ ialah $${u * q}$ dan $${v * p}$.`), `$= ${poly([[u * v, 'x^2'], [u * q, 'x'], [v * p, 'x'], [p * q, '']])}$`, T('Group in pairs and take out the common factor:', 'Kumpulkan berpasangan dan keluarkan faktor sepunya:'), `$= ${u}x(${lin(v, q)}) + ${p}(${lin(v, q)}) = ${br(u, p)}${br(v, q)}$`), sp: 'm' };
    },
    (r) => {
      const p = r.int(1, 6), q = r.int(1, 6);
      need(p !== q);
      return { q: T(`Factorise $-x^2 + ${p + q}x - ${p * q}$ by first taking out $-1$.`, `Faktorkan $-x^2 + ${p + q}x - ${p * q}$ dengan mengeluarkan $-1$ terlebih dahulu.`), a: T(`$-(x - ${p})(x - ${q})$`), w: W(T('Taking out $-1$ changes the sign of every term:', 'Mengeluarkan $-1$ menukar tanda setiap sebutan:'), `$-x^2 + ${p + q}x - ${p * q} = -(x^2 - ${p + q}x + ${p * q})$`, pairLine(-p, -q), `$= -(x - ${p})(x - ${q})$`), sp: 'm' };
    },
  ];
  const fmtF = (num, den) => `\\dfrac{${num}}{${den}}`;
  const g23e = [
    (r) => {
      const a = r.int(1, 5), b = r.int(1, 5), k = r.int(2, 6);
      const nu = a + b, g = gcd(nu, k);
      const ans = g === k ? (nu / g === 1 ? 'x' : nu / g + 'x') : `\\dfrac{${nu / g === 1 ? '' : nu / g}x}{${k / g}}`;
      return { q: T(`Simplify $\\dfrac{${a}x}{${k}} + \\dfrac{${b}x}{${k}}$.`, `Ringkaskan $\\dfrac{${a}x}{${k}} + \\dfrac{${b}x}{${k}}$.`), a: T(`$${ans}$`), w: W(T('The denominators are the same, so add the numerators:', 'Penyebutnya sama, jadi tambah pengangkanya:'), `$\\dfrac{${a}x + ${b}x}{${k}} = \\dfrac{${nu}x}{${k}}$`, ...(g > 1 ? [T(`Divide the numerator and the denominator by ${g}:`, `Bahagi pengangka dan penyebut dengan ${g}:`), `$= ${ans}$`] : [])), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5), m = r.pick(['x', 'y']);
      return { q: T(`Simplify $\\dfrac{${a}${m}}{${b}} \\times \\dfrac{${b * 2}}{${m}}$.`, `Ringkaskan $\\dfrac{${a}${m}}{${b}} \\times \\dfrac{${b * 2}}{${m}}$.`), a: T(`$${2 * a}$`), w: W(T('Multiply the numerators and the denominators:', 'Darabkan pengangka dan penyebutnya:'), `$\\dfrac{${a}${m} \\times ${b * 2}}{${b} \\times ${m}} = \\dfrac{${2 * a * b}${m}}{${b}${m}}$`, T(`Cancel $${m}$, then divide ${2 * a * b} by ${b}:`, `Batalkan $${m}$, kemudian bahagi ${2 * a * b} dengan ${b}:`), `$= ${2 * a}$`), sp: 's' };
    },
  ];
  const g23m = [
    (r) => {
      const a = r.int(1, 4), b = r.int(1, 4);
      return { q: T(`Simplify $\\dfrac{x + ${a}}{3} + \\dfrac{x - ${b}}{6}$.`, `Ringkaskan $\\dfrac{x + ${a}}{3} + \\dfrac{x - ${b}}{6}$.`), a: T(`$\\dfrac{${lin(3, 2 * a - b)}}{6}$`), w: W(T('The LCM of $3$ and $6$ is $6$, so write both fractions over $6$:', 'GSTK bagi $3$ dan $6$ ialah $6$, jadi tulis kedua-dua pecahan dengan penyebut $6$:'), `$\\dfrac{2(x + ${a})}{6} + \\dfrac{x - ${b}}{6} = \\dfrac{2(x + ${a}) + (x - ${b})}{6}$`, `$= \\dfrac{2x + ${2 * a} + x - ${b}}{6} = \\dfrac{${lin(3, 2 * a - b)}}{6}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 7);
      return { q: T(`Simplify $\\dfrac{x^2 - ${a * a}}{x + ${a}} \\times \\dfrac{3}{x - ${a}}$.`, `Ringkaskan $\\dfrac{x^2 - ${a * a}}{x + ${a}} \\times \\dfrac{3}{x - ${a}}$.`), a: T(`$3$ (for $x \\neq \\pm ${a}$)`, `$3$ (bagi $x \\neq \\pm ${a}$)`), w: W(T(`Factorise $x^2 - ${a * a}$ as a difference of two squares:`, `Faktorkan $x^2 - ${a * a}$ sebagai beza dua kuasa dua:`), `$\\dfrac{(x + ${a})(x - ${a})}{x + ${a}} \\times \\dfrac{3}{x - ${a}}$`, T(`Cancel $x + ${a}$ and $x - ${a}$:`, `Batalkan $x + ${a}$ dan $x - ${a}$:`), `$= 3$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 6);
      need(a !== b);
      return { q: T(`Simplify $\\dfrac{${a}x}{${b}y} \\div \\dfrac{${a}}{y}$.`, `Ringkaskan $\\dfrac{${a}x}{${b}y} \\div \\dfrac{${a}}{y}$.`), a: T(`$\\dfrac{x}{${b}}$`), w: W(T('Dividing by a fraction is multiplying by its reciprocal:', 'Membahagi dengan satu pecahan bermakna mendarab dengan salingannya:'), `$\\dfrac{${a}x}{${b}y} \\times \\dfrac{y}{${a}} = \\dfrac{${a}xy}{${a * b}y}$`, T(`Cancel $${a}$ and $y$:`, `Batalkan $${a}$ dan $y$:`), `$= \\dfrac{x}{${b}}$`), sp: 'm' };
    },
  ];
  const g23a = [
    (r) => {
      const a = r.int(1, 4), b = a + r.int(1, 3), p = r.int(1, 3), q = r.int(1, 3);
      const nu = poly([[p + q, 'x'], [p * b + q * a, '']]);
      return { q: T(`Simplify $\\dfrac{${p}}{x + ${a}} + \\dfrac{${q}}{x + ${b}}$.`, `Ringkaskan $\\dfrac{${p}}{x + ${a}} + \\dfrac{${q}}{x + ${b}}$.`), a: T(`$\\dfrac{${nu}}{(x + ${a})(x + ${b})}$`), w: W(T(`The common denominator is $(x + ${a})(x + ${b})$:`, `Penyebut sepunya ialah $(x + ${a})(x + ${b})$:`), `$\\dfrac{${p === 1 ? '' : p}(x + ${b}) + ${q === 1 ? '' : q}(x + ${a})}{(x + ${a})(x + ${b})}$`, T('Expand the numerator and collect like terms:', 'Kembangkan pengangka dan kumpulkan sebutan serupa:'), `$= \\dfrac{${poly([[p, 'x'], [p * b, '']])} + ${poly([[q, 'x'], [q * a, '']])}}{(x + ${a})(x + ${b})} = \\dfrac{${nu}}{(x + ${a})(x + ${b})}$`), sp: 'l' };
    },
    (r) => {
      const a = r.int(2, 5);
      const k = r.int(1, 3);
      // k/(x-a) - k/(x+a) = 2ak / (x^2 - a^2)
      return { q: T(`Simplify $\\dfrac{${k}}{x - ${a}} - \\dfrac{${k}}{x + ${a}}$. Give your answer with a fully factorised denominator.`, `Ringkaskan $\\dfrac{${k}}{x - ${a}} - \\dfrac{${k}}{x + ${a}}$. Berikan jawapan anda dengan penyebut yang difaktorkan sepenuhnya.`), a: T(`$\\dfrac{${2 * a * k}}{(x - ${a})(x + ${a})}$`), w: W(T(`The common denominator is $(x - ${a})(x + ${a})$:`, `Penyebut sepunya ialah $(x - ${a})(x + ${a})$:`), `$\\dfrac{${k === 1 ? '' : k}(x + ${a}) - ${k === 1 ? '' : k}(x - ${a})}{(x - ${a})(x + ${a})}$`, `$= \\dfrac{${k === 1 ? '' : k}x + ${a * k} - ${k === 1 ? '' : k}x + ${a * k}}{(x - ${a})(x + ${a})} = \\dfrac{${2 * a * k}}{(x - ${a})(x + ${a})}$`, T('Mind the sign: the minus applies to both terms of the second numerator.', 'Beri perhatian pada tanda: tolak itu dikenakan pada kedua-dua sebutan pengangka kedua.')), sp: 'l' };
    },
    (r) => {
      const p = r.int(1, 5), q = r.int(1, 5);
      need(p !== q);
      return { q: T(`Simplify $\\dfrac{x^2 + ${p + q}x + ${p * q}}{x^2 - ${p * p}} \\div \\dfrac{x + ${q}}{x - ${p}}$.`, `Ringkaskan $\\dfrac{x^2 + ${p + q}x + ${p * q}}{x^2 - ${p * p}} \\div \\dfrac{x + ${q}}{x - ${p}}$.`), a: T('$1$ (for values of $x$ that keep every denominator non-zero)', '$1$ (bagi nilai $x$ yang menjadikan setiap penyebut tidak sifar)'), w: W(T('Factorise every part, and change the division into a multiplication by the reciprocal:', 'Faktorkan setiap bahagian, dan tukar pembahagian kepada pendaraban dengan salingan:'), `$\\dfrac{(x + ${p})(x + ${q})}{(x + ${p})(x - ${p})} \\times \\dfrac{x - ${p}}{x + ${q}}$`, T(`Cancel $x + ${p}$, $x + ${q}$ and $x - ${p}$:`, `Batalkan $x + ${p}$, $x + ${q}$ dan $x - ${p}$:`), `$= 1$`), sp: 'l' };
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
      return { q: T(`A taxi charges a fixed fare of RM${f} plus RM${p} for each kilometre. Write a formula for the total charge $C$ (in RM) for a journey of $d$ km.`, `Sebuah teksi mengenakan tambang tetap RM${f} ditambah RM${p} bagi setiap kilometer. Tulis satu rumus bagi jumlah caj $C$ (dalam RM) bagi perjalanan sejauh $d$ km.`), a: T(`$C = ${p}d + ${f}$`), w: W(T(`The charge for $d$ km is RM${p} for each kilometre, that is $${p}d$.`, `Caj bagi $d$ km ialah RM${p} bagi setiap kilometer, iaitu $${p}d$.`), T(`The fixed fare RM${f} is added once, whatever the distance.`, `Tambang tetap RM${f} ditambah sekali sahaja, tidak kira jarak.`), `$C = ${p}d + ${f}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(3, 9);
      return { q: T(`The perimeter $P$ of a rectangle has length $l$ and width $w$. Write a formula for $P$. Then find $P$ when $l = ${a + 3}$ and $w = ${a}$.`, `Perimeter $P$ sebuah segi empat tepat mempunyai panjang $l$ dan lebar $w$. Tulis satu rumus bagi $P$. Kemudian cari $P$ apabila $l = ${a + 3}$ dan $w = ${a}$.`), a: T(`$P = 2(l + w)$; $P = ${2 * (2 * a + 3)}$`), w: W(T('The perimeter is two lengths and two widths: $P = 2l + 2w = 2(l + w)$.', 'Perimeter ialah dua panjang dan dua lebar: $P = 2l + 2w = 2(l + w)$.'), `$P = 2(${a + 3} + ${a}) = 2(${2 * a + 3}) = ${2 * (2 * a + 3)}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(1, 9), x = r.int(2, 7);
      return { q: T(`Given $y = ${a}x + ${b}$, find $y$ when $x = ${x}$.`, `Diberi $y = ${a}x + ${b}$, cari $y$ apabila $x = ${x}$.`), a: T(`$y = ${a * x + b}$`), w: W(T(`Substitute $x = ${x}$ into the formula:`, `Gantikan $x = ${x}$ ke dalam rumus:`), `$y = ${a}(${x}) + ${b} = ${a * x} + ${b} = ${a * x + b}$`), sp: 'xs' };
    },
  ];
  const g31m = [
    (r) => {
      const a = r.int(3, 8), b = r.int(2, 6), c = r.int(2, 6);
      return { q: T(`A hall hire costs RM${a * 10} per hour for the first ${b} hours and RM${a * 6} per hour after that. Write a formula for the cost $C$ of hiring the hall for $h$ hours, where $h > ${b}$.`, `Sewa dewan berharga RM${a * 10} sejam bagi ${b} jam pertama dan RM${a * 6} sejam selepas itu. Tulis satu rumus bagi kos $C$ untuk menyewa dewan selama $h$ jam, dengan $h > ${b}$.`), a: T(`$C = ${a * 10 * b} + ${a * 6}(h - ${b})$`), w: W(T(`The first ${b} hours cost $${b} \\times ${a * 10} = ${a * 10 * b}$.`, `${b} jam pertama berkos $${b} \\times ${a * 10} = ${a * 10 * b}$.`), T(`After that there are $h - ${b}$ hours at RM${a * 6} each, that is $${a * 6}(h - ${b})$.`, `Selepas itu terdapat $h - ${b}$ jam pada kadar RM${a * 6} sejam, iaitu $${a * 6}(h - ${b})$.`), `$C = ${a * 10 * b} + ${a * 6}(h - ${b})$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 6);
      return { q: T(`The average $m$ of three numbers $p$, $q$ and $r$ is given by a formula. Write it, and find $m$ when $p = ${a}$, $q = ${a + 3}$ and $r = ${a + 7}$.`, `Purata $m$ bagi tiga nombor $p$, $q$ dan $r$ diberi oleh satu rumus. Tulis rumus itu, dan cari $m$ apabila $p = ${a}$, $q = ${a + 3}$ dan $r = ${a + 7}$.`), a: T(`$m = \\dfrac{p + q + r}{3}$; $m = ${n(round((3 * a + 10) / 3, 2))}$`), w: W(T('The average is the sum of the three numbers divided by 3:', 'Purata ialah hasil tambah ketiga-tiga nombor dibahagi dengan 3:'), `$m = \\dfrac{p + q + r}{3}$`, `$m = \\dfrac{${a} + ${a + 3} + ${a + 7}}{3} = \\dfrac{${3 * a + 10}}{3} = ${n(round((3 * a + 10) / 3, 2))}$`, T('(correct to 2 decimal places)', '(betul kepada 2 tempat perpuluhan)')), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.nz(-4, 4), x = r.nz(-5, 5);
      return { q: T(`Given $y = ${a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$, find $y$ when $x = ${x}$.`, `Diberi $y = ${a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$, cari $y$ apabila $x = ${x}$.`), a: T(`$y = ${a * x + b}$`), w: W(T(`Substitute $x = ${x}$, keeping the brackets:`, `Gantikan $x = ${x}$, dengan mengekalkan kurungan:`), `$y = ${a}(${x}) ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${a * x} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${a * x + b}$`), sp: 's' };
    },
  ];
  const g31a = [
    (r) => {
      const a = r.int(3, 6), f = r.int(5, 12), d = r.int(5, 15);
      return { q: T(`A mobile plan costs RM${f} a month plus RM0.${a} per minute of calls. Write a formula for the monthly bill $B$ (in RM) for $t$ minutes. Find $B$ when $t = ${d * 10}$ minutes.`, `Pelan telefon bimbit berharga RM${f} sebulan ditambah RM0.${a} seminit panggilan. Tulis satu rumus bagi bil bulanan $B$ (dalam RM) bagi $t$ minit. Cari $B$ apabila $t = ${d * 10}$ minit.`), a: T(`$B = ${f} + 0.${a}t$; $B = ${n(round(f + (a / 10) * d * 10, 2))}$`), w: W(T(`$t$ minutes of calls cost $0.${a}t$, and RM${f} is charged every month whatever $t$ is.`, `$t$ minit panggilan berkos $0.${a}t$, dan RM${f} dikenakan setiap bulan tidak kira nilai $t$.`), `$B = ${f} + 0.${a}t$`, `$B = ${f} + 0.${a}(${d * 10}) = ${f} + ${n(round((a / 10) * d * 10, 2))} = ${n(round(f + (a / 10) * d * 10, 2))}$`), sp: 'm' };
    },
  ];
  const g32e = [
    (r) => {
      const a = r.int(2, 9), s = r.chance();
      return s ? { q: T(`Make $x$ the subject of $y = x + ${a}$.`, `Jadikan $x$ sebagai perkara rumus bagi $y = x + ${a}$.`), a: T(`$x = y - ${a}$`), w: W(T(`Subtract ${a} from both sides:`, `Tolak ${a} daripada kedua-dua belah:`), `$y - ${a} = x$`, `$x = y - ${a}$`), sp: 'xs' } : { q: T(`Make $x$ the subject of $y = ${a}x$.`, `Jadikan $x$ sebagai perkara rumus bagi $y = ${a}x$.`), a: T(`$x = \\dfrac{y}{${a}}$`), w: W(T(`Divide both sides by ${a}:`, `Bahagi kedua-dua belah dengan ${a}:`), `$\\dfrac{y}{${a}} = x$`, `$x = \\dfrac{y}{${a}}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 6);
      return { q: T(`Make $t$ the subject of $v = ${a}t$.`, `Jadikan $t$ sebagai perkara rumus bagi $v = ${a}t$.`), a: T(`$t = \\dfrac{v}{${a}}$`), w: W(T(`$t$ is multiplied by ${a}, so divide both sides by ${a}:`, `$t$ didarab dengan ${a}, jadi bahagi kedua-dua belah dengan ${a}:`), `$\\dfrac{v}{${a}} = t$`, `$t = \\dfrac{v}{${a}}$`), sp: 'xs' };
    },
  ];
  const g32m = [
    (r) => {
      const a = r.int(2, 6), b = r.int(1, 9);
      return { q: T(`Make $x$ the subject of $y = ${a}x + ${b}$.`, `Jadikan $x$ sebagai perkara rumus bagi $y = ${a}x + ${b}$.`), a: T(`$x = \\dfrac{y - ${b}}{${a}}$`), w: W(T(`Subtract ${b} from both sides:`, `Tolak ${b} daripada kedua-dua belah:`), `$y - ${b} = ${a}x$`, T(`Then divide both sides by ${a}:`, `Kemudian bahagi kedua-dua belah dengan ${a}:`), `$x = \\dfrac{y - ${b}}{${a}}$`), sp: 's' };
    },
    (r) => ({ q: T('Make $h$ the subject of $A = \\dfrac{1}{2}(a + b)h$.', 'Jadikan $h$ sebagai perkara rumus bagi $A = \\dfrac{1}{2}(a + b)h$.'), a: T('$h = \\dfrac{2A}{a + b}$'), w: W(T('Multiply both sides by $2$ to clear the fraction:', 'Darabkan kedua-dua belah dengan $2$ untuk menghapuskan pecahan:'), '$2A = (a + b)h$', T('Then divide both sides by $a + b$:', 'Kemudian bahagi kedua-dua belah dengan $a + b$:'), '$h = \\dfrac{2A}{a + b}$'), sp: 's' }),
    (r) => {
      const a = r.int(2, 5);
      return { q: T(`Make $r$ the subject of $P = ${a}(l + r)$.`, `Jadikan $r$ sebagai perkara rumus bagi $P = ${a}(l + r)$.`), a: T(`$r = \\dfrac{P}{${a}} - l$`), w: W(T(`Divide both sides by ${a}:`, `Bahagi kedua-dua belah dengan ${a}:`), `$\\dfrac{P}{${a}} = l + r$`, T('Then subtract $l$ from both sides:', 'Kemudian tolak $l$ daripada kedua-dua belah:'), `$r = \\dfrac{P}{${a}} - l$`), sp: 's' };
    },
  ];
  const g32a = [
    (r) => ({ q: T('Make $t$ the subject of $v = u + at$, then find $t$ when $v = 30$, $u = 6$ and $a = 4$.', 'Jadikan $t$ sebagai perkara rumus bagi $v = u + at$, kemudian cari $t$ apabila $v = 30$, $u = 6$ dan $a = 4$.'), a: T('$t = \\dfrac{v - u}{a}$; $t = 6$'), w: W(T('Subtract $u$ from both sides, then divide by $a$:', 'Tolak $u$ daripada kedua-dua belah, kemudian bahagi dengan $a$:'), '$v - u = at$', '$t = \\dfrac{v - u}{a}$', '$t = \\dfrac{30 - 6}{4} = \\dfrac{24}{4} = 6$'), sp: 'm' }),
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 5);
      need(a !== b);
      return { q: T(`Make $x$ the subject of $y = ${a}x - ${b}(x - z)$.`, `Jadikan $x$ sebagai perkara rumus bagi $y = ${a}x - ${b}(x - z)$.`), a: T(`$x = \\dfrac{y - ${b}z}{${a - b}}$`), w: W(T('Expand the bracket, watching the sign of each term:', 'Kembangkan kurungan, dengan memerhatikan tanda setiap sebutan:'), `$y = ${a}x - ${b}x + ${b}z$`, T('Collect the $x$ terms and move $' + b + 'z$ to the other side:', 'Kumpulkan sebutan $x$ dan pindahkan $' + b + 'z$ ke sebelah yang lain:'), `$y - ${b}z = ${a - b}x$`, `$x = \\dfrac{y - ${b}z}{${a - b}}$`), sp: 'm' };
    },
    (r) => ({ q: T('Make $c$ the subject of $\\dfrac{a + c}{b} = d$, then evaluate $c$ when $a = 3$, $b = 4$ and $d = 5$.', 'Jadikan $c$ sebagai perkara rumus bagi $\\dfrac{a + c}{b} = d$, kemudian nilaikan $c$ apabila $a = 3$, $b = 4$ dan $d = 5$.'), a: T('$c = bd - a$; $c = 17$'), w: W(T('Multiply both sides by $b$:', 'Darabkan kedua-dua belah dengan $b$:'), '$a + c = bd$', T('Then subtract $a$ from both sides:', 'Kemudian tolak $a$ daripada kedua-dua belah:'), '$c = bd - a$', '$c = 4 \\times 5 - 3 = 20 - 3 = 17$'), sp: 'm' }),
  ];
  const g32Ee = [
    (r) => ({ q: T('Make $r$ the subject of $A = \\pi r^2$ where $r > 0$.', 'Jadikan $r$ sebagai perkara rumus bagi $A = \\pi r^2$ dengan $r > 0$.'), a: T('$r = \\sqrt{\\dfrac{A}{\\pi}}$'), w: W(T('Divide both sides by $\\pi$:', 'Bahagi kedua-dua belah dengan $\\pi$:'), '$\\dfrac{A}{\\pi} = r^2$', T('Take the square root of both sides:', 'Ambil punca kuasa dua bagi kedua-dua belah:'), '$r = \\sqrt{\\dfrac{A}{\\pi}}$', T('Only the positive root is taken because $r > 0$.', 'Hanya punca positif diambil kerana $r > 0$.')), sp: 's' }),
    (r) => {
      const k = r.int(2, 9);
      return { q: T(`Make $x$ the subject of $y = \\dfrac{${k}}{x}$. State any value that $x$ and $y$ cannot take.`, `Jadikan $x$ sebagai perkara rumus bagi $y = \\dfrac{${k}}{x}$. Nyatakan sebarang nilai yang tidak boleh diambil oleh $x$ dan $y$.`), a: T(`$x = \\dfrac{${k}}{y}$; $x \\neq 0$ and $y \\neq 0$`, `$x = \\dfrac{${k}}{y}$; $x \\neq 0$ dan $y \\neq 0$`), w: W(T('Multiply both sides by $x$:', 'Darabkan kedua-dua belah dengan $x$:'), `$xy = ${k}$`, T('Then divide both sides by $y$:', 'Kemudian bahagi kedua-dua belah dengan $y$:'), `$x = \\dfrac{${k}}{y}$`, T(`A denominator can never be $0$, so $x \\neq 0$ and $y \\neq 0$; indeed $${k} \\div x$ is never $0$ either.`, `Penyebut tidak boleh menjadi $0$, jadi $x \\neq 0$ dan $y \\neq 0$; malah $${k} \\div x$ juga tidak pernah $0$.`)), sp: 's' };
    },
  ];
  const g33e = [
    (r) => {
      const a = r.int(2, 7), x = r.int(2, 9), y = a * x + 3;
      return { q: T(`The formula $y = ${a}x + 3$ is used. Find $x$ when $y = ${y}$.`, `Rumus $y = ${a}x + 3$ digunakan. Cari $x$ apabila $y = ${y}$.`), a: T(`$x = ${x}$`), w: W(T(`Substitute $y = ${y}$:`, `Gantikan $y = ${y}$:`), `$${y} = ${a}x + 3$`, `$${a}x = ${y} - 3 = ${y - 3}$`, `$x = \\dfrac{${y - 3}}{${a}} = ${x}$`), sp: 's' };
    },
  ];
  const g33m = [
    (r) => {
      const a = r.int(2, 6);
      return { q: T(`In $C = ${a}n + 10$, what happens to $C$ when $n$ increases by 1? What is the value of $C$ when $n = 0$, and what does it represent if $C$ is a cost in RM?`, `Dalam $C = ${a}n + 10$, apakah yang berlaku kepada $C$ apabila $n$ bertambah 1? Apakah nilai $C$ apabila $n = 0$, dan apakah maksudnya jika $C$ ialah kos dalam RM?`), a: T(`$C$ increases by ${a}. When $n = 0$, $C = 10$: a fixed charge of RM10.`, `$C$ bertambah ${a}. Apabila $n = 0$, $C = 10$: caj tetap RM10.`), w: W(T(`Replacing $n$ by $n + 1$ gives $${a}(n + 1) + 10 = ${a}n + 10 + ${a}$, which is $${a}$ more.`, `Menggantikan $n$ dengan $n + 1$ memberi $${a}(n + 1) + 10 = ${a}n + 10 + ${a}$, iaitu $${a}$ lebih.`), `$n = 0:\\ C = ${a}(0) + 10 = 10$`, T('$10$ is the part of the cost that does not depend on $n$: a fixed charge of RM10.', '$10$ ialah bahagian kos yang tidak bergantung kepada $n$: caj tetap RM10.')), sp: 's' };
    },
    (r) => {
      const u = r.int(2, 8), a = r.int(2, 5), t = r.int(2, 6);
      const v = u + a * t;
      return { q: T(`The formula $v = u + at$ is used. Find $a$ when $v = ${v}$, $u = ${u}$ and $t = ${t}$.`, `Rumus $v = u + at$ digunakan. Cari $a$ apabila $v = ${v}$, $u = ${u}$ dan $t = ${t}$.`), a: T(`$a = ${a}$`), w: W(T('Make $a$ the subject: $a = \\dfrac{v - u}{t}$.', 'Jadikan $a$ perkara rumus: $a = \\dfrac{v - u}{t}$.'), `$a = \\dfrac{${v} - ${u}}{${t}} = \\dfrac{${v - u}}{${t}} = ${a}$`), sp: 's' };
    },
  ];
  const g33a = [
    (r) => {
      const l = r.int(4, 9), w = r.int(2, l - 1);
      return { q: T(`For $A = lw$, find how $A$ changes when (a) $l$ is doubled and $w$ stays the same, (b) both $l$ and $w$ are doubled. Use $l = ${l}$, $w = ${w}$ to check.`, `Bagi $A = lw$, cari bagaimana $A$ berubah apabila (a) $l$ digandakan dan $w$ kekal sama, (b) kedua-dua $l$ dan $w$ digandakan. Gunakan $l = ${l}$, $w = ${w}$ untuk menyemak.`), a: T(`Original: $A = ${l * w}$. (a) $A = ${2 * l * w}$: doubled. (b) $A = ${4 * l * w}$: four times.`, `Asal: $A = ${l * w}$. (a) $A = ${2 * l * w}$: digandakan. (b) $A = ${4 * l * w}$: empat kali ganda.`), w: W(`$A = ${l} \\times ${w} = ${l * w}$`, T(`(a) $A = (2l)w = 2lw$, so $A = ${2 * l} \\times ${w} = ${2 * l * w}$: twice the original.`, `(a) $A = (2l)w = 2lw$, jadi $A = ${2 * l} \\times ${w} = ${2 * l * w}$: dua kali ganda yang asal.`), T(`(b) $A = (2l)(2w) = 4lw$, so $A = ${2 * l} \\times ${2 * w} = ${4 * l * w}$: four times the original.`, `(b) $A = (2l)(2w) = 4lw$, jadi $A = ${2 * l} \\times ${2 * w} = ${4 * l * w}$: empat kali ganda yang asal.`), T('Each factor that is doubled multiplies the area by $2$.', 'Setiap faktor yang digandakan mendarabkan luas dengan $2$.')), sp: 'm' };
    },
  ];
  const g34e = [
    (r) => {
      const c = r.int(2, 6), f = r.int(10, 25), n1 = r.int(4, 12);
      return { q: T(`The cost of printing $n$ posters is $C = ${c}n + ${f}$ (in RM). Find the cost of printing ${n1} posters.`, `Kos mencetak $n$ keping poster ialah $C = ${c}n + ${f}$ (dalam RM). Cari kos mencetak ${n1} keping poster.`), a: T(`RM${c * n1 + f}`), w: W(T(`Substitute $n = ${n1}$:`, `Gantikan $n = ${n1}$:`), `$C = ${c}(${n1}) + ${f} = ${c * n1} + ${f} = ${c * n1 + f}$`, T(`The cost is RM${c * n1 + f}.`, `Kosnya ialah RM${c * n1 + f}.`)), sp: 's' };
    },
  ];
  const g34m = [
    (r) => {
      const c = r.int(2, 6), f = r.int(10, 25), n1 = r.int(4, 12);
      const tot = c * n1 + f;
      return { q: T(`The cost of printing $n$ posters is $C = ${c}n + ${f}$ (in RM). Make $n$ the subject and find how many posters can be printed for RM${tot}.`, `Kos mencetak $n$ keping poster ialah $C = ${c}n + ${f}$ (dalam RM). Jadikan $n$ perkara rumus dan cari bilangan poster yang boleh dicetak dengan RM${tot}.`), a: T(`$n = \\dfrac{C - ${f}}{${c}}$; $n = ${n1}$`), w: W(T(`Subtract ${f} from both sides, then divide by ${c}:`, `Tolak ${f} daripada kedua-dua belah, kemudian bahagi dengan ${c}:`), `$C - ${f} = ${c}n$`, `$n = \\dfrac{C - ${f}}{${c}}$`, `$n = \\dfrac{${tot} - ${f}}{${c}} = \\dfrac{${c * n1}}{${c}} = ${n1}$`), sp: 'm' };
    },
    (r) => {
      const F = r.int(2, 9) * 10;
      const C = round(((F - 32) * 5) / 9, 1);
      return { q: T(`The formula $F = \\dfrac{9}{5}C + 32$ converts a temperature from degrees Celsius to degrees Fahrenheit. (a) Make $C$ the subject. (b) Find $C$ when $F = ${F}$. Give the answer to 1 decimal place.`, `Rumus $F = \\dfrac{9}{5}C + 32$ menukar suhu daripada darjah Celsius kepada darjah Fahrenheit. (a) Jadikan $C$ perkara rumus. (b) Cari $C$ apabila $F = ${F}$. Berikan jawapan betul kepada 1 tempat perpuluhan.`), a: T(`(a) $C = \\dfrac{5}{9}(F - 32)$ (b) $${n(C)}$`), w: W(T('(a) Subtract $32$ from both sides, then multiply by $\\dfrac{5}{9}$:', '(a) Tolak $32$ daripada kedua-dua belah, kemudian darab dengan $\\dfrac{5}{9}$:'), '$F - 32 = \\dfrac{9}{5}C$', '$C = \\dfrac{5}{9}(F - 32)$', `$\\text{(b)}\\ C = \\dfrac{5}{9}(${F} - 32) = \\dfrac{5}{9}(${F - 32}) = ${n(C)}$`, T('(correct to 1 decimal place)', '(betul kepada 1 tempat perpuluhan)')), sp: 'm' };
    },
  ];
  const g34a = [
    (r) => {
      const l = r.int(6, 14), w = r.int(3, l - 2), h = r.int(3, 9);
      const V = l * w * h;
      return { q: T(`The volume of a cuboid is $V = lwh$. (a) Make $h$ the subject. (b) A cuboid has $V = ${V}\\ \\text{cm}^3$, $l = ${l}$ cm and $w = ${w}$ cm. Find $h$. (c) Find the total surface area $2(lw + lh + wh)$.`, `Isi padu sebuah kuboid ialah $V = lwh$. (a) Jadikan $h$ perkara rumus. (b) Sebuah kuboid mempunyai $V = ${V}\\ \\text{cm}^3$, $l = ${l}$ cm dan $w = ${w}$ cm. Cari $h$. (c) Cari jumlah luas permukaan $2(lw + lh + wh)$.`), a: T(`(a) $h = \\dfrac{V}{lw}$ (b) ${h} cm (c) $${2 * (l * w + l * h + w * h)}\\ \\text{cm}^2$`), w: W(T('(a) Divide both sides of $V = lwh$ by $lw$:', '(a) Bahagi kedua-dua belah $V = lwh$ dengan $lw$:'), '$h = \\dfrac{V}{lw}$', `$\\text{(b)}\\ h = \\dfrac{${V}}{${l} \\times ${w}} = \\dfrac{${V}}{${l * w}} = ${h}$`, T(`So $h = ${h}$ cm.`, `Jadi $h = ${h}$ cm.`), `$\\text{(c)}\\ 2(${l} \\times ${w} + ${l} \\times ${h} + ${w} \\times ${h}) = 2(${l * w} + ${l * h} + ${w * h})$`, `$= 2(${l * w + l * h + w * h}) = ${2 * (l * w + l * h + w * h)}$`, T(`The total surface area is $${2 * (l * w + l * h + w * h)}\\ \\text{cm}^2$.`, `Jumlah luas permukaan ialah $${2 * (l * w + l * h + w * h)}\\ \\text{cm}^2$.`)), sp: 'l' };
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
