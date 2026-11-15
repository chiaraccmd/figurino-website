/* Figurino — sample data, so the site can be tried without an API key */
(function (App) {
  'use strict';
  App.DEMO = {
    style: {
      id: 'style', name: 'Warm, colourful vintage',
      summary: 'A colourful 60s–70s vintage with a folk side and a fairy-tale-in-the-woods side. Lots of colour and pattern, kept inside one warm, coherent palette.',
      vibes: [
        { id: 'v1', name: '60s mod', description: 'Clean colour blocks, A-line minis, coloured tights.', pieces: ['A-line mini skirt', 'fitted turtleneck', 'pinafore', 'coloured tights', 'Mary Janes'] },
        { id: 'v2', name: '70s folk', description: 'Earthy colours, corduroy, chunky knits, flares.', pieces: ['flares', 'knitted vest', 'bell sleeves', 'corduroy'] },
        { id: 'v3', name: 'Woodland fairy', description: 'Long skirts, embroidery, a simple main piece and magical details.', pieces: ['maxi skirt', 'puff-sleeve blouse', 'chunky cardigan', 'embroidered bag'] }
      ],
      palette: {
        base: [{ name: 'Rust', hex: '#A6481F' }, { name: 'Burnt orange', hex: '#D9752B' }, { name: 'Mustard', hex: '#D9A62E' }, { name: 'Burgundy', hex: '#7A2632' }, { name: 'Chocolate', hex: '#4A2C1F' }, { name: 'Cream', hex: '#F4EAD5' }],
        accents: [{ name: 'Olive', hex: '#6E7034' }, { name: 'Forest green', hex: '#2F4A35' }, { name: 'Sage', hex: '#9FAE8C' }, { name: 'Petrol', hex: '#1F5F66' }, { name: 'Dusty blue', hex: '#9DB4C7' }, { name: 'Denim', hex: '#3E5F8A' }],
        avoid: ['cool grey', 'neon colours', 'icy pastels']
      },
      silhouettes: ['A-line minis', 'full maxi skirts', 'flares', 'fitted turtlenecks', 'chunky cardigans'],
      materials: ['corduroy', 'wool', 'chunky knit', 'suede', 'leather'],
      patterns: ['checks and tartan', 'multicolour stripes', '70s florals', 'patchwork'],
      accessories: ['coloured tights', 'Mary Janes', 'leather crossbody bags', 'silk scarves', 'gold hoops'],
      formulas: [
        { vibe: 'v1', formula: 'Solid mini + turtleneck + tights in a different colour', example: 'Mustard mini, forest-green turtleneck, burgundy tights' },
        { vibe: 'v2', formula: 'Flares + chunky knit + leather bag', example: 'Sand flares, burgundy sweater, mustard scarf' },
        { vibe: 'v3', formula: 'Simple maxi skirt + cardigan + ribbed socks', example: 'Denim maxi, apricot cardigan, rust socks' }
      ],
      rules: ['Lots of colours, one palette.', 'One cool colour at a time in folk outfits.', 'Tights are always a different colour from the skirt.', 'One large pattern and one small, sharing a colour.'],
      created: '2026-01-01T00:00:00Z'
    },
    items: [
      { id: 'demo-1', name: 'Checked wool jacket', slot: 'outerwear', shape: 'jacket', color: 'brown, cream and sage', colorHex: '#5D5043', pattern: 'check', patternColors: ['#5A3A24', '#E3D3A8', '#A9B8A0', '#2E4A38'], texture: 'wool', material: 'woven wool, mustard lining', liningHex: '#E0A030', verdict: 'keep', potential: 5, vibes: ['v1', 'v2', 'v3'], pairings: ['Open over the green turtleneck, with the corduroy mini and burgundy tights'], pairsWith: ['demo-2', 'demo-4'], notes: 'Checks in four palette colours and a mustard lining that shows when worn open.' },
      { id: 'demo-2', name: 'Forest-green turtleneck', slot: 'top', shape: 'turtleneck', color: 'forest green', colorHex: '#1F4A3B', pattern: 'solid', patternColors: [], texture: 'ribbed', material: 'rib knit', verdict: 'keep', potential: 5, vibes: ['v1', 'v2', 'v3'], pairings: ['With the corduroy mini and mustard tights'], pairsWith: ['demo-4', 'demo-1'], notes: 'A base for all three vibes.' },
      { id: 'demo-3', name: 'Burgundy openwork sweater', slot: 'top', shape: 'sweater', color: 'burgundy marl', colorHex: '#8A2236', pattern: 'melange', patternColors: [], texture: 'knit', material: 'chunky openwork knit', verdict: 'keep', potential: 4, vibes: ['v2', 'v3'], pairings: ['With the sand flares and the mustard scarf'], pairsWith: ['demo-5', 'demo-9'], notes: 'Burgundy is in the palette, and the knit feels handmade.' },
      { id: 'demo-4', name: 'Moss-green corduroy mini', slot: 'bottom', shape: 'mini', color: 'moss green', colorHex: '#4A5232', pattern: 'solid', patternColors: [], texture: 'corduroy', material: 'patchwork corduroy', verdict: 'keep', potential: 5, vibes: ['v1', 'v2', 'v3'], pairings: ['With the burgundy sweater, mustard tights and ballet flats'], pairsWith: ['demo-3', 'demo-7'], notes: 'Corduroy unlocks the whole 60s side.' },
      { id: 'demo-5', name: 'Sand flares', slot: 'bottom', shape: 'flares', color: 'sand', colorHex: '#D8CBA6', pattern: 'solid', patternColors: [], texture: 'smooth', material: 'stretch twill', verdict: 'keep-if', potential: 3, vibes: ['v2'], pairings: ['With the burgundy sweater and gum-sole trainers'], pairsWith: ['demo-3', 'demo-8'], notes: 'The flare is great; the metal zips at the hem feel more 2000s.' },
      { id: 'demo-6', name: 'Apricot wrap cardigan', slot: 'outerwear', shape: 'wrap-cardigan', color: 'apricot', colorHex: '#F2A25C', pattern: 'solid', patternColors: [], texture: 'knit', material: 'fine knit', verdict: 'keep', potential: 4, vibes: ['v3', 'v2'], pairings: ['Over the green turtleneck with a maxi skirt'], pairsWith: ['demo-2'], notes: 'The waist ties make it very fairy-like.' },
      { id: 'demo-7', name: 'Olive bow ballet flats', slot: 'shoes', shape: 'ballet-flat', color: 'olive', colorHex: '#615C2E', soleHex: '#1E1E1E', pattern: 'solid', patternColors: [], texture: 'leather', material: 'leather', verdict: 'keep', potential: 5, vibes: ['v1', 'v3'], pairings: ['With burgundy tights and the mini'], pairsWith: ['demo-4'], notes: 'Perfect with coloured tights.' },
      { id: 'demo-8', name: 'Retro gum-sole trainers', slot: 'shoes', shape: 'sneaker', color: 'cream', colorHex: '#EFE6D2', soleHex: '#C98A4B', detailHex: '#1E2433', pattern: 'solid', patternColors: [], texture: 'leather', material: 'leather and suede', verdict: 'keep', potential: 4, vibes: ['v2'], pairings: ['With the sand flares and coloured socks'], pairsWith: ['demo-5'], notes: 'The 70s tennis shoe.' },
      { id: 'demo-9', name: 'Mustard chain-print scarf', slot: 'accessory', shape: 'scarf', color: 'mustard and cream', colorHex: '#E3B23C', pattern: 'solid', patternColors: ['#E3B23C', '#F4EAD5'], texture: 'silk', material: 'silk', verdict: 'keep', potential: 5, vibes: ['v1', 'v2', 'v3'], pairings: ['Round the neck with the burgundy sweater', 'As a headband'], pairsWith: ['demo-3'], notes: '70s print, every colour from the palette.' },
      { id: 'demo-10', name: 'Red leather satchel', slot: 'accessory', shape: 'bag', type: 'satchel', color: 'cherry red', colorHex: '#A01E22', pattern: 'solid', patternColors: [], texture: 'leather', material: 'leather', verdict: 'keep', potential: 5, vibes: ['v1', 'v2', 'v3'], pairings: ['With the green mini and the burgundy sweater'], pairsWith: ['demo-4'], notes: 'A schoolgirl satchel in real leather.' },
      { id: 'demo-11', name: 'Gold hoop earrings', slot: 'accessory', shape: 'earrings', color: 'gold', colorHex: '#C9A15A', pattern: 'solid', patternColors: [], texture: 'smooth', material: 'gold-tone metal', verdict: 'keep', potential: 5, vibes: ['v1', 'v2', 'v3'], pairings: ['With everything'], pairsWith: [], notes: 'The base of every outfit.' },
      { id: 'demo-12', name: 'Black cherry-print polo', slot: 'top', shape: 'polo', color: 'black with cherries', colorHex: '#1E1B1C', pattern: 'cherries', patternColors: [], texture: 'smooth', material: 'cotton piqué', verdict: 'keep-if', potential: 3, vibes: ['v1'], pairings: ['Tucked into the mini, burgundy tights'], pairsWith: ['demo-4'], notes: 'A playful retro motif, but black is far from the palette: pair it with red and mustard.' }
    ],
    outfits: [
      { id: 'demo-o1', name: 'Checked jacket', outerwear: 'demo-1', top: 'demo-2', bottom: 'demo-4', dress: null, shoes: 'demo-7', accessories: ['demo-10', 'demo-11'], tights: '#7A2632', why: 'The green skirt and turtleneck pick up the checks; burgundy tights warm everything up.' },
      { id: 'demo-o2', name: 'Burgundy folk', outerwear: null, top: 'demo-3', bottom: 'demo-5', dress: null, shoes: 'demo-8', accessories: ['demo-9', 'demo-11'], tights: null, why: 'All warm, with the mustard scarf close to the face.' }
    ],
    shopping: [
      { id: 'demo-s1', name: 'Opaque coloured tights (mustard, burgundy, rust)', priority: 'high', colors: ['#D9A62E', '#7A2632', '#A6481F'], why: 'Cheap, and they change every outfit.', pairsWith: ['demo-4', 'demo-7'], done: false },
      { id: 'demo-s2', name: 'Brown leather Mary Janes', priority: 'high', colors: ['#5A3523'], why: 'They go with almost every outfit in this style.', pairsWith: ['demo-4', 'demo-3'], done: false },
      { id: 'demo-s3', name: 'Cream blouse with a collar', priority: 'medium', colors: ['#F4EAD5'], why: 'The key piece for layering.', pairsWith: ['demo-3', 'demo-6'], done: false }
    ]
  };
})(window.App = window.App || {});
