/**
 * Builds the responsive backdrop from the full-resolution source photograph.
 *
 * Source (not committed — 3 MB):
 *   assets-src/companion.jpg
 *
 * The site shows the plate as a circle, so the square crop below is framed on
 * the two subjects rather than on the centre of the frame. Adjust CROP if you
 * swap the photo; everything else follows.
 *
 * Run `npm run backdrop` after replacing the source. Output is committed, so
 * the build itself never needs the original.
 */
import { mkdir, readdir, stat, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const SOURCE = path.join(ROOT, 'assets-src', 'companion.jpg');
const OUT = path.join(ROOT, 'public', 'images', 'backdrop');

/** Square crop, as fractions of the upright image. `side` is a fraction of width. */
const CROP = { left: 0.1, top: 0.3, side: 0.84 };

/** Covers 1x through 2x on everything up to a 4K display. Entries larger than
 *  the crop's native size are skipped, so no display class ever upscales. */
const WIDTHS = [480, 720, 1024, 1440, 1920, 2540];

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(
      `Source photo not found at assets-src/companion.jpg.\n` +
        `Put the full-resolution original there, then run this again.`,
    );
    process.exit(1);
  }

  await mkdir(OUT, { recursive: true });
  for (const file of await readdir(OUT)) {
    if (/^companion-\d+\.(avif|webp)$/.test(file)) await unlink(path.join(OUT, file));
  }

  // `rotate()` with no argument applies the EXIF orientation, which phone
  // photos rely on. `metadata()` reports the *stored* size, so orientations 5–8
  // (the quarter turns) need their axes swapped before the crop is computed.
  const meta = await sharp(SOURCE).metadata();
  const quarterTurn = (meta.orientation ?? 1) >= 5;
  const srcW = quarterTurn ? meta.height : meta.width;
  const srcH = quarterTurn ? meta.width : meta.height;

  const side = Math.round(srcW * CROP.side);
  const extract = {
    left: Math.round(srcW * CROP.left),
    top: Math.round(srcH * CROP.top),
    width: side,
    height: side,
  };

  if (extract.left + side > srcW || extract.top + side > srcH) {
    console.error(`CROP falls outside the ${srcW}x${srcH} source. Adjust it and re-run.`);
    process.exit(1);
  }

  console.log(`Source: ${srcW}x${srcH} → square crop ${side}x${side}\n`);

  const cropped = await sharp(SOURCE).rotate().extract(extract).toBuffer();
  const widths = WIDTHS.filter((w) => w <= side);

  let total = 0;
  for (const width of widths) {
    // A small lift in saturation and brightness: the original is a night
    // photograph and sits behind a dark scrim on the page.
    const base = sharp(cropped)
      .resize(width, width, { fit: 'cover', kernel: 'lanczos3' })
      .modulate({ saturation: 1.06, brightness: 1.05 })
      .linear(1.04, -3);

    const avif = path.join(OUT, `companion-${width}.avif`);
    const webp = path.join(OUT, `companion-${width}.webp`);
    await base.clone().avif({ quality: 56, effort: 6, chromaSubsampling: '4:2:0' }).toFile(avif);
    await base.clone().webp({ quality: 78, effort: 6 }).toFile(webp);

    const a = (await stat(avif)).size;
    const w = (await stat(webp)).size;
    total += a;
    console.log(
      `  ${String(width).padStart(4)}px   avif ${kb(a).padStart(8)}   webp ${kb(w).padStart(8)}`,
    );
  }

  console.log(`\nTotal AVIF: ${kb(total)} across ${widths.length} widths (the browser fetches one).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
