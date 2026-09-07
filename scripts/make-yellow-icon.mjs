import fs from 'fs';
import zlib from 'zlib';

function createFaviconWithCustomBg(inputPath, outputPath, symbolR, symbolG, symbolB, bgR, bgG, bgB) {
  const buf = fs.readFileSync(inputPath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);

  let pos = 8;
  const idatBuffers = [];
  const beforeIdat = [];
  const afterIdat = [];
  let foundIdat = false;

  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const chunk = buf.subarray(pos, pos + 12 + length);

    if (type === 'IDAT') {
      foundIdat = true;
      idatBuffers.push(buf.subarray(pos + 8, pos + 8 + length));
    } else {
      if (!foundIdat) beforeIdat.push(chunk);
      else afterIdat.push(chunk);
    }
    pos += 12 + length;
  }

  const combinedIdat = Buffer.concat(idatBuffers);
  const uncompressed = zlib.inflateSync(combinedIdat);

  const rowSize = 1 + width * 4;
  const rawRgba = Buffer.alloc(width * height * 4);
  let prevRow = new Uint8Array(width * 4);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    const filter = uncompressed[rowStart];
    const currRow = new Uint8Array(width * 4);

    for (let i = 0; i < width * 4; i++) {
      const rawByte = uncompressed[rowStart + 1 + i];
      let val = rawByte;
      const bpp = 4;
      const left = i >= bpp ? currRow[i - bpp] : 0;
      const up = prevRow[i];

      if (filter === 1) val = (rawByte + left) & 0xff;
      else if (filter === 2) val = (rawByte + up) & 0xff;
      else if (filter === 3) val = (rawByte + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) {
        const aVal = left, bVal = up, cVal = i >= bpp ? prevRow[i - bpp] : 0;
        const pVal = aVal + bVal - cVal;
        const pa = Math.abs(pVal - aVal), pb = Math.abs(pVal - bVal), pc = Math.abs(pVal - cVal);
        let pr = cVal;
        if (pa <= pb && pa <= pc) pr = aVal;
        else if (pb <= pc) pr = bVal;
        val = (rawByte + pr) & 0xff;
      }
      currRow[i] = val;
    }
    prevRow = currRow;
    currRow.forEach((byte, idx) => {
      rawRgba[y * width * 4 + idx] = byte;
    });
  }

  // Create a square image with padding
  const maxSize = Math.max(width, height) + 40;
  const size = maxSize;
  const offsetX = Math.floor((size - width) / 2);
  const offsetY = Math.floor((size - height) / 2);

  const squareRaw = Buffer.alloc(size * (1 + size * 4));

  for (let y = 0; y < size; y++) {
    const outRowStart = y * (1 + size * 4);
    squareRaw[outRowStart] = 0; // Filter 0

    for (let x = 0; x < size; x++) {
      const outIdx = outRowStart + 1 + x * 4;

      const inX = x - offsetX;
      const inY = y - offsetY;

      let inA = 0;
      if (inX >= 0 && inX < width && inY >= 0 && inY < height) {
        inA = rawRgba[(inY * width + inX) * 4 + 3];
      }

      if (inA > 15) {
        // Blue symbol
        squareRaw[outIdx] = symbolR;
        squareRaw[outIdx + 1] = symbolG;
        squareRaw[outIdx + 2] = symbolB;
        squareRaw[outIdx + 3] = 255;
      } else {
        // Yellow background
        squareRaw[outIdx] = bgR;
        squareRaw[outIdx + 1] = bgG;
        squareRaw[outIdx + 2] = bgB;
        squareRaw[outIdx + 3] = 255;
      }
    }
  }

  // Update IHDR header size
  const newHeader = Buffer.from(beforeIdat[0]);
  newHeader.writeUInt32BE(size, 16);
  newHeader.writeUInt32BE(size, 20);
  beforeIdat[0] = newHeader;

  const newIdatData = zlib.deflateSync(squareRaw);

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

  const newIdatChunk = makeChunk('IDAT', newIdatData);
  const result = Buffer.concat([...beforeIdat, newIdatChunk, ...afterIdat]);
  fs.writeFileSync(outputPath, result);
  console.log('Created icon with blue symbol on yellow bg at', outputPath);
}

// Symbol: Blue #192ec5 -> (25, 46, 197)
// Background: Yellow #f3ef3b -> (243, 239, 59)
createFaviconWithCustomBg(
  'C:/Users/Jainel_TUF/.gemini/antigravity-ide/brain/e5a1b8ca-4798-478a-9680-24d11468a354/.user_uploaded/media_1788667162472.png',
  'public/icon.png',
  25, 46, 197,     // Symbol: Blue
  243, 239, 59     // Background: Yellow
);

createFaviconWithCustomBg(
  'C:/Users/Jainel_TUF/.gemini/antigravity-ide/brain/e5a1b8ca-4798-478a-9680-24d11468a354/.user_uploaded/media_1788667162472.png',
  'public/apple-icon.png',
  25, 46, 197,     // Symbol: Blue
  243, 239, 59     // Background: Yellow
);
