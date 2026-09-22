# JaniCrew website

Marketing site for JaniCrew, a locally owned commercial cleaning brand and franchise. Built with [Eleventy](https://www.11ty.dev/) and published to GitHub Pages at <https://robert-laws.github.io/janicrew/>.

## Run it locally

```bash
npm install
npm run dev
```

Open <http://localhost:8080/janicrew/>. The site is served under `/janicrew/` locally too, so what you see matches production.

Other scripts:

| Script | What it does |
|---|---|
| `npm run build` | Build to `_site/` |
| `npm run check` | Build, then verify every internal link and asset resolves and carries the `/janicrew/` prefix |
| `npm run build:root` | Build for a custom domain at the site root (no prefix) |
| `npm run images` | Regenerate logo derivatives, resized photos and the Open Graph image from `../images/` (needs Python 3 + Pillow) |

## Where the words live

You should not need to touch templates to change copy.

| File | Controls |
|---|---|
| `src/_data/site.json` | Tagline, supporting line, phone, email, region, address, hours, the Formspree endpoint, and the `draft` flag |
| `src/_data/janicrew.json` | Services scope (room-by-room task lists), additional services, schedules, trust line, ownership line |
| `src/_data/industries.json` | The eight industry pages: headline, intro, which areas to emphasise, regulations note, photo slot |
| `src/_data/standard.json` | The JaniCrew Standard commitments |
| `src/_data/franchise.json` | Everything on the Own a JaniCrew page |
| `src/_data/nav.json` | Header and footer links |
| `src/_data/images.json` | Named photo slots. Swap a photo by changing one `src` line |

Page-level headlines and intros are in the front matter at the top of each file in `src/`.

## Connect the forms (Formspree)

1. Create a free form at <https://formspree.io/> and copy its endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
2. Paste it into `src/_data/site.json` as `formEndpoint`.
3. Rebuild and deploy.

Until an endpoint is set, both forms show a "draft mode" notice and open the visitor's email app with the details filled in. Both forms send a hidden `form_type` field (`quote` or `franchise`) so you can filter them in Formspree, and a `_gotcha` honeypot for spam.

## Placeholders to replace before launch

Search the built site for the word `PLACEHOLDER`, or set `"draft": false` in `site.json` to hide the yellow markers. Facts still to confirm:

- Contact email (`site.json` → `email`, then set `emailIsPlaceholder` to `false`)
- Region and street address (`site.json` → `region`, `address`)
- Office hours (`site.json` → `hours`)
- Franchise offer details: training, territory, fees (`franchise.json` → `provides[].placeholder`)
- That the 800 number is live

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site, checks links, and publishes `_site/` to GitHub Pages. The repository's Pages source must be set to **GitHub Actions** (Settings → Pages → Build and deployment → Source).

To move to a custom domain later: set `url` in `site.json`, add a `CNAME` file to `src/` with a passthrough copy, and change the build command to `npm run build:root`.

## Structure

```
src/
  _data/          content as JSON (see above)
  _includes/
    layouts/      base.njk (HTML shell), page.njk (hero + prose)
    partials/     header, footer, hero, image-slot, service-grid, industry-grid,
                  quote-steps, standard-strip, cta-band, quote-form, franchise-form
  assets/css/     tokens.css (design tokens), base.css, components.css, utilities.css
  assets/js/      nav.js (mobile menu), forms.js (Formspree / mailto fallback, ?industry= prefill)
  images/         logo derivatives, favicons, og-image.png, photos/
  *.njk           pages; industries/industry.njk generates one page per industry
tools/
  make-images.py  image pipeline
  check-links.mjs link and base-path checker
```

Brand rule baked into `tokens.css`: yellow never carries text on a white background.
