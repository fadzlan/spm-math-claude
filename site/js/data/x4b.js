/* Variety pack x4b: extra generators for F4-3.1, F4-3.2 (Logical Reasoning) and F4-4.1..4.3 (Operations on Sets). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { need, retry, isPrime, sum } = SPM;
  const T = SPM.L;
  const S = SPM.svg;

  /* =========================================================================================== F4-3.1 Statements */
  // bilingual math-fact statements: s = the statement, v = truth value, neg = its negation
  const STM = [
    { s: T('17 is a prime number.', '17 ialah nombor perdana.'), v: true, neg: T('17 is not a prime number.', '17 bukan nombor perdana.'), why: T('Its only factors are 1 and 17.', 'Faktornya hanya 1 dan 17.') },
    { s: T('24 is a multiple of 5.', '24 ialah gandaan 5.'), v: false, neg: T('24 is not a multiple of 5.', '24 bukan gandaan 5.'), why: T('$24 \\div 5 = 4.8$ is not a whole number.', '$24 \\div 5 = 4.8$ bukan nombor bulat.') },
    { s: T('A square has four equal sides.', 'Segi empat sama mempunyai empat sisi yang sama panjang.'), v: true, neg: T('A square does not have four equal sides.', 'Segi empat sama tidak mempunyai empat sisi yang sama panjang.'), why: T('By definition, all four sides of a square are equal.', 'Mengikut takrif, keempat-empat sisi segi empat sama adalah sama panjang.') },
    { s: T('A pentagon has four sides.', 'Pentagon mempunyai empat sisi.'), v: false, neg: T('A pentagon does not have four sides.', 'Pentagon tidak mempunyai empat sisi.'), why: T('A pentagon has five sides.', 'Pentagon mempunyai lima sisi.') },
    { s: T('The sum of the interior angles of a triangle is $180°$.', 'Hasil tambah sudut pedalaman sebuah segi tiga ialah $180°$.'), v: true, neg: T('The sum of the interior angles of a triangle is not $180°$.', 'Hasil tambah sudut pedalaman sebuah segi tiga bukan $180°$.'), why: T('This is the angle sum of a triangle.', 'Ini ialah hasil tambah sudut bagi segi tiga.') },
    { s: T('All prime numbers are odd.', 'Semua nombor perdana ialah nombor ganjil.'), v: false, neg: T('Not all prime numbers are odd.', 'Bukan semua nombor perdana ialah nombor ganjil.'), why: T('2 is a prime number but it is even.', '2 ialah nombor perdana tetapi ia genap.') },
    { s: T('A rhombus has all four sides equal.', 'Sebuah rombus mempunyai keempat-empat sisi yang sama panjang.'), v: true, neg: T('A rhombus does not have all four sides equal.', 'Sebuah rombus tidak mempunyai keempat-empat sisi yang sama panjang.'), why: T('By definition, a rhombus has four equal sides.', 'Mengikut takrif, rombus mempunyai empat sisi yang sama panjang.') },
    { s: T('$\\sqrt{64} = 8$.', '$\\sqrt{64} = 8$.'), v: true, neg: T('$\\sqrt{64} \\neq 8$.', '$\\sqrt{64} \\neq 8$.'), why: T('$8^2 = 64$.', '$8^2 = 64$.') },
    { s: T('Every multiple of 4 is also a multiple of 8.', 'Setiap gandaan 4 juga ialah gandaan 8.'), v: false, neg: T('Not every multiple of 4 is a multiple of 8.', 'Bukan setiap gandaan 4 ialah gandaan 8.'), why: T('12 is a multiple of 4 but not of 8.', '12 ialah gandaan 4 tetapi bukan gandaan 8.') },
    { s: T('The product of two negative numbers is positive.', 'Hasil darab dua nombor negatif ialah positif.'), v: true, neg: T('The product of two negative numbers is not positive.', 'Hasil darab dua nombor negatif bukan positif.'), why: T('For example, $(-2) \\times (-3) = 6$.', 'Contohnya, $(-2) \\times (-3) = 6$.') },
    { s: T('A right angle measures $90°$.', 'Sudut tegak bersudut $90°$.'), v: true, neg: T('A right angle does not measure $90°$.', 'Sudut tegak tidak bersudut $90°$.'), why: T('A right angle is defined as $90°$.', 'Sudut tegak ditakrifkan sebagai $90°$.') },
    { s: T('The diagonals of a rectangle are equal in length.', 'Pepenjuru segi empat tepat sama panjang.'), v: true, neg: T('The diagonals of a rectangle are not equal in length.', 'Pepenjuru segi empat tepat tidak sama panjang.'), why: T('This is a property of every rectangle.', 'Ini ialah sifat setiap segi empat tepat.') },
    { s: T('$(-3)^2 = -9$.', '$(-3)^2 = -9$.'), v: false, neg: T('$(-3)^2 \\neq -9$.', '$(-3)^2 \\neq -9$.'), why: T('$(-3)^2 = (-3) \\times (-3) = 9$.', '$(-3)^2 = (-3) \\times (-3) = 9$.') },
    { s: T('$10\\%$ of $250$ is $25$.', '$10\\%$ daripada $250$ ialah $25$.'), v: true, neg: T('$10\\%$ of $250$ is not $25$.', '$10\\%$ daripada $250$ bukan $25$.'), why: T('$\\dfrac{10}{100} \\times 250 = 25$.', '$\\dfrac{10}{100} \\times 250 = 25$.') },
    { s: T('An obtuse angle is less than $90°$.', 'Sudut cakah kurang daripada $90°$.'), v: false, neg: T('An obtuse angle is not less than $90°$.', 'Sudut cakah tidak kurang daripada $90°$.'), why: T('An obtuse angle is between $90°$ and $180°$.', 'Sudut cakah adalah antara $90°$ dan $180°$.') },
    { s: T('A kilometre is longer than a metre.', 'Satu kilometer lebih panjang daripada satu meter.'), v: true, neg: T('A kilometre is not longer than a metre.', 'Satu kilometer tidak lebih panjang daripada satu meter.'), why: T('$1\\text{ km} = 1000\\text{ m}$.', '$1\\text{ km} = 1000\\text{ m}$.') },
    { s: T('$2^{-1} = -2$.', '$2^{-1} = -2$.'), v: false, neg: T('$2^{-1} \\neq -2$.', '$2^{-1} \\neq -2$.'), why: T('$2^{-1} = \\dfrac{1}{2}$.', '$2^{-1} = \\dfrac{1}{2}$.') },
    { s: T('Every square is a rectangle.', 'Setiap segi empat sama ialah segi empat tepat.'), v: true, neg: T('Not every square is a rectangle.', 'Bukan setiap segi empat sama ialah segi empat tepat.'), why: T('A square has four right angles, so it is a rectangle.', 'Segi empat sama mempunyai empat sudut tegak, jadi ia ialah segi empat tepat.') },
  ];
  const NON = [
    { s: T('What is the value of $x$?', 'Apakah nilai $x$?'), kind: T('a question', 'satu soalan') },
    { s: T('Solve the equation $2x = 10$.', 'Selesaikan persamaan $2x = 10$.'), kind: T('a command', 'satu arahan') },
    { s: T('Well done, you solved it!', 'Syabas, awak berjaya menyelesaikannya!'), kind: T('an exclamation', 'satu seruan') },
    { s: T('Malaysia is a beautiful country.', 'Malaysia ialah sebuah negara yang indah.'), kind: T('an opinion', 'satu pendapat') },
    { s: T('Please submit your homework by Friday.', 'Sila hantar kerja rumah anda menjelang Jumaat.'), kind: T('a command', 'satu arahan') },
    { s: T('How many sides does a hexagon have?', 'Berapakah bilangan sisi sebuah heksagon?'), kind: T('a question', 'satu soalan') },
    { s: T('Mathematics is the most difficult subject.', 'Matematik ialah subjek yang paling sukar.'), kind: T('an opinion', 'satu pendapat') },
    { s: T('Is $15$ divisible by $3$?', 'Adakah $15$ boleh dibahagi tepat dengan $3$?'), kind: T('a question', 'satu soalan') },
    { s: T('Round off $3.567$ to two decimal places.', 'Bundarkan $3.567$ kepada dua tempat perpuluhan.'), kind: T('a command', 'satu arahan') },
    { s: T('What a difficult question!', 'Alangkah sukarnya soalan ini!'), kind: T('an exclamation', 'satu seruan') },
  ];
  const W = SPM.lines;
  const tf = (b) => (b ? 'true' : 'false'), tfm = (b) => (b ? 'betul' : 'salah');
  const STM_DEF = T('A statement is a sentence that is either true or false, but not both.', 'Pernyataan ialah ayat yang sama ada betul atau salah, tetapi bukan kedua-duanya.');
  const NEG_TV = T('A negation always has the opposite truth value of the original statement.', 'Penafian sentiasa mempunyai nilai kebenaran yang bertentangan dengan pernyataan asal.');
  const KIND_WHY = {
    'a question': T('it asks for information', 'ia meminta maklumat'),
    'a command': T('it tells someone to do something', 'ia menyuruh seseorang melakukan sesuatu'),
    'an exclamation': T('it expresses a feeling', 'ia meluahkan perasaan'),
    'an opinion': T('it depends on personal judgement', 'ia bergantung pada pandangan peribadi'),
  };
  /** why a non-statement is not a statement */
  const nonWhy = (x) => T(`"${x.s.en}" is ${x.kind.en} (${KIND_WHY[x.kind.en].en}), so it cannot be judged true or false.`, `"${x.s.ms}" ialah ${x.kind.ms} (${KIND_WHY[x.kind.en].ms}), jadi ia tidak boleh ditentukan betul atau salah.`);
  /** truth value of a statement with its reason; lab = optional label such as $p$ */
  const stmWhy = (x, lab) => T(`${lab ? lab.en : `"${x.s.en}"`} is ${tf(x.v)}: ${x.why.en}`, `${lab ? lab.ms : `"${x.s.ms}"`} adalah ${tfm(x.v)}: ${x.why.ms}`);
  const AND_R = T('"$p$ and $q$" is true only when both $p$ and $q$ are true.', '"$p$ dan $q$" betul hanya apabila kedua-dua $p$ dan $q$ betul.');
  const OR_R = T('"$p$ or $q$" is true when at least one of $p$ and $q$ is true.', '"$p$ atau $q$" betul apabila sekurang-kurangnya satu daripada $p$ dan $q$ betul.');
  const g31e = [
    (r) => {
      const st = r.pick(STM), non = r.pick(NON);
      const list = r.shuffle([[st.s, true], [non.s, false]]);
      return { q: T(`State which of the following is a statement, and give its truth value. (A) ${list[0][0].en} (B) ${list[1][0].en}`, `Nyatakan yang manakah antara berikut ialah pernyataan, dan berikan nilai kebenarannya. (A) ${list[0][0].ms} (B) ${list[1][0].ms}`), a: T(`(${list[0][1] ? 'A' : 'B'}); ${st.v ? 'true' : 'false'}`, `(${list[0][1] ? 'A' : 'B'}); ${st.v ? 'betul' : 'salah'}`), w: W(nonWhy(non), stmWhy(st)), sp: 's' };
    },
    (r) => {
      const st = r.pick(STM);
      return { q: T(`Write the negation of the statement: "${st.s.en}" State whether the negation is true or false.`, `Tulis penafian bagi pernyataan: "${st.s.ms}" Nyatakan sama ada penafian itu betul atau salah.`), a: T(`${st.neg.en} ${st.v ? 'False' : 'True'}`, `${st.neg.ms} ${st.v ? 'Salah' : 'Betul'}`), w: W(stmWhy(st, T('The original statement', 'Pernyataan asal')), NEG_TV, T(`So the negation is ${tf(!st.v)}.`, `Maka penafian itu ${tfm(!st.v)}.`)), sp: 's' };
    },
    (r) => {
      const non = r.pick(NON);
      return { q: T(`Explain why the sentence "${non.s.en}" is not a statement.`, `Terangkan mengapa ayat "${non.s.ms}" bukan satu pernyataan.`), a: T(`It is ${non.kind.en}, so it cannot be judged true or false.`, `Ia ialah ${non.kind.ms}, jadi ia tidak boleh ditentukan betul atau salah.`), w: W(STM_DEF, nonWhy(non)), sp: 's' };
    },
    (r) => {
      const non = r.pick(NON);
      const opts = r.shuffle([non.kind, ...r.sample(NON.filter((x) => x.kind.en !== non.kind.en), 3).map((x) => x.kind)].filter((v, i, a) => a.findIndex((y) => y.en === v.en) === i));
      need(opts.length >= 2);
      return { q: T(`"${non.s.en}" is an example of which type of sentence? ${opts.map((o, i) => `(${'ABCD'[i]}) ${o.en}`).join('  ')}`, `"${non.s.ms}" ialah contoh ayat jenis manakah? ${opts.map((o, i) => `(${'ABCD'[i]}) ${o.ms}`).join('  ')}`), a: T(`(${'ABCD'[opts.findIndex((o) => o.en === non.kind.en)]}) ${non.kind.en}`, `(${'ABCD'[opts.findIndex((o) => o.en === non.kind.en)]}) ${non.kind.ms}`), w: W(nonWhy(non)), sp: 'xs' };
    },
    (r) => {
      const set = r.sample(STM.concat(NON.map((x) => ({ s: x.s, isStm: false }))), 4);
      const cnt = set.filter((x) => x.isStm !== false).length;
      const why = set.map((x, i) => {
        if (x.isStm !== false) return T(`(${'abcd'[i]}) statement (${tf(x.v)})`, `(${'abcd'[i]}) pernyataan (${tfm(x.v)})`);
        const k = NON.find((y) => y.s === x.s).kind;
        return T(`(${'abcd'[i]}) not a statement: ${k.en}`, `(${'abcd'[i]}) bukan pernyataan: ${k.ms}`);
      });
      return { q: T(`How many of the following sentences are statements? ${set.map((x, i) => `<br>(${'abcd'[i]}) ${x.s.en}`).join('')}`, `Berapakah antara ayat berikut yang merupakan pernyataan? ${set.map((x, i) => `<br>(${'abcd'[i]}) ${x.s.ms}`).join('')}`), a: T(`${cnt}`, `${cnt}`), w: W(...why, T(`Number of statements $= ${cnt}$`, `Bilangan pernyataan $= ${cnt}$`)), sp: 's' };
    },
    (r) => {
      const st = r.pick(STM);
      return { q: T(`Is the sentence "${st.s.en}" a statement? If so, is it true or false?`, `Adakah ayat "${st.s.ms}" satu pernyataan? Jika ya, adakah ia betul atau salah?`), a: T(`Yes, it is a statement; it is ${st.v ? 'true' : 'false'}.`, `Ya, ia satu pernyataan; ia ${st.v ? 'betul' : 'salah'}.`), w: W(STM_DEF, stmWhy(st)), sp: 'xs' };
    },
  ];

  // quantified statements over an explicit finite domain
  const PREDS = [
    { en: 'is an even number', neg: 'is not an even number', ms: 'ialah nombor genap', negms: 'bukan nombor genap', f: (x) => x % 2 === 0 },
    { en: 'is an odd number', neg: 'is not an odd number', ms: 'ialah nombor ganjil', negms: 'bukan nombor ganjil', f: (x) => x % 2 !== 0 },
    { en: 'is a multiple of 3', neg: 'is not a multiple of 3', ms: 'ialah gandaan 3', negms: 'bukan gandaan 3', f: (x) => x % 3 === 0 },
    { en: 'is a multiple of 4', neg: 'is not a multiple of 4', ms: 'ialah gandaan 4', negms: 'bukan gandaan 4', f: (x) => x % 4 === 0 },
    { en: 'is a factor of 24', neg: 'is not a factor of 24', ms: 'ialah faktor bagi 24', negms: 'bukan faktor bagi 24', f: (x) => 24 % x === 0 },
    { en: 'is a prime number', neg: 'is not a prime number', ms: 'ialah nombor perdana', negms: 'bukan nombor perdana', f: (x) => isPrime(x) },
    { en: 'is greater than 6', neg: 'is not greater than 6', ms: 'lebih besar daripada 6', negms: 'tidak lebih besar daripada 6', f: (x) => x > 6 },
    { en: 'is less than 5', neg: 'is not less than 5', ms: 'kurang daripada 5', negms: 'tidak kurang daripada 5', f: (x) => x < 5 },
    { en: 'is a perfect square', neg: 'is not a perfect square', ms: 'ialah nombor kuasa dua sempurna', negms: 'bukan nombor kuasa dua sempurna', f: (x) => Number.isInteger(Math.sqrt(x)) },
    { en: 'leaves a remainder of 1 when divided by 3', neg: 'does not leave a remainder of 1 when divided by 3', ms: 'meninggalkan baki 1 apabila dibahagikan dengan 3', negms: 'tidak meninggalkan baki 1 apabila dibahagikan dengan 3', f: (x) => x % 3 === 1 },
  ];
  const mkDomain = (r) => retry(() => {
    const n = r.int(4, 6);
    const D = r.sample(Array.from({ length: 18 }, (_, i) => i + 2), n).sort((a, b) => a - b);
    return D;
  });
  const QK = [
    { kind: 'all', en: (d, p) => `Every element of $D$ ${p.en}.`, ms: (d, p) => `Setiap unsur $D$ ${p.ms}.`, negEn: (d, p) => `At least one element of $D$ ${p.neg}.`, negMs: (d, p) => `Sekurang-kurangnya satu unsur $D$ ${p.negms}.`, truth: (D, p) => D.every(p.f), negTruth: (D, p) => !D.every(p.f) },
    { kind: 'some', en: (d, p) => `At least one element of $D$ ${p.en}.`, ms: (d, p) => `Sekurang-kurangnya satu unsur $D$ ${p.ms}.`, negEn: (d, p) => `No element of $D$ ${p.en}.`, negMs: (d, p) => `Tiada unsur $D$ yang ${p.ms}.`, truth: (D, p) => D.some(p.f), negTruth: (D, p) => !D.some(p.f) },
    { kind: 'no', en: (d, p) => `No element of $D$ ${p.en}.`, ms: (d, p) => `Tiada unsur $D$ yang ${p.ms}.`, negEn: (d, p) => `At least one element of $D$ ${p.en}.`, negMs: (d, p) => `Sekurang-kurangnya satu unsur $D$ ${p.ms}.`, truth: (D, p) => !D.some(p.f), negTruth: (D, p) => D.some(p.f) },
  ];
  const roster = (l) => `\\{${l.join(',\\ ')}\\}`;
  const rst = (l) => (l.length ? roster(l) : '\\varnothing');
  /** the elements of D with property p */
  const qLine = (D, p) => T(`Elements $x$ of $D$ such that $x$ ${p.en}: $${rst(D.filter(p.f))}$`, `Unsur $x$ dalam $D$ dengan keadaan $x$ ${p.ms}: $${rst(D.filter(p.f))}$`);
  /** why the quantified statement of kind k ('all' | 'some' | 'no') is true/false */
  const qConc = (D, p, k) => {
    const yes = D.filter(p.f), no = D.filter((x) => !p.f(x));
    if (k === 'all') return no.length ? T(`$${no[0]}$ ${p.neg}, so "every element" is false.`, `$${no[0]}$ ${p.negms}, jadi "setiap unsur" adalah salah.`) : T(`All ${D.length} elements have the property, so "every element" is true.`, `Kesemua ${D.length} unsur mempunyai sifat itu, jadi "setiap unsur" adalah betul.`);
    if (k === 'some') return yes.length ? T(`$${yes[0]}$ ${p.en}, so "at least one element" is true.`, `$${yes[0]}$ ${p.ms}, jadi "sekurang-kurangnya satu unsur" adalah betul.`) : T('No element has the property, so "at least one element" is false.', 'Tiada unsur yang mempunyai sifat itu, jadi "sekurang-kurangnya satu unsur" adalah salah.');
    return yes.length ? T(`$${yes[0]}$ ${p.en}, so "no element" is false.`, `$${yes[0]}$ ${p.ms}, jadi "tiada unsur" adalah salah.`) : T('No element has the property, so "no element" is true.', 'Tiada unsur yang mempunyai sifat itu, jadi "tiada unsur" adalah betul.');
  };
  const NEG_Q = T('Negation: "every element is …" ↔ "at least one element is not …", and "at least one element is …" ↔ "no element is …".', 'Penafian: "setiap unsur ialah …" ↔ "sekurang-kurangnya satu unsur bukan …", dan "sekurang-kurangnya satu unsur ialah …" ↔ "tiada unsur yang …".');
  const g31m = [
    (r) => {
      const D = mkDomain(r), p = r.pick(PREDS), q = r.pick(QK);
      return { q: T(`$D = ${roster(D)}$. Consider the statement: "${q.en(D, p)}" Write its negation and determine which of the two statements (the original or the negation) is true.`, `$D = ${roster(D)}$. Pertimbangkan pernyataan: "${q.ms(D, p)}" Tulis penafiannya dan tentukan yang manakah antara dua pernyataan itu (asal atau penafian) betul.`), a: T(`${q.negEn(D, p)} The negation is ${q.negTruth(D, p) ? 'true' : 'false'}; the original is ${q.truth(D, p) ? 'true' : 'false'}.`, `${q.negMs(D, p)} Penafian itu ${q.negTruth(D, p) ? 'betul' : 'salah'}; pernyataan asal ${q.truth(D, p) ? 'betul' : 'salah'}.`), w: W(NEG_Q, qLine(D, p), qConc(D, p, q.kind), NEG_TV), sp: 'm' };
    },
    (r) => {
      const D = mkDomain(r), p = r.pick(PREDS), q = r.pick(QK);
      return { q: T(`$D = ${roster(D)}$. State whether the statement "${q.en(D, p)}" is true or false.`, `$D = ${roster(D)}$. Nyatakan sama ada pernyataan "${q.ms(D, p)}" betul atau salah.`), a: T(`${q.truth(D, p) ? 'True' : 'False'}`, `${q.truth(D, p) ? 'Betul' : 'Salah'}`), w: W(qLine(D, p), qConc(D, p, q.kind)), sp: 'xs' };
    },
    (r) => {
      const p = r.pick(STM), qq = r.pick(STM.filter((x) => x !== p));
      const and = r.chance();
      const v = and ? p.v && qq.v : p.v || qq.v;
      return { q: T(`Statement $p$: "${p.s.en}" Statement $q$: "${qq.s.en}" State whether "$p$ ${and ? 'and' : 'or'} $q$" is true or false, and explain using the truth values of $p$ and $q$.`, `Pernyataan $p$: "${p.s.ms}" Pernyataan $q$: "${qq.s.ms}" Nyatakan sama ada "$p$ ${and ? 'dan' : 'atau'} $q$" betul atau salah, dan terangkan menggunakan nilai kebenaran $p$ dan $q$.`), a: T(`${v ? 'True' : 'False'} ($p$ is ${p.v ? 'true' : 'false'}, $q$ is ${qq.v ? 'true' : 'false'}, and "${and ? 'and' : 'or'}" needs ${and ? 'both' : 'at least one'} to be true)`, `${v ? 'Betul' : 'Salah'} ($p$ ${p.v ? 'betul' : 'salah'}, $q$ ${qq.v ? 'betul' : 'salah'}, dan "${and ? 'dan' : 'atau'}" memerlukan ${and ? 'kedua-duanya' : 'sekurang-kurangnya satu'} betul)`), w: W(stmWhy(p, T('$p$')), stmWhy(qq, T('$q$')), and ? AND_R : OR_R, T(`So "$p$ ${and ? 'and' : 'or'} $q$" is ${tf(v)}.`, `Maka "$p$ ${and ? 'dan' : 'atau'} $q$" adalah ${tfm(v)}.`)), sp: 'm' };
    },
    (r) => {
      const parts = r.sample(STM, 2);
      const drop = (s) => s.replace(/\.$/, '');
      const c1 = T(`(a) "${drop(parts[0].s.en)} and ${drop(parts[1].s.en)}"`, `(a) "${drop(parts[0].s.ms)} dan ${drop(parts[1].s.ms)}"`);
      const c2 = T(`(b) "${drop(parts[0].s.en)} or ${drop(parts[1].s.en)}"`, `(b) "${drop(parts[0].s.ms)} atau ${drop(parts[1].s.ms)}"`);
      return { q: T(`Statement $p$: "${parts[0].s.en}" Statement $q$: "${parts[1].s.en}" Form the compound statements ${c1.en} ${c2.en} and state the truth value of each.`, `Pernyataan $p$: "${parts[0].s.ms}" Pernyataan $q$: "${parts[1].s.ms}" Bentukkan pernyataan majmuk ${c1.ms} ${c2.ms} dan nyatakan nilai kebenaran setiap satu.`), a: T(`(a) ${parts[0].v && parts[1].v ? 'True' : 'False'} (b) ${parts[0].v || parts[1].v ? 'True' : 'False'}`, `(a) ${parts[0].v && parts[1].v ? 'Betul' : 'Salah'} (b) ${parts[0].v || parts[1].v ? 'Betul' : 'Salah'}`), w: W(stmWhy(parts[0], T('$p$')), stmWhy(parts[1], T('$q$')), T(`(a) ${AND_R.en}`, `(a) ${AND_R.ms}`), T(`(b) ${OR_R.en}`, `(b) ${OR_R.ms}`)), sp: 's' };
    },
  ];
  const g31a = [
    (r) => {
      const c = r.pick([['p and q', 'p dan q', true], ['p or q', 'p atau q', false]]);
      return c[2]
        ? { q: T('The compound statement "$p$ and $q$" is true. What can you say about the truth values of $p$ and $q$?', 'Pernyataan majmuk "$p$ dan $q$" adalah betul. Apakah yang boleh anda katakan tentang nilai kebenaran $p$ dan $q$?'), a: T('Both $p$ and $q$ must be true.', '$p$ dan $q$ mesti kedua-duanya betul.'), w: W(AND_R, T('If either $p$ or $q$ were false, "$p$ and $q$" would be false.', 'Jika salah satu daripada $p$ atau $q$ salah, "$p$ dan $q$" akan salah.')), sp: 's' }
        : { q: T('The compound statement "$p$ or $q$" is false. What can you say about the truth values of $p$ and $q$?', 'Pernyataan majmuk "$p$ atau $q$" adalah salah. Apakah yang boleh anda katakan tentang nilai kebenaran $p$ dan $q$?'), a: T('Both $p$ and $q$ must be false.', '$p$ dan $q$ mesti kedua-duanya salah.'), w: W(OR_R, T('If either $p$ or $q$ were true, "$p$ or $q$" would be true.', 'Jika salah satu daripada $p$ atau $q$ betul, "$p$ atau $q$" akan betul.')), sp: 's' };
    },
    (r) => {
      const cols = r.pick([
        { en: ['$p \\wedge q$', '$p \\vee q$'], ms: ['$p \\wedge q$', '$p \\vee q$'], row: (p, q) => [p && q, p || q] },
        { en: ['$\\neg p$', '$p \\vee \\neg q$'], ms: ['$\\neg p$', '$p \\vee \\neg q$'], row: (p, q) => [!p, p || !q] },
        { en: ['$\\neg p \\wedge \\neg q$', '$\\neg(p \\vee q)$'], ms: ['$\\neg p \\wedge \\neg q$', '$\\neg(p \\vee q)$'], row: (p, q) => [!p && !q, !(p || q)] },
        { en: ['$p \\wedge \\neg q$', '$\\neg p \\vee q$'], ms: ['$p \\wedge \\neg q$', '$\\neg p \\vee q$'], row: (p, q) => [p && !q, !p || q] },
      ]);
      const tv = [[true, true], [true, false], [false, true], [false, false]];
      const rows = tv.map(([p, q]) => cols.row(p, q));
      const bm = (b) => (b ? 'T' : 'F'), bmMs = (b) => (b ? 'B' : 'P');
      return { q: T(`Complete the truth table for $p$ and $q$, giving the truth value of ${cols.en[0]} and ${cols.en[1]} for all four combinations of truth values of $p$ and $q$.`, `Lengkapkan jadual kebenaran bagi $p$ dan $q$, dengan memberikan nilai kebenaran bagi ${cols.ms[0]} dan ${cols.ms[1]} untuk keempat-empat gabungan nilai kebenaran $p$ dan $q$.`), a: T(SPM.table(tv.map(([p, q], i) => [bm(p), bm(q), bm(rows[i][0]), bm(rows[i][1])]), { head: ['$p$', '$q$', cols.en[0], cols.en[1]] }), SPM.table(tv.map(([p, q], i) => [bmMs(p), bmMs(q), bmMs(rows[i][0]), bmMs(rows[i][1])]), { head: ['$p$', '$q$', cols.ms[0], cols.ms[1]] })), w: W(T('$\\neg p$ has the opposite truth value of $p$ (T ↔ F).', '$\\neg p$ mempunyai nilai kebenaran yang bertentangan dengan $p$ (B ↔ P).'), T('$\\wedge$ (and) is T only when both parts are T; $\\vee$ (or) is F only when both parts are F.', '$\\wedge$ (dan) ialah B hanya apabila kedua-dua bahagian B; $\\vee$ (atau) ialah P hanya apabila kedua-dua bahagian P.'), T('Apply these row by row: first find any negations, then combine.', 'Guna peraturan ini baris demi baris: cari penafian dahulu, kemudian gabungkan.')), sp: 'm' };
    },
    (r) => {
      const D = mkDomain(r), p = r.pick(PREDS), q = r.pick(QK);
      const wrongKind = r.pick(QK.filter((x) => x.kind !== q.kind));
      const wrongNeg = wrongKind.negEn(D, p);
      return { q: T(`$D = ${roster(D)}$. A student writes the negation of "${q.en(D, p)}" as "${wrongNeg}". Is this correct? If not, write the correct negation.`, `$D = ${roster(D)}$. Seorang murid menulis penafian bagi "${q.ms(D, p)}" sebagai "${wrongKind.negMs(D, p)}". Adakah ini betul? Jika tidak, tulis penafian yang betul.`), a: T(`No, it is not correct. The correct negation is: "${q.negEn(D, p)}"`, `Tidak, ia tidak betul. Penafian yang betul ialah: "${q.negMs(D, p)}"`), w: W(NEG_Q, qLine(D, p), T(`The original is ${tf(q.truth(D, p))}, so its negation must be ${tf(q.negTruth(D, p))}; the student's version is ${tf(wrongKind.negTruth(D, p))}${wrongKind.negTruth(D, p) === q.negTruth(D, p) ? ' here, but it says something different' : ''}.`, `Pernyataan asal ${tfm(q.truth(D, p))}, jadi penafiannya mesti ${tfm(q.negTruth(D, p))}; versi murid itu ${tfm(wrongKind.negTruth(D, p))}${wrongKind.negTruth(D, p) === q.negTruth(D, p) ? ' di sini, tetapi maksudnya berbeza' : ''}.`)), sp: 'm' };
    },
    (r) => {
      const D = mkDomain(r), p = r.pick(PREDS), q = r.pick(QK);
      const distractors = r.sample(QK.filter((x) => x.kind !== q.kind), 2).map((x) => T(x.negEn(D, p), x.negMs(D, p)));
      const otherPred = r.pick(PREDS.filter((x) => x !== p));
      const correct = T(q.negEn(D, p), q.negMs(D, p));
      const opts = r.shuffle([correct, ...distractors, T(q.en(D, otherPred), q.ms(D, otherPred))]);
      const letters = 'ABCD', L = letters[opts.indexOf(correct)];
      return { q: T(`$D = ${roster(D)}$. Which of the following is the correct negation of "${q.en(D, p)}"? ${opts.map((o, i) => `(${letters[i]}) ${o.en}`).join('  ')}`, `$D = ${roster(D)}$. Antara berikut, yang manakah penafian yang betul bagi "${q.ms(D, p)}"? ${opts.map((o, i) => `(${letters[i]}) ${o.ms}`).join('  ')}`), a: T(`(${L}) ${correct.en}`, `(${L}) ${correct.ms}`), w: W(NEG_Q, T(`So the negation of "${q.en(D, p)}" is (${L}).`, `Maka penafian bagi "${q.ms(D, p)}" ialah (${L}).`)), sp: 's' };
    },
    (r) => {
      const D = mkDomain(r), p = r.pick(PREDS);
      const all = QK[0], some = QK[1], no = QK[2];
      return { q: T(`$D = ${roster(D)}$. (a) Is the statement "${all.en(D, p)}" true or false? (b) Is the statement "${some.en(D, p)}" true or false? (c) Explain why both can be evaluated from the same domain $D$.`, `$D = ${roster(D)}$. (a) Adakah pernyataan "${all.ms(D, p)}" betul atau salah? (b) Adakah pernyataan "${some.ms(D, p)}" betul atau salah? (c) Terangkan mengapa kedua-duanya boleh ditentukan daripada domain $D$ yang sama.`), a: T(`(a) ${all.truth(D, p) ? 'True' : 'False'} (b) ${some.truth(D, p) ? 'True' : 'False'} (c) Every element of $D$ is known, so each element can be checked against the property "${p.en}" directly.`, `(a) ${all.truth(D, p) ? 'Betul' : 'Salah'} (b) ${some.truth(D, p) ? 'Betul' : 'Salah'} (c) Setiap unsur $D$ diketahui, jadi setiap unsur boleh disemak terhadap sifat "${p.ms}" secara terus.`), w: W(qLine(D, p), T(`(a) ${qConc(D, p, 'all').en}`, `(a) ${qConc(D, p, 'all').ms}`), T(`(b) ${qConc(D, p, 'some').en}`, `(b) ${qConc(D, p, 'some').ms}`), T('(c) $D$ is a finite list, so every element can be checked.', '(c) $D$ ialah senarai terhingga, jadi setiap unsur boleh disemak.')), sp: 'm' };
    },
  ];
  SPM.extend('F4-3.1', { e: g31e, m: g31m, a: g31a });

  /* =========================================================================================== F4-3.2 Arguments */
  const notEn = (x) => `it is not true that ${x}`;
  const notMs = (x) => `tidak betul bahawa ${x}`;
  const pqLine = (c) => T(`$p$: ${c.p.en}; $q$: ${c.q.en}`, `$p$: ${c.p.ms}; $q$: ${c.q.ms}`);
  const R_CONV = T('Converse of "if $p$, then $q$": swap the antecedent and the consequent, "if $q$, then $p$".', 'Akas bagi "jika $p$, maka $q$": tukar tempat antejadian dan akibat, "jika $q$, maka $p$".');
  const R_INV = T('Inverse of "if $p$, then $q$": negate both parts, "if $\\sim p$, then $\\sim q$".', 'Songsang bagi "jika $p$, maka $q$": nafikan kedua-dua bahagian, "jika $\\sim p$, maka $\\sim q$".');
  const R_CONTRA = T('Contrapositive of "if $p$, then $q$": swap and negate both parts, "if $\\sim q$, then $\\sim p$".', 'Kontrapositif bagi "jika $p$, maka $q$": tukar tempat dan nafikan kedua-dua bahagian, "jika $\\sim q$, maka $\\sim p$".');
  const F_II = T('Form II: "if $p$, then $q$" and "$p$ is true" give the valid conclusion "$q$ is true".', 'Bentuk II: "jika $p$, maka $q$" dan "$p$ betul" memberikan kesimpulan sah "$q$ betul".');
  const F_III = T('Form III: "if $p$, then $q$" and "$\\sim q$ is true" give the valid conclusion "$\\sim p$ is true".', 'Bentuk III: "jika $p$, maka $q$" dan "$\\sim q$ betul" memberikan kesimpulan sah "$\\sim p$ betul".');
  const AFF_Q = T('Premise 2 confirms $q$ (the consequent), not $p$: this form is not valid, since $q$ can be true while $p$ is false.', 'Premis 2 mengesahkan $q$ (akibat), bukan $p$: bentuk ini tidak sah, kerana $q$ boleh betul sementara $p$ salah.');
  const DEN_P = T('Premise 2 denies $p$ (the antecedent): this form is not valid, since $q$ can still be true when $p$ is false.', 'Premis 2 menafikan $p$ (antejadian): bentuk ini tidak sah, kerana $q$ masih boleh betul apabila $p$ salah.');
  const cexLine = (x) => T(`Counterexample: ${x.en}.`, `Contoh penyangkal: ${x.ms}.`);
  const SOUND = T('A valid argument is sound only if all its premises are true.', 'Hujah yang sah adalah munasabah hanya jika semua premisnya betul.');
  const STRONG = T('An inductive argument is strong when its sample is large, random and representative, and the conclusion is stated as probable.', 'Hujah induktif adalah kukuh apabila sampelnya besar, rawak dan mewakili, dan kesimpulannya dinyatakan sebagai berkemungkinan.');
  // implications: "if p then q". ivTrue = truth of the implication itself; cvTrue = truth of its converse "if q then p".
  const IMP = [
    { p: T('a number is divisible by 6', 'suatu nombor boleh dibahagi tepat dengan 6'), q: T('it is divisible by 3', 'ia boleh dibahagi tepat dengan 3'), ivTrue: true, cvTrue: false, cvCex: T('9 is divisible by 3 but not by 6', '9 boleh dibahagi tepat dengan 3 tetapi tidak dengan 6') },
    { p: T('a shape is a square', 'suatu bentuk ialah segi empat sama'), q: T('it is a rectangle', 'ia ialah segi empat tepat'), ivTrue: true, cvTrue: false, cvCex: T('a rectangle 3 cm by 5 cm is not a square', 'segi empat tepat 3 cm kali 5 cm bukan segi empat sama') },
    { p: T('$x = 3$', '$x = 3$'), q: T('$x^2 = 9$', '$x^2 = 9$'), ivTrue: true, cvTrue: false, cvCex: T('$x = -3$ gives $x^2 = 9$ but $x \\neq 3$', '$x = -3$ memberikan $x^2 = 9$ tetapi $x \\neq 3$') },
    { p: T('a number ends with the digit 0', 'suatu nombor berakhir dengan digit 0'), q: T('it is divisible by 5', 'ia boleh dibahagi tepat dengan 5'), ivTrue: true, cvTrue: false, cvCex: T('15 is divisible by 5 but does not end with 0', '15 boleh dibahagi tepat dengan 5 tetapi tidak berakhir dengan 0') },
    { p: T('a quadrilateral is a rhombus', 'suatu sisi empat ialah rombus'), q: T('its diagonals bisect each other at right angles', 'pepenjurunya saling membahagi dua sama pada sudut tegak'), ivTrue: true, cvTrue: true },
    { p: T('a triangle is equilateral', 'suatu segi tiga ialah sama sisi'), q: T('all its interior angles are $60°$', 'semua sudut pedalamannya ialah $60°$'), ivTrue: true, cvTrue: true },
    { p: T('a number is a multiple of 10', 'suatu nombor ialah gandaan 10'), q: T('it is a multiple of 5', 'ia ialah gandaan 5'), ivTrue: true, cvTrue: false, cvCex: T('15 is a multiple of 5 but not of 10', '15 ialah gandaan 5 tetapi bukan gandaan 10') },
    { p: T('a number is negative', 'suatu nombor ialah negatif'), q: T('its square is positive', 'kuasa duanya positif'), ivTrue: true, cvTrue: false, cvCex: T('3 is not negative but $3^2 = 9$ is positive', '3 bukan negatif tetapi $3^2 = 9$ adalah positif') },
    { p: T('a number is prime and greater than 2', 'suatu nombor ialah perdana dan lebih besar daripada 2'), q: T('it is odd', 'ia ialah ganjil'), ivTrue: true, cvTrue: false, cvCex: T('9 is odd but not prime', '9 ialah ganjil tetapi bukan perdana') },
    { p: T('a solid is a cube', 'suatu pepejal ialah kubus'), q: T('it has 6 faces', 'ia mempunyai 6 muka'), ivTrue: true, cvTrue: false, cvCex: T('a cuboid has 6 faces but is not a cube', 'sebuah kuboid mempunyai 6 muka tetapi bukan kubus') },
    { p: T('a quadrilateral has four equal sides', 'suatu sisi empat mempunyai empat sisi yang sama panjang'), q: T('it is a square', 'ia ialah segi empat sama'), ivTrue: false, ifCex: T('a rhombus has four equal sides but is not a square (its angles need not be $90°$)', 'sebuah rombus mempunyai empat sisi yang sama panjang tetapi bukan segi empat sama (sudutnya tidak semestinya $90°$)'), cvTrue: true },
    { p: T('a number is even', 'suatu nombor ialah genap'), q: T('it is a multiple of 4', 'ia ialah gandaan 4'), ivTrue: false, ifCex: T('6 is even but not a multiple of 4', '6 ialah genap tetapi bukan gandaan 4'), cvTrue: true },
    { p: T('$x^2 = 16$', '$x^2 = 16$'), q: T('$x = 4$', '$x = 4$'), ivTrue: false, ifCex: T('$x = -4$ gives $x^2 = 16$ but $x \\neq 4$', '$x = -4$ memberikan $x^2 = 16$ tetapi $x \\neq 4$'), cvTrue: true },
    { p: T('a triangle has two equal sides', 'suatu segi tiga mempunyai dua sisi yang sama panjang'), q: T('it is equilateral', 'ia ialah sama sisi'), ivTrue: false, ifCex: T('an isosceles triangle has two equal sides but is not equilateral', 'sebuah segi tiga sama kaki mempunyai dua sisi yang sama panjang tetapi bukan sama sisi'), cvTrue: true },
    { p: T('a number is a perfect square', 'suatu nombor ialah nombor kuasa dua sempurna'), q: T('it has an odd number of factors', 'ia mempunyai bilangan faktor yang ganjil'), ivTrue: true, cvTrue: true },
    { p: T('a number is divisible by 9', 'suatu nombor boleh dibahagi tepat dengan 9'), q: T('it is divisible by 3', 'ia boleh dibahagi tepat dengan 3'), ivTrue: true, cvTrue: false, cvCex: T('6 is divisible by 3 but not by 9', '6 boleh dibahagi tepat dengan 3 tetapi tidak dengan 9') },
    { p: T('an angle is acute', 'suatu sudut ialah tirus'), q: T('it is less than $90°$', 'ia kurang daripada $90°$'), ivTrue: true, cvTrue: true },
    { p: T('a number is a factor of 20', 'suatu nombor ialah faktor bagi 20'), q: T('it is a factor of 40', 'ia ialah faktor bagi 40'), ivTrue: true, cvTrue: false, cvCex: T('8 is a factor of 40 but not of 20', '8 ialah faktor bagi 40 tetapi bukan bagi 20') },
    { p: T('$y = 2x + 3$', '$y = 2x + 3$'), q: T('the graph of $y$ against $x$ is a straight line', 'graf $y$ melawan $x$ ialah garis lurus'), ivTrue: true, cvTrue: false, cvCex: T('$y = 5x - 1$ has a straight-line graph but is not $y = 2x + 3$', '$y = 5x - 1$ mempunyai graf garis lurus tetapi bukan $y = 2x + 3$') },
    { p: T('a number is a multiple of 12', 'suatu nombor ialah gandaan 12'), q: T('it is a multiple of both 4 and 3', 'ia ialah gandaan kedua-dua 4 dan 3') , ivTrue: true, cvTrue: true },
    { p: T('a triangle has a $90°$ angle', 'suatu segi tiga mempunyai sudut $90°$'), q: T('it is a right-angled triangle', 'ia ialah segi tiga bersudut tegak'), ivTrue: true, cvTrue: true },
    { p: T('a number is divisible by both 2 and 5', 'suatu nombor boleh dibahagi tepat dengan kedua-dua 2 dan 5'), q: T('it is divisible by 10', 'ia boleh dibahagi tepat dengan 10'), ivTrue: true, cvTrue: true },
    { p: T('a number is divisible by 3', 'suatu nombor boleh dibahagi tepat dengan 3'), q: T('it is divisible by 9', 'ia boleh dibahagi tepat dengan 9'), ivTrue: false, ifCex: T('6 is divisible by 3 but not by 9', '6 boleh dibahagi tepat dengan 3 tetapi tidak dengan 9'), cvTrue: true },
    { p: T('a triangle has all angles less than $90°$', 'suatu segi tiga mempunyai semua sudut kurang daripada $90°$'), q: T('it is equilateral', 'ia ialah sama sisi'), ivTrue: false, ifCex: T('a triangle with angles $50°, 60°, 70°$ has all angles less than $90°$ but is not equilateral', 'suatu segi tiga bersudut $50°, 60°, 70°$ mempunyai semua sudut kurang daripada $90°$ tetapi bukan sama sisi'), cvTrue: true },
    { p: T('a number is a multiple of 8', 'suatu nombor ialah gandaan 8'), q: T('it is a multiple of 4', 'ia ialah gandaan 4'), ivTrue: true, cvTrue: false, cvCex: T('12 is a multiple of 4 but not of 8', '12 ialah gandaan 4 tetapi bukan gandaan 8') },
    { p: T('a polygon has 5 sides', 'suatu poligon mempunyai 5 sisi'), q: T('it is a pentagon', 'ia ialah pentagon'), ivTrue: true, cvTrue: true },
    { p: T('a number has exactly two factors', 'suatu nombor mempunyai tepat dua faktor'), q: T('it is a prime number', 'ia ialah nombor perdana'), ivTrue: true, cvTrue: true },
    { p: T('a fraction has a denominator of 4', 'suatu pecahan mempunyai penyebut 4'), q: T('it can be written as a decimal that terminates', 'ia boleh ditulis sebagai perpuluhan tamat'), ivTrue: true, cvTrue: false, cvCex: T('$0.2$ terminates and equals $\\dfrac{1}{5}$, which has denominator 5, not 4', '$0.2$ tamat dan bersamaan $\\dfrac{1}{5}$, yang penyebutnya 5, bukan 4') },
  ];
  const IMP_T = IMP.filter((x) => x.ivTrue), IMP_CVF = IMP.filter((x) => !x.cvTrue), IMP_F = IMP.filter((x) => !x.ivTrue);
  // genuine biconditionals: both directions true
  const BIC = [
    { p: T('a triangle is equilateral', 'suatu segi tiga ialah sama sisi'), q: T('all its interior angles are $60°$', 'semua sudut pedalamannya ialah $60°$') },
    { p: T('a quadrilateral is a rhombus', 'suatu sisi empat ialah rombus'), q: T('its diagonals bisect each other at right angles', 'pepenjurunya saling membahagi dua sama pada sudut tegak') },
    { p: T('a number $n$ is a multiple of 6', 'suatu nombor $n$ ialah gandaan 6'), q: T('$n$ is a multiple of both 2 and 3', '$n$ ialah gandaan kedua-dua 2 dan 3') },
    { p: T('a quadrilateral is a square', 'suatu sisi empat ialah segi empat sama'), q: T('it is a rectangle with all four sides equal', 'ia ialah segi empat tepat dengan keempat-empat sisi sama panjang') },
    { p: T('a number is divisible by 9', 'suatu nombor boleh dibahagi tepat dengan 9'), q: T('the sum of its digits is divisible by 9', 'hasil tambah digitnya boleh dibahagi tepat dengan 9') },
    { p: T('an angle is acute', 'suatu sudut ialah tirus'), q: T('it is less than $90°$', 'ia kurang daripada $90°$') },
    { p: T('a number is a multiple of 12', 'suatu nombor ialah gandaan 12'), q: T('it is a multiple of both 4 and 3', 'ia ialah gandaan kedua-dua 4 dan 3') },
    { p: T('a triangle has a $90°$ angle', 'suatu segi tiga mempunyai sudut $90°$'), q: T('it is a right-angled triangle', 'ia ialah segi tiga bersudut tegak') },
  ];
  const ge32 = [
    (r) => {
      const c = r.pick(IMP);
      return { q: T(`Write the converse of the implication "If ${c.p.en}, then ${c.q.en}."`, `Tulis akas bagi implikasi "Jika ${c.p.ms}, maka ${c.q.ms}."`), a: T(`If ${c.q.en}, then ${c.p.en}.`, `Jika ${c.q.ms}, maka ${c.p.ms}.`), w: W(pqLine(c), R_CONV), sp: 's' };
    },
    (r) => {
      const c = r.pick(IMP);
      return { q: T(`For the implication "If ${c.p.en}, then ${c.q.en}," state (a) the hypothesis (premise), (b) the conclusion.`, `Bagi implikasi "Jika ${c.p.ms}, maka ${c.q.ms}," nyatakan (a) hipotesis (premis), (b) kesimpulan.`), a: T(`(a) ${c.p.en} (b) ${c.q.en}`, `(a) ${c.p.ms} (b) ${c.q.ms}`), w: W(T('In "if $p$, then $q$", the hypothesis (antecedent) $p$ follows "if" and the conclusion (consequent) $q$ follows "then".', 'Dalam "jika $p$, maka $q$", hipotesis (antejadian) $p$ terletak selepas "jika" dan kesimpulan (akibat) $q$ terletak selepas "maka".')), sp: 's' };
    },
    (r) => {
      const c = r.pick(IMP);
      return { q: T(`Given $p$: "${c.p.en}" and $q$: "${c.q.en}," write the implication "if $p$ then $q$" as a full sentence.`, `Diberi $p$: "${c.p.ms}" dan $q$: "${c.q.ms}," tulis implikasi "jika $p$ maka $q$" sebagai satu ayat penuh.`), a: T(`If ${c.p.en}, then ${c.q.en}.`, `Jika ${c.p.ms}, maka ${c.q.ms}.`), w: W(T('Put the antecedent $p$ after "if" and the consequent $q$ after "then".', 'Letakkan antejadian $p$ selepas "jika" dan akibat $q$ selepas "maka".')), sp: 's' };
    },
    (r) => {
      const c = r.pick(BIC);
      return { q: T(`Write the two implications represented by the biconditional statement "${c.p.en} if and only if ${c.q.en}."`, `Tulis dua implikasi yang diwakili oleh pernyataan dwibersyarat "${c.p.ms} jika dan hanya jika ${c.q.ms}."`), a: T(`If ${c.p.en}, then ${c.q.en}. If ${c.q.en}, then ${c.p.en}.`, `Jika ${c.p.ms}, maka ${c.q.ms}. Jika ${c.q.ms}, maka ${c.p.ms}.`), w: W(pqLine(c), T('"$p$ if and only if $q$" means "if $p$, then $q$" and "if $q$, then $p$".', '"$p$ jika dan hanya jika $q$" bermaksud "jika $p$, maka $q$" dan "jika $q$, maka $p$".')), sp: 'm' };
    },
    (r) => {
      const c = r.pick(IMP);
      return { q: T(`Write the inverse of the implication "If ${c.p.en}, then ${c.q.en}."`, `Tulis songsang bagi implikasi "Jika ${c.p.ms}, maka ${c.q.ms}."`), a: T(`If it is not true that ${c.p.en}, then it is not true that ${c.q.en}.`, `Jika tidak betul bahawa ${c.p.ms}, maka tidak betul bahawa ${c.q.ms}.`), w: W(pqLine(c), R_INV), sp: 's' };
    },
    (r) => {
      const c = r.pick(IMP);
      return { q: T(`Write the contrapositive of the implication "If ${c.p.en}, then ${c.q.en}."`, `Tulis kontrapositif bagi implikasi "Jika ${c.p.ms}, maka ${c.q.ms}."`), a: T(`If it is not true that ${c.q.en}, then it is not true that ${c.p.en}.`, `Jika tidak betul bahawa ${c.q.ms}, maka tidak betul bahawa ${c.p.ms}.`), w: W(pqLine(c), R_CONTRA), sp: 's' };
    },
    (r) => {
      const c = r.pick(IMP);
      const correct = T(`If ${c.q.en}, then ${c.p.en}.`, `Jika ${c.q.ms}, maka ${c.p.ms}.`);
      const distract = [
        T(`If it is not true that ${c.p.en}, then it is not true that ${c.q.en}.`, `Jika tidak betul bahawa ${c.p.ms}, maka tidak betul bahawa ${c.q.ms}.`),
        T(`If it is not true that ${c.q.en}, then it is not true that ${c.p.en}.`, `Jika tidak betul bahawa ${c.q.ms}, maka tidak betul bahawa ${c.p.ms}.`),
        T(`If ${c.p.en}, then ${c.q.en}.`, `Jika ${c.p.ms}, maka ${c.q.ms}.`),
      ];
      const opts = r.shuffle([correct, ...distract]);
      const letters = 'ABCD';
      return { q: T(`Which of the following is the converse of "If ${c.p.en}, then ${c.q.en}"? ${opts.map((o, i) => `(${letters[i]}) ${o.en}`).join('  ')}`, `Antara berikut, yang manakah akas bagi "Jika ${c.p.ms}, maka ${c.q.ms}"? ${opts.map((o, i) => `(${letters[i]}) ${o.ms}`).join('  ')}`), a: T(`(${letters[opts.indexOf(correct)]}) ${correct.en}`, `(${letters[opts.indexOf(correct)]}) ${correct.ms}`), w: W(R_CONV, T('The other options are the inverse, the contrapositive and the original implication.', 'Pilihan lain ialah songsang, kontrapositif dan implikasi asal.')), sp: 's' };
    },
  ];
  const gm32 = [
    (r) => {
      const c = r.pick(IMP);
      return { q: T(`For the implication "If ${c.p.en}, then ${c.q.en}", write (a) the converse, (b) the inverse, (c) the contrapositive, and state whether each is true or false.`, `Bagi implikasi "Jika ${c.p.ms}, maka ${c.q.ms}", tulis (a) akas, (b) songsang, (c) kontrapositif, dan nyatakan sama ada setiap satu betul atau salah.`), a: T(`(a) If ${c.q.en}, then ${c.p.en}: ${c.cvTrue ? 'true' : `false (${c.cvCex.en})`}. (b) If ${notEn(c.p.en)}, then ${notEn(c.q.en)}: ${c.cvTrue ? 'true' : `false (same counterexample)`}. (c) If ${notEn(c.q.en)}, then ${notEn(c.p.en)}: ${c.ivTrue ? 'true (equivalent to the original)' : `false (${c.ifCex.en})`}.`, `(a) Jika ${c.q.ms}, maka ${c.p.ms}: ${c.cvTrue ? 'betul' : `salah (${c.cvCex.ms})`}. (b) Jika ${notMs(c.p.ms)}, maka ${notMs(c.q.ms)}: ${c.cvTrue ? 'betul' : `salah (contoh penyangkal yang sama)`}. (c) Jika ${notMs(c.q.ms)}, maka ${notMs(c.p.ms)}: ${c.ivTrue ? 'betul (setara dengan yang asal)' : `salah (${c.ifCex.ms})`}.`), w: W(pqLine(c), T(`(a) ${R_CONV.en} ${c.cvTrue ? 'It is true.' : `It is false: ${c.cvCex.en}.`}`, `(a) ${R_CONV.ms} ${c.cvTrue ? 'Ia betul.' : `Ia salah: ${c.cvCex.ms}.`}`), T(`(b) ${R_INV.en} It always has the same truth value as the converse: ${tf(c.cvTrue)}.`, `(b) ${R_INV.ms} Ia sentiasa mempunyai nilai kebenaran yang sama dengan akas: ${tfm(c.cvTrue)}.`), T(`(c) ${R_CONTRA.en} It always has the same truth value as the original implication: ${tf(c.ivTrue)}.`, `(c) ${R_CONTRA.ms} Ia sentiasa mempunyai nilai kebenaran yang sama dengan implikasi asal: ${tfm(c.ivTrue)}.`)), sp: 'l' };
    },
    (r) => {
      const c = r.pick(IMP_T);
      return { q: T(`Premise 1: If ${c.p.en}, then ${c.q.en}. Premise 2: ${c.p.en}, which is true. What can you validly conclude?`, `Premis 1: Jika ${c.p.ms}, maka ${c.q.ms}. Premis 2: ${c.p.ms}, iaitu betul. Apakah yang boleh anda simpulkan secara sah?`), a: T(`${c.q.en} (this follows because premise 2 confirms the hypothesis of premise 1)`, `${c.q.ms} (ini terhasil kerana premis 2 mengesahkan hipotesis premis 1)`), w: W(pqLine(c), F_II), sp: 's' };
    },
    (r) => {
      const c = r.pick(IMP_T);
      return { q: T(`Premise 1: If ${c.p.en}, then ${c.q.en}. Premise 2: ${notEn(c.q.en)}. What can you validly conclude?`, `Premis 1: Jika ${c.p.ms}, maka ${c.q.ms}. Premis 2: ${notMs(c.q.ms)}. Apakah yang boleh anda simpulkan secara sah?`), a: T(`${notEn(c.p.en)} (since the conclusion fails, the hypothesis must also fail)`, `${notMs(c.p.ms)} (kerana kesimpulan itu gagal, hipotesis mesti juga gagal)`), w: W(pqLine(c), F_III), sp: 's' };
    },
    (r) => {
      const c = r.pick(IMP_CVF);
      return { q: T(`Premise 1: If ${c.p.en}, then ${c.q.en}. Premise 2: ${c.q.en}, which is true. Can you validly conclude that "${c.p.en}"? Explain.`, `Premis 1: Jika ${c.p.ms}, maka ${c.q.ms}. Premis 2: ${c.q.ms}, iaitu betul. Bolehkah anda menyimpulkan secara sah bahawa "${c.p.ms}"? Terangkan.`), a: T(`No. Knowing that $q$ is true does not guarantee $p$ is true (e.g. ${c.cvCex.en}).`, `Tidak. Mengetahui $q$ betul tidak menjamin $p$ betul (cth. ${c.cvCex.ms}).`), w: W(pqLine(c), AFF_Q, cexLine(c.cvCex)), sp: 'm' };
    },
    (r) => {
      const c = r.pick(IMP_T);
      return { q: T(`Premise 1: If ${c.p.en}, then ${c.q.en} (a true statement). Premise 2: ${c.p.en}. Conclusion: ${c.q.en}. Is this argument valid? Is it sound? Explain.`, `Premis 1: Jika ${c.p.ms}, maka ${c.q.ms} (satu pernyataan yang betul). Premis 2: ${c.p.ms}. Kesimpulan: ${c.q.ms}. Adakah hujah ini sah? Adakah ia munasabah (sound)? Terangkan.`), a: T('Valid: the conclusion follows the correct logical form. Sound: it is valid and premise 1 is true, so the conclusion is guaranteed true.', 'Sah: kesimpulan mengikut bentuk logik yang betul. Munasabah: ia sah dan premis 1 betul, jadi kesimpulan pasti betul.'), w: W(F_II, SOUND, T('Premise 1 is true and premise 2 is given as a fact, so the argument is valid and sound.', 'Premis 1 betul dan premis 2 diberi sebagai fakta, jadi hujah itu sah dan munasabah.')), sp: 'm' };
    },
    (r) => {
      const c = r.pick(IMP_F);
      return { q: T(`Premise 1: If ${c.p.en}, then ${c.q.en}. Premise 2: ${c.p.en}. Conclusion: ${c.q.en}. Is this argument valid? Is it sound? Explain.`, `Premis 1: Jika ${c.p.ms}, maka ${c.q.ms}. Premis 2: ${c.p.ms}. Kesimpulan: ${c.q.ms}. Adakah hujah ini sah? Adakah ia munasabah (sound)? Terangkan.`), a: T(`Valid: the conclusion follows the correct logical form. Not sound: premise 1 is actually false (${c.ifCex.en}), so a sound conclusion is not guaranteed.`, `Sah: kesimpulan mengikut bentuk logik yang betul. Tidak munasabah: premis 1 sebenarnya salah (${c.ifCex.ms}), jadi kesimpulan yang munasabah tidak terjamin.`), w: W(F_II, T(`Premise 1 is false: ${c.ifCex.en}.`, `Premis 1 salah: ${c.ifCex.ms}.`), SOUND), sp: 'm' };
    },
    (r) => {
      const c = r.pick(BIC);
      return { q: T(`State whether the biconditional "${c.p.en} if and only if ${c.q.en}" is true, by checking both directions.`, `Nyatakan sama ada dwibersyarat "${c.p.ms} jika dan hanya jika ${c.q.ms}" adalah betul, dengan menyemak kedua-dua arah.`), a: T(`True: "if ${c.p.en}, then ${c.q.en}" holds, and "if ${c.q.en}, then ${c.p.en}" also holds.`, `Betul: "jika ${c.p.ms}, maka ${c.q.ms}" adalah betul, dan "jika ${c.q.ms}, maka ${c.p.ms}" juga betul.`), w: W(pqLine(c), T('"$p$ if and only if $q$" is true only when both "if $p$, then $q$" and "if $q$, then $p$" are true.', '"$p$ jika dan hanya jika $q$" betul hanya apabila kedua-dua "jika $p$, maka $q$" dan "jika $q$, maka $p$" betul.'), T('Both implications are true here, so the biconditional is true.', 'Kedua-dua implikasi betul di sini, jadi dwibersyarat itu betul.')), sp: 'm' };
    },
    (r) => {
      const c = r.pick(REASON);
      return { q: T(`Is the following reasoning inductive or deductive? "${c.text.en}"`, `Adakah penaakulan berikut induktif atau deduktif? "${c.text.ms}"`), a: T(`${c.kind === 'deductive' ? 'Deductive' : 'Inductive'}: ${c.reason.en}`, `${c.kind === 'deductive' ? 'Deduktif' : 'Induktif'}: ${c.reason.ms}`), w: W(T('Deductive: from a general statement to a specific conclusion (certain). Inductive: from specific cases to a general conclusion (probable).', 'Deduktif: daripada pernyataan umum kepada kesimpulan khusus (pasti). Induktif: daripada kes-kes khusus kepada kesimpulan umum (berkemungkinan).'), c.kind === 'deductive' ? T('Here a general rule is applied to one specific case.', 'Di sini peraturan umum digunakan pada satu kes khusus.') : T('Here a general conclusion is drawn from specific observations.', 'Di sini kesimpulan umum dibuat daripada pemerhatian khusus.')), sp: 'm' };
    },
    (r) => {
      const c = r.pick(IMP_CVF);
      return { q: T(`Premise 1: If ${c.p.en}, then ${c.q.en}. Premise 2: ${notEn(c.p.en)}. Can you validly conclude that "${notEn(c.q.en)}"? Explain.`, `Premis 1: Jika ${c.p.ms}, maka ${c.q.ms}. Premis 2: ${notMs(c.p.ms)}. Bolehkah anda menyimpulkan secara sah bahawa "${notMs(c.q.ms)}"? Terangkan.`), a: T(`No. Knowing that $p$ is false does not guarantee $q$ is false (e.g. ${c.cvCex.en}, so $q$ can still be true).`, `Tidak. Mengetahui $p$ salah tidak menjamin $q$ salah (cth. ${c.cvCex.ms}, jadi $q$ masih boleh betul).`), w: W(pqLine(c), DEN_P, cexLine(c.cvCex)), sp: 'm' };
    },
  ];
  // deductive vs inductive reasoning examples
  var REASON = [
    { text: T('All squares have four right angles. This shape is a square. Therefore, it has four right angles.', 'Semua segi empat sama mempunyai empat sudut tegak. Bentuk ini ialah segi empat sama. Oleh itu, ia mempunyai empat sudut tegak.'), kind: 'deductive', reason: T('the conclusion follows with certainty from a general rule applied to a specific case.', 'kesimpulan terhasil dengan pasti daripada peraturan am yang digunakan pada satu kes khusus.') },
    { text: T('The sun has risen in the east every day so far. Therefore, the sun will rise in the east tomorrow.', 'Matahari telah terbit di timur setiap hari sehingga kini. Oleh itu, matahari akan terbit di timur esok.'), kind: 'inductive', reason: T('the conclusion is a probable generalisation from repeated past observations, not a logical certainty.', 'kesimpulan itu ialah generalisasi berkemungkinan daripada pemerhatian lampau berulang, bukan suatu kepastian logik.') },
    { text: T('Every multiple of 4 is even. 20 is a multiple of 4. Therefore, 20 is even.', 'Setiap gandaan 4 ialah genap. 20 ialah gandaan 4. Oleh itu, 20 ialah genap.'), kind: 'deductive', reason: T('it applies a known general rule to a specific case to reach a certain conclusion.', 'ia menggunakan peraturan am yang diketahui pada satu kes khusus untuk mencapai kesimpulan yang pasti.') },
    { text: T('In the last 5 matches, the team won whenever it rained. Therefore, the team will probably win if it rains in the next match.', 'Dalam 5 perlawanan lepas, pasukan itu menang setiap kali hujan turun. Oleh itu, pasukan itu mungkin akan menang jika hujan turun pada perlawanan seterusnya.'), kind: 'inductive', reason: T('it generalises a probable trend from a limited number of past cases.', 'ia membuat generalisasi arah aliran berkemungkinan daripada bilangan kes lampau yang terhad.') },
    { text: T('If a number is negative, its square is positive. $-7$ is negative. Therefore, $(-7)^2$ is positive.', 'Jika suatu nombor negatif, kuasa duanya positif. $-7$ ialah negatif. Oleh itu, $(-7)^2$ adalah positif.'), kind: 'deductive', reason: T('it applies a general rule to a specific value with certainty.', 'ia menggunakan peraturan am pada satu nilai khusus dengan pasti.') },
    { text: T('Every sample of the metal tested so far has expanded when heated. Therefore, this metal probably expands when heated.', 'Setiap sampel logam itu yang diuji setakat ini mengembang apabila dipanaskan. Oleh itu, logam ini mungkin mengembang apabila dipanaskan.'), kind: 'inductive', reason: T('it draws a probable general conclusion from repeated experimental observations.', 'ia membuat kesimpulan am berkemungkinan daripada pemerhatian eksperimen yang berulang.') },
    { text: T('All equilateral triangles have three equal angles. Triangle $PQR$ is equilateral. Therefore, triangle $PQR$ has three equal angles.', 'Semua segi tiga sama sisi mempunyai tiga sudut yang sama. Segi tiga $PQR$ ialah sama sisi. Oleh itu, segi tiga $PQR$ mempunyai tiga sudut yang sama.'), kind: 'deductive', reason: T('the conclusion is guaranteed once the general rule and the specific case are both true.', 'kesimpulan itu terjamin apabila peraturan am dan kes khusus itu kedua-duanya betul.') },
    { text: T('Most students surveyed preferred durian over mango. Therefore, durian is probably more popular than mango among students in general.', 'Kebanyakan murid yang ditinjau lebih menyukai durian berbanding mangga. Oleh itu, durian mungkin lebih popular berbanding mangga dalam kalangan murid secara umum.'), kind: 'inductive', reason: T('it generalises from a survey sample to a wider population, with a probable, not certain, conclusion.', 'ia membuat generalisasi daripada sampel tinjauan kepada populasi yang lebih luas, dengan kesimpulan berkemungkinan, bukan pasti.') },
  ];
  // inductive-strength scenarios: sample size / method stated explicitly so strength is checkable
  var SCEN = [
    { text: T('Mei Ling asked 3 of her close friends which subject they find easiest, and all 3 said Mathematics. She concluded that Mathematics is the easiest subject for all students in her school.', 'Mei Ling bertanya 3 orang rakan karibnya subjek manakah yang paling mudah, dan ketiga-tiganya berkata Matematik. Dia menyimpulkan bahawa Matematik ialah subjek paling mudah bagi semua murid di sekolahnya.'), strong: false, reason: T('the sample is very small (3 friends) and not randomly or widely chosen, so it does not represent the whole school.', 'sampel itu sangat kecil (3 rakan) dan tidak dipilih secara rawak atau meluas, jadi ia tidak mewakili keseluruhan sekolah.') },
    { text: T('A researcher randomly surveyed 400 students from 8 different schools about their favourite subject. $62\\%$ chose Mathematics. She concluded that Mathematics is probably the most popular subject among students in these schools.', 'Seorang penyelidik meninjau secara rawak 400 orang murid daripada 8 buah sekolah berlainan tentang subjek kegemaran mereka. $62\\%$ memilih Matematik. Dia menyimpulkan bahawa Matematik mungkin subjek paling popular dalam kalangan murid di sekolah-sekolah ini.'), strong: true, reason: T('the sample is large, drawn randomly from multiple schools, and the conclusion is appropriately qualified with "probably".', 'sampel itu besar, diambil secara rawak daripada pelbagai sekolah, dan kesimpulan itu dinyatakan secara bersyarat dengan "mungkin".') },
    { text: T('After observing that it rained on 2 consecutive Mondays, Farid concluded that it always rains on Mondays.', 'Selepas memerhati hujan turun pada 2 hari Isnin berturut-turut, Farid menyimpulkan bahawa hujan sentiasa turun pada hari Isnin.'), strong: false, reason: T('only two observations from a short period cannot support such a sweeping, universal conclusion.', 'hanya dua pemerhatian daripada tempoh yang singkat tidak dapat menyokong kesimpulan yang menyeluruh sebegitu.') },
    { text: T('A weather station recorded rain on $90\\%$ of days over 30 years of monsoon-season data, and concluded that heavy rain is very likely during that period each year.', 'Sebuah stesen cuaca merekodkan hujan pada $90\\%$ hari sepanjang 30 tahun data musim tengkujuh, dan menyimpulkan bahawa hujan lebat sangat berkemungkinan berlaku dalam tempoh itu setiap tahun.'), strong: true, reason: T('long-term data over many years supports a reasonably confident, appropriately qualified conclusion.', 'data jangka panjang selama bertahun-tahun menyokong kesimpulan yang cukup yakin dan dinyatakan secara bersyarat.') },
    { text: T('A shop owner asked the first 5 customers of the day if they liked a new drink; all 5 said yes, so she concluded all her customers would like it.', 'Seorang pemilik kedai bertanya 5 pelanggan pertama pada hari itu sama ada mereka suka minuman baharu; kesemua 5 berkata ya, jadi dia menyimpulkan semua pelanggannya akan menyukainya.'), strong: false, reason: T('only the first 5 customers of one day were asked — too small and possibly unrepresentative of all customers.', 'hanya 5 pelanggan pertama pada satu hari ditanya — terlalu kecil dan mungkin tidak mewakili semua pelanggan.') },
    { text: T('A quality inspector randomly tested 200 out of 5000 light bulbs produced and found 196 working. She concluded that about $98\\%$ of the batch is probably working.', 'Seorang pemeriksa kualiti menguji secara rawak 200 daripada 5000 mentol yang dihasilkan dan mendapati 196 berfungsi. Dia menyimpulkan bahawa kira-kira $98\\%$ daripada kumpulan itu mungkin berfungsi.'), strong: true, reason: T('a reasonably large random sample from the batch supports a properly qualified estimate.', 'sampel rawak yang cukup besar daripada kumpulan itu menyokong anggaran yang dinyatakan secara bersyarat dengan wajar.') },
    { text: T('Because the class monitor is tall and plays basketball well, Aiman concluded that all tall students play basketball well.', 'Kerana ketua kelas bertubuh tinggi dan pandai bermain bola keranjang, Aiman menyimpulkan bahawa semua murid yang tinggi pandai bermain bola keranjang.'), strong: false, reason: T('one single example cannot establish a claim about all tall students.', 'satu contoh sahaja tidak dapat mewujudkan dakwaan tentang semua murid yang tinggi.') },
    { text: T('Doctors studied 1000 patients across several hospitals and found that $85\\%$ who took a new medicine recovered faster. They concluded that the medicine probably helps most patients recover faster.', 'Doktor mengkaji 1000 orang pesakit di beberapa hospital dan mendapati $85\\%$ yang mengambil ubat baharu pulih lebih cepat. Mereka menyimpulkan bahawa ubat itu mungkin membantu kebanyakan pesakit pulih lebih cepat.'), strong: true, reason: T('a large, multi-site sample supports a properly qualified conclusion.', 'sampel besar merentasi pelbagai lokasi menyokong kesimpulan yang dinyatakan secara bersyarat dengan wajar.') },
    { text: T('A tech company tested 300 randomly selected users across 5 countries and found $74\\%$ preferred the new app design; it concluded users probably prefer the new design.', 'Sebuah syarikat teknologi menguji 300 orang pengguna yang dipilih secara rawak merentasi 5 buah negara dan mendapati $74\\%$ lebih suka reka bentuk aplikasi baharu; ia menyimpulkan pengguna mungkin lebih suka reka bentuk baharu itu.'), strong: true, reason: T('a reasonably large, randomly chosen, multi-country sample supports a properly qualified conclusion.', 'sampel yang cukup besar, dipilih secara rawak merentasi pelbagai negara, menyokong kesimpulan yang dinyatakan secara bersyarat dengan wajar.') },
    { text: T('A blogger tried a new recipe once and it turned out well, then claimed the recipe always works perfectly.', 'Seorang blogger mencuba resipi baharu sekali dan ia menjadi sedap, lalu mendakwa resipi itu sentiasa berjaya dengan sempurna.'), strong: false, reason: T('a single trial cannot support a claim that it always works.', 'satu percubaan sahaja tidak dapat menyokong dakwaan bahawa ia sentiasa berjaya.') },
    { text: T('An agricultural officer sampled 250 durian trees, randomly selected across 6 orchards, and found $80\\%$ produced high-quality fruit after using a new fertiliser; she concluded the fertiliser probably improves fruit quality.', 'Seorang pegawai pertanian mengambil sampel 250 pokok durian, dipilih secara rawak merentasi 6 buah dusun, dan mendapati $80\\%$ menghasilkan buah berkualiti tinggi selepas menggunakan baja baharu; dia menyimpulkan baja itu mungkin meningkatkan kualiti buah.'), strong: true, reason: T('a reasonably large random sample across several orchards supports a properly qualified conclusion.', 'sampel rawak yang cukup besar merentasi beberapa dusun menyokong kesimpulan yang dinyatakan secara bersyarat dengan wajar.') },
    { text: T('A student solved 2 quadratic equations by factorisation and got clean integer roots both times, then claimed every quadratic equation can be solved by factorisation.', 'Seorang murid menyelesaikan 2 persamaan kuadratik dengan pemfaktoran dan mendapat punca integer yang kemas pada kedua-dua kali, lalu mendakwa setiap persamaan kuadratik boleh diselesaikan dengan pemfaktoran.'), strong: false, reason: T('only 2 specially behaved cases were checked; many quadratic equations do not have integer roots and cannot be factorised this way.', 'hanya 2 kes yang bersifat khas disemak; banyak persamaan kuadratik tidak mempunyai punca integer dan tidak boleh difaktorkan dengan cara ini.') },
  ];
  // cogency: strength of inference combined with truth of the stated premise
  var COG = [
    { text: T('An organiser claimed to have randomly surveyed 1000 students and found $90\\%$ prefer online classes, and concluded most students probably prefer online classes. It later turned out only 20 of his friends were actually asked.', 'Seorang penganjur mendakwa telah meninjau secara rawak 1000 orang murid dan mendapati $90\\%$ lebih suka kelas dalam talian, lalu menyimpulkan kebanyakan murid mungkin lebih suka kelas dalam talian. Kemudiannya didapati hanya 20 orang rakannya yang sebenarnya ditanya.'), strong: true, premiseTrue: false, reason: T('the inference would be strong if the claimed sample were real, but the premise (a large random sample) is false, so the argument is not cogent.', 'penaakulan itu akan kukuh jika sampel yang didakwa itu betul, tetapi premis (sampel rawak yang besar) adalah salah, jadi hujah itu tidak munasabah (cogent).') },
    { text: T('A genuine random survey of 500 students from 10 schools found $70\\%$ enjoy sports; the researcher concluded that sports are probably popular among students.', 'Satu tinjauan rawak sebenar terhadap 500 orang murid daripada 10 buah sekolah mendapati $70\\%$ gemar bersukan; penyelidik menyimpulkan bahawa sukan mungkin popular dalam kalangan murid.'), strong: true, premiseTrue: true, reason: T('the inference is strong and the premise is genuinely true, so the argument is cogent.', 'penaakulan itu kukuh dan premis itu benar-benar betul, jadi hujah itu munasabah (cogent).') },
    { text: T('Only 2 students were truly asked about their favourite fruit, and both said durian; it was concluded that all students like durian.', 'Hanya 2 orang murid yang benar-benar ditanya tentang buah kegemaran mereka, dan kedua-duanya berkata durian; disimpulkan bahawa semua murid menyukai durian.'), strong: false, premiseTrue: true, reason: T('the premise is true, but the inference is weak (too small a sample), so the argument is not cogent.', 'premis itu betul, tetapi penaakulan itu lemah (sampel terlalu kecil), jadi hujah itu tidak munasabah (cogent).') },
    { text: T('A report claimed 5000 people were surveyed nationwide and $95\\%$ supported a policy, concluding the policy is probably popular. The claimed survey never actually took place.', 'Satu laporan mendakwa 5000 orang ditinjau di seluruh negara dan $95\\%$ menyokong satu dasar, menyimpulkan dasar itu mungkin popular. Tinjauan yang didakwa itu sebenarnya tidak pernah berlaku.'), strong: true, premiseTrue: false, reason: T('the inference would be strong if the survey were real, but the premise is false (the survey never happened), so the argument is not cogent.', 'penaakulan itu akan kukuh jika tinjauan itu betul, tetapi premis itu salah (tinjauan itu tidak pernah berlaku), jadi hujah itu tidak munasabah (cogent).') },
    { text: T('A genuine study of 600 randomly selected drivers across 12 highways found $40\\%$ exceeded the speed limit; researchers concluded speeding is probably common among drivers on these highways.', 'Satu kajian sebenar terhadap 600 orang pemandu yang dipilih secara rawak merentasi 12 lebuh raya mendapati $40\\%$ melebihi had laju; penyelidik menyimpulkan memandu laju mungkin lazim dalam kalangan pemandu di lebuh raya ini.'), strong: true, premiseTrue: true, reason: T('the inference is strong and the premise is genuinely true, so the argument is cogent.', 'penaakulan itu kukuh dan premis itu benar-benar betul, jadi hujah itu munasabah (cogent).') },
    { text: T('A claim stated that "a few" drivers were asked informally and speeding seemed rare, but no survey of any kind was actually carried out.', 'Satu dakwaan menyatakan "beberapa" pemandu ditanya secara tidak formal dan memandu laju seolah-olah jarang berlaku, tetapi tiada tinjauan sebenar pernah dijalankan.'), strong: false, premiseTrue: false, reason: T('the sample is small and vague (weak), and the survey never actually happened (false), so the argument is clearly not cogent.', 'sampel itu kecil dan kabur (lemah), dan tinjauan itu sebenarnya tidak pernah berlaku (salah), jadi hujah itu jelas tidak munasabah (cogent).') },
  ];
  // number-pattern conjectures (inductive reasoning linked to Form 2 Ch1 patterns)
  var CONJ = [
    { terms: [1, 3, 5, 7], sums: [1, 4, 9, 16], desc: T('the sum of the first $n$ odd numbers', 'hasil tambah $n$ nombor ganjil pertama'), formula: '$n^2$', f: (n) => n * n },
    { terms: [1, 2, 3, 4], sums: [1, 3, 6, 10], desc: T('the $n$-th triangular number (dots arranged in a triangle)', 'nombor segi tiga ke-$n$ (titik yang disusun sebagai segi tiga)'), formula: '$\\dfrac{n(n+1)}{2}$', f: (n) => (n * (n + 1)) / 2 },
    { terms: [2, 4, 6, 8], sums: [2, 6, 12, 20], desc: T('the sum of the first $n$ even numbers', 'hasil tambah $n$ nombor genap pertama'), formula: '$n(n + 1)$', f: (n) => n * (n + 1) },
    { terms: [3, 6, 9, 12], sums: [3, 9, 18, 30], desc: T('the sum of the first $n$ multiples of 3', 'hasil tambah $n$ gandaan 3 pertama'), formula: '$\\dfrac{3n(n+1)}{2}$', f: (n) => (3 * n * (n + 1)) / 2 },
  ];
  const ga32 = [
    (r) => {
      const kinds = [
        { valid: true, prem: (c) => [c.p.en, c.p.ms], concl: (c) => [c.q.en, c.q.ms], how: F_II },
        { valid: false, prem: (c) => [c.q.en, c.q.ms], concl: (c) => [c.p.en, c.p.ms], how: AFF_Q },
        { valid: true, prem: (c) => [notEn(c.q.en), notMs(c.q.ms)], concl: (c) => [notEn(c.p.en), notMs(c.p.ms)], how: F_III },
        { valid: false, prem: (c) => [notEn(c.p.en), notMs(c.p.ms)], concl: (c) => [notEn(c.q.en), notMs(c.q.ms)], how: DEN_P },
      ];
      const k = r.pick(kinds), c = k.valid ? r.pick(IMP_T) : r.pick(IMP_CVF);
      const pr = k.prem(c), co = k.concl(c);
      return { q: T(`Premise 1: If ${c.p.en}, then ${c.q.en}. Premise 2: ${pr[0]}. Conclusion: ${co[0]}. Is the argument valid? Explain.`, `Premis 1: Jika ${c.p.ms}, maka ${c.q.ms}. Premis 2: ${pr[1]}. Kesimpulan: ${co[1]}. Adakah hujah itu sah? Terangkan.`), a: k.valid ? T('Valid: whenever both premises are true, the conclusion must be true.', 'Sah: apabila kedua-dua premis betul, kesimpulan mesti betul.') : T(`Not valid: both premises can be true while the conclusion is false (${c.cvCex.en}).`, `Tidak sah: kedua-dua premis boleh betul sementara kesimpulan salah (${c.cvCex.ms}).`), w: k.valid ? W(pqLine(c), k.how) : W(pqLine(c), k.how, cexLine(c.cvCex)), sp: 'm' };
    },
    (r) => {
      const c = r.pick(IMP_CVF);
      return { q: T(`The implication "If ${c.p.en}, then ${c.q.en}" is true. Its converse is "If ${c.q.en}, then ${c.p.en}." Show, using a counterexample, that the converse is false.`, `Implikasi "Jika ${c.p.ms}, maka ${c.q.ms}" adalah betul. Akasnya ialah "Jika ${c.q.ms}, maka ${c.p.ms}." Tunjukkan, menggunakan satu contoh penyangkal, bahawa akas itu salah.`), a: T(`${c.cvCex.en}, so the converse is false even though the original implication is true.`, `${c.cvCex.ms}, jadi akas itu salah walaupun implikasi asal itu betul.`), w: W(T('To show "if $q$, then $p$" is false, find one case where $q$ is true but $p$ is false.', 'Untuk menunjukkan "jika $q$, maka $p$" salah, cari satu kes di mana $q$ betul tetapi $p$ salah.'), cexLine(c.cvCex)), sp: 'm' };
    },
    (r) => {
      const two = r.sample(SCEN, 2);
      return { q: T(`Compare these two arguments: (a) "${two[0].text.en}" (b) "${two[1].text.en}" Which argument gives stronger evidence for its conclusion? Explain.`, `Bandingkan dua hujah ini: (a) "${two[0].text.ms}" (b) "${two[1].text.ms}" Hujah manakah memberikan bukti yang lebih kukuh bagi kesimpulannya? Terangkan.`), a: (() => {
        const stronger = two[0].strong && !two[1].strong ? 0 : !two[0].strong && two[1].strong ? 1 : null;
        if (stronger !== null) return T(`(${'ab'[stronger]}) is stronger: ${two[stronger].reason.en}`, `(${'ab'[stronger]}) lebih kukuh: ${two[stronger].reason.ms}`);
        return T(`Both give ${two[0].strong ? 'similarly strong' : 'similarly weak'} evidence: (a) ${two[0].reason.en} (b) ${two[1].reason.en}`, `Kedua-duanya memberikan bukti yang ${two[0].strong ? 'sama kukuh' : 'sama lemah'}: (a) ${two[0].reason.ms} (b) ${two[1].reason.ms}`);
      })(), w: W(STRONG, T(`(a) ${two[0].strong ? 'strong' : 'weak'}; (b) ${two[1].strong ? 'strong' : 'weak'}.`, `(a) ${two[0].strong ? 'kukuh' : 'lemah'}; (b) ${two[1].strong ? 'kukuh' : 'lemah'}.`)), sp: 'l' };
    },
    (r) => {
      const c = r.pick(COG);
      const cogent = c.strong && c.premiseTrue;
      return { q: T(`"${c.text.en}" Is this argument strong? Is its premise true? Is the argument cogent overall? Explain.`, `"${c.text.ms}" Adakah hujah ini kukuh? Adakah premisnya betul? Adakah hujah ini munasabah (cogent) secara keseluruhan? Terangkan.`), a: T(`Strong: ${c.strong ? 'yes' : 'no'}. Premise true: ${c.premiseTrue ? 'yes' : 'no'}. Cogent: ${cogent ? 'yes' : 'no'} — ${c.reason.en}`, `Kukuh: ${c.strong ? 'ya' : 'tidak'}. Premis betul: ${c.premiseTrue ? 'ya' : 'tidak'}. Munasabah (cogent): ${cogent ? 'ya' : 'tidak'} — ${c.reason.ms}`), w: W(T('An inductive argument is cogent only if it is strong and all its premises are true.', 'Hujah induktif adalah munasabah (cogent) hanya jika ia kukuh dan semua premisnya betul.'), T(`Strong: ${c.strong ? 'yes' : 'no'}; premise true: ${c.premiseTrue ? 'yes' : 'no'}; so cogent: ${cogent ? 'yes' : 'no'}.`, `Kukuh: ${c.strong ? 'ya' : 'tidak'}; premis betul: ${c.premiseTrue ? 'ya' : 'tidak'}; maka munasabah (cogent): ${cogent ? 'ya' : 'tidak'}.`)), sp: 'l' };
    },
    (r) => {
      const c = r.pick(CONJ);
      return { q: T(`Consider ${c.desc.en}: for $n = 1, 2, 3, 4$ the values are $${c.sums.join(', ')}$. Make a conjecture for a formula in terms of $n$, and state whether checking these 4 cases proves the formula for every $n$.`, `Pertimbangkan ${c.desc.ms}: bagi $n = 1, 2, 3, 4$ nilainya ialah $${c.sums.join(', ')}$. Buat satu konjektur bagi formula dalam sebutan $n$, dan nyatakan sama ada menyemak 4 kes ini membuktikan formula itu bagi setiap $n$.`), a: T(`The pattern suggests the formula is ${c.formula}. This is only a conjecture based on 4 cases; it is not a proof for all $n$ (a general algebraic proof would be needed).`, `Pola itu mencadangkan formulanya ialah ${c.formula}. Ini hanyalah konjektur berdasarkan 4 kes; ia bukan bukti bagi semua $n$ (bukti algebra am diperlukan).`), w: W(T(`Check: $n = 1, 2, 3, 4$ in ${c.formula} give $${[1, 2, 3, 4].map(c.f).join(', ')}$, matching the given values.`, `Semak: $n = 1, 2, 3, 4$ dalam ${c.formula} memberikan $${[1, 2, 3, 4].map(c.f).join(', ')}$, sepadan dengan nilai yang diberi.`), T('Checking a few cases is inductive reasoning: it supports a conjecture but does not prove it for every $n$.', 'Menyemak beberapa kes ialah penaakulan induktif: ia menyokong konjektur tetapi tidak membuktikannya bagi setiap $n$.')), sp: 'm' };
    },
    (r) => {
      const c = r.pick(SCEN.filter((x) => !x.strong));
      return { q: T(`"${c.text.en}" Explain why this argument is weak, and suggest one change that would make it a stronger inductive argument.`, `"${c.text.ms}" Terangkan mengapa hujah ini lemah, dan cadangkan satu perubahan yang akan menjadikannya hujah induktif yang lebih kukuh.`), a: T(`Weak because ${c.reason.en} A stronger argument would use a larger, randomly chosen and more representative sample, and state the conclusion as "probably" true rather than certain.`, `Lemah kerana ${c.reason.ms} Hujah yang lebih kukuh akan menggunakan sampel yang lebih besar, dipilih secara rawak dan lebih mewakili, serta menyatakan kesimpulan sebagai "mungkin" betul dan bukan pasti.`), w: W(STRONG, T(`Here, ${c.reason.en}`, `Di sini, ${c.reason.ms}`)), sp: 'm' };
    },
    (r) => {
      const c = r.pick(IMP_F);
      return { q: T(`(a) Is the implication "If ${c.p.en}, then ${c.q.en}" true or false? Justify your answer. (b) An argument uses this implication as premise 1, with premise 2 "${c.p.en}" (true) and conclusion "${c.q.en}". Is the argument valid? Is it sound?`, `(a) Adakah implikasi "Jika ${c.p.ms}, maka ${c.q.ms}" betul atau salah? Wajarkan jawapan anda. (b) Suatu hujah menggunakan implikasi ini sebagai premis 1, dengan premis 2 "${c.p.ms}" (betul) dan kesimpulan "${c.q.ms}". Adakah hujah itu sah? Adakah ia munasabah (sound)?`), a: T(`(a) False: ${c.ifCex.en} (b) Valid (correct logical form), but not sound because premise 1 is false.`, `(a) Salah: ${c.ifCex.ms} (b) Sah (bentuk logik yang betul), tetapi tidak munasabah kerana premis 1 salah.`), w: W(T(`(a) Counterexample: ${c.ifCex.en}, so the implication is false.`, `(a) Contoh penyangkal: ${c.ifCex.ms}, jadi implikasi itu salah.`), T(`(b) ${F_II.en}`, `(b) ${F_II.ms}`), SOUND), sp: 'l' };
    },
  ];
  SPM.extend('F4-3.2', { e: ge32, m: gm32, a: ga32 });

  /* =========================================================================================== F4-4 Operations on Sets */
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const inter = (a, b) => a.filter((x) => b.includes(x));
  const uni = (a, b) => [...new Set([...a, ...b])].sort((x, y) => x - y);
  const diff = (a, b) => a.filter((x) => !b.includes(x));
  const REG3 = ['A', 'B', 'C', 'AB', 'AC', 'BC', 'ABC', '0'];
  // build a canonical 8-region model from region sizes; derives A, B, C and the universe from it (guarantees consistency)
  const mkRegions = (sizes) => {
    let id = 1;
    const elems = {};
    for (const k of REG3) { elems[k] = []; for (let i = 0; i < (sizes[k] || 0); i++) elems[k].push(id++); }
    const setOf = (letter) => REG3.filter((k) => k.includes(letter)).flatMap((k) => elems[k]).sort((a, b) => a - b);
    return { elems, A: setOf('A'), B: setOf('B'), C: setOf('C'), U: REG3.flatMap((k) => elems[k]).sort((a, b) => a - b), sizes };
  };
  const mk2 = (r) => retry(() => {
    const m = mkRegions({ A: r.int(3, 6), B: r.int(3, 6), AB: r.int(1, 4), '0': r.int(2, 5) });
    need(m.A.length && m.B.length);
    return m;
  });
  const mk3 = (r) => retry(() => mkRegions({ A: r.int(1, 4), B: r.int(1, 4), C: r.int(1, 4), AB: r.int(1, 3), AC: r.int(1, 3), BC: r.int(1, 3), ABC: r.int(1, 2), '0': r.int(1, 4) }));
  // set-defining predicates over xi = {1, .., 20}, used for verbal/symbolic/roster tasks
  const UNI = range(1, 20);
  const SETDESC = [
    { en: 'multiples of 2', ms: 'gandaan 2', f: (x) => x % 2 === 0 },
    { en: 'multiples of 3', ms: 'gandaan 3', f: (x) => x % 3 === 0 },
    { en: 'multiples of 4', ms: 'gandaan 4', f: (x) => x % 4 === 0 },
    { en: 'multiples of 5', ms: 'gandaan 5', f: (x) => x % 5 === 0 },
    { en: 'factors of 24', ms: 'faktor bagi 24', f: (x) => 24 % x === 0 },
    { en: 'factors of 30', ms: 'faktor bagi 30', f: (x) => 30 % x === 0 },
    { en: 'prime numbers', ms: 'nombor perdana', f: (x) => isPrime(x) },
    { en: 'even numbers', ms: 'nombor genap', f: (x) => x % 2 === 0 },
    { en: 'odd numbers', ms: 'nombor ganjil', f: (x) => x % 2 !== 0 },
    { en: 'perfect squares', ms: 'nombor kuasa dua sempurna', f: (x) => Number.isInteger(Math.sqrt(x)) },
    { en: 'numbers greater than 10', ms: 'nombor lebih besar daripada 10', f: (x) => x > 10 },
    { en: 'numbers less than 8', ms: 'nombor kurang daripada 8', f: (x) => x < 8 },
  ];
  const twoDesc = (r) => retry(() => {
    const [P, Q] = r.sample(SETDESC, 2);
    const sp = UNI.filter(P.f), sq = UNI.filter(Q.f);
    need(sp.length && sq.length && (sp.length !== UNI.length) && (sq.length !== UNI.length));
    return { P, Q, sp, sq };
  });
  const DISJ = [
    [{ en: 'even numbers', ms: 'nombor genap', f: (x) => x % 2 === 0 }, { en: 'odd numbers', ms: 'nombor ganjil', f: (x) => x % 2 !== 0 }],
    [{ en: 'multiples of 3', ms: 'gandaan 3', f: (x) => x % 3 === 0 }, { en: 'numbers leaving remainder 1 when divided by 3', ms: 'nombor yang meninggalkan baki 1 apabila dibahagikan dengan 3', f: (x) => x % 3 === 1 }],
    [{ en: 'multiples of 4', ms: 'gandaan 4', f: (x) => x % 4 === 0 }, { en: 'numbers leaving remainder 2 when divided by 4', ms: 'nombor yang meninggalkan baki 2 apabila dibahagikan dengan 4', f: (x) => x % 4 === 2 }],
  ];
  // word-problem contexts: two distinct items from a shared bilingual bank, with a matching verb
  const CTXB = [
    { items: SPM.bank.sports, verbEn: 'play', verbMs: 'bermain' },
    { items: SPM.bank.subjects, verbEn: 'like', verbMs: 'gemar' },
    { items: SPM.bank.clubs, verbEn: 'join', verbMs: 'menyertai' },
  ];
  const pickCtx2 = (r) => { const b = r.pick(CTXB); const [x, y] = r.sample(b.items, 2); return { x, y, verbEn: b.verbEn, verbMs: b.verbMs }; };
  const pickCtx3 = (r) => { const b = r.pick(CTXB.filter((c) => c.items.length >= 3)); const [x, y, z] = r.sample(b.items, 3); return { x, y, z, verbEn: b.verbEn, verbMs: b.verbMs }; };
  // named region expressions for a 2-set / 3-set Venn diagram (key(s) into REG3 that the expression selects)
  // [expression, regions, what the region is (for the working)]
  const E2 = [
    ['A \\cap B', ['AB'], T('in both $A$ and $B$ (the overlap)', 'dalam kedua-dua $A$ dan $B$ (kawasan bertindih)')],
    ['A \\cup B', ['A', 'B', 'AB'], T('in $A$ or $B$ or both (everything inside the circles)', 'dalam $A$ atau $B$ atau kedua-duanya (semua di dalam bulatan)')],
    ["A'", ['B', '0'], T('not in $A$', 'tidak dalam $A$')], ["B'", ['A', '0'], T('not in $B$', 'tidak dalam $B$')],
    ["(A \\cup B)'", ['0'], T('outside both circles, i.e. not in $A \\cup B$', 'di luar kedua-dua bulatan, iaitu tidak dalam $A \\cup B$')],
    ["(A \\cap B)'", ['A', 'B', '0'], T('everything except the overlap, i.e. not in $A \\cap B$', 'semua kecuali kawasan bertindih, iaitu tidak dalam $A \\cap B$')],
    ["A \\cap B'", ['A'], T('in $A$ but not in $B$ ($A$ only)', 'dalam $A$ tetapi tidak dalam $B$ ($A$ sahaja)')],
    ["A' \\cap B", ['B'], T('in $B$ but not in $A$ ($B$ only)', 'dalam $B$ tetapi tidak dalam $A$ ($B$ sahaja)')],
    ["A' \\cup B", ['B', 'AB', '0'], T("in $B$ or not in $A$: everything except $A$ only, i.e. $A'$ together with $B$", "dalam $B$ atau tidak dalam $A$: semua kecuali $A$ sahaja, iaitu $A'$ bersama $B$")],
    ["A \\cup B'", ['A', 'AB', '0'], T("in $A$ or not in $B$: everything except $B$ only, i.e. $A$ together with $B'$", "dalam $A$ atau tidak dalam $B$: semua kecuali $B$ sahaja, iaitu $A$ bersama $B'$")],
  ];
  const E3 = [
    ['A \\cap B \\cap C', ['ABC'], T('in all three sets (the centre)', 'dalam ketiga-tiga set (bahagian tengah)')],
    ['A \\cup B \\cup C', ['A', 'B', 'C', 'AB', 'AC', 'BC', 'ABC'], T('in at least one of the three sets', 'dalam sekurang-kurangnya satu daripada tiga set')],
    ["(A \\cup B \\cup C)'", ['0'], T('outside all three circles', 'di luar ketiga-tiga bulatan')],
    ['A \\cap B', ['AB', 'ABC'], T('in both $A$ and $B$, whether in $C$ or not', 'dalam kedua-dua $A$ dan $B$, sama ada dalam $C$ atau tidak')],
    ['(A \\cap B) \\cup C', ['AB', 'ABC', 'C', 'AC', 'BC'], T('the whole of $C$, together with the overlap of $A$ and $B$', 'seluruh $C$, bersama kawasan bertindih $A$ dan $B$')],
    ["A \\cap B' \\cap C'", ['A'], T('in $A$ but not in $B$ and not in $C$ ($A$ only)', 'dalam $A$ tetapi tidak dalam $B$ dan tidak dalam $C$ ($A$ sahaja)')],
    ['(A \\cup B) \\cap C', ['AC', 'BC', 'ABC'], T('the part of $C$ that is also in $A$ or $B$', 'bahagian $C$ yang juga dalam $A$ atau $B$')],
    ["A \\cap B \\cap C'", ['AB'], T('in both $A$ and $B$ but not in $C$', 'dalam kedua-dua $A$ dan $B$ tetapi tidak dalam $C$')],
    ['(A \\cap C) \\cup (B \\cap C)', ['AC', 'BC', 'ABC'], T('the overlap of $A$ and $C$ together with the overlap of $B$ and $C$', 'kawasan bertindih $A$ dan $C$ bersama kawasan bertindih $B$ dan $C$')],
    ["A' \\cap B' \\cap C'", ['0'], T('not in $A$, not in $B$ and not in $C$', 'tidak dalam $A$, tidak dalam $B$ dan tidak dalam $C$')],
    ["(A \\cap B) \\cup (A \\cap C) \\cup (B \\cap C)", ['AB', 'AC', 'BC', 'ABC'], T('in at least two of the three sets', 'dalam sekurang-kurangnya dua daripada tiga set')],
  ];
  /** working for "which expression is the shaded region": what the region is, plus any equivalent expression */
  const shadeW = (list, name) => {
    const e = list.find((x) => x[0] === name), k = e[1].slice().sort().join();
    const eq = list.filter((x) => x !== e && x[1].slice().sort().join() === k).map((x) => `$${x[0]}$`);
    const out = [T(`The shaded region is ${e[2].en}: $${name}$.`, `Kawasan berlorek ialah ${e[2].ms}: $${name}$.`)];
    if (eq.length) out.push(T(`(Equivalent answer: ${eq.join(', ')}.)`, `(Jawapan yang setara: ${eq.join(', ')}.)`));
    return out;
  };
  /** "$X = {...}$" line */
  const setL = (name, l) => `$${name} = ${rst(l)}$`;
  const INTER = T('$A \\cap B$ contains the elements that are in both $A$ and $B$.', '$A \\cap B$ mengandungi unsur yang berada dalam kedua-dua $A$ dan $B$.');
  const UNION = T('$A \\cup B$ contains every element of $A$ or $B$ (or both), each written once.', '$A \\cup B$ mengandungi setiap unsur $A$ atau $B$ (atau kedua-duanya), setiap satu ditulis sekali.');
  const NU = T('$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$', '$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$');
  const vennElems = (m, shade, is3) => S.venn({ sets: is3 ? 3 : 2, elems: m.elems, shade, names: is3 ? ['A', 'B', 'C'] : ['A', 'B'] });
  const vennCounts = (sizes, is3) => S.venn({ sets: is3 ? 3 : 2, counts: sizes, names: is3 ? ['A', 'B', 'C'] : ['A', 'B'] });
  const regElems = (m, keys) => keys.flatMap((k) => m.elems[k]).sort((a, b) => a - b);

  /* --------------------------------------------------------------------------------------- F4-4.1 Intersection */
  const g41e = [
    (r) => {
      const m = mk2(r);
      return { q: T(`$A = ${roster(m.A)}$ and $B = ${roster(m.B)}$. List the elements of $A \\cap B$ and state $n(A \\cap B)$.`, `$A = ${roster(m.A)}$ dan $B = ${roster(m.B)}$. Senaraikan unsur bagi $A \\cap B$ dan nyatakan $n(A \\cap B)$.`), a: T(`$A \\cap B = ${roster(m.elems.AB)}$; $n(A \\cap B) = ${m.elems.AB.length}$`), w: W(INTER, setL('A \\cap B', m.elems.AB), `$n(A \\cap B) = ${m.elems.AB.length}$`), sp: 's' };
    },
    (r) => {
      const [P, Q] = r.pick(DISJ);
      return { q: T(`$\\xi = ${roster(UNI)}$. $P$ = the set of ${P.en}, $Q$ = the set of ${Q.en}. Find $P \\cap Q$. What can you say about $P$ and $Q$?`, `$\\xi = ${roster(UNI)}$. $P$ = set ${P.ms}, $Q$ = set ${Q.ms}. Cari $P \\cap Q$. Apakah yang boleh anda katakan tentang $P$ dan $Q$?`), a: T('$P \\cap Q = \\varnothing$: the sets are disjoint (no common elements).', '$P \\cap Q = \\varnothing$: set-set itu tidak bertindih (tiada unsur sepunya).'), w: W(setL('P', UNI.filter(P.f)), setL('Q', UNI.filter(Q.f)), T('No number is in both lists, so $P \\cap Q = \\varnothing$.', 'Tiada nombor dalam kedua-dua senarai, jadi $P \\cap Q = \\varnothing$.')), sp: 's' };
    },
    (r) => {
      const { P, Q, sp, sq } = twoDesc(r);
      const x = r.pick(UNI);
      const inBoth = P.f(x) && Q.f(x);
      return { q: T(`$\\xi = ${roster(UNI)}$. $P$ = the set of ${P.en}, $Q$ = the set of ${Q.en}. Is $${x} \\in P \\cap Q$? Justify your answer.`, `$\\xi = ${roster(UNI)}$. $P$ = set ${P.ms}, $Q$ = set ${Q.ms}. Adakah $${x} \\in P \\cap Q$? Wajarkan jawapan anda.`), a: T(`${inBoth ? 'Yes' : 'No'}: $${x}$ is ${P.f(x) ? '' : 'not '}among the ${P.en} and is ${Q.f(x) ? '' : 'not '}among the ${Q.en}, so both conditions must hold to be in $P \\cap Q$.`, `${inBoth ? 'Ya' : 'Tidak'}: $${x}$ ${P.f(x) ? '' : 'bukan '}${P.ms} dan ${Q.f(x) ? '' : 'bukan '}${Q.ms}, dan kedua-dua syarat mesti dipenuhi untuk berada dalam $P \\cap Q$.`), w: W(setL('P', sp), setL('Q', sq), `$${x} ${P.f(x) ? '\\in' : '\\notin'} P$, $${x} ${Q.f(x) ? '\\in' : '\\notin'} Q$`, inBoth ? T(`$${x}$ is in both sets, so $${x} \\in P \\cap Q$.`, `$${x}$ berada dalam kedua-dua set, jadi $${x} \\in P \\cap Q$.`) : T(`$${x}$ is not in both sets, so $${x} \\notin P \\cap Q$.`, `$${x}$ tidak berada dalam kedua-dua set, jadi $${x} \\notin P \\cap Q$.`)), sp: 's' };
    },
    (r) => {
      const { x, y, verbEn, verbMs } = pickCtx2(r);
      const opts = r.shuffle([['A \\cap B', true], ["A \\cup B", false], ["A'", false], ["A - B", false]]);
      return { q: T(`Let $A$ be the set of students who ${verbEn} ${x.en}, and $B$ be the set of students who ${verbEn} ${y.en}. Which set notation represents "students who ${verbEn} both ${x.en1 || x.en} and ${y.en1 || y.en}"? ${opts.map((o, i) => `(${'ABCD'[i]}) $${o[0]}$`).join('  ')}`, `Katakan $A$ ialah set murid yang ${verbMs} ${x.ms}, dan $B$ ialah set murid yang ${verbMs} ${y.ms}. Tatatanda set manakah mewakili "murid yang ${verbMs} kedua-dua ${x.ms} dan ${y.ms}"? ${opts.map((o, i) => `(${'ABCD'[i]}) $${o[0]}$`).join('  ')}`), a: T(`(${'ABCD'[opts.findIndex((o) => o[1])]}) $A \\cap B$`, `(${'ABCD'[opts.findIndex((o) => o[1])]}) $A \\cap B$`), w: W(T('"Both … and …" means in $A$ and also in $B$: the intersection $A \\cap B$.', '"Kedua-dua … dan …" bermaksud dalam $A$ dan juga dalam $B$: persilangan $A \\cap B$.')), sp: 's' };
    },
    (r) => {
      const m = mk2(r);
      const fig = vennElems(m, ['AB'], false);
      return { q: T('The Venn diagram shows sets $A$ and $B$. What does the shaded region represent? Write it in set notation and list its elements.', 'Gambar rajah Venn menunjukkan set $A$ dan $B$. Apakah yang diwakili oleh kawasan berlorek? Tulis dalam tatatanda set dan senaraikan unsurnya.'), fig, a: T(`$A \\cap B = ${roster(m.elems.AB)}$`), w: W(...shadeW(E2, 'A \\cap B'), setL('A \\cap B', m.elems.AB)), sp: 's' };
    },
  ];
  const g41m = [
    (r) => {
      const a = r.int(10, 26), b = r.int(10, 26), u = r.int(Math.max(a, b) + 2, a + b);
      const c = a + b - u;
      need(c >= 1 && c < Math.min(a, b));
      return { q: T(`$n(A) = ${a}$, $n(B) = ${b}$ and $n(A \\cup B) = ${u}$. Find $n(A \\cap B)$.`, `$n(A) = ${a}$, $n(B) = ${b}$ dan $n(A \\cup B) = ${u}$. Cari $n(A \\cap B)$.`), a: T(`$n(A \\cap B) = ${a} + ${b} - ${u} = ${c}$`), w: W(NU, `$${u} = ${a} + ${b} - n(A \\cap B)$`, `$n(A \\cap B) = ${a} + ${b} - ${u} = ${c}$`), sp: 's' };
    },
    (r) => {
      const m = mk2(r);
      const [name, keys] = r.pick(E2.filter((e) => ['A \\cap B', "A \\cap B'", "A' \\cap B"].includes(e[0])));
      const fig = vennElems(m, keys, false);
      return { q: T('The Venn diagram shows sets $A$ and $B$. Which set operation is represented by the shaded region? Write it using set notation and list its elements.', 'Gambar rajah Venn menunjukkan set $A$ dan $B$. Operasi set manakah yang diwakili oleh kawasan berlorek? Tulis menggunakan tatatanda set dan senaraikan unsurnya.'), fig, a: T(`$${name} = ${roster(regElems(m, keys))}$`), w: W(...shadeW(E2, name), setL(name, regElems(m, keys))), sp: 's' };
    },
    (r) => {
      const { x, y, verbEn, verbMs } = pickCtx2(r);
      const both = r.int(4, 12), onlyX = r.int(3, 12), onlyY = r.int(3, 12);
      const tot = both + onlyX + onlyY + r.int(0, 5);
      return { q: T(`In a group of ${tot} students, ${onlyX + both} ${verbEn} ${x.en}, ${onlyY + both} ${verbEn} ${y.en}, and ${both} ${verbEn} both. Find the number of students who ${verbEn} only ${x.en1 || x.en}.`, `Dalam sekumpulan ${tot} orang murid, ${onlyX + both} ${verbMs} ${x.ms}, ${onlyY + both} ${verbMs} ${y.ms}, dan ${both} ${verbMs} kedua-duanya. Cari bilangan murid yang ${verbMs} ${x.ms} sahaja.`), a: T(`${onlyX + both} - ${both} = ${onlyX}`), w: W(T(`Only ${x.en1 || x.en} = all who ${verbEn} ${x.en} minus those who ${verbEn} both.`, `${x.ms} sahaja = semua yang ${verbMs} ${x.ms} tolak mereka yang ${verbMs} kedua-duanya.`), `$${onlyX + both} - ${both} = ${onlyX}$`), sp: 's' };
    },
    (r) => {
      const { P, Q, sp, sq } = twoDesc(r);
      return { q: T(`$\\xi = ${roster(UNI)}$. $P = \\{x : x \\text{ is one of the ${P.en}}, x \\in \\xi\\}$, $Q = \\{x : x \\text{ is one of the ${Q.en}}, x \\in \\xi\\}$. List the elements of $P \\cap Q$.`, `$\\xi = ${roster(UNI)}$. $P = \\{x : x \\text{ ialah salah satu ${P.ms}}, x \\in \\xi\\}$, $Q = \\{x : x \\text{ ialah salah satu ${Q.ms}}, x \\in \\xi\\}$. Senaraikan unsur bagi $P \\cap Q$.`), a: T(`$P \\cap Q = ${rst(inter(sp, sq))}$`), w: W(setL('P', sp), setL('Q', sq), T('Take the elements common to both lists.', 'Ambil unsur sepunya dalam kedua-dua senarai.'), setL('P \\cap Q', inter(sp, sq))), sp: 's' };
    },
    (r) => {
      const preds = r.sample(SETDESC, 3);
      const sets = preds.map((p) => UNI.filter(p.f));
      const pick2 = r.shuffle([0, 1, 2]).slice(0, 2);
      return { q: T(`$\\xi = ${roster(UNI)}$. $P$ = the set of ${preds[0].en}, $Q$ = the set of ${preds[1].en}, $R$ = the set of ${preds[2].en}. Find $${'PQR'[pick2[0]]} \\cap ${'PQR'[pick2[1]]}$.`, `$\\xi = ${roster(UNI)}$. $P$ = set ${preds[0].ms}, $Q$ = set ${preds[1].ms}, $R$ = set ${preds[2].ms}. Cari $${'PQR'[pick2[0]]} \\cap ${'PQR'[pick2[1]]}$.`), a: T(`$${rst(inter(sets[pick2[0]], sets[pick2[1]]))}$`), w: W(setL('PQR'[pick2[0]], sets[pick2[0]]), setL('PQR'[pick2[1]], sets[pick2[1]]), T('Take the elements common to both sets.', 'Ambil unsur sepunya dalam kedua-dua set.'), setL(`${'PQR'[pick2[0]]} \\cap ${'PQR'[pick2[1]]}`, inter(sets[pick2[0]], sets[pick2[1]]))), sp: 's' };
    },
  ];
  const g41a = [
    (r) => {
      const preds = r.sample(SETDESC, 3);
      const sets = preds.map((p) => UNI.filter(p.f));
      const abc = inter(inter(sets[0], sets[1]), sets[2]);
      return { q: T(`$\\xi = ${roster(UNI)}$, $P$ = the set of ${preds[0].en}, $Q$ = the set of ${preds[1].en}, $R$ = the set of ${preds[2].en}. Find (a) $P \\cap Q$, (b) $Q \\cap R$, (c) $P \\cap Q \\cap R$.`, `$\\xi = ${roster(UNI)}$, $P$ = set ${preds[0].ms}, $Q$ = set ${preds[1].ms}, $R$ = set ${preds[2].ms}. Cari (a) $P \\cap Q$, (b) $Q \\cap R$, (c) $P \\cap Q \\cap R$.`), a: T(`(a) $${rst(inter(sets[0], sets[1]))}$ (b) $${rst(inter(sets[1], sets[2]))}$ (c) $${rst(abc)}$`), w: W(setL('P', sets[0]), setL('Q', sets[1]), setL('R', sets[2]), `(a) ${setL('P \\cap Q', inter(sets[0], sets[1]))}`, `(b) ${setL('Q \\cap R', inter(sets[1], sets[2]))}`, T(`(c) elements of $P \\cap Q$ that are also in $R$: ${setL('P \\cap Q \\cap R', abc)}`, `(c) unsur $P \\cap Q$ yang juga dalam $R$: ${setL('P \\cap Q \\cap R', abc)}`)), sp: 'm' };
    },
    (r) => {
      const m = mk3(r);
      const [name, keys] = r.pick(E3.filter((e) => e[1].length <= 3));
      const fig = vennElems(m, keys, true);
      return { q: T('The Venn diagram shows three sets. Write, in set notation, an expression for the shaded region.', 'Gambar rajah Venn menunjukkan tiga set. Tulis, dalam tatatanda set, satu ungkapan bagi kawasan berlorek.'), fig, a: T(`$${name}$`), w: W(...shadeW(E3, name)), sp: 's' };
    },
    (r) => {
      const { x, y, verbEn, verbMs } = pickCtx2(r);
      const tot = r.int(40, 70), a = r.int(15, 30), b = r.int(15, 30), neither = r.int(3, 10);
      need(a + b - neither <= tot && a + b - tot + neither >= 1 && tot - neither >= Math.max(a, b));
      const c = a + b - (tot - neither);
      return { q: T(`In a survey of ${tot} students, ${a} ${verbEn} ${x.en}, ${b} ${verbEn} ${y.en}, and ${neither} ${verbEn} neither. Find the number of students who ${verbEn} both ${x.en1 || x.en} and ${y.en1 || y.en}.`, `Dalam satu tinjauan terhadap ${tot} orang murid, ${a} ${verbMs} ${x.ms}, ${b} ${verbMs} ${y.ms}, dan ${neither} tidak ${verbMs} mana-mana satu. Cari bilangan murid yang ${verbMs} kedua-dua ${x.ms} dan ${y.ms}.`), a: T(`$n(A \\cup B) = ${tot} - ${neither} = ${tot - neither}$; $n(A \\cap B) = ${a} + ${b} - ${tot - neither} = ${c}$`), w: W(T(`Students who ${verbEn} at least one: $n(A \\cup B) = ${tot} - ${neither} = ${tot - neither}$`, `Murid yang ${verbMs} sekurang-kurangnya satu: $n(A \\cup B) = ${tot} - ${neither} = ${tot - neither}$`), NU, `$${tot - neither} = ${a} + ${b} - n(A \\cap B)$`, `$n(A \\cap B) = ${a} + ${b} - ${tot - neither} = ${c}$`), sp: 'm' };
    },
    (r) => {
      const { x, y, z, verbEn, verbMs } = pickCtx3(r);
      return retry(() => {
        const reg = { A: r.int(2, 6), B: r.int(2, 6), C: r.int(2, 6), AB: r.int(1, 4), AC: r.int(1, 4), BC: r.int(1, 4), ABC: r.int(1, 3), '0': r.int(2, 6) };
        const m = mkRegions(reg);
        const tot = m.U.length;
        const fig = vennCounts(reg, true);
        return { q: T(`A survey of ${tot} students asked about three activities: $A$ (${verbEn} ${x.en}), $B$ (${verbEn} ${y.en}) and $C$ (${verbEn} ${z.en}). ${m.A.length} are in $A$, ${m.B.length} in $B$ and ${m.C.length} in $C$; ${reg.AB + reg.ABC} are in both $A$ and $B$, ${reg.AC + reg.ABC} in both $A$ and $C$, ${reg.BC + reg.ABC} in both $B$ and $C$; ${reg['0']} are in none of the three. Find $n(A \\cap B \\cap C)$.`, `Satu tinjauan terhadap ${tot} orang murid bertanya tentang tiga aktiviti: $A$ (${verbMs} ${x.ms}), $B$ (${verbMs} ${y.ms}) dan $C$ (${verbMs} ${z.ms}). ${m.A.length} dalam $A$, ${m.B.length} dalam $B$ dan ${m.C.length} dalam $C$; ${reg.AB + reg.ABC} dalam kedua-dua $A$ dan $B$, ${reg.AC + reg.ABC} dalam kedua-dua $A$ dan $C$, ${reg.BC + reg.ABC} dalam kedua-dua $B$ dan $C$; ${reg['0']} tidak termasuk mana-mana satu. Cari $n(A \\cap B \\cap C)$.`), a: T(`$n(A \\cap B \\cap C) = ${reg.ABC}$ ${fig}`, `$n(A \\cap B \\cap C) = ${reg.ABC}$ ${fig}`), w: (() => {
          const nAB = reg.AB + reg.ABC, nAC = reg.AC + reg.ABC, nBC = reg.BC + reg.ABC, s3 = m.A.length + m.B.length + m.C.length, s2 = nAB + nAC + nBC;
          const x = tot - reg['0'] - s3 + s2;
          need(x === reg.ABC);
          return W(T('Let $x = n(A \\cap B \\cap C)$. Then only $A$ and $B$ $= ' + nAB + ' - x$, only $A$ and $C$ $= ' + nAC + ' - x$, only $B$ and $C$ $= ' + nBC + ' - x$.', 'Katakan $x = n(A \\cap B \\cap C)$. Maka $A$ dan $B$ sahaja $= ' + nAB + ' - x$, $A$ dan $C$ sahaja $= ' + nAC + ' - x$, $B$ dan $C$ sahaja $= ' + nBC + ' - x$.'),
            T('Adding all regions of the Venn diagram gives $n(\\xi) = n(A) + n(B) + n(C) - n(A \\cap B) - n(A \\cap C) - n(B \\cap C) + x + n((A \\cup B \\cup C)\')$', 'Menambah semua kawasan gambar rajah Venn memberikan $n(\\xi) = n(A) + n(B) + n(C) - n(A \\cap B) - n(A \\cap C) - n(B \\cap C) + x + n((A \\cup B \\cup C)\')$'),
            `$${tot} = ${m.A.length} + ${m.B.length} + ${m.C.length} - ${nAB} - ${nAC} - ${nBC} + x + ${reg['0']}$`,
            `$${tot} = ${s3 - s2 + reg['0']} + x$`, `$x = ${x}$`);
        })(), sp: 'xl' };
      });
    },
  ];
  SPM.extend('F4-4.1', { e: g41e, m: g41m, a: g41a });

  /* --------------------------------------------------------------------------------------------- F4-4.2 Union */
  const g42e = [
    (r) => {
      const m = mk2(r);
      return { q: T(`$A = ${roster(m.A)}$ and $B = ${roster(m.B)}$. List the elements of $A \\cup B$ and state $n(A \\cup B)$.`, `$A = ${roster(m.A)}$ dan $B = ${roster(m.B)}$. Senaraikan unsur bagi $A \\cup B$ dan nyatakan $n(A \\cup B)$.`), a: T(`$A \\cup B = ${roster(uni(m.A, m.B))}$; $n(A \\cup B) = ${uni(m.A, m.B).length}$`), w: W(UNION, setL('A \\cup B', uni(m.A, m.B)), T(`Check: $n(A \\cup B) = n(A) + n(B) - n(A \\cap B) = ${m.A.length} + ${m.B.length} - ${m.elems.AB.length} = ${uni(m.A, m.B).length}$`, `Semak: $n(A \\cup B) = n(A) + n(B) - n(A \\cap B) = ${m.A.length} + ${m.B.length} - ${m.elems.AB.length} = ${uni(m.A, m.B).length}$`)), sp: 's' };
    },
    (r) => {
      const { P, Q, sp, sq } = twoDesc(r);
      return { q: T(`$\\xi = ${roster(UNI)}$. $P$ = the set of ${P.en}, $Q$ = the set of ${Q.en}. List the elements of $P \\cup Q$.`, `$\\xi = ${roster(UNI)}$. $P$ = set ${P.ms}, $Q$ = set ${Q.ms}. Senaraikan unsur bagi $P \\cup Q$.`), a: T(`$P \\cup Q = ${roster(uni(sp, sq))}$`), w: W(setL('P', sp), setL('Q', sq), T('Combine both lists, writing common elements only once.', 'Gabungkan kedua-dua senarai, tulis unsur sepunya sekali sahaja.'), setL('P \\cup Q', uni(sp, sq))), sp: 's' };
    },
    (r) => {
      const { x, y, verbEn, verbMs } = pickCtx2(r);
      const opts = r.shuffle([['A \\cup B', true], ['A \\cap B', false], ["A'", false], ["A \\cap B'", false]]);
      return { q: T(`Let $A$ be the set of students who ${verbEn} ${x.en}, and $B$ be the set of students who ${verbEn} ${y.en}. Which set notation represents "students who ${verbEn} ${x.en1 || x.en}, ${y.en1 || y.en}, or both"? ${opts.map((o, i) => `(${'ABCD'[i]}) $${o[0]}$`).join('  ')}`, `Katakan $A$ ialah set murid yang ${verbMs} ${x.ms}, dan $B$ ialah set murid yang ${verbMs} ${y.ms}. Tatatanda set manakah mewakili "murid yang ${verbMs} ${x.ms}, ${y.ms}, atau kedua-duanya"? ${opts.map((o, i) => `(${'ABCD'[i]}) $${o[0]}$`).join('  ')}`), a: T(`(${'ABCD'[opts.findIndex((o) => o[1])]}) $A \\cup B$`, `(${'ABCD'[opts.findIndex((o) => o[1])]}) $A \\cup B$`), w: W(T('"$x$, $y$ or both" means in $A$ or in $B$ (or both): the union $A \\cup B$.', '"$x$, $y$ atau kedua-duanya" bermaksud dalam $A$ atau dalam $B$ (atau kedua-duanya): kesatuan $A \\cup B$.')), sp: 's' };
    },
    (r) => {
      const m = mk2(r);
      const fig = vennElems(m, ['A', 'B', 'AB'], false);
      return { q: T('The Venn diagram shows sets $A$ and $B$. What does the shaded region represent? Write it in set notation and list its elements.', 'Gambar rajah Venn menunjukkan set $A$ dan $B$. Apakah yang diwakili oleh kawasan berlorek? Tulis dalam tatatanda set dan senaraikan unsurnya.'), fig, a: T(`$A \\cup B = ${roster(uni(m.A, m.B))}$`), w: W(...shadeW(E2, 'A \\cup B'), setL('A \\cup B', uni(m.A, m.B))), sp: 's' };
    },
    (r) => {
      const m = mk2(r);
      const combined = uni(m.A, m.B);
      const opts = r.shuffle([[combined, true], [m.elems.AB, false], [m.A, false]]);
      return { q: T(`$A = ${roster(m.A)}$ and $B = ${roster(m.B)}$. Which of these is $A \\cup B$? (A) $${roster(opts[0][0])}$ (B) $${roster(opts[1][0])}$ (C) $${roster(opts[2][0])}$`, `$A = ${roster(m.A)}$ dan $B = ${roster(m.B)}$. Yang manakah $A \\cup B$? (A) $${roster(opts[0][0])}$ (B) $${roster(opts[1][0])}$ (C) $${roster(opts[2][0])}$`), a: T(`(${'ABC'[opts.findIndex((o) => o[1])]}) $${roster(combined)}$`), w: W(UNION, setL('A \\cup B', combined), T('The other options are $A \\cap B$ and $A$ itself.', 'Pilihan lain ialah $A \\cap B$ dan $A$ sendiri.')), sp: 's' };
    },
  ];
  const g42m = [
    (r) => {
      const a = r.int(8, 20), b = r.int(8, 20), c = r.int(2, Math.min(a, b) - 2);
      return { q: T(`$n(A) = ${a}$, $n(B) = ${b}$ and $n(A \\cap B) = ${c}$. Find $n(A \\cup B)$.`, `$n(A) = ${a}$, $n(B) = ${b}$ dan $n(A \\cap B) = ${c}$. Cari $n(A \\cup B)$.`), a: T(`$n(A \\cup B) = ${a} + ${b} - ${c} = ${a + b - c}$`), w: W(NU, `$n(A \\cup B) = ${a} + ${b} - ${c} = ${a + b - c}$`, T('Subtract $n(A \\cap B)$ because those elements are counted in both $n(A)$ and $n(B)$.', 'Tolak $n(A \\cap B)$ kerana unsur itu dikira dalam kedua-dua $n(A)$ dan $n(B)$.')), sp: 's' };
    },
    (r) => {
      const { x, y, verbEn, verbMs } = pickCtx2(r);
      const both = r.int(4, 12), onlyX = r.int(3, 15), onlyY = r.int(3, 15);
      const u = both + onlyX + onlyY;
      return { q: T(`In a class, ${onlyX + both} students ${verbEn} ${x.en} and ${onlyY + both} ${verbEn} ${y.en}; ${both} ${verbEn} both. Find the number of students who ${verbEn} at least one of the two${x.en1 ? ' activities' : ''}.`, `Dalam sebuah kelas, ${onlyX + both} orang murid ${verbMs} ${x.ms} dan ${onlyY + both} orang murid ${verbMs} ${y.ms}; ${both} ${verbMs} kedua-duanya. Cari bilangan murid yang ${verbMs} sekurang-kurangnya satu daripada kedua-duanya.`), a: T(`${onlyX + both} + ${onlyY + both} - ${both} = ${u}`), w: W(T('At least one of the two $= n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$', 'Sekurang-kurangnya satu daripada dua $= n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$'), `$${onlyX + both} + ${onlyY + both} - ${both} = ${u}$`, T(`The ${both} who ${verbEn} both are counted twice in $${onlyX + both} + ${onlyY + both}$, so subtract them once.`, `${both} orang yang ${verbMs} kedua-duanya dikira dua kali dalam $${onlyX + both} + ${onlyY + both}$, jadi tolak sekali.`)), sp: 's' };
    },
    (r) => {
      const m = mk2(r);
      const [name, keys] = r.pick(E2.filter((e) => e[0] === "A' \\cup B" || e[0] === "A \\cup B'"));
      const fig = vennElems(m, keys, false);
      return { q: T('Write an expression for the shaded region and list its elements.', 'Tulis satu ungkapan bagi kawasan berlorek dan senaraikan unsurnya.'), fig, a: T(`$${name} = ${rst(regElems(m, keys))}$`), w: W(...shadeW(E2, name), setL(name, regElems(m, keys))), sp: 's' };
    },
    (r) => {
      const { x, y, verbEn, verbMs } = pickCtx2(r);
      const tot = r.int(30, 60), neither = r.int(4, 15);
      return { q: T(`In a group of ${tot} students, $A$ = students who ${verbEn} ${x.en}, and $B$ = students who ${verbEn} ${y.en}. ${neither} students ${verbEn} neither. Find $n(A \\cup B)$.`, `Dalam sekumpulan ${tot} orang murid, $A$ = murid yang ${verbMs} ${x.ms}, dan $B$ = murid yang ${verbMs} ${y.ms}. ${neither} orang murid tidak ${verbMs} mana-mana satu. Cari $n(A \\cup B)$.`), a: T(`$n(A \\cup B) = ${tot} - ${neither} = ${tot - neither}$`), w: W(T(`Those who ${verbEn} neither form $(A \\cup B)'$; everyone else is in $A \\cup B$.`, `Mereka yang tidak ${verbMs} mana-mana satu membentuk $(A \\cup B)'$; yang lain berada dalam $A \\cup B$.`), `$n(A \\cup B) = n(\\xi) - n((A \\cup B)') = ${tot} - ${neither} = ${tot - neither}$`), sp: 's' };
    },
    (r) => {
      const preds = r.sample(SETDESC, 3);
      const sets = preds.map((p) => UNI.filter(p.f));
      const pick2 = r.shuffle([0, 1, 2]).slice(0, 2);
      return { q: T(`$\\xi = ${roster(UNI)}$. $P$ = the set of ${preds[0].en}, $Q$ = the set of ${preds[1].en}, $R$ = the set of ${preds[2].en}. Find $${'PQR'[pick2[0]]} \\cup ${'PQR'[pick2[1]]}$.`, `$\\xi = ${roster(UNI)}$. $P$ = set ${preds[0].ms}, $Q$ = set ${preds[1].ms}, $R$ = set ${preds[2].ms}. Cari $${'PQR'[pick2[0]]} \\cup ${'PQR'[pick2[1]]}$.`), a: T(`$${rst(uni(sets[pick2[0]], sets[pick2[1]]))}$`), w: W(setL('PQR'[pick2[0]], sets[pick2[0]]), setL('PQR'[pick2[1]], sets[pick2[1]]), T('Combine both lists, writing common elements only once.', 'Gabungkan kedua-dua senarai, tulis unsur sepunya sekali sahaja.'), setL(`${'PQR'[pick2[0]]} \\cup ${'PQR'[pick2[1]]}`, uni(sets[pick2[0]], sets[pick2[1]]))), sp: 's' };
    },
  ];
  const g42a = [
    (r) => {
      const preds = r.sample(SETDESC, 3);
      const sets = preds.map((p) => UNI.filter(p.f));
      return { q: T(`$\\xi = ${roster(UNI)}$, $P$ = the set of ${preds[0].en}, $Q$ = the set of ${preds[1].en}, $R$ = the set of ${preds[2].en}. Find $n(P \\cup Q \\cup R)$.`, `$\\xi = ${roster(UNI)}$, $P$ = set ${preds[0].ms}, $Q$ = set ${preds[1].ms}, $R$ = set ${preds[2].ms}. Cari $n(P \\cup Q \\cup R)$.`), a: T(`${uni(uni(sets[0], sets[1]), sets[2]).length}`), w: W(setL('P', sets[0]), setL('Q', sets[1]), setL('R', sets[2]), T('Combine all three lists, writing each number once:', 'Gabungkan ketiga-tiga senarai, tulis setiap nombor sekali:'), setL('P \\cup Q \\cup R', uni(uni(sets[0], sets[1]), sets[2])), `$n(P \\cup Q \\cup R) = ${uni(uni(sets[0], sets[1]), sets[2]).length}$`), sp: 'm' };
    },
    (r) => {
      const m = mk3(r);
      const [name, keys] = r.pick(E3.filter((e) => e[0].includes('\\cup')));
      const fig = vennElems(m, keys, true);
      return { q: T('The Venn diagram shows three sets. Write, in set notation, an expression for the shaded region.', 'Gambar rajah Venn menunjukkan tiga set. Tulis, dalam tatatanda set, satu ungkapan bagi kawasan berlorek.'), fig, a: T(`$${name}$`), w: W(...shadeW(E3, name)), sp: 's' };
    },
    (r) => {
      const { x, y, verbEn, verbMs } = pickCtx2(r);
      const tot = r.int(40, 70), a = r.int(15, 30), b = r.int(15, 30);
      return retry(() => {
        const c = r.int(3, Math.min(a, b) - 1);
        const uAB = a + b - c;
        need(uAB <= tot);
        const neither = tot - uAB;
        return { q: T(`In a survey of ${tot} students, ${a} ${verbEn} ${x.en}, ${b} ${verbEn} ${y.en}, and ${c} ${verbEn} both. Find the number of students who ${verbEn} neither ${x.en1 || x.en} nor ${y.en1 || y.en}.`, `Dalam satu tinjauan terhadap ${tot} orang murid, ${a} ${verbMs} ${x.ms}, ${b} ${verbMs} ${y.ms}, dan ${c} ${verbMs} kedua-duanya. Cari bilangan murid yang tidak ${verbMs} ${x.ms} mahupun ${y.ms}.`), a: T(`$n(A \\cup B) = ${a} + ${b} - ${c} = ${uAB}$; $n((A \\cup B)') = ${tot} - ${uAB} = ${neither}$`), w: W(NU, `$n(A \\cup B) = ${a} + ${b} - ${c} = ${uAB}$`, T("Neither $= (A \\cup B)'$, the students outside both sets:", "Tidak kedua-duanya $= (A \\cup B)'$, iaitu murid di luar kedua-dua set:"), `$n((A \\cup B)') = n(\\xi) - n(A \\cup B) = ${tot} - ${uAB} = ${neither}$`), sp: 'm' };
      });
    },
    (r) => {
      const { x, y, verbEn, verbMs } = pickCtx2(r);
      return retry(() => {
        const tot = r.int(35, 60), a = r.int(15, 28), u = r.int(a + 3, tot - 2);
        const b = r.int(u - a + 2, u - 2);
        const c = a + b - u;
        need(c >= 2 && c < Math.min(a, b));
        return { q: T(`In a group of ${tot} students, $A$ = students who ${verbEn} ${x.en} with $n(A) = ${a}$, and $B$ = students who ${verbEn} ${y.en} with $n(B) = ${b}$. $n(A \\cup B) = ${u}$. If $x$ students ${verbEn} both, form an equation in $x$ and solve it.`, `Dalam sekumpulan ${tot} orang murid, $A$ = murid yang ${verbMs} ${x.ms} dengan $n(A) = ${a}$, dan $B$ = murid yang ${verbMs} ${y.ms} dengan $n(B) = ${b}$. $n(A \\cup B) = ${u}$. Jika $x$ orang murid ${verbMs} kedua-duanya, bentukkan satu persamaan dalam $x$ dan selesaikannya.`), a: T(`$${a} + ${b} - x = ${u} \\Rightarrow x = ${a} + ${b} - ${u} = ${c}$`), w: W(NU, `$${u} = ${a} + ${b} - x$`, `$${u} = ${a + b} - x$`, `$x = ${a + b} - ${u} = ${c}$`), sp: 'm' };
      });
    },
    (r) => {
      const { x, y, z, verbEn, verbMs } = pickCtx3(r);
      return retry(() => {
        const reg = { A: r.int(2, 6), B: r.int(2, 6), C: r.int(2, 6), AB: r.int(1, 4), AC: r.int(1, 4), BC: r.int(1, 4), ABC: r.int(1, 3), '0': r.int(2, 6) };
        const m = mkRegions(reg);
        const tot = m.U.length;
        const uABC = tot - reg['0'];
        return { q: T(`In a survey of ${tot} students about three activities $A$ (${verbEn} ${x.en}), $B$ (${verbEn} ${y.en}) and $C$ (${verbEn} ${z.en}), ${reg['0']} students take part in none of the three. Find $n(A \\cup B \\cup C)$.`, `Dalam satu tinjauan terhadap ${tot} orang murid tentang tiga aktiviti $A$ (${verbMs} ${x.ms}), $B$ (${verbMs} ${y.ms}) dan $C$ (${verbMs} ${z.ms}), ${reg['0']} orang murid tidak menyertai mana-mana satu. Cari $n(A \\cup B \\cup C)$.`), a: T(`$n(A \\cup B \\cup C) = n(\\xi) - n((A \\cup B \\cup C)') = ${tot} - ${reg['0']} = ${uABC}$`), w: W(T("Students in none of the three activities form $(A \\cup B \\cup C)'$; all the others are in $A \\cup B \\cup C$.", "Murid yang tidak menyertai mana-mana aktiviti membentuk $(A \\cup B \\cup C)'$; yang lain berada dalam $A \\cup B \\cup C$."), `$n(A \\cup B \\cup C) = ${tot} - ${reg['0']} = ${uABC}$`), sp: 'm' };
      });
    },
  ];
  SPM.extend('F4-4.2', { e: g42e, m: g42m, a: g42a });

  /* --------------------------------------------------------------------------------- F4-4.3 Combined operations */
  const COMP = T("$A'$ (the complement of $A$) contains the elements of $\\xi$ that are not in $A$.", "$A'$ (pelengkap bagi $A$) mengandungi unsur $\\xi$ yang tidak berada dalam $A$.");
  const g43e = [
    (r) => {
      const m = mk2(r);
      return { q: T(`$\\xi = ${roster(m.U)}$ and $A = ${roster(m.A)}$. List the elements of $A'$.`, `$\\xi = ${roster(m.U)}$ dan $A = ${roster(m.A)}$. Senaraikan unsur bagi $A'$.`), a: T(`$A' = ${rst(diff(m.U, m.A))}$`), w: W(COMP, setL("A'", diff(m.U, m.A)), T(`Check: $n(A') = n(\\xi) - n(A) = ${m.U.length} - ${m.A.length} = ${m.U.length - m.A.length}$`, `Semak: $n(A') = n(\\xi) - n(A) = ${m.U.length} - ${m.A.length} = ${m.U.length - m.A.length}$`)), sp: 's' };
    },
    (r) => {
      const P = r.pick(SETDESC), sp = UNI.filter(P.f);
      return { q: T(`$\\xi = ${roster(UNI)}$. $P$ = the set of ${P.en}. List the elements of $P'$.`, `$\\xi = ${roster(UNI)}$. $P$ = set ${P.ms}. Senaraikan unsur bagi $P'$.`), a: T(`$P' = ${rst(diff(UNI, sp))}$`), w: W(setL('P', sp), T("$P'$ = the elements of $\\xi$ that are not in $P$:", "$P'$ = unsur $\\xi$ yang tidak berada dalam $P$:"), setL("P'", diff(UNI, sp))), sp: 's' };
    },
    (r) => {
      const m = mk2(r);
      const fig = vennElems(m, ['0'], false);
      return { q: T('In the Venn diagram, the shaded region is outside both circles. Write the set represented and list its elements.', 'Dalam gambar rajah Venn, kawasan berlorek berada di luar kedua-dua bulatan. Tulis set yang diwakili dan senaraikan unsurnya.'), fig, a: T(`$(A \\cup B)' = ${rst(m.elems['0'])}$`), w: W(...shadeW(E2, "(A \\cup B)'"), setL("(A \\cup B)'", m.elems['0'])), sp: 's' };
    },
    (r) => {
      const { x, verbEn, verbMs } = pickCtx2(r);
      const opts = r.shuffle([["A'", true], ['A', false], ['A \\cap B', false]]);
      return { q: T(`$A$ is the set of students who ${verbEn} ${x.en}. Which set notation represents "students who do not ${verbEn} ${x.en1 || x.en}"? (A) $${opts[0][0]}$ (B) $${opts[1][0]}$ (C) $${opts[2][0]}$`, `$A$ ialah set murid yang ${verbMs} ${x.ms}. Tatatanda set manakah mewakili "murid yang tidak ${verbMs} ${x.ms}"? (A) $${opts[0][0]}$ (B) $${opts[1][0]}$ (C) $${opts[2][0]}$`), a: T(`(${'ABC'[opts.findIndex((o) => o[1])]}) $A'$`), w: W(T("\"Do not …\" means not in $A$: the complement $A'$.", "\"Tidak …\" bermaksud tidak berada dalam $A$: pelengkap $A'$.")), sp: 's' };
    },
    (r) => {
      const m = mk2(r);
      const [name, keys] = r.pick(E2.filter((e) => e[0] === "A \\cap B'" || e[0] === "A' \\cap B"));
      const fig = vennElems(m, keys, false);
      return { q: T('The Venn diagram shows sets $A$ and $B$. Write an expression for the shaded region and list its elements.', 'Gambar rajah Venn menunjukkan set $A$ dan $B$. Tulis satu ungkapan bagi kawasan berlorek dan senaraikan unsurnya.'), fig, a: T(`$${name} = ${rst(regElems(m, keys))}$`), w: W(...shadeW(E2, name), setL(name, regElems(m, keys))), sp: 's' };
    },
    (r) => {
      const P = r.pick(SETDESC), sp = UNI.filter(P.f), x = r.pick(UNI);
      return { q: T(`$\\xi = ${roster(UNI)}$. $P$ = the set of ${P.en}. Is $${x} \\in P'$? Justify your answer.`, `$\\xi = ${roster(UNI)}$. $P$ = set ${P.ms}. Adakah $${x} \\in P'$? Wajarkan jawapan anda.`), a: T(`${P.f(x) ? 'No' : 'Yes'}: $${x}$ is ${P.f(x) ? '' : 'not '}among the ${P.en}, so $${x}$ is ${P.f(x) ? 'not ' : ''}in $P'$.`, `${P.f(x) ? 'Tidak' : 'Ya'}: $${x}$ ${P.f(x) ? '' : 'bukan '}${P.ms}, jadi $${x}$ ${P.f(x) ? 'tidak ' : ''}berada dalam $P'$.`), w: W(setL('P', sp), `$${x} ${P.f(x) ? '\\in' : '\\notin'} P \\Rightarrow ${x} ${P.f(x) ? '\\notin' : '\\in'} P'$`), sp: 's' };
    },
    (r) => {
      const [P, Q] = r.pick(DISJ);
      return { q: T(`$\\xi = ${roster(UNI)}$. $P$ = the set of ${P.en}, $Q$ = the set of ${Q.en}. Since $P$ and $Q$ are disjoint, list the elements of $\\xi$ that are in neither $P$ nor $Q$.`, `$\\xi = ${roster(UNI)}$. $P$ = set ${P.ms}, $Q$ = set ${Q.ms}. Oleh sebab $P$ dan $Q$ tidak bertindih, senaraikan unsur $\\xi$ yang tiada dalam $P$ mahupun $Q$.`), a: T(`$(P \\cup Q)' = ${rst(diff(UNI, uni(UNI.filter(P.f), UNI.filter(Q.f))))}$`), w: W(setL('P', UNI.filter(P.f)), setL('Q', UNI.filter(Q.f)), T("Remove every element of $P$ and of $Q$ from $\\xi$; what is left is $(P \\cup Q)'$.", "Keluarkan setiap unsur $P$ dan $Q$ daripada $\\xi$; baki ialah $(P \\cup Q)'$."), setL("(P \\cup Q)'", diff(UNI, uni(UNI.filter(P.f), UNI.filter(Q.f))))), sp: 's' };
    },
    (r) => {
      const m = mk2(r);
      const out = m.elems['0'].concat(m.elems.B).sort((a, b) => a - b);
      const fig = S.venn1({ name: 'A', inA: m.A, out, shade: 'out', xi: 'ξ' });
      return { q: T('The Venn diagram shows set $A$ inside the universal set $\\xi$. Write the set represented by the shaded region and list its elements.', 'Gambar rajah Venn menunjukkan set $A$ di dalam set semesta $\\xi$. Tulis set yang diwakili oleh kawasan berlorek dan senaraikan unsurnya.'), fig, a: T(`$A' = ${rst(out)}$`), w: W(T("The shaded region is everything in $\\xi$ outside $A$: $A'$.", "Kawasan berlorek ialah semua dalam $\\xi$ di luar $A$: $A'$."), setL("A'", out)), sp: 's' };
    },
    (r) => {
      const { x, y, verbEn, verbMs } = pickCtx2(r);
      const a = r.int(10, 25), tot = r.int(a + 8, a + 30);
      return { q: T(`In a group of ${tot} students, $A$ = students who ${verbEn} ${x.en}, with $n(A) = ${a}$. Find $n(A')$.`, `Dalam sekumpulan ${tot} orang murid, $A$ = murid yang ${verbMs} ${x.ms}, dengan $n(A) = ${a}$. Cari $n(A')$.`), a: T(`$n(A') = ${tot} - ${a} = ${tot - a}$`), w: W(`$n(A') = n(\\xi) - n(A)$`, `$n(A') = ${tot} - ${a} = ${tot - a}$`), sp: 's' };
    },
  ];
  const g43m = [
    (r) => {
      const m = mk2(r);
      const [name, keys] = r.pick(E2.filter((e) => ["A \\cap B'", "(A \\cap B)'", "A' \\cap B", "A' \\cup B"].includes(e[0])));
      const opts = r.shuffle([[name, true]].concat(r.sample(E2.filter((e) => e[0] !== name && e[1].length !== keys.length).map((e) => [e[0], false]), 3)));
      const fig = vennElems(m, keys, false);
      return { q: T(`Which expression represents the shaded region? ${opts.map((o, i) => `(${'ABCD'[i]}) $${o[0]}$`).join('  ')}`, `Ungkapan manakah yang mewakili kawasan berlorek? ${opts.map((o, i) => `(${'ABCD'[i]}) $${o[0]}$`).join('  ')}`), fig, a: T(`(${'ABCD'[opts.findIndex((o) => o[1])]}) $${name}$`), w: W(...shadeW(E2, name)), sp: 's' };
    },
    (r) => {
      const { P, Q, sp, sq } = twoDesc(r);
      const [name, expr, step] = r.pick([
        ["P \\cap Q'", inter(sp, diff(UNI, sq)), [setL("Q'", diff(UNI, sq)), T("$P \\cap Q'$ = elements of $P$ that are not in $Q$:", "$P \\cap Q'$ = unsur $P$ yang tidak berada dalam $Q$:")]],
        ["P' \\cap Q", inter(diff(UNI, sp), sq), [setL("P'", diff(UNI, sp)), T("$P' \\cap Q$ = elements of $Q$ that are not in $P$:", "$P' \\cap Q$ = unsur $Q$ yang tidak berada dalam $P$:")]],
        ["(P \\cup Q)'", diff(UNI, uni(sp, sq)), [setL('P \\cup Q', uni(sp, sq)), T("$(P \\cup Q)'$ = elements of $\\xi$ not in $P \\cup Q$:", "$(P \\cup Q)'$ = unsur $\\xi$ yang tidak berada dalam $P \\cup Q$:")]],
        ["(P \\cap Q)'", diff(UNI, inter(sp, sq)), [setL('P \\cap Q', inter(sp, sq)), T("$(P \\cap Q)'$ = elements of $\\xi$ not in $P \\cap Q$:", "$(P \\cap Q)'$ = unsur $\\xi$ yang tidak berada dalam $P \\cap Q$:")]],
      ]);
      return { q: T(`$\\xi = ${roster(UNI)}$. $P$ = the set of ${P.en}, $Q$ = the set of ${Q.en}. List the elements of $${name}$.`, `$\\xi = ${roster(UNI)}$. $P$ = set ${P.ms}, $Q$ = set ${Q.ms}. Senaraikan unsur bagi $${name}$.`), a: T(`$${name} = ${rst(expr)}$`), w: W(setL('P', sp), setL('Q', sq), ...step, setL(name, expr)), sp: 's' };
    },
    (r) => {
      const { x, y, verbEn, verbMs } = pickCtx2(r);
      const both = r.int(4, 12), onlyX = r.int(3, 12), onlyY = r.int(3, 12), neither = r.int(2, 8);
      const tot = both + onlyX + onlyY + neither;
      return { q: T(`In a group of ${tot} students, ${onlyX} ${verbEn} only ${x.en1 || x.en}, ${onlyY} ${verbEn} only ${y.en1 || y.en}, ${both} ${verbEn} both, and ${neither} ${verbEn} neither. Find $n(A')$, where $A$ = students who ${verbEn} ${x.en}.`, `Dalam sekumpulan ${tot} orang murid, ${onlyX} ${verbMs} ${x.ms} sahaja, ${onlyY} ${verbMs} ${y.ms} sahaja, ${both} ${verbMs} kedua-duanya, dan ${neither} tidak ${verbMs} mana-mana satu. Cari $n(A')$, dengan $A$ = murid yang ${verbMs} ${x.ms}.`), a: T(`$n(A) = ${onlyX} + ${both} = ${onlyX + both}$; $n(A') = ${tot} - ${onlyX + both} = ${tot - onlyX - both}$`), w: W(T(`$A$ includes those who ${verbEn} only ${x.en1 || x.en} and those who ${verbEn} both:`, `$A$ termasuk mereka yang ${verbMs} ${x.ms} sahaja dan mereka yang ${verbMs} kedua-duanya:`), `$n(A) = ${onlyX} + ${both} = ${onlyX + both}$`, `$n(A') = n(\\xi) - n(A) = ${tot} - ${onlyX + both} = ${tot - onlyX - both}$`, T(`(Check: $${onlyY} + ${neither} = ${onlyY + neither}$ students are outside $A$.)`, `(Semak: $${onlyY} + ${neither} = ${onlyY + neither}$ orang murid berada di luar $A$.)`)), sp: 's' };
    },
    (r) => {
      const m = mk2(r);
      const lhs = diff(m.U, uni(m.A, m.B)), rhs = inter(diff(m.U, m.A), diff(m.U, m.B));
      return { q: T(`$\\xi = ${roster(m.U)}$, $A = ${roster(m.A)}$, $B = ${roster(m.B)}$. Verify, by listing elements, that $(A \\cup B)' = A' \\cap B'$.`, `$\\xi = ${roster(m.U)}$, $A = ${roster(m.A)}$, $B = ${roster(m.B)}$. Sahkan, dengan menyenaraikan unsur, bahawa $(A \\cup B)' = A' \\cap B'$.`), a: T(`$(A \\cup B)' = ${rst(lhs)}$ and $A' \\cap B' = ${rst(rhs)}$: both are equal, so $(A \\cup B)' = A' \\cap B'$ (De Morgan's law).`, `$(A \\cup B)' = ${rst(lhs)}$ dan $A' \\cap B' = ${rst(rhs)}$: kedua-duanya sama, jadi $(A \\cup B)' = A' \\cap B'$ (hukum De Morgan).`), w: W(setL('A \\cup B', uni(m.A, m.B)), setL("(A \\cup B)'", lhs), setL("A'", diff(m.U, m.A)), setL("B'", diff(m.U, m.B)), T("$A' \\cap B'$ = elements common to $A'$ and $B'$:", "$A' \\cap B'$ = unsur sepunya bagi $A'$ dan $B'$:"), setL("A' \\cap B'", rhs), T('The two lists are the same.', 'Kedua-dua senarai adalah sama.')), sp: 'm' };
    },
    (r) => {
      const m = mk2(r);
      const lhs = diff(m.U, inter(m.A, m.B)), rhs = uni(diff(m.U, m.A), diff(m.U, m.B));
      return { q: T(`$\\xi = ${roster(m.U)}$, $A = ${roster(m.A)}$, $B = ${roster(m.B)}$. Verify, by listing elements, that $(A \\cap B)' = A' \\cup B'$.`, `$\\xi = ${roster(m.U)}$, $A = ${roster(m.A)}$, $B = ${roster(m.B)}$. Sahkan, dengan menyenaraikan unsur, bahawa $(A \\cap B)' = A' \\cup B'$.`), a: T(`$(A \\cap B)' = ${rst(lhs)}$ and $A' \\cup B' = ${rst(rhs)}$: both are equal, so $(A \\cap B)' = A' \\cup B'$ (De Morgan's law).`, `$(A \\cap B)' = ${rst(lhs)}$ dan $A' \\cup B' = ${rst(rhs)}$: kedua-duanya sama, jadi $(A \\cap B)' = A' \\cup B'$ (hukum De Morgan).`), w: W(setL('A \\cap B', inter(m.A, m.B)), setL("(A \\cap B)'", lhs), setL("A'", diff(m.U, m.A)), setL("B'", diff(m.U, m.B)), T("$A' \\cup B'$ = all elements of $A'$ or $B'$:", "$A' \\cup B'$ = semua unsur $A'$ atau $B'$:"), setL("A' \\cup B'", rhs), T('The two lists are the same.', 'Kedua-dua senarai adalah sama.')), sp: 'm' };
    },
  ];
  const ga43 = [
    (r) => {
      const m = mk3(r);
      const [name, keys] = r.pick(E3.filter((e) => e[0].includes("'")));
      const fig = vennElems(m, keys, true);
      return { q: T('The Venn diagram shows three sets. Write, in set notation, an expression for the shaded region.', 'Gambar rajah Venn menunjukkan tiga set. Tulis, dalam tatatanda set, satu ungkapan bagi kawasan berlorek.'), fig, a: T(`$${name}$`), w: W(...shadeW(E3, name)), sp: 's' };
    },
    (r) => {
      const { x, y, z, verbEn, verbMs } = pickCtx3(r);
      return retry(() => {
        const reg = { A: r.int(2, 6), B: r.int(2, 6), C: r.int(2, 6), AB: r.int(1, 4), AC: r.int(1, 4), BC: r.int(1, 4), ABC: r.int(1, 3), '0': r.int(2, 6) };
        const m = mkRegions(reg);
        const tot = m.U.length;
        const exactlyTwo = reg.AB + reg.AC + reg.BC;
        const onlyOne = reg.A + reg.B + reg.C;
        const fig = vennCounts(reg, true);
        return { q: T(`A survey of ${tot} students asked about three activities: $A$ (${verbEn} ${x.en}), $B$ (${verbEn} ${y.en}) and $C$ (${verbEn} ${z.en}). ${m.A.length} are in $A$, ${m.B.length} in $B$ and ${m.C.length} in $C$; ${reg.AB + reg.ABC} are in both $A$ and $B$, ${reg.AC + reg.ABC} in both $A$ and $C$, ${reg.BC + reg.ABC} in both $B$ and $C$; ${reg.ABC} are in all three. Find (a) the number in exactly one activity, (b) the number in exactly two activities.`, `Satu tinjauan terhadap ${tot} orang murid bertanya tentang tiga aktiviti: $A$ (${verbMs} ${x.ms}), $B$ (${verbMs} ${y.ms}) dan $C$ (${verbMs} ${z.ms}). ${m.A.length} dalam $A$, ${m.B.length} dalam $B$ dan ${m.C.length} dalam $C$; ${reg.AB + reg.ABC} dalam kedua-dua $A$ dan $B$, ${reg.AC + reg.ABC} dalam kedua-dua $A$ dan $C$, ${reg.BC + reg.ABC} dalam kedua-dua $B$ dan $C$; ${reg.ABC} dalam ketiga-tiganya. Cari (a) bilangan yang menyertai tepat satu aktiviti, (b) bilangan yang menyertai tepat dua aktiviti.`), a: T(`(a) ${onlyOne} (b) ${exactlyTwo}`, `(a) ${onlyOne} (b) ${exactlyTwo}`), w: W(
          T(`Start from the centre: $n(A \\cap B \\cap C) = ${reg.ABC}$. Two sets only: $${reg.AB + reg.ABC} - ${reg.ABC} = ${reg.AB}$, $${reg.AC + reg.ABC} - ${reg.ABC} = ${reg.AC}$, $${reg.BC + reg.ABC} - ${reg.ABC} = ${reg.BC}$.`, `Mula dari tengah: $n(A \\cap B \\cap C) = ${reg.ABC}$. Dua set sahaja: $${reg.AB + reg.ABC} - ${reg.ABC} = ${reg.AB}$, $${reg.AC + reg.ABC} - ${reg.ABC} = ${reg.AC}$, $${reg.BC + reg.ABC} - ${reg.ABC} = ${reg.BC}$.`),
          T(`$A$ only $= ${m.A.length} - ${reg.AB} - ${reg.AC} - ${reg.ABC} = ${reg.A}$; $B$ only $= ${m.B.length} - ${reg.AB} - ${reg.BC} - ${reg.ABC} = ${reg.B}$; $C$ only $= ${m.C.length} - ${reg.AC} - ${reg.BC} - ${reg.ABC} = ${reg.C}$.`, `$A$ sahaja $= ${m.A.length} - ${reg.AB} - ${reg.AC} - ${reg.ABC} = ${reg.A}$; $B$ sahaja $= ${m.B.length} - ${reg.AB} - ${reg.BC} - ${reg.ABC} = ${reg.B}$; $C$ sahaja $= ${m.C.length} - ${reg.AC} - ${reg.BC} - ${reg.ABC} = ${reg.C}$.`),
          `(a) $${reg.A} + ${reg.B} + ${reg.C} = ${onlyOne}$`, `(b) $${reg.AB} + ${reg.AC} + ${reg.BC} = ${exactlyTwo}$`, fig), sp: 'l' };
      });
    },
    (r) => {
      const { x, y, verbEn, verbMs } = pickCtx2(r);
      return retry(() => {
        const tot = r.int(35, 60), onlyX = r.int(8, 20), onlyY = r.int(8, 20), neither = r.int(3, 10);
        const both = tot - onlyX - onlyY - neither;
        need(both >= 2 && both < Math.min(onlyX, onlyY) + both);
        const a = onlyX + both, b = onlyY + both;
        return { q: T(`In a group of ${tot} students, $A$ = students who ${verbEn} ${x.en}, $B$ = students who ${verbEn} ${y.en}. $n(A) = ${a}$, $n(B) = ${b}$, and $x$ students ${verbEn} neither. Given that $n(A \\cap B) = ${both}$, form an equation in $x$ using $n(\\xi) = ${tot}$, and solve for $x$.`, `Dalam sekumpulan ${tot} orang murid, $A$ = murid yang ${verbMs} ${x.ms}, $B$ = murid yang ${verbMs} ${y.ms}. $n(A) = ${a}$, $n(B) = ${b}$, dan $x$ orang murid tidak ${verbMs} mana-mana satu. Diberi $n(A \\cap B) = ${both}$, bentukkan satu persamaan dalam $x$ menggunakan $n(\\xi) = ${tot}$, dan selesaikan untuk $x$.`), a: T(`$${a} + ${b} - ${both} + x = ${tot} \\Rightarrow x = ${tot} - ${a} - ${b} + ${both} = ${neither}$`), w: W(`$n(A \\cup B) + n((A \\cup B)') = n(\\xi)$`, `$${a} + ${b} - ${both} + x = ${tot}$`, `$${a + b - both} + x = ${tot}$`, `$x = ${tot} - ${a + b - both} = ${neither}$`), sp: 'm' };
      });
    },
    (r) => {
      const m = mk2(r);
      const wrong = diff(m.U, m.elems.AB); // common error: (A ∪ B)' computed as "not in both" instead of "not in either"
      const correct = m.elems['0'];
      return { q: T(`$\\xi = ${roster(m.U)}$, $A = ${roster(m.A)}$, $B = ${roster(m.B)}$. A student says $(A \\cup B)' = ${roster(wrong)}$ (everything not in $A \\cap B$). Explain the error, and state the correct $(A \\cup B)'$.`, `$\\xi = ${roster(m.U)}$, $A = ${roster(m.A)}$, $B = ${roster(m.B)}$. Seorang murid berkata $(A \\cup B)' = ${roster(wrong)}$ (semua yang bukan dalam $A \\cap B$). Terangkan kesilapan itu, dan nyatakan $(A \\cup B)'$ yang betul.`), a: T(`Error: the student found the complement of $A \\cap B$ instead of $A \\cup B$. $(A \\cup B)' = ${rst(correct)}$ (elements in neither $A$ nor $B$).`, `Kesilapan: murid itu mencari pelengkap bagi $A \\cap B$ dan bukannya $A \\cup B$. $(A \\cup B)' = ${rst(correct)}$ (unsur yang tiada dalam $A$ mahupun $B$).`), w: W(T("$(A \\cup B)'$ = elements in neither $A$ nor $B$, so first find $A \\cup B$:", "$(A \\cup B)'$ = unsur yang tiada dalam $A$ mahupun $B$, jadi cari $A \\cup B$ dahulu:"), setL('A \\cup B', uni(m.A, m.B)), setL("(A \\cup B)'", correct), T(`The student's set is $(A \\cap B)'$: it wrongly keeps the elements in only one of the sets.`, `Set murid itu ialah $(A \\cap B)'$: ia tersilap mengekalkan unsur yang berada dalam satu set sahaja.`)), sp: 'm' };
    },
    (r) => {
      const preds = r.sample(SETDESC, 2);
      const sp = UNI.filter(preds[0].f), sq = UNI.filter(preds[1].f);
      const lhs = diff(UNI, uni(sp, sq)), rhs = inter(diff(UNI, sp), diff(UNI, sq));
      return { q: T(`$\\xi = ${roster(UNI)}$. $P$ = the set of ${preds[0].en}, $Q$ = the set of ${preds[1].en}. By listing elements, show that $(P \\cup Q)' = P' \\cap Q'$.`, `$\\xi = ${roster(UNI)}$. $P$ = set ${preds[0].ms}, $Q$ = set ${preds[1].ms}. Dengan menyenaraikan unsur, tunjukkan bahawa $(P \\cup Q)' = P' \\cap Q'$.`), a: T(`$(P \\cup Q)' = ${rst(lhs)}$; $P' \\cap Q' = ${rst(rhs)}$. Both are equal, confirming De Morgan's law.`, `$(P \\cup Q)' = ${rst(lhs)}$; $P' \\cap Q' = ${rst(rhs)}$. Kedua-duanya sama, mengesahkan hukum De Morgan.`), w: W(setL('P', sp), setL('Q', sq), setL('P \\cup Q', uni(sp, sq)), setL("(P \\cup Q)'", lhs), setL("P'", diff(UNI, sp)), setL("Q'", diff(UNI, sq)), setL("P' \\cap Q'", rhs), T('The two lists are the same.', 'Kedua-dua senarai adalah sama.')), sp: 'm' };
    },
  ];
  SPM.extend('F4-4.3', { e: g43e, m: g43m, a: ga43 });
})();
