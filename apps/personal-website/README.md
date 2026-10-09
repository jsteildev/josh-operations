# Josh Steil, Personal Website

A single-page personal brand site. Plain HTML, CSS, and JavaScript. No
frameworks, no build step, no npm dependencies. Ready to deploy to Vercel's
free Hobby tier as-is.

## Files

| File          | Purpose                                                        |
|---------------|----------------------------------------------------------------|
| `index.html`  | All page content and structure (single page, anchor sections)  |
| `styles.css`  | All styling: palette, layout, responsive rules                 |
| `script.js`   | Mobile menu, scroll reveal, active nav link, footer year        |
| `images/`     | Drop real photos here (currently empty)                        |

## Design

Vibe: warm and personal. Cream background, warm brown headings and primary
accents, deep blue as the secondary accent (links, nav highlights, the stat
card, writing card kickers), near-black body text. Fraunces serif for display
headings, Inter for body text. Generous whitespace, soft rounded corners.

No em dashes are used anywhere in the site copy, per Josh's preference. Use
commas, periods, or colons instead.

## Editing copy

Open `index.html` in any text editor. Each section is marked with an HTML
comment (`HERO`, `ABOUT / MY STORY`, `BUSINESS`, `LIFE`, `WRITINGS`,
`CONTACT`). The copy is first-person draft copy, written for Josh to edit in
his own voice.

## Swapping photos

1. Drop the real image into the `images/` folder, e.g. `images/portrait.jpg`.
2. Find the placeholder block in `index.html`, which looks like this:

```html
<div class="photo-ph portrait" role="img" aria-label="Placeholder for a portrait photo of Josh">
  <span>Your portrait here</span>
</div>
```

3. Replace it with:

```html
<img class="photo-real portrait" src="images/portrait.jpg" alt="Describe the photo for screen readers">
```

The `.photo-real` class keeps the same sizing and rounded corners. Omit the
`portrait` class for the rectangular Life grid tiles.

## Adding a writing

Copy one of the `<article class="card">` blocks in the Writings section,
update the kicker, title, description, and link. Remove the "Draft" kicker
word once an essay is published.

## Deploying to Vercel (free Hobby tier)

No build step is required. Any of these work:

1. **Drag and drop:** go to vercel.com/new, drag the `personal-website`
   folder onto the page. Done.
2. **Vercel CLI:** `cd personal-website` then `vercel` (first run asks a few
   setup questions).
3. **Git import:** push the folder to a GitHub repo, then import it at
   vercel.com/new. Every push redeploys automatically.

Optional: add a custom domain later under the project's Settings, Domains in
the Vercel dashboard.

## Placeholder checklist (replace before publishing)

- [ ] Hero portrait photo ("Your portrait here")
- [ ] Six Life grid photos: Family, The brothers, Friends, Travel, Austin, The kittens
- [ ] Contact email (`hello@example.com` in the Contact section)
- [ ] Social links: Instagram, LinkedIn, X (currently point to `#`)
- [ ] Company website link in the Business section (currently `#`)
- [ ] Three writing cards (marked DRAFT, links currently `#`)
- [ ] Verify the "$100k+ in settlements in 2026" stat
- [ ] Verify kitten names and timing (Aurelio and Seraphina, October 2026)
- [ ] Review all About copy in Josh's own voice
