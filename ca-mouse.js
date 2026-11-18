/* Computing Adventure - Mouse Meadow: small labs for point, click, double-click, right-click, drag, scroll and steady hand. Touch friendly. */
(function () {
  'use strict';
  const CA = window.CA, h = CA.h;
  const LABS = [
    { id: 'm-point', emoji: '👆', title: 'Point', blurb: 'Move the pointer onto the star', min: 0, how: 'Move the pointer (your finger, if you are on a touchscreen) onto the glowing star. No clicking needed!', words: 'Pointer = the little arrow that moves when you move the mouse.' },
    { id: 'm-click', emoji: '🎈', title: 'Click', blurb: 'Pop the balloons with a click', min: 0, how: 'Point at a balloon, then press the left mouse button once. That is a click!', words: 'Click = press the left button once.' },
    { id: 'm-dbl', emoji: '🧰', title: 'Double-click', blurb: 'Two quick clicks open the chest', min: 1, how: 'Click twice, quickly, in the same spot. Like knock-knock!', words: 'Double-click = two quick clicks. Used to open things.' },
    { id: 'm-right', emoji: '🎩', title: 'Right-click', blurb: 'The secret menu', min: 1, how: 'Press the RIGHT mouse button on the hat. (On a touchscreen: press and hold.) A menu pops up. Pick what it asks for.', words: 'Right-click = a menu of extra choices.' },
    { id: 'm-drag', emoji: '🧺', title: 'Drag and drop', blurb: 'Carry fruit to the right basket', min: 0, how: 'Press and hold on the fruit, move it, then let go over the matching basket.', words: 'Drag = hold the button down and move. Drop = let go.' },
    { id: 'm-scroll', emoji: '📜', title: 'Scroll', blurb: 'Find the hidden treasure', min: 0, how: 'Use the mouse wheel, two fingers on a trackpad, or swipe, to slide the page. Find the treasure and click it!', words: 'Scroll = slide the page up and down to see more.' },
    { id: 'm-steady', emoji: '🐢', title: 'Steady hand', blurb: 'Trace the wiggly path', min: 1, how: 'Press on the green circle and follow the path to the flag. Stay inside the tube. If you wobble out, just try again!', words: 'Steady = slow and careful gets you there.' }
  ];
  LABS.forEach(l => CA.items.mouse.push({ id: l.id, emoji: l.emoji, title: l.title, blurb: l.blurb, min: l.min, route: '/mouse/' + l.id }));

  CA.zoneIntro = CA.zoneIntro || {};
  CA.zoneIntro.mouse = () => h('div', { class: 'card warm' }, h('b', null, '🖱️ Mouse words'),
    h('div', { class: 'small mt8' }, LABS.map(l => h('div', { style: { padding: '2px 0' } }, l.emoji + ' ' + l.words))),
    h('p', { class: 'small muted mt8' }, 'On a touchscreen? A tap is a click, two quick taps are a double-click, and pressing and holding is a right-click.'));

  const starsBy = (n, a, b) => n <= a ? 3 : n <= b ? 2 : 1;
  const size = (base, band) => Math.round(base * (band === 0 ? 1.4 : band === 1 ? 1.15 : 1));

  function screenMouse(parts) {
    const lab = LABS.find(l => l.id === parts[1]); if (!lab) return h('p', null, 'Lab not found');
    document.getElementById('app').style.setProperty('--c', CA.zone('mouse').color);
    const band = CA.bandIdx(), wrap = h('div', null, CA.topbar(lab.title, '/zone/mouse', CA.starPill()));
    wrap.append(h('div', { class: 'card warm mt12' }, h('b', null, lab.emoji + ' ' + lab.how), ' ', CA.sayBtn(lab.how), h('div', { class: 'small muted mt8' }, lab.words)));
    const stage = h('div', { class: 'stage' + (lab.id === 'm-scroll' ? ' scroll' : '') });
    const status = h('div', { class: 'feedback center' }, ' ');
    wrap.append(stage, status);
    const ctx = {
      stage, band, say(t, cls) { status.textContent = t; status.className = 'feedback center ' + (cls || ''); },
      rect() { return stage.getBoundingClientRect(); },
      place(el, w, hgt) { const r = stage.getBoundingClientRect(); const W = Math.max(200, r.width), H = Math.max(200, r.height || 360); el.style.left = Math.round(10 + Math.random() * (W - w - 20)) + 'px'; el.style.top = Math.round(10 + Math.random() * (H - (hgt || w) - 20)) + 'px'; },
      finish(stars, lines) { CA.record(lab.id, stars); CA.finish({ title: stars >= 3 ? 'Super mouse skills!' : 'Nice work!', stars, lines, again: () => CA.render(), back: '/zone/mouse' }); }
    };
    setTimeout(() => RUN[lab.id](ctx), 0);
    return wrap;
  }

  const RUN = {};

  RUN['m-point'] = function (c) {
    let r = 0; const rounds = 6;
    (function next() {
      c.stage.innerHTML = ''; const w = size(70, c.band);
      const t = h('div', { class: 'tgt glow', style: { width: w + 'px', height: w + 'px' } }, '⭐'); c.stage.append(t); c.place(t, w);
      let hit = false; const go = () => { if (hit) return; hit = true; CA.sfx.ok(); r++; c.say('Got it! ' + r + ' of ' + rounds, 'good'); if (r >= rounds) c.finish(3, ['You moved the pointer ' + rounds + ' times, like a pro.']); else CA.after(next, 350); };
      t.addEventListener('pointerenter', go); t.addEventListener('pointerdown', go);
    })();
    c.say('Move the pointer to the star.');
  };

  RUN['m-click'] = function (c) {
    let r = 0, miss = 0; const rounds = 8;
    c.stage.addEventListener('click', e => { if (e.target === c.stage) { miss++; CA.sfx.bad(); c.say('Close! Click right on the balloon.', 'bad'); } });
    (function next() {
      c.stage.innerHTML = ''; const w = size(Math.max(40, 92 - r * 7), c.band);
      const t = h('button', { class: 'tgt', style: { width: w + 'px', height: w + 'px', background: CA.pick(['#f2645a', '#f5b83d', '#12b58c', '#2f7de1', '#e0529c']), fontSize: (w * .5) + 'px', cursor: 'pointer' }, 'aria-label': 'balloon' }, '🎈');
      c.stage.append(t); c.place(t, w);
      t.addEventListener('click', e => { e.stopPropagation(); CA.sfx.ok(); t.textContent = '💥'; r++; c.say('Pop! ' + r + ' of ' + rounds, 'good'); if (r >= rounds) CA.after(() => c.finish(starsBy(miss, 1, 4), ['Missed clicks: ' + miss]), 300); else CA.after(next, 300); });
    })();
    c.say('Click each balloon. They get smaller!');
  };

  RUN['m-dbl'] = function (c) {
    let r = 0, singles = 0; const rounds = 5;
    (function next() {
      c.stage.innerHTML = ''; const w = size(90, c.band);
      const t = h('div', { class: 'tgt', style: { width: w + 'px', height: w + 'px', borderRadius: '18px', fontSize: (w * .55) + 'px', cursor: 'pointer', background: '#e8c37a' } }, '🧰'); c.stage.append(t); c.place(t, w);
      let last = 0, lx = 0, ly = 0, timer = null, opened = false;
      t.addEventListener('pointerdown', e => {
        if (opened) return; const now = Date.now();
        if (now - last < 520 && Math.hypot(e.clientX - lx, e.clientY - ly) < 50) {
          opened = true; clearTimeout(timer); CA.sfx.win(); t.textContent = '🎁'; r++; c.say('Double-click! ' + r + ' of ' + rounds, 'good');
          if (r >= rounds) CA.after(() => c.finish(starsBy(singles, 2, 6), ['Single clicks that should have been double: ' + singles]), 400); else CA.after(next, 600); last = 0; return;
        }
        last = now; lx = e.clientX; ly = e.clientY; clearTimeout(timer);
        timer = setTimeout(() => { singles++; c.say('That was one click. Click twice, quickly: click-click!'); }, 560);
      });
      CA.onLeave(() => clearTimeout(timer));
    })();
    c.say('Double-click the chest to open it.');
  };

  RUN['m-right'] = function (c) {
    const ACTS = [['Add sparkle ✨', '✨'], ['Add rainbow 🌈', '🌈'], ['Add moon 🌙', '🌙'], ['Add star ⭐', '⭐'], ['Add heart 💛', '💛'], ['Add cloud ☁️', '☁️']];
    let r = 0, wrong = 0; const rounds = 4;
    (function next() {
      c.stage.innerHTML = ''; const goal = CA.pick(ACTS), w = size(100, c.band);
      const hat = h('div', { class: 'tgt', style: { width: w + 'px', height: w + 'px', fontSize: (w * .55) + 'px', background: '#e5f0fc' } }, '🎩'); c.stage.append(hat); c.place(hat, w);
      const fx = h('div', { style: { position: 'absolute', left: 0, right: 0, top: '6px', textAlign: 'center', fontSize: '1.6rem', fontWeight: 800 } }, 'Right-click the hat, then choose: ' + goal[0]); c.stage.append(fx);
      let menu = null; const close = () => { if (menu) { menu.remove(); menu = null; } };
      function open(x, y) {
        close(); const rc = c.rect(); const opts = CA.shuffle([goal].concat(CA.shuffle(ACTS.filter(a => a !== goal)).slice(0, 3)));
        menu = h('div', { class: 'ctxmenu', style: { left: CA.clamp(x - rc.left, 4, rc.width - 170) + 'px', top: CA.clamp(y - rc.top, 40, rc.height - 170) + 'px' } },
          opts.map(o => h('button', { onclick: ev => { ev.stopPropagation(); if (o === goal) { CA.sfx.ok(); close(); hat.textContent = '🎩' + o[1]; r++; c.say('You used the secret menu! ' + r + ' of ' + rounds, 'good'); if (r >= rounds) CA.after(() => c.finish(starsBy(wrong, 1, 4), ['Wrong picks: ' + wrong]), 500); else CA.after(next, 700); } else { wrong++; CA.sfx.bad(); close(); c.say('Not that one. Open the menu again and look for: ' + goal[0], 'bad'); } } }, o[0])));
        c.stage.append(menu);
      }
      hat.addEventListener('contextmenu', e => { e.preventDefault(); open(e.clientX, e.clientY); });
      let lp = null;
      hat.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { lp = setTimeout(() => open(e.clientX, e.clientY), 550); } });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => hat.addEventListener(ev, () => clearTimeout(lp)));
      hat.addEventListener('click', e => { if (e.pointerType === 'mouse' || e.detail) c.say('That was a left click. Use the RIGHT button (or press and hold on a touchscreen).'); });
    })();
    c.say('Right-click the hat.');
  };

  RUN['m-drag'] = function (c) {
    const F = [{ e: '🍎', b: 0 }, { e: '🍌', b: 1 }, { e: '🍇', b: 2 }], NAMES = ['Apples', 'Bananas', 'Grapes'];
    let r = 0, wrong = 0; const rounds = 8;
    const buckets = F.map((f, i) => { const b = h('div', { class: 'bucket', style: { left: (3 + i * 32.5) + '%', '--c': '#12b58c' } }, '🧺 ' + NAMES[i]); c.stage.append(b); return b; });
    function spawn() {
      const f = CA.pick(F), w = size(60, c.band), rc = c.rect();
      const it = h('div', { class: 'drag', style: { left: (rc.width / 2 - 30) + 'px', top: '20px', fontSize: w + 'px' } }, f.e); c.stage.append(it);
      let dx = 0, dy = 0, drag = false;
      it.addEventListener('pointerdown', e => { drag = true; it.setPointerCapture(e.pointerId); const ir = it.getBoundingClientRect(); dx = e.clientX - ir.left; dy = e.clientY - ir.top; });
      it.addEventListener('pointermove', e => { if (!drag) return; const sr = c.rect(); it.style.left = (e.clientX - sr.left - dx) + 'px'; it.style.top = (e.clientY - sr.top - dy) + 'px'; });
      it.addEventListener('pointerup', e => {
        if (!drag) return; drag = false; const ir = it.getBoundingClientRect(), cx = ir.left + ir.width / 2, cy = ir.top + ir.height / 2;
        const hit = buckets.findIndex(b => { const br = b.getBoundingClientRect(); return cx > br.left && cx < br.right && cy > br.top && cy < br.bottom; });
        if (hit === f.b) { CA.sfx.ok(); it.remove(); r++; c.say('In the basket! ' + r + ' of ' + rounds, 'good'); if (r >= rounds) c.finish(starsBy(wrong, 1, 4), ['Wrong baskets: ' + wrong]); else CA.after(spawn, 250); }
        else { if (hit >= 0) { wrong++; CA.sfx.bad(); c.say('Wrong basket. Look at the fruit and the label.', 'bad'); } it.style.left = (rc.width / 2 - 30) + 'px'; it.style.top = '20px'; }
      });
    }
    spawn(); c.say('Drag each fruit into its basket.');
  };

  RUN['m-scroll'] = function (c) {
    const PRIZES = [['🔑', 'golden key'], ['💎', 'blue gem'], ['🏆', 'trophy']], JUNK = ['🌵', '🪨', '🍂', '🐌', '🍄', '🌿', '🪵'];
    let r = 0, wrong = 0;
    (function next() {
      c.stage.innerHTML = ''; const p = PRIZES[r], rc = c.rect(), W = Math.max(240, rc.width);
      const tall = h('div', { style: { position: 'relative', height: '1800px' } });
      tall.append(h('div', { style: { position: 'absolute', top: '8px', left: 0, right: 0, textAlign: 'center', fontWeight: 800 } }, 'Scroll down to find the ' + p[1] + ' ' + p[0]));
      for (let i = 0; i < 26; i++) { const j = h('span', { style: { position: 'absolute', left: Math.round(Math.random() * (W - 50)) + 'px', top: (80 + Math.round(Math.random() * 1650)) + 'px', fontSize: '2rem', cursor: 'pointer' } }, CA.pick(JUNK)); j.addEventListener('click', () => { wrong++; CA.sfx.bad(); c.say('Not that one! Look for the ' + p[1] + '.', 'bad'); }); tall.append(j); }
      const pz = h('button', { style: { position: 'absolute', left: Math.round(40 + Math.random() * (W - 120)) + 'px', top: (1100 + Math.round(Math.random() * 500)) + 'px', fontSize: '2.4rem', background: 'none', border: 'none' } }, p[0]);
      pz.addEventListener('click', () => { CA.sfx.ok(); r++; c.say('Found it!', 'good'); if (r >= PRIZES.length) c.finish(starsBy(wrong, 2, 6), ['Wrong clicks: ' + wrong]); else CA.after(next, 500); });
      tall.append(pz); c.stage.append(tall); c.stage.scrollTop = 0;
    })();
    c.say('Slide the page to look around.');
  };

  RUN['m-steady'] = function (c) {
    const NS = 'http://www.w3.org/2000/svg';
    const tube = c.band === 0 ? 70 : c.band === 1 ? 54 : 42, tol = tube / 2;
    let r = 0, wob = 0; const rounds = 3;
    const PATHS = ['M40 240 C 140 40, 200 280, 300 150 S 480 60, 560 180', 'M40 60 C 160 60, 160 240, 300 240 S 440 60, 560 80', 'M40 150 C 100 40, 160 40, 220 150 S 340 260, 400 150 S 500 60, 560 150'];
    (function next() {
      c.stage.innerHTML = ''; const d = PATHS[r % PATHS.length];
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 600 300'); svg.style.cssText = 'width:100%;height:100%;display:block;touch-action:none';
      const path = document.createElementNS(NS, 'path'); path.setAttribute('d', d); path.setAttribute('fill', 'none'); path.setAttribute('stroke', '#d6e9fb'); path.setAttribute('stroke-width', tube); path.setAttribute('stroke-linecap', 'round');
      const prog = document.createElementNS(NS, 'path'); prog.setAttribute('fill', 'none'); prog.setAttribute('stroke', '#12b58c'); prog.setAttribute('stroke-width', 6); prog.setAttribute('stroke-linecap', 'round');
      svg.append(path, prog); c.stage.append(svg);
      const L = path.getTotalLength(), pts = []; for (let i = 0; i <= L; i += 5) { const p = path.getPointAtLength(i); pts.push([p.x, p.y, i]); }
      const s0 = pts[0], e0 = pts[pts.length - 1];
      const st = document.createElementNS(NS, 'text'); st.setAttribute('x', s0[0] - 16); st.setAttribute('y', s0[1] + 12); st.setAttribute('font-size', 34); st.textContent = '🟢';
      const fl = document.createElementNS(NS, 'text'); fl.setAttribute('x', e0[0] - 14); fl.setAttribute('y', e0[1] + 12); fl.setAttribute('font-size', 34); fl.textContent = '🏁';
      svg.append(st, fl);
      let down = false, far = 0;
      const toSvg = e => { const m = svg.getScreenCTM().inverse(); const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(m); };
      const near = p => { let best = 1e9, bi = 0; for (let i = 0; i < pts.length; i++) { const dd = Math.hypot(pts[i][0] - p.x, pts[i][1] - p.y); if (dd < best) { best = dd; bi = i; } } return [best, bi]; };
      svg.addEventListener('pointerdown', e => { const p = toSvg(e); if (Math.hypot(p.x - s0[0], p.y - s0[1]) < tol + 14) { down = true; far = 0; svg.setPointerCapture(e.pointerId); c.say('Nice and steady...'); } });
      svg.addEventListener('pointermove', e => {
        if (!down) return; const p = toSvg(e), [dist, idx] = near(p);
        if (dist > tol) { down = false; wob++; far = 0; prog.setAttribute('d', ''); CA.sfx.bad(); c.say('Wobble! Go back to the green circle and try again.', 'bad'); return; }
        if (idx > far && idx - far < 30) { far = idx; prog.setAttribute('d', 'M' + pts.slice(0, far + 1).map(q => q[0] + ' ' + q[1]).join(' L')); }
        if (far >= pts.length - 3) { down = false; CA.sfx.ok(); r++; c.say('You made it! ' + r + ' of ' + rounds, 'good'); if (r >= rounds) CA.after(() => c.finish(starsBy(wob, 2, 6), ['Wobbles: ' + wob]), 400); else CA.after(next, 600); }
      });
      svg.addEventListener('pointerup', () => { if (down) { down = false; far = 0; prog.setAttribute('d', ''); c.say('Let go too early. Start again from the green circle.'); } });
    })();
    c.say('Press the green circle and follow the path.');
  };

  CA.screens.mouse = screenMouse;
})();
