/* Figurino — user interface */
(function (App) {
  'use strict';
  var C = App.color, store = App.store, ai = App.ai;
  var state = { style: null, figure: Object.assign({}, App.FIGURE.defaults), items: [], outfits: [], shopping: [], fv: '', fslot: '', fvibe: '', sel: emptyLook(), urls: {} };
  var VERDICT = { 'keep': 'Keep', 'keep-if': 'Keep if…', 'let-go': 'Let go' };
  var LABELS = { 'wrap-cardigan': 'wrap cardigan', 'turtleneck-ss': 'short-sleeve turtleneck', 'tshirt': 'T-shirt', 'midi-skirt': 'midi skirt', 'maxi-skirt': 'maxi skirt', 'straight-trousers': 'straight trousers', 'wide-trousers': 'wide trousers', 'short-dress': 'short dress', 'midi-dress': 'midi dress', 'maxi-dress': 'maxi dress', 'ballet-flat': 'ballet flats', 'mary-jane': 'Mary Janes', 'ankle-boot': 'ankle boots', 'arm-warmers': 'arm warmers', 'half-moon': 'half-moon', 'polka-dot': 'polka dot' };
  function nice(s) { return LABELS[s] || s; }
  function emptyLook() { return { outerwear: null, top: null, bottom: null, dress: null, shoes: null, accessories: [], tights: null }; }
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function byId(id) { for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return state.items[i]; return null; }
  function photoURL(c) {
    if (!(c.photo instanceof Blob)) return null;
    if (!state.urls[c.id]) state.urls[c.id] = URL.createObjectURL(c.photo);
    return state.urls[c.id];
  }
  var toastT;
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 3200); }
  function status(id, msg, err) { var s = $(id); s.textContent = msg || ''; s.classList.toggle('err', !!err); }
  function busy(btn, on) { btn.disabled = !!on; }
  function vibeName(id) { var v = state.style && state.style.vibes.filter(function (x) { return x.id === id; })[0]; return v ? v.name : null; }
  var VIBE_COLORS = ['#1F5F66', '#A6481F', '#2F4A35', '#7A2632'];

  /* ---------- loading ---------- */
  function load() {
    return Promise.all([store.all('items'), store.all('outfits'), store.all('shopping'), store.get('meta', 'style'), store.get('meta', 'figure')]).then(function (r) {
      state.figure = Object.assign({}, App.FIGURE.defaults, r[4] || {}); delete state.figure.id;
      state.items = r[0].sort(function (a, b) { return String(b.added || '').localeCompare(String(a.added || '')); });
      state.outfits = r[1].sort(function (a, b) { return String(a.created || '').localeCompare(String(b.created || '')); });
      state.shopping = r[2]; state.style = r[3] || null;
      renderAll();
    });
  }
  function renderAll() { renderStyle(); renderFilters(); renderGrid(); renderOutfits(); renderShopping(); }

  /* ---------- views ---------- */
  var VIEWS = ['style', 'wardrobe', 'outfits', 'shopping', 'settings'];
  function route() {
    var v = (location.hash || '').slice(1);
    if (VIEWS.indexOf(v) < 0) v = state.style ? 'wardrobe' : 'style';
    VIEWS.forEach(function (x) { $('view-' + x).hidden = x !== v; });
    document.querySelectorAll('.tabs a').forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('data-view') === v ? 'page' : 'false'); });
    if (v === 'outfits') renderOutfits();
  }
  window.addEventListener('hashchange', route);

  /* ---------- my style ---------- */
  var styleFiles = [];
  function setStyleFiles(list) {
    styleFiles = Array.prototype.slice.call(list).filter(function (f) { return /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name); }).slice(0, 15);
    var th = $('style-thumbs'); th.replaceChildren();
    styleFiles.forEach(function (f) { var i = el('img'); i.alt = ''; i.src = URL.createObjectURL(f); th.appendChild(i); });
    status('style-status', styleFiles.length ? styleFiles.length + (styleFiles.length === 1 ? ' image' : ' images') + ' ready.' : '');
  }
  $('style-files').addEventListener('change', function (e) { setStyleFiles(e.target.files); });
  dropZone($('style-drop'), setStyleFiles);
  function dropZone(z, cb) {
    z.addEventListener('dragover', function (e) { e.preventDefault(); z.classList.add('over'); });
    z.addEventListener('dragleave', function () { z.classList.remove('over'); });
    z.addEventListener('drop', function (e) { e.preventDefault(); z.classList.remove('over'); cb(e.dataTransfer.files); });
  }
  $('style-go').addEventListener('click', function () {
    var btn = this;
    if (!styleFiles.length) return status('style-status', 'Choose at least one image.', true);
    if (!ai.key()) return status('style-status', 'You need an API key: add one in Settings.', true);
    busy(btn, true); status('style-status', 'Preparing the images…');
    Promise.all(styleFiles.map(function (f) { return ai.prepareImage(f, 1000); })).then(function (imgs) {
      status('style-status', 'Studying your style… (about 30 seconds)');
      return ai.analyzeStyle(imgs.map(function (i) { return i.base64; }), $('style-notes').value.trim());
    }).then(function (s) { return store.put('meta', s); }).then(function (s) {
      state.style = s; styleFiles = []; $('style-thumbs').replaceChildren(); status('style-status', '');
      renderAll(); toast('Your style is ready!');
    }).catch(function (e) { status('style-status', e.message, true); }).then(function () { busy(btn, false); });
  });
  $('demo-go').addEventListener('click', loadDemo);
  $('demo-load').addEventListener('click', loadDemo);
  function loadDemo() {
    var d = App.DEMO, now = Date.now(), jobs = [store.put('meta', d.style)];
    d.items.forEach(function (c, i) { jobs.push(store.put('items', Object.assign({}, c, { added: new Date(now - i * 1000).toISOString() }))); });
    d.outfits.forEach(function (o, i) { jobs.push(store.put('outfits', Object.assign({}, o, { created: new Date(now + i).toISOString() }))); });
    d.shopping.forEach(function (o) { jobs.push(store.put('shopping', o)); });
    Promise.all(jobs).then(load).then(function () { toast('Example loaded'); location.hash = 'style'; route(); });
  }

  function renderStyle() {
    var s = state.style, v = $('style-view');
    $('style-empty').hidden = !!s; v.hidden = !s; v.replaceChildren();
    if (!s) return;
    var head = el('div', 'style-head'); head.appendChild(el('p', 'eyebrow', 'My style')); head.appendChild(el('h2', null, s.name));
    if (s.summary) { var p = el('p', 'lead', s.summary); p.style.marginTop = '10px'; head.appendChild(p); }
    v.appendChild(head);
    if (s.vibes.length) {
      var an = el('div', 'anime');
      s.vibes.forEach(function (a, i) {
        var c = el('article', 'anima'); c.style.background = VIBE_COLORS[i % VIBE_COLORS.length];
        c.appendChild(el('h3', null, a.name)); if (a.description) c.appendChild(el('p', null, a.description));
        var r = el('div', 'row'); a.pieces.forEach(function (x) { r.appendChild(el('span', 'tag', x)); }); c.appendChild(r);
        an.appendChild(c);
      });
      v.appendChild(an);
    }
    var pal = el('div', 'panel'); pal.style.display = 'flex'; pal.style.flexDirection = 'column'; pal.style.gap = '14px';
    [['Base colours', s.palette.base], ['Accents', s.palette.accents]].forEach(function (g) {
      if (!g[1].length) return;
      pal.appendChild(el('p', 'eyebrow', g[0]));
      var sw = el('div', 'swatches');
      g[1].forEach(function (c) { var w = el('div', 'swatch'), b = el('span'); b.style.background = c.hex; w.appendChild(b); w.appendChild(document.createTextNode(c.name)); sw.appendChild(w); });
      pal.appendChild(sw);
    });
    if (s.palette.avoid.length) pal.appendChild(el('p', 'hint', 'Avoid: ' + s.palette.avoid.join(', ') + '.'));
    v.appendChild(pal);
    var cols = el('div', 'cols');
    [['Silhouettes', s.silhouettes], ['Materials', s.materials], ['Patterns', s.patterns], ['Accessories', s.accessories]].forEach(function (g) {
      if (!g[1].length) return;
      var b = el('div', 'panel'); b.appendChild(el('p', 'eyebrow', g[0])); var ul = el('ul'); ul.style.marginTop = '8px';
      g[1].forEach(function (x) { ul.appendChild(el('li', null, x)); }); b.appendChild(ul); cols.appendChild(b);
    });
    v.appendChild(cols);
    if (s.formulas.length || s.rules.length) {
      var two = el('div', 'cols');
      if (s.formulas.length) {
        var f = el('div', 'panel'); f.appendChild(el('p', 'eyebrow', 'Outfit formulas'));
        s.formulas.forEach(function (x) { var d = el('div', 'formula'); var n = vibeName(x.vibe); if (n) d.appendChild(el('span', 'tag', n)); d.appendChild(el('span', null, x.formula)); if (x.example) d.appendChild(el('em', null, x.example)); f.appendChild(d); });
        two.appendChild(f);
      }
      if (s.rules.length) {
        var r = el('div', 'panel'); r.appendChild(el('p', 'eyebrow', 'Rules')); var ul = el('ul'); ul.style.marginTop = '8px';
        s.rules.forEach(function (x) { ul.appendChild(el('li', null, x)); }); r.appendChild(ul); two.appendChild(r);
      }
      v.appendChild(two);
    }
    var redo = el('button', 'btn ghost', 'Redo the analysis with new images'); redo.type = 'button';
    redo.addEventListener('click', function () { $('style-empty').hidden = false; $('style-empty').scrollIntoView({ behavior: 'smooth' }); });
    var r2 = el('div', 'row'); r2.appendChild(redo); v.appendChild(r2);
  }

  /* ---------- wardrobe ---------- */
  function renderFilters() {
    var fs = $('f-slot'), fv = $('f-vibe'), keepS = fs.value, keepV = fv.value;
    fs.replaceChildren(new Option('All', '')); Object.keys(App.SHAPES).forEach(function (k) { fs.appendChild(new Option(App.SLOT_LABEL[k], k)); }); fs.value = keepS;
    fv.replaceChildren(new Option('All', '')); (state.style ? state.style.vibes : []).forEach(function (a) { fv.appendChild(new Option(a.name, a.id)); }); fv.value = keepV;
  }
  $('f-slot').addEventListener('change', function () { state.fslot = this.value; renderGrid(); });
  $('f-vibe').addEventListener('change', function () { state.fvibe = this.value; renderGrid(); });
  document.querySelectorAll('[data-fv]').forEach(function (b) {
    b.addEventListener('click', function () {
      state.fv = b.getAttribute('data-fv');
      document.querySelectorAll('[data-fv]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      renderGrid();
    });
  });
  function renderGrid() {
    var counts = { 'keep': 0, 'keep-if': 0, 'let-go': 0 };
    state.items.forEach(function (c) { if (counts[c.verdict] != null) counts[c.verdict]++; });
    var st = $('stats'); st.replaceChildren();
    [[state.items.length, 'items'], [counts.keep, 'keep'], [counts['keep-if'], 'keep if…'], [counts['let-go'], 'let go']].forEach(function (x) { var d = el('div', 'stat'); d.appendChild(el('b', null, String(x[0]))); d.appendChild(el('span', null, x[1])); st.appendChild(d); });
    var shown = state.items.filter(function (c) { return (!state.fv || c.verdict === state.fv) && (!state.fslot || c.slot === state.fslot) && (!state.fvibe || (c.vibes || []).indexOf(state.fvibe) >= 0); });
    var g = $('grid'); g.replaceChildren();
    shown.forEach(function (c) { g.appendChild(card(c)); });
    var e = $('grid-empty'); e.hidden = shown.length > 0;
    if (state.items.length && !shown.length) { e.firstChild.textContent = 'No items match these filters'; e.lastChild.textContent = 'Try removing a filter.'; }
  }
  function card(c) {
    var art = el('article', 'card'), u = photoURL(c);
    if (u) { var img = el('img', 'photo'); img.src = u; img.alt = c.name; img.loading = 'lazy'; art.appendChild(img); }
    else { var ph = el('div', 'photo-ph', nice(c.shape || '')); ph.style.background = 'linear-gradient(160deg,' + C.shade(c.colorHex, 0.15) + ',' + C.shade(c.colorHex, -0.25) + ')'; if (C.hsl(C.okHex(c.colorHex) || '#888888').l > 0.65) ph.style.color = '#3A2418'; art.appendChild(ph); }
    var b = el('div', 'body'), head = el('div', 'head'), t = el('div');
    t.appendChild(el('h3', null, c.name));
    var meta = el('p', 'meta'), dot = el('span', 'dot'); dot.style.background = C.okHex(c.colorHex) || '#888888'; dot.setAttribute('aria-hidden', 'true'); meta.appendChild(dot);
    meta.appendChild(el('span', null, [c.color, c.material].filter(Boolean).join(' · '))); t.appendChild(meta); head.appendChild(t);
    var sel = el('select', 'verdict v-' + c.verdict); sel.setAttribute('aria-label', 'Verdict for ' + c.name);
    Object.keys(VERDICT).forEach(function (k) { var o = new Option(VERDICT[k], k); if (k === c.verdict) o.selected = true; sel.appendChild(o); });
    sel.addEventListener('change', function () { c.verdict = sel.value; sel.className = 'verdict v-' + c.verdict; store.put('items', c).then(renderGrid); });
    head.appendChild(sel); b.appendChild(head);
    var row = el('div', 'row');
    (c.vibes || []).forEach(function (a) { var n = vibeName(a); if (n) row.appendChild(el('span', 'tag', n)); });
    var pot = el('span', 'pot'); pot.setAttribute('aria-label', 'Potential ' + c.potential + ' out of 5');
    for (var i = 1; i <= 5; i++) { var d = el('i', i <= c.potential ? 'on' : ''); d.setAttribute('aria-hidden', 'true'); pot.appendChild(d); }
    pot.appendChild(el('span', null, ' potential')); row.appendChild(pot); b.appendChild(row);
    if (c.pairings && c.pairings.length) { var sec = el('div'); sec.appendChild(el('p', 'eyebrow', 'How to wear it')); var ul = el('ul'); ul.style.marginTop = '6px'; c.pairings.forEach(function (x) { ul.appendChild(el('li', null, x)); }); sec.appendChild(ul); b.appendChild(sec); }
    if (c.notes) b.appendChild(el('p', 'note', c.notes));
    var act = el('div', 'actions');
    var tr = el('button', 'btn small', 'Try it on'); tr.type = 'button';
    tr.addEventListener('click', function () { wear(c); location.hash = 'outfits'; });
    var ed = el('button', 'btn ghost small', 'Edit'); ed.type = 'button'; ed.addEventListener('click', function () { openEdit(c); });
    var dl = el('button', 'btn ghost small', 'Delete'); dl.type = 'button';
    dl.addEventListener('click', function () {
      if (dl.dataset.sure) { store.del('items', c.id).then(function () { if (state.urls[c.id]) URL.revokeObjectURL(state.urls[c.id]); delete state.urls[c.id]; return load(); }).then(function () { toast('Item deleted'); }); }
      else { dl.dataset.sure = '1'; dl.textContent = 'Confirm'; setTimeout(function () { delete dl.dataset.sure; dl.textContent = 'Delete'; }, 3000); }
    });
    act.appendChild(tr); act.appendChild(ed); act.appendChild(dl); b.appendChild(act);
    art.appendChild(b);
    return art;
  }

  /* adding items */
  $('item-files').addEventListener('change', function (e) { var files = Array.prototype.slice.call(e.target.files); e.target.value = ''; addItems(files); });
  function avgColor(blob) {
    return new Promise(function (res) {
      var u = URL.createObjectURL(blob), img = new Image();
      img.onload = function () {
        var cv = document.createElement('canvas'); cv.width = 24; cv.height = 24; var x = cv.getContext('2d');
        x.drawImage(img, img.width * 0.3, img.height * 0.3, img.width * 0.4, img.height * 0.4, 0, 0, 24, 24);
        var d = x.getImageData(0, 0, 24, 24).data, s = [0, 0, 0];
        for (var i = 0; i < d.length; i += 4) { s[0] += d[i]; s[1] += d[i + 1]; s[2] += d[i + 2]; }
        URL.revokeObjectURL(u);
        res('#' + s.map(function (v) { return ('0' + Math.round(v / 576).toString(16)).slice(-2); }).join('').toUpperCase());
      };
      img.onerror = function () { URL.revokeObjectURL(u); res('#8A7A66'); };
      img.src = u;
    });
  }
  function addItems(files) {
    if (!files.length) return;
    var hasKey = !!ai.key(), done = 0, prog = $('item-progress'), bar = prog.querySelector('.bar span');
    prog.hidden = false; bar.style.width = '0';
    var chain = Promise.resolve(), errors = 0, last = null;
    files.forEach(function (f, i) {
      chain = chain.then(function () {
        status('item-status', (hasKey ? 'Analysing ' : 'Uploading ') + (i + 1) + ' of ' + files.length + '…');
        return ai.prepareImage(f, 1100).then(function (img) {
          var base = { id: store.uid('item'), photo: img.blob, added: new Date().toISOString() };
          if (!hasKey) return avgColor(img.blob).then(function (hex) { return Object.assign(base, { name: f.name.replace(/\.[^.]+$/, '').slice(0, 60) || 'New item', slot: 'top', shape: 'tshirt', color: '', colorHex: hex, pattern: 'solid', patternColors: [], texture: 'smooth', material: '', verdict: 'keep-if', potential: 3, vibes: [], pairings: [], pairsWith: [], notes: '' }); });
          return ai.analyzeItem([img.base64], state.style, state.items).then(function (r) { return Object.assign(base, r); });
        }).then(function (item) { last = item; return store.put('items', item).then(function () { state.items.unshift(item); }); })
          .catch(function (e) { errors++; toast(f.name + ': ' + e.message); });
      }).then(function () { done++; bar.style.width = Math.round(done / files.length * 100) + '%'; renderGrid(); });
    });
    chain.then(function () {
      prog.hidden = true;
      if (!hasKey && last) { toast('Without an API key, fill in the item details yourself.'); openEdit(last); }
      else toast(errors ? (files.length - errors) + ' added, ' + errors + ' failed.' : (files.length === 1 ? 'Item added' : files.length + ' items added'));
      renderAll();
    });
  }

  /* edit dialog */
  var editing = null;
  function fillSelect(s, values, labels) { s.replaceChildren(); values.forEach(function (v) { s.appendChild(new Option(labels ? labels(v) : nice(v), v)); }); }
  function openEdit(c) {
    editing = c;
    $('e-name').value = c.name || '';
    fillSelect($('e-slot'), Object.keys(App.SHAPES), function (k) { return App.SLOT_LABEL[k]; }); $('e-slot').value = c.slot;
    syncShape(c.shape);
    $('e-color').value = c.color || ''; $('e-hex').value = (C.okHex(c.colorHex) || '#888888').toLowerCase();
    fillSelect($('e-pattern'), App.PATTERNS); $('e-pattern').value = c.pattern || 'solid';
    fillSelect($('e-texture'), App.TEXTURES); $('e-texture').value = c.texture || 'smooth';
    fillSelect($('e-type'), App.BAGS); $('e-type').value = c.type || 'crossbody';
    $('e-sleeves').value = c.sleeves || '';
    $('e-verdict').value = c.verdict || 'keep-if'; $('e-pot').value = c.potential || 3;
    var vb = $('e-vibes'); vb.replaceChildren();
    (state.style ? state.style.vibes : []).forEach(function (a) {
      var l = el('label'), cb = el('input'); cb.type = 'checkbox'; cb.value = a.id; cb.checked = (c.vibes || []).indexOf(a.id) >= 0;
      l.appendChild(cb); l.appendChild(document.createTextNode(a.name)); vb.appendChild(l);
    });
    if (!vb.children.length) vb.appendChild(el('span', 'hint', 'Define your style first to get vibes.'));
    $('e-notes').value = c.notes || '';
    $('edit').showModal();
  }
  function syncShape(cur) {
    var slot = $('e-slot').value, shapes = App.SHAPES[slot] || [];
    fillSelect($('e-shape'), shapes); $('e-shape').value = shapes.indexOf(cur) >= 0 ? cur : shapes[0];
    $('e-type').closest('label').hidden = $('e-shape').value !== 'bag';
    $('e-sleeves').closest('label').hidden = !(slot === 'top' || slot === 'dress');
  }
  $('e-slot').addEventListener('change', function () { syncShape(); });
  $('e-shape').addEventListener('change', function () { $('e-type').closest('label').hidden = this.value !== 'bag'; });
  $('edit').addEventListener('close', function () {
    if ($('edit').returnValue !== 'save' || !editing) { editing = null; return; }
    var c = editing; editing = null;
    c.name = $('e-name').value.trim() || c.name; c.slot = $('e-slot').value; c.shape = $('e-shape').value;
    c.color = $('e-color').value.trim(); c.colorHex = $('e-hex').value.toUpperCase();
    c.pattern = $('e-pattern').value; c.texture = $('e-texture').value;
    c.type = c.shape === 'bag' ? $('e-type').value : null; c.sleeves = $('e-sleeves').value || null;
    c.verdict = $('e-verdict').value; c.potential = Number($('e-pot').value) || 3;
    c.vibes = Array.prototype.map.call($('e-vibes').querySelectorAll('input:checked'), function (x) { return x.value; });
    c.notes = $('e-notes').value.trim();
    store.put('items', c).then(function () { renderAll(); toast('Changes saved'); });
  });

  /* ---------- outfits ---------- */
  var SLOTS = ['outerwear', 'top', 'bottom', 'dress', 'shoes', 'accessory'];
  function wear(c) {
    if (c.slot === 'accessory') { if (state.sel.accessories.indexOf(c.id) < 0) state.sel.accessories.push(c.id); }
    else {
      state.sel[c.slot] = c.id;
      if (c.slot === 'dress' && c.shape !== 'pinafore') { state.sel.top = null; state.sel.bottom = null; }
      if (c.slot === 'top' || c.slot === 'bottom') { var dr = byId(state.sel.dress); if (dr && !(dr.shape === 'pinafore' && c.slot === 'top')) state.sel.dress = null; }
    }
    $('why').hidden = true;
  }
  function optButton(label, pressed, onClick, imgUrl, hex) {
    var b = el('button', 'opt'); b.type = 'button'; b.setAttribute('aria-pressed', String(!!pressed));
    if (imgUrl) { var im = el('img'); im.src = imgUrl; im.alt = ''; b.appendChild(im); }
    else { var ph = el('span', 'ph', hex ? '' : '—'); if (hex) ph.style.background = hex; b.appendChild(ph); }
    b.appendChild(el('span', null, label)); b.addEventListener('click', onClick); return b;
  }
  function renderOutfits() {
    var pk = $('pickers'); pk.replaceChildren();
    SLOTS.forEach(function (slot) {
      var list = state.items.filter(function (c) { return c.slot === slot; });
      if (!list.length) return;
      var box = el('div'), h = el('p', 'eyebrow', App.SLOT_LABEL[slot] + (slot === 'accessory' ? ' (pick as many as you like)' : '')); h.style.marginBottom = '6px'; box.appendChild(h);
      var opts = el('div', 'opts'), key = slot === 'accessory' ? null : slot;
      opts.appendChild(optButton('None', key ? !state.sel[key] : !state.sel.accessories.length, function () { if (key) state.sel[key] = null; else state.sel.accessories = []; renderOutfits(); }));
      list.forEach(function (c) {
        var on = key ? state.sel[key] === c.id : state.sel.accessories.indexOf(c.id) >= 0;
        opts.appendChild(optButton(c.name, on, function () {
          if (key) { if (state.sel[key] === c.id) state.sel[key] = null; else wear(c); }
          else { var i = state.sel.accessories.indexOf(c.id); if (i >= 0) state.sel.accessories.splice(i, 1); else state.sel.accessories.push(c.id); }
          renderOutfits();
        }, photoURL(c), c.colorHex));
      });
      box.appendChild(opts); pk.appendChild(box);
    });
    if (!pk.children.length) pk.appendChild(el('p', 'hint', 'Add a few items to your wardrobe to dress the figure.'));
    var tz = $('tights'); tz.replaceChildren();
    var bare = el('button', 'sw txt', 'Bare legs'); bare.type = 'button'; bare.setAttribute('aria-pressed', String(!state.sel.tights));
    bare.addEventListener('click', function () { state.sel.tights = null; renderOutfits(); }); tz.appendChild(bare);
    var pal = C.paletteOf(state.style); if (!pal.length) pal = [{ name: 'Mustard', hex: '#D9A62E' }, { name: 'Burgundy', hex: '#7A2632' }, { name: 'Rust', hex: '#A6481F' }, { name: 'Forest green', hex: '#2F4A35' }, { name: 'Black', hex: '#1E1B1C' }];
    pal.forEach(function (p) {
      var b = el('button', 'sw'); b.type = 'button'; b.style.background = p.hex; b.title = p.name + ' tights'; b.setAttribute('aria-label', p.name + ' tights');
      b.setAttribute('aria-pressed', String(state.sel.tights === p.hex)); b.addEventListener('click', function () { state.sel.tights = p.hex; renderOutfits(); }); tz.appendChild(b);
    });
    App.figurino.draw($('dummy'), state.sel, byId, state.figure);
    renderFigureOpts();
    readOutfit(); renderSaved();
  }
  function readOutfit() {
    var parts = [], s = state.sel;
    ['outerwear', 'dress', 'top', 'bottom', 'shoes'].forEach(function (k) { var c = byId(s[k]); if (c && C.okHex(c.colorHex)) parts.push({ name: c.name, hex: c.colorHex, vibes: c.vibes || [], slot: k }); });
    s.accessories.forEach(function (id) { var c = byId(id); if (c && C.okHex(c.colorHex)) parts.push({ name: c.name, hex: c.colorHex, vibes: c.vibes || [], slot: 'accessory' }); });
    if (C.okHex(s.tights)) parts.push({ name: 'tights', hex: s.tights, vibes: null, slot: 'tights' });
    var strip = $('strip'); strip.replaceChildren();
    parts.forEach(function (p) { var x = el('span'); x.style.background = p.hex; x.title = p.name; strip.appendChild(x); });
    var details = s.accessories.length + (s.tights ? 1 : 0) + (s.outerwear ? 1 : 0);
    var ul = $('reading'); ul.replaceChildren();
    C.readOutfit(parts, state.style, { details: details }).forEach(function (m) { ul.appendChild(el('li', m[0] === 'ok' ? '' : m[0], m[1])); });
  }
  function renderSaved() {
    var box = $('saved'); box.replaceChildren(); $('saved-empty').hidden = state.outfits.length > 0;
    state.outfits.forEach(function (o) {
      var w = el('span', 'item'), b = el('button', null, o.name || 'Outfit'); b.type = 'button';
      b.addEventListener('click', function () { applyOutfit(o); });
      var x = el('button', 'x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Delete ' + (o.name || 'outfit'));
      x.addEventListener('click', function () { store.del('outfits', o.id).then(load); });
      w.appendChild(b); w.appendChild(x); box.appendChild(w);
    });
  }
  function applyOutfit(o) {
    var s = emptyLook();
    ['outerwear', 'top', 'bottom', 'dress', 'shoes'].forEach(function (k) { s[k] = byId(o[k]) ? o[k] : null; });
    s.accessories = (o.accessories || []).filter(byId); s.tights = C.okHex(o.tights);
    state.sel = s; var w = $('why'); w.textContent = o.why || ''; w.hidden = !o.why; renderOutfits();
  }
  $('save-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('outfit-name'), o = Object.assign({ id: store.uid('outfit'), name: inp.value.trim() || 'Untitled outfit', created: new Date().toISOString(), author: 'me' }, JSON.parse(JSON.stringify(state.sel)));
    store.put('outfits', o).then(function () { inp.value = ''; return load(); }).then(function () { toast('Outfit saved'); });
  });
  $('ideas-go').addEventListener('click', function () {
    var btn = this;
    if (!ai.key()) return status('ideas-status', 'You need an API key: add one in Settings.', true);
    if (state.items.length < 3) return status('ideas-status', 'Add a few items to your wardrobe first.', true);
    busy(btn, true); status('ideas-status', 'Thinking up some combinations…');
    ai.suggestOutfits(state.style, state.items, 4).then(function (list) {
      var now = Date.now();
      return Promise.all(list.map(function (o, i) { return store.put('outfits', Object.assign(o, { id: store.uid('outfit'), created: new Date(now + i).toISOString(), author: 'ai' })); }));
    }).then(function (saved) {
      return load().then(function () { status('ideas-status', saved.length + (saved.length === 1 ? ' new outfit' : ' new outfits') + ' added to your saved ones.'); if (saved[0]) applyOutfit(saved[0]); });
    }).catch(function (e) { status('ideas-status', e.message, true); }).then(function () { busy(btn, false); });
  });

  /* figure options */
  function setFigure(k, v) { state.figure[k] = v; store.put('meta', Object.assign({ id: 'figure' }, state.figure)); renderOutfits(); }
  function swatchRow(box, list, current, key) {
    box.replaceChildren();
    list.forEach(function (o) {
      var b = el('button', 'sw'); b.type = 'button'; b.style.background = o[1]; b.title = o[0]; b.setAttribute('aria-label', o[0]);
      b.setAttribute('aria-pressed', String((current || '').toUpperCase() === o[1].toUpperCase())); b.addEventListener('click', function () { setFigure(key, o[1]); }); box.appendChild(b);
    });
  }
  var figSelectsReady = false;
  function renderFigureOpts() {
    var F = App.FIGURE, f = state.figure;
    swatchRow($('fo-skin'), F.skins, f.skin, 'skin');
    swatchRow($('fo-hair'), F.hairColors, f.hair, 'hair');
    swatchRow($('fo-eyecol'), F.eyeColors, f.eyeColor, 'eyeColor');
    if (!figSelectsReady) {
      [['fo-style', F.hairStyles, 'hairStyle'], ['fo-body', F.bodies, 'body'], ['fo-eyes', F.eyes, 'eyes']].forEach(function (x) {
        var s = $(x[0]); x[1].forEach(function (o) { s.appendChild(new Option(o[1], o[0])); });
        s.addEventListener('change', function () { setFigure(x[2], s.value); });
      });
      figSelectsReady = true;
    }
    $('fo-style').value = f.hairStyle; $('fo-body').value = f.body; $('fo-eyes').value = f.eyes;
    $('fo-eyecol-wrap').hidden = f.eyes !== 'open';
  }

  /* ---------- shopping list ---------- */
  var PRIO = [['high', 'First', 'the biggest impact for the least money'], ['medium', 'Next', 'to widen your combinations'], ['low', 'When you see it', 'if the right piece turns up']];
  function renderShopping() {
    var box = $('shop-groups'); box.replaceChildren();
    PRIO.forEach(function (p) {
      var rows = state.shopping.filter(function (x) { return (x.priority || 'medium') === p[0]; }).sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0); });
      if (!rows.length) return;
      var g = el('div', 'lgroup'), h = el('h2', null, p[1]); h.appendChild(el('small', null, p[2])); g.appendChild(h);
      rows.forEach(function (x) {
        var it = el('div', 'litem' + (x.done ? ' done' : '')), cb = el('input'); cb.type = 'checkbox'; cb.id = 's-' + x.id; cb.checked = !!x.done;
        cb.addEventListener('change', function () { x.done = cb.checked; store.put('shopping', x).then(renderShopping); });
        var lb = el('div', 'lb'), lab = el('label', null, x.name); lab.htmlFor = cb.id; lb.appendChild(lab);
        var more = el('div', 'more');
        if (x.colors && x.colors.length) { var sw = el('div', 'lsw'); x.colors.forEach(function (c) { if (C.okHex(c)) { var s = el('span'); s.style.background = c; sw.appendChild(s); } }); more.appendChild(sw); }
        if (x.why) more.appendChild(el('span', null, x.why));
        var w = (x.pairsWith || []).map(byId).filter(Boolean).map(function (c) { return c.name; });
        if (w.length) more.appendChild(el('span', 'hint', 'Pairs with: ' + w.join(', ')));
        lb.appendChild(more); it.appendChild(cb); it.appendChild(lb);
        var del = el('button', 'x', '×'); del.type = 'button'; del.setAttribute('aria-label', 'Remove ' + x.name + ' from the list');
        del.addEventListener('click', function () { store.del('shopping', x.id).then(load); });
        it.appendChild(del); g.appendChild(it);
      });
      box.appendChild(g);
    });
    if (!state.shopping.length) box.appendChild(el('p', 'hint', 'The list is empty. Ask for suggestions or add something yourself.'));
  }
  $('shop-form').addEventListener('submit', function (e) {
    e.preventDefault(); var inp = $('shop-new'), n = inp.value.trim(); if (!n) return;
    store.put('shopping', { id: store.uid('shop'), name: n, priority: 'medium', colors: [], why: '', pairsWith: [], done: false }).then(function () { inp.value = ''; return load(); });
  });
  $('shop-go').addEventListener('click', function () {
    var btn = this;
    if (!ai.key()) return status('shop-status', 'You need an API key: add one in Settings.', true);
    if (!state.style) return status('shop-status', 'Define your style first.', true);
    busy(btn, true); status('shop-status', 'Looking for the gaps in your wardrobe…');
    ai.suggestShopping(state.style, state.items).then(function (list) {
      return Promise.all(list.map(function (o) { return store.put('shopping', Object.assign(o, { id: store.uid('shop') })); }));
    }).then(function (s) { return load().then(function () { status('shop-status', s.length + (s.length === 1 ? ' suggestion' : ' suggestions') + ' added.'); }); })
      .catch(function (e) { status('shop-status', e.message, true); }).then(function () { busy(btn, false); });
  });

  /* ---------- settings ---------- */
  App.MODELS.forEach(function (m) { $('api-model').appendChild(new Option(m[1], m[0])); });
  $('api-model').value = ai.model();
  if (ai.key()) $('api-key').placeholder = 'Key saved (••••' + ai.key().slice(-4) + ')';
  $('api-model').addEventListener('change', function () { ai.ls('figurino.model', this.value); toast('Model updated'); });
  $('key-save').addEventListener('click', function () {
    var k = $('api-key').value.trim(); if (!k) return status('key-status', 'Paste your key first.', true);
    ai.ls('figurino.apiKey', k); $('api-key').value = ''; $('api-key').placeholder = 'Key saved (••••' + k.slice(-4) + ')'; status('key-status', 'Key saved in this browser.');
  });
  $('key-del').addEventListener('click', function () { ai.ls('figurino.apiKey', null); $('api-key').placeholder = 'sk-ant-…'; status('key-status', 'Key removed.'); });
  $('key-test').addEventListener('click', function () {
    var btn = this; busy(btn, true); status('key-status', 'Testing…');
    ai.testKey().then(function () { status('key-status', 'The key works.'); }).catch(function (e) { status('key-status', e.message, true); }).then(function () { busy(btn, false); });
  });
  $('export-go').addEventListener('click', function () {
    store.exportAll().then(function (data) {
      var blob = new Blob([JSON.stringify(data)], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'figurino-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      status('data-status', 'Backup exported.');
    }).catch(function (e) { status('data-status', e.message, true); });
  });
  $('import-file').addEventListener('change', function (e) {
    var f = e.target.files[0]; e.target.value = ''; if (!f) return;
    f.text().then(function (t) { return store.importAll(JSON.parse(t), false); }).then(load).then(function () { status('data-status', 'Backup imported.'); })
      .catch(function (err) { status('data-status', err.message || 'Invalid file.', true); });
  });
  $('wipe-go').addEventListener('click', function () {
    var b = this;
    if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = 'Sure? Click again'; setTimeout(function () { delete b.dataset.sure; b.textContent = 'Delete everything'; }, 4000); return; }
    store.wipe().then(function () { Object.keys(state.urls).forEach(function (k) { URL.revokeObjectURL(state.urls[k]); }); state.urls = {}; state.sel = emptyLook(); return load(); })
      .then(function () { status('data-status', 'All data deleted.'); b.textContent = 'Delete everything'; delete b.dataset.sure; });
  });

  load().then(function () {
    if (!state.sel.top && state.outfits.length) applyOutfit(state.outfits[0]);
    route();
  }).catch(function (e) { toast('Local storage is not available in this browser: ' + e.message); route(); });
})(window.App = window.App || {});
