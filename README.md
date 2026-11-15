# 👗 Figurino

*A static web app that turns your inspiration images into a personal style guide, catalogues your wardrobe from photos, and draws your outfits on a watercolour fashion figure.*

---

## 🚀 Overview

Figurino helps you build and wear a personal style with the clothes you already own.

The app covers four complementary tasks:

- **Style analysis** from a moodboard of inspiration images.
- **Wardrobe cataloguing** from photos of each item, with an honest verdict against your style.
- **Outfit building** on an illustrated watercolour figure with customisable skin tone, hair, eyes and body type, plus rule-based feedback and AI-suggested combinations.
- **Gap-based shopping suggestions** that only propose pieces that pair with what you own.

Image understanding is done by **Claude** (Anthropic), called directly from the browser with the **user's own API key**. Everything else (storage, colour rules and the illustration) runs locally in the browser.

There is no backend: the whole app is plain HTML, CSS and JavaScript, so it can be hosted for free on GitHub Pages.

---

## 📁 Repository Structure

```text
figurino/
├── README.md
├── LICENSE
├── .nojekyll
├── index.html          # page layout and edit dialog
├── css/
│   └── style.css       # light and dark themes
└── js/
    ├── color.js        # colour maths and rule-based outfit reading
    ├── figurino.js     # watercolour SVG renderer and shape vocabulary
    ├── store.js        # IndexedDB storage, backup export/import
    ├── ai.js           # Claude API calls and prompts
    ├── demo.js         # example style and wardrobe
    └── app.js          # user interface
```

No build step and no dependencies: the scripts are loaded as classic `<script>` files.

---

## 🧠 Pipeline

```text
Inspiration images                     Photos of your clothes
        │                                       │
        ↓                                       ↓
Claude (vision)                         Claude (vision)
style analysis                          item analysis against the style
        ↓                                       ↓
Style guide                             Wardrobe items
palette · vibes · silhouettes           slot · shape · colour · pattern
formulas · rules                        verdict · potential · pairings
        │                                       │
        └──────────────────┬────────────────────┘
                           ↓
                   Outfit builder
            watercolour SVG figure (local)
            rule-based reading (local)
            outfit ideas (Claude)
                           ↓
                   Shopping list
            gap analysis against the style (Claude)
```

---

## 🎨 Style Analysis

The user uploads 3–15 inspiration images (a Pinterest board, outfit photos, screenshots) and optional notes.

Claude returns a structured style guide:

- a **name** and a short **summary** of the rule that holds the style together;
- **2–4 vibes** (for example *60s mod*, *70s folk*, *woodland fairy*), each with key pieces;
- a **palette** split into base colours, accents and colours to avoid;
- **silhouettes, materials, patterns and accessories**;
- **outfit formulas** per vibe, with concrete examples;
- **practical styling rules**.

The response is requested as strict JSON and validated before it is stored: colours must be valid hex values, vibe ids are renumbered, and unknown fields are discarded.

---

## 👚 Wardrobe Cataloguing

Each photo is downscaled in the browser (longest side 1100 px, JPEG) and sent with the style guide and a compact list of the existing wardrobe.

Claude classifies the item into a fixed vocabulary shared with the renderer:

| Slot | Shapes |
| --- | --- |
| Outerwear | jacket, coat, bomber, cardigan, wrap cardigan, vest |
| Tops | T-shirt, tank, shirt, turtleneck, short-sleeve turtleneck, sweater, polo |
| Bottoms | mini, midi skirt, maxi skirt, shorts, culotte, straight trousers, wide trousers, flares |
| Dresses | short dress, midi dress, maxi dress, pinafore |
| Shoes | ballet flats, Mary Janes, loafer, sneaker, ankle boots, boots, sandal |
| Accessories | bag, scarf, earrings, necklace, belt, hat, arm warmers, tights |

It also returns colour, pattern and pattern colours, texture, sole and lining colours where relevant, the vibes the item fits, concrete pairings with other items, and notes.

Every item gets an honest **verdict**:

| Verdict | Meaning |
| --- | --- |
| **Keep** | fits the style |
| **Keep if…** | works only under certain conditions, which the notes spell out |
| **Let go** | far from the style |

All fields can be edited by hand. Without an API key, items are added with their average photo colour and the edit dialog opens.

---

## 🖌️ The Watercolour Figure

Outfits are drawn as an **SVG fashion illustration** in a relaxed contrapposto pose.

Each garment is a hand-drawn path from a library of silhouettes, filled with the item's colour or a generated pattern (check, stripes, florals, polka dots, cherries, marl, corduroy, rib knit, denim twill). The painterly look comes from SVG filters only:

