/* Form 1 – Chapters 11 to 13 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, gcd, round, need, retry, par, sum, poly } = SPM;
  const S = SPM.svg;
  const F = SPM.figs;
  const T = (e, m) => ({ en: e, ms: m === undefined ? e : m });
  const W = SPM.lines;
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
      return { q: T(`List the elements of the set $${nm} = ${s.tex.en}$.`, `Senaraikan unsur bagi set $${nm} = ${s.tex.ms}$.`), a: T(`$${nm} = ${roster(s.list)}$`), w: W(T(`Write down every value that fits the description: ${s.words.en}.`, `Tulis setiap nilai yang memenuhi perihalan itu: ${s.words.ms}.`), T(`$${nm} = ${roster(s.list)}$`), T(`$n(${nm}) = ${s.list.length}$`)), sp: 's' };
    },
    (r) => {
      const list = r.sample(range(1, 20), r.int(4, 6)).sort((a, b) => a - b);
      const inN = r.pick(list), outN = r.pick(range(1, 20).filter((v) => !list.includes(v)));
      const ask = r.chance();
      const x = ask ? inN : outN;
      return { q: T(`Given $A = ${roster(list)}$, state whether $${x} \\in A$ or $${x} \\notin A$.`, `Diberi $A = ${roster(list)}$, nyatakan sama ada $${x} \\in A$ atau $${x} \\notin A$.`), a: T(`$${x} ${ask ? '\\in' : '\\notin'} A$`), w: W(T(`Look through the list of $A$: $${x}$ ${ask ? 'is one of the elements' : 'is not one of the elements'}.`, `Semak senarai $A$: $${x}$ ${ask ? 'ialah salah satu unsurnya' : 'bukan salah satu unsurnya'}.`), T(`$${x} ${ask ? '\\in' : '\\notin'} A$`)), sp: 'xs' };
    },
    (r) => {
      const list = r.sample(range(1, 30), r.int(4, 8)).sort((a, b) => a - b);
      return { q: T(`Given $B = ${roster(list)}$, find $n(B)$.`, `Diberi $B = ${roster(list)}$, cari $n(B)$.`), a: T(`$n(B) = ${list.length}$`), w: W(T('$n(B)$ means the number of elements in $B$.', '$n(B)$ bermaksud bilangan unsur dalam $B$.'), T(`Count them one by one: $n(B) = ${list.length}$`, `Bilang satu per satu: $n(B) = ${list.length}$`)), sp: 'xs' };
    },
    (r) => {
      const list = ['a', 'e', 'i', 'o', 'u'];
      return { q: T(`Let $V = \\{x : x \\text{ is a vowel in the English alphabet}\\}$. List the elements of $V$ and state $n(V)$.`, `Katakan $V = \\{x : x \\text{ ialah huruf vokal dalam abjad Inggeris}\\}$. Senaraikan unsur bagi $V$ dan nyatakan $n(V)$.`), a: T(`$V = ${roster(list)}$, $n(V) = 5$`), w: W(T('The vowels of the English alphabet are a, e, i, o and u.', 'Huruf vokal dalam abjad Inggeris ialah a, e, i, o dan u.'), T(`$V = ${roster(list)}$`), T('$n(V) = 5$')), sp: 's' };
    },
  ];
  const g111m = [
    (r) => {
      const s = withMin(r, 3, 9);
      return { q: T(`Write the set $A = ${s.tex.en}$ in roster form and find $n(A)$.`, `Tulis set $A = ${s.tex.ms}$ dalam bentuk senarai dan cari $n(A)$.`), a: T(`$A = ${roster(s.list)}$, $n(A) = ${s.list.length}$`), w: W(T(`Roster form means listing every element: ${s.words.en}.`, `Bentuk senarai bermaksud menyenaraikan setiap unsur: ${s.words.ms}.`), T(`$A = ${roster(s.list)}$`), T(`$n(A) = ${s.list.length}$`)), sp: 's' };
    },
    (r) => {
      const s = withMin(r, 3, 8);
      return { q: T(`Write the set $B = ${roster(s.list)}$ using set-builder notation, describing its elements in words.`, `Tulis set $B = ${roster(s.list)}$ menggunakan tatatanda pembina set, dengan menerangkan unsurnya dalam perkataan.`), a: T(`$B = ${s.tex.en}$ (${s.words.en})`, `$B = ${s.tex.ms}$ (${s.words.ms})`), w: W(T(`Look for the property all the elements share: they are ${s.words.en}.`, `Cari sifat sepunya semua unsurnya: ia ialah ${s.words.ms}.`), T(`Write it after the colon: $B = ${s.tex.en}$`, `Tulis sifat itu selepas titik bertindih: $B = ${s.tex.ms}$`)), sp: 's' };
    },
    (r) => {
      const a = r.int(1, 5), b = a + r.int(2, 4);
      return { q: T(`Set $A = \\{x : x \\text{ is an integer},\\ ${a} < x < ${a + 1}\\}$. State $n(A)$ and write down the special name of the set.`, `Set $A = \\{x : x \\text{ ialah integer},\\ ${a} < x < ${a + 1}\\}$. Nyatakan $n(A)$ dan tuliskan nama khas bagi set itu.`), a: T('$n(A) = 0$; the empty set, $\\varnothing$', '$n(A) = 0$; set kosong, $\\varnothing$'), w: W(T(`There is no integer strictly between $${a}$ and $${a + 1}$.`, `Tiada integer yang terletak antara $${a}$ dengan $${a + 1}$.`), T('So $A$ has no elements: $n(A) = 0$.', 'Jadi $A$ tiada unsur: $n(A) = 0$.'), T('A set with no elements is the empty set, $\\varnothing$ (or $\\{\\ \\}$).', 'Set yang tiada unsur ialah set kosong, $\\varnothing$ (atau $\\{\\ \\}$).')), sp: 's' };
    },
    (r) => {
      const k = r.pick([2, 3, 4, 5]);
      const lo = r.int(1, 3), hi = r.int(18, 30);
      const list = range(lo, hi).filter((v) => v % k === 0);
      const finite = r.chance();
      return { q: T(finite ? `Is the set $\\{x : x \\text{ is a multiple of } ${k},\\ ${lo} \\le x \\le ${hi}\\}$ finite or infinite? Find its number of elements.` : `Is the set $\\{x : x \\text{ is a multiple of } ${k}\\}$ finite or infinite?`, finite ? `Adakah set $\\{x : x \\text{ ialah gandaan bagi } ${k},\\ ${lo} \\le x \\le ${hi}\\}$ terhingga atau tak terhingga? Cari bilangan unsurnya.` : `Adakah set $\\{x : x \\text{ ialah gandaan bagi } ${k}\\}$ terhingga atau tak terhingga?`), a: finite ? T(`Finite; ${list.length} elements`, `Terhingga; ${list.length} unsur`) : T('Infinite: the multiples never end.', 'Tak terhingga: gandaan tidak pernah berakhir.'), w: finite ? W(T(`In that range the multiples of ${k} are $${list.join(',\\ ')}$.`, `Dalam julat itu, gandaan bagi ${k} ialah $${list.join(',\\ ')}$.`), T(`They can all be counted: $${list.length}$ elements, so the set is finite.`, `Semuanya boleh dibilang: $${list.length}$ unsur, jadi set itu terhingga.`)) : W(T(`The multiples are $${k}, ${2 * k}, ${3 * k}, ${4 * k}, \\ldots$ and there is no largest one.`, `Gandaannya ialah $${k}, ${2 * k}, ${3 * k}, ${4 * k}, \\ldots$ dan tiada yang terbesar.`), T('The list never ends, so the set is infinite.', 'Senarai itu tidak pernah berakhir, jadi set itu tak terhingga.')), sp: 's' };
    },
  ];
  const g111a = [
    (r) => {
      const m = r.pick([12, 18, 24, 30, 36]);
      const fact = range(1, m).filter((v) => m % v === 0);
      const A = fact.filter((v) => v % 2 === 0);
      const B = r.chance() ? A.slice() : A.slice(0, -1);
      const eq = A.length === B.length;
      const gone = A[A.length - 1];
      return { q: T(`Set $A$ contains the factors of ${m} that are multiples of 2. Set $B = ${roster(B)}$. List the elements of $A$ and decide whether $A = B$. Give a reason.`, `Set $A$ mengandungi faktor bagi ${m} yang merupakan gandaan 2. Set $B = ${roster(B)}$. Senaraikan unsur bagi $A$ dan tentukan sama ada $A = B$. Berikan sebab.`), a: eq ? T(`$A = ${roster(A)}$; $A = B$ because they have exactly the same elements.`, `$A = ${roster(A)}$; $A = B$ kerana kedua-duanya mempunyai unsur yang betul-betul sama.`) : T(`$A = ${roster(A)}$; $A \\neq B$ because $${A[A.length - 1]} \\in A$ but $${A[A.length - 1]} \\notin B$.`, `$A = ${roster(A)}$; $A \\neq B$ kerana $${A[A.length - 1]} \\in A$ tetapi $${A[A.length - 1]} \\notin B$.`), w: W(T(`Factors of ${m}: $${fact.join(',\\ ')}$`, `Faktor bagi ${m}: $${fact.join(',\\ ')}$`), T(`Keep only the even ones: $A = ${roster(A)}$`, `Kekalkan yang genap sahaja: $A = ${roster(A)}$`), eq ? T('Two sets are equal only if they have exactly the same elements; here every element matches.', 'Dua set adalah sama hanya jika unsurnya betul-betul sama; di sini setiap unsur sepadan.') : T(`$${gone} \\in A$ but $${gone} \\notin B$, so $A \\neq B$.`, `$${gone} \\in A$ tetapi $${gone} \\notin B$, jadi $A \\neq B$.`)), sp: 'm' };
    },
    (r) => {
      const s1 = withMin(r, 3, 8);
      const s2 = retry(() => { const t = numSet(r); need(t.list.length === s1.list.length && t.tex.en !== s1.tex.en); return t; }, 800);
      const same = s1.list.join() === s2.list.join();
      const odd = s1.list.find((v) => !s2.list.includes(v));
      return { q: T(`Set $P = ${s1.tex.en}$ and set $Q = ${s2.tex.en}$. List the elements of each set. Are $P$ and $Q$ equal sets? Explain.`, `Set $P = ${s1.tex.ms}$ dan set $Q = ${s2.tex.ms}$. Senaraikan unsur bagi setiap set. Adakah $P$ dan $Q$ set yang sama? Terangkan.`), a: T(`$P = ${roster(s1.list)}$, $Q = ${roster(s2.list)}$. ${same ? 'Equal: same elements.' : 'Not equal: the elements differ.'}`, `$P = ${roster(s1.list)}$, $Q = ${roster(s2.list)}$. ${same ? 'Sama: unsur sama.' : 'Tidak sama: unsur berbeza.'}`), w: W(T(`List each set from its description: $P = ${roster(s1.list)}$, $Q = ${roster(s2.list)}$`, `Senaraikan setiap set daripada perihalannya: $P = ${roster(s1.list)}$, $Q = ${roster(s2.list)}$`), same ? T('Equal sets have exactly the same elements, even when the descriptions are different.', 'Set yang sama mempunyai unsur yang betul-betul sama, walaupun perihalannya berbeza.') : T(`$${odd} \\in P$ but $${odd} \\notin Q$, so $P \\neq Q$ even though $n(P) = n(Q)$.`, `$${odd} \\in P$ tetapi $${odd} \\notin Q$, jadi $P \\neq Q$ walaupun $n(P) = n(Q)$.`)), sp: 'm' };
    },
  ];

  const g112e = [
    (r) => {
      const N = r.int(8, 12);
      const A = r.sample(range(1, N), r.int(3, 5)).sort((a, b) => a - b);
      const Ac = range(1, N).filter((v) => !A.includes(v));
      return { q: T(`$\\xi = ${roster(range(1, N))}$ and $A = ${roster(A)}$. List the elements of $A'$.`, `$\\xi = ${roster(range(1, N))}$ dan $A = ${roster(A)}$. Senaraikan unsur bagi $A'$.`), a: T(`$A' = ${roster(Ac)}$`), w: W(T(`$A'$ is made up of every element of $\\xi$ that is not in $A$.`, `$A'$ terdiri daripada setiap unsur $\\xi$ yang bukan unsur $A$.`), T(`Cross out $${A.join(',\\ ')}$ from $\\xi$ and list what is left.`, `Potong $${A.join(',\\ ')}$ daripada $\\xi$ dan senaraikan yang tinggal.`), T(`$A' = ${roster(Ac)}$`)), sp: 's' };
    },
    (r) => {
      const N = r.int(8, 15);
      const A = r.sample(range(1, N), r.int(3, 6)).sort((a, b) => a - b);
      return { q: T(`Given $\\xi = ${roster(range(1, N))}$ and $A = ${roster(A)}$, find $n(A')$.`, `Diberi $\\xi = ${roster(range(1, N))}$ dan $A = ${roster(A)}$, cari $n(A')$.`), a: T(`$n(A') = ${N - A.length}$`), w: W(T(`$A$ and $A'$ together fill $\\xi$, so $n(A') = n(\\xi) - n(A)$.`, `$A$ dan $A'$ bersama-sama memenuhi $\\xi$, jadi $n(A') = n(\\xi) - n(A)$.`), T(`$n(\\xi) = ${N}$, $n(A) = ${A.length}$`), T(`$n(A') = ${N} - ${A.length} = ${N - A.length}$`)), sp: 's' };
    },
  ];
  const g112m = [
    (r) => {
      const N = r.pick([10, 12, 15, 16, 20]);
      const s = subsetOf(r, N);
      const Ac = range(1, N).filter((v) => !s.list.includes(v));
      return { q: T(`$${universeTex(N).en}$ and $A = ${s.tex.en}$. List the elements of $A'$.`, `$${universeTex(N).ms}$ dan $A = ${s.tex.ms}$. Senaraikan unsur bagi $A'$.`), a: T(`$A = ${roster(s.list)}$; $A' = ${roster(Ac)}$`), w: W(T(`First list $\\xi = ${roster(range(1, N))}$.`, `Senaraikan dahulu $\\xi = ${roster(range(1, N))}$.`), T(`Pick out the ${s.words.en} in $\\xi$: $A = ${roster(s.list)}$`, `Pilih ${s.words.ms} dalam $\\xi$: $A = ${roster(s.list)}$`), T(`$A'$ is the rest of $\\xi$: $A' = ${roster(Ac)}$`, `$A'$ ialah baki $\\xi$: $A' = ${roster(Ac)}$`)), sp: 'm' };
    },
    (r) => {
      const N = r.int(9, 12);
      const A = r.sample(range(1, N), r.int(3, 5)).sort((a, b) => a - b);
      const Ac = range(1, N).filter((v) => !A.includes(v));
      const fig = S.venn1({ name: 'A', inA: A, out: Ac, shade: null });
      return { q: T('The Venn diagram shows a universal set $\\xi$ and a set $A$. List the elements of (a) $A$, (b) $A\'$, and state $n(A\')$.', 'Gambar rajah Venn menunjukkan set semesta $\\xi$ dan set $A$. Senaraikan unsur bagi (a) $A$, (b) $A\'$, dan nyatakan $n(A\')$.'), fig, a: T(`(a) $${roster(A)}$ (b) $${roster(Ac)}$; $n(A') = ${Ac.length}$`), w: W(T(`(a) Read the numbers written inside the circle: $A = ${roster(A)}$`, `(a) Baca nombor yang ditulis di dalam bulatan: $A = ${roster(A)}$`), T(`(b) $A'$ is what lies inside $\\xi$ but outside the circle: $A' = ${roster(Ac)}$`, `(b) $A'$ ialah yang terletak di dalam $\\xi$ tetapi di luar bulatan: $A' = ${roster(Ac)}$`), T(`$n(A') = ${Ac.length}$`)), sp: 's' };
    },
  ];
  const g112a = [
    (r) => {
      const N = r.int(10, 14);
      const Ac = r.sample(range(1, N), r.int(3, 6)).sort((a, b) => a - b);
      const A = range(1, N).filter((v) => !Ac.includes(v));
      return { q: T(`$\\xi = ${roster(range(1, N))}$ and $A' = ${roster(Ac)}$. Find the set $A$ and state $n(A)$.`, `$\\xi = ${roster(range(1, N))}$ dan $A' = ${roster(Ac)}$. Cari set $A$ dan nyatakan $n(A)$.`), a: T(`$A = ${roster(A)}$; $n(A) = ${A.length}$`), w: W(T(`$A$ and $A'$ split $\\xi$ between them, so $A$ is $\\xi$ with the elements of $A'$ removed.`, `$A$ dan $A'$ membahagikan $\\xi$ antara keduanya, jadi $A$ ialah $\\xi$ setelah unsur $A'$ dikeluarkan.`), T(`Remove $${Ac.join(',\\ ')}$ from $\\xi$: $A = ${roster(A)}$`, `Keluarkan $${Ac.join(',\\ ')}$ daripada $\\xi$: $A = ${roster(A)}$`), T(`$n(A) = ${N} - ${Ac.length} = ${A.length}$`)), sp: 's' };
    },
    (r) => {
      const N = r.pick([12, 15, 18, 20]);
      const [k1, k2] = r.sample([2, 3, 4, 5, 6], 2);
      const A = range(1, N).filter((v) => v % k1 === 0), B = range(1, N).filter((v) => v % k2 === 0);
      need(A.length !== B.length && A.length > 0 && B.length > 0);
      const bigger = N - A.length > N - B.length ? 'A' : 'B';
      return { q: T(`$\\xi = ${roster(range(1, N))}$, $A$ is the set of multiples of ${k1} and $B$ is the set of multiples of ${k2} in $\\xi$. Find $n(A')$ and $n(B')$. Which complement has more elements?`, `$\\xi = ${roster(range(1, N))}$, $A$ ialah set gandaan bagi ${k1} dan $B$ ialah set gandaan bagi ${k2} dalam $\\xi$. Cari $n(A')$ dan $n(B')$. Pelengkap yang manakah mempunyai lebih banyak unsur?`), a: T(`$n(A') = ${N - A.length}$, $n(B') = ${N - B.length}$; $${bigger}'$ has more elements.`, `$n(A') = ${N - A.length}$, $n(B') = ${N - B.length}$; $${bigger}'$ mempunyai lebih banyak unsur.`), w: W(T(`Multiples of ${k1} in $\\xi$: $A = ${roster(A)}$, so $n(A') = ${N} - ${A.length} = ${N - A.length}$`, `Gandaan bagi ${k1} dalam $\\xi$: $A = ${roster(A)}$, jadi $n(A') = ${N} - ${A.length} = ${N - A.length}$`), T(`Multiples of ${k2} in $\\xi$: $B = ${roster(B)}$, so $n(B') = ${N} - ${B.length} = ${N - B.length}$`, `Gandaan bagi ${k2} dalam $\\xi$: $B = ${roster(B)}$, jadi $n(B') = ${N} - ${B.length} = ${N - B.length}$`), T(`The smaller set leaves the larger complement, so $${bigger}'$ has more elements.`, `Set yang lebih kecil meninggalkan pelengkap yang lebih besar, jadi $${bigger}'$ mempunyai lebih banyak unsur.`)), sp: 'm' };
    },
  ];

  const g113e = [
    (r) => {
      const B = r.sample(range(1, 12), r.int(5, 7)).sort((a, b) => a - b);
      const yes = r.chance();
      const A = yes ? r.sample(B, r.int(2, 3)).sort((a, b) => a - b) : r.sample(B, 2).concat([r.pick(range(1, 12).filter((v) => !B.includes(v)))]).sort((a, b) => a - b);
      const bad = A.find((v) => !B.includes(v));
      return { q: T(`$A = ${roster(A)}$ and $B = ${roster(B)}$. Is $A \\subseteq B$? Give a reason.`, `$A = ${roster(A)}$ dan $B = ${roster(B)}$. Adakah $A \\subseteq B$? Berikan sebab.`), a: yes ? T('Yes: every element of $A$ is also in $B$.', 'Ya: setiap unsur $A$ juga terdapat dalam $B$.') : T(`No: $${bad} \\in A$ but $${bad} \\notin B$.`, `Tidak: $${bad} \\in A$ tetapi $${bad} \\notin B$.`), w: yes ? W(T('Test every element of $A$ in turn: is it in $B$?', 'Uji setiap unsur $A$ satu per satu: adakah ia ada dalam $B$?'), T(`$${A.join(',\\ ')}$ are all in $B$.`, `$${A.join(',\\ ')}$ semuanya ada dalam $B$.`), T('None is left out, so $A \\subseteq B$.', 'Tiada yang tertinggal, jadi $A \\subseteq B$.')) : W(T('Test every element of $A$ in turn: is it in $B$?', 'Uji setiap unsur $A$ satu per satu: adakah ia ada dalam $B$?'), T(`$${bad}$ is not in $B$.`, `$${bad}$ tiada dalam $B$.`), T(`One element outside $B$ is enough: $A \\nsubseteq B$.`, `Satu unsur di luar $B$ sudah memadai: $A \\nsubseteq B$.`)), sp: 's' };
    },
  ];
  const g113m = [
    (r) => {
      const A = r.sample(range(1, 9), 3).sort((a, b) => a - b);
      const inA = A[0], out = r.pick(range(1, 9).filter((v) => !A.includes(v)));
      const stmts = [
        [`${inA} \\in A`, true, T(`$${inA}$ is one of the elements listed in $A$.`, `$${inA}$ ialah salah satu unsur yang disenaraikan dalam $A$.`)],
        [`\\{${inA}\\} \\subseteq A`, true, T(`$\\{${inA}\\}$ is a set and its only element $${inA}$ lies in $A$.`, `$\\{${inA}\\}$ ialah set dan satu-satunya unsurnya $${inA}$ ada dalam $A$.`)],
        [`\\{${inA}\\} \\in A`, false, T(`The elements of $A$ are numbers, not sets, so $\\{${inA}\\}$ is not an element; use $\\subseteq$ here.`, `Unsur $A$ ialah nombor, bukan set, jadi $\\{${inA}\\}$ bukan unsur; gunakan $\\subseteq$ di sini.`)],
        [`${out} \\in A`, false, T(`$${out}$ is not listed in $A$.`, `$${out}$ tidak disenaraikan dalam $A$.`)],
        [`A \\subseteq A`, true, T('Every set is a subset of itself.', 'Setiap set ialah subset bagi dirinya sendiri.')],
        [`\\{${out}\\} \\subseteq A`, false, T(`$${out} \\notin A$, so $\\{${out}\\}$ is not a subset of $A$.`, `$${out} \\notin A$, jadi $\\{${out}\\}$ bukan subset bagi $A$.`)],
      ];
      const four = r.sample(stmts, 4);
      return { q: T(`Given $A = ${roster(A)}$, state whether each statement is true or false: ${four.map((s, i) => `(${'abcd'[i]}) $${s[0]}$`).join('  ')}`, `Diberi $A = ${roster(A)}$, nyatakan sama ada setiap pernyataan adalah betul atau salah: ${four.map((s, i) => `(${'abcd'[i]}) $${s[0]}$`).join('  ')}`), a: T(four.map((s, i) => `(${'abcd'[i]}) ${s[1] ? 'True' : 'False'}`).join('  '), four.map((s, i) => `(${'abcd'[i]}) ${s[1] ? 'Betul' : 'Salah'}`).join('  ')), w: W(...four.map((s, i) => T(`(${'abcd'[i]}) ${s[1] ? 'True' : 'False'} — ${s[2].en}`, `(${'abcd'[i]}) ${s[1] ? 'Betul' : 'Salah'} — ${s[2].ms}`))), sp: 's' };
    },
    (r) => {
      const N = r.pick([12, 15, 20]);
      const s = subsetOf(r, N);
      const B = range(1, N);
      const outEx = B.find((v) => !s.list.includes(v));
      return { q: T(`$\\xi = ${roster(B)}$ and $A = ${s.tex.en}$ (within $\\xi$). Is $A \\subseteq \\xi$? Is $\\xi \\subseteq A$? Give reasons.`, `$\\xi = ${roster(B)}$ dan $A = ${s.tex.ms}$ (dalam $\\xi$). Adakah $A \\subseteq \\xi$? Adakah $\\xi \\subseteq A$? Berikan sebab.`), a: T(`$A \\subseteq \\xi$: yes (every element of $A$ is in $\\xi$). $\\xi \\subseteq A$: no (e.g. ${B.find((v) => !s.list.includes(v))} is in $\\xi$ but not in $A$).`, `$A \\subseteq \\xi$: ya (setiap unsur $A$ ada dalam $\\xi$). $\\xi \\subseteq A$: tidak (cth. ${outEx} ada dalam $\\xi$ tetapi tiada dalam $A$).`), w: W(T(`List $A$ first: the ${s.words.en} in $\\xi$ are $A = ${roster(s.list)}$`, `Senaraikan $A$ dahulu: ${s.words.ms} dalam $\\xi$ ialah $A = ${roster(s.list)}$`), T('Every element of $A$ was taken from $\\xi$, so $A \\subseteq \\xi$.', 'Setiap unsur $A$ diambil daripada $\\xi$, jadi $A \\subseteq \\xi$.'), T(`For the other direction one counter-example is enough: $${outEx} \\in \\xi$ but $${outEx} \\notin A$, so $\\xi \\nsubseteq A$.`, `Bagi arah yang satu lagi, satu contoh penyangkal sudah memadai: $${outEx} \\in \\xi$ tetapi $${outEx} \\notin A$, jadi $\\xi \\nsubseteq A$.`)), sp: 'm' };
    },
  ];
  const g113a = [
    (r) => {
      const N = r.pick([12, 16, 18, 20, 24]);
      const A = range(1, N).filter((v) => v % 4 === 0), B = range(1, N).filter((v) => v % 2 === 0), C = range(1, N).filter((v) => v % 3 === 0);
      need(A.length >= 2 && C.length >= 2);
      return { q: T(`$\\xi = \\{x : x \\text{ is an integer},\\ 1 \\le x \\le ${N}\\}$, $A = \\{\\text{multiples of } 4\\}$, $B = \\{\\text{even numbers}\\}$ and $C = \\{\\text{multiples of } 3\\}$ (all within $\\xi$). Decide whether each is true: (a) $A \\subseteq B$ (b) $B \\subseteq A$ (c) $A \\subseteq C$. Give a reason for each.`, `$\\xi = \\{x : x \\text{ ialah integer},\\ 1 \\le x \\le ${N}\\}$, $A = \\{\\text{gandaan } 4\\}$, $B = \\{\\text{nombor genap}\\}$ dan $C = \\{\\text{gandaan } 3\\}$ (semuanya dalam $\\xi$). Tentukan sama ada setiap yang berikut betul: (a) $A \\subseteq B$ (b) $B \\subseteq A$ (c) $A \\subseteq C$. Berikan sebab bagi setiap satu.`), a: T(`(a) True: every multiple of 4 is even. (b) False: 2 is even but not a multiple of 4. (c) False: 4 is a multiple of 4 but not of 3.`, `(a) Betul: setiap gandaan 4 ialah nombor genap. (b) Salah: 2 ialah nombor genap tetapi bukan gandaan 4. (c) Salah: 4 ialah gandaan 4 tetapi bukan gandaan 3.`), w: W(T(`List the three sets: $A = ${roster(A)}$, $B = ${roster(B)}$, $C = ${roster(C)}$`, `Senaraikan ketiga-tiga set: $A = ${roster(A)}$, $B = ${roster(B)}$, $C = ${roster(C)}$`), T('(a) Any multiple of $4$ is $4k = 2(2k)$, so it is even: every element of $A$ is in $B$, hence $A \\subseteq B$.', '(a) Sebarang gandaan $4$ ialah $4k = 2(2k)$, jadi ia genap: setiap unsur $A$ ada dalam $B$, maka $A \\subseteq B$.'), T('(b) One counter-example is enough: $2 \\in B$ but $2 \\notin A$, so $B \\nsubseteq A$.', '(b) Satu contoh penyangkal sudah memadai: $2 \\in B$ tetapi $2 \\notin A$, jadi $B \\nsubseteq A$.'), T('(c) $4 \\in A$ but $4 \\notin C$, so $A \\nsubseteq C$.', '(c) $4 \\in A$ tetapi $4 \\notin C$, jadi $A \\nsubseteq C$.')), sp: 'm' };
    },
    (r) => {
      const N = r.pick([12, 15, 20]);
      const outerList = range(1, N).filter((v) => v % 2 === 0);
      const innerList = outerList.filter((v) => v % 4 === 0);
      const mid = outerList.filter((v) => v % 4 !== 0);
      const out = range(1, N).filter((v) => v % 2 === 1);
      const fig = S.vennNested({ names: ['A', 'B'], inner: innerList, mid, out });
      return { q: T('In the Venn diagram, $A \\subseteq B \\subseteq \\xi$. List the elements of $A$, $B$ and $B\'$, and state which of the following are true: (a) $A \\subseteq B$ (b) $B \\subseteq A$ (c) $A\' \\subseteq B\'$.', 'Dalam gambar rajah Venn, $A \\subseteq B \\subseteq \\xi$. Senaraikan unsur bagi $A$, $B$ dan $B\'$, dan nyatakan pernyataan yang betul: (a) $A \\subseteq B$ (b) $B \\subseteq A$ (c) $A\' \\subseteq B\'$.'), fig, a: T(`$A = ${roster(innerList)}$, $B = ${roster(outerList)}$, $B' = ${roster(out)}$. (a) True (b) False (c) False: $A'$ contains the elements of $B$ not in $A$, which are not in $B'$.`, `$A = ${roster(innerList)}$, $B = ${roster(outerList)}$, $B' = ${roster(out)}$. (a) Betul (b) Salah (c) Salah: $A'$ mengandungi unsur $B$ yang bukan dalam $A$, dan unsur ini tiada dalam $B'$.`), w: W(T(`Read the regions: inner circle $A = ${roster(innerList)}$; the whole big circle $B = ${roster(outerList)}$; outside $B$ gives $B' = ${roster(out)}$.`, `Baca kawasan: bulatan dalam $A = ${roster(innerList)}$; seluruh bulatan besar $B = ${roster(outerList)}$; di luar $B$ memberi $B' = ${roster(out)}$.`), T('(a) True: circle $A$ lies completely inside circle $B$.', '(a) Betul: bulatan $A$ terletak sepenuhnya di dalam bulatan $B$.'), T(`(b) False: $${mid[0]} \\in B$ but $${mid[0]} \\notin A$, so $B \\nsubseteq A$.`, `(b) Salah: $${mid[0]} \\in B$ tetapi $${mid[0]} \\notin A$, jadi $B \\nsubseteq A$.`), T(`(c) False: $${mid[0]} \\in A'$ but $${mid[0]} \\in B$, so $${mid[0]} \\notin B'$.`, `(c) Salah: $${mid[0]} \\in A'$ tetapi $${mid[0]} \\in B$, jadi $${mid[0]} \\notin B'$.`), T(`Taking complements reverses the direction: $A \\subseteq B$ gives $B' \\subseteq A'$.`, `Pelengkap membalikkan arah subset: $A \\subseteq B$ memberikan $B' \\subseteq A'$.`)), sp: 'm' };
    },
  ];

  const g114e = [
    (r) => {
      const N = r.int(8, 12);
      const s = subsetOf(r, N);
      const shadeOut = r.chance();
      const fig = S.venn1({ name: 'A', inA: s.list, out: range(1, N).filter((v) => !s.list.includes(v)), shade: shadeOut ? 'out' : 'A' });
      return { q: T('The shaded region of the Venn diagram represents which set: $A$ or $A\'$? List its elements.', 'Kawasan berlorek pada gambar rajah Venn mewakili set yang manakah: $A$ atau $A\'$? Senaraikan unsurnya.'), fig, a: T(`$${shadeOut ? "A'" : 'A'} = ${roster(shadeOut ? range(1, N).filter((v) => !s.list.includes(v)) : s.list)}$`), w: W(shadeOut ? T(`The shading is inside the rectangle $\\xi$ but outside the circle, so it stands for $A'$.`, `Lorekan berada di dalam segi empat tepat $\\xi$ tetapi di luar bulatan, jadi ia mewakili $A'$.`) : T('The shading fills the circle itself, so it stands for $A$.', 'Lorekan memenuhi bulatan itu sendiri, jadi ia mewakili $A$.'), T(`Read off the elements in that region: $${shadeOut ? "A'" : 'A'} = ${roster(shadeOut ? range(1, N).filter((v) => !s.list.includes(v)) : s.list)}$`, `Baca unsur dalam kawasan itu: $${shadeOut ? "A'" : 'A'} = ${roster(shadeOut ? range(1, N).filter((v) => !s.list.includes(v)) : s.list)}$`)), sp: 's' };
    },
    (r) => {
      const N = r.int(8, 12);
      const A = r.sample(range(1, N), r.int(3, 5)).sort((a, b) => a - b);
      const Ac = range(1, N).filter((v) => !A.includes(v));
      const fig = S.venn1({ name: 'A', inA: [], out: [], shade: null });
      return { q: T(`$\\xi = ${roster(range(1, N))}$ and $A = ${roster(A)}$. Draw a Venn diagram to show $\\xi$ and $A$, writing every element in the correct region.`, `$\\xi = ${roster(range(1, N))}$ dan $A = ${roster(A)}$. Lukis gambar rajah Venn untuk menunjukkan $\\xi$ dan $A$, dengan menulis setiap unsur pada kawasan yang betul.`), a: T(S.venn1({ name: 'A', inA: A, out: Ac }) , S.venn1({ name: 'A', inA: A, out: Ac })), w: W(T('Draw a rectangle for $\\xi$ and a circle inside it labelled $A$.', 'Lukis segi empat tepat bagi $\\xi$ dan satu bulatan berlabel $A$ di dalamnya.'), T(`Write the elements of $A$ inside the circle: $${A.join(',\\ ')}$`, `Tulis unsur $A$ di dalam bulatan: $${A.join(',\\ ')}$`), T(`Write the remaining elements of $\\xi$ outside the circle: $${Ac.join(',\\ ')}$`, `Tulis unsur $\\xi$ yang selebihnya di luar bulatan: $${Ac.join(',\\ ')}$`), T('Every element of $\\xi$ must appear exactly once.', 'Setiap unsur $\\xi$ mesti muncul tepat sekali.')), sp: 'l' };
    },
  ];
  const g114m = [
    (r) => {
      const N = r.pick([12, 16, 20]);
      const inner = range(1, N).filter((v) => v % 4 === 0), outerAll = range(1, N).filter((v) => v % 2 === 0);
      const mid = outerAll.filter((v) => v % 4 !== 0), out = range(1, N).filter((v) => v % 2 === 1);
      const fig = S.vennNested({ names: ['A', 'B'], inner, mid, out });
      return { q: T('Study the Venn diagram. (a) List the elements of $B$. (b) List the elements of $A$. (c) State $n(B\')$.', 'Perhatikan gambar rajah Venn. (a) Senaraikan unsur bagi $B$. (b) Senaraikan unsur bagi $A$. (c) Nyatakan $n(B\')$.'), fig, a: T(`(a) $${roster(outerAll)}$ (b) $${roster(inner)}$ (c) $${out.length}$`), w: W(T(`(a) $B$ is the big circle, so take both regions inside it: $B = ${roster(outerAll)}$`, `(a) $B$ ialah bulatan besar, jadi ambil kedua-dua kawasan di dalamnya: $B = ${roster(outerAll)}$`), T(`(b) $A$ is the inner circle only: $A = ${roster(inner)}$`, `(b) $A$ ialah bulatan dalam sahaja: $A = ${roster(inner)}$`), T(`(c) $B'$ is everything outside $B$: $${roster(out)}$`, `(c) $B'$ ialah semua yang di luar $B$: $${roster(out)}$`), T(`$n(B') = ${out.length}$`)), sp: 's' };
    },
    (r) => {
      const N = r.pick([12, 16, 20]);
      const inner = range(1, N).filter((v) => v % 4 === 0), outerAll = range(1, N).filter((v) => v % 2 === 0);
      const mid = outerAll.filter((v) => v % 4 !== 0), out = range(1, N).filter((v) => v % 2 === 1);
      const fig = S.vennNested({ names: ['A', 'B'], inner, mid, out });
      return { q: T(`$\\xi = ${roster(range(1, N))}$, $B = ${roster(outerAll)}$ and $A = ${roster(inner)}$. Draw a Venn diagram to show $A \\subseteq B \\subseteq \\xi$.`, `$\\xi = ${roster(range(1, N))}$, $B = ${roster(outerAll)}$ dan $A = ${roster(inner)}$. Lukis gambar rajah Venn untuk menunjukkan $A \\subseteq B \\subseteq \\xi$.`), a: T(fig, fig), w: W(T('$A \\subseteq B$, so draw circle $A$ completely inside circle $B$, and both inside the rectangle $\\xi$.', '$A \\subseteq B$, jadi lukis bulatan $A$ sepenuhnya di dalam bulatan $B$, dan kedua-duanya di dalam segi empat tepat $\\xi$.'), T(`Inside $A$: $${inner.join(',\\ ')}$`, `Di dalam $A$: $${inner.join(',\\ ')}$`), T(`Between the two circles (in $B$ but not in $A$): $${mid.join(',\\ ')}$`, `Antara dua bulatan (dalam $B$ tetapi bukan dalam $A$): $${mid.join(',\\ ')}$`), T(`Outside $B$: $${out.join(',\\ ')}$`, `Di luar $B$: $${out.join(',\\ ')}$`)), sp: 'l' };
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
      return { q: T(`$\\xi = \\{x : x \\text{ is an integer},\\ 1 \\le x \\le ${N}\\}$, $A = \\{\\text{multiples of } ${kA[0]}\\}$ and $B = \\{\\text{multiples of } ${kA[1]}\\}$. (a) Show that $A \\subseteq B$. (b) Draw a Venn diagram to represent $\\xi$, $A$ and $B$. (c) Find $n(B')$.`, `$\\xi = \\{x : x \\text{ ialah integer},\\ 1 \\le x \\le ${N}\\}$, $A = \\{\\text{gandaan } ${kA[0]}\\}$ dan $B = \\{\\text{gandaan } ${kA[1]}\\}$. (a) Tunjukkan bahawa $A \\subseteq B$. (b) Lukis gambar rajah Venn untuk mewakili $\\xi$, $A$ dan $B$. (c) Cari $n(B')$.`), a: T(`(a) $A = ${roster(A)}$, $B = ${roster(B)}$; every element of $A$ is in $B$. (b) ${fig} (c) $n(B') = ${out.length}$`, `(a) $A = ${roster(A)}$, $B = ${roster(B)}$; setiap unsur $A$ ada dalam $B$. (b) ${fig} (c) $n(B') = ${out.length}$`), w: W(T(`(a) $A = ${roster(A)}$ and $B = ${roster(B)}$.`, `(a) $A = ${roster(A)}$ dan $B = ${roster(B)}$.`), T(`Since $${kA[0]} = ${kA[0] / kA[1]} \\times ${kA[1]}$, every multiple of $${kA[0]}$ is also a multiple of $${kA[1]}$, so $A \\subseteq B$.`, `Oleh sebab $${kA[0]} = ${kA[0] / kA[1]} \\times ${kA[1]}$, setiap gandaan $${kA[0]}$ juga gandaan $${kA[1]}$, jadi $A \\subseteq B$.`), T('(b) Draw circle $A$ inside circle $B$, and both inside the rectangle $\\xi$.', '(b) Lukis bulatan $A$ di dalam bulatan $B$, dan kedua-duanya di dalam segi empat tepat $\\xi$.'), T(`(c) $n(\\xi) = ${N}$ and $n(B) = ${B.length}$, so $n(B') = ${N} - ${B.length} = ${out.length}$`)), sp: 'xl' };
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
      const iStat = order.findIndex((o) => o[1]);
      return { q: T(`Which of these is a statistical question? (A) ${order[0][0].en} (B) ${order[1][0].en}`, `Antara yang berikut, yang manakah soalan statistik? (A) ${order[0][0].ms} (B) ${order[1][0].ms}`), a: T(`(${'AB'[iStat]}) — it expects varying answers that can be answered with data.`, `(${'AB'[iStat]}) — ia menjangkakan jawapan yang berbeza-beza yang boleh dijawab dengan data.`), w: W(T('A statistical question expects answers that vary from one case to another, and needs data to answer it.', 'Soalan statistik menjangkakan jawapan yang berbeza-beza antara satu kes dengan kes lain, dan memerlukan data untuk menjawabnya.'), T(`(${'AB'[1 - iStat]}) has one fixed answer, so it is not a statistical question.`, `(${'AB'[1 - iStat]}) mempunyai satu jawapan tetap, jadi ia bukan soalan statistik.`), T(`(${'AB'[iStat]}) gives different answers for different people, so it is the statistical question.`, `(${'AB'[iStat]}) memberikan jawapan berbeza bagi orang yang berbeza, jadi itulah soalan statistik.`)), sp: 's' };
    },
    (r) => {
      const bank = [
        [T('the number of siblings a student has', 'bilangan adik-beradik seorang murid'), T('numerical, discrete', 'berangka, diskret'), T('it is a count, so only whole numbers are possible', 'ia satu bilangan, jadi hanya nombor bulat yang mungkin')],
        [T('the height of a student', 'ketinggian seorang murid'), T('numerical, continuous', 'berangka, selanjar'), T('it is measured and can take any value in a range', 'ia diukur dan boleh mengambil sebarang nilai dalam satu julat')],
        [T('the favourite colour of a student', 'warna kegemaran seorang murid'), T('categorical', 'kategori'), T('the answer is a label, not a number', 'jawapannya ialah label, bukan nombor')],
        [T('the time taken to run 100 m', 'masa yang diambil untuk berlari 100 m'), T('numerical, continuous', 'berangka, selanjar'), T('it is measured and can take any value in a range', 'ia diukur dan boleh mengambil sebarang nilai dalam satu julat')],
        [T('the number of goals scored in a match', 'bilangan gol yang dijaringkan dalam satu perlawanan'), T('numerical, discrete', 'berangka, diskret'), T('it is a count, so only whole numbers are possible', 'ia satu bilangan, jadi hanya nombor bulat yang mungkin')],
        [T('the type of transport used to go to school', 'jenis pengangkutan untuk ke sekolah'), T('categorical', 'kategori'), T('the answer is a label, not a number', 'jawapannya ialah label, bukan nombor')],
      ];
      const it = r.pick(bank);
      return { q: T(`Classify the variable "${it[0].en}" as categorical or numerical. If it is numerical, state whether it is discrete or continuous.`, `Kelaskan pemboleh ubah "${it[0].ms}" sebagai kategori atau berangka. Jika berangka, nyatakan sama ada ia diskret atau selanjar.`), a: it[1], w: W(T('First ask: is the answer a label (categorical) or a number (numerical)?', 'Tanya dahulu: adakah jawapannya satu label (kategori) atau satu nombor (berangka)?'), T('If it is a number, ask whether it is counted (discrete) or measured (continuous).', 'Jika ia nombor, tanya sama ada ia dibilang (diskret) atau diukur (selanjar).'), T(`Here ${it[2].en}.`, `Di sini ${it[2].ms}.`), T(`So the variable is ${it[1].en}.`, `Jadi pemboleh ubah itu ialah ${it[1].ms}.`)), sp: 's' };
    },
    (r) => {
      const st = [T('Formulate a statistical question', 'Merumus soalan statistik'), T('Collect data', 'Mengumpul data'), T('Organise and represent the data', 'Menyusun dan mewakilkan data'), T('Analyse and interpret', 'Menganalisis dan mentafsir'), T('Infer and predict', 'Membuat inferens dan ramalan'), T('Communicate the findings', 'Berkomunikasi dapatan')];
      const ord = r.shuffle(range(0, 5));
      const L = 'ABCDEF';
      return { q: T(`The stages of a statistical inquiry are listed in the wrong order: ${ord.map((o, i) => `(${L[i]}) ${st[o].en}`).join('; ')}. Write the letters in the correct order.`, `Peringkat sesuatu inkuiri statistik disenaraikan dengan susunan yang salah: ${ord.map((o, i) => `(${L[i]}) ${st[o].ms}`).join('; ')}. Tulis huruf-huruf itu mengikut susunan yang betul.`), a: T(range(0, 5).map((k) => L[ord.indexOf(k)]).join(' → ')), w: W(T('A statistical inquiry always runs in the same order: formulate a question, collect data, organise and represent it, analyse and interpret, infer and predict, communicate the findings.', 'Inkuiri statistik sentiasa mengikut susunan yang sama: merumus soalan, mengumpul data, menyusun dan mewakilkannya, menganalisis dan mentafsir, membuat inferens dan ramalan, berkomunikasi dapatan.'), T(`Match each stage to its letter: ${range(0, 5).map((k) => `${st[k].en} = (${L[ord.indexOf(k)]})`).join('; ')}`, `Padankan setiap peringkat dengan hurufnya: ${range(0, 5).map((k) => `${st[k].ms} = (${L[ord.indexOf(k)]})`).join('; ')}`), T(`Correct order: ${range(0, 5).map((k) => L[ord.indexOf(k)]).join(' → ')}`, `Susunan yang betul: ${range(0, 5).map((k) => L[ord.indexOf(k)]).join(' → ')}`)), sp: 's' };
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
      return { q: T(`Explain why the survey question "${it[0].en}" is not a good statistical question, and rewrite it in a neutral form.`, `Terangkan mengapa soalan tinjauan "${it[0].ms}" bukan soalan statistik yang baik, dan tulis semula dalam bentuk neutral.`), a: T(`It is a leading question: it pushes respondents towards one answer. Neutral version: ${it[1].en}`, `Ia soalan yang mengarahkan: ia mendorong responden kepada satu jawapan. Versi neutral: ${it[1].ms}`), w: W(T('A good survey question must not suggest an answer, and should offer clear options that do not overlap.', 'Soalan tinjauan yang baik tidak boleh mencadangkan jawapan, dan patut menawarkan pilihan yang jelas dan tidak bertindih.'), T('This one already states an opinion, so respondents are pushed towards agreeing — the data collected would be biased.', 'Soalan ini sudah menyatakan pendapat, jadi responden didorong untuk bersetuju — data yang dikumpul akan berat sebelah.'), T(`Rewrite it neutrally: ${it[1].en}`, `Tulis semula secara neutral: ${it[1].ms}`)), sp: 'm' };
    },
    (r) => {
      const bank = [
        [T('What is the most common way Form 1 students in our school travel to school?', 'Apakah cara yang paling biasa murid Tingkatan 1 di sekolah kita ke sekolah?'), T('all Form 1 students in the school', 'semua murid Tingkatan 1 di sekolah'), T('mode of transport (categorical)', 'cara pengangkutan (kategori)'), T('a survey (questionnaire)', 'tinjauan (soal selidik)')],
        [T('How long do students in Form 2 sleep on a school night?', 'Berapa lamakah murid Tingkatan 2 tidur pada malam persekolahan?'), T('Form 2 students', 'murid Tingkatan 2'), T('hours of sleep (numerical, continuous)', 'jam tidur (berangka, selanjar)'), T('a survey (questionnaire)', 'tinjauan (soal selidik)')],
        [T('How many goals are scored per match in the school football league?', 'Berapakah bilangan gol yang dijaringkan bagi setiap perlawanan dalam liga bola sepak sekolah?'), T('all matches in the league', 'semua perlawanan dalam liga'), T('goals per match (numerical, discrete)', 'gol setiap perlawanan (berangka, diskret)'), T('observation and counting', 'pemerhatian dan pengiraan')],
      ];
      const it = r.pick(bank);
      return { q: T(`For the statistical question "${it[0].en}", state (a) the population or group, (b) the variable and its type, (c) a suitable method of data collection.`, `Bagi soalan statistik "${it[0].ms}", nyatakan (a) populasi atau kumpulan, (b) pemboleh ubah dan jenisnya, (c) kaedah pengumpulan data yang sesuai.`), a: T(`(a) ${it[1].en} (b) ${it[2].en} (c) ${it[3].en}`, `(a) ${it[1].ms} (b) ${it[2].ms} (c) ${it[3].ms}`), w: W(T(`(a) The population is the whole group the question is about: ${it[1].en}.`, `(a) Populasi ialah keseluruhan kumpulan yang dibincangkan oleh soalan itu: ${it[1].ms}.`), T(`(b) The variable is what is recorded for each member: ${it[2].en}.`, `(b) Pemboleh ubah ialah apa yang dicatat bagi setiap ahli: ${it[2].ms}.`), T(`(c) Choose a method that can reach the whole group: ${it[3].en}.`, `(c) Pilih kaedah yang dapat menjangkau seluruh kumpulan itu: ${it[3].ms}.`)), sp: 'm' };
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
      return { q: T(`Plan a statistical inquiry about ${t[0].en}. State (a) a statistical question, (b) the population and how you would choose a sample, (c) the variable and its type, (d) how you would collect the data, (e) a suitable representation and why, (f) one possible source of bias and how to reduce it.`, `Rancang satu inkuiri statistik tentang ${t[0].ms}. Nyatakan (a) soalan statistik, (b) populasi dan cara anda memilih sampel, (c) pemboleh ubah dan jenisnya, (d) cara anda mengumpul data, (e) perwakilan yang sesuai dan sebabnya, (f) satu punca bias yang mungkin dan cara mengurangkannya.`), a: T(`Sample answer: (a) a question that expects varying answers about ${t[0].en}; (b) all students of the group, using a random sample from every class list; (c) ${t[1].en}; (d) a short neutral questionnaire; (e) ${t[2].en}, because it shows the distribution clearly; (f) sampling only friends — reduce by random selection.`, `Contoh jawapan: (a) soalan yang menjangkakan jawapan berbeza tentang ${t[0].ms}; (b) semua murid dalam kumpulan itu, menggunakan sampel rawak daripada setiap senarai kelas; (c) ${t[1].ms}; (d) soal selidik ringkas yang neutral; (e) ${t[2].ms}, kerana ia menunjukkan taburan dengan jelas; (f) hanya memilih kawan — dikurangkan dengan pemilihan rawak.`), w: W(T('Work through the six stages of a statistical inquiry in order.', 'Ikut enam peringkat inkuiri statistik mengikut turutan.'), T('(a) The question must expect varying answers, not one fixed fact.', '(a) Soalan itu mesti menjangkakan jawapan yang berbeza-beza, bukan satu fakta tetap.'), T('(b) Name the whole group, then say how a fair (random) sample is taken from it.', '(b) Nyatakan keseluruhan kumpulan, kemudian nyatakan cara sampel yang adil (rawak) diambil daripadanya.'), T(`(c)–(d) The variable recorded is ${t[1].en}; a short neutral questionnaire collects it.`, `(c)–(d) Pemboleh ubah yang dicatat ialah ${t[1].ms}; soal selidik ringkas yang neutral mengumpulnya.`), T(`(e) Match the representation to the variable: ${t[2].en}.`, `(e) Padankan perwakilan dengan pemboleh ubah itu: ${t[2].ms}.`), T('(f) Bias appears when the sample does not represent the population; random selection reduces it.', '(f) Bias timbul apabila sampel tidak mewakili populasi; pemilihan rawak mengurangkannya.')), sp: 'xxl' };
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
      return { q: T(`The number of books read by 20 students last month were: ${vals.join(', ')}. Complete the frequency table.<br>${tab('en')}`, `Bilangan buku yang dibaca oleh 20 orang murid bulan lepas ialah: ${vals.join(', ')}. Lengkapkan jadual kekerapan.<br>${tab('ms')}`), a: T(`Frequencies: ${range(1, k).map((v, i) => `${v} → ${cnt[i]}`).join('; ')} (total 20)`, `Kekerapan: ${range(1, k).map((v, i) => `${v} → ${cnt[i]}`).join('; ')} (jumlah 20)`), w: W(T('Go through the list once, putting a tally mark in the row of each value.', 'Teliti senarai itu sekali sahaja, dengan meletakkan satu tanda tally pada baris bagi setiap nilai.'), T(`Count the tally marks: ${range(1, k).map((v, i) => `${v} → ${cnt[i]}`).join('; ')}`, `Bilang tanda tally: ${range(1, k).map((v, i) => `${v} → ${cnt[i]}`).join('; ')}`), T(`Check the total: $${cnt.join(' + ')} = 20$, the number of students.`, `Semak jumlahnya: $${cnt.join(' + ')} = 20$, iaitu bilangan murid.`)), sp: 's' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([20, 30, 40]));
      const mx = Math.max(...d.f), { ystep, ymax } = yMax(mx);
      const fig = dual((lang) => S.bar({ cats: catsOf(d, lang), vals: d.f, ymax, ystep, ylabel: lang === 'en' ? 'Frequency' : 'Kekerapan', xlabel: d.ctx.name[lang], w: 330, h: 200 }));
      const maxI = d.f.indexOf(mx), minI = d.f.indexOf(Math.min(...d.f));
      return { q: T('The bar chart shows the results of a survey. (a) Which category is the most popular? (b) How many were surveyed altogether? (c) How many more chose the most popular than the least popular?', 'Carta palang menunjukkan keputusan satu tinjauan. (a) Kategori manakah yang paling popular? (b) Berapakah jumlah yang ditinjau? (c) Berapa lebih ramai yang memilih kategori paling popular berbanding yang paling kurang popular?'), fig, a: T(`(a) ${d.cats[maxI].en} (b) ${d.total} (c) ${mx - d.f[minI]}`, `(a) ${d.cats[maxI].ms} (b) ${d.total} (c) ${mx - d.f[minI]}`), w: W(T(`(a) The tallest bar is ${d.cats[maxI].en}, with a frequency of $${mx}$.`, `(a) Palang tertinggi ialah ${d.cats[maxI].ms}, dengan kekerapan $${mx}$.`), T(`(b) Add the heights of all the bars: $${d.f.join(' + ')} = ${d.total}$`, `(b) Tambah ketinggian semua palang: $${d.f.join(' + ')} = ${d.total}$`), T(`(c) The shortest bar is ${d.cats[minI].en} with $${d.f[minI]}$, so the difference is $${mx} - ${d.f[minI]} = ${mx - d.f[minI]}$.`, `(c) Palang terendah ialah ${d.cats[minI].ms} dengan $${d.f[minI]}$, jadi bezanya ialah $${mx} - ${d.f[minI]} = ${mx - d.f[minI]}$.`)), sp: 's' };
    },
    (r) => {
      const vals = Array.from({ length: r.int(12, 16) }, () => r.int(1, 6));
      const fig = dotPlot(vals, 1, 6);
      const cnt = range(1, 6).map((v) => vals.filter((x) => x === v).length);
      const mx = Math.max(...cnt);
      return { q: T('The dot plot shows the number of pets owned by some students. How many students are there altogether? Which number of pets is the most common?', 'Plot titik menunjukkan bilangan haiwan peliharaan yang dimiliki oleh beberapa orang murid. Berapakah jumlah murid? Bilangan haiwan peliharaan yang manakah paling biasa?'), fig, a: T(`${vals.length} students; most common: ${cnt.indexOf(mx) + 1} pet(s)`, `${vals.length} orang murid; paling biasa: ${cnt.indexOf(mx) + 1} ekor`), w: W(T('Each dot stands for one student, so count the dots column by column.', 'Setiap titik mewakili seorang murid, jadi bilang titik lajur demi lajur.'), T(`$${cnt.join(' + ')} = ${vals.length}$ students altogether.`, `$${cnt.join(' + ')} = ${vals.length}$ orang murid kesemuanya.`), T(`The tallest column stands over $${cnt.indexOf(mx) + 1}$ with $${mx}$ dots, so that is the most common number of pets.`, `Lajur tertinggi berada di atas $${cnt.indexOf(mx) + 1}$ dengan $${mx}$ titik, jadi itulah bilangan haiwan peliharaan yang paling biasa.`)), sp: 's' };
    },
    (r) => {
      const vals = Array.from({ length: r.int(11, 15) }, () => r.int(21, 58));
      const sl = { en: stemLeaf(vals, 'en'), ms: stemLeaf(vals, 'ms') };
      const mx = Math.max(...vals), mn = Math.min(...vals);
      return { q: T(`The stem-and-leaf plot shows the marks of some students in a quiz.<br>${sl.en.html}<br>Find (a) the highest mark, (b) the lowest mark, (c) the number of students.`, `Plot batang dan daun menunjukkan markah beberapa orang murid dalam satu kuiz.<br>${sl.ms.html}<br>Cari (a) markah tertinggi, (b) markah terendah, (c) bilangan murid.`), a: T(`(a) ${mx} (b) ${mn} (c) ${vals.length}`), w: W(T('A stem is the tens digit and a leaf is the ones digit, so read stem and leaf together.', 'Batang ialah digit puluh dan daun ialah digit sa, jadi baca batang dan daun bersama-sama.'), T(`(a) The last leaf on the bottom stem gives the highest mark: $${mx}$`, `(a) Daun terakhir pada batang paling bawah memberikan markah tertinggi: $${mx}$`), T(`(b) The first leaf on the top stem gives the lowest mark: $${mn}$`, `(b) Daun pertama pada batang paling atas memberikan markah terendah: $${mn}$`), T(`(c) Count every leaf, not every stem: $${vals.length}$ students.`, `(c) Bilang setiap daun, bukan setiap batang: $${vals.length}$ orang murid.`)), sp: 's' };
    },
  ];
  const g122m = [
    (r) => {
      const d = catData(r, 4, r.pick([24, 30, 36, 40, 60]));
      const ang = d.f.map((v) => (v * 360) / d.total);
      const tab = dual((lang) => freqTable(d, lang));
      return { q: T(`The table shows the results of a survey of ${d.total} students. Calculate the angle of each sector needed to draw a pie chart.<br>${tab.en}`, `Jadual menunjukkan keputusan tinjauan terhadap ${d.total} orang murid. Hitung sudut bagi setiap sektor yang diperlukan untuk melukis carta pai.<br>${tab.ms}`), a: T(d.cats.map((c, i) => `${c.en}: ${n(ang[i])}°`).join('; '), d.cats.map((c, i) => `${c.ms}: ${n(ang[i])}°`).join('; ')), w: W(T(`The whole circle, $360^\\circ$, stands for all ${d.total} students.`, `Seluruh bulatan, $360^\\circ$, mewakili kesemua ${d.total} orang murid.`), T(`$\\text{angle} = \\dfrac{f}{${d.total}} \\times 360^\\circ$`, `$\\text{sudut} = \\dfrac{f}{${d.total}} \\times 360^\\circ$`), T(d.cats.map((c, i) => `${c.en}: $\\dfrac{${d.f[i]}}{${d.total}} \\times 360^\\circ = ${n(ang[i])}^\\circ$`).join('; '), d.cats.map((c, i) => `${c.ms}: $\\dfrac{${d.f[i]}}{${d.total}} \\times 360^\\circ = ${n(ang[i])}^\\circ$`).join('; ')), T(`Check: $${ang.map((a) => n(a)).join(' + ')} = 360$`, `Semak: $${ang.map((a) => n(a)).join(' + ')} = 360$`)), sp: 'm' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([24, 30, 36, 40, 60]));
      const fig = dual((lang) => S.pie({ slices: d.f.map((v, i) => ({ v, label: d.cats[i][lang] })), showValues: true, r: 66 }));
      return { q: T('The pie chart shows the frequency of each category in a survey. Complete a frequency table and find the total frequency, and the angle of the largest sector.', 'Carta pai menunjukkan kekerapan bagi setiap kategori dalam satu tinjauan. Lengkapkan jadual kekerapan dan cari jumlah kekerapan, dan sudut bagi sektor yang terbesar.'), fig, a: T(`${d.cats.map((c, i) => `${c.en}: ${d.f[i]}`).join('; ')}; total ${d.total}; largest sector ${n(round((Math.max(...d.f) * 360) / d.total, 1))}°`, `${d.cats.map((c, i) => `${c.ms}: ${d.f[i]}`).join('; ')}; jumlah ${d.total}; sektor terbesar ${n(round((Math.max(...d.f) * 360) / d.total, 1))}°`), w: W(T(`Read the frequency written in each sector: ${d.cats.map((c, i) => `${c.en} ${d.f[i]}`).join(', ')}.`, `Baca kekerapan yang tertulis pada setiap sektor: ${d.cats.map((c, i) => `${c.ms} ${d.f[i]}`).join(', ')}.`), T(`Total frequency $= ${d.f.join(' + ')} = ${d.total}$`, `Jumlah kekerapan $= ${d.f.join(' + ')} = ${d.total}$`), T(`Largest sector: $\\dfrac{${Math.max(...d.f)}}{${d.total}} \\times 360^\\circ = ${n(round((Math.max(...d.f) * 360) / d.total, 1))}^\\circ$`, `Sektor terbesar: $\\dfrac{${Math.max(...d.f)}}{${d.total}} \\times 360^\\circ = ${n(round((Math.max(...d.f) * 360) / d.total, 1))}^\\circ$`)), sp: 'm' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([20, 30, 40]));
      const mx = Math.max(...d.f), { ystep, ymax } = yMax(mx);
      const fig = dual((lang) => S.bar({ cats: catsOf(d, lang), vals: d.f, ymax, ystep, ylabel: lang === 'en' ? 'Frequency' : 'Kekerapan', xlabel: d.ctx.name[lang], w: 330, h: 200 }));
      return { q: T('Draw up a frequency table for the data shown in the bar chart, and state the total frequency.', 'Bina jadual kekerapan bagi data yang ditunjukkan dalam carta palang, dan nyatakan jumlah kekerapan.'), fig, a: T(`${d.cats.map((c, i) => `${c.en}: ${d.f[i]}`).join('; ')}; total ${d.total}`, `${d.cats.map((c, i) => `${c.ms}: ${d.f[i]}`).join('; ')}; jumlah ${d.total}`), w: W(T('Read the height of each bar against the frequency axis and write it in a table.', 'Baca ketinggian setiap palang pada paksi kekerapan dan tulisnya dalam jadual.'), T(`${d.cats.map((c, i) => `${c.en}: ${d.f[i]}`).join('; ')}`, `${d.cats.map((c, i) => `${c.ms}: ${d.f[i]}`).join('; ')}`), T(`Total frequency $= ${d.f.join(' + ')} = ${d.total}$`, `Jumlah kekerapan $= ${d.f.join(' + ')} = ${d.total}$`)), sp: 'm' };
    },
    (r) => {
      const vals = Array.from({ length: r.int(12, 16) }, () => r.int(21, 58));
      const sl = stemLeaf(vals, 'en');
      const sm = stemLeaf(vals, 'ms');
      return { q: T(`Construct an ordered stem-and-leaf plot for these marks, with a key: ${vals.join(', ')}.`, `Bina plot batang dan daun tertib bagi markah ini, dengan kunci: ${vals.join(', ')}.`), a: T(sl.html, sm.html), w: W(T(`Sort the marks first: $${sl.sorted.join(',\\ ')}$`, `Susun markah dahulu: $${sl.sorted.join(',\\ ')}$`), T('Use the tens digit as the stem and the ones digit as the leaf.', 'Gunakan digit puluh sebagai batang dan digit sa sebagai daun.'), T('Write each stem once, in order, then its leaves in ascending order.', 'Tulis setiap batang sekali sahaja, mengikut tertib, kemudian daunnya mengikut tertib menaik.'), T(`Add a key, e.g. $${Math.floor(sl.sorted[0] / 10)} \\mid ${sl.sorted[0] % 10}$ means $${sl.sorted[0]}$.`, `Sertakan kunci, cth. $${Math.floor(sl.sorted[0] / 10)} \\mid ${sl.sorted[0] % 10}$ bermaksud $${sl.sorted[0]}$.`)), sp: 'l' };
    },
  ];
  const g122a = [
    (r) => {
      const d = catData(r, 4, r.pick([24, 30, 36, 40, 60]));
      const ang = d.f.map((v) => (v * 360) / d.total);
      const hide = r.int(0, 3);
      const known = d.f.map((v, i) => (i === hide ? null : v));
      const others = ang.map((a, i) => (i === hide ? '?' : `${n(a)}°`));
      return { q: T(`A survey of ${d.total} students on "${d.ctx.name.en}" is shown in a pie chart. The sector angles are: ${d.cats.map((c, i) => `${c.en} ${others[i]}`).join(', ')}. Find the number of students for each category and check that the total is ${d.total}.`, `Satu tinjauan terhadap ${d.total} orang murid tentang "${d.ctx.name.ms}" ditunjukkan dalam carta pai. Sudut sektor ialah: ${d.cats.map((c, i) => `${c.ms} ${others[i]}`).join(', ')}. Cari bilangan murid bagi setiap kategori dan semak bahawa jumlahnya ialah ${d.total}.`), a: T(`${d.cats.map((c, i) => `${c.en}: ${d.f[i]}`).join('; ')} (unknown sector $= 360 - $ the others $= ${n(ang[hide])}^\\circ$)`, `${d.cats.map((c, i) => `${c.ms}: ${d.f[i]}`).join('; ')} (sektor tidak diketahui $= 360 - $ yang lain $= ${n(ang[hide])}^\\circ$)`), w: W(T(`The sector angles add up to $360^\\circ$, so the unknown one is $360^\\circ - (${ang.filter((a, i) => i !== hide).map((a) => n(a) + '^\\circ').join(' + ')}) = ${n(ang[hide])}^\\circ$.`, `Jumlah sudut sektor ialah $360^\\circ$, jadi sudut yang tidak diketahui ialah $360^\\circ - (${ang.filter((a, i) => i !== hide).map((a) => n(a) + '^\\circ').join(' + ')}) = ${n(ang[hide])}^\\circ$.`), T(`One student takes up $\\dfrac{360^\\circ}{${d.total}} = ${n(360 / d.total)}^\\circ$.`, `Seorang murid mengambil $\\dfrac{360^\\circ}{${d.total}} = ${n(360 / d.total)}^\\circ$.`), T(`$\\text{number} = \\dfrac{\\text{angle}}{${n(360 / d.total)}^\\circ}$: ${d.cats.map((c, i) => `${c.en} ${d.f[i]}`).join(', ')}`, `$\\text{bilangan} = \\dfrac{\\text{sudut}}{${n(360 / d.total)}^\\circ}$: ${d.cats.map((c, i) => `${c.ms} ${d.f[i]}`).join(', ')}`), T(`Check: $${d.f.join(' + ')} = ${d.total}$`, `Semak: $${d.f.join(' + ')} = ${d.total}$`)), sp: 'm' };
    },
    (r) => {
      const k = 4;
      const vals = Array.from({ length: 20 }, () => r.int(1, k));
      const cnt = range(1, k).map((v) => vals.filter((x) => x === v).length);
      need(cnt.every((c) => c >= 2));
      const ang = cnt.map((c) => c * 18);
      return { q: T(`The number of siblings of 20 students: ${vals.join(', ')}. (a) Construct a frequency table. (b) Calculate the pie chart angle for each value. (c) State which representation would show the shape of the distribution better, a pie chart or a dot plot, and why.`, `Bilangan adik-beradik bagi 20 orang murid: ${vals.join(', ')}. (a) Bina jadual kekerapan. (b) Hitung sudut carta pai bagi setiap nilai. (c) Nyatakan perwakilan yang menunjukkan bentuk taburan dengan lebih baik, carta pai atau plot titik, dan sebabnya.`), a: T(`(a) ${range(1, k).map((v, i) => `${v}: ${cnt[i]}`).join('; ')} (b) ${ang.map((a) => a + '°').join(', ')} (c) A dot plot: it keeps each value and shows the shape; a pie chart shows only parts of the whole.`, `(a) ${range(1, k).map((v, i) => `${v}: ${cnt[i]}`).join('; ')} (b) ${ang.map((a) => a + '°').join(', ')} (c) Plot titik: ia mengekalkan setiap nilai dan menunjukkan bentuk taburan; carta pai hanya menunjukkan bahagian daripada keseluruhan.`), w: W(T(`(a) Tally the 20 values: ${range(1, k).map((v, i) => `${v} → ${cnt[i]}`).join('; ')}`, `(a) Buat tally bagi 20 nilai itu: ${range(1, k).map((v, i) => `${v} → ${cnt[i]}`).join('; ')}`), T(`(b) One student is $\\dfrac{360^\\circ}{20} = 18^\\circ$, so $\\text{angle} = 18^\\circ \\times f$.`, `(b) Seorang murid ialah $\\dfrac{360^\\circ}{20} = 18^\\circ$, jadi $\\text{sudut} = 18^\\circ \\times f$.`), T(range(1, k).map((v, i) => `$18^\\circ \\times ${cnt[i]} = ${ang[i]}^\\circ$`).join('; '), range(1, k).map((v, i) => `$18^\\circ \\times ${cnt[i]} = ${ang[i]}^\\circ$`).join('; ')), T(`Check: $${ang.join(' + ')} = 360$`, `Semak: $${ang.join(' + ')} = 360$`), T('(c) A dot plot keeps every value and shows the shape of the distribution; a pie chart only compares parts of a whole.', '(c) Plot titik mengekalkan setiap nilai dan menunjukkan bentuk taburan; carta pai hanya membandingkan bahagian daripada keseluruhan.')), sp: 'xl' };
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
      return { q: T(`Which representation is most suitable to ${p[0].en}: bar chart, pie chart, line graph, histogram or dot plot?`, `Perwakilan manakah yang paling sesuai untuk ${p[0].ms}: carta palang, carta pai, graf garis, histogram atau plot titik?`), a: T(`${p[1].en}: ${p[2].en}.`, `${p[1].ms}: ${p[2].ms}.`), w: W(T(`Ask what the data looks like and what has to be shown: here the aim is to ${p[0].en}.`, `Tanya bagaimana bentuk data dan apa yang perlu ditunjukkan: di sini tujuannya ialah ${p[0].ms}.`), T(`Choose the ${p[1].en}, because ${p[2].en}.`, `Pilih ${p[1].ms}, kerana ${p[2].ms}.`)), sp: 's' };
    },
    (r) => {
      const d = catData(r, 4, r.pick([30, 40, 60]));
      const ang = d.f.map((v) => (v * 360) / d.total);
      const fig = dual((lang) => S.pie({ slices: d.f.map((v, i) => ({ v, label: d.cats[i][lang] })), showAngles: true, r: 64 }));
      const i = r.int(0, 3);
      return { q: T(`The pie chart shows the choices of ${d.total} students on "${d.ctx.name.en}". How many students chose ${d.cats[i].en}?`, `Carta pai menunjukkan pilihan ${d.total} orang murid tentang "${d.ctx.name.ms}". Berapakah bilangan murid yang memilih ${d.cats[i].ms}?`), fig, a: T(`${d.f[i]} students`, `${d.f[i]} orang murid`), w: W(T(`The whole circle, $360^\\circ$, stands for all ${d.total} students.`, `Seluruh bulatan, $360^\\circ$, mewakili kesemua ${d.total} orang murid.`), T(`$\\text{number} = \\dfrac{\\text{angle}}{360^\\circ} \\times ${d.total}$`, `$\\text{bilangan} = \\dfrac{\\text{sudut}}{360^\\circ} \\times ${d.total}$`), T(`$= \\dfrac{${n(ang[i])}}{360} \\times ${d.total} = ${d.f[i]}$ students`, `$= \\dfrac{${n(ang[i])}}{360} \\times ${d.total} = ${d.f[i]}$ orang murid`)), sp: 's' };
    },
  ];
  const g123m = [
    (r) => {
      const k = r.int(5, 6), vals = range(0, k - 1);
      const freq = vals.map(() => r.int(2, 9));
      const fig = dual((lang) => hist(vals, freq, lang, lang === 'en' ? 'Frequency' : 'Kekerapan', lang === 'en' ? 'Number of siblings' : 'Bilangan adik-beradik'));
      return { q: T('The histogram shows the number of siblings of a group of students. Complete the frequency table from the histogram and find the total number of students.', 'Histogram menunjukkan bilangan adik-beradik bagi sekumpulan murid. Lengkapkan jadual kekerapan daripada histogram dan cari jumlah bilangan murid.'), fig, a: T(`${vals.map((v, i) => `${v}: ${freq[i]}`).join('; ')}; total ${sum(freq)}`, `${vals.map((v, i) => `${v}: ${freq[i]}`).join('; ')}; jumlah ${sum(freq)}`), w: W(T('In a histogram the height of each bar is the frequency of that value.', 'Dalam histogram, ketinggian setiap palang ialah kekerapan bagi nilai itu.'), T(`Read the heights off the vertical axis: ${vals.map((v, i) => `${v}: ${freq[i]}`).join('; ')}`, `Baca ketinggiannya pada paksi mencancang: ${vals.map((v, i) => `${v}: ${freq[i]}`).join('; ')}`), T(`Total $= ${freq.join(' + ')} = ${sum(freq)}$ students`, `Jumlah $= ${freq.join(' + ')} = ${sum(freq)}$ orang murid`)), sp: 'm' };
    },
    (r) => {
      const k = r.int(5, 6), vals = range(0, k - 1);
      const freq = vals.map(() => r.int(2, 9));
      const rows = (lang) => SPM.table([[lang === 'en' ? 'Frequency' : 'Kekerapan', ...freq]], { head: [lang === 'en' ? 'Number of pets' : 'Bilangan haiwan', ...vals] });
      return { q: T(`The table shows the number of pets owned by some students.<br>${rows('en')}<br>Write down the coordinates of the points needed to draw a frequency polygon (include the points on the horizontal axis at each end).`, `Jadual menunjukkan bilangan haiwan peliharaan yang dimiliki oleh beberapa orang murid.<br>${rows('ms')}<br>Tuliskan koordinat titik yang diperlukan untuk melukis poligon kekerapan (termasuk titik pada paksi mengufuk di setiap hujung).`), a: T(`$${[[vals[0] - 1, 0], ...vals.map((v, i) => [v, freq[i]]), [vals[k - 1] + 1, 0]].map((p) => `(${p[0]}, ${p[1]})`).join(', ')}$`), w: W(T('Each point of a frequency polygon is (value, frequency).', 'Setiap titik poligon kekerapan ialah (nilai, kekerapan).'), T(`From the table: $${vals.map((v, i) => `(${v}, ${freq[i]})`).join(', ')}$`, `Daripada jadual: $${vals.map((v, i) => `(${v}, ${freq[i]})`).join(', ')}$`), T(`The polygon must close on the horizontal axis, so add one point of frequency $0$ one step outside each end: $(${vals[0] - 1}, 0)$ and $(${vals[k - 1] + 1}, 0)$.`, `Poligon itu mesti ditutup pada paksi mengufuk, jadi tambah satu titik berkekerapan $0$ satu langkah di luar setiap hujung: $(${vals[0] - 1}, 0)$ dan $(${vals[k - 1] + 1}, 0)$.`), T(`All the points: $${[[vals[0] - 1, 0], ...vals.map((v, i) => [v, freq[i]]), [vals[k - 1] + 1, 0]].map((p) => `(${p[0]}, ${p[1]})`).join(', ')}$`, `Semua titik: $${[[vals[0] - 1, 0], ...vals.map((v, i) => [v, freq[i]]), [vals[k - 1] + 1, 0]].map((p) => `(${p[0]}, ${p[1]})`).join(', ')}$`)), sp: 'm' };
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
    return { q: T('Both graphs show the same distribution of goals scored per match. (a) Write the frequency table and the total. (b) State one difference in how a histogram and a frequency polygon are drawn. (c) Which graph would you choose to compare this distribution with another team\'s, and why?', 'Kedua-dua graf menunjukkan taburan yang sama bagi gol yang dijaringkan setiap perlawanan. (a) Tulis jadual kekerapan dan jumlahnya. (b) Nyatakan satu perbezaan cara histogram dan poligon kekerapan dilukis. (c) Graf manakah yang akan anda pilih untuk membandingkan taburan ini dengan pasukan lain, dan mengapa?'), fig: figs, a: T(`(a) ${vals.map((v, i) => `${v}: ${freq[i]}`).join('; ')}; total ${sum(freq)} (b) A histogram uses touching bars; a frequency polygon joins points plotted at each value, with zero-frequency points at both ends. (c) The frequency polygon: two polygons can be drawn on the same axes and compared easily.`, `(a) ${vals.map((v, i) => `${v}: ${freq[i]}`).join('; ')}; jumlah ${sum(freq)} (b) Histogram menggunakan palang yang bersentuhan; poligon kekerapan menyambungkan titik pada setiap nilai, dengan titik kekerapan sifar di kedua-dua hujung. (c) Poligon kekerapan: dua poligon boleh dilukis pada paksi yang sama dan dibandingkan dengan mudah.`), w: W(T(`(a) Read the bar heights: ${vals.map((v, i) => `${v}: ${freq[i]}`).join('; ')}`, `(a) Baca ketinggian palang: ${vals.map((v, i) => `${v}: ${freq[i]}`).join('; ')}`), T(`Total $= ${freq.join(' + ')} = ${sum(freq)}$ matches`, `Jumlah $= ${freq.join(' + ')} = ${sum(freq)}$ perlawanan`), T('(b) A histogram uses bars that touch each other; a frequency polygon plots one point at each value and joins them, ending at zero frequency on both sides.', '(b) Histogram menggunakan palang yang bersentuhan; poligon kekerapan memplot satu titik pada setiap nilai dan menyambungkannya, berakhir pada kekerapan sifar di kedua-dua belah.'), T('(c) The frequency polygon: two polygons can be drawn on the same axes and still be read, while two sets of bars would overlap.', '(c) Poligon kekerapan: dua poligon boleh dilukis pada paksi yang sama dan masih boleh dibaca, manakala dua set palang akan bertindih.')), sp: 'l' };
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
      return { q: T(`The line graph shows the ${s.name.en} for the first ${months} months of the year. State (a) the month with the highest value and the value, (b) the month with the lowest value, (c) the total for the ${months} months.`, `Graf garis menunjukkan ${s.name.ms} bagi ${months} bulan pertama tahun itu. Nyatakan (a) bulan dengan nilai tertinggi dan nilainya, (b) bulan dengan nilai terendah, (c) jumlah bagi ${months} bulan.`), fig, a: T(`(a) ${MONTHS.en[mi]}: ${vals[mi]} (b) ${MONTHS.en[lo]} (c) ${sum(vals)}`, `(a) ${MONTHS.ms[mi]}: ${vals[mi]} (b) ${MONTHS.ms[lo]} (c) ${sum(vals)}`), w: W(T(`(a) The highest point is above ${MONTHS.en[mi]}; read across to the vertical axis: $${vals[mi]}$.`, `(a) Titik tertinggi berada di atas ${MONTHS.ms[mi]}; baca melintang ke paksi mencancang: $${vals[mi]}$.`), T(`(b) The lowest point is above ${MONTHS.en[lo]}, with $${vals[lo]}$.`, `(b) Titik terendah berada di atas ${MONTHS.ms[lo]}, dengan $${vals[lo]}$.`), T(`(c) Add every monthly reading: $${vals.join(' + ')} = ${sum(vals)}$`, `(c) Tambah setiap bacaan bulanan: $${vals.join(' + ')} = ${sum(vals)}$`)), sp: 's' };
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
      let bi = 0, bd = 0;
      for (let k = 0; k < months - 1; k++) { const dk = Math.abs(vals[k + 1] - vals[k]); if (dk > bd) { bd = dk; bi = k; } }
      const ties = []; // the greatest change can happen more than once – name every such pair
      for (let k = 0; k < months - 1; k++) if (Math.abs(vals[k + 1] - vals[k]) === bd) ties.push(k);
      const pairs = (L) => ties.map((k) => `${MONTHS[L][k]}\u2013${MONTHS[L][k + 1]}`).join(', ');
      const ch = vals[j] - vals[i];
      const chL = (en) => (ch === 0 ? (en ? 'No change' : 'Tiada perubahan') : `${en ? (ch > 0 ? 'Increase' : 'Decrease') : (ch > 0 ? 'Pertambahan' : 'Pengurangan')} of ${Math.abs(ch)}`.replace('of', en ? 'of' : 'sebanyak'));
      return { q: T(`The graph shows the ${s.name.en}. (a) Find the increase or decrease from ${MONTHS.en[i]} to ${MONTHS.en[j]}. (b) Between which two consecutive months was the change greatest?`, `Graf menunjukkan ${s.name.ms}. (a) Cari pertambahan atau pengurangan dari ${MONTHS.ms[i]} hingga ${MONTHS.ms[j]}. (b) Antara dua bulan berturutan yang manakah perubahan paling besar?`), fig, a: T(`(a) ${chL(true)} (b) ${pairs('en')}${ties.length > 1 ? ' (all tied)' : ''} (change ${bd})`, `(a) ${chL(false)} (b) ${pairs('ms')}${ties.length > 1 ? ' (semuanya sama)' : ''} (perubahan ${bd})`), w: W(T(`(a) Read both points: ${MONTHS.en[i]} gives $${vals[i]}$ and ${MONTHS.en[j]} gives $${vals[j]}$.`, `(a) Baca kedua-dua titik: ${MONTHS.ms[i]} memberi $${vals[i]}$ dan ${MONTHS.ms[j]} memberi $${vals[j]}$.`), T(`Change $= ${vals[j]} - ${vals[i]} = ${ch}$, ${ch > 0 ? 'an increase' : ch < 0 ? 'a decrease' : 'no change'} of $${Math.abs(ch)}$.`, `Perubahan $= ${vals[j]} - ${vals[i]} = ${ch}$, ${ch > 0 ? 'pertambahan' : ch < 0 ? 'pengurangan' : 'tiada perubahan'} sebanyak $${Math.abs(ch)}$.`), T(`(b) The greatest change is the steepest step between two neighbouring months: ${pairs('en')}, $${vals[bi]} \\to ${vals[bi + 1]}$, a change of $${bd}$${ties.length > 1 ? ' (the same change happens in each pair listed)' : ''}.`, `(b) Perubahan terbesar ialah langkah paling curam antara dua bulan bersebelahan: ${pairs('ms')}, $${vals[bi]} \\to ${vals[bi + 1]}$, perubahan sebanyak $${bd}$${ties.length > 1 ? ' (perubahan yang sama berlaku pada setiap pasangan yang disenaraikan)' : ''}.`)), sp: 's' };
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
      return { q: T(`The graph shows museum visitors (in hundreds). For each statement, say whether it is supported by the graph. Give a reason. (A) ${stmts[0][0].en} (B) ${stmts[1][0].en} (C) ${stmts[2][0].en}`, `Graf menunjukkan pengunjung muzium (dalam ratus). Bagi setiap pernyataan, nyatakan sama ada ia disokong oleh graf. Berikan sebab. (A) ${stmts[0][0].ms} (B) ${stmts[1][0].ms} (C) ${stmts[2][0].ms}`), fig, a: T(`(A) Supported: the graph rises from ${vals[0]} to ${last}. (B) Not supported: the graph shows a trend, not the cause. (C) Not supported: a prediction from a short trend can only be approximate, e.g. about ${last + stepv} hundred.`, `(A) Disokong: graf meningkat daripada ${vals[0]} kepada ${last}. (B) Tidak disokong: graf menunjukkan aliran, bukan puncanya. (C) Tidak disokong: ramalan daripada aliran yang pendek hanya boleh dianggarkan, misalnya kira-kira ${last + stepv} ratus.`), w: W(T(`(A) Supported: the graph climbs from $${vals[0]}$ in ${MONTHS.en[0]} to $${last}$ in ${MONTHS.en[months - 1]}, rising in most months.`, `(A) Disokong: graf meningkat daripada $${vals[0]}$ pada ${MONTHS.ms[0]} kepada $${last}$ pada ${MONTHS.ms[months - 1]}, meningkat pada kebanyakan bulan.`), T('(B) Not supported: a graph can show a trend but never its cause, and nothing here records the advertisement.', '(B) Tidak disokong: graf boleh menunjukkan aliran tetapi bukan puncanya, dan tiada apa-apa di sini yang mencatat iklan itu.'), T(`(C) Not supported: the rise is about $${stepv}$ hundred a month, so the next month can only be estimated at about $${last + stepv}$ hundred — "definitely" is too strong, and a trend may change.`, `(C) Tidak disokong: kenaikannya kira-kira $${stepv}$ ratus sebulan, jadi bulan berikutnya hanya boleh dianggarkan kira-kira $${last + stepv}$ ratus — "pasti" terlalu kuat, dan aliran boleh berubah.`)), sp: 'l' };
    },
  ];

  /* ---- 12.5 ethical representation */
  const g125e = [
    (r) => {
      const d = catData(r, 4, r.pick([20, 30, 40]));
      const mx = Math.max(...d.f), { ystep, ymax } = yMax(mx);
      const fig = S.bar({ cats: d.cats.map((c) => c.en), vals: d.f, ymax, ystep, w: 320, h: 190 });
      const fig2 = S.bar({ cats: d.cats.map((c) => c.ms), vals: d.f, ymax, ystep, w: 320, h: 190 });
      return { q: T('State two items that are missing from this bar chart, which make it difficult to interpret.', 'Nyatakan dua perkara yang tiada dalam carta palang ini yang menyukarkan tafsirannya.'), fig: T(fig, fig2), a: T('A title, and labels for the axes (with units): the vertical axis does not say what it measures and the horizontal axis does not name the variable.', 'Tajuk, dan label bagi paksi (dengan unit): paksi mencancang tidak menyatakan apa yang diukur dan paksi mengufuk tidak menamakan pemboleh ubah.'), w: W(T('Ask what a reader needs before the bars can mean anything.', 'Tanya apa yang diperlukan oleh pembaca sebelum palang itu bermakna.'), T('There is no title, so the topic of the chart is unknown; and neither axis is labelled, so the numbers have no meaning or units.', 'Tiada tajuk, jadi topik carta itu tidak diketahui; dan kedua-dua paksi tidak berlabel, jadi nombornya tiada makna atau unit.'), T('An honest chart always carries a title and a label (with units) on every axis.', 'Carta yang jujur sentiasa mempunyai tajuk dan label (dengan unit) pada setiap paksi.')), sp: 's' };
    },
    (r) => {
      const bank = [
        [T('Aina wants to find the favourite sport of all students in the school, but only asks members of the football team.', 'Aina ingin mengetahui sukan kegemaran semua murid di sekolah, tetapi hanya bertanya kepada ahli pasukan bola sepak.'), T('The sample is not representative (it is biased towards football).', 'Sampel tidak mewakili (ia berat sebelah kepada bola sepak).'), T('Choose students at random from every class.', 'Pilih murid secara rawak daripada setiap kelas.')],
        [T('A survey on library use asks only students who are found in the library.', 'Satu tinjauan tentang penggunaan perpustakaan hanya bertanya kepada murid yang berada di perpustakaan.'), T('Everyone surveyed already uses the library, so the results are biased.', 'Semua yang ditinjau sudah menggunakan perpustakaan, jadi keputusannya berat sebelah.'), T('Survey a random sample from all students.', 'Tinjau sampel rawak daripada semua murid.')],
        [T('To find how much homework Form 1 students do, a teacher asks only the five students who score the highest marks.', 'Untuk mengetahui jumlah kerja rumah yang dilakukan murid Tingkatan 1, seorang guru bertanya kepada lima murid yang mendapat markah tertinggi sahaja.'), T('The sample is unrepresentative of all Form 1 students.', 'Sampel tidak mewakili semua murid Tingkatan 1.'), T('Sample students of all achievement levels.', 'Sampel murid daripada semua tahap pencapaian.')],
      ];
      const it = r.pick(bank);
      return { q: T(`${it[0].en} What is wrong with this data collection, and how can it be improved?`, `${it[0].ms} Apakah kesalahan dalam pengumpulan data ini, dan bagaimana ia boleh diperbaiki?`), a: T(`${it[1].en} ${it[2].en}`, `${it[1].ms} ${it[2].ms}`), w: W(T('Check who was asked: a sample must represent the whole population.', 'Semak siapa yang ditanya: sampel mesti mewakili keseluruhan populasi.'), T(it[1].en, it[1].ms), T(`Improvement: ${it[2].en}`, `Penambahbaikan: ${it[2].ms}`)), sp: 's' };
    },
  ];
  const g125m = [
    (r) => {
      const va = r.int(72, 84), vb = va + r.int(2, 5);
      const lo = 70;
      const f = (lang, ymin, ymax, step) => S.bar({ cats: [lang === 'en' ? 'Shop A' : 'Kedai A', lang === 'en' ? 'Shop B' : 'Kedai B'], vals: [va, vb], ymin, ymax, ystep: step, showValues: true, w: 210, h: 190, ylabel: lang === 'en' ? 'Sales (RM thousand)' : 'Jualan (RM ribu)' });
      const fig = T([f('en', 0, 100, 20), f('en', lo, 90, 5)], [f('ms', 0, 100, 20), f('ms', lo, 90, 5)]);
      return { q: T('The two graphs show the same monthly sales of two shops. Which graph gives a misleading impression of the difference? Explain how, and what should be done to correct it.', 'Kedua-dua graf menunjukkan jualan bulanan yang sama bagi dua buah kedai. Graf manakah yang memberi gambaran mengelirukan tentang perbezaan itu? Terangkan bagaimana, dan apakah yang patut dilakukan untuk membetulkannya.'), fig, a: T(`The right-hand graph: its vertical axis starts at ${lo}, not 0, so Shop B's bar looks several times taller although the sales are ${va} and ${vb} thousand. Start the axis at 0 (or clearly mark a broken axis).`, `Graf sebelah kanan: paksi mencancangnya bermula pada ${lo}, bukan 0, jadi palang Kedai B kelihatan beberapa kali lebih tinggi walaupun jualan ialah ${va} ribu dan ${vb} ribu. Mulakan paksi pada 0 (atau tandakan paksi terputus dengan jelas).`), w: W(T(`Both graphs plot the same two values, $${va}$ and $${vb}$ (RM thousand).`, `Kedua-dua graf memplot dua nilai yang sama, $${va}$ dan $${vb}$ (RM ribu).`), T(`The real difference is only $${vb} - ${va} = ${vb - va}$ thousand.`, `Beza sebenar hanyalah $${vb} - ${va} = ${vb - va}$ ribu.`), T(`On the right-hand graph the axis starts at $${lo}$, so the bars stand only $${va - lo}$ and $${vb - lo}$ above it — the second bar looks many times taller than the first.`, `Pada graf sebelah kanan, paksi bermula pada $${lo}$, jadi palang hanya setinggi $${va - lo}$ dan $${vb - lo}$ di atasnya — palang kedua kelihatan berkali ganda lebih tinggi daripada yang pertama.`), T('Start the vertical axis at $0$, or mark a broken axis clearly, so the heights stay proportional to the values.', 'Mulakan paksi mencancang pada $0$, atau tandakan paksi terputus dengan jelas, supaya ketinggian kekal berkadaran dengan nilai.')), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 5) * 10, k = r.pick([2, 3]);
      const h1 = 1, h2 = k;
      return { q: T(`A newspaper shows sales of RM${a} thousand and RM${a * k} thousand using two square pictures whose sides are in the ratio 1 : ${k}. Explain why this display is misleading.`, `Sebuah akhbar menunjukkan jualan RM${a} ribu dan RM${a * k} ribu menggunakan dua gambar segi empat sama yang sisinya berada dalam nisbah 1 : ${k}. Terangkan mengapa paparan ini mengelirukan.`), a: T(`If the sides are in the ratio 1 : ${k}, the areas are in the ratio 1 : ${k * k}, so the second sale looks ${k * k} times as large although it is only ${k} times as large. Use bars of equal width whose heights are proportional to the values.`, `Jika sisi berada dalam nisbah 1 : ${k}, luasnya berada dalam nisbah 1 : ${k * k}, jadi jualan kedua kelihatan ${k * k} kali lebih besar padahal hanya ${k} kali ganda. Gunakan palang berlebar sama dengan tinggi berkadaran dengan nilai.`), w: W(T(`Sides in the ratio $1 : ${k}$ give areas in the ratio $1^2 : ${k}^2 = 1 : ${k * k}$.`, `Sisi dalam nisbah $1 : ${k}$ memberikan luas dalam nisbah $1^2 : ${k}^2 = 1 : ${k * k}$.`), T(`The eye compares areas, so the picture suggests $${k * k}$ times as much.`, `Mata membandingkan luas, jadi gambar itu memberi gambaran $${k * k}$ kali ganda.`), T(`But the sales only go from RM${a} thousand to RM${a * k} thousand, which is $${k}$ times as much — the picture exaggerates.`, `Tetapi jualan hanya naik daripada RM${a} ribu kepada RM${a * k} ribu, iaitu $${k}$ kali ganda — gambar itu membesar-besarkan.`), T('Use bars of equal width whose heights are proportional to the values instead.', 'Sebaliknya, gunakan palang berlebar sama dengan tinggi berkadaran dengan nilai.')), sp: 'm' };
    },
  ];
  const g125a = [
    (r) => {
      const tot = r.pick([30, 40, 50]);
      const yes = Math.round(tot * r.pick([0.8, 0.9]));
      const va = 100 - Math.round((yes / tot) * 100);
      return { q: T(`A student asks ${tot} classmates in the canteen queue: "Don't you agree that our canteen serves the best food in the country?" ${yes} say yes. The student draws a bar chart with a vertical axis starting at ${yes - 10} and titled "Everyone loves our canteen". Identify at least three problems with the collection and the display, and state a fairer conclusion.`, `Seorang murid bertanya kepada ${tot} orang rakan sekelas dalam barisan kantin: "Tidakkah anda bersetuju bahawa kantin kita menghidangkan makanan terbaik di negara ini?" ${yes} orang menjawab ya. Murid itu melukis carta palang dengan paksi mencancang bermula pada ${yes - 10} dan bertajuk "Semua orang suka kantin kita". Kenal pasti sekurang-kurangnya tiga masalah dalam pengumpulan dan paparan data, dan nyatakan kesimpulan yang lebih adil.`), a: T(`(1) Leading question. (2) Sample is unrepresentative: only students in the canteen queue. (3) Truncated axis exaggerates the difference. (4) The title overgeneralises. Fairer: "${yes} of the ${tot} students surveyed in the canteen queue (${n(round((yes / tot) * 100, 1))}%) said they liked the food."`, `(1) Soalan mengarahkan. (2) Sampel tidak mewakili: hanya murid dalam barisan kantin. (3) Paksi terpotong membesar-besarkan perbezaan. (4) Tajuk membuat generalisasi berlebihan. Lebih adil: "${yes} daripada ${tot} orang murid yang ditinjau dalam barisan kantin (${n(round((yes / tot) * 100, 1))}%) berkata mereka suka makanan itu."`), w: W(T('Check the question, the sample, the graph and the conclusion in turn.', 'Semak soalan, sampel, graf dan kesimpulan satu per satu.'), T('The wording "Don\'t you agree…" is a leading question: it pushes the respondent towards "yes".', 'Ungkapan "Tidakkah anda bersetuju…" ialah soalan mengarahkan: ia mendorong responden menjawab "ya".'), T('Only students already queueing at the canteen were asked, so the sample does not represent the whole school.', 'Hanya murid yang sedang beratur di kantin ditanya, jadi sampel itu tidak mewakili seluruh sekolah.'), T(`The vertical axis starts at $${yes - 10}$ instead of $0$, which exaggerates the difference, and the title claims "everyone" although $${tot - yes}$ of the $${tot}$ did not say yes.`, `Paksi mencancang bermula pada $${yes - 10}$ dan bukan $0$, lalu membesar-besarkan perbezaan, dan tajuknya mendakwa "semua orang" walaupun $${tot - yes}$ daripada $${tot}$ tidak menjawab ya.`), T(`A fair conclusion states the size and the source: $\\dfrac{${yes}}{${tot}} \\times 100\\% = ${n(round((yes / tot) * 100, 1))}\\%$ of the students surveyed in the canteen queue said they liked the food.`, `Kesimpulan yang adil menyatakan saiz dan sumbernya: $\\dfrac{${yes}}{${tot}} \\times 100\\% = ${n(round((yes / tot) * 100, 1))}\\%$ daripada murid yang ditinjau dalam barisan kantin berkata mereka suka makanan itu.`)), sp: 'xl' };
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
      return { q: T('Find the length of the hypotenuse $x$.', 'Cari panjang hipotenus $x$.'), fig: rtri(a, b, `${a} cm`, `${b} cm`, 'x', { flip: r.chance() }), a: T(`$x = ${c}$ cm`), w: W(T('$x$ is the hypotenuse, opposite the right angle, so add the squares of the two shorter sides.', '$x$ ialah hipotenus, bertentangan dengan sudut tegak, jadi tambah kuasa dua dua sisi yang lebih pendek.'), `$x^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b}$`, T(`$x = \\sqrt{${a * a + b * b}} = ${c}$ cm`)), sp: 's' };
    },
    (r) => {
      const t = r.pick(TRIPLES.slice(0, 3)), k = r.pick([1, 2]);
      const [a, b, c] = t.map((v) => v * k);
      return { q: T(`A right-angled triangle has two shorter sides of ${a} cm and ${b} cm. Find the length of the hypotenuse.`, `Sebuah segi tiga bersudut tegak mempunyai dua sisi yang lebih pendek ${a} cm dan ${b} cm. Cari panjang hipotenus.`), a: T(`${c} cm`), w: W(T('The hypotenuse is opposite the right angle, so $c^2 = a^2 + b^2$.', 'Hipotenus bertentangan dengan sudut tegak, jadi $c^2 = a^2 + b^2$.'), `$c^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b}$`, T(`$c = \\sqrt{${a * a + b * b}} = ${c}$ cm`)), sp: 's' };
    },
    (r) => {
      const [a, b] = r.pick(TRIPLES.slice(0, 3));
      const fig = rtri(a, b, 'a', 'b', 'c', { names: ['P', 'Q', 'R'], flip: r.chance() });
      return { q: T('In the right-angled triangle $PQR$, which side is the hypotenuse? State the relationship between $a$, $b$ and $c$.', 'Dalam segi tiga bersudut tegak $PQR$, sisi manakah yang merupakan hipotenus? Nyatakan hubungan antara $a$, $b$ dan $c$.'), fig, a: T('$c$ (opposite the right angle at $P$); $a^2 + b^2 = c^2$', '$c$ (bertentangan dengan sudut tegak di $P$); $a^2 + b^2 = c^2$'), w: W(T('The hypotenuse is always the side opposite the right angle, and it is the longest side.', 'Hipotenus sentiasa sisi yang bertentangan dengan sudut tegak, dan ia sisi yang terpanjang.'), T('The right angle is at $P$, so the hypotenuse is $c$, the side $QR$.', 'Sudut tegak berada di $P$, jadi hipotenusnya ialah $c$, iaitu sisi $QR$.'), T('The Pythagoras theorem then gives $a^2 + b^2 = c^2$.', 'Teorem Pythagoras kemudian memberikan $a^2 + b^2 = c^2$.')), sp: 's' };
    },
  ];
  const g131m = [
    (r) => {
      const t = r.pick(TRIPLES), k = r.pick([1, 1, 2]);
      const [a, b, c] = t.map((v) => v * k);
      need(c <= 60);
      const known = r.chance() ? a : b, ans = known === a ? b : a;
      return { q: T('Find the length of the side marked $x$.', 'Cari panjang sisi yang bertanda $x$.'), fig: rtri(known, ans, `${known} cm`, 'x', `${c} cm`, { flip: r.chance() }), a: T(`$x = ${ans}$ cm`), w: W(T(`$x$ is a shorter side and $${c}$ cm is the hypotenuse, so subtract.`, `$x$ ialah sisi yang lebih pendek dan $${c}$ cm ialah hipotenus, jadi tolak.`), `$x^2 = ${c}^2 - ${known}^2 = ${c * c} - ${known * known} = ${c * c - known * known}$`, T(`$x = \\sqrt{${c * c - known * known}} = ${ans}$ cm`), T('A common mistake is to add here; you only add when the hypotenuse is the unknown.', 'Kesilapan biasa ialah menambah di sini; kita hanya menambah apabila hipotenus yang tidak diketahui.')), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick([[3, 4, 5], [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25]]);
      return { q: T(`A rectangle measures ${a} cm by ${b} cm. Find the length of its diagonal.`, `Sebuah segi empat tepat berukuran ${a} cm kali ${b} cm. Cari panjang pepenjurunya.`), a: T(`${c} cm`), w: W(T('A diagonal cuts the rectangle into two right-angled triangles, with the diagonal as the hypotenuse.', 'Pepenjuru membahagi segi empat tepat itu kepada dua segi tiga bersudut tegak, dengan pepenjuru sebagai hipotenus.'), `$d^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b}$`, T(`$d = \\sqrt{${a * a + b * b}} = ${c}$ cm`)), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick([[0.6, 0.8, 1], [1.5, 2, 2.5], [0.9, 1.2, 1.5], [2.5, 6, 6.5], [0.5, 1.2, 1.3]]);
      const findHyp = r.chance();
      return findHyp
        ? { q: T(`The two shorter sides of a right-angled triangle are ${n(a)} m and ${n(b)} m. Find the hypotenuse.`, `Dua sisi yang lebih pendek bagi sebuah segi tiga bersudut tegak ialah ${n(a)} m dan ${n(b)} m. Cari hipotenus.`), a: T(`${n(c)} m`), w: W(T('Both shorter sides are given, so add their squares.', 'Kedua-dua sisi yang lebih pendek diberi, jadi tambah kuasa duanya.'), `$c^2 = ${n(a)}^2 + ${n(b)}^2 = ${n(round(a * a, 4))} + ${n(round(b * b, 4))} = ${n(round(a * a + b * b, 4))}$`, T(`$c = \\sqrt{${n(round(a * a + b * b, 4))}} = ${n(c)}$ m`)), sp: 's' }
        : { q: T(`The hypotenuse of a right-angled triangle is ${n(c)} m and one of the other sides is ${n(a)} m. Find the third side.`, `Hipotenus sebuah segi tiga bersudut tegak ialah ${n(c)} m dan satu daripada dua sisi yang lain ialah ${n(a)} m. Cari sisi yang ketiga.`), a: T(`${n(b)} m`), w: W(T('The hypotenuse is given, so subtract the square of the known shorter side.', 'Hipotenus diberi, jadi tolak kuasa dua sisi pendek yang diketahui.'), `$b^2 = ${n(c)}^2 - ${n(a)}^2 = ${n(round(c * c, 4))} - ${n(round(a * a, 4))} = ${n(round(c * c - a * a, 4))}$`, T(`$b = \\sqrt{${n(round(c * c - a * a, 4))}} = ${n(b)}$ m`)), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick(TRIPLES.slice(0, 3)), k = r.pick([2, 3, 4]);
      return { q: T(`A ladder ${c * k} m long leans against a vertical wall. Its foot is ${a * k} m from the wall. How high up the wall does the ladder reach?`, `Sebuah tangga sepanjang ${c * k} m disandarkan pada dinding tegak. Kaki tangga itu berjarak ${a * k} m dari dinding. Berapakah ketinggian tangga itu pada dinding?`), a: T(`${b * k} m`), w: W(T('The wall is vertical and the ground is horizontal, so the ladder is the hypotenuse.', 'Dinding adalah tegak dan tanah mengufuk, jadi tangga itu ialah hipotenus.'), `$h^2 = ${c * k}^2 - ${a * k}^2 = ${(c * k) * (c * k)} - ${(a * k) * (a * k)} = ${(c * k) * (c * k) - (a * k) * (a * k)}$`, T(`$h = \\sqrt{${(c * k) * (c * k) - (a * k) * (a * k)}} = ${b * k}$ m`)), sp: 's' };
    },
  ];
  const g131a = [
    (r) => {
      const a = r.int(4, 12), b = r.int(4, 12);
      need(a !== b && !Number.isInteger(Math.sqrt(a * a + b * b)));
      const c = Math.sqrt(a * a + b * b);
      return { q: T(`Find the length of the hypotenuse, correct to 2 decimal places.`, `Cari panjang hipotenus, betul kepada 2 tempat perpuluhan.`), fig: rtri(a, b, `${a} cm`, `${b} cm`, 'x', { flip: r.chance() }), a: T(`$x = ${sq2(c)}$ cm`), w: W(`$x^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b}$`, `$x = \\sqrt{${a * a + b * b}}$`, T(`$x = ${sq2(c)}$ cm, correct to 2 decimal places.`, `$x = ${sq2(c)}$ cm, betul kepada 2 tempat perpuluhan.`), T(`$${a * a + b * b}$ is not a perfect square, so the answer has to be rounded.`, `$${a * a + b * b}$ bukan kuasa dua sempurna, jadi jawapannya perlu dibundarkan.`)), sp: 's' };
    },
    (r) => {
      const c = r.int(9, 20), a = r.int(4, c - 3);
      const b2 = c * c - a * a;
      need(!Number.isInteger(Math.sqrt(b2)));
      return { q: T(`The hypotenuse of a right-angled triangle is ${c} cm and one of the other sides is ${a} cm. Find the length of the third side, correct to 2 decimal places.`, `Hipotenus sebuah segi tiga bersudut tegak ialah ${c} cm dan satu daripada dua sisi yang lain ialah ${a} cm. Cari panjang sisi yang ketiga, betul kepada 2 tempat perpuluhan.`), a: T(`${sq2(Math.sqrt(b2))} cm`), w: W(T(`$${c}$ cm is the hypotenuse, so subtract.`, `$${c}$ cm ialah hipotenus, jadi tolak.`), `$x^2 = ${c}^2 - ${a}^2 = ${c * c} - ${a * a} = ${b2}$`, `$x = \\sqrt{${b2}}$`, T(`$x = ${sq2(Math.sqrt(b2))}$ cm, correct to 2 decimal places.`, `$x = ${sq2(Math.sqrt(b2))}$ cm, betul kepada 2 tempat perpuluhan.`)), sp: 'm' };
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
      return { q: T('In the diagram, $AD \\perp BC$. Find the length of $BC$.', 'Dalam rajah, $AD \\perp BC$. Cari panjang $BC$.'), fig, a: T(`$BC = ${o.bd + o.dc}$ cm`), w: W(T('$AD \\perp BC$ splits the triangle into two right-angled triangles, $ABD$ and $ACD$, with $AD$ shared.', '$AD \\perp BC$ membahagi segi tiga itu kepada dua segi tiga bersudut tegak, $ABD$ dan $ACD$, dengan $AD$ sepunya.'), `$BD^2 = ${o.ab}^2 - ${o.ad}^2 = ${o.ab * o.ab} - ${o.ad * o.ad} = ${o.ab * o.ab - o.ad * o.ad}$, $BD = ${o.bd}$`, `$DC^2 = ${o.ac}^2 - ${o.ad}^2 = ${o.ac * o.ac} - ${o.ad * o.ad} = ${o.ac * o.ac - o.ad * o.ad}$, $DC = ${o.dc}$`, T(`$BC = BD + DC = ${o.bd} + ${o.dc} = ${o.bd + o.dc}$ cm`)), sp: 'l' };
    },
    (r) => {
      const [a, b, c] = r.pick([[8, 15, 17], [9, 12, 15], [12, 16, 20], [15, 20, 25]]);
      const per = 2 * (a + b);
      return { q: T(`The diagonal of a rectangle is ${c} cm and one side is ${a} cm. Find (a) the other side, (b) the perimeter, (c) the area of the rectangle.`, `Pepenjuru sebuah segi empat tepat ialah ${c} cm dan satu sisinya ${a} cm. Cari (a) sisi yang satu lagi, (b) perimeter, (c) luas segi empat tepat itu.`), a: T(`(a) ${b} cm (b) ${per} cm (c) ${a * b} cm²`), w: W(T('(a) The diagonal is the hypotenuse of a right-angled triangle whose legs are the two sides.', '(a) Pepenjuru ialah hipotenus bagi segi tiga bersudut tegak yang kakinya ialah dua sisi itu.'), `$b^2 = ${c}^2 - ${a}^2 = ${c * c} - ${a * a} = ${c * c - a * a}$`, T(`$b = \\sqrt{${c * c - a * a}} = ${b}$ cm`), T(`(b) Perimeter $= 2(${a} + ${b}) = ${per}$ cm`, `(b) Perimeter $= 2(${a} + ${b}) = ${per}$ cm`), T(`(c) Area $= ${a} \\times ${b} = ${a * b}$ cm²`, `(c) Luas $= ${a} \\times ${b} = ${a * b}$ cm²`)), sp: 'm' };
    },
    (r) => {
      const scr = r.pick([[24, 32, 40], [40, 30, 50], [48, 64, 80]]);
      return { q: T(`A television screen is ${scr[0]} cm high and ${scr[1]} cm wide. Its size is given by the length of the diagonal of the screen. What is the size of the television?`, `Skrin sebuah televisyen setinggi ${scr[0]} cm dan selebar ${scr[1]} cm. Saiznya ditentukan oleh panjang pepenjuru skrin. Apakah saiz televisyen itu?`), a: T(`${scr[2]} cm`), w: W(T('The height, the width and the diagonal form a right-angled triangle, with the diagonal as the hypotenuse.', 'Ketinggian, kelebaran dan pepenjuru membentuk segi tiga bersudut tegak, dengan pepenjuru sebagai hipotenus.'), `$d^2 = ${scr[0]}^2 + ${scr[1]}^2 = ${scr[0] * scr[0]} + ${scr[1] * scr[1]} = ${scr[0] * scr[0] + scr[1] * scr[1]}$`, T(`$d = \\sqrt{${scr[0] * scr[0] + scr[1] * scr[1]}} = ${scr[2]}$ cm`)), sp: 'm' };
    },
    (r) => {
      const [h, d] = r.pick([[6, 10], [12, 13], [8, 17], [15, 17]]);
      const base = Math.sqrt(d * d - h * h);
      need(Number.isInteger(base));
      return { q: T(`A guy rope ${d} m long is tied from the top of a vertical pole ${h} m high to a peg on level ground. How far is the peg from the foot of the pole?`, `Seutas tali penyokong sepanjang ${d} m diikat dari puncak sebatang tiang tegak setinggi ${h} m ke sebatang pasak di atas tanah rata. Berapakah jarak pasak dari kaki tiang?`), a: T(`${base} m`), w: W(T('The pole, the level ground and the rope form a right-angled triangle; the rope is the hypotenuse.', 'Tiang, tanah rata dan tali membentuk segi tiga bersudut tegak; tali itu ialah hipotenus.'), `$x^2 = ${d}^2 - ${h}^2 = ${d * d} - ${h * h} = ${d * d - h * h}$`, T(`$x = \\sqrt{${d * d - h * h}} = ${base}$ m`)), sp: 'm' };
    },
  ];

  const g132e = [
    (r) => {
      const k = r.pick([1, 2, 3]);
      const t = r.pick(TRIPLES.slice(0, 3)).map((v) => v * k);
      const list = r.shuffle(t);
      return { q: T(`Show that a triangle with sides ${list.join(' cm, ')} cm is a right-angled triangle.`, `Tunjukkan bahawa sebuah segi tiga dengan sisi ${list.join(' cm, ')} cm ialah segi tiga bersudut tegak.`), a: T(`$${t[0]}^2 + ${t[1]}^2 = ${t[0] ** 2 + t[1] ** 2} = ${t[2]}^2$, so it is right-angled.`, `$${t[0]}^2 + ${t[1]}^2 = ${t[0] ** 2 + t[1] ** 2} = ${t[2]}^2$, jadi ia bersudut tegak.`), w: W(T(`The longest side is $${t[2]}$ cm, so test it against the other two.`, `Sisi terpanjang ialah $${t[2]}$ cm, jadi ujinya dengan dua sisi yang lain.`), `$${t[0]}^2 + ${t[1]}^2 = ${t[0] ** 2} + ${t[1] ** 2} = ${t[0] ** 2 + t[1] ** 2}$`, `$${t[2]}^2 = ${t[2] ** 2}$`, T('The two results are equal, so by the converse of the Pythagoras theorem the triangle is right-angled.', 'Kedua-dua keputusan adalah sama, jadi menurut akas teorem Pythagoras, segi tiga itu bersudut tegak.')), sp: 's' };
    },
    (r) => {
      const t = r.pick(TRIPLES.slice(0, 2));
      const bad = t.slice(); bad[2] += r.pick([1, 2]);
      need(bad[0] + bad[1] > bad[2]);
      const list = r.shuffle(bad);
      return { q: T(`Is a triangle with sides ${list.join(' cm, ')} cm right-angled? Show your working.`, `Adakah sebuah segi tiga dengan sisi ${list.join(' cm, ')} cm bersudut tegak? Tunjukkan langkah kerja anda.`), a: T(`No: $${t[0]}^2 + ${t[1]}^2 = ${t[0] ** 2 + t[1] ** 2}$ but $${bad[2]}^2 = ${bad[2] ** 2}$.`, `Tidak: $${t[0]}^2 + ${t[1]}^2 = ${t[0] ** 2 + t[1] ** 2}$ tetapi $${bad[2]}^2 = ${bad[2] ** 2}$.`), w: W(T(`Square the longest side, $${bad[2]}$ cm, on its own, and the two shorter sides together.`, `Kuasa duakan sisi terpanjang, $${bad[2]}$ cm, secara berasingan, dan dua sisi yang lebih pendek bersama-sama.`), `$${bad[0]}^2 + ${bad[1]}^2 = ${bad[0] ** 2} + ${bad[1] ** 2} = ${bad[0] ** 2 + bad[1] ** 2}$`, `$${bad[2]}^2 = ${bad[2] ** 2}$`, T('The two results are not equal, so the triangle is not right-angled.', 'Kedua-dua keputusan tidak sama, jadi segi tiga itu bukan segi tiga bersudut tegak.')), sp: 's' };
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
      return { q: T(`The sides of a triangle are ${list.join(' cm, ')} cm. Determine whether it is a right-angled triangle. Identify the longest side first.`, `Sisi-sisi sebuah segi tiga ialah ${list.join(' cm, ')} cm. Tentukan sama ada ia segi tiga bersudut tegak. Kenal pasti sisi terpanjang dahulu.`), a: T(`Longest side ${c} cm: $${a}^2 + ${b}^2 = ${a * a + b * b}$, $${c}^2 = ${c * c}$. ${a * a + b * b === c * c ? 'Right-angled.' : 'Not right-angled.'}`, `Sisi terpanjang ${c} cm: $${a}^2 + ${b}^2 = ${a * a + b * b}$, $${c}^2 = ${c * c}$. ${a * a + b * b === c * c ? 'Bersudut tegak.' : 'Tidak bersudut tegak.'}`), w: W(T(`Sort the sides: the longest is $${c}$ cm, so that is the one to square on its own.`, `Susun sisi: yang terpanjang ialah $${c}$ cm, jadi itulah yang dikuasaduakan secara berasingan.`), `$${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b}$`, `$${c}^2 = ${c * c}$`, a * a + b * b === c * c ? T('The two results are equal, so the triangle is right-angled.', 'Kedua-dua keputusan adalah sama, jadi segi tiga itu bersudut tegak.') : T('The two results are different, so the triangle is not right-angled.', 'Kedua-dua keputusan berbeza, jadi segi tiga itu bukan segi tiga bersudut tegak.')), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick([[0.9, 1.2, 1.5], [0.5, 1.2, 1.3], [1.5, 2, 2.5], [0.6, 0.8, 1.0]]);
      return { q: T(`Can lengths ${n(a)} m, ${n(b)} m and ${n(c)} m form a right-angled triangle? Show your working.`, `Bolehkah panjang ${n(a)} m, ${n(b)} m dan ${n(c)} m membentuk segi tiga bersudut tegak? Tunjukkan langkah kerja anda.`), a: T(`Yes: $${n(a)}^2 + ${n(b)}^2 = ${n(round(a * a + b * b, 2))} = ${n(c)}^2$.`, `Ya: $${n(a)}^2 + ${n(b)}^2 = ${n(round(a * a + b * b, 2))} = ${n(c)}^2$.`), w: W(T(`Test the longest length, $${n(c)}$ m, as the hypotenuse.`, `Uji panjang terbesar, $${n(c)}$ m, sebagai hipotenus.`), `$${n(a)}^2 + ${n(b)}^2 = ${n(round(a * a, 4))} + ${n(round(b * b, 4))} = ${n(round(a * a + b * b, 2))}$`, `$${n(c)}^2 = ${n(round(c * c, 2))}$`, T('The two results are equal, so the three lengths do form a right-angled triangle.', 'Kedua-dua keputusan adalah sama, jadi ketiga-tiga panjang itu membentuk segi tiga bersudut tegak.')), sp: 's' };
    },
    (r) => {
      const [a, b, c] = r.pick(TRIPLES.slice(0, 3));
      const fig = rtri(a, b, `${a} cm`, `${b} cm`, `${c} cm`, { names: ['P', 'Q', 'R'] });
      return { q: T(`In triangle $PQR$ the sides are $PQ = ${a}$ cm, $PR = ${b}$ cm and $QR = ${c}$ cm. State which vertex has the right angle.`, `Dalam segi tiga $PQR$, sisinya ialah $PQ = ${a}$ cm, $PR = ${b}$ cm dan $QR = ${c}$ cm. Nyatakan bucu yang mempunyai sudut tegak.`), fig, a: T(`Vertex $P$ (opposite the longest side $QR = ${c}$ cm, since $${a}^2 + ${b}^2 = ${c}^2$)`, `Bucu $P$ (bertentangan dengan sisi terpanjang $QR = ${c}$ cm, kerana $${a}^2 + ${b}^2 = ${c}^2$)`), w: W(T(`The longest side is $QR = ${c}$ cm.`, `Sisi terpanjang ialah $QR = ${c}$ cm.`), `$${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b} = ${c}^2$`, T('By the converse of the Pythagoras theorem the triangle is right-angled, and the right angle is always opposite the longest side.', 'Menurut akas teorem Pythagoras, segi tiga itu bersudut tegak, dan sudut tegak sentiasa bertentangan dengan sisi terpanjang.'), T('$QR$ is opposite $P$, so the right angle is at the vertex $P$.', '$QR$ bertentangan dengan $P$, jadi sudut tegak berada di bucu $P$.')), sp: 's' };
    },
  ];
  const g132a = [
    (r) => {
      const a = r.int(6, 12), b = a + r.int(1, 3);
      const c = b + r.pick([1, 2]);
      need(a * a + b * b !== c * c && a + b > c);
      const list = r.shuffle([a, b, c]);
      return { q: T(`A carpenter checks whether the corner of a roof frame with members ${list.join(' m, ')} m is a right angle. Does the converse of the Pythagoras theorem support this? Give the numerical evidence, and check the triangle inequality first.`, `Seorang tukang kayu menyemak sama ada bucu rangka bumbung dengan anggota ${list.join(' m, ')} m ialah sudut tegak. Adakah akas teorem Pythagoras menyokongnya? Berikan bukti berangka, dan semak ketidaksamaan segi tiga dahulu.`), a: T(`${a} + ${b} = ${a + b} > ${c}, so a triangle exists. $${a}^2 + ${b}^2 = ${a * a + b * b}$ but $${c}^2 = ${c * c}$: not equal, so it is not a right angle.`, `${a} + ${b} = ${a + b} > ${c}, jadi segi tiga wujud. $${a}^2 + ${b}^2 = ${a * a + b * b}$ tetapi $${c}^2 = ${c * c}$: tidak sama, jadi ia bukan sudut tegak.`), w: W(T(`Triangle inequality first: $${a} + ${b} = ${a + b} > ${c}$, so the three members really do close up into a triangle.`, `Ketaksamaan segi tiga dahulu: $${a} + ${b} = ${a + b} > ${c}$, jadi ketiga-tiga anggota itu memang membentuk segi tiga.`), `$${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b}$`, `$${c}^2 = ${c * c}$`, T('The two results are not equal, so the converse of the Pythagoras theorem does not apply: the corner is not a right angle.', 'Kedua-dua keputusan tidak sama, jadi akas teorem Pythagoras tidak terpakai: bucu itu bukan sudut tegak.')), sp: 'm' };
    },
    (r) => {
      const k = r.pick([10, 20, 30]);
      const t = r.pick(TRIPLES.slice(0, 3));
      const [a, b, c] = t.map((v) => v * k);
      return { q: T(`To make sure that the corner of a rectangular garden bed is square, a gardener measures ${a} cm along one edge and ${b} cm along the other, and the distance between the two marks is ${c} cm. Is the corner a right angle? Explain.`, `Untuk memastikan bucu batas taman berbentuk segi empat tepat itu tepat, seorang tukang kebun mengukur ${a} cm sepanjang satu tepi dan ${b} cm sepanjang tepi yang lain, dan jarak antara kedua-dua tanda ialah ${c} cm. Adakah bucu itu sudut tegak? Terangkan.`), a: T(`Yes: $${a}^2 + ${b}^2 = ${a * a + b * b} = ${c}^2$, so by the converse the angle is $90^\\circ$.`, `Ya: $${a}^2 + ${b}^2 = ${a * a + b * b} = ${c}^2$, jadi menurut akas teorem, sudutnya ialah $90^\\circ$.`), w: W(T('The two measured edges are the shorter sides and the distance between the marks would be the hypotenuse.', 'Dua tepi yang diukur ialah sisi yang lebih pendek dan jarak antara kedua-dua tanda ialah hipotenusnya.'), `$${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b}$`, `$${c}^2 = ${c * c}$`, T('The two results are equal, so by the converse of the Pythagoras theorem the corner is $90^\\circ$.', 'Kedua-dua keputusan adalah sama, jadi menurut akas teorem Pythagoras, bucu itu ialah $90^\\circ$.')), sp: 'm' };
    },
    (r) => {
      const a = r.int(5, 9), b = r.int(a + 2, 14), c = a + b + r.pick([1, 2]);
      const t = r.shuffle([a, b, c]);
      return { q: T(`Can lengths ${t.join(' cm, ')} cm form a triangle? If so, is it right-angled? Give reasons.`, `Bolehkah panjang ${t.join(' cm, ')} cm membentuk segi tiga? Jika boleh, adakah ia bersudut tegak? Berikan sebab.`), a: T(`No triangle: the two shorter sides add up to ${a + b}, which is less than ${c}. (The triangle inequality fails, so the Pythagoras test does not apply.)`, `Tiada segi tiga: dua sisi yang lebih pendek berjumlah ${a + b}, iaitu kurang daripada ${c}. (Ketaksamaan segi tiga tidak dipenuhi, jadi ujian Pythagoras tidak terpakai.)`), w: W(T('Check the triangle inequality before anything else: the two shorter sides must add up to more than the longest.', 'Semak ketidaksamaan segi tiga sebelum apa-apa lagi: dua sisi yang lebih pendek mesti berjumlah lebih daripada sisi terpanjang.'), `$${a} + ${b} = ${a + b} < ${c}$`, T('The two shorter sides cannot reach across the longest one, so no triangle can be formed.', 'Dua sisi yang lebih pendek tidak dapat bertemu merentasi sisi terpanjang, jadi tiada segi tiga yang boleh dibentuk.'), T('There is no triangle, so the question of a right angle does not arise — do not apply the Pythagoras test here.', 'Tiada segi tiga, jadi persoalan sudut tegak tidak timbul — jangan gunakan ujian Pythagoras di sini.')), sp: 'm' };
    },
  ];
  SPM.addChapter(1, 13, T('The Pythagoras Theorem', 'Teorem Pythagoras'), [
    { id: '13.1', en: 'The Pythagoras theorem', ms: 'Teorem Pythagoras', gen: { e: g131e, m: g131m, a: g131a } },
    { id: '13.2', en: 'The converse of the Pythagoras theorem', ms: 'Akas teorem Pythagoras', gen: { e: g132e, m: g132m, a: g132a } },
  ]);
})();
