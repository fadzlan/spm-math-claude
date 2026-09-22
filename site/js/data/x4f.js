/* Variety pack x4f: extra generators for F4-9.1..9.4 "Probability of Combined Events" (see tools/variety.js). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { need, retry, Fr } = SPM;
  const T = SPM.L, S = SPM.svg;
  const frT = Fr.tex;
  const fr = (a, b) => Fr.make(a, b);
  const P = (a, b) => frT(fr(a, b));
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const b = (en, ms, extra) => Object.assign({ en, ms }, extra);
  const cap1 = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

  /* ============================================================= shared banks */
  /* containers + items drawn from them, for replacement / classification contexts */
  const HOLD = [
    b('sweets', 'gula-gula', { holder: b('jar', 'balang') }),
    b('marbles', 'guli', { holder: b('bag', 'beg') }),
    b('cards', 'kad', { holder: b('box', 'kotak') }),
    b('balls', 'bola', { holder: b('bag', 'beg') }),
    b('tickets', 'tiket', { holder: b('box', 'kotak') }),
    b('tiles', 'jubin', { holder: b('bag', 'beg') }),
  ];
  const COL = [
    b('red', 'merah'), b('blue', 'biru'), b('green', 'hijau'), b('yellow', 'kuning'),
    b('white', 'putih'), b('black', 'hitam'), b('purple', 'ungu'), b('orange', 'jingga'),
  ];
  /* single-trial numeric experiments 1..N, for mutually-exclusive classification */
  const NEXP = [
    b('a fair die is rolled', 'sebiji dadu adil digolek', { N: 6 }),
    b('a fair spinner with equal sectors numbered 1 to 8 is spun', 'sebuah pemutar adil dengan sektor sama bernombor 1 hingga 8 diputar', { N: 8 }),
    b('a card is drawn at random from cards numbered 1 to 10', 'sekeping kad dipilih secara rawak daripada kad bernombor 1 hingga 10', { N: 10 }),
    b('a ticket is drawn at random from tickets numbered 1 to 12', 'sekeping tiket dipilih secara rawak daripada tiket bernombor 1 hingga 12', { N: 12 }),
  ];
  /* predicate builders on a sample space {1,...,N}; return null when unsuitable for that N */
  const PRED = [
    (N) => ({ test: (v) => v % 2 === 0, en: 'an even number', ms: 'nombor genap' }),
    (N) => ({ test: (v) => v % 2 === 1, en: 'an odd number', ms: 'nombor ganjil' }),
    (N) => (N >= 6 ? { test: (v) => SPM.isPrime(v), en: 'a prime number', ms: 'nombor perdana' } : null),
    (N) => ({ test: (v) => v % 3 === 0, en: 'a multiple of 3', ms: 'gandaan 3' }),
    (N) => (N >= 8 ? { test: (v) => v % 4 === 0, en: 'a multiple of 4', ms: 'gandaan 4' } : null),
    (N) => { const k = Math.ceil(N / 2); return { test: (v) => v > k, en: `greater than ${k}`, ms: `lebih besar daripada ${k}` }; },
    (N) => { const k = Math.floor(N / 2) + 1; return { test: (v) => v < k, en: `less than ${k}`, ms: `kurang daripada ${k}` }; },
    (N) => (N >= 9 ? { test: (v) => { const s = Math.round(Math.sqrt(v)); return s * s === v; }, en: 'a perfect square', ms: 'kuasa dua sempurna' } : null),
  ];
  /** pick two different predicate kinds valid for N */
  function twoPreds(r, N) {
    return retry(() => {
      const idx = r.sample(range(0, PRED.length - 1), 2);
      const p1 = PRED[idx[0]](N), p2 = PRED[idx[1]](N);
      need(p1 && p2);
      return [p1, p2];
    });
  }

  /** with/without-replacement drawing scenario built from a HOLD entry */
  function replaceScenario(r) {
    const h = r.pick(HOLD);
    const replace = r.chance();
    const en = `Two ${h.en} are drawn one after another from a ${h.holder.en}${replace ? ', with the first one put back and the ' + h.en + ' mixed before the second is drawn' : ', without putting the first one back'}.`;
    const ms = `Dua ${h.ms} ditarik satu demi satu daripada sebuah ${h.holder.ms}${replace ? ', dengan yang pertama dimasukkan semula dan dicampur sebelum yang kedua ditarik' : ', tanpa memasukkan semula yang pertama'}.`;
    return { h, replace, en, ms };
  }

  /** probability tree diagram. o.counts = [k0,k1,...] branch count at each depth (same for every node at that depth);
   *  o.branch(depth,path) -> array of length counts[depth] of {lab, p:[num,den]}; lab may be a plain string or {en,ms}.
   *  o.leaf(path) -> optional label shown after the last stage. */
  function treeFig(o) {
    const counts = o.counts, L = counts.length;
    const w = o.w || 92 * L + 66;
    const leaves = counts.reduce((a, c) => a * c, 1);
    const h = o.h || Math.max(110, 30 * leaves);
    const margin = 24;
    const dx = (w - margin - 46) / L;
    const build = (lang) => {
      let out = '';
      const lab = (x) => (x && typeof x === 'object' && 'en' in x ? (lang === 'ms' ? x.ms : x.en) : x);
      const walk = (depth, path, px, py, y0, y1) => {
        if (depth === L) {
          if (o.leaf) out += S.text(px + 8, py, lab(o.leaf(path)), { a: 'start', s: 11 });
          return;
        }
        const br = o.branch(depth, path);
        const k = counts[depth];
        const segH = (y1 - y0) / k;
        const x = margin + (depth + 1) * dx;
        for (let i = 0; i < k; i++) {
          const cy0 = y0 + i * segH, cy1 = cy0 + segH, cy = (cy0 + cy1) / 2;
          out += S.line(px, py, x, cy);
          const mx = (px + x) / 2, my = (py + cy) / 2;
          out += S.text(mx, my - 7, lab(br[i].lab), { s: 11 });
          out += S.text(mx, my + 7, br[i].p[0] + '/' + br[i].p[1], { s: 10 });
          if (depth + 1 < L) out += S.dot(x, cy, 2);
          walk(depth + 1, path.concat(i), x, cy, cy0, cy1);
        }
      };
      walk(0, [], margin, h / 2, 0, h);
      return S.wrap(w, h, out, 'probability tree diagram');
    };
    return T(build('en'), build('ms'));
  }

  /* =============================================================== F4-9.1 */
  const g91e = [
    /* classify with/without replacement, independent/dependent */
    (r) => {
      const s = replaceScenario(r);
      const ans = s.replace
        ? T('With replacement; the two draws are independent.', 'Dengan pengembalian; kedua-dua cabutan itu tak bersandar.')
        : T('Without replacement; the two draws are dependent.', 'Tanpa pengembalian; kedua-dua cabutan itu bersandar.');
      return { q: T(`${s.en} Is this with or without replacement? Are the two draws independent or dependent?`, `${s.ms} Adakah ini dengan atau tanpa pengembalian? Adakah kedua-dua cabutan itu tak bersandar atau bersandar?`), a: ans, sp: 's' };
    },
    /* classify mutually exclusive on a single-trial experiment */
    (r) => {
      const ex = r.pick(NEXP);
      const [p1, p2] = twoPreds(r, ex.N);
      const inter = range(1, ex.N).filter((v) => p1.test(v) && p2.test(v));
      const me = inter.length === 0;
      const qEn = `In the experiment where ${ex.en}, let $A$ be the event "the result is ${p1.en}" and $B$ be the event "the result is ${p2.en}". Are $A$ and $B$ mutually exclusive? Give a reason.`;
      const qMs = `Dalam eksperimen di mana ${ex.ms}, biar $A$ ialah peristiwa "keputusan ialah ${p1.ms}" dan $B$ ialah peristiwa "keputusan ialah ${p2.ms}". Adakah $A$ dan $B$ saling eksklusif? Berikan sebab.`;
      const aEn = me ? `Yes: no outcome in the sample space is both ${p1.en} and ${p2.en}, so $A \\cap B = \\varnothing$.` : `No: ${inter[0]} is both ${p1.en} and ${p2.en}, so $A \\cap B \\neq \\varnothing$.`;
      const aMs = me ? `Ya: tiada kesudahan dalam ruang sampel yang ${p1.ms} dan ${p2.ms} serentak, jadi $A \\cap B = \\varnothing$.` : `Tidak: ${inter[0]} ialah ${p1.ms} dan ${p2.ms} serentak, jadi $A \\cap B \\neq \\varnothing$.`;
      return { q: T(qEn, qMs), a: T(aEn, aMs), sp: 's' };
    },
    /* list the sample space of a small two-stage experiment */
    (r) => {
      const s = r.pick([
        { en: 'A coin is tossed twice.', ms: 'Sekeping syiling dilambung dua kali.', outA: ['H', 'T'], outB: ['H', 'T'] },
        { en: 'A coin is tossed and a spinner with equal sectors is spun.', ms: 'Sekeping syiling dilambung dan sebuah pemutar dengan sektor sama diputar.', outA: ['H', 'T'], outB: [1, 2, 3] },
        { en: 'Two identical spinners, each with equal sectors, are spun together.', ms: 'Dua pemutar serupa, setiap satu dengan sektor sama, diputar bersama.', outA: [1, 2, 3], outB: [1, 2, 3] },
        { en: 'A fair die is rolled and a coin is tossed.', ms: 'Sebiji dadu adil digolek dan sekeping syiling dilambung.', outA: [1, 2, 3, 4, 5, 6], outB: ['H', 'T'] },
      ]);
      const pairs = s.outA.flatMap((a) => s.outB.map((bb) => `(${a}, ${bb})`));
      return { q: T(`${s.en} List the sample space as ordered pairs.`, `${s.ms} Senaraikan ruang sampel sebagai pasangan tertib.`), a: T(`$\\{${pairs.join(',\\ ')}\\}$ (${pairs.length} outcomes)`, `$\\{${pairs.join(',\\ ')}\\}$ (${pairs.length} kesudahan)`), sp: 'm' };
    },
    /* counting principle: combined choices from two independent selections */
    (r) => {
      const m = r.int(2, 5), k = r.int(2, 4);
      const ctx = r.pick([
        (mm, kk) => ({ en: `A canteen sells ${mm} types of drinks and ${kk} types of snacks. A combined order is one drink and one snack. How many different combined orders are possible?`, ms: `Sebuah kantin menjual ${mm} jenis minuman dan ${kk} jenis snek. Satu pesanan gabungan ialah satu minuman dan satu snek. Berapakah bilangan pesanan gabungan yang berbeza?` }),
        (mm, kk) => ({ en: `A tailor has ${mm} designs of shirts and ${kk} colours of trousers. How many different shirt-and-trousers combinations can be formed by choosing one of each?`, ms: `Seorang tukang jahit mempunyai ${mm} reka bentuk baju dan ${kk} warna seluar. Berapakah bilangan gabungan baju-dan-seluar yang berbeza boleh dibentuk dengan memilih satu daripada setiap satu?` }),
        (mm, kk) => ({ en: `There are ${mm} bus routes from town $P$ to town $Q$, and ${kk} train routes from town $Q$ to town $R$. Travelling by bus then train, how many different combined routes from $P$ to $R$ are there?`, ms: `Terdapat ${mm} laluan bas dari bandar $P$ ke bandar $Q$, dan ${kk} laluan tren dari bandar $Q$ ke bandar $R$. Dengan menaiki bas kemudian tren, berapakah bilangan laluan gabungan yang berbeza dari $P$ ke $R$?` }),
      ]);
      const c = ctx(m, k);
      return { q: T(c.en, c.ms), a: T(`$${m} \\times ${k} = ${m * k}$`), sp: 's' };
    },
    /* true/false: independent or not, on a fixed clean scenario bank */
    (r) => {
      const c = r.pick([
        [T('A coin is tossed once and, separately, a fair die is rolled once.', 'Sekeping syiling dilambung sekali dan, secara berasingan, sebiji dadu adil digolek sekali.'), true],
        [T('Two balls are drawn one after another from a bag, without replacing the first.', 'Dua biji bola ditarik satu demi satu daripada sebuah beg, tanpa mengembalikan yang pertama.'), false],
        [T('Two fair dice, a red one and a blue one, are rolled together.', 'Dua biji dadu adil, satu merah dan satu biru, digolek bersama.'), true],
        [T('A class monitor is chosen from a class, then an assistant monitor is chosen from the remaining students.', 'Seorang ketua kelas dipilih daripada sebuah kelas, kemudian seorang penolong ketua kelas dipilih daripada murid yang berbaki.'), false],
        [T('Two different spinners are spun at the same time.', 'Dua pemutar yang berlainan diputar pada masa yang sama.'), true],
        [T('A card is drawn from a deck, replaced and the deck reshuffled, then a second card is drawn.', 'Sekeping kad ditarik daripada satu dek, dikembalikan dan dek dikocok semula, kemudian kad kedua ditarik.'), true],
      ]);
      return { q: T(`True or false: the two events described are independent. "${c[0].en}"`, `Benar atau palsu: kedua-dua peristiwa yang diterangkan itu tak bersandar. "${c[0].ms}"`), a: c[1] ? T('True: the outcome of the first event does not affect the probabilities of the second.', 'Benar: keputusan peristiwa pertama tidak menjejaskan kebarangkalian peristiwa kedua.') : T('False: the composition available for the second event changes because of the first.', 'Palsu: komposisi yang ada untuk peristiwa kedua berubah akibat peristiwa pertama.'), sp: 's' };
    },
  ];

  const g91m = [
    /* classify a pair of events on BOTH axes: mutually exclusive AND independent/dependent, with reasons */
    (r) => {
      const s = replaceScenario(r);
      const c1 = r.pick(COL), c2 = r.pick(COL.filter((x) => x.en !== c1.en));
      const qEn = `${s.en} Let $A$ be the event "the first ${s.h.en.slice(0, -1)} is ${c1.en}" and $B$ be the event "the second ${s.h.en.slice(0, -1)} is ${c2.en}". State whether $A$ and $B$ are (i) mutually exclusive, (ii) independent or dependent. Justify each answer.`;
      const qMs = `${s.ms} Biar $A$ ialah peristiwa "${s.h.ms} pertama berwarna ${c1.ms}" dan $B$ ialah peristiwa "${s.h.ms} kedua berwarna ${c2.ms}". Nyatakan sama ada $A$ dan $B$ (i) saling eksklusif, (ii) tak bersandar atau bersandar. Wajarkan setiap jawapan.`;
      const aEn = `(i) Not mutually exclusive: both can happen in the same trial (the first ${s.h.en.slice(0, -1)} being ${c1.en} does not stop the second being ${c2.en}), so $A \\cap B \\neq \\varnothing$. (ii) ${s.replace ? 'Independent: the first draw does not change the composition for the second draw.' : 'Dependent: removing the first item changes the composition available for the second draw.'}`;
      const aMs = `(i) Bukan saling eksklusif: kedua-duanya boleh berlaku dalam percubaan yang sama (${s.h.ms} pertama berwarna ${c1.ms} tidak menghalang yang kedua berwarna ${c2.ms}), jadi $A \\cap B \\neq \\varnothing$. (ii) ${s.replace ? 'Tak bersandar: cabutan pertama tidak mengubah komposisi untuk cabutan kedua.' : 'Bersandar: mengeluarkan item pertama mengubah komposisi yang ada untuk cabutan kedua.'}`;
      return { q: T(qEn, qMs), a: T(aEn, aMs), sp: 'l' };
    },
    /* two-stage tree diagram: read off structure (independent, so constant branch probabilities) */
    (r) => {
      const R = r.int(2, 5), Bl = r.int(2, 5), N = R + Bl;
      const c1 = r.pick(COL), c2 = r.pick(COL.filter((x) => x.en[0] !== c1.en[0]));
      const fig = treeFig({
        counts: [2, 2],
        branch: () => [{ lab: c1, p: [R, N] }, { lab: c2, p: [Bl, N] }],
        leaf: (path) => `(${path[0] === 0 ? c1.en[0].toUpperCase() : c2.en[0].toUpperCase()}, ${path[1] === 0 ? c1.en[0].toUpperCase() : c2.en[0].toUpperCase()})`,
      });
      const qEn = `A bag has ${R} ${c1.en} balls and ${Bl} ${c2.en} balls. A ball is drawn, its colour noted, and it is put back before a second ball is drawn. The tree diagram shows the two draws. (a) How many outcomes (branches at the end) does the tree show? (b) List the outcomes for which the two balls have different colours.`;
      const qMs = `Sebuah beg mengandungi ${R} biji bola ${c1.ms} dan ${Bl} biji bola ${c2.ms}. Sebiji bola ditarik, warnanya dicatat, dan dikembalikan sebelum bola kedua ditarik. Gambar rajah pokok menunjukkan kedua-dua cabutan itu. (a) Berapakah bilangan kesudahan (cabang pada hujung) yang ditunjukkan oleh pokok itu? (b) Senaraikan kesudahan yang kedua-dua bola berlainan warna.`;
      const L1 = c1.en[0].toUpperCase(), L2 = c2.en[0].toUpperCase();
      return { q: T(qEn, qMs), fig, a: T(`(a) 4 (b) $(${L1}, ${L2})$ and $(${L2}, ${L1})$`, `(a) 4 (b) $(${L1}, ${L2})$ dan $(${L2}, ${L1})$`), sp: 'm' };
    },
    /* read outcomes satisfying a compound condition from a two-dice table (representation, not probability) */
    (r) => {
      const p1 = r.pick(PRED)(6), p2 = r.pick(PRED.filter((f) => f !== undefined))(6);
      need(p1 && p2);
      const rows = range(1, 6).filter((d1) => p1.test(d1));
      const cols = range(1, 6).filter((d2) => p2.test(d2));
      const pairs = rows.flatMap((d1) => cols.map((d2) => `(${d1}, ${d2})`));
      const qEn = `A red die and a blue die, both fair, are rolled together and the outcomes are recorded as ordered pairs (red, blue) in a $6 \\times 6$ table of 36 outcomes. List all the outcomes for which the red die shows ${p1.en} and the blue die shows ${p2.en}.`;
      const qMs = `Sebiji dadu merah dan sebiji dadu biru, kedua-duanya adil, digolek bersama dan kesudahannya dicatat sebagai pasangan tertib (merah, biru) dalam jadual $6 \\times 6$ bagi 36 kesudahan. Senaraikan semua kesudahan yang dadu merah menunjukkan ${p1.ms} dan dadu biru menunjukkan ${p2.ms}.`;
      return { q: T(qEn, qMs), a: T(`$\\{${pairs.join(',\\ ')}\\}$ (${pairs.length} outcomes)`, `$\\{${pairs.join(',\\ ')}\\}$ (${pairs.length} kesudahan)`), sp: 'm' };
    },
    /* Venn-diagram classification: mutually exclusive or not, from region counts */
    (r) => {
      const tot = r.pick([24, 30, 36]);
      const both = r.chance(0.6) ? r.int(2, 6) : 0;
      const onlyA = r.int(4, 9), onlyB = r.int(4, 9);
      const none = tot - onlyA - onlyB - both;
      need(none >= 1);
      const sp1 = r.pick(SPM.bank.sports), sp2 = r.pick(SPM.bank.sports.filter((x) => x.en !== sp1.en));
      const fig = T(
        S.venn({ sets: 2, names: ['A', 'B'], counts: { A: onlyA, B: onlyB, AB: both, '0': none }, xi: 'ξ' }),
        S.venn({ sets: 2, names: ['A', 'B'], counts: { A: onlyA, B: onlyB, AB: both, '0': none }, xi: 'ξ' })
      );
      const qEn = `The Venn diagram shows the number of students in a class of ${tot}, where $A$ is the event "plays ${sp1.en}" and $B$ is the event "plays ${sp2.en}". State $n(A \\cap B)$ and hence say whether $A$ and $B$ are mutually exclusive.`;
      const qMs = `Gambar rajah Venn menunjukkan bilangan murid dalam sebuah kelas seramai ${tot} orang, dengan $A$ ialah peristiwa "bermain ${sp1.ms}" dan $B$ ialah peristiwa "bermain ${sp2.ms}". Nyatakan $n(A \\cap B)$ dan seterusnya katakan sama ada $A$ dan $B$ saling eksklusif.`;
      const aEn = both === 0 ? `$n(A \\cap B) = 0$; $A$ and $B$ are mutually exclusive.` : `$n(A \\cap B) = ${both}$; $A$ and $B$ are not mutually exclusive.`;
      const aMs = both === 0 ? `$n(A \\cap B) = 0$; $A$ dan $B$ saling eksklusif.` : `$n(A \\cap B) = ${both}$; $A$ dan $B$ bukan saling eksklusif.`;
      return { q: T(qEn, qMs), fig, a: T(aEn, aMs), sp: 's' };
    },
    /* analyse dependence in a described (non-mechanical) scenario */
    (r) => {
      const c = r.pick([
        [T('A number is chosen at random from $1$ to $20$. $A$: the number is a multiple of $4$. $B$: the same number is a multiple of $5$.', 'Satu nombor dipilih secara rawak dari $1$ hingga $20$. $A$: nombor itu gandaan $4$. $B$: nombor yang sama itu gandaan $5$.'), 'die20'],
        [T('A student is chosen at random from a school. $A$: the student studies in Form 4. $B$: the student is a prefect.', 'Seorang murid dipilih secara rawak daripada sebuah sekolah. $A$: murid itu belajar di Tingkatan 4. $B$: murid itu ialah pengawas.'), 'general'],
        [T('A card numbered $1$ to $9$ is drawn at random. $A$: the number is odd. $B$: the same number is even.', 'Sekeping kad bernombor $1$ hingga $9$ dipilih secara rawak. $A$: nombor itu ganjil. $B$: nombor yang sama itu genap.'), 'oddeven9'],
      ]);
      let aEn, aMs;
      if (c[1] === 'die20') {
        const both = range(1, 20).filter((v) => v % 4 === 0 && v % 5 === 0);
        aEn = `Not mutually exclusive: $A \\cap B = \\{${both.join(', ')}\\} \\neq \\varnothing$ (a multiple of 20 is a multiple of both). This is about the same trial, so independence would need to be checked by comparing $P(A \\cap B)$ with $P(A)P(B)$, not assumed.`;
        aMs = `Bukan saling eksklusif: $A \\cap B = \\{${both.join(', ')}\\} \\neq \\varnothing$ (gandaan 20 ialah gandaan kedua-duanya). Ini melibatkan percubaan yang sama, jadi ketidaksandaran perlu disemak dengan membandingkan $P(A \\cap B)$ dengan $P(A)P(B)$, bukan diandaikan.`;
      } else if (c[1] === 'oddeven9') {
        aEn = `Mutually exclusive: no number is both odd and even, so $A \\cap B = \\varnothing$. They are not independent: knowing $A$ occurred tells us for certain that $B$ did not, so $P(B \\mid A) = 0 \\neq P(B)$.`;
        aMs = `Saling eksklusif: tiada nombor yang ganjil dan genap serentak, jadi $A \\cap B = \\varnothing$. Ia bukan tak bersandar: mengetahui $A$ berlaku memberitahu kita dengan pasti $B$ tidak berlaku, jadi $P(B \\mid A) = 0 \\neq P(B)$.`;
      } else {
        aEn = `These events can overlap (a Form 4 student can be a prefect), so they are not mutually exclusive. Whether they are independent cannot be decided from the description alone; it must be checked against real data by comparing $P(A \\cap B)$ with $P(A)P(B)$.`;
        aMs = `Peristiwa ini boleh bertindih (seorang murid Tingkatan 4 boleh menjadi pengawas), jadi ia bukan saling eksklusif. Sama ada ia tak bersandar tidak dapat ditentukan hanya daripada penerangan; ia perlu disemak dengan data sebenar dengan membandingkan $P(A \\cap B)$ dengan $P(A)P(B)$.`;
      }
      return { q: T(`${c[0].en} Are $A$ and $B$ mutually exclusive? Can you tell, from the description alone, whether $A$ and $B$ are independent? Explain.`, `${c[0].ms} Adakah $A$ dan $B$ saling eksklusif? Bolehkah anda tentukan, daripada penerangan sahaja, sama ada $A$ dan $B$ tak bersandar? Terangkan.`), a: T(aEn, aMs), sp: 'm' };
    },
  ];

  const g91a = [
    /* explicit counterexamples for the three genuine relationships (independent-but-not-ME / ME-but-not-independent / neither) */
    (r) => {
      const c = r.pick([
        [
          T('Show, with an example, that two events can be independent without being mutually exclusive.', 'Tunjukkan, dengan satu contoh, bahawa dua peristiwa boleh tak bersandar tanpa saling eksklusif.'),
          T('Toss a fair coin twice. $A$: the first toss is $H$. $B$: the second toss is $H$. $P(A) = P(B) = \\dfrac{1}{2}$ and $P(A \\cap B) = \\dfrac{1}{4} = P(A) \\times P(B)$, so $A$ and $B$ are independent. But $A \\cap B = \\{HH\\} \\neq \\varnothing$, so they are not mutually exclusive.', 'Lambungkan sekeping syiling adil dua kali. $A$: lambungan pertama ialah $H$. $B$: lambungan kedua ialah $H$. $P(A) = P(B) = \\dfrac{1}{2}$ dan $P(A \\cap B) = \\dfrac{1}{4} = P(A) \\times P(B)$, jadi $A$ dan $B$ tak bersandar. Tetapi $A \\cap B = \\{HH\\} \\neq \\varnothing$, jadi ia bukan saling eksklusif.'),
        ],
        [
          T('Show, with an example, that two events can be mutually exclusive without being independent.', 'Tunjukkan, dengan satu contoh, bahawa dua peristiwa boleh saling eksklusif tanpa tak bersandar.'),
          T('Roll one fair die. $A = \\{1\\}$, $B = \\{2\\}$. $A \\cap B = \\varnothing$, so $A$ and $B$ are mutually exclusive. But $P(A) \\times P(B) = \\dfrac{1}{36} \\neq 0 = P(A \\cap B)$, so they are not independent.', 'Golekkan sebiji dadu adil. $A = \\{1\\}$, $B = \\{2\\}$. $A \\cap B = \\varnothing$, jadi $A$ dan $B$ saling eksklusif. Tetapi $P(A) \\times P(B) = \\dfrac{1}{36} \\neq 0 = P(A \\cap B)$, jadi ia bukan tak bersandar.'),
        ],
        [
          T('Give an example of two events that are neither mutually exclusive nor independent.', 'Berikan satu contoh dua peristiwa yang bukan saling eksklusif dan juga bukan tak bersandar.'),
          T('Roll one fair die. $A = \\{1,2,3,4\\}$, $B = \\{3,4\\}$. $A \\cap B = \\{3,4\\} \\neq \\varnothing$, so not mutually exclusive. $P(A)P(B) = \\dfrac{2}{3} \\times \\dfrac{1}{3} = \\dfrac{2}{9} \\neq \\dfrac{1}{3} = P(A \\cap B)$, so not independent either.', 'Golekkan sebiji dadu adil. $A = \\{1,2,3,4\\}$, $B = \\{3,4\\}$. $A \\cap B = \\{3,4\\} \\neq \\varnothing$, jadi bukan saling eksklusif. $P(A)P(B) = \\dfrac{2}{3} \\times \\dfrac{1}{3} = \\dfrac{2}{9} \\neq \\dfrac{1}{3} = P(A \\cap B)$, jadi bukan tak bersandar juga.'),
        ],
        [
          T('Show, with an example using two spinners, that two events can be independent without being mutually exclusive.', 'Tunjukkan, dengan satu contoh menggunakan dua pemutar, bahawa dua peristiwa boleh tak bersandar tanpa saling eksklusif.'),
          T('Spin two separate fair spinners, each numbered 1 to 4. $A$: the first spinner shows 1. $B$: the second spinner shows 1. $P(A) = P(B) = \\dfrac{1}{4}$ and $P(A \\cap B) = \\dfrac{1}{16} = P(A) \\times P(B)$, so $A$ and $B$ are independent, yet $A \\cap B \\neq \\varnothing$ (both can show 1), so they are not mutually exclusive.', 'Putarkan dua pemutar adil berasingan, setiap satu bernombor 1 hingga 4. $A$: pemutar pertama menunjukkan 1. $B$: pemutar kedua menunjukkan 1. $P(A) = P(B) = \\dfrac{1}{4}$ dan $P(A \\cap B) = \\dfrac{1}{16} = P(A) \\times P(B)$, jadi $A$ dan $B$ tak bersandar, namun $A \\cap B \\neq \\varnothing$ (kedua-duanya boleh menunjukkan 1), jadi ia bukan saling eksklusif.'),
        ],
        [
          T('Show, with an example using numbered cards, that two events can be mutually exclusive without being independent.', 'Tunjukkan, dengan satu contoh menggunakan kad bernombor, bahawa dua peristiwa boleh saling eksklusif tanpa tak bersandar.'),
          T('A card is drawn from cards numbered 1 to 10. $A = \\{1\\}$, $B = \\{2\\}$. $A \\cap B = \\varnothing$, so mutually exclusive. But $P(A) \\times P(B) = \\dfrac{1}{100} \\neq 0 = P(A \\cap B)$, so they are not independent.', 'Sekeping kad dipilih daripada kad bernombor 1 hingga 10. $A = \\{1\\}$, $B = \\{2\\}$. $A \\cap B = \\varnothing$, jadi saling eksklusif. Tetapi $P(A) \\times P(B) = \\dfrac{1}{100} \\neq 0 = P(A \\cap B)$, jadi ia bukan tak bersandar.'),
        ],
        [
          T('Give an example, using draws without replacement, of two events that are neither mutually exclusive nor independent.', 'Berikan satu contoh, menggunakan cabutan tanpa pengembalian, dua peristiwa yang bukan saling eksklusif dan juga bukan tak bersandar.'),
          T('A bag has 3 red and 2 blue balls. Two balls are drawn without replacement. $A$: the first ball is red. $B$: the second ball is red. $A \\cap B \\neq \\varnothing$ (both can be red), so not mutually exclusive. $P(A) = P(B) = \\dfrac{3}{5}$, so $P(A)P(B) = \\dfrac{9}{25}$, but $P(A \\cap B) = \\dfrac{3}{5} \\times \\dfrac{2}{4} = \\dfrac{3}{10} \\neq \\dfrac{9}{25}$, so not independent either.', 'Sebuah beg mengandungi 3 biji bola merah dan 2 biji bola biru. Dua biji bola ditarik tanpa pengembalian. $A$: bola pertama merah. $B$: bola kedua merah. $A \\cap B \\neq \\varnothing$ (kedua-duanya boleh merah), jadi bukan saling eksklusif. $P(A) = P(B) = \\dfrac{3}{5}$, jadi $P(A)P(B) = \\dfrac{9}{25}$, tetapi $P(A \\cap B) = \\dfrac{3}{5} \\times \\dfrac{2}{4} = \\dfrac{3}{10} \\neq \\dfrac{9}{25}$, jadi ia bukan tak bersandar juga.'),
        ],
      ]);
      return { q: c[0], a: c[1], sp: 'l' };
    },
    /* full numeric classification, mutually exclusive AND independent, verified by computation */
    (r) => {
      const ex = r.pick(NEXP);
      const [p1, p2] = twoPreds(r, ex.N);
      const A = range(1, ex.N).filter((v) => p1.test(v));
      const B = range(1, ex.N).filter((v) => p2.test(v));
      const inter = A.filter((v) => B.includes(v));
      const me = inter.length === 0;
      const PA = fr(A.length, ex.N), PB = fr(B.length, ex.N), PAB = fr(inter.length, ex.N);
      const indep = Fr.eq(PAB, Fr.mul(PA, PB));
      const qEn = `In the experiment where ${ex.en}, let $A$ be the event "the result is ${p1.en}" and $B$ be the event "the result is ${p2.en}". Determine, with full working, whether $A$ and $B$ are (i) mutually exclusive and (ii) independent.`;
      const qMs = `Dalam eksperimen di mana ${ex.ms}, biar $A$ ialah peristiwa "keputusan ialah ${p1.ms}" dan $B$ ialah peristiwa "keputusan ialah ${p2.ms}". Tentukan, dengan kerja penuh, sama ada $A$ dan $B$ (i) saling eksklusif dan (ii) tak bersandar.`;
      const aEn = `$P(A) = ${frT(PA)}$, $P(B) = ${frT(PB)}$, $P(A \\cap B) = ${frT(PAB)}$. (i) ${me ? 'Mutually exclusive, since $A \\cap B = \\varnothing$.' : 'Not mutually exclusive, since $A \\cap B \\neq \\varnothing$.'} (ii) $P(A) \\times P(B) = ${frT(Fr.mul(PA, PB))}$, ${indep ? 'which equals $P(A \\cap B)$, so $A$ and $B$ are independent.' : 'which does not equal $P(A \\cap B)$, so $A$ and $B$ are not independent.'}`;
      const aMs = `$P(A) = ${frT(PA)}$, $P(B) = ${frT(PB)}$, $P(A \\cap B) = ${frT(PAB)}$. (i) ${me ? 'Saling eksklusif, kerana $A \\cap B = \\varnothing$.' : 'Bukan saling eksklusif, kerana $A \\cap B \\neq \\varnothing$.'} (ii) $P(A) \\times P(B) = ${frT(Fr.mul(PA, PB))}$, ${indep ? 'yang sama dengan $P(A \\cap B)$, jadi $A$ dan $B$ tak bersandar.' : 'yang tidak sama dengan $P(A \\cap B)$, jadi $A$ dan $B$ bukan tak bersandar.'}`;
      return { q: T(qEn, qMs), a: T(aEn, aMs), sp: 'l' };
    },
    /* MCQ: match a labelled pair of events to a stated target relationship */
    (r) => {
      const PAIRS = [
        ['P', T('a fair die is rolled once; $A = \\{1\\}$, $B = \\{2\\}$', 'sebiji dadu adil digolek sekali; $A = \\{1\\}$, $B = \\{2\\}$'), 'me_not_indep'],
        ['Q', T('a fair coin is tossed twice; $A$: first toss is $H$, $B$: second toss is $H$', 'sekeping syiling adil dilambung dua kali; $A$: lambungan pertama $H$, $B$: lambungan kedua $H$'), 'indep_not_me'],
        ['R', T('a fair die is rolled once; $A = \\{1,2,3,4\\}$, $B = \\{3,4\\}$', 'sebiji dadu adil digolek sekali; $A = \\{1,2,3,4\\}$, $B = \\{3,4\\}$'), 'neither'],
        ['S', T('a fair coin is tossed once; $A$: the coin shows $H$, $B$: the (impossible) event that the coin shows $7$', 'sekeping syiling adil dilambung sekali; $A$: syiling menunjukkan $H$, $B$: peristiwa (mustahil) syiling menunjukkan $7$'), 'both'],
      ];
      const targets = [
        ['me_not_indep', T('mutually exclusive but not independent', 'saling eksklusif tetapi bukan tak bersandar')],
        ['indep_not_me', T('independent but not mutually exclusive', 'tak bersandar tetapi bukan saling eksklusif')],
        ['neither', T('neither mutually exclusive nor independent', 'bukan saling eksklusif dan bukan tak bersandar')],
        ['both', T('both mutually exclusive and independent (the degenerate case)', 'kedua-dua saling eksklusif dan tak bersandar (kes tersasar)')],
      ];
      const tgt = r.pick(targets);
      const correct = PAIRS.find((p) => p[2] === tgt[0]);
      const tab = SPM.table(PAIRS.map((p) => [p[0], p[1].en]), { head: ['Pair', 'Description'] });
      const tabMs = SPM.table(PAIRS.map((p) => [p[0], p[1].ms]), { head: ['Pasangan', 'Penerangan'] });
      const qEn = `Four pairs of events are described below.${tab}Which pair, P, Q, R or S, illustrates events that are ${tgt[1].en}? Justify your choice with a brief calculation.`;
      const qMs = `Empat pasangan peristiwa diterangkan di bawah.${tabMs}Pasangan yang manakah, P, Q, R atau S, menggambarkan peristiwa yang ${tgt[1].ms}? Wajarkan pilihan anda dengan pengiraan ringkas.`;
      return { q: T(qEn, qMs), a: T(`${correct[0]}: ${correct[1].en}`, `${correct[0]}: ${correct[1].ms}`), sp: 'm' };
    },
    /* true/false: general claims relating the two properties */
    (r) => {
      const st = r.pick([
        [T('If two events have positive probability and are mutually exclusive, then they cannot be independent.', 'Jika dua peristiwa berkebarangkalian positif dan saling eksklusif, maka ia tidak boleh tak bersandar.'), true, T('True: mutually exclusive gives $P(A \\cap B) = 0$, but independence would need $P(A \\cap B) = P(A)P(B) > 0$ since both probabilities are positive — a contradiction.', 'Benar: saling eksklusif memberi $P(A \\cap B) = 0$, tetapi ketidaksandaran memerlukan $P(A \\cap B) = P(A)P(B) > 0$ kerana kedua-dua kebarangkalian adalah positif — satu percanggahan.')],
        [T('If two events with positive probability are independent, then they must overlap (they cannot be mutually exclusive).', 'Jika dua peristiwa berkebarangkalian positif adalah tak bersandar, maka ia mesti bertindih (ia tidak boleh saling eksklusif).'), true, T('True: independence gives $P(A \\cap B) = P(A)P(B) > 0$, so $A \\cap B \\neq \\varnothing$, meaning they are not mutually exclusive.', 'Benar: ketidaksandaran memberi $P(A \\cap B) = P(A)P(B) > 0$, jadi $A \\cap B \\neq \\varnothing$, bermakna ia bukan saling eksklusif.')],
        [T('Two events that are not mutually exclusive must be independent.', 'Dua peristiwa yang bukan saling eksklusif mesti tak bersandar.'), false, T('False: on one die roll, $A = \\{1,2,3,4\\}$ and $B = \\{3,4\\}$ overlap ($A \\cap B \\neq \\varnothing$) but $P(A)P(B) = \\dfrac{2}{9} \\neq \\dfrac{1}{3} = P(A \\cap B)$, so they are not independent.', 'Palsu: pada satu golekan dadu, $A = \\{1,2,3,4\\}$ dan $B = \\{3,4\\}$ bertindih ($A \\cap B \\neq \\varnothing$) tetapi $P(A)P(B) = \\dfrac{2}{9} \\neq \\dfrac{1}{3} = P(A \\cap B)$, jadi ia bukan tak bersandar.')],
        [T('Two dependent events must be mutually exclusive.', 'Dua peristiwa bersandar mesti saling eksklusif.'), false, T('False: drawing two balls without replacement, $A$: first ball red, $B$: second ball red, are dependent but not mutually exclusive — both can be red in the same trial.', 'Palsu: menarik dua biji bola tanpa pengembalian, $A$: bola pertama merah, $B$: bola kedua merah, adalah bersandar tetapi bukan saling eksklusif — kedua-duanya boleh merah dalam percubaan yang sama.')],
      ]);
      return { q: T(`True or false? "${st[0].en}" Justify your answer.`, `Benar atau palsu? "${st[0].ms}" Wajarkan jawapan anda.`), a: T(st[2].en, st[2].ms), sp: 'm' };
    },
    /* construct a degenerate probability-zero example showing both properties can coincide */
    (r) => {
      const c = r.pick([
        [T('a fair die is rolled', 'sebiji dadu adil digolek'), T('the die shows 7', 'dadu menunjukkan 7')],
        [T('a fair coin is tossed', 'sekeping syiling adil dilambung'), T('the coin lands standing on its edge', 'syiling mendarat dalam keadaan berdiri di sisi')],
        [T('a card is drawn at random from a normal deck of 52 playing cards', 'sekeping kad dipilih secara rawak daripada satu dek 52 keping daun terup biasa'), T('the card drawn is a joker', 'kad yang ditarik ialah joker')],
      ]);
      const ex = c[0], impossible = c[1];
      return { q: T(`Suppose ${ex.en}. Let $B$ be an impossible event for this experiment (for example, "${impossible.en}"), so $P(B) = 0$. Explain why, for any event $A$, the pair $A$ and $B$ is both mutually exclusive and independent.`, `Andaikan ${ex.ms}. Biar $B$ ialah satu peristiwa mustahil bagi eksperimen ini (contohnya, "${impossible.ms}"), jadi $P(B) = 0$. Terangkan mengapa, bagi sebarang peristiwa $A$, pasangan $A$ dan $B$ adalah saling eksklusif dan tak bersandar pada masa yang sama.`), a: T('$B = \\varnothing$, so $A \\cap B = \\varnothing$ for any $A$: mutually exclusive. Also $P(A \\cap B) = 0 = P(A) \\times 0 = P(A)P(B)$: independent. Both definitions are satisfied only because $P(B) = 0$.', '$B = \\varnothing$, jadi $A \\cap B = \\varnothing$ bagi sebarang $A$: saling eksklusif. Juga $P(A \\cap B) = 0 = P(A) \\times 0 = P(A)P(B)$: tak bersandar. Kedua-dua takrif dipenuhi hanya kerana $P(B) = 0$.'), sp: 'm' };
    },
    /* critique a flawed argument */
    (r) => {
      const c = r.pick([
        [
          T('A student argues: "$A$: a die shows an even number, and $B$: the die shows an odd number, are mutually exclusive, so they must be independent." Find the flaw.', 'Seorang murid berhujah: "$A$: dadu menunjukkan nombor genap, dan $B$: dadu menunjukkan nombor ganjil, adalah saling eksklusif, jadi ia mesti tak bersandar." Cari kesilapannya.'),
          T('The flaw is assuming mutually exclusive implies independent. Here $P(A) = P(B) = \\dfrac{1}{2}$ but $P(A \\cap B) = 0 \\neq \\dfrac{1}{4} = P(A) \\times P(B)$, so $A$ and $B$ are in fact not independent.', 'Kesilapannya ialah menganggap saling eksklusif membawa maksud tak bersandar. Di sini $P(A) = P(B) = \\dfrac{1}{2}$ tetapi $P(A \\cap B) = 0 \\neq \\dfrac{1}{4} = P(A) \\times P(B)$, jadi $A$ dan $B$ sebenarnya bukan tak bersandar.'),
        ],
        [
          T('A student argues: "Two draws from a bag without replacement give independent events, since each draw is a separate action." Find the flaw.', 'Seorang murid berhujah: "Dua cabutan daripada sebuah beg tanpa pengembalian menghasilkan peristiwa tak bersandar, kerana setiap cabutan adalah tindakan berasingan." Cari kesilapannya.'),
          T('The flaw is confusing "a separate action" with "independent". Without replacement, removing the first item changes the composition of the bag, so the probabilities for the second draw genuinely change — the draws are dependent, regardless of being separate actions.', 'Kesilapannya ialah mengelirukan "tindakan berasingan" dengan "tak bersandar". Tanpa pengembalian, mengeluarkan item pertama mengubah komposisi beg itu, jadi kebarangkalian bagi cabutan kedua benar-benar berubah — cabutan itu bersandar, walaupun ia tindakan berasingan.'),
        ],
        [
          T('A student argues: "$A$: a die shows a number greater than 3, and $B$: the die shows a number less than 3, share no outcome, so $P(A) \\times P(B)$ must equal $P(A \\cap B)$." Find the flaw.', 'Seorang murid berhujah: "$A$: dadu menunjukkan nombor lebih besar daripada 3, dan $B$: dadu menunjukkan nombor kurang daripada 3, tidak berkongsi sebarang kesudahan, jadi $P(A) \\times P(B)$ mesti sama dengan $P(A \\cap B)$." Cari kesilapannya.'),
          T('The flaw is assuming $A \\cap B = \\varnothing$ forces $P(A) \\times P(B) = P(A \\cap B)$. Here $P(A) = \\dfrac{1}{2}$, $P(B) = \\dfrac{1}{3}$, so $P(A)P(B) = \\dfrac{1}{6} \\neq 0 = P(A \\cap B)$; mutually exclusive events (other than degenerate ones) are generally not independent.', 'Kesilapannya ialah menganggap $A \\cap B = \\varnothing$ memaksa $P(A) \\times P(B) = P(A \\cap B)$. Di sini $P(A) = \\dfrac{1}{2}$, $P(B) = \\dfrac{1}{3}$, jadi $P(A)P(B) = \\dfrac{1}{6} \\neq 0 = P(A \\cap B)$; peristiwa saling eksklusif (selain kes tersasar) secara amnya bukan tak bersandar.'),
        ],
      ]);
      return { q: c[0], a: c[1], sp: 'm' };
    },
    /* the probability-zero degenerate edge case */
    (r) => ({
      q: T('A student claims: "Two events of positive probability can never be both mutually exclusive and independent." Is this true? What happens at the edge case where one event has probability 0?', 'Seorang murid mendakwa: "Dua peristiwa yang berkebarangkalian positif tidak boleh saling eksklusif dan tak bersandar pada masa yang sama." Adakah ini benar? Apakah yang berlaku pada kes sempadan apabila satu peristiwa mempunyai kebarangkalian 0?'),
      a: T('True for positive-probability events: independence needs $P(A \\cap B) = P(A)P(B) > 0$, but mutually exclusive needs $P(A \\cap B) = 0$ — these contradict unless $P(A) = 0$ or $P(B) = 0$. Edge case: if $P(B) = 0$ (an impossible event), then $A \\cap B = \\varnothing$ (mutually exclusive) and $P(A \\cap B) = 0 = P(A) \\times 0$ (independent) both hold, so the two properties coincide only in this degenerate case.', 'Benar untuk peristiwa berkebarangkalian positif: ketidaksandaran memerlukan $P(A \\cap B) = P(A)P(B) > 0$, tetapi saling eksklusif memerlukan $P(A \\cap B) = 0$ — ini bercanggah melainkan $P(A) = 0$ atau $P(B) = 0$. Kes sempadan: jika $P(B) = 0$ (peristiwa mustahil), maka $A \\cap B = \\varnothing$ (saling eksklusif) dan $P(A \\cap B) = 0 = P(A) \\times 0$ (tak bersandar) kedua-duanya berlaku, jadi kedua-dua sifat itu bertepatan hanya dalam kes tersasar ini.'),
      sp: 'l',
    }),
    /* construct-your-own example against a stated target classification */
    (r) => {
      const target = r.pick([
        ['mutually exclusive but dependent', 'saling eksklusif tetapi bersandar'],
        ['independent but not mutually exclusive', 'tak bersandar tetapi bukan saling eksklusif'],
        ['neither mutually exclusive nor independent', 'bukan saling eksklusif dan bukan tak bersandar'],
      ]);
      return { q: T(`Using a single fair die roll, construct two events $A$ and $B$ that are ${target[0]}. State $A$, $B$, and show your working.`, `Dengan menggunakan satu golekan dadu adil, bina dua peristiwa $A$ dan $B$ yang ${target[1]}. Nyatakan $A$, $B$, dan tunjukkan kerja anda.`), a: T('Any correct construction is accepted, e.g. (for mutually exclusive but dependent) $A = \\{1\\}$, $B = \\{2\\}$: $A \\cap B = \\varnothing$ but $P(A)P(B) = \\frac{1}{36} \\neq 0$; (for independent but not mutually exclusive) use two separate dice, $A$: first die is $1$, $B$: second die is $1$; (for neither) $A = \\{1,2,3,4\\}$, $B = \\{3,4\\}$ as shown above.', 'Sebarang pembinaan yang betul diterima, contohnya (bagi saling eksklusif tetapi bersandar) $A = \\{1\\}$, $B = \\{2\\}$: $A \\cap B = \\varnothing$ tetapi $P(A)P(B) = \\frac{1}{36} \\neq 0$; (bagi tak bersandar tetapi bukan saling eksklusif) guna dua biji dadu berasingan, $A$: dadu pertama $1$, $B$: dadu kedua $1$; (bagi bukan kedua-duanya) $A = \\{1,2,3,4\\}$, $B = \\{3,4\\}$ seperti di atas.'), sp: 'l' };
    },
    /* multi-part: classify several pairs from one shared combined experiment */
    (r) => {
      const s = replaceScenario(r);
      const parts = SPM.parts([
        T(`$A$: the first ${s.h.en.slice(0, -1)} drawn is a particular colour; $B$: the second ${s.h.en.slice(0, -1)} drawn is a particular (different) colour. Are $A$ and $B$ mutually exclusive?`, `$A$: ${s.h.ms} pertama yang ditarik berwarna tertentu; $B$: ${s.h.ms} kedua yang ditarik berwarna tertentu (berlainan). Adakah $A$ dan $B$ saling eksklusif?`),
        T(`Are $A$ and $B$ independent or dependent? Justify using the drawing method described above.`, `Adakah $A$ dan $B$ tak bersandar atau bersandar? Wajarkan menggunakan kaedah cabutan yang diterangkan di atas.`),
      ]);
      const ans = SPM.parts([
        T('Not mutually exclusive: both colours can occur together in the same trial (once for each draw), so $A \\cap B \\neq \\varnothing$.', 'Bukan saling eksklusif: kedua-dua warna boleh berlaku bersama dalam percubaan yang sama (sekali bagi setiap cabutan), jadi $A \\cap B \\neq \\varnothing$.'),
        s.replace
          ? T('Independent: because the item is replaced and mixed back in, the composition for the second draw is exactly the same as for the first.', 'Tak bersandar: kerana item dikembalikan dan dicampur semula, komposisi untuk cabutan kedua adalah sama seperti cabutan pertama.')
          : T('Dependent: because the first item is not returned, the composition available for the second draw has changed.', 'Bersandar: kerana item pertama tidak dikembalikan, komposisi yang ada untuk cabutan kedua telah berubah.'),
      ]);
      return { q: T(`${s.en} Answer the following.`, `${s.ms} Jawab soalan berikut.`) , a: ans, sp: 'l' };
    },
  ];

  SPM.extend('F4-9.1', { e: g91e, m: g91m, a: g91a });

  /* =============================================================== F4-9.2 */
  /** verify the addition rule for a single-trial predicate pair; returns everything needed to build q/a */
  function addRuleCase(r) {
    const ex = r.pick(NEXP);
    const [p1, p2] = twoPreds(r, ex.N);
    const A = range(1, ex.N).filter((v) => p1.test(v));
    const B = range(1, ex.N).filter((v) => p2.test(v));
    const uni = Array.from(new Set(A.concat(B)));
    const inter = A.filter((v) => B.includes(v));
    return { ex, p1, p2, A, B, uni, inter, PA: fr(A.length, ex.N), PB: fr(B.length, ex.N), PAB: fr(inter.length, ex.N), PU: fr(uni.length, ex.N) };
  }

  const g92e = [
    /* verify the addition rule directly from an outcome table (dice sum, given at baseline) is already covered;
       here: verify from a single-trial predicate table */
    (r) => {
      const c = addRuleCase(r);
      const qEn = `In the experiment where ${c.ex.en}, $A$ is the event "the result is ${c.p1.en}" and $B$ is the event "the result is ${c.p2.en}". Complete: $P(A) = \\underline{\\quad}$, $P(B) = \\underline{\\quad}$, $P(A \\cap B) = \\underline{\\quad}$, $P(A \\cup B) = \\underline{\\quad}$.`;
      const qMs = `Dalam eksperimen di mana ${c.ex.ms}, $A$ ialah peristiwa "keputusan ialah ${c.p1.ms}" dan $B$ ialah peristiwa "keputusan ialah ${c.p2.ms}". Lengkapkan: $P(A) = \\underline{\\quad}$, $P(B) = \\underline{\\quad}$, $P(A \\cap B) = \\underline{\\quad}$, $P(A \\cup B) = \\underline{\\quad}$.`;
      return { q: T(qEn, qMs), a: T(`$P(A) = ${frT(c.PA)}$, $P(B) = ${frT(c.PB)}$, $P(A \\cap B) = ${frT(c.PAB)}$, $P(A \\cup B) = ${frT(c.PU)}$`), sp: 's' };
    },
    /* verify the addition rule numerically for one case (identity check) */
    (r) => {
      const c = addRuleCase(r);
      const rhs = Fr.sub(Fr.add(c.PA, c.PB), c.PAB);
      const qEn = `In the experiment where ${c.ex.en}, $A$: the result is ${c.p1.en}; $B$: the result is ${c.p2.en}. Verify that $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ for this case.`;
      const qMs = `Dalam eksperimen di mana ${c.ex.ms}, $A$: keputusan ialah ${c.p1.ms}; $B$: keputusan ialah ${c.p2.ms}. Sahkan bahawa $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ bagi kes ini.`;
      return { q: T(qEn, qMs), a: T(`$P(A) + P(B) - P(A \\cap B) = ${frT(c.PA)} + ${frT(c.PB)} - ${frT(c.PAB)} = ${frT(rhs)}$, which equals $P(A \\cup B) = ${frT(c.PU)}$. Verified.`, `$P(A) + P(B) - P(A \\cap B) = ${frT(c.PA)} + ${frT(c.PB)} - ${frT(c.PAB)} = ${frT(rhs)}$, iaitu sama dengan $P(A \\cup B) = ${frT(c.PU)}$. Disahkan.`), sp: 'm' };
    },
    /* verify the special mutually-exclusive rule (no subtraction term) */
    (r) => {
      const ex = r.pick(NEXP);
      const parity = r.chance();
      const A = range(1, ex.N).filter((v) => (v % 2 === 0) === parity);
      const B = range(1, ex.N).filter((v) => (v % 2 === 0) !== parity);
      const uni = A.concat(B);
      const PA = fr(A.length, ex.N), PB = fr(B.length, ex.N), PU = fr(uni.length, ex.N);
      const qEn = `In the experiment where ${ex.en}, $A$: the result is ${parity ? 'even' : 'odd'}; $B$: the result is ${parity ? 'odd' : 'even'}. $A$ and $B$ are mutually exclusive. Verify that $P(A \\cup B) = P(A) + P(B)$ for this case.`;
      const qMs = `Dalam eksperimen di mana ${ex.ms}, $A$: keputusan ialah ${parity ? 'genap' : 'ganjil'}; $B$: keputusan ialah ${parity ? 'ganjil' : 'genap'}. $A$ dan $B$ saling eksklusif. Sahkan bahawa $P(A \\cup B) = P(A) + P(B)$ bagi kes ini.`;
      return { q: T(qEn, qMs), a: T(`$P(A) + P(B) = ${frT(PA)} + ${frT(PB)} = ${frT(Fr.add(PA, PB))}$, which equals $P(A \\cup B) = ${frT(PU)}$ (no outcome is counted twice, since $A \\cap B = \\varnothing$). Verified.`, `$P(A) + P(B) = ${frT(PA)} + ${frT(PB)} = ${frT(Fr.add(PA, PB))}$, iaitu sama dengan $P(A \\cup B) = ${frT(PU)}$ (tiada kesudahan dikira dua kali, kerana $A \\cap B = \\varnothing$). Disahkan.`), sp: 'm' };
    },
    /* verify the product rule from a completed two-stage table (independent, with-replacement) */
    (r) => {
      const R = r.int(2, 5), Bl = r.int(2, 5), N = R + Bl;
      const c1 = r.pick(COL), c2 = r.pick(COL.filter((x) => x.en !== c1.en));
      const PA = fr(R, N), PB = fr(Bl, N), PAB = fr(R * Bl, N * N);
      const qEn = `A ball is drawn from a bag of ${R} ${c1.en} and ${Bl} ${c2.en} balls, its colour noted, then put back before a second ball is drawn. $A$: the first ball is ${c1.en}. $B$: the second ball is ${c2.en}. Complete the table of the 4 combined outcomes and their probabilities, then verify that $P(A \\cap B) = P(A) \\times P(B)$.`;
      const qMs = `Sebiji bola ditarik daripada sebuah beg berisi ${R} biji bola ${c1.ms} dan ${Bl} biji bola ${c2.ms}, warnanya dicatat, kemudian dikembalikan sebelum bola kedua ditarik. $A$: bola pertama ${c1.ms}. $B$: bola kedua ${c2.ms}. Lengkapkan jadual 4 kesudahan gabungan dan kebarangkaliannya, kemudian sahkan bahawa $P(A \\cap B) = P(A) \\times P(B)$.`;
      return { q: T(qEn, qMs), a: T(`$P(A) \\times P(B) = ${frT(PA)} \\times ${frT(PB)} = ${frT(PAB)}$, which equals $P(A \\cap B)$ counted directly from the table. Verified.`, `$P(A) \\times P(B) = ${frT(PA)} \\times ${frT(PB)} = ${frT(PAB)}$, iaitu sama dengan $P(A \\cap B)$ yang dikira terus daripada jadual. Disahkan.`), sp: 'm' };
    },
    /* estimate P(A), P(B), P(A and B) from a given frequency table, then check the addition rule */
    (r) => {
      const tot = r.pick([40, 50, 60]);
      const onlyA = r.int(6, 12), onlyB = r.int(6, 12), both = r.int(2, 6);
      const ctx = r.pick(SPM.bank.subjects);
      const ctx2 = r.pick(SPM.bank.subjects.filter((x) => x.en !== ctx.en));
      const nA = onlyA + both, nB = onlyB + both, nAB = both, nU = onlyA + onlyB + both;
      const qEn = `Out of ${tot} students surveyed, ${nA} like ${ctx.en} ($A$), ${nB} like ${ctx2.en} ($B$), and ${nAB} like both. Find $P(A)$, $P(B)$, $P(A \\cap B)$ and $P(A \\cup B)$ as fractions of ${tot}, and check that $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.`;
      const qMs = `Daripada ${tot} orang murid yang ditinjau, ${nA} orang gemar ${ctx.ms} ($A$), ${nB} orang gemar ${ctx2.ms} ($B$), dan ${nAB} orang gemar kedua-duanya. Cari $P(A)$, $P(B)$, $P(A \\cap B)$ dan $P(A \\cup B)$ sebagai pecahan daripada ${tot}, dan semak bahawa $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.`;
      return { q: T(qEn, qMs), a: T(`$P(A) = ${P(nA, tot)}$, $P(B) = ${P(nB, tot)}$, $P(A \\cap B) = ${P(nAB, tot)}$, $P(A \\cup B) = ${P(nU, tot)}$; $${nA} + ${nB} - ${nAB} = ${nU}$ students, so the rule checks out.`, `$P(A) = ${P(nA, tot)}$, $P(B) = ${P(nB, tot)}$, $P(A \\cap B) = ${P(nAB, tot)}$, $P(A \\cup B) = ${P(nU, tot)}$; $${nA} + ${nB} - ${nAB} = ${nU}$ orang murid, jadi petua itu disahkan.`), sp: 'm' };
    },
  ];

  const g92m = [
    /* conjecture & verify the general addition rule from an overlapping-group context (bank-driven) */
    (r) => {
      const tot = r.pick([20, 24, 30, 36]);
      const c1 = r.pick(SPM.bank.clubs), c2 = r.pick(SPM.bank.clubs.filter((x) => x.en !== c1.en));
      const onlyA = r.int(3, 8), onlyB = r.int(3, 8), both = r.int(2, 6);
      const nA = onlyA + both, nB = onlyB + both, nU = onlyA + onlyB + both;
      need(nU <= tot);
      const qEn = `In a school of ${tot} students, ${nA} join ${c1.en} ($A$) and ${nB} join ${c2.en} ($B$), and ${both} join both. Find $P(A)$, $P(B)$, $P(A \\cap B)$ and $P(A \\cup B)$. Form a conjecture relating these four values, and verify it using the numbers above.`;
      const qMs = `Di sebuah sekolah seramai ${tot} orang murid, ${nA} orang menyertai ${c1.ms} ($A$) dan ${nB} orang menyertai ${c2.ms} ($B$), dan ${both} orang menyertai kedua-duanya. Cari $P(A)$, $P(B)$, $P(A \\cap B)$ dan $P(A \\cup B)$. Buat satu konjektur yang menghubungkan keempat-empat nilai ini, dan sahkan konjektur itu menggunakan angka di atas.`;
      return { q: T(qEn, qMs), a: T(`$P(A) = ${P(nA, tot)}$, $P(B) = ${P(nB, tot)}$, $P(A \\cap B) = ${P(both, tot)}$, $P(A \\cup B) = ${P(nU, tot)}$. Conjecture: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$. Check: $${n(nA)} + ${n(nB)} - ${n(both)} = ${n(nU)}$ students out of ${tot} ✓.`, `$P(A) = ${P(nA, tot)}$, $P(B) = ${P(nB, tot)}$, $P(A \\cap B) = ${P(both, tot)}$, $P(A \\cup B) = ${P(nU, tot)}$. Konjektur: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$. Semakan: $${n(nA)} + ${n(nB)} - ${n(both)} = ${n(nU)}$ orang murid daripada ${tot} orang ✓.`), sp: 'l' };
    },
    /* containment investigation B subset A */
    (r) => {
      const N = r.pick([12, 18, 20, 24]);
      const kA = r.pick([2, 3]), kB = kA * r.pick([2, 3]);
      const A = range(1, N).filter((v) => v % kA === 0);
      const B = range(1, N).filter((v) => v % kB === 0);
      need(B.every((v) => A.includes(v)) && B.length > 0 && B.length < A.length);
      const qEn = `A number is chosen at random from $1$ to $${N}$. $A$: the number is a multiple of ${kA}. $B$: the number is a multiple of ${kB}. Show that $B \\subseteq A$, then find $A \\cap B$ and $A \\cup B$ (as sets), and verify that $A \\cap B = B$ and $A \\cup B = A$.`;
      const qMs = `Satu nombor dipilih secara rawak dari $1$ hingga $${N}$. $A$: nombor itu gandaan ${kA}. $B$: nombor itu gandaan ${kB}. Tunjukkan bahawa $B \\subseteq A$, kemudian cari $A \\cap B$ dan $A \\cup B$ (sebagai set), dan sahkan bahawa $A \\cap B = B$ dan $A \\cup B = A$.`;
      return { q: T(qEn, qMs), a: T(`$A = \\{${A.join(', ')}\\}$, $B = \\{${B.join(', ')}\\}$; every element of $B$ is in $A$, so $B \\subseteq A$. $A \\cap B = \\{${B.join(', ')}\\} = B$ ✓. $A \\cup B = \\{${A.join(', ')}\\} = A$ ✓.`, `$A = \\{${A.join(', ')}\\}$, $B = \\{${B.join(', ')}\\}$; setiap unsur $B$ ada dalam $A$, jadi $B \\subseteq A$. $A \\cap B = \\{${B.join(', ')}\\} = B$ ✓. $A \\cup B = \\{${A.join(', ')}\\} = A$ ✓.`), sp: 'l' };
    },
    /* Venn diagram explanation of the overlap subtraction */
    (r) => {
      const tot = r.pick([28, 32, 36, 40]);
      const onlyA = r.int(6, 10), onlyB = r.int(6, 10), both = r.int(3, 7);
      const none = tot - onlyA - onlyB - both;
      need(none >= 2);
      const c1 = r.pick(SPM.bank.sports), c2 = r.pick(SPM.bank.sports.filter((x) => x.en !== c1.en));
      const fig = T(
        S.venn({ sets: 2, names: ['A', 'B'], counts: { A: onlyA, B: onlyB, AB: both, '0': none }, xi: 'ξ' }),
        S.venn({ sets: 2, names: ['A', 'B'], counts: { A: onlyA, B: onlyB, AB: both, '0': none }, xi: 'ξ' })
      );
      const nA = onlyA + both, nB = onlyB + both;
      const qEn = `The Venn diagram shows a group of ${tot} students, where $A$: plays ${c1.en}, $B$: plays ${c2.en}. Explain, using the diagram, why $n(A) + n(B)$ overcounts $n(A \\cup B)$, and use this to write down the formula for $P(A \\cup B)$ in terms of $P(A)$, $P(B)$ and $P(A \\cap B)$.`;
      const qMs = `Gambar rajah Venn menunjukkan sekumpulan ${tot} orang murid, dengan $A$: bermain ${c1.ms}, $B$: bermain ${c2.ms}. Terangkan, menggunakan gambar rajah itu, mengapa $n(A) + n(B)$ mengira lebih $n(A \\cup B)$, dan gunakan ini untuk menulis formula bagi $P(A \\cup B)$ dalam sebutan $P(A)$, $P(B)$ dan $P(A \\cap B)$.`;
      const aEn = `$n(A) + n(B) = ${nA} + ${nB} = ${nA + nB}$ counts the ${both} students in the overlap twice (once in each circle), but $n(A \\cup B) = ${nA + nB - both}$ only. Subtracting the overlap once corrects this: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.`;
      const aMs = `$n(A) + n(B) = ${nA} + ${nB} = ${nA + nB}$ mengira ${both} orang murid dalam kawasan bertindih itu dua kali (sekali dalam setiap bulatan), tetapi $n(A \\cup B) = ${nA + nB - both}$ sahaja. Menolak kawasan bertindih itu sekali membetulkan ini: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.`;
      return { q: T(qEn, qMs), fig, a: T(aEn, aMs), sp: 'l' };
    },
    /* decide if the simplified (ME) addition rule may be used for a stated pair, and correct it if not */
    (r) => {
      const c = addRuleCase(r);
      const me = c.inter.length === 0;
      const claimed = Fr.add(c.PA, c.PB);
      const qEn = `In the experiment where ${c.ex.en}, $A$: the result is ${c.p1.en}; $B$: the result is ${c.p2.en}. A student writes $P(A \\cup B) = P(A) + P(B) = ${frT(claimed)}$. Is this correct? If not, give the correct value and explain the error.`;
      const qMs = `Dalam eksperimen di mana ${c.ex.ms}, $A$: keputusan ialah ${c.p1.ms}; $B$: keputusan ialah ${c.p2.ms}. Seorang murid menulis $P(A \\cup B) = P(A) + P(B) = ${frT(claimed)}$. Adakah ini betul? Jika tidak, berikan nilai yang betul dan terangkan kesilapannya.`;
      const aEn = me ? `Correct: $A$ and $B$ are mutually exclusive ($A \\cap B = \\varnothing$), so no overlap needs subtracting.` : `Incorrect: $A$ and $B$ overlap ($A \\cap B \\neq \\varnothing$, $P(A \\cap B) = ${frT(c.PAB)}$), so this double-counts the overlap. The correct value is $P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = ${frT(c.PU)}$.`;
      const aMs = me ? `Betul: $A$ dan $B$ saling eksklusif ($A \\cap B = \\varnothing$), jadi tiada kawasan bertindih perlu ditolak.` : `Salah: $A$ dan $B$ bertindih ($A \\cap B \\neq \\varnothing$, $P(A \\cap B) = ${frT(c.PAB)}$), jadi ini mengira kawasan bertindih dua kali. Nilai yang betul ialah $P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = ${frT(c.PU)}$.`;
      return { q: T(qEn, qMs), a: T(aEn, aMs), sp: 'm' };
    },
    /* verify the product rule for independent events from a two-stage table, with a genuinely dependent contrast */
    (r) => {
      const R = r.int(3, 6), Bl = r.int(3, 6), N = R + Bl;
      const withRep = r.chance();
      const PA = fr(R, N);
      const PB2 = withRep ? fr(R, N) : fr(R - 1, N - 1);
      const PAB = withRep ? fr(R * R, N * N) : fr(R * (R - 1), N * (N - 1));
      const rule = Fr.mul(PA, fr(R, N));
      const holds = Fr.eq(PAB, rule);
      const qEn = `A bag has ${R} red and ${Bl} blue balls. Two balls are drawn one after another, ${withRep ? 'with the first ball put back before the second is drawn' : 'without putting the first ball back'}. Let $A$: the first ball is red; $B$: the second ball is red. Test whether $P(A \\cap B) = P(A) \\times P(B)$ for this case.`;
      const qMs = `Sebuah beg mengandungi ${R} biji bola merah dan ${Bl} biji bola biru. Dua biji bola ditarik satu demi satu, ${withRep ? 'dengan bola pertama dikembalikan sebelum bola kedua ditarik' : 'tanpa mengembalikan bola pertama'}. Biar $A$: bola pertama merah; $B$: bola kedua merah. Uji sama ada $P(A \\cap B) = P(A) \\times P(B)$ bagi kes ini.`;
      const aEn = `$P(A) = ${frT(PA)}$, $P(B) = ${frT(PB2)}$, $P(A \\cap B) = ${frT(PAB)}$, and $P(A) \\times P(B) = ${frT(rule)}$. ${holds ? 'These are equal, so the product rule holds: the draws are independent.' : 'These are not equal, so the product rule fails: the draws are dependent (removing the first ball changes the composition for the second draw).'}`;
      const aMs = `$P(A) = ${frT(PA)}$, $P(B) = ${frT(PB2)}$, $P(A \\cap B) = ${frT(PAB)}$, dan $P(A) \\times P(B) = ${frT(rule)}$. ${holds ? 'Nilai ini sama, jadi petua hasil darab dipenuhi: cabutan itu tak bersandar.' : 'Nilai ini tidak sama, jadi petua hasil darab gagal: cabutan itu bersandar (mengeluarkan bola pertama mengubah komposisi untuk cabutan kedua).'}`;
      return { q: T(qEn, qMs), a: T(aEn, aMs), sp: 'l' };
    },
  ];

  const g92a = [
    /* find and correct an invalid general conjecture ("multiply for every and", "add for every or") */
    (r) => {
      const c = r.pick([
        [
          T('A student conjectures: "To find $P(A \\text{ and } B)$, always multiply $P(A)$ by $P(B)$." Give a counterexample and state the condition under which the conjecture is actually true.', 'Seorang murid membuat konjektur: "Untuk mencari $P(A \\text{ dan } B)$, sentiasa darabkan $P(A)$ dengan $P(B)$." Berikan satu kaunter-contoh dan nyatakan syarat di bawah konjektur itu sebenarnya benar.'),
          T('Counterexample: roll one die, $A = \\{1,2,3,4\\}$, $B = \\{3,4\\}$. $P(A) \\times P(B) = \\dfrac{2}{3} \\times \\dfrac{1}{3} = \\dfrac{2}{9}$, but $P(A \\cap B) = P(\\{3,4\\}) = \\dfrac{1}{3} \\neq \\dfrac{2}{9}$. The conjecture $P(A \\cap B) = P(A) \\times P(B)$ is true only when $A$ and $B$ are independent.', 'Kaunter-contoh: golekkan sebiji dadu, $A = \\{1,2,3,4\\}$, $B = \\{3,4\\}$: $P(A) \\times P(B) = \\dfrac{2}{3} \\times \\dfrac{1}{3} = \\dfrac{2}{9}$, tetapi $P(A \\cap B) = P(\\{3,4\\}) = \\dfrac{1}{3} \\neq \\dfrac{2}{9}$. Konjektur $P(A \\cap B) = P(A) \\times P(B)$ benar hanya apabila $A$ dan $B$ tak bersandar.'),
        ],
        [
          T('A student conjectures: "To find $P(A \\text{ or } B)$, always add $P(A)$ and $P(B)$." Give a counterexample and state the condition under which the conjecture is actually true.', 'Seorang murid membuat konjektur: "Untuk mencari $P(A \\text{ atau } B)$, sentiasa tambahkan $P(A)$ dengan $P(B)$." Berikan satu kaunter-contoh dan nyatakan syarat di bawah konjektur itu sebenarnya benar.'),
          T('Counterexample: roll one die, $A$: even $= \\{2,4,6\\}$, $B$: greater than 3 $= \\{4,5,6\\}$. $P(A) + P(B) = \\dfrac{1}{2} + \\dfrac{1}{2} = 1$, but $P(A \\cup B) = P(\\{2,4,5,6\\}) = \\dfrac{2}{3} \\neq 1$. The conjecture $P(A \\cup B) = P(A) + P(B)$ is true only when $A$ and $B$ are mutually exclusive.', 'Kaunter-contoh: golekkan sebiji dadu, $A$: genap $= \\{2,4,6\\}$, $B$: lebih besar daripada 3 $= \\{4,5,6\\}$. $P(A) + P(B) = \\dfrac{1}{2} + \\dfrac{1}{2} = 1$, tetapi $P(A \\cup B) = P(\\{2,4,5,6\\}) = \\dfrac{2}{3} \\neq 1$. Konjektur $P(A \\cup B) = P(A) + P(B)$ benar hanya apabila $A$ dan $B$ saling eksklusif.'),
        ],
      ]);
      return { q: c[0], a: c[1], sp: 'l' };
    },
    /* compare two sample spaces / assumptions to decide which allows the simplified rule */
    (r) => {
      const c = r.pick([
        [
          T('Scenario 1: two balls are drawn from a bag with replacement. Scenario 2: two balls are drawn from the same bag without replacement. In which scenario does $P(\\text{both red}) = P(\\text{red}) \\times P(\\text{red})$ (using the same, unchanged probability twice)? Explain the assumption that makes this valid.', 'Senario 1: dua biji bola ditarik daripada sebuah beg dengan pengembalian. Senario 2: dua biji bola ditarik daripada beg yang sama tanpa pengembalian. Dalam senario yang manakah $P(\\text{kedua-duanya merah}) = P(\\text{merah}) \\times P(\\text{merah})$ (menggunakan kebarangkalian yang sama, tidak berubah, dua kali)? Terangkan andaian yang menjadikan ini sah.'),
          T('Scenario 1 (with replacement): because the ball is returned before the second draw, the bag has the same composition each time, so the two draws are independent and the unchanged probability can be multiplied twice. In Scenario 2, removing the first ball changes the composition, so the second probability must be recalculated.', 'Senario 1 (dengan pengembalian): kerana bola dikembalikan sebelum cabutan kedua, beg itu mempunyai komposisi yang sama setiap kali, jadi kedua-dua cabutan itu tak bersandar dan kebarangkalian yang tidak berubah boleh didarab dua kali. Dalam Senario 2, mengeluarkan bola pertama mengubah komposisi, jadi kebarangkalian kedua perlu dikira semula.'),
        ],
        [
          T('Sample space $X$: the outcomes of tossing one coin twice, listed as $\\{HH, HT, TH, TT\\}$, each equally likely. Sample space $Y$: the outcomes of tossing one coin twice, listed only as "number of heads" $= \\{0, 1, 2\\}$. Using $A$: at least one head, explain why computing $P(A)$ from $Y$ by simply counting outcomes (assuming each of $0,1,2$ equally likely) gives the wrong answer, while $X$ gives the right one.', 'Ruang sampel $X$: kesudahan melambung sekeping syiling dua kali, disenaraikan sebagai $\\{HH, HT, TH, TT\\}$, setiap satu sama boleh jadi. Ruang sampel $Y$: kesudahan melambung sekeping syiling dua kali, disenaraikan hanya sebagai "bilangan kepala" $= \\{0, 1, 2\\}$. Dengan menggunakan $A$: sekurang-kurangnya satu kepala, terangkan mengapa mengira $P(A)$ daripada $Y$ dengan hanya mengira kesudahan (menganggap setiap satu $0,1,2$ sama boleh jadi) memberikan jawapan yang salah, manakala $X$ memberikan jawapan yang betul.'),
          T('In $X$, all 4 outcomes are equally likely, so $P(A) = \\dfrac{3}{4}$ (all except $TT$). In $Y$, the 3 outcomes are NOT equally likely ($P(0) = \\dfrac{1}{4}$, $P(1) = \\dfrac{1}{2}$, $P(2) = \\dfrac{1}{4}$), so counting outcomes in $Y$ as if equally likely wrongly gives $\\dfrac{2}{3}$. Probability rules based on counting outcomes require an equally likely sample space.', 'Dalam $X$, keempat-empat kesudahan sama boleh jadi, jadi $P(A) = \\dfrac{3}{4}$ (semua kecuali $TT$). Dalam $Y$, ketiga-tiga kesudahan itu TIDAK sama boleh jadi ($P(0) = \\dfrac{1}{4}$, $P(1) = \\dfrac{1}{2}$, $P(2) = \\dfrac{1}{4}$), jadi mengira kesudahan dalam $Y$ seolah-olah sama boleh jadi secara salah memberikan $\\dfrac{2}{3}$. Petua kebarangkalian berdasarkan mengira kesudahan memerlukan ruang sampel yang sama boleh jadi.'),
        ],
      ]);
      return { q: c[0], a: c[1], sp: 'l' };
    },
    /* general argument for the containment case (not just one numeric instance) */
    (r) => ({
      q: T('If $B \\subseteq A$, prove in general (not just with one numeric example) that $A \\cap B = B$ and $A \\cup B = A$, and hence that $P(A \\cup B) = P(A)$.', 'Jika $B \\subseteq A$, buktikan secara am (bukan hanya dengan satu contoh berangka) bahawa $A \\cap B = B$ dan $A \\cup B = A$, dan seterusnya bahawa $P(A \\cup B) = P(A)$.'),
      a: T('Since $B \\subseteq A$, every element of $B$ is already in $A$. So $A \\cap B$ (elements in both) is exactly $B$, and $A \\cup B$ (elements in either) adds nothing beyond $A$, so $A \\cup B = A$. Applying $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ with $A \\cap B = B$ gives $P(A \\cup B) = P(A) + P(B) - P(B) = P(A)$.', 'Oleh kerana $B \\subseteq A$, setiap unsur $B$ sudah ada dalam $A$. Jadi $A \\cap B$ (unsur dalam kedua-duanya) tepat sama dengan $B$, dan $A \\cup B$ (unsur dalam salah satu) tidak menambah apa-apa selain $A$, jadi $A \\cup B = A$. Menggunakan $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ dengan $A \\cap B = B$ memberikan $P(A \\cup B) = P(A) + P(B) - P(B) = P(A)$.'),
      sp: 'l',
    }),
    /* full 5-step conjecture-and-verification investigation, multi-part */
    (r) => {
      const R = r.int(3, 6), Bl = r.int(2, 5), N = R + Bl;
      const c1 = r.pick(COL), c2 = r.pick(COL.filter((x) => x.en !== c1.en));
      const PA = fr(R, N), PB = fr(Bl, N);
      const parts = SPM.parts([
        T(`A bag has ${R} ${c1.en} and ${Bl} ${c2.en} balls. One ball is drawn at random. Define $A$: the ball is ${c1.en}; $B$: the ball is ${c2.en}. List the sample space and state $P(A)$, $P(B)$ and $P(A \\cap B)$.`, `Sebuah beg mengandungi ${R} biji bola ${c1.ms} dan ${Bl} biji bola ${c2.ms}. Sebiji bola ditarik secara rawak. Takrifkan $A$: bola itu ${c1.ms}; $B$: bola itu ${c2.ms}. Senaraikan ruang sampel dan nyatakan $P(A)$, $P(B)$ dan $P(A \\cap B)$.`),
        T('Form a conjecture relating $P(A)$, $P(B)$ and $P(A \\cup B)$.', 'Buat satu konjektur yang menghubungkan $P(A)$, $P(B)$ dan $P(A \\cup B)$.'),
        T('Verify your conjecture numerically, and state the condition on $A$ and $B$ under which it holds.', 'Sahkan konjektur anda secara berangka, dan nyatakan syarat ke atas $A$ dan $B$ di mana ia dipenuhi.'),
      ]);
      const ans = SPM.parts([
        T(`Sample space: one ball drawn from ${N} balls. $P(A) = ${frT(PA)}$, $P(B) = ${frT(PB)}$, $P(A \\cap B) = 0$ (a ball cannot be both colours).`, `Ruang sampel: sebiji bola ditarik daripada ${N} biji bola. $P(A) = ${frT(PA)}$, $P(B) = ${frT(PB)}$, $P(A \\cap B) = 0$ (sebiji bola tidak boleh kedua-dua warna).`),
        T('Conjecture: $P(A \\cup B) = P(A) + P(B)$ (since $A \\cap B = \\varnothing$, nothing is double-counted).', 'Konjektur: $P(A \\cup B) = P(A) + P(B)$ (kerana $A \\cap B = \\varnothing$, tiada apa-apa dikira dua kali).'),
        T(`$P(A) + P(B) = ${frT(PA)} + ${frT(PB)} = ${frT(Fr.add(PA, PB))}$, which equals $P(A \\cup B) = ${frT(fr(N, N))}$ (certain, since every ball is one colour or the other). This holds because $A$ and $B$ are mutually exclusive.`, `$P(A) + P(B) = ${frT(PA)} + ${frT(PB)} = ${frT(Fr.add(PA, PB))}$, iaitu sama dengan $P(A \\cup B) = ${frT(fr(N, N))}$ (pasti, kerana setiap bola adalah satu warna atau yang satu lagi). Ini dipenuhi kerana $A$ dan $B$ saling eksklusif.`),
      ]);
      return { q: parts, a: ans, sp: 'xl' };
    },
  ];

  SPM.extend('F4-9.2', { e: g92e, m: g92m, a: g92a });

  /* =============================================================== F4-9.3 */
  const g93e = [
    /* two independent single-trial experiments: exact combined outcome */
    (r) => {
      const ex1 = r.pick(NEXP), ex2 = r.pick(NEXP.filter((x) => x.en !== ex1.en));
      const k1 = r.int(1, ex1.N), k2 = r.int(1, ex2.N);
      const qEn = `Independently, ${ex1.en} and ${ex2.en}. Find the probability that the first result is ${k1} and the second result is ${k2}.`;
      const qMs = `Secara tak bersandar, ${ex1.ms} dan ${ex2.ms}. Cari kebarangkalian keputusan pertama ialah ${k1} dan keputusan kedua ialah ${k2}.`;
      return { q: T(qEn, qMs), a: T(`$\\dfrac{1}{${ex1.N}} \\times \\dfrac{1}{${ex2.N}} = ${P(1, ex1.N * ex2.N)}$`), sp: 's' };
    },
    /* direct "and" computation on one trial */
    (r) => {
      const ex = r.pick(NEXP);
      const [p1, p2] = twoPreds(r, ex.N);
      const inter = range(1, ex.N).filter((v) => p1.test(v) && p2.test(v));
      const qEn = `In the experiment where ${ex.en}, find $P(\\text{the result is ${p1.en} and ${p2.en}})$.`;
      const qMs = `Dalam eksperimen di mana ${ex.ms}, cari $P(\\text{keputusan ialah ${p1.ms} dan ${p2.ms}})$.`;
      return { q: T(qEn, qMs), a: T(`$${P(inter.length, ex.N)}$`), sp: 's' };
    },
    /* direct "or" computation on one trial */
    (r) => {
      const ex = r.pick(NEXP);
      const [p1, p2] = twoPreds(r, ex.N);
      const uni = range(1, ex.N).filter((v) => p1.test(v) || p2.test(v));
      const qEn = `In the experiment where ${ex.en}, find $P(\\text{the result is ${p1.en} or ${p2.en}})$.`;
      const qMs = `Dalam eksperimen di mana ${ex.ms}, cari $P(\\text{keputusan ialah ${p1.ms} atau ${p2.ms}})$.`;
      return { q: T(qEn, qMs), a: T(`$${P(uni.length, ex.N)}$`), sp: 's' };
    },
    /* complement */
    (r) => {
      const ex = r.pick(NEXP);
      const p1 = retry(() => { const f = r.pick(PRED)(ex.N); need(f); return f; });
      const A = range(1, ex.N).filter((v) => p1.test(v));
      const qEn = `In the experiment where ${ex.en}, $A$ is the event "the result is ${p1.en}". Find $P(A')$, the probability that $A$ does not happen.`;
      const qMs = `Dalam eksperimen di mana ${ex.ms}, $A$ ialah peristiwa "keputusan ialah ${p1.ms}". Cari $P(A')$, kebarangkalian $A$ tidak berlaku.`;
      return { q: T(qEn, qMs), a: T(`$1 - ${P(A.length, ex.N)} = ${P(ex.N - A.length, ex.N)}$`), sp: 's' };
    },
    /* two coins / two dice: exactly one head, or the two dice match */
    (r) => {
      const useDice = r.chance();
      if (useDice) {
        const same = range(1, 6).length;
        const qEn = `Two fair dice are rolled together. Find the probability that the two dice show the same number.`;
        const qMs = `Dua biji dadu adil digolek bersama. Cari kebarangkalian kedua-dua dadu menunjukkan nombor yang sama.`;
        return { q: T(qEn, qMs), a: T(`$${P(6, 36)}$`), sp: 's' };
      }
      const qEn = `Two fair coins are tossed together. Find the probability of getting exactly one head.`;
      const qMs = `Dua keping syiling adil dilambung bersama. Cari kebarangkalian mendapat tepat satu kepala.`;
      return { q: T(qEn, qMs), a: T(`$${P(2, 4)}$`), sp: 's' };
    },
    /* at least one head in two coin tosses, via complement */
    (r) => ({
      q: T('A fair coin is tossed twice. Find the probability of getting at least one head.', 'Sekeping syiling adil dilambung dua kali. Cari kebarangkalian mendapat sekurang-kurangnya satu kepala.'),
      a: T(`$1 - \\dfrac{1}{4} = ${P(3, 4)}$`),
      w: T('$P(\\text{no heads}) = P(TT) = \\dfrac{1}{4}$', '$P(\\text{tiada kepala}) = P(TT) = \\dfrac{1}{4}$'),
      sp: 's',
    }),
  ];

  const g93m = [
    /* two draws without replacement, colour matching */
    (r) => {
      const R = r.int(3, 6), Bl = r.int(3, 6), N = R + Bl;
      const c1 = r.pick(COL), c2 = r.pick(COL.filter((x) => x.en !== c1.en));
      const h = r.pick(HOLD);
      const both1 = fr(R * (R - 1), N * (N - 1));
      const diff = fr(2 * R * Bl, N * (N - 1));
      const qEn = `A ${h.holder.en} has ${R} ${c1.en} and ${Bl} ${c2.en} ${h.en}. Two ${h.en} are drawn one after another without replacement. Find the probability that (a) both are ${c1.en}, (b) one is ${c1.en} and the other is ${c2.en}.`;
      const qMs = `Sebuah ${h.holder.ms} mengandungi ${R} ${h.ms} ${c1.ms} dan ${Bl} ${h.ms} ${c2.ms}. Dua ${h.ms} ditarik satu demi satu tanpa pengembalian. Cari kebarangkalian bahawa (a) kedua-duanya ${c1.ms}, (b) satu ${c1.ms} dan satu lagi ${c2.ms}.`;
      return { q: T(qEn, qMs), a: T(`(a) $\\dfrac{${R}}{${N}} \\times \\dfrac{${R - 1}}{${N - 1}} = ${frT(both1)}$ (b) $${frT(diff)}$`), sp: 'l' };
    },
    /* dependent tree diagram: complete then read off a path / sum of paths */
    (r) => {
      const R = r.int(2, 5), Bl = r.int(2, 5), N = R + Bl;
      const c1 = r.pick(COL), c2 = r.pick(COL.filter((x) => x.en[0] !== c1.en[0]));
      const fig = treeFig({
        counts: [2, 2],
        branch: (depth, path) => {
          if (depth === 0) return [{ lab: c1, p: [R, N] }, { lab: c2, p: [Bl, N] }];
          const firstRed = path[0] === 0;
          const r2 = firstRed ? R - 1 : R, b2 = firstRed ? Bl : Bl - 1, n2 = N - 1;
          return [{ lab: c1, p: [r2, n2] }, { lab: c2, p: [b2, n2] }];
        },
        leaf: (path) => `(${path[0] === 0 ? c1.en[0].toUpperCase() : c2.en[0].toUpperCase()}, ${path[1] === 0 ? c1.en[0].toUpperCase() : c2.en[0].toUpperCase()})`,
      });
      const L1 = c1.en[0].toUpperCase(), L2 = c2.en[0].toUpperCase();
      const pSame = Fr.add(fr(R * (R - 1), N * (N - 1)), fr(Bl * (Bl - 1), N * (N - 1)));
      const qEn = `A bag has ${R} ${c1.en} and ${Bl} ${c2.en} balls. Two balls are drawn one after another without replacement. The tree diagram shows the two draws with their branch probabilities. Use it to find $P(\\text{the two balls have the same colour})$.`;
      const qMs = `Sebuah beg mengandungi ${R} biji bola ${c1.ms} dan ${Bl} biji bola ${c2.ms}. Dua biji bola ditarik satu demi satu tanpa pengembalian. Gambar rajah pokok menunjukkan kedua-dua cabutan itu berserta kebarangkalian cabang. Gunakannya untuk mencari $P(\\text{kedua-dua bola berwarna sama})$.`;
      return { q: T(qEn, qMs), fig, a: T(`$P(${L1}${L1}) + P(${L2}${L2}) = ${frT(pSame)}$`), sp: 'm' };
    },
    /* inclusion-exclusion "or" across two independent stages */
    (r) => {
      const ex = r.pick(NEXP);
      const p1 = retry(() => { const f = r.pick(PRED)(ex.N); need(f); return f; });
      const A = range(1, ex.N).filter((v) => p1.test(v));
      const PA = fr(A.length, ex.N), PB = fr(1, 2);
      const PU = Fr.sub(Fr.add(PA, PB), Fr.mul(PA, PB));
      const qEn = `${cap1(ex.en)}, and separately a fair coin is tossed. Find the probability that the result is ${p1.en}, or the coin shows $H$, or both.`;
      const qMs = `${cap1(ex.ms)}, dan secara berasingan sekeping syiling adil dilambung. Cari kebarangkalian keputusan itu ialah ${p1.ms}, atau syiling menunjukkan $H$, atau kedua-duanya.`;
      return { q: T(qEn, qMs), a: T(`$P(A) + P(H) - P(A)P(H) = ${frT(PA)} + \\dfrac{1}{2} - ${frT(PA)} \\times \\dfrac{1}{2} = ${frT(PU)}$`), sp: 'm' };
    },
    /* at least one target in two independent repeats of the same experiment */
    (r) => {
      const ex = r.pick(NEXP);
      const p1 = retry(() => { const f = r.pick(PRED)(ex.N); need(f); return f; });
      const A = range(1, ex.N).filter((v) => p1.test(v));
      const pNot = fr(ex.N - A.length, ex.N);
      const pAtLeast = Fr.sub(fr(1, 1), Fr.mul(pNot, pNot));
      const qEn = `${cap1(ex.en)} twice, independently. Find the probability that the result is ${p1.en} at least once.`;
      const qMs = `${cap1(ex.ms)} dua kali, secara tak bersandar. Cari kebarangkalian keputusan ialah ${p1.ms} sekurang-kurangnya sekali.`;
      return { q: T(qEn, qMs), a: T(`$1 - ${frT(pNot)} \\times ${frT(pNot)} = ${frT(pAtLeast)}$`), w: T(`$P(\\text{never}) = ${frT(pNot)} \\times ${frT(pNot)}$`), sp: 'm' };
    },
    /* at least one red among two draws without replacement */
    (r) => {
      const R = r.int(2, 5), Bl = r.int(3, 6), N = R + Bl;
      const c1 = r.pick(COL);
      const pNone = fr(Bl * (Bl - 1), N * (N - 1));
      const pAtLeast = Fr.sub(fr(1, 1), pNone);
      const qEn = `A bag has ${R} ${c1.en} balls and ${Bl} balls of other colours. Two balls are drawn one after another without replacement. Find the probability that at least one ${c1.en} ball is drawn.`;
      const qMs = `Sebuah beg mengandungi ${R} biji bola ${c1.ms} dan ${Bl} biji bola warna lain. Dua biji bola ditarik satu demi satu tanpa pengembalian. Cari kebarangkalian sekurang-kurangnya sebiji bola ${c1.ms} ditarik.`;
      return { q: T(qEn, qMs), a: T(`$1 - \\dfrac{${Bl}}{${N}} \\times \\dfrac{${Bl - 1}}{${N - 1}} = ${frT(pAtLeast)}$`), sp: 'm' };
    },
    /* mixed different-experiment sequential compound condition */
    (r) => {
      const ex = r.pick(NEXP);
      const p1 = retry(() => { const f = r.pick(PRED)(ex.N); need(f); return f; });
      const A = range(1, ex.N).filter((v) => p1.test(v));
      const PA = fr(A.length, ex.N);
      const PAB = Fr.mul(PA, fr(1, 2));
      const qEn = `${cap1(ex.en)}, then a fair coin is tossed. Find the probability that the first result is ${p1.en} and the coin shows $T$.`;
      const qMs = `${cap1(ex.ms)}, kemudian sekeping syiling adil dilambung. Cari kebarangkalian keputusan pertama ialah ${p1.ms} dan syiling menunjukkan $T$.`;
      return { q: T(qEn, qMs), a: T(`$${frT(PA)} \\times \\dfrac{1}{2} = ${frT(PAB)}$`), sp: 'm' };
    },
    /* independent daily-probability word problem, at least one of two days */
    (r) => {
      const a = r.int(2, 6);
      const p = fr(1, a + 3);
      const pNot = fr(a + 2, a + 3);
      const pAtLeast = Fr.sub(fr(1, 1), Fr.mul(pNot, pNot));
      const nm = r.name();
      const qEn = `The probability that ${nm} is late for school on any day is $${frT(p)}$, independently each day. Find the probability that ${nm} is late at least once in two school days.`;
      const qMs = `Kebarangkalian ${nm} lewat ke sekolah pada mana-mana hari ialah $${frT(p)}$, secara tak bersandar setiap hari. Cari kebarangkalian ${nm} lewat sekurang-kurangnya sekali dalam dua hari persekolahan.`;
      return { q: T(qEn, qMs), a: T(`$1 - ${frT(pNot)} \\times ${frT(pNot)} = ${frT(pAtLeast)}$`), sp: 'm' };
    },
  ];

  const g93a = [
    /* three draws without replacement, all a specific colour */
    (r) => {
      const R = r.int(4, 7), Bl = r.int(3, 6), N = R + Bl;
      const c1 = r.pick(COL), h = r.pick(HOLD);
      const p = fr(R * (R - 1) * (R - 2), N * (N - 1) * (N - 2));
      const qEn = `A ${h.holder.en} has ${R} ${c1.en} and ${Bl} other-coloured ${h.en}. Three ${h.en} are drawn one after another without replacement. Find the probability that all three are ${c1.en}.`;
      const qMs = `Sebuah ${h.holder.ms} mengandungi ${R} ${h.ms} ${c1.ms} dan ${Bl} ${h.ms} warna lain. Tiga ${h.ms} ditarik satu demi satu tanpa pengembalian. Cari kebarangkalian ketiga-tiganya ${c1.ms}.`;
      return { q: T(qEn, qMs), a: T(`$\\dfrac{${R}}{${N}} \\times \\dfrac{${R - 1}}{${N - 1}} \\times \\dfrac{${R - 2}}{${N - 2}} = ${frT(p)}$`), sp: 'l' };
    },
    /* exactly r successes over 3 independent trials, sum of disjoint paths */
    (r) => {
      const ex = r.pick(NEXP);
      const p1 = retry(() => { const f = r.pick(PRED)(ex.N); need(f); return f; });
      const A = range(1, ex.N).filter((v) => p1.test(v));
      const p = fr(A.length, ex.N), q = fr(ex.N - A.length, ex.N);
      const term = Fr.mul(Fr.mul(p, p), q);
      const ans = Fr.mul(term, fr(3, 1));
      const qEn = `${cap1(ex.en)} three times, independently. Find the probability that the result is ${p1.en} on exactly two of the three trials.`;
      const qMs = `${cap1(ex.ms)} tiga kali, secara tak bersandar. Cari kebarangkalian keputusan ialah ${p1.ms} pada tepat dua daripada tiga percubaan itu.`;
      return { q: T(qEn, qMs), a: T(`There are 3 orderings (success-success-fail, success-fail-success, fail-success-success), each with probability $${frT(p)} \\times ${frT(p)} \\times ${frT(q)} = ${frT(term)}$. Total $= 3 \\times ${frT(term)} = ${frT(ans)}$.`, `Terdapat 3 susunan (berjaya-berjaya-gagal, berjaya-gagal-berjaya, gagal-berjaya-berjaya), setiap satu berkebarangkalian $${frT(p)} \\times ${frT(p)} \\times ${frT(q)} = ${frT(term)}$. Jumlah $= 3 \\times ${frT(term)} = ${frT(ans)}$.`), sp: 'l' };
    },
    /* at least one in three draws without replacement */
    (r) => {
      const R = r.int(2, 4), Bl = r.int(5, 8), N = R + Bl;
      const c1 = r.pick(COL), h = r.pick(HOLD);
      const pNone = fr(Bl * (Bl - 1) * (Bl - 2), N * (N - 1) * (N - 2));
      const pAtLeast = Fr.sub(fr(1, 1), pNone);
      const qEn = `A ${h.holder.en} has ${R} ${c1.en} and ${Bl} other-coloured ${h.en}. Three ${h.en} are drawn one after another without replacement. Find the probability that at least one ${c1.en} ${h.en.slice(0, -1)} is drawn.`;
      const qMs = `Sebuah ${h.holder.ms} mengandungi ${R} ${h.ms} ${c1.ms} dan ${Bl} ${h.ms} warna lain. Tiga ${h.ms} ditarik satu demi satu tanpa pengembalian. Cari kebarangkalian sekurang-kurangnya satu ${h.ms} ${c1.ms} ditarik.`;
      return { q: T(qEn, qMs), a: T(`$1 - \\dfrac{${Bl}}{${N}} \\times \\dfrac{${Bl - 1}}{${N - 1}} \\times \\dfrac{${Bl - 2}}{${N - 2}} = ${frT(pAtLeast)}$`), w: T(`$P(\\text{none}) = ${frT(pNone)}$`), sp: 'l' };
    },
    /* three different experiments in sequence, no pre-drawn representation */
    (r) => {
      const exs = r.sample(NEXP, 2);
      const [ex1, ex2] = exs;
      const p1 = retry(() => { const f = r.pick(PRED)(ex1.N); need(f); return f; });
      const p2 = retry(() => { const f = r.pick(PRED)(ex2.N); need(f); return f; });
      const A1 = range(1, ex1.N).filter((v) => p1.test(v)), A2 = range(1, ex2.N).filter((v) => p2.test(v));
      const PA1 = fr(A1.length, ex1.N), PA2 = fr(A2.length, ex2.N), PH = fr(1, 2);
      const ans = Fr.mul(Fr.mul(PA1, PA2), PH);
      const qEn = `Three independent trials are carried out in order: ${ex1.en}; ${ex2.en}; a fair coin is tossed. Find the probability that the first result is ${p1.en}, the second result is ${p2.en}, and the coin shows $H$.`;
      const qMs = `Tiga percubaan tak bersandar dijalankan mengikut turutan: ${ex1.ms}; ${ex2.ms}; sekeping syiling adil dilambung. Cari kebarangkalian keputusan pertama ialah ${p1.ms}, keputusan kedua ialah ${p2.ms}, dan syiling menunjukkan $H$.`;
      return { q: T(qEn, qMs), a: T(`$${frT(PA1)} \\times ${frT(PA2)} \\times \\dfrac{1}{2} = ${frT(ans)}$`), sp: 'l' };
    },
    /* non-exclusive "or" across two stages, both from the same experiment type without replacement */
    (r) => {
      const R = r.int(3, 6), Bl = r.int(3, 6), N = R + Bl;
      const c1 = r.pick(COL);
      const pFirst = fr(R, N);
      const pSecond = fr(R, N);
      const pBoth = fr(R * (R - 1), N * (N - 1));
      const pOr = Fr.sub(Fr.add(pFirst, pSecond), pBoth);
      const qEn = `A bag has ${R} ${c1.en} balls and ${Bl} balls of other colours. Two balls are drawn one after another without replacement. Find the probability that the first ball is ${c1.en}, or the second ball is ${c1.en}, or both.`;
      const qMs = `Sebuah beg mengandungi ${R} biji bola ${c1.ms} dan ${Bl} biji bola warna lain. Dua biji bola ditarik satu demi satu tanpa pengembalian. Cari kebarangkalian bola pertama ${c1.ms}, atau bola kedua ${c1.ms}, atau kedua-duanya.`;
      return { q: T(qEn, qMs), a: T(`$P(\\text{1st}) + P(\\text{2nd}) - P(\\text{both}) = ${frT(pFirst)} + ${frT(pSecond)} - ${frT(pBoth)} = ${frT(pOr)}$`), sp: 'l' };
    },
    /* cross-check: direct path sum vs complement, for "at least one" */
    (r) => {
      const ex = r.pick(NEXP);
      const p1 = retry(() => { const f = r.pick(PRED)(ex.N); need(f); return f; });
      const A = range(1, ex.N).filter((v) => p1.test(v));
      const p = fr(A.length, ex.N), q = fr(ex.N - A.length, ex.N);
      const direct = Fr.add(Fr.add(Fr.mul(p, q), Fr.mul(q, p)), Fr.mul(p, p));
      const comp = Fr.sub(fr(1, 1), Fr.mul(q, q));
      const qEn = `${cap1(ex.en)} twice, independently. Find $P(\\text{result is ${p1.en} at least once})$ (i) by adding the probabilities of the disjoint paths (exactly once, then exactly twice), and (ii) by using the complement. Show both give the same answer.`;
      const qMs = `${cap1(ex.ms)} dua kali, secara tak bersandar. Cari $P(\\text{keputusan ialah ${p1.ms} sekurang-kurangnya sekali})$ (i) dengan menambah kebarangkalian laluan yang saling eksklusif (tepat sekali, kemudian tepat dua kali), dan (ii) dengan menggunakan pelengkap. Tunjukkan kedua-dua kaedah memberikan jawapan yang sama.`;
      return { q: T(qEn, qMs), a: T(`(i) $${frT(p)}\\times${frT(q)} + ${frT(q)}\\times${frT(p)} + ${frT(p)}\\times${frT(p)} = ${frT(direct)}$ (ii) $1 - ${frT(q)}\\times${frT(q)} = ${frT(comp)}$. Both give $${frT(direct)}$.`, `(i) $${frT(p)}\\times${frT(q)} + ${frT(q)}\\times${frT(p)} + ${frT(p)}\\times${frT(p)} = ${frT(direct)}$ (ii) $1 - ${frT(q)}\\times${frT(q)} = ${frT(comp)}$. Kedua-dua kaedah memberikan $${frT(direct)}$.`), sp: 'l' };
    },
  ];

  SPM.extend('F4-9.3', { e: g93e, m: g93m, a: g93a });

  /* =============================================================== F4-9.4 (scope: enrichment) */
  const RATE_CTX = [
    b('a bulb from this factory is faulty', 'sebiji mentol daripada kilang ini rosak'),
    b('a bus on this route arrives late', 'sebuah bas di laluan ini tiba lewat'),
    b('a day in this month is rainy', 'sehari dalam bulan ini hujan'),
    b('a seed from this batch germinates', 'sebiji benih daripada kumpulan ini bercambah'),
    b('a phone from this batch is defective', 'sebuah telefon daripada kumpulan ini rosak'),
    b('a customer at this shop pays by e-wallet', 'seorang pelanggan di kedai ini membayar dengan e-dompet'),
  ];

  const g94e = [
    /* expected frequency N x p, phrase-bank driven */
    (r) => {
      const c = r.pick(RATE_CTX);
      const pr = r.pick([[1, 5], [1, 4], [1, 10], [3, 20], [1, 8], [2, 25]]);
      const N = r.pick([80, 100, 160, 200, 250, 400]);
      need((N * pr[0]) % pr[1] === 0);
      const qEn = `The probability that ${c.en} is $${P(pr[0], pr[1])}$. Out of ${N} checked, how many are expected to satisfy this?`;
      const qMs = `Kebarangkalian ${c.ms} ialah $${P(pr[0], pr[1])}$. Daripada ${N} yang diperiksa, berapakah bilangan yang dijangka memenuhi keadaan ini?`;
      return { q: T(qEn, qMs), a: T(`$${N} \\times ${P(pr[0], pr[1])} = ${(N * pr[0]) / pr[1]}$`), sp: 's' };
    },
    /* expected frequency of a specific single value, N repeats of a NEXP experiment */
    (r) => {
      const ex = r.pick(NEXP);
      const k = r.int(1, ex.N);
      const N = r.pick([60, 90, 120, 180, 240]);
      need((N % ex.N) === 0);
      const qEn = `${cap1(ex.en)} ${N} times. How many times is the result expected to be ${k}?`;
      const qMs = `${cap1(ex.ms)} sebanyak ${N} kali. Berapakah bilangan kali keputusan ${k} dijangka muncul?`;
      return { q: T(qEn, qMs), a: T(`$${N} \\times \\dfrac{1}{${ex.N}} = ${N / ex.N}$`), sp: 's' };
    },
    /* expected frequency via complement (failures) */
    (r) => {
      const c = r.pick(RATE_CTX);
      const pr = r.pick([[1, 5], [1, 4], [1, 10], [3, 20], [1, 8]]);
      const N = r.pick([100, 160, 200, 240, 320]);
      const failFr = fr(pr[1] - pr[0], pr[1]);
      need((N * (pr[1] - pr[0])) % pr[1] === 0);
      const qEn = `The probability that ${c.en} is $${P(pr[0], pr[1])}$. Out of ${N} checked, how many are expected to NOT satisfy this?`;
      const qMs = `Kebarangkalian ${c.ms} ialah $${P(pr[0], pr[1])}$. Daripada ${N} yang diperiksa, berapakah bilangan yang dijangka TIDAK memenuhi keadaan ini?`;
      return { q: T(qEn, qMs), a: T(`$${N} \\times ${frT(failFr)} = ${(N * (pr[1] - pr[0])) / pr[1]}$`), w: T(`$1 - ${P(pr[0], pr[1])} = ${frT(failFr)}$`), sp: 's' };
    },
    /* expected frequency of a predicate-defined event, NEXP + PRED bank */
    (r) => {
      const ex = r.pick(NEXP);
      const p1 = retry(() => { const f = r.pick(PRED)(ex.N); need(f); return f; });
      const A = range(1, ex.N).filter((v) => p1.test(v));
      const N = r.pick([60, 90, 120, 180, 240]);
      need((N * A.length) % ex.N === 0);
      const qEn = `${cap1(ex.en)} ${N} times. How many times is the result expected to be ${p1.en}?`;
      const qMs = `${cap1(ex.ms)} sebanyak ${N} kali. Berapakah bilangan kali keputusan ${p1.ms} dijangka muncul?`;
      return { q: T(qEn, qMs), a: T(`$${N} \\times ${P(A.length, ex.N)} = ${(N * A.length) / ex.N}$`), sp: 's' };
    },
    /* expected frequency of an independent combined event, N repeats */
    (r) => {
      const N = r.pick([72, 96, 144, 180]);
      need(N % 12 === 0);
      const qEn = `A fair coin is tossed and a fair die is rolled together, ${N} times. How many times is "the coin shows $H$ and the die shows 6" expected to occur?`;
      const qMs = `Sekeping syiling adil dilambung dan sebiji dadu adil digolek bersama, sebanyak ${N} kali. Berapakah bilangan kali "syiling menunjukkan $H$ dan dadu menunjukkan 6" dijangka berlaku?`;
      return { q: T(qEn, qMs), a: T(`$${N} \\times \\dfrac{1}{2} \\times \\dfrac{1}{6} = ${N / 12}$`), sp: 'm' };
    },
  ];

  const g94m = [
    /* reverse: two draws without replacement, both a colour, find unknown count (nonlinear) */
    (r) => {
      const c = addChapterReverse2(r);
      const qEn = `A ${c.h.holder.en} has some ${c.col.en} ${c.h.en} and ${c.n_} other-coloured ${c.h.en}. Two ${c.h.en} are drawn one after another without replacement. The probability that both are ${c.col.en} is $${frT(c.target)}$. Find the number of ${c.col.en} ${c.h.en} in the ${c.h.holder.en}.`;
      const qMs = `Sebuah ${c.h.holder.ms} mengandungi beberapa ${c.h.ms} ${c.col.ms} dan ${c.n_} ${c.h.ms} warna lain. Dua ${c.h.ms} ditarik satu demi satu tanpa pengembalian. Kebarangkalian kedua-duanya ${c.col.ms} ialah $${frT(c.target)}$. Cari bilangan ${c.h.ms} ${c.col.ms} dalam ${c.h.holder.ms} itu.`;
      return { q: T(qEn, qMs), a: T(`$${c.x}$`), w: T(`Let there be $x$ ${c.col.en} ${c.h.en}: $\\dfrac{x(x-1)}{(x+${c.n_})(x+${c.n_}-1)} = ${frT(c.target)}$. By systematic trial, $x = ${c.x}$: $\\dfrac{${c.x} \\times ${c.x - 1}}{${c.x + c.n_} \\times ${c.x + c.n_ - 1}} = ${frT(c.target)}$ ✓ (checked to be the only whole-number solution up to 20).`, `Biar terdapat $x$ ${c.h.ms} ${c.col.ms}: $\\dfrac{x(x-1)}{(x+${c.n_})(x+${c.n_}-1)} = ${frT(c.target)}$. Dengan cuba jaya sistematik, $x = ${c.x}$: $\\dfrac{${c.x} \\times ${c.x - 1}}{${c.x + c.n_} \\times ${c.x + c.n_ - 1}} = ${frT(c.target)}$ ✓ (disemak sebagai satu-satunya penyelesaian nombor bulat sehingga 20).`), sp: 'l' };
    },
    /* expectation vs guaranteed observed count (concept) */
    (r) => {
      const c = r.pick(RATE_CTX);
      const pr = r.pick([[1, 5], [1, 4], [3, 20]]);
      const N = r.pick([50, 80, 150]);
      const exp = (N * pr[0]) / pr[1];
      need(Number.isInteger(exp));
      const observed = exp + r.pick([-2, -1, 1, 2].filter((d) => exp + d >= 0 && exp + d <= N));
      const qEn = `The probability that ${c.en} is $${P(pr[0], pr[1])}$. Out of ${N} checked, the expected number is ${exp}, but the actual count observed was ${observed}. Is this a contradiction? Explain.`;
      const qMs = `Kebarangkalian ${c.ms} ialah $${P(pr[0], pr[1])}$. Daripada ${N} yang diperiksa, bilangan yang dijangka ialah ${exp}, tetapi bilangan sebenar yang diperhatikan ialah ${observed}. Adakah ini satu percanggahan? Terangkan.`;
      return { q: T(qEn, qMs), a: T(`No: the expected value is an average over many repeated batches of ${N}, not a guarantee for one particular batch. A single actual count can reasonably differ from the expected value.`, `Tidak: nilai jangkaan ialah purata ke atas banyak kumpulan berulang seramai ${N}, bukan satu jaminan bagi satu kumpulan tertentu. Satu bilangan sebenar secara munasabah boleh berbeza daripada nilai jangkaan.`), sp: 'm' };
    },
    /* expected frequency of a mutually exclusive "or" event, N repeats */
    (r) => {
      const ex = r.pick(NEXP);
      const [p1, p2] = twoPreds(r, ex.N);
      const A = range(1, ex.N).filter((v) => p1.test(v));
      const B = range(1, ex.N).filter((v) => p2.test(v));
      need(A.filter((v) => B.includes(v)).length === 0);
      const uni = A.length + B.length;
      const N = r.pick([60, 90, 120, 180, 240]);
      need((N * uni) % ex.N === 0);
      const qEn = `${cap1(ex.en)} ${N} times. $A$: the result is ${p1.en}; $B$: the result is ${p2.en} ($A$ and $B$ are mutually exclusive). How many times is $A$ or $B$ expected to occur?`;
      const qMs = `${cap1(ex.ms)} sebanyak ${N} kali. $A$: keputusan ialah ${p1.ms}; $B$: keputusan ialah ${p2.ms} ($A$ dan $B$ saling eksklusif). Berapakah bilangan kali $A$ atau $B$ dijangka berlaku?`;
      return { q: T(qEn, qMs), a: T(`$${N} \\times \\left(${P(A.length, ex.N)} + ${P(B.length, ex.N)}\\right) = ${(N * uni) / ex.N}$`), sp: 'm' };
    },
    /* reverse from "at least one in two trials" (nonlinear in x, per-trial probability 1/x) */
    (r) => {
      const x = r.pick([3, 4, 5, 6, 7, 8]);
      const num = 2 * x - 1, den = x * x;
      const target = fr(num, den);
      const qEn = `A spinner has $x$ equal sectors, only one of which is red. The spinner is spun twice, independently. The probability of getting red at least once is $${frT(target)}$. Find $x$.`;
      const qMs = `Sebuah pemutar mempunyai $x$ sektor sama, hanya satu daripadanya berwarna merah. Pemutar itu diputar dua kali, secara tak bersandar. Kebarangkalian mendapat merah sekurang-kurangnya sekali ialah $${frT(target)}$. Cari $x$.`;
      return { q: T(qEn, qMs), a: T(`$${x}$`), w: T(`$1 - \\left(\\dfrac{x-1}{x}\\right)^2 = ${frT(target)}$. By systematic trial, $x = ${x}$: $1 - \\left(\\dfrac{${x - 1}}{${x}}\\right)^2 = ${frT(target)}$ ✓.`, `$1 - \\left(\\dfrac{x-1}{x}\\right)^2 = ${frT(target)}$. Dengan cuba jaya sistematik, $x = ${x}$: $1 - \\left(\\dfrac{${x - 1}}{${x}}\\right)^2 = ${frT(target)}$ ✓.`), sp: 'l' };
    },
    /* multi-part: compute p from a combined event, then expected frequency */
    (r) => {
      const ex = r.pick(NEXP);
      const p1 = retry(() => { const f = r.pick(PRED)(ex.N); need(f); return f; });
      const A = range(1, ex.N).filter((v) => p1.test(v));
      const PA = fr(A.length, ex.N), PH = fr(1, 2);
      const PAB = Fr.mul(PA, PH);
      const N = r.pick([120, 180, 240, 360]);
      need((N * A.length) % (ex.N * 2) === 0);
      const parts = SPM.parts([
        T(`${cap1(ex.en)}, and separately a fair coin is tossed. Find $P(\\text{the result is ${p1.en} and the coin shows } H)$.`, `${cap1(ex.ms)}, dan secara berasingan sekeping syiling adil dilambung. Cari $P(\\text{keputusan ialah ${p1.ms} dan syiling menunjukkan } H)$.`),
        T(`Both experiments are repeated together ${N} times. How many times is this combined outcome expected to occur?`, `Kedua-dua eksperimen ini diulang bersama sebanyak ${N} kali. Berapakah bilangan kali kesudahan gabungan ini dijangka berlaku?`),
      ]);
      const ans = SPM.parts([
        T(`$${frT(PA)} \\times \\dfrac{1}{2} = ${frT(PAB)}$`),
        T(`$${N} \\times ${frT(PAB)} = ${(N * A.length) / (ex.N * 2)}$`),
      ]);
      return { q: parts, a: ans, sp: 'l' };
    },
  ];

  const g94a = [
    /* reverse: three draws without replacement, all a colour, find unknown count (cubic, nonlinear) */
    (r) => {
      const c = addChapterReverse3(r);
      const qEn = `A ${c.h.holder.en} has some ${c.col.en} ${c.h.en} and ${c.n_} other-coloured ${c.h.en}. Three ${c.h.en} are drawn one after another without replacement. The probability that all three are ${c.col.en} is $${frT(c.target)}$. Find the number of ${c.col.en} ${c.h.en} in the ${c.h.holder.en}.`;
      const qMs = `Sebuah ${c.h.holder.ms} mengandungi beberapa ${c.h.ms} ${c.col.ms} dan ${c.n_} ${c.h.ms} warna lain. Tiga ${c.h.ms} ditarik satu demi satu tanpa pengembalian. Kebarangkalian ketiga-tiganya ${c.col.ms} ialah $${frT(c.target)}$. Cari bilangan ${c.h.ms} ${c.col.ms} dalam ${c.h.holder.ms} itu.`;
      return { q: T(qEn, qMs), a: T(`$${c.x}$`), w: T(`Let there be $x$ ${c.col.en} ${c.h.en}: $\\dfrac{x(x-1)(x-2)}{(x+${c.n_})(x+${c.n_}-1)(x+${c.n_}-2)} = ${frT(c.target)}$. By systematic trial, $x = ${c.x}$ is the only whole-number solution (checked up to 15) that fits.`, `Biar terdapat $x$ ${c.h.ms} ${c.col.ms}: $\\dfrac{x(x-1)(x-2)}{(x+${c.n_})(x+${c.n_}-1)(x+${c.n_}-2)} = ${frT(c.target)}$. Dengan cuba jaya sistematik, $x = ${c.x}$ ialah satu-satunya penyelesaian nombor bulat (disemak sehingga 15) yang sepadan.`), sp: 'l' };
    },
    /* reverse: at least one in three independent trials (nonlinear) */
    (r) => {
      const x = r.pick([3, 4, 5, 6, 7]);
      const q = fr(x - 1, x);
      const target = Fr.sub(fr(1, 1), Fr.mul(Fr.mul(q, q), q));
      const qEn = `A box has $x$ identically shaped tickets, only one of which wins a prize. A ticket is drawn, its result noted, and it is put back, ${'3'} times independently. The probability of winning at least once is $${frT(target)}$. Find $x$.`;
      const qMs = `Sebuah kotak mengandungi $x$ keping tiket berbentuk serupa, hanya satu daripadanya memenangi hadiah. Sekeping tiket ditarik, keputusannya dicatat, dan dikembalikan, sebanyak 3 kali secara tak bersandar. Kebarangkalian memenangi sekurang-kurangnya sekali ialah $${frT(target)}$. Cari $x$.`;
      return { q: T(qEn, qMs), a: T(`$${x}$`), w: T(`$1 - \\left(\\dfrac{x-1}{x}\\right)^3 = ${frT(target)}$. By systematic trial, $x = ${x}$ ✓.`, `$1 - \\left(\\dfrac{x-1}{x}\\right)^3 = ${frT(target)}$. Dengan cuba jaya sistematik, $x = ${x}$ ✓.`), sp: 'l' };
    },
    /* verify-by-substitution + explain why systematic trial (not direct algebra) is used */
    (r) => {
      const c = addChapterReverse2(r);
      const wrong = c.x + r.pick([-1, 1]);
      const qEn = `A ${c.h.holder.en} has some ${c.col.en} ${c.h.en} and ${c.n_} other-coloured ${c.h.en}. Two ${c.h.en} are drawn without replacement, and $P(\\text{both ${c.col.en}}) = ${frT(c.target)}$. A student claims the number of ${c.col.en} ${c.h.en} is ${wrong}. Check this claim by substitution, find the correct number, and explain why systematic trial (rather than direct algebraic rearrangement) is a reasonable approach here.`;
      const qMs = `Sebuah ${c.h.holder.ms} mengandungi beberapa ${c.h.ms} ${c.col.ms} dan ${c.n_} ${c.h.ms} warna lain. Dua ${c.h.ms} ditarik tanpa pengembalian, dan $P(\\text{kedua-dua ${c.col.ms}}) = ${frT(c.target)}$. Seorang murid mendakwa bilangan ${c.h.ms} ${c.col.ms} ialah ${wrong}. Semak dakwaan ini dengan penggantian, cari bilangan yang betul, dan terangkan mengapa cuba jaya sistematik (bukan penyusunan semula algebra terus) adalah pendekatan yang munasabah di sini.`;
      const wrongP = fr(wrong * (wrong - 1), (wrong + c.n_) * (wrong + c.n_ - 1));
      return { q: T(qEn, qMs), a: T(`Substituting $x = ${wrong}$ gives $${frT(wrongP)} \\neq ${frT(c.target)}$, so the claim is wrong. The correct number is $x = ${c.x}$ (verified above). The equation is quadratic in $x$, so systematic trial over small whole numbers is simpler than solving the quadratic algebraically, and the context (a count of items) restricts $x$ to positive integers anyway.`, `Menggantikan $x = ${wrong}$ memberikan $${frT(wrongP)} \\neq ${frT(c.target)}$, jadi dakwaan itu salah. Bilangan yang betul ialah $x = ${c.x}$ (disahkan di atas). Persamaan itu kuadratik dalam $x$, jadi cuba jaya sistematik ke atas nombor bulat kecil adalah lebih mudah daripada menyelesaikan persamaan kuadratik secara algebra, dan konteksnya (bilangan item) mengehadkan $x$ kepada integer positif.`), sp: 'l' };
    },
  ];

  /** helper for the two-draw reverse family: pick a small integer x first, then present the resulting fraction */
  function addChapterReverse2(r) {
    return retry(() => {
      const n_ = r.int(2, 6);
      const x = r.int(3, 8);
      const target = fr(x * (x - 1), (x + n_) * (x + n_ - 1));
      let count = 0;
      for (let xp = 2; xp <= 20; xp++) if (Fr.eq(fr(xp * (xp - 1), (xp + n_) * (xp + n_ - 1)), target)) count++;
      need(count === 1);
      const col = r.pick(COL), h = r.pick(HOLD);
      return { n_, x, target, col, h };
    });
  }
  /** helper for the three-draw reverse family */
  function addChapterReverse3(r) {
    return retry(() => {
      const n_ = r.int(2, 5);
      const x = r.int(4, 7);
      const target = fr(x * (x - 1) * (x - 2), (x + n_) * (x + n_ - 1) * (x + n_ - 2));
      let count = 0;
      for (let xp = 3; xp <= 15; xp++) if (Fr.eq(fr(xp * (xp - 1) * (xp - 2), (xp + n_) * (xp + n_ - 1) * (xp + n_ - 2)), target)) count++;
      need(count === 1);
      const col = r.pick(COL), h = r.pick(HOLD);
      return { n_, x, target, col, h };
    });
  }

  SPM.extend('F4-9.4', { e: g94e, m: g94m, a: g94a });
})();
