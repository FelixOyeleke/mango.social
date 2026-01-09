Immigrant Voices – Maintenance Guide

Overview
- This site is a static, modular HTML build. The home page (index.html) loads HTML partials from components/ via a small loader (js/components.js), then initializes behavior in js/main.js after all components finish loading.
- Keep content in components/*.html; avoid editing index.html except for global head/meta.

Local development
1) Serve locally (any static server works). Examples:
   - Python: python -m http.server 8000
   - Node: npx http-server -p 8000
2) Visit http://localhost:8000/index.html
3) After editing, refresh the browser. The loader re-fetches updated components.

How components load
- js/components.js fetches each component (e.g., components/header.html) and injects it into corresponding placeholders in index.html.
- When all components are loaded, it dispatches a custom event: componentsLoaded.
- index.html listens for componentsLoaded and then loads js/main.js to attach behavior.

Editing components
- Place structure and content in components/*.html
- Keep each card’s link as an <a> wrapper around the entire card for accessibility. Use classes: "group block" on anchors plus a card class (e.g., story-card, voice-card).
- Add descriptive alt text on all <img> and, if the link text is not visible, add aria-label on the <a>.

Images (performance + quality)
- Always provide width and height attributes to prevent layout shift.
- Use loading="lazy" and decoding="async" for non-hero images.
- Only the LCP/hero image should use fetchpriority="high" and be preloaded in <head>.
- Keep images in images/; prefer optimized JPEG/WEBP. Target 1600px wide hero, 400–800px for thumbnails.

Fonts
- Google Fonts are requested with only needed families/weights and display=swap.
- For long-term resilience, consider self-hosting subsetted WOFF2 files and pinning versions.

Links and navigation
- Many demo links currently use href="#". Replace with real destinations when pages exist (e.g., /articles/slug.html or /voices/name.html).
- If you keep in-page anchors, ensure the target ID exists to avoid no-op clicks.
- Keep clickable area obvious: anchors should include the image and title, have :hover styles, and be keyboard focusable.

Accessibility
- Search toggle uses aria-expanded and aria-controls. Keep those updated if IDs change.
- Provide meaningful alt text, focus-visible styles, and avoid relying solely on color for meaning.
- Include a “Skip to main content” link (inserted by js/main.js).

CSS
- Tailwind CDN is used for layout/utility classes.
- css/styles.css includes site-specific polish (typography, hover/focus states, lazy image fades).
- Prefer utility classes first; add CSS only for cross-cutting polish and tokens.

SEO
- index.html includes Open Graph and Twitter meta; update images/hero-main.jpg if the hero changes.
- Consider adding Article/Person schema to story/voice pages once they exist.

Long-term options
- If JavaScript is disabled, component injection won’t run. A future enhancement is a tiny static build step (e.g., Eleventy) to pre-assemble pages at build time.
- CI can run link checks and Lighthouse CI monthly to catch regressions.

Release checklist
- Validate links (no # placeholders for published content)
- LCP image set to preload + fetchpriority
- Images sized and lazy-loaded appropriately
- Headings, alt text, and focus states pass a manual keyboard/a11y check
- Update social/meta preview when hero changes

