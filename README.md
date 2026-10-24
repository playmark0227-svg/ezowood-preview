# Ezowood Hokkaido

A material-led website introducing Hokkaido burl wood and Japanese partner workshops.

## Pages

- Home: purpose, Hokkaido burl, partnership approach, future support projects, then the first object, care, journal and reservation guidance.
- Purpose, our story, materials, partner workshops, gifting, and use & care: four chapters each.
- Journal: six complete illustrated articles.
- Product: gallery, specifications, natural variations, usage scenes and ordering plan.
- Shopping guide: planned conditions and 20 questions with category filters.
- Contact preparation and closed-order pages.

Japanese, English, and Traditional Chinese have independent URLs. Public pages contain their full text before JavaScript runs, with canonical URLs, language alternatives, breadcrumbs and a sitemap. Legacy hash links redirect to their corresponding pages.

## Local preview

Run `node scripts/build-static.cjs --check`, then `node scripts/build-static.cjs` to generate HTML and sitemap. The renderer in `app.js` supplies both static pages and browser interactions. Edit the source template `templates/shell.html` rather than generated HTML.

Serve the parent directory and open `/ezowood-preview/`. For example, run `python3 -m http.server 4178 --bind 127.0.0.1` from the parent folder. Production URL and base path are configured in `site-config.js`.

## Preview scope

Real photographs are awaiting a shoot. `media.js` records each image's file, category and status. Current material and landscape images are labelled references. Product, workshop, writing and packaging visuals use abstract studies labelled as awaiting photography. Set status to `real` only after checking the subject, permission and provenance of the actual photograph.

`releases.js` records a closed reservation state and a future dispatch-month window. Dates and capacity are unknown. SOLD OUT has an explicit prelaunch explanation; it does not represent past sales or a claimed inventory level. Price and final specifications remain unconfirmed. No order, payment, notification signup, reservation, email or personal information is submitted or stored. A commerce backend must be integrated and tested before accepting orders.

English and Traditional Chinese pages are available. Overseas shipping, taxes, payment methods, coverage and rates are preparation items. Taiwan, Europe and North America are intended regions, with no delivery commitment.

Craftsperson support and forest conservation are future concepts. No partner identity, donation recipient, contribution amount, certification or impact is asserted.

## Publication

GitHub Pages serves the main branch at its root. See `docs/seo-launch.md` for search settings and migration to a future custom domain. Keep source answer documents, private records, credentials and QA files outside this public repository.
