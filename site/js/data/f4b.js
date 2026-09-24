/* Form 4 – Chapters 4 and 5 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, sum } = SPM;
  const S = SPM.svg;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const roster = (l) => `\\{${l.join(',\\ ')}\\}`;
  const inter = (a, b) => a.filter((x) => b.includes(x));
  const uni = (a, b) => [...new Set([...a, ...b])].sort((x, y) => x - y);
  const diff = (a, b) => a.filter((x) => !b.includes(x));
  const W = SPM.lines;
  const rost = (l) => (l.length ? roster(l) : '\\varnothing');

  /* =============================================================== 4 */
  const regionKey = (x, sets, names) => {
    const k = names.filter((_, i) => sets[i].includes(x)).join('');
    return k || '0';
  };
  const regionElems = (U, sets, names) => {
    const m = {};
    U.forEach((x) => { const k = regionKey(x, sets, names); (m[k] = m[k] || []).push(x); });
    return m;
  };
  const E2 = [
    ['A \\cap B', ['AB']], ['A \\cup B', ['A', 'B', 'AB']], ["A'", ['B', '0']], ["B'", ['A', '0']], ["(A \\cup B)'", ['0']],
    ["(A \\cap B)'", ['A', 'B', '0']], ["A \\cap B'", ['A']], ["A' \\cap B", ['B']], ["A' \\cup B", ['B', 'AB', '0']],
  ];
  const E3 = [
    ['A \\cap B \\cap C', ['ABC']], ['A \\cup B \\cup C', ['A', 'B', 'C', 'AB', 'AC', 'BC', 'ABC']], ["(A \\cup B \\cup C)'", ['0']],
    ['A \\cap B', ['AB', 'ABC']], ['(A \\cap B) \\cup C', ['AB', 'ABC', 'C', 'AC', 'BC']], ["A \\cap B' \\cap C'", ['A']],
    ['(A \\cup B) \\cap C', ['AC', 'BC', 'ABC']], ["A \\cap B \\cap C'", ['AB']], ["(A \\cap C) \\cup (B \\cap C)", ['AC', 'BC', 'ABC']],
  ];
  const two = (r, N) => retry(() => {
    const U = range(1, N);
    const A = r.sample(U, r.int(4, 7)).sort((a, b) => a - b), B = r.sample(U, r.int(4, 7)).sort((a, b) => a - b);
    need(inter(A, B).length >= 1 && diff(A, B).length >= 1 && diff(B, A).length >= 1 && uni(A, B).length < N);
    return { U, A, B };
  });
  const vennFig = (U, sets, names, shade, counts) => {
    const el = regionElems(U, sets, names);
    if (names.length === 3) {
      const cnt = {};
      Object.keys(el).forEach((k) => (cnt[k] = el[k].length));
      return S.venn({ sets: 3, counts: cnt, shade });
    }
    return S.venn({ sets: 2, elems: el, shade });
  };
  /** worked-solution helpers: which Venn regions are shaded, and their elements */
  const RG = {
    AB: T('in both $A$ and $B$', 'dalam kedua-dua $A$ dan $B$'), A: T('in $A$ only', 'dalam $A$ sahaja'), B: T('in $B$ only', 'dalam $B$ sahaja'),
    '0': T('outside both $A$ and $B$', 'di luar kedua-dua $A$ dan $B$'),
  };
  const RG3 = {
    ABC: T('in all of $A$, $B$ and $C$', 'dalam ketiga-tiga $A$, $B$ dan $C$'), AB: T('in $A$ and $B$ only', 'dalam $A$ dan $B$ sahaja'), AC: T('in $A$ and $C$ only', 'dalam $A$ dan $C$ sahaja'),
    BC: T('in $B$ and $C$ only', 'dalam $B$ dan $C$ sahaja'), A: T('in $A$ only', 'dalam $A$ sahaja'), B: T('in $B$ only', 'dalam $B$ sahaja'), C: T('in $C$ only', 'dalam $C$ sahaja'),
    '0': T('outside all three sets', 'di luar ketiga-tiga set'),
  };
  const shadeLine = (keys, rg) => T(`Shaded region: ${keys.map((k) => rg[k].en).join('; ')}`, `Kawasan berlorek: ${keys.map((k) => rg[k].ms).join('; ')}`);
  /** one line per shaded region of a 2-set diagram, with its elements */
  const regionLines = (U, A, B, keys) => {
    const el = regionElems(U, [A, B], ['A', 'B']);
    return keys.map((k) => T(`Elements ${RG[k].en}: $${rost(el[k] || [])}$`, `Unsur ${RG[k].ms}: $${rost(el[k] || [])}$`));
  };

  const g41e = [
    (r) => {
      const { A, B } = two(r, 14);
      return { q: T(`$A = ${roster(A)}$ and $B = ${roster(B)}$. List the elements of $A \\cap B$ and state $n(A \\cap B)$.`, `$A = ${roster(A)}$ dan $B = ${roster(B)}$. Senaraikan unsur bagi $A \\cap B$ dan nyatakan $n(A \\cap B)$.`), a: T(`$A \\cap B = ${roster(inter(A, B))}$; $n(A \\cap B) = ${inter(A, B).length}$`), w: W(T(`Elements that appear in both $A$ and $B$: $${inter(A, B).join(',\\ ')}$`, `Unsur yang terdapat dalam kedua-dua $A$ dan $B$: $${inter(A, B).join(',\\ ')}$`), T(`Count them: $n(A \\cap B) = ${inter(A, B).length}$`, `Bilang: $n(A \\cap B) = ${inter(A, B).length}$`)), sp: 's' };
    },
    (r) => {
      const U = range(1, 12), A = r.sample([1, 3, 5, 7, 9, 11], 3).sort((a, b) => a - b), B = r.sample([2, 4, 6, 8, 10, 12], 3).sort((a, b) => a - b);
      return { q: T(`$A = ${roster(A)}$ and $B = ${roster(B)}$. Find $A \\cap B$. What can you say about $A$ and $B$?`, `$A = ${roster(A)}$ dan $B = ${roster(B)}$. Cari $A \\cap B$. Apakah yang boleh anda katakan tentang $A$ dan $B$?`), a: T('$A \\cap B = \\varnothing$: the sets are disjoint (no common elements).', '$A \\cap B = \\varnothing$: set-set itu tidak bertindih (tiada unsur sepunya).'), w: W(T('Every element of $A$ is odd and every element of $B$ is even, so no element is in both sets.', 'Setiap unsur $A$ ialah nombor ganjil dan setiap unsur $B$ ialah nombor genap, jadi tiada unsur dalam kedua-dua set.'), T('$A \\cap B = \\varnothing$, so $A$ and $B$ are disjoint.', '$A \\cap B = \\varnothing$, maka $A$ dan $B$ tidak bertindih.')), sp: 's' };
    },
  ];
  const g41m = [
    (r) => {
      const a = r.int(8, 20), b = r.int(8, 20), c = r.int(2, Math.min(a, b) - 2);
      return { q: T(`$n(A) = ${a}$, $n(B) = ${b}$ and $n(A \\cap B) = ${c}$. Find $n(A \\cup B)$.`, `$n(A) = ${a}$, $n(B) = ${b}$ dan $n(A \\cap B) = ${c}$. Cari $n(A \\cup B)$.`), a: T(`$n(A \\cup B) = ${a} + ${b} - ${c} = ${a + b - c}$`), w: W(`$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$`, `$n(A \\cup B) = ${a} + ${b} - ${c} = ${a + b - c}$`, T(`Subtract $n(A \\cap B)$ because those ${c} elements are counted in both $n(A)$ and $n(B)$.`, `Tolak $n(A \\cap B)$ kerana ${c} unsur itu dikira dua kali, dalam $n(A)$ dan $n(B)$.`)), sp: 's' };
    },
    (r) => {
      const N = 14, { U, A, B } = two(r, N);
      const [name, keys] = r.pick(E2.filter((e) => ['A \\cap B', "A \\cap B'", "A' \\cap B"].includes(e[0])));
      const fig = vennFig(U, [A, B], ['A', 'B'], keys);
      return { q: T('The Venn diagram shows the sets $A$ and $B$. Which set operation is represented by the shaded region? Write it using set notation and list its elements.', 'Gambar rajah Venn menunjukkan set $A$ dan $B$. Operasi set manakah yang diwakili oleh kawasan berlorek? Tulis menggunakan tatatanda set dan senaraikan unsurnya.'), fig, a: T(`$${name} = ${roster(U.filter((x) => keys.includes(regionKey(x, [A, B], ['A', 'B']))))}$`), w: W(shadeLine(keys, RG), T(`This region is $${name}$.`, `Kawasan ini ialah $${name}$.`), ...regionLines(U, A, B, keys)), sp: 's' };
    },
  ];
  const three = (r, N) => retry(() => {
    const U = range(1, N);
    const A = U.filter((x) => x % 2 === 0), B = U.filter((x) => x % 3 === 0), C = U.filter((x) => x % 5 === 0);
    return { U, A, B, C };
  });
  const g41a = [
    (r) => {
      const { U, A, B, C } = three(r, r.pick([20, 24, 30]));
      return { q: T(`$\\xi = ${roster(U)}$, $A$ = multiples of 2, $B$ = multiples of 3 and $C$ = multiples of 5. Find (a) $A \\cap B$, (b) $B \\cap C$, (c) $A \\cap B \\cap C$.`, `$\\xi = ${roster(U)}$, $A$ = gandaan 2, $B$ = gandaan 3 dan $C$ = gandaan 5. Cari (a) $A \\cap B$, (b) $B \\cap C$, (c) $A \\cap B \\cap C$.`), a: T(`(a) $${roster(inter(A, B))}$ (b) $${roster(inter(B, C))}$ (c) $${inter(inter(A, B), C).length ? roster(inter(inter(A, B), C)) : '\\varnothing'}$`), w: W(T(`(a) Multiples of both 2 and 3 are the multiples of $6$: $${rost(inter(A, B))}$`, `(a) Gandaan 2 dan 3 ialah gandaan $6$: $${rost(inter(A, B))}$`), T(`(b) Multiples of both 3 and 5 are the multiples of $15$: $${rost(inter(B, C))}$`, `(b) Gandaan 3 dan 5 ialah gandaan $15$: $${rost(inter(B, C))}$`), T(`(c) Multiples of 2, 3 and 5 are the multiples of $30$ (up to $${U.length}$): $${rost(inter(inter(A, B), C))}$`, `(c) Gandaan 2, 3 dan 5 ialah gandaan $30$ (hingga $${U.length}$): $${rost(inter(inter(A, B), C))}$`)), sp: 'm' };
    },
    (r) => {
      const { U, A, B, C } = three(r, 30);
      const [name, keys] = r.pick(E3.filter((e) => e[1].length <= 3));
      const fig = vennFig(U, [A, B, C], ['A', 'B', 'C'], keys);
      return { q: T('The Venn diagram shows three sets. Write, in set notation, an expression for the shaded region.', 'Gambar rajah Venn menunjukkan tiga set. Tulis, dalam tatatanda set, satu ungkapan bagi kawasan berlorek.'), fig, a: T(`$${name}$`), w: W(shadeLine(keys, RG3), T(`This is $${name}$.`, `Ini ialah $${name}$.`), ...(keys.length === 3 && keys.includes('AC') ? [T(`Equivalent answer: $${name === '(A \\cup B) \\cap C' ? '(A \\cap C) \\cup (B \\cap C)' : '(A \\cup B) \\cap C'}$ (same region).`, `Jawapan setara: $${name === '(A \\cup B) \\cap C' ? '(A \\cap C) \\cup (B \\cap C)' : '(A \\cup B) \\cap C'}$ (kawasan yang sama).`)] : [])), sp: 's' };
    },
  ];
  const g42e = [
    (r) => {
      const { A, B } = two(r, 14);
      return { q: T(`$A = ${roster(A)}$ and $B = ${roster(B)}$. List the elements of $A \\cup B$ and state $n(A \\cup B)$.`, `$A = ${roster(A)}$ dan $B = ${roster(B)}$. Senaraikan unsur bagi $A \\cup B$ dan nyatakan $n(A \\cup B)$.`), a: T(`$A \\cup B = ${roster(uni(A, B))}$; $n(A \\cup B) = ${uni(A, B).length}$`), w: W(T('$A \\cup B$ = all elements in $A$ or $B$ (or both), each written once.', '$A \\cup B$ = semua unsur dalam $A$ atau $B$ (atau kedua-duanya), setiap satu ditulis sekali.'), `$A \\cup B = ${roster(uni(A, B))}$`, T(`Check: $n(A \\cup B) = n(A) + n(B) - n(A \\cap B) = ${A.length} + ${B.length} - ${inter(A, B).length} = ${uni(A, B).length}$`, `Semak: $n(A \\cup B) = n(A) + n(B) - n(A \\cap B) = ${A.length} + ${B.length} - ${inter(A, B).length} = ${uni(A, B).length}$`)), sp: 's' };
    },
  ];
  const g42m = [
    (r) => {
      const a = r.int(10, 30), b = r.int(10, 30), c = r.int(3, 9), u = a + b - c;
      return { q: T(`In a class, ${a} students play football, ${b} play badminton and ${c} play both. Find the number of students who play at least one of the two sports.`, `Dalam sebuah kelas, ${a} orang murid bermain bola sepak, ${b} bermain badminton dan ${c} bermain kedua-duanya. Cari bilangan murid yang bermain sekurang-kurangnya satu daripada dua sukan itu.`), a: T(`${a} + ${b} - ${c} = ${u}`), w: W(T('Let $F$ = football and $B$ = badminton.', 'Katakan $F$ = bola sepak dan $B$ = badminton.'), `$n(F \\cup B) = n(F) + n(B) - n(F \\cap B)$`, `$= ${a} + ${b} - ${c} = ${u}$`, T(`The ${c} who play both are counted twice in ${a} + ${b}, so subtract them once.`, `${c} orang yang bermain kedua-duanya dikira dua kali dalam ${a} + ${b}, jadi tolak sekali.`)), sp: 's' };
    },
    (r) => {
      const U = range(1, 14), { A, B } = two(r, 14);
      const [name, keys] = r.pick(E2.filter((e) => e[0] === "A' \\cup B" || e[0] === 'A \\cup B'));
      const fig = vennFig(U, [A, B], ['A', 'B'], keys);
      return { q: T('Write an expression for the shaded region and list its elements.', 'Tulis satu ungkapan bagi kawasan berlorek dan senaraikan unsurnya.'), fig, a: T(`$${name} = ${roster(U.filter((x) => keys.includes(regionKey(x, [A, B], ['A', 'B']))))}$`), w: W(shadeLine(keys, RG), T(`This region is $${name}$.`, `Kawasan ini ialah $${name}$.`), ...regionLines(U, A, B, keys)), sp: 's' };
    },
  ];
  const g42a = [
    (r) => {
      const { U, A, B, C } = three(r, 30);
      return { q: T(`$\\xi = ${roster(U)}$, $A$ = multiples of 2, $B$ = multiples of 3 and $C$ = multiples of 5. Find $n(A \\cup B \\cup C)$.`, `$\\xi = ${roster(U)}$, $A$ = gandaan 2, $B$ = gandaan 3 dan $C$ = gandaan 5. Cari $n(A \\cup B \\cup C)$.`), a: T(`${uni(uni(A, B), C).length}`), w: T(`$A \\cup B \\cup C = ${roster(uni(uni(A, B), C))}$`), sp: 'm' };
    },
  ];
  const g43e = [
    (r) => {
      const { U, A, B } = two(r, 14);
      const fig = vennFig(U, [A, B], ['A', 'B'], ['0']);
      return { q: T('In the Venn diagram, the shaded region is outside both circles. Write the set represented and list its elements.', 'Dalam gambar rajah Venn, kawasan berlorek berada di luar kedua-dua bulatan. Tulis set yang diwakili dan senaraikan unsurnya.'), fig, a: T(`$(A \\cup B)' = ${roster(U.filter((x) => !uni(A, B).includes(x)))}$`), w: W(T(`Outside both circles = not in $A \\cup B$, i.e. the complement $(A \\cup B)'$.`, `Di luar kedua-dua bulatan = bukan dalam $A \\cup B$, iaitu pelengkap $(A \\cup B)'$.`), `$A \\cup B = ${roster(uni(A, B))}$`, `$(A \\cup B)' = ${roster(U.filter((x) => !uni(A, B).includes(x)))}$`), sp: 's' };
    },
  ];
  const g43m = [
    (r) => {
      const { U, A, B } = two(r, 14);
      const [name, keys] = r.pick(E2.filter((e) => ["A \\cap B'", "(A \\cap B)'", "A' \\cap B", "A' \\cup B"].includes(e[0])));
      const opts = r.shuffle([[name, true]].concat(r.sample(E2.filter((e) => e[0] !== name && e[1].length !== keys.length).map((e) => [e[0], false]), 3)));
      const fig = vennFig(U, [A, B], ['A', 'B'], keys);
      return { q: T(`Which expression represents the shaded region? ${opts.map((o, i) => `(${'ABCD'[i]}) $${o[0]}$`).join('  ')}`, `Ungkapan manakah yang mewakili kawasan berlorek? ${opts.map((o, i) => `(${'ABCD'[i]}) $${o[0]}$`).join('  ')}`), fig, a: T(`(${'ABCD'[opts.findIndex((o) => o[1])]}) $${name}$`), w: W(shadeLine(keys, RG), T(`Only $${name}$ gives exactly this shaded part; each other option shades a different number of regions.`, `Hanya $${name}$ memberi tepat kawasan berlorek ini; setiap pilihan lain melorek bilangan kawasan yang berbeza.`)), sp: 's' };
    },
  ];
  const g43a = [
    (r) => {
      return retry(() => {
        const reg = { A: r.int(2, 8), B: r.int(2, 8), C: r.int(2, 8), AB: r.int(1, 5), AC: r.int(1, 5), BC: r.int(1, 5), ABC: r.int(1, 4), '0': r.int(2, 8) };
        const nA = reg.A + reg.AB + reg.AC + reg.ABC, nB = reg.B + reg.AB + reg.BC + reg.ABC, nC = reg.C + reg.AC + reg.BC + reg.ABC;
        const tot = sum(Object.values(reg));
        const fig = S.venn({ sets: 3, counts: reg, names: ['A', 'B', 'C'] });
        return { q: T(`A survey of ${tot} students asked which of three clubs they belong to: $A$ (Art), $B$ (Band) and $C$ (Chess). ${nA} are in $A$, ${nB} in $B$ and ${nC} in $C$; ${reg.AB + reg.ABC} are in both $A$ and $B$, ${reg.AC + reg.ABC} in both $A$ and $C$, ${reg.BC + reg.ABC} in both $B$ and $C$; ${reg.ABC} are in all three. Find (a) the number in none of the clubs, (b) the number in exactly one club.`, `Satu tinjauan terhadap ${tot} orang murid bertanya tentang kelab yang mereka sertai: $A$ (Seni), $B$ (Band) dan $C$ (Catur). ${nA} orang dalam $A$, ${nB} dalam $B$ dan ${nC} dalam $C$; ${reg.AB + reg.ABC} dalam $A$ dan $B$, ${reg.AC + reg.ABC} dalam $A$ dan $C$, ${reg.BC + reg.ABC} dalam $B$ dan $C$; ${reg.ABC} dalam ketiga-tiganya. Cari (a) bilangan yang tidak menyertai mana-mana kelab, (b) bilangan yang menyertai tepat satu kelab.`), a: T(`(a) ${reg['0']} (b) ${reg.A + reg.B + reg.C}. ${fig}`, `(a) ${reg['0']} (b) ${reg.A + reg.B + reg.C}. ${fig}`), w: W(T('Fill the Venn diagram from the centre outwards.', 'Isi gambar rajah Venn dari tengah ke luar.'), `$n(A \\cup B \\cup C) = ${nA} + ${nB} + ${nC} - ${reg.AB + reg.ABC} - ${reg.AC + reg.ABC} - ${reg.BC + reg.ABC} + ${reg.ABC} = ${tot - reg['0']}$`, T(`(a) None $= ${tot} - ${tot - reg['0']} = ${reg['0']}$`, `(a) Tiada kelab $= ${tot} - ${tot - reg['0']} = ${reg['0']}$`), T(`(b) $A$ only $= ${nA} - ${reg.AB + reg.ABC} - ${reg.AC + reg.ABC} + ${reg.ABC} = ${reg.A}$; similarly $B$ only $= ${reg.B}$, $C$ only $= ${reg.C}$`, `(b) $A$ sahaja $= ${nA} - ${reg.AB + reg.ABC} - ${reg.AC + reg.ABC} + ${reg.ABC} = ${reg.A}$; begitu juga $B$ sahaja $= ${reg.B}$, $C$ sahaja $= ${reg.C}$`), `$${reg.A} + ${reg.B} + ${reg.C} = ${reg.A + reg.B + reg.C}$`), sp: 'xl' };
      });
    },
  ];
  SPM.addChapter(4, 4, T('Operations on Sets', 'Operasi ke atas Set'), [
    { id: '4.1', en: 'Intersection of sets', ms: 'Persilangan set', gen: { e: g41e, m: g41m, a: g41a } },
    { id: '4.2', en: 'Union of sets', ms: 'Kesatuan set', gen: { e: g42e, m: g42m, a: g42a } },
    { id: '4.3', en: 'Combined operations on sets', ms: 'Operasi gabungan ke atas set', gen: { e: g43e, m: g43m, a: g43a } },
  ]);

  /* =============================================================== 5 */
  const LET = 'ABCDEFGH';
  /** random connected weighted graph */
  function randGraph(r, nv, extra, o) {
    o = o || {};
    return retry(() => {
      const edges = [];
      const has = (a, b) => edges.some((e) => (e[0] === a && e[1] === b) || (!o.directed && e[0] === b && e[1] === a));
      for (let v = 1; v < nv; v++) {
        const u = r.int(0, v - 1);
        edges.push(o.directed && r.chance() ? [v, u, r.int(2, 9)] : [u, v, r.int(2, 9)]);
      }
      let guard = 0;
      while (edges.length < nv - 1 + extra && guard++ < 60) {
        const a = r.int(0, nv - 1), b = r.int(0, nv - 1);
        if (a !== b && !has(a, b)) edges.push([a, b, r.int(2, 9)]);
      }
      need(edges.length === nv - 1 + extra);
      return { nv, edges };
    });
  }
  const netFig = (g, o) => {
    o = o || {};
    const W = 270, H = 210, cx = W / 2, cy = H / 2, R = 78;
    const P = Array.from({ length: g.nv }, (_, i) => [cx + R * Math.cos((2 * Math.PI * i) / g.nv - Math.PI / 2), cy + R * Math.sin((2 * Math.PI * i) / g.nv - Math.PI / 2)]);
    let out = '';
    g.edges.forEach((e, k) => {
      const A = P[e[0]], B = P[e[1]];
      const bold = o.bold && o.bold.includes(k);
      const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
      const sa = [A[0] + (dx / L) * 9, A[1] + (dy / L) * 9], sb = [B[0] - (dx / L) * 9, B[1] - (dy / L) * 9];
      out += o.directed ? S.arrow(sa[0], sa[1], sb[0], sb[1], { w: bold ? 3 : 1.3 }) : S.line(A[0], A[1], B[0], B[1], { w: bold ? 3 : 1.3 });
      if (o.weights !== false && e[2] !== undefined) {
        const mx = (A[0] + B[0]) / 2 + (-dy / L) * 9, my = (A[1] + B[1]) / 2 + (dx / L) * 9;
        out += S.rect(mx - 7, my - 7, 14, 14, { fill: 'var(--bg,#fff)', stroke: 'none' }) + S.text(mx, my, String(e[2]), { s: 11 });
      }
    });
    P.forEach((p, i) => (out += S.circle(p[0], p[1], 9, { fill: 'var(--bg,#fff)' }) + S.text(p[0], p[1], LET[i], { s: 12, b: true })));
    return S.wrap(W, H, out, 'network');
  };
  const degree = (g, v) => g.edges.reduce((s, e) => s + (e[0] === v) + (e[1] === v), 0);
  const adjList = (g) => { const m = Array.from({ length: g.nv }, () => []); g.edges.forEach((e, k) => { m[e[0]].push([e[1], e[2], k]); m[e[1]].push([e[0], e[2], k]); }); return m; };
  /** all simple paths from a to b: [{path, cost}] */
  function paths(g, a, b) {
    const adj = adjList(g), out = [];
    const walk = (v, seen, cost, p) => {
      if (v === b) { out.push({ path: p, cost }); return; }
      for (const [w, c] of adj[v]) if (!seen.includes(w)) walk(w, seen.concat(w), cost + c, p.concat(w));
    };
    walk(a, [a], 0, [a]);
    return out.sort((x, y) => x.cost - y.cost);
  }
  function mst(g) {
    const parent = Array.from({ length: g.nv }, (_, i) => i);
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const order = g.edges.map((e, k) => [e[2], k]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    const used = []; let cost = 0;
    for (const [w, k] of order) { const a = find(g.edges[k][0]), b = find(g.edges[k][1]); if (a !== b) { parent[a] = b; used.push(k); cost += w; } }
    return { used, cost };
  }
  const pathStr = (p) => p.map((v) => LET[v]).join(' \\to ');
  const edgeList = (g) => g.edges.map((e) => LET[e[0]] + LET[e[1]]).join(', ');
  const eName = (e) => LET[e[0]] + LET[e[1]];
  /** edges touching vertex v, as "AB, AC" */
  const edgesAt = (g, v) => g.edges.filter((e) => e[0] === v || e[1] === v).map(eName).join(', ');
  /** weights along a path, as "3 + 5 = 8" */
  const pathSum = (g, p) => {
    const ws = p.slice(1).map((v, i) => g.edges.find((e) => (e[0] === p[i] && e[1] === v) || (e[1] === p[i] && e[0] === v))[2]);
    return ws.length > 1 ? `${ws.join(' + ')} = ${sum(ws)}` : `${ws[0]}`;
  };
  const degLine = (g) => {
    const ds = range(0, g.nv - 1).map((v) => degree(g, v));
    return T(`Edges at each vertex: ${ds.map((d, i) => LET[i] + ' = ' + d).join(', ')} (sum $${ds.join(' + ')} = ${sum(ds)} = 2 \\times ${g.edges.length}$ edges)`, `Tepi pada setiap bucu: ${ds.map((d, i) => LET[i] + ' = ' + d).join(', ')} (hasil tambah $${ds.join(' + ')} = ${sum(ds)} = 2 \\times ${g.edges.length}$ tepi)`);
  };

  const g51e = [
    (r) => {
      const nv = r.int(4, 6), g = randGraph(r, nv, r.int(1, 3));
      return { q: T('The diagram shows a network. Write the number of vertices and the number of edges.', 'Rajah menunjukkan sebuah rangkaian. Tulis bilangan bucu dan bilangan tepi.'), fig: netFig(g, { weights: false }), a: T(`${nv} vertices, ${g.edges.length} edges`, `${nv} bucu, ${g.edges.length} tepi`), w: W(T(`Vertices (labelled points): ${LET.slice(0, nv).split('').join(', ')}, so ${nv} vertices`, `Bucu (titik berlabel): ${LET.slice(0, nv).split('').join(', ')}, maka ${nv} bucu`), T(`Edges (lines joining two vertices): ${edgeList(g)}, so ${g.edges.length} edges`, `Tepi (garis yang menyambung dua bucu): ${edgeList(g)}, maka ${g.edges.length} tepi`)), sp: 's' };
    },
  ];
  const g51m = [
    (r) => {
      const nv = r.int(4, 6), g = randGraph(r, nv, r.int(1, 3));
      const towns = LET.slice(0, nv);
      return { q: T(`The network shows towns ${towns.split('').join(', ')} (vertices) and the roads between them (edges). List the towns that are directly connected to town A.`, `Rangkaian menunjukkan bandar ${towns.split('').join(', ')} (bucu) dan jalan raya antara bandar-bandar itu (tepi). Senaraikan bandar yang bersambung terus dengan bandar A.`), fig: netFig(g, { weights: false }), a: T(g.edges.filter((e) => e[0] === 0 || e[1] === 0).map((e) => LET[e[0] === 0 ? e[1] : e[0]]).sort().join(', ')), w: W(T(`Edges with an end at A: ${edgesAt(g, 0)}`, `Tepi yang berhujung di A: ${edgesAt(g, 0)}`), T(`The other end of each edge is a town directly connected to A: ${g.edges.filter((e) => e[0] === 0 || e[1] === 0).map((e) => LET[e[0] === 0 ? e[1] : e[0]]).sort().join(', ')}`, `Hujung lain setiap tepi ialah bandar yang bersambung terus dengan A: ${g.edges.filter((e) => e[0] === 0 || e[1] === 0).map((e) => LET[e[0] === 0 ? e[1] : e[0]]).sort().join(', ')}`)), sp: 's' };
    },
  ];
  const g51a = [
    (r) => {
      const nv = r.int(4, 5), g = randGraph(r, nv, 2, {});
      return { q: T(`Draw a network for this information: the vertices are ${LET.slice(0, nv).split('').join(', ')} and the edges are ${edgeList(g)}. Then state which vertex has the most edges joined to it.`, `Lukis satu rangkaian bagi maklumat ini: bucunya ialah ${LET.slice(0, nv).split('').join(', ')} dan tepinya ialah ${edgeList(g)}. Kemudian nyatakan bucu yang mempunyai bilangan tepi terbanyak yang bersambung dengannya.`), a: (() => { const ds = range(0, nv - 1).map((v) => degree(g, v)); const mx = Math.max(...ds); return T(`${netFig(g, { weights: false })} Most edges: ${range(0, nv - 1).filter((v) => ds[v] === mx).map((v) => LET[v]).join(', ')} (${mx} edges)`, `${netFig(g, { weights: false })} Tepi terbanyak: ${range(0, nv - 1).filter((v) => ds[v] === mx).map((v) => LET[v]).join(', ')} (${mx} tepi)`); })(), w: W(T(`Draw ${nv} points ${LET.slice(0, nv).split('').join(', ')} and join each listed pair with a line (${g.edges.length} edges).`, `Lukis ${nv} titik ${LET.slice(0, nv).split('').join(', ')} dan sambungkan setiap pasangan tersenarai dengan satu garis (${g.edges.length} tepi).`), degLine(g)), sp: 'l' };
    },
  ];
  const g52e = [
    (r) => {
      const nv = r.int(4, 6), g = randGraph(r, nv, r.int(1, 3)), v = r.int(0, nv - 1);
      return { q: T(`Find the degree of vertex ${LET[v]}.`, `Cari darjah bucu ${LET[v]}.`), fig: netFig(g, { weights: false }), a: T(`${degree(g, v)}`), w: W(T(`Edges joined to ${LET[v]}: ${edgesAt(g, v)}`, `Tepi yang bersambung dengan ${LET[v]}: ${edgesAt(g, v)}`), T(`Degree of ${LET[v]} = number of edges = ${degree(g, v)}`, `Darjah ${LET[v]} = bilangan tepi = ${degree(g, v)}`)), sp: 'xs' };
    },
  ];
  const g52m = [
    (r) => {
      const c = r.pick([
        [T('vertices A, B, C; edges AB, BC, CA', 'bucu A, B, C; tepi AB, BC, CA'), true, T('No loops and no repeated edges.', 'Tiada gelung dan tiada tepi berulang.')],
        [T('vertices A, B, C; edges AB, BC, BC, CA', 'bucu A, B, C; tepi AB, BC, BC, CA'), false, T('The edge BC is repeated (multiple edges).', 'Tepi BC berulang (tepi berganda).')],
        [T('vertices A, B, C; edges AB, BC, CC', 'bucu A, B, C; tepi AB, BC, CC'), false, T('CC is a loop.', 'CC ialah satu gelung.')],
      ]);
      return { q: T(`A graph has ${c[0].en}. Is it a simple graph? Give a reason.`, `Sebuah graf mempunyai ${c[0].ms}. Adakah ia graf ringkas? Berikan sebab.`), a: T(`${c[1] ? 'Yes. ' : 'No. '}${c[2].en}`, `${c[1] ? 'Ya. ' : 'Tidak. '}${c[2].ms}`), w: W(T('A simple graph has no loops and no multiple (repeated) edges.', 'Graf ringkas tiada gelung dan tiada tepi berganda (berulang).'), c[2]), sp: 's' };
    },
    (r) => {
      const nv = r.int(4, 5), g = randGraph(r, nv, 2, { directed: true });
      const v = r.int(0, nv - 1);
      return { q: T(`In the directed graph, find the number of edges leaving vertex ${LET[v]} and the number of edges entering it.`, `Dalam graf berarah, cari bilangan tepi yang keluar dari bucu ${LET[v]} dan bilangan tepi yang masuk ke bucu itu.`), fig: netFig(g, { directed: true, weights: false }), a: T(`Out: ${g.edges.filter((e) => e[0] === v).length}; in: ${g.edges.filter((e) => e[1] === v).length}`, `Keluar: ${g.edges.filter((e) => e[0] === v).length}; masuk: ${g.edges.filter((e) => e[1] === v).length}`), w: (() => {
        const arr = (l) => (l.length ? `$${l.map((e) => LET[e[0]] + ' \\to ' + LET[e[1]]).join(',\\ ')}$` : '–');
        const out = g.edges.filter((e) => e[0] === v), inn = g.edges.filter((e) => e[1] === v);
        return W(T(`Arrows pointing away from ${LET[v]}: ${arr(out)}, so ${out.length} leaving`, `Anak panah yang keluar dari ${LET[v]}: ${arr(out)}, maka ${out.length} keluar`), T(`Arrows pointing into ${LET[v]}: ${arr(inn)}, so ${inn.length} entering`, `Anak panah yang masuk ke ${LET[v]}: ${arr(inn)}, maka ${inn.length} masuk`));
      })(), sp: 's' };
    },
  ];
  const g52a = [
    (r) => {
      const nv = r.int(5, 6), g = randGraph(r, nv, 2);
      const ds = range(0, nv - 1).map((v) => degree(g, v));
      return { q: T('The network is weighted (the numbers are distances in km). List the degree of every vertex, and state which edge is the longest.', 'Rangkaian ini berpemberat (nombor ialah jarak dalam km). Senaraikan darjah setiap bucu, dan nyatakan tepi yang paling panjang.'), fig: netFig(g), a: (() => { const mx = Math.max(...g.edges.map((e) => e[2])); const e = g.edges.filter((x) => x[2] === mx).map(eName); return T(`Degrees: ${ds.map((d, i) => LET[i] + ' = ' + d).join(', ')}; longest edge ${e.join(' and ')} (${mx} km)`, `Darjah: ${ds.map((d, i) => LET[i] + ' = ' + d).join(', ')}; tepi terpanjang ${e.join(' dan ')} (${mx} km)`); })(), w: W(degLine(g), T(`Largest weight: ${Math.max(...g.edges.map((e) => e[2]))} km`, `Pemberat terbesar: ${Math.max(...g.edges.map((e) => e[2]))} km`)), sp: 'm' };
    },
  ];
  const g53e = [
    (r) => {
      const nv = r.int(4, 6);
      const tree = r.chance();
      const g = tree ? randGraph(r, nv, 0) : randGraph(r, nv, 1);
      return { q: T('Is the graph shown a tree? Give a reason.', 'Adakah graf yang ditunjukkan ialah sebuah pokok? Berikan sebab.'), fig: netFig(g, { weights: false }), a: tree ? T(`Yes: it is connected and has no cycles (${nv} vertices, ${nv - 1} edges).`, `Ya: ia bersambung dan tiada kitar (${nv} bucu, ${nv - 1} tepi).`) : T(`No: it contains a cycle (${nv} vertices but ${nv} edges).`, `Tidak: ia mengandungi kitar (${nv} bucu tetapi ${nv} tepi).`), w: W(T(`A tree is connected with no cycle, so a tree with ${nv} vertices has exactly $${nv} - 1 = ${nv - 1}$ edges.`, `Pokok ialah graf bersambung tanpa kitar, jadi pokok dengan ${nv} bucu mempunyai tepat $${nv} - 1 = ${nv - 1}$ tepi.`), tree ? T(`The graph is connected and has ${g.edges.length} edges, so it is a tree.`, `Graf ini bersambung dan mempunyai ${g.edges.length} tepi, maka ia ialah pokok.`) : T(`The graph has ${g.edges.length} edges, one too many, so it contains a cycle and is not a tree.`, `Graf ini mempunyai ${g.edges.length} tepi, lebih satu, maka ia mengandungi kitar dan bukan pokok.`)), sp: 's' };
    },
  ];
  const g53m = [
    (r) => {
      const nv = r.int(4, 5), g = randGraph(r, nv, 2);
      const t = mst({ nv, edges: g.edges.map((e) => [e[0], e[1], 1]) });
      return { q: T('The graph has a cycle. Remove edges to obtain a subgraph that is a tree containing all the vertices. Which edges do you keep?', 'Graf ini mempunyai kitar. Buang beberapa tepi untuk mendapatkan subgraf yang merupakan pokok yang mengandungi semua bucu. Tepi manakah yang anda kekalkan?'), fig: netFig(g, { weights: false }), a: T(`One possible answer: ${t.used.map((k) => LET[g.edges[k][0]] + LET[g.edges[k][1]]).join(', ')} (${nv - 1} edges, connected, no cycle)`, `Satu jawapan yang mungkin: ${t.used.map((k) => LET[g.edges[k][0]] + LET[g.edges[k][1]]).join(', ')} (${nv - 1} tepi, bersambung, tiada kitar)`), w: W(T(`A tree on ${nv} vertices has $${nv} - 1 = ${nv - 1}$ edges, so remove $${g.edges.length} - ${nv - 1} = ${g.edges.length - nv + 1}$ edges.`, `Pokok dengan ${nv} bucu mempunyai $${nv} - 1 = ${nv - 1}$ tepi, jadi buang $${g.edges.length} - ${nv - 1} = ${g.edges.length - nv + 1}$ tepi.`), T(`Remove: ${g.edges.filter((e, k) => !t.used.includes(k)).map(eName).join(', ')} (each breaks a cycle and no vertex is cut off)`, `Buang: ${g.edges.filter((e, k) => !t.used.includes(k)).map(eName).join(', ')} (setiap satu memutuskan kitar dan tiada bucu terpisah)`)), sp: 'm' };
    },
  ];
  const g54e = [
    (r) => {
      const nv = r.int(4, 5), g = randGraph(r, nv, 1);
      const rows = range(0, nv - 1).map((i) => [LET[i], ...range(0, nv - 1).map((j) => (g.edges.some((e) => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i)) ? 1 : 0))]);
      return { q: T(`The table shows which of ${nv} villages are joined by a direct road (1 = road). Draw a network to represent the information.<br>${SPM.table(rows, { head: ['', ...LET.slice(0, nv).split('')], rowHead: true })}`, `Jadual menunjukkan kampung yang dihubungkan oleh jalan terus daripada ${nv} buah kampung (1 = ada jalan). Lukis rangkaian untuk mewakili maklumat itu.<br>${SPM.table(rows, { head: ['', ...LET.slice(0, nv).split('')], rowHead: true })}`), a: T(netFig(g, { weights: false }), netFig(g, { weights: false })), w: W(T(`Each 1 is a road (edge); the table is symmetric, so read only above the diagonal: ${edgeList(g)}`, `Setiap 1 ialah jalan (tepi); jadual itu simetri, jadi baca hanya di atas pepenjuru: ${edgeList(g)}`), T(`Draw ${nv} vertices and ${g.edges.length} edges.`, `Lukis ${nv} bucu dan ${g.edges.length} tepi.`)), sp: 'xl' };
    },
  ];
  const g55e = [
    (r) => ({ q: T('State one way in which a transport network diagram (such as an LRT route map) differs from a geographical map.', 'Nyatakan satu cara sebuah rajah rangkaian pengangkutan (seperti peta laluan LRT) berbeza daripada peta geografi.'), a: T('The network diagram shows which stations are connected and in what order, not the true distances or directions; a geographical map shows real positions and distances.', 'Rajah rangkaian menunjukkan stesen yang bersambung dan susunannya, bukan jarak atau arah sebenar; peta geografi menunjukkan kedudukan dan jarak sebenar.'), w: T('Key idea: a network keeps only the connections (vertices and edges); its layout is not drawn to scale.', 'Idea utama: rangkaian hanya mengekalkan hubungan (bucu dan tepi); susun aturnya tidak dilukis mengikut skala.'), sp: 's' }),
  ];
  const g55m = [
    (r) => {
      const nv = 5, g = randGraph(r, nv, 2);
      const ps = paths(g, 0, nv - 1);
      const byStops = ps.slice().sort((a, b) => a.path.length - b.path.length)[0];
      const ties = ps.filter((p) => p.path.length === byStops.path.length && p !== byStops);
      const alsoEn = ties.length ? ` (also ${ties.map((p) => `$${pathStr(p.path)}$`).join(', ')})` : '';
      const alsoMs = ties.length ? ` (juga ${ties.map((p) => `$${pathStr(p.path)}$`).join(', ')})` : '';
      return { q: T(`The network shows bus stops ${LET.slice(0, nv).split('').join(', ')} joined by direct routes. Find the route from A to ${LET[nv - 1]} that passes through the fewest stops.`, `Rangkaian menunjukkan perhentian bas ${LET.slice(0, nv).split('').join(', ')} yang dihubungkan oleh laluan terus. Cari laluan dari A ke ${LET[nv - 1]} yang melalui bilangan perhentian paling sedikit.`), fig: netFig(g, { weights: false }), a: T(`$${pathStr(byStops.path)}$ (${byStops.path.length - 1} route${byStops.path.length > 2 ? 's' : ''})${alsoEn}`, `$${pathStr(byStops.path)}$ (${byStops.path.length - 1} laluan)${alsoMs}`), w: W(T('Fewest stops = fewest edges on the route; ignore any route that revisits a stop.', 'Perhentian paling sedikit = tepi paling sedikit pada laluan; abaikan laluan yang melawat semula sesuatu perhentian.'), (byStops.path.length === 2 ? T(`A is joined directly to ${LET[nv - 1]}: 1 edge`, `A bersambung terus dengan ${LET[nv - 1]}: 1 tepi`) : T(`A is not joined directly to ${LET[nv - 1]}${byStops.path.length > 3 ? ' and no single stop links them' : ''}; the shortest route uses ${byStops.path.length - 1} edges: $${pathStr(byStops.path)}$`, `A tidak bersambung terus dengan ${LET[nv - 1]}${byStops.path.length > 3 ? ' dan tiada satu perhentian yang menghubungkannya' : ''}; laluan terpendek menggunakan ${byStops.path.length - 1} tepi: $${pathStr(byStops.path)}$`))), sp: 's' };
    },
  ];
  const g56e = [
    (r) => {
      const nv = 4, g = randGraph(r, nv, 1);
      const ps = paths(g, 0, nv - 1);
      need(ps.length >= 2 && ps[0].cost < ps[1].cost);
      return { q: T(`The network shows distances (km). Compare the routes $${pathStr(ps[0].path)}$ and $${pathStr(ps[1].path)}$ from A to ${LET[nv - 1]} and state which is shorter.`, `Rangkaian menunjukkan jarak (km). Bandingkan laluan $${pathStr(ps[0].path)}$ dan $${pathStr(ps[1].path)}$ dari A ke ${LET[nv - 1]} dan nyatakan yang lebih pendek.`), fig: netFig(g), a: T(`$${pathStr(ps[0].path)}$: ${ps[0].cost} km; $${pathStr(ps[1].path)}$: ${ps[1].cost} km. The first is shorter.`, `$${pathStr(ps[0].path)}$: ${ps[0].cost} km; $${pathStr(ps[1].path)}$: ${ps[1].cost} km. Yang pertama lebih pendek.`), w: W(`$${pathStr(ps[0].path)}: ${pathSum(g, ps[0].path)}$ km`, `$${pathStr(ps[1].path)}: ${pathSum(g, ps[1].path)}$ km`, `$${ps[0].cost} < ${ps[1].cost}$`), sp: 'm' };
    },
  ];
  const g56m = [
    (r) => {
      const nv = 5, g = randGraph(r, nv, 3);
      const ps = paths(g, 0, nv - 1);
      need(ps.length >= 3 && ps[0].cost < ps[1].cost);
      return { q: T(`The network shows travel times in minutes. List all routes from A to ${LET[nv - 1]} that do not visit a vertex twice, and find the route with the least total time.`, `Rangkaian menunjukkan masa perjalanan dalam minit. Senaraikan semua laluan dari A ke ${LET[nv - 1]} yang tidak melawat sesuatu bucu dua kali, dan cari laluan dengan jumlah masa paling singkat.`), fig: netFig(g), a: T(`${ps.map((p) => `$${pathStr(p.path)}$: ${p.cost}`).join('; ')}. Shortest: $${pathStr(ps[0].path)}$, ${ps[0].cost} minutes.`, `${ps.map((p) => `$${pathStr(p.path)}$: ${p.cost}`).join('; ')}. Paling singkat: $${pathStr(ps[0].path)}$, ${ps[0].cost} minit.`), w: W(...ps.map((p) => `$${pathStr(p.path)}: ${pathSum(g, p.path)}$`), T(`Least total time: $${ps[0].cost}$ minutes`, `Jumlah masa paling singkat: $${ps[0].cost}$ minit`)), sp: 'xl' };
    },
  ];
  const g56a = [
    (r) => {
      const nv = r.int(5, 6), g = randGraph(r, nv, 3);
      const t = mst(g);
      return { q: T(`A company wants to connect ${nv} offices with cables so that every office is linked (directly or indirectly). The weights on the network show the cost (RM thousand) of laying each cable. Choose the cables that give the least total cost and find that cost.`, `Sebuah syarikat mahu menyambungkan ${nv} buah pejabat dengan kabel supaya setiap pejabat bersambung (secara langsung atau tidak langsung). Pemberat pada rangkaian menunjukkan kos (RM ribu) memasang setiap kabel. Pilih kabel yang memberikan jumlah kos paling rendah dan cari kos itu.`), fig: netFig(g), a: T(`Cables: ${t.used.map((k) => LET[g.edges[k][0]] + LET[g.edges[k][1]]).join(', ')}; total RM${t.cost} thousand (${nv - 1} cables, no cycle).`, `Kabel: ${t.used.map((k) => LET[g.edges[k][0]] + LET[g.edges[k][1]]).join(', ')}; jumlah RM${t.cost} ribu (${nv - 1} kabel, tiada kitar).`), w: (() => {
        const last = g.edges[t.used[t.used.length - 1]][2];
        const skip = g.edges.filter((e, k) => !t.used.includes(k) && e[2] <= last).map(eName);
        return W(T('Take the cheapest cables one at a time, skipping any cable that would form a cycle, until all offices are linked.', 'Ambil kabel paling murah satu demi satu, langkau kabel yang akan membentuk kitar, sehingga semua pejabat bersambung.'), T(`Chosen: ${t.used.map((k) => `${eName(g.edges[k])} (${g.edges[k][2]})`).join(', ')}`, `Dipilih: ${t.used.map((k) => `${eName(g.edges[k])} (${g.edges[k][2]})`).join(', ')}`), ...(skip.length ? [T(`Skipped (would form a cycle): ${skip.join(', ')}`, `Dilangkau (akan membentuk kitar): ${skip.join(', ')}`)] : []), T(`Total $= ${t.used.map((k) => g.edges[k][2]).join(' + ')} = ${t.cost}$, i.e. RM${t.cost} thousand`, `Jumlah $= ${t.used.map((k) => g.edges[k][2]).join(' + ')} = ${t.cost}$, iaitu RM${t.cost} ribu`));
      })(), sp: 'l' };
    },
  ];
  const g5Ee = [
    (r) => {
      const nv = r.int(5, 7);
      const kn = (nv * (nv - 1)) / 2;
      return { q: T(`A graph has ${nv} vertices, each joined to every other vertex by exactly one edge. How many edges does it have? What is the degree of each vertex, and the sum of all degrees?`, `Sebuah graf mempunyai ${nv} bucu, setiap satu dihubungkan dengan setiap bucu lain oleh tepat satu tepi. Berapakah bilangan tepinya? Apakah darjah setiap bucu dan hasil tambah semua darjah?`), a: T(`Edges: ${kn}; each degree ${nv - 1}; sum of degrees ${nv * (nv - 1)} = 2 × ${kn}`, `Tepi: ${kn}; setiap darjah ${nv - 1}; hasil tambah darjah ${nv * (nv - 1)} = 2 × ${kn}`), w: W(T(`Each vertex is joined to the other ${nv - 1} vertices, so each degree is ${nv - 1}.`, `Setiap bucu disambung dengan ${nv - 1} bucu yang lain, maka setiap darjah ialah ${nv - 1}.`), T(`Sum of degrees $= ${nv} \\times ${nv - 1} = ${nv * (nv - 1)}$`, `Hasil tambah darjah $= ${nv} \\times ${nv - 1} = ${nv * (nv - 1)}$`), T(`Each edge adds 2 to the sum (one at each end): edges $= \\dfrac{${nv * (nv - 1)}}{2} = ${kn}$`, `Setiap tepi menambah 2 kepada hasil tambah (satu di setiap hujung): tepi $= \\dfrac{${nv * (nv - 1)}}{2} = ${kn}$`)), sp: 'm' };
    },
  ];
  SPM.addChapter(4, 5, T('Network in Graph Theory', 'Rangkaian dalam Teori Graf'), [
    { id: '5.1', en: 'Graphs and networks', ms: 'Graf dan rangkaian', gen: { e: g51e, m: g51m, a: g51a } },
    { id: '5.2', en: 'Types and features of graphs', ms: 'Jenis dan ciri graf', gen: { e: g52e, m: g52m, a: g52a } },
    { id: '5.3', en: 'Subgraphs and trees', ms: 'Subgraf dan pokok', gen: { e: g53e, m: g53m, a: g53m } },
    { id: '5.4', en: 'Representing real information', ms: 'Mewakilkan maklumat sebenar', gen: { e: g54e, m: g51m, a: g51a } },
    { id: '5.5', en: 'Transport networks and maps', ms: 'Rangkaian pengangkutan dan peta', gen: { e: g55e, m: g55m, a: g55m } },
    { id: '5.6', en: 'Optimal cost', ms: 'Kos optimum', gen: { e: g56e, m: g56m, a: g56a } },
    { id: '5.E', en: 'Formal graph results', ms: 'Keputusan formal graf', scope: 'enrichment', gen: { e: g5Ee, m: g5Ee, a: g5Ee } },
  ]);
})();