```text
garment path
     ↓
feTurbulence + feDisplacementMap    → irregular, hand-painted edges
     ↓
noise-modulated alpha               → watercolour pigment texture
     ↓
multiply-blended gradient           → soft shading
     ↓
displaced ink outline               → wobbly pen line
```

The paper texture and the colour wash behind the figure are generated the same way, and the wash takes its colours from the outfit.

### Figure customisation

The figure can be adjusted to look more like its owner (Outfits → *Customise the figure*). Choices are saved with the rest of the data.

| Option | Choices |
| --- | --- |
| Skin tone | 8 tones, from porcelain to deep |
| Hair colour | black, dark brown, brown, auburn, copper, blonde, platinum, grey |
| Hairstyle | bixie, pixie, bob, long and straight, long curls, afro, bun, ponytail, two braids |
| Eyes | closed or open, with 6 eye colours |
| Body type | standard, slim, athletic, pear, hourglass, apple, plus size |

Body types are implemented as a **width profile** rather than separate drawings. Every path coordinate is remapped horizontally around the figure's centre line,

```text
x' = 200 + (x − 200) · k(y)
```

where `k(y)` interpolates between width factors at the shoulders, bust, waist, hips, thighs and calves. Because body and garments share the same coordinate system, every item of clothing follows the chosen body automatically.

---

## 🔍 Outfit Reading

The outfit builder reads each combination with simple, transparent colour rules computed in the browser:

- items far from the user's palette (perceptual "redmean" colour distance);
- more than one black piece;
- three or more cool or green colours together;
- no saturated colour at all;
- tights matching the skirt exactly;
- a warm base with one or two cool accents (positive);
- five or more distinct colours;
- the number of details beyond the base (outerwear, tights, accessories);
- the vibes shared by every item.

These messages are styling heuristics, not absolute rules.

---

## 🛍️ Shopping List

Claude compares the wardrobe with the style guide and proposes 8–12 targeted purchases, each with a priority, suggested colours, a reason and the existing items it pairs with. Cheap, high-impact pieces come first, and second-hand shopping is encouraged.

---

## 🔐 Privacy

- The API key is stored in the browser's `localStorage` and sent only to `api.anthropic.com`.
- Photos go directly from the browser to the Anthropic API, with no intermediate server.
- Wardrobe, photos, outfits and shopping list live in **IndexedDB** on the user's device.
- Settings → *Export backup* saves everything, photos included, to a JSON file that can be imported elsewhere.

Direct browser access uses the `anthropic-dangerous-direct-browser-access` header. This is appropriate here because every user supplies their own key; never ship a shared key in a public site.

---

## 🛠️ Running Locally

Clone the repository and open `index.html` in a browser.

If your browser restricts storage for `file://` pages, serve the folder instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## ▶️ Usage

1. **Settings** → paste an Anthropic API key (create one at [console.anthropic.com](https://console.anthropic.com/)) and choose a model.
2. **My style** → upload inspiration images and run the analysis, or click *Try the example*.
3. **Wardrobe** → add photos of your clothes, one item per photo, laid flat on a plain background in daylight.
4. **Outfits** → dress the figure, read the feedback, save outfits or ask for suggestions.
5. **Shopping list** → ask for suggestions and tick items off as you buy them.

The example data works without an API key, so the whole interface can be explored offline.

---

## 🌐 Deploying to GitHub Pages

1. Push the repository to GitHub (include the `.nojekyll` file).
2. Go to **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Select the `main` branch and the `/ (root)` folder.

The site will be available at `https://<username>.github.io/<repository>/`.

---

## ⚠️ Limitations

- Photos are not background-removed: a plain background gives the best results.
- HEIC photos can only be read by browsers that support the format (Safari); convert them to JPG elsewhere.
- The figure is stylised: it shows shape, colour and pattern, not the exact fabric.
- AI analysis can misjudge colours under warm or dim light; the edit dialog lets you correct them.
- Data is per browser: use backups to move between devices.

---

## 🔄 Possible Extensions

- Automatic background removal for item photos.
- An outfit calendar with wear statistics ("items you never wear").
- More poses and a height option for the figure.
- Installable Progressive Web App with offline support.
- Optional sync across devices.
- Multi-language interface.

---

## 📝 License

The code is available under the **MIT License**.

---

## 📚 References

- Anthropic. *Messages API* and *Vision* documentation — [docs.claude.com](https://docs.claude.com/).
- Willison, S. *Claude's API now supports CORS requests, enabling client-side applications*, 2024.
- MDN Web Docs. *`<feTurbulence>`* and *`<feDisplacementMap>`* SVG filter primitives.
- Fonts: *Fraunces* and *Work Sans*, via Google Fonts.
