import fs from 'node:fs/promises';
import path from 'node:path';
import { createCanvas, ImageData } from '@napi-rs/canvas';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';

const input = process.argv[2];
if (!input) throw new Error('Pass the path to the company profile PDF.');
const output = path.resolve('artifacts/profile');
await fs.mkdir(output, { recursive: true });
const pdf = await getDocument({ data: new Uint8Array(await fs.readFile(input)), useSystemFonts: true }).promise;
const tiles = [];
const originals = [];
let fullText = '';
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const text = (await page.getTextContent()).items.map(item => item.str + (item.hasEOL ? '\n' : ' ')).join('');
  fullText += `\n--- PAGE ${i} ---\n${text}\n`;
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const operators = await page.getOperatorList();
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  const seen = new Set();
  for (let o = 0; o < operators.fnArray.length; o++) {
    if (operators.fnArray[o] !== OPS.paintImageXObject) continue;
    const name = operators.argsArray[o][0];
    if (seen.has(name)) continue;
    seen.add(name);
    const raw = await new Promise(resolve => (name.startsWith('g_') ? page.commonObjs : page.objs).get(name, resolve));
    if (!raw || raw.width < 60 || raw.height < 60) continue;
    const img = createCanvas(raw.width, raw.height), ictx = img.getContext('2d');
    if (raw.bitmap) ictx.drawImage(raw.bitmap, 0, 0);
    else {
      const rgba = new Uint8ClampedArray(raw.width * raw.height * 4);
      for (let p = 0; p < raw.width * raw.height; p++) {
        if (raw.kind === 3) rgba.set(raw.data.subarray(p * 4, p * 4 + 4), p * 4);
        else if (raw.kind === 2) { rgba.set(raw.data.subarray(p * 3, p * 3 + 3), p * 4); rgba[p * 4 + 3] = 255; }
        else { const v = (raw.data[(Math.floor(p / raw.width) * Math.ceil(raw.width / 8)) + Math.floor((p % raw.width) / 8)] >> (7 - (p % raw.width) % 8) & 1) * 255; rgba.set([v, v, v, 255], p * 4); }
      }
      ictx.putImageData(new ImageData(rgba, raw.width, raw.height), 0, 0);
    }
    const file = `asset-${i}-${seen.size}.png`;
    await fs.writeFile(path.join(output, file), img.toBuffer('image/png'));
    originals.push({ canvas: img, label: `${file} (${raw.width}x${raw.height})` });
  }
  await fs.writeFile(path.join(output, `page-${i}.png`), canvas.toBuffer('image/png'));
  tiles.push(canvas);
}
await fs.writeFile(path.join(output, 'profile.txt'), fullText);
const cols = 3, tileW = 330, tileH = 480;
const sheet = createCanvas(cols * tileW, Math.ceil(tiles.length / cols) * tileH);
const ctx = sheet.getContext('2d');
ctx.fillStyle = '#e7e7e7'; ctx.fillRect(0, 0, sheet.width, sheet.height);
tiles.forEach((tile, index) => {
  const x = (index % cols) * tileW, y = Math.floor(index / cols) * tileH;
  const scale = Math.min((tileW - 20) / tile.width, (tileH - 30) / tile.height);
  ctx.drawImage(tile, x + 10, y + 24, tile.width * scale, tile.height * scale);
  ctx.fillStyle = '#222'; ctx.font = '14px sans-serif'; ctx.fillText(`Page ${index + 1}`, x + 10, y + 17);
});
await fs.writeFile(path.join(output, 'contact-sheet.jpg'), sheet.toBuffer('image/jpeg'));
console.log(fullText);
console.log(`Rendered ${pdf.numPages} pages to ${output}`);
const assets = createCanvas(1000, Math.ceil(originals.length / 4) * 220), actx = assets.getContext('2d');
actx.fillStyle = '#ddd'; actx.fillRect(0, 0, assets.width, assets.height);
originals.forEach((img, i) => {
  const x = (i % 4) * 250, y = Math.floor(i / 4) * 220;
  const s = Math.min(230 / img.canvas.width, 185 / img.canvas.height);
  actx.drawImage(img.canvas, x + 10, y + 25, img.canvas.width * s, img.canvas.height * s);
  actx.fillStyle = '#111'; actx.font = '12px sans-serif'; actx.fillText(img.label, x + 5, y + 16);
});
await fs.writeFile(path.join(output, 'assets-sheet.jpg'), assets.toBuffer('image/jpeg'));
console.log(originals.map(x => x.label).join('\n'));
