/* SPM Mathematics Question Generator – core library
 * Random numbers, number/fraction/algebra helpers, bilingual text helpers,
 * the curriculum registry and the paper generator. No dependencies.
 * Everything hangs off the global `SPM` so the site also works from file://.
 */
(function (root) {
  'use strict';

  const SPM = (root.SPM = root.SPM || {});
  SPM.forms = [];
  SPM.topics = {}; // key -> topic
  SPM.DIFFS = ['e', 'm', 'a'];

  /* ---------------------------------------------------------------- RNG */
  function hashSeed(s) {
    s = String(s);
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }

  const BOYS = ['Ali', 'Farid', 'Kumar', 'Chong', 'Raju', 'Amir', 'Daniel', 'Hafiz', 'Wei Jie', 'Arun', 'Irfan', 'Jason'];
  const GIRLS = ['Siti', 'Aisyah', 'Mei Ling', 'Nurul', 'Priya', 'Farah', 'Sarah', 'Hui Min', 'Devi', 'Alia', 'Zara', 'Lily'];

  function makeRng(seed) {
    let a = hashSeed(seed);
    const next = () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const r = {
      next,
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      /** random multiple of `step` between lo and hi (inclusive) */
      step: (lo, hi, step) => lo + step * Math.floor(next() * (Math.floor((hi - lo) / step) + 1)),
      /** non-zero integer in [lo, hi] */
      nz: (lo, hi) => {
        let v;
        do v = lo + Math.floor(next() * (hi - lo + 1));
        while (v === 0);
        return v;
      },
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      chance: (p) => next() < (p === undefined ? 0.5 : p),
      sign: () => (next() < 0.5 ? -1 : 1),
      shuffle: (arr) => {
        const b = arr.slice();
        for (let i = b.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [b[i], b[j]] = [b[j], b[i]];
        }
        return b;
      },
      sample: (arr, n) => r.shuffle(arr).slice(0, n),
      /** `n` distinct integers from [lo, hi] */
      distinct: (n, lo, hi) => {
        if (hi - lo + 1 < n) throw SPM.REJECT;
        const s = new Set();
        while (s.size < n) s.add(r.int(lo, hi));
        return [...s];
      },
      boy: () => r.pick(BOYS),
      girl: () => r.pick(GIRLS),
      /** two different names */
      pair: () => [r.pick(BOYS), r.pick(GIRLS)],
      name: () => r.pick(BOYS.concat(GIRLS)),
      names: (n) => r.sample(BOYS.concat(GIRLS), n),
    };
    return r;
  }
  SPM.makeRng = makeRng;
  SPM.REJECT = new Error('reject');
  /** Call inside a generator to reject the current random draw and retry. */
  SPM.need = (cond) => {
    if (!cond) throw SPM.REJECT;
  };
  /** run fn until it stops rejecting (max `times` tries) */
  SPM.retry = (fn, times) => {
    for (let i = 0; i < (times || 400); i++) {
      try {
        return fn();
      } catch (e) {
        if (e !== SPM.REJECT) throw e;
      }
    }
    throw SPM.REJECT;
  };

  /* ---------------------------------------------------- bilingual text */
  /** L('English', 'Bahasa Melayu') – second argument defaults to the first. */
  const L = (en, ms) => ({ en, ms: ms === undefined ? en : ms });
  SPM.L = L;
  const asL = (x) => (typeof x === 'string' || typeof x === 'number' ? L(String(x)) : x);
  /** concatenate strings / L objects */
  SPM.cat = (...xs) => {
    xs = xs.map(asL);
    return L(xs.map((x) => x.en).join(''), xs.map((x) => x.ms).join(''));
  };
  /** lettered sub-parts (a), (b), (c) … */
  SPM.parts = (list, cls) => {
    list = list.map(asL);
    const f = (k) => `<ol class="${cls || 'parts'}">` + list.map((x) => `<li>${x[k]}</li>`).join('') + '</ol>';
    return L(f('en'), f('ms'));
  };
  /** answer: plain lines */
  SPM.lines = (...xs) => {
    xs = xs.map(asL);
    return L(xs.map((x) => x.en).join('<br>'), xs.map((x) => x.ms).join('<br>'));
  };
  /** helpers for html tables inside questions: rows = array of arrays of strings */
  SPM.table = (rows, opts) => {
    opts = opts || {};
    const head = opts.head;
    let h = '<table class="qt' + (opts.cls ? ' ' + opts.cls : '') + '">';
    if (head) h += '<thead><tr>' + head.map((c) => `<th>${c}</th>`).join('') + '</tr></thead>';
    h += '<tbody>' + rows.map((row) => '<tr>' + row.map((c, i) => (opts.rowHead && i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join('') + '</tr>').join('') + '</tbody></table>';
    return h;
  };


  /* ------------------------------------------------- tidy generated maths */
  /** Safety net for algebra typeset by templates: `1x` → `x`, `+ 0x` removed, `+ -3` → `+ (-3)`. */
  function tidyMath(str) {
    if (typeof str !== 'string' || str.indexOf('$') < 0) return str;
    const parts = str.split('$');
    if (parts.length % 2 === 0) return str;
    return parts
      .map((seg, i) => {
        if (i % 2 === 0) return seg;
        let t = seg;
        t = t.replace(/\s*[+-]\s*0[a-z](\^\{?\d\}?)?(?![\w\\{])/g, '');
        t = t.replace(/(^|[^\d.\\a-zA-Z{^_])1([a-zA-Z])(?![a-zA-Z])/g, '$1$2');
        t = t.replace(/([+-]) -(\d[\d.]*[a-zA-Z]?)/g, '$1 (-$2)');
        return t;
      })
      .join('$');
  }
  SPM.tidyMath = tidyMath;

  /* ------------------------------------------------------ number helpers */
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a;
  };
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const isPrime = (n) => {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  };
  const primeFactors = (n) => {
    const out = [];
    for (let p = 2; p * p <= n; p++) while (n % p === 0) (out.push(p), (n /= p));
    if (n > 1) out.push(n);
    return out;
  };
  const factors = (n) => {
    const f = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i);
    return f;
  };
  /** round half away from zero, to dp decimals, as a number */
  const round = (x, dp) => {
    dp = dp || 0;
    const m = Math.pow(10, dp);
    const v = Math.sign(x) * Math.round(Math.abs(x) * m * (1 + 1e-12)) / m;
    return v === 0 ? 0 : v;
  };
  /** number to string, max 10 dp, trailing zeros trimmed */
  const n = (x) => {
    if (typeof x === 'string') return x;
    let s = (Math.round(x * 1e10) / 1e10).toString();
    if (s.indexOf('e') >= 0) s = x.toFixed(10).replace(/\.?0+$/, '');
    return s === '-0' ? '0' : s;
  };
  /** fixed dp string (rounded half up) */
  const fx = (x, dp) => {
    const s = round(x, dp).toFixed(dp);
    return s.replace(/^-0(\.0*)?$/, '0$1');
  };
  /** group thousands with a thin space, inside math */
  const gm = (x) => {
    const s = n(x);
    const [i, d] = s.split('.');
    const neg = i[0] === '-';
    const digits = neg ? i.slice(1) : i;
    const g = digits.length > 4 ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : digits;
    return (neg ? '-' : '') + g + (d ? '.' + d : '');
  };
  /** money as text, e.g. RM1 250.50 (no-break space grouping) */
  const rm = (x, dp) => {
    if (dp === undefined) dp = Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 2;
    const s = fx(x, dp);
    const [i, d] = s.split('.');
    const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return 'RM' + g + (d ? '.' + d : '');
  };
  /** grouped number for plain text */
  const gt = (x) => {
    const s = n(x);
    const [i, d] = s.split('.');
    const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return g + (d ? '.' + d : '');
  };
  const sgn = (x) => (x < 0 ? ' - ' + n(-x) : ' + ' + n(x)); // " + 3" / " - 3"
  const par = (x) => (x < 0 ? '(' + n(x) + ')' : n(x)); // wrap negatives
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const mean = (a) => sum(a) / a.length;
  const sortNum = (a) => a.slice().sort((x, y) => x - y);
  const median = (a) => {
    const s = sortNum(a);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const range = (lo, hi, st) => {
    const o = [];
    st = st || 1;
    for (let v = lo; st > 0 ? v <= hi + 1e-9 : v >= hi - 1e-9; v += st) o.push(round(v, 6));
    return o;
  };
  const ordinal = (k) => k;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /* ------------------------------------------------------------ fractions */
  const Fr = {
    make(a, b) {
      if (b === undefined) b = 1;
      if (b === 0) throw SPM.REJECT;
      if (b < 0) (a = -a), (b = -b);
      const g = gcd(a, b) || 1;
      return { n: a / g, d: b / g };
    },
    add: (x, y) => Fr.make(x.n * y.d + y.n * x.d, x.d * y.d),
    sub: (x, y) => Fr.make(x.n * y.d - y.n * x.d, x.d * y.d),
    mul: (x, y) => Fr.make(x.n * y.n, x.d * y.d),
    div: (x, y) => Fr.make(x.n * y.d, x.d * y.n),
    neg: (x) => ({ n: -x.n, d: x.d }),
    cmp: (x, y) => x.n * y.d - y.n * x.d,
    val: (x) => x.n / x.d,
    eq: (x, y) => x.n === y.n && x.d === y.d,
    /** TeX of a (possibly improper) fraction, integers without denominator */
    tex(x, opt) {
      if (x.d === 1) return n(x.n);
      const s = x.n < 0 ? '-' : '';
      return `${s}\\dfrac{${Math.abs(x.n)}}{${x.d}}`;
    },
    /** TeX as mixed number when improper */
    mixed(x) {
      if (x.d === 1) return n(x.n);
      const s = x.n < 0 ? '-' : '';
      const an = Math.abs(x.n);
      const w = Math.floor(an / x.d);
      const r = an % x.d;
      if (w === 0) return `${s}\\dfrac{${an}}{${x.d}}`;
      if (r === 0) return s + w;
      return `${s}${w}\\dfrac{${r}}{${x.d}}`;
    },
    /** bracketed if negative */
    texP(x) {
      return x.n < 0 ? '\\left(' + Fr.tex(x) + '\\right)' : Fr.tex(x);
    },
  };
  /** plain \dfrac{a}{b} without simplification */
  const frac = (a, b) => `\\dfrac{${a}}{${b}}`;

  /* -------------------------------------------------------------- algebra */
  /** one term: coefficient c and variable string v ('' for constant); returns {s, neg} */
  function termStr(c, v) {
    if (v === '' || v === undefined) return n(Math.abs(c));
    const a = Math.abs(c);
    return (a === 1 ? '' : n(a)) + v;
  }
  /** poly([[3,'x^2'],[-1,'x'],[5,'']]) -> "3x^2 - x + 5" */
  function poly(terms) {
    let out = '';
    let first = true;
    for (const [c, v] of terms) {
      if (c === 0) continue;
      const body = termStr(c, v);
      if (first) out += (c < 0 ? '-' : '') + body;
      else out += (c < 0 ? ' - ' : ' + ') + body;
      first = false;
    }
    return out || '0';
  }
  /** a x + b  in variable v */
  const lin = (a, b, v) => poly([[a, v || 'x'], [b, '']]);
  /** (x + k) style bracket */
  const bin = (a, b, v) => '(' + lin(a, b, v) + ')';

  /* ---------------------------------------------------------- registry */
  /**
   * SPM.addChapter(form, number, {en, ms}, [topics])
   * topic = { id:'1.1', en, ms, scope:'core'|'enrichment'|'support'|'context', gen:{e:[fn], m:[fn], a:[fn]} }
   * A generator fn(r, ctx) returns { q:L, a:L, w?:L, sp:'xs'|'s'|'m'|'l'|'xl'|mm, fig?:string|L }.
   */
  SPM.addChapter = function (form, no, title, topics) {
    let f = SPM.forms.find((x) => x.form === form);
    if (!f) {
      f = { form, chapters: [] };
      SPM.forms.push(f);
      SPM.forms.sort((a, b) => a.form - b.form);
    }
    const ch = { form, no, en: title.en, ms: title.ms, topics: [] };
    for (const t of topics) {
      t.key = `F${form}-${t.id}`;
      t.form = form;
      t.chapter = no;
      t.scope = t.scope || 'core';
      SPM.topics[t.key] = t;
      ch.topics.push(t);
    }
    f.chapters.push(ch);
    f.chapters.sort((a, b) => a.no - b.no);
    return ch;
  };

  const ORDER = { e: 0, m: 1, a: 2 };

  function pickGen(topic, d) {
    let pool = topic.gen[d];
    if (!pool || !pool.length) {
      // fall back to nearest available level
      const alt = d === 'e' ? ['m', 'a'] : d === 'a' ? ['m', 'e'] : ['e', 'a'];
      for (const k of alt) if (topic.gen[k] && topic.gen[k].length) pool = topic.gen[k];
    }
    return pool;
  }

  /**
   * Add generator functions to an existing topic:  SPM.extend('F1-1.1', { e: [fn…], m: [fn…], a: [fn…] }).
   * Used by the js/data/x*.js "variety packs", which sit on top of the original f*.js generators.
   */
  SPM.extend = function (key, gen) {
    const t = SPM.topics[key];
    if (!t) throw new Error('SPM.extend: unknown topic ' + key);
    for (const d of SPM.DIFFS) if (gen[d] && gen[d].length) t.gen[d] = (t.gen[d] || []).concat(gen[d]);
  };

  /**
   * make one question for a topic at difficulty d, avoiding texts in `seen`.
   * Generators are visited in a random order and, within one paper, a generator that has not been used yet is
   * always preferred – so a worksheet of N questions from one topic uses N different question types.
   */
  function makeOne(topic, d, r, seen, idx) {
    const pool = pickGen(topic, d);
    const tag = (i) => '\u0001' + topic.key + d + ':' + i;
    const order = r.shuffle(pool.map((_, i) => i));
    const tries = order.filter((i) => !seen.has(tag(i))).concat(order.filter((i) => seen.has(tag(i))));
    let last = null;
    let fails = 0;
    for (let attempt = 0; attempt < Math.max(60, pool.length); attempt++) {
      const gi = tries[attempt % tries.length];
      let q;
      try {
        q = pool[gi](r, { d });
      } catch (e) {
        if (e === SPM.REJECT) continue;
        fails++;
        if (fails > 5) throw e;
        continue;
      }
      if (!q || !q.q) continue;
      for (const key of ['q', 'a', 'w']) if (q[key]) q[key] = L(tidyMath(q[key].en), tidyMath(q[key].ms));
      last = q;
      const sig = q.q.en + '|' + (typeof q.fig === 'string' ? q.fig.length : '');
      if (!seen.has(sig)) {
        seen.add(sig);
        seen.add(tag(gi));
        return q;
      }
    }
    if (last) return last;
    throw new Error('Generator failed for ' + topic.key);
  }
  SPM.makeOne = makeOne;

  /**
   * Generate a paper.
   * opts: { keys:[topicKey], count, difficulty:'e'|'m'|'a'|'mixed', seed }
   */
  SPM.generate = function (opts) {
    const seed = opts.seed !== undefined && opts.seed !== '' ? opts.seed : Math.floor(Math.random() * 1e9);
    const r = makeRng(seed);
    const order = (k) => {
      const t = SPM.topics[k];
      return t.form * 1e6 + t.chapter * 1e3 + SPM.forms.find((f) => f.form === t.form).chapters.find((c) => c.no === t.chapter).topics.indexOf(t);
    };
    const keys = opts.keys.filter((k) => SPM.topics[k]).sort((a, b) => order(a) - order(b));
    const N = Math.max(0, Math.min(200, opts.count | 0));
    if (!keys.length || !N) return { seed, items: [] };

    // spread questions across topics
    const counts = keys.map(() => Math.floor(N / keys.length));
    let rem = N - sum(counts);
    for (const i of r.sample(keys.map((_, i) => i), rem)) counts[i]++;

    // difficulty per slot
    const slots = [];
    keys.forEach((k, i) => {
      for (let j = 0; j < counts[i]; j++) slots.push(i);
    });
    let ds;
    if (opts.difficulty === 'mixed') {
      ds = [];
      for (let i = 0; i < N; i++) ds.push(SPM.DIFFS[i % 3]);
      // vary which level gets the remainder
      const off = r.int(0, 2);
      ds = ds.map((_, i) => SPM.DIFFS[(i + off) % 3]);
      ds = r.shuffle(ds);
    } else ds = slots.map(() => opts.difficulty);

    const byTopic = keys.map(() => []);
    slots.forEach((ti, i) => byTopic[ti].push(ds[i]));

    const items = [];
    const seen = new Set();
    keys.forEach((k, ti) => {
      const topic = SPM.topics[k];
      const list = byTopic[ti].sort((a, b) => ORDER[a] - ORDER[b]);
      list.forEach((d, idx) => {
        const q = makeOne(topic, d, r, seen, idx);
        items.push(Object.assign({ key: k, d }, q));
      });
    });
    return { seed, items };
  };

  /* ------------------------------------------------------------- export */
  Object.assign(SPM, {
    L, gcd, lcm, isPrime, primeFactors, factors, round, n, fx, gm, rm, gt, sgn, par, sum, mean, sortNum, median, range, Fr, frac,
    poly, lin, bin, termStr, letters, ordinal, BOYS, GIRLS,
  });
})(typeof window !== 'undefined' ? window : globalThis);
