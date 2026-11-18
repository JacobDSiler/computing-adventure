/* Computing Adventure - core: helpers, storage, progress, sync, router, home screens.
 * Plain JS, no build step. Modules: ca-keys (keyboarding), ca-mouse, ca-sim (desktop quests), ca-scenes + ca-safe (Safe Harbor),
 * ca-kind (Kind Corner), ca-oops (the "something went wrong" helper), ca-games, ca-parent. */
(function () {
  'use strict';
  const CA = window.CA = window.CA || {};
  CA.VERSION = '1.0.0';
  CA.items = { keys: [], mouse: [], desk: [], safe: [], kind: [] };
  CA.screens = CA.screens || {};
  CA.games = CA.games || [];

  /* ================= DOM helpers ================= */
  const SVGNS = 'http://www.w3.org/2000/svg';
  function applyProps(el, props) {
    if (!props) return;
    for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.slice(0, 2) === '--') el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; } }
      else if (k === 'html') el.innerHTML = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  function kids(el, list) { for (const c of list.flat(Infinity)) { if (c == null || c === false) continue; el.append(c.nodeType ? c : document.createTextNode(String(c))); } }
  const h = CA.h = function (tag, props, ...list) { const el = document.createElement(tag); applyProps(el, props); kids(el, list); return el; };
  CA.s = function (tag, props, ...list) { const el = document.createElementNS(SVGNS, tag); applyProps(el, props); kids(el, list); return el; };
  const $ = CA.$ = (sel, root) => (root || document).querySelector(sel);
  CA.rand = n => Math.floor(Math.random() * n);
  CA.pick = a => a[Math.floor(Math.random() * a.length)];
  CA.shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  CA.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ================= cleanup registry ================= */
  let cleanups = [];
  CA.onLeave = fn => { cleanups.push(fn); };
  CA.cleanup = () => { const c = cleanups; cleanups = []; c.forEach(fn => { try { fn(); } catch (e) { } }); try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } };
  CA.every = (fn, ms) => { const id = setInterval(fn, ms); CA.onLeave(() => clearInterval(id)); return id; };
  CA.after = (fn, ms) => { const id = setTimeout(fn, ms); CA.onLeave(() => clearTimeout(id)); return id; };
  CA.listen = (target, ev, fn, opts) => { target.addEventListener(ev, fn, opts); CA.onLeave(() => target.removeEventListener(ev, fn, opts)); };

  /* ================= sound + speech ================= */
  let actx = null;
  function beep(freqs, dur, type) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      let t = actx.currentTime;
      freqs.forEach(f => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.14, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + 0.02); t += dur * 0.8;
      });
    } catch (e) { }
  }
  CA.sfx = {
    ok() { if (D.sound) beep([660, 880], 0.09); }, bad() { if (D.sound) beep([220], 0.12, 'triangle'); },
    click() { if (D.sound) beep([520], 0.04); }, win() { if (D.sound) beep([523, 659, 784, 1047], 0.12); }, star() { if (D.sound) beep([784, 988], 0.09); }
  };
  CA.say = function (text) {
    if (!D.tts) return;
    try {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, ''));
      u.rate = 0.9; u.pitch = 1.05; u.lang = 'en-GB'; speechSynthesis.speak(u);
    } catch (e) { }
  };
  CA.sayBtn = text => h('button', { class: 'say', 'aria-label': 'Read aloud', onclick: e => { e.stopPropagation(); CA.sayForce(text); } }, '🔊');
  CA.sayForce = function (text) { const old = D.tts; D.tts = true; CA.say(text); D.tts = old; };

  /* ================= storage ================= */
  const KEY = 'ca_v1';
  const defaults = () => ({ v: 1, profiles: [], cur: null, prog: {}, pin: '', fam: '', famPin: '', sound: true, tts: true, layout: 'ie', region: 'IE', speed: false, showAll: false, hide: {} });
  function load() { try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { return defaults(); } }
  let D = load();
  CA.D = () => D;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { } scheduleSync(); }
  CA.save = save;

  /* ================= bands ================= */
  CA.BANDS = [
    { id: 'sprout', e: '🌱', name: 'Sprout', ages: '4–6', desc: 'Big buttons, letters, reading aloud' },
    { id: 'spark', e: '✨', name: 'Spark', ages: '7–8', desc: 'Home row, simple words, safe habits' },
    { id: 'player', e: '🚀', name: 'Pilot', ages: '9–11', desc: 'Real typing, shortcuts, scams and kindness online' },
    { id: 'maestro', e: '🧭', name: 'Captain', ages: '12+', desc: 'Speed, privacy, pressure, reputation' }
  ];
  CA.AVATARS = ['🦊', '🐱', '🐶', '🦉', '🐢', '🦋', '🌟', '🚀', '🌈', '🐸', '🦄', '🐼', '🐙', '🦁', '🐧', '🌻', '🐳', '🎨', '🐝', '🦜'];
  const bandFromGrade = g => { g = String(g); if (g === 'PS' || g === 'PK' || g === 'K') return 'sprout'; if (g === '1' || g === '2' || g === '3') return 'spark'; if (g === '4' || g === '5' || g === '6') return 'player'; return 'maestro'; };
  CA.P = () => D.profiles.find(p => p.id === D.cur) || null;
  CA.bandIdx = () => Math.max(0, CA.BANDS.findIndex(b => b.id === (CA.P() || {}).band));
  CA.band = () => (CA.P() || {}).band || 'spark';
  CA.visible = it => { if (D.hide[it.id]) return false; return D.showAll || (it.min || 0) <= CA.bandIdx(); };

  /* ================= progress ================= */
  const emptyPR = () => ({ done: {}, badges: {}, games: {} });
  function PR(pid) { pid = pid || D.cur; if (!pid) return null; const p = D.prog[pid] || (D.prog[pid] = emptyPR()); p.done = p.done || {}; p.badges = p.badges || {}; p.games = p.games || {}; return p; }
  CA.PR = PR;
  CA.stars = (id, pid) => ((PR(pid) || { done: {} }).done[id] || {}).stars || 0;
  CA.totalStars = pid => { const pr = PR(pid); if (!pr) return 0; let n = 0; for (const k in pr.done) n += pr.done[k].stars || 0; for (const k in pr.games) n += pr.games[k].stars || 0; return n; };
  CA.record = function (id, stars, extra) {
    const pr = PR(); if (!pr) return;
    const old = pr.done[id] || {};
    if (stars >= (old.stars || 0)) pr.done[id] = Object.assign({}, old, extra || {}, { stars, at: Date.now() });
    else pr.done[id] = Object.assign({}, old, { at: Date.now() });
    save(); checkBadges();
  };
  CA.recordGame = function (gid, stars, score) {
    const pr = PR(); if (!pr) return;
    const old = pr.games[gid] || { stars: 0, plays: 0 };
    pr.games[gid] = { stars: Math.max(old.stars || 0, stars), plays: (old.plays || 0) + 1, best: Math.max(old.best || 0, score || 0), at: Date.now() };
    save();
  };
  CA.ZONES = [
    { id: 'keys', e: '⌨️', title: 'Keyboard Cove', tag: 'Learn to type with all ten fingers', color: '#2f7de1', badge: { emoji: '🏝️', name: 'Keyboard Captain', earned: 'You can find your way around the keyboard!' }, big: 'Can my fingers learn where the keys are without looking?' },
    { id: 'mouse', e: '🖱️', title: 'Mouse Meadow', tag: 'Point, click, drag and scroll', color: '#12b58c', badge: { emoji: '🐭', name: 'Mouse Master', earned: 'Point, click, double-click, right-click, drag and scroll: all yours!' }, big: 'How do I tell the computer exactly what I mean?' },
    { id: 'desk', e: '🖥️', title: 'Desktop Quest', tag: 'Missions on a pretend computer', color: '#7b5cd6', badge: { emoji: '🗺️', name: 'Desktop Explorer', earned: 'Windows, files, settings and the web are no mystery now!' }, big: 'What is all this stuff on the screen, and what does it do?' },
    { id: 'safe', e: '🛡️', title: 'Safe Harbor', tag: 'Stay safe and private online', color: '#f2645a', badge: { emoji: '⚓', name: 'Harbor Guardian', earned: 'You know how to keep yourself and your family safe online!' }, big: 'How do I enjoy the internet and still stay safe?' },
    { id: 'kind', e: '💬', title: 'Kind Corner', tag: 'Be a good friend, in a pretend chat first', color: '#e0529c', badge: { emoji: '💛', name: 'Kind Connector', earned: 'You think before you post, and you look out for others!' }, big: 'How do I treat people well when I can not see their faces?' }
  ];
  CA.zone = id => CA.ZONES.find(z => z.id === id);
  CA.zoneItems = id => CA.items[id].filter(CA.visible);
  CA.zoneStatus = function (z, pid) {
    const its = CA.items[z.id].filter(it => !D.hide[it.id] && (D.showAll || (it.min || 0) <= Math.max(0, CA.BANDS.findIndex(b => b.id === ((D.profiles.find(p => p.id === (pid || D.cur)) || {}).band))))), pr = PR(pid) || emptyPR();
    const done = its.filter(it => ((pr.done[it.id] || {}).stars || 0) > 0).length;
    return { done, total: its.length, pct: its.length ? Math.round(done / its.length * 100) : 0, badge: !!pr.badges[z.id] };
  };
  function checkBadges() {
    const pr = PR(); if (!pr) return;
    CA.ZONES.forEach(z => {
      const st = CA.zoneStatus(z);
      if (st.total && st.done === st.total && !pr.badges[z.id]) { pr.badges[z.id] = Date.now(); save(); setTimeout(() => CA.badgeModal(z), 700); }
    });
  }
  CA.badgeModal = function (z) {
    CA.confetti(); CA.sfx.win();
    CA.modal(h('div', null, h('div', { class: 'bigem' }, z.badge.emoji), h('h2', null, 'Badge earned!'),
      h('p', { class: 'mt8', style: { fontWeight: 800, fontSize: '1.2rem', color: z.color } }, z.badge.name), h('p', { class: 'muted mt8' }, z.badge.earned),
      h('div', { class: 'row mt16', style: { justifyContent: 'center' } }, h('button', { class: 'btn mint', onclick: () => CA.closeModal() }, 'Hooray! 🎉'))));
  };

  /* ================= overlays ================= */
  let modalEl = null;
  CA.closeModal = () => { if (modalEl) { modalEl.remove(); modalEl = null; } };
  CA.modal = function (content, opts) {
    CA.closeModal();
    modalEl = h('div', { class: 'modal', onclick: e => { if (e.target === modalEl && opts && opts.dismiss) CA.closeModal(); } }, h('div', { class: 'box' }, content));
    document.body.append(modalEl); return modalEl;
  };
  CA.toast = function (msg) { const t = h('div', { class: 'toast' }, msg); document.body.append(t); setTimeout(() => t.remove(), 2200); };
  CA.confetti = function () {
    const cols = ['#f5b83d', '#12b58c', '#f2645a', '#2f7de1', '#e0529c', '#7b5cd6'];
    for (let i = 0; i < 44; i++) {
      const c = h('i', { class: 'confetti', style: { left: Math.random() * 100 + 'vw', background: cols[i % cols.length], animationDelay: (Math.random() * 0.6) + 's', animationDuration: (2 + Math.random() * 1.6) + 's' } });
      document.body.append(c); setTimeout(() => c.remove(), 4200);
    }
  };
  CA.starsEl = (n, max) => { max = max || 3; const el = h('span', { class: 'stars' }); for (let i = 0; i < max; i++) el.append(h('span', { class: i < n ? '' : 'off' }, '⭐')); return el; };
  /* finish card shown at the end of any activity */
  CA.finish = function (opts) {
    // opts: {title, stars, lines:[], again:fn, back:path, message}
    CA.sfx.win(); if (opts.stars >= 2) CA.confetti();
    CA.modal(h('div', null, h('div', { class: 'bigem' }, opts.stars >= 3 ? '🌟' : opts.stars >= 1 ? '🎉' : '💪'), h('h2', null, opts.title || 'All done!'),
      h('div', { class: 'mt8' }, CA.starsEl(opts.stars)), (opts.lines || []).map(l => h('p', { class: 'mt8' }, l)), opts.message ? h('p', { class: 'muted mt8' }, opts.message) : null,
      h('div', { class: 'wrapx mt16', style: { justifyContent: 'center' } },
        opts.again ? h('button', { class: 'btn sun', onclick: () => { CA.closeModal(); opts.again(); } }, 'Again 🔁') : null,
        h('button', { class: 'btn mint', onclick: () => { CA.closeModal(); CA.go(opts.back || '/'); } }, 'Keep going ➜'))));
  };

  /* ================= cloud sync (optional; the app works offline) ================= */
  CA.FIREBASE = {
    apiKey: 'AIzaSyCxqGRhdCyh92LyiFvrTi6ETTiFKVhDvUM', authDomain: 'homeschool-math.firebaseapp.com', projectId: 'homeschool-math',
    storageBucket: 'homeschool-math.firebasestorage.app', messagingSenderId: '275309549483', appId: '1:275309549483:web:3c118499f22eb23e6f24ee'
  };
  let fbP = null;
  function fb() {
    if (fbP) return fbP;
    fbP = (async () => {
      try {
        const app = await import('https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js');
        const fs = await import('https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js');
        const a = app.getApps().length ? app.getApp() : app.initializeApp(CA.FIREBASE);
        return { fs, db: fs.getFirestore(a) };
      } catch (e) { fbP = null; return null; }
    })();
    return fbP;
  }
  function mergeProg(a, b) {
    const out = Object.assign({}, a);
    for (const pid of Object.keys(b || {})) {
      const x = out[pid] || emptyPR(), y = b[pid] || {};
      const m = { done: Object.assign({}, x.done), badges: Object.assign({}, y.badges || {}, x.badges), games: Object.assign({}, x.games) };
      for (const k in (y.done || {})) { const c = m.done[k]; if (!c || (y.done[k].stars || 0) > (c.stars || 0)) m.done[k] = y.done[k]; }
      for (const k in (y.games || {})) { const c = m.games[k]; if (!c || (y.games[k].stars || 0) > (c.stars || 0) || ((y.games[k].stars || 0) === (c.stars || 0) && (y.games[k].best || 0) > (c.best || 0))) m.games[k] = y.games[k]; }
      out[pid] = m;
    }
    return out;
  }
  async function cloudPull() {
    if (!D.fam) return false;
    const f = await fb(); if (!f) return false;
    try {
      const snap = await f.fs.getDoc(f.fs.doc(f.db, 'families', D.fam + '_ca'));
      if (snap.exists()) { D.prog = mergeProg(D.prog, snap.data().prog || {}); try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { } }
      return true;
    } catch (e) { return false; }
  }
  async function cloudPush() {
    if (!D.fam) return false;
    const f = await fb(); if (!f) return false;
    try { await cloudPull(); await f.fs.setDoc(f.fs.doc(f.db, 'families', D.fam + '_ca'), { app: 'computing-adventure', prog: D.prog, ts: Date.now() }, { merge: false }); return true; } catch (e) { return false; }
  }
  let syncT = null;
  function scheduleSync() { if (!D.fam) return; clearTimeout(syncT); syncT = setTimeout(cloudPush, 2500); }
  CA.syncNow = cloudPush;
  CA.fmtFam = v => { v = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); return v.length > 2 ? v.slice(0, 2) + '-' + v.slice(2, 6) : v; };
  CA.managed = () => { try { return sessionStorage.getItem('ca_harbor_managed') === '1'; } catch (e) { return false; } };
  CA.joinFamily = async function (code, mirror) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length === 6) code = code.slice(0, 2) + '-' + code.slice(2);
    if (!/^[A-Z]{2}-[A-Z0-9]{4}$/.test(code)) return { ok: false, msg: 'That code does not look right. A family code looks like MA-AB12.' };
    const f = await fb(); if (!f) return { ok: false, msg: 'Could not reach the cloud. Check the internet and try again.' };
    try {
      const snap = await f.fs.getDoc(f.fs.doc(f.db, 'families', code));
      if (!snap.exists()) return { ok: false, msg: 'No family found with that code.' };
      const fam = snap.data(); let added = 0;
      for (const p of (fam.profiles || [])) {
        const id = String(p.id), ex = D.profiles.find(x => x.id === id);
        if (!ex) { D.profiles.push({ id, name: p.name || 'Explorer', avatar: p.avatar || '🌟', band: bandFromGrade(p.gradeId) }); added++; }
        else if (mirror) { ex.name = p.name || ex.name; ex.avatar = p.avatar || ex.avatar; ex.band = bandFromGrade(p.gradeId) || ex.band; }
      }
      if (mirror && (fam.profiles || []).length) {
        const ids = new Set((fam.profiles || []).map(p => String(p.id)));
        D.profiles = D.profiles.filter(x => ids.has(x.id));
        if (!D.profiles.some(x => x.id === D.cur)) D.cur = D.profiles[0] ? D.profiles[0].id : null;
      }
      D.fam = code; D.famPin = fam.parentPin || '';
      if (!D.cur && D.profiles.length) D.cur = D.profiles[0].id;
      save(); await cloudPull(); save();
      return { ok: true, msg: added ? 'Joined! Added ' + added + ' explorer' + (added > 1 ? 's' : '') + '.' : 'Joined! Progress synced.', added };
    } catch (e) { return { ok: false, msg: 'Something went wrong joining. Try again.' }; }
  };
  CA.leaveFamily = () => { D.fam = ''; D.famPin = ''; save(); };

  /* ================= router ================= */
  CA.go = path => { if (location.hash === '#' + path) render(); else location.hash = '#' + path; };
  CA.back = fallback => { if (history.length > 1) history.back(); else CA.go(fallback || '/'); };
  function seg() { const raw = (location.hash.slice(1) || '/'); const [path, qs] = raw.split('?'); return { parts: path.split('/').filter(Boolean), qs: new URLSearchParams(qs || '') }; }
  CA.seg = seg;
  const NAV = [['/', '🏠', 'Home'], ['/games', '🎮', 'Games'], ['/oops', '💛', 'Help'], ['/badges', '🏅', 'Badges'], ['/parent', '🔒', 'Parents']];
  function navBar(active) { return h('nav', { class: 'nav' }, h('div', null, NAV.map(([p, e, t]) => h('button', { class: active === p ? 'on' : '', onclick: () => CA.go(p) }, h('span', { class: 'e' }, e), t)))); }
  CA.topbar = (title, backPath, right) => h('div', { class: 'topbar' }, h('button', { class: 'iconbtn', 'aria-label': 'Back', onclick: () => backPath ? CA.go(backPath) : CA.back('/') }, '←'), h('h2', null, title), right || null);
  CA.starPill = () => h('span', { class: 'starpill' }, '⭐ ' + CA.totalStars());

  function render() {
    CA.cleanup(); CA.closeModal();
    const app = $('#app'); app.innerHTML = ''; app.style.removeProperty('--c');
    document.querySelectorAll('.nav').forEach(n => n.remove());
    window.scrollTo(0, 0);
    const { parts, qs } = seg(), r = parts[0] || '';
    if (!D.profiles.length && r !== 'welcome' && r !== 'parent' && r !== 'oops') return CA.go('/welcome');
    if (D.profiles.length && !CA.P()) { D.cur = D.profiles[0].id; save(); }
    let nav = null;
    const need = (k, label) => CA.screens[k] ? CA.screens[k](parts, qs) : h('p', null, label + ' missing.');
    try {
      if (r === '') { app.append(screenHome()); nav = '/'; }
      else if (r === 'welcome') app.append(screenWelcome(qs));
      else if (r === 'who') app.append(screenWho());
      else if (r === 'zone') app.append(screenZone(parts[1]));
      else if (r === 'badges') { app.append(screenBadges()); nav = '/badges'; }
      else if (r === 'keys') app.append(need('keys', 'Typing lesson'));
      else if (r === 'mouse') app.append(need('mouse', 'Mouse lab'));
      else if (r === 'quest') app.append(need('quest', 'Desktop quest'));
      else if (r === 'safe') app.append(need('safe', 'Safety scene'));
      else if (r === 'kind') app.append(need('kind', 'Kindness scene'));
      else if (r === 'oops') { app.append(need('oops', 'Help')); nav = '/oops'; }
      else if (r === 'games') { app.append(need('games', 'Games')); nav = '/games'; }
      else if (r === 'game') app.append(need('game', 'Game'));
      else if (r === 'parent') { app.append(need('parent', 'Parent area')); nav = '/parent'; }
      else { app.append(screenHome()); nav = '/'; }
    } catch (e) {
      console.error(e);
      app.append(h('div', { class: 'card' }, h('h3', null, 'Oops, something broke'), h('p', { class: 'muted mt8' }, String(e && e.message || e)), h('button', { class: 'btn mt12', onclick: () => CA.go('/') }, 'Home')));
    }
    if (nav) document.body.append(navBar(nav));
  }
  CA.render = render;

  /* ================= screens ================= */
  const heroArt = () => CA.s('svg', { class: 'traces', viewBox: '0 0 400 200', preserveAspectRatio: 'xMidYMid slice' },
    [30, 60, 90, 120, 150].map(y => CA.s('line', { x1: 0, y1: y, x2: 400, y2: y, stroke: '#fff', 'stroke-width': 1 })),
    [[40, 120], [90, 60], [150, 90], [210, 40], [260, 110], [320, 70], [370, 130]].map(([x, y]) => CA.s('rect', { x: x - 10, y: y - 10, width: 20, height: 20, rx: 4, fill: '#f5b83d' })));
  CA.heroArt = heroArt;

  const TIPS = [
    'Stop. Block. Tell. If something online feels wrong, you are never in trouble for telling a grown-up.',
    'A password is a secret toothbrush: do not share it and change it if it is old.',
    'THINK before you post: is it True, Helpful, Inspiring, Necessary, Kind?',
    'Your real name, school, address and birthday stay private online.',
    'If a message says "act NOW or lose it", slow down. Real friends and real shops do not rush you.',
    'Keep your eyes on the screen and your fingers on the home row: F and J have little bumps!',
    'Ask first: before you download, sign up, or share a photo of someone else.',
    'A friend you have only met online is still a stranger. Keep chats in places your family can see.',
    'Take a break! Eyes, wrists and brains all love a stretch every 20 minutes.',
    'Pause before you reply when you feel cross. Messages can not be un-sent.'
  ];
  const tipOfDay = () => { const d = new Date(); return TIPS[Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) % TIPS.length]; };

  function screenHome() {
    const p = CA.P(), band = p.band, pr = PR();
    let nextZone = CA.ZONES.find(z => { const st = CA.zoneStatus(z); return st.total && !st.badge; }) || CA.ZONES[0];
    const wrap = h('div', null);
    wrap.append(h('div', { class: 'hero' }, heroArt(), h('div', { class: 'spark' }, '💻'),
      h('div', { class: 'row' }, h('div', { class: 'brand' }, h('div', { class: 'logo' }, '💻'), h('div', null, h('h1', null, 'Computing Adventure'), h('small', null, 'Type. Click. Stay safe. Be kind.'))),
        h('button', { class: 'who', onclick: () => CA.go('/who') }, h('span', { class: 'av' }, p.avatar), p.name)),
      h('div', { class: 'hello' }, 'Hi ' + p.name + '! ', h('span', null, '⭐ ' + CA.totalStars() + ' stars · ' + Object.keys(pr.badges).length + ' of ' + CA.ZONES.length + ' badges'))));
    wrap.append(h('button', { class: 'oopscard', onclick: () => CA.go('/oops') }, h('span', { class: 'em' }, '💛'),
      h('span', null, h('small', null, 'ANYTIME'), h('b', null, 'Something felt wrong online?'), h('span', { class: 'small muted' }, 'You are not in trouble. Tap here and we will work out what to do.'))));
    wrap.append(h('div', { class: 'card warm' }, h('b', null, '💡 Today: '), tipOfDay(), ' ', CA.sayBtn(tipOfDay())));
    wrap.append(h('button', { class: 'arcade', onclick: () => CA.go('/games') }, h('span', { class: 'em' }, '🎮'), h('span', { class: 'tx' }, h('b', null, 'Computer Games'), h('span', null, 'Letter rain, word dash, bubble pop and more'))));
    const q = h('div', { class: 'quest', style: { marginTop: '14px' } });
    CA.ZONES.forEach(z => {
      const st = CA.zoneStatus(z);
      q.append(h('button', { class: 'node' + (st.badge ? ' got' : ''), style: { '--c': z.color }, onclick: () => CA.go('/zone/' + z.id) },
        nextZone === z && !st.badge ? h('span', { class: 'nextpill' }, 'Next up') : null,
        h('div', { class: 'em' }, z.e),
        h('div', { class: 'tx' }, h('span', { class: 'un' }, 'ZONE'), h('b', null, z.title), h('span', null, z.tag), h('div', { class: 'bar', style: { marginTop: '6px' } }, h('i', { style: { width: st.pct + '%' } }))),
        h('div', { class: 'bd' }, z.badge.emoji)));
    });
    wrap.append(q);
    wrap.append(h('div', { class: 'card flat mt24' }, h('b', null, '⚓ The Harbor Rules'),
      h('div', { class: 'mt8' }, ['🛑 Stop when something feels off', '🚫 Block it or close it', '🗣️ Tell a trusted grown-up (you are never in trouble for telling)', '🔒 Keep passwords and private things private', '💛 Be kind, even when nobody is watching'].map(t => h('div', { style: { padding: '3px 0', fontWeight: 700 } }, t)))));
    return wrap;
  }

  function profileForm(onDone, opts) {
    opts = opts || {};
    let av = CA.AVATARS[CA.rand(CA.AVATARS.length)], band = 'player';
    const name = h('input', { class: 'inp', placeholder: 'Name', maxlength: 20, autocomplete: 'off' });
    const avBox = h('div', { class: 'avgrid' }), bBox = h('div', { class: 'bands' });
    const drawAv = () => { avBox.innerHTML = ''; CA.AVATARS.forEach(a => avBox.append(h('button', { class: a === av ? 'on' : '', onclick: () => { av = a; drawAv(); } }, a))); };
    const drawB = () => { bBox.innerHTML = ''; CA.BANDS.forEach(b => bBox.append(h('button', { class: b.id === band ? 'on' : '', onclick: () => { band = b.id; drawB(); } }, h('span', { class: 'e' }, b.e), h('span', null, h('b', null, b.name + ' (ages ' + b.ages + ')'), h('br'), h('span', { class: 'muted small' }, b.desc))))); };
    drawAv(); drawB();
    return h('div', null, h('label', { class: 'lbl' }, 'Explorer name (a first name or nickname is perfect)'), name, h('label', { class: 'lbl' }, 'Pick a friend'), avBox, h('label', { class: 'lbl' }, 'Who is this?'), bBox,
      h('button', { class: 'btn big mint wide mt16', onclick: () => {
        const n = name.value.trim(); if (!n) { name.focus(); return CA.toast('Type a name first'); }
        const p = { id: 'p' + Date.now().toString(36) + CA.rand(99), name: n, avatar: av, band };
        D.profiles.push(p); D.cur = p.id; save(); onDone(p);
      } }, opts.cta || 'Start exploring 🚀'));
  }

  function screenWelcome(qs) {
    const wrap = h('div', null);
    wrap.append(h('div', { class: 'hero' }, heroArt(), h('div', { class: 'spark' }, '💻'), h('div', { class: 'brand' }, h('div', { class: 'logo' }, '💻'), h('div', null, h('h1', null, 'Computing Adventure'), h('small', null, 'Welcome, explorer!')))));
    const joinMsg = h('div', { class: 'feedback' });
    const code = h('input', { class: 'inp', placeholder: 'MA-AB12 or WA-AB12', maxlength: 7, autocapitalize: 'characters', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false', value: D.fam || qs.get('family') || '', oninput: e => { e.target.value = CA.fmtFam(e.target.value); } });
    const joinBtn = h('button', { class: 'btn wide mt8', onclick: async () => {
      joinBtn.disabled = true; joinMsg.textContent = 'Joining…'; joinMsg.className = 'feedback';
      const r = await CA.joinFamily(code.value); joinBtn.disabled = false; joinMsg.textContent = r.msg; joinMsg.className = 'feedback ' + (r.ok ? 'good' : 'bad');
      if (r.ok && D.profiles.length) setTimeout(() => CA.go('/'), 800);
    } }, 'Join my family');
    wrap.append(h('div', { class: 'card', style: { marginTop: '-30px', position: 'relative' } }, h('h3', null, '🏠 I have a family code'),
      h('p', { class: 'muted small mt8' }, 'Use the same code as Math Adventure or Words Adventure. Your explorers and stars come along.'), h('div', { class: 'mt8' }, code), joinBtn, joinMsg));
    wrap.append(h('div', { class: 'card' }, h('h3', null, '✨ New explorer'), profileForm(() => CA.go('/'))));
    wrap.append(h('div', { class: 'card calm' }, h('b', null, '🔒 Private by design'), h('p', { class: 'small mt8' }, 'Nothing you type in the pretend chats or the pretend computer is saved or sent anywhere. Only stars and badges are kept, on this device (and in your family code, if you join one). There are no ads, no tracking and no real strangers in this app.')));
    return wrap;
  }

  function screenWho() {
    const wrap = h('div', null, CA.topbar('Who is exploring?', '/'));
    D.profiles.forEach(p => {
      wrap.append(h('button', { class: 'nbitem', onclick: () => { D.cur = p.id; save(); CA.go('/'); } },
        h('span', { style: { fontSize: '2.4rem' } }, p.avatar), h('span', { style: { flex: 1 } }, h('b', null, p.name), h('br'), h('span', { class: 'muted small' }, (CA.BANDS.find(b => b.id === p.band) || {}).name + ' · ⭐ ' + CA.totalStars(p.id))), p.id === D.cur ? h('span', null, '✔️') : null));
    });
    if (!CA.managed()) wrap.append(h('div', { class: 'card mt16' }, h('h3', null, '➕ Add an explorer'), profileForm(() => CA.go('/'), { cta: 'Add explorer' })));
    else wrap.append(h('p', { class: 'muted small mt16' }, 'Add or change children in Harbor → Parents → Children.'));
    return wrap;
  }

  /* generic zone page: story, then its activities */
  function screenZone(id) {
    const z = CA.zone(id); if (!z) return h('p', null, 'Zone not found');
    $('#app').style.setProperty('--c', z.color);
    const st = CA.zoneStatus(z), wrap = h('div', { style: { '--c': z.color } });
    wrap.append(h('div', { class: 'uhero' },
      h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('button', { class: 'iconbtn', onclick: () => CA.go('/') }, '←'), CA.starPill()),
      h('div', { class: 'row mt12' }, h('div', { class: 'em' }, z.e), h('div', null, h('div', { style: { fontWeight: 800, opacity: .85, fontSize: '.8rem', letterSpacing: '.08em' } }, 'ZONE'), h('h1', null, z.title))),
      h('div', { class: 'bq' }, '🤔 ' + z.big, ' ', CA.sayBtn(z.big))));
    wrap.append(h('div', { class: 'card' }, h('div', { class: 'bar' }, h('i', { style: { width: st.pct + '%' } })), h('p', { class: 'small muted mt8' }, st.done + ' of ' + st.total + ' done · badge ' + (st.badge ? 'earned! ' + z.badge.emoji : 'not yet'))));
    if (CA.zoneIntro && CA.zoneIntro[id]) wrap.append(CA.zoneIntro[id]());
    const list = CA.zoneItems(id);
    const groups = []; list.forEach(it => { const g = it.group || ''; let x = groups.find(y => y.g === g); if (!x) groups.push(x = { g, items: [] }); x.items.push(it); });
    groups.forEach(g => {
      if (g.g) wrap.append(h('h3', { class: 'sec' }, g.g));
      g.items.forEach(it => wrap.append(h('button', { class: 'labcard', onclick: () => CA.go(it.route) }, h('span', { class: 'em' }, it.emoji), h('span', { style: { flex: 1 } }, h('b', null, it.title), h('span', { class: 'd' }, it.blurb)), CA.starsEl(CA.stars(it.id)))));
    });
    if (!list.length) wrap.append(h('p', { class: 'muted' }, 'Nothing here for your level yet.'));
    return wrap;
  }

  function screenBadges() {
    const wrap = h('div', null, CA.topbar('Badges', '/', CA.starPill())), pr = PR();
    CA.ZONES.forEach(z => {
      const got = pr.badges[z.id], st = CA.zoneStatus(z);
      wrap.append(h('div', { class: 'card', style: { opacity: got ? 1 : .6 } }, h('div', { class: 'row' }, h('span', { style: { fontSize: '2.6rem', filter: got ? 'none' : 'grayscale(1)' } }, z.badge.emoji),
        h('div', { style: { flex: 1 } }, h('b', null, z.badge.name), h('div', { class: 'small muted' }, got ? z.badge.earned : z.title + ': ' + st.done + ' of ' + st.total + ' activities')))));
    });
    return wrap;
  }

  /* ================= boot ================= */
  CA.boot = async function () {
    const q = new URLSearchParams(location.search);
    CA.fromHarbor = q.get('from') === 'harbor';
    if (CA.fromHarbor) { try { sessionStorage.setItem('ca_harbor_managed', '1'); } catch (e) { } }
    window.addEventListener('hashchange', render);
    try {
      if (q.get('family') && (q.get('family') !== D.fam || CA.fromHarbor)) await CA.joinFamily(q.get('family'), CA.fromHarbor);
      if (q.get('child') && D.profiles.some(p => p.id === q.get('child'))) { D.cur = q.get('child'); save(); }
      if (q.get('view') === 'parent' && CA.fromHarbor) { try { sessionStorage.setItem('ca_harbor_parent', '1'); } catch (e) { } location.hash = '#/parent'; }
    } catch (e) { }
    render();
    cloudPull().then(() => { if (D.fam) { const r = (CA.seg().parts[0] || ''); if (r === '') render(); } });
  };
})();
