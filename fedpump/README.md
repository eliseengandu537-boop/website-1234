# Fedpump website

A responsive company website built from Fedpump's supplied 2026 company profile. Original company photography and branding are embedded locally. The deployable site is in `dist/`; no production build or runtime dependencies are required.

## Local preview

Run `npm run dev` from this folder, then visit http://127.0.0.1:4173.

## Checks

Run `npm run check` for JavaScript syntax validation. Development dependencies support PDF asset extraction and browser checks only.

## Editing

- `dist/index.html`: company content and contact details.
- `dist/styles.css`: visual system, responsive layouts and reduced-motion styles.
- `dist/app.js`: service selector, mobile navigation, galleries and email enquiry builder.
- `dist/assets/`: original logo and photographs extracted from the supplied company profile.

The enquiry form opens the visitor's email application and provides a copy fallback. It does not send or store submissions on a server. Font files are requested from Google Fonts, with system font fallbacks.

Company facts and contact details are based on the supplied profile. No ISO certification is claimed; the profile describes ISO 9001 as in progress. The original PDF, which includes affidavit pages, is not included in the deployed assets.

GitHub Pages deployment is defined in `.github/workflows/deploy-pages.yml`. Before the first deployment, enable Pages in the repository’s **Settings → Pages** and set the build and deployment source to **GitHub Actions**. The workflow publishes the static site from `dist/` on pushes to `main` and can also be started manually from the Actions tab.
