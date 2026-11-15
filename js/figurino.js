/* Figurino — watercolour fashion-illustration renderer (SVG) */
(function (App) {
  'use strict';
  var C = App.color, NS = 'http://www.w3.org/2000/svg';

  /* Vocabulary shared with the AI analysis */
  App.SHAPES = {
    outerwear: ['jacket', 'coat', 'bomber', 'cardigan', 'wrap-cardigan', 'vest'],
    top: ['tshirt', 'tank', 'shirt', 'turtleneck', 'turtleneck-ss', 'sweater', 'polo'],
    bottom: ['mini', 'midi-skirt', 'maxi-skirt', 'shorts', 'culotte', 'straight-trousers', 'wide-trousers', 'flares'],
    dress: ['short-dress', 'midi-dress', 'maxi-dress', 'pinafore'],
    shoes: ['ballet-flat', 'mary-jane', 'loafer', 'sneaker', 'ankle-boot', 'boot', 'sandal'],
    accessory: ['bag', 'scarf', 'earrings', 'necklace', 'belt', 'hat', 'arm-warmers', 'tights', 'other']
  };
  App.SLOT_LABEL = { outerwear: 'Outerwear', top: 'Tops', bottom: 'Bottoms', dress: 'Dresses', shoes: 'Shoes', accessory: 'Accessories', other: 'Other' };
  App.BAGS = ['satchel', 'crossbody', 'half-moon', 'oval', 'tote', 'backpack'];
  App.PATTERNS = ['solid', 'check', 'stripes', 'floral', 'polka-dot', 'melange', 'cherries', 'print'];
  App.TEXTURES = ['smooth', 'knit', 'ribbed', 'corduroy', 'denim', 'leather', 'suede', 'silk', 'wool'];

  var F = {
    hairBack: 'M162 92 C156 50 182 34 204 36 C232 36 248 58 240 96 C244 112 240 126 231 134 C226 120 228 106 226 98 L174 98 C172 108 174 122 168 134 C159 126 157 108 162 92 Z',
    head: 'M200 54 C225 54 234 75 233 96 C231 117 218 131 200 132 C183 131 169 117 167 96 C166 75 175 54 200 54 Z',
    fringe: 'M167 88 C168 58 188 45 206 45 C228 45 240 62 235 88 C228 76 220 70 210 73 C200 66 188 70 178 74 C172 79 169 84 167 88 Z',
    neck: 'M191 124 L190 156 L212 156 L211 124 Z',
    armL: 'M152 162 C142 172 137 202 133 242 C129 282 129 312 130 340 L144 341 C145 312 148 282 151 248 C155 222 159 200 163 184 Z',
    armRu: 'M249 163 C266 170 278 202 287 246 C289 256 285 262 279 259 C272 230 263 208 253 199 Z',
    armRf: 'M287 246 C280 266 265 283 249 294 L242 286 C256 276 270 260 279 245 Z',
    handL: 'M128 339 C124 350 126 362 134 364 C142 362 145 351 144 341 Z',
    handR: 'M243 285 C237 288 236 296 241 300 C247 300 250 294 248 288 Z',
    legL: 'M166 396 C161 450 159 496 164 532 C166 584 161 642 157 700 L174 702 C180 642 185 584 187 532 C193 492 197 444 199 402 Z',
    legR: 'M205 402 C207 450 212 498 214 532 C216 590 218 650 220 702 L238 702 C238 650 240 590 239 532 C244 492 246 444 244 396 Z',
    footL: 'M152 696 C149 712 155 723 170 724 C184 724 183 708 177 696 Z',
    footR: 'M216 696 C213 712 219 725 236 725 C251 723 247 708 241 696 Z',
    sneakL: 'M149 692 C144 713 152 726 172 727 C189 727 187 708 181 692 Z',
    sneakR: 'M213 692 C209 713 217 728 238 728 C255 726 251 708 245 692 Z',
    bootL: 'M162 548 C170 546 180 546 187 548 C184 610 180 660 178 698 C186 706 186 724 170 725 C154 725 150 712 152 698 C158 650 160 600 162 548 Z',
    bootR: 'M214 548 C222 546 232 546 240 548 C240 600 239 650 238 698 C248 706 250 726 234 726 C218 726 214 712 218 698 C216 650 214 600 214 548 Z',
    ankleL: 'M156 660 L179 658 L178 698 C186 706 186 724 170 725 C154 725 150 712 152 698 Z',
    ankleR: 'M218 662 L239 660 L238 698 C248 706 250 726 234 726 C218 726 214 712 218 698 Z',
    base: 'M150 158 C166 150 234 150 254 163 C256 200 244 250 242 300 C220 306 196 306 174 302 C170 250 146 200 150 158 Z',
    tank: 'M168 156 C176 152 182 152 186 156 L200 172 L214 156 C218 152 226 152 234 156 C240 200 244 250 242 300 C220 306 196 306 174 302 C170 250 162 200 168 156 Z',
    hips: 'M174 294 C196 300 222 298 242 292 L246 398 C232 404 220 402 208 405 L203 384 L198 405 C186 403 176 401 164 398 Z',
    sleeveL: 'M151 158 C138 168 132 200 128 242 C124 282 124 312 126 340 L146 342 C147 312 149 282 153 248 C157 222 161 198 165 182 Z',
    sleeveRu: 'M247 160 C268 166 281 200 291 245 C294 258 288 267 279 263 C272 231 262 207 251 197 Z',
    sleeveRf: 'M291 245 C283 267 267 285 249 297 L240 287 C255 276 270 260 280 244 Z',
    shortL: 'M150 158 C139 166 135 186 133 208 L157 212 C158 198 161 188 166 181 Z',
    shortR: 'M248 160 C263 166 271 183 275 202 L254 208 C252 198 250 190 248 184 Z',
    collar: 'M183 126 C192 133 210 133 219 126 L223 162 C211 168 192 168 180 162 Z',
    mini: 'M172 290 C190 295 220 295 239 286 L264 394 C231 410 180 412 145 402 Z',
    midi: 'M172 290 C190 295 220 295 239 286 L270 540 C230 556 172 556 134 544 Z',
    long: 'M172 290 C190 295 220 295 239 286 L278 652 C232 670 168 670 126 656 Z',
    shorts: 'M172 290 C190 295 220 295 239 286 L250 440 L210 444 L205 380 L198 446 L160 442 Z',
    culotte: 'M172 290 C190 295 220 295 239 286 C250 380 260 470 272 560 L214 566 L206 382 L196 562 L138 558 C150 470 162 380 172 290 Z',
    straight: 'M172 290 C190 295 220 295 239 286 C246 400 248 560 248 708 L212 710 L206 392 L192 708 L152 706 C152 560 160 400 172 290 Z',
    pants: 'M172 290 C190 295 220 295 239 286 C248 400 256 560 262 708 L212 710 L206 392 L190 708 L140 706 C146 560 160 400 172 290 Z',
    flare: 'M172 290 C190 295 220 295 239 286 C246 380 244 470 241 540 C249 600 259 660 263 708 L212 710 C214 640 214 590 212 540 L206 400 L192 540 C190 600 186 660 188 708 L137 706 C145 650 158 600 164 540 C162 460 166 370 172 290 Z',
    pinaforeTop: 'M172 196 L186 158 L192 158 L190 196 L212 196 L210 158 L216 158 L232 196 C236 230 240 260 240 292 C220 298 194 298 174 294 C172 260 170 230 172 196 Z',
    jacketL: 'M150 158 C162 151 176 149 185 151 L191 200 L195 300 L189 366 C168 368 150 364 136 357 C140 320 140 262 146 202 Z',
    jacketR: 'M217 151 C230 151 244 155 254 163 C263 210 265 280 269 351 C253 359 233 363 214 363 L212 300 L214 202 Z',
    coatL: 'M150 158 C162 151 176 149 185 151 L191 200 L196 330 L192 522 C170 526 146 522 128 514 C134 440 138 340 146 202 Z',
    coatR: 'M217 151 C230 151 244 155 254 163 C266 230 272 380 278 510 C258 518 234 522 212 520 L210 330 L214 202 Z',
    liningL: 'M184 151 L191 151 L199 300 L195 366 L189 366 L195 300 Z',
    liningR: 'M211 151 L217 151 L214 202 L212 300 L214 363 L208 363 L206 300 L208 202 Z',
    lapelL: 'M174 150 L187 152 L181 182 Z', lapelR: 'M228 150 L215 152 L221 182 Z',
    cardiL: 'M150 158 C160 152 172 150 180 151 L196 240 L196 346 C176 350 154 348 138 342 C142 310 144 270 146 230 C144 210 146 190 150 158 Z',
    cardiR: 'M222 151 C232 151 244 155 254 163 C262 210 262 280 266 342 C250 348 230 350 208 348 L208 240 Z',
    vestL: 'M160 160 C168 154 176 152 182 152 L194 236 L194 318 C178 322 164 320 152 316 C154 280 154 240 156 210 Z',
    vestR: 'M220 152 C228 152 236 156 244 162 C250 210 250 270 252 314 C238 320 222 322 208 318 L208 236 Z',
    wrapL: 'M150 158 C160 152 172 150 180 151 L212 292 L208 305 C184 307 160 305 146 299 C144 262 144 222 146 202 Z',
    wrapR: 'M222 151 C232 151 244 155 254 163 C258 210 256 260 258 300 C240 306 220 307 204 305 L190 292 Z',
    bomberL: 'M150 158 C162 151 176 149 185 151 L192 302 C172 307 156 305 146 300 C142 260 144 220 146 202 Z',
    bomberR: 'M217 151 C230 151 244 155 254 163 C258 210 256 260 258 299 C240 305 226 305 212 303 Z',
    bombHemL: 'M146 288 L192 290 L192 303 C172 307 156 305 146 300 Z',
    bombHemR: 'M212 290 L258 286 L258 299 C240 305 226 305 212 303 Z',
    cuffL: 'M125 322 L146 324 L146 336 L125 334 Z',
    warmL: 'M127 290 L149 292 L146 332 L125 330 Z',
    warmR: 'M281 251 L291 257 C286 269 278 279 268 287 L260 279 C268 271 276 263 281 251 Z',
    foulard: 'M182 150 C192 160 210 160 220 150 L222 163 C210 171 192 171 180 163 Z',
    belt: 'M174 291 C196 297 222 295 240 287 L241 298 C222 306 196 306 174 302 Z',
    beret: 'M163 66 C166 40 226 32 241 60 C238 72 174 76 163 66 Z',
    bagStrap: 'M249 161 C232 232 202 300 178 344',
    satchel: 'M154 344 L204 340 L207 384 L157 389 Z', satchelFlap: 'M154 344 L204 340 L205 366 C188 371 170 372 155 369 Z',
    halfmoon: 'M154 390 L206 386 C206 362 193 348 180 348 C166 348 154 362 154 390 Z',
    oval: 'M180 340 C196 340 205 354 205 368 C205 384 194 396 180 396 C166 396 155 384 155 368 C155 354 164 340 180 340 Z',
    tote: 'M274 262 L316 260 L310 318 L280 320 Z',
    backpack: 'M244 168 L262 166 C268 200 270 240 270 280 L250 284 Z'
  };

  function S(tag, a) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); return e; }

  function defs(d) {
    function filt(id, attrs, kids) { var f = S('filter', Object.assign({ id: id }, attrs)); kids.forEach(function (k) { f.appendChild(S(k[0], k[1])); }); d.appendChild(f); }
    filt('fg-paper', { x: '0', y: '0', width: '100%', height: '100%' }, [['feTurbulence', { type: 'fractalNoise', baseFrequency: '0.7', numOctaves: '3', seed: '4' }], ['feColorMatrix', { type: 'matrix', values: '0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0.10 0' }], ['feComposite', { in2: 'SourceGraphic', operator: 'in' }]]);
    filt('fg-wc', { x: '-15%', y: '-15%', width: '130%', height: '130%' }, [['feTurbulence', { type: 'fractalNoise', baseFrequency: '0.035', numOctaves: '3', seed: '8', result: 'n' }], ['feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: '6', result: 'd' }], ['feTurbulence', { type: 'fractalNoise', baseFrequency: '0.11', numOctaves: '3', seed: '21', result: 'g' }], ['feColorMatrix', { in: 'g', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.55 1.12', result: 'ga' }], ['feComposite', { in: 'd', in2: 'ga', operator: 'in', result: 't' }], ['feGaussianBlur', { in: 't', stdDeviation: '0.35' }]]);
    filt('fg-wob', { x: '-10%', y: '-10%', width: '120%', height: '120%' }, [['feTurbulence', { type: 'fractalNoise', baseFrequency: '0.045', numOctaves: '2', seed: '5', result: 'n' }], ['feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: '3.2' }]]);
    filt('fg-blob', {}, [['feTurbulence', { type: 'fractalNoise', baseFrequency: '0.012', numOctaves: '3', seed: '11', result: 'n' }], ['feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: '60' }], ['feGaussianBlur', { stdDeviation: '6' }]]);
    var sh = S('linearGradient', { id: 'fg-sh', x1: '0', x2: '1', y1: '0', y2: '0' });
    [['0', '#FFFFFF', '.35'], ['.45', '#FFFFFF', '0'], ['.7', '#3A1E10', '0'], ['1', '#3A1E10', '.35']].forEach(function (s) { sh.appendChild(S('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] })); });
    d.appendChild(sh);
  }

  /* Figure customisation */
  App.FIGURE = {
    skins: [['Porcelain', '#F6DFCC'], ['Light', '#F0D4BC'], ['Light medium', '#E4BB9C'], ['Medium', '#CF9A74'], ['Tan', '#B07A52'], ['Brown', '#8A5A3B'], ['Deep brown', '#64402A'], ['Deep', '#45291B']],
    hairColors: [['Black', '#1E1712'], ['Dark brown', '#3B2416'], ['Brown', '#6A4128'], ['Auburn', '#7A4128'], ['Copper', '#B0532B'], ['Blonde', '#C8A064'], ['Platinum', '#E2D5B6'], ['Grey', '#A7A19A']],
    hairStyles: [['bixie', 'Bixie with fringe'], ['pixie', 'Pixie'], ['bob', 'Bob'], ['long', 'Long and straight'], ['curly', 'Long curls'], ['afro', 'Afro'], ['bun', 'Bun'], ['ponytail', 'Ponytail'], ['braids', 'Two braids']],
    eyes: [['closed', 'Closed'], ['open', 'Open']],
    eyeColors: [['Dark brown', '#3A2214'], ['Brown', '#6B4226'], ['Hazel', '#8A6A34'], ['Green', '#5E7A4A'], ['Blue', '#4F7BA6'], ['Grey', '#7E8A92']],
    bodies: [['standard', 'Standard'], ['slim', 'Slim'], ['athletic', 'Athletic'], ['pear', 'Pear'], ['hourglass', 'Hourglass'], ['apple', 'Apple'], ['plus', 'Plus size']],
    defaults: { skin: '#F0D4BC', hair: '#7A4128', hairStyle: 'bixie', eyes: 'closed', eyeColor: '#6B4226', body: 'standard' }
  };
  /* width factors at y anchors: shoulders, bust, waist, hips, thighs, calves */
  var BODY = {
    standard: [1, 1, 1, 1, 1, 1],
    slim: [0.93, 0.9, 0.88, 0.9, 0.9, 0.92],
    athletic: [1.08, 1.02, 1.02, 1.0, 1.04, 1.04],
    pear: [0.96, 0.98, 1.0, 1.2, 1.18, 1.06],
    hourglass: [1.05, 1.13, 0.98, 1.18, 1.14, 1.04],
    apple: [1.06, 1.16, 1.2, 1.1, 1.08, 1.04],
    plus: [1.18, 1.26, 1.26, 1.3, 1.26, 1.14]
  };
  var BODY_Y = [0, 140, 166, 205, 292, 356, 450, 600, 730];
  function bodyK(body) {
    var f = BODY[body] || BODY.standard, ks = [1, 1, f[0], f[1], f[2], f[3], f[4], f[5], f[5]];
    return function (y) {
      if (y <= BODY_Y[0]) return ks[0];
      for (var i = 1; i < BODY_Y.length; i++) if (y <= BODY_Y[i]) { var t = (y - BODY_Y[i - 1]) / (BODY_Y[i] - BODY_Y[i - 1]); return ks[i - 1] + (ks[i] - ks[i - 1]) * t; }
      return ks[ks.length - 1];
    };
  }
  /* hair: back is drawn behind the body, front over the face (and over clothes for long hair) */
  function mir(d) { return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function (m, x, y) { return (400 - parseFloat(x)) + ' ' + y; }); }
  var CAP = 'M164 90 C160 52 184 40 204 40 C230 40 244 58 238 92 C236 100 234 106 232 110 L168 110 C166 104 164 96 164 90 Z';
  var SLICK = 'M167 90 C166 62 184 48 202 48 C222 48 236 62 234 90 C228 72 216 62 200 62 C186 62 174 72 167 90 Z';
  var HAIR = {
    bixie: { back: ['M162 92 C156 50 182 34 204 36 C232 36 248 58 240 96 C244 112 240 126 231 134 C226 120 228 106 226 98 L174 98 C172 108 174 122 168 134 C159 126 157 108 162 92 Z'], front: ['M167 88 C168 58 188 45 206 45 C228 45 240 62 235 88 C228 76 220 70 210 73 C200 66 188 70 178 74 C172 79 169 84 167 88 Z'], shine: 'M176 64 C186 58 196 60 204 66 M206 52 C216 52 226 58 230 70' },
    pixie: { back: ['M164 90 C160 52 184 40 204 40 C230 40 244 58 238 92 C236 100 234 104 232 108 L168 108 C166 102 164 96 164 90 Z'], front: ['M166 84 C168 56 190 44 210 46 C230 48 238 64 236 82 C226 70 210 64 196 70 C186 74 174 80 166 84 Z'], shine: 'M182 58 C194 52 210 52 222 58' },
    bob: { back: ['M160 92 C154 48 182 34 204 36 C234 36 250 58 242 96 C246 118 244 134 238 142 C226 146 214 144 210 140 L190 140 C186 144 174 146 162 142 C156 134 154 118 160 92 Z'], front: ['M166 86 C166 56 188 44 204 44 C226 44 238 58 236 86 C222 80 210 80 200 80 C190 80 178 80 166 86 Z', 'M166 86 C162 104 164 124 172 140 L180 140 C174 124 172 104 174 88 Z', mir('M166 86 C162 104 164 124 172 140 L180 140 C174 124 172 104 174 88 Z')], shine: 'M178 60 C190 52 208 52 222 60' },
    long: { back: ['M160 94 C154 48 182 34 204 36 C234 36 250 58 242 96 C250 140 256 200 252 240 C236 248 222 246 214 238 L188 238 C180 246 164 248 150 240 C146 200 152 140 160 94 Z'], front: ['M200 46 C186 46 170 56 167 86 C170 100 170 120 168 150 C174 160 180 170 182 186 C184 150 180 110 184 84 C188 66 194 56 200 50 Z', mir('M200 46 C186 46 170 56 167 86 C170 100 170 120 168 150 C174 160 180 170 182 186 C184 150 180 110 184 84 C188 66 194 56 200 50 Z')], shine: 'M190 56 C184 62 180 72 178 84 M210 56 C216 62 220 72 222 84' },
    curly: { back: ['M158 96 C140 80 156 40 186 36 C200 26 226 30 236 44 C256 52 258 80 250 98 C264 120 256 150 262 176 C266 200 252 222 236 226 C224 236 206 232 200 226 C192 234 172 236 162 226 C144 222 136 198 142 176 C146 150 136 122 158 96 Z'], front: ['M168 86 C164 70 172 58 184 58 C186 48 198 44 206 50 C214 44 228 48 228 58 C238 60 240 74 234 86 C228 78 220 76 214 80 C208 72 198 72 192 78 C186 74 176 76 168 86 Z', 'M168 92 C158 104 166 118 160 132 C156 146 166 156 172 150 C176 138 170 126 176 112 Z', mir('M168 92 C158 104 166 118 160 132 C156 146 166 156 172 150 C176 138 170 126 176 112 Z')], shine: 'M150 120 C146 130 150 140 146 150 M250 120 C254 130 250 140 254 150 M156 190 C152 200 158 208 154 216 M244 190 C248 200 242 208 246 216' },
    afro: { back: ['M200 20 C242 20 266 46 266 82 C266 112 250 132 236 136 L164 136 C150 132 134 112 134 82 C134 46 158 20 200 20 Z'], front: ['M168 86 C170 70 180 62 192 64 C198 60 206 60 212 64 C222 62 232 70 232 86 C226 78 214 74 200 76 C186 74 174 78 168 86 Z'], shine: 'M160 46 C166 40 172 38 178 38 M222 38 C230 38 236 42 240 48 M146 80 C146 74 148 68 150 64' },
    bun: { back: [CAP, 'M200 14 C214 14 222 24 222 36 C222 48 212 54 200 54 C188 54 178 48 178 36 C178 24 186 14 200 14 Z'], front: [SLICK], shine: 'M190 22 C196 18 206 18 212 22 M182 58 C192 52 208 52 220 58' },
    ponytail: { back: [CAP, 'M226 60 C252 66 258 100 250 140 C246 170 236 196 240 220 C228 210 224 180 230 150 C236 120 236 90 222 76 Z'], front: [SLICK], shine: 'M182 58 C192 52 208 52 220 58 M246 110 C246 130 242 150 238 170' },
    braids: { back: [CAP], front: ['M167 90 C166 62 184 48 200 48 L200 62 C186 62 174 72 167 90 Z', mir('M167 90 C166 62 184 48 200 48 L200 62 C186 62 174 72 167 90 Z'), 'M172 108 C166 130 168 150 164 172 C162 192 166 212 162 234 L174 236 C178 214 174 192 178 172 C182 150 180 128 182 112 Z', mir('M172 108 C166 130 168 150 164 172 C162 192 166 212 162 234 L174 236 C178 214 174 192 178 172 C182 150 180 128 182 112 Z')], shine: 'M165 140 L179 146 M164 160 L178 166 M163 180 L177 186 M163 200 L177 206 M162 220 L176 226 M235 140 L221 146 M236 160 L222 166 M237 180 L223 186 M237 200 L223 206 M238 220 L224 226' }
  };

  /*
   * look: { outerwear, top, bottom, dress, shoes, accessories: [], tights } (item ids; tights is a #hex colour)
   * getItem(id) -> item
   * opts: { skin, hair, hairStyle, eyes: 'closed' | 'open', eyeColor, body } (see App.FIGURE)
   */
  var drawCount = 0;
  function draw(svg, look, getItem, opts) {
    var uid = ++drawCount;
    opts = Object.assign({}, App.FIGURE.defaults, opts || {});
    var K = bodyK(opts.body), warp = opts.body && opts.body !== 'standard';
    function W(dd) { return warp ? dd.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function (m, x, y) { y = parseFloat(y); return (Math.round((200 + (parseFloat(x) - 200) * K(y)) * 10) / 10) + ' ' + y; }) : dd; }
    svg.setAttribute('viewBox', '20 20 360 700');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var d = S('defs', {}); svg.appendChild(d); defs(d);
    var hairCol = C.okHex(opts.hair) || '#7A4128', hairDef = HAIR[opts.hairStyle] || HAIR.bixie;
    var HAIR_ID = 'fg-hair-' + uid, hg = S('linearGradient', { id: HAIR_ID, x1: '0', x2: '0.4', y1: '0', y2: '1' });
    hg.appendChild(S('stop', { offset: '0', 'stop-color': C.shade(hairCol, 0.18) })); hg.appendChild(S('stop', { offset: '1', 'stop-color': C.shade(hairCol, -0.25) }));
    d.appendChild(hg);
    var root = S('g', {}), pc = 0; svg.appendChild(root);
    var INK = '#3E2416', SKIN = C.okHex(opts.skin) || '#F0D4BC', HAND = C.shade(SKIN, -0.03), NEUTRAL = '#E6D9C2';

    function pat(kind, base, cols) {
      var id = 'fg-p' + uid + '-' + (pc++), p;
      cols = (cols || []).map(C.okHex).filter(Boolean);
      base = C.okHex(base) || '#888888';
      if (kind === 'check') {
        if (cols.length < 2) cols = [C.shade(base, -0.25), C.shade(base, 0.55), C.shade(base, 0.25), C.shade(base, -0.45)];
        p = S('pattern', { id: id, width: '10', height: '10', patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-6)' });
        p.appendChild(S('rect', { width: '10', height: '10', fill: C.shade(cols[0], -0.1) }));
        [[1, 2, 1], [6, 2, 2], [1, 7, 3], [6, 7, 1]].forEach(function (c) { p.appendChild(S('path', { d: 'M' + c[0] + ' ' + c[1] + ' L' + (c[0] + 3) + ' ' + (c[1] + 2) + ' M' + (c[0] + 3) + ' ' + c[1] + ' L' + c[0] + ' ' + (c[1] + 2), stroke: cols[c[2] % cols.length], 'stroke-width': '1.5' })); });
      } else if (kind === 'stripes') {
        var c2 = cols[1] || cols[0] || C.shade(base, 0.6);
        p = S('pattern', { id: id, width: '10', height: '10', patternUnits: 'userSpaceOnUse' });
        p.appendChild(S('rect', { width: '10', height: '10', fill: base })); p.appendChild(S('rect', { y: '6', width: '10', height: '3', fill: c2 === base ? C.shade(base, 0.6) : c2 }));
      } else if (kind === 'polka-dot') {
        p = S('pattern', { id: id, width: '12', height: '12', patternUnits: 'userSpaceOnUse' });
        p.appendChild(S('rect', { width: '12', height: '12', fill: base })); p.appendChild(S('circle', { cx: '3', cy: '3', r: '1.6', fill: cols[1] || C.shade(base, 0.7) })); p.appendChild(S('circle', { cx: '9', cy: '9', r: '1.6', fill: cols[1] || C.shade(base, 0.7) }));
      } else if (kind === 'floral') {
        var fc = cols[1] || C.shade(base, 0.7), cc = cols[2] || '#E0A030';
        p = S('pattern', { id: id, width: '18', height: '18', patternUnits: 'userSpaceOnUse' });
        p.appendChild(S('rect', { width: '18', height: '18', fill: base }));
        [[5, 5], [14, 13]].forEach(function (q) { [0, 72, 144, 216, 288].forEach(function (a) { p.appendChild(S('ellipse', { cx: String(q[0]), cy: String(q[1] - 2), rx: '1.3', ry: '2', fill: fc, transform: 'rotate(' + a + ' ' + q[0] + ' ' + q[1] + ')' })); }); p.appendChild(S('circle', { cx: String(q[0]), cy: String(q[1]), r: '0.9', fill: cc })); });
      } else if (kind === 'cherries') {
        p = S('pattern', { id: id, width: '22', height: '22', patternUnits: 'userSpaceOnUse' });
        p.appendChild(S('rect', { width: '22', height: '22', fill: base }));
        p.appendChild(S('path', { d: 'M9 12 Q11 6 14 5 M13 12 Q13 7 14 5', stroke: '#3E9B4F', 'stroke-width': '1', fill: 'none' }));
        p.appendChild(S('circle', { cx: '8.5', cy: '13.5', r: '2.2', fill: '#D6302B' })); p.appendChild(S('circle', { cx: '13', cy: '14', r: '2.2', fill: '#D6302B' }));
      } else if (kind === 'melange') {
        p = S('pattern', { id: id, width: '12', height: '10', patternUnits: 'userSpaceOnUse' });
        p.appendChild(S('rect', { width: '12', height: '10', fill: base }));
        p.appendChild(S('path', { d: 'M2 2 L4.5 3 M8 7 L10.5 6 M5 9 L7 9.6 M9 1 L11 1.8', stroke: cols[1] || '#F1E2D6', 'stroke-width': '1.1', 'stroke-linecap': 'round', opacity: '.8' }));
      } else if (kind === 'print') {
        p = S('pattern', { id: id, width: '16', height: '16', patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(20)' });
        p.appendChild(S('rect', { width: '16', height: '16', fill: base }));
        p.appendChild(S('path', { d: 'M2 8 Q5 3 8 8 T14 8', stroke: cols[1] || C.shade(base, 0.6), 'stroke-width': '1.4', fill: 'none' }));
      } else if (kind === 'corduroy') {
        p = S('pattern', { id: id, width: '5', height: '10', patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(4)' });
        p.appendChild(S('rect', { width: '5', height: '10', fill: base })); p.appendChild(S('rect', { width: '1.6', height: '10', fill: C.shade(base, -0.25) }));
      } else if (kind === 'denim') {
        p = S('pattern', { id: id, width: '6', height: '6', patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
        p.appendChild(S('rect', { width: '6', height: '6', fill: base })); p.appendChild(S('rect', { width: '1', height: '6', fill: C.shade(base, 0.18) }));
      } else {
        p = S('pattern', { id: id, width: '4', height: '10', patternUnits: 'userSpaceOnUse' });
        p.appendChild(S('rect', { width: '4', height: '10', fill: base })); p.appendChild(S('rect', { width: '1.1', height: '10', fill: C.shade(base, -0.2) }));
      }
      d.appendChild(p); return 'url(#' + id + ')';
    }
    function fillFor(c) {
      var h = C.okHex(c.colorHex) || '#888888', m = c.pattern, t = c.texture;
      if (m && m !== 'solid' && App.PATTERNS.indexOf(m) >= 0) return pat(m, h, c.patternColors);
      if (t === 'corduroy' || t === 'denim') return pat(t, h);
      if (t === 'ribbed' || t === 'knit') return pat('ribbed', h);
      return h;
    }
    function piece(dd, fill, o) {
      o = o || {}; dd = W(dd);
      var a = { d: dd, fill: fill, filter: 'url(#fg-wc)' }; if (o.op) a.opacity = o.op;
      root.appendChild(S('path', a));
      if (o.shade) root.appendChild(S('path', { d: dd, fill: 'url(#fg-sh)', filter: 'url(#fg-wc)', style: 'mix-blend-mode:multiply' }));
      if (o.ink !== false) root.appendChild(S('path', { d: dd, fill: 'none', stroke: INK, 'stroke-width': o.w || '1.4', 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: '.85', filter: 'url(#fg-wob)' }));
    }
    function line(dd, col, w, op) { root.appendChild(S('path', { d: W(dd), fill: 'none', stroke: col, 'stroke-width': String(w || 1), opacity: String(op == null ? 0.6 : op), 'stroke-linecap': 'round', filter: 'url(#fg-wob)' })); }
    function col(it) { return it && C.okHex(it.colorHex); }
    function get(id) { return id ? getItem(id) : null; }

    var dress = get(look.dress), top = (dress && dress.shape !== 'pinafore') ? null : get(look.top), bot = dress ? null : get(look.bottom), jak = get(look.outerwear), shoe = get(look.shoes);
    var accs = (look.accessories || []).map(get).filter(Boolean);
    var sockItem = accs.filter(function (a) { return a.shape === 'tights'; })[0];
    var tights = C.okHex(look.tights) || col(sockItem);
    var tc = col(top), jc = col(jak), bc = col(bot), ac = col(dress);

    /* background */
    root.appendChild(S('rect', { x: '20', y: '20', width: '360', height: '700', fill: '#F3E9D6' }));
    root.appendChild(S('rect', { x: '20', y: '20', width: '360', height: '700', fill: '#F3E9D6', filter: 'url(#fg-paper)' }));
    var bl = S('g', { filter: 'url(#fg-blob)', opacity: '.45' });
    bl.appendChild(S('ellipse', { cx: '215', cy: '330', rx: '120', ry: '230', fill: C.shade(jc || tc || ac || '#D9C08A', 0.45) }));
    bl.appendChild(S('ellipse', { cx: '160', cy: '480', rx: '70', ry: '130', fill: C.shade(bc || ac || '#B9C3A2', 0.5) }));
    root.appendChild(bl);

    /* body */
    hairDef.back.forEach(function (hd) { piece(hd, 'url(#' + HAIR_ID + ')', { w: '1', shade: true }); });
    if (accs.some(function (a) { return a.shape === 'bag' && a.type === 'backpack'; })) { var bp = accs.filter(function (a) { return a.type === 'backpack'; })[0]; piece(F.backpack, col(bp) || '#8A5A3A', { shade: true }); }
    piece(F.armL, SKIN, { w: '1.1' }); piece(F.armRu, SKIN, { w: '1.1' }); piece(F.armRf, SKIN, { w: '1.1' });
    piece(F.legL, tights || SKIN, { shade: true }); piece(F.legR, tights ? C.shade(tights, 0.06) : SKIN, { shade: true });

    /* shoes */
    var sc = col(shoe), sf = shoe && shoe.shape;
    if (!sc) { piece(F.footL, SKIN, { w: '1' }); piece(F.footR, SKIN, { w: '1' }); }
    else if (sf === 'sneaker') {
      piece(F.sneakL, sc); piece(F.sneakR, sc);
      line('M147 717 C152 728 186 729 189 717 M211 718 C215 730 252 730 254 717', C.okHex(shoe.soleHex) || '#F2EEE6', 4.5, 1);
      line('M155 708 Q166 712 178 703 M219 709 Q231 714 243 704', C.okHex(shoe.detailHex) || C.shade(sc, -0.3), 2.2, 0.95);
    } else if (sf === 'boot') { piece(F.bootL, sc, { shade: true }); piece(F.bootR, sc, { shade: true }); }
    else if (sf === 'ankle-boot') { piece(F.ankleL, sc, { shade: true }); piece(F.ankleR, sc, { shade: true }); }
    else if (sf === 'sandal') {
      piece(F.footL, SKIN, { w: '1' }); piece(F.footR, SKIN, { w: '1' });
      line('M154 706 L178 702 M153 716 L180 713 M218 708 L243 704 M217 718 L246 715', sc, 3, 1);
    } else {
      piece(F.footL, sc); piece(F.footR, sc);
      if (sf === 'mary-jane') { line('M156 704 L179 702 M219 706 L243 704', C.shade(sc, -0.45), 2.4, 0.9); line('M176 702 L176 702.2 M240 704 L240 704.2', '#C9A15A', 3.4, 1); }
      else if (sf === 'loafer') line('M158 708 Q166 702 176 706 M222 710 Q230 704 240 708', C.shade(sc, -0.35), 1.8, 0.9);
      else line('M158 703 Q164 699 170 703 Q164 707 158 703 Z M224 705 Q230 701 236 705 Q230 709 224 705 Z', C.shade(sc, -0.4), 1.2, 0.9);
    }
    if (shoe && C.okHex(shoe.soleHex) && sf !== 'sneaker') line('M151 722 C158 727 178 727 184 721 M215 723 C222 728 244 728 250 722', shoe.soleHex, 2.4, 0.9);

    piece(F.neck, HAND, { w: '1' });
    if (!bc && !ac) piece(F.hips, NEUTRAL, { w: '1.1' });

    /* top or dress */
    function drawTop(it, c, fill) {
      var fm = it.shape || '';
      if (fm === 'tank' || fm === 'pinafore') {
        if (fm === 'tank') piece(F.tank, fill, { shade: true }); else piece(F.pinaforeTop, fill, { shade: true });
        return;
      }
      var shortS = /^(polo|tshirt|turtleneck-ss|short-dress)$/.test(fm);
      if (it.sleeves === 'short') shortS = true;
      if (it.sleeves === 'long') shortS = false;
      if (shortS) { piece(F.shortL, fill); piece(F.shortR, fill); }
      else { piece(F.sleeveL, fill, { shade: true }); piece(F.sleeveRu, fill, { shade: true }); piece(F.sleeveRf, fill); }
      piece(F.base, fill, { shade: true });
      if (/^turtleneck/.test(fm)) piece(F.collar, pat('ribbed', c), { w: '1.1' });
      else if (fm === 'polo' || fm === 'shirt') {
        piece('M196 158 L206 158 L206 ' + (fm === 'shirt' ? '300' : '212') + ' L196 ' + (fm === 'shirt' ? '300' : '212') + ' Z', fill, { w: '1' });
        piece('M176 150 L200 159 L188 178 Z', fill, { w: '1.1' }); piece('M224 150 L200 159 L212 178 Z', fill, { w: '1.1' });
        var ys = fm === 'shirt' ? [172, 196, 220, 244, 268, 292] : [170, 184, 198];
        line(ys.map(function (y) { return 'M201 ' + y + ' L201 ' + (y + 0.2); }).join(' '), C.shade(c, 0.4), 3, 1);
      } else line('M181 155 C191 166 211 166 221 155', C.shade(c, -0.3), 3, 0.8);
      line('M168 230 C174 252 172 272 170 292 M236 226 C232 252 236 276 238 296', INK, 0.9, 0.45);
    }
    if (ac) {
      var af = fillFor(dress), fa = dress.shape || 'short-dress';
      if (fa === 'pinafore') {
        if (tc) drawTop(top, tc, fillFor(top)); else piece(F.base, NEUTRAL, { w: '1.1' });
      }
      var skirtShape = fa === 'maxi-dress' ? F.long : fa === 'midi-dress' ? F.midi : F.mini;
      piece(skirtShape, af, { shade: true });
      drawTop(dress, ac, af);
      line('M175 300 C192 304 220 304 238 296', C.shade(ac, -0.3), 1.6, 0.5);
    } else if (tc) drawTop(top, tc, fillFor(top));
    else piece(F.base, NEUTRAL, { w: '1.1' });

    /* bottom */
    if (bc) {
      var bf = fillFor(bot), frm = bot.shape || 'wide-trousers';
      var shp = { 'mini': F.mini, 'midi-skirt': F.midi, 'maxi-skirt': F.long, 'shorts': F.shorts, 'culotte': F.culotte, 'straight-trousers': F.straight, 'flares': F.flare }[frm] || F.pants;
      piece(shp, bf, { shade: true });
      line('M175 300 C192 304 220 304 238 296', C.shade(bc, -0.3), 2.4, 0.7);
      if (frm === 'mini') line('M190 330 C186 360 182 380 178 404 M226 326 C232 356 240 376 246 398', INK, 0.9, 0.45);
      else if (frm === 'midi-skirt') line('M186 340 C178 420 168 480 160 540 M222 336 C232 410 244 470 252 536', INK, 0.9, 0.45);
      else if (frm === 'maxi-skirt') line('M186 340 C176 450 160 560 150 660 M222 336 C234 440 250 550 262 656', INK, 0.9, 0.45);
      else if (frm !== 'shorts') line('M184 360 C182 420 178 470 176 520 M226 360 C230 420 236 470 240 520', INK, 0.9, 0.4);
    }

    /* outerwear */
    if (jc) {
      var jf = fillFor(jak), f = jak.shape || 'cardigan', dk = C.shade(jc, -0.18);
      if (f !== 'vest') { piece(F.sleeveL, jf, { shade: true }); piece(F.sleeveRu, jf, { shade: true }); piece(F.sleeveRf, jf); }
      if (f === 'jacket' || f === 'coat') {
        piece(f === 'coat' ? F.coatL : F.jacketL, jf, { shade: true }); piece(f === 'coat' ? F.coatR : F.jacketR, jf, { shade: true });
        var lin = C.okHex(jak.liningHex);
        if (lin && f === 'jacket') { piece(F.liningL, lin, { w: '1' }); piece(F.liningR, lin, { w: '1' }); }
        piece(F.lapelL, jf, { w: '1.1' }); piece(F.lapelR, jf, { w: '1.1' }); piece(F.cuffL, dk, { w: '1' });
        if (f === 'coat') line('M186 220 L186 220.2 M187 280 L187 280.2 M188 340 L188 340.2 M189 400 L189 400.2', C.shade(jc, -0.4), 5, 1);
      } else if (f === 'bomber') {
        piece(F.bomberL, jf, { shade: true }); piece(F.bomberR, jf, { shade: true });
        piece(F.bombHemL, pat('ribbed', dk), { w: '1' }); piece(F.bombHemR, pat('ribbed', dk), { w: '1' }); piece(F.cuffL, pat('ribbed', dk), { w: '1' });
        piece('M176 140 L188 146 L190 164 L174 160 Z', pat('ribbed', dk), { w: '1' }); piece('M224 140 L212 146 L212 164 L226 160 Z', pat('ribbed', dk), { w: '1' });
        line('M190 160 L192 300 M212 160 L212 302', C.shade(jc, 0.35), 1.4, 0.9);
      } else if (f === 'wrap-cardigan') {
        piece(F.wrapR, jf, { shade: true }); piece(F.wrapL, jf, { shade: true });
        line('M206 298 C200 322 196 338 190 356 M210 300 C220 320 226 336 232 352', jc, 4.5, 1);
        line('M206 298 C200 322 196 338 190 356 M210 300 C220 320 226 336 232 352', INK, 0.8, 0.6);
      } else if (f === 'vest') {
        piece(F.vestL, jf, { shade: true }); piece(F.vestR, jf, { shade: true });
        line('M192 250 L192 250.2 M193 280 L193 280.2 M193 306 L193 306.2', C.shade(jc, 0.45), 4, 1);
      } else {
        piece(F.cardiL, jf, { shade: true }); piece(F.cardiR, jf, { shade: true }); piece(F.cuffL, dk, { w: '1' });
        line('M193 250 L193 250.2 M194 280 L194 280.2 M194 310 L194 310.2 M194 338 L194 338.2', C.shade(jc, 0.45), 4, 1);
      }
      if (f !== 'vest') line('M150 240 C156 260 152 280 150 300 M250 230 C246 260 252 290 256 320', INK, 1, 0.5);
    }

    piece(F.handL, HAND, { w: '1.1' }); piece(F.handR, HAND, { w: '1.1' });

    /* accessories */
    var earrings = false, hat = null;
    accs.forEach(function (a) {
      var c = col(a); if (!c) return;
      var fm = a.shape;
      if (fm === 'arm-warmers') { piece(F.warmL, pat('ribbed', c), { w: '1' }); piece(F.warmR, pat('ribbed', c), { w: '1' }); }
      else if (fm === 'belt') { piece(F.belt, c, { w: '1' }); piece('M200 291 L212 290 L212 302 L200 303 Z', 'none', { w: '1.2' }); line('M200 291 L212 290 L212 302 L200 303 Z', '#C9A15A', 1.8, 1); }
      else if (fm === 'necklace') { line('M184 166 C190 192 210 192 216 166', c, 1.6, 0.95); line('M200 188 L200 188.2', c, 6, 1); }
      else if (fm === 'scarf') {
        var c2 = (a.patternColors || []).map(C.okHex).filter(Boolean);
        piece(F.foulard, fillFor(a), { w: '1.1' });
        piece('M196 166 L184 202 L198 198 Z', c, { w: '1' }); piece('M204 166 L218 199 L204 203 Z', c2[1] || C.shade(c, 0.5), { w: '1' });
        piece('M194 166 C194 160 206 160 206 166 C206 172 194 172 194 166 Z', C.shade(c, -0.12), { w: '1' });
      } else if (fm === 'bag') {
        var bagType = a.type || 'crossbody', bd = C.shade(c, -0.3), bfill = fillFor(a);
        if (bagType === 'backpack') { line('M248 162 C246 200 244 240 246 280', bd, 4, 0.95); }
        else if (bagType === 'tote') {
          line('M286 252 C284 240 290 236 296 240 L300 262 M286 252 L278 262', bd, 3.2, 0.95);
          piece(F.tote, bfill, { shade: true }); piece('M288 261 L304 260 L303 278 Q296 283 289 278 Z', C.shade(c, -0.12), { w: '1' });
        } else {
          line(F.bagStrap, bd, 3.2, 0.95);
          if (bagType === 'half-moon') piece(F.halfmoon, bfill, { shade: true });
          else if (bagType === 'oval') { piece(F.oval, bfill, { shade: true }); }
          else { piece(F.satchel, bfill, { shade: true }); piece(F.satchelFlap, C.shade(c, -0.1), { w: '1' }); if (bagType === 'satchel') { line('M168 362 L168 378 M192 360 L192 376', bd, 5, 1); line('M164 366 L172 366 M188 364 L196 364', '#C2A46A', 2, 1); } }
        }
      } else if (fm === 'earrings') earrings = c;
      else if (fm === 'hat') hat = a;
    });

    /* head */
    piece(F.head, SKIN);
    var deep = C.hsl(SKIN).l < 0.45, browCol = C.shade(hairCol, -0.2);
    line('M179 88 Q186 85 193 88 M207 88 Q214 85 221 88', browCol, 1.5, 0.8);
    if (opts.eyes === 'open') {
      ['186', '214'].forEach(function (cx) {
        var x = Number(cx);
        piece('M' + (x - 7) + ' 98 Q' + x + ' 92.5 ' + (x + 7) + ' 98 Q' + x + ' 102.5 ' + (x - 7) + ' 98 Z', '#FBF5EE', { w: '0.8' });
        root.appendChild(S('circle', { cx: cx, cy: '98', r: '2.8', fill: C.okHex(opts.eyeColor) || '#6B4226' }));
        root.appendChild(S('circle', { cx: cx, cy: '98', r: '1.2', fill: '#1A120C' }));
        root.appendChild(S('circle', { cx: String(x + 0.9), cy: '97.1', r: '0.6', fill: '#FFFFFF' }));
      });
      line('M178.5 97.6 Q186 91.6 193.5 97.6 M206.5 97.6 Q214 91.6 221.5 97.6', '#2A1A10', 1.5, 0.95);
    } else line('M180 97 Q186 101 192 97 M208 97 Q214 101 220 97', '#3A2418', 1.6, 0.9);
    line('M195 117 Q200 120 206 117', deep ? '#6E2E28' : '#A5463A', 2, 0.9);
    root.appendChild(S('ellipse', { cx: '186', cy: '108', rx: '5', ry: '3', fill: deep ? '#A3404A' : '#E59A8A', opacity: deep ? '.35' : '.5' }));
    root.appendChild(S('ellipse', { cx: '216', cy: '108', rx: '5', ry: '3', fill: deep ? '#A3404A' : '#E59A8A', opacity: deep ? '.35' : '.5' }));
    hairDef.front.forEach(function (hd) { piece(hd, 'url(#' + HAIR_ID + ')', { w: '1.1' }); });
    if (hairDef.shine) line(hairDef.shine, C.shade(hairCol, opts.hairStyle === 'braids' ? -0.35 : 0.35), 1.2, 0.7);
    if (hat) { piece(F.beret, fillFor(hat), { shade: true }); line('M203 36 L205 30', C.shade(hat.colorHex, -0.3), 2.4, 1); }
    if (earrings) line('M168 104 C162 104 162 116 168 116 C174 116 174 104 168 104 Z M232 104 C226 104 226 116 232 116 C238 116 238 104 232 104 Z', earrings, 2, 1);
  }

  App.figurino = { draw: draw };
})(window.App = window.App || {});
