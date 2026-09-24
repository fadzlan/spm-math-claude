/* Variety pack x5b: extra generators for F5 Ch3 (Consumer Mathematics: Insurance), Ch4 (Consumer
 * Mathematics: Taxation) and Ch7 (Measures of Dispersion of Grouped Data). See tools/PACKS.md.
 * All monetary rates/bands/schedules used below are illustrative, self-contained "for this question"
 * data (per syllabus/form5/ch03 and ch04 generator notes) — never presented as current law. */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, retry, round, sum, mean, median, rm, fx } = SPM;
  const T = SPM.L, S = SPM.svg;
  const W = SPM.lines;
  /** "life" / "general" insurance label of an INS_SCEN entry */
  const insKind = (c) => (c.type === 'life' ? T('life insurance', 'insurans hayat') : T('general insurance', 'insurans am'));
  const KIND_RULE = T('Life insurance covers the risk of death; general insurance covers loss or damage from a specific event (health, motor, fire, travel, property …).', 'Insurans hayat melindungi risiko kematian; insurans am melindungi kerugian atau kerosakan akibat peristiwa tertentu (kesihatan, motor, kebakaran, perjalanan, harta …).');
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  /* =================================================================================== Ch3/Ch4 shared banks */

  /* ---------------------------------------------------------------------- insurance context banks */
  const INS_SCEN = [
    { en: 'paying for a hospital operation and daily hospital charges', ms: 'membayar pembedahan di hospital dan caj harian hospital', type: 'general', sub: T('medical (health) insurance', 'insurans perubatan (kesihatan)') },
    { en: 'repairing a car after a road accident', ms: 'membaiki kereta selepas kemalangan jalan raya', type: 'general', sub: T('motor insurance', 'insurans motor') },
    { en: "providing money for a family if the breadwinner dies", ms: 'menyediakan wang untuk keluarga jika pencari nafkah meninggal dunia', type: 'life', sub: T('life insurance', 'insurans hayat') },
    { en: 'repairing a house damaged by fire', ms: 'membaiki rumah yang rosak akibat kebakaran', type: 'general', sub: T('fire (home) insurance', 'insurans kebakaran (rumah)') },
    { en: 'compensation for permanent disability caused by an accident', ms: 'pampasan bagi kehilangan upaya kekal akibat kemalangan', type: 'general', sub: T('personal accident insurance', 'insurans kemalangan diri') },
    { en: 'covering medical costs and lost luggage during an overseas holiday', ms: 'menampung kos perubatan dan bagasi hilang semasa percutian luar negara', type: 'general', sub: T('travel insurance', 'insurans perjalanan') },
    { en: "paying a lump sum to a policyholder's dependants if death occurs within the policy term", ms: 'membayar sejumlah wang kepada tanggungan pemegang polisi jika berlaku kematian dalam tempoh polisi', type: 'life', sub: T('term life insurance', 'insurans hayat bertempoh') },
    { en: 'replacing stock and equipment lost in a shop robbery', ms: 'menggantikan stok dan peralatan yang hilang akibat rompakan kedai', type: 'general', sub: T('general (business property) insurance', 'insurans am (harta perniagaan)') },
  ];
  const TERMS = [
    { term: T('premium', 'premium'), def: T('the amount the policyholder pays (usually every year) to keep the policy in force', 'jumlah yang dibayar oleh pemegang polisi (biasanya setiap tahun) untuk mengekalkan polisi berkuat kuasa'), ex: T(`e.g. paying ${rm(600)} every year to keep a car insured`, `cth. membayar ${rm(600)} setiap tahun untuk mengekalkan insurans kereta`) },
    { term: T('sum insured (face value)', 'jumlah diinsuranskan (nilai muka)'), def: T('the maximum amount the insurer will pay out under the policy', 'jumlah maksimum yang akan dibayar oleh penanggung insurans di bawah polisi itu'), ex: T(`e.g. a house insured for ${rm(300000)}: the insurer pays at most ${rm(300000)}`, `cth. rumah diinsuranskan sebanyak ${rm(300000)}: penanggung insurans membayar paling banyak ${rm(300000)}`) },
    { term: T('deductible (excess)', 'deduktibel (lebihan)'), def: T('the part of each claim that the policyholder must pay first, before the insurer pays the rest', 'bahagian setiap tuntutan yang mesti dibayar dahulu oleh pemegang polisi, sebelum penanggung insurans membayar selebihnya'), ex: T(`e.g. deductible ${rm(500)}, loss ${rm(3000)}: the policyholder pays ${rm(500)}, the insurer pays ${rm(2500)}`, `cth. deduktibel ${rm(500)}, kerugian ${rm(3000)}: pemegang polisi membayar ${rm(500)}, penanggung insurans membayar ${rm(2500)}`) },
    { term: T('co-insurance', 'ko-insurans'), def: T('a clause requiring the property to be insured for at least a stated percentage of its value, or the payout is reduced proportionally', 'klausa yang memerlukan harta diinsuranskan sekurang-kurangnya suatu peratusan tertentu daripada nilainya, jika tidak bayaran dikurangkan secara berkadar'), ex: T(`e.g. an 80% clause on a ${rm(200000)} house requires a sum insured of at least ${rm(160000)}`, `cth. klausa 80% bagi rumah bernilai ${rm(200000)} memerlukan jumlah diinsuranskan sekurang-kurangnya ${rm(160000)}`) },
    { term: T('indemnity principle', 'prinsip indemniti'), def: T('a payout must restore the policyholder to their financial position just before the loss, without creating a profit', 'bayaran mesti memulihkan kedudukan kewangan pemegang polisi seperti sebelum kerugian, tanpa mewujudkan keuntungan'), ex: T(`e.g. a covered loss of ${rm(5000)} is paid at most ${rm(5000)}, never more`, `cth. kerugian dilindungi ${rm(5000)} dibayar paling banyak ${rm(5000)}, tidak lebih`) },
    { term: T('risk pooling', 'pengumpulan risiko'), def: T('many policyholders pay premiums into a common fund, which is used to pay the claims of the few who suffer a loss', 'ramai pemegang polisi membayar premium ke dalam satu tabung bersama, yang digunakan untuk membayar tuntutan segelintir yang mengalami kerugian'), ex: T(`e.g. 1 000 people each pay ${rm(100)} into one fund, which pays the claims of the few who suffer a loss`, `cth. 1 000 orang masing-masing membayar ${rm(100)} ke dalam satu tabung, yang membayar tuntutan segelintir yang mengalami kerugian`) },
    { term: T('policy limit', 'had polisi'), def: T('the maximum amount the insurer will pay for a claim or a type of claim', 'jumlah maksimum yang akan dibayar oleh penanggung insurans bagi sesuatu tuntutan atau jenis tuntutan'), ex: T(`e.g. with a limit of ${rm(10000)}, a claim of ${rm(15000)} is paid only ${rm(10000)}`, `cth. dengan had ${rm(10000)}, tuntutan ${rm(15000)} dibayar ${rm(10000)} sahaja`) },
    { term: T('no-claim discount (NCD)', 'diskaun tanpa tuntutan (NCD)'), def: T('a reduction in premium given for each consecutive year that passes without the policyholder making a claim', 'pengurangan premium yang diberikan bagi setiap tahun berturut-turut yang berlalu tanpa pemegang polisi membuat tuntutan'), ex: T(`e.g. a premium of ${rm(1000)} with an NCD of 25% becomes ${rm(750)}`, `cth. premium ${rm(1000)} dengan NCD 25% menjadi ${rm(750)}`) },
    { term: T('beneficiary', 'benefisiari'), def: T('the person who receives the payout from a life insurance policy', 'orang yang menerima bayaran daripada sesuatu polisi insurans hayat'), ex: T('e.g. the spouse or children named in a life policy', 'cth. pasangan atau anak-anak yang dinamakan dalam polisi hayat') },
    { term: T('exclusion', 'pengecualian'), def: T('an event or a type of loss that the policy explicitly does not cover', 'peristiwa atau jenis kerugian yang secara jelas tidak dilindungi oleh polisi'), ex: T('e.g. damage caused by war or by a deliberate act is not covered', 'cth. kerosakan akibat perang atau perbuatan sengaja tidak dilindungi') },
  ];
  const PREMIUM_FACTORS = [
    { en: "a driver's young age or very old age", ms: 'umur pemandu yang muda atau sangat tua', dir: 'higher', reason: T('young and very old drivers are statistically more likely to be involved in a claim', 'pemandu muda dan sangat tua secara statistik lebih berkemungkinan terlibat dalam tuntutan') },
    { en: "a car's larger engine capacity", ms: 'kuasa enjin kereta yang lebih besar', dir: 'higher', reason: T('a more powerful car is more expensive to repair and more likely to be in a serious accident', 'kereta yang lebih berkuasa lebih mahal untuk dibaiki dan lebih berkemungkinan terlibat dalam kemalangan serius') },
    { en: 'a higher sum insured', ms: 'jumlah diinsuranskan yang lebih tinggi', dir: 'higher', reason: T('the insurer is exposed to a larger possible payout', 'penanggung insurans terdedah kepada bayaran yang lebih besar') },
    { en: 'a longer no-claim record (more consecutive years without a claim)', ms: 'rekod tanpa tuntutan yang lebih lama (lebih banyak tahun berturut-turut tanpa tuntutan)', dir: 'lower', reason: T('the policyholder qualifies for a larger no-claim discount', 'pemegang polisi layak mendapat diskaun tanpa tuntutan yang lebih besar') },
    { en: 'an occupation with a higher health or accident risk', ms: 'pekerjaan dengan risiko kesihatan atau kemalangan yang lebih tinggi', dir: 'higher', reason: T('the insurer expects more, or costlier, claims from people in that occupation', 'penanggung insurans menjangkakan lebih banyak, atau lebih mahal, tuntutan daripada orang dalam pekerjaan itu') },
    { en: 'a pre-existing medical condition', ms: 'keadaan perubatan sedia ada', dir: 'higher', reason: T('the policyholder is more likely to make a medical claim', 'pemegang polisi lebih berkemungkinan membuat tuntutan perubatan') },
    { en: 'wider coverage with fewer exclusions', ms: 'perlindungan yang lebih luas dengan kurang pengecualian', dir: 'higher', reason: T('more events are covered, so more claims are likely to be valid', 'lebih banyak peristiwa dilindungi, jadi lebih banyak tuntutan berkemungkinan sah') },
    { en: 'choosing a higher deductible', ms: 'memilih deduktibel yang lebih tinggi', dir: 'lower', reason: T('the policyholder agrees to pay more of each claim, so the insurer expects to pay less', 'pemegang polisi bersetuju membayar lebih banyak bagi setiap tuntutan, jadi penanggung insurans menjangka membayar kurang') },
  ];
  const INS_TF = [
    { en: 'Insurance removes risk completely.', ms: 'Insurans menghapuskan risiko sepenuhnya.', ok: false, why: T('insurance transfers the financial risk to the insurer; it does not stop the event from happening', 'insurans memindahkan risiko kewangan kepada penanggung insurans; ia tidak menghalang peristiwa itu daripada berlaku'), key: T('Insurance = transferring the financial risk of a loss to the insurer.', 'Insurans = memindahkan risiko kewangan sesuatu kerugian kepada penanggung insurans.') },
    { en: 'A premium is paid by the insurer to the policyholder.', ms: 'Premium dibayar oleh penanggung insurans kepada pemegang polisi.', ok: false, why: T('the premium is paid by the policyholder to the insurer, in exchange for cover', 'premium dibayar oleh pemegang polisi kepada penanggung insurans, sebagai pertukaran untuk perlindungan'), key: T('Policyholder pays the premium → insurer; insurer pays claims → policyholder.', 'Pemegang polisi membayar premium → penanggung insurans; penanggung insurans membayar tuntutan → pemegang polisi.') },
    { en: 'Motor insurance is an example of general insurance.', ms: 'Insurans motor ialah contoh insurans am.', ok: true, why: T('motor insurance covers a specific event such as an accident; this is general, not life, insurance', 'insurans motor melindungi peristiwa tertentu seperti kemalangan; ini ialah insurans am, bukan insurans hayat'), key: T('Life insurance: risk of death. General insurance: loss from a specific event (motor, fire, medical, travel …).', 'Insurans hayat: risiko kematian. Insurans am: kerugian akibat peristiwa tertentu (motor, kebakaran, perubatan, perjalanan …).') },
    { en: 'The sum insured is always exactly equal to the annual premium.', ms: 'Jumlah diinsuranskan sentiasa sama tepat dengan premium tahunan.', ok: false, why: T('the sum insured is the maximum possible payout, while the premium is the much smaller amount paid each year for cover', 'jumlah diinsuranskan ialah bayaran maksimum yang mungkin, manakala premium ialah jumlah yang jauh lebih kecil yang dibayar setiap tahun untuk perlindungan'), key: T('Sum insured = maximum payout; premium = price of the cover each year.', 'Jumlah diinsuranskan = bayaran maksimum; premium = harga perlindungan setiap tahun.') },
    { en: 'A deductible is paid by the policyholder, not the insurer.', ms: 'Deduktibel dibayar oleh pemegang polisi, bukan penanggung insurans.', ok: true, why: T("the deductible is the policyholder's own share of a claim, paid before the insurer pays the rest", 'deduktibel ialah bahagian pemegang polisi sendiri bagi sesuatu tuntutan, dibayar sebelum penanggung insurans membayar selebihnya'), key: T('Claim = deductible (policyholder) + payout (insurer).', 'Tuntutan = deduktibel (pemegang polisi) + bayaran (penanggung insurans).') },
    { en: 'Two people who choose the same insurer must always pay the same premium for the same type of policy.', ms: 'Dua orang yang memilih penanggung insurans yang sama mesti sentiasa membayar premium yang sama bagi jenis polisi yang sama.', ok: false, why: T('premiums also depend on personal risk factors such as age, health, coverage and claims history, not only the insurer chosen', 'premium juga bergantung pada faktor risiko peribadi seperti umur, kesihatan, perlindungan dan rekod tuntutan, bukan hanya penanggung insurans yang dipilih'), key: T('The premium is set by the risk of each policyholder, not only by the insurer.', 'Premium ditentukan oleh risiko setiap pemegang polisi, bukan hanya oleh penanggung insurans.') },
  ];
  const INDEMNITY_STMT = [
    { en: 'A policyholder insures the same car with two different insurers for its full value, and after an accident claims the full repair cost from both companies.', ms: 'Seorang pemegang polisi menginsuranskan kereta yang sama dengan dua penanggung insurans berlainan untuk nilai penuhnya, dan selepas kemalangan menuntut kos pembaikan penuh daripada kedua-dua syarikat.', ok: false, why: T('this would let the policyholder profit from the loss, which breaks the indemnity principle; the combined payout from both insurers is limited to the actual repair cost', 'ini akan membolehkan pemegang polisi mendapat keuntungan daripada kerugian, yang melanggar prinsip indemniti; jumlah bayaran gabungan daripada kedua-dua penanggung insurans dihadkan kepada kos pembaikan sebenar'), key: T('Indemnity: total payout ≤ actual loss, so no profit is made from a loss.', 'Indemniti: jumlah bayaran ≤ kerugian sebenar, jadi tiada keuntungan daripada kerugian.') },
    { en: 'A payout for a fire claim is capped so that it never exceeds the actual value of the property lost.', ms: 'Bayaran bagi tuntutan kebakaran dihadkan supaya ia tidak pernah melebihi nilai sebenar harta yang hilang.', ok: true, why: T('this follows the indemnity principle: insurance restores the loss, it does not create a profit', 'ini mematuhi prinsip indemniti: insurans memulihkan kerugian, ia tidak mewujudkan keuntungan'), key: T('Indemnity: total payout ≤ actual loss, so no profit is made from a loss.', 'Indemniti: jumlah bayaran ≤ kerugian sebenar, jadi tiada keuntungan daripada kerugian.') },
    { en: 'A policyholder is paid more than the cost of the item lost, as a reward for holding the policy for many years.', ms: 'Seorang pemegang polisi dibayar lebih daripada kos barang yang hilang, sebagai ganjaran kerana memegang polisi selama bertahun-tahun.', ok: false, why: T('this would breach the indemnity (non-profit) principle; loyalty may earn a premium discount, not a payout above the loss', 'ini akan melanggar prinsip indemniti (tanpa keuntungan); kesetiaan mungkin memberikan diskaun premium, bukan bayaran melebihi kerugian'), key: T('Indemnity: total payout ≤ actual loss, so no profit is made from a loss.', 'Indemniti: jumlah bayaran ≤ kerugian sebenar, jadi tiada keuntungan daripada kerugian.') },
    { en: 'Life insurance pays the fixed sum assured agreed in the policy, regardless of the exact financial loss suffered by the family.', ms: 'Insurans hayat membayar jumlah tetap yang dipersetujui dalam polisi, tanpa mengira kerugian kewangan sebenar yang dialami oleh keluarga.', ok: true, why: T('life insurance is not a strict indemnity contract; it pays the agreed sum assured on death, not a measured financial loss', 'insurans hayat bukan kontrak indemniti yang ketat; ia membayar jumlah yang dipersetujui apabila kematian, bukan kerugian kewangan yang diukur'), key: T('Life insurance pays the agreed sum assured; the indemnity (payout ≤ loss) rule applies to general insurance.', 'Insurans hayat membayar jumlah yang dipersetujui; peraturan indemniti (bayaran ≤ kerugian) terpakai bagi insurans am.') },
    { en: 'A policyholder deliberately over-declares the value of damaged goods so the payout is larger than the actual loss.', ms: 'Seorang pemegang polisi sengaja menyatakan nilai barang rosak lebih tinggi daripada sebenarnya supaya bayaran lebih besar daripada kerugian sebenar.', ok: false, why: T('this breaks the indemnity principle and is a form of insurance fraud; a payout may not exceed the actual covered loss', 'ini melanggar prinsip indemniti dan merupakan satu bentuk penipuan insurans; bayaran tidak boleh melebihi kerugian sebenar yang dilindungi'), key: T('Indemnity: total payout ≤ actual loss, so no profit is made from a loss.', 'Indemniti: jumlah bayaran ≤ kerugian sebenar, jadi tiada keuntungan daripada kerugian.') },
  ];
  const NCD_CTX = [
    { en: 'Insurer Amanah Motor', ms: 'Penanggung Insurans Amanah Motor', year: 2023 },
    { en: 'Insurer Selamat Auto', ms: 'Penanggung Insurans Selamat Auto', year: 2022 },
    { en: 'Insurer Perdana Cover', ms: 'Penanggung Insurans Perdana Cover', year: 2024 },
    { en: 'Insurer Ceria Takaful', ms: 'Penanggung Insurans Ceria Takaful', year: 2023 },
  ];
  /** builds a plausible (never "the real" official scale), always-increasing NCD ladder for years 0..5 */
  function ncdLadder(r) {
    const rows = [0];
    for (let i = 1; i <= 5; i++) rows.push(rows[i - 1] + r.pick([5, 8, 10, 12]));
    need(rows[5] <= 65);
    return rows;
  }
  const ncdTable = (rows, lang) => SPM.table(rows.map((d, y) => [y, d + '%']), { head: lang === 'en' ? ['Consecutive claim-free years', 'NCD'] : ['Tahun tanpa tuntutan berturut-turut', 'NCD'] });
  const ncdLabel = (ctx) => T(`${ctx.en} NCD schedule (as of ${ctx.year}). For this question, use the schedule given.`, `Jadual NCD ${ctx.ms} (sehingga ${ctx.year}). Untuk soalan ini, gunakan jadual yang diberikan.`);

  const PLAN_ITEMS = [
    { en: 'Hospital daily room & board', ms: 'Bilik & penginapan hospital harian' },
    { en: 'Surgical fees', ms: 'Yuran pembedahan' },
    { en: 'Outpatient treatment', ms: 'Rawatan pesakit luar' },
    { en: 'Accidental death benefit', ms: 'Manfaat kematian akibat kemalangan' },
    { en: 'Third-party property damage', ms: 'Kerosakan harta pihak ketiga' },
    { en: 'Windscreen damage', ms: 'Kerosakan cermin depan' },
    { en: 'Personal belongings', ms: 'Barangan peribadi' },
  ];
  const schedTableHTML = (plans, items, prem, limits, lang) =>
    SPM.table(
      [[lang === 'en' ? 'Premium (RM/year)' : 'Premium (RM/tahun)', ...prem.map(n)]].concat(items.map((it, i) => [it[lang], ...limits[i].map(n)])),
      { head: ['', ...plans], rowHead: true }
    );

  /* =============================================================== 3.1 Insurance (concept) */
  const g31e = [
    (r) => {
      const c = r.pick(INS_SCEN);
      const w = r.pick([
        [`Which type of insurance is most suitable for ${c.en}?`, `Insurans jenis manakah yang paling sesuai untuk ${c.ms}?`],
        [`A person wants cover for ${c.en}. Name a suitable type of insurance.`, `Seseorang mahukan perlindungan untuk ${c.ms}. Namakan jenis insurans yang sesuai.`],
        [`State one type of insurance that would help with ${c.en}.`, `Nyatakan satu jenis insurans yang dapat membantu dengan ${c.ms}.`],
      ]);
      return { q: T(w[0], w[1]), a: c.sub, w: W(T(`The risk is ${c.en}, which is covered by ${insKind(c).en}.`, `Risikonya ialah ${c.ms}, yang dilindungi oleh ${insKind(c).ms}.`), T(`Suitable policy: ${c.sub.en}.`, `Polisi yang sesuai: ${c.sub.ms}.`)), sp: 's' };
    },
    (r) => {
      const c = r.pick(INS_SCEN);
      return { q: T(`Is ${c.sub.en} classified as life insurance or general insurance?`, `Adakah ${c.sub.ms} dikelaskan sebagai insurans hayat atau insurans am?`), a: c.type === 'life' ? T('Life insurance', 'Insurans hayat') : T('General insurance', 'Insurans am'), w: W(KIND_RULE, T(`This policy is for ${c.en}, so it is ${insKind(c).en}.`, `Polisi ini adalah untuk ${c.ms}, jadi ia ialah ${insKind(c).ms}.`)), sp: 'xs' };
    },
    (r) => {
      const t = r.pick(TERMS);
      const w = r.pick([
        [`In an insurance policy, what does "${t.term.en}" mean?`, `Dalam sesuatu polisi insurans, apakah maksud "${t.term.ms}"?`],
        [`Define the term "${t.term.en}" as used in insurance.`, `Takrifkan istilah "${t.term.ms}" seperti yang digunakan dalam insurans.`],
        [`Explain what is meant by "${t.term.en}" in a policy.`, `Terangkan apa yang dimaksudkan dengan "${t.term.ms}" dalam sesuatu polisi.`],
      ]);
      return { q: T(w[0], w[1]), a: t.def, w: W(t.ex), sp: 's' };
    },
    (r) => {
      const opts = r.sample(TERMS, 4);
      const ci = r.int(0, 3);
      const correct = opts[ci];
      const L = 'ABCD';
      return { q: T(`Which term matches this description? "${correct.def.en}"<br>${opts.map((o, i) => `(${L[i]}) ${o.term.en}`).join('  ')}`, `Istilah manakah yang sepadan dengan huraian ini? "${correct.def.ms}"<br>${opts.map((o, i) => `(${L[i]}) ${o.term.ms}`).join('  ')}`), a: T(`${L[ci]}: ${correct.term.en}`, `${L[ci]}: ${correct.term.ms}`), w: W(T(`The description is the definition of "${correct.term.en}".`, `Huraian itu ialah takrif "${correct.term.ms}".`), correct.ex), sp: 's' };
    },
    (r) => {
      const f = r.pick(PREMIUM_FACTORS);
      return { q: T(`Would ${f.en} usually increase or decrease an insurance premium? Give a reason.`, `Adakah ${f.ms} biasanya meningkatkan atau menurunkan premium insurans? Berikan sebab.`), a: T(`${f.dir === 'higher' ? 'Increase' : 'Decrease'}: ${f.reason.en}.`, `${f.dir === 'higher' ? 'Meningkatkan' : 'Menurunkan'}: ${f.reason.ms}.`), w: W(T('The premium follows the expected cost of claims to the insurer.', 'Premium mengikut jangkaan kos tuntutan kepada penanggung insurans.'), T(`${f.dir === 'higher' ? 'Higher' : 'Lower'} expected cost → ${f.dir === 'higher' ? 'higher' : 'lower'} premium.`, `Jangkaan kos ${f.dir === 'higher' ? 'lebih tinggi' : 'lebih rendah'} → premium ${f.dir === 'higher' ? 'lebih tinggi' : 'lebih rendah'}.`)), sp: 's' };
    },
    (r) => {
      const s = r.pick(INS_TF);
      return { q: T(`True or false? "${s.en}" Give a reason.`, `Betul atau salah? "${s.ms}" Berikan sebab.`), a: T(`${s.ok ? 'True' : 'False'}: ${s.why.en}.`, `${s.ok ? 'Betul' : 'Salah'}: ${s.why.ms}.`), w: W(s.key, s.ok ? T('The statement agrees with this, so it is true.', 'Pernyataan itu sepadan dengan ini, jadi ia betul.') : T('The statement contradicts this, so it is false.', 'Pernyataan itu bercanggah dengan ini, jadi ia salah.')), sp: 's' };
    },
  ];
  const g31m = [
    (r) => {
      const prem = r.pick([120, 180, 240, 320]), ded = r.pick([200, 500, 1000, 1500]), limit = r.pick([20000, 50000, 100000]);
      const terms = r.sample(['premium', 'deductible', 'limit'], 3);
      return { q: T(`A policy has an annual premium of ${rm(prem)}, a deductible of ${rm(ded)} and a claim limit of ${rm(limit)}. What do the premium, the deductible and the limit mean?`, `Sebuah polisi mempunyai premium tahunan ${rm(prem)}, deduktibel ${rm(ded)} dan had tuntutan ${rm(limit)}. Apakah maksud premium, deduktibel dan had itu?`), a: T('Premium: the amount paid each year for cover. Deductible: the part of each claim the policyholder pays first. Limit: the most the insurer will pay.', 'Premium: jumlah yang dibayar setiap tahun untuk perlindungan. Deduktibel: bahagian setiap tuntutan yang dibayar dahulu oleh pemegang polisi. Had: jumlah maksimum yang akan dibayar oleh penanggung insurans.'), w: W(T(`Example: a covered loss of ${rm(limit / 2)}.`, `Contoh: kerugian dilindungi sebanyak ${rm(limit / 2)}.`), T(`Policyholder pays the deductible ${rm(ded)}; insurer pays $${limit / 2} - ${ded} = ${limit / 2 - ded}$ (below the limit ${rm(limit)}).`, `Pemegang polisi membayar deduktibel ${rm(ded)}; penanggung insurans membayar $${limit / 2} - ${ded} = ${limit / 2 - ded}$ (kurang daripada had ${rm(limit)}).`), T(`The premium ${rm(prem)} is paid every year, whether or not a claim is made.`, `Premium ${rm(prem)} dibayar setiap tahun, sama ada tuntutan dibuat atau tidak.`)), sp: 'm' };
    },
    (r) => {
      const plans = ['Basic', 'Plus', 'Premier'];
      const items = r.sample(PLAN_ITEMS, 3);
      const prem = r.sample([320, 380, 420, 480, 560, 600, 680, 750], 3).sort((a, b) => a - b);
      const limits = items.map(() => r.sample([1000, 2000, 3000, 5000, 8000, 10000, 15000, 20000], plans.length).sort((a, b) => a - b));
      const tabEn = schedTableHTML(plans, items, prem, limits, 'en'), tabMs = schedTableHTML(plans, items, prem, limits, 'ms');
      const qi = r.int(0, items.length - 1);
      const mode = r.pick(['highest', 'least']);
      if (mode === 'highest') {
        return { q: T(`The table shows three plans from an insurer.<br>${tabEn}<br>Which plan offers the highest limit for ${items[qi].en}?`, `Jadual menunjukkan tiga pelan daripada sebuah penanggung insurans.<br>${tabMs}<br>Pelan manakah yang menawarkan had tertinggi untuk ${items[qi].ms}?`), a: T(plans[plans.length - 1], plans[plans.length - 1]), w: W(T(`Row "${items[qi].en}": ${plans.map((p, i) => `${p} ${rm(limits[qi][i])}`).join(', ')}.`, `Baris "${items[qi].ms}": ${plans.map((p, i) => `${p} ${rm(limits[qi][i])}`).join(', ')}.`), T(`The highest limit is ${rm(limits[qi][plans.length - 1])} (${plans[plans.length - 1]}).`, `Had tertinggi ialah ${rm(limits[qi][plans.length - 1])} (${plans[plans.length - 1]}).`)), sp: 'm' };
      }
      const k = r.int(0, plans.length - 1);
      const reqAmt = limits[qi][k];
      return { q: T(`The table shows three plans from an insurer.<br>${tabEn}<br>A customer needs a limit of at least ${rm(reqAmt)} for ${items[qi].en}. Which is the cheapest plan that meets this need?`, `Jadual menunjukkan tiga pelan daripada sebuah penanggung insurans.<br>${tabMs}<br>Seorang pelanggan memerlukan had sekurang-kurangnya ${rm(reqAmt)} untuk ${items[qi].ms}. Pelan manakah yang paling murah yang memenuhi keperluan ini?`), a: T(plans[k], plans[k]), w: W(T(`Plans with a limit of at least ${rm(reqAmt)} for ${items[qi].en}: ${plans.slice(k).join(', ')}.`, `Pelan dengan had sekurang-kurangnya ${rm(reqAmt)} untuk ${items[qi].ms}: ${plans.slice(k).join(', ')}.`), T(`Cheapest of these: ${plans[k]} (premium ${rm(prem[k])}).`, `Paling murah antaranya: ${plans[k]} (premium ${rm(prem[k])}).`)), sp: 'm' };
    },
    (r) => {
      const rows = ncdLadder(r), ctx = r.pick(NCD_CTX);
      const tab = ncdTable(rows, 'en'), tabMs = ncdTable(rows, 'ms'), lab = ncdLabel(ctx);
      const y = r.int(1, 5);
      return { q: T(`${lab.en}<br>${tab}<br>A policyholder has had ${y} consecutive claim-free year${y > 1 ? 's' : ''}. What NCD rate applies?`, `${lab.ms}<br>${tabMs}<br>Seorang pemegang polisi mempunyai ${y} tahun berturut-turut tanpa tuntutan. Apakah kadar NCD yang terpakai?`), a: T(`${rows[y]}%`), w: T(`Read the row for ${y} claim-free year${y > 1 ? 's' : ''}: NCD $= ${rows[y]}\\%$.`, `Baca baris bagi ${y} tahun tanpa tuntutan: NCD $= ${rows[y]}\\%$.`), sp: 'm' };
    },
    (r) => {
      const rows = ncdLadder(r), ctx = r.pick(NCD_CTX);
      const tab = ncdTable(rows, 'en'), tabMs = ncdTable(rows, 'ms'), lab = ncdLabel(ctx);
      const y = r.int(1, 5);
      return { q: T(`${lab.en}<br>${tab}<br>What is the minimum number of consecutive claim-free years needed to reach an NCD of at least ${rows[y]}%?`, `${lab.ms}<br>${tabMs}<br>Berapakah bilangan minimum tahun berturut-turut tanpa tuntutan yang diperlukan untuk mencapai NCD sekurang-kurangnya ${rows[y]}%?`), a: T(`${y} year${y > 1 ? 's' : ''}`, `${y} tahun`), w: W(T(`The NCD rises each year: ${rows.map((d) => d + '%').join(', ')}.`, `NCD meningkat setiap tahun: ${rows.map((d) => d + '%').join(', ')}.`), T(`It first reaches ${rows[y]}% after ${y} year${y > 1 ? 's' : ''}${y > 1 ? ` (after ${y - 1}, only ${rows[y - 1]}%)` : ''}.`, `Ia mula mencapai ${rows[y]}% selepas ${y} tahun${y > 1 ? ` (selepas ${y - 1} tahun, hanya ${rows[y - 1]}%)` : ''}.`)), sp: 'm' };
    },
    (r) => {
      const fs = r.sample(PREMIUM_FACTORS, 2);
      return { q: T(`State two factors, other than an existing claims record, that would affect a person's insurance premium, and explain each briefly.`, `Nyatakan dua faktor, selain rekod tuntutan sedia ada, yang akan mempengaruhi premium insurans seseorang, dan terangkan setiap satu secara ringkas.`), a: T(fs.map((f) => `${f.en} → ${f.dir === 'higher' ? 'increases' : 'decreases'} premium: ${f.reason.en}`).join('; '), fs.map((f) => `${f.ms} → ${f.dir === 'higher' ? 'meningkatkan' : 'menurunkan'} premium: ${f.reason.ms}`).join('; ')), w: W(T('A premium rises with the risk (chance and cost of a claim) and falls when the risk to the insurer is lower.', 'Premium meningkat dengan risiko (kebarangkalian dan kos tuntutan) dan menurun apabila risiko kepada penanggung insurans lebih rendah.'), ...fs.map((f) => T(`For ${f.en}: ${f.dir === 'higher' ? 'higher' : 'lower'} expected claims cost → premium ${f.dir === 'higher' ? 'up' : 'down'}.`, `Bagi ${f.ms}: jangkaan kos tuntutan ${f.dir === 'higher' ? 'lebih tinggi' : 'lebih rendah'} → premium ${f.dir === 'higher' ? 'naik' : 'turun'}.`))), sp: 'm' };
    },
    (r) => {
      const s = r.pick(INDEMNITY_STMT);
      return { q: T(`True or false? "${s.en}" Explain, using the indemnity principle.`, `Betul atau salah? "${s.ms}" Terangkan, menggunakan prinsip indemniti.`), a: T(`${s.ok ? 'True' : 'False'}: ${s.why.en}.`, `${s.ok ? 'Betul' : 'Salah'}: ${s.why.ms}.`), w: W(s.key, s.ok ? T('The statement agrees with this, so it is true.', 'Pernyataan itu sepadan dengan ini, jadi ia betul.') : T('The statement contradicts this, so it is false.', 'Pernyataan itu bercanggah dengan ini, jadi ia salah.')), sp: 'm' };
    },
  ];
  const g31a = [
    (r) => {
      const ctx = r.pick([T('house', 'rumah'), T('shop', 'kedai'), T('car', 'kereta')]);
      const p1 = r.pick([600, 720, 840]), d1 = r.pick([500, 800]), p2 = p1 - r.pick([120, 180, 240]), d2 = d1 + r.pick([700, 1000]);
      const loss = r.pick([3000, 4000, 6000, 8000]);
      return { q: T(`Policy $A$ for a ${ctx.en} has an annual premium of ${rm(p1)} and a deductible of ${rm(d1)}. Policy $B$ has an annual premium of ${rm(p2)} and a deductible of ${rm(d2)}. If a claimable loss of ${rm(loss)} occurs in the year, compare the total cost to the policyholder (premium + deductible paid) under each policy, and recommend one, considering also the cost if no claim is made.`, `Polisi $A$ bagi sebuah ${ctx.ms} mempunyai premium tahunan ${rm(p1)} dan deduktibel ${rm(d1)}. Polisi $B$ mempunyai premium tahunan ${rm(p2)} dan deduktibel ${rm(d2)}. Jika kerugian yang boleh dituntut sebanyak ${rm(loss)} berlaku dalam tahun itu, bandingkan jumlah kos kepada pemegang polisi (premium + deduktibel dibayar) di bawah setiap polisi, dan syorkan satu, dengan turut mempertimbangkan kos jika tiada tuntutan dibuat.`), a: T(`With a claim: A costs ${rm(p1 + d1)}, B costs ${rm(p2 + d2)}, so ${p1 + d1 <= p2 + d2 ? 'A' : 'B'} is cheaper. Without a claim, A costs only ${rm(p1)} and B only ${rm(p2)}, so ${p1 <= p2 ? 'A' : 'B'} is cheaper. The recommendation depends on how likely a claim is.`, `Dengan tuntutan: A berkos ${rm(p1 + d1)}, B berkos ${rm(p2 + d2)}, jadi ${p1 + d1 <= p2 + d2 ? 'A' : 'B'} lebih murah. Tanpa tuntutan, A hanya ${rm(p1)} dan B hanya ${rm(p2)}, jadi ${p1 <= p2 ? 'A' : 'B'} lebih murah. Syor bergantung pada kebarangkalian tuntutan dibuat.`), w: W(T(`With a claim: A $= ${p1} + ${d1} = ${p1 + d1}$, B $= ${p2} + ${d2} = ${p2 + d2}$`, `Dengan tuntutan: A $= ${p1} + ${d1} = ${p1 + d1}$, B $= ${p2} + ${d2} = ${p2 + d2}$`), T(`No claim: A $= ${p1}$, B $= ${p2}$`, `Tanpa tuntutan: A $= ${p1}$, B $= ${p2}$`), T(`B saves ${rm(p1 - p2)} in a year without a claim but costs ${rm(p2 + d2 - p1 - d1)} more in a year with a claim.`, `B menjimatkan ${rm(p1 - p2)} pada tahun tanpa tuntutan tetapi berkos ${rm(p2 + d2 - p1 - d1)} lebih pada tahun dengan tuntutan.`)), sp: 'l' };
    },
    (r) => {
      const value = r.pick([300000, 400000, 500000]), fullCover = r.pick([true, false]);
      const cov1 = value, cov2 = fullCover ? value : Math.round(value * 0.6);
      const p1 = r.pick([900, 1200]), p2 = fullCover ? p1 + r.pick([300, 400]) : p1 - r.pick([200, 300]);
      return { q: T(`A house worth ${rm(value)} can be insured under Policy $X$ (premium ${rm(p1)}, sum insured ${rm(cov1)}) or Policy $Y$ (premium ${rm(p2)}, sum insured ${rm(cov2)}). Explain, using the indemnity principle and the idea of underinsurance, why insuring for less than the full value can leave the policyholder worse off after a large loss, and recommend a policy for someone who cannot afford a shortfall.`, `Sebuah rumah bernilai ${rm(value)} boleh diinsuranskan di bawah Polisi $X$ (premium ${rm(p1)}, jumlah diinsuranskan ${rm(cov1)}) atau Polisi $Y$ (premium ${rm(p2)}, jumlah diinsuranskan ${rm(cov2)}). Terangkan, menggunakan prinsip indemniti dan idea kurang insurans, mengapa menginsuranskan kurang daripada nilai penuh boleh menyebabkan pemegang polisi lebih rugi selepas kerugian besar, dan syorkan satu polisi untuk seseorang yang tidak mampu menanggung kekurangan itu.`), a: T(`If the sum insured is below the value, a total loss is only compensated up to the sum insured, leaving the difference unpaid. Policy $X$ (sum insured ${rm(cov1)}) is safer for someone who cannot afford any shortfall, even though its premium is higher.`, `Jika jumlah diinsuranskan kurang daripada nilai, kerugian penuh hanya dipampas sehingga jumlah diinsuranskan, meninggalkan bakinya tidak dibayar. Polisi $X$ (jumlah diinsuranskan ${rm(cov1)}) lebih selamat untuk seseorang yang tidak mampu menanggung sebarang kekurangan, walaupun preminya lebih tinggi.`), w: W(T(`Total loss under $X$: payout ${rm(cov1)}, shortfall $${value} - ${cov1} = ${value - cov1}$`, `Kerugian penuh di bawah $X$: bayaran ${rm(cov1)}, kekurangan $${value} - ${cov1} = ${value - cov1}$`), T(`Total loss under $Y$: payout ${rm(cov2)}, shortfall $${value} - ${cov2} = ${value - cov2}$`, `Kerugian penuh di bawah $Y$: bayaran ${rm(cov2)}, kekurangan $${value} - ${cov2} = ${value - cov2}$`), fullCover ? T(`Both give full cover and $X$ is ${rm(p2 - p1)} cheaper per year, so choose $X$.`, `Kedua-duanya memberi perlindungan penuh dan $X$ lebih murah ${rm(p2 - p1)} setahun, jadi pilih $X$.`) : T(`$X$ costs ${rm(p1 - p2)} more per year but removes a possible shortfall of ${rm(value - cov2)}.`, `$X$ berkos ${rm(p1 - p2)} lebih setahun tetapi menghapuskan kemungkinan kekurangan ${rm(value - cov2)}.`)), sp: 'l' };
    },
    (r) => {
      const s = r.pick(INDEMNITY_STMT.filter((x) => !x.ok));
      return { q: T(`A friend says: "${s.en}" Explain, with reference to the indemnity (non-profit) principle, why an insurer would refuse this.`, `Seorang rakan berkata: "${s.ms}" Terangkan, dengan merujuk kepada prinsip indemniti (tanpa keuntungan), mengapa penanggung insurans akan menolak perkara ini.`), a: T(s.why.en + '.', s.why.ms + '.'), w: W(s.key, T('The request would pay more than the actual loss, so it is refused.', 'Permintaan itu akan membayar lebih daripada kerugian sebenar, jadi ia ditolak.')), sp: 'm' };
    },
    (r) => {
      const stage = r.pick([
        { en: 'a fresh graduate who has just started working and rents a room', ms: 'seorang graduan baharu yang baru mula bekerja dan menyewa sebuah bilik', pick: T('medical insurance and personal accident insurance (low asset value to protect, but needs income/health protection)', 'insurans perubatan dan insurans kemalangan diri (nilai aset rendah untuk dilindungi, tetapi memerlukan perlindungan pendapatan/kesihatan)'), risk: T('Main risks: illness or injury that stops the income; few assets to protect.', 'Risiko utama: sakit atau cedera yang menghentikan pendapatan; sedikit aset untuk dilindungi.') },
        { en: 'a married couple with two young children and a mortgaged house', ms: 'sepasang suami isteri berkahwin dengan dua orang anak kecil dan sebuah rumah bergadai', pick: T('life insurance (to protect dependants) and fire/home insurance (to protect the house)', 'insurans hayat (untuk melindungi tanggungan) dan insurans kebakaran/rumah (untuk melindungi rumah)'), risk: T('Main risks: death of a parent (the children lose the income) and damage to the house.', 'Risiko utama: kematian ibu atau bapa (anak-anak kehilangan pendapatan) dan kerosakan pada rumah.') },
        { en: 'a small business owner who owns a shop full of stock', ms: 'seorang pemilik perniagaan kecil yang memiliki sebuah kedai penuh dengan stok', pick: T('general (business property) insurance for the stock and premises, and possibly personal accident insurance', 'insurans am (harta perniagaan) untuk stok dan premis, dan mungkin insurans kemalangan diri'), risk: T('Main risks: loss of stock or premises by fire or theft, and injury to the owner.', 'Risiko utama: kehilangan stok atau premis akibat kebakaran atau kecurian, dan kecederaan pemilik.') },
      ]);
      return { q: T(`For ${stage.en}, recommend one or two suitable types of insurance and justify your choice.`, `Bagi ${stage.ms}, syorkan satu atau dua jenis insurans yang sesuai dan justifikasikan pilihan anda.`), a: stage.pick, w: W(stage.risk, T('Choose the policies that protect against these risks.', 'Pilih polisi yang melindungi daripada risiko ini.')), sp: 'm' };
    },
    (r) => {
      const rowsA = ncdLadder(r), rowsB = ncdLadder(r);
      need(rowsA[4] !== rowsB[4]);
      const ctxA = r.pick(NCD_CTX), ctxB = r.pick(NCD_CTX.filter((c) => c.en !== ctxA.en));
      const tabA = ncdTable(rowsA, 'en'), tabAms = ncdTable(rowsA, 'ms');
      const tabB = ncdTable(rowsB, 'en'), tabBms = ncdTable(rowsB, 'ms');
      const y = 4;
      const better = rowsA[y] >= rowsB[y] ? ctxA : ctxB;
      return { q: T(`Two insurers' NCD schedules are shown (for this question, use the schedules given).<br>${ctxA.en}: ${tabA}<br>${ctxB.en}: ${tabB}<br>A driver expects to keep ${y} consecutive claim-free years. Which insurer would give the larger NCD, and by how many percentage points?`, `Jadual NCD dua penanggung insurans ditunjukkan (untuk soalan ini, gunakan jadual yang diberikan).<br>${ctxA.ms}: ${tabAms}<br>${ctxB.ms}: ${tabBms}<br>Seorang pemandu menjangka akan mengekalkan ${y} tahun berturut-turut tanpa tuntutan. Penanggung insurans manakah akan memberikan NCD yang lebih besar, dan berapa mata peratusan lebih besar?`), a: T(`${better.en}, by ${Math.abs(rowsA[y] - rowsB[y])} percentage points.`, `${better.ms}, sebanyak ${Math.abs(rowsA[y] - rowsB[y])} mata peratusan.`), w: W(T(`${ctxA.en}, ${y} years: ${rowsA[y]}%`, `${ctxA.ms}, ${y} tahun: ${rowsA[y]}%`), T(`${ctxB.en}, ${y} years: ${rowsB[y]}%`, `${ctxB.ms}, ${y} tahun: ${rowsB[y]}%`), `$${Math.max(rowsA[y], rowsB[y])} - ${Math.min(rowsA[y], rowsB[y])} = ${Math.abs(rowsA[y] - rowsB[y])}$`), sp: 'l' };
    },
    (r) => {
      const rows = ncdLadder(r), ctx = r.pick(NCD_CTX), lab = ncdLabel(ctx);
      const y1 = r.int(3, 5);
      return { q: T(`${lab.en} The NCD resets to 0% the year after a claim is made.<br>${ncdTable(rows, 'en')}<br>Amir has ${y1} consecutive claim-free years, then makes a claim. What NCD applies in the following year, and how many further claim-free years does he need to return to the NCD he had before the claim?`, `${lab.ms} NCD kembali kepada 0% pada tahun selepas sesuatu tuntutan dibuat.<br>${ncdTable(rows, 'ms')}<br>Amir mempunyai ${y1} tahun berturut-turut tanpa tuntutan, kemudian membuat satu tuntutan. Apakah NCD yang terpakai pada tahun berikutnya, dan berapa tahun tanpa tuntutan selanjutnya yang diperlukan untuk kembali kepada NCD yang dimilikinya sebelum tuntutan itu?`), a: T(`0% the year after the claim; he then needs ${y1} more consecutive claim-free years to reach ${rows[y1]}% again.`, `0% pada tahun selepas tuntutan; dia kemudian memerlukan ${y1} tahun tambahan berturut-turut tanpa tuntutan untuk mencapai semula ${rows[y1]}%.`), w: W(T(`Before the claim: ${y1} claim-free years → NCD ${rows[y1]}%.`, `Sebelum tuntutan: ${y1} tahun tanpa tuntutan → NCD ${rows[y1]}%.`), T('After the claim the count restarts at 0 years → NCD 0%.', 'Selepas tuntutan, kiraan bermula semula pada 0 tahun → NCD 0%.'), T(`The table gives ${rows[y1]}% only at ${y1} claim-free years, so ${y1} more years are needed.`, `Jadual memberi ${rows[y1]}% hanya pada ${y1} tahun tanpa tuntutan, jadi ${y1} tahun lagi diperlukan.`)), sp: 'l' };
    },
  ];
  const COVER_GAPS = [
    { scen: T('a homeowner has fire insurance, but a flash flood damages the house', 'seorang pemilik rumah mempunyai insurans kebakaran, tetapi banjir kilat merosakkan rumahnya'), verdict: T('not covered, because fire insurance only pays for loss caused by fire; flood damage needs a separate policy or an added flood cover', 'tidak dilindungi, kerana insurans kebakaran hanya membayar bagi kerugian akibat kebakaran; kerosakan banjir memerlukan polisi berasingan atau perlindungan banjir tambahan'), cov: T('Fire insurance covers loss caused by fire; this loss is caused by a flood.', 'Insurans kebakaran melindungi kerugian akibat kebakaran; kerugian ini disebabkan oleh banjir.') },
    { scen: T('a driver has basic third-party motor insurance, but their own car is damaged in an accident they caused', 'seorang pemandu mempunyai insurans motor pihak ketiga asas, tetapi keretanya sendiri rosak dalam kemalangan yang disebabkannya'), verdict: T('not covered, because third-party insurance only pays for damage the driver causes to other people or their property, not their own car', 'tidak dilindungi, kerana insurans pihak ketiga hanya membayar bagi kerosakan yang disebabkan pemandu kepada orang lain atau harta mereka, bukan kereta pemandu sendiri'), cov: T("Third-party cover pays for damage to other people and their property; this loss is the driver's own car.", 'Perlindungan pihak ketiga membayar kerosakan kepada orang lain dan harta mereka; kerugian ini ialah kereta pemandu sendiri.') },
    { scen: T('a traveller has travel insurance and their flight is delayed, causing a missed connecting flight', 'seorang pengembara mempunyai insurans perjalanan dan penerbangannya lewat, menyebabkan dia terlepas penerbangan sambungan'), verdict: T('usually covered, because flight-delay compensation is a standard part of most travel insurance policies', 'biasanya dilindungi, kerana pampasan kelewatan penerbangan ialah sebahagian standard kebanyakan polisi insurans perjalanan'), cov: T('Travel insurance covers medical costs, lost luggage and flight delays; this loss is caused by a flight delay.', 'Insurans perjalanan melindungi kos perubatan, bagasi hilang dan kelewatan penerbangan; kerugian ini disebabkan oleh kelewatan penerbangan.') },
    { scen: T('a shop owner has fire insurance and the shop is broken into and stock is stolen', 'seorang pemilik kedai mempunyai insurans kebakaran dan kedainya dipecah masuk serta stok dicuri'), verdict: T('not covered, because fire insurance does not cover theft; a separate burglary/theft policy or an all-risks policy would be needed', 'tidak dilindungi, kerana insurans kebakaran tidak melindungi kecurian; polisi pecah rumah/kecurian berasingan atau polisi semua risiko diperlukan'), cov: T('Fire insurance covers loss caused by fire; this loss is caused by theft.', 'Insurans kebakaran melindungi kerugian akibat kebakaran; kerugian ini disebabkan oleh kecurian.') },
  ];
  const g31a2 = [
    (r) => {
      const c = r.pick(COVER_GAPS);
      return { q: T(`Suppose ${c.scen.en}. Is the loss covered by the policy named? Explain.`, `Andaikan ${c.scen.ms}. Adakah kerugian itu dilindungi oleh polisi yang dinamakan? Terangkan.`), a: T(`It is ${c.verdict.en}.`, `Ia ${c.verdict.ms}.`), w: W(c.cov, T('Compare the cause of the loss with what the policy covers.', 'Bandingkan punca kerugian dengan apa yang dilindungi oleh polisi.')), sp: 'm' };
    },
    (r) => {
      const scenA = r.pick(INS_SCEN), scenB = r.pick(INS_SCEN.filter((s) => s.type !== scenA.type));
      return { q: T(`A person needs cover for both "${scenA.en}" and "${scenB.en}". Explain why a single policy is unlikely to cover both, and name the two types of insurance needed.`, `Seseorang memerlukan perlindungan untuk kedua-dua "${scenA.ms}" dan "${scenB.ms}". Terangkan mengapa satu polisi sahaja tidak mungkin melindungi kedua-duanya, dan namakan dua jenis insurans yang diperlukan.`), a: T(`A life insurance policy and a general insurance policy cover different kinds of risk (a life event versus a specific loss event), so both are needed: ${scenA.sub.en} and ${scenB.sub.en}.`, `Polisi insurans hayat dan polisi insurans am melindungi jenis risiko yang berbeza (peristiwa hayat berbanding peristiwa kerugian tertentu), jadi kedua-duanya diperlukan: ${scenA.sub.ms} dan ${scenB.sub.ms}.`), w: W(T(`"${scenA.en}" → ${insKind(scenA).en}: ${scenA.sub.en}`, `"${scenA.ms}" → ${insKind(scenA).ms}: ${scenA.sub.ms}`), T(`"${scenB.en}" → ${insKind(scenB).en}: ${scenB.sub.en}`, `"${scenB.ms}" → ${insKind(scenB).ms}: ${scenB.sub.ms}`)), sp: 'm' };
    },
    (r) => {
      const f1 = r.pick(PREMIUM_FACTORS.filter((f) => f.dir === 'higher')), f2 = r.pick(PREMIUM_FACTORS.filter((f) => f.dir === 'lower'));
      return { q: T(`A customer is surprised that their premium went up even though they now qualify for a bigger no-claim discount. Explain, using "${f1.en}" as an example of a factor that raises premiums and "${f2.en}" as an example of a factor that lowers them, how the two effects can combine so the net premium still rises.`, `Seorang pelanggan terkejut kerana preminya meningkat walaupun dia kini layak mendapat diskaun tanpa tuntutan yang lebih besar. Terangkan, dengan menggunakan "${f1.ms}" sebagai contoh faktor yang meningkatkan premium dan "${f2.ms}" sebagai contoh faktor yang menurunkannya, bagaimana kedua-dua kesan itu boleh bergabung supaya premium bersih masih meningkat.`), a: T(`Premium factors combine: ${f1.en} pushes the base premium up (${f1.reason.en}), while the larger NCD only reduces it by a percentage; if the increase from the risk factor is larger than the discount, the net premium still rises.`, `Faktor premium bergabung: ${f1.ms} meningkatkan premium asas (${f1.reason.ms}), manakala NCD yang lebih besar hanya menguranginya mengikut peratusan; jika peningkatan akibat faktor risiko itu lebih besar daripada diskaun, premium bersih masih meningkat.`), w: W(T('Premium payable = base premium × (1 − NCD).', 'Premium perlu dibayar = premium asas × (1 − NCD).'), T(`Example: the base rises from ${rm(1000)} to ${rm(1500)} while the NCD rises from 20% to 30%: $1000 \\times 0.8 = 800$, but $1500 \\times 0.7 = 1050$.`, `Contoh: premium asas naik daripada ${rm(1000)} kepada ${rm(1500)} manakala NCD naik daripada 20% kepada 30%: $1000 \\times 0.8 = 800$, tetapi $1500 \\times 0.7 = 1050$.`)), sp: 'l' };
    },
    (r) => {
      const t1 = r.pick(TERMS), t2 = r.pick(TERMS.filter((t) => t.term.en !== t1.term.en));
      return { q: T(`Explain the difference between "${t1.term.en}" and "${t2.term.en}" in an insurance policy, and give one reason a policyholder should understand both before signing.`, `Terangkan perbezaan antara "${t1.term.ms}" dengan "${t2.term.ms}" dalam sesuatu polisi insurans, dan berikan satu sebab pemegang polisi perlu memahami kedua-duanya sebelum menandatangani polisi.`), a: T(`${t1.term.en}: ${t1.def.en}. ${t2.term.en}: ${t2.def.en}. Understanding both avoids being surprised by how much is actually paid out or paid in when a claim is made.`, `${t1.term.ms}: ${t1.def.ms}. ${t2.term.ms}: ${t2.def.ms}. Memahami kedua-duanya mengelakkan kejutan tentang jumlah sebenar yang dibayar atau perlu dibayar apabila tuntutan dibuat.`), w: W(T(`${t1.term.en}: ${t1.ex.en}`, `${t1.term.ms}: ${t1.ex.ms}`), T(`${t2.term.en}: ${t2.ex.en}`, `${t2.term.ms}: ${t2.ex.ms}`)), sp: 'm' };
    },
  ];
  SPM.extend('F5-3.1', { e: g31e, m: g31m, a: g31a.concat(g31a2) });

  /* =============================================================== 3.2 Computation in insurance */
  const PROP_CTX = [T('house', 'rumah'), T('shophouse', 'kedai'), T('factory', 'kilang'), T('warehouse', 'gudang'), T('bungalow', 'banglo')];
  const VEH_CTX = [T('car', 'kereta'), T('van', 'van'), T('motorcycle', 'motosikal'), T('pickup truck', 'trak pikap')];
  const POL_TYPE = [T('fire', 'kebakaran'), T('property', 'harta'), T('home', 'rumah')];
  /** deductible-then-cap payout, applied in that order (the default stated order) */
  const dedPayout = (loss, ded, limit) => Math.min(Math.max(0, loss - ded), limit === undefined ? Infinity : limit);
  /** co-insurance payout: ratio = min(1, insured/required); order 'before' or 'after' the deductible; limit optional */
  function coinsPayout(loss, insured, required, ded, order, limit) {
    const ratio = Math.min(1, insured / required);
    let p = order === 'before' ? Math.max(0, loss - ded) * ratio : Math.max(0, loss * ratio - ded);
    if (limit !== undefined) p = Math.min(p, limit);
    return Math.max(0, Math.min(p, loss));
  }
  const orderTxt = (order) =>
    order === 'before'
      ? T('the deductible is subtracted from the loss first, then the proportional-settlement ratio is applied', 'deduktibel ditolak daripada kerugian dahulu, kemudian nisbah penyelesaian berkadar digunakan')
      : T('the proportional-settlement ratio is applied to the loss first, then the deductible is subtracted', 'nisbah penyelesaian berkadar digunakan pada kerugian dahulu, kemudian deduktibel ditolak');

  const g32e = [
    (r) => {
      const rate = r.pick([3, 4, 5, 6, 8, 10]), sum_ = r.pick([100000, 150000, 200000, 250000, 300000, 400000, 500000]);
      const c = r.pick(PROP_CTX), pt = r.pick(POL_TYPE);
      const w = r.pick([
        [`The premium rate for a ${pt.en} policy is RM${rate} per RM1 000 of sum insured. Find the annual premium for a ${c.en} insured for ${rm(sum_)}.`, `Kadar premium bagi polisi ${pt.ms} ialah RM${rate} bagi setiap RM1 000 jumlah diinsuranskan. Cari premium tahunan bagi sebuah ${c.ms} yang diinsuranskan sebanyak ${rm(sum_)}.`],
        [`A ${c.en} is insured for ${rm(sum_)} under a ${pt.en} policy charging RM${rate} per RM1 000 of sum insured. Calculate the annual premium.`, `Sebuah ${c.ms} diinsuranskan sebanyak ${rm(sum_)} di bawah polisi ${pt.ms} yang mengenakan RM${rate} bagi setiap RM1 000 jumlah diinsuranskan. Hitung premium tahunan.`],
      ]);
      return { q: T(w[0], w[1]), a: T(rm((rate * sum_) / 1000)), w: T(`$${rate} \\times \\dfrac{${sum_}}{1000}$`), sp: 's' };
    },
    (r) => {
      const c = r.pick(PROP_CTX);
      const ded = r.pick([300, 500, 800, 1000, 1500]);
      const loss = ded + r.pick([1000, 2000, 3000, 5000, 8000]);
      return { q: T(`A policy states that the deductible is subtracted from a covered loss before payment. A ${c.en} suffers a covered loss of ${rm(loss)}. The deductible is ${rm(ded)}. Find the payout.`, `Sebuah polisi menyatakan bahawa deduktibel ditolak daripada kerugian yang dilindungi sebelum bayaran dibuat. Sebuah ${c.ms} mengalami kerugian yang dilindungi sebanyak ${rm(loss)}. Deduktibelnya ialah ${rm(ded)}. Cari bayaran itu.`), a: T(rm(loss - ded)), w: T(`$${loss} - ${ded}$`), sp: 's' };
    },
    (r) => {
      const base = r.pick([600, 800, 1000, 1200, 1500]), ncd = r.pick([10, 15, 20, 25, 30]);
      const veh = r.pick(VEH_CTX);
      return { q: T(`A motor insurance premium for a ${veh.en} is ${rm(base)} before discount. The No-Claim Discount (NCD) stated in the policy is ${ncd}%. Find the premium payable after the NCD.`, `Premium insurans motor bagi sebuah ${veh.ms} ialah ${rm(base)} sebelum diskaun. Diskaun Tanpa Tuntutan (NCD) yang dinyatakan dalam polisi ialah ${ncd}%. Cari premium yang perlu dibayar selepas NCD.`), a: T(rm(round(base * (1 - ncd / 100), 2), 2)), w: T(`$${base} \\times (1 - ${ncd / 100})$`), sp: 's' };
    },
    (r) => {
      const rate = r.pick([4, 5, 6, 8]);
      const sums = r.sample([100000, 150000, 200000, 250000, 300000, 400000], 3);
      const prem = sums.map((s) => (rate * s) / 1000);
      const hide = r.int(0, 2);
      const rows = sums.map((s, i) => [rm(s), i === hide ? '?' : rm(prem[i])]);
      const pt = r.pick(POL_TYPE);
      return { q: T(`A ${pt.en} policy charges RM${rate} per RM1 000 of sum insured. Complete the missing premium.<br>${SPM.table(rows, { head: ['Sum insured', 'Annual premium'] })}`, `Sebuah polisi ${pt.ms} mengenakan RM${rate} bagi setiap RM1 000 jumlah diinsuranskan. Lengkapkan premium yang hilang.<br>${SPM.table(rows, { head: ['Jumlah diinsuranskan', 'Premium tahunan'] })}`), a: T(rm(prem[hide])), w: W(T('Premium $=$ rate $\\times$ (sum insured $\\div$ 1000)', 'Premium $=$ kadar $\\times$ (jumlah diinsuranskan $\\div$ 1000)'), `$${rate} \\times \\dfrac{${sums[hide]}}{1000} = ${prem[hide]}$`), sp: 's' };
    },
    (r) => {
      const ded = r.pick([300, 500, 800, 1000]), loss = ded - r.pick([50, 100, 150]);
      const c = r.pick(PROP_CTX);
      return { q: T(`A policy applies a deductible of ${rm(ded)} to every claim. A ${c.en} suffers a covered loss of ${rm(loss)}. Find the payout.`, `Sebuah polisi mengenakan deduktibel ${rm(ded)} bagi setiap tuntutan. Sebuah ${c.ms} mengalami kerugian yang dilindungi sebanyak ${rm(loss)}. Cari bayaran itu.`), a: T('RM0 (the loss is below the deductible, so nothing is paid out).', 'RM0 (kerugian itu kurang daripada deduktibel, jadi tiada bayaran dibuat).'), w: W(`$${loss} \\lt ${ded}$`, T(`The policyholder pays the whole loss of ${rm(loss)} as part of the deductible, so the payout is RM0.`, `Pemegang polisi membayar keseluruhan kerugian ${rm(loss)} sebagai sebahagian daripada deduktibel, jadi bayarannya RM0.`)), sp: 's' };
    },
    (r) => {
      const prem = r.pick([400, 600, 800, 1000]), ded = r.pick([300, 500, 800]);
      const c = r.pick(PROP_CTX);
      return { q: T(`A ${c.en} owner pays an annual premium of ${rm(prem)}. During the year, a covered loss occurs and the owner also pays the deductible of ${rm(ded)}. Find the owner's total spending on the policy and the deductible that year.`, `Pemilik sebuah ${c.ms} membayar premium tahunan ${rm(prem)}. Sepanjang tahun itu, satu kerugian yang dilindungi berlaku dan pemilik turut membayar deduktibel ${rm(ded)}. Cari jumlah perbelanjaan pemilik ke atas premium dan deduktibel pada tahun itu.`), a: T(rm(prem + ded)), w: T(`$${prem} + ${ded}$`), sp: 's' };
    },
    (r) => {
      const rate = r.pick([4, 5, 6, 8]);
      const sumA = r.pick([100000, 150000, 200000]), sumB = sumA + r.pick([50000, 100000]);
      const c = r.pick(PROP_CTX);
      return { q: T(`Two owners insure the same type of ${c.en} at RM${rate} per RM1 000 of sum insured: Owner $P$ for ${rm(sumA)} and Owner $Q$ for ${rm(sumB)}. Whose annual premium is lower, and by how much?`, `Dua pemilik ${c.ms} yang sama jenis diinsuranskan pada kadar RM${rate} bagi setiap RM1 000 jumlah diinsuranskan: Pemilik $P$ sebanyak ${rm(sumA)} dan Pemilik $Q$ sebanyak ${rm(sumB)}. Premium tahunan siapakah yang lebih rendah, dan berapa bezanya?`), a: T(`Owner $P$'s, by ${rm(((sumB - sumA) * rate) / 1000)}.`, `Pemilik $P$, sebanyak ${rm(((sumB - sumA) * rate) / 1000)}.`), w: W(`$P: ${rate} \\times \\dfrac{${sumA}}{1000} = ${(rate * sumA) / 1000}$`, `$Q: ${rate} \\times \\dfrac{${sumB}}{1000} = ${(rate * sumB) / 1000}$`, `$${(rate * sumB) / 1000} - ${(rate * sumA) / 1000} = ${((sumB - sumA) * rate) / 1000}$`), sp: 's' };
    },
  ];
  const g32m = [
    (r) => {
      const rows = ncdLadder(r), ctx = r.pick(NCD_CTX), lab = ncdLabel(ctx);
      const base = r.pick([800, 1000, 1200, 1500, 1800]);
      const y = r.int(1, 5);
      const payable = round((base * (100 - rows[y])) / 100, 2);
      return { q: T(`${lab.en}<br>${ncdTable(rows, 'en')}<br>A driver's base motor premium is ${rm(base)}. She has had ${y} consecutive claim-free year${y > 1 ? 's' : ''}. Find the premium payable after the NCD.`, `${lab.ms}<br>${ncdTable(rows, 'ms')}<br>Premium asas motor seorang pemandu ialah ${rm(base)}. Dia mempunyai ${y} tahun berturut-turut tanpa tuntutan. Cari premium yang perlu dibayar selepas NCD.`), a: T(rm(payable, 2)), w: T(`$${base} \\times (1 - ${rows[y]}\\%)$`), sp: 'm' };
    },
    (r) => {
      const ded = r.pick([500, 800, 1000]), limit = r.pick([15000, 20000, 25000]);
      const loss = limit + ded + r.pick([2000, 5000, 8000]);
      const c = r.pick(PROP_CTX);
      const payout = dedPayout(loss, ded, limit);
      return { q: T(`A policy on a ${c.en} has a deductible of ${rm(ded)} and a claim limit of ${rm(limit)}: the deductible is subtracted first, then the result is capped at the limit. A covered loss of ${rm(loss)} occurs. Find the payout.`, `Sebuah polisi ke atas sebuah ${c.ms} mempunyai deduktibel ${rm(ded)} dan had tuntutan ${rm(limit)}: deduktibel ditolak dahulu, kemudian hasilnya dihadkan pada had itu. Kerugian yang dilindungi sebanyak ${rm(loss)} berlaku. Cari bayaran itu.`), a: T(rm(payout), rm(payout)), w: T(`$${loss} - ${ded} = ${loss - ded}$, capped at ${rm(limit)}`, `$${loss} - ${ded} = ${loss - ded}$, dihadkan pada ${rm(limit)}`), sp: 'm' };
    },
    (r) => {
      const rate = r.pick([4, 5, 6, 8]), prem = r.pick([800, 1000, 1200, 1600, 2000, 2400]);
      need(prem % rate === 0 && ((prem / rate) * 1000) % 1000 === 0);
      const sum_ = (prem / rate) * 1000;
      const c = r.pick(PROP_CTX);
      return { q: T(`A ${c.en} is insured under a policy charging RM${rate} per RM1 000 of sum insured. The annual premium paid is ${rm(prem)}. Find the sum insured.`, `Sebuah ${c.ms} diinsuranskan di bawah polisi yang mengenakan RM${rate} bagi setiap RM1 000 jumlah diinsuranskan. Premium tahunan yang dibayar ialah ${rm(prem)}. Cari jumlah diinsuranskan.`), a: T(rm(sum_)), w: T(`$\\dfrac{${prem}}{${rate}} \\times 1000$`), sp: 'm' };
    },
    (r) => {
      const ded = r.pick([500, 800, 1000, 1500]);
      const c = r.pick(PROP_CTX);
      const payout = r.pick([2000, 3500, 5000, 8000]);
      const loss = payout + ded;
      return { q: T(`A policy on a ${c.en} has a deductible of ${rm(ded)}, subtracted from the loss before payment (no claim limit applies here). The insurer pays out ${rm(payout)} for a covered loss. Find the amount of the loss.`, `Sebuah polisi ke atas sebuah ${c.ms} mempunyai deduktibel ${rm(ded)}, yang ditolak daripada kerugian sebelum bayaran (tiada had tuntutan terpakai di sini). Penanggung insurans membayar ${rm(payout)} bagi kerugian yang dilindungi. Cari jumlah kerugian itu.`), a: T(rm(loss)), w: T(`$${payout} + ${ded}$`), sp: 'm' };
    },
    (r) => {
      const rows = ncdLadder(r), ctx = r.pick(NCD_CTX), lab = ncdLabel(ctx);
      const base = r.pick([900, 1200, 1500]);
      const y = r.int(2, 5);
      const payable = round((base * (100 - rows[y])) / 100, 2);
      const ded = r.pick([500, 800]);
      const loss = r.pick([3000, 5000, 8000]);
      const payout = dedPayout(loss, ded, Infinity);
      return {
        q: T(`${lab.en}<br>${ncdTable(rows, 'en')}<br>A motor policy has a base premium of ${rm(base)} and a deductible of ${rm(ded)} (subtracted from any covered loss). The policyholder has had ${y} consecutive claim-free years. Find (a) the premium payable after the NCD, (b) the payout for a covered loss of ${rm(loss)}.`, `${lab.ms}<br>${ncdTable(rows, 'ms')}<br>Sebuah polisi motor mempunyai premium asas ${rm(base)} dan deduktibel ${rm(ded)} (ditolak daripada sebarang kerugian yang dilindungi). Pemegang polisi mempunyai ${y} tahun berturut-turut tanpa tuntutan. Cari (a) premium yang perlu dibayar selepas NCD, (b) bayaran bagi kerugian yang dilindungi sebanyak ${rm(loss)}.`),
        a: T(`(a) ${rm(payable, 2)} (b) ${rm(payout)}`, `(a) ${rm(payable, 2)} (b) ${rm(payout)}`),
        w: W(T(`(a) NCD for ${y} years $= ${rows[y]}\\%$: $${base} \\times (1 - ${rows[y]}\\%) = ${n(payable)}$`, `(a) NCD bagi ${y} tahun $= ${rows[y]}\\%$: $${base} \\times (1 - ${rows[y]}\\%) = ${n(payable)}$`), `(b) $${loss} - ${ded} = ${payout}$`),
        sp: 'l',
      };
    },
    (r) => {
      const base = r.pick([1000, 1200, 1500, 2000]);
      const pct_ = r.pick([10, 15, 20, 25, 30, 40]);
      const payable = round((base * (100 - pct_)) / 100, 2);
      return { q: T(`A motor policy has a base premium of ${rm(base)}. After the No-Claim Discount is applied, the premium payable is ${rm(payable, 2)}. Find the NCD rate applied, as a percentage.`, `Sebuah polisi motor mempunyai premium asas ${rm(base)}. Selepas Diskaun Tanpa Tuntutan digunakan, premium yang perlu dibayar ialah ${rm(payable, 2)}. Cari kadar NCD yang digunakan, dalam peratus.`), a: T(`${pct_}%`), w: T(`$\\left(1 - \\dfrac{${payable}}{${base}}\\right) \\times 100\\%$`), sp: 'm' };
    },
    (r) => {
      const rateA = r.pick([4, 5, 6]), rateB = r.pick([6, 8, 10].filter((x) => x !== rateA));
      const sumA = r.pick([100000, 150000, 200000]), sumB = r.pick([30000, 50000, 80000]);
      const cA = r.pick(PROP_CTX), cB = r.pick(VEH_CTX);
      const premA = (rateA * sumA) / 1000, premB = (rateB * sumB) / 1000;
      return { q: T(`A family insures a ${cA.en} for ${rm(sumA)} at RM${rateA} per RM1 000, and a ${cB.en} for ${rm(sumB)} at RM${rateB} per RM1 000. Find the total annual premium for both policies.`, `Sebuah keluarga menginsuranskan sebuah ${cA.ms} sebanyak ${rm(sumA)} pada RM${rateA} bagi setiap RM1 000, dan sebuah ${cB.ms} sebanyak ${rm(sumB)} pada RM${rateB} bagi setiap RM1 000. Cari jumlah premium tahunan bagi kedua-dua polisi.`), a: T(rm(premA + premB)), w: T(`$${n(premA)} + ${n(premB)}$`), sp: 'm' };
    },
  ];
  const g32a = [
    (r) => {
      const V = r.pick([300000, 400000, 500000, 600000]), reqPct = r.pick([70, 75, 80, 90]);
      const req = (V * reqPct) / 100;
      const k = r.pick([6, 7, 8, 9]);
      const insured = (req * k) / 10;
      const ded = r.pick([500, 1000, 1500, 2000]);
      const loss = r.step(20000, Math.min(120000, req), 1000);
      const order = r.pick(['before', 'after']);
      const payoutNoCap = coinsPayout(loss, insured, req, ded, order);
      const bindCap = r.chance(0.35);
      const limit = bindCap ? Math.max(2000, Math.round((payoutNoCap - r.pick([1000, 2000, 3000])) / 100) * 100) : undefined;
      const payout = coinsPayout(loss, insured, req, ded, order, limit);
      const c = r.pick(PROP_CTX);
      const ot = orderTxt(order);
      return {
        q: T(
          `A ${c.en} worth ${rm(V)} is covered by a policy that requires it to be insured for at least ${reqPct}% of its value (${rm(req)}), or the payout is reduced in proportion to the shortfall. It is insured for ${rm(insured)}. The policy states that ${ot.en}${limit !== undefined ? `, and the payout is then capped at a claim limit of ${rm(limit)}` : ''}. Find the payout for a covered loss of ${rm(loss)}.`,
          `Sebuah ${c.ms} bernilai ${rm(V)} dilindungi oleh polisi yang memerlukannya diinsuranskan sekurang-kurangnya ${reqPct}% daripada nilainya (${rm(req)}), jika tidak bayaran dikurangkan secara berkadar mengikut kekurangan itu. Ia diinsuranskan sebanyak ${rm(insured)}. Polisi menyatakan bahawa ${ot.ms}${limit !== undefined ? `, dan bayaran itu kemudian dihadkan pada had tuntutan ${rm(limit)}` : ''}. Cari bayaran bagi kerugian yang dilindungi sebanyak ${rm(loss)}.`
        ),
        a: T(rm(round(payout, 2), 2)),
        w:
          order === 'before'
            ? T(`$(${loss} - ${ded}) \\times \\dfrac{${insured}}{${req}} = ${n(round(payoutNoCap, 2))}$${limit !== undefined ? `, capped at ${rm(limit)}` : ''}`, `$(${loss} - ${ded}) \\times \\dfrac{${insured}}{${req}} = ${n(round(payoutNoCap, 2))}$${limit !== undefined ? `, dihadkan pada ${rm(limit)}` : ''}`)
            : T(`$${loss} \\times \\dfrac{${insured}}{${req}} - ${ded} = ${n(round(payoutNoCap, 2))}$${limit !== undefined ? `, capped at ${rm(limit)}` : ''}`, `$${loss} \\times \\dfrac{${insured}}{${req}} - ${ded} = ${n(round(payoutNoCap, 2))}$${limit !== undefined ? `, dihadkan pada ${rm(limit)}` : ''}`),
        sp: 'l',
      };
    },
    (r) => {
      const V = r.pick([300000, 400000, 500000]), reqPct = r.pick([75, 80, 90]);
      const req = (V * reqPct) / 100;
      const k = r.pick([6, 7, 8, 9]);
      const insured = (req * k) / 10;
      const ded = r.pick([500, 1000, 1500]);
      const loss = r.step(20000, Math.min(100000, req), 1000);
      const payout = coinsPayout(loss, insured, req, ded, 'after');
      need(payout > 0);
      const c = r.pick(PROP_CTX);
      return { q: T(`A ${c.en} worth ${rm(V)} must be insured for at least ${reqPct}% of its value (${rm(req)}) or the payout is reduced in proportion. It is insured for ${rm(insured)}. The policy applies the proportional-settlement ratio to the loss first, then subtracts a deductible of ${rm(ded)}. The insurer pays out ${rm(round(payout, 2), 2)} for a covered loss. Find the amount of the loss.`, `Sebuah ${c.ms} bernilai ${rm(V)} mesti diinsuranskan sekurang-kurangnya ${reqPct}% daripada nilainya (${rm(req)}) jika tidak bayaran dikurangkan secara berkadar. Ia diinsuranskan sebanyak ${rm(insured)}. Polisi menggunakan nisbah penyelesaian berkadar pada kerugian dahulu, kemudian menolak deduktibel ${rm(ded)}. Penanggung insurans membayar ${rm(round(payout, 2), 2)} bagi kerugian yang dilindungi. Cari jumlah kerugian itu.`), a: T(rm(loss)), w: T(`$\\text{loss} = \\dfrac{${n(round(payout, 2))} + ${ded}}{${insured}/${req}}$`, `$\\text{kerugian} = \\dfrac{${n(round(payout, 2))} + ${ded}}{${insured}/${req}}$`), sp: 'l' };
    },
    (r) => {
      const years = r.pick([2, 3]);
      const c = r.pick(PROP_CTX);
      const V = r.pick([300000, 400000]), reqPct = 80, req = (V * reqPct) / 100;
      const kA = 10, kB = r.pick([6, 7, 8]);
      const insuredA = req, insuredB = (req * kB) / 10;
      const premA = r.pick([1400, 1600]), premB = premA - r.pick([300, 400]);
      const ded = r.pick([500, 1000]);
      const loss = r.step(20000, Math.min(80000, req), 1000);
      const payoutA = coinsPayout(loss, insuredA, req, ded, 'after');
      const payoutB = coinsPayout(loss, insuredB, req, ded, 'after');
      const totalA = premA * years + (loss - payoutA), totalB = premB * years + (loss - payoutB);
      return {
        q: T(
          `A ${c.en} worth ${rm(V)} must be insured for at least ${reqPct}% of its value (${rm(req)}) or the payout is reduced in proportion (ratio applied to the loss first, then the deductible subtracted). Over ${years} years, Policy $A$ costs ${rm(premA)} a year and insures the full required amount (${rm(insuredA)}); Policy $B$ costs ${rm(premB)} a year and insures only ${rm(insuredB)}. Both have a deductible of ${rm(ded)}. In one of the ${years} years, a covered loss of ${rm(loss)} occurs. Find the total cost to the policyholder (premiums over ${years} years + the uncompensated part of the loss) under each policy, and state which is cheaper overall.`,
          `Sebuah ${c.ms} bernilai ${rm(V)} mesti diinsuranskan sekurang-kurangnya ${reqPct}% daripada nilainya (${rm(req)}) jika tidak bayaran dikurangkan secara berkadar (nisbah digunakan pada kerugian dahulu, kemudian deduktibel ditolak). Sepanjang ${years} tahun, Polisi $A$ berkos ${rm(premA)} setahun dan menginsuranskan jumlah yang diperlukan sepenuhnya (${rm(insuredA)}); Polisi $B$ berkos ${rm(premB)} setahun dan hanya menginsuranskan ${rm(insuredB)}. Kedua-duanya mempunyai deduktibel ${rm(ded)}. Dalam salah satu daripada ${years} tahun itu, kerugian yang dilindungi sebanyak ${rm(loss)} berlaku. Cari jumlah kos kepada pemegang polisi (premium sepanjang ${years} tahun + bahagian kerugian yang tidak dipampas) di bawah setiap polisi, dan nyatakan yang mana lebih murah secara keseluruhan.`
        ),
        a: T(`A: ${rm(premA * years)} + ${rm(round(loss - payoutA, 2), 2)} = ${rm(round(totalA, 2), 2)}. B: ${rm(premB * years)} + ${rm(round(loss - payoutB, 2), 2)} = ${rm(round(totalB, 2), 2)}. ${totalA <= totalB ? 'Policy A' : 'Policy B'} is cheaper overall.`, `A: ${rm(premA * years)} + ${rm(round(loss - payoutA, 2), 2)} = ${rm(round(totalA, 2), 2)}. B: ${rm(premB * years)} + ${rm(round(loss - payoutB, 2), 2)} = ${rm(round(totalB, 2), 2)}. ${totalA <= totalB ? 'Polisi A' : 'Polisi B'} lebih murah secara keseluruhan.`),
        w: W(
          T(`A (fully insured): payout $= ${loss} - ${ded} = ${n(round(payoutA, 2))}$`, `A (diinsuranskan penuh): bayaran $= ${loss} - ${ded} = ${n(round(payoutA, 2))}$`),
          T(`B (underinsured): payout $= ${loss} \\times \\dfrac{${insuredB}}{${req}} - ${ded} = ${n(round(payoutB, 2))}$`, `B (kurang diinsuranskan): bayaran $= ${loss} \\times \\dfrac{${insuredB}}{${req}} - ${ded} = ${n(round(payoutB, 2))}$`),
          `A: $${premA} \\times ${years} + (${loss} - ${n(round(payoutA, 2))}) = ${n(round(totalA, 2))}$`,
          `B: $${premB} \\times ${years} + (${loss} - ${n(round(payoutB, 2))}) = ${n(round(totalB, 2))}$`,
          T(`The smaller total is ${totalA <= totalB ? 'Policy A' : 'Policy B'}.`, `Jumlah yang lebih kecil ialah ${totalA <= totalB ? 'Polisi A' : 'Polisi B'}.`)
        ),
        sp: 'xl',
      };
    },
    (r) => {
      const rows = ncdLadder(r), ctx = r.pick(NCD_CTX), lab = ncdLabel(ctx);
      const base = r.pick([1000, 1200, 1500]);
      const y = r.int(2, 5);
      const premPay = round((base * (100 - rows[y])) / 100, 2);
      const ded = r.pick([500, 1000]), limit = r.pick([10000, 15000]);
      const loss1 = limit + ded + r.pick([2000, 4000]);
      const payoutDed = dedPayout(loss1, ded, limit);
      const V = r.pick([300000, 400000]), reqPct = 80, req = (V * reqPct) / 100;
      const k = r.pick([6, 7, 8]);
      const insured = (req * k) / 10;
      const loss2 = r.step(20000, Math.min(80000, req), 1000);
      const payoutCoins = coinsPayout(loss2, insured, req, ded, 'after');
      const c = r.pick(PROP_CTX);
      const partsEn = SPM.parts([T(`Find the premium payable after the NCD.`), T(`Find the payout for a covered loss of ${rm(loss1)}, given a claim limit of ${rm(limit)}.`), T(`The ${c.en} (worth ${rm(V)}, required insurance ${rm(req)}) is insured for only ${rm(insured)}. Find the payout for a separate covered loss of ${rm(loss2)}.`)]).en;
      const partsMs = SPM.parts([T(`Cari premium yang perlu dibayar selepas NCD.`), T(`Cari bayaran bagi kerugian yang dilindungi sebanyak ${rm(loss1)}, dengan had tuntutan ${rm(limit)}.`), T(`${c.ms} (bernilai ${rm(V)}, insurans diperlukan ${rm(req)}) hanya diinsuranskan sebanyak ${rm(insured)}. Cari bayaran bagi kerugian berasingan yang dilindungi sebanyak ${rm(loss2)}.`)]).ms;
      return {
        q: T(
          `A policy has base premium ${rm(base)}, a deductible of ${rm(ded)} (subtracted from a covered loss, then capped at the stated claim limit) and applies proportional settlement (ratio to the loss, then subtract the deductible) if the ${c.en} is underinsured relative to a required ${reqPct}% of its value. Using ${lab.en}<br>${ncdTable(rows, 'en')}<br>the policyholder has had ${y} consecutive claim-free years.<br>${partsEn}`,
          `Sebuah polisi mempunyai premium asas ${rm(base)}, deduktibel ${rm(ded)} (ditolak daripada kerugian yang dilindungi, kemudian dihadkan pada had tuntutan yang dinyatakan) dan menggunakan penyelesaian berkadar (nisbah pada kerugian, kemudian deduktibel ditolak) jika ${c.ms} kurang diinsuranskan berbanding ${reqPct}% nilainya yang diperlukan. Dengan menggunakan ${lab.ms}<br>${ncdTable(rows, 'ms')}<br>pemegang polisi mempunyai ${y} tahun berturut-turut tanpa tuntutan.<br>${partsMs}`
        ),
        a: SPM.parts([T(rm(premPay, 2)), T(rm(payoutDed)), T(rm(round(payoutCoins, 2), 2))]),
        w: W(
          T(`(a) NCD for ${y} years $= ${rows[y]}\\%$: $${base} \\times (1 - ${rows[y]}\\%) = ${n(premPay)}$`, `(a) NCD bagi ${y} tahun $= ${rows[y]}\\%$: $${base} \\times (1 - ${rows[y]}\\%) = ${n(premPay)}$`),
          T(`(b) $${loss1} - ${ded} = ${loss1 - ded} > ${limit}$, so the payout is capped at ${rm(limit)}`, `(b) $${loss1} - ${ded} = ${loss1 - ded} > ${limit}$, jadi bayaran dihadkan pada ${rm(limit)}`),
          `(c) $${loss2} \\times \\dfrac{${insured}}{${req}} - ${ded} = ${n(round(payoutCoins, 2))}$`
        ),
        sp: 'xl',
      };
    },
  ];
  SPM.extend('F5-3.2', { e: g32e, m: g32m, a: g32a });

  /* =================================================================================== 4.1 Taxation */
  const DIRECT_TAXES = [
    { en: 'income tax', ms: 'cukai pendapatan', dir: true },
    { en: 'quit rent (cukai tanah)', ms: 'cukai tanah', dir: true },
    { en: 'property assessment tax (cukai pintu)', ms: 'cukai pintu', dir: true },
    { en: 'road tax', ms: 'cukai jalan', dir: true },
  ];
  const INDIRECT_TAXES = [
    { en: 'Sales and Service Tax (SST)', ms: 'Cukai Jualan dan Perkhidmatan (SST)', dir: false },
    { en: 'import duty', ms: 'duti import', dir: false },
    { en: 'excise duty on a car', ms: 'duti eksais ke atas sebuah kereta', dir: false },
  ];
  const ALL_TAXES = DIRECT_TAXES.concat(INDIRECT_TAXES);
  const TAX_TERMS = [
    { term: T('tax relief', 'pelepasan cukai'), def: T('an amount subtracted from taxable income (subject to a supplied cap) before chargeable income is worked out', 'jumlah yang ditolak daripada pendapatan bercukai (tertakluk kepada had yang diberikan) sebelum pendapatan bercukai dikira'), ex: T(`e.g. taxable income ${rm(50000)}, reliefs ${rm(12000)}: chargeable income ${rm(38000)}`, `cth. pendapatan boleh cukai ${rm(50000)}, pelepasan ${rm(12000)}: pendapatan bercukai ${rm(38000)}`) },
    { term: T('tax rebate', 'rebat cukai'), def: T('an amount subtracted from the tax already calculated from the bands, not from income', 'jumlah yang ditolak daripada cukai yang telah dikira daripada jadual kadar, bukan daripada pendapatan'), ex: T(`e.g. tax from the bands ${rm(1200)}, rebate ${rm(400)}: tax payable ${rm(800)}`, `cth. cukai daripada jadual kadar ${rm(1200)}, rebat ${rm(400)}: cukai perlu dibayar ${rm(800)}`) },
    { term: T('chargeable income', 'pendapatan bercukai'), def: T('taxable income after permitted exemptions and reliefs have been subtracted', 'pendapatan boleh cukai selepas pengecualian dan pelepasan yang dibenarkan ditolak'), ex: T('chargeable income = taxable income − exemptions − reliefs', 'pendapatan bercukai = pendapatan boleh cukai − pengecualian − pelepasan') },
    { term: T('PCB (monthly tax deduction)', 'PCB (potongan cukai bulanan)'), def: T('tax already withheld from salary each month; it is compared with the final tax payable to find a refund or a balance due, and is neither a relief nor a rebate', 'cukai yang telah dipotong daripada gaji setiap bulan; ia dibandingkan dengan cukai muktamad yang perlu dibayar untuk mencari bayaran balik atau baki tertunggak, dan bukan pelepasan atau rebat'), ex: T(`e.g. PCB paid ${rm(3000)}, final tax ${rm(2400)}: refund ${rm(600)}`, `cth. PCB dibayar ${rm(3000)}, cukai muktamad ${rm(2400)}: bayaran balik ${rm(600)}`) },
    { term: T('tax avoidance', 'pengelakan cukai secara sah'), def: T('legally arranging one\'s affairs to reduce tax, using reliefs and rules that are allowed', 'menyusun hal ehwal seseorang secara sah untuk mengurangkan cukai, menggunakan pelepasan dan peraturan yang dibenarkan'), ex: T('e.g. claiming the education fees relief with proper receipts (legal)', 'cth. menuntut pelepasan yuran pendidikan dengan resit yang lengkap (sah)') },
    { term: T('tax evasion', 'pengelakan cukai secara haram'), def: T('illegally hiding income or falsifying records to avoid paying tax that is legally due', 'menyembunyikan pendapatan atau memalsukan rekod secara menyalahi undang-undang untuk mengelak membayar cukai yang perlu dibayar mengikut undang-undang'), ex: T('e.g. not declaring cash income (an offence)', 'cth. tidak mengisytiharkan pendapatan tunai (satu kesalahan)') },
  ];
  /** progressive band tax: bands = [[width or null, rate%], ...] in order; returns {tax, rows:[[part,rate]]} */
  function bandTax(income, bands) {
    let left = income, tax = 0;
    const rows = [];
    for (const [width, rate] of bands) {
      const part = Math.min(left, width === null ? left : width);
      if (part <= 0) break;
      tax += (part * rate) / 100;
      rows.push([part, rate]);
      left -= part;
    }
    return { tax, rows };
  }
  /** a plausible (hypothetical, always-labelled) 4-band schedule, landing mid-band for a chosen income */
  function makeBands(r) {
    const b1 = r.pick([2000, 5000, 8000]), b2 = r.pick([10000, 15000, 20000]), b3 = r.pick([15000, 20000, 25000]);
    const r2 = r.pick([1, 2, 3]), r3 = r.pick([3, 5, 6]), r4 = r.pick([8, 10, 12, 14]);
    return [[b1, 0], [b2, r2], [b3, r3], [null, r4]];
  }
  const bandTableSimple = (bands, lang) => {
    let from = 0;
    const rows = bands.map(([w, rate], i) => {
      const to = w === null ? null : from + w - 1;
      const lab = w === null ? `> ${n(from - 1)}` : `${n(from)} – ${n(to)}`;
      from = to === null ? from : to + 1;
      return [lab, rate + '%'];
    });
    return SPM.table(rows, { head: lang === 'en' ? ['Chargeable income (RM)', 'Rate'] : ['Pendapatan bercukai (RM)', 'Kadar'] });
  };
  /** working lines for the band tax of `income`: the split into bands, then the sum */
  const bandLines = (income, bands, pre) => {
    const { tax, rows } = bandTax(income, bands);
    return [
      T(`${pre || ''}Split ${rm(income)} into the bands: ${rows.map((rw) => rm(rw[0])).join(' + ')}`, `${pre || ''}Bahagikan ${rm(income)} mengikut jalur: ${rows.map((rw) => rm(rw[0])).join(' + ')}`),
      `$${rows.map((rw) => `${rw[0]} \\times ${rw[1]}\\%`).join(' + ')} = ${n(round(tax, 2))}$`,
    ];
  };
  const DIR_RULE = T('A direct tax is paid directly to the government by the person who owes it (on income or property).', 'Cukai langsung dibayar terus kepada kerajaan oleh orang yang menanggungnya (atas pendapatan atau harta).');
  const IND_RULE = T('An indirect tax is included in the price of goods or services and collected by the seller or importer.', 'Cukai tidak langsung termasuk dalam harga barang atau perkhidmatan dan dikutip oleh penjual atau pengimport.');
  const bandLabel = T('For this question, use the tax band schedule given.', 'Untuk soalan ini, gunakan jadual kadar cukai yang diberikan.');
  const RELIEFS = [
    { en: 'individual relief', ms: 'pelepasan individu', cap: 9000 },
    { en: 'spouse relief', ms: 'pelepasan isteri/suami', cap: 4000 },
    { en: 'child relief (per child)', ms: 'pelepasan anak (bagi setiap anak)', cap: 2000 },
    { en: 'life insurance premium relief', ms: 'pelepasan premium insurans hayat', cap: 3000 },
    { en: 'education fees relief', ms: 'pelepasan yuran pendidikan', cap: 7000 },
    { en: 'medical expenses relief', ms: 'pelepasan perbelanjaan perubatan', cap: 8000 },
  ];
  const ROAD_CTX = [T('sedan car', 'kereta sedan'), T('SUV', 'SUV'), T('pickup truck', 'trak pikap'), T('MPV', 'MPV')];
  /** road tax schedule: flat base up to t1 cc, then RM rate1 per cc above t1 up to t2, then RM rate2 per cc above t2 (continuous at each boundary) */
  function roadTaxSchedule(r) {
    const t1 = r.pick([1000, 1300, 1600]), t2 = t1 + r.pick([400, 600, 800]);
    const base1 = r.pick([20, 30, 50]);
    const rate1 = r.pick([0.1, 0.2, 0.3]), rate2 = round(rate1 + r.pick([0.1, 0.2]), 1);
    const onset2 = round(base1 + (t2 - t1) * rate1, 2);
    return { t1, t2, base1, rate1, rate2, onset2 };
  }
  const roadTaxOf = (cc, sch) => {
    if (cc <= sch.t1) return sch.base1;
    if (cc <= sch.t2) return round(sch.base1 + (cc - sch.t1) * sch.rate1, 2);
    return round(sch.onset2 + (cc - sch.t2) * sch.rate2, 2);
  };
  const roadTable = (sch, lang) =>
    SPM.table(
      [
        [`≤ ${sch.t1} cc`, lang === 'en' ? `RM${sch.base1} flat` : `RM${sch.base1} rata`],
        [`${sch.t1 + 1} – ${sch.t2} cc`, lang === 'en' ? `RM${sch.base1} + RM${sch.rate1} per cc above ${sch.t1} cc` : `RM${sch.base1} + RM${sch.rate1} bagi setiap cc melebihi ${sch.t1} cc`],
        [`> ${sch.t2} cc`, lang === 'en' ? `RM${sch.onset2} + RM${sch.rate2} per cc above ${sch.t2} cc` : `RM${sch.onset2} + RM${sch.rate2} bagi setiap cc melebihi ${sch.t2} cc`],
      ],
      { head: lang === 'en' ? ['Engine capacity', 'Road tax'] : ['Kuasa enjin', 'Cukai jalan'] }
    );
  /** road-tax calculation for `cc` under schedule `sch`, as a maths string */
  const roadCalc = (cc, sch) => {
    const tax = n(round(roadTaxOf(cc, sch), 2));
    if (cc <= sch.t1) return `$${cc} \\le ${sch.t1}$: ${sch.base1}`;
    if (cc <= sch.t2) return `$${sch.base1} + (${cc} - ${sch.t1}) \\times ${sch.rate1} = ${tax}$`;
    return `$${n(sch.onset2)} + (${cc} - ${sch.t2}) \\times ${sch.rate2} = ${tax}$`;
  };
  /** SST working for a bill: SST on the taxable items, then the total */
  const sstLines = (items, prices, rate, pa, pb) => {
    const tx = prices.filter((p, i) => items[i].taxable);
    const sst = round((sum(tx) * rate) / 100, 2), tot = round(sum(prices) + sst, 2);
    return [
      tx.length ? T(`${pa || ''}SST $= (${tx.join(' + ')}) \\times ${rate}\\% = ${n(sst)}$`, `${pa || ''}SST $= (${tx.join(' + ')}) \\times ${rate}\\% = ${n(sst)}$`) : T(`${pa || ''}No item is subject to SST, so SST $= 0$`, `${pa || ''}Tiada barang dikenakan SST, jadi SST $= 0$`),
      T(`${pb || ''}Total $= ${prices.join(' + ')} + ${n(sst)} = ${n(tot)}$`, `${pb || ''}Jumlah $= ${prices.join(' + ')} + ${n(sst)} = ${n(tot)}$`),
    ];
  };
  const roadLabel = T('For this question, use the road-tax schedule given (a simplified, hypothetical schedule).', 'Untuk soalan ini, gunakan jadual cukai jalan yang diberikan (jadual ringkas dan hipotesis).');
  const SST_ITEMS = [
    { en: 'rice', ms: 'beras', taxable: false, lo: 20, hi: 60 },
    { en: 'fresh vegetables', ms: 'sayur-sayuran segar', taxable: false, lo: 15, hi: 40 },
    { en: 'cooking oil', ms: 'minyak masak', taxable: false, lo: 20, hi: 50 },
    { en: 'fresh fish', ms: 'ikan segar', taxable: false, lo: 30, hi: 70 },
    { en: 'plain bread', ms: 'roti tawar', taxable: false, lo: 3, hi: 8 },
    { en: 'imported chocolate', ms: 'coklat import', taxable: true, lo: 20, hi: 50 },
    { en: 'a new smartphone', ms: 'telefon pintar baharu', taxable: true, lo: 600, hi: 1500 },
    { en: 'a restaurant meal', ms: 'hidangan di restoran', taxable: true, lo: 30, hi: 90 },
    { en: 'a haircut at a salon', ms: 'gunting rambut di salun', taxable: true, lo: 20, hi: 60 },
    { en: 'bottled soft drinks (a carton)', ms: 'minuman ringan berbotol (sekotak)', taxable: true, lo: 20, hi: 50 },
    { en: 'a designer handbag', ms: 'beg tangan jenama mewah', taxable: true, lo: 400, hi: 1200 },
  ];
  const sstBillTable = (items, prices, rate, lang) =>
    SPM.table(
      items.map((it, i) => [it[lang], rm(prices[i]), it.taxable ? (lang === 'en' ? `Yes (SST ${rate}%)` : `Ya (SST ${rate}%)`) : lang === 'en' ? 'No' : 'Tidak']),
      { head: lang === 'en' ? ['Item', 'Price', 'Subject to SST?'] : ['Barang', 'Harga', 'Dikenakan SST?'] }
    );

  const g41e2 = [
    (r) => {
      const t = r.pick(ALL_TAXES);
      const w = r.pick([
        [`Classify ${t.en} as a direct tax or an indirect tax.`, `Kelaskan ${t.ms} sebagai cukai langsung atau cukai tidak langsung.`],
        [`Is ${t.en} a direct tax or an indirect tax?`, `Adakah ${t.ms} cukai langsung atau cukai tidak langsung?`],
      ]);
      return { q: T(w[0], w[1]), a: t.dir ? T('Direct tax', 'Cukai langsung') : T('Indirect tax', 'Cukai tidak langsung'), w: W(t.dir ? DIR_RULE : IND_RULE, T(`So ${t.en} is ${t.dir ? 'a direct' : 'an indirect'} tax.`, `Jadi ${t.ms} ialah cukai ${t.dir ? 'langsung' : 'tidak langsung'}.`)), sp: 'xs' };
    },
    (r) => {
      const a = r.pick(DIRECT_TAXES), b = r.pick(INDIRECT_TAXES);
      const swap = r.chance();
      const pair = swap ? [b, a] : [a, b];
      return { q: T(`Which of these is a direct tax: ${pair[0].en} or ${pair[1].en}?`, `Yang manakah cukai langsung: ${pair[0].ms} atau ${pair[1].ms}?`), a: T(a.en, a.ms), w: W(DIR_RULE, T(`${b.en} is included in the price paid, so it is indirect.`, `${b.ms} termasuk dalam harga yang dibayar, jadi ia cukai tidak langsung.`)), sp: 'xs' };
    },
    (r) => {
      const inc = r.pick([48000, 60000, 72000, 84000]), rel = r.pick([9000, 12000, 15000, 18000]);
      const w = r.pick([
        [`A taxpayer's annual taxable income is ${rm(inc)} and total tax reliefs are ${rm(rel)}. Find the chargeable income.`, `Pendapatan bercukai tahunan seorang pembayar cukai ialah ${rm(inc)} dan jumlah pelepasan cukai ialah ${rm(rel)}. Cari pendapatan bercukai.`],
        [`Find the chargeable income of a taxpayer whose taxable income is ${rm(inc)} and whose total reliefs are ${rm(rel)}.`, `Cari pendapatan bercukai seorang pembayar cukai yang pendapatan bercukainya ${rm(inc)} dan jumlah pelepasannya ${rm(rel)}.`],
      ]);
      return { q: T(w[0], w[1]), a: T(rm(inc - rel)), w: T(`$${n(inc)} - ${n(rel)}$`), sp: 's' };
    },
    (r) => {
      const t = r.pick(TAX_TERMS);
      const w = r.pick([
        [`What is meant by "${t.term.en}" in taxation?`, `Apakah yang dimaksudkan dengan "${t.term.ms}" dalam percukaian?`],
        [`Define "${t.term.en}".`, `Takrifkan "${t.term.ms}".`],
      ]);
      return { q: T(w[0], w[1]), a: t.def, w: W(t.ex), sp: 's' };
    },
    (r) => {
      const bill = r.pick([80, 120, 200, 250, 350]), rate = r.pick([6, 8, 10]);
      return { q: T(`A restaurant bill is RM${bill} before tax. SST of ${rate}% is charged. Find the SST and the total amount payable.`, `Bil sebuah restoran ialah RM${bill} sebelum cukai. SST sebanyak ${rate}% dikenakan. Cari SST dan jumlah yang perlu dibayar.`), a: T(`SST ${rm((bill * rate) / 100)}; total ${rm(bill * (1 + rate / 100))}`, `SST ${rm((bill * rate) / 100)}; jumlah ${rm(bill * (1 + rate / 100))}`), w: W(`$${bill} \\times ${rate}\\% = ${n(round((bill * rate) / 100, 2))}$`, `$${bill} + ${n(round((bill * rate) / 100, 2))} = ${n(round(bill * (1 + rate / 100), 2))}$`), sp: 's' };
    },
    (r) => {
      const area = r.pick([400, 600, 800, 1000]), rate = r.pick([0.5, 1, 1.5, 2]);
      return { q: T(`Quit rent (cukai tanah) is charged at RM${rate} per m² of land. Find the quit rent payable for a plot of ${n(area)} m².`, `Cukai tanah dikenakan pada kadar RM${rate} bagi setiap m² tanah. Cari cukai tanah yang perlu dibayar bagi sebidang tanah seluas ${n(area)} m².`), a: T(rm(area * rate)), w: T(`$${n(area)} \\times ${rate}$`), sp: 's' };
    },
    (r) => {
      const av = r.pick([6000, 8000, 9600, 12000]), rate = r.pick([5, 6, 8]);
      return { q: T(`Property assessment tax (cukai pintu) is ${rate}% of the annual value of a property. Find the assessment tax payable for a property with an annual value of ${rm(av)}.`, `Cukai pintu ialah ${rate}% daripada nilai tahunan sesebuah hartanah. Cari cukai pintu yang perlu dibayar bagi sebuah hartanah dengan nilai tahunan ${rm(av)}.`), a: T(rm((av * rate) / 100)), w: T(`$${n(av)} \\times ${rate}\\%$`), sp: 's' };
    },
    (r) => {
      const base = r.pick([20, 30, 50, 90]), thr = r.pick([1000, 1300, 1600]);
      const cc = thr;
      return { q: T(`A simplified road-tax schedule (for this question, use the schedule given) charges a flat RM${base} for vehicles up to ${n(thr)} cc. Find the road tax for a car with an engine capacity of ${n(cc)} cc.`, `Sebuah jadual cukai jalan ringkas (untuk soalan ini, gunakan jadual yang diberikan) mengenakan RM${base} rata bagi kenderaan sehingga ${n(thr)} cc. Cari cukai jalan bagi sebuah kereta yang berkuasa enjin ${n(cc)} cc.`), a: T(`RM${base}`), w: T(`${n(cc)} cc is not more than ${n(thr)} cc, so the flat rate RM${base} applies.`, `${n(cc)} cc tidak melebihi ${n(thr)} cc, jadi kadar rata RM${base} dikenakan.`), sp: 's' };
    },
    (r) => {
      const opts = r.sample(TAX_TERMS, 4);
      const ci = r.int(0, 3);
      const correct = opts[ci];
      const L = 'ABCD';
      return { q: T(`Which term matches this description? "${correct.def.en}"<br>${opts.map((o, i) => `(${L[i]}) ${o.term.en}`).join('  ')}`, `Istilah manakah yang sepadan dengan huraian ini? "${correct.def.ms}"<br>${opts.map((o, i) => `(${L[i]}) ${o.term.ms}`).join('  ')}`), a: T(`${L[ci]}: ${correct.term.en}`, `${L[ci]}: ${correct.term.ms}`), w: W(T(`The description is the definition of "${correct.term.en}".`, `Huraian itu ialah takrif "${correct.term.ms}".`), correct.ex), sp: 's' };
    },
    (r) => {
      const items = r.sample(SST_ITEMS, 3);
      const rate = r.pick([6, 8, 10]);
      const prices = items.map((it) => r.step(it.lo, it.hi, 1));
      const tab = sstBillTable(items, prices, rate, 'en'), tabMs = sstBillTable(items, prices, rate, 'ms');
      const total = sum(prices) + sum(items.map((it, i) => (it.taxable ? (prices[i] * rate) / 100 : 0)));
      return { q: T(`A shopping list is shown; SST at ${rate}% applies only to the items marked "Yes".<br>${tab}<br>Find the total amount payable, including SST.`, `Senarai belian ditunjukkan; SST sebanyak ${rate}% hanya dikenakan ke atas barang yang ditandakan "Ya".<br>${tabMs}<br>Cari jumlah keseluruhan yang perlu dibayar, termasuk SST.`), a: T(rm(round(total, 2), 2)), w: W(...sstLines(items, prices, rate)), sp: 's' };
    },
    (r) => {
      const t = r.pick(DIRECT_TAXES);
      return { q: T(`Name one direct tax other than ${t.en} that a Malaysian household might pay.`, `Namakan satu cukai langsung selain ${t.ms} yang mungkin dibayar oleh sebuah isi rumah di Malaysia.`), a: T(DIRECT_TAXES.filter((x) => x.en !== t.en).map((x) => x.en).join(' / '), DIRECT_TAXES.filter((x) => x.en !== t.en).map((x) => x.ms).join(' / ')), w: W(DIR_RULE, T(`Direct taxes: ${DIRECT_TAXES.map((x) => x.en).join(', ')}; any one except ${t.en}.`, `Cukai langsung: ${DIRECT_TAXES.map((x) => x.ms).join(', ')}; mana-mana satu kecuali ${t.ms}.`)), sp: 'xs' };
    },
  ];
  const g41m2 = [
    (r) => {
      const rent = r.pick([700, 900, 1200, 1500, 1800]), rate = r.pick([5, 6, 8, 10]);
      const w = r.pick([
        [`The annual assessment tax (cukai pintu) on a shop is ${rate}% of its yearly rent. The monthly rent is ${rm(rent)}. Find the assessment tax payable for one year.`, `Cukai pintu tahunan sebuah kedai ialah ${rate}% daripada sewa tahunannya. Sewa bulanan ialah ${rm(rent)}. Cari cukai pintu yang perlu dibayar bagi satu tahun.`],
        [`A shop's monthly rent is ${rm(rent)}. If the annual value is taken as twelve times the monthly rent, and assessment tax is charged at ${rate}% of the annual value, find the assessment tax for the year.`, `Sewa bulanan sebuah kedai ialah ${rm(rent)}. Jika nilai tahunan diambil sebagai dua belas kali sewa bulanan, dan cukai pintu dikenakan pada ${rate}% daripada nilai tahunan, cari cukai pintu bagi tahun itu.`],
      ]);
      return { q: T(w[0], w[1]), a: T(rm(round((rent * 12 * rate) / 100, 2), 2)), w: T(`Yearly rent $= ${rent} \\times 12$; tax $= ${rate}\\%$ of that`, `Sewa tahunan $= ${rent} \\times 12$; cukai $= ${rate}\\%$ daripada itu`), sp: 's' };
    },
    (r) => {
      const chargeable = r.pick([28000, 33000, 42000, 47000, 53000]);
      const bands = makeBands(r);
      need(chargeable > bands[0][0] + bands[1][0] && chargeable < bands[0][0] + bands[1][0] + bands[2][0]);
      const { tax, rows } = bandTax(chargeable, bands);
      const tab = bandTableSimple(bands, 'en'), tabMs = bandTableSimple(bands, 'ms');
      return { q: T(`${bandLabel.en}<br>${tab}<br>Find the tax payable on a chargeable income of ${rm(chargeable)}.`, `${bandLabel.ms}<br>${tabMs}<br>Cari cukai yang perlu dibayar bagi pendapatan bercukai ${rm(chargeable)}.`), a: T(`${rows.map((rw) => `${n(rw[0])} × ${rw[1]}%`).join(' + ')} = ${rm(round(tax, 2), 2)}`, `${rows.map((rw) => `${n(rw[0])} × ${rw[1]}%`).join(' + ')} = ${rm(round(tax, 2), 2)}`), w: W(...bandLines(chargeable, bands)), sp: 'm' };
    },
    (r) => {
      const sch = roadTaxSchedule(r);
      const cc = r.pick([sch.t1 + r.pick([100, 200, 300]), sch.t2 + r.pick([100, 200, 300])]);
      const veh = r.pick(ROAD_CTX);
      const tax = roadTaxOf(cc, sch);
      return { q: T(`${roadLabel.en}<br>${roadTable(sch, 'en')}<br>Find the road tax for a ${veh.en} with an engine capacity of ${n(cc)} cc.`, `${roadLabel.ms}<br>${roadTable(sch, 'ms')}<br>Cari cukai jalan bagi sebuah ${veh.ms} yang berkuasa enjin ${n(cc)} cc.`), a: T(rm(round(tax, 2), 2)), w: W(T(`${n(cc)} cc is in the band ${cc <= sch.t2 ? `${sch.t1 + 1} – ${sch.t2}` : `> ${sch.t2}`} cc.`, `${n(cc)} cc berada dalam jalur ${cc <= sch.t2 ? `${sch.t1 + 1} – ${sch.t2}` : `> ${sch.t2}`} cc.`), roadCalc(cc, sch)), sp: 'm' };
    },
    (r) => {
      const area = r.pick([500, 800, 1200, 1500, 2000]), rate = r.pick([0.4, 0.6, 0.8, 1.2]);
      const qr = round(area * rate, 2);
      return { q: T(`Quit rent (cukai tanah) is charged at RM${rate} per m². The quit rent payable on a plot of land is ${rm(qr, 2)}. Find the area of the plot in m².`, `Cukai tanah dikenakan pada kadar RM${rate} bagi setiap m². Cukai tanah yang perlu dibayar bagi sebidang tanah ialah ${rm(qr, 2)}. Cari luas tanah itu dalam m².`), a: T(`${n(area)} m²`), w: T(`$${qr} \\div ${rate}$`), sp: 'm' };
    },
    (r) => {
      const rel = r.sample(RELIEFS, 3);
      const claimed = rel.map((x) => x.cap + r.pick([0, 500, 1000]));
      const allowed = rel.map((x, i) => Math.min(x.cap, claimed[i]));
      const rows = rel.map((x, i) => [x.en, rm(x.cap), rm(claimed[i])]);
      const rowsMs = rel.map((x, i) => [x.ms, rm(x.cap), rm(claimed[i])]);
      return { q: T(`A taxpayer claims these reliefs. Each relief is capped as shown.<br>${SPM.table(rows, { head: ['Relief', 'Cap', 'Claimed'] })}<br>Find the total relief actually allowed.`, `Seorang pembayar cukai menuntut pelepasan berikut. Setiap pelepasan dihadkan seperti ditunjukkan.<br>${SPM.table(rowsMs, { head: ['Pelepasan', 'Had', 'Dituntut'] })}<br>Cari jumlah pelepasan yang benar-benar dibenarkan.`), a: T(rm(sum(allowed)), rm(sum(allowed))), w: T(allowed.map((v) => rm(v)).join(' + '), allowed.map((v) => rm(v)).join(' + ')), sp: 'm' };
    },
    (r) => {
      const payable = r.pick([2200, 3100, 4600, 5400]), pcbMonthly = r.pick([150, 250, 350, 450]);
      const pcbTotal = pcbMonthly * 12;
      need(pcbTotal !== payable);
      const refund = pcbTotal >= payable;
      return { q: T(`A taxpayer's final tax payable, after all bands and rebates, is ${rm(payable)}. Total PCB (monthly tax deduction) paid during the year was ${rm(pcbMonthly)} a month. Is there a refund or a balance to pay, and how much?`, `Cukai muktamad yang perlu dibayar oleh seorang pembayar cukai, selepas semua jadual kadar dan rebat, ialah ${rm(payable)}. Jumlah PCB (potongan cukai bulanan) yang dibayar sepanjang tahun ialah ${rm(pcbMonthly)} sebulan.  Adakah terdapat bayaran balik atau baki tertunggak, dan berapakah jumlahnya?`), a: T(`Total PCB = ${rm(pcbTotal)}. ${refund ? `Refund of ${rm(pcbTotal - payable)}` : `Balance of ${rm(payable - pcbTotal)} still to pay`}.`, `Jumlah PCB = ${rm(pcbTotal)}. ${refund ? `Bayaran balik ${rm(pcbTotal - payable)}` : `Baki ${rm(payable - pcbTotal)} masih perlu dibayar`}.`), w: W(`$${pcbMonthly} \\times 12 = ${pcbTotal}$`, refund ? T(`PCB paid is more than the tax payable: $${pcbTotal} - ${payable} = ${pcbTotal - payable}$ (refund)`, `PCB dibayar lebih daripada cukai perlu dibayar: $${pcbTotal} - ${payable} = ${pcbTotal - payable}$ (bayaran balik)`) : T(`PCB paid is less than the tax payable: $${payable} - ${pcbTotal} = ${payable - pcbTotal}$ (balance)`, `PCB dibayar kurang daripada cukai perlu dibayar: $${payable} - ${pcbTotal} = ${payable - pcbTotal}$ (baki)`)), sp: 'm' };
    },
    (r) => {
      const t1 = r.pick(TAX_TERMS), t2 = r.pick(TAX_TERMS.filter((t) => t.term.en !== t1.term.en));
      return { q: T(`Explain the difference between "${t1.term.en}" and "${t2.term.en}".`, `Terangkan perbezaan antara "${t1.term.ms}" dengan "${t2.term.ms}".`), a: T(`${t1.term.en}: ${t1.def.en}. ${t2.term.en}: ${t2.def.en}.`, `${t1.term.ms}: ${t1.def.ms}. ${t2.term.ms}: ${t2.def.ms}.`), w: W(T(`${t1.term.en}: ${t1.ex.en}`, `${t1.term.ms}: ${t1.ex.ms}`), T(`${t2.term.en}: ${t2.ex.en}`, `${t2.term.ms}: ${t2.ex.ms}`)), sp: 'm' };
    },
    (r) => {
      const items = r.sample(SST_ITEMS, 4);
      const rate = r.pick([6, 8, 10]);
      const prices = items.map((it) => r.step(it.lo, it.hi, 1));
      const tab = sstBillTable(items, prices, rate, 'en'), tabMs = sstBillTable(items, prices, rate, 'ms');
      const sstOnly = sum(items.map((it, i) => (it.taxable ? (prices[i] * rate) / 100 : 0)));
      const total = sum(prices) + sstOnly;
      return { q: T(`A shopping list is shown; SST at ${rate}% applies only to the items marked "Yes".<br>${tab}<br>Find (a) the total SST charged, (b) the total amount payable.`, `Senarai belian ditunjukkan; SST sebanyak ${rate}% hanya dikenakan ke atas barang yang ditandakan "Ya".<br>${tabMs}<br>Cari (a) jumlah SST yang dikenakan, (b) jumlah keseluruhan yang perlu dibayar.`), a: T(`(a) ${rm(round(sstOnly, 2), 2)} (b) ${rm(round(total, 2), 2)}`, `(a) ${rm(round(sstOnly, 2), 2)} (b) ${rm(round(total, 2), 2)}`), w: W(...sstLines(items, prices, rate, '(a) ', '(b) ')), sp: 'm' };
    },
    (r) => {
      const sch = roadTaxSchedule(r);
      const cc = sch.t1 + r.pick([100, 200, 300]);
      const tax = roadTaxOf(cc, sch);
      return { q: T(`${roadLabel.en}<br>${roadTable(sch, 'en')}<br>A car's road tax is ${rm(round(tax, 2), 2)}, and its engine capacity is more than ${n(sch.t1)} cc but not more than ${n(sch.t2)} cc. Find its engine capacity.`, `${roadLabel.ms}<br>${roadTable(sch, 'ms')}<br>Cukai jalan sebuah kereta ialah ${rm(round(tax, 2), 2)}, dan kuasa enjinnya melebihi ${n(sch.t1)} cc tetapi tidak melebihi ${n(sch.t2)} cc. Cari kuasa enjinnya.`), a: T(`${n(cc)} cc`), w: T(`$${sch.t1} + \\dfrac{${round(tax, 2)} - ${sch.base1}}{${sch.rate1}}$`, `$${sch.t1} + \\dfrac{${round(tax, 2)} - ${sch.base1}}{${sch.rate1}}$`), sp: 'm' };
    },
    (r) => {
      const rate = r.pick([0.4, 0.6, 0.8, 1.2]);
      const haOpt = r.chance();
      const areaHa = r.pick([0.1, 0.15, 0.2, 0.25]);
      const areaM2 = haOpt ? areaHa * 10000 : r.pick([500, 800, 1200, 1500]);
      const qr = round(areaM2 * rate, 2);
      return { q: T(`Quit rent (cukai tanah) is RM${rate} per m². 1 hectare $= 10\\,000$ m². Find the quit rent for a plot of land measuring ${haOpt ? `${n(areaHa)} hectares` : `${n(areaM2)} m²`}.`, `Cukai tanah ialah RM${rate} bagi setiap m². 1 hektar $= 10\\,000$ m². Cari cukai tanah bagi sebidang tanah seluas ${haOpt ? `${n(areaHa)} hektar` : `${n(areaM2)} m²`}.`), a: T(rm(qr, 2)), w: haOpt ? T(`$${n(areaHa)} \\times 10\\,000 \\times ${rate}$`, `$${n(areaHa)} \\times 10\\,000 \\times ${rate}$`) : T(`$${n(areaM2)} \\times ${rate}$`, `$${n(areaM2)} \\times ${rate}$`), sp: 'm' };
    },
    (r) => {
      const rel = r.sample(RELIEFS, 4);
      const over = r.int(0, rel.length - 1);
      const claimed = rel.map((x, i) => (i === over ? x.cap + r.pick([500, 1000, 1500]) : Math.round(x.cap * r.pick([0.5, 0.7, 0.9]))));
      const rows = rel.map((x, i) => [x.en, rm(x.cap), rm(claimed[i])]);
      const rowsMs = rel.map((x, i) => [x.ms, rm(x.cap), rm(claimed[i])]);
      return { q: T(`A taxpayer's claimed reliefs are shown, each capped as stated.<br>${SPM.table(rows, { head: ['Relief', 'Cap', 'Claimed'] })}<br>Which relief's claim exceeds its cap, and what amount is actually allowed for it?`, `Pelepasan yang dituntut oleh seorang pembayar cukai ditunjukkan, setiap satu dihadkan seperti dinyatakan.<br>${SPM.table(rowsMs, { head: ['Pelepasan', 'Had', 'Dituntut'] })}<br>Pelepasan manakah yang tuntutannya melebihi hadnya, dan berapakah jumlah yang sebenarnya dibenarkan baginya?`), a: T(`${rel[over].en}: allowed amount is ${rm(rel[over].cap)} (capped).`, `${rel[over].ms}: jumlah yang dibenarkan ialah ${rm(rel[over].cap)} (dihadkan).`), w: W(T(`Compare each claim with its cap: only ${rel[over].en} has claim > cap ($${claimed[over]} > ${rel[over].cap}$).`, `Bandingkan setiap tuntutan dengan hadnya: hanya ${rel[over].ms} mempunyai tuntutan > had ($${claimed[over]} > ${rel[over].cap}$).`), T(`Allowed = the cap, ${rm(rel[over].cap)}.`, `Dibenarkan = had, ${rm(rel[over].cap)}.`)), sp: 'm' };
    },
    (r) => {
      const bill = r.pick([150, 250, 400]), rate = r.pick([6, 8, 10]);
      return { q: T(`(a) Classify SST as a direct tax or an indirect tax. (b) A bill of ${rm(bill)} (before tax) is fully subject to SST at ${rate}%. Find the total amount payable.`, `(a) Kelaskan SST sebagai cukai langsung atau cukai tidak langsung. (b) Sebuah bil berjumlah ${rm(bill)} (sebelum cukai) dikenakan SST sepenuhnya pada ${rate}%. Cari jumlah yang perlu dibayar.`), a: T(`(a) Indirect tax (b) ${rm(bill * (1 + rate / 100))}`, `(a) Cukai tidak langsung (b) ${rm(bill * (1 + rate / 100))}`), w: W(T('(a) SST is added to the price and collected by the seller, so it is indirect.', '(a) SST ditambah pada harga dan dikutip oleh penjual, jadi ia cukai tidak langsung.'), `(b) $${bill} + ${bill} \\times ${rate}\\% = ${bill} + ${n(round((bill * rate) / 100, 2))} = ${n(round(bill * (1 + rate / 100), 2))}$`), sp: 'm' };
    },
  ];
  const g41a2 = [
    (r) => {
      const sal = r.pick([3800, 4500, 5200, 6000]), bonus = r.pick([4000, 6000, 9000]), rental = r.pick([0, 4800, 7200]);
      const relCaps = r.sample(RELIEFS, 3);
      const relClaims = relCaps.map((x) => Math.min(x.cap, x.cap + r.pick([-500, 0, 1500])));
      const relTotal = sum(relClaims);
      const gross = sal * 12 + bonus + rental;
      const chargeable = gross - relTotal;
      const bands = makeBands(r);
      need(chargeable > bands[0][0] + bands[1][0] && chargeable < bands[0][0] + bands[1][0] + bands[2][0]);
      const { tax } = bandTax(chargeable, bands);
      const rebate = r.pick([300, 400, 500]);
      const payable = Math.max(0, round(tax, 2) - rebate);
      const pcbMonthly = r.pick([200, 300, 400, 500]);
      const pcbTotal = pcbMonthly * 12;
      const refund = pcbTotal >= payable;
      const tab = bandTableSimple(bands, 'en'), tabMs = bandTableSimple(bands, 'ms');
      const relRows = relCaps.map((x, i) => [x.en, rm(x.cap), rm(relClaims[i])]);
      const relRowsMs = relCaps.map((x, i) => [x.ms, rm(x.cap), rm(relClaims[i])]);
      return {
        q: T(
          `Aisyah earns a monthly salary of ${rm(sal)}, a bonus of ${rm(bonus)}${rental ? ` and rental income of ${rm(rental)}` : ''} in the year. Her claimed reliefs are shown, each capped as stated.<br>${SPM.table(relRows, { head: ['Relief', 'Cap', 'Claimed'] })}<br>${bandLabel.en}<br>${tab}<br>She receives a tax rebate of ${rm(rebate)}, and paid PCB of ${rm(pcbMonthly)} a month. Find (a) her chargeable income, (b) her tax payable, (c) whether she gets a refund or owes a balance, and how much.`,
          `Aisyah memperoleh gaji bulanan ${rm(sal)}, bonus ${rm(bonus)}${rental ? ` dan pendapatan sewa ${rm(rental)}` : ''} dalam tahun itu. Pelepasan yang dituntutnya ditunjukkan, setiap satu dihadkan seperti dinyatakan.<br>${SPM.table(relRowsMs, { head: ['Pelepasan', 'Had', 'Dituntut'] })}<br>${bandLabel.ms}<br>${tabMs}<br>Dia menerima rebat cukai ${rm(rebate)}, dan telah membayar PCB ${rm(pcbMonthly)} sebulan. Cari (a) pendapatan bercukainya, (b) cukai yang perlu dibayar, (c) sama ada dia menerima bayaran balik atau menanggung baki, dan berapakah jumlahnya.`
        ),
        w: W(
          `(a) $${sal} \\times 12 + ${bonus}${rental ? ` + ${rental}` : ''} = ${gross}$`,
          T(`Reliefs $= ${relClaims.join(' + ')} = ${relTotal}$ (each within its cap)`, `Pelepasan $= ${relClaims.join(' + ')} = ${relTotal}$ (setiap satu dalam hadnya)`),
          `$${gross} - ${relTotal} = ${chargeable}$`,
          ...bandLines(chargeable, bands, '(b) '),
          tax >= rebate ? T(`Less rebate: $${n(round(tax, 2))} - ${rebate} = ${n(payable)}$`, `Tolak rebat: $${n(round(tax, 2))} - ${rebate} = ${n(payable)}$`) : T('The rebate is larger than the tax, so the tax payable is $0$', 'Rebat lebih besar daripada cukai, jadi cukai perlu dibayar ialah $0$'),
          refund ? T(`(c) PCB $= ${pcbMonthly} \\times 12 = ${pcbTotal}$; $${pcbTotal} - ${n(payable)} = ${n(round(pcbTotal - payable, 2))}$ (refund)`, `(c) PCB $= ${pcbMonthly} \\times 12 = ${pcbTotal}$; $${pcbTotal} - ${n(payable)} = ${n(round(pcbTotal - payable, 2))}$ (bayaran balik)`) : T(`(c) PCB $= ${pcbMonthly} \\times 12 = ${pcbTotal}$; $${n(payable)} - ${pcbTotal} = ${n(round(payable - pcbTotal, 2))}$ (balance)`, `(c) PCB $= ${pcbMonthly} \\times 12 = ${pcbTotal}$; $${n(payable)} - ${pcbTotal} = ${n(round(payable - pcbTotal, 2))}$ (baki)`)
        ),
        a: T(`(a) ${rm(chargeable)} (b) ${rm(round(payable, 2), 2)} (c) ${refund ? `refund of ${rm(round(pcbTotal - payable, 2), 2)}` : `balance of ${rm(round(payable - pcbTotal, 2), 2)} owing`}`, `(a) ${rm(chargeable)} (b) ${rm(round(payable, 2), 2)} (c) ${refund ? `bayaran balik ${rm(round(pcbTotal - payable, 2), 2)}` : `baki ${rm(round(payable - pcbTotal, 2), 2)} tertunggak`}`),
        sp: 'xxl',
      };
    },
    (r) => {
      const price = r.pick([106, 212, 318, 530]), rate = r.pick([6, 8, 10]);
      need(Number.isInteger(round((price * 100) / (100 + rate), 0)) === false || true);
      const base = round((price * 100) / (100 + rate), 2);
      return { q: T(`A receipt shows a total of ${rm(price)}, which already includes SST of ${rate}%. Find the price of the item before SST (careful: do not simply take ${rate}% of ${rm(price)}).`, `Satu resit menunjukkan jumlah ${rm(price)}, yang sudah termasuk SST sebanyak ${rate}%. Cari harga barang itu sebelum SST (berhati-hati: jangan hanya ambil ${rate}% daripada ${rm(price)}).`), a: T(rm(base, 2)), w: T(`$\\dfrac{${price}}{1${rate < 10 ? '.0' : '.'}${rate}}$`, `$\\dfrac{${price}}{1${rate < 10 ? '.0' : '.'}${rate}}$`), sp: 'm' };
    },
    (r) => {
      const area = r.pick([600, 900, 1200]), qrRate = r.pick([0.5, 0.8, 1]);
      const rent = r.pick([900, 1200, 1500]), assessRate = r.pick([6, 8, 10]);
      const sch = roadTaxSchedule(r);
      const cc = sch.t2 + r.pick([100, 200]);
      const qr = round(area * qrRate, 2), assess = round((rent * 12 * assessRate) / 100, 2), road = round(roadTaxOf(cc, sch), 2);
      const total = round(qr + assess + road, 2);
      return {
        q: T(
          `A property owner must pay three taxes in a year: quit rent of RM${qrRate} per m² on a ${n(area)} m² plot; assessment tax of ${assessRate}% of the annual value (taken as 12 times the monthly rent of ${rm(rent)}); and road tax, from the schedule below, on a car of ${n(cc)} cc.<br>${roadLabel.en}<br>${roadTable(sch, 'en')}<br>Find the total of the three taxes for the year.`,
          `Seorang pemilik hartanah perlu membayar tiga jenis cukai dalam setahun: cukai tanah RM${qrRate} bagi setiap m² pada sebidang tanah seluas ${n(area)} m²; cukai pintu ${assessRate}% daripada nilai tahunan (diambil sebagai 12 kali sewa bulanan ${rm(rent)}); dan cukai jalan, daripada jadual di bawah, bagi sebuah kereta ${n(cc)} cc.<br>${roadLabel.ms}<br>${roadTable(sch, 'ms')}<br>Cari jumlah ketiga-tiga cukai itu bagi tahun tersebut.`
        ),
        w: W(
          T(`Quit rent $= ${area} \\times ${qrRate} = ${n(qr)}$`, `Cukai tanah $= ${area} \\times ${qrRate} = ${n(qr)}$`),
          T(`Assessment tax $= ${rent} \\times 12 \\times ${assessRate}\\% = ${n(assess)}$`, `Cukai pintu $= ${rent} \\times 12 \\times ${assessRate}\\% = ${n(assess)}$`),
          T(`Road tax (${n(cc)} cc $> ${sch.t2}$ cc): ${roadCalc(cc, sch)}`, `Cukai jalan (${n(cc)} cc $> ${sch.t2}$ cc): ${roadCalc(cc, sch)}`),
          T(`Total $= ${n(qr)} + ${n(assess)} + ${n(road)} = ${n(total)}$`, `Jumlah $= ${n(qr)} + ${n(assess)} + ${n(road)} = ${n(total)}$`)
        ),
        a: T(`Quit rent ${rm(qr, 2)} + assessment tax ${rm(assess, 2)} + road tax ${rm(road, 2)} = ${rm(total, 2)}`, `Cukai tanah ${rm(qr, 2)} + cukai pintu ${rm(assess, 2)} + cukai jalan ${rm(road, 2)} = ${rm(total, 2)}`),
        sp: 'l',
      };
    },
    (r) => {
      const rent = r.pick([700, 900, 1200, 1500]), rate = r.pick([5, 6, 8]);
      const assess = round((rent * 12 * rate) / 100, 2);
      return { q: T(`Assessment tax (cukai pintu) is ${rate}% of the annual value, taken as 12 times the monthly rent. A property's assessment tax for the year is ${rm(assess, 2)}. Find the monthly rent.`, `Cukai pintu ialah ${rate}% daripada nilai tahunan, diambil sebagai 12 kali sewa bulanan. Cukai pintu sesebuah hartanah bagi tahun itu ialah ${rm(assess, 2)}. Cari sewa bulanannya.`), a: T(rm(rent)), w: T(`$\\dfrac{${assess}}{${rate}\\% \\times 12}$`, `$\\dfrac{${assess}}{${rate}\\% \\times 12}$`), sp: 'm' };
    },
    (r) => {
      const bands = makeBands(r);
      const bandIdx = r.pick([1, 2]);
      const thresholdLow = bands[0][0] + (bandIdx === 2 ? bands[1][0] : 0);
      const rate = bands[bandIdx][1];
      const baseTaxAtThreshold = bandTax(thresholdLow, bands).tax;
      const excess = r.pick([2000, 3000, 4000, 5000]);
      need(excess < bands[bandIdx][0]);
      const chargeable = thresholdLow + excess;
      const payable = round(baseTaxAtThreshold + (excess * rate) / 100, 2);
      const tab = bandTableSimple(bands, 'en'), tabMs = bandTableSimple(bands, 'ms');
      return { q: T(`${bandLabel.en}<br>${tab}<br>Tax payable on a chargeable income of ${rm(chargeable)} is ${rm(payable, 2)}. Show this is consistent with the schedule, then find the chargeable income that gives a tax payable of exactly ${rm(round(baseTaxAtThreshold + ((excess / 2) * rate) / 100, 2), 2)}.`, `${bandLabel.ms}<br>${tabMs}<br>Cukai yang perlu dibayar bagi pendapatan bercukai ${rm(chargeable)} ialah ${rm(payable, 2)}. Tunjukkan ini konsisten dengan jadual, kemudian cari pendapatan bercukai yang memberikan cukai yang perlu dibayar tepat ${rm(round(baseTaxAtThreshold + ((excess / 2) * rate) / 100, 2), 2)}.`), a: T(`$${n(round(baseTaxAtThreshold, 2))} + ${excess} \\times ${rate}\\% = ${n(payable)}$, consistent. Chargeable income for the smaller tax = ${rm(thresholdLow + excess / 2)}.`, `$${n(round(baseTaxAtThreshold, 2))} + ${excess} \\times ${rate}\\% = ${n(payable)}$, konsisten. Pendapatan bercukai bagi cukai yang lebih kecil = ${rm(thresholdLow + excess / 2)}.`), w: W(
        ...bandLines(thresholdLow, bands),
        T(`${rm(chargeable)} is ${rm(excess)} above ${rm(thresholdLow)}, taxed at ${rate}%: $${n(round(baseTaxAtThreshold, 2))} + ${excess} \\times ${rate}\\% = ${n(payable)}$ ✓`, `${rm(chargeable)} ialah ${rm(excess)} melebihi ${rm(thresholdLow)}, dicukai pada ${rate}%: $${n(round(baseTaxAtThreshold, 2))} + ${excess} \\times ${rate}\\% = ${n(payable)}$ ✓`),
        T(`Excess for the smaller tax $= \\dfrac{${n(round(baseTaxAtThreshold + ((excess / 2) * rate) / 100, 2))} - ${n(round(baseTaxAtThreshold, 2))}}{${rate}\\%} = ${excess / 2}$`, `Lebihan bagi cukai yang lebih kecil $= \\dfrac{${n(round(baseTaxAtThreshold + ((excess / 2) * rate) / 100, 2))} - ${n(round(baseTaxAtThreshold, 2))}}{${rate}\\%} = ${excess / 2}$`),
        `$${thresholdLow} + ${excess / 2} = ${thresholdLow + excess / 2}$`
      ), sp: 'l' };
    },
    (r) => {
      const incA = r.pick([30000, 36000]), incB = r.pick([24000, 28000]);
      const relSep = r.pick([9000, 10000]);
      const bands = [[20000, 0], [15000, 2], [null, 6]];
      const sepA = bandTax(Math.max(0, incA - relSep), bands).tax;
      const sepB = bandTax(Math.max(0, incB - relSep), bands).tax;
      const sepTotal = sepA + sepB;
      const jointRel = relSep + r.pick([4000, 5000]);
      const jointTax = bandTax(Math.max(0, incA + incB - jointRel), bands).tax;
      const tab = bandTableSimple(bands, 'en'), tabMs = bandTableSimple(bands, 'ms');
      return {
        q: T(
          `A couple may choose separate or joint tax assessment. Under separate assessment, each spouse uses their own income and a relief of ${rm(relSep)}. Under joint assessment, the incomes are combined and a combined relief of ${rm(jointRel)} applies once. ${bandLabel.en}<br>${tab}<br>The husband's income is ${rm(incA)} and the wife's is ${rm(incB)}. Find the total tax under (a) separate assessment, (b) joint assessment, and state which gives the lower total tax for this couple.`,
          `Sepasang suami isteri boleh memilih taksiran berasingan atau bersama. Di bawah taksiran berasingan, setiap pasangan menggunakan pendapatan sendiri dan pelepasan ${rm(relSep)}. Di bawah taksiran bersama, pendapatan digabungkan dan pelepasan gabungan ${rm(jointRel)} terpakai sekali sahaja. ${bandLabel.ms}<br>${tabMs}<br>Pendapatan suami ialah ${rm(incA)} dan isteri ${rm(incB)}. Cari jumlah cukai di bawah (a) taksiran berasingan, (b) taksiran bersama, dan nyatakan yang mana memberikan jumlah cukai lebih rendah bagi pasangan ini.`
        ),
        w: W(
          T(`(a) Husband: $${incA} - ${relSep} = ${incA - relSep}$`, `(a) Suami: $${incA} - ${relSep} = ${incA - relSep}$`),
          bandLines(incA - relSep, bands)[1],
          T(`Wife: $${incB} - ${relSep} = ${incB - relSep}$`, `Isteri: $${incB} - ${relSep} = ${incB - relSep}$`),
          bandLines(incB - relSep, bands)[1],
          T(`Separate total $= ${n(round(sepA, 2))} + ${n(round(sepB, 2))} = ${n(round(sepTotal, 2))}$`, `Jumlah berasingan $= ${n(round(sepA, 2))} + ${n(round(sepB, 2))} = ${n(round(sepTotal, 2))}$`),
          T(`(b) Joint: $${incA} + ${incB} - ${jointRel} = ${incA + incB - jointRel}$`, `(b) Bersama: $${incA} + ${incB} - ${jointRel} = ${incA + incB - jointRel}$`),
          bandLines(incA + incB - jointRel, bands)[1],
          T(`Compare: ${sepTotal <= jointTax ? 'separate' : 'joint'} assessment is lower.`, `Bandingkan: taksiran ${sepTotal <= jointTax ? 'berasingan' : 'bersama'} lebih rendah.`)
        ),
        a: T(`(a) ${rm(round(sepTotal, 2), 2)} (b) ${rm(round(jointTax, 2), 2)}. ${sepTotal <= jointTax ? 'Separate' : 'Joint'} assessment gives the lower total tax here.`, `(a) ${rm(round(sepTotal, 2), 2)} (b) ${rm(round(jointTax, 2), 2)}. Taksiran ${sepTotal <= jointTax ? 'berasingan' : 'bersama'} memberikan jumlah cukai lebih rendah di sini.`),
        sp: 'xl',
      };
    },
    (r) => {
      const items = r.sample(SST_ITEMS, 4);
      need(items.some((it) => it.taxable));
      const rate = r.pick([6, 8, 10]);
      const prices = items.map((it) => r.step(it.lo, it.hi, 1));
      const hideIdx = r.pick(items.map((x, i) => i).filter((i) => items[i].taxable));
      const shownPrices = prices.map((p, i) => (i === hideIdx ? '?' : rm(p)));
      const tabHidden = (lang) => SPM.table(items.map((it, i) => [it[lang], shownPrices[i], it.taxable ? (lang === 'en' ? `Yes (SST ${rate}%)` : `Ya (SST ${rate}%)`) : lang === 'en' ? 'No' : 'Tidak']), { head: lang === 'en' ? ['Item', 'Price', 'Subject to SST?'] : ['Barang', 'Harga', 'Dikenakan SST?'] });
      const sstOnly = sum(items.map((it, i) => (it.taxable ? (prices[i] * rate) / 100 : 0)));
      const total = round(sum(prices) + sstOnly, 2);
      return { q: T(`A shopping list is shown, with one price missing; SST at ${rate}% applies only to the items marked "Yes".<br>${tabHidden('en')}<br>The total amount payable, including SST, is ${rm(total, 2)}. Find the missing price of ${items[hideIdx].en}.`, `Senarai belian ditunjukkan, dengan satu harga yang hilang; SST sebanyak ${rate}% hanya dikenakan ke atas barang yang ditandakan "Ya".<br>${tabHidden('ms')}<br>Jumlah keseluruhan yang perlu dibayar, termasuk SST, ialah ${rm(total, 2)}. Cari harga ${items[hideIdx].ms} yang hilang.`), a: T(rm(prices[hideIdx]), rm(prices[hideIdx])), w: (() => {
        const f = 1 + rate / 100;
        const known = round(sum(prices.map((p, i) => (i === hideIdx ? 0 : items[i].taxable ? p * f : p))), 2);
        return W(
          T(`Let the missing price be $p$. With SST it costs $${n(f)}p$.`, `Katakan harga yang hilang ialah $p$. Dengan SST ia berharga $${n(f)}p$.`),
          T(`Other items, with SST where marked: ${rm(known, 2)}`, `Barang lain, dengan SST jika ditandakan: ${rm(known, 2)}`),
          `$${n(f)}p = ${n(total)} - ${n(known)} = ${n(round(total - known, 2))}$`,
          `$p = \\dfrac{${n(round(total - known, 2))}}{${n(f)}} = ${prices[hideIdx]}$`
        );
      })(), sp: 'l' };
    },
    (r) => {
      const sch1 = roadTaxSchedule(r), sch2 = roadTaxSchedule(r);
      need(sch1.base1 !== sch2.base1 || sch1.rate1 !== sch2.rate1);
      const cc = r.pick([sch1.t1, sch2.t1].map((t) => t + r.pick([100, 200, 300])));
      const tax1 = roadTaxOf(cc, sch1), tax2 = roadTaxOf(cc, sch2);
      return { q: T(`Two hypothetical road-tax schedules are shown (for this question, use the schedules given).<br>Schedule $P$: ${roadTable(sch1, 'en')}<br>Schedule $Q$: ${roadTable(sch2, 'en')}<br>For a car of ${n(cc)} cc, find the road tax under each schedule, and state which schedule is cheaper for this car.`, `Dua jadual cukai jalan hipotesis ditunjukkan (untuk soalan ini, gunakan jadual yang diberikan).<br>Jadual $P$: ${roadTable(sch1, 'ms')}<br>Jadual $Q$: ${roadTable(sch2, 'ms')}<br>Bagi sebuah kereta ${n(cc)} cc, cari cukai jalan di bawah setiap jadual, dan nyatakan jadual manakah lebih murah bagi kereta ini.`), w: W(`$P$: ${roadCalc(cc, sch1)}`, `$Q$: ${roadCalc(cc, sch2)}`, T(`The smaller road tax is under Schedule ${tax1 <= tax2 ? 'P' : 'Q'}.`, `Cukai jalan yang lebih kecil ialah di bawah Jadual ${tax1 <= tax2 ? 'P' : 'Q'}.`)), a: T(`$P$: ${rm(round(tax1, 2), 2)}; $Q$: ${rm(round(tax2, 2), 2)}. Schedule ${tax1 <= tax2 ? 'P' : 'Q'} is cheaper.`, `$P$: ${rm(round(tax1, 2), 2)}; $Q$: ${rm(round(tax2, 2), 2)}. Jadual ${tax1 <= tax2 ? 'P' : 'Q'} lebih murah.`), sp: 'l' };
    },
    (r) => {
      const sal = r.pick([3500, 4200, 5000, 5800]);
      const relCaps = r.sample(RELIEFS, 2);
      const relClaims = relCaps.map((x) => x.cap);
      const relTotal = sum(relClaims);
      const gross = sal * 12;
      const chargeable = gross - relTotal;
      const bands = [[20000, 0], [15000, 2], [20000, 5], [null, 10]];
      need(chargeable > 20000 + 15000 && chargeable < 20000 + 15000 + 20000);
      const { tax } = bandTax(chargeable, bands);
      const rebate = r.pick([300, 400]);
      const payable = Math.max(0, round(tax, 2) - rebate);
      const tab = bandTableSimple(bands, 'en'), tabMs = bandTableSimple(bands, 'ms');
      return { q: T(`A taxpayer's only income is a monthly salary of ${rm(sal)}. Total reliefs are ${rm(relTotal)}. ${bandLabel.en}<br>${tab}<br>Tax payable after a rebate of ${rm(rebate)} is exactly ${rm(round(payable, 2), 2)}. Verify this by computing the chargeable income and the band tax yourself.`, `Satu-satunya pendapatan seorang pembayar cukai ialah gaji bulanan ${rm(sal)}. Jumlah pelepasan ialah ${rm(relTotal)}. ${bandLabel.ms}<br>${tabMs}<br>Cukai yang perlu dibayar selepas rebat ${rm(rebate)} ialah tepat ${rm(round(payable, 2), 2)}. Sahkan ini dengan mengira sendiri pendapatan bercukai dan cukai jadual.`), a: T(`Chargeable income = ${rm(gross)} − ${rm(relTotal)} = ${rm(chargeable)}; band tax = ${rm(round(tax, 2), 2)}; tax payable = ${rm(round(tax, 2), 2)} − ${rm(rebate)} = ${rm(round(payable, 2), 2)}. Verified.`, `Pendapatan bercukai = ${rm(gross)} − ${rm(relTotal)} = ${rm(chargeable)}; cukai jadual = ${rm(round(tax, 2), 2)}; cukai perlu dibayar = ${rm(round(tax, 2), 2)} − ${rm(rebate)} = ${rm(round(payable, 2), 2)}. Disahkan.`), w: W(
        T(`Chargeable income $= ${sal} \\times 12 - ${relTotal} = ${chargeable}$`, `Pendapatan bercukai $= ${sal} \\times 12 - ${relTotal} = ${chargeable}$`),
        ...bandLines(chargeable, bands),
        T(`Tax payable $= ${n(round(tax, 2))} - ${rebate} = ${n(payable)}$ ✓`, `Cukai perlu dibayar $= ${n(round(tax, 2))} - ${rebate} = ${n(payable)}$ ✓`)
      ), sp: 'l' };
    },
  ];
  SPM.extend('F5-4.1', { e: g41e2, m: g41m2, a: g41a2 });

  /* =================================================================================== 4.1E Consequences of tax evasion */
  const EVASION_SCEN = [
    { en: 'A shop owner keeps two sets of accounts, showing lower sales to the tax authority than actually made.', ms: 'Seorang pemilik kedai menyimpan dua set akaun, menunjukkan jualan yang lebih rendah kepada pihak berkuasa cukai berbanding jualan sebenar.', ok: true, why: T('sales are deliberately under-reported using false accounts', 'jualan sengaja dilapor kurang menggunakan akaun palsu') },
    { en: 'A freelancer does not declare cash payments received for work done.', ms: 'Seorang pekerja bebas tidak mengisytiharkan bayaran tunai yang diterima bagi kerja yang dilakukan.', ok: true, why: T('cash income is deliberately not declared', 'pendapatan tunai sengaja tidak diisytiharkan') },
    { en: 'A company creates fake invoices to claim expenses that were never actually incurred.', ms: 'Sebuah syarikat mencipta invois palsu untuk menuntut perbelanjaan yang sebenarnya tidak pernah dilakukan.', ok: true, why: T('records are falsified with fake invoices', 'rekod dipalsukan dengan invois palsu') },
    { en: 'A taxpayer claims a relief that he is legitimately entitled to, keeping the receipts as proof.', ms: 'Seorang pembayar cukai menuntut pelepasan yang layak dituntutnya secara sah, dengan menyimpan resit sebagai bukti.', ok: false, why: T('a relief he is entitled to is claimed openly, with proof', 'pelepasan yang layak dituntut secara terbuka, dengan bukti') },
    { en: 'An employee accidentally forgets to declare a small amount of bank interest and corrects it as soon as she is reminded.', ms: 'Seorang pekerja terlupa mengisytiharkan sedikit faedah bank secara tidak sengaja dan membetulkannya sebaik sahaja diingatkan.', ok: false, why: T('an accidental mistake, corrected as soon as she is reminded', 'kesilapan tidak sengaja, dibetulkan sebaik sahaja diingatkan') },
    { en: 'A business owner restructures a large purchase, within the rules, to make use of a legal tax relief.', ms: 'Seorang pemilik perniagaan menyusun semula satu pembelian besar, mengikut peraturan yang dibenarkan, untuk memanfaatkan pelepasan cukai yang sah.', ok: false, why: T('the rules are used as allowed to claim a legal relief', 'peraturan digunakan seperti yang dibenarkan untuk menuntut pelepasan yang sah') },
    { en: 'A landlord under-reports rental income received in cash to reduce the tax owed.', ms: 'Seorang tuan rumah melapor kurang pendapatan sewa yang diterima secara tunai untuk mengurangkan cukai yang perlu dibayar.', ok: true, why: T('cash rent is deliberately under-reported', 'sewa tunai sengaja dilapor kurang') },
    { en: 'An online seller does not declare any of the income earned from selling goods on a social media page.', ms: 'Seorang penjual dalam talian tidak mengisytiharkan langsung pendapatan yang diperoleh daripada menjual barangan di sebuah laman media sosial.', ok: true, why: T('income is deliberately not declared', 'pendapatan sengaja tidak diisytiharkan') },
    { en: 'A worker who is paid in cash for odd jobs keeps no records at all and never files a tax return, hoping not to be noticed.', ms: 'Seorang pekerja yang dibayar secara tunai untuk kerja sambilan tidak menyimpan sebarang rekod dan tidak pernah memfailkan penyata cukai, berharap tidak disedari.', ok: true, why: T('income is hidden by keeping no records and filing no return', 'pendapatan disembunyikan dengan tidak menyimpan rekod dan tidak memfailkan penyata') },
    { en: 'A company mixes the director\'s personal holiday expenses into the business accounts and claims them as business expenses to lower taxable profit.', ms: 'Sebuah syarikat mencampurkan perbelanjaan percutian peribadi pengarah ke dalam akaun perniagaan dan menuntutnya sebagai perbelanjaan perniagaan untuk mengurangkan keuntungan bercukai.', ok: true, why: T('personal expenses are falsely claimed as business expenses', 'perbelanjaan peribadi dituntut secara palsu sebagai perbelanjaan perniagaan') },
    { en: 'A taxpayer keeps proper receipts and claims exactly the education fees relief that the rules allow, no more and no less.', ms: 'Seorang pembayar cukai menyimpan resit yang lengkap dan menuntut tepat pelepasan yuran pendidikan yang dibenarkan oleh peraturan, tidak lebih dan tidak kurang.', ok: false, why: T('exactly the relief allowed is claimed, with receipts', 'tepat pelepasan yang dibenarkan dituntut, dengan resit') },
    { en: 'A business delays a large purchase to the following tax year, within the rules, so that the relief is claimed when it is most useful.', ms: 'Sebuah perniagaan menangguhkan sesuatu pembelian besar ke tahun cukai berikutnya, mengikut peraturan yang dibenarkan, supaya pelepasan itu dituntut pada masa yang paling berfaedah.', ok: false, why: T('the timing is chosen within the rules (lawful planning)', 'masa dipilih mengikut peraturan (perancangan yang sah)') },
    { en: 'A freelancer under-declares part of her income after being told by a friend that "small amounts are never checked".', ms: 'Seorang pekerja bebas melapor kurang sebahagian pendapatannya selepas diberitahu oleh seorang rakan bahawa "jumlah kecil tidak pernah disemak".', ok: true, why: T('part of the income is deliberately under-declared', 'sebahagian pendapatan sengaja dilapor kurang') },
    { en: 'A taxpayer notices an error on last year\'s tax return that understated her income, and voluntarily informs the tax authority and pays the difference.', ms: 'Seorang pembayar cukai menyedari satu kesilapan pada penyata cukai tahun lepas yang menyatakan pendapatannya terlalu rendah, dan secara sukarela memaklumkan pihak berkuasa cukai serta membayar bakinya.', ok: false, why: T('an error is voluntarily corrected and the tax paid', 'kesilapan dibetulkan secara sukarela dan cukai dibayar') },
  ];
  const EV_RULE = T('Tax evasion = deliberately hiding income or falsifying records to avoid tax that is due (illegal).', 'Pengelakan cukai secara haram = sengaja menyembunyikan pendapatan atau memalsukan rekod untuk mengelak cukai yang perlu dibayar (menyalahi undang-undang).');
  const cap1 = (x) => x.charAt(0).toUpperCase() + x.slice(1);
  const evLine = (c, pre) => T(`${pre || ''}${pre ? c.why.en : cap1(c.why.en)} → ${c.ok ? 'evasion' : 'not evasion'}`, `${pre || ''}${pre ? c.why.ms : cap1(c.why.ms)} → ${c.ok ? 'pengelakan haram' : 'bukan pengelakan haram'}`);
  const CONSEQ_BANK = [
    { en: 'the taxpayer being investigated and audited', ms: 'pembayar cukai disiasat dan diaudit', kind: 'legal' },
    { en: 'a financial penalty or fine on top of the unpaid tax', ms: 'penalti atau denda kewangan tambahan kepada cukai yang tertunggak', kind: 'legal' },
    { en: 'interest charged on the amount of tax owed', ms: 'faedah dikenakan ke atas jumlah cukai yang tertunggak', kind: 'legal' },
    { en: 'the unfair shifting of the tax burden onto honest, compliant taxpayers', ms: 'peralihan beban cukai secara tidak adil kepada pembayar cukai yang jujur dan patuh', kind: 'ethical' },
    { en: 'less public revenue for shared services such as schools, hospitals and roads', ms: 'kurang hasil awam untuk perkhidmatan bersama seperti sekolah, hospital dan jalan raya', kind: 'ethical' },
    { en: 'erosion of public trust in the fairness of the tax system', ms: 'penghakisan keyakinan awam terhadap keadilan sistem percukaian', kind: 'ethical' },
  ];
  const g4Ee2 = [
    (r) => {
      const c = r.pick(EVASION_SCEN);
      return { q: T(`Is this tax evasion, an honest error, or lawful tax planning? Explain. "${c.en}"`, `Adakah ini pengelakan cukai secara haram, kesilapan jujur, atau perancangan cukai yang sah? Terangkan. "${c.ms}"`), a: c.ok ? T('Tax evasion: it deliberately conceals or falsifies information to avoid paying tax that is legally due.', 'Pengelakan cukai secara haram: ia sengaja menyembunyikan atau memalsukan maklumat untuk mengelak membayar cukai yang perlu dibayar mengikut undang-undang.') : T('Not evasion: this is either an honest, corrected error or a lawful use of the rules, not deliberate concealment.', 'Bukan pengelakan cukai secara haram: ini sama ada kesilapan jujur yang dibetulkan atau penggunaan peraturan secara sah, bukan penyembunyian yang disengajakan.'), w: W(EV_RULE, evLine(c)), sp: 's' };
    },
    (r) => {
      const t = r.pick(TAX_TERMS.filter((t) => t.term.en.indexOf('avoidance') >= 0 || t.term.en.indexOf('evasion') >= 0));
      return { q: T(`Define "${t.term.en}".`, `Takrifkan "${t.term.ms}".`), a: t.def, w: W(t.ex), sp: 's' };
    },
    (r) => {
      const c1 = r.pick(EVASION_SCEN.filter((x) => x.ok)), c2 = r.pick(EVASION_SCEN.filter((x) => !x.ok));
      const swap = r.chance();
      const pair = swap ? [c2, c1] : [c1, c2];
      return { q: T(`Which of these two situations is tax evasion? (A) "${pair[0].en}" (B) "${pair[1].en}"`, `Situasi manakah antara kedua-duanya ini merupakan pengelakan cukai secara haram? (A) "${pair[0].ms}" (B) "${pair[1].ms}"`), a: T(pair[0].ok ? '(A)' : '(B)', pair[0].ok ? '(A)' : '(B)'), w: W(EV_RULE, evLine(pair[0], '(A) '), evLine(pair[1], '(B) ')), sp: 's' };
    },
    (r) => {
      const c = r.pick(CONSEQ_BANK);
      return { q: T(`Is "${c.en}" a legal/financial consequence of tax evasion, or a moral/ethical one?`, `Adakah "${c.ms}" merupakan akibat undang-undang/kewangan pengelakan cukai secara haram, atau akibat moral/etika?`), a: c.kind === 'legal' ? T('Legal/financial', 'Undang-undang/kewangan') : T('Moral/ethical', 'Moral/etika'), w: W(T('Legal/financial consequences are actions taken against the taxpayer (audit, penalty, interest); moral/ethical ones are harm to fairness and to society.', 'Akibat undang-undang/kewangan ialah tindakan terhadap pembayar cukai (audit, penalti, faedah); akibat moral/etika ialah kesan buruk terhadap keadilan dan masyarakat.'), c.kind === 'legal' ? T('This is an action against the taxpayer, so it is legal/financial.', 'Ini tindakan terhadap pembayar cukai, jadi ia undang-undang/kewangan.') : T('This is harm to fairness or society, so it is moral/ethical.', 'Ini kesan buruk terhadap keadilan atau masyarakat, jadi ia moral/etika.')), sp: 'xs' };
    },
    (r) => {
      const c = r.pick(EVASION_SCEN);
      return { q: T(`True or false? "${c.en}" describes tax evasion.`, `Betul atau salah? "${c.ms}" menggambarkan pengelakan cukai secara haram.`), a: T(c.ok ? 'True' : 'False', c.ok ? 'Betul' : 'Salah'), w: W(EV_RULE, evLine(c)), sp: 'xs' };
    },
  ];
  const g4Em2 = [
    (r) => {
      const c = r.pick(EVASION_SCEN.filter((x) => x.ok));
      const rule = r.pick([
        T('this question, an investigation may lead to repayment of the unpaid tax, a financial penalty, and possible legal action', 'soalan ini, siasatan boleh membawa kepada pembayaran balik cukai yang tertunggak, penalti kewangan, dan tindakan undang-undang yang mungkin'),
        T('this question, the tax authority may audit the taxpayer, charge interest on the unpaid amount, and impose a fine', 'soalan ini, pihak berkuasa cukai boleh mengaudit pembayar cukai, mengenakan faedah ke atas jumlah tertunggak, dan mengenakan denda'),
      ]);
      return { q: T(`"${c.en}" Using the rule given for this question — for ${rule.en} — state two legal or financial consequences this taxpayer could face.`, `"${c.ms}" Dengan menggunakan peraturan yang diberikan untuk ${rule.ms} — nyatakan dua akibat undang-undang atau kewangan yang mungkin dihadapi oleh pembayar cukai ini.`), a: T(`Any two of: repayment of the unpaid tax; a financial penalty; interest charged on the amount owed; investigation/audit; possible prosecution, as stated in the rule for this question.`, `Mana-mana dua daripada: bayaran balik cukai tertunggak; penalti kewangan; faedah dikenakan ke atas jumlah tertunggak; siasatan/audit; kemungkinan pendakwaan, seperti dinyatakan dalam peraturan bagi soalan ini.`), w: W(evLine(c), T('Once detected, the tax authority recovers the unpaid tax and punishes the evasion (e.g. repayment + penalty).', 'Apabila dikesan, pihak berkuasa cukai memulihkan cukai tertunggak dan menghukum pengelakan itu (cth. bayaran balik + penalti).')), sp: 'm' };
    },
    (r) => {
      const c = r.pick(EVASION_SCEN.filter((x) => x.ok));
      return { q: T(`"${c.en}" Explain why this reduces the funds available for shared public services such as schools, hospitals and roads.`, `"${c.ms}" Terangkan mengapa ini mengurangkan dana yang tersedia untuk perkhidmatan awam bersama seperti sekolah, hospital dan jalan raya.`), a: T('Tax revenue collected from taxpayers funds shared public services; if tax legally due is not paid, less money is available for the government to spend on these services, or the burden shifts to honest taxpayers.', 'Hasil cukai yang dikutip daripada pembayar cukai membiayai perkhidmatan awam bersama; jika cukai yang perlu dibayar mengikut undang-undang tidak dibayar, kurang wang tersedia untuk perbelanjaan kerajaan ke atas perkhidmatan ini, atau bebannya beralih kepada pembayar cukai yang jujur.'), w: W(T('Tax paid → government revenue → schools, hospitals, roads.', 'Cukai dibayar → hasil kerajaan → sekolah, hospital, jalan raya.'), T('Tax not paid → less revenue → fewer services, or higher taxes on honest taxpayers.', 'Cukai tidak dibayar → kurang hasil → kurang perkhidmatan, atau cukai lebih tinggi ke atas pembayar cukai jujur.')), sp: 'm' };
    },
    (r) => {
      const t1 = r.pick(TAX_TERMS.filter((t) => t.term.en.indexOf('evasion') >= 0)), t2 = r.pick(TAX_TERMS.filter((t) => t.term.en.indexOf('avoidance') >= 0));
      return { q: T(`Explain the key difference between "${t1.term.en}" and "${t2.term.en}", and why only one of them is illegal.`, `Terangkan perbezaan utama antara "${t1.term.ms}" dengan "${t2.term.ms}", dan mengapa hanya satu daripadanya menyalahi undang-undang.`), a: T(`${t1.term.en} (${t1.def.en}) is illegal because it involves concealment or false reporting; ${t2.term.en} (${t2.def.en}) is legal because it uses the rules as intended.`, `${t1.term.ms} (${t1.def.ms}) menyalahi undang-undang kerana ia melibatkan penyembunyian atau laporan palsu; ${t2.term.ms} (${t2.def.ms}) sah kerana ia menggunakan peraturan seperti yang dimaksudkan.`), w: W(T(`${t1.term.en}: ${t1.ex.en}`, `${t1.term.ms}: ${t1.ex.ms}`), T(`${t2.term.en}: ${t2.ex.en}`, `${t2.term.ms}: ${t2.ex.ms}`), T('Key test: is information hidden or falsified? Yes → illegal.', 'Ujian utama: adakah maklumat disembunyikan atau dipalsukan? Ya → menyalahi undang-undang.')), sp: 'm' };
    },
    (r) => {
      const scens = r.sample(EVASION_SCEN, 3);
      return { q: T(`Classify each situation as tax evasion or not (with a one-phrase reason).<br>(a) "${scens[0].en}"<br>(b) "${scens[1].en}"<br>(c) "${scens[2].en}"`, `Kelaskan setiap situasi sebagai pengelakan cukai secara haram atau bukan (dengan sebab ringkas).<br>(a) "${scens[0].ms}"<br>(b) "${scens[1].ms}"<br>(c) "${scens[2].ms}"`), a: SPM.parts(scens.map((c) => (c.ok ? T('Evasion: deliberate concealment/falsification.', 'Pengelakan haram: penyembunyian/pemalsuan yang disengajakan.') : T('Not evasion: honest error or lawful planning.', 'Bukan pengelakan haram: kesilapan jujur atau perancangan yang sah.')))), w: W(EV_RULE, ...scens.map((c, i) => evLine(c, `(${'abc'[i]}) `))), sp: 'm' };
    },
    (r) => {
      const c = r.pick(EVASION_SCEN.filter((x) => x.ok));
      const cs = r.sample(CONSEQ_BANK.filter((x) => x.kind === 'legal'), 2);
      return { q: T(`"${c.en}" Explain how each of these could apply as a consequence: (a) ${cs[0].en}, (b) ${cs[1].en}.`, `"${c.ms}" Terangkan bagaimana setiap satu ini boleh terpakai sebagai akibat: (a) ${cs[0].ms}, (b) ${cs[1].ms}.`), a: T(`Because the tax authority can detect the concealment, it may respond with (a) ${cs[0].en} and (b) ${cs[1].en}, both aimed at recovering the tax owed and deterring further evasion.`, `Kerana pihak berkuasa cukai boleh mengesan penyembunyian itu, ia mungkin bertindak balas dengan (a) ${cs[0].ms} dan (b) ${cs[1].ms}, kedua-duanya bertujuan memulihkan cukai yang tertunggak dan mencegah pengelakan selanjutnya.`), w: W(evLine(c), T(`Both (a) ${cs[0].en} and (b) ${cs[1].en} are actions the tax authority takes after detecting it.`, `Kedua-dua (a) ${cs[0].ms} dan (b) ${cs[1].ms} ialah tindakan pihak berkuasa cukai selepas mengesannya.`)), sp: 'm' };
    },
  ];
  const g4Ea2 = [
    (r) => {
      const c = r.pick(EVASION_SCEN.filter((x) => x.ok));
      return { q: T(`"${c.en}" Evaluate both (i) the legal and financial consequences for the taxpayer and for public revenue, and (ii) the moral and ethical consequences of this behaviour.`, `"${c.ms}" Nilaikan kedua-dua (i) akibat undang-undang dan kewangan kepada pembayar cukai dan kepada hasil awam, dan (ii) akibat moral dan etika tingkah laku ini.`), a: T('(i) The taxpayer risks investigation, penalties, interest and repayment of the unpaid tax, while public revenue available for shared services is reduced. (ii) It is dishonest, unfairly shifts the tax burden onto compliant taxpayers, and erodes public trust in the tax system.', '(i) Pembayar cukai berisiko disiasat, dikenakan penalti, faedah dan bayaran balik cukai tertunggak, manakala hasil awam yang tersedia untuk perkhidmatan bersama berkurangan. (ii) Ia tidak jujur, secara tidak adil mengalihkan beban cukai kepada pembayar cukai yang patuh, dan menghakis keyakinan awam terhadap sistem percukaian.'), w: W(evLine(c), T('(i) Taxpayer: audit, penalty, interest, repayment. Public: less revenue for services.', '(i) Pembayar cukai: audit, penalti, faedah, bayaran balik. Awam: kurang hasil untuk perkhidmatan.'), T('(ii) Dishonest; unfair to compliant taxpayers; lowers trust in the system.', '(ii) Tidak jujur; tidak adil kepada pembayar cukai yang patuh; mengurangkan keyakinan terhadap sistem.')), sp: 'l' };
    },
    (r) => {
      const claim = r.pick([
        T("A friend says: \"Under-declaring a little income is fine, because everyone does it and the amount is small.\"", 'Seorang rakan berkata: "Melapor kurang sedikit pendapatan tidak mengapa, kerana semua orang melakukannya dan jumlahnya kecil."'),
        T('A friend says: "Tax evasion only hurts the government, not other people."', 'Seorang rakan berkata: "Pengelakan cukai secara haram hanya merugikan kerajaan, bukan orang lain."'),
      ]);
      return { q: T(`${claim.en} Evaluate this claim from both a financial/legal perspective and an ethical perspective.`, `${claim.ms} Nilaikan dakwaan ini daripada perspektif kewangan/undang-undang dan perspektif etika.`), a: T('Financially/legally, it is still illegal regardless of the amount or how common it is, and can still lead to penalties if discovered. Ethically, it does hurt other people: it reduces the funds available for public services that everyone relies on, and shifts the tax burden onto honest taxpayers, which is unfair.', 'Dari segi kewangan/undang-undang, ia masih menyalahi undang-undang tanpa mengira jumlah atau kelaziman, dan masih boleh membawa kepada penalti jika ditemui. Dari segi etika, ia memang merugikan orang lain: ia mengurangkan dana yang tersedia untuk perkhidmatan awam yang digunakan semua orang, dan mengalihkan beban cukai kepada pembayar cukai yang jujur, yang tidak adil.'), w: W(T('Legal view: the law has no exception for small amounts or for "everyone does it".', 'Pandangan undang-undang: tiada pengecualian bagi jumlah kecil atau kerana "semua orang melakukannya".'), T('Ethical view: other people pay the cost through fewer public services or a higher tax burden.', 'Pandangan etika: orang lain menanggung kosnya melalui kurang perkhidmatan awam atau beban cukai yang lebih tinggi.')), sp: 'l' };
    },
    (r) => {
      const c = r.pick(EVASION_SCEN);
      return { q: T(`"${c.en}" (a) Classify this as tax evasion or not, with a reason. (b) Whatever your classification, explain one way the situation, or a small change to it, could cross the line into tax evasion if it has not already.`, `"${c.ms}" (a) Kelaskan ini sebagai pengelakan cukai secara haram atau bukan, dengan sebab. (b) Tanpa mengira klasifikasi anda, terangkan satu cara situasi ini, atau sedikit perubahan kepadanya, boleh melangkaui batas menjadi pengelakan cukai secara haram jika ia belum lagi begitu.`), a: T(`(a) ${c.ok ? 'Tax evasion, because information is deliberately concealed or falsified.' : 'Not evasion as described, because there is no deliberate concealment or falsification.'} (b) It would become evasion if the taxpayer deliberately hid income, falsified records, or refused to correct a known error once identified.`, `(a) ${c.ok ? 'Pengelakan cukai secara haram, kerana maklumat sengaja disembunyikan atau dipalsukan.' : 'Bukan pengelakan cukai secara haram seperti yang digambarkan, kerana tiada penyembunyian atau pemalsuan yang disengajakan.'} (b) Ia akan menjadi pengelakan cukai secara haram jika pembayar cukai sengaja menyembunyikan pendapatan, memalsukan rekod, atau enggan membetulkan kesilapan yang diketahui setelah dikenal pasti.`), w: W(evLine(c, '(a) '), T('(b) The line is crossed when information is deliberately hidden or falsified.', '(b) Batas itu dilangkaui apabila maklumat sengaja disembunyikan atau dipalsukan.')), sp: 'l' };
    },
    (r) => {
      const c1 = r.pick(EVASION_SCEN.filter((x) => x.ok)), c2 = r.pick(EVASION_SCEN.filter((x) => !x.ok));
      return { q: T(`Compare these two situations. $X$: "${c1.en}" $Y$: "${c2.en}" For each, state whether it is legal, and explain the main consequence its taxpayer faces (or avoids facing).`, `Bandingkan dua situasi ini. $X$: "${c1.ms}" $Y$: "${c2.ms}" Bagi setiap satu, nyatakan sama ada ia sah, dan terangkan akibat utama yang dihadapi (atau dielakkan) oleh pembayar cukai itu.`), a: T(`$X$ is illegal tax evasion; its taxpayer risks investigation, penalties and repayment of unpaid tax. $Y$ is legal (an honest error or lawful planning); its taxpayer faces no penalty, provided any genuine error is corrected when found.`, `$X$ ialah pengelakan cukai secara haram; pembayar cukainya berisiko disiasat, dikenakan penalti dan membayar balik cukai tertunggak. $Y$ adalah sah (kesilapan jujur atau perancangan yang sah); pembayar cukainya tidak menghadapi penalti, dengan syarat sebarang kesilapan sebenar dibetulkan apabila ditemui.`), w: W(evLine(c1, '$X$: '), evLine(c2, '$Y$: ')), sp: 'l' };
    },
    (r) => {
      return { q: T(`A country's tax system relies heavily on taxpayers voluntarily declaring their income honestly. Discuss what could happen to public services and to honest taxpayers if tax evasion became widespread and largely unpunished, considering both the financial and the ethical dimensions.`, `Sistem percukaian sesebuah negara sangat bergantung pada pembayar cukai mengisytiharkan pendapatan mereka secara jujur dan sukarela. Bincangkan apa yang boleh berlaku kepada perkhidmatan awam dan kepada pembayar cukai yang jujur jika pengelakan cukai menjadi berleluasa dan tidak banyak dihukum, dengan mempertimbangkan kedua-dua dimensi kewangan dan etika.`), a: T('Financially, government revenue would fall sharply, forcing cuts to public services (schools, healthcare, infrastructure) or higher tax rates on everyone, including honest taxpayers who already comply. Ethically, widespread unpunished evasion normalises dishonesty, rewards those who cheat over those who comply, and severely damages public trust in the fairness of the whole tax system, which could reduce voluntary compliance even further.', 'Dari segi kewangan, hasil kerajaan akan merosot dengan mendadak, memaksa pemotongan perkhidmatan awam (sekolah, penjagaan kesihatan, infrastruktur) atau kadar cukai yang lebih tinggi ke atas semua orang, termasuk pembayar cukai jujur yang sudah patuh. Dari segi etika, pengelakan cukai yang berleluasa dan tidak dihukum menormalkan ketidakjujuran, memberi ganjaran kepada mereka yang menipu berbanding yang patuh, dan merosakkan dengan teruk keyakinan awam terhadap keadilan keseluruhan sistem percukaian, yang boleh mengurangkan lagi pematuhan sukarela.'), w: W(T('Financial: less revenue → cuts to services or higher taxes for everyone.', 'Kewangan: kurang hasil → pemotongan perkhidmatan atau cukai lebih tinggi untuk semua.'), T('Ethical: cheating is rewarded, honest taxpayers are treated unfairly, trust and compliance fall.', 'Etika: penipuan diberi ganjaran, pembayar cukai jujur dilayan secara tidak adil, keyakinan dan pematuhan menurun.')), sp: 'l' };
    },
  ];
  SPM.extend('F5-4.1E', { e: g4Ee2, m: g4Em2, a: g4Ea2 });

  /* =================================================================================== Ch7 shared helpers */
  const cls = (lo, w, k) => range(0, k - 1).map((i) => [lo + i * w, lo + (i + 1) * w - 1]);
  const mid = (c) => (c[0] + c[1]) / 2;
  const bnd = (c) => [c[0] - 0.5, c[1] + 0.5];
  const gt = (cl, fs, head, cols) => SPM.table(cl.map((c, i) => [`${c[0]}–${c[1]}`, fs[i], ...(cols ? cols[i] : [])]), { head });
  const gStats = (cl, fs) => {
    const N = sum(fs), sx = sum(cl.map((c, i) => mid(c) * fs[i])), sxx = sum(cl.map((c, i) => mid(c) * mid(c) * fs[i]));
    const m = sx / N, v = sxx / N - m * m;
    return { N, sx, sxx, m, v, sd: Math.sqrt(v) };
  };
  const f2 = (x) => n(round(x, 2));
  /** prefix (a T or a maths string) + maths line, bilingual */
  const pl = (pre, m) => (pre ? T(`${pre.en || pre}${m}`, `${pre.ms || pre}${m}`) : m);
  /** full working of the grouped mean and standard deviation (midpoints, sums, mean, variance, s.d.) */
  const statLines = (cl, fs) => {
    const st = gStats(cl, fs), v4 = n(round(st.v, 4));
    return [
      T(`Midpoints $x$: ${cl.map((c) => n(mid(c))).join(', ')}`, `Titik tengah $x$: ${cl.map((c) => n(mid(c))).join(', ')}`),
      `$\\sum f = ${st.N}$, $\\sum fx = ${fs.map((f, i) => `${f}(${n(mid(cl[i]))})`).join(' + ')} = ${n(st.sx)}$`,
      `$\\sum fx^2 = ${fs.map((f, i) => `${f}(${n(mid(cl[i]))})^2`).join(' + ')} = ${n(st.sxx)}$`,
      `$\\bar{x} = \\dfrac{${n(st.sx)}}{${st.N}} = ${f2(st.m)}$`,
      `$\\sigma^2 = \\dfrac{${n(st.sxx)}}{${st.N}} - \\left(\\dfrac{${n(st.sx)}}{${st.N}}\\right)^2 = ${v4}$, $\\sigma = \\sqrt{${v4}} = ${f2(st.sd)}$`,
    ];
  };
  /** the same in two lines, for comparing several distributions */
  const statShort = (cl, fs, pre) => {
    const st = gStats(cl, fs);
    return [
      pl(pre, `$\\sum f = ${st.N}$, $\\sum fx = ${n(st.sx)}$, $\\sum fx^2 = ${n(st.sxx)}$`),
      pl(pre, `$\\bar{x} = \\dfrac{${n(st.sx)}}{${st.N}} = ${f2(st.m)}$, $\\sigma = \\sqrt{\\dfrac{${n(st.sxx)}}{${st.N}} - \\left(\\dfrac{${n(st.sx)}}{${st.N}}\\right)^2} = ${f2(st.sd)}$`),
    ];
  };
  /** "the term is defined as … e.g. …" for a matching / MCQ term question */
  const termW = (t) => W(T(`The description is the definition of "${t.term.en}".`, `Huraian itu ialah takrif "${t.term.ms}".`), t.ex);
  const cfOf = (fs) => fs.reduce((a, v) => a.concat([(a.length ? a[a.length - 1] : 0) + v]), []);
  /** ogive-style linear interpolation of the value at which cumulative frequency = target */
  const interp = (cl, fs, target) => {
    const cf = cfOf(fs);
    for (let i = 0; i < cl.length; i++)
      if (cf[i] >= target) {
        const lo = cl[i][0] - 0.5, prev = i ? cf[i - 1] : 0;
        return lo + ((target - prev) / fs[i]) * (cl[i][1] - cl[i][0] + 1);
      }
    return cl[cl.length - 1][1] + 0.5;
  };
  /** linear-interpolation working for the value at cumulative frequency t (dp = decimals shown) */
  const ipl = (cl, fs, t, lab, dp) => {
    const cf = cfOf(fs), i = cf.findIndex((v) => v >= t);
    const F = i ? cf[i - 1] : 0, c = cl[i][1] - cl[i][0] + 1;
    return pl(lab, `$${n(cl[i][0] - 0.5)} + \\dfrac{${n(t)} - ${F}}{${fs[i]}} \\times ${c} = ${n(round(interp(cl, fs, t), dp === undefined ? 2 : dp))}$`);
  };
  /** positions of Q1, median and Q3 */
  const posLine = (N) => T(`Positions: $Q_1$: $\\dfrac{${N}}{4} = ${n(N / 4)}$, median: $\\dfrac{${N}}{2} = ${n(N / 2)}$, $Q_3$: $\\dfrac{3(${N})}{4} = ${n((3 * N) / 4)}$`, `Kedudukan: $Q_1$: $\\dfrac{${N}}{4} = ${n(N / 4)}$, median: $\\dfrac{${N}}{2} = ${n(N / 2)}$, $Q_3$: $\\dfrac{3(${N})}{4} = ${n((3 * N) / 4)}$`);
  /** estimated mean with the sum of fx written out */
  const meanLine = (cl, fs, pre) => {
    const st = gStats(cl, fs);
    return pl(pre, `$\\bar{x} = \\dfrac{${fs.map((f, i) => `${f}(${n(mid(cl[i]))})`).join(' + ')}}{${st.N}} = \\dfrac{${n(st.sx)}}{${st.N}} = ${f2(st.m)}$`);
  };
  /** the class of the largest (dir = 1) or smallest (dir = -1) frequency, rejecting ties */
  const extremeClass = (fs, dir) => {
    const v = dir > 0 ? Math.max(...fs) : Math.min(...fs);
    need(fs.filter((f) => f === v).length === 1);
    return fs.indexOf(v);
  };
  const LQ1 = '$Q_1$: ', LQ3 = '$Q_3$: ', LMED = T('Median: ', 'Median: ');
  const ogiveFig = (cl, cf) => S.graph({ w: 340, h: 230, xr: [cl[0][0] - 0.5, cl[cl.length - 1][1] + 0.5, cl[0][1] - cl[0][0] + 1], yr: [0, Math.ceil(cf[cf.length - 1] / 10) * 10, Math.max(2, Math.round(cf[cf.length - 1] / 5 / 5) * 5)], xlabel: '', series: [{ pts: [[cl[0][0] - 0.5, 0]].concat(cl.map((c, i) => [c[1] + 0.5, cf[i]])), type: 'line', dotsToo: true }] });
  const histFig = (cl, fs, lang) => S.graph({ w: 340, h: 220, xr: [cl[0][0] - 0.5, cl[cl.length - 1][1] + 0.5, cl[0][1] - cl[0][0] + 1], yr: [0, Math.ceil(Math.max(...fs) / 2) * 2 + 2, 2], xlabel: lang === 'en' ? 'Value' : 'Nilai', ylabel: lang === 'en' ? 'Frequency' : 'Kekerapan', series: [{ pts: cl.map((c, i) => [mid(c), fs[i]]), type: 'bars', width: cl[0][1] - cl[0][0] + 1 }] });
  const polyFig = (cl, fs, lang) => {
    const w = cl[0][1] - cl[0][0] + 1;
    const pts = [[mid(cl[0]) - w, 0]].concat(cl.map((c, i) => [mid(c), fs[i]])).concat([[mid(cl[cl.length - 1]) + w, 0]]);
    return S.graph({ w: 340, h: 220, xr: [cl[0][0] - 0.5 - w / 2, cl[cl.length - 1][1] + 0.5 + w / 2, w], yr: [0, Math.ceil(Math.max(...fs) / 2) * 2 + 2, 2], xlabel: lang === 'en' ? 'Value' : 'Nilai', ylabel: lang === 'en' ? 'Frequency' : 'Kekerapan', series: [{ pts, type: 'line', dotsToo: true }] });
  };
  const twoPolyFig = (cl, fsA, fsB, lang) => {
    const w = cl[0][1] - cl[0][0] + 1;
    const ext = (fs) => [[mid(cl[0]) - w, 0]].concat(cl.map((c, i) => [mid(c), fs[i]])).concat([[mid(cl[cl.length - 1]) + w, 0]]);
    return S.graph({ w: 340, h: 220, xr: [cl[0][0] - 0.5 - w / 2, cl[cl.length - 1][1] + 0.5 + w / 2, w], yr: [0, Math.ceil(Math.max(...fsA, ...fsB) / 2) * 2 + 2, 2], xlabel: lang === 'en' ? 'Value' : 'Nilai', ylabel: lang === 'en' ? 'Frequency' : 'Kekerapan', series: [{ pts: ext(fsA), type: 'line', dotsToo: true }, { pts: ext(fsB), type: 'line', dash: true, dotsToo: true }] });
  };
  /** simple horizontal box plot from a five-number summary [min, Q1, median, Q3, max] */
  const boxFig = (five, lo, hi, lang) => {
    const W = 340, H = 110, padL = 26, padR = 16, y = 46;
    const sx = (v) => padL + ((v - lo) / (hi - lo)) * (W - padL - padR);
    let out = S.line(padL, y + 26, W - padR, y + 26, { w: 0.8, op: 0.4 });
    out += S.line(sx(five[0]), y, sx(five[1]), y) + S.line(sx(five[3]), y, sx(five[4]), y);
    out += S.line(sx(five[0]), y - 9, sx(five[0]), y + 9) + S.line(sx(five[4]), y - 9, sx(five[4]), y + 9);
    out += S.rect(sx(five[1]), y - 15, sx(five[3]) - sx(five[1]), 30);
    out += S.line(sx(five[2]), y - 15, sx(five[2]), y + 15, { w: 2 });
    const labs = lang === 'en' ? ['min', 'Q1', 'med', 'Q3', 'max'] : ['min', 'K1', 'median', 'K3', 'maks'];
    five.forEach((v, i) => (out += S.text(sx(v), y + 34, `${labs[i]} ${f2(v)}`, { s: 9, rot: i === 0 ? 0 : i === 4 ? 0 : 0 })));
    return S.wrap(W, H + 6, out, 'box plot');
  };
  const STAT_CTX = [
    T('the Mathematics test marks (out of 100) of a class', 'markah ujian Matematik (daripada 100) sebuah kelas'),
    T('the masses (kg) of parcels handled by a courier in a week', 'jisim (kg) bungkusan yang dikendalikan oleh seorang kurier dalam seminggu'),
    T('the daily screen time (minutes) of a group of students', 'masa skrin harian (minit) sekumpulan murid'),
    T('the heights (cm) of seedlings in a nursery', 'ketinggian (cm) anak benih di sebuah tapak semaian'),
    T('the delivery times (minutes) of an online food service', 'masa penghantaran (minit) sebuah perkhidmatan makanan dalam talian'),
    T('the electricity bills (RM) of households in a taman', 'bil elektrik (RM) isi rumah di sebuah taman'),
  ];
  const CLASS_CTX = [T('$A$', '$A$'), T('$B$', '$B$'), T('$X$', '$X$'), T('$Y$', '$Y$')];
  const DISP_TERMS = [
    { term: T('class boundary', 'sempadan kelas'), def: T('the value exactly halfway between the upper limit of one class and the lower limit of the next, used so histogram bars have no gaps', 'nilai yang tepat di antara had atas sesuatu kelas dengan had bawah kelas berikutnya, supaya palang histogram tiada jurang'), ex: T('e.g. between the classes 10–19 and 20–29 the boundary is 19.5', 'cth. antara kelas 10–19 dan 20–29, sempadannya ialah 19.5') },
    { term: T('class size (class width)', 'saiz kelas (lebar kelas)'), def: T('the difference between the upper and lower boundaries of a class', 'perbezaan antara sempadan atas dengan sempadan bawah sesuatu kelas'), ex: T('e.g. for 10–19: 19.5 − 9.5 = 10', 'cth. bagi 10–19: 19.5 − 9.5 = 10') },
    { term: T('midpoint (class mark)', 'titik tengah (tanda kelas)'), def: T('the average of the lower and upper limits of a class, used to represent every value in that class when computing grouped statistics', 'purata had bawah dan had atas sesuatu kelas, digunakan untuk mewakili semua nilai dalam kelas itu semasa mengira statistik terkumpul'), ex: T('e.g. for 10–19: (10 + 19) ÷ 2 = 14.5', 'cth. bagi 10–19: (10 + 19) ÷ 2 = 14.5') },
    { term: T('variance', 'varians'), def: T('the mean of the squared deviations from the mean; it equals the standard deviation squared', 'min sisihan kuasa dua daripada min; ia bersamaan dengan kuasa dua sisihan piawai'), ex: T('e.g. a standard deviation of 3 gives a variance of 9', 'cth. sisihan piawai 3 memberi varians 9') },
    { term: T('standard deviation', 'sisihan piawai'), def: T('a measure of dispersion equal to the square root of the variance; a smaller value means the data is more consistent', 'sukatan serakan yang bersamaan dengan punca kuasa dua varians; nilai yang lebih kecil bermaksud data lebih konsisten'), ex: T('e.g. a variance of 16 gives a standard deviation of 4', 'cth. varians 16 memberi sisihan piawai 4') },
    { term: T('modal class', 'kelas modal'), def: T('the class interval with the highest frequency', 'selang kelas yang mempunyai kekerapan tertinggi'), ex: T('e.g. frequencies 3, 8, 5: the class with frequency 8 is the modal class', 'cth. kekerapan 3, 8, 5: kelas dengan kekerapan 8 ialah kelas modal') },
    { term: T('estimated mean', 'min anggaran'), def: T('an approximate mean of grouped data, calculated from class midpoints since the exact original values are not known', 'min anggaran data terkumpul, dikira daripada titik tengah kelas kerana nilai asal yang tepat tidak diketahui'), ex: T('$\\bar{x} = \\dfrac{\\sum fx}{\\sum f}$, with $x$ = class midpoints', '$\\bar{x} = \\dfrac{\\sum fx}{\\sum f}$, dengan $x$ = titik tengah kelas') },
  ];

  /* =================================================================================== 7.1 Dispersion of grouped data */
  const g71e2 = [
    (r) => {
      const w = r.pick([5, 10]), cl = cls(r.pick([0, 10, 20]), w, 5);
      const i = r.int(0, 4);
      const ask = r.pick(['bnd', 'size', 'mid', 'all']);
      const [lo, hi] = bnd(cl[i]);
      if (ask === 'bnd') return { q: T(`For the class interval ${cl[i][0]}–${cl[i][1]}, state the lower boundary and the upper boundary.`, `Bagi selang kelas ${cl[i][0]}–${cl[i][1]}, nyatakan sempadan bawah dan sempadan atas.`), a: T(`${n(lo)} and ${n(hi)}`, `${n(lo)} dan ${n(hi)}`), w: W(`$${cl[i][0]} - 0.5 = ${n(lo)}$`, `$${cl[i][1]} + 0.5 = ${n(hi)}$`), sp: 's' };
      if (ask === 'size') return { q: T(`Find the class size of the class interval ${cl[i][0]}–${cl[i][1]}.`, `Cari saiz kelas bagi selang kelas ${cl[i][0]}–${cl[i][1]}.`), a: T(n(w)), w: W(T(`Boundaries: ${n(lo)} and ${n(hi)}`, `Sempadan: ${n(lo)} dan ${n(hi)}`), `$${n(hi)} - ${n(lo)} = ${w}$`), sp: 'xs' };
      if (ask === 'mid') return { q: T(`Find the midpoint of the class interval ${cl[i][0]}–${cl[i][1]}.`, `Cari titik tengah bagi selang kelas ${cl[i][0]}–${cl[i][1]}.`), a: T(n(mid(cl[i]))), w: W(`$\\dfrac{${cl[i][0]} + ${cl[i][1]}}{2} = ${n(mid(cl[i]))}$`), sp: 'xs' };
      return { q: T(`For the class interval ${cl[i][0]}–${cl[i][1]}, state the lower and upper boundaries, the class size and the midpoint.`, `Bagi selang kelas ${cl[i][0]}–${cl[i][1]}, nyatakan sempadan bawah dan atas, saiz kelas dan titik tengah.`), a: T(`Boundaries ${n(lo)} and ${n(hi)}; class size ${w}; midpoint ${n(mid(cl[i]))}`, `Sempadan ${n(lo)} dan ${n(hi)}; saiz kelas ${w}; titik tengah ${n(mid(cl[i]))}`), w: W(`$${cl[i][0]} - 0.5 = ${n(lo)}$, $${cl[i][1]} + 0.5 = ${n(hi)}$`, `$${n(hi)} - ${n(lo)} = ${w}$`, `$\\dfrac{${cl[i][0]} + ${cl[i][1]}}{2} = ${n(mid(cl[i]))}$`), sp: 's' };
    },
    (r) => {
      const N = r.int(20, 40), sx = r.int(600, 900), sxx = Math.round(N * ((sx / N) ** 2 + r.int(20, 80)));
      const m = sx / N, v = sxx / N - m * m;
      const w = r.pick([
        [`For a grouped data set, $\\sum f = ${N}$, $\\sum fx = ${sx}$ and $\\sum fx^2 = ${sxx}$. Find the mean and the standard deviation (2 decimal places).`, `Bagi satu set data terkumpul, $\\sum f = ${N}$, $\\sum fx = ${sx}$ dan $\\sum fx^2 = ${sxx}$. Cari min dan sisihan piawai (2 tempat perpuluhan).`],
        [`A grouped data set has $\\sum f = ${N}$, $\\sum fx = ${sx}$ and $\\sum fx^2 = ${sxx}$. Calculate its mean and standard deviation, correct to 2 decimal places.`, `Satu set data terkumpul mempunyai $\\sum f = ${N}$, $\\sum fx = ${sx}$ dan $\\sum fx^2 = ${sxx}$. Hitung min dan sisihan piawainya, betul kepada 2 tempat perpuluhan.`],
      ]);
      return { q: T(w[0], w[1]), a: T(`Mean $${f2(m)}$; s.d. $\\sqrt{\\dfrac{${sxx}}{${N}} - ${f2(m)}^2} = ${f2(Math.sqrt(v))}$`, `Min $${f2(m)}$; s.p. $\\sqrt{\\dfrac{${sxx}}{${N}} - ${f2(m)}^2} = ${f2(Math.sqrt(v))}$`), w: W(`$\\bar{x} = \\dfrac{${sx}}{${N}} = ${f2(m)}$`, `$\\sigma^2 = \\dfrac{${sxx}}{${N}} - \\left(\\dfrac{${sx}}{${N}}\\right)^2 = ${n(round(v, 4))}$`, `$\\sigma = \\sqrt{${n(round(v, 4))}} = ${f2(Math.sqrt(v))}$`), sp: 's' };
    },
    (r) => {
      const opts = r.shuffle([T('the midpoint of each class', 'titik tengah setiap kelas'), T('the lower limit of each class', 'had bawah setiap kelas'), T('the upper boundary of each class', 'sempadan atas setiap kelas')]);
      return { q: T(`When calculating the estimated mean of grouped data using $\\bar{x} = \\dfrac{\\sum fx}{\\sum f}$, which value of $x$ should be used for each class?`, `Apabila mengira min anggaran data terkumpul menggunakan $\\bar{x} = \\dfrac{\\sum fx}{\\sum f}$, nilai $x$ manakah yang perlu digunakan bagi setiap kelas?`), a: T('the midpoint of each class', 'titik tengah setiap kelas'), w: T('The actual values in a class are unknown, so the midpoint represents every value in that class.', 'Nilai sebenar dalam sesuatu kelas tidak diketahui, jadi titik tengah mewakili setiap nilai dalam kelas itu.'), sp: 'xs' };
    },
    (r) => {
      const claim = r.chance();
      const stmt = claim ? T('$\\sigma^2 = \\bar{x}^2 - \\dfrac{\\sum fx^2}{\\sum f}$', '$\\sigma^2 = \\bar{x}^2 - \\dfrac{\\sum fx^2}{\\sum f}$') : T('$\\sigma^2 = \\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2$', '$\\sigma^2 = \\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2$');
      return { q: T(`True or false? The variance of grouped data is given by ${stmt.en}.`, `Betul atau salah? Varians data terkumpul diberi oleh ${stmt.ms}.`), a: claim ? T('False: the terms are the other way round; $\\sigma^2 = \\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2$.', 'Salah: sebutan itu tertukar; $\\sigma^2 = \\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2$.') : T('True.', 'Betul.'), w: W(T('Variance = mean of the squares − square of the mean:', 'Varians = min bagi kuasa dua − kuasa dua min:'), '$\\sigma^2 = \\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2$', claim ? T('The given formula has the terms reversed, so it would give a negative value.', 'Rumus yang diberi mempunyai sebutan yang tertukar, jadi ia akan memberi nilai negatif.') : T('The given formula matches.', 'Rumus yang diberi sepadan.')), sp: 's' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 4), fs = cl.map(() => r.int(2, 10));
      const st = gStats(cl, fs);
      const modal = fs.indexOf(Math.max(...fs));
      need(fs.filter((f) => f === fs[modal]).length === 1);
      return { q: T(`The table shows a grouped frequency distribution.<br>${gt(cl, fs, ['Class', 'Frequency'])}<br>State the modal class.`, `Jadual menunjukkan taburan kekerapan terkumpul.<br>${gt(cl, fs, ['Kelas', 'Kekerapan'])}<br>Nyatakan kelas modal.`), a: T(`${cl[modal][0]}–${cl[modal][1]}`), w: T(`The highest frequency is ${fs[modal]}, in the class ${cl[modal][0]}–${cl[modal][1]}.`, `Kekerapan tertinggi ialah ${fs[modal]}, dalam kelas ${cl[modal][0]}–${cl[modal][1]}.`), sp: 's' };
    },
    (r) => {
      const t = r.pick(DISP_TERMS);
      const w = r.pick([
        [`In the study of grouped data, what is meant by "${t.term.en}"?`, `Dalam kajian data terkumpul, apakah yang dimaksudkan dengan "${t.term.ms}"?`],
        [`Define "${t.term.en}" for grouped data.`, `Takrifkan "${t.term.ms}" bagi data terkumpul.`],
      ]);
      return { q: T(w[0], w[1]), a: t.def, w: W(t.ex), sp: 's' };
    },
    (r) => {
      const opts = r.sample(DISP_TERMS, 4);
      const ci = r.int(0, 3);
      const correct = opts[ci];
      const L = 'ABCD';
      return { q: T(`Which term matches this description? "${correct.def.en}"<br>${opts.map((o, i) => `(${L[i]}) ${o.term.en}`).join('  ')}`, `Istilah manakah yang sepadan dengan huraian ini? "${correct.def.ms}"<br>${opts.map((o, i) => `(${L[i]}) ${o.term.ms}`).join('  ')}`), a: T(`${L[ci]}: ${correct.term.en}`, `${L[ci]}: ${correct.term.ms}`), w: termW(correct), sp: 's' };
    },
    (r) => {
      const stmts = [
        { en: 'Standard deviation can never be negative.', ms: 'Sisihan piawai tidak boleh menjadi negatif.', ok: true, why: T('It is a square root (of the variance), so it is never negative.', 'Ia ialah punca kuasa dua (varians), jadi ia tidak pernah negatif.') },
        { en: 'A larger standard deviation means the data is more spread out.', ms: 'Sisihan piawai yang lebih besar bermaksud data lebih terserak.', ok: true, why: T('The standard deviation measures the spread about the mean.', 'Sisihan piawai mengukur serakan di sekitar min.') },
        { en: 'To find the estimated mean of grouped data, use the class limits instead of the midpoints.', ms: 'Untuk mencari min anggaran data terkumpul, gunakan had kelas dan bukannya titik tengah.', ok: false, why: T('The midpoint of each class is used, because it represents all the values in the class.', 'Titik tengah setiap kelas digunakan, kerana ia mewakili semua nilai dalam kelas itu.') },
        { en: 'Variance is the square root of the standard deviation.', ms: 'Varians ialah punca kuasa dua sisihan piawai.', ok: false, why: T('It is the other way round: standard deviation $= \\sqrt{\\text{variance}}$.', 'Sebaliknya: sisihan piawai $= \\sqrt{\\text{varians}}$.') },
        { en: 'The modal class is the class with the highest frequency, not the class containing the mean.', ms: 'Kelas modal ialah kelas yang mempunyai kekerapan tertinggi, bukan kelas yang mengandungi min.', ok: true, why: T('The modal class is defined only by the highest frequency.', 'Kelas modal ditakrifkan hanya oleh kekerapan tertinggi.') },
      ];
      const s = r.pick(stmts);
      return { q: T(`True or false? "${s.en}"`, `Betul atau salah? "${s.ms}"`), a: T(s.ok ? 'True' : 'False', s.ok ? 'Betul' : 'Salah'), w: s.why, sp: 'xs' };
    },
  ];
  const g71m2 = [
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 4), fs = cl.map(() => r.int(2, 10));
      const st = gStats(cl, fs);
      const ctx = r.pick(STAT_CTX);
      return { q: T(`The table shows the ${ctx.en} of ${st.N} items.<br>${gt(cl, fs, ['Class', 'Frequency'])}<br>Complete a table with midpoint $x$, $fx$ and $fx^2$, and find the mean and standard deviation, correct to 2 decimal places.`, `Jadual menunjukkan ${ctx.ms} bagi ${st.N} item.<br>${gt(cl, fs, ['Kelas', 'Kekerapan'])}<br>Lengkapkan jadual dengan titik tengah $x$, $fx$ dan $fx^2$, dan cari min dan sisihan piawai, betul kepada 2 tempat perpuluhan.`), a: T(`Midpoints ${cl.map(mid).join(', ')}; $\\sum fx = ${st.sx}$, $\\sum fx^2 = ${n(st.sxx)}$; mean ${f2(st.m)}; s.d. ${f2(st.sd)}`, `Titik tengah ${cl.map(mid).join(', ')}; $\\sum fx = ${st.sx}$, $\\sum fx^2 = ${n(st.sxx)}$; min ${f2(st.m)}; s.p. ${f2(st.sd)}`), w: W(...statLines(cl, fs)), sp: 'xl' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 4), fs = cl.map(() => r.int(2, 12));
      const st = gStats(cl, fs);
      const ctx = r.pick(STAT_CTX);
      return { q: T(`The table shows ${ctx.en}.<br>${gt(cl, fs, ['Class', 'Frequency'])}<br>Find the estimated mean and the standard deviation. Use both to briefly describe the data (typical value and spread).`, `Jadual menunjukkan ${ctx.ms}.<br>${gt(cl, fs, ['Kelas', 'Kekerapan'])}<br>Cari min anggaran dan sisihan piawai. Gunakan kedua-duanya untuk menghuraikan data secara ringkas (nilai lazim dan serakan).`), a: T(`Mean ${f2(st.m)}, s.d. ${f2(st.sd)}: a typical value is about ${Math.round(st.m)}, with values typically spread about ${Math.round(st.sd)} from this.`, `Min ${f2(st.m)}, s.p. ${f2(st.sd)}: nilai lazim ialah kira-kira ${Math.round(st.m)}, dengan nilai biasanya terserak kira-kira ${Math.round(st.sd)} daripadanya.`), w: W(...statLines(cl, fs).slice(1)), sp: 'm' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 4);
      const N = r.pick([30, 40]);
      const known = cl.map(() => r.int(2, 8));
      const others = known.filter((_, i) => i !== 2); // known[2] is drawn but hidden behind p
      const p = N - sum(others);
      need(p >= 2 && p <= 14);
      const shown = known.map((v, i) => (i === 2 ? '$p$' : v));
      return { q: T(`The table shows a grouped distribution with total frequency ${N}.<br>${gt(cl, shown, ['Class', 'Frequency'])}<br>Find the value of $p$.`, `Jadual menunjukkan taburan terkumpul dengan jumlah kekerapan ${N}.<br>${gt(cl, shown, ['Kelas', 'Kekerapan'])}<br>Cari nilai $p$.`), a: T(`$p = ${p}$`), w: SPM.lines(T('The frequencies add up to the total frequency:', 'Jumlah semua kekerapan ialah jumlah kekerapan:'), `$${others.join(' + ')} + p = ${N}$`, `$${sum(others)} + p = ${N}$`, `$p = ${N} - ${sum(others)} = ${p}$`), sp: 'm' };
    },
    (r) => {
      const raw = range(0, 19).map(() => r.int(10, 49));
      const cl = cls(10, 10, 4);
      const fs = cl.map((c) => raw.filter((v) => v >= c[0] && v <= c[1]).length);
      need(fs.every((f) => f >= 1));
      return { q: T(`Twenty students' scores are: ${raw.join(', ')}. Organise the data into the grouped frequency table below (classes 10–19, 20–29, 30–39, 40–49).<br>${gt(cl, cl.map(() => '?'), ['Class', 'Frequency'])}`, `Markah dua puluh orang murid ialah: ${raw.join(', ')}. Susun data ke dalam jadual kekerapan terkumpul di bawah (kelas 10–19, 20–29, 30–39, 40–49).<br>${gt(cl, cl.map(() => '?'), ['Kelas', 'Kekerapan'])}`), a: T(cl.map((c, i) => `${c[0]}–${c[1]}: ${fs[i]}`).join(', ')), w: W(...cl.map((c, i) => `${c[0]}–${c[1]}: ${raw.filter((v) => v >= c[0] && v <= c[1]).join(', ')} → ${fs[i]}`), T(`Check: $${fs.join(' + ')} = 20$`, `Semak: $${fs.join(' + ')} = 20$`)), sp: 'l' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 4), fs = cl.map(() => r.int(3, 10));
      const st = gStats(cl, fs);
      const i = r.int(0, 3);
      const delta = r.pick([-2, 2, 3]);
      const fs2 = fs.slice();
      fs2[i] = Math.max(1, fs2[i] + delta);
      const st2 = gStats(cl, fs2);
      return { q: T(`A grouped distribution has frequencies ${fs.join(', ')} for the classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. If the frequency of the class ${cl[i][0]}–${cl[i][1]} changes to ${fs2[i]} (all other frequencies unchanged), does the standard deviation increase or decrease? Justify by computing both.`, `Satu taburan terkumpul mempunyai kekerapan ${fs.join(', ')} bagi kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Jika kekerapan kelas ${cl[i][0]}–${cl[i][1]} berubah kepada ${fs2[i]} (kekerapan lain kekal), adakah sisihan piawai meningkat atau menurun? Wajarkan dengan mengira kedua-duanya.`), a: T(`Original s.d. ${f2(st.sd)}; new s.d. ${f2(st2.sd)}. It ${st2.sd > st.sd ? 'increases' : st2.sd < st.sd ? 'decreases' : 'stays about the same'}.`, `S.p. asal ${f2(st.sd)}; s.p. baharu ${f2(st2.sd)}. Ia ${st2.sd > st.sd ? 'meningkat' : st2.sd < st.sd ? 'menurun' : 'kekal kira-kira sama'}.`), w: W(...statShort(cl, fs, T('Before: ', 'Sebelum: ')), ...statShort(cl, fs2, T('After: ', 'Selepas: ')), T(`$${f2(st2.sd)}$ ${st2.sd > st.sd ? '>' : st2.sd < st.sd ? '<' : '='} $${f2(st.sd)}$`, `$${f2(st2.sd)}$ ${st2.sd > st.sd ? '>' : st2.sd < st.sd ? '<' : '='} $${f2(st.sd)}$`)), sp: 'm' };
    },
    (r) => {
      const t1 = r.pick(DISP_TERMS), t2 = r.pick(DISP_TERMS.filter((t) => t.term.en !== t1.term.en));
      return { q: T(`Explain the difference between "${t1.term.en}" and "${t2.term.en}" for grouped data.`, `Terangkan perbezaan antara "${t1.term.ms}" dengan "${t2.term.ms}" bagi data terkumpul.`), a: T(`${t1.term.en}: ${t1.def.en}. ${t2.term.en}: ${t2.def.en}.`, `${t1.term.ms}: ${t1.def.ms}. ${t2.term.ms}: ${t2.def.ms}.`), w: W(T(`${t1.term.en}: ${t1.ex.en}`, `${t1.term.ms}: ${t1.ex.ms}`), T(`${t2.term.en}: ${t2.ex.en}`, `${t2.term.ms}: ${t2.ex.ms}`)), sp: 'm' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 4), fs = cl.map(() => r.int(2, 10));
      const st = gStats(cl, fs);
      const ctx = r.pick(STAT_CTX);
      const mo = fs.indexOf(Math.max(...fs));
      need(fs.filter((f) => f === fs[mo]).length === 1);
      return { q: T(`The table shows ${ctx.en}.<br>${gt(cl, fs, ['Class', 'Frequency'])}<br>A classmate says "the modal class always has the highest midpoint." Find the modal class here and use it to explain whether the claim is correct.`, `Jadual menunjukkan ${ctx.ms}.<br>${gt(cl, fs, ['Kelas', 'Kekerapan'])}<br>Seorang rakan sekelas berkata "kelas modal sentiasa mempunyai titik tengah tertinggi." Cari kelas modal di sini dan gunakannya untuk menerangkan sama ada dakwaan itu betul.`), a: T(`Modal class: ${cl[fs.indexOf(Math.max(...fs))][0]}–${cl[fs.indexOf(Math.max(...fs))][1]} (highest frequency). The claim is false in general: the modal class is defined by having the highest frequency, not by having the highest midpoint (value).`, `Kelas modal: ${cl[fs.indexOf(Math.max(...fs))][0]}–${cl[fs.indexOf(Math.max(...fs))][1]} (kekerapan tertinggi). Dakwaan itu secara umumnya salah: kelas modal ditakrifkan oleh kekerapan tertinggi, bukan oleh titik tengah (nilai) tertinggi.`), w: W(T(`Highest frequency ${fs[mo]} → modal class ${cl[mo][0]}–${cl[mo][1]} (midpoint ${n(mid(cl[mo]))}).`, `Kekerapan tertinggi ${fs[mo]} → kelas modal ${cl[mo][0]}–${cl[mo][1]} (titik tengah ${n(mid(cl[mo]))}).`), mo === cl.length - 1 ? T('Here it is also the class with the highest midpoint, but only by chance: the definition uses frequency.', 'Di sini ia juga kelas dengan titik tengah tertinggi, tetapi secara kebetulan sahaja: takrifnya menggunakan kekerapan.') : T(`The highest midpoint is ${n(mid(cl[cl.length - 1]))}, which is not in the modal class, so the claim fails.`, `Titik tengah tertinggi ialah ${n(mid(cl[cl.length - 1]))}, yang bukan dalam kelas modal, jadi dakwaan itu gagal.`)), sp: 'm' };
    },
  ];
  const g71a2 = [
    (r) => {
      const cl = cls(10, 10, 4);
      const fA = cl.map(() => r.int(2, 12)), fB = cl.map(() => r.int(2, 12));
      const A = gStats(cl, fA), B = gStats(cl, fB);
      const ctx = r.pick(STAT_CTX);
      return { q: T(`Two groups were measured for ${ctx.en}. Group $A$ frequencies: ${fA.join(', ')}. Group $B$ frequencies: ${fB.join(', ')}, for the classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Find the mean and standard deviation of each group and say which is more consistent.`, `Dua kumpulan diukur bagi ${ctx.ms}. Kekerapan Kumpulan $A$: ${fA.join(', ')}. Kekerapan Kumpulan $B$: ${fB.join(', ')}, bagi kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Cari min dan sisihan piawai setiap kumpulan dan nyatakan yang mana lebih konsisten.`), a: T(`A: mean ${f2(A.m)}, s.d. ${f2(A.sd)}; B: mean ${f2(B.m)}, s.d. ${f2(B.sd)}. ${A.sd <= B.sd ? 'A' : 'B'} is more consistent (smaller standard deviation).`, `A: min ${f2(A.m)}, s.p. ${f2(A.sd)}; B: min ${f2(B.m)}, s.p. ${f2(B.sd)}. ${A.sd <= B.sd ? 'A' : 'B'} lebih konsisten (sisihan piawai lebih kecil).`), w: W(...statShort(cl, fA, '$A$: '), ...statShort(cl, fB, '$B$: '), T(`Smaller standard deviation → more consistent: ${A.sd <= B.sd ? 'A' : 'B'}.`, `Sisihan piawai lebih kecil → lebih konsisten: ${A.sd <= B.sd ? 'A' : 'B'}.`)), sp: 'xl' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 4);
      const fs = cl.map(() => r.int(3, 10));
      const N = sum(fs);
      const i = r.int(0, 3);
      const known = fs.slice();
      known[i] = '$p$';
      const st = gStats(cl, fs);
      const targetMean = f2(st.m);
      /* the mean is given to 2 d.p.: make sure solving with that rounded value still gives p exactly */
      const Nk = N - fs[i], Sk = st.sx - fs[i] * mid(cl[i]);
      const pSolve = (Number(targetMean) * Nk - Sk) / (mid(cl[i]) - Number(targetMean));
      need(Math.abs(pSolve - fs[i]) < 0.05);
      return { q: T(`A grouped distribution has classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')} with frequencies ${known.join(', ')} and mean $\\bar{x} = ${targetMean}$. Find $p$.`, `Satu taburan terkumpul mempunyai kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')} dengan kekerapan ${known.join(', ')} dan min $\\bar{x} = ${targetMean}$. Cari $p$.`), a: T(`$p = ${fs[i]}$`), w: T(`$\\dfrac{\\sum fx}{\\sum f} = ${targetMean}$, solve for $p$ (midpoint of class ${cl[i][0]}–${cl[i][1]} is ${mid(cl[i])})`, `$\\dfrac{\\sum fx}{\\sum f} = ${targetMean}$, selesaikan bagi $p$ (titik tengah kelas ${cl[i][0]}–${cl[i][1]} ialah ${mid(cl[i])})`), sp: 'l' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 5), fs = cl.map(() => r.int(2, 10));
      const st = gStats(cl, fs);
      const hideSx = r.chance(), hideSxx = r.chance();
      return { q: T(`The table shows a grouped distribution.<br>${gt(cl, fs, ['Class', 'Frequency'])}<br>Given $\\sum fx = ${hideSx ? '?' : st.sx}$ and $\\sum fx^2 = ${hideSxx ? '?' : n(st.sxx)}$, complete any missing total(s) and find the standard deviation, correct to 2 decimal places.`, `Jadual menunjukkan taburan terkumpul.<br>${gt(cl, fs, ['Kelas', 'Kekerapan'])}<br>Diberi $\\sum fx = ${hideSx ? '?' : st.sx}$ dan $\\sum fx^2 = ${hideSxx ? '?' : n(st.sxx)}$, lengkapkan sebarang jumlah yang hilang dan cari sisihan piawai, betul kepada 2 tempat perpuluhan.`), a: T(`$\\sum fx = ${st.sx}$, $\\sum fx^2 = ${n(st.sxx)}$; mean ${f2(st.m)}; s.d. $= ${f2(st.sd)}$`, `$\\sum fx = ${st.sx}$, $\\sum fx^2 = ${n(st.sxx)}$; min ${f2(st.m)}; s.p. $= ${f2(st.sd)}$`), w: W(...statLines(cl, fs)), sp: 'l' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 4), fs = cl.map(() => r.int(3, 12));
      const st = gStats(cl, fs);
      const i = r.pick([0, 3]);
      const fs2 = fs.slice();
      fs2[i] = fs2[i] + r.pick([3, 4, 5]);
      const st2 = gStats(cl, fs2);
      return { q: T(`A distribution has frequencies ${fs.join(', ')} for classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Investigate: if ${fs2[i] - fs[i]} more items are added to the ${i === 0 ? 'lowest' : 'highest'} class (an extreme class), how do the mean and standard deviation change? Compute both before and after, and explain the pattern.`, `Satu taburan mempunyai kekerapan ${fs.join(', ')} bagi kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Siasat: jika ${fs2[i] - fs[i]} item lagi ditambah kepada kelas ${i === 0 ? 'terendah' : 'tertinggi'} (kelas ekstrem), bagaimanakah min dan sisihan piawai berubah? Hitung kedua-duanya sebelum dan selepas, dan terangkan corak yang berlaku.`), a: T(`Before: mean ${f2(st.m)}, s.d. ${f2(st.sd)}. After: mean ${f2(st2.m)}, s.d. ${f2(st2.sd)}. Adding items to an extreme class pulls the mean towards that class and ${st2.sd > st.sd ? 'increases' : 'decreases'} the spread, since more items sit further from the centre.`, `Sebelum: min ${f2(st.m)}, s.p. ${f2(st.sd)}. Selepas: min ${f2(st2.m)}, s.p. ${f2(st2.sd)}. Menambah item pada kelas ekstrem menarik min ke arah kelas itu dan ${st2.sd > st.sd ? 'meningkatkan' : 'menurunkan'} serakan, kerana lebih banyak item berada jauh daripada pusat.`), w: W(...statShort(cl, fs, T('Before: ', 'Sebelum: ')), ...statShort(cl, fs2, T('After: ', 'Selepas: ')), T(`Mean moves from ${f2(st.m)} to ${f2(st2.m)} (towards the ${i === 0 ? 'lowest' : 'highest'} class); s.d. ${st2.sd > st.sd ? 'rises' : 'falls'} from ${f2(st.sd)} to ${f2(st2.sd)}.`, `Min berubah daripada ${f2(st.m)} kepada ${f2(st2.m)} (ke arah kelas ${i === 0 ? 'terendah' : 'tertinggi'}); s.p. ${st2.sd > st.sd ? 'naik' : 'turun'} daripada ${f2(st.sd)} kepada ${f2(st2.sd)}.`)), sp: 'l' };
    },
    (r) => {
      const ERR = [
        { en: 'used the class limits instead of the midpoints when computing $\\sum fx$', ms: 'menggunakan had kelas dan bukannya titik tengah semasa mengira $\\sum fx$', fix: T('use the midpoint of each class, not its limits, when computing $\\sum fx$ and $\\sum fx^2$', 'gunakan titik tengah setiap kelas, bukan hadnya, semasa mengira $\\sum fx$ dan $\\sum fx^2$') },
        { en: 'forgot to take the square root, and gave the variance as the final standard deviation', ms: 'terlupa mengambil punca kuasa dua, dan memberikan varians sebagai sisihan piawai akhir', fix: T('take the square root of the variance to obtain the standard deviation', 'ambil punca kuasa dua varians untuk mendapatkan sisihan piawai') },
        { en: 'computed $\\bar{x}^2 - \\dfrac{\\sum fx^2}{\\sum f}$ instead of $\\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2$', ms: 'mengira $\\bar{x}^2 - \\dfrac{\\sum fx^2}{\\sum f}$ dan bukannya $\\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2$', fix: T('compute $\\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2$ in that order (it must not be negative)', 'hitung $\\dfrac{\\sum fx^2}{\\sum f} - \\bar{x}^2$ mengikut susunan itu (ia tidak boleh negatif)') },
      ];
      const cl = cls(r.pick([0, 10]), 10, 4), fs = cl.map(() => r.int(2, 10));
      const st = gStats(cl, fs);
      const e = r.pick(ERR);
      const ctx = r.pick(STAT_CTX);
      return { q: T(`A student found the standard deviation of ${ctx.en}, shown grouped below, but ${e.en}.<br>${gt(cl, fs, ['Class', 'Frequency'])}<br>Explain the student's error and find the correct standard deviation, correct to 2 decimal places.`, `Seorang murid mencari sisihan piawai bagi ${ctx.ms}, ditunjukkan secara terkumpul di bawah, tetapi ${e.ms}.<br>${gt(cl, fs, ['Kelas', 'Kekerapan'])}<br>Terangkan kesilapan murid itu dan cari sisihan piawai yang betul, betul kepada 2 tempat perpuluhan.`), a: T(`Error: should ${e.fix.en}. Correct standard deviation $= ${f2(st.sd)}$.`, `Kesilapan: sepatutnya ${e.fix.ms}. Sisihan piawai yang betul $= ${f2(st.sd)}$.`), w: W(T(`Correct method: ${e.fix.en}.`, `Kaedah betul: ${e.fix.ms}.`), ...statLines(cl, fs)), sp: 'l' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 4);
      const fA = cl.map(() => r.int(3, 12)), fB = cl.map(() => r.int(3, 12)), fC = cl.map(() => r.int(3, 12));
      const A = gStats(cl, fA), B = gStats(cl, fB), C = gStats(cl, fC);
      const best = [A, B, C].reduce((p, c, i) => (c.sd < p.sd ? c : p), A);
      const bestName = A.sd === best.sd ? 'A' : B.sd === best.sd ? 'B' : 'C';
      const ctx = r.pick(STAT_CTX);
      return { q: T(`Three machines $A$, $B$, $C$ were tested for ${ctx.en} (same classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}). Frequencies — $A$: ${fA.join(', ')}; $B$: ${fB.join(', ')}; $C$: ${fC.join(', ')}. Find the mean and standard deviation for each, and state which machine is the most consistent.`, `Tiga mesin $A$, $B$, $C$ diuji bagi ${ctx.ms} (kelas yang sama ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}). Kekerapan — $A$: ${fA.join(', ')}; $B$: ${fB.join(', ')}; $C$: ${fC.join(', ')}. Cari min dan sisihan piawai bagi setiap satu, dan nyatakan mesin yang paling konsisten.`), a: T(`$A$: mean ${f2(A.m)}, s.d. ${f2(A.sd)}; $B$: mean ${f2(B.m)}, s.d. ${f2(B.sd)}; $C$: mean ${f2(C.m)}, s.d. ${f2(C.sd)}. Machine $${bestName}$ is the most consistent (smallest standard deviation).`, `$A$: min ${f2(A.m)}, s.p. ${f2(A.sd)}; $B$: min ${f2(B.m)}, s.p. ${f2(B.sd)}; $C$: min ${f2(C.m)}, s.p. ${f2(C.sd)}. Mesin $${bestName}$ paling konsisten (sisihan piawai terkecil).`), w: W(...statShort(cl, fA, '$A$: '), ...statShort(cl, fB, '$B$: '), ...statShort(cl, fC, '$C$: '), T(`Smallest standard deviation: $${bestName}$.`, `Sisihan piawai terkecil: $${bestName}$.`)), sp: 'xl' };
    },
  ];
  SPM.extend('F5-7.1', { e: g71e2, m: g71m2, a: g71a2 });

  /* =================================================================================== 7.2 Ogives and box plots */
  const OGIVE_TERMS = [
    { term: T('ogive (cumulative frequency curve)', 'ogif (lengkung kekerapan longgokan)'), def: T('a curve plotted at the upper boundary of each class against its cumulative frequency, starting from 0 at the lower boundary of the first class', 'lengkung yang diplot pada sempadan atas setiap kelas melawan kekerapan longgokannya, bermula daripada 0 pada sempadan bawah kelas pertama'), ex: T('e.g. classes 10–19, 20–29 with frequencies 4, 6: plot (9.5, 0), (19.5, 4), (29.5, 10)', 'cth. kelas 10–19, 20–29 dengan kekerapan 4, 6: plot (9.5, 0), (19.5, 4), (29.5, 10)') },
    { term: T('interquartile range (IQR)', 'julat antara kuartil (JAK)'), def: T('the difference $Q_3 - Q_1$, describing the spread of the middle half of the data', 'perbezaan $Q_3 - Q_1$, menghuraikan serakan separuh tengah data'), ex: T('e.g. $Q_1 = 22$, $Q_3 = 38$: IQR $= 38 - 22 = 16$', 'cth. $Q_1 = 22$, $Q_3 = 38$: JAK $= 38 - 22 = 16$') },
    { term: T('median (grouped data)', 'median (data terkumpul)'), def: T('the value at position $\\frac{n}{2}$ of the ordered data, read from the ogive', 'nilai pada kedudukan $\\frac{n}{2}$ data yang tersusun, dibaca daripada ogif'), ex: T('e.g. $n = 40$: the 20th value', 'cth. $n = 40$: nilai ke-20') },
    { term: T('first quartile $Q_1$', 'kuartil pertama $Q_1$'), def: T('the value at position $\\frac{n}{4}$ of the ordered data, read from the ogive', 'nilai pada kedudukan $\\frac{n}{4}$ data yang tersusun, dibaca daripada ogif'), ex: T('e.g. $n = 40$: the 10th value', 'cth. $n = 40$: nilai ke-10') },
    { term: T('third quartile $Q_3$', 'kuartil ketiga $Q_3$'), def: T('the value at position $\\frac{3n}{4}$ of the ordered data, read from the ogive', 'nilai pada kedudukan $\\frac{3n}{4}$ data yang tersusun, dibaca daripada ogif'), ex: T('e.g. $n = 40$: the 30th value', 'cth. $n = 40$: nilai ke-30') },
    { term: T('five-number summary', 'ringkasan lima nombor'), def: T('the minimum, $Q_1$, median, $Q_3$ and maximum of a data set, used to draw a box plot', 'minimum, $Q_1$, median, $Q_3$ dan maksimum sesuatu set data, digunakan untuk melukis plot kotak'), ex: T('e.g. 5, 22, 30, 38, 60: box from 22 to 38 with a line at 30, whiskers to 5 and 60', 'cth. 5, 22, 30, 38, 60: kotak dari 22 hingga 38 dengan garis pada 30, misai hingga 5 dan 60') },
  ];
  const g72e2 = [
    (r) => {
      const five = [r.int(5, 15), r.int(20, 30), r.int(35, 45), r.int(50, 60), r.int(65, 80)].sort((a, b) => a - b);
      const which = r.pick(['iqr', 'range', 'order']);
      if (which === 'iqr') return { q: T(`A box plot has $Q_1 = ${five[1]}$ and $Q_3 = ${five[3]}$. Find the interquartile range.`, `Satu plot kotak mempunyai $Q_1 = ${five[1]}$ dan $Q_3 = ${five[3]}$. Cari julat antara kuartil.`), a: T(n(five[3] - five[1])), w: W(`$Q_3 - Q_1 = ${five[3]} - ${five[1]} = ${five[3] - five[1]}$`), sp: 'xs' };
      if (which === 'range') return { q: T(`A box plot has minimum ${five[0]} and maximum ${five[4]}. Find the range of the data.`, `Satu plot kotak mempunyai minimum ${five[0]} dan maksimum ${five[4]}. Cari julat data itu.`), a: T(n(five[4] - five[0])), w: W(T(`Range = maximum − minimum $= ${five[4]} - ${five[0]} = ${five[4] - five[0]}$`, `Julat = maksimum − minimum $= ${five[4]} - ${five[0]} = ${five[4] - five[0]}$`)), sp: 'xs' };
      return { q: T(`True or false? In a box plot, the five values always satisfy minimum $\\le Q_1 \\le$ median $\\le Q_3 \\le$ maximum.`, `Betul atau salah? Dalam plot kotak, kelima-lima nilai sentiasa memenuhi minimum $\\le Q_1 \\le$ median $\\le Q_3 \\le$ maksimum.`), a: T('True.', 'Betul.'), w: T('They are the values at positions 0, $\\frac{n}{4}$, $\\frac{n}{2}$, $\\frac{3n}{4}$ and $n$ of the ordered data, so they can never be out of this order.', 'Ia ialah nilai pada kedudukan 0, $\\frac{n}{4}$, $\\frac{n}{2}$, $\\frac{3n}{4}$ dan $n$ dalam data tersusun, jadi susunannya tidak boleh berubah.'), sp: 'xs' };
    },
    (r) => {
      const axis = r.pick(['x', 'y']);
      if (axis === 'x') return { q: T('On an ogive, what is plotted on the horizontal axis?', 'Pada suatu ogif, apakah yang diplot pada paksi mendatar?'), a: T('The upper class boundaries.', 'Sempadan atas kelas.'), w: T('Each cumulative frequency counts every value up to the end of a class, i.e. up to its upper boundary.', 'Setiap kekerapan longgokan mengira semua nilai hingga hujung sesuatu kelas, iaitu hingga sempadan atasnya.'), sp: 'xs' };
      return { q: T('On an ogive, what is plotted on the vertical axis?', 'Pada suatu ogif, apakah yang diplot pada paksi mencancang?'), a: T('The cumulative frequency.', 'Kekerapan longgokan.'), w: T('The ogive shows how many items are less than or equal to each upper boundary.', 'Ogif menunjukkan bilangan item yang kurang daripada atau sama dengan setiap sempadan atas.'), sp: 'xs' };
    },
    (r) => {
      const N = r.pick([30, 40, 50, 60, 80]);
      const cfAt = r.int(2, N - 2);
      const half = N / 2;
      return { q: T(`On an ogive with $n = ${N}$ items, a value $k$ has a cumulative frequency of ${cfAt} up to and including $k$. Is $k$ below, at, or above the median position?`, `Pada suatu ogif dengan $n = ${N}$ item, suatu nilai $k$ mempunyai kekerapan longgokan ${cfAt} sehingga dan termasuk $k$. Adakah $k$ di bawah, pada, atau di atas kedudukan median?`), a: T(cfAt < half ? 'Below the median position' : cfAt > half ? 'Above the median position' : 'At the median position', cfAt < half ? 'Di bawah kedudukan median' : cfAt > half ? 'Di atas kedudukan median' : 'Pada kedudukan median'), w: W(`$\\dfrac{n}{2} = \\dfrac{${N}}{2} = ${half}$`, `$${cfAt} ${cfAt < half ? '\\lt' : cfAt > half ? '\\gt' : '='} ${half}$`), sp: 'xs' };
    },
    (r) => {
      const min_ = r.int(5, 20), max_ = min_ + r.int(40, 70), med = r.int(min_ + 10, max_ - 10);
      need(max_ - med !== med - min_);
      return { q: T(`A box plot shows minimum ${min_}, median ${med} and maximum ${max_}. Is the distribution's upper half or lower half wider (a first look at skewness)?`, `Satu plot kotak menunjukkan minimum ${min_}, median ${med} dan maksimum ${max_}. Adakah separuh atas atau separuh bawah taburan itu lebih lebar (tinjauan awal kepencongan)?`), a: T(max_ - med > med - min_ ? 'The upper half (median to maximum) is wider.' : 'The lower half (minimum to median) is wider.', max_ - med > med - min_ ? 'Separuh atas (median ke maksimum) lebih lebar.' : 'Separuh bawah (minimum ke median) lebih lebar.'), w: W(T(`Upper half: $${max_} - ${med} = ${max_ - med}$`, `Separuh atas: $${max_} - ${med} = ${max_ - med}$`), T(`Lower half: $${med} - ${min_} = ${med - min_}$`, `Separuh bawah: $${med} - ${min_} = ${med - min_}$`)), sp: 'xs' };
    },
    (r) => {
      const N = r.pick([30, 40, 50, 60, 80]);
      return { q: T(`Write the formula, in terms of $n$, for the position of the median item and the position of $Q_3$ in an ordered data set of $n = ${N}$ items.`, `Tulis formula, dalam sebutan $n$, bagi kedudukan item median dan kedudukan $Q_3$ dalam set data tersusun dengan $n = ${N}$ item.`), a: T(`Median: $\\dfrac{n}{2} = ${N / 2}$th item; $Q_3$: $\\dfrac{3n}{4} = ${(3 * N) / 4}$th item`, `Median: item ke-$\\dfrac{n}{2} = ${N / 2}$; $Q_3$: item ke-$\\dfrac{3n}{4} = ${(3 * N) / 4}$`), w: W(`$\\dfrac{n}{2} = \\dfrac{${N}}{2} = ${N / 2}$`, `$\\dfrac{3n}{4} = \\dfrac{3(${N})}{4} = ${(3 * N) / 4}$`), sp: 's' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 12));
      const cf = cfOf(fs);
      const ctx = r.pick(STAT_CTX);
      return { q: T(`The table shows ${ctx.en}.<br>${gt(cl, fs, ['Class', 'Frequency', 'Upper boundary', 'Cumulative frequency'], cl.map((c) => [c[1] + 0.5, '']))}<br>Complete the cumulative frequency column.`, `Jadual menunjukkan ${ctx.ms}.<br>${gt(cl, fs, ['Kelas', 'Kekerapan', 'Sempadan atas', 'Kekerapan longgokan'], cl.map((c) => [c[1] + 0.5, '']))}<br>Lengkapkan lajur kekerapan longgokan.`), a: T(cf.join(', ')), w: W(T('Add each frequency to the previous cumulative frequency:', 'Tambah setiap kekerapan kepada kekerapan longgokan sebelumnya:'), cf.map((c, i) => (i ? `$${cf[i - 1]} + ${fs[i]} = ${c}$` : `$${c}$`)).join(', ')), sp: 'l' };
    },
    (r) => {
      const N = r.pick([30, 40, 50, 60, 80]);
      const which = r.pick(['median', 'Q1', 'Q3']);
      const pos = which === 'median' ? N / 2 : which === 'Q1' ? N / 4 : (3 * N) / 4;
      const lab = which === 'median' ? T('the median', 'median') : which === 'Q1' ? T('$Q_1$', '$Q_1$') : T('$Q_3$', '$Q_3$');
      return { q: T(`A grouped data set has $n = ${N}$ items. State the position (item number) of ${lab.en} in the ordered data.`, `Satu set data terkumpul mempunyai $n = ${N}$ item. Nyatakan kedudukan (nombor item) ${lab.ms} dalam data yang tersusun.`), a: T(`${n(pos)}th item`, `item ke-${n(pos)}`), w: W(which === 'median' ? `$\\dfrac{n}{2} = \\dfrac{${N}}{2} = ${n(pos)}$` : which === 'Q1' ? `$\\dfrac{n}{4} = \\dfrac{${N}}{4} = ${n(pos)}$` : `$\\dfrac{3n}{4} = \\dfrac{3(${N})}{4} = ${n(pos)}$`), sp: 'xs' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 4), fs = cl.map(() => r.int(3, 12));
      const cf = cfOf(fs), N = cf[3];
      const half = N / 2;
      let medClass = cl.length - 1;
      for (let i = 0; i < cl.length; i++) if (cf[i] >= half) { medClass = i; break; }
      return { q: T(`The table shows a cumulative frequency distribution.<br>${gt(cl, fs, ['Class', 'Frequency'], cl.map((c, i) => [cf[i]]))}<br>State the class that contains the median.`, `Jadual menunjukkan taburan kekerapan longgokan.<br>${gt(cl, fs, ['Kelas', 'Kekerapan'], cl.map((c, i) => [cf[i]]))}<br>Nyatakan kelas yang mengandungi median.`), a: T(`${cl[medClass][0]}–${cl[medClass][1]}`), w: W(`$\\dfrac{${N}}{2} = ${n(half)}$`, T(`The first cumulative frequency that reaches ${n(half)} is ${cf[medClass]}, in the class ${cl[medClass][0]}–${cl[medClass][1]}.`, `Kekerapan longgokan pertama yang mencapai ${n(half)} ialah ${cf[medClass]}, dalam kelas ${cl[medClass][0]}–${cl[medClass][1]}.`)), sp: 's' };
    },
    (r) => {
      const t = r.pick(OGIVE_TERMS);
      const w = r.pick([[`What is meant by "${t.term.en}"?`, `Apakah yang dimaksudkan dengan "${t.term.ms}"?`], [`Define "${t.term.en}".`, `Takrifkan "${t.term.ms}".`]]);
      return { q: T(w[0], w[1]), a: t.def, w: W(t.ex), sp: 's' };
    },
    (r) => {
      const opts = r.sample(OGIVE_TERMS, 4);
      const ci = r.int(0, 3);
      const correct = opts[ci];
      const L = 'ABCD';
      return { q: T(`Which term matches this description? "${correct.def.en}"<br>${opts.map((o, i) => `(${L[i]}) ${o.term.en}`).join('  ')}`, `Istilah manakah yang sepadan dengan huraian ini? "${correct.def.ms}"<br>${opts.map((o, i) => `(${L[i]}) ${o.term.ms}`).join('  ')}`), a: T(`${L[ci]}: ${correct.term.en}`, `${L[ci]}: ${correct.term.ms}`), w: termW(correct), sp: 's' };
    },
    (r) => {
      const q1 = r.int(10, 35), q3 = q1 + r.int(10, 30);
      return { q: T(`For a grouped data set, $Q_1 = ${n(q1)}$ and $Q_3 = ${n(q3)}$. Find the interquartile range.`, `Bagi satu set data terkumpul, $Q_1 = ${n(q1)}$ dan $Q_3 = ${n(q3)}$. Cari julat antara kuartil.`), a: T(n(q3 - q1)), w: T(`$${q3} - ${q1}$`), sp: 'xs' };
    },
  ];
  const g72m2 = [
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(3, 12));
      const cf = cfOf(fs), N = cf[4];
      const fig = ogiveFig(cl, cf);
      const ctx = r.pick(STAT_CTX);
      return { q: T(`The ogive of ${ctx.en} (${N} items) is shown. Estimate the median and the interquartile range.`, `Ogif bagi ${ctx.ms} (${N} item) ditunjukkan. Anggarkan median dan julat antara kuartil.`), fig, a: T(`Median $\\approx ${f2(interp(cl, fs, N / 2))}$; $Q_1 \\approx ${f2(interp(cl, fs, N / 4))}$, $Q_3 \\approx ${f2(interp(cl, fs, (3 * N) / 4))}$; IQR $\\approx ${f2(round(interp(cl, fs, (3 * N) / 4), 2) - round(interp(cl, fs, N / 4), 2))}$`, `Median $\\approx ${f2(interp(cl, fs, N / 2))}$; $Q_1 \\approx ${f2(interp(cl, fs, N / 4))}$, $Q_3 \\approx ${f2(interp(cl, fs, (3 * N) / 4))}$; JAK $\\approx ${f2(round(interp(cl, fs, (3 * N) / 4), 2) - round(interp(cl, fs, N / 4), 2))}$`), w: W(posLine(N), ipl(cl, fs, N / 2, LMED), ipl(cl, fs, N / 4, LQ1), ipl(cl, fs, (3 * N) / 4, LQ3), `$Q_3 - Q_1 = ${f2(interp(cl, fs, (3 * N) / 4))} - ${f2(interp(cl, fs, N / 4))} = ${f2(round(interp(cl, fs, (3 * N) / 4), 2) - round(interp(cl, fs, N / 4), 2))}$`), sp: 'm' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(3, 12));
      const cf = cfOf(fs), N = cf[4];
      const fig = ogiveFig(cl, cf);
      const k = r.int(1, 3);
      const val = cl[k][1] + 0.5;
      const ctx = r.pick(STAT_CTX);
      return { q: T(`The ogive of ${ctx.en} (${N} items) is shown. Estimate the number of items with a value at most ${n(val)}.`, `Ogif bagi ${ctx.ms} (${N} item) ditunjukkan. Anggarkan bilangan item yang bernilai selebih-lebihnya ${n(val)}.`), fig, a: T(`$\\approx ${cf[k]}$`), w: T(`${n(val)} is the upper boundary of the class ${cl[k][0]}–${cl[k][1]}; the ogive there is at cumulative frequency ${cf[k]}.`, `${n(val)} ialah sempadan atas kelas ${cl[k][0]}–${cl[k][1]}; ogif di situ berada pada kekerapan longgokan ${cf[k]}.`), sp: 'm' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(3, 12));
      const cf = cfOf(fs), N = cf[4];
      const minV = cl[0][0] - 0.5, maxV = cl[4][1] + 0.5;
      const q1 = interp(cl, fs, N / 4), med = interp(cl, fs, N / 2), q3 = interp(cl, fs, (3 * N) / 4);
      const five = [minV, q1, med, q3, maxV].map((v) => round(v, 1));
      const fig = ogiveFig(cl, cf);
      const ctx = r.pick(STAT_CTX);
      return { q: T(`The ogive of ${ctx.en} (${N} items) is shown; the extreme values are ${n(minV)} and ${n(maxV)}. Estimate the five-number summary and construct a box plot.`, `Ogif bagi ${ctx.ms} (${N} item) ditunjukkan; nilai ekstrem ialah ${n(minV)} dan ${n(maxV)}. Anggarkan ringkasan lima nombor dan bina plot kotak.`), fig, a: T(`Min ${f2(five[0])}, $Q_1 \\approx ${f2(five[1])}$, median $\\approx ${f2(five[2])}$, $Q_3 \\approx ${f2(five[3])}$, max ${f2(five[4])}.${boxFig(five, minV, maxV, 'en')}`, `Min ${f2(five[0])}, $Q_1 \\approx ${f2(five[1])}$, median $\\approx ${f2(five[2])}$, $Q_3 \\approx ${f2(five[3])}$, maks ${f2(five[4])}.${boxFig(five, minV, maxV, 'ms')}`), w: W(T(`Minimum = first lower boundary ${n(minV)}, maximum = last upper boundary ${n(maxV)}`, `Minimum = sempadan bawah pertama ${n(minV)}, maksimum = sempadan atas terakhir ${n(maxV)}`), posLine(N), ipl(cl, fs, N / 4, LQ1, 1), ipl(cl, fs, N / 2, LMED, 1), ipl(cl, fs, (3 * N) / 4, LQ3, 1)), sp: 'xl' };
    },
    (r) => {
      const t1 = r.pick(OGIVE_TERMS), t2 = r.pick(OGIVE_TERMS.filter((t) => t.term.en !== t1.term.en));
      return { q: T(`Explain the difference between "${t1.term.en}" and "${t2.term.en}".`, `Terangkan perbezaan antara "${t1.term.ms}" dengan "${t2.term.ms}".`), a: T(`${t1.term.en}: ${t1.def.en}. ${t2.term.en}: ${t2.def.en}.`, `${t1.term.ms}: ${t1.def.ms}. ${t2.term.ms}: ${t2.def.ms}.`), w: W(T(`${t1.term.en}: ${t1.ex.en}`, `${t1.term.ms}: ${t1.ex.ms}`), T(`${t2.term.en}: ${t2.ex.en}`, `${t2.term.ms}: ${t2.ex.ms}`)), sp: 'm' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(3, 12));
      const cf = cfOf(fs), N = cf[4];
      return { q: T(`The cumulative frequencies of a data set (${N} items, classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}) are ${cf.join(', ')}. State the position of the median item, then estimate the median using linear interpolation within its class.`, `Kekerapan longgokan satu set data (${N} item, kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}) ialah ${cf.join(', ')}. Nyatakan kedudukan item median, kemudian anggarkan median menggunakan interpolasi linear dalam kelasnya.`), a: T(`Position $\\dfrac{${N}}{2} = ${N / 2}$th item; median $\\approx ${f2(interp(cl, fs, N / 2))}$`, `Kedudukan $\\dfrac{${N}}{2} = ${N / 2}$; median $\\approx ${f2(interp(cl, fs, N / 2))}$`), w: W(`$\\dfrac{${N}}{2} = ${n(N / 2)}$`, ipl(cl, fs, N / 2, LMED)), sp: 'm' };
    },
  ];
  const g72a2 = [
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(3, 12));
      const cf = cfOf(fs), N = cf[4];
      const ctx = r.pick(STAT_CTX);
      const pct = r.pick([20, 30, 60, 70, 80]);
      return { q: T(`The frequencies for ${ctx.en} (classes ${cl.map((c) => c[0] + '–' + c[1]).join(', ')}) are ${fs.join(', ')}. Using an ogive, estimate the ${pct}th percentile and the number of items with a value more than ${cl[3][0] - 0.5}.`, `Kekerapan bagi ${ctx.ms} (kelas ${cl.map((c) => c[0] + '–' + c[1]).join(', ')}) ialah ${fs.join(', ')}. Dengan menggunakan ogif, anggarkan persentil ke-${pct} dan bilangan item yang bernilai lebih daripada ${cl[3][0] - 0.5}.`), a: T(`$P_{${pct}} \\approx ${f2(interp(cl, fs, (pct / 100) * N))}$; more than ${cl[3][0] - 0.5}: $${N} - ${cf[2]} = ${N - cf[2]}$ items`, `$P_{${pct}} \\approx ${f2(interp(cl, fs, (pct / 100) * N))}$; lebih daripada ${cl[3][0] - 0.5}: $${N} - ${cf[2]} = ${N - cf[2]}$ item`), w: W(`$${pct}\\% \\times ${N} = ${n((pct / 100) * N)}$`, ipl(cl, fs, (pct / 100) * N, `$P_{${pct}}$: `), T(`Up to ${cl[3][0] - 0.5}: ${cf[2]} items, so more than it: $${N} - ${cf[2]} = ${N - cf[2]}$`, `Sehingga ${cl[3][0] - 0.5}: ${cf[2]} item, jadi lebih daripadanya: $${N} - ${cf[2]} = ${N - cf[2]}$`)), sp: 'l' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(3, 12));
      const cf = cfOf(fs), N = cf[4];
      const passPct = r.pick([40, 50, 60, 70]);
      const passMark = interp(cl, fs, N * (1 - passPct / 100));
      const ctx = r.pick(STAT_CTX);
      return { q: T(`The ogive of ${ctx.en} (${N} items, classes ${cl.map((c) => c[0] + '–' + c[1]).join(', ')}, frequencies ${fs.join(', ')}) is used to set a pass mark so that the top ${passPct}% of items pass. Estimate the pass mark.`, `Ogif bagi ${ctx.ms} (${N} item, kelas ${cl.map((c) => c[0] + '–' + c[1]).join(', ')}, kekerapan ${fs.join(', ')}) digunakan untuk menetapkan markah lulus supaya ${passPct}% teratas item lulus. Anggarkan markah lulus.`), a: T(`Pass mark $\\approx ${f2(passMark)}$ (the value with $${round(N * (1 - passPct / 100), 1)}$ items below it)`, `Markah lulus $\\approx ${f2(passMark)}$ (nilai dengan $${round(N * (1 - passPct / 100), 1)}$ item di bawahnya)`), w: W(T(`Items below the pass mark: $(100 - ${passPct})\\% \\times ${N} = ${n(round(N * (1 - passPct / 100), 2))}$`, `Item di bawah markah lulus: $(100 - ${passPct})\\% \\times ${N} = ${n(round(N * (1 - passPct / 100), 2))}$`), ipl(cl, fs, N * (1 - passPct / 100), T('Pass mark: ', 'Markah lulus: '))), sp: 'l' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(3, 12));
      const cf = cfOf(fs), N = cf[4];
      const hide = r.sample([0, 1, 2, 3, 4], 2);
      const shownCf = cf.map((v, i) => (hide.includes(i) ? '?' : v));
      return { q: T(`An ogive gives these cumulative frequencies at the upper boundaries of the classes ${cl.map((c) => c[0] + '–' + c[1]).join(', ')}: ${shownCf.join(', ')} (total ${N} items). Reconstruct the original frequency of each class.`, `Satu ogif memberikan kekerapan longgokan berikut pada sempadan atas kelas ${cl.map((c) => c[0] + '–' + c[1]).join(', ')}: ${shownCf.join(', ')} (jumlah ${N} item). Bina semula kekerapan asal setiap kelas.`), a: T(fs.join(', ')), w: T('Each frequency is the difference between successive cumulative frequencies (the first frequency equals the first cumulative frequency).', 'Setiap kekerapan ialah perbezaan antara kekerapan longgokan berturutan (kekerapan pertama sama dengan kekerapan longgokan pertama).'), sp: 'l' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5);
      const fsA = cl.map(() => r.int(3, 12)), fsB = cl.map(() => r.int(3, 12));
      const cfA = cfOf(fsA), cfB = cfOf(fsB), NA = cfA[4], NB = cfB[4];
      const medA = interp(cl, fsA, NA / 2), medB = interp(cl, fsB, NB / 2);
      /* IQR from the quartiles as rounded to 2 d.p. (what a student subtracts) */
      const iqrA = round(interp(cl, fsA, (3 * NA) / 4), 2) - round(interp(cl, fsA, NA / 4), 2), iqrB = round(interp(cl, fsB, (3 * NB) / 4), 2) - round(interp(cl, fsB, NB / 4), 2);
      const ctx = r.pick(STAT_CTX);
      return { q: T(`Two groups were measured for ${ctx.en} on the same classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Group $P$ frequencies: ${fsA.join(', ')}. Group $Q$ frequencies: ${fsB.join(', ')}. Using ogives (mentally or by sketching), estimate the median and IQR of each group, and compare their centre and spread.`, `Dua kumpulan diukur bagi ${ctx.ms} pada kelas yang sama ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Kekerapan Kumpulan $P$: ${fsA.join(', ')}. Kekerapan Kumpulan $Q$: ${fsB.join(', ')}. Dengan menggunakan ogif (secara mental atau dengan lakaran), anggarkan median dan JAK setiap kumpulan, dan bandingkan pusat serta serakan mereka.`), a: T(`$P$: median $\\approx ${f2(medA)}$, IQR $\\approx ${f2(iqrA)}$. $Q$: median $\\approx ${f2(medB)}$, IQR $\\approx ${f2(iqrB)}$. ${medA >= medB ? 'P' : 'Q'} has the higher centre; ${iqrA <= iqrB ? 'P' : 'Q'} is less spread out (smaller IQR).`, `$P$: median $\\approx ${f2(medA)}$, JAK $\\approx ${f2(iqrA)}$. $Q$: median $\\approx ${f2(medB)}$, JAK $\\approx ${f2(iqrB)}$. ${medA >= medB ? 'P' : 'Q'} mempunyai pusat lebih tinggi; ${iqrA <= iqrB ? 'P' : 'Q'} kurang terserak (JAK lebih kecil).`), w: W(
        ipl(cl, fsA, NA / 2, T(`$P$ ($n = ${NA}$), median: `, `$P$ ($n = ${NA}$), median: `)), ipl(cl, fsA, NA / 4, '$P$, $Q_1$: '), ipl(cl, fsA, (3 * NA) / 4, '$P$, $Q_3$: '),
        ipl(cl, fsB, NB / 2, T(`$Q$ ($n = ${NB}$), median: `, `$Q$ ($n = ${NB}$), median: `)), ipl(cl, fsB, NB / 4, '$Q$, $Q_1$: '), ipl(cl, fsB, (3 * NB) / 4, '$Q$, $Q_3$: '),
        T(`IQR: $P$: $${f2(interp(cl, fsA, (3 * NA) / 4))} - ${f2(interp(cl, fsA, NA / 4))} = ${f2(iqrA)}$, $Q$: $${f2(interp(cl, fsB, (3 * NB) / 4))} - ${f2(interp(cl, fsB, NB / 4))} = ${f2(iqrB)}$`, `JAK: $P$: $${f2(interp(cl, fsA, (3 * NA) / 4))} - ${f2(interp(cl, fsA, NA / 4))} = ${f2(iqrA)}$, $Q$: $${f2(interp(cl, fsB, (3 * NB) / 4))} - ${f2(interp(cl, fsB, NB / 4))} = ${f2(iqrB)}$`)
      ), sp: 'xl' };
    },
    (r) => {
      const ERR = [
        { en: 'plotted each point at the class midpoint instead of the upper class boundary', ms: 'memplot setiap titik pada titik tengah kelas dan bukannya sempadan atas kelas', fix: T('an ogive must be plotted at each upper class boundary against the cumulative frequency, starting from cumulative frequency 0 at the lower boundary of the first class', 'ogif mesti diplot pada setiap sempadan atas kelas melawan kekerapan longgokan, bermula daripada kekerapan longgokan 0 pada sempadan bawah kelas pertama') },
        { en: 'read off the frequency of the median class instead of the value on the horizontal axis', ms: 'membaca kekerapan kelas median dan bukannya nilai pada paksi mendatar', fix: T('trace across from the required cumulative frequency on the vertical axis to the curve, then down to the horizontal axis to read the value', 'jejaki secara mendatar daripada kekerapan longgokan yang diperlukan pada paksi mencancang ke lengkung, kemudian ke bawah ke paksi mendatar untuk membaca nilai') },
        { en: 'used position $\\frac{n+1}{2}$ instead of $\\frac{n}{2}$ for the median', ms: 'menggunakan kedudukan $\\frac{n+1}{2}$ dan bukannya $\\frac{n}{2}$ bagi median', fix: T('for grouped data read from an ogive, the median position is $\\frac{n}{2}$, not $\\frac{n+1}{2}$', 'bagi data terkumpul yang dibaca daripada ogif, kedudukan median ialah $\\frac{n}{2}$, bukan $\\frac{n+1}{2}$') },
      ];
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(3, 12));
      const cf = cfOf(fs), N = cf[4];
      const e = r.pick(ERR);
      const ctx = r.pick(STAT_CTX);
      const fig = ogiveFig(cl, cf);
      return { q: T(`A student used the ogive of ${ctx.en} (${N} items) shown to estimate the median, but ${e.en}. Explain the student's error and give the correct estimate of the median.`, `Seorang murid menggunakan ogif bagi ${ctx.ms} (${N} item) yang ditunjukkan untuk menganggarkan median, tetapi ${e.ms}. Terangkan kesilapan murid itu dan berikan anggaran median yang betul.`), fig, a: T(`Error: ${e.fix.en}. Correct median $\\approx ${f2(interp(cl, fs, N / 2))}$.`, `Kesilapan: ${e.fix.ms}. Median yang betul $\\approx ${f2(interp(cl, fs, N / 2))}$.`), w: W(T(`Correct method: ${e.fix.en}.`, `Kaedah betul: ${e.fix.ms}.`), `$\\dfrac{${N}}{2} = ${n(N / 2)}$`, ipl(cl, fs, N / 2, LMED)), sp: 'l' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fsA = cl.map(() => r.int(3, 12)), fsB = cl.map(() => r.int(3, 12));
      const cfA = cfOf(fsA), cfB = cfOf(fsB), NA = cfA[4], NB = cfB[4];
      const minA = cl[0][0] - 0.5, maxA = cl[4][1] + 0.5;
      const fiveA = [minA, interp(cl, fsA, NA / 4), interp(cl, fsA, NA / 2), interp(cl, fsA, (3 * NA) / 4), maxA].map((v) => round(v, 1));
      const fiveB = [minA, interp(cl, fsB, NB / 4), interp(cl, fsB, NB / 2), interp(cl, fsB, (3 * NB) / 4), maxA].map((v) => round(v, 1));
      const ctx = r.pick(STAT_CTX);
      return { q: T(`Two groups were measured for ${ctx.en}: Group $P$ (frequencies ${fsA.join(', ')}) and Group $Q$ (frequencies ${fsB.join(', ')}), same classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Using ogives, construct both box plots (five-number summaries) and compare their shape (skewness) and spread.`, `Dua kumpulan diukur bagi ${ctx.ms}: Kumpulan $P$ (kekerapan ${fsA.join(', ')}) dan Kumpulan $Q$ (kekerapan ${fsB.join(', ')}), kelas yang sama ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Dengan menggunakan ogif, bina kedua-dua plot kotak (ringkasan lima nombor) dan bandingkan bentuk (kepencongan) serta serakan mereka.`), a: T(`$P$: ${fiveA.map(f2).join(', ')}.${boxFig(fiveA, minA, maxA, 'en')}$Q$: ${fiveB.map(f2).join(', ')}.${boxFig(fiveB, minA, maxA, 'en')}IQR $P$ $= ${f2(fiveA[3] - fiveA[1])}$, IQR $Q$ $= ${f2(fiveB[3] - fiveB[1])}$: ${fiveA[3] - fiveA[1] <= fiveB[3] - fiveB[1] ? 'P' : 'Q'} is less spread out.`, `$P$: ${fiveA.map(f2).join(', ')}.${boxFig(fiveA, minA, maxA, 'ms')}$Q$: ${fiveB.map(f2).join(', ')}.${boxFig(fiveB, minA, maxA, 'ms')}JAK $P$ $= ${f2(fiveA[3] - fiveA[1])}$, JAK $Q$ $= ${f2(fiveB[3] - fiveB[1])}$: ${fiveA[3] - fiveA[1] <= fiveB[3] - fiveB[1] ? 'P' : 'Q'} kurang terserak.`), w: W(
        T(`Minimum ${n(minA)}, maximum ${n(maxA)} (the end boundaries) for both groups`, `Minimum ${n(minA)}, maksimum ${n(maxA)} (sempadan hujung) bagi kedua-dua kumpulan`),
        ipl(cl, fsA, NA / 4, `$P$ ($n = ${NA}$), $Q_1$: `, 1), ipl(cl, fsA, NA / 2, T('$P$, median: ', '$P$, median: '), 1), ipl(cl, fsA, (3 * NA) / 4, '$P$, $Q_3$: ', 1),
        ipl(cl, fsB, NB / 4, `$Q$ ($n = ${NB}$), $Q_1$: `, 1), ipl(cl, fsB, NB / 2, T('$Q$, median: ', '$Q$, median: '), 1), ipl(cl, fsB, (3 * NB) / 4, '$Q$, $Q_3$: ', 1)
      ), sp: 'xl' };
    },
  ];
  SPM.extend('F5-7.2', { e: g72e2, m: g72m2, a: g72a2 });

  /* =================================================================================== 7.3 Histograms and frequency polygons */
  const HIST_TERMS = [
    { term: T('histogram', 'histogram'), def: T('a bar chart for grouped data with class boundaries on the horizontal axis and frequency on the vertical axis, with no gaps between bars', 'carta bar bagi data terkumpul dengan sempadan kelas pada paksi mendatar dan kekerapan pada paksi mencancang, tanpa jurang antara bar'), ex: T('e.g. the bar for 10–19 is drawn from 9.5 to 19.5, with height equal to its frequency', 'cth. bar bagi 10–19 dilukis dari 9.5 hingga 19.5, dengan tinggi sama dengan kekerapannya') },
    { term: T('frequency polygon', 'poligon kekerapan'), def: T('a line graph formed by joining points plotted at each class midpoint against its frequency', 'graf garis yang dibentuk dengan menyambungkan titik yang diplot pada setiap titik tengah kelas melawan kekerapannya'), ex: T('e.g. the class 10–19 with frequency 6 gives the point (14.5, 6)', 'cth. kelas 10–19 dengan kekerapan 6 memberi titik (14.5, 6)') },
    { term: T('contiguous bars', 'bar bersebelahan'), def: T('bars in a histogram that touch each other with no gaps, because the horizontal axis uses class boundaries', 'bar dalam histogram yang bersentuhan antara satu sama lain tanpa jurang, kerana paksi mendatar menggunakan sempadan kelas'), ex: T('e.g. the bar for 10–19 ends at 19.5, exactly where the bar for 20–29 begins', 'cth. bar bagi 10–19 berakhir pada 19.5, tepat di mana bar bagi 20–29 bermula') },
    { term: T('class boundary', 'sempadan kelas'), def: T('the value exactly halfway between the upper limit of one class and the lower limit of the next, used on the horizontal axis of a histogram', 'nilai yang tepat di antara had atas sesuatu kelas dengan had bawah kelas berikutnya, digunakan pada paksi mendatar histogram'), ex: T('e.g. between 10–19 and 20–29 the boundary is 19.5', 'cth. antara 10–19 dan 20–29, sempadannya ialah 19.5') },
    { term: T('modal class (from a histogram)', 'kelas modal (daripada histogram)'), def: T('the class represented by the tallest bar in the histogram', 'kelas yang diwakili oleh bar tertinggi dalam histogram'), ex: T('e.g. the tallest bar is over 29.5–39.5, so the modal class is 30–39', 'cth. bar tertinggi berada di atas 29.5–39.5, jadi kelas modal ialah 30–39') },
    { term: T('skewed distribution', 'taburan condong'), def: T('a distribution whose histogram or polygon has a longer tail on one side, so it is not symmetric', 'taburan yang histogram atau poligonnya mempunyai ekor yang lebih panjang pada satu bahagian, jadi ia tidak simetri'), ex: T('e.g. frequencies 12, 8, 4, 2: a long tail towards the high values', 'cth. kekerapan 12, 8, 4, 2: ekor panjang ke arah nilai tinggi') },
    { term: T('equal class width', 'lebar kelas yang sama'), def: T('every class interval covers the same range of values, so the histogram bars are equally wide and the polygon vertices are evenly spaced', 'setiap selang kelas meliputi julat nilai yang sama, jadi bar histogram sama lebar dan bucu poligon bersela sama rata'), ex: T('e.g. 10–19, 20–29 and 30–39 all have width 10', 'cth. 10–19, 20–29 dan 30–39 semuanya berlebar 10') },
  ];
  const g73e2 = [
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const ctx = r.pick(STAT_CTX);
      const fig = T(histFig(cl, fs, 'en'), histFig(cl, fs, 'ms'));
      return { q: T(`The histogram shows ${ctx.en}. Write the frequency table and the total number of items.`, `Histogram menunjukkan ${ctx.ms}. Tulis jadual kekerapan dan jumlah bilangan item.`), fig, a: T(`${cl.map((c, i) => `${c[0]}–${c[1]}: ${fs[i]}`).join('; ')}; total ${sum(fs)}`), w: W(T('The height of each bar is the frequency of its class.', 'Tinggi setiap bar ialah kekerapan kelasnya.'), T(`Total $= ${fs.join(' + ')} = ${sum(fs)}$`, `Jumlah $= ${fs.join(' + ')} = ${sum(fs)}$`)), sp: 'm' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const i = r.int(0, 4);
      const fig = T(histFig(cl, fs, 'en'), histFig(cl, fs, 'ms'));
      return { q: T(`The histogram shows a grouped distribution. Read off the frequency of the class ${cl[i][0]}–${cl[i][1]}.`, `Histogram menunjukkan taburan terkumpul. Baca kekerapan kelas ${cl[i][0]}–${cl[i][1]}.`), fig, a: T(n(fs[i])), w: T(`The bar from ${n(bnd(cl[i])[0])} to ${n(bnd(cl[i])[1])} has height ${fs[i]}.`, `Bar dari ${n(bnd(cl[i])[0])} hingga ${n(bnd(cl[i])[1])} mempunyai tinggi ${fs[i]}.`), sp: 's' };
    },
    (r) => {
      const stmts = [
        { en: 'In a histogram, the bars are drawn with small gaps between them, like a bar chart of categories.', ms: 'Dalam histogram, bar dilukis dengan jurang kecil antaranya, seperti carta bar bagi kategori.', ok: false, why: T('The horizontal axis uses class boundaries, so the bars touch with no gaps.', 'Paksi mendatar menggunakan sempadan kelas, jadi bar bersentuhan tanpa jurang.') },
        { en: 'A frequency polygon is formed by joining points plotted at the class midpoints.', ms: 'Poligon kekerapan dibentuk dengan menyambungkan titik yang diplot pada titik tengah kelas.', ok: true, why: T('Each vertex is (midpoint, frequency) of a class.', 'Setiap bucu ialah (titik tengah, kekerapan) sesuatu kelas.') },
        { en: 'The horizontal axis of a histogram uses the class boundaries, not the class limits.', ms: 'Paksi mendatar histogram menggunakan sempadan kelas, bukan had kelas.', ok: true, why: T('Boundaries such as 19.5 let adjacent bars meet exactly.', 'Sempadan seperti 19.5 membolehkan bar bersebelahan bertemu dengan tepat.') },
        { en: 'The tallest bar of a histogram identifies the class with the lowest frequency.', ms: 'Bar tertinggi dalam histogram mengenal pasti kelas dengan kekerapan terendah.', ok: false, why: T('Bar height = frequency, so the tallest bar shows the highest frequency (the modal class).', 'Tinggi bar = kekerapan, jadi bar tertinggi menunjukkan kekerapan tertinggi (kelas modal).') },
      ];
      const s = r.pick(stmts);
      return { q: T(`True or false? "${s.en}"`, `Betul atau salah? "${s.ms}"`), a: T(s.ok ? 'True' : 'False', s.ok ? 'Betul' : 'Salah'), w: s.why, sp: 'xs' };
    },
    (r) => {
      const t = r.pick(HIST_TERMS);
      const w = r.pick([[`What is meant by "${t.term.en}"?`, `Apakah yang dimaksudkan dengan "${t.term.ms}"?`], [`Define "${t.term.en}".`, `Takrifkan "${t.term.ms}".`]]);
      return { q: T(w[0], w[1]), a: t.def, w: W(t.ex), sp: 's' };
    },
    (r) => {
      const opts = r.sample(HIST_TERMS, 4);
      const ci = r.int(0, 3);
      const correct = opts[ci];
      const L = 'ABCD';
      return { q: T(`Which term matches this description? "${correct.def.en}"<br>${opts.map((o, i) => `(${L[i]}) ${o.term.en}`).join('  ')}`, `Istilah manakah yang sepadan dengan huraian ini? "${correct.def.ms}"<br>${opts.map((o, i) => `(${L[i]}) ${o.term.ms}`).join('  ')}`), a: T(`${L[ci]}: ${correct.term.en}`, `${L[ci]}: ${correct.term.ms}`), w: termW(correct), sp: 's' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 4), fs = cl.map(() => r.int(2, 12));
      const k = extremeClass(fs, 1);
      return { q: T(`A grouped distribution has classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')} with frequencies ${fs.join(', ')}. Which class has the highest frequency (the tallest bar in a histogram of this data)?`, `Satu taburan terkumpul mempunyai kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')} dengan kekerapan ${fs.join(', ')}. Kelas manakah mempunyai kekerapan tertinggi (bar tertinggi dalam histogram data ini)?`), a: T(`${cl[fs.indexOf(Math.max(...fs))][0]}–${cl[fs.indexOf(Math.max(...fs))][1]}`), w: T(`The largest frequency is ${fs[k]}, for the class ${cl[k][0]}–${cl[k][1]}.`, `Kekerapan terbesar ialah ${fs[k]}, bagi kelas ${cl[k][0]}–${cl[k][1]}.`), sp: 'xs' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 4), fs = cl.map(() => r.int(2, 12));
      const fig = T(histFig(cl, fs, 'en'), histFig(cl, fs, 'ms'));
      return { q: T('The histogram shows a grouped distribution. State the class boundaries used on the horizontal axis for the first class.', 'Histogram menunjukkan taburan terkumpul. Nyatakan sempadan kelas yang digunakan pada paksi mendatar bagi kelas pertama.'), fig, a: T(`${bnd(cl[0])[0]} and ${bnd(cl[0])[1]}`, `${bnd(cl[0])[0]} dan ${bnd(cl[0])[1]}`), w: W(T(`First class: ${cl[0][0]}–${cl[0][1]}`, `Kelas pertama: ${cl[0][0]}–${cl[0][1]}`), `$${cl[0][0]} - 0.5 = ${n(bnd(cl[0])[0])}$, $${cl[0][1]} + 0.5 = ${n(bnd(cl[0])[1])}$`), sp: 's' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 4), fs = cl.map(() => r.int(2, 12));
      return { q: T(`A frequency polygon is to be drawn for classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. At which $x$-values are the polygon's vertices plotted?`, `Suatu poligon kekerapan hendak dilukis bagi kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Pada nilai $x$ manakah bucu poligon itu diplot?`), a: T(`The midpoints: ${cl.map(mid).join(', ')}`, `Titik tengah: ${cl.map(mid).join(', ')}`), w: W(T('Each vertex is at the midpoint of its class:', 'Setiap bucu berada pada titik tengah kelasnya:'), cl.map((c) => `$\\dfrac{${c[0]} + ${c[1]}}{2} = ${n(mid(c))}$`).join(', ')), sp: 's' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      return { q: T(`A histogram is drawn for the classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. How many bars will the histogram have, and are they of equal width?`, `Suatu histogram dilukis bagi kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Berapa banyak bar yang akan dimiliki histogram itu, dan adakah lebarnya sama?`), a: T(`${cl.length} bars; yes, all classes have the same width (${cl[0][1] - cl[0][0] + 1}), as required for a histogram in this scope.`, `${cl.length} bar; ya, semua kelas mempunyai lebar yang sama (${cl[0][1] - cl[0][0] + 1}), seperti yang diperlukan bagi histogram dalam skop ini.`), w: W(T(`One bar per class: ${cl.length} classes.`, `Satu bar bagi setiap kelas: ${cl.length} kelas.`), T(`Width of each class, e.g. ${cl[0][0]}–${cl[0][1]}: $${n(bnd(cl[0])[1])} - ${n(bnd(cl[0])[0])} = ${cl[0][1] - cl[0][0] + 1}$ (the same for all)`, `Lebar setiap kelas, cth. ${cl[0][0]}–${cl[0][1]}: $${n(bnd(cl[0])[1])} - ${n(bnd(cl[0])[0])} = ${cl[0][1] - cl[0][0] + 1}$ (sama bagi semua)`)), sp: 'xs' };
    },
    (r) => {
      const base = [
        { t: T('bars drawn with no gaps between them', 'bar dilukis tanpa jurang antaranya'), ok: true },
        { t: T('bars drawn with small gaps between them, as for categories', 'bar dilukis dengan jurang kecil antaranya, seperti bagi kategori'), ok: false },
        { t: T('every bar drawn in a different colour', 'setiap bar dilukis dalam warna yang berbeza'), ok: false },
        { t: T('bars sorted from shortest to tallest', 'bar disusun daripada terpendek kepada tertinggi'), ok: false },
      ];
      const opts = r.shuffle(base);
      const ci = opts.findIndex((o) => o.ok);
      const L = 'ABCD';
      return { q: T(`Which of these is a correct feature of a histogram? ${opts.map((o, i) => `(${L[i]}) ${o.t.en}`).join(' ')}`, `Yang manakah ciri yang betul bagi histogram? ${opts.map((o, i) => `(${L[i]}) ${o.t.ms}`).join(' ')}`), a: T(`${L[ci]}: ${opts[ci].t.en}`, `${L[ci]}: ${opts[ci].t.ms}`), w: T('The horizontal axis uses class boundaries, so each bar ends exactly where the next begins: no gaps; colour and order carry no meaning.', 'Paksi mendatar menggunakan sempadan kelas, jadi setiap bar berakhir tepat di mana bar berikutnya bermula: tiada jurang; warna dan susunan tidak bermakna.'), sp: 's' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const i = r.int(0, 3);
      const fig = T(histFig(cl, fs, 'en'), histFig(cl, fs, 'ms'));
      return { q: T(`The histogram shows a grouped distribution. Find the total frequency of the two adjacent classes ${cl[i][0]}–${cl[i][1]} and ${cl[i + 1][0]}–${cl[i + 1][1]} combined.`, `Histogram menunjukkan taburan terkumpul. Cari jumlah kekerapan bagi dua kelas bersebelahan ${cl[i][0]}–${cl[i][1]} dan ${cl[i + 1][0]}–${cl[i + 1][1]} digabungkan.`), fig, a: T(n(fs[i] + fs[i + 1])), w: W(T(`Bar heights: ${fs[i]} and ${fs[i + 1]}`, `Tinggi bar: ${fs[i]} dan ${fs[i + 1]}`), `$${fs[i]} + ${fs[i + 1]} = ${fs[i] + fs[i + 1]}$`), sp: 's' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const ctx = r.pick(STAT_CTX);
      const fig = T(polyFig(cl, fs, 'en'), polyFig(cl, fs, 'ms'));
      const peak = cl[fs.indexOf(Math.max(...fs))];
      extremeClass(fs, 1);
      return { q: T(`The frequency polygon shows ${ctx.en}. At which class midpoint does the polygon reach its highest point?`, `Poligon kekerapan menunjukkan ${ctx.ms}. Pada titik tengah kelas manakah poligon itu mencapai titik tertingginya?`), fig, a: T(`$x = ${mid(peak)}$ (class ${peak[0]}–${peak[1]})`, `$x = ${mid(peak)}$ (kelas ${peak[0]}–${peak[1]})`), w: T(`The highest vertex has frequency ${Math.max(...fs)}, at $x = \\dfrac{${peak[0]} + ${peak[1]}}{2} = ${mid(peak)}$.`, `Bucu tertinggi mempunyai kekerapan ${Math.max(...fs)}, pada $x = \\dfrac{${peak[0]} + ${peak[1]}}{2} = ${mid(peak)}$.`), sp: 's' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), r.pick([5, 10]), 4);
      const i = r.int(0, 3);
      return { q: T(`Give the class limits and the class boundaries of the class interval that has midpoint ${mid(cl[i])} and class width ${cl[0][1] - cl[0][0] + 1}.`, `Berikan had kelas dan sempadan kelas bagi selang kelas yang mempunyai titik tengah ${mid(cl[i])} dan lebar kelas ${cl[0][1] - cl[0][0] + 1}.`), a: T(`Limits ${cl[i][0]}–${cl[i][1]}; boundaries ${bnd(cl[i])[0]}–${bnd(cl[i])[1]}`, `Had ${cl[i][0]}–${cl[i][1]}; sempadan ${bnd(cl[i])[0]}–${bnd(cl[i])[1]}`), w: (() => {
        const cw = cl[0][1] - cl[0][0] + 1, h = cw / 2, m0 = mid(cl[i]);
        return W(T(`Boundaries: $${n(m0)} - ${n(h)} = ${n(m0 - h)}$ and $${n(m0)} + ${n(h)} = ${n(m0 + h)}$`, `Sempadan: $${n(m0)} - ${n(h)} = ${n(m0 - h)}$ dan $${n(m0)} + ${n(h)} = ${n(m0 + h)}$`), T(`Limits: $${n(m0 - h)} + 0.5 = ${cl[i][0]}$ and $${n(m0 + h)} - 0.5 = ${cl[i][1]}$`, `Had: $${n(m0 - h)} + 0.5 = ${cl[i][0]}$ dan $${n(m0 + h)} - 0.5 = ${cl[i][1]}$`));
      })(), sp: 's' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 4), fs = cl.map(() => r.int(2, 12));
      const k = extremeClass(fs, -1);
      return { q: T(`A grouped distribution has classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')} with frequencies ${fs.join(', ')}. Which class has the lowest frequency (the shortest bar in a histogram of this data)?`, `Satu taburan terkumpul mempunyai kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')} dengan kekerapan ${fs.join(', ')}. Kelas manakah mempunyai kekerapan terendah (bar terpendek dalam histogram data ini)?`), a: T(`${cl[fs.indexOf(Math.min(...fs))][0]}–${cl[fs.indexOf(Math.min(...fs))][1]}`), w: T(`The smallest frequency is ${fs[k]}, for the class ${cl[k][0]}–${cl[k][1]}.`, `Kekerapan terkecil ialah ${fs[k]}, bagi kelas ${cl[k][0]}–${cl[k][1]}.`), sp: 'xs' };
    },
  ];
  const g73m2 = [
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const ctx = r.pick(STAT_CTX);
      return { q: T(`Draw a histogram and a frequency polygon for ${ctx.en}.<br>${gt(cl, fs, ['Class', 'Frequency'])}<br>State the midpoints used for the frequency polygon.`, `Lukis histogram dan poligon kekerapan bagi ${ctx.ms}.<br>${gt(cl, fs, ['Kelas', 'Kekerapan'])}<br>Nyatakan titik tengah yang digunakan untuk poligon kekerapan.`), a: T(`Midpoints ${cl.map(mid).join(', ')}, plus the midpoints ${mid(cl[0]) - (cl[0][1] - cl[0][0] + 1)} and ${mid(cl[4]) + (cl[0][1] - cl[0][0] + 1)} with frequency 0.${histFig(cl, fs, 'en')}`, `Titik tengah ${cl.map(mid).join(', ')}, serta titik tengah ${mid(cl[0]) - (cl[0][1] - cl[0][0] + 1)} dan ${mid(cl[4]) + (cl[0][1] - cl[0][0] + 1)} dengan kekerapan 0.${histFig(cl, fs, 'ms')}`), w: W(cl.map((c) => `$\\dfrac{${c[0]} + ${c[1]}}{2} = ${n(mid(c))}$`).join(', '), T(`Add a zero-frequency point one class width (${cl[0][1] - cl[0][0] + 1}) beyond each end: $${n(mid(cl[0]))} - ${cl[0][1] - cl[0][0] + 1} = ${n(mid(cl[0]) - (cl[0][1] - cl[0][0] + 1))}$, $${n(mid(cl[4]))} + ${cl[0][1] - cl[0][0] + 1} = ${n(mid(cl[4]) + (cl[0][1] - cl[0][0] + 1))}$`, `Tambah titik berkekerapan sifar satu lebar kelas (${cl[0][1] - cl[0][0] + 1}) di luar setiap hujung: $${n(mid(cl[0]))} - ${cl[0][1] - cl[0][0] + 1} = ${n(mid(cl[0]) - (cl[0][1] - cl[0][0] + 1))}$, $${n(mid(cl[4]))} + ${cl[0][1] - cl[0][0] + 1} = ${n(mid(cl[4]) + (cl[0][1] - cl[0][0] + 1))}$`)), sp: 'xl' };
    },
    (r) => {
      const w = r.pick([10, 20]);
      return { q: T(`Explain why the bars of a histogram of continuous grouped data (class width ${w}) are drawn touching each other with no gaps, unlike a bar chart comparing separate categories.`, `Terangkan mengapa bar histogram bagi data terkumpul selanjar (lebar kelas ${w}) dilukis bersentuhan antara satu sama lain tanpa jurang, tidak seperti carta bar yang membandingkan kategori berasingan.`), a: T('The classes cover a continuous range of values with no gaps between one class ending and the next beginning (at the class boundaries), so the bars must touch to reflect this; a bar chart compares separate, unrelated categories, so gaps are used to show they are distinct.', 'Kelas-kelas itu meliputi julat nilai selanjar tanpa jurang antara satu kelas berakhir dengan kelas berikutnya bermula (pada sempadan kelas), jadi bar mesti bersentuhan untuk mencerminkan ini; carta bar membandingkan kategori berasingan yang tidak berkaitan, jadi jurang digunakan untuk menunjukkan ia berbeza.'), w: W(T(`Continuous data: e.g. a class ending at ${w - 0.5} and the next starting at ${w - 0.5} share one boundary.`, `Data selanjar: cth. kelas yang berakhir pada ${w - 0.5} dan kelas berikutnya yang bermula pada ${w - 0.5} berkongsi satu sempadan.`), T('Separate categories have nothing between them, so a bar chart shows gaps.', 'Kategori berasingan tiada apa-apa di antaranya, jadi carta bar menunjukkan jurang.')), sp: 'm' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 4), fsA = cl.map(() => r.int(2, 12)), fsB = cl.map(() => r.int(2, 12));
      const fig = twoPolyFig(cl, fsA, fsB, 'en'), figMs = twoPolyFig(cl, fsA, fsB, 'ms');
      const ctx = r.pick(STAT_CTX);
      const peakA = cl[fsA.indexOf(Math.max(...fsA))], peakB = cl[fsB.indexOf(Math.max(...fsB))];
      extremeClass(fsA, 1);
      extremeClass(fsB, 1);
      return { q: T(`Two frequency polygons compare ${ctx.en} of Class $P$ (solid) and Class $Q$ (dashed), on the same axes. State the modal class of each, shown by the peak of each polygon.`, `Dua poligon kekerapan membandingkan ${ctx.ms} bagi Kelas $P$ (garis penuh) dan Kelas $Q$ (garis putus), pada paksi yang sama. Nyatakan kelas modal setiap satu, ditunjukkan oleh puncak setiap poligon.`), fig: T(fig, figMs), a: T(`$P$: ${peakA[0]}–${peakA[1]}; $Q$: ${peakB[0]}–${peakB[1]}`, `$P$: ${peakA[0]}–${peakA[1]}; $Q$: ${peakB[0]}–${peakB[1]}`), w: W(T(`$P$: highest vertex (frequency ${Math.max(...fsA)}) at $x = ${n(mid(peakA))}$ → class ${peakA[0]}–${peakA[1]}`, `$P$: bucu tertinggi (kekerapan ${Math.max(...fsA)}) pada $x = ${n(mid(peakA))}$ → kelas ${peakA[0]}–${peakA[1]}`), T(`$Q$: highest vertex (frequency ${Math.max(...fsB)}) at $x = ${n(mid(peakB))}$ → class ${peakB[0]}–${peakB[1]}`, `$Q$: bucu tertinggi (kekerapan ${Math.max(...fsB)}) pada $x = ${n(mid(peakB))}$ → kelas ${peakB[0]}–${peakB[1]}`)), sp: 'm' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const cf = cfOf(fs);
      const ctx = r.pick(STAT_CTX);
      const fig = T(histFig(cl, fs, 'en'), histFig(cl, fs, 'ms'));
      return { q: T(`The histogram shows ${ctx.en}. Read off the frequencies and build the cumulative frequency table.`, `Histogram menunjukkan ${ctx.ms}. Baca kekerapan dan bina jadual kekerapan longgokan.`), fig, a: T(`Frequencies ${fs.join(', ')}; cumulative frequencies ${cf.join(', ')}`, `Kekerapan ${fs.join(', ')}; kekerapan longgokan ${cf.join(', ')}`), w: W(T('Bar heights give the frequencies; add them one by one:', 'Tinggi bar memberi kekerapan; tambah satu demi satu:'), cf.map((c, i) => (i ? `$${cf[i - 1]} + ${fs[i]} = ${c}$` : `$${c}$`)).join(', ')), sp: 'l' };
    },
    (r) => {
      const t1 = r.pick(HIST_TERMS), t2 = r.pick(HIST_TERMS.filter((t) => t.term.en !== t1.term.en));
      return { q: T(`Explain the difference between "${t1.term.en}" and "${t2.term.en}".`, `Terangkan perbezaan antara "${t1.term.ms}" dengan "${t2.term.ms}".`), a: T(`${t1.term.en}: ${t1.def.en}. ${t2.term.en}: ${t2.def.en}.`, `${t1.term.ms}: ${t1.def.ms}. ${t2.term.ms}: ${t2.def.ms}.`), w: W(T(`${t1.term.en}: ${t1.ex.en}`, `${t1.term.ms}: ${t1.ex.ms}`), T(`${t2.term.en}: ${t2.ex.en}`, `${t2.term.ms}: ${t2.ex.ms}`)), sp: 'm' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const st = gStats(cl, fs);
      const ctx = r.pick(STAT_CTX);
      const fig = T(polyFig(cl, fs, 'en'), polyFig(cl, fs, 'ms'));
      return { q: T(`The frequency polygon shows ${ctx.en}. Estimate the mean using the class midpoints shown by the polygon's vertices.`, `Poligon kekerapan menunjukkan ${ctx.ms}. Anggarkan min menggunakan titik tengah kelas yang ditunjukkan oleh bucu poligon.`), fig, a: T(f2(st.m)), w: W(T(`Vertices: midpoints ${cl.map((c) => n(mid(c))).join(', ')}, frequencies ${fs.join(', ')}`, `Bucu: titik tengah ${cl.map((c) => n(mid(c))).join(', ')}, kekerapan ${fs.join(', ')}`), meanLine(cl, fs)), sp: 'm' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const w = cl[0][1] - cl[0][0] + 1;
      const pts = [mid(cl[0]) - w, ...cl.map(mid), mid(cl[4]) + w];
      const ctx = r.pick(STAT_CTX);
      return { q: T(`For ${ctx.en}, classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')} with frequencies ${fs.join(', ')}, list the coordinates $(x, y)$ of every vertex of the frequency polygon, including the two zero-frequency endpoints.`, `Bagi ${ctx.ms}, kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')} dengan kekerapan ${fs.join(', ')}, senaraikan koordinat $(x, y)$ setiap bucu poligon kekerapan, termasuk dua titik hujung berkekerapan sifar.`), a: T(`(${pts[0]}, 0), ${cl.map((c, i) => `(${mid(c)}, ${fs[i]})`).join(', ')}, (${pts[pts.length - 1]}, 0)`), w: W(T(`Vertices at the midpoints: ${cl.map((c) => n(mid(c))).join(', ')}`, `Bucu pada titik tengah: ${cl.map((c) => n(mid(c))).join(', ')}`), T(`End points one width (${w}) outside: $${n(mid(cl[0]))} - ${w} = ${n(pts[0])}$, $${n(mid(cl[4]))} + ${w} = ${n(pts[pts.length - 1])}$`, `Titik hujung satu lebar (${w}) di luar: $${n(mid(cl[0]))} - ${w} = ${n(pts[0])}$, $${n(mid(cl[4]))} + ${w} = ${n(pts[pts.length - 1])}$`)), sp: 'm' };
    },
  ];
  const g73a2 = [
    (r) => {
      const cl = cls(10, 10, 4), fs = cl.map(() => r.int(3, 10)), miss = r.int(0, 3);
      const N = sum(fs);
      const shown = fs.map((v, i) => (i === miss ? '?' : v));
      const ctx = r.pick(STAT_CTX);
      return { q: T(`The frequencies of a histogram of ${ctx.en}, classes ${cl.map((c) => c[0] + '–' + c[1]).join(', ')}, are ${shown.join(', ')}. The total number of items is ${N}. Find the missing frequency and compare the shape of the distribution with a distribution that has its tallest bar at the last class.`, `Kekerapan histogram bagi ${ctx.ms}, kelas ${cl.map((c) => c[0] + '–' + c[1]).join(', ')}, ialah ${shown.join(', ')}. Jumlah bilangan item ialah ${N}. Cari kekerapan yang hilang dan bandingkan bentuk taburan itu dengan taburan yang mempunyai bar tertinggi pada kelas terakhir.`), a: T(`Missing frequency ${fs[miss]} ($${N} - ${N - fs[miss]}$). A distribution with the tallest bar in the last class is skewed towards high values.`, `Kekerapan yang hilang ${fs[miss]} ($${N} - ${N - fs[miss]}$). Taburan yang mempunyai bar tertinggi pada kelas terakhir adalah condong ke arah nilai tinggi.`), w: W(`$${N} - (${fs.filter((_, i) => i !== miss).join(' + ')}) = ${fs[miss]}$`, T('Tallest bar in the last class: most values are high, with a longer tail towards the low values.', 'Bar tertinggi pada kelas terakhir: kebanyakan nilai tinggi, dengan ekor lebih panjang ke arah nilai rendah.')), sp: 'l' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 4), fsA = cl.map(() => r.int(3, 12)), fsB = cl.map(() => r.int(3, 12));
      const A = gStats(cl, fsA), B = gStats(cl, fsB);
      const fig = twoPolyFig(cl, fsA, fsB, 'en'), figMs = twoPolyFig(cl, fsA, fsB, 'ms');
      const ctx = r.pick(STAT_CTX);
      return { q: T(`Two frequency polygons compare ${ctx.en} of Class $P$ (solid, frequencies ${fsA.join(', ')}) and Class $Q$ (dashed, frequencies ${fsB.join(', ')}), classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Compute the mean of each class from the data, and use the shapes of the polygons together with the means to compare the two classes.`, `Dua poligon kekerapan membandingkan ${ctx.ms} bagi Kelas $P$ (garis penuh, kekerapan ${fsA.join(', ')}) dan Kelas $Q$ (garis putus, kekerapan ${fsB.join(', ')}), kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Hitung min setiap kelas daripada data, dan gunakan bentuk poligon bersama min untuk membandingkan kedua-dua kelas.`), fig: T(fig, figMs), a: T(`$P$: mean ${f2(A.m)}; $Q$: mean ${f2(B.m)}. ${A.m > B.m ? 'P' : 'Q'} tends to have higher values (higher mean, and its polygon lies more to the right).`, `$P$: min ${f2(A.m)}; $Q$: min ${f2(B.m)}. ${A.m > B.m ? 'P' : 'Q'} cenderung mempunyai nilai lebih tinggi (min lebih tinggi, dan poligonnya terletak lebih ke kanan).`), w: W(meanLine(cl, fsA, '$P$: '), meanLine(cl, fsB, '$Q$: '), T(`The higher mean is ${A.m > B.m ? 'P' : 'Q'}.`, `Min yang lebih tinggi ialah ${A.m > B.m ? 'P' : 'Q'}.`)), sp: 'xl' };
    },
    (r) => {
      const ERR = [
        { en: 'drew the bars with small gaps between them', ms: 'melukis bar dengan jurang kecil antaranya', fix: T('histogram bars must be contiguous (touching), since the horizontal axis uses class boundaries with no gaps between classes', 'bar histogram mesti bersebelahan (bersentuhan), kerana paksi mendatar menggunakan sempadan kelas tanpa jurang antara kelas') },
        { en: 'used the class limits, instead of the class boundaries, on the horizontal axis', ms: 'menggunakan had kelas, bukannya sempadan kelas, pada paksi mendatar', fix: T('the horizontal axis of a histogram must use class boundaries so that adjacent bars meet exactly', 'paksi mendatar histogram mesti menggunakan sempadan kelas supaya bar bersebelahan bertemu dengan tepat') },
        { en: 'plotted the frequency polygon vertices at the class boundaries instead of the class midpoints', ms: 'memplot bucu poligon kekerapan pada sempadan kelas dan bukannya titik tengah kelas', fix: T('a frequency polygon must have its vertices at the class midpoints, since the midpoint represents the class', 'poligon kekerapan mesti mempunyai bucunya pada titik tengah kelas, kerana titik tengah mewakili kelas itu') },
      ];
      const cl = cls(r.pick([10, 20]), 10, 4), fs = cl.map(() => r.int(2, 12));
      const e = r.pick(ERR);
      const ctx = r.pick(STAT_CTX);
      return { q: T(`A student drew a histogram and frequency polygon for ${ctx.en} (classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}, frequencies ${fs.join(', ')}), but ${e.en}. Explain the error and how to fix it.`, `Seorang murid melukis histogram dan poligon kekerapan bagi ${ctx.ms} (kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}, kekerapan ${fs.join(', ')}), tetapi ${e.ms}. Terangkan kesilapan itu dan cara membetulkannya.`), a: T(e.fix.en, e.fix.ms), w: e === ERR[2] ? T(`e.g. the class ${cl[0][0]}–${cl[0][1]} (frequency ${fs[0]}) gives the vertex $(${n(mid(cl[0]))}, ${fs[0]})$, not a point at ${n(bnd(cl[0])[1])}.`, `cth. kelas ${cl[0][0]}–${cl[0][1]} (kekerapan ${fs[0]}) memberi bucu $(${n(mid(cl[0]))}, ${fs[0]})$, bukan titik pada ${n(bnd(cl[0])[1])}.`) : T(`e.g. the bar for ${cl[0][0]}–${cl[0][1]} runs from ${n(bnd(cl[0])[0])} to ${n(bnd(cl[0])[1])}, and the next bar starts at ${n(bnd(cl[0])[1])}.`, `cth. bar bagi ${cl[0][0]}–${cl[0][1]} dari ${n(bnd(cl[0])[0])} hingga ${n(bnd(cl[0])[1])}, dan bar berikutnya bermula pada ${n(bnd(cl[0])[1])}.`), sp: 'l' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 5), fs = cl.map(() => r.int(2, 14));
      const ctx = r.pick(STAT_CTX);
      const fig = T(histFig(cl, fs, 'en'), histFig(cl, fs, 'ms'));
      const st = gStats(cl, fs);
      return { q: T(`The histogram shows ${ctx.en}. Reconstruct the full frequency table (class, midpoint, frequency), then find the estimated mean and standard deviation.`, `Histogram menunjukkan ${ctx.ms}. Bina semula jadual kekerapan penuh (kelas, titik tengah, kekerapan), kemudian cari min anggaran dan sisihan piawai.`), fig, a: T(`${cl.map((c, i) => `${c[0]}–${c[1]} (mid ${mid(c)}): ${fs[i]}`).join('; ')}; mean ${f2(st.m)}; s.d. ${f2(st.sd)}`, `${cl.map((c, i) => `${c[0]}–${c[1]} (titik tengah ${mid(c)}): ${fs[i]}`).join('; ')}; min ${f2(st.m)}; s.p. ${f2(st.sd)}`), w: W(T('Read each frequency from the bar height.', 'Baca setiap kekerapan daripada tinggi bar.'), ...statLines(cl, fs)), sp: 'xl' };
    },
    (r) => {
      const cl = cls(r.pick([10, 20]), 10, 4), fsA = cl.map(() => r.int(3, 12)), fsB = cl.map(() => r.int(3, 12));
      const cfA = cfOf(fsA), cfB = cfOf(fsB);
      const medA = interp(cl, fsA, cfA[3] / 2), medB = interp(cl, fsB, cfB[3] / 2);
      const ctx = r.pick(STAT_CTX);
      const fig = twoPolyFig(cl, fsA, fsB, 'en'), figMs = twoPolyFig(cl, fsA, fsB, 'ms');
      return { q: T(`Two frequency polygons compare ${ctx.en} of Class $P$ (solid, frequencies ${fsA.join(', ')}) and Class $Q$ (dashed, frequencies ${fsB.join(', ')}), classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Using the underlying grouped data (not the graph), estimate the median of each class, and explain what the relative positions of the two polygons on the horizontal axis suggest about which class generally scored higher.`, `Dua poligon kekerapan membandingkan ${ctx.ms} bagi Kelas $P$ (garis penuh, kekerapan ${fsA.join(', ')}) dan Kelas $Q$ (garis putus, kekerapan ${fsB.join(', ')}), kelas ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}. Dengan menggunakan data terkumpul (bukan graf), anggarkan median setiap kelas, dan terangkan apa yang ditunjukkan oleh kedudukan relatif kedua-dua poligon pada paksi mendatar tentang kelas manakah secara umumnya mendapat markah lebih tinggi.`), fig: T(fig, figMs), a: T(`$P$ median $\\approx ${f2(medA)}$; $Q$ median $\\approx ${f2(medB)}$. The polygon that lies further to the right (higher $x$-values) belongs to the class that generally scored higher; here that is Class $${medA >= medB ? 'P' : 'Q'}$.`, `Median $P$ $\\approx ${f2(medA)}$; median $Q$ $\\approx ${f2(medB)}$. Poligon yang terletak lebih ke kanan (nilai $x$ lebih tinggi) tergolong kepada kelas yang secara umumnya mendapat markah lebih tinggi; di sini ia ialah Kelas $${medA >= medB ? 'P' : 'Q'}$.`), w: W(ipl(cl, fsA, cfA[3] / 2, T(`$P$ ($n = ${cfA[3]}$, position ${n(cfA[3] / 2)}): `, `$P$ ($n = ${cfA[3]}$, kedudukan ${n(cfA[3] / 2)}): `)), ipl(cl, fsB, cfB[3] / 2, T(`$Q$ ($n = ${cfB[3]}$, position ${n(cfB[3] / 2)}): `, `$Q$ ($n = ${cfB[3]}$, kedudukan ${n(cfB[3] / 2)}): `)), T(`The larger median is ${medA >= medB ? 'P' : 'Q'}.`, `Median yang lebih besar ialah ${medA >= medB ? 'P' : 'Q'}.`)), sp: 'xl' };
    },
    (r) => {
      const w = r.pick([10, 20]), lo = r.pick([5, 15, 25]);
      const cl = cls(lo, w, 5);
      const mids = cl.map(mid);
      const ctx = r.pick(STAT_CTX);
      return { q: T(`A frequency polygon for ${ctx.en} has vertices at $x = ${mids.join(', ')}$ (all classes of equal width). Reconstruct the class intervals (limits) and the class boundaries.`, `Suatu poligon kekerapan bagi ${ctx.ms} mempunyai bucu pada $x = ${mids.join(', ')}$ (semua kelas berlebar sama). Bina semula selang kelas (had) dan sempadan kelas.`), a: T(`Class width $= ${w}$; classes: ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}; boundaries: ${cl.map((c) => `${bnd(c)[0]}–${bnd(c)[1]}`).join(', ')}`, `Lebar kelas $= ${w}$; kelas: ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}; sempadan: ${cl.map((c) => `${bnd(c)[0]}–${bnd(c)[1]}`).join(', ')}`), w: T('Class width = difference between consecutive midpoints; each class extends half a width below and above its midpoint.', 'Lebar kelas = perbezaan antara titik tengah berturutan; setiap kelas melangkaui separuh lebar di bawah dan di atas titik tengahnya.'), sp: 'l' };
    },
  ];
  SPM.extend('F5-7.3', { e: g73e2, m: g73m2, a: g73a2 });

  /* =================================================================================== 7.4 Statistical mini-project */
  const STAT_Q = [
    { en: 'How many hours of sleep do Form 5 students in our school get on a school night?', ms: 'Berapa jam tidur yang diperoleh murid Tingkatan 5 di sekolah kita pada malam persekolahan?', var: T('hours of sleep (numerical, continuous)', 'jam tidur (berangka, selanjar)'), method: T('a survey/questionnaire', 'tinjauan/soal selidik') },
    { en: 'How many books do students borrow from the library in a month?', ms: 'Berapa buah buku yang dipinjam murid daripada perpustakaan dalam sebulan?', var: T('number of books (numerical, discrete)', 'bilangan buku (berangka, diskret)'), method: T('library records', 'rekod perpustakaan') },
    { en: 'What is the most popular co-curricular club among Form 5 students?', ms: 'Apakah kelab kokurikulum yang paling popular dalam kalangan murid Tingkatan 5?', var: T('club chosen (categorical)', 'kelab yang dipilih (berkategori)'), method: T('a survey/questionnaire', 'tinjauan/soal selidik') },
    { en: 'How long does it take students to travel to school?', ms: 'Berapa lama masa yang diambil murid untuk ke sekolah?', var: T('travel time in minutes (numerical, continuous)', 'masa perjalanan dalam minit (berangka, selanjar)'), method: T('a survey/questionnaire', 'tinjauan/soal selidik') },
    { en: 'How many cups of water do students drink in a school day?', ms: 'Berapa cawan air yang diminum murid dalam sehari persekolahan?', var: T('number of cups (numerical, discrete)', 'bilangan cawan (berangka, diskret)'), method: T('a survey or direct observation', 'tinjauan atau pemerhatian langsung') },
    { en: 'What is the mass of the school bags carried by Form 1 students?', ms: 'Berapakah jisim beg sekolah yang dibawa oleh murid Tingkatan 1?', var: T('mass in kg (numerical, continuous)', 'jisim dalam kg (berangka, selanjar)'), method: T('direct measurement', 'pengukuran langsung') },
  ];
  const BAD_Q = [
    { en: 'Is Ahmad good at Mathematics?', ms: 'Adakah Ahmad bagus dalam Matematik?', why: T('it is about a single individual and depends on opinion, rather than a measurable variable that differs across a group and can be collected as data', 'ia tentang seorang individu sahaja dan bergantung pada pendapat, bukannya pemboleh ubah yang boleh diukur, berbeza merentas suatu kumpulan dan boleh dikumpul sebagai data') },
    { en: 'Is our school the best school?', ms: 'Adakah sekolah kita sekolah yang terbaik?', why: T('"best" is not clearly defined or measurable; it depends on opinion and unstated criteria', '"terbaik" tidak ditakrifkan atau boleh diukur dengan jelas; ia bergantung pada pendapat dan kriteria yang tidak dinyatakan') },
    { en: 'What colour is nicest?', ms: 'Warna apakah yang paling cantik?', why: T('"nicest" is a matter of personal opinion, not a measurable variable', '"paling cantik" adalah soal pendapat peribadi, bukan pemboleh ubah yang boleh diukur') },
  ];
  const POP_SAMPLE = [
    { en: 'A researcher wants to know the average daily screen time of all 200 Form 5 students in a school, and surveys 40 of them.', ms: 'Seorang penyelidik ingin mengetahui purata masa skrin harian kesemua 200 murid Tingkatan 5 di sebuah sekolah, dan meninjau 40 daripada mereka.', pop: T('all 200 Form 5 students in the school', 'kesemua 200 murid Tingkatan 5 di sekolah itu'), sample: T('the 40 students surveyed', '40 orang murid yang ditinjau'), popN: 200, sampN: 40 },
    { en: 'A quality inspector wants to know the average mass of all 5 000 packets of rice produced in a day, and weighs 50 randomly chosen packets.', ms: 'Seorang pemeriksa kualiti ingin mengetahui purata jisim kesemua 5 000 bungkus beras yang dihasilkan dalam sehari, dan menimbang 50 bungkus yang dipilih secara rawak.', pop: T('all 5 000 packets of rice produced that day', 'kesemua 5 000 bungkus beras yang dihasilkan pada hari itu'), sample: T('the 50 packets weighed', '50 bungkus yang ditimbang'), popN: 5000, sampN: 50 },
    { en: 'A town council wants to know the opinion of all 3 000 residents of a taman about a new park, and interviews 100 of them.', ms: 'Sebuah majlis perbandaran ingin mengetahui pendapat kesemua 3 000 penduduk sebuah taman tentang sebuah taman permainan baharu, dan menemu bual 100 daripada mereka.', pop: T('all 3 000 residents of the taman', 'kesemua 3 000 penduduk taman itu'), sample: T('the 100 residents interviewed', '100 orang penduduk yang ditemu bual'), popN: 3000, sampN: 100 },
  ];
  const COLLECT_CTX = [
    { en: 'measuring the height of every seedling in a nursery', ms: 'mengukur ketinggian setiap anak benih di sebuah tapak semaian', method: T('direct measurement', 'pengukuran langsung'), why: T('height is a physical quantity that can be measured directly', 'ketinggian ialah kuantiti fizikal yang boleh diukur secara langsung') },
    { en: 'finding out how many books each student borrowed last month', ms: 'mengetahui berapa buah buku yang dipinjam setiap murid bulan lepas', method: T('checking library/school records', 'menyemak rekod perpustakaan/sekolah'), why: T('the library already records every loan, so the records give exact counts', 'perpustakaan sudah merekod setiap pinjaman, jadi rekod memberi kiraan yang tepat') },
    { en: "finding out students' favourite subject", ms: 'mengetahui mata pelajaran kegemaran murid', method: T('a questionnaire/survey', 'soal selidik/tinjauan'), why: T('a favourite is an opinion that only the students themselves can give', 'kegemaran ialah pendapat yang hanya boleh diberi oleh murid itu sendiri') },
    { en: 'finding out how many customers enter a shop each hour', ms: 'mengetahui berapa ramai pelanggan memasuki sebuah kedai setiap jam', method: T('observation and counting', 'pemerhatian dan mengira'), why: T('customers can simply be watched and counted as they enter', 'pelanggan boleh diperhatikan dan dikira semasa mereka masuk') },
  ];
  const PROJECT_TERMS = [
    { term: T('statistical question', 'soalan statistik'), def: T('a question that can be answered by collecting data that varies across a group, not a question with a single fixed or opinion-based answer', 'soalan yang boleh dijawab dengan mengumpul data yang berbeza merentas suatu kumpulan, bukan soalan yang mempunyai satu jawapan tetap atau berdasarkan pendapat'), ex: T('e.g. "How many hours do Form 5 students sleep?" (not "Is Ali tired?")', 'cth. "Berapa jam murid Tingkatan 5 tidur?" (bukan "Adakah Ali penat?")') },
    { term: T('population (statistics)', 'populasi (statistik)'), def: T('the entire group being studied in an investigation', 'keseluruhan kumpulan yang dikaji dalam sesuatu inkuiri'), ex: T('e.g. all 200 Form 5 students in a school', 'cth. kesemua 200 murid Tingkatan 5 di sebuah sekolah') },
    { term: T('sample', 'sampel'), def: T('a subset of the population that is actually collected or observed, used to draw conclusions about the whole population', 'sebahagian daripada populasi yang benar-benar dikumpul atau diperhatikan, digunakan untuk membuat kesimpulan tentang keseluruhan populasi'), ex: T('e.g. the 40 of those 200 students who are actually surveyed', 'cth. 40 daripada 200 murid itu yang benar-benar ditinjau') },
    { term: T('variable (statistics)', 'pemboleh ubah (statistik)'), def: T('the characteristic being measured or recorded for each member of the group, such as height or favourite sport', 'ciri yang diukur atau direkodkan bagi setiap ahli kumpulan, seperti ketinggian atau sukan kegemaran'), ex: T('e.g. hours of sleep, or favourite club', 'cth. jam tidur, atau kelab kegemaran') },
    { term: T('sampling bias', 'bias pensampelan'), def: T('when a sample is chosen in a way that makes it unrepresentative of the population, leading to misleading conclusions', 'apabila sampel dipilih dengan cara yang menjadikannya tidak mewakili populasi, membawa kepada kesimpulan yang mengelirukan'), ex: T('e.g. measuring only the basketball team to estimate the average height of all students', 'cth. mengukur pasukan bola keranjang sahaja untuk menganggar purata ketinggian semua murid') },
    { term: T('random sample', 'sampel rawak'), def: T('a sample chosen so that every member of the population has a fair chance of being included, reducing the risk of bias', 'sampel yang dipilih supaya setiap ahli populasi mempunyai peluang yang saksama untuk disertakan, mengurangkan risiko bias'), ex: T('e.g. drawing 40 names at random from the list of all 200 students', 'cth. mencabut 40 nama secara rawak daripada senarai kesemua 200 murid') },
    { term: T('data collection method', 'kaedah pengumpulan data'), def: T('the way data is gathered, such as a survey, observation, measurement or existing records', 'cara data dikumpul, seperti tinjauan, pemerhatian, pengukuran atau rekod sedia ada'), ex: T('e.g. questionnaire, observation, measurement or existing records', 'cth. soal selidik, pemerhatian, pengukuran atau rekod sedia ada') },
  ];
  const GOOD_RULE = T('A statistical question is answered by collecting data that varies across a group.', 'Soalan statistik dijawab dengan mengumpul data yang berbeza merentas suatu kumpulan.');
  const TYPE_RULE = T('Categorical: names or groups. Numerical: numbers, discrete if counted, continuous if measured.', 'Berkategori: nama atau kumpulan. Berangka: nombor, diskret jika dibilang, selanjar jika diukur.');
  const GRAPH_RULE = T('Grouped numerical data → histogram or frequency polygon.', 'Data berangka terkumpul → histogram atau poligon kekerapan.');
  const g74e2 = [
    (r) => {
      const c = r.pick(STAT_Q);
      const w = r.pick([
        [`For the statistical question "${c.en}", state the variable and a suitable way of collecting the data.`, `Bagi soalan statistik "${c.ms}", nyatakan pemboleh ubah dan cara yang sesuai untuk mengumpul data.`],
        [`A statistical investigation asks: "${c.en}" What is the variable, and how could the data be collected?`, `Satu inkuiri statistik bertanya: "${c.ms}" Apakah pemboleh ubahnya, dan bagaimanakah data boleh dikumpul?`],
      ]);
      return { q: T(w[0], w[1]), a: T(`Variable: ${c.var.en}. Collection: ${c.method.en}.`, `Pemboleh ubah: ${c.var.ms}. Pengumpulan: ${c.method.ms}.`), w: W(T(`Variable (what is recorded for each person or item): ${c.var.en}.`, `Pemboleh ubah (apa yang direkod bagi setiap orang atau item): ${c.var.ms}.`), T(`It can be collected by ${c.method.en}.`, `Ia boleh dikumpul melalui ${c.method.ms}.`)), sp: 's' };
    },
    (r) => {
      const ps = r.pick(POP_SAMPLE);
      return { q: T(`${ps.en} Identify the population and the sample in this study.`, `${ps.ms} Kenal pasti populasi dan sampel dalam kajian ini.`), a: T(`Population: ${ps.pop.en}. Sample: ${ps.sample.en}.`, `Populasi: ${ps.pop.ms}. Sampel: ${ps.sample.ms}.`), w: W(T(`Population = the whole group the question is about (${ps.popN}).`, `Populasi = keseluruhan kumpulan yang dikaji (${ps.popN}).`), T(`Sample = the part actually studied (${ps.sampN}).`, `Sampel = bahagian yang benar-benar dikaji (${ps.sampN}).`)), sp: 's' };
    },
    (r) => {
      const c = r.pick(STAT_Q);
      return { q: T(`For the variable "${c.var.en.replace(/\s*\([^)]*\)/, '')}" in the question "${c.en}", is the data categorical or numerical?`, `Bagi pemboleh ubah "${c.var.ms.replace(/\s*\([^)]*\)/, '')}" dalam soalan "${c.ms}", adakah data itu berkategori atau berangka?`), a: c.var, w: TYPE_RULE, sp: 's' };
    },
    (r) => {
      const good = r.pick(STAT_Q), bad = r.pick(BAD_Q);
      const swap = r.chance();
      const pair = swap ? [bad, good] : [good, bad];
      return { q: T(`Which of these is a well-formed statistical question? (A) "${pair[0].en}" (B) "${pair[1].en}"`, `Yang manakah soalan statistik yang terbentuk dengan baik? (A) "${pair[0].ms}" (B) "${pair[1].ms}"`), a: T(pair[0] === good ? '(A)' : '(B)', pair[0] === good ? '(A)' : '(B)'), w: W(GOOD_RULE, T(`"${bad.en}" is not one: ${bad.why.en}.`, `"${bad.ms}" bukan soalan statistik: ${bad.why.ms}.`)), sp: 's' };
    },
    (r) => {
      const c = r.pick(COLLECT_CTX);
      return { q: T(`Which data collection method is most suitable for ${c.en}?`, `Kaedah pengumpulan data manakah yang paling sesuai untuk ${c.ms}?`), a: c.method, w: T(`Because ${c.why.en}.`, `Kerana ${c.why.ms}.`), sp: 's' };
    },
    (r) => {
      const c = r.pick(COLLECT_CTX);
      return { q: T(`Explain briefly why ${c.method.en.toLowerCase()} is a suitable way of ${c.en}.`, `Terangkan secara ringkas mengapa ${c.method.ms.toLowerCase()} merupakan cara yang sesuai untuk ${c.ms}.`), a: T(`It directly gives the exact information needed without relying on estimation or opinion.`, `Ia secara langsung memberikan maklumat tepat yang diperlukan tanpa bergantung pada anggaran atau pendapat.`), w: T(`Here, ${c.why.en}.`, `Di sini, ${c.why.ms}.`), sp: 's' };
    },
    (r) => {
      const c = r.pick(STAT_Q);
      const feats = r.shuffle([
        { t: T('it asks about a measurable variable that varies across a group', 'ia bertanya tentang pemboleh ubah boleh ukur yang berbeza merentas suatu kumpulan'), ok: true },
        { t: T('it can only be answered by one person\'s opinion', 'ia hanya boleh dijawab oleh pendapat seseorang'), ok: false },
        { t: T('it is about a single named individual, not a group', 'ia tentang seorang individu bernama sahaja, bukan suatu kumpulan'), ok: false },
      ]);
      const ci = feats.findIndex((f) => f.ok);
      const L = 'ABC';
      return { q: T(`Which of these is a feature of a good statistical question, such as "${c.en}"? ${feats.map((f, i) => `(${L[i]}) ${f.t.en}`).join(' ')}`, `Yang manakah ciri soalan statistik yang baik, seperti "${c.ms}"? ${feats.map((f, i) => `(${L[i]}) ${f.t.ms}`).join(' ')}`), a: T(`${L[ci]}: ${feats[ci].t.en}`, `${L[ci]}: ${feats[ci].t.ms}`), w: W(GOOD_RULE, T('Opinions or a single individual give no data that varies across a group.', 'Pendapat atau seorang individu tidak memberi data yang berbeza merentas suatu kumpulan.')), sp: 's' };
    },
    (r) => {
      const t = r.pick(PROJECT_TERMS);
      const w = r.pick([[`What is meant by "${t.term.en}"?`, `Apakah yang dimaksudkan dengan "${t.term.ms}"?`], [`Define "${t.term.en}".`, `Takrifkan "${t.term.ms}".`]]);
      return { q: T(w[0], w[1]), a: t.def, w: W(t.ex), sp: 's' };
    },
    (r) => {
      const opts = r.sample(PROJECT_TERMS, 4);
      const ci = r.int(0, 3);
      const correct = opts[ci];
      const L = 'ABCD';
      return { q: T(`Which term matches this description? "${correct.def.en}"<br>${opts.map((o, i) => `(${L[i]}) ${o.term.en}`).join('  ')}`, `Istilah manakah yang sepadan dengan huraian ini? "${correct.def.ms}"<br>${opts.map((o, i) => `(${L[i]}) ${o.term.ms}`).join('  ')}`), a: T(`${L[ci]}: ${correct.term.en}`, `${L[ci]}: ${correct.term.ms}`), w: termW(correct), sp: 's' };
    },
    (r) => {
      const bq = r.pick(BAD_Q), better = r.pick(STAT_Q);
      return { q: T(`Explain why "${bq.en}" is not a good statistical question, and suggest a better one on a similar topic.`, `Terangkan mengapa "${bq.ms}" bukan soalan statistik yang baik, dan cadangkan satu soalan yang lebih baik pada topik yang serupa.`), a: T(`Not good because ${bq.why.en}. A better version asks about a measurable variable across a group, e.g. "${better.en}"`, `Bukan baik kerana ${bq.why.ms}. Versi yang lebih baik bertanya tentang pemboleh ubah yang boleh diukur merentas suatu kumpulan, contohnya "${better.ms}"`), w: W(GOOD_RULE, T(`"${bq.en}": ${bq.why.en}.`, `"${bq.ms}": ${bq.why.ms}.`)), sp: 's' };
    },
    (r) => {
      const c = r.pick(STAT_Q);
      const catType = /categorical/.test(c.var.en) ? T('categorical', 'berkategori') : /discrete/.test(c.var.en) ? T('numerical, discrete', 'berangka, diskret') : T('numerical, continuous', 'berangka, selanjar');
      return { q: T(`Is the variable in "${c.en}" categorical, or numerical (discrete or continuous)?`, `Adakah pemboleh ubah dalam "${c.ms}" berkategori, atau berangka (diskret atau selanjar)?`), a: catType, w: W(TYPE_RULE, T(`Variable: ${c.var.en.replace(/\s*\([^)]*\)/, '')} → ${catType.en}`, `Pemboleh ubah: ${c.var.ms.replace(/\s*\([^)]*\)/, '')} → ${catType.ms}`)), sp: 'xs' };
    },
  ];
  const g74m2 = [
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 5), fs = cl.map(() => r.int(2, 12)), st = gStats(cl, fs);
      const ctx = r.pick(STAT_CTX);
      return { q: T(`A mini-project recorded ${ctx.en}; the grouped data are below.<br>${gt(cl, fs, ['Class', 'Frequency'])}<br>Choose a suitable graph, calculate the mean and standard deviation, and write one sentence describing what they show.`, `Satu projek mini merekod ${ctx.ms}; data terkumpul adalah di bawah.<br>${gt(cl, fs, ['Kelas', 'Kekerapan'])}<br>Pilih graf yang sesuai, hitung min dan sisihan piawai, dan tulis satu ayat yang menerangkan apa yang ditunjukkannya.`), a: T(`Histogram (or frequency polygon); mean ${f2(st.m)}, s.d. ${f2(st.sd)}: the typical value is about ${Math.round(st.m)}, with a spread of about ${Math.round(st.sd)}.`, `Histogram (atau poligon kekerapan); min ${f2(st.m)}, s.p. ${f2(st.sd)}: nilai lazim ialah kira-kira ${Math.round(st.m)}, dengan serakan kira-kira ${Math.round(st.sd)}.`), w: W(GRAPH_RULE, ...statLines(cl, fs).slice(1)), sp: 'xl' };
    },
    (r) => {
      const raw = range(0, 19).map(() => r.int(10, 59));
      const w = r.pick([10]);
      const cl = cls(10, w, 5);
      const fs = cl.map((c) => raw.filter((v) => v >= c[0] && v <= c[1]).length);
      need(fs.every((f) => f >= 1));
      const ctx = r.pick(STAT_CTX);
      return { q: T(`A mini-project collected these raw values for ${ctx.en}: ${raw.join(', ')}. Organise the data into a grouped frequency table with class width ${w}, and choose a suitable graph to represent it.`, `Satu projek mini mengumpul nilai mentah berikut bagi ${ctx.ms}: ${raw.join(', ')}. Susun data ke dalam jadual kekerapan terkumpul dengan lebar kelas ${w}, dan pilih graf yang sesuai untuk mewakilinya.`), a: T(`${cl.map((c, i) => `${c[0]}–${c[1]}: ${fs[i]}`).join(', ')}. A histogram (or frequency polygon) is suitable for this grouped numerical data.`, `${cl.map((c, i) => `${c[0]}–${c[1]}: ${fs[i]}`).join(', ')}. Histogram (atau poligon kekerapan) sesuai bagi data berangka terkumpul ini.`), w: W(...cl.map((c, i) => `${c[0]}–${c[1]}: ${raw.filter((v) => v >= c[0] && v <= c[1]).join(', ')} → ${fs[i]}`), T(`Check: $${fs.join(' + ')} = 20$`, `Semak: $${fs.join(' + ')} = 20$`), GRAPH_RULE), sp: 'l' };
    },
    (r) => {
      const FLAWS = [
        { en: 'To find out the average time Form 5 students spend on homework, a student only surveyed the 10 members of the Mathematics Club.', ms: 'Untuk mengetahui purata masa yang diluangkan murid Tingkatan 5 untuk kerja rumah, seorang murid hanya meninjau 10 orang ahli Kelab Matematik.', flaw: T('the sample only contains students likely to be more studious than average, so it is not representative of all Form 5 students', 'sampel hanya mengandungi murid yang berkemungkinan lebih rajin belajar berbanding purata, jadi ia tidak mewakili semua murid Tingkatan 5'), fix: T('select a random sample of students from across all classes, not from one club', 'pilih sampel rawak murid daripada semua kelas, bukan daripada satu kelab sahaja') },
        { en: 'To find the average height of Form 5 students, a researcher only measured the school basketball team.', ms: 'Untuk mencari purata ketinggian murid Tingkatan 5, seorang penyelidik hanya mengukur pasukan bola keranjang sekolah.', flaw: T('basketball players tend to be taller than average, so the sample is not representative', 'pemain bola keranjang cenderung lebih tinggi daripada purata, jadi sampel itu tidak mewakili'), fix: T('select a random sample of Form 5 students from across the whole school', 'pilih sampel rawak murid Tingkatan 5 daripada seluruh sekolah') },
        { en: 'To find out how satisfied residents are with a new park, a council only interviewed people at the park on a sunny afternoon.', ms: 'Untuk mengetahui tahap kepuasan penduduk terhadap sebuah taman permainan baharu, sebuah majlis hanya menemu bual orang di taman itu pada suatu petang yang cerah.', flaw: T('only people who already chose to visit the park were interviewed, so residents who never visit (and might be dissatisfied) are excluded', 'hanya orang yang sudah memilih untuk melawat taman itu ditemu bual, jadi penduduk yang tidak pernah melawat (dan mungkin tidak berpuas hati) tidak disertakan'), fix: T('survey a random sample of residents from the whole neighbourhood, not only park visitors', 'tinjau sampel rawak penduduk daripada seluruh kawasan kejiranan, bukan hanya pelawat taman') },
      ];
      const f = r.pick(FLAWS);
      return { q: T(`"${f.en}" Identify the sampling problem with this study, and suggest an improvement.`, `"${f.ms}" Kenal pasti masalah pensampelan kajian ini, dan cadangkan penambahbaikan.`), a: T(`Problem: ${f.flaw.en}. Improvement: ${f.fix.en}.`, `Masalah: ${f.flaw.ms}. Penambahbaikan: ${f.fix.ms}.`), w: W(T('Ask: could every member of the population have been chosen?', 'Tanya: adakah setiap ahli populasi berpeluang dipilih?'), T('Here only one special group was used, so the sample is biased; a random sample removes this.', 'Di sini hanya satu kumpulan khas digunakan, jadi sampel itu berat sebelah; sampel rawak menghapuskan masalah ini.')), sp: 'm' };
    },
    (r) => {
      const goal = r.pick([
        { en: 'show the overall shape of a single distribution (e.g. peaked, skewed)', ms: 'menunjukkan bentuk keseluruhan satu taburan (contohnya berpuncak, condong)', ans: T('a histogram or a frequency polygon', 'histogram atau poligon kekerapan'), why: T('the bar heights or vertices show where the data is concentrated', 'tinggi bar atau bucu menunjukkan di mana data tertumpu') },
        { en: 'compare the spread and skewness of two data sets side by side, using their five-number summaries', ms: 'membandingkan serakan dan kepencongan dua set data secara bersebelahan, menggunakan ringkasan lima nombor mereka', ans: T('grouped box plots', 'plot kotak terkumpul'), why: T('a box plot is drawn directly from the five-number summary', 'plot kotak dilukis terus daripada ringkasan lima nombor') },
        { en: 'estimate the median, quartiles and percentiles of a data set', ms: 'menganggarkan median, kuartil dan persentil bagi satu set data', ans: T('an ogive (cumulative frequency curve)', 'ogif (lengkung kekerapan longgokan)'), why: T('quartiles and percentiles are read at cumulative-frequency positions', 'kuartil dan persentil dibaca pada kedudukan kekerapan longgokan') },
        { en: 'compare two distributions overlaid on the same axes', ms: 'membandingkan dua taburan yang dilapiskan pada paksi yang sama', ans: T('two frequency polygons on the same axes', 'dua poligon kekerapan pada paksi yang sama'), why: T('polygons are lines, so two can be overlaid without hiding each other', 'poligon ialah garis, jadi dua poligon boleh dilapiskan tanpa melindungi satu sama lain') },
      ]);
      return { q: T(`Which representation would be most suitable to ${goal.en}?`, `Perwakilan manakah yang paling sesuai untuk ${goal.ms}?`), a: goal.ans, w: T(`Because ${goal.why.en}.`, `Kerana ${goal.why.ms}.`), sp: 'm' };
    },
    (r) => {
      const t1 = r.pick(PROJECT_TERMS), t2 = r.pick(PROJECT_TERMS.filter((t) => t.term.en !== t1.term.en));
      return { q: T(`Explain the difference between "${t1.term.en}" and "${t2.term.en}".`, `Terangkan perbezaan antara "${t1.term.ms}" dengan "${t2.term.ms}".`), a: T(`${t1.term.en}: ${t1.def.en}. ${t2.term.en}: ${t2.def.en}.`, `${t1.term.ms}: ${t1.def.ms}. ${t2.term.ms}: ${t2.def.ms}.`), w: W(T(`${t1.term.en}: ${t1.ex.en}`, `${t1.term.ms}: ${t1.ex.ms}`), T(`${t2.term.en}: ${t2.ex.en}`, `${t2.term.ms}: ${t2.ex.ms}`)), sp: 'm' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 4), fsA = cl.map(() => r.int(3, 12)), fsB = cl.map(() => r.int(3, 12));
      const A = gStats(cl, fsA), B = gStats(cl, fsB);
      const claim = A.m > B.m ? T(`Class A has a higher mean, so every student in Class A scored higher than every student in Class B.`, `Kelas A mempunyai min lebih tinggi, jadi setiap murid Kelas A mendapat markah lebih tinggi daripada setiap murid Kelas B.`) : T(`Class B has a higher mean, so every student in Class B scored higher than every student in Class A.`, `Kelas B mempunyai min lebih tinggi, jadi setiap murid Kelas B mendapat markah lebih tinggi daripada setiap murid Kelas A.`);
      return { q: T(`Class $A$ frequencies: ${fsA.join(', ')}. Class $B$ frequencies: ${fsB.join(', ')} (same classes ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}). A report concludes: "${claim.en}" Is this conclusion supported by the data? Explain.`, `Kekerapan Kelas $A$: ${fsA.join(', ')}. Kekerapan Kelas $B$: ${fsB.join(', ')} (kelas yang sama ${cl.map((c) => `${c[0]}–${c[1]}`).join(', ')}). Satu laporan membuat kesimpulan: "${claim.ms}" Adakah kesimpulan ini disokong oleh data? Terangkan.`), a: T('No: a higher mean only means the average is higher, not that every individual score is higher. There can be overlap between the two distributions, and the spread (standard deviation) also matters.', 'Tidak: min yang lebih tinggi hanya bermaksud puratanya lebih tinggi, bukan setiap markah individu lebih tinggi. Mungkin terdapat pertindihan antara kedua-dua taburan, dan serakan (sisihan piawai) juga penting.'), w: W(meanLine(cl, fsA, '$A$: '), meanLine(cl, fsB, '$B$: '), T(`But both classes have students in every interval, e.g. ${cl[0][0]}–${cl[0][1]}: ${fsA[0]} in $A$ and ${fsB[0]} in $B$, and ${cl[3][0]}–${cl[3][1]}: ${fsA[3]} in $A$ and ${fsB[3]} in $B$, so the scores overlap.`, `Tetapi kedua-dua kelas mempunyai murid dalam setiap selang, cth. ${cl[0][0]}–${cl[0][1]}: ${fsA[0]} dalam $A$ dan ${fsB[0]} dalam $B$, dan ${cl[3][0]}–${cl[3][1]}: ${fsA[3]} dalam $A$ dan ${fsB[3]} dalam $B$, jadi markahnya bertindih.`)), sp: 'm' };
    },
    (r) => {
      const c = r.pick(STAT_Q);
      return { q: T(`For the statistical question "${c.en}", state (a) a suitable sample (not the full population) and why it might be chosen, (b) one possible source of bias in how the sample could be collected.`, `Bagi soalan statistik "${c.ms}", nyatakan (a) satu sampel yang sesuai (bukan keseluruhan populasi) dan sebab ia mungkin dipilih, (b) satu kemungkinan punca bias dalam cara sampel itu boleh dikumpul.`), a: T(`(a) A random sample of students across different classes/forms, chosen because collecting data from the entire population is often impractical. (b) Possible bias: only surveying students who are easy to reach (e.g. one class, one friend group), which may not represent the whole population.`, `(a) Sampel rawak murid merentas kelas/tingkatan yang berbeza, dipilih kerana mengumpul data daripada keseluruhan populasi selalunya tidak praktikal. (b) Kemungkinan bias: hanya meninjau murid yang mudah dihubungi (contohnya satu kelas, satu kumpulan rakan), yang mungkin tidak mewakili keseluruhan populasi.`), w: W(T('(a) A random sample spread across the population is practical and representative.', '(a) Sampel rawak yang merentas populasi adalah praktikal dan mewakili.'), T('(b) Bias arises when some groups are more likely to be chosen than others.', '(b) Bias berlaku apabila sesetengah kumpulan lebih berkemungkinan dipilih berbanding yang lain.')), sp: 'm' };
    },
    (r) => {
      const ps = r.pick(POP_SAMPLE);
      const pct = round((ps.sampN / ps.popN) * 100, 1);
      return { q: T(`${ps.en} What percentage of the population does this sample represent?`, `${ps.ms} Berapa peratuskah sampel ini mewakili populasi?`), a: T(`${n(pct)}%`), w: T(`$\\dfrac{${ps.sampN}}{${ps.popN}} \\times 100\\%$`, `$\\dfrac{${ps.sampN}}{${ps.popN}} \\times 100\\%$`), sp: 's' };
    },
  ];
  const g74a2 = [
    (r) => {
      const q = r.pick([
        T('Is there a difference in the mean time taken to travel to school between boys and girls in Form 5?', 'Adakah terdapat perbezaan dalam min masa perjalanan ke sekolah antara murid lelaki dengan murid perempuan Tingkatan 5?'),
        T('Do students who play a sport regularly sleep more than students who do not?', 'Adakah murid yang bermain sukan secara kerap tidur lebih lama berbanding murid yang tidak bermain sukan?'),
        T('Is there a difference in the amount of pocket money spent by Form 4 and Form 5 students in a week?', 'Adakah terdapat perbezaan dalam jumlah wang saku yang dibelanjakan oleh murid Tingkatan 4 dan Tingkatan 5 dalam seminggu?'),
      ]);
      return { q: T(`Describe the steps of a full statistical investigation for the question "${q.en}" Justify your choice of sample, graphs and measures.`, `Huraikan langkah-langkah satu inkuiri statistik lengkap bagi soalan "${q.ms}" Justifikasikan pilihan sampel, graf dan ukuran anda.`), a: T('1 Formulate the question and identify the variable(s). 2 Choose a random sample from each group across the school. 3 Collect the data with a short, clear questionnaire or measurement. 4 Organise into equal class intervals. 5 Draw two frequency polygons or grouped box plots on the same scale. 6 Compare the means/medians and standard deviations/IQRs. 7 Conclude within the limits of the sample and communicate the findings with the graphs.', '1 Rumuskan soalan dan kenal pasti pemboleh ubah. 2 Pilih sampel rawak daripada setiap kumpulan merentas sekolah. 3 Kumpulkan data dengan soal selidik atau pengukuran yang ringkas dan jelas. 4 Susun ke dalam selang kelas yang sama. 5 Lukis dua poligon kekerapan atau plot kotak terkumpul pada skala yang sama. 6 Bandingkan min/median dan sisihan piawai/JAK. 7 Buat kesimpulan dalam had sampel dan komunikasikan dapatan dengan graf.'), w: W(T('Order: question → sample → collect → organise → represent → analyse → conclude.', 'Susunan: soalan → sampel → kumpul → susun → wakilkan → analisis → kesimpulan.'), T('Comparing two groups needs the same scale, a measure of centre (mean/median) and a measure of spread (s.d./IQR).', 'Membandingkan dua kumpulan memerlukan skala yang sama, ukuran kecenderungan memusat (min/median) dan ukuran serakan (s.p./JAK).')), sp: 'xxl' };
    },
    (r) => {
      const stage = r.pick([
        { en: 'A student wants to know if students at his school do more exercise than the national average. He asks 5 of his closest friends how many hours they exercise a week, calculates the mean, and concludes that his whole school exercises more than the national average.', ms: 'Seorang murid ingin mengetahui sama ada murid di sekolahnya bersenam lebih banyak berbanding purata kebangsaan. Dia bertanya kepada 5 orang rakan karibnya berapa jam mereka bersenam seminggu, mengira min, dan membuat kesimpulan bahawa seluruh sekolahnya bersenam lebih banyak berbanding purata kebangsaan.', flaws: T('the sample (5 close friends) is tiny and likely biased (friends often have similar habits), and a conclusion about the whole school cannot be drawn from such an unrepresentative sample', 'sampel (5 orang rakan karib) sangat kecil dan berkemungkinan berat sebelah (rakan selalunya mempunyai tabiat yang serupa), dan kesimpulan tentang keseluruhan sekolah tidak boleh dibuat daripada sampel yang tidak mewakili ini') },
        { en: "A student investigates students' spending habits by standing outside the school canteen during recess and asking whoever walks past how much they spent that day, stopping once she has 15 answers.", ms: 'Seorang murid mengkaji tabiat perbelanjaan murid dengan berdiri di luar kantin sekolah semasa waktu rehat dan bertanya kepada sesiapa sahaja yang lalu berapa banyak yang mereka belanjakan hari itu, berhenti setelah mendapat 15 jawapan.', flaws: T('the sample only includes students who go to the canteen (excluding those who bring their own food or do not spend money that day), and a sample of just 15 collected this way is too small and not randomly chosen', 'sampel hanya merangkumi murid yang pergi ke kantin (mengecualikan mereka yang membawa makanan sendiri atau tidak berbelanja pada hari itu), dan sampel sekecil 15 yang dikumpul dengan cara ini terlalu kecil dan tidak dipilih secara rawak') },
        { en: 'To compare Form 4 and Form 5 test scores, a teacher used every Form 5 student\'s score but only the top 10 scores from Form 4, then compared the two means.', ms: 'Untuk membandingkan markah ujian Tingkatan 4 dan Tingkatan 5, seorang guru menggunakan markah setiap murid Tingkatan 5 tetapi hanya 10 markah teratas daripada Tingkatan 4, kemudian membandingkan kedua-dua min.', flaws: T('the Form 4 sample is not representative because only the highest scores were chosen, which unfairly inflates the Form 4 mean compared with the complete Form 5 data', 'sampel Tingkatan 4 tidak mewakili kerana hanya markah tertinggi dipilih, yang secara tidak adil meningkatkan min Tingkatan 4 berbanding data Tingkatan 5 yang lengkap') },
      ]);
      return { q: T(`Critique this mini-project. "${stage.en}" Identify at least two weaknesses in the sampling or the conclusion, and suggest how the investigation should be redesigned.`, `Kritik projek mini ini. "${stage.ms}" Kenal pasti sekurang-kurangnya dua kelemahan dalam pensampelan atau kesimpulan, dan cadangkan bagaimana inkuiri itu patut direka semula.`), a: T(`Weaknesses: ${stage.flaws.en}. Redesign: select a large random sample across all classes and year groups in the school, collect the data consistently, and only generalise the conclusion to the population actually sampled.`, `Kelemahan: ${stage.flaws.ms}. Reka semula: pilih sampel rawak yang besar merentas semua kelas dan peringkat di sekolah, kumpulkan data secara konsisten, dan hanya buat kesimpulan am kepada populasi yang benar-benar disampel.`), w: W(T('Check the sample: is it large enough, random and representative?', 'Semak sampel: adakah ia cukup besar, rawak dan mewakili?'), T('Check the conclusion: is it limited to the population the sample represents?', 'Semak kesimpulan: adakah ia terhad kepada populasi yang diwakili oleh sampel?')), sp: 'l' };
    },
    (r) => {
      const a = { n: r.pick([10, 15]), method: T('surveyed only his own classmates', 'hanya meninjau rakan sekelasnya sendiri') };
      const b = { n: r.pick([80, 100]), method: T('surveyed a random sample of students from every class in every form', 'meninjau sampel rawak murid daripada setiap kelas dalam setiap tingkatan') };
      return { q: T(`Two students investigated the same statistical question about the whole school. Student $X$ used a sample of ${a.n} and ${a.method.en}. Student $Y$ used a sample of ${b.n} and ${b.method.en}. Whose conclusion is likely to be more reliable, and why? Is a larger sample alone enough to guarantee reliability?`, `Dua orang murid mengkaji soalan statistik yang sama tentang keseluruhan sekolah. Murid $X$ menggunakan sampel seramai ${a.n} dan ${a.method.ms}. Murid $Y$ menggunakan sampel seramai ${b.n} dan ${b.method.ms}. Kesimpulan siapakah yang berkemungkinan lebih boleh dipercayai, dan mengapa? Adakah sampel yang lebih besar sahaja mencukupi untuk menjamin kebolehpercayaan?`), a: T(`Student $Y$'s conclusion is likely more reliable, mainly because the sample is drawn randomly across the whole school (more representative), not just because it is larger. Even a large sample, if it is drawn only from one class as Student $X$ did, would still give a misleading conclusion; both sample size and how the sample is chosen matter.`, `Kesimpulan Murid $Y$ berkemungkinan lebih boleh dipercayai, terutamanya kerana sampelnya diambil secara rawak merentas seluruh sekolah (lebih mewakili), bukan semata-mata kerana ia lebih besar. Sampel yang besar sekalipun, jika diambil daripada satu kelas sahaja seperti yang dilakukan oleh Murid $X$, masih akan memberikan kesimpulan yang mengelirukan; kedua-dua saiz sampel dan cara sampel dipilih adalah penting.`), w: W(T(`$X$: ${a.n} students from one class only → not representative of the school.`, `$X$: ${a.n} murid daripada satu kelas sahaja → tidak mewakili sekolah.`), T(`$Y$: ${b.n} students chosen at random from every class → representative.`, `$Y$: ${b.n} murid dipilih secara rawak daripada setiap kelas → mewakili.`), T('How the sample is chosen matters as much as its size.', 'Cara sampel dipilih sama penting dengan saiznya.')), sp: 'l' };
    },
    (r) => {
      const cl = cls(r.pick([0, 10]), 10, 5), fs = cl.map(() => r.int(2, 12)), st = gStats(cl, fs);
      const ctx = r.pick(STAT_CTX);
      const parts = SPM.parts([
        T('State a suitable statistical question that this grouped data could answer.', 'Nyatakan satu soalan statistik yang sesuai yang boleh dijawab oleh data terkumpul ini.'),
        T('Calculate the mean and standard deviation.', 'Hitung min dan sisihan piawai.'),
        T('Write a contextual conclusion, and state one limitation of this data (e.g. sample size or how it was collected).', 'Tulis satu kesimpulan mengikut konteks, dan nyatakan satu had data ini (contohnya saiz sampel atau cara ia dikumpul).'),
      ]);
      const ansParts = SPM.parts([
        T(`e.g. "What is the typical ${ctx.en.replace(/^the\s+/, '')}?"`, `contohnya "Apakah ${ctx.ms} yang lazim?"`),
        T(`Mean ${f2(st.m)}, s.d. ${f2(st.sd)}.`, `Min ${f2(st.m)}, s.p. ${f2(st.sd)}.`),
        T(`Typical value about ${Math.round(st.m)}, spread about ${Math.round(st.sd)}. Limitation: the conclusion only applies to the sample collected (size ${st.N}) and may not generalise if the sample was not random.`, `Nilai lazim kira-kira ${Math.round(st.m)}, serakan kira-kira ${Math.round(st.sd)}. Had: kesimpulan hanya terpakai kepada sampel yang dikumpul (saiz ${st.N}) dan mungkin tidak boleh digeneralisasikan jika sampel itu tidak rawak.`),
      ]);
      return { q: T(`A mini-project recorded ${ctx.en}.<br>${gt(cl, fs, ['Class', 'Frequency'])}<br>${parts.en}`, `Satu projek mini merekod ${ctx.ms}.<br>${gt(cl, fs, ['Kelas', 'Kekerapan'])}<br>${parts.ms}`), a: T(ansParts.en, ansParts.ms), w: W(T('(a) The table records one numerical variable, so ask about its typical value or spread across the group.', '(a) Jadual merekod satu pemboleh ubah berangka, jadi tanya tentang nilai lazim atau serakannya merentas kumpulan.'), T('(b)', '(b)'), ...statLines(cl, fs), T(`(c) Sample size $\\sum f = ${st.N}$, so generalise with care.`, `(c) Saiz sampel $\\sum f = ${st.N}$, jadi buat generalisasi dengan berhati-hati.`)), sp: 'xl' };
    },
    (r) => {
      const bq = r.pick(BAD_Q), gq = r.pick(STAT_Q);
      return { q: T(`A mini-project begins with the question "${bq.en}" (a) Explain why this is not a workable statistical question. (b) Rewrite it as a proper statistical question in the same general topic, in the style of "${gq.en}", stating the variable and a suitable sample. (c) Explain how you would judge, at the end of the project, whether your conclusion actually answers your rewritten question.`, `Satu projek mini bermula dengan soalan "${bq.ms}" (a) Terangkan mengapa ini bukan soalan statistik yang boleh dikerjakan. (b) Tulis semula sebagai soalan statistik yang betul pada topik umum yang sama, mengikut gaya "${gq.ms}", dengan menyatakan pemboleh ubah dan sampel yang sesuai. (c) Terangkan bagaimana anda akan menilai, pada akhir projek, sama ada kesimpulan anda benar-benar menjawab soalan yang ditulis semula itu.`), a: T(`(a) ${bq.why.en}. (b) A rewritten question in the same style: "${gq.en}" with variable ${gq.var.en}, collected from a random sample using ${gq.method.en}. (c) Check that the calculated measures (mean, spread, or comparison) directly address what the rewritten question asked, and that the sample was large and representative enough to support generalising the conclusion.`, `(a) ${bq.why.ms}. (b) Soalan yang ditulis semula dalam gaya yang sama: "${gq.ms}" dengan pemboleh ubah ${gq.var.ms}, dikumpul daripada sampel rawak menggunakan ${gq.method.ms}. (c) Semak bahawa ukuran yang dikira (min, serakan, atau perbandingan) menjawab secara langsung apa yang ditanya oleh soalan yang ditulis semula, dan bahawa sampel itu cukup besar dan mewakili untuk menyokong penggeneralisasian kesimpulan.`), w: W(GOOD_RULE, T(`(b) Variable: ${gq.var.en}; method: ${gq.method.en}.`, `(b) Pemboleh ubah: ${gq.var.ms}; kaedah: ${gq.method.ms}.`), T('(c) The conclusion must be about the variable named in the question, using data from a representative sample.', '(c) Kesimpulan mesti tentang pemboleh ubah yang dinamakan dalam soalan, menggunakan data daripada sampel yang mewakili.')), sp: 'xl' };
    },
    (r) => {
      const t1 = r.pick(PROJECT_TERMS), t2 = r.pick(PROJECT_TERMS.filter((t) => t.term.en !== t1.term.en));
      const ps = r.pick(POP_SAMPLE);
      return { q: T(`${ps.en} Using this example, explain the difference between "${t1.term.en}" and "${t2.term.en}", and why the distinction matters for how far a conclusion can be generalised.`, `${ps.ms} Dengan menggunakan contoh ini, terangkan perbezaan antara "${t1.term.ms}" dengan "${t2.term.ms}", dan mengapa perbezaan ini penting bagi sejauh mana sesuatu kesimpulan boleh digeneralisasikan.`), a: T(`${t1.term.en}: ${t1.def.en}. ${t2.term.en}: ${t2.def.en}. Here, the population is ${ps.pop.en} and the sample is ${ps.sample.en}; conclusions are only directly valid for the sample and can only be generalised to the population if the sample is representative.`, `${t1.term.ms}: ${t1.def.ms}. ${t2.term.ms}: ${t2.def.ms}. Di sini, populasi ialah ${ps.pop.ms} dan sampel ialah ${ps.sample.ms}; kesimpulan hanya sah secara langsung untuk sampel dan hanya boleh digeneralisasikan kepada populasi jika sampel itu mewakili.`), w: W(T(`Population: ${ps.pop.en} (${ps.popN}); sample: ${ps.sample.en} (${ps.sampN}).`, `Populasi: ${ps.pop.ms} (${ps.popN}); sampel: ${ps.sample.ms} (${ps.sampN}).`), T(`The sample is only $\\dfrac{${ps.sampN}}{${ps.popN}} \\times 100\\% = ${n(round((ps.sampN / ps.popN) * 100, 2))}\\%$ of the population.`, `Sampel hanya $\\dfrac{${ps.sampN}}{${ps.popN}} \\times 100\\% = ${n(round((ps.sampN / ps.popN) * 100, 2))}\\%$ daripada populasi.`)), sp: 'l' };
    },
  ];
  SPM.extend('F5-7.4', { e: g74e2, m: g74m2, a: g74a2 });
})();
