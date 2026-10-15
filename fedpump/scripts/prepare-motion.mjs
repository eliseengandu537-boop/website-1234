import fs from 'node:fs/promises';

await fs.mkdir('dist/assets/vendor', { recursive: true });
await fs.copyFile('node_modules/lenis/dist/lenis.mjs', 'dist/assets/vendor/lenis.js');
await fs.copyFile('node_modules/lenis/LICENSE', 'dist/assets/vendor/lenis-LICENSE.txt');
console.log('Bundled Lenis locally with its MIT licence.');
