/* Variety pack x1f: Form 1 Ch 9 (Basic Polygons) and Ch 10 (Perimeter and Area). See tools/PACKS.md. */
(function () {
  'use strict';
  const SPM = window.SPM;
  const { n, need, round, lin, gcd } = SPM;
  const T = SPM.L, S = SPM.svg, F = SPM.figs;
  const NTS = SPM.NTS;
  const nts = (q) => T(q.en + ' ' + NTS.en, q.ms + ' ' + NTS.ms);
  /* fill "{key}" placeholders: Q([en, ms], valuesEn, valuesMs) */
  const fill = (s, o) => s.replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m));
  const Q = (p, oe, om) => T(fill(p[0], oe), fill(p[1], om || oe));
  const AN = (w) => (/^[aeiou]/.test(w) ? 'an ' : 'a ') + w;
  const LS = ['ABCDEFGHJK', 'PQRSTUVWXY', 'KLMNPQRSTU'];
  const PNM = ['', '', '', 'triangle', 'quadrilateral', 'pentagon', 'hexagon', 'heptagon', 'octagon', 'nonagon', 'decagon'];
  const PMS = ['', '', '', 'segi tiga', 'sisi empat', 'pentagon', 'heksagon', 'heptagon', 'oktagon', 'nonagon', 'dekagon'];
  const pnT = (k) => T(PNM[k], PMS[k]);
  const dT = (k) => (k * (k - 3)) / 2;
  const mx = (s) => `$${s}$`;
  const mc = (r, opts) => { // opts: [{t:T, ok:bool}] -> shuffled MCQ { txt:T, ans:T }
    const o = r.shuffle(opts), L = 'ABCD';
    const i = o.findIndex((x) => x.ok);
    return { en: o.map((x, j) => `(${L[j]}) ${x.t.en}`).join(' &nbsp; '), ms: o.map((x, j) => `(${L[j]}) ${x.t.ms}`).join(' &nbsp; '), ans: T(`(${L[i]}) ${o[i].t.en}`, `(${L[i]}) ${o[i].t.ms}`) };
  };
  const lt = (x) => T(x, x);
  const nrep = (a) => n(round(a, 4));
  const CM2 = '\\ \\text{cm}^2', M2 = '\\ \\text{m}^2';
  /* ================= F1-9.1 Polygons ================= */
  const cvx = (P) => {
    let s = 0;
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], c = P[(i + 2) % P.length];
      const z = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
      if (Math.abs(z) < 1e-6) return false;
      if (!s) s = Math.sign(z); else if (Math.sign(z) !== s) return false;
    }
    return true;
  };
  /** convex polygon figure, vertices go anticlockwise on the page; o = {reg, names, diag:[[i,j]…], w, h} */
  function pfig(r, k, o) {
    o = o || {};
    const a0 = (r.int(0, 71) * 5 * Math.PI) / 180;
    const pts = Array.from({ length: k }, (_, i) => {
      const a = a0 + (2 * Math.PI * i) / k + (o.reg ? 0 : (r.next() - 0.5) * 0.35), rr = o.reg ? 1 : 0.8 + 0.3 * r.next();
      return [rr * Math.cos(a), -rr * Math.sin(a)];
    });
    need(cvx(pts));
    return F.polygon({ pts, names: o.names, w: o.w || 230, h: o.h || 190, extra: o.diag && ((P) => o.diag.map(([i, j]) => S.line(P[i][0], P[i][1], P[j][0], P[j][1], { dash: true })).join('')) });
  }
  const vn = (r, k) => r.pick(LS).slice(0, k).split('');
  const walk = (N, s, dir) => N.map((_, i) => N[(((s + dir * i) % N.length) + N.length) % N.length]); // dir +1 = anticlockwise in figures
  const sidesOf = (N) => N.map((v, i) => v + N[(i + 1) % N.length]);
  const diagFrom = (N, s) => N.filter((_, j) => j !== s && j !== (s + 1) % N.length && j !== (s + N.length - 1) % N.length).map((v) => N[s] + v);
  const DIRS = [[T('anticlockwise', 'melawan arah jam'), 1], [T('clockwise', 'ikut arah jam'), -1]];
  const TF = (ok, reasonEn, reasonMs) => (ok ? T('True', 'Benar') : T('False. ' + reasonEn, 'Palsu. ' + reasonMs));
  const STM = [
    ['A polygon is a closed shape whose sides are all straight lines.', 'Poligon ialah bentuk tertutup yang semua sisinya garis lurus.', 1],
    ['A circle is a polygon.', 'Bulatan ialah sebuah poligon.', 0, 'A circle has no straight sides.', 'Bulatan tidak mempunyai sisi lurus.'],
    ['A polygon can have only two sides.', 'Sebuah poligon boleh mempunyai dua sisi sahaja.', 0, 'A polygon has at least three sides.', 'Sebuah poligon mempunyai sekurang-kurangnya tiga sisi.'],
    ['The number of vertices of a polygon always equals its number of sides.', 'Bilangan bucu sebuah poligon sentiasa sama dengan bilangan sisinya.', 1],
    ['A triangle has no diagonals.', 'Segi tiga tidak mempunyai pepenjuru.', 1],
    ['Every polygon has at least one diagonal.', 'Setiap poligon mempunyai sekurang-kurangnya satu pepenjuru.', 0, 'A triangle has no diagonals.', 'Segi tiga tidak mempunyai pepenjuru.'],
    ['A shape with one curved side is not a polygon.', 'Bentuk yang mempunyai satu sisi melengkung bukan poligon.', 1],
    ['From one vertex of an $n$-sided polygon, $n - 3$ diagonals can be drawn.', 'Dari satu bucu poligon $n$ sisi, $n - 3$ pepenjuru boleh dilukis.', 1],
    ['A quadrilateral has exactly two diagonals.', 'Sisi empat mempunyai tepat dua pepenjuru.', 1],
    ['The polygon $PQRS$ can also be named $SRQP$.', 'Poligon $PQRS$ juga boleh dinamakan $SRQP$.', 1],
    ['The polygon $ABCD$ can also be named $CDAB$.', 'Poligon $ABCD$ juga boleh dinamakan $CDAB$.', 1],
  ];
  const NONP = [T('a circle', 'bulatan'), T('an oval', 'bujur'), T('a semicircle', 'separuh bulatan'), T('an open zigzag line', 'garis zigzag terbuka'), T('a closed shape with one curved side', 'bentuk tertutup dengan satu sisi melengkung'), T('a crescent', 'bulan sabit')];
  const COLS = [
    ['Sides', 'Sisi', (k) => k, (k) => k], ['Vertices', 'Bucu', (k) => k, (k) => k],
    ['Diagonals from one vertex', 'Pepenjuru dari satu bucu', (k) => k - 3, (k) => k - 3],
    ['Total number of diagonals', 'Jumlah pepenjuru', dT, dT], ['Name', 'Nama', (k) => PNM[k], (k) => PMS[k]],
  ];
  const CTX91 = [
    ['A garden is in the shape of {an}. A lamp post stands at each corner and a cable is to join every pair of lamp posts that are not next to each other.', 'Sebuah taman berbentuk {name}. Sebatang tiang lampu berdiri di setiap sudut dan kabel akan menyambungkan setiap pasangan tiang lampu yang tidak bersebelahan.', 'How many cables are needed?', 'Berapakah bilangan kabel yang diperlukan?'],
    ['A stage is in the shape of {an}. A spotlight is fixed at each vertex and a string of lights runs along every diagonal.', 'Sebuah pentas berbentuk {name}. Sebuah lampu sorot dipasang pada setiap bucu dan seutas lampu hiasan dipasang di sepanjang setiap pepenjuru.', 'How many strings of lights are used?', 'Berapakah bilangan lampu hiasan yang digunakan?'],
    ['A tiled floor is in the shape of {an}. A worker draws a chalk line between every two vertices that are not neighbours.', 'Lantai berjubin berbentuk {name}. Seorang pekerja melukis garisan kapur antara setiap dua bucu yang tidak berjiran.', 'How many chalk lines does he draw?', 'Berapakah bilangan garisan kapur yang dilukisnya?'],
  ];
  const PART91 = { sides: [T('Find the number of sides of the polygon.', 'Cari bilangan sisi poligon itu.'), (k) => `${k}`], vert: [T('How many vertices does it have?', 'Berapakah bilangan bucunya?'), (k) => `${k}`], d1: [T('How many diagonals can be drawn from one vertex?', 'Berapakah bilangan pepenjuru yang boleh dilukis dari satu bucu?'), (k) => `${k - 3}`], name: [T('Name the polygon.', 'Namakan poligon itu.'), null] };

  const e91 = [
    (r) => {
      const k = r.int(3, 10);
      return { q: Q(r.pick([
        ['Name the polygon that has {k} sides.', 'Namakan poligon yang mempunyai {k} sisi.'],
        ['A polygon has {k} vertices. What is its name?', 'Sebuah poligon mempunyai {k} bucu. Apakah namanya?'],
        ['What is the special name for a polygon with {k} angles?', 'Apakah nama khas bagi poligon yang mempunyai {k} sudut?'],
        ['A closed shape is made of {k} straight sides. Write the name of the shape.', 'Satu bentuk tertutup dibina daripada {k} sisi lurus. Tulis nama bentuk itu.'],
      ]), { k }), a: pnT(k), sp: 'xs' };
    },
    (r) => {
      const k = r.int(3, 10), p = r.pick([['sides', 'sisi'], ['vertices', 'bucu'], ['interior angles', 'sudut pedalaman']]);
      return { q: Q(r.pick([['How many {p} does {an} have?', 'Berapakah bilangan {p} bagi {nm}?'], ['Write down the number of {p} of {an}.', 'Tulis bilangan {p} bagi {nm}.']]), { p: p[0], an: AN(PNM[k]) }, { p: p[1], nm: PMS[k] }), a: T(`${k}`), sp: 'xs' };
    },
    (r) => {
      const k = r.int(3, 9), reg = r.chance(), fig = pfig(r, k, { reg });
      const p = r.pick([
        ['Name the polygon shown.', 'Namakan poligon yang ditunjukkan.', 0], ['Write the name of the polygon in the diagram.', 'Tulis nama poligon dalam rajah itu.', 0],
        ['Count the sides of the polygon shown and write its name.', 'Kira bilangan sisi poligon yang ditunjukkan dan tulis namanya.', 1],
        ['State the number of vertices of the polygon shown and name it.', 'Nyatakan bilangan bucu poligon yang ditunjukkan dan namakannya.', 2],
      ]);
      return { q: T(p[0], p[1]), fig, a: p[2] ? T(`${k} ${p[2] === 1 ? 'sides' : 'vertices'}, ${PNM[k]}`, `${k} ${p[2] === 1 ? 'sisi' : 'bucu'}, ${PMS[k]}`) : pnT(k), sp: 'xs' };
    },
    (r) => {
      const k = r.int(4, 7), N = vn(r, k), s = r.int(0, k - 1), [dn, dd] = r.pick(DIRS);
      const fig = pfig(r, k, { names: N });
      const v = mx(N[s]);
      return { q: Q(r.pick([
        ['Write a name for the polygon shown, beginning at vertex {v} and going {d} round the polygon.', 'Tulis satu nama bagi poligon yang ditunjukkan, bermula dari bucu {v} dan bergerak {d} mengelilingi poligon itu.'],
        ['Starting at vertex {v} and moving {d}, name the polygon by listing its vertices in order.', 'Bermula dari bucu {v} dan bergerak {d}, namakan poligon itu dengan menyenaraikan bucunya mengikut susunan.'],
      ]), { v, d: dn.en }, { v, d: dn.ms }), fig, a: T(mx(walk(N, s, dd).join(''))), sp: 's' };
    },
    (r) => {
      const poly = r.chance(), pk = r.int(3, 10), NP = r.sample(NONP, poly ? 3 : 1);
      const P3 = r.sample([3, 4, 5, 6, 7, 8, 9, 10], 3);
      const opts = poly ? [{ t: T(AN(PNM[pk]), PMS[pk]), ok: true }, ...NP.map((x) => ({ t: x, ok: false }))] : [...P3.map((x) => ({ t: T(AN(PNM[x]), PMS[x]), ok: false })), { t: NP[0], ok: true }];
      const m = mc(r, opts);
      return { q: T(`Which of the following is ${poly ? 'a polygon' : '<b>not</b> a polygon'}? ${m.en}`, `Antara yang berikut, yang manakah ${poly ? 'sebuah poligon' : '<b>bukan</b> poligon'}? ${m.ms}`), a: m.ans, sp: 'xs' };
    },
    (r) => {
      const t = r.pick(STM);
      return { q: T(`True or false? ${t[0]}`, `Benar atau palsu? ${t[1]}`), a: TF(t[2], t[3], t[4]), sp: 'xs' };
    },
    (r) => {
      const k = r.int(4, 10);
      return { q: Q(r.pick([
        ['How many diagonals can be drawn from one vertex of {an}?', 'Berapakah bilangan pepenjuru yang boleh dilukis dari satu bucu {nm}?'],
        ['A student draws every diagonal from one corner of {an}. How many lines does the student draw?', 'Seorang murid melukis setiap pepenjuru dari satu sudut {nm}. Berapakah bilangan garis yang dilukisnya?'],
      ]), { an: AN(PNM[k]) }, { nm: PMS[k] }), a: T(`${k - 3}`), w: T(`$${k} - 3 = ${k - 3}$`), sp: 'xs' };
    },
    (r) => {
      const k = r.int(3, 8), N = vn(r, k), nm = mx(N.join(''));
      return { q: Q(r.pick([
        ['The vertices of polygon {nm} are labelled in order. Write down the names of all its sides.', 'Bucu-bucu poligon {nm} dilabel mengikut susunan. Tulis nama semua sisinya.'],
        ['List the sides of polygon {nm}, going round the polygon from {f}.', 'Senaraikan sisi-sisi poligon {nm}, mengelilingi poligon itu bermula dari {f}.'],
      ]), { nm, f: mx(N[0]) }), a: T(sidesOf(N).map((x) => mx(x)).join(', ')), sp: 's' };
    },
    (r) => {
      const k = r.int(5, 8), N = vn(r, k), s = r.int(0, k - 1), pkind = r.int(0, 2), nm = mx(N.join('')), v = mx(N[s]);
      const adj = [N[(s + k - 1) % k], N[(s + 1) % k]], non = N.filter((x, j) => j !== s && !adj.includes(x));
      const q = [['Which two vertices of polygon {nm} are adjacent to vertex {v}?', 'Manakah dua bucu poligon {nm} yang bersebelahan dengan bucu {v}?'], ['Name the vertices of polygon {nm} that are <b>not</b> adjacent to {v} and not {v} itself.', 'Namakan bucu poligon {nm} yang <b>tidak</b> bersebelahan dengan {v} dan bukan {v} sendiri.'], ['In polygon {nm}, vertex {v} is joined to which other vertices by a side of the polygon?', 'Dalam poligon {nm}, bucu {v} disambungkan kepada bucu lain yang manakah oleh sisi poligon?']][pkind];
      return { q: Q(q, { nm, v }), a: T(mx(pkind === 1 ? non.join(', ') : adj.slice().sort().join(' and ')).replace(' and ', '$ and $'), mx(pkind === 1 ? non.join(', ') : adj.slice().sort().join(' dan ')).replace(' dan ', '$ dan $')), sp: 'xs' };
    },
    (r) => {
      const ks = r.sample([3, 4, 5, 6, 7, 8, 9, 10], 4), wv = r.chance(), hide = ks.map(() => r.chance());
      const hd = (l) => (l ? ['Poligon', 'Bilangan sisi'] : ['Polygon', 'Number of sides']).concat(wv ? [l ? 'Bilangan bucu' : 'Number of vertices'] : []);
      const tb = (l, full) => SPM.table(ks.map((k, i) => [full || !hide[i] ? (l ? PMS[k] : PNM[k]) : '?', full || hide[i] ? k : '?'].concat(wv ? [full ? k : '?'] : [])), { head: hd(l) });
      return { q: T('Complete the table.<br>' + tb(0), 'Lengkapkan jadual.<br>' + tb(1)), a: T(tb(0, 1), tb(1, 1)), sp: 's' };
    },
  ];
  SPM.extend('F1-9.1', { e: e91 });
  const isValid = (s, N) => { const t = N.join(''), k = t.length, u = t + t, rv = t.split('').reverse().join(''); return s.length === k && (u.includes(s) || (rv + rv).includes(s)); };
  const m91 = [
    (r) => {
      const cs = r.sample([0, 1, 2, 3, 4], r.pick([3, 4])).sort(), ks = r.sample([4, 5, 6, 7, 8, 9, 10], 4).sort((a, b) => a - b), kn = ks.map(() => r.pick(cs));
      const tb = (l, full) => SPM.table(ks.map((k, i) => cs.map((c) => (full || c === kn[i] ? String(COLS[c][l ? 3 : 2](k)) : '?'))), { head: cs.map((c) => COLS[c][l]) });
      return { q: T('Each row of the table gives one fact about a polygon. Complete the table.<br>' + tb(0), 'Setiap baris jadual memberi satu fakta tentang sebuah poligon. Lengkapkan jadual itu.<br>' + tb(1)), a: T(tb(0, 1), tb(1, 1)), sp: 'm' };
    },
    (r) => {
      const k = r.int(4, 10), c = r.pick(CTX91);
      return { q: T(fill(c[0], { an: AN(PNM[k]) }) + ' ' + c[2], fill(c[1], { name: PMS[k] }) + ' ' + c[3]), a: T(`${dT(k)}`), w: T(`$\\dfrac{${k} \\times ${k - 3}}{2} = ${dT(k)}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(5, 10), d = k - 3;
      return { q: Q(r.pick([
        ['From one vertex of a polygon, {d} diagonals can be drawn. Find the number of sides and name the polygon.', 'Dari satu bucu sebuah poligon, {d} pepenjuru boleh dilukis. Cari bilangan sisi dan namakan poligon itu.'],
        ['Ravi draws all the diagonals from one corner of a polygon and gets {d} lines. What is the name of the polygon?', 'Ravi melukis semua pepenjuru dari satu sudut sebuah poligon dan mendapat {d} garis. Apakah nama poligon itu?'],
        ['A polygon has {d} diagonals from each vertex. How many vertices does it have, and what is it called?', 'Sebuah poligon mempunyai {d} pepenjuru dari setiap bucu. Berapakah bilangan bucunya dan apakah namanya?'],
      ]), { d }), a: T(`${k} sides, ${PNM[k]}`, `${k} sisi, ${PMS[k]}`), w: T(`$${d} + 3 = ${k}$`), sp: 's' };
    },
    (r) => {
      const all = r.chance(0.4), k = all ? r.int(4, 6) : r.int(5, 8), N = vn(r, k), s = r.int(0, k - 1), D = all ? sidesOf(N).length && dT(k) : k - 3;
      const dl = all ? N.flatMap((v, i) => N.slice(i + 2).filter((_, j) => !(i === 0 && i + 2 + j === k - 1)).map((u) => v + u)) : diagFrom(N, s);
      return { q: Q(all ? ['Draw {an} and label its vertices {N}. Draw all its diagonals and state how many there are.', 'Lukis {nm} dan labelkan bucunya {N}. Lukis semua pepenjurunya dan nyatakan bilangannya.'] : ['Draw {an} and label its vertices {N} in order. Draw all the diagonals from vertex {v}. How many diagonals have you drawn, and what are they called?', 'Lukis {nm} dan labelkan bucunya {N} mengikut susunan. Lukis semua pepenjuru dari bucu {v}. Berapakah bilangan pepenjuru yang anda lukis dan apakah namanya?'], { an: AN(PNM[k]), N: mx(N.join(', ')), v: mx(N[s]) }, { nm: PMS[k], N: mx(N.join(', ')), v: mx(N[s]) }), a: T(`${D} diagonals: ` + dl.map(mx).join(', '), `${D} pepenjuru: ` + dl.map(mx).join(', ')), sp: 'xl' };
    },
    (r) => {
      const k = r.int(5, 8), N = vn(r, k), s = r.int(0, k - 1), fg = r.chance(), dl = diagFrom(N, s);
      const fig = fg ? pfig(r, k, { names: N }) : undefined;
      return { q: Q(r.pick([['Write down all the diagonals that can be drawn from vertex {v} of polygon {nm}.', 'Tulis semua pepenjuru yang boleh dilukis dari bucu {v} poligon {nm}.'], ['Polygon {nm} has {k} vertices. List the diagonals that start at {v}.', 'Poligon {nm} mempunyai {k} bucu. Senaraikan pepenjuru yang bermula dari {v}.']]), { v: mx(N[s]), nm: mx(N.join('')), k }), fig, a: T(dl.map(mx).join(', ')), sp: 's' };
    },
    (r) => {
      const k = r.int(5, 7), N = vn(r, k), fg = r.chance(), t = r.int(0, 2), rot = r.int(0, k - 1), dir = r.pick([1, -1]);
      const val = (o) => walk(N, o, dir).join(''), bad = [];
      const sw = (a) => { const b = a.split(''), i = r.int(0, k - 2); [b[i], b[i + 1]] = [b[i + 1], b[i]]; return b.join(''); };
      const lst = [val(rot)];
      for (let i = 0; i < 3; i++) { const b = t === 1 ? val(r.int(0, k - 1)) : sw(val(r.int(0, k - 1))); lst.push(b); }
      const ok = lst.map((x) => isValid(x, N));
      const want = t === 1 ? 0 : 1; // t=1: 'not valid' with 3 valid + 1 invalid
      const opts = t === 1 ? [...[0, 1, 2].map((i) => ({ t: lt(mx(val(r.int(0, k - 1)))), ok: false })), { t: lt(mx(sw(val(0)))), ok: true }] : lst.map((x, i) => ({ t: lt(mx(x)), ok: i === 0 }));
      need(t === 1 ? opts.slice(0, 3).every((o) => isValid(o.t.en.replace(/\$/g, ''), N)) && new Set(opts.map((o) => o.t.en)).size === 4 && !isValid(opts[3].t.en.replace(/\$/g, ''), N) : ok.filter(Boolean).length === 1 && new Set(lst).size === 4);
      const m = mc(r, opts), fig = fg ? pfig(r, k, { names: N }) : undefined, nm = mx(N.join(''));
      return { q: T(fg ? `Which of the following is ${t === 1 ? '<b>not</b> ' : ''}a valid name for the polygon shown? ${m.en}` : `The vertices of a polygon are labelled ${mx(N.join(', '))} in order round the polygon. Which of the following is ${t === 1 ? '<b>not</b> ' : ''}a valid name for it? ${m.en}`, fg ? `Yang manakah ${t === 1 ? '<b>bukan</b> ' : ''}nama yang sah bagi poligon yang ditunjukkan? ${m.ms}` : `Bucu-bucu sebuah poligon dilabel ${mx(N.join(', '))} mengikut susunan mengelilingi poligon itu. Yang manakah ${t === 1 ? '<b>bukan</b> ' : ''}nama yang sah bagi poligon itu? ${m.ms}`), fig, a: m.ans, sp: 's' };
    },
    (r) => {
      const k = r.int(5, 9), kinds = r.sample([0, 1, 2, 3, 4], r.pick([3, 4])).sort(), tv = kinds.map(() => r.chance());
      need(tv.some((x) => x) && tv.some((x) => !x));
      const mk = (c, t) => {
        const wk = r.pick([k - 1, k + 1]), w3 = r.pick([k - 2, k - 4, k]);
        return [[`It has ${t ? k : wk} sides.`, `Ia mempunyai ${t ? k : wk} sisi.`], [`It has ${t ? k : wk} interior angles.`, `Ia mempunyai ${t ? k : wk} sudut pedalaman.`], [`It has ${t ? k - 3 : w3} diagonals from each vertex.`, `Ia mempunyai ${t ? k - 3 : w3} pepenjuru dari setiap bucu.`], [`It has ${t ? dT(k) : k * (k - 3)} diagonals in total.`, `Ia mempunyai ${t ? dT(k) : k * (k - 3)} pepenjuru kesemuanya.`], [`It is ${AN(PNM[t ? k : wk])}.`, `Ia ialah ${PMS[t ? k : wk]}.`]][c];
      };
      const sts = kinds.map((c, i) => mk(c, tv[i])), RN = ['i', 'ii', 'iii', 'iv'];
      return { q: T(`A polygon has ${k} vertices. Which of these statements are true? ` + sts.map((s, i) => `(${RN[i]}) ${s[0]}`).join(' '), `Sebuah poligon mempunyai ${k} bucu. Antara pernyataan berikut, yang manakah benar? ` + sts.map((s, i) => `(${RN[i]}) ${s[1]}`).join(' ')), a: T(kinds.map((_, i) => (tv[i] ? RN[i] : null)).filter(Boolean).join(', ')), sp: 's' };
    },
    (r) => {
      const k = r.int(5, 8), N = vn(r, k), fig = pfig(r, k, { names: N }), s = r.int(0, k - 1), nb = r.chance(), w = nb ? N[(s + 1) % k] : undefined;
      const both = walk(N, s, 1).join(''), rev = walk(N, s, -1).join('');
      return { q: Q(nb ? ['The polygon shown has labelled vertices. Write the valid name that begins with {v} and ends with {w}.', 'Poligon yang ditunjukkan mempunyai bucu berlabel. Tulis nama yang sah yang bermula dengan {v} dan berakhir dengan {w}.'] : ['The polygon shown has labelled vertices. Write all the valid names of the polygon that begin with {v}.', 'Poligon yang ditunjukkan mempunyai bucu berlabel. Tulis semua nama yang sah bagi poligon yang bermula dengan {v}.'], { v: mx(N[s]), w: nb ? mx(w) : '' }), fig, a: T(nb ? mx(rev) : mx(both) + ' and ' + mx(rev), nb ? mx(rev) : mx(both) + ' dan ' + mx(rev)), sp: 's' };
    },
  ];
  SPM.extend('F1-9.1', { m: m91 });
  const CST = [
    ['A hall in the shape of {an} has a steel beam joining every pair of corners that are not next to each other. Each beam costs RM{p}.', 'Sebuah dewan berbentuk {nm} mempunyai alang keluli yang menyambungkan setiap pasangan sudut yang tidak bersebelahan. Setiap alang berharga RM{p}.'],
    ['A garden in the shape of {an} has a cable between every two lamp posts that are not neighbours. Each cable costs RM{p}.', 'Sebuah taman berbentuk {nm} mempunyai kabel di antara setiap dua tiang lampu yang tidak berjiran. Setiap kabel berharga RM{p}.'],
  ];
  const REL = [
    (r) => { const c = r.int(3, 6); return [`The total number of diagonals of a polygon is ${c} times the number of diagonals that can be drawn from one vertex. Find the number of sides.`, `Jumlah pepenjuru sebuah poligon ialah ${c} kali bilangan pepenjuru yang boleh dilukis dari satu bucu. Cari bilangan sisi poligon itu.`, 2 * c, `$\\dfrac{n(n-3)}{2} = ${c}(n-3)$, so $n = ${2 * c}$`]; },
    (r) => { const c = r.int(3, 6); return [`A polygon has ${c} times as many diagonals in total as diagonals from one vertex. How many vertices does it have?`, `Sebuah poligon mempunyai jumlah pepenjuru ${c} kali ganda pepenjuru dari satu bucu. Berapakah bilangan bucunya?`, 2 * c, `$n(n-3) = ${2 * c}(n-3)$`]; },
    () => ['The total number of diagonals of a polygon equals its number of sides. Find the number of sides.', 'Jumlah pepenjuru sebuah poligon sama dengan bilangan sisinya. Cari bilangan sisi poligon itu.', 5, '$\\dfrac{n(n-3)}{2} = n$, so $n - 3 = 2$'],
    (r) => { const k = r.int(6, 11), c = (k * (k - 5)) / 2; return [`A polygon has ${c} more diagonals in total than sides. Find the number of sides.`, `Sebuah poligon mempunyai ${c} lebih banyak pepenjuru kesemuanya berbanding sisi. Cari bilangan sisi poligon itu.`, k, `$\\dfrac{n(n-3)}{2} - n = ${c}$, so $n(n-5) = ${2 * c}$; test $n = ${k}$: $${k} \\times ${k - 5} = ${2 * c}$`]; },
    () => ['The total number of diagonals of a polygon equals the sum of its number of sides and the number of diagonals from one vertex. Find the number of sides.', 'Jumlah pepenjuru sebuah poligon sama dengan hasil tambah bilangan sisinya dengan bilangan pepenjuru dari satu bucu. Cari bilangan sisi poligon itu.', 6, 'Test $n = 6$: total $9 = 6 + 3$'],
    () => ['The number of diagonals from one vertex of a polygon is half its number of sides. Find the number of sides and the total number of diagonals.', 'Bilangan pepenjuru dari satu bucu sebuah poligon ialah separuh daripada bilangan sisinya. Cari bilangan sisi dan jumlah pepenjuru.', 6, '$n - 3 = \\dfrac{n}{2}$, so $n = 6$; total $= 9$'],
  ];
  const dgIdx = (k, i) => Array.from({ length: k }, (_, j) => j).filter((j) => j !== i && j !== (i + 1) % k && j !== (i + k - 1) % k);
  const why = (bad, N) => {
    const k = N.length, adj = (a, b) => { const i = N.indexOf(a), j = N.indexOf(b); return i >= 0 && j >= 0 && (Math.abs(i - j) === 1 || Math.abs(i - j) === k - 1); };
    if (bad.length < k) { const m = N.find((v) => !bad.includes(v)); return T(`It leaves out vertex $${m}$; a name must list every vertex once.`, `Ia meninggalkan bucu $${m}$; nama mesti menyenaraikan setiap bucu sekali.`); }
    if (bad.length > k) return T(`A letter is repeated, but the polygon has only ${k} vertices; each vertex is named once.`, `Satu huruf diulang, tetapi poligon hanya mempunyai ${k} bucu; setiap bucu dinamakan sekali.`);
    for (let i = 0; i < k; i++) { const a = bad[i], b = bad[(i + 1) % k]; if (!adj(a, b)) return T(`$${a}$ is followed by $${b}$, but these vertices are not adjacent. Consecutive letters must be neighbouring vertices.`, `$${a}$ diikuti oleh $${b}$, tetapi bucu-bucu ini tidak bersebelahan. Huruf berturutan mesti bucu berjiran.`); }
    return T('It is valid.', 'Ia sah.');
  };
  const a91 = [
    (r) => {
      const k = r.int(6, 12), D = dT(k), pk = ['sides', ...r.sample(k <= 10 ? ['name', 'd1', 'vert'] : ['d1', 'vert'], r.pick([1, 2]))];
      const op = Q(r.pick([['A polygon has {D} diagonals in total.', 'Sebuah poligon mempunyai {D} pepenjuru kesemuanya.'], ['The total number of diagonals of a polygon is {D}.', 'Jumlah pepenjuru sebuah poligon ialah {D}.'], ['Kamal counts {D} diagonals altogether in a polygon.', 'Kamal mengira {D} pepenjuru kesemuanya dalam sebuah poligon.']]), { D });
      const pq = SPM.parts(pk.map((x) => PART91[x][0])), pa = SPM.parts(pk.map((x) => (x === 'name' ? pnT(k) : T(`${x === 'd1' ? k - 3 : k}`))));
      return { q: T(op.en + pq.en, op.ms + pq.ms), a: pa, w: T(`$\\dfrac{n(n-3)}{2} = ${D}$, so $n(n-3) = ${2 * D} = ${k} \\times ${k - 3}$`), sp: 'm' };
    },
    (r) => {
      const i = r.int(0, REL.length - 1), t = REL[i](r);
      return { q: T(t[0], t[1]), a: i === 6 ? T('6 sides; 9 diagonals', '6 sisi; 9 pepenjuru') : T(`${t[2]} sides`, `${t[2]} sisi`), w: T(t[3]), sp: 'm' };
    },
    (r) => {
      const k = r.int(5, 8), N = vn(r, k), nm = mx(N.join('')), t = r.int(0, 3), form = r.int(0, 2), rt = r.int(0, k - 1);
      const good = walk(N, rt, r.pick([1, -1])).join('');
      let bad;
      if (t === 0) { const a = good.split(''), i = r.int(0, k - 3); [a[i], a[i + 1]] = [a[i + 1], a[i]]; bad = a.join(''); }
      else if (t === 1) bad = good.slice(0, -1);
      else if (t === 2) bad = good + good[0];
      else { const e = N.filter((_, j) => j % 2 === 0), o = N.filter((_, j) => j % 2); bad = e.concat(o).join(''); }
      need(!isValid(bad, N));
      const fig = form === 2 ? pfig(r, k, { names: N }) : undefined;
      const pair = r.shuffle([[good, true], [bad, false]]);
      if (form === 0) return { q: Q(['A student names the polygon {nm} as {b}. Explain why this is not a valid name for the polygon.', 'Seorang murid menamakan poligon {nm} sebagai {b}. Terangkan mengapa ini bukan nama yang sah bagi poligon itu.'], { nm, b: mx(bad) }), a: why(bad, N), sp: 'm' };
      const txt = T(`${mx(pair[0][0])} is ${pair[0][1] ? 'valid' : 'not valid'}; ${mx(pair[1][0])} is ${pair[1][1] ? 'valid' : 'not valid'}. `, ''), pw = (p) => (p[1] ? T(`${mx(p[0])} is valid: the letters follow the vertices in order round the polygon.`, `${mx(p[0])} sah: huruf-huruf mengikut bucu mengelilingi poligon.`) : T(`${mx(p[0])} is not valid. `, `${mx(p[0])} tidak sah. `));
      const an = (p) => (p[1] ? pw(p) : T(pw(p).en + why(p[0], N).en, pw(p).ms + why(p[0], N).ms));
      const a1 = an(pair[0]), a2 = an(pair[1]);
      return { q: form === 1 ? Q(['Decide whether {p1} and {p2} are valid names for polygon {nm}. Give a reason for each answer.', 'Tentukan sama ada {p1} dan {p2} ialah nama yang sah bagi poligon {nm}. Berikan sebab bagi setiap jawapan.'], { nm, p1: mx(pair[0][0]), p2: mx(pair[1][0]) }) : Q(['The vertices of the polygon shown are labelled. Decide whether {p1} and {p2} are valid names for it, giving a reason each time.', 'Bucu-bucu poligon yang ditunjukkan dilabel. Tentukan sama ada {p1} dan {p2} ialah nama yang sah baginya, dengan memberi sebab setiap kali.'], { p1: mx(pair[0][0]), p2: mx(pair[1][0]) }), fig, a: SPM.lines(a1, a2), sp: 'm' };
    },
    (r) => {
      const k = r.int(3, 10), pr = r.int(0, 2), N = vn(r, k > 4 ? 4 : k);
      if (pr === 0) return { q: Q(['A polygon has {k} vertices. Starting at any vertex and going round in either direction gives a name for it. How many different valid names can the polygon have?', 'Sebuah poligon mempunyai {k} bucu. Bermula dari mana-mana bucu dan bergerak mengelilinginya ke mana-mana arah menghasilkan satu nama. Berapakah bilangan nama sah yang berbeza bagi poligon itu?'], { k }), a: T(`${2 * k}`), w: T(`${k} starting vertices $\\times$ 2 directions`, `${k} bucu permulaan $\\times$ 2 arah`), sp: 's' };
      if (pr === 1) { const kk = r.pick([3, 4]), M = vn(r, kk); return { q: Q(['List all the valid names of the {nm} {L}.', 'Senaraikan semua nama yang sah bagi {nm} {L}.'], { nm: PNM[kk], L: mx(M.join('')) }, { nm: PMS[kk], L: mx(M.join('')) }), a: T([...M.keys()].flatMap((s) => [walk(M, s, 1).join(''), walk(M, s, -1).join('')]).map(mx).join(', ')), sp: 'm' }; }
      const kk = r.int(4, 8), M = vn(r, kk), s = r.int(0, kk - 1);
      return { q: Q(['How many valid names of polygon {nm} begin with {v}? Write them down.', 'Berapakah bilangan nama sah poligon {nm} yang bermula dengan {v}? Tulis nama-nama itu.'], { nm: mx(M.join('')), v: mx(M[s]) }), a: T(`2: ${mx(walk(M, s, 1).join(''))}, ${mx(walk(M, s, -1).join(''))}`), sp: 's' };
    },
    (r) => {
      const k = r.int(5, 10);
      return { q: Q(r.pick([['Ali says that {an} has {k} $\\times$ {d} = {p} diagonals in total. Explain his mistake and find the correct number.', 'Ali berkata {nm} mempunyai {k} $\\times$ {d} = {p} pepenjuru kesemuanya. Terangkan kesilapannya dan cari bilangan yang betul.'], ['To count the diagonals of {an}, Mei Ling multiplies the number of vertices by the number of diagonals from one vertex and writes {p}. Is her answer correct? Explain.', 'Untuk mengira pepenjuru {nm}, Mei Ling mendarab bilangan bucu dengan bilangan pepenjuru dari satu bucu dan menulis {p}. Adakah jawapannya betul? Terangkan.']]), { an: AN(PNM[k]), k, d: k - 3, p: k * (k - 3) }, { nm: PMS[k], k, d: k - 3, p: k * (k - 3) }), a: T(`Each diagonal is counted twice (once from each end), so divide by 2: ${dT(k)} diagonals.`, `Setiap pepenjuru dikira dua kali (sekali dari setiap hujung), jadi bahagi dengan 2: ${dT(k)} pepenjuru.`), sp: 'm' };
    },
    (r) => {
      const k = r.int(5, 9), p = r.step(3, 24, 3), c = r.pick(CST);
      return { q: T(fill(c[0], { an: AN(PNM[k]), p }) + ' Find the total cost.', fill(c[1], { nm: PMS[k], p }) + ' Cari jumlah kos.'), a: T(`RM${dT(k) * p}`), w: T(`$${dT(k)} \\times ${p}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(4, 9);
      return { q: Q(r.pick([['{A} has {d1} diagonals. When one more vertex is added, it becomes {b}. How many new diagonals does it have?', 'Sebuah {a} mempunyai {d1} pepenjuru. Apabila satu bucu ditambah, ia menjadi {b}. Berapakah bilangan pepenjuru baharu yang ada padanya?'], ['How many more diagonals does {b} have than {an}?', 'Berapakah lebih banyak pepenjuru yang dimiliki {b} berbanding {a}?']]), { A: SPM.cap(AN(PNM[k])), b: AN(PNM[k + 1]), an: AN(PNM[k]), d1: dT(k) }, { a: PMS[k], b: PMS[k + 1], d1: dT(k) }), a: T(`${dT(k + 1) - dT(k)}`), w: T(`$${dT(k + 1)} - ${dT(k)} = ${dT(k + 1) - dT(k)}$`), sp: 's' };
    },
    (r) => {
      const [k1, k2] = r.distinct(2, 4, 10), p = r.pick(['Nora', 'Hafiz', 'Devi', 'Chong']);
      return { q: T(`${p} says that ${AN(PNM[k1])} has ${dT(k2)} diagonals. Is ${p} correct? If not, find the correct number of diagonals of ${AN(PNM[k1])} and name the polygon that has ${dT(k2)} diagonals.`, `${p} berkata ${PMS[k1]} mempunyai ${dT(k2)} pepenjuru. Adakah ${p} betul? Jika tidak, cari bilangan pepenjuru yang betul bagi ${PMS[k1]} dan namakan poligon yang mempunyai ${dT(k2)} pepenjuru.`), a: T(`No. ${SPM.cap(AN(PNM[k1]))} has ${dT(k1)} diagonals; the polygon with ${dT(k2)} diagonals is ${AN(PNM[k2])}.`, `Tidak. ${PMS[k1]} mempunyai ${dT(k1)} pepenjuru; poligon yang mempunyai ${dT(k2)} pepenjuru ialah ${PMS[k2]}.`), sp: 'm' };
    },
    (r) => {
      const k = r.int(5, 8), N = vn(r, k), s = r.int(0, k - 1), m = r.int(1, 3), u = (s + m) % k, fg = r.chance();
      const pairs = [...dgIdx(k, s).map((j) => [s, j]), ...dgIdx(k, u).map((j) => [u, j])], keys = new Set(pairs.map((p) => p.slice().sort().join('-'))), cnt = keys.size;
      const dl = [...keys].map((x) => { const [i, j] = x.split('-').map(Number); return N[i] + N[j]; });
      const fig = fg ? pfig(r, k, { names: N, diag: pairs }) : undefined;
      return { q: Q(fg ? ['Diagonals are drawn from vertex {x} and from vertex {y} of the polygon shown (dashed lines). How many different diagonals are drawn altogether?', 'Pepenjuru dilukis dari bucu {x} dan dari bucu {y} poligon yang ditunjukkan (garis putus-putus). Berapakah bilangan pepenjuru berbeza yang dilukis kesemuanya?'] : ['In polygon {nm}, all the diagonals are drawn from vertex {x} and from vertex {y}. How many different diagonals are drawn altogether?', 'Dalam poligon {nm}, semua pepenjuru dilukis dari bucu {x} dan dari bucu {y}. Berapakah bilangan pepenjuru berbeza yang dilukis kesemuanya?'], { nm: mx(N.join('')), x: mx(N[s]), y: mx(N[u]) }), fig, a: T(`${cnt}`), w: T(`${k - 3} + ${k - 3}${cnt < 2 * (k - 3) ? ' - 1 (the diagonal ' + mx(N[s] + N[u]) + ' is counted twice)' : ''}`, `${k - 3} + ${k - 3}${cnt < 2 * (k - 3) ? ' - 1 (pepenjuru ' + mx(N[s] + N[u]) + ' dikira dua kali)' : ''}`), sp: 's' };
    },
  ];
  SPM.extend('F1-9.1', { a: a91 });
  /* ================= F1-9.1S Regular / irregular, convex / concave (supporting) ================= */
  const inPoly = (p, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > p[1]) !== (P[j][1] > p[1]) && p[0] < ((P[j][0] - P[i][0]) * (p[1] - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
  /** concave polygon (one reflex vertex at index rv) */
  const cavePts = (r, k) => {
    if (k === 4) return { P: [[0, -2], [2 + 0.3 * r.next(), 2], [0, 0.4 + 0.3 * r.next()], [-2 - 0.3 * r.next(), 2]], rv: 2 };
    const rv = r.int(0, k - 1), P = Array.from({ length: k }, (_, i) => { const a = Math.PI / 2 + (2 * Math.PI * i) / k, s = i === rv ? 0.6 * Math.cos((2 * Math.PI) / k) : 0.9 + 0.2 * r.next(); return [s * Math.cos(a), -s * Math.sin(a)]; });
    return { P, rv };
  };
  const cfig = (r, k, N) => { const { P, rv } = cavePts(r, k); need(!cvx(P)); return { P, rv, svg: F.polygon({ pts: P, names: N, w: 230, h: 190 }) }; };
  const outDiag = (P, N) => { const k = P.length, o = []; for (let i = 0; i < k; i++) for (let j = i + 2; j < k; j++) { if (i === 0 && j === k - 1) continue; if ([0.15, 0.3, 0.5, 0.7, 0.85].some((t) => !inPoly([P[i][0] + t * (P[j][0] - P[i][0]), P[i][1] + t * (P[j][1] - P[i][1])], P))) o.push(N[i] + N[j]); } return o; };
  const RG = [ // [en, ms, regular?, reason en, reason ms]
    ['a square', 'segi empat sama', 1, 'all sides and all angles ($90^\\circ$) are equal', 'semua sisi dan semua sudut ($90^\\circ$) sama'],
    ['a rectangle that is not a square', 'segi empat tepat yang bukan segi empat sama', 0, 'its angles are equal but its sides are not all equal', 'sudutnya sama tetapi sisinya tidak semua sama'],
    ['a rhombus that is not a square', 'rombus yang bukan segi empat sama', 0, 'its sides are equal but its angles are not all equal', 'sisinya sama tetapi sudutnya tidak semua sama'],
    ['an equilateral triangle', 'segi tiga sama sisi', 1, 'all sides are equal and all angles are $60^\\circ$', 'semua sisi sama dan semua sudut ialah $60^\\circ$'],
    ['an isosceles triangle that is not equilateral', 'segi tiga sama kaki yang bukan sama sisi', 0, 'only two sides are equal', 'hanya dua sisi yang sama'],
    ['a scalene triangle', 'segi tiga tak sama sisi', 0, 'no two sides are equal', 'tiada dua sisi yang sama'],
    ['a kite that is not a rhombus', 'layang-layang yang bukan rombus', 0, 'its sides are not all equal', 'sisinya tidak semua sama'],
    ['a parallelogram with unequal adjacent sides', 'segi empat selari dengan sisi bersebelahan tidak sama', 0, 'its sides are not all equal and its angles are not all equal', 'sisinya tidak semua sama dan sudutnya tidak semua sama'],
    ['a trapezium', 'trapezium', 0, 'its four sides are not all equal in general and its angles are not all equal', 'empat sisinya secara amnya tidak sama dan sudutnya tidak semua sama'],
    ['a pentagon with all five sides and all five angles equal', 'pentagon dengan lima sisi dan lima sudut yang sama', 1, 'both sides and angles are equal', 'kedua-dua sisi dan sudut adalah sama'],
    ['a hexagon with all sides equal but with angles of different sizes', 'heksagon dengan semua sisi sama tetapi sudut berlainan saiz', 0, 'the angles are not all equal', 'sudutnya tidak semua sama'],
    ['an octagon with all angles equal but sides of different lengths', 'oktagon dengan semua sudut sama tetapi sisi berlainan panjang', 0, 'the sides are not all equal', 'sisinya tidak semua sama'],
  ];
  const CV = [
    ['A regular polygon has all its sides equal.', 'Poligon sekata mempunyai semua sisi yang sama.', 1],
    ['A regular polygon has all its angles equal.', 'Poligon sekata mempunyai semua sudut yang sama.', 1],
    ['A polygon with all sides equal must be regular.', 'Poligon dengan semua sisi sama mestilah sekata.', 0, 'A rhombus has equal sides but its angles need not be equal.', 'Rombus mempunyai sisi sama tetapi sudutnya tidak semestinya sama.'],
    ['Every square is a regular polygon.', 'Setiap segi empat sama ialah poligon sekata.', 1],
    ['In a convex polygon, every interior angle is less than $180^\\circ$.', 'Dalam poligon cembung, setiap sudut pedalaman kurang daripada $180^\\circ$.', 1],
    ['A concave polygon has at least one interior angle greater than $180^\\circ$.', 'Poligon cekung mempunyai sekurang-kurangnya satu sudut pedalaman lebih besar daripada $180^\\circ$.', 1],
    ['Every triangle is a convex polygon.', 'Setiap segi tiga ialah poligon cembung.', 1, '', ''],
    ['A polygon with a reflex interior angle is convex.', 'Poligon yang mempunyai sudut pedalaman refleks ialah cembung.', 0, 'A polygon with a reflex interior angle is concave.', 'Poligon yang mempunyai sudut pedalaman refleks ialah cekung.'],
    ['A regular polygon can be concave.', 'Poligon sekata boleh berbentuk cekung.', 0, 'The angles of a regular polygon are all equal, so none can be reflex while others are smaller.', 'Sudut poligon sekata semuanya sama, jadi tiada yang refleks sementara yang lain lebih kecil.'],
  ];
  const SH = [['square', 'segi empat sama', 1, 1], ['rectangle (unequal sides)', 'segi empat tepat (sisi tidak sama)', 0, 1], ['rhombus (unequal angles)', 'rombus (sudut tidak sama)', 1, 0], ['equilateral triangle', 'segi tiga sama sisi', 1, 1], ['kite (unequal sides)', 'layang-layang (sisi tidak sama)', 0, 0], ['parallelogram (unequal sides)', 'segi empat selari (sisi tidak sama)', 0, 0]];
  const YN = (b, l) => (b ? (l ? 'Ya' : 'Yes') : l ? 'Tidak' : 'No');
  const e91S = [
    (r) => { const x = r.pick(RG); return { q: T(`Is ${x[0]} a regular polygon? Give a reason.`, `Adakah ${x[1]} poligon sekata? Berikan satu sebab.`), a: T(`${x[2] ? 'Yes' : 'No'}: ${x[3]}.`, `${x[2] ? 'Ya' : 'Tidak'}: ${x[4]}.`), sp: 's' }; },
    (r) => { const t = r.pick(CV); return { q: T(`True or false? ${t[0]}`, `Benar atau palsu? ${t[1]}`), a: TF(t[2], t[3], t[4]), sp: 'xs' }; },
    (r) => {
      const k = r.int(4, 8), N = vn(r, k), cv = r.chance(), { P, rv } = cv ? { P: null, rv: 0 } : cavePts(r, k);
      const fig = cv ? pfig(r, k, { names: N }) : (() => { need(!cvx(P)); return F.polygon({ pts: P, names: N, w: 230, h: 190 }); })();
      return { q: Q(r.pick([['State whether the polygon shown is convex or concave.', 'Nyatakan sama ada poligon yang ditunjukkan cembung atau cekung.'], ['Is the {nm} shown convex or concave? Give a reason.', '{nm} yang ditunjukkan cembung atau cekung? Berikan satu sebab.'], ['The polygon shown has {k} vertices. Classify it as convex or concave.', 'Poligon yang ditunjukkan mempunyai {k} bucu. Kelaskan poligon itu sebagai cembung atau cekung.']]), { nm: PNM[k], k }, { nm: SPM.cap(PMS[k]), k }), fig, a: cv ? T('Convex: every interior angle is less than $180^\\circ$.', 'Cembung: setiap sudut pedalaman kurang daripada $180^\\circ$.') : T(`Concave: the interior angle at $${N[rv]}$ is greater than $180^\\circ$.`, `Cekung: sudut pedalaman di $${N[rv]}$ lebih besar daripada $180^\\circ$.`), sp: 's' };
    },
    (r) => {
      const kd = r.int(0, 3), k = r.int(3, 8), s0 = r.int(3, 9), ang = r.pick([50, 60, 70, 80]), lb = (v) => `${v} cm`;
      let o, ok, why = T('', ''), extra = '';
      if (kd === 0) { const sd = {}, tk = {}; for (let i = 0; i < k; i++) (sd[`${i}-${(i + 1) % k}`] = lb(s0)); o = { pts: Array.from({ length: k }, (_, i) => [Math.cos((2 * Math.PI * i) / k + Math.PI / 2), -Math.sin((2 * Math.PI * i) / k + Math.PI / 2)]), sides: sd }; ok = 1; extra = ' All its interior angles are equal.'; }
      else if (kd === 1) { const c = Math.cos((ang * Math.PI) / 180), sn = Math.sin((ang * Math.PI) / 180); o = { pts: [[0, 0], [3, 0], [3 + 3 * c, -3 * sn], [3 * c, -3 * sn]], ticks: { '0-1': 1, '1-2': 1, '2-3': 1, '3-0': 1 }, angles: { 0: `${ang}°`, 1: `${180 - ang}°`, 2: `${ang}°`, 3: `${180 - ang}°` } }; ok = 0; why = T('the angles are not all equal', 'sudutnya tidak semua sama'); }
      else if (kd === 2) { const w = s0 + r.int(1, 4); o = { pts: [[0, 0], [w, 0], [w, -s0], [0, -s0]], right: [0, 1, 2, 3], sides: { '0-1': lb(w), '1-2': lb(s0), '2-3': lb(w), '3-0': lb(s0) } }; ok = 0; why = T('the sides are not all equal', 'sisinya tidak semua sama'); }
      else { const kk = r.int(4, 6), ls = r.sample([3, 4, 5, 6, 7, 8, 9], kk), sd = {}; ls.forEach((v, i) => (sd[`${i}-${(i + 1) % kk}`] = lb(v))); o = { pts: Array.from({ length: kk }, (_, i) => { const rr = 0.8 + 0.3 * r.next(); return [rr * Math.cos((2 * Math.PI * i) / kk + 1), -rr * Math.sin((2 * Math.PI * i) / kk + 1)]; }), sides: sd }; need(cvx(o.pts)); ok = 0; why = T('the sides are not all equal', 'sisinya tidak semua sama'); }
      const fig = F.polygon(Object.assign({ w: 260, h: 200 }, o, kd === 0 ? { ticks: Object.fromEntries(Array.from({ length: k }, (_, i) => [`${i}-${(i + 1) % k}`, 1])), sides: undefined } : {}));
      const ph = r.pick([['Is the polygon shown a regular polygon? Give a reason.', 'Adakah poligon yang ditunjukkan poligon sekata? Berikan satu sebab.'], ['Decide whether the polygon in the diagram is regular, and explain.', 'Tentukan sama ada poligon dalam rajah itu sekata, dan terangkan.']]);
      return { q: T(ph[0] + extra, ph[1] + (extra ? ' Semua sudut pedalamannya sama.' : '')), fig, a: ok ? T('Yes: all sides are equal and all angles are equal.', 'Ya: semua sisi sama dan semua sudut sama.') : T('No: ' + why.en + '.', 'Tidak: ' + why.ms + '.'), sp: 's' };
    },
    (r) => { const k = r.int(3, 10); return { q: Q(r.pick([['How many equal sides does a regular {nm} have?', 'Berapakah bilangan sisi yang sama bagi {mm} sekata?'], ['A regular {nm} has how many equal angles?', '{Mm} sekata mempunyai berapa banyak sudut yang sama?']]), { nm: PNM[k] }, { mm: PMS[k], Mm: SPM.cap(PMS[k]) }), a: T(`${k}`), sp: 'xs' }; },
  ];
  const m91S = [
    (r) => {
      const rows = r.sample(SH, 4), tb = (l, f) => SPM.table(rows.map((x) => [x[l], f ? YN(x[2], l) : '?', f ? YN(x[3], l) : '?', f ? YN(x[2] && x[3], l) : '?']), { head: l ? ['Bentuk', 'Semua sisi sama?', 'Semua sudut sama?', 'Poligon sekata?'] : ['Shape', 'All sides equal?', 'All angles equal?', 'Regular polygon?'] });
      return { q: T('Complete the table with Yes or No.<br>' + tb(0), 'Lengkapkan jadual dengan Ya atau Tidak.<br>' + tb(1)), a: T(tb(0, 1), tb(1, 1)), sp: 'm' };
    },
    (r) => {
      const xs = r.sample(RG, 5), L = 'ABCDE', reg = xs.map((x, i) => (x[2] ? L[i] : null)).filter(Boolean);
      need(reg.length >= 1 && reg.length <= 3);
      return { q: T('Which of these are regular polygons? ' + xs.map((x, i) => `(${L[i]}) ${x[0]}`).join('; ') + '.', 'Antara yang berikut, yang manakah poligon sekata? ' + xs.map((x, i) => `(${L[i]}) ${x[1]}`).join('; ') + '.'), a: T(reg.join(', ')), sp: 's' };
    },
    (r) => {
      const cv = r.chance(), a = r.int(50, 120), b = r.int(50, 120), c = r.int(50, 120), d = 360 - a - b - c, rf = r.int(200, 260), o1 = r.int(30, 60), o2 = r.int(30, 60), o3 = 360 - rf - o1 - o2;
      need(cv ? d > 20 && d < 170 : o3 > 15 && o3 < 120);
      const A = cv ? r.shuffle([a, b, c, d]) : r.shuffle([rf, o1, o2, o3]);
      return { q: Q(['The interior angles of a quadrilateral are {l}. Is the quadrilateral convex or concave? Give a reason.', 'Sudut pedalaman sebuah sisi empat ialah {l}. Adakah sisi empat itu cembung atau cekung? Berikan satu sebab.'], { l: mx(A.map((x) => x + '^\\circ').join(', ')) }), a: cv ? T('Convex: all four angles are less than $180^\\circ$.', 'Cembung: keempat-empat sudut kurang daripada $180^\\circ$.') : T(`Concave: one angle ($${rf}^\\circ$) is greater than $180^\\circ$.`, `Cekung: satu sudut ($${rf}^\\circ$) lebih besar daripada $180^\\circ$.`), sp: 's' };
    },
    (r) => {
      const k = r.int(5, 7), N = vn(r, k), { P, rv } = cavePts(r, k), o = outDiag(P, N);
      need(!cvx(P) && o.length >= 1 && o.length <= 3);
      return { q: Q(['The polygon {nm} shown is concave. Name the vertex at which the interior angle is greater than $180^\\circ$.', 'Poligon {nm} yang ditunjukkan ialah cekung. Namakan bucu yang sudut pedalamannya lebih besar daripada $180^\\circ$.'], { nm: mx(N.join('')) }), fig: F.polygon({ pts: P, names: N, w: 230, h: 190 }), a: T(mx(N[rv])), sp: 'xs' };
    },
    (r) => {
      const k = r.int(5, 7), N = vn(r, k), { P, rv } = cavePts(r, k), o = outDiag(P, N);
      need(!cvx(P) && o.length >= 1 && o.length <= 3);
      return { q: Q(['In the concave polygon {nm} shown, at least one diagonal does not lie completely inside the polygon. Write down such a diagonal.', 'Dalam poligon cekung {nm} yang ditunjukkan, sekurang-kurangnya satu pepenjuru tidak terletak sepenuhnya di dalam poligon. Tulis satu pepenjuru sedemikian.'], { nm: mx(N.join('')) }), fig: F.polygon({ pts: P, names: N, w: 230, h: 190 }), a: T(o.map(mx).join(' or '), o.map(mx).join(' atau ')), sp: 's' };
    },
    (r) => Object.assign({}, (() => { const x = r.pick([[4, 'concave quadrilateral (arrowhead)', 'sisi empat cekung (kepala anak panah)'], [5, 'concave pentagon', 'pentagon cekung'], [6, 'concave hexagon', 'heksagon cekung'], [5, 'convex pentagon that is not regular', 'pentagon cembung yang tidak sekata'], [4, 'convex quadrilateral with unequal sides', 'sisi empat cembung dengan sisi tidak sama'], [6, 'regular hexagon', 'heksagon sekata']]); const VV = mx(vn(r, x[0]).join(', ')); return { q: T(`Draw an example of a ${x[1]} and label its vertices ${VV}. Mark the equal sides, if any.`, `Lukis satu contoh ${x[2]} dan labelkan bucunya ${VV}. Tandakan sisi yang sama, jika ada.`), a: T(`Any correct sketch with ${x[0]} vertices: ${/concave/.test(x[1]) ? 'one interior angle is greater than $180^\\circ$' : /not regular|unequal/.test(x[1]) ? 'all angles less than $180^\\circ$ and sides not all equal' : 'all sides and angles equal'}.`, `Mana-mana lakaran yang betul dengan ${x[0]} bucu: ${/concave/.test(x[1]) ? 'satu sudut pedalaman lebih besar daripada $180^\\circ$' : /not regular|unequal/.test(x[1]) ? 'semua sudut kurang daripada $180^\\circ$ dan sisi tidak semua sama' : 'semua sisi dan sudut sama'}.`), sp: 'l' }; })()),
  ];
  const a91S = [
    (r) => {
      const k = r.pick([3, 4]), ang = r.chance(), nm = k === 3 ? ['triangle', 'segi tiga'] : ['quadrilateral', 'sisi empat'];
      return { q: Q(['Aina says: "Every {nm} with all {w} equal is a regular {nm}." Is she correct? Give a counter-example if she is wrong.', 'Aina berkata: "Setiap {mm} dengan semua {ww} sama ialah {mm} sekata." Adakah dia betul? Berikan satu contoh penyangkal jika dia salah.'], { nm: nm[0], w: ang ? 'angles' : 'sides' }, { mm: nm[1], ww: ang ? 'sudut' : 'sisi' }), a: k === 3 ? T('Correct: a triangle with equal sides (or equal angles, each $60^\\circ$) is equilateral, so it is regular.', 'Betul: segi tiga dengan sisi sama (atau sudut sama, setiap satu $60^\\circ$) ialah segi tiga sama sisi, jadi ia sekata.') : ang ? T('Not correct. Counter-example: a rectangle 3 cm by 5 cm has four equal angles ($90^\\circ$) but is not regular.', 'Tidak betul. Contoh penyangkal: segi empat tepat 3 cm kali 5 cm mempunyai empat sudut sama ($90^\\circ$) tetapi bukan sekata.') : T('Not correct. Counter-example: a rhombus with angles $60^\\circ$ and $120^\\circ$ has four equal sides but is not regular.', 'Tidak betul. Contoh penyangkal: rombus dengan sudut $60^\\circ$ dan $120^\\circ$ mempunyai empat sisi sama tetapi bukan sekata.'), sp: 'm' };
    },
    (r) => {
      const a = r.int(20, 60), b = r.int(20, 60), c = r.int(20, 60), x = 360 - (360 - a - b - c) ;
      const rf = 360 - a - b - c;
      need(rf > 190 && rf < 300);
      const nm = vn(r, 4);
      return { q: Q(['A concave quadrilateral (arrowhead) {nm} has three interior angles of $%a^\\circ$, $%b^\\circ$ and $%c^\\circ$. Find the reflex interior angle at the fourth vertex.'.replace('%a', a).replace('%b', b).replace('%c', c), 'Sisi empat cekung (kepala anak panah) {nm} mempunyai tiga sudut pedalaman $%a^\\circ$, $%b^\\circ$ dan $%c^\\circ$. Cari sudut pedalaman refleks pada bucu keempat.'.replace('%a', a).replace('%b', b).replace('%c', c)], { nm: mx(nm.join('')) }), a: T(`$${rf}^\\circ$`), w: T(`$360 - (${a} + ${b} + ${c}) = ${rf}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(5, 7), N = vn(r, k), { P, rv } = cavePts(r, k), o = outDiag(P, N), D = dT(k);
      need(!cvx(P) && o.length >= 1);
      return { q: Q(['The concave polygon {nm} shown has {D} diagonals in total. How many of them lie completely inside the polygon, and how many do not?', 'Poligon cekung {nm} yang ditunjukkan mempunyai {D} pepenjuru kesemuanya. Berapakah antaranya yang terletak sepenuhnya di dalam poligon, dan berapa yang tidak?'], { nm: mx(N.join('')), D }), fig: F.polygon({ pts: P, names: N, w: 230, h: 190 }), a: T(`Inside: ${D - o.length}; not completely inside: ${o.length} (${o.map(mx).join(', ')})`, `Di dalam: ${D - o.length}; tidak sepenuhnya di dalam: ${o.length} (${o.map(mx).join(', ')})`), sp: 'm' };
    },
    (r) => {
      const xs = r.sample(SH, 3), tb = (l, f) => SPM.table(xs.map((x) => [x[l], f ? YN(x[2], l) : '', f ? YN(x[3], l) : '', f ? YN(x[2] && x[3], l) : '']), { head: l ? ['Bentuk', 'Sisi sama?', 'Sudut sama?', 'Sekata?'] : ['Shape', 'Equal sides?', 'Equal angles?', 'Regular?'] });
      return { q: T('A polygon is regular only when both conditions hold. For each shape below, write Yes or No in every column and state which shape (if any) is regular.<br>' + tb(0), 'Poligon sekata hanya apabila kedua-dua syarat dipenuhi. Bagi setiap bentuk di bawah, tulis Ya atau Tidak dalam setiap lajur dan nyatakan bentuk yang sekata (jika ada).<br>' + tb(1)), a: T(tb(0, 1), tb(1, 1)), sp: 'm' };
    },
    (r) => { const k = r.int(4, 8), q = r.pick([['all its sides are equal', 'semua sisinya sama'], ['all its angles are equal', 'semua sudutnya sama']]); return { q: T(`${SPM.cap(AN(PNM[k]))} ${q[0]}. State one extra condition needed for it to be a regular polygon.`, `Sebuah ${PMS[k]} ${q[1]}. Nyatakan satu syarat tambahan yang diperlukan supaya ia menjadi poligon sekata.`), a: q[0].includes('sides') ? T('All its angles must also be equal.', 'Semua sudutnya juga mesti sama.') : T('All its sides must also be equal.', 'Semua sisinya juga mesti sama.'), sp: 's' }; },
  ];
  SPM.extend('F1-9.1S', { e: e91S, m: m91S, a: a91S });
  /* ================= F1-9.2 Triangles ================= */
  const TT = { eq: T('equilateral', 'sama sisi'), iso: T('isosceles', 'sama kaki'), sc: T('scalene', 'tak sama sisi'), ac: T('acute-angled', 'bersudut akut'), rt: T('right-angled', 'bersudut tegak'), ob: T('obtuse-angled', 'bersudut cakah') };
  const byAng = (a, b, c) => { const m = Math.max(a, b, c); return m < 90 ? TT.ac : m === 90 ? TT.rt : TT.ob; };
  const bySide = (a, b, c) => (a === b && b === c ? TT.eq : a === b || b === c || a === c ? TT.iso : TT.sc);
  const dg = (v) => `${v}°`, dd = (v) => `${v}^\\circ`;
  const VARS = ['x', 'y', 'p', 'k'];
  const NM3 = ['ABC', 'PQR', 'XYZ', 'LMN'];
  const tri = (o) => F.triangle(Object.assign({ w: 270, h: 175 }, o));
  const TFT = [
    ['The three angles of a triangle add up to $180^\\circ$.', 'Tiga sudut sebuah segi tiga berjumlah $180^\\circ$.', 1],
    ['A triangle can have two right angles.', 'Sebuah segi tiga boleh mempunyai dua sudut tegak.', 0, 'Two right angles already add up to $180^\\circ$, leaving no angle for the third vertex.', 'Dua sudut tegak sudah berjumlah $180^\\circ$, tiada sudut yang tinggal untuk bucu ketiga.'],
    ['A triangle can have two obtuse angles.', 'Sebuah segi tiga boleh mempunyai dua sudut cakah.', 0, 'Two obtuse angles add up to more than $180^\\circ$.', 'Dua sudut cakah berjumlah lebih daripada $180^\\circ$.'],
    ['Every angle of an equilateral triangle is $60^\\circ$.', 'Setiap sudut segi tiga sama sisi ialah $60^\\circ$.', 1],
    ['An isosceles triangle has two equal angles.', 'Segi tiga sama kaki mempunyai dua sudut yang sama.', 1],
    ['A right-angled triangle can also be isosceles.', 'Segi tiga bersudut tegak juga boleh menjadi segi tiga sama kaki.', 1],
    ['An exterior angle of a triangle equals the sum of the two interior opposite angles.', 'Sudut peluaran sebuah segi tiga sama dengan hasil tambah dua sudut pedalaman yang bertentangan.', 1],
    ['An exterior angle of a triangle equals the adjacent interior angle.', 'Sudut peluaran sebuah segi tiga sama dengan sudut pedalaman yang bersebelahan.', 0, 'An exterior angle and its adjacent interior angle add up to $180^\\circ$.', 'Sudut peluaran dan sudut pedalaman yang bersebelahan berjumlah $180^\\circ$.'],
    ['In an isosceles triangle the angles opposite the equal sides are equal.', 'Dalam segi tiga sama kaki, sudut yang bertentangan dengan sisi yang sama adalah sama.', 1],
  ];
  const DESC = [
    ['three equal sides', 'tiga sisi yang sama', 'eq', 'mempunyai tiga sisi yang sama'], ['exactly two equal sides', 'tepat dua sisi yang sama', 'iso', 'mempunyai tepat dua sisi yang sama'], ['no equal sides', 'tiada sisi yang sama', 'sc', 'tidak mempunyai sisi yang sama'],
    ['one angle of $90^\\circ$', 'satu sudut $90^\\circ$', 'rt', 'mempunyai satu sudut $90^\\circ$'], ['one angle greater than $90^\\circ$', 'satu sudut lebih besar daripada $90^\\circ$', 'ob', 'mempunyai satu sudut lebih besar daripada $90^\\circ$'], ['all three angles less than $90^\\circ$', 'ketiga-tiga sudut kurang daripada $90^\\circ$', 'ac', 'ketiga-tiga sudutnya kurang daripada $90^\\circ$'],
  ];
  const MODS = [['', ''], [' Show your working.', ' Tunjukkan langkah kerja anda.'], [' Give a reason for your answer.', ' Berikan sebab bagi jawapan anda.'], [' Write down the property of triangles that you use.', ' Tulis sifat segi tiga yang anda gunakan.']];
  const md = (r, q) => { const m = r.pick(MODS); return T(q.en + m[0], q.ms + m[1]); };
  const ntm = (r, q) => nts(md(r, q));
  const CLZ = [
    ['The angles of a triangle add up to ____ degrees.', 'Sudut sebuah segi tiga berjumlah ____ darjah.', '180'],
    ['A triangle with all three sides equal is called an ____ triangle.', 'Segi tiga yang ketiga-tiga sisinya sama dipanggil segi tiga ____.', 'equilateral', 'sama sisi'],
    ['A triangle with exactly two equal sides is called an ____ triangle.', 'Segi tiga yang tepat dua sisinya sama dipanggil segi tiga ____.', 'isosceles', 'sama kaki'],
    ['A triangle with no equal sides is called a ____ triangle.', 'Segi tiga yang tiada sisi sama dipanggil segi tiga ____.', 'scalene', 'tak sama sisi'],
    ['A triangle with one angle of $90^\\circ$ is called a ____ triangle.', 'Segi tiga yang mempunyai satu sudut $90^\\circ$ dipanggil segi tiga ____.', 'right-angled', 'bersudut tegak'],
    ['An exterior angle of a triangle equals the sum of the two interior ____ angles.', 'Sudut peluaran sebuah segi tiga sama dengan hasil tambah dua sudut pedalaman yang ____.', 'opposite', 'bertentangan'],
    ['The two angles at the base of an isosceles triangle are ____.', 'Dua sudut pada tapak segi tiga sama kaki adalah ____.', 'equal', 'sama'],
  ];
  const e92 = [
    (r) => { const c = r.pick(CLZ); return { q: T('Fill in the blank. ' + c[0], 'Isikan tempat kosong. ' + c[1]), a: T(c[2], c[3] || c[2]), sp: 'xs' }; },
    (r) => {
      const A = r.int(20, 100), B = r.int(20, 100), C = 180 - A - B, u = r.pick(['A', 'B', 'C']), v = r.pick(VARS), val = { A, B, C };
      need(C >= 20);
      const ang = {}; for (const k of 'ABC') ang[k] = k === u ? v : dg(val[k]);
      return { q: ntm(r, Q(r.pick([['Find the value of {v}.', 'Cari nilai {v}.'], ['Calculate the size of the angle marked {v}.', 'Hitung saiz sudut yang ditandakan {v}.'], ['Find {v}. State the sum of the angles of a triangle that you used.', 'Cari {v}. Nyatakan hasil tambah sudut segi tiga yang anda gunakan.']]), { v: mx(v) })), fig: tri({ a: A, b: B, angles: ang }), a: T(`$${v} = ${val[u]}$`), w: T(`$180 - ${180 - val[u]} = ${val[u]}$`), sp: 's' };
    },
    (r) => {
      const a = r.int(20, 100), b = r.int(20, 100), c = 180 - a - b, ctx = r.pick([['A triangular flag has', 'Sebuah bendera segi tiga mempunyai'], ['A triangular garden plot has', 'Sebidang tanah taman segi tiga mempunyai'], ['A set square has', 'Sebuah sesiku mempunyai'], ['A roof truss has', 'Kekuda bumbung mempunyai'], ['A triangle has', 'Sebuah segi tiga mempunyai']]);
      need(c >= 15);
      return { q: Q(['{c} two angles of ${a}^\\circ$ and ${b}^\\circ$. Find its third angle.'.replace('${a}', '$' + a).replace('${b}', '$' + b), '{c} dua sudut ${a}^\\circ$ dan ${b}^\\circ$. Cari sudut ketiganya.'.replace('${a}', '$' + a).replace('${b}', '$' + b)].map((s, i) => s.replace('{c}', ctx[i])), {}), a: T(`$${dd(c)}$`), w: T(`$180 - ${a} - ${b}$`), sp: 'xs' };
    },
    (r) => {
      const t = r.int(0, 2), a = t === 2 ? 90 : r.int(20, 80), b = r.int(20, 70), c = 180 - a - b;
      need(c > 10 && (t === 2 || (a !== 90 && b !== 90 && c !== 90)));
      const type = byAng(a, b, c), three = r.chance();
      return { q: three ? T(`The angles of a triangle are $${dd(a)}$, $${dd(b)}$ and $${dd(c)}$. Classify the triangle by its angles.`, `Sudut-sudut sebuah segi tiga ialah $${dd(a)}$, $${dd(b)}$ dan $${dd(c)}$. Kelaskan segi tiga itu mengikut sudutnya.`) : T(`Two angles of a triangle are $${dd(a)}$ and $${dd(b)}$. Is the triangle acute-angled, right-angled or obtuse-angled?`, `Dua sudut sebuah segi tiga ialah $${dd(a)}$ dan $${dd(b)}$. Adakah segi tiga itu bersudut akut, bersudut tegak atau bersudut cakah?`), a: T(type.en + (three ? '' : ` (third angle $${dd(c)}$)`), type.ms + (three ? '' : ` (sudut ketiga $${dd(c)}$)`)), sp: 'xs' };
    },
    (r) => {
      const B = r.int(35, 110), ext = 180 - B, v = r.pick(VARS), A = r.int(25, 60), fr = r.chance();
      need(180 - A - B > 15);
      const fig = tri({ a: A, b: B, angles: { B: v }, ext: { from: 'A', at: 'B', label: dg(ext) } });
      return { q: ntm(r, Q(fr ? ['The exterior angle at $B$ is $%e^\\circ$. Find the interior angle {v} at $B$.'.replace('%e', ext), 'Sudut peluaran di $B$ ialah $%e^\\circ$. Cari sudut pedalaman {v} di $B$.'.replace('%e', ext)] : ['Side $AB$ is extended to form the exterior angle shown. Find {v}.', 'Sisi $AB$ dipanjangkan untuk membentuk sudut peluaran yang ditunjukkan. Cari {v}.'], { v: mx(v) })), fig, a: T(`$${v} = ${B}$`), w: T(`$180 - ${ext} = ${B}$ (angles on a straight line)`, `$180 - ${ext} = ${B}$ (sudut pada garis lurus)`), sp: 's' };
    },
    (r) => { const t = r.pick(TFT); return { q: T(`True or false? ${t[0]}`, `Benar atau palsu? ${t[1]}`), a: TF(t[2], t[3], t[4]), sp: 'xs' }; },
    (r) => { const d = r.pick(DESC), nm = TT[d[2]]; return { q: T(`Name the type of triangle that has ${d[0]}.`, `Namakan jenis segi tiga yang ${d[3]}.`), a: T(nm.en, nm.ms), sp: 'xs' }; },
    (r) => {
      const k = r.pick([1, 2, 3]), tk = k === 3 ? { '0-1': 1, '1-2': 1, '2-0': 1 } : k === 2 ? { '0-2': 1, '1-2': 1 } : {};
      const fig = F.polygon({ pts: k === 3 ? [[0, 0], [4, 0], [2, -3.46]] : k === 2 ? [[0, 0], [4, 0], [2, -3]] : [[0, 0], [4, 0], [1.6, -2.8]], names: ['A', 'B', 'C'], ticks: tk, w: 250, h: 170 });
      return { q: Q(r.pick([['Classify the triangle shown by its sides. The tick marks show sides of equal length.', 'Kelaskan segi tiga yang ditunjukkan mengikut sisinya. Tanda palang menunjukkan sisi yang sama panjang.'], ['Use the tick marks to decide whether the triangle is equilateral, isosceles or scalene.', 'Gunakan tanda palang untuk menentukan sama ada segi tiga itu sama sisi, sama kaki atau tak sama sisi.']]), {}), fig, a: k === 3 ? TT.eq : k === 2 ? TT.iso : TT.sc, sp: 'xs' };
    },
    (r) => {
      const v = r.pick(['A', 'B', 'C']), x = r.int(20, 70), vr = r.pick(VARS), o = 'ABC'.replace(v, '').split('');
      const val = { A: v === 'A' ? 90 : v === 'B' ? x : 90 - x, B: v === 'B' ? 90 : x }; val.C = 180 - val.A - val.B;
      const kn = r.pick(o), un = o.find((c) => c !== kn);
      return { q: ntm(r, T(`The triangle has a right angle. Find the value of ${mx(vr)}.`, `Segi tiga itu mempunyai satu sudut tegak. Cari nilai ${mx(vr)}.`)), fig: tri({ a: val.A, b: val.B, right: v, angles: { [kn]: dg(val[kn]), [un]: vr } }), a: T(`$${vr} = ${val[un]}$`), w: T(`$90 + ${val[kn]} + ${vr} = 180$`), sp: 's' };
    },
  ];
  SPM.extend('F1-9.2', { e: e92 });
  const pa = (e) => (/^[a-z]$/.test(e) ? e : `(${e})`);
  const isoFig = (apex, base, lab, o) => {
    const ap = 180 - 2 * base, a = apex === 'A' ? ap : base, b = apex === 'B' ? ap : base, tk = { A: { AB: 1, AC: 1 }, B: { AB: 1, BC: 1 }, C: { AC: 1, BC: 1 } }[apex];
    return tri(Object.assign({ a, b, ticks: tk, angles: lab }, o || {}));
  };
  const CTX92 = [['triangular roof frame', 'kerangka bumbung segi tiga'], ['triangular sail', 'layar segi tiga'], ['triangular road sign', 'papan tanda jalan segi tiga'], ['triangular flag', 'bendera segi tiga'], ['triangular garden bed', 'batas taman segi tiga'], ['triangular tile', 'jubin segi tiga']];
  const REL2 = [[['is the same as', 'ialah sama dengan'], 0, 1], [['is $10^\\circ$ more than', 'ialah $10^\\circ$ lebih daripada'], 10, 1], [['is $20^\\circ$ less than', 'ialah $20^\\circ$ kurang daripada'], -20, 1], [['is twice', 'ialah dua kali'], 0, 2], [['is $10^\\circ$ more than twice', 'ialah $10^\\circ$ lebih daripada dua kali'], 10, 2]];
  const REL3 = [[['equal to', 'sama dengan'], 1], [['twice', 'dua kali'], 2], [['three times', 'tiga kali'], 3]];
  const m92 = [
    (r) => {
      const A = r.int(30, 80), B = r.int(40, 100), C = 180 - A - B, e = A + C, u = r.pick(['e', 'C', 'A']), v = r.pick(VARS);
      need(C >= 25);
      const ang = { A: u === 'A' ? v : dg(A), C: u === 'C' ? v : dg(C) };
      const ph = r.pick([['Find the value of {v}. Give the reason for your working.', 'Cari nilai {v}. Berikan sebab bagi penyelesaian anda.'], ['Find {v}.', 'Cari {v}.'], ['Use the exterior angle of the triangle to find {v}.', 'Gunakan sudut peluaran segi tiga itu untuk mencari {v}.']]);
      return { q: ntm(r, Q(ph, { v: mx(v) })), fig: tri({ a: A, b: B, angles: ang, ext: { from: 'A', at: 'B', label: u === 'e' ? v : dg(e) } }), a: T(`$${v} = ${u === 'e' ? e : u === 'C' ? C : A}$`), w: T(`Exterior angle = sum of the two interior opposite angles: $${dd(e)} = ${dd(A)} + ${dd(C)}$`, `Sudut peluaran = hasil tambah dua sudut pedalaman yang bertentangan: $${dd(e)} = ${dd(A)} + ${dd(C)}$`), sp: 's' };
    },
    (r) => {
      const a = r.step(20, 100, 2), pos = r.chance();
      need(a !== 60 && (a <= 80 || a >= 92));
      const opt = a < 90 ? [[a, 180 - 2 * a], [(180 - a) / 2, (180 - a) / 2]] : [[(180 - a) / 2, (180 - a) / 2]];
      const ans = opt.map((p) => `$${dd(a)}, ${dd(p[0])}, ${dd(p[1])}$`);
      return { q: Q(['One angle of an isosceles triangle is $%a^\\circ$. Find the other two angles. (There may be more than one possibility.)'.replace('%a', a), 'Satu sudut sebuah segi tiga sama kaki ialah $%a^\\circ$. Cari dua sudut yang lain. (Mungkin ada lebih daripada satu kemungkinan.)'.replace('%a', a)], {}), a: T(opt.length === 2 ? `Two possibilities: ${ans.join(' or ')}` : `Only one possibility (an obtuse angle must be the apex): ${ans[0]}`, opt.length === 2 ? `Dua kemungkinan: ${ans.join(' atau ')}` : `Hanya satu kemungkinan (sudut cakah mestilah sudut puncak): ${ans[0]}`), sp: 's' };
    },
    (r) => {
      const apex = r.pick(['A', 'B', 'C']), base = r.int(35, 75), v = r.pick(VARS), gv = r.pick(['apex', 'base']), ap = 180 - 2 * base;
      const others = 'ABC'.replace(apex, '').split(''), kn = gv === 'base' ? others[0] : apex;
      const un = gv === 'base' ? r.pick([apex, others[1]]) : others[0];
      const val = { [apex]: ap, [others[0]]: base, [others[1]]: base };
      const eqn = apex === 'C' ? '$AC = BC$' : apex === 'A' ? '$AB = AC$' : '$AB = BC$';
      return { q: ntm(r, T(`The triangle is isosceles with ${eqn}. Find the value of ${mx(v)}.`, `Segi tiga itu sama kaki dengan ${eqn}. Cari nilai ${mx(v)}.`)), fig: isoFig(apex, base, { [kn]: dg(val[kn]), [un]: v }), a: T(`$${v} = ${val[un]}$`), sp: 's' };
    },
    (r) => {
      const A2 = r.pick([[1, 2], [2, 1], [1, 3], [3, 2], [2, 3]]), a1 = A2[0], a2 = A2[1], n3 = r.int(30, 80), tot = 180 - n3, s = a1 + a2;
      need(tot % s === 0);
      const xx = tot / s, v = r.pick(VARS), fg = r.chance(), ang = { A: `${lin(a1, 0, v)}°`, B: `${lin(a2, 0, v)}°`, C: dg(n3) };
      return { q: fg ? ntm(r, T(`Find the value of ${mx(v)} and the size of the largest angle.`, `Cari nilai ${mx(v)} dan saiz sudut yang terbesar.`)) : T(`The angles of a triangle are $${pa(lin(a1, 0, v))}^\\circ$, $${pa(lin(a2, 0, v))}^\\circ$ and $${dd(n3)}$. Find ${mx(v)} and the smallest angle.`, `Sudut-sudut sebuah segi tiga ialah $${pa(lin(a1, 0, v))}^\\circ$, $${pa(lin(a2, 0, v))}^\\circ$ dan $${dd(n3)}$. Cari ${mx(v)} dan sudut yang terkecil.`), fig: fg ? tri({ a: a1 * xx, b: a2 * xx, angles: ang }) : undefined, a: T(`$${v} = ${xx}$; ${fg ? 'largest' : 'smallest'} angle $${dd(fg ? Math.max(a1 * xx, a2 * xx, n3) : Math.min(a1 * xx, a2 * xx, n3))}$`, `$${v} = ${xx}$; sudut ${fg ? 'terbesar' : 'terkecil'} $${dd(fg ? Math.max(a1 * xx, a2 * xx, n3) : Math.min(a1 * xx, a2 * xx, n3))}$`), w: T(`$${lin(a1 + a2, 0, v)} + ${n3} = 180$`), sp: 'm' };
    },
    (r) => {
      const a1 = r.int(2, 4), a2 = r.int(1, a1 - 1), x = r.int(8, 25), n = r.int(30, 70), c = n + a2 * x - a1 * x, v = r.pick(VARS), C = a2 * x, A = n;
      need(c !== 0 && Math.abs(c) <= 40 && A + C < 165 && A + C > 60);
      return { q: ntm(r, T(`The exterior angle is $(${lin(a1, c, v)})^\\circ$ and the two interior opposite angles are $${dd(A)}$ and $${pa(lin(a2, 0, v))}^\\circ$. Find the value of ${mx(v)}.`, `Sudut peluaran ialah $(${lin(a1, c, v)})^\\circ$ dan dua sudut pedalaman yang bertentangan ialah $${dd(A)}$ dan $${pa(lin(a2, 0, v))}^\\circ$. Cari nilai ${mx(v)}.`)), fig: tri({ a: A, b: 180 - A - C, angles: { A: dg(A), C: `${lin(a2, 0, v)}°` }, ext: { from: 'A', at: 'B', label: `${lin(a1, c, v)}°` } }), a: T(`$${v} = ${x}$`), w: T(`$${lin(a1, c, v)} = ${A} + ${lin(a2, 0, v)}$`), sp: 'm' };
    },
    (r) => {
      const A = r.int(30, 75), B = r.int(45, 100), C = 180 - A - B, e = A + C;
      need(C >= 25 && A !== C);
      const good = { t: lt(mx(dd(e))), ok: true }, ds = [180 - e, Math.abs(A - C), 180 - A, e + 10].filter((v, i, a) => v !== e && a.indexOf(v) === i && v > 0).slice(0, 3);
      need(ds.length === 3);
      const m = mc(r, [good, ...ds.map((v) => ({ t: lt(mx(dd(v))), ok: false }))]);
      return { q: ntm(r, T(`In the figure, what is the value of $x$? ${m.en}`, `Dalam rajah itu, apakah nilai $x$? ${m.ms}`)), fig: tri({ a: A, b: B, angles: { A: dg(A), C: dg(C) }, ext: { from: 'A', at: 'B', label: 'x°' } }), a: m.ans, w: T(`$x = ${A} + ${C}$`), sp: 's' };
    },
    (r) => {
      const t = r.pick([[1, 2, 3], [2, 3, 4], [1, 1, 2], [3, 4, 5], [1, 2, 6], [2, 3, 5], [1, 4, 5]]), s = t[0] + t[1] + t[2], k = 180 / s;
      need(Number.isInteger(k));
      const A = t.map((v) => v * k);
      return { q: T(`The angles of a triangle are in the ratio $${t.join(' : ')}$. Find the three angles and classify the triangle by its angles.`, `Sudut-sudut sebuah segi tiga berada dalam nisbah $${t.join(' : ')}$. Cari ketiga-tiga sudut itu dan kelaskan segi tiga itu mengikut sudutnya.`), a: T(`${A.map((v) => `$${dd(v)}$`).join(', ')}; ${byAng(...A).en}`, `${A.map((v) => `$${dd(v)}$`).join(', ')}; ${byAng(...A).ms}`), w: T(`$180 \\div ${s} = ${k}$`), sp: 'm' };
    },
  ];
  SPM.extend('F1-9.2', { m: m92 });
  const POSS = [
    ['an equilateral triangle with an obtuse angle', 'segi tiga sama sisi dengan satu sudut cakah', 0, 'each angle of an equilateral triangle is $60^\\circ$', 'setiap sudut segi tiga sama sisi ialah $60^\\circ$'],
    ['an isosceles triangle with a right angle', 'segi tiga sama kaki dengan satu sudut tegak', 1, 'angles $90^\\circ$, $45^\\circ$, $45^\\circ$', 'sudut $90^\\circ$, $45^\\circ$, $45^\\circ$'],
    ['a scalene triangle with a right angle', 'segi tiga tak sama sisi dengan satu sudut tegak', 1, 'angles $90^\\circ$, $30^\\circ$, $60^\\circ$', 'sudut $90^\\circ$, $30^\\circ$, $60^\\circ$'],
    ['a triangle with two right angles', 'segi tiga dengan dua sudut tegak', 0, 'two right angles already add up to $180^\\circ$', 'dua sudut tegak sudah berjumlah $180^\\circ$'],
    ['an isosceles triangle with an obtuse angle', 'segi tiga sama kaki dengan satu sudut cakah', 1, 'angles $100^\\circ$, $40^\\circ$, $40^\\circ$', 'sudut $100^\\circ$, $40^\\circ$, $40^\\circ$'],
    ['an isosceles triangle with two obtuse angles', 'segi tiga sama kaki dengan dua sudut cakah', 0, 'two obtuse angles add up to more than $180^\\circ$', 'dua sudut cakah berjumlah lebih daripada $180^\\circ$'],
    ['a right-angled triangle with an obtuse angle', 'segi tiga bersudut tegak dengan satu sudut cakah', 0, 'a right angle and an obtuse angle add up to more than $180^\\circ$', 'satu sudut tegak dan satu sudut cakah berjumlah lebih daripada $180^\\circ$'],
    ['a scalene triangle with three acute angles', 'segi tiga tak sama sisi dengan tiga sudut akut', 1, 'angles $50^\\circ$, $60^\\circ$, $70^\\circ$', 'sudut $50^\\circ$, $60^\\circ$, $70^\\circ$'],
    ['an equilateral triangle with a right angle', 'segi tiga sama sisi dengan satu sudut tegak', 0, 'each angle of an equilateral triangle is $60^\\circ$', 'setiap sudut segi tiga sama sisi ialah $60^\\circ$'],
    ['a triangle with angles $90^\\circ$, $45^\\circ$ and $46^\\circ$', 'segi tiga dengan sudut $90^\\circ$, $45^\\circ$ dan $46^\\circ$', 0, 'the angles add up to $181^\\circ$', 'sudut-sudut itu berjumlah $181^\\circ$'],
  ];
  const a92 = [
    (r) => {
      const A2 = r.pick([[2, 3, 4], [3, 2, 1], [1, 4, 2], [2, 1, 3], [4, 2, 1]]), v = r.pick(VARS), x = r.int(10, 30), c = [r.int(-15, 25), r.int(-10, 20)];
      const s = A2[0] + A2[1] + A2[2], c3 = 180 - s * x - c[0] - c[1];
      need(Math.abs(c3) <= 30 && c3 !== 0 && c.every((q) => q !== 0));
      const E = [lin(A2[0], c[0], v), lin(A2[1], c[1], v), lin(A2[2], c3, v)], V = [A2[0] * x + c[0], A2[1] * x + c[1], A2[2] * x + c3], ask = r.int(0, 2);
      need(V.every((q) => q > 15));
      return { q: T(`The three angles of a triangle are $(${E[0]})^\\circ$, $(${E[1]})^\\circ$ and $(${E[2]})^\\circ$. Find the value of ${mx(v)}${['. Then classify the triangle by its angles.', ' and the difference between the largest and smallest angles.', ' and the size of each angle.'][ask]}`, `Tiga sudut sebuah segi tiga ialah $(${E[0]})^\\circ$, $(${E[1]})^\\circ$ dan $(${E[2]})^\\circ$. Cari nilai ${mx(v)}${['. Kemudian kelaskan segi tiga itu mengikut sudutnya.', ' dan beza antara sudut terbesar dengan sudut terkecil.', ' dan saiz setiap sudut.'][ask]}`), a: T(`$${v} = ${x}$; ` + [byAng(...V).en, `$${dd(Math.max(...V) - Math.min(...V))}$`, V.map((q) => `$${dd(q)}$`).join(', ')][ask], `$${v} = ${x}$; ` + [byAng(...V).ms, `$${dd(Math.max(...V) - Math.min(...V))}$`, V.map((q) => `$${dd(q)}$`).join(', ')][ask]), w: T(`$${lin(s, c[0] + c[1] + c3, v)} = 180$`), sp: 'm' };
    },
    (r) => {
      const apex = r.pick(['A', 'B', 'C']), x = r.int(10, 30), a1 = r.int(2, 4), a2 = r.int(1, a1 - 1), c1 = r.int(-10, 20), base = a1 * x + c1, c2 = base - a2 * x, v = r.pick(VARS), ap = 180 - 2 * base;
      need(c2 !== 0 && Math.abs(c2) <= 40 && ap >= 20 && base >= 25 && c1 !== 0);
      const oth = 'ABC'.replace(apex, '').split('');
      const eqn = apex === 'C' ? '$AC = BC$' : apex === 'A' ? '$AB = AC$' : '$AB = BC$';
      return { q: ntm(r, T(`The triangle is isosceles with ${eqn}. The two equal angles are $(${lin(a1, c1, v)})^\\circ$ and $(${lin(a2, c2, v)})^\\circ$, and the third angle is $${dd(ap)}$. Find ${mx(v)} and hence check that the angles add up to $180^\\circ$.`, `Segi tiga itu sama kaki dengan ${eqn}. Dua sudut yang sama ialah $(${lin(a1, c1, v)})^\\circ$ dan $(${lin(a2, c2, v)})^\\circ$, dan sudut ketiga ialah $${dd(ap)}$. Cari ${mx(v)} dan seterusnya semak bahawa jumlah sudut ialah $180^\\circ$.`)), fig: isoFig(apex, base, { [apex]: dg(ap), [oth[0]]: `${lin(a1, c1, v)}°`, [oth[1]]: `${lin(a2, c2, v)}°` }), a: T(`$${v} = ${x}$; angles $${dd(base)}, ${dd(base)}, ${dd(ap)}$`, `$${v} = ${x}$; sudut $${dd(base)}, ${dd(base)}, ${dd(ap)}$`), w: T(`$${lin(a1, c1, v)} = ${lin(a2, c2, v)}$`), sp: 'm' };
    },
    (r) => {
      const form = r.int(0, 2), tn = (v) => Math.tan((v * Math.PI) / 180);
      if (form === 0) {
        const b = r.int(40, 70), c = r.int(25, 50), d = 4, h = (d / 2) * tn(b), cx = d / 2 + h / tn(c);
        need(b > c + 12);
        const fig = F.polygon({ pts: [[d / 2, -h], [0, 0], [cx, 0]], names: ['A', 'B', 'C'], ticks: { '0-1': 1 }, w: 300, h: 180, extra: (P) => { const D = [P[1][0] + ((P[2][0] - P[1][0]) * d) / cx, P[1][1]]; return S.line(P[0][0], P[0][1], D[0], D[1]) + S.text(D[0], D[1] + 14, 'D', { i: true }) + S.tick(P[0], D, 1) + S.arc(P[1], P[2], P[0], 20, dg(b), { gap: 14 }) + S.arc(P[2], P[0], P[1], 24, dg(c), { gap: 15 }); } });
        return { q: ntm(r, T(`In the figure, $D$ is a point on $BC$ and $AB = AD$. Given $\\angle ABD = ${dd(b)}$ and $\\angle ACD = ${dd(c)}$, find (a) $\\angle ADB$, (b) $\\angle ADC$, (c) $\\angle DAC$.`, `Dalam rajah itu, $D$ ialah satu titik pada $BC$ dan $AB = AD$. Diberi $\\angle ABD = ${dd(b)}$ dan $\\angle ACD = ${dd(c)}$, cari (a) $\\angle ADB$, (b) $\\angle ADC$, (c) $\\angle DAC$.`)), fig, a: T(`(a) $${dd(b)}$ (b) $${dd(180 - b)}$ (c) $${dd(b - c)}$`), w: T(`$\\triangle ABD$ is isosceles; $\\angle ADC = 180^\\circ - ${b}^\\circ$; $\\angle DAC = 180^\\circ - ${180 - b}^\\circ - ${c}^\\circ$`, `$\\triangle ABD$ ialah segi tiga sama kaki; $\\angle ADC = 180^\\circ - ${b}^\\circ$; $\\angle DAC = 180^\\circ - ${180 - b}^\\circ - ${c}^\\circ$`), sp: 'l' };
      }
      const bb = r.int(30, 65), cc = r.int(30, 65), hh = 2.6, dx = hh / tn(bb), cx = dx + hh / tn(cc), all = form === 1;
      const fig = F.polygon({ pts: [[dx, -hh], [0, 0], [cx, 0]], names: ['A', 'B', 'C'], w: 300, h: 180, extra: (P) => { const D = [P[0][0], P[1][1]]; return S.line(P[0][0], P[0][1], D[0], D[1]) + S.text(D[0], D[1] + 14, 'D', { i: true }) + S.rightAngle(D, P[0], P[2], 8); } });
      return { q: ntm(r, T(`In the figure, $AD \\perp BC$, $\\angle ABC = ${dd(bb)}$ and $\\angle ACB = ${dd(cc)}$. Find ${all ? '(a) $\\angle BAD$, (b) $\\angle DAC$, (c) $\\angle BAC$' : '$\\angle BAC$ in two different ways'}.`, `Dalam rajah itu, $AD \\perp BC$, $\\angle ABC = ${dd(bb)}$ dan $\\angle ACB = ${dd(cc)}$. Cari ${all ? '(a) $\\angle BAD$, (b) $\\angle DAC$, (c) $\\angle BAC$' : '$\\angle BAC$ dengan dua cara yang berbeza'}.`)), fig, a: all ? T(`(a) $${dd(90 - bb)}$ (b) $${dd(90 - cc)}$ (c) $${dd(180 - bb - cc)}$`) : T(`$${dd(180 - bb - cc)}$: $180 - ${bb} - ${cc}$, or $(90 - ${bb}) + (90 - ${cc})$`), sp: 'l' };
    },
    (r) => {
      const b = r.int(35, 75), c = r.int(35, 75), form = r.int(0, 1), tn = (v) => Math.tan((v * Math.PI) / 180);
      need(b + c < 140);
      const A = [Math.max(1.2, 2 * tn(b) > 0 ? 0 : 0), 0];
      const Bp = [-2 / tn(b) * 0 - 2 / tn(b), 2], Cp = [2 / tn(c), 2];
      // A at origin (top), B down-left, C down-right; line PQ through A parallel to BC (or DE parallel to BC lower)
      const pts = [[0, 0], [-2 / tn(b), 2], [2 / tn(c), 2]];
      let fig, ask;
      if (form === 0) {
        fig = F.polygon({ pts, names: ['A', 'B', 'C'], w: 300, h: 180, extra: (P) => { const L = [P[0][0] - 90, P[0][1]], R = [P[0][0] + 90, P[0][1]]; return S.line(L[0], L[1], R[0], R[1]) + S.text(L[0] - 8, L[1], 'P', { i: true }) + S.text(R[0] + 8, R[1], 'Q', { i: true }) + S.arc(P[0], L, P[1], 24, dg(b), { gap: 14 }) + S.arc(P[0], R, P[2], 24, dg(c), { gap: 14 }); } });
        ask = T(`In the figure, $PQ \\parallel BC$, $\\angle PAB = ${dd(b)}$ and $\\angle QAC = ${dd(c)}$. Find $\\angle ABC$, $\\angle ACB$ and $\\angle BAC$.`, `Dalam rajah itu, $PQ \\parallel BC$, $\\angle PAB = ${dd(b)}$ dan $\\angle QAC = ${dd(c)}$. Cari $\\angle ABC$, $\\angle ACB$ dan $\\angle BAC$.`);
        return { q: ntm(r, ask), fig, a: T(`$\\angle ABC = ${dd(b)}$, $\\angle ACB = ${dd(c)}$ (alternate angles); $\\angle BAC = ${dd(180 - b - c)}$`, `$\\angle ABC = ${dd(b)}$, $\\angle ACB = ${dd(c)}$ (sudut selang-seli); $\\angle BAC = ${dd(180 - b - c)}$`), sp: 'l' };
      }
      fig = F.polygon({ pts, names: ['A', 'B', 'C'], w: 300, h: 180, extra: (P) => { const t = 0.45, D = [P[0][0] + (P[1][0] - P[0][0]) * t, P[0][1] + (P[1][1] - P[0][1]) * t], E = [P[0][0] + (P[2][0] - P[0][0]) * t, P[0][1] + (P[2][1] - P[0][1]) * t]; return S.line(D[0], D[1], E[0], E[1]) + S.text(D[0] - 9, D[1], 'D', { i: true }) + S.text(E[0] + 9, E[1], 'E', { i: true }); } });
      return { q: ntm(r, T(`In triangle $ABC$, $D$ is on $AB$ and $E$ is on $AC$ with $DE \\parallel BC$. $\\angle ABC = ${dd(b)}$ and $\\angle ACB = ${dd(c)}$. Find (a) $\\angle ADE$, (b) $\\angle AED$, (c) $\\angle BAC$.`, `Dalam segi tiga $ABC$, $D$ terletak pada $AB$ dan $E$ pada $AC$ dengan $DE \\parallel BC$. $\\angle ABC = ${dd(b)}$ dan $\\angle ACB = ${dd(c)}$. Cari (a) $\\angle ADE$, (b) $\\angle AED$, (c) $\\angle BAC$.`)), fig, a: T(`(a) $${dd(b)}$ (b) $${dd(c)}$ (corresponding angles) (c) $${dd(180 - b - c)}$`, `(a) $${dd(b)}$ (b) $${dd(c)}$ (sudut sepadan) (c) $${dd(180 - b - c)}$`), sp: 'l' };
    },
    (r) => {
      const A = r.int(30, 70), e = r.int(A + 30, 150), v = r.pick(['x', 'p']), w = r.pick(['y', 'q']);
      const Bv = e - A, Cv = 180 - e;
      need(Cv >= 25 && Bv >= 25);
      const lv = mx(v + ' = \\angle B'), lw = mx(w + ' = \\angle ACB'), sm = mx(v + ' + ' + w);
      return { q: ntm(r, T(`In the figure, the exterior angle at $C$ is $${dd(e)}$ and $\\angle A = ${dd(A)}$. Find ${lv}, ${lw} and ${sm}.`, `Dalam rajah itu, sudut peluaran di $C$ ialah $${dd(e)}$ dan $\\angle A = ${dd(A)}$. Cari ${lv}, ${lw} dan ${sm}.`)), fig: tri({ a: A, b: Bv, angles: { A: dg(A), B: v, C: w }, ext: { from: 'B', at: 'C', label: dg(e) } }), a: T(`$${v} = ${Bv}$, $${w} = ${Cv}$, $${v} + ${w} = ${180 - A}$`), w: T(`$${v} = ${e} - ${A}$; $${w} = 180 - ${e}$`), sp: 'm' };
    },
    (r) => {
      const e = r.int(105, 150), C = 180 - e, ap = 180 - 2 * C;
      need(ap >= 20);
      return { q: ntm(r, T(`In the figure, $AB = AC$ and $BC$ is extended to $D$. The exterior angle $\\angle ACD = ${dd(e)}$. Find (a) $\\angle ACB$, (b) $\\angle ABC$, (c) $\\angle BAC$.`, `Dalam rajah itu, $AB = AC$ dan $BC$ dipanjangkan ke $D$. Sudut peluaran $\\angle ACD = ${dd(e)}$. Cari (a) $\\angle ACB$, (b) $\\angle ABC$, (c) $\\angle BAC$.`)), fig: tri({ a: ap, b: C, ticks: { AB: 1, AC: 1 }, ext: { from: 'B', at: 'C', label: dg(e) } }), a: T(`(a) $${dd(C)}$ (b) $${dd(C)}$ (c) $${dd(ap)}$`), w: T(`$180 - ${e} = ${C}$`), sp: 'm' };
    },
    (r) => {
      const x = r.pick(POSS);
      return { q: T(`Ravi says that there is ${x[0]}. Is he correct? Explain your answer.`, `Ravi berkata bahawa wujud ${x[1]}. Adakah dia betul? Terangkan jawapan anda.`), a: T(`${x[2] ? 'Yes' : 'No'}: ${x[3]}.`, `${x[2] ? 'Ya' : 'Tidak'}: ${x[4]}.`), sp: 's' };
    },
  ];
  SPM.extend('F1-9.2', { a: a92 });
  const CTX2 = [['a triangular roof truss', 'kekuda bumbung segi tiga'], ['a triangular pennant', 'panji segi tiga'], ['a triangular shelf bracket', 'pendakap rak segi tiga'], ['a triangular kite frame', 'kerangka wau segi tiga'], ['a triangular picnic mat', 'tikar berkelah segi tiga'], ['a triangular signboard', 'papan tanda segi tiga']];
  const PP = [ // parts pool: [en, ms, fn(a,b,c) -> answer string]
    ['Find $\\angle C$.', 'Cari $\\angle C$.', (a, b, c) => `$${dd(c)}$`],
    ['Classify the triangle by its angles.', 'Kelaskan segi tiga itu mengikut sudutnya.', (a, b, c) => byAng(a, b, c)],
    ['Side $BC$ is extended to $D$. Find the exterior angle $\\angle ACD$.', 'Sisi $BC$ dipanjangkan ke $D$. Cari sudut peluaran $\\angle ACD$.', (a, b, c) => `$${dd(a + b)}$`],
    ['Side $AB$ is extended to $E$ beyond $B$. Find the exterior angle at $B$.', 'Sisi $AB$ dipanjangkan ke $E$ melepasi $B$. Cari sudut peluaran di $B$.', (a, b, c) => `$${dd(180 - b)}$`],
    ['Find the difference between the largest and the smallest angle.', 'Cari beza antara sudut terbesar dengan sudut terkecil.', (a, b, c) => `$${dd(Math.max(a, b, c) - Math.min(a, b, c))}$`],
    ['Is the triangle isosceles? Give a reason.', 'Adakah segi tiga itu sama kaki? Berikan sebab.', (a, b, c) => (new Set([a, b, c]).size < 3 ? T('Yes: two angles are equal.', 'Ya: dua sudut adalah sama.') : T('No: no two angles are equal.', 'Tidak: tiada dua sudut yang sama.'))],
    ['Side $CA$ is extended to $F$ beyond $A$. Find the exterior angle $\\angle BAF$.', 'Sisi $CA$ dipanjangkan ke $F$ melepasi $A$. Cari sudut peluaran $\\angle BAF$.', (a, b, c) => `$${dd(180 - a)}$`],
    ['At which vertex is the largest angle?', 'Di bucu manakah terletaknya sudut yang terbesar?', (a, b, c) => `$${a > b && a > c ? 'A' : b > a && b > c ? 'B' : c > a && c > b ? 'C' : '?'}$`],
    ['Show that the three angles add up to $180^\\circ$.', 'Tunjukkan bahawa tiga sudut itu berjumlah $180^\\circ$.', (a, b, c) => `$${a} + ${b} + ${c} = 180$`],
    ['Is $\\angle C$ acute, right-angled or obtuse?', 'Adakah $\\angle C$ akut, tegak atau cakah?', (a, b, c) => (c < 90 ? T('acute', 'akut') : c === 90 ? T('right angle', 'sudut tegak') : T('obtuse', 'cakah'))],
  ];
  const ERR = [
    (r) => { const a = r.int(30, 80), b = r.int(30, 80); need(a + b < 150); return [`Siti finds the third angle of a triangle whose other angles are $${dd(a)}$ and $${dd(b)}$ by writing $${a} + ${b} = ${a + b}$. What is her mistake? Find the correct angle.`, `Siti mencari sudut ketiga sebuah segi tiga yang dua sudut lainnya $${dd(a)}$ dan $${dd(b)}$ dengan menulis $${a} + ${b} = ${a + b}$. Apakah kesilapannya? Cari sudut yang betul.`, `She must subtract the sum from $180^\\circ$: $180 - ${a + b} = ${180 - a - b}$, so the correct angle is $${dd(180 - a - b)}$.`, `Dia mesti menolak hasil tambah itu daripada $180^\\circ$: $180 - ${a + b} = ${180 - a - b}$, jadi sudut yang betul ialah $${dd(180 - a - b)}$.`]; },
    (r) => { const a = r.int(30, 80), b = r.int(30, 80); need(a + b < 150); return [`Farid says the third angle of a triangle with angles $${dd(a)}$ and $${dd(b)}$ is $360 - ${a} - ${b} = ${360 - a - b}$. What is his mistake? Find the correct angle.`, `Farid berkata sudut ketiga sebuah segi tiga dengan sudut $${dd(a)}$ dan $${dd(b)}$ ialah $360 - ${a} - ${b} = ${360 - a - b}$. Apakah kesilapannya? Cari sudut yang betul.`, `The angles of a triangle add up to $180^\\circ$, not $360^\\circ$: the correct angle is $${dd(180 - a - b)}$.`, `Sudut sebuah segi tiga berjumlah $180^\\circ$, bukan $360^\\circ$: sudut yang betul ialah $${dd(180 - a - b)}$.`]; },
    (r) => { const ap = r.step(30, 110, 2), q = (180 - ap) / 2; return [`An isosceles triangle has an apex angle of $${dd(ap)}$. Kumar says each base angle is $${ap / 2}^\\circ$ because he halves the apex angle. What is his mistake? Find the base angles.`, `Sebuah segi tiga sama kaki mempunyai sudut puncak $${dd(ap)}$. Kumar berkata setiap sudut tapak ialah $${ap / 2}^\\circ$ kerana dia membahagi dua sudut puncak. Apakah kesilapannya? Cari sudut tapak.`, `The two base angles share $180^\\circ - ${ap}^\\circ$: each is $${dd(q)}$.`, `Dua sudut tapak berkongsi $180^\\circ - ${ap}^\\circ$: setiap satu ialah $${dd(q)}$.`]; },
  ];
  const m92b = [
    (r, cx) => {
      const lv = cx && cx.d, a = r.int(30, 80), b = r.int(30, 80), c = 180 - a - b, ks = r.sample(lv === 'e' ? [0, 1, 4, 5, 9] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], lv === 'e' ? 2 : lv === 'a' ? r.pick([4, 5]) : r.pick([2, 3, 3, 4])).sort((x, y) => x - y);
      need(c >= 20 && c !== 90 && (!ks.includes(7) || (a !== b && a !== c && b !== c)));
      const ps = ks.map((i) => PP[i]), an = SPM.parts(ps.map((p) => { const v = p[2](a, b, c); return typeof v === 'string' ? T(v) : v; }));
      return { q: T(`In triangle $ABC$, $\\angle A = ${dd(a)}$ and $\\angle B = ${dd(b)}$.` + SPM.parts(ps.map((p) => T(p[0], p[1]))).en, `Dalam segi tiga $ABC$, $\\angle A = ${dd(a)}$ dan $\\angle B = ${dd(b)}$.` + SPM.parts(ps.map((p) => T(p[0], p[1]))).ms), a: T(an.en, an.ms.replace(/obtuse-angled/g, 'bersudut cakah')), sp: 'm' };
    },
    (r) => { const e = r.pick(ERR)(r); return { q: T(e[0], e[1]), a: T(e[2], e[3]), sp: 's' }; },
    (r) => {
      const k = r.int(3, 4), rows = Array.from({ length: k }, () => { const a = r.int(25, 100), b = r.int(25, 100); return [a, b, 180 - a - b]; }), hide = rows.map(() => r.int(0, 2));
      need(rows.every((x) => x[2] >= 15 && !x.includes(90)));
      const tb = (l, f) => SPM.table(rows.map((x, i) => [...x.map((v, j) => (f || j !== hide[i] ? String(v) : '?')), f ? (byAng(...x)[l ? 'ms' : 'en']) : '?']), { head: [l ? 'Sudut 1' : 'Angle 1', l ? 'Sudut 2' : 'Angle 2', l ? 'Sudut 3' : 'Angle 3', l ? 'Jenis (mengikut sudut)' : 'Type (by angles)'] });
      return { q: T('The three angles of each triangle are in degrees. Complete the table.<br>' + tb(0), 'Tiga sudut setiap segi tiga dalam darjah. Lengkapkan jadual itu.<br>' + tb(1)), a: T(tb(0, 1), tb(1, 1)), sp: 'm' };
    },
  ];
  const a92b = [
  ];
  m92b.push(
    (r) => {
      const t = r.int(0, 3), kn = [[1, 0], [1, 1], [1, 2], [1, 3]][t], v = r.pick(VARS);
      const f = [[T('Find the angles of an isosceles triangle in which the apex angle is $%k$ times each base angle.', 'Cari sudut-sudut sebuah segi tiga sama kaki dengan sudut puncak $%k$ kali setiap sudut tapak.'), [2, 3, 4, 7]], [T('An isosceles triangle has an apex angle that is $%d^\\circ$ more than each base angle. Find all three angles.', 'Sebuah segi tiga sama kaki mempunyai sudut puncak yang $%d^\\circ$ lebih besar daripada setiap sudut tapak. Cari ketiga-tiga sudutnya.'), [12, 30, 24, 36]], [T('An isosceles triangle has base angles that are each $%d^\\circ$ more than the apex angle. Find all three angles.', 'Sebuah segi tiga sama kaki mempunyai sudut tapak yang masing-masing $%d^\\circ$ lebih besar daripada sudut puncak. Cari ketiga-tiga sudutnya.'), [15, 30, 45, 21]]][t % 3];
      const kv = r.pick(f[1]);
      const ap = t % 3 === 0 ? (180 * kv) / (kv + 2) : t % 3 === 1 ? (180 + kv) / 3 : (180 - 2 * kv) / 3, bs = (180 - ap) / 2;
      need(Number.isInteger(ap) && Number.isInteger(bs) && ap > 0 && bs > 0);
      const s = (x) => x.replace('%k', kv).replace('%d', kv);
      return { q: T(s(f[0].en), s(f[0].ms)), a: T(`apex $${dd(ap)}$; base angles $${dd(bs)}$ each`, `puncak $${dd(ap)}$; sudut tapak $${dd(bs)}$ setiap satu`), sp: 'm' };
    },
    (r) => {
      const a1 = r.int(30, 80), b1 = r.int(30, 80), a2 = r.int(30, 80), b2 = r.int(30, 80), c1 = 180 - a1 - b1, c2 = 180 - a2 - b2;
      need(c1 >= 15 && c2 >= 15 && c1 !== c2);
      return { q: T(`Triangle $P$ has two angles of $${dd(a1)}$ and $${dd(b1)}$. Triangle $Q$ has two angles of $${dd(a2)}$ and $${dd(b2)}$. Which triangle has the larger third angle, and by how many degrees?`, `Segi tiga $P$ mempunyai dua sudut $${dd(a1)}$ dan $${dd(b1)}$. Segi tiga $Q$ mempunyai dua sudut $${dd(a2)}$ dan $${dd(b2)}$. Segi tiga yang manakah mempunyai sudut ketiga yang lebih besar, dan selisih berapa darjah?`), a: T(`Triangle ${c1 > c2 ? 'P' : 'Q'} ($${dd(c1)}$ and $${dd(c2)}$): difference $${dd(Math.abs(c1 - c2))}$`, `Segi tiga ${c1 > c2 ? 'P' : 'Q'} ($${dd(c1)}$ dan $${dd(c2)}$): beza $${dd(Math.abs(c1 - c2))}$`), sp: 's' };
    },
    (r) => {
      const k = r.int(0, 2), a = r.int(25, 70), b = r.int(25, 70), c = 180 - a - b;
      need(c >= 20 && a !== 45 && b !== 45);
      const tk = [{ AC: 1, BC: 1 }, { AB: 1, AC: 1 }, {}][k], eq = k < 2;
      const A = k === 0 ? [a, a] : k === 1 ? [180 - 2 * b, b] : [a, b], ang = k === 0 ? [a, a, 180 - 2 * a] : k === 1 ? [180 - 2 * b, b, b] : [a, b, c];
      need(ang.every((x) => x > 15) && !ang.includes(90) && (k < 2 || (c !== a && c !== b && a !== b)));
      const sd = k === 0 ? TT.iso : k === 1 ? TT.iso : bySide(1, 2, 3), an = byAng(...ang);
      const o = [[sd, an], [k === 2 ? TT.iso : TT.sc, an], [sd, an === TT.ac ? TT.ob : TT.ac], [TT.eq, an]].filter((x, i, ar) => ar.findIndex((y) => y[0] === x[0] && y[1] === x[1]) === i);
      need(o.length >= 3);
      const opts = o.slice(0, 4).map((x, i) => ({ t: T(`${x[0].en}, ${x[1].en}`, `${x[0].ms}, ${x[1].ms}`), ok: i === 0 }));
      const m = mc(r, opts);
      return { q: nts(T(`Which of the following describes the triangle shown (by its sides, then by its angles)? ${m.en}`, `Yang manakah menerangkan segi tiga yang ditunjukkan (mengikut sisi, kemudian mengikut sudut)? ${m.ms}`)), fig: tri({ a: A[0], b: A[1], ticks: tk, angles: { A: dg(ang[0]), B: dg(ang[1]) } }), a: m.ans, sp: 's' };
    },
  );
  SPM.extend('F1-9.2', { e: [m92b.find((f) => f.length === 2)], m: m92b, a: a92b.concat([m92b.find((f) => f.length === 2)]) });
  /* ================= F1-9.3 Quadrilaterals ================= */
  const QN = { sq: T('square', 'segi empat sama'), rc: T('rectangle', 'segi empat tepat'), pg: T('parallelogram', 'segi empat selari'), rh: T('rhombus', 'rombus'), tz: T('trapezium', 'trapezium'), kt: T('kite', 'layang-layang') };
  const QK = Object.keys(QN);
  const PRP = [ // [en, ms, truth for sq rc pg rh tz kt]
    ['four equal sides', 'empat sisi yang sama panjang', [1, 0, 0, 1, 0, 0]],
    ['opposite sides that are equal in length', 'sisi bertentangan yang sama panjang', [1, 1, 1, 1, 0, 0]],
    ['two pairs of parallel sides', 'dua pasang sisi selari', [1, 1, 1, 1, 0, 0]],
    ['exactly one pair of parallel sides', 'tepat sepasang sisi selari', [0, 0, 0, 0, 1, 0]],
    ['four right angles', 'empat sudut tegak', [1, 1, 0, 0, 0, 0]],
    ['both pairs of opposite angles equal', 'kedua-dua pasang sudut bertentangan yang sama', [1, 1, 1, 1, 0, 0]],
    ['diagonals that are equal in length', 'pepenjuru yang sama panjang', [1, 1, 0, 0, 0, 0]],
    ['diagonals that cross at right angles', 'pepenjuru yang bersilang secara serenjang', [1, 0, 0, 1, 0, 1]],
    ['diagonals that bisect each other', 'pepenjuru yang saling membahagi dua sama', [1, 1, 1, 1, 0, 0]],
    ['at least one line of symmetry', 'sekurang-kurangnya satu paksi simetri', [1, 1, 0, 1, 0, 1]],
  ];
  const CLZ3 = [
    ['The interior angles of a quadrilateral add up to ____ degrees.', 'Sudut pedalaman sebuah sisi empat berjumlah ____ darjah.', '360'],
    ['The diagonals of a rectangle are ____ in length.', 'Pepenjuru segi empat tepat ____ panjangnya.', 'equal', 'sama'],
    ['The diagonals of a rhombus cross at ____ angles.', 'Pepenjuru rombus bersilang pada sudut ____.', 'right', 'tegak'],
    ['Opposite angles of a parallelogram are ____.', 'Sudut bertentangan bagi segi empat selari adalah ____.', 'equal', 'sama'],
    ['Co-interior angles between the parallel sides of a trapezium add up to ____ degrees.', 'Sudut dalam sebelah di antara sisi selari trapezium berjumlah ____ darjah.', '180'],
    ['A quadrilateral with exactly one pair of parallel sides is called a ____.', 'Sisi empat yang mempunyai tepat sepasang sisi selari dipanggil ____.', 'trapezium'],
    ['A quadrilateral with two pairs of adjacent equal sides is called a ____.', 'Sisi empat dengan dua pasang sisi bersebelahan yang sama panjang dipanggil ____.', 'kite', 'layang-layang'],
    ['A rectangle with four equal sides is called a ____.', 'Segi empat tepat dengan empat sisi sama panjang dipanggil ____.', 'square', 'segi empat sama'],
    ['A parallelogram with four equal sides is called a ____.', 'Segi empat selari dengan empat sisi sama panjang dipanggil ____.', 'rhombus', 'rombus'],
    ['An exterior angle of a quadrilateral and its adjacent interior angle add up to ____ degrees.', 'Sudut peluaran sebuah sisi empat dan sudut pedalaman yang bersebelahan berjumlah ____ darjah.', '180'],
  ];
  /** random convex quadrilateral; ang = interior angles (integers, sum 360) */
  function qgeo(r) {
    const a0 = (r.int(0, 35) * 10 * Math.PI) / 180;
    const P = Array.from({ length: 4 }, (_, i) => { const a = a0 + (Math.PI * i) / 2 + (r.next() - 0.5) * 0.9, rr = 0.75 + 0.4 * r.next(); return [rr * Math.cos(a), -rr * Math.sin(a)]; });
    need(cvx(P));
    const ang = P.map((_, i) => { const a = P[(i + 3) % 4], b = P[i], c = P[(i + 1) % 4], u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]]; return Math.round((Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))) * 180) / Math.PI); });
    ang[3] = 360 - ang[0] - ang[1] - ang[2];
    need(ang.every((x) => x >= 50 && x <= 135));
    return { P, ang };
  }
  /** chevron marking a pair of parallel sides */
  const chev = (A, B) => { const m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], l = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / l, (B[1] - A[1]) / l], nx = [-u[1], u[0]]; return S.poly([[m[0] - 4 * u[0] + 4 * nx[0], m[1] - 4 * u[1] + 4 * nx[1]], [m[0] + 3 * u[0], m[1] + 3 * u[1]], [m[0] - 4 * u[0] - 4 * nx[0], m[1] - 4 * u[1] - 4 * nx[1]]], { open: true, w: 1 }); };
  /** figures of the six special quadrilaterals with their marks */
  function qshape(k, r, o) {
    o = o || {};
    const w = 4 + r.int(0, 1), h = 2.4, sh = 1 + 0.5 * r.next(), t = { sq: [[0, 0], [2.6, 0], [2.6, -2.6], [0, -2.6]], rc: [[0, 0], [w, 0], [w, -h], [0, -h]], pg: [[0, 0], [w, 0], [w + sh, -h], [sh, -h]], rh: [[0, 0], [3, 0], [4.2, -2.75], [1.2, -2.75]], tz: [[0, 0], [w + 1, 0], [w - 0.4, -h], [1.2, -h]], kt: [[0, -2.2], [1.6, 0], [4.2, -2.2], [1.6, -4.4]] }[k];
    const tk = { sq: { '0-1': 1, '1-2': 1, '2-3': 1, '3-0': 1 }, rc: { '0-1': 1, '2-3': 1, '1-2': 2, '3-0': 2 }, pg: { '0-1': 1, '2-3': 1, '1-2': 2, '3-0': 2 }, rh: { '0-1': 1, '1-2': 1, '2-3': 1, '3-0': 1 }, tz: {}, kt: { '0-1': 1, '3-0': 1, '1-2': 2, '2-3': 2 } }[k];
    const right = k === 'sq' || k === 'rc' ? [0, 1, 2, 3] : [], par = { sq: [[0, 1], [3, 2]], rc: [], pg: [[0, 1], [3, 2], [1, 2], [0, 3]], rh: [[0, 1], [3, 2]], tz: [[0, 1], [3, 2]], kt: [] }[k];
    return F.polygon({ pts: t, names: o.names, ticks: tk, right, w: 260, h: 190, extra: (P) => par.map(([i, j]) => chev(P[i], P[j])).join('') });
  }
  const MODQ = [['', ''], [' Show your working.', ' Tunjukkan langkah kerja anda.'], [' Give a reason for your answer.', ' Berikan sebab bagi jawapan anda.'], [' Write down the property of the quadrilateral that you use.', ' Tulis sifat sisi empat yang anda gunakan.']];
  const ntq = (r, q) => { const m = r.pick(MODQ); return nts(T(q.en + m[0], q.ms + m[1])); };
  const e93 = [
    (r) => {
      const { P, ang } = qgeo(r), u = r.int(0, 3), v = r.pick(VARS), N = r.pick(['ABCD', 'PQRS', 'WXYZ']).split(''), lab = {};
      ang.forEach((a, i) => (lab[i] = i === u ? v : dg(a)));
      return { q: ntq(r, Q(r.pick([['Find the value of {v}.', 'Cari nilai {v}.'], ['Calculate the size of the angle marked {v}.', 'Hitung saiz sudut yang ditandakan {v}.'], ['The four angles of the quadrilateral are shown. Find {v}.', 'Empat sudut sisi empat itu ditunjukkan. Cari {v}.']]), { v: mx(v) })), fig: F.polygon({ pts: P, names: N, angles: lab, w: 260, h: 190 }), a: T(`$${v} = ${ang[u]}$`), w: T(`$360 - ${360 - ang[u]} = ${ang[u]}$`), sp: 's' };
    },
    (r) => { const p = r.pick(PRP), ok = r.chance(0.5), sh = r.int(0, 5), truth = p[2][sh]; return { q: T(`True or false? A ${QN[QK[sh]].en} has ${p[0]}.`, `Benar atau palsu? ${SPM.cap(QN[QK[sh]].ms)} mempunyai ${p[1]}.`), a: truth ? T('True', 'Benar') : T('False', 'Palsu'), sp: 'xs' }; },
    (r) => {
      const p = r.pick(PRP), want = r.chance(), pool = QK.filter((_, i) => !!p[2][i] === want), rest = QK.filter((_, i) => !!p[2][i] !== want);
      need(pool.length >= 1 && rest.length >= 3);
      const one = r.pick(pool), o = r.sample(rest, 3), m = mc(r, [{ t: QN[one], ok: true }, ...o.map((x) => ({ t: QN[x], ok: false }))]);
      return { q: T(`Which of these quadrilaterals ${want ? 'has' : 'does <b>not</b> have'} ${p[0]}? ${m.en}`, `Antara sisi empat berikut, yang manakah ${want ? 'mempunyai' : '<b>tidak</b> mempunyai'} ${p[1]}? ${m.ms}`), a: m.ans, sp: 'xs' };
    },
    (r) => { const c = r.pick(CLZ3); return { q: T('Fill in the blank. ' + c[0], 'Isikan tempat kosong. ' + c[1]), a: T(c[2], c[3] || c[2]), sp: 'xs' }; },
    (r) => {
      const k = r.pick(QK), N = r.pick(['ABCD', 'PQRS', 'WXYZ']).split('');
      return { q: Q(r.pick([['Name the quadrilateral shown. The marks show equal sides, parallel sides and right angles.', 'Namakan sisi empat yang ditunjukkan. Tanda-tanda menunjukkan sisi sama panjang, sisi selari dan sudut tegak.'], ['Use the marks in the diagram to name the quadrilateral.', 'Gunakan tanda dalam rajah untuk menamakan sisi empat itu.']]), {}), fig: qshape(k, r, { names: N }), a: QN[k], sp: 'xs' };
    },
  ];
  SPM.extend('F1-9.3', { e: e93 });
  const tn = (v) => Math.tan((v * Math.PI) / 180);
  const AQ = ['ABCD', 'PQRS', 'WXYZ'];
  const sgn9 = (i, k) => (i % 2 === k % 2);
  /** parallelogram whose angle at vertex 0 is a; lab(i) gives the label at vertex i */
  const pgF = (a, lab, N) => F.polygon({ pts: [[0, 0], [4, 0], [4 + 2.2 * Math.cos((a * Math.PI) / 180), -2.2 * Math.sin((a * Math.PI) / 180)], [2.2 * Math.cos((a * Math.PI) / 180), -2.2 * Math.sin((a * Math.PI) / 180)]], names: N, angles: [0, 1, 2, 3].map(lab), w: 280, h: 180 });
  const tzF = (a, b, lab, N) => { const h = 2.2; return F.polygon({ pts: [[0, 0], [6, 0], [6 - h / tn(b), -h], [h / tn(a), -h]], names: N, angles: [0, 1, 2, 3].map(lab), w: 290, h: 180, extra: (P) => chev(P[0], P[1]) + chev(P[3], P[2]) }); };
  const ktF = (al, ga, lab, N, diag) => { const be = (360 - al - ga) / 2, l1 = 3, B = [l1 * Math.sin((al / 2) * Math.PI / 180), l1 * Math.cos((al / 2) * Math.PI / 180)], cy = B[1] + B[0] / tn(ga / 2); return F.polygon({ pts: [[0, 0], [B[0], B[1]], [0, cy], [-B[0], B[1]]], names: N, angles: [0, 1, 2, 3].map(lab), w: 260, h: 200, ticks: { '0-1': 1, '3-0': 1, '1-2': 2, '2-3': 2 }, extra: diag ? (P) => S.line(P[0][0], P[0][1], P[2][0], P[2][1], { dash: true }) : undefined }); };
  const rhF = (b, N) => { const p = 2 * tn(b / 2), q = 2; return F.polygon({ pts: [[-p, 0], [0, -q], [p, 0], [0, q]], names: N, ticks: { '0-1': 1, '1-2': 1, '2-3': 1, '3-0': 1 }, w: 260, h: 190, extra: (P) => S.line(P[0][0], P[0][1], P[2][0], P[2][1], { dash: true }) + S.line(P[1][0], P[1][1], P[3][0], P[3][1], { dash: true }) + S.text(P[0][0] * 0.5 + P[2][0] * 0.5 + 9, P[0][1] * 0.5 + P[2][1] * 0.5 - 8, 'M', { i: true }) + S.rightAngle([(P[0][0] + P[2][0]) / 2, (P[0][1] + P[2][1]) / 2], P[1], P[2], 7) }); };
  const rcF = (t, N) => { const w = 4, h = w * tn(t); return F.polygon({ pts: [[0, 0], [w, 0], [w, -h], [0, -h]], names: N, right: [0, 1, 2, 3], w: 270, h: 190, extra: (P) => S.line(P[0][0], P[0][1], P[2][0], P[2][1], { dash: true }) + S.line(P[1][0], P[1][1], P[3][0], P[3][1], { dash: true }) + S.text((P[0][0] + P[2][0]) / 2 + 3, (P[0][1] + P[2][1]) / 2 + 11, 'M', { i: true }) }); };
  const ALG = (r, v) => { const x = r.int(8, 30); return { x, v }; };
  const RHP = [['\\angle BAD', (b) => 180 - b], ['\\angle ABD', (b) => b / 2], ['\\angle BAC', (b) => (180 - b) / 2], ['\\angle AMB', () => 90], ['\\angle BCD', (b) => b], ['\\angle ACB', (b) => (180 - b) / 2]];
  const RCP = [['\\angle ACB', (t) => 90 - t], ['\\angle CAD', (t) => 90 - t], ['\\angle ACD', (t) => t], ['\\angle ABD', (t) => t], ['\\angle AMB', (t) => 180 - 2 * t], ['\\angle BMC', (t) => 2 * t]];
  const CTX3 = [['a window frame in the shape of a parallelogram', 'bingkai tingkap berbentuk segi empat selari', 'pg'], ['a kite (wau)', 'sebuah wau berbentuk layang-layang', 'kt'], ['a tile in the shape of a rhombus', 'jubin berbentuk rombus', 'rh'], ['a plot of land in the shape of a quadrilateral', 'sebidang tanah berbentuk sisi empat', 'q'], ['a table top in the shape of a trapezium', 'permukaan meja berbentuk trapezium', 'tz']];
  const PQ = [ // chain parts for quadrilateral ABCD: [en, ms, fn(a,b,c,d)]
    ['Find $\\angle D$.', 'Cari $\\angle D$.', (a, b, c, d) => `$${dd(d)}$`],
    ['Find the exterior angle at $A$.', 'Cari sudut peluaran di $A$.', (a, b, c, d) => `$${dd(180 - a)}$`],
    ['Find the exterior angle at $C$.', 'Cari sudut peluaran di $C$.', (a, b, c, d) => `$${dd(180 - c)}$`],
    ['Find the largest angle of the quadrilateral.', 'Cari sudut terbesar sisi empat itu.', (a, b, c, d) => `$${dd(Math.max(a, b, c, d))}$`],
    ['Find the difference between the largest and the smallest angle.', 'Cari beza antara sudut terbesar dengan sudut terkecil.', (a, b, c, d) => `$${dd(Math.max(a, b, c, d) - Math.min(a, b, c, d))}$`],
    ['Show that the four angles add up to $360^\\circ$.', 'Tunjukkan bahawa empat sudut itu berjumlah $360^\\circ$.', (a, b, c, d) => `$${a} + ${b} + ${c} + ${d} = 360$`],
    ['Is $\\angle A = \\angle C$? What does this tell you about whether $ABCD$ could be a parallelogram?', 'Adakah $\\angle A = \\angle C$? Apakah maksudnya tentang sama ada $ABCD$ boleh menjadi segi empat selari?', (a, b, c, d) => (a === c && b === d ? T('Yes, both pairs of opposite angles are equal, so it could be a parallelogram.', 'Ya, kedua-dua pasang sudut bertentangan sama, jadi ia mungkin segi empat selari.') : T('Opposite angles are not both equal, so it cannot be a parallelogram.', 'Sudut bertentangan tidak kedua-duanya sama, jadi ia bukan segi empat selari.'))],
  ];
  const DESC3 = [
    ['four equal sides and four right angles', 'empat sisi sama panjang dan empat sudut tegak', 'sq'], ['opposite sides equal and parallel, four right angles, adjacent sides unequal', 'sisi bertentangan sama panjang dan selari, empat sudut tegak, sisi bersebelahan tidak sama', 'rc'], ['four equal sides, opposite angles equal, no right angles', 'empat sisi sama panjang, sudut bertentangan sama, tiada sudut tegak', 'rh'],
    ['exactly one pair of parallel sides', 'tepat sepasang sisi selari', 'tz'], ['two pairs of adjacent equal sides and diagonals that cross at right angles, opposite sides not parallel', 'dua pasang sisi bersebelahan sama panjang dan pepenjuru bersilang serenjang, sisi bertentangan tidak selari', 'kt'], ['opposite sides parallel and equal, opposite angles equal, no right angles, adjacent sides unequal', 'sisi bertentangan selari dan sama panjang, sudut bertentangan sama, tiada sudut tegak, sisi bersebelahan tidak sama', 'pg'],
  ];
  const m93 = [
    (r) => {
      const a = r.pick([55, 60, 65, 70, 75, 80, 100, 105, 110, 115, 120]), k = r.int(0, 3), N = r.pick(AQ).split(''), nu = r.pick([1, 2, 3]), un = r.sample([0, 1, 2, 3].filter((i) => i !== k), nu), vs = ['x', 'y', 'z'], val = (i) => (sgn9(i, k) ? a : 180 - a);
      const lab = (i) => (i === k ? dg(a) : un.includes(i) ? vs[un.indexOf(i)] : null);
      const tag = un.map((i, j) => `${mx(vs[j])}`).join(nu > 1 ? ', ' : '');
      return { q: ntq(r, T(`$${N.join('')}$ is a parallelogram. Find ${tag}.`, `$${N.join('')}$ ialah sebuah segi empat selari. Cari ${tag}.`)), fig: pgF(a, lab, N), a: T(un.map((i, j) => `$${vs[j]} = ${val(i)}$`).join(', ')), w: T('Opposite angles are equal; co-interior angles add up to $180^\\circ$.', 'Sudut bertentangan adalah sama; sudut dalam sebelah berjumlah $180^\\circ$.'), sp: 's' };
    },
    (r) => {
      const a = r.int(60, 120), b = r.int(60, 120), N = r.pick(AQ).split(''), gA = r.chance(), gB = r.chance();
      need(a !== 90 && b !== 90 && a + 30 < 175);
      const lab = (i) => (i === 0 ? (gA ? dg(a) : 'x') : i === 1 ? (gB ? dg(b) : 'y') : i === 2 ? (gB ? 'y' : dg(180 - b)) : gA ? 'x' : dg(180 - a));
      const known = [gA ? [`\\angle ${N[0]} = ${a}`, a] : [`\\angle ${N[3]} = ${180 - a}`, 180 - a], gB ? [`\\angle ${N[1]} = ${b}`, b] : [`\\angle ${N[2]} = ${180 - b}`, 180 - b]];
      return { q: ntq(r, T(`$${N.join('')}$ is a trapezium with $${N[0]}${N[1]} \\parallel ${N[3]}${N[2]}$. Find $x$ and $y$.`, `$${N.join('')}$ ialah sebuah trapezium dengan $${N[0]}${N[1]} \\parallel ${N[3]}${N[2]}$. Cari $x$ dan $y$.`)), fig: tzF(a, b, (i) => (i === 0 ? (gA ? dg(a) : 'x') : i === 1 ? (gB ? dg(b) : 'y') : i === 2 ? (gB ? 'y' : dg(180 - b)) : gA ? 'x' : dg(180 - a)), N), a: T(`$x = ${gA ? 180 - a : a}$, $y = ${gB ? 180 - b : b}$`), w: T('Co-interior angles between parallel lines add up to $180^\\circ$.', 'Sudut dalam sebelah antara garis selari berjumlah $180^\\circ$.'), sp: 's' };
    },
    (r) => {
      const al = r.step(50, 110, 2), ga = r.step(30, 90, 2), be = (360 - al - ga) / 2, N = r.pick(AQ).split(''), t = r.int(0, 2);
      need(be < 170 && be > 40);
      const f = [[`$${N.join('')}$ is a kite with $\\angle ${N[0]} = ${dd(al)}$ and $\\angle ${N[2]} = ${dd(ga)}$. Find $\\angle ${N[1]}$ ($= \\angle ${N[3]}$).`, `$${N.join('')}$ ialah sebuah layang-layang dengan $\\angle ${N[0]} = ${dd(al)}$ dan $\\angle ${N[2]} = ${dd(ga)}$. Cari $\\angle ${N[1]}$ ($= \\angle ${N[3]}$).`, be, (i) => (i === 0 ? dg(al) : i === 2 ? dg(ga) : null)], [`$${N.join('')}$ is a kite with $\\angle ${N[0]} = ${dd(al)}$ and $\\angle ${N[1]} = ${dd(be)}$. Find $\\angle ${N[2]}$.`, `$${N.join('')}$ ialah sebuah layang-layang dengan $\\angle ${N[0]} = ${dd(al)}$ dan $\\angle ${N[1]} = ${dd(be)}$. Cari $\\angle ${N[2]}$.`, ga, (i) => (i === 0 ? dg(al) : i === 1 ? dg(be) : null)], [`The diagonal $${N[0]}${N[2]}$ of kite $${N.join('')}$ bisects $\\angle ${N[0]}$. Given $\\angle ${N[0]} = ${dd(al)}$, $\\angle ${N[1]} = ${dd(be)}$, find $\\angle ${N[0]}${N[2]}${N[1]}$ and $\\angle ${N[2]}$.`, `Pepenjuru $${N[0]}${N[2]}$ layang-layang $${N.join('')}$ membahagi dua sama $\\angle ${N[0]}$. Diberi $\\angle ${N[0]} = ${dd(al)}$, $\\angle ${N[1]} = ${dd(be)}$, cari $\\angle ${N[0]}${N[2]}${N[1]}$ dan $\\angle ${N[2]}$.`, ga, (i) => null]][t];
      const ans = t === 0 ? `$${dd(be)}$` : t === 1 ? `$${dd(ga)}$` : `$\\angle ${N[0]}${N[2]}${N[1]} = ${dd(180 - al / 2 - be)}$, $\\angle ${N[2]} = ${dd(ga)}$`;
      return { q: ntq(r, T(f[0], f[1])), fig: ktF(al, ga, f[3], N, t === 2), a: T(ans, ans), sp: 's' };
    },
    (r) => {
      const gv = r.int(0, 2), b = r.step(40, 140, 2), N = r.pick(AQ).split(''), np = r.pick([2, 3]), ps = r.sample(RHP, np);
      need(b !== 90);
      const g = [[`$\\angle ${N[0]}${N[1]}${N[2]} = ${dd(b)}$`, b], [`$\\angle ${N[0]}${N[1]}${N[3]} = ${dd(b / 2)}$`, b], [`$\\angle ${N[1]}${N[0]}${N[2]} = ${dd((180 - b) / 2)}$`, b]][gv];
      const bb = gv === 0 ? b : gv === 1 ? b : b;
      const nm = ps.map((p) => T(`$${p[0].replace(/A/g, N[0]).replace(/B/g, N[1]).replace(/C/g, N[2]).replace(/D/g, N[3]).replace(/M/g, 'M')}$`));
      return { q: ntq(r, T(`$${N.join('')}$ is a rhombus. Its diagonals meet at $M$. Given ${g[0]}, find:` + SPM.parts(nm).en, `$${N.join('')}$ ialah sebuah rombus. Pepenjurunya bertemu di $M$. Diberi ${g[0]}, cari:` + SPM.parts(nm).ms)), fig: rhF(b, N), a: SPM.parts(ps.map((p) => T(`$${dd(p[1](b))}$`))), sp: 'm' };
    },
    (r) => {
      const t = r.int(25, 60), N = r.pick(AQ).split(''), ps = r.sample(RCP, r.pick([2, 3]));
      const nm = ps.map((p) => T(`$${p[0].replace(/A/g, N[0]).replace(/B/g, N[1]).replace(/C/g, N[2]).replace(/D/g, N[3])}$`));
      return { q: ntq(r, T(`$${N.join('')}$ is a rectangle. The diagonals meet at $M$ and $\\angle ${N[1]}${N[0]}${N[2]} = ${dd(t)}$. Find:` + SPM.parts(nm).en, `$${N.join('')}$ ialah sebuah segi empat tepat. Pepenjurunya bertemu di $M$ dan $\\angle ${N[1]}${N[0]}${N[2]} = ${dd(t)}$. Cari:` + SPM.parts(nm).ms)), fig: rcF(t, N), a: SPM.parts(ps.map((p) => T(`$${dd(p[1](t))}$`))), sp: 'm' };
    },
    (r) => {
      const t = r.int(0, 4), x = t === 2 || t === 4 ? r.int(10, 30) : t === 0 ? r.int(45, 60) : r.int(38, 52), N = r.pick(AQ).split(''), v = r.pick(VARS), c = r.int(5, 20), d = r.int(5, 20);
      let q, ms, ans;
      if (t === 0) { const e = [lin(1, 0, v), lin(1, c, v), lin(2, 0, v)], f = 360 - (4 * x + c); need(f > 20 && f < 170); q = [`The four angles of a quadrilateral are $${dd(f)}$, $(${e[0]})^\\circ$, $(${e[1]})^\\circ$ and $(${e[2]})^\\circ$. Find ${mx(v)} and the smallest angle.`, `Empat sudut sebuah sisi empat ialah $${dd(f)}$, $(${e[0]})^\\circ$, $(${e[1]})^\\circ$ dan $(${e[2]})^\\circ$. Cari ${mx(v)} dan sudut yang terkecil.`]; ans = `$${v} = ${x}$; $${Math.min(f, x, x + c, 2 * x)}^\\circ$`; }
      else if (t === 1) { const b2 = 180 - (2 * x + c); const kk = b2 - x; need(kk > 0 && kk < 60); q = [`In parallelogram $${N.join('')}$, $\\angle ${N[0]} = (${lin(2, c, v)})^\\circ$ and $\\angle ${N[1]} = (${lin(1, kk, v)})^\\circ$. Find ${mx(v)} and $\\angle ${N[0]}$.`, `Dalam segi empat selari $${N.join('')}$, $\\angle ${N[0]} = (${lin(2, c, v)})^\\circ$ dan $\\angle ${N[1]} = (${lin(1, kk, v)})^\\circ$. Cari ${mx(v)} dan $\\angle ${N[0]}$.`]; ans = `$${v} = ${x}$; $\\angle ${N[0]} = ${2 * x + c}^\\circ$`; }
      else if (t === 2) { const a1 = r.int(3, 5), a2 = r.int(1, a1 - 1), cc = a2 * x + d - a1 * x; need(Math.abs(cc) <= 40 && cc !== 0); q = [`In parallelogram $${N.join('')}$, the opposite angles $\\angle ${N[0]} = (${lin(a1, cc, v)})^\\circ$ and $\\angle ${N[2]} = (${lin(a2, d, v)})^\\circ$. Find ${mx(v)} and the size of $\\angle ${N[0]}$.`, `Dalam segi empat selari $${N.join('')}$, sudut bertentangan $\\angle ${N[0]} = (${lin(a1, cc, v)})^\\circ$ dan $\\angle ${N[2]} = (${lin(a2, d, v)})^\\circ$. Cari ${mx(v)} dan saiz $\\angle ${N[0]}$.`]; ans = `$${v} = ${x}$; $\\angle ${N[0]} = ${a2 * x + d}^\\circ$`; need(a2 * x + d < 175); }
      else if (t === 3) { const kk = 180 - (2 * x + c) - x; need(kk > 0 && kk < 50); q = [`$${N.join('')}$ is a trapezium with $${N[0]}${N[1]} \\parallel ${N[3]}${N[2]}$. $\\angle ${N[0]} = (${lin(2, c, v)})^\\circ$ and $\\angle ${N[3]} = (${lin(1, kk, v)})^\\circ$. Find ${mx(v)}.`, `$${N.join('')}$ ialah sebuah trapezium dengan $${N[0]}${N[1]} \\parallel ${N[3]}${N[2]}$. $\\angle ${N[0]} = (${lin(2, c, v)})^\\circ$ dan $\\angle ${N[3]} = (${lin(1, kk, v)})^\\circ$. Cari ${mx(v)}.`]; ans = `$${v} = ${x}$`; }
      else { const a1 = r.int(2, 4), a2 = r.int(1, a1 - 1), cc = a2 * x + d - a1 * x, be = r.int(60, 110), mid = 360 - 2 * (a2 * x + d) - be; need(cc !== 0 && Math.abs(cc) <= 40 && mid > 20 && mid < 150 && (a2 * x + d) < 150); q = [`$${N.join('')}$ is a kite with $\\angle ${N[1]} = (${lin(a1, cc, v)})^\\circ$, $\\angle ${N[3]} = (${lin(a2, d, v)})^\\circ$, $\\angle ${N[0]} = ${dd(be)}$ and $\\angle ${N[2]} = ${dd(mid)}$. Find ${mx(v)} and $\\angle ${N[1]}$.`, `$${N.join('')}$ ialah sebuah layang-layang dengan $\\angle ${N[1]} = (${lin(a1, cc, v)})^\\circ$, $\\angle ${N[3]} = (${lin(a2, d, v)})^\\circ$, $\\angle ${N[0]} = ${dd(be)}$ dan $\\angle ${N[2]} = ${dd(mid)}$. Cari ${mx(v)} dan $\\angle ${N[1]}$.`]; ans = `$${v} = ${x}$; $\\angle ${N[1]} = ${a2 * x + d}^\\circ$`; }
      return { q: T(q[0], q[1]), a: T(ans), sp: 'm' };
    },
    (r, cx) => {
      const lv = cx && cx.d, eq = r.chance(0.35), a = r.int(60, 120), b = eq ? 180 - a : r.int(60, 120), c = eq ? a : r.int(60, 120), d = 360 - a - b - c;
      need(d >= 50 && d <= 130 && a !== 90 && b !== 90);
      const ks = r.sample([0, 1, 2, 3, 4, 5, 6], lv === 'e' ? 2 : lv === 'a' ? r.pick([4, 5]) : r.pick([2, 3, 3])).sort((x, y) => x - y), ps = ks.map((i) => PQ[i]);
      return { q: T(`In quadrilateral $ABCD$, $\\angle A = ${dd(a)}$, $\\angle B = ${dd(b)}$ and $\\angle C = ${dd(c)}$.` + SPM.parts(ps.map((p) => T(p[0], p[1]))).en, `Dalam sisi empat $ABCD$, $\\angle A = ${dd(a)}$, $\\angle B = ${dd(b)}$ dan $\\angle C = ${dd(c)}$.` + SPM.parts(ps.map((p) => T(p[0], p[1]))).ms), a: SPM.parts(ps.map((p) => { const v = p[2](a, b, c, d); return typeof v === 'string' ? T(v) : v; })), sp: 'm' };
    },
    (r) => { const ds = r.sample(DESC3, 4), one = ds[0], m = mc(r, ds.map((x, i) => ({ t: QN[x[2]], ok: i === 0 }))); return { q: T(`A quadrilateral has ${one[0]}. What is its name? ${m.en}`, `Sebuah sisi empat mempunyai ${one[1]}. Apakah namanya? ${m.ms}`), a: m.ans, sp: 'xs' }; },
  ];
  SPM.extend('F1-9.3', { e: [m93.find((f) => f.length === 2)], m: m93 });
  const IMP = [
    ['four acute angles', 0, 'four acute angles add up to less than $360^\\circ$', 'empat sudut akut berjumlah kurang daripada $360^\\circ$'],
    ['four right angles', 1, 'a rectangle has $4 \\times 90^\\circ = 360^\\circ$', 'segi empat tepat mempunyai $4 \\times 90^\\circ = 360^\\circ$'],
    ['three obtuse angles', 1, 'for example $100^\\circ$, $100^\\circ$, $100^\\circ$ and $60^\\circ$', 'contohnya $100^\\circ$, $100^\\circ$, $100^\\circ$ dan $60^\\circ$'],
    ['four obtuse angles', 0, 'four obtuse angles add up to more than $360^\\circ$', 'empat sudut cakah berjumlah lebih daripada $360^\\circ$'],
    ['two reflex angles', 0, 'two reflex angles already add up to more than $360^\\circ$', 'dua sudut refleks sudah berjumlah lebih daripada $360^\\circ$'],
    ['one reflex angle', 1, 'a concave quadrilateral (arrowhead), for example $30^\\circ$, $50^\\circ$, $40^\\circ$ and $240^\\circ$', 'sisi empat cekung (kepala anak panah), contohnya $30^\\circ$, $50^\\circ$, $40^\\circ$ dan $240^\\circ$'],
    ['angles of $100^\\circ$, $100^\\circ$, $100^\\circ$ and $70^\\circ$', 0, 'the sum is $370^\\circ$, not $360^\\circ$', 'jumlahnya ialah $370^\\circ$, bukan $360^\\circ$'],
    ['angles of $80^\\circ$, $90^\\circ$, $100^\\circ$ and $90^\\circ$', 1, 'the sum is $360^\\circ$', 'jumlahnya ialah $360^\\circ$'],
    ['a parallelogram with angles of $50^\\circ$ and $120^\\circ$ next to each other', 0, 'adjacent angles of a parallelogram add up to $180^\\circ$, but $50 + 120 = 170$', 'sudut bersebelahan segi empat selari berjumlah $180^\\circ$, tetapi $50 + 120 = 170$'],
    ['a rectangle with one angle of $80^\\circ$', 0, 'every angle of a rectangle is $90^\\circ$', 'setiap sudut segi empat tepat ialah $90^\\circ$'],
    ['a kite with all four angles equal', 1, 'a square is a kite whose angles are all $90^\\circ$', 'segi empat sama ialah layang-layang yang semua sudutnya $90^\\circ$'],
    ['a trapezium with two right angles', 1, 'for example a trapezium with one side perpendicular to both parallel sides', 'contohnya trapezium dengan satu sisi serenjang kepada kedua-dua sisi selari'],
  ];
  const pgD = (p, q) => { const B = 180 - p - q, AC = (4 * Math.sin((B * Math.PI) / 180)) / Math.sin((q * Math.PI) / 180), C = [AC * Math.cos((p * Math.PI) / 180), -AC * Math.sin((p * Math.PI) / 180)]; return [[0, 0], [4, 0], C, [C[0] - 4, C[1]]]; };
  const DP = [['\\angle ABC', (p, q) => 180 - p - q], ['\\angle ADC', (p, q) => 180 - p - q], ['\\angle BAD', (p, q) => p + q], ['\\angle DAC', (p, q) => q], ['\\angle ACD', (p, q) => p], ['\\angle BCD', (p, q) => p + q]];
  const KP = [['\\angle BAD', (t, u) => 2 * t], ['\\angle BCD', (t, u) => 2 * u], ['\\angle ABC', (t, u) => 180 - t - u], ['\\angle ADC', (t, u) => 180 - t - u], ['\\angle ACD', (t, u) => u], ['\\angle CAD', (t, u) => t]];
  const NM4 = (N, s) => s.replace(/[ABCD]/g, (c) => N['ABCD'.indexOf(c)]);
  const a93 = [
    (r) => {
      const A = [r.int(1, 3), r.int(1, 3), r.int(1, 3), r.int(1, 3)], v = r.pick(VARS), x = r.int(20, 40), s = A[0] + A[1] + A[2] + A[3], C = 360 - s * x, c = [r.int(-20, 20), r.int(-20, 20), r.int(-20, 20)];
      c.push(C - c[0] - c[1] - c[2]);
      const V = A.map((a, i) => a * x + c[i]);
      need(c.every((q) => q !== 0 && Math.abs(q) <= 45) && V.every((q) => q > 25 && q < 175));
      const E = A.map((a, i) => `(${lin(a, c[i], v)})^\\circ`).join('$, $'), ask = r.int(0, 2), nm = ['ABCD', 'PQRS'][r.int(0, 1)];
      return { q: T(`The four angles of quadrilateral $${nm}$ are $${E}$. Find ${mx(v)}${['. Then find the size of each angle.', ' and the smallest angle.', ' and state, with a reason, whether the quadrilateral is convex or concave.'][ask]}`, `Empat sudut sisi empat $${nm}$ ialah $${E}$. Cari ${mx(v)}${['. Kemudian cari saiz setiap sudut.', ' dan sudut yang terkecil.', ' dan nyatakan, dengan sebab, sama ada sisi empat itu cembung atau cekung.'][ask]}`), a: T(`$${v} = ${x}$; ` + [V.map((q) => `$${dd(q)}$`).join(', '), `$${dd(Math.min(...V))}$`, 'convex (all angles less than $180^\\circ$)'][ask], `$${v} = ${x}$; ` + [V.map((q) => `$${dd(q)}$`).join(', '), `$${dd(Math.min(...V))}$`, 'cembung (semua sudut kurang daripada $180^\\circ$)'][ask]), w: T(`$${lin(s, c.reduce((p, q) => p + q, 0), v)} = 360$`), sp: 'm' };
    },
    (r) => {
      const p = r.int(25, 70), q = r.int(25, 70), N = r.pick(AQ).split(''), ps = r.sample(DP, r.pick([2, 3, 4])), nm = ps.map((x) => T(`$${NM4(N, x[0])}$`));
      need(p + q < 150 && p !== q);
      return { q: ntq(r, T(`$${N.join('')}$ is a parallelogram and $${N[0]}${N[2]}$ is a diagonal. $\\angle ${N[1]}${N[0]}${N[2]} = ${dd(p)}$ and $\\angle ${N[0]}${N[2]}${N[1]} = ${dd(q)}$. Find:` + SPM.parts(nm).en, `$${N.join('')}$ ialah sebuah segi empat selari dan $${N[0]}${N[2]}$ ialah pepenjuru. $\\angle ${N[1]}${N[0]}${N[2]} = ${dd(p)}$ dan $\\angle ${N[0]}${N[2]}${N[1]} = ${dd(q)}$. Cari:` + SPM.parts(nm).ms)), fig: F.polygon({ pts: pgD(p, q), names: N, w: 290, h: 190, extra: (P) => S.line(P[0][0], P[0][1], P[2][0], P[2][1], { dash: true }) + S.arc(P[0], P[1], P[2], 24, dg(p), { gap: 14 }) + S.arc(P[2], P[0], P[1], 24, dg(q), { gap: 14 }) }), a: SPM.parts(ps.map((x) => T(`$${dd(x[1](p, q))}$`))), sp: 'm' };
    },
    (r) => {
      const t = r.int(15, 40), u = r.int(15, 45), N = r.pick(AQ).split(''), ps = r.sample(KP, r.pick([2, 3, 4])), nm = ps.map((x) => T(`$${NM4(N, x[0])}$`));
      need(t !== u && 180 - t - u < 150);
      return { q: ntq(r, T(`$${N.join('')}$ is a kite with $${N[0]}${N[1]} = ${N[0]}${N[3]}$ and $${N[2]}${N[1]} = ${N[2]}${N[3]}$. The diagonal $${N[0]}${N[2]}$ is drawn, with $\\angle ${N[1]}${N[0]}${N[2]} = ${dd(t)}$ and $\\angle ${N[1]}${N[2]}${N[0]} = ${dd(u)}$. Find:` + SPM.parts(nm).en, `$${N.join('')}$ ialah sebuah layang-layang dengan $${N[0]}${N[1]} = ${N[0]}${N[3]}$ dan $${N[2]}${N[1]} = ${N[2]}${N[3]}$. Pepenjuru $${N[0]}${N[2]}$ dilukis, dengan $\\angle ${N[1]}${N[0]}${N[2]} = ${dd(t)}$ dan $\\angle ${N[1]}${N[2]}${N[0]} = ${dd(u)}$. Cari:` + SPM.parts(nm).ms)), fig: ktF(2 * t, 2 * u, () => null, N, true), a: SPM.parts(ps.map((x) => T(`$${dd(x[1](t, u))}$`))), sp: 'm' };
    },
    (r) => {
      const out = r.chance(), N = ['A', 'B', 'C', 'D'], pts = out ? [[0, 0], [1, 0], [1, -1], [0.5, -1.866], [0, -1]] : [[0, 0], [1, 0], [1, -1], [0, -1]];
      const fig = F.polygon({ pts, names: out ? ['A', 'B', 'C', 'E', 'D'] : ['A', 'B', 'C', 'D'], w: 230, h: out ? 230 : 190, extra: (P) => { if (out) return S.line(P[4][0], P[4][1], P[2][0], P[2][1]) + S.line(P[0][0], P[0][1], P[3][0], P[3][1], { dash: true }); const E = [(P[2][0] + P[3][0]) / 2, P[3][1] + (P[2][0] - P[3][0]) * 0.866]; return S.line(P[3][0], P[3][1], E[0], E[1]) + S.line(P[2][0], P[2][1], E[0], E[1]) + S.text(E[0], E[1] + 12, 'E', { i: true }) + S.line(P[0][0], P[0][1], E[0], E[1], { dash: true }); } });
      const A = out ? [150, 15, 75] : [30, 75, 15];
      return { q: ntq(r, T(`$ABCD$ is a square and $CDE$ is an equilateral triangle drawn ${out ? 'outside' : 'inside'} the square on side $CD$. Find (a) $\\angle ADE$, (b) $\\angle DAE$, (c) $\\angle EAB$.`, `$ABCD$ ialah sebuah segi empat sama dan $CDE$ ialah sebuah segi tiga sama sisi yang dilukis di ${out ? 'luar' : 'dalam'} segi empat sama itu pada sisi $CD$. Cari (a) $\\angle ADE$, (b) $\\angle DAE$, (c) $\\angle EAB$.`)), fig, a: T(`(a) $${dd(A[0])}$ (b) $${dd(A[1])}$ (c) $${dd(A[2])}$`), w: T('$DA = DE$, so triangle $ADE$ is isosceles.', '$DA = DE$, jadi segi tiga $ADE$ ialah segi tiga sama kaki.'), sp: 'l' };
    },
    (r) => { const x = r.pick(IMP); const sh = IMP.indexOf(x) >= 8; return { q: sh ? T(`Is it possible to have ${x[0]}? Explain.`, `Bolehkah wujud ${x[0]}? Terangkan.`) : T(`Can a quadrilateral have ${x[0]}? Explain.`, `Bolehkah sebuah sisi empat mempunyai ${x[0]}? Terangkan.`), a: T(`${x[1] ? 'Yes' : 'No'}: ${x[2]}.`, `${x[1] ? 'Ya' : 'Tidak'}: ${x[3]}.`), sp: 's' }; },
    (r) => {
      const { P, ang } = qgeo(r), i = r.int(0, 3), mode = r.int(0, 2), N = r.pick(AQ).split(''), e = 180 - ang[i], v = r.pick(VARS), lab = {};
      const ask = mode === 0 ? T(`The side $${N[(i + 3) % 4]}${N[i]}$ is extended. Find the exterior angle ${mx(v)} at $${N[i]}$.`, `Sisi $${N[(i + 3) % 4]}${N[i]}$ dipanjangkan. Cari sudut peluaran ${mx(v)} di $${N[i]}$.`) : mode === 1 ? T(`The side $${N[(i + 3) % 4]}${N[i]}$ is extended and the exterior angle at $${N[i]}$ is $${dd(e)}$. Find the interior angle at $${N[i]}$.`, `Sisi $${N[(i + 3) % 4]}${N[i]}$ dipanjangkan dan sudut peluaran di $${N[i]}$ ialah $${dd(e)}$. Cari sudut pedalaman di $${N[i]}$.`) : T(`The side $${N[(i + 3) % 4]}${N[i]}$ is extended and the exterior angle at $${N[i]}$ is $${dd(e)}$. Find ${mx(v)}, the interior angle at $${N[(i + 1) % 4]}$.`, `Sisi $${N[(i + 3) % 4]}${N[i]}$ dipanjangkan dan sudut peluaran di $${N[i]}$ ialah $${dd(e)}$. Cari ${mx(v)}, sudut pedalaman di $${N[(i + 1) % 4]}$.`);
      ang.forEach((a, j) => (lab[j] = mode === 0 ? dg(a) : j === i ? null : mode === 2 && j === (i + 1) % 4 ? v : dg(a)));
      const fig = F.polygon({ pts: P, names: N, angles: lab, w: 280, h: 200, extra: (Pf) => { const a = Pf[(i + 3) % 4], b = Pf[i], u = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...u), E = [b[0] + (u[0] / l) * 34, b[1] + (u[1] / l) * 34]; return S.line(b[0], b[1], E[0], E[1]) + S.arc(b, E, Pf[(i + 1) % 4], 20, mode === 0 ? v : dg(e), { gap: 14 }); } });
      return { q: ntq(r, ask), fig, a: T(mode === 0 ? `$${v} = ${e}$` : mode === 1 ? `$${dd(ang[i])}$` : `$${v} = ${ang[(i + 1) % 4]}$`), w: T('Exterior angle + interior angle $= 180^\\circ$; the four interior angles add up to $360^\\circ$.', 'Sudut peluaran + sudut pedalaman $= 180^\\circ$; empat sudut pedalaman berjumlah $360^\\circ$.'), sp: 'm' };
    },
  ];
  SPM.extend('F1-9.3', { a: a93 });
  /* ================= F1-10.1 Perimeter ================= */
  const UN = [['cm', 'cm'], ['m', 'm']];
  const mm2 = (u) => (u === 'm' ? 'm' : 'cm');
  /** rectilinear shapes: unit coordinates (y up), edge lengths, hidden (deducible) edges */
  function rshape(r, kind, W0, H0) {
    const W = W0 || r.int(8, 16), H = H0 || r.int(7, 14);
    if (kind === 'L') { const a = r.int(2, H - 3), b = r.int(2, W - 3); return { pts: [[0, 0], [W, 0], [W, a], [b, a], [b, H], [0, H]], hide: [2, 3] }; }
    if (kind === 'T') { const t = r.int(2, 4), s = r.int(3, W - 6), x1 = r.int(2, W - s - 2); return { pts: [[x1, 0], [x1 + s, 0], [x1 + s, H - t], [W, H - t], [W, H], [0, H], [0, H - t], [x1, H - t]], hide: [2, 7] }; }
    const c = r.int(2, 4), d = r.int(2, H - 3); need(W - 2 * c >= 3); return { pts: [[0, 0], [W, 0], [W, H], [W - c, H], [W - c, d], [c, d], [c, H], [0, H]], hide: [3, 4] };
  }
  const elen = (P) => P.map((p, i) => { const q = P[(i + 1) % P.length]; return Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]); });
  const rfig = (sh, u, alg) => { const P = sh.pts.map((p) => [p[0], -p[1]]), L = elen(sh.pts), sides = {}; L.forEach((l, i) => { if (!sh.hide.includes(i)) sides[`${i}-${(i + 1) % P.length}`] = `${alg ? alg(l, i) : l} ${u}`; }); return F.polygon({ pts: P, sides, w: 280, h: 210 }); };
  /** shape with curved side(s): rectangle with one curved end (curve length given) */
  const curvF = (l, w, cv, u, two) => { const W = 170, H = Math.max(60, Math.min(110, (170 * w) / l)), x0 = 50, y0 = 55; let o = S.path(`M${x0},${y0} L${x0 + W},${y0} Q${x0 + W + 34},${y0 + H / 2} ${x0 + W},${y0 + H} L${x0},${y0 + H}` + (two ? ` Q${x0 - 34},${y0 + H / 2} ${x0},${y0}` : ' Z')); o += S.text(x0 + W / 2, y0 - 10, `${l} ${u}`, { s: 12 }) + S.text(x0 + W / 2, y0 + H + 12, `${l} ${u}`, { s: 12 }); if (!two) o += S.text(x0 - 6, y0 + H / 2, `${w} ${u}`, { s: 12, a: 'end' }); o += S.text(x0 + W + 38, y0 + H / 2, `${cv} ${u}`, { s: 12, a: 'start' }); if (two) o += S.text(x0 - 38, y0 + H / 2, `${cv} ${u}`, { s: 12, a: 'end' }); return S.wrap(330, y0 + H + 34, o, 'shape with curved boundary'); };
  const gridF = (P) => { const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]), W = Math.max(...xs), H = Math.max(...ys), k = Math.min(22, 240 / W, 150 / H); let o = ''; for (let i = 0; i <= W; i++) o += S.line(20 + i * k, 20, 20 + i * k, 20 + H * k, { w: 0.5, op: 0.3 }); for (let j = 0; j <= H; j++) o += S.line(20, 20 + j * k, 20 + W * k, 20 + j * k, { w: 0.5, op: 0.3 }); o += S.poly(P.map((p) => [20 + p[0] * k, 20 + (H - p[1]) * k]), { fill: 'currentColor', op: 0.12, w: 1.8 }); return S.wrap(40 + W * k, 40 + H * k, o, 'shape on a square grid'); };
  const CTX1 = [['a rectangular padi field', 'sawah padi berbentuk segi empat tepat'], ['a rectangular school field', 'padang sekolah berbentuk segi empat tepat'], ['a rectangular vegetable plot', 'batas sayur berbentuk segi empat tepat'], ['a rectangular swimming pool', 'kolam renang berbentuk segi empat tepat'], ['a rectangular football pitch', 'padang bola sepak berbentuk segi empat tepat']];
  const CTX1S = [['a rectangular carpet', 'permaidani berbentuk segi empat tepat'], ['a rectangular stage', 'pentas berbentuk segi empat tepat'], ['a rectangular classroom floor', 'lantai bilik darjah berbentuk segi empat tepat'], ['a rectangular wall', 'dinding berbentuk segi empat tepat']];
  const PR = [ // chain parts: [needs-sentence, ask, fn(l,w,x)] – x is a per-part parameter
    (r, l, w) => { const P = 2 * (l + w); return [T('Find the perimeter.', 'Cari perimeternya.'), T(`${P}`)]; },
    (r, l, w) => { const g = r.int(2, 4), P = 2 * (l + w); return [T(`A gate ${g} m wide needs no fence. Find the length of fencing needed.`, `Sebuah pintu pagar selebar ${g} m tidak memerlukan pagar. Cari panjang pagar yang diperlukan.`), T(`${P - g} m`)]; },
    (r, l, w) => { const p = r.pick([8, 12, 15, 18]), P = 2 * (l + w); return [T(`Fencing costs RM${p} per metre. Find the cost of fencing the whole boundary.`, `Kos pagar ialah RM${p} semeter. Cari kos memagar seluruh sempadan.`), T(`RM${P * p}`)]; },
    (r, l, w) => { const P = 2 * (l + w), sp = [2, 4, 5].find((s) => P % s === 0) || 2; return [T(`A post is placed every ${sp} m along the boundary, starting at a corner. How many posts are needed?`, `Sebatang tiang dipasang setiap ${sp} m di sepanjang sempadan, bermula di satu sudut. Berapakah bilangan tiang yang diperlukan?`), T(`${P / sp}`)]; },
    (r, l, w) => { const k = r.int(2, 5), P = 2 * (l + w); return [T(`Amir walks ${k} times round the boundary. How far does he walk in metres?`, `Amir berjalan ${k} kali mengelilingi sempadan. Berapakah jarak yang dilaluinya dalam meter?`), T(`${k * P} m`)]; },
    (r, l, w) => { const P = 2 * (l + w); return [T(`A second rectangle has the same perimeter and a length of ${l + 2} m. Find its width.`, `Sebuah segi empat tepat kedua mempunyai perimeter yang sama dan panjang ${l + 2} m. Cari lebarnya.`), T(`${P / 2 - l - 2} m`)]; },
    (r, l, w) => { const P = 2 * (l + w), c = r.pick([20, 25, 30]); return [T(`One litre of paint marks ${c} m of line. How many litres are needed to mark the whole boundary once (whole litres only)?`, `Satu liter cat menanda ${c} m garisan. Berapakah liter cat yang diperlukan untuk menanda seluruh sempadan sekali (liter penuh sahaja)?`), T(`${Math.ceil(P / c)}`)]; },
    (r, l, w) => { const P = 2 * (l + w), d = r.pick([1, 1.5, 2]); return [T(`A jogger runs ${d} km round the boundary. How many complete rounds does the jogger make?`, `Seorang pelari berlari ${n(d)} km mengelilingi sempadan. Berapakah pusingan lengkap yang dilakukannya?`), T(`${Math.floor((d * 1000) / P)}`)]; },
    (r, l, w) => { const P = 2 * (l + w); return [T('Express the perimeter in kilometres.', 'Nyatakan perimeter itu dalam kilometer.'), T(`${n(P / 1000)} km`)]; },
    (r, l, w) => { const P = 2 * (l + w); return [T(`The length is increased by 3 m and the width is unchanged. Find the new perimeter.`, `Panjang ditambah 3 m dan lebar tidak berubah. Cari perimeter yang baharu.`), T(`${P + 6} m`)]; },
  ];
  const e101 = [
    (r) => {
      const u = r.pick(UN)[0], l = r.int(5, 18), w = r.int(3, l - 1), t = r.int(0, 2), P = 2 * (l + w);
      const f = [[`Find the perimeter of the rectangle.`, `Cari perimeter segi empat tepat itu.`], [`A rectangle is ${l} ${u} long and ${w} ${u} wide. Calculate its perimeter.`, `Sebuah segi empat tepat panjangnya ${l} ${u} dan lebarnya ${w} ${u}. Hitung perimeternya.`], [`The length and width of a rectangle are shown. What is the distance all the way round it?`, `Panjang dan lebar sebuah segi empat tepat ditunjukkan. Berapakah jarak keseluruhan mengelilinginya?`]][t];
      return { q: T(f[0], f[1]), fig: t !== 1 ? F.polygon({ pts: [[0, 0], [l, 0], [l, -w], [0, -w]], sides: { '0-1': `${l} ${u}`, '1-2': `${w} ${u}` }, w: 250, h: 150 }) : undefined, a: T(`${P} ${u}`), w: T(`$2 \\times (${l} + ${w})$`), sp: 's' };
    },
    (r) => { const c = r.pick(CTX1), l = r.int(20, 60), w = r.int(10, l - 5), u = 'm'; return { q: T(`${SPM.cap(c[0])} is ${l} m long and ${w} m wide. Find the perimeter.`, `${SPM.cap(c[1])} panjangnya ${l} m dan lebarnya ${w} m. Cari perimeter.`), a: T(`${2 * (l + w)} m`), sp: 's' }; },
    (r) => {
      const t = r.int(0, 2), a = r.int(3, 12), b = r.int(3, 12), c = r.int(3, 12), u = r.pick(UN)[0];
      need(a + b > c && a + c > b && b + c > a && a !== b);
      const P = t === 0 ? [[0, 0], [5, 0], [1.6, -3]] : t === 1 ? [[0, 0], [5, 0], [2.5, -3.2]] : [[0, 0], [4, 0], [4, -3]];
      return { q: nts(T(t === 2 ? `The sides of a triangle are ${a}, ${b} and ${c} ${u}. Find its perimeter.` : `Find the perimeter of the triangle.`, t === 2 ? `Sisi-sisi sebuah segi tiga ialah ${a}, ${b} dan ${c} ${u}. Cari perimeternya.` : `Cari perimeter segi tiga itu.`)), fig: t === 2 ? undefined : F.polygon({ pts: P, sides: { '0-1': `${a} ${u}`, '1-2': `${b} ${u}`, '2-0': `${c} ${u}` }, w: 250, h: 170 }), a: T(`${a + b + c} ${u}`), w: T(`$${a} + ${b} + ${c}$`), sp: 's' };
    },
    (r) => { const k = r.int(3, 8), s = r.int(3, 15), u = r.pick(UN)[0]; return { q: T(`A regular ${PNM[k]} has sides of ${s} ${u}. Find its perimeter.`, `${SPM.cap(PMS[k])} sekata mempunyai sisi ${s} ${u}. Cari perimeternya.`), a: T(`${k * s} ${u}`), w: T(`$${k} \\times ${s}$`), sp: 'xs' }; },
    (r) => {
      const kind = r.pick(['L', 'U', 'T']), sh = rshape(r, kind), Pm = elen(sh.pts).reduce((x, y) => x + y, 0);
      const P = sh.pts.map((p) => [p[0], p[1]]);
      return { q: T('Each square of the grid is 1 cm by 1 cm. Find the perimeter of the shaded shape.', 'Setiap petak grid ialah 1 cm kali 1 cm. Cari perimeter bentuk berlorek itu.'), fig: gridF(P), a: T(`${Pm} cm`), sp: 's' };
    },
    (r) => {
      const l = r.int(6, 20), w = r.int(3, l - 1), P = 2 * (l + w), k = r.int(0, 2);
      const f = [[`The perimeter of a rectangle is ${P} cm and its length is ${l} cm. Find its width.`, `Perimeter sebuah segi empat tepat ialah ${P} cm dan panjangnya ${l} cm. Cari lebarnya.`, `${w} cm`], [`A square has a perimeter of ${4 * l} cm. Find the length of one side.`, `Sebuah segi empat sama mempunyai perimeter ${4 * l} cm. Cari panjang satu sisinya.`, `${l} cm`], [`An equilateral triangle has a perimeter of ${3 * l} m. Find the length of each side.`, `Sebuah segi tiga sama sisi mempunyai perimeter ${3 * l} m. Cari panjang setiap sisinya.`, `${l} m`]][k];
      return { q: T(f[0], f[1]), a: T(f[2]), sp: 's' };
    },
    (r) => { const p = r.pick([[`The perimeter of a shape is the distance around it.`, `Perimeter sesuatu bentuk ialah jarak mengelilinginya.`, 1], [`The perimeter of a rectangle is measured in square centimetres (cm²).`, `Perimeter segi empat tepat diukur dalam sentimeter persegi (cm²).`, 0, `Perimeter is a length, measured in cm.`, `Perimeter ialah panjang, diukur dalam cm.`], [`A square with sides of 5 cm has a perimeter of 20 cm.`, `Sebuah segi empat sama bersisi 5 cm mempunyai perimeter 20 cm.`, 1], [`A rectangle 6 cm by 4 cm has a perimeter of 24 cm.`, `Segi empat tepat 6 cm kali 4 cm mempunyai perimeter 24 cm.`, 0, `$2(6 + 4) = 20$ cm.`, `$2(6 + 4) = 20$ cm.`], [`Two different rectangles can have the same perimeter.`, `Dua segi empat tepat yang berbeza boleh mempunyai perimeter yang sama.`, 1], [`To find the perimeter of a polygon we add the lengths of all its sides.`, `Untuk mencari perimeter sebuah poligon, kita tambahkan panjang semua sisinya.`, 1]]); return { q: T('True or false? ' + p[0], 'Benar atau palsu? ' + p[1]), a: TF(p[2], p[3], p[4]), sp: 'xs' }; },
  ];
  const m101 = [
    (r) => {
      const kind = r.pick(['L', 'T', 'U']), sh = rshape(r, kind), u = r.pick(UN)[0], Pm = elen(sh.pts).reduce((x, y) => x + y, 0);
      return { q: nts(Q(r.pick([[`Find the perimeter of the figure. All angles are right angles and two lengths are not shown.`, `Cari perimeter rajah itu. Semua sudut ialah sudut tegak dan dua panjang tidak ditunjukkan.`], [`The figure has only right angles. Some lengths are missing. Calculate its perimeter.`, `Rajah itu hanya mempunyai sudut tegak. Sesetengah panjang tidak diberikan. Hitung perimeternya.`]]), {})), fig: rfig(sh, u), a: T(`${Pm} ${u}`), w: T(kind === 'L' ? 'The two missing sides are found by subtraction from the opposite sides.' : 'Find each missing side from the lengths that are given.', kind === 'L' ? 'Dua sisi yang hilang dicari dengan penolakan daripada sisi yang bertentangan.' : 'Cari setiap sisi yang hilang daripada panjang yang diberi.'), sp: 'm' };
    },
    (r) => {
      const l = r.int(35, 95) / 10, w = r.int(20, 34) / 10, c = r.pick(CTX1S);
      return { q: T(`${SPM.cap(c[0])} measures ${n(l)} m by ${n(w)} m. Find the perimeter.`, `${SPM.cap(c[1])} berukuran ${n(l)} m kali ${n(w)} m. Cari perimeter.`), a: T(`${n(round(2 * (l + w), 2))} m`), sp: 's' };
    },
    (r) => {
      const l = r.int(2, 9), lc = r.int(20, 90), t = r.int(0, 1), w = r.int(3, 8), lu = t ? `${l} m ${lc} cm` : `${l} m`;
      return { q: t ? T(`A rectangular table top is ${l} m long and ${lc} cm wide. Find its perimeter in centimetres.`, `Permukaan meja berbentuk segi empat tepat itu panjangnya ${l} m dan lebarnya ${lc} cm. Cari perimeternya dalam sentimeter.`) : T(`A rectangular garden is ${l} m long and ${w * 50} cm wide. Find its perimeter in metres.`, `Sebuah taman berbentuk segi empat tepat panjangnya ${l} m dan lebarnya ${w * 50} cm. Cari perimeternya dalam meter.`), a: t ? T(`${2 * (l * 100 + lc)} cm`) : T(`${n(2 * (l + w * 0.5))} m`), w: t ? T(`$2 \\times (${l * 100} + ${lc})$`) : T(`$${w * 50}$ cm $= ${n(w * 0.5)}$ m`, `$${w * 50}$ cm $= ${n(w * 0.5)}$ m`), sp: 's' };
    },
    (r) => {
      const l = r.int(20, 60), w = r.int(10, 30), P = 2 * (l + w), k = r.int(0, 3), d = r.pick([-8, -5, 6, 10, -12]), est = P + d, e2 = P + r.pick([-3, 4, 7]);
      need(est > 0 && d !== e2 - P && Math.abs(d) !== Math.abs(e2 - P));
      const f = [[`Aina estimated the perimeter of a rectangular garden ${l} m long and ${w} m wide as ${est} m. Calculate the actual perimeter and the difference between her estimate and the actual value.`, `Aina menganggarkan perimeter sebuah taman segi empat tepat berukuran ${l} m panjang dan ${w} m lebar ialah ${est} m. Hitung perimeter sebenar dan beza antara anggarannya dengan nilai sebenar.`, `Actual ${P} m; difference ${Math.abs(d)} m`, `Sebenar ${P} m; beza ${Math.abs(d)} m`], [`Two students estimate the perimeter of a ${l} m by ${w} m field as ${est} m and ${e2} m. Whose estimate is closer to the actual perimeter?`, `Dua orang murid menganggar perimeter sebuah padang ${l} m kali ${w} m sebagai ${est} m dan ${e2} m. Anggaran siapakah yang lebih hampir dengan perimeter sebenar?`, `Actual ${P} m: the estimate of ${Math.abs(d) < Math.abs(e2 - P) ? est : e2} m is closer`, `Sebenar ${P} m: anggaran ${Math.abs(d) < Math.abs(e2 - P) ? est : e2} m lebih hampir`], [`A perimeter estimate is accepted if it is within 5 m of the actual value. Is an estimate of ${est} m acceptable for a ${l} m by ${w} m rectangle?`, `Anggaran perimeter diterima jika berada dalam lingkungan 5 m daripada nilai sebenar. Adakah anggaran ${est} m boleh diterima bagi sebuah segi empat tepat ${l} m kali ${w} m?`, `Actual ${P} m; difference ${Math.abs(d)} m, so ${Math.abs(d) <= 5 ? 'acceptable' : 'not acceptable'}`, `Sebenar ${P} m; beza ${Math.abs(d)} m, jadi ${Math.abs(d) <= 5 ? 'boleh diterima' : 'tidak boleh diterima'}`], [`Round each side of a ${l + 1} m by ${w + 2} m rectangle to the nearest 10 m and estimate the perimeter. Then find the exact perimeter and the difference.`, `Bundarkan setiap sisi segi empat tepat ${l + 1} m kali ${w + 2} m kepada 10 m terdekat dan anggarkan perimeternya. Kemudian cari perimeter tepat dan bezanya.`, `Estimate ${2 * (Math.round((l + 1) / 10) * 10 + Math.round((w + 2) / 10) * 10)} m; exact ${2 * (l + w + 3)} m; difference ${Math.abs(2 * (Math.round((l + 1) / 10) * 10 + Math.round((w + 2) / 10) * 10) - 2 * (l + w + 3))} m`, `Anggaran ${2 * (Math.round((l + 1) / 10) * 10 + Math.round((w + 2) / 10) * 10)} m; tepat ${2 * (l + w + 3)} m; beza ${Math.abs(2 * (Math.round((l + 1) / 10) * 10 + Math.round((w + 2) / 10) * 10) - 2 * (l + w + 3))} m`]][k];
      return { q: T(f[0], f[1]), a: T(f[2], f[3]), sp: 's' };
    },
    (r) => {
      const t = r.int(0, 1), l = r.int(8, 18), w = r.int(4, 9), cv = r.int(60, 190) / 10, u = 'cm';
      const P = t ? 2 * l + 2 * cv : 2 * l + w + cv;
      return { q: nts(T(t ? `The shape has two straight sides and two curved ends. The lengths are shown. Find its perimeter.` : `The shape has three straight sides and one curved side. The lengths are shown. Find its perimeter.`, t ? `Bentuk itu mempunyai dua sisi lurus dan dua hujung melengkung. Panjang-panjang ditunjukkan. Cari perimeternya.` : `Bentuk itu mempunyai tiga sisi lurus dan satu sisi melengkung. Panjang-panjang ditunjukkan. Cari perimeternya.`)), fig: curvF(l, w, cv, u, !!t), a: T(`${n(round(P, 2))} cm`), w: T(t ? `$2 \\times ${l} + 2 \\times ${cv}$` : `$${l} + ${l} + ${w} + ${cv}$`, t ? `$2 \\times ${l} + 2 \\times ${cv}$` : `$${l} + ${l} + ${w} + ${cv}$`), sp: 'm' };
    },
    (r) => {
      const t = r.int(0, 3), x = r.int(3, 10), v = r.pick(VARS);
      const a = r.int(2, 4), b = r.int(1, 6), c = r.int(1, 3), d = r.int(1, 6), P = 2 * ((a * x + b) + (c * x + d));
      const f = [[`A rectangle has a length of $(${lin(a, b, v)})$ cm and a width of $(${lin(c, d, v)})$ cm. Its perimeter is ${P} cm. Find ${mx(v)}.`, `Sebuah segi empat tepat panjangnya $(${lin(a, b, v)})$ cm dan lebarnya $(${lin(c, d, v)})$ cm. Perimeternya ${P} cm. Cari ${mx(v)}.`, x], [`The sides of a triangle are $${v}$ cm, $(${lin(1, b, v)})$ cm and $(${lin(2, d, v)})$ cm. Its perimeter is ${x + x + b + 2 * x + d} cm. Find ${mx(v)}.`, `Sisi-sisi sebuah segi tiga ialah $${v}$ cm, $(${lin(1, b, v)})$ cm dan $(${lin(2, d, v)})$ cm. Perimeternya ${x + x + b + 2 * x + d} cm. Cari ${mx(v)}.`, x], [`A square has a side of $(${lin(a, b, v)})$ cm and a perimeter of ${4 * (a * x + b)} cm. Find ${mx(v)}.`, `Sebuah segi empat sama mempunyai sisi $(${lin(a, b, v)})$ cm dan perimeter ${4 * (a * x + b)} cm. Cari ${mx(v)}.`, x], [`An isosceles triangle has two equal sides of $(${lin(a, b, v)})$ cm and a base of $${lin(c, 0, v)}$ cm. Its perimeter is ${2 * (a * x + b) + c * x} cm. Find ${mx(v)}.`, `Sebuah segi tiga sama kaki mempunyai dua sisi sama $(${lin(a, b, v)})$ cm dan tapak $${lin(c, 0, v)}$ cm. Perimeternya ${2 * (a * x + b) + c * x} cm. Cari ${mx(v)}.`, x]][t];
      return { q: T(f[0], f[1]), a: T(`$${v} = ${f[2]}$`), sp: 'm' };
    },
    (r, cx) => {
      const lv = cx && cx.d, l = r.int(10, 30), w = r.int(6, l - 2), c = r.pick(CTX1), nn = lv === 'e' ? 2 : lv === 'a' ? r.pick([3, 4]) : r.pick([2, 3]), ids = r.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], nn).sort((x, y) => x - y);
      const ps = ids.map((i) => PR[i](r, l, w)), ok = ps.every((p) => !/NaN/.test(p[1].en));
      need(ok && (!ids.includes(3) || (2 * (l + w)) % 2 === 0) && (!ids.includes(5) || 2 * (l + w) / 2 - l - 2 > 0));
      return { q: T(`${SPM.cap(c[0])} is ${l} m long and ${w} m wide.` + SPM.parts(ps.map((p) => p[0])).en, `${SPM.cap(c[1])} panjangnya ${l} m dan lebarnya ${w} m.` + SPM.parts(ps.map((p) => p[0])).ms), a: SPM.parts(ps.map((p) => p[1])), sp: 'm' };
    },
    (r) => {
      const a = r.int(5, 14), b = r.int(5, 14), c = r.int(4, 12), d = r.int(3, 9), P = 2 * (a + b) , t = r.int(0, 2);
      need(a !== b);
      const f = [[`The perimeter of a rectangle with sides ${a} cm and ${b} cm is compared with that of a square of side ${Math.round((a + b) / 2)} cm. Which is larger, and by how much?`, `Perimeter sebuah segi empat tepat dengan sisi ${a} cm dan ${b} cm dibandingkan dengan perimeter sebuah segi empat sama bersisi ${Math.round((a + b) / 2)} cm. Yang manakah lebih besar, dan berapakah bezanya?`, (a + b) % 2 === 0 ? `Equal: both are ${2 * (a + b)} cm` : `The rectangle: ${2 * (a + b)} cm against ${4 * Math.round((a + b) / 2)} cm`, (a + b) % 2 === 0 ? `Sama: kedua-duanya ${2 * (a + b)} cm` : `Segi empat tepat: ${2 * (a + b)} cm berbanding ${4 * Math.round((a + b) / 2)} cm`], [`A pentagon has sides ${a} cm, ${b} cm, ${c} cm, ${d} cm and $x$ cm. Its perimeter is ${a + b + c + d + 7} cm. Find $x$.`, `Sebuah pentagon mempunyai sisi ${a} cm, ${b} cm, ${c} cm, ${d} cm dan $x$ cm. Perimeternya ${a + b + c + d + 7} cm. Cari $x$.`, `$x = 7$`, `$x = 7$`], [`An isosceles triangle has a perimeter of ${2 * a + b} cm and a base of ${b} cm. Find the length of each equal side.`, `Sebuah segi tiga sama kaki mempunyai perimeter ${2 * a + b} cm dan tapak ${b} cm. Cari panjang setiap sisi yang sama.`, `${a} cm`, `${a} cm`]][t];
      return { q: T(f[0], f[1]), a: T(f[2], f[3]), sp: 's' };
    },
  ];

  const a101 = [
    (r) => {
      const v = r.pick(VARS), x = r.int(3, 9), A = r.int(1, 3), B = r.int(2, 6), C = r.int(1, 2), D = r.int(4, 9), W = A * x + B, H = C * x + D;
      need(W >= 8 && H >= 7);
      const sh = rshape(r, 'L', W, H), P = 2 * (W + H), u = r.pick(UN)[0];
      return { q: nts(T(`The L-shaped figure has only right angles. Its perimeter is ${P} ${u}. Find the value of ${mx(v)}.`, `Rajah berbentuk L itu hanya mempunyai sudut tegak. Perimeternya ialah ${P} ${u}. Cari nilai ${mx(v)}.`)), fig: rfig(sh, u, (l, i) => (i === 0 ? `(${lin(A, B, v)})` : i === 5 ? `(${lin(C, D, v)})` : l)), a: T(`$${v} = ${x}$`), w: T(`$2[(${lin(A, B, v)}) + (${lin(C, D, v)})] = ${P}$`), sp: 'm' };
    },
    (r) => {
      const kind = r.pick(['L', 'L', 'T', 'U']), sh = rshape(r, kind), u = r.pick(UN)[0], L = elen(sh.pts), Pm = L.reduce((x, y) => x + y, 0), xi = kind === 'L' ? 0 : kind === 'T' ? 1 : 5;
      const sides = {};
      L.forEach((l, i) => { if (i === xi) sides[`${i}-${(i + 1) % L.length}`] = 'x'; else if (!sh.hide.includes(i)) sides[`${i}-${(i + 1) % L.length}`] = `${l} ${u}`; });
      return { q: nts(T(`The perimeter of the figure is ${Pm} ${u}. All angles are right angles. Find the value of $x$.`, `Perimeter rajah itu ialah ${Pm} ${u}. Semua sudut ialah sudut tegak. Cari nilai $x$.`)), fig: F.polygon({ pts: sh.pts.map((p) => [p[0], -p[1]]), sides, w: 280, h: 210 }), a: T(`$x = ${L[xi]}$ ${u}`, `$x = ${L[xi]}$ ${u}`), sp: 'm' };
    },
    (r) => {
      const c = r.pick(CTX1), t = r.int(0, 2), w = r.int(6, 20), d = r.int(3, 12), k = r.int(2, 4), l = t === 0 ? w + d : t === 1 ? k * w : 2 * w - d;
      need(l > w);
      const f = [[`the length is ${d} m more than the width`, `panjangnya ${d} m lebih daripada lebarnya`], [`the length is ${k} times the width`, `panjangnya ${k} kali lebarnya`], [`the length is ${d} m less than twice the width`, `panjangnya ${d} m kurang daripada dua kali lebarnya`]][t];
      return { q: T(`The perimeter of ${c[0]} is ${2 * (l + w)} m and ${f[0]}. Find its length and width.`, `Perimeter ${c[1]} ialah ${2 * (l + w)} m dan ${f[1]}. Cari panjang dan lebarnya.`), a: T(`Length ${l} m, width ${w} m`, `Panjang ${l} m, lebar ${w} m`), sp: 'm' };
    },
    (r) => {
      const t = r.int(0, 3), l = r.int(6, 15), w = r.int(3, l - 1), W = r.int(8, 14), H = r.int(6, 12), P = 2 * (l + w);
      const f = [[`Ali finds the perimeter of a rectangle ${l} cm by ${w} cm as ${l} × ${w} = ${l * w} cm. Explain his mistake and find the correct perimeter.`, `Ali mencari perimeter sebuah segi empat tepat ${l} cm kali ${w} cm sebagai ${l} × ${w} = ${l * w} cm. Terangkan kesilapannya dan cari perimeter yang betul.`, `He found the area. The perimeter is $2(${l} + ${w}) = ${P}$ cm.`, `Dia mencari luas. Perimeter ialah $2(${l} + ${w}) = ${P}$ cm.`], [`Siti says the perimeter of a rectangle ${l} cm by ${w} cm is ${l} + ${w} = ${l + w} cm. What has she forgotten? Find the correct perimeter.`, `Siti berkata perimeter sebuah segi empat tepat ${l} cm kali ${w} cm ialah ${l} + ${w} = ${l + w} cm. Apakah yang dilupakannya? Cari perimeter yang betul.`, `She added only two sides; all four sides count: $2(${l} + ${w}) = ${P}$ cm.`, `Dia menambah dua sisi sahaja; keempat-empat sisi dikira: $2(${l} + ${w}) = ${P}$ cm.`], [`Kumar says the perimeter of a square of side ${l} cm is ${2 * l} cm. Is he correct? Explain.`, `Kumar berkata perimeter sebuah segi empat sama bersisi ${l} cm ialah ${2 * l} cm. Adakah dia betul? Terangkan.`, `No: a square has four sides, so the perimeter is $4 \\times ${l} = ${4 * l}$ cm.`, `Tidak: segi empat sama mempunyai empat sisi, jadi perimeternya $4 \\times ${l} = ${4 * l}$ cm.`], [`Mei Ling says the perimeter of an L-shaped figure with overall width ${W} cm and overall height ${H} cm is less than that of a ${W} cm by ${H} cm rectangle because a corner is cut away. Is she correct?`, `Mei Ling berkata perimeter rajah berbentuk L dengan lebar keseluruhan ${W} cm dan tinggi keseluruhan ${H} cm adalah kurang daripada perimeter segi empat tepat ${W} cm kali ${H} cm kerana satu sudut dipotong. Adakah dia betul?`, `No: cutting a rectangular corner does not change the perimeter; both are $2(${W} + ${H}) = ${2 * (W + H)}$ cm.`, `Tidak: memotong sudut segi empat tepat tidak mengubah perimeter; kedua-duanya $2(${W} + ${H}) = ${2 * (W + H)}$ cm.`]][t];
      return { q: T(f[0], f[1]), a: T(f[2], f[3]), sp: 's' };
    },
  ];
  SPM.extend('F1-10.1', { e: [m101.find((f) => f.length === 2)].concat(e101), m: m101, a: a101.concat([m101.find((f) => f.length === 2)]) });
  /* ================= F1-10.2 Area of triangles, parallelograms, kites, trapeziums ================= */
  const TRP = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13]]; // [offset, height, slant]
  const SHN = { tri: T('triangle', 'segi tiga'), pg: T('parallelogram', 'segi empat selari'), kt: T('kite', 'layang-layang'), tz: T('trapezium', 'trapezium') };
  /** figure of a shape with its dimensions; d = {b,h,off,s,a,d1,d2}; o.slant shows slanted side lengths, o.obt places the apex outside the base, o.unit */
  function shp(kind, d, o) {
    o = o || {};
    const u = o.unit || 'cm', W = 280, H = 180, lab = (x, y, t, op) => S.text(x, y, t, Object.assign({ s: 12 }, op || {}));
    let out = '';
    if (kind === 'tri' || kind === 'pg' || kind === 'tz') {
      const bw = kind === 'tz' ? Math.max(d.b, d.a + d.off) : d.b, ext = kind === 'tri' ? Math.max(d.b, d.off) + Math.max(0, -Math.min(0, d.off)) : bw + (kind === 'pg' ? d.off : 0), k = Math.min(200 / ext, 105 / d.h), hh = d.h * k, x0 = (W - ext * k) / 2 + (kind === 'tri' && d.off < 0 ? -d.off * k : 0), y0 = (H + hh) / 2;
      const sx = (v) => x0 + v * k;
      let P, foot;
      if (kind === 'tri') { P = [[sx(0), y0], [sx(d.b), y0], [sx(d.off), y0 - hh]]; foot = sx(d.off); }
      else if (kind === 'pg') { P = [[sx(0), y0], [sx(d.b), y0], [sx(d.b + d.off), y0 - hh], [sx(d.off), y0 - hh]]; foot = sx(d.off); }
      else { P = [[sx(0), y0], [sx(d.b), y0], [sx(d.off + d.a), y0 - hh], [sx(d.off), y0 - hh]]; foot = sx(d.off); }
      out += S.poly(P, { fill: o.fill ? 'currentColor' : undefined, op: o.fill ? 0.12 : undefined });
      const apex = P[kind === 'tri' ? 2 : 3];
      if (kind === 'tri' && (d.off > d.b || d.off < 0)) out += S.line(d.off < 0 ? sx(0) : sx(d.b), y0, foot, y0, { dash: true });
      out += S.line(apex[0], apex[1], foot, y0, { dash: true }) + S.rightAngle([foot, y0], apex, [foot + (d.off < 0 ? -20 : 20), y0], 7);
      out += lab(sx(d.b / 2), y0 + 14, `${d.b} ${u}`) + lab(foot + 7, y0 - hh / 2, `${d.h} ${u}`, { a: 'start' });
      if (kind === 'tz') out += lab(sx(d.off + d.a / 2), y0 - hh - 10, `${d.a} ${u}`);
      if (o.slant) { const L = kind === 'pg' ? [sx(d.b), y0, P[2][0], P[2][1]] : [sx(0), y0, apex[0], apex[1]]; out += lab((L[0] + L[2]) / 2 + (kind === 'pg' ? 16 : -16), (L[1] + L[3]) / 2, `${d.s} ${u}`); }
    } else {
      const k = Math.min(200 / d.d2, 120 / d.d1), v = d.d1 * k, hz = d.d2 * k, cx = W / 2, cy = H / 2 + (d.up ? (d.d1 / 2 - d.up) * k : 0), top = (d.up || d.d1 / 3) * k, T0 = [cx, cy - top], B = [cx, cy - top + v], Lf = [cx - hz / 2, cy], R = [cx + hz / 2, cy];
      out += S.poly([T0, R, B, Lf]) + S.line(T0[0], T0[1], B[0], B[1], { dash: true }) + S.line(Lf[0], Lf[1], R[0], R[1], { dash: true }) + S.rightAngle([cx, cy], [cx + 10, cy], [cx, cy - 10], 7);
      out += lab(cx + 8, T0[1] + 12, `${d.d1} ${u}`, { a: 'start' }) + lab(cx + hz / 4, cy - 9, `${d.d2} ${u}`);
      if (o.slant) out += lab((T0[0] + R[0]) / 2 + 14, (T0[1] + R[1]) / 2 - 6, `${d.s1} ${u}`) + lab((R[0] + B[0]) / 2 + 14, (R[1] + B[1]) / 2 + 8, `${d.s2} ${u}`);
    }
    return S.wrap(W, H, out, 'shape');
  }
  const AREAF = { tri: (d) => (d.b * d.h) / 2, pg: (d) => d.b * d.h, kt: (d) => (d.d1 * d.d2) / 2, tz: (d) => ((d.a + d.b) * d.h) / 2 };
  const dims = (r, kind) => { const h = r.int(3, 12), b = r.int(4, 16); if (kind === 'tri') return { b, h, off: r.int(1, b - 1) }; if (kind === 'pg') return { b, h, off: r.int(2, 5) }; if (kind === 'kt') { const d1 = r.int(5, 16), d2 = r.int(4, 14); return { d1, d2, up: Math.max(1, Math.round(d1 * 0.4)) }; } const a = r.int(3, 10); return { a, b: a + r.int(2, 7), h, off: r.int(1, 3) }; };
  const FORM = { tri: ['A = \\frac{1}{2} \\times \\text{base} \\times \\text{height}', 'Luas $= \\frac{1}{2} \\times \\text{tapak} \\times \\text{tinggi}$'], pg: ['A = \\text{base} \\times \\text{height}'], kt: ['A = \\frac{1}{2} \\times d_1 \\times d_2'], tz: ['A = \\frac{1}{2} \\times (a + b) \\times h'] };
  const gridPoly = (kind, r) => { const t = { tri: [[[0, 0], [6, 0], [0, 4]], [[0, 0], [8, 0], [3, 5]], [[0, 0], [5, 0], [5, 6]]], pg: [[[0, 0], [5, 0], [7, 3], [2, 3]], [[0, 0], [6, 0], [8, 4], [2, 4]]], tz: [[[0, 0], [7, 0], [5, 4], [2, 4]], [[0, 0], [8, 0], [5, 3], [1, 3]]] }[kind]; return r.pick(t); };
  const shoe = (P) => Math.abs(P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  const PICK4 = ['tri', 'pg', 'kt', 'tz'];
  const MODA = [['', ''], [' Show your working.', ' Tunjukkan langkah kerja anda.'], [' Write down the formula that you use.', ' Tulis rumus yang anda gunakan.'], [' Give your answer with the correct unit.', ' Berikan jawapan anda dengan unit yang betul.']];
  const nta = (r, q) => { const m = r.pick(MODA); return nts(T(q.en + m[0], q.ms + m[1])); };
  const e102 = [
    (r) => {
      const kind = r.pick(PICK4), d = dims(r, kind), u = r.pick(UN)[0], ar = AREAF[kind](d);
      need(Number.isInteger(ar) && (kind !== 'kt' || d.d1 !== d.d2));
      return { q: nta(r, Q(r.pick([['Find the area of the {sh}.', 'Cari luas {shm}.'], ['Calculate the area of the {sh} shown.', 'Hitung luas {shm} yang ditunjukkan.'], ['The dimensions of a {sh} are shown. What is its area?', 'Ukuran sebuah {shm} ditunjukkan. Apakah luasnya?']]), { sh: SHN[kind].en }, { shm: SHN[kind].ms })), fig: shp(kind, d, { unit: u }), a: T(`$${n(ar)}\\ \\text{${u}}^2$`), w: T(`$${{ tri: `\\frac{1}{2} \\times ${d.b} \\times ${d.h}`, pg: `${d.b} \\times ${d.h}`, kt: `\\frac{1}{2} \\times ${d.d1} \\times ${d.d2}`, tz: `\\frac{1}{2} \\times (${d.a} + ${d.b}) \\times ${d.h}` }[kind]}$`), sp: 's' };
    },
    (r) => {
      const kind = r.pick(PICK4), d = dims(r, kind), u = r.pick(UN)[0], ar = AREAF[kind](d);
      need(Number.isInteger(ar) && (kind !== 'kt' || d.d1 !== d.d2));
      const tx = { tri: [`A triangle has a base of ${d.b} ${u} and a perpendicular height of ${d.h} ${u}.`, `Sebuah segi tiga mempunyai tapak ${d.b} ${u} dan tinggi serenjang ${d.h} ${u}.`], pg: [`A parallelogram has a base of ${d.b} ${u} and a perpendicular height of ${d.h} ${u}.`, `Sebuah segi empat selari mempunyai tapak ${d.b} ${u} dan tinggi serenjang ${d.h} ${u}.`], kt: [`A kite has diagonals of ${d.d1} ${u} and ${d.d2} ${u}.`, `Sebuah layang-layang mempunyai pepenjuru ${d.d1} ${u} dan ${d.d2} ${u}.`], tz: [`A trapezium has parallel sides of ${d.a} ${u} and ${d.b} ${u}, and the distance between them is ${d.h} ${u}.`, `Sebuah trapezium mempunyai sisi selari ${d.a} ${u} dan ${d.b} ${u}, dan jarak antara kedua-duanya ialah ${d.h} ${u}.`] }[kind];
      return { q: T(tx[0] + ' Find its area.', tx[1] + ' Cari luasnya.'), a: T(`$${n(ar)}\\ \\text{${u}}^2$`), sp: 's' };
    },
    (r) => {
      const kind = r.pick(PICK4), d = dims(r, kind), ar = AREAF[kind](d), wrong = { tri: [d.b * d.h, d.b + d.h, (d.b * d.h) / 4], pg: [(d.b * d.h) / 2, d.b + d.h, 2 * (d.b + d.h)], kt: [d.d1 * d.d2, d.d1 + d.d2, (d.d1 * d.d2) / 4], tz: [(d.a + d.b) * d.h, d.a * d.b * d.h / 2, (d.a + d.b + d.h)] }[kind];
      need(Number.isInteger(ar) && wrong.every((x) => x !== ar && Number.isInteger(x)) && new Set(wrong).size === 3);
      const m = mc(r, [{ t: lt(mx(n(ar))), ok: true }, ...wrong.map((x) => ({ t: lt(mx(n(x))), ok: false }))]);
      const dm = { tri: `base ${d.b} cm and height ${d.h} cm`, pg: `base ${d.b} cm and height ${d.h} cm`, kt: `diagonals ${d.d1} cm and ${d.d2} cm`, tz: `parallel sides ${d.a} cm and ${d.b} cm and height ${d.h} cm` }[kind], dmm = { tri: `tapak ${d.b} cm dan tinggi ${d.h} cm`, pg: `tapak ${d.b} cm dan tinggi ${d.h} cm`, kt: `pepenjuru ${d.d1} cm dan ${d.d2} cm`, tz: `sisi selari ${d.a} cm dan ${d.b} cm dan tinggi ${d.h} cm` }[kind];
      return { q: T(`Which of the following is the area, in cm², of a ${SHN[kind].en} with ${dm}? ${m.en}`, `Antara yang berikut, yang manakah luas, dalam cm², bagi ${SHN[kind].ms} dengan ${dmm}? ${m.ms}`), a: m.ans, sp: 'xs' };
    },
    (r) => { const kind = r.pick(PICK4), c = r.pick([['area of a triangle', 'luas segi tiga', 'tri'], ['area of a parallelogram', 'luas segi empat selari', 'pg'], ['area of a kite', 'luas layang-layang', 'kt'], ['area of a trapezium', 'luas trapezium', 'tz']]); const opts = { tri: ['$\\frac{1}{2} \\times \\text{base} \\times \\text{height}$', '$\\text{base} \\times \\text{height}$', '$\\frac{1}{2} \\times \\text{base} \\times \\text{slant side}$', '$\\text{base} + \\text{height}$'], pg: ['$\\text{base} \\times \\text{perpendicular height}$', '$\\frac{1}{2} \\times \\text{base} \\times \\text{height}$', '$\\text{base} \\times \\text{slant side}$', '$2 \\times (\\text{base} + \\text{height})$'], kt: ['$\\frac{1}{2} \\times d_1 \\times d_2$', '$d_1 \\times d_2$', '$\\frac{1}{2} \\times \\text{sum of the sides}$', '$d_1 + d_2$'], tz: ['$\\frac{1}{2} \\times (a + b) \\times h$', '$(a + b) \\times h$', '$\\frac{1}{2} \\times a \\times b \\times h$', '$\\frac{1}{2} \\times (a + b)$'] }[c[2]]; const m = mc(r, opts.map((t, i) => ({ t: lt(t), ok: i === 0 }))); return { q: T(`Which expression gives the ${c[0]}? ${m.en}`, `Ungkapan yang manakah memberi ${c[1]}? ${m.ms}`), a: m.ans, sp: 'xs' }; },
    (r) => {
      const kind = r.pick(['tri', 'pg', 'tz']), t = r.pick(TRP), b = r.int(t[1] + 2, 16), off = t[0], h = t[1], s = t[2], a = b - r.int(1, 3);
      need(kind !== 'tz' || a >= 3);
      const d = kind === 'tz' ? { b, a, h, off, s } : { b, h, off, s };
      return { q: nta(r, Q(['The figure shows a {sh} with its slant side and its perpendicular height. Use the correct length to find the area.', 'Rajah menunjukkan sebuah {shm} dengan sisi condong dan tinggi serenjangnya. Gunakan panjang yang betul untuk mencari luas.'], { sh: SHN[kind].en }, { shm: SHN[kind].ms })), fig: shp(kind, d, { slant: true }), a: T(`$${n(AREAF[kind](d))}\\ \\text{cm}^2$`), w: T(`The height is the perpendicular ${h} cm, not the slant side ${s} cm.`, `Tinggi ialah ${h} cm yang serenjang, bukan sisi condong ${s} cm.`), sp: 's' };
    },
    (r) => {
      const kind = r.pick(['tri', 'pg', 'tz']), P = gridPoly(kind, r), ar = shoe(P);
      return { q: T(`Each square on the grid has sides of 1 cm. The ${SHN[kind].en} is drawn on the grid. Find its area.`, `Setiap petak pada grid bersisi 1 cm. ${SPM.cap(SHN[kind].ms)} dilukis pada grid itu. Cari luasnya.`), fig: gridF(P), a: T(`${n(ar)} cm²`), sp: 's' };
    },
    (r) => { const p = r.pick([[`The area of a triangle is half the area of a rectangle with the same base and height.`, `Luas sebuah segi tiga ialah separuh luas segi empat tepat yang mempunyai tapak dan tinggi yang sama.`, 1], [`The area of a parallelogram is base × slant side.`, `Luas segi empat selari ialah tapak × sisi condong.`, 0, `The area is base × perpendicular height.`, `Luas ialah tapak × tinggi serenjang.`], [`The area of a kite is half the product of its diagonals.`, `Luas layang-layang ialah separuh hasil darab pepenjurunya.`, 1], [`Area is measured in square units such as cm² or m².`, `Luas diukur dalam unit persegi seperti cm² atau m².`, 1], [`A triangle with base 6 cm and height 4 cm has an area of 24 cm².`, `Segi tiga dengan tapak 6 cm dan tinggi 4 cm mempunyai luas 24 cm².`, 0, `The area is $\\frac{1}{2} \\times 6 \\times 4 = 12$ cm².`, `Luasnya ialah $\\frac{1}{2} \\times 6 \\times 4 = 12$ cm².`], [`The height of a triangle must be perpendicular to the base.`, `Tinggi sebuah segi tiga mestilah serenjang dengan tapak.`, 1]]); return { q: T('True or false? ' + p[0], 'Benar atau palsu? ' + p[1]), a: TF(p[2], p[3], p[4]), sp: 'xs' }; },
    (r) => { const s = r.int(3, 15), l = r.int(s + 1, 20), w = r.int(3, l - 1), u = r.pick(UN)[0], sq = r.chance(); return { q: T(sq ? `A square has sides of ${s} ${u}. Find its area.` : `A rectangle is ${l} ${u} long and ${w} ${u} wide. Find its area.`, sq ? `Sebuah segi empat sama bersisi ${s} ${u}. Cari luasnya.` : `Sebuah segi empat tepat panjangnya ${l} ${u} dan lebarnya ${w} ${u}. Cari luasnya.`), a: T(`$${sq ? s * s : l * w}\\ \\text{${u}}^2$`), sp: 'xs' }; },
  ];
  SPM.extend('F1-10.2', { e: e102 });
  const CTX102 = { tri: [['a triangular garden', 'taman berbentuk segi tiga', 'base', 'tapak'], 'b'], pg: [['a parallelogram-shaped flower bed', 'batas bunga berbentuk segi empat selari'], 'b'], kt: [['a kite-shaped signboard', 'papan tanda berbentuk layang-layang'], 'd'], tz: [['a trapezium-shaped pond', 'kolam berbentuk trapezium'], 't'] };
  const dstm = (kind, d) => ({ tri: [`with a base of ${d.b} m and a perpendicular height of ${d.h} m`, `dengan tapak ${d.b} m dan tinggi serenjang ${d.h} m`], pg: [`with a base of ${d.b} m and a perpendicular height of ${d.h} m`, `dengan tapak ${d.b} m dan tinggi serenjang ${d.h} m`], kt: [`with diagonals of ${d.d1} m and ${d.d2} m`, `dengan pepenjuru ${d.d1} m dan ${d.d2} m`], tz: [`with parallel sides of ${d.a} m and ${d.b} m, ${d.h} m apart`, `dengan sisi selari ${d.a} m dan ${d.b} m, berjarak ${d.h} m`] }[kind]);
  const P102 = [
    (r, A) => [T('Find its area.', 'Cari luasnya.'), T(`${A} m²`)],
    (r, A) => { const p = r.pick([12, 15, 20, 25, 30]); return [T(`It is to be covered with turf costing RM${p} per m². Find the cost.`, `Ia akan ditutup dengan rumput hamparan berharga RM${p} per m². Cari kosnya.`), T(`RM${A * p}`)]; },
    (r, A) => { const c = r.pick([4, 5, 6, 8]); return [T(`One tin of paint covers ${c} m². How many tins are needed to paint it once?`, `Satu tin cat meliputi ${c} m². Berapakah bilangan tin yang diperlukan untuk mengecatnya sekali?`), T(`${Math.ceil(A / c)}`)]; },
    (r, A) => { const L = r.pick([2, 3, 4, 5, 6, 8, 10].filter((x) => A % x === 0 && A / x >= 2)); need(L); return [T(`A rectangle with the same area is ${L} m long. Find its width.`, `Sebuah segi empat tepat yang mempunyai luas yang sama panjangnya ${L} m. Cari lebarnya.`), T(`${A / L} m`)]; },
    (r, A) => [T('Every dimension is doubled. Find the new area.', 'Setiap ukuran digandakan. Cari luas yang baharu.'), T(`${4 * A} m²`)],
    (r, A) => [T('Two identical copies are placed side by side without overlapping. Find the total area.', 'Dua salinan yang serupa diletakkan bersebelahan tanpa bertindih. Cari jumlah luas.'), T(`${2 * A} m²`)],
    (r, A) => [T('Express the area in cm².', 'Nyatakan luas itu dalam cm².'), T(`${A * 10000} cm²`)],
    (r, A) => [T('It is tiled with square tiles of side 50 cm. How many tiles are needed?', 'Ia dijubinkan dengan jubin segi empat sama bersisi 50 cm. Berapakah bilangan jubin yang diperlukan?'), T(`${4 * A}`)],
    (r, A) => { need(A % 2 === 0); return [T('Exactly half of the area is planted with flowers. Find the planted area.', 'Tepat separuh daripada luas itu ditanam dengan bunga. Cari luas yang ditanam.'), T(`${A / 2} m²`)]; },
    (r, A) => { need(A % 4 === 0); return [T('Every dimension is halved. Find the new area.', 'Setiap ukuran dibahagi dua. Cari luas yang baharu.'), T(`${A / 4} m²`)]; },
  ];
  const m102 = [
    (r) => {
      const b = r.int(4, 14), h = r.int(3, 10), off = b + r.int(2, 6), sl = r.chance(), u = r.pick(UN)[0], left = r.chance();
      const d = { b, h, off: left ? -(off - b) : off, s: 0 };
      return { q: nta(r, T(sl ? 'Find the area of the obtuse-angled triangle. Use the perpendicular height, not a slant side.' : 'Find the area of the triangle. The dashed line is the perpendicular height.', sl ? 'Cari luas segi tiga bersudut cakah itu. Gunakan tinggi serenjang, bukan sisi condong.' : 'Cari luas segi tiga itu. Garis putus-putus ialah tinggi serenjang.')), fig: shp('tri', d, { unit: u }), a: T(`$${n(b * h / 2)}\\ \\text{${u}}^2$`), w: T(`$\\frac{1}{2} \\times ${b} \\times ${h}$`), sp: 's' };
    },
    (r) => {
      const t = r.int(0, 6), b = r.int(4, 16), h = r.int(3, 12), a = r.int(3, 10), c = a + r.int(2, 7), d1 = r.int(5, 16), d2 = r.int(4, 14), u = r.pick(UN)[0], v = `\\text{${u}}`;
      const f = [[`The area of a triangle is ${n(b * h / 2)} ${u}² and its base is ${b} ${u}. Find its perpendicular height.`, `Luas sebuah segi tiga ialah ${n(b * h / 2)} ${u}² dan tapaknya ${b} ${u}. Cari tinggi serenjangnya.`, `${h} ${u}`, (b * h) % 2 === 0], [`A triangle has an area of ${n(b * h / 2)} ${u}² and a height of ${h} ${u}. Find its base.`, `Sebuah segi tiga mempunyai luas ${n(b * h / 2)} ${u}² dan tinggi ${h} ${u}. Cari tapaknya.`, `${b} ${u}`, (b * h) % 2 === 0], [`The area of a parallelogram is ${b * h} ${u}² and its base is ${b} ${u}. Find its perpendicular height.`, `Luas sebuah segi empat selari ialah ${b * h} ${u}² dan tapaknya ${b} ${u}. Cari tinggi serenjangnya.`, `${h} ${u}`, true], [`A parallelogram has an area of ${b * h} ${u}² and a perpendicular height of ${h} ${u}. Find the length of its base.`, `Sebuah segi empat selari mempunyai luas ${b * h} ${u}² dan tinggi serenjang ${h} ${u}. Cari panjang tapaknya.`, `${b} ${u}`, true], [`A kite has an area of ${n(d1 * d2 / 2)} ${u}² and one diagonal of ${d1} ${u}. Find the other diagonal.`, `Sebuah layang-layang mempunyai luas ${n(d1 * d2 / 2)} ${u}² dan satu pepenjuru ${d1} ${u}. Cari pepenjuru yang satu lagi.`, `${d2} ${u}`, (d1 * d2) % 2 === 0], [`The area of a trapezium is ${n((a + c) * h / 2)} ${u}². Its parallel sides are ${a} ${u} and ${c} ${u}. Find its height.`, `Luas sebuah trapezium ialah ${n((a + c) * h / 2)} ${u}². Sisi selarinya ialah ${a} ${u} dan ${c} ${u}. Cari tingginya.`, `${h} ${u}`, ((a + c) * h) % 2 === 0], [`A trapezium has an area of ${n((a + c) * h / 2)} ${u}², a height of ${h} ${u} and a shorter parallel side of ${a} ${u}. Find the longer parallel side.`, `Sebuah trapezium mempunyai luas ${n((a + c) * h / 2)} ${u}², tinggi ${h} ${u} dan sisi selari yang lebih pendek ${a} ${u}. Cari sisi selari yang lebih panjang.`, `${c} ${u}`, ((a + c) * h) % 2 === 0]][t];
      need(f[3] && (t !== 4 || d1 !== d2));
      return { q: T(f[0], f[1]), a: T(f[2]), sp: 's' };
    },
    (r) => {
      const kind = r.pick(PICK4), u = r.pick(['cm', 'm']), d = { b: r.int(25, 95) / 10, h: r.int(21, 64) / 10, a: r.int(21, 60) / 10, d1: r.int(41, 120) / 10, d2: r.int(31, 90) / 10 };
      d.b = kind === 'tz' ? d.a + r.int(15, 40) / 10 : d.b;
      const ar = round(AREAF[kind](d), 3);
      const tx = { tri: [`base ${n(d.b)} ${u}, height ${n(d.h)} ${u}`, `tapak ${n(d.b)} ${u}, tinggi ${n(d.h)} ${u}`], pg: [`base ${n(d.b)} ${u}, height ${n(d.h)} ${u}`, `tapak ${n(d.b)} ${u}, tinggi ${n(d.h)} ${u}`], kt: [`diagonals ${n(d.d1)} ${u} and ${n(d.d2)} ${u}`, `pepenjuru ${n(d.d1)} ${u} dan ${n(d.d2)} ${u}`], tz: [`parallel sides ${n(d.a)} ${u} and ${n(d.b)} ${u}, height ${n(d.h)} ${u}`, `sisi selari ${n(d.a)} ${u} dan ${n(d.b)} ${u}, tinggi ${n(d.h)} ${u}`] }[kind];
      return { q: T(`Find the area of a ${SHN[kind].en} with ${tx[0]}.`, `Cari luas ${SHN[kind].ms} dengan ${tx[1]}.`), a: T(`$${n(ar)}\\ \\text{${u}}^2$`), sp: 's' };
    },
    (r) => {
      const t = r.int(0, 3), b = r.int(2, 9), hc = r.int(2, 8) * 10, bc = r.int(2, 9) * 10;
      const f = [[`A rectangular window is ${b} m wide and ${hc} cm high. Find its area in m².`, `Sebuah tingkap segi empat tepat lebarnya ${b} m dan tingginya ${hc} cm. Cari luasnya dalam m².`, `${n(b * hc / 100)} m²`], [`A triangular sail has a base of ${bc * 10} cm and a perpendicular height of ${hc / 10 + b} m. Find its area in m².`, `Layar berbentuk segi tiga mempunyai tapak ${bc * 10} cm dan tinggi serenjang ${hc / 10 + b} m. Cari luasnya dalam m².`, `${n(round(bc * 10 / 100 * (hc / 10 + b) / 2, 4))} m²`], [`A rectangle has an area of ${b * 10000} cm². Express the area in m².`, `Sebuah segi empat tepat mempunyai luas ${b * 10000} cm². Nyatakan luas itu dalam m².`, `${b} m²`], [`A parallelogram has a base of ${b} m and a height of ${hc} cm. Find its area in cm².`, `Sebuah segi empat selari mempunyai tapak ${b} m dan tinggi ${hc} cm. Cari luasnya dalam cm².`, `${b * 100 * hc} cm²`]][t];
      return { q: T(f[0], f[1]), a: T(f[2]), sp: 's' };
    },
    (r) => {
      const t = r.int(0, 2), b = r.int(11, 39), h = r.int(6, 19), est = Math.round(b / 10) * 10, eh = Math.round(h / 5) * 5;
      const f = [[`Estimate the area of a triangle with base ${b} cm and height ${h} cm by rounding the base to the nearest 10 cm and the height to the nearest 5 cm. Then find the exact area and the difference.`, `Anggarkan luas segi tiga dengan tapak ${b} cm dan tinggi ${h} cm dengan membundarkan tapak kepada 10 cm terdekat dan tinggi kepada 5 cm terdekat. Kemudian cari luas tepat dan bezanya.`, `Estimate ${n(est * eh / 2)} cm²; exact ${n(b * h / 2)} cm²; difference ${n(Math.abs(est * eh / 2 - b * h / 2))} cm²`, `Anggaran ${n(est * eh / 2)} cm²; tepat ${n(b * h / 2)} cm²; beza ${n(Math.abs(est * eh / 2 - b * h / 2))} cm²`], [`Aina estimates the area of a parallelogram with base ${b} cm and height ${h} cm as ${Math.round(b * h * 1.1)} cm². Find the exact area and say whether her estimate is within 10% of it.`, `Aina menganggar luas segi empat selari dengan tapak ${b} cm dan tinggi ${h} cm sebagai ${Math.round(b * h * 1.1)} cm². Cari luas tepat dan nyatakan sama ada anggarannya berada dalam lingkungan 10% daripadanya.`, `Exact ${b * h} cm²; the difference is ${Math.abs(Math.round(b * h * 1.1) - b * h)} cm², ${Math.abs(Math.round(b * h * 1.1) - b * h) <= 0.1 * b * h ? 'within' : 'not within'} 10% (${n(0.1 * b * h)} cm²)`, `Tepat ${b * h} cm²; bezanya ${Math.abs(Math.round(b * h * 1.1) - b * h)} cm², ${Math.abs(Math.round(b * h * 1.1) - b * h) <= 0.1 * b * h ? 'dalam' : 'tidak dalam'} lingkungan 10% (${n(0.1 * b * h)} cm²)`], [`A kite has diagonals of ${b} cm and ${h} cm. Which is the better estimate of its area: ${Math.round(b * h * 0.5 / 10) * 10} cm² or ${Math.round(b * h * 0.5 / 10) * 10 + 60} cm²?`, `Sebuah layang-layang mempunyai pepenjuru ${b} cm dan ${h} cm. Yang manakah anggaran luas yang lebih baik: ${Math.round(b * h * 0.5 / 10) * 10} cm² atau ${Math.round(b * h * 0.5 / 10) * 10 + 60} cm²?`, `Exact ${n(b * h / 2)} cm²; ${Math.abs(Math.round(b * h * 0.5 / 10) * 10 - b * h / 2) < Math.abs(Math.round(b * h * 0.5 / 10) * 10 + 60 - b * h / 2) ? Math.round(b * h * 0.5 / 10) * 10 : Math.round(b * h * 0.5 / 10) * 10 + 60} cm² is closer`, `Tepat ${n(b * h / 2)} cm²; ${Math.abs(Math.round(b * h * 0.5 / 10) * 10 - b * h / 2) < Math.abs(Math.round(b * h * 0.5 / 10) * 10 + 60 - b * h / 2) ? Math.round(b * h * 0.5 / 10) * 10 : Math.round(b * h * 0.5 / 10) * 10 + 60} cm² lebih hampir`]][t];
      need(t !== 0 || est * eh / 2 !== b * h / 2);
      need(t !== 2 || Math.abs(Math.round(b * h * 0.5 / 10) * 10 - b * h / 2) !== Math.abs(Math.round(b * h * 0.5 / 10) * 10 + 60 - b * h / 2));
      return { q: T(f[0], f[1]), a: T(f[2], f[3]), sp: 's' };
    },
    (r, cx) => {
      const lv = cx && cx.d, kind = r.pick(PICK4), d = dims(r, kind), A = AREAF[kind](d), c = CTX102[kind][0], nn = lv === 'e' ? 2 : lv === 'a' ? r.pick([4, 5]) : r.pick([2, 3]);
      need(Number.isInteger(A));
      const ids = r.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], nn).sort((x, y) => x - y), ps = ids.map((i) => P102[i](r, A)), st = dstm(kind, d);
      return { q: T(`Consider ${c[0]} ${st[0]}.` + SPM.parts(ps.map((p) => p[0])).en, `Perhatikan ${c[1]} ${st[1]}.` + SPM.parts(ps.map((p) => p[0])).ms), a: SPM.parts(ps.map((p) => p[1])), sp: 'm' };
    },
    (r) => {
      const k = r.pick([[12, 5, 13, 9, 15], [12, 5, 13, 16, 20], [12, 9, 15, 16, 20], [8, 6, 10, 15, 17], [15, 8, 17, 20, 25], [15, 8, 17, 36, 39]]), d1 = k[1] + k[3], d2 = 2 * k[0], ar = (d1 * d2) / 2;
      return { q: nta(r, T('The figure shows a kite with its diagonals (dashed) and its sides. Find the area of the kite.', 'Rajah menunjukkan sebuah layang-layang dengan pepenjurunya (putus-putus) dan sisi-sisinya. Cari luas layang-layang itu.')), fig: shp('kt', { d1, d2, up: k[1], s1: k[2], s2: k[4] }, { slant: true }), a: T(`$${n(ar)}\\ \\text{cm}^2$`), w: T(`The area uses the diagonals: $\\frac{1}{2} \\times ${d1} \\times ${d2}$, not the sides ${k[2]} cm and ${k[4]} cm.`, `Luas menggunakan pepenjuru: $\\frac{1}{2} \\times ${d1} \\times ${d2}$, bukan sisi ${k[2]} cm dan ${k[4]} cm.`), sp: 's' };
    },
    (r) => {
      const t = r.int(0, 2), x = r.int(3, 12), v = r.pick(VARS), h = r.int(2, 8), c = r.int(2, 6), a1 = r.int(1, 3);
      const f = [[`A trapezium has parallel sides of ${mx(v)} cm and $(${lin(1, c, v)})$ cm and a height of ${h * 2} cm. Its area is ${(2 * x + c) * h} cm². Find ${mx(v)}.`, `Sebuah trapezium mempunyai sisi selari ${mx(v)} cm dan $(${lin(1, c, v)})$ cm dan tinggi ${h * 2} cm. Luasnya ${(2 * x + c) * h} cm². Cari ${mx(v)}.`], [`A triangle has a base of $(${lin(a1, 0, v)})$ cm and a height of ${h * 2} cm. Its area is ${a1 * x * h} cm². Find ${mx(v)}.`, `Sebuah segi tiga mempunyai tapak $(${lin(a1, 0, v)})$ cm dan tinggi ${h * 2} cm. Luasnya ${a1 * x * h} cm². Cari ${mx(v)}.`], [`A parallelogram has a base of $(${lin(1, c, v)})$ cm and a height of ${h} cm. Its area is ${(x + c) * h} cm². Find ${mx(v)}.`, `Sebuah segi empat selari mempunyai tapak $(${lin(1, c, v)})$ cm dan tinggi ${h} cm. Luasnya ${(x + c) * h} cm². Cari ${mx(v)}.`]][t];
      return { q: T(f[0], f[1]), a: T(`$${v} = ${x}$`), sp: 's' };
    },
  ];
  SPM.extend('F1-10.2', { m: m102 });
  const a102 = [
    (r) => {
      const kind = r.pick(PICK4), dm = dims(r, kind), A = AREAF[kind](dm), p = r.pick([8, 12, 15, 20, 25]), t = r.int(0, 1);
      need(Number.isInteger(A));
      const cmk = { tri: 100, pg: 100, kt: 100, tz: 100 }[kind], dc = kind === 'kt' ? { d1: dm.d1 * 10, d2: dm.d2 * 10 } : { b: dm.b * 10, h: dm.h * 10, a: (dm.a || 0) * 10 }, Ac = AREAF[kind](dc), Am = Ac / 10000;
      const tx = { tri: [`base ${dc.b} cm and perpendicular height ${dc.h} cm`, `tapak ${dc.b} cm dan tinggi serenjang ${dc.h} cm`], pg: [`base ${dc.b} cm and perpendicular height ${dc.h} cm`, `tapak ${dc.b} cm dan tinggi serenjang ${dc.h} cm`], kt: [`diagonals ${dc.d1} cm and ${dc.d2} cm`, `pepenjuru ${dc.d1} cm dan ${dc.d2} cm`], tz: [`parallel sides ${dc.a} cm and ${dc.b} cm, ${dc.h} cm apart`, `sisi selari ${dc.a} cm dan ${dc.b} cm, berjarak ${dc.h} cm`] }[kind];
      return { q: T(`A ${SHN[kind].en}-shaped glass panel has ${tx[0]}. Find its area in m². Glass costs RM${p} per m²${t ? ', and 6 panels are needed. Find the total cost' : '. Find the cost of one panel'}.`, `Sekeping panel kaca berbentuk ${SHN[kind].ms} mempunyai ${tx[1]}. Cari luasnya dalam m². Kaca berharga RM${p} per m²${t ? ', dan 6 panel diperlukan. Cari jumlah kos' : '. Cari kos satu panel'}.`), a: T(`${n(round(Am, 4))} m²; RM${n(round(Am * p * (t ? 6 : 1), 2))}`), w: T(`$1\\ \\text{m}^2 = 10\\,000\\ \\text{cm}^2$`), sp: 'm' };
    },
    (r) => {
      const t = r.int(0, 1), tr = r.pick([[6, 8, 10], [9, 12, 15], [3, 4, 5], [12, 16, 20], [5, 12, 13]]), [a, b, c] = tr, ar = (a * b) / 2, h = (2 * ar) / c;
      const bb = r.int(8, 16), hh = r.int(3, 9), sl = r.pick([4, 5, 6, 8, 9, 10]);
      need(t === 0 ? Number.isInteger(h * 10) : (bb * hh) % sl === 0);
      return { q: t === 0 ? T(`In a right-angled triangle the two shorter sides are ${a} cm and ${b} cm and the longest side is ${c} cm. Find the area of the triangle and the perpendicular distance from the right-angled corner to the longest side.`, `Dalam sebuah segi tiga bersudut tegak, dua sisi yang lebih pendek ialah ${a} cm dan ${b} cm dan sisi terpanjang ialah ${c} cm. Cari luas segi tiga itu dan jarak serenjang dari sudut tegak ke sisi yang terpanjang.`) : T(`A parallelogram has a base of ${bb} cm and a perpendicular height of ${hh} cm. Its other side is ${sl} cm long. Find the perpendicular distance between the two sides of length ${sl} cm.`, `Sebuah segi empat selari mempunyai tapak ${bb} cm dan tinggi serenjang ${hh} cm. Sisinya yang satu lagi panjangnya ${sl} cm. Cari jarak serenjang antara dua sisi yang panjangnya ${sl} cm.`), a: t === 0 ? T(`Area ${n(ar)} cm²; distance ${n(round(h, 2))} cm`, `Luas ${n(ar)} cm²; jarak ${n(round(h, 2))} cm`) : T(`${(bb * hh) / sl} cm`), w: t === 0 ? T(`$\\frac{1}{2} \\times ${a} \\times ${b} = \\frac{1}{2} \\times ${c} \\times h$`) : T(`$${bb} \\times ${hh} = ${sl} \\times h$`), sp: 'm' };
    },
    (r) => {
      const t = r.int(0, 2), l = r.int(3, 9) * 2, w = r.int(2, 8) * 2, k = r.int(2, 6), A = 6 * k * k;
      const f = [[`A kite is made by joining the midpoints of the four sides of a rectangle ${l} cm long and ${w} cm wide. Find the area of the kite and of the four corner triangles that are left over.`, `Sebuah layang-layang dibentuk dengan menyambungkan titik tengah empat sisi sebuah segi empat tepat sepanjang ${l} cm dan selebar ${w} cm. Cari luas layang-layang itu dan luas empat segi tiga di penjuru yang tinggal.`, `Kite ${(l * w) / 2} cm²; corners ${(l * w) / 2} cm² (diagonals of the kite are ${l} cm and ${w} cm)`, `Layang-layang ${(l * w) / 2} cm²; penjuru ${(l * w) / 2} cm² (pepenjuru layang-layang ${l} cm dan ${w} cm)`], [`The diagonals of a kite are in the ratio $3 : 4$ and its area is ${A * 1} cm². Find the length of each diagonal.`, `Pepenjuru sebuah layang-layang berada dalam nisbah $3 : 4$ dan luasnya ${A} cm². Cari panjang setiap pepenjuru.`, `${3 * k} cm and ${4 * k} cm`, `${3 * k} cm dan ${4 * k} cm`], [`A square has the same area as a kite with diagonals of ${l * 2} cm and ${l} cm. Find the side of the square.`, `Sebuah segi empat sama mempunyai luas yang sama dengan sebuah layang-layang berpepenjuru ${l * 2} cm dan ${l} cm. Cari sisi segi empat sama itu.`, `${l} cm`, `${l} cm`]][t];
      return { q: T(f[0], f[1]), a: T(f[2], f[3]), w: t === 1 ? T(`$\\frac{1}{2} \\times 3k \\times 4k = ${A}$, so $k^2 = ${k * k}$`) : undefined, sp: 'm' };
    },
    (r) => {
      const t = r.int(0, 1), b = r.int(2, 8) * 10, hm = r.int(2, 6) + r.pick([0, 0.5]), hh = r.int(10, 40) * 5, p = r.pick([10, 12, 15, 20]);
      return { q: t ? T(`A triangular sail has a base of ${b * 3} cm and a perpendicular height of ${n(hm)} m. Find its area in m². The sailmaker charges RM${p} per m². Find the price.`, `Layar berbentuk segi tiga mempunyai tapak ${b * 3} cm dan tinggi serenjang ${n(hm)} m. Cari luasnya dalam m². Pembuat layar mengenakan bayaran RM${p} per m². Cari harganya.`) : T(`A parallelogram-shaped banner has a base of ${n(hm)} m and a perpendicular height of ${hh} cm. Find its area in m². Printing costs RM${p} per m². Find the cost.`, `Sepanduk berbentuk segi empat selari mempunyai tapak ${n(hm)} m dan tinggi serenjang ${hh} cm. Cari luasnya dalam m². Kos mencetak ialah RM${p} per m². Cari kosnya.`), a: t ? T(`${n(round((b * 3 / 100) * hm / 2, 4))} m²; RM${n(round((b * 3 / 100) * hm / 2 * p, 2))}`) : T(`${n(round(hm * hh / 100, 4))} m²; RM${n(round(hm * hh / 100 * p, 2))}`), sp: 'm' };
    },
  ];
  SPM.extend('F1-10.2', { e: [m102.find((f) => f.length === 2)], a: a102.concat([m102.find((f) => f.length === 2)]) });
  /* ================= F1-10.3 Relationship between perimeter and area ================= */
  const rectPair = (a, b, u) => { const k = Math.min(110 / Math.max(a[0], b[0]), 80 / Math.max(a[1], b[1])); let o = ''; [[a, 20, 'A'], [b, 160, 'B']].forEach(([d, x0, nm]) => { const w = d[0] * k, h = d[1] * k, y0 = 100 - h; o += S.rect(x0, y0, w, h) + S.text(x0 + w / 2, y0 - 8, `${d[0]} ${u}`, { s: 12 }) + S.text(x0 + w + 6, y0 + h / 2, `${d[1]} ${u}`, { s: 12, a: 'start' }) + S.text(x0 + w / 2, y0 + h + 14, nm, { i: true, s: 13 }); }); return S.wrap(300, 130, o, 'two rectangles'); };
  const rcs = (r, lo, hi) => { const l = r.int(lo, hi), w = r.int(lo, l); return [l, w]; };
  const PA = (d) => [2 * (d[0] + d[1]), d[0] * d[1]];
  const CTX103 = [['a rectangular notice card', 'kad notis berbentuk segi empat tepat'], ['a rectangular photo frame', 'bingkai gambar berbentuk segi empat tepat'], ['a rectangular book cover', 'kulit buku berbentuk segi empat tepat'], ['a rectangular poster', 'poster berbentuk segi empat tepat'], ['a rectangular greeting card', 'kad ucapan berbentuk segi empat tepat']];
  const P103 = [
    (r, l, w) => { const [P, A] = PA([l, w]); return [T('Find its perimeter and area.', 'Cari perimeter dan luasnya.'), T(`Perimeter ${P} cm, area ${A} cm²`, `Perimeter ${P} cm, luas ${A} cm²`)]; },
    (r, l, w) => { need((l + w) % 2 === 0); const s = (l + w) / 2; return [T('A square has the same perimeter. Find the side and the area of the square.', 'Sebuah segi empat sama mempunyai perimeter yang sama. Cari sisi dan luas segi empat sama itu.'), T(`Side ${s} cm, area ${s * s} cm²`, `Sisi ${s} cm, luas ${s * s} cm²`)]; },
    (r, l, w) => { need((l + w) % 2 === 0 && l !== w); const s = (l + w) / 2; return [T('A square has the same perimeter. Which has the larger area, and by how much?', 'Sebuah segi empat sama mempunyai perimeter yang sama. Yang manakah mempunyai luas lebih besar, dan berapakah bezanya?'), T(`The square, by ${s * s - l * w} cm²`, `Segi empat sama, sebanyak ${s * s - l * w} cm²`)]; },
    (r, l, w) => { const A = l * w, ks = [2, 3, 4, 5, 6, 8, 9, 10, 12].filter((k) => A % k === 0 && k !== l && k !== w && A / k >= 1); need(ks.length); const k = r.pick(ks), P2 = 2 * (k + A / k); return [T(`Another rectangle has the same area and a length of ${k} cm. Find its perimeter.`, `Sebuah segi empat tepat lain mempunyai luas yang sama dan panjang ${k} cm. Cari perimeternya.`), T(`${P2} cm`)]; },
    (r, l, w) => [T('The length is doubled and the width is unchanged. Find the new perimeter and area.', 'Panjang digandakan dan lebar tidak berubah. Cari perimeter dan luas yang baharu.'), T(`Perimeter ${2 * (2 * l + w)} cm, area ${2 * l * w} cm²`, `Perimeter ${2 * (2 * l + w)} cm, luas ${2 * l * w} cm²`)],
    (r, l, w) => [T('Both the length and the width are doubled. By what factor do the perimeter and the area change?', 'Panjang dan lebar kedua-duanya digandakan. Berapa kalikah perimeter dan luas berubah?'), T('Perimeter ×2, area ×4', 'Perimeter ×2, luas ×4')],
    (r, l, w) => [T('The rectangle is cut along a diagonal into two triangles. Find the area of each triangle.', 'Segi empat tepat itu dipotong sepanjang satu pepenjuru menjadi dua segi tiga. Cari luas setiap segi tiga.'), T(`${n(l * w / 2)} cm²`)],
    (r, l, w) => { const g = gcd(l, w); return [T('Write the ratio of the length to the width in its simplest form.', 'Tulis nisbah panjang kepada lebar dalam bentuk termudah.'), T(`$${l / g} : ${w / g}$`)]; },
    (r, l, w) => [T('A border 1 cm wide is added all round the outside. Find the new perimeter and area.', 'Sempadan selebar 1 cm ditambah di sekeliling bahagian luar. Cari perimeter dan luas yang baharu.'), T(`Perimeter ${2 * (l + w) + 8} cm, area ${(l + 2) * (w + 2)} cm²`, `Perimeter ${2 * (l + w) + 8} cm, luas ${(l + 2) * (w + 2)} cm²`)],
    (r, l, w) => { need(w > 3); return [T('The length is increased by 2 cm and the width is decreased by 2 cm. Find the new perimeter and area.', 'Panjang ditambah 2 cm dan lebar dikurangkan 2 cm. Cari perimeter dan luas yang baharu.'), T(`Perimeter ${2 * (l + w)} cm, area ${(l + 2) * (w - 2)} cm²`, `Perimeter ${2 * (l + w)} cm, luas ${(l + 2) * (w - 2)} cm²`)]; },
  ];
  const TF103 = [
    ['Two rectangles with the same perimeter always have the same area.', 'Dua segi empat tepat yang mempunyai perimeter yang sama sentiasa mempunyai luas yang sama.', 0, 'A 9 cm by 1 cm and a 5 cm by 5 cm rectangle both have perimeter 20 cm but areas 9 cm² and 25 cm².', 'Segi empat tepat 9 cm kali 1 cm dan 5 cm kali 5 cm kedua-duanya berperimeter 20 cm tetapi luasnya 9 cm² dan 25 cm².'],
    ['Two rectangles with the same area always have the same perimeter.', 'Dua segi empat tepat yang mempunyai luas yang sama sentiasa mempunyai perimeter yang sama.', 0, 'A 12 cm by 2 cm and a 6 cm by 4 cm rectangle both have area 24 cm² but perimeters 28 cm and 20 cm.', 'Segi empat tepat 12 cm kali 2 cm dan 6 cm kali 4 cm kedua-duanya berluas 24 cm² tetapi berperimeter 28 cm dan 20 cm.'],
    ['If the length and width of a rectangle are both doubled, the perimeter is doubled.', 'Jika panjang dan lebar sebuah segi empat tepat kedua-duanya digandakan, perimeternya menjadi dua kali ganda.', 1],
    ['If the length and width of a rectangle are both doubled, the area is doubled.', 'Jika panjang dan lebar sebuah segi empat tepat kedua-duanya digandakan, luasnya menjadi dua kali ganda.', 0, 'The area becomes four times as large.', 'Luasnya menjadi empat kali ganda.'],
    ['A larger perimeter always means a larger area.', 'Perimeter yang lebih besar sentiasa bermaksud luas yang lebih besar.', 0, 'A 20 cm by 1 cm rectangle has perimeter 42 cm but area 20 cm²; a 6 cm by 6 cm square has perimeter 24 cm but area 36 cm².', 'Segi empat tepat 20 cm kali 1 cm berperimeter 42 cm tetapi berluas 20 cm²; segi empat sama 6 cm kali 6 cm berperimeter 24 cm tetapi berluas 36 cm².'],
    ['Checking a few examples can show that a claim is false.', 'Menyemak beberapa contoh boleh menunjukkan bahawa sesuatu dakwaan adalah palsu.', 1],
    ['Checking a few examples proves that a claim is true for every rectangle.', 'Menyemak beberapa contoh membuktikan bahawa sesuatu dakwaan adalah benar bagi setiap segi empat tepat.', 0, 'Examples give evidence only; a proof must cover all cases.', 'Contoh hanya memberi bukti; pembuktian mesti meliputi semua kes.'],
    ['Cutting a rectangular corner off a rectangle reduces its area but not its perimeter.', 'Memotong satu sudut segi empat tepat mengurangkan luasnya tetapi tidak mengubah perimeternya.', 1],
  ];
  const e103 = [
    (r) => { const a = rcs(r, 3, 12), b = rcs(r, 2, 12), [P1, A1] = PA(a), [P2, A2] = PA(b), u = 'cm'; need(P1 !== P2 && A1 !== A2); return { q: nts(Q(r.pick([['The two rectangles are shown. Which has the larger perimeter and which has the larger area?', 'Dua segi empat tepat ditunjukkan. Yang manakah mempunyai perimeter lebih besar dan yang manakah mempunyai luas lebih besar?'], ['Compare rectangles $A$ and $B$. Find the perimeter and the area of each.', 'Bandingkan segi empat tepat $A$ dan $B$. Cari perimeter dan luas bagi setiap satu.']]), {})), fig: rectPair(a, b, u), a: T(`A: ${P1} cm, ${A1} cm²; B: ${P2} cm, ${A2} cm². Larger perimeter: ${P1 > P2 ? 'A' : 'B'}; larger area: ${A1 > A2 ? 'A' : 'B'}.`, `A: ${P1} cm, ${A1} cm²; B: ${P2} cm, ${A2} cm². Perimeter lebih besar: ${P1 > P2 ? 'A' : 'B'}; luas lebih besar: ${A1 > A2 ? 'A' : 'B'}.`), sp: 'm' }; },
    (r) => { const t = r.pick(TF103); return { q: T('True or false? ' + t[0], 'Benar atau palsu? ' + t[1]), a: TF(t[2], t[3], t[4]), sp: 's' }; },
    (r) => { const s = r.int(3, 12), l = r.int(s + 1, 15), w = r.int(2, l - 1); return { q: T(`A square of side ${s} cm and a rectangle ${l} cm by ${w} cm are compared. Find the perimeter and the area of each.`, `Sebuah segi empat sama bersisi ${s} cm dan sebuah segi empat tepat ${l} cm kali ${w} cm dibandingkan. Cari perimeter dan luas bagi setiap satu.`), a: T(`Square: ${4 * s} cm, ${s * s} cm²; rectangle: ${2 * (l + w)} cm, ${l * w} cm²`, `Segi empat sama: ${4 * s} cm, ${s * s} cm²; segi empat tepat: ${2 * (l + w)} cm, ${l * w} cm²`), sp: 's' }; },
    (r) => { const P = r.pick([12, 16, 20, 24]), l = r.int(P / 4 + 1, P / 2 - 1), w = P / 2 - l; return { q: T(`A rectangle has a perimeter of ${P} cm and a length of ${l} cm. Find its width and its area.`, `Sebuah segi empat tepat mempunyai perimeter ${P} cm dan panjang ${l} cm. Cari lebar dan luasnya.`), a: T(`Width ${w} cm, area ${l * w} cm²`, `Lebar ${w} cm, luas ${l * w} cm²`), sp: 's' }; },
    (r) => { const p = r.pick([['The perimeter of a rectangle is the distance around it; its area is the space inside it.', 'Perimeter sebuah segi empat tepat ialah jarak mengelilinginya; luasnya ialah ruang di dalamnya.', 1], ['Perimeter and area of a shape are measured in the same units.', 'Perimeter dan luas sesuatu bentuk diukur dalam unit yang sama.', 0, 'Perimeter is in cm, area is in cm².', 'Perimeter dalam cm, luas dalam cm².']]); return { q: T('True or false? ' + p[0], 'Benar atau palsu? ' + p[1]), a: TF(p[2], p[3], p[4]), sp: 'xs' }; },
    (r) => { const [l, w] = rcs(r, 4, 14), k = r.pick([2, 3]); need(l !== w); return { q: T(`A ${l} cm by ${w} cm rectangle is enlarged so that every side is ${k} times as long. Find the perimeter and the area of the original and of the enlarged rectangle.`, `Sebuah segi empat tepat ${l} cm kali ${w} cm dibesarkan supaya setiap sisi ${k} kali lebih panjang. Cari perimeter dan luas segi empat tepat asal dan yang dibesarkan.`), a: T(`Original ${2 * (l + w)} cm, ${l * w} cm²; enlarged ${2 * k * (l + w)} cm, ${k * k * l * w} cm²`, `Asal ${2 * (l + w)} cm, ${l * w} cm²; dibesarkan ${2 * k * (l + w)} cm, ${k * k * l * w} cm²`), sp: 's' }; },
  ];
  const m103 = [
    (r) => {
      const P = r.pick([16, 20, 24, 28]), h = P / 2, rows = []; for (let l = h - 1; l >= Math.ceil(h / 2); l--) rows.push([l, h - l, l * (h - l)]);
      const hc = r.chance(), tb = (lg, f) => SPM.table([[lg ? 'Panjang (cm)' : 'Length (cm)', ...rows.map((x) => x[0])], [lg ? 'Lebar (cm)' : 'Width (cm)', ...rows.map((x) => x[1])], [lg ? 'Luas (cm²)' : 'Area (cm²)', ...rows.map((x) => (f ? x[2] : '?'))]], { rowHead: true });
      const best = rows.reduce((b, x) => (x[2] > b[2] ? x : b), rows[0]), wst = rows.reduce((b, x) => (x[2] < b[2] ? x : b), rows[0]);
      return { q: T(`Rectangles with whole-number sides have a perimeter of ${P} cm. Complete the table of areas and state which rectangle in the table has the ${hc ? 'greatest' : 'smallest'} area.<br>${tb(0)}`, `Segi empat tepat yang sisinya nombor bulat mempunyai perimeter ${P} cm. Lengkapkan jadual luas dan nyatakan segi empat tepat dalam jadual yang mempunyai luas ${hc ? 'terbesar' : 'terkecil'}.<br>${tb(1)}`), a: T(`Areas: ${rows.map((x) => x[2]).join(', ')} cm²; ${hc ? 'greatest' : 'smallest'}: ${(hc ? best : wst)[0]} cm by ${(hc ? best : wst)[1]} cm`, `Luas: ${rows.map((x) => x[2]).join(', ')} cm²; ${hc ? 'terbesar' : 'terkecil'}: ${(hc ? best : wst)[0]} cm kali ${(hc ? best : wst)[1]} cm`), sp: 'm' };
    },
    (r) => {
      const A = r.pick([12, 16, 18, 20, 24, 30, 36, 48]), pr = []; for (let l = 1; l * l <= A; l++) if (A % l === 0) pr.push([A / l, l]);
      const per = pr.map((p) => 2 * (p[0] + p[1])), ix = per.indexOf(Math.min(...per)), hi = r.chance();
      return { q: T(`Rectangles with whole-number sides have an area of ${A} cm². List all such rectangles (length ≥ width) with their perimeters. Which has the ${hi ? 'largest' : 'smallest'} perimeter?`, `Segi empat tepat yang sisinya nombor bulat mempunyai luas ${A} cm². Senaraikan semua segi empat tepat itu (panjang ≥ lebar) dengan perimeternya. Yang manakah mempunyai perimeter ${hi ? 'terbesar' : 'terkecil'}?`), a: T(pr.map((p, i) => `${p[0]} × ${p[1]}: ${per[i]} cm`).join('; ') + `; ${hi ? 'largest' : 'smallest'}: ${pr[hi ? per.indexOf(Math.max(...per)) : ix].join(' × ')}`, pr.map((p, i) => `${p[0]} × ${p[1]}: ${per[i]} cm`).join('; ') + `; ${hi ? 'terbesar' : 'terkecil'}: ${pr[hi ? per.indexOf(Math.max(...per)) : ix].join(' × ')}`), sp: 'm' };
    },
    (r) => {
      const P = r.pick([12, 16, 20, 24, 30, 36]), h = P / 2, cnt = Math.floor(h / 2);
      return { q: T(`How many different rectangles with whole-number sides (counting a $l \\times w$ rectangle and a $w \\times l$ rectangle as the same) have a perimeter of ${P} cm? Which of them has the greatest area?`, `Berapakah bilangan segi empat tepat berbeza yang sisinya nombor bulat (segi empat tepat $l \\times w$ dan $w \\times l$ dikira sebagai sama) yang berperimeter ${P} cm? Yang manakah mempunyai luas terbesar?`), a: T(`${cnt} rectangles; greatest area ${Math.floor(h / 2) * Math.ceil(h / 2)} cm² (${Math.ceil(h / 2)} cm by ${Math.floor(h / 2)} cm)`, `${cnt} segi empat tepat; luas terbesar ${Math.floor(h / 2) * Math.ceil(h / 2)} cm² (${Math.ceil(h / 2)} cm kali ${Math.floor(h / 2)} cm)`), sp: 'm' };
    },
    (r, cx) => {
      const lv = cx && cx.d, [l, w] = rcs(r, 4, 14), c = r.pick(CTX103), nn = lv === 'e' ? 2 : lv === 'a' ? r.pick([3, 4]) : r.pick([2, 3]), ids = r.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], nn).sort((x, y) => x - y), ps = ids.map((i) => P103[i](r, l, w));
      return { q: T(`${SPM.cap(c[0])} is ${l} cm long and ${w} cm wide.` + SPM.parts(ps.map((p) => p[0])).en, `${SPM.cap(c[1])} panjangnya ${l} cm dan lebarnya ${w} cm.` + SPM.parts(ps.map((p) => p[0])).ms), a: SPM.parts(ps.map((p) => p[1])), sp: 'm' };
    },
    (r) => {
      const a = r.int(3, 9), b = r.int(2, a - 1), t = r.int(0, 1);
      const P1 = 2 * (2 * a + b), P2 = 2 * (a + 2 * b);
      return { q: t ? T(`Two identical rectangles ${a} cm by ${b} cm are joined along a side of length ${a} cm to make a bigger rectangle. Find the perimeter of the new rectangle. Compare it with the total perimeter of the two separate rectangles.`, `Dua segi empat tepat yang serupa ${a} cm kali ${b} cm dicantumkan sepanjang sisi ${a} cm untuk membentuk sebuah segi empat tepat yang lebih besar. Cari perimeter segi empat tepat baharu itu. Bandingkan dengan jumlah perimeter dua segi empat tepat yang berasingan.`) : T(`Two identical rectangles ${a} cm by ${b} cm can be joined in two ways: along a side of ${a} cm or along a side of ${b} cm. Find the perimeter of each new rectangle. Do they have the same area?`, `Dua segi empat tepat yang serupa ${a} cm kali ${b} cm boleh dicantumkan dengan dua cara: sepanjang sisi ${a} cm atau sepanjang sisi ${b} cm. Cari perimeter setiap segi empat tepat baharu. Adakah luasnya sama?`), a: t ? T(`New perimeter ${2 * (a + 2 * b)} cm; separate rectangles ${4 * (a + b)} cm`, `Perimeter baharu ${2 * (a + 2 * b)} cm; dua segi empat tepat berasingan ${4 * (a + b)} cm`) : T(`${P1} cm and ${P2} cm; both have area ${2 * a * b} cm²`, `${P1} cm dan ${P2} cm; kedua-duanya berluas ${2 * a * b} cm²`), sp: 'm' };
    },
    (r) => {
      const P = r.pick([12, 16, 20, 24]), h = P / 2, tried = r.sample([1, 2, 3, 4, 5, 6].filter((x) => x < h), 3).sort((x, y) => x - y), m = r.int(0, 1);
      need(tried.length === 3);
      const areas = tried.map((l) => l * (h - l));
      const opts = [{ t: T('This is evidence for rectangles with whole-number sides and this perimeter, but it is not a proof for all rectangles.', 'Ini ialah bukti bagi segi empat tepat dengan sisi nombor bulat dan perimeter ini, tetapi bukan pembuktian bagi semua segi empat tepat.'), ok: true }, { t: T('This proves that the square has the greatest area of all rectangles with that perimeter.', 'Ini membuktikan bahawa segi empat sama mempunyai luas terbesar antara semua segi empat tepat dengan perimeter itu.'), ok: false }, { t: T('This proves that all rectangles with the same perimeter have the same area.', 'Ini membuktikan bahawa semua segi empat tepat dengan perimeter yang sama mempunyai luas yang sama.'), ok: false }, { t: T('This shows that the area does not depend on the shape.', 'Ini menunjukkan bahawa luas tidak bergantung pada bentuk.'), ok: false }];
      const mm = mc(r, opts);
      return { q: T(`Rectangles with whole-number sides and a perimeter of ${P} cm are tested: sides ${tried.map((l) => `${l} × ${h - l}`).join(', ')} give areas ${areas.join(', ')} cm². Aina says: "The bigger the difference between length and width, the smaller the area." Which statement is correct? ${mm.en}`, `Segi empat tepat dengan sisi nombor bulat dan perimeter ${P} cm diuji: sisi ${tried.map((l) => `${l} × ${h - l}`).join(', ')} memberi luas ${areas.join(', ')} cm². Aina berkata: "Semakin besar beza antara panjang dengan lebar, semakin kecil luasnya." Pernyataan manakah yang betul? ${mm.ms}`), a: mm.ans, sp: 's' };
    },
  ];
  const CLM = [
    ['All rectangles with the same area have the same perimeter.', 'Semua segi empat tepat yang mempunyai luas yang sama mempunyai perimeter yang sama.', 1, 'A 12 by 2 and a 6 by 4 rectangle (area 24 cm²) have perimeters 28 cm and 20 cm.', 'Segi empat tepat 12 kali 2 dan 6 kali 4 (luas 24 cm²) berperimeter 28 cm dan 20 cm.'],
    ['A square has a larger area than every rectangle that has the same perimeter.', 'Segi empat sama mempunyai luas lebih besar daripada setiap segi empat tepat yang berperimeter sama.', 0],
    ['Doubling the length of a rectangle always doubles its perimeter.', 'Menggandakan panjang sebuah segi empat tepat sentiasa menggandakan perimeternya.', 1, 'A 6 by 4 rectangle has perimeter 20 cm; a 12 by 4 rectangle has perimeter 32 cm, not 40 cm.', 'Segi empat tepat 6 kali 4 berperimeter 20 cm; 12 kali 4 berperimeter 32 cm, bukan 40 cm.'],
    ['Doubling the length of a rectangle always doubles its area.', 'Menggandakan panjang sebuah segi empat tepat sentiasa menggandakan luasnya.', 0],
    ['If a rectangle gets longer and wider, its perimeter gets larger.', 'Jika sebuah segi empat tepat menjadi lebih panjang dan lebih lebar, perimeternya bertambah besar.', 0],
    ['Two rectangles with the same perimeter and the same length have the same area.', 'Dua segi empat tepat yang berperimeter sama dan panjang sama mempunyai luas yang sama.', 0],
  ];
  const a103 = [
    (r) => {
      const P = r.pick([16, 18, 20, 22, 24, 26, 30]), h = P / 2, rows = []; for (let l = Math.ceil(h / 2); l < h; l++) rows.push([l, h - l, l * (h - l)]);
      const best = rows.reduce((b, x) => (x[2] > b[2] ? x : b), rows[0]), t = r.int(0, 2), sq = P % 4 === 0;
      return { q: T(t === 0 ? `Among all rectangles with whole-number sides and a perimeter of ${P} cm, find the one with the greatest area. Does this list of examples prove that a square always has the greatest area for a given perimeter? Explain.` : t === 1 ? `Test all rectangles with whole-number sides and a perimeter of ${P} cm. Ravi concludes: "The rectangle closest to a square has the greatest area." Is this true for this family? Can he be sure it is true for all rectangles?` : `Find the greatest and the least area among the rectangles with whole-number sides and a perimeter of ${P} cm. Write a conclusion for this family only.`, t === 0 ? `Antara semua segi empat tepat dengan sisi nombor bulat dan perimeter ${P} cm, cari yang mempunyai luas terbesar. Adakah senarai contoh ini membuktikan bahawa segi empat sama sentiasa mempunyai luas terbesar bagi perimeter tertentu? Terangkan.` : t === 1 ? `Uji semua segi empat tepat dengan sisi nombor bulat dan perimeter ${P} cm. Ravi membuat kesimpulan: "Segi empat tepat yang paling hampir dengan segi empat sama mempunyai luas terbesar." Adakah ini benar bagi keluarga ini? Bolehkah dia pasti ia benar bagi semua segi empat tepat?` : `Cari luas terbesar dan luas terkecil antara segi empat tepat dengan sisi nombor bulat dan perimeter ${P} cm. Tulis kesimpulan untuk keluarga ini sahaja.`), a: T(`Greatest: ${best[0]} cm by ${best[1]} cm (${best[2]} cm²)${t === 2 ? `; least: ${rows[rows.length - 1][0]} cm by ${rows[rows.length - 1][1]} cm (${rows[rows.length - 1][2]} cm²)` : ''}. ${t === 2 ? 'This conclusion holds only for whole-number sides and this perimeter.' : 'Yes for this family, but a finite list of examples is not a proof for all rectangles.'}`, `Terbesar: ${best[0]} cm kali ${best[1]} cm (${best[2]} cm²)${t === 2 ? `; terkecil: ${rows[rows.length - 1][0]} cm kali ${rows[rows.length - 1][1]} cm (${rows[rows.length - 1][2]} cm²)` : ''}. ${t === 2 ? 'Kesimpulan ini hanya sah bagi sisi nombor bulat dan perimeter ini.' : 'Ya bagi keluarga ini, tetapi senarai contoh yang terhad bukan pembuktian bagi semua segi empat tepat.'}`), sp: 'm' };
    },
    (r) => {
      const F = r.pick([16, 20, 24, 28, 32]), rows = []; for (let w = 1; 2 * w < F; w++) rows.push([w, F - 2 * w, w * (F - 2 * w)]);
      const best = rows.reduce((b, x) => (x[2] > b[2] ? x : b), rows[0]), c = r.pick([['a farmer', 'seorang petani', 'a vegetable plot', 'batas sayur'], ['a school', 'sebuah sekolah', 'a rabbit pen', 'reban arnab']]);
      return { q: T(`${SPM.cap(c[0])} has ${F} m of fencing to make ${c[2]} in the shape of a rectangle against a long straight wall, so only three sides need fencing. The sides are whole numbers of metres. Find the width (the sides perpendicular to the wall) that gives the greatest area, and that area.`, `${SPM.cap(c[1])} mempunyai ${F} m pagar untuk membina ${c[3]} berbentuk segi empat tepat bersebelahan sebuah dinding lurus yang panjang, jadi hanya tiga sisi perlu dipagar. Sisi-sisinya ialah bilangan bulat meter. Cari lebar (sisi yang serenjang dengan dinding) yang memberi luas terbesar, dan luas itu.`), a: T(`Width ${best[0]} m, length ${best[1]} m, area ${best[2]} m²`, `Lebar ${best[0]} m, panjang ${best[1]} m, luas ${best[2]} m²`), w: T(`Length $= ${F} - 2 \times$ width`), sp: 'm' };
    },
    (r) => {
      const s = r.int(6, 14), xs = [1, 2, 3, 4].slice(0, r.pick([3, 4])), tb = (lg, f) => SPM.table([[lg ? 'Pertambahan panjang' : 'Length increase', ...xs.map((x) => `${x} cm`)], [lg ? 'Luas (cm²)' : 'Area (cm²)', ...xs.map((x) => (f ? (s + x) * (s - x) : '?'))]], { rowHead: true });
      return { q: T(`A square of side ${s} cm is reshaped into a rectangle with the same perimeter by making the length longer and the width shorter by the same amount. Complete the table and describe what happens to the area compared with ${s * s} cm².<br>${tb(0)}`, `Sebuah segi empat sama bersisi ${s} cm dibentuk semula menjadi segi empat tepat berperimeter sama dengan menjadikan panjang lebih panjang dan lebar lebih pendek dengan jumlah yang sama. Lengkapkan jadual dan huraikan apa yang berlaku kepada luas berbanding ${s * s} cm².<br>${tb(1)}`), a: T(`${xs.map((x) => (s + x) * (s - x)).join(', ')}; the area is smaller each time (by ${xs.map((x) => x * x).join(', ')} cm²)`, `${xs.map((x) => (s + x) * (s - x)).join(', ')}; luas lebih kecil setiap kali (sebanyak ${xs.map((x) => x * x).join(', ')} cm²)`), sp: 'm' };
    },
    (r) => { const c = r.pick(CLM); return { q: T('True or false? Give a counter-example if the statement is false. ' + c[0], 'Benar atau palsu? Berikan contoh penyangkal jika pernyataan itu palsu. ' + c[1]), a: c[2] ? T('False. ' + c[3], 'Palsu. ' + c[4]) : T('False: for example, rectangles with equal area or perimeter can differ, so the claim does not always hold.', 'Palsu: contohnya, segi empat tepat berluas atau berperimeter sama boleh berbeza, jadi dakwaan itu tidak sentiasa benar.'), sp: 's' }; },
  ];
  SPM.extend('F1-10.3', { e: e103.concat([m103.find((f) => f.length === 2)]), m: m103, a: a103.concat([m103.find((f) => f.length === 2)]) });
  /* ================= F1-10.4 Areas of composite figures ================= */
  const BG = 'var(--bg,#fff)';
  /** composite / shaded figures; returns { svg, A } (A computed from the dimensions used in the drawing) */
  function cf(kind, d, u) {
    const W0 = 280, H0 = 190, lab = (x, y, t, o) => S.text(x, y, t, Object.assign({ s: 12 }, o || {})), sh = { fill: 'currentColor', op: 0.2 };
    let out = '', A;
    const fit = (w, h) => Math.min(190 / w, 120 / h);
    if (kind === 'border' || kind === 'rtm' || kind === 'itri' || kind === 'kir' || kind === 'cross') {
      const k = fit(d.W, d.H), w = d.W * k, h = d.H * k, x0 = (W0 - w) / 2, y0 = (H0 - h) / 2 + 4;
      out += S.rect(x0, y0, w, h, kind === 'cross' ? {} : sh);
      if (kind === 'border') { const iw = d.w * k, ih = d.h * k, ix = x0 + (w - iw) / 2, iy = y0 + (h - ih) / 2; out += S.rect(ix, iy, iw, ih, { fill: BG }) + lab(ix + iw / 2, iy + ih / 2, `${d.w} ${u} × ${d.h} ${u}`, { s: 10 }); A = d.W * d.H - d.w * d.h; }
      if (kind === 'rtm') { out += S.poly([[x0, y0 + h], [x0 + d.b * k, y0 + h], [x0, y0 + h - d.h * k]], { fill: BG }) + lab(x0 + (d.b * k) / 2, y0 + h + 12, `${d.b} ${u}`, { s: 11 }) + lab(x0 - 6, y0 + h - (d.h * k) / 2, `${d.h} ${u}`, { s: 11, a: 'end' }); A = d.W * d.H - (d.b * d.h) / 2; }
      if (kind === 'itri') { out += S.poly([[x0, y0 + h], [x0 + w, y0 + h], [x0 + d.o * k, y0]], { fill: BG }); A = d.W * d.H - (d.W * d.H) / 2; }
      if (kind === 'kir') { const y1 = y0 + d.y * k; out += S.poly([[x0 + w / 2, y0], [x0 + w, y1], [x0 + w / 2, y0 + h], [x0, y1]], { fill: BG }) + S.line(x0 + w / 2, y0, x0 + w / 2, y0 + h, { dash: true }) + S.line(x0, y1, x0 + w, y1, { dash: true }); A = d.W * d.H - (d.W * d.H) / 2; }
      if (kind === 'cross') { const m = d.m * k; out += S.rect(x0, y0 + (h - m) / 2, w, m, sh) + S.rect(x0 + (w - m) / 2, y0, m, h, sh) + lab(x0 + w + 4, y0 + h / 2 + 1, `${d.m} ${u}`, { s: 11, a: 'start' }); A = d.W * d.m + d.H * d.m - d.m * d.m; }
      out += lab(x0 + w / 2, y0 - 9, `${d.W} ${u}`) + lab(x0 + w + 6, y0 + h / 2 - (kind === 'cross' ? 12 : 0), `${d.H} ${u}`, { a: 'start' });
    } else {
      const P = kind === 'house' ? [[0, 0], [d.b, 0], [d.b, -d.h], [d.b / 2, -d.h - d.t], [0, -d.h]] : [[0, 0], [d.b, 0], [d.b, -d.h], [(d.b + d.a) / 2, -d.h - d.t], [(d.b - d.a) / 2, -d.h - d.t], [0, -d.h]];
      const k = Math.min(190 / d.b, 130 / (d.h + d.t)), Q2 = P.map((p) => [(W0 - d.b * k) / 2 + p[0] * k, (H0 + (d.h + d.t) * k) / 2 + p[1] * k]);
      out += S.poly(Q2, sh) + S.line(Q2[0][0], Q2[0][1] - d.h * k, Q2[1][0], Q2[1][1] - d.h * k, { dash: true });
      const x0 = Q2[0][0], y0 = Q2[0][1];
      out += lab(x0 + (d.b * k) / 2, y0 + 13, `${d.b} ${u}`) + lab(x0 - 6, y0 - (d.h * k) / 2, `${d.h} ${u}`, { a: 'end' }) + lab(x0 + (d.b * k) / 2 + 6, y0 - d.h * k - (d.t * k) / 2, `${d.t} ${u}`, { a: 'start' });
      if (kind === 'htz') out += lab(x0 + (d.b * k) / 2, y0 - (d.h + d.t) * k - 9, `${d.a} ${u}`);
      A = d.b * d.h + (kind === 'house' ? (d.b * d.t) / 2 : ((d.a + d.b) * d.t) / 2);
      need(Math.abs(shoe(P) - A) < 1e-9);
    }
    return { svg: S.wrap(W0, H0, out, 'composite figure'), A };
  }
  const CD = (r, kind) => { const W = r.int(8, 18), H = r.int(6, 14); if (kind === 'border') { const w = r.int(3, W - 4), h = r.int(2, H - 3); return { W, H, w: w - ((W - w) % 2), h: h - ((H - h) % 2) }; } if (kind === 'rtm') return { W, H, b: r.int(3, W - 2), h: r.int(3, H - 1) }; if (kind === 'itri') return { W, H, o: r.int(1, W - 1) }; if (kind === 'kir') return { W, H, y: r.int(2, H - 2) }; if (kind === 'cross') return { W, H, m: r.int(1, 3) }; if (kind === 'house') return { b: r.int(4, 7) * 2, h: r.int(3, 8), t: r.int(2, 6) }; const b = r.int(5, 8) * 2; return { b, h: r.int(3, 7), a: b - 2 * r.int(1, 3), t: r.int(2, 5) }; };
  const KIND = ['border', 'rtm', 'itri', 'kir', 'cross', 'house', 'htz'];
  const KQ = { border: ['Find the area of the shaded border.', 'Cari luas sempadan berlorek itu.'], rtm: ['A right-angled triangle is cut from a corner of the rectangle. Find the area of the shaded region.', 'Sebuah segi tiga bersudut tegak dipotong dari satu sudut segi empat tepat itu. Cari luas kawasan berlorek.'], itri: ['A triangle with the base of the rectangle as its base and its apex on the opposite side is unshaded. Find the area of the shaded region.', 'Sebuah segi tiga yang tapaknya ialah tapak segi empat tepat dan puncaknya pada sisi bertentangan tidak berlorek. Cari luas kawasan berlorek.'], kir: ['A kite with its diagonals equal to the width and height of the rectangle is unshaded. Find the area of the shaded region.', 'Sebuah layang-layang yang pepenjurunya sama dengan lebar dan tinggi segi empat tepat itu tidak berlorek. Cari luas kawasan berlorek.'], cross: ['Two paths of equal width cross in the middle of a rectangular garden. Find the area of the paths (shaded).', 'Dua laluan yang sama lebar bersilang di tengah-tengah sebuah taman segi empat tepat. Cari luas laluan (berlorek).'], house: ['The figure is a rectangle with a triangle on top. Find its total area.', 'Rajah itu ialah sebuah segi empat tepat dengan sebuah segi tiga di atasnya. Cari jumlah luasnya.'], htz: ['The figure is a rectangle with a trapezium on top. Find its total area.', 'Rajah itu ialah sebuah segi empat tepat dengan sebuah trapezium di atasnya. Cari jumlah luasnya.'] };
  const MOD4 = [['', ''], [' Show your working.', ' Tunjukkan langkah kerja anda.'], [' State the areas you add or subtract.', ' Nyatakan luas yang anda tambah atau tolak.'], [' Give your answer with the correct unit.', ' Berikan jawapan anda dengan unit yang betul.']];
  const nt4 = (r, q) => { const m = r.pick(MOD4); return nts(T(q.en + m[0], q.ms + m[1])); };
  const DS4 = (kind, d, u) => ({ border: [`a ${d.W} ${u} by ${d.H} ${u} rectangle with a ${d.w} ${u} by ${d.h} ${u} rectangle removed from its middle`, `sebuah segi empat tepat ${d.W} ${u} kali ${d.H} ${u} dengan sebuah segi empat tepat ${d.w} ${u} kali ${d.h} ${u} dikeluarkan dari tengahnya`], rtm: [`a ${d.W} ${u} by ${d.H} ${u} rectangle with a right-angled triangle of legs ${d.b} ${u} and ${d.h} ${u} removed from a corner`, `sebuah segi empat tepat ${d.W} ${u} kali ${d.H} ${u} dengan segi tiga bersudut tegak berkaki ${d.b} ${u} dan ${d.h} ${u} dikeluarkan dari satu sudut`], itri: [`a ${d.W} ${u} by ${d.H} ${u} rectangle with a triangle on its width as base and height ${d.H} ${u} removed`, `sebuah segi empat tepat ${d.W} ${u} kali ${d.H} ${u} dengan segi tiga bertapak lebarnya dan tinggi ${d.H} ${u} dikeluarkan`], kir: [`a ${d.W} ${u} by ${d.H} ${u} rectangle with a kite of diagonals ${d.W} ${u} and ${d.H} ${u} removed`, `sebuah segi empat tepat ${d.W} ${u} kali ${d.H} ${u} dengan layang-layang berpepenjuru ${d.W} ${u} dan ${d.H} ${u} dikeluarkan`], cross: [`the two paths, each ${d.m} ${u} wide, that cross in the middle of a ${d.W} ${u} by ${d.H} ${u} rectangular garden`, `dua laluan, masing-masing selebar ${d.m} ${u}, yang bersilang di tengah sebuah taman segi empat tepat ${d.W} ${u} kali ${d.H} ${u}`], house: [`a rectangle ${d.b} ${u} by ${d.h} ${u} with a triangle of base ${d.b} ${u} and height ${d.t} ${u} on top`, `sebuah segi empat tepat ${d.b} ${u} kali ${d.h} ${u} dengan segi tiga bertapak ${d.b} ${u} dan tinggi ${d.t} ${u} di atasnya`], htz: [`a rectangle ${d.b} ${u} by ${d.h} ${u} with a trapezium of parallel sides ${d.a} ${u} and ${d.b} ${u} and height ${d.t} ${u} on top`, `sebuah segi empat tepat ${d.b} ${u} kali ${d.h} ${u} dengan trapezium bersisi selari ${d.a} ${u} dan ${d.b} ${u} serta tinggi ${d.t} ${u} di atasnya`] }[kind]);
  const CL4 = [
    ['The area of a shaded region is the area of the outer shape minus the area of the inner shape.', 'Luas kawasan berlorek ialah luas bentuk luar tolak luas bentuk dalam.', 1],
    ['To find the area of an L-shaped figure we can add two rectangles or subtract a rectangle from a bigger one.', 'Untuk mencari luas rajah berbentuk L, kita boleh menambah dua segi empat tepat atau menolak satu segi empat tepat daripada yang lebih besar.', 1],
    ['When two paths cross, the square where they overlap should be counted twice.', 'Apabila dua laluan bersilang, petak tempat kedua-duanya bertindih hendaklah dikira dua kali.', 0, 'It must be counted only once, so the overlap is subtracted once.', 'Ia mesti dikira sekali sahaja, jadi bahagian bertindih ditolak sekali.'],
    ['The area of a composite figure can be found by splitting it into simpler shapes.', 'Luas rajah gubahan boleh dicari dengan memecahkannya kepada bentuk yang lebih mudah.', 1],
    ['The cost of covering a floor is the area multiplied by the price per square metre.', 'Kos menutup lantai ialah luas didarab dengan harga per meter persegi.', 1],
    ['A kite-shaped hole with diagonals equal to the width and height of a rectangle takes up half of the rectangle.', 'Lubang berbentuk layang-layang yang pepenjurunya sama dengan lebar dan tinggi sebuah segi empat tepat mengambil separuh daripada segi empat tepat itu.', 1],
  ];
  const e104 = [
    (r) => {
      const kind = r.pick(['L', 'L', 'T', 'U']), sh = rshape(r, kind), u = r.pick(UN)[0], A = shoe(sh.pts);
      return { q: nt4(r, Q(r.pick([['Find the area of the figure. All angles are right angles.', 'Cari luas rajah itu. Semua sudut ialah sudut tegak.'], ['The figure is made of rectangles. Two lengths are not shown. Find its area.', 'Rajah itu dibentuk daripada segi empat tepat. Dua panjang tidak ditunjukkan. Cari luasnya.'], ['Divide the figure into rectangles and find its total area.', 'Bahagikan rajah itu kepada segi empat tepat dan cari jumlah luasnya.']]), {})), fig: rfig(sh, u), a: T(`$${A}\\ \\text{${u}}^2$`), sp: 'm' };
    },
    (r) => { const kind = r.pick(['house', 'htz', 'border']), d = CD(r, kind), u = r.pick(UN)[0], c = cf(kind, d, u); return { q: nt4(r, T(KQ[kind][0], KQ[kind][1])), fig: c.svg, a: T(`$${n(c.A)}\\ \\text{${u}}^2$`), sp: 'm' }; },
    (r) => {
      const a = r.int(3, 9), b = r.int(2, 8), s = r.int(2, 6), l = r.int(4, 10), t = r.int(0, 2);
      const f = [[`A figure is made of a rectangle ${a + s} cm by ${b} cm and a square of side ${s} cm joined to it without overlapping. Find the total area.`, `Sebuah rajah dibentuk daripada sebuah segi empat tepat ${a + s} cm kali ${b} cm dan sebuah segi empat sama bersisi ${s} cm yang dicantumkan padanya tanpa bertindih. Cari jumlah luas.`, (a + s) * b + s * s], [`Two rectangles, ${l} cm by ${b} cm and ${a} cm by ${s} cm, do not overlap and are placed side by side. Find the total area.`, `Dua segi empat tepat, ${l} cm kali ${b} cm dan ${a} cm kali ${s} cm, tidak bertindih dan diletakkan bersebelahan. Cari jumlah luas.`, l * b + a * s], [`A square of side ${l} cm has a square of side ${s} cm cut out of one corner. Find the area that is left.`, `Sebuah segi empat sama bersisi ${l} cm mempunyai sebuah segi empat sama bersisi ${s} cm yang dipotong dari satu sudut. Cari luas yang tinggal.`, l * l - s * s]][t];
      need(t !== 2 || l > s);
      return { q: T(f[0], f[1]), a: T(`${f[2]} cm²`), sp: 's' };
    },
    (r) => { const c = r.pick(CL4); return { q: T('True or false? ' + c[0], 'Benar atau palsu? ' + c[1]), a: TF(c[2], c[3], c[4]), sp: 'xs' }; },
    (r) => {
      const W = r.int(8, 15), H = r.int(6, 12), a = r.int(2, H - 3), b = r.int(2, W - 3), ok = { t: lt(mx(`${W} \\times ${H} - ${W - b} \\times ${H - a}`)), ok: true }, ds = [`${W} \\times ${H}`, `${W} \\times ${H} + ${W - b} \\times ${H - a}`, `${W} \\times ${a} - ${b} \\times ${H - a}`];
      const m = mc(r, [ok, ...ds.map((t) => ({ t: lt(mx(t)), ok: false }))]);
      return { q: T(`An L-shaped figure is formed by cutting a rectangle of ${W - b} cm by ${H - a} cm from the corner of a rectangle of ${W} cm by ${H} cm. Which calculation gives its area? ${m.en}`, `Sebuah rajah berbentuk L dibentuk dengan memotong sebuah segi empat tepat berukuran ${W - b} cm kali ${H - a} cm dari sudut sebuah segi empat tepat berukuran ${W} cm kali ${H} cm. Pengiraan yang manakah memberi luasnya? ${m.ms}`), a: m.ans, sp: 's' };
    },
  ];
  const m104 = [
    (r) => { const kind = r.pick(['rtm', 'itri', 'kir', 'cross']), d = CD(r, kind), u = r.pick(UN)[0], c = cf(kind, d, u); need(kind !== 'kir' || (d.W * d.H) % 2 === 0 || true); return { q: nt4(r, T(KQ[kind][0], KQ[kind][1])), fig: c.svg, a: T(`$${n(c.A)}\\ \\text{${u}}^2$`), sp: 'm' }; },
    (r) => {
      const kind = r.pick(KIND), d = CD(r, kind), u = r.pick(UN)[0], c = cf(kind, d, u), p = r.pick([8, 12, 15, 20, 25]), t = r.int(0, 1);
      need(Number.isInteger(c.A * p));
      return { q: nt4(r, T(`${KQ[kind][0]} ${t ? `The shaded area is to be covered with turf costing RM${p} per m².` : `Painting the figure costs RM${p} per m².`} Find the cost. (Lengths are in metres.)`, `${KQ[kind][1]} ${t ? `Kawasan berlorek itu akan ditutup dengan rumput hamparan berharga RM${p} per m².` : `Kos mengecat rajah itu ialah RM${p} per m².`} Cari kosnya. (Panjang dalam meter.)`)), fig: cf(kind, d, 'm').svg, a: T(`RM${n(c.A * p)}`), w: T(`Area $= ${n(c.A)}$ m²`), sp: 'm' };
    },
    (r) => {
      const kind = r.pick(['L', 'L', 'U', 'T']), W = r.int(10, 16), H = r.int(8, 13), sh = rshape(r, kind === 'L' ? 'L' : kind, kind === 'L' ? W : undefined, kind === 'L' ? H : undefined), A = shoe(sh.pts), a = sh.pts[2][1], b = sh.pts[3][0], v = r.pick(VARS);
      need(kind === 'L' && a >= 2);
      const L = elen(sh.pts), x = W, u = r.pick(UN)[0], sides = {}; L.forEach((l, i) => { if (i === 0) sides[`${i}-${(i + 1) % L.length}`] = v; else if (!sh.hide.includes(i)) sides[`${i}-${(i + 1) % L.length}`] = `${l} ${u}`; });
      return { q: nts(T(`The area of the L-shaped figure is ${A} ${u}². All angles are right angles. Find the value of ${mx(v)}.`, `Luas rajah berbentuk L itu ialah ${A} ${u}². Semua sudut ialah sudut tegak. Cari nilai ${mx(v)}.`)), fig: F.polygon({ pts: sh.pts.map((p) => [p[0], -p[1]]), sides, w: 280, h: 210 }), a: T(`$${v} = ${x}$`), w: T(`Area $= ${v} \\times ${a} + ${b} \\times ${H - a}$`), sp: 'm' };
    },
    (r, cx) => {
      const lv = cx && cx.d, kind = r.pick(KIND), d = CD(r, kind), c = cf(kind, d, 'm'), A = c.A, ds = DS4(kind, d, 'm'), nn = lv === 'e' ? 2 : lv === 'a' ? r.pick([4, 5]) : r.pick([2, 3]);
      need(Number.isInteger(A));
      const ids = r.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], nn).sort((x, y) => x - y), ps = ids.map((i) => P102[i](r, A));
      return { q: T(`Consider the region formed by ${ds[0]}. (Lengths are in metres.)` + SPM.parts(ps.map((p) => p[0])).en, `Perhatikan kawasan yang dibentuk oleh ${ds[1]}. (Panjang dalam meter.)` + SPM.parts(ps.map((p) => p[0])).ms), a: SPM.parts(ps.map((p) => p[1])), sp: 'm' };
    },
    (r) => {
      const W = r.int(8, 16), H = r.int(6, 12), m = r.int(1, 3), t = r.int(0, 3);
      const f = [[`Ali finds the area of the paths of width ${m} m that cross in a ${W} m by ${H} m garden as ${W} × ${m} + ${H} × ${m} = ${W * m + H * m} m². What has he done wrong? Find the correct area.`, `Ali mencari luas laluan selebar ${m} m yang bersilang dalam sebuah taman ${W} m kali ${H} m sebagai ${W} × ${m} + ${H} × ${m} = ${W * m + H * m} m². Apakah kesilapannya? Cari luas yang betul.`, `He counted the ${m} m by ${m} m crossing twice. The correct area is ${W * m + H * m} - ${m * m} = ${W * m + H * m - m * m} m².`, `Dia mengira petak ${m} m kali ${m} m di persilangan dua kali. Luas yang betul ialah ${W * m + H * m} - ${m * m} = ${W * m + H * m - m * m} m².`], [`Siti says the area of the shaded border of a ${W} cm by ${H} cm rectangle with a ${W - 4} cm by ${H - 4} cm rectangle removed from the middle is ${W * H} cm². What has she forgotten? Find the correct area.`, `Siti berkata luas sempadan berlorek bagi sebuah segi empat tepat ${W} cm kali ${H} cm dengan segi empat tepat ${W - 4} cm kali ${H - 4} cm dikeluarkan dari tengahnya ialah ${W * H} cm². Apakah yang dilupakannya? Cari luas yang betul.`, `She forgot to subtract the inner rectangle: $${W} \\times ${H} - ${W - 4} \\times ${H - 4} = ${W * H - (W - 4) * (H - 4)}$ cm².`, `Dia terlupa menolak segi empat tepat dalam: $${W} \\times ${H} - ${W - 4} \\times ${H - 4} = ${W * H - (W - 4) * (H - 4)}$ cm².`], [`Farid finds the area of a house-shaped figure (a ${W} cm by ${H} cm rectangle with a triangle of base ${W} cm and height ${m + 2} cm on top) as ${W * H} + ${W} × ${m + 2} = ${W * H + W * (m + 2)} cm². What has he forgotten? Find the correct area.`, `Farid mencari luas sebuah rajah berbentuk rumah (segi empat tepat ${W} cm kali ${H} cm dengan segi tiga bertapak ${W} cm dan tinggi ${m + 2} cm di atasnya) sebagai ${W * H} + ${W} × ${m + 2} = ${W * H + W * (m + 2)} cm². Apakah yang dilupakannya? Cari luas yang betul.`, `He forgot the $\\frac{1}{2}$ in the area of the triangle: ${W * H} + ${n((W * (m + 2)) / 2)} = ${n(W * H + (W * (m + 2)) / 2)} cm².`, `Dia terlupa $\\frac{1}{2}$ dalam luas segi tiga: ${W * H} + ${n((W * (m + 2)) / 2)} = ${n(W * H + (W * (m + 2)) / 2)} cm².`], [`A student finds the area of an L-shaped figure by using only its overall width ${W} cm and overall height ${H} cm: ${W} × ${H} = ${W * H} cm². Explain the mistake.`, `Seorang murid mencari luas sebuah rajah berbentuk L dengan hanya menggunakan lebar keseluruhan ${W} cm dan tinggi keseluruhan ${H} cm: ${W} × ${H} = ${W * H} cm². Terangkan kesilapannya.`, `That is the area of the whole rectangle around the L-shape; the missing corner must be subtracted.`, `Itu ialah luas seluruh segi empat tepat di sekeliling rajah L; sudut yang hilang mesti ditolak.`]][t];
      need(W - 4 > 1 && H - 4 > 1);
      return { q: T(f[0], f[1]), a: T(f[2], f[3]), sp: 's' };
    },
  ];
  SPM.extend('F1-10.4', { e: e104.concat([m104.find((f) => f.length === 2)]), m: m104, a: [m104.find((f) => f.length === 2)] });
})();
