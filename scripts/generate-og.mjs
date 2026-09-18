/**
 * Renders the social preview image and the PNG app icons.
 *
 * Run `npm run og` after changing your name, title or headline. The output is
 * committed to the repo, so the build itself never depends on this script.
 */
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const profilePath = path.join(root, 'src', 'content', 'profile', 'profile.md');

const VOID = '#060907';
const FERN = '#8fe3a2';

/** The paw used by the icons, the favicon and the paw field. */
const PAW = `<ellipse cx="15" cy="21" rx="7.4" ry="6"/><circle cx="7.4" cy="12.4" r="3.1"/>` +
  `<circle cx="12.6" cy="8" r="3.2"/><circle cx="18.4" cy="8" r="3.2"/>` +
  `<circle cx="23.6" cy="12.4" r="3.1"/>`;

/** Minimal frontmatter reader — only the scalar keys this script needs. */
async function readProfile() {
  const raw = await readFile(profilePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`No frontmatter found in ${profilePath}`);

  const lines = match[1].split(/\r?\n/);
  const out = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const scalar = line.match(/^([a-z]+):\s*(.*)$/i);
    if (!scalar) continue;
    const [, key, value] = scalar;
    if (value === '>-' || value === '>' || value === '|') {
      const block = [];
      for (let j = i + 1; j < lines.length && /^\s{2,}\S/.test(lines[j]); j++) {
        block.push(lines[j].trim());
        i = j;
      }
      out[key] = block.join(' ');
    } else if (value) {
      out[key] = value.replace(/^['"]|['"]$/g, '');
    }
  }
  return out;
}

const escape = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Greedy wrap using an approximate advance width for the display face. */
function wrap(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Scattered paw prints, deterministic for a given seed. */
function paws(count, seed, w, h) {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const scale = (0.7 + rand() * 0.8).toFixed(2);
    const rot = (rand() * 60 - 30).toFixed(1);
    const o = (0.05 + rand() * 0.07).toFixed(3);
    out += `<g opacity="${o}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${scale})">${PAW}</g>`;
  }
  return out;
}

function ogSvg(profile) {
  const family = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
  const mono = "'Consolas', 'Courier New', monospace";
  const headline = wrap(profile.headline ?? '', 52).slice(0, 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${VOID}" stop-opacity=".96"/>
      <stop offset="54%" stop-color="${VOID}" stop-opacity=".62"/>
      <stop offset="100%" stop-color="${VOID}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vig" cx="50%" cy="50%">
      <stop offset="45%" stop-color="${VOID}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${VOID}" stop-opacity=".55"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#vig)"/>
  <rect width="880" height="630" fill="url(#fade)"/>

  <g transform="translate(84 172)">
    <text font-family="${mono}" font-size="20" letter-spacing="6" fill="#7f8b7d">KHUSHI235</text>
    <text y="104" font-family="${family}" font-size="92" font-weight="300" letter-spacing="-3" fill="#ffffff">${escape(profile.name ?? '')}</text>
    <text y="160" font-family="${mono}" font-size="22" letter-spacing="5" fill="${FERN}">${escape((profile.role ?? '').toUpperCase())}</text>
    ${headline
      .map(
        (line, i) =>
          `<text y="${232 + i * 40}" font-family="${family}" font-size="29" font-weight="300" fill="#a2aa9f">${escape(line)}</text>`,
      )
      .join('\n    ')}
    <line x1="0" y1="${252 + headline.length * 40}" x2="120" y2="${252 + headline.length * 40}" stroke="${FERN}" stroke-width="2"/>
  </g>
</svg>`;
}

/** The paw field that sits behind the portrait. */
function fieldSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${VOID}"/>
  <g fill="#cfeed9">${paws(34, 987654321, 1200, 630)}</g>
</svg>`;
}

/** Feathers the square portrait into a circle, matching the site's CSS mask. */
function plateMaskSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <radialGradient id="m" cx="50%" cy="50%">
      <stop offset="78%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="90%" stop-color="#fff" stop-opacity=".5"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#m)"/>
</svg>`;
}

/** Prefers the largest built derivative, falls back to the uncropped source. */
async function portraitPath() {
  const candidates = [
    path.join(root, 'public', 'images', 'backdrop', 'companion-2540.webp'),
    path.join(root, 'public', 'images', 'backdrop', 'companion-1920.webp'),
    path.join(root, 'public', 'images', 'backdrop', 'companion-1440.webp'),
  ];
  for (const file of candidates) {
    try {
      await readFile(file);
      return file;
    } catch {
      /* try the next one */
    }
  }
  throw new Error('No backdrop portrait found. Run `npm run backdrop` first.');
}

/** The portrait, resized and feathered exactly like the site's CSS mask. */
async function maskedPortrait(size) {
  const source = await portraitPath();
  return sharp(source)
    .resize(size, size, { fit: 'cover', kernel: 'lanczos3' })
    // The card is viewed small and thumbnailed, so the night photograph needs
    // a little more lift here than it does full-bleed on the page.
    .modulate({ brightness: 1.12 })
    .ensureAlpha()
    .composite([{ input: Buffer.from(plateMaskSvg(size)), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

/** A paw on a green field — legible at 32px in a way a cropped photo is not. */
function iconSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="field" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d1712"/>
      <stop offset="100%" stop-color="${VOID}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="44%" r="62%">
      <stop offset="0%" stop-color="${FERN}" stop-opacity=".30"/>
      <stop offset="100%" stop-color="${FERN}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="pad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c4f5cd"/>
      <stop offset="100%" stop-color="#6fcf8c"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#field)"/>
  <rect width="64" height="64" rx="14" fill="url(#glow)"/>
  <g fill="url(#pad)" transform="translate(32 33.5) scale(1.72) translate(-15.5 -15.9)">${PAW}</g>
</svg>`;
}

async function main() {
  const profile = await readProfile();

  await mkdir(path.join(root, 'public', 'og'), { recursive: true });
  await mkdir(path.join(root, 'public', 'icons'), { recursive: true });

  // Sized to the card height so the portrait is never vertically cropped.
  const PLATE = 600;
  const LEFT = 560;
  const TOP = Math.round((630 - PLATE) / 2);

  await sharp(Buffer.from(fieldSvg()))
    .composite([
      { input: await maskedPortrait(PLATE), left: LEFT, top: TOP },
      { input: Buffer.from(ogSvg(profile)), left: 0, top: 0 },
    ])
    .png()
    .toFile(path.join(root, 'public', 'og', 'og.png'));

  const icons = [
    ['icons/apple-touch-icon.png', 180],
    ['icons/icon-192.png', 192],
    ['icons/icon-512.png', 512],
  ];
  for (const [file, size] of icons) {
    await sharp(Buffer.from(iconSvg(size)))
      .png()
      .toFile(path.join(root, 'public', file));
  }

  console.log(`Generated public/og/og.png and ${icons.length} app icons.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
