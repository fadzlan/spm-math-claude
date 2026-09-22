/* Variety pack x4d: extra generators for F4-6.1, F4-6.2, F4-7.1, F4-7.2, F4-10.1, F4-10.2, F4-10.3. */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, fx, rm, gt, round, need, retry, sum, mean, poly, lin, gcd } = SPM;
  const S = SPM.svg;
  const T = SPM.L;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  /* =============================================================================== 6.1 / 6.2 */
  const SYM = { '>': '>', '>=': '\\ge', '<': '<', '<=': '\\le' };
  const FLIP = { '>': '<', '>=': '<=', '<': '>', '<=': '>=' };
  const OPW = {
    '>': T('more than', 'lebih daripada'),
    '>=': T('at least', 'sekurang-kurangnya'),
    '<': T('less than', 'kurang daripada'),
    '<=': T('not more than', 'tidak melebihi'),
  };
  const OPW2 = { // alternate phrasings for the same symbol, for extra wording variety
    '>': T('exceeds', 'melebihi'),
    '>=': T('no less than', 'tidak kurang daripada'),
    '<': T('under', 'kurang daripada'),
    '<=': T('at most', 'selebih-lebihnya'),
  };
  const sat = (a, b, c, op, x, y) => { const v = a * x + b * y; return op === '>' ? v > c : op === '>=' ? v >= c : op === '<' ? v < c : v <= c; };
  const onLine = (a, b, c, x, y) => a * x + b * y === c;
  const showLin = (a, b) => poly([[a, 'x'], [b, 'y']]);
  const planeI = (ineqs, shade, extra) => S.plane(Object.assign({ x: [-2, 8], y: [-2, 8], scale: 20, ineqs, shade }, extra || {}));

  /* generic point-in-plane picker away from a given line, avoiding the line itself */
  const offLinePt = (r, a, b, c) => retry(() => { const x = r.int(0, 7), y = r.int(0, 7); need(a * x + b * y !== c); return [x, y]; });

  const BUDGET_VERB = [
    T('is not more than', 'tidak melebihi'), T('must not exceed', 'tidak boleh melebihi'), T('is at most', 'selebih-lebihnya'),
  ];
  const ATLEAST_VERB = [T('is at least', 'sekurang-kurangnya'), T('must be at least', 'mestilah sekurang-kurangnya'), T('is not less than', 'tidak kurang daripada')];
  const ITEMS5 = SPM.bank.items.slice(0, 8); // capped pool: keep noun-swap variety a minority lever

  const g61e = [
    // (1) MCQ: pick which expression is a linear inequality in two variables
    (r) => {
      const a = r.nz(1, 5), b = r.nz(1, 5), c = r.int(3, 10), op = r.pick(['>', '<', '>=', '<=']);
      const correct = `${showLin(a, b)} ${SYM[op]} ${c}`;
      const distractors = r.sample([
        `${showLin(a, b)} = ${c}`,
        `${a}x ${SYM[op]} ${c}`,
        `${a}x^2 + ${b}y ${SYM[op]} ${c}`,
        `${a}x${b > 0 ? '+' : '-'}${Math.abs(b)}y`,
        `${a}xy ${SYM[op]} ${c}`,
        `\\dfrac{${a}}{x} + ${b}y ${SYM[op]} ${c}`,
        `${a}x + ${b}x ${SYM[op]} ${c}`,
      ], 3);
      const opts = r.shuffle([correct, ...distractors]);
      const L4 = 'ABCD';
      const letter = L4[opts.indexOf(correct)];
      const f = (lang) => opts.map((o, i) => `(${L4[i]}) $${o}$`).join('<br>');
      return {
        q: T(`Which of the following is a linear inequality in two variables?<br>${f('en')}`, `Antara yang berikut, yang manakah ketaksamaan linear dalam dua pemboleh ubah?<br>${f('ms')}`),
        a: T(`(${letter}) $${correct}$`),
        sp: 's',
      };
    },
    // (2) match phrase to symbol
    (r) => {
      const op = r.pick(['>', '>=', '<', '<=']);
      const bank = r.pick([OPW, OPW2]);
      const phrase = bank[op];
      const others = ['>', '>=', '<', '<='].filter((o) => o !== op);
      const opts = r.shuffle([op, ...others]);
      const letter = 'ABCD'[opts.indexOf(op)];
      const f = (k) => opts.map((o, i) => `(${'ABCD'[i]}) $${SYM[o]}$`).join(', ');
      return {
        q: T(`Which symbol matches the phrase "${phrase.en}"? ${f('en')}`, `Simbol manakah yang sepadan dengan frasa "${phrase.ms}"? ${f('ms')}`),
        a: T(`(${letter}) $${SYM[op]}$`),
        sp: 'xs',
      };
    },
    // (3) substitution: does the point satisfy? (general small coefficients)
    (r) => {
      const a = r.nz(1, 3), b = r.nz(1, 3), P = [r.int(0, 5), r.int(0, 5)], c = r.int(4, 12), op = r.pick(['>', '<', '>=', '<=']);
      need(a * P[0] + b * P[1] !== c);
      const v = a * P[0] + b * P[1];
      const ok = sat(a, b, c, op, P[0], P[1]);
      return {
        q: T(`Does the point $(${P[0]}, ${P[1]})$ satisfy the inequality $${showLin(a, b)} ${SYM[op]} ${c}$?`, `Adakah titik $(${P[0]}, ${P[1]})$ memenuhi ketaksamaan $${showLin(a, b)} ${SYM[op]} ${c}$?`),
        a: T(`${ok ? 'Yes' : 'No'}: $${v} ${SYM[op]} ${c}$ is ${ok ? 'true' : 'false'}`, `${ok ? 'Ya' : 'Tidak'}: $${v} ${SYM[op]} ${c}$ adalah ${ok ? 'benar' : 'palsu'}`),
        sp: 's',
      };
    },
    // (4) boundary check: does the point lie ON the line ax+by=c?
    (r) => {
      const a = r.nz(1, 4), b = r.nz(1, 4);
      const onB = r.chance(0.5);
      let P, c;
      if (onB) { P = [r.int(0, 5), r.int(0, 5)]; c = a * P[0] + b * P[1]; }
      else { P = [r.int(0, 5), r.int(0, 5)]; c = a * P[0] + b * P[1] + r.pick([-3, -2, -1, 1, 2, 3]); }
      return {
        q: T(`Does the point $(${P[0]}, ${P[1]})$ lie on the line $${showLin(a, b)} = ${c}$?`, `Adakah titik $(${P[0]}, ${P[1]})$ terletak pada garis $${showLin(a, b)} = ${c}$?`),
        a: T(onB ? 'Yes, it lies on the boundary line.' : 'No, it does not lie on the line.', onB ? 'Ya, ia terletak pada garis sempadan.' : 'Tidak, ia tidak terletak pada garis itu.'),
        sp: 's',
      };
    },
    // (5) fill in the blank symbol from a short worded condition
    (r) => {
      const op = r.pick(['>', '>=', '<', '<=']);
      const phrase = r.pick([OPW, OPW2])[op];
      const c = r.int(4, 10);
      return {
        q: T(`The sum of $x$ and $y$ is ${phrase.en} ${c}. Complete: $x + y\\ \\_\\_\\_\\ ${c}$ (write $>$, $<$, $\\ge$ or $\\le$).`, `Hasil tambah $x$ dan $y$ adalah ${phrase.ms} ${c}. Lengkapkan: $x + y\\ \\_\\_\\_\\ ${c}$ (tulis $>$, $<$, $\\ge$ atau $\\le$).`),
        a: T(`$${SYM[op]}$`),
        sp: 'xs',
      };
    },
    // (6) true/false with justification, general a,b including one negative-style read (a x - b y)
    (r) => {
      const a = r.nz(1, 4), b = r.nz(1, 4), P = [r.int(-2, 5), r.int(0, 5)], c = r.int(2, 10), op = r.pick(['>', '<', '>=', '<=']);
      need(a * P[0] - b * P[1] !== c);
      const v = a * P[0] - b * P[1];
      const ok = op === '>' ? v > c : op === '>=' ? v >= c : op === '<' ? v < c : v <= c;
      return {
        q: T(`True or false: the point $(${P[0]}, ${P[1]})$ satisfies $${poly([[a, 'x'], [-b, 'y']])} ${SYM[op]} ${c}$?`, `Benar atau palsu: titik $(${P[0]}, ${P[1]})$ memenuhi $${poly([[a, 'x'], [-b, 'y']])} ${SYM[op]} ${c}$?`),
        a: T(`${ok ? 'True' : 'False'}: $${v} ${SYM[op]} ${c}$ is ${ok ? 'true' : 'false'}`, `${ok ? 'Benar' : 'Palsu'}: $${v} ${SYM[op]} ${c}$ adalah ${ok ? 'benar' : 'palsu'}`),
        sp: 's',
      };
    },
  ];

  const g61m = [
    // (1) form inequality: two-item budget (not-more-than / at-least), from SPM.bank.items
    (r) => {
      const [i1, i2] = r.sample(ITEMS5, 2);
      const p1 = r.int(i1.lo, i1.hi), p2 = r.int(i2.lo, i2.hi);
      const op = r.pick(['<=', '>=']);
      const verb = op === '<=' ? r.pick(BUDGET_VERB) : r.pick(ATLEAST_VERB);
      const tot = r.pick([200, 250, 300, 400, 500]);
      return {
        q: T(`Nurul buys $x$ ${i1.en} at RM${p1} each and $y$ ${i2.en} at RM${p2} each. The total cost ${verb.en} RM${tot}. Write an inequality in $x$ and $y$.`, `Nurul membeli $x$ ${i1.ms} pada harga RM${p1} sekeping dan $y$ ${i2.ms} pada harga RM${p2} sekeping. Jumlah kosnya ${verb.ms} RM${tot}. Tulis satu ketaksamaan dalam $x$ dan $y$.`),
        a: T(`$${poly([[p1, 'x'], [p2, 'y']])} ${SYM[op]} ${tot}$`),
        sp: 's',
      };
    },
    // (2) form inequality: capacity / mass limit context
    (r) => {
      const cont = r.pick(SPM.bank.containers);
      const cap = r.pick([50, 80, 100, 150, 200]);
      const op = r.pick(['<=', '>=']);
      const verb = op === '<=' ? r.pick(BUDGET_VERB) : r.pick(ATLEAST_VERB);
      const unit = r.pick(['kg', 'litres']);
      return {
        q: T(`A ${cont.en} is filled with $x$ ${unit} of liquid $A$ and $y$ ${unit} of liquid $B$. The total volume ${verb.en} ${cap} ${unit}. Write an inequality in $x$ and $y$.`, `Sebuah ${cont.ms} diisi dengan $x$ ${unit} cecair $A$ dan $y$ ${unit} cecair $B$. Jumlah isi padunya ${verb.ms} ${cap} ${unit}. Tulis satu ketaksamaan dalam $x$ dan $y$.`),
        a: T(`$x + y ${SYM[op]} ${cap}$`),
        sp: 's',
      };
    },
    // (3) form inequality: ratio constraint ("at least k times as many")
    (r) => {
      const k = r.pick([2, 3]);
      const [i1, i2] = r.sample(ITEMS5, 2);
      return {
        q: T(`A shop stocks $x$ ${i1.en} and $y$ ${i2.en}. The number of ${i1.en} is at least ${k} times the number of ${i2.en}. Write an inequality in $x$ and $y$.`, `Sebuah kedai menstok $x$ ${i1.ms} dan $y$ ${i2.ms}. Bilangan ${i1.ms} sekurang-kurangnya ${k} kali bilangan ${i2.ms}. Tulis satu ketaksamaan dalam $x$ dan $y$.`),
        a: T(`$x \\ge ${k}y$`),
        sp: 's',
      };
    },
    // (4) which of 4 points satisfy the inequality (list task)
    (r) => {
      const a = r.nz(1, 3), b = r.nz(1, 3), c = r.int(6, 14), op = r.pick(['>', '<', '>=', '<=']);
      const pts = r.distinct(4, 0, 30).map((v) => [v % 6, Math.floor(v / 6)]);
      const good = pts.filter((p) => sat(a, b, c, op, p[0], p[1])).map((p) => `$(${p[0]}, ${p[1]})$`);
      const list = pts.map((p) => `$(${p[0]}, ${p[1]})$`).join(', ');
      return {
        q: T(`Which of these points satisfy $${showLin(a, b)} ${SYM[op]} ${c}$? ${list}`, `Titik manakah yang memenuhi $${showLin(a, b)} ${SYM[op]} ${c}$? ${list}`),
        a: T(good.length ? good.join(', ') : 'None of them', good.length ? good.join(', ') : 'Tiada satu pun'),
        sp: 's',
      };
    },
    // (5) work backwards: find the missing constant c given a boundary point
    (r) => {
      const a = r.nz(1, 4), b = r.nz(1, 4), P = [r.int(1, 6), r.int(1, 6)];
      const c = a * P[0] + b * P[1];
      const op = r.pick(['>', '<', '>=', '<=']);
      return {
        q: T(`The point $(${P[0]}, ${P[1]})$ lies exactly on the boundary line of $${showLin(a, b)} ${SYM[op]} k$. Find $k$.`, `Titik $(${P[0]}, ${P[1]})$ terletak tepat pada garis sempadan bagi $${showLin(a, b)} ${SYM[op]} k$. Cari $k$.`),
        a: T(`$k = ${c}$`),
        sp: 'xs',
      };
    },
    // (6) classify a point: in the region / on the boundary / outside (3-way)
    (r) => {
      const a = r.nz(1, 3), b = r.nz(1, 3), c = r.int(6, 14), op = r.pick(['>', '<', '>=', '<=']);
      const kind = r.pick(['in', 'bound', 'out']);
      let P;
      if (kind === 'bound') { P = retry(() => { const x = r.int(0, 6), y = a !== 0 ? (c - a * x) / b : r.int(0, 6); need(Number.isInteger(y) && y >= 0 && y <= 8); return [x, y]; }); }
      else { P = offLinePt(r, a, b, c); }
      const v = a * P[0] + b * P[1];
      const strict = op === '>' || op === '<';
      let verdict;
      if (v === c) verdict = strict ? T('on the boundary, not in the solution set (strict inequality)', 'pada sempadan, bukan dalam set penyelesaian (ketaksamaan ketat)') : T('on the boundary and in the solution set', 'pada sempadan dan dalam set penyelesaian');
      else verdict = sat(a, b, c, op, P[0], P[1]) ? T('in the solution region', 'dalam rantau penyelesaian') : T('outside the solution region', 'di luar rantau penyelesaian');
      return {
        q: T(`For $${showLin(a, b)} ${SYM[op]} ${c}$, is the point $(${P[0]}, ${P[1]})$ in the region, on the boundary, or outside? Justify with substitution.`, `Bagi $${showLin(a, b)} ${SYM[op]} ${c}$, adakah titik $(${P[0]}, ${P[1]})$ dalam rantau, pada sempadan, atau di luar? Wajarkan dengan penggantian.`),
        a: T(`$${v}$ vs $${c}$: the point is ${verdict.en}`, `$${v}$ berbanding $${c}$: titik itu ${verdict.ms}`),
        sp: 's',
      };
    },
    // (7) spot-the-error: a student substituted wrongly, find and correct
    (r) => {
      const a = r.nz(2, 4), b = r.nz(1, 3), P = [r.int(1, 5), r.int(1, 5)], c = r.int(8, 16), op = r.pick(['>', '>=']);
      const correctV = a * P[0] + b * P[1];
      const wrongV = a * P[0] + b * P[1] + b * P[1]; // common error: forgot to multiply b, added y twice / omitted coefficient of x
      const studentSays = sat(a, b, c, op, 0, 0) ? '' : '';
      const claimTrue = (op === '>' ? wrongV > c : wrongV >= c);
      const actualTrue = sat(a, b, c, op, P[0], P[1]);
      return {
        q: T(`A student substitutes $(${P[0]}, ${P[1]})$ into $${showLin(a, b)} ${SYM[op]} ${c}$ and writes "$${wrongV} ${SYM[op]} ${c}$, so it is ${claimTrue ? 'a solution' : 'not a solution'}." Find the student's mistake and give the correct conclusion.`, `Seorang pelajar menggantikan $(${P[0]}, ${P[1]})$ ke dalam $${showLin(a, b)} ${SYM[op]} ${c}$ dan menulis "$${wrongV} ${SYM[op]} ${c}$, jadi ia ${claimTrue ? 'satu penyelesaian' : 'bukan penyelesaian'}." Cari kesilapan pelajar itu dan berikan kesimpulan yang betul.`),
        a: T(`The correct value is $${correctV}$ (not $${wrongV}$), so it is ${actualTrue ? 'a solution' : 'not a solution'}: $${correctV} ${SYM[op]} ${c}$ is ${actualTrue ? 'true' : 'false'}.`, `Nilai yang betul ialah $${correctV}$ (bukan $${wrongV}$), jadi ia ${actualTrue ? 'satu penyelesaian' : 'bukan penyelesaian'}: $${correctV} ${SYM[op]} ${c}$ adalah ${actualTrue ? 'benar' : 'palsu'}.`),
        sp: 's',
      };
    },
  ];

  const g61a = [
    // (1) constraint paragraph -> two/three inequalities (multi-context family)
    (r) => {
      const ctx = r.pick([
        { en: (h1, h2, H, minA) => `A workshop makes $x$ chairs and $y$ tables. Each chair needs ${h1} hours of labour and each table needs ${h2} hours; total labour available is at most ${H} hours. At least ${minA} chairs must be made.`,
          ms: (h1, h2, H, minA) => `Sebuah bengkel membuat $x$ kerusi dan $y$ meja. Setiap kerusi memerlukan ${h1} jam kerja dan setiap meja memerlukan ${h2} jam; jumlah masa kerja yang ada selebih-lebihnya ${H} jam. Sekurang-kurangnya ${minA} kerusi mesti dibuat.` },
        { en: (h1, h2, H, minA) => `A bakery uses $x$ kg of flour for bread and $y$ kg for cakes. Bread needs ${h1} kg of sugar per kg of flour and cakes need ${h2} kg per kg of flour; total sugar available is at most ${H} kg. At least ${minA} kg of flour must go to bread.`,
          ms: (h1, h2, H, minA) => `Sebuah kedai roti menggunakan $x$ kg tepung untuk roti dan $y$ kg untuk kek. Roti memerlukan ${h1} kg gula bagi setiap kg tepung dan kek memerlukan ${h2} kg bagi setiap kg tepung; jumlah gula yang ada selebih-lebihnya ${H} kg. Sekurang-kurangnya ${minA} kg tepung mesti digunakan untuk roti.` },
        { en: (h1, h2, H, minA) => `A farmer grows $x$ plots of chillies and $y$ plots of tomatoes. Chillies need ${h1} litres of water per plot and tomatoes need ${h2} litres per plot per day; the daily water supply is at most ${H} litres. At least ${minA} plots of chillies must be planted.`,
          ms: (h1, h2, H, minA) => `Seorang petani menanam $x$ plot cili dan $y$ plot tomato. Cili memerlukan ${h1} liter air setiap plot dan tomato memerlukan ${h2} liter setiap plot sehari; bekalan air harian selebih-lebihnya ${H} liter. Sekurang-kurangnya ${minA} plot cili mesti ditanam.` },
      ]);
      const h1 = r.int(2, 4), h2 = r.int(2, 3), H = r.pick([40, 60, 80, 100]), minA = r.int(3, 6);
      const ratio = r.pick([1, 2]);
      return {
        q: T(`${ctx.en(h1, h2, H, minA)} The number of the second is not more than ${ratio === 1 ? 'the number of' : `${ratio} times the number of`} the first. Write three inequalities in $x$ and $y$.`,
          `${ctx.ms(h1, h2, H, minA)} Bilangan yang kedua tidak melebihi ${ratio === 1 ? 'bilangan' : `${ratio} kali bilangan`} yang pertama. Tulis tiga ketaksamaan dalam $x$ dan $y$.`),
        a: T(`$${h1}x + ${h2}y \\le ${H}$; $x \\ge ${minA}$; $y \\le ${ratio === 1 ? '' : ratio}x$`),
        sp: 'm',
      };
    },
    // (2) form inequality + test a given point + give one integer solution (multi-part)
    (r) => {
      const [i1, i2] = r.sample(ITEMS5, 2);
      const p1 = r.int(i1.lo, i1.hi), p2 = r.int(i2.lo, i2.hi), tot = r.pick([200, 300, 400]);
      const Px = r.int(1, 5), Py = r.int(1, 5);
      const v = p1 * Px + p2 * Py;
      const ok = v <= tot;
      return {
        q: T(`Alia buys $x$ ${i1.en} at RM${p1} each and $y$ ${i2.en} at RM${p2} each, spending not more than RM${tot} in total. (a) Write an inequality in $x$ and $y$. (b) Does $x = ${Px}, y = ${Py}$ satisfy your inequality? (c) State one other possible pair of non-negative integer values of $x$ and $y$.`, `Alia membeli $x$ ${i1.ms} pada harga RM${p1} sekeping dan $y$ ${i2.ms} pada harga RM${p2} sekeping, membelanjakan tidak melebihi RM${tot} secara keseluruhannya. (a) Tulis satu ketaksamaan dalam $x$ dan $y$. (b) Adakah $x = ${Px}, y = ${Py}$ memenuhi ketaksamaan anda? (c) Nyatakan satu lagi pasangan nilai integer bukan negatif bagi $x$ dan $y$ yang mungkin.`),
        a: T(`(a) $${poly([[p1, 'x'], [p2, 'y']])} \\le ${tot}$ (b) $${v} \\le ${tot}$ is ${ok ? 'true, so yes' : 'false, so no'} (c) e.g. $(0, 0)$`, `(a) $${poly([[p1, 'x'], [p2, 'y']])} \\le ${tot}$ (b) $${v} \\le ${tot}$ adalah ${ok ? 'benar, jadi ya' : 'palsu, jadi tidak'} (c) cth. $(0, 0)$`),
        sp: 'm',
      };
    },
    // (3) conjecture: test 3 representative points (in / on boundary / out) and state a justified general conclusion
    (r) => {
      const a = r.nz(1, 3), b = r.nz(1, 3), c = r.int(8, 16), op = r.pick(['>=', '<=']);
      const Pin = offLinePt(r, a, b, c);
      const inTrue = sat(a, b, c, op, Pin[0], Pin[1]);
      const Pbound = retry(() => { const x = r.int(0, 6); const y = (c - a * x) / b; need(Number.isInteger(y) && y >= 0 && y <= 8); return [x, y]; });
      const Pout = retry(() => { const x = r.int(0, 6), y = r.int(0, 6); need(!sat(a, b, c, op, x, y) && a * x + b * y !== c); return [x, y]; });
      const claim = r.chance(0.5); // claim: "all points satisfying x+y>k are ... true" (we test it correctly)
      return {
        q: T(`A student conjectures that every point $(x, y)$ with $${showLin(a, b)} ${SYM[op]} ${c}$ lies in the solution region of the inequality. Test the point $(${Pin[0]}, ${Pin[1]})$, the boundary point $(${Pbound[0]}, ${Pbound[1]})$ and $(${Pout[0]}, ${Pout[1]})$, then state whether the conjecture is true.`, `Seorang pelajar membuat konjektur bahawa setiap titik $(x, y)$ dengan $${showLin(a, b)} ${SYM[op]} ${c}$ terletak dalam rantau penyelesaian ketaksamaan itu. Uji titik $(${Pin[0]}, ${Pin[1]})$, titik sempadan $(${Pbound[0]}, ${Pbound[1]})$ dan $(${Pout[0]}, ${Pout[1]})$, kemudian nyatakan sama ada konjektur itu benar.`),
        a: T(`$(${Pin[0]}, ${Pin[1]})$: ${inTrue ? 'satisfies' : 'does not satisfy'}; boundary point: satisfies only if the inequality is inclusive ($${op}$ is ${op.length === 2 ? 'inclusive' : 'strict'}); $(${Pout[0]}, ${Pout[1]})$: does not satisfy. The conjecture is ${op.length === 2 ? 'true' : 'false (the boundary point is excluded)'}.`, `$(${Pin[0]}, ${Pin[1]})$: ${inTrue ? 'memenuhi' : 'tidak memenuhi'}; titik sempadan: memenuhi hanya jika ketaksamaan itu terangkum ($${op}$ ${op.length === 2 ? 'terangkum' : 'ketat'}); $(${Pout[0]}, ${Pout[1]})$: tidak memenuhi. Konjektur itu ${op.length === 2 ? 'benar' : 'palsu (titik sempadan tidak termasuk)'}.`),
        sp: 'l',
      };
    },
    // (4) non-negativity + capacity + ratio: three inequalities from a full paragraph
    (r) => {
      const [a1, a2] = r.sample(SPM.bank.animals, 2);
      const feed = r.int(2, 5), space = r.pick([40, 60, 80]);
      return {
        q: T(`A farm keeps $x$ ${a1.en} and $y$ ${a2.en}. Each ${a1.en.replace(/s$/, '')} needs ${feed} kg of feed a day and each ${a2.en.replace(/s$/, '')} needs 1 kg; the daily feed supply is at most ${space} kg. The number of ${a2.en} must be at least twice the number of ${a1.en}, and neither number can be negative. Write four inequalities.`, `Sebuah ladang menternak $x$ ekor ${a1.ms} dan $y$ ekor ${a2.ms}. Setiap ekor ${a1.ms} memerlukan ${feed} kg makanan sehari dan setiap ekor ${a2.ms} memerlukan 1 kg; bekalan makanan harian selebih-lebihnya ${space} kg. Bilangan ${a2.ms} mestilah sekurang-kurangnya dua kali bilangan ${a1.ms}, dan kedua-dua bilangan tidak boleh negatif. Tulis empat ketaksamaan.`),
        a: T(`$${feed}x + y \\le ${space}$; $y \\ge 2x$; $x \\ge 0$; $y \\ge 0$`),
        sp: 'm',
      };
    },
  ];
  SPM.extend('F4-6.1', { e: g61e, m: g61m, a: g61a });

  const g62e = [
    // (1) draw & shade a single inequality (varies op, orientation a/b)
    (r) => {
      const which = r.pick(['x+y', 'x', 'y']);
      const c = r.int(3, 6), op = r.pick(['>', '<', '>=', '<=']);
      const a = which === 'y' ? 0 : 1, b = which === 'x' ? 0 : 1;
      const q = { a, b, c, op };
      const label = which === 'x+y' ? `x + y` : which;
      return {
        q: T(`Draw the line $${label} = ${c}$ (dashed if the inequality is strict, solid if inclusive) and shade the region $${label} ${SYM[op]} ${c}$.`, `Lukis garis $${label} = ${c}$ (putus-putus jika ketaksamaan itu ketat, penuh jika terangkum) dan lorekkan rantau $${label} ${SYM[op]} ${c}$.`),
        fig: S.plane({ x: [-2, 8], y: [-2, 8], scale: 20 }),
        a: T(planeI([q], true), planeI([q], true)),
        sp: 'xl',
      };
    },
    // (2) identify boundary style from the symbol (recall, no figure)
    (r) => {
      const op = r.pick(['>', '<', '>=', '<=']);
      const strict = op === '>' || op === '<';
      return {
        q: T(`For the inequality $x + y ${SYM[op]} 6$, should the boundary line be drawn solid or dashed?`, `Bagi ketaksamaan $x + y ${SYM[op]} 6$, patutkah garis sempadan dilukis penuh atau putus-putus?`),
        a: T(strict ? 'Dashed (the boundary is not included)' : 'Solid (the boundary is included)', strict ? 'Putus-putus (sempadan tidak termasuk)' : 'Penuh (sempadan termasuk)'),
        sp: 'xs',
      };
    },
    // (3) read a shaded single-inequality figure and identify a point in the region
    (r) => {
      const c = r.int(3, 6), op = r.pick(['>=', '<=']);
      const q = { a: 1, b: 1, c, op };
      const fig = planeI([q], true);
      const inPt = op === '<=' ? [0, 0] : [c, c];
      return {
        q: T(`The diagram shows the region satisfying an inequality. State one point that lies in the shaded region.`, `Rajah menunjukkan rantau yang memenuhi satu ketaksamaan. Nyatakan satu titik yang terletak dalam rantau berlorek.`),
        fig,
        a: T(`e.g. $(${inPt[0]}, ${inPt[1]})$`),
        sp: 's',
      };
    },
    // (4) given a solid horizontal/vertical line and shading, state the inequality
    (r) => {
      const vert = r.chance(0.5);
      const c = r.int(2, 6), op = r.pick(['>=', '<=']);
      const q = vert ? { a: 1, b: 0, c, op } : { a: 0, b: 1, c, op };
      const fig = planeI([q], true);
      return {
        q: T(`State the inequality shown by the shaded region (the boundary line is solid).`, `Nyatakan ketaksamaan yang ditunjukkan oleh rantau berlorek (garis sempadan adalah penuh).`),
        fig,
        a: T(`$${vert ? 'x' : 'y'} ${SYM[op]} ${c}$`),
        sp: 's',
      };
    },
    // (5) MCQ: pick the inequality that matches a shaded single-inequality figure
    (r) => {
      const c = r.int(3, 6), op = r.pick(['>=', '<=']);
      const q = { a: 1, b: 1, c, op };
      const fig = planeI([q], true);
      const correct = `x + y ${SYM[op]} ${c}`;
      const distractors = r.sample([`x + y ${SYM[FLIP[op]]} ${c}`, `x + y ${SYM[op]} ${c + 2}`, `x - y ${SYM[op]} ${c}`, `2x + y ${SYM[op]} ${c}`, `x + 2y ${SYM[op]} ${c}`], 3);
      const opts = r.shuffle([correct, ...distractors]);
      const letter = 'ABCD'[opts.indexOf(correct)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) $${o}$`).join('<br>');
      return {
        q: T(`Which inequality is represented by the shaded region?<br>${f('en')}`, `Ketaksamaan manakah yang diwakili oleh rantau berlorek?<br>${f('ms')}`),
        fig,
        a: T(`(${letter}) $${correct}$`),
        sp: 's',
      };
    },
    // (6) reverse of (2): given strict/inclusive in words, decide the line style
    (r) => {
      const inclusive = r.chance(0.5);
      return {
        q: T(`If the inequality defining a region is ${inclusive ? 'inclusive (\\u2265 or \\u2264)' : 'strict (> or <)'}, is its boundary line drawn solid or dashed?`, `Jika ketaksamaan yang menentukan rantau adalah ${inclusive ? 'terangkum (\\u2265 atau \\u2264)' : 'ketat (> atau <)'}, adakah garis sempadannya dilukis penuh atau putus-putus?`),
        a: T(inclusive ? 'Solid' : 'Dashed', inclusive ? 'Penuh' : 'Putus-putus'),
        sp: 'xs',
      };
    },
    // (7) single diagonal line through the origin: draw & shade
    (r) => {
      const m = r.pick([1, 2, 3]);
      const op = r.pick(['>', '<', '>=', '<=']);
      const q = { a: -m, b: 1, c: 0, op };
      return {
        q: T(`Draw the line $y = ${m === 1 ? '' : m}x$ (dashed if the inequality is strict, solid if inclusive) and shade the region $y ${SYM[op]} ${m === 1 ? '' : m}x$.`, `Lukis garis $y = ${m === 1 ? '' : m}x$ (putus-putus jika ketaksamaan itu ketat, penuh jika terangkum) dan lorekkan rantau $y ${SYM[op]} ${m === 1 ? '' : m}x$.`),
        fig: S.plane({ x: [-2, 8], y: [-2, 8], scale: 20 }),
        a: T(planeI([q], true), planeI([q], true)),
        sp: 'xl',
      };
    },
    // (8) match: which side of the line is shaded, described in words
    (r) => {
      const axis = r.pick(['x', 'y']);
      const c = r.int(2, 6);
      const side = r.chance(0.5);
      const op = axis === 'x' ? (side ? '>=' : '<=') : (side ? '>=' : '<=');
      const q = axis === 'x' ? { a: 1, b: 0, c, op } : { a: 0, b: 1, c, op };
      const fig = planeI([q], true);
      const descEn = axis === 'x' ? (side ? 'to the right of' : 'to the left of') : (side ? 'above' : 'below');
      const descMs = axis === 'x' ? (side ? 'di sebelah kanan' : 'di sebelah kiri') : (side ? 'di atas' : 'di bawah');
      return {
        q: T(`The shaded region is ${descEn} the line $${axis} = ${c}$ (boundary included). Write the inequality.`, `Rantau berlorek terletak ${descMs} garis $${axis} = ${c}$ (sempadan disertakan).`),
        fig,
        a: T(`$${axis} ${SYM[op]} ${c}$`),
        sp: 'xs',
      };
    },
    // (9) state the x- and y-intercepts of the boundary line of a given inequality
    (r) => {
      const p = r.int(2, 6), q2 = r.int(2, 6), op = r.pick(['>', '<', '>=', '<=']);
      return {
        q: T(`State the $x$-intercept and $y$-intercept of the boundary line of $${p}x + ${q2}y ${SYM[op]} ${p * q2}$.`, `Nyatakan pintasan-$x$ dan pintasan-$y$ garis sempadan bagi $${p}x + ${q2}y ${SYM[op]} ${p * q2}$.`),
        a: T(`$x$-intercept $= ${q2}$, $y$-intercept $= ${p}$`, `Pintasan-$x$ $= ${q2}$, pintasan-$y$ $= ${p}$`),
        sp: 's',
      };
    },
    // (10) does the origin satisfy the inequality? (the classic test-point trick)
    (r) => {
      const p = r.int(1, 4), q2 = r.int(1, 4), c = r.int(3, 10), op = r.pick(['>', '<', '>=', '<=']);
      const onOrigin = c === 0;
      const ok = op === '>' ? 0 > c : op === '>=' ? 0 >= c : op === '<' ? 0 < c : 0 <= c;
      return {
        q: T(`Does the origin $(0, 0)$ satisfy the inequality $${p}x + ${q2}y ${SYM[op]} ${c}$? This is a common way to decide which side of a line to shade.`, `Adakah asalan $(0, 0)$ memenuhi ketaksamaan $${p}x + ${q2}y ${SYM[op]} ${c}$? Ini adalah satu cara lazim untuk menentukan sebelah mana garis perlu dilorek.`),
        a: T(`${ok ? 'Yes' : 'No'}: $0 ${SYM[op]} ${c}$ is ${ok ? 'true' : 'false'}`, `${ok ? 'Ya' : 'Tidak'}: $0 ${SYM[op]} ${c}$ adalah ${ok ? 'benar' : 'palsu'}`),
        sp: 's',
      };
    },
    // (11) strict vs inclusive: recall from wording, short true/false
    (r) => {
      const op = r.pick(['>', '<', '>=', '<=']);
      const strict = op === '>' || op === '<';
      return {
        q: T(`True or false: the inequality $x + y ${SYM[op]} 5$ is a strict inequality.`, `Benar atau palsu: ketaksamaan $x + y ${SYM[op]} 5$ ialah ketaksamaan ketat.`),
        a: T(strict ? 'True' : 'False, it is inclusive', strict ? 'Benar' : 'Palsu, ia terangkum'),
        sp: 'xs',
      };
    },
    // (12) match a worded region description to its inequality (large phrase bank)
    (r) => {
      const c = r.int(2, 6);
      const bank = [
        { key: 'xge', ineq: `x \\ge ${c}`, en: `every point on or to the right of $x = ${c}$`, ms: `setiap titik pada atau di sebelah kanan $x = ${c}$` },
        { key: 'xle', ineq: `x \\le ${c}`, en: `every point on or to the left of $x = ${c}$`, ms: `setiap titik pada atau di sebelah kiri $x = ${c}$` },
        { key: 'yge', ineq: `y \\ge ${c}`, en: `every point on or above $y = ${c}$`, ms: `setiap titik pada atau di atas $y = ${c}$` },
        { key: 'yle', ineq: `y \\le ${c}`, en: `every point on or below $y = ${c}$`, ms: `setiap titik pada atau di bawah $y = ${c}$` },
        { key: 'xgt', ineq: `x > ${c}`, en: `every point strictly to the right of $x = ${c}$, not including the line itself`, ms: `setiap titik yang betul-betul di sebelah kanan $x = ${c}$, tidak termasuk garis itu` },
        { key: 'ylt', ineq: `y < ${c}`, en: `every point strictly below $y = ${c}$, not including the line itself`, ms: `setiap titik yang betul-betul di bawah $y = ${c}$, tidak termasuk garis itu` },
        { key: 'sumge', ineq: `x + y \\ge ${c}`, en: `every point where the sum of its coordinates is at least ${c}`, ms: `setiap titik dengan hasil tambah koordinatnya sekurang-kurangnya ${c}` },
        { key: 'sumle', ineq: `x + y \\le ${c}`, en: `every point where the sum of its coordinates is not more than ${c}`, ms: `setiap titik dengan hasil tambah koordinatnya tidak melebihi ${c}` },
        { key: 'diffge', ineq: `x - y \\ge ${c}`, en: `every point where its $x$-coordinate exceeds its $y$-coordinate by at least ${c}`, ms: `setiap titik yang koordinat-$x$nya melebihi koordinat-$y$nya sekurang-kurangnya ${c}` },
        { key: 'diffle', ineq: `x - y \\le ${c}`, en: `every point where its $x$-coordinate exceeds its $y$-coordinate by not more than ${c}`, ms: `setiap titik yang koordinat-$x$nya melebihi koordinat-$y$nya tidak lebih daripada ${c}` },
        { key: 'ymxge', ineq: `y \\ge 2x`, en: `every point where the $y$-coordinate is at least twice the $x$-coordinate`, ms: `setiap titik yang koordinat-$y$nya sekurang-kurangnya dua kali koordinat-$x$nya` },
        { key: 'xzero', ineq: `x \\ge 0`, en: `every point that does not lie to the left of the $y$-axis`, ms: `setiap titik yang tidak terletak di sebelah kiri paksi-$y$` },
        { key: 'yzero', ineq: `y \\ge 0`, en: `every point that does not lie below the $x$-axis`, ms: `setiap titik yang tidak terletak di bawah paksi-$x$` },
      ];
      const correctI = r.int(0, bank.length - 1);
      const correct = bank[correctI];
      const wrongPool = bank.filter((_, i) => i !== correctI);
      const wrongs = r.sample(wrongPool, 3);
      const opts = r.shuffle([correct, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o[lang]}`).join('<br>');
      return {
        q: T(`Which description matches the inequality $${correct.ineq}$?<br>${f('en')}`, `Penerangan manakah yang sepadan dengan ketaksamaan $${correct.ineq}$?<br>${f('ms')}`),
        a: T(`(${letter})`),
        sp: 's',
      };
    },
  ];
  const g62m = [
    // (1) two inequalities -> write them from a shaded figure
    (r) => {
      const k = r.int(2, 5), h = r.int(2, 5);
      const A = { a: 1, b: 0, c: k, op: r.pick(['>=', '<=']) };
      const B = { a: 0, b: 1, c: h, op: r.pick(['>=', '<=']) };
      const fig = planeI([A, B], true);
      return {
        q: T('Write the two inequalities that define the shaded region (a solid line means the boundary is included).', 'Tulis dua ketaksamaan yang menentukan kawasan berlorek (garis penuh bermaksud sempadan disertakan).'),
        fig,
        a: T(`$${A.op === '>=' ? `x \\ge ${A.c}` : `x \\le ${A.c}`}$ and $${B.op === '>=' ? `y \\ge ${B.c}` : `y \\le ${B.c}`}$`),
        sp: 's',
      };
    },
    // (2) region defined by x+y-type line and a horizontal/vertical line: draw and shade
    (r) => {
      const c = r.int(4, 7), op1 = r.pick(['<=', '>=']);
      const k = r.int(1, 3), op2 = r.pick(['>=', '<=']);
      const axis = r.pick(['x', 'y']);
      const A = { a: 1, b: 1, c, op: op1 };
      const B = axis === 'x' ? { a: 1, b: 0, c: k, op: op2 } : { a: 0, b: 1, c: k, op: op2 };
      return {
        q: T(`Draw the lines $x + y = ${c}$ and $${axis} = ${k}$, then shade the region satisfying $x + y ${SYM[op1]} ${c}$ and $${axis} ${SYM[op2]} ${k}$.`, `Lukis garis $x + y = ${c}$ dan $${axis} = ${k}$, kemudian lorekkan rantau yang memenuhi $x + y ${SYM[op1]} ${c}$ dan $${axis} ${SYM[op2]} ${k}$.`),
        fig: S.plane({ x: [-2, 8], y: [-2, 8], scale: 20 }),
        a: T(planeI([A, B], true), planeI([A, B], true)),
        sp: 'xl',
      };
    },
    // (3) which of 4 points lie in a two-inequality region
    (r) => {
      const c = r.int(4, 7), k = r.int(1, 3);
      const A = { a: 1, b: 1, c, op: '<=' }, B = { a: 1, b: 0, c: k, op: '>=' };
      const fig = planeI([A, B], true);
      const pts = r.sample([[0, 0], [k, 0], [c, 0], [0, c], [k, c - k], [c + 1, 0], [k - 1, 0]].filter((p) => p[0] >= 0 && p[1] >= 0), 4);
      const good = pts.filter((p) => sat(1, 1, c, '<=', p[0], p[1]) && sat(1, 0, k, '>=', p[0], p[1])).map((p) => `$(${p[0]}, ${p[1]})$`);
      return {
        q: T(`The diagram shows the region satisfying $x + y \\le ${c}$ and $x \\ge ${k}$. Which of these points lie in the region? ${pts.map((p) => `$(${p[0]}, ${p[1]})$`).join(', ')}`, `Rajah menunjukkan rantau yang memenuhi $x + y \\le ${c}$ dan $x \\ge ${k}$. Titik manakah yang terletak dalam rantau itu? ${pts.map((p) => `$(${p[0]}, ${p[1]})$`).join(', ')}`),
        fig,
        a: T(good.length ? good.join(', ') : 'None', good.length ? good.join(', ') : 'Tiada'),
        sp: 's',
      };
    },
    // (4) count/list integer (lattice) points in a small two-line region
    (r) => {
      const c = r.int(4, 6);
      const A = { a: 1, b: 0, c: 0, op: '>=' }, B = { a: 0, b: 1, c: 0, op: '>=' }, C = { a: 1, b: 1, c, op: '<=' };
      const fig = planeI([A, B, C], true, { x: [-1, 7], y: [-1, 7] });
      const pts = [];
      for (let x = 0; x <= c; x++) for (let y = 0; y <= c - x; y++) pts.push([x, y]);
      return {
        q: T(`The diagram shows the region satisfying $x \\ge 0$, $y \\ge 0$ and $x + y \\le ${c}$ (all boundaries solid). How many points with integer coordinates lie in the region, including its boundary?`, `Rajah menunjukkan rantau yang memenuhi $x \\ge 0$, $y \\ge 0$ dan $x + y \\le ${c}$ (semua sempadan penuh). Berapakah bilangan titik dengan koordinat integer yang terletak dalam rantau itu, termasuk sempadannya?`),
        fig,
        a: T(`${pts.length}`),
        sp: 's',
      };
    },
    // (5) two inequalities through a diagonal line y = mx and a horizontal/vertical line
    (r) => {
      const m = r.pick([1, 2]);
      const h = r.int(3, 7), op1 = r.pick(['>=', '<=']), op2 = r.pick(['>=', '<=']);
      const A = { a: -m, b: 1, c: 0, op: op1 }, B = { a: 0, b: 1, c: h, op: op2 };
      const fig = planeI([A, B], true);
      return {
        q: T(`Write the two inequalities that define the shaded region (both boundaries solid): one line passes through the origin.`, `Tulis dua ketaksamaan yang menentukan kawasan berlorek (kedua-dua sempadan penuh): satu garis melalui asalan.`),
        fig,
        a: T(`$y ${SYM[op1]} ${m === 1 ? '' : m}x$ and $y ${SYM[op2]} ${h}$`),
        sp: 's',
      };
    },
    // (6) spot-the-error: a claimed pair of inequalities for a shaded region has one direction flipped
    (r) => {
      const k = r.int(2, 5), h = r.int(2, 5);
      const opA = r.pick(['>=', '<=']), opB = r.pick(['>=', '<=']);
      const A = { a: 1, b: 0, c: k, op: opA }, B = { a: 0, b: 1, c: h, op: opB };
      const fig = planeI([A, B], true);
      const flipWhich = r.pick(['x', 'y']);
      const wrongA = flipWhich === 'x' ? FLIP[opA] : opA, wrongB = flipWhich === 'y' ? FLIP[opB] : opB;
      return {
        q: T(`A student claims the shaded region satisfies $x ${SYM[wrongA]} ${k}$ and $y ${SYM[wrongB]} ${h}$. One of the two is wrong. Identify which one and write the correct inequality.`, `Seorang pelajar mendakwa rantau berlorek memenuhi $x ${SYM[wrongA]} ${k}$ dan $y ${SYM[wrongB]} ${h}$. Salah satu daripadanya adalah salah. Kenal pasti yang mana satu dan tulis ketaksamaan yang betul.`),
        fig,
        a: T(`$${flipWhich}$ is wrong: it should be $${flipWhich} ${SYM[flipWhich === 'x' ? opA : opB]} ${flipWhich === 'x' ? k : h}$`, `$${flipWhich}$ adalah salah: ia sepatutnya $${flipWhich} ${SYM[flipWhich === 'x' ? opA : opB]} ${flipWhich === 'x' ? k : h}$`),
        sp: 's',
      };
    },
    // (7) true/false: verify a claimed system of inequalities using a test point
    (r) => {
      const c = r.int(4, 7), k = r.int(1, 3);
      const claimedOp1 = r.pick(['<=', '>=']), claimedOp2 = r.pick(['>=', '<=']);
      const A = { a: 1, b: 1, c, op: '<=' }, B = { a: 1, b: 0, c: k, op: '>=' };
      const fig = planeI([A, B], true);
      const claimTrue = claimedOp1 === '<=' && claimedOp2 === '>=';
      const P = [k + 1, 1];
      const testOk = sat(1, 1, c, claimedOp1, P[0], P[1]) && sat(1, 0, k, claimedOp2, P[0], P[1]);
      return {
        q: T(`A student claims the shaded region satisfies $x + y ${SYM[claimedOp1]} ${c}$ and $x ${SYM[claimedOp2]} ${k}$. Test the point $(${P[0]}, ${P[1]})$, which lies in the shaded region, to check the claim.`, `Seorang pelajar mendakwa rantau berlorek memenuhi $x + y ${SYM[claimedOp1]} ${c}$ dan $x ${SYM[claimedOp2]} ${k}$. Uji titik $(${P[0]}, ${P[1]})$, yang terletak dalam rantau berlorek, untuk menyemak dakwaan itu.`),
        fig,
        a: T(`${testOk ? 'The point satisfies both, consistent with the claim' : 'The point fails at least one, so the claim is wrong'}: the correct system is $x + y \\le ${c}$ and $x \\ge ${k}$.`, `${testOk ? 'Titik itu memenuhi kedua-duanya, konsisten dengan dakwaan' : 'Titik itu gagal sekurang-kurangnya satu, jadi dakwaan itu salah'}: sistem yang betul ialah $x + y \\le ${c}$ dan $x \\ge ${k}$.`),
        sp: 'm',
      };
    },
    // (8) table representation: complete a table of y-values and mark which satisfy the system
    (r) => {
      const c = r.int(5, 8), k = r.int(1, 3);
      const xs = range(0, 4);
      const rows = xs.map((x) => (c - x >= 0 ? c - x : null));
      const fig = planeI([{ a: 1, b: 1, c, op: '<=' }, { a: 1, b: 0, c: k, op: '>=' }], true);
      const marks = xs.map((x) => (x >= k && x <= c ? 'satisfies' : 'does not satisfy'));
      const marksMs = xs.map((x) => (x >= k && x <= c ? 'memenuhi' : 'tidak memenuhi'));
      return {
        q: T(`The table shows points on the boundary line $x + y = ${c}$. For each, state whether the point also satisfies $x \\ge ${k}$ (the second condition of the shaded region).<br>${SPM.table([['x', ...xs.map(n)], ['y', ...rows.map((v) => (v === null ? '-' : n(v)))]], { rowHead: true })}`, `Jadual menunjukkan titik pada garis sempadan $x + y = ${c}$. Bagi setiap satu, nyatakan sama ada titik itu turut memenuhi $x \\ge ${k}$ (syarat kedua rantau berlorek).<br>${SPM.table([['x', ...xs.map(n)], ['y', ...rows.map((v) => (v === null ? '-' : n(v)))]], { rowHead: true })}`),
        fig,
        a: T(xs.map((x, i) => `$x=${x}$: ${marks[i]}`).join('; '), xs.map((x, i) => `$x=${x}$: ${marksMs[i]}`).join('; ')),
        sp: 'm',
      };
    },
    // (9) boundary line through two given intercepts: find its equation, then the inequality for the shaded side
    (r) => {
      const xi = r.int(2, 5), yi = r.int(2, 6);
      const g = SPM.gcd(yi, xi) || 1;
      const mN = -yi / g, mD = xi / g; // gradient = -yi/xi in lowest terms (as a fraction mN/mD)
      const shadeOrigin = r.chance(0.5); // whether origin side is included
      const op = shadeOrigin ? '<=' : '>=';
      const A = { a: yi, b: xi, c: xi * yi, op };
      const fig = planeI([A], true, { x: [-1, xi + 3], y: [-1, yi + 3] });
      return {
        q: T(`The boundary line of a shaded region crosses the $x$-axis at $(${xi}, 0)$ and the $y$-axis at $(0, ${yi})$; the origin is ${shadeOrigin ? '' : 'not '}in the shaded region. Find the inequality that defines the region, in the form $ax + by \\le c$ or $ax + by \\ge c$.`, `Garis sempadan rantau berlorek memotong paksi-$x$ pada $(${xi}, 0)$ dan paksi-$y$ pada $(0, ${yi})$; asalan ${shadeOrigin ? '' : 'tidak '}terletak dalam rantau berlorek. Cari ketaksamaan yang menentukan rantau itu, dalam bentuk $ax + by \\le c$ atau $ax + by \\ge c$.`),
        fig,
        a: T(`$${yi}x + ${xi}y ${SYM[op]} ${xi * yi}$`),
        w: T(`Line through $(${xi},0)$ and $(0,${yi})$: $\\dfrac{x}{${xi}} + \\dfrac{y}{${yi}} = 1$, i.e. $${yi}x + ${xi}y = ${xi * yi}$`, `Garis melalui $(${xi},0)$ dan $(0,${yi})$: $\\dfrac{x}{${xi}} + \\dfrac{y}{${yi}} = 1$, iaitu $${yi}x + ${xi}y = ${xi * yi}$`),
        sp: 'm',
      };
    },
    // (10) explain/justify: why a boundary point is excluded from a strict-inequality capacity region
    (r) => {
      const cap = r.pick([20, 25, 30, 40]);
      const item = r.pick(SPM.bank.vehicles);
      const P = [r.int(1, cap - 1), 0];
      P[1] = cap - P[0];
      return {
        q: T(`A ${item.en} park has space for fewer than ${cap} vehicles in two zones, $x$ in zone $P$ and $y$ in zone $Q$: $x + y < ${cap}$. Explain why the point $(${P[0]}, ${P[1]})$ does NOT represent a possible number of vehicles in the two zones.`, `Sebuah tempat letak ${item.ms} mempunyai ruang untuk kurang daripada ${cap} kenderaan dalam dua zon, $x$ di zon $P$ dan $y$ di zon $Q$: $x + y < ${cap}$. Terangkan mengapa titik $(${P[0]}, ${P[1]})$ TIDAK mewakili bilangan kenderaan yang mungkin di kedua-dua zon.`),
        a: T(`$${P[0]} + ${P[1]} = ${cap}$, which is not less than ${cap}; the inequality is strict, so points on the boundary line $x + y = ${cap}$ are excluded.`, `$${P[0]} + ${P[1]} = ${cap}$, iaitu tidak kurang daripada ${cap}; ketaksamaan itu ketat, jadi titik pada garis sempadan $x + y = ${cap}$ tidak termasuk.`),
        sp: 's',
      };
    },
    // (11) two diagonal lines through the origin: write the system from a figure
    (r) => {
      const m1 = r.pick([1, 2]), m2 = r.pick([3]);
      const A = { a: -m1, b: 1, c: 0, op: '>=' }, B = { a: -m2, b: 1, c: 0, op: '<=' };
      const fig = planeI([A, B], true, { x: [-1, 8], y: [-1, 8] });
      return {
        q: T('Write the two inequalities that define the shaded region between the two lines through the origin (both boundaries solid).', 'Tulis dua ketaksamaan yang menentukan kawasan berlorek di antara dua garis yang melalui asalan (kedua-dua sempadan penuh).'),
        fig,
        a: T(`$y \\ge ${m1 === 1 ? '' : m1}x$ and $y \\le ${m2}x$`),
        sp: 'm',
      };
    },
    // (12) compare: how the shaded region changes when a boundary value increases
    (r) => {
      const k = r.int(2, 4), h = r.int(2, 4), inc = r.pick([1, 2]);
      return {
        q: T(`The region $R_1$ satisfies $x \\ge ${k}$ and $y \\le ${h}$. The region $R_2$ satisfies $x \\ge ${k + inc}$ and $y \\le ${h}$. Describe how $R_2$ compares with $R_1$.`, `Rantau $R_1$ memenuhi $x \\ge ${k}$ dan $y \\le ${h}$. Rantau $R_2$ memenuhi $x \\ge ${k + inc}$ dan $y \\le ${h}$. Terangkan bagaimana $R_2$ berbanding dengan $R_1$.`),
        a: T(`$R_2$ is smaller than $R_1$: it is the part of $R_1$ with $x \\ge ${k + inc}$ (the left strip $${k} \\le x < ${k + inc}$ is removed).`, `$R_2$ lebih kecil daripada $R_1$: ia adalah bahagian $R_1$ dengan $x \\ge ${k + inc}$ (jalur kiri $${k} \\le x < ${k + inc}$ dibuang).`),
        sp: 'm',
      };
    },
    // (13) construct-your-own: give a system with one point included and another excluded
    (r) => {
      const Pin = [r.int(3, 5), r.int(3, 5)];
      const Pout = [r.int(0, 2), r.int(0, 2)];
      return {
        q: T(`Write a system of two inequalities in $x$ and $y$ (each of the form $x \\ge k$ or $y \\ge k$) so that the point $(${Pin[0]}, ${Pin[1]})$ satisfies both but the point $(${Pout[0]}, ${Pout[1]})$ does not satisfy at least one.`, `Tulis satu sistem dua ketaksamaan dalam $x$ dan $y$ (setiap satu dalam bentuk $x \\ge k$ atau $y \\ge k$) supaya titik $(${Pin[0]}, ${Pin[1]})$ memenuhi kedua-duanya tetapi titik $(${Pout[0]}, ${Pout[1]})$ tidak memenuhi sekurang-kurangnya satu.`),
        a: T(`e.g. $x \\ge ${Pin[0]}$ and $y \\ge ${Pin[1]}$ (since $(${Pout[0]}, ${Pout[1]})$ fails $x \\ge ${Pin[0]}$)`, `cth. $x \\ge ${Pin[0]}$ dan $y \\ge ${Pin[1]}$ (kerana $(${Pout[0]}, ${Pout[1]})$ gagal memenuhi $x \\ge ${Pin[0]}$)`),
        sp: 's',
      };
    },
    // (14) multi-part: write the system, check a boundary point, give one lattice point
    (r) => {
      const c = r.int(5, 7), k = r.int(1, 3);
      const A = { a: 1, b: 1, c, op: '<=' }, B = { a: 1, b: 0, c: k, op: '>=' };
      const fig = planeI([A, B], true);
      const Pb = [k, c - k];
      return {
        q: T(`The diagram shows a shaded region. (a) Write the two inequalities that define it. (b) Is the point $(${Pb[0]}, ${Pb[1]})$, which lies on a boundary line, included in the region? (c) State one point with integer coordinates strictly inside the region.`, `Rajah menunjukkan rantau berlorek. (a) Tulis dua ketaksamaan yang menentukannya. (b) Adakah titik $(${Pb[0]}, ${Pb[1]})$, yang terletak pada satu garis sempadan, termasuk dalam rantau itu? (c) Nyatakan satu titik dengan koordinat integer yang terletak betul-betul di dalam rantau itu.`),
        fig,
        a: T(`(a) $x + y \\le ${c}$ and $x \\ge ${k}$ (b) Yes, both boundaries are solid, so it is included (c) e.g. $(${k + 1}, ${Math.max(0, c - k - 2)})$`, `(a) $x + y \\le ${c}$ dan $x \\ge ${k}$ (b) Ya, kedua-dua sempadan adalah penuh, jadi ia termasuk (c) cth. $(${k + 1}, ${Math.max(0, c - k - 2)})$`),
        sp: 'm',
      };
    },
    // (15) budget + ratio combined system (2 inequalities, structurally different from 6.1's single-inequality forms)
    (r) => {
      const [i1, i2] = r.sample(ITEMS5, 2);
      const p1 = r.int(i1.lo, i1.hi), p2 = r.int(i2.lo, i2.hi), tot = r.pick([200, 300, 400]);
      const k = r.pick([2, 3]);
      return {
        q: T(`A shop sells $x$ ${i1.en} at RM${p1} each and $y$ ${i2.en} at RM${p2} each. The total takings must not exceed RM${tot}, and the shop must sell at least ${k} times as many ${i1.en} as ${i2.en}. Write two inequalities in $x$ and $y$.`, `Sebuah kedai menjual $x$ ${i1.ms} pada harga RM${p1} sekeping dan $y$ ${i2.ms} pada harga RM${p2} sekeping. Jumlah kutipan tidak boleh melebihi RM${tot}, dan kedai itu mesti menjual sekurang-kurangnya ${k} kali ganda ${i1.ms} berbanding ${i2.ms}. Tulis dua ketaksamaan dalam $x$ dan $y$.`),
        a: T(`$${poly([[p1, 'x'], [p2, 'y']])} \\le ${tot}$ and $x \\ge ${k}y$`),
        sp: 'm',
      };
    },
    // (16) MCQ: which system of inequalities (no figure) has the origin in its region
    (r) => {
      const mk = () => { const op1 = r.pick(['>=', '<=']), op2 = r.pick(['>=', '<=']), k = r.int(1, 4), h = r.int(1, 4); return { op1, op2, k, h }; };
      const opts = r.sample([mk(), mk(), mk(), mk()], 4);
      const okIdx = opts.findIndex((o) => sat(1, 0, o.k, o.op1, 0, 0) && sat(0, 1, o.h, o.op2, 0, 0));
      need(okIdx >= 0 && opts.filter((o) => sat(1, 0, o.k, o.op1, 0, 0) && sat(0, 1, o.h, o.op2, 0, 0)).length === 1);
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) $x ${SYM[o.op1]} ${o.k}$, $y ${SYM[o.op2]} ${o.h}$`).join('<br>');
      return {
        q: T(`Which system of inequalities has the origin $(0, 0)$ in its solution region?<br>${f('en')}`, `Sistem ketaksamaan manakah yang mempunyai asalan $(0, 0)$ dalam rantau penyelesaiannya?<br>${f('ms')}`),
        a: T(`(${'ABCD'[okIdx]})`),
        sp: 's',
      };
    },
    // (17) symbolic (no figure): given a system, list which of 4 named points satisfy both
    (r) => {
      const c = r.int(5, 8), k = r.int(1, 3);
      const pts = [[0, 0], [k, 0], [c, 0], [k, c - k]];
      const good = pts.filter((p) => sat(1, 1, c, '<=', p[0], p[1]) && sat(1, 0, k, '>=', p[0], p[1])).map((p) => `$(${p[0]}, ${p[1]})$`);
      return {
        q: T(`Without drawing a diagram, determine which of the points $(0, 0)$, $(${k}, 0)$, $(${c}, 0)$, $(${k}, ${c - k})$ satisfy both $x + y \\le ${c}$ and $x \\ge ${k}$.`, `Tanpa melukis rajah, tentukan titik manakah antara $(0, 0)$, $(${k}, 0)$, $(${c}, 0)$, $(${k}, ${c - k})$ yang memenuhi kedua-dua $x + y \\le ${c}$ dan $x \\ge ${k}$.`),
        a: T(good.length ? good.join(', ') : 'None', good.length ? good.join(', ') : 'Tiada'),
        sp: 's',
      };
    },
    // (18) MCQ: which system of inequalities correctly models the scenario (large scenario bank)
    (r) => {
      const k = r.int(2, 4), c = r.int(6, 10);
      const scenarios = [
        { en: `A van carries $x$ boxes and $y$ crates; the van holds at most ${c} items in total, and at least ${k} of them must be boxes.`, ms: `Sebuah van membawa $x$ kotak dan $y$ peti; van itu memuatkan selebih-lebihnya ${c} barang secara keseluruhan, dan sekurang-kurangnya ${k} daripadanya mestilah kotak.`, sys: [`x + y \\le ${c}`, `x \\ge ${k}`] },
        { en: `A cafe sells $x$ set meals and $y$ drinks-only orders; it serves at most ${c} orders a day, and drinks-only orders are at least ${k}.`, ms: `Sebuah kafe menjual $x$ set makanan dan $y$ pesanan minuman sahaja; ia melayan selebih-lebihnya ${c} pesanan sehari, dan pesanan minuman sahaja sekurang-kurangnya ${k}.`, sys: [`x + y \\le ${c}`, `y \\ge ${k}`] },
        { en: `A car park has $x$ cars and $y$ motorcycles; there is room for at most ${c} vehicles, and there must be no more than ${k} motorcycles.`, ms: `Sebuah tempat letak kereta mempunyai $x$ kereta dan $y$ motosikal; terdapat ruang untuk selebih-lebihnya ${c} kenderaan, dan mestilah tidak lebih daripada ${k} motosikal.`, sys: [`x + y \\le ${c}`, `y \\le ${k}`] },
        { en: `A school orders $x$ footballs and $y$ basketballs; the total order is at most ${c} balls, and at least ${k} must be footballs.`, ms: `Sebuah sekolah menempah $x$ bola sepak dan $y$ bola keranjang; jumlah tempahan selebih-lebihnya ${c} biji bola, dan sekurang-kurangnya ${k} mestilah bola sepak.`, sys: [`x + y \\le ${c}`, `x \\ge ${k}`] },
        { en: `A farmer plants $x$ rows of maize and $y$ rows of beans; the field has room for at most ${c} rows, and at least ${k} rows must be maize.`, ms: `Seorang petani menanam $x$ baris jagung dan $y$ baris kacang; ladang itu mempunyai ruang untuk selebih-lebihnya ${c} baris, dan sekurang-kurangnya ${k} baris mestilah jagung.`, sys: [`x + y \\le ${c}`, `x \\ge ${k}`] },
        { en: `A charity packs $x$ food boxes and $y$ hygiene kits; volunteers can pack at most ${c} parcels a day, and at least ${k} must be food boxes.`, ms: `Sebuah badan amal membungkus $x$ kotak makanan dan $y$ kit kebersihan; sukarelawan boleh membungkus selebih-lebihnya ${c} bungkusan sehari, dan sekurang-kurangnya ${k} mestilah kotak makanan.`, sys: [`x + y \\le ${c}`, `x \\ge ${k}`] },
        { en: `A printer produces $x$ posters and $y$ flyers; it can print at most ${c} items an hour, and flyers must be at least ${k}.`, ms: `Sebuah pencetak menghasilkan $x$ poster dan $y$ risalah; ia boleh mencetak selebih-lebihnya ${c} keping sejam, dan risalah mestilah sekurang-kurangnya ${k}.`, sys: [`x + y \\le ${c}`, `y \\ge ${k}`] },
        { en: `A tuition centre enrols $x$ Form 4 students and $y$ Form 5 students; a class holds at most ${c} students, and Form 5 students must not exceed ${k}.`, ms: `Sebuah pusat tuisyen mendaftarkan $x$ pelajar Tingkatan 4 dan $y$ pelajar Tingkatan 5; sebuah kelas memuatkan selebih-lebihnya ${c} pelajar, dan pelajar Tingkatan 5 tidak boleh melebihi ${k}.`, sys: [`x + y \\le ${c}`, `y \\le ${k}`] },
        { en: `A baker packs $x$ boxes of cookies and $y$ boxes of muffins; a delivery van takes at most ${c} boxes, and cookie boxes must be at least ${k}.`, ms: `Seorang tukang roti membungkus $x$ kotak biskut dan $y$ kotak muffin; sebuah van penghantaran membawa selebih-lebihnya ${c} kotak, dan kotak biskut mestilah sekurang-kurangnya ${k}.`, sys: [`x + y \\le ${c}`, `x \\ge ${k}`] },
        { en: `A clinic vaccinates $x$ children and $y$ adults in a session; it can vaccinate at most ${c} people, and children must not exceed ${k}.`, ms: `Sebuah klinik memberi vaksin kepada $x$ kanak-kanak dan $y$ dewasa dalam satu sesi; ia boleh memvaksin selebih-lebihnya ${c} orang, dan bilangan kanak-kanak tidak boleh melebihi ${k}.`, sys: [`x + y \\le ${c}`, `x \\le ${k}`] },
        { en: `A workshop repairs $x$ bicycles and $y$ scooters in a day; at most ${c} vehicles are repaired, and bicycles must be at least ${k}.`, ms: `Sebuah bengkel membaiki $x$ basikal dan $y$ skuter dalam sehari; selebih-lebihnya ${c} kenderaan dibaiki, dan bilangan basikal mestilah sekurang-kurangnya ${k}.`, sys: [`x + y \\le ${c}`, `x \\ge ${k}`] },
        { en: `A market stall sells $x$ kg of rambutan and $y$ kg of mangoes; it stocks at most ${c} kg of fruit, and mangoes must be at least ${k} kg.`, ms: `Sebuah gerai pasar menjual $x$ kg rambutan dan $y$ kg mangga; ia menstok selebih-lebihnya ${c} kg buah-buahan, dan mangga mestilah sekurang-kurangnya ${k} kg.`, sys: [`x + y \\le ${c}`, `y \\ge ${k}`] },
        { en: `A courier delivers $x$ parcels and $y$ letters on a route; at most ${c} items are delivered, and parcels must not exceed ${k}.`, ms: `Seorang kurier menghantar $x$ bungkusan dan $y$ surat dalam satu laluan; selebih-lebihnya ${c} item dihantar, dan bilangan bungkusan tidak boleh melebihi ${k}.`, sys: [`x + y \\le ${c}`, `x \\le ${k}`] },
      ];
      const correctI = r.int(0, scenarios.length - 1);
      const correct = scenarios[correctI];
      const [s0, s1] = correct.sys;
      const correctTxt = `$${s0}$ and $${s1}$`;
      const flipSym = (s) => (s.includes('\\le') ? s.replace('\\le', '\\ge') : s.replace('\\ge', '\\le'));
      const distractors = [
        `$${flipSym(s0)}$ and $${s1}$`,
        `$${s0}$ and $${flipSym(s1)}$`,
        `$${flipSym(s0)}$ and $${flipSym(s1)}$`,
      ];
      const opts = r.shuffle([correctTxt, ...distractors]);
      const letter = 'ABCD'[opts.indexOf(correctTxt)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o}`).join('<br>');
      return {
        q: T(`${correct.en} Which system of inequalities models this?<br>${f('en')}`, `${correct.ms} Sistem ketaksamaan manakah yang memodelkan ini?<br>${f('ms')}`),
        a: T(`(${letter}) ${correctTxt}`),
        sp: 's',
      };
    },
  ];
  const g62a = [
    // (1) three inequalities bound a triangle-ish region -> write them
    (r) => retry(() => {
      const k = r.int(1, 3), h = r.int(4, 7), m = r.pick([1, 2]);
      const A = { a: 1, b: 0, c: k, op: '>=' }, B = { a: 0, b: 1, c: h, op: '<=' }, C = { a: -m, b: 1, c: 0, op: '>=' };
      const fig = planeI([A, B, C], true);
      return {
        q: T('The shaded region is bounded by three lines (all solid). Write the three inequalities that define it.', 'Kawasan berlorek dibatasi oleh tiga garis (semuanya penuh). Tulis tiga ketaksamaan yang menentukannya.'),
        fig,
        a: T(`$x \\ge ${k}$, $y \\le ${h}$, $y \\ge ${m === 1 ? '' : m}x$`),
        sp: 'm',
      };
    }),
    // (2) shade the region for 3 inequalities and state one point in it
    (r) => {
      const A = { a: 1, b: 1, c: r.int(6, 8), op: '<=' }, B = { a: 1, b: 0, c: r.int(1, 2), op: '>=' }, C = { a: 0, b: 1, c: r.int(1, 2), op: '>=' };
      return {
        q: T(`Shade the region that satisfies all of $x + y \\le ${A.c}$, $x \\ge ${B.c}$ and $y \\ge ${C.c}$, and state the coordinates of one point in the region.`, `Lorekkan rantau yang memenuhi semua $x + y \\le ${A.c}$, $x \\ge ${B.c}$ dan $y \\ge ${C.c}$, dan nyatakan koordinat satu titik dalam rantau itu.`),
        fig: S.plane({ x: [-2, 8], y: [-2, 8], scale: 20 }),
        a: T(`${planeI([A, B, C], true)} e.g. $(${B.c + 1}, ${C.c + 1})$`, `${planeI([A, B, C], true)} cth. $(${B.c + 1}, ${C.c + 1})$`),
        sp: 'xl',
      };
    },
    // (3) count lattice points for a 3-inequality region (with a sloped third line)
    (r) => retry(() => {
      const k = r.int(1, 2), h = r.int(5, 7), m = 1;
      const A = { a: 1, b: 0, c: k, op: '>=' }, B = { a: 0, b: 1, c: h, op: '<=' }, C = { a: -m, b: 1, c: 0, op: '>=' };
      const fig = planeI([A, B, C], true);
      let cnt = 0;
      for (let x = k; x <= 8; x++) for (let y = x; y <= h; y++) cnt++;
      need(cnt > 0 && cnt <= 40);
      return {
        q: T(`The shaded region satisfies $x \\ge ${k}$, $y \\le ${h}$ and $y \\ge x$ (all boundaries solid). Find the number of points with integer coordinates in the region, including the boundary.`, `Rantau berlorek memenuhi $x \\ge ${k}$, $y \\le ${h}$ dan $y \\ge x$ (semua sempadan penuh). Cari bilangan titik dengan koordinat integer dalam rantau itu, termasuk sempadan.`),
        fig,
        a: T(`${cnt}`),
        sp: 'm',
      };
    }),
    // (4) full "form, draw & shade" constraint problem from a paragraph
    (r) => {
      const [i1, i2] = r.sample(ITEMS5, 2);
      const H = r.pick([6, 7, 8]);
      const minA = r.int(1, 2);
      const A = { a: 1, b: 1, c: H, op: '<=' }, B = { a: 1, b: 0, c: minA, op: '>=' }, C = { a: 0, b: 1, c: 0, op: '>=' };
      return {
        q: T(`A shop orders $x$ boxes of ${i1.en} and $y$ boxes of ${i2.en}. The total number of boxes is at most ${H}. At least ${minA} box(es) of ${i1.en} must be ordered, and $y$ cannot be negative. Write three inequalities, then draw and shade the region that satisfies all of them.`, `Sebuah kedai menempah $x$ kotak ${i1.ms} dan $y$ kotak ${i2.ms}. Jumlah bilangan kotak selebih-lebihnya ${H}. Sekurang-kurangnya ${minA} kotak ${i1.ms} mesti ditempah, dan $y$ tidak boleh negatif. Tulis tiga ketaksamaan, kemudian lukis dan lorekkan rantau yang memenuhi kesemuanya.`),
        fig: S.plane({ x: [-2, 8], y: [-2, 8], scale: 20 }),
        a: T(`$x + y \\le ${H}$, $x \\ge ${minA}$, $y \\ge 0$; ${planeI([A, B, C], true)}`, `$x + y \\le ${H}$, $x \\ge ${minA}$, $y \\ge 0$; ${planeI([A, B, C], true)}`),
        sp: 'xl',
      };
    },
    // (5) enrichment: optimise a linear objective over the feasible region (vertex comparison)
    (r) => {
      const A = { a: 1, b: 1, c: r.int(6, 8), op: '<=' }, B = { a: 1, b: 0, c: r.int(1, 2), op: '>=' }, C = { a: 0, b: 1, c: r.int(1, 2), op: '>=' };
      const verts = [[B.c, C.c], [A.c - C.c, C.c], [B.c, A.c - B.c]];
      const vals = verts.map((p) => p[0] + p[1]);
      const maxV = Math.max(...vals), best = verts[vals.indexOf(maxV)];
      return {
        q: T(`[Enrichment] The feasible region satisfies $x + y \\le ${A.c}$, $x \\ge ${B.c}$ and $y \\ge ${C.c}$, with vertices $(${verts.map((p) => `${p[0]}, ${p[1]}`).join(')$, $(')})$. Find the maximum value of $x + y$ over this region and the vertex at which it occurs.`, `[Pengayaan] Rantau tersaur memenuhi $x + y \\le ${A.c}$, $x \\ge ${B.c}$ dan $y \\ge ${C.c}$, dengan bucu $(${verts.map((p) => `${p[0]}, ${p[1]}`).join(')$, $(')})$. Cari nilai maksimum $x + y$ dalam rantau ini dan bucu tempat ia berlaku.`),
        a: T(`Maximum $= ${maxV}$ at $(${best[0]}, ${best[1]})$`, `Maksimum $= ${maxV}$ pada $(${best[0]}, ${best[1]})$`),
        w: T('Compare $x + y$ at each vertex of the feasible region.', 'Bandingkan $x + y$ pada setiap bucu rantau tersaur.'),
        sp: 'm',
        scope: 'enrichment',
      };
    },
    // (6) enrichment: minimise a linear objective (different task word from maximise)
    (r) => {
      const A = { a: 1, b: 1, c: r.int(6, 8), op: '<=' }, B = { a: 1, b: 0, c: r.int(2, 3), op: '>=' }, C = { a: 0, b: 1, c: r.int(2, 3), op: '>=' };
      const verts = [[B.c, C.c], [A.c - C.c, C.c], [B.c, A.c - B.c]];
      const vals = verts.map((p) => 2 * p[0] + p[1]);
      const minV = Math.min(...vals), best = verts[vals.indexOf(minV)];
      return {
        q: T(`[Enrichment] The feasible region satisfies $x + y \\le ${A.c}$, $x \\ge ${B.c}$ and $y \\ge ${C.c}$, with vertices $(${verts.map((p) => `${p[0]}, ${p[1]}`).join(')$, $(')})$. Find the minimum value of $2x + y$ over this region and the vertex at which it occurs.`, `[Pengayaan] Rantau tersaur memenuhi $x + y \\le ${A.c}$, $x \\ge ${B.c}$ dan $y \\ge ${C.c}$, dengan bucu $(${verts.map((p) => `${p[0]}, ${p[1]}`).join(')$, $(')})$. Cari nilai minimum $2x + y$ dalam rantau ini dan bucu tempat ia berlaku.`),
        a: T(`Minimum $= ${minV}$ at $(${best[0]}, ${best[1]})$`, `Minimum $= ${minV}$ pada $(${best[0]}, ${best[1]})$`),
        w: T('Compare $2x + y$ at each vertex of the feasible region.', 'Bandingkan $2x + y$ pada setiap bucu rantau tersaur.'),
        sp: 'm',
        scope: 'enrichment',
      };
    },
    // (7) spot-the-error in a 3-inequality system read from a figure
    (r) => retry(() => {
      const k = r.int(1, 3), h = r.int(4, 7), m = r.pick([1, 2]);
      const A = { a: 1, b: 0, c: k, op: '>=' }, B = { a: 0, b: 1, c: h, op: '<=' }, C = { a: -m, b: 1, c: 0, op: '>=' };
      const fig = planeI([A, B, C], true);
      const flipIdx = r.pick([0, 1, 2]);
      const wrong = [`x \\ge ${k}`, `y \\le ${h}`, `y \\ge ${m === 1 ? '' : m}x`];
      wrong[flipIdx] = [`x \\le ${k}`, `y \\ge ${h}`, `y \\le ${m === 1 ? '' : m}x`][flipIdx];
      return {
        q: T(`A student writes the three inequalities for the shaded region (all boundaries solid) as $${wrong[0]}$, $${wrong[1]}$, $${wrong[2]}$. One is wrong. Identify and correct it.`, `Seorang pelajar menulis tiga ketaksamaan bagi rantau berlorek (semua sempadan penuh) sebagai $${wrong[0]}$, $${wrong[1]}$, $${wrong[2]}$. Satu daripadanya salah. Kenal pasti dan betulkan.`),
        fig,
        a: T(`The ${['first', 'second', 'third'][flipIdx]} is wrong: it should be $${[`x \\ge ${k}`, `y \\le ${h}`, `y \\ge ${m === 1 ? '' : m}x`][flipIdx]}$`, `Yang ${['pertama', 'kedua', 'ketiga'][flipIdx]} adalah salah: ia sepatutnya $${[`x \\ge ${k}`, `y \\le ${h}`, `y \\ge ${m === 1 ? '' : m}x`][flipIdx]}$`),
        sp: 'm',
      };
    }),
    // (8) multi-part word paragraph: form three inequalities, draw+shade, then count lattice points
    (r) => retry(() => {
      const H = r.pick([6, 7]), minA = 1;
      const A = { a: 1, b: 1, c: H, op: '<=' }, B = { a: 1, b: 0, c: minA, op: '>=' }, C = { a: 0, b: 1, c: minA, op: '>=' };
      const fig = planeI([A, B, C], true);
      let cnt = 0;
      for (let x = minA; x <= H - minA; x++) for (let y = minA; y <= H - x; y++) cnt++;
      const club = r.pick(SPM.bank.clubs);
      return {
        q: T(`The ${club.en} has $x$ junior members and $y$ senior members. The total membership is at most ${H}, and there must be at least ${minA} of each. (a) Write three inequalities in $x$ and $y$. (b) Draw and shade the region that satisfies all of them. (c) Find the number of possible combinations of $(x, y)$ with integer values.`, `${club.ms} mempunyai $x$ ahli junior dan $y$ ahli senior. Jumlah keahlian selebih-lebihnya ${H}, dan mesti ada sekurang-kurangnya ${minA} bagi setiap satu. (a) Tulis tiga ketaksamaan dalam $x$ dan $y$. (b) Lukis dan lorekkan rantau yang memenuhi kesemuanya. (c) Cari bilangan kombinasi $(x, y)$ yang mungkin dengan nilai integer.`),
        fig: S.plane({ x: [-2, 8], y: [-2, 8], scale: 20 }),
        a: T(`(a) $x + y \\le ${H}$, $x \\ge ${minA}$, $y \\ge ${minA}$ (b) ${fig} (c) ${cnt}`, `(a) $x + y \\le ${H}$, $x \\ge ${minA}$, $y \\ge ${minA}$ (b) ${fig} (c) ${cnt}`),
        sp: 'xl',
      };
    }),
    // (9) explain/justify: effect of changing a strict boundary to inclusive on the lattice-point count
    (r) => retry(() => {
      const c = r.int(4, 6);
      let cntStrict = 0, cntIncl = 0;
      for (let x = 0; x <= c; x++) for (let y = 0; y <= c - x; y++) { cntIncl++; if (x + y < c) cntStrict++; }
      need(cntStrict !== cntIncl);
      return {
        q: T(`Region $R_1$ satisfies $x \\ge 0$, $y \\ge 0$, $x + y < ${c}$; region $R_2$ satisfies the same first two conditions but $x + y \\le ${c}$. Explain, with a count, why $R_2$ has more integer-coordinate points than $R_1$.`, `Rantau $R_1$ memenuhi $x \\ge 0$, $y \\ge 0$, $x + y < ${c}$; rantau $R_2$ memenuhi dua syarat pertama yang sama tetapi $x + y \\le ${c}$. Terangkan, dengan pengiraan, mengapa $R_2$ mempunyai lebih banyak titik berkoordinat integer daripada $R_1$.`),
        a: T(`$R_1$ has ${cntStrict} points, $R_2$ has ${cntIncl} points: $R_2$ additionally includes the ${cntIncl - cntStrict} points on the line $x + y = ${c}$, which the strict inequality in $R_1$ excludes.`, `$R_1$ mempunyai ${cntStrict} titik, $R_2$ mempunyai ${cntIncl} titik: $R_2$ turut merangkumi ${cntIncl - cntStrict} titik pada garis $x + y = ${c}$, yang tidak termasuk dalam $R_1$ kerana ketaksamaan ketat.`),
        sp: 'm',
      };
    }),
    // (10) multi-part: form a 3-inequality system from a paragraph with a ratio constraint, then test two points
    (r) => {
      const [a1, a2] = r.sample(SPM.bank.animals, 2);
      const feed = r.int(2, 4), space = r.pick([30, 40, 50]);
      const P1 = [r.int(1, 5), r.int(6, 10)], P2 = [r.int(6, 10), r.int(1, 3)];
      const v1 = feed * P1[0] + P1[1], v2 = feed * P2[0] + P2[1];
      const ok1 = v1 <= space && P1[1] >= 2 * P1[0], ok2 = v2 <= space && P2[1] >= 2 * P2[0];
      const justify = (P, v, ok, lang) => {
        const feedOk = v <= space, ratioOk = P[1] >= 2 * P[0];
        const parts = [`${feedOk ? (lang === 'en' ? 'feed' : 'makanan') : (lang === 'en' ? 'feed FAILS' : 'makanan GAGAL')}: $${v} ${feedOk ? '\\le' : '>'} ${space}$`, `${ratioOk ? (lang === 'en' ? 'ratio' : 'nisbah') : (lang === 'en' ? 'ratio FAILS' : 'nisbah GAGAL')}: $${P[1]} ${ratioOk ? '\\ge' : '<'} ${2 * P[0]}$`];
        return `${ok ? (lang === 'en' ? 'Yes' : 'Ya') : (lang === 'en' ? 'No' : 'Tidak')} (${parts.join(', ')})`;
      };
      return {
        q: T(`A farm keeps $x$ ${a1.en} and $y$ ${a2.en}, with $y \\ge 2x$. Each ${a1.en.replace(/s$/, '')} needs ${feed} kg of feed a day and each ${a2.en.replace(/s$/, '')} needs 1 kg; the daily supply is at most ${space} kg. (a) Write three inequalities (including non-negativity). (b) Could the farm have $(${P1[0]}, ${P1[1]})$? (c) Could it have $(${P2[0]}, ${P2[1]})$? Justify both.`, `Sebuah ladang menternak $x$ ekor ${a1.ms} dan $y$ ekor ${a2.ms}, dengan $y \\ge 2x$. Setiap ekor ${a1.ms} memerlukan ${feed} kg makanan sehari dan setiap ekor ${a2.ms} memerlukan 1 kg; bekalan harian selebih-lebihnya ${space} kg. (a) Tulis tiga ketaksamaan (termasuk bukan-negatif). (b) Bolehkah ladang itu mempunyai $(${P1[0]}, ${P1[1]})$? (c) Bolehkah ia mempunyai $(${P2[0]}, ${P2[1]})$? Wajarkan kedua-duanya.`),
        a: T(`(a) $${feed}x + y \\le ${space}$, $y \\ge 2x$, $x, y \\ge 0$ (b) ${justify(P1, v1, ok1, 'en')} (c) ${justify(P2, v2, ok2, 'en')}`, `(a) $${feed}x + y \\le ${space}$, $y \\ge 2x$, $x, y \\ge 0$ (b) ${justify(P1, v1, ok1, 'ms')} (c) ${justify(P2, v2, ok2, 'ms')}`),
        sp: 'l',
      };
    },
    // (11) MCQ: which 3-part scenario matches a displayed system of three inequalities (large scenario bank)
    (r) => {
      const k = r.int(1, 3), c = r.int(6, 9);
      const scenarios = [
        { en: `A stall sells $x$ kuih and $y$ drinks; it makes at most ${c} items, at least ${k} must be kuih, and $y$ cannot be negative.`, ms: `Sebuah gerai menjual $x$ kuih dan $y$ minuman; ia menghasilkan selebih-lebihnya ${c} item, sekurang-kurangnya ${k} mestilah kuih, dan $y$ tidak boleh negatif.`, sys: [`x + y \\le ${c}`, `x \\ge ${k}`, `y \\ge 0`] },
        { en: `A library shelves $x$ novels and $y$ magazines; the shelf holds at most ${c} items, at least ${k} must be novels, and $y$ cannot be negative.`, ms: `Sebuah perpustakaan menyusun $x$ novel dan $y$ majalah di rak; rak itu memuatkan selebih-lebihnya ${c} item, sekurang-kurangnya ${k} mestilah novel, dan $y$ tidak boleh negatif.`, sys: [`x + y \\le ${c}`, `x \\ge ${k}`, `y \\ge 0`] },
        { en: `A clinic sees $x$ walk-in patients and $y$ appointment patients; it sees at most ${c} patients a day, at least ${k} must be by appointment, and $x$ cannot be negative.`, ms: `Sebuah klinik melayan $x$ pesakit tanpa temu janji dan $y$ pesakit bertemu janji; ia melayan selebih-lebihnya ${c} pesakit sehari, sekurang-kurangnya ${k} mestilah bertemu janji, dan $x$ tidak boleh negatif.`, sys: [`x + y \\le ${c}`, `y \\ge ${k}`, `x \\ge 0`] },
        { en: `A tailor makes $x$ shirts and $y$ trousers; at most ${c} pieces are made a week, at least ${k} must be shirts, and $y$ cannot be negative.`, ms: `Seorang tukang jahit membuat $x$ baju dan $y$ seluar; selebih-lebihnya ${c} keping dibuat seminggu, sekurang-kurangnya ${k} mestilah baju, dan $y$ tidak boleh negatif.`, sys: [`x + y \\le ${c}`, `x \\ge ${k}`, `y \\ge 0`] },
        { en: `A canteen bakes $x$ curry puffs and $y$ muffins; the oven fits at most ${c} trays, at least ${k} trays must be curry puffs, and $y$ cannot be negative.`, ms: `Sebuah kantin membakar $x$ dulang karipap dan $y$ dulang muffin; ketuhar itu memuatkan selebih-lebihnya ${c} dulang, sekurang-kurangnya ${k} dulang mestilah karipap, dan $y$ tidak boleh negatif.`, sys: [`x + y \\le ${c}`, `x \\ge ${k}`, `y \\ge 0`] },
        { en: `A garage services $x$ cars and $y$ motorcycles a day; it can handle at most ${c} vehicles, at least ${k} must be cars, and $y$ cannot be negative.`, ms: `Sebuah bengkel membaiki $x$ kereta dan $y$ motosikal sehari; ia boleh mengendalikan selebih-lebihnya ${c} kenderaan, sekurang-kurangnya ${k} mestilah kereta, dan $y$ tidak boleh negatif.`, sys: [`x + y \\le ${c}`, `x \\ge ${k}`, `y \\ge 0`] },
        { en: `A studio records $x$ songs and $y$ jingles in a session; at most ${c} tracks are recorded, at least ${k} must be songs, and $y$ cannot be negative.`, ms: `Sebuah studio merakam $x$ lagu dan $y$ iklan pendek dalam satu sesi; selebih-lebihnya ${c} trek dirakam, sekurang-kurangnya ${k} mestilah lagu, dan $y$ tidak boleh negatif.`, sys: [`x + y \\le ${c}`, `x \\ge ${k}`, `y \\ge 0`] },
      ];
      const correctI = r.int(0, scenarios.length - 1);
      const correct = scenarios[correctI];
      const [s0, s1, s2] = correct.sys;
      const correctTxt = `$${s0}$, $${s1}$, $${s2}$`;
      const flipSym = (s) => (s.includes('\\le') ? s.replace('\\le', '\\ge') : s.includes('\\ge') ? s.replace('\\ge', '\\le') : s);
      const distractors = [
        `$${flipSym(s0)}$, $${s1}$, $${s2}$`,
        `$${s0}$, $${flipSym(s1)}$, $${s2}$`,
        `$${flipSym(s0)}$, $${flipSym(s1)}$, $${s2}$`,
      ];
      const opts = r.shuffle([correctTxt, ...distractors]);
      const letter = 'ABCD'[opts.indexOf(correctTxt)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o}`).join('<br>');
      return {
        q: T(`${correct.en} Which system of inequalities models this?<br>${f('en')}`, `${correct.ms} Sistem ketaksamaan manakah yang memodelkan ini?<br>${f('ms')}`),
        a: T(`(${letter}) ${correctTxt}`),
        sp: 'm',
      };
    },
  ];
  SPM.extend('F4-6.2', { e: g62e, m: g62m, a: g62a });

  /* =============================================================================== 7.1 / 7.2 */
  const distFig = (pts, xmax, ymax, lang, extra) => S.graph({ w: 320, h: 210, xr: [0, xmax, xmax > 8 ? 2 : 1], yr: [0, ymax, ymax > 60 ? 20 : 10], xlabel: lang === 'en' ? 'Time (h)' : 'Masa (j)', ylabel: lang === 'en' ? 'Distance (km)' : 'Jarak (km)', series: [{ pts, type: 'line', dotsToo: true }], extra });
  const distFigT = (pts, xmax, ymax, extra) => T(distFig(pts, xmax, ymax, 'en', extra), distFig(pts, xmax, ymax, 'ms', extra));
  const speedFig = (pts, xmax, ymax, lang, extra) => S.graph({ w: 320, h: 210, xr: [0, xmax, xmax > 12 ? 2 : 1], yr: [0, ymax, ymax > 30 ? 10 : 5], xlabel: lang === 'en' ? 'Time (s)' : 'Masa (s)', ylabel: lang === 'en' ? 'Speed (m/s)' : 'Laju (m/s)', series: [{ pts, type: 'line', dotsToo: true }], extra });
  const speedFigT = (pts, xmax, ymax, extra) => T(speedFig(pts, xmax, ymax, 'en', extra), speedFig(pts, xmax, ymax, 'ms', extra));

  const g71e = [
    // (1) MCQ: which description matches a basic distance-time graph fact (conceptual bank)
    (r) => {
      const bank = [
        { en: 'a horizontal segment on a distance-time graph', ms: 'segmen mendatar pada graf jarak-masa', ans: T('the object is stationary (at rest)', 'objek itu pegun (dalam keadaan rehat)') },
        { en: 'a segment with positive gradient on a distance-time graph', ms: 'segmen dengan kecerunan positif pada graf jarak-masa', ans: T('the object is moving away from the reference point', 'objek itu bergerak menjauhi titik rujukan') },
        { en: 'a segment with negative gradient on a distance-time graph', ms: 'segmen dengan kecerunan negatif pada graf jarak-masa', ans: T('the object is moving toward the reference point', 'objek itu bergerak menghampiri titik rujukan') },
        { en: 'a graph that returns to a distance of 0 at some time', ms: 'graf yang kembali kepada jarak 0 pada suatu masa', ans: T('the object is back at the reference point at that time', 'objek itu kembali ke titik rujukan pada masa itu') },
        { en: 'a graph that starts above 0 at time $t = 0$', ms: 'graf yang bermula di atas 0 pada masa $t = 0$', ans: T('the object already started some distance from the reference point', 'objek itu sudah bermula pada suatu jarak dari titik rujukan') },
        { en: 'the label on the vertical axis of a distance-time graph', ms: 'label pada paksi menegak graf jarak-masa', ans: T('distance from the reference point', 'jarak dari titik rujukan') },
        { en: 'the label on the horizontal axis of a distance-time graph', ms: 'label pada paksi mendatar graf jarak-masa', ans: T('time elapsed', 'masa yang berlalu') },
        { en: 'the height of a point on a distance-time graph', ms: 'ketinggian satu titik pada graf jarak-masa', ans: T('the distance from the reference point at that instant', 'jarak dari titik rujukan pada saat itu') },
        { en: 'the gradient of a straight segment on a distance-time graph', ms: 'kecerunan segmen lurus pada graf jarak-masa', ans: T('the speed during that segment (its magnitude)', 'laju sepanjang segmen itu (magnitudnya)') },
        { en: 'a distance-time graph where the object never returns to a distance of 0', ms: 'graf jarak-masa di mana objek tidak pernah kembali ke jarak 0', ans: T('the object never returns to the reference point during the time shown', 'objek itu tidak pernah kembali ke titik rujukan sepanjang masa yang ditunjukkan') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = r.sample(bank.filter((_, i) => i !== ci), 3);
      const opts = r.shuffle([correct, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o.ans[lang]}`).join('<br>');
      return {
        q: T(`What does ${correct.en} represent?<br>${f('en')}`, `Apakah maksud ${correct.ms}?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 's',
      };
    },
    // (2) compute speed of a single segment from a figure (direct)
    (r) => {
      const t = r.int(2, 5), v = r.pick([10, 15, 20, 25, 30, 40]);
      const pts = [[0, 0], [t, t * v]];
      const fig = distFigT(pts, t + 1, t * v + 20);
      return {
        q: T('The graph shows the journey of a cyclist from home. Find the speed during the journey.', 'Graf menunjukkan perjalanan seorang penunggang basikal dari rumah. Cari laju sepanjang perjalanan itu.'),
        fig,
        a: T(`${v} km/h`, `${v} km/j`),
        w: T(`$\\dfrac{${t * v}}{${t}}$`),
        sp: 's',
      };
    },
    // (3) read a labelled value directly from the graph (distance at a given time, or time at a given distance)
    (r) => {
      const t = r.int(3, 6), v = r.pick([10, 20, 30]);
      const askTime = r.chance(0.5);
      const pts = [[0, 0], [t, t * v]];
      const fig = distFigT(pts, t + 1, t * v + 20);
      return {
        q: askTime
          ? T(`The graph shows a journey. What is the total distance travelled by time $t = ${t}$ h?`, `Graf menunjukkan satu perjalanan. Berapakah jumlah jarak yang dilalui menjelang masa $t = ${t}$ j?`)
          : T(`The graph shows a journey. At what time is the distance travelled equal to ${t * v} km?`, `Graf menunjukkan satu perjalanan. Pada masa manakah jarak yang dilalui bersamaan ${t * v} km?`),
        fig,
        a: askTime ? T(`${t * v} km`) : T(`$t = ${t}$ h`, `$t = ${t}$ j`),
        sp: 's',
      };
    },
    // (4) true/false: stationary duration reading from a flat segment
    (r) => {
      const t1 = r.int(1, 3), rest = r.int(1, 3), d = r.pick([20, 30, 40]);
      const claimed = r.chance(0.5) ? rest : rest + r.pick([1, -1]);
      const pts = [[0, 0], [t1, d], [t1 + rest, d]];
      const fig = distFigT(pts, t1 + rest + 1, d + 15);
      const ok = claimed === rest;
      return {
        q: T(`The graph shows a journey with a stop. True or false: the object is stationary for ${claimed} h.`, `Graf menunjukkan satu perjalanan dengan satu perhentian. Benar atau palsu: objek itu pegun selama ${claimed} j.`),
        fig,
        a: T(`${ok ? 'True' : 'False'}, it is stationary for ${rest} h`, `${ok ? 'Benar' : 'Palsu'}, ia pegun selama ${rest} j`),
        sp: 's',
      };
    },
  ];

  const g71m = [
    // (1) average speed for the whole journey (the "total distance / total time, including rest" trap)
    (r) => {
      const v1 = r.pick([20, 30, 40]), t1 = r.int(1, 2), rest = r.int(1, 2), t3 = r.int(1, 2);
      const d = v1 * t1;
      const back = r.pick([15, 20, 25, 30]);
      const t3b = d / back;
      need(Number.isInteger(t3b * 4)); // keep it reasonably clean
      const pts = [[0, 0], [t1, d], [t1 + rest, d], [t1 + rest + t3b, 0]];
      const Ttot = t1 + rest + t3b;
      const totalDist = d + d; // out + back
      const avg = totalDist / Ttot;
      const fig = distFigT(pts, Ttot + 0.5, d + 15);
      return {
        q: T('Using the distance-time graph of the whole journey (out, rest, and back), find the average speed for the whole journey. Remember to include the resting time in the total time.', 'Menggunakan graf jarak-masa bagi keseluruhan perjalanan (pergi, rehat, dan pulang), cari laju purata bagi keseluruhan perjalanan. Ingat untuk memasukkan masa berehat dalam jumlah masa.'),
        fig,
        a: T(`${n(round(avg, 2))} km/h`, `${n(round(avg, 2))} km/j`),
        w: T(`$\\dfrac{${d} + ${d}}{${n(round(Ttot, 2))}}$`),
        sp: 'm',
      };
    },
    // (3) spot-the-error: a student averaged the two stage speeds instead of total distance / total time
    (r) => {
      const v1 = r.pick([20, 40]), v2 = r.pick([30, 60]), t1 = r.int(1, 2), t2 = ({ 20: 40 / 20, 40: 80 / 40 })[v1] || 1;
      const d = v1 * t1;
      const t2b = d / v2;
      const Ttot = t1 + t2b;
      const avgCorrect = (2 * d) / Ttot;
      const avgWrong = (v1 + v2) / 2;
      const pts = [[0, 0], [t1, d], [t1 + t2b, 0]];
      const fig = distFigT(pts, Ttot + 0.5, d + 10);
      return {
        q: T(`A student finds the average speed for this out-and-back journey by computing $\\dfrac{${v1} + ${v2}}{2} = ${n(avgWrong)}$ km/h. Explain the mistake and find the correct average speed.`, `Seorang pelajar mencari laju purata bagi perjalanan pergi-balik ini dengan mengira $\\dfrac{${v1} + ${v2}}{2} = ${n(avgWrong)}$ km/j. Terangkan kesilapan itu dan cari laju purata yang betul.`),
        fig,
        a: T(`The mistake: averaging the two speeds ignores that the two stages take different times. Correct: total distance $\\div$ total time $= \\dfrac{${2 * d}}{${n(round(Ttot, 2))}} = ${n(round(avgCorrect, 2))}$ km/h`, `Kesilapan: purata dua laju itu mengabaikan bahawa kedua-dua peringkat mengambil masa yang berbeza. Betul: jumlah jarak $\\div$ jumlah masa $= \\dfrac{${2 * d}}{${n(round(Ttot, 2))}} = ${n(round(avgCorrect, 2))}$ km/j`),
        sp: 'm',
      };
    },
    // (4) true/false: correcting the "negative gradient = negative speed" misconception
    (r) => {
      const v = r.pick([20, 30, 40]), t = r.int(2, 4);
      const d0 = v * t;
      const pts = [[0, d0], [t, 0]];
      const fig = distFigT(pts, t + 1, d0 + 15);
      return {
        q: T(`The graph shows an object moving toward the reference point (negative gradient). A student says its speed is $-${v}$ km/h. True or false, with a correction if needed.`, `Graf menunjukkan objek bergerak menghampiri titik rujukan (kecerunan negatif). Seorang pelajar berkata lajunya ialah $-${v}$ km/j. Benar atau palsu, dengan pembetulan jika perlu.`),
        fig,
        a: T(`False: speed is the magnitude of the gradient, so the speed is ${v} km/h (not negative); the negative sign only shows the direction is toward the reference point.`, `Palsu: laju ialah magnitud kecerunan, jadi lajunya ialah ${v} km/j (bukan negatif); tanda negatif hanya menunjukkan arah menghampiri titik rujukan.`),
        sp: 'm',
      };
    },
    // (5) work backwards: find an unknown stage duration/speed from a given average speed or total distance
    (r) => {
      const v1 = r.pick([20, 30]), t1 = r.int(2, 3), avg = r.pick([18, 24, 27]);
      need(avg < v1);
      const d = v1 * t1;
      // total distance D, total time unknown t2 such that (d + d) / (t1+t2) = avg  =>  t2 = 2d/avg - t1
      const t2 = round((2 * d) / avg - t1, 2);
      need(t2 > 0.2 && t2 < 8);
      const backSpeed = round(d / t2, 2);
      return {
        q: T(`A cyclist rides out at ${v1} km/h for ${t1} h, then returns by the same route. The average speed for the whole journey (no rest) is ${avg} km/h. Find the time taken for the return trip.`, `Seorang penunggang basikal menunggang keluar pada ${v1} km/j selama ${t1} j, kemudian pulang melalui laluan yang sama. Laju purata bagi keseluruhan perjalanan (tanpa rehat) ialah ${avg} km/j. Cari masa yang diambil untuk perjalanan pulang.`),
        a: T(`${n(t2)} h (return speed $\\approx ${n(backSpeed)}$ km/h)`, `${n(t2)} j (laju pulang $\\approx ${n(backSpeed)}$ km/j)`),
        w: T(`$\\dfrac{${d} + ${d}}{${t1} + t} = ${avg}$`),
        sp: 'm',
      };
    },
    // (6) distance apart of two travellers at a given time (two lines on one graph)
    (r) => {
      const v1 = r.pick([20, 30]), v2 = r.pick([40, 50]), t = r.int(1, 2);
      const pts1 = [[0, 0], [t + 1, v1 * (t + 1)]], pts2 = [[0, 0], [t + 1, v2 * (t + 1)]];
      const f = (lang) => S.graph({ w: 320, h: 210, xr: [0, t + 1, 1], yr: [0, v2 * (t + 1) + 10, 20], xlabel: lang === 'en' ? 'Time (h)' : 'Masa (j)', ylabel: lang === 'en' ? 'Distance (km)' : 'Jarak (km)', series: [{ pts: pts1, type: 'line' }, { pts: pts2, type: 'line', dash: true }] });
      const gap = (v2 - v1) * t;
      return {
        q: T(`Two cyclists $A$ (solid) and $B$ (dashed) leave the same point at the same time, travelling in the same direction along the same road at constant speeds. Find how far apart they are at $t = ${t}$ h.`, `Dua penunggang basikal $A$ (garis penuh) dan $B$ (putus-putus) bertolak dari titik yang sama pada masa yang sama, bergerak dalam arah yang sama di sepanjang jalan yang sama pada laju malar. Cari jarak antara mereka pada $t = ${t}$ j.`),
        fig: T(f('en'), f('ms')),
        a: T(`${gap} km`),
        w: T(`$(${v2} - ${v1}) \\times ${t}$`),
        sp: 'm',
      };
    },
    // (7) compare two stages: which was faster and by how much
    (r) => {
      const v1 = r.pick([20, 25, 30]), v2 = r.pick([35, 40, 45]), t1 = r.int(1, 2), t2 = r.int(1, 2);
      const d1 = v1 * t1, d2 = v2 * t2;
      const pts = [[0, 0], [t1, d1], [t1 + t2, d1 + d2]];
      const fig = distFigT(pts, t1 + t2 + 0.5, d1 + d2 + 15);
      return {
        q: T('The graph shows a two-stage journey. Which stage was faster, and by how much?', 'Graf menunjukkan perjalanan dua peringkat. Peringkat manakah yang lebih laju, dan berapa banyak lebih laju?'),
        fig,
        a: T(`Stage ${v2 > v1 ? 2 : 1} was faster, by ${Math.abs(v2 - v1)} km/h`, `Peringkat ${v2 > v1 ? 2 : 1} lebih laju, sebanyak ${Math.abs(v2 - v1)} km/j`),
        sp: 'm',
      };
    },
    // (8) MCQ conceptual bank: comparative / reasoning facts (steeper=faster, intersecting graphs meet, curves)
    (r) => {
      const bank = [
        { en: 'one straight segment is steeper than another on the same distance-time graph', ms: 'satu segmen garis lurus lebih curam daripada satu lagi pada graf jarak-masa yang sama', ans: T('the steeper segment represents the greater speed', 'segmen yang lebih curam mewakili laju yang lebih besar') },
        { en: 'two objects\' distance-time graphs cross at a point', ms: 'graf jarak-masa dua objek bersilang pada satu titik', ans: T('the two objects are at the same distance from the reference point at that time (they meet)', 'kedua-dua objek berada pada jarak yang sama dari titik rujukan pada masa itu (mereka bertemu)') },
        { en: 'a curved segment bends upward while the graph is rising', ms: 'segmen melengkung mencerun ke atas semasa graf semakin meningkat', ans: T('the object is speeding up (only a qualitative conclusion, without a stated method for an exact value)', 'objek itu semakin laju (hanya kesimpulan kualitatif, tanpa kaedah yang dinyatakan untuk nilai tepat)') },
        { en: 'a curved segment bends downward while the graph is rising', ms: 'segmen melengkung mencerun ke bawah semasa graf semakin meningkat', ans: T('the object is slowing down, though still moving away (only a qualitative conclusion)', 'objek itu semakin perlahan, walaupun masih bergerak menjauh (hanya kesimpulan kualitatif)') },
        { en: 'a distance-time graph has a vertical segment', ms: 'graf jarak-masa mempunyai segmen menegak', ans: T('this is not physically possible, since it would mean an infinite speed', 'ini tidak mungkin berlaku secara fizikal, kerana ia bermaksud laju yang tak terhingga') },
        { en: 'the average speed of a whole journey is computed by taking the mean of the stage speeds', ms: 'laju purata bagi keseluruhan perjalanan dikira dengan mengambil min laju setiap peringkat', ans: T('this is generally wrong, since the stages may take different times; the correct method is total distance divided by total time', 'ini secara amnya salah, kerana peringkat-peringkat itu mungkin mengambil masa yang berbeza; kaedah yang betul ialah jumlah jarak dibahagi jumlah masa') },
        { en: 'a resting stage is left out of the total time when computing average speed', ms: 'peringkat rehat ditinggalkan daripada jumlah masa semasa mengira laju purata', ans: T('this is wrong; the resting time must be included in the total elapsed time', 'ini salah; masa rehat mesti dimasukkan dalam jumlah masa yang berlalu') },
        { en: 'two objects\' distance-time graphs never cross', ms: 'graf jarak-masa dua objek tidak pernah bersilang', ans: T('the two objects never meet during the time shown', 'kedua-dua objek itu tidak pernah bertemu sepanjang masa yang ditunjukkan') },
        { en: 'a distance-time graph segment has a gradient of exactly 0 for part of a curve', ms: 'segmen graf jarak-masa mempunyai kecerunan tepat 0 pada sebahagian lengkung', ans: T('the object is momentarily stationary at that instant', 'objek itu pegun seketika pada saat itu') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = r.sample(bank.filter((_, i) => i !== ci), 3);
      const opts = r.shuffle([correct, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o.ans[lang]}`).join('<br>');
      return {
        q: T(`If ${correct.en}, what can be concluded?<br>${f('en')}`, `Jika ${correct.ms}, apakah yang boleh disimpulkan?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 'm',
      };
    },
  ];

  const g71a = [
    // (1) two travellers moving toward each other: find when the distance between them equals a given value
    (r) => {
      const v1 = r.pick([30, 40]), v2 = r.pick([20, 50]), D = r.pick([200, 240, 300]);
      const gap = r.pick([20, 40, 60]);
      need(gap < D);
      const t = (D - gap) / (v1 + v2);
      const ptsA = [[0, 0], [D / v1, D]], ptsB = [[0, D], [D / v2, 0]];
      const xmax = Math.max(D / v1, D / v2);
      const f = (lang) => S.graph({ w: 330, h: 220, xr: [0, Math.ceil(xmax) + 1, 1], yr: [0, D + 20, 40], xlabel: lang === 'en' ? 'Time (h)' : 'Masa (j)', ylabel: lang === 'en' ? 'Distance from $P$ (km)' : 'Jarak dari $P$ (km)', series: [{ pts: ptsA, type: 'line' }, { pts: ptsB, type: 'line', dash: true }] });
      return {
        q: T(`Towns $P$ and $Q$ are ${D} km apart. Car $A$ (solid) leaves $P$ for $Q$ at ${v1} km/h; car $B$ (dashed) leaves $Q$ for $P$ at the same time, at ${v2} km/h. Find the time at which the distance between them is ${gap} km.`, `Bandar $P$ dan $Q$ berjarak ${D} km. Kereta $A$ (garis penuh) bertolak dari $P$ ke $Q$ pada ${v1} km/j; kereta $B$ (putus-putus) bertolak dari $Q$ ke $P$ pada masa yang sama, pada ${v2} km/j. Cari masa apabila jarak antara mereka ialah ${gap} km.`),
        fig: T(f('en'), f('ms')),
        a: T(`$t = ${n(round(t, 2))}$ h`, `$t = ${n(round(t, 2))}$ j`),
        w: T(`$${v1}t + ${v2}t = ${D} - ${gap}$`),
        sp: 'l',
      };
    },
    // (3) explain/justify: what can (and cannot) be concluded from a curved segment
    (r) => {
      const t1 = r.int(1, 2), t2 = t1 + r.int(2, 3);
      const f = (lang) => S.graph({ w: 320, h: 210, xr: [0, t2 + 1, 1], yr: [0, 60, 20], xlabel: lang === 'en' ? 'Time (h)' : 'Masa (j)', ylabel: lang === 'en' ? 'Distance (km)' : 'Jarak (km)', series: [{ pts: [[0, 0], [t1, 15], [t2, 50]], type: 'line' }], extra: (m) => S.path(`M${m.sx(t1)},${m.sy(15)} Q${m.sx((t1 + t2) / 2)},${m.sy(50)} ${m.sx(t2)},${m.sy(50)}`, { w: 1.6 }) });
      return {
        q: T(`The graph shows a straight segment from $t = 0$ to $t = ${t1}$ h followed by a curved segment from $t = ${t1}$ to $t = ${t2}$ h that bends upward. (a) Find the speed for the straight segment. (b) Can you find an exact numerical speed at $t = ${(t1 + t2) / 2}$ h on the curved part? Explain what can be concluded about the motion instead.`, `Graf menunjukkan segmen lurus dari $t = 0$ hingga $t = ${t1}$ j diikuti oleh segmen melengkung dari $t = ${t1}$ hingga $t = ${t2}$ j yang mencerun ke atas. (a) Cari laju bagi segmen lurus. (b) Bolehkah anda mencari laju berangka yang tepat pada $t = ${(t1 + t2) / 2}$ j pada bahagian melengkung itu? Terangkan apa yang boleh disimpulkan tentang gerakan itu sebaliknya.`),
        fig: T(f('en'), f('ms')),
        a: T(`(a) ${n(round(15 / t1, 2))} km/h (b) No exact value can be found without a stated method (e.g. a tangent); since the curve bends upward while rising, only the qualitative conclusion that the speed is increasing can be made.`, `(a) ${n(round(15 / t1, 2))} km/j (b) Tiada nilai tepat dapat dicari tanpa kaedah yang dinyatakan (cth. tangen); memandangkan lengkung itu mencerun ke atas semasa meningkat, hanya kesimpulan kualitatif bahawa laju semakin bertambah dapat dibuat.`),
        sp: 'l',
      };
    },
    // (4) multi-part: construct key values from a described journey, then answer
    (r) => {
      const v1 = r.pick([15, 20, 25]), t1 = r.int(2, 3), rest = 1, v2 = r.pick([25, 30, 35]);
      const d = v1 * t1;
      const t3 = round(d / v2, 2);
      const Ttot = round(t1 + rest + t3, 2);
      const avg = round((2 * d) / Ttot, 2);
      return {
        q: T(`Aiman cycles away from home at ${v1} km/h for ${t1} h, rests for ${rest} h, then cycles straight back at ${v2} km/h. (a) Sketch the distance-time graph, marking all key values. (b) Find the total time for the whole journey. (c) Find the average speed for the whole journey.`, `Aiman berbasikal menjauhi rumah pada ${v1} km/j selama ${t1} j, berehat selama ${rest} j, kemudian berbasikal terus pulang pada ${v2} km/j. (a) Lakarkan graf jarak-masa, tandakan semua nilai penting. (b) Cari jumlah masa bagi keseluruhan perjalanan. (c) Cari laju purata bagi keseluruhan perjalanan.`),
        a: T(`(a) Key points: $(0,0)$, $(${t1},${d})$, $(${t1 + rest},${d})$, $(${n(Ttot)},0)$ (b) ${n(Ttot)} h (c) ${n(avg)} km/h`, `(a) Titik penting: $(0,0)$, $(${t1},${d})$, $(${t1 + rest},${d})$, $(${n(Ttot)},0)$ (b) ${n(Ttot)} j (c) ${n(avg)} km/j`),
        sp: 'l',
      };
    },
    // (5) three travellers / three-stage: multi-part combining speed, stationary time and average speed with a scenario bank
    (r) => {
      const scen = r.pick([
        { en: 'delivers parcels around town and returns to the depot', ms: 'menghantar bungkusan di sekitar bandar dan kembali ke depoh', subj: 'A rider', subjMs: 'Seorang penunggang' },
        { en: 'walks to school, waits for a friend, and walks back home', ms: 'berjalan ke sekolah, menunggu seorang kawan, dan berjalan pulang ke rumah', subj: 'A student', subjMs: 'Seorang pelajar' },
        { en: 'drives to a client, waits during the meeting, and drives back to the office', ms: 'memandu ke tempat pelanggan, menunggu semasa mesyuarat, dan memandu pulang ke pejabat', subj: 'A salesperson', subjMs: 'Seorang jurujual' },
      ]);
      const v1 = r.pick([12, 15, 18]), t1 = r.int(1, 2), rest = r.int(1, 2), v2 = r.pick([10, 12, 15]);
      const d = v1 * t1;
      const t3 = round(d / v2, 2);
      const Ttot = round(t1 + rest + t3, 2);
      const avg = round((2 * d) / Ttot, 2);
      const fig = distFigT([[0, 0], [t1, d], [t1 + rest, d], [Ttot, 0]], Ttot + 0.5, d + 10);
      return {
        q: T(`${scen.subj} ${scen.en}, travelling at ${v1} km/h out and ${v2} km/h back, with a wait of ${rest} h. (a) Find the distance to the farthest point. (b) Find the total time for the whole trip. (c) Find the average speed for the whole trip.`, `${scen.subjMs} ${scen.ms}, bergerak pada ${v1} km/j semasa pergi dan ${v2} km/j semasa pulang, dengan tempoh menunggu selama ${rest} j. (a) Cari jarak ke titik paling jauh. (b) Cari jumlah masa bagi keseluruhan perjalanan. (c) Cari laju purata bagi keseluruhan perjalanan.`),
        fig,
        a: T(`(a) ${d} km (b) ${n(Ttot)} h (c) ${n(avg)} km/h`, `(a) ${d} km (b) ${n(Ttot)} j (c) ${n(avg)} km/j`),
        sp: 'l',
      };
    },
    // (6) error-spot + correction on a two-traveller meeting problem (combines error-spotting with the harder skill)
    (r) => {
      const v1 = r.pick([30, 40]), v2 = r.pick([50, 60]), delay = r.int(1, 2);
      const tCorrect = (v2 * delay) / (v2 - v1);
      const tWrong = delay; // common error: student assumes they meet exactly `delay` hours after B starts
      const dWrong = v1 * (delay + tWrong);
      const dCorrect = v1 * tCorrect;
      return {
        q: T(`Car $A$ leaves town $P$ at $t = 0$ h at ${v1} km/h; car $B$ leaves $P$ along the same road ${delay} h later at ${v2} km/h. A student claims they meet ${tWrong} h after $B$ leaves. Explain why this reasoning is incomplete and find the correct meeting time (measured from when $A$ leaves).`, `Kereta $A$ bertolak dari bandar $P$ pada $t = 0$ j dengan ${v1} km/j; kereta $B$ bertolak dari $P$ di jalan yang sama ${delay} j kemudian dengan ${v2} km/j. Seorang pelajar mendakwa mereka bertemu ${tWrong} j selepas $B$ bertolak. Terangkan mengapa penaakulan ini tidak lengkap dan cari masa pertemuan yang betul (diukur dari saat $A$ bertolak).`),
        a: T(`The claim has no justification connecting it to the actual speeds; solving $${v1}t = ${v2}(t - ${delay})$ gives $t = ${n(round(tCorrect, 2))}$ h from when $A$ leaves.`, `Dakwaan itu tiada justifikasi yang mengaitkannya dengan laju sebenar; menyelesaikan $${v1}t = ${v2}(t - ${delay})$ memberikan $t = ${n(round(tCorrect, 2))}$ j dari saat $A$ bertolak.`),
        sp: 'l',
      };
    },
    // (7) MCQ: harder conceptual/reasoning bank (non-routine judgements about distance-time graphs)
    (r) => {
      const bank = [
        { en: 'a journey graph is a straight line from $(0,0)$ to $(T, D)$ with no other segments', ms: 'graf perjalanan ialah garis lurus dari $(0,0)$ ke $(T, D)$ tanpa sebarang segmen lain', ans: T('the average speed for the whole journey equals the speed of that single segment, $D/T$', 'laju purata bagi keseluruhan perjalanan sama dengan laju segmen tunggal itu, $D/T$') },
        { en: 'a journey has a rest stage in the middle, and the question asks for the average speed of the whole journey', ms: 'satu perjalanan mempunyai peringkat rehat di tengah, dan soalan meminta laju purata keseluruhan perjalanan', ans: T('the rest stage contributes 0 to the total distance but its duration still counts in the total time', 'peringkat rehat menyumbang 0 kepada jumlah jarak tetapi tempohnya tetap dikira dalam jumlah masa') },
        { en: 'a journey returns to the reference point, and the question asks for the total distance travelled (not displacement)', ms: 'satu perjalanan kembali ke titik rujukan, dan soalan meminta jumlah jarak yang dilalui (bukan sesaran)', ans: T('the outward and return distances are both added, even though the net displacement is 0', 'jarak pergi dan pulang kedua-duanya dijumlahkan, walaupun sesaran bersih ialah 0') },
        { en: 'a distance-time graph shows a curve with no stated method to estimate its gradient at a point', ms: 'graf jarak-masa menunjukkan lengkung tanpa kaedah yang dinyatakan untuk menganggarkan kecerunannya pada satu titik', ans: T('only a qualitative statement about whether the speed is increasing or decreasing can be made, not an exact numerical speed', 'hanya kenyataan kualitatif tentang sama ada laju semakin bertambah atau berkurang dapat dibuat, bukan laju berangka yang tepat') },
        { en: 'two objects start at different times from the same point and travel in the same direction at different constant speeds', ms: 'dua objek bermula pada masa berbeza dari titik yang sama dan bergerak dalam arah yang sama pada laju malar yang berbeza', ans: T('the faster one (if it starts later) will eventually catch up, at the time their graphs intersect', 'yang lebih laju (jika ia bermula kemudian) akhirnya akan menyusul, pada masa graf mereka bersilang') },
        { en: 'a question gives the average speed and the outward speed of a there-and-back journey, and asks for the return speed', ms: 'satu soalan memberikan laju purata dan laju semasa pergi bagi perjalanan pergi-balik, dan meminta laju semasa pulang', ans: T('the total distance and total time must first be related through the average-speed formula before the unknown return time (and hence speed) can be solved for', 'jumlah jarak dan jumlah masa mesti dikaitkan dahulu melalui formula laju purata sebelum masa pulang yang tidak diketahui (dan seterusnya laju) dapat diselesaikan') },
        { en: 'a journey graph is sketched from a worded description with a stated speed, duration and a rest', ms: 'graf perjalanan dilakarkan daripada penerangan berkata dengan laju, tempoh dan rehat yang dinyatakan', ans: T('every key point of the sketch (start, end of each stage) can be computed directly from the given speeds and durations', 'setiap titik penting lakaran itu (permulaan, akhir setiap peringkat) boleh dikira terus daripada laju dan tempoh yang diberikan') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = r.sample(bank.filter((_, i) => i !== ci), 3);
      const opts = r.shuffle([correct, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o.ans[lang]}`).join('<br>');
      return {
        q: T(`If ${correct.en}, which conclusion is correct?<br>${f('en')}`, `Jika ${correct.ms}, kesimpulan manakah yang betul?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 'm',
      };
    },
  ];
  SPM.extend('F4-7.1', { e: g71e, m: g71m, a: g71a });

  const g72e = [
    // (1) MCQ: conceptual bank of basic speed-time graph facts
    (r) => {
      const bank = [
        { en: 'a horizontal segment on a speed-time graph', ms: 'segmen mendatar pada graf laju-masa', ans: T('the object is moving at a uniform (constant) speed', 'objek itu bergerak pada laju seragam (malar)') },
        { en: 'a segment with positive gradient on a speed-time graph', ms: 'segmen dengan kecerunan positif pada graf laju-masa', ans: T('the object is accelerating (speeding up)', 'objek itu memecut (semakin laju)') },
        { en: 'a segment with negative gradient on a speed-time graph', ms: 'segmen dengan kecerunan negatif pada graf laju-masa', ans: T('the object is decelerating (slowing down)', 'objek itu menyahpecut (semakin perlahan)') },
        { en: 'the area under a segment of a speed-time graph', ms: 'luas di bawah segmen graf laju-masa', ans: T('the distance travelled during that segment', 'jarak yang dilalui sepanjang segmen itu') },
        { en: 'the label on the vertical axis of a speed-time graph', ms: 'label pada paksi menegak graf laju-masa', ans: T('speed', 'laju') },
        { en: 'the label on the horizontal axis of a speed-time graph', ms: 'label pada paksi mendatar graf laju-masa', ans: T('time elapsed', 'masa yang berlalu') },
        { en: 'the height of a point on a speed-time graph', ms: 'ketinggian satu titik pada graf laju-masa', ans: T('the speed at that instant', 'laju pada saat itu') },
        { en: 'a speed-time graph that touches the time axis (speed $= 0$) at some time', ms: 'graf laju-masa yang menyentuh paksi masa (laju $= 0$) pada suatu masa', ans: T('the object is at rest at that instant', 'objek itu berada dalam keadaan rehat pada saat itu') },
        { en: 'a straight line from $(0,0)$ rising to a speed $v$ over time $t$', ms: 'garis lurus dari $(0,0)$ meningkat kepada laju $v$ dalam masa $t$', ans: T('the object accelerates uniformly from rest', 'objek itu memecut secara seragam dari keadaan pegun') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = r.sample(bank.filter((_, i) => i !== ci), 3);
      const opts = r.shuffle([correct, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o.ans[lang]}`).join('<br>');
      return {
        q: T(`What does ${correct.en} represent?<br>${f('en')}`, `Apakah maksud ${correct.ms}?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 's',
      };
    },
    // (2) compute acceleration of a single segment from rest (direct)
    (r) => {
      const t1 = r.int(2, 6), v = r.int(2, 5) * t1;
      const pts = [[0, 0], [t1, v]];
      const fig = speedFigT(pts, t1 + 1, v + 4);
      return {
        q: T('The speed-time graph shows a car accelerating uniformly from rest. Find the acceleration.', 'Graf laju-masa menunjukkan sebuah kereta memecut secara seragam dari keadaan pegun. Cari pecutannya.'),
        fig,
        a: T(`${n(v / t1)} m/s²`),
        sp: 's',
      };
    },
    // (3) read a labelled value directly (speed at a given time, or time at a given speed)
    (r) => {
      const t1 = r.int(3, 6), v = r.int(2, 5) * t1;
      const askSpeed = r.chance(0.5);
      const pts = [[0, 0], [t1, v]];
      const fig = speedFigT(pts, t1 + 1, v + 5);
      return {
        q: askSpeed
          ? T(`The graph shows a car accelerating uniformly from rest. What is its speed at $t = ${t1}$ s?`, `Graf menunjukkan sebuah kereta memecut secara seragam dari keadaan pegun. Berapakah lajunya pada $t = ${t1}$ s?`)
          : T(`The graph shows a car accelerating uniformly from rest. At what time does its speed reach ${v} m/s?`, `Graf menunjukkan sebuah kereta memecut secara seragam dari keadaan pegun. Pada masa manakah lajunya mencapai ${v} m/s?`),
        fig,
        a: askSpeed ? T(`${v} m/s`) : T(`$t = ${t1}$ s`),
        sp: 's',
      };
    },
    // (4) area of the rectangle (uniform-speed) portion: distance directly
    (r) => {
      const v = r.pick([8, 10, 12, 15]), t = r.int(3, 8);
      const pts = [[0, v], [t, v]];
      const fig = speedFigT(pts, t + 1, v + 5);
      return {
        q: T(`The graph shows a car moving at a uniform speed. Find the distance travelled in the first ${t} s.`, `Graf menunjukkan sebuah kereta bergerak pada laju seragam. Cari jarak yang dilalui dalam ${t} s yang pertama.`),
        fig,
        a: T(`${v * t} m`),
        w: T(`$${v} \\times ${t}$`),
        sp: 's',
      };
    },
    // (5) true/false: horizontal segment means zero acceleration, NOT zero speed (common trap)
    (r) => {
      const v = r.pick([8, 10, 12, 15, 20]), t = r.int(3, 8);
      const pts = [[0, v], [t, v]];
      const fig = speedFigT(pts, t + 1, v + 5);
      return {
        q: T(`The graph shows a horizontal segment at speed ${v} m/s. A student says "the acceleration is ${v} m/s² because that is the height of the graph." True or false?`, `Graf menunjukkan segmen mendatar pada laju ${v} m/s. Seorang pelajar berkata "pecutannya ialah ${v} m/s² kerana itulah ketinggian graf itu." Benar atau palsu?`),
        fig,
        a: T('False: a horizontal segment has zero gradient, so the acceleration is 0 m/s²; the height of the graph gives the speed, not the acceleration.', 'Palsu: segmen mendatar mempunyai kecerunan sifar, jadi pecutannya ialah 0 m/s²; ketinggian graf memberikan laju, bukan pecutan.'),
        sp: 's',
      };
    },
  ];

  const g72m = [
    // (1) spot-the-error: total distance mis-decomposed (rectangle formula used for the whole trapezium)
    (r) => {
      const t1 = r.int(2, 4), v = r.pick([10, 15, 20]), tu = r.int(3, 6), t3 = r.int(2, 4);
      const xm = t1 + tu + t3;
      const wrongDist = v * xm;
      const correctDist = (v * (tu + xm)) / 2;
      const pts = [[0, 0], [t1, v], [t1 + tu, v], [xm, 0]];
      const fig = speedFigT(pts, xm, v + 5);
      return {
        q: T(`A student finds the total distance for this trapezium-shaped speed-time graph as $${v} \\times ${xm} = ${wrongDist}$ m (speed $\\times$ total time). Explain the mistake and find the correct total distance.`, `Seorang pelajar mencari jumlah jarak bagi graf laju-masa berbentuk trapezium ini sebagai $${v} \\times ${xm} = ${wrongDist}$ m (laju $\\times$ jumlah masa). Terangkan kesilapan itu dan cari jumlah jarak yang betul.`),
        fig,
        a: T(`The mistake: this treats the whole graph as a rectangle, but the speed is not constant throughout. Correct: split into a trapezium (or triangle + rectangle + triangle) and use area $= \\frac12(${tu} + ${xm}) \\times ${v} = ${n(correctDist)}$ m`, `Kesilapan: ini menganggap keseluruhan graf sebagai segi empat tepat, tetapi laju tidak malar sepanjang masa. Betul: pecahkan kepada trapezium (atau segi tiga + segi empat tepat + segi tiga) dan guna luas $= \\frac12(${tu} + ${xm}) \\times ${v} = ${n(correctDist)}$ m`),
        sp: 'm',
      };
    },
    // (3) unit-conversion trap: speed in km/h, time in seconds -> distance in metres
    (r) => {
      const vkmh = r.pick([36, 54, 72, 90]), t = r.int(4, 10);
      const vms = vkmh / 3.6;
      const dist = vms * t;
      const pts = [[0, vms], [t, vms]];
      const fig = speedFigT(pts, t + 1, vms + 5);
      return {
        q: T(`A car travels at a uniform speed of ${vkmh} km/h, shown on the speed-time graph in m/s. Find the distance travelled in the first ${t} s, in metres.`, `Sebuah kereta bergerak pada laju seragam ${vkmh} km/j, ditunjukkan pada graf laju-masa dalam m/s. Cari jarak yang dilalui dalam ${t} s yang pertama, dalam meter.`),
        fig,
        a: T(`${n(round(dist, 1))} m`),
        w: T(`${vkmh} km/h $= ${n(round(vms, 2))}$ m/s; distance $= ${n(round(vms, 2))} \\times ${t}$`, `${vkmh} km/j $= ${n(round(vms, 2))}$ m/s; jarak $= ${n(round(vms, 2))} \\times ${t}$`),
        sp: 'm',
      };
    },
    // (4) deceleration-only segment: standalone compute (starts moving, decelerates to rest)
    (r) => {
      const v = r.pick([15, 20, 25, 30]), t = r.int(3, 6);
      const pts = [[0, v], [t, 0]];
      const fig = speedFigT(pts, t + 1, v + 5);
      return {
        q: T('The graph shows a car decelerating uniformly to rest. Find the deceleration.', 'Graf menunjukkan sebuah kereta menyahpecut secara seragam sehingga berhenti. Cari nyahpecutannya.'),
        fig,
        a: T(`${n(round(v / t, 2))} m/s²`),
        sp: 's',
      };
    },
    // (5) MCQ conceptual bank: comparative / harder reasoning
    (r) => {
      const bank = [
        { en: 'two speed-time graphs enclose the same area over the same time interval', ms: 'dua graf laju-masa merangkumi luas yang sama dalam selang masa yang sama', ans: T('both objects travel the same distance in that interval, even if their speeds differ at each instant', 'kedua-dua objek melalui jarak yang sama dalam selang itu, walaupun laju mereka berbeza pada setiap saat') },
        { en: 'a speed-time graph segment has a steeper positive gradient than another', ms: 'segmen graf laju-masa mempunyai kecerunan positif yang lebih curam daripada satu lagi', ans: T('the steeper segment represents the greater acceleration', 'segmen yang lebih curam mewakili pecutan yang lebih besar') },
        { en: 'the average speed of a journey is computed from a speed-time graph', ms: 'laju purata bagi satu perjalanan dikira daripada graf laju-masa', ans: T('it equals the total area (total distance) divided by the total time, not the mean of the labelled speeds', 'ia sama dengan jumlah luas (jumlah jarak) dibahagi jumlah masa, bukan min laju yang dilabelkan') },
        { en: 'a speed-time graph is a trapezium (accelerate, uniform, decelerate)', ms: 'graf laju-masa berbentuk trapezium (memecut, seragam, menyahpecut)', ans: T('the total distance is the area of the trapezium, found by splitting it into simple shapes or using the trapezium area formula', 'jumlah jarak ialah luas trapezium itu, didapati dengan memecahkannya kepada bentuk mudah atau menggunakan formula luas trapezium') },
        { en: 'a speed is given in km/h but the time axis of the graph is in seconds', ms: 'satu laju diberikan dalam km/j tetapi paksi masa graf itu dalam saat', ans: T('the speed must first be converted to m/s before computing a distance in metres from the area', 'laju itu mesti ditukar kepada m/s dahulu sebelum mengira jarak dalam meter daripada luas') },
        { en: 'a speed-time graph segment slopes down but does not reach 0 before the next segment begins', ms: 'segmen graf laju-masa mencerun ke bawah tetapi tidak mencapai 0 sebelum segmen seterusnya bermula', ans: T('the object decelerates but is still moving (at a lower speed) when the next stage begins', 'objek itu menyahpecut tetapi masih bergerak (pada laju yang lebih rendah) apabila peringkat seterusnya bermula') },
        { en: 'a question asks for the speed at a specific time within a sloped (accelerating) segment, not at its endpoints', ms: 'satu soalan meminta laju pada masa tertentu dalam segmen bercerun (memecut), bukan pada hujungnya', ans: T('linear interpolation is used: the speed increases proportionally with time along that straight segment', 'interpolasi linear digunakan: laju meningkat secara berkadar dengan masa di sepanjang segmen lurus itu') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = r.sample(bank.filter((_, i) => i !== ci), 3);
      const opts = r.shuffle([correct, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o.ans[lang]}`).join('<br>');
      return {
        q: T(`If ${correct.en}, what can be concluded?<br>${f('en')}`, `Jika ${correct.ms}, apakah yang boleh disimpulkan?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 'm',
      };
    },
    // (6) work backwards: find an unknown time from a given area (distance) condition, uniform stage
    (r) => {
      const v = r.pick([10, 12, 15, 20]), dist = v * r.int(3, 8);
      const t = dist / v;
      return {
        q: T(`A cyclist moves at a uniform speed of ${v} m/s and covers ${dist} m. Find the time taken.`, `Seorang penunggang basikal bergerak pada laju seragam ${v} m/s dan melalui ${dist} m. Cari masa yang diambil.`),
        a: T(`${t} s`),
        w: T(`$t = ${dist} \\div ${v}$`),
        sp: 's',
      };
    },
  ];

  const g72a = [
    // (1) two-part: find v then acceleration in the first stage
    (r) => {
      const t1 = r.int(3, 5), tu = r.int(4, 8), D = r.pick([200, 250, 300, 350]);
      const v = round(D / (t1 + tu), 2);
      need(v > 4 && v < 40);
      const a = round(v / t1, 2);
      return {
        q: T(`A car accelerates uniformly from rest to $v$ m/s in ${t1} s, then travels at $v$ m/s for ${tu} s before decelerating uniformly to rest in the same time it took to accelerate. The total distance is ${D} m. Find (a) $v$, (b) the acceleration in the first stage.`, `Sebuah kereta memecut secara seragam dari keadaan pegun kepada $v$ m/s dalam ${t1} s, kemudian bergerak pada $v$ m/s selama ${tu} s sebelum menyahpecut secara seragam sehingga berhenti dalam masa yang sama seperti ia memecut. Jumlah jarak ialah ${D} m. Cari (a) $v$, (b) pecutan pada peringkat pertama.`),
        a: T(`(a) $v = ${n(v)}$ m/s (b) ${n(a)} m/s²`),
        w: T(`$\\frac12(${tu} + (${tu} + 2 \\times ${t1}))v = ${D}$`),
        sp: 'l',
      };
    },
    // (3) compare two vehicles' graphs: which travels further / has greater acceleration
    (r) => {
      const v1 = r.pick([15, 20]), t1a = r.int(4, 6);
      const v2 = r.pick([18, 24]), t1b = r.int(3, 5);
      const distA = (v1 * t1a) / 2, distB = (v2 * t1b) / 2;
      const f = (lang) => S.graph({ w: 320, h: 210, xr: [0, Math.max(t1a, t1b) + 1, 1], yr: [0, Math.max(v1, v2) + 5, 5], xlabel: lang === 'en' ? 'Time (s)' : 'Masa (s)', ylabel: lang === 'en' ? 'Speed (m/s)' : 'Laju (m/s)', series: [{ pts: [[0, 0], [t1a, v1]], type: 'line' }, { pts: [[0, 0], [t1b, v2]], type: 'line', dash: true }] });
      return {
        q: T(`Vehicle $A$ (solid) accelerates uniformly from rest to ${v1} m/s in ${t1a} s, then stops accelerating. Vehicle $B$ (dashed) accelerates uniformly from rest to ${v2} m/s in ${t1b} s, then stops accelerating. Which vehicle travels further in its acceleration stage, and which has the greater acceleration?`, `Kenderaan $A$ (garis penuh) memecut secara seragam dari keadaan pegun kepada ${v1} m/s dalam ${t1a} s, kemudian berhenti memecut. Kenderaan $B$ (putus-putus) memecut secara seragam dari keadaan pegun kepada ${v2} m/s dalam ${t1b} s, kemudian berhenti memecut. Kenderaan manakah melalui jarak yang lebih jauh semasa peringkat pecutannya, dan yang manakah mempunyai pecutan yang lebih besar?`),
        fig: T(f('en'), f('ms')),
        a: T(`Distance: $A$ = ${n(distA)} m, $B$ = ${n(distB)} m, so ${distA > distB ? '$A$' : '$B$'} travels further. Acceleration: $A$ = ${n(round(v1 / t1a, 2))} m/s², $B$ = ${n(round(v2 / t1b, 2))} m/s², so ${(v1 / t1a) > (v2 / t1b) ? '$A$' : '$B$'} has the greater acceleration.`, `Jarak: $A$ = ${n(distA)} m, $B$ = ${n(distB)} m, jadi ${distA > distB ? '$A$' : '$B$'} melalui jarak yang lebih jauh. Pecutan: $A$ = ${n(round(v1 / t1a, 2))} m/s², $B$ = ${n(round(v2 / t1b, 2))} m/s², jadi ${(v1 / t1a) > (v2 / t1b) ? '$A$' : '$B$'} mempunyai pecutan yang lebih besar.`),
        sp: 'l',
      };
    },
    // (4) speed at a time within a sloped segment (linear interpolation, not just at the endpoints)
    (r) => {
      const t1 = r.int(4, 8), v = r.pick([16, 20, 24, 28]);
      const tq = r.int(1, t1 - 1);
      const vq = round((v / t1) * tq, 2);
      const pts = [[0, 0], [t1, v]];
      const fig = speedFigT(pts, t1 + 1, v + 4, (m) => S.line(m.sx(tq), m.sy(0), m.sx(tq), m.sy(vq), { dash: true, w: 1 }));
      return {
        q: T(`The graph shows a car accelerating uniformly from rest to ${v} m/s in ${t1} s. Find its speed at $t = ${tq}$ s.`, `Graf menunjukkan sebuah kereta memecut secara seragam dari keadaan pegun kepada ${v} m/s dalam ${t1} s. Cari lajunya pada $t = ${tq}$ s.`),
        fig,
        a: T(`${n(vq)} m/s`),
        w: T(`$\\dfrac{${v}}{${t1}} \\times ${tq}$`),
        sp: 's',
      };
    },
    // (5) unit-conversion, harder: total distance requested in km given m/s speeds and seconds times
    (r) => {
      const t1 = r.int(3, 6), v = r.pick([16, 20, 24]), tu = r.int(20, 40);
      const dist = (v * t1) / 2 + v * tu;
      const distKm = round(dist / 1000, 3);
      const fig = speedFigT([[0, 0], [t1, v], [t1 + tu, v]], t1 + tu + 1, v + 5);
      return {
        q: T(`A bus accelerates uniformly from rest to ${v} m/s in ${t1} s, then travels at ${v} m/s for ${tu} s. Find the total distance travelled, in kilometres.`, `Sebuah bas memecut secara seragam dari keadaan pegun kepada ${v} m/s dalam ${t1} s, kemudian bergerak pada ${v} m/s selama ${tu} s. Cari jumlah jarak yang dilalui, dalam kilometer.`),
        fig,
        a: T(`${n(distKm)} km`),
        w: T(`$\\left(\\frac12 \\times ${t1} \\times ${v} + ${v} \\times ${tu}\\right) \\div 1000$`),
        sp: 'm',
      };
    },
    // (6) MCQ: harder conceptual/reasoning bank
    (r) => {
      const bank = [
        { en: 'a question gives the total distance and asks for an unknown top speed $v$ of a trapezium-shaped journey', ms: 'satu soalan memberikan jumlah jarak dan meminta laju maksimum $v$ yang tidak diketahui bagi perjalanan berbentuk trapezium', ans: T('the area of the trapezium (in terms of $v$) is set equal to the given distance, giving a linear equation to solve for $v$', 'luas trapezium itu (dalam sebutan $v$) disamakan dengan jarak yang diberikan, menghasilkan persamaan linear untuk diselesaikan bagi $v$') },
        { en: 'a speed-time graph has a curved segment with no stated method to estimate its gradient', ms: 'graf laju-masa mempunyai segmen melengkung tanpa kaedah yang dinyatakan untuk menganggarkan kecerunannya', ans: T('only a qualitative statement about whether the acceleration is increasing or decreasing can be made, not an exact value', 'hanya kenyataan kualitatif tentang sama ada pecutan semakin bertambah atau berkurang dapat dibuat, bukan nilai yang tepat') },
        { en: 'the units of speed and time in a question do not match (e.g. km/h and seconds)', ms: 'unit laju dan masa dalam satu soalan tidak sepadan (cth. km/j dan saat)', ans: T('one of the quantities must be converted to consistent units before computing a distance from the area', 'salah satu kuantiti itu mesti ditukar kepada unit yang selaras sebelum mengira jarak daripada luas') },
        { en: 'two vehicles\' speed-time graphs are compared over the same time interval', ms: 'graf laju-masa dua kenderaan dibandingkan dalam selang masa yang sama', ans: T('the one enclosing the greater area has travelled the greater distance, regardless of which has the higher peak speed', 'yang merangkumi luas yang lebih besar telah melalui jarak yang lebih jauh, tanpa mengira yang manakah mempunyai laju puncak yang lebih tinggi') },
        { en: 'a speed-time graph shows a segment decreasing to a speed of 0 and then staying at 0', ms: 'graf laju-masa menunjukkan segmen menurun kepada laju 0 dan kemudian kekal pada 0', ans: T('the object decelerates to rest and then remains stationary', 'objek itu menyahpecut sehingga berhenti dan kemudian kekal pegun') },
        { en: 'a two-stage acceleration and deceleration problem gives the total distance and asks for the top speed $v$, where the stage durations differ', ms: 'masalah dua peringkat pecutan dan nyahpecutan memberikan jumlah jarak dan meminta laju maksimum $v$, dengan tempoh peringkat yang berbeza', ans: T('the areas of both triangular (or trapezoidal) stages are added in terms of $v$ and set equal to the total distance', 'luas kedua-dua peringkat bersegi tiga (atau bertrapezium) itu dijumlahkan dalam sebutan $v$ dan disamakan dengan jumlah jarak') },
        { en: 'a distance is required in kilometres but the speed-time graph is in m/s and seconds', ms: 'satu jarak diperlukan dalam kilometer tetapi graf laju-masa itu dalam m/s dan saat', ans: T('the area (in metres) is computed first, then divided by 1000 to convert to kilometres', 'luas itu (dalam meter) dikira dahulu, kemudian dibahagi 1000 untuk ditukar kepada kilometer') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = r.sample(bank.filter((_, i) => i !== ci), 3);
      const opts = r.shuffle([correct, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o.ans[lang]}`).join('<br>');
      return {
        q: T(`If ${correct.en}, what can be concluded?<br>${f('en')}`, `Jika ${correct.ms}, apakah yang boleh disimpulkan?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 'm',
      };
    },
  ];
  SPM.extend('F4-7.2', { e: g72e, m: g72m, a: g72a });

  /* =============================================================================== 10.1 / 10.2 / 10.3 */
  const STAGE5 = [
    T('Set financial goals', 'Tetapkan matlamat kewangan'),
    T('Evaluate current financial status', 'Nilai status kewangan semasa'),
    T('Create a financial plan', 'Buat pelan kewangan'),
    T('Carry out the plan', 'Laksanakan pelan'),
    T('Review and revise the plan', 'Semak dan ubah suai pelan'),
  ];
  // bank: real-life action -> which of the 5 stages it belongs to (index 0-4)
  const STAGE_ACT = [
    { i: 0, en: 'Aiman decides he wants to save RM3 000 for a laptop within a year', ms: 'Aiman memutuskan dia mahu menyimpan RM3 000 untuk komputer riba dalam masa setahun' },
    { i: 0, en: 'Siti writes down that she wants to buy a car in five years', ms: 'Siti menuliskan bahawa dia mahu membeli kereta dalam masa lima tahun' },
    { i: 0, en: 'Farid decides on a target amount and a deadline for a holiday fund', ms: 'Farid menentukan jumlah sasaran dan tenggat masa untuk dana percutian' },
    { i: 1, en: 'Nurul lists all her monthly income and expenses to see where she stands', ms: 'Nurul menyenaraikan semua pendapatan dan perbelanjaan bulanannya untuk melihat kedudukannya' },
    { i: 1, en: 'Amir checks his bank statements and calculates his current savings', ms: 'Amir menyemak penyata banknya dan mengira simpanan semasanya' },
    { i: 1, en: 'Priya works out how much she currently spends on each category', ms: 'Priya mengira berapa banyak dia berbelanja pada setiap kategori pada masa ini' },
    { i: 2, en: 'Hafiz decides how much to save each month and which expenses to cut', ms: 'Hafiz menentukan berapa banyak untuk disimpan setiap bulan dan perbelanjaan mana yang perlu dikurangkan' },
    { i: 2, en: 'Farah draws up a monthly budget showing income, expenses and savings', ms: 'Farah menyediakan belanjawan bulanan yang menunjukkan pendapatan, perbelanjaan dan simpanan' },
    { i: 2, en: 'Kumar sets a fixed amount to transfer to a savings account every payday', ms: 'Kumar menetapkan jumlah tetap untuk dipindahkan ke akaun simpanan setiap hari gaji' },
    { i: 3, en: 'Alia actually transfers the planned amount into her savings account each month', ms: 'Alia benar-benar memindahkan jumlah yang dirancang ke akaun simpanannya setiap bulan' },
    { i: 3, en: 'Daniel sticks to his budget by tracking his spending every week', ms: 'Daniel mematuhi belanjawannya dengan menjejaki perbelanjaannya setiap minggu' },
    { i: 3, en: 'Zara follows through on her saving plan for three consecutive months', ms: 'Zara meneruskan pelan simpanannya selama tiga bulan berturut-turut' },
    { i: 4, en: 'After a pay cut, Irfan checks whether his savings goal is still achievable', ms: 'Selepas potongan gaji, Irfan menyemak sama ada matlamat simpanannya masih boleh dicapai' },
    { i: 4, en: 'Six months in, Sarah compares her actual savings with her target and adjusts the plan', ms: 'Selepas enam bulan, Sarah membandingkan simpanan sebenarnya dengan sasarannya dan melaraskan pelan itu' },
    { i: 4, en: 'After an unexpected medical bill, Chong revises his monthly budget', ms: 'Selepas bil perubatan yang tidak dijangka, Chong menyemak semula belanjawan bulanannya' },
  ];
  // bank: goal statement -> which SMART letter it is missing
  const SMART_LETTERS = { S: T('Specific', 'Spesifik'), M: T('Measurable', 'Boleh diukur'), A: T('Achievable', 'Boleh dicapai'), R: T('Relevant', 'Relevan'), T: T('Time-bound', 'Bertempoh masa') };
  const SMART_BANK = [
    { miss: 'S', en: '"I want to save more money."', ms: '"Saya mahu menyimpan lebih banyak wang."' },
    { miss: 'M', en: '"I want to save some money for a phone, but I have not decided how much."', ms: '"Saya mahu menyimpan sedikit wang untuk telefon, tetapi belum menentukan berapa banyak."' },
    { miss: 'T', en: '"I want to save RM2 400 for a laptop." (no deadline given)', ms: '"Saya mahu menyimpan RM2 400 untuk komputer riba." (tiada tarikh akhir diberikan)' },
    { miss: 'A', en: '"I will save RM4 000 a month from a RM1 500 salary."', ms: '"Saya akan menyimpan RM4 000 sebulan daripada gaji RM1 500."' },
    { miss: 'R', en: '"I will learn to juggle five balls by next month." (as a financial goal)', ms: '"Saya akan belajar menyulap lima biji bola menjelang bulan depan." (sebagai matlamat kewangan)' },
    { miss: 'S', en: '"I want to be better with money this year."', ms: '"Saya mahu lebih bijak menguruskan wang tahun ini."' },
    { miss: 'M', en: '"I will save a bit every month towards a car deposit."', ms: '"Saya akan menyimpan sedikit setiap bulan untuk deposit kereta."' },
    { miss: 'T', en: '"I want to save RM6 000 for a motorcycle." (no time frame given)', ms: '"Saya mahu menyimpan RM6 000 untuk motosikal." (tiada tempoh masa diberikan)' },
  ];
  const NEEDWANT = [
    { en: 'monthly house rent', ms: 'sewa rumah bulanan', ans: 'need' }, { en: 'grocery for meals', ms: 'barangan runcit untuk makanan', ans: 'need' },
    { en: 'school transport fare', ms: 'tambang pengangkutan sekolah', ans: 'need' }, { en: 'electricity and water bills', ms: 'bil elektrik dan air', ans: 'need' },
    { en: 'basic medicine', ms: 'ubat asas', ans: 'need' }, { en: 'the latest smartphone model, to replace a working one', ms: 'model telefon pintar terbaharu, untuk menggantikan yang masih berfungsi', ans: 'want' },
    { en: 'a branded designer bag', ms: 'beg jenama mewah', ans: 'want' }, { en: 'a holiday overseas', ms: 'percutian ke luar negara', ans: 'want' },
    { en: 'dining at an expensive restaurant', ms: 'makan di restoran mahal', ans: 'want' }, { en: 'a new gaming console', ms: 'konsol permainan video baharu', ans: 'want' },
  ];
  const FIXVAR = [
    { en: 'monthly house rent', ms: 'sewa rumah bulanan', ans: 'fixed' }, { en: 'a car loan instalment', ms: 'ansuran pinjaman kereta', ans: 'fixed' },
    { en: 'monthly insurance premium', ms: 'premium insurans bulanan', ans: 'fixed' }, { en: 'internet subscription fee', ms: 'yuran langganan internet', ans: 'fixed' },
    { en: 'grocery spending, which changes month to month', ms: 'perbelanjaan runcit, yang berubah dari bulan ke bulan', ans: 'variable' },
    { en: 'petrol costs, depending on how much the car is used', ms: 'kos petrol, bergantung pada penggunaan kereta', ans: 'variable' },
    { en: 'electricity bill, which varies with usage', ms: 'bil elektrik, yang berbeza mengikut penggunaan', ans: 'variable' },
    { en: 'entertainment and dining out', ms: 'hiburan dan makan di luar', ans: 'variable' },
  ];
  const GOALTERM = [
    { en: 'saving RM300 for new school shoes next month', ms: 'menyimpan RM300 untuk kasut sekolah baharu bulan depan', ans: 'short' },
    { en: 'saving for a house deposit over the next 10 years', ms: 'menyimpan untuk deposit rumah dalam tempoh 10 tahun akan datang', ans: 'long' },
    { en: 'buying a new phone in two months', ms: 'membeli telefon baharu dalam dua bulan', ans: 'short' },
    { en: 'saving for retirement over the next 25 years', ms: 'menyimpan untuk persaraan dalam tempoh 25 tahun akan datang', ans: 'long' },
    { en: 'paying for a birthday gift next week', ms: 'membayar hadiah hari lahir minggu depan', ans: 'short' },
    { en: 'saving for a child\'s university education in 15 years', ms: 'menyimpan untuk pendidikan universiti anak dalam 15 tahun', ans: 'long' },
    { en: 'a school trip payment due in three months', ms: 'bayaran lawatan sekolah yang perlu dibayar dalam tiga bulan', ans: 'short' },
    { en: 'saving for a house renovation over the next 8 years', ms: 'menyimpan untuk pengubahsuaian rumah dalam tempoh 8 tahun akan datang', ans: 'long' },
  ];

  const g101e = [
    // (1) which stage of the cycle does this action belong to? (MCQ, big action bank)
    (r) => {
      const ci = r.int(0, STAGE_ACT.length - 1);
      const act = STAGE_ACT[ci];
      return {
        q: T(`${act.en}. Which stage of the financial management cycle is this?`, `${act.ms}. Peringkat kitaran pengurusan kewangan manakah ini?`),
        a: STAGE5[act.i],
        sp: 's',
      };
    },
    // (3) short-term or long-term goal? (big goal bank)
    (r) => {
      const g = r.pick(GOALTERM);
      return {
        q: T(`Is this a short-term or a long-term financial goal? "${g.en}"`, `Adakah ini matlamat kewangan jangka pendek atau jangka panjang? "${g.ms}"`),
        a: g.ans === 'short' ? T('Short-term', 'Jangka pendek') : T('Long-term', 'Jangka panjang'),
        sp: 's',
      };
    },
    // (4) is this a need or a want? (big item bank)
    (r) => {
      const it = r.pick(NEEDWANT);
      return {
        q: T(`Is this a need or a want: ${it.en}?`, `Adakah ini keperluan atau kehendak: ${it.ms}?`),
        a: it.ans === 'need' ? T('Need', 'Keperluan') : T('Want', 'Kehendak'),
        sp: 'xs',
      };
    },
    // (5) fixed or variable expense? (big item bank)
    (r) => {
      const it = r.pick(FIXVAR);
      return {
        q: T(`Is this a fixed or a variable expense: ${it.en}?`, `Adakah ini perbelanjaan tetap atau perbelanjaan boleh ubah: ${it.ms}?`),
        a: it.ans === 'fixed' ? T('Fixed expense', 'Perbelanjaan tetap') : T('Variable expense', 'Perbelanjaan boleh ubah'),
        sp: 'xs',
      };
    },
    // (6) which SMART criterion is missing from this goal statement? (big goal bank)
    (r) => {
      const g = r.pick(SMART_BANK);
      const opts = r.shuffle(Object.keys(SMART_LETTERS));
      const letter = g.miss;
      const f = (lang) => opts.map((k) => `$${k}$ = ${SMART_LETTERS[k][lang]}`).join(', ');
      return {
        q: T(`Which SMART criterion is missing from this goal? ${g.en}<br>(${f('en')})`, `Kriteria SMART manakah yang tiada dalam matlamat ini? ${g.ms}<br>(${f('ms')})`),
        a: T(`$${letter}$ (${SMART_LETTERS[letter].en})`, `$${letter}$ (${SMART_LETTERS[letter].ms})`),
        sp: 's',
      };
    },
  ];

  const g101m = [
    // (1) monthly savings target = goal / months, plus SMART restatement
    (r) => {
      const goal = r.pick([1200, 1800, 2400, 3000, 3600]), mo = r.pick([6, 8, 10, 12]);
      need((goal / mo) % 1 === 0);
      const item = r.pick([T('a laptop', 'sebuah komputer riba'), T('a motorcycle deposit', 'deposit motosikal'), T('a school trip', 'lawatan sekolah'), T('a smartphone', 'telefon pintar')]);
      return {
        q: T(`Aiman wants to save ${rm(goal)} for ${item.en} in ${mo} months. How much must he save each month? Write the goal in SMART form.`, `Aiman ingin menyimpan ${rm(goal)} untuk ${item.ms} dalam ${mo} bulan. Berapakah yang mesti disimpannya setiap bulan? Tulis matlamat itu dalam bentuk SMART.`),
        a: T(`${rm(goal / mo)} per month. Example: "Save ${rm(goal / mo)} every month for ${mo} months to buy ${item.en} costing ${rm(goal)}."`, `${rm(goal / mo)} sebulan. Contoh: "Simpan ${rm(goal / mo)} setiap bulan selama ${mo} bulan untuk ${item.ms} berharga ${rm(goal)}."`),
        sp: 's',
      };
    },
    // (2) evaluate financial status: surplus/deficit from a short list of income and expenses
    (r) => {
      const inc = r.pick([2200, 2800, 3200, 3800]);
      const exp = r.sample([[T('rent', 'sewa'), r.pick([600, 800, 900])], [T('food', 'makanan'), r.pick([500, 600, 700])], [T('transport', 'pengangkutan'), r.pick([200, 300, 350])], [T('utilities', 'utiliti'), r.pick([150, 200, 250])], [T('phone plan', 'pelan telefon'), r.pick([50, 80, 100])]], 3);
      const totExp = exp.reduce((s, [, v]) => s + v, 0);
      const surplus = inc - totExp;
      return {
        q: T(`Farid's monthly income is ${rm(inc)}. His expenses are ${exp.map(([n_, v]) => `${n_.en} ${rm(v)}`).join(', ')}. Evaluate his current financial status: find his monthly surplus or deficit.`, `Pendapatan bulanan Farid ialah ${rm(inc)}. Perbelanjaannya ialah ${exp.map(([n_, v]) => `${n_.ms} ${rm(v)}`).join(', ')}. Nilai status kewangan semasanya: cari lebihan atau defisit bulanannya.`),
        a: T(`${surplus >= 0 ? 'Surplus' : 'Deficit'} of ${rm(Math.abs(surplus))}`, `${surplus >= 0 ? 'Lebihan' : 'Defisit'} sebanyak ${rm(Math.abs(surplus))}`),
        sp: 's',
      };
    },
    // (3) identify a deficit and quantify the reduction needed to reach a savings target
    (r) => {
      const inc = r.pick([2500, 3000, 3500]), exp = inc + r.pick([100, 150, 200]);
      const target = r.pick([100, 150, 200]);
      const deficit = exp - inc;
      const cut = deficit + target;
      return {
        q: T(`Siti's monthly income is ${rm(inc)} and her monthly expenses are ${rm(exp)}. She wants to have a monthly surplus of at least ${rm(target)} to save. By how much must she cut her expenses?`, `Pendapatan bulanan Siti ialah ${rm(inc)} dan perbelanjaan bulanannya ialah ${rm(exp)}. Dia mahu mempunyai lebihan bulanan sekurang-kurangnya ${rm(target)} untuk disimpan. Berapakah perbelanjaannya perlu dikurangkan?`),
        a: T(`Current deficit ${rm(deficit)}; she must cut expenses by ${rm(cut)} to reach a surplus of ${rm(target)}`, `Defisit semasa ${rm(deficit)}; dia mesti mengurangkan perbelanjaan sebanyak ${rm(cut)} untuk mencapai lebihan ${rm(target)}`),
        sp: 'm',
      };
    },
    // (4) complete a partial budget table (one entry missing)
    (r) => {
      const inc = r.pick([2400, 2800, 3200]);
      const rent = r.pick([700, 800, 900]), food = r.pick([500, 600]), trans = r.pick([250, 300]);
      const savings = inc - rent - food - trans;
      need(savings > 0);
      return {
        q: T(`The table shows Hafiz's monthly budget, with the savings amount missing. Find it.<br>${SPM.table([['Income', rm(inc)], ['Rent', rm(rent)], ['Food', rm(food)], ['Transport', rm(trans)], ['Savings', '?']], { rowHead: true })}`, `Jadual menunjukkan belanjawan bulanan Hafiz, dengan jumlah simpanan tidak diketahui. Cari jumlah itu.<br>${SPM.table([['Pendapatan', rm(inc)], ['Sewa', rm(rent)], ['Makanan', rm(food)], ['Pengangkutan', rm(trans)], ['Simpanan', '?']], { rowHead: true })}`),
        a: T(`${rm(savings)}`),
        sp: 's',
      };
    },
    // (5) MCQ: select and justify an action to carry out or revise a plan (scenario bank)
    (r) => {
      const bank = [
        { en: 'Kumar\'s savings account shows he has saved less than planned for three months in a row', ms: 'akaun simpanan Kumar menunjukkan dia menyimpan kurang daripada dirancang selama tiga bulan berturut-turut', ans: T('review the plan and either reduce expenses further or extend the timeline', 'semak pelan itu dan sama ada kurangkan lagi perbelanjaan atau lanjutkan tempoh masa') },
        { en: 'Priya just received a pay rise', ms: 'Priya baru sahaja menerima kenaikan gaji', ans: T('review the plan and consider increasing the monthly savings amount or reaching the goal sooner', 'semak pelan itu dan pertimbangkan untuk menambah jumlah simpanan bulanan atau mencapai matlamat lebih awal') },
        { en: 'Aiman has an unexpected large medical bill this month', ms: 'Aiman mempunyai bil perubatan besar yang tidak dijangka bulan ini', ans: T('use the contingency fund set aside for unplanned expenses', 'gunakan dana kontingensi yang disediakan untuk perbelanjaan tidak dirancang') },
        { en: 'Farah has been consistently transferring her planned savings amount every payday for six months', ms: 'Farah telah konsisten memindahkan jumlah simpanan yang dirancang setiap hari gaji selama enam bulan', ans: T('this is carrying out the plan as intended; continue and check progress against the goal periodically', 'ini adalah melaksanakan pelan seperti yang dirancang; teruskan dan semak kemajuan berbanding matlamat secara berkala') },
        { en: 'Daniel\'s rent has just increased permanently', ms: 'sewa Daniel baru sahaja meningkat secara kekal', ans: T('revise the budget to account for the higher fixed expense, adjusting other categories or the savings target', 'semak semula belanjawan untuk mengambil kira perbelanjaan tetap yang lebih tinggi, laraskan kategori lain atau sasaran simpanan') },
        { en: 'Zara has just written down her income and expenses for the first time to see where her money goes', ms: 'Zara baru sahaja menuliskan pendapatan dan perbelanjaannya buat kali pertama untuk melihat ke mana wangnya pergi', ans: T('this is evaluating her current financial status, an early step before creating a plan', 'ini adalah menilai status kewangan semasanya, satu langkah awal sebelum membuat pelan') },
        { en: 'Irfan has a clear savings goal and a written budget, but has not started saving yet', ms: 'Irfan mempunyai matlamat simpanan yang jelas dan belanjawan bertulis, tetapi belum mula menyimpan', ans: T('he needs to move from having a plan to actually carrying it out, such as by setting up an automatic transfer', 'dia perlu beralih daripada mempunyai pelan kepada benar-benar melaksanakannya, seperti dengan menyediakan pindahan automatik') },
        { en: 'Alia loses her part-time job and her monthly income drops sharply', ms: 'Alia kehilangan kerja sambilannya dan pendapatan bulanannya merosot dengan mendadak', ans: T('review and revise the plan: the goal, timeline or expenses need to be adjusted to match the new income', 'semak dan ubah suai pelan: matlamat, garis masa atau perbelanjaan perlu dilaraskan mengikut pendapatan baharu') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = r.sample(bank.filter((_, i) => i !== ci).map((b) => b.ans), 3);
      const opts = r.shuffle([correct.ans, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct.ans)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o[lang]}`).join('<br>');
      return {
        q: T(`${correct.en}. What is the most appropriate action?<br>${f('en')}`, `${correct.ms}. Apakah tindakan yang paling sesuai?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 'm',
      };
    },
    // (6) compare two simple plans: which is more feasible, with justification
    (r) => {
      const inc = r.pick([2500, 3000]);
      const p1 = { goal: r.pick([3000, 3600]), mo: r.pick([6, 8]) };
      const p2 = { goal: p1.goal, mo: p1.mo + r.pick([4, 6]) };
      const surplus = r.pick([300, 400, 500]);
      const need1 = p1.goal / p1.mo, need2 = p2.goal / p2.mo;
      return {
        q: T(`Two plans both aim to save ${rm(p1.goal)}: Plan $A$ over ${p1.mo} months, Plan $B$ over ${p2.mo} months. Aisyah's monthly surplus is ${rm(surplus)}. Which plan is feasible for her, and why?`, `Dua pelan sama-sama bertujuan menyimpan ${rm(p1.goal)}: Pelan $A$ dalam ${p1.mo} bulan, Pelan $B$ dalam ${p2.mo} bulan. Lebihan bulanan Aisyah ialah ${rm(surplus)}. Pelan manakah yang boleh dicapai olehnya, dan mengapa?`),
        a: T(`Plan $A$ needs ${rm(round(need1, 2))}/month and Plan $B$ needs ${rm(round(need2, 2))}/month; ${need1 <= surplus && need2 <= surplus ? 'both are feasible, but $A$ reaches the goal sooner' : need2 <= surplus ? 'only Plan $B$ is feasible, since Plan $A$ needs more than her surplus' : 'neither is feasible with her current surplus'}`, `Pelan $A$ memerlukan ${rm(round(need1, 2))}/bulan dan Pelan $B$ memerlukan ${rm(round(need2, 2))}/bulan; ${need1 <= surplus && need2 <= surplus ? 'kedua-duanya boleh dicapai, tetapi $A$ mencapai matlamat lebih awal' : need2 <= surplus ? 'hanya Pelan $B$ yang boleh dicapai, kerana Pelan $A$ memerlukan lebih daripada lebihannya' : 'kedua-dua pelan tidak boleh dicapai dengan lebihan semasanya'}`),
        sp: 'm',
      };
    },
    // (7) MCQ: identify which stage of the cycle a scenario represents (harder/ambiguous cases)
    (r) => {
      const bank = [
        { en: 'Nurul lists her income, expenses, savings and the value of her belongings to see her full financial position', ms: 'Nurul menyenaraikan pendapatan, perbelanjaan, simpanan dan nilai hartanya untuk melihat kedudukan kewangannya secara menyeluruh', stage: 1 },
        { en: 'Farid decides that 20% of his income will go to savings, 50% to needs, and 30% to wants', ms: 'Farid memutuskan bahawa 20% pendapatannya akan disalurkan kepada simpanan, 50% kepada keperluan, dan 30% kepada kehendak', stage: 2 },
        { en: 'Sarah automatically transfers a fixed sum to her savings account every time she is paid', ms: 'Sarah secara automatik memindahkan jumlah tetap ke akaun simpanannya setiap kali dia menerima gaji', stage: 3 },
        { en: 'After finishing university and starting his first job, Kumar sets a new goal to save for a car', ms: 'Selepas tamat universiti dan memulakan kerja pertamanya, Kumar menetapkan matlamat baharu untuk menyimpan bagi kereta', stage: 0 },
        { en: 'Every three months, Aisyah compares her actual savings with her target and decides if changes are needed', ms: 'Setiap tiga bulan, Aisyah membandingkan simpanan sebenarnya dengan sasarannya dan memutuskan sama ada perubahan diperlukan', stage: 4 },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      return {
        q: T(`${correct.en}. Which stage of the financial management cycle does this represent?`, `${correct.ms}. Peringkat kitaran pengurusan kewangan manakah ini mewakili?`),
        a: STAGE5[correct.stage],
        sp: 's',
      };
    },
  ];

  const g101a = [
    // (1) full cycle multi-part: evaluate, plan, achievability with a justified action (context bank)
    (r) => {
      const ctx = r.pick([
        { subj: T('Siti', 'Siti'), goalItem: T('a laptop', 'komputer riba') },
        { subj: T('Kumar', 'Kumar'), goalItem: T('a motorcycle', 'motosikal') },
        { subj: T('Priya', 'Priya'), goalItem: T('a study fund', 'dana pembelajaran') },
      ]);
      const inc = r.pick([3000, 3500, 4000]), rent = r.pick([800, 1000]), food = r.pick([600, 800]), trans = r.pick([300, 400]), other = r.pick([200, 300]);
      const goal = r.pick([2000, 3000, 4000]), mo = r.pick([10, 12, 16]);
      const need_ = goal / mo;
      const surplus = inc - (rent + food + trans + other);
      return {
        q: T(`${ctx.subj.en} earns ${rm(inc)} a month. Her expenses are rent ${rm(rent)}, food ${rm(food)}, transport ${rm(trans)} and others ${rm(other)}. She wants to save ${rm(goal)} for ${ctx.goalItem.en} in ${mo} months. (a) Find her monthly surplus. (b) How much must she save each month? (c) Is her goal achievable? Suggest one action.`, `${ctx.subj.ms} memperoleh ${rm(inc)} sebulan. Perbelanjaannya ialah sewa ${rm(rent)}, makanan ${rm(food)}, pengangkutan ${rm(trans)} dan lain-lain ${rm(other)}. Dia ingin menyimpan ${rm(goal)} untuk ${ctx.goalItem.ms} dalam ${mo} bulan. (a) Cari lebihan bulanannya. (b) Berapakah yang mesti disimpannya setiap bulan? (c) Adakah matlamatnya boleh dicapai? Cadangkan satu tindakan.`),
        a: T(`(a) ${rm(surplus)} (b) ${rm(round(need_, 2), need_ % 1 ? 2 : 0)} (c) ${surplus >= need_ ? 'Yes: the surplus is enough.' : 'No: the surplus is too small; reduce variable expenses or extend the time.'}`, `(a) ${rm(surplus)} (b) ${rm(round(need_, 2), need_ % 1 ? 2 : 0)} (c) ${surplus >= need_ ? 'Ya: lebihan mencukupi.' : 'Tidak: lebihan terlalu kecil; kurangkan perbelanjaan boleh ubah atau lanjutkan tempoh.'}`),
        sp: 'l',
      };
    },
    // (2) review and revise after a stated change in circumstances (multi-part)
    (r) => {
      const inc = r.pick([3000, 3500]), exp = r.pick([2400, 2700]), goal = r.pick([3600, 4800]), mo = r.pick([12, 16]);
      const need_ = goal / mo;
      const surplus0 = inc - exp;
      const change = r.pick([{ en: 'her rent increases by RM200 a month', ms: 'sewanya meningkat RM200 sebulan', d: 200 }, { en: 'her transport cost increases by RM150 a month', ms: 'kos pengangkutannya meningkat RM150 sebulan', d: 150 }, { en: 'she takes on a side job earning an extra RM250 a month', ms: 'dia mengambil kerja sampingan yang memperoleh tambahan RM250 sebulan', d: -250 }]);
      const surplus1 = surplus0 - change.d;
      return {
        q: T(`Nurul earns ${rm(inc)} a month with ${rm(exp)} of expenses, saving toward a goal of ${rm(goal)} in ${mo} months. (a) Find her monthly surplus and confirm the goal is achievable. (b) After ${mo / 2} months, ${change.en}. Re-evaluate: is the goal still achievable at the required monthly saving? (c) Suggest one revision to her plan.`, `Nurul memperoleh ${rm(inc)} sebulan dengan perbelanjaan ${rm(exp)}, menyimpan ke arah matlamat ${rm(goal)} dalam ${mo} bulan. (a) Cari lebihan bulanannya dan sahkan matlamat itu boleh dicapai. (b) Selepas ${mo / 2} bulan, ${change.ms}. Nilai semula: adakah matlamat itu masih boleh dicapai pada simpanan bulanan yang diperlukan? (c) Cadangkan satu semakan kepada pelannya.`),
        a: T(`(a) Surplus ${rm(surplus0)}, needs ${rm(need_)} /month: ${surplus0 >= need_ ? 'achievable' : 'not achievable'} (b) New surplus ${rm(surplus1)}: ${surplus1 >= need_ ? 'still achievable' : 'no longer achievable'} (c) ${surplus1 >= need_ ? 'Continue the plan as is.' : 'Cut a variable expense or extend the deadline.'}`, `(a) Lebihan ${rm(surplus0)}, memerlukan ${rm(need_)} /bulan: ${surplus0 >= need_ ? 'boleh dicapai' : 'tidak boleh dicapai'} (b) Lebihan baharu ${rm(surplus1)}: ${surplus1 >= need_ ? 'masih boleh dicapai' : 'tidak lagi boleh dicapai'} (c) ${surplus1 >= need_ ? 'Teruskan pelan seperti sedia ada.' : 'Kurangkan satu perbelanjaan boleh ubah atau lanjutkan tenggat masa.'}`),
        sp: 'l',
      };
    },
    // (3) contingency planning: allocate a contingency fund and assess coverage of an emergency
    (r) => {
      const inc = r.pick([2800, 3200, 3600]);
      const pct = r.pick([5, 10]);
      const fund = round((inc * pct) / 100, 0);
      const monthsSaved = r.int(4, 8);
      const emergency = r.pick([600, 900, 1200]);
      const total = fund * monthsSaved;
      const covered = total >= emergency;
      return {
        q: T(`Ravi sets aside ${pct}% of his ${rm(inc)} monthly income as a contingency fund. (a) Find the monthly contingency amount. (b) After ${monthsSaved} months, an emergency costs ${rm(emergency)}. Is the fund enough? By how much is it short or in surplus?`, `Ravi menyisihkan ${pct}% daripada pendapatan bulanannya ${rm(inc)} sebagai dana kontingensi. (a) Cari jumlah kontingensi bulanan. (b) Selepas ${monthsSaved} bulan, satu kecemasan menelan belanja ${rm(emergency)}. Adakah dana itu mencukupi? Berapakah kekurangan atau lebihannya?`),
        a: T(`(a) ${rm(fund)} (b) Total saved ${rm(total)}: ${covered ? `enough, with a surplus of ${rm(total - emergency)}` : `not enough, short by ${rm(emergency - total)}`}`, `(a) ${rm(fund)} (b) Jumlah tersimpan ${rm(total)}: ${covered ? `mencukupi, dengan lebihan ${rm(total - emergency)}` : `tidak mencukupi, kurang ${rm(emergency - total)}`}`),
        sp: 'l',
      };
    },
    // (4) prioritise needs vs wants under a tight budget, with justification (scenario bank)
    (r) => {
      const inc = r.pick([1800, 2000, 2200]);
      const needsTotal = r.pick([1500, 1700, 1900]);
      const wants = r.sample([T('a new phone', 'telefon baharu'), T('a branded bag', 'beg jenama'), T('a holiday', 'percutian'), T('a gaming console', 'konsol permainan')], 2);
      const leftover = inc - needsTotal;
      return {
        q: T(`Wei Jie earns ${rm(inc)} a month and his essential needs cost ${rm(needsTotal)}. He also wants to buy ${wants[0].en} and ${wants[1].en} this month, but cannot afford both. What is left after needs, and which want should he prioritise? Justify your answer.`, `Wei Jie memperoleh ${rm(inc)} sebulan dan keperluan asasnya berkos ${rm(needsTotal)}. Dia juga mahu membeli ${wants[0].ms} dan ${wants[1].ms} bulan ini, tetapi tidak mampu membeli kedua-duanya. Berapakah yang tinggal selepas keperluan, dan kehendak manakah patut diutamakan? Wajarkan jawapan anda.`),
        a: T(`${rm(leftover)} is left after needs. Needs must always be met first; among the wants, prioritise the one that is most useful or most urgent within the ${rm(leftover)} available (e.g. the cheaper or more necessary item), and save toward the other.`, `${rm(leftover)} tinggal selepas keperluan. Keperluan mesti sentiasa dipenuhi dahulu; antara kehendak itu, utamakan yang paling berguna atau paling mendesak dalam lingkungan ${rm(leftover)} yang ada (cth. item yang lebih murah atau lebih perlu), dan simpan untuk yang satu lagi.`),
        sp: 'l',
      };
    },
    // (5) MCQ: harder case-judgement bank across the whole cycle
    (r) => {
      const bank = [
        { en: 'Someone sets the goal "be rich" with no amount or date, then wonders why they cannot tell if they are making progress', ms: 'Seseorang menetapkan matlamat "menjadi kaya" tanpa jumlah atau tarikh, kemudian tertanya-tanya mengapa dia tidak dapat mengesan kemajuannya', ans: T('the goal is not SMART (not specific, measurable or time-bound); it should be rewritten with an amount and a deadline before a plan can be evaluated against it', 'matlamat itu bukan SMART (tidak spesifik, tidak boleh diukur atau bertempoh masa); ia perlu ditulis semula dengan jumlah dan tenggat masa sebelum sesuatu pelan dapat dinilai berbandingnya') },
        { en: 'Someone creates a detailed budget but never actually checks their spending against it', ms: 'Seseorang mencipta belanjawan terperinci tetapi tidak pernah menyemak perbelanjaannya berbanding belanjawan itu', ans: T('the plan has been created but not carried out; carrying out a plan requires actively following and tracking it', 'pelan itu telah dibuat tetapi tidak dilaksanakan; melaksanakan pelan memerlukan tindakan mengikut dan menjejakinya secara aktif') },
        { en: 'Someone\'s income and essential expenses change significantly, but they keep following their old budget unchanged', ms: 'Pendapatan dan perbelanjaan asas seseorang berubah dengan ketara, tetapi dia terus mengikut belanjawan lamanya tanpa perubahan', ans: T('the plan should be reviewed and revised to reflect the new circumstances, or it will no longer be realistic', 'pelan itu perlu disemak dan diubah suai untuk mencerminkan keadaan baharu, jika tidak ia tidak lagi realistik') },
        { en: 'Someone wants to save for both a short-term goal (a phone in 2 months) and a long-term goal (a house deposit in 10 years) at the same time', ms: 'Seseorang mahu menyimpan untuk matlamat jangka pendek (telefon dalam 2 bulan) dan matlamat jangka panjang (deposit rumah dalam 10 tahun) pada masa yang sama', ans: T('both goals can be part of the same plan, with separate savings targets and timelines for each', 'kedua-dua matlamat boleh menjadi sebahagian daripada pelan yang sama, dengan sasaran simpanan dan garis masa berasingan bagi setiap satu') },
        { en: 'Someone has no contingency fund, and an emergency forces them to borrow money to cover it', ms: 'Seseorang tidak mempunyai dana kontingensi, dan satu kecemasan memaksanya meminjam wang untuk menampungnya', ans: T('the plan should have included a contingency allocation; this should be added when the plan is revised', 'pelan itu sepatutnya merangkumi peruntukan kontingensi; ini perlu ditambah semasa pelan itu disemak semula') },
        { en: 'Someone evaluates their financial status by listing only their income, without any expenses', ms: 'Seseorang menilai status kewangannya dengan menyenaraikan hanya pendapatannya, tanpa sebarang perbelanjaan', ans: T('this evaluation is incomplete; expenses (and ideally assets and liabilities) must also be listed to get a true picture', 'penilaian ini tidak lengkap; perbelanjaan (dan idealnya aset serta liabiliti) juga perlu disenaraikan untuk mendapat gambaran sebenar') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = r.sample(bank.filter((_, i) => i !== ci).map((b) => b.ans), 3);
      const opts = r.shuffle([correct.ans, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct.ans)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o[lang]}`).join('<br>');
      return {
        q: T(`${correct.en}. What should be concluded or done?<br>${f('en')}`, `${correct.ms}. Apakah yang perlu disimpulkan atau dilakukan?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 'm',
      };
    },
  ];
  SPM.extend('F4-10.1', { e: g101e, m: g101m, a: g101a });

  const rmS = (x) => (x < 0 ? '-' + rm(-x) : rm(x)); // signed money, e.g. -RM100 (rm() itself takes non-negative amounts)
  const EXPCAT = [
    [T('rent', 'sewa'), 600, 1000, 'fixed'], [T('loan instalment', 'ansuran pinjaman'), 300, 600, 'fixed'],
    [T('insurance premium', 'premium insurans'), 100, 250, 'fixed'], [T('internet and phone bill', 'bil internet dan telefon'), 80, 150, 'fixed'],
    [T('food', 'makanan'), 500, 800, 'variable'], [T('transport (petrol/fares)', 'pengangkutan (petrol/tambang)'), 200, 400, 'variable'],
    [T('electricity and water', 'elektrik dan air'), 100, 250, 'variable'], [T('entertainment', 'hiburan'), 100, 300, 'variable'],
  ];
  const g102e = [
    // (1) surplus/deficit from income and two expense categories (bank of categories)
    (r) => {
      const inc = r.pick([2200, 2500, 2800, 3200, 3500]);
      const [c1, c2] = r.sample(EXPCAT, 2);
      const v1 = r.step(c1[1], c1[2], 10), v2 = r.step(c2[1], c2[2], 10);
      const s = inc - v1 - v2;
      return {
        q: T(`Monthly income is ${rm(inc)}. ${SPM.cap(c1[0].en)} costs ${rm(v1)} and ${c2[0].en} costs ${rm(v2)}. Find the surplus or deficit.`, `Pendapatan bulanan ialah ${rm(inc)}. ${SPM.cap(c1[0].ms)} berkos ${rm(v1)} dan ${c2[0].ms} berkos ${rm(v2)}. Cari lebihan atau defisit.`),
        a: T(`${s >= 0 ? 'Surplus' : 'Deficit'} of ${rm(Math.abs(s))}`, `${s >= 0 ? 'Lebihan' : 'Defisit'} sebanyak ${rm(Math.abs(s))}`),
        sp: 's',
      };
    },
    // (2) classify an expense as fixed or variable (shared bank with 10.1)
    (r) => {
      const it = r.pick(FIXVAR);
      return {
        q: T(`Is this a fixed or a variable expense: ${it.en}?`, `Adakah ini perbelanjaan tetap atau perbelanjaan boleh ubah: ${it.ms}?`),
        a: it.ans === 'fixed' ? T('Fixed expense', 'Perbelanjaan tetap') : T('Variable expense', 'Perbelanjaan boleh ubah'),
        sp: 'xs',
      };
    },
    // (3) simple annual -> monthly income conversion
    (r) => {
      const annual = r.pick([24000, 30000, 36000, 42000, 48000]);
      return {
        q: T(`Chong's annual salary is ${rm(annual)}. Find his equivalent monthly income.`, `Gaji tahunan Chong ialah ${rm(annual)}. Cari pendapatan bulanan yang setara.`),
        a: T(`${rm(annual / 12)}`),
        w: T(`$${gt(annual)} \\div 12$`),
        sp: 's',
      };
    },
    // (4) total expenses from a short list (sum)
    (r) => {
      const items = r.sample(EXPCAT, 3);
      const vals = items.map((c) => r.step(c[1], c[2], 10));
      const tot = sum(vals);
      return {
        q: T(`Devi's monthly expenses are: ${items.map((c, i) => `${c[0].en} ${rm(vals[i])}`).join(', ')}. Find her total monthly expenses.`, `Perbelanjaan bulanan Devi ialah: ${items.map((c, i) => `${c[0].ms} ${rm(vals[i])}`).join(', ')}. Cari jumlah perbelanjaan bulanannya.`),
        a: T(`${rm(tot)}`),
        sp: 's',
      };
    },
    // (5) recall: the cash-flow formula
    (r) => {
      const wrongs = [T('total expenses $-$ total income', 'jumlah perbelanjaan $-$ jumlah pendapatan'), T('total income $\\times$ total expenses', 'jumlah pendapatan $\\times$ jumlah perbelanjaan'), T('total income $+$ total expenses', 'jumlah pendapatan $+$ jumlah perbelanjaan')];
      const correct = T('total income $-$ total expenses', 'jumlah pendapatan $-$ jumlah perbelanjaan');
      const opts = r.shuffle([correct, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o[lang]}`).join('<br>');
      return {
        q: T(`Monthly cash flow is defined as:<br>${f('en')}`, `Aliran tunai bulanan ditakrifkan sebagai:<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.en}`, `(${letter}) ${correct.ms}`),
        sp: 's',
      };
    },
  ];

  const g102m = [
    // (1) complete a partial cash-flow table (one entry missing, find it)
    (r) => {
      const inc1 = r.pick([2600, 2800, 3000]), inc2 = r.pick([200, 400]);
      const exp = r.pick([2400, 2700, 2900]);
      const cf = inc1 + inc2 - exp;
      need(cf > 0);
      const missWhich = r.pick(['inc2', 'exp']);
      const rows = missWhich === 'inc2'
        ? [['Salary', rm(inc1)], ['Side income', '?'], ['Total expenses', rm(exp)], ['Cash flow', rm(cf)]]
        : [['Salary', rm(inc1)], ['Side income', rm(inc2)], ['Total expenses', '?'], ['Cash flow', rm(cf)]];
      const rowsMs = missWhich === 'inc2'
        ? [['Gaji', rm(inc1)], ['Pendapatan sampingan', '?'], ['Jumlah perbelanjaan', rm(exp)], ['Aliran tunai', rm(cf)]]
        : [['Gaji', rm(inc1)], ['Pendapatan sampingan', rm(inc2)], ['Jumlah perbelanjaan', '?'], ['Aliran tunai', rm(cf)]];
      return {
        q: T(`The table shows part of Zara's monthly cash-flow statement, with one entry missing. Find it.<br>${SPM.table(rows, { rowHead: true })}`, `Jadual menunjukkan sebahagian penyata aliran tunai bulanan Zara, dengan satu entri tidak diketahui. Cari entri itu.<br>${SPM.table(rowsMs, { rowHead: true })}`),
        a: T(`${missWhich === 'inc2' ? rm(inc2) : rm(exp)}`),
        sp: 's',
      };
    },
    // (3) annual-vs-monthly trap: mixed annual and monthly figures, find the correct monthly cash flow
    (r) => {
      const monthlyInc = r.pick([3000, 3200, 3500]);
      const annualBonus = r.pick([2400, 3600, 4800]);
      const monthlyExp = r.pick([2200, 2500, 2800]);
      const trueMonthlyInc = monthlyInc + annualBonus / 12;
      const cf = trueMonthlyInc - monthlyExp;
      const wrongCf = monthlyInc + annualBonus - monthlyExp; // common error: adding the annual figure directly
      return {
        q: T(`Hafiz earns ${rm(monthlyInc)} a month, plus an annual bonus of ${rm(annualBonus)}. His monthly expenses are ${rm(monthlyExp)}. Find his correct monthly cash flow (convert the bonus to a monthly amount first).`, `Hafiz memperoleh ${rm(monthlyInc)} sebulan, ditambah bonus tahunan ${rm(annualBonus)}. Perbelanjaan bulanannya ialah ${rm(monthlyExp)}. Cari aliran tunai bulanannya yang betul (tukar bonus itu kepada jumlah bulanan dahulu).`),
        a: T(`${rm(cf)} (not ${rm(wrongCf)}, which wrongly adds the whole annual bonus into one month)`, `${rm(cf)} (bukan ${rm(wrongCf)}, yang secara salah menambah keseluruhan bonus tahunan ke dalam satu bulan)`),
        w: T(`$${rm(monthlyInc)} + ${rm(annualBonus)} \\div 12 - ${rm(monthlyExp)}$`),
        sp: 'm',
      };
    },
    // (4) quantify shortfall/margin against a savings-percentage target
    (r) => {
      const inc = r.pick([2800, 3200, 3600]);
      const exp = r.pick([2500, 2900, 3300]);
      const targetPct = r.pick([10, 15, 20]);
      const actual = inc - exp;
      const target = (inc * targetPct) / 100;
      const diff = actual - target;
      return {
        q: T(`Alia's monthly income is ${rm(inc)} and her expenses are ${rm(exp)}. Her target is to save at least ${targetPct}% of her income each month. Does she meet this target? By how much is she over or short?`, `Pendapatan bulanan Alia ialah ${rm(inc)} dan perbelanjaannya ialah ${rm(exp)}. Sasarannya ialah menyimpan sekurang-kurangnya ${targetPct}% daripada pendapatannya setiap bulan. Adakah dia mencapai sasaran ini? Berapakah lebihan atau kekurangannya?`),
        a: T(`Actual savings ${rm(actual)}, target ${rm(target)}: she is ${diff >= 0 ? `over by ${rm(diff)}` : `short by ${rm(-diff)}`}`, `Simpanan sebenar ${rm(actual)}, sasaran ${rm(target)}: dia ${diff >= 0 ? `melebihi sebanyak ${rm(diff)}` : `kurang sebanyak ${rm(-diff)}`}`),
        sp: 'm',
      };
    },
    // (5) classify and sum: split a list of expenses into fixed and variable totals
    (r) => {
      const items = r.sample(EXPCAT, 4);
      const vals = items.map((c) => r.step(c[1], c[2], 10));
      const fixedTot = sum(items.map((c, i) => (c[3] === 'fixed' ? vals[i] : 0)));
      const varTot = sum(items.map((c, i) => (c[3] === 'variable' ? vals[i] : 0)));
      return {
        q: T(`Kumar's monthly expenses are: ${items.map((c, i) => `${c[0].en} ${rm(vals[i])}`).join(', ')}. Find (a) his total fixed expenses, (b) his total variable expenses.`, `Perbelanjaan bulanan Kumar ialah: ${items.map((c, i) => `${c[0].ms} ${rm(vals[i])}`).join(', ')}. Cari (a) jumlah perbelanjaan tetapnya, (b) jumlah perbelanjaan boleh ubahnya.`),
        a: T(`(a) ${rm(fixedTot)} (b) ${rm(varTot)}`),
        sp: 'm',
      };
    },
    // (6) spot-the-error: loan instalment excluded from total expenses
    (r) => {
      const items = r.sample(EXPCAT.filter((c) => c[3] === 'variable'), 2);
      const vals = items.map((c) => r.step(c[1], c[2], 10));
      const loan = r.step(300, 600, 50);
      const wrongTot = sum(vals);
      const correctTot = wrongTot + loan;
      return {
        q: T(`A student lists Daniel's monthly expenses as ${items.map((c, i) => `${c[0].en} ${rm(vals[i])}`).join(' and ')}, giving a total of ${rm(wrongTot)}. This ignores his loan instalment of ${rm(loan)}. Find the correct total monthly expenses.`, `Seorang pelajar menyenaraikan perbelanjaan bulanan Daniel sebagai ${items.map((c, i) => `${c[0].ms} ${rm(vals[i])}`).join(' dan ')}, memberikan jumlah ${rm(wrongTot)}. Ini mengabaikan ansuran pinjamannya sebanyak ${rm(loan)}. Cari jumlah perbelanjaan bulanan yang betul.`),
        a: T(`${rm(correctTot)}`),
        sp: 'm',
      };
    },
  ];

  const g102a = [
    // (1) percentage cut applied to the wrong category: error-spot and correct total
    (r) => {
      const inc = r.pick([3000, 3500]);
      const needsAmt = r.pick([1500, 1800]), wantsAmt = r.pick([800, 1000]);
      const cutPct = r.pick([10, 20]);
      const wrongExp = needsAmt * (1 - cutPct / 100) + wantsAmt;
      const correctExp = needsAmt + wantsAmt * (1 - cutPct / 100);
      return {
        q: T(`To save more, a student cuts needs (${rm(needsAmt)}) by ${cutPct}%, keeping wants (${rm(wantsAmt)}) the same, giving new total expenses of ${rm(round(wrongExp, 2))}. Explain why this is poor financial planning, and find the total expenses if wants are cut by ${cutPct}% instead (keeping needs the same).`, `Untuk menyimpan lebih banyak, seorang pelajar mengurangkan keperluan (${rm(needsAmt)}) sebanyak ${cutPct}%, mengekalkan kehendak (${rm(wantsAmt)}) tidak berubah, memberikan jumlah perbelanjaan baharu ${rm(round(wrongExp, 2))}. Terangkan mengapa ini perancangan kewangan yang kurang baik, dan cari jumlah perbelanjaan jika kehendak dikurangkan ${cutPct}% sebaliknya (keperluan dikekalkan).`),
        a: T(`Cutting needs (essential expenses) is risky and often not possible; wants should be cut first. New total with wants cut: ${rm(round(correctExp, 2))}`, `Mengurangkan keperluan (perbelanjaan penting) adalah berisiko dan selalunya tidak boleh dilakukan; kehendak patut dikurangkan dahulu. Jumlah baharu dengan kehendak dikurangkan: ${rm(round(correctExp, 2))}`),
        sp: 'l',
      };
    },
    // (3) one-off annual expense amortised into a monthly budget (trap)
    (r) => {
      const monthlyInc = r.pick([2800, 3200, 3600]);
      const monthlyExp = r.pick([2200, 2500, 2900]);
      const annualOneOff = r.pick([1200, 1800, 2400]); // e.g. annual insurance, road tax
      const item = r.pick([T('car insurance and road tax', 'insurans kereta dan cukai jalan'), T('house insurance', 'insurans rumah'), T('annual school fees', 'yuran sekolah tahunan')]);
      const properMonthlyCF = monthlyInc - monthlyExp - annualOneOff / 12;
      const naiveMonthlyCF = monthlyInc - monthlyExp;
      return {
        q: T(`Amir's monthly income is ${rm(monthlyInc)} and his regular monthly expenses are ${rm(monthlyExp)}. He also pays ${rm(annualOneOff)} once a year for ${item.en}. (a) Find his monthly cash flow if this one-off expense is spread evenly across the year. (b) Explain why ignoring it (as in a naive monthly cash flow of ${rmS(naiveMonthlyCF)}) could cause a problem later.`, `Pendapatan bulanan Amir ialah ${rm(monthlyInc)} dan perbelanjaan tetap bulanannya ialah ${rm(monthlyExp)}. Dia juga membayar ${rm(annualOneOff)} sekali setahun untuk ${item.ms}. (a) Cari aliran tunai bulanannya jika perbelanjaan sekali ini dibahagikan sama rata sepanjang tahun. (b) Terangkan mengapa mengabaikannya (seperti aliran tunai bulanan naif ${rmS(naiveMonthlyCF)}) boleh menyebabkan masalah kemudian.`),
        a: T(`(a) ${rmS(round(properMonthlyCF, 2))} (b) Ignoring the one-off expense overstates the monthly surplus; when the annual bill is due, there may not be enough saved to cover it.`, `(a) ${rmS(round(properMonthlyCF, 2))} (b) Mengabaikan perbelanjaan sekali ini melebih-lebihkan lebihan bulanan; apabila bil tahunan perlu dibayar, simpanan mungkin tidak mencukupi untuk menampungnya.`),
        sp: 'l',
      };
    },
    // (4) multi-part: build a budget from a paragraph, then evaluate against a savings goal
    (r) => {
      const inc = r.pick([2600, 3000, 3400]);
      const needsPct = r.pick([55, 60]), wantsPct = r.pick([20, 25]);
      const savingsPct = 100 - needsPct - wantsPct;
      const goal = r.pick([3600, 4800, 6000]);
      const monthlySaving = (inc * savingsPct) / 100;
      const monthsNeeded = Math.ceil(goal / monthlySaving);
      return {
        q: T(`Sarah's monthly income is ${rm(inc)}. She budgets ${needsPct}% for needs, ${wantsPct}% for wants, and the rest for savings. (a) Find her monthly savings amount. (b) She wants to save ${rm(goal)} for a deposit. How many months will it take at this rate?`, `Pendapatan bulanan Sarah ialah ${rm(inc)}. Dia membelanjawankan ${needsPct}% untuk keperluan, ${wantsPct}% untuk kehendak, dan selebihnya untuk simpanan. (a) Cari jumlah simpanan bulanannya. (b) Dia mahu menyimpan ${rm(goal)} untuk deposit. Berapa lama masa yang diambil pada kadar ini?`),
        a: T(`(a) ${rm(monthlySaving)} (${savingsPct}%) (b) ${monthsNeeded} months`, `(a) ${rm(monthlySaving)} (${savingsPct}%) (b) ${monthsNeeded} bulan`),
        sp: 'l',
      };
    },
    // (5) MCQ: harder budgeting-mistake bank (cash-flow reasoning)
    (r) => {
      const bank = [
        { en: 'a student computes monthly cash flow using an annual income figure but monthly expense figures, without converting either', ms: 'seorang pelajar mengira aliran tunai bulanan menggunakan angka pendapatan tahunan tetapi angka perbelanjaan bulanan, tanpa menukar mana-mana satu', ans: T('the income and expenses must be in the same time unit (both monthly or both annual) before subtracting', 'pendapatan dan perbelanjaan mesti dalam unit masa yang sama (kedua-duanya bulanan atau kedua-duanya tahunan) sebelum ditolak') },
        { en: 'a household budget leaves out a loan instalment because it is paid automatically and "not really an expense"', ms: 'belanjawan isi rumah tidak memasukkan ansuran pinjaman kerana ia dibayar secara automatik dan "bukan benar-benar perbelanjaan"', ans: T('a loan instalment is a real fixed expense and must be included in total expenses', 'ansuran pinjaman adalah perbelanjaan tetap sebenar dan mesti dimasukkan dalam jumlah perbelanjaan') },
        { en: 'someone wants to increase their savings and cuts their rent budget without actually being able to reduce their rent', ms: 'seseorang mahu menambah simpanannya dan mengurangkan belanjawan sewanya tanpa benar-benar dapat mengurangkan sewanya', ans: T('a fixed expense like rent usually cannot be cut easily; variable expenses (like entertainment) should be targeted instead', 'perbelanjaan tetap seperti sewa biasanya tidak boleh dikurangkan dengan mudah; perbelanjaan boleh ubah (seperti hiburan) patut disasarkan sebaliknya') },
        { en: 'a yearly one-off expense (such as insurance) is left out of every monthly budget because it "only happens once a year"', ms: 'perbelanjaan sekali setahun (seperti insurans) tidak dimasukkan dalam setiap belanjawan bulanan kerana ia "hanya berlaku sekali setahun"', ans: T('it should be divided by 12 and included as a small monthly amount, so money is set aside before it is due', 'ia patut dibahagikan dengan 12 dan dimasukkan sebagai jumlah bulanan yang kecil, supaya wang disisihkan sebelum ia perlu dibayar') },
        { en: 'a positive monthly cash flow is reported, but it only accounts for the main salary and ignores a side income', ms: 'aliran tunai bulanan positif dilaporkan, tetapi ia hanya mengambil kira gaji utama dan mengabaikan pendapatan sampingan', ans: T('all sources of income should be included in total income before computing cash flow', 'semua sumber pendapatan patut dimasukkan dalam jumlah pendapatan sebelum mengira aliran tunai') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = r.sample(bank.filter((_, i) => i !== ci).map((b) => b.ans), 3);
      const opts = r.shuffle([correct.ans, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct.ans)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o[lang]}`).join('<br>');
      return {
        q: T(`If ${correct.en}, what is the correct fix?<br>${f('en')}`, `Jika ${correct.ms}, apakah pembetulan yang betul?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 'm',
      };
    },
  ];
  SPM.extend('F4-10.2', { e: g102e, m: g102m, a: g102a });

  /* =============================================================================== 10.3 (enrichment) */
  const FVFORM = T('Future value $= P(1 + r)^n$, where $P$ is the principal, $r$ is the annual growth rate (as a decimal) and $n$ is the number of years.', 'Nilai masa depan $= P(1 + r)^n$, dengan $P$ ialah prinsipal, $r$ ialah kadar pertumbuhan tahunan (sebagai perpuluhan) dan $n$ ialah bilangan tahun.');
  const fv = (P, rPct, n) => P * Math.pow(1 + rPct / 100, n);

  const g103e = [
    // (1) direct compute: future value from supplied compound-growth formula
    (r) => {
      const P = r.pick([1000, 2000, 3000, 5000]), rPct = r.pick([2, 3, 4, 5]), nY = r.pick([2, 3]);
      const val = round(fv(P, rPct, nY), 2);
      return {
        q: T(`${FVFORM.en} Ravi invests ${rm(P)} at an annual growth rate of ${rPct}% for ${nY} years. Find the future value.`, `${FVFORM.ms} Ravi melabur ${rm(P)} pada kadar pertumbuhan tahunan ${rPct}% selama ${nY} tahun. Cari nilai masa depannya.`),
        a: T(`${rm(val)}`),
        w: T(`$${P}(1 + ${n(rPct / 100)})^${nY}$`),
        sp: 's',
      };
    },
    // (2) direct compute: base salary + commission
    (r) => {
      const base = r.pick([1000, 1200, 1500]), pct = r.pick([5, 8, 10]), sales = r.pick([2000, 4000, 6000]);
      const earn = base + (sales * pct) / 100;
      return {
        q: T(`A salesperson earns a base salary of ${rm(base)} plus ${pct}% commission on sales. Find her total pay in a month with sales of ${rm(sales)}.`, `Seorang jurujual memperoleh gaji asas ${rm(base)} ditambah ${pct}% komisen ke atas jualan. Cari jumlah gajinya dalam bulan dengan jualan ${rm(sales)}.`),
        a: T(`${rm(earn)}`),
        w: T(`${rm(base)} $+ ${n(pct / 100)} \\times ${sales}$`),
        sp: 's',
      };
    },
    // (3) MCQ: which job pays more at a given (non-break-even) sales figure
    (r) => {
      const fixed = r.pick([2000, 2200, 2500]);
      const base = r.pick([1200, 1500]), pct = r.pick([10, 15]);
      const sales = r.pick([4000, 6000, 8000]);
      const commEarn = base + (sales * pct) / 100;
      const better = commEarn > fixed ? 'B' : commEarn < fixed ? 'A' : 'tie';
      return {
        q: T(`Job $A$ pays a fixed ${rm(fixed)} a month. Job $B$ pays ${rm(base)} plus ${pct}% commission on sales. If monthly sales are ${rm(sales)}, which job pays more?`, `Kerja $A$ membayar tetap ${rm(fixed)} sebulan. Kerja $B$ membayar ${rm(base)} ditambah ${pct}% komisen ke atas jualan. Jika jualan bulanan ialah ${rm(sales)}, kerja manakah membayar lebih?`),
        a: T(better === 'tie' ? 'Both pay the same' : `Job ${better}: ${rm(better === 'A' ? fixed : commEarn)} vs ${rm(better === 'A' ? commEarn : fixed)}`, better === 'tie' ? 'Kedua-dua membayar sama' : `Kerja ${better}: ${rm(better === 'A' ? fixed : commEarn)} berbanding ${rm(better === 'A' ? commEarn : fixed)}`),
        sp: 's',
      };
    },
    // (4) recall: what does each variable in the supplied formula represent (MCQ)
    (r) => {
      const bank = [
        { key: 'P', ans: T('the principal (starting amount)', 'prinsipal (jumlah permulaan)') },
        { key: 'r', ans: T('the annual growth rate as a decimal', 'kadar pertumbuhan tahunan sebagai perpuluhan') },
        { key: 'n', ans: T('the number of years', 'bilangan tahun') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = bank.filter((_, i) => i !== ci).map((b) => b.ans);
      const opts = r.shuffle([correct.ans, ...wrongs, T('the final future value', 'nilai masa depan akhir')]);
      const letter = 'ABCD'[opts.indexOf(correct.ans)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o[lang]}`).join('<br>');
      return {
        q: T(`${FVFORM.en} In this formula, what does $${correct.key}$ represent?<br>${f('en')}`, `${FVFORM.ms} Dalam formula ini, apakah maksud $${correct.key}$?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 's',
      };
    },
    // (5) true/false: a pure-commission job with no sales earns nothing (conceptual)
    (r) => {
      const pct = r.pick([5, 8, 10, 12]);
      return {
        q: T(`A job pays no base salary, only ${pct}% commission on sales. True or false: if there are no sales in a month, the pay for that month is RM0.`, `Satu kerja tidak membayar gaji asas, hanya komisen ${pct}% ke atas jualan. Benar atau palsu: jika tiada jualan dalam sebulan, gaji bagi bulan itu ialah RM0.`),
        a: T('True', 'Benar'),
        sp: 'xs',
      };
    },
    // (6) MCQ: which description matches a given pay/growth fact (big conceptual bank)
    (r) => {
      const bank = [
        { en: 'a job that pays a fixed monthly salary with no commission', ms: 'satu kerja yang membayar gaji bulanan tetap tanpa komisen', ans: T('the pay is the same every month, no matter how much is sold', 'gajinya adalah sama setiap bulan, tidak kira berapa banyak yang dijual') },
        { en: 'a job that pays only commission, with a higher commission rate than another job', ms: 'satu kerja yang membayar komisen sahaja, dengan kadar komisen yang lebih tinggi daripada satu kerja lain', ans: T('it does not automatically pay more; the total also depends on the amount of sales achieved', 'ia tidak semestinya membayar lebih; jumlahnya turut bergantung pada jumlah jualan yang dicapai') },
        { en: 'an investment that compounds annually, compared with one earning the same rate but only once (simple growth) over several years', ms: 'satu pelaburan yang bergabung setiap tahun, berbanding satu lagi yang memperoleh kadar yang sama tetapi hanya sekali (pertumbuhan mudah) sepanjang beberapa tahun', ans: T('the compounding investment grows faster over time, since it earns growth on previous growth', 'pelaburan bergabung itu berkembang lebih pantas dari semasa ke semasa, kerana ia memperoleh pertumbuhan ke atas pertumbuhan sebelumnya') },
        { en: 'the sales figure exactly at a job\'s break-even point', ms: 'angka jualan tepat pada titik pulang modal sesuatu kerja', ans: T('both pay schemes give exactly the same total pay at that sales figure', 'kedua-dua skim gaji memberikan jumlah gaji yang sama tepat pada angka jualan itu') },
        { en: 'a job\'s pay at a sales figure just above its break-even point, when the commission job has the higher rate', ms: 'gaji sesuatu kerja pada angka jualan sedikit melebihi titik pulang modalnya, apabila kerja komisen mempunyai kadar yang lebih tinggi', ans: T('the commission job now pays more than the fixed-salary job', 'kerja komisen itu kini membayar lebih daripada kerja bergaji tetap') },
        { en: 'a job\'s pay at a sales figure just below its break-even point, when the commission job has the higher rate', ms: 'gaji sesuatu kerja pada angka jualan sedikit di bawah titik pulang modalnya, apabila kerja komisen mempunyai kadar yang lebih tinggi', ans: T('the fixed-salary job now pays more than the commission job', 'kerja bergaji tetap itu kini membayar lebih daripada kerja komisen') },
        { en: 'the future value of an investment after 0 years, using the compound-growth formula', ms: 'nilai masa depan sesuatu pelaburan selepas 0 tahun, menggunakan formula pertumbuhan gabungan', ans: T('it equals the original principal, since nothing has grown yet', 'ia sama dengan prinsipal asal, kerana belum berlaku sebarang pertumbuhan') },
        { en: 'doubling the number of years invested (with the same rate) in the compound-growth formula', ms: 'menggandakan bilangan tahun pelaburan (dengan kadar yang sama) dalam formula pertumbuhan gabungan', ans: T('the future value more than doubles the total growth, since growth compounds over the extra years, not just once', 'nilai masa depan menghasilkan lebih daripada gandaan pertumbuhan, kerana pertumbuhan bergabung sepanjang tahun tambahan, bukan sekali sahaja') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = r.sample(bank.filter((_, i) => i !== ci).map((b) => b.ans), 3);
      const opts = r.shuffle([correct.ans, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct.ans)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o[lang]}`).join('<br>');
      return {
        q: T(`For ${correct.en}, which statement is true?<br>${f('en')}`, `Bagi ${correct.ms}, kenyataan manakah yang benar?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 's',
      };
    },
  ];

  const g103m = [
    // (2) compound growth achievability: is a supplied future value enough for a stated goal
    (r) => {
      const P = r.pick([2000, 3000, 5000]), rPct = r.pick([3, 4, 5]), nY = r.pick([3, 4, 5]);
      const val = round(fv(P, rPct, nY), 2);
      const goal = r.pick([2500, 3500, 5500, 6500]);
      const ok = val >= goal;
      return {
        q: T(`${FVFORM.en} Farah invests ${rm(P)} at ${rPct}% a year for ${nY} years, aiming to reach ${rm(goal)}. Find the future value and state whether her goal is achieved.`, `${FVFORM.ms} Farah melabur ${rm(P)} pada ${rPct}% setahun selama ${nY} tahun, dengan sasaran mencapai ${rm(goal)}. Cari nilai masa depannya dan nyatakan sama ada matlamatnya tercapai.`),
        a: T(`${rm(val)}: ${ok ? `goal achieved, with a surplus of ${rm(round(val - goal, 2))}` : `goal not achieved, short by ${rm(round(goal - val, 2))}`}`, `${rm(val)}: ${ok ? `matlamat tercapai, dengan lebihan ${rm(round(val - goal, 2))}` : `matlamat tidak tercapai, kurang ${rm(round(goal - val, 2))}`}`),
        sp: 'm',
      };
    },
    // (3) spot-the-error: simple-interest-style calculation used instead of compound growth
    (r) => {
      const P = r.pick([2000, 4000]), rPct = r.pick([4, 5]), nY = r.pick([3, 4]);
      const wrongVal = P + P * (rPct / 100) * nY; // simple-growth style (wrong for compound)
      const correctVal = round(fv(P, rPct, nY), 2);
      return {
        q: T(`${FVFORM.en} A student invests ${rm(P)} at ${rPct}% a year, compounded annually, for ${nY} years, and computes the future value as $${P} + ${P} \\times ${n(rPct / 100)} \\times ${nY} = ${n(round(wrongVal, 2))}$. Explain the mistake and find the correct future value.`, `${FVFORM.ms} Seorang pelajar melabur ${rm(P)} pada ${rPct}% setahun, bergabung setiap tahun, selama ${nY} tahun, dan mengira nilai masa depan sebagai $${P} + ${P} \\times ${n(rPct / 100)} \\times ${nY} = ${n(round(wrongVal, 2))}$. Terangkan kesilapan itu dan cari nilai masa depan yang betul.`),
        a: T(`The mistake: this adds simple growth on the original principal only, but compound growth earns growth on previous growth too. Correct: ${rm(correctVal)}`, `Kesilapan: ini menambah pertumbuhan mudah ke atas prinsipal asal sahaja, tetapi pertumbuhan gabungan turut memperoleh pertumbuhan ke atas pertumbuhan sebelumnya. Betul: ${rm(correctVal)}`),
        sp: 'm',
      };
    },
    // (4) work backwards: find the required principal P for a target future value
    (r) => {
      const rPct = r.pick([3, 4, 5]), nY = r.pick([2, 3]);
      const target = r.pick([3000, 4000, 5000]);
      const factor = Math.pow(1 + rPct / 100, nY);
      const P = round(target / factor, 2);
      return {
        q: T(`${FVFORM.en} Kumar wants his investment to grow to ${rm(target)} after ${nY} years at ${rPct}% a year. Find the principal $P$ he must invest now.`, `${FVFORM.ms} Kumar mahu pelaburannya berkembang kepada ${rm(target)} selepas ${nY} tahun pada ${rPct}% setahun. Cari prinsipal $P$ yang perlu dilaburkannya sekarang.`),
        a: T(`${rm(P)}`),
        w: T(`$P(1 + ${n(rPct / 100)})^${nY} = ${target}$`),
        sp: 'm',
      };
    },
    // (5) tiered commission: fully specified two-tier scheme, direct compute
    (r) => {
      const base = r.pick([1000, 1500]), threshold = r.pick([3000, 5000]), pct1 = r.pick([5, 8]), pct2 = pct1 + r.pick([3, 5]);
      const sales = threshold + r.pick([1000, 2000, 3000]);
      const earn = base + (threshold * pct1) / 100 + ((sales - threshold) * pct2) / 100;
      return {
        q: T(`A job pays a base salary of ${rm(base)}, plus ${pct1}% commission on the first ${rm(threshold)} of sales, and ${pct2}% commission on any sales above that. Find the total pay for monthly sales of ${rm(sales)}.`, `Satu kerja membayar gaji asas ${rm(base)}, ditambah komisen ${pct1}% ke atas ${rm(threshold)} jualan yang pertama, dan komisen ${pct2}% ke atas sebarang jualan melebihi itu. Cari jumlah gaji bagi jualan bulanan ${rm(sales)}.`),
        a: T(`${rm(round(earn, 2))}`),
        w: T(`${rm(base)} $+ ${n(pct1 / 100)} \\times ${threshold} + ${n(pct2 / 100)} \\times ${sales - threshold}$`),
        sp: 'm',
      };
    },
    // (6) compare two job offers at a specific sales volume, multi-part
    (r) => {
      const fixed = r.pick([2200, 2500, 2800]);
      const base = r.pick([1200, 1500]), pct = r.pick([10, 12, 15]);
      const sales = r.pick([5000, 7000, 9000]);
      const commEarn = base + (sales * pct) / 100;
      const diff = Math.abs(commEarn - fixed);
      const better = commEarn > fixed ? 'B' : 'A';
      return {
        q: T(`Job $A$ pays a fixed ${rm(fixed)} a month. Job $B$ pays ${rm(base)} plus ${pct}% commission. (a) Find Job $B$'s pay if monthly sales are ${rm(sales)}. (b) Which job pays more, and by how much?`, `Kerja $A$ membayar tetap ${rm(fixed)} sebulan. Kerja $B$ membayar ${rm(base)} ditambah komisen ${pct}%. (a) Cari gaji Kerja $B$ jika jualan bulanan ialah ${rm(sales)}. (b) Kerja manakah membayar lebih, dan berapa banyak lebih?`),
        a: T(`(a) ${rm(commEarn)} (b) Job ${better}, by ${rm(round(diff, 2))}`, `(a) ${rm(commEarn)} (b) Kerja ${better}, sebanyak ${rm(round(diff, 2))}`),
        sp: 'm',
      };
    },
    // (7) two commission-only jobs (no fixed base) compared at a given sales volume
    (r) => {
      const job = r.pick(SPM.bank.jobs);
      const pctA = r.pick([8, 10]), pctB = pctA + r.pick([3, 4, 5]);
      const baseA = r.pick([1500, 1800]), baseB = 0;
      const sales = r.pick([3000, 4000, 5000]);
      const earnA = baseA + (sales * pctA) / 100, earnB = baseB + (sales * pctB) / 100;
      const better = earnA > earnB ? 'A' : 'B';
      return {
        q: T(`As ${job.en}, Job $A$ pays ${rm(baseA)} plus ${pctA}% commission; Job $B$ pays no base salary but ${pctB}% commission on all sales. For monthly sales of ${rm(sales)}, which job pays more, and by how much?`, `Sebagai ${job.ms}, Kerja $A$ membayar ${rm(baseA)} ditambah komisen ${pctA}%; Kerja $B$ tidak membayar gaji asas tetapi komisen ${pctB}% ke atas semua jualan. Bagi jualan bulanan ${rm(sales)}, kerja manakah membayar lebih, dan berapa banyak lebih?`),
        a: T(`Job $A$: ${rm(earnA)}; Job $B$: ${rm(earnB)}; Job ${better} pays more, by ${rm(round(Math.abs(earnA - earnB), 2))}`, `Kerja $A$: ${rm(earnA)}; Kerja $B$: ${rm(earnB)}; Kerja ${better} membayar lebih, sebanyak ${rm(round(Math.abs(earnA - earnB), 2))}`),
        sp: 'm',
      };
    },
    // (8) MCQ: common pitfalls bank for cross-topic money calculations
    (r) => {
      const bank = [
        { en: 'a job comparison problem gives commission rates in different units for the two jobs (e.g. one as a percentage, one as "RM per item")', ms: 'masalah perbandingan kerja memberikan kadar komisen dalam unit yang berbeza bagi kedua-dua kerja (cth. satu sebagai peratusan, satu lagi sebagai "RM setiap item")', ans: T('both must be converted to the same basis (e.g. both as an amount per RM of sales) before comparing', 'kedua-duanya mesti ditukar kepada asas yang sama (cth. kedua-duanya sebagai jumlah bagi setiap RM jualan) sebelum dibandingkan') },
        { en: 'a compound-growth question gives a rate "per year" but asks for the value after a number of months', ms: 'satu soalan pertumbuhan gabungan memberikan kadar "setahun" tetapi meminta nilai selepas beberapa bulan', ans: T('the time period must be converted to years (or the rate converted) to match the formula\'s units consistently', 'tempoh masa itu mesti ditukar kepada tahun (atau kadar itu ditukar) untuk memadankan unit formula secara konsisten') },
        { en: 'a break-even calculation is set up correctly, but the student rounds the sales figure down before checking which job actually pays more just below it', ms: 'pengiraan pulang modal disediakan dengan betul, tetapi pelajar membundarkan angka jualan ke bawah sebelum menyemak kerja mana yang sebenarnya membayar lebih sedikit di bawahnya', ans: T('rounding before comparing can flip the conclusion; the unrounded break-even value should be used to decide which side of it a given sales figure falls on', 'membundarkan sebelum membandingkan boleh menyongsangkan kesimpulan; nilai pulang modal yang tidak dibundarkan patut digunakan untuk menentukan sebelah mana angka jualan yang diberikan berada') },
        { en: 'a student compares an investment\'s future value with a savings goal that was stated in "today\'s money", without being told to ignore inflation', ms: 'seorang pelajar membandingkan nilai masa depan sesuatu pelaburan dengan matlamat simpanan yang dinyatakan dalam "nilai wang hari ini", tanpa diberitahu untuk mengabaikan inflasi', ans: T('unless told otherwise, use the figures exactly as given in the question and do not introduce assumptions (like inflation) that are not supplied', 'kecuali dinyatakan sebaliknya, gunakan angka seperti yang diberikan dalam soalan dan jangan perkenalkan andaian (seperti inflasi) yang tidak diberikan') },
        { en: 'a job-comparison question does not state whether the commission percentage is calculated on total sales or on profit', ms: 'soalan perbandingan kerja tidak menyatakan sama ada peratusan komisen dikira ke atas jumlah jualan atau ke atas keuntungan', ans: T('this is ambiguous; the question must state clearly what the commission percentage is applied to', 'ini adalah kabur; soalan mesti menyatakan dengan jelas apa yang dikenakan peratusan komisen itu') },
        { en: 'two compound-growth options are compared, but they use different numbers of years', ms: 'dua pilihan pertumbuhan gabungan dibandingkan, tetapi kedua-duanya menggunakan bilangan tahun yang berbeza', ans: T('comparing the two future values directly can be misleading; the time period should also be considered, not just the final amount', 'membandingkan kedua-dua nilai masa depan secara terus boleh mengelirukan; tempoh masa juga perlu dipertimbangkan, bukan hanya jumlah akhir') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = r.sample(bank.filter((_, i) => i !== ci).map((b) => b.ans), 3);
      const opts = r.shuffle([correct.ans, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct.ans)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o[lang]}`).join('<br>');
      return {
        q: T(`If ${correct.en}, what should be done?<br>${f('en')}`, `Jika ${correct.ms}, apakah yang perlu dilakukan?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 'm',
      };
    },
  ];

  const g103a = [
    // (1) full job comparison: break-even + evaluate at an expected volume + recommend
    (r) => {
      const fixed = r.pick([2200, 2500, 2800]);
      const base = r.pick([1000, 1500]), pct = r.pick([8, 10, 12]);
      const breakeven = (fixed - base) / (pct / 100);
      const expected = r.pick([4000, 6000, 9000]);
      const commAtExpected = base + (expected * pct) / 100;
      const recommend = commAtExpected > fixed ? 'B' : 'A';
      return {
        q: T(`Job $A$ pays a fixed ${rm(fixed)} a month. Job $B$ pays ${rm(base)} plus ${pct}% commission on sales. (a) Find the break-even sales at which both jobs pay the same. (b) If Amir expects monthly sales of about ${rm(expected)}, find his pay under Job $B$. (c) Which job should he choose, and why?`, `Kerja $A$ membayar tetap ${rm(fixed)} sebulan. Kerja $B$ membayar ${rm(base)} ditambah komisen ${pct}% ke atas jualan. (a) Cari jualan pulang modal di mana kedua-dua kerja membayar sama. (b) Jika Amir menjangkakan jualan bulanan sekitar ${rm(expected)}, cari gajinya di bawah Kerja $B$. (c) Kerja manakah patut dipilihnya, dan mengapa?`),
        a: T(`(a) ${rm(round(breakeven, 2))} (b) ${rm(commAtExpected)} (c) Job ${recommend}: ${recommend === 'B' ? `Job B's commission pay (${rm(commAtExpected)}) is higher than Job A's fixed pay (${rm(fixed)}) at this sales level` : `Job A's fixed pay (${rm(fixed)}) is higher than Job B's commission pay (${rm(commAtExpected)}) at this sales level`}`, `(a) ${rm(round(breakeven, 2))} (b) ${rm(commAtExpected)} (c) Kerja ${recommend}: ${recommend === 'B' ? `gaji komisen Kerja B (${rm(commAtExpected)}) lebih tinggi daripada gaji tetap Kerja A (${rm(fixed)}) pada paras jualan ini` : `gaji tetap Kerja A (${rm(fixed)}) lebih tinggi daripada gaji komisen Kerja B (${rm(commAtExpected)}) pada paras jualan ini`}`),
        sp: 'l',
      };
    },
    // (2) compound growth multi-part: achievability, margin, and a suggested revision
    (r) => {
      const P = r.pick([3000, 4000, 5000]), rPct = r.pick([3, 4, 5]), nY = r.pick([4, 5, 6]);
      const val = round(fv(P, rPct, nY), 2);
      const goal = r.pick([4000, 5000, 6500, 8000]);
      const ok = val >= goal;
      const nY2 = nY + 2;
      const val2 = round(fv(P, rPct, nY2), 2);
      return {
        q: T(`${FVFORM.en} Siti invests ${rm(P)} at ${rPct}% a year, aiming for ${rm(goal)} to fund her studies. (a) Find the future value after ${nY} years. (b) Is her goal achieved? By how much is she over or short? (c) If not achieved, find the future value after ${nY2} years instead, and state whether that is enough.`, `${FVFORM.ms} Siti melabur ${rm(P)} pada ${rPct}% setahun, dengan sasaran ${rm(goal)} untuk membiayai pengajiannya. (a) Cari nilai masa depan selepas ${nY} tahun. (b) Adakah matlamatnya tercapai? Berapakah lebihan atau kekurangannya? (c) Jika tidak tercapai, cari nilai masa depan selepas ${nY2} tahun pula, dan nyatakan sama ada itu mencukupi.`),
        a: T(`(a) ${rm(val)} (b) ${ok ? `achieved, surplus ${rm(round(val - goal, 2))}` : `not achieved, short by ${rm(round(goal - val, 2))}`} (c) ${ok ? 'N/A, already achieved' : `after ${nY2} years: ${rm(val2)}, ${val2 >= goal ? 'now enough' : 'still not enough'}`}`, `(a) ${rm(val)} (b) ${ok ? `tercapai, lebihan ${rm(round(val - goal, 2))}` : `tidak tercapai, kurang ${rm(round(goal - val, 2))}`} (c) ${ok ? 'T/B, sudah tercapai' : `selepas ${nY2} tahun: ${rm(val2)}, ${val2 >= goal ? 'kini mencukupi' : 'masih tidak mencukupi'}`}`),
        sp: 'l',
      };
    },
    // (3) compare two savings options for the same goal (different P, r, n)
    (r) => {
      const goal = r.pick([4000, 5000, 6000]);
      const optA = { P: r.pick([3000, 3500]), rPct: r.pick([3, 4]), nY: r.pick([4, 5]) };
      const optB = { P: optA.P - r.pick([500, 1000]), rPct: optA.rPct + r.pick([2, 3]), nY: optA.nY };
      const valA = round(fv(optA.P, optA.rPct, optA.nY), 2);
      const valB = round(fv(optB.P, optB.rPct, optB.nY), 2);
      const better = valA > valB ? 'A' : 'B';
      return {
        q: T(`${FVFORM.en} Two savings options over ${optA.nY} years: Option $A$ invests ${rm(optA.P)} at ${optA.rPct}% a year; Option $B$ invests ${rm(optB.P)} at ${optB.rPct}% a year. Both aim for a goal of ${rm(goal)}. Find the future value of each option and state which is better for reaching the goal.`, `${FVFORM.ms} Dua pilihan simpanan selama ${optA.nY} tahun: Pilihan $A$ melabur ${rm(optA.P)} pada ${optA.rPct}% setahun; Pilihan $B$ melabur ${rm(optB.P)} pada ${optB.rPct}% setahun. Kedua-duanya menyasarkan matlamat ${rm(goal)}. Cari nilai masa depan bagi setiap pilihan dan nyatakan pilihan mana yang lebih baik untuk mencapai matlamat itu.`),
        a: T(`Option $A$: ${rm(valA)}; Option $B$: ${rm(valB)}; Option ${better} is better`, `Pilihan $A$: ${rm(valA)}; Pilihan $B$: ${rm(valB)}; Pilihan ${better} adalah lebih baik`),
        sp: 'l',
      };
    },
    // (4) MCQ: harder conceptual bank on when/how these cross-topic tools apply
    (r) => {
      const bank = [
        { en: 'a question compares two job offers but does not state whether commission applies to all sales or only sales above a threshold', ms: 'satu soalan membandingkan dua tawaran kerja tetapi tidak menyatakan sama ada komisen dikenakan ke atas semua jualan atau hanya jualan melebihi ambang tertentu', ans: T('the commission rule is ambiguous; every rule needed to compute pay must be fully specified in the question', 'peraturan komisen itu kabur; setiap peraturan yang diperlukan untuk mengira gaji mesti dinyatakan sepenuhnya dalam soalan') },
        { en: 'a compound-growth question does not state how often the growth is compounded (e.g. annually)', ms: 'satu soalan pertumbuhan gabungan tidak menyatakan kekerapan penggabungan (cth. tahunan)', ans: T('the compounding convention must be supplied; without it, the future value cannot be computed uniquely', 'konvensyen penggabungan mesti diberikan; tanpanya, nilai masa depan tidak dapat dikira secara unik') },
        { en: 'a student assumes a job\'s break-even sales figure is also the sales figure that maximises their pay', ms: 'seorang pelajar menganggap angka jualan pulang modal sesuatu kerja juga angka jualan yang memaksimumkan gajinya', ans: T('this is a misunderstanding; the break-even point is only where the two pay schemes are equal, not a maximum', 'ini adalah salah faham; titik pulang modal hanya tempat kedua-dua skim gaji adalah sama, bukan satu maksimum') },
        { en: 'a long-term goal is assessed using a compound-growth calculation, and the result is compared with the stated goal amount', ms: 'satu matlamat jangka panjang dinilai menggunakan pengiraan pertumbuhan gabungan, dan hasilnya dibandingkan dengan jumlah matlamat yang dinyatakan', ans: T('this is a valid use of the supplied formula, as long as every rate and time period used is explicitly given', 'ini adalah penggunaan formula yang diberikan secara sah, selagi setiap kadar dan tempoh masa yang digunakan dinyatakan secara eksplisit') },
        { en: 'a goal is not achieved by a compound-growth investment after the stated number of years', ms: 'satu matlamat tidak tercapai melalui pelaburan pertumbuhan gabungan selepas bilangan tahun yang dinyatakan', ans: T('the shortfall can be found by comparing the future value with the goal; investing longer, investing more, or finding a higher rate are all ways to close the gap', 'kekurangan itu boleh dicari dengan membandingkan nilai masa depan dengan matlamat itu; melabur lebih lama, melabur lebih banyak, atau mencari kadar yang lebih tinggi semuanya adalah cara untuk merapatkan jurang itu') },
        { en: 'a job pays a very high commission rate but has historically low sales volumes', ms: 'satu kerja membayar kadar komisen yang sangat tinggi tetapi mempunyai jumlah jualan yang secara sejarahnya rendah', ans: T('a high rate alone does not guarantee higher pay; the actual (or expected) sales volume must be used to compute and compare the real earnings', 'kadar yang tinggi sahaja tidak menjamin gaji yang lebih tinggi; jumlah jualan sebenar (atau dijangka) mesti digunakan untuk mengira dan membandingkan pendapatan sebenar') },
        { en: 'two job offers are compared only at their break-even sales figure, and no information about likely sales is considered', ms: 'dua tawaran kerja dibandingkan hanya pada angka jualan pulang modalnya, dan tiada maklumat tentang jualan yang berkemungkinan dipertimbangkan', ans: T('the break-even point alone does not say which job is better; the expected sales level (above or below break-even) is what actually decides which job pays more', 'titik pulang modal sahaja tidak menentukan kerja mana yang lebih baik; paras jualan yang dijangka (melebihi atau di bawah pulang modal) itulah yang sebenarnya menentukan kerja mana membayar lebih') },
      ];
      const ci = r.int(0, bank.length - 1);
      const correct = bank[ci];
      const wrongs = r.sample(bank.filter((_, i) => i !== ci).map((b) => b.ans), 3);
      const opts = r.shuffle([correct.ans, ...wrongs]);
      const letter = 'ABCD'[opts.indexOf(correct.ans)];
      const f = (lang) => opts.map((o, i) => `(${'ABCD'[i]}) ${o[lang]}`).join('<br>');
      return {
        q: T(`If ${correct.en}, what is true?<br>${f('en')}`, `Jika ${correct.ms}, apakah yang benar?<br>${f('ms')}`),
        a: T(`(${letter}) ${correct.ans.en}`, `(${letter}) ${correct.ans.ms}`),
        sp: 'm',
      };
    },
  ];
  SPM.extend('F4-10.3', { e: g103e, m: g103m, a: g103a });
})();

