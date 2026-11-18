/* Computing Adventure - parent area: progress, settings, conversation starters, family pact, resources, privacy. */
(function () {
  'use strict';
  const CA = window.CA, h = CA.h, D = () => CA.D();
  const UNLOCK_MS = 10 * 60 * 1000;
  let tab = 'progress';

  function unlocked() { try { if (CA.fromHarbor && sessionStorage.getItem('ca_harbor_parent')) return true; return Date.now() - Number(sessionStorage.getItem('ca_unlock') || 0) < UNLOCK_MS; } catch (e) { return false; } }
  const unlock = () => { try { sessionStorage.setItem('ca_unlock', String(Date.now())); } catch (e) { } };

  function gate() {
    const d = D(), real = d.pin || d.famPin, wrap = h('div', null, CA.topbar('🔒 Parents', '/')), msg = h('div', { class: 'feedback' });
    const inp = h('input', { class: 'inp mono', type: 'password', inputmode: 'numeric', maxlength: 4, placeholder: '••••', style: { textAlign: 'center', fontSize: '1.6rem', letterSpacing: '8px', maxWidth: '220px', margin: '0 auto', display: 'block' } });
    if (!real) {
      wrap.append(h('div', { class: 'card center' }, h('div', { class: 'bigem' }, '🔑'), h('h3', null, 'Set a parent PIN'), h('p', { class: 'muted small mt8' }, 'Four digits. It keeps settings and the family tools for grown-ups.'), h('div', { class: 'mt12' }, inp), msg,
        h('button', { class: 'btn mint mt12', onclick: () => { if (!/^\d{4}$/.test(inp.value)) { msg.textContent = 'Please use exactly 4 digits.'; msg.className = 'feedback bad'; return; } d.pin = inp.value; CA.save(); unlock(); CA.render(); } }, 'Save PIN')));
      return wrap;
    }
    inp.addEventListener('input', () => { if (inp.value === d.pin || inp.value === d.famPin) { unlock(); CA.render(); } else if (inp.value.length === 4) { msg.textContent = 'That is not the PIN.'; msg.className = 'feedback bad'; inp.value = ''; CA.sfx.bad(); } });
    wrap.append(h('div', { class: 'card center' }, h('div', { class: 'bigem' }, '🔒'), h('h3', null, 'Grown-ups only'), h('p', { class: 'muted small mt8' }, 'Enter the parent PIN. If you joined a family code, the family PIN from Math Adventure also works.'), h('div', { class: 'mt12' }, inp), msg,
      h('p', { class: 'small muted mt12' }, 'Children never need this page. The 💛 Help button works without a PIN, always.')));
    setTimeout(() => inp.focus(), 50); return wrap;
  }

  const TALK = {
    's-secret': 'Who do you think should know your passwords? Can we make a family rule about it together?', 's-private': 'What are three things you would never put on a profile? Why?', 's-yucky': 'If you saw something that scared you, who would you tell first? What would you want me to do?',
    's-popups': 'Have you ever seen a pop-up that tried to trick you? What did it say?', 's-friends': 'What would make you feel unsure about someone you met in a game? How would you tell me about it?', 's-photos': 'What can a photo tell a stranger without you meaning it to?',
    's-phish': 'What clues tell you a message might be a scam? Shall we choose a family safe word?', 's-download': 'What should we do before installing a new app or buying anything in a game?', 's-habits': 'How do you feel after a long time on screens? What helps you wind down?',
    's-real': 'How can we check whether a picture or story online is real?', 's-scam': 'If someone called sounding like me asking for money or a code, what would you do?', 's-privacy': 'Shall we sit together and check the privacy settings on your accounts?',
    's-pressure': 'If anyone ever pressures you for pictures, I will never be cross with you for telling me. What would make it easier to tell me?',
    'e-sprout': 'What kind words did someone say to you today?', 'e-think': 'What is a time you nearly posted something you were glad you did not?', 'e-write': 'What is the nicest comment you have ever received?', 'e-upstander': 'What could you do if you saw someone being picked on in a group chat?',
    'e-mean': 'If someone was unkind to you online, what would help you most from me?', 'e-tone': 'Has a message ever sounded cross when it was not meant to?', 'e-footprint': 'What would you not want your gran or a future boss to see?', 'e-games': 'What makes a good teammate online?',
    'e-calls': 'What are some good manners for video calls?', 'e-credit': 'When is it fair to use someone else’s idea or picture?'
  };

  function pactHtml() {
    return '<!doctype html><title>Our Family Tech Promise</title><body style="font-family:Arial,sans-serif;max-width:640px;margin:26px auto;font-size:18px;line-height:1.5"><div style="border:4px solid #000;border-radius:18px;padding:24px"><h1 style="margin-top:0;text-align:center">💛 Our Family Tech Promise</h1>' +
      '<h2>Kid promises</h2><ul><li>I will ask before I download, buy, sign up or share a photo.</li><li>I will keep passwords and private things private.</li><li>I will be kind online, even when no one is watching.</li><li>If anything online feels wrong, scary or confusing, <b>I will tell you</b>. I know the Stop · Block · Tell rule.</li></ul>' +
      '<h2>Grown-up promises</h2><ul><li>I will stay calm and listen first.</li><li>I will say “thank you for telling me”.</li><li><b>I will not take away your devices or punish you for telling me</b> about something that happened online.</li><li>I will help fix it, and learn alongside you.</li><li>I will follow these rules too.</li></ul>' +
      '<p>Our family safe word: ____________________</p><p>Trusted grown-ups I can tell: ______________________________________</p><p style="margin-top:28px">Kid: ______________________ &nbsp; Grown-up: ______________________ &nbsp; Date: ___________</p></div><script>setTimeout(function(){window.print()},300)<\/script></body>';
  }

  function progressTab() {
    const box = h('div', null);
    D().profiles.forEach(p => {
      const pr = CA.PR(p.id);
      const rows = CA.ZONES.map(z => { const st = CA.zoneStatus(z, p.id); return h('tr', null, h('td', null, z.e + ' ' + z.title), h('td', null, st.done + '/' + st.total), h('td', null, st.badge ? z.badge.emoji : '·')); });
      let best = 0, accs = []; Object.keys(pr.done).forEach(k => { if (k.indexOf('k-') === 0) { const r = pr.done[k]; if (r.wpm > best) best = r.wpm; if (r.acc) accs.push(r.acc); } });
      const bandSel = h('select', { class: 'inp', style: { width: 'auto', padding: '6px 10px' }, onchange: e => { p.band = e.target.value; CA.save(); CA.toast('Level changed'); } }, CA.BANDS.map(b => h('option', { value: b.id, selected: b.id === p.band }, b.name + ' (' + b.ages + ')')));
      box.append(h('div', { class: 'card' }, h('div', { class: 'row' }, h('span', { style: { fontSize: '2.2rem' } }, p.avatar), h('div', { style: { flex: 1 } }, h('b', null, p.name), h('div', { class: 'small muted' }, '⭐ ' + CA.totalStars(p.id) + ' stars')), bandSel),
        h('table', { class: 'plain mt12' }, h('thead', null, h('tr', null, ['Zone', 'Done', 'Badge'].map(x => h('th', null, x)))), h('tbody', null, rows)),
        h('p', { class: 'small muted mt8' }, accs.length ? 'Typing: best speed ' + best + ' words per minute, average accuracy ' + Math.round(accs.reduce((a, v) => a + v, 0) / accs.length) + '%.' : 'No typing lessons finished yet.')));
    });
    if (!D().profiles.length) box.append(h('p', { class: 'muted' }, 'No explorers yet.'));
    return box;
  }

  function settingsTab() {
    const d = D(), box = h('div', null);
    const sel = (label, key, opts) => h('div', { class: 'toggle' }, h('span', null, label), h('select', { class: 'inp', style: { width: 'auto', padding: '6px 10px' }, onchange: e => { d[key] = e.target.value; CA.save(); CA.toast('Saved'); } }, opts.map(o => h('option', { value: o[0], selected: d[key] === o[0] }, o[1]))));
    const chk = (label, key) => h('label', { class: 'toggle' }, label, h('input', { type: 'checkbox', checked: !!d[key], onchange: e => { d[key] = e.target.checked; CA.save(); } }));
    box.append(h('div', { class: 'card' }, h('h3', null, '⚙️ Settings'),
      sel('Keyboard layout', 'layout', [['ie', 'Irish / UK'], ['us', 'US']]), sel('Country for help lines', 'region', [['IE', 'Ireland'], ['UK', 'United Kingdom'], ['US', 'United States']]),
      chk('Sound effects', 'sound'), chk('Read aloud for little ones', 'tts'), chk('Always show typing speed (words per minute)', 'speed'), chk('Show activities for every age level', 'showAll')));
    const hide = h('div', { class: 'card' }, h('h3', null, '🙈 Hide an activity'), h('p', { class: 'small muted mt8' }, 'You can hide any activity for all children. Safe Harbor and Kind Corner topics are listed so you can preview them first.'));
    ['safe', 'kind'].forEach(z => CA.items[z].forEach(it => hide.append(h('label', { class: 'toggle' }, h('span', null, it.emoji + ' ' + it.title, h('span', { class: 'small muted' }, ' (' + CA.BANDS[it.min].name + '+)')), h('input', { type: 'checkbox', checked: !!d.hide[it.id], onchange: e => { if (e.target.checked) d.hide[it.id] = 1; else delete d.hide[it.id]; CA.save(); } })))));
    box.append(hide);
    const code = h('input', { class: 'inp', placeholder: 'MA-AB12', maxlength: 7, value: d.fam || '', oninput: e => { e.target.value = CA.fmtFam(e.target.value); } }), msg = h('div', { class: 'feedback' });
    box.append(h('div', { class: 'card' }, h('h3', null, '🏠 Family code'), h('p', { class: 'small muted mt8' }, 'Share stars and badges across devices, and import children from Harbor. Only progress is shared; nothing children type is stored.'), h('div', { class: 'row mt8' }, code, h('button', { class: 'btn', onclick: async () => { const r = await CA.joinFamily(code.value); msg.textContent = r.msg; msg.className = 'feedback ' + (r.ok ? 'good' : 'bad'); } }, 'Join')),
      d.fam ? h('button', { class: 'btn ghost sm mt8', onclick: () => { CA.leaveFamily(); CA.render(); } }, 'Leave ' + d.fam) : null, msg));
    const pin = h('input', { class: 'inp', type: 'password', inputmode: 'numeric', maxlength: 4, placeholder: 'New 4-digit PIN' });
    box.append(h('div', { class: 'card' }, h('h3', null, '🔑 Change PIN'), h('div', { class: 'row mt8' }, pin, h('button', { class: 'btn', onclick: () => { if (/^\d{4}$/.test(pin.value)) { d.pin = pin.value; CA.save(); CA.toast('PIN changed'); pin.value = ''; } else CA.toast('Use exactly 4 digits'); } }, 'Save'))));
    return box;
  }

  function talkTab() {
    const box = h('div', null, h('p', { class: 'muted small' }, 'Short chats work better than big lectures. Pick a topic your child has just played, and ask one question. Listen more than you talk.'));
    ['safe', 'kind'].forEach(z => { box.append(h('h3', { class: 'sec' }, CA.zone(z).e + ' ' + CA.zone(z).title)); CA.items[z].forEach(it => TALK[it.id] ? box.append(h('div', { class: 'card flat' }, h('b', null, it.emoji + ' ' + it.title), h('p', { class: 'mt8' }, '“' + TALK[it.id] + '”'))) : null); });
    return box;
  }

  function pactTab() {
    return h('div', null, h('div', { class: 'card calm' }, h('h3', null, '💛 The Family Tech Promise'),
      h('p', { class: 'mt8' }, 'Children tell us about problems when they believe it is safe to. The most protective thing a family can do is agree, in advance and out loud, that telling is always welcome and never punished.'),
      h('p', { class: 'mt8' }, 'Print this promise, talk it through, and sign it together. Choose a family safe word as well (a secret word that proves a call or message really is from you).'),
      h('button', { class: 'btn mt12', onclick: () => { const w = window.open('', '_blank'); if (!w) { CA.toast('Pop-up blocked. Allow pop-ups for this site to print.'); return; } w.document.write(pactHtml()); w.document.close(); } }, '🖨️ Print the promise')));
  }

  function resourcesTab() {
    const d = D(), box = h('div', null);
    box.append(h('div', { class: 'card warm' }, h('b', null, '⚠️ Please check'), h('p', { class: 'small mt8' }, 'Help line numbers and website names change. Check each one yourself before you rely on it, and keep your local ones handy.')));
    box.append(CA.helplines(d.region));
    box.append(h('div', { class: 'card' }, h('h3', null, 'If your child has had a bad experience'),
      h('ul', { style: { margin: '10px 0 0 20px', lineHeight: 1.6 } }, [
        'Stay calm, listen, and say “thank you for telling me. You are not in trouble.”', 'Believe them, and do not blame. The fault lies with whoever pressured, tricked or hurt them.',
        'Do not delete messages or accounts yet. Take screenshots so the evidence is kept (not of explicit images of a child: do not copy or forward those).', 'Block the person and use the platform’s report tool. For serious matters, contact the police or the services in Resources.',
        'Change passwords and turn on two-step login if accounts may be affected.', 'Keep the door open. Check in gently over the next days. Consider talking to your GP or school about extra support if they seem worried or low.'].map(t => h('li', null, t)))));
    return box;
  }

  function privacyTab() {
    return h('div', null, h('div', { class: 'card' }, h('h3', null, '🔒 How this app handles data'),
      h('ul', { style: { margin: '10px 0 0 20px', lineHeight: 1.6 } }, [
        'No ads, no trackers, no analytics, and no real strangers. Every chat, email, pop-up and computer in this app is a simulation.',
        'Text children type into pretend posts, notes or password practice is never saved or sent. It disappears when the page changes.',
        'Stars, badges and the child’s chosen name and avatar are stored on this device. If you join a family code they sync to your family’s Firebase document (shared with Math/Words/Music Adventure).',
        'The 💛 Help page does not record, report or alert anyone. This is deliberate: children are more likely to use a helper that is private and blame-free. Please make sure they know they can always come to you.',
        'Trusted grown-up names a child adds on the Help page stay on that device only.'].map(t => h('li', null, t)))));
  }

  CA.screens.parent = function () {
    if (!unlocked()) return gate();
    const TABS = [['progress', '📊 Progress'], ['settings', '⚙️ Settings'], ['talk', '💬 Talk together'], ['pact', '💛 Family promise'], ['help', '📞 Resources'], ['privacy', '🔒 Privacy']];
    const wrap = h('div', null, CA.topbar('🔒 Parents', '/')), body = h('div', null);
    const draw = () => { body.innerHTML = ''; ({ progress: progressTab, settings: settingsTab, talk: talkTab, pact: pactTab, help: resourcesTab, privacy: privacyTab })[tab]().childNodes && body.append(({ progress: progressTab, settings: settingsTab, talk: talkTab, pact: pactTab, help: resourcesTab, privacy: privacyTab })[tab]()); tabs.innerHTML = ''; TABS.forEach(t => tabs.append(h('button', { class: tab === t[0] ? 'on' : '', onclick: () => { tab = t[0]; draw(); } }, t[1]))); };
    const tabs = h('div', { class: 'tabs' }); wrap.append(tabs, body);
    wrap.append(h('button', { class: 'btn ghost wide mt16', onclick: () => { try { sessionStorage.removeItem('ca_unlock'); sessionStorage.removeItem('ca_harbor_parent'); } catch (e) { } CA.go('/'); } }, 'Lock & leave'));
    draw(); return wrap;
  };
})();
