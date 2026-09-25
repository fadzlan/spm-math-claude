/* SPM Maths Question Generator – user interface */
(function () {
  'use strict';
  const SPM = window.SPM;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const STORE = 'spm-gen-v1';

  /* ----------------------------------------------------------------- state */
  const defaults = {
    theme: null, // null = follow system
    ui: 'en',
    qlang: 'en',
    format: 'normal',
    difficulty: 'mixed',
    count: 10,
    seed: '',
    keys: ['F1-1.1', 'F1-1.2', 'F1-1.3', 'F1-1.4', 'F1-1.5'],
    header: true,
    labels: true,
    cols: false,
    working: false,
    answersOpen: false,
  };
  let state = Object.assign({}, defaults);
  try {
    Object.assign(state, JSON.parse(localStorage.getItem(STORE) || '{}'));
  } catch (e) {}
  state.keys = (state.keys || []).filter((k) => SPM.topics[k]);
  if (!/^[0-9a-z]*$/.test(state.seed)) state.seed = ''; // the seed box holds a full paper code; state.seed is only its random part
  const save = () => {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch (e) {}
  };
  const sel = new Set(state.keys);
  let current = null; // last generated paper
  const openSet = new Set(['form-1', 'ch-1-1']);

  const UI = () => SPM.UI[state.ui];
  const WS = () => SPM.WS[state.qlang];
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ----------------------------------------------------------------- maths */
  const mathCache = new Map();
  function mathHtml(tex) {
    if (mathCache.has(tex)) return mathCache.get(tex);
    let h;
    // let long lists (rosters, sequences) wrap onto the next line instead of overflowing
    const src = tex.replace(/,\\ /g, ',\\allowbreak\\ ');
    try {
      h = window.katex
        ? window.katex.renderToString(src, { throwOnError: false, strict: 'ignore', output: 'html', displayMode: false })
        : esc(tex);
    } catch (e) {
      h = esc(tex);
    }
    mathCache.set(tex, h);
    return h;
  }
  /** text containing $…$ math → html */
  function rt(s) {
    if (s === undefined || s === null) return '';
    const parts = String(s).split('$');
    if (parts.length % 2 === 0) return String(s);
    return parts.map((p, i) => (i % 2 ? mathHtml(p) : p)).join('');
  }

  /* ------------------------------------------------------------------ tree */
  function chapterKeys(ch) {
    return ch.topics.map((t) => t.key);
  }
  function buildTree() {
    const ui = UI();
    const tree = $('#tree');
    let h = '';
    for (const f of SPM.forms) {
      const fid = 'form-' + f.form;
      h += `<details class="form" data-id="${fid}"${openSet.has(fid) ? ' open' : ''}><summary class="form-sum"><label class="sum-label"><input type="checkbox" data-form="${f.form}"><span>${esc(ui.form(f.form))}</span></label></summary><div class="form-body">`;
      for (const ch of f.chapters) {
        const cid = `ch-${f.form}-${ch.no}`;
        const title = ch[state.ui];
        h += `<details class="chapter" data-id="${cid}" data-search="${esc((ch.en + ' ' + ch.ms + ' ' + ch.topics.map((t) => t.en + ' ' + t.ms).join(' ')).toLowerCase())}"${openSet.has(cid) ? ' open' : ''}>`;
        h += `<summary class="ch-sum"><label class="sum-label"><input type="checkbox" data-chapter="${f.form}-${ch.no}"><span class="no">${ch.no}</span><span>${esc(title)}</span></label></summary><div class="topics">`;
        for (const t of ch.topics) {
          const badge = t.scope !== 'core' ? `<span class="badge">${esc(ui.scope[t.scope] || t.scope)}</span>` : '';
          h += `<label class="row"><input type="checkbox" data-key="${t.key}"><span class="tid">${esc(t.id)}</span><span>${esc(t[state.ui])}${badge}</span></label>`;
        }
        h += '</div></details>';
      }
      h += '</div></details>';
    }
    tree.innerHTML = h;
    syncChecks();
    applyFilter();
  }

  function syncChecks() {
    $$('input[data-key]').forEach((cb) => (cb.checked = sel.has(cb.dataset.key)));
    for (const f of SPM.forms) {
      let fAll = 0,
        fTot = 0;
      for (const ch of f.chapters) {
        const keys = chapterKeys(ch);
        const n = keys.filter((k) => sel.has(k)).length;
        fAll += n;
        fTot += keys.length;
        const cb = $(`input[data-chapter="${f.form}-${ch.no}"]`);
        if (cb) {
          cb.checked = n === keys.length;
          cb.indeterminate = n > 0 && n < keys.length;
        }
      }
      const fcb = $(`input[data-form="${f.form}"]`);
      if (fcb) {
        fcb.checked = fAll === fTot;
        fcb.indeterminate = fAll > 0 && fAll < fTot;
      }
    }
    const chapters = new Set([...sel].map((k) => SPM.topics[k].form + '-' + SPM.topics[k].chapter));
    $('#sel-count').textContent = sel.size ? UI().selected(sel.size, chapters.size) : UI().noneSelected;
  }

  function applyFilter() {
    const q = $('#filter').value.trim().toLowerCase();
    $$('#tree details.chapter').forEach((d) => {
      const show = !q || d.dataset.search.includes(q);
      d.classList.toggle('hide', !show);
      if (q && show) d.open = true;
      else if (!q) d.open = openSet.has(d.dataset.id);
    });
    $$('#tree details.form').forEach((d) => {
      const any = $$('details.chapter', d).some((c) => !c.classList.contains('hide'));
      d.classList.toggle('hide', !any);
      if (q && any) d.open = true;
      else if (!q) d.open = openSet.has(d.dataset.id);
    });
  }

  /* ------------------------------------------------------------ generation */
  let timer = null;
  function schedule(delay) {
    clearTimeout(timer);
    timer = setTimeout(generate, delay === undefined ? 200 : delay);
  }
  function randomSeed() {
    return String(Math.floor(Math.random() * 900000) + 100000);
  }
  /** the paper code (see SPM.encodeCode): the random seed plus count, difficulty and topics */
  const paperCode = () => SPM.encodeCode({ nonce: state.seed, count: state.count, difficulty: state.difficulty, keys: [...sel] });

  /* -------------------------------------------------------------- feedback */
  // A Google Form collects feedback (responses go to a Google Sheet). `url` is the form's .../viewform
  // address and `entry` the pre-fill field ids from the form's "Get pre-filled link"; while `url` is
  // empty the header link stays hidden. `lang` is a choice field, so its value must match an option exactly.
  const FEEDBACK = {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLScfGNigQJ3df8h0MXxU4FpE9V4lLgTmBKSJFmkmwplkSQt4KA/viewform',
    entry: { code: '507359297', lang: '1351439379' },
    langs: { en: 'English', ms: 'Bahasa Melayu' },
  };
  function feedbackUrl() {
    const q = [['code', paperCode()], ['lang', FEEDBACK.langs[state.qlang]]]
      .filter(([k]) => FEEDBACK.entry[k])
      .map(([k, v]) => `entry.${FEEDBACK.entry[k]}=${encodeURIComponent(v)}`);
    return FEEDBACK.url + '?usp=pp_url' + (q.length ? '&' + q.join('&') : '');
  }
  let genSeq = 0; // bumped by every generate(), so one still waiting on packs can tell it has been superseded
  let prefetched = false;
  async function generate(newSeed) {
    if (newSeed === true || !state.seed) state.seed = randomSeed();
    const code = paperCode();
    $('#seed').value = code;
    seedPop(false);
    const keys = (state.keys = [...sel]);
    save();
    const seq = ++genSeq;
    // the js/data/x*.js "variety pack" generators load on demand (see js/packs.js): wait for the ones these
    // topics need rather than generate from the (still complete, just less varied) base topics alone, showing
    // a loading state only if something is actually still in flight
    if (SPM.ensurePacks) {
      if (!SPM.havePacks(keys)) {
        const ui = UI();
        $('#sheet').innerHTML = `<div class="empty"><h3>${esc(ui.loadingTitle)}</h3><p>${esc(ui.loadingBody)}</p></div>`;
      }
      await SPM.ensurePacks(keys);
      if (seq !== genSeq) return; // a newer generate() has taken over (and rendered, or will)
    }
    try {
      current = SPM.generate({ keys, count: state.count, difficulty: state.difficulty, seed: code });
    } catch (e) {
      console.error(e);
      current = { items: [], error: e };
    }
    render();
    // once the first worksheet is up, fetch the rest of the packs in the background (after this frame has
    // painted, so the KaTeX fonts it needs are requested first)
    if (!prefetched && SPM.prefetchAllPacks) {
      prefetched = true;
      requestAnimationFrame(() => setTimeout(SPM.prefetchAllPacks, 0));
    }
  }

  /* ---------------------------------------------------------------- render */
  function sheetTitle(items) {
    const ws = WS();
    const lang = state.qlang;
    const byForm = new Map();
    for (const k of sel) {
      const t = SPM.topics[k];
      if (!byForm.has(t.form)) byForm.set(t.form, new Set());
      byForm.get(t.form).add(t.chapter);
    }
    if (!byForm.size) return { title: ws.subject, sub: '' };
    if (byForm.size === 1) {
      const [form, chs] = [...byForm][0];
      const f = SPM.forms.find((x) => x.form === form);
      if (chs.size === 1) {
        const no = [...chs][0];
        const ch = f.chapters.find((c) => c.no === no);
        const keys = chapterKeys(ch);
        const partial = keys.filter((k) => sel.has(k)).length < keys.length;
        let sub = '';
        if (partial) sub = [...sel].map((k) => SPM.topics[k].id + ' ' + SPM.topics[k][lang]).join(' · ');
        return { title: `${ws.subject} ${ws.form(form)} – ${ws.chapter(no)}: ${ch[lang]}`, sub };
      }
      const nos = [...chs].sort((a, b) => a - b);
      return { title: `${ws.subject} ${ws.form(form)}`, sub: `${ws.chapters}: ` + nos.map((no) => `${no}. ${f.chapters.find((c) => c.no === no)[lang]}`).join(' · ') };
    }
    return { title: `${ws.subject} – ${ws.mixedTopics}`, sub: [...byForm].map(([f, chs]) => `${ws.form(f)}: ${[...chs].sort((a, b) => a - b).join(', ')}`).join(' · ') };
  }

  function spaceMm(sp) {
    if (typeof sp === 'number') return sp;
    return SPM.SPACE[sp || 's'] || SPM.SPACE.s;
  }
  const pick = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] : v);

  function figHtml(fig, lang) {
    if (!fig) return '';
    const items = (Array.isArray(fig) ? fig : [fig]).map((f) => pick(f, lang)).flat();
    return `<div class="fig-wrap${items.length > 1 ? ' inline-2' : ''}">${items.join('')}</div>`;
  }

  function render() {
    const sheet = $('#sheet');
    const lang = state.qlang;
    const ws = WS();
    sheet.className = `sheet fmt-${state.format}${state.labels ? '' : ' hide-labels'}${state.format === 'compact' && state.cols ? ' cols-2' : ''}`;
    sheet.lang = lang === 'ms' ? 'ms' : 'en';
    if (!current || !current.items.length) {
      const ui = UI();
      sheet.innerHTML = `<div class="empty"><h3>${esc(ui.emptyTitle)}</h3><p>${esc(ui.emptyBody)}</p></div>`;
      return;
    }
    const items = current.items;
    const { title, sub } = sheetTitle(items);
    const dl = state.difficulty;
    let h = `<header class="sheet-head"><h2>${esc(title)}</h2><div class="sub">${esc(sub ? sub + ' · ' : '')}${esc(ws.level)}: ${esc(ws.diff[dl])} · ${esc(ws.questions(items.length))}</div><div class="code">${esc(ws.seed)}: ${esc(current.seed)}</div>`;
    if (state.header) h += `<div class="idline"><span class="nm">${esc(ws.name)}:</span><span class="cl">${esc(ws.cls)}:</span><span class="dt">${esc(ws.date)}:</span></div>`;
    h += '</header><ol class="questions">';
    items.forEach((it, i) => {
      const sp = state.format === 'normal' ? spaceMm(it.sp) : 0;
      h += `<li class="q"><span class="qn">${i + 1}.</span><div class="qb"><span class="qt-text"><span class="dtag ${it.d}">${esc(ws.diff[it.d])}</span>${rt(it.q[lang])}</span>${figHtml(it.fig, lang)}${sp ? `<div class="space" style="height:${sp}mm"></div>` : ''}</div></li>`;
    });
    h += '</ol>';
    // answers
    h += `<section class="answers${state.answersOpen ? '' : ' is-collapsed'}" id="answers"><button type="button" class="ans-toggle" aria-expanded="${state.answersOpen}" aria-controls="ans-body"><span class="chev" aria-hidden="true"></span><span class="ans-label">${esc(state.answersOpen ? ws.hideAnswers : ws.showAnswers)}</span></button>`;
    h += `<div class="ans-body" id="ans-body"><div class="ans-print-title">${esc(ws.answers)} <small>${esc(title)}</small><small class="code">${esc(ws.seed)}: ${esc(current.seed)}</small></div><ol class="ans-list">`;
    items.forEach((it, i) => {
      const a = pick(it.a, lang);
      const w = state.working && it.w ? pick(it.w, lang) : '';
      h += `<li><span class="an">${i + 1}.</span><div><div class="ans-final">${rt(a)}</div>${w ? `<div class="ans-work">${rt(w)}</div>` : ''}</div></li>`;
    });
    h += '</ol></div></section>';
    sheet.innerHTML = h;
    document.title = `${title} – ${SPM.UI[state.ui].title}`;
  }

  /* ------------------------------------------------------------- UI wiring */
  function setPressed(groupSel, val) {
    $$(groupSel + ' button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.val === String(val))));
  }
  /** show or hide the "invalid seed" popover under the seed box */
  function seedPop(show) {
    const input = $('#seed');
    $('#seed-pop').hidden = !show;
    if (show) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', 'seed-pop');
    } else {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }
  function applyUI() {
    const ui = UI();
    document.documentElement.lang = state.ui === 'ms' ? 'ms' : 'en';
    $$('[data-i18n]').forEach((el) => {
      const v = ui[el.dataset.i18n];
      if (typeof v === 'string') el.textContent = v;
    });
    $$('[data-i18n-ph]').forEach((el) => (el.placeholder = ui[el.dataset.i18nPh]));
    $$('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', ui[el.dataset.i18nLabel]));
    $('#fmt-hint').textContent = state.format === 'normal' ? ui.hintNormal : ui.hintCompact;
    $('#cols-wrap').classList.toggle('off', state.format !== 'compact');
    const presets = $('#count-presets');
    presets.innerHTML = ui.presets.map((n) => `<button type="button" data-n="${n}" aria-pressed="${n === state.count}">${n}</button>`).join('');
    setPressed('#ui-lang', state.ui);
    setPressed('#difficulty', state.difficulty);
    setPressed('#qlang', state.qlang);
    setPressed('#format', state.format);
    const dark = effectiveTheme() === 'dark';
    const tb = $('#theme-btn');
    tb.setAttribute('aria-label', dark ? ui.themeToLight : ui.themeToDark);
    tb.title = dark ? ui.themeToLight : ui.themeToDark;
    $('#feedback-btn').title = ui.feedbackTip;
    buildTree();
  }
  function effectiveTheme() {
    if (state.theme) return state.theme;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function setTheme(t) {
    state.theme = t;
    if (t) document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
    save();
    applyUI();
  }

  function init() {
    $('#count').value = state.count;
    $('#opt-header').checked = state.header;
    $('#opt-labels').checked = state.labels;
    $('#opt-cols').checked = state.cols;
    $('#opt-working').checked = state.working;
    if (state.theme) document.documentElement.setAttribute('data-theme', state.theme);

    // tree interaction
    $('#tree').addEventListener('change', (e) => {
      const cb = e.target;
      if (cb.dataset.key) cb.checked ? sel.add(cb.dataset.key) : sel.delete(cb.dataset.key);
      else if (cb.dataset.chapter) {
        const [f, n] = cb.dataset.chapter.split('-').map(Number);
        const ch = SPM.forms.find((x) => x.form === f).chapters.find((c) => c.no === n);
        chapterKeys(ch).forEach((k) => (cb.checked ? sel.add(k) : sel.delete(k)));
      } else if (cb.dataset.form) {
        const f = SPM.forms.find((x) => x.form === Number(cb.dataset.form));
        f.chapters.forEach((ch) => chapterKeys(ch).forEach((k) => (cb.checked ? sel.add(k) : sel.delete(k))));
      } else return;
      syncChecks();
      schedule();
    });
    $('#tree').addEventListener(
      'toggle',
      (e) => {
        if ($('#filter').value.trim()) return;
        const d = e.target;
        if (d.dataset && d.dataset.id) d.open ? openSet.add(d.dataset.id) : openSet.delete(d.dataset.id);
      },
      true
    );
    $('#filter').addEventListener('input', applyFilter);
    $('#expand-all').onclick = () => {
      $$('#tree details').forEach((d) => ((d.open = true), d.dataset.id && openSet.add(d.dataset.id)));
    };
    $('#collapse-all').onclick = () => {
      $$('#tree details').forEach((d) => ((d.open = false), openSet.delete(d.dataset.id)));
    };
    $('#clear-all').onclick = () => {
      sel.clear();
      syncChecks();
      schedule(0);
    };

    // options
    const setCount = (v) => {
      v = Math.max(1, Math.min(100, parseInt(v, 10) || 1));
      state.count = v;
      $('#count').value = v;
      $$('#count-presets button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.n) === v)));
    };
    $('#count').addEventListener('input', (e) => {
      if (e.target.value === '') return;
      setCount(e.target.value);
      schedule(350);
    });
    $('#count').addEventListener('blur', (e) => setCount(e.target.value));
    $('#count-presets').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      setCount(b.dataset.n);
      schedule(0);
    });
    const seg = (id, key, cb) =>
      $(id).addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        state[key] = b.dataset.val;
        setPressed(id, state[key]);
        save();
        cb && cb();
      });
    seg('#difficulty', 'difficulty', () => schedule(0));
    seg('#qlang', 'qlang', () => render());
    seg('#format', 'format', () => {
      applyUIMinor();
      render();
    });
    seg('#ui-lang', 'ui', () => applyUI());
    function applyUIMinor() {
      $('#fmt-hint').textContent = state.format === 'normal' ? UI().hintNormal : UI().hintCompact;
      $('#cols-wrap').classList.toggle('off', state.format !== 'compact');
    }
    for (const [id, key] of [['#opt-header', 'header'], ['#opt-labels', 'labels'], ['#opt-cols', 'cols'], ['#opt-working', 'working']]) {
      $(id).addEventListener('change', (e) => {
        state[key] = e.target.checked;
        save();
        render();
      });
    }
    // a full paper code restores its count, difficulty and topics too; a bare seed keeps the current ones
    $('#seed').addEventListener('change', (e) => {
      if (!e.target.value.trim()) return generate(true); // an emptied box just asks for a fresh seed
      const c = SPM.decodeCode(e.target.value);
      if (!c) {
        seedPop(true);
        return;
      }
      state.seed = c.nonce;
      if (c.keys) {
        setCount(c.count);
        state.difficulty = c.difficulty;
        setPressed('#difficulty', state.difficulty);
        sel.clear();
        c.keys.forEach((k) => sel.add(k));
        syncChecks();
      }
      schedule(0);
    });
    // the popover stays up until the code is edited, Esc is pressed or the user clicks away from it
    $('#seed').addEventListener('input', () => seedPop(false));
    $('#seed-pop-x').onclick = () => {
      seedPop(false);
      $('#seed').focus();
    };
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !$('#seed-pop').hidden) seedPop(false);
    });
    document.addEventListener('pointerdown', (e) => {
      if (!$('#seed-pop').hidden && !e.target.closest('.seed-wrap')) seedPop(false);
    });
    $('#new-btn').onclick = () => generate(true);
    $('#print-btn').onclick = () => {
      if (!current || !current.items.length) return;
      const old = document.title;
      window.print();
      document.title = old;
    };
    $('#theme-btn').onclick = () => setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark');
    const fb = $('#feedback-btn');
    fb.hidden = !FEEDBACK.url;
    // built at click time so it carries the paper code currently on screen
    fb.addEventListener('click', () => (fb.href = feedbackUrl()));
    if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => !state.theme && applyUI());

    // answers toggle (delegated, since the sheet is re-rendered)
    $('#sheet').addEventListener('click', (e) => {
      const b = e.target.closest('.ans-toggle');
      if (!b) return;
      state.answersOpen = !state.answersOpen;
      const sec = $('#answers');
      sec.classList.toggle('is-collapsed', !state.answersOpen);
      b.setAttribute('aria-expanded', String(state.answersOpen));
      $('.ans-label', b).textContent = state.answersOpen ? WS().hideAnswers : WS().showAnswers;
      save();
    });

    applyUI();
    generate();
  }

  init();
})();
