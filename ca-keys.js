/* Computing Adventure - Keyboard Cove: on-screen keyboard, lessons, typing engine. */
(function () {
  'use strict';
  const CA = window.CA, h = CA.h, D = () => CA.D();

  /* ================= keyboard layouts ================= */
  const L = (b, s, w) => ({ b, s, w });
  const letters = (str) => str.split('').map(c => L(c, c.toUpperCase()));
  function layout(name) {
    const nums = name === 'us'
      ? [['`', '~'], ['1', '!'], ['2', '@'], ['3', '#'], ['4', '$'], ['5', '%'], ['6', '^'], ['7', '&'], ['8', '*'], ['9', '('], ['0', ')'], ['-', '_'], ['=', '+']]
      : [['`', '¬'], ['1', '!'], ['2', '"'], ['3', '£'], ['4', '$'], ['5', '%'], ['6', '^'], ['7', '&'], ['8', '*'], ['9', '('], ['0', ')'], ['-', '_'], ['=', '+']];
    const r0 = nums.map(p => L(p[0], p[1])).concat([{ n: 'Backspace', lab: '⌫', w: 'w2' }]);
    const r1 = [{ n: 'Tab', lab: 'Tab', w: 'w15' }].concat(letters('qwertyuiop'), [L('[', '{'), L(']', '}')], name === 'us' ? [L('\\', '|', 'w15')] : []);
    const r2 = [{ n: 'Caps', lab: 'Caps', w: 'w2' }].concat(letters('asdfghjkl'), [L(';', ':'), L("'", name === 'us' ? '"' : '@')], name === 'us' ? [] : [L('#', '~')], [{ n: 'Enter', lab: 'Enter', w: name === 'us' ? 'w25' : 'w15' }]);
    const r3 = [{ n: 'ShiftL', lab: 'Shift', w: name === 'us' ? 'w25' : 'w15' }].concat(name === 'us' ? [] : [L('\\', '|')], letters('zxcvbnm'), [L(',', '<'), L('.', '>'), L('/', '?')], [{ n: 'ShiftR', lab: 'Shift', w: 'w25' }]);
    const r4 = [{ n: 'Ctrl', lab: 'Ctrl', w: 'w15' }, { n: 'Alt', lab: 'Alt', w: 'w15' }, { n: 'Space', lab: 'space', w: 'w6' }, { n: 'Alt2', lab: 'Alt', w: 'w15' }, { n: 'Ctrl2', lab: 'Ctrl', w: 'w15' }];
    return [r0, r1, r2, r3, r4];
  }
  const FINGERS = {
    LP: { name: 'left pinky', hand: 'L', col: '#ffb3ad' }, LR: { name: 'left ring finger', hand: 'L', col: '#ffcf9e' }, LM: { name: 'left middle finger', hand: 'L', col: '#ffe9a0' },
    LI: { name: 'left pointer finger', hand: 'L', col: '#c5ec9c' }, RI: { name: 'right pointer finger', hand: 'R', col: '#a6e8d6' }, RM: { name: 'right middle finger', hand: 'R', col: '#a9d4f7' },
    RR: { name: 'right ring finger', hand: 'R', col: '#c9b9f2' }, RP: { name: 'right pinky', hand: 'R', col: '#f4b2d3' }, TH: { name: 'thumb', hand: 'T', col: '#e3eaf0' }
  };
  function fingerOfBase(b, lay) {
    const t = { LP: '`1qaz' + (lay === 'us' ? '' : '\\'), LR: '2wsx', LM: '3edc', LI: '45rtfgvb', RI: '67yuhjnm', RM: '8ik,', RR: '9ol.', RP: "0-=p[];'#/" + (lay === 'us' ? '\\' : '') };
    for (const k in t) if (t[k].indexOf(b) >= 0) return k;
    return 'RP';
  }
  const NAMED_FINGER = { Backspace: 'RP', Tab: 'LP', Caps: 'LP', Enter: 'RP', ShiftL: 'LP', ShiftR: 'RP', Ctrl: 'LP', Ctrl2: 'RP', Alt: 'TH', Alt2: 'TH', Space: 'TH' };

  CA.keyboard = function () {
    const lay = D().layout || 'ie', rows = layout(lay), map = {}, named = {};
    const el = h('div', { class: 'kbd', 'aria-hidden': 'true' });
    rows.forEach(row => {
      const r = h('div', { class: 'krow' });
      row.forEach(k => {
        const f = k.n ? NAMED_FINGER[k.n] : fingerOfBase(k.b, lay);
        const ke = h('div', { class: 'key ' + (k.w || ''), style: { '--kc': FINGERS[f].col } }, k.n ? k.lab : k.b.length === 1 && /[a-z]/.test(k.b) ? k.b.toUpperCase() : k.b, k.s && !/[A-Z]/.test(k.s) ? h('small', null, k.s) : null);
        if (k.b === 'f' || k.b === 'j') ke.classList.add('bump');
        if (k.n) { named[k.n] = { el: ke, f }; } else { map[k.b] = { el: ke, shift: false, f }; if (k.s && k.s !== k.b) map[k.s] = { el: ke, shift: true, f }; }
        r.append(ke);
      });
      el.append(r);
    });
    named.Space.el.classList.add('space');
    const api = {
      el, fingers: FINGERS,
      clear() { el.querySelectorAll('.hit').forEach(x => x.classList.remove('hit')); },
      info(ch) {
        if (ch === ' ') return { keys: [named.Space.el], f: 'TH', text: 'Use your thumb for the space bar.' };
        const m = map[ch]; if (!m) return null;
        const keys = [m.el];
        let text = 'Use your ' + FINGERS[m.f].name + '.';
        if (m.shift) { const sh = FINGERS[m.f].hand === 'L' ? named.ShiftR : named.ShiftL; keys.push(sh.el); text = 'Hold ' + (FINGERS[m.f].hand === 'L' ? 'right' : 'left') + ' Shift with your pinky, and use your ' + FINGERS[m.f].name + '.'; }
        return { keys, f: m.f, text };
      },
      show(ch) { api.clear(); const i = api.info(ch); if (!i) return null; i.keys.forEach(k => k.classList.add('hit')); return i; },
      showNamed(n) { api.clear(); const x = named[n]; if (!x) return null; x.el.classList.add('hit'); return { keys: [x.el], f: x.f, text: 'Use your ' + FINGERS[x.f].name + '.' }; },
      showCombo(letter) { api.clear(); [named.Ctrl, map[letter]].forEach(x => x && x.el.classList.add('hit')); return { text: 'Hold Ctrl with your left pinky, then tap the letter.' }; },
      setHidden(v) { el.classList.toggle('hidden', !!v); }
    };
    return api;
  };

  /* ================= word bank ================= */
  const WORDS = ('ask all add sad dad lad fad gas has had hall fall glad flag flask flash dash gash hash lash sash salad shall shad half jag ash slash gala flak sag lag halls falls dads lads ads alas shh ' +
    'the and for are but not you all any can her was one our out day get has him his how man new now old see two way who boy did its let put say she too use dog cat sun run fun big red ten yes hen pen net wet jet pet set bet ' +
    'sit sip tip top hop pop mop map cap tap nap lap gap zip zap zoo box fox six mix wax fix next exit relax vet van vest vase vine very love move above give live have five dive drive ' +
    'moon mom mum man mug jam jug jump hump milk make mind more most many much must name nine nice noon note near need nest never nut bun bus bug bed big bag bat ball band bank bark barn base beach bear bell belt best bike bird blue boat book boot born bowl brave bread brick bring brown bush ' +
    'cake call calm camp card care carry cart case catch cave chair chalk chart cheek chest chin city clap clean clear clock cloud coat cold come cook cool copy corn count cow cry cup ' +
    'dance dark dawn deep desk dish dive door down draw dream dress drink drop drum duck dust eagle ear earth east easy eat egg elf end enjoy every eye face fair farm fast feet fern field find fire fish flat float floor flower fly fog food foot forest fork frog from fruit full ' +
    'game garden gate gift girl glass goat gold good grass great green grow guess hand happy hard hat hear heart help hill hold home horse house hug hunt ice idea ink iron island jar jelly job join joke joy judge juice key kick kind king kite kitten knee knit know lake lamp land large laugh leaf learn left lemon lift light lion list little lock long look loud lunch ' +
    'magic mail maple march meal meet melon mice mist mouse mouth mud music nail nap neck nose nurse oak ocean often open orange otter owl page paint pair park party path peach pear pick pie pig pine pink plan plant plate play pond pool pot puppy queen quick quiet quit quiz quilt rabbit race rain rake read ready rice ride ring river road roar rock roof room root rope rose round rug ' +
    'sail salt sand save school sea seed seven shape sheep shell ship shirt shoe shop short show shy sing sink skate sky sleep slide slow small smile snack snail snow soap song soon soup space spoon star stay step stone storm story street sugar summer swim table tail talk team tent thank thing think tiger time toad today toes tree truck try tulip turn twin under up valley vase view visit voice wagon wait walk warm wash water wave week well whale wheel white wind window wing winter wish wolf wood word work world worm write yard year yellow young zebra zero').split(' ');
  const BAD = ['ass', 'sex', 'shit', 'cum', 'tit', 'dik', 'dic', 'fag', 'nig', 'pis', 'wtf', 'kkk', 'cok', 'coc', 'cunt', 'fuk', 'fck', 'hoe', 'bum', 'pee', 'poo', 'wee', 'dam'];
  const clean = s => !BAD.some(b => s.indexOf(b) >= 0);
  const GOODWORDS = WORDS.filter(w => clean(w));

  function drill(newK, revK, total) {
    const all = (newK + revK).split(''), uniq = Array.from(new Set(all));
    const ok = w => w.split('').every(c => uniq.indexOf(c) >= 0);
    const withNew = GOODWORDS.filter(w => ok(w) && newK.split('').some(c => w.indexOf(c) >= 0));
    const anyOk = GOODWORDS.filter(ok);
    let out = [], len = 0;
    if (withNew.length >= 6) {
      const pool = CA.shuffle(withNew).concat(CA.shuffle(anyOk));
      let i = 0; while (len < total) { const w = (i < withNew.length * 2 && i % 3 !== 2) ? CA.pick(withNew) : CA.pick(anyOk); out.push(w); len += w.length + 1; i++; }
    } else {
      const nk = newK.split(''), pool = uniq;
      let guard = 0;
      while (len < total && guard++ < 400) {
        const n = 2 + CA.rand(3); let g = '';
        for (let i = 0; i < n; i++) g += (Math.random() < .6 && nk.length) ? CA.pick(nk) : CA.pick(pool);
        if (!clean(g)) continue; if (out.length && out[out.length - 1] === g) continue;
        out.push(g); len += g.length + 1;
      }
    }
    return out.join(' ');
  }
  const SENT1 = ['The cat sat on the mat.', 'We can run and jump.', 'A big red bus came by.', 'I like to read books.', 'The sun is warm today.', 'My dog loves to play.', 'Look at the tall tree!', 'Can you see the moon?', 'We had fun at the park.', 'The fish swims in the pond.', 'Rain makes the garden grow.', 'I will help my friend.'];
  const SENT2 = ['Quick brown foxes jump over lazy dogs.', 'Pack my box with five dozen liquor jugs.', 'The five boxing wizards jump quickly.', 'We walked to the lake and watched the ducks swim.', 'A kind word can brighten a whole day.', 'Good typists look at the screen, not at their hands.', 'Please ask a grown-up before you share anything private.', 'Every expert was once a beginner who kept on trying.'];
  const STORY = ['Once upon a time, a small robot named Bit lived in a big blue computer. Every morning, Bit sorted the letters and sent them out to the world.',
    'The harbor was quiet at dawn. A little boat bobbed on the water while the gulls called. It was going to be a good day for an adventure.',
    'To save a file, press Control and S together. Give it a name you will remember, and put it in a folder where you can find it again.',
    'A strong password is long and strange. Three random words joined together are much harder to guess than one clever word with a number.'];
  const PASSES = ['purple-tiger-lamp-42', 'sunny.pond.rocket.7', 'Green-Whale-Piano-9!', 'tea&biscuits&rain'];

  function emailText(name) { return (name || 'sam').toLowerCase().replace(/[^a-z]/g, '') + '@example.com'; }

  /* ================= lessons ================= */
  const LESSONS = [];
  const add = (g, id, emoji, title, blurb, min, def) => LESSONS.push(Object.assign({ g, id, emoji, title, blurb, min }, def));
  add('Getting started', 'k-hunt', '👋', 'Meet the keyboard', 'Find Space, Enter, Backspace, Shift and Tab', 0, { mode: 'hunt', targets: () => CA.shuffle([{ n: 'Space', say: 'the space bar', m: e => e.key === ' ' }, { n: 'Enter', say: 'the Enter key', m: e => e.key === 'Enter' }, { n: 'Backspace', say: 'Backspace, the rubber', m: e => e.key === 'Backspace' }, { n: 'ShiftL', say: 'a Shift key', m: e => e.key === 'Shift' }, { n: 'Tab', say: 'the Tab key', m: e => e.key === 'Tab' }]).concat(CA.shuffle([{ n: 'Space', say: 'the space bar', m: e => e.key === ' ' }, { n: 'Enter', say: 'the Enter key', m: e => e.key === 'Enter' }])) });
  add('Getting started', 'k-abc', '🔤', 'Letter hunt', 'Find each letter. Hear its name!', 0, { mode: 'hunt', letters: true, targets: () => CA.shuffle('abcdefghijklmnopqrstuvwxyz'.split('')).slice(0, 10).map(c => ({ ch: c, say: c, m: e => e.key.toLowerCase() === c })) });
  add('Getting started', 'k-name', '🏷️', 'Type your name', 'The most important word of all', 0, { mode: 'type', big: true, text: () => (CA.P().name || 'Explorer').replace(/[^A-Za-z ]/g, '').slice(0, 14) || 'Explorer' });
  add('Home row', 'k-fj', '🏠', 'F and J', 'Your pointer fingers feel the bumps', 1, { mode: 'type', newK: 'fj', revK: '', len: 36, teach: 'Find the little bumps on F and J. Rest your pointer fingers there. This is home!' });
  add('Home row', 'k-dk', '🏠', 'D and K', 'Middle fingers join in', 1, { mode: 'type', newK: 'dk', revK: 'fj', len: 44 });
  add('Home row', 'k-sl', '🏠', 'S and L', 'Ring fingers', 1, { mode: 'type', newK: 'sl', revK: 'fjdk', len: 48 });
  add('Home row', 'k-a', '🏠', 'A and ;', 'Pinkies, the shortest fingers', 1, { mode: 'type', newK: 'a;', revK: 'fjdksl', len: 52 });
  add('Home row', 'k-home', '🏡', 'Home row words', 'Real words from the home row', 1, { mode: 'type', newK: 'asdfjkl', revK: '', len: 60 });
  add('Home row', 'k-gh', '🏡', 'G and H', 'Pointer fingers stretch sideways', 1, { mode: 'type', newK: 'gh', revK: 'asdfjkl', len: 60 });
  add('Top row', 'k-ei', '⬆️', 'E and I', 'Reach up, then come home', 1, { mode: 'type', newK: 'ei', revK: 'asdfjkl', len: 60 });
  add('Top row', 'k-ru', '⬆️', 'R and U', 'Pointer fingers reach up', 1, { mode: 'type', newK: 'ru', revK: 'asdfjklei', len: 60 });
  add('Top row', 'k-ty', '⬆️', 'T and Y', 'Longer reaches', 1, { mode: 'type', newK: 'ty', revK: 'asdfjgheiru', len: 64 });
  add('Top row', 'k-wo', '⬆️', 'W and O', 'Ring fingers reach up', 1, { mode: 'type', newK: 'wo', revK: 'asdfjgheirut', len: 64 });
  add('Top row', 'k-qp', '⬆️', 'Q and P', 'Pinky reaches', 1, { mode: 'type', newK: 'qp', revK: 'asdfjgheiruytwo', len: 64 });
  add('Bottom row', 'k-vm', '⬇️', 'V and M', 'Reach down with pointers', 1, { mode: 'type', newK: 'vm', revK: 'asdfjgheiruytwo', len: 64 });
  add('Bottom row', 'k-bn', '⬇️', 'B and N', 'Pointer stretch down', 1, { mode: 'type', newK: 'bn', revK: 'asdfjgheiruytwovm', len: 64 });
  add('Bottom row', 'k-cx', '⬇️', 'C and X', 'Middle and ring fingers', 1, { mode: 'type', newK: 'cx', revK: 'asdfjgheiruytwovmbn', len: 64 });
  add('Bottom row', 'k-z', '⬇️', 'Z, comma and full stop', 'Last letter, plus two punctuation marks', 1, { mode: 'type', newK: 'z,.', revK: 'asdfjgheiruytwovmbncx', len: 64, extra: s => s.replace(/ ([a-z]+) /, ', $1. ') });
  add('Real typing', 'k-pan', '🦊', 'Every letter', 'Sentences that use the whole alphabet', 2, { mode: 'type', text: () => CA.shuffle(SENT2.slice(0, 4)).slice(0, 2).join(' ') });
  add('Real typing', 'k-shift', '⇧', 'Capital letters', 'Hold Shift with the opposite pinky', 1, { mode: 'type', text: () => CA.shuffle(['Ada', 'Max', 'Rosa', 'Finn', 'Maeve', 'Oisin', 'Pip', 'Zara', 'Tom', 'Bea', 'Jack', 'Lucy', 'Noah', 'Erin']).slice(0, 5).map((n, i) => n + (i % 2 ? ' and ' : ' ')).join('').trim() });
  add('Real typing', 'k-punct', '❗', 'Sentences and punctuation', 'Capitals, full stops, ? and !', 1, { mode: 'type', text: () => CA.shuffle(SENT1).slice(0, 3).join(' ') + ' Can you do it? Yes!' });
  add('Real typing', 'k-num', '🔢', 'Number row', 'Digits 1 to 0', 2, { mode: 'type', text: () => { let s = []; for (let i = 0; i < 6; i++) s.push(String(100 + CA.rand(9000))); return s.join(' ') + ' 2026 07 15'; } });
  add('Real typing', 'k-sent', '📖', 'Sentences', 'Smooth, steady typing', 2, { mode: 'type', text: () => CA.shuffle(SENT2).slice(0, 3).join(' ') });
  add('Real typing', 'k-story', '📚', 'Story time', 'A whole paragraph', 2, { mode: 'type', text: () => CA.pick(STORY) });
  add('Real life', 'k-email', '✉️', 'An email address', 'Typing @ and . safely', 2, { mode: 'type', text: () => { const n = (CA.P().name || 'sam'); return emailText(n) + ' ' + emailText('mia') + ' ' + emailText('dad'); }, teach: 'Email addresses have an @ sign. Ask a grown-up before you ever type your own into a website.' });
  add('Real life', 'k-pass', '🔑', 'Typing passphrases', 'Long, strange and strong. Practice only: never use these!', 2, { mode: 'type', text: () => CA.shuffle(PASSES).slice(0, 3).join(' '), teach: 'These are practice passphrases. Make up your own for real accounts, and keep them secret.' });
  add('Real life', 'k-short', '⚡', 'Shortcut keys', 'Ctrl + C, V, X, Z, A and S', 2, { mode: 'combo', targets: () => CA.shuffle([['c', 'COPY'], ['v', 'PASTE'], ['x', 'CUT'], ['z', 'UNDO'], ['a', 'SELECT ALL'], ['s', 'SAVE']]).map(a => ({ k: a[0], say: a[1] })) });

  LESSONS.forEach(l => CA.items.keys.push({ id: l.id, group: l.g, emoji: l.emoji, title: l.title, blurb: l.blurb, min: l.min, route: '/keys/' + l.id }));

  CA.zoneIntro = CA.zoneIntro || {};
  CA.zoneIntro.keys = function () {
    return h('div', { class: 'card warm' }, h('b', null, '🪑 Sit like a captain'),
      h('p', { class: 'small mt8' }, 'Feet flat on the floor · back tall · elbows by your sides · wrists floating, not resting · eyes on the screen. Rest your pointer fingers on the bumps on ', h('b', null, 'F'), ' and ', h('b', null, 'J'), '.'),
      h('p', { class: 'small muted mt8' }, 'Mistakes are how fingers learn. Slow and correct beats fast and sloppy. Your keyboard is set to ' + (D().layout === 'us' ? 'US' : 'Irish/UK') + ' (a grown-up can change this in Parents).'));
  };

  /* ================= typing screen ================= */
  const isTouch = () => (('ontouchstart' in window) || navigator.maxTouchPoints > 0) && !window.matchMedia('(pointer:fine)').matches;
  let activeSoft = null;
  function attachInput(onChar, onKey) {
    const soft = document.getElementById('softkb');
    const kd = e => {
      if (e.isComposing || e.key === 'Unidentified' || e.keyCode === 229) return;
      onKey(e);
    };
    const inp = e => { const d = e.data; if (d) { for (const c of d) onChar(c); } soft.value = ''; };
    document.addEventListener('keydown', kd); soft.addEventListener('input', inp);
    CA.onLeave(() => { document.removeEventListener('keydown', kd); soft.removeEventListener('input', inp); soft.blur(); });
    return { focus() { try { soft.focus({ preventScroll: true }); } catch (e) { } } };
  }

  function screenKeys(parts) {
    const les = LESSONS.find(l => l.id === parts[1]);
    if (!les) return h('p', null, 'Lesson not found');
    const zone = CA.zone('keys'); document.getElementById('app').style.setProperty('--c', zone.color);
    const wrap = h('div', null, CA.topbar(les.title, '/zone/keys', CA.starPill()));
    const band = CA.bandIdx(), lenient = band === 0;
    const kb = CA.keyboard();
    const finger = h('div', { class: 'finger' });
    const bar = h('div', { class: 'bar mt12' }, h('i', { style: { width: '0%' } }));
    const tbox = h('div', { class: 'tbox' + (les.big || les.mode !== 'type' ? ' big' : ''), role: 'img', 'aria-label': 'Typing text' });
    let started = false, startT = 0, errors = 0, typed = 0, pos = 0, text = '', targets = null, ti = 0, finished = false, missed = {};
    const peekBtn = h('button', { class: 'btn ghost sm', onclick: () => { peek = !peek; kb.setHidden(peek); peekBtn.textContent = peek ? '👀 Show keyboard' : '🙈 Hide keyboard'; } }, '🙈 Hide keyboard');
    let peek = false;
    const tapBtn = isTouch() ? h('button', { class: 'btn sun wide mt12', onclick: () => inputApi.focus() }, '⌨️ Tap here to open the keyboard') : null;
    const inputApi = attachInput(c => handleChar(c, null), e => {
      if (finished) return;
      if (les.mode === 'combo') { if (e.ctrlKey || e.metaKey) { handleCombo(e); } return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Dead', 'AltGraph', 'ContextMenu', 'Escape'].indexOf(k) >= 0 && les.mode !== 'hunt') return;
      if (les.mode === 'hunt') { e.preventDefault(); handleHunt(e); return; }
      if (k.length === 1) { e.preventDefault(); handleChar(k, e); }
      else if (k === 'Enter' || k === 'Tab' || k === 'Backspace') { e.preventDefault(); }
    });

    function setProgress(p) { bar.firstChild.style.width = Math.round(p * 100) + '%'; }
    function drawText() {
      tbox.innerHTML = '';
      const frag = document.createDocumentFragment();
      for (let i = 0; i < text.length; i++) {
        const c = text[i]; const sp = h('span', { class: i < pos ? 'ok' : i === pos ? 'cur' : '' }, c === ' ' ? (i === pos ? '␣' : ' ') : c);
        frag.append(sp);
      }
      tbox.append(frag);
    }
    function showHint() {
      if (les.mode === 'type') { const ch = text[pos]; const i = kb.show(ch); finger.textContent = i ? i.text : ''; }
    }
    function begin() { if (!started) { started = true; startT = Date.now(); } }

    function handleChar(c, e) {
      if (finished || les.mode !== 'type') { if (les.mode === 'hunt' && !e) handleHunt({ key: c, preventDefault() { } }); return; }
      begin();
      const want = text[pos];
      if (c === want) {
        pos++; typed++; CA.sfx.click(); setProgress(pos / text.length);
        if (pos >= text.length) return done();
        drawText(); showHint();
      } else {
        errors++; typed++; missed[want] = (missed[want] || 0) + 1; CA.sfx.bad();
        tbox.classList.remove('shake'); void tbox.offsetWidth; tbox.classList.add('shake');
        const i = kb.info(want); finger.textContent = 'Not quite. Look for ' + (want === ' ' ? 'the space bar' : '“' + want + '”') + '. ' + (i ? i.text : '');
      }
    }
    function handleHunt(e) {
      begin(); const t = targets[ti]; typed++;
      if (t.m(e)) { CA.sfx.ok(); ti++; setProgress(ti / targets.length); if (ti >= targets.length) return done(); showTarget(); }
      else { errors++; CA.sfx.bad(); tbox.classList.remove('shake'); void tbox.offsetWidth; tbox.classList.add('shake'); finger.textContent = 'Nearly! Look for the glowing key.'; }
    }
    function handleCombo(e) {
      const t = targets[ti]; e.preventDefault(); begin(); typed++;
      if (e.key.toLowerCase() === t.k) { CA.sfx.ok(); ti++; setProgress(ti / targets.length); if (ti >= targets.length) return done(); showTarget(); }
      else { errors++; CA.sfx.bad(); finger.textContent = 'Not that one. Hold Ctrl and tap ' + t.k.toUpperCase() + '.'; }
    }
    function showTarget() {
      const t = targets[ti];
      if (les.mode === 'combo') {
        tbox.innerHTML = ''; tbox.append(h('div', null, 'Ctrl + ' + t.k.toUpperCase()), h('div', { class: 'small muted' }, t.say)); kb.showCombo(t.k); finger.textContent = 'Hold Ctrl with your left pinky, then tap the letter.';
        CA.say(t.say.toLowerCase() + '. Control ' + t.k);
      } else if (les.letters) {
        tbox.innerHTML = ''; tbox.append(h('div', null, t.ch.toUpperCase() + ' ' + t.ch)); const i = kb.show(t.ch); finger.textContent = 'Find the letter ' + t.ch.toUpperCase() + '. ' + (i ? i.text : ''); CA.say(t.ch);
      } else {
        tbox.innerHTML = ''; tbox.append(h('div', null, 'Find ' + t.say.toUpperCase())); kb.showNamed(t.n); finger.textContent = 'Press the glowing key!'; CA.say('Find ' + t.say);
      }
    }
    function done() {
      finished = true; kb.clear();
      const secs = Math.max(1, (Date.now() - startT) / 1000), n = (les.mode === 'type') ? text.length : targets.length;
      const acc = Math.max(0, Math.round((n / Math.max(n, n + errors)) * 100));
      const wpm = les.mode === 'type' ? Math.round((text.length / 5) / (secs / 60)) : 0;
      let stars = acc >= 97 ? 3 : acc >= 90 ? 2 : 1;
      if (lenient) stars = Math.max(stars, 2);
      CA.record(les.id, stars, { acc, wpm });
      const worst = Object.keys(missed).sort((a, b) => missed[b] - missed[a])[0];
      const lines = les.mode === 'type' ? ['Accuracy ' + acc + '%' + (D().speed || band >= 2 ? ' · speed ' + wpm + ' words a minute' : '')] : ['You got ' + n + ' right with ' + errors + ' slip' + (errors === 1 ? '' : 's') + '.'];
      const next = nextLesson();
      CA.finish({ title: stars >= 3 ? 'Brilliant typing!' : stars === 2 ? 'Nicely done!' : 'You finished!', stars, lines, message: acc < 90 && worst ? 'Slow down a little: accuracy first, speed comes later. The tricky key was ' + (worst === ' ' ? 'space' : '“' + worst + '”') + '.' : null, again: () => CA.render(), back: next ? '/keys/' + next.id : '/zone/keys' });
    }
    function nextLesson() { const vis = LESSONS.filter(l => CA.visible({ id: l.id, min: l.min })); const i = vis.findIndex(l => l.id === les.id); return stars1(vis[i]) && i >= 0 && i < vis.length - 1 ? vis[i + 1] : null; }
    function stars1(l) { return l && CA.stars(l.id) > 0; }

    if (les.mode === 'type') {
      let t = les.text ? les.text() : drill(les.newK, les.revK, lenient ? Math.round(les.len * 0.6) : les.len);
      if (les.extra) t = les.extra(t);
      text = t.trim();
    } else { targets = les.targets(); }

    if (les.teach) wrap.append(h('div', { class: 'card warm mt12' }, '💡 ' + les.teach, ' ', CA.sayBtn(les.teach)));
    wrap.append(h('div', { class: 'mt12' }, tbox, bar));
    if (tapBtn) wrap.append(tapBtn);
    wrap.append(finger, kb.el);
    const lg = h('div', { class: 'legend' }); ['LP', 'LR', 'LM', 'LI', 'RI', 'RM', 'RR', 'RP'].forEach(k => lg.append(h('span', { style: { background: kb.fingers[k].col } }, kb.fingers[k].name.replace(' finger', ''))));
    wrap.append(lg);
    wrap.append(h('div', { class: 'wrapx mt16', style: { justifyContent: 'center' } }, peekBtn, les.mode === 'type' && band <= 1 ? h('button', { class: 'btn ghost sm', onclick: () => CA.sayForce(text) }, '🔊 Read it to me') : null));
    wrap.append(h('p', { class: 'center muted small mt12' }, isTouch() ? 'No physical keyboard? Tap the button above to type with your tablet keyboard, or use a real keyboard for the best practice.' : 'Just start typing. Wrong keys never move you on, so there is no rush.'));
    if (les.mode === 'type') { drawText(); showHint(); } else showTarget();
    return wrap;
  }
  CA.screens.keys = screenKeys;
  CA.keysApi = { WORDS: GOODWORDS, drill, SENT1, SENT2, clean };
})();
