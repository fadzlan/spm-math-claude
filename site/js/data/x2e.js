/* Variety pack x2e: extra generators for F2-8.1, 8.2, 8.3 (Graphs of Functions) and F2-9.1, 9.1E, 9.2 (Speed and Acceleration). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, poly, lin, round, gcd } = SPM;
  const T = SPM.L, S = SPM.svg, P = SPM.parts, cap = SPM.cap, par = SPM.par;
  const TT = (a) => T(a[0], a[1]);
  const TB = (rows, o) => SPM.table(rows, Object.assign({ rowHead: true }, o));
  const dfr = (a, b) => `\\dfrac{${a}}{${b}}`;
  const sg = (b) => (b < 0 ? `- ${n(-b)}` : `+ ${n(b)}`);
  const pv = (v) => (v < 0 ? `(${n(v)})` : n(v));
  const setTex = (a) => `\\{${a.join(',\\ ')}\\}`;
  const pairTex = (ps) => setTex(ps.map((p) => `(${p[0]},\\ ${p[1]})`));
  const isInt = Number.isInteger;

  /* ---- function rules shared by chapter 8 (kind -> tex body, evaluator, substituted form) ---- */
  function mkRule(r, kinds, o) {
    o = o || {};
    const kind = r.pick(kinds);
    const a = r.pick([2, 3, 4, 5, -2, -3, 6, -4]), b = r.nz(-9, 9);
    const k = r.pick([4, 6, 8, 12, 16, 18, 24, -6, -8, -12, 36]);
    const sq = (v) => v * v;
    let R;
    switch (kind) {
      case 'ax': R = { t: lin(a, 0), f: (x) => a * x, s: (v) => `${a} \\times ${pv(v)}`, one: 1 }; break;
      case 'x+b': R = { t: lin(1, b), f: (x) => x + b, s: (v) => `${pv(v)} ${sg(b)}`, one: 1 }; break;
      case 'ax+b': R = { t: lin(a, b), f: (x) => a * x + b, s: (v) => `${a} \\times ${pv(v)} ${sg(b)}`, one: 1 }; break;
      case 'b-ax': { const c = Math.abs(a); R = { t: lin(-c, b), f: (x) => b - c * x, s: (v) => `${b} - ${c} \\times ${pv(v)}`, one: 1 }; break; }
      case 'x2': R = { t: 'x^2', f: sq, s: (v) => `${pv(v)}^2`, sqr: 1 }; break;
      case 'ax2': R = { t: poly([[a, 'x^2']]), f: (x) => a * sq(x), s: (v) => `${a} \\times ${pv(v)}^2`, sqr: 1 }; break;
      case 'x2+b': R = { t: poly([[1, 'x^2'], [b, '']]), f: (x) => sq(x) + b, s: (v) => `${pv(v)}^2 ${sg(b)}`, sqr: 1 }; break;
      case 'ax2+b': R = { t: poly([[a, 'x^2'], [b, '']]), f: (x) => a * sq(x) + b, s: (v) => `${a} \\times ${pv(v)}^2 ${sg(b)}`, sqr: 1 }; break;
      case 'x3': R = { t: 'x^3', f: (x) => x * x * x, s: (v) => `${pv(v)}^3`, one: 1 }; break;
      case 'ax3': R = { t: poly([[a, 'x^3']]), f: (x) => a * x * x * x, s: (v) => `${a} \\times ${pv(v)}^3`, one: 1 }; break;
      case 'k/x': R = { t: (k < 0 ? '-' : '') + dfr(Math.abs(k), 'x'), f: (x) => k / x, s: (v) => dfr(k, v), pole: 1, one: 1 }; break;
      case 'k/x2': R = { t: (k < 0 ? '-' : '') + dfr(Math.abs(k), 'x^2'), f: (x) => k / (x * x), s: (v) => dfr(k, `${pv(v)}^2`), pole: 1, sqr: 1 }; break;
      default: throw new Error('rule ' + kind);
    }
    R.kind = kind;
    R.xs = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].filter((x) => !(x === 0 && R.pole) && isInt(R.f(x)) && Math.abs(R.f(x)) <= 60);
    return R;
  }
  const domNote = (R) => (R.pole ? T(', $x \\ne 0$') : T(''));

  /* ---- relations: pairs, classification, arrow diagrams ---- */
  const cls = (pairs) => {
    const m = new Map();
    for (const [x, y] of pairs) { if (m.has(x) && m.get(x) !== y) return 'none'; m.set(x, y); }
    const ys = [...m.values()];
    return new Set(ys).size === ys.length ? 'one' : 'many';
  };
  const CN = {
    one: T('a one-to-one function', 'fungsi satu dengan satu'),
    many: T('a many-to-one function', 'fungsi banyak dengan satu'),
    none: T('not a function', 'bukan fungsi'),
  };
  const CN2 = {
    one: T('a function (one-to-one)', 'fungsi (satu dengan satu)'),
    many: T('a function (many-to-one)', 'fungsi (banyak dengan satu)'),
    none: T('not a function', 'bukan fungsi'),
  };
  /** why: reason text for the classification of `pairs` */
  function why(pairs, c) {
    if (c === 'none') {
      for (const p of pairs) for (const q of pairs) if (p[0] === q[0] && p[1] !== q[1]) return T(`the input ${p[0]} is paired with two different outputs, ${p[1]} and ${q[1]}`, `input ${p[0]} dipadankan dengan dua output yang berbeza, ${p[1]} dan ${q[1]}`);
    }
    if (c === 'many') {
      for (const p of pairs) for (const q of pairs) if (p[0] !== q[0] && p[1] === q[1]) return T(`every input has exactly one output, but the inputs ${p[0]} and ${q[0]} share the same output ${p[1]}`, `setiap input mempunyai tepat satu output, tetapi input ${p[0]} dan ${q[0]} berkongsi output yang sama, iaitu ${p[1]}`);
    }
    return T('every input has exactly one output and different inputs give different outputs', 'setiap input mempunyai tepat satu output dan input yang berbeza memberikan output yang berbeza');
  }
  /** random relation of the wanted class: n distinct inputs from xs, outputs from ys */
  function genPairs(r, c, count, xLo, xHi, yLo, yHi) {
    const xs = r.distinct(count, xLo, xHi).sort((a, b) => a - b);
    let ys;
    if (c === 'one') ys = r.distinct(count, yLo, yHi);
    else { ys = r.distinct(count - 1, yLo, yHi); ys.push(r.pick(ys)); ys = r.shuffle(ys); }
    let pairs = xs.map((x, i) => [x, ys[i]]);
    if (c === 'none') { const i = r.int(0, count - 1); let y2; do y2 = r.int(yLo, yHi); while (y2 === pairs[i][1]); pairs.push([pairs[i][0], y2]); }
    need(cls(pairs) === c);
    return pairs;
  }
  const arrowFig = (pairs, xsL, ysL) => {
    xsL = xsL || [...new Set(pairs.map((p) => p[0]))];
    ysL = ysL || [...new Set(pairs.map((p) => p[1]))];
    const rows = Math.max(xsL.length, ysL.length), H = rows * 28 + 46, W = 250;
    const pos = (i, len) => 34 + (rows - len) * 14 + i * 28 + 8;
    let o = S.text(58, 12, 'Input', { s: 11 }) + S.text(192, 12, 'Output', { s: 11 });
    o += `<ellipse cx="58" cy="${H / 2 + 8}" rx="34" ry="${H / 2 - 14}"/><ellipse cx="192" cy="${H / 2 + 8}" rx="34" ry="${H / 2 - 14}"/>`;
    xsL.forEach((x, i) => (o += S.text(58, pos(i, xsL.length), String(x), { s: 12 })));
    ysL.forEach((y, i) => (o += S.text(192, pos(i, ysL.length), String(y), { s: 12 })));
    for (const [x, y] of pairs) o += S.arrow(76, pos(xsL.indexOf(x), xsL.length), 172, pos(ysL.indexOf(y), ysL.length), { w: 1.1 });
    return S.wrap(W, H, o, 'arrow diagram');
  };
  const tblPairs = (pairs, xl, yl) => TB([[xl || '$x$', ...pairs.map((p) => p[0])], [yl || '$y$', ...pairs.map((p) => p[1])]]);
  const blanks = (xs, xl, yl) => TB([[xl || '$x$', ...xs.map((x) => `$${x}$`)], [yl || '$y$', ...xs.map(() => '&nbsp;&nbsp;&nbsp;&nbsp;')]]);
  const valsTable = (xs, ys, xl, yl) => TB([[xl || '$x$', ...xs.map((x) => `$${x}$`)], [yl || '$y$', ...ys.map((y) => (y === null ? '' : `$${n(y)}$`))]]);
  const listTex = (xs, f) => xs.map((x) => n(f ? f(x) : x)).join(',\\ ');
  const yesno = (b) => (b ? T('Yes', 'Ya') : T('No', 'Tidak'));

  /* =============================================== F2-8.1 Functions */
  const Rt = (R) => R.t + (R.pole ? ',\\ x \\ne 0' : '');
  const REL = [
    ['each pupil in Form 2 $\\to$ his or her birth month', 'setiap murid Tingkatan 2 $\\to$ bulan kelahirannya', 'many'],
    ['each country $\\to$ its capital city', 'setiap negara $\\to$ ibu negaranya', 'one'],
    ['each person $\\to$ his or her biological mother', 'setiap orang $\\to$ ibu kandungnya', 'many'],
    ['each mother $\\to$ her children', 'setiap ibu $\\to$ anak-anaknya', 'none'],
    ['each pupil $\\to$ the subjects he or she studies', 'setiap murid $\\to$ mata pelajaran yang diambilnya', 'none'],
    ['each registered car $\\to$ its registration plate number', 'setiap kereta berdaftar $\\to$ nombor plat pendaftarannya', 'one'],
    ['each polygon $\\to$ its number of sides', 'setiap poligon $\\to$ bilangan sisinya', 'many'],
    ['each month of a non-leap year $\\to$ its number of days', 'setiap bulan dalam tahun bukan lompat $\\to$ bilangan harinya', 'many'],
    ['each citizen $\\to$ his or her identity card number', 'setiap warganegara $\\to$ nombor kad pengenalannya', 'one'],
    ['each whole number $\\to$ its double', 'setiap nombor bulat $\\to$ gandaan duanya', 'one'],
    ['each integer $\\to$ its square', 'setiap integer $\\to$ kuasa duanya', 'many'],
    ['each number $\\to$ its factors', 'setiap nombor $\\to$ faktornya', 'none'],
    ['each whole number $\\to$ the remainder when it is divided by 3', 'setiap nombor bulat $\\to$ baki apabila dibahagikan dengan 3', 'many'],
    ['each pupil in a class $\\to$ the class he or she belongs to', 'setiap murid dalam sebuah sekolah $\\to$ kelas yang disertainya', 'many'],
    ['each day of the week $\\to$ the first letter of its English name', 'setiap hari dalam seminggu $\\to$ huruf pertama nama Inggerisnya', 'many'],
    ['each Malaysian state $\\to$ its state capital', 'setiap negeri di Malaysia $\\to$ ibu negerinya', 'one'],
    ['each positive integer $\\to$ its multiples', 'setiap integer positif $\\to$ gandaannya', 'none'],
    ['each number $\\to$ the number 5 more than it', 'setiap nombor $\\to$ nombor yang lebih 5 daripadanya', 'one'],
  ];
  const TF = [
    ['In a function, every input has exactly one output.', 'Dalam suatu fungsi, setiap input mempunyai tepat satu output.', 1, 'This is the definition of a function.', 'Inilah takrif suatu fungsi.'],
    ['A relation in which one input has two different outputs is still a function.', 'Suatu hubungan yang satu inputnya mempunyai dua output berbeza masih ialah fungsi.', 0, 'A function gives exactly one output for each input, so this is not a function.', 'Fungsi memberikan tepat satu output bagi setiap input, jadi ini bukan fungsi.'],
    ['If two different inputs give the same output, the relation is not a function.', 'Jika dua input berbeza memberikan output yang sama, hubungan itu bukan fungsi.', 0, 'It is still a function (a many-to-one function); only one input with two outputs breaks the rule.', 'Ia masih fungsi (fungsi banyak dengan satu); hanya satu input yang mempunyai dua output melanggar syarat itu.'],
    ['In a one-to-one function, different inputs always give different outputs.', 'Dalam fungsi satu dengan satu, input yang berbeza sentiasa memberikan output yang berbeza.', 1, 'That is what one-to-one means.', 'Itulah maksud satu dengan satu.'],
    ['In an arrow diagram of a function, two arrows may leave the same input.', 'Dalam rajah anak panah suatu fungsi, dua anak panah boleh bermula daripada input yang sama.', 0, 'Two arrows from one input would give it two outputs.', 'Dua anak panah daripada satu input bermakna input itu mempunyai dua output.'],
    ['In an arrow diagram of a function, two arrows may arrive at the same output.', 'Dalam rajah anak panah suatu fungsi, dua anak panah boleh sampai pada output yang sama.', 1, 'That gives a many-to-one function, which is still a function.', 'Itu memberikan fungsi banyak dengan satu, yang masih ialah fungsi.'],
    ['The vertical line test can decide whether a graph is one-to-one or many-to-one.', 'Ujian garis mencancang boleh menentukan sama ada suatu graf ialah satu dengan satu atau banyak dengan satu.', 0, 'The vertical line test only shows whether the graph is a function; a horizontal line is used for one-to-one or many-to-one.', 'Ujian garis mencancang hanya menunjukkan sama ada graf itu suatu fungsi; garis mengufuk digunakan untuk satu dengan satu atau banyak dengan satu.'],
    ['A graph that is crossed twice by a vertical line does not represent a function.', 'Graf yang dipotong dua kali oleh garis mencancang tidak mewakili suatu fungsi.', 1, 'The two crossing points have the same input but different outputs.', 'Dua titik pemotongan itu mempunyai input yang sama tetapi output yang berbeza.'],
    ['Every relation is a function.', 'Setiap hubungan ialah fungsi.', 0, 'Some relations give one input more than one output.', 'Sesetengah hubungan memberikan lebih daripada satu output bagi satu input.'],
    ['Every one-to-one function is also a function.', 'Setiap fungsi satu dengan satu juga ialah fungsi.', 1, 'One-to-one is a special kind of function.', 'Satu dengan satu ialah sejenis fungsi yang khas.'],
    ['The rule $y = \\dfrac{1}{x}$ gives an output for every input, including $x = 0$.', 'Peraturan $y = \\dfrac{1}{x}$ memberikan output bagi setiap input, termasuk $x = 0$.', 0, '$\\dfrac{1}{0}$ is not defined, so $x = 0$ has no output.', '$\\dfrac{1}{0}$ tidak ditakrifkan, jadi $x = 0$ tidak mempunyai output.'],
    ['The function $f(x) = x^2$ is many-to-one when negative and positive inputs are allowed.', 'Fungsi $f(x) = x^2$ ialah banyak dengan satu apabila input negatif dan positif dibenarkan.', 1, 'For example $f(-2) = f(2) = 4$.', 'Contohnya $f(-2) = f(2) = 4$.'],
    ['The rule $y = 2x + 1$ is a one-to-one function.', 'Peraturan $y = 2x + 1$ ialah fungsi satu dengan satu.', 1, 'Different values of $x$ always give different values of $2x + 1$.', 'Nilai $x$ yang berbeza sentiasa memberikan nilai $2x + 1$ yang berbeza.'],
    ['A many-to-one function has at least one output that comes from more than one input.', 'Fungsi banyak dengan satu mempunyai sekurang-kurangnya satu output yang datang daripada lebih daripada satu input.', 1, 'That is what many-to-one means.', 'Itulah maksud banyak dengan satu.'],
    ['A function must have the same number of different outputs as different inputs.', 'Suatu fungsi mesti mempunyai bilangan output berbeza yang sama dengan bilangan input berbeza.', 0, 'That is true only for a one-to-one function; a many-to-one function has fewer different outputs.', 'Itu benar bagi fungsi satu dengan satu sahaja; fungsi banyak dengan satu mempunyai lebih sedikit output berbeza.'],
    ['The rule $y = x^3$ is a one-to-one function.', 'Peraturan $y = x^3$ ialah fungsi satu dengan satu.', 1, 'Different inputs always give different cubes, for example $2^3 = 8$ and $(-2)^3 = -8$.', 'Input yang berbeza sentiasa memberikan kuasa tiga yang berbeza, contohnya $2^3 = 8$ dan $(-2)^3 = -8$.'],
  ];
  const WORDR = [
    ['add 5 to the input', 'tambah 5 kepada input', (v) => v + 5, 'x + 5'],
    ['subtract 3 from the input', 'tolak 3 daripada input', (v) => v - 3, 'x - 3'],
    ['multiply the input by 4', 'darab input dengan 4', (v) => 4 * v, '4x'],
    ['multiply the input by 3 and then add 1', 'darab input dengan 3 kemudian tambah 1', (v) => 3 * v + 1, '3x + 1'],
    ['multiply the input by 2 and then subtract 5', 'darab input dengan 2 kemudian tolak 5', (v) => 2 * v - 5, '2x - 5'],
    ['square the input', 'kuasa duakan input', (v) => v * v, 'x^2'],
    ['square the input and then add 2', 'kuasa duakan input kemudian tambah 2', (v) => v * v + 2, 'x^2 + 2'],
    ['subtract the input from 10', 'tolak input daripada 10', (v) => 10 - v, '10 - x'],
    ['double the input and then add 7', 'gandakan input kemudian tambah 7', (v) => 2 * v + 7, '2x + 7'],
    ['cube the input', 'kuasa tigakan input', (v) => v * v * v, 'x^3'],
  ];
  const CLOZE = [
    ['A relation in which each input has exactly ____ output is called a ____.', 'Hubungan yang setiap inputnya mempunyai tepat ____ output dipanggil ____.', 'one; function', 'satu; fungsi'],
    ['If different inputs always give different outputs, the function is ____-to-____.', 'Jika input yang berbeza sentiasa memberikan output yang berbeza, fungsi itu ialah ____ dengan ____.', 'one; one', 'satu; satu'],
    ['If two or more inputs share one output, the function is called ____-to-____.', 'Jika dua atau lebih input berkongsi satu output, fungsi itu dipanggil ____ dengan ____.', 'many; one', 'banyak; satu'],
    ['In $y = 5x$, $x$ is the ____ and $y$ is the ____.', 'Dalam $y = 5x$, $x$ ialah ____ dan $y$ ialah ____.', 'input; output', 'input; output'],
    ['In an arrow diagram, a relation is not a function if some input has more than ____ arrow.', 'Dalam rajah anak panah, suatu hubungan bukan fungsi jika ada input yang mempunyai lebih daripada ____ anak panah.', 'one', 'satu'],
    ['A graph represents a function if every ____ line meets the graph at most once.', 'Graf mewakili suatu fungsi jika setiap garis ____ bertemu graf paling banyak sekali.', 'vertical', 'mencancang'],
    ['For $f(x) = 3x$, the input 4 has the output ____.', 'Bagi $f(x) = 3x$, input 4 mempunyai output ____.', '$12$', '$12$'],
    ['The relation "each pupil $\\to$ his or her IC number" is ____-to-____.', 'Hubungan "setiap murid $\\to$ nombor kad pengenalannya" ialah ____ dengan ____.', 'one; one', 'satu; satu'],
  ];
  const GRAPHS = (() => {
    const W = (extra) => S.plane(Object.assign({ x: [-5, 5], y: [-5, 5], scale: 20, labelStep: 1 }, extra));
    const circ = []; for (let i = 0; i <= 48; i++) circ.push([3 * Math.cos((i / 48) * 2 * Math.PI), 3 * Math.sin((i / 48) * 2 * Math.PI)]);
    const side = []; for (let t = -2.2; t <= 2.21; t += 0.11) side.push([t * t - 2, t]);
    const vee = [[-4, 4], [0, 0], [4, 4]];
    return [
      { fig: () => W({ lines: [{ m: 1, c: 1 }] }), fn: 1, one: 1, en: 'a straight line sloping upwards', ms: 'garis lurus yang condong ke atas' },
      { fig: () => W({ curves: [{ f: (x) => 0.5 * x * x - 3, from: -4.5, to: 4.5 }] }), fn: 1, one: 0, en: 'a parabola opening upwards', ms: 'parabola yang terbuka ke atas' },
      { fig: () => W({ curves: [{ f: (x) => x * x * x / 6, from: -4, to: 4 }] }), fn: 1, one: 1, en: 'a cubic curve', ms: 'lengkung kubik' },
      { fig: () => W({ curves: [{ f: (x) => 4 / x, from: -5, to: -0.5 }, { f: (x) => 4 / x, from: 0.5, to: 5 }] }), fn: 1, one: 1, en: 'a curve with two separate branches', ms: 'lengkung dengan dua cabang yang terpisah' },
      { fig: () => W({ polys: [{ p: side, open: true }] }), fn: 0, one: 0, en: 'a parabola opening to the right', ms: 'parabola yang terbuka ke kanan' },
      { fig: () => W({ polys: [{ p: circ, open: true }] }), fn: 0, one: 0, en: 'a circle', ms: 'bulatan' },
      { fig: () => W({ polys: [{ p: vee, open: true }] }), fn: 1, one: 0, en: 'a V-shaped graph', ms: 'graf berbentuk V' },
      { fig: () => W({ lines: [{ m: -2, c: 0 }] }), fn: 1, one: 1, en: 'a straight line through the origin sloping downwards', ms: 'garis lurus melalui asalan yang condong ke bawah' },
      { fig: () => W({ curves: [{ f: (x) => -0.4 * x * x + 3, from: -4, to: 4 }] }), fn: 1, one: 0, en: 'a parabola opening downwards', ms: 'parabola yang terbuka ke bawah' },
    ];
  })();

  const g81e = [
    /* output for an input */
    (r) => {
      const R = mkRule(r, ['ax', 'x+b', 'x2', 'x3', 'k/x', 'ax', 'x2']);
      const v = r.pick(R.xs.filter((x) => x > 0)), Q = Rt(R);
      const ph = [
        [`Given $f(x) = ${Q}$, find $f(${v})$.`, `Diberi $f(x) = ${Q}$, cari $f(${v})$.`],
        [`The function $f$ is defined by $f(x) = ${Q}$. Calculate $f(${v})$.`, `Fungsi $f$ ditakrifkan oleh $f(x) = ${Q}$. Hitung $f(${v})$.`],
        [`A function machine uses the rule $y = ${Q}$. What is the output when the input $x$ is $${v}$?`, `Sebuah mesin fungsi menggunakan peraturan $y = ${Q}$. Apakah output apabila input $x$ ialah $${v}$?`],
        [`For the function $x \\to ${R.t}$, find the output when the input is $${v}$.`, `Bagi fungsi $x \\to ${R.t}$, cari output apabila inputnya ialah $${v}$.`],
        [`If $y = ${Q}$, what is the value of $y$ when $x = ${v}$?`, `Jika $y = ${Q}$, apakah nilai $y$ apabila $x = ${v}$?`],
        [`Substitute $x = ${v}$ into $f(x) = ${Q}$ to find the output.`, `Gantikan $x = ${v}$ ke dalam $f(x) = ${Q}$ untuk mencari output.`],
      ];
      return { q: TT(r.pick(ph)), a: T(`$f(${v}) = ${n(R.f(v))}$`), w: T(`$${R.s(v)} = ${n(R.f(v))}$`), sp: 'xs' };
    },
    /* complete a table */
    (r) => {
      const R = mkRule(r, ['ax', 'x+b', 'x2', 'ax', 'x3', 'k/x2', 'k/x']);
      const xs = r.sample(R.xs.filter((x) => Math.abs(x) <= 4), 4).sort((a, b) => a - b);
      const ph = [
        [`Complete the table of values for the function $y = ${Rt(R)}$.`, `Lengkapkan jadual nilai bagi fungsi $y = ${Rt(R)}$.`],
        [`The rule of a function is $f(x) = ${Rt(R)}$. Fill in the missing outputs.`, `Peraturan suatu fungsi ialah $f(x) = ${Rt(R)}$. Isikan output yang tertinggal.`],
        [`Find the output for each input of the function $x \\to ${R.t}$.`, `Cari output bagi setiap input fungsi $x \\to ${R.t}$.`],
      ];
      const [pe, pm] = r.pick(ph);
      return { q: T(`${pe}<br>${blanks(xs, '$x$', '$y$')}`, `${pm}<br>${blanks(xs, '$x$', '$y$')}`), a: T(`$y = ${xs.map((x) => n(R.f(x))).join(',\\ ')}$`), sp: 's' };
    },
    /* input from an output (one step) */
    (r) => {
      const R = mkRule(r, ['ax', 'x+b', 'k/x', 'ax', 'x+b']);
      const v = r.pick(R.xs.filter((x) => x > 0)), y = R.f(v);
      const ph = [
        [`The function $f$ is given by $f(x) = ${Rt(R)}$. Find the input $x$ for which $f(x) = ${y}$.`, `Fungsi $f$ diberi oleh $f(x) = ${Rt(R)}$. Cari input $x$ yang menyebabkan $f(x) = ${y}$.`],
        [`A function machine follows the rule $y = ${Rt(R)}$ and the output is $${y}$. What was the input?`, `Sebuah mesin fungsi mengikut peraturan $y = ${Rt(R)}$ dan outputnya ialah $${y}$. Apakah inputnya?`],
        [`Find the value of $x$ when $y = ${y}$ for the rule $y = ${Rt(R)}$.`, `Cari nilai $x$ apabila $y = ${y}$ bagi peraturan $y = ${Rt(R)}$.`],
      ];
      return { q: TT(r.pick(ph)), a: T(`$x = ${v}$`), sp: 'xs' };
    },
    /* arrow diagram : which type */
    (r) => {
      const c = r.pick(['one', 'many', 'none']);
      const pairs = genPairs(r, c, r.int(3, 4), 1, 9, 1, 9);
      const ph = [
        [`The arrow diagram shows a relation. Is it a function? Give a reason.`, `Rajah anak panah menunjukkan suatu hubungan. Adakah ia suatu fungsi? Berikan sebab.`],
        [`Look at the arrow diagram. Does it represent a function? Explain.`, `Perhatikan rajah anak panah itu. Adakah ia mewakili suatu fungsi? Terangkan.`],
        [`State whether the relation in the arrow diagram is a function and give a reason for your answer.`, `Nyatakan sama ada hubungan dalam rajah anak panah itu ialah fungsi dan berikan sebab bagi jawapan anda.`],
      ];
      const w = why(pairs, c);
      return { q: TT(r.pick(ph)), fig: arrowFig(pairs), a: T(c === 'none' ? `No, ${w.en}.` : `Yes, ${w.en}.`, c === 'none' ? `Tidak, ${w.ms}.` : `Ya, ${w.ms}.`), sp: 's' };
    },
    /* cost function in a shop */
    (r) => {
      const it = r.pick(SPM.bank.items.concat(SPM.bank.foods)), p = r.int(it.lo, it.hi), k = r.int(3, 9);
      const ph = [
        [`One ${it.en1} costs RM${p}. The total cost $C$ (in RM) of $x$ ${it.en} is given by $C = ${p}x$. Find $C$ when $x = ${k}$.`, `Satu ${it.ms} berharga RM${p}. Jumlah kos $C$ (dalam RM) bagi $x$ ${it.ms} diberi oleh $C = ${p}x$. Cari $C$ apabila $x = ${k}$.`],
        [`The rule $C = ${p}x$ gives the cost, in RM, of buying $x$ ${it.en}. How much do ${k} ${it.en} cost?`, `Peraturan $C = ${p}x$ memberikan kos, dalam RM, bagi membeli $x$ ${it.ms}. Berapakah kos ${k} ${it.ms}?`],
        [`${cap(it.en)} are sold at RM${p} each. Write the total price as a function $C(x)$ of the number $x$ bought, and find the price of ${k}.`, `${cap(it.ms)} dijual pada harga RM${p} setiap satu. Tulis jumlah harga sebagai fungsi $C(x)$ bagi bilangan $x$ yang dibeli, dan cari harga bagi ${k}.`],
      ];
      const [pe, pm] = r.pick(ph);
      return { q: T(pe, pm), a: T(`RM${p * k}`), w: T(`$${p} \\times ${k}$`), sp: 'xs' };
    },
    /* true / false */
    (r) => {
      const t = r.pick(TF);
      const ph = [['State whether the statement is true or false: ', 'Nyatakan sama ada pernyataan berikut benar atau palsu: '], ['True or false? ', 'Benar atau palsu? '], ['Decide if this statement is true or false and give a reason: ', 'Tentukan sama ada pernyataan ini benar atau palsu dan berikan sebab: ']];
      const [pe, pm] = r.pick(ph);
      return { q: T(`${pe}"${t[0]}"`, `${pm}"${t[1]}"`), a: T(`${t[2] ? 'True' : 'False'}. ${t[3]}`, `${t[2] ? 'Benar' : 'Palsu'}. ${t[4]}`), sp: 's' };
    },
    /* ordered pairs: function? */
    (r) => {
      const c = r.pick(['one', 'many', 'none']);
      const pairs = r.shuffle(genPairs(r, c, r.int(3, 4), 1, 9, 1, 9));
      const ph = [
        [`Is $${pairTex(pairs)}$ a function? Answer Yes or No.`, `Adakah $${pairTex(pairs)}$ suatu fungsi? Jawab Ya atau Tidak.`],
        [`The relation $R = ${pairTex(pairs)}$ is written as (input, output). Does $R$ represent a function?`, `Hubungan $R = ${pairTex(pairs)}$ ditulis sebagai (input, output). Adakah $R$ mewakili suatu fungsi?`],
        [`Decide whether the set of ordered pairs $${pairTex(pairs)}$ is a function.`, `Tentukan sama ada set pasangan bertertib $${pairTex(pairs)}$ ialah suatu fungsi.`],
      ];
      return { q: TT(r.pick(ph)), a: c === 'none' ? T('No', 'Tidak') : T('Yes', 'Ya'), sp: 'xs' };
    },
    /* everyday relations */
    (r) => {
      const [e, m, c] = r.pick(REL);
      const ph = [
        [`Consider the relation: ${e}. Is it a function? If it is, is it one-to-one or many-to-one?`, `Pertimbangkan hubungan: ${m}. Adakah ia suatu fungsi? Jika ya, adakah ia satu dengan satu atau banyak dengan satu?`],
        [`The relation "${e}" is given. Classify it as a one-to-one function, a many-to-one function or not a function.`, `Hubungan "${m}" diberi. Kelaskannya sebagai fungsi satu dengan satu, fungsi banyak dengan satu atau bukan fungsi.`],
      ];
      const [pe, pm] = r.pick(ph);
      return { q: T(pe, pm), a: T(cap(CN[c].en), cap(CN[c].ms)), sp: 's' };
    },
    /* vertical line test */
    (r) => {
      const g = r.pick(GRAPHS);
      const ph = [
        [`The diagram shows ${g.en}. Use the vertical line test to decide whether the graph represents a function.`, `Rajah menunjukkan ${g.ms}. Gunakan ujian garis mencancang untuk menentukan sama ada graf itu mewakili suatu fungsi.`],
        [`Does the graph (${g.en}) represent a function? Give a reason.`, `Adakah graf (${g.ms}) mewakili suatu fungsi? Berikan sebab.`],
      ];
      const [pe, pm] = r.pick(ph);
      return { q: T(pe, pm), fig: g.fig(), a: g.fn ? T('Yes: every vertical line cuts the graph at most once.', 'Ya: setiap garis mencancang memotong graf paling banyak sekali.') : T('No: some vertical line cuts the graph at two points (one input has two outputs).', 'Tidak: ada garis mencancang yang memotong graf pada dua titik (satu input mempunyai dua output).'), sp: 's' };
    },
    /* cloze */
    (r) => {
      const c = r.pick(CLOZE);
      return { q: T(`Complete the sentence.<br>${c[0]}`, `Lengkapkan ayat berikut.<br>${c[1]}`), a: T(c[2], c[3]), sp: 'xs' };
    },
    /* word rule <-> notation */
    (r) => {
      const w = r.pick(WORDR), v = r.int(2, 6), k = r.chance();
      if (k) return { q: T(`A function machine follows the rule: ${w[0]}. Write the rule as $f(x) = \\ldots$ and find the output when the input is $${v}$.`, `Sebuah mesin fungsi mengikut peraturan: ${w[1]}. Tulis peraturan itu sebagai $f(x) = \\ldots$ dan cari output apabila input ialah $${v}$.`), a: T(`$f(x) = ${w[3]}$; $f(${v}) = ${w[2](v)}$`), sp: 's' };
      return { q: T(`The function $f(x) = ${w[3]}$ can be described in words. Describe it, then find $f(${v})$.`, `Fungsi $f(x) = ${w[3]}$ boleh diterangkan dengan perkataan. Terangkan fungsi itu, kemudian cari $f(${v})$.`), a: T(`${cap(w[0])}; $f(${v}) = ${w[2](v)}$`, `${cap(w[1])}; $f(${v}) = ${w[2](v)}$`), sp: 's' };
    },
    /* negative input */
    (r) => {
      const R = mkRule(r, ['x2', 'ax2', 'x3', 'x2+b', 'ax+b', 'b-ax']);
      const v = r.int(-4, -1);
      const ph = [
        [`Given $f(x) = ${R.t}$, find $f(${v})$.`, `Diberi $f(x) = ${R.t}$, cari $f(${v})$.`],
        [`Find the output of $y = ${R.t}$ when the input is $${v}$.`, `Cari output bagi $y = ${R.t}$ apabila input ialah $${v}$.`],
        [`What is the value of $${R.t}$ when $x = ${v}$?`, `Apakah nilai $${R.t}$ apabila $x = ${v}$?`],
      ];
      return { q: TT(r.pick(ph)), a: T(`$${n(R.f(v))}$`), w: T(`$${R.s(v)} = ${n(R.f(v))}$`), sp: 'xs' };
    },
    /* input and output */
    (r) => {
      const R = mkRule(r, ['ax', 'x+b', 'ax+b', 'x2']);
      const v = r.pick(R.xs.filter((x) => x > 0)), y = R.f(v);
      const ph = [
        [`For the function $f(x) = ${R.t}$ it is found that $f(${v}) = ${y}$. State the input and the output.`, `Bagi fungsi $f(x) = ${R.t}$ didapati $f(${v}) = ${y}$. Nyatakan input dan output.`],
        [`In the statement $f(${v}) = ${y}$, which number is the input and which is the output? Also write the pair as (input, output).`, `Dalam pernyataan $f(${v}) = ${y}$, nombor yang manakah input dan yang manakah output? Tulis juga pasangan itu sebagai (input, output).`],
      ];
      return { q: TT(r.pick(ph)), a: T(`Input $= ${v}$, output $= ${y}$; $(${v},\\ ${y})$`, `Input $= ${v}$, output $= ${y}$; $(${v},\\ ${y})$`), sp: 's' };
    },
    /* list of outputs for a domain */
    (r) => {
      const R = mkRule(r, ['ax', 'x+b', 'x2', 'ax', 'k/x']);
      const xs = r.sample(R.xs.filter((x) => x > 0 && x <= 6), 3).sort((a, b) => a - b);
      const outs = xs.map((x) => R.f(x));
      return { q: T(`A function is defined by $f(x) = ${Rt(R)}$ for the inputs $${setTex(xs)}$. List the set of outputs.`, `Suatu fungsi ditakrifkan oleh $f(x) = ${Rt(R)}$ bagi input $${setTex(xs)}$. Senaraikan set output.`), a: T(`$${setTex(outs)}$`), sp: 's' };
    },
    /* find the rule from a table */
    (r) => {
      const kind = r.pick(['ax', 'x+b', 'x2']), R = mkRule(r, [kind]);
      const xs = [1, 2, 3, 4];
      need(R.xs.includes(1) && R.xs.includes(4));
      if (kind === 'x+b') need(Math.abs(R.f(1) - 1) >= 2 && R.f(1) > 0);
      if (kind === 'ax') need(R.f(1) > 1);
      return { q: T(`The table shows the inputs and outputs of a function of the form $y = ${kind === 'ax' ? 'ax' : kind === 'x+b' ? 'x + b' : 'x^2'}$. Find the rule.<br>${valsTable(xs, xs.map((x) => R.f(x)))}`, `Jadual menunjukkan input dan output suatu fungsi berbentuk $y = ${kind === 'ax' ? 'ax' : kind === 'x+b' ? 'x + b' : 'x^2'}$. Cari peraturan fungsi itu.<br>${valsTable(xs, xs.map((x) => R.f(x)))}`), a: T(`$y = ${R.t}$`), sp: 's' };
    },
  ];

  const OUT = (c, pairs) => { const w = why(pairs, c); return T(`${cap(CN[c].en)}: ${w.en}.`, `${cap(CN[c].ms)}: ${w.ms}.`); };
  const DOM5 = [-2, -1, 0, 1, 2];
  const FARE = [
    ['A taxi charges a fixed fare of RM{b} plus RM{p} for every km travelled.', 'Sebuah teksi mengenakan tambang tetap RM{b} campur RM{p} bagi setiap km perjalanan.', 'distance in km', 'jarak dalam km', 'fare (RM)', 'tambang (RM)'],
    ['A car park charges RM{b} for entering plus RM{p} for every hour of parking.', 'Sebuah tempat letak kereta mengenakan RM{b} untuk masuk campur RM{p} bagi setiap jam meletak kereta.', 'number of hours', 'bilangan jam', 'charge (RM)', 'caj (RM)'],
    ['A printing shop charges a set-up fee of RM{b} plus RM{p} for every page printed.', 'Sebuah kedai mencetak mengenakan bayaran persediaan RM{b} campur RM{p} bagi setiap muka surat yang dicetak.', 'number of pages', 'bilangan muka surat', 'bill (RM)', 'bil (RM)'],
    ['A mobile plan costs RM{b} a month plus RM{p} for every extra GB of data.', 'Pelan telefon bimbit berharga RM{b} sebulan campur RM{p} bagi setiap GB data tambahan.', 'extra data in GB', 'data tambahan dalam GB', 'monthly bill (RM)', 'bil bulanan (RM)'],
    ['A gym charges a joining fee of RM{b} plus RM{p} for every visit.', 'Sebuah gim mengenakan yuran pendaftaran RM{b} campur RM{p} bagi setiap lawatan.', 'number of visits', 'bilangan lawatan', 'total paid (RM)', 'jumlah bayaran (RM)'],
  ];
  const STUDENT = [
    (r) => { const R = mkRule(r, ['x2', 'ax2']), v = r.int(2, 5); return [`A pupil says that $f(${-v}) = ${-R.f(v)}$ for $f(x) = ${R.t}$. Is the pupil correct? Give the correct value.`, `Seorang murid berkata $f(${-v}) = ${-R.f(v)}$ bagi $f(x) = ${R.t}$. Adakah murid itu betul? Berikan nilai yang betul.`, `No. $f(${-v}) = ${R.s(-v)} = ${n(R.f(-v))}$, because a negative number squared is positive.`, `Tidak. $f(${-v}) = ${R.s(-v)} = ${n(R.f(-v))}$, kerana kuasa dua nombor negatif ialah positif.`]; },
    (r) => { const k = r.pick([6, 8, 12]); return [`A pupil says that for $f(x) = \\dfrac{${k}}{x}$ we have $f(0) = 0$. Is this correct?`, `Seorang murid berkata bagi $f(x) = \\dfrac{${k}}{x}$ kita ada $f(0) = 0$. Adakah ini betul?`, `No. Division by zero is not defined, so $x = 0$ cannot be an input and $f(0)$ does not exist.`, `Tidak. Pembahagian dengan sifar tidak ditakrifkan, jadi $x = 0$ tidak boleh menjadi input dan $f(0)$ tidak wujud.`]; },
    (r) => { const p = genPairs(r, 'many', 4, 1, 9, 1, 9), c = cls(p); const m = p.find((a) => p.some((b) => b !== a && b[1] === a[1])), sh = pairTex(r.shuffle(p)); return [`A pupil says that $${sh}$ is not a function because the output ${m[1]} appears more than once. Is the pupil correct?`, `Seorang murid berkata $${sh}$ bukan fungsi kerana output ${m[1]} muncul lebih daripada sekali. Adakah murid itu betul?`, `No. It is a many-to-one function. An output may come from several inputs; a function only forbids one input having two outputs.`, `Tidak. Ia ialah fungsi banyak dengan satu. Satu output boleh datang daripada beberapa input; fungsi hanya melarang satu input mempunyai dua output.`]; },
    (r) => { const p = genPairs(r, 'none', 3, 1, 9, 1, 9); const q = r.shuffle(p); return [`A pupil says that $${pairTex(q)}$ is a function because every input has an output. Is the pupil correct?`, `Seorang murid berkata $${pairTex(q)}$ ialah fungsi kerana setiap input mempunyai output. Adakah murid itu betul?`, `No. ${cap(why(p, 'none').en)}, so it is not a function.`, `Tidak. ${cap(why(p, 'none').ms)}, jadi ia bukan fungsi.`]; },
    (r) => { const p = genPairs(r, 'one', 4, 1, 9, 1, 9); const q = r.shuffle(p); return [`A pupil says that $${pairTex(q)}$ is a many-to-one function because there are many inputs. Is the pupil correct?`, `Seorang murid berkata $${pairTex(q)}$ ialah fungsi banyak dengan satu kerana terdapat banyak input. Adakah murid itu betul?`, `No. All the outputs are different, so it is a one-to-one function. Many-to-one needs some output to be shared by two or more inputs.`, `Tidak. Semua output berbeza, jadi ia ialah fungsi satu dengan satu. Banyak dengan satu memerlukan sesuatu output dikongsi oleh dua atau lebih input.`]; },
    (r) => { const g = GRAPHS[1]; return [`A pupil looks at the graph of a parabola opening upwards and says that it is not a function because it is symmetrical and goes up on both sides. Is the pupil correct?`, `Seorang murid melihat graf parabola yang terbuka ke atas dan berkata ia bukan fungsi kerana ia simetri dan naik pada kedua-dua belah. Adakah murid itu betul?`, `No. Every vertical line cuts the parabola at most once, so it is a function (a many-to-one function).`, `Tidak. Setiap garis mencancang memotong parabola itu paling banyak sekali, jadi ia ialah fungsi (fungsi banyak dengan satu).`, g.fig()]; },
  ];

  const g81m = [
    /* two-step evaluate */
    (r) => {
      const R = mkRule(r, ['ax+b', 'b-ax', 'x2+b', 'ax2', 'ax2+b', 'ax3', 'k/x', 'k/x2']);
      const v = r.pick(R.xs.filter((x) => x !== 0 && Math.abs(x) <= 4)), w = -v;
      need(R.xs.includes(w));
      const ph = [
        [`Given $f(x) = ${Rt(R)}$, find (a) $f(${v})$, (b) $f(${w})$.`, `Diberi $f(x) = ${Rt(R)}$, cari (a) $f(${v})$, (b) $f(${w})$.`, 1],
        [`The rule of a function is $y = ${Rt(R)}$. Calculate the outputs for the inputs $${v}$ and $${w}$.`, `Peraturan suatu fungsi ialah $y = ${Rt(R)}$. Hitung output bagi input $${v}$ dan $${w}$.`, 1],
        [`If $f(x) = ${Rt(R)}$, evaluate $f(${v})$.`, `Jika $f(x) = ${Rt(R)}$, nilaikan $f(${v})$.`, 0],
        [`Find the output of the function $x \\to ${R.t}$ when the input is $${v}$. Show your working.`, `Cari output bagi fungsi $x \\to ${R.t}$ apabila inputnya ialah $${v}$. Tunjukkan langkah kerja anda.`, 0],
      ];
      const [pe, pm, two] = r.pick(ph);
      return { q: T(pe, pm), a: two ? T(`$f(${v}) = ${n(R.f(v))}$; $f(${w}) = ${n(R.f(w))}$`) : T(`$f(${v}) = ${n(R.f(v))}$`), w: T(`$${R.s(v)} = ${n(R.f(v))}$`), sp: 's' };
    },
    /* function from ordered pairs, reason */
    (r) => {
      const c = r.pick(['one', 'many', 'none']), pairs = r.shuffle(genPairs(r, c, r.int(4, 5), 1, 9, 1, 12));
      const ph = [
        [`The relation $${pairTex(pairs)}$ is written as (input, output). Is it a function? Give a reason.`, `Hubungan $${pairTex(pairs)}$ ditulis sebagai (input, output). Adakah ia suatu fungsi? Berikan sebab.`],
        [`Explain whether the set of ordered pairs $${pairTex(pairs)}$ represents a function.`, `Terangkan sama ada set pasangan bertertib $${pairTex(pairs)}$ mewakili suatu fungsi.`],
      ];
      const w = why(pairs, c);
      return { q: TT(r.pick(ph)), a: c === 'none' ? T(`Not a function: ${w.en}.`, `Bukan fungsi: ${w.ms}.`) : T(`It is a function: every input has exactly one output.`, `Ia ialah fungsi: setiap input mempunyai tepat satu output.`), sp: 's' };
    },
    /* one-to-one or many-to-one, from ordered pairs */
    (r) => {
      const c = r.pick(['one', 'many']), pairs = r.shuffle(genPairs(r, c, r.int(4, 5), 1, 9, 1, 12));
      const ph = [
        [`The function $f$ is given by the ordered pairs $${pairTex(pairs)}$. State whether $f$ is one-to-one or many-to-one.`, `Fungsi $f$ diberi oleh pasangan bertertib $${pairTex(pairs)}$. Nyatakan sama ada $f$ satu dengan satu atau banyak dengan satu.`],
        [`Classify the function $${pairTex(pairs)}$ as one-to-one or many-to-one, and give a reason.`, `Kelaskan fungsi $${pairTex(pairs)}$ sebagai satu dengan satu atau banyak dengan satu, dan berikan sebab.`],
      ];
      return { q: TT(r.pick(ph)), a: OUT(c, pairs), sp: 's' };
    },
    /* table */
    (r) => {
      const c = r.pick(['one', 'many', 'none']), pairs = genPairs(r, c, 4, 1, 8, 1, 15);
      const pp = c === 'none' ? r.shuffle(pairs) : pairs;
      const ph = [
        [`The table shows the inputs $x$ and outputs $y$ of a relation. Is it a function? If so, is it one-to-one or many-to-one?`, `Jadual menunjukkan input $x$ dan output $y$ bagi suatu hubungan. Adakah ia fungsi? Jika ya, adakah ia satu dengan satu atau banyak dengan satu?`],
        [`Study the table of values. Classify the relation as a one-to-one function, a many-to-one function or not a function.`, `Kaji jadual nilai itu. Kelaskan hubungan itu sebagai fungsi satu dengan satu, fungsi banyak dengan satu atau bukan fungsi.`],
      ];
      const [pe, pm] = r.pick(ph);
      return { q: T(`${pe}<br>${tblPairs(pp)}`, `${pm}<br>${tblPairs(pp)}`), a: OUT(c, pairs), sp: 's' };
    },
    /* arrow diagram, full classification */
    (r) => {
      const c = r.pick(['one', 'many', 'none']), pairs = genPairs(r, c, r.int(3, 4), 1, 12, 1, 12);
      const ph = [
        [`The arrow diagram shows a relation from the inputs to the outputs. State whether it is a one-to-one function, a many-to-one function or not a function. Give a reason.`, `Rajah anak panah menunjukkan hubungan daripada input kepada output. Nyatakan sama ada ia fungsi satu dengan satu, fungsi banyak dengan satu atau bukan fungsi. Berikan sebab.`],
        [`Describe the relation in the arrow diagram: is it a function, and if it is, which type?`, `Huraikan hubungan dalam rajah anak panah itu: adakah ia fungsi, dan jika ya, jenis yang manakah?`],
      ];
      return { q: TT(r.pick(ph)), fig: arrowFig(pairs, [...new Set(pairs.map((p) => p[0]))], r.shuffle([...new Set(pairs.map((p) => p[1]))])), a: OUT(c, pairs), sp: 's' };
    },
    /* data-driven everyday context */
    (r) => {
      const CT = [
        { en: 'clubs', ms: 'kelab', cod: SPM.bank.clubs, qe: 'joined a club', qm: 'menyertai sebuah kelab', a: 'club', b: 'kelab' },
        { en: 'sports', ms: 'sukan', cod: SPM.bank.sports, qe: 'chose a sport', qm: 'memilih sebuah sukan', a: 'sport', b: 'sukan' },
        { en: 'fruits', ms: 'buah-buahan', cod: SPM.bank.fruits, qe: 'chose a favourite fruit', qm: 'memilih buah kegemaran', a: 'favourite fruit', b: 'buah kegemaran' },
        { en: 'subjects', ms: 'mata pelajaran', cod: SPM.bank.subjects, qe: 'chose a favourite subject', qm: 'memilih mata pelajaran kegemaran', a: 'favourite subject', b: 'mata pelajaran kegemaran' },
        { en: 'places', ms: 'tempat', cod: SPM.bank.places, qe: 'named a town for a holiday', qm: 'menamakan sebuah bandar untuk bercuti', a: 'holiday town', b: 'bandar percutian' },
      ];
      const ct = r.pick(CT), k = r.int(4, 5), c = r.pick(['one', 'many', 'none']);
      const names = r.names(k), cods = r.sample(ct.cod, 8);
      const idx = genPairs(r, c, k, 0, k - 1, 0, 7);
      const pairs = idx.map((p) => [names[p[0]], cods[p[1]].en]);
      const pairsM = idx.map((p) => [names[p[0]], cods[p[1]].ms]);
      const tb = (ps) => TB([[T('Pupil', 'Murid').en, ...ps.map((p) => p[0])], [cap(ct.a), ...ps.map((p) => p[1])]]);
      const tbM = (ps) => TB([['Murid', ...ps.map((p) => p[0])], [cap(ct.b), ...ps.map((p) => p[1])]]);
      const w = why(pairs, c), wm = why(pairsM, c);
      const shown = r.shuffle(idx.map((_, i) => i));
      return { q: T(`Some pupils each ${ct.qe}. The pairs (pupil, ${ct.a}) are shown in the table.<br>${tb(shown.map((i) => pairs[i]))}Does the relation "pupil $\\to$ ${ct.a}" represent a function? If it does, is it one-to-one or many-to-one?`, `Beberapa murid masing-masing ${ct.qm}. Pasangan (murid, ${ct.b}) ditunjukkan dalam jadual.<br>${tbM(shown.map((i) => pairsM[i]))}Adakah hubungan "murid $\\to$ ${ct.b}" mewakili suatu fungsi? Jika ya, adakah ia satu dengan satu atau banyak dengan satu?`), a: T(`${cap(CN[c].en)}: ${w.en}.`, `${cap(CN[c].ms)}: ${wm.ms}.`), sp: 's' };
    },
    /* vertical and horizontal line tests */
    (r) => {
      const g = r.pick(GRAPHS);
      const ph = [
        [`The graph shows ${g.en}. Use the vertical line test and the horizontal line test to classify the relation.`, `Graf menunjukkan ${g.ms}. Gunakan ujian garis mencancang dan ujian garis mengufuk untuk mengelaskan hubungan itu.`],
        [`Decide whether the graph of ${g.en} is a function and, if it is, whether it is one-to-one or many-to-one.`, `Tentukan sama ada graf ${g.ms} ialah fungsi dan, jika ya, sama ada ia satu dengan satu atau banyak dengan satu.`],
      ];
      const [pe, pm] = r.pick(ph);
      const a = !g.fn ? T('Not a function: a vertical line meets the graph twice.', 'Bukan fungsi: garis mencancang memotong graf dua kali.') : g.one ? T('A function (vertical line meets it at most once); one-to-one (a horizontal line meets it at most once).', 'Fungsi (garis mencancang memotongnya paling banyak sekali); satu dengan satu (garis mengufuk memotongnya paling banyak sekali).') : T('A function (vertical line test passed); many-to-one, since some horizontal lines meet the graph twice.', 'Fungsi (lulus ujian garis mencancang); banyak dengan satu, kerana ada garis mengufuk yang memotong graf dua kali.');
      return { q: T(pe, pm), fig: g.fig(), a, sp: 's' };
    },
    /* find the rule from a table */
    (r) => {
      const kind = r.pick(['ax+b', 'b-ax', 'x2+b']), R = mkRule(r, [kind]), xs = [1, 2, 3, 4];
      need(xs.every((x) => R.xs.includes(x)) && Math.abs(R.f(1)) < 40);
      if (kind === 'x2+b') need(Math.abs(R.f(0) ) < 12);
      const form = kind === 'x2+b' ? 'y = x^2 + b' : 'y = ax + b';
      const ys = xs.map((x) => R.f(x));
      return { q: T(`The table shows some inputs and outputs of a function of the form $${form}$. Find the rule and hence the output when $x = 6$.<br>${valsTable(xs, ys)}`, `Jadual menunjukkan beberapa input dan output bagi suatu fungsi berbentuk $${form}$. Cari peraturan itu dan seterusnya output apabila $x = 6$.<br>${valsTable(xs, ys)}`), a: T(`$y = ${R.t}$; when $x = 6$, $y = ${n(R.f(6))}$`), sp: 's' };
    },
    /* solve for the input, two-step */
    (r) => {
      const R = mkRule(r, ['ax+b', 'b-ax', 'ax+b', 'x2+b']);
      const v = r.pick(R.xs.filter((x) => (R.sqr ? x > 0 : x !== 0) && Math.abs(x) <= 8)), y = R.f(v);
      need(R.kind !== 'x2+b' || y > 0);
      const ph = [
        [`The function $f$ is defined by $f(x) = ${R.t}$. Find the input for which the output is $${y}$.`, `Fungsi $f$ ditakrifkan oleh $f(x) = ${R.t}$. Cari input yang memberikan output $${y}$.`],
        [`Given $f(x) = ${R.t}$ and $f(x) = ${y}$, find the value of $x$${R.sqr ? ' (take $x > 0$)' : ''}.`, `Diberi $f(x) = ${R.t}$ dan $f(x) = ${y}$, cari nilai $x$${R.sqr ? ' (ambil $x > 0$)' : ''}.`],
      ];
      return { q: TT(r.pick(ph)), a: T(`$x = ${v}$`), sp: 's' };
    },
    /* linear function contexts */
    (r) => {
      const c = r.pick(FARE), b = r.int(2, 8), p = r.int(2, 6), x = r.int(3, 9), y = b + p * x, sub = (s) => s.replace('{b}', b).replace('{p}', p);
      const ph = r.chance();
      return {
        q: ph ? T(`${sub(c[0])} The rule is $y = ${lin(p, b)}$ where $x$ is the ${c[2]} and $y$ is the ${c[4]}. Find $y$ when $x = ${x}$.`, `${sub(c[1])} Peraturannya ialah $y = ${lin(p, b)}$ dengan $x$ ialah ${c[3]} dan $y$ ialah ${c[5]}. Cari $y$ apabila $x = ${x}$.`)
          : T(`${sub(c[0])} The rule is $y = ${lin(p, b)}$ where $x$ is the ${c[2]} and $y$ is the ${c[4]}. The amount is RM${y}. Find $x$.`, `${sub(c[1])} Peraturannya ialah $y = ${lin(p, b)}$ dengan $x$ ialah ${c[3]} dan $y$ ialah ${c[5]}. Jumlahnya ialah RM${y}. Cari $x$.`),
        a: ph ? T(`$y = ${y}$ (RM${y})`) : T(`$x = ${x}$`), sp: 's' };
    },
    /* MCQ: which is not a function */
    (r) => {
      const opts = [genPairs(r, 'one', 3, 1, 9, 1, 9), genPairs(r, 'many', 4, 1, 9, 1, 9), genPairs(r, 'none', 3, 1, 9, 1, 9), genPairs(r, r.pick(['one', 'many']), 4, 1, 9, 1, 9)];
      const idx = r.shuffle([0, 1, 2, 3]), L = 'ABCD';
      const list = idx.map((i, j) => `(${L[j]}) $${pairTex(r.shuffle(opts[i]))}$`).join('&emsp;');
      const cor = idx.indexOf(2);
      return { q: T(`Each set of ordered pairs is written as (input, output). Which one is NOT a function?<br>${list}`, `Setiap set pasangan bertertib ditulis sebagai (input, output). Yang manakah BUKAN fungsi?<br>${list}`), a: T(`(${L[cor]}) $${pairTex(opts[2])}$`), sp: 's' };
    },
    /* classify a rule on a domain */
    (r) => {
      const R = mkRule(r, ['x2', 'ax2', 'x2+b', 'ax+b', 'x3', 'k/x2', 'k/x']);
      const dom = DOM5.filter((x) => R.xs.includes(x));
      need(dom.length >= 4);
      const pairs = dom.map((x) => [x, R.f(x)]), c = cls(pairs);
      return { q: T(`The function $f(x) = ${Rt(R)}$ has the inputs $${setTex(dom)}$. Find the outputs and state whether $f$ is one-to-one or many-to-one.`, `Fungsi $f(x) = ${Rt(R)}$ mempunyai input $${setTex(dom)}$. Cari output dan nyatakan sama ada $f$ satu dengan satu atau banyak dengan satu.`), a: T(`Outputs: $${setTex(pairs.map((p) => p[1]))}$; ${CN[c].en}`, `Output: $${setTex(pairs.map((p) => p[1]))}$; ${CN[c].ms}`), sp: 's' };
    },
    /* spot the error */
    (r) => {
      const s = r.pick(STUDENT)(r);
      return { q: T(s[0], s[1]), a: T(s[2], s[3]), fig: s[4], sp: 's' };
    },
    /* complete a table, missing inputs and outputs */
    (r) => {
      const R = mkRule(r, ['ax+b', 'b-ax', 'ax']);
      const xs = r.sample(R.xs.filter((x) => x > 0 && x <= 6), 4).sort((a, b) => a - b);
      const top = xs.map((x, i) => (i % 2 ? `$${x}$` : '?')), bot = xs.map((x, i) => (i % 2 ? '?' : `$${n(R.f(x))}$`));
      const tb = TB([['$x$', ...top], ['$f(x)$', ...bot]]);
      const ai = xs.filter((_, i) => i % 2 === 0).join(',\\ '), ao = xs.filter((_, i) => i % 2).map((x) => n(R.f(x))).join(',\\ ');
      return { q: T(`The table shows some inputs and outputs of the function $f(x) = ${R.t}$. Find each missing value (?), from left to right.<br>${tb}`, `Jadual menunjukkan beberapa input dan output bagi fungsi $f(x) = ${R.t}$. Cari setiap nilai yang tidak diketahui (?), dari kiri ke kanan.<br>${tb}`), a: T(`Inputs: $${ai}$; outputs: $${ao}$`, `Input: $${ai}$; output: $${ao}$`), sp: 's' };
    },
  ];

  const POS = [0, 1, 2, 3, 4];
  const g81a = [
    /* all possible inputs for an output */
    (r) => {
      const R = mkRule(r, ['x2', 'ax2', 'x2+b', 'ax2+b', 'k/x2', 'x3', 'ax+b']);
      const v = r.int(1, 6);
      need(R.xs.includes(v) || R.kind === 'ax2' || R.kind === 'x2' || R.kind === 'x2+b' || R.kind === 'ax2+b');
      const y = R.f(v);
      need(R.kind !== 'k/x2' ? true : R.f(v) === R.f(-v));
      const ins = R.sqr ? [-v, v] : [v];
      const ph = [
        [`For $f(x) = ${Rt(R)}$, find all the possible inputs $x$ such that $f(x) = ${y}$.`, `Bagi $f(x) = ${Rt(R)}$, cari semua input $x$ yang mungkin supaya $f(x) = ${y}$.`],
        [`The output of the function $y = ${Rt(R)}$ is $${y}$. Find every input that could give this output.`, `Output bagi fungsi $y = ${Rt(R)}$ ialah $${y}$. Cari setiap input yang boleh memberikan output ini.`],
        [`Solve $${R.t} = ${y}$ to find all the inputs of $f(x) = ${Rt(R)}$ with output $${y}$. How many inputs are there?`, `Selesaikan $${R.t} = ${y}$ untuk mencari semua input bagi $f(x) = ${Rt(R)}$ yang mempunyai output $${y}$. Berapakah bilangan input itu?`],
      ];
      const jn = (w) => ins.join(` \\text{ ${w} } `);
      return { q: TT(r.pick(ph)), a: T(`$x = ${jn('or')}$ (${ins.length} input${ins.length > 1 ? 's' : ''})`, `$x = ${jn('atau')}$ (${ins.length} input)`), sp: 's' };
    },
    /* two domains */
    (r) => {
      const R = mkRule(r, ['x2', 'ax2', 'x2+b', 'k/x2', 'x3', 'x2+b']);
      const D1 = [-3, -2, -1, 0, 1, 2, 3].filter((x) => R.xs.includes(x)), D2 = r.pick([[0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5]]).filter((x) => R.xs.includes(x));
      need(D1.length >= 5 && D2.length >= 3);
      const c1 = cls(D1.map((x) => [x, R.f(x)])), c2 = cls(D2.map((x) => [x, R.f(x)]));
      const ex = (c, D) => (c === 'many' ? T(`, for example $f(${-D.find((x) => x > 0 && D.includes(-x))}) = f(${D.find((x) => x > 0 && D.includes(-x))})$`, `, contohnya $f(${-D.find((x) => x > 0 && D.includes(-x))}) = f(${D.find((x) => x > 0 && D.includes(-x))})$`) : T('', ''));
      return { q: T(`Let $f(x) = ${Rt(R)}$. Compare the function on two sets of inputs: (a) $${setTex(D1)}$ and (b) $${setTex(D2)}$. For each, state whether $f$ is one-to-one or many-to-one and justify.`, `Katakan $f(x) = ${Rt(R)}$. Bandingkan fungsi itu pada dua set input: (a) $${setTex(D1)}$ dan (b) $${setTex(D2)}$. Bagi setiap set, nyatakan sama ada $f$ satu dengan satu atau banyak dengan satu dan beri justifikasi.`), a: P([T(`${cap(CN[c1].en)}. Outputs $${setTex(D1.map(R.f))}$${c1 === 'many' ? ex(c1, D1).en : ''}.`, `${cap(CN[c1].ms)}. Output $${setTex(D1.map(R.f))}$${c1 === 'many' ? ex(c1, D1).ms : ''}.`), T(`${cap(CN[c2].en)}. Outputs $${setTex(D2.map(R.f))}$.`, `${cap(CN[c2].ms)}. Output $${setTex(D2.map(R.f))}$.`)]), sp: 'm' };
    },
    /* justify (i) function? (ii) type */
    (r) => {
      const c = r.pick(['one', 'many', 'none']), pairs = genPairs(r, c, 4, 1, 9, 1, 12), rep = r.int(0, 2);
      const shown = r.shuffle(pairs);
      const disp = rep === 0 ? T(`$${pairTex(shown)}$`) : rep === 1 ? T(tblPairs(shown)) : T('');
      const w = why(pairs, c);
      const q = T(`${rep === 2 ? 'The arrow diagram' : rep === 1 ? 'The table' : 'The set of ordered pairs'} shows a relation from $x$ (input) to $y$ (output). ${rep === 0 ? disp.en : ''}${rep === 1 ? '<br>' + disp.en : ''}<br>(i) Is it a function? Justify. (ii) If it is, classify it as one-to-one or many-to-one and justify.`, `${rep === 2 ? 'Rajah anak panah' : rep === 1 ? 'Jadual' : 'Set pasangan bertertib'} menunjukkan hubungan daripada $x$ (input) kepada $y$ (output). ${rep === 0 ? disp.ms : ''}${rep === 1 ? '<br>' + disp.ms : ''}<br>(i) Adakah ia suatu fungsi? Beri justifikasi. (ii) Jika ya, kelaskan sebagai satu dengan satu atau banyak dengan satu dan beri justifikasi.`);
      return { q, fig: rep === 2 ? arrowFig(pairs, [...new Set(pairs.map((p) => p[0]))], r.shuffle([...new Set(pairs.map((p) => p[1]))])) : undefined, a: P([c === 'none' ? T(`No: ${w.en}.`, `Tidak: ${w.ms}.`) : T('Yes: each input has exactly one output.', 'Ya: setiap input mempunyai tepat satu output.'), c === 'none' ? T('Not applicable, because it is not a function.', 'Tidak berkenaan, kerana ia bukan fungsi.') : c === 'one' ? T('One-to-one: no two inputs share an output.', 'Satu dengan satu: tiada dua input berkongsi output.') : T(`Many-to-one: ${w.en.replace(/^every input has exactly one output, but /, '')}.`, `Banyak dengan satu: ${w.ms.replace(/^setiap input mempunyai tepat satu output, tetapi /, '')}.`)]), sp: 'm' };
    },
    /* construct an example */
    (r) => {
      const R = mkRule(r, ['x2', 'ax2', 'x2+b', 'k/x2']);
      const m = r.int(1, 3), p = r.int(m + 1, 5);
      const ok = R.xs.includes(m) && R.xs.includes(-m) && R.xs.includes(p) && R.xs.includes(p + 1);
      need(ok && R.xs.includes(p + 1));
      const one = [m, p, p + 1, 4].filter((x, i, a) => a.indexOf(x) === i && R.xs.includes(x)).slice(0, 4);
      need(one.length >= 3);
      return { q: T(`For $f(x) = ${Rt(R)}$, (a) write down three inputs for which $f$ is one-to-one, (b) write down three inputs for which $f$ is many-to-one. Give a reason for each.`, `Bagi $f(x) = ${Rt(R)}$, (a) tuliskan tiga input supaya $f$ ialah satu dengan satu, (b) tuliskan tiga input supaya $f$ ialah banyak dengan satu. Berikan sebab bagi setiap satu.`), a: P([T(`For example $${setTex(one.slice(0, 3))}$: the inputs are all positive, so their outputs $${setTex(one.slice(0, 3).map(R.f))}$ are different.`, `Contohnya $${setTex(one.slice(0, 3))}$: semua input positif, jadi outputnya $${setTex(one.slice(0, 3).map(R.f))}$ berbeza.`), T(`For example $${setTex([-m, m, p])}$: $f(${-m}) = f(${m}) = ${n(R.f(m))}$, so two inputs share one output.`, `Contohnya $${setTex([-m, m, p])}$: $f(${-m}) = f(${m}) = ${n(R.f(m))}$, jadi dua input berkongsi satu output.`)]), sp: 'm' };
    },
    /* unknown k in a relation */
    (r) => {
      const [a, b, c] = r.distinct(3, 1, 12), d = r.chance() ? r.pick([a, b, c]) : r.int(1, 12);
      const base = [[1, a], [2, b], [3, c]], ks = [1, 2, 3, 4, 5];
      const out = { none: [], one: [], many: [] };
      for (const k of ks) out[cls(base.concat([[k, d]]))].push(k);
      const f = (l) => (l.length ? `$${l.join(',\\ ')}$` : T('none', 'tiada').en);
      const fm = (l) => (l.length ? `$${l.join(',\\ ')}$` : 'tiada');
      return { q: T(`The relation $${pairTex(base.concat([['k', d]]))}$ is written as (input, output), where $k \\in \\{1, 2, 3, 4, 5\\}$. Find the values of $k$ for which the relation is (a) not a function, (b) a one-to-one function, (c) a many-to-one function.`, `Hubungan $${pairTex(base.concat([['k', d]]))}$ ditulis sebagai (input, output), dengan $k \\in \\{1, 2, 3, 4, 5\\}$. Cari nilai $k$ supaya hubungan itu (a) bukan fungsi, (b) fungsi satu dengan satu, (c) fungsi banyak dengan satu.`), a: P([T(f(out.none), fm(out.none)), T(f(out.one), fm(out.one)), T(f(out.many), fm(out.many))]), sp: 'm' };
    },
    /* graph with a horizontal line */
    (r) => {
      const a = r.pick([1, 2, -1, -2]), m = r.pick([1, 2]), k = a * m * m;
      const fig = S.plane({ x: [-4, 4], y: [-9, 9], scale: 15, labelStep: 1, curves: [{ f: (x) => a * x * x, from: -3.2, to: 3.2 }], segs: [{ a: [-4, k], b: [4, k], dash: true }], pts: [{ x: -m, y: k, hollow: true }, { x: m, y: k, hollow: true }] });
      const eq = poly([[a, 'x^2']]);
      return { q: T(`The graph shows $f(x) = ${eq}$. The dashed horizontal line is drawn at $y = ${k}$. (a) Read the inputs $x$ that give the output $${k}$. (b) Use your answer to explain why $f$ is many-to-one.`, `Graf menunjukkan $f(x) = ${eq}$. Garis mengufuk putus-putus dilukis pada $y = ${k}$. (a) Baca input $x$ yang memberikan output $${k}$. (b) Gunakan jawapan anda untuk menerangkan mengapa $f$ ialah banyak dengan satu.`), fig, a: P([T(`$x = ${-m}$ and $x = ${m}$`), T(`Two different inputs, $${-m}$ and $${m}$, have the same output $${k}$.`, `Dua input berbeza, $${-m}$ dan $${m}$, mempunyai output yang sama, $${k}$.`)]), sp: 'm' };
    },
    /* multi-part chain for a squared rule */
    (r) => {
      const R = mkRule(r, ['x2', 'ax2', 'x2+b', 'ax2+b']), m = r.int(2, 6);
      return { q: T(`A function is defined by $f(x) = ${R.t}$. (a) Find $f(${m})$. (b) Find $f(${-m})$. (c) What do (a) and (b) tell you about the type of function $f$ is?`, `Suatu fungsi ditakrifkan oleh $f(x) = ${R.t}$. (a) Cari $f(${m})$. (b) Cari $f(${-m})$. (c) Apakah yang (a) dan (b) beritahu tentang jenis fungsi $f$?`), a: P([T(`$${n(R.f(m))}$`), T(`$${n(R.f(-m))}$`), T('The two different inputs have the same output, so $f$ is many-to-one (on a domain containing both).', 'Dua input berbeza itu mempunyai output yang sama, jadi $f$ ialah banyak dengan satu (pada domain yang mengandungi kedua-duanya).')]), sp: 'm' };
    },
    /* real-life functions with restricted inputs */
    (r) => {
      const m = r.int(2, 9), k = r.pick([12, 24, 36, 60, 120]);
      const C = [
        { t: 'A = x^2', f: (x) => x * x, en: 'The area $A$ cm² of a square tile of side $x$ cm is given by $A = x^2$.', ms: 'Luas $A$ cm² sebuah jubin segi empat sama bersisi $x$ cm diberi oleh $A = x^2$.', ine: 'side', inm: 'sisi', v: m },
        { t: 'V = x^3', f: (x) => x * x * x, en: 'The volume $V$ cm³ of a cube of edge $x$ cm is given by $V = x^3$.', ms: 'Isi padu $V$ cm³ sebuah kubus bersisi $x$ cm diberi oleh $V = x^3$.', ine: 'edge', inm: 'sisi', v: Math.min(m, 6) },
        { t: `t = ${dfr(k, 'v')}`, f: (x) => k / x, en: `A journey of ${k} km is made at a constant speed of $v$ km/h. The time $t$ hours is given by $t = \\dfrac{${k}}{v}$.`, ms: `Suatu perjalanan sejauh ${k} km dibuat pada laju malar $v$ km/j. Masa $t$ jam diberi oleh $t = \\dfrac{${k}}{v}$.`, ine: 'speed', inm: 'laju', v: [2, 3, 4, 6].find((d) => k % d === 0) },
      ];
      const c = r.pick(C), v = c.v, out = c.f(v);
      need(isInt(out));
      return { q: T(`${c.en} (a) Find the output when the input is ${v}. (b) Find the input when the output is ${n(out)}. (c) Explain why a negative input is not sensible here, and state whether the function is one-to-one for the sensible inputs.`, `${c.ms} (a) Cari output apabila input ialah ${v}. (b) Cari input apabila output ialah ${n(out)}. (c) Terangkan mengapa input negatif tidak munasabah di sini, dan nyatakan sama ada fungsi itu satu dengan satu bagi input yang munasabah.`), a: P([T(`$${n(out)}$`), T(`$${v}$`), T(`A ${c.ine} cannot be negative; for positive inputs different inputs give different outputs, so it is one-to-one.`, `${cap(c.inm)} tidak boleh negatif; bagi input positif, input yang berbeza memberikan output yang berbeza, jadi ia satu dengan satu.`)]), sp: 'm' };
    },
    /* reciprocal function */
    (r) => {
      const k = r.pick([6, 8, 12, 24]), d = r.pick([2, 3, 4]);
      need(k % d === 0);
      const y = k / d;
      return { q: T(`The function $f$ is defined by $f(x) = \\dfrac{${k}}{x}$, $x \\ne 0$. (a) Find $f(${d})$ and $f(${-d})$. (b) Find the input for which $f(x) = ${y * 2}$. (c) Explain why $x = 0$ is excluded.`, `Fungsi $f$ ditakrifkan oleh $f(x) = \\dfrac{${k}}{x}$, $x \\ne 0$. (a) Cari $f(${d})$ dan $f(${-d})$. (b) Cari input yang menyebabkan $f(x) = ${y * 2}$. (c) Terangkan mengapa $x = 0$ dikecualikan.`), a: P([T(`$f(${d}) = ${y}$; $f(${-d}) = ${-y}$`), T(`$x = ${k / (y * 2)}$`), T('$\\dfrac{' + k + '}{0}$ is not defined: division by zero has no value.', '$\\dfrac{' + k + '}{0}$ tidak ditakrifkan: pembahagian dengan sifar tiada nilai.')]), sp: 'm' };
    },
    /* find the constant */
    (r) => {
      const form = r.pick(['ax+b', 'x2+c', 'ax2', 'k/x']), v = r.int(2, 5);
      const a = r.int(2, 5), b = r.nz(-8, 8), out = r.pick([1, 2]);
      let q, ans, len;
      if (form === 'ax+b') { q = [`$f(x) = ax ${sg(b)}$ and $f(${v}) = ${a * v + b}$`, `$f(x) = ax ${sg(b)}$ dan $f(${v}) = ${a * v + b}$`]; ans = `$a = ${a}$`; }
      else if (form === 'x2+c') { q = [`$f(x) = x^2 + c$ and $f(${v}) = ${v * v + b}$`, `$f(x) = x^2 + c$ dan $f(${v}) = ${v * v + b}$`]; ans = `$c = ${b}$`; }
      else if (form === 'ax2') { q = [`$f(x) = ax^2$ and $f(${v}) = ${a * v * v}$`, `$f(x) = ax^2$ dan $f(${v}) = ${a * v * v}$`]; ans = `$a = ${a}$`; }
      else { q = [`$f(x) = \\dfrac{k}{x}$, $x \\ne 0$, and $f(${v}) = ${a}$`, `$f(x) = \\dfrac{k}{x}$, $x \\ne 0$, dan $f(${v}) = ${a}$`]; ans = `$k = ${a * v}$`; }
      const nxt = r.int(1, 6), fn = form === 'ax+b' ? a * nxt + b : form === 'x2+c' ? nxt * nxt + b : form === 'ax2' ? a * nxt * nxt : (a * v) / nxt;
      need(isInt(fn) && nxt !== v);
      return { q: T(`Given that ${q[0]}, find the value of the constant, and hence find $f(${nxt})$.`, `Diberi ${q[1]}, cari nilai pemalar itu, dan seterusnya cari $f(${nxt})$.`), a: T(`${ans}; $f(${nxt}) = ${n(fn)}$`), sp: 's' };
    },
    /* true statement and false statement to correct */
    (r) => {
      const ts = TF.filter((t) => t[2]), fs = TF.filter((t) => !t[2]);
      const a = r.pick(ts), b = r.pick(fs), sw = r.chance();
      const two = sw ? [b, a] : [a, b];
      return { q: T(`One of the following statements is true and the other is false. Decide which is which and give a reason, then correct the false statement.${P(two.map((t) => T(t[0], t[1]))).en}`, `Satu daripada pernyataan berikut benar dan satu lagi palsu. Tentukan yang mana satu dan berikan sebab, kemudian betulkan pernyataan yang palsu.${P(two.map((t) => T(t[0], t[1]))).ms}`), a: P(two.map((t) => T(`${t[2] ? 'True' : 'False'}: ${t[3]}`, `${t[2] ? 'Benar' : 'Palsu'}: ${t[4]}`))), sp: 'm' };
    },
    /* misconceptions with a graph */
    (r) => {
      const g = r.pick(GRAPHS.filter((x) => x.fn && !x.one));
      const claim = r.pick([
        [`"The graph passes the vertical line test, so the function must be one-to-one."`, `"Graf ini lulus ujian garis mencancang, jadi fungsi itu mestilah satu dengan satu."`, `Not correct. The vertical line test only shows that it is a function. A horizontal line meets the graph twice, so it is many-to-one.`, `Tidak betul. Ujian garis mencancang hanya menunjukkan ia suatu fungsi. Garis mengufuk memotong graf dua kali, jadi ia banyak dengan satu.`],
        [`"A horizontal line meets the graph at two points, so the graph is not a function."`, `"Garis mengufuk memotong graf pada dua titik, jadi graf ini bukan fungsi."`, `Not correct. Being cut twice by a horizontal line makes the function many-to-one, but it is still a function because no vertical line meets it twice.`, `Tidak betul. Dipotong dua kali oleh garis mengufuk menjadikan fungsi itu banyak dengan satu, tetapi ia masih fungsi kerana tiada garis mencancang memotongnya dua kali.`],
      ]);
      return { q: T(`The diagram shows ${g.en}. A pupil says: ${claim[0]} Is the pupil correct? Explain.`, `Rajah menunjukkan ${g.ms}. Seorang murid berkata: ${claim[1]} Adakah murid itu betul? Terangkan.`), fig: g.fig(), a: T(claim[2], claim[3]), sp: 'm' };
    },
    /* restricting the domain */
    (r) => {
      const R = mkRule(r, ['x2', 'ax2', 'x2+b', 'ax2+b']), v = r.int(1, 5), y = R.f(v);
      return { q: T(`Let $f(x) = ${R.t}$. (a) Find all the inputs, when $x$ may be any number, for which $f(x) = ${y}$. (b) Find the input when the inputs are restricted to $x \\ge 0$. (c) Is $f$ one-to-one on $x \\ge 0$? Explain.`, `Katakan $f(x) = ${R.t}$. (a) Cari semua input, apabila $x$ boleh ialah sebarang nombor, yang menyebabkan $f(x) = ${y}$. (b) Cari input apabila input dihadkan kepada $x \\ge 0$. (c) Adakah $f$ satu dengan satu pada $x \\ge 0$? Terangkan.`), a: P([T(`$x = ${-v}$ or $x = ${v}$`, `$x = ${-v}$ atau $x = ${v}$`), T(`$x = ${v}$`), T('Yes: for $x \\ge 0$ different inputs have different squares, hence different outputs.', 'Ya: bagi $x \\ge 0$ input berbeza mempunyai kuasa dua berbeza, maka output berbeza.')]), sp: 'm' };
    },
    /* compare two rules on one domain */
    (r) => {
      const R1 = mkRule(r, ['x2', 'ax2', 'x2+b', 'ax2+b']), R2 = mkRule(r, ['ax+b', 'x3', 'ax', 'b-ax']);
      const c1 = cls(DOM5.map((x) => [x, R1.f(x)])), c2 = cls(DOM5.map((x) => [x, R2.f(x)]));
      return { q: T(`On the inputs $${setTex(DOM5)}$, compare $f(x) = ${R1.t}$ and $g(x) = ${R2.t}$. Find the outputs of each and state which one is one-to-one and which is many-to-one.`, `Pada input $${setTex(DOM5)}$, bandingkan $f(x) = ${R1.t}$ dan $g(x) = ${R2.t}$. Cari output bagi setiap satu dan nyatakan yang mana satu ialah satu dengan satu dan yang mana satu banyak dengan satu.`), a: T(`$f$: $${setTex(DOM5.map(R1.f))}$, ${CN[c1].en}; $g$: $${setTex(DOM5.map(R2.f))}$, ${CN[c2].en}`, `$f$: $${setTex(DOM5.map(R1.f))}$, ${CN[c1].ms}; $g$: $${setTex(DOM5.map(R2.f))}$, ${CN[c2].ms}`), sp: 'm' };
    },
  ];
  SPM.extend('F2-8.1', { e: g81e, m: g81m, a: g81a });

  /* =========================================== F2-8.2 Graphs of functions y = a x^n */
  const NS = [-2, -1, 1, 2, 3];
  const SHAPE = {
    1: ['a straight line through the origin', 'garis lurus yang melalui asalan'],
    2: ['a smooth U-shaped curve (parabola) through the origin', 'lengkung licin berbentuk U (parabola) yang melalui asalan'],
    3: ['a smooth S-shaped curve through the origin', 'lengkung licin berbentuk S yang melalui asalan'],
    '-1': ['a curve in two separate branches, in opposite quadrants', 'lengkung dengan dua cabang yang terpisah, dalam kuadran yang bertentangan'],
    '-2': ['a curve in two separate branches, both on the same side of the $x$-axis', 'lengkung dengan dua cabang yang terpisah, kedua-duanya pada sebelah yang sama bagi paksi-$x$'],
  };
  function FN(nn, a) {
    const ab = Math.abs(a), sgn = a < 0 ? '-' : '';
    const t = nn === 1 ? poly([[a, 'x']]) : nn === 2 ? poly([[a, 'x^2']]) : nn === 3 ? poly([[a, 'x^3']]) : sgn + dfr(ab, nn === -1 ? 'x' : 'x^2');
    return { n: nn, a, t, f: (x) => a * Math.pow(x, nn), pole: nn < 0, shape: SHAPE[nn] };
  }
  const rndFN = (r, ns, as) => {
    const nn = r.pick(ns || NS);
    return FN(nn, r.pick(as || (nn < 0 ? [1, 2, 4, 6, 8, -2, -4] : [1, 2, 3, -1, -2, -3])));
  };
  const clean = (v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-7 && Math.abs(v) < 60;
  const xsFor = (F, cnt, pos) => {
    const pool = (F.pole ? [-4, -2, -1, -0.5, 0.5, 1, 2, 4] : [-3, -2, -1, 0, 1, 2, 3]).filter((x) => clean(F.f(x)) && (!pos || x > 0));
    return cnt ? r_sorted(pool, cnt) : pool;
  };
  let _r = null;
  const r_sorted = (pool, cnt) => _r.sample(pool, cnt).sort((a, b) => a - b);
  const vs = (F, xs) => xs.map((x) => F.f(x));
  const ynum = (v) => n(round(v, 2));
  const W = [-5, 5], WY = [-8, 8];
  /** graph figure: items [{F, dash, lab}], pts [[x,y,label,hollow]] */
  function gfig(items, o) {
    o = o || {};
    const xr = o.x || W, yr = o.y || WY;
    const curves = [];
    for (const it of items) {
      const f = it.F.f;
      if (it.F.pole) curves.push({ f, from: xr[0], to: -0.04, dash: it.dash }, { f, from: 0.04, to: xr[1], dash: it.dash });
      else curves.push({ f, from: xr[0], to: xr[1], dash: it.dash });
    }
    const extra = ({ sx, sy }) => items.map((it) => {
      if (!it.lab) return '';
      for (const x of it.side < 0 ? [-3.6, -3, -2.5, -2, -1.5] : [3.6, 3, 2.5, 2, 1.5, 1, -3, -2]) { const y = it.F.f(x); if (Math.abs(y) <= yr[1] - 1) return S.text(sx(x) + (x > 0 ? 12 : -12), sy(y) - 7, it.lab, { i: true, s: 12 }); }
      return '';
    }).join('');
    return S.plane({ x: xr, y: yr, scale: o.scale || 18, labelStep: o.step || 2, curves, pts: (o.pts || []).map((p) => ({ x: p[0], y: p[1], l: p[2], hollow: p[3] })), extra, segs: o.segs || [], polys: o.polys || [] });
  }
  const blankFig = () => S.plane({ x: W, y: WY, scale: 18, labelStep: 2 });
  const EQ = (F) => `y = ${F.t}`;
  const EQn = (F) => `y = ${F.t}${F.pole ? ',\\ x \\ne 0' : ''}`;
  const ptsText = (F, xs) => xs.map((x) => `(${n(x)},\\ ${ynum(F.f(x))})`).join(',\\ ');
  const quads = (F) => {
    const q = new Set();
    for (const x of [-3, -2, -1, 1, 2, 3]) { const y = F.f(x); q.add(x > 0 ? (y > 0 ? 1 : 4) : y > 0 ? 2 : 3); }
    return [...q].sort();
  };
  const QN = (qs) => qs.map((q) => ['first', 'second', 'third', 'fourth'][q - 1]).join(' and ');
  const QM = (qs) => qs.map((q) => ['pertama', 'kedua', 'ketiga', 'keempat'][q - 1]).join(' dan ');
  const PROP82 = [
    ['The graph of $y = ax^2$ is symmetrical about the $y$-axis.', 'Graf $y = ax^2$ simetri pada paksi-$y$.', 1, 'The points $(x, y)$ and $(-x, y)$ are both on the graph.', 'Titik $(x, y)$ dan $(-x, y)$ kedua-duanya terletak pada graf.'],
    ['The graph of $y = \\dfrac{a}{x}$ passes through the origin.', 'Graf $y = \\dfrac{a}{x}$ melalui asalan.', 0, 'Zero is not an allowed input, so the graph never reaches $x = 0$ or $y = 0$.', 'Sifar bukan input yang dibenarkan, jadi graf tidak pernah mencapai $x = 0$ atau $y = 0$.'],
    ['The graph of $y = ax^3$ passes through the origin.', 'Graf $y = ax^3$ melalui asalan.', 1, 'When $x = 0$, $y = 0$.', 'Apabila $x = 0$, $y = 0$.'],
    ['For $y = \\dfrac{a}{x^2}$ the $y$-values are all positive when $a > 0$.', 'Bagi $y = \\dfrac{a}{x^2}$ semua nilai $y$ positif apabila $a > 0$.', 1, '$x^2$ is always positive, so $\\dfrac{a}{x^2}$ has the same sign as $a$.', '$x^2$ sentiasa positif, jadi $\\dfrac{a}{x^2}$ mempunyai tanda yang sama dengan $a$.'],
    ['The graph of $y = \\dfrac{a}{x}$ is a straight line.', 'Graf $y = \\dfrac{a}{x}$ ialah garis lurus.', 0, 'It is a curve with two separate branches.', 'Ia ialah lengkung dengan dua cabang yang terpisah.'],
    ['When $a$ is negative, the graph of $y = ax^2$ opens downwards.', 'Apabila $a$ negatif, graf $y = ax^2$ terbuka ke bawah.', 1, 'All its $y$-values are zero or negative.', 'Semua nilai $y$ bagi graf itu sifar atau negatif.'],
    ['Joining the plotted points of $y = x^2$ with straight lines gives the correct graph.', 'Menyambung titik-titik yang diplot bagi $y = x^2$ dengan garis lurus memberikan graf yang betul.', 0, 'The graph is a smooth curve, so the points must be joined smoothly.', 'Graf itu ialah lengkung licin, jadi titik-titik mesti disambung dengan licin.'],
    ['The two branches of $y = \\dfrac{a}{x}$ should be joined by a line through $x = 0$.', 'Dua cabang $y = \\dfrac{a}{x}$ patut disambung oleh garis yang melalui $x = 0$.', 0, 'The graph has no point at $x = 0$, so the two branches stay separate.', 'Graf itu tidak mempunyai titik pada $x = 0$, jadi dua cabang itu kekal terpisah.'],
    ['The graph of $y = ax$ is symmetrical about the $y$-axis.', 'Graf $y = ax$ simetri pada paksi-$y$.', 0, 'It is a straight line through the origin, so it is not symmetrical about the $y$-axis.', 'Ia ialah garis lurus melalui asalan, jadi ia tidak simetri pada paksi-$y$.'],
    ['In $y = ax^n$ with $n = 3$, a negative $x$ gives a negative $y$ when $a > 0$.', 'Dalam $y = ax^n$ dengan $n = 3$, $x$ negatif memberikan $y$ negatif apabila $a > 0$.', 1, 'A negative number cubed is negative.', 'Kuasa tiga nombor negatif ialah negatif.'],
    ['In $y = x^2$, a negative value of $x$ gives a negative value of $y$.', 'Dalam $y = x^2$, nilai $x$ negatif memberikan nilai $y$ negatif.', 0, 'A negative number squared is positive, e.g. $(-3)^2 = 9$.', 'Kuasa dua nombor negatif ialah positif, contohnya $(-3)^2 = 9$.'],
    ['The graph of $y = \\dfrac{a}{x}$ can cross the $x$-axis.', 'Graf $y = \\dfrac{a}{x}$ boleh memotong paksi-$x$.', 0, '$\\dfrac{a}{x}$ is never $0$ when $a \\ne 0$, so the graph never touches the axes.', '$\\dfrac{a}{x}$ tidak pernah $0$ apabila $a \\ne 0$, jadi graf tidak pernah menyentuh paksi.'],
  ];
  const LIFE = [
    { n: 1, en: (a) => `A cyclist rides at a constant speed, so the distance $d$ km after $x$ hours is $d = ${a}x$.`, ms: (a) => `Seorang penunggang basikal menunggang pada laju malar, jadi jarak $d$ km selepas $x$ jam ialah $d = ${a}x$.`, u: ['hours', 'jam'], as: [10, 12, 15, 20] },
    { n: 2, en: (a) => `A stone dropped from a cliff falls a distance $s = ${a}x^2$ metres in $x$ seconds.`, ms: (a) => `Sebiji batu dijatuhkan dari tebing dan jatuh sejauh $s = ${a}x^2$ meter dalam $x$ saat.`, u: ['seconds', 'saat'], as: [5, 4, 2] },
    { n: 3, en: (a) => `A cube of edge $x$ cm has volume $V = x^3$ cm³ (here $a = 1$).`, ms: (a) => `Sebuah kubus bersisi $x$ cm mempunyai isi padu $V = x^3$ cm³ (di sini $a = 1$).`, u: ['cm', 'cm'], as: [1] },
    { n: -1, en: (a) => `The time taken to travel ${a} km at a speed of $x$ km/h is $t = \\dfrac{${a}}{x}$ hours.`, ms: (a) => `Masa yang diambil untuk bergerak ${a} km pada laju $x$ km/j ialah $t = \\dfrac{${a}}{x}$ jam.`, u: ['km/h', 'km/j'], as: [60, 120, 240, 180] },
    { n: -1, en: (a) => `RM${a} is shared equally among $x$ friends, so each gets $y = \\dfrac{${a}}{x}$ ringgit.`, ms: (a) => `RM${a} dikongsi sama rata antara $x$ orang rakan, jadi setiap orang mendapat $y = \\dfrac{${a}}{x}$ ringgit.`, u: ['friends', 'rakan'], as: [12, 24, 48] },
  ];

  const g82e = [
    /* complete the table, n = 1 or 2 */
    (r) => {
      _r = r;
      const F = rndFN(r, [1, 2, 1, 2]), xs = r.pick([[-2, -1, 0, 1, 2], [-3, -2, -1, 0, 1, 2, 3], [-3, -1, 0, 1, 3], [0, 1, 2, 3, 4]]);
      const ph = [
        [`Complete the table of values for $${EQ(F)}$.`, `Lengkapkan jadual nilai bagi $${EQ(F)}$.`],
        [`Copy and complete the table for the function $${EQ(F)}$.`, `Salin dan lengkapkan jadual bagi fungsi $${EQ(F)}$.`],
        [`Find the values of $y$ that are missing from the table for $${EQ(F)}$.`, `Cari nilai $y$ yang tertinggal daripada jadual bagi $${EQ(F)}$.`],
      ];
      const [pe, pm] = r.pick(ph);
      return { q: T(`${pe}<br>${blanks(xs)}`, `${pm}<br>${blanks(xs)}`), a: T(`$y = ${listTex(xs, F.f)}$`), sp: 's' };
    },
    /* plot the points and draw */
    (r) => {
      _r = r;
      const F = rndFN(r, [1, 2, 2, 3], [1, 2, -1, -2]), xs = [-2, -1, 0, 1, 2];
      const ph = [
        [`Complete the table for $${EQ(F)}$, then plot the points on the grid and draw a smooth graph.`, `Lengkapkan jadual bagi $${EQ(F)}$, kemudian plotkan titik pada grid dan lukis graf yang licin.`],
        [`(a) Fill in the table for $${EQ(F)}$. (b) Plot the points and join them to make the graph.`, `(a) Isikan jadual bagi $${EQ(F)}$. (b) Plotkan titik dan sambungkannya untuk membentuk graf.`],
      ];
      const [pe, pm] = r.pick(ph);
      return { q: T(`${pe}<br>${blanks(xs)}`, `${pm}<br>${blanks(xs)}`), fig: blankFig(), a: T(`$${ptsText(F, xs)}$; the graph is ${F.shape[0]}.`, `$${ptsText(F, xs)}$; graf itu ialah ${F.shape[1]}.`), sp: 'xl' };
    },
    /* read y from a graph at an integer x */
    (r) => {
      _r = r;
      const F = rndFN(r, [1, 2, 3], [1, 2, -1, -2]);
      const x = r.pick([-2, -1, 1, 2]);
      need(Math.abs(F.f(x)) <= 7);
      const ph = [
        [`The graph of $${EQ(F)}$ is drawn. Use the graph to find the value of $y$ when $x = ${x}$.`, `Graf bagi $${EQ(F)}$ dilukis. Gunakan graf itu untuk mencari nilai $y$ apabila $x = ${x}$.`],
        [`From the graph of $${EQ(F)}$, read off the $y$-coordinate of the point where $x = ${x}$.`, `Daripada graf $${EQ(F)}$, baca koordinat-$y$ bagi titik yang $x = ${x}$.`],
      ];
      return { q: TT(r.pick(ph)), fig: gfig([{ F }], { pts: [[x, F.f(x), '', true]] }), a: T(`$y = ${n(F.f(x))}$`), sp: 'xs' };
    },
    /* read x from a graph */
    (r) => {
      _r = r;
      const F = rndFN(r, [1, 2, 3], [1, 2, -1, -2]), x = r.pick([1, 2, 3]), y = F.f(x);
      need(Math.abs(y) <= 7);
      const xsA = F.n === 2 ? [-x, x] : [x];
      return { q: T(`The graph of $${EQ(F)}$ is shown. Find the value(s) of $x$ when $y = ${y}$.`, `Graf bagi $${EQ(F)}$ ditunjukkan. Cari nilai $x$ apabila $y = ${y}$.`), fig: gfig([{ F }]), a: T(`$x = ${xsA.join(' \\text{ or } ')}$`, `$x = ${xsA.join(' \\text{ atau } ')}$`), sp: 's' };
    },
    /* shape of the graph MCQ */
    (r) => {
      const F = rndFN(r), opts = r.shuffle(NS), L = 'ABCD', ch = opts.slice(0, 4).includes(F.n) ? opts.slice(0, 4) : [F.n, ...opts.filter((v) => v !== F.n).slice(0, 3)];
      const sh = r.shuffle(ch), cor = sh.indexOf(F.n);
      const ph = [
        [`The graph of $${EQn(F)}$ is`, `Graf bagi $${EQn(F)}$ ialah`],
        [`Which description fits the graph of $${EQn(F)}$?`, `Huraian yang manakah sesuai dengan graf $${EQn(F)}$?`],
      ];
      const [pe, pm] = r.pick(ph);
      const list = (k) => sh.map((v, j) => `(${L[j]}) ${SHAPE[v][k]}`).join('<br>');
      return { q: T(`${pe}<br>${list(0)}`, `${pm}<br>${list(1)}`), a: T(`(${L[cor]}) ${SHAPE[F.n][0]}`, `(${L[cor]}) ${SHAPE[F.n][1]}`), sp: 's' };
    },
    /* is the point on the graph? */
    (r) => {
      _r = r;
      const F = rndFN(r, [1, 2, 3], [1, 2, 3, -1, -2, -3]), x = r.int(-3, 3), on = r.chance(), y0 = F.f(x);
      const y = on ? y0 : r.pick([-y0, y0 + r.pick([-2, -1, 1, 2]), y0 * 2]);
      need(on || y !== y0);
      return { q: T(`Does the point $(${x},\\ ${y})$ lie on the graph of $${EQ(F)}$? Show your working.`, `Adakah titik $(${x},\\ ${y})$ terletak pada graf $${EQ(F)}$? Tunjukkan langkah kerja anda.`), a: T(`${on ? 'Yes' : 'No'}: when $x = ${x}$, $y = ${n(y0)}$${on ? '' : `, not $${y}$`}.`, `${on ? 'Ya' : 'Tidak'}: apabila $x = ${x}$, $y = ${n(y0)}$${on ? '' : `, bukan $${y}$`}.`), sp: 's' };
    },
    /* symmetry pair */
    (r) => {
      _r = r;
      const F = rndFN(r, [2, 2, 3, 1]), x = r.int(1, 3);
      return { q: T(`For $${EQ(F)}$, find $y$ when (a) $x = ${x}$, (b) $x = ${-x}$. What do you notice?`, `Bagi $${EQ(F)}$, cari $y$ apabila (a) $x = ${x}$, (b) $x = ${-x}$. Apakah yang anda perhatikan?`), a: P([T(`$${n(F.f(x))}$`), T(`$${n(F.f(-x))}$`), F.n === 2 ? T('The two values are equal, so the graph is symmetrical about the $y$-axis.', 'Dua nilai itu sama, jadi graf simetri pada paksi-$y$.') : T('The two values are negatives of each other, so the graph is symmetrical about the origin.', 'Dua nilai itu ialah negatif antara satu sama lain, jadi graf simetri pada asalan.')]), sp: 's' };
    },
    /* table -> equation MCQ */
    (r) => {
      _r = r;
      const F = rndFN(r, [1, 2, 3], [1, 2, 3, -1, -2]), xs = [1, 2, 3];
      const cands = [F];
      for (const nn of r.shuffle(NS.filter((v) => v > 0))) if (cands.length < 4) { const G = FN(nn, r.pick([1, 2, 3])); if (xs.some((x) => G.f(x) !== F.f(x))) cands.push(G); }
      need(cands.length === 4 && cands.every((c, i) => cands.findIndex((d) => d.t === c.t) === i));
      const sh = r.shuffle(cands), L = 'ABCD', cor = sh.indexOf(F);
      return { q: T(`The table shows some values of $x$ and $y$ for a function $y = ax^n$. Which equation gives the table?<br>${valsTable(xs, vs(F, xs))}${sh.map((c, j) => `(${L[j]}) $y = ${c.t}$`).join('&emsp;')}`, `Jadual menunjukkan beberapa nilai $x$ dan $y$ bagi fungsi $y = ax^n$. Persamaan yang manakah memberikan jadual itu?<br>${valsTable(xs, vs(F, xs))}${sh.map((c, j) => `(${L[j]}) $y = ${c.t}$`).join('&emsp;')}`), a: T(`(${L[cor]}) $y = ${F.t}$`), sp: 's' };
    },
    /* sign of a from a figure */
    (r) => {
      const F = rndFN(r, [1, 2], [1, 2, 3, -1, -2, -3]);
      const ph = [
        [`The graph of $y = ax${F.n === 2 ? '^2' : ''}$ is shown. Is $a$ positive or negative? Give a reason.`, `Graf bagi $y = ax${F.n === 2 ? '^2' : ''}$ ditunjukkan. Adakah $a$ positif atau negatif? Berikan sebab.`],
        [`The diagram shows the graph of $y = ax${F.n === 2 ? '^2' : ''}$. State the sign of $a$.`, `Rajah menunjukkan graf $y = ax${F.n === 2 ? '^2' : ''}$. Nyatakan tanda bagi $a$.`],
      ];
      const pos = F.a > 0;
      return { q: TT(r.pick(ph)), fig: gfig([{ F }]), a: F.n === 2 ? (pos ? T('Positive: the curve opens upwards (all $y \\ge 0$).', 'Positif: lengkung terbuka ke atas (semua $y \\ge 0$).') : T('Negative: the curve opens downwards (all $y \\le 0$).', 'Negatif: lengkung terbuka ke bawah (semua $y \\le 0$).')) : (pos ? T('Positive: the line rises from left to right.', 'Positif: garis naik dari kiri ke kanan.') : T('Negative: the line falls from left to right.', 'Negatif: garis turun dari kiri ke kanan.')), sp: 's' };
    },
    /* x that is not allowed */
    (r) => {
      const F = rndFN(r, [-1, -2, -1]);
      const ph = [
        [`Which value of $x$ cannot be used in the table for $${EQn(F).replace(/,\\ x \\ne 0/, '')}$: $-2$, $0$ or $2$? Explain.`, `Nilai $x$ yang manakah tidak boleh digunakan dalam jadual bagi $${EQ(F)}$: $-2$, $0$ atau $2$? Terangkan.`],
        [`A pupil wants to include $x = 0$ in the table for $${EQ(F)}$. Explain why this is not possible.`, `Seorang murid mahu memasukkan $x = 0$ dalam jadual bagi $${EQ(F)}$. Terangkan mengapa ini tidak boleh.`],
      ];
      return { q: TT(r.pick(ph)), a: T(`$x = 0$: the rule needs division by $0$, which is not defined, so the graph has no point at $x = 0$.`, `$x = 0$: peraturan itu memerlukan pembahagian dengan $0$ yang tidak ditakrifkan, jadi graf tidak mempunyai titik pada $x = 0$.`), sp: 's' };
    },
    /* real-life proportional or simple functions: evaluate */
    (r) => {
      const c = r.pick(LIFE.filter((x) => x.n !== -1)), a = r.pick(c.as), x = r.int(2, 5), F = FN(c.n, a);
      return { q: T(`${c.en(a)} Find the value of the output when $x = ${x}$.`, `${c.ms(a)} Cari nilai output apabila $x = ${x}$.`), a: T(`${n(F.f(x))}`), sp: 'xs' };
    },
  ];

  const g82m = [
    /* table with n = 3, -1, -2 */
    (r) => {
      _r = r;
      const F = rndFN(r, [3, -1, -2, 3]), xs = xsFor(F, F.pole ? 6 : 5);
      need(xs.length >= 5 || F.pole);
      const ph = [
        [`Complete the table for $${EQn(F)}$.`, `Lengkapkan jadual bagi $${EQn(F)}$.`],
        [`Calculate the missing values of $y$ for the function $${EQn(F)}$.`, `Hitung nilai $y$ yang tertinggal bagi fungsi $${EQn(F)}$.`],
      ];
      const [pe, pm] = r.pick(ph);
      return { q: T(`${pe}<br>${blanks(xs)}`, `${pm}<br>${blanks(xs)}`), a: T(`$y = ${listTex(xs, (x) => ynum(F.f(x)))}$`), sp: 's' };
    },
    /* compare two members */
    (r) => {
      _r = r;
      const nn = r.pick([1, 2, 3]), a = r.pick([1, 2, 3]), b = r.pick([-a, 2 * a, 3 * a, -2 * a]), F = FN(nn, a), G = FN(nn, b), xs = [-2, -1, 1, 2];
      const cmp = b === -a ? T('The $y$-values of the second are the negatives of the first: the graphs are reflections in the $x$-axis.', 'Nilai $y$ bagi yang kedua ialah negatif bagi yang pertama: graf-grafnya ialah pantulan pada paksi-$x$.') : T(`Every $y$-value of the second is ${n(b / a)} times the corresponding value of the first.`, `Setiap nilai $y$ bagi yang kedua ialah ${n(b / a)} kali nilai yang sepadan bagi yang pertama.`);
      return { q: T(`(a) Complete the tables for $y = ${F.t}$ and $y = ${G.t}$.<br>${blanks(xs, '$x$', `$y = ${F.t}$`)}<br>${blanks(xs, '$x$', `$y = ${G.t}$`)}(b) Compare the two rows of $y$-values.`, `(a) Lengkapkan jadual bagi $y = ${F.t}$ dan $y = ${G.t}$.<br>${blanks(xs, '$x$', `$y = ${F.t}$`)}<br>${blanks(xs, '$x$', `$y = ${G.t}$`)}(b) Bandingkan dua baris nilai $y$.`), a: P([T(`$y = ${F.t}$: $${listTex(xs, F.f)}$; $y = ${G.t}$: $${listTex(xs, G.f)}$`), cmp]), sp: 'm' };
    },
    /* read y at a fractional x */
    (r) => {
      _r = r;
      const F = rndFN(r, [1, 2, 3], [1, 2, -1, -2]), x = r.pick([-2.5, -1.5, -0.5, 0.5, 1.5, 2.5]), y = F.f(x);
      need(Math.abs(y) <= 7.5);
      return { q: T(`The graph of $${EQ(F)}$ is drawn. Use the graph to estimate the value of $y$ when $x = ${n(x)}$.`, `Graf bagi $${EQ(F)}$ dilukis. Gunakan graf untuk menganggar nilai $y$ apabila $x = ${n(x)}$.`), fig: gfig([{ F }], { pts: [[x, y, '', true]] }), a: T(`$y \\approx ${ynum(y)}$ (accept a small reading error)`, `$y \\approx ${ynum(y)}$ (terima ralat bacaan yang kecil)`), sp: 's' };
    },
    /* identify the equation from a graph (MCQ) */
    (r) => {
      _r = r;
      const F = rndFN(r, NS, [1, 2, -1, -2, 4, 3]);
      const x0 = r.pick(F.pole ? [1, 2] : [1, 2, -1, -2]), pt = [x0, F.f(x0)];
      need(Math.abs(pt[1]) <= 7.5 && clean(pt[1]));
      const cands = [F];
      for (const nn of r.shuffle(NS)) { const G = FN(nn, F.a); if (cands.length < 4 && G.t !== F.t) cands.push(G); }
      const sh = r.shuffle(cands), L = 'ABCD', cor = sh.indexOf(F);
      return { q: T(`The graph passes through the point $(${pt[0]},\\ ${n(pt[1])})$. Which equation represents the graph?<br>${sh.map((c, j) => `(${L[j]}) $${EQ(c)}$`).join('&emsp;')}`, `Graf melalui titik $(${pt[0]},\\ ${n(pt[1])})$. Persamaan yang manakah mewakili graf itu?<br>${sh.map((c, j) => `(${L[j]}) $${EQ(c)}$`).join('&emsp;')}`), fig: gfig([{ F }], { pts: [[pt[0], pt[1], `(${pt[0]}, ${n(pt[1])})`]] }), a: T(`(${L[cor]}) $${EQ(F)}$`), sp: 's' };
    },
    /* two curves: match */
    (r) => {
      _r = r;
      const ns2 = r.sample(NS, 2), F = FN(ns2[0], r.pick(ns2[0] < 0 ? [4, 6] : [1, 2, -1])), G = FN(ns2[1], r.pick(ns2[1] < 0 ? [4, 6] : [1, 2, -1]));
      const swap = r.chance(), items = swap ? [{ F: G, lab: 'A' }, { F, lab: 'B', dash: true }] : [{ F, lab: 'A' }, { F: G, lab: 'B', dash: true }];
      const first = swap ? G : F, second = swap ? F : G;
      return { q: T(`The diagram shows the graphs of $${EQ(F)}$ and $${EQ(G)}$. Which curve, $A$ (solid) or $B$ (dashed), is the graph of $${EQ(F)}$? Give a reason.`, `Rajah menunjukkan graf bagi $${EQ(F)}$ dan $${EQ(G)}$. Lengkung yang manakah, $A$ (penuh) atau $B$ (putus-putus), ialah graf bagi $${EQ(F)}$? Berikan sebab.`), fig: gfig(items), a: T(`Curve $${first === F ? 'A' : 'B'}$: it is ${F.shape[0]}.`, `Lengkung $${first === F ? 'A' : 'B'}$: ia ialah ${F.shape[1]}.`), sp: 's' };
    },
    /* quadrants */
    (r) => {
      const F = rndFN(r), qs = quads(F);
      return { q: T(`In which quadrants does the graph of $${EQn(F)}$ lie? Explain using the signs of $x$ and $y$.`, `Dalam kuadran yang manakah graf $${EQn(F)}$ terletak? Terangkan menggunakan tanda bagi $x$ dan $y$.`), a: T(`The ${QN(qs)} quadrant${qs.length > 1 ? 's' : ''}.`, `Kuadran ${QM(qs)}.`), sp: 's' };
    },
    /* two values of x for one y, incl. n = -2 */
    (r) => {
      _r = r;
      const F = rndFN(r, [2, -2, 2, 3, -1], [1, 2, 4, -1, -2]), x = r.pick([1, 2, 3, 4]), y = F.f(x);
      need(clean(y) && Math.abs(y) <= 60);
      const sol = [-4, -3, -2, -1, 1, 2, 3, 4].filter((v) => Math.abs(F.f(v) - y) < 1e-9);
      return { q: T(`Use the equation $${EQn(F)}$ to find every value of $x$ for which $y = ${n(y)}$. How many values are there?`, `Gunakan persamaan $${EQn(F)}$ untuk mencari setiap nilai $x$ yang memberikan $y = ${n(y)}$. Berapakah bilangan nilai itu?`), a: T(`$x = ${sol.join(' \\text{ or } ')}$ (${sol.length} value${sol.length > 1 ? 's' : ''})`, `$x = ${sol.join(' \\text{ atau } ')}$ (${sol.length} nilai)`), sp: 's' };
    },
    /* find a from a point, then evaluate */
    (r) => {
      _r = r;
      const nn = r.pick(NS), a = nn < 0 ? r.pick([2, 4, 6, 8, -4, -6]) : r.pick([2, 3, 4, -2, -3]), F = FN(nn, a), x0 = r.pick(F.pole ? [1, 2] : [1, 2]), x1 = r.pick(F.pole ? [-2, 1, 4] : [-2, -1, 3]);
      need(x1 !== x0 && clean(F.f(x1)) && Math.abs(F.f(x0)) < 50);
      const nm = nn === 1 ? 'ax' : nn === 2 ? 'ax^2' : nn === 3 ? 'ax^3' : nn === -1 ? '\\dfrac{a}{x}' : '\\dfrac{a}{x^2}';
      return { q: T(`The graph of $y = ${nm}$ passes through the point $(${x0},\\ ${n(F.f(x0))})$. Find (a) the value of $a$, (b) the value of $y$ when $x = ${x1}$.`, `Graf $y = ${nm}$ melalui titik $(${x0},\\ ${n(F.f(x0))})$. Cari (a) nilai $a$, (b) nilai $y$ apabila $x = ${x1}$.`), a: P([T(`$a = ${a}$`), T(`$y = ${ynum(F.f(x1))}$`)]), sp: 'm' };
    },
    /* spot the wrong entry in a table */
    (r) => {
      _r = r;
      const F = rndFN(r, [2, 3, -1, -2, 2], [1, 2, 3, -1, 4]), xs = xsFor(F, 5);
      const cand = xs.map((x, i) => i).filter((i) => xs[i] < 0 && F.f(xs[i]) !== 0);
      need(cand.length);
      const i = r.pick(cand), ys = vs(F, xs).slice();
      ys[i] = -ys[i];
      const tb = valsTable(xs, ys);
      return { q: T(`A pupil completed this table for $${EQn(F)}$ but made one mistake. Find the wrong value and write the correct one.<br>${tb}`, `Seorang murid melengkapkan jadual ini bagi $${EQn(F)}$ tetapi membuat satu kesilapan. Cari nilai yang salah dan tulis nilai yang betul.<br>${tb}`), a: T(`When $x = ${xs[i]}$, $y$ should be $${ynum(F.f(xs[i]))}$, not $${ynum(ys[i])}$.`, `Apabila $x = ${xs[i]}$, $y$ sepatutnya $${ynum(F.f(xs[i]))}$, bukan $${ynum(ys[i])}$.`), sp: 's' };
    },
    /* trend in a table */
    (r) => {
      _r = r;
      const F = rndFN(r, [-1, -2, 3, 2, 1], [1, 2, 4, 8]), xs = [1, 2, 4].filter((x) => clean(F.f(x)));
      need(xs.length === 3);
      const ys = vs(F, xs), up = ys[2] > ys[0];
      return { q: T(`For $${EQn(F)}$, complete the values of $y$ when $x = 1, 2, 4$. As $x$ increases from 1 to 4 (for $x > 0$), does $y$ increase or decrease?`, `Bagi $${EQn(F)}$, lengkapkan nilai $y$ apabila $x = 1, 2, 4$. Apabila $x$ bertambah daripada 1 kepada 4 (untuk $x > 0$), adakah $y$ bertambah atau berkurang?`), a: T(`$y = ${ys.map(ynum).join(',\\ ')}$; $y$ ${up ? 'increases' : 'decreases'}.`, `$y = ${ys.map(ynum).join(',\\ ')}$; $y$ ${up ? 'bertambah' : 'berkurang'}.`), sp: 's' };
    },
    /* true / false property bank */
    (r) => {
      const t = r.pick(PROP82);
      return { q: T(`True or false? Give a reason: "${t[0]}"`, `Benar atau palsu? Berikan sebab: "${t[1]}"`), a: T(`${t[2] ? 'True' : 'False'}. ${t[3]}`, `${t[2] ? 'Benar' : 'Palsu'}. ${t[4]}`), sp: 's' };
    },
    /* real-life relation, table and reading */
    (r) => {
      _r = r;
      const c = r.pick(LIFE), a = r.pick(c.as), F = FN(c.n, a), xs = c.n < 0 ? [2, 3, 4, 6].filter((x) => clean(F.f(x))) : [1, 2, 3, 4], x = r.pick(xs), y = F.f(x);
      need(xs.length >= 3 && clean(y));
      return { q: T(`${c.en(a)} (a) Complete the table of values for $x = ${xs.join(', ')}$. (b) Find the value of $x$ that gives the output $${ynum(y)}$.<br>${blanks(xs)}`, `${c.ms(a)} (a) Lengkapkan jadual nilai bagi $x = ${xs.join(', ')}$. (b) Cari nilai $x$ yang memberikan output $${ynum(y)}$.<br>${blanks(xs)}`), a: P([T(`$y = ${xs.map((v) => ynum(F.f(v))).join(',\\ ')}$`), T(`$x = ${x}$`)]), sp: 'm' };
    },
    /* wrong joining */
    (r) => {
      _r = r;
      const bad = r.pick(['seg', 'gap']);
      let fig, ans;
      if (bad === 'seg') { const a = r.pick([1, 2]), F = FN(2, a); fig = gfig([], { polys: [{ p: [-2, -1, 0, 1, 2].map((x) => [x, F.f(x)]), open: true }], pts: [-2, -1, 0, 1, 2].map((x) => [x, F.f(x)]) }); ans = T(`The points of $y = ${F.t}$ are joined by straight lines. They should be joined by a smooth curve (a parabola).`, `Titik-titik bagi $y = ${F.t}$ disambung dengan garis lurus. Sepatutnya disambung dengan lengkung licin (parabola).`); }
      else { const F = FN(-1, r.pick([2, 4])); fig = gfig([], { polys: [{ p: [-2, -1, 1, 2].map((x) => [x, F.f(x)]), open: true }], pts: [-2, -1, 1, 2].map((x) => [x, F.f(x)]) }); ans = T(`The two branches of $y = ${F.t}$ are joined across $x = 0$. There is no point at $x = 0$, so the branches must stay separate and be drawn as smooth curves.`, `Dua cabang bagi $y = ${F.t}$ disambung melintasi $x = 0$. Tiada titik pada $x = 0$, jadi cabang-cabang itu mesti kekal terpisah dan dilukis sebagai lengkung licin.`); }
      return { q: T('A pupil plotted the points of a graph from a table and joined them as shown. Describe the mistake in the way the graph was drawn.', 'Seorang murid memplot titik-titik suatu graf daripada jadual dan menyambungnya seperti yang ditunjukkan. Huraikan kesilapan dalam cara graf itu dilukis.'), fig, a: ans, sp: 's' };
    },
    /* plot from table, quadrants, origin */
    (r) => {
      _r = r;
      const F = rndFN(r, [3, -1, -2, 2], [1, 2, -1, -2]), xs = xsFor(F, 5);
      return { q: T(`(a) Complete the table for $${EQn(F)}$. (b) Plot the points and draw the graph. (c) State whether the graph passes through the origin.<br>${blanks(xs)}`, `(a) Lengkapkan jadual bagi $${EQn(F)}$. (b) Plotkan titik dan lukis graf. (c) Nyatakan sama ada graf itu melalui asalan.<br>${blanks(xs)}`), fig: blankFig(), a: P([T(`$y = ${xs.map((x) => ynum(F.f(x))).join(',\\ ')}$`), T(`The graph is ${F.shape[0]}.`, `Graf itu ialah ${F.shape[1]}.`), F.pole ? T('No: $x = 0$ is not allowed, so the graph never reaches the origin.', 'Tidak: $x = 0$ tidak dibenarkan, jadi graf tidak pernah sampai ke asalan.') : T('Yes: when $x = 0$, $y = 0$.', 'Ya: apabila $x = 0$, $y = 0$.')]), sp: 'xl' };
    },
  ];

  const LIFE2 = [
    { n: 2, ge: (a, x0, y0) => `The distance $s$ metres fallen by a stone in $t$ seconds is $s = at^2$. After ${x0} seconds it has fallen ${y0} m.`, gm: (a, x0, y0) => `Jarak $s$ meter yang dijatuhi oleh sebiji batu dalam $t$ saat ialah $s = at^2$. Selepas ${x0} saat ia telah jatuh sejauh ${y0} m.`, xs: [2, 3], as: [4, 5], sy: 'metres', sm: 'meter' },
    { n: -1, ge: (a, x0, y0) => `The time $t$ hours for a journey at a constant speed of $v$ km/h is $t = \\dfrac{k}{v}$. At ${x0} km/h the journey takes ${y0} hours.`, gm: (a, x0, y0) => `Masa $t$ jam bagi suatu perjalanan pada laju malar $v$ km/j ialah $t = \\dfrac{k}{v}$. Pada ${x0} km/j perjalanan itu mengambil masa ${y0} jam.`, xs: [40, 60, 80], as: [2, 3, 4], sy: 'hours', sm: 'jam' },
    { n: -1, ge: (a, x0, y0) => `A prize is shared equally among $x$ winners, so each winner receives $y = \\dfrac{k}{x}$ ringgit. With ${x0} winners each receives RM${y0}.`, gm: (a, x0, y0) => `Sebuah hadiah dikongsi sama rata antara $x$ orang pemenang, jadi setiap pemenang menerima $y = \\dfrac{k}{x}$ ringgit. Dengan ${x0} orang pemenang setiap seorang menerima RM${y0}.`, xs: [2, 3, 4, 5], as: [12, 20, 30, 60], sy: 'ringgit', sm: 'ringgit' },
  ];
  const CLAIM = [
    (r) => { const k = r.pick([4, 6, 8]); return [`A pupil says that the graph of $y = \\dfrac{${k}}{x}$ crosses the $y$-axis at $(0,\\ ${k})$.`, `Seorang murid berkata graf $y = \\dfrac{${k}}{x}$ memotong paksi-$y$ pada $(0,\\ ${k})$.`, `Not correct. $x = 0$ is not allowed, so the graph has no point on the $y$-axis; it only gets closer and closer to it.`, `Tidak betul. $x = 0$ tidak dibenarkan, jadi graf tidak mempunyai titik pada paksi-$y$; ia hanya menghampirinya semakin dekat.`]; },
    (r) => { const k = r.pick([2, 4, 12]); return [`A pupil says that $y = \\dfrac{${k}}{x}$ becomes $0$ when $x$ is very large, so the graph meets the $x$-axis.`, `Seorang murid berkata $y = \\dfrac{${k}}{x}$ menjadi $0$ apabila $x$ sangat besar, jadi graf bertemu paksi-$x$.`, `Not correct. $y$ gets very small but is never exactly $0$, because $${k}$ divided by any number is not $0$. The graph approaches the $x$-axis without touching it.`, `Tidak betul. $y$ menjadi sangat kecil tetapi tidak pernah tepat $0$, kerana $${k}$ dibahagi dengan sebarang nombor bukan $0$. Graf menghampiri paksi-$x$ tanpa menyentuhnya.`]; },
    (r) => [`A pupil says that the graph of $y = x^3$ is a parabola, just like $y = x^2$.`, `Seorang murid berkata graf $y = x^3$ ialah parabola, sama seperti $y = x^2$.`, `Not correct. $y = x^2$ is U-shaped with all $y \\ge 0$. $y = x^3$ is S-shaped: it is negative when $x$ is negative and positive when $x$ is positive.`, `Tidak betul. $y = x^2$ berbentuk U dengan semua $y \\ge 0$. $y = x^3$ berbentuk S: ia negatif apabila $x$ negatif dan positif apabila $x$ positif.`],
    (r) => { const k = r.pick([2, 4, 8]); return [`A pupil says that the graph of $y = \\dfrac{${k}}{x^2}$ has one branch in the first quadrant and one in the third quadrant.`, `Seorang murid berkata graf $y = \\dfrac{${k}}{x^2}$ mempunyai satu cabang dalam kuadran pertama dan satu dalam kuadran ketiga.`, `Not correct. $x^2$ is always positive, so $y$ is always positive: the branches are in the first and second quadrants.`, `Tidak betul. $x^2$ sentiasa positif, jadi $y$ sentiasa positif: cabang-cabang itu berada dalam kuadran pertama dan kedua.`]; },
    (r) => { const a = r.pick([1, 2, 3]); return [`A pupil says that $y = -${a === 1 ? '' : a}x^2$ has some positive $y$-values, for example when $x = -2$.`, `Seorang murid berkata $y = -${a === 1 ? '' : a}x^2$ mempunyai beberapa nilai $y$ positif, contohnya apabila $x = -2$.`, `Not correct. When $x = -2$, $y = -${a}(-2)^2 = ${-4 * a}$. Since $x^2 \\ge 0$, every $y$-value is $0$ or negative.`, `Tidak betul. Apabila $x = -2$, $y = -${a}(-2)^2 = ${-4 * a}$. Oleh sebab $x^2 \\ge 0$, setiap nilai $y$ ialah $0$ atau negatif.`]; },
    (r) => [`A pupil says that to draw $y = \\dfrac{6}{x}$ we may join the points $(-1,\\ -6)$ and $(1,\\ 6)$ with a straight line, because both points are on the graph.`, `Seorang murid berkata untuk melukis $y = \\dfrac{6}{x}$ kita boleh menyambung titik $(-1,\\ -6)$ dan $(1,\\ 6)$ dengan garis lurus, kerana kedua-dua titik berada pada graf.`, `Not correct. The graph has two separate branches and no point at $x = 0$; a line joining the points would pass through $(0,\\ 0)$, which is not on the graph.`, `Tidak betul. Graf mempunyai dua cabang yang terpisah dan tiada titik pada $x = 0$; garis yang menyambung titik itu akan melalui $(0,\\ 0)$ yang tidak berada pada graf.`],
  ];
  const g82a = [
    /* near zero */
    (r) => {
      const nn = r.pick([-1, -2]), k = r.pick([1, 2, 4, 5]), F = FN(nn, k), xs = [1, 0.5, 0.1, 0.01];
      const ph = [
        [`(a) Complete the table for $y = ${F.t}$. (b) What happens to $y$ as $x$ gets closer to $0$ from the positive side? (c) Explain why the graph never touches the $y$-axis.`, `(a) Lengkapkan jadual bagi $y = ${F.t}$. (b) Apakah yang berlaku kepada $y$ apabila $x$ menghampiri $0$ dari sebelah positif? (c) Terangkan mengapa graf tidak pernah menyentuh paksi-$y$.`],
        [`Investigate $y = ${F.t}$ for small positive values of $x$: complete the table, describe the trend of $y$, and say why $x = 0$ is not used.`, `Siasat $y = ${F.t}$ bagi nilai $x$ positif yang kecil: lengkapkan jadual, huraikan aliran $y$, dan nyatakan mengapa $x = 0$ tidak digunakan.`],
      ];
      const [pe, pm] = r.pick(ph);
      return { q: T(`${pe}<br>${blanks(xs)}`, `${pm}<br>${blanks(xs)}`), a: P([T(`$y = ${xs.map((x) => ynum(F.f(x))).join(',\\ ')}$`), T('$y$ becomes larger and larger (without any limit).', '$y$ menjadi semakin besar (tanpa had).'), T('$x = 0$ would need division by $0$, so there is no point on the $y$-axis; the curve only gets closer to it.', '$x = 0$ memerlukan pembahagian dengan $0$, jadi tiada titik pada paksi-$y$; lengkung hanya menghampirinya.')]), sp: 'l' };
    },
    /* positive and negative a */
    (r) => {
      _r = r;
      const nn = r.pick(NS), a = r.pick(nn < 0 ? [2, 4] : [1, 2, 3]), F = FN(nn, a), G = FN(nn, -a);
      const xs = r.pick(nn < 0 ? [[1, 2, 4]] : [[1, 2, 3]])[0];
      return { q: T(`(a) Find the values of $y$ for $y = ${F.t}$ and $y = ${G.t}$ when $x = ${xs.join(', ')}$. (b) State the quadrants in which each graph lies. (c) Describe how the two graphs are related.`, `(a) Cari nilai $y$ bagi $y = ${F.t}$ dan $y = ${G.t}$ apabila $x = ${xs.join(', ')}$. (b) Nyatakan kuadran yang dilalui oleh setiap graf. (c) Huraikan hubungan antara dua graf itu.`), fig: gfig([{ F, lab: 'A' }, { F: G, lab: 'B', dash: true, side: nn % 2 === 0 ? 1 : 1 }]), a: P([T(`$${F.t}$: $${listTex(xs, (x) => ynum(F.f(x)))}$; $${G.t}$: $${listTex(xs, (x) => ynum(G.f(x)))}$`), T(`$${F.t}$: ${QN(quads(F))} quadrant${quads(F).length > 1 ? 's' : ''}; $${G.t}$: ${QN(quads(G))} quadrant${quads(G).length > 1 ? 's' : ''}.`, `$${F.t}$: kuadran ${QM(quads(F))}; $${G.t}$: kuadran ${QM(quads(G))}.`), T('Each $y$-value of one graph is the negative of the other: the graphs are reflections of each other in the $x$-axis.', 'Setiap nilai $y$ bagi satu graf ialah negatif bagi yang lain: graf-graf itu ialah pantulan antara satu sama lain pada paksi-$x$.')]), sp: 'l' };
    },
    /* infer n and a from two labelled points */
    (r) => {
      _r = r;
      const F = rndFN(r, NS, [1, 2, 3, -1, -2, -3, 4]), x1 = r.pick([1, 2]), x2 = r.pick([2, 4, -2].filter((v) => v !== x1));
      need(clean(F.f(x1)) && clean(F.f(x2)) && Math.abs(F.f(x1)) < 30 && Math.abs(F.f(x2)) < 30 && F.f(x1) !== 0);
      const fits = [];
      for (const nn of NS) for (const a of [-8, -6, -4, -3, -2, -1, 1, 2, 3, 4, 6, 8, 12, 16, 24]) { const G = FN(nn, a); if (Math.abs(G.f(x1) - F.f(x1)) < 1e-9 && Math.abs(G.f(x2) - F.f(x2)) < 1e-9) fits.push(G); }
      need(fits.length === 1 && fits[0].t === F.t);
      return { q: T(`The graph of a function of the form $y = ax^n$, where $n \\in \\{-2, -1, 1, 2, 3\\}$, passes through the points $(${x1},\\ ${n(F.f(x1))})$ and $(${x2},\\ ${n(F.f(x2))})$. Its shape is ${F.shape[0]}. Find the equation of the graph.`, `Graf suatu fungsi berbentuk $y = ax^n$, dengan $n \\in \\{-2, -1, 1, 2, 3\\}$, melalui titik $(${x1},\\ ${n(F.f(x1))})$ dan $(${x2},\\ ${n(F.f(x2))})$. Bentuknya ialah ${F.shape[1]}. Cari persamaan graf itu.`), fig: gfig([{ F }], { pts: [[x1, F.f(x1), `(${x1}, ${n(F.f(x1))})`], [x2, F.f(x2), '']].filter((p) => Math.abs(p[1]) <= 7.5 && Math.abs(p[0]) <= 5) }), a: T(`$${EQ(F)}$`), w: T(`Try each $n$ and find $a$; only one fits both points.`, `Cuba setiap $n$ dan cari $a$; hanya satu yang sepadan dengan kedua-dua titik.`), sp: 'm' };
    },
    /* claims to critique */
    (r) => {
      const c = r.pick(CLAIM)(r);
      return { q: T(`${c[0]} Is the pupil correct? Explain.`, `${c[1]} Adakah murid itu betul? Terangkan.`), a: T(c[2], c[3]), sp: 's' };
    },
    /* x^2 versus x^3 */
    (r) => {
      const xs = [0.5, 1, 2, 3];
      return { q: T(`(a) Complete the table for $y = x^2$ and $y = x^3$. (b) For which value of $x$ in the table are the two outputs equal? (c) Which output is greater when $0 < x < 1$, and which when $x > 1$?<br>${blanks(xs, '$x$', '$x^2$')}${blanks(xs, '$x$', '$x^3$')}`, `(a) Lengkapkan jadual bagi $y = x^2$ dan $y = x^3$. (b) Bagi nilai $x$ yang manakah dalam jadual kedua-dua output itu sama? (c) Output yang manakah lebih besar apabila $0 < x < 1$, dan yang manakah apabila $x > 1$?<br>${blanks(xs, '$x$', '$x^2$')}${blanks(xs, '$x$', '$x^3$')}`), a: P([T('$x^2$: $0.25,\\ 1,\\ 4,\\ 9$; $x^3$: $0.125,\\ 1,\\ 8,\\ 27$'), T('$x = 1$ (both are $1$).', '$x = 1$ (kedua-duanya $1$).'), T('For $0 < x < 1$, $x^2$ is greater; for $x > 1$, $x^3$ is greater.', 'Bagi $0 < x < 1$, $x^2$ lebih besar; bagi $x > 1$, $x^3$ lebih besar.')]), sp: 'l' };
    },
    /* number of solutions of y = c */
    (r) => {
      _r = r;
      const F = rndFN(r, [2, -2, -1, 3], [1, 2, -1, -2, 4]), x0 = r.pick([1, 2, 3]), y0 = F.f(x0);
      need(clean(y0));
      const mode = r.pick(['on', 'wrong']);
      let c, sol;
      if (mode === 'on') { c = y0; sol = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6].filter((v) => Math.abs(F.f(v) - c) < 1e-9); }
      else { need(F.n % 2 === 0 || F.n === 1 && false); c = -Math.sign(F.a) * r.pick([1, 4, 9]); sol = []; }
      return { q: T(`A horizontal line $y = ${n(c)}$ is drawn on the same axes as the graph of $${EQn(F)}$. How many points of intersection are there, and what are the $x$-coordinates?`, `Garis mengufuk $y = ${n(c)}$ dilukis pada paksi yang sama dengan graf $${EQn(F)}$. Berapakah bilangan titik persilangan, dan apakah koordinat-$x$nya?`), a: sol.length ? T(`${sol.length} point${sol.length > 1 ? 's' : ''}: $x = ${sol.join(' \\text{ and } ')}$`, `${sol.length} titik: $x = ${sol.join(' \\text{ dan } ')}$`) : T(`None: every $y$-value of the graph has the opposite sign to $${n(c)}$, so the line never meets the graph.`, `Tiada: setiap nilai $y$ pada graf mempunyai tanda yang bertentangan dengan $${n(c)}$, jadi garis itu tidak pernah bertemu graf.`), sp: 's' };
    },
    /* real-life with unknown constant */
    (r) => {
      const c = r.pick(LIFE2), x0 = r.pick(c.xs), a = r.pick(c.as), F = FN(c.n, a), y0 = F.f(x0);
      const k = c.n < 0 ? a * x0 : a;
      const G = FN(c.n, k), x1 = c.n < 0 ? r.pick([2, 4, 5, 8, 10].filter((v) => v !== x0 && clean(G.f(v)))) : r.pick([4, 5, 6].filter((v) => v !== x0));
      need(x1 && clean(G.f(x1)) && clean(G.f(x0)));
      const y1 = G.f(x1), k2 = G.f(x0);
      const yt = G.f(x1);
      const yOut = c.n < 0 ? r.pick([2, 4, 5].filter((v) => clean(k / v) && v !== 0)) : r.pick([2, 3, 4].map((v) => v * v * a));
      const xRes = c.n < 0 ? k / yOut : Math.sqrt(yOut / a);
      need(isInt(xRes));
      const ynm = c.n < 0 ? 'y' : 'y';
      const sh = c.n < 0 ? '' : '';
      return { q: T(`${c.ge(a, x0, k2)} (a) Find the constant. (b) Find the output when the input is ${x1}. (c) Find the input when the output is ${n(yOut)}. (d) Explain why the input cannot be negative here.`, `${c.gm(a, x0, k2)} (a) Cari pemalar itu. (b) Cari output apabila input ialah ${x1}. (c) Cari input apabila output ialah ${n(yOut)}. (d) Terangkan mengapa input tidak boleh negatif di sini.`), a: P([T(`$${c.n < 0 ? 'k' : 'a'} = ${n(k)}$`), T(`$${ynum(y1)}$`), T(`$${n(xRes)}$`), T('The input is a time, speed or number of people, which cannot be negative.', 'Input ialah masa, laju atau bilangan orang yang tidak boleh negatif.')]), sp: 'l' };
    },
    /* point not on the graph */
    (r) => {
      _r = r;
      const F = rndFN(r, [2, 3, -1, 1], [1, 2, 3, -1, -2, 4]), xs = r.sample([-3, -2, -1, 1, 2, 3], 4).filter((x) => clean(F.f(x)) && Math.abs(F.f(x)) < 40);
      need(xs.length === 4);
      const bad = r.int(0, 3), pts = xs.map((x, i) => [x, i === bad ? -F.f(x) : F.f(x)]);
      const L = 'ABCD';
      return { q: T(`Three of the four points below lie on the graph of $${EQ(F)}$. Which point does not? Give the correct $y$-coordinate.<br>${pts.map((p, i) => `(${L[i]}) $(${p[0]},\\ ${n(p[1])})$`).join('&emsp;')}`, `Tiga daripada empat titik di bawah terletak pada graf $${EQ(F)}$. Titik yang manakah tidak? Berikan koordinat-$y$ yang betul.<br>${pts.map((p, i) => `(${L[i]}) $(${p[0]},\\ ${n(p[1])})$`).join('&emsp;')}`), a: T(`(${L[bad]}) $(${pts[bad][0]},\\ ${n(pts[bad][1])})$; the correct $y$ is $${n(F.f(xs[bad]))}$.`, `(${L[bad]}) $(${pts[bad][0]},\\ ${n(pts[bad][1])})$; $y$ yang betul ialah $${n(F.f(xs[bad]))}$.`), sp: 's' };
    },
    /* can y take this value? */
    (r) => {
      const F = rndFN(r, [2, -2, -1, 3, 1], [1, 2, -1, -2]);
      const cs = r.sample([-9, -4, -1, 0, 1, 4, 9], 2);
      const can = (c) => (F.n === 2 ? (F.a > 0 ? c >= 0 : c <= 0) : F.n === -2 ? (F.a > 0 ? c > 0 : c < 0) : F.n === -1 ? c !== 0 : true);
      const why2 = (c) => (can(c) ? T('Yes.', 'Ya.') : T(`No: ${F.n === -1 || F.n === -2 ? (c === 0 ? 'a fraction with a non-zero numerator is never $0$' : 'the sign of every $y$-value is fixed by the sign of $a$') : 'the sign of every $y$-value is fixed by $a$ and $x^2 \\ge 0$'}.`, `Tidak: ${F.n === -1 || F.n === -2 ? (c === 0 ? 'pecahan yang pengangkanya bukan sifar tidak pernah bernilai $0$' : 'tanda setiap nilai $y$ ditentukan oleh tanda $a$') : 'tanda setiap nilai $y$ ditentukan oleh $a$ dan $x^2 \\ge 0$'}.`));
      return { q: T(`Can the graph of $${EQn(F)}$ have a point with $y = ${cs[0]}$? Can it have a point with $y = ${cs[1]}$? Explain each answer.`, `Bolehkah graf $${EQn(F)}$ mempunyai titik dengan $y = ${cs[0]}$? Bolehkah ia mempunyai titik dengan $y = ${cs[1]}$? Terangkan setiap jawapan.`), a: P([why2(cs[0]), why2(cs[1])]), sp: 's' };
    },
    /* use symmetry / sign rules */
    (r) => {
      _r = r;
      const F = rndFN(r, [2, 3, -1, -2, 1], [1, 2, 3, 4, -2]), x0 = r.pick([2, 3, 4]);
      need(clean(F.f(x0)) && Math.abs(F.f(x0)) <= 60);
      const even = F.n % 2 === 0, y0 = F.f(x0);
      return { q: T(`For the function $y = ax^n$ (${F.shape[0]}), $y = ${n(y0)}$ when $x = ${x0}$. Without finding $a$ or $n$, use the symmetry of the graph to state the value of $y$ when $x = ${-x0}$. Explain.`, `Bagi fungsi $y = ax^n$ (${F.shape[1]}), $y = ${n(y0)}$ apabila $x = ${x0}$. Tanpa mencari $a$ atau $n$, gunakan kesimetrian graf untuk menyatakan nilai $y$ apabila $x = ${-x0}$. Terangkan.`), a: T(`$y = ${n(F.f(-x0))}$: ${even ? 'the graph is symmetrical about the $y$-axis, so the value is the same.' : 'the graph is symmetrical about the origin, so the value is the negative.'}`, `$y = ${n(F.f(-x0))}$: ${even ? 'graf simetri pada paksi-$y$, jadi nilainya sama.' : 'graf simetri pada asalan, jadi nilainya ialah negatif.'}`), sp: 's' };
    },
    /* full investigation */
    (r) => {
      _r = r;
      const F = rndFN(r, [3, 2, -1, -2], [1, 2, -1, -2, 4]), xs = xsFor(F, 6), x = r.pick(xs.filter((v) => v > 0 && Math.abs(F.f(v)) <= 7));
      need(x !== undefined && xs.length >= 5);
      const y = F.f(x), sol = xs.filter((v) => Math.abs(F.f(v) - y) < 1e-9);
      return { q: T(`(a) Complete the table for $${EQn(F)}$. (b) Plot the points and draw the graph. (c) From the graph, find the value(s) of $x$ when $y = ${ynum(y)}$. (d) Describe the shape of the graph.<br>${blanks(xs)}`, `(a) Lengkapkan jadual bagi $${EQn(F)}$. (b) Plotkan titik dan lukis graf. (c) Daripada graf, cari nilai $x$ apabila $y = ${ynum(y)}$. (d) Huraikan bentuk graf itu.<br>${blanks(xs)}`), fig: blankFig(), a: P([T(`$y = ${xs.map((v) => ynum(F.f(v))).join(',\\ ')}$`), T('Points plotted and joined smoothly.', 'Titik diplot dan disambung dengan licin.'), T(`$x = ${sol.join(' \\text{ or } ')}$`, `$x = ${sol.join(' \\text{ atau } ')}$`), T(cap(F.shape[0]) + '.', cap(F.shape[1]) + '.')]), sp: 'xl' };
    },
    /* estimation from graph at half values, with reasoning */
    (r) => {
      _r = r;
      const F = rndFN(r, [2, 3], [1, 2, -1]), x = r.pick([1.5, 2.5, -1.5]), y = F.f(x);
      need(Math.abs(y) <= 7.5);
      const lo = Math.floor(x), hi = lo + 1;
      return { q: T(`The graph of $${EQ(F)}$ is drawn. (a) Estimate $y$ when $x = ${n(x)}$ from the graph. (b) Calculate the exact value. (c) The pupil estimated $y$ by taking the average of $y$ at $x = ${lo}$ and $x = ${hi}$. Is this estimate too large or too small? Explain briefly.`, `Graf $${EQ(F)}$ dilukis. (a) Anggarkan $y$ apabila $x = ${n(x)}$ daripada graf. (b) Hitung nilai tepat. (c) Murid itu menganggar $y$ dengan mengambil purata $y$ pada $x = ${lo}$ dan $x = ${hi}$. Adakah anggaran ini terlalu besar atau terlalu kecil? Terangkan secara ringkas.`), fig: gfig([{ F }], { pts: [[x, y, '', true]] }), a: (() => { const avg = (F.f(lo) + F.f(hi)) / 2; return P([T(`About $${ynum(y)}$`, `Kira-kira $${ynum(y)}$`), T(`$y = ${ynum(y)}$`), T(`The average is $${ynum(avg)}$, which is ${avg > y ? 'too large' : avg < y ? 'too small' : 'exact'}: the graph is curved, so it does not follow the straight line between the two points.`, `Puratanya ialah $${ynum(avg)}$, iaitu ${avg > y ? 'terlalu besar' : avg < y ? 'terlalu kecil' : 'tepat'}: graf itu melengkung, jadi ia tidak mengikut garis lurus antara dua titik itu.`)]); })(), sp: 'm' };
    },
  ];

  /* ---- more F2-8.2 families ---- */
  const CL82 = [
    ['The graph of $y = ax^2$ is symmetrical about the ____ .', 'Graf $y = ax^2$ simetri pada ____ .', '$y$-axis', 'paksi-$y$'],
    ['The graph of $y = ax^3$ is symmetrical about the ____ .', 'Graf $y = ax^3$ simetri pada ____ .', 'origin', 'asalan'],
    ['The graph of $y = \\dfrac{a}{x}$ has ____ separate branches.', 'Graf $y = \\dfrac{a}{x}$ mempunyai ____ cabang yang terpisah.', 'two', 'dua'],
    ['The value of $x$ that cannot be used for $y = \\dfrac{a}{x}$ or $y = \\dfrac{a}{x^2}$ is ____ .', 'Nilai $x$ yang tidak boleh digunakan bagi $y = \\dfrac{a}{x}$ atau $y = \\dfrac{a}{x^2}$ ialah ____ .', '$0$', '$0$'],
    ['The graph of $y = ax$ is a ____ line through the ____ .', 'Graf $y = ax$ ialah garis ____ yang melalui ____ .', 'straight; origin', 'lurus; asalan'],
    ['The points of a curved graph must be joined by a ____ curve, not by straight segments.', 'Titik-titik pada graf yang melengkung mesti disambung dengan lengkung ____ , bukan tembereng garis lurus.', 'smooth', 'licin'],
    ['When $a$ is positive, the graph of $y = ax^2$ opens ____ .', 'Apabila $a$ positif, graf $y = ax^2$ terbuka ke ____ .', 'upwards', 'atas'],
    ['For $y = \\dfrac{a}{x^2}$ with $a > 0$, the graph lies in the ____ and ____ quadrants.', 'Bagi $y = \\dfrac{a}{x^2}$ dengan $a > 0$, graf terletak dalam kuadran ____ dan ____ .', 'first; second', 'pertama; kedua'],
  ];
  const sgnWord = (v) => (v > 0 ? T('positive', 'positif') : v < 0 ? T('negative', 'negatif') : T('zero', 'sifar'));
  const g82e2 = [
    /* cloze */
    (r) => { const c = r.pick(CL82); return { q: T(`Fill in the blank(s).<br>${c[0]}`, `Isikan tempat kosong.<br>${c[1]}`), a: T(c[2], c[3]), sp: 'xs' }; },
    /* sign without calculating */
    (r) => {
      const F = rndFN(r, [1, 2, 3, -1], [1, 2, -1, -2]), x = r.pick([-3, -2, -1, 1, 2, 3]), s = Math.sign(F.f(x));
      const ph = [
        [`Without calculating, state whether $y$ is positive or negative when $x = ${x}$ for $${EQn(F)}$.`, `Tanpa mengira, nyatakan sama ada $y$ positif atau negatif apabila $x = ${x}$ bagi $${EQn(F)}$.`],
        [`For the graph of $${EQn(F)}$, is the point with $x = ${x}$ above or below the $x$-axis? Give a reason.`, `Bagi graf $${EQn(F)}$, adakah titik dengan $x = ${x}$ berada di atas atau di bawah paksi-$x$? Berikan sebab.`],
      ];
      const [pe, pm] = r.pick(ph), ab = pe.startsWith('For');
      return { q: T(pe, pm), a: ab ? (s > 0 ? T('Above the $x$-axis: $y > 0$.', 'Di atas paksi-$x$: $y > 0$.') : T('Below the $x$-axis: $y < 0$.', 'Di bawah paksi-$x$: $y < 0$.')) : T(cap(sgnWord(s).en), cap(sgnWord(s).ms)), sp: 'xs' };
    },
    /* coordinates of labelled points */
    (r) => {
      _r = r;
      const F = rndFN(r, [1, 2, 3], [1, 2, -1, -2]), xs = r.sample([-2, -1, 1, 2].filter((x) => Math.abs(F.f(x)) <= 7), 2);
      need(xs.length === 2);
      const pts = xs.map((x, i) => [x, F.f(x), 'PQ'[i], false]);
      return { q: T(`The graph of $${EQ(F)}$ passes through the points $P$ and $Q$. Write down the coordinates of $P$ and $Q$.`, `Graf $${EQ(F)}$ melalui titik $P$ dan $Q$. Tuliskan koordinat $P$ dan $Q$.`), fig: gfig([{ F }], { pts: pts.map((p) => [p[0], p[1], p[2]]) }), a: T(`$P(${pts[0][0]},\\ ${n(pts[0][1])})$, $Q(${pts[1][0]},\\ ${n(pts[1][1])})$`), sp: 's' };
    },
    /* matching equations and shapes */
    (r) => {
      const ns3 = r.sample(NS, 3), Fs = ns3.map((k) => FN(k, k < 0 ? 4 : r.pick([1, 2, 3]))), sh = r.shuffle([0, 1, 2]);
      return { q: T(`Match each equation with the description of its graph.<br>${Fs.map((F, i) => `(${i + 1}) $${EQn(F)}$`).join('&emsp;')}<br>${sh.map((k, j) => `(${'ABC'[j]}) ${Fs[k].shape[0]}`).join('<br>')}`, `Padankan setiap persamaan dengan huraian grafnya.<br>${Fs.map((F, i) => `(${i + 1}) $${EQn(F)}$`).join('&emsp;')}<br>${sh.map((k, j) => `(${'ABC'[j]}) ${Fs[k].shape[1]}`).join('<br>')}`), a: T(Fs.map((F, i) => `(${i + 1}) - (${'ABC'[sh.indexOf(i)]})`).join(', ')), sp: 's' };
    },
    /* y-intercept style: x = 0 */
    (r) => {
      const F = rndFN(r, [1, 2, 3], [1, 2, 3, -1, -2, -3]), G = rndFN(r, [-1, -2], [2, 4, 6]);
      return { q: T(`(a) Find $y$ when $x = 0$ for $${EQ(F)}$. (b) Can we find $y$ when $x = 0$ for $${EQn(G)}$? Explain.`, `(a) Cari $y$ apabila $x = 0$ bagi $${EQ(F)}$. (b) Bolehkah kita mencari $y$ apabila $x = 0$ bagi $${EQn(G)}$? Terangkan.`), a: P([T('$y = 0$: the graph passes through the origin.', '$y = 0$: graf melalui asalan.'), T('No: it needs division by $0$, which is not defined.', 'Tidak: ia memerlukan pembahagian dengan $0$ yang tidak ditakrifkan.')]), sp: 's' };
    },
    /* which equation passes through a point */
    (r) => {
      _r = r;
      const nn = r.pick(NS), a = r.pick([1, 2, 3, 4]), F = FN(nn, a), x = r.pick([1, 2, 4].filter((v) => clean(F.f(v))));
      need(x !== undefined);
      const cands = [F, FN(nn === 2 ? 3 : 2, a), FN(1, F.f(x) / x || 1), FN(-1, a)].filter((c, i, arr) => arr.findIndex((d) => d.t === c.t) === i);
      need(cands.length === 4);
      const sh = r.shuffle(cands), L = 'ABCD', hits = sh.map((c, j) => (Math.abs(c.f(x) - F.f(x)) < 1e-9 ? j : -1)).filter((j) => j >= 0);
      return { q: T(`Which of these graphs pass through the point $(${x},\\ ${n(F.f(x))})$?<br>${sh.map((c, j) => `(${L[j]}) $${EQ(c)}$`).join('&emsp;')}`, `Graf yang manakah melalui titik $(${x},\\ ${n(F.f(x))})$?<br>${sh.map((c, j) => `(${L[j]}) $${EQ(c)}$`).join('&emsp;')}`), a: T(hits.map((j) => `(${L[j]})`).join(', ')), sp: 's' };
    },
  ];
  const g82m2 = [
    /* find a from one pair, then table */
    (r) => {
      _r = r;
      const F = rndFN(r, [1, 2, 3, -1, -2], [2, 3, 4, -2, -3, 6]), x0 = r.pick([1, 2]), xs = xsFor(F, 4);
      need(clean(F.f(x0)) && Math.abs(F.f(x0)) < 50 && xs.length === 4);
      const nm = F.n === 1 ? 'ax' : F.n === 2 ? 'ax^2' : F.n === 3 ? 'ax^3' : F.n === -1 ? '\\dfrac{a}{x}' : '\\dfrac{a}{x^2}';
      return { q: T(`Given that $y = ${nm}$ and $y = ${n(F.f(x0))}$ when $x = ${x0}$, find $a$ and complete the table.<br>${blanks(xs)}`, `Diberi $y = ${nm}$ dan $y = ${n(F.f(x0))}$ apabila $x = ${x0}$, cari $a$ dan lengkapkan jadual.<br>${blanks(xs)}`), a: T(`$a = ${F.a}$; $y = ${xs.map((x) => ynum(F.f(x))).join(',\\ ')}$`), sp: 's' };
    },
    /* compare two graphs at a point */
    (r) => {
      _r = r;
      const ns2 = r.sample([1, 2, 3], 2), F = FN(ns2[0], r.pick([1, 2])), G = FN(ns2[1], r.pick([1, 2])), x = r.pick([1, 2, -1, -2]);
      need(Math.abs(F.f(x)) <= 7 && Math.abs(G.f(x)) <= 7 && F.f(x) !== G.f(x));
      const big = F.f(x) > G.f(x) ? F : G;
      return { q: T(`The diagram shows the graphs of $y = ${F.t}$ (solid, labelled $A$) and $y = ${G.t}$ (dashed, labelled $B$). At $x = ${x}$, which graph has the greater $y$-value? Give both values.`, `Rajah menunjukkan graf $y = ${F.t}$ (penuh, berlabel $A$) dan $y = ${G.t}$ (putus-putus, berlabel $B$). Pada $x = ${x}$, graf yang manakah mempunyai nilai $y$ yang lebih besar? Berikan kedua-dua nilai.`), fig: gfig([{ F, lab: 'A' }, { F: G, lab: 'B', dash: true }]), a: T(`$A$: $${n(F.f(x))}$; $B$: $${n(G.f(x))}$. Graph ${big === F ? 'A' : 'B'} is greater.`, `$A$: $${n(F.f(x))}$; $B$: $${n(G.f(x))}$. Graf ${big === F ? 'A' : 'B'} lebih besar.`), sp: 's' };
    },
    /* decide function type from equation and graph shape */
    (r) => {
      const F = rndFN(r), one = F.n % 2 !== 0 && true, oneR = F.n === 1 || F.n === 3 || F.n === -1;
      return { q: T(`Consider the graph of $${EQn(F)}$ (${F.shape[0]}). Is it a function? If so, is it one-to-one or many-to-one? Use the vertical and horizontal line tests.`, `Pertimbangkan graf $${EQn(F)}$ (${F.shape[1]}). Adakah ia suatu fungsi? Jika ya, adakah ia satu dengan satu atau banyak dengan satu? Gunakan ujian garis mencancang dan mengufuk.`), a: oneR ? T('A function, and one-to-one: every vertical and every horizontal line meets the graph at most once.', 'Ia fungsi, dan satu dengan satu: setiap garis mencancang dan mengufuk memotong graf paling banyak sekali.') : T('A function, but many-to-one: a horizontal line can meet the graph at two points, e.g. inputs $x$ and $-x$ have the same output.', 'Ia fungsi, tetapi banyak dengan satu: garis mengufuk boleh memotong graf pada dua titik, contohnya input $x$ dan $-x$ mempunyai output yang sama.'), sp: 's' };
    },
    /* table with negative a and reading, real context graph */
    (r) => {
      _r = r;
      const c = r.pick(LIFE.filter((v) => v.n === 2 || v.n === -1)), a = r.pick(c.as), F = FN(c.n, a);
      const xs = (c.n < 0 ? [2, 3, 4, 6, 8, 10, 12] : [1, 2, 3, 4]).filter((x) => clean(F.f(x)));
      need(xs.length >= 3);
      const x = r.pick(xs), y = F.f(x);
      const fig = S.graph({ w: 300, h: 210, xr: [0, c.n < 0 ? 12 : 4, c.n < 0 ? 2 : 1], yr: c.n < 0 ? [0, Math.ceil(a / 2 / 10) * 10 + 10, Math.ceil(a / 2 / 10) * 2 + 2] : [0, a * 16 + 4, a * 4], xlabel: c.n < 0 ? 'x' : 'x', ylabel: 'y', series: [{ pts: (c.n < 0 ? [2, 3, 4, 5, 6, 8, 10, 12] : [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]).map((v) => [v, F.f(v)]).filter((p) => Number.isFinite(p[1])), type: 'line' }] });
      return { q: T(`${c.en(a)} The graph of the relation is drawn. Read from the table below the value of the output when $x = ${x}$, and explain why the graph is a curve and not a straight line.<br>${valsTable(xs, xs.map((v) => F.f(v)), '$x$', '$y$')}`, `${c.ms(a)} Graf hubungan itu dilukis. Baca daripada jadual di bawah nilai output apabila $x = ${x}$, dan terangkan mengapa graf itu ialah lengkung dan bukan garis lurus.<br>${valsTable(xs, xs.map((v) => F.f(v)), '$x$', '$y$')}`), fig, a: T(`$y = ${ynum(y)}$. Equal steps in $x$ do not give equal changes in $y$, so the graph is curved.`, `$y = ${ynum(y)}$. Langkah $x$ yang sama tidak memberikan perubahan $y$ yang sama, jadi graf itu melengkung.`), sp: 's' };
    },
  ];
  const g82a2 = [
    /* deduce n and sign from properties */
    (r) => {
      const nn = r.pick(NS), sgn = r.pick([1, -1]), F = FN(nn, sgn * r.pick([1, 2, 4]));
      const props = [
        F.pole ? T('The graph is in two separate branches.', 'Graf itu mempunyai dua cabang yang terpisah.') : T('The graph passes through the origin.', 'Graf itu melalui asalan.'),
        nn % 2 === 0 ? T('It is symmetrical about the $y$-axis.', 'Ia simetri pada paksi-$y$.') : T('It is symmetrical about the origin.', 'Ia simetri pada asalan.'),
        T(`It lies in the ${QN(quads(F))} quadrant${quads(F).length > 1 ? 's' : ''}.`, `Ia terletak dalam kuadran ${QM(quads(F))}.`),
        nn === 1 ? T('It is a straight line.', 'Ia ialah garis lurus.') : nn === 3 ? T('It is S-shaped.', 'Ia berbentuk S.') : nn === 2 ? T('It is U-shaped.', 'Ia berbentuk U.') : T(`Its $y$-values are ${nn === -1 ? 'not always the same sign' : 'all the same sign'}.`, `Nilai $y$nya ${nn === -1 ? 'tidak sentiasa bertanda sama' : 'semuanya bertanda sama'}.`),
      ];
      const x = 2;
      return { q: T(`A graph has the form $y = ax^n$ with $n \\in \\{-2, -1, 1, 2, 3\\}$. ${props.map((p) => p.en).join(' ')} It passes through $(${x},\\ ${ynum(F.f(x))})$. Find the equation.`, `Suatu graf berbentuk $y = ax^n$ dengan $n \\in \\{-2, -1, 1, 2, 3\\}$. ${props.map((p) => p.ms).join(' ')} Ia melalui $(${x},\\ ${ynum(F.f(x))})$. Cari persamaannya.`), a: T(`$${EQ(F)}$`), sp: 'm' };
    },
    /* large x behaviour */
    (r) => {
      const F = FN(r.pick([-1, -2]), r.pick([1, 2, 5, 10])), xs = [10, 100, 1000];
      return { q: T(`(a) Complete the table for $y = ${F.t}$. (b) What happens to $y$ as $x$ becomes very large? (c) Will the graph ever touch the $x$-axis? Explain.<br>${blanks(xs)}`, `(a) Lengkapkan jadual bagi $y = ${F.t}$. (b) Apakah yang berlaku kepada $y$ apabila $x$ menjadi sangat besar? (c) Adakah graf itu akan menyentuh paksi-$x$? Terangkan.<br>${blanks(xs)}`), a: P([T(`$y = ${xs.map((x) => n(F.f(x))).join(',\\ ')}$`), T('$y$ becomes smaller and closer to $0$.', '$y$ menjadi semakin kecil dan menghampiri $0$.'), T(`No: $\\dfrac{${F.a}}{x${F.n === -2 ? '^2' : ''}}$ is never $0$ for any $x$.`, `Tidak: $\\dfrac{${F.a}}{x${F.n === -2 ? '^2' : ''}}$ tidak pernah $0$ bagi sebarang $x$.`)]), sp: 'l' };
    },
    /* stone falling graph reading */
    (r) => {
      const a = r.pick([4, 5]), F = FN(2, a), t = r.pick([1, 2, 3]), s = F.f(t);
      const fig = S.graph({ w: 300, h: 220, xr: [0, 4, 1], yr: [0, a * 16, a * 4], xlabel: 't', ylabel: 's', series: [{ pts: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4].map((v) => [v, F.f(v)]), type: 'line' }] });
      return { q: T(`The graph shows $s = ${a}t^2$, the distance $s$ metres fallen by a stone after $t$ seconds. (a) Use the equation to find $s$ when $t = ${t}$. (b) The stone has fallen ${n(a * 9)} m. How long has it been falling? (c) Explain why the graph is drawn only for $t \\ge 0$.`, `Graf menunjukkan $s = ${a}t^2$, jarak $s$ meter yang dijatuhi sebiji batu selepas $t$ saat. (a) Gunakan persamaan untuk mencari $s$ apabila $t = ${t}$. (b) Batu itu telah jatuh sejauh ${n(a * 9)} m. Berapa lamakah ia telah jatuh? (c) Terangkan mengapa graf hanya dilukis bagi $t \\ge 0$.`), fig, a: P([T(`$s = ${n(s)}$ m`), T('$t = 3$ s', '$t = 3$ s'), T('Time cannot be negative.', 'Masa tidak boleh negatif.')]), sp: 'm' };
    },
  ];
  SPM.extend('F2-8.2', { e: g82e.concat(g82e2), m: g82m.concat(g82m2), a: g82a.concat(g82a2) });

  /* ---- real-life relations y = a x^n (contexts) ---- */
  const CXB = [
    { n: 1, as: [12, 15, 20, 30], en: (a) => `A cyclist rides at a constant speed of ${a} km/h.`, ms: (a) => `Seorang penunggang basikal menunggang pada laju malar ${a} km/j.`, x: ['time (hours)', 'masa (jam)'], y: ['distance (km)', 'jarak (km)'], rel: (a) => `d = ${a}x`, xs: [1, 2, 3, 4, 5] },
    { n: 1, as: [5, 8, 10, 12], en: (a) => `A tap fills a tank at ${a} litres every minute.`, ms: (a) => `Sebuah paip mengisi tangki pada kadar ${a} liter setiap minit.`, x: ['time (minutes)', 'masa (minit)'], y: ['volume (litres)', 'isi padu (liter)'], rel: (a) => `V = ${a}x`, xs: [1, 2, 3, 4, 5] },
    { n: 1, as: [8, 10, 12, 15], en: (a) => `A part-time worker earns RM${a} for every hour worked.`, ms: (a) => `Seorang pekerja sambilan mendapat RM${a} bagi setiap jam bekerja.`, x: ['hours worked', 'jam bekerja'], y: ['earnings (RM)', 'pendapatan (RM)'], rel: (a) => `y = ${a}x`, xs: [1, 2, 3, 4, 5] },
    { n: 1, as: [20, 25, 30], en: (a) => `A printer prints ${a} pages every minute.`, ms: (a) => `Sebuah pencetak mencetak ${a} muka surat setiap minit.`, x: ['time (minutes)', 'masa (minit)'], y: ['pages printed', 'muka surat dicetak'], rel: (a) => `y = ${a}x`, xs: [1, 2, 3, 4, 5] },
    { n: 2, as: [1], en: () => `The area $A$ of a square carpet with side $x$ metres is $A = x^2$.`, ms: () => `Luas $A$ sehelai permaidani segi empat sama bersisi $x$ meter ialah $A = x^2$.`, x: ['side (m)', 'sisi (m)'], y: ['area (m²)', 'luas (m²)'], rel: () => 'A = x^2', xs: [1, 2, 3, 4, 5] },
    { n: 2, as: [2], en: () => `A rectangular plot is twice as long as it is wide. If its width is $x$ metres, its area is $A = 2x^2$.`, ms: () => `Sebidang tanah segi empat tepat dua kali lebih panjang daripada lebarnya. Jika lebarnya $x$ meter, luasnya ialah $A = 2x^2$.`, x: ['width (m)', 'lebar (m)'], y: ['area (m²)', 'luas (m²)'], rel: () => 'A = 2x^2', xs: [1, 2, 3, 4, 5] },
    { n: 2, as: [4, 5], en: (a) => `A stone is dropped from a bridge. The distance it falls in $x$ seconds is $s = ${a}x^2$ metres.`, ms: (a) => `Sebiji batu dijatuhkan dari sebuah jambatan. Jarak yang dijatuhinya dalam $x$ saat ialah $s = ${a}x^2$ meter.`, x: ['time (s)', 'masa (s)'], y: ['distance (m)', 'jarak (m)'], rel: (a) => `s = ${a}x^2`, xs: [1, 2, 3, 4, 5] },
    { n: 3, as: [1], en: () => `The volume $V$ of a cube with edge $x$ cm is $V = x^3$.`, ms: () => `Isi padu $V$ sebuah kubus bersisi $x$ cm ialah $V = x^3$.`, x: ['edge (cm)', 'sisi (cm)'], y: ['volume (cm³)', 'isi padu (cm³)'], rel: () => 'V = x^3', xs: [1, 2, 3, 4, 5] },
    { n: 3, as: [2, 3, 8], en: (a) => `A solid metal cube of edge $x$ cm has mass $m = ${a}x^3$ grams.`, ms: (a) => `Sebuah kubus logam pepejal bersisi $x$ cm mempunyai jisim $m = ${a}x^3$ gram.`, x: ['edge (cm)', 'sisi (cm)'], y: ['mass (g)', 'jisim (g)'], rel: (a) => `m = ${a}x^3`, xs: [1, 2, 3, 4] },
    { n: -1, as: [60, 120, 240], en: (a) => `A bus journey of ${a} km is made at a constant speed of $x$ km/h, so the time is $t = \\dfrac{${a}}{x}$ hours.`, ms: (a) => `Suatu perjalanan bas sejauh ${a} km dibuat pada laju malar $x$ km/j, jadi masanya ialah $t = \\dfrac{${a}}{x}$ jam.`, x: ['speed (km/h)', 'laju (km/j)'], y: ['time (hours)', 'masa (jam)'], rel: (a) => `t = \\dfrac{${a}}{x}`, xs: [20, 30, 40, 60, 120] },
    { n: -1, as: [24, 36, 60], en: (a) => `A job needs ${a} worker-days, so $x$ workers finish it in $d = \\dfrac{${a}}{x}$ days.`, ms: (a) => `Suatu kerja memerlukan ${a} hari-pekerja, jadi $x$ orang pekerja menyiapkannya dalam $d = \\dfrac{${a}}{x}$ hari.`, x: ['number of workers', 'bilangan pekerja'], y: ['days', 'hari'], rel: (a) => `d = \\dfrac{${a}}{x}`, xs: [1, 2, 3, 4, 6] },
    { n: -1, as: [24, 48, 60], en: (a) => `A restaurant bill of RM${a} is shared equally by $x$ friends, so each pays $y = \\dfrac{${a}}{x}$ ringgit.`, ms: (a) => `Bil restoran RM${a} dikongsi sama rata oleh $x$ orang rakan, jadi setiap orang membayar $y = \\dfrac{${a}}{x}$ ringgit.`, x: ['number of friends', 'bilangan rakan'], y: ['share (RM)', 'bahagian (RM)'], rel: (a) => `y = \\dfrac{${a}}{x}`, xs: [1, 2, 3, 4, 6] },
    { n: -1, as: [120, 240, 300], en: (a) => `A novel has ${a} pages. If Hana reads $x$ pages every day, she needs $d = \\dfrac{${a}}{x}$ days.`, ms: (a) => `Sebuah novel mempunyai ${a} muka surat. Jika Hana membaca $x$ muka surat setiap hari, dia memerlukan $d = \\dfrac{${a}}{x}$ hari.`, x: ['pages per day', 'muka surat sehari'], y: ['days needed', 'hari diperlukan'], rel: (a) => `d = \\dfrac{${a}}{x}`, xs: [10, 20, 30, 40, 60] },
    { n: -2, as: [100, 400, 900], en: (a) => `The brightness $I$ of a lamp at a distance $x$ metres from it is $I = \\dfrac{${a}}{x^2}$ units.`, ms: (a) => `Kecerahan $I$ sebuah lampu pada jarak $x$ meter daripadanya ialah $I = \\dfrac{${a}}{x^2}$ unit.`, x: ['distance (m)', 'jarak (m)'], y: ['brightness', 'kecerahan'], rel: (a) => `I = \\dfrac{${a}}{x^2}`, xs: [1, 2, 4, 5, 10] },
  ];
  const mkCtx = (r) => {
    let c = r.pick(CXB.concat([null, null, null]));
    if (!c) { const it = r.pick(SPM.bank.items.concat(SPM.bank.foods)), p = r.int(it.lo, it.hi); c = { n: 1, as: [p], en: (a) => `One ${it.en1} costs RM${a}.`, ms: (a) => `Satu ${it.ms} berharga RM${a}.`, x: [`number of ${it.en} bought`, `bilangan ${it.ms} dibeli`], y: ['cost (RM)', 'kos (RM)'], rel: (a) => `y = ${a}x`, xs: [1, 2, 3, 4, 5] }; }
    const a = r.pick(c.as), F = FN(c.n, a), xs = c.xs.filter((x) => clean(F.f(x)));
    need(xs.length >= 4);
    return { c, a, F, xs, intro: T(c.en(a), c.ms(a)), xn: T(c.x[0], c.x[1]), yn: T(c.y[0], c.y[1]) };
  };
  const cxTable = (k, xs, ys, blank) => TB([[k.xn.en, ...xs.map((x) => n(x))], [k.yn.en, ...ys.map((y) => (blank ? '' : n(round(y, 2))))]]);
  const cxTableM = (k, xs, ys, blank) => TB([[k.xn.ms, ...xs.map((x) => n(x))], [k.yn.ms, ...ys.map((y) => (blank ? '' : n(round(y, 2))))]]);
  const g82cxE = [
    (r) => {
      const k = mkCtx(r), xs = k.xs.slice(0, 4);
      const ph = [['Complete the table of values.', 'Lengkapkan jadual nilai.'], ['Fill in the missing values in the table.', 'Isikan nilai yang tertinggal dalam jadual.'], ['Use the relation to complete the table.', 'Gunakan hubungan itu untuk melengkapkan jadual.']];
      const [pe, pm] = r.pick(ph);
      return { q: T(`${k.intro.en} ${pe}<br>${cxTable(k, xs, xs, true)}`, `${k.intro.ms} ${pm}<br>${cxTableM(k, xs, xs, true)}`), a: T(`${xs.map((x) => n(round(k.F.f(x), 2))).join(', ')}`), sp: 's' };
    },
    (r) => {
      const k = mkCtx(r), x = r.pick(k.xs);
      const ph = [[`Find the ${k.yn.en} when the ${k.xn.en} is ${n(x)}.`, `Cari ${k.yn.ms} apabila ${k.xn.ms} ialah ${n(x)}.`], [`What is the value of the ${k.yn.en} when the ${k.xn.en} is ${n(x)}?`, `Apakah nilai ${k.yn.ms} apabila ${k.xn.ms} ialah ${n(x)}?`]];
      const p2 = r.pick(ph);
      return { q: T(`${k.intro.en} ${p2[0]}`, `${k.intro.ms} ${p2[1]}`), a: T(`${n(round(k.F.f(x), 2))}`), sp: 'xs' };
    },
    (r) => {
      const k = mkCtx(r), x = r.pick(k.xs);
      return { q: T(`${k.intro.en} Which graph describes the relation between the ${k.xn.en} and the ${k.yn.en}: a straight line through the origin, a U-shaped curve, an S-shaped curve or a curve with two branches?`, `${k.intro.ms} Graf yang manakah menggambarkan hubungan antara ${k.xn.ms} dengan ${k.yn.ms}: garis lurus melalui asalan, lengkung berbentuk U, lengkung berbentuk S atau lengkung dua cabang?`), a: T(cap(k.F.shape[0]) + (k.F.n < 0 ? ' (only $x > 0$ makes sense here)' : ''), cap(k.F.shape[1]) + (k.F.n < 0 ? ' (hanya $x > 0$ bermakna di sini)' : '')), sp: 's' };
    },
  ];
  const g82cxM = [
    (r) => {
      const k = mkCtx(r), x = r.pick(k.xs), y = k.F.f(x);
      const ph = [[`Find the ${k.xn.en} when the ${k.yn.en} equals ${ynum(y)}.`, `Cari ${k.xn.ms} apabila ${k.yn.ms} bersamaan ${ynum(y)}.`], [`Which ${k.xn.en} gives ${ynum(y)} for the ${k.yn.en}?`, `${cap(k.xn.ms)} yang manakah memberikan ${ynum(y)} bagi ${k.yn.ms}?`]];
      const [pe, pm] = r.pick(ph);
      return { q: T(`${k.intro.en} ${pe}`, `${k.intro.ms} ${pm}`), a: T(`${n(x)}`), sp: 's' };
    },
    (r) => {
      const k = mkCtx(r), xs = k.xs.slice(0, 4), ys = xs.map(k.F.f);
      const up = ys[3] > ys[0];
      return { q: T(`${k.intro.en} (a) Complete the table. (b) State whether the ${k.yn.en} increases or decreases as the ${k.xn.en} increases. (c) Is the graph a straight line? Give a reason.<br>${cxTable(k, xs, xs, true)}`, `${k.intro.ms} (a) Lengkapkan jadual. (b) Nyatakan sama ada ${k.yn.ms} bertambah atau berkurang apabila ${k.xn.ms} bertambah. (c) Adakah graf itu garis lurus? Berikan sebab.<br>${cxTableM(k, xs, xs, true)}`), a: P([T(ys.map((v) => n(round(v, 2))).join(', ')), up ? T('It increases.', 'Ia bertambah.') : T('It decreases.', 'Ia berkurang.'), k.F.n === 1 ? T('Yes: the $y$-value increases by the same amount for equal steps in $x$ (a line through the origin).', 'Ya: nilai $y$ bertambah dengan jumlah yang sama bagi langkah $x$ yang sama (garis melalui asalan).') : T('No: equal steps in $x$ do not give equal changes in $y$, so it is a curve.', 'Tidak: langkah $x$ yang sama tidak memberikan perubahan $y$ yang sama, jadi ia ialah lengkung.')]), sp: 'm' };
    },
    (r) => {
      const k = mkCtx(r), x = r.pick(k.xs), y = k.F.f(x);
      return { q: T(`${k.intro.en} A pupil says: "The ${k.yn.en} is ${ynum(y * 2)} when the ${k.xn.en} is ${n(x)}." Check this using the relation and give the correct value.`, `${k.intro.ms} Seorang murid berkata: "${cap(k.yn.ms)} ialah ${ynum(y * 2)} apabila ${k.xn.ms} ialah ${n(x)}." Semak kenyataan ini menggunakan hubungan itu dan berikan nilai yang betul.`), a: T(`Not correct: the ${k.yn.en} is ${ynum(y)}.`, `Tidak betul: ${k.yn.ms} ialah ${ynum(y)}.`), sp: 's' };
    },
  ];
  const g82cxA = [
    (r) => {
      const k = mkCtx(r), x0 = k.xs[1], y0 = k.F.f(x0), x1 = r.pick(k.xs.filter((v) => v !== x0)), y1 = k.F.f(x1);
      const nm = { 1: 'y = ax', 2: 'y = ax^2', 3: 'y = ax^3', '-1': 'y = \\dfrac{a}{x}', '-2': 'y = \\dfrac{a}{x^2}' }[k.F.n];
      return { q: T(`The relation between the ${k.xn.en} ($x$) and the ${k.yn.en} ($y$) has the form $${nm}$. When $x = ${n(x0)}$, $y = ${ynum(y0)}$. Find $a$, and use it to find $y$ when $x = ${n(x1)}$.`, `Hubungan antara ${k.xn.ms} ($x$) dengan ${k.yn.ms} ($y$) berbentuk $${nm}$. Apabila $x = ${n(x0)}$, $y = ${ynum(y0)}$. Cari $a$, dan gunakannya untuk mencari $y$ apabila $x = ${n(x1)}$.`), a: T(`$a = ${n(k.a)}$; $y = ${ynum(y1)}$`), sp: 's' };
    },
    (r) => {
      const k = mkCtx(r), lim = k.F.n < 0 ? 0 : 1;
      const x = r.pick(k.xs), y = k.F.f(x);
      return { q: T(`${k.intro.en} (a) Find the ${k.yn.en} when the ${k.xn.en} is ${n(x)}. (b) Explain why the ${k.xn.en} cannot be negative. (c) Would the relation still make sense when the ${k.xn.en} is $0$?${k.F.n < 0 ? ' Explain.' : ' Explain.'}`, `${k.intro.ms} (a) Cari ${k.yn.ms} apabila ${k.xn.ms} ialah ${n(x)}. (b) Terangkan mengapa ${k.xn.ms} tidak boleh negatif. (c) Adakah hubungan itu masih bermakna apabila ${k.xn.ms} ialah $0$? Terangkan.`), a: P([T(`${n(round(y, 2))}`), T('A quantity such as time, distance, length, speed or number cannot be negative.', 'Kuantiti seperti masa, jarak, panjang, laju atau bilangan tidak boleh negatif.'), k.F.n < 0 ? T('No: it needs division by $0$ (and $0$ speed, workers, etc. would mean nothing happens).', 'Tidak: ia memerlukan pembahagian dengan $0$ (dan laju atau bilangan pekerja $0$ bermakna tiada apa-apa berlaku).') : T('Yes: the value is $0$, meaning there is no distance, cost, amount or volume yet.', 'Ya: nilainya $0$, bermakna belum ada jarak, kos, jumlah atau isi padu.')]), sp: 'm' };
    },
  ];
  SPM.extend('F2-8.2', { e: g82cxE, m: g82cxM, a: g82cxA });

  /* =========================================== F2-8.3 Interpreting and using graphs */
  const CTX83 = [
    { u: ['height of water in a tank', 'tinggi air dalam sebuah tangki'], yu: ['cm', 'cm'], xu: ['hours', 'jam'], v0: [2, 8], step: [1, 4] },
    { u: ['temperature of a cup of tea', 'suhu secawan teh'], yu: ['°C', '°C'], xu: ['minutes', 'minit'], v0: [60, 90], step: [-2, -8], dec: 1 },
    { u: ['number of visitors at a fun fair', 'bilangan pengunjung di sebuah pesta ria'], yu: ['people', 'orang'], xu: ['hours after opening', 'jam selepas dibuka'], v0: [20, 60], step: [5, 20] },
    { u: ['distance of a hiker from the starting point', 'jarak seorang pendaki dari titik permulaan'], yu: ['km', 'km'], xu: ['hours', 'jam'], v0: [0, 3], step: [1, 3] },
    { u: ['value of a printer', 'nilai sebuah pencetak'], yu: ['RM', 'RM'], xu: ['years', 'tahun'], v0: [400, 800], step: [-20, -80], dec: 1 },
    { u: ['number of members of a badminton club', 'bilangan ahli sebuah kelab badminton'], yu: ['members', 'ahli'], xu: ['months', 'bulan'], v0: [10, 30], step: [2, 8] },
    { u: ['amount of rainwater collected in a barrel', 'jumlah air hujan yang terkumpul dalam sebuah tong'], yu: ['litres', 'liter'], xu: ['hours', 'jam'], v0: [5, 20], step: [1, 6] },
    { u: ['mass of ice left in a cooler', 'jisim ais yang tinggal dalam sebuah penyejuk'], yu: ['kg', 'kg'], xu: ['hours', 'jam'], v0: [10, 20], step: [-1, -3], dec: 1 },
  ];
  function mkSeries(r, opts) {
    opts = opts || {};
    const c = r.pick(CTX83);
    const N = opts.n || 6;
    const v0 = r.int(c.v0[0], c.v0[1]);
    const vals = [v0];
    const kind = opts.kind || r.pick(['inc', 'dec', 'nonuniform', 'flat']);
    for (let i = 1; i < N; i++) {
      let d;
      if (kind === 'inc') d = r.pick([Math.abs(c.step[0]), Math.abs(c.step[1])]);
      else if (kind === 'dec') d = -Math.abs(r.pick([c.step[0], c.step[1]].map(Math.abs)));
      else if (kind === 'flat') d = i === opts.flatAt ? 0 : r.pick([Math.abs(c.step[0]), Math.abs(c.step[1])]);
      else d = r.pick([1, 2, 3, 4, 5, 6].map((k) => k * Math.sign(c.step[1] || 1)));
      vals.push(vals[i - 1] + d);
    }
    if (vals.some((v) => v < 0)) return mkSeries(r, opts);
    return { c, vals };
  }
  const lifeGraph2 = (vals, lang, c, hi) => S.graph({ w: 330, h: 210, xr: [0, vals.length - 1, 1], yr: [0, hi, Math.ceil(hi / 5 / 5) * 5 || 1], xlabel: c.xu[lang === 'en' ? 0 : 1], ylabel: c.u[lang === 'en' ? 0 : 1].replace(/^./, (ch) => ch.toUpperCase()) + ' (' + c.yu[lang === 'en' ? 0 : 1] + ')', series: [{ pts: vals.map((v, i) => [i, v]), type: 'line', dotsToo: true }] });
  const mkFig = (S1) => { const hi = Math.ceil((Math.max(...S1.vals) + 2) / 5) * 5; return T(lifeGraph2(S1.vals, 'en', S1.c, hi), lifeGraph2(S1.vals, 'ms', S1.c, hi)); };
  const isUniform = (vals) => { const d0 = vals[1] - vals[0]; return vals.every((v, i) => i === 0 || v - vals[i - 1] === d0); };
  const trendWord = (vals) => (vals[vals.length - 1] > vals[0] ? T('increasing', 'bertambah') : vals[vals.length - 1] < vals[0] ? T('decreasing', 'berkurang') : T('constant', 'malar'));

  const g83e = [
    /* read a value + trend */
    (r) => {
      const S1 = mkSeries(r, { kind: r.pick(['inc', 'dec']) });
      const x = r.int(1, S1.vals.length - 2);
      return { q: T(`The graph shows the ${S1.c.u[0]} over time. (a) What is the value at ${x} ${S1.c.xu[0]}? (b) Is it increasing, decreasing or constant?`, `Graf menunjukkan ${S1.c.u[1]} mengikut masa. (a) Berapakah nilainya pada ${x} ${S1.c.xu[1]}? (b) Adakah ia bertambah, berkurang atau malar?`), fig: mkFig(S1), a: T(`(a) ${n(S1.vals[x])} ${S1.c.yu[0]} (b) ${trendWord(S1.vals).en.replace(/ing$/, 'ing').replace('increasing', 'Increasing').replace('decreasing', 'Decreasing')}`, `(a) ${n(S1.vals[x])} ${S1.c.yu[1]} (b) ${cap(trendWord(S1.vals).ms)}`), sp: 's' };
    },
    /* read endpoints and change */
    (r) => {
      const S1 = mkSeries(r, { kind: r.pick(['inc', 'dec']) });
      const last = S1.vals.length - 1;
      return { q: T(`The graph shows the ${S1.c.u[0]} over ${last} ${S1.c.xu[0]}. Find the value at the start and at the end, and the total change.`, `Graf menunjukkan ${S1.c.u[1]} sepanjang ${last} ${S1.c.xu[1]}. Cari nilai pada permulaan dan pada akhir, serta jumlah perubahan.`), fig: mkFig(S1), a: T(`Start: ${n(S1.vals[0])} ${S1.c.yu[0]}; end: ${n(S1.vals[last])} ${S1.c.yu[0]}; change $= ${n(S1.vals[last] - S1.vals[0])}$ ${S1.c.yu[0]}`, `Permulaan: ${n(S1.vals[0])} ${S1.c.yu[1]}; akhir: ${n(S1.vals[last])} ${S1.c.yu[1]}; perubahan $= ${n(S1.vals[last] - S1.vals[0])}$ ${S1.c.yu[1]}`), sp: 's' };
    },
    /* describe trend in words (MCQ style) */
    (r) => {
      const S1 = mkSeries(r, { kind: r.pick(['inc', 'dec']) });
      return { q: T(`Look at the graph of the ${S1.c.u[0]}. Describe the overall trend in one word: increasing, decreasing or constant.`, `Perhatikan graf ${S1.c.u[1]}. Huraikan aliran keseluruhan dalam satu perkataan: bertambah, berkurang atau malar.`), fig: mkFig(S1), a: T(cap(trendWord(S1.vals).en), cap(trendWord(S1.vals).ms)), sp: 'xs' };
    },
    /* find the time for a given value */
    (r) => {
      const S1 = mkSeries(r, { kind: r.pick(['inc', 'dec']) });
      const i = r.int(1, S1.vals.length - 1);
      return { q: T(`The graph shows the ${S1.c.u[0]} over time. Find the time (in ${S1.c.xu[0]}) at which the ${S1.c.u[0]} first reaches ${n(S1.vals[i])} ${S1.c.yu[0]}.`, `Graf menunjukkan ${S1.c.u[1]} mengikut masa. Cari masa (dalam ${S1.c.xu[1]}) apabila ${S1.c.u[1]} mula-mula mencapai ${n(S1.vals[i])} ${S1.c.yu[1]}.`), fig: mkFig(S1), a: T(`${i} ${S1.c.xu[0]}`, `${i} ${S1.c.xu[1]}`), sp: 'xs' };
    },
    /* uniform vs non-uniform, simple */
    (r) => {
      const uni = r.chance();
      const S1 = mkSeries(r, { kind: uni ? r.pick(['inc', 'dec']) : 'nonuniform' });
      need(uni === isUniform(S1.vals));
      return { q: T(`Study the graph of the ${S1.c.u[0]}. Does it change by equal amounts over equal time intervals?`, `Kaji graf ${S1.c.u[1]}. Adakah ia berubah dengan jumlah yang sama pada selang masa yang sama?`), fig: mkFig(S1), a: uni ? T('Yes, equal amounts each interval.', 'Ya, jumlah yang sama pada setiap selang.') : T('No, the amounts of change are different.', 'Tidak, jumlah perubahan adalah berbeza.'), sp: 's' };
    },
  ];

  const g83m = [
    /* interpolate at half-step */
    (r) => {
      const S1 = mkSeries(r, { kind: r.pick(['inc', 'dec']) });
      const i = r.int(1, S1.vals.length - 2);
      const est = (S1.vals[i] + S1.vals[i + 1]) / 2;
      return { q: T(`The graph shows the ${S1.c.u[0]}. Estimate the value at ${n(i + 0.5)} ${S1.c.xu[0]} by interpolating between the two nearest points.`, `Graf menunjukkan ${S1.c.u[1]}. Anggarkan nilai pada ${n(i + 0.5)} ${S1.c.xu[1]} dengan interpolasi antara dua titik terdekat.`), fig: mkFig(S1), a: T(`About ${n(est)} ${S1.c.yu[0]}`, `Kira-kira ${n(est)} ${S1.c.yu[1]}`), sp: 's' };
    },
    /* fastest / slowest interval */
    (r) => {
      const S1 = mkSeries(r, { kind: 'nonuniform' });
      let bi = 0, worst = 0;
      for (let i = 0; i < S1.vals.length - 1; i++) { const d = Math.abs(S1.vals[i + 1] - S1.vals[i]); if (d > worst) { worst = d; bi = i; } }
      return { q: T(`The graph shows the ${S1.c.u[0]}. During which ${S1.c.xu[0].replace(/s$/, '')} interval did it change the fastest? Give the change in that interval.`, `Graf menunjukkan ${S1.c.u[1]}. Dalam selang ${S1.c.xu[1]} yang manakah ia berubah paling cepat? Berikan perubahan pada selang itu.`), fig: mkFig(S1), a: T(`Between ${S1.c.xu[0].replace(/s$/, '')} ${bi} and ${bi + 1}: a change of ${n(worst)} ${S1.c.yu[0]}`, `Antara ${S1.c.xu[1].replace(/s$/, '')} ${bi} dan ${bi + 1}: perubahan ${n(worst)} ${S1.c.yu[1]}`), sp: 's' };
    },
    /* uniform/non-uniform with reason from a table */
    (r) => {
      const uni = r.chance();
      const S1 = mkSeries(r, { kind: uni ? r.pick(['inc', 'dec']) : 'nonuniform', n: 5 });
      need(uni === isUniform(S1.vals));
      const diffs = S1.vals.slice(1).map((v, i) => v - S1.vals[i]);
      const tb = TB([[`${S1.c.xu[0]}`, ...S1.vals.map((_, i) => i)], [`${cap(S1.c.u[0])} (${S1.c.yu[0]})`, ...S1.vals]]);
      const tbM = TB([[`${S1.c.xu[1]}`, ...S1.vals.map((_, i) => i)], [`${cap(S1.c.u[1])} (${S1.c.yu[1]})`, ...S1.vals]]);
      return { q: T(`The table shows the ${S1.c.u[0]} at equal time intervals.<br>${tb}Is the change uniform or non-uniform? Give a reason using the differences.`, `Jadual menunjukkan ${S1.c.u[1]} pada selang masa yang sama.<br>${tbM}Adakah perubahan itu seragam atau tidak seragam? Berikan sebab menggunakan beza antara nilai.`), a: uni ? T(`Uniform: the differences are all ${n(diffs[0])}.`, `Seragam: semua beza ialah ${n(diffs[0])}.`) : T(`Non-uniform: the differences are ${diffs.map(n).join(', ')}, which are not all equal.`, `Tidak seragam: beza-bezanya ialah ${diffs.map(n).join(', ')}, yang tidak semuanya sama.`), sp: 's' };
    },
    /* compare two intervals qualitatively */
    (r) => {
      const S1 = mkSeries(r, { kind: 'nonuniform', n: 6 });
      const i = r.int(0, 4), j = r.pick([0, 1, 2, 3, 4].filter((v) => v !== i));
      const di = S1.vals[i + 1] - S1.vals[i], dj = S1.vals[j + 1] - S1.vals[j];
      need(di !== dj);
      return { q: T(`Using the graph, compare the change in the ${S1.c.u[0]} during the interval ${S1.c.xu[0].replace(/s$/, '')} $${i}$–$${i + 1}$ with the interval $${j}$–$${j + 1}$. Which interval has the greater change?`, `Menggunakan graf, bandingkan perubahan ${S1.c.u[1]} pada selang ${S1.c.xu[1].replace(/s$/, '')} $${i}$–$${i + 1}$ dengan selang $${j}$–$${j + 1}$. Selang yang manakah mempunyai perubahan yang lebih besar?`), fig: mkFig(S1), a: T(`Interval $${i}$–$${i + 1}$: ${n(Math.abs(di))} ${S1.c.yu[0]}; interval $${j}$–$${j + 1}$: ${n(Math.abs(dj))} ${S1.c.yu[0]}. The ${Math.abs(di) > Math.abs(dj) ? `$${i}$–$${i + 1}$` : `$${j}$–$${j + 1}$`} interval has the greater change.`, `Selang $${i}$–$${i + 1}$: ${n(Math.abs(di))} ${S1.c.yu[1]}; selang $${j}$–$${j + 1}$: ${n(Math.abs(dj))} ${S1.c.yu[1]}. Selang ${Math.abs(di) > Math.abs(dj) ? `$${i}$–$${i + 1}$` : `$${j}$–$${j + 1}$`} mempunyai perubahan yang lebih besar.`), sp: 's' };
    },
    /* intersection of two graphs: read coordinates */
    (r) => {
      const m1 = r.pick([2, 3, 1, -1, -2]), m2 = r.pick([1, -1, 2, -2, 0.5].filter((v) => v !== m1));
      const xi = r.int(-3, 3), c1 = 0, yi = m1 * xi;
      const c2 = yi - m2 * xi;
      need(Number.isInteger(c2) && Math.abs(c2) <= 6 && Math.abs(yi) <= 7);
      const fig = S.plane({ x: [-5, 5], y: [-8, 8], scale: 17, labelStep: 2, lines: [{ m: m1, c: 0, label: 'A' }, { m: m2, c: c2, label: 'B', dash: true }], pts: [{ x: xi, y: yi }] });
      return { q: T('The diagram shows two straight-line graphs, $A$ and $B$. Find the coordinates of their point of intersection.', 'Rajah menunjukkan dua graf garis lurus, $A$ dan $B$. Cari koordinat titik persilangan mereka.'), fig, a: T(`$(${xi},\\ ${yi})$`), sp: 's' };
    },
    /* intersection used to solve f(x)=g(x) */
    (r) => {
      const m1 = r.pick([1, 2, -1, 3]), xi = r.int(-3, 3), yi = m1 * xi + r.int(-2, 2);
      const c1 = yi - m1 * xi, m2 = r.pick([-1, 1, -2, 2].filter((v) => v !== m1)), c2 = yi - m2 * xi;
      need(Number.isInteger(c1) && Number.isInteger(c2) && Math.abs(c1) <= 8 && Math.abs(c2) <= 8 && Math.abs(yi) <= 7);
      const fig = S.plane({ x: [-5, 5], y: [-8, 8], scale: 17, labelStep: 2, lines: [{ m: m1, c: c1, label: 'y_1' }, { m: m2, c: c2, label: 'y_2', dash: true }], pts: [{ x: xi, y: yi }] });
      return { q: T(`The graphs of $y_1 = ${lin(m1, c1)}$ (solid) and $y_2 = ${lin(m2, c2)}$ (dashed) are drawn. Use the graph to estimate the solution of $${lin(m1, c1)} = ${lin(m2, c2)}$.`, `Graf $y_1 = ${lin(m1, c1)}$ (penuh) dan $y_2 = ${lin(m2, c2)}$ (putus-putus) dilukis. Gunakan graf untuk menganggar penyelesaian $${lin(m1, c1)} = ${lin(m2, c2)}$.`), fig, a: T(`$x = ${xi}$ (at the intersection, both give $y = ${yi}$)`, `$x = ${xi}$ (pada persilangan, kedua-duanya memberikan $y = ${yi}$)`), sp: 's' };
    },
    /* trend with units, describing change per interval */
    (r) => {
      const S1 = mkSeries(r, { kind: r.pick(['inc', 'dec']) });
      need(isUniform(S1.vals));
      const d = S1.vals[1] - S1.vals[0];
      return { q: T(`The graph shows the ${S1.c.u[0]} changing uniformly. Find the rate of change per ${S1.c.xu[0].replace(/s$/, '')}, with correct sign and units.`, `Graf menunjukkan ${S1.c.u[1]} berubah secara seragam. Cari kadar perubahan bagi setiap ${S1.c.xu[1].replace(/s$/, '')}, dengan tanda dan unit yang betul.`), fig: mkFig(S1), a: T(`${d > 0 ? '+' : ''}${n(d)} ${S1.c.yu[0]} per ${S1.c.xu[0].replace(/s$/, '')}`, `${d > 0 ? '+' : ''}${n(d)} ${S1.c.yu[1]} setiap ${S1.c.xu[1].replace(/s$/, '')}`), sp: 's' };
    },
  ];

  const g83a = [
    /* extrapolate and reliability */
    (r) => {
      const S1 = mkSeries(r, { kind: r.pick(['inc', 'dec']), n: 6 });
      need(isUniform(S1.vals));
      const last = S1.vals.length - 1, d = S1.vals[1] - S1.vals[0];
      const pred = S1.vals[last] + d * 2;
      return { q: T(`The graph shows the ${S1.c.u[0]} for the first ${last} ${S1.c.xu[0]}. Predict the value at ${last + 2} ${S1.c.xu[0]} by extending the trend. State one reason why this prediction may not be reliable.`, `Graf menunjukkan ${S1.c.u[1]} bagi ${last} ${S1.c.xu[1]} pertama. Ramalkan nilai pada ${last + 2} ${S1.c.xu[1]} dengan menyambung aliran itu. Nyatakan satu sebab mengapa ramalan ini mungkin tidak boleh dipercayai.`), fig: mkFig(S1), a: T(`About ${n(pred)} ${S1.c.yu[0]}. The trend may not continue this far beyond the data shown (conditions may change).`, `Kira-kira ${n(pred)} ${S1.c.yu[1]}. Aliran itu mungkin tidak berterusan sejauh ini di luar data yang ditunjukkan (keadaan mungkin berubah).`), sp: 'm' };
    },
    /* multiple intersections in a window */
    (r) => {
      const a = r.pick([1, -1]), h = r.pick([-1, 0, 1]), k = r.pick([2, 3, 4]);
      const F = (x) => a * (x - h) * (x - h) + (2 - a * k * k);
      const c = r.pick([1, -1, 2]);
      const roots = [];
      for (let x = -4; x <= 4; x++) { const y1 = F(x), y2 = c * x; if (Math.abs(y1 - y2) < 1e-9) roots.push(x); }
      need(roots.length >= 1 && roots.length <= 2 && roots.every((x) => Math.abs(F(x)) <= 8));
      const fig = S.plane({ x: [-5, 5], y: [-8, 8], scale: 17, labelStep: 2, curves: [{ f: F }], lines: [{ m: c, c: 0, dash: true }] });
      return { q: T(`The diagram shows a curve $y = f(x)$ and a straight line $y = g(x)$ drawn on the same axes. Use the graph to find all the solutions of $f(x) = g(x)$ shown in this window.`, `Rajah menunjukkan lengkung $y = f(x)$ dan garis lurus $y = g(x)$ yang dilukis pada paksi yang sama. Gunakan graf untuk mencari semua penyelesaian $f(x) = g(x)$ yang ditunjukkan dalam tetingkap ini.`), fig, a: T(`$x = ${roots.join(' \\text{ and } ')}$`, `$x = ${roots.join(' \\text{ dan } ')}$`), sp: 'm' };
    },
    /* justify why a prediction is (not) supported */
    (r) => {
      const S1 = mkSeries(r, { kind: 'nonuniform', n: 6 });
      const last = S1.vals.length - 1;
      const far = r.chance();
      const target = far ? last + r.int(3, 6) : r.int(1, last - 1);
      return { q: T(`The graph shows the ${S1.c.u[0]} for ${last} ${S1.c.xu[0]}. A pupil wants to predict the value at ${target} ${S1.c.xu[0]}. Is this interpolation or extrapolation? Is the prediction well supported by the data shown? Explain.`, `Graf menunjukkan ${S1.c.u[1]} bagi ${last} ${S1.c.xu[1]}. Seorang murid mahu meramalkan nilai pada ${target} ${S1.c.xu[1]}. Adakah ini interpolasi atau ekstrapolasi? Adakah ramalan ini disokong dengan baik oleh data yang ditunjukkan? Terangkan.`), fig: mkFig(S1), a: far ? T(`Extrapolation: ${target} is beyond the data shown (0 to ${last}). It is not well supported, since the trend outside the recorded range is unknown.`, `Ekstrapolasi: ${target} berada di luar data yang ditunjukkan (0 hingga ${last}). Ia tidak disokong dengan baik, kerana aliran di luar julat yang direkodkan tidak diketahui.`) : T(`Interpolation: ${target} lies within the data shown (0 to ${last}). It is reasonably well supported by the graph.`, `Interpolasi: ${target} terletak dalam data yang ditunjukkan (0 hingga ${last}). Ia disokong dengan agak baik oleh graf.`), sp: 'm' };
    },
    /* two graphs, compare trends and describe */
    (r) => {
      const c = r.pick(CTX83), v01 = r.int(c.v0[0], c.v0[1]), v02 = r.int(c.v0[0], c.v0[1]);
      need(Math.abs(v01 - v02) >= 3);
      const d1 = Math.abs(r.pick(c.step)), d2 = Math.abs(r.pick(c.step.map((v) => v * 1.5)));
      const N = 5;
      const A = [v01], B = [v02];
      for (let i = 1; i < N; i++) { A.push(A[i - 1] + d1 * Math.sign(c.step[1] || 1)); B.push(B[i - 1] + d2 * Math.sign(c.step[1] || 1)); }
      need(A.every((v) => v >= 0) && B.every((v) => v >= 0));
      const hi = Math.ceil((Math.max(...A, ...B) + 2) / 5) * 5;
      const figFn = (lang) => S.graph({ w: 330, h: 220, xr: [0, N - 1, 1], yr: [0, hi, Math.ceil(hi / 25) * 5 || 1], xlabel: c.xu[lang === 'en' ? 0 : 1], ylabel: cap(c.u[lang === 'en' ? 0 : 1]) + ' (' + c.yu[lang === 'en' ? 0 : 1] + ')', series: [{ pts: A.map((v, i) => [i, v]), type: 'line', dotsToo: true, dash: false }, { pts: B.map((v, i) => [i, v]), type: 'line', dotsToo: true, dash: true }] });
      const fig = T(figFn('en'), figFn('ms'));
      const cross = A.some((v, i) => i > 0 && (A[i - 1] - B[i - 1]) * (v - B[i]) < 0);
      return { q: T(`The graph compares the ${c.u[0]} in two separate cases, $P$ (solid) and $Q$ (dashed), over ${N - 1} ${c.xu[0]}. Compare how $P$ and $Q$ change, and state whether their values are ever equal.`, `Graf membandingkan ${c.u[1]} bagi dua kes yang berasingan, $P$ (penuh) dan $Q$ (putus-putus), sepanjang ${N - 1} ${c.xu[1]}. Bandingkan bagaimana $P$ dan $Q$ berubah, dan nyatakan sama ada nilai mereka pernah sama.`), fig, a: T(`$P$ changes at ${n(d1)} ${c.yu[0]} per interval, $Q$ at ${n(d2)} ${c.yu[0]} per interval (${d2 > d1 ? 'Q changes faster' : 'P changes faster'}). ${cross ? 'Their graphs cross, so their values are equal at some point.' : 'Their graphs do not cross in this range, so their values are never equal here.'}`, `$P$ berubah pada kadar ${n(d1)} ${c.yu[1]} setiap selang, $Q$ pada ${n(d2)} ${c.yu[1]} setiap selang (${d2 > d1 ? 'Q berubah lebih cepat' : 'P berubah lebih cepat'}). ${cross ? 'Graf mereka bersilang, jadi nilai mereka sama pada satu ketika.' : 'Graf mereka tidak bersilang dalam julat ini, jadi nilai mereka tidak pernah sama di sini.'}`), sp: 'l' };
    },
    /* find intersection algebraically then verify with the graph statement */
    (r) => {
      const m1 = r.pick([1, 2, 3, -1]), c1 = r.int(-4, 4), m2 = r.pick([-1, -2, 1, 2].filter((v) => v !== m1)), c2 = r.int(-4, 4);
      need(m1 !== m2);
      const xi = (c2 - c1) / (m2 - m1), yi = m1 * xi + c1;
      need(Number.isInteger(xi) && Number.isInteger(yi) && Math.abs(xi) <= 4 && Math.abs(yi) <= 7);
      const fig = S.plane({ x: [-5, 5], y: [-8, 8], scale: 17, labelStep: 2, lines: [{ m: m1, c: c1, label: 'A' }, { m: m2, c: c2, label: 'B', dash: true }] });
      return { q: T(`The graphs of the lines $A: y = ${lin(m1, c1)}$ and $B: y = ${lin(m2, c2)}$ are shown, without their point of intersection marked. Read the coordinates of the intersection point from the graph, then verify your answer by substitution.`, `Graf garis $A: y = ${lin(m1, c1)}$ dan $B: y = ${lin(m2, c2)}$ ditunjukkan, tanpa titik persilangan ditandakan. Baca koordinat titik persilangan daripada graf, kemudian sahkan jawapan anda dengan penggantian.`), fig, a: T(`$(${xi},\\ ${yi})$: substituting $x = ${xi}$ into both gives $y = ${yi}$.`, `$(${xi},\\ ${yi})$: menggantikan $x = ${xi}$ ke dalam kedua-dua persamaan memberikan $y = ${yi}$.`), sp: 'm' };
    },
    /* limitation of domain */
    (r) => {
      const S1 = mkSeries(r, { kind: r.pick(['inc', 'dec']) });
      const last = S1.vals.length - 1;
      return { q: T(`The graph shows the ${S1.c.u[0]} recorded only between ${0} and ${last} ${S1.c.xu[0]}. Explain why it would not be reasonable to use this graph to state the value at $${last * 3}$ ${S1.c.xu[0]}.`, `Graf menunjukkan ${S1.c.u[1]} yang direkodkan hanya antara ${0} dan ${last} ${S1.c.xu[1]}. Terangkan mengapa tidak munasabah untuk menggunakan graf ini bagi menyatakan nilai pada $${last * 3}$ ${S1.c.xu[1]}.`), fig: mkFig(S1), a: T(`$${last * 3}$ is far outside the range of the data shown (0 to ${last}); the trend may not continue in the same way, so extrapolating this far is unreliable.`, `$${last * 3}$ jauh di luar julat data yang ditunjukkan (0 hingga ${last}); aliran itu mungkin tidak berterusan dengan cara yang sama, jadi ekstrapolasi sejauh ini tidak boleh dipercayai.`), sp: 'm' };
    },
  ];
  SPM.extend('F2-8.3', { e: g83e, m: g83m, a: g83a });

  /* ---- extra F2-8.3 families ---- */
  const g83e2 = [
    /* true/false about the graph */
    (r) => {
      const S1 = mkSeries(r, { kind: r.pick(['inc', 'dec']) });
      const claimTrue = r.chance();
      const claim = claimTrue ? trendWord(S1.vals) : (trendWord(S1.vals).en === 'increasing' ? T('decreasing', 'berkurang') : T('increasing', 'bertambah'));
      return { q: T(`True or false? "The graph shows the ${S1.c.u[0]} ${claim.en} over time."`, `Benar atau palsu? "Graf menunjukkan ${S1.c.u[1]} ${claim.ms} mengikut masa."`), fig: mkFig(S1), a: claimTrue ? T('True', 'Benar') : T(`False; it is ${trendWord(S1.vals).en}.`, `Palsu; ia ${trendWord(S1.vals).ms}.`), sp: 's' };
    },
    /* count how many intervals increase / decrease (constant graph excluded) */
    (r) => {
      const S1 = mkSeries(r, { kind: 'nonuniform', n: 6 });
      const ups = S1.vals.slice(1).filter((v, i) => v > S1.vals[i]).length;
      return { q: T(`Look at the graph of the ${S1.c.u[0]}. In how many of the intervals shown does the value increase?`, `Perhatikan graf ${S1.c.u[1]}. Dalam berapa banyak selang yang ditunjukkan nilainya bertambah?`), fig: mkFig(S1), a: T(`${ups}`), sp: 's' };
    },
  ];
  const g83m2 = [
    /* find max/min value and when it occurs */
    (r) => {
      const S1 = mkSeries(r, { kind: 'nonuniform', n: 6 });
      const mx = Math.max(...S1.vals), mi = S1.vals.indexOf(mx);
      return { q: T(`Using the graph of the ${S1.c.u[0]}, find the greatest value shown and state when it occurs.`, `Menggunakan graf ${S1.c.u[1]}, cari nilai tertinggi yang ditunjukkan dan nyatakan bilakah ia berlaku.`), fig: mkFig(S1), a: T(`${n(mx)} ${S1.c.yu[0]}, at ${mi} ${S1.c.xu[0]}`, `${n(mx)} ${S1.c.yu[1]}, pada ${mi} ${S1.c.xu[1]}`), sp: 's' };
    },
    /* two-graph intersection MCQ style with quadrant reasoning */
    (r) => {
      const m1 = r.pick([1, 2, -1]), c1 = r.int(-3, 3), m2 = r.pick([-1, -2, 2].filter((v) => v !== m1)), c2 = r.int(-3, 3);
      need(m1 !== m2);
      const xi = (c2 - c1) / (m2 - m1), yi = m1 * xi + c1;
      need(Number.isInteger(xi) && Number.isInteger(yi) && Math.abs(xi) <= 4 && Math.abs(yi) <= 7);
      const fig = S.plane({ x: [-5, 5], y: [-8, 8], scale: 17, labelStep: 2, lines: [{ m: m1, c: c1, label: 'P' }, { m: m2, c: c2, label: 'Q', dash: true }], pts: [{ x: xi, y: yi }] });
      return { q: T('The lines $P$ and $Q$ intersect at the marked point. State the coordinates and explain what is true about $y_P$ and $y_Q$ there.', 'Garis $P$ dan $Q$ bersilang pada titik yang ditandakan. Nyatakan koordinatnya dan terangkan apa yang benar tentang $y_P$ dan $y_Q$ di situ.'), fig, a: T(`$(${xi},\\ ${yi})$; at this point $y_P = y_Q = ${yi}$ (both lines have the same $y$-value for the same $x$).`, `$(${xi},\\ ${yi})$; pada titik ini $y_P = y_Q = ${yi}$ (kedua-dua garis mempunyai nilai $y$ yang sama bagi $x$ yang sama).`), sp: 's' };
    },
    /* find x from a table then classify */
    (r) => {
      const S1 = mkSeries(r, { kind: r.pick(['inc', 'dec']), n: 5 });
      const tb = TB([[S1.c.xu[0], ...S1.vals.map((_, i) => i)], [`${cap(S1.c.u[0])} (${S1.c.yu[0]})`, ...S1.vals]]);
      const tbM = TB([[S1.c.xu[1], ...S1.vals.map((_, i) => i)], [`${cap(S1.c.u[1])} (${S1.c.yu[1]})`, ...S1.vals]]);
      const total = S1.vals[S1.vals.length - 1] - S1.vals[0];
      return { q: T(`The table below shows the ${S1.c.u[0]}.<br>${tb}Plot this data as a graph, then state the total change over the period shown.`, `Jadual di bawah menunjukkan ${S1.c.u[1]}.<br>${tbM}Plotkan data ini sebagai graf, kemudian nyatakan jumlah perubahan sepanjang tempoh yang ditunjukkan.`), a: T(`Total change $= ${n(total)}$ ${S1.c.yu[0]}`, `Jumlah perubahan $= ${n(total)}$ ${S1.c.yu[1]}`), sp: 'm' };
    },
  ];
  const g83a2 = [
    /* two graphs: describe the story matching a shape */
    (r) => {
      const S1 = mkSeries(r, { kind: 'nonuniform', n: 6 });
      const diffs = S1.vals.slice(1).map((v, i) => v - S1.vals[i]);
      const speeding = diffs.every((d, i) => i === 0 || Math.abs(d) >= Math.abs(diffs[i - 1]));
      return { q: T(`The graph shows the ${S1.c.u[0]}. Describe, using the changing steepness between consecutive points, whether the rate of change is speeding up, slowing down, or irregular across the intervals shown.`, `Graf menunjukkan ${S1.c.u[1]}. Huraikan, menggunakan perubahan kecuraman antara titik berturutan, sama ada kadar perubahan semakin pantas, semakin perlahan, atau tidak tetap sepanjang selang yang ditunjukkan.`), fig: mkFig(S1), a: T(`Changes per interval: ${diffs.map(n).join(', ')} ${S1.c.yu[0]}. ${speeding ? 'The rate is generally speeding up.' : 'The rate is irregular (it does not consistently speed up or slow down).'}`, `Perubahan setiap selang: ${diffs.map(n).join(', ')} ${S1.c.yu[1]}. ${speeding ? 'Kadar itu secara umumnya semakin pantas.' : 'Kadar itu tidak tetap (ia tidak semakin pantas atau perlahan secara konsisten).'}`), sp: 'l' };
    },
    /* solve for unknown constant to make graphs meet at a given point */
    (r) => {
      const m1 = r.pick([1, 2, -1, 3]), c1 = r.int(-3, 3), xi = r.int(-3, 3);
      const yi = m1 * xi + c1;
      const m2 = r.pick([-1, -2, 1, 2].filter((v) => v !== m1));
      const c2 = yi - m2 * xi;
      need(Number.isInteger(c2) && Math.abs(c2) <= 8);
      return { q: T(`The line $y = ${lin(m1, c1)}$ and the line $y = ${lin(m2, 0).replace(/\+ 0$/, '')} + k$ intersect at a point with $x = ${xi}$. Find $k$, then state the coordinates of the intersection.`, `Garis $y = ${lin(m1, c1)}$ dan garis $y = ${lin(m2, 0).replace(/\+ 0$/, '')} + k$ bersilang pada titik dengan $x = ${xi}$. Cari $k$, kemudian nyatakan koordinat titik persilangan.`), a: T(`$k = ${n(c2)}$; intersection at $(${xi},\\ ${yi})$`, `$k = ${n(c2)}$; persilangan pada $(${xi},\\ ${yi})$`), sp: 'm' };
    },
  ];
  SPM.extend('F2-8.3', { e: g83e2, m: g83m2, a: g83a2 });

  /* =========================================== F2-9.1 Speed */
  const hm = (t) => { const h = Math.floor(t + 1e-9), m = Math.round((t - h) * 60); return h ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`; };
  const hmMs = (t) => { const h = Math.floor(t + 1e-9), m = Math.round((t - h) * 60); return h ? (m ? `${h} j ${m} min` : `${h} j`) : `${m} min`; };
  const fmtClock = (mins) => `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  const VEH = [
    ['car', 'kereta'], ['bus', 'bas'], ['motorcycle', 'motosikal'], ['lorry', 'lori'], ['train', 'kereta api'], ['cyclist', 'penunggang basikal'], ['van', 'van'], ['express bus', 'bas ekspres'], ['LRT train', 'tren LRT'], ['KTM train', 'tren KTM'],
  ];
  const TRIP = [
    ['travels from Ipoh to Kuala Lumpur', 'bergerak dari Ipoh ke Kuala Lumpur'],
    ['travels along the PLUS highway', 'bergerak di sepanjang lebuh raya PLUS'],
    ['travels from the school to the sports complex', 'bergerak dari sekolah ke kompleks sukan'],
    ['travels from Johor Bahru to Melaka', 'bergerak dari Johor Bahru ke Melaka'],
    ['travels from Kuantan to Kuala Terengganu', 'bergerak dari Kuantan ke Kuala Terengganu'],
    ['travels from Kuching to Miri', 'bergerak dari Kuching ke Miri'],
  ];
  const speedContext = (r) => { const [ve, vm] = r.pick(VEH), [te, tm] = r.pick(TRIP); return { ve, vm, te, tm }; };

  const g91e = [
    /* v = s/t clean */
    (r) => {
      const v = r.int(3, 12) * 10, t = r.int(2, 6);
      const c = speedContext(r);
      const ph = [
        [`A ${c.ve} ${c.te} and travels ${v * t} km in ${t} hours. Find its speed.`, `Sebuah ${c.vm} ${c.tm} dan bergerak sejauh ${v * t} km dalam ${t} jam. Cari lajunya.`],
        [`A ${c.ve} travels ${v * t} km in ${t} hours at a uniform speed. Calculate the speed.`, `Sebuah ${c.vm} bergerak sejauh ${v * t} km dalam ${t} jam pada laju yang seragam. Hitung lajunya.`],
      ];
      return { q: TT(r.pick(ph)), a: T(`${v} km/h`, `${v} km/j`), w: T(`Speed $= ${v * t} \\div ${t}$`, `Laju $= ${v * t} \\div ${t}$`), sp: 'xs' };
    },
    /* s = vt */
    (r) => {
      const v = r.int(4, 12) * 10, t = r.int(2, 6);
      const c = speedContext(r);
      const ph = [
        [`A ${c.ve} moves at a constant speed of ${v} km/h for ${t} hours. Find the distance travelled.`, `Sebuah ${c.vm} bergerak pada laju malar ${v} km/j selama ${t} jam. Cari jarak yang dilalui.`],
        [`A ${c.ve} ${c.te} at ${v} km/h and takes ${t} hours. How far does it travel?`, `Sebuah ${c.vm} ${c.tm} pada ${v} km/j dan mengambil masa ${t} jam. Berapa jauhkah ia bergerak?`],
      ];
      return { q: TT(r.pick(ph)), a: T(`${v * t} km`), w: T(`Distance $= ${v} \\times ${t}$`, `Jarak $= ${v} \\times ${t}$`), sp: 'xs' };
    },
    /* t = s/v */
    (r) => {
      const v = r.int(3, 12) * 10, t = r.int(2, 6);
      const c = speedContext(r);
      return { q: T(`A ${c.ve} travels ${v * t} km at a constant speed of ${v} km/h. Find the time taken.`, `Sebuah ${c.vm} bergerak sejauh ${v * t} km pada laju malar ${v} km/j. Cari masa yang diambil.`), a: T(`${t} h`, `${t} j`), w: T(`Time $= ${v * t} \\div ${v}$`, `Masa $= ${v * t} \\div ${v}$`), sp: 'xs' };
    },
    /* unit conversion m/s to km/h and back, clean */
    (r) => {
      const ms1 = r.pick([5, 10, 15, 20, 25]), kmh = ms1 * 3.6;
      const dir = r.chance();
      return dir
        ? { q: T(`Convert ${ms1} m/s to km/h.`, `Tukarkan ${ms1} m/s kepada km/j.`), a: T(`${n(kmh)} km/h`, `${n(kmh)} km/j`), w: T(`$${ms1} \\times 3.6$`), sp: 'xs' }
        : { q: T(`Convert ${n(kmh)} km/h to m/s.`, `Tukarkan ${n(kmh)} km/j kepada m/s.`), a: T(`${ms1} m/s`), w: T(`$${n(kmh)} \\div 3.6$`), sp: 'xs' };
    },
    /* complete a distance-time table: uniform speed */
    (r) => {
      const v = r.pick([20, 30, 40, 50, 60]);
      const ts = [0, 1, 2, 3, 4];
      const c = speedContext(r);
      return { q: T(`A ${c.ve} moves at a uniform speed of ${v} km/h. Complete the table showing the distance travelled after each hour.<br>${blanks(ts, T('Time (h)', 'Masa (j)').en, T('Distance (km)', 'Jarak (km)').en)}`, `Sebuah ${c.vm} bergerak pada laju seragam ${v} km/j. Lengkapkan jadual yang menunjukkan jarak yang dilalui selepas setiap jam.<br>${blanks(ts, 'Masa (j)', 'Jarak (km)')}`), a: T(`${ts.map((t) => n(v * t)).join(', ')}`), sp: 's' };
    },
    /* identify uniform speed from a table */
    (r) => {
      const v = r.pick([20, 30, 40, 50]);
      const ts = [0, 1, 2, 3];
      const ds = ts.map((t) => v * t);
      return { q: T(`The table shows the distance travelled by a car at equal time intervals.<br>${TB([['Time (h)', ...ts], ['Distance (km)', ...ds]])}Is the car moving at a uniform speed? Give a reason.`, `Jadual menunjukkan jarak yang dilalui oleh sebuah kereta pada selang masa yang sama.<br>${TB([['Masa (j)', ...ts], ['Jarak (km)', ...ds]])}Adakah kereta itu bergerak pada laju yang seragam? Berikan sebab.`), a: T(`Yes: the distance increases by ${v} km every hour (equal amounts in equal time).`, `Ya: jarak bertambah sebanyak ${v} km setiap jam (jumlah yang sama dalam masa yang sama).`), sp: 's' };
    },
    /* cloze: formula */
    (r) => {
      const cz = r.pick([
        ['Speed $=$ ____ $\\div$ ____.', 'Laju $=$ ____ $\\div$ ____.', 'distance; time', 'jarak; masa'],
        ['Distance $=$ speed $\\times$ ____.', 'Jarak $=$ laju $\\times$ ____.', 'time', 'masa'],
        ['Time $=$ distance $\\div$ ____.', 'Masa $=$ jarak $\\div$ ____.', 'speed', 'laju'],
        ['If distance is measured in km and time in hours, speed is measured in ____.', 'Jika jarak diukur dalam km dan masa dalam jam, laju diukur dalam ____.', 'km/h', 'km/j'],
      ]);
      return { q: T(`Complete the sentence.<br>${cz[0]}`, `Lengkapkan ayat berikut.<br>${cz[1]}`), a: T(cz[2], cz[3]), sp: 'xs' };
    },
  ];

  const g91m = [
    /* time in h min */
    (r) => {
      const v = r.pick([36, 48, 60, 72, 80, 90, 96, 100, 108]), h = r.int(1, 3), m = r.pick([15, 30, 45]);
      const t = h + m / 60;
      need(Number.isInteger(v * t * 10) || Math.abs(v * t - Math.round(v * t)) < 1e-9);
      const c = speedContext(r);
      const ph = [
        [`A ${c.ve} moves at ${v} km/h for ${hm(t)}. Find the distance travelled.`, `Sebuah ${c.vm} bergerak pada ${v} km/j selama ${hmMs(t)}. Cari jarak yang dilalui.`],
        [`A ${c.ve} ${c.te} at ${v} km/h and travels for ${hm(t)}. Find the distance covered.`, `Sebuah ${c.vm} ${c.tm} pada ${v} km/j dan bergerak selama ${hmMs(t)}. Cari jarak yang dilaluinya.`],
      ];
      return { q: TT(r.pick(ph)), a: T(`${n(v * t)} km`), w: T(`Distance $= ${v} \\times t$, with $t$ in hours: $t = ${n(t)}$ h`, `Jarak $= ${v} \\times t$, dengan $t$ dalam jam: $t = ${n(t)}$ j`), sp: 's' };
    },
    /* time -> h min from distance and speed */
    (r) => {
      const v = r.pick([40, 50, 60, 80, 90, 100, 120]), t = r.pick([1.25, 1.5, 1.75, 2.25, 2.5, 0.75]);
      const d = v * t;
      need(Number.isInteger(d));
      const c = speedContext(r);
      return { q: T(`A ${c.ve} travels ${n(d)} km at a constant speed of ${v} km/h. Find the time taken, giving your answer in hours and minutes.`, `Sebuah ${c.vm} bergerak sejauh ${n(d)} km pada laju malar ${v} km/j. Cari masa yang diambil, berikan jawapan anda dalam jam dan minit.`), a: T(hm(t), hmMs(t)), sp: 's' };
    },
    /* unit conversion, non-multiple-of-5 */
    (r) => {
      const kmh = r.pick([18, 27, 45, 63, 81, 99]);
      const ms1 = round(kmh / 3.6, 2);
      const dir = r.chance();
      return dir
        ? { q: T(`A cyclist rides at ${kmh} km/h. Express this speed in m/s.`, `Seorang penunggang basikal menunggang pada ${kmh} km/j. Nyatakan laju ini dalam m/s.`), a: T(`${n(ms1)} m/s`), w: T(`$${kmh} \\div 3.6$`), sp: 's' }
        : { q: T(`A cyclist rides at ${n(ms1)} m/s. Express this speed in km/h.`, `Seorang penunggang basikal menunggang pada ${n(ms1)} m/s. Nyatakan laju ini dalam km/j.`), a: T(`${kmh} km/h`, `${kmh} km/j`), w: T(`$${n(ms1)} \\times 3.6$`), sp: 's' };
    },
    /* arrival time */
    (r) => {
      const v = r.pick([60, 80, 40, 50, 90, 100]), d = v * r.pick([1, 1.5, 2, 2.5, 3]);
      need(Number.isInteger(d));
      const start = r.pick([6, 7, 8, 9]) * 60 + r.pick([0, 15, 30, 45]);
      const t = d / v;
      const end = start + Math.round(t * 60);
      const c = speedContext(r), name = r.name();
      return { q: T(`${name} leaves at ${fmtClock(start)} for a place ${n(d)} km away and drives at ${v} km/h. At what time does ${name} arrive?`, `${name} bertolak pada pukul ${fmtClock(start)} ke suatu tempat sejauh ${n(d)} km dan memandu pada ${v} km/j. Pukul berapakah ${name} tiba?`), a: T(fmtClock(end)), w: T(`Time taken $= ${n(d)} \\div ${v}$ = ${hm(t)}`, `Masa diambil $= ${n(d)} \\div ${v}$ = ${hmMs(t)}`), sp: 's' };
    },
    /* departure time (work backwards) */
    (r) => {
      const v = r.pick([60, 80, 40, 50, 90]), d = v * r.pick([1, 1.5, 2, 2.5]);
      need(Number.isInteger(d));
      const arrive = r.pick([8, 9, 10, 12, 14]) * 60 + r.pick([0, 15, 30]);
      const t = d / v;
      const start = arrive - Math.round(t * 60);
      const name = r.name();
      return { q: T(`${name} must arrive at a town ${n(d)} km away by ${fmtClock(arrive)}, driving at ${v} km/h. What is the latest time ${name} can leave?`, `${name} mesti tiba di sebuah bandar sejauh ${n(d)} km sebelum pukul ${fmtClock(arrive)}, memandu pada ${v} km/j. Pukul berapakah lewat-lewatnya ${name} boleh bertolak?`), a: T(fmtClock(start)), w: T(`Time needed $= ${n(d)} \\div ${v}$ = ${hm(t)}`, `Masa diperlukan $= ${n(d)} \\div ${v}$ = ${hmMs(t)}`), sp: 's' };
    },
    /* average speed, two equal-ish legs simple (a<>b) */
    (r) => {
      const d = r.pick([60, 90, 120, 150]), v1 = r.pick([30, 40, 60]), v2 = r.pick([60, 80, 90, 120].filter((v) => v !== v1));
      const t1 = d / v1, t2 = d / v2;
      const avg = (2 * d) / (t1 + t2);
      need(Number.isInteger(t1 * 60) && Number.isInteger(t2 * 60));
      const c = speedContext(r);
      return { q: T(`A ${c.ve} travels ${d} km at ${v1} km/h and then another ${d} km at ${v2} km/h. Find the average speed for the whole journey.`, `Sebuah ${c.vm} bergerak sejauh ${d} km pada ${v1} km/j dan kemudian ${d} km lagi pada ${v2} km/j. Cari purata laju bagi keseluruhan perjalanan.`), a: T(`${n(round(avg, 2))} km/h (not ${n((v1 + v2) / 2)})`, `${n(round(avg, 2))} km/j (bukan ${n((v1 + v2) / 2)})`), w: T(`Total distance $${2 * d}$ km $\\div$ total time`, `Jumlah jarak $${2 * d}$ km $\\div$ jumlah masa`), sp: 'm' };
    },
    /* two different distances different speeds, average speed */
    (r) => {
      const d1 = r.pick([40, 60, 80, 100]), v1 = r.pick([40, 50, 80]), d2 = r.pick([30, 50, 60, 90]), v2 = r.pick([30, 60, 90].filter((v) => v !== v1));
      const t1 = d1 / v1, t2 = d2 / v2;
      need(Number.isInteger(t1 * 60) && Number.isInteger(t2 * 60));
      const avg = (d1 + d2) / (t1 + t2);
      const c = speedContext(r);
      return { q: T(`A ${c.ve} travels ${d1} km at ${v1} km/h, then ${d2} km at ${v2} km/h. Find (a) the total time taken, (b) the average speed for the journey.`, `Sebuah ${c.vm} bergerak sejauh ${d1} km pada ${v1} km/j, kemudian ${d2} km pada ${v2} km/j. Cari (a) jumlah masa yang diambil, (b) purata laju bagi perjalanan itu.`), a: T(`(a) ${hm(t1 + t2)} (b) ${n(round(avg, 2))} km/h`, `(a) ${hmMs(t1 + t2)} (b) ${n(round(avg, 2))} km/j`), sp: 'm' };
    },
    /* compare two speeds */
    (r) => {
      const v1 = r.pick([15, 20, 25]), v2ms = r.pick([6, 7, 8, 9]);
      const v1ms = round(v1 / 3.6, 2), v2kmh = round(v2ms * 3.6, 1);
      need(v1ms !== v2ms);
      const c1 = speedContext(r), c2 = speedContext(r);
      return { q: T(`A ${c1.ve} moves at ${v1} km/h and a ${c2.ve} moves at ${v2ms} m/s. Convert both speeds to the same unit and state which is faster.`, `Sebuah ${c1.vm} bergerak pada ${v1} km/j dan sebuah ${c2.vm} bergerak pada ${v2ms} m/s. Tukarkan kedua-dua laju kepada unit yang sama dan nyatakan yang mana lebih laju.`), a: T(`${v1} km/h $= ${n(v1ms)}$ m/s; ${v2ms} m/s $= ${n(v2kmh)}$ km/h. The ${v1ms > v2ms ? c1.ve : c2.ve} is faster.`, `${v1} km/j $= ${n(v1ms)}$ m/s; ${v2ms} m/s $= ${n(v2kmh)}$ km/j. ${cap(v1ms > v2ms ? c1.vm : c2.vm)} lebih laju.`), sp: 'm' };
    },
    /* table: uniform vs non-uniform classification with reason */
    (r) => {
      const uni = r.chance();
      const ts = [0, 1, 2, 3, 4];
      let ds;
      if (uni) { const v = r.pick([20, 30, 40, 50]); ds = ts.map((t) => v * t); }
      else { ds = [0]; for (let i = 1; i < 5; i++) ds.push(ds[i - 1] + r.pick([10, 20, 30, 40, 50])); need(new Set(ts.slice(1).map((_, i) => ds[i + 1] - ds[i])).size > 1); }
      return { q: T(`The table shows the distance travelled by a van at 1-hour intervals.<br>${TB([['Time (h)', ...ts], ['Distance (km)', ...ds]])}State whether the van's speed is uniform or non-uniform, and explain your reasoning.`, `Jadual menunjukkan jarak yang dilalui oleh sebuah van pada selang 1 jam.<br>${TB([['Masa (j)', ...ts], ['Jarak (km)', ...ds]])}Nyatakan sama ada laju van itu seragam atau tidak seragam, dan terangkan sebab anda.`), a: uni ? T('Uniform: equal distances are covered in each equal time interval.', 'Seragam: jarak yang sama dilalui dalam setiap selang masa yang sama.') : T('Non-uniform: the distances covered each hour are not equal.', 'Tidak seragam: jarak yang dilalui setiap jam tidak sama.'), sp: 's' };
    },
    /* rest included in total time */
    (r) => {
      const d = r.pick([80, 100, 120]), v = r.pick([40, 50, 60]), rest = r.pick([10, 15, 20, 30]);
      need(Number.isInteger((d / v) * 60));
      const move = d / v, tot = move + rest / 60;
      const c = speedContext(r);
      return { q: T(`A ${c.ve} travels ${d} km at ${v} km/h, then stops for a rest of ${rest} minutes. Find the total time for the journey, including the rest.`, `Sebuah ${c.vm} bergerak sejauh ${d} km pada ${v} km/j, kemudian berhenti untuk berehat selama ${rest} minit. Cari jumlah masa bagi perjalanan itu, termasuk rehat.`), a: T(hm(tot), hmMs(tot)), sp: 's' };
    },
    /* speed with graph, uniform */
    (r) => {
      const v = r.pick([20, 30, 40, 50]);
      const fig = S.graph({ w: 300, h: 200, xr: [0, 4, 1], yr: [0, v * 4 + 10, Math.ceil(v * 4 / 5 / 10) * 10 || v], xlabel: T('Time (h)', 'Masa (j)').en, ylabel: T('Distance (km)', 'Jarak (km)').en, series: [{ pts: [0, 1, 2, 3, 4].map((t) => [t, v * t]), type: 'line', dotsToo: true }] });
      const figMs = S.graph({ w: 300, h: 200, xr: [0, 4, 1], yr: [0, v * 4 + 10, Math.ceil(v * 4 / 5 / 10) * 10 || v], xlabel: 'Masa (j)', ylabel: 'Jarak (km)', series: [{ pts: [0, 1, 2, 3, 4].map((t) => [t, v * t]), type: 'line', dotsToo: true }] });
      return { q: T('The distance–time graph shows a journey. Use the graph to find the speed of the vehicle.', 'Graf jarak–masa menunjukkan suatu perjalanan. Gunakan graf itu untuk mencari laju kenderaan.'), fig: T(fig, figMs), a: T(`${v} km/h`, `${v} km/j`), w: T('Read any point and divide distance by time.', 'Baca sebarang titik dan bahagikan jarak dengan masa.'), sp: 's' };
    },
  ];

  const g91a = [
    /* full multi-stage: distance-speed-time table with rest, correct to 1 dp */
    (r) => {
      const d1 = r.pick([90, 120, 150]), v1 = r.pick([60, 90, 75]), rest = r.pick([20, 30, 45]), d2 = r.pick([60, 100, 120]), v2 = r.pick([80, 100, 60]);
      const t = d1 / v1 + rest / 60 + d2 / v2;
      const avg = (d1 + d2) / t;
      const c = speedContext(r);
      return { q: T(`A ${c.ve} travels ${d1} km at ${v1} km/h, rests for ${rest} minutes, then travels ${d2} km at ${v2} km/h. Find (a) the total time taken, (b) the average speed for the whole journey (including the rest), correct to 1 decimal place.`, `Sebuah ${c.vm} bergerak sejauh ${d1} km pada ${v1} km/j, berehat selama ${rest} minit, kemudian bergerak ${d2} km pada ${v2} km/j. Cari (a) jumlah masa yang diambil, (b) purata laju bagi keseluruhan perjalanan (termasuk rehat), betul kepada 1 tempat perpuluhan.`), a: T(`(a) ${n(round(t, 3))} h (b) ${n(round(avg, 1))} km/h`, `(a) ${n(round(t, 3))} j (b) ${n(round(avg, 1))} km/j`), sp: 'l' };
    },
    /* round trip, different speeds each way */
    (r) => {
      const d = r.pick([60, 90, 120, 150]), v1 = r.pick([30, 40, 60]), v2 = r.pick([50, 60, 90, 75].filter((v) => v !== v1));
      const t1 = d / v1, t2 = d / v2;
      const avg = (2 * d) / (t1 + t2);
      const c = speedContext(r);
      return { q: T(`A ${c.ve} travels from town $X$ to town $Y$, a distance of ${d} km, at ${v1} km/h, and returns along the same road at ${v2} km/h. Find (a) the total time for the round trip, (b) the average speed for the whole round trip.`, `Sebuah ${c.vm} bergerak dari bandar $X$ ke bandar $Y$, sejauh ${d} km, pada ${v1} km/j, dan berpatah balik melalui jalan yang sama pada ${v2} km/j. Cari (a) jumlah masa bagi perjalanan pergi balik itu, (b) purata laju bagi keseluruhan perjalanan pergi balik.`), a: T(`(a) ${n(round(t1 + t2, 3))} h (b) ${n(round(avg, 2))} km/h`, `(a) ${n(round(t1 + t2, 3))} j (b) ${n(round(avg, 2))} km/j`), sp: 'l' };
    },
    /* three-stage journey, find a missing speed to hit a target average */
    (r) => {
      const d1 = r.pick([40, 60, 80]), v1 = r.pick([40, 60, 80]), d2 = r.pick([40, 60, 80]), avgTarget = r.pick([50, 55, 60, 65]);
      const t1 = d1 / v1;
      const tTot = (d1 + d2) / avgTarget;
      const t2 = tTot - t1;
      need(t2 > 0.05 && Number.isInteger(round(t2 * 3600, 0)) === false || true);
      const v2 = d2 / t2;
      need(v2 > 0 && v2 < 200 && Math.abs(v2 - Math.round(v2 * 10) / 10) < 1e-6);
      const c = speedContext(r);
      return { q: T(`A ${c.ve} travels ${d1} km at ${v1} km/h, then ${d2} km more. If the average speed for the whole ${d1 + d2} km journey is ${avgTarget} km/h, find the speed for the second part of the journey, correct to 1 decimal place.`, `Sebuah ${c.vm} bergerak sejauh ${d1} km pada ${v1} km/j, kemudian ${d2} km lagi. Jika purata laju bagi keseluruhan perjalanan sejauh ${d1 + d2} km ialah ${avgTarget} km/j, cari laju bagi bahagian kedua perjalanan itu, betul kepada 1 tempat perpuluhan.`), a: T(`${n(round(v2, 1))} km/h`, `${n(round(v2, 1))} km/j`), w: T(`Total time needed $= \\dfrac{${d1 + d2}}{${avgTarget}}$ h; time for stage 1 $= \\dfrac{${d1}}{${v1}}$ h`, `Jumlah masa diperlukan $= \\dfrac{${d1 + d2}}{${avgTarget}}$ j; masa peringkat 1 $= \\dfrac{${d1}}{${v1}}$ j`), sp: 'l' };
    },
    /* explain why average of two speeds is wrong */
    (r) => {
      const d = r.pick([60, 80, 120]), v1 = r.pick([30, 40, 60]), v2 = r.pick([60, 80, 120].filter((v) => v !== v1));
      const avg = (2 * d) / (d / v1 + d / v2);
      return { q: T(`A pupil says the average speed for travelling ${d} km at ${v1} km/h and then ${d} km at ${v2} km/h is $\\dfrac{${v1} + ${v2}}{2} = ${n((v1 + v2) / 2)}$ km/h. Explain why this is wrong and find the correct average speed.`, `Seorang murid berkata purata laju bagi bergerak sejauh ${d} km pada ${v1} km/j dan kemudian ${d} km pada ${v2} km/j ialah $\\dfrac{${v1} + ${v2}}{2} = ${n((v1 + v2) / 2)}$ km/j. Terangkan mengapa ini salah dan cari purata laju yang betul.`), a: T(`Wrong, because the two stages take different amounts of time (more time is spent at the slower speed), so equal weight cannot be given to both speeds. Correct average speed $= ${n(round(avg, 2))}$ km/h (total distance $\\div$ total time).`, `Salah, kerana kedua-dua peringkat mengambil masa yang berbeza (lebih banyak masa dihabiskan pada laju yang lebih perlahan), jadi berat yang sama tidak boleh diberikan kepada kedua-dua laju. Purata laju yang betul $= ${n(round(avg, 2))}$ km/j (jumlah jarak $\\div$ jumlah masa).`), sp: 'm' };
    },
    /* compare uniform vs non-uniform using two tables */
    (r) => {
      const v = r.pick([20, 30, 40]);
      const ts = [0, 1, 2, 3, 4];
      const uds = ts.map((t) => v * t);
      const nds = [0]; for (let i = 1; i < 5; i++) nds.push(nds[i - 1] + r.pick([10, 20, 30, 40]));
      need(new Set(nds.slice(1).map((_, i) => nds[i + 1] - nds[i])).size > 1 && nds[4] > 0);
      return { q: T(`Two vehicles $P$ and $Q$ record the following distances.<br>${TB([['Time (h)', ...ts], ['$P$: distance (km)', ...uds], ['$Q$: distance (km)', ...nds]])}(a) Which vehicle moves at a uniform speed? Justify. (b) Find $P$'s speed. (c) Find $Q$'s average speed over the ${4} hours.`, `Dua kenderaan $P$ dan $Q$ merekodkan jarak berikut.<br>${TB([['Masa (j)', ...ts], ['$P$: jarak (km)', ...uds], ['$Q$: jarak (km)', ...nds]])}(a) Kenderaan yang manakah bergerak pada laju seragam? Justifikasikan. (b) Cari laju $P$. (c) Cari purata laju $Q$ sepanjang ${4} jam itu.`), a: P([T(`$P$: equal distances (${v} km) every hour.`, `$P$: jarak yang sama (${v} km) setiap jam.`), T(`${v} km/h`, `${v} km/j`), T(`${n(round(nds[4] / 4, 2))} km/h`, `${n(round(nds[4] / 4, 2))} km/j`)]), sp: 'l' };
    },
    /* speed with a delay meeting a deadline */
    (r) => {
      const d = r.pick([90, 120, 150, 180]), planV = r.pick([60, 75, 90]), delay = r.pick([10, 15, 20, 30]);
      const planT = d / planV;
      const avail = planT - delay / 60;
      need(avail > 0.2);
      const needV = d / avail;
      const c = speedContext(r);
      return { q: T(`A ${c.ve} plans to travel ${d} km at ${planV} km/h, but leaves ${delay} minutes late. To arrive at the planned time, find the speed it must now travel at, correct to 1 decimal place.`, `Sebuah ${c.vm} merancang untuk bergerak sejauh ${d} km pada ${planV} km/j, tetapi bertolak lewat ${delay} minit. Untuk tiba pada waktu yang dirancang, cari laju yang mesti digunakan sekarang, betul kepada 1 tempat perpuluhan.`), a: T(`${n(round(needV, 1))} km/h`, `${n(round(needV, 1))} km/j`), w: T(`Planned time $= \\dfrac{${d}}{${planV}}$ h; time available now $= $ planned time $- \\dfrac{${delay}}{60}$ h`, `Masa dirancang $= \\dfrac{${d}}{${planV}}$ j; masa yang ada sekarang $= $ masa dirancang $- \\dfrac{${delay}}{60}$ j`), sp: 'l' };
    },
    /* speed in two unit systems, multi-part */
    (r) => {
      const kmh = r.pick([54, 72, 90, 108]), t_s = r.pick([10, 20, 30]);
      const ms1 = kmh / 3.6;
      const dist_m = ms1 * t_s;
      return { q: T(`A car travels at a constant speed of ${kmh} km/h. (a) Express the speed in m/s. (b) Find the distance, in metres, travelled in ${t_s} seconds.`, `Sebuah kereta bergerak pada laju malar ${kmh} km/j. (a) Nyatakan laju itu dalam m/s. (b) Cari jarak, dalam meter, yang dilalui dalam ${t_s} saat.`), a: T(`(a) ${n(ms1)} m/s (b) ${n(dist_m)} m`), sp: 'm' };
    },
  ];
  SPM.extend('F2-9.1', { e: g91e, m: g91m, a: g91a });

  /* ---- extra F2-9.1 advanced templates ---- */
  const g91a2 = [
    /* two vehicles meeting head-on (not catch-up: this is core, not enrichment) */
    (r) => {
      const gap = r.pick([100, 150, 180, 200, 240]), v1 = r.pick([40, 50, 60]), v2 = r.pick([50, 60, 70, 80].filter((v) => v !== v1));
      const t = gap / (v1 + v2);
      need(Number.isInteger(round(t * 60, 0)));
      const c1 = speedContext(r), c2 = speedContext(r);
      return { q: T(`A ${c1.ve} and a ${c2.ve} start at the same time from two towns ${gap} km apart and travel towards each other, at ${v1} km/h and ${v2} km/h respectively. Find the time taken for them to meet.`, `Sebuah ${c1.vm} dan sebuah ${c2.vm} bertolak pada masa yang sama dari dua buah bandar yang berjarak ${gap} km, bergerak arah bertentangan menuju satu sama lain, masing-masing pada ${v1} km/j dan ${v2} km/j. Cari masa yang diambil untuk mereka bertemu.`), a: T(hm(t), hmMs(t)), w: T(`They close the gap together: $${gap} \\div (${v1} + ${v2})$`, `Mereka mengecilkan jurang bersama: $${gap} \\div (${v1} + ${v2})$`), sp: 'm' };
    },
    /* find the missing stage distance given avg speed */
    (r) => {
      const v1 = r.pick([40, 60, 80]), t1 = r.pick([1, 1.5, 2]), v2 = r.pick([50, 60, 90].filter((v) => v !== v1)), avgTarget = r.pick([55, 60, 65, 70]);
      const d1 = v1 * t1;
      need(avgTarget > Math.min(v1, v2) && avgTarget < Math.max(v1, v2));
      const t2 = (d1 - avgTarget * t1) / (avgTarget - v2);
      need(t2 > 0.1 && t2 < 10);
      const d2 = v2 * t2;
      need(Number.isInteger(round(d2, 1)) === false || true);
      const c = speedContext(r);
      return { q: T(`A ${c.ve} travels for ${hm(t1)} at ${v1} km/h, then continues at ${v2} km/h. If the average speed for the whole journey is ${avgTarget} km/h, find (a) the time taken for the second part, (b) the distance covered in the second part, both correct to 2 decimal places where needed.`, `Sebuah ${c.vm} bergerak selama ${hmMs(t1)} pada ${v1} km/j, kemudian meneruskan perjalanan pada ${v2} km/j. Jika purata laju bagi keseluruhan perjalanan ialah ${avgTarget} km/j, cari (a) masa yang diambil bagi bahagian kedua, (b) jarak yang dilalui pada bahagian kedua, kedua-duanya betul kepada 2 tempat perpuluhan jika perlu.`), a: T(`(a) ${n(round(t2, 2))} h (b) ${n(round(d2, 2))} km`, `(a) ${n(round(t2, 2))} j (b) ${n(round(d2, 2))} km`), sp: 'l' };
    },
    /* justify/explain: speed vs distance graph interpretation with numbers */
    (r) => {
      const v = r.pick([40, 50, 60, 80]);
      const t1 = r.pick([1, 2]), t2 = t1 + r.pick([1, 2]);
      const d1 = v * t1, d2 = v * t2;
      return { q: T(`A train moves at a uniform speed. It has travelled ${d1} km after ${t1} hour${t1 > 1 ? "s" : ""}. (a) Find its speed. (b) Predict the distance travelled after ${t2} hour${t2 > 1 ? "s" : ""}, assuming the speed stays the same. (c) Explain what "uniform speed" means in terms of equal time intervals.`, `Sebuah kereta api bergerak pada laju seragam. Ia telah bergerak sejauh ${d1} km selepas ${t1} jam. (a) Cari lajunya. (b) Ramalkan jarak yang dilalui selepas ${t2} jam, dengan anggapan laju kekal sama. (c) Terangkan maksud "laju seragam" dari segi selang masa yang sama.`), a: P([T(`${v} km/h`, `${v} km/j`), T(`${d2} km`), T('Equal distances are covered in every equal interval of time.', 'Jarak yang sama dilalui dalam setiap selang masa yang sama.')]), sp: 'm' };
    },
    /* three-stage table, find missing entries and average */
    (r) => {
      const v1 = r.pick([30, 40, 50]), v2 = r.pick([50, 60, 70]), v3 = r.pick([20, 30, 40]);
      const t1 = 1, t2 = 1, t3 = 1;
      const d1 = v1 * t1, d2 = v2 * t2, d3 = v3 * t3;
      const totD = d1 + d2 + d3, totT = t1 + t2 + t3;
      return { q: T(`A cyclist's journey is recorded in three 1-hour stages: ${v1} km/h, then ${v2} km/h, then ${v3} km/h. (a) Find the total distance travelled. (b) Find the average speed for the whole journey. (c) Is the average speed equal to the average of the three speeds? Check by calculation.`, `Perjalanan seorang penunggang basikal direkodkan dalam tiga peringkat 1 jam: ${v1} km/j, kemudian ${v2} km/j, kemudian ${v3} km/j. (a) Cari jumlah jarak yang dilalui. (b) Cari purata laju bagi keseluruhan perjalanan. (c) Adakah purata laju sama dengan purata tiga laju itu? Semak dengan pengiraan.`), a: P([T(`${totD} km`), T(`${n(totD / totT)} km/h`, `${n(totD / totT)} km/j`), T(`Yes here, because each stage takes the same time (1 hour); average of speeds $= ${n((v1 + v2 + v3) / 3)}$ km/h, which matches. (This only works because the times are equal.)`, `Ya di sini, kerana setiap peringkat mengambil masa yang sama (1 jam); purata laju $= ${n((v1 + v2 + v3) / 3)}$ km/j, yang sepadan. (Ini hanya berlaku kerana masa adalah sama.)`)]), sp: 'l' };
    },
  ];
  SPM.extend('F2-9.1', { a: g91a2 });

  /* =========================================== F2-9.1E Catch-up and relative speed (enrichment) */
  const g91Ee = [
    /* head start catch-up */
    (r) => {
      const v1 = r.pick([60, 70, 80, 90]), v2 = v1 + r.pick([20, 30, 40, 50]), head = r.pick([0.5, 1, 1.5, 2]);
      const gap = v1 * head;
      const t = gap / (v2 - v1);
      need(Number.isInteger(round(t * 60, 0)) && t > 0.1 && t < 20);
      const c1 = speedContext(r), c2 = speedContext(r);
      const ph = [
        [`${cap(c1.ve)} $P$ leaves town $A$ at ${v1} km/h. ${hm(head)} later, ${c2.ve} $Q$ leaves from the same place along the same road at ${v2} km/h. After how long from $Q$'s departure does $Q$ catch up with $P$?`, `${cap(c1.vm)} $P$ bertolak dari bandar $A$ pada ${v1} km/j. ${hmMs(head)} kemudian, ${c2.vm} $Q$ bertolak dari tempat yang sama di jalan yang sama pada ${v2} km/j. Selepas berapa lamakah dari waktu $Q$ bertolak, $Q$ memintas $P$?`],
        [`$P$ sets off at ${v1} km/h. ${hm(head)} later, $Q$ follows along the same road at ${v2} km/h. Find the time after $Q$ starts for $Q$ to catch up with $P$.`, `$P$ bertolak pada ${v1} km/j. ${hmMs(head)} kemudian, $Q$ mengikut di jalan yang sama pada ${v2} km/j. Cari masa selepas $Q$ bertolak untuk $Q$ memintas $P$.`],
      ];
      return { q: TT(r.pick(ph)), a: T(hm(t), hmMs(t)), w: T(`Gap when $Q$ starts $= ${v1} \\times ${n(head)} = ${n(gap)}$ km; closing speed $= ${v2} - ${v1} = ${v2 - v1}$ km/h`, `Jurang apabila $Q$ bertolak $= ${v1} \\times ${n(head)} = ${n(gap)}$ km; laju penutupan $= ${v2} - ${v1} = ${v2 - v1}$ km/j`), sp: 'm' };
    },
    /* catch-up: find distance from start where they meet */
    (r) => {
      const v1 = r.pick([50, 60, 70]), v2 = v1 + r.pick([20, 30]), head = r.pick([0.5, 1, 1.5]);
      const gap = v1 * head, t = gap / (v2 - v1), d = v2 * t;
      need(Number.isInteger(round(d, 1)) === false || true);
      need(t > 0.1 && t < 20 && Math.abs(d - Math.round(d)) < 1e-6);
      return { q: T(`A motorcyclist leaves at ${v1} km/h. ${hm(head)} later, a car leaves the same point along the same road at ${v2} km/h. Find how far from the starting point the car catches up with the motorcyclist.`, `Seorang penunggang motosikal bertolak pada ${v1} km/j. ${hmMs(head)} kemudian, sebuah kereta bertolak dari titik yang sama di jalan yang sama pada ${v2} km/j. Cari jarak dari titik permulaan di mana kereta itu memintas penunggang motosikal itu.`), a: T(`${n(d)} km`), w: T(`Time to catch up $= \\dfrac{${n(gap)}}{${v2 - v1}}$ h; distance $= ${v2} \\times$ that time`, `Masa untuk memintas $= \\dfrac{${n(gap)}}{${v2 - v1}}$ j; jarak $= ${v2} \\times$ masa itu`), sp: 'm' };
    },
    /* two moving towards each other, different start times */
    (r) => {
      const gap = r.pick([150, 180, 200, 240]), v1 = r.pick([40, 50, 60]), v2 = r.pick([50, 60, 70, 80].filter((v) => v !== v1)), head = r.pick([0.5, 1]);
      const remaining = gap - v1 * head;
      need(remaining > 0);
      const t = remaining / (v1 + v2);
      need(t > 0.05 && Number.isInteger(round((head + t) * 60, 0)));
      const c1 = speedContext(r), c2 = speedContext(r);
      return { q: T(`Two towns $A$ and $B$ are ${gap} km apart. A ${c1.ve} leaves $A$ towards $B$ at ${v1} km/h. ${hm(head)} later, a ${c2.ve} leaves $B$ towards $A$ at ${v2} km/h. Find the total time from when the ${c1.ve} left until they meet.`, `Dua buah bandar $A$ dan $B$ berjarak ${gap} km. Sebuah ${c1.vm} bertolak dari $A$ menuju $B$ pada ${v1} km/j. ${hmMs(head)} kemudian, sebuah ${c2.vm} bertolak dari $B$ menuju $A$ pada ${v2} km/j. Cari jumlah masa dari waktu ${c1.vm} itu bertolak sehingga mereka bertemu.`), a: T(hm(head + t), hmMs(head + t)), w: T(`Distance covered by the first vehicle before the second starts $= ${v1} \\times ${n(head)}$ km; remaining gap $\\div$ combined speed gives the extra time.`, `Jarak yang dilalui oleh kenderaan pertama sebelum kenderaan kedua bertolak $= ${v1} \\times ${n(head)}$ km; baki jurang $\\div$ laju gabungan memberikan masa tambahan.`), sp: 'l' };
    },
    /* overtaking on a circular track (same direction, laps) */
    (r) => {
      const lap = r.pick([2, 2.5, 4, 5]), v1 = r.pick([20, 24, 30]), v2 = v1 + r.pick([4, 6, 8, 10]);
      const t = lap / (v2 - v1);
      need(t > 0.02 && t < 5 && Number.isInteger(round(t * 60, 0)));
      return { q: T(`Two cyclists ride round a circular track of length ${n(lap)} km, starting together, at ${v1} km/h and ${v2} km/h. After how long does the faster cyclist lap the slower one (gain a full lap)?`, `Dua penunggang basikal mengelilingi sebuah trek bulat sepanjang ${n(lap)} km, bermula bersama, pada ${v1} km/j dan ${v2} km/j. Selepas berapa lamakah penunggang yang lebih laju melangkau (mendahului sepusingan penuh) penunggang yang lebih perlahan?`), a: T(hm(t), hmMs(t)), w: T(`To gain a full lap of ${n(lap)} km at a relative speed of ${v2 - v1} km/h`, `Untuk mendahului sepusingan penuh ${n(lap)} km pada laju relatif ${v2 - v1} km/j`), sp: 'm' };
    },
    /* find v2 given a catch-up time */
    (r) => {
      const v1 = r.pick([50, 60, 70]), head = r.pick([0.5, 1, 1.5]), t = r.pick([0.5, 1, 1.5, 2]);
      const gap = v1 * head, v2 = v1 + gap / t;
      need(Number.isInteger(v2));
      const c = speedContext(r);
      return { q: T(`A ${c.ve} $P$ leaves at ${v1} km/h. ${hm(head)} later, ${c.ve} $Q$ leaves the same place along the same road and catches up with $P$ after ${hm(t)}. Find the speed of $Q$.`, `${cap(c.vm)} $P$ bertolak pada ${v1} km/j. ${hmMs(head)} kemudian, ${c.vm} $Q$ bertolak dari tempat yang sama di jalan yang sama dan memintas $P$ selepas ${hmMs(t)}. Cari laju $Q$.`), a: T(`${n(v2)} km/h`, `${n(v2)} km/j`), w: T(`Gap $= ${v1} \\times ${n(head)} = ${n(gap)}$ km; $Q$ must close this gap in ${hm(t)}`, `Jurang $= ${v1} \\times ${n(head)} = ${n(gap)}$ km; $Q$ mesti menutup jurang ini dalam ${hmMs(t)}`), sp: 'm' };
    },
    /* relative speed same direction, distance apart after time */
    (r) => {
      const v1 = r.pick([50, 60, 70]), v2 = v1 + r.pick([10, 15, 20]), t = r.pick([0.5, 1, 1.5, 2]);
      const gapAfter = (v2 - v1) * t;
      const c1 = speedContext(r), c2 = speedContext(r);
      return { q: T(`A ${c1.ve} and a ${c2.ve} start together from the same point, moving in the same direction, at ${v1} km/h and ${v2} km/h. How far apart are they after ${hm(t)}?`, `Sebuah ${c1.vm} dan sebuah ${c2.vm} bertolak bersama dari titik yang sama, bergerak dalam arah yang sama, pada ${v1} km/j dan ${v2} km/j. Berapa jauhkah jarak antara mereka selepas ${hmMs(t)}?`), a: T(`${n(gapAfter)} km`), w: T(`Relative speed $= ${v2} - ${v1} = ${v2 - v1}$ km/h`, `Laju relatif $= ${v2} - ${v1} = ${v2 - v1}$ km/j`), sp: 's' };
    },
    /* two objects moving towards each other, time to be a given distance apart */
    (r) => {
      const gap = r.pick([100, 150, 200]), v1 = r.pick([30, 40, 50]), v2 = r.pick([40, 50, 60]), remain = r.pick([10, 20, 30]);
      need(gap > remain);
      const t = (gap - remain) / (v1 + v2);
      need(t > 0.05 && Number.isInteger(round(t * 60, 0)));
      const c1 = speedContext(r), c2 = speedContext(r);
      return { q: T(`Two towns are ${gap} km apart. A ${c1.ve} leaves one town at ${v1} km/h and a ${c2.ve} leaves the other at the same time, travelling towards each other at ${v2} km/h. Find the time taken until they are ${remain} km apart.`, `Dua buah bandar berjarak ${gap} km. Sebuah ${c1.vm} bertolak dari satu bandar pada ${v1} km/j dan sebuah ${c2.vm} bertolak dari bandar yang satu lagi pada masa yang sama, bergerak menuju satu sama lain pada ${v2} km/j. Cari masa yang diambil sehingga mereka berjarak ${remain} km.`), a: T(hm(t), hmMs(t)), w: T(`They must together cover $${gap} - ${remain} = ${gap - remain}$ km, closing at $${v1} + ${v2} = ${v1 + v2}$ km/h`, `Mereka bersama-sama mesti melalui $${gap} - ${remain} = ${gap - remain}$ km, menutup pada $${v1} + ${v2} = ${v1 + v2}$ km/j`), sp: 'm' };
    },
  ];
  SPM.extend('F2-9.1E', { e: g91Ee, m: g91Ee, a: g91Ee });

  /* =========================================== F2-9.2 Acceleration */
  const MOVER = [
    ['car', 'kereta'], ['motorcycle', 'motosikal'], ['cyclist', 'penunggang basikal'], ['train', 'kereta api'], ['bus', 'bas'], ['lift', 'lif'], ['runner', 'pelari'], ['van', 'van'],
  ];
  const accCtx = (r) => { const [ve, vm] = r.pick(MOVER); return { ve, vm }; };
  const g92e = [
    /* from rest, a = v/t */
    (r) => {
      const t = r.int(2, 10), a = r.int(2, 8);
      const c = accCtx(r);
      const ph = [
        [`A ${c.ve} starts from rest and reaches a speed of ${a * t} m/s after ${t} seconds. Find its acceleration.`, `Sebuah ${c.vm} bermula dari keadaan pegun dan mencapai laju ${a * t} m/s selepas ${t} saat. Cari pecutannya.`],
        [`A ${c.ve} accelerates uniformly from rest. Its speed is ${a * t} m/s after ${t} seconds. Find its acceleration.`, `Sebuah ${c.vm} memecut secara seragam daripada keadaan pegun. Lajunya ialah ${a * t} m/s selepas ${t} saat. Cari pecutannya.`],
      ];
      return { q: TT(r.pick(ph)), a: T(`${a} m/s²`), w: T(`$a = \\dfrac{${a * t} - 0}{${t}}$`), sp: 's' };
    },
    /* non-zero u, find a */
    (r) => {
      const u = r.int(2, 12), t = r.int(2, 8), a = r.int(1, 5);
      const v = u + a * t;
      const c = accCtx(r);
      return { q: T(`A ${c.ve} increases its speed from ${u} m/s to ${v} m/s in ${t} seconds. Find the acceleration.`, `Sebuah ${c.vm} meningkatkan lajunya daripada ${u} m/s kepada ${v} m/s dalam ${t} saat. Cari pecutannya.`), a: T(`${a} m/s²`), w: T(`$a = \\dfrac{${v} - ${u}}{${t}}$`), sp: 's' };
    },
    /* deceleration to rest */
    (r) => {
      const u = r.int(8, 30), t = r.int(2, 8);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} travelling at ${u * t} m/s brakes uniformly and comes to rest in ${t} seconds. Find its deceleration.`, `Sebuah ${c.vm} yang bergerak pada ${u * t} m/s memberhentikan diri dengan brek secara seragam dalam ${t} saat. Cari nyahpecutannya.`), a: T(`Acceleration $= ${-u}$ m/s² (deceleration ${u} m/s²)`, `Pecutan $= ${-u}$ m/s² (nyahpecutan ${u} m/s²)`), sp: 's' };
    },
    /* v = u + at */
    (r) => {
      const u = r.int(1, 10), a = r.int(1, 6), t = r.int(2, 8);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} moves with an initial speed of ${u} m/s and a uniform acceleration of ${a} m/s². Find its speed after ${t} seconds.`, `Sebuah ${c.vm} bergerak dengan laju awal ${u} m/s dan pecutan seragam ${a} m/s². Cari lajunya selepas ${t} saat.`), a: T(`${u + a * t} m/s`), w: T(`$v = ${u} + ${a} \\times ${t}$`), sp: 's' };
    },
    /* t = (v-u)/a */
    (r) => {
      const u = r.int(1, 10), a = r.int(1, 6), t = r.int(2, 8);
      const v = u + a * t;
      const c = accCtx(r);
      return { q: T(`A ${c.ve} accelerates uniformly at ${a} m/s² from ${u} m/s. How long does it take to reach ${v} m/s?`, `Sebuah ${c.vm} memecut secara seragam pada ${a} m/s² daripada ${u} m/s. Berapa lamakah masa yang diambil untuk mencapai ${v} m/s?`), a: T(`${t} s`), w: T(`$t = \\dfrac{${v} - ${u}}{${a}}$`), sp: 's' };
    },
    /* cloze: formula */
    (r) => {
      const cz = r.pick([
        ['Acceleration $=$ ____ $\\div$ ____.', 'Pecutan $=$ ____ $\\div$ ____.', 'change in speed; time taken', 'perubahan laju; masa yang diambil'],
        ['A negative acceleration is also called ____.', 'Pecutan negatif juga dipanggil ____.', 'deceleration', 'nyahpecutan'],
        ['If speed is in m/s and time is in seconds, acceleration is measured in ____.', 'Jika laju dalam m/s dan masa dalam saat, pecutan diukur dalam ____.', 'm/s²', 'm/s²'],
        ['If a moving object slows down, its acceleration is ____.', 'Jika objek yang bergerak semakin perlahan, pecutannya ialah ____.', 'negative', 'negatif'],
      ]);
      return { q: T(`Complete the sentence.<br>${cz[0]}`, `Lengkapkan ayat berikut.<br>${cz[1]}`), a: T(cz[2], cz[3]), sp: 'xs' };
    },
    /* sign of acceleration from words */
    (r) => {
      const up = r.chance();
      const c = accCtx(r);
      return { q: T(`A ${c.ve} is ${up ? 'speeding up' : 'slowing down'}. Is its acceleration positive or negative?`, `Sebuah ${c.vm} sedang ${up ? 'memecut' : 'perlahan'}. Adakah pecutannya positif atau negatif?`), a: up ? T('Positive', 'Positif') : T('Negative (a deceleration)', 'Negatif (nyahpecutan)'), sp: 'xs' };
    },
  ];

  const g92m = [
    /* deceleration to a lower nonzero speed */
    (r) => {
      const v = r.int(2, 15), t = r.int(2, 8), dec = r.int(1, 5);
      const u = v + dec * t;
      const c = accCtx(r);
      return { q: T(`A ${c.ve} travelling at ${u} m/s decelerates uniformly to ${v} m/s in ${t} seconds. Find its acceleration.`, `Sebuah ${c.vm} yang bergerak pada ${u} m/s menyahpecut secara seragam kepada ${v} m/s dalam ${t} saat. Cari pecutannya.`), a: T(`$-${dec}$ m/s² (a deceleration of ${dec} m/s²)`, `$-${dec}$ m/s² (nyahpecutan ${dec} m/s²)`), w: T(`$a = \\dfrac{${v} - ${u}}{${t}}$`), sp: 's' };
    },
    /* find u given v, a, t */
    (r) => {
      const a = r.int(2, 6), t = r.int(2, 8), v = r.int(30, 80);
      const u = v - a * t;
      need(u > 0);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} accelerates uniformly at ${a} m/s² for ${t} seconds and reaches a speed of ${v} m/s. Find its initial speed.`, `Sebuah ${c.vm} memecut secara seragam pada ${a} m/s² selama ${t} saat dan mencapai laju ${v} m/s. Cari laju awalnya.`), a: T(`${u} m/s`), w: T(`$u = ${v} - ${a} \\times ${t}$`), sp: 's' };
    },
    /* find t given a deceleration to rest, non-zero u given as km/h -> convert first? keep simple m/s here */
    (r) => {
      const dec = r.int(2, 8), u = r.int(20, 60);
      need(u % dec === 0);
      const t = u / dec;
      const c = accCtx(r);
      return { q: T(`A ${c.ve} travelling at ${u} m/s decelerates uniformly at ${dec} m/s². How long does it take to stop?`, `Sebuah ${c.vm} yang bergerak pada ${u} m/s menyahpecut secara seragam pada ${dec} m/s². Berapa lamakah masa yang diambil untuk berhenti?`), a: T(`${t} s`), w: T(`$t = \\dfrac{0 - ${u}}{-${dec}}$`), sp: 's' };
    },
    /* convert km/h to m/s before finding acceleration */
    (r) => {
      const u = r.pick([36, 54, 72]), t = r.int(4, 10), v = u + r.pick([18, 36]);
      const a = round((v - u) / 3.6 / t, 3);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} increases its speed from ${u} km/h to ${v} km/h in ${t} seconds. Find the acceleration in m/s².`, `Sebuah ${c.vm} meningkatkan lajunya daripada ${u} km/j kepada ${v} km/j dalam ${t} saat. Cari pecutan dalam m/s².`), a: T(`${n(a)} m/s²`), w: T(`Convert first: ${u} km/h $= ${n(round(u / 3.6, 3))}$ m/s, ${v} km/h $= ${n(round(v / 3.6, 3))}$ m/s`, `Tukar dahulu: ${u} km/j $= ${n(round(u / 3.6, 3))}$ m/s, ${v} km/j $= ${n(round(v / 3.6, 3))}$ m/s`), sp: 'm' };
    },
    /* two-phase: accelerate then decelerate, find max speed and second phase's a */
    (r) => {
      const a1 = r.int(2, 4), t1 = r.int(3, 6), t2 = r.int(2, 5);
      const v = a1 * t1, a2 = round(v / t2, 2);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} accelerates from rest at ${a1} m/s² for ${t1} seconds, then brakes to a stop in ${t2} seconds. Find (a) its maximum speed, (b) its deceleration.`, `Sebuah ${c.vm} memecut dari keadaan pegun pada ${a1} m/s² selama ${t1} saat dan kemudian memberhentikan diri dalam ${t2} saat. Cari (a) laju maksimumnya, (b) nyahpecutannya.`), a: T(`(a) ${v} m/s (b) ${n(a2)} m/s²`), sp: 'm' };
    },
    /* which vehicle accelerates more (compare) */
    (r) => {
      const u1 = r.int(0, 10), v1 = u1 + r.int(10, 30), t1 = r.int(3, 8);
      const u2 = r.int(0, 10), v2 = u2 + r.int(10, 30), t2 = r.int(3, 8);
      const a1 = round((v1 - u1) / t1, 2), a2 = round((v2 - u2) / t2, 2);
      need(a1 !== a2);
      const c1 = accCtx(r), c2 = accCtx(r);
      return { q: T(`A ${c1.ve} speeds up from ${u1} m/s to ${v1} m/s in ${t1} s. A ${c2.ve} speeds up from ${u2} m/s to ${v2} m/s in ${t2} s. Which one has the greater acceleration?`, `Sebuah ${c1.vm} meningkatkan laju daripada ${u1} m/s kepada ${v1} m/s dalam ${t1} s. Sebuah ${c2.vm} meningkatkan laju daripada ${u2} m/s kepada ${v2} m/s dalam ${t2} s. Yang manakah mempunyai pecutan yang lebih besar?`), a: T(`${c1.ve}: ${n(a1)} m/s²; ${c2.ve}: ${n(a2)} m/s². The ${a1 > a2 ? c1.ve : c2.ve} has the greater acceleration.`, `${cap(c1.vm)}: ${n(a1)} m/s²; ${cap(c2.vm)}: ${n(a2)} m/s². ${cap(a1 > a2 ? c1.vm : c2.vm)} mempunyai pecutan yang lebih besar.`), sp: 'm' };
    },
    /* spot the error: sign of deceleration */
    (r) => {
      const u = r.int(20, 40), v = r.int(2, 15), t = r.int(2, 8);
      need(u > v);
      const wrongA = round((u - v) / t, 2);
      const rightA = -wrongA;
      const c = accCtx(r);
      return { q: T(`A ${c.ve} slows from ${u} m/s to ${v} m/s in ${t} s. A pupil calculates the acceleration as $\\dfrac{${u} - ${v}}{${t}} = ${n(wrongA)}$ m/s². Explain the pupil's mistake and give the correct acceleration.`, `Sebuah ${c.vm} perlahan daripada ${u} m/s kepada ${v} m/s dalam ${t} s. Seorang murid mengira pecutan sebagai $\\dfrac{${u} - ${v}}{${t}} = ${n(wrongA)}$ m/s². Terangkan kesilapan murid itu dan berikan pecutan yang betul.`), a: T(`The pupil used $u - v$ instead of $v - u$ (final $-$ initial). Correct acceleration $= \\dfrac{${v} - ${u}}{${t}} = ${n(rightA)}$ m/s² (a deceleration).`, `Murid itu menggunakan $u - v$ dan bukannya $v - u$ (akhir $-$ awal). Pecutan yang betul $= \\dfrac{${v} - ${u}}{${t}} = ${n(rightA)}$ m/s² (nyahpecutan).`), sp: 'm' };
    },
    /* table of speed vs time, find a */
    (r) => {
      const u = r.int(0, 10), a = r.int(2, 6);
      const ts = [0, 2, 4, 6];
      const vs2 = ts.map((t) => u + a * t);
      return { q: T(`The table shows the speed of a van at different times.<br>${TB([['Time (s)', ...ts], ['Speed (m/s)', ...vs2]])}Find the acceleration of the van.`, `Jadual menunjukkan laju sebuah van pada masa yang berbeza.<br>${TB([['Masa (s)', ...ts], ['Laju (m/s)', ...vs2]])}Cari pecutan van itu.`), a: T(`${a} m/s²`), w: T('Use any two rows: change in speed $\\div$ change in time.', 'Gunakan mana-mana dua baris: perubahan laju $\\div$ perubahan masa.'), sp: 's' };
    },
  ];

  const g92a = [
    /* two-phase, convert units, find each phase's acceleration */
    (r) => {
      const u = r.pick([0, 18, 36]), v1 = u + r.pick([36, 54]), t1 = r.int(4, 10);
      const v2 = r.pick([0, 18]);
      const t2 = r.int(3, 8);
      const a1 = round((v1 / 3.6 - u / 3.6) / t1, 3), a2 = round((v2 / 3.6 - v1 / 3.6) / t2, 3);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} increases its speed from ${u} km/h to ${v1} km/h in ${t1} seconds, then changes speed to ${v2} km/h over the next ${t2} seconds. Find, in m/s², (a) the acceleration in the first stage, (b) the acceleration in the second stage.`, `Sebuah ${c.vm} meningkatkan lajunya daripada ${u} km/j kepada ${v1} km/j dalam ${t1} saat, kemudian mengubah lajunya kepada ${v2} km/j dalam ${t2} saat berikutnya. Cari, dalam m/s², (a) pecutan pada peringkat pertama, (b) pecutan pada peringkat kedua.`), a: T(`(a) ${n(a1)} m/s² (b) ${n(a2)} m/s²`), sp: 'l' };
    },
    /* find time to reach a target speed given acceleration, then distance-free multi-part */
    (r) => {
      const u = r.int(0, 15), a = r.int(2, 6), v = r.int(u + 10, u + 40);
      const t = round((v - u) / a, 2);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} moving at ${u} m/s accelerates uniformly at ${a} m/s². (a) Find the time taken to reach ${v} m/s. (b) If it then decelerates uniformly at ${a * 2} m/s² to rest, find the time taken to stop from ${v} m/s.`, `Sebuah ${c.vm} yang bergerak pada ${u} m/s memecut secara seragam pada ${a} m/s². (a) Cari masa yang diambil untuk mencapai ${v} m/s. (b) Jika ia kemudian menyahpecut secara seragam pada ${a * 2} m/s² sehingga berhenti, cari masa yang diambil untuk berhenti daripada ${v} m/s.`), a: T(`(a) ${n(t)} s (b) ${n(round(v / (a * 2), 2))} s`), sp: 'm' };
    },
    /* comparative reasoning with words, no numbers first then numbers */
    (r) => {
      const u1 = r.int(0, 5), v1 = u1 + r.int(15, 30), t1 = r.int(3, 6);
      const u2 = u1, v2 = v1, t2 = r.pick([t1 - 1, t1 + 1].filter((v) => v > 0));
      need(t2 && t2 !== t1);
      const a1 = round((v1 - u1) / t1, 2), a2 = round((v2 - u2) / t2, 2);
      const c1 = accCtx(r), c2 = accCtx(r);
      return { q: T(`A ${c1.ve} and a ${c2.ve} both increase their speed from ${u1} m/s to ${v1} m/s, but the ${c1.ve} takes ${t1} s while the ${c2.ve} takes ${t2} s. Without calculating, state which vehicle has the greater acceleration. Then verify by calculation.`, `Sebuah ${c1.vm} dan sebuah ${c2.vm} kedua-duanya meningkatkan laju daripada ${u1} m/s kepada ${v1} m/s, tetapi ${c1.vm} mengambil masa ${t1} s manakala ${c2.vm} mengambil masa ${t2} s. Tanpa mengira, nyatakan kenderaan yang manakah mempunyai pecutan yang lebih besar. Kemudian sahkan dengan pengiraan.`), a: T(`The ${t1 < t2 ? c1.ve : c2.ve} (same change in speed but less time means greater acceleration). ${c1.ve}: $${n(a1)}$ m/s²; ${c2.ve}: $${n(a2)}$ m/s².`, `${cap(t1 < t2 ? c1.vm : c2.vm)} (perubahan laju yang sama tetapi masa yang lebih singkat bermakna pecutan yang lebih besar). ${cap(c1.vm)}: $${n(a1)}$ m/s²; ${cap(c2.vm)}: $${n(a2)}$ m/s².`), sp: 'm' };
    },
    /* three-phase journey summary */
    (r) => {
      const u = 0, a1 = r.int(2, 5), t1 = r.int(3, 6);
      const v1 = u + a1 * t1, t2 = r.int(3, 8), a2 = 0;
      const t3 = r.int(3, 6), a3 = -round(v1 / t3, 2);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} starts from rest and accelerates uniformly at ${a1} m/s² for ${t1} s, then travels at a constant speed for ${t2} s, then decelerates uniformly to rest in ${t3} s. Find (a) the constant speed reached, (b) the acceleration in the last stage.`, `Sebuah ${c.vm} bermula daripada keadaan pegun dan memecut secara seragam pada ${a1} m/s² selama ${t1} s, kemudian bergerak pada laju malar selama ${t2} s, kemudian menyahpecut secara seragam sehingga berhenti dalam ${t3} s. Cari (a) laju malar yang dicapai, (b) pecutan pada peringkat terakhir.`), a: T(`(a) ${v1} m/s (b) $${n(a3)}$ m/s²`), sp: 'l' };
    },
    /* explain why deceleration is negative, using signed values */
    (r) => {
      const u = r.int(20, 40), v = r.int(2, 15), t = r.int(2, 8);
      need(u > v);
      const a = round((v - u) / t, 2);
      return { q: T(`A car's speed decreases from ${u} m/s to ${v} m/s in ${t} s while moving in the same fixed direction. (a) Calculate the acceleration, keeping the correct sign. (b) Explain what the negative sign means physically.`, `Laju sebuah kereta berkurang daripada ${u} m/s kepada ${v} m/s dalam ${t} s semasa bergerak dalam arah tetap yang sama. (a) Kira pecutan, dengan mengekalkan tanda yang betul. (b) Terangkan maksud tanda negatif itu secara fizikal.`), a: P([T(`$a = \\dfrac{${v} - ${u}}{${t}} = ${n(a)}$ m/s²`), T('The negative sign shows the speed is decreasing (a deceleration), while the car still moves in the same direction.', 'Tanda negatif menunjukkan laju semakin berkurang (nyahpecutan), sementara kereta itu masih bergerak dalam arah yang sama.')]), sp: 'm' };
    },
    /* find missing acceleration to satisfy a total-time constraint */
    (r) => {
      const u = 0, v = r.int(20, 40), tTot = r.int(8, 14), t1 = r.int(3, 6);
      need(tTot > t1);
      const a1 = r.pick([2, 3, 4, 5]);
      const vMid = a1 * t1;
      need(vMid < v);
      const t2 = tTot - t1;
      const a2 = round((v - vMid) / t2, 2);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} starts from rest and accelerates at ${a1} m/s² for ${t1} s, then accelerates at a different constant rate to reach ${v} m/s at a total elapsed time of ${tTot} s. Find the acceleration during the second stage.`, `Sebuah ${c.vm} bermula daripada keadaan pegun dan memecut pada ${a1} m/s² selama ${t1} s, kemudian memecut pada kadar malar yang berbeza untuk mencapai ${v} m/s pada jumlah masa ${tTot} s. Cari pecutan pada peringkat kedua.`), a: T(`${n(a2)} m/s²`), w: T(`Speed after stage 1 $= ${a1} \\times ${t1} = ${vMid}$ m/s; stage 2 lasts $${tTot} - ${t1} = ${t2}$ s`, `Laju selepas peringkat 1 $= ${a1} \\times ${t1} = ${vMid}$ m/s; peringkat 2 berlangsung $${tTot} - ${t1} = ${t2}$ s`), sp: 'l' };
    },
  ];
  SPM.extend('F2-9.2', { e: g92e, m: g92m, a: g92a });

  /* ---- extra F2-9.2 families to broaden variety ---- */
  const g92e2 = [
    /* MCQ: pick the correct formula usage */
    (r) => {
      const u = r.int(2, 10), a = r.int(2, 6), t = r.int(2, 8), v = u + a * t;
      const opts = r.shuffle([v, u + a, v + t, u - a * t]);
      const L = 'ABCD', cor = opts.indexOf(v);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} starts at ${u} m/s and accelerates at ${a} m/s² for ${t} s. What is its final speed?<br>${opts.map((o, j) => `(${L[j]}) ${n(o)} m/s`).join('&emsp;')}`, `Sebuah ${c.vm} bermula pada ${u} m/s dan memecut pada ${a} m/s² selama ${t} s. Apakah laju akhirnya?<br>${opts.map((o, j) => `(${L[j]}) ${n(o)} m/s`).join('&emsp;')}`), a: T(`(${L[cor]}) ${v} m/s`), sp: 's' };
    },
    /* true/false about deceleration */
    (r) => {
      const tf = r.pick([
        ['Deceleration means the speed of a moving object is decreasing.', 'Nyahpecutan bermaksud laju objek yang bergerak semakin berkurang.', 1, ''],
        ['Acceleration can only be positive.', 'Pecutan hanya boleh positif.', 0, 'Acceleration can be negative, which is a deceleration.'],
        ['The unit of acceleration is m/s².', 'Unit pecutan ialah m/s².', 1, ''],
        ['If a car moves at a constant speed, its acceleration is zero.', 'Jika sebuah kereta bergerak pada laju malar, pecutannya ialah sifar.', 1, ''],
        ['Acceleration is the same as speed.', 'Pecutan adalah sama dengan laju.', 0, 'Acceleration is the rate of change of speed, not the speed itself.'],
      ]);
      const msWhy = tf[3] === 'Acceleration can be negative, which is a deceleration.' ? 'Pecutan boleh negatif, iaitu nyahpecutan.' : tf[3] === 'Acceleration is the rate of change of speed, not the speed itself.' ? 'Pecutan ialah kadar perubahan laju, bukan laju itu sendiri.' : '';
      return { q: T(`True or false? "${tf[0]}"`, `Benar atau palsu? "${tf[1]}"`), a: tf[2] ? T('True', 'Benar') : T(`False. ${tf[3]}`, `Palsu. ${msWhy}`), sp: 'xs' };
    },
    /* constant speed => zero acceleration */
    (r) => {
      const v = r.int(10, 30), t = r.int(2, 8);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} travels at a constant ${v} m/s for ${t} seconds. Find its acceleration.`, `Sebuah ${c.vm} bergerak pada ${v} m/s yang malar selama ${t} saat. Cari pecutannya.`), a: T('$0$ m/s²', '$0$ m/s²'), w: T('The speed does not change.', 'Laju tidak berubah.'), sp: 'xs' };
    },
  ];
  const g92m2 = [
    /* express acceleration then find distance is out of scope; use time to reach a speed given a and u in mixed */
    (r) => {
      const u = r.int(0, 8), a = r.int(2, 5), v = r.int(u + 10, u + 30);
      const t = round((v - u) / a, 2);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} moving at ${u} m/s accelerates uniformly at ${a} m/s². Find the time taken to reach ${v} m/s.`, `Sebuah ${c.vm} yang bergerak pada ${u} m/s memecut secara seragam pada ${a} m/s². Cari masa yang diambil untuk mencapai ${v} m/s.`), a: T(`${n(t)} s`), w: T(`$t = \\dfrac{${v} - ${u}}{${a}}$`), sp: 's' };
    },
    /* deceleration expressed with explicit negative sign requested */
    (r) => {
      const u = r.int(20, 50), v = r.int(0, 15), t = r.int(2, 10);
      need(u > v);
      const a = round((v - u) / t, 2);
      const c = accCtx(r);
      return { q: T(`A ${c.ve}'s speed changes from ${u} m/s to ${v} m/s in ${t} s. State its acceleration, using a negative value if it is a deceleration.`, `Laju sebuah ${c.vm} berubah daripada ${u} m/s kepada ${v} m/s dalam ${t} s. Nyatakan pecutannya, menggunakan nilai negatif jika ia nyahpecutan.`), a: T(`${n(a)} m/s²`), sp: 's' };
    },
    /* cloze with computed values */
    (r) => {
      const u = r.int(2, 10), a = r.int(2, 6), t = r.int(2, 6), v = u + a * t;
      const which = r.pick(['v', 'u', 'a', 't']);
      const parts2 = { u, a, t, v };
      const blankKey = which;
      const shownVals = Object.assign({}, parts2); delete shownVals[blankKey];
      const cc = accCtx(r);
      return { q: T(`A ${cc.ve} has $u = ${u}$ m/s, $a = ${a}$ m/s², $t = ${t}$ s and $v = ${v}$ m/s, connected by $v = u + at$. If the value of ${blankKey === 'v' ? '$v$' : blankKey === 'u' ? '$u$' : blankKey === 'a' ? '$a$' : '$t$'} is hidden, find it from the other three.`, `Sebuah ${cc.vm} mempunyai $u = ${u}$ m/s, $a = ${a}$ m/s², $t = ${t}$ s dan $v = ${v}$ m/s, dihubungkan oleh $v = u + at$. Jika nilai ${blankKey === 'v' ? '$v$' : blankKey === 'u' ? '$u$' : blankKey === 'a' ? '$a$' : '$t$'} disembunyikan, cari nilainya daripada tiga yang lain.`), a: T(`${n(parts2[blankKey])}${blankKey === 'v' || blankKey === 'u' ? ' m/s' : blankKey === 'a' ? ' m/s²' : ' s'}`), sp: 's' };
    },
  ];
  const g92a2 = [
    /* deceleration then re-acceleration net change */
    (r) => {
      const u = r.int(20, 40), dec = r.int(2, 5), t1 = r.int(2, 5);
      const vMid = u - dec * t1;
      need(vMid > 0);
      const acc2 = r.int(1, 4), t2 = r.int(2, 6);
      const vEnd = vMid + acc2 * t2;
      const c = accCtx(r);
      return { q: T(`A ${c.ve} moving at ${u} m/s decelerates at ${dec} m/s² for ${t1} s, then accelerates at ${acc2} m/s² for ${t2} s. Find its final speed.`, `Sebuah ${c.vm} yang bergerak pada ${u} m/s menyahpecut pada ${dec} m/s² selama ${t1} s, kemudian memecut pada ${acc2} m/s² selama ${t2} s. Cari laju akhirnya.`), a: T(`${n(vEnd)} m/s`), w: T(`After stage 1: $${u} - ${dec} \\times ${t1} = ${vMid}$ m/s; after stage 2: $${vMid} + ${acc2} \\times ${t2}$`, `Selepas peringkat 1: $${u} - ${dec} \\times ${t1} = ${vMid}$ m/s; selepas peringkat 2: $${vMid} + ${acc2} \\times ${t2}$`), sp: 'l' };
    },
    /* find u,v,a,t mixed unit multi-part with km/h given for u only */
    (r) => {
      const uKmh = r.pick([18, 36, 54]), t = r.int(4, 10), a = r.int(1, 4);
      const uMs = round(uKmh / 3.6, 2);
      const vMs = round(uMs + a * t, 2);
      const vKmh = round(vMs * 3.6, 1);
      const c = accCtx(r);
      return { q: T(`A ${c.ve} starts at ${uKmh} km/h and accelerates uniformly at ${a} m/s² for ${t} s. Find its final speed in (a) m/s, (b) km/h.`, `Sebuah ${c.vm} bermula pada ${uKmh} km/j dan memecut secara seragam pada ${a} m/s² selama ${t} s. Cari laju akhirnya dalam (a) m/s, (b) km/j.`), a: T(`(a) ${n(vMs)} m/s (b) ${n(vKmh)} km/h`, `(a) ${n(vMs)} m/s (b) ${n(vKmh)} km/j`), w: T(`Initial speed $= ${uKmh} \\div 3.6 = ${n(uMs)}$ m/s`, `Laju awal $= ${uKmh} \\div 3.6 = ${n(uMs)}$ m/s`), sp: 'l' };
    },
  ];
  SPM.extend('F2-9.2', { e: g92e2, m: g92m2, a: g92a2 });
})();
