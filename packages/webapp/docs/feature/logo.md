# Evo by Snyk Logo

The app header displays the official **Evo by Snyk** logo (icon + wordmark) from [evo.ai.snyk.io](https://evo.ai.snyk.io).

## Behavior

- **Header** — The logo appears on the left side of the header, before the AI-BOM label and search.
- **Variant** — The **dark-mode** asset is used so the logo remains visible on the app’s dark theme (light/white logo on dark background).

## Implementation

- **Source** — Logo is loaded from Snyk’s Cloudinary CDN (brand UI assets):
  - **Dark mode (current):** `https://res.cloudinary.com/snyk/image/upload/snyk-mktg-brandui/brand-logos/evo-logo-dark-mode.svg`
  - **Light mode:** `https://res.cloudinary.com/snyk/image/upload/snyk-mktg-brandui/brand-logos/evo-logo-light-mode.svg`
- **Usage** — `src/App.tsx`: a single `<img>` with `EVO_LOGO_DARK_URL`, `alt="Evo by Snyk"`, and `className="h-8 w-auto object-contain"` to preserve aspect ratio.
- **Origin** — These URLs are the same assets used in the Evo site header, defined in their CSS as `.snyk-logo.logo-evo-solid` (background-image on a `:before` pseudo-element).
