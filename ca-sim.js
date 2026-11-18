/* Computing Adventure - Desktop Quest: a pretend computer (windows, Start menu, Notes, Files, Settings, Browser) plus guided missions.
 * Everything here is a simulation. Nothing typed is saved or sent anywhere. */
(function () {
  'use strict';
  const CA = window.CA, h = CA.h;

  const QUESTS = [
    { id: 'q-start', emoji: '🚪', title: 'Meet your desktop', blurb: 'Start menu, icons, opening and closing', min: 0, steps: [
      { t: 'Click the green Start button', hint: 'It is in the bottom-left corner.', ev: 'start:open' },
      { t: 'Open Notes from the Start menu', hint: 'Click once on 📝 Notes in the list.', ev: 'app:notes' },
      { t: 'Close the Notes window with the red-ish ✕', hint: 'The ✕ is in the top-right corner of the window.', ev: 'win:close' },
      { t: 'Double-click the Files icon on the desktop', hint: 'Two quick clicks (or taps) on 📁 Files.', ev: 'icon:dbl:files' },
      { t: 'Hide the window with the − button', hint: 'The − is next to the ✕. The window is not gone, only tucked away.', ev: 'win:min' },
      { t: 'Bring it back from the taskbar at the bottom', hint: 'Click the Files button in the dark bar along the bottom.', ev: 'win:restore' }] },
    { id: 'q-win', emoji: '🪟', title: 'Window wrangler', blurb: 'Move, grow, shrink and switch windows', min: 0, steps: [
      { t: 'Open Notes and Files (Start menu or desktop icons)', hint: 'Open both so you have two windows.', test: l => l.has('app:notes') && l.has('app:files') },
      { t: 'Drag a window by its title bar to move it', hint: 'Press on the coloured bar at the top of a window, hold, and move.', ev: 'win:drag' },
      { t: 'Make a window fill the screen with the □ button', hint: 'The □ is between − and ✕.', ev: 'win:max' },
      { t: 'Click □ again to shrink it back', hint: 'Same button, second click.', ev: 'win:unmax' },
      { t: 'Switch windows by clicking the other one', hint: 'Click anywhere on the other window, or its taskbar button.', ev: 'win:switch' }] },
    { id: 'q-note', emoji: '📝', title: 'Write and save a note', blurb: 'Type, save, find it again', min: 1, steps: [
      { t: 'Open Notes', hint: 'Start menu → Notes, or double-click the Notes icon.', ev: 'app:notes' },
      { t: 'Type at least ten letters about your day', hint: 'Click in the white writing area first.', ev: 'note:typed10' },
      { t: 'Save it with the Save button, and give it a name', hint: 'Type a name, then press OK or Enter.', ev: 'note:saved' },
      { t: 'Open Files and go into Documents', hint: 'Double-click Files, then click Documents on the left.', ev: 'folder:Documents' },
      { t: 'Double-click your note to open it again', hint: 'It is in Documents, with the name you chose.', ev: 'file:open:mine' }] },
    { id: 'q-files', emoji: '🗂️', title: 'Folders and files', blurb: 'Make, rename, copy, delete and rescue', min: 1, steps: [
      { t: 'Open Files and go into Documents', hint: 'Double-click Files. Click Documents on the left.', ev: 'folder:Documents' },
      { t: 'Make a New folder', hint: 'Click 📁 New folder in the toolbar, or right-click empty space.', ev: 'folder:new' },
      { t: 'Rename the folder', hint: 'Click the folder once so it is selected, then press ✏️ Rename.', ev: 'rename' },
      { t: 'Copy a file, then paste it', hint: 'Click a file, press 📋 Copy, then press 📥 Paste.', test: l => l.has('copy') && l.has('paste') },
      { t: 'Delete a file', hint: 'Click a file, then press 🗑️ Delete. It goes to the Bin.', ev: 'delete' },
      { t: 'Open the Bin and restore it', hint: 'Click Bin on the left, choose the file, press ♻️ Restore.', ev: 'restore' }] },
    { id: 'q-set', emoji: '⚙️', title: 'Settings detective', blurb: 'Change how your computer looks and sounds', min: 1, steps: [
      { t: 'Open Settings', hint: 'Start menu → ⚙️ Settings.', ev: 'app:settings' },
      { t: 'Switch to Dark mode', hint: 'Look in Display.', ev: 'theme:dark' },
      { t: 'Move the volume slider', hint: 'Look in Sound.', ev: 'volume' },
      { t: 'Look at the Wi-Fi page', hint: 'Network is in the list on the left.', ev: 'wifi:view' },
      { t: 'Find the Privacy page and see which apps use the camera', hint: 'Privacy is in the list on the left.', ev: 'privacy:view' }] },
    { id: 'q-web', emoji: '🌐', title: 'Web explorer', blurb: 'Address bar, search, tabs, pop-ups', min: 2, steps: [
      { t: 'Open the Browser', hint: 'Desktop icon or Start menu.', ev: 'app:browser' },
      { t: 'Type kids.example in the address bar and press Enter', hint: 'The address bar is the long box at the top. It is NOT the search box inside the page.', ev: 'browser:url:kids.example' },
      { t: 'Use the page’s search box to search for owls', hint: 'Type owls in the box inside the page.', ev: 'browser:search' },
      { t: 'Press the ← Back button', hint: 'Top-left of the browser.', ev: 'browser:back' },
      { t: 'Open the shoe shop (shop.example) and close the pop-up with the SMALL ✕', hint: 'Careful! The big shiny button is a trap. The small ✕ is the safe way out. Visit shop.example from the address bar or from Kids Corner.', ev: 'popup:closed' },
      { t: 'Click the 🔒 padlock to see what it says', hint: 'It is at the left of the address bar.', ev: 'browser:padlock' },
      { t: 'Bookmark a page with the ☆ star', hint: 'Top-right of the browser bar.', ev: 'browser:bookmark' }] },
    { id: 'q-short', emoji: '⚡', title: 'Shortcut power', blurb: 'Select, copy, paste and undo with the keyboard', min: 2, steps: [
      { t: 'Open Notes and type a few words', hint: 'Click in the writing area first.', ev: 'note:typed10' },
      { t: 'Select everything with Ctrl + A', hint: 'Hold Ctrl, tap A.', ev: 'did:selectall' },
      { t: 'Copy it with Ctrl + C', hint: 'Hold Ctrl, tap C.', ev: 'did:copy' },
      { t: 'Press the End key, then paste with Ctrl + V', hint: 'Click at the end of your text, then Ctrl and V.', ev: 'did:paste' },
      { t: 'Undo the paste with Ctrl + Z', hint: 'Hold Ctrl, tap Z.', ev: 'did:undo' },
      { t: 'Save with Ctrl + S', hint: 'Hold Ctrl, tap S, type a name, press Enter.', ev: 'note:saved:key' }] }
  ];
  QUESTS.forEach(q => CA.items.desk.push({ id: q.id, emoji: q.emoji, title: q.title, blurb: q.blurb, min: q.min, route: '/quest/' + q.id }));

  /* ================= the pretend computer ================= */
  function createDesk(emit) {
    const D = { wins: [], z: 10, front: null, sel: null, clip: null, bookmarks: {}, nextId: 100, mine: null };
    const nodes = {};
    const mk = (id, name, kind, parent, text) => { nodes[id] = { id, name, kind, parent, text: text || '' }; return nodes[id]; };
    mk('docs', 'Documents', 'folder', 'root'); mk('pics', 'Pictures', 'folder', 'root'); mk('bin', 'Bin', 'folder', 'root');
    mk('n1', 'Homework.txt', 'text', 'docs', 'Read chapter three and draw a map.'); mk('n2', 'Shopping list.txt', 'text', 'docs', 'Apples, bread, milk.');
    mk('n3', 'Cat.png', 'image', 'pics'); mk('n4', 'Beach.png', 'image', 'pics'); mk('n5', 'Robot drawing.png', 'image', 'pics');

    const el = h('div', { class: 'desk' });
    const layer = h('div', { style: { position: 'absolute', inset: '0 0 44px 0' } });
    const tbBtns = h('div', { style: { display: 'flex', gap: '6px', flex: 1, overflow: 'hidden' } });
    const clock = h('div', { class: 'clk' }, new Date().toTimeString().slice(0, 5));
    let menuEl = null, startEl = null;
    const startBtn = h('button', { class: 'start', onclick: e => { e.stopPropagation(); toggleStart(); } }, '▶ Start');
    el.append(layer, h('div', { class: 'tb' }, startBtn, tbBtns, clock));
    const closeMenus = () => { if (menuEl) { menuEl.remove(); menuEl = null; } if (startEl) { startEl.remove(); startEl = null; } };
    el.addEventListener('pointerdown', e => { if (!e.target.closest('.ctxmenu,.startmenu') && !e.target.closest('.start')) closeMenus(); });
    el.addEventListener('contextmenu', e => { e.preventDefault(); });

    function ctxMenu(x, y, entries) {
      closeMenus(); const r = el.getBoundingClientRect();
      menuEl = h('div', { class: 'ctxmenu', style: { left: CA.clamp(x - r.left, 4, r.width - 180) + 'px', top: CA.clamp(y - r.top, 4, r.height - 60 - entries.length * 34) + 'px', zIndex: 80 } },
        entries.map(([t, fn]) => h('button', { onclick: e => { e.stopPropagation(); closeMenus(); fn(); } }, t)));
      el.append(menuEl);
    }
    function toggleStart() {
      if (startEl) { closeMenus(); return; } closeMenus(); emit('start:open');
      startEl = h('div', { class: 'startmenu' }, [['📝', 'Notes', 'notes'], ['📁', 'Files', 'files'], ['🌐', 'Browser', 'browser'], ['⚙️', 'Settings', 'settings']].map(a => h('button', { onclick: e => { e.stopPropagation(); closeMenus(); open(a[2]); } }, h('span', null, a[0]), a[1])),
        h('button', { onclick: e => { e.stopPropagation(); closeMenus(); CA.toast('This pretend computer stays on. 😊'); } }, h('span', null, '⏻'), 'Shut down (pretend)'));
      el.append(startEl);
    }

    /* desktop icons */
    const ICONS = [['📁', 'Files', 'files', 12, 12], ['📝', 'Notes', 'notes', 12, 100], ['🌐', 'Browser', 'browser', 12, 188], ['⚙️', 'Settings', 'settings', 12, 276], ['🗑️', 'Bin', 'bin', 100, 12]];
    ICONS.forEach(([i, n, app, x, y]) => {
      const b = h('button', { class: 'dicon', style: { left: x + 'px', top: y + 'px' } }, h('span', { class: 'i' }, i), n);
      let last = 0;
      b.addEventListener('click', e => { e.stopPropagation(); layer.querySelectorAll('.dicon.sel').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); const now = Date.now(); if (now - last < 600) { emit('icon:dbl:' + (app === 'bin' ? 'files' : app)); open(app === 'bin' ? 'files' : app, app === 'bin' ? { cwd: 'bin' } : null); last = 0; } else last = now; });
      layer.append(b);
    });
    layer.addEventListener('pointerdown', e => { if (e.target === layer) layer.querySelectorAll('.dicon.sel').forEach(x => x.classList.remove('sel')); });
    layer.addEventListener('contextmenu', e => { if (e.target !== layer) return; e.preventDefault(); emit('desk:rightclick'); ctxMenu(e.clientX, e.clientY, [['🖼️ Change wallpaper', () => { el.classList.toggle('dark'); emit('wallpaper'); }], ['🔄 Refresh', () => CA.toast('Refreshed!')]]); });

    /* windows */
    const APPS = { notes: { t: '📝 Notes', w: 380, h: 270 }, files: { t: '📁 Files', w: 440, h: 300 }, browser: { t: '🌐 Browser', w: 520, h: 340 }, settings: { t: '⚙️ Settings', w: 460, h: 320 } };
    function syncTb() {
      tbBtns.innerHTML = '';
      D.wins.forEach(w => tbBtns.append(h('button', { class: D.front === w && !w.min ? 'on' : '', onclick: () => { if (w.min) { w.min = false; w.el.classList.remove('hide'); emit('win:restore'); focus(w); } else if (D.front === w) { w.min = true; w.el.classList.add('hide'); emit('win:min'); D.front = null; syncTb(); } else focus(w); } }, w.title)));
    }
    function focus(w) {
      const was = D.front; D.front = w; w.el.style.zIndex = ++D.z; D.wins.forEach(x => x.el.classList.toggle('front', x === w));
      if (was && was !== w && D.wins.filter(x => !x.min).length >= 2) emit('win:switch'); syncTb();
    }
    function closeWin(w) { w.el.remove(); D.wins = D.wins.filter(x => x !== w); if (D.front === w) D.front = null; emit('win:close'); syncTb(); }
    function open(app, opts) {
      const spec = APPS[app]; const dw = el.clientWidth || 700;
      const w = { app, title: spec.t, min: false, max: false, opts: opts || {} };
      const W = Math.min(spec.w, dw - 20), n = D.wins.length;
      const body = h('div', { class: 'body' });
      const tbar = h('div', { class: 'tbar' }, h('span', { class: 't' }, spec.t),
        h('button', { 'aria-label': 'Minimise', onclick: e => { e.stopPropagation(); w.min = true; w.el.classList.add('hide'); D.front = null; emit('win:min'); syncTb(); } }, '−'),
        h('button', { 'aria-label': 'Maximise', onclick: e => { e.stopPropagation(); w.max = !w.max; w.el.classList.toggle('max', w.max); emit(w.max ? 'win:max' : 'win:unmax'); } }, '□'),
        h('button', { class: 'x', 'aria-label': 'Close', onclick: e => { e.stopPropagation(); closeWin(w); } }, '✕'));
      w.el = h('div', { class: 'win', style: { left: (14 + n * 26 + (app === 'browser' ? 40 : 0)) + 'px', top: (14 + n * 24) + 'px', width: W + 'px', height: spec.h + 'px' } }, tbar, body);
      layer.append(w.el); D.wins.push(w); w.body = body;
      w.el.addEventListener('pointerdown', () => { if (D.front !== w) focus(w); });
      let dragging = false, ox = 0, oy = 0, moved = 0;
      tbar.addEventListener('pointerdown', e => { if (e.target.tagName === 'BUTTON' || w.max) return; dragging = true; moved = 0; tbar.setPointerCapture(e.pointerId); ox = e.clientX - w.el.offsetLeft; oy = e.clientY - w.el.offsetTop; });
      tbar.addEventListener('pointermove', e => { if (!dragging) return; const nl = CA.clamp(e.clientX - ox, -w.el.offsetWidth + 60, layer.clientWidth - 60), nt = CA.clamp(e.clientY - oy, 0, layer.clientHeight - 30); moved += Math.abs(nl - w.el.offsetLeft) + Math.abs(nt - w.el.offsetTop); w.el.style.left = nl + 'px'; w.el.style.top = nt + 'px'; if (moved > 12) { emit('win:drag'); moved = -1e9; } });
      tbar.addEventListener('pointerup', () => { dragging = false; });
      tbar.addEventListener('dblclick', e => { if (e.target.tagName !== 'BUTTON') { w.max = !w.max; w.el.classList.toggle('max', w.max); emit(w.max ? 'win:max' : 'win:unmax'); } });
      emit('app:' + app); APP[app](w); focus(w); return w;
    }
    CA.onLeave(() => { D.wins = []; });

    /* ---- Notes ---- */
    function openNote(w) {
      const ta = h('textarea', { style: { width: '100%', height: '150px', border: '2px solid #dbe6ee', borderRadius: '8px', padding: '8px', fontSize: '.95rem', resize: 'none' }, placeholder: 'Write something here…' });
      const name = h('input', { class: 'inp', style: { padding: '6px 10px', width: '170px' }, placeholder: 'Name your note', maxlength: 24 });
      const saveRow = h('div', { class: 'row hide', style: { marginTop: '6px' } }, name, h('button', { class: 'btn sm mint', onclick: () => doSave(false) }, 'OK'));
      const status = h('div', { class: 'small muted', style: { marginTop: '6px' } }, w.opts.file ? 'Opened ' + w.opts.file.name : 'New note (not saved yet)');
      let file = w.opts.file || null; if (file) ta.value = file.text;
      let fired = false, viaKey = false;
      function doSave(key) {
        if (key || viaKey) viaKey = true;
        if (!file) { const n = (name.value || '').trim(); if (!n) { saveRow.classList.remove('hide'); name.focus(); return; } file = mk('u' + (D.nextId++), n.replace(/\.txt$/i, '') + '.txt', 'text', 'docs'); D.mine = file.id; }
        file.text = ta.value; saveRow.classList.add('hide'); status.textContent = 'Saved as ' + file.name + ' in Documents ✔'; emit('note:saved'); if (viaKey) emit('note:saved:key'); viaKey = false;
      }
      ta.addEventListener('input', () => { if (!fired && ta.value.trim().length >= 10) { fired = true; emit('note:typed10'); } });
      ta.addEventListener('keydown', e => {
        const k = e.key.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && k === 's') { e.preventDefault(); doSave(true); }
        else if ((e.ctrlKey || e.metaKey) && k === 'a') emit('did:selectall');
        else if ((e.ctrlKey || e.metaKey) && k === 'z') emit('did:undo');
      });
      name.addEventListener('keydown', e => { if (e.key === 'Enter') doSave(false); });
      ta.addEventListener('copy', () => emit('did:copy')); ta.addEventListener('cut', () => emit('did:cut')); ta.addEventListener('paste', () => emit('did:paste'));
      w.body.append(h('div', { class: 'row', style: { marginBottom: '6px' } }, h('button', { class: 'btn sm', onclick: () => doSave(false) }, '💾 Save'), h('button', { class: 'btn sm ghost', onclick: () => { ta.value = ''; file = null; status.textContent = 'New note (not saved yet)'; } }, '📄 New')), ta, saveRow, status);
      setTimeout(() => ta.focus(), 30);
    }

    /* ---- Files ---- */
    function openFiles(w) {
      let cwd = (w.opts && w.opts.cwd) || 'docs', sel = null, renaming = null;
      const nm = id => nodes[id] ? nodes[id].name : 'This PC';
      const list = h('div', { style: { minHeight: '150px', overflow: 'auto', flex: 1 } }), crumbs = h('div', { class: 'small', style: { fontWeight: 800, marginBottom: '6px' } });
      const side = h('div', { style: { width: '92px', flex: 'none' } });
      const tool = h('div', { class: 'wrapx', style: { gap: '4px', marginBottom: '6px' } });
      const kids = id => Object.values(nodes).filter(n => n.parent === id);
      const inBin = () => cwd === 'bin';
      function tbtn(t, fn, cls) { return h('button', { class: 'btn sm ' + (cls || 'ghost'), style: { minHeight: '32px', padding: '4px 8px', fontSize: '.75rem' }, onclick: fn }, t); }
      function newFolder() { const n = mk('u' + (D.nextId++), 'New folder', 'folder', cwd); sel = n.id; renaming = null; emit('folder:new'); draw(); }
      function startRename() { if (!sel || !nodes[sel]) return CA.toast('Click a file or folder first'); renaming = sel; draw(); }
      function doCopy(cut) { if (!sel || !nodes[sel]) return CA.toast('Click a file or folder first'); D.clip = { id: sel, cut: !!cut }; emit(cut ? 'cut' : 'copy'); CA.toast(cut ? 'Cut. Now choose where to Paste.' : 'Copied. Now Paste it somewhere.'); }
      function doPaste() { if (!D.clip) return CA.toast('Nothing copied yet'); const src = nodes[D.clip.id]; if (!src) return; if (D.clip.cut) { src.parent = cwd; D.clip = null; } else { mk('u' + (D.nextId++), src.name.replace(/(\.\w+)?$/, ' copy$1'), src.kind, cwd, src.text); } emit('paste'); draw(); }
      function doDelete() { if (!sel || !nodes[sel]) return CA.toast('Click a file or folder first'); const n = nodes[sel]; n.prev = n.parent; n.parent = 'bin'; sel = null; emit('delete'); draw(); }
      function doRestore() { if (!sel || !nodes[sel]) return CA.toast('Click something in the Bin first'); const n = nodes[sel]; n.parent = n.prev || 'docs'; sel = null; emit('restore'); draw(); }
      function openNode(n) {
        if (n.kind === 'folder') { cwd = n.id; sel = null; emit('folder:' + n.name); draw(); }
        else if (n.kind === 'text') { emit('file:open:text'); if (n.id === D.mine) emit('file:open:mine'); open('notes', { file: n }); }
        else { CA.modal(h('div', null, h('div', { class: 'bigem' }, n.name.indexOf('Cat') === 0 ? '🐱' : n.name.indexOf('Beach') === 0 ? '🏖️' : '🤖'), h('p', { class: 'mt8' }, n.name + ' (a pretend picture)'), h('button', { class: 'btn mt12', onclick: () => CA.closeModal() }, 'Close')), { dismiss: true }); emit('file:open:image'); }
      }
      function draw() {
        crumbs.textContent = '💻 This PC  ›  ' + nm(cwd); side.innerHTML = ''; list.innerHTML = ''; tool.innerHTML = '';
        [['docs', '📄 Documents'], ['pics', '🖼️ Pictures'], ['bin', '🗑️ Bin']].forEach(([id, t]) => side.append(h('button', { class: 'btn sm ' + (cwd === id ? '' : 'ghost'), style: { display: 'flex', width: '100%', margin: '0 0 4px', minHeight: '32px', fontSize: '.75rem', padding: '4px 6px' }, onclick: () => { cwd = id; sel = null; emit('folder:' + nodes[id].name); draw(); } }, t)));
        if (!inBin()) { tool.append(tbtn('📁 New folder', newFolder), tbtn('✏️ Rename', startRename), tbtn('📋 Copy', () => doCopy(false)), tbtn('✂️ Cut', () => doCopy(true)), tbtn('📥 Paste', doPaste), tbtn('🗑️ Delete', doDelete)); }
        else tool.append(tbtn('♻️ Restore', doRestore, 'mint'));
        const items = kids(cwd);
        if (!items.length) list.append(h('p', { class: 'muted', style: { padding: '10px' } }, inBin() ? 'The Bin is empty.' : 'Nothing here yet.'));
        items.forEach(n => {
          const lab = renaming === n.id ? (() => { const i = h('input', { class: 'inp', value: n.name, style: { padding: '2px 4px', width: '72px', fontSize: '.7rem' } }); setTimeout(() => { i.focus(); i.select(); }, 20); const fin = () => { if (renaming !== n.id) return; const v = i.value.trim(); if (v) { n.name = v; emit('rename'); } renaming = null; draw(); }; i.addEventListener('keydown', e => { if (e.key === 'Enter') fin(); }); i.addEventListener('blur', fin); return i; })() : n.name;
          let last = 0;
          const it = h('button', { class: 'fileitem' + (sel === n.id ? ' sel' : ''), onclick: e => { e.stopPropagation(); const now = Date.now(); if (sel === n.id && now - last < 600 && renaming !== n.id) { last = 0; openNode(n); return; } last = now; sel = n.id; draw(); } }, h('span', { class: 'i' }, n.kind === 'folder' ? '📁' : n.kind === 'text' ? '📄' : '🖼️'), lab);
          it.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); sel = n.id; draw(); ctxMenu(e.clientX, e.clientY, inBin() ? [['♻️ Restore', doRestore]] : [['Open', () => openNode(n)], ['✏️ Rename', startRename], ['📋 Copy', () => doCopy(false)], ['✂️ Cut', () => doCopy(true)], ['🗑️ Delete', doDelete]]); });
          list.append(it);
        });
      }
      list.addEventListener('click', () => { if (sel) { sel = null; draw(); } });
      list.addEventListener('contextmenu', e => { e.preventDefault(); if (!inBin()) ctxMenu(e.clientX, e.clientY, [['📁 New folder', newFolder], ['📥 Paste', doPaste]]); });
      w.body.append(h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } }, crumbs, tool, h('div', { style: { display: 'flex', gap: '8px', flex: 1, minHeight: 0 } }, side, list)));
      emit('folder:' + nm(cwd)); draw();
    }

    /* ---- Settings ---- */
    function openSettings(w) {
      const pane = h('div', { style: { flex: 1, padding: '4px 8px' } }), side = h('div', { style: { width: '96px', flex: 'none' } });
      const PAGES = {
        Display: () => { const dark = el.classList.contains('dark'); return [h('b', null, 'Theme'), h('div', { class: 'row mt8' }, h('button', { class: 'btn sm ' + (dark ? 'ghost' : ''), onclick: () => { el.classList.remove('dark'); draw('Display'); } }, '☀️ Light'), h('button', { class: 'btn sm ' + (dark ? '' : 'ghost'), onclick: () => { el.classList.add('dark'); emit('theme:dark'); draw('Display'); } }, '🌙 Dark')), h('p', { class: 'small muted mt12' }, 'Dark mode is easier on the eyes in a dim room.')]; },
        Sound: () => [h('b', null, 'Volume'), h('input', { type: 'range', min: 0, max: 100, value: 40, style: { width: '100%', marginTop: '10px' }, oninput: () => emit('volume') }), h('p', { class: 'small muted mt8' }, 'Slide left for quiet, right for loud. Careful with headphones!')],
        Network: () => { emit('wifi:view'); return [h('b', null, '📶 Wi-Fi'), h('label', { class: 'toggle' }, 'Wi-Fi', h('input', { type: 'checkbox', checked: true, onchange: () => emit('wifi:toggle') })), h('div', { class: 'small mt8' }, '✔ HomeNetwork (connected, secure 🔒)'), h('div', { class: 'small muted' }, 'CoffeeShop-Free (open: no lock. Be careful what you do on open Wi-Fi.)')]; },
        Privacy: () => { emit('privacy:view'); return [h('b', null, '🔒 Apps that can use the camera'), h('label', { class: 'toggle' }, 'Video Call', h('input', { type: 'checkbox', checked: true })), h('label', { class: 'toggle' }, 'Photo Fun', h('input', { type: 'checkbox' })), h('label', { class: 'toggle' }, 'Random Game', h('input', { type: 'checkbox' })), h('p', { class: 'small muted mt8' }, 'Only allow what an app really needs. When in doubt, ask a grown-up.')]; }
      };
      function draw(page) { side.innerHTML = ''; pane.innerHTML = ''; Object.keys(PAGES).forEach(k => side.append(h('button', { class: 'btn sm ' + (k === page ? '' : 'ghost'), style: { display: 'flex', width: '100%', margin: '0 0 4px', minHeight: '32px', fontSize: '.75rem' }, onclick: () => draw(k) }, k))); PAGES[page]().forEach(x => pane.append(x)); }
      w.body.append(h('div', { style: { display: 'flex', gap: '8px' } }, side, pane)); draw('Display');
    }

    /* ---- Browser ---- */
    const SITES = {
      'kids.example': { title: 'Kids Corner', build: nav => h('div', null, h('h3', null, '🌈 Kids Corner'), searchBox(nav), h('p', { class: 'mt8' }, 'Fun and learning for everyone.'), link(nav, 'weather.example', '☀️ Weather today'), link(nav, 'learn.example', '📚 Learn about space'), link(nav, 'shop.example', '👟 Super Shoes shop')) },
      'weather.example': { title: 'Weather', build: nav => h('div', null, h('h3', null, '☀️ Weather today'), h('p', { class: 'mt8' }, 'Sunny with light clouds. 18°C.'), link(nav, 'kids.example', '← Back to Kids Corner')) },
      'learn.example': { title: 'Space', build: nav => h('div', null, h('h3', null, '🪐 Space'), h('p', { class: 'mt8' }, 'Saturn’s rings are made of ice and rock.'), link(nav, 'kids.example', '← Back to Kids Corner')) },
      'shop.example': { title: 'Super Shoes', popup: true, build: nav => h('div', null, h('h3', null, '👟 Super Shoes'), h('p', { class: 'mt8' }, 'Running shoes from €39. (Pretend shop. Nothing real is sold here.)'), link(nav, 'kids.example', '← Back to Kids Corner')) }
    };
    const link = (nav, host, t) => h('div', { style: { margin: '6px 0' } }, h('a', { href: '#', style: { fontWeight: 800 }, onclick: e => { e.preventDefault(); nav(host); } }, t));
    function searchBox(nav) {
      const i = h('input', { class: 'inp', placeholder: 'Search the pretend web…', style: { padding: '6px 10px' } });
      const go = () => { if (i.value.trim()) nav('search:' + i.value.trim()); }; i.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      return h('div', { class: 'row mt8' }, i, h('button', { class: 'btn sm', onclick: go }, 'Search'));
    }
    function openBrowser(w) {
      let tabs = [{ hist: ['kids.example'], i: 0 }], cur = 0;
      const tabBar = h('div', { class: 'row', style: { gap: '4px', marginBottom: '4px', flexWrap: 'wrap' } });
      const addr = h('input', { class: 'inp', style: { padding: '5px 10px', fontSize: '.8rem' }, 'aria-label': 'Address bar' });
      const lock = h('button', { class: 'btn sm ghost', style: { minHeight: '30px', padding: '2px 8px' }, onclick: () => { emit('browser:padlock'); CA.modal(h('div', null, h('div', { class: 'bigem' }, '🔒'), h('p', { class: 'mt8' }, 'The padlock means the connection is private (https). It does NOT promise the website is honest. A scam site can have a padlock too!'), h('button', { class: 'btn mt12', onclick: () => CA.closeModal() }, 'Got it')), { dismiss: true }); } }, '🔒');
      const star = h('button', { class: 'btn sm ghost', style: { minHeight: '30px', padding: '2px 8px' }, 'aria-label': 'Bookmark' }, '☆');
      const back = h('button', { class: 'btn sm ghost', style: { minHeight: '30px', padding: '2px 8px' }, 'aria-label': 'Back' }, '←');
      const page = h('div', { style: { position: 'relative', border: '2px solid #dbe6ee', borderRadius: '8px', padding: '10px', minHeight: '170px', overflow: 'auto', height: '195px', background: '#fff' } });
      const here = () => tabs[cur].hist[tabs[cur].i];
      function nav(to, push) {
        const t = tabs[cur]; if (push !== false) { t.hist = t.hist.slice(0, t.i + 1); t.hist.push(to); t.i = t.hist.length - 1; }
        const host = to.replace(/^search:.*/, ''); if (SITES[to]) emit('browser:url:' + to); if (to.indexOf('search:') === 0) emit('browser:search');
        draw();
      }
      function draw() {
        const to = here(); addr.value = to.indexOf('search:') === 0 ? 'search.example/?q=' + to.slice(7) : to; page.innerHTML = '';
        star.textContent = D.bookmarks[to] ? '★' : '☆';
        tabBar.innerHTML = ''; tabs.forEach((t, k) => tabBar.append(h('button', { class: 'btn sm ' + (k === cur ? '' : 'ghost'), style: { minHeight: '28px', padding: '2px 10px', fontSize: '.72rem' }, onclick: () => { cur = k; draw(); } }, (t.hist[t.i].indexOf('search:') === 0 ? 'Search' : (SITES[t.hist[t.i]] || { title: 'Not found' }).title))));
        tabBar.append(h('button', { class: 'btn sm ghost', style: { minHeight: '28px', padding: '2px 10px' }, 'aria-label': 'New tab', onclick: () => { tabs.push({ hist: ['kids.example'], i: 0 }); cur = tabs.length - 1; emit('browser:newtab'); draw(); } }, '＋'));
        if (to.indexOf('search:') === 0) {
          const q = to.slice(7);
          page.append(h('h3', null, 'Results for “' + q + '”'), h('div', { class: 'mock mt8' }, h('small', { class: 'muted' }, 'Ad'), h('div', null, h('b', null, 'BUY ' + q.toUpperCase() + ' NOW!!! Best prices')), h('small', { class: 'muted' }, 'Ads are paid for. They can look like results. Look for the word “Ad”.')),
            h('div', { class: 'mt8' }, link(nav, 'learn.example', q + ': a friendly guide for kids')), searchBox(nav));
        } else if (SITES[to]) { page.append(SITES[to].build(nav)); if (SITES[to].popup && !tabs[cur].popDone) popup(); }
        else page.append(h('h3', null, '🤔 Can’t find that site'), h('p', { class: 'mt8' }, 'Check the spelling of the address. Try kids.example'), link(nav, 'kids.example', 'Go to Kids Corner'));
      }
      function popup() {
        const p = h('div', { style: { position: 'absolute', left: '14%', right: '14%', top: '18px', background: '#fff6bf', border: '3px solid #f2645a', borderRadius: '12px', padding: '12px', textAlign: 'center', zIndex: 5, boxShadow: '0 6px 20px rgba(0,0,0,.35)' } },
          h('button', { 'aria-label': 'Close pop-up', style: { position: 'absolute', right: '4px', top: '2px', border: 'none', background: 'none', fontSize: '.7rem', color: '#666' }, onclick: () => { p.remove(); tabs[cur].popDone = true; emit('popup:closed'); CA.sfx.ok(); CA.toast('Well done! The small ✕ is the safe way out.'); } }, '✕'),
          h('div', { style: { fontSize: '1.2rem', fontWeight: 800 } }, '🎉 YOU WON A FREE PHONE!!! 🎉'),
          h('button', { class: 'btn mint mt8', onclick: () => { emit('popup:trap'); CA.sfx.bad(); CA.modal(h('div', null, h('div', { class: 'bigem' }, '🪤'), h('h3', null, 'That was a trap!'), h('p', { class: 'mt8' }, 'Surprise prizes in pop-ups are almost always tricks. In real life the big shiny button could lead to a scam or a download. Close it with the small ✕ and tell a grown-up if it keeps coming back.'), h('button', { class: 'btn mt12', onclick: () => CA.closeModal() }, 'Okay!')), { dismiss: true }); } }, 'CLAIM NOW!'));
        page.append(p);
      }
      addr.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return; const v = addr.value.trim().toLowerCase();
        if (/^[a-z0-9.-]+\.[a-z]+$/.test(v)) nav(v); else if (v) nav('search:' + addr.value.trim());
      });
      back.addEventListener('click', () => { const t = tabs[cur]; if (t.i > 0) { t.i--; emit('browser:back'); draw(); } });
      star.addEventListener('click', () => { const to = here(); D.bookmarks[to] = !D.bookmarks[to]; if (D.bookmarks[to]) emit('browser:bookmark'); draw(); });
      w.body.append(tabBar, h('div', { class: 'row', style: { gap: '4px', marginBottom: '6px' } }, back, lock, addr, star), page); draw();
    }
    const APP = { notes: openNote, files: openFiles, settings: openSettings, browser: openBrowser };
    return { el, open, wins: () => D.wins.length };
  }

  /* ================= quest screen ================= */
  function screenQuest(parts) {
    const q = QUESTS.find(x => x.id === parts[1]); if (!q) return h('p', null, 'Quest not found');
    document.getElementById('app').style.setProperty('--c', CA.zone('desk').color);
    const wrap = h('div', null, CA.topbar(q.title, '/zone/desk', CA.starPill()));
    const log = new Set(), done = [];
    let hints = 0, finished = false;
    const panel = h('div', { class: 'qpanel mt12' }), hintBox = h('div', { class: 'hintbox hide' });
    const desk = createDesk(ev => { log.add(ev); update(); });
    function ok(s) { return s.test ? s.test(log) : log.has(s.ev); }
    function update() {
      const cur = q.steps.findIndex(s => !ok(s));
      panel.innerHTML = ''; panel.append(h('b', null, q.emoji + ' ' + q.title));
      q.steps.forEach((s, i) => panel.append(h('div', { class: 'qstep ' + (ok(s) ? 'done' : i === cur ? 'now' : '') }, h('span', { class: 'b' }, ok(s) ? '✓' : String(i + 1)), h('span', null, s.t))));
      if (cur >= 0) { panel.append(h('button', { class: 'btn sm ghost mt8', onclick: () => { hints++; hintBox.textContent = '💡 ' + q.steps[cur].hint; hintBox.classList.remove('hide'); } }, '💡 Hint'), hintBox); hintBox.classList.add('hide'); }
      if (cur < 0 && !finished) {
        finished = true; const stars = hints === 0 ? 3 : hints <= 2 ? 2 : 1; CA.record(q.id, stars);
        setTimeout(() => CA.finish({ title: 'Mission complete!', stars, lines: ['You finished all ' + q.steps.length + ' steps' + (hints ? ' with ' + hints + ' hint' + (hints > 1 ? 's' : '') : ' without a single hint') + '.'], again: () => CA.render(), back: '/zone/desk' }), 500);
      }
    }
    wrap.append(panel, desk.el, h('p', { class: 'small muted center mt8' }, 'This is a pretend computer. Nothing here is real, so you can click anything safely.'));
    update();
    return wrap;
  }
  CA.screens.quest = screenQuest;
})();
