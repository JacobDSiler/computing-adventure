/* Computing Adventure - scene engine shared by Safe Harbor and Kind Corner.
 * Step types: info, choose, sort, spot, pass, toggles, compose, breathe. Wrong answers are never punished: they show a gentle "let's look closer". */
(function () {
  'use strict';
  const CA = window.CA, h = CA.h;
  const S = CA.scenes = {};

  /* ---------- content helpers (used by ca-safe.js and ca-kind.js) ---------- */
  S.g = (t, why) => ({ t, good: true, why });
  S.x = (t, why) => ({ t, good: false, why });
  S.info = (title, text, mock) => ({ type: 'info', title, text, mock });
  S.choose = (q, mock, opts) => ({ type: 'choose', q, mock, opts });
  S.sort = (q, left, right, cards) => ({ type: 'sort', q, left, right, cards });
  S.spot = (q, parts, mock) => ({ type: 'spot', q, parts, mock });
  S.chat = (title, msgs) => ({ kind: 'chat', title, msgs });
  S.mail = (from, subject, body) => ({ kind: 'mail', from, subject, body });
  S.url = (url, lock, body) => ({ kind: 'url', url, lock, body });
  S.popup = (title, body, btn) => ({ kind: 'popup', title, body, btn });
  S.post = (who, text, em) => ({ kind: 'post', who, text, em });
  S.note = text => ({ kind: 'note', text });

  /* ---------- mock UIs ---------- */
  function mockEl(m) {
    if (!m) return null;
    if (m.kind === 'chat') return h('div', { class: 'mock', role: 'img', 'aria-label': 'Pretend chat' }, h('div', { class: 'small muted', style: { fontWeight: 800 } }, '💬 ' + m.title + ' (pretend)'), m.msgs.map(a => h('div', { class: 'bubble' + (a[0] === 'me' ? ' me' : '') }, a[0] === 'me' ? null : h('span', { class: 'nm' }, a[0]), a[1])));
    if (m.kind === 'mail') return h('div', { class: 'mock' }, h('div', { class: 'small' }, h('b', null, 'From: '), m.from), h('div', { class: 'small' }, h('b', null, 'Subject: '), m.subject), h('hr', { style: { border: 'none', borderTop: '1px solid #dbe6ee', margin: '8px 0' } }), h('div', null, m.body));
    if (m.kind === 'url') return h('div', { class: 'mock' }, h('div', { class: 'urlbar' }, m.lock ? '🔒' : '⚠️', ' ', m.url), h('div', null, m.body));
    if (m.kind === 'popup') return h('div', { class: 'mock', style: { background: '#fff6bf', borderColor: '#f2645a', textAlign: 'center' } }, h('b', null, m.title), h('p', { class: 'mt8' }, m.body), m.btn ? h('span', { class: 'btn mint sm mt8', style: { pointerEvents: 'none' } }, m.btn) : null);
    if (m.kind === 'post') return h('div', { class: 'postcard' }, h('div', { class: 'who2' }, m.who + ' (pretend)'), h('div', { style: { fontSize: '2.4rem', margin: '4px 0' } }, m.em || ''), h('div', null, m.text));
    if (m.kind === 'note') return h('div', { class: 'mock' }, m.text);
    return null;
  }
  S.mockEl = mockEl;

  /* ---------- kindness + privacy check for typed text (runs only on this device, nothing is stored) ---------- */
  const MEAN = ['stupid', 'dumb', 'ugly', 'idiot', 'loser', 'hate you', 'shut up', 'freak', 'weirdo', 'nobody likes', 'go away', 'useless', 'pathetic', 'moron', 'you suck', 'so annoying', 'worst ever'];
  const SEVERE = ['kill yourself', 'kys', 'go die', 'hope you die'];
  S.checkText = function (text) {
    const t = ' ' + String(text).toLowerCase() + ' ', flags = [];
    if (SEVERE.some(w => t.indexOf(w) >= 0)) flags.push({ k: 'severe', msg: 'Those words can really hurt someone, and they are never OK. If someone ever says that to you, tell a grown-up straight away. Let’s write something kind instead.' });
    else if (MEAN.some(w => t.indexOf(w) >= 0)) flags.push({ k: 'mean', msg: 'Hmm, this might sting. How could you say it in a way that you’d like to read yourself?' });
    if (/\b\d{3}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/.test(text) || /\S+@\S+\.\S+/.test(text) || /\b\d{1,4}\s+[a-z]+\s+(street|road|st|rd|avenue|ave|lane|drive|close|park|court)\b/i.test(text) || /\b(i live (at|in|on)|my address|my phone|my number|my school is|my password|my email)\b/i.test(text))
      flags.push({ k: 'private', msg: 'This looks like private information (a phone number, address, email or school). Keep that off posts and comments.' });
    const letters = text.replace(/[^a-z]/gi, '');
    if (letters.length >= 8 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.7) flags.push({ k: 'caps', msg: 'ALL CAPS can feel like shouting. Try normal letters.' });
    if (text.trim().length < 6) flags.push({ k: 'short', msg: 'Write a little more so it feels friendly.' });
    return flags;
  };

  /* ---------- password meter (practice only) ---------- */
  S.passScore = function (p) {
    const checks = [
      ['12 or more letters, numbers or symbols', p.length >= 12],
      ['More than one word (try three random words)', /[\s\-._]/.test(p) || /[a-z][A-Z]/.test(p)],
      ['A mix: numbers, capitals or symbols too', (/\d/.test(p) ? 1 : 0) + (/[A-Z]/.test(p) ? 1 : 0) + (/[^A-Za-z0-9]/.test(p) ? 1 : 0) >= 2],
      ['Not common or guessable (no “password”, “1234”, your name…)', !/(password|1234|qwerty|abc|letmein|iloveyou|admin)/i.test(p) && p.length > 0]
    ];
    return { checks, score: checks.filter(c => c[1]).length };
  };

  /* ---------- the runner ---------- */
  S.run = function (spec, opts) {
    // spec: {id, title, emoji, take, steps}; opts: {zone, back}
    const band = CA.bandIdx(), steps = spec.steps, total = steps.length;
    let idx = 0, points = 0, scored = 0;
    const root = h('div', null), body = h('div', null), dots = h('div', { class: 'row', style: { justifyContent: 'center', gap: '6px', margin: '10px 0' } });
    root.append(dots, body);
    const drawDots = () => { dots.innerHTML = ''; steps.forEach((s, i) => dots.append(h('span', { style: { width: '10px', height: '10px', borderRadius: '50%', background: i < idx ? '#12b58c' : i === idx ? '#2f7de1' : '#dbe6ee', display: 'inline-block' } }))); };
    function nextBtn(label) { return h('button', { class: 'btn mint wide mt16', onclick: () => { idx++; show(); } }, label || 'Next ➜'); }
    function qHead(q) { const el = h('h3', { style: { marginTop: '6px' } }, q, ' ', band <= 1 ? CA.sayBtn(q) : null); if (band === 0) CA.after(() => CA.say(q), 250); return el; }
    function gain(v) { points += v; scored++; }

    function show() {
      CA.closeModal(); body.innerHTML = ''; drawDots();
      if (idx >= total) return end();
      const s = steps[idx]; STEP[s.type](s);
      window.scrollTo(0, 0);
    }
    const STEP = {};

    STEP.info = s => {
      body.append(h('div', { class: 'card calm' }, h('h3', null, s.title || ''), s.mock ? mockEl(s.mock) : null, h('p', { class: 'mt8' }, s.text, ' ', CA.sayBtn(s.text))), nextBtn(idx === total - 1 ? 'Finish ➜' : 'Next ➜'));
      if (band === 0) CA.after(() => CA.say(s.text), 250);
    };

    STEP.choose = s => {
      let first = true, solved = false; const box = h('div', null), why = h('div', { class: 'hide' });
      body.append(h('div', { class: 'card' }, qHead(s.q), mockEl(s.mock), box, why));
      CA.shuffle(s.opts).forEach(o => {
        const b = h('button', { class: 'opt', onclick: () => {
          if (solved) return;
          if (o.good) { solved = true; b.classList.add('good'); CA.sfx.ok(); gain(first ? 1 : 0.5); show2('good', '✅ ' + o.why); body.append(nextBtn(idx === total - 1 ? 'Finish ➜' : 'Next ➜')); }
          else { first = false; b.classList.add('try'); CA.sfx.bad(); show2('try', '🔍 Let’s look closer. ' + o.why); }
        } }, o.t);
        box.append(b);
      });
      function show2(cls, txt) { why.className = 'why ' + cls; why.textContent = txt; if (cls === 'good' && band <= 1) why.append(' ', CA.sayBtn(txt.replace(/^✅ /, ''))); }
    };

    STEP.sort = s => {
      let sel = null, wrongFirst = 0, placed = 0, firstTry = {}; const note = h('div', { class: 'feedback' });
      const cards = h('div', { style: { textAlign: 'center' } }), bks = [h('div', { class: 'bk' }, h('h4', null, s.left.e + ' ' + s.left.n)), h('div', { class: 'bk' }, h('h4', null, s.right.e + ' ' + s.right.n))];
      const hold = s.cards.map((c, i) => { const el = h('button', { class: 'sortcard', onclick: () => { if (el.dataset.done) return; cards.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); sel = i; el.classList.add('sel'); note.textContent = 'Now tap a box.'; note.className = 'feedback'; } }, c.t); cards.append(el); return el; });
      bks.forEach((b, side) => b.addEventListener('click', () => {
        if (sel == null) { note.textContent = 'Tap a card first.'; return; }
        const c = s.cards[sel], el = hold[sel];
        if ((side === 0 ? 'l' : 'r') === c.side) {
          el.dataset.done = '1'; el.classList.remove('sel'); b.append(h('div', { class: 'small' }, '✔ ', c.t)); el.classList.add('hide'); CA.sfx.ok(); placed++; sel = null;
          if (firstTry[c.t] === undefined) firstTry[c.t] = 1;
          note.textContent = c.why ? '✅ ' + c.why : '✅ Yes!'; note.className = 'feedback good';
          if (placed === s.cards.length) { gain(Object.values(firstTry).reduce((a, v) => a + v, 0) / s.cards.length); body.append(nextBtn(idx === total - 1 ? 'Finish ➜' : 'Next ➜')); }
        } else { firstTry[c.t] = 0; wrongFirst++; CA.sfx.bad(); note.textContent = '🔍 Let’s look closer: ' + (c.hint || 'try the other box.'); note.className = 'feedback bad'; }
      }));
      body.append(h('div', { class: 'card' }, qHead(s.q), cards, h('div', { class: 'row mt12', style: { alignItems: 'stretch' } }, bks), note));
    };

    STEP.spot = s => {
      const hots = s.parts.filter(p => typeof p === 'object' && p.hot), found = new Set(); let wrong = 0; const list = h('div', { class: 'small mt8' }), note = h('div', { class: 'feedback' });
      const textEl = h('div', null, s.parts.map((p, i) => {
        if (typeof p === 'string') return p;
        const sp = h('span', { class: p.hot ? 'hot' : '', style: { cursor: 'pointer', padding: '0 1px' }, onclick: () => {
          if (found.has(i)) return;
          if (p.hot) { found.add(i); sp.classList.add('found'); CA.sfx.ok(); list.append(h('div', null, '🚩 ', h('b', null, p.t), ': ', p.why)); note.textContent = ''; if (found.size === hots.length) { gain(wrong === 0 ? 1 : 0.5); body.append(nextBtn(idx === total - 1 ? 'Finish ➜' : 'Next ➜')); note.textContent = '🎉 You found every warning sign!'; note.className = 'feedback good'; } }
          else { wrong++; CA.sfx.bad(); note.textContent = '🔍 That part looks OK. Look for other warning signs.'; note.className = 'feedback bad'; }
        } }, p.t);
        return sp;
      }));
      body.append(h('div', { class: 'card' }, qHead(s.q), h('div', { class: 'mock' }, s.mock ? mockEl(s.mock) : null, textEl), h('p', { class: 'small muted' }, 'Tap the parts that look suspicious. (' + hots.length + ' to find)'), list, note));
    };

    STEP.pass = s => {
      const inp = h('input', { class: 'inp mono', placeholder: 'Make up a practice password…', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', maxlength: 40 }), meter = h('div', { class: 'meter mt8' }, h('i')), list = h('div', { class: 'small mt8' }); let ready = false;
      const upd = () => { const r = S.passScore(inp.value); meter.firstChild.style.width = (r.score * 25) + '%'; meter.firstChild.style.background = r.score >= 4 ? '#12b58c' : r.score >= 3 ? '#f5b83d' : '#f2645a'; list.innerHTML = ''; r.checks.forEach(c => list.append(h('div', null, (c[1] ? '✅ ' : '⬜ ') + c[0]))); if (r.score >= 3 && !ready) { ready = true; gain(1); CA.sfx.win(); body.append(nextBtn(idx === total - 1 ? 'Finish ➜' : 'Next ➜')); } };
      inp.addEventListener('input', upd); CA.onLeave(() => { inp.value = ''; });
      body.append(h('div', { class: 'card' }, qHead(s.q || 'Build a strong practice password'), h('div', { class: 'card warm' }, '⚠️ This is just practice. ', h('b', null, 'Never type a real password here'), '. Make one up, and never reuse a practice one for real!'), inp, meter, list, h('p', { class: 'small muted mt8' }, 'Idea: three random words with a number, like purple-tiger-lamp-42. Nothing you type is saved or sent.')));
      upd(); ready = false;
    };

    STEP.toggles = s => {
      const state = s.items.map(i => i.on), note = h('div', { class: 'feedback' }); let tries = 0;
      const list = h('div', null, s.items.map((it, i) => h('label', { class: 'toggle' }, h('span', null, it.label), h('input', { type: 'checkbox', checked: it.on, onchange: e => { state[i] = e.target.checked; } }))));
      const btn = h('button', { class: 'btn mt12', onclick: () => {
        tries++; const bad = s.items.filter((it, i) => state[i] !== it.want);
        if (!bad.length) { CA.sfx.win(); note.textContent = '✅ Locked down. Nicely done!'; note.className = 'feedback good'; btn.remove(); gain(tries === 1 ? 1 : 0.5); body.append(nextBtn(idx === total - 1 ? 'Finish ➜' : 'Next ➜')); }
        else { CA.sfx.bad(); note.className = 'feedback bad'; note.textContent = '🔍 Look again at: “' + bad[0].label + '”. ' + bad[0].why; }
      } }, '🔒 Check my settings');
      body.append(h('div', { class: 'card' }, qHead(s.q), h('div', { class: 'mock' }, list), btn, note));
    };

    STEP.compose = s => {
      let tries = 0, n = 0; const posts = s.posts; const box = h('div', null), note = h('div', { class: 'why hide' });
      function draw() {
        box.innerHTML = ''; note.className = 'why hide'; const p = posts[n];
        const ta = h('textarea', { class: 'inp', rows: 3, placeholder: p.prompt || 'Write a friendly comment…', maxlength: 160, style: { resize: 'none' } });
        box.append(mockEl(S.post(p.who, p.text, p.em)), ta, h('button', { class: 'btn mt8', onclick: () => {
          const fl = S.checkText(ta.value); tries++;
          if (!fl.length) { CA.sfx.ok(); note.className = 'why good'; note.textContent = '✅ ' + (s.praise || 'That is friendly and safe. Lovely!'); gain(tries === 1 ? 1 : 0.5); tries = 0; ta.value = ''; n++; box.querySelectorAll('button').forEach(b => b.remove()); ta.disabled = true; const more = n < posts.length; const nb = more ? h('button', { class: 'btn mint wide mt16', onclick: () => { nb.remove(); draw(); } }, 'Next ➜') : nextBtn(idx === total - 1 ? 'Finish ➜' : 'Next ➜'); body.append(nb); }
          else { CA.sfx.bad(); note.className = 'why try'; note.textContent = '🔍 ' + fl.map(f => f.msg).join(' '); }
        } }, 'Check it, then post (pretend)'));
        box.append(note);
      }
      body.append(h('div', { class: 'card' }, qHead(s.q), h('p', { class: 'small muted' }, '🔒 What you type here stays on this screen. It is not saved, not sent, and nobody else will ever see it.'), box)); draw();
    };

    STEP.breathe = s => {
      const circle = h('div', { style: { width: '120px', height: '120px', borderRadius: '50%', background: '#bfe9d9', margin: '16px auto', display: 'grid', placeItems: 'center', fontWeight: 800, transition: 'transform 4s ease-in-out', color: '#0b6b52' } }, 'Ready?');
      const btn = h('button', { class: 'btn mint', onclick: () => {
        btn.remove(); let c = 0;
        const cycle = () => { if (c >= 3) { circle.textContent = '😌'; circle.style.transform = 'scale(1)'; body.append(nextBtn(idx === total - 1 ? 'Finish ➜' : 'Next ➜')); return; } c++; circle.textContent = 'Breathe in…'; circle.style.transform = 'scale(1.5)'; CA.after(() => { circle.textContent = 'Hold…'; CA.after(() => { circle.textContent = 'Breathe out…'; circle.style.transform = 'scale(1)'; CA.after(cycle, 4000); }, 1500); }, 4000); };
        cycle();
      } }, 'Start');
      body.append(h('div', { class: 'card calm center' }, h('h3', null, s.title || 'Take a calm moment'), h('p', { class: 'muted mt8' }, s.text || 'Before you answer a message when you feel cross or upset, try three slow breaths.'), circle, btn, h('button', { class: 'btn ghost sm mt8', onclick: () => { idx++; show(); } }, 'Skip')));
    };

    function end() {
      const frac = scored ? points / scored : 1, stars = frac >= 0.85 ? 3 : frac >= 0.6 ? 2 : 1;
      CA.record(spec.id, stars);
      body.append(h('div', { class: 'card calm center' }, h('div', { class: 'bigem' }, spec.emoji), h('h2', null, 'Well done!'), h('div', { class: 'mt8' }, CA.starsEl(stars)), h('p', { class: 'mt12', style: { fontWeight: 800 } }, spec.take), spec.take ? h('div', { class: 'mt8' }, CA.sayBtn(spec.take)) : null,
        h('div', { class: 'wrapx mt16', style: { justifyContent: 'center' } }, h('button', { class: 'btn sun', onclick: () => CA.render() }, 'Play again 🔁'), h('button', { class: 'btn mint', onclick: () => CA.go(opts.back) }, 'Keep going ➜'))));
      if (stars >= 2) CA.confetti(); CA.sfx.win();
    }
    show();
    return root;
  };

  S.screen = function (zoneId, list) {
    return function (parts) {
      const spec = list.find(x => x.id === parts[1]);
      if (!spec) return h('p', null, 'Not found');
      document.getElementById('app').style.setProperty('--c', CA.zone(zoneId).color);
      return h('div', null, CA.topbar(spec.title, '/zone/' + zoneId, CA.starPill()), S.run(spec, { back: '/zone/' + zoneId }));
    };
  };
})();
