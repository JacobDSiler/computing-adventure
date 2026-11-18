/* Computing Adventure - short arcade games. No lives lost, no game over screens, just stars. */
(function () {
  'use strict';
  const CA = window.CA, h = CA.h;

  const GAMES = [
    { id: 'g-rain', emoji: '🌧️', title: 'Letter Rain', blurb: 'Type or tap the falling letters', min: 0 },
    { id: 'g-dash', emoji: '🚀', title: 'Word Dash', blurb: 'Type as many words as you can in a minute', min: 1 },
    { id: 'g-bubble', emoji: '🫧', title: 'Bubble Pop', blurb: 'Click the bubbles (great mouse practice)', min: 0 },
    { id: 'g-risk', emoji: '🚦', title: 'Click or Skip?', blurb: 'Quick! Is it safe to click?', min: 1 },
    { id: 'g-short', emoji: '⚡', title: 'Shortcut Match', blurb: 'Press the right keys for each job', min: 2 }
  ];
  CA.games = GAMES;

  function shell(g, extra) {
    document.getElementById('app').style.setProperty('--c', '#f2645a');
    const wrap = h('div', null, CA.topbar(g.title, '/games', CA.starPill()));
    return wrap;
  }
  function finishGame(g, stars, score, lines) {
    CA.recordGame(g.id, stars, score);
    CA.finish({ title: g.title + ' finished!', stars, lines, again: () => CA.render(), back: '/games' });
  }
  function bandPick(arr) { return arr[CA.bandIdx()]; }

  /* ---- keyboard feed (physical keys + tablet keyboard) ---- */
  function typed(onChar) {
    const soft = document.getElementById('softkb');
    const kd = e => { if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing || e.key === 'Unidentified' || e.keyCode === 229) return; if (e.key.length === 1) { e.preventDefault(); onChar(e.key); } };
    const inp = e => { if (e.data) for (const c of e.data) onChar(c); soft.value = ''; };
    document.addEventListener('keydown', kd); soft.addEventListener('input', inp);
    CA.onLeave(() => { document.removeEventListener('keydown', kd); soft.removeEventListener('input', inp); soft.blur(); });
    return { focus() { try { soft.focus({ preventScroll: true }); } catch (e) { } } };
  }

  const RUN = {};

  RUN['g-rain'] = function (g, wrap) {
    const set = bandPick(['asdfjkl', 'asdfjklgheiru', 'abcdefghijklmnopqrstuvwxyz', 'abcdefghijklmnopqrstuvwxyz']).split('');
    const speed = bandPick([28, 45, 60, 75]), every = bandPick([1500, 1100, 850, 700]), DUR = 45;
    const stage = h('div', { class: 'stage', style: { background: 'linear-gradient(#dff1ff,#fff)' } }), hud = h('div', { class: 'stat' }, h('div', null, h('b', null, '45'), 'seconds'), h('div', null, h('b', null, '0'), 'popped'));
    wrap.append(hud, stage, h('p', { class: 'center muted small mt8' }, 'Type the letter to pop it, or tap it. Letters that land just fade away.'));
    const ti = typed(c => pop(c.toLowerCase())); const kb = h('button', { class: 'btn sun wide mt12', onclick: () => ti.focus() }, '⌨️ Tap for tablet keyboard'); if (navigator.maxTouchPoints > 0) wrap.append(kb);
    let L = [], pops = 0, left = DUR, last = performance.now(), spawnAt = 0, raf = 0, over = false;
    function spawn() { const ch = CA.pick(set), W = stage.clientWidth || 600, el = h('div', { class: 'tgt', style: { width: '48px', height: '48px', fontWeight: 800, fontSize: '1.5rem', left: Math.round(10 + Math.random() * (W - 70)) + 'px', top: '-50px', background: CA.pick(['#f5b83d', '#8fd3ff', '#b8f2d0', '#ffc2d9']), cursor: 'pointer' } }, ch.toUpperCase()); const o = { el, ch, y: -50 }; el.addEventListener('pointerdown', () => kill(o, true)); stage.append(el); L.push(o); }
    function kill(o, hit) { if (!o.dead) { o.dead = true; if (hit) { pops++; CA.sfx.ok(); o.el.textContent = '✨'; hud.children[1].firstChild.textContent = pops; } setTimeout(() => o.el.remove(), 200); L = L.filter(x => x !== o); } }
    function pop(c) { const m = L.filter(o => o.ch === c).sort((a, b) => b.y - a.y)[0]; if (m) kill(m, true); else CA.sfx.bad(); }
    function loop(t) {
      if (over) return; const dt = Math.min(0.05, (t - last) / 1000); last = t; left -= dt; spawnAt -= dt * 1000;
      if (spawnAt <= 0) { spawn(); spawnAt = every; }
      const H = stage.clientHeight || 360;
      L.slice().forEach(o => { o.y += speed * dt * (1 + (DUR - left) / 90); o.el.style.top = o.y + 'px'; if (o.y > H - 40) { o.el.style.opacity = .2; kill(o, false); } });
      hud.children[0].firstChild.textContent = Math.max(0, Math.ceil(left));
      if (left <= 0) { over = true; const T = bandPick([[8, 14], [12, 20], [16, 26], [18, 30]])[0], U = bandPick([[8, 14], [12, 20], [16, 26], [18, 30]])[1]; return finishGame(g, pops >= U ? 3 : pops >= T ? 2 : 1, pops, ['You popped ' + pops + ' letters.']); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop); CA.onLeave(() => { over = true; cancelAnimationFrame(raf); });
  };

  RUN['g-dash'] = function (g, wrap) {
    const maxLen = bandPick([3, 4, 6, 9]), words = CA.keysApi.WORDS.filter(w => w.length >= 2 && w.length <= maxLen && /^[a-z]+$/.test(w));
    const box = h('div', { class: 'tbox big' }), hud = h('div', { class: 'stat' }, h('div', null, h('b', null, '60'), 'seconds'), h('div', null, h('b', null, '0'), 'words'));
    const rocket = h('div', { style: { fontSize: '2.4rem', transition: 'margin-left .3s', marginLeft: '0%' } }, '🚀'); const track = h('div', { class: 'card flat' }, rocket);
    wrap.append(hud, box, track, h('p', { class: 'center muted small' }, 'Type the word. Wrong keys never hurt: just keep going.'));
    const ti = typed(c => key(c)); if (navigator.maxTouchPoints > 0) wrap.append(h('button', { class: 'btn sun wide mt12', onclick: () => ti.focus() }, '⌨️ Tap for tablet keyboard'));
    let w = '', p = 0, n = 0, left = 60, over = false; const tick = setInterval(() => { left--; hud.children[0].firstChild.textContent = left; if (left <= 0 && !over) { over = true; clearInterval(tick); const th = bandPick([[3, 6], [6, 12], [10, 18], [14, 24]]); finishGame(g, n >= th[1] ? 3 : n >= th[0] ? 2 : 1, n, ['You typed ' + n + ' words.']); } }, 1000); CA.onLeave(() => { over = true; clearInterval(tick); });
    function next() { w = CA.pick(words); p = 0; draw(); }
    function draw() { box.innerHTML = ''; w.split('').forEach((c, i) => box.append(h('span', { class: i < p ? 'ok' : i === p ? 'cur' : '' }, c))); }
    function key(c) { if (over) return; if (c.toLowerCase() === w[p]) { p++; CA.sfx.click(); if (p >= w.length) { n++; CA.sfx.ok(); hud.children[1].firstChild.textContent = n; rocket.style.marginLeft = Math.min(90, n * 6) + '%'; next(); } else draw(); } else { CA.sfx.bad(); box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); } }
    next();
  };

  RUN['g-bubble'] = function (g, wrap) {
    const stage = h('div', { class: 'stage', style: { background: 'linear-gradient(#e8f6ff,#bfe3ff)' } }), hud = h('div', { class: 'stat' }, h('div', null, h('b', null, '30'), 'seconds'), h('div', null, h('b', null, '0'), 'popped'));
    wrap.append(hud, stage, h('p', { class: 'center muted small mt8' }, 'Click or tap the bubbles before they float away.'));
    let pops = 0, left = 30, over = false;
    const sz = bandPick([84, 70, 58, 50]);
    const mk = () => { const W = stage.clientWidth || 600, d = sz + CA.rand(24), el = h('div', { class: 'tgt', style: { width: d + 'px', height: d + 'px', left: Math.round(Math.random() * (W - d)) + 'px', top: (stage.clientHeight || 360) + 'px', background: 'radial-gradient(circle at 30% 30%,#fff,#8fd3ff)', transition: 'top ' + (4 + Math.random() * 2) + 's linear', cursor: 'pointer' } }, ''); el.addEventListener('pointerdown', () => { if (el.dataset.d) return; el.dataset.d = 1; pops++; CA.sfx.ok(); el.textContent = '✨'; hud.children[1].firstChild.textContent = pops; setTimeout(() => el.remove(), 180); }); stage.append(el); requestAnimationFrame(() => requestAnimationFrame(() => { el.style.top = (-d - 10) + 'px'; })); setTimeout(() => el.remove(), 6500); };
    const sp = setInterval(mk, bandPick([1100, 850, 700, 600])), tm = setInterval(() => { left--; hud.children[0].firstChild.textContent = left; if (left <= 0 && !over) { over = true; clearInterval(sp); clearInterval(tm); finishGame(g, pops >= 20 ? 3 : pops >= 12 ? 2 : 1, pops, ['You popped ' + pops + ' bubbles.']); } }, 1000);
    CA.onLeave(() => { over = true; clearInterval(sp); clearInterval(tm); }); mk();
  };

  const RISK = [
    ['A pop-up says: 🎉 YOU WON A FREE TABLET! CLAIM NOW!', true, 'Surprise prizes are tricks.', 0], ['A link your teacher shared in the class page', false, 'From a trusted grown-up in a place you know. (If you are ever unsure, ask first.)', 0],
    ['A stranger writes: “Click here for free game gems!”', true, 'Strangers offering free stuff are a trick.', 0], ['An email: “Your account will be DELETED in 24 hours! Click to log in.”', true, 'Rushing and threats are classic scam signs.', 2],
    ['A link from your parent to the family photo album', false, 'From someone you trust, about something you expect.', 0], ['A game asks you to download a “free skins” file', true, 'Free skins files are often viruses.', 1],
    ['A text from an unknown number: “Is this you in this video?” + link', true, 'Unknown numbers and curious links are a trap.', 2], ['The Back button in your browser', false, 'Going back is always safe.', 0],
    ['An ad: “Your computer is SLOW! Click to fix it!”', true, 'Real fixes do not come from ads.', 1], ['An app a grown-up approved in the official app store', false, 'Official store plus a grown-up is a good check.', 1],
    ['A “friend” says: “Type your password so I can fix your account”', true, 'Never give your password to anyone but your own grown-ups.', 0], ['A site you never heard of asks to send you notifications', true, 'Click Block. You can always allow later.', 2],
    ['A video link from your favourite channel on the real site', false, 'Opening a video you chose on the real site is fine.', 0], ['A message: “Hi! I’m new at your school. What’s your address?”', true, 'Never share your address, even if they seem nice.', 1],
    ['The small ✕ on a pop-up ad', false, 'The small ✕ is the safe way out.', 0], ['A text from “Bank”: “Tap to confirm your card details”', true, 'Banks do not ask like that. Tell a grown-up.', 3]
  ];
  RUN['g-risk'] = function (g, wrap) {
    const cards = CA.shuffle(RISK.filter(r => r[3] <= CA.bandIdx())).slice(0, 10); let i = 0, right = 0;
    const box = h('div', { class: 'card' }), why = h('div', { class: 'why hide' });
    wrap.append(h('div', { class: 'center muted small' }, 'Would you click it?'), box, why);
    function show() {
      if (i >= cards.length) return finishGame(g, right >= 9 ? 3 : right >= 7 ? 2 : 1, right, ['You judged ' + right + ' of ' + cards.length + ' correctly.']);
      const c = cards[i]; why.className = 'why hide'; box.innerHTML = '';
      box.append(h('div', { class: 'mock', style: { fontWeight: 800, fontSize: '1.1rem' } }, c[0]), h('div', { class: 'wrapx mt12' },
        h('button', { class: 'btn mint', style: { flex: 1 }, onclick: () => ans(false) }, '👍 Safe to click'), h('button', { class: 'btn coral', style: { flex: 1 }, onclick: () => ans(true) }, '🚫 Skip it')));
      CA.say(c[0]);
    }
    function ans(skip) { const c = cards[i], ok = skip === c[1]; if (ok) { right++; CA.sfx.ok(); } else CA.sfx.bad(); why.className = 'why ' + (ok ? 'good' : 'try'); why.textContent = (ok ? '✅ ' : '🔍 Let’s look closer. ') + c[2]; box.querySelectorAll('button').forEach(b => b.disabled = true); i++; CA.after(show, 2200); }
    show();
  };

  RUN['g-short'] = function (g, wrap) {
    const JOBS = CA.shuffle([['c', 'COPY'], ['v', 'PASTE'], ['x', 'CUT'], ['z', 'UNDO'], ['a', 'SELECT ALL'], ['s', 'SAVE'], ['c', 'COPY'], ['v', 'PASTE'], ['z', 'UNDO'], ['a', 'SELECT ALL']]);
    let i = 0, slips = 0; const box = h('div', { class: 'tbox big' }), note = h('div', { class: 'feedback center' });
    wrap.append(h('div', { class: 'card warm' }, 'Hold ', h('b', null, 'Ctrl'), ' (or ⌘ on a Mac) and tap the letter. Needs a real keyboard.'), box, note);
    const kd = e => { if (!(e.ctrlKey || e.metaKey)) return; const k = e.key.toLowerCase(); if (['control', 'meta'].indexOf(k) >= 0) return; e.preventDefault(); if (k === JOBS[i][0]) { CA.sfx.ok(); i++; if (i >= JOBS.length) { document.removeEventListener('keydown', kd); return finishGame(g, slips <= 1 ? 3 : slips <= 4 ? 2 : 1, JOBS.length, ['Slips: ' + slips]); } draw(); } else { slips++; CA.sfx.bad(); note.textContent = 'Not that one. Try Ctrl + ' + JOBS[i][0].toUpperCase(); } };
    document.addEventListener('keydown', kd); CA.onLeave(() => document.removeEventListener('keydown', kd));
    function draw() { box.innerHTML = ''; box.append(h('div', null, JOBS[i][1]), h('div', { class: 'small muted' }, (i + 1) + ' of ' + JOBS.length)); note.textContent = ''; }
    draw();
  };

  GAMES.forEach(g => { RUN[g.id] = RUN[g.id]; });
  CA.screens.games = function () {
    document.getElementById('app').style.setProperty('--c', '#f2645a');
    const w = h('div', null, CA.topbar('Games', '/', CA.starPill())), pr = CA.PR();
    GAMES.filter(g => CA.bandIdx() >= g.min || CA.D().showAll).forEach(g => {
      const rec = pr.games[g.id] || {};
      w.append(h('button', { class: 'labcard', onclick: () => CA.go('/game/' + g.id) }, h('span', { class: 'em' }, g.emoji), h('span', { style: { flex: 1 } }, h('b', null, g.title), h('span', { class: 'd' }, g.blurb + (rec.best ? ' · best ' + rec.best : ''))), CA.starsEl(rec.stars || 0)));
    });
    return w;
  };
  CA.screens.game = function (parts) {
    const g = GAMES.find(x => x.id === parts[1]); if (!g) return h('p', null, 'Game not found');
    const wrap = shell(g); setTimeout(() => RUN[g.id](g, wrap), 0); return wrap;
  };
})();
