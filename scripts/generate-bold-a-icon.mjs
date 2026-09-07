import fs from 'fs';
import zlib from 'zlib';

// Create high-res SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#f3ef3b" />
  <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" fill="#192ec5" font-family="Anton, Impact, Arial Black, sans-serif" font-weight="bold" font-size="360">A</text>
</svg>`;

fs.writeFileSync('public/icon.svg', svgContent);
console.log('Written public/icon.svg');

// Generate 256x256 crisp PNG raster for icon.png
function generateSquareIconPng(outputPath, size = 256) {
  // Rasterize crisp bold "A" on yellow square background
  const bgR = 243, bgG = 239, bgB = 59;   // #f3ef3b Yellow
  const fgR = 25,  fgG = 46,  fgB = 197;  // #192ec5 Blue

  // We can render a bold geometric "A" letter directly onto grid:
  // "A" triangle shape:
  // Left leg, Right leg, Crossbar
  const rawRgba = Buffer.alloc(size * size * 4);

  const cx = size / 2;
  const topY = size * 0.18;
  const botY = size * 0.82;
  const barY = size * 0.56;
  const halfWidthBot = size * 0.32;
  const legThickness = size * 0.13;
  const barThickness = size * 0.09;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      let isBlue = false;

      if (y >= topY && y <= botY) {
        // Linear slope from top center to bottom corners
        const progress = (y - topY) / (botY - topY);
        const currentHalfWidth = progress * halfWidthBot;

        // Distance from center line
        const distFromCenter = Math.abs(x - cx);

        // Legs: between (currentHalfWidth - legThickness/2) and (currentHalfWidth + legThickness/2)
        const outerBound = currentHalfWidth + legThickness / 2;
        const innerBound = currentHalfWidth - legThickness / 2;

        if (distFromCenter <= outerBound && distFromCenter >= Math.max(0, innerBound)) {
          isBlue = true;
        }

        // Horizontal crossbar
        if (y >= barY - barThickness / 2 && y <= barY + barThickness / 2) {
          if (distFromCenter <= currentHalfWidth) {
            isBlue = true;
          }
        }
      }

      if (isBlue) {
        rawRgba[idx] = fgR;
        rawRgba[idx + 1] = fgG;
        rawRgba[idx + 2] = fgB;
        rawRgba[idx + 3] = 255;
      } else {
        rawRgba[idx] = bgR;
        rawRgba[idx + 1] = bgG;
        rawRgba[idx + 2] = bgB;
        rawRgba[idx + 3] = 255;
      }
    }
  }

  // Create PNG file with IDAT
  const outputRaw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const outRowStart = y * (1 + size * 4);
    outputRaw[outRowStart] = 0; // Filter 0 (None)
    for (let x = 0; x < size; x++) {
      const inIdx = (y * size + x) * 4;
      const outIdx = outRowStart + 1 + x * 4;
      outputRaw[outIdx] = rawRgba[inIdx];
      outputRaw[outIdx + 1] = rawRgba[inIdx + 1];
      outputRaw[outIdx + 2] = rawRgba[inIdx + 2];
      outputRaw[outIdx + 3] = rawRgba[inIdx + 3];
    }
  }

  const idatData = zlib.deflateSync(outputRaw);

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let c = (crc ^ buf[i]) & 0xff;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type, data) {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  // PNG Header
  const header = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
  ]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 8 bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const pngBuf = Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, pngBuf);
  console.log('Written', outputPath);
}

generateSquareIconPng('public/icon.png', 256);
generateSquareIconPng('public/apple-icon.png', 256);
