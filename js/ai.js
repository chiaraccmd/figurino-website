/* Figurino — analysis with Claude, called straight from the browser with the user's own API key */
(function (App) {
  'use strict';
  var C = App.color;
  var API = 'https://api.anthropic.com/v1/messages';
  App.MODELS = [
    ['claude-sonnet-5-5', 'Claude Sonnet 5.5 (recommended)'],
    ['claude-opus-5-5', 'Claude Opus 5.5 (most accurate, pricier)'],
    ['claude-haiku-5-5', 'Claude Haiku 5.5 (fastest, cheapest)']
  ];

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function key() { return ls('figurino.apiKey') || ''; }
  function model() { return ls('figurino.model') || App.MODELS[0][0]; }

  /* Downscale a photo; returns a JPEG blob and its base64 */
  function prepareImage(file, max) {
    max = max || 1100;
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var s = Math.min(1, max / Math.max(img.width, img.height)), w = Math.round(img.width * s), h = Math.round(img.height * s);
        var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        cv.toBlob(function (blob) {
          var r = new FileReader();
          r.onload = function () { resolve({ blob: blob, base64: String(r.result).split(',')[1], w: w, h: h }); };
          r.onerror = reject; r.readAsDataURL(blob);
        }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Could not read this image.')); };
      img.src = url;
    });
  }
  function imgBlock(b64) { return { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } }; }

  function call(system, content, maxTokens) {
    var k = key();
    if (!k) return Promise.reject(new Error('No API key yet: add one in Settings.'));
    return fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': k, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: model(), max_tokens: maxTokens || 2000, system: system, messages: [{ role: 'user', content: content }] })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.ok) return (j.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('');
        var msg = (j.error && j.error.message) || ('Error ' + r.status);
        if (r.status === 401) msg = 'The API key is not valid: check it in Settings.';
        else if (r.status === 429) msg = 'Too many requests in a short time: wait a minute and try again.';
        else if (r.status === 529 || r.status === 503) msg = 'The service is overloaded right now: try again shortly.';
        else if (r.status === 400 && /credit/i.test(msg)) msg = 'Your API account is out of credit.';
        throw new Error(msg);
      });
    }, function () { throw new Error('Could not connect: check your network and try again.'); });
  }
  function parseJSON(text, arr) {
    var a = text.indexOf(arr ? '[' : '{'), b = text.lastIndexOf(arr ? ']' : '}');
    if (a < 0 || b <= a) throw new Error('The answer was not in the expected format. Please try again.');
    try { return JSON.parse(text.slice(a, b + 1)); } catch (e) { throw new Error('The answer was not in the expected format. Please try again.'); }
  }

  var SYS = 'You are an expert stylist in vintage and contemporary fashion: honest, warm and concrete. Always answer in English. ' +
    'Reply ONLY with valid JSON, with no text before or after it and no code fences. Colours are always hex #RRGGBB.';

  /* ---------- 1. Style from inspiration photos ---------- */
  function analyzeStyle(images, notes) {
    var content = images.map(imgBlock);
    content.push({ type: 'text', text:
      'These are inspiration images (a moodboard, Pinterest screenshots or outfit photos) showing the style this person wants to build.' +
      (notes ? ' Notes from the person: "' + notes + '".' : '') +
      ' Define their style in a concrete, usable way. Return this JSON:\n' +
      '{"name": "short, evocative name for the style",' +
      ' "summary": "2-3 sentences on what the style is and the rule that holds it together",' +
      ' "vibes": [{"id": "v1", "name": "short name (e.g. 70s folk)", "description": "1 sentence", "pieces": ["4-6 key pieces"]}] (2 to 4 vibes),' +
      ' "palette": {"base": [{"name": "colour name", "hex": "#RRGGBB"}] (5-8 colours), "accents": [{"name": "...", "hex": "#RRGGBB"}] (3-6 colours), "avoid": ["colours to avoid, in words"]},' +
      ' "silhouettes": ["3-6 items"], "materials": ["3-6 items"], "patterns": ["3-6 items"], "accessories": ["4-8 items"],' +
      ' "formulas": [{"vibe": "v1", "formula": "piece + piece + detail", "example": "concrete example with colours"}] (one or two per vibe),' +
      ' "rules": ["4-6 practical styling rules"]}' });
    return call(SYS, content, 3000).then(function (t) { return sanitizeStyle(parseJSON(t)); });
  }
  function sanitizeStyle(s) {
    var arr = function (x) { return Array.isArray(x) ? x.filter(function (v) { return typeof v === 'string'; }) : []; };
    var cols = function (x) { return (Array.isArray(x) ? x : []).map(function (c) { return c && C.okHex(c.hex) ? { name: String(c.name || c.hex), hex: C.okHex(c.hex) } : null; }).filter(Boolean); };
    var map = {};
    var vibes = (Array.isArray(s.vibes) ? s.vibes : []).slice(0, 4).map(function (v, i) { var id = 'v' + (i + 1); map[v.id] = id; return { id: id, name: String(v.name || 'Vibe ' + (i + 1)), description: String(v.description || ''), pieces: arr(v.pieces) }; });
    var pal = s.palette || {};
    return {
      id: 'style', name: String(s.name || 'My style'), summary: String(s.summary || ''), vibes: vibes,
      palette: { base: cols(pal.base), accents: cols(pal.accents), avoid: arr(pal.avoid) },
      silhouettes: arr(s.silhouettes), materials: arr(s.materials), patterns: arr(s.patterns), accessories: arr(s.accessories),
      formulas: (Array.isArray(s.formulas) ? s.formulas : []).map(function (f) { return { vibe: map[f.vibe] || f.vibe, formula: String(f.formula || ''), example: String(f.example || '') }; }),
      rules: arr(s.rules), created: new Date().toISOString()
    };
  }

  /* ---------- 2. One item from one or more photos ---------- */
  function styleBrief(style) {
    if (!style) return 'This person has not defined their style yet: judge the item in general terms.';
    return 'The person\'s style: ' + JSON.stringify({ name: style.name, summary: style.summary, vibes: style.vibes.map(function (v) { return { id: v.id, name: v.name, description: v.description }; }), palette: style.palette, silhouettes: style.silhouettes, materials: style.materials, rules: style.rules });
  }
  function wardrobeBrief(items) {
    return 'Items already in the wardrobe: ' + JSON.stringify(items.slice(0, 120).map(function (c) { return { id: c.id, name: c.name, slot: c.slot, color: c.color }; }));
  }
  function analyzeItem(images, style, items) {
    var content = images.map(imgBlock);
    content.push({ type: 'text', text: styleBrief(style) + '\n' + wardrobeBrief(items) + '\n' +
      'The photos show ONE item (or one pair of shoes, or a group of accessories of the same kind). Identify it and judge it against the style, honestly: ' +
      '"keep" if it fits the style, "keep-if" if it only works under certain conditions (say which), "let-go" if it is far from the style. ' +
      'If the lighting distorts the colours, estimate the real colour. Return this JSON:\n' +
      '{"name": "short descriptive name", "slot": one of ' + JSON.stringify(Object.keys(App.SHAPES)) + ',' +
      ' "shape": for the chosen slot, one of ' + JSON.stringify(App.SHAPES) + ',' +
      ' "type": bags only, one of ' + JSON.stringify(App.BAGS) + ',' +
      ' "sleeves": "short" | "long" | null (tops and dresses only),' +
      ' "color": "colour name", "colorHex": "#RRGGBB",' +
      ' "pattern": one of ' + JSON.stringify(App.PATTERNS) + ', "patternColors": ["#RRGGBB", ...] (pattern colours, ground first; [] if solid),' +
      ' "texture": one of ' + JSON.stringify(App.TEXTURES) + ', "material": "short description",' +
      ' "soleHex": "#RRGGBB or null (shoes only)", "detailHex": "#RRGGBB or null (logo or detail, shoes only)", "liningHex": "#RRGGBB or null (visible lining, outerwear only)",' +
      ' "verdict": "keep" | "keep-if" | "let-go", "potential": 1 to 5,' +
      ' "vibes": ["ids of the vibes it works for"],' +
      ' "pairings": ["2-4 concrete outfits, naming wardrobe items where possible"],' +
      ' "pairsWith": ["ids of the wardrobe items it pairs with best"],' +
      ' "notes": "2-3 sentences: why this verdict, what brings it out, any visible flaws worth fixing"}' });
    return call(SYS, content, 1600).then(function (t) { return sanitizeItem(parseJSON(t), style, items); });
  }
  function sanitizeItem(o, style, items) {
    var slot = App.SHAPES[o.slot] ? o.slot : 'accessory';
    var shapes = App.SHAPES[slot], shape = shapes.indexOf(o.shape) >= 0 ? o.shape : shapes[0];
    var ids = {}; (items || []).forEach(function (c) { ids[c.id] = 1; });
    var vibeIds = style ? style.vibes.map(function (v) { return v.id; }) : [];
    return {
      name: String(o.name || 'Untitled item').slice(0, 80), slot: slot, shape: shape,
      type: App.BAGS.indexOf(o.type) >= 0 ? o.type : (shape === 'bag' ? 'crossbody' : null),
      sleeves: o.sleeves === 'short' || o.sleeves === 'long' ? o.sleeves : null,
      color: String(o.color || ''), colorHex: C.okHex(o.colorHex) || '#8A7A66',
      pattern: App.PATTERNS.indexOf(o.pattern) >= 0 ? o.pattern : 'solid',
      patternColors: (Array.isArray(o.patternColors) ? o.patternColors : []).map(C.okHex).filter(Boolean).slice(0, 5),
      texture: App.TEXTURES.indexOf(o.texture) >= 0 ? o.texture : 'smooth', material: String(o.material || ''),
      soleHex: C.okHex(o.soleHex), detailHex: C.okHex(o.detailHex), liningHex: C.okHex(o.liningHex),
      verdict: ['keep', 'keep-if', 'let-go'].indexOf(o.verdict) >= 0 ? o.verdict : 'keep-if',
      potential: Math.max(1, Math.min(5, Math.round(Number(o.potential) || 3))),
      vibes: (Array.isArray(o.vibes) ? o.vibes : []).filter(function (v) { return vibeIds.indexOf(v) >= 0; }),
      pairings: (Array.isArray(o.pairings) ? o.pairings : []).map(String).slice(0, 5),
      pairsWith: (Array.isArray(o.pairsWith) ? o.pairsWith : []).filter(function (id) { return ids[id]; }),
      notes: String(o.notes || '')
    };
  }

  /* ---------- 3. Outfit ideas ---------- */
  function suggestOutfits(style, items, n) {
    var list = items.filter(function (c) { return c.verdict !== 'let-go'; }).map(function (c) { return { id: c.id, name: c.name, slot: c.slot, shape: c.shape, color: c.color, hex: c.colorHex, vibes: c.vibes, verdict: c.verdict }; });
    var text = styleBrief(style) + '\nWardrobe: ' + JSON.stringify(list) + '\n' +
      'Suggest ' + (n || 4) + ' outfits that differ from each other, using ONLY wardrobe items (by id). Spread them across the style\'s vibes. Aim for rich outfits: at least three details beyond the base (outerwear, coloured tights, a bag, jewellery...). ' +
      'You may suggest a tights colour even if no tights are in the wardrobe. Use "dress" OR "top"+"bottom". Return a JSON array:\n' +
      '[{"name": "short outfit name", "outerwear": "id or null", "top": "id or null", "bottom": "id or null", "dress": "id or null", "shoes": "id or null", "accessories": ["id"], "tights": "#RRGGBB or null", "why": "1 sentence"}]';
    return call(SYS, [{ type: 'text', text: text }], 2500).then(function (t) {
      var arr = parseJSON(t, true), ok = {}; items.forEach(function (c) { ok[c.id] = c; });
      var pick = function (id, slot) { return id && ok[id] && (!slot || ok[id].slot === slot) ? id : null; };
      return (Array.isArray(arr) ? arr : []).map(function (o) {
        return { name: String(o.name || 'Outfit'), outerwear: pick(o.outerwear, 'outerwear'), top: pick(o.top, 'top'), bottom: pick(o.bottom, 'bottom'), dress: pick(o.dress, 'dress'), shoes: pick(o.shoes, 'shoes'),
          accessories: (Array.isArray(o.accessories) ? o.accessories : []).filter(function (id) { return pick(id, 'accessory'); }), tights: C.okHex(o.tights), why: String(o.why || '') };
      }).filter(function (o) { return o.top || o.bottom || o.dress; });
    });
  }

  /* ---------- 4. What to buy ---------- */
  function suggestShopping(style, items) {
    var list = items.map(function (c) { return { id: c.id, name: c.name, slot: c.slot, shape: c.shape, color: c.color, verdict: c.verdict }; });
    var text = styleBrief(style) + '\nWardrobe: ' + JSON.stringify(list) + '\n' +
      'Find the gaps in this wardrobe relative to the style and suggest 8-12 targeted purchases. Each one must pair with at least three existing items. ' +
      'Start with cheap, high-impact pieces (tights, accessories), then garments. Encourage looking second-hand too. Do not name brands. Return a JSON array:\n' +
      '[{"name": "what to buy, with colour", "priority": "high" | "medium" | "low", "colors": ["#RRGGBB"], "why": "1-2 sentences", "pairsWith": ["ids of existing items"]}]';
    return call(SYS, [{ type: 'text', text: text }], 2500).then(function (t) {
      var arr = parseJSON(t, true), ok = {}; items.forEach(function (c) { ok[c.id] = 1; });
      return (Array.isArray(arr) ? arr : []).map(function (o) {
        return { name: String(o.name || '').slice(0, 100), priority: ['high', 'medium', 'low'].indexOf(o.priority) >= 0 ? o.priority : 'medium',
          colors: (Array.isArray(o.colors) ? o.colors : []).map(C.okHex).filter(Boolean).slice(0, 5), why: String(o.why || ''),
          pairsWith: (Array.isArray(o.pairsWith) ? o.pairsWith : []).filter(function (id) { return ok[id]; }), done: false };
      }).filter(function (o) { return o.name; });
    });
  }

  function testKey() { return call('Reply with the single word: ok', [{ type: 'text', text: 'Test' }], 10); }

  App.ai = { ls: ls, key: key, model: model, prepareImage: prepareImage, analyzeStyle: analyzeStyle, analyzeItem: analyzeItem, suggestOutfits: suggestOutfits, suggestShopping: suggestShopping, testKey: testKey };
})(window.App = window.App || {});
