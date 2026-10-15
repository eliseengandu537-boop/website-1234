import fs from 'node:fs/promises';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const assets = {
  'workshop-hero': 'asset-1-1.png',
  'machining': 'asset-10-1.png',
  'pump-refurbishment': 'asset-5-4.png',
  'pump-components': 'asset-5-1.png',
  'pump-assembly': 'asset-5-3.png',
  'workshop-floor': 'asset-6-5.png',
  'workshop-lathe': 'asset-6-7.png',
  'workshop-milling': 'asset-6-2.png',
  'workshop-exterior': 'asset-6-6.png',
  'team': 'asset-7-1.png'
};
await fs.mkdir('dist/assets', { recursive: true });
for (const [name, input] of Object.entries(assets)) {
  const image = await loadImage(`artifacts/profile/${input}`);
  const canvas = createCanvas(image.width, image.height);
  canvas.getContext('2d').drawImage(image, 0, 0);
  await fs.writeFile(`dist/assets/${name}.webp`, await canvas.encode('webp', 88));
}
await fs.copyFile('artifacts/profile/asset-1-2.png', 'dist/assets/fedpump-logo-white.png');
await fs.copyFile('artifacts/profile/asset-10-2.png', 'dist/assets/fedpump-logo.png');
await fs.copyFile('node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2', 'dist/assets/manrope-latin.woff2');
await fs.copyFile('node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2', 'dist/assets/dm-sans-latin.woff2');
await fs.copyFile('node_modules/@fontsource-variable/manrope/LICENSE', 'dist/assets/manrope-LICENSE.txt');
await fs.copyFile('node_modules/@fontsource-variable/dm-sans/LICENSE', 'dist/assets/dm-sans-LICENSE.txt');
console.log('Prepared 12 original company assets.');
