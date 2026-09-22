/* Variety pack x5d: Form 5 Chapter 8 "Mathematical Modelling" (F5-8.1 .. F5-8.6). */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, round, fx, Fr, poly, lin, rm } = SPM;
  const S = SPM.svg, F = SPM.figs;
  const T = SPM.L;

  /** substitute {key} placeholders in a bilingual phrasing-bank pick; vars values may be plain or {en,ms} */
  const pf = (r, forms, vars) => {
    const f = r.pick(forms);
    const val = (k, lang) => { const v = vars[k]; return v && typeof v === 'object' ? v[lang] : v; };
    const sub = (s, lang) => s.replace(/\{(\w+)\}/g, (_, k) => val(k, lang));
    return T(sub(f.en, 'en'), sub(f.ms, 'ms'));
  };
  const LET = 'ABCDEFGH';

  /* =============================================================== shared banks */
  /** the 6 stages of the modelling cycle, used consistently across the whole pack */
  const CYCLE = [
    T('Identify and define the problem', 'Kenal pasti dan takrifkan masalah'),
    T('Make assumptions and identify variables', 'Buat andaian dan kenal pasti pemboleh ubah'),
    T('Formulate the mathematical model', 'Rumuskan model matematik'),
    T('Solve the model', 'Selesaikan model'),
    T('Interpret and validate the solution', 'Tafsir dan sahkan penyelesaian'),
    T('Report the findings', 'Laporkan dapatan'),
  ];
  /** paraphrases of the same 6 stages, worded differently from CYCLE (for "which stage is this?" items) */
  const STAGE_DESC = [
    T('Writing down clearly what real situation needs to be investigated', 'Menulis dengan jelas situasi sebenar yang perlu disiasat'),
    T('Deciding what will be taken as fixed or true, and naming the quantities that will change', 'Menentukan apa yang dianggap tetap atau benar, dan menamakan kuantiti yang akan berubah'),
    T('Writing an equation or rule that links the variables together', 'Menulis persamaan atau peraturan yang menghubungkan pemboleh ubah'),
    T('Using algebra or arithmetic to work out a numerical answer from the equation', 'Menggunakan algebra atau aritmetik untuk mendapatkan jawapan berangka daripada persamaan'),
    T('Checking whether the numerical answer makes sense in the real situation and comparing it with actual data', 'Menyemak sama ada jawapan berangka itu munasabah dalam situasi sebenar dan membandingkannya dengan data sebenar'),
    T('Writing up the problem, working and conclusion so that others can follow it', 'Menulis masalah, kerja dan kesimpulan supaya orang lain dapat memahaminya'),
  ];
  /** one-line reason a family is a poor fit for very long-range prediction, keyed by family */
  const LIMIT_REASON = {
    linear: T('a constant rate may not continue forever (costs, capacity or other real limits usually change it)', 'kadar malar mungkin tidak berterusan selama-lamanya (kos, kapasiti atau had sebenar lain biasanya mengubahnya)'),
    quadratic: T('the model is normally only meaningful over a limited interval (for example while the object is still in the air, or the width is still positive)', 'model itu biasanya hanya bermakna dalam selang terhad (contohnya semasa objek masih di udara, atau lebar masih positif)'),
    exponential: T('unlimited percentage growth (or decay) is unrealistic over the long run; real limits such as resources, space or competition usually slow it down', 'pertumbuhan (atau penyusutan) peratusan tanpa had tidak realistik dalam jangka panjang; had sebenar seperti sumber, ruang atau persaingan biasanya melambatkannya'),
  };
  const FAM_NAME = { linear: T('linear', 'linear'), quadratic: T('quadratic', 'kuadratik'), exponential: T('exponential', 'eksponen') };
  const FAM_EQ = { linear: 'y = mx + c', quadratic: 'y = ax^2 + bx + c', exponential: 'y = ab^x' };
  const FAM_ART = { linear: 'A', quadratic: 'A', exponential: 'An' };
  const famArt = (fam) => FAM_ART[fam].toLowerCase();
  /** how you would recognise each family from equally-spaced data */
  const FAM_TEST = {
    linear: T('the first differences (values in equal steps) are constant', 'perbezaan pertama (nilai dalam langkah sama) adalah malar'),
    quadratic: T('the first differences are not constant but the second differences are constant', 'perbezaan pertama tidak malar tetapi perbezaan kedua adalah malar'),
    exponential: T('the ratios of consecutive values (equal steps) are constant', 'nisbah nilai berturutan (langkah sama) adalah malar'),
  };

  /** context bank: 14 real situations, each usable for stage/variable/assumption/family-choice items across 8.1/8.5 */
  const SCEN = [
    { d: T('the total fare of a taxi ride as the distance travelled increases', 'jumlah tambang teksi apabila jarak perjalanan bertambah'), v: T('the total fare', 'jumlah tambang'), x: T('the distance travelled', 'jarak yang dilalui'), as: T('the rate charged per kilometre stays the same throughout the ride', 'kadar yang dikenakan bagi setiap kilometer kekal sama sepanjang perjalanan'), fam: 'linear', dir: 1 },
    { d: T('the number of bacteria in a culture as time passes', 'bilangan bakteria dalam suatu kultur apabila masa berlalu'), v: T('the number of bacteria', 'bilangan bakteria'), x: T('the time elapsed', 'masa yang berlalu'), as: T('the population increases by the same percentage in each equal time interval', 'populasi bertambah dengan peratusan yang sama dalam setiap selang masa yang sama'), fam: 'exponential', dir: 1 },
    { d: T('the height of a ball above the ground after it is thrown upwards', 'ketinggian sebiji bola di atas tanah selepas dilontar ke atas'), v: T('the height of the ball', 'ketinggian bola'), x: T('the time after it is thrown', 'masa selepas ia dilontar'), as: T('air resistance can be ignored', 'rintangan udara boleh diabaikan'), fam: 'quadratic', dir: 0 },
    { d: T('the value of a delivery motorcycle as it gets older', 'nilai sebuah motosikal penghantaran apabila ia semakin lama'), v: T('the value of the motorcycle', 'nilai motosikal'), x: T('its age in years', 'usianya dalam tahun'), as: T('the value decreases by the same percentage each year', 'nilainya berkurang dengan peratusan yang sama setiap tahun'), fam: 'exponential', dir: -1 },
    { d: T('the monthly bill of a mobile data plan as the data used increases', 'bil bulanan pelan data mudah alih apabila data yang digunakan bertambah'), v: T('the monthly bill', 'bil bulanan'), x: T('the amount of data used', 'jumlah data yang digunakan'), as: T('the price per gigabyte does not change during the month', 'harga bagi setiap gigabait tidak berubah sepanjang bulan'), fam: 'linear', dir: 1 },
    { d: T("a company's profit as the number of units sold changes", 'keuntungan sebuah syarikat apabila bilangan unit yang dijual berubah'), v: T('the profit', 'keuntungan'), x: T('the number of units sold', 'bilangan unit yang dijual'), as: T('the selling price and the cost per unit stay fixed', 'harga jualan dan kos bagi setiap unit kekal tetap'), fam: 'quadratic', dir: 0 },
    { d: T('the number of views of a video as the days since upload increase', 'bilangan tontonan sebuah video apabila bilangan hari sejak dimuat naik bertambah'), v: T('the number of views', 'bilangan tontonan'), x: T('the number of days since upload', 'bilangan hari sejak dimuat naik'), as: T('the video is shared to the same percentage of new viewers each day', 'video dikongsi kepada peratusan penonton baharu yang sama setiap hari'), fam: 'exponential', dir: 1 },
    { d: T('the total cost of hiring a caterer as the number of guests increases', 'jumlah kos menyewa jurumasak apabila bilangan tetamu bertambah'), v: T('the total cost', 'jumlah kos'), x: T('the number of guests', 'bilangan tetamu'), as: T('the cost per guest is the same for every guest', 'kos bagi setiap tetamu adalah sama bagi setiap tetamu'), fam: 'linear', dir: 1 },
    { d: T('the area enclosed by a rectangular pen of fixed perimeter as its width changes', 'luas yang dilingkungi oleh kandang segi empat tepat berperimeter tetap apabila lebarnya berubah'), v: T('the area of the pen', 'luas kandang'), x: T('the width of the pen', 'lebar kandang'), as: T('the total length of fencing used stays fixed', 'jumlah panjang pagar yang digunakan kekal tetap'), fam: 'quadratic', dir: 0 },
    { d: T('the amount of medicine left in a patient’s bloodstream as time passes', 'jumlah ubat yang tinggal dalam aliran darah pesakit apabila masa berlalu'), v: T('the amount of medicine remaining', 'jumlah ubat yang tinggal'), x: T('the time since the dose was taken', 'masa sejak dos diambil'), as: T('the same percentage of the medicine is removed from the body in each hour', 'peratusan ubat yang sama disingkirkan daripada badan pada setiap jam'), fam: 'exponential', dir: -1 },
    { d: T('the depth of water in a tank as it is filled by a hose', 'kedalaman air dalam sebuah tangki apabila diisi oleh hos'), v: T('the depth of water', 'kedalaman air'), x: T('the time since filling started', 'masa sejak pengisian bermula'), as: T('the hose fills the tank at a constant rate', 'hos mengisi tangki pada kadar malar'), fam: 'linear', dir: 1 },
    { d: T('the number of members of a badminton club as it gains popularity', 'bilangan ahli kelab badminton apabila ia semakin popular'), v: T('the number of members', 'bilangan ahli'), x: T('the number of months since the club started', 'bilangan bulan sejak kelab bermula'), as: T('membership grows by the same percentage each month', 'keahlian bertambah dengan peratusan yang sama setiap bulan'), fam: 'exponential', dir: 1 },
    { d: T('the area available for chickens in a rectangular pen against the pen’s length, given a fixed total length of fencing', 'luas yang tersedia untuk ayam dalam kandang segi empat tepat berbanding panjang kandang, dengan jumlah panjang pagar yang tetap'), v: T('the area available for the chickens', 'luas yang tersedia untuk ayam'), x: T('the length of the pen', 'panjang kandang'), as: T('one chicken needs a fixed area to live comfortably', 'seekor ayam memerlukan luas tetap untuk hidup selesa'), fam: 'quadratic', dir: 0 },
    { d: T('a savings account balance as it earns compound interest', 'baki akaun simpanan apabila ia memperoleh faedah kompaun'), v: T('the account balance', 'baki akaun'), x: T('the number of years the money is saved', 'bilangan tahun wang itu disimpan'), as: T('the interest rate does not change from year to year', 'kadar faedah tidak berubah dari tahun ke tahun'), fam: 'exponential', dir: 1 },
  ];

  /* =============================================================== 8.1 The mathematical modelling cycle */
  const g81e = [
    // fill-in-the-blank: name the stage from a paraphrase
    (r) => {
      const i = r.int(0, 5);
      return { q: T(`Which stage of the mathematical modelling cycle involves the following: "${STAGE_DESC[i].en}"?`, `Peringkat manakah dalam kitaran pemodelan matematik yang melibatkan perkara berikut: "${STAGE_DESC[i].ms}"?`), a: CYCLE[i], sp: 's' };
    },
    // MCQ version of the same task
    (r) => {
      const i = r.int(0, 5);
      const others = r.sample([0, 1, 2, 3, 4, 5].filter((k) => k !== i), 3);
      const opts = r.shuffle([i, ...others]);
      const c = LET[opts.indexOf(i)];
      const line = (lang) => opts.map((o, k) => `${LET[k]}) ${CYCLE[o][lang]}`).join('<br>');
      return { q: T(`Which stage of the mathematical modelling cycle involves the following: "${STAGE_DESC[i].en}"?<br>${line('en')}`, `Peringkat manakah dalam kitaran pemodelan matematik yang melibatkan perkara berikut: "${STAGE_DESC[i].ms}"?<br>${line('ms')}`), a: T(`${c}) ${CYCLE[i].en}`, `${c}) ${CYCLE[i].ms}`), sp: 'xs' };
    },
    // which of two stages happens first
    (r) => {
      const [i, j] = r.distinct(2, 0, 5);
      const [p, q] = r.chance() ? [i, j] : [j, i];
      const first = Math.min(i, j);
      return { q: T(`In the mathematical modelling cycle, which happens first: "${STAGE_DESC[p].en}", or "${STAGE_DESC[q].en}"?`, `Dalam kitaran pemodelan matematik, yang manakah berlaku dahulu: "${STAGE_DESC[p].ms}", atau "${STAGE_DESC[q].ms}"?`), a: CYCLE[first], sp: 'xs' };
    },
    // define assumption vs variable
    (r) => {
      const forms = [
        { en: 'In the mathematical modelling cycle, give a one-line definition of an assumption, and a one-line definition of a variable.', ms: 'Dalam kitaran pemodelan matematik, beri satu takrifan ringkas bagi andaian, dan satu takrifan ringkas bagi pemboleh ubah.' },
        { en: 'State, in one line each, what "assumption" and "variable" mean when building a mathematical model.', ms: 'Nyatakan, dalam satu ayat setiap satu, maksud "andaian" dan "pemboleh ubah" semasa membina model matematik.' },
      ];
      const f = r.pick(forms);
      return { q: T(f.en, f.ms), a: T('An assumption is a statement taken as fixed/true to simplify the model; a variable is a quantity that is allowed to change and is represented by a symbol.', 'Andaian ialah pernyataan yang dianggap tetap/benar untuk memudahkan model; pemboleh ubah ialah kuantiti yang boleh berubah dan diwakili oleh suatu simbol.'), sp: 's' };
    },
    // identify the variable and what it depends on, from a scenario
    (r) => {
      const s = r.pick(SCEN);
      return { q: T(`In modelling ${s.d.en}, name the variable that changes, and state what it depends on.`, `Dalam pemodelan ${s.d.ms}, namakan pemboleh ubah yang berubah, dan nyatakan bergantung kepada apa.`), a: T(`${SPM.cap(s.v.en)} depends on ${s.x.en}.`, `${SPM.cap(s.v.ms)} bergantung kepada ${s.x.ms}.`), sp: 's' };
    },
    // name the missing stage from a list of 5 (in correct order, one gap)
    (r) => {
      const miss = r.int(0, 5);
      const shown = [0, 1, 2, 3, 4, 5].filter((k) => k !== miss);
      const line = (lang) => shown.map((k) => `${k + 1}. ${CYCLE[k][lang]}`).join('<br>');
      const posEn = miss === 5 ? 'it comes last.' : `it comes right before "${CYCLE[miss + 1].en}".`;
      const posMs = miss === 5 ? 'ia terletak di akhir.' : `ia terletak sejurus sebelum "${CYCLE[miss + 1].ms}".`;
      return { q: T(`The stages of the mathematical modelling cycle are listed below, in order, with one stage missing.<br>${line('en')}<br>Name the missing stage, and state its position (before which listed stage, or last).`, `Peringkat kitaran pemodelan matematik disenaraikan di bawah, mengikut urutan, dengan satu peringkat tertinggal.<br>${line('ms')}<br>Namakan peringkat yang tertinggal, dan nyatakan kedudukannya (sebelum peringkat mana yang disenaraikan, atau di akhir).`), a: T(`${CYCLE[miss].en}; ${posEn}`, `${CYCLE[miss].ms}; ${posMs}`), sp: 's' };
    },
    // true/false with justification, ordering of two stages
    (r) => {
      const [i, j] = r.distinct(2, 0, 5);
      const claimTrue = i < j;
      return { q: T(`True or False: in the mathematical modelling cycle, "${STAGE_DESC[i].en}" happens before "${STAGE_DESC[j].en}". Justify your answer.`, `Benar atau Palsu: dalam kitaran pemodelan matematik, "${STAGE_DESC[i].ms}" berlaku sebelum "${STAGE_DESC[j].ms}". Justifikasikan jawapan anda.`), a: T(`${claimTrue ? 'True' : 'False'} — the correct order has "${CYCLE[Math.min(i, j)].en}" before "${CYCLE[Math.max(i, j)].en}".`, `${claimTrue ? 'Benar' : 'Palsu'} — susunan yang betul meletakkan "${CYCLE[Math.min(i, j)].ms}" sebelum "${CYCLE[Math.max(i, j)].ms}".`), sp: 's' };
    },
  ];

  const g81m = [
    // classify: which of 3 statements (variable / variable-input / assumption) is the assumption
    (r) => {
      const s = r.pick(SCEN);
      const items = r.shuffle([s.v, s.x, s.as]);
      const opts = items.map((it, k) => `${LET[k]}) ${it.en}`);
      const optsMs = items.map((it, k) => `${LET[k]}) ${it.ms}`);
      const c = LET[items.indexOf(s.as)];
      return { q: T(`In modelling ${s.d.en}, which of the following is an assumption rather than a variable?<br>${opts.join('<br>')}`, `Dalam pemodelan ${s.d.ms}, yang manakah merupakan andaian dan bukan pemboleh ubah?<br>${optsMs.join('<br>')}`), a: T(`${c}) ${s.as.en}`, `${c}) ${s.as.ms}`), sp: 's' };
    },
    // spot the swapped-order pair in a window of 4 consecutive stages
    (r) => {
      const w = r.int(0, 2); // window start, 4 consecutive stages
      const win = [w, w + 1, w + 2, w + 3];
      const p = r.int(0, 2); // swap position within window (adjacent pair)
      const shown = win.slice();
      [shown[p], shown[p + 1]] = [shown[p + 1], shown[p]];
      const line = (lang) => shown.map((k, i) => `${i + 1}. ${CYCLE[k][lang]}`).join('<br>');
      return { q: T(`A student listed four consecutive stages of the modelling cycle, but swapped the order of one adjacent pair:<br>${line('en')}<br>Which two (by their step numbers) are in the wrong order, and what is the correct order of those two?`, `Seorang pelajar menyenaraikan empat peringkat berturutan kitaran pemodelan, tetapi menukar susunan sepasang peringkat bersebelahan:<br>${line('ms')}<br>Yang manakah dua (mengikut nombor langkah) tersalah susun, dan apakah susunan yang betul bagi kedua-duanya?`), a: T(`Steps ${p + 1} and ${p + 2} are swapped; correct order is "${CYCLE[win[p]].en}" then "${CYCLE[win[p + 1]].en}".`, `Langkah ${p + 1} dan ${p + 2} tertukar; susunan yang betul ialah "${CYCLE[win[p]].ms}" kemudian "${CYCLE[win[p + 1]].ms}".`), sp: 's' };
    },
    // reject an inadmissible solution
    (r) => {
      const items = [
        { en1: 'seat', en: 'seats', ms: 'tempat duduk' }, { en1: 'ticket', en: 'tickets', ms: 'tiket' },
        { en1: 'table', en: 'tables', ms: 'meja' }, { en1: 'bus', en: 'buses', ms: 'bas' },
        { en1: 'worker', en: 'workers', ms: 'pekerja' }, { en1: 'box', en: 'boxes', ms: 'kotak' },
      ];
      const it = r.pick(items);
      const good = r.int(4, 15);
      const bad = -r.int(1, 6);
      const forms = r.shuffle([good, bad]);
      return { q: T(`Solving a model for the number of ${it.en} needed gives two mathematically valid roots: $n = ${forms[0]}$ and $n = ${forms[1]}$. Which value is rejected, and at which stage of the modelling cycle does this rejection happen?`, `Menyelesaikan suatu model bagi bilangan ${it.ms} yang diperlukan memberikan dua punca yang sah secara matematik: $n = ${forms[0]}$ dan $n = ${forms[1]}$. Nilai manakah yang ditolak, dan pada peringkat manakah dalam kitaran pemodelan penolakan ini berlaku?`), a: T(`$n = ${bad}$ is rejected (the number of ${it.en} cannot be negative); this happens at the "${CYCLE[4].en}" stage.`, `$n = ${bad}$ ditolak (bilangan ${it.ms} tidak boleh negatif); ini berlaku pada peringkat "${CYCLE[4].ms}".`), sp: 's' };
    },
    // limitation of long-range prediction, tied to family
    (r) => {
      const s = r.pick(SCEN);
      const t = r.int(2, 5);
      return { q: T(`A model for ${s.d.en} is built using data collected over the first ${t} periods. Someone wants to use it to predict far beyond that range. State one reason this long-range prediction might not be reliable.`, `Suatu model bagi ${s.d.ms} dibina menggunakan data yang dikumpul sepanjang ${t} tempoh pertama. Seseorang ingin menggunakannya untuk meramal jauh melebihi julat itu. Nyatakan satu sebab ramalan jarak jauh ini mungkin tidak boleh dipercayai.`), a: LIMIT_REASON[s.fam], sp: 's' };
    },
    // match 3 actions (stage descriptions) to their stage names
    (r) => {
      const idx = r.sample([0, 1, 2, 3, 4, 5], 3).sort((a, b) => a - b);
      const shownDesc = r.shuffle(idx);
      const opts = r.shuffle(idx);
      const dLine = (lang) => shownDesc.map((k, i) => `${i + 1}. ${STAGE_DESC[k][lang]}`).join('<br>');
      const oLine = (lang) => opts.map((k, i) => `${LET[i]}) ${CYCLE[k][lang]}`).join('<br>');
      const ans = shownDesc.map((k) => LET[opts.indexOf(k)]);
      return { q: T(`Match each action (1-${idx.length}) to its stage of the modelling cycle (${opts.map((_, i) => LET[i]).join(', ')}).<br>${dLine('en')}<br>${oLine('en')}`, `Padankan setiap tindakan (1-${idx.length}) dengan peringkat kitaran pemodelan (${opts.map((_, i) => LET[i]).join(', ')}).<br>${dLine('ms')}<br>${oLine('ms')}`), a: T(ans.map((c, i) => `${i + 1}-${c}`).join(', ')), sp: 's' };
    },
  ];

  const g81a = [
    // full mini-analysis of a scenario: variable, assumption, family + justification
    (r) => {
      const s = r.pick(SCEN);
      const parts = [T(`Name one variable in modelling ${s.d.en}, and state what it depends on.`, `Namakan satu pemboleh ubah dalam pemodelan ${s.d.ms}, dan nyatakan bergantung kepada apa.`), T('State one assumption you would make.', 'Nyatakan satu andaian yang akan anda buat.'), T('State which family of model — linear, quadratic or exponential — is most appropriate, and briefly justify your choice.', 'Nyatakan keluarga model — linear, kuadratik atau eksponen — yang paling sesuai, dan justifikasikan pilihan anda secara ringkas.')];
      const ansParts = [T(`${SPM.cap(s.v.en)} depends on ${s.x.en}.`, `${SPM.cap(s.v.ms)} bergantung kepada ${s.x.ms}.`), s.as, T(`${FAM_NAME[s.fam].en} model (${FAM_EQ[s.fam]}), because ${FAM_TEST[s.fam].en} for equally spaced ${s.x.en}.`, `Model ${FAM_NAME[s.fam].ms} (${FAM_EQ[s.fam]}), kerana ${FAM_TEST[s.fam].ms} bagi ${s.x.ms} yang sama selangnya.`)];
      return { q: T(`Consider modelling ${s.d.en}.<br>${SPM.parts(parts).en}`, `Pertimbangkan pemodelan ${s.d.ms}.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // critique a validation that only checks the data used to build the model
    (r) => {
      const s = r.pick(SCEN);
      const t = r.int(4, 8);
      return { q: T(`A student built a model for ${s.d.en} using ${t} data points, then checked that the model fits those same ${t} points well, and concluded "the model is fully validated." Explain what is wrong with this reasoning, and suggest a better way to validate the model.`, `Seorang pelajar membina model bagi ${s.d.ms} menggunakan ${t} titik data, kemudian menyemak bahawa model itu sepadan dengan ${t} titik data yang sama, lalu membuat kesimpulan "model ini telah disahkan sepenuhnya." Terangkan apa yang salah dengan penaakulan ini, dan cadangkan cara yang lebih baik untuk mengesahkan model itu.`), a: T('Fitting the data used to build the model does not prove the model is valid — it will usually fit that data well by construction. A better check is to compare its prediction against a data point that was NOT used to build the model.', 'Kesesuaian dengan data yang digunakan untuk membina model tidak membuktikan model itu sah — ia biasanya akan sepadan dengan baik atas dasar pembinaannya. Semakan yang lebih baik ialah membandingkan ramalannya dengan satu titik data yang TIDAK digunakan untuk membina model itu.'), sp: 'm' };
    },
    // refine a parameter given a prediction that misses the actual value
    (r) => {
      const m = r.int(2, 8), c = r.int(10, 40), x = r.int(3, 10);
      const pred = m * x + c;
      const dir = r.pick([1, -1]);
      const delta = r.int(3, 10);
      const actual = pred + dir * delta;
      const which = r.pick(['rate', 'fixed']);
      return { q: T(`A linear model $C = ${m}n + ${c}$ predicted $C = ${pred}$ when $n = ${x}$, but the actual value observed was $C = ${actual}$. Suggest ONE parameter of the model (the rate $m$ or the fixed value $c$) that could be refined, and explain, in terms of this data point, how you would adjust it.`, `Model linear $C = ${m}n + ${c}$ meramalkan $C = ${pred}$ apabila $n = ${x}$, tetapi nilai sebenar yang diperhatikan ialah $C = ${actual}$. Cadangkan SATU parameter model (kadar $m$ atau nilai tetap $c$) yang boleh diperhalusi, dan terangkan, berdasarkan titik data ini, bagaimana anda akan melaraskannya.`), a: T(`The actual value is ${dir > 0 ? 'higher' : 'lower'} than predicted by ${delta}, so the ${which === 'rate' ? `rate $m$ could be increased slightly (each extra unit of $n$ costs a little ${dir > 0 ? 'more' : 'less'})` : `fixed value $c$ could be adjusted by about ${dir > 0 ? '+' : '-'}${delta} to shift every prediction`}; either change would bring the prediction closer to $C = ${actual}$.`, `Nilai sebenar adalah ${dir > 0 ? 'lebih tinggi' : 'lebih rendah'} daripada yang diramal sebanyak ${delta}, jadi ${which === 'rate' ? `kadar $m$ boleh ditambah sedikit (setiap tambahan unit $n$ berkos sedikit ${dir > 0 ? 'lebih' : 'kurang'})` : `nilai tetap $c$ boleh dilaraskan sebanyak lebih kurang ${dir > 0 ? '+' : '-'}${delta} untuk menganjak setiap ramalan`}; kedua-dua perubahan itu akan mendekatkan ramalan kepada $C = ${actual}$.`), sp: 'm' };
    },
    // compare a linear vs exponential candidate against a small equally-spaced data set
    (r) => {
      const growUp = r.chance();
      const a0 = r.int(2, 6);
      let ys;
      if (growUp) {
        const b = r.pick([2, 3]);
        ys = [0, 1, 2, 3].map((k) => a0 * Math.pow(b, k));
      } else {
        const m = r.int(2, 6);
        ys = [0, 1, 2, 3].map((k) => a0 + m * k);
      }
      // pick a scenario whose own quantity genuinely increases (so the data direction matches the story)
      const s = r.pick(SCEN.filter((x) => (x.fam === 'linear' || x.fam === 'exponential') && x.dir === 1));
      const diffs = ys.slice(1).map((y, i) => y - ys[i]);
      const ratios = ys.slice(1).map((y, i) => n(round(y / ys[i], 3)));
      const constDiff = diffs.every((d) => d === diffs[0]);
      return { q: T(`For ${s.d.en}, the values ${ys.join(', ')} were recorded at $x = 0, 1, 2, 3$ (equal steps). A linear model and an exponential model are both proposed. Which family fits this data, and why?`, `Bagi ${s.d.ms}, nilai ${ys.join(', ')} direkodkan pada $x = 0, 1, 2, 3$ (langkah sama). Model linear dan model eksponen kedua-duanya dicadangkan. Keluarga manakah yang sepadan dengan data ini, dan mengapa?`), a: T(`Differences are ${diffs.join(', ')} and ratios are ${ratios.join(', ')}; ${constDiff ? `the differences are constant, so a linear model fits (not exponential, since the ratios are not constant).` : `the ratios are constant, so an exponential model fits (not linear, since the differences are not constant).`}`, `Perbezaan ialah ${diffs.join(', ')} dan nisbah ialah ${ratios.join(', ')}; ${constDiff ? `perbezaannya malar, jadi model linear sepadan (bukan eksponen, kerana nisbahnya tidak malar).` : `nisbahnya malar, jadi model eksponen sepadan (bukan linear, kerana perbezaannya tidak malar).`}`), sp: 'm' };
    },
    // spot which stage is missing from a short report and supply a sentence for it
    (r) => {
      const s = r.pick(SCEN);
      const miss = r.pick([2, 3, 4, 5]);
      const lines = [1, 2, 3, 4, 5].filter((k) => k !== miss).map((k) => CYCLE[k === 0 ? 0 : k - (k > miss ? 0 : 0)]);
      const order = [0, 1, 2, 3, 4, 5].filter((k) => k !== miss);
      const rep = order.map((k) => CYCLE[k].en).join(' → ');
      const repMs = order.map((k) => CYCLE[k].ms).join(' → ');
      return { q: T(`A short report on modelling ${s.d.en} lists these stages, in order, but one stage of the cycle is missing entirely: ${rep}. Name the missing stage, and write one sentence that could fill that gap for this situation.`, `Satu laporan ringkas tentang pemodelan ${s.d.ms} menyenaraikan peringkat berikut, mengikut urutan, tetapi satu peringkat kitaran hilang sepenuhnya: ${repMs}. Namakan peringkat yang hilang, dan tulis satu ayat yang boleh mengisi jurang itu bagi situasi ini.`), a: T(`Missing stage: "${CYCLE[miss].en}". Example sentence: ${miss === 2 ? `"We model ${s.v.en} as a function of ${s.x.en} using ${famArt(s.fam)} ${FAM_NAME[s.fam].en} model."` : miss === 3 ? `"Substituting the given values into the model gives the numerical answer."` : miss === 4 ? `"The answer is checked against the context and, where possible, against real data."` : `"State one assumption, such as: ${s.as.en}."`}`, `Peringkat yang hilang: "${CYCLE[miss].ms}". Contoh ayat: ${miss === 2 ? `"Kami memodelkan ${s.v.ms} sebagai fungsi ${s.x.ms} menggunakan model ${FAM_NAME[s.fam].ms}."` : miss === 3 ? `"Menggantikan nilai yang diberi ke dalam model memberikan jawapan berangka."` : miss === 4 ? `"Jawapan disemak berdasarkan konteks dan, jika boleh, berdasarkan data sebenar."` : `"Nyatakan satu andaian, seperti: ${s.as.ms}."`}`), sp: 'm' };
    },
  ];
  SPM.extend('F5-8.1', { e: g81e, m: g81m, a: g81a });

  /* =============================================================== 8.2 Linear models */
  /** contexts for y = mx + c: qsym = dependent variable letter, sym = independent variable letter */
  const LINCTX = [
    { noun: T('total taxi fare', 'jumlah tambang teksi'), unit: T('the distance travelled (km)', 'jarak yang dilalui (km)'), sym: 'd', qsym: 'C', c: [5, 15], m: [1, 4], x: [3, 20], kind: 'money' },
    { noun: T('total monthly phone bill', 'jumlah bil telefon bulanan'), unit: T('the data used (GB)', 'data yang digunakan (GB)'), sym: 'g', qsym: 'C', c: [20, 50], m: [2, 6], x: [1, 15], kind: 'money' },
    { noun: T('total cost of hiring a caterer', 'jumlah kos menyewa jurumasak'), unit: T('the number of guests', 'bilangan tetamu'), sym: 'p', qsym: 'C', c: [100, 300], m: [10, 30], x: [10, 80], kind: 'money' },
    { noun: T('total parking charge', 'jumlah caj tempat letak kereta'), unit: T('the number of hours parked', 'bilangan jam diletakkan'), sym: 'h', qsym: 'C', c: [2, 6], m: [1, 3], x: [1, 10], kind: 'money' },
    { noun: T("total plumber's call-out cost", 'jumlah kos panggilan tukang paip'), unit: T('the number of hours worked', 'bilangan jam bekerja'), sym: 'h', qsym: 'C', c: [30, 80], m: [20, 50], x: [1, 6], kind: 'money' },
    { noun: T('depth of water in a tank', 'kedalaman air dalam tangki'), unit: T('the time since filling started (minutes)', 'masa sejak pengisian bermula (minit)'), sym: 't', qsym: 'D', c: [5, 30], m: [1, 5], x: [1, 40], kind: 'length' },
    { noun: T('total cost of printing T-shirts', 'jumlah kos mencetak baju-T'), unit: T('the number of T-shirts', 'bilangan baju-T'), sym: 'k', qsym: 'C', c: [30, 80], m: [5, 15], x: [5, 60], kind: 'money' },
    { noun: T('total cost of installing fairy lights', 'jumlah kos memasang lampu hiasan'), unit: T('the length of lights installed (m)', 'panjang lampu yang dipasang (m)'), sym: 'l', qsym: 'C', c: [20, 50], m: [2, 6], x: [3, 25], kind: 'money' },
  ];
  const fmtV = (ctx, v, lang) => (ctx.kind === 'money' ? rm(v) : `${n(v)} cm`);
  const modelStr = (ctx, m, c) => `${ctx.qsym} = ${lin(m, c, ctx.sym)}`;

  const g82e = [
    // evaluate the model at a given x, and interpret m and c
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c), x = r.int(...ctx.x);
      const y = m * x + c;
      const interpretOnly = r.chance(0.4);
      const eq = modelStr(ctx, m, c);
      if (interpretOnly) {
        return { q: T(`A model for the ${ctx.noun.en} is $${eq}$, where $${ctx.sym}$ is ${ctx.unit.en}. State what the values ${m} and ${c} represent.`, `Suatu model bagi ${ctx.noun.ms} ialah $${eq}$, dengan $${ctx.sym}$ ialah ${ctx.unit.ms}. Nyatakan apa yang diwakili oleh nilai ${m} dan ${c}.`), a: T(`${m} is the rate of change per unit of ${ctx.sym}; ${c} is the fixed/initial value (value when ${ctx.sym} = 0).`, `${m} ialah kadar perubahan bagi setiap unit ${ctx.sym}; ${c} ialah nilai tetap/awal (nilai apabila ${ctx.sym} = 0).`), sp: 's' };
      }
      return { q: T(`A model for the ${ctx.noun.en} is $${eq}$, where $${ctx.sym}$ is ${ctx.unit.en}. Find the ${ctx.noun.en} when $${ctx.sym} = ${x}$.`, `Suatu model bagi ${ctx.noun.ms} ialah $${eq}$, dengan $${ctx.sym}$ ialah ${ctx.unit.ms}. Cari ${ctx.noun.ms} apabila $${ctx.sym} = ${x}$.`), a: T(fmtV(ctx, y)), sp: 'xs' };
    },
    // construct the model from a worded description (no equation given)
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      return { q: T(`A ${ctx.noun.en} starts at ${fmtV(ctx, c)} and increases by ${fmtV(ctx, m)} for every extra unit of $${ctx.sym}$ (${ctx.unit.en}). Write a linear model $${ctx.qsym} = m${ctx.sym} + c$ for this.`, `${SPM.cap(ctx.noun.ms)} bermula pada ${fmtV(ctx, c)} dan bertambah sebanyak ${fmtV(ctx, m)} bagi setiap tambahan unit $${ctx.sym}$ (${ctx.unit.ms}). Tulis model linear $${ctx.qsym} = m${ctx.sym} + c$ bagi keadaan ini.`), a: T(`$${modelStr(ctx, m, c)}$`), sp: 's' };
    },
    // read m and c directly from a 3-row table (x = 0,1,2)
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      const xs = [0, 1, 2];
      const tab = SPM.table([[`$${ctx.sym}$`, ...xs], [`$${ctx.qsym}$`, ...xs.map((x) => m * x + c)]]);
      return { q: T(`The table shows the ${ctx.noun.en} for a few values of $${ctx.sym}$ (${ctx.unit.en}).<br>${tab}<br>State the values of $m$ and $c$ in the linear model $${ctx.qsym} = m${ctx.sym} + c$.`, `Jadual menunjukkan ${ctx.noun.ms} bagi beberapa nilai $${ctx.sym}$ (${ctx.unit.ms}).<br>${tab}<br>Nyatakan nilai $m$ dan $c$ dalam model linear $${ctx.qsym} = m${ctx.sym} + c$.`), a: T(`$m = ${m}$, $c = ${c}$`), sp: 's' };
    },
    // gradient from two points (core skill reused in this context)
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      const [x1, x2] = r.distinct(2, ctx.x[0], Math.min(ctx.x[1], ctx.x[0] + 12));
      const y1 = m * x1 + c, y2 = m * x2 + c;
      return { q: T(`For the ${ctx.noun.en}, two recorded points are ($${ctx.sym} = ${x1}$, $${ctx.qsym} = ${y1}$) and ($${ctx.sym} = ${x2}$, $${ctx.qsym} = ${y2}$). Find the gradient $m$ of the linear model.`, `Bagi ${ctx.noun.ms}, dua titik yang direkodkan ialah ($${ctx.sym} = ${x1}$, $${ctx.qsym} = ${y1}$) dan ($${ctx.sym} = ${x2}$, $${ctx.qsym} = ${y2}$). Cari kecerunan $m$ model linear itu.`), a: T(`$m = ${n((y2 - y1) / (x2 - x1))}$`), sp: 'xs' };
    },
    // MCQ: what does c (or m) represent
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      const askC = r.chance();
      const val = askC ? c : m;
      const correct = askC ? T(`the fixed/initial value of the ${ctx.noun.en} (when $${ctx.sym} = 0$)`, `nilai tetap/awal ${ctx.noun.ms} (apabila $${ctx.sym} = 0$)`) : T(`the rate of change of the ${ctx.noun.en} for each extra unit of $${ctx.sym}$`, `kadar perubahan ${ctx.noun.ms} bagi setiap tambahan unit $${ctx.sym}$`);
      const wrong = [T(`the value of $${ctx.sym}$ when $${ctx.qsym} = 0$`, `nilai $${ctx.sym}$ apabila $${ctx.qsym} = 0$`), T(`the largest possible value of $${ctx.qsym}$`, `nilai terbesar yang mungkin bagi $${ctx.qsym}$`), T(`the average value of $${ctx.qsym}$ over the range shown`, `nilai purata $${ctx.qsym}$ sepanjang julat yang ditunjukkan`)];
      const opts = r.shuffle([correct, ...wrong]);
      const c2 = LET[opts.indexOf(correct)];
      const line = (lang) => opts.map((o, k) => `${LET[k]}) ${o[lang]}`).join('<br>');
      return { q: T(`In the model $${modelStr(ctx, m, c)}$ for the ${ctx.noun.en}, what does the value ${val} represent?<br>${line('en')}`, `Dalam model $${modelStr(ctx, m, c)}$ bagi ${ctx.noun.ms}, apakah yang diwakili oleh nilai ${val}?<br>${line('ms')}`), a: T(`${c2}) ${correct.en}`, `${c2}) ${correct.ms}`), sp: 'xs' };
    },
    // MCQ: which equation matches a worded rate + fixed-value description
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      need(m !== c);
      const correct = `${ctx.qsym} = ${lin(m, c, ctx.sym)}`;
      const distractors = [`${ctx.qsym} = ${lin(c, m, ctx.sym)}`, `${ctx.qsym} = ${lin(m, -c, ctx.sym)}`, `${ctx.qsym} = ${lin(m + 1, c, ctx.sym)}`];
      const opts = r.shuffle([correct, ...distractors]);
      const ansLet = LET[opts.indexOf(correct)];
      const line = opts.map((o, k) => `${LET[k]}) $${o}$`).join('<br>');
      return { q: T(`The ${ctx.noun.en} starts at ${fmtV(ctx, c)} (when $${ctx.sym} = 0$) and increases by ${fmtV(ctx, m)} for each extra unit of $${ctx.sym}$ (${ctx.unit.en}). Which equation models this?<br>${line}`, `${SPM.cap(ctx.noun.ms)} bermula pada ${fmtV(ctx, c)} (apabila $${ctx.sym} = 0$) dan bertambah sebanyak ${fmtV(ctx, m)} bagi setiap tambahan unit $${ctx.sym}$ (${ctx.unit.ms}). Persamaan manakah memodelkan ini?<br>${line}`), a: T(`${ansLet}) $${correct}$`), sp: 'xs' };
    },
    // read gradient and intercept from a graph
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.step(1, 4, 1), c = r.int(2, 10);
      const xmax = 8;
      const fig = S.plane({ x: [0, xmax], y: [0, m * xmax + c + 2], lines: [{ m, c }], pts: [{ x: 0, y: c, l: `(0, ${c})` }, { x: xmax, y: m * xmax + c, l: `(${xmax}, ${m * xmax + c})` }] });
      return { q: T(`The graph shows a linear model for the ${ctx.noun.en} against $${ctx.sym}$ (${ctx.unit.en}). State the gradient and the $${ctx.qsym}$-intercept, and hence write the equation of the model.`, `Graf menunjukkan model linear bagi ${ctx.noun.ms} berbanding $${ctx.sym}$ (${ctx.unit.ms}). Nyatakan kecerunan dan pintasan-$${ctx.qsym}$, dan seterusnya tulis persamaan model itu.`), a: T(`Gradient $= ${m}$, intercept $= ${c}$; $${modelStr(ctx, m, c)}$`), sp: 's', fig };
    },
  ];

  const g82m = [
    // formulate the model from two data instances given in words
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      const [x1, x2] = r.distinct(2, ctx.x[0], ctx.x[1]);
      const y1 = m * x1 + c, y2 = m * x2 + c;
      return { q: T(`For a ${ctx.noun.en}, ${ctx.unit.en} of ${x1} gives $${ctx.qsym} = ${y1}$, and ${ctx.unit.en} of ${x2} gives $${ctx.qsym} = ${y2}$. Assuming a linear model $${ctx.qsym} = m${ctx.sym} + c$, find $m$ and $c$.`, `Bagi ${ctx.noun.ms}, ${ctx.unit.ms} sebanyak ${x1} memberikan $${ctx.qsym} = ${y1}$, dan ${ctx.unit.ms} sebanyak ${x2} memberikan $${ctx.qsym} = ${y2}$. Dengan andaian model linear $${ctx.qsym} = m${ctx.sym} + c$, cari $m$ dan $c$.`), a: T(`$m = \\dfrac{${y2} - ${y1}}{${x2} - ${x1}} = ${m}$, $c = ${y1} - ${m}(${x1}) = ${c}$; $${modelStr(ctx, m, c)}$`), sp: 'm' };
    },
    // direct compare of two plans at a stated x (no break-even)
    (r) => {
      const [ctxA, ctxB] = r.sample(LINCTX.filter((c) => c.kind === 'money'), 2);
      const mA = r.int(...ctxA.m), cA = r.int(...ctxA.c);
      const mB = r.int(...ctxB.m), cB = r.int(...ctxB.c);
      const x = r.int(Math.max(ctxA.x[0], ctxB.x[0]), Math.min(ctxA.x[1], ctxB.x[1]));
      const yA = mA * x + cA, yB = mB * x + cB;
      need(yA !== yB);
      return { q: T(`Provider A models a cost as $${ctxA.qsym} = ${lin(mA, cA, 'x')}$ and Provider B models a similar cost as $${ctxB.qsym} = ${lin(mB, cB, 'x')}$, both in terms of the same quantity $x$. Which provider is cheaper when $x = ${x}$, and by how much?`, `Pembekal A memodelkan suatu kos sebagai $${ctxA.qsym} = ${lin(mA, cA, 'x')}$ dan Pembekal B memodelkan kos serupa sebagai $${ctxB.qsym} = ${lin(mB, cB, 'x')}$, kedua-duanya dari segi kuantiti $x$ yang sama. Pembekal manakah lebih murah apabila $x = ${x}$, dan berapakah bezanya?`), a: T(`A: ${fmtV(ctxA, yA)}, B: ${fmtV(ctxB, yB)}; ${yA < yB ? 'Provider A' : 'Provider B'} is cheaper by ${rm(Math.abs(yA - yB))}.`, `A: ${fmtV(ctxA, yA)}, B: ${fmtV(ctxB, yB)}; ${yA < yB ? 'Pembekal A' : 'Pembekal B'} lebih murah sebanyak ${rm(Math.abs(yA - yB))}.`), sp: 'm' };
    },
    // solve backwards: max x within a budget
    (r) => {
      const ctx = r.pick(LINCTX.filter((c) => c.kind === 'money'));
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      const xMax = r.int(ctx.x[0] + 3, ctx.x[1]);
      const budget = m * xMax + c + r.int(0, m - 1);
      const feasible = Math.floor((budget - c) / m);
      return { q: T(`The ${ctx.noun.en} follows the model $${modelStr(ctx, m, c)}$. If the budget is ${rm(budget)}, find the greatest whole value of $${ctx.sym}$ (${ctx.unit.en}) that can be afforded.`, `${SPM.cap(ctx.noun.ms)} mengikut model $${modelStr(ctx, m, c)}$. Jika bajet ialah ${rm(budget)}, cari nilai bulat terbesar $${ctx.sym}$ (${ctx.unit.ms}) yang mampu dibiayai.`), a: T(`$${ctx.sym} \\le ${n((budget - c) / m)}$, so the greatest whole value is $${ctx.sym} = ${feasible}$.`, `$${ctx.sym} \\le ${n((budget - c) / m)}$, jadi nilai bulat terbesar ialah $${ctx.sym} = ${feasible}$.`), sp: 'm' };
    },
    // true/false misconception: doubling x doubles y
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      need(c !== 0);
      const x = r.int(Math.max(1, ctx.x[0]), Math.floor(ctx.x[1] / 2));
      const y1 = m * x + c, y2 = m * (2 * x) + c;
      return { q: T(`True or False: for the model $${modelStr(ctx, m, c)}$, doubling $${ctx.sym}$ always doubles $${ctx.qsym}$. Justify your answer using $${ctx.sym} = ${x}$ and $${ctx.sym} = ${2 * x}$.`, `Benar atau Palsu: bagi model $${modelStr(ctx, m, c)}$, menggandakan $${ctx.sym}$ akan sentiasa menggandakan $${ctx.qsym}$. Justifikasikan jawapan anda menggunakan $${ctx.sym} = ${x}$ dan $${ctx.sym} = ${2 * x}$.`), a: T(`False — at $${ctx.sym} = ${x}$, $${ctx.qsym} = ${y1}$, but at $${ctx.sym} = ${2 * x}$, $${ctx.qsym} = ${y2} \\ne ${2 * y1}$. Doubling only doubles $${ctx.qsym}$ when $c = 0$.`, `Palsu — pada $${ctx.sym} = ${x}$, $${ctx.qsym} = ${y1}$, tetapi pada $${ctx.sym} = ${2 * x}$, $${ctx.qsym} = ${y2} \\ne ${2 * y1}$. Penggandaan hanya menggandakan $${ctx.qsym}$ apabila $c = 0$.`), sp: 'm' };
    },
    // explain a domain restriction
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      return { q: T(`For the model $${modelStr(ctx, m, c)}$ of the ${ctx.noun.en}, explain why $${ctx.sym}$ cannot realistically be negative, and why the model may stop being realistic for very large values of $${ctx.sym}$.`, `Bagi model $${modelStr(ctx, m, c)}$ bagi ${ctx.noun.ms}, terangkan mengapa $${ctx.sym}$ tidak boleh menjadi negatif secara realistik, dan mengapa model itu mungkin tidak lagi realistik bagi nilai $${ctx.sym}$ yang sangat besar.`), a: T(`$${ctx.sym}$ represents ${ctx.unit.en}, which cannot be negative; for very large $${ctx.sym}$, real limits (capacity, practical bounds) usually stop the cost/quantity increasing at exactly the same constant rate forever.`, `$${ctx.sym}$ mewakili ${ctx.unit.ms}, yang tidak boleh negatif; bagi $${ctx.sym}$ yang sangat besar, had sebenar (kapasiti, batasan praktikal) biasanya menghalang kos/kuantiti daripada terus bertambah pada kadar malar yang sama selama-lamanya.`), sp: 's' };
    },
    // read the break-even point from a graph of two lines
    (r) => {
      const ctx = r.pick(LINCTX.filter((c) => c.kind === 'money'));
      const xi = r.int(2, 6);
      const cA = r.int(5, 20);
      const mB = r.step(1, 5, 1);
      const mA = mB + r.int(1, 3);
      const cB = cA + mA * xi - mB * xi;
      need(cB >= 0 && cB !== cA);
      const xmax = xi + r.int(2, 4);
      const fig = S.plane({ x: [0, xmax], y: [0, Math.max(mA, mB) * xmax + Math.max(cA, cB) + 2], lines: [{ m: mA, c: cA, label: 'A' }, { m: mB, c: cB, label: 'B' }], pts: [{ x: xi, y: mA * xi + cA, l: `(${xi}, ${mA * xi + cA})` }] });
      return { q: T(`The graph shows two cost models, A: $C = ${lin(mA, cA, 'x')}$ and B: $C = ${lin(mB, cB, 'x')}$, for the ${ctx.noun.en}. Read off the point where the two lines meet, and state for which values of $x$ Plan B is cheaper.`, `Graf menunjukkan dua model kos, A: $C = ${lin(mA, cA, 'x')}$ dan B: $C = ${lin(mB, cB, 'x')}$, bagi ${ctx.noun.ms}. Baca titik pertemuan kedua-dua garis itu, dan nyatakan bagi nilai $x$ yang manakah Pelan B lebih murah.`), a: T(`They meet at $(${xi}, ${mA * xi + cA})$; Plan B is cheaper for $x > ${xi}$ (its rate $${mB}$ is smaller than A's rate $${mA}$).`, `Kedua-duanya bertemu pada $(${xi}, ${mA * xi + cA})$; Pelan B lebih murah bagi $x > ${xi}$ (kadarnya $${mB}$ lebih kecil daripada kadar A, $${mA}$).`), sp: 'm', fig };
    },
    // spot the reading that breaks an otherwise-linear pattern in a table
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      const x0 = ctx.x[0], step = r.int(2, 4);
      const xs = [x0, x0 + step, x0 + 2 * step, x0 + 3 * step];
      const ys = xs.map((x) => m * x + c);
      const bad = r.int(0, 3);
      const dev = r.pick([-1, 1]) * r.int(2, Math.max(3, m + 1));
      ys[bad] += dev;
      const tab = SPM.table([[`$${ctx.sym}$`, ...xs], [`$${ctx.qsym}$`, ...ys]]);
      return { q: T(`The table shows four readings of the ${ctx.noun.en}, which should follow a linear model.<br>${tab}<br>One reading was recorded wrongly. Identify which reading (by its value of $${ctx.sym}$) breaks the linear pattern, and state what its correct value should have been.`, `Jadual menunjukkan empat cerapan ${ctx.noun.ms}, yang sepatutnya mengikut model linear.<br>${tab}<br>Satu cerapan direkodkan secara salah. Kenal pasti cerapan yang manakah (mengikut nilai $${ctx.sym}$) yang mencacatkan corak linear itu, dan nyatakan nilai yang sepatutnya betul.`), a: T(`The reading at $${ctx.sym} = ${xs[bad]}$ is wrong (recorded ${fmtV(ctx, ys[bad])}); the correct value, following the pattern $${modelStr(ctx, m, c)}$, is ${fmtV(ctx, ys[bad] - dev)}.`, `Cerapan pada $${ctx.sym} = ${xs[bad]}$ adalah salah (direkodkan ${fmtV(ctx, ys[bad])}); nilai yang betul, mengikut corak $${modelStr(ctx, m, c)}$, ialah ${fmtV(ctx, ys[bad] - dev)}.`), sp: 'm' };
    },
    // spot the error: m and c swapped in a worked solution
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      need(m !== c);
      const x = r.int(...ctx.x);
      const wrongY = c * x + m;
      const rightY = m * x + c;
      return { q: T(`A student modelled the ${ctx.noun.en} as $${ctx.qsym} = ${c}${ctx.sym} + ${m}$, using ${fmtV(ctx, m)} as the fixed value and ${fmtV(ctx, c)} as the rate, and found $${ctx.qsym} = ${wrongY}$ at $${ctx.sym} = ${x}$. The correct fixed value is ${fmtV(ctx, c)} and the correct rate is ${fmtV(ctx, m)}. Identify the student's error and give the correct value of $${ctx.qsym}$ at $${ctx.sym} = ${x}$.`, `Seorang pelajar memodelkan ${ctx.noun.ms} sebagai $${ctx.qsym} = ${c}${ctx.sym} + ${m}$, menggunakan ${fmtV(ctx, m)} sebagai nilai tetap dan ${fmtV(ctx, c)} sebagai kadar, lalu memperoleh $${ctx.qsym} = ${wrongY}$ pada $${ctx.sym} = ${x}$. Nilai tetap yang betul ialah ${fmtV(ctx, c)} dan kadar yang betul ialah ${fmtV(ctx, m)}. Kenal pasti kesilapan pelajar itu dan berikan nilai $${ctx.qsym}$ yang betul pada $${ctx.sym} = ${x}$.`), a: T(`The student swapped the rate and the fixed value; correct model $${modelStr(ctx, m, c)}$ gives $${ctx.qsym} = ${rightY}$.`, `Pelajar itu menukar ganti kadar dan nilai tetap; model yang betul $${modelStr(ctx, m, c)}$ memberikan $${ctx.qsym} = ${rightY}$.`), sp: 'm' };
    },
  ];

  const g82a = [
    // full break-even comparison with a limitation
    (r) => {
      const [ctxA, ctxB] = r.sample(LINCTX.filter((c) => c.kind === 'money'), 2);
      const mA = r.int(2, 6), cA = r.pick([30, 40, 50]);
      const mB = r.int(...ctxB.m), cB = r.int(10, 25);
      need(mB < mA && cB > cA);
      const xi = Fr.make(cB - cA, mA - mB);
      need(xi.d === 1);
      const x0 = xi.n;
      const parts = [T(`Write a linear model for each provider's total cost.`, `Tulis model linear bagi jumlah kos setiap pembekal.`), T(`Find the value of $x$ at which the two costs are equal.`, `Cari nilai $x$ apabila kedua-dua kos adalah sama.`), T(`State which provider is cheaper beyond that point, and give one reason the linear model might not stay realistic for very large $x$.`, `Nyatakan pembekal yang manakah lebih murah melebihi titik itu, dan berikan satu sebab model linear itu mungkin tidak kekal realistik bagi $x$ yang sangat besar.`)];
      const ansParts = [T(`$C_A = ${lin(mA, cA, 'x')}$, $C_B = ${lin(mB, cB, 'x')}$`), T(`$${x0}$`), T(`For $x > ${x0}$, provider B is cheaper (smaller rate $${mB} < ${mA}$); however real providers often cap usage or change rates, so the model may only be realistic within a limited range of $x$.`, `Bagi $x > ${x0}$, pembekal B lebih murah (kadar lebih kecil $${mB} < ${mA}$); namun pembekal sebenar selalunya mengehadkan penggunaan atau menukar kadar, jadi model itu mungkin hanya realistik dalam julat $x$ yang terhad.`)];
      return { q: T(`Provider A charges ${rm(cA)} plus ${rm(mA)} per unit of $x$ for the ${ctxA.noun.en}-style service; Provider B charges ${rm(cB)} plus ${rm(mB)} per unit of $x$.<br>${SPM.parts(parts).en}`, `Pembekal A mengenakan ${rm(cA)} ditambah ${rm(mA)} bagi setiap unit $x$ untuk perkhidmatan seperti ${ctxA.noun.ms}; Pembekal B mengenakan ${rm(cB)} ditambah ${rm(mB)} bagi setiap unit $x$.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // validate a model built from two points against a third, real observation
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      const [x1, x2] = r.distinct(2, ctx.x[0], ctx.x[1]);
      const y1 = m * x1 + c, y2 = m * x2 + c;
      const x3 = r.int(ctx.x[0], ctx.x[1]);
      need(x3 !== x1 && x3 !== x2);
      const dev = r.pick([-1, 1]) * r.int(1, Math.max(2, m));
      const actual3 = m * x3 + c + dev;
      need(actual3 >= 0);
      return { q: T(`A linear model for the ${ctx.noun.en} is built from the points ($${x1}$, ${fmtV(ctx, y1)}) and ($${x2}$, ${fmtV(ctx, y2)}). A third observation at $${ctx.sym} = ${x3}$ gives an actual value of ${fmtV(ctx, actual3)}. Find the model, compare its prediction at $${ctx.sym} = ${x3}$ with the actual value, and comment on whether the linear model is reasonable.`, `Suatu model linear bagi ${ctx.noun.ms} dibina daripada titik ($${x1}$, ${fmtV(ctx, y1)}) dan ($${x2}$, ${fmtV(ctx, y2)}). Satu cerapan ketiga pada $${ctx.sym} = ${x3}$ memberikan nilai sebenar ${fmtV(ctx, actual3)}. Cari model itu, bandingkan ramalannya pada $${ctx.sym} = ${x3}$ dengan nilai sebenar, dan komen sama ada model linear itu munasabah.`), a: T(`$${modelStr(ctx, m, c)}$; predicted value at $${ctx.sym} = ${x3}$ is ${fmtV(ctx, m * x3 + c)}, actual is ${fmtV(ctx, actual3)}, a difference of ${fmtV(ctx, Math.abs(dev))} — ${Math.abs(dev) <= 0.1 * (m * x3 + c) ? 'small enough that the linear model is reasonable.' : 'this is a fairly large gap, so the linear model may need refining.'}`, `$${modelStr(ctx, m, c)}$; nilai ramalan pada $${ctx.sym} = ${x3}$ ialah ${fmtV(ctx, m * x3 + c)}, nilai sebenar ialah ${fmtV(ctx, actual3)}, berbeza sebanyak ${fmtV(ctx, Math.abs(dev))} — ${Math.abs(dev) <= 0.1 * (m * x3 + c) ? 'cukup kecil sehingga model linear itu munasabah.' : 'ini merupakan jurang yang agak besar, jadi model linear itu mungkin perlu diperhalusi.'}`), sp: 'm' };
    },
    // interpolation vs extrapolation
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      const lo = ctx.x[0], hi = r.int(lo + 5, ctx.x[1]);
      const xin = r.int(lo, hi);
      const xout = hi + r.int(5, 15);
      const parts = [T(`Predict the ${ctx.noun.en} at $${ctx.sym} = ${xin}$, and state whether this is interpolation or extrapolation.`, `Ramalkan ${ctx.noun.ms} pada $${ctx.sym} = ${xin}$, dan nyatakan sama ada ini interpolasi atau ekstrapolasi.`), T(`Predict the ${ctx.noun.en} at $${ctx.sym} = ${xout}$, state whether this is interpolation or extrapolation, and explain why this prediction is less trustworthy.`, `Ramalkan ${ctx.noun.ms} pada $${ctx.sym} = ${xout}$, nyatakan sama ada ini interpolasi atau ekstrapolasi, dan terangkan mengapa ramalan ini kurang boleh dipercayai.`)];
      const ansParts = [T(`${fmtV(ctx, m * xin + c)}; interpolation, since $${xin}$ is within the data range $[${lo}, ${hi}]$.`, `${fmtV(ctx, m * xin + c)}; interpolasi, kerana $${xin}$ berada dalam julat data $[${lo}, ${hi}]$.`), T(`${fmtV(ctx, m * xout + c)}; extrapolation, since $${xout}$ is outside $[${lo}, ${hi}]$ — the constant rate may not continue to hold that far beyond the data collected.`, `${fmtV(ctx, m * xout + c)}; ekstrapolasi, kerana $${xout}$ berada di luar $[${lo}, ${hi}]$ — kadar malar itu mungkin tidak lagi berlaku sejauh itu di luar data yang dikumpul.`)];
      return { q: T(`A linear model $${modelStr(ctx, m, c)}$ for the ${ctx.noun.en} was built from data with $${ctx.sym}$ between ${lo} and ${hi}.<br>${SPM.parts(parts).en}`, `Model linear $${modelStr(ctx, m, c)}$ bagi ${ctx.noun.ms} dibina daripada data dengan $${ctx.sym}$ antara ${lo} dan ${hi}.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // construct your own example
    (r) => {
      const m = r.int(2, 8), c = r.pick([10, 15, 20, 25, 30]);
      return { q: T(`Describe a real-life situation that could be modelled by $y = ${m}x + ${c}$, stating clearly what $x$ and $y$ represent (with units) and one assumption your model relies on.`, `Terangkan satu situasi kehidupan sebenar yang boleh dimodelkan oleh $y = ${m}x + ${c}$, dengan menyatakan dengan jelas apa yang diwakili oleh $x$ dan $y$ (berserta unit) dan satu andaian yang menjadi asas model anda.`), a: T(`Any correct context works, for example: $y$ = total cost (RM), $x$ = number of items bought, ${c} = fixed/delivery fee, ${m} = price per item; assumption: the price per item does not change.`, `Sebarang konteks yang betul boleh diterima, contohnya: $y$ = jumlah kos (RM), $x$ = bilangan item dibeli, ${c} = yuran tetap/penghantaran, ${m} = harga bagi setiap item; andaian: harga bagi setiap item tidak berubah.`), sp: 'm' };
    },
    // three data points, check linearity and flag a residual
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      const x0 = ctx.x[0], step = r.int(2, 4);
      const xs = [x0, x0 + step, x0 + 2 * step];
      const trueYs = xs.map((x) => m * x + c);
      const dev = r.pick([-1, 1]) * r.int(1, Math.max(2, m));
      const ys = trueYs.slice();
      ys[1] += dev;
      const model = Fr.make(ys[2] - ys[0], xs[2] - xs[0]);
      need(model.d === 1);
      const mFit = model.n, cFit = ys[0] - mFit * xs[0];
      const predMid = mFit * xs[1] + cFit;
      return { q: T(`Three readings of the ${ctx.noun.en} are: ($${xs[0]}$, ${fmtV(ctx, ys[0])}), ($${xs[1]}$, ${fmtV(ctx, ys[1])}), ($${xs[2]}$, ${fmtV(ctx, ys[2])}). Fit a linear model using the first and last points, then state how far the middle reading is from this model's prediction. Is a linear model still reasonable here?`, `Tiga cerapan bagi ${ctx.noun.ms} ialah: ($${xs[0]}$, ${fmtV(ctx, ys[0])}), ($${xs[1]}$, ${fmtV(ctx, ys[1])}), ($${xs[2]}$, ${fmtV(ctx, ys[2])}). Padankan model linear menggunakan titik pertama dan terakhir, kemudian nyatakan sejauh mana cerapan tengah terpesong daripada ramalan model ini. Adakah model linear masih munasabah di sini?`), a: T(`$${modelStr(ctx, mFit, cFit)}$; predicted value at $${ctx.sym} = ${xs[1]}$ is ${fmtV(ctx, predMid)}, actual is ${fmtV(ctx, ys[1])}, off by ${fmtV(ctx, Math.abs(dev))} — ${Math.abs(dev) <= 0.15 * predMid ? 'small, so a linear model is still reasonable.' : 'a fairly large gap, so the linear assumption should be checked further.'}`, `$${modelStr(ctx, mFit, cFit)}$; nilai ramalan pada $${ctx.sym} = ${xs[1]}$ ialah ${fmtV(ctx, predMid)}, nilai sebenar ialah ${fmtV(ctx, ys[1])}, terpesong sebanyak ${fmtV(ctx, Math.abs(dev))} — ${Math.abs(dev) <= 0.15 * predMid ? 'kecil, jadi model linear masih munasabah.' : 'jurang yang agak besar, jadi andaian linear perlu disemak lagi.'}`), sp: 'm' };
    },
    // percentage increase is NOT constant for a linear model (contrast with exponential)
    (r) => {
      const ctx = r.pick(LINCTX);
      const m = r.int(...ctx.m), c = r.int(...ctx.c);
      const x1 = r.int(Math.max(1, ctx.x[0]), Math.floor(ctx.x[1] / 2));
      const step = r.int(2, 5);
      const x2 = x1 + step;
      const y1 = m * x1 + c, y2 = m * x2 + c;
      const pct = round(((y2 - y1) / y1) * 100, 1);
      return { q: T(`For the model $${modelStr(ctx, m, c)}$, find the percentage increase in $${ctx.qsym}$ as $${ctx.sym}$ increases from ${x1} to ${x2}. Explain why this percentage would be different if $${ctx.sym}$ increased from a much larger starting value by the same amount, even though the model is linear.`, `Bagi model $${modelStr(ctx, m, c)}$, cari peratus pertambahan $${ctx.qsym}$ apabila $${ctx.sym}$ bertambah daripada ${x1} kepada ${x2}. Terangkan mengapa peratusan ini akan berbeza jika $${ctx.sym}$ bertambah daripada nilai permulaan yang jauh lebih besar dengan jumlah tambahan yang sama, walaupun model itu linear.`), a: T(`${fmtV(ctx, y1)} → ${fmtV(ctx, y2)}, an increase of ${pct}%. The absolute increase (${fmtV(ctx, y2 - y1)}) stays the same for the same increase in $${ctx.sym}$, but the percentage increase depends on the starting value $${ctx.qsym}$, so it is smaller when the starting value is larger.`, `${fmtV(ctx, y1)} → ${fmtV(ctx, y2)}, pertambahan ${pct}%. Pertambahan mutlak (${fmtV(ctx, y2 - y1)}) kekal sama bagi pertambahan $${ctx.sym}$ yang sama, tetapi peratus pertambahan bergantung pada nilai permulaan $${ctx.qsym}$, jadi ia lebih kecil apabila nilai permulaan lebih besar.`), sp: 'm' };
    },
    // recommend a plan across a range (low usage vs high usage)
    (r) => {
      const [ctxA, ctxB] = r.sample(LINCTX.filter((c) => c.kind === 'money'), 2);
      const mA = r.int(1, 4), cA = r.int(30, 60);
      const mB = mA + r.int(2, 5), cB = r.int(5, cA - 5);
      need(cB > 0 && cB < cA);
      const xi = Fr.make(cA - cB, mB - mA);
      need(xi.d === 1 && xi.n > 0);
      const x0 = xi.n;
      const lowX = Math.max(1, Math.floor(x0 / 2));
      const highX = x0 * 2 + r.int(1, 5);
      const parts = [T(`State which plan is cheaper for a low usage of $x = ${lowX}$, and by how much.`, `Nyatakan pelan yang manakah lebih murah bagi penggunaan rendah $x = ${lowX}$, dan berapakah bezanya.`), T(`State which plan is cheaper for a high usage of $x = ${highX}$, and by how much.`, `Nyatakan pelan yang manakah lebih murah bagi penggunaan tinggi $x = ${highX}$, dan berapakah bezanya.`), T(`Recommend, with a reason, which plan a customer should choose based only on their typical usage.`, `Cadangkan, dengan alasan, pelan yang manakah patut dipilih oleh seorang pelanggan berdasarkan penggunaan lazimnya sahaja.`)];
      const yAlow = mA * lowX + cA, yBlow = mB * lowX + cB, yAhigh = mA * highX + cA, yBhigh = mB * highX + cB;
      const ansParts = [T(`${yAlow < yBlow ? 'Plan A' : 'Plan B'} is cheaper by ${rm(Math.abs(yAlow - yBlow))}.`, `${yAlow < yBlow ? 'Pelan A' : 'Pelan B'} lebih murah sebanyak ${rm(Math.abs(yAlow - yBlow))}.`), T(`${yAhigh < yBhigh ? 'Plan A' : 'Plan B'} is cheaper by ${rm(Math.abs(yAhigh - yBhigh))}.`, `${yAhigh < yBhigh ? 'Pelan A' : 'Pelan B'} lebih murah sebanyak ${rm(Math.abs(yAhigh - yBhigh))}.`), T(`A low-usage customer should choose Plan A (lower fixed cost); a high-usage customer should choose Plan B (lower rate) — the two plans cross at $x = ${x0}$.`, `Pelanggan penggunaan rendah patut memilih Pelan A (kos tetap lebih rendah); pelanggan penggunaan tinggi patut memilih Pelan B (kadar lebih rendah) — kedua-dua pelan bersilang pada $x = ${x0}$.`)];
      return { q: T(`Plan A costs $C = ${lin(mA, cA, 'x')}$ and Plan B costs $C = ${lin(mB, cB, 'x')}$, for the same service as ${ctxA.noun.en}.<br>${SPM.parts(parts).en}`, `Pelan A berkos $C = ${lin(mA, cA, 'x')}$ dan Pelan B berkos $C = ${lin(mB, cB, 'x')}$, bagi perkhidmatan yang sama seperti ${ctxA.noun.ms}.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
  ];
  SPM.extend('F5-8.2', { e: g82e, m: g82m, a: g82a });

  /* =============================================================== 8.3 Quadratic models */
  const PROJ_NOUN = [T('ball', 'bola'), T('toy rocket', 'roket mainan'), T('firework', 'bunga api'), T('water jet from a fountain', 'pancutan air dari air pancut'), T('badminton shuttlecock', 'bulu tangkis'), T('javelin', 'lembing'), T('basketball', 'bola keranjang'), T('kicked football', 'bola sepak yang ditendang')];
  const AREA_NOUN = [T('rectangular garden', 'taman segi empat tepat'), T('rectangular pen', 'kandang segi empat tepat'), T('rectangular parking area', 'kawasan meletak kereta segi empat tepat'), T('rectangular banner', 'sepanduk segi empat tepat'), T('rectangular badminton court', 'gelanggang badminton segi empat tepat'), T('rectangular vegetable plot', 'petak sayur segi empat tepat'), T('rectangular swimming pool deck', 'anjung kolam renang segi empat tepat'), T('rectangular poultry coop', 'reban ayam segi empat tepat')];
  const PROFIT_ITEM = [T('T-shirts', 'baju-T'), T('event tickets', 'tiket acara'), T('pastries', 'pastri'), T('handmade candles', 'lilin buatan tangan'), T('key chains', 'gantungan kunci'), T('concert souvenirs', 'cenderahati konsert'), T('phone cases', 'kes telefon'), T('tote bags', 'beg tote')];
  const q2 = (a, b, c) => poly([[a, 'x^2'], [b, 'x'], [c, '']]);
  const q2v = (v, a, b, c) => poly([[a, `${v}^2`], [b, v], [c, '']]);

  const g83e = [
    // evaluate the projectile-height model at a given time
    (r) => {
      const item = r.pick(PROJ_NOUN);
      const v = r.pick([10, 15, 20, 25, 30, 35]);
      const root = v / 5;
      const t = r.int(1, root - 1);
      return { q: T(`The height of a ${item.en} thrown upwards is $h = ${v}t - 5t^2$ metres after $t$ seconds. Find its height after ${t} second${t > 1 ? 's' : ''}.`, `Ketinggian sebiji ${item.ms} yang dilontar ke atas ialah $h = ${v}t - 5t^2$ meter selepas $t$ saat. Cari ketinggiannya selepas ${t} saat.`), a: T(`${v * t - 5 * t * t} m`), sp: 's' };
    },
    // evaluate the rectangular-area model at a given width
    (r) => {
      const item = r.pick(AREA_NOUN);
      const P = r.pick([20, 24, 28, 32, 36, 40, 44]);
      const half = P / 2;
      const x = r.int(1, half - 1);
      return { q: T(`A ${item.en} has a perimeter of ${P} m. Its width is $x$ m, so its area is modelled by $A = x(${half} - x)$. Find the area when $x = ${x}$.`, `Sebuah ${item.ms} mempunyai perimeter ${P} m. Lebarnya ialah $x$ m, jadi luasnya dimodelkan oleh $A = x(${half} - x)$. Cari luas apabila $x = ${x}$.`), a: T(`${x * (half - x)} m²`), sp: 's' };
    },
    // evaluate the profit model at a given quantity
    (r) => {
      const item = r.pick(PROFIT_ITEM);
      const a = r.int(3, 10), gap = r.int(15, 35), b = a + gap;
      const nMid = r.int(a + 1, b - 1);
      return { q: T(`A stall's profit (RM) from selling $n$ ${item.en} is modelled by $P = -(n - ${a})(n - ${b})$. Find the profit when $n = ${nMid}$.`, `Keuntungan (RM) sebuah gerai daripada menjual $n$ ${item.ms} dimodelkan oleh $P = -(n - ${a})(n - ${b})$. Cari keuntungan apabila $n = ${nMid}$.`), a: T(`RM${-(nMid - a) * (nMid - b)}`), sp: 's' };
    },
    // read off a, b, c from the expanded form
    (r) => {
      const a = r.int(1, 5) * r.pick([1, -1]), b = r.nz(-8, 8), c = r.int(-6, 10);
      need(a !== 0);
      return { q: T(`A quadratic model is $y = ${q2(a, b, c)}$. State the values of $a$, $b$ and $c$ when this is written as $y = ax^2 + bx + c$.`, `Suatu model kuadratik ialah $y = ${q2(a, b, c)}$. Nyatakan nilai $a$, $b$ dan $c$ apabila ini ditulis sebagai $y = ax^2 + bx + c$.`), a: T(`$a = ${a}$, $b = ${b}$, $c = ${c}$`), sp: 's' };
    },
    // read roots directly off a given factorised model
    (r) => {
      const item = r.pick(PROJ_NOUN);
      const v = r.pick([10, 15, 20, 25, 30, 35]);
      const root = v / 5;
      return { q: T(`The height of a ${item.en} factorises as $h = 5t(${root} - t)$. State the two values of $t$ for which $h = 0$.`, `Ketinggian sebuah ${item.ms} difaktorkan sebagai $h = 5t(${root} - t)$. Nyatakan dua nilai $t$ apabila $h = 0$.`), a: T(`$t = 0$ and $t = ${root}$`, `$t = 0$ dan $t = ${root}$`), sp: 's' };
    },
    // constant second difference from a small table
    (r) => {
      const a = r.int(1, 4), b = r.int(-3, 3), c = r.int(0, 5);
      const xs = [0, 1, 2, 3];
      const ys = xs.map((x) => a * x * x + b * x + c);
      need(ys.every((y) => y >= 0));
      const tab = SPM.table([['$x$', ...xs], ['$y$', ...ys]]);
      return { q: T(`The table shows a quadratic model.<br>${tab}<br>Find the first differences, then the second differences, of $y$.`, `Jadual menunjukkan suatu model kuadratik.<br>${tab}<br>Cari perbezaan pertama, kemudian perbezaan kedua, bagi $y$.`), a: T(`First differences: ${ys.slice(1).map((y, i) => y - ys[i]).join(', ')}; second differences: constant at ${2 * a}.`, `Perbezaan pertama: ${ys.slice(1).map((y, i) => y - ys[i]).join(', ')}; perbezaan kedua: malar pada ${2 * a}.`), sp: 'm' };
    },
    // simple reject of an inadmissible time/length root
    (r) => {
      const item = r.pick(PROJ_NOUN);
      const good = r.int(3, 9), bad = -r.int(1, 5);
      const pair = r.shuffle([good, bad]);
      return { q: T(`Solving a model for the time a ${item.en} reaches a certain height gives $t = ${pair[0]}$ or $t = ${pair[1]}$. Which value is the valid answer, and why?`, `Menyelesaikan suatu model bagi masa sebuah ${item.ms} mencapai ketinggian tertentu memberikan $t = ${pair[0]}$ atau $t = ${pair[1]}$. Nilai manakah jawapan yang sah, dan mengapa?`), a: T(`$t = ${good}$ s; time cannot be negative, so $t = ${bad}$ is rejected.`, `$t = ${good}$ s; masa tidak boleh negatif, jadi $t = ${bad}$ ditolak.`), sp: 's' };
    },
    // read a value or the roots off a plotted parabola
    (r) => {
      const rt1 = r.int(-4, 0), rt2 = r.int(rt1 + 3, 6);
      const a = 1;
      const xmax = rt2 + 2, xmin = rt1 - 2;
      const f = (x) => a * (x - rt1) * (x - rt2);
      const ymax = Math.max(f(xmin), f(xmax), 1);
      const fig = S.plane({ x: [xmin, xmax], y: [-Math.abs((rt2 - rt1) * (rt2 - rt1)) / 4 - 1, ymax], curves: [{ f }] });
      return { q: T(`The graph shows $y = (x - ${rt1})(x - ${rt2})$. State the values of $x$ for which $y = 0$ (the $x$-intercepts).`, `Graf menunjukkan $y = (x - ${rt1})(x - ${rt2})$. Nyatakan nilai $x$ apabila $y = 0$ (pintasan-$x$).`), a: T(`$x = ${rt1}$ and $x = ${rt2}$`, `$x = ${rt1}$ dan $x = ${rt2}$`), sp: 's', fig };
    },
    // confirm the profit is exactly zero at each break-even point (direct substitution)
    (r) => {
      const item = r.pick(PROFIT_ITEM);
      const a = r.int(3, 10), gap = r.int(15, 35), b = a + gap;
      const which = r.pick([a, b]);
      return { q: T(`A stall's profit (RM) from selling $n$ ${item.en} is $P = -(n - ${a})(n - ${b})$. Show that the profit is RM0 when $n = ${which}$.`, `Keuntungan (RM) sebuah gerai daripada menjual $n$ ${item.ms} ialah $P = -(n - ${a})(n - ${b})$. Tunjukkan bahawa keuntungannya RM0 apabila $n = ${which}$.`), a: T(`$P = -(${which} - ${a})(${which} - ${b}) = ${which === a ? `-(0)(${a - b})` : `-(${b - a})(0)`} = 0$`, `$P = -(${which} - ${a})(${which} - ${b}) = ${which === a ? `-(0)(${a - b})` : `-(${b - a})(0)`} = 0$`), sp: 's' };
    },
    // compare two heights/areas at two different inputs (which is bigger)
    (r) => {
      const item = r.pick(PROJ_NOUN);
      const v = r.pick([10, 15, 20, 25, 30, 35]);
      const root = v / 5;
      const [t1, t2] = r.distinct(2, 1, root - 1);
      const h1 = v * t1 - 5 * t1 * t1, h2 = v * t2 - 5 * t2 * t2;
      need(h1 !== h2);
      return { q: T(`For a ${item.en} with height $h = ${v}t - 5t^2$, is the height greater at $t = ${t1}$ s or at $t = ${t2}$ s?`, `Bagi sebuah ${item.ms} dengan ketinggian $h = ${v}t - 5t^2$, ketinggiannya lebih besar pada $t = ${t1}$ s atau pada $t = ${t2}$ s?`), a: T(`At $t = ${t1}$ s, $h = ${h1}$ m; at $t = ${t2}$ s, $h = ${h2}$ m; height is greater at $t = ${h1 > h2 ? t1 : t2}$ s.`, `Pada $t = ${t1}$ s, $h = ${h1}$ m; pada $t = ${t2}$ s, $h = ${h2}$ m; ketinggian lebih besar pada $t = ${h1 > h2 ? t1 : t2}$ s.`), sp: 's' };
    },
    // MCQ: which of four x-values is outside the valid domain
    (r) => {
      const item = r.pick(AREA_NOUN);
      const P = r.pick([20, 24, 28, 32, 36, 40]);
      const half = P / 2;
      const valid = r.sample([1, 2, 3].map((k) => Math.round((half * k) / 4)).filter((v) => v > 0 && v < half), 3);
      need(valid.length === 3);
      const invalid = r.pick([half + r.int(1, 3), -r.int(1, 3)]);
      const opts = r.shuffle([...valid, invalid]);
      const c = LET[opts.indexOf(invalid)];
      const line = opts.map((o, k) => `${LET[k]}) $x = ${o}$`).join('<br>');
      return { q: T(`A ${item.en} has perimeter ${P} m and width $x$ m, modelled by $A = x(${half} - x)$. Which value of $x$ below is NOT physically valid?<br>${line}`, `Sebuah ${item.ms} mempunyai perimeter ${P} m dan lebar $x$ m, dimodelkan oleh $A = x(${half} - x)$. Nilai $x$ manakah di bawah yang TIDAK sah secara fizikal?<br>${line}`), a: T(`${c}) $x = ${invalid}$ (width must satisfy $0 < x < ${half}$)`, `${c}) $x = ${invalid}$ (lebar mesti memenuhi $0 < x < ${half}$)`), sp: 'xs' };
    },
    // MCQ: which factorised form matches a given expanded quadratic
    (r) => {
      const p = r.int(2, 8), q = r.int(1, 8);
      need(p !== q);
      const bExp = -(p + q), cExp = p * q;
      const correct = `(x - ${p})(x - ${q})`;
      const distractors = [`(x + ${p})(x + ${q})`, `(x - ${p})(x + ${q})`, `(x - ${p - 1})(x - ${q})`];
      const opts = r.shuffle([correct, ...distractors]);
      const c = LET[opts.indexOf(correct)];
      const line = opts.map((o, k) => `${LET[k]}) $${o}$`).join('<br>');
      return { q: T(`Which factorised expression is equivalent to $${q2(1, bExp, cExp)}$?<br>${line}`, `Ungkapan bentuk faktor manakah yang setara dengan $${q2(1, bExp, cExp)}$?<br>${line}`), a: T(`${c}) $${correct}$`), sp: 'xs' };
    },
    // MCQ: which value of n gives zero profit, given the factorised model
    (r) => {
      const item = r.pick(PROFIT_ITEM);
      const a = r.int(3, 10), gap = r.int(15, 35), b = a + gap;
      const correct = r.pick([a, b]);
      const wrong = [a + Math.floor(gap / 2), Math.max(0, a - r.int(1, 3)), b + r.int(1, 5)];
      need(new Set([correct, ...wrong]).size === 4);
      const opts = r.shuffle([correct, ...wrong]);
      const c = LET[opts.indexOf(correct)];
      const line = opts.map((o, k) => `${LET[k]}) $n = ${o}$`).join('<br>');
      return { q: T(`A stall's profit from selling $n$ ${item.en} is $P = -(n - ${a})(n - ${b})$. Which value of $n$ below gives exactly zero profit?<br>${line}`, `Keuntungan sebuah gerai daripada menjual $n$ ${item.ms} ialah $P = -(n - ${a})(n - ${b})$. Nilai $n$ manakah di bawah memberikan keuntungan sifar dengan tepat?<br>${line}`), a: T(`${c}) $n = ${correct}$`), sp: 'xs' };
    },
    // read coefficients off the expanded profit model
    (r) => {
      const item = r.pick(PROFIT_ITEM);
      const a = r.int(3, 10), gap = r.int(15, 35), b = a + gap;
      const bExp = a + b, cExp = -a * b;
      return { q: T(`A stall's profit from selling $n$ ${item.en} is $P = ${q2v('n', -1, bExp, cExp)}$. State the coefficient of $n^2$, the coefficient of $n$, and the constant term.`, `Keuntungan sebuah gerai daripada menjual $n$ ${item.ms} ialah $P = ${q2v('n', -1, bExp, cExp)}$. Nyatakan pekali $n^2$, pekali $n$, dan sebutan pemalar.`), a: T(`Coefficient of $n^2$ is $-1$; coefficient of $n$ is ${bExp}; constant term is ${cExp}.`, `Pekali $n^2$ ialah $-1$; pekali $n$ ialah ${bExp}; sebutan pemalar ialah ${cExp}.`), sp: 's' };
    },
    // state the area at the two roots (both give zero) — reading meaning of roots
    (r) => {
      const item = r.pick(AREA_NOUN);
      const P = r.pick([20, 24, 28, 32, 36, 40]);
      const half = P / 2;
      return { q: T(`A ${item.en} has perimeter ${P} m, modelled by $A = x(${half} - x)$ for width $x$. State the area when $x = 0$ and when $x = ${half}$, and explain in words why both give the same (degenerate) result.`, `Sebuah ${item.ms} mempunyai perimeter ${P} m, dimodelkan oleh $A = x(${half} - x)$ bagi lebar $x$. Nyatakan luas apabila $x = 0$ dan apabila $x = ${half}$, dan terangkan mengapa kedua-duanya memberikan hasil (degenerat) yang sama.`), a: T(`Both give $A = 0$ m² — at $x = 0$ there is no width, and at $x = ${half}$ there is no length left, so in both cases the rectangle collapses to a line.`, `Kedua-duanya memberikan $A = 0$ m² — pada $x = 0$ tiada lebar, dan pada $x = ${half}$ tiada panjang yang tinggal, jadi dalam kedua-dua kes segi empat tepat itu runtuh menjadi satu garis.`), sp: 's' };
    },
    // read a non-root value off a plotted parabola
    (r) => {
      const rt1 = r.int(-3, 0), rt2 = r.int(rt1 + 3, 5);
      const xm = r.int(rt1 + 1, rt2 - 1);
      need(xm !== 0);
      const f = (x) => (x - rt1) * (x - rt2);
      const xmax = rt2 + 2, xmin = rt1 - 2;
      const ymax = Math.max(f(xmin), f(xmax), 1);
      const fig = S.plane({ x: [xmin, xmax], y: [Math.min(f(xm), 0) - 1, ymax], curves: [{ f }], pts: [{ x: xm, y: f(xm), l: `x=${xm}` }] });
      return { q: T(`The graph shows $y = (x - ${rt1})(x - ${rt2})$. State the value of $y$ when $x = ${xm}$ (marked on the graph).`, `Graf menunjukkan $y = (x - ${rt1})(x - ${rt2})$. Nyatakan nilai $y$ apabila $x = ${xm}$ (ditandakan pada graf).`), a: T(`$y = ${f(xm)}$`), sp: 'xs', fig };
    },
  ];

  const g83m = [
    // projectile returns to ground (baseline-style, new noun variety)
    (r) => {
      const item = r.pick(PROJ_NOUN);
      const root = r.pick([2, 3, 4, 5, 6, 7]);
      const v = 5 * root;
      return { q: T(`The height of a ${item.en} is $h = ${v}t - 5t^2$ metres after $t$ seconds. Find the time when it returns to the ground ($h = 0$).`, `Ketinggian sebuah ${item.ms} ialah $h = ${v}t - 5t^2$ meter selepas $t$ saat. Cari masa apabila ia kembali ke tanah ($h = 0$).`), a: T(`$5t(${root} - t) = 0$; $t = ${root}$ s (reject $t = 0$)`, `$5t(${root} - t) = 0$; $t = ${root}$ s (tolak $t = 0$)`), sp: 'm' };
    },
    // explain why a target area is unachievable, using the symmetry of the roots
    (r) => {
      const item = r.pick(AREA_NOUN);
      const P = r.pick([16, 20, 24, 28, 32]) ;
      const half = P / 2;
      need(half % 2 === 0);
      const maxA = (half / 2) * (half / 2);
      const target = maxA + r.int(2, 10);
      return { q: T(`A ${item.en} has perimeter ${P} m, so its area is $A = x(${half} - x)$ for width $x$. Someone wants a design with area ${target} m². Using the symmetry between the two roots $x = 0$ and $x = ${half}$, find the greatest possible area, and explain why ${target} m² is not achievable.`, `Sebuah ${item.ms} mempunyai perimeter ${P} m, jadi luasnya ialah $A = x(${half} - x)$ bagi lebar $x$. Seseorang mahukan reka bentuk dengan luas ${target} m². Dengan menggunakan simetri antara dua punca $x = 0$ dan $x = ${half}$, cari luas terbesar yang mungkin, dan terangkan mengapa ${target} m² tidak boleh dicapai.`), a: T(`The area is greatest midway between the roots, at $x = ${half / 2}$, giving a maximum area of ${maxA} m²; since ${target} > ${maxA}, this area is impossible for this perimeter.`, `Luas adalah terbesar di pertengahan antara dua punca, pada $x = ${half / 2}$, memberikan luas maksimum ${maxA} m²; oleh sebab ${target} > ${maxA}, luas ini mustahil dicapai bagi perimeter ini.`), sp: 'm' };
    },
    // build a quadratic model from a table via second differences (baseline-style, item variety)
    (r) => {
      const item = r.pick(PROFIT_ITEM);
      const a = r.int(1, 3), b = r.int(1, 3), c = r.int(1, 4);
      const xs = [0, 1, 2, 3, 4];
      const ys = xs.map((x) => a * x * x + b * x + c);
      return { q: T(`The number of complaints about a batch of ${item.en} is recorded against a process setting $x$: ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ')}. Show that a quadratic model is suitable by finding the second differences, then state the model $y = ax^2 + bx + c$.`, `Bilangan aduan tentang sekumpulan ${item.ms} direkodkan berdasarkan tetapan proses $x$: ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ')}. Tunjukkan bahawa model kuadratik sesuai dengan mencari perbezaan kedua, kemudian nyatakan model $y = ax^2 + bx + c$.`), a: T(`Second differences all ${2 * a}: constant, so quadratic; $y = ${q2(a, b, c)}$`, `Perbezaan kedua semuanya ${2 * a}: malar, jadi kuadratik; $y = ${q2(a, b, c)}$`), sp: 'm' };
    },
    // factorise from given break-even points, then evaluate
    (r) => {
      const item = r.pick(PROFIT_ITEM);
      const a = r.int(3, 10), gap = r.int(15, 35), b = a + gap;
      const nMid = r.int(a + 1, b - 1);
      return { q: T(`A stall makes no profit selling ${a} or ${b} ${item.en} in a day, and makes a profit for any number of sales strictly between these. Write the profit model $P$ (RM) in factorised form in terms of $n$, and find the profit when $n = ${nMid}$.`, `Sebuah gerai tidak memperoleh keuntungan apabila menjual ${a} atau ${b} ${item.ms} sehari, dan memperoleh keuntungan bagi sebarang bilangan jualan yang berada ketat antara nilai ini. Tulis model keuntungan $P$ (RM) dalam bentuk faktor dari segi $n$, dan cari keuntungan apabila $n = ${nMid}$.`), a: T(`$P = -(n - ${a})(n - ${b})$; at $n = ${nMid}$, $P = $ RM${-(nMid - a) * (nMid - b)}`, `$P = -(n - ${a})(n - ${b})$; pada $n = ${nMid}$, $P = $ RM${-(nMid - a) * (nMid - b)}`), sp: 'm' };
    },
    // TF misconception: equal increases in x give equal increases in y
    (r) => {
      const a = r.int(1, 4), b = r.int(-3, 3), c = r.int(0, 6);
      const x0 = r.int(0, 3);
      const y0 = a * x0 * x0 + b * x0 + c, y1 = a * (x0 + 1) * (x0 + 1) + b * (x0 + 1) + c, y2 = a * (x0 + 2) * (x0 + 2) + b * (x0 + 2) + c;
      need(y0 >= 0 && y1 >= 0 && y2 >= 0);
      return { q: T(`True or False: for the quadratic model $y = ${q2(a, b, c)}$, equal increases in $x$ always give equal increases in $y$. Justify using $x = ${x0}, ${x0 + 1}, ${x0 + 2}$.`, `Benar atau Palsu: bagi model kuadratik $y = ${q2(a, b, c)}$, pertambahan sama dalam $x$ sentiasa memberikan pertambahan sama dalam $y$. Justifikasikan menggunakan $x = ${x0}, ${x0 + 1}, ${x0 + 2}$.`), a: T(`False — the increases are ${y1 - y0} then ${y2 - y1}, which are not equal (only the second differences of a quadratic are constant, not the first).`, `Palsu — pertambahannya ialah ${y1 - y0} kemudian ${y2 - y1}, yang tidak sama (hanya perbezaan kedua bagi kuadratik yang malar, bukan perbezaan pertama).`), sp: 'm' };
    },
    // compare/contrast: explain why a linear model would not fit this quadratic data
    (r) => {
      const item = r.pick(PROFIT_ITEM);
      const a = r.int(1, 3), b = r.int(-2, 2), c = r.int(0, 5);
      const xs = [0, 1, 2, 3];
      const ys = xs.map((x) => a * x * x + b * x + c);
      need(ys.every((y) => y >= 0));
      const diffs = ys.slice(1).map((y, i) => y - ys[i]);
      return { q: T(`Data on ${item.en} gives: ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ')}. A classmate suggests a linear model. Explain, using the first differences, why a linear model would not fit this data well, and what pattern in the differences suggests a quadratic model instead.`, `Data tentang ${item.ms} memberikan: ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ')}. Seorang rakan sekelas mencadangkan model linear. Terangkan, menggunakan perbezaan pertama, mengapa model linear tidak akan sepadan dengan baik dengan data ini, dan corak apa dalam perbezaan itu yang mencadangkan model kuadratik sebaliknya.`), a: T(`The first differences (${diffs.join(', ')}) are not constant, so a linear model does not fit; but the second differences are constant (${2 * a}), which is the signature of a quadratic model.`, `Perbezaan pertama (${diffs.join(', ')}) tidak malar, jadi model linear tidak sepadan; tetapi perbezaan kedua adalah malar (${2 * a}), iaitu ciri model kuadratik.`), sp: 'm' };
    },
    // read a feasible interval off a graph (h >= threshold)
    (r) => {
      const item = r.pick(PROJ_NOUN);
      const v = r.pick([20, 25, 30]);
      const root = v / 5;
      const thr = 5 * Math.round((root * root / 4) * 0.6);
      need(thr > 0 && v * v - 20 * thr > 0);
      const t1 = (v - Math.sqrt(v * v - 20 * thr)) / 10, t2 = (v + Math.sqrt(v * v - 20 * thr)) / 10;
      const fig = S.plane({ x: [0, root + 1], y: [0, (v * v) / 20 + 2], curves: [{ f: (t) => v * t - 5 * t * t }], segs: [{ a: [0, thr], b: [root, thr], dash: true }] });
      return { q: T(`The graph shows the height of a ${item.en}, $h = ${v}t - 5t^2$. Using the graph, estimate the interval of time during which the height is at least ${thr} m.`, `Graf menunjukkan ketinggian sebuah ${item.ms}, $h = ${v}t - 5t^2$. Menggunakan graf, anggarkan selang masa apabila ketinggian sekurang-kurangnya ${thr} m.`), a: T(`Approximately $${n(round(t1, 1))} \\le t \\le ${n(round(t2, 1))}$ (read from where the curve meets $h = ${thr}$).`, `Lebih kurang $${n(round(t1, 1))} \\le t \\le ${n(round(t2, 1))}$ (dibaca dari titik lengkung bertemu $h = ${thr}$).`), sp: 'm', fig };
    },
    // validate a model prediction against one actual data point
    (r) => {
      const item = r.pick(AREA_NOUN);
      const P = r.pick([20, 24, 28, 32, 36]);
      const half = P / 2;
      const x = r.int(2, half - 2);
      const trueA = x * (half - x);
      const dev = r.pick([-1, 1]) * r.int(1, 3);
      const measured = trueA + dev;
      need(measured > 0);
      return { q: T(`A ${item.en} of perimeter ${P} m is modelled by $A = x(${half} - x)$. At $x = ${x}$ m, the model predicts an area, but the measured area was ${measured} m². Find the model's predicted area, and comment on whether the model is reasonable.`, `Sebuah ${item.ms} berperimeter ${P} m dimodelkan oleh $A = x(${half} - x)$. Pada $x = ${x}$ m, model itu meramalkan suatu luas, tetapi luas yang diukur ialah ${measured} m². Cari luas yang diramal oleh model, dan komen sama ada model itu munasabah.`), a: T(`Predicted area $= ${trueA}$ m²; measured $= ${measured}$ m², a difference of ${Math.abs(dev)} m² — ${Math.abs(dev) <= 0.1 * trueA ? 'small, so the model is reasonable.' : 'a noticeable gap, likely due to measurement error or the rectangle not being exact.'}`, `Luas ramalan $= ${trueA}$ m²; luas diukur $= ${measured}$ m², berbeza sebanyak ${Math.abs(dev)} m² — ${Math.abs(dev) <= 0.1 * trueA ? 'kecil, jadi model itu munasabah.' : 'jurang yang ketara, mungkin disebabkan ralat pengukuran atau segi empat tepat tidak tepat.'}`), sp: 'm' };
    },
    // spot the error in an attempted factorisation of an area model
    (r) => {
      const item = r.pick(AREA_NOUN);
      const P = r.pick([20, 24, 28, 32, 36, 40]);
      const half = P / 2;
      const wrongHalf = half + r.pick([-2, -1, 1, 2]);
      need(wrongHalf > 0 && wrongHalf !== half);
      return { q: T(`A student modelled the area of a ${item.en} with perimeter ${P} m as $A = x(${wrongHalf} - x)$ for width $x$. Identify the student's error, and write the correct model.`, `Seorang pelajar memodelkan luas sebuah ${item.ms} berperimeter ${P} m sebagai $A = x(${wrongHalf} - x)$ bagi lebar $x$. Kenal pasti kesilapan pelajar itu, dan tulis model yang betul.`), a: T(`The student used $\\dfrac{${P}}{2} = ${wrongHalf}$ incorrectly; half the perimeter is actually ${half}, so the correct model is $A = x(${half} - x)$.`, `Pelajar itu menggunakan $\\dfrac{${P}}{2} = ${wrongHalf}$ secara salah; separuh perimeter sebenarnya ${half}, jadi model yang betul ialah $A = x(${half} - x)$.`), sp: 'm' };
    },
    // compare the "steepness" (constant second difference) of two quadratic patterns
    (r) => {
      const itemA = r.pick(PROJ_NOUN), itemB = r.pick(PROFIT_ITEM);
      need(itemA.en !== itemB.en);
      const aA = r.int(1, 3), aB = r.int(1, 3);
      need(aA !== aB);
      const xs = [0, 1, 2, 3];
      const ysA = xs.map((x) => 5 * aA * x * x), ysB = xs.map((x) => aB * x * x + 2 * x + 1);
      return { q: T(`Two quadratic models give: for a ${itemA.en}, $y$-values ${ysA.join(', ')} at $x = ${xs.join(', ')}$; for ${itemB.en}, $y$-values ${ysB.join(', ')} at the same $x$-values. Which model has the larger constant second difference, and what does a larger second difference tell you about the shape of the graph?`, `Dua model kuadratik memberikan: bagi ${itemA.ms}, nilai $y$ ${ysA.join(', ')} pada $x = ${xs.join(', ')}$; bagi ${itemB.ms}, nilai $y$ ${ysB.join(', ')} pada nilai $x$ yang sama. Model manakah mempunyai perbezaan kedua malar yang lebih besar, dan apakah maksud perbezaan kedua yang lebih besar terhadap bentuk graf?`), a: T(`Second differences: ${itemA.en} = ${10 * aA}, ${itemB.en} = ${2 * aB}; the ${10 * aA > 2 * aB ? itemA.en : itemB.en} model has the larger second difference, meaning its graph curves more sharply (larger $a$).`, `Perbezaan kedua: ${itemA.ms} = ${10 * aA}, ${itemB.ms} = ${2 * aB}; model ${10 * aA > 2 * aB ? itemA.ms : itemB.ms} mempunyai perbezaan kedua yang lebih besar, bermaksud grafnya melengkung dengan lebih tajam ($a$ lebih besar).`), sp: 'm' };
    },
  ];

  const g83a = [
    // full pen/roots multi-part with the swapped-root explanation (baseline-style, new noun)
    // full pen/roots multi-part with the swapped-root explanation (baseline-style, new noun)
    (r) => {
      const item = r.pick(AREA_NOUN);
      const w = r.int(4, 9), P = r.pick([24, 28, 32, 36]);
      const l = P / 2 - w;
      need(l !== w && l > 0);
      const parts = [T(`Write the area $A$ as a function of the width $x$.`, `Tulis luas $A$ sebagai fungsi lebar $x$.`), T(`Find $x$ when the area is ${w * l} m².`, `Cari $x$ apabila luasnya ${w * l} m².`), T(`Explain why the two solutions of part (b) both describe the same physical ${item.en}.`, `Terangkan mengapa kedua-dua penyelesaian bahagian (b) menerangkan ${item.ms} yang sama secara fizikal.`)];
      const ansParts = [T(`$A = x(${P / 2} - x)$`), T(`$x^2 - ${P / 2}x + ${w * l} = 0$; $x = ${w}$ or $x = ${l}$`), T(`One root is the width and the other is the length — swapping which side is called "width" gives the same rectangle.`, `Satu punca ialah lebar dan satu lagi ialah panjang — menukar sisi mana yang dipanggil "lebar" memberikan segi empat tepat yang sama.`)];
      return { q: T(`A ${item.en} has perimeter ${P} m.<br>${SPM.parts(parts).en}`, `Sebuah ${item.ms} mempunyai perimeter ${P} m.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // max area via symmetry + domain restriction, multi-part
    (r) => {
      const item = r.pick(AREA_NOUN);
      const P = r.pick([16, 20, 24, 28, 32, 36]);
      const half = P / 2;
      need(half % 2 === 0);
      const parts = [T(`Write the area model $A(x) = x(${half} - x)$, and state the domain of $x$ for which this model is physically meaningful.`, `Tulis model luas $A(x) = x(${half} - x)$, dan nyatakan domain $x$ supaya model ini bermakna secara fizikal.`), T(`Using the symmetry between the roots $x = 0$ and $x = ${half}$, find the width that gives the greatest area, and state that greatest area.`, `Dengan menggunakan simetri antara punca $x = 0$ dan $x = ${half}$, cari lebar yang memberikan luas terbesar, dan nyatakan luas terbesar itu.`)];
      const xOpt = half / 2, maxA = xOpt * xOpt;
      const ansParts = [T(`$0 < x < ${half}$ (both the width and the length, ${half} - x, must be positive).`, `$0 < x < ${half}$ (lebar dan panjang, ${half} - x, kedua-duanya mestilah positif).`), T(`$x = ${xOpt}$ m gives the greatest area, $A = ${maxA}$ m² (a square).`, `$x = ${xOpt}$ m memberikan luas terbesar, $A = ${maxA}$ m² (sebuah segi empat sama).`)];
      return { q: T(`A ${item.en} has perimeter ${P} m and width $x$ m.<br>${SPM.parts(parts).en}`, `Sebuah ${item.ms} mempunyai perimeter ${P} m dan lebar $x$ m.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // full profit cycle: formulate, solve for a target profit, state domain
    (r) => {
      const item = r.pick(PROFIT_ITEM);
      const a = r.int(3, 8), gap = r.pick([16, 20, 24]), b = a + gap;
      const mid = (a + b) / 2;
      need(Number.isInteger(mid));
      const target = ((b - a) / 2) * ((b - a) / 2) - r.pick([1, 4, 9]);
      need(target > 0);
      const disc = (b - a) * (b - a) / 4 - target;
      need(disc > 0 && Number.isInteger(Math.round(Math.sqrt(disc))) && Math.sqrt(disc) === Math.round(Math.sqrt(disc)));
      const rt = Math.sqrt(disc);
      const n1 = mid - rt, n2 = mid + rt;
      need(Number.isInteger(n1) && Number.isInteger(n2));
      const parts = [T(`Write the profit model $P$ (RM) in expanded form $P = an^2 + bn + c$, given break-even points at $n = ${a}$ and $n = ${b}$.`, `Tulis model keuntungan $P$ (RM) dalam bentuk kembang $P = an^2 + bn + c$, dengan titik pulang modal pada $n = ${a}$ dan $n = ${b}$.`), T(`Find the values of $n$ for which the profit is RM${target}.`, `Cari nilai $n$ apabila keuntungan ialah RM${target}.`), T(`State the domain of $n$ for which the stall actually makes a profit, and explain why values of $n$ outside the break-even points are not shown as "profit" here.`, `Nyatakan domain $n$ supaya gerai itu benar-benar memperoleh keuntungan, dan terangkan mengapa nilai $n$ di luar titik pulang modal tidak ditunjukkan sebagai "keuntungan" di sini.`)];
      const ansParts = [T(`$P = -(n - ${a})(n - ${b}) = ${q2v('n', -1, a + b, -a * b)}$`), T(`$n = ${n1}$ or $n = ${n2}$`), T(`$${a} < n < ${b}$; outside this range the factors $(n-${a})$ and $(n-${b})$ have the same sign, making $P$ negative (a loss), so it is not profit.`, `$${a} < n < ${b}$; di luar julat ini, faktor $(n-${a})$ dan $(n-${b})$ mempunyai tanda yang sama, menjadikan $P$ negatif (kerugian), jadi ia bukan keuntungan.`)];
      return { q: T(`A stall's profit from selling $n$ ${item.en} breaks even at $n = ${a}$ and $n = ${b}$.<br>${SPM.parts(parts).en}`, `Keuntungan sebuah gerai daripada menjual $n$ ${item.ms} pulang modal pada $n = ${a}$ dan $n = ${b}$.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // validate against two actual data points + state a limitation
    (r) => {
      const item = r.pick(PROJ_NOUN);
      const root = r.pick([4, 5, 6, 7, 8]);
      const v = 5 * root;
      const t1 = r.int(1, root - 1), t2 = r.int(1, root - 1);
      need(t1 !== t2);
      const pred1 = v * t1 - 5 * t1 * t1, pred2 = v * t2 - 5 * t2 * t2;
      const dev1 = r.pick([-1, 1]) * r.int(1, 2), dev2 = r.pick([-1, 1]) * r.int(1, 2);
      const actual1 = pred1 + dev1, actual2 = pred2 + dev2;
      need(actual1 > 0 && actual2 > 0);
      return { q: T(`A model for the height of a ${item.en} is $h = ${v}t - 5t^2$. Measurements gave ${actual1} m at $t = ${t1}$ s and ${actual2} m at $t = ${t2}$ s. Compare these with the model's predictions, comment on whether the model is validated, and state one limitation of this quadratic model.`, `Suatu model bagi ketinggian sebuah ${item.ms} ialah $h = ${v}t - 5t^2$. Ukuran memberikan ${actual1} m pada $t = ${t1}$ s dan ${actual2} m pada $t = ${t2}$ s. Bandingkan ini dengan ramalan model itu, komen sama ada model itu disahkan, dan nyatakan satu had model kuadratik ini.`), a: T(`Predicted: ${pred1} m and ${pred2} m; differences of ${Math.abs(dev1)} m and ${Math.abs(dev2)} m are small, so the model is reasonably well validated. Limitation: the model is only meaningful while $0 \\le t \\le ${root}$ (while the ${item.en} is in the air).`, `Ramalan: ${pred1} m dan ${pred2} m; perbezaan ${Math.abs(dev1)} m dan ${Math.abs(dev2)} m adalah kecil, jadi model itu disahkan dengan agak baik. Had: model ini hanya bermakna semasa $0 \\le t \\le ${root}$ (semasa ${item.ms} berada di udara).`), sp: 'l' };
    },
    // compare quadratic vs exponential family from a table, then discuss interpolation/extrapolation
    (r) => {
      const item = r.pick(PROFIT_ITEM);
      const a = r.int(1, 3), b = r.int(-2, 2), c = r.int(1, 5);
      const xs = [0, 1, 2, 3];
      const ys = xs.map((x) => a * x * x + b * x + c);
      need(ys.every((y) => y > 0));
      const diffs = ys.slice(1).map((y, i) => y - ys[i]);
      const ratios = ys.slice(1).map((y, i) => n(round(y / ys[i], 2)));
      const xPred = 5;
      const yPred = a * xPred * xPred + b * xPred + c;
      return { q: T(`Data on ${item.en}: ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ')}. A quadratic model and an exponential model are both proposed. Decide which family fits, using differences and ratios, then use your chosen model to predict the value at $x = ${xPred}$, stating whether this is interpolation or extrapolation.`, `Data tentang ${item.ms}: ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ')}. Model kuadratik dan model eksponen kedua-duanya dicadangkan. Tentukan keluarga manakah yang sepadan, menggunakan perbezaan dan nisbah, kemudian gunakan model pilihan anda untuk meramal nilai pada $x = ${xPred}$, dengan menyatakan sama ada ini interpolasi atau ekstrapolasi.`), a: T(`First differences ${diffs.join(', ')} are not constant, but second differences are constant (${2 * a}), so it is quadratic, not exponential (ratios ${ratios.join(', ')} are not constant either). Predicted value at $x = ${xPred}$ is $y = ${yPred}$; this is extrapolation, since $x = ${xPred}$ is beyond the data range $[0, 3]$.`, `Perbezaan pertama ${diffs.join(', ')} tidak malar, tetapi perbezaan kedua malar (${2 * a}), jadi ia kuadratik, bukan eksponen (nisbah ${ratios.join(', ')} juga tidak malar). Nilai ramalan pada $x = ${xPred}$ ialah $y = ${yPred}$; ini ialah ekstrapolasi, kerana $x = ${xPred}$ berada di luar julat data $[0, 3]$.`), sp: 'm' };
    },
    // construct your own example
    (r) => {
      const a = r.pick([1, 2]), rt1 = 0, rt2 = r.int(4, 10);
      return { q: T(`Describe a real-life situation that could be modelled by $y = ${a}x(${rt2} - x)$ for $0 \\le x \\le ${rt2}$, stating clearly what $x$ and $y$ represent (with units) and why the domain is restricted to $0 \\le x \\le ${rt2}$.`, `Terangkan satu situasi kehidupan sebenar yang boleh dimodelkan oleh $y = ${a}x(${rt2} - x)$ bagi $0 \\le x \\le ${rt2}$, dengan menyatakan dengan jelas apa yang diwakili oleh $x$ dan $y$ (berserta unit) dan mengapa domainnya terhad kepada $0 \\le x \\le ${rt2}$.`), a: T(`Any correct context works, for example: $x$ = width (m) of a rectangular plot with perimeter ${2 * rt2} m, $y$ = area (m²); the domain is restricted because both the width $x$ and the length $(${rt2} - x)$ must stay positive.`, `Sebarang konteks yang betul boleh diterima, contohnya: $x$ = lebar (m) sebidang tanah segi empat tepat berperimeter ${2 * rt2} m, $y$ = luas (m²); domain terhad kerana lebar $x$ dan panjang $(${rt2} - x)$ mestilah kekal positif.`), sp: 'm' };
    },
    // feasibility check branching on whether the target area is achievable
    (r) => {
      const item = r.pick(AREA_NOUN);
      const P = r.pick([16, 20, 24, 28, 32]);
      const half = P / 2;
      need(half % 2 === 0);
      const maxA = (half / 2) * (half / 2);
      const achievable = r.chance();
      const target = achievable ? r.int(Math.max(1, maxA - 8), maxA - 1) : maxA + r.int(2, 8);
      const parts = [T(`Find the greatest possible area, using the symmetry of the roots $x = 0$ and $x = ${half}$.`, `Cari luas terbesar yang mungkin, menggunakan simetri punca $x = 0$ dan $x = ${half}$.`), T(`State whether a design with area ${target} m² is achievable. If it is, find the width(s) $x$ that give it; if not, explain why not.`, `Nyatakan sama ada reka bentuk dengan luas ${target} m² boleh dicapai. Jika boleh, cari lebar $x$ yang memberikannya; jika tidak, terangkan mengapa tidak.`)];
      let secondAns;
      if (achievable) {
        const disc = (half / 2) * (half / 2) - target;
        const rt = Math.sqrt(disc);
        if (Number.isInteger(rt)) {
          secondAns = T(`Achievable: $x = ${half / 2 - rt}$ m or $x = ${half / 2 + rt}$ m.`, `Boleh dicapai: $x = ${half / 2 - rt}$ m atau $x = ${half / 2 + rt}$ m.`);
        } else {
          secondAns = T(`Achievable, since ${target} m² $\\le ${maxA}$ m² (the maximum); solving $x(${half} - x) = ${target}$ gives the width(s).`, `Boleh dicapai, kerana ${target} m² $\\le ${maxA}$ m² (nilai maksimum); menyelesaikan $x(${half} - x) = ${target}$ memberikan lebar.`);
        }
      } else {
        secondAns = T(`Not achievable, since ${target} m² > ${maxA} m² (the maximum possible area for this perimeter).`, `Tidak boleh dicapai, kerana ${target} m² > ${maxA} m² (luas maksimum yang mungkin bagi perimeter ini).`);
      }
      const ansParts = [T(`Maximum area $= ${maxA}$ m², at $x = ${half / 2}$ m.`, `Luas maksimum $= ${maxA}$ m², pada $x = ${half / 2}$ m.`), secondAns];
      return { q: T(`A ${item.en} has perimeter ${P} m and width $x$ m, so $A = x(${half} - x)$.<br>${SPM.parts(parts).en}`, `Sebuah ${item.ms} mempunyai perimeter ${P} m dan lebar $x$ m, jadi $A = x(${half} - x)$.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // projectile: time of flight, max height via symmetry, and domain — multi-part
    (r) => {
      const item = r.pick(PROJ_NOUN);
      const root = r.pick([4, 6, 8]);
      const v = 5 * root;
      const parts = [T(`Find the time when the ${item.en} returns to the ground ($h = 0$), by factorising $h = ${v}t - 5t^2$.`, `Cari masa apabila ${item.ms} kembali ke tanah ($h = 0$), dengan memfaktorkan $h = ${v}t - 5t^2$.`), T(`Using the symmetry between the two roots, find the time at which the height is greatest, and state this greatest height.`, `Dengan menggunakan simetri antara dua punca itu, cari masa apabila ketinggian adalah terbesar, dan nyatakan ketinggian terbesar itu.`), T(`State the domain of $t$ for which this model is physically meaningful.`, `Nyatakan domain $t$ supaya model ini bermakna secara fizikal.`)];
      const tMax = root / 2, hMax = v * tMax - 5 * tMax * tMax;
      const ansParts = [T(`$5t(${root} - t) = 0$; $t = 0$ or $t = ${root}$ s.`, `$5t(${root} - t) = 0$; $t = 0$ atau $t = ${root}$ s.`), T(`$t = ${tMax}$ s (midway between the roots); greatest height $= ${hMax}$ m.`, `$t = ${tMax}$ s (di pertengahan antara dua punca); ketinggian terbesar $= ${hMax}$ m.`), T(`$0 \\le t \\le ${root}$ (while the ${item.en} is above the ground).`, `$0 \\le t \\le ${root}$ (semasa ${item.ms} berada di atas tanah).`)];
      return { q: T(`The height of a ${item.en} thrown upwards is $h = ${v}t - 5t^2$ metres after $t$ seconds.<br>${SPM.parts(parts).en}`, `Ketinggian sebuah ${item.ms} yang dilontar ke atas ialah $h = ${v}t - 5t^2$ meter selepas $t$ saat.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // explain why predicting outside the domain is a hard violation, not just less reliable
    (r) => {
      const item = r.pick(AREA_NOUN);
      const P = r.pick([20, 24, 28, 32, 36]);
      const half = P / 2;
      const xin = r.int(1, half - 1);
      const xout = half + r.int(1, 4);
      const parts = [T(`Find the area when $x = ${xin}$ m.`, `Cari luas apabila $x = ${xin}$ m.`), T(`Someone asks for the area when $x = ${xout}$ m. Explain why the model $A = x(${half} - x)$ cannot sensibly be used here, unlike a linear model's extrapolation which just becomes less reliable further out.`, `Seseorang meminta luas apabila $x = ${xout}$ m. Terangkan mengapa model $A = x(${half} - x)$ tidak boleh digunakan secara munasabah di sini, tidak seperti ekstrapolasi model linear yang hanya menjadi kurang boleh dipercayai apabila lebih jauh.`)];
      const ansParts = [T(`${xin * (half - xin)} m²`), T(`At $x = ${xout}$ m, the length $(${half} - x)$ would be ${half - xout} m, which is negative — this is not merely less reliable, it is physically impossible, since a rectangle cannot have a negative side length.`, `Pada $x = ${xout}$ m, panjang $(${half} - x)$ ialah ${half - xout} m, iaitu negatif — ini bukan sekadar kurang boleh dipercayai, ia mustahil secara fizikal, kerana segi empat tepat tidak boleh mempunyai sisi negatif.`)];
      return { q: T(`A ${item.en} has perimeter ${P} m and width $x$ m, so $A = x(${half} - x)$.<br>${SPM.parts(parts).en}`, `Sebuah ${item.ms} mempunyai perimeter ${P} m dan lebar $x$ m, jadi $A = x(${half} - x)$.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // justify choosing a quadratic model from a qualitative description (no table)
    (r) => {
      const item = r.pick(PROFIT_ITEM);
      return { q: T(`A stall owner says: "As I sell more ${item.en}, my profit rises at first, but if I try to sell far more than my usual stock (by discounting heavily), my profit falls again." Explain why a quadratic model is more appropriate here than a linear model, and sketch what a table of second differences would show if the data were collected.`, `Pemilik gerai berkata: "Apabila saya menjual lebih banyak ${item.ms}, keuntungan saya meningkat pada mulanya, tetapi jika saya cuba menjual jauh lebih banyak daripada stok biasa (dengan memberi diskaun besar-besaran), keuntungan saya jatuh semula." Terangkan mengapa model kuadratik lebih sesuai di sini berbanding model linear, dan lakarkan apa yang akan ditunjukkan oleh jadual perbezaan kedua jika data itu dikumpul.`), a: T(`A linear model can only keep rising or keep falling, but here profit rises then falls, which a quadratic (one turning point) can capture; if data were collected at equal intervals, the second differences of profit would be constant and negative (profit curves downward like an upside-down parabola).`, `Model linear hanya boleh terus meningkat atau terus menurun, tetapi di sini keuntungan meningkat kemudian menurun, yang boleh digambarkan oleh model kuadratik (satu titik pusingan); jika data dikumpul pada selang sama, perbezaan kedua keuntungan akan malar dan negatif (keuntungan melengkung ke bawah seperti parabola terbalik).`), sp: 'm' };
    },
    // refine an assumption after the model over/under-predicts the whole flight
    (r) => {
      const item = r.pick(PROJ_NOUN);
      const root = r.pick([4, 5, 6, 7, 8]);
      const v = 5 * root;
      const measuredRoot = root + r.pick([-1, 1]);
      need(measuredRoot > 0);
      const parts = [T(`According to the model, find the greatest height reached (using the symmetry of the roots $t = 0$ and $t = ${root}$).`, `Menurut model itu, cari ketinggian terbesar yang dicapai (menggunakan simetri punca $t = 0$ dan $t = ${root}$).`), T(`In reality, the ${item.en} landed at $t = ${measuredRoot}$ s, not $t = ${root}$ s as the model predicts. Suggest one assumption of the model ($h = ${v}t - 5t^2$ assumes no air resistance) that could explain this difference, and state whether the model over- or under-estimated the time of flight.`, `Pada hakikatnya, ${item.ms} itu mendarat pada $t = ${measuredRoot}$ s, bukan $t = ${root}$ s seperti yang diramalkan model. Cadangkan satu andaian model ($h = ${v}t - 5t^2$ mengandaikan tiada rintangan udara) yang boleh menjelaskan perbezaan ini, dan nyatakan sama ada model itu melebih atau mengurang anggaran masa penerbangan.`)];
      const tMax = root / 2, hMax = v * tMax - 5 * tMax * tMax;
      const ansParts = [T(`$t = ${tMax}$ s; greatest height $= ${hMax}$ m.`, `$t = ${tMax}$ s; ketinggian terbesar $= ${hMax}$ m.`), T(`Air resistance (ignored by the model) would slow the ${item.en} and shorten its flight; the model ${measuredRoot < root ? 'over-estimated' : 'under-estimated'} the time of flight ($${root}$ s predicted vs $${measuredRoot}$ s actual).`, `Rintangan udara (diabaikan oleh model) akan memperlahankan ${item.ms} dan memendekkan penerbangannya; model itu ${measuredRoot < root ? 'melebih anggaran' : 'mengurang anggaran'} masa penerbangan ($${root}$ s diramal berbanding $${measuredRoot}$ s sebenar).`)];
      return { q: T(`A model for the height of a ${item.en} is $h = ${v}t - 5t^2$ metres after $t$ seconds.<br>${SPM.parts(parts).en}`, `Suatu model bagi ketinggian sebuah ${item.ms} ialah $h = ${v}t - 5t^2$ meter selepas $t$ saat.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
  ];
  SPM.extend('F5-8.3', { e: g83e, m: g83m, a: g83a });

  /* =============================================================== 8.4 Exponential models */
  const EXPCTX = SCEN.filter((s) => s.fam === 'exponential').concat([
    { d: T('the population of a small fast-growing town', 'populasi sebuah bandar kecil yang pesat berkembang'), v: T('the population', 'populasi'), x: T('the number of years', 'bilangan tahun'), as: T('the percentage growth rate stays the same each year', 'kadar pertumbuhan peratus kekal sama setiap tahun'), fam: 'exponential', dir: 1 },
    { d: T('the number of downloads of a popular mobile app', 'bilangan muat turun sebuah aplikasi mudah alih yang popular'), v: T('the number of downloads', 'bilangan muat turun'), x: T('the number of days since launch', 'bilangan hari sejak dilancarkan'), as: T('downloads grow by the same percentage each day', 'muat turun bertambah dengan peratusan yang sama setiap hari'), fam: 'exponential', dir: 1 },
    { d: T("a block of ice's mass as it melts", 'jisim seketul ais apabila ia mencair'), v: T('the mass of ice remaining', 'jisim ais yang tinggal'), x: T('the time since melting started (minutes)', 'masa sejak pencairan bermula (minit)'), as: T('the mass decreases by the same percentage each minute', 'jisimnya berkurang dengan peratusan yang sama setiap minit'), fam: 'exponential', dir: -1 },
    { d: T('the resale value of a laptop', 'nilai jualan semula sebuah komputer riba'), v: T('the resale value', 'nilai jualan semula'), x: T('its age in years', 'usianya dalam tahun'), as: T('the value drops by the same percentage each year', 'nilainya jatuh dengan peratusan yang sama setiap tahun'), fam: 'exponential', dir: -1 },
  ]);
  const bPct = (rate, ctx) => (ctx.dir === 1 ? 1 + rate / 100 : 1 - rate / 100);

  const g84e = [
    // evaluate a percentage growth/decay model
    (r) => {
      const s = r.pick(EXPCTX);
      const a0 = r.pick([50, 100, 200, 400]);
      const rate = r.pick([2, 5, 10, 15, 20]);
      const b = bPct(rate, s);
      const t = r.int(2, 4);
      return { q: T(`For ${s.d.en}, the model is $y = ${a0}(${n(b)})^x$, starting at ${a0} and changing by ${rate}% each period. Find the value when $x = ${t}$.`, `Bagi ${s.d.ms}, modelnya ialah $y = ${a0}(${n(b)})^x$, bermula pada ${a0} dan berubah sebanyak ${rate}% setiap tempoh. Cari nilainya apabila $x = ${t}$.`), a: T(`${n(round(a0 * Math.pow(b, t), 2))}`), sp: 's' };
    },
    // evaluate a clean-ratio model (integer base)
    (r) => {
      const s = r.pick(EXPCTX.filter((c) => c.dir === 1));
      const a0 = r.pick([2, 3, 5]), b = r.pick([2, 3]);
      const t = r.int(2, 4);
      return { q: T(`For ${s.d.en}, the model is $y = ${a0}(${b})^x$. Find the value when $x = ${t}$.`, `Bagi ${s.d.ms}, modelnya ialah $y = ${a0}(${b})^x$. Cari nilainya apabila $x = ${t}$.`), a: T(`${a0 * Math.pow(b, t)}`), sp: 's' };
    },
    // identify growth or decay and the percentage rate, from b
    (r) => {
      const growth = r.chance();
      const rate = r.pick([2, 4, 5, 8, 10, 15, 20, 25]);
      const b = growth ? 1 + rate / 100 : 1 - rate / 100;
      return { q: T(`A model is $y = a(${n(b)})^x$. State whether this represents growth or decay, and the percentage rate per period.`, `Suatu model ialah $y = a(${n(b)})^x$. Nyatakan sama ada ini mewakili pertumbuhan atau penyusutan, dan kadar peratus bagi setiap tempoh.`), a: T(`${growth ? 'Growth' : 'Decay'} of ${rate}% per period.`, `${growth ? 'Pertumbuhan' : 'Penyusutan'} sebanyak ${rate}% bagi setiap tempoh.`), sp: 'xs' };
    },
    // construct the model from a worded percentage description
    (r) => {
      const s = r.pick(EXPCTX);
      const a0 = r.pick([50, 100, 150, 200, 300]);
      const rate = r.pick([2, 5, 8, 10, 15, 20]);
      const b = bPct(rate, s);
      return { q: T(`For ${s.d.en}, the starting value is ${a0} and it ${s.dir === 1 ? 'increases' : 'decreases'} by ${rate}% each period. Write the model $y = ab^x$.`, `Bagi ${s.d.ms}, nilai permulaan ialah ${a0} dan ia ${s.dir === 1 ? 'bertambah' : 'berkurang'} sebanyak ${rate}% setiap tempoh. Tulis model $y = ab^x$.`), a: T(`$y = ${a0}(${n(b)})^x$`), sp: 's' };
    },
    // read a and b directly off a 3-row table (clean ratio)
    (r) => {
      const s = r.pick(EXPCTX.filter((c) => c.dir === 1));
      const a0 = r.pick([2, 3, 4, 5]), b = r.pick([2, 3]);
      const xs = [0, 1, 2];
      const tab = SPM.table([['$x$', ...xs], ['$y$', ...xs.map((x) => a0 * Math.pow(b, x))]]);
      return { q: T(`The table shows values for ${s.d.en} that follow an exponential model.<br>${tab}<br>State the values of $a$ and $b$ in the model $y = ab^x$.`, `Jadual menunjukkan nilai bagi ${s.d.ms} yang mengikut model eksponen.<br>${tab}<br>Nyatakan nilai $a$ dan $b$ dalam model $y = ab^x$.`), a: T(`$a = ${a0}$, $b = ${b}$`), sp: 's' };
    },
    // MCQ: what happens to y as x increases, for growth vs decay
    (r) => {
      const growth = r.chance();
      const rate = r.pick([5, 10, 15, 20]);
      const b = growth ? 1 + rate / 100 : 1 - rate / 100;
      const correct = growth ? T('increases without bound as $x$ increases', 'bertambah tanpa had apabila $x$ bertambah') : T('decreases towards 0 as $x$ increases (but never reaches 0)', 'berkurang menghampiri 0 apabila $x$ bertambah (tetapi tidak pernah mencapai 0)');
      const wrong = [T('increases then decreases', 'bertambah kemudian berkurang'), T('stays constant', 'kekal malar'), T('decreases then increases', 'berkurang kemudian bertambah')];
      const opts = r.shuffle([correct, ...wrong]);
      const c = LET[opts.indexOf(correct)];
      const line = (lang) => opts.map((o, k) => `${LET[k]}) ${o[lang]}`).join('<br>');
      return { q: T(`For the model $y = a(${n(b)})^x$ with $a > 0$, what happens to $y$ as $x$ increases?<br>${line('en')}`, `Bagi model $y = a(${n(b)})^x$ dengan $a > 0$, apakah yang berlaku kepada $y$ apabila $x$ bertambah?<br>${line('ms')}`), a: T(`${c}) ${correct.en}`, `${c}) ${correct.ms}`), sp: 'xs' };
    },
    // read a value off a plotted exponential curve
    (r) => {
      const s = r.pick(EXPCTX.filter((c) => c.dir === 1));
      const a0 = r.pick([2, 3]), b = r.pick([2, 3]);
      const xm = r.int(1, 3);
      const fig = S.graph({ w: 300, h: 200, xr: [0, 4, 1], yr: [0, a0 * Math.pow(b, 4), Math.round((a0 * Math.pow(b, 4)) / 4)], series: [{ type: 'line', pts: [0, 1, 2, 3, 4].map((x) => [x, a0 * Math.pow(b, x)]), dotsToo: true }] });
      return { q: T(`The graph shows an exponential model $y = ${a0}(${b})^x$ for ${s.d.en}. Read off the value of $y$ when $x = ${xm}$.`, `Graf menunjukkan model eksponen $y = ${a0}(${b})^x$ bagi ${s.d.ms}. Baca nilai $y$ apabila $x = ${xm}$.`), a: T(`$y = ${a0 * Math.pow(b, xm)}$`), sp: 'xs', fig };
    },
    // true/false: b > 1 always means the value is increasing (simple recall check)
    (r) => {
      const b = r.pick([0.7, 0.8, 0.85, 0.9, 1.1, 1.15, 1.2, 1.3]);
      const claimGrowth = r.chance();
      const isTrue = claimGrowth === (b > 1);
      return { q: T(`True or False: in the model $y = a(${n(b)})^x$ with $a > 0$, the value is ${claimGrowth ? 'increasing' : 'decreasing'} as $x$ increases.`, `Benar atau Palsu: dalam model $y = a(${n(b)})^x$ dengan $a > 0$, nilainya ${claimGrowth ? 'bertambah' : 'berkurang'} apabila $x$ bertambah.`), a: T(`${isTrue ? 'True' : 'False'} — since $b ${b > 1 ? '> 1' : '< 1'}$, the model represents ${b > 1 ? 'growth (increasing)' : 'decay (decreasing)'}.`, `${isTrue ? 'Benar' : 'Palsu'} — kerana $b ${b > 1 ? '> 1' : '< 1'}$, model ini mewakili ${b > 1 ? 'pertumbuhan (bertambah)' : 'penyusutan (berkurang)'}.`), sp: 'xs' };
    },
    // state the value at x = 0 directly (meaning of a)
    (r) => {
      const s = r.pick(EXPCTX);
      const a0 = r.pick([50, 100, 150, 200, 300]);
      const rate = r.pick([5, 10, 15, 20]);
      const b = bPct(rate, s);
      return { q: T(`For ${s.d.en}, the model is $y = ${a0}(${n(b)})^x$. State the value when $x = 0$, and explain what this represents.`, `Bagi ${s.d.ms}, modelnya ialah $y = ${a0}(${n(b)})^x$. Nyatakan nilai apabila $x = 0$, dan terangkan apa yang diwakilinya.`), a: T(`$y = ${a0}$ when $x = 0$; this represents the starting/initial value.`, `$y = ${a0}$ apabila $x = 0$; ini mewakili nilai permulaan/awal.`), sp: 's' };
    },
  ];

  const g84m = [
    // build a model from a table of ratios (baseline-style, EXPCTX variety)
    (r) => {
      const s = r.pick(EXPCTX.filter((c) => c.dir === 1));
      const a0 = r.pick([2, 3, 5]), b = r.pick([2, 3]);
      const xs = [0, 1, 2, 3], ys = xs.map((x) => a0 * Math.pow(b, x));
      return { q: T(`For ${s.d.en}, the values are ${ys.join(', ')} at $x = 0, 1, 2, 3$. Show that the ratios of successive values are constant, and find the model $y = ab^x$.`, `Bagi ${s.d.ms}, nilainya ialah ${ys.join(', ')} pada $x = 0, 1, 2, 3$. Tunjukkan bahawa nisbah nilai berturutan adalah malar, dan cari model $y = ab^x$.`), a: T(`Ratios $${ys[1] / ys[0]}$, $${ys[2] / ys[1]}$, $${ys[3] / ys[2]}$ are all ${b}; $a = ${a0}$, $b = ${b}$; $y = ${a0}(${b})^x$`, `Nisbah $${ys[1] / ys[0]}$, $${ys[2] / ys[1]}$, $${ys[3] / ys[2]}$ semuanya ${b}; $a = ${a0}$, $b = ${b}$; $y = ${a0}(${b})^x$`), sp: 'm' };
    },
    // find the percentage rate from two consecutive readings
    (r) => {
      const s = r.pick(EXPCTX);
      const a0 = r.pick([100, 200, 400]);
      const rate = r.pick([5, 10, 15, 20, 25]);
      const b = bPct(rate, s);
      const a1 = round(a0 * b, 2);
      return { q: T(`For ${s.d.en}, the value was ${a0} at $x = 0$ and ${n(a1)} at $x = 1$. Find the percentage rate of ${s.dir === 1 ? 'growth' : 'decay'} per period.`, `Bagi ${s.d.ms}, nilainya ialah ${a0} pada $x = 0$ dan ${n(a1)} pada $x = 1$. Cari kadar peratus ${s.dir === 1 ? 'pertumbuhan' : 'penyusutan'} bagi setiap tempoh.`), a: T(`$b = ${n(a1)} / ${a0} = ${n(b)}$, so the rate is ${rate}% ${s.dir === 1 ? 'growth' : 'decay'}.`, `$b = ${n(a1)} / ${a0} = ${n(b)}$, jadi kadarnya ${rate}% ${s.dir === 1 ? 'pertumbuhan' : 'penyusutan'}.`), sp: 'm' };
    },
    // trial search for a target multiple (clean version, at m level)
    (r) => {
      const s = r.pick(EXPCTX.filter((c) => c.dir === 1));
      const a0 = r.pick([50, 100, 200]), rate = r.pick([10, 20, 25]);
      const b = 1 + rate / 100;
      const target = 2 * a0;
      let t = 0, v = a0;
      while (v < target) { v *= b; t++; }
      return { q: T(`For ${s.d.en}, the model is $y = ${a0}(${n(b)})^x$. By trying values of $x$, find the smallest whole number of periods for the value to at least double.`, `Bagi ${s.d.ms}, modelnya ialah $y = ${a0}(${n(b)})^x$. Dengan mencuba nilai $x$, cari bilangan tempoh bulat terkecil supaya nilainya sekurang-kurangnya berganda dua.`), a: T(`$x = ${t}$ (value $\\approx ${n(round(v, 1))}$)`, `$x = ${t}$ (nilai $\\approx ${n(round(v, 1))}$)`), sp: 'm' };
    },
    // compare a growth model and a decay model at a stated x
    (r) => {
      const [sg, sd] = [r.pick(EXPCTX.filter((c) => c.dir === 1)), r.pick(EXPCTX.filter((c) => c.dir === -1))];
      const a0 = r.pick([100, 150, 200]);
      const rg = r.pick([5, 10, 15]), rd = r.pick([5, 10, 15]);
      const t = r.int(2, 4);
      const vg = round(a0 * Math.pow(1 + rg / 100, t), 1), vd = round(a0 * Math.pow(1 - rd / 100, t), 1);
      return { q: T(`Model 1 (for ${sg.d.en}) is $y = ${a0}(${n(1 + rg / 100)})^x$; Model 2 (for ${sd.d.en}) is $y = ${a0}(${n(1 - rd / 100)})^x$. Which gives the larger value at $x = ${t}$, and by how much?`, `Model 1 (bagi ${sg.d.ms}) ialah $y = ${a0}(${n(1 + rg / 100)})^x$; Model 2 (bagi ${sd.d.ms}) ialah $y = ${a0}(${n(1 - rd / 100)})^x$. Model manakah memberikan nilai yang lebih besar pada $x = ${t}$, dan berapakah bezanya?`), a: T(`Model 1: ${n(vg)}, Model 2: ${n(vd)}; Model 1 is larger by ${n(round(vg - vd, 1))}.`, `Model 1: ${n(vg)}, Model 2: ${n(vd)}; Model 1 lebih besar sebanyak ${n(round(vg - vd, 1))}.`), sp: 'm' };
    },
    // TF misconception: percentage change applied additively over several periods
    (r) => {
      const s = r.pick(EXPCTX);
      const a0 = r.pick([100, 200, 400]);
      const rate = r.pick([5, 10, 15, 20]);
      const b = bPct(rate, s);
      const correctVal = round(a0 * Math.pow(b, 2), 1);
      const wrongVal = a0 * (1 + (s.dir === 1 ? 2 * rate : -2 * rate) / 100);
      return { q: T(`True or False: for ${s.d.en} changing by ${rate}% each period, the value after 2 periods can be found by applying ${2 * rate}% once to the starting value ${a0}. Justify your answer.`, `Benar atau Palsu: bagi ${s.d.ms} yang berubah sebanyak ${rate}% setiap tempoh, nilai selepas 2 tempoh boleh dicari dengan mengenakan ${2 * rate}% sekali sahaja kepada nilai permulaan ${a0}. Justifikasikan jawapan anda.`), a: T(`False — the correct value is ${a0}(${n(b)})² $= ${n(correctVal)}$, not $${n(wrongVal)}$; percentage change compounds (multiplies) each period, it does not simply add up.`, `Palsu — nilai yang betul ialah ${a0}(${n(b)})² $= ${n(correctVal)}$, bukan $${n(wrongVal)}$; perubahan peratus berkompaun (mendarab) setiap tempoh, ia tidak semudah dijumlahkan.`), sp: 'm' };
    },
    // explain the risk of long-range extrapolation (reuses the 8.1 reasoning bank)
    (r) => {
      const s = r.pick(EXPCTX);
      const t = r.int(2, 5);
      return { q: T(`A model for ${s.d.en} is built from data over the first ${t} periods. Explain why using this exponential model to predict very far into the future is risky.`, `Suatu model bagi ${s.d.ms} dibina daripada data sepanjang ${t} tempoh pertama. Terangkan mengapa menggunakan model eksponen ini untuk meramal jauh ke hadapan adalah berisiko.`), a: LIMIT_REASON.exponential, sp: 's' };
    },
    // choose exponential over linear from a small table
    (r) => {
      const s = r.pick(EXPCTX.filter((c) => c.dir === 1));
      const a0 = r.pick([2, 3, 4]), b = r.pick([2, 3]);
      const xs = [0, 1, 2, 3], ys = xs.map((x) => a0 * Math.pow(b, x));
      const diffs = ys.slice(1).map((y, i) => y - ys[i]);
      return { q: T(`Data for ${s.d.en}: ${ys.join(', ')} at $x = 0, 1, 2, 3$. A classmate suggests a linear model since the values keep increasing. Explain, using the differences and ratios, why an exponential model fits better.`, `Data bagi ${s.d.ms}: ${ys.join(', ')} pada $x = 0, 1, 2, 3$. Seorang rakan sekelas mencadangkan model linear kerana nilainya sentiasa bertambah. Terangkan, menggunakan perbezaan dan nisbah, mengapa model eksponen lebih sesuai.`), a: T(`The differences (${diffs.join(', ')}) are not constant, so it is not linear; the ratios are all ${b} (constant), which is the signature of an exponential model.`, `Perbezaan (${diffs.join(', ')}) tidak malar, jadi ia bukan linear; nisbahnya semuanya ${b} (malar), iaitu ciri model eksponen.`), sp: 'm' };
    },
  ];

  const g84a = [
    // full trial-search cycle with assumption and limitation (baseline-style, deeper)
    (r) => {
      const s = r.pick(EXPCTX.filter((c) => c.dir === 1));
      const a0 = r.pick([50, 100, 200]), rate = r.pick([10, 20, 25]);
      const b = 1 + rate / 100;
      const target = 2 * a0;
      let t = 0, v = a0;
      while (v < target) { v *= b; t++; }
      const parts = [T(`By trying values of $x$, find the smallest whole number of periods for the value to at least double.`, `Dengan mencuba nilai $x$, cari bilangan tempoh bulat terkecil supaya nilainya sekurang-kurangnya berganda dua.`), T(`State the assumption behind this model, and explain one reason the model might become less accurate after many periods.`, `Nyatakan andaian di sebalik model ini, dan terangkan satu sebab model itu mungkin menjadi kurang tepat selepas banyak tempoh.`)];
      const ansParts = [T(`$x = ${t}$ (value $\\approx ${n(round(v, 1))}$)`, `$x = ${t}$ (nilai $\\approx ${n(round(v, 1))}$)`), T(`Assumption: ${s.as.en} Reason: ${LIMIT_REASON.exponential.en}`, `Andaian: ${s.as.ms} Sebab: ${LIMIT_REASON.exponential.ms}`)];
      return { q: T(`For ${s.d.en}, the model is $y = ${a0}(${n(b)})^x$.<br>${SPM.parts(parts).en}`, `Bagi ${s.d.ms}, modelnya ialah $y = ${a0}(${n(b)})^x$.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // compound interest over several years, with a comparison to simple (linear) interest
    (r) => {
      const p0 = r.pick([1000, 2000, 5000]), rate = r.pick([2, 3, 4, 5]);
      const t = r.int(3, 6);
      const compound = round(p0 * Math.pow(1 + rate / 100, t), 2);
      const simple = p0 + p0 * (rate / 100) * t;
      const parts = [T(`Find the balance after ${t} years under compound interest, $y = ${p0}(${n(1 + rate / 100)})^x$.`, `Cari baki selepas ${t} tahun di bawah faedah kompaun, $y = ${p0}(${n(1 + rate / 100)})^x$.`), T(`A simple (linear) interest account with the same rate would give $y = ${p0} + ${n(p0 * rate / 100)}x$. Find its balance after ${t} years, and state which account gives more.`, `Sebuah akaun faedah mudah (linear) dengan kadar yang sama akan memberikan $y = ${p0} + ${n(p0 * rate / 100)}x$. Cari bakinya selepas ${t} tahun, dan nyatakan akaun manakah yang memberikan lebih banyak.`)];
      const ansParts = [T(`RM${n(compound)}`), T(`RM${n(round(simple, 2))}; the compound interest account gives more (RM${n(round(compound - simple, 2))} more), since compounding earns interest on previous interest too.`, `RM${n(round(simple, 2))}; akaun faedah kompaun memberikan lebih banyak (RM${n(round(compound - simple, 2))} lebih), kerana pengkompaunan turut memperoleh faedah atas faedah terdahulu.`)];
      return { q: T(`RM${p0} is deposited in a savings account earning ${rate}% interest per year.<br>${SPM.parts(parts).en}`, `RM${p0} disimpan dalam sebuah akaun simpanan yang memperoleh faedah ${rate}% setahun.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // refine the model after several periods of deviation
    (r) => {
      const s = r.pick(EXPCTX.filter((c) => c.dir === 1));
      const a0 = r.pick([50, 100, 200]), rate = r.pick([10, 15, 20]);
      const b = 1 + rate / 100;
      const t = r.pick([3, 4, 5]);
      const predicted = round(a0 * Math.pow(b, t), 1);
      const actual = round(predicted * r.pick([0.7, 0.75, 0.8, 0.85]), 1);
      return { q: T(`A model for ${s.d.en}, $y = ${a0}(${n(b)})^x$, predicted a value of ${n(predicted)} at $x = ${t}$, but the actual observed value was only ${n(actual)}. Suggest one reason for this gap, and how the model could be refined.`, `Suatu model bagi ${s.d.ms}, $y = ${a0}(${n(b)})^x$, meramalkan nilai ${n(predicted)} pada $x = ${t}$, tetapi nilai sebenar yang diperhatikan hanyalah ${n(actual)}. Cadangkan satu sebab jurang ini, dan bagaimana model itu boleh diperhalusi.`), a: T(`The actual growth rate has likely slowed below ${rate}% (perhaps due to limited resources or changing conditions); the model could be refined by re-estimating a smaller rate $b$ from more recent data.`, `Kadar pertumbuhan sebenar berkemungkinan telah melambat di bawah ${rate}% (mungkin disebabkan sumber terhad atau keadaan yang berubah); model boleh diperhalusi dengan menganggar semula nilai $b$ yang lebih kecil daripada data terkini.`), sp: 'm' };
    },
    // choose family from data, then predict and discuss interpolation/extrapolation
    (r) => {
      const s = r.pick(EXPCTX.filter((c) => c.dir === 1));
      const a0 = r.pick([2, 3, 4]), b = r.pick([2, 3]);
      const xs = [0, 1, 2, 3], ys = xs.map((x) => a0 * Math.pow(b, x));
      const diffs = ys.slice(1).map((y, i) => y - ys[i]);
      const xPred = 6;
      const yPred = a0 * Math.pow(b, xPred);
      return { q: T(`Data for ${s.d.en}: ${ys.join(', ')} at $x = 0, 1, 2, 3$. A linear model and an exponential model are both proposed. Decide which fits, then predict the value at $x = ${xPred}$, stating whether this is interpolation or extrapolation and one reason to be cautious about it.`, `Data bagi ${s.d.ms}: ${ys.join(', ')} pada $x = 0, 1, 2, 3$. Model linear dan model eksponen kedua-duanya dicadangkan. Tentukan model yang manakah sepadan, kemudian ramalkan nilai pada $x = ${xPred}$, dengan menyatakan sama ada ini interpolasi atau ekstrapolasi dan satu sebab untuk berhati-hati dengannya.`), a: T(`Differences (${diffs.join(', ')}) are not constant, but ratios are constant at ${b}, so the exponential model $y = ${a0}(${b})^x$ fits. Predicted value at $x = ${xPred}$ is ${yPred}; this is extrapolation (beyond $[0,3]$), and ${LIMIT_REASON.exponential.en}`, `Perbezaan (${diffs.join(', ')}) tidak malar, tetapi nisbahnya malar pada ${b}, jadi model eksponen $y = ${a0}(${b})^x$ sepadan. Nilai ramalan pada $x = ${xPred}$ ialah ${yPred}; ini ekstrapolasi (melebihi $[0,3]$), dan ${LIMIT_REASON.exponential.ms}`), sp: 'm' };
    },
    // construct your own real-life example
    (r) => {
      const a0 = r.pick([10, 20, 50]), rate = r.pick([5, 10, 20]);
      const growth = r.chance();
      const b = growth ? 1 + rate / 100 : 1 - rate / 100;
      return { q: T(`Describe a real-life situation that could be modelled by $y = ${a0}(${n(b)})^x$, stating clearly what $x$ and $y$ represent (with units) and one assumption your model relies on.`, `Terangkan satu situasi kehidupan sebenar yang boleh dimodelkan oleh $y = ${a0}(${n(b)})^x$, dengan menyatakan dengan jelas apa yang diwakili oleh $x$ dan $y$ (berserta unit) dan satu andaian yang menjadi asas model anda.`), a: T(`Any correct context works, for example: $y$ = a quantity such as population or value, $x$ = number of time periods (e.g. years); ${a0} is the starting value; assumption: the percentage ${growth ? 'growth' : 'decay'} rate of ${rate}% stays the same every period.`, `Sebarang konteks yang betul boleh diterima, contohnya: $y$ = suatu kuantiti seperti populasi atau nilai, $x$ = bilangan tempoh masa (contohnya tahun); ${a0} ialah nilai permulaan; andaian: kadar peratus ${growth ? 'pertumbuhan' : 'penyusutan'} ${rate}% kekal sama setiap tempoh.`), sp: 'm' };
    },
    // doubling/halving trial with validation against a check value
    (r) => {
      const s = r.pick(EXPCTX.filter((c) => c.dir === -1));
      const a0 = r.pick([200, 400, 800]), rate = r.pick([10, 15, 20]);
      const b = 1 - rate / 100;
      const target = a0 / 2;
      let t = 0, v = a0;
      while (v > target) { v *= b; t++; }
      const parts = [T(`By trying values of $x$, find the smallest whole number of periods for the value to fall to at most half its starting value.`, `Dengan mencuba nilai $x$, cari bilangan tempoh bulat terkecil supaya nilainya jatuh kepada sekurang-kurangnya separuh nilai permulaan.`), T(`A measurement at $x = ${t}$ gave a value close to your answer above. Does this support the model? Explain briefly.`, `Suatu pengukuran pada $x = ${t}$ memberikan nilai yang hampir dengan jawapan anda di atas. Adakah ini menyokong model tersebut? Terangkan secara ringkas.`)];
      const ansParts = [T(`$x = ${t}$ (value $\\approx ${n(round(v, 1))}$, at most half of ${a0})`, `$x = ${t}$ (nilai $\\approx ${n(round(v, 1))}$, sekurang-kurangnya separuh daripada ${a0})`), T(`Yes — a measured value close to the model's prediction at the same $x$ supports (though does not fully prove) that the exponential decay model is reasonable here.`, `Ya — nilai yang diukur hampir dengan ramalan model pada $x$ yang sama menyokong (walaupun tidak membuktikan sepenuhnya) bahawa model penyusutan eksponen ini munasabah.`)];
      return { q: T(`For ${s.d.en}, the model is $y = ${a0}(${n(b)})^x$.<br>${SPM.parts(parts).en}`, `Bagi ${s.d.ms}, modelnya ialah $y = ${a0}(${n(b)})^x$.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // multi-part: build the model from two data points, then evaluate, then discuss the model's assumption
    (r) => {
      const s = r.pick(EXPCTX);
      const a0 = r.pick([100, 200, 400]);
      const rate = r.pick([5, 10, 20]);
      const b = bPct(rate, s);
      const a1 = round(a0 * b, 1);
      const tPred = 5;
      const parts = [T(`Given that the value was ${a0} at $x = 0$ and ${n(a1)} at $x = 1$, find $b$ and write the model $y = ab^x$.`, `Memandangkan nilainya ialah ${a0} pada $x = 0$ dan ${n(a1)} pada $x = 1$, cari $b$ dan tulis model $y = ab^x$.`), T(`Use your model to predict the value at $x = ${tPred}$.`, `Gunakan model anda untuk meramalkan nilai pada $x = ${tPred}$.`), T(`State one assumption this prediction relies on.`, `Nyatakan satu andaian yang menjadi asas ramalan ini.`)];
      const ansParts = [T(`$b = ${n(a1)} / ${a0} = ${n(b)}$; $y = ${a0}(${n(b)})^x$`), T(`${n(round(a0 * Math.pow(b, tPred), 1))}`), s.as];
      return { q: T(`For ${s.d.en}:<br>${SPM.parts(parts).en}`, `Bagi ${s.d.ms}:<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
  ];
  SPM.extend('F5-8.4', { e: g84e, m: g84m, a: g84a });

  /* =============================================================== 8.5 Reporting and communicating findings */
  const REPLAB = [T('Problem', 'Masalah'), T('Assumptions & variables', 'Andaian & pemboleh ubah'), T('Model & justification', 'Model & justifikasi'), T('Calculation', 'Pengiraan'), T('Interpretation', 'Tafsiran'), T('Conclusion & limitations', 'Kesimpulan & had')];
  /** one report sentence for scenario s, section index k (0..5) */
  const repSent = (s, k) => [
    T(`How does ${s.v.en} change with ${s.x.en}?`, `Bagaimanakah ${s.v.ms} berubah mengikut ${s.x.ms}?`),
    T(`Variable: ${s.v.en}, depending on ${s.x.en}. Assumption: ${s.as.en}`, `Pemboleh ubah: ${s.v.ms}, bergantung kepada ${s.x.ms}. Andaian: ${s.as.ms}`),
    T(`${FAM_ART[s.fam]} ${FAM_NAME[s.fam].en} model ($${FAM_EQ[s.fam]}$) is used, because ${FAM_TEST[s.fam].en} for equally spaced ${s.x.en}.`, `Model ${FAM_NAME[s.fam].ms} ($${FAM_EQ[s.fam]}$) digunakan, kerana ${FAM_TEST[s.fam].ms} bagi ${s.x.ms} yang sama selangnya.`),
    T(`Substitute the given values into the model to obtain a numerical prediction.`, `Gantikan nilai yang diberi ke dalam model untuk mendapatkan ramalan berangka.`),
    T(`The predicted value of ${s.v.en} is interpreted in the context of ${s.x.en}, with units stated.`, `Nilai ramalan ${s.v.ms} ditafsirkan dalam konteks ${s.x.ms}, dengan unit dinyatakan.`),
    T(`The model is reasonable within the data collected, but ${LIMIT_REASON[s.fam].en}`, `Model ini munasabah dalam julat data yang dikumpul, tetapi ${LIMIT_REASON[s.fam].ms}`),
  ][k];

  const g85e = [
    // identify which section of a given short report states a particular kind of content
    (r) => {
      const s = r.pick(SCEN);
      const idx = r.sample([0, 1, 2, 5], 4);
      const lines = (lang) => idx.map((k) => `<b>${REPLAB[k][lang]}:</b> ${repSent(s, k)[lang]}`).join('<br>');
      const ask = r.pick(idx);
      return { q: T(`A short modelling report on ${s.d.en} reads:<br>${lines('en')}<br>Which section states the ${REPLAB[ask].en.toLowerCase()}?`, `Sebuah laporan pemodelan ringkas tentang ${s.d.ms} berbunyi:<br>${lines('ms')}<br>Bahagian manakah yang menyatakan ${REPLAB[ask].ms.toLowerCase()}?`), a: REPLAB[ask], sp: 's' };
    },
    // match unlabelled sentences to their report section (matching task)
    (r) => {
      const s = r.pick(SCEN);
      const idx = r.sample([0, 1, 2, 3, 4, 5], 3).sort((a, b) => a - b);
      const shown = r.shuffle(idx);
      const opts = r.shuffle(idx);
      const dLine = (lang) => shown.map((k, i) => `${i + 1}. ${repSent(s, k)[lang]}`).join('<br>');
      const oLine = (lang) => opts.map((k, i) => `${LET[i]}) ${REPLAB[k][lang]}`).join('<br>');
      const ans = shown.map((k) => LET[opts.indexOf(k)]);
      return { q: T(`Match each sentence (1-${idx.length}) of this modelling report on ${s.d.en} to its section.<br>${dLine('en')}<br>${oLine('en')}`, `Padankan setiap ayat (1-${idx.length}) laporan pemodelan tentang ${s.d.ms} ini dengan bahagiannya.<br>${dLine('ms')}<br>${oLine('ms')}`), a: T(ans.map((c, i) => `${i + 1}-${c}`).join(', ')), sp: 's' };
    },
    // list N of the 6 components (N varies)
    (r) => {
      const nAsk = r.int(3, 6);
      return { q: T(`List ${nAsk === 6 ? 'the six' : nAsk} component${nAsk > 1 ? 's' : ''} that a good mathematical modelling report should contain.`, `Senaraikan ${nAsk === 6 ? 'keenam-enam' : nAsk} komponen yang perlu ada dalam laporan pemodelan matematik yang baik.`), a: T(REPLAB.slice(0, nAsk).map((x) => x.en).join('; '), REPLAB.slice(0, nAsk).map((x) => x.ms).join('; ')), sp: 'm' };
    },
    // fill in one blank section given the scenario
    (r) => {
      const s = r.pick(SCEN);
      const k = r.int(0, 5);
      const shown = [0, 1, 2, 3, 4, 5].filter((x) => x !== k);
      const lines = (lang) => shown.map((j) => `<b>${REPLAB[j][lang]}:</b> ${repSent(s, j)[lang]}`).join('<br>');
      return { q: T(`A modelling report on ${s.d.en} is missing its "${REPLAB[k].en}" section:<br>${lines('en')}<br>Write an appropriate sentence for the missing "${REPLAB[k].en}" section.`, `Laporan pemodelan tentang ${s.d.ms} kehilangan bahagian "${REPLAB[k].ms}":<br>${lines('ms')}<br>Tulis satu ayat yang sesuai bagi bahagian "${REPLAB[k].ms}" yang hilang.`), a: repSent(s, k), sp: 'm' };
    },
    // MCQ: which section would contain a given statement
    (r) => {
      const s = r.pick(SCEN);
      const k = r.int(0, 5);
      const others = r.sample([0, 1, 2, 3, 4, 5].filter((x) => x !== k), 3);
      const opts = r.shuffle([k, ...others]);
      const c = LET[opts.indexOf(k)];
      const line = (lang) => opts.map((o, i) => `${LET[i]}) ${REPLAB[o][lang]}`).join('<br>');
      return { q: T(`In a modelling report on ${s.d.en}, which section would contain the sentence: "${repSent(s, k).en}"?<br>${line('en')}`, `Dalam laporan pemodelan tentang ${s.d.ms}, bahagian manakah yang mengandungi ayat: "${repSent(s, k).ms}"?<br>${line('ms')}`), a: T(`${c}) ${REPLAB[k].en}`, `${c}) ${REPLAB[k].ms}`), sp: 'xs' };
    },
  ];

  const g85m = [
    // improve a report that is missing one section entirely
    (r) => {
      const s = r.pick(SCEN);
      const miss = r.int(0, 5);
      const shown = [0, 1, 2, 3, 4, 5].filter((k) => k !== miss);
      const lines = (lang) => shown.map((k) => `<b>${REPLAB[k][lang]}:</b> ${repSent(s, k)[lang]}`).join('<br>');
      return { q: T(`A modelling report on ${s.d.en} reads:<br>${lines('en')}<br>Identify which section is entirely missing, and write a suitable sentence to complete it.`, `Laporan pemodelan tentang ${s.d.ms} berbunyi:<br>${lines('ms')}<br>Kenal pasti bahagian yang hilang sepenuhnya, dan tulis ayat yang sesuai untuk melengkapkannya.`), a: T(`Missing: "${REPLAB[miss].en}". ${repSent(s, miss).en}`, `Hilang: "${REPLAB[miss].ms}". ${repSent(s, miss).ms}`), sp: 'm' };
    },
    // justify the model choice from a described data pattern (fill the justification blank)
    (r) => {
      const s = r.pick(SCEN);
      return { q: T(`A report states: "Model chosen: ${FAM_NAME[s.fam].en} ($${FAM_EQ[s.fam]}$), because ___." Complete the justification, referring to the pattern in equally-spaced data that supports this choice.`, `Sebuah laporan menyatakan: "Model yang dipilih: ${FAM_NAME[s.fam].ms} ($${FAM_EQ[s.fam]}$), kerana ___." Lengkapkan justifikasi itu, dengan merujuk kepada corak dalam data yang sama selangnya yang menyokong pilihan ini.`), a: FAM_TEST[s.fam], sp: 's' };
    },
    // explain a discrepancy between predicted and actual, for the conclusion
    (r) => {
      const s = r.pick(SCEN);
      const pred = r.int(50, 200);
      const dev = r.pick([-1, 1]) * r.int(5, 20);
      const actual = pred + dev;
      need(actual > 0);
      return { q: T(`A report on ${s.d.en} predicted ${pred} but the actual observed value was ${actual}. Write one sentence for the report's conclusion that explains this discrepancy, referring to the assumption "${s.as.en}".`, `Laporan tentang ${s.d.ms} meramalkan ${pred} tetapi nilai sebenar yang diperhatikan ialah ${actual}. Tulis satu ayat bagi kesimpulan laporan itu yang menerangkan percanggahan ini, dengan merujuk kepada andaian "${s.as.ms}".`), a: T(`The discrepancy may arise because the assumption "${s.as.en}" does not hold exactly in practice, so the model's prediction differs somewhat from the actual value.`, `Percanggahan ini mungkin timbul kerana andaian "${s.as.ms}" tidak berlaku dengan tepat dalam praktiknya, jadi ramalan model itu berbeza sedikit daripada nilai sebenar.`), sp: 'm' };
    },
    // spot why a conclusion overclaims, and state the rule for a proper conclusion
    (r) => {
      const s = r.pick(SCEN);
      const bad = r.pick([T(`Since the model fits perfectly, ${s.v.en} will definitely follow this exact pattern forever.`, `Oleh sebab model itu sepadan dengan sempurna, ${s.v.ms} akan pasti mengikut corak ini selama-lamanya.`), T(`This proves the model is completely correct in all situations.`, `Ini membuktikan model itu betul sepenuhnya dalam semua situasi.`)]);
      return { q: T(`A report's conclusion states: "${bad.en}" Explain what is wrong with this conclusion.`, `Kesimpulan sebuah laporan menyatakan: "${bad.ms}" Terangkan apa yang salah dengan kesimpulan ini.`), a: T(`A conclusion should be no stronger than the model supports — it overclaims certainty ("definitely", "proves", "forever") that the data and model cannot actually guarantee, especially beyond the range of data collected.`, `Kesimpulan tidak seharusnya lebih kuat daripada apa yang disokong oleh model — ia mendakwa kepastian ("pasti", "membuktikan", "selama-lamanya") yang sebenarnya tidak dapat dijamin oleh data dan model, terutamanya di luar julat data yang dikumpul.`), sp: 's' };
    },
    // add a validation sentence citing an unused data point
    (r) => {
      const s = r.pick(SCEN);
      const xchk = r.int(4, 10);
      const closeFit = r.chance();
      return { q: T(`A report on ${s.d.en} has a model but no validation sentence. An extra data point, where ${s.x.en} was ${xchk}, was NOT used to build the model, and the model's prediction there was ${closeFit ? 'close to' : 'noticeably different from'} the actual value. Write one sentence for the "Interpretation" section that validates the model using this point.`, `Laporan tentang ${s.d.ms} mempunyai model tetapi tiada ayat pengesahan. Satu titik data tambahan, dengan ${s.x.ms} bersamaan ${xchk}, TIDAK digunakan untuk membina model, dan ramalan model pada titik itu ${closeFit ? 'hampir dengan' : 'berbeza dengan ketara daripada'} nilai sebenar. Tulis satu ayat bagi bahagian "Tafsiran" yang mengesahkan model menggunakan titik ini.`), a: T(`${closeFit ? `Checking against the unused data point, the model's prediction was close to the actual value, supporting the model.` : `Checking against the unused data point, the model's prediction differed noticeably from the actual value, suggesting the model may need refinement.`}`, `${closeFit ? `Setelah disemak dengan titik data yang tidak digunakan, ramalan model itu hampir dengan nilai sebenar, menyokong model tersebut.` : `Setelah disemak dengan titik data yang tidak digunakan, ramalan model itu berbeza dengan ketara daripada nilai sebenar, menunjukkan model mungkin perlu diperhalusi.`}`), sp: 'm' };
    },
  ];

  const g85a = [
    // write a short but complete report (model, assumption, limitation, conclusion)
    (r) => {
      const s = r.pick(SCEN);
      return { q: T(`Write a short report (3-4 sentences) on modelling ${s.d.en}. Your report must state: the model family used and why, one assumption, and a conclusion that includes one limitation.`, `Tulis satu laporan ringkas (3-4 ayat) tentang pemodelan ${s.d.ms}. Laporan anda mesti menyatakan: keluarga model yang digunakan dan sebabnya, satu andaian, dan kesimpulan yang merangkumi satu had.`), a: T(`Acceptable answers combine: model = ${FAM_NAME[s.fam].en} ($${FAM_EQ[s.fam]}$) because ${FAM_TEST[s.fam].en}; assumption = ${s.as.en}; limitation = ${LIMIT_REASON[s.fam].en}`, `Jawapan yang boleh diterima menggabungkan: model = ${FAM_NAME[s.fam].ms} ($${FAM_EQ[s.fam]}$) kerana ${FAM_TEST[s.fam].ms}; andaian = ${s.as.ms}; had = ${LIMIT_REASON[s.fam].ms}`), sp: 'l' };
    },
    // critique a report with two planted issues: missing units and an overclaiming conclusion
    (r) => {
      const s = r.pick(SCEN);
      const val = r.int(50, 300);
      const parts = [T(`Identify what is missing from this calculation line: "Substituting ${s.x.en} = 5 gives a predicted value of ${val}."`, `Kenal pasti apa yang hilang daripada baris pengiraan ini: "Menggantikan ${s.x.ms} = 5 memberikan nilai ramalan ${val}."`), T(`Identify what is wrong with this conclusion: "This model proves ${s.v.en} will always behave this way."`, `Kenal pasti apa yang salah dengan kesimpulan ini: "Model ini membuktikan ${s.v.ms} akan sentiasa berkelakuan sedemikian."`)];
      const ansParts = [T(`The units of the predicted value are missing (a report should always state units).`, `Unit bagi nilai ramalan itu hilang (laporan sepatutnya sentiasa menyatakan unit).`), T(`It overclaims — "proves" and "always" go beyond what a model fitted to limited data can actually support.`, `Ia mendakwa secara berlebihan — "membuktikan" dan "sentiasa" melangkaui apa yang sebenarnya dapat disokong oleh model yang disesuaikan dengan data terhad.`)];
      return { q: T(`A report on ${s.d.en} has two issues.<br>${SPM.parts(parts).en}`, `Laporan tentang ${s.d.ms} mempunyai dua isu.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // compare two reports' family justification against a data table
    (r) => {
      const s = r.pick(SCEN.filter((x) => x.fam === 'linear' || x.fam === 'exponential'));
      const wrongFam = s.fam === 'linear' ? 'exponential' : 'linear';
      const a0 = r.int(2, 6);
      const xs = [0, 1, 2, 3];
      const ys = s.fam === 'linear' ? xs.map((x) => a0 + r.pick([2, 3, 4]) * x) : xs.map((x) => a0 * Math.pow(r.pick([2, 3]), x));
      return { q: T(`For ${s.d.en}, the data is ${ys.join(', ')} at $x = 0, 1, 2, 3$. Report A says: "We chose ${famArt(s.fam)} ${FAM_NAME[s.fam].en} model because the values keep changing in the same direction." Report B says: "We chose ${famArt(wrongFam)} ${FAM_NAME[wrongFam].en} model for the same reason." Which report's model choice is actually correctly justified by the data, and what should the justification have said?`, `Bagi ${s.d.ms}, datanya ialah ${ys.join(', ')} pada $x = 0, 1, 2, 3$. Laporan A menyatakan: "Kami memilih model ${FAM_NAME[s.fam].ms} kerana nilainya sentiasa berubah dalam arah yang sama." Laporan B menyatakan: "Kami memilih model ${FAM_NAME[wrongFam].ms} atas sebab yang sama." Laporan manakah pilihan modelnya sebenarnya wajar disokong oleh data, dan apakah yang sepatutnya dinyatakan sebagai justifikasi?`), a: T(`"The values keep changing in the same direction" does not by itself justify either family (both could look like that). The correct justification should use ${FAM_TEST[s.fam].en} — this supports the ${FAM_NAME[s.fam].en} model, so Report A's model choice (though not its stated reason) is the one the data actually supports.`, `"Nilainya sentiasa berubah dalam arah yang sama" tidak dengan sendirinya mewajarkan mana-mana keluarga (kedua-duanya boleh kelihatan begitu). Justifikasi yang betul patut menggunakan ${FAM_TEST[s.fam].ms} — ini menyokong model ${FAM_NAME[s.fam].ms}, jadi pilihan model Laporan A (walaupun bukan sebab yang dinyatakannya) adalah yang sebenarnya disokong oleh data.`), sp: 'l' };
    },
    // a recommendation with assumptions and limitations, for a stated decision
    (r) => {
      const s = r.pick(SCEN);
      return { q: T(`Based on ${famArt(s.fam)} ${FAM_NAME[s.fam].en} model of ${s.d.en}, write a one-paragraph recommendation for someone deciding whether to rely on this model's predictions. Your answer must mention: the model's assumption, one limitation, and how confident the recommendation should be.`, `Berdasarkan model ${FAM_NAME[s.fam].ms} bagi ${s.d.ms}, tulis satu perenggan cadangan untuk seseorang yang membuat keputusan sama ada untuk bergantung pada ramalan model ini. Jawapan anda mesti menyebut: andaian model, satu had, dan sejauh mana keyakinan cadangan itu patut dibuat.`), a: T(`A good answer states the assumption (${s.as.en}), one limitation (${LIMIT_REASON[s.fam].en}), and recommends using the model with moderate confidence only within the range of data it was built from, not for long-range prediction.`, `Jawapan yang baik menyatakan andaian (${s.as.ms}), satu had (${LIMIT_REASON[s.fam].ms}), dan mencadangkan penggunaan model dengan keyakinan sederhana sahaja dalam julat data ia dibina, bukan untuk ramalan jarak jauh.`), sp: 'l' };
    },
    // rewrite an overclaiming conclusion properly
    (r) => {
      const s = r.pick(SCEN);
      const bad = T(`"${SPM.cap(s.v.en)} will definitely reach any value we want if we just wait long enough — the model proves it."`, `"${SPM.cap(s.v.ms)} pasti akan mencapai sebarang nilai yang kita mahu jika kita hanya menunggu cukup lama — model itu membuktikannya."`);
      return { q: T(`A classmate wrote this conclusion for a report on ${s.d.en}: ${bad.en} Rewrite this as a conclusion that is no stronger than the model actually supports.`, `Seorang rakan sekelas menulis kesimpulan ini bagi laporan tentang ${s.d.ms}: ${bad.ms} Tulis semula ini sebagai kesimpulan yang tidak lebih kuat daripada apa yang sebenarnya disokong oleh model.`), a: T(`Based on the model and the data used, ${s.v.en} is predicted to follow this pattern within the range tested; this should not be assumed to hold indefinitely, since ${LIMIT_REASON[s.fam].en}`, `Berdasarkan model dan data yang digunakan, ${s.v.ms} diramalkan mengikut corak ini dalam julat yang diuji; ini tidak seharusnya dianggap berlaku selama-lamanya, kerana ${LIMIT_REASON[s.fam].ms}`), sp: 'm' };
    },
  ];
  SPM.extend('F5-8.5', { e: g85e, m: g85m, a: g85a });

  /* =============================================================== 8.6 Other model structures and optimisation (enrichment) */
  const TAG_VAR = T('(Enrichment: variation — Form 5 Chapter 1)', '(Pengayaan: variasi — Tingkatan 5 Bab 1)');
  const TAG_MENS = T('(Enrichment: mensuration)', '(Pengayaan: mensurasi)');
  const TAG_INEQ = T('(Enrichment: linear programming — Form 4 Chapter 6)', '(Pengayaan: pengaturcaraan linear — Tingkatan 4 Bab 6)');
  const VITEM = [T('fabric', 'kain'), T('rope', 'tali'), T('rice', 'beras'), T('sugar', 'gula'), T('cooking oil', 'minyak masak'), T('cement', 'simen')];
  const WORKCTX = [
    { task: T('paint a fence', 'mengecat pagar'), unit: T('workers', 'pekerja') },
    { task: T('fill a pool', 'mengisi kolam'), unit: T('pumps', 'pam') },
    { task: T('pack a batch of boxes', 'membungkus sekumpulan kotak'), unit: T('machines', 'mesin') },
    { task: T('finish a printing job', 'menyiapkan kerja percetakan'), unit: T('printers', 'pencetak') },
    { task: T('harvest a field', 'menuai sebuah ladang'), unit: T('workers', 'pekerja') },
  ];
  const BOXCTX = [T('cardboard', 'kadbod'), T('sheet metal', 'kepingan logam'), T('plastic', 'plastik')];
  const CYLCTX = [T('a tin can', 'sebuah tin'), T('a water container', 'sebuah bekas air'), T('a storage drum', 'sebuah dram simpanan')];
  const OBJCTX = [T('profit (RM)', 'keuntungan (RM)'), T('score', 'markah'), T('production output (units)', 'output pengeluaran (unit)')];
  const JOINTCTX = [
    { v: T('the cost of a custom cake', 'kos sebuah kek tempahan'), x: T('its diameter', 'diameternya'), z: T('its height', 'ketinggiannya') },
    { v: T('the printing cost of a banner', 'kos mencetak sepanduk'), x: T('its width', 'lebarnya'), z: T('its length', 'panjangnya') },
    { v: T('a delivery charge', 'caj penghantaran'), x: T('the distance', 'jaraknya'), z: T('the package weight', 'berat bungkusan') },
  ];

  const g86e = [
    // direct variation: find k, then predict
    (r) => {
      const item = r.pick(VITEM);
      const k = r.int(2, 8);
      const x1 = r.int(2, 10), y1 = k * x1;
      const x2 = r.int(2, 10);
      need(x2 !== x1);
      return { q: T(`The cost, RM$y$, of ${item.en} varies directly with its mass, $x$ kg. Given that $y = ${y1}$ when $x = ${x1}$, find the model $y = kx$, then find $y$ when $x = ${x2}$. ${TAG_VAR.en}`, `Kos, RM$y$, ${item.ms} berubah secara langsung dengan jisimnya, $x$ kg. Diberi $y = ${y1}$ apabila $x = ${x1}$, cari model $y = kx$, kemudian cari $y$ apabila $x = ${x2}$. ${TAG_VAR.ms}`), a: T(`$k = ${y1}/${x1} = ${k}$; $y = ${k}x$; when $x = ${x2}$, $y = ${k * x2}$`, `$k = ${y1}/${x1} = ${k}$; $y = ${k}x$; apabila $x = ${x2}$, $y = ${k * x2}$`), sp: 'm' };
    },
    // inverse variation: find k, then predict
    (r) => {
      const w = r.pick(WORKCTX);
      const k = r.pick([12, 18, 24, 36, 48]);
      const divs = SPM.factors(k).filter((d) => d >= 2 && d <= 12);
      const x1 = r.pick(divs), x2 = r.pick(divs.filter((d) => d !== x1));
      const y1 = k / x1;
      return { q: T(`The number of hours, $y$, needed to ${w.task.en} varies inversely with the number of ${w.unit.en} used, $x$. Given that $y = ${y1}$ hours when $x = ${x1}$, find the model $y = k/x$, then find $y$ when $x = ${x2}$. ${TAG_VAR.en}`, `Bilangan jam, $y$, yang diperlukan untuk ${w.task.ms} berubah secara songsang dengan bilangan ${w.unit.ms} yang digunakan, $x$. Diberi $y = ${y1}$ jam apabila $x = ${x1}$, cari model $y = k/x$, kemudian cari $y$ apabila $x = ${x2}$. ${TAG_VAR.ms}`), a: T(`$k = ${x1} \\times ${y1} = ${k}$; $y = ${k}/x$; when $x = ${x2}$, $y = ${k / x2}$`, `$k = ${x1} \\times ${y1} = ${k}$; $y = ${k}/x$; apabila $x = ${x2}$, $y = ${k / x2}$`), sp: 'm' };
    },
    // identify direct vs inverse from a small table
    (r) => {
      const direct = r.chance();
      const k = r.int(2, 6);
      const xs = [1, 2, 4];
      const ys = direct ? xs.map((x) => k * x) : xs.map((x) => k / x).map((v) => v);
      need(ys.every((y) => Number.isInteger(y)));
      const tab = SPM.table([['$x$', ...xs], ['$y$', ...ys]]);
      return { q: T(`The table shows $x$ and $y$, which vary either directly or inversely.<br>${tab}<br>State which type of variation this is, and find $k$.`, `Jadual menunjukkan $x$ dan $y$, yang berubah sama ada secara langsung atau songsang.<br>${tab}<br>Nyatakan jenis variasi ini, dan cari $k$.`), a: T(`${direct ? `Direct ($y/x$ is constant); $k = ${k}$` : `Inverse ($xy$ is constant); $k = ${k}$`}`, `${direct ? `Langsung ($y/x$ malar); $k = ${k}$` : `Songsang ($xy$ malar); $k = ${k}$`}`), sp: 's' };
    },
    // read one value off a supplied trial table for the open box volume
    (r) => {
      const mat = r.pick(BOXCTX);
      const s = r.pick([12, 16, 20]);
      const x = r.pick([1, 2, 3].filter((v) => 2 * v < s));
      const V = x * (s - 2 * x) * (s - 2 * x);
      return { q: T(`A square sheet of ${mat.en} of side ${s} cm has a square of side $x$ cm cut from each corner, and the sides folded up to form an open box of volume $V = x(${s} - 2x)^2$. Find $V$ when $x = ${x}$. ${TAG_MENS.en}`, `Sekeping kepingan ${mat.ms} berbentuk segi empat sama bersisi ${s} cm mempunyai segi empat sama bersisi $x$ cm dipotong dari setiap sudut, dan sisinya dilipat ke atas untuk membentuk sebuah kotak terbuka berisipadu $V = x(${s} - 2x)^2$. Cari $V$ apabila $x = ${x}$. ${TAG_MENS.ms}`), a: T(`${V} cm³`), sp: 's' };
    },
    // read one value off a supplied trial table for cylinder surface area
    (r) => {
      const can = r.pick(CYLCTX);
      const K = r.pick([100, 200, 300]);
      const rr = r.pick([2, 3, 4]);
      const S = round(2 * 3.142 * rr * rr + (2 * K) / rr, 1);
      return { q: T(`${SPM.cap(can.en)}, a closed cylinder, must hold a fixed volume of ${K} cm³; its radius is $r$ cm and its surface area is $S = 2\\pi r^2 + \\dfrac{2(${K})}{r}$. Using $\\pi \\approx 3.142$, find $S$ when $r = ${rr}$.`, `${SPM.cap(can.ms)}, sebuah silinder tertutup, mesti memuatkan isipadu tetap ${K} cm³; jejarinya ialah $r$ cm dan luas permukaannya ialah $S = 2\\pi r^2 + \\dfrac{2(${K})}{r}$. Dengan menggunakan $\\pi \\approx 3.142$, cari $S$ apabila $r = ${rr}$.`), a: T(`$S \\approx ${n(S)}$ cm²`), sp: 's' };
    },
    // compare two supplied candidate values directly (box or cylinder), which is better
    (r) => {
      const isBox = r.chance();
      let line;
      if (isBox) {
        const mat = r.pick(BOXCTX);
        const s = r.pick([12, 16, 20]);
        const [x1, x2] = r.sample([1, 2, 3].filter((v) => 2 * v < s), 2);
        const V1 = x1 * (s - 2 * x1) ** 2, V2 = x2 * (s - 2 * x2) ** 2;
        need(V1 !== V2);
        line = { en: `Two candidate cuts are tried for an open box (side ${s} cm sheet of ${mat.en}, volume $V = x(${s} - 2x)^2$): $x = ${x1}$ cm and $x = ${x2}$ cm. Which gives the greater volume?`, ms: `Dua potongan calon dicuba bagi sebuah kotak terbuka (kepingan ${mat.ms} bersisi ${s} cm, isipadu $V = x(${s} - 2x)^2$): $x = ${x1}$ cm dan $x = ${x2}$ cm. Yang manakah memberikan isipadu lebih besar?`, aEn: `$x = ${x1}$: $V = ${V1}$ cm³; $x = ${x2}$: $V = ${V2}$ cm³; $x = ${V1 > V2 ? x1 : x2}$ gives the greater volume.`, aMs: `$x = ${x1}$: $V = ${V1}$ cm³; $x = ${x2}$: $V = ${V2}$ cm³; $x = ${V1 > V2 ? x1 : x2}$ memberikan isipadu lebih besar.` };
      } else {
        const K = r.pick([100, 200, 300]);
        const [r1, r2] = r.sample([2, 3, 4, 5], 2);
        const S1 = round(2 * 3.142 * r1 * r1 + (2 * K) / r1, 1), S2 = round(2 * 3.142 * r2 * r2 + (2 * K) / r2, 1);
        need(S1 !== S2);
        line = { en: `Two candidate radii are tried for a closed cylinder of fixed volume ${K} cm³ ($S = 2\\pi r^2 + \\dfrac{2(${K})}{r}$): $r = ${r1}$ cm and $r = ${r2}$ cm. Which gives the smaller surface area?`, ms: `Dua jejari calon dicuba bagi sebuah silinder tertutup berisipadu tetap ${K} cm³ ($S = 2\\pi r^2 + \\dfrac{2(${K})}{r}$): $r = ${r1}$ cm dan $r = ${r2}$ cm. Yang manakah memberikan luas permukaan lebih kecil?`, aEn: `$r = ${r1}$: $S \\approx ${n(S1)}$ cm²; $r = ${r2}$: $S \\approx ${n(S2)}$ cm²; $r = ${S1 < S2 ? r1 : r2}$ gives the smaller area.`, aMs: `$r = ${r1}$: $S \\approx ${n(S1)}$ cm²; $r = ${r2}$: $S \\approx ${n(S2)}$ cm²; $r = ${S1 < S2 ? r1 : r2}$ memberikan luas lebih kecil.` };
      }
      return { q: T(line.en, line.ms), a: T(line.aEn, line.aMs), sp: 's' };
    },
    // read a value from an objective function at a supplied vertex
    (r) => {
      const obj = r.pick(OBJCTX);
      const a = r.int(2, 8), b = r.int(2, 8);
      const px = r.int(2, 10), py = r.int(2, 10);
      return { q: T(`A feasible region has a vertex at $(${px}, ${py})$. The objective function for ${obj.en} is $P = ${a}x + ${b}y$. Find the value of $P$ at this vertex. ${TAG_INEQ.en}`, `Suatu rantau tersaur mempunyai bucu pada $(${px}, ${py})$. Fungsi objektif bagi ${obj.ms} ialah $P = ${a}x + ${b}y$. Cari nilai $P$ pada bucu ini. ${TAG_INEQ.ms}`), a: T(`$P = ${a}(${px}) + ${b}(${py}) = ${a * px + b * py}$`), sp: 's' };
    },
    // MCQ: as x increases, what happens to y for direct vs inverse variation
    (r) => {
      const direct = r.chance();
      const correct = direct ? T('$y$ increases', '$y$ bertambah') : T('$y$ decreases', '$y$ berkurang');
      const wrong = [T('$y$ stays the same', '$y$ kekal sama'), direct ? T('$y$ decreases', '$y$ berkurang') : T('$y$ increases', '$y$ bertambah'), T('$y$ becomes zero', '$y$ menjadi sifar')];
      const opts = r.shuffle([correct, ...wrong]);
      const c = LET[opts.indexOf(correct)];
      const line = (lang) => opts.map((o, k) => `${LET[k]}) ${o[lang]}`).join('<br>');
      return { q: T(`For $y = k${direct ? 'x' : '/x'}$ with $k > 0$ and $x > 0$, what happens to $y$ as $x$ increases? ${TAG_VAR.en}<br>${line('en')}`, `Bagi $y = k${direct ? 'x' : '/x'}$ dengan $k > 0$ dan $x > 0$, apakah yang berlaku kepada $y$ apabila $x$ bertambah? ${TAG_VAR.ms}<br>${line('ms')}`), a: T(`${c}) ${correct.en}`, `${c}) ${correct.ms}`), sp: 'xs' };
    },
    // read the best candidate directly off a fully-given small table (box or cylinder)
    (r) => {
      const isBox = r.chance();
      let q, a;
      if (isBox) {
        const mat = r.pick(BOXCTX);
        const s = r.pick([12, 16, 20]);
        const cands = [1, 2, 3].filter((v) => 2 * v < s);
        const vols = cands.map((x) => x * (s - 2 * x) * (s - 2 * x));
        const best = Math.max(...vols);
        const tab = SPM.table([['$x$', ...cands], ['$V$', ...vols]]);
        q = T(`For an open box made from ${mat.en} of side ${s} cm ($V = x(${s}-2x)^2$), the table shows tested volumes.<br>${tab}<br>Which tested value of $x$ gives the greatest volume?`, `Bagi sebuah kotak terbuka daripada ${mat.ms} bersisi ${s} cm ($V = x(${s}-2x)^2$), jadual menunjukkan isipadu yang diuji.<br>${tab}<br>Nilai $x$ yang diuji manakah memberikan isipadu terbesar?`);
        a = T(`$x = ${cands[vols.indexOf(best)]}$ (volume ${best} cm³)`, `$x = ${cands[vols.indexOf(best)]}$ (isipadu ${best} cm³)`);
      } else {
        const can = r.pick(CYLCTX);
        const K = r.pick([100, 200, 300]);
        const cands = [2, 3, 4];
        const areas = cands.map((rr) => round(2 * 3.142 * rr * rr + (2 * K) / rr, 1));
        const best = Math.min(...areas);
        const tab = SPM.table([['$r$', ...cands], ['$S$', ...areas.map((v) => n(v))]]);
        q = T(`For ${can.en}, a closed cylinder of fixed volume ${K} cm³, the table shows tested surface areas.<br>${tab}<br>Which tested value of $r$ gives the smallest surface area?`, `Bagi ${can.ms}, sebuah silinder tertutup berisipadu tetap ${K} cm³, jadual menunjukkan luas permukaan yang diuji.<br>${tab}<br>Nilai $r$ yang diuji manakah memberikan luas permukaan terkecil?`);
        a = T(`$r = ${cands[areas.indexOf(best)]}$ (area $\\approx ${n(best)}$ cm²)`, `$r = ${cands[areas.indexOf(best)]}$ (luas $\\approx ${n(best)}$ cm²)`);
      }
      return { q, a, sp: 's' };
    },
  ];

  const g86m = [
    // joint variation
    (r) => {
      const c = r.pick(JOINTCTX);
      const k = r.pick([1, 2, 3]);
      const x1 = r.int(2, 5), z1 = r.int(2, 5), y1 = k * x1 * z1;
      const x2 = r.int(2, 6), z2 = r.int(2, 6);
      return { q: T(`${SPM.cap(c.v.en)}, $y$, varies jointly with ${c.x.en}, $x$, and ${c.z.en}, $z$. Given that $y = ${y1}$ when $x = ${x1}$ and $z = ${z1}$, find the model $y = kxz$, then find $y$ when $x = ${x2}$ and $z = ${z2}$. ${TAG_VAR.en}`, `${SPM.cap(c.v.ms)}, $y$, berubah secara bersama dengan ${c.x.ms}, $x$, dan ${c.z.ms}, $z$. Diberi $y = ${y1}$ apabila $x = ${x1}$ dan $z = ${z1}$, cari model $y = kxz$, kemudian cari $y$ apabila $x = ${x2}$ dan $z = ${z2}$. ${TAG_VAR.ms}`), a: T(`$k = ${y1}/(${x1} \\times ${z1}) = ${k}$; $y = ${k}xz$; when $x = ${x2}, z = ${z2}$, $y = ${k * x2 * z2}$`, `$k = ${y1}/(${x1} \\times ${z1}) = ${k}$; $y = ${k}xz$; apabila $x = ${x2}, z = ${z2}$, $y = ${k * x2 * z2}$`), sp: 'm' };
    },
    // open box: build the trial table over a supplied candidate list, pick the best tested value
    (r) => {
      const mat = r.pick(BOXCTX);
      const s = r.pick([12, 16, 20]);
      const cands = [1, 2, 3, 4].filter((v) => 2 * v < s);
      const vols = cands.map((x) => x * (s - 2 * x) * (s - 2 * x));
      const best = Math.max(...vols);
      const bestX = cands[vols.indexOf(best)];
      const tab = SPM.table([['$x$ (cm)', ...cands], ['$V$ (cm³)', ...vols]]);
      return { q: T(`A square sheet of ${mat.en} of side ${s} cm is folded into an open box of volume $V = x(${s} - 2x)^2$, where $x$ cm is cut from each corner. Complete the table for $x = ${cands.join(', ')}$, and state the greatest volume among these tested values.<br>${tab}<br>${TAG_MENS.en}`, `Sekeping kepingan ${mat.ms} berbentuk segi empat sama bersisi ${s} cm dilipat menjadi kotak terbuka berisipadu $V = x(${s} - 2x)^2$, dengan $x$ cm dipotong dari setiap sudut. Lengkapkan jadual bagi $x = ${cands.join(', ')}$, dan nyatakan isipadu terbesar antara nilai yang diuji ini.<br>${tab}<br>${TAG_MENS.ms}`), a: T(`Volumes: ${vols.join(', ')} cm³; the greatest tested volume is ${best} cm³, at $x = ${bestX}$ (best among the tested values, not a proven maximum).`, `Isipadu: ${vols.join(', ')} cm³; isipadu terbesar yang diuji ialah ${best} cm³, pada $x = ${bestX}$ (terbaik antara nilai yang diuji, bukan maksimum yang terbukti).`), sp: 'm' };
    },
    // cylinder: trial table over supplied radii, pick the best tested value
    (r) => {
      const can = r.pick(CYLCTX);
      const K = r.pick([150, 200, 250, 300]);
      const cands = [2, 3, 4, 5];
      const areas = cands.map((rr) => round(2 * 3.142 * rr * rr + (2 * K) / rr, 1));
      const best = Math.min(...areas);
      const bestR = cands[areas.indexOf(best)];
      const tab = SPM.table([['$r$ (cm)', ...cands], ['$S$ (cm²)', ...areas.map((v) => n(v))]]);
      return { q: T(`${SPM.cap(can.en)} is a closed cylinder of fixed volume ${K} cm³ with surface area $S = 2\\pi r^2 + \\dfrac{2(${K})}{r}$. Using $\\pi \\approx 3.142$, complete the table for $r = ${cands.join(', ')}$ cm, and state the smallest surface area among these tested values.<br>${tab}`, `${SPM.cap(can.ms)} ialah sebuah silinder tertutup berisipadu tetap ${K} cm³ dengan luas permukaan $S = 2\\pi r^2 + \\dfrac{2(${K})}{r}$. Dengan $\\pi \\approx 3.142$, lengkapkan jadual bagi $r = ${cands.join(', ')}$ cm, dan nyatakan luas permukaan terkecil antara nilai yang diuji ini.<br>${tab}`), a: T(`Surface areas: ${areas.map((v) => n(v)).join(', ')} cm²; the smallest tested area is ${n(best)} cm², at $r = ${bestR}$ cm (best among the tested values, not a proven minimum).`, `Luas permukaan: ${areas.map((v) => n(v)).join(', ')} cm²; luas terkecil yang diuji ialah ${n(best)} cm², pada $r = ${bestR}$ cm (terbaik antara nilai yang diuji, bukan minimum yang terbukti).`), sp: 'm' };
    },
    // network: compare given route options by total distance/cost
    (r) => {
      const [p, q] = r.sample(SPM.bank.places, 2);
      const legs1 = [r.int(3, 10), r.int(3, 10)];
      const legs2 = [r.int(3, 10), r.int(3, 10), r.int(2, 6)];
      const t1 = legs1[0] + legs1[1], t2 = legs2[0] + legs2[1] + legs2[2];
      need(t1 !== t2);
      return { q: T(`To travel from ${p.en} to ${q.en}, Route A goes via a junction (${legs1[0]} km then ${legs1[1]} km), and Route B goes via two other junctions (${legs2[0]} km, then ${legs2[1]} km, then ${legs2[2]} km). Find the total distance of each route, and state which is shorter.`, `Untuk perjalanan dari ${p.ms} ke ${q.ms}, Laluan A melalui satu persimpangan (${legs1[0]} km kemudian ${legs1[1]} km), dan Laluan B melalui dua persimpangan lain (${legs2[0]} km, kemudian ${legs2[1]} km, kemudian ${legs2[2]} km). Cari jumlah jarak setiap laluan, dan nyatakan yang mana lebih pendek.`), a: T(`Route A: ${t1} km; Route B: ${t2} km; Route ${t1 < t2 ? 'A' : 'B'} is shorter.`, `Laluan A: ${t1} km; Laluan B: ${t2} km; Laluan ${t1 < t2 ? 'A' : 'B'} lebih pendek.`), sp: 'm' };
    },
    // residual: define residual = actual - predicted, compute for a small set of points
    (r) => {
      const item = r.pick(PROFIT_ITEM);
      const xs = [1, 2, 3];
      const preds = xs.map(() => r.int(10, 30));
      const devs = xs.map(() => r.pick([-1, 1]) * r.int(1, 4));
      const actuals = preds.map((p, i) => p + devs[i]);
      const residuals = actuals.map((a, i) => a - preds[i]);
      const sumAbs = residuals.reduce((s, v) => s + Math.abs(v), 0);
      return { q: T(`A model's predicted daily sales of ${item.en} and the actual observed sales at $x = 1, 2, 3$ are: predicted ${preds.join(', ')}; actual ${actuals.join(', ')}. Using residual $=$ actual $-$ predicted, find the residual at each point, and the sum of their absolute values.`, `Jualan harian ${item.ms} yang diramalkan oleh suatu model dan jualan sebenar yang diperhatikan pada $x = 1, 2, 3$ ialah: ramalan ${preds.join(', ')}; sebenar ${actuals.join(', ')}. Dengan menggunakan baki $=$ sebenar $-$ ramalan, cari baki pada setiap titik, dan hasil tambah nilai mutlaknya.`), a: T(`Residuals: ${residuals.join(', ')}; sum of absolute values $= ${sumAbs}$.`, `Baki: ${residuals.join(', ')}; hasil tambah nilai mutlak $= ${sumAbs}$.`), sp: 'm' };
    },
    // inequality optimisation: evaluate the objective at a supplied set of vertices
    (r) => {
      const obj = r.pick(OBJCTX);
      const a = r.int(2, 6), b = r.int(2, 6);
      const verts = [[r.int(0, 3), r.int(0, 3)], [r.int(4, 8), r.int(0, 3)], [r.int(0, 3), r.int(4, 8)]];
      const vals = verts.map(([x, y]) => a * x + b * y);
      const maxV = Math.max(...vals);
      const bestV = verts[vals.indexOf(maxV)];
      return { q: T(`A feasible region has vertices at $(${verts[0].join(', ')})$, $(${verts[1].join(', ')})$ and $(${verts[2].join(', ')})$. The objective function for ${obj.en} is $P = ${a}x + ${b}y$. Find $P$ at each vertex, and state which vertex gives the greatest value. ${TAG_INEQ.en}`, `Suatu rantau tersaur mempunyai bucu pada $(${verts[0].join(', ')})$, $(${verts[1].join(', ')})$ dan $(${verts[2].join(', ')})$. Fungsi objektif bagi ${obj.ms} ialah $P = ${a}x + ${b}y$. Cari $P$ pada setiap bucu, dan nyatakan bucu manakah memberikan nilai terbesar. ${TAG_INEQ.ms}`), a: T(`$P$-values: ${vals.join(', ')}; greatest at $(${bestV.join(', ')})$, $P = ${maxV}$.`, `Nilai $P$: ${vals.join(', ')}; terbesar pada $(${bestV.join(', ')})$, $P = ${maxV}$.`), sp: 'm' };
    },
    // MCQ: which of three named routes is cheapest, given per-route totals
    (r) => {
      const totals = r.sample([r.int(10, 20), r.int(10, 20), r.int(10, 20)], 3);
      need(new Set(totals).size === 3);
      const names = ['A', 'B', 'C'];
      const best = names[totals.indexOf(Math.min(...totals))];
      const line = (lang) => names.map((nm, i) => `${nm}: ${totals[i]} km`).join(', ');
      return { q: T(`Three routes between two towns are proposed: ${line('en')}. Which route is shortest?`, `Tiga laluan antara dua bandar dicadangkan: ${line('ms')}. Laluan manakah paling pendek?`), a: T(`Route ${best} (${Math.min(...totals)} km).`, `Laluan ${best} (${Math.min(...totals)} km).`), sp: 'xs' };
    },
  ];

  const g86a = [
    // full open-box cycle, with the "best tested, not proven maximum" caveat spelled out
    (r) => {
      const mat = r.pick(BOXCTX);
      const s = r.pick([12, 16, 20]);
      const cands = [1, 2, 3, 4].filter((v) => 2 * v < s);
      const vols = cands.map((x) => x * (s - 2 * x) * (s - 2 * x));
      const best = Math.max(...vols);
      const bestX = cands[vols.indexOf(best)];
      const parts = [T(`Write the volume model $V(x)$, and state the domain of $x$ for it to be physically meaningful.`, `Tulis model isipadu $V(x)$, dan nyatakan domain $x$ supaya ia bermakna secara fizikal.`), T(`Complete a table of $V$ for $x = ${cands.join(', ')}$, and state which tested value gives the greatest volume.`, `Lengkapkan jadual $V$ bagi $x = ${cands.join(', ')}$, dan nyatakan nilai yang diuji manakah memberikan isipadu terbesar.`), T(`Explain why this is only the best value among those tested, not a proven overall maximum, and suggest how the search could be refined.`, `Terangkan mengapa ini hanya nilai terbaik antara yang diuji, bukan maksimum keseluruhan yang terbukti, dan cadangkan bagaimana carian itu boleh diperhalusi.`)];
      const ansParts = [T(`$V(x) = x(${s} - 2x)^2$; domain $0 < x < ${s / 2}$.`, `$V(x) = x(${s} - 2x)^2$; domain $0 < x < ${s / 2}$.`), T(`Volumes: ${vols.join(', ')} cm³; greatest tested at $x = ${bestX}$, $V = ${best}$ cm³.`, `Isipadu: ${vols.join(', ')} cm³; terbesar yang diuji pada $x = ${bestX}$, $V = ${best}$ cm³.`), T(`Only whole-number values of $x$ were tested, so a value between these (e.g. using steps of 0.5 cm) might give a larger volume; without calculus, only a finer step-by-step search (not an exact proof) can improve on this.`, `Hanya nilai $x$ bernombor bulat diuji, jadi suatu nilai antaranya (contohnya menggunakan langkah 0.5 cm) mungkin memberikan isipadu yang lebih besar; tanpa kalkulus, hanya carian langkah demi langkah yang lebih halus (bukan bukti tepat) dapat menambah baik ini.`)];
      return { q: T(`A square sheet of ${mat.en} of side ${s} cm is used to build an open box by cutting a square of side $x$ cm from each corner and folding up the sides. ${TAG_MENS.en}<br>${SPM.parts(parts).en}`, `Sekeping kepingan ${mat.ms} berbentuk segi empat sama bersisi ${s} cm digunakan untuk membina kotak terbuka dengan memotong segi empat sama bersisi $x$ cm dari setiap sudut dan melipat ke atas sisi-sisinya. ${TAG_MENS.ms}<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // full closed-cylinder cycle
    (r) => {
      const can = r.pick(CYLCTX);
      const K = r.pick([150, 200, 250, 300]);
      const cands = [2, 3, 4, 5];
      const areas = cands.map((rr) => round(2 * 3.142 * rr * rr + (2 * K) / rr, 1));
      const best = Math.min(...areas);
      const bestR = cands[areas.indexOf(best)];
      const parts = [T(`Given the fixed volume is $${K}$ cm³, show that the surface area of this CLOSED cylinder is $S = 2\\pi r^2 + \\dfrac{2(${K})}{r}$ (using $h = \\dfrac{${K}}{\\pi r^2}$).`, `Memandangkan isipadu tetap ialah $${K}$ cm³, tunjukkan bahawa luas permukaan silinder TERTUTUP ini ialah $S = 2\\pi r^2 + \\dfrac{2(${K})}{r}$ (menggunakan $h = \\dfrac{${K}}{\\pi r^2}$).`), T(`Using $\\pi \\approx 3.142$, complete a table of $S$ for $r = ${cands.join(', ')}$ cm, and state the radius among these that gives the smallest tested surface area.`, `Dengan $\\pi \\approx 3.142$, lengkapkan jadual $S$ bagi $r = ${cands.join(', ')}$ cm, dan nyatakan jejari antara nilai ini yang memberikan luas permukaan terkecil yang diuji.`)];
      const ansParts = [T(`$S = 2\\pi r^2 + 2\\pi r h = 2\\pi r^2 + 2\\pi r \\left(\\dfrac{${K}}{\\pi r^2}\\right) = 2\\pi r^2 + \\dfrac{2(${K})}{r}$`, `$S = 2\\pi r^2 + 2\\pi r h = 2\\pi r^2 + 2\\pi r \\left(\\dfrac{${K}}{\\pi r^2}\\right) = 2\\pi r^2 + \\dfrac{2(${K})}{r}$`), T(`$S$-values: ${areas.map((v) => n(v)).join(', ')} cm²; smallest tested at $r = ${bestR}$ cm, $S \\approx ${n(best)}$ cm² (best among tested values, not a proven minimum).`, `Nilai $S$: ${areas.map((v) => n(v)).join(', ')} cm²; terkecil yang diuji pada $r = ${bestR}$ cm, $S \\approx ${n(best)}$ cm² (terbaik antara nilai yang diuji, bukan minimum yang terbukti).`)];
      return { q: T(`${SPM.cap(can.en)}, a closed cylinder, must hold a fixed volume of ${K} cm³.<br>${SPM.parts(parts).en}`, `${SPM.cap(can.ms)}, sebuah silinder tertutup, mesti memuatkan isipadu tetap ${K} cm³.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // residual comparison between two candidate models, with a validity caution
    (r) => {
      const item = r.pick(PROFIT_ITEM);
      const xs = [1, 2, 3, 4];
      const predsA = xs.map(() => r.int(10, 40));
      const devsA = xs.map(() => r.pick([-1, 1]) * r.int(1, 3));
      const actuals = predsA.map((p, i) => p + devsA[i]);
      const predsB = actuals.map((v) => v + r.pick([-1, 1]) * r.int(2, 6));
      const resA = actuals.map((a, i) => Math.abs(a - predsA[i])).reduce((s, v) => s + v, 0);
      const resB = actuals.map((a, i) => Math.abs(a - predsB[i])).reduce((s, v) => s + v, 0);
      const parts = [T(`Using residual $=$ actual $-$ predicted, find the sum of absolute residuals for Model A and for Model B.`, `Dengan menggunakan baki $=$ sebenar $-$ ramalan, cari hasil tambah baki mutlak bagi Model A dan bagi Model B.`), T(`State which model fits the data better at these points, and explain why a smaller residual sum here does not, by itself, prove that model is correct in general.`, `Nyatakan model manakah lebih sepadan dengan data pada titik-titik ini, dan terangkan mengapa hasil tambah baki yang lebih kecil di sini, dengan sendirinya, tidak membuktikan model itu betul secara umum.`)];
      const ansParts = [T(`Model A: ${resA}; Model B: ${resB}.`, `Model A: ${resA}; Model B: ${resB}.`), T(`Model ${resA < resB ? 'A' : 'B'} fits better here (smaller residual sum), but this only shows a better fit at these ${xs.length} tested points — it does not prove the model is valid elsewhere or that it captures the true cause of the pattern.`, `Model ${resA < resB ? 'A' : 'B'} lebih sepadan di sini (hasil tambah baki lebih kecil), tetapi ini hanya menunjukkan kesesuaian yang lebih baik pada ${xs.length} titik yang diuji ini — ia tidak membuktikan model itu sah di tempat lain atau bahawa ia menggambarkan punca sebenar corak tersebut.`)];
      return { q: T(`Weekly sales of ${item.en} at $x = ${xs.join(', ')}$ (weeks) were actually ${actuals.join(', ')}. Model A predicted ${predsA.join(', ')}; Model B predicted ${predsB.join(', ')}.<br>${SPM.parts(parts).en}`, `Jualan mingguan ${item.ms} pada $x = ${xs.join(', ')}$ (minggu) sebenarnya ialah ${actuals.join(', ')}. Model A meramalkan ${predsA.join(', ')}; Model B meramalkan ${predsB.join(', ')}.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // full inequality-region optimisation with 4 supplied vertices
    (r) => {
      const obj = r.pick(OBJCTX);
      const a = r.int(3, 8), b = r.int(2, 7);
      const verts = [[0, 0], [r.int(5, 9), 0], [r.int(3, 6), r.int(3, 6)], [0, r.int(4, 8)]];
      const vals = verts.map(([x, y]) => a * x + b * y);
      const maxV = Math.max(...vals);
      const bestV = verts[vals.indexOf(maxV)];
      const parts = [T(`Find the value of the objective function for ${obj.en}, $P = ${a}x + ${b}y$, at each of the four vertices.`, `Cari nilai fungsi objektif bagi ${obj.ms}, $P = ${a}x + ${b}y$, pada setiap satu daripada empat bucu.`), T(`State the vertex that gives the maximum value of $P$, and explain why only the vertices (not the interior) of the region need to be checked.`, `Nyatakan bucu yang memberikan nilai maksimum $P$, dan terangkan mengapa hanya bucu (bukan bahagian dalam) rantau itu perlu disemak.`)];
      const ansParts = [T(`$P$-values at $(${verts[0].join(',')})$, $(${verts[1].join(',')})$, $(${verts[2].join(',')})$, $(${verts[3].join(',')})$: ${vals.join(', ')}.`, `Nilai $P$ pada $(${verts[0].join(',')})$, $(${verts[1].join(',')})$, $(${verts[2].join(',')})$, $(${verts[3].join(',')})$: ${vals.join(', ')}.`), T(`Maximum at $(${bestV.join(', ')})$, $P = ${maxV}$; for a linear objective function over a polygon region, the maximum (or minimum) always occurs at a vertex (corner point), never strictly inside.`, `Maksimum pada $(${bestV.join(', ')})$, $P = ${maxV}$; bagi fungsi objektif linear ke atas rantau poligon, nilai maksimum (atau minimum) sentiasa berlaku pada bucu (titik sudut), tidak pernah di bahagian dalam sepenuhnya.`)];
      return { q: T(`A feasible region (from a set of supplied constraints) has vertices at $(${verts[0].join(', ')})$, $(${verts[1].join(', ')})$, $(${verts[2].join(', ')})$ and $(${verts[3].join(', ')})$. ${TAG_INEQ.en}<br>${SPM.parts(parts).en}`, `Suatu rantau tersaur (daripada satu set kekangan yang diberikan) mempunyai bucu pada $(${verts[0].join(', ')})$, $(${verts[1].join(', ')})$, $(${verts[2].join(', ')})$ dan $(${verts[3].join(', ')})$. ${TAG_INEQ.ms}<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // network route choice with a cost-per-distance twist
    (r) => {
      const [p, q] = r.sample(SPM.bank.places, 2);
      const distA = r.int(15, 30), distB = r.int(10, 25);
      need(distA !== distB);
      const rate = r.pick([0.5, 0.6, 0.8]);
      const tollB = r.pick([2, 3, 5]);
      const costA = round(distA * rate, 2);
      const costB = round(distB * rate + tollB, 2);
      const parts = [T(`Find the fuel cost of each route (distance $\\times$ RM${rate} per km).`, `Cari kos bahan api bagi setiap laluan (jarak $\\times$ RM${rate} setiap km).`), T(`Route B also has a toll of RM${tollB}. Find the total cost of each route including any toll, and recommend the cheaper route.`, `Laluan B turut mempunyai tol RM${tollB}. Cari jumlah kos setiap laluan termasuk sebarang tol, dan cadangkan laluan yang lebih murah.`)];
      const ansParts = [T(`Route A: ${n(round(distA * rate, 2))}; Route B (before toll): ${n(round(distB * rate, 2))}.`, `Laluan A: ${n(round(distA * rate, 2))}; Laluan B (sebelum tol): ${n(round(distB * rate, 2))}.`), T(`Route A total: RM${n(costA)}; Route B total: RM${n(costB)}; Route ${costA < costB ? 'A' : 'B'} is cheaper overall.`, `Jumlah Laluan A: RM${n(costA)}; jumlah Laluan B: RM${n(costB)}; Laluan ${costA < costB ? 'A' : 'B'} lebih murah secara keseluruhan.`)];
      return { q: T(`Route A from ${p.en} to ${q.en} is ${distA} km with no toll. Route B is ${distB} km.<br>${SPM.parts(parts).en}`, `Laluan A dari ${p.ms} ke ${q.ms} ialah ${distA} km tanpa tol. Laluan B ialah ${distB} km.<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
    // direct/inverse variation, full cycle with domain and assumption
    (r) => {
      const item = r.pick(VITEM);
      const direct = r.chance();
      const k = r.int(6, 48);
      const x1 = direct ? r.int(2, 8) : r.pick(SPM.factors(k).filter((d) => d >= 2 && d <= 8));
      const y1 = direct ? k * x1 : k / x1;
      need(Number.isInteger(y1));
      const x2 = direct ? r.int(2, 10) : r.pick(SPM.factors(k).filter((d) => d >= 2 && d <= 10 && d !== x1));
      need(x2 !== undefined && x2 !== x1);
      const y2 = direct ? k * x2 : k / x2;
      const setup = direct ? T(`Given that the cost, RM$y$, of ${item.en} varies directly with its mass, $x$ kg, and $y = ${y1}$ when $x = ${x1}$, find the model.`, `Diberi kos, RM$y$, ${item.ms} berubah secara langsung dengan jisimnya, $x$ kg, dan $y = ${y1}$ apabila $x = ${x1}$, cari model itu.`) : T(`Given that the cost per person, RM$y$, of sharing a hired venue varies inversely with the number of people sharing it, $x$, and $y = ${y1}$ when $x = ${x1}$, find the model.`, `Diberi kos bagi setiap orang, RM$y$, berkongsi sebuah tempat yang disewa berubah secara songsang dengan bilangan orang yang berkongsinya, $x$, dan $y = ${y1}$ apabila $x = ${x1}$, cari model itu.`);
      const parts = [setup, T(`Find $y$ when $x = ${x2}$, and state one assumption needed for this model to be reasonable.`, `Cari $y$ apabila $x = ${x2}$, dan nyatakan satu andaian yang diperlukan supaya model ini munasabah.`)];
      const ansParts = [T(`$k = ${direct ? `${y1}/${x1}` : `${x1} \\times ${y1}`} = ${k}$; $y = ${direct ? `${k}x` : `${k}/x`}$`, `$k = ${direct ? `${y1}/${x1}` : `${x1} \\times ${y1}`} = ${k}$; $y = ${direct ? `${k}x` : `${k}/x`}$`), T(`$y = ${y2}$ when $x = ${x2}$; assumption: ${direct ? 'the price per kg stays the same regardless of the mass bought' : 'the total hire cost stays fixed no matter how many people share it'}.`, `$y = ${y2}$ apabila $x = ${x2}$; andaian: ${direct ? 'harga bagi setiap kg kekal sama tidak kira berapa jisim yang dibeli' : 'jumlah kos sewaan kekal tetap tidak kira berapa ramai yang berkongsinya'}.`)];
      return { q: T(`${TAG_VAR.en}<br>${SPM.parts(parts).en}`, `${TAG_VAR.ms}<br>${SPM.parts(parts).ms}`), a: SPM.parts(ansParts), sp: 'l' };
    },
  ];
  SPM.extend('F5-8.6', { e: g86e, m: g86m, a: g86a });
})();
