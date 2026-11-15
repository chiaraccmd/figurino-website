/* Figurino — colour utilities and rule-based outfit reading */
(function (App) {
  'use strict';

  function okHex(h) { return typeof h === 'string' && /^#[0-9a-fA-F]{6}$/.test(h) ? h.toUpperCase() : null; }
  function rgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function toHex(c) { return '#' + c.map(function (v) { return ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }).join('').toUpperCase(); }
  /* f < 0 darkens, f > 0 lightens */
  function shade(h, f) {
    h = okHex(h) || '#888888';
    return toHex(rgb(h).map(function (v) { return f < 0 ? v * (1 + f) : v + (255 - v) * f; }));
  }
  function hsl(h) {
    var c = rgb(h).map(function (v) { return v / 255; });
    var mx = Math.max.apply(null, c), mn = Math.min.apply(null, c), l = (mx + mn) / 2, s = 0, hu = 0, d = mx - mn;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      hu = mx === c[0] ? ((c[1] - c[2]) / d) % 6 : mx === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4;
      hu = (hu * 60 + 360) % 360;
    }
    return { h: hu, s: s, l: l };
  }
  /* rough colour family: black, white, neutral, cool, green, warm */
  function kind(h) {
    var x = hsl(h);
    if (x.l < 0.18 && x.s < 0.3) return 'black';
    if (x.l > 0.9 && x.s < 0.3) return 'white';
    if (x.s < 0.18) return 'neutral';
    if (x.h >= 165 && x.h <= 265) return 'cool';
    if (x.h > 70 && x.h < 165) return 'green';
    return 'warm';
  }
  function vivid(h) { var x = hsl(h); return x.s >= 0.35 && x.l >= 0.2 && x.l <= 0.85; }
  /* approximate perceptual distance ("redmean") */
  function dist(a, b) {
    var p = rgb(a), q = rgb(b), r = (p[0] + q[0]) / 2;
    var dr = p[0] - q[0], dg = p[1] - q[1], db = p[2] - q[2];
    return Math.sqrt((2 + r / 256) * dr * dr + 4 * dg * dg + (2 + (255 - r) / 256) * db * db);
  }
  function paletteOf(style) {
    if (!style || !style.palette) return [];
    return [].concat(style.palette.base || [], style.palette.accents || []).filter(function (p) { return okHex(p.hex); });
  }
  function nearest(h, palette) {
    var best = null, bd = 1e9;
    palette.forEach(function (p) { var dd = dist(h, p.hex); if (dd < bd) { bd = dd; best = p; } });
    return { color: best, distance: bd };
  }

  /*
   * parts: [{ name, hex, vibes: [], slot }]
   * returns [[level, message]] with level 'ok' | 'warn' | 'info'
   */
  function readOutfit(parts, style, extra) {
    var out = [];
    if (!parts.length) return [['info', 'Pick at least one item to dress the figure.']];
    var kinds = parts.map(function (p) { return kind(p.hex); });
    var n = function (k) { return kinds.filter(function (x) { return x === k; }).length; };
    var pal = paletteOf(style);

    if (pal.length) {
      var off = parts.filter(function (p) { return p.slot !== 'tights' && nearest(p.hex, pal).distance > 150; });
      if (off.length === 1) out.push(['warn', '"' + off[0].name + '" sits far from your palette: pair it with colours your palette does have.']);
      else if (off.length > 1) out.push(['warn', off.length + ' items sit far from your palette: keep it to one per outfit.']);
    }
    if (n('black') >= 2) out.push(['warn', 'Two black pieces together: keep black to one item and put colour around it.']);
    var accents = n('cool') + n('green');
    if (accents >= 3) out.push(['warn', 'Three cool or green colours together: this only works as clean colour blocking. Otherwise keep one or two.']);
    if (!parts.some(function (p) { return vivid(p.hex); })) out.push(['warn', 'Everything is muted: add one saturated colour near your face or in your tights.']);
    var b = parts.filter(function (p) { return p.slot === 'bottom' || p.slot === 'dress'; })[0];
    var t = parts.filter(function (p) { return p.slot === 'tights'; })[0];
    if (b && t && b.hex.toUpperCase() === t.hex.toUpperCase()) out.push(['warn', 'Tights match the skirt exactly: try another colour from your palette.']);
    var warmVivid = parts.some(function (p) { return kind(p.hex) === 'warm' && vivid(p.hex); });
    if (warmVivid && accents >= 1 && accents <= 2 && n('black') < 2) out.push(['ok', 'A warm base with one cool or green accent: a balance that works.']);
    else if (accents >= 1 && n('warm') >= 1 && n('black') < 2) out.push(['ok', 'Warm and cool colours balance each other: nothing takes over.']);
    var uniq = {}; parts.forEach(function (p) { uniq[p.hex.toUpperCase()] = 1; });
    if (Object.keys(uniq).length >= 5) out.push(['info', 'Five or more colours: to keep it together, repeat one of them in two places.']);
    var details = (extra && extra.details) || 0;
    if (details >= 3) out.push(['ok', details + ' details on top of the base: a rich, considered look.']);
    else out.push(['info', 'For a richer look, aim for at least three details beyond the base: outerwear, coloured tights, a bag, jewellery, a scarf.']);
    var real = parts.filter(function (p) { return p.vibes && p.vibes.length; });
    if (real.length && style && style.vibes && style.vibes.length) {
      var common = style.vibes.filter(function (v) { return real.every(function (p) { return p.vibes.indexOf(v.id) >= 0; }); });
      out.push(common.length ? ['ok', 'Works for: ' + common.map(function (v) { return v.name; }).join(', ') + '.'] : ['info', 'These pieces come from different vibes: let one lead and give the other a single detail.']);
    }
    return out;
  }

  App.color = { okHex: okHex, rgb: rgb, shade: shade, hsl: hsl, kind: kind, vivid: vivid, dist: dist, nearest: nearest, paletteOf: paletteOf, readOutfit: readOutfit };
})(window.App = window.App || {});
