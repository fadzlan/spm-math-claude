/* Variety pack x5c: Form 5 Ch5 (Congruency, Enlargement, Combined Transformations, Tessellation)
 * and Ch6 (Ratios and Graphs of Trigonometric Functions). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, round, Fr, poly, lin, rm, sum } = SPM;
  const S = SPM.svg, F = SPM.figs;
  const T = SPM.L;
  const NTS = SPM.NTS;
  const pt = (p) => `(${n(p[0])}, ${n(p[1])})`;
  const tv = (v) => `\\begin{pmatrix} ${n(v[0])} \\\\ ${n(v[1])} \\end{pmatrix}`;
  const rad = (d) => (d * Math.PI) / 180;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  /** substitute {key} placeholders in a bilingual forms-bank pick */
  const pf = (r, forms, vars) => {
    const f = r.pick(forms);
    const sub = (s) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
    return T(sub(f.en), sub(f.ms));
  };
  const letPick = (r) => r.pick([['A', 'B', 'C', 'P', 'Q', 'R'], ['X', 'Y', 'Z', 'D', 'E', 'F'], ['K', 'L', 'M', 'R', 'S', 'T'], ['P', 'Q', 'R', 'L', 'M', 'N'], ['A', 'B', 'C', 'X', 'Y', 'Z']]);

  /* =============================================================== 5.1 Congruency */
  const COND = [
    { en: 'three pairs of corresponding sides equal', ms: 'tiga pasang sisi sepadan yang sama panjang', rule: 'SSS', ok: true },
    { en: 'two pairs of corresponding sides equal and the included angle between them equal', ms: 'dua pasang sisi sepadan yang sama panjang dan sudut yang diapit antaranya sama', rule: 'SAS', ok: true },
    { en: 'two pairs of corresponding angles equal and the side between them equal', ms: 'dua pasang sudut sepadan yang sama dan sisi yang diapit antaranya sama', rule: 'ASA', ok: true },
    { en: 'two pairs of corresponding angles equal and a corresponding side that is not between them equal', ms: 'dua pasang sudut sepadan yang sama dan satu sisi sepadan yang tidak diapit antaranya, sama', rule: 'AAS', ok: true },
    { en: "the hypotenuse and one other side of two right-angled triangles equal", ms: 'hipotenus dan satu sisi lain bagi dua segi tiga bersudut tegak, sama', rule: 'RHS', ok: true },
    { en: 'three pairs of corresponding angles equal, with no side given', ms: 'tiga pasang sudut sepadan yang sama, tanpa sebarang sisi diberi', rule: 'AAA', ok: false },
    { en: 'two pairs of corresponding sides equal and a non-included angle equal', ms: 'dua pasang sisi sepadan yang sama dan satu sudut yang tidak diapit, sama', rule: 'SSA', ok: false },
    { en: 'only one pair of corresponding sides equal', ms: 'hanya sepasang sisi sepadan yang sama', rule: '—', ok: false },
    { en: 'two pairs of corresponding angles equal, with no side given', ms: 'dua pasang sudut sepadan yang sama, tanpa sebarang sisi diberi', rule: '—', ok: false },
    { en: 'equal areas', ms: 'luas yang sama', rule: '—', ok: false },
    { en: 'equal perimeters', ms: 'perimeter yang sama', rule: '—', ok: false },
  ];
  const OKC = COND.filter((c) => c.ok), BADC = COND.filter((c) => !c.ok);
  const randTri = (r, lo, hi) => retry(() => {
    const s = [r.int(lo, hi), r.int(lo, hi), r.int(lo, hi)].sort((a, b) => a - b);
    need(s[0] + s[1] > s[2] && s[0] !== s[1] && s[1] !== s[2]);
    return s;
  });
  const RT3 = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 16, 20]];
  const triFig = (names, sideLab, o) => F.triangle(Object.assign({ names, a: 50, b: 68, sides: sideLab }, o || {}));

  const g51e = [
    (r) => {
      const a = randTri(r, 4, 14), b = r.shuffle(a), c = retry(() => { const t = randTri(r, 4, 14); need(t.join() !== [...a].sort().join()); return t; });
      const [x, y, z] = letPick(r);
      const forms = [
        { en: 'Triangle {x} has sides {A} cm, {B} cm, {C} cm. Triangle {y} has sides {D} cm, {E} cm, {F} cm. Triangle {z} has sides {G} cm, {H} cm, {I} cm. Which two triangles are congruent? State the rule.', ms: 'Segi tiga {x} mempunyai sisi {A} cm, {B} cm, {C} cm. Segi tiga {y} mempunyai sisi {D} cm, {E} cm, {F} cm. Segi tiga {z} mempunyai sisi {G} cm, {H} cm, {I} cm. Dua segi tiga manakah yang kongruen? Nyatakan syaratnya.' },
        { en: 'Three triangles {x}, {y}, {z} have sides ({A}, {B}, {C}), ({D}, {E}, {F}) and ({G}, {H}, {I}) cm respectively. Identify the congruent pair and name the condition satisfied.', ms: 'Tiga segi tiga {x}, {y}, {z} masing-masing mempunyai sisi ({A}, {B}, {C}), ({D}, {E}, {F}) dan ({G}, {H}, {I}) cm. Kenal pasti pasangan yang kongruen dan namakan syarat yang dipenuhi.' },
      ];
      const nm = (t) => t.join(' cm, ') + ' cm';
      const q = pf(r, forms, { x, y, z, A: a[0], B: a[1], C: a[2], D: b[0], E: b[1], F: b[2], G: c[0], H: c[1], I: c[2] });
      return { q, a: T(`${x} and ${y}: all three pairs of corresponding sides are equal (SSS).`, `${x} dan ${y}: ketiga-tiga pasang sisi sepadan adalah sama (SSS).`), sp: 's' };
    },
    (r) => {
      const a = randTri(r, 4, 13), b = r.shuffle(a);
      const [x, y] = letPick(r);
      const fig = [triFig([x, x + "'", x + "''"], { AB: a[2] + ' cm', BC: a[0] + ' cm', AC: a[1] + ' cm' }), triFig(['P', 'Q', 'R'], { AB: b[2] + ' cm', BC: b[0] + ' cm', AC: b[1] + ' cm' })];
      return { q: T(`The diagram shows two triangles. Are they congruent? Give a reason. ${NTS.en}`, `Rajah menunjukkan dua segi tiga. Adakah kedua-duanya kongruen? Berikan sebab. ${NTS.ms}`), fig, a: T('Yes: all three pairs of corresponding sides are equal (SSS).', 'Ya: ketiga-tiga pasang sisi sepadan adalah sama (SSS).'), sp: 's' };
    },
    (r) => {
      const c = r.pick(OKC);
      const f = r.pick([
        { en: 'Two triangles are known to have {c}. Name the congruency rule this illustrates.', ms: 'Dua segi tiga diketahui mempunyai {c}. Namakan syarat kekongruenan yang digambarkan ini.' },
        { en: 'Which congruency rule is described by "{c}"?', ms: 'Syarat kekongruenan yang manakah digambarkan oleh "{c}"?' },
        { en: 'State the short name (SSS, SAS, ASA, AAS or RHS) for the congruency condition: {c}.', ms: 'Nyatakan nama ringkas (SSS, SAS, ASA, AAS atau RHS) bagi syarat kekongruenan: {c}.' },
      ]);
      return { q: T(f.en.replace('{c}', c.en), f.ms.replace('{c}', c.ms)), a: T(`$${c.rule}$`), sp: 'xs' };
    },
    (r) => {
      const ok = r.pick(OKC), bad = r.sample(BADC, 3);
      const opts = r.shuffle([ok, ...bad]);
      const letters = 'ABCD';
      const list = opts.map((o, i) => `(${letters[i]}) ${o.en}`).join('; ');
      const listms = opts.map((o, i) => `(${letters[i]}) ${o.ms}`).join('; ');
      const forms = [
        { en: 'Which set of given data is enough, on its own, to prove two triangles are congruent? {list}', ms: 'Set data manakah yang mencukupi, dengan sendirinya, untuk membuktikan dua segi tiga kongruen? {list}' },
        { en: 'One of the following data sets guarantees congruent triangles; the rest do not. Which one? {list}', ms: 'Salah satu set data berikut menjamin segi tiga kongruen; yang lain tidak. Yang manakah? {list}' },
      ];
      const f = r.pick(forms);
      return { q: T(f.en.replace('{list}', list), f.ms.replace('{list}', listms)), a: T(`(${letters[opts.indexOf(ok)]}) — ${ok.rule}`), sp: 's' };
    },
    (r) => {
      const st = r.pick([
        [T('Congruent figures have exactly the same shape and the same size.', 'Rajah kongruen mempunyai bentuk yang sama dan saiz yang sama.'), true],
        [T('Two figures can be congruent even if one is larger than the other, as long as the shape is the same.', 'Dua rajah boleh kongruen walaupun satu lebih besar daripada yang lain, asalkan bentuknya sama.'), false],
        [T('If two triangles are similar, they must also be congruent.', 'Jika dua segi tiga serupa, kedua-duanya juga mesti kongruen.'), false],
        [T('SSS means that three pairs of corresponding sides being equal is enough to prove two triangles congruent.', 'SSS bermaksud tiga pasang sisi sepadan yang sama sudah mencukupi untuk membuktikan dua segi tiga kongruen.'), true],
        [T('Knowing that three pairs of corresponding angles are equal (AAA) is enough to prove two triangles congruent.', 'Mengetahui tiga pasang sudut sepadan yang sama (AAA) sudah mencukupi untuk membuktikan dua segi tiga kongruen.'), false],
        [T('RHS can only be used for right-angled triangles.', 'RHS hanya boleh digunakan untuk segi tiga bersudut tegak.'), true],
        [T('If $\\triangle ABC \\equiv \\triangle PQR$, then $AB = PQ$.', 'Jika $\\triangle ABC \\equiv \\triangle PQR$, maka $AB = PQ$.'), true],
        [T('If $\\triangle ABC \\equiv \\triangle PQR$, then $AB$ must equal $QR$.', 'Jika $\\triangle ABC \\equiv \\triangle PQR$, maka $AB$ mesti sama dengan $QR$.'), false],
        [T('A right-angled triangle can be proved congruent to another just by matching their hypotenuses, with no other information.', 'Sebuah segi tiga bersudut tegak boleh dibuktikan kongruen dengan yang lain hanya dengan memadankan hipotenusnya sahaja, tanpa maklumat lain.'), false],
        [T('Corresponding sides and corresponding angles of two congruent triangles are always equal.', 'Sisi sepadan dan sudut sepadan bagi dua segi tiga yang kongruen adalah sentiasa sama.'), true],
        [T('Two right-angled triangles with both pairs of legs (the two shorter sides) equal must be congruent.', 'Dua segi tiga bersudut tegak dengan kedua-dua pasang kaki (dua sisi lebih pendek) yang sama mestilah kongruen.'), true],
        [T('Any two equilateral triangles are automatically congruent to each other, whatever their side length.', 'Mana-mana dua segi tiga sama sisi adalah secara automatik kongruen antara satu sama lain, walau apa pun panjang sisinya.'), false],
      ]);
      return { q: T(`True or false? "${st[0].en}"`, `Benar atau palsu? "${st[0].ms}"`), a: st[1] ? T('True', 'Benar') : T('False', 'Palsu'), sp: 'xs' };
    },
    (r) => {
      const [x, y, z, p, q, s] = letPick(r);
      const val = r.int(4, 15), giveSide = r.chance();
      if (giveSide) {
        return { q: T(`$\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$ and $${x}${y} = ${val}$ cm. Find $${p}${q}$.`, `$\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$ dan $${x}${y} = ${val}$ cm. Cari $${p}${q}$.`), a: T(`$${val}$ cm`), sp: 'xs' };
      }
      return { q: T(`$\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$ and $\\angle ${y} = ${val + 30}^\\circ$. Find $\\angle ${q}$.`, `$\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$ dan $\\angle ${y} = ${val + 30}^\\circ$. Cari $\\angle ${q}$.`), a: T(`$${val + 30}^\\circ$`), sp: 'xs' };
    },
    (r) => {
      const t = r.pick(RT3);
      const [x, y, z, p, q, s] = letPick(r);
      const fig = [triFig([x, y, z], { AC: t[2] + ' cm', AB: t[0] + ' cm' }, { right: 'B' }), triFig([p, q, s], { AC: t[2] + ' cm', AB: t[0] + ' cm' }, { right: 'B' })];
      return { q: T(`Both triangles are right-angled at ${y} and ${q}. The hypotenuses $${x}${z} = ${p}${s} = ${t[2]}$ cm and $${x}${y} = ${p}${q} = ${t[0]}$ cm. Name the rule that proves they are congruent. ${NTS.en}`, `Kedua-dua segi tiga bersudut tegak di ${y} dan ${q}. Hipotenus $${x}${z} = ${p}${s} = ${t[2]}$ cm dan $${x}${y} = ${p}${q} = ${t[0]}$ cm. Namakan syarat yang membuktikan kedua-duanya kongruen. ${NTS.ms}`), fig, a: T('$RHS$'), sp: 'xs' };
    },
  ];
  const g51m = [
    (r) => {
      const c = r.pick(COND);
      const forms = [
        { en: 'Two triangles have {c}. Is this enough to prove that the triangles are congruent? Name the condition, or explain why not.', ms: 'Dua segi tiga mempunyai {c}. Adakah ini mencukupi untuk membuktikan bahawa kedua-dua segi tiga itu kongruen? Namakan syarat itu, atau terangkan mengapa tidak.' },
        { en: 'A student is given that two triangles have {c}. Can the student conclude the triangles are congruent? Justify your answer.', ms: 'Seorang murid diberitahu bahawa dua segi tiga mempunyai {c}. Bolehkah murid itu membuat kesimpulan bahawa kedua-dua segi tiga itu kongruen? Wajarkan jawapan anda.' },
      ];
      const f = r.pick(forms);
      const q = T(f.en.replace('{c}', c.en), f.ms.replace('{c}', c.ms));
      return { q, a: c.ok ? T(`Yes: ${c.rule}.`, `Ya: ${c.rule}.`) : T(`No: this does not guarantee congruence (e.g. two triangles of different sizes, or two different triangles, can share this data).`, `Tidak: ini tidak menjamin kekongruenan (cth. dua segi tiga berlainan saiz, atau dua segi tiga berbeza, boleh mempunyai data yang sama ini).`), sp: 's' };
    },
    (r) => {
      const c = r.pick(OKC.filter((k) => k.rule === 'SAS' || k.rule === 'ASA' || k.rule === 'AAS'));
      const a = r.int(5, 12), b = r.int(5, 12), ang1 = r.pick([35, 40, 55, 65, 70, 80]);
      const [x, y, z, p, q, s] = letPick(r);
      return { q: T(`Triangles ${x}${y}${z} and ${p}${q}${s} have ${x}${y} = ${p}${q} = ${a} cm, ${y}${z} = ${q}${s} = ${b} cm and $\\angle ${y} = \\angle ${q} = ${ang1}^\\circ$. State the condition that proves they are congruent, and name the angle in $\\triangle ${p}${q}${s}$ corresponding to $\\angle ${x}$.`, `Segi tiga ${x}${y}${z} dan ${p}${q}${s} mempunyai ${x}${y} = ${p}${q} = ${a} cm, ${y}${z} = ${q}${s} = ${b} cm dan $\\angle ${y} = \\angle ${q} = ${ang1}^\\circ$. Nyatakan syarat yang membuktikan kedua-duanya kongruen, dan namakan sudut dalam $\\triangle ${p}${q}${s}$ yang sepadan dengan $\\angle ${x}$.`), a: T(`SAS: two sides and the included angle are equal. $\\angle ${x}$ corresponds to $\\angle ${p}$.`, `SAS: dua sisi dan sudut yang diapit adalah sama. $\\angle ${x}$ sepadan dengan $\\angle ${p}$.`), sp: 'm' };
    },
    (r) => {
      const t = r.pick(RT3), extra = r.pick([2, 3, 4, 5]);
      const [x, y, z, p, qq, s] = letPick(r);
      const forms = [
        { en: 'A ramp forms right-angled triangle {x}{y}{z} (right angle at {y}) and a second ramp forms right-angled triangle {p}{q}{s} (right angle at {q}). The hypotenuses {x}{z} = {p}{s} = {hyp} m and {x}{y} = {p}{q} = {leg} m. Show the triangles are congruent and find $\\angle {z}$ if $\\angle {s} = {ang}^\\circ$.', ms: 'Satu tanjakan membentuk segi tiga bersudut tegak {x}{y}{z} (sudut tegak di {y}) dan satu lagi tanjakan membentuk segi tiga bersudut tegak {p}{q}{s} (sudut tegak di {q}). Hipotenus {x}{z} = {p}{s} = {hyp} m dan {x}{y} = {p}{q} = {leg} m. Tunjukkan segi tiga itu kongruen dan cari $\\angle {z}$ jika $\\angle {s} = {ang}^\\circ$.' },
      ];
      const ang = 90 - extra * 6;
      need(ang > 10 && ang < 80);
      const q = pf(r, forms, { x, y, z, p, q: qq, s, hyp: t[2], leg: t[0], ang });
      return { q, a: T(`RHS: the hypotenuse and one leg are equal ($${t[2]}$ m and $${t[0]}$ m), with the right angle at ${y} and ${qq}. So $\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${qq}${s}$, and $\\angle ${z} = \\angle ${s} = ${ang}^\\circ$.`, `RHS: hipotenus dan satu kaki adalah sama ($${t[2]}$ m dan $${t[0]}$ m), dengan sudut tegak di ${y} dan ${qq}. Jadi $\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${qq}${s}$, dan $\\angle ${z} = \\angle ${s} = ${ang}^\\circ$.`), sp: 'm' };
    },
    (r) => {
      const cs = r.sample(COND, 3);
      const letters = ['P', 'Q', 'R'];
      const list = cs.map((c, i) => `(${letters[i]}) ${c.en}`).join('; ');
      const listms = cs.map((c, i) => `(${letters[i]}) ${c.ms}`).join('; ');
      return { q: T(`Match each set of given data to the congruency rule it illustrates (choose from SSS, SAS, ASA, AAS, RHS, or "not sufficient"): ${list}.`, `Padankan setiap set data yang diberi dengan syarat kekongruenan yang digambarkannya (pilih daripada SSS, SAS, ASA, AAS, RHS, atau "tidak mencukupi"): ${listms}.`), a: T(cs.map((c, i) => `${letters[i]}: ${c.ok ? c.rule : 'not sufficient'}`).join('; ')), sp: 'm' };
    },
    (r) => {
      const wrong = r.pick(['AAA', 'SSA']);
      const [x, y, z, p, qv, s] = letPick(r);
      const forms = wrong === 'AAA'
        ? [{ en: 'A student writes: "$\\triangle {x}{y}{z}$ and $\\triangle {p}{q}{s}$ have all three pairs of corresponding angles equal, so they are congruent." Explain the error in this statement, and state what can correctly be concluded.', ms: 'Seorang murid menulis: "$\\triangle {x}{y}{z}$ dan $\\triangle {p}{q}{s}$ mempunyai ketiga-tiga pasang sudut sepadan yang sama, jadi kedua-duanya kongruen." Terangkan kesilapan dalam kenyataan ini, dan nyatakan apa yang boleh disimpulkan dengan betul.' }]
        : [{ en: 'A student writes: "$\\triangle {x}{y}{z}$ and $\\triangle {p}{q}{s}$ have two pairs of corresponding sides equal and a non-included angle equal, so they are congruent (SSA)." Explain the error in this statement.', ms: 'Seorang murid menulis: "$\\triangle {x}{y}{z}$ dan $\\triangle {p}{q}{s}$ mempunyai dua pasang sisi sepadan yang sama dan satu sudut tidak diapit yang sama, jadi kedua-duanya kongruen (SSA)." Terangkan kesilapan dalam kenyataan ini.' }];
      const q = pf(r, forms, { x, y, z, p, q: qv, s });
      const ans = wrong === 'AAA' ? T('AAA only shows the triangles are similar (same shape); their sizes can still differ, so it does not prove congruency.', 'AAA hanya menunjukkan segi tiga itu serupa (bentuk sama); saiznya masih boleh berbeza, jadi ia tidak membuktikan kekongruenan.') : T('SSA can fit two different triangles with the same data (the angle is not between the two known sides), so it does not always fix a unique triangle.', 'SSA boleh sepadan dengan dua segi tiga berbeza dengan data yang sama (sudut itu tidak diapit oleh dua sisi yang diketahui), jadi ia tidak sentiasa menentukan satu segi tiga yang unik.');
      return { q, a: ans, sp: 'm' };
    },
    (r) => {
      const rule = r.pick(['SAS', 'ASA', 'AAS']);
      const [x, y, z, p, q, s] = letPick(r);
      const missing = rule === 'SAS' ? T(`the included angle $\\angle ${y}$ (and its equal $\\angle ${q}$)`, `sudut yang diapit $\\angle ${y}$ (dan sudut sepadannya $\\angle ${q}$)`) : rule === 'ASA' ? T(`the side $${y}${z}$ between the two known angles (and its equal $${q}${s}$)`, `sisi $${y}${z}$ di antara dua sudut yang diketahui (dan sisi sepadannya $${q}${s}$)`) : T(`a corresponding side not between the two known angles, e.g. $${x}${y}$ (and its equal $${p}${q}$)`, `sisi sepadan yang tidak diapit oleh dua sudut yang diketahui, cth. $${x}${y}$ (dan sisi sepadannya $${p}${q}$)`);
      const given = rule === 'SAS' ? T(`$${x}${y} = ${p}${q}$ and $${y}${z} = ${q}${s}$`, `$${x}${y} = ${p}${q}$ dan $${y}${z} = ${q}${s}$`) : rule === 'ASA' ? T(`$\\angle ${x} = \\angle ${p}$ and $\\angle ${z} = \\angle ${s}$`, `$\\angle ${x} = \\angle ${p}$ dan $\\angle ${z} = \\angle ${s}$`) : T(`$\\angle ${x} = \\angle ${p}$ and $\\angle ${y} = \\angle ${q}$`, `$\\angle ${x} = \\angle ${p}$ dan $\\angle ${y} = \\angle ${q}$`);
      return { q: T(`Triangles ${x}${y}${z} and ${p}${q}${s} are given with ${given.en}. What additional single piece of information is needed to prove congruency by ${rule}?`, `Segi tiga ${x}${y}${z} dan ${p}${q}${s} diberi dengan ${given.ms}. Apakah satu maklumat tambahan yang diperlukan untuk membuktikan kekongruenan melalui ${rule}?`), a: missing, sp: 's' };
    },
    (r) => {
      const [x, y, z, p, q, s] = letPick(r);
      const cor = r.chance();
      const swap = r.pick(['B', 'C']);
      const stmts = cor
        ? [T(`$\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$`, `$\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$`), swap === 'B' ? T(`$\\triangle ${y}${x}${z} \\equiv \\triangle ${q}${p}${s}$`, `$\\triangle ${y}${x}${z} \\equiv \\triangle ${q}${p}${s}$`) : T(`$\\triangle ${x}${z}${y} \\equiv \\triangle ${p}${s}${q}$`, `$\\triangle ${x}${z}${y} \\equiv \\triangle ${p}${s}${q}$`)]
        : [T(`$\\triangle ${x}${y}${z} \\equiv \\triangle ${q}${p}${s}$`, `$\\triangle ${x}${y}${z} \\equiv \\triangle ${q}${p}${s}$`), T(`$\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${s}${q}$`, `$\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${s}${q}$`)];
      return { q: T(`In $\\triangle ${x}${y}${z}$ and $\\triangle ${p}${q}${s}$, $${x}${y} = ${p}${q}$, $${y}${z} = ${q}${s}$ and $\\angle ${y} = \\angle ${q}$ (SAS). Which of these correspondence statements is/are correct: ${stmts[0].en} or ${stmts[1].en}? Explain using the matching order of vertices.`, `Dalam $\\triangle ${x}${y}${z}$ dan $\\triangle ${p}${q}${s}$, $${x}${y} = ${p}${q}$, $${y}${z} = ${q}${s}$ dan $\\angle ${y} = \\angle ${q}$ (SAS). Yang manakah antara pernyataan sepadan ini betul: ${stmts[0].ms} atau ${stmts[1].ms}? Terangkan menggunakan susunan bucu yang sepadan.`), a: T(`$\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$ is correct: vertices must be listed in matching order (${x}\\leftrightarrow${p}, ${y}\\leftrightarrow${q}, ${z}\\leftrightarrow${s}), since that is how the equal sides and angle were paired.`, `$\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$ adalah betul: bucu mesti disenaraikan mengikut susunan sepadan (${x}\\leftrightarrow${p}, ${y}\\leftrightarrow${q}, ${z}\\leftrightarrow${s}), kerana begitulah sisi dan sudut yang sama itu dipasangkan.`), sp: 'm' };
    },
    (r) => {
      const [x, y, z, p, q, s] = letPick(r);
      const t1 = r.int(2, 4), t2 = r.int(1, 3);
      return { q: T(`In the diagram, $${x}${y}$ is marked with ${t1} tick${t1 > 1 ? 's' : ''} and $${p}${q}$ with ${t1} tick${t1 > 1 ? 's' : ''} (so $${x}${y} = ${p}${q}$); $${y}${z}$ is marked with ${t2} tick${t2 > 1 ? 's' : ''} and $${q}${s}$ with ${t2} tick${t2 > 1 ? 's' : ''} (so $${y}${z} = ${q}${s}$); and the angle between them, $\\angle ${y}$ and $\\angle ${q}$, are marked equal with an arc. ${NTS.en} Name the congruency rule shown, and write the full congruency statement.`, `Dalam rajah itu, $${x}${y}$ ditanda dengan ${t1} tanda dan $${p}${q}$ dengan ${t1} tanda (jadi $${x}${y} = ${p}${q}$); $${y}${z}$ ditanda dengan ${t2} tanda dan $${q}${s}$ dengan ${t2} tanda (jadi $${y}${z} = ${q}${s}$); dan sudut di antaranya, $\\angle ${y}$ dan $\\angle ${q}$, ditanda sama dengan lengkok. ${NTS.ms} Namakan syarat kekongruenan yang ditunjukkan, dan tulis pernyataan kekongruenan penuh.`), a: T(`SAS; $\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$`, `SAS; $\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$`), sp: 's' };
    },
    (r) => {
      const t = r.pick(RT3), h = t[0];
      const [x, y, z, p, q, s] = letPick(r);
      return { q: T(`A symmetrical roof truss is built from two right-angled triangles $${x}${y}${z}$ and $${p}${q}${s}$ meeting at the ridge, both with the right angle at ${y} and ${q}. The sloping beams (hypotenuses) $${x}${z} = ${p}${s} = ${t[2]}$ m are equal and the vertical struts $${x}${y} = ${p}${q} = ${h}$ m are equal. State the rule that proves the two triangles are congruent, and explain why this guarantees the base half-widths $${y}${z}$ and $${q}${s}$ are also equal.`, `Sebuah kekuda bumbung simetri dibina daripada dua segi tiga bersudut tegak $${x}${y}${z}$ dan $${p}${q}${s}$ yang bertemu di rabung, kedua-duanya bersudut tegak di ${y} dan ${q}. Rasuk condong (hipotenus) $${x}${z} = ${p}${s} = ${t[2]}$ m adalah sama dan tunjang menegak $${x}${y} = ${p}${q} = ${h}$ m adalah sama. Nyatakan syarat yang membuktikan kedua-dua segi tiga itu kongruen, dan terangkan mengapa ini menjamin separuh lebar tapak $${y}${z}$ dan $${q}${s}$ juga sama.`), a: T(`RHS: the hypotenuse and one leg of each right-angled triangle are equal. So $\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$, and corresponding sides give $${y}${z} = ${q}${s}$.`, `RHS: hipotenus dan satu kaki bagi setiap segi tiga bersudut tegak adalah sama. Jadi $\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$, dan sisi sepadan memberikan $${y}${z} = ${q}${s}$.`), sp: 'm' };
    },
  ];
  const g51a = [
    (r) => {
      const shape = r.pick([
        { en: 'a parallelogram with diagonal $AC$', ms: 'sebuah segi empat selari dengan pepenjuru $AC$', tri: ['ABC', 'CDA'], rule: 'ASA', reason: T('$\\angle BAC = \\angle DCA$ and $\\angle BCA = \\angle DAC$ (alternate angles, $AB \\parallel DC$ and $BC \\parallel AD$) with the common side $AC$', '$\\angle BAC = \\angle DCA$ dan $\\angle BCA = \\angle DAC$ (sudut berselang-seli, $AB \\parallel DC$ dan $BC \\parallel AD$) dengan sisi sepunya $AC$'), ded: T('opposite sides are equal: $AB = CD$, $BC = DA$', 'sisi bertentangan adalah sama: $AB = CD$, $BC = DA$') },
        { en: 'a rectangle with diagonals $AC$ and $BD$', ms: 'sebuah segi empat tepat dengan pepenjuru $AC$ dan $BD$', tri: ['ABC', 'DCB'], rule: 'SAS', reason: T('$AB = DC$ (opposite sides of a rectangle), $BC$ is a common side, and $\\angle ABC = \\angle DCB = 90^\\circ$', '$AB = DC$ (sisi bertentangan segi empat tepat), $BC$ ialah sisi sepunya, dan $\\angle ABC = \\angle DCB = 90^\\circ$'), ded: T('the corresponding sides $AC$ and $DB$ are equal, so the two diagonals of the rectangle are equal', 'sisi sepadan $AC$ dan $DB$ adalah sama, jadi kedua-dua pepenjuru segi empat tepat itu adalah sama') },
        { en: 'a kite with $AB = AD$, $CB = CD$ and diagonal $AC$', ms: 'sebuah layang-layang dengan $AB = AD$, $CB = CD$ dan pepenjuru $AC$', tri: ['ABC', 'ADC'], rule: 'SSS', reason: T('$AB = AD$, $CB = CD$ (given) and $AC$ is a common side', '$AB = AD$, $CB = CD$ (diberi) dan $AC$ ialah sisi sepunya'), ded: T('$\\angle BAC = \\angle DAC$, so $AC$ bisects $\\angle A$; also $\\angle ACB = \\angle ACD$, so $AC$ bisects $\\angle C$', '$\\angle BAC = \\angle DAC$, jadi $AC$ membahagi dua $\\angle A$; juga $\\angle ACB = \\angle ACD$, jadi $AC$ membahagi dua $\\angle C$') },
        { en: 'an isosceles trapezium with $AD = BC$ and $AB \\parallel DC$, together with diagonal $AC$ and $BD$ meeting so that $\\angle DAB = \\angle CBA$', ms: 'sebuah trapezium sesama kaki dengan $AD = BC$ dan $AB \\parallel DC$, bersama pepenjuru $AC$ dan $BD$ sehingga $\\angle DAB = \\angle CBA$', tri: ['DAB', 'CBA'], rule: 'SAS', reason: T('$AD = BC$, $\\angle DAB = \\angle CBA$ (base angles of an isosceles trapezium) and $AB$ is a common side', '$AD = BC$, $\\angle DAB = \\angle CBA$ (sudut tapak trapezium sesama kaki) dan $AB$ ialah sisi sepunya'), ded: T('the diagonals are equal: $DB = CA$', 'pepenjurunya adalah sama: $DB = CA$') },
      ]);
      return { q: T(`$ABCD$ is ${shape.en}. Show that triangles $${shape.tri[0]}$ and $${shape.tri[1]}$ are congruent, and deduce a property of the diagonal(s).`, `$ABCD$ ialah ${shape.ms}. Tunjukkan bahawa segi tiga $${shape.tri[0]}$ dan $${shape.tri[1]}$ adalah kongruen, dan deduksikan satu sifat pepenjuru itu.`), a: T(`${shape.reason.en}: ${shape.rule}. So $\\triangle ${shape.tri[0]} \\equiv \\triangle ${shape.tri[1]}$, and ${shape.ded.en}.`, `${shape.reason.ms}: ${shape.rule}. Jadi $\\triangle ${shape.tri[0]} \\equiv \\triangle ${shape.tri[1]}$, dan ${shape.ded.ms}.`), sp: 'l' };
    },
    (r) => {
      const base = r.pick([40, 50, 60, 70]), apex = 180 - 2 * base;
      need(apex > 0);
      const [x, y, z] = letPick(r);
      need(x !== 'M' && y !== 'M' && z !== 'M');
      return { q: T(`$\\triangle ${x}${y}${z}$ is isosceles with $${x}${y} = ${x}${z}$. $M$ is the midpoint of $${y}${z}$. Use $\\triangle ${x}${y}M \\equiv \\triangle ${x}${z}M$ to show $${x}M \\perp ${y}${z}$, given $\\angle ${x}${y}${z} = ${base}^\\circ$. Find $\\angle ${x}M${z}$.`, `$\\triangle ${x}${y}${z}$ ialah sama kaki dengan $${x}${y} = ${x}${z}$. $M$ ialah titik tengah $${y}${z}$. Gunakan $\\triangle ${x}${y}M \\equiv \\triangle ${x}${z}M$ untuk menunjukkan $${x}M \\perp ${y}${z}$, diberi $\\angle ${x}${y}${z} = ${base}^\\circ$. Cari $\\angle ${x}M${z}$.`), a: T(`$${x}${y} = ${x}${z}$, $${y}M = ${z}M$ ($M$ midpoint) and $${x}M$ is common: SSS, so $\\triangle ${x}${y}M \\equiv \\triangle ${x}${z}M$. Hence $\\angle ${x}M${y} = \\angle ${x}M${z}$, and since they are supplementary, each is $90^\\circ$; so $${x}M \\perp ${y}${z}$ and $\\angle ${x}M${z} = 90^\\circ$.`, `$${x}${y} = ${x}${z}$, $${y}M = ${z}M$ ($M$ titik tengah) dan $${x}M$ sisi sepunya: SSS, jadi $\\triangle ${x}${y}M \\equiv \\triangle ${x}${z}M$. Justeru $\\angle ${x}M${y} = \\angle ${x}M${z}$, dan kerana kedua-duanya berpelengkap, setiap satu ialah $90^\\circ$; jadi $${x}M \\perp ${y}${z}$ dan $\\angle ${x}M${z} = 90^\\circ$.`), sp: 'l' };
    },
    (r) => {
      const k = r.pick([2, 3]), a = r.int(3, 7), b = r.int(3, 7), ang = r.pick([40, 55, 65]);
      const [x, y, z, p, q, s] = letPick(r);
      return { q: T(`$\\triangle ${x}${y}${z}$ and $\\triangle ${p}${q}${s}$ have $\\angle ${x} = \\angle ${p}$, $\\angle ${y} = \\angle ${q}$ and $\\angle ${z} = \\angle ${s}$ (AAA), with $${p}${q} = ${k} \\times ${x}${y}$. If $${x}${y} = ${a}$ cm, is $\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$? Compute $${p}${q}$ and explain what AAA actually establishes here.`, `$\\triangle ${x}${y}${z}$ dan $\\triangle ${p}${q}${s}$ mempunyai $\\angle ${x} = \\angle ${p}$, $\\angle ${y} = \\angle ${q}$ dan $\\angle ${z} = \\angle ${s}$ (AAA), dengan $${p}${q} = ${k} \\times ${x}${y}$. Jika $${x}${y} = ${a}$ cm, adakah $\\triangle ${x}${y}${z} \\equiv \\triangle ${p}${q}${s}$? Hitung $${p}${q}$ dan terangkan apa yang sebenarnya ditetapkan oleh AAA di sini.`), a: T(`$${p}${q} = ${k * a}$ cm $\\ne ${a}$ cm $= ${x}${y}$, so they are NOT congruent even though all angles match. AAA only establishes that the triangles are similar (an enlargement of each other, scale factor ${k}), not that they are the same size.`, `$${p}${q} = ${k * a}$ cm $\\ne ${a}$ cm $= ${x}${y}$, jadi kedua-duanya TIDAK kongruen walaupun semua sudut sepadan. AAA hanya menetapkan segi tiga itu serupa (pembesaran antara satu sama lain, faktor skala ${k}), bukan bersaiz sama.`), sp: 'm' };
    },
    (r) => {
      const a = r.int(6, 10), b = r.pick([[a, a + r.int(1, 3)], [a, a - r.int(1, 3)]]);
      const ang = r.pick([50, 60, 70]);
      return { q: T(`Two triangles both have a side of $${a}$ cm, an adjacent side of $${b[1]}$ cm, and a $${ang}^\\circ$ angle that is NOT between these two sides. Explain, in general, why this SSA data does not guarantee a unique triangle. Then explain why the conclusion changes if the given $${ang}^\\circ$ angle is replaced by a right angle.`, `Dua segi tiga sama-sama mempunyai satu sisi $${a}$ cm, satu sisi bersebelahan $${b[1]}$ cm, dan satu sudut $${ang}^\\circ$ yang TIDAK diapit oleh kedua-dua sisi ini. Terangkan, secara am, mengapa data SSA ini tidak menjamin satu segi tiga yang unik. Kemudian terangkan mengapa kesimpulan itu berubah jika sudut $${ang}^\\circ$ yang diberi digantikan dengan sudut tegak.`), a: T('With SSA, swinging the side opposite the given angle can meet the base at two different points (two different triangles can satisfy the same data), so SSA is not a valid congruency test in general. If the given angle is 90°, the side opposite it is the hypotenuse; a right-angled triangle with a given hypotenuse and one leg has only one possible shape, so this special case (RHS) does guarantee congruence.', 'Dengan SSA, sisi bertentangan sudut yang diberi boleh berayun dan bertemu tapak pada dua titik berbeza (dua segi tiga berbeza boleh memenuhi data yang sama), jadi SSA bukan ujian kekongruenan yang sah secara am. Jika sudut yang diberi ialah 90°, sisi bertentangannya ialah hipotenus; segi tiga bersudut tegak dengan hipotenus dan satu kaki yang diberi hanya mempunyai satu bentuk yang mungkin, jadi kes khas ini (RHS) memang menjamin kekongruenan.'), sp: 'l' };
    },
    (r) => {
      const items = r.sample(COND, 4);
      const list = items.map((c, i) => `(${i + 1}) ${c.en}`).join('<br>');
      const listms = items.map((c, i) => `(${i + 1}) ${c.ms}`).join('<br>');
      return { q: T(`For each set of data below, state whether it is sufficient to prove two triangles congruent; if it is, name the condition.<br>${list}`, `Bagi setiap set data di bawah, nyatakan sama ada ia mencukupi untuk membuktikan dua segi tiga kongruen; jika ya, namakan syarat itu.<br>${listms}`), a: T(items.map((c, i) => `(${i + 1}) ${c.ok ? 'Sufficient: ' + c.rule : 'Not sufficient'}`).join('; ')), sp: 'l' };
    },
    (r) => {
      const rule = r.pick(['ASA', 'AAS']);
      return { q: T(`Explain why AAS is really just a rewritten form of ASA (both fix two angles of a triangle and one side): use the angle sum of a triangle, $180^\\circ$, to show that knowing two angles of two triangles are equal automatically gives the third pair of angles equal as well.`, `Terangkan mengapa AAS sebenarnya hanya satu bentuk lain ASA (kedua-duanya menetapkan dua sudut segi tiga dan satu sisi): gunakan hasil tambah sudut segi tiga, $180^\\circ$, untuk menunjukkan bahawa mengetahui dua sudut dua segi tiga adalah sama secara automatik memberikan pasangan sudut ketiga yang sama juga.`), a: T(`If $\\angle A = \\angle P$ and $\\angle B = \\angle Q$, then $\\angle C = 180^\\circ - \\angle A - \\angle B = 180^\\circ - \\angle P - \\angle Q = \\angle R$. So the third angles are automatically equal too, and the side that was "not between" the two given angles in AAS becomes a side "between" two known angles when the triangle is relabelled — so AAS and ASA always describe the same underlying triangle.`, `Jika $\\angle A = \\angle P$ dan $\\angle B = \\angle Q$, maka $\\angle C = 180^\\circ - \\angle A - \\angle B = 180^\\circ - \\angle P - \\angle Q = \\angle R$. Jadi pasangan sudut ketiga juga secara automatik sama, dan sisi yang "tidak diapit" oleh dua sudut yang diberi dalam AAS menjadi sisi yang "diapit" oleh dua sudut yang diketahui apabila segi tiga itu dilabel semula — jadi AAS dan ASA sentiasa menggambarkan segi tiga yang sama.`), sp: 'm' };
    },
    (r) => {
      const a = r.int(5, 9), b = r.int(5, 9), gap = r.int(3, 8);
      need(Math.abs(a - b) > 0);
      const [x, y, z, p, q, s] = letPick(r);
      const ang = r.pick([40, 50, 60]);
      return { q: T(`Two survey posts $${x}$ and $${y}$ are on opposite banks of a straight river. A surveyor stands at $${z}$ on one bank so that $${z}${x} = ${a}$ m, and walks along the bank to a second point $${p}$ so that $${p}${z} = ${z}${x}$, with $\\angle ${x}${z}${y} = \\angle ${y}${z}${p} = ${ang}^\\circ$ and $${z}${y}$ common to both triangles $${x}${z}${y}$ and $${p}${z}${y}$. Show that $\\triangle ${x}${z}${y} \\equiv \\triangle ${p}${z}${y}$, and explain how this lets the surveyor find the river width $${x}${y}$ by measuring $${p}${y}$ on land instead.`, `Dua tiang tinjau $${x}$ dan $${y}$ berada di tebing bertentangan sebatang sungai yang lurus. Seorang jurukur berdiri di $${z}$ pada satu tebing supaya $${z}${x} = ${a}$ m, dan berjalan di sepanjang tebing itu ke titik kedua $${p}$ supaya $${p}${z} = ${z}${x}$, dengan $\\angle ${x}${z}${y} = \\angle ${y}${z}${p} = ${ang}^\\circ$ dan $${z}${y}$ sepunya bagi kedua-dua segi tiga $${x}${z}${y}$ dan $${p}${z}${y}$. Tunjukkan bahawa $\\triangle ${x}${z}${y} \\equiv \\triangle ${p}${z}${y}$, dan terangkan bagaimana ini membolehkan jurukur mencari lebar sungai $${x}${y}$ dengan mengukur $${p}${y}$ di darat sebaliknya.`), a: T(`$${z}${x} = ${z}${p}$, $\\angle ${x}${z}${y} = \\angle ${p}${z}${y}$ and $${z}${y}$ is common: SAS, so $\\triangle ${x}${z}${y} \\equiv \\triangle ${p}${z}${y}$. Corresponding sides give $${x}${y} = ${p}${y}$, so the river width equals the measurable land distance $${p}${y}$.`, `$${z}${x} = ${z}${p}$, $\\angle ${x}${z}${y} = \\angle ${p}${z}${y}$ dan $${z}${y}$ sepunya: SAS, jadi $\\triangle ${x}${z}${y} \\equiv \\triangle ${p}${z}${y}$. Sisi sepadan memberikan $${x}${y} = ${p}${y}$, jadi lebar sungai sama dengan jarak $${p}${y}$ di darat yang boleh diukur.`), sp: 'l' };
    },
    (r) => {
      const rule = r.pick(['SSS', 'SAS', 'ASA', 'AAS']);
      const [x, y, z, p, q, s] = letPick(r);
      const ans = rule === 'SSS'
        ? T(`Give three matching side lengths only, e.g. $${x}${y} = ${p}${q} = 5$, $${y}${z} = ${q}${s} = 6$, $${x}${z} = ${p}${s} = 7$ cm, with no angle stated (so SAS/ASA/AAS, which need an angle, cannot be used to justify it from the given data).`, `Berikan tiga panjang sisi sepadan sahaja, cth. $${x}${y} = ${p}${q} = 5$, $${y}${z} = ${q}${s} = 6$, $${x}${z} = ${p}${s} = 7$ cm, tanpa sebarang sudut dinyatakan (jadi SAS/ASA/AAS, yang memerlukan sudut, tidak boleh digunakan untuk mewajarkannya daripada data yang diberi).`)
        : rule === 'SAS'
        ? T(`Give two matching sides with the included angle only, e.g. $${x}${y} = ${p}${q} = 5$ cm, $\\angle ${y} = \\angle ${q} = 50^\\circ$, $${y}${z} = ${q}${s} = 6$ cm, with the third side left unstated.`, `Berikan dua sisi sepadan dengan sudut yang diapit sahaja, cth. $${x}${y} = ${p}${q} = 5$ cm, $\\angle ${y} = \\angle ${q} = 50^\\circ$, $${y}${z} = ${q}${s} = 6$ cm, dengan sisi ketiga tidak dinyatakan.`)
        : rule === 'ASA'
        ? T(`Give two matching angles with the side between them only, e.g. $\\angle ${x} = \\angle ${p} = 40^\\circ$, $${x}${y} = ${p}${q} = 5$ cm, $\\angle ${y} = \\angle ${q} = 60^\\circ$.`, `Berikan dua sudut sepadan dengan sisi yang diapit di antaranya sahaja, cth. $\\angle ${x} = \\angle ${p} = 40^\\circ$, $${x}${y} = ${p}${q} = 5$ cm, $\\angle ${y} = \\angle ${q} = 60^\\circ$.`)
        : T(`Give two matching angles with a side that is NOT between them, e.g. $\\angle ${x} = \\angle ${p} = 40^\\circ$, $\\angle ${y} = \\angle ${q} = 60^\\circ$, $${y}${z} = ${q}${s} = 6$ cm.`, `Berikan dua sudut sepadan dengan satu sisi yang TIDAK diapit di antaranya, cth. $\\angle ${x} = \\angle ${p} = 40^\\circ$, $\\angle ${y} = \\angle ${q} = 60^\\circ$, $${y}${z} = ${q}${s} = 6$ cm.`);
      return { q: T(`Write down one complete, valid set of side lengths and/or angles for $\\triangle ${x}${y}${z}$ and $\\triangle ${p}${q}${s}$ that would prove them congruent by ${rule}, but would NOT prove them congruent by any other single rule from {SSS, SAS, ASA, AAS, RHS}. Explain your choice.`, `Tuliskan satu set panjang sisi dan/atau sudut yang lengkap dan sah bagi $\\triangle ${x}${y}${z}$ dan $\\triangle ${p}${q}${s}$ yang akan membuktikan kedua-duanya kongruen melalui ${rule}, tetapi TIDAK membuktikan kongruen melalui mana-mana satu syarat lain daripada {SSS, SAS, ASA, AAS, RHS}. Terangkan pilihan anda.`), a: ans, sp: 'l' };
    },
  ];

  SPM.extend('F5-5.1', { e: g51e, m: g51m, a: g51a });

  /* =============================================================== 5.2 Similarity and enlargement */
  const KSET = [{ num: 2, den: 1 }, { num: 3, den: 1 }, { num: 1, den: 2 }, { num: 1, den: 3 }];
  const kVal = (f, sign) => ((sign || 1) * f.num) / f.den;
  const kTexOf = (f, sign) => Fr.tex(Fr.make((sign || 1) * f.num, f.den));
  const areaFrOf = (f) => Fr.make(f.num * f.num, f.den * f.den);
  const enl = (P, C, k) => [C[0] + k * (P[0] - C[0]), C[1] + k * (P[1] - C[1])];
  const dpt = (r, C, den, lim) => [C[0] + den * r.nz(-lim, lim), C[1] + den * r.nz(-lim, lim)];
  const enlFig = (obj, img, C, names) => {
    const allPts = obj.concat(img).concat(C ? [C] : []);
    const xs = allPts.map((p) => p[0]), ys = allPts.map((p) => p[1]);
    const xr = [Math.min(...xs) - 1, Math.max(...xs) + 1], yr = [Math.min(...ys) - 1, Math.max(...ys) + 1];
    return S.plane({
      x: xr, y: yr,
      polys: [{ p: obj }, { p: img, dash: true }],
      segs: C ? obj.map((p, i) => ({ a: C, b: img[i], dash: true })) : [],
      pts: (C ? [{ x: C[0], y: C[1], l: 'C' }] : []).concat(obj.map((p, i) => ({ x: p[0], y: p[1], l: names ? names[i] : undefined }))).concat(img.map((p, i) => ({ x: p[0], y: p[1], l: names ? names[i] + "'" : undefined, dx: 9, dy: 9 }))),
    });
  };

  const ECTX = [
    T('a photograph', 'sebuah gambar foto'), T('a poster', 'sebuah poster'), T('a scale model', 'sebuah model berskala'),
    T('a map', 'sebuah peta'), T('a company logo', 'sebuah logo syarikat'), T('an architectural drawing', 'sebuah lukisan seni bina'),
    T('a projector screen image', 'sebuah imej pada skrin projektor'), T('a photocopy', 'sebuah salinan fotokopi'),
    T('a mural painted from a small sketch', 'sebuah mural yang dilukis daripada satu lakaran kecil'), T('a banner', 'sebuah sepanduk'),
  ];
  const g52e = [
    (r) => ({ q: T(`Complete the sentence: an enlargement is a transformation in which every point $P$ maps to the point ____, for a fixed centre $C$ and scale factor $k$.`, `Lengkapkan ayat: pembesaran ialah satu transformasi di mana setiap titik $P$ dipetakan kepada titik ____, bagi satu pusat tetap $C$ dan faktor skala $k$.`), a: T(`$C + k(P - C)$`), sp: 'xs' }),
    (r) => {
      const f = r.pick(KSET), neg = r.chance(0.3), ctx = r.pick(ECTX);
      const k = kVal(f, neg ? -1 : 1);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} is transformed with scale factor $${kTexOf(f, neg ? -1 : 1)}$ about a fixed centre. Classify this as an enlargement or a reduction, and state whether the copy lies on the same side of the centre as the original or the opposite side.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} ditransformasikan dengan faktor skala $${kTexOf(f, neg ? -1 : 1)}$ pada satu pusat tetap. Kelaskan ini sebagai pembesaran atau pengecilan, dan nyatakan sama ada salinan itu terletak di sebelah pusat yang sama dengan yang asal atau di sebelah bertentangan.`), a: T(`${Math.abs(k) > 1 ? 'Enlargement' : 'Reduction'}; ${k > 0 ? 'same side' : 'opposite side'}`, `${Math.abs(k) > 1 ? 'Pembesaran' : 'Pengecilan'}; ${k > 0 ? 'sebelah yang sama' : 'sebelah bertentangan'}`), sp: 'xs' };
    },
    (r) => {
      const P = [r.nz(-4, 4), r.nz(-4, 4)], f = r.pick(KSET.slice(0, 2));
      const forms = [
        { en: 'Find the image of $P = {P}$ under an enlargement with centre the origin and scale factor {k}.', ms: 'Cari imej bagi $P = {P}$ di bawah pembesaran berpusat pada asalan dengan faktor skala {k}.' },
        { en: 'An enlargement has centre the origin and scale factor {k}. Find the image of the point $P = {P}$.', ms: 'Satu pembesaran berpusat pada asalan dan berfaktor skala {k}. Cari imej bagi titik $P = {P}$.' },
      ];
      const q = pf(r, forms, { P: pt(P), k: n(kVal(f)) });
      return { q, a: T(`$${pt(enl(P, [0, 0], kVal(f)))}$`), sp: 's' };
    },
    (r) => {
      const C = [r.int(-3, 3), r.int(-3, 3)], P = [C[0] + r.nz(-4, 4), C[1] + r.nz(-4, 4)], f = r.pick(KSET.slice(0, 2));
      const forms = [
        { en: 'Find the image of $P = {P}$ under an enlargement with centre $C = {C}$ and scale factor {k}.', ms: 'Cari imej bagi $P = {P}$ di bawah pembesaran berpusat $C = {C}$ dan faktor skala {k}.' },
        { en: 'An enlargement has centre $C = {C}$ and scale factor {k}. A point $P = {P}$ is mapped by this enlargement. Find its image.', ms: 'Satu pembesaran berpusat $C = {C}$ dan berfaktor skala {k}. Titik $P = {P}$ dipetakan oleh pembesaran ini. Cari imejnya.' },
      ];
      const q = pf(r, forms, { P: pt(P), C: pt(C), k: n(kVal(f)) });
      return { q, a: T(`$${pt(enl(P, C, kVal(f)))}$`), w: T('$C + k(P - C)$'), sp: 's' };
    },
    (r) => {
      const obj = r.int(3, 9), f = r.pick(KSET.slice(0, 2));
      const ctx = r.pick(ECTX);
      return { q: T(`A length of $${obj}$ cm on ${ctx.en} is enlarged with scale factor ${n(kVal(f))}. Find the corresponding length on the enlarged copy.`, `Panjang $${obj}$ cm pada ${ctx.ms} dibesarkan dengan faktor skala ${n(kVal(f))}. Cari panjang yang sepadan pada salinan yang dibesarkan.`), a: T(`$${n(obj * kVal(f))}$ cm`), sp: 'xs' };
    },
    (r) => {
      const img = r.int(6, 18), f = r.pick(KSET.slice(0, 2));
      need(img % f.num === 0);
      const ctx = r.pick(ECTX);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} is an enlargement, scale factor ${n(kVal(f))}, of a smaller original. A length on the enlarged copy is $${img}$ cm. Find the corresponding length on the original.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} ialah pembesaran, faktor skala ${n(kVal(f))}, daripada satu asal yang lebih kecil. Satu panjang pada salinan yang dibesarkan ialah $${img}$ cm. Cari panjang yang sepadan pada yang asal.`), a: T(`$${n(img / kVal(f))}$ cm`), sp: 'xs' };
    },
    (r) => {
      const f = r.pick(KSET), neg = r.chance(0.3);
      const k = kVal(f, neg ? -1 : 1);
      return { q: T(`An enlargement has scale factor $${kTexOf(f, neg ? -1 : 1)}$. State whether the image is larger or smaller than the object, and whether the image is on the same side of the centre as the object or the opposite side.`, `Satu pembesaran mempunyai faktor skala $${kTexOf(f, neg ? -1 : 1)}$. Nyatakan sama ada imej lebih besar atau lebih kecil daripada objek, dan sama ada imej berada di sebelah pusat yang sama dengan objek atau di sebelah bertentangan.`), a: T(`${Math.abs(k) > 1 ? 'Larger' : 'Smaller'}; ${k > 0 ? 'same side' : 'opposite side'}`, `${Math.abs(k) > 1 ? 'Lebih besar' : 'Lebih kecil'}; ${k > 0 ? 'sebelah yang sama' : 'sebelah bertentangan'}`), sp: 'xs' };
    },
    (r) => {
      const f = r.pick(KSET);
      return { q: T(`An enlargement has scale factor $${kTexOf(f)}$. State the ratio of the area of the image to the area of the object.`, `Satu pembesaran mempunyai faktor skala $${kTexOf(f)}$. Nyatakan nisbah luas imej kepada luas objek.`), a: T(`$${Fr.tex(areaFrOf(f))} : 1$`), sp: 'xs' };
    },
    (r) => {
      const obj = r.int(3, 9), f = r.pick(KSET.slice(0, 2)), ctx = r.pick(ECTX);
      return { q: T(`On ${ctx.en}, a length of $${obj}$ cm is scaled by a factor of $${n(kVal(f))}$. Is this an enlargement or a reduction? Find the new length.`, `Pada ${ctx.ms}, satu panjang $${obj}$ cm diskalakan dengan faktor $${n(kVal(f))}$. Adakah ini pembesaran atau pengecilan? Cari panjang baharu.`), a: T(`${kVal(f) > 1 ? 'Enlargement' : 'Reduction'}; $${n(obj * kVal(f))}$ cm`, `${kVal(f) > 1 ? 'Pembesaran' : 'Pengecilan'}; $${n(obj * kVal(f))}$ cm`), sp: 'xs' };
    },
    (r) => {
      const A = r.pick([4, 5, 6, 8, 10]), f = r.pick(KSET.slice(0, 2));
      return { q: T(`An object has area $${A}$ cm$^2$. Find the area of its image under an enlargement with scale factor ${n(kVal(f))}.`, `Sebuah objek mempunyai luas $${A}$ cm$^2$. Cari luas imejnya di bawah pembesaran dengan faktor skala ${n(kVal(f))}.`), a: T(`$${n(A * kVal(f) * kVal(f))}$ cm$^2$`), sp: 's' };
    },
    (r) => {
      const A = r.pick([4, 5, 6, 8, 10]), f = r.pick(KSET.slice(0, 2)), ctx = r.pick(ECTX);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} has area $${A}$ cm$^2$. It is enlarged with scale factor ${n(kVal(f))}. Find the new area.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} mempunyai luas $${A}$ cm$^2$. Ia dibesarkan dengan faktor skala ${n(kVal(f))}. Cari luas baharu.`), a: T(`$${n(A * kVal(f) * kVal(f))}$ cm$^2$`), sp: 's' };
    },
    (r) => {
      const den = r.pick([2, 3, 4, 5]), obj = den * r.int(2, 5), k = r.pick([2, 3]);
      return { q: T(`A side of the object is $${obj}$ cm. Under an enlargement with scale factor ${k}, find the length of the corresponding side of the image, and hence find the scale factor written as image length $\\div$ object length.`, `Satu sisi objek ialah $${obj}$ cm. Di bawah pembesaran dengan faktor skala ${k}, cari panjang sisi imej yang sepadan, dan seterusnya cari faktor skala yang ditulis sebagai panjang imej $\\div$ panjang objek.`), a: T(`Image side $${obj * k}$ cm; $${obj * k} \\div ${obj} = ${k}$`), sp: 's' };
    },
    (r) => {
      const obj = r.pick([4, 6, 8, 10, 12]), pct = r.pick([200, 300]), ctx = r.pick(ECTX);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} of length $${obj}$ cm is enlarged to $${pct}\\%$ of its original size. Find the new length.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} yang berpanjang $${obj}$ cm dibesarkan kepada $${pct}\\%$ daripada saiz asalnya. Cari panjang baharu.`), a: T(`$${n((obj * pct) / 100)}$ cm`), w: T(`Scale factor $= ${pct} \\div 100 = ${n(pct / 100)}$`), sp: 'xs' };
    },
    (r) => {
      const obj = r.pick([10, 20, 30, 40]), pct = r.pick([25, 50]), ctx = r.pick(ECTX);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} of length $${obj}$ cm is reduced to $${pct}\\%$ of its original size for a smaller print. Find the new length.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} yang berpanjang $${obj}$ cm dikecilkan kepada $${pct}\\%$ daripada saiz asalnya untuk cetakan yang lebih kecil. Cari panjang baharu.`), a: T(`$${n((obj * pct) / 100)}$ cm`), w: T(`Scale factor $= ${pct} \\div 100 = ${n(pct / 100)}$`), sp: 'xs' };
    },
    (r) => {
      const f = r.pick(KSET.slice(0, 2));
      const [correct, ...rest] = [T('an enlargement', 'satu pembesaran'), T('a reflection', 'satu pantulan'), T('a translation', 'satu translasi'), T('a rotation', 'satu putaran')];
      const opts = r.shuffle([correct, ...rest]);
      const letters = 'ABCD';
      const list = opts.map((o, i) => `(${letters[i]}) ${o.en}`).join(', ');
      const listms = opts.map((o, i) => `(${letters[i]}) ${o.ms}`).join(', ');
      return { q: T(`A transformation maps every point $P$ to $C + ${n(kVal(f))}(P - C)$ for a fixed centre $C$. Which type of transformation is this? ${list}`, `Satu transformasi memetakan setiap titik $P$ kepada $C + ${n(kVal(f))}(P - C)$ bagi satu pusat tetap $C$. Transformasi jenis manakah ini? ${listms}`), a: T(`(${letters[opts.indexOf(correct)]}) ${correct.en}`, `(${letters[opts.indexOf(correct)]}) ${correct.ms}`), sp: 'xs' };
    },
    (r) => {
      const f = r.pick(KSET), ctx = r.pick(ECTX);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} is enlarged with scale factor $${kTexOf(f)}$. State the ratio of the area of the enlarged copy to the area of the original.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} dibesarkan dengan faktor skala $${kTexOf(f)}$. Nyatakan nisbah luas salinan yang dibesarkan kepada luas yang asal.`), a: T(`$${Fr.tex(areaFrOf(f))} : 1$`), sp: 'xs' };
    },
    (r) => {
      const item = r.pick(SPM.bank.items), width = r.int(3, 6), f = r.pick(KSET.slice(0, 2));
      return { q: T(`A logo of width $${width}$ cm is printed on a batch of ${item.en} at $${n(kVal(f))}$ times its original size. Is this printing an enlargement or a reduction, and what is the new width?`, `Sebuah logo berlebar $${width}$ cm dicetak pada sekumpulan ${item.ms} dengan $${n(kVal(f))}$ kali saiz asalnya. Adakah percetakan ini pembesaran atau pengecilan, dan apakah lebar baharunya?`), a: T(`${kVal(f) > 1 ? 'Enlargement' : 'Reduction'}; new width $${n(width * kVal(f))}$ cm`, `${kVal(f) > 1 ? 'Pembesaran' : 'Pengecilan'}; lebar baharu $${n(width * kVal(f))}$ cm`), sp: 'xs' };
    },
  ];
  const g52m = [
    (r) => {
      const f = r.pick(KSET), neg = r.chance(0.4), ctx = r.pick(ECTX);
      const k = kVal(f, neg ? -1 : 1);
      const A = r.pick([3, 4, 5, 6, 7]);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} of area $${A}$ cm$^2$ undergoes a transformation with scale factor $${kTexOf(f, neg ? -1 : 1)}$ about a fixed centre. Find the area of the resulting copy, and state whether it is an enlargement or a reduction.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} berluas $${A}$ cm$^2$ menjalani satu transformasi dengan faktor skala $${kTexOf(f, neg ? -1 : 1)}$ pada satu pusat tetap. Cari luas salinan yang terhasil, dan nyatakan sama ada ia pembesaran atau pengecilan.`), a: T(`Area $= ${A} \\times \\left(${kTexOf(f, neg ? -1 : 1)}\\right)^2 = ${n(A * k * k)}$ cm$^2$; ${Math.abs(k) > 1 ? 'enlargement' : 'reduction'}`, `Luas $= ${A} \\times \\left(${kTexOf(f, neg ? -1 : 1)}\\right)^2 = ${n(A * k * k)}$ cm$^2$; ${Math.abs(k) > 1 ? 'pembesaran' : 'pengecilan'}`), sp: 's' };
    },
    (r) => {
      const C = [r.int(-3, 3), r.int(-3, 3)], f = r.pick(KSET), neg = r.chance(0.3);
      const k = kVal(f, neg ? -1 : 1);
      const P = dpt(r, C, f.den, 3);
      need(P[0] !== C[0] || P[1] !== C[1]);
      const I = enl(P, C, k);
      const forms = [
        { en: 'Find the image of $P = {P}$ under an enlargement with centre $C = {C}$ and scale factor {k}.', ms: 'Cari imej bagi $P = {P}$ di bawah pembesaran berpusat $C = {C}$ dan faktor skala {k}.' },
        { en: 'An enlargement, centre $C = {C}$ and scale factor {k}, is applied to the point $P = {P}$. Determine the image point.', ms: 'Satu pembesaran, berpusat $C = {C}$ dan berfaktor skala {k}, dikenakan ke atas titik $P = {P}$. Tentukan titik imej itu.' },
      ];
      const q = pf(r, forms, { P: pt(P), C: pt(C), k: kTexOf(f, neg ? -1 : 1) });
      return { q, a: T(`$${pt(I)}$`), sp: 's' };
    },
    (r) => {
      const C = r.chance(0.5) ? [0, 0] : [r.int(-2, 2), r.int(-2, 2)];
      const f = r.pick(KSET.slice(0, 2));
      const P = dpt(r, C, f.den, 3), Q = dpt(r, C, f.den, 3), R = dpt(r, C, f.den, 3);
      need(!(P[0] === Q[0] && P[1] === Q[1]) && !(Q[0] === R[0] && Q[1] === R[1]) && !(P[0] === R[0] && P[1] === R[1]));
      const [x, y, z] = letPick(r);
      const I = [P, Q, R].map((p) => enl(p, C, kVal(f)));
      const cen = C[0] === 0 && C[1] === 0 ? T('the origin', 'asalan') : T(`the point $${pt(C)}$`, `titik $${pt(C)}$`);
      return { q: T(`Triangle $${x}${y}${z}$ has $${x} = ${pt(P)}$, $${y} = ${pt(Q)}$, $${z} = ${pt(R)}$. Find the coordinates of its image under an enlargement with centre ${cen.en} and scale factor $${n(kVal(f))}$.`, `Segi tiga $${x}${y}${z}$ mempunyai $${x} = ${pt(P)}$, $${y} = ${pt(Q)}$, $${z} = ${pt(R)}$. Cari koordinat imejnya di bawah pembesaran berpusat ${cen.ms} dan faktor skala $${n(kVal(f))}$.`), a: T(`$${x}'${pt(I[0])}, ${y}'${pt(I[1])}, ${z}'${pt(I[2])}$`), sp: 'm' };
    },
    (r) => {
      const orig = r.pick([2, 3, 4, 5]), factor = r.pick([4, 9, 16, 25]);
      const ctx = r.pick(ECTX);
      return { q: T(`The area of ${ctx.en} is enlarged by a factor of $${factor}$. Find the scale factor of the (linear) enlargement, and the new length of a side that was originally $${orig}$ cm.`, `Luas ${ctx.ms} dibesarkan dengan faktor $${factor}$. Cari faktor skala pembesaran (linear) itu, dan panjang baharu bagi satu sisi yang asalnya $${orig}$ cm.`), a: T(`Scale factor $${Math.sqrt(factor)}$; new length $${orig * Math.sqrt(factor)}$ cm`, `Faktor skala $${Math.sqrt(factor)}$; panjang baharu $${orig * Math.sqrt(factor)}$ cm`), sp: 'm' };
    },
    (r) => {
      const A = r.pick([3, 4, 5, 6]), k = r.pick([2, 3]);
      const shaded = A * (k * k - 1);
      return { q: T(`An object of area $${A}$ cm$^2$ is enlarged with scale factor ${k} about a centre outside the object, so the object and image do not overlap. Find the area of the region between the object and its image.`, `Sebuah objek berluas $${A}$ cm$^2$ dibesarkan dengan faktor skala ${k} pada pusat di luar objek itu, supaya objek dan imej tidak bertindih. Cari luas kawasan di antara objek dan imejnya.`), a: T(`$${shaded}$ cm$^2$`), w: T(`$(k^2 - 1)A = (${k * k} - 1)(${A})$`), sp: 's' };
    },
    (r) => {
      const A = r.pick([3, 4, 5, 6]), k = r.pick([2, 3]), ctx = r.pick(ECTX);
      const shaded = A * (k * k - 1);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} of area $${A}$ cm$^2$ is enlarged with scale factor ${k} about a point outside it, so the copy does not overlap the original. Find the area lying between the original and the enlarged copy.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} berluas $${A}$ cm$^2$ dibesarkan dengan faktor skala ${k} pada satu titik di luarnya, supaya salinan itu tidak bertindih dengan yang asal. Cari luas yang terletak di antara yang asal dan salinan yang dibesarkan.`), a: T(`$${shaded}$ cm$^2$`), w: T(`$(k^2 - 1)A = (${k * k} - 1)(${A})$`), sp: 's' };
    },
    (r) => {
      const obj = r.int(4, 9), f = r.pick(KSET.slice(0, 2));
      const img = n(obj * kVal(f));
      const wrongArea = obj * kVal(f);
      const rightArea = obj * kVal(f) * kVal(f);
      return { q: T(`A student says: "An object has area $${obj}$ cm$^2$. Under an enlargement with scale factor $${n(kVal(f))}$, the image area is $${n(wrongArea)}$ cm$^2$." Explain the student's error and give the correct image area.`, `Seorang murid berkata: "Sebuah objek berluas $${obj}$ cm$^2$. Di bawah pembesaran dengan faktor skala $${n(kVal(f))}$, luas imej ialah $${n(wrongArea)}$ cm$^2$." Terangkan kesilapan murid itu dan berikan luas imej yang betul.`), a: T(`The student multiplied the area by $k$ instead of $k^2$. Correct image area $= ${obj} \\times ${n(kVal(f))}^2 = ${n(rightArea)}$ cm$^2$.`, `Murid itu mendarab luas dengan $k$ dan bukannya $k^2$. Luas imej yang betul $= ${obj} \\times ${n(kVal(f))}^2 = ${n(rightArea)}$ cm$^2$.`), sp: 'm' };
    },
    (r) => {
      const st = r.pick([
        [T('An enlargement with scale factor $k = 1$ maps every point to itself.', 'Pembesaran dengan faktor skala $k = 1$ memetakan setiap titik kepada dirinya sendiri.'), true],
        [T('An enlargement with $0 < k < 1$ is called a reduction, and the image is smaller than the object.', 'Pembesaran dengan $0 < k < 1$ dipanggil pengecilan, dan imej lebih kecil daripada objek.'), true],
        [T('The image under an enlargement is never similar to the object.', 'Imej di bawah pembesaran tidak pernah serupa dengan objek.'), false],
        [T('If the scale factor is negative, the image is on the opposite side of the centre from the object.', 'Jika faktor skala negatif, imej berada di sebelah pusat yang bertentangan dengan objek.'), true],
        [T('The centre of enlargement is always the origin.', 'Pusat pembesaran sentiasa berada pada asalan.'), false],
        [T('For an enlargement, all lengths in the image are multiplied by $k$, and all areas are multiplied by $k$ as well.', 'Bagi satu pembesaran, semua panjang dalam imej didarab dengan $k$, dan semua luas turut didarab dengan $k$.'), false],
      ]);
      return { q: T(`True or false? "${st[0].en}"`, `Benar atau palsu? "${st[0].ms}"`), a: st[1] ? T('True', 'Benar') : T('False', 'Palsu'), sp: 'xs' };
    },
    (r) => {
      const C = [0, 0], f = r.pick(KSET.slice(0, 2));
      const P = dpt(r, C, 1, 4);
      need(P[0] !== 0 || P[1] !== 0);
      const I = enl(P, C, kVal(f));
      return { q: T(`The diagram shows point $P$ and its image $P'$ under an enlargement with centre the origin. Read the coordinates from the diagram and state the scale factor used.`, `Rajah menunjukkan titik $P$ dan imejnya $P'$ di bawah pembesaran berpusat pada asalan. Baca koordinat daripada rajah dan nyatakan faktor skala yang digunakan.`), fig: S.plane({ x: [Math.min(0, P[0], I[0]) - 1, Math.max(0, P[0], I[0]) + 1], y: [Math.min(0, P[1], I[1]) - 1, Math.max(0, P[1], I[1]) + 1], segs: [{ a: [0, 0], b: I, dash: true }], pts: [{ x: P[0], y: P[1], l: 'P' }, { x: I[0], y: I[1], l: "P'" }] }), a: T(`$${n(kVal(f))}$`), sp: 's' };
    },
    (r) => {
      const C = [r.int(-2, 2), r.int(-2, 2)], f = r.pick(KSET.slice(0, 2));
      const P = dpt(r, C, 1, 2), Q = dpt(r, C, 1, 2), R = dpt(r, C, 1, 2);
      need(!(P[0] === Q[0] && P[1] === Q[1]) && !(Q[0] === R[0] && Q[1] === R[1]) && !(P[0] === R[0] && P[1] === R[1]));
      const areaOf = (A, B, Cc) => Math.abs((B[0] - A[0]) * (Cc[1] - A[1]) - (Cc[0] - A[0]) * (B[1] - A[1])) / 2;
      need(areaOf(P, Q, R) > 0.5);
      const I = [P, Q, R].map((p) => enl(p, C, kVal(f)));
      const [x, y, z] = letPick(r);
      const fig = enlFig([P, Q, R], I, C, [x, y, z]);
      return { q: T(`The diagram shows triangle $${x}${y}${z}$ and its image $${x}'${y}'${z}'$ under an enlargement with centre $C$. By comparing the coordinates of an object vertex and its image, find the scale factor used.`, `Rajah menunjukkan segi tiga $${x}${y}${z}$ dan imejnya $${x}'${y}'${z}'$ di bawah pembesaran berpusat $C$. Dengan membandingkan koordinat satu bucu objek dan imejnya, cari faktor skala yang digunakan.`), fig, a: T(`$${n(kVal(f))}$`), sp: 's' };
    },
    (r) => {
      const obj = r.pick([5, 6, 8, 10]), pct = r.pick([150, 250, 400]), ctx = r.pick(ECTX);
      const k = pct / 100;
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} of length $${obj}$ cm and area $A$ cm$^2$ is enlarged to $${pct}\\%$ of its original size. Find the scale factor as a decimal, the new length, and the new area as a multiple of $A$.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} yang berpanjang $${obj}$ cm dan berluas $A$ cm$^2$ dibesarkan kepada $${pct}\\%$ daripada saiz asalnya. Cari faktor skala sebagai perpuluhan, panjang baharu, dan luas baharu sebagai gandaan $A$.`), a: T(`Scale factor $${n(k)}$; new length $${n(obj * k)}$ cm; new area $${n(k * k)}A$`, `Faktor skala $${n(k)}$; panjang baharu $${n(obj * k)}$ cm; luas baharu $${n(k * k)}A$`), sp: 'm' };
    },
    (r) => {
      const C = [r.int(-2, 2), r.int(-2, 2)], f = r.pick(KSET.slice(0, 2)), P = dpt(r, C, f.den, 3);
      need(P[0] !== C[0] || P[1] !== C[1]);
      const correct = enl(P, C, kVal(f));
      const wrong1 = [P[0] + kVal(f) * (P[0] - C[0]), P[1] + kVal(f) * (P[1] - C[1])]; // added instead of centre+k(P-C)
      const wrong2 = enl(P, C, 1 / kVal(f)); // used 1/k
      const wrong3 = [kVal(f) * P[0], kVal(f) * P[1]]; // ignored centre entirely
      const rawOpts = [correct, wrong1, wrong2, wrong3].map(pt);
      need(new Set(rawOpts).size === 4);
      const opts = r.shuffle(rawOpts);
      const letters = 'ABCD';
      return { q: T(`An enlargement has centre $C = ${pt(C)}$ and scale factor $${n(kVal(f))}$. Which of the following is the correct image of $P = ${pt(P)}$? ${opts.map((o, i) => `(${letters[i]}) $${o}$`).join(', ')}`, `Satu pembesaran berpusat $C = ${pt(C)}$ dan berfaktor skala $${n(kVal(f))}$. Yang manakah imej yang betul bagi $P = ${pt(P)}$? ${opts.map((o, i) => `(${letters[i]}) $${o}$`).join(', ')}`), a: T(`(${letters[opts.indexOf(pt(correct))]}) $${pt(correct)}$`), sp: 's' };
    },
    (r) => {
      const L = r.pick([4, 5, 6]), W = r.pick([3, 4, 5]), f = r.pick(KSET.slice(0, 2)), ctx = r.pick(ECTX);
      need(L !== W);
      const per = 2 * (L + W), newPer = per * kVal(f);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} is rectangular, $${L}$ cm by $${W}$ cm. It is enlarged with scale factor ${n(kVal(f))}. Find the perimeter of the original and of the enlarged copy.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} berbentuk segi empat tepat, $${L}$ cm dengan $${W}$ cm. Ia dibesarkan dengan faktor skala ${n(kVal(f))}. Cari perimeter yang asal dan salinan yang dibesarkan.`), a: T(`Original perimeter $${per}$ cm; enlarged perimeter $${n(newPer)}$ cm`, `Perimeter asal $${per}$ cm; perimeter yang dibesarkan $${n(newPer)}$ cm`), sp: 's' };
    },
    (r) => {
      const a = r.pick([2, 3, 4]), b = r.pick([5, 6, 7, 8].filter((v) => v > a && SPM.gcd(a, v) === 1));
      const objArea = r.pick([1, 2, 3]) * a * a;
      const imgArea = objArea * (b * b) / (a * a);
      return { q: T(`Two similar shapes have corresponding sides in the ratio $${a} : ${b}$. The smaller shape has area $${objArea}$ cm$^2$. Find the area of the larger shape.`, `Dua bentuk serupa mempunyai sisi sepadan dalam nisbah $${a} : ${b}$. Bentuk yang lebih kecil mempunyai luas $${objArea}$ cm$^2$. Cari luas bentuk yang lebih besar.`), a: T(`Area ratio $${a * a} : ${b * b}$; larger area $= ${objArea} \\times \\dfrac{${b * b}}{${a * a}} = ${n(imgArea)}$ cm$^2$`, `Nisbah luas $${a * a} : ${b * b}$; luas yang lebih besar $= ${objArea} \\times \\dfrac{${b * b}}{${a * a}} = ${n(imgArea)}$ cm$^2$`), sp: 'm' };
    },
    (r) => {
      const C = [r.int(-2, 2), r.int(-2, 2)], f = r.pick(KSET.slice(0, 2));
      const P = [C[0] + r.nz(-3, 3), C[1] + r.nz(-3, 3)], ctx = r.pick(ECTX);
      const posImg = enl(P, C, kVal(f)), negImg = enl(P, C, kVal(f, -1));
      const useNeg = r.chance();
      const shown = useNeg ? negImg : posImg;
      return { q: T(`On a coordinate grid representing ${ctx.en}, a design point $P = ${pt(P)}$ is enlarged about a fixed point $C = ${pt(C)}$ to give $P' = ${pt(shown)}$. Both $k = ${n(kVal(f))}$ and $k = ${n(kVal(f, -1))}$ give the same distance $CP'$. Using the position of $P'$, determine which value of $k$ was actually used.`, `Pada satu grid koordinat yang mewakili ${ctx.ms}, satu titik reka bentuk $P = ${pt(P)}$ dibesarkan pada titik tetap $C = ${pt(C)}$ untuk menghasilkan $P' = ${pt(shown)}$. Kedua-dua $k = ${n(kVal(f))}$ dan $k = ${n(kVal(f, -1))}$ memberikan jarak $CP'$ yang sama. Menggunakan kedudukan $P'$, tentukan nilai $k$ yang sebenarnya digunakan.`), a: useNeg ? T(`$k = ${n(kVal(f, -1))}$: $P'$ is on the opposite side of $C$ from $P$.`, `$k = ${n(kVal(f, -1))}$: $P'$ berada di sebelah $C$ yang bertentangan dengan $P$.`) : T(`$k = ${n(kVal(f))}$: $P'$ is on the same side of $C$ as $P$.`, `$k = ${n(kVal(f))}$: $P'$ berada di sebelah $C$ yang sama dengan $P$.`), sp: 'm' };
    },
    (r) => {
      const objLen = r.int(6, 11), imgLen = r.int(objLen + 2, objLen + 9);
      need(SPM.gcd(imgLen, objLen) === 1);
      const ctx = r.pick(ECTX);
      return { q: T(`On ${ctx.en}, a corresponding pair of lengths is $${objLen}$ cm (object) and $${imgLen}$ cm (image). Find the scale factor of the enlargement as a fraction in its simplest form.`, `Pada ${ctx.ms}, sepasang panjang yang sepadan ialah $${objLen}$ cm (objek) dan $${imgLen}$ cm (imej). Cari faktor skala pembesaran itu sebagai pecahan dalam bentuk termudah.`), a: T(`$${Fr.tex(Fr.make(imgLen, objLen))}$`), sp: 'm' };
    },
  ];
  const g52a = [
    (r) => {
      return retry(() => {
        const C = [r.int(-3, 3), r.int(-3, 3)], f = r.pick(KSET.slice(0, 2)), neg = r.chance(0.3);
        const k = kVal(f, neg ? -1 : 1);
        const P = [C[0] + r.int(-3, 3), C[1] + r.int(-3, 3)], Q = [C[0] + r.int(-3, 3), C[1] + r.int(-3, 3)];
        need(!(P[0] === C[0] && P[1] === C[1]) && !(Q[0] === C[0] && Q[1] === C[1]) && (P[0] - C[0]) * (Q[1] - C[1]) !== (P[1] - C[1]) * (Q[0] - C[0]));
        const P2 = enl(P, C, k), Q2 = enl(Q, C, k);
        const forms = [
          { en: 'An enlargement maps $P = {P}$ to $P\' = {P2}$ and $Q = {Q}$ to $Q\' = {Q2}$. Find the scale factor and the centre of the enlargement.', ms: 'Satu pembesaran memetakan $P = {P}$ kepada $P\' = {P2}$ dan $Q = {Q}$ kepada $Q\' = {Q2}$. Cari faktor skala dan pusat pembesaran itu.' },
          { en: 'Points $P = {P}$ and $Q = {Q}$ are mapped by an enlargement to $P\' = {P2}$ and $Q\' = {Q2}$ respectively. Determine the scale factor and locate the centre of enlargement.', ms: 'Titik $P = {P}$ dan $Q = {Q}$ dipetakan oleh satu pembesaran kepada $P\' = {P2}$ dan $Q\' = {Q2}$ masing-masing. Tentukan faktor skala dan cari lokasi pusat pembesaran itu.' },
        ];
        const q = pf(r, forms, { P: pt(P), Q: pt(Q), P2: pt(P2), Q2: pt(Q2) });
        return { q, a: T(`Scale factor ${n(k)}; centre $${pt(C)}$`, `Faktor skala ${n(k)}; pusat $${pt(C)}$`), w: T(`Lines $PP'$ and $QQ'$ meet at the centre; $k = \\dfrac{P'Q'}{PQ}$ (negative if the image is on the opposite side).`, `Garis $PP'$ dan $QQ'$ bertemu di pusat; $k = \\dfrac{P'Q'}{PQ}$ (negatif jika imej di sebelah bertentangan).`), sp: 'l' };
      });
    },
    (r) => {
      const A = r.int(3, 8), k = r.pick([2, 3, 4, 5]);
      const forms = [
        { en: 'An object has area {A} cm$^2$. Its image under an enlargement has area {A2} cm$^2$. Find $|k|$, the magnitude of the scale factor. Explain why the sign of $k$ cannot be determined from this information alone, and state what extra information would be needed.', ms: 'Sebuah objek mempunyai luas {A} cm$^2$. Imejnya di bawah satu pembesaran mempunyai luas {A2} cm$^2$. Cari $|k|$, magnitud faktor skala itu. Terangkan mengapa tanda $k$ tidak dapat ditentukan daripada maklumat ini sahaja, dan nyatakan maklumat tambahan yang diperlukan.' },
        { en: 'Two similar figures, an object and its enlarged image, have areas {A} cm$^2$ and {A2} cm$^2$ respectively. A student wants to find the scale factor $k$ of the enlargement. Find the only value that can be determined, $|k|$, and explain what is still unknown and why.', ms: 'Dua rajah serupa, iaitu satu objek dan imejnya yang dibesarkan, mempunyai luas {A} cm$^2$ dan {A2} cm$^2$ masing-masing. Seorang murid ingin mencari faktor skala $k$ bagi pembesaran itu. Cari nilai yang dapat ditentukan sahaja, $|k|$, dan terangkan apa yang masih tidak diketahui serta sebabnya.' },
      ];
      const q = pf(r, forms, { A, A2: A * k * k });
      return { q, a: T(`$|k| = \\sqrt{${A * k * k} \\div ${A}} = ${k}$. The sign cannot be found from area alone because both $k = ${k}$ and $k = ${-k}$ give the same area ratio $k^2$; the actual positions of the object, image and centre (or the orientation of the image) are needed to decide the sign.`, `$|k| = \\sqrt{${A * k * k} \\div ${A}} = ${k}$. Tanda itu tidak dapat ditentukan daripada luas sahaja kerana kedua-dua $k = ${k}$ dan $k = ${-k}$ memberikan nisbah luas $k^2$ yang sama; kedudukan sebenar objek, imej dan pusat (atau orientasi imej) diperlukan untuk menentukan tandanya.`), sp: 'm' };
    },
    (r) => {
      const A = r.pick([3, 4, 5, 6]), k = r.pick([2, 3]);
      const shaded = A * (k * k - 1);
      const giveShaded = r.chance();
      if (giveShaded) return { q: T(`An object of area $${A}$ cm$^2$ is enlarged with scale factor ${k} about an external centre, so the object and image do not overlap. Find the area of the shaded region between them, and express it as a fraction of the object's area.`, `Sebuah objek berluas $${A}$ cm$^2$ dibesarkan dengan faktor skala ${k} pada pusat luaran, supaya objek dan imej tidak bertindih. Cari luas kawasan berlorek di antaranya, dan nyatakannya sebagai pecahan daripada luas objek.`), a: T(`Shaded area $= (${k}^2 - 1)(${A}) = ${shaded}$ cm$^2$; ratio to object $= ${Fr.tex(Fr.make(shaded, A))}$`, `Luas berlorek $= (${k}^2 - 1)(${A}) = ${shaded}$ cm$^2$; nisbah kepada objek $= ${Fr.tex(Fr.make(shaded, A))}$`), sp: 'm' };
      return { q: T(`An object is enlarged with scale factor ${k} about an external centre, so the object and image do not overlap. The area of the region between them is $${shaded}$ cm$^2$. Find the area of the object.`, `Sebuah objek dibesarkan dengan faktor skala ${k} pada pusat luaran, supaya objek dan imej tidak bertindih. Luas kawasan di antaranya ialah $${shaded}$ cm$^2$. Cari luas objek itu.`), a: T(`Object area $= \\dfrac{${shaded}}{${k}^2 - 1} = ${A}$ cm$^2$`, `Luas objek $= \\dfrac{${shaded}}{${k}^2 - 1} = ${A}$ cm$^2$`), sp: 'm' };
    },
    (r) => {
      const C = [r.int(-2, 2), r.int(-2, 2)], f = r.pick(KSET.slice(0, 2));
      const P = [C[0] + r.nz(-3, 3), C[1] + r.nz(-3, 3)];
      const posImg = enl(P, C, kVal(f)), negImg = enl(P, C, kVal(f, -1));
      const useNeg = r.chance();
      const shown = useNeg ? negImg : posImg;
      return { q: T(`An enlargement with centre $C = ${pt(C)}$ maps $P = ${pt(P)}$ to $P' = ${pt(shown)}$. Both $k = ${n(kVal(f))}$ and $k = ${n(kVal(f, -1))}$ give the same distance $CP'$. Determine, using the position of $P'$ relative to $C$ and $P$, which value of $k$ is correct.`, `Satu pembesaran berpusat $C = ${pt(C)}$ memetakan $P = ${pt(P)}$ kepada $P' = ${pt(shown)}$. Kedua-dua $k = ${n(kVal(f))}$ dan $k = ${n(kVal(f, -1))}$ memberikan jarak $CP'$ yang sama. Tentukan, menggunakan kedudukan $P'$ berbanding $C$ dan $P$, nilai $k$ yang betul.`), a: useNeg ? T(`$k = ${n(kVal(f, -1))}$: $P'$ is on the opposite side of $C$ from $P$.`, `$k = ${n(kVal(f, -1))}$: $P'$ berada di sebelah $C$ yang bertentangan dengan $P$.`) : T(`$k = ${n(kVal(f))}$: $P'$ is on the same side of $C$ as $P$.`, `$k = ${n(kVal(f))}$: $P'$ berada di sebelah $C$ yang sama dengan $P$.`), sp: 'm' };
    },
    (r) => {
      const C = [0, 0], f = r.pick(KSET.slice(0, 2));
      const P = dpt(r, C, f.den, 3), Q = dpt(r, C, f.den, 3), R = dpt(r, C, f.den, 3);
      need(!(P[0] === Q[0] && P[1] === Q[1]) && !(Q[0] === R[0] && Q[1] === R[1]) && !(P[0] === R[0] && P[1] === R[1]));
      const areaOf = (A, B, Cc) => Math.abs((B[0] - A[0]) * (Cc[1] - A[1]) - (Cc[0] - A[0]) * (B[1] - A[1])) / 2;
      const objArea = areaOf(P, Q, R);
      need(objArea > 0);
      const per = (A, B, Cc) => Math.hypot(A[0] - B[0], A[1] - B[1]) + Math.hypot(B[0] - Cc[0], B[1] - Cc[1]) + Math.hypot(Cc[0] - A[0], Cc[1] - A[1]);
      const objPer = per(P, Q, R);
      const [x, y, z] = letPick(r);
      const I = [P, Q, R].map((p) => enl(p, C, kVal(f)));
      return { q: T(`Triangle $${x}${y}${z}$ has $${x} = ${pt(P)}$, $${y} = ${pt(Q)}$, $${z} = ${pt(R)}$. It is enlarged with centre the origin and scale factor $${n(kVal(f))}$. (a) Find the coordinates of the image. (b) State the ratio of the image's area to the object's area. (c) State the ratio of the image's perimeter to the object's perimeter.`, `Segi tiga $${x}${y}${z}$ mempunyai $${x} = ${pt(P)}$, $${y} = ${pt(Q)}$, $${z} = ${pt(R)}$. Ia dibesarkan dengan pusat pada asalan dan faktor skala $${n(kVal(f))}$. (a) Cari koordinat imej itu. (b) Nyatakan nisbah luas imej kepada luas objek. (c) Nyatakan nisbah perimeter imej kepada perimeter objek.`), a: T(`(a) $${x}'${pt(I[0])}, ${y}'${pt(I[1])}, ${z}'${pt(I[2])}$ (b) $${Fr.tex(areaFrOf(f))} : 1$ (c) $${n(kVal(f))} : 1$`), sp: 'l' };
    },
    (r) => {
      const C = [r.int(-3, 3), r.int(-3, 3)], f = r.pick(KSET.slice(0, 2));
      const P = dpt(r, C, f.den, 3), Q = dpt(r, C, f.den, 3), R = dpt(r, C, f.den, 3);
      need(!(P[0] === Q[0] && P[1] === Q[1]));
      const P2 = enl(P, C, kVal(f)), Q2 = enl(Q, C, kVal(f)), Rbad = [R[0] + r.nz(1, 2) * r.sign(), R[1] + r.nz(1, 2) * r.sign()];
      return { q: T(`A student claims that an enlargement with centre $C = ${pt(C)}$ and scale factor $${n(kVal(f))}$ maps $P = ${pt(P)}$ to $P' = ${pt(P2)}$, $Q = ${pt(Q)}$ to $Q' = ${pt(Q2)}$, and $R = ${pt(R)}$ to $R' = ${pt(Rbad)}$. Check each image point by calculation. Is the claim fully correct? If not, state which point is wrong and give its correct image.`, `Seorang murid mendakwa bahawa satu pembesaran berpusat $C = ${pt(C)}$ dan faktor skala $${n(kVal(f))}$ memetakan $P = ${pt(P)}$ kepada $P' = ${pt(P2)}$, $Q = ${pt(Q)}$ kepada $Q' = ${pt(Q2)}$, dan $R = ${pt(R)}$ kepada $R' = ${pt(Rbad)}$. Semak setiap titik imej dengan pengiraan. Adakah dakwaan itu betul sepenuhnya? Jika tidak, nyatakan titik yang salah dan berikan imej yang betul.`), a: T(`$P'$ and $Q'$ are correct. $R'$ is wrong: the correct image is $${pt(enl(R, C, kVal(f)))}$.`, `$P'$ dan $Q'$ adalah betul. $R'$ adalah salah: imej yang betul ialah $${pt(enl(R, C, kVal(f)))}$.`), sp: 'm' };
    },
    (r) => {
      const obj = r.pick([4, 5, 6, 8]), objArea = r.pick([12, 15, 20, 24]), k = r.pick([2, 3]), ctx = r.pick(ECTX);
      const imgLen = obj * k, imgArea = objArea * k * k, cost = r.pick([2, 3, 4]);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} has a border of length $${obj}$ cm and total area $${objArea}$ cm$^2$. It is enlarged with scale factor ${k}. Framing material for the border costs RM${cost} per cm and backing material for the area costs RM1 per cm$^2$. Find the total cost of materials for the enlarged copy.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} mempunyai sempadan berpanjang $${obj}$ cm dan jumlah luas $${objArea}$ cm$^2$. Ia dibesarkan dengan faktor skala ${k}. Bahan bingkai bagi sempadan berharga RM${cost} setiap cm dan bahan sokongan bagi luas berharga RM1 setiap cm$^2$. Cari jumlah kos bahan bagi salinan yang dibesarkan.`), a: T(`Border $${imgLen}$ cm, area $${imgArea}$ cm$^2$; cost $= ${imgLen} \\times ${cost} + ${imgArea} \\times 1 = ${rm(imgLen * cost + imgArea)}$`, `Sempadan $${imgLen}$ cm, luas $${imgArea}$ cm$^2$; kos $= ${imgLen} \\times ${cost} + ${imgArea} \\times 1 = ${rm(imgLen * cost + imgArea)}$`), w: T('Length scales by $k$, area by $k^2$.', 'Panjang berskala dengan $k$, luas dengan $k^2$.'), sp: 'l' };
    },
    (r) => {
      const A1 = r.pick([3, 5, 6, 8]), k1 = r.pick([2, 3]), k2 = r.pick([2, 3].filter((v) => v !== k1));
      const A2 = A1 * k1 * k1;
      const A3 = A2 * k2 * k2;
      const overallK = k1 * k2;
      return { q: T(`Shape $X$ has area $${A1}$ cm$^2$. It is enlarged with scale factor ${k1} to give shape $Y$, and shape $Y$ is then enlarged with scale factor ${k2} to give shape $Z$. Find the area of $Y$, the area of $Z$, and the single scale factor that would enlarge $X$ directly to $Z$.`, `Bentuk $X$ mempunyai luas $${A1}$ cm$^2$. Ia dibesarkan dengan faktor skala ${k1} untuk menghasilkan bentuk $Y$, dan bentuk $Y$ kemudian dibesarkan dengan faktor skala ${k2} untuk menghasilkan bentuk $Z$. Cari luas $Y$, luas $Z$, dan faktor skala tunggal yang akan membesarkan $X$ terus kepada $Z$.`), a: T(`Area of $Y = ${A2}$ cm$^2$; area of $Z = ${A3}$ cm$^2$; overall scale factor $= ${k1} \\times ${k2} = ${overallK}$ (check: $${A1} \\times ${overallK}^2 = ${A3}$)`, `Luas $Y = ${A2}$ cm$^2$; luas $Z = ${A3}$ cm$^2$; faktor skala keseluruhan $= ${k1} \\times ${k2} = ${overallK}$ (semak: $${A1} \\times ${overallK}^2 = ${A3}$)`), sp: 'm' };
    },
    (r) => {
      const f = r.pick(KSET), ctx = r.pick(ECTX);
      const orig = r.pick([6, 8, 9, 10, 12]);
      need(orig % f.den === 0);
      const enlLen = orig * kVal(f);
      const budget = r.pick([20, 30, 50]);
      const rate = r.pick([1, 2]);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} with a border of length $${orig}$ cm is to be enlarged with scale factor $${kTexOf(f)}$. Framing costs RM${rate} per cm of border, and the budget is RM${budget}. Find the length of the enlarged border, its framing cost, and state whether the budget is enough.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} dengan sempadan berpanjang $${orig}$ cm akan dibesarkan dengan faktor skala $${kTexOf(f)}$. Bingkai berharga RM${rate} setiap cm sempadan, dan bajet ialah RM${budget}. Cari panjang sempadan yang dibesarkan, kosnya, dan nyatakan sama ada bajet mencukupi.`), a: T(`Enlarged border $${n(enlLen)}$ cm; cost ${rm(enlLen * rate)}; budget is ${enlLen * rate <= budget ? 'enough' : 'NOT enough'}.`, `Sempadan yang dibesarkan $${n(enlLen)}$ cm; kos ${rm(enlLen * rate)}; bajet ${enlLen * rate <= budget ? 'mencukupi' : 'TIDAK mencukupi'}.`), sp: 'm' };
    },
    (r) => {
      const f1 = r.pick(KSET.slice(0, 2)), f2 = r.pick(KSET.slice(2)), ctx = r.pick(ECTX);
      const orig = r.pick([2, 3]) * f2.den * r.pick([1, 2]);
      need(orig % f2.den === 0);
      const stage1 = orig * kVal(f1);
      const stage2 = stage1 * kVal(f2);
      const overall = kVal(f1) * kVal(f2);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} of length $${orig}$ cm is first enlarged with scale factor $${n(kVal(f1))}$, and the result is then reduced with scale factor $${kTexOf(f2)}$. Find the final length, and the single scale factor equivalent to doing both in one step.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} yang berpanjang $${orig}$ cm mula-mula dibesarkan dengan faktor skala $${n(kVal(f1))}$, dan hasilnya kemudian dikecilkan dengan faktor skala $${kTexOf(f2)}$. Cari panjang akhir, dan faktor skala tunggal yang setara dengan melakukan kedua-duanya dalam satu langkah.`), a: T(`Final length $${n(stage2)}$ cm; overall scale factor $${n(kVal(f1))} \\times ${kTexOf(f2)} = ${n(overall)}$`, `Panjang akhir $${n(stage2)}$ cm; faktor skala keseluruhan $${n(kVal(f1))} \\times ${kTexOf(f2)} = ${n(overall)}$`), sp: 'm' };
    },
    (r) => {
      const A = r.pick([4, 5, 6]), k1 = r.pick([2, 3]), ctx = r.pick(ECTX);
      const A2 = A * k1 * k1;
      const wrongA2 = A * k1;
      return { q: T(`A student is asked to find the area of the enlarged copy of ${ctx.en}, whose original area is $${A}$ cm$^2$, under a scale factor of ${k1}. The student writes: "New area $= ${A} \\times ${k1} = ${wrongA2}$ cm$^2$." (a) Identify the student's error. (b) Give the correct new area. (c) The student then claims that since the scale factor is a whole number, the new area must also be a whole number — is this reasoning valid in general? Explain briefly.`, `Seorang murid diminta mencari luas salinan yang dibesarkan bagi ${ctx.ms}, yang luas asalnya $${A}$ cm$^2$, di bawah faktor skala ${k1}. Murid itu menulis: "Luas baharu $= ${A} \\times ${k1} = ${wrongA2}$ cm$^2$." (a) Kenal pasti kesilapan murid itu. (b) Berikan luas baharu yang betul. (c) Murid itu kemudian mendakwa bahawa oleh kerana faktor skala ialah nombor bulat, luas baharu juga mestilah nombor bulat — adakah alasan ini sah secara am? Terangkan secara ringkas.`), a: T(`(a) The student multiplied by $k$ instead of $k^2$. (b) Correct area $= ${A} \\times ${k1}^2 = ${A2}$ cm$^2$. (c) Yes in this case, but in general only when $k^2 A$ happens to be a whole number, e.g. this fails if $A$ or $k$ is not a whole number.`, `(a) Murid itu mendarab dengan $k$ dan bukannya $k^2$. (b) Luas yang betul $= ${A} \\times ${k1}^2 = ${A2}$ cm$^2$. (c) Ya dalam kes ini, tetapi secara am hanya apabila $k^2 A$ kebetulan nombor bulat, cth. ini gagal jika $A$ atau $k$ bukan nombor bulat.`), sp: 'l' };
    },
    (r) => {
      const A = r.pick([3, 4, 5]), kA = r.pick([2, 3]), kB = r.pick([2, 3].filter((v) => v !== kA)), ctx = r.pick(ECTX);
      const areaA = A * kA * kA, areaB = A * kB * kB;
      return { q: T(`Two printers each enlarge the same original of ${ctx.en}, whose area is $${A}$ cm$^2$: Printer X uses scale factor ${kA} and Printer Y uses scale factor ${kB}. Find the area produced by each printer, and how many times bigger Printer Y's copy is than Printer X's copy (as a ratio of areas).`, `Dua pencetak masing-masing membesarkan bahan asal yang sama bagi ${ctx.ms}, yang luasnya $${A}$ cm$^2$: Pencetak X menggunakan faktor skala ${kA} dan Pencetak Y menggunakan faktor skala ${kB}. Cari luas yang dihasilkan oleh setiap pencetak, dan berapa kali lebih besar salinan Pencetak Y berbanding salinan Pencetak X (sebagai nisbah luas).`), a: T(`Printer X: $${areaA}$ cm$^2$; Printer Y: $${areaB}$ cm$^2$; ratio $${areaB} : ${areaA} = ${Fr.tex(Fr.make(areaB, areaA))}$`, `Pencetak X: $${areaA}$ cm$^2$; Pencetak Y: $${areaB}$ cm$^2$; nisbah $${areaB} : ${areaA} = ${Fr.tex(Fr.make(areaB, areaA))}$`), sp: 'm' };
    },
  ];

  SPM.extend('F5-5.2', { e: g52e, m: g52m, a: g52a });

  /* =============================================================== 5.3 Combined transformations */
  const COS90 = { 0: 1, 90: 0, 180: -1, 270: 0 }, SIN90 = { 0: 0, 90: 1, 180: 0, 270: -1 };
  const rot0 = (P, C, deg) => {
    const a = ((deg % 360) + 360) % 360, co = COS90[a], si = SIN90[a];
    const x = P[0] - C[0], y = P[1] - C[1];
    return [C[0] + x * co - y * si, C[1] + x * si + y * co];
  };
  const centreTxt = (C) => (C[0] === 0 && C[1] === 0 ? T('the origin', 'asalan') : T(`$${pt(C)}$`, `$${pt(C)}$`));
  const mkTransl = (v) => ({ kind: 'transl', v, apply: (P) => [P[0] + v[0], P[1] + v[1]], en: `translation by $\\begin{pmatrix} ${n(v[0])} \\\\ ${n(v[1])} \\end{pmatrix}$`, ms: `translasi oleh $\\begin{pmatrix} ${n(v[0])} \\\\ ${n(v[1])} \\end{pmatrix}$` });
  const mkReflX = () => ({ kind: 'reflX', apply: (P) => [P[0], -P[1]], en: 'reflection in the $x$-axis', ms: 'pantulan pada paksi-$x$' });
  const mkReflY = () => ({ kind: 'reflY', apply: (P) => [-P[0], P[1]], en: 'reflection in the $y$-axis', ms: 'pantulan pada paksi-$y$' });
  const mkReflV = (k) => ({ kind: 'reflV', k, apply: (P) => [2 * k - P[0], P[1]], en: `reflection in the line $x = ${n(k)}$`, ms: `pantulan pada garis $x = ${n(k)}$` });
  const mkReflH = (k) => ({ kind: 'reflH', k, apply: (P) => [P[0], 2 * k - P[1]], en: `reflection in the line $y = ${n(k)}$`, ms: `pantulan pada garis $y = ${n(k)}$` });
  const mkRot = (deg, dir, C) => {
    C = C || [0, 0];
    const signed = dir === 'cw' ? -deg : deg;
    return { kind: 'rot', deg, dir, C, apply: (P) => rot0(P, C, signed), en: `rotation of $${deg}^\\circ$ ${dir === 'cw' ? 'clockwise' : 'anticlockwise'} about ${centreTxt(C).en}`, ms: `putaran $${deg}^\\circ$ ${dir === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} pada ${centreTxt(C).ms}` };
  };
  const mkEnl2 = (k, C) => {
    C = C || [0, 0];
    return { kind: 'enl', k, C, apply: (P) => [C[0] + k * (P[0] - C[0]), C[1] + k * (P[1] - C[1])], en: `enlargement with centre ${centreTxt(C).en} and scale factor ${n(k)}`, ms: `pembesaran berpusat ${centreTxt(C).ms} dan faktor skala ${n(k)}` };
  };
  /** random transformation instance. o = { lim, line, enl, rotC } */
  const randTr = (r, o) => {
    o = o || {};
    const lim = o.lim || 4;
    const kinds = ['transl', 'reflX', 'reflY', 'rot'];
    if (o.line) kinds.push('reflV', 'reflH');
    if (o.enl) kinds.push('enl');
    const kind = r.pick(kinds);
    if (kind === 'transl') return mkTransl([r.nz(-lim, lim), r.nz(-lim, lim)]);
    if (kind === 'reflX') return mkReflX();
    if (kind === 'reflY') return mkReflY();
    if (kind === 'reflV') return mkReflV(r.int(-lim, lim));
    if (kind === 'reflH') return mkReflH(r.int(-lim, lim));
    if (kind === 'rot') return mkRot(r.pick([90, 180, 270]), r.pick(['cw', 'ccw']), o.rotC || [0, 0]);
    return mkEnl2(r.pick([2, 3, 0.5]), o.rotC || [0, 0]);
  };
  const invPts = (t) => {
    if (t.kind === 'transl') return t.v[0] === 0 && t.v[1] === 0 ? T('every point', 'setiap titik') : T('none (no point is unchanged)', 'tiada (tiada titik yang tidak berubah)');
    if (t.kind === 'reflX') return T('every point on the $x$-axis (i.e. $y = 0$)', 'setiap titik pada paksi-$x$ (iaitu $y = 0$)');
    if (t.kind === 'reflY') return T('every point on the $y$-axis (i.e. $x = 0$)', 'setiap titik pada paksi-$y$ (iaitu $x = 0$)');
    if (t.kind === 'reflV') return T(`every point on the line $x = ${n(t.k)}$`, `setiap titik pada garis $x = ${n(t.k)}$`);
    if (t.kind === 'reflH') return T(`every point on the line $y = ${n(t.k)}$`, `setiap titik pada garis $y = ${n(t.k)}$`);
    if (t.kind === 'rot') return T(`only the centre of rotation, ${centreTxt(t.C).en}`, `hanya pusat putaran, ${centreTxt(t.C).ms}`);
    return T(`only the centre of enlargement, ${centreTxt(t.C).en}`, `hanya pusat pembesaran, ${centreTxt(t.C).ms}`);
  };
  const shapeNames3 = (r) => letPick(r);
  const CTX53 = [
    T('a marker on a robotic arm', 'sebuah penanda pada lengan robot'), T('a game character on screen', 'sebuah watak permainan pada skrin'),
    T('a drone waypoint', 'sebuah titik laluan dron'), T('a dance formation marker', 'sebuah penanda formasi tarian'),
    T('a satellite tracking point', 'sebuah titik penjejakan satelit'), T('a piece on a design app canvas', 'sebuah objek pada kanvas aplikasi reka bentuk'),
  ];

  const g53e = [
    (r) => {
      const T1 = randTr(r, { lim: 4 });
      const kindName = T1.kind === 'transl' ? T('translation', 'translasi') : T1.kind.startsWith('refl') ? T('reflection', 'pantulan') : T1.kind === 'rot' ? T('rotation', 'putaran') : T('enlargement', 'pembesaran');
      return { q: T(`Name the type of isometric or size transformation described: "${T1.en}".`, `Namakan jenis transformasi isometri atau saiz yang diterangkan: "${T1.ms}".`), a: kindName, sp: 'xs' };
    },
    (r) => {
      const T1 = randTr(r, { lim: 4, line: true });
      const preserves = T1.kind === 'enl' ? T('changes (unless the scale factor is $1$)', 'berubah (melainkan faktor skala ialah $1$)') : T('stays exactly the same (it is an isometry)', 'kekal sama sepenuhnya (ia satu isometri)');
      return { q: T(`A shape undergoes ${T1.en}. Does the size (area) of the shape change or stay the same under this transformation?`, `Sebuah bentuk mengalami ${T1.ms}. Adakah saiz (luas) bentuk itu berubah atau kekal sama di bawah transformasi ini?`), a: preserves, sp: 'xs' };
    },
    (r) => {
      const P = [r.int(-4, 4), r.int(-4, 4)];
      const T1 = randTr(r, { lim: 4 }), T2 = randTr(r, { lim: 4 });
      const I1 = T1.apply(P), I2 = T2.apply(I1);
      const forms = [
        { en: '$P = {P}$ is mapped by {T1}, and the image is then mapped by {T2}. Find the final image.', ms: '$P = {P}$ dipetakan oleh {T1}, dan imejnya kemudian dipetakan oleh {T2}. Cari imej akhir.' },
        { en: 'Transformation $T_1$ is {T1} and transformation $T_2$ is {T2}. Find the image of $P = {P}$ under $T_1$ followed by $T_2$.', ms: 'Transformasi $T_1$ ialah {T1} dan transformasi $T_2$ ialah {T2}. Cari imej bagi $P = {P}$ di bawah $T_1$ diikuti $T_2$.' },
      ];
      const f = r.pick(forms);
      const q = T(f.en.replace('{P}', pt(P)).replace('{T1}', T1.en).replace('{T2}', T2.en), f.ms.replace('{P}', pt(P)).replace('{T1}', T1.ms).replace('{T2}', T2.ms));
      return { q, a: T(`After $T_1$: $${pt(I1)}$; final image $${pt(I2)}$`, `Selepas $T_1$: $${pt(I1)}$; imej akhir $${pt(I2)}$`), sp: 's' };
    },
    (r) => {
      const P = [r.int(-4, 4), r.int(-4, 4)];
      const T1 = randTr(r, { lim: 4 }), T2 = randTr(r, { lim: 4 });
      const I1 = T1.apply(P), I2 = T2.apply(I1);
      return { q: T(`Define $T_1T_2(P)$ to mean "apply $T_1$ first, then apply $T_2$". Given $T_1$: ${T1.en}, and $T_2$: ${T2.en}, find $T_1T_2(P)$ for $P = ${pt(P)}$.`, `Takrifkan $T_1T_2(P)$ bermaksud "kenakan $T_1$ dahulu, kemudian kenakan $T_2$". Diberi $T_1$: ${T1.ms}, dan $T_2$: ${T2.ms}, cari $T_1T_2(P)$ bagi $P = ${pt(P)}$.`), a: T(`$${pt(I2)}$`), w: T(`After $T_1$: $${pt(I1)}$`, `Selepas $T_1$: $${pt(I1)}$`), sp: 's' };
    },
    (r) => {
      const v1 = [r.nz(-4, 4), r.nz(-4, 4)], v2 = [r.nz(-4, 4), r.nz(-4, 4)];
      const P = [r.int(-3, 3), r.int(-3, 3)];
      const I2 = [P[0] + v1[0] + v2[0], P[1] + v1[1] + v2[1]];
      return { q: T(`$P = ${pt(P)}$ is mapped by translation $\\begin{pmatrix} ${v1[0]} \\\\ ${v1[1]} \\end{pmatrix}$ followed by translation $\\begin{pmatrix} ${v2[0]} \\\\ ${v2[1]} \\end{pmatrix}$. Find the final image, and the single translation that has the same effect.`, `$P = ${pt(P)}$ dipetakan oleh translasi $\\begin{pmatrix} ${v1[0]} \\\\ ${v1[1]} \\end{pmatrix}$ diikuti oleh translasi $\\begin{pmatrix} ${v2[0]} \\\\ ${v2[1]} \\end{pmatrix}$. Cari imej akhir, dan translasi tunggal yang memberi kesan yang sama.`), a: T(`$${pt(I2)}$; $\\begin{pmatrix} ${v1[0] + v2[0]} \\\\ ${v1[1] + v2[1]} \\end{pmatrix}$`), sp: 's' };
    },
    (r) => {
      const t = randTr(r, { lim: 3, enl: true, rotC: [0, 0] });
      return { q: T(`State all the invariant point(s) (points that map to themselves) under ${t.en}.`, `Nyatakan semua titik-titik tak varian (titik yang dipetakan kepada dirinya sendiri) di bawah ${t.ms}.`), a: invPts(t), sp: 'xs' };
    },
    (r) => {
      const P = [r.nz(-4, 4), r.nz(-4, 4)];
      const T1 = randTr(r, { lim: 3 }), T2 = randTr(r, { lim: 3 });
      const AB = T2.apply(T1.apply(P));
      const BA = T1.apply(T2.apply(P));
      const same = AB[0] === BA[0] && AB[1] === BA[1];
      return { q: T(`Let $T_1$: ${T1.en}, and $T_2$: ${T2.en}. For $P = ${pt(P)}$, find the image under $T_1$ followed by $T_2$, and the image under $T_2$ followed by $T_1$. Are the two results the same for this point?`, `Katakan $T_1$: ${T1.ms}, dan $T_2$: ${T2.ms}. Bagi $P = ${pt(P)}$, cari imej di bawah $T_1$ diikuti $T_2$, dan imej di bawah $T_2$ diikuti $T_1$. Adakah kedua-dua hasil ini sama bagi titik ini?`), a: T(`$T_1$ then $T_2$: $${pt(AB)}$; $T_2$ then $T_1$: $${pt(BA)}$. ${same ? 'Same for this point.' : 'Not the same.'}`, `$T_1$ kemudian $T_2$: $${pt(AB)}$; $T_2$ kemudian $T_1$: $${pt(BA)}$. ${same ? 'Sama bagi titik ini.' : 'Tidak sama.'}`), sp: 's' };
    },
    (r) => {
      const P = [r.int(-4, 4), r.int(-4, 4)];
      const kind = r.pick(['transl', 'reflX', 'reflY', 'rot']);
      const t = kind === 'transl' ? mkTransl([r.nz(-4, 4), r.nz(-4, 4)]) : kind === 'reflX' ? mkReflX() : kind === 'reflY' ? mkReflY() : mkRot(r.pick([90, 180, 270]), r.pick(['cw', 'ccw']), [0, 0]);
      const I = t.apply(P);
      const distractors = [T('reflection', 'pantulan'), T('rotation', 'putaran'), T('translation', 'translasi'), T('enlargement', 'pembesaran')];
      const correctName = kind === 'transl' ? distractors[2] : kind.startsWith('refl') ? distractors[0] : distractors[1];
      return { q: T(`$P = ${pt(P)}$ is mapped to $P' = ${pt(I)}$ by a single isometric transformation. Given that the transformation is ${t.en}, name its type.`, `$P = ${pt(P)}$ dipetakan kepada $P' = ${pt(I)}$ oleh satu transformasi isometri tunggal. Diberi bahawa transformasi itu ialah ${t.ms}, namakan jenisnya.`), a: correctName, sp: 'xs' };
    },
  ];
  const g53m = [
    (r) => {
      const P = [r.int(-4, 4), r.int(-4, 4)];
      const T1 = randTr(r, { lim: 4, line: true, enl: true, rotC: [r.int(-2, 2), r.int(-2, 2)] }), T2 = randTr(r, { lim: 4, line: true, enl: true, rotC: [r.int(-2, 2), r.int(-2, 2)] });
      const I1 = T1.apply(P), I2 = T2.apply(I1);
      const forms = [
        { en: '$P = {P}$ is mapped by {T1}, and the image is then mapped by {T2}. Find the final image.', ms: '$P = {P}$ dipetakan oleh {T1}, dan imejnya kemudian dipetakan oleh {T2}. Cari imej akhir.' },
        { en: 'A point $P = {P}$ undergoes {T1} first, then {T2}. Find the coordinates of the final image.', ms: 'Satu titik $P = {P}$ mengalami {T1} dahulu, kemudian {T2}. Cari koordinat imej akhir.' },
      ];
      const f = r.pick(forms);
      const sub = (s, lang) => s.replace('{P}', pt(P)).replace('{T1}', T1[lang]).replace('{T2}', T2[lang]);
      return { q: T(sub(f.en, 'en'), sub(f.ms, 'ms')), a: T(`After $T_1$: $${pt(I1)}$; final image $${pt(I2)}$`, `Selepas $T_1$: $${pt(I1)}$; imej akhir $${pt(I2)}$`), sp: 's' };
    },
    (r) => {
      const C = [0, 0];
      const P = [r.nz(-3, 3), r.nz(-3, 3)], Q = [r.nz(-3, 3), r.nz(-3, 3)], R = [r.nz(-3, 3), r.nz(-3, 3)];
      const T1 = randTr(r, { lim: 3, rotC: [0, 0] }), T2 = randTr(r, { lim: 3, rotC: [0, 0] });
      const [x, y, z] = shapeNames3(r);
      const I1 = [P, Q, R].map(T1.apply), I2 = I1.map(T2.apply);
      return { q: T(`Triangle $${x}${y}${z}$ has $${x} = ${pt(P)}$, $${y} = ${pt(Q)}$, $${z} = ${pt(R)}$. It is mapped by ${T1.en}, and the image is then mapped by ${T2.en}. Find the coordinates of the final image.`, `Segi tiga $${x}${y}${z}$ mempunyai $${x} = ${pt(P)}$, $${y} = ${pt(Q)}$, $${z} = ${pt(R)}$. Ia dipetakan oleh ${T1.ms}, dan imejnya kemudian dipetakan oleh ${T2.ms}. Cari koordinat imej akhir.`), a: T(`$${x}'${pt(I2[0])}, ${y}'${pt(I2[1])}, ${z}'${pt(I2[2])}$`), sp: 'm' };
    },
    (r) => {
      const P = [r.nz(-3, 3), r.nz(-3, 3)];
      const C = [0, 0];
      const d1 = r.pick([90, 180]), d2 = r.pick([90, 180].filter((v) => v !== d1 || true));
      const dir = r.pick(['cw', 'ccw']);
      const T1 = mkRot(d1, dir, C), T2 = mkRot(d2, dir, C);
      const I1 = T1.apply(P), I2 = T2.apply(I1);
      const total = (d1 + d2) % 360;
      const totalTxt = total === 0 ? T('$0^\\circ$ (the identity — every point maps to itself)', '$0^\\circ$ (identiti — setiap titik dipetakan kepada dirinya sendiri)') : T(`$${total}^\\circ$ ${dir === 'cw' ? 'clockwise' : 'anticlockwise'} about the origin`, `$${total}^\\circ$ ${dir === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} pada asalan`);
      return { q: T(`$P = ${pt(P)}$ is rotated $${d1}^\\circ$ ${dir === 'cw' ? 'clockwise' : 'anticlockwise'} about the origin, and the image is then rotated $${d2}^\\circ$ ${dir === 'cw' ? 'clockwise' : 'anticlockwise'} about the origin. Find the final image, and the single rotation about the origin that has the same effect.`, `$P = ${pt(P)}$ diputarkan $${d1}^\\circ$ ${dir === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} pada asalan, dan imejnya kemudian diputarkan $${d2}^\\circ$ ${dir === 'cw' ? 'ikut arah jam' : 'lawan arah jam'} pada asalan. Cari imej akhir, dan putaran tunggal pada asalan yang memberi kesan yang sama.`), a: T(`$${pt(I2)}$; a rotation of ${totalTxt.en}`, `$${pt(I2)}$; putaran ${totalTxt.ms}`), sp: 'm' };
    },
    (r) => {
      const a = r.int(-3, 3), b = retry(() => { const v = r.int(-3, 3); need(v !== a); return v; });
      const vert = r.chance();
      const P = [r.nz(-4, 4), r.nz(-4, 4)];
      const T1 = vert ? mkReflV(a) : mkReflH(a), T2 = vert ? mkReflV(b) : mkReflH(b);
      const I1 = T1.apply(P), I2 = T2.apply(I1);
      const gap = 2 * (b - a);
      return { q: T(`$P = ${pt(P)}$ is reflected in the line $${vert ? 'x' : 'y'} = ${a}$, and the image is then reflected in the line $${vert ? 'x' : 'y'} = ${b}$. Find the final image, and the single translation that has the same effect.`, `$P = ${pt(P)}$ dipantulkan pada garis $${vert ? 'x' : 'y'} = ${a}$, dan imejnya kemudian dipantulkan pada garis $${vert ? 'x' : 'y'} = ${b}$. Cari imej akhir, dan translasi tunggal yang memberi kesan yang sama.`), a: T(`$${pt(I2)}$; translation $\\begin{pmatrix} ${vert ? gap : 0} \\\\ ${vert ? 0 : gap} \\end{pmatrix}$`, `$${pt(I2)}$; translasi $\\begin{pmatrix} ${vert ? gap : 0} \\\\ ${vert ? 0 : gap} \\end{pmatrix}$`), w: T('Two reflections in parallel lines combine to a translation perpendicular to the lines, of magnitude twice the distance between them.', 'Dua pantulan pada garis selari bergabung menjadi satu translasi berserenjang dengan garis itu, bermagnitud dua kali jarak antaranya.'), sp: 'm' };
    },
    (r) => {
      const kind = r.pick(['reflX', 'reflY', 'reflV', 'reflH', 'rot', 'enl']);
      const t = kind === 'reflX' ? mkReflX() : kind === 'reflY' ? mkReflY() : kind === 'reflV' ? mkReflV(r.int(-3, 3)) : kind === 'reflH' ? mkReflH(r.int(-3, 3)) : kind === 'rot' ? mkRot(r.pick([90, 180, 270]), r.pick(['cw', 'ccw']), [r.int(-2, 2), r.int(-2, 2)]) : mkEnl2(r.pick([2, 3]), [r.int(-2, 2), r.int(-2, 2)]);
      const incomplete = kind.startsWith('refl') ? T('reflection', 'pantulan') : kind === 'rot' ? T('rotation', 'putaran') : T('enlargement', 'pembesaran');
      const missing = kind.startsWith('refl') ? T('the mirror line', 'garis cermin') : kind === 'rot' ? T('the centre, the angle, and the direction', 'pusat, sudut, dan arah') : T('the centre and the scale factor', 'pusat dan faktor skala');
      return { q: T(`A student describes a transformation only as "${incomplete.en}". Explain why this description is incomplete, and give the full, correct description if the actual transformation is ${t.en}.`, `Seorang murid menerangkan satu transformasi hanya sebagai "${incomplete.ms}". Terangkan mengapa penerangan ini tidak lengkap, dan berikan penerangan penuh yang betul jika transformasi sebenar ialah ${t.ms}.`), a: T(`A full description must also state ${missing.en}. Full description: ${t.en}.`, `Penerangan penuh mesti turut menyatakan ${missing.ms}. Penerangan penuh: ${t.ms}.`), sp: 'm' };
    },
    (r) => {
      const t = randTr(r, { lim: 3, line: true, enl: true, rotC: [r.int(-2, 2), r.int(-2, 2)] });
      return { q: T(`State all the invariant point(s) under ${t.en}.`, `Nyatakan semua titik tak varian di bawah ${t.ms}.`), a: invPts(t), sp: 's' };
    },
    (r) => {
      const P = [r.nz(-3, 3), r.nz(-3, 3)];
      const T1 = mkTransl([r.nz(-3, 3), r.nz(-3, 3)]), T2 = randTr(r, { lim: 3, rotC: [0, 0] });
      const AB = T2.apply(T1.apply(P));
      const BA = T1.apply(T2.apply(P));
      const same = AB[0] === BA[0] && AB[1] === BA[1];
      return { q: T(`Let $T_1$: ${T1.en}, and $T_2$: ${T2.en}. Find the image of $P = ${pt(P)}$ under $T_1$ followed by $T_2$, and under $T_2$ followed by $T_1$. Do $T_1$ and $T_2$ commute for this point? Is one test point enough to conclude that they always commute?`, `Katakan $T_1$: ${T1.ms}, dan $T_2$: ${T2.ms}. Cari imej bagi $P = ${pt(P)}$ di bawah $T_1$ diikuti $T_2$, dan di bawah $T_2$ diikuti $T_1$. Adakah $T_1$ dan $T_2$ bertukar tertib bagi titik ini? Adakah satu titik ujian mencukupi untuk membuat kesimpulan bahawa keduanya sentiasa bertukar tertib?`), a: T(`$T_1T_2$: $${pt(AB)}$; $T_2T_1$: $${pt(BA)}$. ${same ? 'They agree for this point,' : 'They do not agree,'} but one point is not enough to conclude they always commute — every point (or a general point) must be checked.`, `$T_1T_2$: $${pt(AB)}$; $T_2T_1$: $${pt(BA)}$. ${same ? 'Ia sepadan bagi titik ini,' : 'Ia tidak sepadan,'} tetapi satu titik tidak mencukupi untuk membuat kesimpulan bahawa keduanya sentiasa bertukar tertib — setiap titik (atau titik am) perlu disemak.`), sp: 'm' };
    },
  ];
  const g53a = [
    (r) => {
      const P = [r.nz(-3, 3), r.nz(-3, 3)], Q = retry(() => { const q_ = [r.nz(-3, 3), r.nz(-3, 3)]; need(q_[0] !== P[0] || q_[1] !== P[1]); return q_; });
      const T1 = randTr(r, { lim: 3, line: true, rotC: [0, 0] }), T2 = randTr(r, { lim: 3, line: true, rotC: [0, 0] });
      const AB_P = T2.apply(T1.apply(P)), BA_P = T1.apply(T2.apply(P));
      const AB_Q = T2.apply(T1.apply(Q)), BA_Q = T1.apply(T2.apply(Q));
      const commute = AB_P[0] === BA_P[0] && AB_P[1] === BA_P[1] && AB_Q[0] === BA_Q[0] && AB_Q[1] === BA_Q[1];
      return { q: T(`Let $T_1$: ${T1.en}, and $T_2$: ${T2.en}. Using two different points $P = ${pt(P)}$ and $Q = ${pt(Q)}$, investigate whether $T_1$ and $T_2$ commute (i.e. whether $T_1$ followed by $T_2$ always gives the same result as $T_2$ followed by $T_1$).`, `Katakan $T_1$: ${T1.ms}, dan $T_2$: ${T2.ms}. Menggunakan dua titik berbeza $P = ${pt(P)}$ dan $Q = ${pt(Q)}$, siasat sama ada $T_1$ dan $T_2$ bertukar tertib (iaitu sama ada $T_1$ diikuti $T_2$ sentiasa memberi hasil yang sama seperti $T_2$ diikuti $T_1$).`), a: T(`$P$: $T_1T_2 = ${pt(AB_P)}$, $T_2T_1 = ${pt(BA_P)}$. $Q$: $T_1T_2 = ${pt(AB_Q)}$, $T_2T_1 = ${pt(BA_Q)}$. ${commute ? 'Both points agree, consistent with $T_1$ and $T_2$ commuting here.' : 'The results differ, so $T_1$ and $T_2$ do NOT commute.'}`, `$P$: $T_1T_2 = ${pt(AB_P)}$, $T_2T_1 = ${pt(BA_P)}$. $Q$: $T_1T_2 = ${pt(AB_Q)}$, $T_2T_1 = ${pt(BA_Q)}$. ${commute ? 'Kedua-dua titik sepadan, konsisten dengan $T_1$ dan $T_2$ bertukar tertib di sini.' : 'Hasilnya berbeza, jadi $T_1$ dan $T_2$ TIDAK bertukar tertib.'}`), sp: 'l' };
    },
    (r) => {
      const P = [r.nz(-3, 3), r.nz(-3, 3)], Q = retry(() => { const q_ = [r.nz(-3, 3), r.nz(-3, 3)]; need(q_[0] !== P[0] || q_[1] !== P[1]); return q_; });
      const T1 = randTr(r, { lim: 3, line: true, enl: true, rotC: [r.int(-2, 2), r.int(-2, 2)] }), T2 = randTr(r, { lim: 3, line: true, enl: true, rotC: [r.int(-2, 2), r.int(-2, 2)] });
      const [x, y] = letPick(r);
      const I1P = T1.apply(P), I1Q = T1.apply(Q), I2P = T2.apply(I1P), I2Q = T2.apply(I1Q);
      return { q: T(`Points $${x} = ${pt(P)}$ and $${y} = ${pt(Q)}$ are mapped to $${x}' = ${pt(I1P)}$ and $${y}' = ${pt(I1Q)}$ by transformation $T_1$, and then to $${x}'' = ${pt(I2P)}$ and $${y}'' = ${pt(I2Q)}$ by transformation $T_2$. Give the full description (type and all parameters) of $T_1$ and of $T_2$.`, `Titik $${x} = ${pt(P)}$ dan $${y} = ${pt(Q)}$ dipetakan kepada $${x}' = ${pt(I1P)}$ dan $${y}' = ${pt(I1Q)}$ oleh transformasi $T_1$, dan kemudian kepada $${x}'' = ${pt(I2P)}$ dan $${y}'' = ${pt(I2Q)}$ oleh transformasi $T_2$. Berikan penerangan penuh (jenis dan semua parameter) bagi $T_1$ dan bagi $T_2$.`), a: T(`$T_1$: ${T1.en}. $T_2$: ${T2.en}.`, `$T_1$: ${T1.ms}. $T_2$: ${T2.ms}.`), sp: 'l' };
    },
    (r) => {
      const a = r.int(-3, 3), b = retry(() => { const v = r.int(-3, 3); need(v !== a); return v; });
      const P = [r.nz(-4, 4), r.nz(-4, 4)];
      const T1 = mkReflV(a), T2 = mkReflH(b);
      const I1 = T1.apply(P), I2 = T2.apply(I1);
      const check = rot0(P, [a, b], 180);
      return { q: T(`$P = ${pt(P)}$ is reflected in the line $x = ${a}$, and the image is then reflected in the line $y = ${b}$. Find the final image. Show that this combined transformation is equivalent to a single rotation, and find its centre and angle.`, `$P = ${pt(P)}$ dipantulkan pada garis $x = ${a}$, dan imejnya kemudian dipantulkan pada garis $y = ${b}$. Cari imej akhir. Tunjukkan bahawa gabungan transformasi ini setara dengan satu putaran tunggal, dan cari pusat serta sudutnya.`), a: T(`$${pt(I2)}$; equivalent to a rotation of $180^\\circ$ about $${pt([a, b])}$ (the intersection of the two mirror lines). Check: $${pt(I2)} = ${pt(check)}$.`, `$${pt(I2)}$; setara dengan putaran $180^\\circ$ pada $${pt([a, b])}$ (persilangan kedua-dua garis cermin). Semak: $${pt(I2)} = ${pt(check)}$.`), sp: 'l' };
    },
    (r) => {
      const C1 = [r.int(-2, 2), r.int(-2, 2)], C2 = retry(() => { const c = [r.int(-2, 2), r.int(-2, 2)]; need(c[0] !== C1[0] || c[1] !== C1[1]); return c; });
      const P = [r.nz(-3, 3), r.nz(-3, 3)];
      const T1 = mkRot(180, 'cw', C1), T2 = mkRot(180, 'cw', C2);
      const I1 = T1.apply(P), I2 = T2.apply(I1);
      const v = [2 * (C2[0] - C1[0]), 2 * (C2[1] - C1[1])];
      return { q: T(`A $180^\\circ$ rotation about $${pt(C1)}$ is followed by a $180^\\circ$ rotation about $${pt(C2)}$. Find the image of $P = ${pt(P)}$ under the combination. Show that this combination is equivalent to a single translation (not a rotation), and state the vector.`, `Satu putaran $180^\\circ$ pada $${pt(C1)}$ diikuti oleh satu putaran $180^\\circ$ pada $${pt(C2)}$. Cari imej bagi $P = ${pt(P)}$ di bawah gabungan ini. Tunjukkan bahawa gabungan ini setara dengan satu translasi tunggal (bukan putaran), dan nyatakan vektornya.`), a: T(`$${pt(I2)}$; equivalent to translation $\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix} = 2(C_2 - C_1)$. It has no invariant point (unless $C_1 = C_2$), so it cannot be a rotation.`, `$${pt(I2)}$; setara dengan translasi $\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix} = 2(C_2 - C_1)$. Ia tiada titik tak varian (melainkan $C_1 = C_2$), jadi ia tidak boleh menjadi satu putaran.`), sp: 'l' };
    },
    (r) => {
      const a = r.int(-3, 3), b = retry(() => { const v = r.int(-3, 3); need(v !== a); return v; });
      const vert = r.chance();
      const P = [r.nz(-3, 3), r.nz(-3, 3)], Q = retry(() => { const q_ = [r.nz(-3, 3), r.nz(-3, 3)]; need(q_[0] !== P[0] || q_[1] !== P[1]); return q_; });
      const T1 = vert ? mkReflV(a) : mkReflH(a), T2 = vert ? mkReflV(b) : mkReflH(b);
      const gap = 2 * (b - a);
      const I2P = T2.apply(T1.apply(P)), I2Q = T2.apply(T1.apply(Q));
      const predP = [P[0] + (vert ? gap : 0), P[1] + (vert ? 0 : gap)], predQ = [Q[0] + (vert ? gap : 0), Q[1] + (vert ? 0 : gap)];
      return { q: T(`Reflecting in the line $${vert ? 'x' : 'y'} = ${a}$ then in the line $${vert ? 'x' : 'y'} = ${b}$ is claimed to be equivalent to the translation $\\begin{pmatrix} ${vert ? gap : 0} \\\\ ${vert ? 0 : gap} \\end{pmatrix}$. Verify this claim using two different points $P = ${pt(P)}$ and $Q = ${pt(Q)}$.`, `Memantul pada garis $${vert ? 'x' : 'y'} = ${a}$ kemudian pada garis $${vert ? 'x' : 'y'} = ${b}$ didakwa setara dengan translasi $\\begin{pmatrix} ${vert ? gap : 0} \\\\ ${vert ? 0 : gap} \\end{pmatrix}$. Sahkan dakwaan ini menggunakan dua titik berbeza $P = ${pt(P)}$ dan $Q = ${pt(Q)}$.`), a: T(`Combined map of $P$: $${pt(I2P)}$, matches the translation's $${pt(predP)}$. Combined map of $Q$: $${pt(I2Q)}$, matches $${pt(predQ)}$. Both agree, confirming the claim.`, `Peta gabungan bagi $P$: $${pt(I2P)}$, sepadan dengan $${pt(predP)}$ daripada translasi. Peta gabungan bagi $Q$: $${pt(I2Q)}$, sepadan dengan $${pt(predQ)}$. Kedua-duanya sepadan, mengesahkan dakwaan itu.`), sp: 'm' };
    },
    (r) => {
      const P = [r.nz(-3, 3), r.nz(-3, 3)], Q = [r.nz(-3, 3), r.nz(-3, 3)], R = [r.nz(-3, 3), r.nz(-3, 3)];
      need(!(P[0] === Q[0] && P[1] === Q[1]) && !(Q[0] === R[0] && Q[1] === R[1]) && !(P[0] === R[0] && P[1] === R[1]));
      const T1 = randTr(r, { lim: 3, rotC: [0, 0] }), T2 = randTr(r, { lim: 3, rotC: [0, 0] });
      const [x, y, z] = shapeNames3(r);
      const I1 = [P, Q, R].map(T1.apply), I2 = I1.map(T2.apply);
      const AB = T2.apply(T1.apply(P)), BA = T1.apply(T2.apply(P));
      const commuteHint = AB[0] === BA[0] && AB[1] === BA[1];
      return { q: T(`Triangle $${x}${y}${z}$ with $${x} = ${pt(P)}$, $${y} = ${pt(Q)}$, $${z} = ${pt(R)}$ is mapped by $T_1$: ${T1.en}, then by $T_2$: ${T2.en}. (a) Find the coordinates of the final image. (b) State one invariant point of $T_1$, if any. (c) Using the vertex $${x}$, check whether $T_1$ and $T_2$ commute.`, `Segi tiga $${x}${y}${z}$ dengan $${x} = ${pt(P)}$, $${y} = ${pt(Q)}$, $${z} = ${pt(R)}$ dipetakan oleh $T_1$: ${T1.ms}, kemudian oleh $T_2$: ${T2.ms}. (a) Cari koordinat imej akhir. (b) Nyatakan satu titik tak varian $T_1$, jika ada. (c) Menggunakan bucu $${x}$, semak sama ada $T_1$ dan $T_2$ bertukar tertib.`), a: T(`(a) $${x}''${pt(I2[0])}, ${y}''${pt(I2[1])}, ${z}''${pt(I2[2])}$ (b) ${invPts(T1).en} (c) $T_1T_2(${x}) = ${pt(AB)}$, $T_2T_1(${x}) = ${pt(BA)}$: ${commuteHint ? 'they agree for this vertex (check other vertices before concluding in general)' : 'they do not agree, so $T_1$ and $T_2$ do not commute'}`, `(a) $${x}''${pt(I2[0])}, ${y}''${pt(I2[1])}, ${z}''${pt(I2[2])}$ (b) ${invPts(T1).ms} (c) $T_1T_2(${x}) = ${pt(AB)}$, $T_2T_1(${x}) = ${pt(BA)}$: ${commuteHint ? 'ia sepadan bagi bucu ini (semak bucu lain sebelum membuat kesimpulan secara am)' : 'ia tidak sepadan, jadi $T_1$ dan $T_2$ tidak bertukar tertib'}`), sp: 'xl' };
    },
    (r) => {
      const P = [r.nz(-3, 3), r.nz(-3, 3)], ctx = r.pick(CTX53);
      const T1 = randTr(r, { lim: 3, line: true, rotC: [r.int(-2, 2), r.int(-2, 2)] }), T2 = randTr(r, { lim: 3, line: true, rotC: [r.int(-2, 2), r.int(-2, 2)] });
      const I1 = T1.apply(P), I2 = T2.apply(I1);
      const AB = T2.apply(T1.apply(P)), BA = T1.apply(T2.apply(P));
      const same = AB[0] === BA[0] && AB[1] === BA[1];
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} starts at $P = ${pt(P)}$. It undergoes $T_1$: ${T1.en}, then $T_2$: ${T2.en}. (a) Find its final position. (b) State one invariant point of $T_2$, if any. (c) If the two steps had been applied in the opposite order ($T_2$ then $T_1$), would the final position be the same? Justify using calculation.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} bermula di $P = ${pt(P)}$. Ia mengalami $T_1$: ${T1.ms}, kemudian $T_2$: ${T2.ms}. (a) Cari kedudukan akhirnya. (b) Nyatakan satu titik tak varian $T_2$, jika ada. (c) Jika kedua-dua langkah itu dikenakan dalam tertib bertentangan ($T_2$ kemudian $T_1$), adakah kedudukan akhir akan sama? Wajarkan dengan pengiraan.`), a: T(`(a) $${pt(I2)}$ (b) ${invPts(T2).en} (c) $T_2$ then $T_1$ gives $${pt(BA)}$, ${same ? 'the same as (a) for this point' : 'different from (a), so the order matters here'}.`, `(a) $${pt(I2)}$ (b) ${invPts(T2).ms} (c) $T_2$ kemudian $T_1$ memberi $${pt(BA)}$, ${same ? 'sama seperti (a) bagi titik ini' : 'berbeza daripada (a), jadi tertib adalah penting di sini'}.`), sp: 'l' };
    },
    (r) => {
      const a = r.int(-3, 3), b = retry(() => { const v = r.int(-3, 3); need(v !== a); return v; });
      const vert = r.chance(), ctx = r.pick(CTX53);
      const P = [r.nz(-3, 3), r.nz(-3, 3)];
      const T1 = vert ? mkReflV(a) : mkReflH(a), T2 = vert ? mkReflV(b) : mkReflH(b);
      const I2 = T2.apply(T1.apply(P));
      const dist = Math.abs(b - a);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} at $P = ${pt(P)}$ is reflected in the line $${vert ? 'x' : 'y'} = ${a}$, then in the parallel line $${vert ? 'x' : 'y'} = ${b}$, which is $${dist}$ units away. Find the final position by using the single-translation rule for two reflections in parallel lines, then check your answer by computing both reflections separately.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} di $P = ${pt(P)}$ dipantulkan pada garis $${vert ? 'x' : 'y'} = ${a}$, kemudian pada garis selari $${vert ? 'x' : 'y'} = ${b}$, yang berjarak $${dist}$ unit. Cari kedudukan akhir dengan menggunakan peraturan translasi tunggal bagi dua pantulan pada garis selari, kemudian semak jawapan anda dengan mengira kedua-dua pantulan secara berasingan.`), a: T(`Rule: translation of $2 \\times ${dist} = ${2 * dist}$ units, direction from the first line towards the second $\\Rightarrow$ $${pt(I2)}$. This matches the direct computation.`, `Peraturan: translasi $2 \\times ${dist} = ${2 * dist}$ unit, arah daripada garis pertama ke garis kedua $\\Rightarrow$ $${pt(I2)}$. Ini sepadan dengan pengiraan terus.`), sp: 'm' };
    },
  ];

  SPM.extend('F5-5.3', { e: g53e, m: g53m, a: g53a });

  /* =============================================================== 5.4 Tessellation */
  const POLYN = [3, 4, 5, 6, 8, 9, 10, 12];
  const POLYNM = { 3: T('equilateral triangle', 'segi tiga sama sisi'), 4: T('square', 'segi empat sama'), 5: T('regular pentagon', 'pentagon sekata'), 6: T('regular hexagon', 'heksagon sekata'), 8: T('regular octagon', 'oktagon sekata'), 9: T('regular nonagon', 'nonagon sekata'), 10: T('regular decagon', 'dekagon sekata'), 12: T('regular dodecagon', 'dodekagon sekata') };
  const intAngle = (poly) => 180 - 360 / poly;
  const VALID_COMBOS = [];
  (function seek(start, combo, sum) {
    if (combo.length >= 2 && sum === 360) VALID_COMBOS.push(combo.slice());
    if (combo.length >= 6 || sum >= 360) return;
    for (let i = start; i < POLYN.length; i++) {
      const a = intAngle(POLYN[i]);
      if (sum + a <= 360) {
        combo.push(POLYN[i]);
        seek(i, combo, sum + a);
        combo.pop();
      }
    }
  })(0, [], 0);
  const countBy = (combo) => {
    const m = {};
    for (const p of combo) m[p] = (m[p] || 0) + 1;
    return m;
  };
  const comboListTxt = (combo, lang) => {
    const m = countBy(combo);
    return Object.keys(m).map((k) => `${m[k]} × ${POLYNM[k][lang]}${m[k] > 1 ? (lang === 'en' ? 's' : '') : ''}`).join(', ');
  };
  const comboAngles = (combo) => combo.map((p) => n(intAngle(p))).join('^\\circ + ') + '^\\circ';
  const randInvalidCombo = (r) => retry(() => {
    const len = r.int(2, 4);
    const combo = Array.from({ length: len }, () => r.pick(POLYN));
    const sum = combo.reduce((s, p) => s + intAngle(p), 0);
    need(sum !== 360);
    return combo;
  });
  const TILECTX = [
    T('a bathroom floor', 'lantai bilik air'), T('a kitchen backsplash', 'dinding dapur'), T('a courtyard', 'sebuah halaman'),
    T('a patchwork quilt', 'sebuah selimut patchwork'), T('a mosaic wall panel', 'sebuah panel dinding mozek'), T('a paved plaza', 'sebuah plaza berturap'),
  ];
  const TESS_STEPS = [
    T('Choose a fundamental (basic) tile shape', 'Pilih satu bentuk jubin asas (fundamental)'),
    T('Check that copies of the tile can meet at a point with interior angles summing to $360^\\circ$', 'Semak bahawa salinan jubin boleh bertemu pada satu titik dengan sudut pedalaman berjumlah $360^\\circ$'),
    T('Use translations, rotations and/or reflections to place repeated copies of the tile', 'Guna translasi, putaran dan/atau pantulan untuk meletakkan salinan berulang jubin itu'),
    T('Check that every shared edge between neighbouring tiles matches exactly, with no gaps or overlaps', 'Semak bahawa setiap tepi kongsi antara jubin bersebelahan sepadan tepat, tanpa jurang atau pertindihan'),
  ];

  const g54e = [
    (r) => {
      const p = r.pick(POLYN);
      const a = intAngle(p);
      const ok = Number.isInteger(360 / a);
      const ctx = r.pick(TILECTX);
      return { q: T(`Can identical ${POLYNM[p].en}s alone tessellate ${ctx.en}? Use the interior angle to explain.`, `Bolehkah ${POLYNM[p].ms} yang serupa sahaja bertesselasi pada ${ctx.ms}? Gunakan sudut pedalaman untuk menerangkan.`), a: ok ? T(`Yes: interior angle $${n(a)}^\\circ$, and $360 \\div ${n(a)} = ${360 / a}$, a whole number, so ${360 / a} tiles fit exactly round a point.`, `Ya: sudut pedalaman $${n(a)}^\\circ$, dan $360 \\div ${n(a)} = ${360 / a}$, nombor bulat, jadi ${360 / a} jubin muat tepat di sekeliling satu titik.`) : T(`No: interior angle $${n(a)}^\\circ$, and $360 \\div ${n(a)} = ${n(round(360 / a, 2))}$ is not a whole number, so gaps or overlaps remain.`, `Tidak: sudut pedalaman $${n(a)}^\\circ$, dan $360 \\div ${n(a)} = ${n(round(360 / a, 2))}$ bukan nombor bulat, jadi jurang atau pertindihan tetap ada.`), sp: 's' };
    },
    (r) => {
      const valid = r.chance(0.6);
      const combo = valid ? r.pick(VALID_COMBOS) : randInvalidCombo(r);
      const sum = combo.reduce((s, p) => s + intAngle(p), 0);
      return { q: T(`At a point, the following shapes are placed edge to edge: ${comboListTxt(combo, 'en')}. Do their interior angles add up to $360^\\circ$, so that they fit exactly with no gaps or overlaps?`, `Pada satu titik, bentuk berikut diletakkan bertemu tepi: ${comboListTxt(combo, 'ms')}. Adakah sudut pedalamannya berjumlah $360^\\circ$, supaya ia muat tepat tanpa jurang atau pertindihan?`), a: T(`$${comboAngles(combo)} = ${n(sum)}^\\circ$, ${sum === 360 ? 'which is exactly $360^\\circ$: yes, they fit.' : `which is ${sum < 360 ? 'less than' : 'more than'} $360^\\circ$: no, ${sum < 360 ? 'a gap' : 'an overlap'} remains.`}`, `$${comboAngles(combo)} = ${n(sum)}^\\circ$, ${sum === 360 ? 'iaitu tepat $360^\\circ$: ya, ia muat.' : `iaitu ${sum < 360 ? 'kurang daripada' : 'lebih daripada'} $360^\\circ$: tidak, ${sum < 360 ? 'jurang' : 'pertindihan'} tetap ada.`}`), sp: 's' };
    },
    (r) => {
      const st = r.pick([
        [T('A tessellation must cover the plane with no gaps and no overlaps.', 'Satu tesselasi mesti melitupi satah tanpa jurang dan tanpa pertindihan.'), true],
        [T('A tessellation is built by repeating a fundamental (basic) tile using translations, rotations and/or reflections.', 'Satu tesselasi dibina dengan mengulang satu jubin asas (fundamental) menggunakan translasi, putaran dan/atau pantulan.'), true],
        [T('Enlargement can be used to generate the repeated copies in a tessellation.', 'Pembesaran boleh digunakan untuk menjana salinan berulang dalam satu tesselasi.'), false],
        [T('A regular pentagon on its own can tessellate the plane.', 'Sebuah pentagon sekata dengan sendirinya boleh bertesselasi pada satah.'), false],
        [T('A regular hexagon on its own can tessellate the plane.', 'Sebuah heksagon sekata dengan sendirinya boleh bertesselasi pada satah.'), true],
        [T('Any triangle, even a scalene one, can be used to tessellate the plane.', 'Sebarang segi tiga, walaupun segi tiga sisi tak sama, boleh digunakan untuk bertesselasi pada satah.'), true],
        [T('If shapes meeting at a point leave a small gap, the pattern is still considered a valid tessellation.', 'Jika bentuk yang bertemu pada satu titik meninggalkan jurang kecil, corak itu masih dianggap tesselasi yang sah.'), false],
      ]);
      return { q: T(`True or false? "${st[0].en}"`, `Benar atau palsu? "${st[0].ms}"`), a: st[1] ? T('True', 'Benar') : T('False', 'Palsu'), sp: 'xs' };
    },
    (r) => {
      const area = r.pick([4, 6, 8, 9, 12]), k = r.int(6, 15), ctx = r.pick(TILECTX);
      return { q: T(`A tessellation is used to cover ${ctx.en} with a repeated tile of area $${area}$ cm$^2$, with no gaps or overlaps. If $${k}$ tiles are used, find the total area covered.`, `Satu tesselasi digunakan untuk melitupi ${ctx.ms} dengan jubin berulang berluas $${area}$ cm$^2$, tanpa jurang atau pertindihan. Jika $${k}$ jubin digunakan, cari jumlah luas yang dilitupi.`), a: T(`$${area * k}$ cm$^2$`), sp: 'xs' };
    },
    (r) => {
      const canTile = [3, 4, 6]; // the only regular polygons that tessellate the plane alone
      const cannotPool = [5, 8, 9, 10, 12];
      const badN = r.pick(cannotPool);
      const shapes = r.shuffle([...canTile, badN]);
      const letters = 'ABCD';
      const badIdx = shapes.indexOf(badN);
      const list = shapes.map((s, i) => `(${letters[i]}) ${POLYNM[s].en}`).join(', ');
      const listms = shapes.map((s, i) => `(${letters[i]}) ${POLYNM[s].ms}`).join(', ');
      return { q: T(`Which one of the following regular shapes CANNOT tessellate the plane on its own? ${list}`, `Bentuk sekata manakah antara berikut TIDAK BOLEH bertesselasi pada satah dengan sendirinya? ${listms}`), a: T(`(${letters[badIdx]}) ${POLYNM[badN].en}`, `(${letters[badIdx]}) ${POLYNM[badN].ms}`), sp: 's' };
    },
    (r) => {
      const item = r.pick([
        { pat: T('a row of identical bricks, each shifted to the right of the previous one by the same distance', 'satu baris bata yang serupa, setiap satu dianjak ke kanan daripada yang sebelumnya dengan jarak yang sama'), ans: T('translation', 'translasi') },
        { pat: T('a strip of identical footprints, each a mirror image of the one before it, alternating left and right', 'satu jalur tapak kaki yang serupa, setiap satu imej cermin bagi yang sebelumnya, berselang-seli kiri dan kanan'), ans: T('reflection', 'pantulan') },
        { pat: T('a pinwheel pattern where each identical blade is turned by the same angle about the centre', 'satu corak kincir angin di mana setiap bilah yang serupa diputar dengan sudut yang sama pada pusat'), ans: T('rotation', 'putaran') },
      ]);
      return { q: T(`In ${item.pat.en}, which single isometric transformation relates each tile to the next?`, `Dalam ${item.pat.ms}, transformasi isometri tunggal manakah yang mengaitkan setiap jubin dengan yang seterusnya?`), a: item.ans, sp: 's' };
    },
  ];
  const g54m = [
    (r) => {
      const combo = r.pick(VALID_COMBOS.filter((c) => c.length >= 2 && c.length <= 4));
      const m2 = countBy(combo);
      const keys = Object.keys(m2);
      return { q: T(`At a single point, regular polygons meet edge to edge with no gaps or overlaps: ${comboListTxt(combo, 'en')}. Verify this using the interior angles, and state how many different types of regular polygon are used.`, `Pada satu titik, poligon sekata bertemu bertepi tanpa jurang atau pertindihan: ${comboListTxt(combo, 'ms')}. Sahkan ini menggunakan sudut pedalaman, dan nyatakan berapa jenis poligon sekata yang berbeza digunakan.`), a: T(`$${comboAngles(combo)} = 360^\\circ$, confirmed; ${keys.length} type${keys.length > 1 ? 's' : ''} of polygon.`, `$${comboAngles(combo)} = 360^\\circ$, disahkan; ${keys.length} jenis poligon.`), sp: 's' };
    },
    (r) => {
      const knownN = r.pick([4, 5, 6]), count = r.int(1, 3);
      const knownSum = count * intAngle(knownN);
      const remain = 360 - knownSum;
      need(remain > 0 && remain < 180);
      const targetN = 360 / (180 - remain);
      need(Number.isInteger(targetN) && POLYN.includes(targetN));
      return { q: T(`At a point, $${count}$ ${POLYNM[knownN].en}${count > 1 ? 's' : ''} meet together with one more regular polygon, with no gaps or overlaps. Find the number of sides of the missing regular polygon.`, `Pada satu titik, $${count}$ ${POLYNM[knownN].ms} bertemu bersama satu lagi poligon sekata, tanpa jurang atau pertindihan. Cari bilangan sisi poligon sekata yang hilang itu.`), a: T(`Remaining angle $= 360 - ${count} \\times ${n(intAngle(knownN))} = ${n(remain)}^\\circ$. Interior angle $${n(remain)}^\\circ = 180 - \\dfrac{360}{n} \\Rightarrow n = ${targetN}$ (${POLYNM[targetN].en}).`, `Sudut yang berbaki $= 360 - ${count} \\times ${n(intAngle(knownN))} = ${n(remain)}^\\circ$. Sudut pedalaman $${n(remain)}^\\circ = 180 - \\dfrac{360}{n} \\Rightarrow n = ${targetN}$ (${POLYNM[targetN].ms}).`), sp: 'm' };
    },
    (r) => {
      const v = [r.nz(2, 5), r.nz(-2, 5)], ctx = r.pick(TILECTX);
      return { q: T(`In a tessellation covering ${ctx.en}, each square tile is placed so that its centre is obtained from the previous tile's centre by adding the vector $\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix}$ (in cm). Describe fully the single isometric transformation that maps one tile to the next.`, `Dalam satu tesselasi yang melitupi ${ctx.ms}, setiap jubin segi empat sama diletakkan supaya pusatnya diperoleh daripada pusat jubin sebelumnya dengan menambah vektor $\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix}$ (dalam cm). Terangkan sepenuhnya transformasi isometri tunggal yang memetakan satu jubin kepada yang seterusnya.`), a: T(`Translation by $\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix}$ cm`, `Translasi oleh $\\begin{pmatrix} ${v[0]} \\\\ ${v[1]} \\end{pmatrix}$ cm`), sp: 's' };
    },
    (r) => {
      const L = 'ABCD';
      const order = r.shuffle(range(0, 3));
      const shown = order.map((o, i) => `(${L[i]}) ${TESS_STEPS[o].en}`).join('; ');
      const shownms = order.map((o, i) => `(${L[i]}) ${TESS_STEPS[o].ms}`).join('; ');
      return { q: T(`The steps for constructing a tessellation are listed in the wrong order: ${shown}. Write the letters in the correct order.`, `Langkah-langkah untuk membina satu tesselasi disenaraikan dalam susunan yang salah: ${shownms}. Tulis huruf-huruf itu mengikut susunan yang betul.`), a: T(range(0, 3).map((k) => L[order.indexOf(k)]).join(' → ')), sp: 'm' };
    },
    (r) => {
      const combo = randInvalidCombo(r);
      const sum = combo.reduce((s, p) => s + intAngle(p), 0);
      const gap = 360 - sum;
      return { q: T(`A design places the shapes ${comboListTxt(combo, 'en')} edge to edge around a point. Show that this does NOT form a valid tessellation at that point, and find the size of the gap or overlap.`, `Satu reka bentuk meletakkan bentuk ${comboListTxt(combo, 'ms')} bertemu tepi di sekeliling satu titik. Tunjukkan bahawa ini TIDAK membentuk tesselasi yang sah pada titik itu, dan cari saiz jurang atau pertindihan itu.`), a: T(`$${comboAngles(combo)} = ${n(sum)}^\\circ \\ne 360^\\circ$; ${gap > 0 ? `gap of $${n(gap)}^\\circ$` : `overlap of $${n(-gap)}^\\circ$`}`, `$${comboAngles(combo)} = ${n(sum)}^\\circ \\ne 360^\\circ$; ${gap > 0 ? `jurang $${n(gap)}^\\circ$` : `pertindihan $${n(-gap)}^\\circ$`}`), sp: 's' };
    },
    (r) => {
      const rate = r.pick([2, 3, 4, 5]), count = r.int(20, 60), ctx = r.pick(TILECTX);
      return { q: T(`Tiles for ${ctx.en} cost RM${rate} each. The tessellation requires $${count}$ identical tiles with no gaps or overlaps. Find the total cost.`, `Jubin untuk ${ctx.ms} berharga RM${rate} setiap satu. Tesselasi itu memerlukan $${count}$ jubin yang serupa tanpa jurang atau pertindihan. Cari jumlah kos.`), a: T(`${rm(rate * count)}`), sp: 'xs' };
    },
    (r) => ({ q: T('Explain why enlargement is not used to generate the repeated tiles of a tessellation, even though it is a valid transformation.', 'Terangkan mengapa pembesaran tidak digunakan untuk menjana jubin berulang bagi satu tesselasi, walaupun ia satu transformasi yang sah.'), a: T('A tessellation needs identical (congruent) copies of the tile; enlargement changes the size of the shape (unless $k = 1$), so the copies would no longer be congruent to the original tile and could not tile consistently with it.', 'Satu tesselasi memerlukan salinan yang serupa (kongruen) bagi jubin itu; pembesaran mengubah saiz bentuk (melainkan $k = 1$), jadi salinan itu tidak lagi kongruen dengan jubin asal dan tidak dapat bertesselasi secara konsisten dengannya.'), sp: 's' }),
  ];
  const g54a = [
    (r) => {
      const shift = [r.nz(1, 4), r.nz(-3, 4)], ctx = r.pick(TILECTX);
      return { q: T(`For ${ctx.en}, a square tile is modified by cutting a bump out of the top edge and adding the identical bump (translated) onto the bottom edge, using the translation $\\begin{pmatrix} ${shift[0]} \\\\ ${shift[1]} \\end{pmatrix}$; the left and right edges are left as straight lines. Explain why copies of this modified tile, arranged in the same grid pattern as the original squares, still tessellate the plane with no gaps or overlaps.`, `Untuk ${ctx.ms}, sebuah jubin segi empat sama diubah suai dengan memotong satu bonjolan daripada tepi atas dan menambah bonjolan yang sama (ditranslasikan) pada tepi bawah, menggunakan translasi $\\begin{pmatrix} ${shift[0]} \\\\ ${shift[1]} \\end{pmatrix}$; tepi kiri dan kanan dibiarkan sebagai garis lurus. Terangkan mengapa salinan jubin yang diubah suai ini, disusun dalam corak grid yang sama seperti segi empat sama asal, masih bertesselasi pada satah tanpa jurang atau pertindihan.`), a: T('Whatever was removed from the top edge is exactly the shape added to the bottom edge (same shape, just translated), so where one tile\'s modified bottom edge meets the next tile\'s modified top edge, the bump on one exactly fills the notch on the other — the total area and edge shapes are preserved, so the copies still fit together exactly.', 'Apa yang dikeluarkan daripada tepi atas adalah bentuk yang tepat sama dengan yang ditambah pada tepi bawah (bentuk sama, hanya ditranslasikan), jadi apabila tepi bawah satu jubin yang diubah suai bertemu dengan tepi atas jubin seterusnya, bonjolan pada satu tepat mengisi takuk pada yang lain — jumlah luas dan bentuk tepi dikekalkan, jadi salinan itu masih bercantum tepat.'), sp: 'm' };
    },
    (r) => {
      const combo = r.pick(VALID_COMBOS.filter((c) => c.length >= 3)), ctx = r.pick(TILECTX);
      return { q: T(`For a design on ${ctx.en}, investigate whether the regular polygons ${comboListTxt(combo, 'en')} can be arranged edge to edge around a single point with no gaps or overlaps. Show your working with the interior angles, and suggest one isometric transformation that could relate one copy of the repeated arrangement to a neighbouring copy.`, `Bagi satu reka bentuk pada ${ctx.ms}, siasat sama ada poligon sekata ${comboListTxt(combo, 'ms')} boleh disusun bertemu tepi di sekeliling satu titik tanpa jurang atau pertindihan. Tunjukkan kerja anda dengan sudut pedalaman, dan cadangkan satu transformasi isometri yang boleh mengaitkan satu salinan susunan berulang itu dengan salinan bersebelahan.`), a: T(`$${comboAngles(combo)} = 360^\\circ$, so yes, they fit exactly around the point. A translation (or in some layouts a rotation about a shared vertex) can map the whole arrangement to its neighbouring copy.`, `$${comboAngles(combo)} = 360^\\circ$, jadi ya, ia muat tepat di sekeliling titik itu. Satu translasi (atau dalam sesetengah susunan, putaran pada bucu kongsi) boleh memetakan keseluruhan susunan itu kepada salinan bersebelahannya.`), sp: 'l' };
    },
    (r) => {
      const c1 = r.pick(VALID_COMBOS.filter((c) => c.length >= 2 && c.length <= 4)), c2 = retry(() => { const c = r.pick(VALID_COMBOS.filter((cc) => cc.length >= 2 && cc.length <= 4)); need(c.join() !== c1.join()); return c; });
      const n1 = Object.keys(countBy(c1)).length, n2 = Object.keys(countBy(c2)).length;
      return { q: T(`Two valid vertex arrangements are proposed: Arrangement $P$: ${comboListTxt(c1, 'en')}; Arrangement $Q$: ${comboListTxt(c2, 'en')}. Verify that both fit exactly around a point, then state which arrangement uses more different types of regular polygon.`, `Dua susunan bucu yang sah dicadangkan: Susunan $P$: ${comboListTxt(c1, 'ms')}; Susunan $Q$: ${comboListTxt(c2, 'ms')}. Sahkan bahawa kedua-duanya muat tepat di sekeliling satu titik, kemudian nyatakan susunan yang menggunakan lebih banyak jenis poligon sekata yang berbeza.`), a: T(`$P$: $${comboAngles(c1)} = 360^\\circ$ ✓ ($${n1}$ types). $Q$: $${comboAngles(c2)} = 360^\\circ$ ✓ ($${n2}$ types). ${n1 === n2 ? 'Both use the same number of types.' : n1 > n2 ? 'Arrangement $P$ uses more types.' : 'Arrangement $Q$ uses more types.'}`, `$P$: $${comboAngles(c1)} = 360^\\circ$ ✓ ($${n1}$ jenis). $Q$: $${comboAngles(c2)} = 360^\\circ$ ✓ ($${n2}$ jenis). ${n1 === n2 ? 'Kedua-duanya menggunakan bilangan jenis yang sama.' : n1 > n2 ? 'Susunan $P$ menggunakan lebih banyak jenis.' : 'Susunan $Q$ menggunakan lebih banyak jenis.'}`), sp: 'm' };
    },
    (r) => {
      const knownN = r.pick([3, 4, 6]), count = r.int(2, 3);
      const known2N = r.pick([3, 4, 5, 6].filter((v) => v !== knownN)), count2 = r.int(1, 2);
      const knownSum = count * intAngle(knownN) + count2 * intAngle(known2N);
      const remain = 360 - knownSum;
      need(remain > 0 && remain < 180);
      const targetN = 360 / (180 - remain);
      need(Number.isInteger(targetN) && POLYN.includes(targetN));
      return { q: T(`At a point, $${count}$ ${POLYNM[knownN].en}${count > 1 ? 's' : ''} and $${count2}$ ${POLYNM[known2N].en}${count2 > 1 ? 's' : ''} meet together with exactly one more regular polygon, with no gaps or overlaps. Find the number of sides of the missing regular polygon, showing your algebraic working.`, `Pada satu titik, $${count}$ ${POLYNM[knownN].ms} dan $${count2}$ ${POLYNM[known2N].ms} bertemu bersama tepat satu lagi poligon sekata, tanpa jurang atau pertindihan. Cari bilangan sisi poligon sekata yang hilang itu, tunjukkan kerja algebra anda.`), a: T(`Known angle sum $= ${count} \\times ${n(intAngle(knownN))} + ${count2} \\times ${n(intAngle(known2N))} = ${n(knownSum)}^\\circ$. Remaining $= 360 - ${n(knownSum)} = ${n(remain)}^\\circ = 180 - \\dfrac{360}{n} \\Rightarrow n = ${targetN}$ (${POLYNM[targetN].en}).`, `Jumlah sudut yang diketahui $= ${count} \\times ${n(intAngle(knownN))} + ${count2} \\times ${n(intAngle(known2N))} = ${n(knownSum)}^\\circ$. Baki $= 360 - ${n(knownSum)} = ${n(remain)}^\\circ = 180 - \\dfrac{360}{n} \\Rightarrow n = ${targetN}$ (${POLYNM[targetN].ms}).`), sp: 'l' };
    },
    (r) => {
      const ang = r.pick([[50, 60, 70], [40, 65, 75], [55, 55, 70], [45, 65, 70], [80, 50, 50]]);
      need(ang[0] + ang[1] + ang[2] === 180);
      return { q: T(`A (generally non-equilateral) triangle has angles $${ang[0]}^\\circ$, $${ang[1]}^\\circ$ and $${ang[2]}^\\circ$. By placing six copies of the triangle (using $180^\\circ$ rotations about edge midpoints) so that all three angles of the triangle meet twice each around a single point, show that this triangle tessellates the plane.`, `Sebuah segi tiga (secara amnya bukan sama sisi) mempunyai sudut $${ang[0]}^\\circ$, $${ang[1]}^\\circ$ dan $${ang[2]}^\\circ$. Dengan meletakkan enam salinan segi tiga itu (menggunakan putaran $180^\\circ$ pada titik tengah tepi) supaya ketiga-tiga sudut segi tiga itu bertemu dua kali setiap satu di sekeliling satu titik, tunjukkan bahawa segi tiga ini bertesselasi pada satah.`), a: T(`$2(${ang[0]}^\\circ + ${ang[1]}^\\circ + ${ang[2]}^\\circ) = 2 \\times 180^\\circ = 360^\\circ$, so the six copies fit exactly around the point with no gaps or overlaps; repeating this pattern tessellates the whole plane. This works for ANY triangle, since the angle sum of a triangle is always $180^\\circ$.`, `$2(${ang[0]}^\\circ + ${ang[1]}^\\circ + ${ang[2]}^\\circ) = 2 \\times 180^\\circ = 360^\\circ$, jadi keenam-enam salinan itu muat tepat di sekeliling titik itu tanpa jurang atau pertindihan; mengulang corak ini bertesselasi pada keseluruhan satah. Ini berlaku bagi SEBARANG segi tiga, kerana hasil tambah sudut segi tiga sentiasa $180^\\circ$.`), sp: 'l' };
    },
    (r) => {
      const reflAxis = r.pick(['x', 'y']); // 'x' = vertical mirror line, 'y' = horizontal mirror line
      const parallel = r.chance(); // is the translation along the mirror line's own direction?
      const dist = r.nz(2, 4);
      const v1 = reflAxis === 'x' ? (parallel ? [0, dist] : [dist, 0]) : (parallel ? [dist, 0] : [0, dist]);
      const mirrorTxt = reflAxis === 'x' ? T('a reflection in a vertical line', 'satu pantulan pada garis mencancang') : T('a reflection in a horizontal line', 'satu pantulan pada garis mengufuk');
      const ans = parallel
        ? T(`$A$ to $C$ is ${mirrorTxt.en} followed by a translation of $\\begin{pmatrix} ${v1[0]} \\\\ ${v1[1]} \\end{pmatrix}$ along that same line's direction: this combination is a glide reflection, and cannot be simplified to a single reflection, rotation or translation — it must be described as both steps together, in that order.`, `$A$ ke $C$ ialah ${mirrorTxt.ms} diikuti translasi $\\begin{pmatrix} ${v1[0]} \\\\ ${v1[1]} \\end{pmatrix}$ sepanjang arah garis yang sama: gabungan ini ialah pantulan gelangsar, dan tidak boleh dipermudahkan kepada satu pantulan, putaran atau translasi tunggal — ia mesti diterangkan sebagai kedua-dua langkah bersama, mengikut tertib itu.`)
        : T(`$A$ to $C$ is ${mirrorTxt.en} followed by a translation of $\\begin{pmatrix} ${v1[0]} \\\\ ${v1[1]} \\end{pmatrix}$ perpendicular to that line: this combination simplifies to a single reflection in a parallel mirror line, shifted by half the translation distance ($${dist / 2}$ units) in the translation's direction.`, `$A$ ke $C$ ialah ${mirrorTxt.ms} diikuti translasi $\\begin{pmatrix} ${v1[0]} \\\\ ${v1[1]} \\end{pmatrix}$ berserenjang dengan garis itu: gabungan ini dipermudahkan kepada satu pantulan tunggal pada garis cermin selari, teranjak sebanyak separuh jarak translasi ($${dist / 2}$ unit) mengikut arah translasi itu.`);
      return { q: T(`A tessellation of a strip uses square tiles. Tile $A$ is mapped to tile $B$ (its neighbour) by ${mirrorTxt.en}, and tile $B$ is mapped to tile $C$ by a translation of $\\begin{pmatrix} ${v1[0]} \\\\ ${v1[1]} \\end{pmatrix}$. Describe fully the single combined transformation that maps tile $A$ directly to tile $C$, simplifying it if possible.`, `Satu tesselasi jalur menggunakan jubin segi empat sama. Jubin $A$ dipetakan kepada jubin $B$ (jirannya) oleh ${mirrorTxt.ms}, dan jubin $B$ dipetakan kepada jubin $C$ oleh satu translasi $\\begin{pmatrix} ${v1[0]} \\\\ ${v1[1]} \\end{pmatrix}$. Terangkan sepenuhnya transformasi gabungan tunggal yang memetakan jubin $A$ terus kepada jubin $C$, permudahkan jika boleh.`), a: ans, sp: 'l' };
    },
    (r) => ({ q: T('Outline the steps of designing an Escher-style tessellation from a square tile: modifying a pair of opposite edges and reusing that modification on the other pair, then explain why the final tile still tessellates.', 'Gariskan langkah-langkah mereka bentuk satu tesselasi gaya Escher daripada jubin segi empat sama: mengubah suai sepasang tepi bertentangan dan menggunakan semula pengubahsuaian itu pada pasangan yang satu lagi, kemudian terangkan mengapa jubin akhir masih bertesselasi.'), a: T('1 Start with a square. 2 Cut a shape out of the top edge and glue the identical piece onto the bottom edge by a translation. 3 Cut a shape out of the left edge and glue the identical piece onto the right edge by a translation. 4 The new tile still tessellates because each modification removed from one edge is exactly restored by the matching addition on the parallel edge, so neighbouring copies still interlock with no gaps or overlaps, just as the original square did.', '1 Mulakan dengan segi empat sama. 2 Potong satu bentuk daripada tepi atas dan tampalkan cebisan yang serupa pada tepi bawah melalui satu translasi. 3 Potong satu bentuk daripada tepi kiri dan tampalkan cebisan yang serupa pada tepi kanan melalui satu translasi. 4 Jubin baharu itu masih bertesselasi kerana setiap pengubahsuaian yang dikeluarkan daripada satu tepi dipulihkan tepat oleh penambahan yang sepadan pada tepi selari itu, jadi salinan bersebelahan masih bercantum tanpa jurang atau pertindihan, sama seperti segi empat sama asal.'), sp: 'l' }),
  ];
  SPM.extend('F5-5.4', { e: g54e, m: g54m, a: g54a });

  /* =============================================================== 6.1 Trigonometric ratios of any angle */
  const SIN30 = ['\\dfrac{1}{2}', '\\dfrac{\\sqrt{2}}{2}', '\\dfrac{\\sqrt{3}}{2}'], COS30 = SIN30.slice().reverse(), TAN30 = ['\\dfrac{\\sqrt{3}}{3}', '1', '\\sqrt{3}'];
  const IDX30 = { 30: 0, 45: 1, 60: 2 };
  const refAngle = (t) => (t <= 90 ? t : t <= 180 ? 180 - t : t <= 270 ? t - 180 : 360 - t);
  const quadOf = (t) => (t <= 0 || t >= 360 ? 0 : t < 90 ? 1 : t < 180 ? 2 : t < 270 ? 3 : 4);
  const QROMAN = ['', 'I', 'II', 'III', 'IV'];
  const SGN = { sin: [1, 1, -1, -1], cos: [1, -1, -1, 1], tan: [1, -1, 1, -1] };
  const QSIN = { 0: '0', 90: '1', 180: '0', 270: '-1' }, QCOS = { 0: '1', 90: '0', 180: '-1', 270: '0' }, QTAN = { 0: '0', 90: null, 180: '0', 270: null };
  const exactTex = (fn, t) => {
    const tn = ((Math.round(t) % 360) + 360) % 360;
    if (tn % 90 === 0) return (fn === 'sin' ? QSIN : fn === 'cos' ? QCOS : QTAN)[tn];
    const a = refAngle(t), q = quadOf(t);
    const table = fn === 'sin' ? SIN30 : fn === 'cos' ? COS30 : TAN30;
    if (!(a in IDX30)) return null;
    const s = SGN[fn][q - 1];
    return (s < 0 ? '-' : '') + table[IDX30[a]];
  };
  const NONQ60 = [30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330];
  const QUADRANTAL = [0, 90, 180, 270, 360];
  const ASTC = { 1: T('all (A)', 'semua (A)'), 2: T('sine only (S)', 'sinus sahaja (S)'), 3: T('tangent only (T)', 'tangen sahaja (T)'), 4: T('cosine only (C)', 'kosinus sahaja (C)') };
  const RT3s = [[5, 12, 13], [3, 4, 5], [8, 15, 17], [7, 24, 25], [9, 40, 41], [20, 21, 29]];
  const ANGCTX = [
    T('a Ferris wheel', 'sebuah kincir bulatan'), T("a clock's minute hand", 'jarum minit sebuah jam'),
    T('a rotating lawn sprinkler', 'sebuah pemercik rumput berputar'), T('a game spinner', 'sebuah pemutar permainan'),
    T('a radar antenna', 'sebuah antena radar'), T('a windmill blade', 'sebuah bilah kincir angin'),
    T("a cyclist's pedal", 'pedal basikal seorang penunggang'), T('a rotating stage platform', 'sebuah pentas berputar'),
    T('a compass needle', 'jarum kompas'), T('a robotic arm joint', 'sendi lengan robot'),
    T('a drone propeller', 'kipas dron'), T('a carousel horse', 'kuda karusel'),
  ];

  const g61e = [
    (r) => {
      const t = r.pick(NONQ60.concat([25, 100, 200, 250, 300, 330, 145, 80, 170, 190, 350]));
      const forms = [
        { en: 'State the quadrant in which ${t}^\\circ$ lies and the reference (associated acute) angle.', ms: 'Nyatakan sukuan tempat ${t}^\\circ$ berada dan sudut rujukan (sudut tirus sekutu).' },
        { en: 'Find the quadrant and the reference angle of ${t}^\\circ$.', ms: 'Cari sukuan dan sudut rujukan bagi ${t}^\\circ$.' },
        { en: 'An angle measures ${t}^\\circ$. Name its quadrant and find its reference angle.', ms: 'Satu sudut bersukat ${t}^\\circ$. Namakan sukuannya dan cari sudut rujukannya.' },
      ];
      const f = r.pick(forms);
      return { q: T(f.en.replace('{t}', String(t)), f.ms.replace('{t}', String(t))), a: T(`Quadrant ${QROMAN[quadOf(t)]}; reference angle $${refAngle(t)}^\\circ$`, `Sukuan ${QROMAN[quadOf(t)]}; sudut rujukan $${refAngle(t)}^\\circ$`), sp: 's' };
    },
    (r) => {
      const c = r.pick([['\\sin 90^\\circ', '1'], ['\\cos 180^\\circ', '-1'], ['\\tan 180^\\circ', '0'], ['\\cos 270^\\circ', '0'], ['\\sin 270^\\circ', '-1'], ['\\tan 90^\\circ', null], ['\\sin 0^\\circ', '0'], ['\\cos 0^\\circ', '1'], ['\\sin 360^\\circ', '0'], ['\\cos 360^\\circ', '1'], ['\\tan 0^\\circ', '0'], ['\\tan 270^\\circ', null], ['\\cos 90^\\circ', '0'], ['\\sin 180^\\circ', '0']]);
      return { q: T(`Write down the value of $${c[0]}$.`, `Tuliskan nilai $${c[0]}$.`), a: c[1] === null ? T('not defined', 'tidak ditakrifkan') : T(`$${c[1]}$`), sp: 'xs' };
    },
    (r) => {
      const fn = r.pick(['sin', 'cos', 'tan']), q = r.int(1, 4);
      const sgn = SGN[fn][q - 1];
      return { q: T(`Is $\\${fn}\\,\\theta$ positive or negative when $\\theta$ is in quadrant ${QROMAN[q]}?`, `Adakah $\\${fn}\\,\\theta$ positif atau negatif apabila $\\theta$ berada dalam sukuan ${QROMAN[q]}?`), a: sgn > 0 ? T('Positive', 'Positif') : T('Negative', 'Negatif'), sp: 'xs' };
    },
    (r) => {
      const q = r.int(1, 4);
      return { q: T(`Using the ASTC rule, which trigonometric ratio(s) are positive when $\\theta$ is in quadrant ${QROMAN[q]}?`, `Menggunakan peraturan ASTC, nisbah trigonometri manakah yang positif apabila $\\theta$ berada dalam sukuan ${QROMAN[q]}?`), a: ASTC[q], sp: 'xs' };
    },
    (r) => {
      const q = r.int(2, 4), ref = r.pick([30, 45, 60]);
      const t = q === 2 ? 180 - ref : q === 3 ? 180 + ref : 360 - ref;
      return { q: T(`An angle $\\theta$ in quadrant ${QROMAN[q]} has a reference angle of $${ref}^\\circ$. Find $\\theta$.`, `Satu sudut $\\theta$ dalam sukuan ${QROMAN[q]} mempunyai sudut rujukan $${ref}^\\circ$. Cari $\\theta$.`), a: T(`$${t}^\\circ$`), sp: 's' };
    },
    (r) => {
      const st = r.pick([
        [T('The reference angle is always measured from the $x$-axis to the terminal arm of $\\theta$.', 'Sudut rujukan sentiasa diukur daripada paksi-$x$ ke lengan penamat $\\theta$.'), true],
        [T('$\\tan 90^\\circ = 0$.', '$\\tan 90^\\circ = 0$.'), false],
        [T('$\\tan 90^\\circ$ is not defined.', '$\\tan 90^\\circ$ tidak ditakrifkan.'), true],
        [T('In quadrant III, both $\\sin\\theta$ and $\\cos\\theta$ are negative.', 'Dalam sukuan III, kedua-dua $\\sin\\theta$ dan $\\cos\\theta$ adalah negatif.'), true],
        [T('In quadrant IV, $\\cos\\theta$ is negative.', 'Dalam sukuan IV, $\\cos\\theta$ adalah negatif.'), false],
        [T('ASTC stands for the ratios that are positive in quadrants I, II, III, IV respectively: All, Sine, Tangent, Cosine.', 'ASTC mewakili nisbah yang positif dalam sukuan I, II, III, IV masing-masing: All (semua), Sine (sinus), Tangent (tangen), Cosine (kosinus).'), true],
        [T('The reference angle of $200^\\circ$ is $200^\\circ - 180^\\circ = 20^\\circ$.', 'Sudut rujukan bagi $200^\\circ$ ialah $200^\\circ - 180^\\circ = 20^\\circ$.'), true],
        [T('The reference angle of $200^\\circ$ is $360^\\circ - 200^\\circ = 160^\\circ$.', 'Sudut rujukan bagi $200^\\circ$ ialah $360^\\circ - 200^\\circ = 160^\\circ$.'), false],
        [T('The reference angle of $320^\\circ$ is $360^\\circ - 320^\\circ = 40^\\circ$.', 'Sudut rujukan bagi $320^\\circ$ ialah $360^\\circ - 320^\\circ = 40^\\circ$.'), true],
        [T('An angle of $95^\\circ$ lies in quadrant I.', 'Satu sudut $95^\\circ$ berada dalam sukuan I.'), false],
        [T('An angle of $95^\\circ$ lies in quadrant II.', 'Satu sudut $95^\\circ$ berada dalam sukuan II.'), true],
        [T('The reference angle can never be greater than $90^\\circ$.', 'Sudut rujukan tidak boleh melebihi $90^\\circ$.'), true],
        [T('$\\cos\\theta$ is positive in both quadrant I and quadrant IV.', '$\\cos\\theta$ adalah positif dalam kedua-dua sukuan I dan sukuan IV.'), true],
        [T('$\\sin\\theta$ is positive in both quadrant I and quadrant III.', '$\\sin\\theta$ adalah positif dalam kedua-dua sukuan I dan sukuan III.'), false],
        [T('$\\tan\\theta$ is positive in both quadrant I and quadrant III.', '$\\tan\\theta$ adalah positif dalam kedua-dua sukuan I dan sukuan III.'), true],
        [T('An angle of $265^\\circ$ lies in quadrant IV.', 'Satu sudut $265^\\circ$ berada dalam sukuan IV.'), false],
      ]);
      return { q: T(`True or false? "${st[0].en}"`, `Benar atau palsu? "${st[0].ms}"`), a: st[1] ? T('True', 'Benar') : T('False', 'Palsu'), sp: 'xs' };
    },
    (r) => {
      const signs = r.pick([[1, 1, 'I'], [1, -1, 'II'], [-1, -1, 'III'], [-1, 1, 'IV']]);
      return { q: T(`If $\\sin\\theta ${signs[0] > 0 ? '> 0' : '< 0'}$ and $\\cos\\theta ${signs[1] > 0 ? '> 0' : '< 0'}$, in which quadrant does $\\theta$ lie?`, `Jika $\\sin\\theta ${signs[0] > 0 ? '> 0' : '< 0'}$ dan $\\cos\\theta ${signs[1] > 0 ? '> 0' : '< 0'}$, dalam sukuan manakah $\\theta$ berada?`), a: T(`Quadrant ${signs[2]}`, `Sukuan ${signs[2]}`), sp: 's' };
    },
    (r) => {
      const angs = r.sample([50, 130, 220, 310], 4);
      const quads = angs.map(quadOf);
      return { q: T(`Match each angle to the quadrant it lies in: angles $${angs.map((a) => a + '^\\circ').join(', ')}$; quadrants I, II, III, IV.`, `Padankan setiap sudut dengan sukuan tempat ia berada: sudut $${angs.map((a) => a + '^\\circ').join(', ')}$; sukuan I, II, III, IV.`), a: T(angs.map((a, i) => `$${a}^\\circ \\to$ ${QROMAN[quads[i]]}`).join(', ')), sp: 's' };
    },
    (r) => {
      const sx = r.sign(), sy = r.sign();
      const q = sx > 0 && sy > 0 ? 1 : sx < 0 && sy > 0 ? 2 : sx < 0 && sy < 0 ? 3 : 4;
      const x = sx * r.int(2, 8), y = sy * r.int(2, 8);
      return { q: T(`The terminal arm of angle $\\theta$ (measured from the positive $x$-axis) passes through the point $(${x}, ${y})$. State the quadrant in which $\\theta$ lies.`, `Lengan penamat sudut $\\theta$ (diukur daripada paksi-$x$ positif) melalui titik $(${x}, ${y})$. Nyatakan sukuan tempat $\\theta$ berada.`), a: T(`Quadrant ${QROMAN[q]}`, `Sukuan ${QROMAN[q]}`), sp: 'xs' };
    },
    (r) => {
      const ctx = r.pick(ANGCTX), ang = r.pick([120, 200, 250, 320, 60, 160]);
      const fn = r.pick(['sin', 'cos']);
      const sgn = SGN[fn][quadOf(ang) - 1];
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} turns through an angle of $${ang}^\\circ$ from its starting position. Is $\\${fn}\\,${ang}^\\circ$ positive or negative?`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} berputar melalui sudut $${ang}^\\circ$ daripada kedudukan permulaannya. Adakah $\\${fn}\\,${ang}^\\circ$ positif atau negatif?`), a: sgn > 0 ? T('Positive', 'Positif') : T('Negative', 'Negatif'), sp: 'xs' };
    },
    (r) => {
      const ctx = r.pick(ANGCTX), ang = r.pick([25, 100, 200, 250, 300, 330, 145, 80, 170, 190, 350]);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} turns through an angle of $${ang}^\\circ$ from its starting position. In which quadrant does this angle lie?`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} berputar melalui sudut $${ang}^\\circ$ daripada kedudukan permulaannya. Dalam sukuan manakah sudut ini berada?`), a: T(`Quadrant ${QROMAN[quadOf(ang)]}`, `Sukuan ${QROMAN[quadOf(ang)]}`), sp: 'xs' };
    },
    (r) => {
      const ctx = r.pick(ANGCTX), q = r.int(1, 4);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} has turned so that it is now in quadrant ${QROMAN[q]}. Using ASTC, which trigonometric ratio(s) are positive at this position?`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} telah berputar supaya ia kini berada dalam sukuan ${QROMAN[q]}. Menggunakan ASTC, nisbah trigonometri manakah yang positif pada kedudukan ini?`), a: ASTC[q], sp: 'xs' };
    },
  ];
  const g61m = [
    (r) => {
      const t = r.pick(NONQ60.filter((v) => v > 90)), fn = r.pick(['sin', 'cos', 'tan']);
      const forms = [
        { en: 'Find the exact value of $\\{fn} {t}^\\circ$ using the reference angle.', ms: 'Cari nilai tepat bagi $\\{fn} {t}^\\circ$ menggunakan sudut rujukan.' },
        { en: 'Without using a calculator, evaluate $\\{fn} {t}^\\circ$.', ms: 'Tanpa menggunakan kalkulator, nilaikan $\\{fn} {t}^\\circ$.' },
      ];
      const f = r.pick(forms);
      const q = T(f.en.replace('{fn}', fn).replace('{t}', t), f.ms.replace('{fn}', fn).replace('{t}', t));
      return { q, a: T(`$${exactTex(fn, t)}$`), w: T(`Reference angle $${refAngle(t)}^\\circ$, quadrant ${QROMAN[quadOf(t)]}`, `Sudut rujukan $${refAngle(t)}^\\circ$, sukuan ${QROMAN[quadOf(t)]}`), sp: 's' };
    },
    (r) => {
      // pool of (fn, angle) whose exact value is RATIONAL, so sums stay clean (no surd decimals)
      const RATPOOL = [
        { fn: 'sin', t: r.pick([30, 150]), val: Fr.make(1, 2) }, { fn: 'sin', t: r.pick([210, 330]), val: Fr.make(-1, 2) },
        { fn: 'cos', t: r.pick([60, 300]), val: Fr.make(1, 2) }, { fn: 'cos', t: r.pick([120, 240]), val: Fr.make(-1, 2) },
        { fn: 'tan', t: r.pick([45, 225]), val: Fr.make(1, 1) }, { fn: 'tan', t: r.pick([135, 315]), val: Fr.make(-1, 1) },
        { fn: 'sin', t: 90, val: Fr.make(1, 1) }, { fn: 'sin', t: 270, val: Fr.make(-1, 1) }, { fn: 'sin', t: r.pick([0, 180, 360]), val: Fr.make(0, 1) },
        { fn: 'cos', t: r.pick([0, 360]), val: Fr.make(1, 1) }, { fn: 'cos', t: 180, val: Fr.make(-1, 1) }, { fn: 'cos', t: r.pick([90, 270]), val: Fr.make(0, 1) },
        { fn: 'tan', t: r.pick([0, 180, 360]), val: Fr.make(0, 1) },
      ];
      const e1 = r.pick(RATPOOL), e2 = r.pick(RATPOOL);
      const c1 = r.int(1, 3), c2 = r.int(1, 3);
      const total = Fr.add(Fr.make(c1 * e1.val.n, e1.val.d), Fr.make(c2 * e2.val.n, e2.val.d));
      return { q: T(`Find the exact value of $${c1 > 1 ? c1 : ''}\\${e1.fn}\\,${e1.t}^\\circ + ${c2 > 1 ? c2 : ''}\\${e2.fn}\\,${e2.t}^\\circ$.`, `Cari nilai tepat bagi $${c1 > 1 ? c1 : ''}\\${e1.fn}\\,${e1.t}^\\circ + ${c2 > 1 ? c2 : ''}\\${e2.fn}\\,${e2.t}^\\circ$.`), a: T(`$${Fr.tex(total)}$`), w: T(`$${c1 > 1 ? c1 + '(' : ''}${exactTex(e1.fn, e1.t)}${c1 > 1 ? ')' : ''} + ${c2 > 1 ? c2 + '(' : ''}${exactTex(e2.fn, e2.t)}${c2 > 1 ? ')' : ''}$`), sp: 'm' };
    },
    (r) => {
      const ref = r.pick([30, 45, 60]), fn = r.pick(['sin', 'cos', 'tan']);
      const q = r.pick([2, 3, 4]);
      const theta = q === 2 ? 180 - ref : q === 3 ? 180 + ref : 360 - ref;
      const val = exactTex(fn, theta);
      return { q: T(`Given $\\${fn}\\,\\theta = ${val}$ and $\\theta$ is in quadrant ${QROMAN[q]}, find $\\theta$ for $0^\\circ \\le \\theta \\le 360^\\circ$.`, `Diberi $\\${fn}\\,\\theta = ${val}$ dan $\\theta$ berada dalam sukuan ${QROMAN[q]}, cari $\\theta$ bagi $0^\\circ \\le \\theta \\le 360^\\circ$.`), a: T(`$\\theta = ${theta}^\\circ$`), w: T(`Reference angle $${ref}^\\circ$ in quadrant ${QROMAN[q]}`, `Sudut rujukan $${ref}^\\circ$ dalam sukuan ${QROMAN[q]}`), sp: 'm' };
    },
    (r) => {
      const wrong = r.chance();
      const t = r.pick(NONQ60.filter((v) => v > 90)), fn = r.pick(['sin', 'cos', 'tan']);
      const correct = exactTex(fn, t);
      const flippedSign = correct.startsWith('-') ? correct.slice(1) : '-' + correct;
      const shown = wrong ? flippedSign : correct;
      return { q: T(`A student evaluates $\\${fn}\\,${t}^\\circ = ${shown}$. Is this correct? If not, explain the error and give the correct value.`, `Seorang murid menilai $\\${fn}\\,${t}^\\circ = ${shown}$. Adakah ini betul? Jika tidak, terangkan kesilapan itu dan berikan nilai yang betul.`), a: wrong ? T(`No: the sign is wrong. In quadrant ${QROMAN[quadOf(t)]}, $\\${fn}\\,\\theta$ is ${SGN[fn][quadOf(t) - 1] > 0 ? 'positive' : 'negative'}; correct value $${correct}$.`, `Tidak: tandanya salah. Dalam sukuan ${QROMAN[quadOf(t)]}, $\\${fn}\\,\\theta$ adalah ${SGN[fn][quadOf(t) - 1] > 0 ? 'positif' : 'negatif'}; nilai yang betul $${correct}$.`) : T('Yes, this is correct.', 'Ya, ini betul.'), sp: 'm' };
    },
    (r) => {
      const opt = r.pick(NONQ60.filter((v) => v > 90)), fn = r.pick(['sin', 'cos', 'tan']);
      const correct = exactTex(fn, opt);
      const wrongSign = correct.startsWith('-') ? correct.slice(1) : '-' + correct;
      const otherFn = fn === 'sin' ? 'cos' : fn === 'cos' ? 'tan' : 'sin';
      const wrongFn = exactTex(otherFn, opt) || correct;
      const opts = r.shuffle([...new Set([correct, wrongSign, wrongFn])]);
      need(opts.length >= 3);
      const letters = 'ABC';
      return { q: T(`Which of the following is the exact value of $\\${fn}\\,${opt}^\\circ$? ${opts.map((o, i) => `(${letters[i]}) $${o}$`).join(', ')}`, `Yang manakah nilai tepat bagi $\\${fn}\\,${opt}^\\circ$? ${opts.map((o, i) => `(${letters[i]}) $${o}$`).join(', ')}`), a: T(`(${letters[opts.indexOf(correct)]}) $${correct}$`), sp: 's' };
    },
    (r) => {
      const ref = r.pick([30, 45, 60]), fn = r.pick(['sin', 'cos']);
      const t2 = 180 - ref;
      return { q: T(`By evaluating both sides using exact values, determine whether $\\${fn}\\,(180^\\circ - ${ref}^\\circ) = \\${fn}\\,${ref}^\\circ$ is true.`, `Dengan menilai kedua-dua belah menggunakan nilai tepat, tentukan sama ada $\\${fn}\\,(180^\\circ - ${ref}^\\circ) = \\${fn}\\,${ref}^\\circ$ adalah benar.`), a: T(`LHS $= \\${fn}\\,${t2}^\\circ = ${exactTex(fn, t2)}$; RHS $= \\${fn}\\,${ref}^\\circ = ${exactTex(fn, ref)}$. ${fn === 'sin' ? 'Equal — the statement is true (in general, $\\sin(180^\\circ - \\theta) = \\sin\\theta$).' : 'NOT equal — the statement is false; in general $\\cos(180^\\circ - \\theta) = -\\cos\\theta$.'}`, `KSK $= \\${fn}\\,${t2}^\\circ = ${exactTex(fn, t2)}$; SSK $= \\${fn}\\,${ref}^\\circ = ${exactTex(fn, ref)}$. ${fn === 'sin' ? 'Sama — kenyataan itu benar (secara am, $\\sin(180^\\circ - \\theta) = \\sin\\theta$).' : 'TIDAK sama — kenyataan itu palsu; secara am $\\cos(180^\\circ - \\theta) = -\\cos\\theta$.'}`), sp: 'm' };
    },
    (r) => {
      const ctx = r.pick(ANGCTX), t = r.pick(NONQ60.filter((v) => v > 90)), fn = r.pick(['sin', 'cos', 'tan']);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} has turned through $${t}^\\circ$ from its starting position. Find the exact value of $\\${fn}\\,${t}^\\circ$, showing the reference angle and quadrant used.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} telah berputar melalui $${t}^\\circ$ daripada kedudukan permulaannya. Cari nilai tepat bagi $\\${fn}\\,${t}^\\circ$, tunjukkan sudut rujukan dan sukuan yang digunakan.`), a: T(`$${exactTex(fn, t)}$`), w: T(`Reference angle $${refAngle(t)}^\\circ$, quadrant ${QROMAN[quadOf(t)]}`, `Sudut rujukan $${refAngle(t)}^\\circ$, sukuan ${QROMAN[quadOf(t)]}`), sp: 's' };
    },
    (r) => {
      const ctx = r.pick(ANGCTX), q = r.int(2, 4), ref = r.pick([30, 45, 60]);
      const t = q === 2 ? 180 - ref : q === 3 ? 180 + ref : 360 - ref;
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} rotates into quadrant ${QROMAN[q]}, reaching a position whose reference angle is $${ref}^\\circ$. Through what total angle (from $0^\\circ$ to $360^\\circ$) has it turned?`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} berputar ke sukuan ${QROMAN[q]}, mencapai kedudukan yang sudut rujukannya ialah $${ref}^\\circ$. Melalui sudut jumlah berapakah (dari $0^\\circ$ hingga $360^\\circ$) ia telah berputar?`), a: T(`$${t}^\\circ$`), sp: 's' };
    },
    (r) => {
      const [p, q, h] = r.pick(RT3s), sx = r.sign(), sy = r.sign();
      const x = sx * p, y = sy * q;
      const quad = sx > 0 && sy > 0 ? 1 : sx < 0 && sy > 0 ? 2 : sx < 0 && sy < 0 ? 3 : 4;
      return { q: T(`The terminal arm of angle $\\theta$ passes through the point $(${x}, ${y})$. Find $\\sin\\theta$, $\\cos\\theta$ and $\\tan\\theta$.`, `Lengan penamat sudut $\\theta$ melalui titik $(${x}, ${y})$. Cari $\\sin\\theta$, $\\cos\\theta$ dan $\\tan\\theta$.`), a: T(`$r = \\sqrt{(${x})^2 + (${y})^2} = ${h}$; $\\sin\\theta = ${sy < 0 ? '-' : ''}\\dfrac{${q}}{${h}}$, $\\cos\\theta = ${sx < 0 ? '-' : ''}\\dfrac{${p}}{${h}}$, $\\tan\\theta = ${SGN.tan[quad - 1] < 0 ? '-' : ''}\\dfrac{${q}}{${p}}$`, `$r = \\sqrt{(${x})^2 + (${y})^2} = ${h}$; $\\sin\\theta = ${sy < 0 ? '-' : ''}\\dfrac{${q}}{${h}}$, $\\cos\\theta = ${sx < 0 ? '-' : ''}\\dfrac{${p}}{${h}}$, $\\tan\\theta = ${SGN.tan[quad - 1] < 0 ? '-' : ''}\\dfrac{${q}}{${p}}$`), w: T(`$x = ${x}$, $y = ${y}$, $r = \\sqrt{x^2+y^2}$; $\\sin\\theta = y/r$, $\\cos\\theta = x/r$, $\\tan\\theta = y/x$`, `$x = ${x}$, $y = ${y}$, $r = \\sqrt{x^2+y^2}$; $\\sin\\theta = y/r$, $\\cos\\theta = x/r$, $\\tan\\theta = y/x$`), sp: 'm' };
    },
    (r) => {
      const ctx = r.pick(ANGCTX), q = r.int(1, 4);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} turns to an angle $\\theta$ in quadrant ${QROMAN[q]}. State which of $\\sin\\theta$, $\\cos\\theta$, $\\tan\\theta$ are positive and which are negative.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} berputar ke sudut $\\theta$ dalam sukuan ${QROMAN[q]}. Nyatakan yang manakah antara $\\sin\\theta$, $\\cos\\theta$, $\\tan\\theta$ positif dan yang manakah negatif.`), a: T(`$\\sin\\theta$ ${SGN.sin[q - 1] > 0 ? '+' : '-'}, $\\cos\\theta$ ${SGN.cos[q - 1] > 0 ? '+' : '-'}, $\\tan\\theta$ ${SGN.tan[q - 1] > 0 ? '+' : '-'}`), sp: 's' };
    },
  ];
  const twoSolutions = (fn, ref, sign) => {
    if (fn === 'sin') return sign > 0 ? [ref, 180 - ref] : [180 + ref, 360 - ref];
    if (fn === 'cos') return sign > 0 ? [ref, 360 - ref] : [180 - ref, 180 + ref];
    return sign > 0 ? [ref, 180 + ref] : [180 - ref, 360 - ref];
  };
  const g61a = [
    (r) => {
      const q = r.pick([2, 3, 4]);
      const [p, qq, h] = r.pick(RT3s);
      const given = r.pick(['sin', 'cos', 'tan']);
      const sSin = SGN.sin[q - 1], sCos = SGN.cos[q - 1], sTan = SGN.tan[q - 1];
      const tx = (s, num, den) => (s < 0 ? '-' : '') + `\\dfrac{${num}}{${den}}`;
      const sinTex = tx(sSin, p, h), cosTex = tx(sCos, qq, h), tanTex = tx(sTan, p, qq);
      const givenTex = given === 'sin' ? sinTex : given === 'cos' ? cosTex : tanTex;
      const others = given === 'sin' ? [['\\cos', cosTex], ['\\tan', tanTex]] : given === 'cos' ? [['\\sin', sinTex], ['\\tan', tanTex]] : [['\\sin', sinTex], ['\\cos', cosTex]];
      return { q: T(`Given $\\${given}\\,\\theta = ${givenTex}$ and $\\theta$ is in quadrant ${QROMAN[q]}, find $${others[0][0]}\\,\\theta$ and $${others[1][0]}\\,\\theta$.`, `Diberi $\\${given}\\,\\theta = ${givenTex}$ dan $\\theta$ berada dalam sukuan ${QROMAN[q]}, cari $${others[0][0]}\\,\\theta$ dan $${others[1][0]}\\,\\theta$.`), a: T(`$${others[0][0]}\\,\\theta = ${others[0][1]}$, $${others[1][0]}\\,\\theta = ${others[1][1]}$`), w: T(`Reference triangle $${p}, ${qq}, ${h}$; apply the ASTC sign rule for quadrant ${QROMAN[q]}.`, `Segi tiga rujukan $${p}, ${qq}, ${h}$; guna peraturan tanda ASTC bagi sukuan ${QROMAN[q]}.`), sp: 'm' };
    },
    (r) => {
      const fn = r.pick(['sin', 'cos', 'tan']), ref = r.pick([30, 45, 60]), sign = r.sign();
      const table = fn === 'sin' ? SIN30 : fn === 'cos' ? COS30 : TAN30;
      const valTex = (sign < 0 ? '-' : '') + table[IDX30[ref]];
      const [a1, a2] = twoSolutions(fn, ref, sign);
      return { q: T(`Find all values of $\\theta$ from $0^\\circ$ to $360^\\circ$ for which $\\${fn}\\,\\theta = ${valTex}$.`, `Cari semua nilai $\\theta$ dari $0^\\circ$ hingga $360^\\circ$ bagi $\\${fn}\\,\\theta = ${valTex}$.`), a: T(`$\\theta = ${a1}^\\circ$ or $${a2}^\\circ$`, `$\\theta = ${a1}^\\circ$ atau $${a2}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const RATPOOL = [
        { fn: 'sin', t: r.pick([30, 150]), val: Fr.make(1, 2) }, { fn: 'sin', t: r.pick([210, 330]), val: Fr.make(-1, 2) },
        { fn: 'cos', t: r.pick([60, 300]), val: Fr.make(1, 2) }, { fn: 'cos', t: r.pick([120, 240]), val: Fr.make(-1, 2) },
        { fn: 'tan', t: r.pick([45, 225]), val: Fr.make(1, 1) }, { fn: 'tan', t: r.pick([135, 315]), val: Fr.make(-1, 1) },
        { fn: 'sin', t: 90, val: Fr.make(1, 1) }, { fn: 'sin', t: 270, val: Fr.make(-1, 1) }, { fn: 'cos', t: r.pick([0, 360]), val: Fr.make(1, 1) }, { fn: 'cos', t: 180, val: Fr.make(-1, 1) },
      ];
      const es = r.sample(RATPOOL, 3), cs = [r.int(1, 3), r.int(1, 3), r.int(1, 3)];
      let total = Fr.make(0, 1);
      es.forEach((e, i) => { total = Fr.add(total, Fr.make(cs[i] * e.val.n, e.val.d)); });
      const terms = es.map((e, i) => `${cs[i] > 1 ? cs[i] : ''}\\${e.fn}\\,${e.t}^\\circ`).join(' + ');
      const work = es.map((e, i) => `${cs[i] > 1 ? cs[i] + '(' : ''}${exactTex(e.fn, e.t)}${cs[i] > 1 ? ')' : ''}`).join(' + ');
      return { q: T(`Find the exact value of $${terms}$.`, `Cari nilai tepat bagi $${terms}$.`), a: T(`$${Fr.tex(total)}$`), w: T(`$${work}$`), sp: 'm' };
    },
    (r) => {
      const id = r.pick([
        { lhs: '\\sin(180^\\circ - \\theta)', rhs: '\\sin\\theta', quad: 'II' },
        { lhs: '\\cos(360^\\circ - \\theta)', rhs: '\\cos\\theta', quad: 'IV' },
        { lhs: '\\tan(180^\\circ + \\theta)', rhs: '\\tan\\theta', quad: 'III' },
        { lhs: '\\cos(180^\\circ + \\theta)', rhs: '-\\cos\\theta', quad: 'III' },
        { lhs: '\\sin(360^\\circ - \\theta)', rhs: '-\\sin\\theta', quad: 'IV' },
        { lhs: '\\cos(180^\\circ - \\theta)', rhs: '-\\cos\\theta', quad: 'II' },
        { lhs: '\\sin(180^\\circ + \\theta)', rhs: '-\\sin\\theta', quad: 'III' },
      ]);
      const eqTex = `$${id.lhs} = ${id.rhs}$`;
      const forms = [
        { en: 'For an acute angle $\\theta$, explain using the reference angle and the ASTC sign rule why {eq}.', ms: 'Bagi sudut tirus $\\theta$, terangkan menggunakan sudut rujukan dan peraturan tanda ASTC mengapa {eq}.' },
        { en: 'Justify, for an acute angle $\\theta$, the identity {eq}, using the definition of reference angle.', ms: 'Wajarkan, bagi sudut tirus $\\theta$, identiti {eq}, menggunakan takrif sudut rujukan.' },
      ];
      const f = r.pick(forms);
      const sub = (s) => s.replace('{eq}', eqTex);
      return { q: T(sub(f.en), sub(f.ms)), a: T(`The angle in $${id.lhs}$ lies in quadrant ${id.quad} and has reference angle $\\theta$ (since $\\theta$ is acute); the ratio's magnitude is therefore the same as for $\\theta$, and the sign is fixed by which ratios are positive in quadrant ${id.quad} (ASTC), giving $${id.rhs}$.`, `Sudut dalam $${id.lhs}$ berada dalam sukuan ${id.quad} dan mempunyai sudut rujukan $\\theta$ (kerana $\\theta$ tirus); magnitud nisbah itu oleh itu sama seperti bagi $\\theta$, dan tandanya ditentukan oleh nisbah yang positif dalam sukuan ${id.quad} (ASTC), memberikan $${id.rhs}$.`), sp: 'm' };
    },
    (r) => {
      const ctx = r.pick(ANGCTX), fn = r.pick(['sin', 'cos', 'tan']), ref = r.pick([30, 45, 60]), sign = r.sign();
      const table = fn === 'sin' ? SIN30 : fn === 'cos' ? COS30 : TAN30;
      const valTex = (sign < 0 ? '-' : '') + table[IDX30[ref]];
      const [a1, a2] = twoSolutions(fn, ref, sign);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} reaches a position where $\\${fn}\\,\\theta = ${valTex}$, where $\\theta$ is its angle of rotation. Find all possible values of $\\theta$ from $0^\\circ$ to $360^\\circ$.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} mencapai kedudukan di mana $\\${fn}\\,\\theta = ${valTex}$, dengan $\\theta$ ialah sudut putarannya. Cari semua nilai $\\theta$ yang mungkin dari $0^\\circ$ hingga $360^\\circ$.`), a: T(`$\\theta = ${a1}^\\circ$ or $${a2}^\\circ$`, `$\\theta = ${a1}^\\circ$ atau $${a2}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const ctx = r.pick(ANGCTX), q = r.pick([2, 3, 4]), [p, qq, h] = r.pick(RT3s), given = r.pick(['sin', 'cos', 'tan']);
      const sSin = SGN.sin[q - 1], sCos = SGN.cos[q - 1], sTan = SGN.tan[q - 1];
      const tx = (s, num, den) => (s < 0 ? '-' : '') + `\\dfrac{${num}}{${den}}`;
      const sinTex = tx(sSin, p, h), cosTex = tx(sCos, qq, h), tanTex = tx(sTan, p, qq);
      const givenTex = given === 'sin' ? sinTex : given === 'cos' ? cosTex : tanTex;
      const others = given === 'sin' ? [['\\cos', cosTex], ['\\tan', tanTex]] : given === 'cos' ? [['\\sin', sinTex], ['\\tan', tanTex]] : [['\\sin', sinTex], ['\\cos', cosTex]];
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} has rotated to an angle $\\theta$ in quadrant ${QROMAN[q]}, with $\\${given}\\,\\theta = ${givenTex}$. Find $${others[0][0]}\\,\\theta$ and $${others[1][0]}\\,\\theta$.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} telah berputar ke sudut $\\theta$ dalam sukuan ${QROMAN[q]}, dengan $\\${given}\\,\\theta = ${givenTex}$. Cari $${others[0][0]}\\,\\theta$ dan $${others[1][0]}\\,\\theta$.`), a: T(`$${others[0][0]}\\,\\theta = ${others[0][1]}$, $${others[1][0]}\\,\\theta = ${others[1][1]}$`), sp: 'm' };
    },
    (r) => {
      const ref = r.pick([30, 45, 60]);
      const sinVal = SIN30[IDX30[ref]]; // always positive, so theta is in quadrant I or II only
      const quad = r.pick([1, 2]);
      const cosSign = SGN.cos[quad - 1], tanSign = SGN.tan[quad - 1];
      const tanVal = (tanSign < 0 ? '-' : '') + TAN30[IDX30[ref]];
      return { q: T(`Given $\\sin\\theta = ${sinVal}$ and $\\cos\\theta ${cosSign < 0 ? '< 0' : '> 0'}$, determine the quadrant of $\\theta$, then find $\\tan\\theta$.`, `Diberi $\\sin\\theta = ${sinVal}$ dan $\\cos\\theta ${cosSign < 0 ? '< 0' : '> 0'}$, tentukan sukuan $\\theta$, kemudian cari $\\tan\\theta$.`), a: T(`$\\sin\\theta > 0$ and $\\cos\\theta ${cosSign < 0 ? '< 0' : '> 0'}$ together place $\\theta$ in quadrant ${QROMAN[quad]}; $\\tan\\theta = ${tanVal}$.`, `$\\sin\\theta > 0$ dan $\\cos\\theta ${cosSign < 0 ? '< 0' : '> 0'}$ bersama meletakkan $\\theta$ dalam sukuan ${QROMAN[quad]}; $\\tan\\theta = ${tanVal}$.`), sp: 'm' };
    },
    (r) => {
      const x = r.sign(), y = r.sign();
      const q = x > 0 && y > 0 ? 1 : x < 0 && y > 0 ? 2 : x < 0 && y < 0 ? 3 : 4;
      return { q: T(`A point $P$ on the unit circle corresponds to angle $\\theta$, so $P = (\\cos\\theta, \\sin\\theta)$. If $P$ has ${x > 0 ? 'a positive' : 'a negative'} $x$-coordinate and ${y > 0 ? 'a positive' : 'a negative'} $y$-coordinate, which quadrant is $\\theta$ in, and what does this tell us about the sign of $\\tan\\theta$?`, `Satu titik $P$ pada bulatan unit sepadan dengan sudut $\\theta$, jadi $P = (\\cos\\theta, \\sin\\theta)$. Jika $P$ mempunyai koordinat-$x$ yang ${x > 0 ? 'positif' : 'negatif'} dan koordinat-$y$ yang ${y > 0 ? 'positif' : 'negatif'}, dalam sukuan manakah $\\theta$ berada, dan apakah maksudnya tentang tanda $\\tan\\theta$?`), a: T(`Quadrant ${QROMAN[q]}; $\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$ is ${SGN.tan[q - 1] > 0 ? 'positive' : 'negative'} there.`, `Sukuan ${QROMAN[q]}; $\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$ adalah ${SGN.tan[q - 1] > 0 ? 'positif' : 'negatif'} di sana.`), sp: 's' };
    },
    (r) => {
      const q = r.pick([2, 3, 4]);
      const r1 = r.pick([20, 40]), r2 = retry(() => { const v = r.pick([10, 20, 30, 40, 50, 60, 70, 80]); need(v !== r1); return v; });
      const t1 = q === 2 ? 180 - r1 : q === 3 ? 180 + r1 : 360 - r1;
      const t2 = q === 2 ? 180 - r2 : q === 3 ? 180 + r2 : 360 - r2;
      const fn = r.pick(['sin', 'cos', 'tan']);
      const rad = (d) => (d * Math.PI) / 180;
      const v1 = fn === 'sin' ? Math.sin(rad(t1)) : fn === 'cos' ? Math.cos(rad(t1)) : Math.tan(rad(t1));
      const v2 = fn === 'sin' ? Math.sin(rad(t2)) : fn === 'cos' ? Math.cos(rad(t2)) : Math.tan(rad(t2));
      const bigger = v1 > v2 ? t1 : t2;
      return { q: T(`Without a calculator, determine which is greater: $\\${fn}\\,${t1}^\\circ$ or $\\${fn}\\,${t2}^\\circ$ (both angles are in quadrant ${QROMAN[q]}). Explain using reference angles.`, `Tanpa kalkulator, tentukan yang manakah lebih besar: $\\${fn}\\,${t1}^\\circ$ atau $\\${fn}\\,${t2}^\\circ$ (kedua-dua sudut berada dalam sukuan ${QROMAN[q]}). Terangkan menggunakan sudut rujukan.`), a: T(`$\\${fn}\\,${bigger}^\\circ$ is greater (reference angles $${r1}^\\circ$ and $${r2}^\\circ$; compare using how $\\${fn}$ behaves on $0^\\circ$–$90^\\circ$ together with the sign in quadrant ${QROMAN[q]}).`, `$\\${fn}\\,${bigger}^\\circ$ lebih besar (sudut rujukan $${r1}^\\circ$ dan $${r2}^\\circ$; bandingkan menggunakan cara $\\${fn}$ berkelakuan pada $0^\\circ$–$90^\\circ$ bersama tanda dalam sukuan ${QROMAN[q]}).`), sp: 'l' };
    },
    (r) => {
      const [p, q, h] = r.pick(RT3s), sx = r.sign(), sy = r.sign();
      const x = sx * p, y = sy * q;
      const quad = sx > 0 && sy > 0 ? 1 : sx < 0 && sy > 0 ? 2 : sx < 0 && sy < 0 ? 3 : 4;
      const sinFr = Fr.make(sy * q, h), cosFr = Fr.make(sx * p, h);
      const check = Fr.add(Fr.make(sinFr.n * sinFr.n, sinFr.d * sinFr.d), Fr.make(cosFr.n * cosFr.n, cosFr.d * cosFr.d));
      return { q: T(`The terminal arm of angle $\\theta$ passes through $(${x}, ${y})$. Find $\\sin\\theta$ and $\\cos\\theta$ as exact fractions, then verify that $\\sin^2\\theta + \\cos^2\\theta = 1$.`, `Lengan penamat sudut $\\theta$ melalui $(${x}, ${y})$. Cari $\\sin\\theta$ dan $\\cos\\theta$ sebagai pecahan tepat, kemudian sahkan bahawa $\\sin^2\\theta + \\cos^2\\theta = 1$.`), a: T(`$\\sin\\theta = ${Fr.tex(sinFr)}$, $\\cos\\theta = ${Fr.tex(cosFr)}$; $\\sin^2\\theta + \\cos^2\\theta = \\dfrac{${q * q}}{${h * h}} + \\dfrac{${p * p}}{${h * h}} = \\dfrac{${p * p + q * q}}{${h * h}} = ${Fr.tex(check)}$, confirmed.`, `$\\sin\\theta = ${Fr.tex(sinFr)}$, $\\cos\\theta = ${Fr.tex(cosFr)}$; $\\sin^2\\theta + \\cos^2\\theta = \\dfrac{${q * q}}{${h * h}} + \\dfrac{${p * p}}{${h * h}} = \\dfrac{${p * p + q * q}}{${h * h}} = ${Fr.tex(check)}$, disahkan.`), sp: 'm' };
    },
    (r) => {
      const ctx = r.pick(ANGCTX), [p, q, h] = r.pick(RT3s), sx = r.sign(), sy = r.sign();
      const x = sx * p, y = sy * q;
      const quad = sx > 0 && sy > 0 ? 1 : sx < 0 && sy > 0 ? 2 : sx < 0 && sy < 0 ? 3 : 4;
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} has rotated so that a marked point on it is at position $(${x}, ${y})$ relative to the centre of rotation, with $\\theta$ measured from the positive $x$-axis. (a) Find the quadrant of $\\theta$. (b) Find $\\sin\\theta$, $\\cos\\theta$ and $\\tan\\theta$ as exact fractions. (c) State which of these three ratios are positive.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} telah berputar supaya satu titik bertanda padanya berada pada kedudukan $(${x}, ${y})$ berbanding pusat putaran, dengan $\\theta$ diukur daripada paksi-$x$ positif. (a) Cari sukuan $\\theta$. (b) Cari $\\sin\\theta$, $\\cos\\theta$ dan $\\tan\\theta$ sebagai pecahan tepat. (c) Nyatakan yang manakah antara ketiga-tiga nisbah ini positif.`), a: T(`(a) Quadrant ${QROMAN[quad]} (b) $\\sin\\theta = ${sy < 0 ? '-' : ''}\\dfrac{${q}}{${h}}$, $\\cos\\theta = ${sx < 0 ? '-' : ''}\\dfrac{${p}}{${h}}$, $\\tan\\theta = ${SGN.tan[quad - 1] < 0 ? '-' : ''}\\dfrac{${q}}{${p}}$ (c) ${[['\\sin\\theta', SGN.sin[quad - 1]], ['\\cos\\theta', SGN.cos[quad - 1]], ['\\tan\\theta', SGN.tan[quad - 1]]].filter((v) => v[1] > 0).map((v) => `$${v[0]}$`).join(', ') || 'none'}`, `(a) Sukuan ${QROMAN[quad]} (b) $\\sin\\theta = ${sy < 0 ? '-' : ''}\\dfrac{${q}}{${h}}$, $\\cos\\theta = ${sx < 0 ? '-' : ''}\\dfrac{${p}}{${h}}$, $\\tan\\theta = ${SGN.tan[quad - 1] < 0 ? '-' : ''}\\dfrac{${q}}{${p}}$ (c) ${[['\\sin\\theta', SGN.sin[quad - 1]], ['\\cos\\theta', SGN.cos[quad - 1]], ['\\tan\\theta', SGN.tan[quad - 1]]].filter((v) => v[1] > 0).map((v) => `$${v[0]}$`).join(', ') || 'tiada'}`), sp: 'l' };
    },
  ];
  SPM.extend('F5-6.1', { e: g61e, m: g61m, a: g61a });

  /* =============================================================== 6.2 Graphs of trigonometric functions */
  const rad2 = (d) => (d * Math.PI) / 180;
  const trigFig = (fn, a, b, c, xmax) => {
    xmax = xmax || 360;
    if (fn === 'tan') {
      const asymps = [];
      for (let k = 0; ; k++) {
        const xa = (90 + 180 * k) / b;
        if (xa > xmax) break;
        if (xa >= 0) asymps.push(xa);
      }
      const bounds = [0, ...asymps, xmax].filter((v, i, arr) => arr.indexOf(v) === i).sort((x, y) => x - y);
      const series = [];
      for (let i = 0; i < bounds.length - 1; i++) {
        const lo = bounds[i], hi = bounds[i + 1];
        if (hi - lo < 1e-6) continue;
        const pts = [];
        for (let t = 0; t <= 40; t++) {
          const x = lo + ((hi - lo) * t) / 40;
          const y = a * Math.tan(rad2(b * x)) + c;
          pts.push([x, Math.max(-6, Math.min(6, y))]);
        }
        series.push({ pts, type: 'line' });
      }
      return S.graph({ w: 320, h: 210, xr: [0, xmax, xmax <= 360 ? 90 : 180], yr: [-6, 6, 2], series });
    }
    const f = (x) => a * (fn === 'sin' ? Math.sin(rad2(b * x)) : Math.cos(rad2(b * x))) + c;
    const ymax = Math.ceil(a + Math.abs(c)) + 1;
    const pts = range(0, 180).map((i) => { const x = (xmax * i) / 180; return [x, f(x)]; });
    return S.graph({ w: 320, h: 210, xr: [0, xmax, xmax <= 360 ? 90 : 180], yr: [-ymax, ymax, 1], series: [{ pts, type: 'line' }] });
  };
  const EXACTSET = [
    { v: '0', num: 0 }, { v: '\\dfrac{1}{2}', num: 0.5 }, { v: '-\\dfrac{1}{2}', num: -0.5 },
    { v: '\\dfrac{\\sqrt{2}}{2}', num: Math.SQRT2 / 2 }, { v: '-\\dfrac{\\sqrt{2}}{2}', num: -Math.SQRT2 / 2 },
    { v: '\\dfrac{\\sqrt{3}}{2}', num: Math.sqrt(3) / 2 }, { v: '-\\dfrac{\\sqrt{3}}{2}', num: -Math.sqrt(3) / 2 },
    { v: '1', num: 1 }, { v: '-1', num: -1 },
  ];
  const TIDECTX = [
    T('the water depth at a harbour', 'kedalaman air di sebuah pelabuhan'), T('the temperature in a greenhouse', 'suhu di dalam sebuah rumah hijau'),
    T('the height of a Ferris wheel car above the ground', 'ketinggian sebuah gerabak kincir bulatan di atas tanah'), T("a patient's blood pressure reading", 'bacaan tekanan darah seorang pesakit'),
    T('the number of daylight hours', 'bilangan jam siang'), T('the voltage in an AC circuit', 'voltan dalam satu litar AU'),
    T('the depth of water in a swimming pool wave machine', 'kedalaman air dalam sebuah mesin ombak kolam renang'), T("a swing's height above the ground", 'ketinggian sebuah buaian di atas tanah'),
    T('the sales of a seasonal product each month', 'jualan bulanan sesuatu produk bermusim'), T("a piston's position in an engine", 'kedudukan sebuah omboh dalam enjin'),
    T('the height of a bobbing buoy at sea', 'ketinggian sebuah pelampung yang terapung-apung di laut'), T("a pendulum's horizontal displacement", 'sesaran ufuk sebuah bandul'),
  ];

  const g62e = [
    (r) => {
      const fn = r.pick(['sin', 'cos', 'tan']);
      const fig = trigFig(fn, 1, 1, 0);
      return { q: T('The graph shows one of $y = \\sin x$, $y = \\cos x$ or $y = \\tan x$ for $0^\\circ \\le x \\le 360^\\circ$. Which one is it?', 'Graf menunjukkan salah satu daripada $y = \\sin x$, $y = \\cos x$ atau $y = \\tan x$ bagi $0^\\circ \\le x \\le 360^\\circ$. Yang manakah?'), fig, a: T(`$y = \\${fn} x$`), sp: 's' };
    },
    (r) => {
      const fn = r.pick(['sin', 'cos']);
      return { q: T(`State the maximum and minimum values of $y = \\${fn} x$ and the values of $x$ (from $0^\\circ$ to $360^\\circ$) at which they occur.`, `Nyatakan nilai maksimum dan minimum bagi $y = \\${fn} x$ dan nilai $x$ (dari $0^\\circ$ hingga $360^\\circ$) apabila ia berlaku.`), a: fn === 'sin' ? T('Maximum $1$ at $x = 90^\\circ$; minimum $-1$ at $x = 270^\\circ$', 'Maksimum $1$ pada $x = 90^\\circ$; minimum $-1$ pada $x = 270^\\circ$') : T('Maximum $1$ at $x = 0^\\circ$ and $360^\\circ$; minimum $-1$ at $x = 180^\\circ$', 'Maksimum $1$ pada $x = 0^\\circ$ dan $360^\\circ$; minimum $-1$ pada $x = 180^\\circ$'), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.pick([1, 2, 3]), fn = r.pick(['sin', 'cos']);
      return { q: T(`State the amplitude and the period of $y = ${a} \\${fn} ${b === 1 ? '' : b}x$.`, `Nyatakan amplitud dan tempoh bagi $y = ${a} \\${fn} ${b === 1 ? '' : b}x$.`), a: T(`Amplitude ${a}; period $${360 / b}^\\circ$`, `Amplitud ${a}; tempoh $${360 / b}^\\circ$`), sp: 's' };
    },
    (r) => {
      const ctx = r.pick(TIDECTX), a = r.int(2, 5), b = r.pick([1, 2, 3]), fn = r.pick(['sin', 'cos']);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} is modelled by $y = ${a}\\${fn}\\,${b === 1 ? '' : b}x$. State the amplitude and period of this model.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} dimodelkan oleh $y = ${a}\\${fn}\\,${b === 1 ? '' : b}x$. Nyatakan amplitud dan tempoh model ini.`), a: T(`Amplitude ${a}; period $${360 / b}^\\circ$`, `Amplitud ${a}; tempoh $${360 / b}^\\circ$`), sp: 's' };
    },
    (r) => {
      const ctx = r.pick(TIDECTX), a = r.int(2, 5), fn = r.pick(['sin', 'cos']);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} is modelled by $y = ${a}\\${fn}\\,x$. State the maximum and minimum values this model predicts.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} dimodelkan oleh $y = ${a}\\${fn}\\,x$. Nyatakan nilai maksimum dan minimum yang diramalkan oleh model ini.`), a: T(`Maximum $${a}$; minimum $${-a}$`, `Maksimum $${a}$; minimum $${-a}$`), sp: 'xs' };
    },
    (r) => {
      const b = r.pick([1, 2, 3, 4]);
      return { q: T(`State the period of $y = \\tan ${b === 1 ? '' : b}x$. (Note: tangent has no amplitude or maximum/minimum value.)`, `Nyatakan tempoh bagi $y = \\tan ${b === 1 ? '' : b}x$. (Nota: tangen tiada amplitud atau nilai maksimum/minimum.)`), a: T(`$${180 / b}^\\circ$`), sp: 's' };
    },
    (r) => {
      const fn = r.pick(['sin', 'cos']), x = r.pick([0, 90, 180, 270, 360]);
      const fig = trigFig(fn, 1, 1, 0);
      const y = fn === 'sin' ? Math.sin(rad2(x)) : Math.cos(rad2(x));
      return { q: T(`From the graph of $y = \\${fn} x$, state the value of $y$ when $x = ${x}^\\circ$.`, `Daripada graf $y = \\${fn} x$, nyatakan nilai $y$ apabila $x = ${x}^\\circ$.`), fig, a: T(`$${n(round(y, 4))}$`), sp: 'xs' };
    },
    (r) => {
      const fn = r.pick(['sin', 'cos']), k = r.pick([0, 1, -1]);
      const sols = fn === 'sin' ? (k === 0 ? [0, 180, 360] : k === 1 ? [90] : [270]) : (k === 0 ? [90, 270] : k === 1 ? [0, 360] : [180]);
      return { q: T(`Solve $\\${fn}\\,x = ${k}$ for $0^\\circ \\le x \\le 360^\\circ$.`, `Selesaikan $\\${fn}\\,x = ${k}$ bagi $0^\\circ \\le x \\le 360^\\circ$.`), a: T(`$x = ${sols.map((s) => s + '^\\circ').join('$ or $')}$`), sp: 's' };
    },
    (r) => {
      const st = r.pick([
        [T('The amplitude of $y = \\tan x$ is $1$.', 'Amplitud bagi $y = \\tan x$ ialah $1$.'), false],
        [T('$y = \\tan x$ has no amplitude and no maximum or minimum value.', '$y = \\tan x$ tiada amplitud dan tiada nilai maksimum atau minimum.'), true],
        [T('The period of $y = \\sin x$ is $360^\\circ$.', 'Tempoh bagi $y = \\sin x$ ialah $360^\\circ$.'), true],
        [T('The period of $y = \\tan x$ is $360^\\circ$.', 'Tempoh bagi $y = \\tan x$ ialah $360^\\circ$.'), false],
        [T('The graph of $y = \\cos x$ passes through $(0^\\circ, 1)$.', 'Graf $y = \\cos x$ melalui $(0^\\circ, 1)$.'), true],
        [T('The graph of $y = \\sin x$ passes through $(0^\\circ, 1)$.', 'Graf $y = \\sin x$ melalui $(0^\\circ, 1)$.'), false],
        [T('$y = a\\sin bx$ has amplitude $a$ and period $\\dfrac{360^\\circ}{b}$ for $a, b > 0$.', '$y = a\\sin bx$ mempunyai amplitud $a$ dan tempoh $\\dfrac{360^\\circ}{b}$ bagi $a, b > 0$.'), true],
        [T('$y = a\\tan bx$ has period $\\dfrac{180^\\circ}{b}$ for $b > 0$.', '$y = a\\tan bx$ mempunyai tempoh $\\dfrac{180^\\circ}{b}$ bagi $b > 0$.'), true],
        [T('The graph of $y = \\sin x$ is symmetrical about $x = 90^\\circ$ within $0^\\circ \\le x \\le 180^\\circ$.', 'Graf $y = \\sin x$ adalah simetri terhadap $x = 90^\\circ$ dalam $0^\\circ \\le x \\le 180^\\circ$.'), true],
        [T('The graphs of $y = \\sin x$ and $y = \\cos x$ never take the same value in $0^\\circ \\le x \\le 360^\\circ$.', 'Graf $y = \\sin x$ dan $y = \\cos x$ tidak pernah mempunyai nilai yang sama dalam $0^\\circ \\le x \\le 360^\\circ$.'), false],
        [T('The graph of $y = \\tan x$ is a smooth continuous curve for all $x$ from $0^\\circ$ to $360^\\circ$.', 'Graf $y = \\tan x$ ialah lengkung selanjar licin bagi semua $x$ dari $0^\\circ$ hingga $360^\\circ$.'), false],
        [T('Adding a constant $c$ to $y = a\\sin bx$ shifts the whole graph up or down without changing its amplitude or period.', 'Menambah pemalar $c$ pada $y = a\\sin bx$ menganjak keseluruhan graf ke atas atau ke bawah tanpa mengubah amplitud atau tempohnya.'), true],
        [T('The graph of $y = \\cos x$ is a reflection of $y = \\sin x$ in the $x$-axis.', 'Graf $y = \\cos x$ ialah pantulan $y = \\sin x$ pada paksi-$x$.'), false],
      ]);
      return { q: T(`True or false? "${st[0].en}"`, `Benar atau palsu? "${st[0].ms}"`), a: st[1] ? T('True', 'Benar') : T('False', 'Palsu'), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 4), b = r.pick([1, 2, 3]), fn = r.pick(['sin', 'cos']);
      const correct = T(`Amplitude ${a}, period $${360 / b}^\\circ$`, `Amplitud ${a}, tempoh $${360 / b}^\\circ$`);
      const wrong1 = T(`Amplitude ${b}, period $${360 / a}^\\circ$`, `Amplitud ${b}, tempoh $${360 / a}^\\circ$`);
      const wrong2 = T(`Amplitude ${a}, period $${360 * b}^\\circ$`, `Amplitud ${a}, tempoh $${360 * b}^\\circ$`);
      const opts = r.shuffle([correct, wrong1, wrong2]);
      const letters = 'ABC';
      return { q: T(`For $y = ${a}\\${fn}\\,${b === 1 ? '' : b}x$, which option correctly states the amplitude and period? ${opts.map((o, i) => `(${letters[i]}) ${o.en}`).join(', ')}`, `Bagi $y = ${a}\\${fn}\\,${b === 1 ? '' : b}x$, pilihan manakah yang menyatakan amplitud dan tempoh dengan betul? ${opts.map((o, i) => `(${letters[i]}) ${o.ms}`).join(', ')}`), a: T(`(${letters[opts.indexOf(correct)]}) ${correct.en}`, `(${letters[opts.indexOf(correct)]}) ${correct.ms}`), sp: 's' };
    },
    (r) => {
      const ctx = r.pick(TIDECTX), b = r.pick([1, 2, 3]), fn = r.pick(['sin', 'cos']);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} is modelled by $y = \\${fn}\\,${b === 1 ? '' : b}x$. State the period of this cycle.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} dimodelkan oleh $y = \\${fn}\\,${b === 1 ? '' : b}x$. Nyatakan tempoh kitaran ini.`), a: T(`$${360 / b}^\\circ$`), sp: 'xs' };
    },
  ];
  const g62m = [
    (r) => {
      const a = r.int(2, 4), b = r.pick([1, 2, 3]), c = r.int(-3, 3), fn = r.pick(['sin', 'cos']);
      return { q: T(`State the amplitude, period and midline of $y = ${a} \\${fn}\\,${b === 1 ? '' : b}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}$.`, `Nyatakan amplitud, tempoh dan garis tengah bagi $y = ${a} \\${fn}\\,${b === 1 ? '' : b}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}$.`), a: T(`Amplitude ${a}; period $${360 / b}^\\circ$; midline $y = ${c}$; range $[${c - a}, ${c + a}]$`, `Amplitud ${a}; tempoh $${360 / b}^\\circ$; garis tengah $y = ${c}$; julat $[${c - a}, ${c + a}]$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 3), b = r.pick([1, 2]), c = r.int(-2, 2), fn = r.pick(['sin', 'cos']);
      const maxX = fn === 'sin' ? 90 / b : 0, minX = fn === 'sin' ? 270 / b : 180 / b;
      return { q: T(`For $y = ${a} \\${fn}\\,${b === 1 ? '' : b}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}$ over $0^\\circ \\le x \\le 360^\\circ$, state the maximum value and the smallest $x$ at which it occurs, and the minimum value and the smallest $x$ at which it occurs.`, `Bagi $y = ${a} \\${fn}\\,${b === 1 ? '' : b}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}$ dalam $0^\\circ \\le x \\le 360^\\circ$, nyatakan nilai maksimum dan $x$ terkecil apabila ia berlaku, dan nilai minimum dan $x$ terkecil apabila ia berlaku.`), a: T(`Maximum $${a + c}$ at $x = ${maxX}^\\circ$; minimum $${c - a}$ at $x = ${minX}^\\circ$`, `Maksimum $${a + c}$ pada $x = ${maxX}^\\circ$; minimum $${c - a}$ pada $x = ${minX}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const fn = r.pick(['sin', 'cos']), ref = r.pick([30, 45, 60]), sign = r.sign();
      const table = fn === 'sin' ? SIN30 : COS30;
      const valTex = (sign < 0 ? '-' : '') + table[IDX30[ref]];
      const [s1, s2] = twoSolutions(fn, ref, sign);
      return { q: T(`Solve $\\${fn}\\,x = ${valTex}$ for $0^\\circ \\le x \\le 360^\\circ$.`, `Selesaikan $\\${fn}\\,x = ${valTex}$ bagi $0^\\circ \\le x \\le 360^\\circ$.`), a: T(`$x = ${s1}^\\circ$ or $${s2}^\\circ$`, `$x = ${s1}^\\circ$ atau $${s2}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const b = r.int(1, 3), a = r.int(2, 4), fn = r.pick(['sin', 'cos']);
      const kFrac = r.pick([0.5, 0.3]); // strictly between 0 and a (as a fraction of a), avoids tangency
      const count = 2 * b;
      return { q: T(`For $y = ${a}\\${fn}\\,${b === 1 ? '' : b}x$ over $0^\\circ \\le x \\le 360^\\circ$, find the number of solutions of $\\${fn}\\,${b === 1 ? '' : b}x = ${n(round(kFrac, 2))}$ (i.e. the number of times the graph meets the horizontal line $y = ${n(round(a * kFrac, 2))}$).`, `Bagi $y = ${a}\\${fn}\\,${b === 1 ? '' : b}x$ dalam $0^\\circ \\le x \\le 360^\\circ$, cari bilangan penyelesaian bagi $\\${fn}\\,${b === 1 ? '' : b}x = ${n(round(kFrac, 2))}$ (iaitu bilangan kali graf itu bertemu garis mengufuk $y = ${n(round(a * kFrac, 2))}$).`), a: T(`${count} (one period contains 2 solutions for $0 < |\\${fn}\\,${b === 1 ? '' : b}x| < 1$, and there are ${b} periods in $360^\\circ$)`, `${count} (satu tempoh mengandungi 2 penyelesaian bagi $0 < |\\${fn}\\,${b === 1 ? '' : b}x| < 1$, dan terdapat ${b} tempoh dalam $360^\\circ$)`), sp: 'm' };
    },
    (r) => {
      const b = r.pick([1, 2, 3]);
      const asymp = 90 / b;
      return { q: T(`State the period of $y = \\tan\\,${b === 1 ? '' : b}x$ and the smallest positive value of $x$ at which the graph has an asymptote (the function is not defined there).`, `Nyatakan tempoh bagi $y = \\tan\\,${b === 1 ? '' : b}x$ dan nilai positif $x$ terkecil apabila graf itu mempunyai asimptot (fungsi itu tidak ditakrifkan di situ).`), a: T(`Period $${180 / b}^\\circ$; first asymptote at $x = ${n(asymp)}^\\circ$`, `Tempoh $${180 / b}^\\circ$; asimptot pertama pada $x = ${n(asymp)}^\\circ$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 4), b = r.pick([2, 3, 4]);
      const wrongPeriod = 360 * b;
      const rightPeriod = 360 / b;
      return { q: T(`A student says: "For $y = ${a}\\sin\\,${b}x$, the period is $360 \\times ${b} = ${wrongPeriod}^\\circ$." Explain the error and give the correct period.`, `Seorang murid berkata: "Bagi $y = ${a}\\sin\\,${b}x$, tempohnya ialah $360 \\times ${b} = ${wrongPeriod}^\\circ$." Terangkan kesilapan itu dan berikan tempoh yang betul.`), a: T(`The period formula is $360^\\circ \\div b$, not $360^\\circ \\times b$; correct period $= 360 \\div ${b} = ${rightPeriod}^\\circ$.`, `Formula tempoh ialah $360^\\circ \\div b$, bukan $360^\\circ \\times b$; tempoh yang betul $= 360 \\div ${b} = ${rightPeriod}^\\circ$.`), sp: 'm' };
    },
    (r) => {
      const ctx = r.pick(TIDECTX), a = r.int(2, 6), c = r.int(a + 1, a + 10), b = r.pick([1, 2]), fn = r.pick(['sin', 'cos']);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} over a day is modelled by $y = ${a}\\${fn}\\,${b === 1 ? '' : b}x + ${c}$, where $x^\\circ$ represents time. Find the maximum and minimum values of $y$, and the period of the cycle.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} sepanjang sehari dimodelkan oleh $y = ${a}\\${fn}\\,${b === 1 ? '' : b}x + ${c}$, dengan $x^\\circ$ mewakili masa. Cari nilai maksimum dan minimum $y$, dan tempoh kitaran itu.`), a: T(`Maximum $${a + c}$; minimum $${c - a}$; period $${360 / b}^\\circ$`, `Maksimum $${a + c}$; minimum $${c - a}$; tempoh $${360 / b}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 3), b = r.pick([1, 2]), fn = r.pick(['sin', 'cos']);
      const fig = trigFig(fn, a, b, 0);
      return { q: T(`The graph shows $y = a\\${fn}\\,bx$ for $0^\\circ \\le x \\le 360^\\circ$, for positive integers $a$ and $b$. Read the maximum value and the number of complete cycles shown to find $a$ and $b$.`, `Graf menunjukkan $y = a\\${fn}\\,bx$ bagi $0^\\circ \\le x \\le 360^\\circ$, dengan $a$ dan $b$ integer positif. Baca nilai maksimum dan bilangan kitaran lengkap yang ditunjukkan untuk mencari $a$ dan $b$.`), fig, a: T(`$a = ${a}$, $b = ${b}$`), sp: 'm' };
    },
    (r) => {
      const ctx = r.pick(TIDECTX), fn = r.pick(['sin', 'cos']), ref = r.pick([30, 45, 60]), sign = r.sign();
      const table = fn === 'sin' ? SIN30 : COS30;
      const valTex = (sign < 0 ? '-' : '') + table[IDX30[ref]];
      const [s1, s2] = twoSolutions(fn, ref, sign);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} is modelled by $y = \\${fn}\\,x$ for $0^\\circ \\le x \\le 360^\\circ$. Find the value(s) of $x$ at which $y = ${valTex}$.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} dimodelkan oleh $y = \\${fn}\\,x$ bagi $0^\\circ \\le x \\le 360^\\circ$. Cari nilai $x$ apabila $y = ${valTex}$.`), a: T(`$x = ${s1}^\\circ$ or $${s2}^\\circ$`, `$x = ${s1}^\\circ$ atau $${s2}^\\circ$`), sp: 'm' };
    },
    (r) => {
      const ctx = r.pick(TIDECTX), a = r.int(2, 4), b = r.pick([2, 3, 4]), fn = r.pick(['sin', 'cos']);
      const wrongPeriod = 360 * b;
      const rightPeriod = 360 / b;
      return { q: T(`In modelling ${ctx.en}, a student writes $y = ${a}\\${fn}\\,${b}x$ and claims the period is $360 \\times ${b} = ${wrongPeriod}^\\circ$. Explain the error and give the correct period.`, `Dalam memodelkan ${ctx.ms}, seorang murid menulis $y = ${a}\\${fn}\\,${b}x$ dan mendakwa tempohnya ialah $360 \\times ${b} = ${wrongPeriod}^\\circ$. Terangkan kesilapan itu dan berikan tempoh yang betul.`), a: T(`The period formula is $360^\\circ \\div b$, not $360^\\circ \\times b$; correct period $= 360 \\div ${b} = ${rightPeriod}^\\circ$.`, `Formula tempoh ialah $360^\\circ \\div b$, bukan $360^\\circ \\times b$; tempoh yang betul $= 360 \\div ${b} = ${rightPeriod}^\\circ$.`), sp: 'm' };
    },
  ];
  const g62a = [
    (r) => {
      const a = r.int(2, 4), b = r.pick([1, 2, 3]), c = r.int(0, 2), fn = r.pick(['sin', 'cos']);
      const fig = trigFig(fn, a, b, c);
      return { q: T(`The graph is of the form $y = a \\, \\${fn}\\,(bx) + c$, where $a$, $b$, $c$ are positive integers or $c = 0$. Use the maximum, the minimum and the period to find $a$, $b$ and $c$.`, `Graf itu berbentuk $y = a \\, \\${fn}\\,(bx) + c$, dengan $a$, $b$, $c$ integer positif atau $c = 0$. Gunakan nilai maksimum, minimum dan tempoh untuk mencari $a$, $b$ dan $c$.`), fig, a: T(`Maximum ${a + c}, minimum ${c - a}: $a = ${a}$, $c = ${c}$; period $${360 / b}^\\circ$ so $b = ${b}$`, `Maksimum ${a + c}, minimum ${c - a}: $a = ${a}$, $c = ${c}$; tempoh $${360 / b}^\\circ$ jadi $b = ${b}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 4), c = r.int(-3, 3), fn = r.pick(['sin', 'cos']), ref = r.pick([30, 45, 60]), sign = r.sign();
      const table = fn === 'sin' ? SIN30 : COS30;
      const tableNum = { 30: 0.5, 45: Math.SQRT2 / 2, 60: Math.sqrt(3) / 2 }[ref];
      const kNum = a * sign * tableNum + c;
      const [s1, s2] = twoSolutions(fn, ref, sign);
      return { q: T(`Solve $${a}\\${fn}\\,x + ${c} = ${n(round(kNum, 4))}$ for $0^\\circ \\le x \\le 360^\\circ$.`, `Selesaikan $${a}\\${fn}\\,x + ${c} = ${n(round(kNum, 4))}$ bagi $0^\\circ \\le x \\le 360^\\circ$.`), a: T(`$\\${fn}\\,x = ${(sign < 0 ? '-' : '') + table[IDX30[ref]]}$; $x = ${s1}^\\circ$ or $${s2}^\\circ$`, `$\\${fn}\\,x = ${(sign < 0 ? '-' : '') + table[IDX30[ref]]}$; $x = ${s1}^\\circ$ atau $${s2}^\\circ$`), w: T(`Subtract ${c}, divide by ${a}: $\\${fn}\\,x = \\dfrac{${n(round(kNum, 4))} - (${c})}{${a}}$`, `Tolak ${c}, bahagi dengan ${a}: $\\${fn}\\,x = \\dfrac{${n(round(kNum, 4))} - (${c})}{${a}}$`), sp: 'm' };
    },
    (r) => {
      const b = r.pick([1, 2, 3]), fn = r.pick(['sin', 'cos']);
      const count = 4 * b;
      return { q: T(`For $y = \\${fn}\\,${b === 1 ? '' : b}x$ over $0^\\circ \\le x \\le 720^\\circ$, find the number of solutions of $\\${fn}\\,${b === 1 ? '' : b}x = 0.4$.`, `Bagi $y = \\${fn}\\,${b === 1 ? '' : b}x$ dalam $0^\\circ \\le x \\le 720^\\circ$, cari bilangan penyelesaian bagi $\\${fn}\\,${b === 1 ? '' : b}x = 0.4$.`), a: T(`${count} (period $${360 / b}^\\circ$, so $720 \\div ${360 / b} = ${(720 * b) / 360}$ periods in the range; each period gives 2 solutions for $0 < 0.4 < 1$, so $2 \\times ${(720 * b) / 360} = ${count}$)`, `${count} (tempoh $${360 / b}^\\circ$, jadi $720 \\div ${360 / b} = ${(720 * b) / 360}$ tempoh dalam julat itu; setiap tempoh memberi 2 penyelesaian kerana $0 < 0.4 < 1$, jadi $2 \\times ${(720 * b) / 360} = ${count}$)`), sp: 'm' };
    },
    (r) => {
      const b = r.pick([1, 2, 3]);
      const asymps = [];
      for (let k = 0; ; k++) { const xa = (90 + 180 * k) / b; if (xa > 360) break; asymps.push(xa); }
      return { q: T(`List all the values of $x$ from $0^\\circ$ to $360^\\circ$ at which $y = \\tan\\,${b === 1 ? '' : b}x$ has an asymptote.`, `Senaraikan semua nilai $x$ dari $0^\\circ$ hingga $360^\\circ$ di mana $y = \\tan\\,${b === 1 ? '' : b}x$ mempunyai asimptot.`), a: T(`$x = ${asymps.map((v) => n(v) + '^\\circ').join(', ')}$`), w: T(`Asymptotes at $${b === 1 ? '' : b}x = 90^\\circ + 180^\\circ n$`, `Asimptot pada $${b === 1 ? '' : b}x = 90^\\circ + 180^\\circ n$`), sp: 'm' };
    },
    (r) => {
      const feats = r.pick([{ a: 3, b: 1, fn: 'sin' }, { a: 2, b: 2, fn: 'cos' }, { a: 4, b: 1, fn: 'cos' }, { a: 2, b: 3, fn: 'sin' }]);
      const correct = T(`$y = ${feats.a}\\${feats.fn}\\,${feats.b === 1 ? '' : feats.b}x$`, `$y = ${feats.a}\\${feats.fn}\\,${feats.b === 1 ? '' : feats.b}x$`);
      const wrong1 = T(`$y = ${feats.b}\\${feats.fn}\\,${feats.a}x$`, `$y = ${feats.b}\\${feats.fn}\\,${feats.a}x$`);
      const wrong2 = T(`$y = ${feats.a}\\${feats.fn === 'sin' ? 'cos' : 'sin'}\\,${feats.b === 1 ? '' : feats.b}x$`, `$y = ${feats.a}\\${feats.fn === 'sin' ? 'cos' : 'sin'}\\,${feats.b === 1 ? '' : feats.b}x$`);
      const opts = r.shuffle([correct, wrong1, wrong2]);
      const letters = 'ABC';
      return { q: T(`A graph has maximum value $${feats.a}$, minimum value $${-feats.a}$, period $${360 / feats.b}^\\circ$, and passes through $(0^\\circ, ${feats.fn === 'cos' ? feats.a : 0})$. Which equation matches? ${opts.map((o, i) => `(${letters[i]}) ${o.en}`).join(', ')}`, `Satu graf mempunyai nilai maksimum $${feats.a}$, nilai minimum $${-feats.a}$, tempoh $${360 / feats.b}^\\circ$, dan melalui $(0^\\circ, ${feats.fn === 'cos' ? feats.a : 0})$. Persamaan manakah yang sepadan? ${opts.map((o, i) => `(${letters[i]}) ${o.ms}`).join(', ')}`), a: T(`(${letters[opts.indexOf(correct)]}) ${correct.en}`, `(${letters[opts.indexOf(correct)]}) ${correct.ms}`), sp: 's' };
    },
    (r) => {
      const ctx = r.pick(TIDECTX), b = r.pick([1, 2, 3]), fn = r.pick(['sin', 'cos']);
      const count = 4 * b;
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} is modelled by $y = \\${fn}\\,${b === 1 ? '' : b}x$ over an extended period $0^\\circ \\le x \\le 720^\\circ$. Find the number of times $y = 0.4$.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} dimodelkan oleh $y = \\${fn}\\,${b === 1 ? '' : b}x$ sepanjang tempoh lanjutan $0^\\circ \\le x \\le 720^\\circ$. Cari bilangan kali $y = 0.4$.`), a: T(`${count} (period $${360 / b}^\\circ$, so $720 \\div ${360 / b} = ${(720 * b) / 360}$ periods in the range, each giving 2 solutions)`, `${count} (tempoh $${360 / b}^\\circ$, jadi $720 \\div ${360 / b} = ${(720 * b) / 360}$ tempoh dalam julat itu, setiap satu memberi 2 penyelesaian)`), sp: 'm' };
    },
    (r) => {
      const ctx = r.pick(TIDECTX), a = r.int(3, 6), c = r.int(a + 2, a + 10);
      const ref = r.pick([30, 45, 60]);
      const table = COS30;
      const tableNum = { 30: 0.5, 45: Math.SQRT2 / 2, 60: Math.sqrt(3) / 2 }[ref];
      const target = round(c - a * tableNum, 2);
      const [s1, s2] = twoSolutions('cos', ref, -1);
      return { q: T(`${ctx.en[0].toUpperCase()}${ctx.en.slice(1)} is modelled by $y = ${a}\\cos\\,x + ${c}$ for $0^\\circ \\le x \\le 360^\\circ$, where $x^\\circ$ represents time. Find the value(s) of $x$ at which $y = ${n(target)}$.`, `${ctx.ms[0].toUpperCase()}${ctx.ms.slice(1)} dimodelkan oleh $y = ${a}\\cos\\,x + ${c}$ bagi $0^\\circ \\le x \\le 360^\\circ$, dengan $x^\\circ$ mewakili masa. Cari nilai $x$ apabila $y = ${n(target)}$.`), a: T(`$\\cos\\,x = -${table[IDX30[ref]]}$; $x = ${s1}^\\circ$ or $${s2}^\\circ$`, `$\\cos\\,x = -${table[IDX30[ref]]}$; $x = ${s1}^\\circ$ atau $${s2}^\\circ$`), w: T(`$${a}\\cos\\,x = ${n(target)} - ${c}$`, `$${a}\\cos\\,x = ${n(target)} - ${c}$`), sp: 'l' };
    },
    (r) => ({ q: T('Explain why it does not make sense to ask for the amplitude or the maximum value of $y = \\tan x$.', 'Terangkan mengapa tidak masuk akal untuk bertanya tentang amplitud atau nilai maksimum bagi $y = \\tan x$.'), a: T('Unlike sine and cosine, $\\tan x$ is not bounded: as $x$ approaches $90^\\circ$ (or $270^\\circ$) the value of $\\tan x$ increases (or decreases) without bound, so the graph has no highest or lowest point and no fixed distance from a midline — amplitude and maximum/minimum have no meaning for tangent.', 'Tidak seperti sinus dan kosinus, $\\tan x$ tidak terbatas: apabila $x$ menghampiri $90^\\circ$ (atau $270^\\circ$) nilai $\\tan x$ meningkat (atau menurun) tanpa had, jadi graf itu tiada titik tertinggi atau terendah dan tiada jarak tetap daripada garis tengah — amplitud dan maksimum/minimum tidak bermakna bagi tangen.'), sp: 'm' }),
  ];
  SPM.extend('F5-6.2', { e: g62e, m: g62m, a: g62a });
})();
