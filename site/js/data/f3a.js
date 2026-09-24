/* Form 3 – Chapters 1 to 5 */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, round, need, retry, sum, gcd, isPrime, Fr, poly, lin, rm } = SPM;
  const S = SPM.svg;
  const F = SPM.figs;
  const T = SPM.L;
  const W = SPM.lines;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const frT = Fr.tex;
  const pw = (b, e) => `${b}^{${e}}`;
  const rad = (d) => (d * Math.PI) / 180;

  /* =============================================================== 1 */
  const g11e = [
    (r) => {
      const b = r.int(2, 6), e = r.int(2, 5);
      need(Math.pow(b, e) < 2000);
      return { q: T(`Evaluate $${pw(b, e)}$.`, `Hitung $${pw(b, e)}$.`), a: T(`$${Math.pow(b, e)}$`), w: W(T(`$${pw(b, e)}$ means $${b}$ multiplied by itself $${e}$ times.`, `$${pw(b, e)}$ bermaksud $${b}$ didarab dengan dirinya sendiri sebanyak $${e}$ kali.`), `$${pw(b, e)} = ${Array(e).fill(b).join(' \\times ')} = ${Math.pow(b, e)}$`), sp: 's' };
    },
    (r) => {
      const b = r.int(2, 9), e = r.int(3, 6);
      return { q: T(`Write $${Array(e).fill(b).join(' \\times ')}$ in index form.`, `Tulis $${Array(e).fill(b).join(' \\times ')}$ dalam bentuk indeks.`), a: T(`$${pw(b, e)}$`), w: W(T(`The repeated factor $${b}$ is the base; count how many times it appears: $${e}$ times.`, `Faktor berulang $${b}$ ialah asas; kira berapa kali ia muncul: $${e}$ kali.`), `$${Array(e).fill(b).join(' \\times ')} = ${pw(b, e)}$`), sp: 'xs' };
    },
    (r) => {
      const b = r.pick(['a', 'x', 'p', 'm']), e = r.int(3, 6);
      return { q: T(`In $${b}^{${e}}$, state the base and the index.`, `Dalam $${b}^{${e}}$, nyatakan asas dan indeksnya.`), a: T(`Base $${b}$, index $${e}$`, `Asas $${b}$, indeks $${e}$`), w: W(T(`$${b}^{${e}}$ means $${b}$ multiplied by itself $${e}$ times.`, `$${b}^{${e}}$ bermaksud $${b}$ didarab dengan dirinya sendiri sebanyak $${e}$ kali.`), T(`The repeated value $${b}$ is the base; the raised number $${e}$ is the index.`, `Nilai yang berulang $${b}$ ialah asas; nombor kecil di atas $${e}$ ialah indeks.`)), sp: 'xs' };
    },
  ];
  const g11m = [
    (r) => {
      const b = r.int(2, 5), e = r.pick([2, 4]);
      return { q: T(`Evaluate (a) $(-${b})^{${e}}$ (b) $-${b}^{${e}}$. Explain why they differ.`, `Hitung (a) $(-${b})^{${e}}$ (b) $-${b}^{${e}}$. Terangkan mengapa jawapannya berbeza.`), a: T(`(a) $${Math.pow(b, e)}$ (b) $${-Math.pow(b, e)}$: in (a) the base is $-${b}$; in (b) only $${b}$ is raised to the power`, `(a) $${Math.pow(b, e)}$ (b) $${-Math.pow(b, e)}$: dalam (a) asasnya ialah $-${b}$; dalam (b) hanya $${b}$ yang dikuasakan`), w: W(T(`(a) The bracket makes $-${b}$ the base: $(-${b})^{${e}} = ${Array(e).fill(`(-${b})`).join(' \\times ')} = ${Math.pow(b, e)}$`, `(a) Kurungan menjadikan $-${b}$ sebagai asas: $(-${b})^{${e}} = ${Array(e).fill(`(-${b})`).join(' \\times ')} = ${Math.pow(b, e)}$`), T(`An even index pairs up the negative signs, so the answer is positive.`, `Indeks genap memasangkan tanda negatif, jadi jawapannya positif.`), T(`(b) Without a bracket only $${b}$ is raised: $-${b}^{${e}} = -(${pw(b, e)}) = ${-Math.pow(b, e)}$`, `(b) Tanpa kurungan hanya $${b}$ yang dikuasakan: $-${b}^{${e}} = -(${pw(b, e)}) = ${-Math.pow(b, e)}$`)), sp: 's' };
    },
    (r) => {
      const d = r.int(2, 5), e = r.int(2, 4);
      return { q: T(`Evaluate $\\left(\\dfrac{1}{${d}}\\right)^{${e}}$.`, `Hitung $\\left(\\dfrac{1}{${d}}\\right)^{${e}}$.`), a: T(`$\\dfrac{1}{${Math.pow(d, e)}}$`), w: W(T(`Raise the numerator and the denominator to the power $${e}$.`, `Kuasakan pengangka dan penyebut dengan kuasa $${e}$.`), `$\\left(\\dfrac{1}{${d}}\\right)^{${e}} = \\dfrac{1^{${e}}}{${pw(d, e)}} = \\dfrac{1}{${Math.pow(d, e)}}$`), sp: 's' };
    },
  ];
  const g11a = [
    (r) => {
      const a = r.int(2, 3), b = r.int(2, 3), c = r.int(2, 4), d = 2;
      const v = Math.pow(a, 3) * Math.pow(b + 1, 2) - Math.pow(c, d);
      return { q: T(`Evaluate $${pw(a, 3)} \\times ${pw(b + 1, 2)} - ${pw(c, d)}$.`, `Hitung $${pw(a, 3)} \\times ${pw(b + 1, 2)} - ${pw(c, d)}$.`), a: T(`$${v}$`), w: W(T(`Evaluate each power first.`, `Hitung setiap kuasa dahulu.`), `$${pw(a, 3)} = ${Math.pow(a, 3)}$, $${pw(b + 1, 2)} = ${Math.pow(b + 1, 2)}$, $${pw(c, d)} = ${Math.pow(c, d)}$`, `$${Math.pow(a, 3)} \\times ${Math.pow(b + 1, 2)} - ${Math.pow(c, d)} = ${Math.pow(a, 3) * Math.pow(b + 1, 2)} - ${Math.pow(c, d)} = ${v}$`), sp: 's' };
    },
    (r) => ({ q: T('Arrange $2^{10}$, $3^6$ and $5^4$ in ascending order by evaluating each.', 'Susun $2^{10}$, $3^6$ dan $5^4$ mengikut tertib menaik dengan menilai setiap satu.'), a: T('$5^4 = 625 < 3^6 = 729 < 2^{10} = 1024$'), w: W(T('Evaluate each power; a bigger index does not always mean a bigger value.', 'Hitung setiap kuasa; indeks yang lebih besar tidak semestinya bernilai lebih besar.'), '$2^{10} = 1024$, $3^6 = 729$, $5^4 = 625$', T('$625 \\lt 729 \\lt 1024$, so $5^4 \\lt 3^6 \\lt 2^{10}$', '$625 \\lt 729 \\lt 1024$, jadi $5^4 \\lt 3^6 \\lt 2^{10}$')), sp: 's' }),
  ];
  const g12e = [
    (r) => {
      const v = r.pick(['x', 'y', 'a', 'p']), a = r.int(2, 8), b = r.int(2, 8);
      const mul = r.chance();
      return mul
        ? { q: T(`Simplify $${v}^{${a}} \\times ${v}^{${b}}$.`, `Ringkaskan $${v}^{${a}} \\times ${v}^{${b}}$.`), a: T(`$${v}^{${a + b}}$`), w: W(T('Same base, multiplication: add the indices, $a^m \\times a^n = a^{m+n}$.', 'Asas sama, pendaraban: tambah indeks, $a^m \\times a^n = a^{m+n}$.'), `$${v}^{${a}} \\times ${v}^{${b}} = ${v}^{${a} + ${b}} = ${v}^{${a + b}}$`), sp: 's' }
        : { q: T(`Simplify $${v}^{${a + b}} \\div ${v}^{${b}}$.`, `Ringkaskan $${v}^{${a + b}} \\div ${v}^{${b}}$.`), a: T(`$${v}^{${a}}$`), w: W(T('Same base, division: subtract the indices, $a^m \\div a^n = a^{m-n}$.', 'Asas sama, pembahagian: tolak indeks, $a^m \\div a^n = a^{m-n}$.'), `$${v}^{${a + b}} \\div ${v}^{${b}} = ${v}^{${a + b} - ${b}} = ${v}^{${a}}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 5), b = r.int(2, 4);
      return { q: T(`Simplify $(x^{${a}})^{${b}}$.`, `Ringkaskan $(x^{${a}})^{${b}}$.`), a: T(`$x^{${a * b}}$`), w: W(T('A power raised to a power: multiply the indices, $(a^m)^n = a^{mn}$.', 'Kuasa dikuasakan lagi: darab indeks, $(a^m)^n = a^{mn}$.'), `$(x^{${a}})^{${b}} = x^{${a} \\times ${b}} = x^{${a * b}}$`), sp: 's' };
    },
  ];
  const expStr = (v, e) => (e === 0 ? '1' : e === 1 ? v : `${v}^{${e}}`);
  const g12m = [
    (r) => {
      // (a^p b^q)^k ÷ a^r b^s
      const k = r.int(2, 3), p = r.int(1, 3), q = r.int(1, 3), rr = r.int(1, 3), s = r.int(1, 5);
      const ea = k * p - rr, eb = k * q - s;
      const ans = (ea === 0 ? '' : expStr('a', ea)) + (eb === 0 ? '' : expStr('b', eb));
      const negs = (ea < 0 || eb < 0);
      const ansTex = (() => { const num = [], den = []; if (ea > 0) num.push(expStr('a', ea)); if (ea < 0) den.push(expStr('a', -ea)); if (eb > 0) num.push(expStr('b', eb)); if (eb < 0) den.push(expStr('b', -eb)); const N = num.join('') || '1'; return den.length ? `\\dfrac{${N}}{${den.join('')}}` : N; })();
      const mid = `${expStr('a', k * p)}${expStr('b', k * q)}`;
      const raw = ((ea === 0 ? '' : expStr('a', ea)) + (eb === 0 ? '' : expStr('b', eb))) || '1';
      return { q: T(`Simplify $(a^{${p}}b^{${q}})^{${k}} \\div a^{${rr}}b^{${s}}$. Give your answer with positive indices.`, `Ringkaskan $(a^{${p}}b^{${q}})^{${k}} \\div a^{${rr}}b^{${s}}$. Berikan jawapan dengan indeks positif.`), a: T(`$${ansTex}$`), w: W(T('Expand the bracket first: multiply each index by the outer index.', 'Kembangkan kurungan dahulu: darab setiap indeks dengan indeks di luar.'), `$(a^{${p}}b^{${q}})^{${k}} = ${mid}$`, T('Then divide: subtract the indices of the same base.', 'Kemudian bahagi: tolak indeks bagi asas yang sama.'), `$${mid} \\div a^{${rr}}b^{${s}} = a^{${k * p} - ${rr}}b^{${k * q} - ${s}} = ${raw}$`, ...(negs ? [T(`A negative index goes to the denominator: $a^{-m} = \\dfrac{1}{a^{m}}$, giving $${ansTex}$`, `Indeks negatif turun ke penyebut: $a^{-m} = \\dfrac{1}{a^{m}}$, memberi $${ansTex}$`)] : [])), sp: 'm' };
    },
    (r) => {
      const b = r.pick([2, 3, 5]), e = r.int(1, 3);
      return { q: T(`Evaluate $${b}^{-${e}}$ and $${b}^{0}$.`, `Hitung $${b}^{-${e}}$ dan $${b}^{0}$.`), a: T(`$\\dfrac{1}{${Math.pow(b, e)}}$; $1$`), w: W(T(`A negative index means the reciprocal: $a^{-n} = \\dfrac{1}{a^{n}}$.`, `Indeks negatif bermaksud salingan: $a^{-n} = \\dfrac{1}{a^{n}}$.`), `$${b}^{-${e}} = \\dfrac{1}{${pw(b, e)}} = \\dfrac{1}{${Math.pow(b, e)}}$`, T(`Any non-zero number raised to $0$ is $1$, so $${b}^{0} = 1$.`, `Sebarang nombor bukan sifar dikuasakan $0$ ialah $1$, jadi $${b}^{0} = 1$.`)), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 6), e = r.int(2, 3), f = r.int(3, 8);
      return { q: T(`Simplify $(x^{${a}})^{${e}} \\div x^{${a * e + f}}$ and write the answer with a positive index.`, `Ringkaskan $(x^{${a}})^{${e}} \\div x^{${a * e + f}}$ dan tulis jawapan dengan indeks positif.`), a: T(`$x^{-${f}} = \\dfrac{1}{x^{${f}}}$`), w: W(`$(x^{${a}})^{${e}} = x^{${a} \\times ${e}} = x^{${a * e}}$`, `$x^{${a * e}} \\div x^{${a * e + f}} = x^{${a * e} - ${a * e + f}} = x^{-${f}}$`, T(`Write it with a positive index: $x^{-${f}} = \\dfrac{1}{x^{${f}}}$`, `Tulis dengan indeks positif: $x^{-${f}} = \\dfrac{1}{x^{${f}}}$`)), sp: 'm' };
    },
  ];
  const g12a = [
    (r) => {
      const [k, m, nn] = r.pick([[3, 2, 3], [2, 5, 2], [4, 3, 2], [2, 3, 4], [3, 4, 3], [2, 3, 5], [5, 2, 3]]); // all m/nn already in lowest terms
      // k^n = base ; value of base^(m/n)
      const base = Math.pow(k, nn);
      const neg = r.chance();
      const val = Math.pow(k, m);
      const pwr = `${neg ? '-' : ''}\\frac{${m}}{${nn}}`;
      return { q: T(`Evaluate $${base}^{${pwr}}$.`, `Hitung $${base}^{${pwr}}$.`), a: T(neg ? `$\\dfrac{1}{${val}}$` : `$${val}$`), w: W(T(`Write the base as a power of $${k}$: $${base} = ${k}^{${nn}}$`, `Tulis asas sebagai kuasa bagi $${k}$: $${base} = ${k}^{${nn}}$`), `$${base}^{${pwr}} = (${k}^{${nn}})^{${pwr}} = ${k}^{${nn} \\times ${neg ? `\\left(-\\frac{${m}}{${nn}}\\right)` : `\\frac{${m}}{${nn}}`}} = ${k}^{${neg ? '-' : ''}${m}}$`, neg ? T(`A negative index gives the reciprocal: $${k}^{-${m}} = \\dfrac{1}{${pw(k, m)}} = \\dfrac{1}{${val}}$`, `Indeks negatif memberi salingan: $${k}^{-${m}} = \\dfrac{1}{${pw(k, m)}} = \\dfrac{1}{${val}}$`) : `$${pw(k, m)} = ${val}$`), sp: 'm' };
    },
    (r) => {
      const [a, b] = r.pick([[2, 3], [3, 2], [1, 2], [2, 5]]);
      const k = r.pick([[4, 9], [9, 4], [16, 81], [8, 27]]);
      const e = k[0] === 8 ? 1 / 3 : k[0] === 16 ? 1 / 4 : 1 / 2;
      const root = Math.round(Math.pow(k[0], e)), root2 = Math.round(Math.pow(k[1], e));
      const den = e === 1 / 3 ? 3 : e === 1 / 4 ? 4 : 2;
      return { q: T(`Evaluate $\\left(\\dfrac{${k[0]}}{${k[1]}}\\right)^{-\\frac{1}{${den}}}$.`, `Hitung $\\left(\\dfrac{${k[0]}}{${k[1]}}\\right)^{-\\frac{1}{${den}}}$.`), a: T(`$\\dfrac{${root2}}{${root}}$`), w: W(T(`A negative index turns the fraction upside down.`, `Indeks negatif menyongsangkan pecahan itu.`), `$\\left(\\dfrac{${k[0]}}{${k[1]}}\\right)^{-\\frac{1}{${den}}} = \\left(\\dfrac{${k[1]}}{${k[0]}}\\right)^{\\frac{1}{${den}}}$`, T(`An index of $\\dfrac{1}{${den}}$ means the ${den === 2 ? 'square' : den === 3 ? 'cube' : 'fourth'} root of the numerator and of the denominator.`, `Indeks $\\dfrac{1}{${den}}$ bermaksud punca kuasa ${den === 2 ? 'dua' : den === 3 ? 'tiga' : 'empat'} bagi pengangka dan penyebut.`), `$= \\dfrac{\\sqrt[${den}]{${k[1]}}}{\\sqrt[${den}]{${k[0]}}} = \\dfrac{${root2}}{${root}}$`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 4), p = r.int(1, 3), q = r.int(1, 3), k = r.int(2, 3);
      const numCoef = Math.pow(a, k);
      const yTerm = (e) => (e === 1 ? 'y' : `y^{${e}}`);
      return { q: T(`Simplify $(${a}x^{-${p}}${yTerm(q)})^{${k}}$ and write the answer with positive indices.`, `Ringkaskan $(${a}x^{-${p}}${yTerm(q)})^{${k}}$ dan tulis jawapan dengan indeks positif.`), a: T(`$\\dfrac{${numCoef}y^{${q * k}}}{x^{${p * k}}}$`), w: W(T(`Raise every factor inside the bracket to the power $${k}$, multiplying the indices.`, `Kuasakan setiap faktor dalam kurungan dengan kuasa $${k}$, dengan mendarab indeksnya.`), `$(${a}x^{-${p}}${yTerm(q)})^{${k}} = ${pw(a, k)} \\times x^{-${p} \\times ${k}} \\times y^{${q} \\times ${k}} = ${numCoef}x^{-${p * k}}y^{${q * k}}$`, T(`Move the negative index to the denominator: $\\dfrac{${numCoef}y^{${q * k}}}{x^{${p * k}}}$`, `Pindahkan indeks negatif ke penyebut: $\\dfrac{${numCoef}y^{${q * k}}}{x^{${p * k}}}$`)), sp: 'm' };
    },
  ];
  const g13e = [
    (r) => {
      const b = r.pick([2, 3, 5]), e = r.int(2, 5);
      need(Math.pow(b, e) <= 3125);
      return { q: T(`Solve $${b}^x = ${Math.pow(b, e)}$.`, `Selesaikan $${b}^x = ${Math.pow(b, e)}$.`), a: T(`$x = ${e}$`), w: W(T(`Write the right side as a power of $${b}$: $${Math.pow(b, e)} = ${pw(b, e)}$`, `Tulis sebelah kanan sebagai kuasa bagi $${b}$: $${Math.pow(b, e)} = ${pw(b, e)}$`), `$${b}^x = ${pw(b, e)}$`, T(`The bases are equal, so the indices are equal: $x = ${e}$`, `Asas adalah sama, jadi indeksnya sama: $x = ${e}$`)), sp: 's' };
    },
  ];
  const g13m = [
    (r) => {
      const [big, sm, rat] = r.pick([[9, 3, 2], [4, 2, 2], [8, 2, 3], [27, 3, 3], [25, 5, 2], [16, 2, 4]]);
      const e = r.int(2, 5);
      const x = Fr.make(e, rat);
      return { q: T(`Solve $${big}^x = ${Math.pow(sm, e)}$.`, `Selesaikan $${big}^x = ${Math.pow(sm, e)}$.`), a: T(`$x = ${frT(x)}$`), w: W(T(`Write both sides with base $${sm}$: $${big} = ${pw(sm, rat)}$ and $${Math.pow(sm, e)} = ${pw(sm, e)}$`, `Tulis kedua-dua belah dengan asas $${sm}$: $${big} = ${pw(sm, rat)}$ dan $${Math.pow(sm, e)} = ${pw(sm, e)}$`), `$(${pw(sm, rat)})^x = ${pw(sm, e)}$`, `$${sm}^{${rat}x} = ${sm}^{${e}}$`, T(`Equate the indices: $${rat}x = ${e}$, so $x = ${frT(x)}$`, `Samakan indeks: $${rat}x = ${e}$, jadi $x = ${frT(x)}$`)), sp: 'm' };
    },
    (r) => {
      const b = r.pick([2, 3, 5]), p = r.int(2, 5), q = r.int(2, 5);
      return { q: T(`Solve $${b}^x \\times ${b}^{${p}} = ${b}^{${p + q}}$.`, `Selesaikan $${b}^x \\times ${b}^{${p}} = ${b}^{${p + q}}$.`), a: T(`$x = ${q}$`), w: W(T('Same base, multiplication: add the indices.', 'Asas sama, pendaraban: tambah indeks.'), `$${b}^{x + ${p}} = ${b}^{${p + q}}$`, T(`Equate the indices: $x + ${p} = ${p + q}$, so $x = ${q}$`, `Samakan indeks: $x + ${p} = ${p + q}$, jadi $x = ${q}$`)), sp: 's' };
    },
  ];
  const g13a = [
    (r) => {
      // core-compliant "hard": several law steps then a same-base equation, unknown confined to one exponent
      // a = b^k so a^x * b^q = b^r  =>  b^(kx+q) = b^r
      const b = r.pick([2, 3, 5]), k = r.int(2, 3), q = r.int(1, 4), rr = r.int(2, 8);
      const a = Math.pow(b, k);
      const x = Fr.make(rr - q, k);
      return { q: T(`Solve $${a}^x \\times ${b}^{${q}} = ${b}^{${rr}}$.`, `Selesaikan $${a}^x \\times ${b}^{${q}} = ${b}^{${rr}}$.`), a: T(`$x = ${frT(x)}$`), w: W(T(`Write both sides with base $${b}$: $${a} = ${pw(b, k)}$`, `Tulis kedua-dua belah dengan asas $${b}$: $${a} = ${pw(b, k)}$`), `$(${pw(b, k)})^x \\times ${b}^{${q}} = ${b}^{${rr}}$`, `$${b}^{${k}x} \\times ${b}^{${q}} = ${b}^{${k}x + ${q}} = ${b}^{${rr}}$`, T(`Equate the indices: $${k}x + ${q} = ${rr}$, so $x = ${frT(x)}$`, `Samakan indeks: $${k}x + ${q} = ${rr}$, jadi $x = ${frT(x)}$`)), sp: 'l' };
    },
    (r) => {
      const b = r.pick([2, 3]), p = r.int(4, 8), q = r.int(1, 3);
      return { q: T(`Solve $\\dfrac{${b}^{2x}}{${b}^{${q}}} = ${b}^{${p}}$.`, `Selesaikan $\\dfrac{${b}^{2x}}{${b}^{${q}}} = ${b}^{${p}}$.`), a: T(`$x = ${frT(Fr.make(p + q, 2))}$`), w: W(T('Same base, division: subtract the indices.', 'Asas sama, pembahagian: tolak indeks.'), `$${b}^{2x - ${q}} = ${b}^{${p}}$`, T(`Equate the indices: $2x - ${q} = ${p}$`, `Samakan indeks: $2x - ${q} = ${p}$`), `$2x = ${p + q}$, $x = ${frT(Fr.make(p + q, 2))}$`), sp: 'm' };
    },
  ];
  SPM.addChapter(3, 1, T('Indices', 'Indeks'), [
    { id: '1.1', en: 'Index notation', ms: 'Tatatanda indeks', gen: { e: g11e, m: g11m, a: g11a } },
    { id: '1.2', en: 'Law of indices', ms: 'Hukum indeks', gen: { e: g12e, m: g12m, a: g12a } },
    { id: '1.3', en: 'Simple same-base index equations', ms: 'Persamaan indeks asas sama yang mudah', gen: { e: g13e, m: g13m, a: g13a } },
  ]);

  /* =============================================================== 2 */
  /** round x to k significant figures; returns a plain decimal string (no exponent) */
  function toSF(x, k) {
    if (x === 0) return '0';
    const e = Math.floor(Math.log10(Math.abs(x)));
    const dec = k - 1 - e;
    let v;
    if (dec >= 0) v = (Math.round(Math.abs(x) * Math.pow(10, dec) + 1e-9) / Math.pow(10, dec)).toFixed(dec);
    else v = String(Math.round(Math.abs(x) / Math.pow(10, -dec) + 1e-9) * Math.pow(10, -dec));
    return (x < 0 ? '-' : '') + v;
  }
  const fmtBig = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
  /** the two decision lines for "round x to k significant figures": which digit decides, and up or down */
  const sfSteps = (x, k) => {
    const digits = String(Math.abs(Number(x))).replace('.', '').replace(/^0+/, '');
    const nx = digits.charAt(k) || '0';
    return [
      T(`Count $${k}$ significant figure${k > 1 ? 's' : ''} from the first non-zero digit; the next digit is $${nx}$.`, `Kira $${k}$ angka bererti dari digit bukan sifar pertama; digit seterusnya ialah $${nx}$.`),
      +nx >= 5 ? T(`$${nx} \\ge 5$, so round up.`, `$${nx} \\ge 5$, jadi bundarkan ke atas.`) : T(`$${nx} \\lt 5$, so round down.`, `$${nx} \\lt 5$, jadi bundarkan ke bawah.`),
    ];
  };
  const dec = (mant, exp) => {
    // mant like 4.5 and exp integer -> plain decimal string
    const s = String(mant).replace('.', '');
    const pointPos = String(mant).indexOf('.') < 0 ? String(mant).length : String(mant).indexOf('.');
    const np = pointPos + exp;
    if (np <= 0) return '0.' + '0'.repeat(-np) + s;
    if (np >= s.length) return s + '0'.repeat(np - s.length);
    return s.slice(0, np) + '.' + s.slice(np);
  };
  const groupDec = (str) => { const [i, d] = str.split('.'); return fmtBig(i) + (d ? '.' + d : ''); };
  const sci = (a, e) => `${a} \\times 10^{${e}}`;
  const g21e = [
    (r) => {
      const x = r.int(1000, 99999), k = r.int(1, 2);
      return { q: T(`Round $${fmtBig(x)}$ to ${k + 1} significant figures.`, `Bundarkan $${fmtBig(x)}$ kepada ${k + 1} angka bererti.`), a: T(`$${groupDec(toSF(x, k + 1))}$`), w: W(...sfSteps(x, k + 1), T(`The digits dropped become zeros so the place value is unchanged: $${fmtBig(x)} \\approx ${groupDec(toSF(x, k + 1))}$`, `Digit yang digugurkan menjadi sifar supaya nilai tempat tidak berubah: $${fmtBig(x)} \\approx ${groupDec(toSF(x, k + 1))}$`)), sp: 's' };
    },
    (r) => {
      const x = round(r.int(1000, 99999) / 1000, 3), k = r.int(2, 3);
      return { q: T(`Round $${n(x)}$ to ${k} significant figures.`, `Bundarkan $${n(x)}$ kepada ${k} angka bererti.`), a: T(`$${toSF(x, k)}$`), w: W(...sfSteps(x, k), `$${n(x)} \\approx ${toSF(x, k)}$`), sp: 's' };
    },
  ];
  const g21m = [
    (r) => {
      const x = r.pick([0.030457, 0.004683, 0.07152, 0.000915, 0.0208]);
      const k = r.int(2, 3);
      return { q: T(`Round $${x}$ to ${k} significant figures.`, `Bundarkan $${x}$ kepada ${k} angka bererti.`), a: T(`$${toSF(x, k)}$`), w: W(...sfSteps(x, k), T(`The leading zeros are kept to hold the place value: $${x} \\approx ${toSF(x, k)}$`, `Sifar di hadapan dikekalkan untuk mengekalkan nilai tempat: $${x} \\approx ${toSF(x, k)}$`)), sp: 's' };
    },
    (r) => {
      const c = r.pick([['0.00405', 3], ['3.050', 4], ['200.4', 4], ['0.0700', 3], ['1.002', 4], ['0.030', 2]]);
      return { q: T(`State the number of significant figures in $${c[0]}$.`, `Nyatakan bilangan angka bererti dalam $${c[0]}$.`), a: T(`${c[1]}`), w: W(T('Start counting at the first non-zero digit; zeros before it are not significant, but zeros between digits and trailing zeros after a decimal point are.', 'Mula mengira pada digit bukan sifar pertama; sifar sebelumnya tidak bererti, tetapi sifar antara digit dan sifar di belakang selepas titik perpuluhan adalah bererti.'), T(`In $${c[0]}$ that gives $${c[1]}$ significant figures.`, `Dalam $${c[0]}$ itu memberi $${c[1]}$ angka bererti.`)), sp: 'xs' };
    },
  ];
  const g21a = [
    (r) => {
      const c = r.pick([[0.09996, 3, '0.100'], [0.0999951, 4, '0.1000'], [9.996, 3, '10.0'], [19996, 3, '20\\,000'], [0.009996, 2, '0.010']]);
      return { q: T(`Round $${c[0]}$ to ${c[1]} significant figures.`, `Bundarkan $${c[0]}$ kepada ${c[1]} angka bererti.`), a: T(`$${c[2]}$`), w: W(...sfSteps(c[0], c[1]), T('Rounding up carries into the digits in front, and the zeros that follow are kept so the answer still shows the right number of significant figures.', 'Pembundaran ke atas membawa nilai kepada digit di hadapan, dan sifar selepasnya dikekalkan supaya jawapan masih menunjukkan bilangan angka bererti yang betul.'), `$${c[0]} \\approx ${c[2]}$`), sp: 's' };
    },
    (r) => {
      const l = round(r.int(125, 480) / 10, 1), w = round(r.int(32, 95) / 10, 1);
      const A = l * w;
      return { q: T(`A rectangle measures ${n(l)} cm by ${n(w)} cm. Calculate its area and give the answer correct to 3 significant figures.`, `Sebuah segi empat tepat berukuran ${n(l)} cm kali ${n(w)} cm. Hitung luasnya dan berikan jawapan betul kepada 3 angka bererti.`), a: T(`$${toSF(A, 3)}\\ \\text{cm}^2$`), w: W(T('Area $=$ length $\\times$ width; keep the exact value and round once, at the end.', 'Luas $=$ panjang $\\times$ lebar; kekalkan nilai tepat dan bundarkan sekali sahaja, pada akhir.'), `$${n(l)} \\times ${n(w)} = ${n(round(A, 4))}\\ \\text{cm}^2$`, ...sfSteps(round(A, 4), 3), `$${n(round(A, 4))} \\approx ${toSF(A, 3)}\\ \\text{cm}^2$`), sp: 's' };
    },
  ];
  const g22e = [
    (r) => {
      const a = r.pick([1.2, 2.5, 3.6, 4.5, 5.8, 7.1, 8.4, 9.3]), e = r.int(4, 9);
      const toStd = r.chance();
      const plain = groupDec(dec(a, e));
      return toStd
        ? { q: T(`Express $${plain}$ in standard form.`, `Ungkapkan $${plain}$ dalam bentuk piawai.`), a: T(`$${sci(a, e)}$`), w: W(T(`Put the decimal point just after the first non-zero digit: $A = ${a}$.`, `Letakkan titik perpuluhan tepat selepas digit bukan sifar pertama: $A = ${a}$.`), T(`The point has moved $${e}$ places to the left, so $n = ${e}$.`, `Titik itu telah berpindah $${e}$ tempat ke kiri, jadi $n = ${e}$.`), `$${plain} = ${sci(a, e)}$`), sp: 's' }
        : { q: T(`Write $${sci(a, e)}$ as an ordinary number.`, `Tulis $${sci(a, e)}$ sebagai nombor biasa.`), a: T(`$${plain}$`), w: W(T(`A positive index $${e}$ moves the decimal point $${e}$ places to the right, filling with zeros.`, `Indeks positif $${e}$ memindahkan titik perpuluhan $${e}$ tempat ke kanan, diisi dengan sifar.`), `$${sci(a, e)} = ${plain}$`), sp: 's' };
    },
  ];
  const g22m = [
    (r) => {
      const a = r.pick([1.5, 2.4, 3.2, 4.7, 6.5, 8.1]), e = r.int(3, 6);
      const toStd = r.chance();
      return toStd
        ? { q: T(`Express $${dec(a, -e)}$ in standard form.`, `Ungkapkan $${dec(a, -e)}$ dalam bentuk piawai.`), a: T(`$${sci(a, -e)}$`), w: W(T(`Put the decimal point just after the first non-zero digit: $A = ${a}$.`, `Letakkan titik perpuluhan tepat selepas digit bukan sifar pertama: $A = ${a}$.`), T(`The point has moved $${e}$ places to the right, so $n = -${e}$.`, `Titik itu telah berpindah $${e}$ tempat ke kanan, jadi $n = -${e}$.`), `$${dec(a, -e)} = ${sci(a, -e)}$`), sp: 's' }
        : { q: T(`Write $${sci(a, -e)}$ as an ordinary number.`, `Tulis $${sci(a, -e)}$ sebagai nombor biasa.`), a: T(`$${dec(a, -e)}$`), w: W(T(`A negative index $-${e}$ moves the decimal point $${e}$ places to the left, filling with zeros.`, `Indeks negatif $-${e}$ memindahkan titik perpuluhan $${e}$ tempat ke kiri, diisi dengan sifar.`), `$${sci(a, -e)} = ${dec(a, -e)}$`), sp: 's' };
    },
    (r) => {
      const a = r.pick([2, 3, 4, 5, 6]), b = r.pick([1.5, 2, 2.5, 3]), e1 = r.int(2, 8), e2 = r.int(2, 8);
      const mul = r.chance();
      const v = mul ? a * b : a / b;
      let m = v, e = mul ? e1 + e2 : e1 - e2;
      while (m >= 10) { m /= 10; e++; }
      while (m < 1) { m *= 10; e--; }
      return { q: T(`Calculate $(${sci(a, e1)}) ${mul ? '\\times' : '\\div'} (${sci(b, e2)})$ and give the answer in standard form.`, `Hitung $(${sci(a, e1)}) ${mul ? '\\times' : '\\div'} (${sci(b, e2)})$ dan berikan jawapan dalam bentuk piawai.`), a: T(`$${sci(n(round(m, 3)), e)}$`), w: W(mul ? T('Multiply the number parts and add the indices.', 'Darab bahagian nombor dan tambah indeks.') : T('Divide the number parts and subtract the indices.', 'Bahagi bahagian nombor dan tolak indeks.'), `$(${a} ${mul ? '\\times' : '\\div'} ${b}) \\times 10^{${e1} ${mul ? '+' : '-'} ${e2}} = ${n(round(v, 3))} \\times 10^{${mul ? e1 + e2 : e1 - e2}}$`, n(round(m, 3)) === n(round(v, 3)) && e === (mul ? e1 + e2 : e1 - e2) ? T(`$A = ${n(round(m, 3))}$ is already between $1$ and $10$.`, `$A = ${n(round(m, 3))}$ sudah berada antara $1$ dan $10$.`) : T(`Renormalise so that $1 \\le A \\lt 10$: $${sci(n(round(m, 3)), e)}$`, `Normalkan semula supaya $1 \\le A \\lt 10$: $${sci(n(round(m, 3)), e)}$`)), sp: 'm' };
    },
    (r) => {
      const c = r.pick([['nano', 'nano', -9], ['tera', 'tera', 12], ['giga', 'giga', 9], ['mega', 'mega', 6], ['micro', 'mikro', -6]]);
      const a = r.pick([2.5, 4, 5.6, 7.2]);
      return { q: T(`${n(a)} ${c[0]}metres is written in metres in standard form. Find the value in metres (the prefix ${c[0]} means $10^{${c[2]}}$).`, `${n(a)} ${c[1]}meter ditulis dalam meter dalam bentuk piawai. Cari nilainya dalam meter (imbuhan ${c[1]} bermaksud $10^{${c[2]}}$).`), a: T(`$${sci(n(a), c[2])}$ m`), w: W(T(`The prefix ${c[0]} means $10^{${c[2]}}$, so multiply the number of ${c[0]}metres by $10^{${c[2]}}$.`, `Imbuhan ${c[1]} bermaksud $10^{${c[2]}}$, jadi darab bilangan ${c[1]}meter dengan $10^{${c[2]}}$.`), `$${n(a)} \\times 10^{${c[2]}}$ m`, T(`$A = ${n(a)}$ lies between $1$ and $10$, so this is already in standard form.`, `$A = ${n(a)}$ terletak antara $1$ dan $10$, jadi ini sudah dalam bentuk piawai.`)), sp: 's' };
    },
  ];
  const g22a = [
    (r) => {
      const a = r.int(2, 8), b = r.int(2, 8), e = r.int(4, 7);
      // a x 10^e + b x 10^(e-1)
      let m = (a * 10 + b) / 10, ee = e;
      while (m >= 10) { m /= 10; ee++; }
      return { q: T(`Calculate $${sci(a, e)} + ${sci(b, e - 1)}$ and express the answer in standard form.`, `Hitung $${sci(a, e)} + ${sci(b, e - 1)}$ dan ungkapkan jawapan dalam bentuk piawai.`), a: T(`$${sci(n(round(m, 3)), ee)}$`), w: W(T('Write both terms with the same power of $10$ before adding.', 'Tulis kedua-dua sebutan dengan kuasa $10$ yang sama sebelum menambah.'), `$${sci(b, e - 1)} = ${sci(n(b / 10), e)}$`, `$(${a} + ${n(b / 10)}) \\times 10^{${e}} = ${n(round((a * 10 + b) / 10, 3))} \\times 10^{${e}}$`, `$= ${sci(n(round(m, 3)), ee)}$`), sp: 'm' };
    },
    (r) => {
      const a = r.pick([6, 7, 8, 9]), b = r.pick([2, 3, 4]), e = r.int(5, 9);
      const m = a - b / 10;
      return { q: T(`Calculate $${sci(a, e)} - ${sci(b, e - 1)}$ and express the answer in standard form.`, `Hitung $${sci(a, e)} - ${sci(b, e - 1)}$ dan ungkapkan jawapan dalam bentuk piawai.`), a: T(`$${sci(n(round(m, 3)), e)}$`), w: W(T('Write both terms with the same power of $10$ before subtracting.', 'Tulis kedua-dua sebutan dengan kuasa $10$ yang sama sebelum menolak.'), `$${sci(b, e - 1)} = ${sci(n(b / 10), e)}$`, `$(${a} - ${n(b / 10)}) \\times 10^{${e}} = ${sci(n(round(m, 3)), e)}$`), sp: 'm' };
    },
    (r) => {
      const tt = r.pick([2, 4, 5, 8]), e2 = r.int(2, 4);
      let m = 3 * tt, ee = 8 + e2;
      while (m >= 10) { m /= 10; ee++; }
      return { q: T(`Light travels at $3 \\times 10^{8}$ m/s. How far does it travel in $${sci(tt, e2)}$ seconds? Give the answer in standard form.`, `Cahaya bergerak pada $3 \\times 10^{8}$ m/s. Berapa jauhkah ia bergerak dalam $${sci(tt, e2)}$ saat? Berikan jawapan dalam bentuk piawai.`), a: T(`$${sci(n(round(m, 3)), ee)}$ m`), w: W(T('Distance $=$ speed $\\times$ time.', 'Jarak $=$ laju $\\times$ masa.'), `$(3 \\times 10^{8}) \\times (${sci(tt, e2)}) = (3 \\times ${tt}) \\times 10^{8 + ${e2}} = ${3 * tt} \\times 10^{${8 + e2}}$`, `$= ${sci(n(round(m, 3)), ee)}$ m`), sp: 'm' };
    },
  ];
  SPM.addChapter(3, 2, T('Standard Form', 'Bentuk Piawai'), [
    { id: '2.1', en: 'Significant figures', ms: 'Angka bererti', gen: { e: g21e, m: g21m, a: g21a } },
    { id: '2.2', en: 'Standard form', ms: 'Bentuk piawai', gen: { e: g22e, m: g22m, a: g22a } },
  ]);

  /* =============================================================== 3 */
  const NEEDS = [
    [T('to have access to money at any time using a cheque book or debit card for daily payments', 'mengakses wang pada bila-bila masa menggunakan buku cek atau kad debit untuk pembayaran harian'), T('current account', 'akaun semasa')],
    [T('to save a lump sum for 12 months with a higher fixed interest rate and no withdrawal until maturity', 'menyimpan jumlah wang sekali gus selama 12 bulan dengan kadar faedah tetap yang lebih tinggi dan tanpa pengeluaran sehingga matang'), T('fixed deposit', 'simpanan tetap')],
    [T('to put aside pocket money regularly, with flexible withdrawal and a modest interest rate', 'menyimpan wang saku secara berkala, dengan pengeluaran yang fleksibel dan kadar faedah yang sederhana'), T('savings account', 'akaun simpanan')],
  ];
  /** why a given account type fits a customer's need (keyed by the English product name in NEEDS) */
  const ACC_WHY = {
    'current account': T('A current account is built for frequent transactions such as cheques and daily payments, not for earning interest.', 'Akaun semasa dibina untuk transaksi kerap seperti cek dan pembayaran harian, bukan untuk mendapat faedah.'),
    'fixed deposit': T('A fixed deposit locks the money away until maturity and pays a higher fixed rate in return.', 'Simpanan tetap mengunci wang sehingga matang dan membayar kadar tetap yang lebih tinggi sebagai balasan.'),
    'savings account': T('A savings account takes small regular deposits, allows withdrawal at any time, and still earns some interest.', 'Akaun simpanan menerima simpanan kecil secara berkala, membenarkan pengeluaran pada bila-bila masa, dan masih memperoleh sedikit faedah.'),
  };
  const g31e = [
    (r) => {
      const c = r.pick(NEEDS);
      return { q: T(`Which is the most suitable account for a customer who wants ${c[0].en}: a savings account, a fixed deposit or a current account?`, `Akaun manakah yang paling sesuai bagi pelanggan yang mahu ${c[0].ms}: akaun simpanan, simpanan tetap atau akaun semasa?`), a: c[1], w: W(ACC_WHY[c[1].en], T(`That matches a customer who wants ${c[0].en}.`, `Itu menepati pelanggan yang mahu ${c[0].ms}.`)), sp: 's' };
    },
    (r) => {
      const P = r.pick([1000, 2000, 3000, 5000]), rate = r.pick([2, 3, 4, 5]), t = r.int(2, 5);
      return { q: T(`Find the simple interest on ${rm(P)} at ${rate}% per annum for ${t} years.`, `Cari faedah mudah bagi ${rm(P)} pada kadar ${rate}% setahun selama ${t} tahun.`), a: T(`${rm((P * rate * t) / 100)}`), w: W(T('Simple interest: $I = Prt$, with the rate as a decimal and the time in years.', 'Faedah mudah: $I = Prt$, dengan kadar sebagai perpuluhan dan masa dalam tahun.'), `$I = ${P} \\times \\dfrac{${rate}}{100} \\times ${t} = ${n((P * rate * t) / 100)}$`, T(`The interest is ${rm((P * rate * t) / 100)}.`, `Faedahnya ialah ${rm((P * rate * t) / 100)}.`)), sp: 's' };
    },
  ];
  const compound = (P, r, k, t) => P * Math.pow(1 + r / 100 / k, k * t);
  const g31m = [
    (r) => {
      const P = r.pick([2000, 5000, 8000]), rate = r.pick([3, 4, 5]), t = r.int(2, 3);
      const MV = compound(P, rate, 1, t);
      return { q: T(`${rm(P)} is deposited for ${t} years at ${rate}% per annum compounded yearly. Find the maturity value.`, `${rm(P)} didepositkan selama ${t} tahun pada kadar ${rate}% setahun dikompaun setiap tahun. Cari nilai matang.`), a: T(`${rm(round(MV, 2), 2)}`), w: W(T('Yearly compounding: $MV = P\\left(1 + \\dfrac{r}{100}\\right)^{t}$.', 'Kompaun tahunan: $MV = P\\left(1 + \\dfrac{r}{100}\\right)^{t}$.'), `$MV = ${P}\\left(1 + \\dfrac{${rate}}{100}\\right)^{${t}} = ${P} \\times ${n(round(Math.pow(1 + rate / 100, t), 6))} = ${n(round(MV, 2))}$`, T(`The maturity value is ${rm(round(MV, 2), 2)}.`, `Nilai matangnya ialah ${rm(round(MV, 2), 2)}.`)), sp: 'm' };
    },
    (r) => {
      const inv = r.pick([2000, 5000, 10000]), gain = r.pick([0.06, 0.08, 0.12, 0.15]);
      return { q: T(`A trader buys shares for ${rm(inv)} and sells them later for ${rm(inv * (1 + gain))}. Calculate the return on investment (ROI) as a percentage.`, `Seorang peniaga membeli saham dengan harga ${rm(inv)} dan menjualnya kemudian dengan harga ${rm(inv * (1 + gain))}. Hitung pulangan pelaburan (ROI) sebagai peratusan.`), a: T(`$${n(round(gain * 100, 2))}\\%$`), w: W(T(`Profit $=$ selling price $-$ cost $= ${n(round(inv * gain, 2))}$`, `Untung $=$ harga jualan $-$ kos $= ${n(round(inv * gain, 2))}$`), T('$ROI = \\dfrac{\\text{profit}}{\\text{investment}} \\times 100\\%$', '$ROI = \\dfrac{\\text{untung}}{\\text{pelaburan}} \\times 100\\%$'), `$ROI = \\dfrac{${n(round(inv * gain, 2))}}{${inv}} \\times 100\\% = ${n(round(gain * 100, 2))}\\%$`), sp: 's' };
    },
  ];
  const g31a = [
    (r) => {
      const P = r.pick([2000, 4000, 6000]), rate = r.pick([4, 5, 6]), t = r.int(2, 3);
      const MV = compound(P, rate, 2, t);
      return { q: T(`${rm(P)} is invested at ${rate}% per annum compounded half-yearly for ${t} years. Find the maturity value.`, `${rm(P)} dilaburkan pada kadar ${rate}% setahun dikompaun setiap setengah tahun selama ${t} tahun. Cari nilai matang.`), a: T(`${rm(round(MV, 2), 2)}`), w: W(T('$MV = P\\left(1 + \\dfrac{r}{n}\\right)^{nt}$; half-yearly means $n = 2$.', '$MV = P\\left(1 + \\dfrac{r}{n}\\right)^{nt}$; setengah tahun sekali bermaksud $n = 2$.'), T(`Rate per period $= \\dfrac{${rate}}{2}\\% = ${n(rate / 2)}\\%$; number of periods $= 2 \\times ${t} = ${2 * t}$.`, `Kadar setiap tempoh $= \\dfrac{${rate}}{2}\\% = ${n(rate / 2)}\\%$; bilangan tempoh $= 2 \\times ${t} = ${2 * t}$.`), `$MV = ${P}\\left(1 + \\dfrac{${rate}}{200}\\right)^{${2 * t}} = ${P} \\times ${n(round(Math.pow(1 + rate / 200, 2 * t), 6))} = ${n(round(MV, 2))}$`, T(`The maturity value is ${rm(round(MV, 2), 2)}.`, `Nilai matangnya ialah ${rm(round(MV, 2), 2)}.`)), sp: 'm' };
    },
    (r) => {
      const P = r.pick([3000, 5000, 8000]), rate = r.pick([3, 4, 5]), t = r.int(2, 3);
      const MV = compound(P, rate, 1, t);
      return { q: T(`After ${t} years, an account paying ${rate}% per annum compounded yearly has a balance of ${rm(round(MV, 2), 2)}. Find the original deposit.`, `Selepas ${t} tahun, sebuah akaun yang membayar ${rate}% setahun dikompaun setiap tahun mempunyai baki ${rm(round(MV, 2), 2)}. Cari deposit asal.`), a: T(`${rm(P)}`), w: W(T('$MV = P\\left(1 + \\dfrac{r}{100}\\right)^{t}$, so work backwards by dividing.', '$MV = P\\left(1 + \\dfrac{r}{100}\\right)^{t}$, jadi kerja ke belakang dengan membahagi.'), `$P = \\dfrac{${n(round(MV, 2))}}{\\left(1 + \\dfrac{${rate}}{100}\\right)^{${t}}} = \\dfrac{${n(round(MV, 2))}}{${n(round(Math.pow(1 + rate / 100, t), 6))}}$`, T(`$P = ${n(P)}$, that is ${rm(P)}.`, `$P = ${n(P)}$, iaitu ${rm(P)}.`)), sp: 'm' };
    },
  ];
  const g32e = [
    (r) => {
      const P = r.pick([2000, 5000, 8000]), rate = r.pick([4, 5, 6]), t = r.int(2, 4);
      const tot = P + (P * rate * t) / 100;
      return { q: T(`Aiman takes a personal loan of ${rm(P)} at a flat interest rate of ${rate}% per annum for ${t} years. Find (a) the total interest, (b) the total repayment, (c) the monthly instalment.`, `Aiman mengambil pinjaman peribadi ${rm(P)} pada kadar faedah rata ${rate}% setahun selama ${t} tahun. Cari (a) jumlah faedah, (b) jumlah bayaran balik, (c) ansuran bulanan.`), a: T(`(a) ${rm((P * rate * t) / 100)} (b) ${rm(tot)} (c) ${rm(round(tot / (12 * t), 2), 2)}`), w: W(T(`(a) Flat interest: $I = Prt = ${P} \\times \\dfrac{${rate}}{100} \\times ${t} = ${n((P * rate * t) / 100)}$`, `(a) Faedah rata: $I = Prt = ${P} \\times \\dfrac{${rate}}{100} \\times ${t} = ${n((P * rate * t) / 100)}$`), T(`(b) Total repayment $= P + I = ${P} + ${n((P * rate * t) / 100)} = ${n(tot)}$`, `(b) Jumlah bayaran balik $= P + I = ${P} + ${n((P * rate * t) / 100)} = ${n(tot)}$`), T(`(c) Number of instalments $= 12 \\times ${t} = ${12 * t}$`, `(c) Bilangan ansuran $= 12 \\times ${t} = ${12 * t}$`), `$${n(tot)} \\div ${12 * t} = ${n(round(tot / (12 * t), 2))}$`, T(`The monthly instalment is ${rm(round(tot / (12 * t), 2), 2)}.`, `Ansuran bulanannya ialah ${rm(round(tot / (12 * t), 2), 2)}.`)), sp: 'm' };
    },
  ];
  const g32m = [
    (r) => {
      const cash = r.pick([2400, 3600, 4800]), dep = cash * 0.1, mo = r.pick([24, 36]);
      const inst = round((cash * 1.12 - dep) / mo, 2);
      return { q: T(`A television costs ${rm(cash)} in cash. On hire purchase, the deposit is ${rm(dep)} and the balance is repaid in ${mo} monthly instalments of ${rm(inst, 2)}. Find the total hire-purchase price and how much more than the cash price it is.`, `Sebuah televisyen berharga ${rm(cash)} tunai. Secara sewa beli, depositnya ${rm(dep)} dan bakinya dibayar dalam ${mo} ansuran bulanan sebanyak ${rm(inst, 2)}. Cari jumlah harga sewa beli dan berapa lebih daripada harga tunai.`), a: T(`${rm(round(dep + inst * mo, 2), 2)}; ${rm(round(dep + inst * mo - cash, 2), 2)} more`, `${rm(round(dep + inst * mo, 2), 2)}; lebih ${rm(round(dep + inst * mo - cash, 2), 2)}`), w: W(T('Hire-purchase price $=$ deposit $+$ all the instalments.', 'Harga sewa beli $=$ deposit $+$ semua ansuran.'), `$${n(inst)} \\times ${mo} = ${n(round(inst * mo, 2))}$`, `$${n(dep)} + ${n(round(inst * mo, 2))} = ${n(round(dep + inst * mo, 2))}$`, T(`Compared with the cash price: $${n(round(dep + inst * mo, 2))} - ${cash} = ${n(round(dep + inst * mo - cash, 2))}$, so it costs ${rm(round(dep + inst * mo - cash, 2), 2)} more — that extra is the interest.`, `Berbanding harga tunai: $${n(round(dep + inst * mo, 2))} - ${cash} = ${n(round(dep + inst * mo - cash, 2))}$, jadi ia lebih mahal ${rm(round(dep + inst * mo - cash, 2), 2)} — lebihan itu ialah faedah.`)), sp: 'm' };
    },
    (r) => {
      const bal = r.pick([800, 1200, 1500]), rate = r.pick([15, 18]);
      return { q: T(`A credit card has an outstanding balance of ${rm(bal)}. Interest is charged at ${rate}% per annum on the balance for one month. Find the interest charged for the month.`, `Sebuah kad kredit mempunyai baki tertunggak ${rm(bal)}. Faedah dikenakan pada kadar ${rate}% setahun ke atas baki selama sebulan. Cari faedah yang dikenakan untuk sebulan itu.`), a: T(`${rm(round((bal * rate) / 1200, 2), 2)}`), w: W(T('The rate is per year, so one month is $t = \\dfrac{1}{12}$ of a year.', 'Kadar itu setahun, jadi sebulan ialah $t = \\dfrac{1}{12}$ tahun.'), `$I = ${bal} \\times \\dfrac{${rate}}{100} \\times \\dfrac{1}{12} = ${n(round((bal * rate) / 1200, 2))}$`, T(`The interest for the month is ${rm(round((bal * rate) / 1200, 2), 2)}.`, `Faedah untuk bulan itu ialah ${rm(round((bal * rate) / 1200, 2), 2)}.`)), sp: 's' };
    },
  ];
  const g32a = [
    (r) => {
      const bal = r.pick([1000, 1500, 2000]), pay = r.pick([200, 300]), rate = r.pick([15, 18]), late = 10;
      const after = bal - pay;
      const interest = round((after * rate) / 1200, 2);
      return { q: T(`A credit-card statement shows a balance of ${rm(bal)}. The cardholder pays ${rm(pay)} on time. Interest of ${rate}% per annum is charged for one month on the remaining balance. Find the balance at the next statement (no new purchases).`, `Penyata kad kredit menunjukkan baki ${rm(bal)}. Pemegang kad membayar ${rm(pay)} tepat pada masanya. Faedah ${rate}% setahun dikenakan selama sebulan ke atas baki yang tinggal. Cari baki pada penyata seterusnya (tiada pembelian baharu).`), a: T(`${rm(round(after + interest, 2), 2)}`), w: W(T('The payment reduces the balance first, then interest is charged on what is left.', 'Bayaran mengurangkan baki dahulu, kemudian faedah dikenakan ke atas baki yang tinggal.'), `$${bal} - ${pay} = ${n(after)}$`, `$I = ${n(after)} \\times \\dfrac{${rate}}{100} \\times \\dfrac{1}{12} = ${n(interest)}$`, `$${n(after)} + ${n(interest)} = ${n(round(after + interest, 2))}$`, T(`The next statement shows ${rm(round(after + interest, 2), 2)}.`, `Penyata seterusnya menunjukkan ${rm(round(after + interest, 2), 2)}.`)), sp: 'm' };
    },
    (r) => {
      const P = r.pick([10000, 15000, 20000]), rate = r.pick([4, 5]), t = r.pick([3, 5]);
      const tot = P * (1 + (rate * t) / 100);
      const mo = round(tot / (12 * t), 2);
      const paid = r.pick([12, 18, 24]);
      return { q: T(`A loan of ${rm(P)} has a flat interest rate of ${rate}% per annum for ${t} years. After ${paid} instalments, how much is still owed?`, `Sebuah pinjaman ${rm(P)} mempunyai kadar faedah rata ${rate}% setahun selama ${t} tahun. Selepas ${paid} ansuran, berapakah baki yang masih terhutang?`), a: T(`${rm(round(tot - mo * paid, 2), 2)}`), w: W(T(`Total repayment $= P + Prt = ${P}\\left(1 + \\dfrac{${rate} \\times ${t}}{100}\\right) = ${n(round(tot, 2))}$`, `Jumlah bayaran balik $= P + Prt = ${P}\\left(1 + \\dfrac{${rate} \\times ${t}}{100}\\right) = ${n(round(tot, 2))}$`), `$\\text{instalment} = ${n(round(tot, 2))} \\div ${12 * t} = ${n(mo)}$`, `$${paid} \\times ${n(mo)} = ${n(round(mo * paid, 2))}$`, T(`Still owed $= ${n(round(tot, 2))} - ${n(round(mo * paid, 2))} = ${n(round(tot - mo * paid, 2))}$, that is ${rm(round(tot - mo * paid, 2), 2)}.`, `Baki terhutang $= ${n(round(tot, 2))} - ${n(round(mo * paid, 2))} = ${n(round(tot - mo * paid, 2))}$, iaitu ${rm(round(tot - mo * paid, 2), 2)}.`)), sp: 'm' };
    },
  ];
  SPM.addChapter(3, 3, T('Consumer Mathematics: Savings and Investments, Credit and Debt', 'Matematik Pengguna: Simpanan dan Pelaburan, Kredit dan Hutang'), [
    { id: '3.1', en: 'Savings and investments', ms: 'Simpanan dan pelaburan', gen: { e: g31e, m: g31m, a: g31a } },
    { id: '3.2', en: 'Credit and debt management', ms: 'Pengurusan kredit dan hutang', gen: { e: g32e, m: g32m, a: g32a } },
  ]);

  /* =============================================================== 4 */
  const g41e = [
    (r) => {
      const k = r.pick([50, 100, 200, 500]), d = r.int(2, 9);
      return { q: T(`A plan is drawn to a scale of 1 : ${k}. A wall measures ${d} cm on the plan. Find its actual length in cm.`, `Sebuah pelan dilukis dengan skala 1 : ${k}. Sebuah dinding berukuran ${d} cm pada pelan. Cari panjang sebenar dalam cm.`), a: T(`${d * k} cm`), w: W(T(`A scale of $1 : ${k}$ means every $1$ cm on the plan stands for $${k}$ cm in real life.`, `Skala $1 : ${k}$ bermaksud setiap $1$ cm pada pelan mewakili $${k}$ cm dalam keadaan sebenar.`), T(`Actual length $= ${d} \\times ${k} = ${d * k}$ cm`, `Panjang sebenar $= ${d} \\times ${k} = ${d * k}$ cm`)), sp: 's' };
    },
    (r) => {
      const k = r.pick([100, 200, 500]), a = r.int(2, 9) * k;
      return { q: T(`The actual length of a room is ${a} cm. Find its length on a plan of scale 1 : ${k}.`, `Panjang sebenar sebuah bilik ialah ${a} cm. Cari panjangnya pada pelan berskala 1 : ${k}.`), a: T(`${a / k} cm`), w: W(T(`A scale of $1 : ${k}$ means the plan length is the actual length divided by $${k}$.`, `Skala $1 : ${k}$ bermaksud panjang pada pelan ialah panjang sebenar dibahagi dengan $${k}$.`), T(`Plan length $= ${a} \\div ${k} = ${a / k}$ cm`, `Panjang pada pelan $= ${a} \\div ${k} = ${a / k}$ cm`)), sp: 's' };
    },
  ];
  const g41m = [
    (r) => {
      const km = r.pick([2, 5, 10]), d = r.pick([4.5, 3.5, 6, 2.5]);
      return { q: T(`On a map, 1 cm represents ${km} km. Two towns are ${n(d)} cm apart on the map. Find the actual distance in km.`, `Pada sebuah peta, 1 cm mewakili ${km} km. Dua buah bandar berjarak ${n(d)} cm pada peta. Cari jarak sebenar dalam km.`), a: T(`${n(d * km)} km`), w: W(T(`Each $1$ cm on the map stands for $${km}$ km, so multiply the map distance by $${km}$.`, `Setiap $1$ cm pada peta mewakili $${km}$ km, jadi darab jarak pada peta dengan $${km}$.`), T(`Actual distance $= ${n(d)} \\times ${km} = ${n(d * km)}$ km`, `Jarak sebenar $= ${n(d)} \\times ${km} = ${n(d * km)}$ km`)), sp: 's' };
    },
    (r) => {
      const d = r.int(2, 8), k = r.pick([50, 100, 200, 500]);
      const actualM = (d * k) / 100;
      return { q: T(`A drawing of a building is ${d} cm long and the real building is ${n(actualM)} m long. Find the scale in the form 1 : $n$.`, `Sebuah lukisan bangunan panjangnya ${d} cm dan bangunan sebenar panjangnya ${n(actualM)} m. Cari skala dalam bentuk 1 : $n$.`), a: T(`1 : ${k}`), w: W(T('Both lengths must be in the same unit, so change the real length to cm.', 'Kedua-dua panjang mesti dalam unit yang sama, jadi tukarkan panjang sebenar kepada cm.'), T(`$${n(actualM)}$ m $= ${n(actualM)} \\times 100 = ${d * k}$ cm`, `$${n(actualM)}$ m $= ${n(actualM)} \\times 100 = ${d * k}$ cm`), T(`Scale $=$ drawing : actual $= ${d} : ${d * k} = 1 : ${k}$`, `Skala $=$ lukisan : sebenar $= ${d} : ${d * k} = 1 : ${k}$`)), sp: 's' };
    },
  ];
  const g41a = [
    (r) => {
      const k = r.pick([100000, 200000, 250000]), d = r.int(4, 12), sp = r.pick([60, 80, 40]);
      const km = (d * k) / 100000;
      return { q: T(`On a map of scale 1 : ${k}, the distance between two towns is ${d} cm. A bus travels between them at an average speed of ${sp} km/h. Find (a) the actual distance in km, (b) the time taken in minutes.`, `Pada peta berskala 1 : ${k}, jarak antara dua buah bandar ialah ${d} cm. Sebuah bas bergerak antara kedua-duanya pada purata laju ${sp} km/j. Cari (a) jarak sebenar dalam km, (b) masa yang diambil dalam minit.`), a: T(`(a) ${n(km)} km (b) ${n(round((km / sp) * 60, 1))} minutes`, `(a) ${n(km)} km (b) ${n(round((km / sp) * 60, 1))} minit`), w: W(T(`(a) Actual distance $= ${d} \\times ${SPM.gm(k)} = ${SPM.gm(d * k)}$ cm`, `(a) Jarak sebenar $= ${d} \\times ${SPM.gm(k)} = ${SPM.gm(d * k)}$ cm`), T(`$1$ km $= 100\\,000$ cm, so the distance is $${SPM.gm(d * k)} \\div 100\\,000 = ${n(km)}$ km.`, `$1$ km $= 100\\,000$ cm, jadi jaraknya ialah $${SPM.gm(d * k)} \\div 100\\,000 = ${n(km)}$ km.`), T('(b) Time $=$ distance $\\div$ speed.', '(b) Masa $=$ jarak $\\div$ laju.'), T(`$\\dfrac{${n(km)}}{${sp}} = ${n(round(km / sp, 4))}$ hours $= ${n(round(km / sp, 4))} \\times 60 = ${n(round((km / sp) * 60, 1))}$ minutes`, `$\\dfrac{${n(km)}}{${sp}} = ${n(round(km / sp, 4))}$ jam $= ${n(round(km / sp, 4))} \\times 60 = ${n(round((km / sp) * 60, 1))}$ minit`)), sp: 'm' };
    },
    (r) => {
      const k = r.pick([50, 100, 200]), l = r.int(4, 9), w = r.int(3, l - 1);
      const price = r.pick([15, 20, 30]);
      const A = (l * k / 100) * (w * k / 100);
      return { q: T(`A plan of a rectangular room with scale 1 : ${k} measures ${l} cm by ${w} cm. Find the actual area in m² and the cost of tiling it at RM${price} per m².`, `Pelan sebuah bilik segi empat tepat dengan skala 1 : ${k} berukuran ${l} cm kali ${w} cm. Cari luas sebenar dalam m² dan kos memasang jubin pada harga RM${price} per m².`), a: T(`${n(A)} m²; RM${n(A * price)}`), w: W(T(`Actual length $= ${l} \\times ${k} = ${l * k}$ cm $= ${n((l * k) / 100)}$ m; actual width $= ${w} \\times ${k} = ${w * k}$ cm $= ${n((w * k) / 100)}$ m`, `Panjang sebenar $= ${l} \\times ${k} = ${l * k}$ cm $= ${n((l * k) / 100)}$ m; lebar sebenar $= ${w} \\times ${k} = ${w * k}$ cm $= ${n((w * k) / 100)}$ m`), T(`Area $= ${n((l * k) / 100)} \\times ${n((w * k) / 100)} = ${n(A)}$ m²`, `Luas $= ${n((l * k) / 100)} \\times ${n((w * k) / 100)} = ${n(A)}$ m²`), T(`Cost $= ${n(A)} \\times ${price} = ${n(A * price)}$, that is RM${n(A * price)}.`, `Kos $= ${n(A)} \\times ${price} = ${n(A * price)}$, iaitu RM${n(A * price)}.`)), sp: 'm' };
    },
  ];
  const g42e = [
    (r) => {
      const k = r.pick([2, 3, 4, 5]), A = r.int(2, 12);
      return { q: T(`Two similar figures have lengths in the ratio 1 : ${k}. The smaller has area ${A} cm². Find the area of the larger figure.`, `Dua rajah serupa mempunyai panjang dalam nisbah 1 : ${k}. Rajah yang lebih kecil mempunyai luas ${A} cm². Cari luas rajah yang lebih besar.`), a: T(`${A * k * k} cm²`), w: W(T('Area is a product of two lengths, so the area ratio is the square of the length ratio.', 'Luas ialah hasil darab dua panjang, jadi nisbah luas ialah kuasa dua nisbah panjang.'), T(`Area ratio $= 1^2 : ${k}^2 = 1 : ${k * k}$`, `Nisbah luas $= 1^2 : ${k}^2 = 1 : ${k * k}$`), T(`Larger area $= ${A} \\times ${k * k} = ${A * k * k}$ cm²`, `Luas yang lebih besar $= ${A} \\times ${k * k} = ${A * k * k}$ cm²`)), sp: 's' };
    },
  ];
  const g42m = [
    (r) => {
      const k = r.pick([100, 200, 500]), A = r.int(4, 25);
      return { q: T(`On a plan with scale 1 : ${k}, a garden has an area of ${A} cm². Find the actual area in m².`, `Pada pelan berskala 1 : ${k}, sebuah taman mempunyai luas ${A} cm². Cari luas sebenar dalam m².`), a: T(`${n((A * k * k) / 10000)} m²`), w: W(T(`The lengths are in the ratio $1 : ${k}$, so the areas are in the ratio $1 : ${k}^2 = 1 : ${SPM.gm(k * k)}$.`, `Panjangnya dalam nisbah $1 : ${k}$, jadi luasnya dalam nisbah $1 : ${k}^2 = 1 : ${SPM.gm(k * k)}$.`), T(`Actual area $= ${A} \\times ${SPM.gm(k * k)} = ${SPM.gm(A * k * k)}$ cm²`, `Luas sebenar $= ${A} \\times ${SPM.gm(k * k)} = ${SPM.gm(A * k * k)}$ cm²`), T(`$1\\ \\text{m}^2 = 10\\,000\\ \\text{cm}^2$, so the area is $${SPM.gm(A * k * k)} \\div 10\\,000 = ${n((A * k * k) / 10000)}$ m².`, `$1\\ \\text{m}^2 = 10\\,000\\ \\text{cm}^2$, jadi luasnya ialah $${SPM.gm(A * k * k)} \\div 10\\,000 = ${n((A * k * k) / 10000)}$ m².`)), sp: 's' };
    },
  ];
  SPM.addChapter(3, 4, T('Scale Drawings', 'Lukisan Berskala'), [
    { id: '4.1', en: 'Scale drawings', ms: 'Lukisan berskala', gen: { e: g41e, m: g41m, a: g41a } },
    { id: '4.2', en: 'Area scale', ms: 'Skala luas', scope: 'extension', gen: { e: g42e, m: g42m, a: g42m } },
  ]);

  /* =============================================================== 5 */
  /** right-angled triangle, right angle at B. Angle marked at A or C with label. sides: {ab, bc, ac} label strings */
  function trigFig(o) {
    const w = o.w || 170, h = o.h || 110;
    const W = 260, H = 170;
    const x0 = (W - w) / 2, y0 = (H + h) / 2;
    const B = [x0, y0], C = [x0 + w, y0], A = [x0, y0 - h];
    let out = S.poly([A, B, C]) + S.rightAngle(B, C, A, 10);
    out += S.text(A[0] - 12, A[1] - 4, 'A', { i: true }) + S.text(B[0] - 12, B[1] + 6, 'B', { i: true }) + S.text(C[0] + 12, C[1] + 6, 'C', { i: true });
    const cen = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    if (o.ab) out += S.sideLabel(A, B, cen, o.ab, 14);
    if (o.bc) out += S.sideLabel(B, C, cen, o.bc, 12);
    if (o.ac) out += S.sideLabel(A, C, cen, o.ac, 16);
    if (o.at === 'A') out += S.arc(A, B, C, 26, o.ang, { gap: 16 });
    if (o.at === 'C') out += S.arc(C, B, A, 26, o.ang, { gap: 16 });
    return S.wrap(W, H, out, 'right-angled triangle');
  }
  const TRI = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25]];
  const g51e = [
    (r) => {
      const [a, b, c] = r.pick(TRI.slice(0, 3)), at = r.pick(['A', 'C']);
      // angle at A: opposite = BC(b?) Let BC = b, AB = a
      const AB = a, BC = b, AC = c;
      const opp = at === 'A' ? BC : AB, adj = at === 'A' ? AB : BC;
      const fig = trigFig({ ab: `${AB} cm`, bc: `${BC} cm`, ac: `${AC} cm`, at, ang: 'θ', w: 170, h: 170 * (AB / BC) > 120 ? 120 : Math.max(60, 170 * (AB / BC)) });
      return { q: T(`In the right-angled triangle $ABC$, write down $\\sin\\theta$, $\\cos\\theta$ and $\\tan\\theta$ as fractions.`, `Dalam segi tiga bersudut tegak $ABC$, tuliskan $\\sin\\theta$, $\\cos\\theta$ dan $\\tan\\theta$ sebagai pecahan.`), fig, a: T(`$\\sin\\theta = \\dfrac{${opp}}{${AC}}$, $\\cos\\theta = \\dfrac{${adj}}{${AC}}$, $\\tan\\theta = \\dfrac{${opp}}{${adj}}$`), w: W(T(`Name the sides from $\\theta$: opposite $= ${opp}$ cm, adjacent $= ${adj}$ cm, hypotenuse (facing the right angle) $= ${AC}$ cm.`, `Namakan sisi dari $\\theta$: bertentangan $= ${opp}$ cm, bersebelahan $= ${adj}$ cm, hipotenus (bertentangan dengan sudut tegak) $= ${AC}$ cm.`), T(`$\\sin\\theta = \\dfrac{${opp}}{${AC}}$ (opposite over hypotenuse)`, `$\\sin\\theta = \\dfrac{${opp}}{${AC}}$ (bertentangan atas hipotenus)`), T(`$\\cos\\theta = \\dfrac{${adj}}{${AC}}$ (adjacent over hypotenuse)`, `$\\cos\\theta = \\dfrac{${adj}}{${AC}}$ (bersebelahan atas hipotenus)`), T(`$\\tan\\theta = \\dfrac{${opp}}{${adj}}$ (opposite over adjacent)`, `$\\tan\\theta = \\dfrac{${opp}}{${adj}}$ (bertentangan atas bersebelahan)`)), sp: 's' };
    },
    (r) => {
      const c = r.pick([
        ['\\sin 30^\\circ', '\\dfrac{1}{2}', T('In a $30^\\circ$-$60^\\circ$-$90^\\circ$ triangle the side opposite $30^\\circ$ is half the hypotenuse.', 'Dalam segi tiga $30^\\circ$-$60^\\circ$-$90^\\circ$, sisi bertentangan dengan $30^\\circ$ ialah separuh hipotenus.')],
        ['\\cos 60^\\circ', '\\dfrac{1}{2}', T('In the same triangle the side adjacent to $60^\\circ$ is half the hypotenuse.', 'Dalam segi tiga yang sama, sisi bersebelahan dengan $60^\\circ$ ialah separuh hipotenus.')],
        ['\\tan 45^\\circ', '1', T('In a $45^\\circ$-$45^\\circ$-$90^\\circ$ triangle the opposite and adjacent sides are equal, so their ratio is $1$.', 'Dalam segi tiga $45^\\circ$-$45^\\circ$-$90^\\circ$, sisi bertentangan dan bersebelahan adalah sama, jadi nisbahnya $1$.')],
        ['\\sin 90^\\circ', '1', T('As the angle grows to $90^\\circ$ the opposite side becomes the hypotenuse itself, so the ratio is $1$.', 'Apabila sudut membesar ke $90^\\circ$, sisi bertentangan menjadi hipotenus itu sendiri, jadi nisbahnya $1$.')],
        ['\\cos 90^\\circ', '0', T('As the angle grows to $90^\\circ$ the adjacent side shrinks to $0$, so the ratio is $0$.', 'Apabila sudut membesar ke $90^\\circ$, sisi bersebelahan mengecil kepada $0$, jadi nisbahnya $0$.')],
      ]);
      return { q: T(`State the exact value of $${c[0]}$.`, `Nyatakan nilai tepat bagi $${c[0]}$.`), a: T(`$${c[1]}$`), w: W(c[2], `$${c[0]} = ${c[1]}$`), sp: 'xs' };
    },
  ];
  const g51m = [
    (r) => {
      const [a, b, c] = r.pick(TRI), at = r.pick(['A', 'C']);
      const fig = trigFig({ ab: `${a} cm`, bc: `${b} cm`, ac: 'x', at, ang: 'θ', w: 170, h: Math.max(60, Math.min(120, 170 * (a / b))) });
      const opp = at === 'A' ? b : a, adj = at === 'A' ? a : b;
      return { q: T(`Find $x$ using Pythagoras' theorem, then write $\\sin\\theta$, $\\cos\\theta$ and $\\tan\\theta$.`, `Cari $x$ menggunakan teorem Pythagoras, kemudian tulis $\\sin\\theta$, $\\cos\\theta$ dan $\\tan\\theta$.`), fig, a: T(`$x = ${c}$; $\\sin\\theta = \\dfrac{${opp}}{${c}}$, $\\cos\\theta = \\dfrac{${adj}}{${c}}$, $\\tan\\theta = \\dfrac{${opp}}{${adj}}$`), w: W(T('$x$ is the hypotenuse, so use Pythagoras\' theorem $x^2 = a^2 + b^2$.', '$x$ ialah hipotenus, jadi guna teorem Pythagoras $x^2 = a^2 + b^2$.'), `$x^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}$`, `$x = \\sqrt{${c * c}} = ${c}$`, T(`From $\\theta$: opposite $= ${opp}$, adjacent $= ${adj}$, hypotenuse $= ${c}$.`, `Dari $\\theta$: bertentangan $= ${opp}$, bersebelahan $= ${adj}$, hipotenus $= ${c}$.`), `$\\sin\\theta = \\dfrac{${opp}}{${c}}$, $\\cos\\theta = \\dfrac{${adj}}{${c}}$, $\\tan\\theta = \\dfrac{${opp}}{${adj}}$`), sp: 'm' };
    },
    (r) => {
      const c = r.pick([[T('the opposite side and the hypotenuse', 'sisi bertentangan dan hipotenus'), 'sin'], [T('the adjacent side and the hypotenuse', 'sisi bersebelahan dan hipotenus'), 'cos'], [T('the opposite and adjacent sides', 'sisi bertentangan dan sisi bersebelahan'), 'tan']]);
      return { q: T(`Which trigonometric ratio involves ${c[0].en}: sine, cosine or tangent?`, `Nisbah trigonometri manakah yang melibatkan ${c[0].ms}: sin, kos atau tan?`), a: T(c[1] === 'sin' ? 'sine' : c[1] === 'cos' ? 'cosine' : 'tangent', c[1] === 'sin' ? 'sin' : c[1] === 'cos' ? 'kos' : 'tan'), w: W(T('Sine uses the opposite side and the hypotenuse, cosine uses the adjacent side and the hypotenuse, tangent uses the opposite and adjacent sides.', 'Sin menggunakan sisi bertentangan dan hipotenus, kos menggunakan sisi bersebelahan dan hipotenus, tan menggunakan sisi bertentangan dan sisi bersebelahan.'), T(`The ratio that uses ${c[0].en} is therefore ${c[1] === 'sin' ? 'sine' : c[1] === 'cos' ? 'cosine' : 'tangent'}.`, `Nisbah yang menggunakan ${c[0].ms} ialah ${c[1] === 'sin' ? 'sin' : c[1] === 'cos' ? 'kos' : 'tan'}.`)), sp: 'xs' };
    },
  ];
  const g51a = [
    (r) => {
      const t = r.pick([['\\sin', 3, 5, 4], ['\\sin', 5, 13, 12], ['\\cos', 4, 5, 3], ['\\cos', 12, 13, 5], ['\\tan', 3, 4, 5], ['\\tan', 5, 12, 13]]);
      const [fn, u, v, w] = t;
      let sinv, cosv, tanv;
      if (fn === '\\sin') { sinv = `\\dfrac{${u}}{${v}}`; cosv = `\\dfrac{${w}}{${v}}`; tanv = `\\dfrac{${u}}{${w}}`; }
      else if (fn === '\\cos') { cosv = `\\dfrac{${u}}{${v}}`; sinv = `\\dfrac{${w}}{${v}}`; tanv = `\\dfrac{${w}}{${u}}`; }
      else { tanv = `\\dfrac{${u}}{${v}}`; sinv = `\\dfrac{${u}}{${w}}`; cosv = `\\dfrac{${v}}{${w}}`; }
      const given = fn === '\\sin' ? sinv : fn === '\\cos' ? cosv : tanv;
      const others = fn === '\\sin' ? [`\\cos\\theta = ${cosv}`, `\\tan\\theta = ${tanv}`] : fn === '\\cos' ? [`\\sin\\theta = ${sinv}`, `\\tan\\theta = ${tanv}`] : [`\\sin\\theta = ${sinv}`, `\\cos\\theta = ${cosv}`];
      return { q: T(`Given that $${fn}\\,\\theta = ${given}$ where $\\theta$ is acute, find the other two trigonometric ratios by constructing a right-angled triangle.`, `Diberi $${fn}\\,\\theta = ${given}$ dengan $\\theta$ ialah sudut tirus, cari dua nisbah trigonometri yang lain dengan membina sebuah segi tiga bersudut tegak.`), a: T(`$${others.join(',\\quad ')}$`), w: W(T(`Draw a right-angled triangle in which the ratio $${fn}\\,\\theta = ${given}$ holds, so two sides are $${u}$ and $${v}$.`, `Lukis segi tiga bersudut tegak yang memenuhi nisbah $${fn}\\,\\theta = ${given}$, jadi dua sisinya ialah $${u}$ dan $${v}$.`), fn === '\\tan' ? T(`Hypotenuse $= \\sqrt{${u}^2 + ${v}^2} = \\sqrt{${u * u + v * v}} = ${w}$`, `Hipotenus $= \\sqrt{${u}^2 + ${v}^2} = \\sqrt{${u * u + v * v}} = ${w}$`) : T(`Third side $= \\sqrt{${v}^2 - ${u}^2} = \\sqrt{${v * v - u * u}} = ${w}$`, `Sisi ketiga $= \\sqrt{${v}^2 - ${u}^2} = \\sqrt{${v * v - u * u}} = ${w}$`), T('Now read the other two ratios off the completed triangle.', 'Kini baca dua nisbah yang lain daripada segi tiga yang telah lengkap itu.'), `$${others.join(',\\quad ')}$`), sp: 'm' };
    },
    (r) => {
      const t = r.pick([20, 35, 40, 55, 70]);
      return { q: T(`Use a calculator to find $\\sin ${t}^\\circ$, $\\cos ${t}^\\circ$ and $\\tan ${t}^\\circ$ correct to 4 decimal places. Verify that $\\tan ${t}^\\circ = \\dfrac{\\sin ${t}^\\circ}{\\cos ${t}^\\circ}$.`, `Gunakan kalkulator untuk mencari $\\sin ${t}^\\circ$, $\\cos ${t}^\\circ$ dan $\\tan ${t}^\\circ$ betul kepada 4 tempat perpuluhan. Sahkan bahawa $\\tan ${t}^\\circ = \\dfrac{\\sin ${t}^\\circ}{\\cos ${t}^\\circ}$.`), a: T(`${n(round(Math.sin(rad(t)), 4))}, ${n(round(Math.cos(rad(t)), 4))}, ${n(round(Math.tan(rad(t)), 4))}; $${n(round(Math.sin(rad(t)), 4))} \\div ${n(round(Math.cos(rad(t)), 4))} \\approx ${n(round(Math.tan(rad(t)), 3))}$`), w: W(T('Set the calculator to degree mode, then read each value to $4$ decimal places.', 'Tetapkan kalkulator kepada mod darjah, kemudian baca setiap nilai kepada $4$ tempat perpuluhan.'), `$\\sin ${t}^\\circ = ${n(round(Math.sin(rad(t)), 4))}$, $\\cos ${t}^\\circ = ${n(round(Math.cos(rad(t)), 4))}$, $\\tan ${t}^\\circ = ${n(round(Math.tan(rad(t)), 4))}$`, `$\\dfrac{${n(round(Math.sin(rad(t)), 4))}}{${n(round(Math.cos(rad(t)), 4))}} = ${n(round(round(Math.sin(rad(t)), 4) / round(Math.cos(rad(t)), 4), 4))}$`, T(`This agrees with $\\tan ${t}^\\circ$ to the accuracy used, which confirms $\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$.`, `Ini menepati $\\tan ${t}^\\circ$ pada ketepatan yang digunakan, yang mengesahkan $\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$.`)), sp: 'm' };
    },
  ];
  const fnName = { sin: (x) => Math.sin(rad(x)), cos: (x) => Math.cos(rad(x)), tan: (x) => Math.tan(rad(x)) };
  const g52e = [
    (r) => {
      const t = r.pick([25, 30, 35, 40, 50, 55]), adj = r.int(6, 20);
      const fig = trigFig({ bc: `${adj} cm`, ab: 'x', at: 'C', ang: `${t}°`, w: 170, h: 90 });
      const x = adj * Math.tan(rad(t));
      return { q: T('Find the value of $x$, correct to 2 decimal places.', 'Cari nilai $x$, betul kepada 2 tempat perpuluhan.'), fig, a: T(`$x = ${n(round(x, 2))}$ cm`), w: W(T(`From the angle at $C$, $x$ is the opposite side and $${adj}$ cm is the adjacent side, so use tangent.`, `Dari sudut di $C$, $x$ ialah sisi bertentangan dan $${adj}$ cm ialah sisi bersebelahan, jadi guna tan.`), `$\\tan ${t}^\\circ = \\dfrac{x}{${adj}}$`, `$x = ${adj} \\times \\tan ${t}^\\circ = ${adj} \\times ${n(round(Math.tan(rad(t)), 4))} = ${n(round(x, 2))}$ cm`), sp: 's' };
    },
  ];
  const g52m = [
    (r) => {
      const t = r.pick([28, 35, 42, 50, 58]), adj = r.int(5, 15);
      const hyp = adj / Math.cos(rad(t));
      const fig = trigFig({ bc: `${adj} cm`, ac: 'x', at: 'C', ang: `${t}°`, w: 170, h: 100 });
      return { q: T('Find the length of $x$, correct to 2 decimal places.', 'Cari panjang $x$, betul kepada 2 tempat perpuluhan.'), fig, a: T(`$x = ${n(round(hyp, 2))}$ cm`), w: W(T(`From the angle at $C$, $${adj}$ cm is the adjacent side and $x$ is the hypotenuse, so use cosine.`, `Dari sudut di $C$, $${adj}$ cm ialah sisi bersebelahan dan $x$ ialah hipotenus, jadi guna kos.`), `$\\cos ${t}^\\circ = \\dfrac{${adj}}{x}$`, `$x = \\dfrac{${adj}}{\\cos ${t}^\\circ} = \\dfrac{${adj}}{${n(round(Math.cos(rad(t)), 4))}} = ${n(round(hyp, 2))}$ cm`), sp: 's' };
    },
    (r) => {
      const [a, b] = r.pick([[3, 4], [5, 8], [7, 10], [6, 11]]);
      const ang = (Math.atan(a / b) * 180) / Math.PI;
      const fig = trigFig({ ab: `${a} cm`, bc: `${b} cm`, at: 'C', ang: 'θ', w: 170, h: Math.max(60, Math.min(120, 170 * (a / b))) });
      return { q: T('Find the angle $\\theta$, correct to 1 decimal place.', 'Cari sudut $\\theta$, betul kepada 1 tempat perpuluhan.'), fig, a: T(`$\\theta = ${n(round(ang, 1))}^\\circ$`), w: W(T(`From $\\theta$ at $C$, $${a}$ cm is opposite and $${b}$ cm is adjacent, so use tangent.`, `Dari $\\theta$ di $C$, $${a}$ cm ialah sisi bertentangan dan $${b}$ cm ialah sisi bersebelahan, jadi guna tan.`), `$\\tan\\theta = \\dfrac{${a}}{${b}} = ${n(round(a / b, 4))}$`, `$\\theta = \\tan^{-1} ${n(round(a / b, 4))} = ${n(round(ang, 1))}^\\circ$`), sp: 's' };
    },
  ];
  const g52a = [
    (r) => {
      const t = r.pick([25, 30, 35, 40, 50]), d = r.int(20, 60);
      const h = d * Math.tan(rad(t));
      return { q: T(`From a point ${d} m from the foot of a vertical tree, the angle of elevation of the top is $${t}^\\circ$. Find the height of the tree, correct to 2 decimal places.`, `Dari satu titik yang berjarak ${d} m dari kaki sebatang pokok tegak, sudut dongakan puncaknya ialah $${t}^\\circ$. Cari tinggi pokok itu, betul kepada 2 tempat perpuluhan.`), a: T(`${n(round(h, 2))} m`), w: W(T(`The tree, the ground and the line of sight form a right-angled triangle: the height is opposite the $${t}^\\circ$ angle and $${d}$ m is adjacent, so use tangent.`, `Pokok, tanah dan garis pandangan membentuk segi tiga bersudut tegak: tinggi ialah sisi bertentangan dengan sudut $${t}^\\circ$ dan $${d}$ m ialah sisi bersebelahan, jadi guna tan.`), `$\\tan ${t}^\\circ = \\dfrac{h}{${d}}$`, `$h = ${d} \\times \\tan ${t}^\\circ = ${d} \\times ${n(round(Math.tan(rad(t)), 4))} = ${n(round(h, 2))}$ m`), sp: 'm' };
    },
    (r) => {
      const t1 = r.pick([30, 35, 40]), t2 = r.pick([50, 55, 60]), d = r.int(20, 50);
      // flagpole on building: at distance d, elevation of top of building t1, top of flagpole t2 -> flagpole height = d(tan t2 - tan t1)
      const h = d * (Math.tan(rad(t2)) - Math.tan(rad(t1)));
      return { q: T(`A flagpole stands on top of a building. From a point ${d} m from the base of the building, the angles of elevation of the bottom and the top of the flagpole are $${t1}^\\circ$ and $${t2}^\\circ$. Find the height of the flagpole, correct to 2 decimal places.`, `Sebatang tiang bendera berdiri di atas sebuah bangunan. Dari satu titik yang berjarak ${d} m dari tapak bangunan, sudut dongakan bahagian bawah dan puncak tiang bendera ialah $${t1}^\\circ$ dan $${t2}^\\circ$. Cari tinggi tiang bendera itu, betul kepada 2 tempat perpuluhan.`), a: T(`${n(round(h, 2))} m`), w: W(T(`Height of the building $= ${d} \\times \\tan ${t1}^\\circ = ${n(round(d * Math.tan(rad(t1)), 2))}$ m`, `Tinggi bangunan $= ${d} \\times \\tan ${t1}^\\circ = ${n(round(d * Math.tan(rad(t1)), 2))}$ m`), T(`Height up to the top of the flagpole $= ${d} \\times \\tan ${t2}^\\circ = ${n(round(d * Math.tan(rad(t2)), 2))}$ m`, `Tinggi hingga puncak tiang bendera $= ${d} \\times \\tan ${t2}^\\circ = ${n(round(d * Math.tan(rad(t2)), 2))}$ m`), T('The flagpole is the difference between the two heights.', 'Tiang bendera ialah beza antara kedua-dua ketinggian itu.'), `$${d}(\\tan ${t2}^\\circ - \\tan ${t1}^\\circ) = ${n(round(d * Math.tan(rad(t2)), 2))} - ${n(round(d * Math.tan(rad(t1)), 2))} = ${n(round(h, 2))}$ m`), sp: 'l' };
    },
    (r) => {
      const t = r.pick([20, 25, 30, 35]), h = r.int(30, 80);
      const d = h / Math.tan(rad(t));
      return { q: T(`From the top of a ${h} m cliff, the angle of depression of a boat is $${t}^\\circ$. Find the horizontal distance of the boat from the foot of the cliff, correct to 1 decimal place.`, `Dari puncak sebuah cenuram setinggi ${h} m, sudut tunduk sebuah bot ialah $${t}^\\circ$. Cari jarak mengufuk bot dari kaki cenuram, betul kepada 1 tempat perpuluhan.`), a: T(`${n(round(d, 1))} m`), w: W(T(`The angle of depression from the top equals the angle of elevation from the boat, so the $${t}^\\circ$ angle is at the boat, with the cliff opposite it.`, `Sudut tunduk dari puncak sama dengan sudut dongakan dari bot, jadi sudut $${t}^\\circ$ berada di bot, dengan cenuram sebagai sisi bertentangan.`), `$\\tan ${t}^\\circ = \\dfrac{${h}}{d}$`, `$d = \\dfrac{${h}}{\\tan ${t}^\\circ} = \\dfrac{${h}}{${n(round(Math.tan(rad(t)), 4))}} = ${n(round(d, 1))}$ m`), sp: 'm' };
    },
  ];
  SPM.addChapter(3, 5, T('Trigonometric Ratios in Right-Angled Triangles', 'Nisbah Trigonometri dalam Segi Tiga Bersudut Tegak'), [
    { id: '5.1', en: 'Trigonometric ratios', ms: 'Nisbah trigonometri', gen: { e: g51e, m: g51m, a: g51a } },
    { id: '5.2', en: 'Applications of trigonometric ratios', ms: 'Aplikasi nisbah trigonometri', gen: { e: g52e, m: g52m, a: g52a } },
  ]);
})();
