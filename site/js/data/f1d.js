/* Form 1 – Chapters 11 to 13 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, gcd, round, need, retry, par, sum, poly } = SPM;
  const S = SPM.svg;
  const F = SPM.figs;
  const T = (e, m) => ({ en: e, ms: m === undefined ? e : m });
  const dual = (fn) => T(fn('en'), fn('ms'));
  const LN = ['en', 'ms'];
  const pick = (o, lang) => (o && typeof o === 'object' ? o[lang] : o);

  /* =============================================================== 11 */
  const roster = (list) => `\\{${list.join(',\\ ')}\\}`;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  /** a randomly described set of numbers: { tex:{en,ms} (set-builder), words:{en,ms}, list } */
  function numSet(r, opt) {
    opt = opt || {};
    const kind = r.pick(['mult', 'fact', 'prime', 'sq', 'int', 'even', 'odd']);
    if (kind === 'mult') {
      const k = r.pick([2, 3, 4, 5, 6, 7]), lo = r.int(0, 4), hi = lo + r.int(16, 30);
      const list = range(lo + 1, hi - 1).filter((v) => v % k === 0);
      return { list, words: T(`the multiples of ${k} between ${lo} and ${hi}`, `gandaan bagi ${k} antara ${lo} dengan ${hi}`), tex: T(`\\{x : x \\text{ is a multiple of } ${k},\\ ${lo} < x < ${hi}\\}`, `\\{x : x \\text{ ialah gandaan bagi } ${k},\\ ${lo} < x < ${hi}\\}`) };
    }
    if (kind === 'fact') {
      const m = r.pick([12, 18, 20, 24, 30, 36, 40]);
      const list = range(1, m).filter((v) => m % v === 0);
      return { list, words: T(`the factors of ${m}`, `faktor bagi ${m}`), tex: T(`\\{x : x \\text{ is a factor of } ${m}\\}`, `\\{x : x \\text{ ialah faktor bagi } ${m}\\}`) };
    }
    if (kind === 'prime') {
      const N = r.pick([12, 15, 20, 25, 30]);
      const list = range(2, N - 1).filter(SPM.isPrime);
      return { list, words: T(`the prime numbers less than ${N}`, `nombor perdana yang kurang daripada ${N}`), tex: T(`\\{x : x \\text{ is a prime number},\\ x < ${N}\\}`, `\\{x : x \\text{ ialah nombor perdana},\\ x < ${N}\\}`) };
    }
    if (kind === 'sq') {
      const N = r.pick([30, 50, 70, 100]);
      const list = range(1, 9).map((v) => v * v).filter((v) => v < N);
      return { list, words: T(`the perfect squares less than ${N}`, `kuasa dua sempurna yang kurang daripada ${N}`), tex: T(`\\{x : x \\text{ is a perfect square},\\ x < ${N}\\}`, `\\{x : x \\text{ ialah kuasa dua sempurna},\\ x < ${N}\\}`) };
    }
    if (kind === 'int') {
      const a = -r.int(1, 4), b = r.int(1, 4);
      const incl = r.chance();
      const list = range(a + 1, incl ? b : b - 1);
      return { list, words: T(`the integers greater than ${a} and ${incl ? 'at most' : 'less than'} ${b}`, `integer yang lebih besar daripada ${a} dan ${incl ? 'selebih-lebihnya' : 'kurang daripada'} ${b}`), tex: T(`\\{x : x \\text{ is an integer},\\ ${a} < x ${incl ? '\\le' : '<'} ${b}\\}`, `\\{x : x \\text{ ialah integer},\\ ${a} < x ${incl ? '\\le' : '<'} ${b}\\}`) };
    }
    const lo = r.int(0, 5), hi = lo + r.int(9, 16);
    const ev = kind === 'even';
    const list = range(lo + 1, hi - 1).filter((v) => (v % 2 === 0) === ev);
    return { list, words: T(`the ${ev ? 'even' : 'odd'} numbers between ${lo} and ${hi}`, `nombor ${ev ? 'genap' : 'ganjil'} antara ${lo} dengan ${hi}`), tex: T(`\\{x : x \\text{ is an ${ev ? 'even' : 'odd'} number},\\ ${lo} < x < ${hi}\\}`, `\\{x : x \\text{ ialah nombor ${ev ? 'genap' : 'ganjil'}},\\ ${lo} < x < ${hi}\\}`) };
  }
  const withMin = (r, min, max) => retry(() => { const s = numSet(r); need(s.list.length >= min && s.list.length <= max); return s; });

  /** universe {1..N} and a described subset of it */
  function subsetOf(r, N) {
    const kind = r.pick(['mult', 'fact', 'prime', 'even', 'odd', 'sq']);
    let list, words, tex;
    if (kind === 'mult') {
      const k = r.pick([2, 3, 4, 5]);
      list = range(1, N).filter((v) => v % k === 0);
      words = T(`multiples of ${k}`, `gandaan bagi ${k}`); tex = T(`\\{x : x \\text{ is a multiple of } ${k}\\}`, `\\{x : x \\text{ ialah gandaan bagi } ${k}\\}`);
    } else if (kind === 'fact') {
      const m = r.pick([6, 8, 9, 10, 12]);
      list = range(1, N).filter((v) => m % v === 0);
      words = T(`factors of ${m}`, `faktor bagi ${m}`); tex = T(`\\{x : x \\text{ is a factor of } ${m}\\}`, `\\{x : x \\text{ ialah faktor bagi } ${m}\\}`);
    } else if (kind === 'prime') {
      list = range(1, N).filter(SPM.isPrime);
      words = T('prime numbers', 'nombor perdana'); tex = T('\\{x : x \\text{ is a prime number}\\}', '\\{x : x \\text{ ialah nombor perdana}\\}');
    } else if (kind === 'sq') {
      list = range(1, N).filter((v) => Number.isInteger(Math.sqrt(v)));
      words = T('perfect squares', 'kuasa dua sempurna'); tex = T('\\{x : x \\text{ is a perfect square}\\}', '\\{x : x \\text{ ialah kuasa dua sempurna}\\}');
    } else {
      const ev = kind === 'even';
      list = range(1, N).filter((v) => (v % 2 === 0) === ev);
      words = T(ev ? 'even numbers' : 'odd numbers', ev ? 'nombor genap' : 'nombor ganjil'); tex = T(`\\{x : x \\text{ is an ${ev ? 'even' : 'odd'} number}\\}`, `\\{x : x \\text{ ialah nombor ${ev ? 'genap' : 'ganjil'}}\\}`);
    }
    need(list.length >= 2 && list.length <= N - 2);
    return { list, words, tex };
  }
  const universeTex = (N) => T(`\\xi = \\{x : x \\text{ is an integer},\\ 1 \\le x \\le ${N}\\}`, `\\xi = \\{x : x \\text{ ialah integer},\\ 1 \\le x \\le ${N}\\}`);

  const g111e = [
    (r) => {
      const s = withMin(r, 3, 8);
      const nm = r.pick(['A', 'B', 'P', 'Q']);
      return { q: T(`List the elements of the set $${nm} = ${s.tex.en}$.`, `Senaraikan unsur bagi set $${nm} = ${s.tex.ms}$.`), a: T(`$${nm} = ${roster(s.list)}$`), sp: 's' };
    },
    (r) => {
      const list = r.sample(range(1, 20), r.int(4, 6)).sort((a, b) => a - b);
      const inN = r.pick(list), outN = r.pick(range(1, 20).filter((v) => !list.includes(v)));
      const ask = r.chance();
      const x = ask ? inN : outN;
      return { q: T(`Given $A = ${roster(list)}$, state whether $${x} \\in A$ or $${x} \\notin A$.`, `Diberi $A = ${roster(list)}$, nyatakan sama ada $${x} \\in A$ atau $${x} \\notin A$.`), a: T(`$${x} ${ask ? '\\in' : '\\notin'} A$`), sp: 'xs' };
    },
    (r) => {
      const list = r.sample(range(1, 30), r.int(4, 8)).sort((a, b) => a - b);
      return { q: T(`Given $B = ${roster(list)}$, find $n(B)$.`, `Diberi $B = ${roster(list)}$, cari $n(B)$.`), a: T(`$n(B) = ${list.length}$`), sp: 'xs' };
    },
    (r) => {
      const list = ['a', 'e', 'i', 'o', 'u'];
      return { q: T(`Let $V = \\{x : x \\text{ is a vowel in the English alphabet}\\}$. List the elements of $V$ and state $n(V)$.`, `Katakan $V = \\{x : x \\text{ ialah huruf vokal dalam abjad Inggeris}\\}$. Senaraikan unsur bagi $V$ dan nyatakan $n(V)$.`), a: T(`$V = ${roster(list)}$, $n(V) = 5$`), sp: 's' };
    },
  ];
  const g111m = [
    (r) => {
      const s = withMin(r, 3, 9);
      return { q: T(`Write the set $A = ${s.tex.en}$ in roster form and find $n(A)$.`, `Tulis set $A = ${s.tex.ms}$ dalam bentuk senarai dan cari $n(A)$.`), a: T(`$A = ${roster(s.list)}$, $n(A) = ${s.list.length}$`), sp: 's' };
    },
    (r) => {
      const s = withMin(r, 3, 8);
      return { q: T(`Write the set $B = ${roster(s.list)}$ using set-builder notation, describing its elements in words.`, `Tulis set $B = ${roster(s.list)}$ menggunakan tatatanda pembina set, dengan menerangkan unsurnya dalam perkataan.`), a: T(`$B = ${s.tex.en}$ (${s.words.en})`, `$B = ${s.tex.ms}$ (${s.words.ms})`), sp: 's' };
    },
    (r) => {
      const a = r.int(1, 5), b = a + r.int(2, 4);
      return { q: T(`Set $A = \\{x : x \\text{ is an integer},\\ ${a} < x < ${a + 1}\\}$. State $n(A)$ and write down the special name of the set.`, `Set $A = \\{x : x \\text{ ialah integer},\\ ${a} < x < ${a + 1}\\}$. Nyatakan $n(A)$ dan tuliskan nama khas bagi set itu.`), a: T('$n(A) = 0$; the empty set, $\\varnothing$', '$n(A) = 0$; set kosong, $\\varnothing$'), sp: 's' };
    },
    (r) => {
      const k = r.pick([2, 3, 4, 5]);
      const lo = r.int(1, 3), hi = r.int(18, 30);
      const list = range(lo, hi).filter((v) => v % k === 0);
      const finite = r.chance();
      return { q: T(finite ? `Is the set $\\{x : x \\text{ is a multiple of } ${k},\\ ${lo} \\le x \\le ${hi}\\}$ finite or infinite? Find its number of elements.` : `Is the set $\\{x : x \\text{ is a multiple of } ${k}\\}$ finite or infinite?`, finite ? `Adakah set $\\{x : x \\text{ ialah gandaan bagi } ${k},\\ ${lo} \\le x \\le ${hi}\\}$ terhingga atau tak terhingga? Cari bilangan unsurnya.` : `Adakah set $\\{x : x \\text{ ialah gandaan bagi } ${k}\\}$ terhingga atau tak terhingga?`), a: finite ? T(`Finite; ${list.length} elements`, `Terhingga; ${list.length} unsur`) : T('Infinite: the multiples never end.', 'Tak terhingga: gandaan tidak pernah berakhir.'), sp: 's' };
    },
  ];
  const g111a = [
    (r) => {
      const m = r.pick([12, 18, 24, 30, 36]);
      const fact = range(1, m).filter((v) => m % v === 0);
      const A = fact.filter((v) => v % 2 === 0);
      const B = r.chance() ? A.slice() : A.slice(0, -1);
      const eq = A.length === B.length;
      return { q: T(`Set $A$ contains the factors of ${m} that are multiples of 2. Set $B = ${roster(B)}$. List the elements of $A$ and decide whether $A = B$. Give a reason.`, `Set $A$ mengandungi faktor bagi ${m} yang merupakan gandaan 2. Set $B = ${roster(B)}$. Senaraikan unsur bagi $A$ dan tentukan sama ada $A = B$. Berikan sebab.`), a: eq ? T(`$A = ${roster(A)}$; $A = B$ because they have exactly the same elements.`, `$A = ${roster(A)}$; $A = B$ kerana kedua-duanya mempunyai unsur yang betul-betul sama.`) : T(`$A = ${roster(A)}$; $A \\neq B$ because $${A[A.length - 1]} \\in A$ but $${A[A.length - 1]} \\notin B$.`, `$A = ${roster(A)}$; $A \\neq B$ kerana $${A[A.length - 1]} \\in A$ tetapi $${A[A.length - 1]} \\notin B$.`), sp: 'm' };
    },
    (r) => {
      const s1 = withMin(r, 3, 8);
      const s2 = retry(() => { const t = numSet(r); need(t.list.length === s1.list.length && t.tex.en !== s1.tex.en); return t; }, 800);
      const same = s1.list.join() === s2.list.join();
      return { q: T(`Set $P = ${s1.tex.en}$ and set $Q = ${s2.tex.en}$. List the elements of each set. Are $P$ and $Q$ equal sets? Explain.`, `Set $P = ${s1.tex.ms}$ dan set $Q = ${s2.tex.ms}$. Senaraikan unsur bagi setiap set. Adakah $P$ dan $Q$ set yang sama? Terangkan.`), a: T(`$P = ${roster(s1.list)}$, $Q = ${roster(s2.list)}$. ${same ? 'Equal: same elements.' : 'Not equal: the elements differ.'}`, `$P = ${roster(s1.list)}$, $Q = ${roster(s2.list)}$. ${same ? 'Sama: unsur sama.' : 'Tidak sama: unsur berbeza.'}`), sp: 'm' };
    },
  ];

  const g112e = [
    (r) => {
      const N = r.int(8, 12);
      const A = r.sample(range(1, N), r.int(3, 5)).sort((a, b) => a - b);
      const Ac = range(1, N).filter((v) => !A.includes(v));
      return { q: T(`$\\xi = ${roster(range(1, N))}$ and $A = ${roster(A)}$. List the elements of $A'$.`, `$\\xi = ${roster(range(1, N))}$ dan $A = ${roster(A)}$. Senaraikan unsur bagi $A'$.`), a: T(`$A' = ${roster(Ac)}$`), sp: 's' };
    },
    (r) => {
      const N = r.int(8, 15);
      const A = r.sample(range(1, N), r.int(3, 6)).sort((a, b) => a - b);
      return { q: T(`Given $\\xi = ${roster(range(1, N))}$ and $A = ${roster(A)}$, find $n(A')$.`, `Diberi $\\xi = ${roster(range(1, N))}$ dan $A = ${roster(A)}$, cari $n(A')$.`), a: T(`$n(A') = ${N - A.length}$`), sp: 's' };
    },
  ];
  const g112m = [
    (r) => {
      const N = r.pick([10, 12, 15, 16, 20]);
      const s = subsetOf(r, N);
      const Ac = range(1, N).filter((v) => !s.list.includes(v));
      return { q: T(`$${universeTex(N).en}$ and $A = ${s.tex.en}$. List the elements of $A'$.`, `$${universeTex(N).ms}$ dan $A = ${s.tex.ms}$. Senaraikan unsur bagi $A'$.`), a: T(`$A = ${roster(s.list)}$; $A' = ${roster(Ac)}$`), sp: 'm' };
    },
    (r) => {
      const N = r.int(9, 12);
      const A = r.sample(range(1, N), r.int(3, 5)).sort((a, b) => a - b);
      const Ac = range(1, N).filter((v) => !A.includes(v));
      const fig = S.venn1({ name: 'A', inA: A, out: Ac, shade: null });
      return { q: T('The Venn diagram shows a universal set $\\xi$ and a set $A$. List the elements of (a) $A$, (b) $A\'$, and state $n(A\')$.', 'Gambar rajah Venn menunjukkan set semesta $\\xi$ dan set $A$. Senaraikan unsur bagi (a) $A$, (b) $A\'$, dan nyatakan $n(A\')$.'), fig, a: T(`(a) $${roster(A)}$ (b) $${roster(Ac)}$; $n(A') = ${Ac.length}$`), sp: 's' };
    },
  ];
  const g112a = [
    (r) => {
      const N = r.int(10, 14);
      const Ac = r.sample(range(1, N), r.int(3, 6)).sort((a, b) => a - b);
      const A = range(1, N).filter((v) => !Ac.includes(v));
      return { q: T(`$\\xi = ${roster(range(1, N))}$ and $A' = ${roster(Ac)}$. Find the set $A$ and state $n(A)$.`, `$\\xi = ${roster(range(1, N))}$ dan $A' = ${roster(Ac)}$. Cari set $A$ dan nyatakan $n(A)$.`), a: T(`$A = ${roster(A)}$; $n(A) = ${A.length}$`), sp: 's' };
    },
    (r) => {
      const N = r.pick([12, 15, 18, 20]);
      const [k1, k2] = r.sample([2, 3, 4, 5, 6], 2);
      const A = range(1, N).filter((v) => v % k1 === 0), B = range(1, N).filter((v) => v % k2 === 0);
      need(A.length !== B.length && A.length > 0 && B.length > 0);
      const bigger = N - A.length > N - B.length ? 'A' : 'B';
      return { q: T(`$\\xi = ${roster(range(1, N))}$, $A$ is the set of multiples of ${k1} and $B$ is the set of multiples of ${k2} in $\\xi$. Find $n(A')$ and $n(B')$. Which complement has more elements?`, `$\\xi = ${roster(range(1, N))}$, $A$ ialah set gandaan bagi ${k1} dan $B$ ialah set gandaan bagi ${k2} dalam $\\xi$. Cari $n(A')$ dan $n(B')$. Pelengkap yang manakah mempunyai lebih banyak unsur?`), a: T(`$n(A') = ${N - A.length}$, $n(B') = ${N - B.length}$; $${bigger}'$ has more elements.`, `$n(A') = ${N - A.length}$, $n(B') = ${N - B.length}$; $${bigger}'$ mempunyai lebih banyak unsur.`), sp: 'm' };
    },
  ];

  const g113e = [
    (r) => {
      const B = r.sample(range(1, 12), r.int(5, 7)).sort((a, b) => a - b);
      const yes = r.chance();
      const A = yes ? r.sample(B, r.int(2, 3)).sort((a, b) => a - b) : r.sample(B, 2).concat([r.pick(range(1, 12).filter((v) => !B.includes(v)))]).sort((a, b) => a - b);
      return { q: T(`$A = ${roster(A)}$ and $B = ${roster(B)}$. Is $A \\subseteq B$? Give a reason.`, `$A = ${roster(A)}$ dan $B = ${roster(B)}$. Adakah $A \\subseteq B$? Berikan sebab.`), a: yes ? T('Yes: every element of $A$ is also in $B$.', 'Ya: setiap unsur $A$ juga terdapat dalam $B$.') : (() => { const bad = A.find((v) => !B.includes(v)); return T(`No: $${bad} \\in A$ but $${bad} \\notin B$.`, `Tidak: $${bad} \\in A$ tetapi $${bad} \\notin B$.`); })(), sp: 's' };
    },
  ];
  const g113m = [
    (r) => {
      const A = r.sample(range(1, 9), 3).sort((a, b) => a - b);
      const inA = A[0], out = r.pick(range(1, 9).filter((v) => !A.includes(v)));
      const stmts = [
        [`${inA} \\in A`, true], [`\\{${inA}\\} \\subseteq A`, true], [`\\{${inA}\\} \\in A`, false], [`${out} \\in A`, false], [`A \\subseteq A`, true], [`\\{${out}\\} \\subseteq A`, false],
      ];
      const four = r.sample(stmts, 4);
      return { q: T(`Given $A = ${roster(A)}$, state whether each statement is true or false: ${four.map((s, i) => `(${'abcd'[i]}) $${s[0]}$`).join('  ')}`, `Diberi $A = ${roster(A)}$, nyatakan sama ada setiap pernyataan adalah benar atau palsu: ${four.map((s, i) => `(${'abcd'[i]}) $${s[0]}$`).join('  ')}`), a: T(four.map((s, i) => `(${'abcd'[i]}) ${s[1] ? 'True' : 'False'}`).join('  '), four.map((s, i) => `(${'abcd'[i]}) ${s[1] ? 'Benar' : 'Palsu'}`).join('  ')), sp: 's' };
    },
    (r) => {
      const N = r.pick([12, 15, 20]);
      const s = subsetOf(r, N);
      const B = range(1, N);
      return { q: T(`$\\xi = ${roster(B)}$ and $A = ${s.tex.en}$ (within $\\xi$). Is $A \\subseteq \\xi$? Is $\\xi \\subseteq A$? Give reasons.`, `$\\xi = ${roster(B)}$ dan $A = ${s.tex.ms}$ (dalam $\\xi$). Adakah $A \\subseteq \\xi$? Adakah $\\xi \\subseteq A$? Berikan sebab.`), a: T(`$A \\subseteq \\xi$: yes (every element of $A$ is in $\\xi$). $\\xi \\subseteq A$: no (e.g. ${B.find((v) => !s.list.includes(v))} is in $\\xi$ but not in $A$).`, `$A \\subseteq \\xi$: ya (setiap unsur $A$ ada dalam $\\xi$). $\\xi \\subseteq A$: tidak (cth. ${B.find((v) => !s.list.includes(v))} ada dalam $\\xi$ tetapi tiada dalam $A$).`), sp: 'm' };
    },
  ];
  const g113a = [
    (r) => {
      const N = r.pick([12, 16, 18, 20, 24]);
      const A = range(1, N).filter((v) => v % 4 === 0), B = range(1, N).filter((v) => v % 2 === 0), C = range(1, N).filter((v) => v % 3 === 0);
      need(A.length >= 2 && C.length >= 2);
      return { q: T(`$\\xi = \\{x : x \\text{ is an integer},\\ 1 \\le x \\le ${N}\\}$, $A = \\{\\text{multiples of } 4\\}$, $B = \\{\\text{even numbers}\\}$ and $C = \\{\\text{multiples of } 3\\}$ (all within $\\xi$). Decide whether each is true: (a) $A \\subseteq B$ (b) $B \\subseteq A$ (c) $A \\subseteq C$. Give a reason for each.`, `$\\xi = \\{x : x \\text{ ialah integer},\\ 1 \\le x \\le ${N}\\}$, $A = \\{\\text{gandaan } 4\\}$, $B = \\{\\text{nombor genap}\\}$ dan $C = \\{\\text{gandaan } 3\\}$ (semuanya dalam $\\xi$). Tentukan sama ada setiap yang berikut benar: (a) $A \\subseteq B$ (b) $B \\subseteq A$ (c) $A \\subseteq C$. Berikan sebab bagi setiap satu.`), a: T(`(a) True: every multiple of 4 is even. (b) False: 2 is even but not a multiple of 4. (c) False: 4 is a multiple of 4 but not of 3.`, `(a) Benar: setiap gandaan 4 ialah nombor genap. (b) Palsu: 2 ialah nombor genap tetapi bukan gandaan 4. (c) Palsu: 4 ialah gandaan 4 tetapi bukan gandaan 3.`), sp: 'm' };
    },
    (r) => {
      const N = r.pick([12, 15, 20]);
      const outerList = range(1, N).filter((v) => v % 2 === 0);
      const innerList = outerList.filter((v) => v % 4 === 0);
      const mid = outerList.filter((v) => v % 4 !== 0);
      const out = range(1, N).filter((v) => v % 2 === 1);
      const fig = S.vennNested({ names: ['A', 'B'], inner: innerList, mid, out });
      return { q: T('In the Venn diagram, $A \\subseteq B \\subseteq \\xi$. List the elements of $A$, $B$ and $B\'$, and state which of the following are true: (a) $A \\subseteq B$ (b) $B \\subseteq A$ (c) $A\' \\subseteq B\'$.', 'Dalam gambar rajah Venn, $A \\subseteq B \\subseteq \\xi$. Senaraikan unsur bagi $A$, $B$ dan $B\'$, dan nyatakan pernyataan yang benar: (a) $A \\subseteq B$ (b) $B \\subseteq A$ (c) $A\' \\subseteq B\'$.'), fig, a: T(`$A = ${roster(innerList)}$, $B = ${roster(outerList)}$, $B' = ${roster(out)}$. (a) True (b) False (c) False: $A'$ contains the elements of $B$ not in $A$, which are not in $B'$.`, `$A = ${roster(innerList)}$, $B = ${roster(outerList)}$, $B' = ${roster(out)}$. (a) Benar (b) Palsu (c) Palsu: $A'$ mengandungi unsur $B$ yang bukan dalam $A$, dan unsur ini tiada dalam $B'$.`), sp: 'm' };
    },
  ];

  const g114e = [
    (r) => {
      const N = r.int(8, 12);
      const s = subsetOf(r, N);
      const shadeOut = r.chance();
      const fig = S.venn1({ name: 'A', inA: s.list, out: range(1, N).filter((v) => !s.list.includes(v)), shade: shadeOut ? 'out' : 'A' });
      return { q: T('The shaded region of the Venn diagram represents which set: $A$ or $A\'$? List its elements.', 'Kawasan berlorek pada gambar rajah Venn mewakili set yang manakah: $A$ atau $A\'$? Senaraikan unsurnya.'), fig, a: T(`$${shadeOut ? "A'" : 'A'} = ${roster(shadeOut ? range(1, N).filter((v) => !s.list.includes(v)) : s.list)}$`), sp: 's' };
    },
    (r) => {
      const N = r.int(8, 12);
      const A = r.sample(range(1, N), r.int(3, 5)).sort((a, b) => a - b);
      const Ac = range(1, N).filter((v) => !A.includes(v));
      const fig = S.venn1({ name: 'A', inA: [], out: [], shade: null });
      return { q: T(`$\\xi = ${roster(range(1, N))}$ and $A = ${roster(A)}$. Draw a Venn diagram to show $\\xi$ and $A$, writing every element in the correct region.`, `$\\xi = ${roster(range(1, N))}$ dan $A = ${roster(A)}$. Lukis gambar rajah Venn untuk menunjukkan $\\xi$ dan $A$, dengan menulis setiap unsur pada kawasan yang betul.`), a: T(S.venn1({ name: 'A', inA: A, out: Ac }) , S.venn1({ name: 'A', inA: A, out: Ac })), sp: 'l' };
    },
  ];
  const g114m = [
    (r) => {
      const N = r.pick([12, 16, 20]);
      const inner = range(1, N).filter((v) => v % 4 === 0), outerAll = range(1, N).filter((v) => v % 2 === 0);
      const mid = outerAll.filter((v) => v % 4 !== 0), out = range(1, N).filter((v) => v % 2 === 1);
      const fig = S.vennNested({ names: ['A', 'B'], inner, mid, out });
      return { q: T('Study the Venn diagram. (a) List the elements of $B$. (b) List the elements of $A$. (c) State $n(B\')$.', 'Perhatikan gambar rajah Venn. (a) Senaraikan unsur bagi $B$. (b) Senaraikan unsur bagi $A$. (c) Nyatakan $n(B\')$.'), fig, a: T(`(a) $${roster(outerAll)}$ (b) $${roster(inner)}$ (c) $${out.length}$`), sp: 's' };
    },
    (r) => {
      const N = r.pick([12, 16, 20]);
      const inner = range(1, N).filter((v) => v % 4 === 0), outerAll = range(1, N).filter((v) => v % 2 === 0);
      const mid = outerAll.filter((v) => v % 4 !== 0), out = range(1, N).filter((v) => v % 2 === 1);
      const fig = S.vennNested({ names: ['A', 'B'], inner, mid, out });
      return { q: T(`$\\xi = ${roster(range(1, N))}$, $B = ${roster(outerAll)}$ and $A = ${roster(inner)}$. Draw a Venn diagram to show $A \\subseteq B \\subseteq \\xi$.`, `$\\xi = ${roster(range(1, N))}$, $B = ${roster(outerAll)}$ dan $A = ${roster(inner)}$. Lukis gambar rajah Venn untuk menunjukkan $A \\subseteq B \\subseteq \\xi$.`), a: T(fig, fig), sp: 'l' };
    },
  ];
  const g114a = [
    (r) => {
      const N = r.pick([12, 16, 18, 20, 24]);
      const kA = r.pick([[4, 2], [6, 3], [6, 2], [9, 3]]);
      const A = range(1, N).filter((v) => v % kA[0] === 0), B = range(1, N).filter((v) => v % kA[1] === 0);
      need(A.length >= 2 && B.length > A.length);
      const mid = B.filter((v) => !A.includes(v)), out = range(1, N).filter((v) => !B.includes(v));
      const fig = S.vennNested({ names: ['A', 'B'], inner: A, mid, out });
      return { q: T(`$\\xi = \\{x : x \\text{ is an integer},\\ 1 \\le x \\le ${N}\\}$, $A = \\{\\text{multiples of } ${kA[0]}\\}$ and $B = \\{\\text{multiples of } ${kA[1]}\\}$. (a) Show that $A \\subseteq B$. (b) Draw a Venn diagram to represent $\\xi$, $A$ and $B$. (c) Find $n(B')$.`, `$\\xi = \\{x : x \\text{ ialah integer},\\ 1 \\le x \\le ${N}\\}$, $A = \\{\\text{gandaan } ${kA[0]}\\}$ dan $B = \\{\\text{gandaan } ${kA[1]}\\}$. (a) Tunjukkan bahawa $A \\subseteq B$. (b) Lukis gambar rajah Venn untuk mewakili $\\xi$, $A$ dan $B$. (c) Cari $n(B')$.`), a: T(`(a) $A = ${roster(A)}$, $B = ${roster(B)}$; every element of $A$ is in $B$. (b) ${fig} (c) $n(B') = ${out.length}$`, `(a) $A = ${roster(A)}$, $B = ${roster(B)}$; setiap unsur $A$ ada dalam $B$. (b) ${fig} (c) $n(B') = ${out.length}$`), sp: 'xl' };
    },
  ];
  SPM.addChapter(1, 11, T('Introduction to Set', 'Pengenalan Set'), [
    { id: '11.1', en: 'Sets', ms: 'Set', gen: { e: g111e, m: g111m, a: g111a } },
    { id: '11.2', en: 'Universal set and complement', ms: 'Set semesta dan pelengkap bagi suatu set', gen: { e: g112e, m: g112m, a: g112a } },
    { id: '11.3', en: 'Subsets', ms: 'Subset', gen: { e: g113e, m: g113m, a: g113a } },
    { id: '11.4', en: 'Venn representations', ms: 'Gambar rajah Venn', gen: { e: g114e, m: g114m, a: g114a } },
  ]);

  /* =============================================================== 12 */
  const CONTEXTS = [
    { name: T('Favourite sport', 'Sukan kegemaran'), cats: [T('Football', 'Bola sepak'), T('Badminton', 'Badminton'), T('Netball', 'Bola jaring'), T('Swimming', 'Renang'), T('Sepak takraw', 'Sepak takraw')] },
    { name: T('Transport to school', 'Cara ke sekolah'), cats: [T('Bus', 'Bas'), T('Car', 'Kereta'), T('Bicycle', 'Basikal'), T('Walking', 'Berjalan kaki'), T('Motorcycle', 'Motosikal')] },
    { name: T('Favourite fruit', 'Buah kegemaran'), cats: [T('Mango', 'Mangga'), T('Durian', 'Durian'), T('Banana', 'Pisang'), T('Rambutan', 'Rambutan'), T('Papaya', 'Betik')] },
    { name: T('Favourite subject', 'Mata pelajaran kegemaran'), cats: [T('Mathematics', 'Matematik'), T('Science', 'Sains'), T('English', 'Bahasa Inggeris'), T('Malay', 'Bahasa Melayu'), T('History', 'Sejarah')] },
    { name: T('Favourite drink', 'Minuman kegemaran'), cats: [T('Teh tarik', 'Teh tarik'), T('Milo', 'Milo'), T('Orange juice', 'Jus oren'), T('Sirap bandung', 'Sirap bandung'), T('Water', 'Air kosong')] },
  ];
  /** random categorical data: k categories, total from a set that gives whole-degree pie angles */
  function catData(r, k, total) {
    const ctx = r.pick(CONTEXTS);
    const cats = r.sample(ctx.cats, k);
    total = total || r.pick([24, 30, 36, 40, 60]);
    return retry(() => {
      const cuts = r.sample(range(1, total - 1), k - 1).sort((a, b) => a - b);
      const f = [];
      let prev = 0;
      for (const c of cuts.concat([total])) { f.push(c - prev); prev = c; }
      need(f.every((v) => v >= 2));
      return { ctx, cats, f, total };
    });
  }
  const catsOf = (d, lang) => d.cats.map((c) => c[lang]);
  const freqTable = (d, lang, blank, extraRow) => {
    const rows = [[lang === 'en' ? 'Frequency' : 'Kekerapan', ...d.f.map((v, i) => (blank && blank.includes(i) ? '' : v))]];
    return SPM.table(rows, { head: [d.ctx.name[lang], ...catsOf(d, lang)] });
  };
  const yMax = (mx) => { const s = mx <= 12 ? 2 : mx <= 25 ? 5 : mx <= 60 ? 10 : 20; return { ystep: s, ymax: Math.ceil(mx / s) * s }; };

  const g121e = [
    (r) => {
      const bank = [
        [T('How many students are in Form 1 Amanah?', 'Berapakah bilangan murid dalam Tingkatan 1 Amanah?'), false],
        [T('How many hours per week do Form 1 students spend on homework?', 'Berapa jam seminggu murid Tingkatan 1 menghabiskan masa untuk kerja rumah?'), true],
        [T('What is the capital city of Malaysia?', 'Apakah ibu negara Malaysia?'), false],
        [T('How far do students in our school live from the school?', 'Berapa jauhkah murid di sekolah kita tinggal dari sekolah?'), true],
        [T('What is the mass of a bag of rice labelled 5 kg?', 'Berapakah jisim sebungkus beras berlabel 5 kg?'), false],
        [T('Which drinks do students in Form 2 buy at the canteen?', 'Minuman apakah yang dibeli oleh murid Tingkatan 2 di kantin?'), true],
      ];
      const pair = [r.pick(bank.filter((b) => b[1])), r.pick(bank.filter((b) => !b[1]))];
      const order = r.shuffle(pair);
      return { q: T(`Which of these is a statistical question? (A) ${order[0][0].en} (B) ${order[1][0].en}`, `Antara yang berikut, yang manakah soalan statistik? (A) ${order[0][0].ms} (B) ${order[1][0].ms}`), a: (() => { const i = order.findIndex((o) => o[1]); return T(`(${'AB'[i]}) — it expects varying answers that can be answered with data.`, `(${'AB'[i]}) — ia menjangkakan jawapan yang berbeza-beza yang boleh dijawab dengan data.`); })(), sp: 's' };
    },
    (r) => {
      const bank = [
        [T('the number of siblings a student has', 'bilangan adik-beradik seorang murid'), T('numerical, discrete', 'berangka, diskret')],
        [T('the height of a student', 'ketinggian seorang murid'), T('numerical, continuous', 'berangka, selanjar')],
        [T('the favourite colour of a student', 'warna kegemaran seorang murid'), T('categorical', 'kategori')],
        [T('the time taken to run 100 m', 'masa yang diambil untuk berlari 100 m'), T('numerical, continuous', 'berangka, selanjar')],
        [T('the number of goals scored in a match', 'bilangan gol yang dijaringkan dalam satu perlawanan'), T('numerical, discrete', 'berangka, diskret')],
        [T('the type of transport used to go to school', 'jenis pengangkutan untuk ke sekolah'), T('categorical', 'kategori')],
      ];
      const it = r.pick(bank);
      return { q: T(`Classify the variable "${it[0].en}" as categorical or numerical. If it is numerical, state whether it is discrete or continuous.`, `Kelaskan pemboleh ubah "${it[0].ms}" sebagai kategori atau berangka. Jika berangka, nyatakan sama ada ia diskret atau selanjar.`), a: it[1], sp: 's' };
    },
    (r) => {
      const st = [T('Formulate a statistical question', 'Merumus soalan statistik'), T('Collect data', 'Mengumpul data'), T('Organise and represent the data', 'Menyusun dan mewakilkan data'), T('Analyse and interpret', 'Menganalisis dan mentafsir'), T('Infer and predict', 'Membuat inferens dan ramalan'), T('Communicate the findings', 'Berkomunikasi dapatan')];
      const ord = r.shuffle(range(0, 5));
      const L = 'ABCDEF';
      return { q: T(`The stages of a statistical inquiry are listed in the wrong order: ${ord.map((o, i) => `(${L[i]}) ${st[o].en}`).join('; ')}. Write the letters in the correct order.`, `Peringkat sesuatu inkuiri statistik disenaraikan dengan susunan yang salah: ${ord.map((o, i) => `(${L[i]}) ${st[o].ms}`).join('; ')}. Tulis huruf-huruf itu mengikut susunan yang betul.`), a: T(range(0, 5).map((k) => L[ord.indexOf(k)]).join(' → ')), sp: 's' };
    },
  ];
  const g121m = [
    (r) => {
      const bank = [
        [T("Don't you agree that the canteen food is terrible?", 'Tidakkah anda bersetuju bahawa makanan di kantin sangat teruk?'), T('How satisfied are you with the canteen food? (Very satisfied / Satisfied / Dissatisfied / Very dissatisfied)', 'Sejauh manakah anda berpuas hati dengan makanan di kantin? (Sangat berpuas hati / Berpuas hati / Tidak berpuas hati / Sangat tidak berpuas hati)')],
        [T('Wouldn\'t you say that homework is far too much?', 'Bukankah anda bersetuju bahawa kerja rumah terlalu banyak?'), T('How many hours do you spend on homework each day?', 'Berapa jam anda menghabiskan masa untuk kerja rumah setiap hari?')],
        [T('Everyone loves football. Which team do you support?', 'Semua orang suka bola sepak. Pasukan manakah yang anda sokong?'), T('Which sport do you enjoy most? (Football / Badminton / Netball / Other)', 'Sukan manakah yang paling anda gemari? (Bola sepak / Badminton / Bola jaring / Lain-lain)')],
      ];
      const it = r.pick(bank);
      return { q: T(`Explain why the survey question "${it[0].en}" is not a good statistical question, and rewrite it in a neutral form.`, `Terangkan mengapa soalan tinjauan "${it[0].ms}" bukan soalan statistik yang baik, dan tulis semula dalam bentuk neutral.`), a: T(`It is a leading question: it pushes respondents towards one answer. Neutral version: ${it[1].en}`, `Ia soalan yang mengarahkan: ia mendorong responden kepada satu jawapan. Versi neutral: ${it[1].ms}`), sp: 'm' };
    },
    (r) => {
      const bank = [
        [T('What is the most common way Form 1 students in our school travel to school?', 'Apakah cara yang paling biasa murid Tingkatan 1 di sekolah kita ke sekolah?'), T('all Form 1 students in the school', 'semua murid Tingkatan 1 di sekolah'), T('mode of transport (categorical)', 'cara pengangkutan (kategori)'), T('a survey (questionnaire)', 'tinjauan (soal selidik)')],
        [T('How long do students in Form 2 sleep on a school night?', 'Berapa lamakah murid Tingkatan 2 tidur pada malam persekolahan?'), T('Form 2 students', 'murid Tingkatan 2'), T('hours of sleep (numerical, continuous)', 'jam tidur (berangka, selanjar)'), T('a survey (questionnaire)', 'tinjauan (soal selidik)')],
        [T('How many goals are scored per match in the school football league?', 'Berapakah bilangan gol yang dijaringkan bagi setiap perlawanan dalam liga bola sepak sekolah?'), T('all matches in the league', 'semua perlawanan dalam liga'), T('goals per match (numerical, discrete)', 'gol setiap perlawanan (berangka, diskret)'), T('observation and counting', 'pemerhatian dan pengiraan')],
      ];
      const it = r.pick(bank);
      return { q: T(`For the statistical question "${it[0].en}", state (a) the population or group, (b) the variable and its type, (c) a suitable method of data collection.`, `Bagi soalan statistik "${it[0].ms}", nyatakan (a) populasi atau kumpulan, (b) pemboleh ubah dan jenisnya, (c) kaedah pengumpulan data yang sesuai.`), a: T(`(a) ${it[1].en} (b) ${it[2].en} (c) ${it[3].en}`, `(a) ${it[1].ms} (b) ${it[2].ms} (c) ${it[3].ms}`), sp: 'm' };
    },
  ];
  const g121a = [
    (r) => {
      const topics = [
        [T('how Form 1 students travel to school', 'cara murid Tingkatan 1 ke sekolah'), T('Mode of transport', 'cara pengangkutan'), T('bar chart or pie chart', 'carta palang atau carta pai')],
        [T('how much pocket money Form 3 students receive each week', 'jumlah wang saku yang diterima murid Tingkatan 3 setiap minggu'), T('Pocket money in RM', 'wang saku dalam RM'), T('histogram or stem-and-leaf plot', 'histogram atau plot batang dan daun')],
        [T('how many hours students in our school spend on screens each day', 'berapa jam murid di sekolah kita menghabiskan masa pada skrin setiap hari'), T('Hours per day', 'jam sehari'), T('dot plot or histogram', 'plot titik atau histogram')],
      ];
      const t = r.pick(topics);
      return { q: T(`Plan a statistical inquiry about ${t[0].en}. State (a) a statistical question, (b) the population and how you would choose a sample, (c) the variable and its type, (d) how you would collect the data, (e) a suitable representation and why, (f) one possible source of bias and how to reduce it.`, `Rancang satu inkuiri statistik tentang ${t[0].ms}. Nyatakan (a) soalan statistik, (b) populasi dan cara anda memilih sampel, (c) pemboleh ubah dan jenisnya, (d) cara anda mengumpul data, (e) perwakilan yang sesuai dan sebabnya, (f) satu punca bias yang mungkin dan cara mengurangkannya.`), a: T(`Sample answer: (a) a question that expects varying answers about ${t[0].en}; (b) all students of the group, using a random sample from every class list; (c) ${t[1].en}; (d) a short neutral questionnaire; (e) ${t[2].en}, because it shows the distribution clearly; (f) sampling only friends — reduce by random selection.`, `Contoh jawapan: (a) soalan yang menjangkakan jawapan berbeza tentang ${t[0].ms}; (b) semua murid dalam kumpulan itu, menggunakan sampel rawak daripada setiap senarai kelas; (c) ${t[1].ms}; (d) soal selidik ringkas yang neutral; (e) ${t[2].ms}, kerana ia menunjukkan taburan dengan jelas; (f) hanya memilih kawan — dikurangkan dengan pemilihan rawak.`), sp: 'xxl' };
    },
  ];

  /* ---- 12.2 representations */
  const dotPlot = (vals, lo, hi, lang) => {
    const W = 320, H = 130, pl = 24, pr = 14, base = H - 30;
    const sx = (v) => pl + ((v - lo) / (hi - lo)) * (W - pl - pr);
    let out = S.line(pl - 8, base, W - pr + 6, base);
    const cnt = {};
    vals.forEach((v) => (cnt[v] = (cnt[v] || 0) + 1));
    for (let v = lo; v <= hi; v++) {
      out += S.line(sx(v), base, sx(v), base + 4, { w: 1 }) + S.text(sx(v), base + 14, String(v), { s: 11 });
      for (let i = 0; i < (cnt[v] || 0); i++) out += S.circle(sx(v), base - 8 - i * 11, 4, { fill: 'currentColor' });
    }
    return S.wrap(W, H, out, 'dot plot');
  };
  const stemLeaf = (vals, lang) => {
    const sorted = vals.slice().sort((a, b) => a - b);
    const stems = {};
    sorted.forEach((v) => { const s = Math.floor(v / 10); (stems[s] = stems[s] || []).push(v % 10); });
    const rows = Object.keys(stems).map(Number).sort((a, b) => a - b).map((s) => `<tr><td style="text-align:right">${s}</td><td style="border-left:1.5px solid currentColor;text-align:left;letter-spacing:.35em">${stems[s].join('')}</td></tr>`);
    const key = sorted[Math.floor(sorted.length / 2)];
    return { html: `<table class="qt plain"><thead><tr><th>${lang === 'en' ? 'Stem' : 'Batang'}</th><th style="text-align:left">${lang === 'en' ? 'Leaf' : 'Daun'}</th></tr></thead><tbody>${rows.join('')}</tbody></table><div style="text-align:center;font-size:.9em">${lang === 'en' ? 'Key' : 'Kunci'}: ${Math.floor(key / 10)} | ${key % 10} ${lang === 'en' ? 'means' : 'bermaksud'} ${key}</div>`, sorted };
  };
  const g122e = [
    (r) => {
      const k = r.int(4, 5);
      const vals = Array.from({ length: 20 }, () => r.int(1, k));
      const cnt = range(1, k).map((v) => vals.filter((x) => x === v).length);
      need(cnt.every((c) => c >= 1));
      const tab = (lang) => SPM.table([[lang === 'en' ? 'Tally' : 'Tally', ...range(1, k).map(() => '')], [lang === 'en' ? 'Frequency' : 'Kekerapan', ...range(1, k).map(() => '')]], { head: [lang === 'en' ? 'Number of books' : 'Bilangan buku', ...range(1, k)] });
      return { q: T(`The number of books read by 20 students last month were: ${vals.join(', ')}. Complete the frequency table.<br>${tab('en')}`, `Bilangan buku yang dibaca oleh 20 orang murid bulan lepas ialah: ${vals.join(', ')}. Lengkapkan jadual kekerapan.<br>${tab('ms')}`), a: T(`Frequencies: ${range(1, k).map((v, i) => `${v} → ${cnt[i]}`).join('; ')} (total 20)`, `Kekerapan: ${range(1, k).map((v, i) => `${v} → ${cnt[i]}`).join('; ')} (jumlah 20)`), sp: 's' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([20, 30, 40]));
      const mx = Math.max(...d.f), { ystep, ymax } = yMax(mx);
      const fig = dual((lang) => S.bar({ cats: catsOf(d, lang), vals: d.f, ymax, ystep, ylabel: lang === 'en' ? 'Frequency' : 'Kekerapan', xlabel: d.ctx.name[lang], w: 330, h: 200 }));
      const maxI = d.f.indexOf(mx), minI = d.f.indexOf(Math.min(...d.f));
      return { q: T('The bar chart shows the results of a survey. (a) Which category is the most popular? (b) How many were surveyed altogether? (c) How many more chose the most popular than the least popular?', 'Carta palang menunjukkan keputusan satu tinjauan. (a) Kategori manakah yang paling popular? (b) Berapakah jumlah yang ditinjau? (c) Berapa lebih ramai yang memilih kategori paling popular berbanding yang paling kurang popular?'), fig, a: T(`(a) ${d.cats[maxI].en} (b) ${d.total} (c) ${mx - d.f[minI]}`, `(a) ${d.cats[maxI].ms} (b) ${d.total} (c) ${mx - d.f[minI]}`), sp: 's' };
    },
    (r) => {
      const vals = Array.from({ length: r.int(12, 16) }, () => r.int(1, 6));
      const fig = dotPlot(vals, 1, 6);
      const cnt = range(1, 6).map((v) => vals.filter((x) => x === v).length);
      const mx = Math.max(...cnt);
      return { q: T('The dot plot shows the number of pets owned by some students. How many students are there altogether? Which number of pets is the most common?', 'Plot titik menunjukkan bilangan haiwan peliharaan yang dimiliki oleh beberapa orang murid. Berapakah jumlah murid? Bilangan haiwan peliharaan yang manakah paling biasa?'), fig, a: T(`${vals.length} students; most common: ${cnt.indexOf(mx) + 1} pet(s)`, `${vals.length} orang murid; paling biasa: ${cnt.indexOf(mx) + 1} ekor`), sp: 's' };
    },
    (r) => {
      const vals = Array.from({ length: r.int(11, 15) }, () => r.int(21, 58));
      const sl = { en: stemLeaf(vals, 'en'), ms: stemLeaf(vals, 'ms') };
      const mx = Math.max(...vals), mn = Math.min(...vals);
      return { q: T(`The stem-and-leaf plot shows the marks of some students in a quiz.<br>${sl.en.html}<br>Find (a) the highest mark, (b) the lowest mark, (c) the number of students.`, `Plot batang dan daun menunjukkan markah beberapa orang murid dalam satu kuiz.<br>${sl.ms.html}<br>Cari (a) markah tertinggi, (b) markah terendah, (c) bilangan murid.`), a: T(`(a) ${mx} (b) ${mn} (c) ${vals.length}`), sp: 's' };
    },
  ];
  const g122m = [
    (r) => {
      const d = catData(r, 4, r.pick([24, 30, 36, 40, 60]));
      const ang = d.f.map((v) => (v * 360) / d.total);
      const tab = dual((lang) => freqTable(d, lang));
      return { q: T(`The table shows the results of a survey of ${d.total} students. Calculate the angle of each sector needed to draw a pie chart.<br>${tab.en}`, `Jadual menunjukkan keputusan tinjauan terhadap ${d.total} orang murid. Hitung sudut bagi setiap sektor yang diperlukan untuk melukis carta pai.<br>${tab.ms}`), a: T(d.cats.map((c, i) => `${c.en}: ${n(ang[i])}°`).join('; '), d.cats.map((c, i) => `${c.ms}: ${n(ang[i])}°`).join('; ')), w: T(`$\\dfrac{f}{${d.total}} \\times 360^\\circ$`), sp: 'm' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([24, 30, 36, 40, 60]));
      const fig = dual((lang) => S.pie({ slices: d.f.map((v, i) => ({ v, label: d.cats[i][lang] })), showValues: true, r: 66 }));
      return { q: T('The pie chart shows the frequency of each category in a survey. Complete a frequency table and find the total frequency, and the angle of the largest sector.', 'Carta pai menunjukkan kekerapan bagi setiap kategori dalam satu tinjauan. Lengkapkan jadual kekerapan dan cari jumlah kekerapan, dan sudut bagi sektor yang terbesar.'), fig, a: T(`${d.cats.map((c, i) => `${c.en}: ${d.f[i]}`).join('; ')}; total ${d.total}; largest sector ${n(round((Math.max(...d.f) * 360) / d.total, 1))}°`, `${d.cats.map((c, i) => `${c.ms}: ${d.f[i]}`).join('; ')}; jumlah ${d.total}; sektor terbesar ${n(round((Math.max(...d.f) * 360) / d.total, 1))}°`), sp: 'm' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([20, 30, 40]));
      const mx = Math.max(...d.f), { ystep, ymax } = yMax(mx);
      const fig = dual((lang) => S.bar({ cats: catsOf(d, lang), vals: d.f, ymax, ystep, ylabel: lang === 'en' ? 'Frequency' : 'Kekerapan', xlabel: d.ctx.name[lang], w: 330, h: 200 }));
      return { q: T('Draw up a frequency table for the data shown in the bar chart, and state the total frequency.', 'Bina jadual kekerapan bagi data yang ditunjukkan dalam carta palang, dan nyatakan jumlah kekerapan.'), fig, a: T(`${d.cats.map((c, i) => `${c.en}: ${d.f[i]}`).join('; ')}; total ${d.total}`, `${d.cats.map((c, i) => `${c.ms}: ${d.f[i]}`).join('; ')}; jumlah ${d.total}`), sp: 'm' };
    },
    (r) => {
      const vals = Array.from({ length: r.int(12, 16) }, () => r.int(21, 58));
      const sl = stemLeaf(vals, 'en');
      const sm = stemLeaf(vals, 'ms');
      return { q: T(`Construct an ordered stem-and-leaf plot for these marks, with a key: ${vals.join(', ')}.`, `Bina plot batang dan daun tertib bagi markah ini, dengan kunci: ${vals.join(', ')}.`), a: T(sl.html, sm.html), sp: 'l' };
    },
  ];
  const g122a = [
    (r) => {
      const d = catData(r, 4, r.pick([24, 30, 36, 40, 60]));
      const ang = d.f.map((v) => (v * 360) / d.total);
      const hide = r.int(0, 3);
      const known = d.f.map((v, i) => (i === hide ? null : v));
      const others = ang.map((a, i) => (i === hide ? '?' : `${n(a)}°`));
      return { q: T(`A survey of ${d.total} students on "${d.ctx.name.en}" is shown in a pie chart. The sector angles are: ${d.cats.map((c, i) => `${c.en} ${others[i]}`).join(', ')}. Find the number of students for each category and check that the total is ${d.total}.`, `Satu tinjauan terhadap ${d.total} orang murid tentang "${d.ctx.name.ms}" ditunjukkan dalam carta pai. Sudut sektor ialah: ${d.cats.map((c, i) => `${c.ms} ${others[i]}`).join(', ')}. Cari bilangan murid bagi setiap kategori dan semak bahawa jumlahnya ialah ${d.total}.`), a: T(`${d.cats.map((c, i) => `${c.en}: ${d.f[i]}`).join('; ')} (unknown sector $= 360 - $ the others $= ${n(ang[hide])}^\\circ$)`, `${d.cats.map((c, i) => `${c.ms}: ${d.f[i]}`).join('; ')} (sektor tidak diketahui $= 360 - $ yang lain $= ${n(ang[hide])}^\\circ$)`), sp: 'm' };
    },
    (r) => {
      const k = 4;
      const vals = Array.from({ length: 20 }, () => r.int(1, k));
      const cnt = range(1, k).map((v) => vals.filter((x) => x === v).length);
      need(cnt.every((c) => c >= 2));
      const ang = cnt.map((c) => c * 18);
      return { q: T(`The number of siblings of 20 students: ${vals.join(', ')}. (a) Construct a frequency table. (b) Calculate the pie chart angle for each value. (c) State which representation would show the shape of the distribution better, a pie chart or a dot plot, and why.`, `Bilangan adik-beradik bagi 20 orang murid: ${vals.join(', ')}. (a) Bina jadual kekerapan. (b) Hitung sudut carta pai bagi setiap nilai. (c) Nyatakan perwakilan yang menunjukkan bentuk taburan dengan lebih baik, carta pai atau plot titik, dan sebabnya.`), a: T(`(a) ${range(1, k).map((v, i) => `${v}: ${cnt[i]}`).join('; ')} (b) ${ang.map((a) => a + '°').join(', ')} (c) A dot plot: it keeps each value and shows the shape; a pie chart shows only parts of the whole.`, `(a) ${range(1, k).map((v, i) => `${v}: ${cnt[i]}`).join('; ')} (b) ${ang.map((a) => a + '°').join(', ')} (c) Plot titik: ia mengekalkan setiap nilai dan menunjukkan bentuk taburan; carta pai hanya menunjukkan bahagian daripada keseluruhan.`), sp: 'xl' };
    },
  ];

  /* ---- 12.3 conversion and choice */
  const HIST_VALS = [[T('Number of siblings', 'Bilangan adik-beradik')], [T('Number of pets', 'Bilangan haiwan peliharaan')], [T('Goals scored', 'Bilangan gol')]];
  const hist = (vals, freq, lang, ylab, xlab) => {
    const yMaxV = Math.ceil(Math.max(...freq) / 2) * 2 + 2;
    return S.graph({ w: 320, h: 210, xr: [vals[0] - 0.5, vals[vals.length - 1] + 0.5, 1], yr: [0, yMaxV, 2], xlabels: null, xlabel: xlab, ylabel: ylab, series: [{ pts: vals.map((v, i) => [v, freq[i]]), type: 'bars', width: 1 }], extra: (m) => vals.map((v) => S.text(m.sx(v), m.sy(0) + 11, String(v), { s: 10 })).join('') });
  };
  const polygon = (vals, freq, ylab, xlab) => {
    const pts = [[vals[0] - 1, 0], ...vals.map((v, i) => [v, freq[i]]), [vals[vals.length - 1] + 1, 0]];
    const yMaxV = Math.ceil(Math.max(...freq) / 2) * 2 + 2;
    return S.graph({ w: 320, h: 210, xr: [vals[0] - 1, vals[vals.length - 1] + 1, 1], yr: [0, yMaxV, 2], xlabel: xlab, ylabel: ylab, series: [{ pts, type: 'line', dotsToo: true }] });
  };
  const PURPOSES = [
    [T('compare the number of students who chose each of five sports', 'membandingkan bilangan murid yang memilih setiap satu daripada lima sukan'), T('bar chart', 'carta palang'), T('the bars are separate categories that are easy to compare in height', 'palang ialah kategori berasingan yang mudah dibandingkan tingginya')],
    [T('show what fraction of the class travels by each mode of transport', 'menunjukkan pecahan kelas yang menaiki setiap jenis pengangkutan'), T('pie chart', 'carta pai'), T('it shows parts of a whole', 'ia menunjukkan bahagian daripada satu keseluruhan')],
    [T('show how the monthly rainfall changed over a year', 'menunjukkan perubahan hujan bulanan sepanjang setahun'), T('line graph', 'graf garis'), T('it shows change over an ordered variable such as time', 'ia menunjukkan perubahan bagi pemboleh ubah tersusun seperti masa')],
    [T('show the shape of the distribution of the number of siblings of 30 students', 'menunjukkan bentuk taburan bilangan adik-beradik bagi 30 orang murid'), T('histogram (or frequency polygon)', 'histogram (atau poligon kekerapan)'), T('it shows how a numerical variable is distributed', 'ia menunjukkan taburan bagi pemboleh ubah berangka')],
    [T('keep every individual test mark of 15 students visible while showing the spread', 'mengekalkan setiap markah ujian individu bagi 15 orang murid sambil menunjukkan serakannya'), T('dot plot or stem-and-leaf plot', 'plot titik atau plot batang dan daun'), T('every original value can still be read', 'setiap nilai asal masih boleh dibaca')],
  ];
  const g123e = [
    (r) => {
      const p = r.pick(PURPOSES);
      return { q: T(`Which representation is most suitable to ${p[0].en}: bar chart, pie chart, line graph, histogram or dot plot?`, `Perwakilan manakah yang paling sesuai untuk ${p[0].ms}: carta palang, carta pai, graf garis, histogram atau plot titik?`), a: T(`${p[1].en}: ${p[2].en}.`, `${p[1].ms}: ${p[2].ms}.`), sp: 's' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([30, 40, 60]));
      const ang = d.f.map((v) => (v * 360) / d.total);
      const fig = dual((lang) => S.pie({ slices: d.f.map((v, i) => ({ v, label: d.cats[i][lang] })), showAngles: true, r: 64 }));
      const i = r.int(0, 3);
      return { q: T(`The pie chart shows the choices of ${d.total} students on "${d.ctx.name.en}". How many students chose ${d.cats[i].en}?`, `Carta pai menunjukkan pilihan ${d.total} orang murid tentang "${d.ctx.name.ms}". Berapakah bilangan murid yang memilih ${d.cats[i].ms}?`), fig, a: T(`${d.f[i]} students`, `${d.f[i]} orang murid`), w: T(`$\\dfrac{${n(ang[i])}}{360} \\times ${d.total}$`), sp: 's' };
    },
  ];
  const g123m = [
    (r) => {
      const k = r.int(5, 6), vals = range(0, k - 1);
      const freq = vals.map(() => r.int(2, 9));
      const fig = dual((lang) => hist(vals, freq, lang, lang === 'en' ? 'Frequency' : 'Kekerapan', lang === 'en' ? 'Number of siblings' : 'Bilangan adik-beradik'));
      return { q: T('The histogram shows the number of siblings of a group of students. Complete the frequency table from the histogram and find the total number of students.', 'Histogram menunjukkan bilangan adik-beradik bagi sekumpulan murid. Lengkapkan jadual kekerapan daripada histogram dan cari jumlah bilangan murid.'), fig, a: T(`${vals.map((v, i) => `${v}: ${freq[i]}`).join('; ')}; total ${sum(freq)}`, `${vals.map((v, i) => `${v}: ${freq[i]}`).join('; ')}; jumlah ${sum(freq)}`), sp: 'm' };
    },
    (r) => {
      const k = r.int(5, 6), vals = range(0, k - 1);
      const freq = vals.map(() => r.int(2, 9));
      const rows = (lang) => SPM.table([[lang === 'en' ? 'Frequency' : 'Kekerapan', ...freq]], { head: [lang === 'en' ? 'Number of pets' : 'Bilangan haiwan', ...vals] });
      return { q: T(`The table shows the number of pets owned by some students.<br>${rows('en')}<br>Write down the coordinates of the points needed to draw a frequency polygon (include the points on the horizontal axis at each end).`, `Jadual menunjukkan bilangan haiwan peliharaan yang dimiliki oleh beberapa orang murid.<br>${rows('ms')}<br>Tuliskan koordinat titik yang diperlukan untuk melukis poligon kekerapan (termasuk titik pada paksi mengufuk di setiap hujung).`), a: T(`$${[[vals[0] - 1, 0], ...vals.map((v, i) => [v, freq[i]]), [vals[k - 1] + 1, 0]].map((p) => `(${p[0]}, ${p[1]})`).join(', ')}$`), sp: 'm' };
    },
  ];
  const g123a = [
    (r) => {
    const k = 6, vals = range(1, k);
    const freq = vals.map(() => r.int(2, 10));
    const figs = T(
      [hist(vals, freq, 'en', 'Frequency', 'Goals'), polygon(vals, freq, 'Frequency', 'Goals')],
      [hist(vals, freq, 'ms', 'Kekerapan', 'Gol'), polygon(vals, freq, 'Kekerapan', 'Gol')]
    );
    return { q: T('Both graphs show the same distribution of goals scored per match. (a) Write the frequency table and the total. (b) State one difference in how a histogram and a frequency polygon are drawn. (c) Which graph would you choose to compare this distribution with another team\'s, and why?', 'Kedua-dua graf menunjukkan taburan yang sama bagi gol yang dijaringkan setiap perlawanan. (a) Tulis jadual kekerapan dan jumlahnya. (b) Nyatakan satu perbezaan cara histogram dan poligon kekerapan dilukis. (c) Graf manakah yang akan anda pilih untuk membandingkan taburan ini dengan pasukan lain, dan mengapa?'), fig: figs, a: T(`(a) ${vals.map((v, i) => `${v}: ${freq[i]}`).join('; ')}; total ${sum(freq)} (b) A histogram uses touching bars; a frequency polygon joins points plotted at each value, with zero-frequency points at both ends. (c) The frequency polygon: two polygons can be drawn on the same axes and compared easily.`, `(a) ${vals.map((v, i) => `${v}: ${freq[i]}`).join('; ')}; jumlah ${sum(freq)} (b) Histogram menggunakan palang yang bersentuhan; poligon kekerapan menyambungkan titik pada setiap nilai, dengan titik kekerapan sifar di kedua-dua hujung. (c) Poligon kekerapan: dua poligon boleh dilukis pada paksi yang sama dan dibandingkan dengan mudah.`), sp: 'l' };
    },
  ];

  /* ---- 12.4 interpretation */
  const MONTHS = { en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ms: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'] };
  const SERIES = [
    { name: T('visitors (hundreds) to a museum', 'pengunjung (ratus) ke sebuah muzium'), unit: '' },
    { name: T('rainfall (mm) at a weather station', 'hujan (mm) di sebuah stesen kaji cuaca'), unit: 'mm' },
    { name: T('books borrowed (tens) from the school library', 'buku yang dipinjam (puluh) dari perpustakaan sekolah'), unit: '' },
  ];
  function lineData(r, months) {
    const base = r.int(4, 10) * 2;
    const vals = [];
    let v = base;
    for (let i = 0; i < months; i++) { v = Math.max(2, v + r.int(-4, 6) * 1); vals.push(v); }
    return vals;
  }
  const lineFig = (vals, lang, ylab, ymax) => S.graph({ w: 340, h: 215, xr: [0, vals.length - 1, 1], yr: [0, ymax, ymax > 40 ? 10 : 5], xlabels: (x) => MONTHS[lang][x], ylabel: ylab, series: [{ pts: vals.map((v, i) => [i, v]), type: 'line', dotsToo: true }] });
  const g124e = [
    (r) => {
      const months = r.int(6, 8);
      const vals = retry(() => { const v = lineData(r, months); need(new Set(v).size === months && Math.max(...v) <= 40); return v; });
      const s = r.pick(SERIES);
      const ymax = Math.ceil(Math.max(...vals) / 5) * 5 + 5;
      const fig = dual((lang) => lineFig(vals, lang, lang === 'en' ? s.name.en : s.name.ms, ymax));
      const mi = vals.indexOf(Math.max(...vals)), lo = vals.indexOf(Math.min(...vals));
      return { q: T(`The line graph shows the ${s.name.en} for the first ${months} months of the year. State (a) the month with the highest value and the value, (b) the month with the lowest value, (c) the total for the ${months} months.`, `Graf garis menunjukkan ${s.name.ms} bagi ${months} bulan pertama tahun itu. Nyatakan (a) bulan dengan nilai tertinggi dan nilainya, (b) bulan dengan nilai terendah, (c) jumlah bagi ${months} bulan.`), fig, a: T(`(a) ${MONTHS.en[mi]}: ${vals[mi]} (b) ${MONTHS.en[lo]} (c) ${sum(vals)}`, `(a) ${MONTHS.ms[mi]}: ${vals[mi]} (b) ${MONTHS.ms[lo]} (c) ${sum(vals)}`), sp: 's' };
    },
  ];
  const g124m = [
    (r) => {
      const months = 8;
      const vals = retry(() => { const v = lineData(r, months); need(Math.max(...v) <= 40 && new Set(v).size >= 6); return v; });
      const s = r.pick(SERIES);
      const ymax = Math.ceil(Math.max(...vals) / 5) * 5 + 5;
      const fig = dual((lang) => lineFig(vals, lang, lang === 'en' ? s.name.en : s.name.ms, ymax));
      const i = r.int(1, 5), j = i + 2;
      return { q: T(`The graph shows the ${s.name.en}. (a) Find the increase or decrease from ${MONTHS.en[i]} to ${MONTHS.en[j]}. (b) Between which two consecutive months was the change greatest?`, `Graf menunjukkan ${s.name.ms}. (a) Cari pertambahan atau pengurangan dari ${MONTHS.ms[i]} hingga ${MONTHS.ms[j]}. (b) Antara dua bulan berturutan yang manakah perubahan paling besar?`), fig, a: (() => { let bi = 0, bd = 0; for (let k = 0; k < months - 1; k++) { const d = Math.abs(vals[k + 1] - vals[k]); if (d > bd) { bd = d; bi = k; } } const ch = vals[j] - vals[i]; return T(`(a) ${ch >= 0 ? 'Increase' : 'Decrease'} of ${Math.abs(ch)} (b) ${MONTHS.en[bi]} to ${MONTHS.en[bi + 1]} (change ${bd})`, `(a) ${ch >= 0 ? 'Pertambahan' : 'Pengurangan'} sebanyak ${Math.abs(ch)} (b) ${MONTHS.ms[bi]} hingga ${MONTHS.ms[bi + 1]} (perubahan ${bd})`); })(), sp: 's' };
    },
  ];
  const g124a = [
    (r) => {
      const months = 6;
      const start = r.int(6, 12), stepv = r.int(2, 4);
      const vals = range(0, months - 1).map((i) => start + stepv * i + r.pick([-1, 0, 1]));
      const ymax = Math.ceil((Math.max(...vals) + 8) / 5) * 5 + 5;
      const fig = dual((lang) => lineFig(vals, lang, lang === 'en' ? 'Visitors (hundreds)' : 'Pengunjung (ratus)', ymax));
      const last = vals[months - 1];
      const stmts = [
        [T(`Visitors increased in most months from ${MONTHS.en[0]} to ${MONTHS.en[months - 1]}.`, `Pengunjung meningkat pada kebanyakan bulan dari ${MONTHS.ms[0]} hingga ${MONTHS.ms[months - 1]}.`), true],
        [T('The new advertisement caused the number of visitors to rise.', 'Iklan baharu menyebabkan bilangan pengunjung meningkat.'), false],
        [T(`The number of visitors in the next month will definitely be ${last + 2 * stepv} hundred.`, `Bilangan pengunjung pada bulan berikutnya pasti ${last + 2 * stepv} ratus.`), false],
      ];
      return { q: T(`The graph shows museum visitors (in hundreds). For each statement, say whether it is supported by the graph. Give a reason. (A) ${stmts[0][0].en} (B) ${stmts[1][0].en} (C) ${stmts[2][0].en}`, `Graf menunjukkan pengunjung muzium (dalam ratus). Bagi setiap pernyataan, nyatakan sama ada ia disokong oleh graf. Berikan sebab. (A) ${stmts[0][0].ms} (B) ${stmts[1][0].ms} (C) ${stmts[2][0].ms}`), fig, a: T(`(A) Supported: the graph rises from ${vals[0]} to ${last}. (B) Not supported: the graph shows a trend, not the cause. (C) Not supported: a prediction from a short trend can only be approximate, e.g. about ${last + stepv} hundred.`, `(A) Disokong: graf meningkat daripada ${vals[0]} kepada ${last}. (B) Tidak disokong: graf menunjukkan aliran, bukan puncanya. (C) Tidak disokong: ramalan daripada aliran yang pendek hanya boleh dianggarkan, misalnya kira-kira ${last + stepv} ratus.`), sp: 'l' };
    },
  ];

  /* ---- 12.5 ethical representation */
  const g125e = [
    (r) => {
      const d = catData(r, 4, r.pick([20, 30, 40]));
      const mx = Math.max(...d.f), { ystep, ymax } = yMax(mx);
      const fig = S.bar({ cats: d.cats.map((c) => c.en), vals: d.f, ymax, ystep, w: 320, h: 190 });
      const fig2 = S.bar({ cats: d.cats.map((c) => c.ms), vals: d.f, ymax, ystep, w: 320, h: 190 });
      return { q: T('State two items that are missing from this bar chart, which make it difficult to interpret.', 'Nyatakan dua perkara yang tiada dalam carta palang ini yang menyukarkan tafsirannya.'), fig: T(fig, fig2), a: T('A title, and labels for the axes (with units): the vertical axis does not say what it measures and the horizontal axis does not name the variable.', 'Tajuk, dan label bagi paksi (dengan unit): paksi mencancang tidak menyatakan apa yang diukur dan paksi mengufuk tidak menamakan pemboleh ubah.'), sp: 's' };
    },
    (r) => {
      const bank = [
        [T('Aina wants to find the favourite sport of all students in the school, but only asks members of the football team.', 'Aina ingin mengetahui sukan kegemaran semua murid di sekolah, tetapi hanya bertanya kepada ahli pasukan bola sepak.'), T('The sample is not representative (it is biased towards football).', 'Sampel tidak mewakili (ia berat sebelah kepada bola sepak).'), T('Choose students at random from every class.', 'Pilih murid secara rawak daripada setiap kelas.')],
        [T('A survey on library use asks only students who are found in the library.', 'Satu tinjauan tentang penggunaan perpustakaan hanya bertanya kepada murid yang berada di perpustakaan.'), T('Everyone surveyed already uses the library, so the results are biased.', 'Semua yang ditinjau sudah menggunakan perpustakaan, jadi keputusannya berat sebelah.'), T('Survey a random sample from all students.', 'Tinjau sampel rawak daripada semua murid.')],
        [T('To find how much homework Form 1 students do, a teacher asks only the five students who score the highest marks.', 'Untuk mengetahui jumlah kerja rumah yang dilakukan murid Tingkatan 1, seorang guru bertanya kepada lima murid yang mendapat markah tertinggi sahaja.'), T('The sample is unrepresentative of all Form 1 students.', 'Sampel tidak mewakili semua murid Tingkatan 1.'), T('Sample students of all achievement levels.', 'Sampel murid daripada semua tahap pencapaian.')],
      ];
      const it = r.pick(bank);
      return { q: T(`${it[0].en} What is wrong with this data collection, and how can it be improved?`, `${it[0].ms} Apakah kesalahan dalam pengumpulan data ini, dan bagaimana ia boleh diperbaiki?`), a: T(`${it[1].en} ${it[2].en}`, `${it[1].ms} ${it[2].ms}`), sp: 's' };
    },
  ];
  const g125m = [
    (r) => {
      const va = r.int(72, 84), vb = va + r.int(2, 5);
      const lo = 70;
      const f = (lang, ymin, ymax, step) => S.bar({ cats: [lang === 'en' ? 'Shop A' : 'Kedai A', lang === 'en' ? 'Shop B' : 'Kedai B'], vals: [va, vb], ymin, ymax, ystep: step, showValues: true, w: 210, h: 190, ylabel: lang === 'en' ? 'Sales (RM thousand)' : 'Jualan (RM ribu)' });
      const fig = T([f('en', 0, 100, 20), f('en', lo, 90, 5)], [f('ms', 0, 100, 20), f('ms', lo, 90, 5)]);
      return { q: T('The two graphs show the same monthly sales of two shops. Which graph gives a misleading impression of the difference? Explain how, and what should be done to correct it.', 'Kedua-dua graf menunjukkan jualan bulanan yang sama bagi dua buah kedai. Graf manakah yang memberi gambaran mengelirukan tentang perbezaan itu? Terangkan bagaimana, dan apakah yang patut dilakukan untuk membetulkannya.'), fig, a: T(`The right-hand graph: its vertical axis starts at ${lo}, not 0, so Shop B's bar looks several times taller although the sales are ${va} and ${vb} thousand. Start the axis at 0 (or clearly mark a broken axis).`, `Graf sebelah kanan: paksi mencancangnya bermula pada ${lo}, bukan 0, jadi palang Kedai B kelihatan beberapa kali lebih tinggi walaupun jualan ialah ${va} ribu dan ${vb} ribu. Mulakan paksi pada 0 (atau tandakan paksi terputus dengan jelas).`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 5) * 10, k = r.pick([2, 3]);
      const h1 = 1, h2 = k;
      return { q: T(`A newspaper shows sales of RM${a} thousand and RM${a * k} thousand using two square pictures whose sides are in the ratio 1 : ${k}. Explain why this display is misleading.`, `Sebuah akhbar menunjukkan jualan RM${a} ribu dan RM${a * k} ribu menggunakan dua gambar segi empat sama yang sisinya berada dalam nisbah 1 : ${k}. Terangkan mengapa paparan ini mengelirukan.`), a: T(`If the sides are in the ratio 1 : ${k}, the areas are in the ratio 1 : ${k * k}, so the second sale looks ${k * k} times as large although it is only ${k} times as large. Use bars of equal width whose heights are proportional to the values.`, `Jika sisi berada dalam nisbah 1 : ${k}, luasnya berada dalam nisbah 1 : ${k * k}, jadi jualan kedua kelihatan ${k * k} kali lebih besar padahal hanya ${k} kali ganda. Gunakan palang berlebar sama dengan tinggi berkadaran dengan nilai.`), sp: 'm' };
    },
  ];
  const g125a = [
    (r) => {
      const tot = r.pick([30, 40, 50]);
      const yes = Math.round(tot * r.pick([0.8, 0.9]));
      const va = 100 - Math.round((yes / tot) * 100);
      return { q: T(`A student asks ${tot} classmates in the canteen queue: "Don't you agree that our canteen serves the best food in the country?" ${yes} say yes. The student draws a bar chart with a vertical axis starting at ${yes - 10} and titled "Everyone loves our canteen". Identify at least three problems with the collection and the display, and state a fairer conclusion.`, `Seorang murid bertanya kepada ${tot} orang rakan sekelas dalam barisan kantin: "Tidakkah anda bersetuju bahawa kantin kita menghidangkan makanan terbaik di negara ini?" ${yes} orang menjawab ya. Murid itu melukis carta palang dengan paksi mencancang bermula pada ${yes - 10} dan bertajuk "Semua orang suka kantin kita". Kenal pasti sekurang-kurangnya tiga masalah dalam pengumpulan dan paparan data, dan nyatakan kesimpulan yang lebih adil.`), a: T(`(1) Leading question. (2) Sample is unrepresentative: only students in the canteen queue. (3) Truncated axis exaggerates the difference. (4) The title overgeneralises. Fairer: "${yes} of the ${tot} students surveyed in the canteen queue (${n(round((yes / tot) * 100, 1))}%) said they liked the food."`, `(1) Soalan mengarahkan. (2) Sampel tidak mewakili: hanya murid dalam barisan kantin. (3) Paksi terpotong membesar-besarkan perbezaan. (4) Tajuk membuat generalisasi berlebihan. Lebih adil: "${yes} daripada ${tot} orang murid yang ditinjau dalam barisan kantin (${n(round((yes / tot) * 100, 1))}%) berkata mereka suka makanan itu."`), sp: 'xl' };
    },
  ];
  SPM.addChapter(1, 12, T('Data Handling', 'Pengendalian Data'), [
    { id: '12.1', en: 'Statistical questions and inquiry cycle', ms: 'Soalan statistik dan kitaran inkuiri', gen: { e: g121e, m: g121m, a: g121a } },
    { id: '12.2', en: 'Organisation and representation', ms: 'Pengorganisasian dan perwakilan data', gen: { e: g122e, m: g122m, a: g122a } },
    { id: '12.3', en: 'Conversion, comparison and choice of representation', ms: 'Penukaran, perbandingan dan pemilihan perwakilan', gen: { e: g123e, m: g123m, a: g123a } },
    { id: '12.4', en: 'Interpretation, inference and prediction', ms: 'Tafsiran, inferens dan ramalan', gen: { e: g124e, m: g124m, a: g124a } },
    { id: '12.5', en: 'Ethical and non-misleading representation', ms: 'Perwakilan yang beretika dan tidak mengelirukan', gen: { e: g125e, m: g125m, a: g125a } },
  ]);

  /* =============================================================== 13 */
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
  /** right triangle with right angle at bottom-left; labels for two legs and hypotenuse */
  function rtri(a, b, la, lb, lc, o) {
    o = o || {};
    let w = 170, h = 170 * (b / a);
    if (h > 130) { h = 130; w = 130 * (a / b); }
    h = Math.max(h, 60);
    w = Math.max(w, 60);
    const x0 = (260 - w) / 2, y0 = (180 + h) / 2;
    const P = o.flip ? [[x0 + w, y0], [x0, y0], [x0 + w, y0 - h]] : [[x0, y0], [x0 + w, y0], [x0, y0 - h]];
    const Cn = [(P[0][0] + P[1][0] + P[2][0]) / 3, (P[0][1] + P[1][1] + P[2][1]) / 3];
    let out = S.poly(P) + S.rightAngle(P[0], P[1], P[2], 10);
    out += S.sideLabel(P[0], P[1], Cn, la, 12) + S.sideLabel(P[0], P[2], Cn, lb, 14) + S.sideLabel(P[1], P[2], Cn, lc, 14);
    if (o.names) out += S.outLabel(P[0], Cn, o.names[0], 12) + S.outLabel(P[1], Cn, o.names[1], 12) + S.outLabel(P[2], Cn, o.names[2], 12);
    return S.wrap(260, 180, out, 'right-angled triangle');
  }
  const sq2 = (v) => n(round(v, 2));
  const g131e = [
    (r) => {
      const t = r.pick(TRIPLES.slice(0, 3)), k = r.pick([1, 1, 2]);
      const [a, b, c] = t.map((v) => v * k);
      return { q: T('Find the length of the hypotenuse $x$.', 'Cari panjang hipotenus $x$.'), fig: rtri(a, b, `${a} cm`, `${b} cm`, 'x', { flip: r.chance() }), a: T(`$x = ${c}$ cm`), w: T(`$x^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}$`), sp: 's' };
    },
    (r) => {
      const t = r.pick(TRIPLES.slice(0, 3)), k = r.pick([1, 2]);
      const [a, b, c] = t.map((v) => v * k);
      return { q: T(`A right-angled triangle has two shorter sides of ${a} cm and ${b} cm. Find the length of the hypotenuse.`, `Sebuah segi tiga bersudut tegak mempunyai dua sisi yang lebih pendek ${a} cm dan ${b} cm. Cari panjang hipotenus.`), a: T(`${c} cm`), sp: 's' };
    },
    (r) => {
      const [a, b] = r.pick(TRIPLES.slice(0, 3));
      const fig = rtri(a, b, 'a', 'b', 'c', { names: ['P', 'Q', 'R'], flip: r.chance() });
      return { q: T('In the right-angled triangle $PQR$, which side is the hypotenuse? State the relationship between $a$, $b$ and $c$.', 'Dalam segi tiga bersudut tegak $PQR$, sisi manakah yang merupakan hipotenus? Nyatakan hubungan antara $a$, $b$ dan $c$.'), fig, a: T('$c$ (opposite the right angle at $P$); $a^2 + b^2 = c^2$', '$c$ (bertentangan dengan sudut tegak di $P$); $a^2 + b^2 = c^2$'), sp: 's' };
    },
  ];
  const g131m = [
    (r) => {
      const t = r.pick(TRIPLES), k = r.pick([1, 1, 2]);
      const [a, b, c] = t.map((v) => v * k);
      need(c <= 60);
      const known = r.chance() ? a : b, ans = known === a ? b : a;
      return { q: T('Find the length of the side marked $x$.', 'Cari panjang sisi yang bertanda $x$.'), fig: rtri(known, ans, `${known} cm`, 'x', `${c} cm`, { flip: r.chance() }), a: T(`$x = ${ans}$ cm`), w: T(`$x^2 = ${c}^2 - ${known}^2 = ${c * c - known * known}$`), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick([[3, 4, 5], [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25]]);
      return { q: T(`A rectangle measures ${a} cm by ${b} cm. Find the length of its diagonal.`, `Sebuah segi empat tepat berukuran ${a} cm kali ${b} cm. Cari panjang pepenjurunya.`), a: T(`${c} cm`), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick([[0.6, 0.8, 1], [1.5, 2, 2.5], [0.9, 1.2, 1.5], [2.5, 6, 6.5], [0.5, 1.2, 1.3]]);
      const findHyp = r.chance();
      return findHyp
        ? { q: T(`The two shorter sides of a right-angled triangle are ${n(a)} m and ${n(b)} m. Find the hypotenuse.`, `Dua sisi yang lebih pendek bagi sebuah segi tiga bersudut tegak ialah ${n(a)} m dan ${n(b)} m. Cari hipotenus.`), a: T(`${n(c)} m`), sp: 's' }
        : { q: T(`The hypotenuse of a right-angled triangle is ${n(c)} m and one of the other sides is ${n(a)} m. Find the third side.`, `Hipotenus sebuah segi tiga bersudut tegak ialah ${n(c)} m dan satu daripada dua sisi yang lain ialah ${n(a)} m. Cari sisi yang ketiga.`), a: T(`${n(b)} m`), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick(TRIPLES.slice(0, 3)), k = r.pick([2, 3, 4]);
      return { q: T(`A ladder ${c * k} m long leans against a vertical wall. Its foot is ${a * k} m from the wall. How high up the wall does the ladder reach?`, `Sebuah tangga sepanjang ${c * k} m disandarkan pada dinding tegak. Kaki tangga itu berjarak ${a * k} m dari dinding. Berapakah ketinggian tangga itu pada dinding?`), a: T(`${b * k} m`), sp: 's' };
    },
  ];
  const g131a = [
    (r) => {
      const a = r.int(4, 12), b = r.int(4, 12);
      need(a !== b && !Number.isInteger(Math.sqrt(a * a + b * b)));
      const c = Math.sqrt(a * a + b * b);
      return { q: T(`Find the length of the hypotenuse, correct to 2 decimal places.`, `Cari panjang hipotenus, betul kepada 2 tempat perpuluhan.`), fig: rtri(a, b, `${a} cm`, `${b} cm`, 'x', { flip: r.chance() }), a: T(`$x = ${sq2(c)}$ cm`), w: T(`$x = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${a * a + b * b}}$`), sp: 's' };
    },
    (r) => {
      const c = r.int(9, 20), a = r.int(4, c - 3);
      const b2 = c * c - a * a;
      need(!Number.isInteger(Math.sqrt(b2)));
      return { q: T(`The hypotenuse of a right-angled triangle is ${c} cm and one of the other sides is ${a} cm. Find the length of the third side, correct to 2 decimal places.`, `Hipotenus sebuah segi tiga bersudut tegak ialah ${c} cm dan satu daripada dua sisi yang lain ialah ${a} cm. Cari panjang sisi yang ketiga, betul kepada 2 tempat perpuluhan.`), a: T(`${sq2(Math.sqrt(b2))} cm`), w: T(`$\\sqrt{${c}^2 - ${a}^2} = \\sqrt{${b2}}$`), sp: 'm' };
    },
    (r) => {
      const o = r.pick([
        { bd: 5, ad: 12, ab: 13, dc: 9, ac: 15 }, { bd: 5, ad: 12, ab: 13, dc: 16, ac: 20 },
        { bd: 8, ad: 15, ab: 17, dc: 20, ac: 25 }, { bd: 8, ad: 15, ab: 17, dc: 36, ac: 39 },
      ]);
      const fig = F.polygon({
        pts: [[0, 0], [o.bd + o.dc, 0], [o.bd, -o.ad]], names: ['B', 'C', 'A'], w: 290, h: 180,
        sides: { '0-2': `${o.ab} cm`, '1-2': `${o.ac} cm` },
        extra: (Q) => { const D = [Q[2][0], Q[0][1]]; return S.line(Q[2][0], Q[2][1], D[0], D[1], { dash: true }) + S.text(D[0], D[1] + 13, 'D', { i: true }) + S.rightAngle(D, Q[2], [D[0] + 12, D[1]], 8) + S.text(D[0] + 16, (Q[2][1] + D[1]) / 2, `${o.ad} cm`, { s: 12, a: 'start' }); },
      });
      return { q: T('In the diagram, $AD \perp BC$. Find the length of $BC$.', 'Dalam rajah, $AD \perp BC$. Cari panjang $BC$.'), fig, a: T(`$BC = ${o.bd + o.dc}$ cm`), w: T(`$BD = \\sqrt{${o.ab}^2 - ${o.ad}^2} = ${o.bd}$; $DC = \\sqrt{${o.ac}^2 - ${o.ad}^2} = ${o.dc}$`), sp: 'l' };
    },
    (r) => {
      const [a, b, c] = r.pick([[8, 15, 17], [9, 12, 15], [12, 16, 20], [15, 20, 25]]);
      const per = 2 * (a + b);
      return { q: T(`The diagonal of a rectangle is ${c} cm and one side is ${a} cm. Find (a) the other side, (b) the perimeter, (c) the area of the rectangle.`, `Pepenjuru sebuah segi empat tepat ialah ${c} cm dan satu sisinya ${a} cm. Cari (a) sisi yang satu lagi, (b) perimeter, (c) luas segi empat tepat itu.`), a: T(`(a) ${b} cm (b) ${per} cm (c) ${a * b} cm²`), sp: 'm' };
    },
    (r) => {
      const scr = r.pick([[24, 32, 40], [40, 30, 50], [48, 64, 80]]);
      return { q: T(`A television screen is ${scr[0]} cm high and ${scr[1]} cm wide. Its size is given by the length of the diagonal of the screen. What is the size of the television?`, `Skrin sebuah televisyen setinggi ${scr[0]} cm dan selebar ${scr[1]} cm. Saiznya ditentukan oleh panjang pepenjuru skrin. Apakah saiz televisyen itu?`), a: T(`${scr[2]} cm`), sp: 'm' };
    },
    (r) => {
      const [h, d] = r.pick([[6, 10], [12, 13], [8, 17], [15, 17]]);
      const base = Math.sqrt(d * d - h * h);
      need(Number.isInteger(base));
      return { q: T(`A guy rope ${d} m long is tied from the top of a vertical pole ${h} m high to a peg on level ground. How far is the peg from the foot of the pole?`, `Seutas tali penyokong sepanjang ${d} m diikat dari puncak sebatang tiang tegak setinggi ${h} m ke sebatang pasak di atas tanah rata. Berapakah jarak pasak dari kaki tiang?`), a: T(`${base} m`), sp: 'm' };
    },
  ];

  const g132e = [
    (r) => {
      const k = r.pick([1, 2, 3]);
      const t = r.pick(TRIPLES.slice(0, 3)).map((v) => v * k);
      const list = r.shuffle(t);
      return { q: T(`Show that a triangle with sides ${list.join(' cm, ')} cm is a right-angled triangle.`, `Tunjukkan bahawa sebuah segi tiga dengan sisi ${list.join(' cm, ')} cm ialah segi tiga bersudut tegak.`), a: T(`$${t[0]}^2 + ${t[1]}^2 = ${t[0] ** 2 + t[1] ** 2} = ${t[2]}^2$, so it is right-angled.`, `$${t[0]}^2 + ${t[1]}^2 = ${t[0] ** 2 + t[1] ** 2} = ${t[2]}^2$, jadi ia bersudut tegak.`), sp: 's' };
    },
    (r) => {
      const t = r.pick(TRIPLES.slice(0, 2));
      const bad = t.slice(); bad[2] += r.pick([1, 2]);
      need(bad[0] + bad[1] > bad[2]);
      const list = r.shuffle(bad);
      return { q: T(`Is a triangle with sides ${list.join(' cm, ')} cm right-angled? Show your working.`, `Adakah sebuah segi tiga dengan sisi ${list.join(' cm, ')} cm bersudut tegak? Tunjukkan langkah kerja anda.`), a: T(`No: $${t[0]}^2 + ${t[1]}^2 = ${t[0] ** 2 + t[1] ** 2}$ but $${bad[2]}^2 = ${bad[2] ** 2}$.`, `Tidak: $${t[0]}^2 + ${t[1]}^2 = ${t[0] ** 2 + t[1] ** 2}$ tetapi $${bad[2]}^2 = ${bad[2] ** 2}$.`), sp: 's' };
    },
  ];
  const g132m = [
    (r) => {
      const k = r.pick([3, 4, 5]);
      const t = r.pick(TRIPLES.slice(0, 2)).map((v) => v * k);
      const ok = r.chance();
      const s = ok ? t : [t[0], t[1], t[2] - r.pick([1, 2, 3])];
      const list = r.shuffle(s);
      const [a, b, c] = s.slice().sort((x, y) => x - y);
      return { q: T(`The sides of a triangle are ${list.join(' cm, ')} cm. Determine whether it is a right-angled triangle. Identify the longest side first.`, `Sisi-sisi sebuah segi tiga ialah ${list.join(' cm, ')} cm. Tentukan sama ada ia segi tiga bersudut tegak. Kenal pasti sisi terpanjang dahulu.`), a: T(`Longest side ${c} cm: $${a}^2 + ${b}^2 = ${a * a + b * b}$, $${c}^2 = ${c * c}$. ${a * a + b * b === c * c ? 'Right-angled.' : 'Not right-angled.'}`, `Sisi terpanjang ${c} cm: $${a}^2 + ${b}^2 = ${a * a + b * b}$, $${c}^2 = ${c * c}$. ${a * a + b * b === c * c ? 'Bersudut tegak.' : 'Tidak bersudut tegak.'}`), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick([[0.9, 1.2, 1.5], [0.5, 1.2, 1.3], [1.5, 2, 2.5], [0.6, 0.8, 1.0]]);
      return { q: T(`Can lengths ${n(a)} m, ${n(b)} m and ${n(c)} m form a right-angled triangle? Show your working.`, `Bolehkah panjang ${n(a)} m, ${n(b)} m dan ${n(c)} m membentuk segi tiga bersudut tegak? Tunjukkan langkah kerja anda.`), a: T(`Yes: $${n(a)}^2 + ${n(b)}^2 = ${n(round(a * a + b * b, 2))} = ${n(c)}^2$.`, `Ya: $${n(a)}^2 + ${n(b)}^2 = ${n(round(a * a + b * b, 2))} = ${n(c)}^2$.`), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick(TRIPLES.slice(0, 3));
      const fig = rtri(a, b, `${a} cm`, `${b} cm`, `${c} cm`, { names: ['P', 'Q', 'R'] });
      return { q: T(`In triangle $PQR$ the sides are $PQ = ${a}$ cm, $PR = ${b}$ cm and $QR = ${c}$ cm. State which vertex has the right angle.`, `Dalam segi tiga $PQR$, sisinya ialah $PQ = ${a}$ cm, $PR = ${b}$ cm dan $QR = ${c}$ cm. Nyatakan bucu yang mempunyai sudut tegak.`), fig, a: T(`Vertex $P$ (opposite the longest side $QR = ${c}$ cm, since $${a}^2 + ${b}^2 = ${c}^2$)`, `Bucu $P$ (bertentangan dengan sisi terpanjang $QR = ${c}$ cm, kerana $${a}^2 + ${b}^2 = ${c}^2$)`), sp: 's' };
    },
  ];
  const g132a = [
    (r) => {
      const a = r.int(6, 12), b = a + r.int(1, 3);
      const c = b + r.pick([1, 2]);
      need(a * a + b * b !== c * c && a + b > c);
      const list = r.shuffle([a, b, c]);
      return { q: T(`A carpenter checks whether the corner of a roof frame with members ${list.join(' m, ')} m is a right angle. Does the converse of the Pythagoras theorem support this? Give the numerical evidence, and check the triangle inequality first.`, `Seorang tukang kayu menyemak sama ada bucu rangka bumbung dengan anggota ${list.join(' m, ')} m ialah sudut tegak. Adakah akas teorem Pythagoras menyokongnya? Berikan bukti berangka, dan semak ketaksamaan segi tiga dahulu.`), a: T(`${a} + ${b} = ${a + b} > ${c}, so a triangle exists. $${a}^2 + ${b}^2 = ${a * a + b * b}$ but $${c}^2 = ${c * c}$: not equal, so it is not a right angle.`, `${a} + ${b} = ${a + b} > ${c}, jadi segi tiga wujud. $${a}^2 + ${b}^2 = ${a * a + b * b}$ tetapi $${c}^2 = ${c * c}$: tidak sama, jadi ia bukan sudut tegak.`), sp: 'm' };
    },
    (r) => {
      const k = r.pick([10, 20, 30]);
      const t = r.pick(TRIPLES.slice(0, 3));
      const [a, b, c] = t.map((v) => v * k);
      return { q: T(`To make sure that the corner of a rectangular garden bed is square, a gardener measures ${a} cm along one edge and ${b} cm along the other, and the distance between the two marks is ${c} cm. Is the corner a right angle? Explain.`, `Untuk memastikan bucu batas taman berbentuk segi empat tepat itu tepat, seorang tukang kebun mengukur ${a} cm sepanjang satu tepi dan ${b} cm sepanjang tepi yang lain, dan jarak antara kedua-dua tanda ialah ${c} cm. Adakah bucu itu sudut tegak? Terangkan.`), a: T(`Yes: $${a}^2 + ${b}^2 = ${a * a + b * b} = ${c}^2$, so by the converse the angle is $90^\\circ$.`, `Ya: $${a}^2 + ${b}^2 = ${a * a + b * b} = ${c}^2$, jadi menurut akas teorem, sudutnya ialah $90^\\circ$.`), sp: 'm' };
    },
    (r) => {
      const a = r.int(5, 9), b = r.int(a + 2, 14), c = a + b + r.pick([1, 2]);
      const t = r.shuffle([a, b, c]);
      return { q: T(`Can lengths ${t.join(' cm, ')} cm form a triangle? If so, is it right-angled? Give reasons.`, `Bolehkah panjang ${t.join(' cm, ')} cm membentuk segi tiga? Jika boleh, adakah ia bersudut tegak? Berikan sebab.`), a: T(`No triangle: the two shorter sides add up to ${a + b}, which is less than ${c}. (The triangle inequality fails, so the Pythagoras test does not apply.)`, `Tiada segi tiga: dua sisi yang lebih pendek berjumlah ${a + b}, iaitu kurang daripada ${c}. (Ketaksamaan segi tiga tidak dipenuhi, jadi ujian Pythagoras tidak terpakai.)`), sp: 'm' };
    },
  ];
  SPM.addChapter(1, 13, T('The Pythagoras Theorem', 'Teorem Pythagoras'), [
    { id: '13.1', en: 'The Pythagoras theorem', ms: 'Teorem Pythagoras', gen: { e: g131e, m: g131m, a: g131a } },
    { id: '13.2', en: 'The converse of the Pythagoras theorem', ms: 'Akas teorem Pythagoras', gen: { e: g132e, m: g132m, a: g132a } },
  ]);
})();
