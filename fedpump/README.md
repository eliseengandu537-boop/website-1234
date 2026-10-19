# Fedpump website

A responsive company website built from Fedpump's supplied 2026 company profile. Original company photography and branding are embedded locally. The deployable site is in `dist/`; no production build or runtime dependencies are required.

## Local preview

Run `npm run dev` from this folder, then visit http://127.0.0.1:4173.

You can also run `npm run dev` from the parent `website 1234` folder and open http://localhost:4173. Leave the terminal running while previewing; press Ctrl+C to stop it.

## Vercel deployment

Both the repository root and this folder include a `vercel.json`. From the repository root, Vercel publishes `fedpump/dist`; when this folder is selected as the project root, it publishes `dist`. Both configurations use the **Other** framework preset and skip installation and build commands because the site is already static.

To deploy from either folder, run `npx vercel@latest login`, then `npx vercel@latest --prod`. Sign in with the Vercel account that should own the site and select its account/team when prompted.

Alternatively, import the Git repository in Vercel, leave its Root Directory as the repository root, and use the included configuration. If selecting `fedpump` as Root Directory, its own configuration supplies the correct output path. No environment variables are required.

The `.vercelignore` files exclude PDF extraction artifacts, development tools and other local-only material from CLI uploads. The enquiry form still opens an email draft; it does not require a Vercel server function.

## Checks

Run `npm run check` for JavaScript syntax validation. Development dependencies support PDF asset extraction and browser checks only.

## Editing

- `dist/index.html`: company content, contact details and the enquiry assistant.
- `dist/styles.css`: visual system, responsive layouts and reduced-motion styles.
- `dist/app.js`: service selector, mobile navigation, galleries, guided project enquiry assistant, email enquiry builder, scroll parallax, staggered reveals, sticky navigation and page progress.
- `dist/assets/`: original logo and photographs extracted from the supplied company profile, plus the approved looping hero video.

The enquiry form and guided project assistant open the visitor's email application with a prepared draft; the visitor reviews and sends it. The assistant does not use a live AI model, send messages, or store lead details on a server. Manrope and DM Sans are bundled locally, with their font licences, so the site makes no external font requests.

Company facts and contact details are based on the supplied profile. No ISO certification is claimed; the profile describes ISO 9001 as in progress. The original PDF, which includes affidavit pages, is not included in the deployed assets.

For Render web services deployed from the repository root, the root `package.json` starts this static site and the server serves `dist/` on Render's assigned port. GitHub Pages deployment is defined in `.github/workflows/deploy-pages.yml`. Before the first Pages deployment, enable Pages in the repository’s **Settings → Pages** and set the build and deployment source to **GitHub Actions**. The workflow publishes the static site from `dist/` on pushes to `main` and can also be started manually from the Actions tab.
