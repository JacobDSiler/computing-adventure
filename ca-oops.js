/* Computing Adventure - the "Something felt wrong?" helper. Calm, never blaming, always points to a trusted grown-up.
 * Design choices: nothing is logged or reported automatically; the child decides how to tell. It works before a profile exists. */
(function () {
  'use strict';
  const CA = window.CA, h = CA.h;

  const REGIONS = {
    IE: { name: 'Ireland', emergency: '999 or 112', lines: [
      ['Childline (ISPCC), free and private, any time', 'Call 1800 66 66 66, or text “Talk” to 50101', 'childline.ie'],
      ['Webwise, online safety advice for families', 'Ask a grown-up to look', 'webwise.ie'],
      ['Hotline.ie, report illegal content', 'A grown-up can report it', 'hotline.ie'],
      ['An Garda Síochána, if someone is in danger', 'Emergency: 999 or 112', 'garda.ie']] },
    UK: { name: 'the UK', emergency: '999', lines: [
      ['Childline, free and private, any time', 'Call 0800 1111', 'childline.org.uk'],
      ['CEOP, report online abuse of children', 'A grown-up can report it', 'ceop.police.uk'],
      ['Report Remove, help getting a nude picture taken down (under 18)', 'Run by Childline and the IWF', 'childline.org.uk']] },
    US: { name: 'the US', emergency: '911', lines: [
      ['NCMEC CyberTipline, report online exploitation', 'Call 1-800-843-5678', 'report.cybertip.org'],
      ['Take It Down, help removing private pictures (under 18)', 'Free, from NCMEC', 'takeitdown.ncmec.org'],
      ['Childhelp National Child Abuse Hotline', 'Call 1-800-422-4453', 'childhelp.org'],
      ['988 Suicide & Crisis Lifeline, if you feel very low', 'Call or text 988', '988lifeline.org']] }
  };
  CA.REGIONS = REGIONS;

  const TOPICS = [
    { id: 'upset', e: '😨', t: 'I saw something that upset or scared me', min: 0, heart: 'Seeing something upsetting is not your fault. Lots of kids see things they wish they had not, and grown-ups understand.',
      steps: ['Stop. Close it or turn the screen off.', 'Take a few slow breaths. You are safe right now.', 'Find a grown-up you trust and say: “I saw something that upset me.”', 'You do not have to describe it. Just saying it was upsetting is enough.'], tell: 'I saw something online that upset me. I am not in trouble, but I need to tell you.' },
    { id: 'mean', e: '😢', t: 'Someone was mean to me', min: 0, heart: 'Being treated badly feels awful, and it is never because of something wrong with you.',
      steps: ['Do not reply in anger.', 'Save it: take a screenshot.', 'Block or mute the person.', 'Show a grown-up. They can help make it stop.'], tell: 'Someone was mean to me online. I saved it. Can you help me?' },
    { id: 'stranger', e: '🧐', t: 'Someone I do not know is messaging me or asking me things', min: 0, heart: 'You did the right thing by noticing. Anyone who asks you to keep secrets from your family is breaking the safety rules, not you.',
      steps: ['Stop replying.', 'Do not share anything private: name, school, pictures, where you live.', 'Block them. Do not delete the messages yet, because a grown-up may need them.', 'Tell a grown-up straight away.'], tell: 'Someone I do not know has been messaging me. I stopped replying. Can you look at it with me?' },
    { id: 'shared', e: '😬', t: 'I shared something I wish I had not', min: 1, heart: 'Everyone does this at some point, even grown-ups. It can be fixed, or at least made better.',
      steps: ['Stay calm. Taking a breath helps.', 'Tell a grown-up what you shared and where.', 'Ask them to help you delete it or ask the site to remove it.', 'If you shared a password, change it together.'], tell: 'I shared something online that I wish I had not. Can you help me sort it out?' },
    { id: 'clicked', e: '🪤', t: 'I clicked something and now my device is acting strange', min: 1, heart: 'Tricks like this catch grown-ups too. You are not in trouble, and it is usually fixable.',
      steps: ['Do not click anything else.', 'Close the tab or turn the device off (hold the power button).', 'Tell a grown-up it happened. They can check it.', 'Do not type any passwords or numbers into whatever popped up.'], tell: 'I clicked something and my device is acting strange. Can you check it?' },
    { id: 'password', e: '🔑', t: 'I gave someone my password or private details', min: 1, heart: 'That is a very common trick, and you are not the first. Acting quickly helps.',
      steps: ['Tell a grown-up right now.', 'Change that password (with a grown-up), and everywhere you used it.', 'Turn on two-step login if you can.', 'Watch out for odd messages for a while.'], tell: 'I think I gave someone my password or private details. Can we change things?' },
    { id: 'money', e: '💸', t: 'I spent money by accident, or got tricked out of something', min: 1, heart: 'Those buttons are made to be easy to press, and tricks fool lots of people.',
      steps: ['Stop. Do not try to fix it by buying more.', 'Tell a grown-up straight away. They may be able to cancel it or get a refund.', 'Show them what you tapped, if you remember.'], tell: 'I spent money by accident, or I got tricked. Can you help me?' },
    { id: 'pic', e: '📸', t: 'Someone asked for a picture of me, or I sent one and I am worried', min: 2, heart: 'If anyone pressures you for pictures, that is their wrong, never yours. If you already sent one, you can still be helped, with no blame.',
      steps: ['Do not send more, and do not reply.', 'Do not delete the messages yet. Save what you can, without sharing the picture.', 'Block the person.', 'Tell a trusted adult now. You are not in trouble.', 'Ask them to use the services below to help report it and get pictures removed.'], tell: 'Someone online has been pressuring me about pictures. I am not in trouble, but I need your help. Please stay calm and listen.' },
    { id: 'unsure', e: '🤷', t: 'I am not sure. I just want to talk', min: 0, heart: 'You do not need to know exactly what is wrong. “Something feels off” is enough.',
      steps: ['Pick a grown-up you trust.', 'Say: “Can I talk to you about something I am not sure about?”', 'You can write it down or show them this screen if talking is hard.'], tell: 'Something happened online and I am not sure what to do. Can we talk?' }
  ];

  function breatheModal() {
    const c = h('div', { style: { width: '120px', height: '120px', borderRadius: '50%', background: '#bfe9d9', margin: '16px auto', display: 'grid', placeItems: 'center', fontWeight: 800, transition: 'transform 4s ease-in-out', color: '#0b6b52' } }, 'Ready');
    let n = 0, stop = false;
    const cycle = () => { if (stop) return; if (n >= 3) { c.textContent = '😌 Well done'; c.style.transform = 'scale(1)'; return; } n++; c.textContent = 'In…'; c.style.transform = 'scale(1.5)'; setTimeout(() => { if (stop) return; c.textContent = 'Hold…'; setTimeout(() => { if (stop) return; c.textContent = 'Out…'; c.style.transform = 'scale(1)'; setTimeout(cycle, 4000); }, 1500); }, 4000); };
    CA.modal(h('div', null, h('h3', null, 'Three slow breaths'), h('p', { class: 'muted mt8' }, 'Follow the circle. You are safe.'), c, h('button', { class: 'btn mint', onclick: () => { stop = true; CA.closeModal(); } }, 'Done')));
    setTimeout(cycle, 300);
  }

  function printNote(topic, trusted) {
    const w = window.open('', '_blank');
    const html = '<!doctype html><title>A note for my grown-up</title><body style="font-family:Arial,sans-serif;max-width:560px;margin:30px auto;font-size:20px;line-height:1.5"><div style="border:4px solid #000;border-radius:18px;padding:24px"><h1 style="margin-top:0">💛 A note for my grown-up</h1><p>' + (trusted ? 'Dear ' + trusted + ',' : 'Hello,') + '</p><p>Something happened online and I would like to talk to you about it.</p><p><b>It is about:</b> ' + topic.t + '</p><p>' + topic.tell + '</p><p>I am not in trouble. I am telling you because I want help. <b>Please stay calm, listen first, and thank me for telling you.</b></p><p style="margin-top:30px">From: ____________________ &nbsp; Date: __________</p></div><script>setTimeout(function(){window.print()},300)<\/script></body>';
    if (!w) { CA.toast('Your browser blocked the print window. You can show this screen to a grown-up instead.'); return; }
    w.document.write(html); w.document.close();
  }

  CA.helplines = function (region) {
    const R = REGIONS[region] || REGIONS.IE;
    return h('div', { class: 'card flat' }, h('b', null, '📞 Help in ' + R.name), h('p', { class: 'small muted mt8' }, 'A grown-up can help you contact these. In an emergency, call ' + R.emergency + '.'),
      R.lines.map(l => h('div', { style: { padding: '8px 0', borderTop: '1px solid #dbe6ee' } }, h('div', { style: { fontWeight: 800 } }, l[0]), h('div', { class: 'small' }, l[1]), h('div', { class: 'small muted' }, l[2]))));
  };

  const trusted = () => { const d = CA.D(); d.trust = d.trust || {}; const p = CA.P(); const k = p ? p.id : '_'; return (d.trust[k] = d.trust[k] || []); };

  function screenOops(parts) {
    const d = CA.D(), p = CA.P(), band = p ? CA.bandIdx() : 3;
    if (parts[1]) {
      const t = TOPICS.find(x => x.id === parts[1]); if (!t) return h('p', null, 'Not found');
      const w = h('div', null, CA.topbar('You are not in trouble', '/oops'));
      w.append(h('div', { class: 'card calm', style: { marginTop: '14px' } }, h('div', { class: 'bigem' }, '💛'), h('h2', { class: 'center' }, t.t), h('p', { class: 'mt12', style: { fontWeight: 700 } }, t.heart, ' ', CA.sayBtn(t.heart))));
      w.append(h('div', { class: 'card' }, h('h3', null, 'What to do now'), h('ol', { style: { margin: '10px 0 0 22px', lineHeight: 1.6, fontWeight: 700 } }, t.steps.map(s => h('li', { style: { margin: '6px 0' } }, s))),
        h('button', { class: 'btn mint mt12', onclick: breatheModal }, '🌬️ Take 3 slow breaths')));
      const tr = trusted();
      w.append(h('div', { class: 'card warm' }, h('h3', null, '🗣️ Tell someone you trust'), tr.length ? h('p', { class: 'small mt8' }, 'Your trusted grown-ups: ', h('b', null, tr.join(', '))) : null,
        h('p', { class: 'mt8' }, 'You could say:'), h('p', { class: 'mt8', style: { fontWeight: 800, fontStyle: 'italic' } }, '“' + t.tell + '”', ' ', CA.sayBtn(t.tell)),
        h('p', { class: 'small muted mt12' }, 'Talking is hard sometimes. You can also show a grown-up this screen, or print a note and hand it over.'),
        h('div', { class: 'wrapx mt12' }, h('button', { class: 'btn', onclick: () => printNote(t, tr[0]) }, '🖨️ Print a note for my grown-up'), h('button', { class: 'btn ghost', onclick: () => CA.go('/oops') }, 'Back to the list'))));
      if (band >= 1 && (t.id === 'pic' || t.id === 'stranger' || t.id === 'upset' || t.id === 'mean' || t.id === 'unsure')) w.append(CA.helplines(d.region));
      else if (band >= 1) w.append(h('p', { class: 'small muted center' }, 'More help lines are on the main Help page.'));
      w.append(h('p', { class: 'small muted center mt12' }, 'This helper does not tell anyone by itself. You choose who to tell and how.'));
      return w;
    }
    const w = h('div', null, CA.topbar('💛 Help', '/'));
    w.append(h('div', { class: 'card calm', style: { marginTop: '14px' } }, h('div', { class: 'bigem' }, '💛'), h('h2', { class: 'center' }, 'You are not in trouble.'),
      h('p', { class: 'mt8 center', style: { fontWeight: 700 } }, 'If something online felt wrong, scary, mean or confusing, you are in the right place. Tap the one that fits best. You never have to say everything.', ' ', CA.sayBtn('You are not in trouble. If something online felt wrong, scary, mean or confusing, you are in the right place. Tap the one that fits best.'))));
    TOPICS.filter(t => !p || t.min <= band).forEach(t => w.append(h('button', { class: 'labcard', onclick: () => CA.go('/oops/' + t.id) }, h('span', { class: 'em' }, t.e), h('span', { style: { flex: 1, fontWeight: 800 } }, t.t))));
    // trusted adults (kept only on this device)
    const box = h('div', { class: 'card flat mt16' }), tr = trusted();
    const draw = () => {
      box.innerHTML = ''; box.append(h('b', null, '🧑‍🤝‍🧑 My trusted grown-ups'), h('p', { class: 'small muted mt8' }, 'Who could you tell? Add up to five. This stays on this device only.'));
      const row = h('div', { class: 'wrapx mt8' }); tr.forEach((n, i) => row.append(h('button', { class: 'chip', onclick: () => { tr.splice(i, 1); CA.save(); draw(); }, 'aria-label': 'Remove ' + n }, n + ' ✕')));
      box.append(row);
      if (tr.length < 5) { const inp = h('input', { class: 'inp', maxlength: 20, placeholder: 'Mum, Dad, Gran, Teacher…', style: { marginTop: '8px' } }); const add = () => { const v = inp.value.trim(); if (v) { tr.push(v); CA.save(); draw(); } }; inp.addEventListener('keydown', e => { if (e.key === 'Enter') add(); }); box.append(inp, h('button', { class: 'btn sm mt8', onclick: add }, 'Add')); }
    };
    draw(); w.append(box);
    w.append(h('div', { class: 'card warm' }, h('b', null, '🚨 In danger right now?'), h('p', { class: 'small mt8' }, 'Tell a grown-up near you straight away. Or ask them to call ' + (REGIONS[d.region] || REGIONS.IE).emergency + '.')));
    if (band >= 1) w.append(CA.helplines(d.region));
    w.append(h('p', { class: 'small muted center mt12' }, 'This page does not record or report anything. It helps you decide what to do and who to tell.'));
    return w;
  }
  CA.screens.oops = screenOops;
})();
