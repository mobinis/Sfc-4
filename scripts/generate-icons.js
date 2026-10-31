import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const svgPath = path.resolve(rootDir, 'public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Generating PWA Icons from SVG...');
  
  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve(rootDir, 'public/pwa-192x192.png'));
  console.log('Generated public/pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve(rootDir, 'public/pwa-512x512.png'));
  console.log('Generated public/pwa-512x512.png');

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve(rootDir, 'public/apple-touch-icon.png'));
  console.log('Generated public/apple-touch-icon.png');

  // Maskable 512x512 with 15% safe-zone margin (inner icon 384x384 placed on solid #1E241B background)
  const innerIcon = await sharp(svgBuffer)
    .resize(384, 384)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0x1E, g: 0x24, b: 0x1B, alpha: 1.0 }
    }
  })
    .composite([{ input: innerIcon, top: 64, left: 64 }])
    .png()
    .toFile(path.resolve(rootDir, 'public/pwa-maskable-512x512.png'));
  console.log('Generated public/pwa-maskable-512x512.png');

  // Favicon 64x64
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.resolve(rootDir, 'public/favicon.png'));
  console.log('Generated public/favicon.png');
}

generate().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
