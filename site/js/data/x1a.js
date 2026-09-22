/* Variety pack x1a: Form 1, Chapter 1 Rational Numbers (topics 1.1, 1.2, 1.3, 1.4, 1.5, 1.5E). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, Fr, rm, par, gcd, lcm, round } = SPM;
  const T = SPM.L, S = SPM.svg;
  const fr = (a, b) => Fr.make(a, b);
  const frT = Fr.tex, frP = Fr.texP;
  const LET = 'PQRSTUVW';
  const OPT = 'ABCD';
  const lst = (a, f) => a.map(f || n).join(',\\ ');
  const asW = (a) => (a ? T('ascending order', 'tertib menaik') : T('descending order', 'tertib menurun'));
  const cmpS = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
  const sortBy = (arr, asc, key) => arr.slice().sort((x, y) => (asc ? 1 : -1) * ((key ? key(x) : x) - (key ? key(y) : y)));

  /* multiple choice: returns { q: option text, ans: '(B) $..$' } */
  function mcq(r, correct, wrongs, fmt) {
    fmt = fmt || ((x) => `$${x}$`);
    const all = [correct].concat(wrongs);
    need(new Set(all.map((x) => fmt(x))).size === all.length);
    const order = r.shuffle(all);
    const i = order.indexOf(correct);
    return { q: order.map((x, k) => `(${OPT[k]}) ${fmt(x)}`).join(' &emsp; '), ans: `(${OPT[i]}) ${fmt(correct)}` };
  }
  /* multiple choice with bilingual options (each option is {en, ms}) */
  function mcqT(r, correct, wrongs) {
    const all = [correct].concat(wrongs);
    need(new Set(all.map((x) => x.en)).size === all.length);
    const order = r.shuffle(all);
    const i = order.indexOf(correct);
    const f = (k) => order.map((x, j) => `(${OPT[j]}) ${x[k]}`).join('<br>');
    return { q: T(f('en'), f('ms')), ans: T(`(${OPT[i]}) ${correct.en}`, `(${OPT[i]}) ${correct.ms}`) };
  }
  const numLine = (lo, hi, step, pts, o) => S.numberLine(Object.assign({ min: lo, max: hi, step, points: pts.map((v, i) => ({ v, label: LET[i] })), width: 400 }, o || {}));

  const COLD = [['Seoul', 'Seoul'], ['Tokyo', 'Tokyo'], ['Beijing', 'Beijing'], ['Moscow', 'Moscow'], ['Sapporo', 'Sapporo'], ['Toronto', 'Toronto'], ['Berlin', 'Berlin'], ['Helsinki', 'Helsinki'], ['Oslo', 'Oslo'], ['Ottawa', 'Ottawa']].map((c) => ({ en: c[0], ms: c[1] }));
  const rmS = (x) => (x < 0 ? `-RM${-x}` : `RM${x}`);
  /* situations: pairs of (positive, negative) descriptions of a quantity t */
  const CTX = [
    { en: (t) => `a temperature of ${t}°C above zero`, ms: (t) => `suhu ${t}°C di atas sifar`, s: 1 },
    { en: (t) => `a temperature of ${t}°C below zero`, ms: (t) => `suhu ${t}°C di bawah sifar`, s: -1 },
    { en: (t) => `a hilltop ${t} m above sea level`, ms: (t) => `puncak bukit ${t} m di atas aras laut`, s: 1 },
    { en: (t) => `a diver ${t} m below sea level`, ms: (t) => `seorang penyelam ${t} m di bawah aras laut`, s: -1 },
    { en: (t) => `a profit of RM${t}`, ms: (t) => `keuntungan RM${t}`, s: 1 },
    { en: (t) => `a loss of RM${t}`, ms: (t) => `kerugian RM${t}`, s: -1 },
    { en: (t) => `a deposit of RM${t} into a bank account`, ms: (t) => `deposit RM${t} ke dalam akaun bank`, s: 1 },
    { en: (t) => `a withdrawal of RM${t} from a bank account`, ms: (t) => `pengeluaran RM${t} daripada akaun bank`, s: -1 },
    { en: (t) => `an office ${t} floors above the ground floor`, ms: (t) => `sebuah pejabat ${t} tingkat di atas tingkat bawah`, s: 1 },
    { en: (t) => `a car park ${t} floors below the ground floor`, ms: (t) => `tempat letak kereta ${t} tingkat di bawah tingkat bawah`, s: -1 },
    { en: (t) => `a weight gain of ${t} kg`, ms: (t) => `pertambahan berat badan ${t} kg`, s: 1 },
    { en: (t) => `a weight loss of ${t} kg`, ms: (t) => `pengurangan berat badan ${t} kg`, s: -1 },
    { en: (t) => `a football team that scored ${t} goals more than it conceded`, ms: (t) => `sebuah pasukan bola sepak yang menjaringkan ${t} gol lebih banyak daripada gol yang dibolosi`, s: 1 },
    { en: (t) => `a football team that conceded ${t} goals more than it scored`, ms: (t) => `sebuah pasukan bola sepak yang membolosi ${t} gol lebih banyak daripada gol yang dijaringkan`, s: -1 },
    { en: (t) => `walking ${t} steps forward`, ms: (t) => `berjalan ${t} langkah ke hadapan`, s: 1 },
    { en: (t) => `walking ${t} steps backward`, ms: (t) => `berjalan ${t} langkah ke belakang`, s: -1 },
    { en: (t) => `an increase of ${t} in the number of students`, ms: (t) => `pertambahan ${t} orang murid`, s: 1 },
    { en: (t) => `a decrease of ${t} in the number of students`, ms: (t) => `pengurangan ${t} orang murid`, s: -1 },
  ];
  const ctxPair = (r) => {
    const k = r.int(0, CTX.length / 2 - 1);
    return [CTX[2 * k], CTX[2 * k + 1]];
  };
  /* statements about integers with a computed truth value */
  const STM = [
    (r) => { const a = r.int(1, 9), b = r.int(1, 9); need(a !== b); return { t: T(`$${-a}$ is greater than $${-b}$`, `$${-a}$ lebih besar daripada $${-b}$`), ok: -a > -b }; },
    (r) => { const a = r.int(1, 9), b = r.int(1, 9); return { t: T(`$${-a}$ is less than $${b}$`, `$${-a}$ kurang daripada $${b}$`), ok: -a < b }; },
    (r) => ({ t: T('$0$ is a positive integer', '$0$ ialah integer positif'), ok: false }),
    (r) => ({ t: T('$0$ is a negative integer', '$0$ ialah integer negatif'), ok: false }),
    (r) => ({ t: T('$0$ is an integer', '$0$ ialah satu integer'), ok: true }),
    (r) => ({ t: T('Every negative integer is less than every positive integer', 'Setiap integer negatif kurang daripada setiap integer positif'), ok: true }),
    (r) => ({ t: T('$-1$ is the smallest integer', '$-1$ ialah integer terkecil'), ok: false }),
    (r) => ({ t: T('$-1$ is the greatest negative integer', '$-1$ ialah integer negatif terbesar'), ok: true }),
    (r) => { const a = r.int(2, 9); return { t: T(`$${-a}$ is to the right of $0$ on a horizontal number line`, `$${-a}$ terletak di sebelah kanan $0$ pada garis nombor mengufuk`), ok: false }; },
    (r) => { const a = r.int(2, 9); return { t: T(`$${a}$ is to the right of $${-a}$ on a horizontal number line`, `$${a}$ terletak di sebelah kanan $${-a}$ pada garis nombor mengufuk`), ok: true }; },
    (r) => { const a = r.int(2, 9); const c = r.chance(); return { t: T(`$${-a}$ and $${a}$ are the same distance from $0$`, `$${-a}$ dan $${a}$ mempunyai jarak yang sama dari $0$`), ok: true }; },
    (r) => { const a = r.int(2, 9), b = a + r.int(1, 5); return { t: T(`$${-b}$ is less than $${-a}$ because $${b}$ is greater than $${a}$`, `$${-b}$ kurang daripada $${-a}$ kerana $${b}$ lebih besar daripada $${a}$`), ok: true }; },
    (r) => { const a = r.int(2, 9), b = a + r.int(1, 5); return { t: T(`$${-b}$ is greater than $${-a}$ because $${b}$ is greater than $${a}$`, `$${-b}$ lebih besar daripada $${-a}$ kerana $${b}$ lebih besar daripada $${a}$`), ok: false }; },
    (r) => { const a = r.int(2, 9); return { t: T(`The integer just after $${-a}$ is $${-a - 1}$`, `Integer selepas $${-a}$ ialah $${-a - 1}$`), ok: false }; },
    (r) => { const a = r.int(2, 9); return { t: T(`There is no integer between $${-a}$ and $${-a + 1}$`, `Tiada integer di antara $${-a}$ dengan $${-a + 1}$`), ok: true }; },
    (r) => { const a = r.int(2, 9); return { t: T(`$${a}$ is a positive integer and $${-a}$ is a negative integer`, `$${a}$ ialah integer positif dan $${-a}$ ialah integer negatif`), ok: true }; },
    (r) => ({ t: T('A number line has a greatest integer', 'Sebuah garis nombor mempunyai integer terbesar'), ok: false }),
    (r) => ({ t: T('The integers $-5, -4, -3$ are in ascending order', 'Integer $-5, -4, -3$ berada dalam tertib menaik'), ok: true }),
    (r) => ({ t: T('The integers $-3, -4, -5$ are in ascending order', 'Integer $-3, -4, -5$ berada dalam tertib menaik'), ok: false }),
    (r) => { const a = r.int(2, 9); return { t: T(`A temperature of $${-a}^\\circ$C is warmer than $0^\\circ$C`, `Suhu $${-a}^\\circ$C lebih panas daripada $0^\\circ$C`), ok: false }; },
    (r) => { const a = r.int(2, 9), b = a + r.int(1, 6); return { t: T(`A temperature of $${-b}^\\circ$C is colder than $${-a}^\\circ$C`, `Suhu $${-b}^\\circ$C lebih sejuk daripada $${-a}^\\circ$C`), ok: true }; },
    (r) => { const a = r.int(2, 9), b = a + r.int(1, 6); return { t: T(`A diver at $${-a}$ m is deeper than a diver at $${-b}$ m`, `Seorang penyelam pada $${-a}$ m berada lebih dalam daripada penyelam pada $${-b}$ m`), ok: false }; },
  ];
  const stmts = (r, k) => r.sample(STM, k).map((f) => f(r));
  const tfAns = (s) => (s.ok ? T('True', 'Benar') : T('False', 'Palsu'));

  /* ===================================================================== */
  /* ---- F1-1.1 Integers                                                    */
  /* ===================================================================== */
  const e11 = [
    // F1: write a situation as an integer / decide positive or negative / opposite situation / pair
    (r) => {
      const c = r.pick(CTX), t = r.int(2, 40);
      return r.pick([
        () => ({ q: T(`Write an integer to represent ${c.en(t)}.`, `Tulis satu integer untuk mewakili ${c.ms(t)}.`), a: T(`$${c.s * t}$`), sp: 'xs' }),
        () => ({ q: T(`Is the integer that represents ${c.en(t)} positive or negative? Write the integer.`, `Adakah integer yang mewakili ${c.ms(t)} positif atau negatif? Tulis integer itu.`), a: T(`${c.s > 0 ? 'Positive' : 'Negative'}: $${c.s * t}$`, `${c.s > 0 ? 'Positif' : 'Negatif'}: $${c.s * t}$`), sp: 'xs' }),
      ])();
    },
    (r) => {
      const [p, q] = ctxPair(r), t1 = r.int(2, 30), t2 = r.int(2, 30);
      const swap = r.chance();
      const A = swap ? q : p, B = swap ? p : q;
      return { q: T(`Write each situation as an integer.<br>(a) ${A.en(t1)}<br>(b) ${B.en(t2)}`, `Tulis setiap situasi sebagai satu integer.<br>(a) ${A.ms(t1)}<br>(b) ${B.ms(t2)}`), a: T(`(a) $${A.s * t1}$ (b) $${B.s * t2}$`), sp: 's' };
    },
    (r) => {
      const [p, q] = ctxPair(r), t = r.int(2, 30);
      const c = r.chance() ? p : q, o = c === p ? q : p;
      return { q: T(`${SPM.cap(c.en(t))} is represented by the integer $${c.s * t}$. Which integer represents ${o.en(t)}?`, `${SPM.cap(c.ms(t))} diwakili oleh integer $${c.s * t}$. Integer yang manakah mewakili ${o.ms(t)}?`), a: T(`$${o.s * t}$`), sp: 'xs' };
    },
    (r) => {
      const [p, q] = ctxPair(r), t1 = r.int(2, 30), t2 = r.int(2, 30);
      need(t1 !== t2);
      return { q: T(`Which of these two situations is represented by a negative integer?<br>(A) ${p.en(t1)}<br>(B) ${q.en(t2)}`, `Manakah antara dua situasi ini diwakili oleh integer negatif?<br>(A) ${p.ms(t1)}<br>(B) ${q.ms(t2)}`), a: T(`(B) ${q.en(t2)}, $${-t2}$`, `(B) ${q.ms(t2)}, $${-t2}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(1, 15), b = r.int(1, 15);
      need(a !== b);
      return { q: T(`Which is smaller, $${-a}$ or $${-b}$?`, `Yang manakah lebih kecil, $${-a}$ atau $${-b}$?`), a: T(`$${Math.min(-a, -b)}$`), sp: 'xs' };
    },
    (r) => {
      const v = r.distinct(3, -12, 12);
      const big = r.chance();
      return { q: T(`Write down the ${big ? 'greatest' : 'smallest'} of the integers $${lst(v)}$.`, `Tulis integer yang ${big ? 'terbesar' : 'terkecil'} antara $${lst(v)}$.`), a: T(`$${big ? Math.max(...v) : Math.min(...v)}$`), sp: 'xs' };
    },
    (r) => {
      const v = r.distinct(3, -15, 15);
      const asc = r.chance();
      return { q: T(`Arrange the three integers $${lst(v)}$ in ${asW(asc).en}.`, `Susun tiga integer $${lst(v)}$ dalam ${asW(asc).ms}.`), a: T(`$${lst(sortBy(v, asc))}$`), sp: 'xs' };
    },
    (r) => {
      const list = r.shuffle(r.sample([-9, -4, -2, 3, 6, 8, 11, -7, 5, -12], 5).concat([0]));
      const neg = r.chance();
      const res = list.filter((x) => (neg ? x < 0 : x > 0));
      return { q: T(`From the numbers $${lst(list)}$, write down all the ${neg ? 'negative' : 'positive'} integers.`, `Daripada nombor $${lst(list)}$, tulis semua integer ${neg ? 'negatif' : 'positif'}.`), a: T(`$${lst(res)}$`), sp: 'xs' };
    },
    // F7: neighbours
    (r) => {
      const a = r.int(-15, 15);
      const after = r.chance();
      return { q: T(`Write the integer that comes immediately ${after ? 'after' : 'before'} $${a}$ on the number line.`, `Tulis integer yang datang tepat ${after ? 'selepas' : 'sebelum'} $${a}$ pada garis nombor.`), a: T(`$${after ? a + 1 : a - 1}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(-12, 10);
      return { q: T(`Find the integer between $${a}$ and $${a + 2}$.`, `Cari integer yang terletak di antara $${a}$ dengan $${a + 2}$.`), a: T(`$${a + 1}$`), sp: 'xs' };
    },
    // F9: true / false statements
    (r) => { const s = stmts(r, 1)[0]; return { q: T(`True or false? ${s.t.en}.`, `Benar atau palsu? ${s.t.ms}.`), a: tfAns(s), sp: 'xs' }; },
    (r) => { const s = stmts(r, 1)[0]; return { q: T(`Is this statement true? "${s.t.en}." Answer Yes or No.`, `Adakah pernyataan ini benar? "${s.t.ms}." Jawab Ya atau Tidak.`), a: T(s.ok ? 'Yes' : 'No', s.ok ? 'Ya' : 'Tidak'), sp: 'xs' }; },
    // F13: table completion
    (r) => {
      const rows = r.sample(CTX, 3);
      const ts = r.distinct(3, 2, 30);
      const tb = SPM.table(rows.map((c, i) => [c.en(ts[i]), '']), { head: ['Situation', 'Integer'] });
      const tbM = SPM.table(rows.map((c, i) => [c.ms(ts[i]), '']), { head: ['Situasi', 'Integer'] });
      return { q: T(`Complete the table.<br>${tb}`, `Lengkapkan jadual.<br>${tbM}`), a: T(rows.map((c, i) => `(${i + 1}) $${rows[i].s * ts[i]}$`).join('; ')), sp: 'm' };
    },
  ];

  const m11 = [
    (r) => {
      const cities = r.sample(COLD, 4);
      const t = r.distinct(4, -18, 12);
      const cold = r.chance();
      const idx = sortBy([0, 1, 2, 3], cold, (i) => t[i]);
      return {
        q: T(`The temperatures at noon in four cities on a winter day were: ${cities.map((c, i) => `${c.en} $${t[i]}^\\circ$C`).join(', ')}. List the cities from the ${cold ? 'coldest to the warmest' : 'warmest to the coldest'}.`,
          `Suhu pada waktu tengah hari di empat bandar pada suatu hari musim sejuk ialah: ${cities.map((c, i) => `${c.ms} $${t[i]}^\\circ$C`).join(', ')}. Senaraikan bandar-bandar itu daripada yang ${cold ? 'paling sejuk kepada paling panas' : 'paling panas kepada paling sejuk'}.`),
        a: T(idx.map((i) => cities[i].en).join(', '), idx.map((i) => cities[i].ms).join(', ')), sp: 's',
      };
    },
    (r) => {
      const names = r.names(4), b = r.distinct(4, -60, 80);
      const asc = r.chance();
      const idx = sortBy([0, 1, 2, 3], asc, (i) => b[i]);
      return {
        q: T(`The balances in the bank accounts of four friends are: ${names.map((x, i) => `${x} ${rmS(b[i])}`).join(', ')}. (A negative balance means the account is overdrawn.) Arrange the balances in ${asW(asc).en}.`, `Baki dalam akaun bank empat orang kawan ialah: ${names.map((x, i) => `${x} ${rmS(b[i])}`).join(', ')}. (Baki negatif bermaksud akaun terlebih keluar.) Susun baki itu dalam ${asW(asc).ms}.`),
        a: T(idx.map((i) => `${names[i]} (${rmS(b[i])})`).join(', ')), sp: 's',
      };
    },
    (r) => {
      const step = r.pick([2, 5, 10]);
      const lo = -step * r.int(3, 5), hi = step * r.int(3, 5);
      const v = r.distinct(3, lo / step + 1, hi / step - 1).map((x) => x * step);
      const asc = r.chance();
      const idx = sortBy([0, 1, 2], asc, (i) => v[i]);
      return { q: T(`Read the values of $P$, $Q$ and $R$ from the number line, then list them in ${asW(asc).en}.`, `Baca nilai $P$, $Q$ dan $R$ daripada garis nombor, kemudian senaraikannya dalam ${asW(asc).ms}.`), fig: numLine(lo, hi, step, v, { labels: [lo, 0, hi] }), a: T(`$${lst(idx.map((i) => v[i]))}$ (${idx.map((i) => LET[i]).join(', ')})`), sp: 's' };
    },
    // greatest / smallest / counting
    (r) => {
      const a = r.int(2, 12), b = r.int(1, 8);
      const lo = -a, hi = b;
      const k = r.pick(['inclusive', 'exclusive']);
      const cnt = k === 'exclusive' ? hi - lo - 1 : hi - lo + 1;
      return {
        q: T(`How many integers are there from $${lo}$ to $${hi}$, ${k === 'inclusive' ? 'including' : 'not including'} $${lo}$ and $${hi}$?`, `Berapakah bilangan integer dari $${lo}$ hingga $${hi}$, ${k === 'inclusive' ? 'termasuk' : 'tidak termasuk'} $${lo}$ dan $${hi}$?`),
        a: T(`$${cnt}$`), sp: 's',
      };
    },
    (r) => {
      const a = r.int(2, 12), b = r.int(1, 8);
      const list = [];
      for (let x = -a + 1; x < b; x++) list.push(x);
      return { q: T(`List all the integers that are greater than $${-a}$ and less than $${b}$.`, `Senaraikan semua integer yang lebih besar daripada $${-a}$ dan kurang daripada $${b}$.`), a: T(`$${lst(list)}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 15);
      const k = r.pick([['greatest integer less than', 'integer terbesar yang kurang daripada', -a, -a - 1, 'less'], ['smallest integer greater than', 'integer terkecil yang lebih besar daripada', -a, -a + 1, 'more'], ['greatest negative integer that is less than', 'integer negatif terbesar yang kurang daripada', -a, -a - 1, 'x']]);
      return { q: T(`Find the ${k[0]} $${k[2]}$.`, `Cari ${k[1]} $${k[2]}$.`), a: T(`$${k[3]}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(3, 20);
      return { q: T(`Two integers are $${a}$ units from $0$ on the number line. Write down both integers.`, `Dua integer berada pada jarak $${a}$ unit dari $0$ pada garis nombor. Tulis kedua-dua integer itu.`), a: T(`$${-a}$ and $${a}$`, `$${-a}$ dan $${a}$`), sp: 's' };
    },
    (r) => {
      const [a, b] = r.distinct(2, -15, 15);
      need((a + b) % 2 === 0 && a !== b);
      return { q: T(`Find the integer that is exactly halfway between $${Math.min(a, b)}$ and $${Math.max(a, b)}$ on the number line.`, `Cari integer yang terletak tepat di tengah-tengah antara $${Math.min(a, b)}$ dan $${Math.max(a, b)}$ pada garis nombor.`), a: T(`$${(a + b) / 2}$`), sp: 's' };
    },
    (r) => {
      const ss = stmts(r, 3);
      return { q: T(`State whether each statement is true or false.<br>${ss.map((s, i) => `(${'abc'[i]}) ${s.t.en}`).join('<br>')}`, `Nyatakan sama ada setiap pernyataan itu benar atau palsu.<br>${ss.map((s, i) => `(${'abc'[i]}) ${s.t.ms}`).join('<br>')}`), a: T(ss.map((s, i) => `(${'abc'[i]}) ${s.ok ? 'True' : 'False'}`).join('; '), ss.map((s, i) => `(${'abc'[i]}) ${s.ok ? 'Benar' : 'Palsu'}`).join('; ')), sp: 'm' };
    },
    // MCQs with meaningful distractors
    (r) => {
      const v = r.distinct(3, 2, 20).map((x) => -x);
      const right = sortBy(v, true);
      const wrong1 = sortBy(v, false);
      const wrong2 = sortBy(v, true, (x) => Math.abs(x));
      const opt = (arr) => `$${lst(arr)}$`;
      const m = mcq(r, right, [wrong1, wrong2, r.shuffle(v)].filter((x) => x.join() !== right.join() && x.join() !== wrong1.join()).slice(0, 1).concat([wrong1]).filter((x, i, a) => a.findIndex((y) => y.join() === x.join()) === i).concat([[v[0], v[2], v[1]]]), (x) => `$${lst(x)}$`);
      return { q: T(`Which list shows the integers in ascending order?<br>${m.q}`, `Senarai yang manakah menunjukkan integer dalam tertib menaik?<br>${m.q}`), a: T(m.ans), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 9), b = a + r.int(1, 6);
      const cs = [`${-b} < ${-a}`, `${-a} < ${-b}`, `${b} < ${-a}`, `${-b} > ${a}`];
      const m = mcq(r, cs[0], cs.slice(1), (x) => `$${x}$`);
      return { q: T(`Which comparison is correct?<br>${m.q}`, `Perbandingan yang manakah betul?<br>${m.q}`), a: T(m.ans), sp: 'xs' };
    },
    (r) => {
      const a = r.int(3, 15);
      const m = mcq(r, `${-a}, 0, ${a}`, [`0, ${-a}, ${a}`, `${a}, 0, ${-a}`, `${-a}, ${a}, 0`], (x) => `$${x}$`);
      return { q: T(`Which of the following is arranged in ascending order?<br>${m.q}`, `Antara yang berikut, yang manakah disusun mengikut tertib menaik?<br>${m.q}`), a: T(m.ans), sp: 'xs' };
    },
    (r) => {
      const d = r.pick([2, 3, 4, 5]), a = d * r.int(3, 6);
      const list = [0, 1, 2, 3].map((i) => a - i * d);
      const k = r.int(5, 8);
      return { q: T(`The pattern $${lst(list)},\\ \\ldots$ continues. Write the ${k}th term.`, `Pola $${lst(list)},\\ \\ldots$ diteruskan. Tulis sebutan ke-${k}.`), a: T(`$${a - (k - 1) * d}$`), sp: 's' };
    },
  ];

  const a11 = [
    // two conditions
    (r) => {
      const a = r.int(6, 12), b = r.int(1, 4);
      const ev = r.chance();
      const res = [];
      for (let x = -a + 1; x < -b; x++) if (ev ? x % 2 === 0 : x % 2 !== 0) res.push(x);
      need(res.length >= 2);
      return { q: T(`Find all the integers that are greater than $${-a}$, less than $${-b}$ and ${ev ? 'even' : 'odd'}.`, `Cari semua integer yang lebih besar daripada $${-a}$, kurang daripada $${-b}$ dan ${ev ? 'genap' : 'ganjil'}.`), a: T(`$${lst(res)}$`), sp: 's' };
    },
    (r) => {
      const d = r.int(3, 9);
      const which = r.pick(['positive', 'negative']);
      const res = [];
      for (let x = -12; x <= 12; x++) if (Math.abs(x) % d === 0 && x !== 0) res.push(x);
      const sel = res.filter((x) => (which === 'positive' ? x > 0 : x < 0));
      need(sel.length >= 2);
      return { q: T(`List all the ${which} multiples of $${d}$ that are between $-12$ and $12$.`, `Senaraikan semua gandaan ${which === 'positive' ? 'positif' : 'negatif'} bagi $${d}$ yang terletak di antara $-12$ dengan $12$.`), a: T(`$${lst(sel)}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 12), m = r.int(3, 15);
      const cases = [
        [T(`A point is $${m}$ units to the right of $${-a}$ on a number line. Which integer does it represent?`, `Satu titik berada $${m}$ unit di sebelah kanan $${-a}$ pada garis nombor. Integer yang manakah diwakilinya?`), -a + m],
        [T(`A point is $${m}$ units to the left of $${-a}$ on a number line. Which integer does it represent?`, `Satu titik berada $${m}$ unit di sebelah kiri $${-a}$ pada garis nombor. Integer yang manakah diwakilinya?`), -a - m],
        [T(`A point is $${m}$ units to the left of $${a}$ on a number line. Which integer does it represent?`, `Satu titik berada $${m}$ unit di sebelah kiri $${a}$ pada garis nombor. Integer yang manakah diwakilinya?`), a - m],
      ];
      const c = r.pick(cases);
      need(c[1] !== 0);
      return { q: c[0], a: T(`$${c[1]}$`), sp: 's' };
    },
    (r) => {
      const c = r.pick([[T('greatest negative integer', 'integer negatif terbesar'), -1], [T('smallest positive integer', 'integer positif terkecil'), 1], [T('greatest negative integer with two digits', 'integer negatif terbesar dengan dua digit'), -10], [T('smallest positive integer with two digits', 'integer positif terkecil dengan dua digit'), 10]]);
      const c2 = r.pick([[T('an integer that is neither positive nor negative', 'integer yang bukan positif dan bukan negatif'), '0'], [T('the integer that is $3$ less than the smallest positive integer', 'integer yang kurang $3$ daripada integer positif terkecil'), '-2']]);
      return { q: T(`Write down (a) the ${c[0].en}, (b) ${c2[0].en}.`, `Tulis (a) ${c[0].ms}, (b) ${c2[0].ms}.`), a: T(`(a) $${c[1]}$ (b) $${c2[1]}$`), sp: 's' };
    },
    (r) => {
      const [x, y, z] = r.distinct(3, 1, 9);
      const w = r.int(10, 30);
      need(w !== x && w !== y && w !== z);
      const pool = [-x, x, y * 3 + 1, -w, 0];
      need(new Set(pool).size === 5 && pool.filter((p1) => pool.includes(-p1) && p1 !== 0).length === 2);
      const asc = r.chance(), sh = lst(r.shuffle(pool));
      return { q: T(`The integers $${sh}$ are written on cards. (a) Arrange the cards in ${asW(asc).en}. (b) Which two cards are the same distance from $0$?`, `Integer $${sh}$ ditulis pada kad. (a) Susun kad dalam ${asW(asc).ms}. (b) Apakah dua kad yang mempunyai jarak yang sama dari $0$?`), a: T(`(a) $${lst(sortBy(pool, asc))}$ (b) $${-x}$ and $${x}$`, `(a) $${lst(sortBy(pool, asc))}$ (b) $${-x}$ dan $${x}$`), sp: 's' };
    },

    // clue puzzle: find all integers satisfying three clues
    (r) => {
      const a = r.int(6, 16), b = r.int(1, 8), k = r.int(3, 6), d = r.int(4, 12);
      const CL = [
        { en: `is greater than $${-a}$`, ms: `lebih besar daripada $${-a}$`, f: (x) => x > -a },
        { en: `is less than $${b}$`, ms: `kurang daripada $${b}$`, f: (x) => x < b },
        { en: `is less than $${-b}$`, ms: `kurang daripada $${-b}$`, f: (x) => x < -b },
        { en: `is greater than $${b}$`, ms: `lebih besar daripada $${b}$`, f: (x) => x > b },
        { en: 'is even', ms: 'ialah nombor genap', f: (x) => x % 2 === 0 },
        { en: 'is odd', ms: 'ialah nombor ganjil', f: (x) => x % 2 !== 0 },
        { en: `is a multiple of $${k}$`, ms: `ialah gandaan bagi $${k}$`, f: (x) => x % k === 0 },
        { en: `is less than $${d}$ units from $0$`, ms: `berada kurang daripada $${d}$ unit dari $0$`, f: (x) => Math.abs(x) < d },
        { en: `is more than $${d}$ units from $0$`, ms: `berada lebih daripada $${d}$ unit dari $0$`, f: (x) => Math.abs(x) > d },
        { en: 'is a negative integer', ms: 'ialah integer negatif', f: (x) => x < 0 },
        { en: 'is a positive integer', ms: 'ialah integer positif', f: (x) => x > 0 },
      ];
      const pick = r.sample(CL, 3);
      const sol = [];
      for (let x = -40; x <= 40; x++) if (pick.every((c) => c.f(x))) sol.push(x);
      need(sol.length >= 2 && sol.length <= 5 && sol[0] > -40 && sol[sol.length - 1] < 40);
      const frame = r.chance(), p = r.name();
      const en = pick.map((c) => c.en), ms = pick.map((c) => c.ms);
      return frame
        ? { q: T(`${p} is thinking of an integer. It ${en[0]}, it ${en[1]} and it ${en[2]}. List all the integers ${p} could be thinking of.`, `${p} sedang memikirkan satu integer. Ia ${ms[0]}, ia ${ms[1]} dan ia ${ms[2]}. Senaraikan semua integer yang mungkin difikirkan oleh ${p}.`), a: T(`$${lst(sol)}$`), sp: 's' }
        : { q: T(`Find all the integers that satisfy all three conditions: (i) it ${en[0]}; (ii) it ${en[1]}; (iii) it ${en[2]}.`, `Cari semua integer yang memenuhi ketiga-tiga syarat: (i) ia ${ms[0]}; (ii) ia ${ms[1]}; (iii) ia ${ms[2]}.`), a: T(`$${lst(sol)}$`), sp: 's' };
    },
    // table + ranking in contexts
    (r) => {
      const teams = r.sample(['Selangor', 'Johor', 'Perak', 'Kedah', 'Pahang', 'Terengganu', 'Sabah', 'Sarawak'], 5);
      const gd = r.distinct(5, -9, 12);
      const ord = sortBy([0, 1, 2, 3, 4], false, (i) => gd[i]);
      const tb = (h1, h2) => SPM.table(teams.map((t, i) => [t, `$${gd[i]}$`]), { head: [h1, h2] });
      const which = r.pick(['rank', 'neg', 'top']);
      const negs = teams.filter((t, i) => gd[i] < 0);
      need(negs.length >= 1);
      const qs = {
        rank: [T('Arrange the teams from the highest goal difference to the lowest.', 'Susun pasukan-pasukan itu daripada beza gol yang tertinggi kepada yang terendah.'), T(ord.map((i) => teams[i]).join(', '), ord.map((i) => teams[i]).join(', '))],
        neg: [T('Which teams have a negative goal difference (they conceded more goals than they scored)?', 'Pasukan yang manakah mempunyai beza gol negatif (membolosi lebih banyak gol daripada yang dijaringkan)?'), T(negs.join(', '), negs.join(', '))],
        top: [T('Which team is in the last place, and which team is in the first place (highest goal difference)?', 'Pasukan yang manakah di tempat terakhir, dan pasukan yang manakah di tempat pertama (beza gol tertinggi)?'), T(`Last: ${teams[ord[4]]}; first: ${teams[ord[0]]}`, `Terakhir: ${teams[ord[4]]}; pertama: ${teams[ord[0]]}`)],
      }[which];
      return { q: T(`The table shows the goal differences of five teams in a football league.<br>${tb('Team', 'Goal difference')}${qs[0].en}`, `Jadual menunjukkan beza gol bagi lima pasukan dalam satu liga bola sepak.<br>${tb('Pasukan', 'Beza gol')}${qs[0].ms}`), a: qs[1], sp: 's' };
    },
    (r) => {
      const ps = r.names(5);
      const sc = r.distinct(5, -8, 6);
      const win = r.chance();
      const ord = sortBy([0, 1, 2, 3, 4], true, (i) => sc[i]);
      return { q: T(`In golf, a score of $-3$ means 3 strokes under par and a lower score is better. The scores of five players are: ${ps.map((p, i) => `${p} $${sc[i]}$`).join(', ')}. Who ${win ? 'wins (the lowest score)' : 'finishes last (the highest score)'}? Arrange the players from first to last.`, `Dalam golf, skor $-3$ bermaksud 3 pukulan di bawah par dan skor yang lebih rendah adalah lebih baik. Skor lima orang pemain ialah: ${ps.map((p, i) => `${p} $${sc[i]}$`).join(', ')}. Siapakah yang ${win ? 'menang (skor terendah)' : 'tercorot (skor tertinggi)'}? Susun pemain daripada tempat pertama hingga terakhir.`), a: T(`${ps[win ? ord[0] : ord[4]]}; ${ord.map((i) => ps[i]).join(', ')}`), sp: 's' };
    },
    (r) => {
      const days = [T('Mon', 'Isn'), T('Tue', 'Sel'), T('Wed', 'Rab'), T('Thu', 'Kha'), T('Fri', 'Jum')];
      const ch = r.distinct(5, -9, 9);
      const fall = r.chance();
      const target = fall ? Math.min(...ch) : Math.max(...ch);
      const k = ch.indexOf(target);
      need(fall ? target < 0 : target > 0);
      return { q: T(`The daily change in the price of a share (in sen) is shown: ${days.map((d, i) => `${d.en} $${ch[i] > 0 ? '+' : ''}${ch[i]}$`).join(', ')}. On which day was the ${fall ? 'largest fall' : 'largest rise'} in price?`, `Perubahan harga sesaham harian (dalam sen) ditunjukkan: ${days.map((d, i) => `${d.ms} $${ch[i] > 0 ? '+' : ''}${ch[i]}$`).join(', ')}. Pada hari manakah berlaku ${fall ? 'penurunan' : 'kenaikan'} harga yang paling besar?`), a: T(`${days[k].en} ($${target}$)`, `${days[k].ms} ($${target}$)`), sp: 's' };
    },
    // counting integers by distance from zero
    (r) => {
      const k = r.int(3, 15);
      const v = r.pick([
        [T(`at most $${k}$ units from $0$`, `berada pada jarak tidak lebih daripada $${k}$ unit dari $0$`), 2 * k + 1],
        [T(`less than $${k}$ units from $0$`, `berada pada jarak kurang daripada $${k}$ unit dari $0$`), 2 * k - 1],
        [T(`exactly $${k}$ units from $0$`, `berada pada jarak tepat $${k}$ unit dari $0$`), 2],
      ]);
      return { q: T(`How many integers are ${v[0].en}?`, `Berapakah bilangan integer yang ${v[0].ms}?`), a: T(`$${v[1]}$`), sp: 's' };
    },
    (r) => {
      const c = r.pick([
        [T('How many negative integers have exactly two digits?', 'Berapakah bilangan integer negatif yang mempunyai tepat dua digit?'), 90],
        [T('How many negative integers are greater than $-100$?', 'Berapakah bilangan integer negatif yang lebih besar daripada $-100$?'), 99],
        [T('How many integers are there from $-50$ to $50$, including both?', 'Berapakah bilangan integer dari $-50$ hingga $50$, termasuk kedua-duanya?'), 101],
        [T('How many negative integers have exactly three digits?', 'Berapakah bilangan integer negatif yang mempunyai tepat tiga digit?'), 900],
      ]);
      return { q: c[0], a: T(`$${c[1]}$`), sp: 's' };
    },
    // construct your own
    (r) => {
      const a = r.int(6, 15), w = r.int(3, 5);
      const lo = -a - w, hi = -a;
      const list = [];
      for (let x = lo + 1; x < hi; x++) list.push(x);
      return { q: T(`Write down all the integers between $${lo}$ and $${hi}$. How many of them are there?`, `Tulis semua integer di antara $${lo}$ dengan $${hi}$. Berapakah bilangannya?`), a: T(`$${lst(list)}$; $${list.length}$ integers`, `$${lst(list)}$; $${list.length}$ integer`), sp: 's' };
    },
    // consecutive integers
    (r) => {
      const k = r.int(3, 20);
      const c = r.pick([
        [T(`Write three consecutive negative integers, the greatest of which is $${-k}$, in ascending order.`, `Tulis tiga integer negatif berturutan, dengan yang terbesar ialah $${-k}$, dalam tertib menaik.`), `${-k - 2},\\ ${-k - 1},\\ ${-k}`],
        [T(`Write three consecutive integers, the middle one being $${-k}$, in descending order.`, `Tulis tiga integer berturutan, dengan yang di tengah ialah $${-k}$, dalam tertib menurun.`), `${-k + 1},\\ ${-k},\\ ${-k - 1}`],
        [T(`Write four consecutive integers, the smallest of which is $${-k - 1}$, in ascending order.`, `Tulis empat integer berturutan, dengan yang terkecil ialah $${-k - 1}$, dalam tertib menaik.`), `${-k - 1},\\ ${-k},\\ ${-k + 1},\\ ${-k + 2}`],
        [T(`Write three consecutive even integers, the smallest of which is $${-2 * k}$.`, `Tulis tiga integer genap berturutan, dengan yang terkecil ialah $${-2 * k}$.`), `${-2 * k},\\ ${-2 * k + 2},\\ ${-2 * k + 4}`],
      ]);
      return { q: c[0], a: T(`$${c[1]}$`), sp: 's' };
    },
  ];
  SPM.extend('F1-1.1', { e: e11, m: m11, a: a11 });


  /* ===================================================================== */
  /* ---- F1-1.2 Integer arithmetic                                          */
  /* ===================================================================== */
  /* independent evaluator for the displayed expression (ASCII ops), rejects non-integer divisions */
  function ev(str) {
    const t = str.replace(/\[/g, '(').replace(/\]/g, ')').match(/\d+\.?\d*|[-+*/()]/g);
    let i = 0;
    const expr = () => { let v = term(); while (t[i] === '+' || t[i] === '-') { const o = t[i++]; const w = term(); v = o === '+' ? v + w : v - w; } return v; };
    const term = () => { let v = unary(); while (t[i] === '*' || t[i] === '/') { const o = t[i++]; const w = unary(); if (o === '/') { need(w !== 0 && Number.isInteger(v / w)); v = v / w; } else v *= w; } return v; };
    const unary = () => { if (t[i] === '-') { i++; return -unary(); } if (t[i] === '(') { i++; const v = expr(); i++; return v; } return parseFloat(t[i++]); };
    const v = expr();
    need(i === t.length);
    return Math.round(v * 1e6) / 1e6;
  }
  const tx = (str) => str.replace(/\*/g, '\\times').replace(/\//g, '\\div').replace(/\s+/g, ' ');
  const pn = (x) => (x < 0 ? `(${x})` : `${x}`);          // bracket a negative operand
  /* operands (a, b) for a single operation, with the answer */
  function two(r, op, lo, hi) {
    lo = lo || 2; hi = hi || 12;
    if (op === '/') { const b = r.sign() * r.int(lo > 1 ? 2 : 1, Math.min(hi, 9)), k = r.sign() * r.int(2, 9); return [b * k, b]; }
    return [r.sign() * r.int(lo, hi), r.sign() * r.int(lo, hi)];
  }
  const bankBal = (x) => (x < 0 ? `\u2212RM${-x}` : `RM${x}`);

  /* the seven arithmetic laws: name, statement pattern with a blank, and the value hidden by the blank */
  const LAWN = {
    comA: T('commutative law of addition', 'hukum kalis tukar tertib bagi penambahan'),
    comM: T('commutative law of multiplication', 'hukum kalis tukar tertib bagi pendaraban'),
    asA: T('associative law of addition', 'hukum kalis sekutuan bagi penambahan'),
    asM: T('associative law of multiplication', 'hukum kalis sekutuan bagi pendaraban'),
    dist: T('distributive law', 'hukum kalis agihan'),
    idA: T('identity law of addition', 'hukum identiti bagi penambahan'),
    idM: T('identity law of multiplication', 'hukum identiti bagi pendaraban'),
  };
  const lawOf = (r) => {
    const a = r.nz(-9, 9), b = r.nz(-9, 9), c = r.nz(-9, 9);
    return {
      comA: { s: `${a} + ${pn(b)} = ${b} + ${pn(a)}`, blank: `${a} + ${pn(b)} = \\square + ${pn(a)}`, hid: b },
      comM: { s: `${a} \\times ${pn(b)} = ${b} \\times ${pn(a)}`, blank: `${a} \\times ${pn(b)} = ${b} \\times \\square`, hid: a },
      asA: { s: `(${a} + ${pn(b)}) + ${pn(c)} = ${a} + (${b} + ${pn(c)})`, blank: `(${a} + ${pn(b)}) + ${pn(c)} = ${a} + (\\square + ${pn(c)})`, hid: b },
      asM: { s: `(${a} \\times ${pn(b)}) \\times ${pn(c)} = ${a} \\times (${b} \\times ${pn(c)})`, blank: `(${a} \\times ${pn(b)}) \\times ${pn(c)} = ${a} \\times (${b} \\times \\square)`, hid: c },
      dist: { s: `${a} \\times (${b} + ${pn(c)}) = ${a} \\times ${pn(b)} + ${a} \\times ${pn(c)}`, blank: `${a} \\times (${b} + ${pn(c)}) = ${a} \\times ${pn(b)} + \\square \\times ${pn(c)}`, hid: a },
      idA: { s: `${a} + 0 = ${a}`, blank: `${a} + \\square = ${a}`, hid: 0 },
      idM: { s: `${a} \\times 1 = ${a}`, blank: `${a} \\times \\square = ${a}`, hid: 1 },
    };
  };
  const LKEYS = Object.keys(LAWN);

  const e12 = [
    // sum / difference / product / quotient in words
    (r) => {
      const op = r.pick(['+', '-', '*', '/']);
      const [a, b] = two(r, op);
      const v = ev(`${pn(a)} ${op} ${pn(b)}`);
      const q = {
        '+': [T(`Find the sum of $${a}$ and $${b}$.`, `Cari hasil tambah $${a}$ dan $${b}$.`)],
        '-': [T(`Subtract $${b}$ from $${a}$.`, `Tolak $${b}$ daripada $${a}$.`)],
        '*': [T(`Find the product of $${a}$ and $${b}$.`, `Cari hasil darab $${a}$ dan $${b}$.`)],
        '/': [T(`Find the quotient when $${a}$ is divided by $${b}$.`, `Cari hasil bahagi apabila $${a}$ dibahagi dengan $${b}$.`)],
      }[op][0];
      const val = { '+': a + b, '-': b === 0 ? a : ev(`${pn(b)}`) * -1 + a, '*': a * b, '/': a / b }[op];
      return { q, a: T(`$${v}$`), sp: 'xs' };
    },
    // missing number
    (r) => {
      const form = r.int(0, 6);
      const a = r.nz(-12, 12), x = r.nz(-12, 12);
      let s, ans = x;
      if (form === 0) { const c = a + x; s = `\\square + ${pn(a)} = ${c}`; }
      else if (form === 1) { const c = a + x; s = `${a} + \\square = ${c}`; }
      else if (form === 2) { const c = a - x; s = `${a} - \\square = ${c}`; }
      else if (form === 3) { const c = x - a; s = `\\square - ${pn(a)} = ${c}`; }
      else if (form === 4) { const c = a * x; s = `${a} \\times \\square = ${c}`; need(Math.abs(a) < 10 && Math.abs(x) < 10); }
      else if (form === 5) { need(Math.abs(a) < 10 && Math.abs(x) < 10); const c = a * x; s = `\\square \\div ${pn(a)} = ${x}`; ans = c; }
      else { need(Math.abs(a) < 10 && Math.abs(x) < 10); const c = a * x; s = `${c} \\div \\square = ${x}`; ans = a; }
      return { q: T(`Find the value of $\\square$: $${s}$`, `Cari nilai $\\square$: $${s}$`), a: T(`$${ans}$`), sp: 'xs' };
    },
    // predict the sign
    (r) => {
      const op = r.pick(['*', '/', '+', '-']);
      let a, b;
      if (op === '+' || op === '-') { a = r.sign() * r.int(2, 20); b = r.sign() * r.int(2, 20); need(Math.abs(a) !== Math.abs(b)); }
      else [a, b] = two(r, op);
      const v = ev(`${pn(a)} ${op} ${pn(b)}`);
      need(v !== 0);
      const sym = tx(op);
      return { q: T(`Without calculating, state whether $${pn(a)} ${sym} ${pn(b)}$ is positive or negative. Then find its value.`, `Tanpa mengira, nyatakan sama ada $${pn(a)} ${sym} ${pn(b)}$ positif atau negatif. Kemudian cari nilainya.`), a: T(`${v > 0 ? 'Positive' : 'Negative'}, $${v}$`, `${v > 0 ? 'Positif' : 'Negatif'}, $${v}$`), sp: 'xs' };
    },
    // sign rules
    (r) => {
      const c = r.pick([
        ['positive \\times positive', 'positive', 'positif \\times positif'],
      ]);
      const A = r.pick([['positive', 'positif'], ['negative', 'negatif']]), B = r.pick([['positive', 'positif'], ['negative', 'negatif']]);
      const op = r.pick(['multiplied by', 'divided by']);
      const res = A[0] === B[0] ? 'positive' : 'negative';
      return { q: T(`Complete: A ${A[0]} number ${op} a ${B[0]} number gives a ______ number.`, `Lengkapkan: Nombor ${A[1]} ${op === 'multiplied by' ? 'didarab dengan' : 'dibahagi dengan'} nombor ${B[1]} memberikan nombor ______.`), a: T(res, res === 'positive' ? 'positif' : 'negatif'), sp: 'xs' };
    },
    // identity / inverse / zero facts
    (r) => {
      const a = r.nz(-25, 25);
      const c = r.pick([
        [`${a} + 0`, a], [`0 + ${pn(a)}`, a], [`${a} \\times 1`, a], [`1 \\times ${pn(a)}`, a], [`${a} + ${pn(-a)}`, 0], [`${a} - ${pn(a)}`, 0], [`${a} \\times 0`, 0], [`0 \\div ${pn(a)}`, 0], [`${a} \\div 1`, a], [`${a} \\div ${pn(a)}`, 1], [`${a} \\times (-1)`, -a], [`${a} - 0`, a],
      ]);
      return { q: T(`Write down the value of $${c[0]}$ without using a calculator.`, `Tulis nilai $${c[0]}$ tanpa menggunakan kalkulator.`), a: T(`$${c[1]}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.nz(-30, 30);
      const c = r.pick([
        [T(`What number must be added to $${a}$ to give $0$?`, `Apakah nombor yang mesti ditambah kepada $${a}$ untuk memberikan $0$?`), -a],
        [T(`What number must be added to $${a}$ to give $${a}$?`, `Apakah nombor yang mesti ditambah kepada $${a}$ untuk memberikan $${a}$?`), 0],
        [T(`What number must $${a}$ be multiplied by to give $${a}$?`, `Apakah nombor yang mesti didarab dengan $${a}$ untuk memberikan $${a}$?`), 1],
        [T(`What number must $${a}$ be multiplied by to give $0$?`, `Apakah nombor yang mesti didarab dengan $${a}$ untuk memberikan $0$?`), 0],
        [T(`What number must $${a}$ be multiplied by to give $${-a}$?`, `Apakah nombor yang mesti didarab dengan $${a}$ untuk memberikan $${-a}$?`), -1],
      ]);
      return { q: c[0], a: T(`$${c[1]}$`), sp: 'xs' };
    },
    // law: name it / complete it
    (r) => {
      const k = r.pick(LKEYS), L = lawOf(r)[k];
      return { q: T(`Which arithmetic law is shown by $${L.s}$?`, `Hukum aritmetik yang manakah ditunjukkan oleh $${L.s}$?`), a: LAWN[k], sp: 'xs' };
    },
    (r) => {
      const k = r.pick(LKEYS), L = lawOf(r)[k];
      const others = LKEYS.filter((x) => x !== k);
      const opts = r.sample(others, 3).concat([k]);
      const m = mcqT(r, LAWN[k], r.sample(others, 3).map((x) => LAWN[x]));
      return { q: T(`The equation $${L.s}$ shows which law?<br>${m.q.en}`, `Persamaan $${L.s}$ menunjukkan hukum yang manakah?<br>${m.q.ms}`), a: m.ans, sp: 's' };
    },
    (r) => {
      const k = r.pick(LKEYS), L = lawOf(r)[k];
      return { q: T(`Use the ${LAWN[k].en} to find the value of $\\square$: $${L.blank}$`, `Gunakan ${LAWN[k].ms} untuk mencari nilai $\\square$: $${L.blank}$`), a: T(`$${L.hid}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9);
      const eq = r.pick([
        [`${a} + ${b} = ${b} + ${a}`, true, 'comA'], [`${a} - ${b} = ${b} - ${a}`, false, 'sub'], [`${a} \\times ${b} = ${b} \\times ${a}`, true, 'comM'], [`${a} \\div ${b} = ${b} \\div ${a}`, false, 'div'],
      ]);
      need(eq[1] || a !== b);
      return { q: T(`True or false: $${eq[0]}$. Give a reason using the arithmetic laws.`, `Benar atau palsu: $${eq[0]}$. Berikan sebab menggunakan hukum aritmetik.`), a: eq[1] ? T('True, by the commutative law.', 'Benar, mengikut hukum kalis tukar tertib.') : T('False, subtraction and division are not commutative.', 'Palsu, penolakan dan pembahagian tidak kalis tukar tertib.'), sp: 's' };
    },
    // contexts (single operation)
    (r) => {
      const t = r.int(-6, 12), d = r.int(3, 15);
      const fall = r.chance();
      const e = fall ? t - d : t + d;
      need(e !== t && e !== 0);
      return { q: T(`The temperature was $${t}^\\circ$C. It ${fall ? 'fell' : 'rose'} by $${d}^\\circ$C. What is the new temperature?`, `Suhu ialah $${t}^\\circ$C. Suhu itu ${fall ? 'turun' : 'naik'} sebanyak $${d}^\\circ$C. Apakah suhu yang baharu?`), a: T(`$${e}^\\circ$C`), sp: 'xs' };
    },
    (r) => {
      const lv = r.int(-4, 8), d = r.int(2, 9);
      const up = r.chance();
      const e = up ? lv + d : lv - d;
      return { q: T(`A lift is at level $${lv}$ (level $0$ is the ground floor). It goes ${up ? 'up' : 'down'} ${d} levels. At which level is it now?`, `Sebuah lif berada di aras $${lv}$ (aras $0$ ialah tingkat bawah). Lif itu bergerak ${up ? 'naik' : 'turun'} ${d} aras. Di aras manakah lif itu sekarang?`), a: T(`Level $${e}$`, `Aras $${e}$`), sp: 'xs' };
    },
    (r) => {
      const bal = r.int(-30, 60), d = r.int(10, 80);
      const dep = r.chance();
      const e = dep ? bal + d : bal - d;
      const [p] = r.pair();
      return { q: T(`${p}'s bank balance is ${bankBal(bal)}. ${p} ${dep ? 'deposits' : 'withdraws'} RM${d}. What is the new balance?`, `Baki bank ${p} ialah ${bankBal(bal)}. ${p} ${dep ? 'mendeposit' : 'mengeluarkan'} RM${d}. Berapakah baki yang baharu?`), a: T(`${bankBal(e)}`), sp: 'xs' };
    },
    (r) => {
      const p = r.int(2, 9), pts = r.int(2, 6);
      const right = r.chance();
      return { q: T(`In a quiz, ${right ? 'each correct answer scores' : 'each wrong answer scores'} $${right ? '+' + pts : -pts}$ points. What is the total score for ${p} ${right ? 'correct' : 'wrong'} answers?`, `Dalam satu kuiz, ${right ? 'setiap jawapan betul mendapat' : 'setiap jawapan salah mendapat'} $${right ? '+' + pts : -pts}$ mata. Berapakah jumlah skor bagi ${p} jawapan ${right ? 'betul' : 'salah'}?`), a: T(`$${right ? p * pts : -p * pts}$ points`, `$${right ? p * pts : -p * pts}$ mata`), sp: 'xs' };
    },
    (r) => {
      const d = r.int(2, 9), h = r.int(2, 8);
      return { q: T(`The temperature in a cold room drops by $${d}^\\circ$C every hour. By how many degrees does it change in ${h} hours? Write your answer as a signed integer.`, `Suhu dalam sebuah bilik sejuk turun sebanyak $${d}^\\circ$C setiap jam. Berapakah perubahan suhu dalam ${h} jam? Tulis jawapan sebagai integer bertanda.`), a: T(`$${-d * h}^\\circ$C`), sp: 'xs' };
    },
    (r) => {
      const h = r.int(2, 8), d = r.int(2, 9);
      const [p] = r.pair();
      return { q: T(`A diver descends $${d * h}$ m in ${h} equal steps. What integer shows the change in depth at each step?`, `Seorang penyelam menyelam $${d * h}$ m dalam ${h} langkah yang sama. Apakah integer yang menunjukkan perubahan kedalaman pada setiap langkah?`), a: T(`$${-d}$ m`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(3, 30), b = r.int(3, 30);
      need(a !== b);
      const [hi, lo] = [Math.max(a, b), Math.min(a, b)];
      return { q: T(`The temperature in city A is $${hi}^\\circ$C and in city B it is $${-lo}^\\circ$C. How many degrees warmer is city A than city B?`, `Suhu di bandar A ialah $${hi}^\\circ$C dan di bandar B ialah $${-lo}^\\circ$C. Berapa darjah lebih panaskah bandar A berbanding bandar B?`), a: T(`$${hi + lo}^\\circ$C`), sp: 'xs' };
    },
    // MCQ with sign-error distractors
    (r) => {
      const a = r.int(2, 12), b = r.int(2, 12);
      need(a !== b);
      const kind = r.pick(['sub', 'add', 'mul', 'div']);
      let expr, right, wrongs;
      if (kind === 'sub') { expr = `${-a} - ${pn(-b)}`; right = -a + b; wrongs = [-a - b, a + b, a - b]; }
      else if (kind === 'add') { expr = `${-a} + ${b}`; right = b - a; wrongs = [-a - b, a + b, a - b]; }
      else if (kind === 'mul') { expr = `${-a} \\times ${pn(-b)}`; right = a * b; wrongs = [-a * b, -a - b, a - b]; }
      else { expr = `${-a * b} \\div ${b}`; right = -a; wrongs = [a, -a * b, -b]; }
      const m = mcq(r, right, wrongs, (x) => `$${x}$`);
      return { q: T(`What is the value of $${expr}$?<br>${m.q}`, `Apakah nilai $${expr}$?<br>${m.q}`), a: T(m.ans), sp: 'xs' };
    },
    // true/false equations
    (r) => {
      const a = r.int(2, 12), b = r.int(2, 12);
      need(a !== b);
      const kind = r.int(0, 3), ok = r.chance();
      let s;
      if (kind === 0) s = `${-a} - ${pn(-b)} = ${ok ? -a + b : -a - b}`;
      else if (kind === 1) s = `${-a} \\times ${pn(-b)} = ${ok ? a * b : -a * b}`;
      else if (kind === 2) s = `${a} - ${b} = ${ok ? a - b : b - a}`;
      else s = `${-a * b} \\div ${pn(-b)} = ${ok ? a : -a}`;
      const val = kind === 0 ? -a + b : kind === 1 ? a * b : kind === 2 ? a - b : a;
      return { q: T(`Is the equation $${s}$ correct? Answer Yes or No.`, `Adakah persamaan $${s}$ betul? Jawab Ya atau Tidak.`), a: T(ok ? 'Yes' : `No, the correct value is $${val}$`, ok ? 'Ya' : `Tidak, nilai yang betul ialah $${val}$`), sp: 'xs' };
    },
    // number line movement
    (r) => {
      const s = r.int(-8, 4), m = r.int(2, 8), right = r.chance();
      const e = right ? s + m : s - m;
      const cmd = right ? `${s} + ${m}` : `${s} - ${m}`;
      return { q: T(`Ali is at $${s}$ on a number line. He moves ${m} units to the ${right ? 'right' : 'left'}. Write the calculation that shows this and find where he stops.`, `Ali berada pada $${s}$ pada garis nombor. Dia bergerak ${m} unit ke ${right ? 'kanan' : 'kiri'}. Tulis pengiraan yang menunjukkan hal ini dan cari kedudukan akhirnya.`), a: T(`$${cmd} = ${e}$`), sp: 'xs' };
    },
    (r) => {
      const s = r.int(-10, -3), m = r.int(2, 9), n2 = r.int(2, 9);
      need(s + m !== 0);
      const p = r.pair()[0];
      return { q: T(`A snail starts at $${s}$ on a vertical scale. It climbs ${m} units and then slides down ${n2} units. Where is it now?`, `Seekor siput bermula pada $${s}$ pada skala menegak. Ia memanjat ${m} unit dan kemudian tergelincir ${n2} unit ke bawah. Di manakah kedudukannya sekarang?`), a: T(`$${s + m - n2}$`), sp: 's' };
    },
    // pattern for the sign rule
    (r) => {
      const b = r.int(2, 8);
      const rows = [3, 2, 1, 0].map((k) => `${k} \\times ${pn(-b)} = ${-k * b}`);
      return { q: T(`Look at the pattern: $${rows.join(',\\ ')}$. Use the pattern to find (a) $(-1) \\times ${pn(-b)}$, (b) $(-2) \\times ${pn(-b)}$.`, `Perhatikan pola: $${rows.join(',\\ ')}$. Gunakan pola itu untuk mencari (a) $(-1) \\times ${pn(-b)}$, (b) $(-2) \\times ${pn(-b)}$.`), a: T(`(a) $${b}$ (b) $${2 * b}$`), sp: 's' };
    },
    // compare two results
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9);
      need(a !== b);
      const forms = [
        [`${a} + ${pn(-b)}`, `${a} - ${pn(-b)}`], [`${-a} \\times ${b}`, `${-a} \\times ${pn(-b)}`], [`${a} - ${b}`, `${b} - ${a}`], [`${-a} + ${b}`, `${-b} + ${a}`],
      ];
      const f = r.pick(forms);
      const va = ev(f[0].replace(/\\times/g, '*')), vb = ev(f[1].replace(/\\times/g, '*'));
      need(va !== vb);
      return { q: T(`Which is greater: $${f[0]}$ or $${f[1]}$?`, `Yang manakah lebih besar: $${f[0]}$ atau $${f[1]}$?`), a: T(`$${f[va > vb ? 0 : 1]}$, since $${Math.max(va, vb)} > ${Math.min(va, vb)}$`, `$${f[va > vb ? 0 : 1]}$, kerana $${Math.max(va, vb)} > ${Math.min(va, vb)}$`), sp: 'xs' };
    },
    // fact families / inverse operations
    (r) => {
      const a = r.nz(-9, 9), b = r.nz(-9, 9);
      const k = r.pick(['add', 'mul']);
      if (k === 'add') return { q: T(`Given that $${a} + ${pn(b)} = ${a + b}$, write down the value of $${a + b} - ${pn(b)}$.`, `Diberi $${a} + ${pn(b)} = ${a + b}$, tulis nilai $${a + b} - ${pn(b)}$.`), a: T(`$${a}$`), sp: 'xs' };
      return { q: T(`Given that $${a} \\times ${pn(b)} = ${a * b}$, write down the value of $${a * b} \\div ${pn(b)}$.`, `Diberi $${a} \\times ${pn(b)} = ${a * b}$, tulis nilai $${a * b} \\div ${pn(b)}$.`), a: T(`$${a}$`), sp: 'xs' };
    },
    // odd one out
    (r) => {
      const a = r.int(3, 12), b = r.int(2, 9);
      need(a !== b);
      const same = [`${a} - ${b}`, `${a} + ${pn(-b)}`, `${-b} + ${a}`];
      const odd = `${b} - ${a}`;
      const all = r.shuffle(same.concat([odd]));
      return { q: T(`Three of these expressions have the same value. Which one is different? $${all.join(',\\ ')}$`, `Tiga daripada ungkapan ini mempunyai nilai yang sama. Yang manakah berbeza? $${all.join(',\\ ')}$`), a: T(`$${odd}$ (its value is $${b - a}$, the others are $${a - b}$)`, `$${odd}$ (nilainya $${b - a}$, yang lain ialah $${a - b}$)`), sp: 's' };
    },
    // three-term simple
    (r) => {
      const a = r.nz(-9, 9), b = r.nz(-9, 9), c = r.nz(-9, 9);
      const f = r.pick([`${a} + ${pn(b)} + ${pn(c)}`, `${a} - ${pn(b)} + ${pn(c)}`, `${a} - ${pn(b)} - ${pn(c)}`, `${a} + ${pn(b)} - ${pn(c)}`]);
      return { q: T(`Calculate $${f}$ from left to right.`, `Hitung $${f}$ dari kiri ke kanan.`), a: T(`$${ev(f)}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 12), b = r.int(2, 12);
      const f = r.pick([`${-a} + ${b} + ${pn(-b)}`, `${a} + ${pn(-b)} + ${b}`, `${-a} - ${pn(-a)} + ${b}`, `${a} + ${pn(-a)} + ${pn(-b)}`]);
      return { q: T(`Simplify by cancelling numbers that add to zero, then evaluate $${f}$.`, `Permudahkan dengan membatalkan nombor yang menghasilkan sifar apabila ditambah, kemudian nilaikan $${f}$.`), a: T(`$${ev(f)}$`), sp: 's' };
    },
    // difference of temperatures / levels
    (r) => {
      const a = r.int(-15, 25), b = r.int(-15, 25);
      need(Math.abs(a - b) > 3);
      const hi = Math.max(a, b), lo = Math.min(a, b);
      return { q: T(`The highest temperature of the day was $${hi}^\\circ$C and the lowest was $${lo}^\\circ$C. Find the difference between them.`, `Suhu tertinggi pada hari itu ialah $${hi}^\\circ$C dan yang terendah ialah $${lo}^\\circ$C. Cari beza antara kedua-duanya.`), a: T(`$${hi - lo}^\\circ$C`), sp: 'xs' };
    },
    (r) => {
      const h = r.int(20, 400), d = r.int(10, 300);
      return { q: T(`A hill is $${h}$ m above sea level and the bottom of a mine is $${d}$ m below sea level. What is the vertical distance from the bottom of the mine to the top of the hill?`, `Sebuah bukit setinggi $${h}$ m di atas aras laut dan dasar sebuah lombong berada $${d}$ m di bawah aras laut. Berapakah jarak menegak dari dasar lombong ke puncak bukit?`), a: T(`$${h + d}$ m`), sp: 'xs' };
    },
    // multiply / divide in a context
    (r) => {
      const n1 = r.int(3, 9), v = r.int(2, 8);
      return { q: T(`Each of ${n1} friends owes RM${v * 5}. Write the total amount of their debts as a negative integer (in RM).`, `Setiap seorang daripada ${n1} orang kawan berhutang RM${v * 5}. Tulis jumlah hutang mereka sebagai integer negatif (dalam RM).`), a: T(`$${-n1 * v * 5}$`), sp: 'xs' };
    },
    (r) => {
      const n1 = r.int(2, 9), v = r.int(2, 9);
      return { q: T(`A debt of RM${n1 * v * 10} is shared equally among ${n1} people. Write each person's share as a negative integer (in RM).`, `Hutang RM${n1 * v * 10} dikongsi sama rata antara ${n1} orang. Tulis bahagian setiap orang sebagai integer negatif (dalam RM).`), a: T(`$${-v * 10}$`), sp: 'xs' };
    },
  ];


  /* expression patterns for combined operations: each builds an ASCII string with valid integer divisions */
  const DV = (r) => { const b = r.sign() * r.int(2, 6), k = r.sign() * r.int(2, 9); return [b * k, b, k]; }; // [dividend, divisor, quotient]
  const N = (r, lo, hi) => r.nz(lo || -9, hi || 9);
  const PAT = [
    (r) => `${N(r)} + ${pn(N(r))} * ${pn(N(r))}`,
    (r) => `${N(r)} - ${pn(N(r))} * ${pn(N(r))}`,
    (r) => `${N(r)} * ${pn(N(r))} + ${pn(N(r))}`,
    (r) => `${N(r)} * ${pn(N(r))} - ${pn(N(r))}`,
    (r) => `(${N(r)} + ${pn(N(r))}) * ${pn(N(r))}`,
    (r) => `(${N(r)} - ${pn(N(r))}) * ${pn(N(r))}`,
    (r) => `${N(r)} * (${N(r)} + ${pn(N(r))})`,
    (r) => `${N(r)} * (${N(r)} - ${pn(N(r))})`,
    (r) => { const [d, b] = DV(r); return `${N(r, -20, 20)} + ${pn(d)} / ${pn(b)}`; },
    (r) => { const [d, b] = DV(r); return `${N(r, -20, 20)} - ${pn(d)} / ${pn(b)}`; },
    (r) => { const [d, b] = DV(r); return `${d} / ${pn(b)} + ${pn(N(r, -12, 12))}`; },
    (r) => { const [d, b] = DV(r); return `${d} / ${pn(b)} - ${pn(N(r, -12, 12))}`; },
    (r) => { const [d, b] = DV(r); return `${d} / ${pn(b)} * ${pn(N(r, -9, 9))}`; },
    (r) => { const [d, b] = DV(r); return `${N(r)} * ${pn(d)} / ${pn(b)}`.replace(/^/, ''); },
    (r) => { const [d, b] = DV(r); return `(${d} + ${pn(b * N(r, -5, 5))}) / ${pn(b)}`; },
    (r) => `${N(r, -20, 20)} - (${N(r)} + ${pn(N(r))})`,
    (r) => `${N(r, -20, 20)} - (${N(r)} - ${pn(N(r))})`,
    (r) => `${N(r, -20, 20)} + (${N(r)} - ${pn(N(r))})`,
    (r) => `${N(r, -9, 9)} * ${pn(N(r))} * ${pn(N(r))}`,
    (r) => `${N(r)} * ${pn(N(r))} + ${pn(N(r))} * ${pn(N(r))}`,
    (r) => `${N(r)} * ${pn(N(r))} - ${pn(N(r))} * ${pn(N(r))}`,
    (r) => { const [d, b] = DV(r), [d2, b2] = DV(r); return `${d} / ${pn(b)} + ${pn(d2)} / ${pn(b2)}`; },
  ];
  const patExpr = (r, k) => {
    const s = PAT[k === undefined ? r.int(0, PAT.length - 1) : k](r);
    const v = ev(s);
    need(Math.abs(v) <= 150 && Math.abs(v) >= 1);
    return { s, v };
  };
  /* smaller numbers for questions needing several expression evaluations */
  const m12 = [
    (r) => { const { s, v } = patExpr(r); return { q: T(`Evaluate $${tx(s)}$.`, `Nilaikan $${tx(s)}$.`), a: T(`$${v}$`), sp: 's' }; },
    (r) => {
      const { s, v } = patExpr(r);
      const wrongMsg = T('Do the brackets first, then multiplication and division from left to right, then addition and subtraction.', 'Selesaikan kurungan dahulu, kemudian darab dan bahagi dari kiri ke kanan, kemudian tambah dan tolak.');
      return { q: T(`Calculate $${tx(s)}$ and state which operation you do first.`, `Hitung $${tx(s)}$ dan nyatakan operasi yang anda lakukan dahulu.`), a: T(`$${v}$`), w: wrongMsg, sp: 's' };
    },
    // insert brackets
    (r) => {
      const a = N(r, -9, 9), b = N(r), c = N(r, -6, 6);
      const kind = r.pick([['+', '*'], ['-', '*'], ['*', '+']]);
      const plain = kind[0] === '*' ? `${a} * ${pn(b)} ${kind[1]} ${pn(c)}` : `${a} ${kind[0]} ${pn(b)} ${kind[1]} ${pn(c)}`;
      const br = kind[0] === '*' ? `${a} * (${b} ${kind[1]} ${pn(c)})` : `(${a} ${kind[0]} ${pn(b)}) ${kind[1]} ${pn(c)}`;
      need(ev(plain) !== ev(br));
      return { q: T(`Insert one pair of brackets in the left side so that the equation is true: $${tx(plain)} = ${ev(br)}$`, `Masukkan satu pasang kurungan pada sebelah kiri supaya persamaan itu benar: $${tx(plain)} = ${ev(br)}$`), a: T(`$${tx(br)} = ${ev(br)}$`), sp: 's' };
    },
    // find the operation
    (r) => {
      const a = r.nz(-12, 12), b = r.nz(-9, 9);
      const ops = [['+', a + b], ['-', a - b], ['*', a * b]];
      if (a % b === 0) ops.push(['/', a / b]);
      const pick = r.pick(ops);
      const others = ops.filter((o) => o[1] === pick[1]);
      need(others.length === 1);
      return { q: T(`Choose $+$, $-$, $\\times$ or $\\div$ to make the statement true: $${a}\\ \\square\\ ${pn(b)} = ${pick[1]}$`, `Pilih $+$, $-$, $\\times$ atau $\\div$ untuk menjadikan pernyataan itu benar: $${a}\\ \\square\\ ${pn(b)} = ${pick[1]}$`), a: T(`$${pick[0] === '*' ? '\\times' : pick[0] === '/' ? '\\div' : pick[0]}$`), sp: 'xs' };
    },
    // efficient calculation with laws
    (r) => {
      const A = r.pick([13, 17, 23, 27, 35, 42, 45, 16, 18, 24]), d = r.pick([1, 2, 3]), up = r.chance();
      const K = up ? 100 + d : 100 - d;
      const neg = r.chance();
      const a = neg ? -A : A;
      return { q: T(`Use the distributive law to calculate $${pn(a)} \\times ${K}$ efficiently. Show your working.`, `Gunakan hukum kalis agihan untuk menghitung $${pn(a)} \\times ${K}$ dengan cekap. Tunjukkan langkah kerja anda.`), a: T(`$${a * K}$`), w: T(`$${pn(a)} \\times (100 ${up ? '+' : '-'} ${d}) = ${a * 100} ${up ? '+' : '-'} ${pn(a * d)} = ${a * K}$`.replace(/\+ \(-(\d+)\)/, '- $1').replace(/- \(-(\d+)\)/, '+ $1')), sp: 's' };
    },
    (r) => {
      const a = r.int(6, 45), p = r.pick([[3, 7], [4, 6], [8, 2], [9, 1], [23, 77], [45, 55], [12, 88]]);
      const neg = r.chance();
      const b = neg ? -a : a;
      return { q: T(`Use the distributive law to evaluate $${pn(b)} \\times ${p[0]} + ${pn(b)} \\times ${p[1]}$.`, `Gunakan hukum kalis agihan untuk menilai $${pn(b)} \\times ${p[0]} + ${pn(b)} \\times ${p[1]}$.`), a: T(`$${b * (p[0] + p[1])}$`), w: T(`$${pn(b)} \\times (${p[0]} + ${p[1]}) = ${pn(b)} \\times ${p[0] + p[1]}$`), sp: 's' };
    },
    (r) => {
      const [x, y] = r.pick([[25, 4], [50, 2], [20, 5], [125, 8], [250, 4]]);
      const m = r.int(3, 19);
      const sg = r.pick([[-1, 1], [1, -1], [-1, -1]]);
      const A = sg[0] * x, B = m, C = sg[1] * y;
      const order = r.pick([`${pn(A)} * ${B} * ${pn(C)}`, `${B} * ${pn(A)} * ${pn(C)}`]);
      return { q: T(`Calculate $${tx(order)}$ by grouping two of the numbers so that the product is easy. State the law used.`, `Hitung $${tx(order)}$ dengan mengumpulkan dua nombor supaya hasil darabnya mudah. Nyatakan hukum yang digunakan.`), a: T(`$${ev(order)}$ (commutative and associative laws of multiplication)`, `$${ev(order)}$ (hukum kalis tukar tertib dan kalis sekutuan bagi pendaraban)`), sp: 's' };
    },
    (r) => {
      const a = r.int(20, 90), b = r.int(2, 9), c = r.int(10, 60);
      const pos = r.chance();
      const expr = pos ? `${-a} + ${c} + ${a}` : `${a} + ${pn(-c)} + ${pn(-a)}`;
      return { q: T(`Use the commutative and associative laws to work out $${expr}$ without a calculator.`, `Gunakan hukum kalis tukar tertib dan hukum kalis sekutuan untuk menghitung $${expr}$ tanpa kalkulator.`), a: T(`$${ev(expr)}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 9) * 10, b = r.int(2, 9) * 10 + 7, c = r.int(1, 9) * 10 + 3;
      const exp1 = `${-b} + ${a} + ${pn(-c)}`;
      return { q: T(`Calculate $${exp1}$ by adding the numbers with the same sign first.`, `Hitung $${exp1}$ dengan menambah nombor yang bertanda sama dahulu.`), a: T(`$${ev(exp1)}$`), sp: 's' };
    },
    // missing values, two steps
    (r) => {
      const form = r.int(0, 5);
      const x = r.nz(-9, 9), a = r.nz(-6, 6), b = r.nz(-15, 15);
      need(Math.abs(a) > 1);
      let s;
      if (form === 0) s = `${a} \\times \\square + ${pn(b)} = ${a * x + b}`;
      else if (form === 1) s = `${a} \\times \\square - ${pn(b)} = ${a * x - b}`;
      else if (form === 2) s = `${b} - ${a} \\times \\square = ${b - a * x}`;
      else if (form === 3) s = `(\\square + ${pn(b)}) \\times ${pn(a)} = ${(x + b) * a}`;
      else if (form === 4) s = `(\\square - ${pn(b)}) \\div ${pn(a)} = ${(x - b) / a}`, need(Number.isInteger((x - b) / a));
      else s = `${a * x} \\div ${pn(a)} + \\square = ${x + b}`;
      const ans = form === 5 ? b : x;
      return { q: T(`Find the value of $\\square$: $${s}$`, `Cari nilai $\\square$: $${s}$`), a: T(`$${ans}$`), sp: 's' };
    },
    (r) => {
      const x = r.nz(-9, 9), a = r.nz(-5, 5), b = r.nz(-20, 20);
      need(Math.abs(a) > 1);
      const p = r.name();
      const c = r.pick([
        [T(`${p} thinks of a number, multiplies it by $${a}$, then adds $${b}$. The result is $${a * x + b}$. What number was ${p} thinking of?`, `${p} memikirkan satu nombor, mendarabkannya dengan $${a}$, kemudian menambah $${b}$. Hasilnya ialah $${a * x + b}$. Apakah nombor yang difikirkan oleh ${p}?`), x],
        [T(`${p} thinks of a number, subtracts $${b}$ from it, then divides by $${a}$. The result is $${x}$. What number was ${p} thinking of?`, `${p} memikirkan satu nombor, menolak $${b}$ daripadanya, kemudian membahagikan dengan $${a}$. Hasilnya ialah $${x}$. Apakah nombor yang difikirkan oleh ${p}?`), a * x + b],
      ]);
      return { q: c[0], a: T(`$${c[1]}$`), sp: 's' };
    },
    (r) => {
      const bal = r.int(-40, 60), w1 = r.int(20, 90), w2 = r.int(10, 70), dep = r.int(30, 200);
      const fin = bal - w1 - w2 + dep;
      const p = r.name();
      return { q: T(`${p}'s account balance is ${bankBal(bal)}. ${p} withdraws RM${w1}, pays RM${w2} for a bill and then deposits RM${dep}. What is ${p}'s final balance?`, `Baki akaun ${p} ialah ${bankBal(bal)}. ${p} mengeluarkan RM${w1}, membayar RM${w2} untuk sebuah bil dan kemudian mendeposit RM${dep}. Berapakah baki akhir ${p}?`), a: T(`${bankBal(fin)}`), sp: 's' };
    },
    (r) => {
      const c = r.int(3, 9), w = r.int(1, 5), u = r.int(0, 3);
      const P = r.int(3, 6), Q = r.int(1, 3);
      const tot = c * P - w * Q;
      return { q: T(`A quiz gives $+${P}$ points for each correct answer, $-${Q}$ point${Q > 1 ? 's' : ''} for each wrong answer and $0$ for an unanswered question. Aina got ${c} correct, ${w} wrong and left ${u} unanswered. Find her total score.`, `Sebuah kuiz memberikan $+${P}$ mata bagi setiap jawapan betul, $-${Q}$ mata bagi setiap jawapan salah dan $0$ bagi soalan yang tidak dijawab. Aina mendapat ${c} jawapan betul, ${w} jawapan salah dan tidak menjawab ${u} soalan. Cari jumlah skornya.`), a: T(`$${tot}$`), w: T(`$${c} \\times ${P} + ${w} \\times (-${Q}) = ${tot}$`), sp: 's' };
    },
    (r) => {
      const days = r.int(4, 6);
      const pl = Array.from({ length: days }, () => r.int(-12, 25) * 5);
      const tot = pl.reduce((x, y) => x + y, 0);
      const p = r.name();
      const dn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].slice(0, days), dm = ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'].slice(0, days);
      return { q: T(`A stall's daily profit (RM) over ${days} days is: ${pl.map((v, i) => `${dn[i]} $${v}$`).join(', ')}. (A negative value is a loss.) Find the total profit or loss for the ${days} days.`, `Keuntungan harian (RM) sebuah gerai selama ${days} hari ialah: ${pl.map((v, i) => `${dm[i]} $${v}$`).join(', ')}. (Nilai negatif ialah kerugian.) Cari jumlah untung atau rugi bagi ${days} hari itu.`), a: T(`${tot >= 0 ? 'Profit' : 'Loss'} of RM${Math.abs(tot)} ($${tot}$)`, `${tot >= 0 ? 'Untung' : 'Rugi'} RM${Math.abs(tot)} ($${tot}$)`), sp: 's' };
    },
    (r) => {
      const t = [r.int(-9, 5), r.int(-9, 5), r.int(-9, 5), r.int(-9, 5)];
      const s = t.reduce((x, y) => x + y, 0);
      need(s % 4 === 0);
      return { q: T(`The temperatures recorded at four times were $${lst(t)}$ (in $^\\circ$C). Find the mean temperature.`, `Suhu yang direkodkan pada empat masa ialah $${lst(t)}$ (dalam $^\\circ$C). Cari suhu min.`), a: T(`$${s / 4}^\\circ$C`), w: T(`$(${t.map(pn).join(' + ')}) \\div 4 = ${s} \\div 4$`), sp: 's' };
    },
    (r) => {
      const lv = r.int(-3, 3), a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9);
      const lv2 = lv + a - b + c;
      return { q: T(`A lift starts at level $${lv}$. It goes up ${a} levels, down ${b} levels and then up ${c} levels. (a) At which level does it stop? (b) How many levels does it travel altogether?`, `Sebuah lif bermula di aras $${lv}$. Ia naik ${a} aras, turun ${b} aras dan kemudian naik ${c} aras. (a) Di aras manakah ia berhenti? (b) Berapa aras jumlah perjalanan lif itu?`), a: T(`(a) $${lv2}$ (b) $${a + b + c}$`), sp: 's' };
    },
    (r) => {
      const d = r.int(2, 9), h = r.int(3, 8), t0 = r.int(0, 12);
      return { q: T(`A freezer is at $${t0}^\\circ$C. Its temperature falls by $${d}^\\circ$C every hour. What is its temperature after ${h} hours?`, `Sebuah peti sejuk beku berada pada suhu $${t0}^\\circ$C. Suhunya turun sebanyak $${d}^\\circ$C setiap jam. Apakah suhunya selepas ${h} jam?`), a: T(`$${t0 - d * h}^\\circ$C`), w: T(`$${t0} + ${h} \\times (-${d}) = ${t0 - d * h}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(2, 6), share = r.int(2, 9) * 10, paid = r.int(1, 6) * 10;
      const total = k * share + paid;
      const p = r.name();
      return { q: T(`${p} owes RM${total}. ${p} pays back RM${paid} and the remaining debt is shared equally between ${k} siblings. Write the share of each sibling as a negative integer (in RM).`, `${p} berhutang RM${total}. ${p} membayar balik RM${paid} dan baki hutang dikongsi sama rata oleh ${k} orang adik-beradik. Tulis bahagian setiap orang sebagai integer negatif (dalam RM).`), a: T(`$${-share}$`), sp: 's' };
    },
    // error analysis
    (r) => {
      const a = N(r, -9, 9), b = N(r, -9, 9), c = N(r, -9, 9);
      need(a + b * c !== (a + b) * c);
      const s = `${a} + ${pn(b)} * ${pn(c)}`;
      const wrongMid = a + b, wrongV = (a + b) * c;
      const p = r.name();
      return { q: T(`${p}'s working: $${tx(s)} = ${wrongMid} \\times ${pn(c)} = ${wrongV}$. What mistake did ${p} make? Find the correct answer.`, `Kerja ${p}: $${tx(s)} = ${wrongMid} \\times ${pn(c)} = ${wrongV}$. Apakah kesilapan yang dibuat oleh ${p}? Cari jawapan yang betul.`), a: T(`${p} added before multiplying. Correct: $${ev(s)}$`, `${p} menambah sebelum mendarab. Betul: $${ev(s)}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 15), b = r.int(2, 15);
      need(a !== b);
      const p = r.name();
      const kind = r.pick(['neg', 'sub']);
      if (kind === 'neg') return { q: T(`${p} wrote $${a} - ${pn(-b)} = ${a - b}$. Explain the mistake and give the correct value.`, `${p} menulis $${a} - ${pn(-b)} = ${a - b}$. Terangkan kesilapan itu dan berikan nilai yang betul.`), a: T(`Subtracting $${-b}$ is the same as adding $${b}$, so the answer is $${a + b}$.`, `Menolak $${-b}$ sama dengan menambah $${b}$, jadi jawapannya ialah $${a + b}$.`), sp: 's' };
      return { q: T(`${p} wrote $${-a} \\times ${pn(-b)} = ${-a * b}$. Explain the mistake and give the correct value.`, `${p} menulis $${-a} \\times ${pn(-b)} = ${-a * b}$. Terangkan kesilapan itu dan berikan nilai yang betul.`), a: T(`Negative $\\times$ negative gives a positive answer, so it is $${a * b}$.`, `Negatif $\\times$ negatif memberikan jawapan positif, jadi jawapannya ialah $${a * b}$.`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9);
      need(a !== b && a - (b - c) !== (a - b) - c);
      return { q: T(`(a) Evaluate $(${a} - ${b}) - ${c}$ and $${a} - (${b} - ${c})$. (b) Is subtraction associative? Give a reason.`, `(a) Nilaikan $(${a} - ${b}) - ${c}$ dan $${a} - (${b} - ${c})$. (b) Adakah penolakan kalis sekutuan? Berikan sebab.`), a: T(`(a) $${a - b - c}$ and $${a - (b - c)}$ (b) No, the two answers are different.`, `(a) $${a - b - c}$ dan $${a - (b - c)}$ (b) Tidak, kedua-dua jawapan berbeza.`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 6), c = r.int(2, 3), k = r.int(2, 3), b = c * k;
      const x = a * b * c;
      const e1 = `(${x} / ${b}) / ${c}`, e2 = `${x} / (${b} / ${c})`;
      const v1 = ev(e1), v2 = ev(e2);
      need(v1 !== v2);
      return { q: T(`(a) Evaluate $${tx(e1)}$ and $${tx(e2)}$. (b) Is division associative? Give a reason.`, `(a) Nilaikan $${tx(e1)}$ dan $${tx(e2)}$. (b) Adakah pembahagian kalis sekutuan? Berikan sebab.`), a: T(`(a) $${v1}$ and $${v2}$ (b) No, the two answers are different.`, `(a) $${v1}$ dan $${v2}$ (b) Tidak, kedua-dua jawapan berbeza.`), sp: 's' };
    },
    // repeated addition, table of signs
    (r) => {
      const a = r.int(2, 7), b = r.int(2, 6);
      const k = r.pick([0, 1]);
      const term = k ? `(${-a})` : `${a}`;
      const s = Array(b).fill(term).join(' + ');
      return { q: T(`Write $${b} \\times ${pn(k ? -a : a)}$ as repeated addition and evaluate it.`, `Tulis $${b} \\times ${pn(k ? -a : a)}$ sebagai penambahan berulang dan nilaikan.`), a: T(`$${s} = ${b * (k ? -a : a)}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 6), b = r.int(2, 6);
      need(a !== b);
      const cells = [[a, b], [-a, b], [a, -b], [-a, -b]];
      return { q: T(`Complete the table of products.<br>${SPM.table([[`$${-a}$`, '', ''], [`$${a}$`, '', '']], { head: ['×', `$${-b}$`, `$${b}$`], rowHead: true })}`, `Lengkapkan jadual hasil darab.<br>${SPM.table([[`$${-a}$`, '', ''], [`$${a}$`, '', '']], { head: ['×', `$${-b}$`, `$${b}$`], rowHead: true })}`), a: T(`Row $${-a}$: $${a * b}$, $${-a * b}$; row $${a}$: $${-a * b}$, $${a * b}$`), sp: 's' };
    },
    // verify distributive law with numbers
    (r) => {
      const a = r.nz(-7, 7), b = r.nz(-9, 9), c = r.nz(-9, 9);
      need(Math.abs(a) > 1);
      const l = a * (b + c), rr = a * b + a * c;
      return { q: T(`Show that $${a} \\times (${b} + ${pn(c)}) = ${a} \\times ${pn(b)} + ${a} \\times ${pn(c)}$ by evaluating both sides.`, `Tunjukkan bahawa $${a} \\times (${b} + ${pn(c)}) = ${a} \\times ${pn(b)} + ${a} \\times ${pn(c)}$ dengan menilai kedua-dua belah.`), a: T(`Left side: $${l}$; right side: $${a * b} + ${pn(a * c)} = ${rr}$; both equal $${l}$.`, `Belah kiri: $${l}$; belah kanan: $${a * b} + ${pn(a * c)} = ${rr}$; kedua-duanya sama dengan $${l}$.`), sp: 's' };
    },
    // MCQ combined
    (r) => {
      const { s, v } = patExpr(r, r.pick([0, 1, 4, 5, 16]));
      const wrongs = [];
      const cand = [v + r.pick([2, 3, 4]), -v, v - r.pick([2, 3, 5]), v * 2];
      const m = mcq(r, v, cand.filter((x) => x !== v).slice(0, 3), (x) => `$${x}$`);
      return { q: T(`Which is the correct value of $${tx(s)}$?<br>${m.q}`, `Yang manakah nilai yang betul bagi $${tx(s)}$?<br>${m.q}`), a: T(m.ans), sp: 's' };
    },
    // two integer puzzles
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9);
      need(a !== b);
      return { q: T(`Two integers have a product of $${-a * b}$ and the smaller one is $${-Math.max(a, b)}$. Find the other integer.`, `Hasil darab dua integer ialah $${-a * b}$ dan integer yang lebih kecil ialah $${-Math.max(a, b)}$. Cari integer yang satu lagi.`), a: T(`$${Math.min(a, b)}$`), sp: 's' };
    },
    // sequences
    (r) => {
      const a = r.nz(-3, 3), m = r.pick([-2, -3, 2]);
      need(Math.abs(a) > 0);
      const t = [a, a * m, a * m * m, a * m * m * m];
      return { q: T(`Write the next two terms of the sequence $${lst(t)},\\ \\ldots$ and state the rule.`, `Tulis dua sebutan seterusnya bagi urutan $${lst(t)},\\ \\ldots$ dan nyatakan peraturannya.`), a: T(`$${a * m ** 4},\\ ${a * m ** 5}$; multiply by $${m}$ each time`, `$${a * m ** 4},\\ ${a * m ** 5}$; darab dengan $${m}$ setiap kali`), sp: 's' };
    },
    (r) => {
      const a = r.int(20, 40), d = r.int(3, 9), k = r.int(6, 9);
      const list = Array.from({ length: 4 }, (_, i) => a - i * d);
      return { q: T(`A pattern starts $${lst(list)},\\ \\ldots$ where each term is $${d}$ less than the term before it. Find the ${k}th term.`, `Satu pola bermula $${lst(list)},\\ \\ldots$ dengan setiap sebutan kurang $${d}$ daripada sebutan sebelumnya. Cari sebutan ke-${k}.`), a: T(`$${a - (k - 1) * d}$`), sp: 's' };
    },
  ];


  /* nested / grouped expressions for the advanced level (ASCII, brackets [] and ()) */
  const PATA = [
    (r) => `${N(r, -9, 9)} * [${N(r)} - (${N(r)} + ${pn(N(r))})]`,
    (r) => `[${N(r)} - (${N(r)} - ${pn(N(r))})] * ${pn(N(r))}`,
    (r) => `${N(r, -20, 20)} - [${N(r)} * (${N(r)} + ${pn(N(r))})]`,
    (r) => `${N(r, -20, 20)} - ${pn(N(r))} * [${N(r)} - ${pn(N(r))}]`,
    (r) => `(${N(r)} - ${pn(N(r))}) * (${N(r)} - ${pn(N(r))})`,
    (r) => `(${N(r)} + ${pn(N(r))}) * (${N(r)} + ${pn(N(r))})`,
    (r) => { const b = r.sign() * r.int(2, 6), k = r.sign() * r.int(2, 5), c = N(r, -6, 6); return `[${b * k} + ${pn(c * b)}] / ${pn(b)} - ${pn(N(r))}`; },
    (r) => { const d = r.sign() * r.int(2, 5), k = r.sign() * r.int(2, 6); return `${N(r, -9, 9)} * ${pn(N(r))} - ${pn(d * k)} / ${pn(d)} * ${pn(N(r, -4, 4))}`; },
    (r) => `-${r.int(2, 9)} - [${N(r)} - (${N(r)} - ${pn(N(r))})]`,
    (r) => `${N(r)} * ${pn(N(r))} - ${pn(N(r))} * ${pn(N(r))} + ${pn(N(r))}`,
    (r) => { const a = r.int(2, 5), b = r.sign() * r.int(2, 5), k = r.sign() * r.int(2, 5); return `[${N(r)} - ${pn(N(r))}] * [${N(r)} + ${pn(N(r))}] / ${pn(N(r, -3, 3))}`; },
    (r) => `${N(r, -30, 30)} - [${N(r)} - ${pn(N(r))} * (${N(r)} - ${pn(N(r))})]`,
    (r) => `[${N(r)} * ${pn(N(r))} + ${pn(N(r))}] * ${pn(N(r, -4, 4))}`,
    (r) => `(${N(r, -12, 12)} - ${pn(N(r))}) * ${pn(N(r, -4, 4))} - ${pn(N(r))} * ${pn(N(r))}`,
  ];
  const patA = (r, k) => {
    const s = PATA[k === undefined ? r.int(0, PATA.length - 1) : k](r);
    const v = ev(s);
    need(Math.abs(v) <= 200 && v !== 0);
    return { s, v };
  };
  const a12 = [
    (r) => { const { s, v } = patA(r); return { q: T(`Evaluate $${tx(s)}$.`, `Nilaikan $${tx(s)}$.`), a: T(`$${v}$`), sp: 'm' }; },
    (r) => { const { s, v } = patA(r); return { q: T(`Show each step of your working to evaluate $${tx(s)}$.`, `Tunjukkan setiap langkah pengiraan anda untuk menilai $${tx(s)}$.`), a: T(`$${v}$`), sp: 'l' }; },
    (r) => {
      const { s, v } = patA(r);
      const wrongs = [-v, v + r.pick([2, 4, 6]), v - r.pick([3, 5, 7]), v * 2];
      const m = mcq(r, v, wrongs.filter((x) => x !== v && x !== 0).slice(0, 3), (x) => `$${x}$`);
      return { q: T(`Which is the value of $${tx(s)}$?<br>${m.q}`, `Yang manakah nilai bagi $${tx(s)}$?<br>${m.q}`), a: T(m.ans), sp: 'm' };
    },
    (r) => {
      const { s, v } = patA(r);
      const x = r.nz(-9, 9);
      need(v + x !== 0);
      return { q: T(`Evaluate $${tx(s)}$ and hence write down the value of $${tx(s)} + ${pn(x)}$.`, `Nilaikan $${tx(s)}$ dan seterusnya tulis nilai $${tx(s)} + ${pn(x)}$.`), a: T(`$${v}$; $${v + x}$`), sp: 'm' };
    },
    // known product => deduce others
    (r) => {
      const a = r.int(12, 48), b = r.int(11, 39);
      const P = a * b;
      const kind = r.pick([0, 1, 2]);
      const parts = [
        [`(-${a}) \\times ${b}`, -P], [`${a} \\times (-${b})`, -P], [`(-${a}) \\times (-${b})`, P], [`${-P} \\div ${b}`, -a], [`${P} \\div (-${a})`, -b], [`${-P} \\div (-${b})`, a],
      ];
      const pick = r.sample(parts, 3);
      return { q: T(`Given that $${a} \\times ${b} = ${P}$, write down the value of ${pick.map((p, i) => `(${'abc'[i]}) $${p[0]}$`).join(', ')}.`, `Diberi $${a} \\times ${b} = ${P}$, tulis nilai ${pick.map((p, i) => `(${'abc'[i]}) $${p[0]}$`).join(', ')}.`), a: T(pick.map((p, i) => `(${'abc'[i]}) $${p[1]}$`).join(' ')), sp: 's' };
    },
    (r) => {
      const a = r.int(11, 39), b = r.int(12, 45);
      const S1 = a + b;
      return { q: T(`Given that $${a} + ${b} = ${S1}$, write down (a) $${-a} + ${pn(-b)}$, (b) $${S1} + ${pn(-a)}$, (c) $${-S1} - ${pn(-b)}$.`, `Diberi $${a} + ${b} = ${S1}$, tulis (a) $${-a} + ${pn(-b)}$, (b) $${S1} + ${pn(-a)}$, (c) $${-S1} - ${pn(-b)}$.`), a: T(`(a) $${-S1}$ (b) $${b}$ (c) $${-a}$`), sp: 's' };
    },
    // laws: counter-examples and reasoning
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9);
      need(a !== b);
      const c = r.pick([
        [T(`Ali says "$a - b = b - a$ for all integers". Use $a = ${a}$ and $b = ${b}$ to show that Ali is wrong.`, `Ali berkata "$a - b = b - a$ bagi semua integer". Gunakan $a = ${a}$ dan $b = ${b}$ untuk menunjukkan bahawa Ali salah.`), T(`$${a} - ${b} = ${a - b}$ but $${b} - ${a} = ${b - a}$, so they are not equal.`, `$${a} - ${b} = ${a - b}$ tetapi $${b} - ${a} = ${b - a}$, jadi kedua-duanya tidak sama.`)],
        [T(`Ali says "$a \\div b = b \\div a$ for all non-zero integers". Use $a = ${a * b}$ and $b = ${b}$ to show that Ali is wrong.`, `Ali berkata "$a \\div b = b \\div a$ bagi semua integer bukan sifar". Gunakan $a = ${a * b}$ dan $b = ${b}$ untuk menunjukkan bahawa Ali salah.`), T(`$${a * b} \\div ${b} = ${a}$ but $${b} \\div ${a * b} = \\dfrac{1}{${a}}$, so they are not equal.`, `$${a * b} \\div ${b} = ${a}$ tetapi $${b} \\div ${a * b} = \\dfrac{1}{${a}}$, jadi kedua-duanya tidak sama.`)],
        [T(`Siti says "$a \\times (b - c) = a \\times b - c$". Use $a = ${a}$, $b = ${b}$ and $c = 2$ to show that Siti is wrong, and write the correct result.`, `Siti berkata "$a \\times (b - c) = a \\times b - c$". Gunakan $a = ${a}$, $b = ${b}$ dan $c = 2$ untuk menunjukkan bahawa Siti salah, dan tulis hasil yang betul.`), T(`$${a} \\times (${b} - 2) = ${a * (b - 2)}$ but $${a} \\times ${b} - 2 = ${a * b - 2}$. Correct: $a \\times (b - c) = a \\times b - a \\times c$.`, `$${a} \\times (${b} - 2) = ${a * (b - 2)}$ tetapi $${a} \\times ${b} - 2 = ${a * b - 2}$. Betul: $a \\times (b - c) = a \\times b - a \\times c$.`)],
      ]);
      need(c[0].en.indexOf('undefined') < 0);
      return { q: c[0], a: c[1], sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9);
      const which = r.pick([
        [`${a} \\times (${b} + ${c})`, `${a} \\times ${b} + ${a} \\times ${c}`, a * (b + c), T('distributive law', 'hukum kalis agihan')],
        [`(${a} + ${b}) + ${c}`, `${a} + (${b} + ${c})`, a + b + c, T('associative law of addition', 'hukum kalis sekutuan bagi penambahan')],
        [`(${a} \\times ${b}) \\times ${c}`, `${a} \\times (${b} \\times ${c})`, a * b * c, T('associative law of multiplication', 'hukum kalis sekutuan bagi pendaraban')],
      ]);
      return { q: T(`Evaluate $${which[0]}$ and $${which[1]}$. Which arithmetic law does this illustrate?`, `Nilaikan $${which[0]}$ dan $${which[1]}$. Hukum aritmetik yang manakah diilustrasikan oleh hal ini?`), a: T(`Both equal $${which[2]}$; ${which[3].en}`, `Kedua-duanya sama dengan $${which[2]}$; ${which[3].ms}`), sp: 's' };
    },
    (r) => {
      const a = r.int(21, 89), b = r.int(2, 9);
      const c = r.pick([
        [T(`Which law makes $${a} \\times ${b} + ${a} \\times ${10 - b}$ easy to evaluate? Evaluate it.`, `Hukum yang manakah menjadikan $${a} \\times ${b} + ${a} \\times ${10 - b}$ mudah dinilai? Nilaikannya.`), T(`Distributive law: $${a} \\times 10 = ${a * 10}$`, `Hukum kalis agihan: $${a} \\times 10 = ${a * 10}$`)],
        [T(`Which law lets you calculate $${-a} + ${b + 100} + ${a}$ quickly? Evaluate it.`, `Hukum yang manakah membolehkan anda menghitung $${-a} + ${b + 100} + ${a}$ dengan cepat? Nilaikannya.`), T(`Commutative and associative laws of addition: $${b + 100}$`, `Hukum kalis tukar tertib dan kalis sekutuan bagi penambahan: $${b + 100}$`)],
        [T(`Which law lets you calculate $${b} \\times ${a} \\times 10$ ... `.replace(' ... ', ''), ''), T('')],
      ].slice(0, 2));
      return { q: c[0], a: c[1], sp: 's' };
    },
    // estimation and reasonableness
    (r) => {
      const a = r.int(31, 98), b = r.int(21, 89);
      const est = Math.round(a / 10) * 10 * (Math.round(b / 10) * 10);
      const P = a * b;
      const opts = [P, P * 10, Math.round(P / 10), P + 1000];
      const neg = r.chance();
      const c = neg ? -P : P;
      const m = mcq(r, c, [c * 10, Math.round(c / 10), c + (neg ? -1 : 1) * 1000], (x) => `$${x}$`);
      return { q: T(`Estimate $${neg ? '(-' + a + ')' : a} \\times ${b}$ by rounding each number to the nearest ten. Then choose the most reasonable exact answer.<br>${m.q}`, `Anggarkan $${neg ? '(-' + a + ')' : a} \\times ${b}$ dengan membundarkan setiap nombor kepada puluh terdekat. Kemudian pilih jawapan tepat yang paling munasabah.<br>${m.q}`), a: T(`Estimate: $${neg ? -est : est}$; ${m.ans}`, `Anggaran: $${neg ? -est : est}$; ${m.ans}`), sp: 's' };
    },
    // greatest / smallest with given integers
    (r) => {
      const v = r.distinct(4, -9, 9);
      need(!v.includes(0));
      const maxP = Math.max(...pairs(v).map(([x, y]) => x * y)), minP = Math.min(...pairs(v).map(([x, y]) => x * y));
      const sh = lst(r.shuffle(v));
      return { q: T(`Four integers are $${sh}$. Choose two of them (a) to give the greatest product, (b) to give the smallest product. State each product.`, `Empat integer ialah $${sh}$. Pilih dua daripadanya (a) untuk memberikan hasil darab terbesar, (b) untuk memberikan hasil darab terkecil. Nyatakan setiap hasil darab.`), a: T(`(a) $${maxP}$ (b) $${minP}$`), sp: 's' };
    },
    (r) => {
      const v = r.distinct(4, -12, 12);
      const ps = pairs(v);
      const maxS = Math.max(...ps.map(([x, y]) => x - y)), minS = Math.min(...ps.map(([x, y]) => x - y));
      const sh = lst(r.shuffle(v));
      return { q: T(`Choose two different numbers $a$ and $b$ from $${sh}$ so that $a - b$ is (a) as large as possible, (b) as small as possible. State the values.`, `Pilih dua nombor berbeza $a$ dan $b$ daripada $${sh}$ supaya $a - b$ (a) sebesar mungkin, (b) sekecil mungkin. Nyatakan nilainya.`), a: T(`(a) $${maxS}$ (b) $${minS}$`), sp: 's' };
    },
    // sum and product puzzles
    (r) => {
      const p = r.int(2, 9), q = r.int(2, 9);
      need(p !== q);
      const c = r.pick([[-p, q], [-p, -q], [p, -q]]);
      const sum = c[0] + c[1], prod = c[0] * c[1];
      const ok = [];
      for (let x = -30; x <= 30; x++) for (let y = x; y <= 30; y++) if (x + y === sum && x * y === prod) ok.push([x, y]);
      need(ok.length === 1);
      return { q: T(`Find two integers whose sum is $${sum}$ and whose product is $${prod}$.`, `Cari dua integer yang hasil tambahnya ialah $${sum}$ dan hasil darabnya ialah $${prod}$.`), a: T(`$${ok[0][0]}$ and $${ok[0][1]}$`, `$${ok[0][0]}$ dan $${ok[0][1]}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(-9, -2), b = r.int(2, 9), c = r.int(2, 9);
      const mid = -c;
      return { q: T(`The sum of three consecutive integers is $${3 * mid}$. Find the three integers.`, `Hasil tambah tiga integer berturutan ialah $${3 * mid}$. Cari ketiga-tiga integer itu.`), a: T(`$${lst([mid - 1, mid, mid + 1])}$`), w: T(`The middle integer is $${3 * mid} \\div 3 = ${mid}$.`, `Integer di tengah ialah $${3 * mid} \\div 3 = ${mid}$.`), sp: 's' };
    },
    (r) => {
      const b = r.distinct(3, -9, 9);
      need(b.every((x) => x !== 0));
      const m1 = b[0] + b[1], m2 = b[1] + b[2], top = m1 + m2;
      const hide = r.pick([0, 1, 2]);
      const shown = b.map((x, i) => (i === hide ? '\\square' : String(x)));
      const cells = `Bottom row: $${shown.join(',\\ ')}$. Middle row: $${m1},\\ ${m2}$. Top: $${top}$`;
      const cellsMs = `Baris bawah: $${shown.join(',\\ ')}$. Baris tengah: $${m1},\\ ${m2}$. Atas: $${top}$`;
      return { q: T(`In a number pyramid, each block is the sum of the two blocks directly below it. ${cells}. Find the missing number.`, `Dalam sebuah piramid nombor, setiap blok ialah hasil tambah dua blok tepat di bawahnya. ${cellsMs}. Cari nombor yang hilang.`), a: T(`$${b[hide]}$`), sp: 's' };
    },
    // mean-based
    (r) => {
      const t = [r.int(-12, 6), r.int(-12, 6), r.int(-12, 6), r.int(-12, 6)];
      const mean = r.int(-6, 0);
      const fifth = 5 * mean - t.reduce((x, y) => x + y, 0);
      need(Math.abs(fifth) <= 20 && fifth !== 0);
      return { q: T(`Five temperatures have a mean of $${mean}^\\circ$C. Four of them are $${lst(t)}$ (in $^\\circ$C). Find the fifth temperature.`, `Lima bacaan suhu mempunyai min $${mean}^\\circ$C. Empat daripadanya ialah $${lst(t)}$ (dalam $^\\circ$C). Cari bacaan suhu yang kelima.`), a: T(`$${fifth}^\\circ$C`), w: T(`Total $= 5 \\times (${mean}) = ${5 * mean}$`, `Jumlah $= 5 \\times (${mean}) = ${5 * mean}$`), sp: 'm' };
    },
    // sign reasoning
    (r) => {
      const neg = r.int(2, 9), pos = r.int(1, 6);
      const isMul = r.chance();
      const res = neg % 2 === 0 ? 'positive' : 'negative';
      return { q: T(`Without calculating, state whether the product of ${neg} negative integers and ${pos} positive integer${pos > 1 ? 's' : ''} is positive or negative. Explain your reasoning.`, `Tanpa mengira, nyatakan sama ada hasil darab ${neg} integer negatif dan ${pos} integer positif adalah positif atau negatif. Terangkan alasan anda.`), a: T(`${SPM.cap(res)}: each pair of negative factors gives a positive product, so the sign depends on whether the number of negative factors ($${neg}$) is even or odd.`, `${res === 'positive' ? 'Positif' : 'Negatif'}: setiap pasangan faktor negatif memberikan hasil darab positif, jadi tanda bergantung pada sama ada bilangan faktor negatif ($${neg}$) genap atau ganjil.`), sp: 'm' };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9);
      const c = r.pick([
        [T('If $a \\times b > 0$ and $a + b < 0$, are $a$ and $b$ positive or negative?', 'Jika $a \\times b > 0$ dan $a + b < 0$, adakah $a$ dan $b$ positif atau negatif?'), T('Both negative.', 'Kedua-duanya negatif.')],
        [T('If $a \\times b < 0$ and $a > 0$, is $b$ positive or negative?', 'Jika $a \\times b < 0$ dan $a > 0$, adakah $b$ positif atau negatif?'), T('$b$ is negative.', '$b$ ialah negatif.')],
        [T('If $a \\div b < 0$ and $a < 0$, is $b$ positive or negative?', 'Jika $a \\div b < 0$ dan $a < 0$, adakah $b$ positif atau negatif?'), T('$b$ is positive.', '$b$ ialah positif.')],
        [T('If $a \\times b > 0$ and $a + b > 0$, are $a$ and $b$ positive or negative?', 'Jika $a \\times b > 0$ dan $a + b > 0$, adakah $a$ dan $b$ positif atau negatif?'), T('Both positive.', 'Kedua-duanya positif.')],
      ]);
      return { q: T(`Here $a$ and $b$ are non-zero integers. ${c[0].en} Give a reason.`, `Di sini $a$ dan $b$ ialah integer bukan sifar. ${c[0].ms} Berikan sebab.`), a: c[1], sp: 's' };
    },
    // context, multi-part with a table
    (r) => {
      const cities = r.sample(COLD, 3);
      const hi = [r.int(-4, 6), r.int(-4, 6), r.int(-4, 6)];
      const lo = hi.map((h) => h - r.int(3, 12));
      const tb = (a, b, c) => SPM.table(cities.map((x, i) => [x[a], `$${hi[i]}$`, `$${lo[i]}$`]), { head: [b, c[0], c[1]] });
      const diff = hi.map((h, i) => h - lo[i]);
      const k = diff.indexOf(Math.max(...diff));
      need(diff.filter((x) => x === diff[k]).length === 1);
      return { q: T(`The table shows the highest and lowest temperatures ($^\\circ$C) of three cities on one day.<br>${tb('en', 'City', ['Highest', 'Lowest'])}(a) Find the difference between the highest and lowest temperatures for each city. (b) Which city had the greatest difference?`, `Jadual menunjukkan suhu tertinggi dan terendah ($^\\circ$C) bagi tiga buah bandar pada suatu hari.<br>${tb('ms', 'Bandar', ['Tertinggi', 'Terendah'])}(a) Cari beza antara suhu tertinggi dengan suhu terendah bagi setiap bandar. (b) Bandar yang manakah mempunyai beza yang paling besar?`), a: T(`(a) $${lst(diff)}$ (b) ${cities[k].en}`, `(a) $${lst(diff)}$ (b) ${cities[k].ms}`), sp: 'm' };
    },
    (r) => {
      const t = r.int(-6, 4), drop = r.int(2, 6), h = r.int(3, 6), rise = r.int(2, 5), h2 = r.int(2, 4);
      const fin = t - drop * h + rise * h2;
      return { q: T(`The temperature at 6 p.m. was $${t}^\\circ$C. For the next ${h} hours it fell by $${drop}^\\circ$C every hour. Then for ${h2} hours it rose by $${rise}^\\circ$C every hour. Find the final temperature.`, `Suhu pada pukul 6 petang ialah $${t}^\\circ$C. Untuk ${h} jam seterusnya, suhu turun sebanyak $${drop}^\\circ$C setiap jam. Kemudian selama ${h2} jam, suhu naik sebanyak $${rise}^\\circ$C setiap jam. Cari suhu akhir.`), a: T(`$${fin}^\\circ$C`), w: T(`$${t} - ${h} \\times ${drop} + ${h2} \\times ${rise}$`), sp: 'm' };
    },
    // find the missing pieces in two-step working
    (r) => {
      const a = r.nz(-9, 9), b = r.nz(-9, 9), c = r.nz(-9, 9), d = r.nz(-9, 9);
      const e = `${a} * ${pn(b)} + ${pn(c)} * ${pn(d)}`;
      const v = ev(e);
      const p1 = a * b, p2 = c * d;
      return { q: T(`Complete the working: $${tx(e)} = \\square + \\square = \\square$.`, `Lengkapkan langkah kerja: $${tx(e)} = \\square + \\square = \\square$.`), a: T(`$${p1} + ${pn(p2)} = ${v}$`), sp: 's' };
    },
    (r) => {
      const x = r.int(-9, 9), a = r.nz(-4, 4), b = r.nz(-9, 9), c = r.nz(-4, 4);
      need(a !== c && Math.abs(a) > 1 && Math.abs(c) > 1);
      const lhs = a * x + b, rhs = c * x;
      const y = r.int(-6, 6);
      // unknown on both sides via search: find integer x with a*x + b = c*x + d
      const d = a * y + b - c * y;
      need(y !== 0 && d !== b);
      return { q: T(`By trying integers from $-6$ to $6$, find the value of $\\square$ that makes this true: $${a} \\times \\square + ${pn(b)} = ${c} \\times \\square + ${pn(d)}$`, `Dengan mencuba integer dari $-6$ hingga $6$, cari nilai $\\square$ yang menjadikan pernyataan ini benar: $${a} \\times \\square + ${pn(b)} = ${c} \\times \\square + ${pn(d)}$`), a: T(`$${y}$`), sp: 'm' };
    },
    (r) => {
      const a = r.nz(-9, 9), b = r.nz(-9, 9);
      const c = r.pick([
        [T(`The sum of two integers is $${a + b}$ and their difference is $${a - b}$ (first minus second). Find the two integers.`, `Hasil tambah dua integer ialah $${a + b}$ dan bezanya ialah $${a - b}$ (pertama tolak kedua). Cari kedua-dua integer itu.`), T(`$${a}$ and $${b}$`, `$${a}$ dan $${b}$`)],
      ]);
      need(a !== b);
      return { q: c[0], a: c[1], sp: 's' };
    },
  ];
  const pairs = (v) => { const o = []; for (let i = 0; i < v.length; i++) for (let j = 0; j < v.length; j++) if (i !== j) o.push([v[i], v[j]]); return o; };


  const m12b = [
    // which expression has the greatest / smallest value
    (r) => {
      const exprs = [];
      while (exprs.length < 4) {
        const s = PAT[r.pick([0, 1, 2, 3, 4, 5, 15, 16])](r);
        const v = ev(s);
        if (Math.abs(v) < 60 && !exprs.some((e) => e.v === v)) exprs.push({ s, v });
      }
      const big = r.chance();
      const best = exprs.slice().sort((x, y) => (big ? y.v - x.v : x.v - y.v))[0];
      const m = mcqT(r, { en: `$${tx(best.s)}$`, ms: `$${tx(best.s)}$` }, exprs.filter((e) => e !== best).map((e) => ({ en: `$${tx(e.s)}$`, ms: `$${tx(e.s)}$` })));
      return { q: T(`Which expression has the ${big ? 'greatest' : 'smallest'} value?<br>${m.q.en}`, `Ungkapan yang manakah mempunyai nilai yang ${big ? 'terbesar' : 'terkecil'}?<br>${m.q.ms}`), a: T(`${m.ans.en} (value $${best.v}$)`, `${m.ans.ms} (nilai $${best.v}$)`), sp: 's' };
    },
    // arrange values of expressions
    (r) => {
      const exprs = [];
      while (exprs.length < 3) {
        const a = N(r, -9, 9), b = N(r, -9, 9);
        const s = r.pick([`${a} + ${pn(b)}`, `${a} - ${pn(b)}`, `${a} * ${pn(b)}`]);
        const v = ev(s);
        if (!exprs.some((e) => e.v === v)) exprs.push({ s, v });
      }
      const asc = r.chance();
      const ord = exprs.slice().sort((x, y) => (asc ? x.v - y.v : y.v - x.v));
      return { q: T(`Work out the value of each expression and arrange the expressions in ${asW(asc).en} of value: $${exprs.map((e) => tx(e.s)).join(',\\ ')}$`, `Hitung nilai setiap ungkapan dan susun ungkapan itu mengikut ${asW(asc).ms} nilai: $${exprs.map((e) => tx(e.s)).join(',\\ ')}$`), a: T(`$${ord.map((e) => tx(e.s)).join(',\\ ')}$ (values $${lst(ord.map((e) => e.v))}$)`, `$${ord.map((e) => tx(e.s)).join(',\\ ')}$ (nilai $${lst(ord.map((e) => e.v))}$)`), sp: 's' };
    },
    // missing operation signs
    (r) => {
      const a = N(r, -9, 9), b = N(r, -6, 6), c = N(r, -6, 6);
      const O = ['+', '-', '*'];
      const o1 = r.pick(O), o2 = r.pick(O);
      const s = `${a} ${o1} ${pn(b)} ${o2} ${pn(c)}`;
      const v = ev(s);
      const sol = [];
      for (const x of O) for (const y of O) if (ev(`${a} ${x} ${pn(b)} ${y} ${pn(c)}`) === v) sol.push([x, y]);
      need(sol.length === 1 && Math.abs(v) <= 60);
      const sym = (o) => (o === '*' ? '\\times' : o);
      return { q: T(`Choose $+$, $-$ or $\\times$ for each box to make the statement true: $${a}\\ \\square\\ ${pn(b)}\\ \\square\\ ${pn(c)} = ${v}$ (use the usual order of operations).`, `Pilih $+$, $-$ atau $\\times$ bagi setiap kotak untuk menjadikan pernyataan itu benar: $${a}\\ \\square\\ ${pn(b)}\\ \\square\\ ${pn(c)} = ${v}$ (gunakan tertib operasi biasa).`), a: T(`$${a} ${sym(o1)} ${pn(b)} ${sym(o2)} ${pn(c)} = ${v}$`), sp: 's' };
    },
    // find what must be added / subtracted
    (r) => {
      const a = N(r, -15, 15), b = N(r, -15, 15);
      need(a !== b);
      const c = r.pick([
        [T(`What number must be added to $${a}$ to give $${b}$?`, `Apakah nombor yang mesti ditambah kepada $${a}$ untuk mendapat $${b}$?`), b - a],
        [T(`What number must be subtracted from $${a}$ to give $${b}$?`, `Apakah nombor yang mesti ditolak daripada $${a}$ untuk mendapat $${b}$?`), a - b],
        [T(`By how much must the temperature change to go from $${a}^\\circ$C to $${b}^\\circ$C?`, `Berapakah perubahan suhu yang diperlukan untuk beralih daripada $${a}^\\circ$C kepada $${b}^\\circ$C?`), b - a],
      ]);
      return { q: c[0], a: T(`$${c[1]}$`), sp: 'xs' };
    },
    // translate words into calculation
    (r) => {
      const a = N(r, -9, 9), b = N(r, -9, 9), c = N(r, -9, 9);
      const forms = [
        [T(`the product of $${a}$ and the sum of $${b}$ and $${c}$`, `hasil darab $${a}$ dan hasil tambah $${b}$ dengan $${c}$`), `${a} * (${b} + ${pn(c)})`],
        [T(`the sum of $${a}$ and the product of $${b}$ and $${c}$`, `hasil tambah $${a}$ dan hasil darab $${b}$ dengan $${c}$`), `${a} + ${pn(b)} * ${pn(c)}`],
        [T(`$${a}$ subtracted from the product of $${b}$ and $${c}$`, `$${a}$ ditolak daripada hasil darab $${b}$ dan $${c}$`), `${b} * ${pn(c)} - ${pn(a)}`],
        [T(`the difference between $${a}$ and $${b}$, multiplied by $${c}$`, `beza antara $${a}$ dengan $${b}$, didarab dengan $${c}$`), `(${a} - ${pn(b)}) * ${pn(c)}`],
        [T(`$${a}$ divided by the sum of $${b}$ and $${c}$`, `$${a}$ dibahagi dengan hasil tambah $${b}$ dan $${c}$`), `${a * (b + c)} / (${b} + ${pn(c)})`],
      ];
      const f = r.pick(forms);
      const v = ev(f[1]);
      need(Math.abs(v) < 100 && b + c !== 0);
      return { q: T(`Write as a calculation and evaluate: ${f[0].en}.`, `Tulis sebagai satu pengiraan dan nilaikan: ${f[0].ms}.`), a: T(`$${tx(f[1])} = ${v}$`), sp: 's' };
    },
    // removing brackets with a negative sign in front
    (r) => {
      const a = r.int(2, 15), b = r.int(2, 15), c = r.int(2, 9);
      const forms = [`-(${a} + ${b})`, `-(${a} - ${b})`, `-(-${a} + ${b})`, `-(-${a} - ${b})`, `${c} - (${a} - ${b})`, `${c} - (-${a} + ${b})`, `-${c} - (${a} - ${b})`, `-(-${a}) + ${c}`];
      const s = r.pick(forms);
      return { q: T(`Remove the brackets and evaluate $${s.replace(/-\(-(\d+)\)/, '-(-$1)')}$.`, `Buang kurungan dan nilaikan $${s.replace(/-\(-(\d+)\)/, '-(-$1)')}$.`), a: T(`$${ev(s)}$`), sp: 's' };
    },
    // function machine
    (r) => {
      const a = r.nz(-5, 5), b = r.nz(-9, 9);
      need(Math.abs(a) > 1);
      const ins = r.sample([-3, -2, -1, 0, 1, 2, 3, 4], 3);
      const opFirst = r.chance();
      const f = (x) => (opFirst ? a * x + b : (x + b) * a);
      const rule = opFirst ? T(`multiply by $${a}$, then add $${b}$`, `darab dengan $${a}$, kemudian tambah $${b}$`) : T(`add $${b}$, then multiply by $${a}$`, `tambah $${b}$, kemudian darab dengan $${a}$`);
      return { q: T(`A number machine does this: ${rule.en}. Find the output for the inputs $${lst(ins)}$.`, `Sebuah mesin nombor melakukan ini: ${rule.ms}. Cari output bagi input $${lst(ins)}$.`), a: T(`$${lst(ins.map(f))}$`), sp: 's' };
    },
    (r) => {
      const a = r.nz(-5, 5), b = r.nz(-9, 9), x = r.int(-8, 8);
      need(Math.abs(a) > 1);
      const opFirst = r.chance();
      const out = opFirst ? a * x + b : (x + b) * a;
      const rule = opFirst ? T(`multiplies the input by $${a}$ and then adds $${b}$`, `mendarabkan input dengan $${a}$ dan kemudian menambah $${b}$`) : T(`adds $${b}$ to the input and then multiplies by $${a}$`, `menambah $${b}$ kepada input dan kemudian mendarab dengan $${a}$`);
      return { q: T(`A number machine ${rule.en}. The output is $${out}$. Work backwards to find the input.`, `Sebuah mesin nombor ${rule.ms}. Outputnya ialah $${out}$. Bekerja ke belakang untuk mencari input.`), a: T(`$${x}$`), sp: 's' };
    },
    // sign identification MCQ
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9);
      const cands = [
        [`${-a} \\times ${pn(-b)}`, a * b], [`${-a} + ${pn(-b)}`, -a - b], [`${-a} \\times ${b}`, -a * b], [`${a} - ${b + a}`, -b], [`${-a} \\div ${pn(-b * a)}`, 0.5],
        [`${-a} - ${pn(-a - b)}`, b], [`${a} + ${pn(-a - b)}`, -b], [`${-a * b} \\div ${b}`, -a],
      ];
      const pos = r.chance();
      const good = cands.filter((c) => (pos ? c[1] > 0 : c[1] < 0));
      const bad = cands.filter((c) => (pos ? c[1] < 0 : c[1] > 0));
      need(good.length >= 1 && bad.length >= 3);
      const g = r.pick(good);
      const w = r.sample(bad, 3);
      const m = mcqT(r, { en: `$${g[0]}$`, ms: `$${g[0]}$` }, w.map((x) => ({ en: `$${x[0]}$`, ms: `$${x[0]}$` })));
      return { q: T(`Which of these expressions gives a ${pos ? 'positive' : 'negative'} answer?<br>${m.q.en}`, `Antara ungkapan berikut, yang manakah memberikan jawapan ${pos ? 'positif' : 'negatif'}?<br>${m.q.ms}`), a: T(`${m.ans.en}`, `${m.ans.ms}`), sp: 's' };
    },
    // compare with < >
    (r) => {
      const a = N(r, -9, 9), b = N(r, -9, 9);
      need(Math.abs(a) > 1 && Math.abs(b) > 1);
      const f = r.pick([[`${pn(a)} * ${pn(b)}`, `${pn(a)} + ${pn(b)}`], [`${pn(a)} - ${pn(b)}`, `${pn(b)} - ${pn(a)}`], [`${pn(a)} * ${pn(b)}`, `${pn(a)} * ${pn(-b)}`], [`${pn(a)} + ${pn(b)}`, `${pn(a)} * ${pn(b)}`]]);
      const v1 = ev(f[0]), v2 = ev(f[1]);
      need(v1 !== v2);
      return { q: T(`Fill in the blank with $<$ or $>$: $${tx(f[0])}\\ \\square\\ ${tx(f[1])}$`, `Isi tempat kosong dengan $<$ atau $>$: $${tx(f[0])}\\ \\square\\ ${tx(f[1])}$`), a: T(`$${tx(f[0])} ${v1 < v2 ? '<' : '>'} ${tx(f[1])}$, since $${v1} ${v1 < v2 ? '<' : '>'} ${v2}$`, `$${tx(f[0])} ${v1 < v2 ? '<' : '>'} ${tx(f[1])}$, kerana $${v1} ${v1 < v2 ? '<' : '>'} ${v2}$`), sp: 's' };
    },
    // count the steps
    (r) => {
      const start = r.int(10, 40), step = r.int(2, 7), k = r.int(4, 12);
      const end = start - step * k;
      return { q: T(`A diver starts at $${start}$ m above the sea bed reading and goes down $${step}$ m every minute... `.replace(/A diver.*$/, `The temperature is $${start}^\\circ$C and falls by $${step}^\\circ$C every hour. After how many hours will it be $${end}^\\circ$C?`), `Suhu ialah $${start}^\\circ$C dan turun sebanyak $${step}^\\circ$C setiap jam. Selepas berapa jam suhu itu akan menjadi $${end}^\\circ$C?`), a: T(`$${k}$ hours`, `$${k}$ jam`), w: T(`$(${start} - (${end})) \\div ${step}$`), sp: 's' };
    },
  ];


  const e12b = [
    // mental maths with tens / hundreds
    (r) => {
      const a = r.int(2, 9) * r.pick([10, 100]), b = r.int(2, 9) * r.pick([10, 100]), c = r.int(2, 9);
      const f = r.pick([`${-a} + ${b}`, `${a} - ${b + a}`, `${c * 10} * ${pn(-c)}`, `${-c * 100} / ${c}`, `${-a} - ${b}`, `${a} * ${pn(-10)}`, `${-a * 10} / ${pn(-10)}`]);
      return { q: T(`Work out $${tx(f)}$ mentally.`, `Kira $${tx(f)}$ secara mental.`), a: T(`$${ev(f)}$`), sp: 'xs' };
    },
    // repeated factors of -1
    (r) => {
      const k = r.int(3, 6);
      const s = Array(k).fill('(-1)').join(' \\times ');
      return { q: T(`Find the value of $${s}$. How does the answer depend on the number of negative factors?`, `Cari nilai $${s}$. Bagaimanakah jawapan bergantung pada bilangan faktor negatif?`), a: T(`$${k % 2 ? -1 : 1}$: an ${k % 2 ? 'odd' : 'even'} number of negative factors gives a ${k % 2 ? 'negative' : 'positive'} answer.`, `$${k % 2 ? -1 : 1}$: bilangan faktor negatif yang ${k % 2 ? 'ganjil' : 'genap'} memberikan jawapan ${k % 2 ? 'negatif' : 'positif'}.`), sp: 's' };
    },
    // table with a rule
    (r) => {
      const a = r.nz(-5, 5);
      need(Math.abs(a) > 1);
      const xs = [-2, -1, 0, 1, 2, 3].slice(r.int(0, 2), r.int(0, 2) + 4);
      need(xs.length === 4);
      const rule = r.pick([[T(`multiply $x$ by $${a}$`, `darabkan $x$ dengan $${a}$`), (x) => a * x], [T(`multiply $x$ by $${a}$ and then add $1$`, `darabkan $x$ dengan $${a}$ dan kemudian tambah $1$`), (x) => a * x + 1]]);
      const th = SPM.table([['$x$'].concat(xs.map((x) => `$${x}$`)), ['$y$'].concat(xs.map(() => ''))], { rowHead: true });
      return { q: T(`Complete the table of values. To find $y$, ${rule[0].en}.<br>${th}`, `Lengkapkan jadual nilai. Untuk mencari $y$, ${rule[0].ms}.<br>${th}`), a: T(`$y = ${lst(xs.map(rule[1]))}$`), sp: 's' };
    },
    // net worth
    (r) => {
      const a = r.int(2, 9) * 10, b = r.int(2, 9) * 10;
      need(a !== b);
      const p = r.name();
      return { q: T(`${p} has RM${a} in a wallet and owes a friend RM${b}. Write ${p}'s net amount of money as an integer (a debt is negative) and say whether ${p} is in debt.`, `${p} mempunyai RM${a} dalam dompet dan berhutang RM${b} kepada seorang kawan. Tulis jumlah bersih wang ${p} sebagai satu integer (hutang ialah negatif) dan nyatakan sama ada ${p} berhutang.`), a: T(`$${a - b}$; ${a < b ? 'yes, in debt' : 'no, not in debt'}`, `$${a - b}$; ${a < b ? 'ya, berhutang' : 'tidak berhutang'}`), sp: 's' };
    },
    (r) => {
      const [a, b] = r.distinct(2, -9, 9);
      return { q: T(`In a golf game a lower score is better. Player A scored $${a}$ and player B scored $${b}$. Who played better, and by how many strokes?`, `Dalam permainan golf, skor yang lebih rendah adalah lebih baik. Pemain A mendapat skor $${a}$ dan pemain B mendapat skor $${b}$. Siapakah yang bermain lebih baik, dan berapa pukulankah bezanya?`), a: T(`Player ${a < b ? 'A' : 'B'} by $${Math.abs(a - b)}$ strokes`, `Pemain ${a < b ? 'A' : 'B'}, dengan beza $${Math.abs(a - b)}$ pukulan`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9);
      need(a !== b);
      const t = r.pick([
        [T(`Complete the sentence: $${-a} + \\square = ${b - a}$ because $\\square = $ ______.`, `Lengkapkan ayat: $${-a} + \\square = ${b - a}$ kerana $\\square = $ ______.`), `${b}`],
        [T(`Complete: $${a} - \\square = ${a + b}$, so $\\square = $ ______.`, `Lengkapkan: $${a} - \\square = ${a + b}$, jadi $\\square = $ ______.`), `${-b}`],
        [T(`Complete: $${-a} \\times \\square = ${a * c}$, so $\\square = $ ______.`, `Lengkapkan: $${-a} \\times \\square = ${a * c}$, jadi $\\square = $ ______.`), `${-c}`],
        [T(`Complete: $\\square \\div ${pn(-a)} = ${c}$, so $\\square = $ ______.`, `Lengkapkan: $\\square \\div ${pn(-a)} = ${c}$, jadi $\\square = $ ______.`), `${-a * c}`],
      ]);
      return { q: t[0], a: T(`$${t[1]}$`), sp: 'xs' };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9);
      const s = r.pick([
        [`-(${-a})`, a], [`-(${a})`, -a], [`-(${-a} + ${-b < 0 ? '(' + -b + ')' : -b})`, a + b],
      ]);
      const c = r.pick([[`-(-${a})`, a], [`-(${a})`, -a], [`-(-${a} - ${b})`, a + b]]);
      return { q: T(`Simplify $${c[0]}$.`, `Permudahkan $${c[0]}$.`), a: T(`$${c[1]}$`), sp: 'xs' };
    },
  ];

  const m12c = [
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9);
      const n1 = r.int(2, 5);
      const t = r.pick([
        [T(`Add $${a}$ to $${-b}$, then multiply the result by $${n1}$. Write this as one expression with brackets and evaluate it.`, `Tambah $${a}$ kepada $${-b}$, kemudian darabkan hasilnya dengan $${n1}$. Tulis sebagai satu ungkapan berkurungan dan nilaikannya.`), `(${-b} + ${a}) * ${n1}`],
        [T(`Subtract $${a}$ from $${-b}$, then multiply the result by $${-n1}$. Write this as one expression with brackets and evaluate it.`, `Tolak $${a}$ daripada $${-b}$, kemudian darabkan hasilnya dengan $${-n1}$. Tulis sebagai satu ungkapan berkurungan dan nilaikannya.`), `(${-b} - ${a}) * ${pn(-n1)}`],
        [T(`Multiply $${-a}$ by $${b}$, then add $${c}$. Write this as one expression and evaluate it.`, `Darabkan $${-a}$ dengan $${b}$, kemudian tambah $${c}$. Tulis sebagai satu ungkapan dan nilaikannya.`), `${-a} * ${b} + ${c}`],
        [T(`Add $${a}$ and $${-b}$, then subtract the result from $${c}$. Write this as one expression and evaluate it.`, `Tambah $${a}$ dan $${-b}$, kemudian tolak hasilnya daripada $${c}$. Tulis sebagai satu ungkapan dan nilaikannya.`), `${c} - (${a} + ${pn(-b)})`],
      ]);
      return { q: t[0], a: T(`$${tx(t[1])} = ${ev(t[1])}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(11, 40), b = r.int(2, 9);
      const c0 = r.int(2, 9);
      const seq = [a, -b, -a, b, c0];
      const s = r.shuffle(seq);
      return { q: T(`Use the commutative and associative laws to group the numbers so that the calculation is easy: $${s.map((x, i) => (i === 0 ? x : x < 0 ? `+ (${x})` : `+ ${x}`)).join(' ')}$.`, `Gunakan hukum kalis tukar tertib dan kalis sekutuan untuk mengumpulkan nombor supaya pengiraan mudah: $${s.map((x, i) => (i === 0 ? x : x < 0 ? `+ (${x})` : `+ ${x}`)).join(' ')}$.`), a: T(`$${c0}$`), sp: 's' };
    },
    (r) => {
      const a = r.nz(-6, 6), b = r.nz(-6, 6), c = r.nz(-6, 6);
      const k = r.pick([
        [`(${a} + ${pn(b)}) + ${pn(c)}`, `${a} + (${b} + ${pn(c)})`, T('addition', 'penambahan')],
        [`(${a} \\times ${pn(b)}) \\times ${pn(c)}`, `${a} \\times (${b} \\times ${pn(c)})`, T('multiplication', 'pendaraban')],
      ]);
      const v = k[2].en === 'addition' ? a + b + c : a * b * c;
      return { q: T(`Verify the associative law of ${k[2].en} for $${a}$, $${b}$ and $${c}$ by evaluating $${k[0]}$ and $${k[1]}$.`, `Sahkan hukum kalis sekutuan bagi ${k[2].ms} untuk $${a}$, $${b}$ dan $${c}$ dengan menilai $${k[0]}$ dan $${k[1]}$.`), a: T(`Both give $${v}$, so the two groupings are equal.`, `Kedua-duanya memberikan $${v}$, jadi kedua-dua pengumpulan adalah sama.`), sp: 's' };
    },
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 9), d = r.int(3, 6);
      const steps = [
        [`${-a} * ${b} * ${d}`, `${d} * ${pn(-a)} * ${b}`, T('commutative law of multiplication', 'hukum kalis tukar tertib bagi pendaraban')],
        [`${-a} + ${b} + ${a}`, `${-a} + ${a} + ${b}`, T('commutative law of addition', 'hukum kalis tukar tertib bagi penambahan')],
        [`${d} * (${a} + ${b})`, `${d} * ${a} + ${d} * ${b}`, T('distributive law', 'hukum kalis agihan')],
        [`(${-a} + ${b}) + ${c}`, `${-a} + (${b} + ${c})`, T('associative law of addition', 'hukum kalis sekutuan bagi penambahan')],
      ];
      const k = r.pick(steps);
      const v0 = ev(k[0].replace(/\\times/g, '*')), v1 = ev(k[1].replace(/\\times/g, '*'));
      need(v0 === v1);
      return { q: T(`Write down the arithmetic law that allows $${tx(k[0])} = ${tx(k[1])}$ and hence evaluate the expression.`, `Tulis hukum aritmetik yang membenarkan $${tx(k[0])} = ${tx(k[1])}$ dan seterusnya nilaikan ungkapan itu.`), a: T(`${SPM.cap(k[2].en)}; value $${v0}$`, `${SPM.cap(k[2].ms)}; nilai $${v0}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(3, 6), w = r.int(2, 9);
      const rate = r.int(2, 8);
      const p = r.name();
      return { q: T(`${p} earns RM${rate * 10} each day working part-time and spends RM${w * 5} each day. What is the change in ${p}'s savings after ${k} days? (Write a negative number if the savings decrease.)`, `${p} memperoleh RM${rate * 10} sehari bekerja sambilan dan berbelanja RM${w * 5} sehari. Apakah perubahan simpanan ${p} selepas ${k} hari? (Tulis nombor negatif jika simpanan berkurang.)`), a: T(`$${k * (rate * 10 - w * 5)}$`), w: T(`$${k} \\times (${rate * 10} - ${w * 5})$`), sp: 's' };
    },
    (r) => {
      const a = r.int(3, 12), b = r.int(2, 9);
      need(a !== b);
      const c = r.pick([
        [T(`Ali's temperature reading is $${-a}^\\circ$C and Farid's is $${b}^\\circ$C. Find (a) the sum, (b) the difference (Farid minus Ali) of the two readings.`, `Bacaan suhu Ali ialah $${-a}^\\circ$C dan bacaan suhu Farid ialah $${b}^\\circ$C. Cari (a) hasil tambah, (b) beza (Farid tolak Ali) bagi kedua-dua bacaan itu.`), `(a) $${b - a}^\\circ$C (b) $${b + a}^\\circ$C`],
      ]);
      return { q: c[0], a: T(c[1]), sp: 's' };
    },
  ];

  const a12b = [
    (r) => {
      const a = r.int(2, 9), b = r.int(2, 9);
      const c = r.pick([
        [T(`Find all pairs of integers $a$ and $b$ (both between $-5$ and $5$) for which $a - b = b - a$. Explain what you notice.`, `Cari semua pasangan integer $a$ dan $b$ (kedua-duanya antara $-5$ dengan $5$) yang memenuhi $a - b = b - a$. Terangkan apa yang anda perhatikan.`), T(`Only when $a = b$ (for example $${a} - ${a} = ${a} - ${a} = 0$). Subtraction is not commutative in general.`, `Hanya apabila $a = b$ (contohnya $${a} - ${a} = ${a} - ${a} = 0$). Penolakan tidak kalis tukar tertib secara amnya.`)],
        [T(`Is there an integer $a$ such that $a \\times a$ is negative? Give a reason.`, `Adakah terdapat integer $a$ yang menjadikan $a \\times a$ negatif? Berikan sebab.`), T('No. A positive number times itself is positive, a negative number times itself is positive, and $0 \\times 0 = 0$.', 'Tidak. Nombor positif didarab dengan dirinya adalah positif, nombor negatif didarab dengan dirinya adalah positif, dan $0 \\times 0 = 0$.')],
        [T(`Is $a + b = b + a$ true for negative integers too? Test it with $a = ${-a}$ and $b = ${-b}$.`, `Adakah $a + b = b + a$ benar bagi integer negatif juga? Uji dengan $a = ${-a}$ dan $b = ${-b}$.`), T(`Yes. $${-a} + ${pn(-b)} = ${-a - b}$ and $${-b} + ${pn(-a)} = ${-a - b}$.`, `Ya. $${-a} + ${pn(-b)} = ${-a - b}$ dan $${-b} + ${pn(-a)} = ${-a - b}$.`)],
      ]);
      return { q: c[0], a: c[1], sp: 'm' };
    },
    (r) => {
      const a = r.int(3, 9), b = r.int(2, 8), c = r.int(2, 8);
      need(b !== c);
      const t = r.pick([
        [`${a} * ${b} + ${a} * ${pn(-c)}`, `${a} * (${b} - ${c})`],
        [`${-a} * ${b} + ${-a} * ${c}`, `${-a} * (${b} + ${c})`],
        [`${a} * ${pn(-b)} - ${a} * ${pn(-c)}`, `${a} * (${-b} - ${pn(-c)})`],
      ]);
      return { q: T(`Write $${tx(t[0])}$ as a single product using the distributive law, then evaluate it.`, `Tulis $${tx(t[0])}$ sebagai satu hasil darab tunggal menggunakan hukum kalis agihan, kemudian nilaikannya.`), a: T(`$${tx(t[1])} = ${ev(t[0])}$`), sp: 's' };
    },
    (r) => {
      const t = r.distinct(5, -12, 10);
      const mean = t.reduce((x, y) => x + y, 0);
      need(mean % 5 === 0);
      const hi = Math.max(...t), lo = Math.min(...t);
      const dn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      return { q: T(`The midday temperatures (in $^\\circ$C) on five days were $${lst(t)}$. Find (a) the difference between the highest and lowest temperatures, (b) the mean temperature.`, `Suhu tengah hari (dalam $^\\circ$C) pada lima hari ialah $${lst(t)}$. Cari (a) beza antara suhu tertinggi dengan suhu terendah, (b) suhu min.`), a: T(`(a) $${hi - lo}^\\circ$C (b) $${mean / 5}^\\circ$C`), sp: 'm' };
    },
    (r) => {
      const k = r.int(2, 4);
      const p = r.name(), q = r.name();
      need(p !== q);
      const debtB = r.int(2, 9) * 10;
      return { q: T(`${p} owes RM${debtB} and ${q} owes ${k} times as much as ${p}. Write each debt as an integer, and find the total debt of the two.`, `${p} berhutang RM${debtB} dan ${q} berhutang ${k} kali ganda daripada ${p}. Tulis setiap hutang sebagai integer, dan cari jumlah hutang kedua-duanya.`), a: T(`$${-debtB}$ and $${-debtB * k}$; total $${-debtB * (k + 1)}$`, `$${-debtB}$ dan $${-debtB * k}$; jumlah $${-debtB * (k + 1)}$`), sp: 's' };
    },
  ];


  const e12c = [
    (r) => {
      const lo = -r.int(5, 8), hi = r.int(5, 8);
      const [s, e] = r.distinct(2, lo + 1, hi - 1);
      const ch = e - s;
      return { q: T('The number line shows a start point $P$ and an end point $Q$. Write the change from $P$ to $Q$ as a signed integer, then complete: start + change = end.', 'Garis nombor menunjukkan titik permulaan $P$ dan titik akhir $Q$. Tulis perubahan daripada $P$ ke $Q$ sebagai integer bertanda, kemudian lengkapkan: permulaan + perubahan = akhir.'), fig: numLine(lo, hi, 1, [s, e]), a: T(`Change $${ch > 0 ? '+' : ''}${ch}$; $${s} + ${pn(ch)} = ${e}$`, `Perubahan $${ch > 0 ? '+' : ''}${ch}$; $${s} + ${pn(ch)} = ${e}$`), sp: 's' };
    },
    (r) => {
      const lo = -r.int(5, 8), hi = r.int(5, 8);
      const [s, e] = r.distinct(2, lo + 1, hi - 1);
      const dir = e > s ? 'right' : 'left';
      return { q: T('An ant walks along the number line from $P$ to $Q$. In which direction does it walk, and how many units does it walk?', 'Seekor semut berjalan di sepanjang garis nombor dari $P$ ke $Q$. Ke arah manakah ia berjalan dan berapa unitkah jaraknya?'), fig: numLine(lo, hi, 1, [s, e]), a: T(`To the ${dir}, $${Math.abs(e - s)}$ units`, `Ke ${dir === 'right' ? 'kanan' : 'kiri'}, $${Math.abs(e - s)}$ unit`), sp: 'xs' };
    },
  ];
  const m12d = [
    (r) => {
      const a = r.int(3, 9), b = r.int(3, 9), c = r.int(2, 9);
      need(a !== b);
      const list = r.shuffle([-a, b, a, -b, c]);
      const e = list.map((x, i) => (i === 0 ? String(x) : x < 0 ? `- ${-x}` : `+ ${x}`)).join(' ');
      return { q: T(`Find $${e}$ by first cancelling the pairs of numbers that add up to zero.`, `Cari $${e}$ dengan membatalkan pasangan nombor yang menghasilkan sifar terlebih dahulu.`), a: T(`$${c}$`), sp: 's' };
    },
    (r) => {
      const a = r.nz(-9, 9), b = r.nz(-9, 9);
      const op = r.pick(['+', '-', '*']);
      const v = ev(`${pn(a)} ${op} ${pn(b)}`);
      const inv = { '+': `${v} - ${pn(b)}`, '-': `${v} + ${pn(b)}`, '*': `${v} / ${pn(b)}` }[op];
      need(op !== '*' || Math.abs(b) > 0);
      const p = r.name();
      return { q: T(`${p} calculates $${tx(`${pn(a)} ${op} ${pn(b)}`)} = ${v}$. Use the inverse operation to check the answer. Show the calculation.`, `${p} mengira $${tx(`${pn(a)} ${op} ${pn(b)}`)} = ${v}$. Gunakan operasi songsang untuk menyemak jawapan itu. Tunjukkan pengiraannya.`), a: T(`$${tx(inv)} = ${ev(inv)}$, which is $${a}$, so the answer is correct.`, `$${tx(inv)} = ${ev(inv)}$, iaitu $${a}$, jadi jawapan itu betul.`), sp: 's' };
    },
  ];
  const a12c = [
    (r) => {
      const a = r.nz(-5, 5), b = r.nz(-5, 5);
      need(a !== b && a + b !== 0);
      const t = [a, b];
      for (let i = 0; i < 4; i++) t.push(t[i] + t[i + 1]);
      return { q: T(`In the sequence $${lst(t.slice(0, 4))},\\ \\ldots$ each term after the first two is the sum of the two terms before it. Find the next two terms.`, `Dalam urutan $${lst(t.slice(0, 4))},\\ \\ldots$ setiap sebutan selepas dua sebutan pertama ialah hasil tambah dua sebutan sebelumnya. Cari dua sebutan seterusnya.`), a: T(`$${t[4]},\\ ${t[5]}$`), sp: 's' };
    },
    (r) => {
      const v = r.distinct(5, -12, 12);
      const sorted = v.slice().sort((x, y) => x - y);
      const smallestSum3 = sorted[0] + sorted[1] + sorted[2];
      const sh = lst(r.shuffle(v));
      return { q: T(`From the integers $${sh}$, choose three (each used once) so that their sum is (a) as small as possible, (b) as large as possible. State the sums.`, `Daripada integer $${sh}$, pilih tiga (setiap satu digunakan sekali) supaya hasil tambahnya (a) sekecil mungkin, (b) sebesar mungkin. Nyatakan hasil tambah itu.`), a: T(`(a) $${smallestSum3}$ (b) $${sorted[4] + sorted[3] + sorted[2]}$`), sp: 's' };
    },
  ];


  /* a quantity that goes up and down: (noun, verb up, verb down, unit) */
  const CH = [
    { en: 'the water level of a pond (in cm, relative to its normal level)', ms: 'aras air sebuah kolam (dalam cm, berbanding aras normalnya)', up: ['rises', 'naik'], dn: ['falls', 'turun'], u: ' cm' },
    { en: 'the temperature of a freezer (in $^\\circ$C)', ms: 'suhu sebuah peti sejuk beku (dalam $^\\circ$C)', up: ['rises', 'naik'], dn: ['drops', 'turun'], u: '^\\circ$C', deg: true },
    { en: "a team's score in a quiz (in points)", ms: 'skor sebuah pasukan dalam kuiz (dalam mata)', up: ['gains', 'mendapat tambahan'], dn: ['loses', 'kehilangan'], u: ' points' },
    { en: "a submarine's position (in metres, relative to sea level)", ms: 'kedudukan sebuah kapal selam (dalam meter, berbanding aras laut)', up: ['rises', 'naik'], dn: ['dives', 'menyelam'], u: ' m' },
    { en: "a company's share price change (in sen) from its opening price", ms: 'perubahan harga saham sebuah syarikat (dalam sen) daripada harga bukaannya', up: ['increases', 'bertambah'], dn: ['decreases', 'berkurang'], u: ' sen' },
    { en: "a runner's weight compared with the target weight (in kg)", ms: 'berat badan seorang pelari berbanding berat sasaran (dalam kg)', up: ['increases', 'bertambah'], dn: ['decreases', 'berkurang'], u: ' kg' },
    { en: "the temperature of a cold-storage room (in $^\\circ$C)", ms: 'suhu sebuah bilik simpanan sejuk (dalam $^\\circ$C)', up: ['is raised', 'dinaikkan'], dn: ['is lowered', 'diturunkan'], u: '^\\circ$C', deg: true },
    { en: "the depth reading of a fish tank sensor (in cm, relative to the surface)", ms: 'bacaan kedalaman sensor akuarium (dalam cm, berbanding permukaan air)', up: ['is raised', 'dinaikkan'], dn: ['is lowered', 'diturunkan'], u: ' cm' },
  ];
  const CHx = (c, v) => (c.deg ? `$${v}^\\circ$C` : c.u === ' points' || c.u === ' sen' || c.u === ' kg' || c.u === ' cm' || c.u === ' m' ? `$${v}$${c.u}` : `$${v}$`);
  const e12d = [
    (r) => {
      const c = r.pick(CH), s = r.int(-12, 12), d = r.int(3, 15), up = r.chance();
      const e = up ? s + d : s - d;
      need(e !== 0 && s !== 0);
      return { q: T(`At first, ${c.en} is ${CHx(c, s)}. Then it ${up ? c.up[0] : c.dn[0]} by ${CHx(c, d)}. What is the new value?`, `Pada mulanya, ${c.ms} ialah ${CHx(c, s)}. Kemudian ia ${up ? c.up[1] : c.dn[1]} sebanyak ${CHx(c, d)}. Apakah nilai yang baharu?`), a: T(CHx(c, e)), sp: 'xs' };
    },
  ];
  const m12e = [
    (r) => {
      const c = r.pick(CH), s = r.int(-10, 10), d1 = r.int(3, 12), d2 = r.int(3, 12);
      const up1 = r.chance();
      const e = s + (up1 ? d1 : -d1) + (up1 ? -d2 : d2);
      need(e !== s && e !== 0);
      return { q: T(`At first, ${c.en} is ${CHx(c, s)}. It ${up1 ? c.up[0] : c.dn[0]} by ${CHx(c, d1)} and then ${up1 ? c.dn[0] : c.up[0]} by ${CHx(c, d2)}. What is the final value, and is it higher or lower than the starting value?`, `Pada mulanya, ${c.ms} ialah ${CHx(c, s)}. Ia ${up1 ? c.up[1] : c.dn[1]} sebanyak ${CHx(c, d1)} dan kemudian ${up1 ? c.dn[1] : c.up[1]} sebanyak ${CHx(c, d2)}. Apakah nilai akhirnya, dan adakah ia lebih tinggi atau lebih rendah daripada nilai permulaan?`), a: T(`${CHx(c, e)}; ${e > s ? 'higher' : 'lower'}`, `${CHx(c, e)}; ${e > s ? 'lebih tinggi' : 'lebih rendah'}`), sp: 's' };
    },
    (r) => {
      const c = r.pick(CH), s = r.int(-9, 9), d = r.int(2, 6), k = r.int(3, 6);
      const up = r.chance();
      const e = s + (up ? d * k : -d * k);
      need(e !== 0);
      return { q: T(`At first, ${c.en} is ${CHx(c, s)}. Every hour it ${up ? c.up[0] : c.dn[0]} by ${CHx(c, d)}. What is the value after ${k} hours?`, `Pada mulanya, ${c.ms} ialah ${CHx(c, s)}. Setiap jam ia ${up ? c.up[1] : c.dn[1]} sebanyak ${CHx(c, d)}. Apakah nilainya selepas ${k} jam?`), a: T(CHx(c, e)), w: T(`$${s} ${up ? '+' : '-'} ${k} \\times ${d} = ${e}$`), sp: 's' };
    },
  ];
  const a12d = [
    (r) => {
      const c = r.pick(CH), s = r.int(-9, 9), a = r.int(3, 9), b = r.int(3, 9), k = r.int(2, 5);
      need(a !== b);
      const e = s + a - k * b;
      need(e !== 0 && e !== s);
      return { q: T(`At first, ${c.en} is ${CHx(c, s)}. It ${c.up[0]} by ${CHx(c, a)}, and then ${c.dn[0]} by ${CHx(c, b)} on each of the next ${k} days. Find the value after ${k + 1} days and the total change from the start.`, `Pada mulanya, ${c.ms} ialah ${CHx(c, s)}. Ia ${c.up[1]} sebanyak ${CHx(c, a)}, dan kemudian ${c.dn[1]} sebanyak ${CHx(c, b)} pada setiap satu daripada ${k} hari berikutnya. Cari nilai selepas ${k + 1} hari dan jumlah perubahan dari permulaan.`), a: T(`${CHx(c, e)}; total change $${e - s}$`, `${CHx(c, e)}; jumlah perubahan $${e - s}$`), sp: 'm' };
    },
  ];

  SPM.extend('F1-1.2', { e: e12.concat(e12b, e12c, e12d), m: m12.concat(m12b, m12c, m12d, m12e), a: a12.concat(a12b, a12c, a12d) });

  /* ===================================================================== */
  /* ---- F1-1.3 Positive and negative fractions                             */
  /* ===================================================================== */
  /* small expression trees, so that the displayed expression and its value come from the same structure */
  const Lf = (f, st) => ({ t: 'n', f, st: st || 'f' });   // leaf; st 'm' shows a mixed number
  const Bn = (op, a, b) => ({ t: 'b', op, a, b });
  const Br = (a) => ({ t: 'p', a });
  function evN(x) {
    if (x.t === 'n') return x.f;
    if (x.t === 'p') return evN(x.a);
    const a = evN(x.a), b = evN(x.b);
    if (x.op === '+') return Fr.add(a, b);
    if (x.op === '-') return Fr.sub(a, b);
    if (x.op === '*') return Fr.mul(a, b);
    need(b.n !== 0);
    return Fr.div(a, b);
  }
  const OPS = { '+': '+', '-': '-', '*': '\\times', '/': '\\div' };
  function shN(x, first) {
    if (x.t === 'n') {
      const s = x.st === 'm' ? Fr.mixed(x.f) : x.st === 'd' ? dS(x.f) : Fr.tex(x.f);
      return x.f.n < 0 && !first ? `\\left(${s}\\right)` : s;
    }
    if (x.t === 'p') return `\\left(${shN(x.a, true)}\\right)`;
    return `${shN(x.a, first)} ${OPS[x.op]} ${shN(x.b, false)}`;
  }
  /* random fraction: denominator in [dlo, dhi], numerator 1..(proper ? d-1 : 2d); lowest terms */
  function rf(r, dlo, dhi, o) {
    o = o || {};
    const d = r.int(dlo, dhi);
    const nu = r.int(1, o.improper ? 2 * d : d - 1);
    need(d >= 2 && gcd(nu, d) === 1 && (!o.improper || nu !== d));
    const f = fr(nu, d);
    return o.neg === true ? Fr.neg(f) : o.neg === 'r' && r.chance() ? Fr.neg(f) : f;
  }
  /* shaded bars */
  function bars(d, k, nb) {
    const cw = d <= 6 ? 34 : 26, h = 26, gap = 14;
    const W = nb * d * cw + (nb - 1) * gap + 8;
    let out = '';
    let left = k;
    for (let b = 0; b < nb; b++) {
      const x0 = 4 + b * (d * cw + gap);
      for (let i = 0; i < d; i++) {
        const sh = left > 0;
        if (sh) left--;
        out += S.rect(x0 + i * cw, 4, cw, h, sh ? { fill: 'currentColor', op: 0.35 } : {});
      }
    }
    return S.wrap(W, h + 8, out, 'fraction bars');
  }
  /* fraction number line where only the integers are labelled */
  const fLine = (lo, hi, d, pts, o) => S.numberLine(Object.assign({
    min: lo, max: hi, step: 1 / d, labels: (v) => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : null),
    points: pts.map((v, i) => ({ v, label: LET[i] })), width: Math.min(460, 120 + (hi - lo) * d * 34),
  }, o || {}));
  const e13 = [
    (r) => {
      const d = r.pick([3, 4, 5, 6]);
      const k = r.int(1, d - 1);
      return { q: T(`The distance between $0$ and $1$ on the number line is divided into $${d}$ equal parts. Point $P$ is at the ${k}${k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} mark after $0$. What fraction does $P$ represent?`, `Jarak antara $0$ dengan $1$ pada garis nombor dibahagikan kepada $${d}$ bahagian yang sama. Titik $P$ berada pada tanda ke-${k} selepas $0$. Apakah pecahan yang diwakili oleh $P$?`), a: T(`$${frT(fr(k, d))}$`), sp: 'xs' };
    },
    (r) => {
      const d = r.int(4, 12);
      const v = r.distinct(3, 1, d - 1).map((x) => fr(x, d));
      const asc = r.chance();
      const sorted = v.slice().sort((x, y) => (asc ? Fr.cmp(x, y) : Fr.cmp(y, x)));
      return { q: T(`Arrange $${v.map(frT).join(',\\ ')}$ in ${asW(asc).en}.`, `Susun $${v.map(frT).join(',\\ ')}$ dalam ${asW(asc).ms}.`), a: T(`$${sorted.map(frT).join(',\\ ')}$`), sp: 's' };
    },
    (r) => {
      const d = r.pick([2, 3, 4, 5, 6, 8, 10]);
      const a = r.int(1, d - 1), b = r.int(1, d - 1);
      const s = Bn('*', Lf(fr(a, d)), Lf(fr(r.pick([2, 3, 4, 5, -2, -3]), 1)));
      return { q: T(`Multiply: $${shN(s, true)}$. Write your answer in its simplest form.`, `Darabkan: $${shN(s, true)}$. Tulis jawapan anda dalam bentuk termudah.`), a: T(`$${Fr.mixed(evN(s))}$`), sp: 'xs' };
    },
    (r) => {
      const A = rf(r, 2, 8), B = rf(r, 2, 8);
      const s = Bn('*', Lf(A), Lf(r.chance() ? Fr.neg(B) : B));
      return { q: T(`Evaluate $${shN(s, true)}$.`, `Nilaikan $${shN(s, true)}$.`), a: T(`$${Fr.mixed(evN(s))}$`), sp: 's' };
    },
    (r) => {
      const A = rf(r, 2, 9), k = r.pick([2, 3, 4, 5, 6]);
      const s = Bn('/', Lf(A), Lf(fr(r.chance() ? k : -k, 1)));
      return { q: T(`Divide: $${shN(s, true)}$.`, `Bahagikan: $${shN(s, true)}$.`), a: T(`$${Fr.mixed(evN(s))}$`), sp: 'xs' };
    },
    (r) => {
      const A = rf(r, 2, 8), B = rf(r, 2, 8);
      const s = Bn('/', Lf(A), Lf(r.chance() ? Fr.neg(B) : B));
      return { q: T(`Evaluate $${shN(s, true)}$ by multiplying by the reciprocal of the divisor.`, `Nilaikan $${shN(s, true)}$ dengan mendarab dengan salingan bagi pembahagi.`), a: T(`$${Fr.mixed(evN(s))}$`), sp: 's' };
    },
    (r) => {
      const k = r.nz(-9, 9);
      need(Math.abs(k) > 1);
      return { q: T(`What is the reciprocal of the integer $${k}$?`, `Apakah salingan bagi integer $${k}$?`), a: T(`$${frT(fr(1, k))}$`), sp: 'xs' };
    },
    (r) => {
      const F = rf(r, 2, 9, { neg: 'r' });
      return { q: T(`What number must be added to $${frT(F)}$ to give $0$?`, `Apakah nombor yang mesti ditambah kepada $${frT(F)}$ untuk memberikan $0$?`), a: T(`$${frT(Fr.neg(F))}$`), sp: 'xs' };
    },
    (r) => {
      const d = r.pick([2, 3, 4, 5, 6, 8]);
      const k = r.int(2, 9);
      const nu = r.int(1, 3);
      const un = r.pick([T('quarters', 'suku'), T('thirds', 'satu pertiga'), T('halves', 'setengah')]);
      const dd = un.en === 'quarters' ? 4 : un.en === 'thirds' ? 3 : 2;
      return { q: T(`How many ${un.en} are there in $${k}$?`, `Berapakah bilangan ${un.ms} dalam $${k}$?`), a: T(`$${k * dd}$`), sp: 'xs' };
    },
  ];


  /* fraction expression patterns (AST) for medium / advanced work */
  const sgnF = (r, f, p) => (r.chance(p === undefined ? 0.5 : p) ? Fr.neg(f) : f);
  const LF = (r, lo, hi, o) => { const f = rf(r, lo, hi, o); return Lf(sgnF(r, f), o && o.st); };
  const PATF = [
    (r) => Bn('+', LF(r, 2, 12), LF(r, 2, 12)),
    (r) => Bn('-', LF(r, 2, 12), LF(r, 2, 12)),
    (r) => Bn('*', LF(r, 2, 9), LF(r, 2, 9)),
    (r) => Bn('/', LF(r, 2, 9), LF(r, 2, 9)),
    (r) => Bn('-', Bn('+', LF(r, 2, 8), LF(r, 2, 8)), LF(r, 2, 8)),
    (r) => Bn('-', Bn('-', LF(r, 2, 8), LF(r, 2, 8)), LF(r, 2, 8)),
    (r) => Bn('+', LF(r, 2, 8), Bn('*', LF(r, 2, 6), LF(r, 2, 6))),
    (r) => Bn('-', LF(r, 2, 8), Bn('*', LF(r, 2, 6), LF(r, 2, 6))),
    (r) => Bn('+', Bn('*', LF(r, 2, 6), LF(r, 2, 6)), LF(r, 2, 8)),
    (r) => Bn('*', Br(Bn('+', LF(r, 2, 8), LF(r, 2, 8))), LF(r, 2, 6)),
    (r) => Bn('*', Br(Bn('-', LF(r, 2, 8), LF(r, 2, 8))), LF(r, 2, 6)),
    (r) => Bn('/', Br(Bn('+', LF(r, 2, 8), LF(r, 2, 8))), LF(r, 2, 6)),
    (r) => Bn('+', LF(r, 2, 8), Bn('/', LF(r, 2, 6), LF(r, 2, 6))),
    (r) => Bn('-', LF(r, 2, 8), Bn('/', LF(r, 2, 6), LF(r, 2, 6))),
    (r) => Bn('*', Bn('/', LF(r, 2, 6), LF(r, 2, 6)), LF(r, 2, 6)),
    (r) => Bn('/', Bn('*', LF(r, 2, 6), LF(r, 2, 6)), LF(r, 2, 6)),
    (r) => Bn('-', LF(r, 2, 8), Br(Bn('+', LF(r, 2, 8), LF(r, 2, 8)))),
    (r) => Bn('+', Bn('*', LF(r, 2, 6), LF(r, 2, 6)), Bn('*', LF(r, 2, 6), LF(r, 2, 6))),
    (r) => Bn('/', LF(r, 2, 6), Br(Bn('-', LF(r, 2, 6), LF(r, 2, 6)))),
    (r) => Bn('-', Br(Bn('*', LF(r, 2, 6), LF(r, 2, 6))), Br(Bn('/', LF(r, 2, 6), LF(r, 2, 6)))),
    (r) => Bn('*', Br(Bn('+', LF(r, 2, 6), LF(r, 2, 6))), Br(Bn('-', LF(r, 2, 6), LF(r, 2, 6)))),
  ];
  /* patterns with mixed numbers */
  const MX = (r, neg) => { const d = r.int(2, 9), w = r.int(1, 4), nu = r.int(1, d - 1); need(gcd(nu, d) === 1); return Lf(sgnF(r, fr(w * d + nu, d), neg), 'm'); };
  const PATM = [
    (r) => Bn('+', MX(r, 0.4), MX(r, 0.4)),
    (r) => Bn('-', MX(r, 0.3), MX(r, 0.3)),
    (r) => Bn('*', MX(r, 0.3), MX(r, 0.3)),
    (r) => Bn('/', MX(r, 0.3), MX(r, 0.3)),
    (r) => Bn('+', MX(r, 0.3), Lf(sgnF(r, rf(r, 2, 8), 0.4))),
    (r) => Bn('-', MX(r, 0), Lf(fr(r.int(1, 3), 1))),
    (r) => Bn('*', MX(r, 0.3), Lf(fr(r.pick([2, 3, 4, 6, -2, -3]), 1))),
    (r) => Bn('/', MX(r, 0.3), Lf(fr(r.pick([2, 3, 4, -2, -3]), 1))),
  ];
  function fexpr(r, pats, k, lim) {
    const x = pats[k === undefined ? r.int(0, pats.length - 1) : k](r);
    const v = evN(x);
    need(Math.abs(v.n) <= 300 && v.d <= 400 && Math.abs(Fr.val(v)) <= (lim || 12) && v.n !== 0);
    return { x, v };
  }
  const m13 = [
    (r) => { const { x, v } = fexpr(r, PATF); return { q: T(`Evaluate $${shN(x, true)}$. Give the answer in its simplest form.`, `Nilaikan $${shN(x, true)}$. Berikan jawapan dalam bentuk termudah.`), a: T(`$${Fr.mixed(v)}$`), sp: 's' }; },
    (r) => { const { x, v } = fexpr(r, PATF, r.int(0, 3)); return { q: T(`Calculate $${shN(x, true)}$, showing the common denominator or the reciprocal you use.`, `Hitung $${shN(x, true)}$, dengan menunjukkan penyebut sepunya atau salingan yang anda gunakan.`), a: T(`$${Fr.mixed(v)}$`), sp: 'm' }; },
    (r) => { const { x, v } = fexpr(r, PATM); return { q: T(`Calculate $${shN(x, true)}$. Write the answer as a mixed number or a proper fraction.`, `Hitung $${shN(x, true)}$. Tulis jawapan sebagai nombor bercampur atau pecahan wajar.`), a: T(`$${Fr.mixed(v)}$`), sp: 's' }; },
    (r) => {
      const { x, v } = fexpr(r, PATM);
      const conv = (n) => (n.t === 'n' ? `${n.st === 'm' ? Fr.tex(n.f) : shN(n, true)}` : '');
      const first = x.a, second = x.b;
      return { q: T(`Change the mixed numbers to improper fractions first, then evaluate $${shN(x, true)}$.`, `Tukarkan nombor bercampur kepada pecahan tak wajar dahulu, kemudian nilaikan $${shN(x, true)}$.`), a: T(`$${Fr.mixed(v)}$`), sp: 'm' };
    },
    // missing values
    (r) => {
      const A = LF(r, 2, 8).f, B = LF(r, 2, 8).f;
      const op = r.pick(['+', '-', '*', '/']);
      const C = op === '+' ? Fr.add(A, B) : op === '-' ? Fr.sub(A, B) : op === '*' ? Fr.mul(A, B) : Fr.div(A, B);
      need(Math.abs(C.n) < 60 && C.d < 100 && C.n !== 0);
      const form = r.int(0, 1);
      const sym = OPS[op];
      const lhs = form === 0 ? `\\square ${sym} ${frP(B)}` : `${frT(A)} ${sym} \\square`;
      const ans = form === 0 ? A : op === '+' ? B : op === '-' ? B : op === '*' ? B : B;
      return { q: T(`Find the value of $\\square$: $${lhs} = ${frT(C)}$`, `Cari nilai $\\square$: $${lhs} = ${frT(C)}$`), a: T(`$${frT(ans)}$`), sp: 's' };
    },
    (r) => {
      const A = rf(r, 2, 8), B = rf(r, 2, 8);
      const c = r.pick([
        [T(`Find $${frT(A)}$ of $${frT(B)}$.`, `Cari $${frT(A)}$ daripada $${frT(B)}$.`), Fr.mul(A, B)],
        [T(`Find the number that is $${frT(A)}$ less than $${frT(Fr.add(A, B))}$.`, `Cari nombor yang kurang $${frT(A)}$ daripada $${frT(Fr.add(A, B))}$.`), B],
      ]);
      return { q: c[0], a: T(`$${frT(c[1])}$`), sp: 's' };
    },
    // sign prediction
    (r) => {
      const A = sgnF(r, rf(r, 2, 8), 0.5), B = sgnF(r, rf(r, 2, 8), 0.5);
      const op = r.pick(['*', '/']);
      const x = Bn(op, Lf(A), Lf(B));
      const v = evN(x);
      return { q: T(`State whether $${shN(x, true)}$ is positive or negative before you calculate. Then evaluate it.`, `Nyatakan sama ada $${shN(x, true)}$ positif atau negatif sebelum anda mengira. Kemudian nilaikannya.`), a: T(`${v.n > 0 ? 'Positive' : 'Negative'}; $${Fr.mixed(v)}$`, `${v.n > 0 ? 'Positif' : 'Negatif'}; $${Fr.mixed(v)}$`), sp: 's' };
    },
    // MCQ combined
    (r) => {
      const { x, v } = fexpr(r, PATF, r.pick([0, 1, 2, 3, 4]));
      const bad = [Fr.neg(v), Fr.add(v, fr(1, 2)), Fr.mul(v, fr(2, 1)), Fr.sub(v, fr(1, 3))].filter((f) => !Fr.eq(f, v));
      need(bad.length >= 3);
      const m = mcq(r, v, bad.slice(0, 3), (f) => `$${Fr.mixed(f)}$`);
      return { q: T(`Which is the value of $${shN(x, true)}$?<br>${m.q}`, `Yang manakah nilai bagi $${shN(x, true)}$?<br>${m.q}`), a: T(m.ans), sp: 's' };
    },
  ];


  const PATFA = [
    (r) => Bn('*', Br(Bn('-', LF(r, 2, 6), LF(r, 2, 6))), Br(Bn('+', LF(r, 2, 6), LF(r, 2, 6)))),
    (r) => Bn('/', Br(Bn('-', LF(r, 2, 6), LF(r, 2, 6))), Br(Bn('+', LF(r, 2, 6), LF(r, 2, 6)))),
    (r) => Bn('-', LF(r, 2, 6), Bn('/', Br(Bn('+', LF(r, 2, 6), LF(r, 2, 6))), LF(r, 2, 6))),
    (r) => Bn('+', Bn('*', LF(r, 2, 5), LF(r, 2, 5)), Bn('/', LF(r, 2, 5), LF(r, 2, 5))),
    (r) => Bn('-', Bn('/', LF(r, 2, 5), LF(r, 2, 5)), Bn('*', LF(r, 2, 5), LF(r, 2, 5))),
    (r) => Bn('*', Br(Bn('+', Lf(sgnF(r, rf(r, 2, 6), 0.5)), Bn('*', LF(r, 2, 5), LF(r, 2, 5)))), LF(r, 2, 6)),
    (r) => Bn('/', Br(Bn('-', LF(r, 2, 6), LF(r, 2, 6))), Bn('*', LF(r, 2, 5), LF(r, 2, 5))),
    (r) => Bn('-', Br(Bn('+', LF(r, 2, 5), LF(r, 2, 5))), Br(Bn('-', LF(r, 2, 5), LF(r, 2, 5)))),
    (r) => Bn('+', Br(Bn('*', LF(r, 2, 5), LF(r, 2, 5))), Bn('-', LF(r, 2, 5), LF(r, 2, 5))),
    (r) => Bn('/', Bn('+', LF(r, 2, 5), LF(r, 2, 5)), Bn('-', LF(r, 2, 5), LF(r, 2, 5))),
    (r) => Bn('-', Bn('*', MX(r, 0.3), LF(r, 2, 5)), Bn('/', MX(r, 0.2), LF(r, 2, 4))),
    (r) => Bn('*', Br(Bn('-', MX(r, 0.2), MX(r, 0.2))), LF(r, 2, 5)),
    (r) => Bn('+', MX(r, 0.4), Bn('*', LF(r, 2, 5), MX(r, 0.3))),
    (r) => Bn('/', Br(Bn('+', MX(r, 0.3), LF(r, 2, 5))), MX(r, 0.2)),
  ];
  const a13 = [
    (r) => { const { x, v } = fexpr(r, PATFA, undefined, 25); return { q: T(`Evaluate $${shN(x, true)}$. Give your answer as a mixed number or a fraction in its simplest form.`, `Nilaikan $${shN(x, true)}$. Berikan jawapan sebagai nombor bercampur atau pecahan dalam bentuk termudah.`), a: T(`$${Fr.mixed(v)}$`), sp: 'm' }; },
    (r) => { const { x, v } = fexpr(r, PATFA, undefined, 25); return { q: T(`Show all the steps in evaluating $${shN(x, true)}$.`, `Tunjukkan semua langkah dalam menilai $${shN(x, true)}$.`), a: T(`$${Fr.mixed(v)}$`), sp: 'l' }; },
    (r) => {
      const { x, v } = fexpr(r, PATFA, undefined, 25);
      const lo = Math.floor(Fr.val(v)), hi = lo + 1;
      return { q: T(`Evaluate $${shN(x, true)}$ and state the two consecutive integers between which the value lies.`, `Nilaikan $${shN(x, true)}$ dan nyatakan dua integer berturutan yang mengapit nilai itu.`), a: T(`$${Fr.mixed(v)}$; between $${lo}$ and $${hi}$`, `$${Fr.mixed(v)}$; di antara $${lo}$ dengan $${hi}$`), sp: 'm' };
    },
    (r) => {
      const { x, v } = fexpr(r, PATFA, undefined, 25);
      const bad = [Fr.neg(v), Fr.add(v, fr(1, 2)), Fr.mul(v, fr(1, 2)), fr(v.d, v.n)].filter((f) => !Fr.eq(f, v) && f.n !== 0);
      need(bad.length >= 3);
      const m = mcq(r, v, bad.slice(0, 3), (f) => `$${Fr.mixed(f)}$`);
      return { q: T(`Which is the value of $${shN(x, true)}$?<br>${m.q}`, `Yang manakah nilai bagi $${shN(x, true)}$?<br>${m.q}`), a: T(m.ans), sp: 'm' };
    },
    // ordering five values with mixed forms
    (r) => {
      const vals = [];
      while (vals.length < 5) {
        const f = sgnF(r, rf(r, 2, 10, { improper: r.chance(0.4) }), 0.5);
        if (!vals.some((x) => Fr.eq(x, f))) vals.push(f);
      }
      const asc = r.chance();
      const sorted = vals.slice().sort((x, y) => (asc ? Fr.cmp(x, y) : Fr.cmp(y, x)));
      return { q: T(`Arrange $${vals.map((f) => Fr.mixed(f)).join(',\\ ')}$ in ${asW(asc).en}. Show the common denominator you used.`, `Susun $${vals.map((f) => Fr.mixed(f)).join(',\\ ')}$ dalam ${asW(asc).ms}. Tunjukkan penyebut sepunya yang anda gunakan.`), a: T(`$${sorted.map((f) => Fr.mixed(f)).join(',\\ ')}$`), sp: 'm' };
    },
    // mean of fractions and work backwards
    (r) => {
      const fs = [rf(r, 2, 8), rf(r, 2, 8), rf(r, 2, 8)];
      need(new Set(fs.map(frT)).size === 3);
      const mean = Fr.div(Fr.add(Fr.add(fs[0], fs[1]), fs[2]), fr(3, 1));
      return { q: T(`Find the mean of $${fs.map(frT).join(',\\ ')}$.`, `Cari min bagi $${fs.map(frT).join(',\\ ')}$.`), a: T(`$${Fr.mixed(mean)}$`), sp: 'm' };
    },
    (r) => {
      const A = rf(r, 2, 6), B = rf(r, 2, 6), C = rf(r, 2, 6);
      const x = Fr.mul(Fr.sub(B, C), fr(1, 1));
      const val = Fr.mul(A, Fr.sub(B, C));
      need(val.n !== 0 && Math.abs(val.n) < 40);
      return { q: T(`Find the missing fraction: $\\left(\\square - ${frT(C)}\\right) \\times ${frT(A)} = ${frT(val)}$`, `Cari pecahan yang hilang: $\\left(\\square - ${frT(C)}\\right) \\times ${frT(A)} = ${frT(val)}$`), a: T(`$${frT(B)}$`), w: T(`$${frT(val)} \\div ${frT(A)} = ${frT(Fr.sub(B, C))}$`), sp: 'm' };
    },
    (r) => {
      const A = rf(r, 2, 6), B = rf(r, 2, 6), C = rf(r, 2, 6);
      const val = Fr.add(Fr.div(A, B), C);
      need(val.d < 60 && val.n < 60);
      return { q: T(`Find the missing fraction: $\\square \\div ${frT(B)} + ${frT(C)} = ${frT(val)}$`, `Cari pecahan yang hilang: $\\square \\div ${frT(B)} + ${frT(C)} = ${frT(val)}$`), a: T(`$${frT(A)}$`), sp: 'm' };
    },
  ];


  /* true / false statements about fractions (with a computed truth value) */
  const STF = [
    (r) => { const a = r.int(2, 6), b = r.int(2, 7); need(a !== b); return { t: T(`$\\dfrac{1}{${a}} + \\dfrac{1}{${b}} = \\dfrac{2}{${a + b}}$`), ok: false }; },
    (r) => { const a = r.int(2, 8); return { t: T(`$\\dfrac{${a + 1}}{${a}}$ is an improper fraction`, `$\\dfrac{${a + 1}}{${a}}$ ialah pecahan tak wajar`), ok: true }; },
    (r) => { const a = r.int(2, 8); return { t: T(`$\\dfrac{${a}}{${a + 1}}$ is greater than $1$`, `$\\dfrac{${a}}{${a + 1}}$ lebih besar daripada $1$`), ok: false }; },
    (r) => { const a = r.int(2, 8); return { t: T(`$-\\dfrac{${a}}{${a + 2}}$ lies between $-1$ and $0$ on the number line`, `$-\\dfrac{${a}}{${a + 2}}$ terletak di antara $-1$ dengan $0$ pada garis nombor`), ok: true }; },
    (r) => { const a = r.int(2, 5), b = r.int(2, 5); return { t: T(`$\\dfrac{${a}}{${b}} \\times \\dfrac{${b}}{${a}} = 1$`), ok: true }; },
    (r) => { const a = r.int(2, 5), b = r.int(6, 9); return { t: T(`$\\dfrac{1}{${a}} > \\dfrac{1}{${b}}$`), ok: true }; },
    (r) => { const a = r.int(2, 5), b = r.int(6, 9); return { t: T(`$-\\dfrac{1}{${a}} > -\\dfrac{1}{${b}}$`), ok: false }; },
    (r) => { const a = r.int(2, 6); return { t: T(`$\\dfrac{${a}}{${a}} = 1$`), ok: true }; },
    (r) => { const a = r.int(2, 9); return { t: T(`$${a} \\div \\dfrac{1}{2} = \\dfrac{${a}}{2}$`), ok: false }; },
    (r) => { const a = r.int(2, 9); return { t: T(`$${a} \\div \\dfrac{1}{2} = ${2 * a}$`), ok: true }; },
    (r) => { const a = r.int(1, 4), b = r.int(5, 9); return { t: T(`$\\dfrac{${a}}{${b}} \\div \\dfrac{${a}}{${b}} = 0$`, `$\\dfrac{${a}}{${b}} \\div \\dfrac{${a}}{${b}} = 0$`), ok: false }; },
    (r) => { const a = r.int(2, 5), b = r.int(2, 5); return { t: T(`The reciprocal of $\\dfrac{${a}}{${a + b}}$ is $\\dfrac{${a + b}}{${a}}$`, `Salingan bagi $\\dfrac{${a}}{${a + b}}$ ialah $\\dfrac{${a + b}}{${a}}$`), ok: true }; },
    (r) => { const a = r.int(2, 6); return { t: T(`$0$ has no reciprocal`, `$0$ tidak mempunyai salingan`), ok: true }; },
    (r) => { const a = r.int(2, 9); return { t: T(`Every integer can be written as a fraction with denominator $1$`, `Setiap integer boleh ditulis sebagai pecahan dengan penyebut $1$`), ok: true }; },
    (r) => { const a = r.int(2, 5), b = r.int(2, 5); return { t: T(`A negative fraction divided by a negative fraction is negative`, `Pecahan negatif dibahagi dengan pecahan negatif memberikan hasil negatif`), ok: false }; },
    (r) => { const a = r.int(2, 5), b = r.int(2, 5); return { t: T(`A negative fraction multiplied by a positive fraction is negative`, `Pecahan negatif didarab dengan pecahan positif memberikan hasil negatif`), ok: true }; },
    (r) => { const a = r.int(2, 5); return { t: T(`$\\dfrac{${a}}{${2 * a}}$ is in its simplest form`, `$\\dfrac{${a}}{${2 * a}}$ berada dalam bentuk termudah`), ok: false }; },
    (r) => { const a = r.int(2, 5); return { t: T(`$\\dfrac{${a}}{${a + 1}}$ is in its simplest form`, `$\\dfrac{${a}}{${a + 1}}$ berada dalam bentuk termudah`), ok: true }; },
  ];
  const stf = (r, k) => r.sample(STF, k).map((f) => f(r));

  const e13b = [
    (r) => {
      const F = rf(r, 2, 10);
      const c = r.pick([
        [T(`Find half of $${frT(F)}$.`, `Cari setengah daripada $${frT(F)}$.`), Fr.mul(F, fr(1, 2))],
        [T(`Find double $${frT(F)}$.`, `Cari dua kali ganda $${frT(F)}$.`), Fr.mul(F, fr(2, 1))],
        [T(`Find one third of $${frT(F)}$.`, `Cari satu pertiga daripada $${frT(F)}$.`), Fr.mul(F, fr(1, 3))],
        [T(`Find one quarter of $${frT(F)}$.`, `Cari satu perempat daripada $${frT(F)}$.`), Fr.mul(F, fr(1, 4))],
        [T(`Find three times $${frT(F)}$.`, `Cari tiga kali $${frT(F)}$.`), Fr.mul(F, fr(3, 1))],
      ]);
      return { q: c[0], a: T(`$${Fr.mixed(c[1])}$`), sp: 'xs' };
    },
    // multi true / false
    (r) => {
      const ss = stf(r, 3);
      return { q: T(`Write True or False for each statement.<br>${ss.map((s, i) => `(${'abc'[i]}) ${s.t.en}`).join('<br>')}`, `Tulis Benar atau Palsu bagi setiap pernyataan.<br>${ss.map((s, i) => `(${'abc'[i]}) ${s.t.ms}`).join('<br>')}`), a: T(ss.map((s, i) => `(${'abc'[i]}) ${s.ok ? 'True' : 'False'}`).join(' '), ss.map((s, i) => `(${'abc'[i]}) ${s.ok ? 'Benar' : 'Palsu'}`).join(' ')), sp: 's' };
    },
    (r) => { const s = stf(r, 1)[0]; return { q: T(`True or false? ${s.t.en}.`, `Benar atau palsu? ${s.t.ms}.`), a: tfAns(s), sp: 'xs' }; },
    // move on the number line
    (r) => {
      const d = r.pick([3, 4, 5, 6]);
      const s = r.int(-d + 1, d - 1), m = r.int(1, 3);
      need(s % d !== 0);
      const right = r.chance();
      const e = right ? s + m : s - m;
      need(e % d !== 0);
      return { q: T(`On a number line, start at $${frT(fr(s, d))}$ and move ${m} unit${m > 1 ? 's' : ''} of $\\dfrac{1}{${d}}$ to the ${right ? 'right' : 'left'}. Which fraction do you reach?`, `Pada garis nombor, mulakan pada $${frT(fr(s, d))}$ dan bergerak ${m} unit $\\dfrac{1}{${d}}$ ke ${right ? 'kanan' : 'kiri'}. Pecahan yang manakah anda capai?`), a: T(`$${frT(fr(e, d))}$`), sp: 'xs' };
    },
  ];

  const m13b = [
    (r) => {
      const A = fr(r.int(1, 3), r.pick([3, 4, 5])), B = fr(r.int(1, 3), r.pick([2, 5, 6]));
      const w1 = r.int(1, 3);
      const P = Fr.add(fr(w1, 1), A), Q = B;
      const big = Fr.cmp(P, Q) > 0 ? P : Q, small = big === P ? Q : P;
      const c = r.pick([
        [T(`How much greater is $${Fr.mixed(P)}$ than $${frT(Q)}$?`, `Berapakah lebihnya $${Fr.mixed(P)}$ berbanding $${frT(Q)}$?`), Fr.sub(P, Q)],
        [T(`By how much is $${frT(Q)}$ less than $${Fr.mixed(P)}$?`, `Berapakah kurangnya $${frT(Q)}$ berbanding $${Fr.mixed(P)}$?`), Fr.sub(P, Q)],
        [T(`What is the difference between $${Fr.mixed(P)}$ and $${frT(Q)}$?`, `Apakah beza antara $${Fr.mixed(P)}$ dengan $${frT(Q)}$?`), Fr.sub(P, Q)],
        [T(`What number must be added to $${frT(Q)}$ to get $${Fr.mixed(P)}$?`, `Apakah nombor yang mesti ditambah kepada $${frT(Q)}$ untuk mendapat $${Fr.mixed(P)}$?`), Fr.sub(P, Q)],
      ]);
      need(Fr.cmp(P, Q) > 0);
      return { q: c[0], a: T(`$${Fr.mixed(c[1])}$`), sp: 's' };
    },
    (r) => {
      const d = r.pick([2, 3, 4, 5, 6]), nu = r.int(1, 3);
      const tot = fr(nu * r.int(1, 3), d);
      const k = r.int(2, 6);
      const share = Fr.div(tot, fr(k, 1));
      const it = r.pick([[T('kg of flour', 'kg tepung'), 'kg'], [T('litres of juice', 'liter jus'), 'litres'], [T('m of cloth', 'm kain'), 'm']]);
      const p = r.name();
      return { q: T(`${p} shares $${Fr.mixed(tot)}$ ${it[0].en} equally among ${k} people. How much does each person get?`, `${p} berkongsi $${Fr.mixed(tot)}$ ${it[0].ms} sama rata antara ${k} orang. Berapakah yang diperoleh setiap orang?`), a: T(`$${Fr.mixed(share)}$ ${it[1]}`), sp: 's' };
    },
    // conversion of time
    (r) => {
      const c = r.pick([
        [fr(3, 4), 60, T('minutes', 'minit'), T('hour', 'jam')], [fr(2, 3), 60, T('minutes', 'minit'), T('hour', 'jam')], [fr(5, 6), 60, T('minutes', 'minit'), T('hour', 'jam')], [fr(7, 12), 60, T('minutes', 'minit'), T('hour', 'jam')],
        [fr(3, 5), 100, T('centimetres', 'sentimeter'), T('metre', 'meter')], [fr(7, 8), 1000, T('grams', 'gram'), T('kilogram', 'kilogram')], [fr(5, 8), 1000, T('millilitres', 'mililiter'), T('litre', 'liter')],
      ]);
      const w = r.int(1, 2);
      const F = Fr.add(fr(w, 1), c[0]);
      return { q: T(`Express $${Fr.mixed(F)}$ ${c[3].en}${w > 1 ? 's' : ''} in ${c[2].en}.`, `Ungkapkan $${Fr.mixed(F)}$ ${c[3].ms} dalam ${c[2].ms}.`), a: T(`$${Fr.val(F) * c[1]}$ ${c[2].en}`, `$${Fr.val(F) * c[1]}$ ${c[2].ms}`), sp: 'xs' };
    },
    (r) => {
      const fs = r.sample([fr(3, 4), fr(2, 3), fr(5, 6), fr(7, 12), fr(5, 8), fr(3, 5), fr(4, 7), fr(7, 9)], 4);
      const sorted = fs.slice().sort(Fr.cmp);
      const big = r.chance();
      const m = mcq(r, big ? sorted[3] : sorted[0], big ? sorted.slice(0, 3) : sorted.slice(1), (f) => `$${frT(f)}$`);
      return { q: T(`Which of these is the ${big ? 'largest' : 'smallest'} fraction?<br>${m.q}`, `Antara pecahan ini, yang manakah ${big ? 'terbesar' : 'terkecil'}?<br>${m.q}`), a: T(m.ans), sp: 's' };
    },
    (r) => {
      const ss = stf(r, 3);
      return { q: T(`State whether each statement is true or false, and correct any false statement by changing one number or sign.<br>${ss.map((s, i) => `(${'abc'[i]}) ${s.t.en}`).join('<br>')}`, `Nyatakan sama ada setiap pernyataan benar atau palsu, dan betulkan mana-mana pernyataan yang palsu dengan menukar satu nombor atau tanda.<br>${ss.map((s, i) => `(${'abc'[i]}) ${s.t.ms}`).join('<br>')}`), a: T(ss.map((s, i) => `(${'abc'[i]}) ${s.ok ? 'True' : 'False'}`).join(' ') + ' (any correct correction is accepted)', ss.map((s, i) => `(${'abc'[i]}) ${s.ok ? 'Benar' : 'Palsu'}`).join(' ') + ' (mana-mana pembetulan yang betul diterima)'), sp: 'm' };
    },
  ];


  const a13b = [
    (r) => {
      const f = [fr(1, 4), fr(1, 3), fr(1, 6)];
      const hrs = r.pick([12, 24]);
      const sp = r.sample([[T('sleeping', 'tidur'), fr(1, 3)], [T('at school', 'di sekolah'), fr(1, 4)], [T('studying', 'belajar'), fr(1, 8)], [T('playing sports', 'bersukan'), fr(1, 12)]], 3);
      const used = sp.reduce((s, x) => Fr.add(s, x[1]), fr(0, 1));
      const left = Fr.mul(Fr.sub(fr(1, 1), used), fr(24, 1));
      need(Fr.cmp(used, fr(1, 1)) < 0 && left.d === 1);
      const p = r.name();
      return { q: T(`In one day (24 hours), ${p} spends ${sp.map((x) => `$${frT(x[1])}$ of the day ${x[0].en}`).join(', ')}. (a) What fraction of the day is used? (b) How many hours are left for other activities?`, `Dalam satu hari (24 jam), ${p} menghabiskan ${sp.map((x) => `$${frT(x[1])}$ daripada hari itu ${x[0].ms}`).join(', ')}. (a) Apakah pecahan hari yang digunakan? (b) Berapa jamkah yang tinggal untuk aktiviti lain?`), a: T(`(a) $${frT(used)}$ (b) ${left.n} hours`, `(a) $${frT(used)}$ (b) ${left.n} jam`), sp: 'm' };
    },
    // fraction pyramids
    (r) => {
      const b = [rf(r, 2, 6), rf(r, 2, 6), rf(r, 2, 6)].map((f, i) => sgnF(r, f, 0.3));
      const m1 = Fr.add(b[0], b[1]), m2 = Fr.add(b[1], b[2]);
      const top = Fr.add(m1, m2);
      const hide = r.pick([0, 1, 2]);
      const shown = b.map((x, i) => (i === hide ? '\\square' : frT(x)));
      need(top.d < 60 && new Set(b.map(frT)).size === 3);
      return { q: T(`In a fraction pyramid, each block is the sum of the two blocks directly below it. Bottom row: $${shown.join(',\\ ')}$. Middle row: $${frT(m1)},\\ ${frT(m2)}$. Top: $${frT(top)}$. Find the missing fraction.`, `Dalam sebuah piramid pecahan, setiap blok ialah hasil tambah dua blok tepat di bawahnya. Baris bawah: $${shown.join(',\\ ')}$. Baris tengah: $${frT(m1)},\\ ${frT(m2)}$. Atas: $${frT(top)}$. Cari pecahan yang hilang.`), a: T(`$${frT(b[hide])}$`), sp: 'm' };
    },
    // 3-step expression with words
    (r) => {
      const { x, v } = fexpr(r, PATFA, undefined, 25);
      const asc = r.chance();
      const { x: x2, v: v2 } = fexpr(r, PATF);
      need(!Fr.eq(v, v2));
      return { q: T(`Evaluate both expressions and state which has the greater value.<br>(A) $${shN(x, true)}$<br>(B) $${shN(x2, true)}$`, `Nilaikan kedua-dua ungkapan dan nyatakan yang manakah mempunyai nilai yang lebih besar.<br>(A) $${shN(x, true)}$<br>(B) $${shN(x2, true)}$`), a: T(`(A) $${Fr.mixed(v)}$, (B) $${Fr.mixed(v2)}$; ${Fr.cmp(v, v2) > 0 ? '(A)' : '(B)'} is greater`, `(A) $${Fr.mixed(v)}$, (B) $${Fr.mixed(v2)}$; ${Fr.cmp(v, v2) > 0 ? '(A)' : '(B)'} lebih besar`), sp: 'l' };
    },
    (r) => {
      const ss = stf(r, 3);
      return { q: T(`Decide whether each statement is true or false and give a short reason for each.<br>${ss.map((s, i) => `(${'abc'[i]}) ${s.t.en}`).join('<br>')}`, `Tentukan sama ada setiap pernyataan benar atau palsu dan berikan sebab ringkas bagi setiap satu.<br>${ss.map((s, i) => `(${'abc'[i]}) ${s.t.ms}`).join('<br>')}`), a: T(ss.map((s, i) => `(${'abc'[i]}) ${s.ok ? 'True' : 'False'}`).join(' ') + ' (with valid reasons)', ss.map((s, i) => `(${'abc'[i]}) ${s.ok ? 'Benar' : 'Palsu'}`).join(' ') + ' (dengan sebab yang sah)'), sp: 'l' };
    },
    (r) => {
      const { x, v } = fexpr(r, PATM);
      const { x: y, v: w } = fexpr(r, PATM);
      need(!Fr.eq(v, w));
      return { q: T(`(a) Evaluate $${shN(x, true)}$. (b) Evaluate $${shN(y, true)}$. (c) Which of the two answers is larger?`, `(a) Nilaikan $${shN(x, true)}$. (b) Nilaikan $${shN(y, true)}$. (c) Yang manakah lebih besar antara kedua-dua jawapan itu?`), a: T(`(a) $${Fr.mixed(v)}$ (b) $${Fr.mixed(w)}$ (c) ${Fr.cmp(v, w) > 0 ? '(a)' : '(b)'}`), sp: 'l' };
    },
  ];

  SPM.extend('F1-1.3', { e: e13.concat(e13b), m: m13.concat(m13b), a: a13.concat(a13b) });

  /* ===================================================================== */
  /* ---- F1-1.4 Positive and negative decimals                              */
  /* ===================================================================== */
  /* exact decimals: values are fractions whose denominator divides a power of 10 */
  function dS(f) {
    let t = f.d;
    while (t % 2 === 0) t /= 2;
    while (t % 5 === 0) t /= 5;
    need(t === 1);
    let k = 0, p = 1;
    while (p % f.d !== 0) { p *= 10; k++; need(k <= 8); }
    let str = String(Math.abs(f.n) * (p / f.d));
    while (str.length <= k) str = '0' + str;
    const out = k ? str.slice(0, str.length - k) + '.' + str.slice(str.length - k) : str;
    return (f.n < 0 ? '-' : '') + out;
  }
  const dv = (k, dp) => fr(k, Math.pow(10, dp));                 // k / 10^dp
  const pr = (r, it) => fr(r.int(Math.round(it.lo * 20), Math.round(it.hi * 20)) * 5, 100);   // a realistic unit price (multiples of 5 sen)
  const dr = (r, dp, lo, hi, o) => {                               // random decimal with dp places
    const m = Math.pow(10, dp);
    let k = r.int(Math.round(lo * m), Math.round(hi * m));
    need(k !== 0 && (dp === 0 || k % 10 !== 0 || (o && o.trail)));   // avoid trailing zeros unless allowed
    return fr(k, m);
  };
  const dLf = (f) => Lf(f, 'd');
  function shD(x, first) {
    if (x.t === 'n') {
      const s = dS(x.f);
      return x.f.n < 0 && !first ? `(${s})` : s;
    }
    if (x.t === 'p') return `(${shD(x.a, true)})`;
    return `${shD(x.a, first)} ${OPS[x.op]} ${shD(x.b, false)}`;
  }
  const dm = (f) => { const t = dS(f); const k = t.indexOf('.') < 0 ? 0 : t.length - t.indexOf('.') - 1; return k >= 2 ? t : t.indexOf('.') < 0 ? t + '.00' : t + '0'.repeat(2 - k); };            // bracket a negative decimal
  const PLC = [T('tenths', 'persepuluh'), T('hundredths', 'perseratus'), T('thousandths', 'perseribu')];

  const e14 = [
    // place value
    (r) => {
      const a = r.int(1, 9), b = r.int(1, 9), c = r.int(1, 9), d = r.int(0, 9);
      const w = r.int(1, 9);
      const num = `${w}.${a}${b}${c}`;
      const pos = r.int(0, 2);
      const digit = [a, b, c][pos];
      const wordPl = [T('tenths', 'persepuluh'), T('hundredths', 'perseratus'), T('thousandths', 'perseribu')][pos];
      const val = [a / 10, b / 100, c / 1000][pos];
      const c2 = r.pick([
        [T(`In the number $${num}$, what is the value of the digit $${digit}$ in the ${wordPl.en} place?`, `Dalam nombor $${num}$, apakah nilai digit $${digit}$ pada tempat ${wordPl.ms}?`), `${n(round(val, 3))}`],
        [T(`Write down the digit in the ${wordPl.en} place of $${num}$.`, `Tulis digit pada tempat ${wordPl.ms} bagi $${num}$.`), `${digit}`],
      ]);
      return { q: c2[0], a: T(`$${c2[1]}$`), sp: 'xs' };
    },
    (r) => {
      const dp = r.int(1, 3), num = r.int(11, 10 ** dp * 9 + 9);
      need(num % 10 !== 0);
      const nm = PLC[dp - 1];
      return { q: T(`Write ${num} ${nm.en} as a decimal.`, `Tulis ${num} ${nm.ms} sebagai perpuluhan.`), a: T(`$${dS(dv(num, dp))}$`), sp: 'xs' };
    },
    (r) => {
      const v = [dr(r, 1, -9, 9), dr(r, 1, -9, 9), dr(r, 2, -9, 9)];
      need(new Set(v.map(dS)).size === 3);
      const asc = r.chance();
      const sorted = v.slice().sort((x, y) => (asc ? Fr.cmp(x, y) : Fr.cmp(y, x)));
      return { q: T(`Arrange $${v.map(dS).join(',\\ ')}$ in ${asW(asc).en}.`, `Susun $${v.map(dS).join(',\\ ')}$ dalam ${asW(asc).ms}.`), a: T(`$${sorted.map(dS).join(',\\ ')}$`), sp: 's' };
    },
    (r) => {
      const a = dr(r, r.pick([1, 2]), 1, 9), p = r.pick([10, 100, 1000]);
      const op = r.pick(['*', '/']);
      const x = Bn(op, dLf(a), Lf(fr(p, 1), 'd'));
      return { q: T(`Calculate $${shD(x, true)}$ by moving the decimal point.`, `Hitung $${shD(x, true)}$ dengan menggerakkan titik perpuluhan.`), a: T(`$${dS(evN(x))}$`), sp: 'xs' };
    },
    // money
    (r) => {
      const it = r.pick(SPM.bank.foods);
      const price = pr(r, it);
      const k = r.int(2, 6);
      const total = Fr.mul(price, fr(k, 1));
      return { q: T(`One ${it.en1} costs RM${dm(price)}. How much do ${k} ${it.en} cost?`, `Satu ${it.ms} berharga RM${dm(price)}. Berapakah harga ${k} ${it.ms}?`), a: T(`RM${dm(total)}`), sp: 'xs' };
    },
    (r) => {
      const cm = r.int(11, 399);
      const c = r.pick([
        [T(`Express ${cm} cm in metres.`, `Ungkapkan ${cm} cm dalam meter.`), `${dS(dv(cm, 2))} m`],
        [T(`Express ${cm} g in kilograms.`, `Ungkapkan ${cm} g dalam kilogram.`), `${dS(dv(cm, 3))} kg`],
        [T(`Express ${cm} mm in centimetres.`, `Ungkapkan ${cm} mm dalam sentimeter.`), `${dS(dv(cm, 1))} cm`],
        [T(`Express ${cm} ml in litres.`, `Ungkapkan ${cm} ml dalam liter.`), `${dS(dv(cm, 3))} litres`],
      ]);
      return { q: c[0], a: T(`$${c[1].split(' ')[0]}$ ${c[1].split(' ')[1]}`), sp: 'xs' };
    },
  ];


  /* decimal expression patterns (AST); divisors are chosen so that every quotient terminates */
  const DIVS = [2, 4, 5, 8, 0.2, 0.4, 0.5, 0.25, 0.8, 1.5, 2.5, 0.1, 0.05].map((x) => fr(Math.round(x * 100), 100));
  const dd1 = (r, lo, hi) => dLf(sgnF(r, dr(r, 1, lo === undefined ? 0.1 : lo, hi === undefined ? 9 : hi), 0.4));
  const dd2 = (r, lo, hi) => dLf(sgnF(r, dr(r, 2, lo === undefined ? 0.1 : lo, hi === undefined ? 9 : hi), 0.4));
  const dq = (r) => Lf(sgnF(r, r.pick(DIVS), 0.3), 'd');
  const dmix = (r) => (r.chance() ? dd1(r) : dd2(r));
  const PATD = [
    (r) => Bn('+', dmix(r), dmix(r)),
    (r) => Bn('-', dmix(r), dmix(r)),
    (r) => Bn('*', dd1(r, 0.1, 9), dd1(r, 0.1, 9)),
    (r) => Bn('*', dd2(r, 0.1, 5), dd1(r, 0.1, 9)),
    (r) => Bn('/', dd2(r, 0.1, 30), dq(r)),
    (r) => Bn('-', Bn('+', dd1(r), dd1(r)), dd2(r)),
    (r) => Bn('+', dd1(r), Bn('*', dd1(r, 0.1, 5), dd1(r, 0.1, 5))),
    (r) => Bn('-', dd1(r), Bn('*', dd1(r, 0.1, 5), dd1(r, 0.1, 5))),
    (r) => Bn('*', Br(Bn('+', dd1(r), dd1(r))), dd1(r, 0.1, 5)),
    (r) => Bn('*', Br(Bn('-', dd1(r), dd1(r))), dd1(r, 0.1, 5)),
    (r) => Bn('/', Br(Bn('+', dd1(r), dd1(r))), dq(r)),
    (r) => Bn('+', dd1(r, 1, 20), Bn('/', dd2(r, 1, 10), dq(r))),
    (r) => Bn('-', dd1(r, 1, 20), Bn('/', dd2(r, 1, 10), dq(r))),
    (r) => Bn('-', dd1(r), Br(Bn('+', dd1(r), dd1(r)))),
    (r) => Bn('-', dd1(r), Br(Bn('-', dd1(r), dd1(r)))),
    (r) => Bn('+', Bn('*', dd1(r, 0.1, 5), dd1(r, 0.1, 5)), Bn('*', dd1(r, 0.1, 5), dd1(r, 0.1, 5))),
    (r) => Bn('*', dd1(r, 0.1, 5), Bn('*', dd1(r, 0.1, 5), dd1(r, 0.1, 5))),
    (r) => Bn('/', Bn('*', dd1(r), dd1(r, 0.1, 5)), dq(r)),
    (r) => Bn('*', Br(Bn('+', dd1(r), dd1(r))), Br(Bn('-', dd1(r), dd1(r)))),
    (r) => Bn('-', Br(Bn('*', dd1(r, 0.1, 5), dd1(r, 0.1, 5))), Br(Bn('/', dd2(r, 1, 10), dq(r)))),
    (r) => Bn('/', Br(Bn('-', dd2(r), dd1(r))), Br(Bn('+', Lf(fr(1, 2), 'd'), Lf(fr(3, 4), 'd')))),
  ];
  function dexpr(r, pats, k, lim) {
    const x = pats[k === undefined ? r.int(0, pats.length - 1) : k](r);
    const v = evN(x);
    dS(v);                                                        // rejects non-terminating results
    need(v.d <= 10000 && Math.abs(Fr.val(v)) <= (lim || 150) && v.n !== 0);
    need(shD(x, true).length < 46);
    return { x, v };
  }
  const roundD = (f, dp) => {                                      // exact rounding of a fraction, half away from zero
    const m = Math.pow(10, dp);
    const num = Math.abs(f.n) * m, k = Math.floor(num / f.d), rem = num - k * f.d;
    need(2 * rem !== f.d);                                          // no ties
    const rd = k + (2 * rem > f.d ? 1 : 0);
    return fr(f.n < 0 ? -rd : rd, m);
  };
  const dp2s = (f, dp) => { const s = dS(f); return s.indexOf('.') < 0 ? (dp ? s + '.' + '0'.repeat(dp) : s) : s + '0'.repeat(dp - (s.length - s.indexOf('.') - 1)); };

  const m14 = [
    (r) => { const { x, v } = dexpr(r, PATD); return { q: T(`Evaluate $${shD(x, true)}$.`, `Nilaikan $${shD(x, true)}$.`), a: T(`$${dS(v)}$`), sp: 's' }; },
    (r) => { const { x, v } = dexpr(r, PATD, r.int(0, 4)); return { q: T(`Calculate $${shD(x, true)}$, showing how you line up the decimal points or move the decimal point.`, `Hitung $${shD(x, true)}$, dengan menunjukkan bagaimana anda menyejajarkan atau menggerakkan titik perpuluhan.`), a: T(`$${dS(v)}$`), sp: 'm' }; },
    (r) => {
      const { x, v } = dexpr(r, PATD);
      const bad = [Fr.neg(v), Fr.mul(v, fr(10, 1)), Fr.div(v, fr(10, 1)), Fr.add(v, fr(1, 10))].filter((f) => !Fr.eq(f, v) && (() => { try { dS(f); return true; } catch (e) { return false; } })());
      need(bad.length >= 3);
      const m = mcq(r, v, bad.slice(0, 3), (f) => `$${dS(f)}$`);
      return { q: T(`Which is the value of $${shD(x, true)}$?<br>${m.q}`, `Yang manakah nilai bagi $${shD(x, true)}$?<br>${m.q}`), a: T(m.ans), sp: 's' };
    },
    (r) => {
      const it = r.sample(SPM.bank.fruits, 4);
      const pr = [];
      while (pr.length < 4) { const f = dv(r.int(300, 1500), 2); if (f.n % 5 === 0 && !pr.some((x) => Fr.eq(x, f))) pr.push(f); }
      const order = [0, 1, 2, 3].sort((x, y) => Fr.cmp(pr[y], pr[x]));
      return { q: T(`The prices per kg of four fruits are: ${it.map((f, i) => `${f.en} RM${dm(pr[i])}`).join(', ')}. Arrange the fruits from the most expensive to the cheapest.`, `Harga sekilogram bagi empat jenis buah ialah: ${it.map((f, i) => `${f.ms} RM${dm(pr[i])}`).join(', ')}. Susun buah-buahan itu daripada yang paling mahal kepada yang paling murah.`), a: T(order.map((i) => it[i].en).join(', '), order.map((i) => it[i].ms).join(', ')), sp: 's' };
    },
    // money multi-step
    (r) => {
      const it = r.sample(SPM.bank.foods, 2);
      const p1 = pr(r, it[0]), p2 = pr(r, it[1]);
      const q1 = r.int(2, 5), q2 = r.int(2, 4);
      const tot = Fr.add(Fr.mul(p1, fr(q1, 1)), Fr.mul(p2, fr(q2, 1)));
      const pay = Math.ceil(Fr.val(tot) / 10) * 10 + r.pick([0, 10]);
      const [p] = r.pair();
      return { q: T(`${p} buys ${q1} ${it[0].en} at RM${dm(p1)} each and ${q2} ${it[1].en} at RM${dm(p2)} each. (a) Find the total cost. (b) ${p} pays with RM${pay}. How much change does ${p} get?`, `${p} membeli ${q1} ${it[0].ms} dengan harga RM${dm(p1)} setiap satu dan ${q2} ${it[1].ms} dengan harga RM${dm(p2)} setiap satu. (a) Cari jumlah harga. (b) ${p} membayar dengan RM${pay}. Berapakah baki wang yang diterima oleh ${p}?`), a: T(`(a) RM${dm(tot)} (b) RM${dm(Fr.sub(fr(pay, 1), tot))}`), sp: 'm' };
    },
    (r) => {
      const it = r.pick(SPM.bank.items.filter((x) => x.lo >= 10));
      const price = pr(r, it), off = dv(r.int(40, 180) * 5, 2);
      need(Fr.cmp(off, price) < 0);
      return { q: T(`A ${it.en1} is priced at RM${dm(price)}. During a sale, RM${dm(off)} is taken off the price. Find the sale price, and the total for 3 of them.`, `Harga sebuah ${it.ms} ialah RM${dm(price)}. Semasa jualan, harganya dikurangkan sebanyak RM${dm(off)}. Cari harga jualan, dan jumlah harga bagi 3 buah.`), a: T(`RM${dm(Fr.sub(price, off))}; RM${dm(Fr.mul(Fr.sub(price, off), fr(3, 1)))}`), sp: 's' };
    },
    (r) => {
      const a = dv(r.int(150, 950), 2), b = dv(r.int(50, 140), 2);
      const it = r.pick([['petrol', 'petrol', 'litres', 'liter'], ['rice', 'beras', 'kg', 'kg'], ['cloth', 'kain', 'm', 'm']]);
      return { q: T(`A container has $${dS(a)}$ ${it[2]} of ${it[0]}. $${dS(b)}$ ${it[2]} is used in the morning and $${dS(b)}$ ${it[2]} more in the afternoon. How much ${it[0]} is left?`, `Sebuah bekas mengandungi $${dS(a)}$ ${it[3]} ${it[1]}. $${dS(b)}$ ${it[3]} digunakan pada waktu pagi dan $${dS(b)}$ ${it[3]} lagi pada waktu petang. Berapakah ${it[1]} yang tinggal?`), a: T(`$${dS(Fr.sub(a, Fr.mul(b, fr(2, 1))))}$ ${it[2]}`, `$${dS(Fr.sub(a, Fr.mul(b, fr(2, 1))))}$ ${it[3]}`), sp: 's' };
    },
    // missing values
    (r) => {
      const a = dr(r, 1, 1, 9), x = dr(r, 1, 1, 9), k = r.int(2, 5);
      const forms = [
        [`${k} \\times \\square + ${dS(a)} = ${dS(Fr.add(Fr.mul(x, fr(k, 1)), a))}`, x],
        [`${dS(Fr.add(Fr.mul(x, fr(k, 1)), a))} - ${k} \\times \\square = ${dS(a)}`, x],
        [`(\\square + ${dS(a)}) \\times ${k} = ${dS(Fr.mul(Fr.add(x, a), fr(k, 1)))}`, x],
        [`\\square \\div ${k} - ${dS(a)} = ${dS(Fr.sub(x, a))}`, Fr.mul(x, fr(k, 1))],
      ];
      const f = r.pick(forms);
      return { q: T(`Find the value of $\\square$: $${f[0]}$`, `Cari nilai $\\square$: $${f[0]}$`), a: T(`$${dS(f[1])}$`), sp: 's' };
    },
    // rounding of a final answer
    (r) => {
      const a = dr(r, 2, 1, 20), k = r.int(3, 9);
      need(k !== 8 && k !== 4 && k !== 5 && k !== 2);
      const q = Fr.div(a, fr(k, 1));
      const dp = r.pick([1, 2]);
      const rd = roundD(q, dp);
      return { q: T(`Calculate $${dS(a)} \\div ${k}$. Give the answer correct to ${dp} decimal place${dp > 1 ? 's' : ''}.`, `Hitung $${dS(a)} \\div ${k}$. Berikan jawapan betul kepada ${dp} tempat perpuluhan.`), a: T(`$${dS(a)} \\div ${k} \\approx ${dp2s(rd, dp)}$`), sp: 's' };
    },
    (r) => {
      const a = dr(r, 3, 1, 30);
      const dp = r.pick([1, 2]);
      const rd = roundD(a, dp);
      const c = r.pick([T('nearest tenth', 'persepuluh terdekat'), T('', '')]);
      return { q: T(`Round $${dS(a)}$ correct to ${dp} decimal place${dp > 1 ? 's' : ''}.`, `Bundarkan $${dS(a)}$ betul kepada ${dp} tempat perpuluhan.`), a: T(`$${dp2s(rd, dp)}$`), sp: 'xs' };
    },
    // fraction/decimal quick conversions
    (r) => {
      const f = r.pick([fr(1, 2), fr(1, 4), fr(3, 4), fr(1, 5), fr(2, 5), fr(3, 5), fr(1, 8), fr(3, 8), fr(5, 8), fr(7, 8), fr(1, 20), fr(3, 20), fr(1, 25), fr(7, 10), fr(9, 20), fr(13, 20)]);
      const neg = r.chance();
      const F = neg ? Fr.neg(f) : f;
      const c = r.pick([
        [T(`Write $${frT(F)}$ as a decimal.`, `Tulis $${frT(F)}$ sebagai perpuluhan.`), `${dS(F)}`],
        [T(`Write $${dS(F)}$ as a fraction in its simplest form.`, `Tulis $${dS(F)}$ sebagai pecahan dalam bentuk termudah.`), `${frT(F)}`],
      ]);
      return { q: c[0], a: T(`$${c[1]}$`), sp: 'xs' };
    },
    (r) => {
      const t = [dr(r, 1, -6, 9), dr(r, 1, -6, 9), dr(r, 1, -6, 9), dr(r, 1, -6, 9)];
      const s = t.reduce((x, y) => Fr.add(x, y), fr(0, 1));
      const mean = Fr.div(s, fr(4, 1));
      dS(mean);
      return { q: T(`The temperatures recorded were $${t.map(dS).join(',\\ ')}$ (in $^\\circ$C). Find the mean temperature.`, `Suhu yang direkodkan ialah $${t.map(dS).join(',\\ ')}$ (dalam $^\\circ$C). Cari suhu min.`), a: T(`$${dS(mean)}^\\circ$C`), w: T(`Sum $= ${dS(s)}$`, `Jumlah $= ${dS(s)}$`), sp: 's' };
    },
    // decimal between
    (r) => {
      const a = dr(r, 1, 1, 9), b = Fr.add(a, dv(1, 1));
      const c = r.pick([[T(`Write a decimal that lies between $${dS(a)}$ and $${dS(b)}$.`, `Tulis satu perpuluhan yang terletak di antara $${dS(a)}$ dengan $${dS(b)}$.`), `For example $${dS(Fr.add(a, dv(5, 2)))}$`, `Contohnya $${dS(Fr.add(a, dv(5, 2)))}$`]]);
      return { q: c[0], a: T(`${c[1]}`, `${c[2]}`), sp: 's' };
    },
  ];


  const PATDA = [
    (r) => Bn('-', Bn('*', dd1(r, 0.1, 5), dd1(r, 0.1, 5)), Bn('/', dd2(r, 1, 10), dq(r))),
    (r) => Bn('*', Br(Bn('-', dd1(r), Bn('*', dd1(r, 0.1, 4), dd1(r, 0.1, 4)))), dd1(r, 0.1, 4)),
    (r) => Bn('/', Br(Bn('*', dd1(r), dd1(r, 0.1, 5))), Br(Bn('+', dd1(r), dd1(r)))),
    (r) => Bn('-', dd1(r, 1, 20), Bn('*', Br(Bn('-', dd1(r), dd1(r))), dd1(r, 0.1, 5))),
    (r) => Bn('+', Bn('/', dd2(r, 1, 10), dq(r)), Bn('*', dd1(r, 0.1, 5), dd1(r, 0.1, 5))),
    (r) => Bn('/', Br(Bn('-', dd2(r, 1, 20), dd1(r))), Br(Bn('-', dd1(r), Lf(fr(1, 2), 'd')))),
    (r) => Bn('*', Br(Bn('+', dd1(r), dd2(r))), Br(Bn('/', dd1(r, 0.1, 9), dq(r)))),
    (r) => Bn('-', Br(Bn('+', dd1(r), dd1(r))), Bn('*', dd1(r, 0.1, 5), Br(Bn('-', dd1(r), dd1(r))))),
    (r) => Bn('/', Bn('+', dd1(r, 1, 20), dd2(r, 1, 10)), Bn('*', Lf(fr(1, 2), 'd'), Lf(fr(4, 1), 'd'))),
    (r) => Bn('-', Bn('/', Br(Bn('+', dd1(r), dd1(r))), dq(r)), dd1(r)),
    (r) => Bn('*', dd1(r, 0.1, 5), Bn('-', dd1(r), Bn('/', dd1(r), dq(r)))),
    (r) => Bn('+', Bn('*', dd1(r, 0.1, 5), Br(Bn('+', dd1(r), dd1(r)))), Bn('/', dd1(r, 1, 20), dq(r))),
  ];
  const a14 = [
    (r) => { const { x, v } = dexpr(r, PATDA, undefined, 250); return { q: T(`Evaluate $${shD(x, true)}$.`, `Nilaikan $${shD(x, true)}$.`), a: T(`$${dS(v)}$`), sp: 'm' }; },
    (r) => { const { x, v } = dexpr(r, PATDA, undefined, 250); return { q: T(`Show each step in evaluating $${shD(x, true)}$.`, `Tunjukkan setiap langkah dalam menilai $${shD(x, true)}$.`), a: T(`$${dS(v)}$`), sp: 'l' }; },
    (r) => {
      const { x, v } = dexpr(r, PATDA, undefined, 250);
      const bad = [Fr.neg(v), Fr.mul(v, fr(10, 1)), Fr.div(v, fr(10, 1)), Fr.add(v, fr(1, 10)), Fr.sub(v, fr(1, 2))].filter((f) => { try { dS(f); return !Fr.eq(f, v); } catch (e) { return false; } });
      need(bad.length >= 3);
      const m = mcq(r, v, bad.slice(0, 3), (f) => `$${dS(f)}$`);
      return { q: T(`Which is the value of $${shD(x, true)}$?<br>${m.q}`, `Yang manakah nilai bagi $${shD(x, true)}$?<br>${m.q}`), a: T(m.ans), sp: 'm' };
    },
    (r) => {
      const { x, v } = dexpr(r, PATDA, undefined, 250);
      const lo = Math.floor(Fr.val(v));
      return { q: T(`Evaluate $${shD(x, true)}$ and state the two consecutive whole numbers between which the answer lies.`, `Nilaikan $${shD(x, true)}$ dan nyatakan dua nombor bulat berturutan yang mengapit jawapan itu.`), a: T(`$${dS(v)}$; between $${lo}$ and $${lo + 1}$`, `$${dS(v)}$; di antara $${lo}$ dengan $${lo + 1}$`), sp: 'm' };
    },
    (r) => {
      const { x, v } = dexpr(r, PATD, undefined, 250);
      const { x: y, v: w } = dexpr(r, PATD, undefined, 250);
      need(!Fr.eq(v, w));
      return { q: T(`(a) Evaluate $${shD(x, true)}$. (b) Evaluate $${shD(y, true)}$. (c) Which answer is greater?`, `(a) Nilaikan $${shD(x, true)}$. (b) Nilaikan $${shD(y, true)}$. (c) Yang manakah jawapan yang lebih besar?`), a: T(`(a) $${dS(v)}$ (b) $${dS(w)}$ (c) ${Fr.cmp(v, w) > 0 ? '(a)' : '(b)'}`), sp: 'l' };
    },
    // multi-stage money
    (r) => {
      const it = r.pick(SPM.bank.items.filter((x) => x.lo >= 10));
      const price = pr(r, it), k = r.int(3, 8), disc = r.pick([fr(1, 10), fr(1, 5), fr(1, 4)]);
      const tot = Fr.mul(price, fr(k, 1)), off = Fr.mul(tot, disc);
      dS(off);
      need(off.d <= 100);
      const pay = Fr.sub(tot, off);
      return { q: T(`A shop sells ${it.en} at RM${dm(price)} each. ${SPM.cap(it.en)} bought in a set of ${k} get a discount of $${frT(disc)}$ off the total price. Find (a) the total price before the discount, (b) the amount of the discount, (c) the amount paid.`, `Sebuah kedai menjual ${it.ms} dengan harga RM${dm(price)} sebuah. Pembelian satu set ${k} mendapat diskaun $${frT(disc)}$ daripada jumlah harga. Cari (a) jumlah harga sebelum diskaun, (b) jumlah diskaun, (c) jumlah yang dibayar.`), a: T(`(a) RM${dm(tot)} (b) RM${dm(off)} (c) RM${dm(pay)}`), sp: 'm' };
    },
    // decimals in measurement with unit conversion in the middle
    (r) => {
      const kg1 = dr(r, 2, 1, 5), g2 = r.int(150, 950), k = r.int(2, 4);
      const tot = Fr.add(Fr.mul(kg1, fr(k, 1)), dv(g2, 3));
      return { q: T(`Each of ${k} bags has a mass of $${dS(kg1)}$ kg. A box has a mass of ${g2} g. Find the total mass of the bags and the box in kilograms.`, `Setiap satu daripada ${k} buah beg berjisim $${dS(kg1)}$ kg. Sebuah kotak berjisim ${g2} g. Cari jumlah jisim beg dan kotak itu dalam kilogram.`), a: T(`$${dS(tot)}$ kg`), sp: 's' };
    },
    (r) => {
      const km = dr(r, 1, 1, 9), m = r.int(120, 900);
      const k = r.int(2, 4);
      const each = Fr.add(km, dv(m, 3));
      const tot = Fr.mul(each, fr(k, 1));
      return { q: T(`A path is $${dS(km)}$ km and ${m} m long. ${k} paths of this length are laid end to end. Find the total length in kilometres.`, `Sebatang laluan panjangnya $${dS(km)}$ km dan ${m} m. ${k} laluan yang sama panjang disambung hujung ke hujung. Cari jumlah panjangnya dalam kilometer.`), a: T(`$${dS(tot)}$ km`), sp: 's' };
    },
    // rounding at the end only
    (r) => {
      const a = dr(r, 2, 1, 20), b = dr(r, 2, 1, 20), k = r.pick([3, 6, 7, 9]);
      const q = Fr.div(Fr.add(a, b), fr(k, 1));
      const dp = r.pick([1, 2]);
      const rd = roundD(q, dp);
      const exact = Fr.add(a, b);
      return { q: T(`Find $(${dS(a)} + ${dS(b)}) \\div ${k}$. Do not round in the middle of the working; give the final answer correct to ${dp} decimal place${dp > 1 ? 's' : ''}.`, `Cari $(${dS(a)} + ${dS(b)}) \\div ${k}$. Jangan membundarkan di pertengahan pengiraan; berikan jawapan akhir betul kepada ${dp} tempat perpuluhan.`), a: T(`$${dS(exact)} \\div ${k} \\approx ${dp2s(rd, dp)}$`), sp: 's' };
    },
    (r) => {
      const a = dr(r, 2, 1, 9), b = dr(r, 2, 1, 9);
      const prod = Fr.mul(a, b);
      const dp = r.pick([1, 2]);
      const rd = roundD(prod, dp);
      return { q: T(`Calculate $${dS(a)} \\times ${dS(b)}$ exactly, and then round the answer to ${dp} decimal place${dp > 1 ? 's' : ''}. Why should you round only at the end?`, `Hitung $${dS(a)} \\times ${dS(b)}$ dengan tepat, kemudian bundarkan jawapan kepada ${dp} tempat perpuluhan. Mengapakah anda hanya perlu membundarkan pada akhir?`), a: T(`Exact: $${dS(prod)}$; rounded: $\\approx ${dp2s(rd, dp)}$. Rounding early can make the final answer inaccurate.`, `Tepat: $${dS(prod)}$; dibundarkan: $\\approx ${dp2s(rd, dp)}$. Membundarkan lebih awal boleh menjadikan jawapan akhir tidak tepat.`), sp: 's' };
    },
    (r) => {
      const v = [dr(r, 2, -2, 2), dr(r, 1, -2, 2), dr(r, 3, -2, 2)];
      need(new Set(v.map(dS)).size === 3);
      const asc = r.chance();
      const sorted = v.slice().sort((x, y) => (asc ? Fr.cmp(x, y) : Fr.cmp(y, x)));
      const c = r.pick([[fr(-3, 4), 'x'], [fr(1, 4), 'y'], [fr(-1, 2), 'z']]);
      const all = v.concat([c[0]]);
      const s2 = all.slice().sort((x, y) => (asc ? Fr.cmp(x, y) : Fr.cmp(y, x)));
      const shown = r.shuffle(all);
      need(new Set(all.map((f) => dS(f))).size === 4);
      return { q: T(`Arrange $${shown.map((f, i) => (f === c[0] ? frT(f) : dS(f))).join(',\\ ')}$ in ${asW(asc).en}. (Change all the numbers to decimals first.)`, `Susun $${shown.map((f, i) => (f === c[0] ? frT(f) : dS(f))).join(',\\ ')}$ dalam ${asW(asc).ms}. (Tukarkan semua nombor kepada perpuluhan dahulu.)`), a: T(`$${s2.map((f) => (f === c[0] ? frT(f) : dS(f))).join(',\\ ')}$`), sp: 'm' };
    },
  ];


  /* true / false statements about decimals */
  const STD = [
    (r) => { const a = r.int(1, 8); return { t: T(`$0.${a}5 > 0.${a}$`), ok: true }; },
    (r) => { const a = r.int(1, 8); return { t: T(`$0.${a} > 0.${a}5$`), ok: false }; },
    (r) => { const a = r.int(1, 9); return { t: T(`$${a}.5 = ${a}.50$`), ok: true }; },
    (r) => { const a = r.int(1, 9); return { t: T(`$0.${a} = \\dfrac{${a}}{10}$`), ok: true }; },
    (r) => { const a = r.int(1, 9); return { t: T(`$0.0${a} = \\dfrac{${a}}{10}$`), ok: false }; },
    (r) => { const a = r.int(1, 8); return { t: T(`$-0.${a} < -0.${a + 1}$`), ok: false }; },
    (r) => { const a = r.int(1, 8); return { t: T(`$-0.${a} > -0.${a + 1}$`), ok: true }; },
    (r) => { const a = r.int(11, 99); return { t: T(`$${a} \\times 0.1 = ${dS(dv(a, 1))}$`), ok: true }; },
    (r) => { const a = r.int(11, 99); return { t: T(`$${a} \\div 100 = ${dS(dv(a, 1))}$`), ok: false }; },
    (r) => { const a = r.int(2, 9); return { t: T(`$0.${a} \\times 0.${a}$ is less than $0.${a}$`, `$0.${a} \\times 0.${a}$ kurang daripada $0.${a}$`), ok: true }; },
    (r) => { const a = r.int(2, 9); return { t: T(`Multiplying a positive number by $0.${a}$ always makes it larger`, `Mendarab nombor positif dengan $0.${a}$ sentiasa menjadikannya lebih besar`), ok: false }; },
    (r) => ({ t: T('The number $-2.5$ lies between $-3$ and $-2$ on the number line', 'Nombor $-2.5$ terletak di antara $-3$ dengan $-2$ pada garis nombor'), ok: true }),
    (r) => ({ t: T('$0.5$ and $0.50$ are the same number', '$0.5$ dan $0.50$ ialah nombor yang sama'), ok: true }),
    (r) => ({ t: T('$0.125 = \\dfrac{1}{8}$', '$0.125 = \\dfrac{1}{8}$'), ok: true }),
    (r) => ({ t: T('$0.3 + 0.4 = 0.07$', '$0.3 + 0.4 = 0.07$'), ok: false }),
    (r) => { const a = r.int(2, 9); return { t: T(`$${a} - 0.${a} = ${a - 1}.${10 - a}$`), ok: true }; },
  ];
  const std = (r, k) => r.sample(STD, k).map((f) => f(r));

  const e14b = [
    (r) => { const ss = std(r, 3); return { q: T(`Write True or False for each statement.<br>${ss.map((s2, i) => `(${'abc'[i]}) ${s2.t.en}`).join('<br>')}`, `Tulis Benar atau Palsu bagi setiap pernyataan.<br>${ss.map((s2, i) => `(${'abc'[i]}) ${s2.t.ms}`).join('<br>')}`), a: T(ss.map((s2, i) => `(${'abc'[i]}) ${s2.ok ? 'True' : 'False'}`).join(' '), ss.map((s2, i) => `(${'abc'[i]}) ${s2.ok ? 'Benar' : 'Palsu'}`).join(' ')), sp: 's' }; },
    (r) => { const s2 = std(r, 1)[0]; return { q: T(`Is this statement true? ${s2.t.en}. Answer Yes or No.`, `Adakah pernyataan ini benar? ${s2.t.ms}. Jawab Ya atau Tidak.`), a: T(s2.ok ? 'Yes' : 'No', s2.ok ? 'Ya' : 'Tidak'), sp: 'xs' }; },
    // double / half / tenth
    (r) => {
      const a = dr(r, 1, 1, 9);
      const c = r.pick([
        [T(`Find half of $${dS(a)}$.`, `Cari setengah daripada $${dS(a)}$.`), Fr.mul(a, fr(1, 2))],
        [T(`Find double $${dS(a)}$.`, `Cari dua kali ganda $${dS(a)}$.`), Fr.mul(a, fr(2, 1))],
        [T(`Find one tenth of $${dS(a)}$.`, `Cari satu persepuluh daripada $${dS(a)}$.`), Fr.mul(a, fr(1, 10))],
        [T(`Find $${dS(a)}$ multiplied by $100$.`, `Cari $${dS(a)}$ didarab dengan $100$.`), Fr.mul(a, fr(100, 1))],
        [T(`Find the number that is $10$ times $${dS(a)}$.`, `Cari nombor yang $10$ kali ganda $${dS(a)}$.`), Fr.mul(a, fr(10, 1))],
      ]);
      return { q: c[0], a: T(`$${dS(c[1])}$`), sp: 'xs' };
    },
    (r) => {
      const c = r.pick([
        [T('How many sen are there in RM$3.45$?', 'Berapakah bilangan sen dalam RM$3.45$?'), '345'],
        [T('Write 275 sen in RM.', 'Tulis 275 sen dalam RM.'), 'RM2.75'],
        [T('Write 60 sen in RM.', 'Tulis 60 sen dalam RM.'), 'RM0.60'],
        [T('How many minutes are there in $1.5$ hours?', 'Berapakah bilangan minit dalam $1.5$ jam?'), '90'],
        [T('How many minutes are there in $2.25$ hours?', 'Berapakah bilangan minit dalam $2.25$ jam?'), '135'],
        [T('Write 45 minutes in hours as a decimal.', 'Tulis 45 minit dalam jam sebagai perpuluhan.'), '0.75'],
        [T('Write 30 seconds in minutes as a decimal.', 'Tulis 30 saat dalam minit sebagai perpuluhan.'), '0.5'],
      ]);
      return { q: c[0], a: T(c[1].indexOf('RM') === 0 ? c[1] : `$${c[1]}$`), sp: 'xs' };
    },
    (r) => {
      const it = r.sample(SPM.bank.foods, 3);
      const a = pr(r, it[0]), b = pr(r, it[1]), c = pr(r, it[2]);
      return { q: T(`At a stall, ${it[0].en} cost RM${dm(a)}, ${it[1].en} cost RM${dm(b)} and ${it[2].en} cost RM${dm(c)} (one of each). Find the total cost of one of each.`, `Di sebuah gerai, harga ${it[0].ms} ialah RM${dm(a)}, harga ${it[1].ms} ialah RM${dm(b)} dan harga ${it[2].ms} ialah RM${dm(c)} (satu setiap jenis). Cari jumlah harga satu setiap jenis.`), a: T(`RM${dm(Fr.add(Fr.add(a, b), c))}`), sp: 's' };
    },
    (r) => {
      const it = r.pick(SPM.bank.items);
      const a = pr(r, it), k = r.int(2, 9);
      return { q: T(`A ${it.en1} costs RM${dm(a)}. How much do ${k} of them cost?`, `Sebuah ${it.ms} berharga RM${dm(a)}. Berapakah harga ${k} buah?`), a: T(`RM${dm(Fr.mul(a, fr(k, 1)))}`), sp: 'xs' };
    },
    (r) => {
      const a = dr(r, 1, -9, 9), b = dr(r, 2, -9, 9);
      need(a.d !== b.d);
      const big = r.chance();
      return { q: T(`Which is ${big ? 'greater' : 'smaller'}: $${dS(a)}$ or $${dS(b)}$?`, `Yang manakah ${big ? 'lebih besar' : 'lebih kecil'}: $${dS(a)}$ atau $${dS(b)}$?`), a: T(`$${dS((Fr.cmp(a, b) > 0) === big ? a : b)}$`), sp: 'xs' };
    },
  ];
  const m14b = [];
  const a14b = [
    (r) => {
      const W = [fr(1, 2), fr(1, 1), fr(2, 1), fr(5, 2), fr(4, 1), fr(5, 1)];
      const [w1, w2] = r.sample(W, 2);
      const p1 = dv(r.int(120, 900) * 5, 2), p2 = dv(r.int(120, 900) * 5, 2);
      const u1 = Fr.div(p1, w1), u2 = Fr.div(p2, w2);
      try { dS(u1); dS(u2); } catch (e) { need(false); }
      need(!Fr.eq(u1, u2) && u1.d <= 100 && u2.d <= 100 && Fr.val(u1) > 1.5 && Fr.val(u1) < 20 && Fr.val(u2) > 1.5 && Fr.val(u2) < 20 && Math.abs(Fr.val(u1) - Fr.val(u2)) > 0.2);
      const it = r.pick([['rice', 'beras', 'kg'], ['flour', 'tepung', 'kg'], ['sugar', 'gula', 'kg']]);
      return { q: T(`A ${dS(w1)} kg pack of ${it[0]} costs RM${dm(p1)} and a ${dS(w2)} kg pack costs RM${dm(p2)}. Find the price per kilogram of each pack and say which pack is the better buy.`, `Sebungkus ${it[1]} ${dS(w1)} kg berharga RM${dm(p1)} dan sebungkus ${dS(w2)} kg berharga RM${dm(p2)}. Cari harga sekilogram bagi setiap bungkusan dan nyatakan bungkusan yang manakah lebih berbaloi.`), a: T(`RM${dm(u1)}/kg and RM${dm(u2)}/kg; the ${Fr.cmp(u1, u2) < 0 ? 'first' : 'second'} pack is cheaper per kg`, `RM${dm(u1)}/kg dan RM${dm(u2)}/kg; bungkusan ${Fr.cmp(u1, u2) < 0 ? 'pertama' : 'kedua'} lebih murah sekilogram`), sp: 'm' };
    },
    (r) => {
      const h = dr(r, 1, 1, 9), k = r.int(3, 6);
      const its = r.sample(SPM.bank.foods, 3);
      const pv = its.map((it) => pr(r, it));
      const rows = its.map((it, i) => [it.en, `${dm(pv[i])}`, `${r.int(2, 5)}`]);
      const rowsMs = its.map((it, i) => [it.ms, `${dm(pv[i])}`, rows[i][2]]);
      const vals = rows.map((row, i) => [pv[i], parseInt(row[2], 10)]);
      const totals = vals.map((v) => Fr.mul(v[0], fr(v[1], 1)));
      const grand = totals.reduce((x, y) => Fr.add(x, y), fr(0, 1));
      const tb = (h1, h2) => SPM.table(rows.map((row) => [row[0], row[1], row[2], '']), { head: ['Item', h1, h2, 'Cost (RM)'] });
      const tbM = SPM.table(rowsMs.map((row) => [row[0], row[1], row[2], '']), { head: ['Barang', 'Harga seunit (RM)', 'Kuantiti', 'Kos (RM)'] });
      return { q: T(`Complete the last column of the table and find the grand total.<br>${tb('Price per unit (RM)', 'Quantity')}`, `Lengkapkan lajur terakhir jadual dan cari jumlah keseluruhan.<br>${tbM}`), a: T(`Costs: ${totals.map((x) => `RM${dm(x)}`).join(', ')}; grand total RM${dm(grand)}`, `Kos: ${totals.map((x) => `RM${dm(x)}`).join(', ')}; jumlah keseluruhan RM${dm(grand)}`), sp: 'm' };
    },
  ];

  SPM.extend('F1-1.4', { e: e14.concat(e14b), m: m14.concat(m14b), a: a14.concat(a14b) });

  /* ===================================================================== */
  /* ---- F1-1.5 Rational numbers                                            */
  /* ===================================================================== */
  const DEN_TERM = [2, 4, 5, 8, 10, 20, 25];                     // denominators whose fractions terminate
  /* a random rational shown as a fraction ('f'), mixed number ('m'), decimal ('d') or integer ('i') */
  function rlf(r, style, o) {
    o = o || {};
    const neg = o.neg === undefined ? r.chance(0.4) : o.neg;
    let f, st = style;
    if (st === 'i') f = fr(r.int(1, 12), 1);
    else if (st === 'd') { const dp = r.pick([1, 1, 2]); f = dv(r.int(1, Math.round((o.max || 9) * Math.pow(10, dp))), dp); need(f.d > 1 && f.d <= 100); }
    else if (st === 'm') { const d = r.pick(o.term ? DEN_TERM : DEN_TERM.concat([3, 6])), w = r.int(1, 4), nu = r.int(1, d - 1); need(gcd(nu, d) === 1); f = fr(w * d + nu, d); }
    else { const d = r.pick(o.term ? DEN_TERM.filter((x) => x <= 10) : [2, 3, 4, 5, 6, 7, 8, 9, 10]); const nu = r.int(1, d * (o.improper ? 2 : 1) - (o.improper ? 0 : 1)); need(gcd(nu, d) === 1 && d > 1 && nu !== d); f = fr(nu, d); }
    return Lf(neg ? Fr.neg(f) : f, st === 'i' ? 'f' : st);
  }
  const anyStyle = (r, o) => rlf(r, r.pick(['f', 'm', 'd', 'd', 'f', 'i']), o);
  const tdec = (f) => { try { dS(f); return true; } catch (e) { return false; } };
  const rTex = (x) => shN(x, true);
  const leaves = (x) => (x.t === 'n' ? [x] : x.t === 'p' ? leaves(x.a) : leaves(x.a).concat(leaves(x.b)));
  /* answer in the natural form: a decimal if every number in the expression is a decimal or an integer, otherwise a mixed number */
  const ansR = (x, v) => (leaves(x).every((l) => l.st === 'd' || l.f.d === 1) && tdec(v) ? dS(v) : Fr.mixed(v));
  const rShow = (f, st) => (st === 'd' ? dS(f) : st === 'm' ? Fr.mixed(f) : Fr.tex(f));
  const sameVal = (a, b) => Fr.eq(a, b);
  const STR = [
        [T('Every integer is a rational number.', 'Setiap integer ialah nombor nisbah.'), true, T('An integer $n$ can be written as $\\dfrac{n}{1}$.', 'Integer $n$ boleh ditulis sebagai $\\dfrac{n}{1}$.')],
        [T('Every fraction $\\dfrac{a}{b}$ with $a$, $b$ integers and $b \\neq 0$ is a rational number.', 'Setiap pecahan $\\dfrac{a}{b}$ dengan $a$, $b$ integer dan $b \\neq 0$ ialah nombor nisbah.'), true, T('This is the definition of a rational number.', 'Ini ialah takrif nombor nisbah.')],
        [T('Every terminating decimal is a rational number.', 'Setiap perpuluhan terhingga ialah nombor nisbah.'), true, T('For example $0.75 = \\dfrac{3}{4}$.', 'Contohnya $0.75 = \\dfrac{3}{4}$.')],
        [T('$0$ is a rational number.', '$0$ ialah nombor nisbah.'), true, T('$0 = \\dfrac{0}{1}$.', '$0 = \\dfrac{0}{1}$.')],
        [T('A negative number cannot be a rational number.', 'Nombor negatif tidak boleh menjadi nombor nisbah.'), false, T('For example $-\\dfrac{2}{3}$ is rational.', 'Contohnya $-\\dfrac{2}{3}$ ialah nombor nisbah.')],
        [T('$\\dfrac{5}{0}$ is a rational number.', '$\\dfrac{5}{0}$ ialah nombor nisbah.'), false, T('The denominator $b$ cannot be $0$.', 'Penyebut $b$ tidak boleh $0$.')],
        [T('A mixed number is a rational number.', 'Nombor bercampur ialah nombor nisbah.'), true, T('For example $2\\dfrac{1}{3} = \\dfrac{7}{3}$.', 'Contohnya $2\\dfrac{1}{3} = \\dfrac{7}{3}$.')],
        [T('The sum of two rational numbers can be a rational number.', 'Hasil tambah dua nombor nisbah boleh menjadi nombor nisbah.'), true, T('For example $\\dfrac{1}{2} + 0.25 = \\dfrac{3}{4}$.', 'Contohnya $\\dfrac{1}{2} + 0.25 = \\dfrac{3}{4}$.')],
        [T('$-3$ and $-3.0$ are different rational numbers.', '$-3$ dan $-3.0$ ialah nombor nisbah yang berbeza.'), false, T('They represent the same number.', 'Kedua-duanya mewakili nombor yang sama.')],
        [T('$\\dfrac{1}{2}$ and $0.5$ represent the same rational number.', '$\\dfrac{1}{2}$ dan $0.5$ mewakili nombor nisbah yang sama.'), true, T('$0.5 = \\dfrac{5}{10} = \\dfrac{1}{2}$.', '$0.5 = \\dfrac{5}{10} = \\dfrac{1}{2}$.')],
  ];
  const e15 = [
    // classification
    (r) => {
      const ints = r.sample([-9, -4, 0, 3, 7, 12], 2), fracs = r.sample([fr(-2, 3), fr(3, 5), fr(7, 4), fr(-1, 6), fr(5, 8)], 2), decs = r.sample([dv(25, 2), dv(-6, 1), dv(15, 1), dv(-125, 3), dv(4, 1)], 2);
      const items = r.shuffle(ints.map((x) => ({ t: String(x), k: 'int' })).concat(fracs.map((f) => ({ t: Fr.tex(f), k: 'frac' })), decs.map((f) => ({ t: dS(f), k: 'dec' }))));
      const kind = r.pick(['int', 'frac', 'dec']);
      const nm = { int: T('integers', 'integer'), frac: T('fractions', 'pecahan'), dec: T('decimals', 'perpuluhan') }[kind];
      const res = items.filter((x) => x.k === kind);
      return { q: T(`From the list $${items.map((x) => x.t).join(',\\ ')}$, write down all the numbers that are ${nm.en}.`, `Daripada senarai $${items.map((x) => x.t).join(',\\ ')}$, tulis semua nombor yang ialah ${nm.ms}.`), a: T(`$${res.map((x) => x.t).join(',\\ ')}$`), sp: 'xs' };
    },
    // true / false about rational numbers
    (r) => { const c = r.pick(STR); return { q: T(`True or false? ${c[0].en} Give a reason.`, `Benar atau palsu? ${c[0].ms} Berikan sebab.`), a: T(`${c[1] ? 'True' : 'False'}. ${c[2].en}`, `${c[1] ? 'Benar' : 'Palsu'}. ${c[2].ms}`), sp: 's' }; },
    (r) => { const ss = r.sample(STR, 3); return { q: T(`Which of these statements are true?<br>${ss.map((x, i) => `(${'abc'[i]}) ${x[0].en}`).join('<br>')}`, `Antara pernyataan berikut, yang manakah benar?<br>${ss.map((x, i) => `(${'abc'[i]}) ${x[0].ms}`).join('<br>')}`), a: T(ss.map((x, i) => `(${'abc'[i]}) ${x[1] ? 'true' : 'false'}`).join(', '), ss.map((x, i) => `(${'abc'[i]}) ${x[1] ? 'benar' : 'palsu'}`).join(', ')), sp: 's' }; },
    // number line reading
    (r) => {
      const d = r.pick([2, 4, 5, 8]);
      const k = r.int(-2 * d + 1, 2 * d - 1);
      need(k % d !== 0);
      const F = fr(k, d);
      need(tdec(F));
      const form = r.pick(['dec', 'frac']);
      return { q: T(`State the rational number represented by point $P$ as ${form === 'dec' ? 'a decimal' : 'a fraction'}.`, `Nyatakan nombor nisbah yang diwakili oleh titik $P$ sebagai ${form === 'dec' ? 'perpuluhan' : 'pecahan'}.`), fig: fLine(-2, 2, d, [k / d]), a: T(`$${form === 'dec' ? dS(F) : Fr.tex(F)}$`), sp: 'xs' };
    },
    (r) => {
      const d = r.pick([4, 5, 8]);
      const [a, b, c] = r.distinct(3, -2 * d + 1, 2 * d - 1);
      need([a, b, c].every((x) => x % d !== 0));
      const v = [a, b, c].map((x) => fr(x, d));
      need(v.every(tdec));
      const asc = r.chance();
      const idx = sortBy([0, 1, 2], asc, (i) => Fr.val(v[i]));
      return { q: T(`Read the rational numbers at $P$, $Q$ and $R$ and list them in ${asW(asc).en}. Use decimals.`, `Baca nombor nisbah pada $P$, $Q$ dan $R$ dan senaraikan dalam ${asW(asc).ms}. Gunakan perpuluhan.`), fig: fLine(-2, 2, d, v.map(Fr.val)), a: T(`$${idx.map((i) => dS(v[i])).join(',\\ ')}$`), sp: 's' };
    },
    // comparing across forms
    (r) => {
      const A = rlf(r, 'f', { term: true }), B = rlf(r, 'd', { max: 1.5 });
      need(!sameVal(A.f, B.f));
      return { q: T(`Fill in the blank with $<$ or $>$: $${rTex(A)}\\ \\square\\ ${shN(B, false)}$`, `Isi tempat kosong dengan $<$ atau $>$: $${rTex(A)}\\ \\square\\ ${shN(B, false)}$`), a: T(`$${rTex(A)} ${cmpS(Fr.val(A.f), Fr.val(B.f))} ${shN(B, false)}$`), sp: 'xs' };
    },
    (r) => {
      const v = [rlf(r, 'f', { term: true }), rlf(r, 'd', { max: 3 }), rlf(r, 'm', { neg: false })];
      need(new Set(v.map((x) => Fr.tex(x.f))).size === 3);
      const asc = r.chance();
      const sorted = v.slice().sort((x, y) => (asc ? Fr.cmp(x.f, y.f) : Fr.cmp(y.f, x.f)));
      return { q: T(`Arrange $${v.map((x) => shN(x, true)).join(',\\ ')}$ in ${asW(asc).en}.`, `Susun $${v.map((x) => shN(x, true)).join(',\\ ')}$ dalam ${asW(asc).ms}.`), a: T(`$${sorted.map((x) => shN(x, true)).join(',\\ ')}$`), sp: 's' };
    },
    // easy operations
    (r) => {
      const A = rlf(r, 'f', { term: true }), B = rlf(r, 'd', { max: 3 });
      const op = r.pick(['+', '-']);
      const x = Bn(op, A, B);
      const v = evN(x);
      return { q: T(`Calculate $${shN(x, true)}$. Give the answer as a fraction in its simplest form.`, `Hitung $${shN(x, true)}$. Berikan jawapan sebagai pecahan dalam bentuk termudah.`), a: T(`$${Fr.mixed(v)}$`), sp: 's' };
    },
    (r) => {
      const A = rlf(r, 'd', { max: 5 }), B = rlf(r, 'f', { term: true });
      const op = r.pick(['+', '-', '*']);
      const x = Bn(op, A, B);
      const v = evN(x);
      need(tdec(v));
      return { q: T(`Calculate $${shN(x, true)}$. Give the answer as a decimal.`, `Hitung $${shN(x, true)}$. Berikan jawapan sebagai perpuluhan.`), a: T(`$${dS(v)}$`), sp: 's' };
    },
    (r) => {
      const A = rlf(r, 'i'), B = rlf(r, r.pick(['f', 'd']), { term: true });
      const op = r.pick(['+', '-', '*']);
      const x = Bn(op, A, B);
      const v = evN(x);
      return { q: T(`Evaluate $${shN(x, true)}$.`, `Nilaikan $${shN(x, true)}$.`), a: T(`$${ansR(x, v)}$`), sp: 's' };
    },
    // opposite and reciprocal in different forms
    (r) => {
      const A = anyStyle(r, { neg: r.chance() });
      need(A.f.n !== 0);
      const c = r.pick([
        [T(`Write down the number that must be added to $${shN(A, true)}$ to give $0$.`, `Tulis nombor yang mesti ditambah kepada $${shN(A, true)}$ untuk memberikan $0$.`), Fr.neg(A.f), A.st],
        [T(`Write down the reciprocal of $${shN(A, true)}$ as a fraction.`, `Tulis salingan bagi $${shN(A, true)}$ sebagai pecahan.`), fr(A.f.d, A.f.n), 'f'],
      ]);
      return { q: c[0], a: T(`$${rShow(c[1], c[2] === 'm' ? 'f' : c[2] === 'd' ? 'd' : 'f')}$`), sp: 'xs' };
    },
    (r) => {
      const t = rlf(r, 'd', { neg: true }), d = rlf(r, 'm', { neg: false });
      const v = Fr.add(t.f, d.f);
      const dec = r.chance();
      need(!dec || tdec(v));
      return { q: T(`The temperature is $${shN(t, true)}^\\circ$C. It rises by $${shN(d, true)}^\\circ$C. What is the new temperature ${dec ? 'as a decimal' : 'as a fraction or mixed number'}?`, `Suhu ialah $${shN(t, true)}^\\circ$C. Suhu itu naik sebanyak $${shN(d, true)}^\\circ$C. Berapakah suhu yang baharu ${dec ? 'sebagai perpuluhan' : 'sebagai pecahan atau nombor bercampur'}?`), a: T(`$${dec ? dS(v) : Fr.mixed(v)}^\\circ$C`), sp: 's' };
    },
    // sequence
    (r) => {
      const st = r.pick([dv(25, 2), dv(5, 1), fr(1, 4), fr(1, 2), dv(75, 2)]), a = fr(r.int(-4, 0), 1);
      const list = [0, 1, 2, 3].map((i) => Fr.add(a, Fr.mul(st, fr(i, 1))));
      const nx = [4, 5].map((i) => Fr.add(a, Fr.mul(st, fr(i, 1))));
      const dec = r.chance();
      return { q: T(`Write the next two terms of the pattern $${list.map((f) => (dec ? dS(f) : Fr.mixed(f))).join(',\\ ')},\\ \\ldots$`, `Tulis dua sebutan seterusnya bagi pola $${list.map((f) => (dec ? dS(f) : Fr.mixed(f))).join(',\\ ')},\\ \\ldots$`), a: T(`$${nx.map((f) => (dec ? dS(f) : Fr.mixed(f))).join(',\\ ')}$`), sp: 's' };
    },
  ];


  const RS = (r) => rlf(r, r.pick(['f', 'm', 'd', 'd']), { max: 6, term: true });   // small mixed-style rational
  const PATR = [
    (r) => Bn('+', RS(r), RS(r)),
    (r) => Bn('-', RS(r), RS(r)),
    (r) => Bn('*', RS(r), RS(r)),
    (r) => Bn('/', RS(r), RS(r)),
    (r) => Bn('-', Bn('+', RS(r), RS(r)), RS(r)),
    (r) => Bn('+', RS(r), Bn('*', RS(r), RS(r))),
    (r) => Bn('-', RS(r), Bn('*', RS(r), RS(r))),
    (r) => Bn('*', Br(Bn('+', RS(r), RS(r))), RS(r)),
    (r) => Bn('*', Br(Bn('-', RS(r), RS(r))), RS(r)),
    (r) => Bn('/', Br(Bn('+', RS(r), RS(r))), RS(r)),
    (r) => Bn('+', RS(r), Bn('/', RS(r), RS(r))),
    (r) => Bn('-', RS(r), Bn('/', RS(r), RS(r))),
    (r) => Bn('-', RS(r), Br(Bn('-', RS(r), RS(r)))),
    (r) => Bn('/', Bn('*', RS(r), RS(r)), RS(r)),
    (r) => Bn('*', RS(r), Bn('*', RS(r), RS(r))),
    (r) => Bn('+', Bn('*', RS(r), RS(r)), Bn('*', RS(r), RS(r))),
    (r) => Bn('-', Br(Bn('*', RS(r), RS(r))), Br(Bn('/', RS(r), RS(r)))),
    (r) => Bn('*', Br(Bn('+', RS(r), RS(r))), Br(Bn('-', RS(r), RS(r)))),
    (r) => Bn('/', RS(r), Br(Bn('+', RS(r), RS(r)))),
    (r) => Bn('-', Bn('/', RS(r), RS(r)), Bn('*', RS(r), RS(r))),
  ];
  function rexpr(r, pats, k, lim) {
    const x = pats[k === undefined ? r.int(0, pats.length - 1) : k](r);
    const v = evN(x);
    need(v.n !== 0 && Math.abs(v.n) <= 400 && v.d <= 400 && Math.abs(Fr.val(v)) <= (lim || 25));
    need(shN(x, true).length < 130);
    return { x, v };
  }
  const CTX15 = [
    { en: 'flour', ms: 'tepung', u: 'kg' }, { en: 'sugar', ms: 'gula', u: 'kg' }, { en: 'cooking oil', ms: 'minyak masak', u: 'litres', ums: 'liter' }, { en: 'milk', ms: 'susu', u: 'litres', ums: 'liter' }, { en: 'cloth', ms: 'kain', u: 'm' }, { en: 'rope', ms: 'tali', u: 'm' },
  ];
  const m15 = [
    (r) => { const ss = r.sample(STR, 3); return { q: T(`Decide whether each statement is true or false, and correct each false statement.<br>${ss.map((x, i) => `(${'abc'[i]}) ${x[0].en}`).join('<br>')}`, `Tentukan sama ada setiap pernyataan benar atau palsu, dan betulkan setiap pernyataan yang palsu.<br>${ss.map((x, i) => `(${'abc'[i]}) ${x[0].ms}`).join('<br>')}`), a: T(ss.map((x, i) => `(${'abc'[i]}) ${x[1] ? 'true' : 'false: ' + x[2].en.replace(/\$/g, '')}`).join('; '), ss.map((x, i) => `(${'abc'[i]}) ${x[1] ? 'benar' : 'palsu: ' + x[2].ms.replace(/\$/g, '')}`).join('; ')), sp: 'm' }; },
    (r) => { const { x, v } = rexpr(r, PATR); return { q: T(`Evaluate $${shN(x, true)}$.`, `Nilaikan $${shN(x, true)}$.`), a: T(`$${ansR(x, v)}$`), sp: 's' }; },
    (r) => {
      const { x, v } = rexpr(r, PATR);
      const dec = tdec(v);
      const c = r.pick(['fraction', 'decimal']);
      need(c === 'fraction' || dec);
      return { q: T(`Calculate $${shN(x, true)}$ and give the answer as ${c === 'fraction' ? 'a fraction in its simplest form' : 'a decimal'}.`, `Hitung $${shN(x, true)}$ dan berikan jawapan sebagai ${c === 'fraction' ? 'pecahan dalam bentuk termudah' : 'perpuluhan'}.`), a: T(`$${c === 'fraction' ? Fr.tex(v) : dS(v)}$`), sp: 's' };
    },
    (r) => {
      const { x, v } = rexpr(r, PATR, r.int(0, 3));
      return { q: T(`Change every number to a fraction first, then evaluate $${shN(x, true)}$.`, `Tukarkan setiap nombor kepada pecahan dahulu, kemudian nilaikan $${shN(x, true)}$.`), a: T(`$${Fr.mixed(v)}$`), sp: 'm' };
    },
    (r) => {
      const { x, v } = rexpr(r, PATR, r.int(0, 3));
      need(tdec(v) && leaves(x).every((l) => tdec(l.f)));
      return { q: T(`Change every number to a decimal first, then evaluate $${shN(x, true)}$.`, `Tukarkan setiap nombor kepada perpuluhan dahulu, kemudian nilaikan $${shN(x, true)}$.`), a: T(`$${dS(v)}$`), sp: 'm' };
    },
    (r) => {
      const { x, v } = rexpr(r, PATR);
      const bad = [Fr.neg(v), Fr.mul(v, fr(2, 1)), Fr.add(v, fr(1, 2)), Fr.sub(v, fr(1, 4))].filter((f) => !Fr.eq(f, v));
      const m = mcq(r, v, bad.slice(0, 3), (f) => `$${Fr.mixed(f)}$`);
      return { q: T(`Which is the value of $${shN(x, true)}$?<br>${m.q}`, `Yang manakah nilai bagi $${shN(x, true)}$?<br>${m.q}`), a: T(m.ans), sp: 's' };
    },
    (r) => {
      const v = [];
      while (v.length < 5) { const x = rlf(r, r.pick(['f', 'm', 'd']), { max: 3, term: true }); if (!v.some((y) => Fr.eq(y.f, x.f))) v.push(x); }
      const asc = r.chance();
      const sorted = v.slice().sort((a, b) => (asc ? Fr.cmp(a.f, b.f) : Fr.cmp(b.f, a.f)));
      return { q: T(`Convert all the numbers to decimals, and then arrange $${v.map((x) => shN(x, true)).join(',\\ ')}$ in ${asW(asc).en}.`, `Tukarkan semua nombor kepada perpuluhan, kemudian susun $${v.map((x) => shN(x, true)).join(',\\ ')}$ dalam ${asW(asc).ms}.`), a: T(`$${sorted.map((x) => shN(x, true)).join(',\\ ')}$ (${sorted.map((x) => dS(x.f)).join(', ')})`), sp: 'm' };
    },
    (r) => {
      const ns = r.names(4);
      const fs = [];
      while (fs.length < 4) { const x = rlf(r, r.pick(['f', 'd', 'm']), { max: 3, term: true, neg: false }); if (!fs.some((y) => Fr.eq(y.f, x.f))) fs.push(x); }
      const c = r.pick([['metres of ribbon', 'meter reben'], ['kilograms of rice', 'kilogram beras'], ['litres of juice', 'liter jus']]);
      const idx = sortBy([0, 1, 2, 3], false, (i) => Fr.val(fs[i].f));
      return { q: T(`Four friends bought ${ns.map((n1, i) => `${n1} $${shN(fs[i], true)}$`).join(', ')} ${c[0]}. List the friends from the one who bought the most to the one who bought the least.`, `Empat orang kawan membeli ${ns.map((n1, i) => `${n1} $${shN(fs[i], true)}$`).join(', ')} ${c[1]}. Senaraikan kawan-kawan itu daripada yang membeli paling banyak kepada yang membeli paling sedikit.`), a: T(idx.map((i) => ns[i]).join(', ')), sp: 's' };
    },
    // word problems
    (r) => {
      const c = r.pick(CTX15);
      const A = rlf(r, r.pick(['f', 'm']), { neg: false, term: true }), B = rlf(r, 'd', { neg: false, max: 3 }), C = rlf(r, r.pick(['f', 'd']), { neg: false, max: 2, term: true });
      const tot = Fr.add(Fr.add(A.f, B.f), C.f);
      const p = r.name();
      return { q: T(`${p} buys $${shN(A, true)}$ ${c.u} of ${c.en}, $${shN(B, true)}$ ${c.u} more, and then another $${shN(C, true)}$ ${c.u}. What is the total amount, as a mixed number or fraction?`, `${p} membeli $${shN(A, true)}$ ${c.ums || c.u} ${c.ms}, $${shN(B, true)}$ ${c.ums || c.u} lagi, dan kemudian $${shN(C, true)}$ ${c.ums || c.u} lagi. Berapakah jumlah keseluruhan, sebagai nombor bercampur atau pecahan?`), a: T(`$${Fr.mixed(tot)}$ ${c.u}`, `$${Fr.mixed(tot)}$ ${c.ums || c.u}`), sp: 's' };
    },
    (r) => {
      const c = r.pick(CTX15);
      const A = rlf(r, r.pick(['f', 'm']), { neg: false, term: true }), k = r.int(2, 6), B = rlf(r, 'd', { neg: false, max: 2 });
      const used = Fr.mul(B.f, fr(k, 1));
      const left = Fr.sub(A.f, used);
      need(Fr.cmp(left, fr(0, 1)) > 0);
      return { q: T(`A shop has $${shN(A, true)}$ ${c.u} of ${c.en}. It sells ${k} packets, each containing $${shN(B, true)}$ ${c.u}. How much ${c.en} is left? Give the answer as a decimal if possible.`, `Sebuah kedai mempunyai $${shN(A, true)}$ ${c.ums || c.u} ${c.ms}. Kedai itu menjual ${k} bungkusan, setiap satu mengandungi $${shN(B, true)}$ ${c.ums || c.u}. Berapakah ${c.ms} yang tinggal? Berikan jawapan sebagai perpuluhan jika boleh.`), a: T(`$${tdec(left) ? dS(left) : Fr.mixed(left)}$ ${c.u}`, `$${tdec(left) ? dS(left) : Fr.mixed(left)}$ ${c.ums || c.u}`), sp: 's' };
    },
    (r) => {
      const price = dv(r.int(4, 20) * 5, 1), q = rlf(r, r.pick(['f', 'm']), { neg: false, term: true });
      const cost = Fr.mul(price, q.f);
      need(cost.d <= 100);
      const it = r.pick(SPM.bank.fruits);
      return { q: T(`${SPM.cap(it.en)} cost RM${dm(price)} per kilogram. How much do $${shN(q, true)}$ kg cost?`, `${SPM.cap(it.ms)} berharga RM${dm(price)} sekilogram. Berapakah harga $${shN(q, true)}$ kg?`), a: T(`RM${dm(cost)}`), sp: 's' };
    },
    (r) => {
      const t = rlf(r, r.pick(['d', 'm']), { neg: true, max: 4, term: true }), ch = rlf(r, r.pick(['f', 'd']), { neg: r.chance(), max: 3, term: true });
      const v = Fr.add(t.f, ch.f);
      const u = r.pick([[T('temperature', 'suhu'), '^\\circ$C'], [T('level (relative to sea level)', 'aras (berbanding aras laut)'), '$ m']]);
      return { q: T(`The ${u[0].en} was $${shN(t, true)}${u[1]}. It changes by $${shN(ch, true)}${u[1]}. What is the new value?`, `${SPM.cap(u[0].ms)} ialah $${shN(t, true)}${u[1]}. Ia berubah sebanyak $${shN(ch, true)}${u[1]}. Apakah nilai yang baharu?`), a: T(`$${Fr.mixed(v)}${u[1]}`), sp: 's' };
    },
    // missing values
    (r) => {
      const A = RS(r), B = RS(r);
      const op = r.pick(['+', '-', '*']);
      const v = evN(Bn(op, A, B));
      need(v.n !== 0);
      const form = r.int(0, 1);
      const lhs = form === 0 ? `\\square ${OPS[op]} ${shN(B, false)}` : `${shN(A, true)} ${OPS[op]} \\square`;
      const ans = form === 0 ? A : B;
      return { q: T(`Find the missing number: $${lhs} = ${Fr.mixed(v)}$`, `Cari nombor yang hilang: $${lhs} = ${Fr.mixed(v)}$`), a: T(`$${rShow(ans.f, ans.st)}$`), sp: 's' };
    },
  ];


  const PATRA = [
    (r) => Bn('*', Br(Bn('-', RS(r), RS(r))), Br(Bn('+', RS(r), RS(r)))),
    (r) => Bn('/', Br(Bn('-', RS(r), RS(r))), Br(Bn('+', RS(r), RS(r)))),
    (r) => Bn('-', RS(r), Bn('/', Br(Bn('+', RS(r), RS(r))), RS(r))),
    (r) => Bn('+', Bn('*', RS(r), RS(r)), Bn('/', RS(r), RS(r))),
    (r) => Bn('-', Bn('/', RS(r), RS(r)), Bn('*', RS(r), RS(r))),
    (r) => Bn('*', Br(Bn('+', RS(r), Bn('*', RS(r), RS(r)))), RS(r)),
    (r) => Bn('/', Br(Bn('-', RS(r), RS(r))), Bn('*', RS(r), RS(r))),
    (r) => Bn('-', Br(Bn('+', RS(r), RS(r))), Br(Bn('-', RS(r), RS(r)))),
    (r) => Bn('+', Br(Bn('*', RS(r), RS(r))), Bn('-', RS(r), RS(r))),
    (r) => Bn('/', Bn('+', RS(r), RS(r)), Bn('-', RS(r), RS(r))),
    (r) => Bn('-', Bn('*', RS(r), RS(r)), Bn('*', Br(Bn('+', RS(r), RS(r))), RS(r))),
    (r) => Bn('*', RS(r), Br(Bn('-', RS(r), Bn('/', RS(r), RS(r))))),
    (r) => Bn('+', Bn('/', Br(Bn('-', RS(r), RS(r))), RS(r)), RS(r)),
    (r) => Bn('/', Br(Bn('*', RS(r), RS(r))), Br(Bn('+', RS(r), RS(r)))),
  ];
  const a15 = [
    (r) => { const ss = r.sample(STR, 4); return { q: T(`Which of these statements about rational numbers are true? Give a reason for each.<br>${ss.map((x, i) => `(${'abcd'[i]}) ${x[0].en}`).join('<br>')}`, `Antara pernyataan tentang nombor nisbah ini, yang manakah benar? Berikan sebab bagi setiap satu.<br>${ss.map((x, i) => `(${'abcd'[i]}) ${x[0].ms}`).join('<br>')}`), a: T(ss.map((x, i) => `(${'abcd'[i]}) ${x[1] ? 'true' : 'false'}`).join(' ') + ' (with valid reasons)', ss.map((x, i) => `(${'abcd'[i]}) ${x[1] ? 'benar' : 'palsu'}`).join(' ') + ' (dengan sebab yang sah)'), sp: 'l' }; },
    (r) => { const { x, v } = rexpr(r, PATRA, undefined, 40); return { q: T(`Evaluate $${shN(x, true)}$.`, `Nilaikan $${shN(x, true)}$.`), a: T(`$${ansR(x, v)}$`), sp: 'm' }; },
    (r) => { const { x, v } = rexpr(r, PATRA, undefined, 40); return { q: T(`Show all the steps in evaluating $${shN(x, true)}$, and give the answer as a fraction in its simplest form.`, `Tunjukkan semua langkah dalam menilai $${shN(x, true)}$, dan berikan jawapan sebagai pecahan dalam bentuk termudah.`), a: T(`$${Fr.mixed(v)}$`), sp: 'l' }; },
    (r) => {
      const { x, v } = rexpr(r, PATRA, undefined, 40);
      const lo = Math.floor(Fr.val(v));
      return { q: T(`Evaluate $${shN(x, true)}$ and state the two consecutive integers between which the answer lies.`, `Nilaikan $${shN(x, true)}$ dan nyatakan dua integer berturutan yang mengapit jawapan itu.`), a: T(`$${ansR(x, v)}$; between $${lo}$ and $${lo + 1}$`, `$${ansR(x, v)}$; di antara $${lo}$ dengan $${lo + 1}$`), sp: 'm' };
    },
    (r) => {
      const { x, v } = rexpr(r, PATRA, undefined, 40);
      const { x: y, v: w } = rexpr(r, PATR);
      need(!Fr.eq(v, w));
      return { q: T(`Which is greater, $${shN(x, true)}$ or $${shN(y, true)}$? Show your calculations.`, `Yang manakah lebih besar, $${shN(x, true)}$ atau $${shN(y, true)}$? Tunjukkan pengiraan anda.`), a: T(`$${ansR(x, v)}$ and $${ansR(y, w)}$; $${Fr.cmp(v, w) > 0 ? shN(x, true) : shN(y, true)}$ is greater`, `$${ansR(x, v)}$ dan $${ansR(y, w)}$; $${Fr.cmp(v, w) > 0 ? shN(x, true) : shN(y, true)}$ lebih besar`), sp: 'l' };
    },
    (r) => {
      const price = dv(r.int(10, 60) * 100, 2), f1 = fr(1, r.pick([4, 5])), dis = dv(r.int(1, 5) * 100, 2);
      const step1 = Fr.mul(price, Fr.sub(fr(1, 1), f1));
      const step2 = Fr.sub(step1, dis);
      need(step2.n > 0 && step1.d <= 100);
      const it = r.pick(SPM.bank.items.filter((x) => x.lo >= 15));
      return { q: T(`A ${it.en1} costs RM${dm(price)}. During a sale the price is reduced by $${Fr.tex(f1)}$. A member card then gives a further RM${dm(dis)} off. What does a member pay?`, `Sebuah ${it.ms} berharga RM${dm(price)}. Semasa jualan, harganya dikurangkan sebanyak $${Fr.tex(f1)}$. Kad ahli kemudian memberikan potongan tambahan RM${dm(dis)}. Berapakah yang perlu dibayar oleh seorang ahli?`), a: T(`RM${dm(step2)}`), sp: 'm' };
    },
    (r) => {
      const d1 = rlf(r, 'm', { neg: false, term: true }), d2 = rlf(r, 'd', { neg: false, max: 4 });
      const tot = Fr.mul(Fr.add(d1.f, d2.f), fr(2, 1));
      const p = r.name();
      return { q: T(`${p} walks to school every morning: $${shN(d1, true)}$ km on a footpath and $${shN(d2, true)}$ km along a road, and returns home the same way. How far does ${p} walk each day? Give the answer as a decimal if possible.`, `${p} berjalan kaki ke sekolah setiap pagi: $${shN(d1, true)}$ km di atas lorong pejalan kaki dan $${shN(d2, true)}$ km di sepanjang jalan raya, dan pulang ke rumah melalui laluan yang sama. Berapakah jarak yang dijalani oleh ${p} setiap hari? Berikan jawapan sebagai perpuluhan jika boleh.`), a: T(`$${tdec(tot) ? dS(tot) : Fr.mixed(tot)}$ km`), sp: 'm' };
    },
    (r) => {
      const c = r.pick(CTX15);
      const cap = rlf(r, 'm', { neg: false, term: true }), part = rlf(r, 'd', { neg: false, max: 1 });
      need(Fr.val(part.f) < 1);
      const k = r.int(3, 8);
      const need1 = Fr.mul(part.f, fr(k, 1));
      const left = Fr.sub(cap.f, need1);
      return { q: T(`A container holds $${shN(cap, true)}$ ${c.u} of ${c.en}. Each portion uses $${shN(part, true)}$ ${c.u}. (a) How much ${c.en} is needed for ${k} portions? (b) Is there enough in the container? If so, how much is left over; if not, how much more is needed?`, `Sebuah bekas mengandungi $${shN(cap, true)}$ ${c.ums || c.u} ${c.ms}. Setiap bahagian menggunakan $${shN(part, true)}$ ${c.ums || c.u}. (a) Berapakah ${c.ms} yang diperlukan untuk ${k} bahagian? (b) Adakah ${c.ms} dalam bekas mencukupi? Jika ya, berapakah yang tinggal; jika tidak, berapakah tambahan yang diperlukan?`), a: T(`(a) $${tdec(need1) ? dS(need1) : Fr.mixed(need1)}$ ${c.u} (b) ${Fr.cmp(left, fr(0, 1)) >= 0 ? `enough; $${tdec(left) ? dS(left) : Fr.mixed(left)}$ ${c.u} left` : `not enough; $${tdec(left) ? dS(Fr.neg(left)) : Fr.mixed(Fr.neg(left))}$ ${c.u} more needed`}`, `(a) $${tdec(need1) ? dS(need1) : Fr.mixed(need1)}$ ${c.ums || c.u} (b) ${Fr.cmp(left, fr(0, 1)) >= 0 ? `mencukupi; baki $${tdec(left) ? dS(left) : Fr.mixed(left)}$ ${c.ums || c.u}` : `tidak mencukupi; perlu tambahan $${tdec(left) ? dS(Fr.neg(left)) : Fr.mixed(Fr.neg(left))}$ ${c.ums || c.u}`}`), sp: 'm' };
    },
    // reasoning and explanation
    (r) => {
      const c = r.pick([
        [T('Explain why every integer, every fraction and every terminating decimal is a rational number. Give one example of each.', 'Terangkan mengapa setiap integer, setiap pecahan dan setiap perpuluhan terhingga ialah nombor nisbah. Berikan satu contoh bagi setiap satu.'), T('Each can be written as $\\dfrac{a}{b}$ with integers $a$, $b$ and $b \\neq 0$: for example $5 = \\dfrac{5}{1}$, $\\dfrac{3}{4}$ is already in this form, and $0.35 = \\dfrac{35}{100} = \\dfrac{7}{20}$.', 'Setiap satu boleh ditulis sebagai $\\dfrac{a}{b}$ dengan $a$, $b$ integer dan $b \\neq 0$: contohnya $5 = \\dfrac{5}{1}$, $\\dfrac{3}{4}$ sudah dalam bentuk ini, dan $0.35 = \\dfrac{35}{100} = \\dfrac{7}{20}$.')],
        [T('A student says "$0.6$ is not a rational number because it is a decimal". Explain why the student is wrong.', 'Seorang murid berkata "$0.6$ bukan nombor nisbah kerana ia perpuluhan". Terangkan mengapa murid itu salah.'), T('$0.6 = \\dfrac{6}{10} = \\dfrac{3}{5}$, which has the form $\\dfrac{a}{b}$ with integers $a$ and $b$ ($b \\neq 0$), so it is a rational number.', '$0.6 = \\dfrac{6}{10} = \\dfrac{3}{5}$, yang berbentuk $\\dfrac{a}{b}$ dengan $a$ dan $b$ integer ($b \\neq 0$), jadi ia ialah nombor nisbah.')],
        [T('Explain why $\\dfrac{4}{0}$ is not a rational number, but $\\dfrac{0}{4}$ is.', 'Terangkan mengapa $\\dfrac{4}{0}$ bukan nombor nisbah, tetapi $\\dfrac{0}{4}$ ialah nombor nisbah.'), T('Division by zero is not defined, so the denominator cannot be $0$. But $\\dfrac{0}{4} = 0 = \\dfrac{0}{1}$ is a valid rational number.', 'Pembahagian dengan sifar tidak tertakrif, jadi penyebut tidak boleh $0$. Tetapi $\\dfrac{0}{4} = 0 = \\dfrac{0}{1}$ ialah nombor nisbah yang sah.')],
        [T('Give an example to show that the sum of two rational numbers written in different forms (a fraction and a decimal) is still a rational number.', 'Berikan satu contoh untuk menunjukkan bahawa hasil tambah dua nombor nisbah dalam bentuk yang berbeza (satu pecahan dan satu perpuluhan) masih ialah nombor nisbah.'), T('For example $\\dfrac{1}{3} + 0.5 = \\dfrac{1}{3} + \\dfrac{1}{2} = \\dfrac{5}{6}$, which is a fraction of integers.', 'Contohnya $\\dfrac{1}{3} + 0.5 = \\dfrac{1}{3} + \\dfrac{1}{2} = \\dfrac{5}{6}$, iaitu pecahan bagi integer.')],
      ]);
      return { q: c[0], a: c[1], sp: 'm' };
    },
    // puzzles
    (r) => {
      const A = rlf(r, 'f', { neg: false, term: true }), B = rlf(r, 'd', { neg: false, max: 2 });
      const p = Fr.mul(A.f, B.f), s = Fr.add(A.f, B.f);
      need(!Fr.eq(A.f, B.f));
      return { q: T(`Two rational numbers have a sum of $${Fr.mixed(s)}$ and a product of $${Fr.mixed(p)}$. One of them is $${shN(A, true)}$. Find the other and give it as a decimal.`, `Hasil tambah dua nombor nisbah ialah $${Fr.mixed(s)}$ dan hasil darabnya ialah $${Fr.mixed(p)}$. Salah satu daripadanya ialah $${shN(A, true)}$. Cari yang satu lagi dan berikan sebagai perpuluhan.`), a: T(`$${dS(B.f)}$`), w: T(`Other $= ${Fr.mixed(s)} - ${shN(A, true)}$`), sp: 'm' };
    },
    (r) => {
      const A = RS(r), B = RS(r), C = RS(r);
      const x = Bn('+', Bn('*', A, B), C);
      const v = evN(x);
      const y = Bn('*', A, Br(Bn('+', B, C)));
      const w = evN(y);
      need(!Fr.eq(v, w) && v.n !== 0 && w.n !== 0 && Math.abs(Fr.val(v)) < 30 && Math.abs(Fr.val(w)) < 30);
      return { q: T(`Evaluate both expressions and explain why their values are different. (a) $${shN(x, true)}$ (b) $${shN(y, true)}$`, `Nilaikan kedua-dua ungkapan dan terangkan mengapa nilainya berbeza. (a) $${shN(x, true)}$ (b) $${shN(y, true)}$`), a: T(`(a) $${ansR(x, v)}$ (b) $${ansR(y, w)}$; the brackets in (b) change the order of the operations.`, `(a) $${ansR(x, v)}$ (b) $${ansR(y, w)}$; kurungan dalam (b) mengubah tertib operasi.`), sp: 'l' };
    },
    (r) => {
      const ss = std(r, 2).concat(stf(r, 1));
      return { q: T(`Decide whether each statement is true or false. Give a reason for each.<br>${ss.map((s2, i) => `(${'abc'[i]}) ${s2.t.en}`).join('<br>')}`, `Tentukan sama ada setiap pernyataan benar atau palsu. Berikan sebab bagi setiap satu.<br>${ss.map((s2, i) => `(${'abc'[i]}) ${s2.t.ms}`).join('<br>')}`), a: T(ss.map((s2, i) => `(${'abc'[i]}) ${s2.ok ? 'True' : 'False'}`).join(' ') + ' (with valid reasons)', ss.map((s2, i) => `(${'abc'[i]}) ${s2.ok ? 'Benar' : 'Palsu'}`).join(' ') + ' (dengan sebab yang sah)'), sp: 'l' };
    },
    (r) => {
      const A = rlf(r, 'f', { term: true, neg: true, max: 2 }), B = rlf(r, 'd', { neg: true, max: 2 }), C = rlf(r, 'm', { neg: true, term: true });
      need(new Set([A, B, C].map((x) => Fr.tex(x.f))).size === 3);
      const all = [A, B, C];
      const asc = r.chance();
      const sorted = all.slice().sort((x, y) => (asc ? Fr.cmp(x.f, y.f) : Fr.cmp(y.f, x.f)));
      const mid = sorted[1];
      return { q: T(`Arrange $${all.map((x) => shN(x, true)).join(',\\ ')}$ in ${asW(asc).en}. Then find the number that lies exactly halfway between the smallest and the largest.`, `Susun $${all.map((x) => shN(x, true)).join(',\\ ')}$ dalam ${asW(asc).ms}. Kemudian cari nombor yang terletak tepat di tengah-tengah antara yang terkecil dengan yang terbesar.`), a: T(`$${sorted.map((x) => shN(x, true)).join(',\\ ')}$; halfway: $${Fr.mixed(Fr.div(Fr.add(sorted[0].f, sorted[2].f), fr(2, 1)))}$`), sp: 'm' };
    },
  ];

  SPM.extend('F1-1.5', { e: e15, m: m15, a: a15 });

  /* ===================================================================== */
  /* ---- F1-1.5E Extensions and contexts (recurring decimals; savings / budget contexts) */
  /* ===================================================================== */
  /* decimal expansion of n/d by long division; recurring part shown with a bar */
  function recur(f) {
    const neg = f.n < 0, n0 = Math.abs(f.n), d = f.d;
    let rem = n0 % d;
    const seen = new Map();
    let digs = '';
    while (rem && !seen.has(rem)) { seen.set(rem, digs.length); rem *= 10; digs += Math.floor(rem / d); rem %= d; need(digs.length < 9); }
    const ip = Math.floor(n0 / d), sg = neg ? '-' : '';
    if (!rem) return { tex: sg + ip + (digs ? '.' + digs : ''), rec: false, pre: digs.length, per: 0 };
    const at = seen.get(rem);
    return { tex: `${sg}${ip}.${digs.slice(0, at)}\\overline{${digs.slice(at)}}`, rec: true, pre: at, per: digs.length - at };
  }
  const RECD = [3, 6, 7, 9, 11, 12, 13, 15, 18, 22, 33];         // denominators giving recurring decimals
  const recFrac = (r, o) => { o = o || {}; const d = r.pick(o.small ? [3, 6, 9, 11] : RECD), nu = r.int(1, d - 1); need(gcd(nu, d) === 1); const f = fr(nu, d); const x = recur(f); need(x.rec && x.per <= (o.maxPer || 2)); return { f, x }; };
  const workRec = (f, x) => {
    const p10 = (k) => Math.pow(10, k), big = p10(x.pre + x.per), small = p10(x.pre);
    const N = Fr.mul(Fr.sub(fr(big, 1), fr(small, 1)), f);
    return T(`Let $x = ${x.tex}$. Then $${big}x - ${small}x = ${N.n}$, so $x = \\dfrac{${N.n}}{${big - small}} = ${Fr.tex(f)}$.`, `Katakan $x = ${x.tex}$. Maka $${big}x - ${small}x = ${N.n}$, jadi $x = \\dfrac{${N.n}}{${big - small}} = ${Fr.tex(f)}$.`);
  };
  const GOALS = [
    [T('a bicycle', 'sebuah basikal'), 320], [T('a school trip', 'lawatan sekolah'), 180], [T('a new phone', 'sebuah telefon baharu'), 900], [T('a pair of sports shoes', 'sepasang kasut sukan'), 240],
    [T('a laptop', 'sebuah komputer riba'), 1800], [T('Hari Raya clothes', 'baju raya'), 450], [T('a badminton racket', 'sebuah raket badminton'), 210], [T('a camera', 'sebuah kamera'), 600],
    [T('a guitar', 'sebuah gitar'), 380], [T('a school uniform set', 'sepasang pakaian seragam sekolah'), 150], [T('a tablet', 'sebuah tablet'), 750], [T('a tent for camping', 'sebuah khemah perkhemahan'), 280],
    [T('a football', 'sebiji bola sepak'), 90], [T('an electric fan', 'sebuah kipas elektrik'), 130], [T('a tour to Langkawi', 'lawatan ke Langkawi'), 520], [T('a drawing set', 'satu set alat lukisan'), 110],
  ];
  const LABS = [[T('rent', 'sewa'), 'r'], [T('food', 'makanan'), 'f'], [T('transport', 'pengangkutan'), 't'], [T('electricity and water', 'elektrik dan air'), 'e'], [T('school fees', 'yuran sekolah'), 's'], [T('phone bills', 'bil telefon'), 'p'], [T('medical costs', 'kos perubatan'), 'm'], [T('donations', 'derma'), 'd']];
  const svFor = (r, cost) => Math.max(10, Math.round(cost / r.int(4, 10) / 5) * 5);
  const INC = [[T('part-time job', 'kerja sambilan'), 'monthly'], [T('pocket money', 'wang saku'), 'monthly']];

  const STE = [
        [T('The decimal $0.\\overline{3}$ never ends.', 'Perpuluhan $0.\\overline{3}$ tidak pernah berakhir.'), true, T('The digit $3$ repeats forever.', 'Digit $3$ berulang selama-lamanya.')],
        [T('$0.\\overline{3}$ is a rational number.', '$0.\\overline{3}$ ialah nombor nisbah.'), true, T('$0.\\overline{3} = \\dfrac{1}{3}$.', '$0.\\overline{3} = \\dfrac{1}{3}$.')],
        [T('$0.\\overline{6} = \\dfrac{2}{3}$.', '$0.\\overline{6} = \\dfrac{2}{3}$.'), true, T('$10x - x = 6$ gives $x = \\dfrac{6}{9} = \\dfrac{2}{3}$.', '$10x - x = 6$ memberikan $x = \\dfrac{6}{9} = \\dfrac{2}{3}$.')],
        [T('$0.\\overline{5} = 0.5$.', '$0.\\overline{5} = 0.5$.'), false, T('$0.\\overline{5} = 0.5555\\ldots$, which is greater than $0.5$.', '$0.\\overline{5} = 0.5555\\ldots$, iaitu lebih besar daripada $0.5$.')],
        [T('$\\dfrac{1}{4}$ is a recurring decimal.', '$\\dfrac{1}{4}$ ialah perpuluhan jadi semula.'), false, T('$\\dfrac{1}{4} = 0.25$ terminates.', '$\\dfrac{1}{4} = 0.25$ berakhir.')],
        [T('$0.33 = \\dfrac{1}{3}$.', '$0.33 = \\dfrac{1}{3}$.'), false, T('$0.33 = \\dfrac{33}{100}$, which is not exactly $\\dfrac{1}{3}$.', '$0.33 = \\dfrac{33}{100}$, yang tidak tepat sama dengan $\\dfrac{1}{3}$.')],
        [T('$0.\\overline{9} = 1$.', '$0.\\overline{9} = 1$.'), true, T('$10x - x = 9$ gives $x = 1$.', '$10x - x = 9$ memberikan $x = 1$.')],
        [T('$\\dfrac{1}{9} = 0.\\overline{1}$.', '$\\dfrac{1}{9} = 0.\\overline{1}$.'), true, T('$10x - x = 1$ gives $x = \\dfrac{1}{9}$.', '$10x - x = 1$ memberikan $x = \\dfrac{1}{9}$.')],
        [T('Every fraction gives a recurring decimal.', 'Setiap pecahan memberikan perpuluhan jadi semula.'), false, T('$\\dfrac{1}{2} = 0.5$ terminates.', '$\\dfrac{1}{2} = 0.5$ berakhir.')],
        [T('$0.\\overline{12} = \\dfrac{12}{99}$.', '$0.\\overline{12} = \\dfrac{12}{99}$.'), true, T('$100x - x = 12$.', '$100x - x = 12$.')],
        [T('$0.\\overline{7}$ is less than $0.8$.', '$0.\\overline{7}$ kurang daripada $0.8$.'), true, T('$0.7777\\ldots < 0.8000\\ldots$.', '$0.7777\\ldots < 0.8000\\ldots$.')],
        [T('A recurring decimal is not a rational number.', 'Perpuluhan jadi semula bukan nombor nisbah.'), false, T('It can be written as a fraction such as $0.\\overline{3} = \\dfrac{1}{3}$.', 'Ia boleh ditulis sebagai pecahan seperti $0.\\overline{3} = \\dfrac{1}{3}$.')],
        [T('$\\dfrac{5}{6}$ is a terminating decimal.', '$\\dfrac{5}{6}$ ialah perpuluhan terhingga.'), false, T('$\\dfrac{5}{6} = 0.8\\overline{3}$ recurs.', '$\\dfrac{5}{6} = 0.8\\overline{3}$ berulang.')],
        [T('$\\dfrac{3}{20}$ is a terminating decimal.', '$\\dfrac{3}{20}$ ialah perpuluhan terhingga.'), true, T('$\\dfrac{3}{20} = 0.15$.', '$\\dfrac{3}{20} = 0.15$.')],
  ];
  const e15E = [
    (r) => { const { f, x } = recFrac(r, { small: true, maxPer: 1 }); return { q: T(`Write $${Fr.tex(f)}$ as a decimal. Use a bar over the digits that repeat.`, `Tulis $${Fr.tex(f)}$ sebagai perpuluhan. Gunakan garis atas pada digit yang berulang.`), a: T(`$${x.tex}$`), sp: 's' }; },
    (r) => { const { f, x } = recFrac(r, { maxPer: 2 }); return { q: T(`Use long division to write $${Fr.tex(f)}$ as a recurring decimal.`, `Gunakan pembahagian panjang untuk menulis $${Fr.tex(f)}$ sebagai perpuluhan jadi semula.`), a: T(`$${x.tex}$`), sp: 'm' }; },
    (r) => { const c = r.pick(STE); return { q: T(`True or false? ${c[0].en} Give a reason.`, `Benar atau palsu? ${c[0].ms} Berikan sebab.`), a: T(`${c[1] ? 'True' : 'False'}. ${c[2].en}`, `${c[1] ? 'Benar' : 'Palsu'}. ${c[2].ms}`), sp: 's' }; },
    (r) => { const ss = r.sample(STE, 3); return { q: T(`Which of these statements are true?<br>${ss.map((x, i) => `(${'abc'[i]}) ${x[0].en}`).join('<br>')}`, `Antara pernyataan berikut, yang manakah benar?<br>${ss.map((x, i) => `(${'abc'[i]}) ${x[0].ms}`).join('<br>')}`), a: T(ss.map((x, i) => `(${'abc'[i]}) ${x[1] ? 'true' : 'false'}`).join(', '), ss.map((x, i) => `(${'abc'[i]}) ${x[1] ? 'benar' : 'palsu'}`).join(', ')), sp: 's' }; },
    (r) => { const [g, cost] = r.pick(GOALS), have = r.int(1, 8) * 10; need(cost > have); return { q: T(`${r.name()} wants ${g.en} that costs RM${cost} and has saved RM${have}. How much more is needed?`, `Seorang murid mahu ${g.ms} yang berharga RM${cost} dan telah menyimpan RM${have}. Berapakah lagi yang diperlukan?`), a: T(`RM${cost - have}`), sp: 'xs' }; },
    (r) => { const l = r.sample(LABS, 2).map((x) => x[0]), a = r.int(2, 9) * 50, b = r.int(2, 9) * 30; return { q: T(`A family spends RM${a} on ${l[0].en} and RM${b} on ${l[1].en} in a month. What is the total spent?`, `Sebuah keluarga membelanjakan RM${a} untuk ${l[0].ms} dan RM${b} untuk ${l[1].ms} dalam sebulan. Berapakah jumlah perbelanjaan?`), a: T(`RM${a + b}`), sp: 'xs' }; },
    (r) => {
      const [g, cost] = r.pick(GOALS), m = r.int(3, 8), sv = svFor(r, cost);
      const p = r.name();
      return { q: T(`${p} saves RM${sv} each month to buy ${g.en}. How much has ${p} saved after ${m} months?`, `${p} menyimpan RM${sv} setiap bulan untuk membeli ${g.ms}. Berapakah simpanan ${p} selepas ${m} bulan?`), a: T(`RM${sv * m}`), sp: 'xs' };
    },
    (r) => {
      const [g, cost] = r.pick(GOALS), sv = svFor(r, cost), have = r.int(1, 3) * 20;
      need(cost > have);
      const m = Math.ceil((cost - have) / sv);
      need(m >= 2);
      return { q: T(`${g.en.replace(/^a /, 'A ')} costs RM${cost}. ${r.name()} already has RM${have} and saves RM${sv} each month. What is the least number of whole months needed to have enough money?`, `${SPM.cap(g.ms)} berharga RM${cost}. Simpanan awal ialah RM${have} dan RM${sv} disimpan setiap bulan. Apakah bilangan bulan penuh yang paling sedikit supaya wang mencukupi?`), a: T(`${m} months`, `${m} bulan`), w: T(`$(${cost} - ${have}) \\div ${sv} = ${dS(fr(cost - have, sv))}$`), sp: 's' };
    },
    (r) => {
      const inc = r.int(4, 12) * 100, f = r.pick([fr(1, 2), fr(1, 4), fr(1, 5), fr(3, 10)]);
      const part = Fr.mul(f, fr(inc, 1));
      const [h] = r.pick(INC);
      const p = r.name();
      return { q: T(`${p} earns RM${inc} a month from a ${h.en}. ${p} saves $${frT(f)}$ of it. How much does ${p} save in a month?`, `${p} memperoleh RM${inc} sebulan daripada ${h.ms}. ${p} menyimpan $${frT(f)}$ daripadanya. Berapakah simpanan ${p} sebulan?`), a: T(`RM${part.n}`), sp: 'xs' };
    },
  ];
  const m15E = [
    (r) => { const ss = r.sample(STE, 3); return { q: T(`Decide whether each statement is true or false. Correct each false statement.<br>${ss.map((x, i) => `(${'abc'[i]}) ${x[0].en}`).join('<br>')}`, `Tentukan sama ada setiap pernyataan benar atau palsu. Betulkan setiap pernyataan yang palsu.<br>${ss.map((x, i) => `(${'abc'[i]}) ${x[0].ms}`).join('<br>')}`), a: T(ss.map((x, i) => `(${'abc'[i]}) ${x[1] ? 'true' : 'false: ' + x[2].en.replace(/\$/g, '')}`).join('; '), ss.map((x, i) => `(${'abc'[i]}) ${x[1] ? 'benar' : 'palsu: ' + x[2].ms.replace(/\$/g, '')}`).join('; ')), sp: 'm' }; },
    (r) => { const [g, cost] = r.pick(GOALS), dep = r.int(1, 4) * 20, mo = r.int(3, 8); const pay = Math.ceil((cost - dep) / mo); return { q: T(`${g.en.replace(/^a /, 'A ')} costs RM${cost}. ${r.name()} pays a deposit of RM${dep} and the rest in ${mo} equal monthly payments, rounded up to the next ringgit. How much is each payment?`, `${SPM.cap(g.ms)} berharga RM${cost}. Bayaran pendahuluan RM${dep} dibuat dan bakinya dibayar dalam ${mo} ansuran bulanan yang sama, dibundarkan ke ringgit seterusnya. Berapakah setiap ansuran?`), a: T(`RM${pay}`), w: T(`$(${cost} - ${dep}) \\div ${mo}$ rounded up`, `$(${cost} - ${dep}) \\div ${mo}$ dibundarkan ke atas`), sp: 's' }; },
    (r) => { const { f, x } = recFrac(r, { maxPer: 2 }); need(x.pre === 0); return { q: T(`Express $${x.tex}$ as a fraction in its simplest form.`, `Ungkapkan $${x.tex}$ sebagai pecahan dalam bentuk termudah.`), a: T(`$${Fr.tex(f)}$`), w: workRec(f, x), sp: 'm' }; },
    (r) => { const { f, x } = recFrac(r, { maxPer: 2 }); need(x.pre >= 1); return { q: T(`Express $${x.tex}$ as a fraction in its simplest form.`, `Ungkapkan $${x.tex}$ sebagai pecahan dalam bentuk termudah.`), a: T(`$${Fr.tex(f)}$`), w: workRec(f, x), sp: 'm' }; },
    (r) => { const { f, x } = recFrac(r, { small: true, maxPer: 1 }); const w = r.int(1, 5); const F = Fr.add(fr(w, 1), f); const y = recur(F); return { q: T(`Write $${y.tex}$ as a mixed number.`, `Tulis $${y.tex}$ sebagai nombor bercampur.`), a: T(`$${Fr.mixed(F)}$`), sp: 'm' }; },
    (r) => { const a = recFrac(r, { small: true, maxPer: 1 }), k = r.int(2, 9); const v = Fr.mul(a.f, fr(k, 1)); return { q: T(`Evaluate $${a.x.tex} \\times ${k}$ by writing $${a.x.tex}$ as a fraction first.`, `Nilaikan $${a.x.tex} \\times ${k}$ dengan menulis $${a.x.tex}$ sebagai pecahan dahulu.`), a: T(`$${Fr.mixed(v)}$`), sp: 'm' }; },
    (r) => {
      const v = []; while (v.length < 3) { const x = recFrac(r, { small: true, maxPer: 1 }); if (!v.some((y) => Fr.eq(y.f, x.f))) v.push(x); }
      const asc = r.chance();
      const s2 = v.slice().sort((x, y) => (asc ? Fr.cmp(x.f, y.f) : Fr.cmp(y.f, x.f)));
      return { q: T(`Arrange $${v.map((x) => x.x.tex).join(',\\ ')}$ in ${asW(asc).en}.`, `Susun $${v.map((x) => x.x.tex).join(',\\ ')}$ dalam ${asW(asc).ms}.`), a: T(`$${s2.map((x) => x.x.tex).join(',\\ ')}$`), sp: 's' };
    },
    (r) => {
      const [g, cost] = r.pick(GOALS), sv = svFor(r, cost), mo = r.int(3, 6), extra = r.int(1, 5) * 10;
      const tot = sv * mo + extra;
      const p = r.name();
      return { q: T(`${p} saves RM${sv} a month for ${mo} months and receives RM${extra} as a gift. ${p} wants to buy ${g.en} that costs RM${cost}. How much more money is needed, or how much is left over?`, `${p} menyimpan RM${sv} sebulan selama ${mo} bulan dan menerima RM${extra} sebagai hadiah. ${p} mahu membeli ${g.ms} yang berharga RM${cost}. Berapakah lagi wang yang diperlukan, atau berapakah baki wang?`), a: T(tot >= cost ? `RM${tot - cost} left over` : `RM${cost - tot} more needed`, tot >= cost ? `Baki RM${tot - cost}` : `Perlu RM${cost - tot} lagi`), sp: 's' };
    },
    (r) => {
      const inc = r.int(6, 20) * 100, fs = r.pick([[fr(1, 2), fr(1, 5), fr(1, 10)], [fr(2, 5), fr(1, 4), fr(1, 10)], [fr(1, 4), fr(1, 4), fr(1, 5)]]);
      const [a, b, c] = fs.map((f) => Fr.mul(f, fr(inc, 1)));
      need(a.d === 1 && b.d === 1 && c.d === 1);
      const left = inc - a.n - b.n - c.n;
      const labs = r.sample(LABS, 3).map((x) => x[0]);
      return { q: T(`A family's monthly budget is RM${inc}. They spend $${frT(fs[0])}$ on ${labs[0].en}, $${frT(fs[1])}$ on ${labs[1].en} and $${frT(fs[2])}$ on ${labs[2].en}. How much is left to save?`, `Bajet bulanan sebuah keluarga ialah RM${inc}. Mereka membelanjakan $${frT(fs[0])}$ untuk ${labs[0].ms}, $${frT(fs[1])}$ untuk ${labs[1].ms} dan $${frT(fs[2])}$ untuk ${labs[2].ms}. Berapakah baki yang boleh disimpan?`), a: T(`RM${left}`), sp: 's' };
    },
  ];
  const a15E = [
    (r) => { const ss = r.sample(STE, 3); return { q: T(`Decide whether each statement is true or false and give a short reason using a fraction or a decimal calculation.<br>${ss.map((x, i) => `(${'abc'[i]}) ${x[0].en}`).join('<br>')}`, `Tentukan sama ada setiap pernyataan benar atau palsu dan berikan sebab ringkas menggunakan pengiraan pecahan atau perpuluhan.<br>${ss.map((x, i) => `(${'abc'[i]}) ${x[0].ms}`).join('<br>')}`), a: T(ss.map((x, i) => `(${'abc'[i]}) ${x[1] ? 'true' : 'false'}`).join(' ') + ' (with valid reasons)', ss.map((x, i) => `(${'abc'[i]}) ${x[1] ? 'benar' : 'palsu'}`).join(' ') + ' (dengan sebab yang sah)'), sp: 'l' }; },
    (r) => { const [g1, c1] = r.pick(GOALS), [g2, c2] = r.pick(GOALS); need(g1.en !== g2.en); const sv = Math.max(20, svFor(r, c1)); const t1 = Math.ceil(c1 / sv), t2 = Math.ceil((c1 + c2) / sv); return { q: T(`${r.name()} saves RM${sv} a month. First ${r.name().length ? 'the goal is' : ''} ${g1.en} (RM${c1}), and afterwards ${g2.en} (RM${c2}). After how many whole months can the first goal be bought, and after how many months in total can both be bought?`.replace(/First .*? \(RM/, `The first goal is ${g1.en} (RM`), `RM${sv} disimpan sebulan. Sasaran pertama ialah ${g1.ms} (RM${c1}), kemudian ${g2.ms} (RM${c2}). Selepas berapa bulan penuh sasaran pertama dapat dibeli, dan selepas berapa bulan kesemuanya kedua-dua dapat dibeli?`), a: T(`${t1} months; ${t2} months in total`, `${t1} bulan; ${t2} bulan kesemuanya`), sp: 'm' }; },
    (r) => { const { f, x } = recFrac(r, { maxPer: 3 }); return { q: T(`Express $${x.tex}$ as a fraction in its simplest form, showing your working.`, `Ungkapkan $${x.tex}$ sebagai pecahan dalam bentuk termudah, dengan menunjukkan langkah kerja anda.`), a: T(`$${Fr.tex(f)}$`), w: workRec(f, x), sp: 'm' }; },
    (r) => { const { f, x } = recFrac(r, { maxPer: 2 }); const w = r.int(1, 9); const F = Fr.add(fr(w, 1), f); const y = recur(F); return { q: T(`Express $${y.tex}$ as an improper fraction in its simplest form.`, `Ungkapkan $${y.tex}$ sebagai pecahan tak wajar dalam bentuk termudah.`), a: T(`$${Fr.tex(F)}$`), sp: 'm' }; },
    (r) => { const { f, x } = recFrac(r, { small: true, maxPer: 1 }); const k = r.pick([3, 6, 9]); const v = Fr.mul(f, fr(k, 1)); return { q: T(`Express $${x.tex}$ as a fraction, and hence find $${x.tex} \\times ${k}$ as a decimal (with a bar if it recurs) and as a fraction.`, `Ungkapkan $${x.tex}$ sebagai pecahan, dan seterusnya cari $${x.tex} \\times ${k}$ sebagai perpuluhan (dengan garis atas jika berulang) dan sebagai pecahan.`), a: T(`$${Fr.tex(f)}$; $${recur(v).rec ? recur(v).tex + ' = ' : ''}${Fr.mixed(v)}$`), sp: 'm' }; },
    (r) => { const a = recFrac(r, { small: true, maxPer: 1 }), b = recFrac(r, { small: true, maxPer: 1 }); need(!Fr.eq(a.f, b.f)); const p = Fr.mul(a.f, b.f), s = Fr.sub(a.f, b.f); return { q: T(`Given $x = ${a.x.tex}$ and $y = ${b.x.tex}$, find (a) $x - y$, (b) $x \\times y$, each as a fraction in its simplest form.`, `Diberi $x = ${a.x.tex}$ dan $y = ${b.x.tex}$, cari (a) $x - y$, (b) $x \\times y$, masing-masing sebagai pecahan dalam bentuk termudah.`), a: T(`(a) $${Fr.mixed(s)}$ (b) $${Fr.mixed(p)}$`), sp: 'm' }; },
    (r) => {
      const [g, cost] = r.pick(GOALS), f = r.pick([fr(1, 3), fr(2, 3), fr(1, 6), fr(5, 6)]), inc = r.int(3, 9) * 60;
      const part = Fr.mul(f, fr(inc, 1));
      const p = r.name();
      return { q: T(`${p} earns RM${inc} a month and saves $${recur(f).tex}$ of it (a recurring decimal). (a) Write $${recur(f).tex}$ as a fraction. (b) How much does ${p} save each month? (c) How many whole months are needed to save at least RM${cost} for ${g.en}?`, `${p} memperoleh RM${inc} sebulan dan menyimpan $${recur(f).tex}$ daripadanya (perpuluhan jadi semula). (a) Tulis $${recur(f).tex}$ sebagai pecahan. (b) Berapakah simpanan ${p} setiap bulan? (c) Berapa bulan penuh diperlukan untuk menyimpan sekurang-kurangnya RM${cost} bagi ${g.ms}?`), a: T(`(a) $${Fr.tex(f)}$ (b) RM${part.n} (c) ${Math.ceil(cost / part.n)} months`, `(a) $${Fr.tex(f)}$ (b) RM${part.n} (c) ${Math.ceil(cost / part.n)} bulan`), sp: 'm' };
    },
    (r) => {
      const inc = r.int(8, 25) * 100, fs = r.pick([[fr(1, 3), fr(1, 4), fr(1, 6)], [fr(1, 3), fr(1, 3), fr(1, 12)], [fr(1, 2), fr(1, 6), fr(1, 12)]]);
      const amt = fs.map((f) => Fr.mul(f, fr(inc, 1)));
      need(amt.every((x) => x.d === 1));
      const left = inc - amt.reduce((x, y) => x + y.n, 0);
      const lb = r.sample(LABS, 3).map((x) => x[0]);
      return { q: T(`A budget of RM${inc} is split: $${fs.map((f) => recur(f).tex).join('$, $')}$ of it for ${lb[0].en}, ${lb[1].en} and ${lb[2].en} (in that order). (a) Write each as a fraction. (b) How much is spent on each? (c) What amount remains?`, `Bajet RM${inc} dibahagikan: $${fs.map((f) => recur(f).tex).join('$, $')}$ daripadanya untuk ${lb[0].ms}, ${lb[1].ms} dan ${lb[2].ms} (mengikut tertib itu). (a) Tulis setiap satu sebagai pecahan. (b) Berapakah yang dibelanjakan untuk setiap satu? (c) Berapakah baki?`), a: T(`(a) $${fs.map(frT).join(',\\ ')}$ (b) RM${amt.map((x) => x.n).join(', RM')} (c) RM${left}`), sp: 'm' };
    },
    (r) => {
      const [g, cost] = r.pick(GOALS), a = svFor(r, cost), b = svFor(r, cost);
      const p = r.name();
      const m1 = Math.ceil(cost / a), m2 = Math.ceil(cost / b);
      need(m1 !== m2);
      return { q: T(`${p} can save RM${a} a month, and ${r.name()} can save RM${b} a month, to buy ${g.en} costing RM${cost}. How many whole months does each need, and who reaches the goal first?`, `${p} boleh menyimpan RM${a} sebulan, dan seorang lagi boleh menyimpan RM${b} sebulan, untuk membeli ${g.ms} berharga RM${cost}. Berapa bulan penuh yang diperlukan oleh setiap orang, dan siapakah yang mencapai sasaran dahulu?`), a: T(`${m1} months and ${m2} months; the one saving RM${Math.max(a, b)} a month is first`, `${m1} bulan dan ${m2} bulan; yang menyimpan RM${Math.max(a, b)} sebulan mencapai dahulu`), sp: 'm' };
    },
  ];

  SPM.extend('F1-1.5E', { e: e15E, m: m15E, a: a15E });
  /*__END__*/
})();
