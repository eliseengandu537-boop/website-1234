# website-1234

Fedpump company website. The website files are in `fedpump/dist/`.

Live website: https://fedpump.vercel.app

## View locally

Run `npm run dev` from this folder, then open http://localhost:4173. Keep the terminal running while using the preview.

## Deploy to Vercel

Run `npx vercel@latest login`, then `npx vercel@latest --prod` from this folder. Choose the Vercel account/team that should own the site.

The included `vercel.json` serves `fedpump/dist` as a static website, with no dependency installation or build step. You can also import this repository in the Vercel dashboard with the repository root selected; the same configuration applies. If you select `fedpump` as the Root Directory, its own `vercel.json` uses `dist` instead.

See [the website README](fedpump/README.md) for editing notes and other hosting options.
