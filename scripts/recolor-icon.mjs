import fs from 'fs';
import zlib from 'zlib';

function recolorPng(inputPath, outputPath, targetR, targetG, targetB) {
  const buf = fs.readFileSync(inputPath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25];

  if (colorType !== 6) {
    throw new Error('Only RGBA PNGs supported, colorType=' + colorType);
  }

  // Collect IDAT chunks
  let pos = 8;
  const idatBuffers = [];
  const beforeIdat = [];
  const afterIdat = [];
  let foundIdat = false;
  let finishedIdat = false;

  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const chunk = buf.subarray(pos, pos + 12 + length);

    if (type === 'IDAT') {
      foundIdat = true;
      idatBuffers.push(buf.subarray(pos + 8, pos + 8 + length));
    } else {
      if (!foundIdat) {
        beforeIdat.push(chunk);
      } else {
        finishedIdat = true;
        afterIdat.push(chunk);
      }
    }
    pos += 12 + length;
  }

  const combinedIdat = Buffer.concat(idatBuffers);
  const uncompressed = zlib.inflateSync(combinedIdat);

  // Uncompressed data: height rows, each is (1 + width * 4) bytes
  const rowSize = 1 + width * 4;
  const newRaw = Buffer.alloc(uncompressed.length);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    const filter = uncompressed[rowStart];
    newRaw[rowStart] = filter;

    for (let x = 0; x < width; x++) {
      const p = rowStart + 1 + x * 4;
      const r = uncompressed[p];
      const g = uncompressed[p + 1];
      const b = uncompressed[p + 2];
      const a = uncompressed[p + 3];

      if (filter === 0) {
        // Filter 0 (None): r, g, b, a are actual values
        if (a > 10) {
          // Recolor white/light outline pixels to Acácias blue #192ec5
          newRaw[p] = targetR;
          newRaw[p + 1] = targetG;
          newRaw[p + 2] = targetB;
          newRaw[p + 3] = a;
        } else {
          newRaw[p] = r;
          newRaw[p + 1] = g;
          newRaw[p + 2] = b;
          newRaw[p + 3] = a;
        }
      } else {
        // If filter is non-zero, preserve bytes or handle
        newRaw[p] = r;
        newRaw[p + 1] = g;
        newRaw[p + 2] = b;
        newRaw[p + 3] = a;
      }
    }
  }

  // If there are PNG filters, reconstructing raw un-filtered RGBA is safer:
  // Let's decode PNG scanlines properly:
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

      if (filter === 1) { // Sub
        val = (rawByte + left) & 0xff;
      } else if (filter === 2) { // Up
        val = (rawByte + up) & 0xff;
      } else if (filter === 3) { // Average
        val = (rawByte + Math.floor((left + up) / 2)) & 0xff;
      } else if (filter === 4) { // Paeth
        const aVal = left, bVal = up, cVal = i >= bpp ? prevRow[i - bpp] : 0;
        const pVal = aVal + bVal - cVal;
        const pa = Math.abs(pVal - aVal);
        const pb = Math.abs(pVal - bVal);
        const pc = Math.abs(pVal - cVal);
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

  // Now rawRgba contains full un-filtered RGBA bytes!
  // Recolor all visible pixels to target RGB (25, 46, 197)
  const outputRaw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const outRowStart = y * (1 + width * 4);
    outputRaw[outRowStart] = 0; // Filter 0 (None)
    for (let x = 0; x < width; x++) {
      const inIdx = (y * width + x) * 4;
      const outIdx = outRowStart + 1 + x * 4;
      const a = rawRgba[inIdx + 3];

      if (a > 5) {
        // Change RGB to Acácias blue: #192ec5
        outputRaw[outIdx] = targetR;
        outputRaw[outIdx + 1] = targetG;
        outputRaw[outIdx + 2] = targetB;
        outputRaw[outIdx + 3] = a;
      } else {
        outputRaw[outIdx] = 0;
        outputRaw[outIdx + 1] = 0;
        outputRaw[outIdx + 2] = 0;
        outputRaw[outIdx + 3] = 0;
      }
    }
  }

  const newIdatData = zlib.deflateSync(outputRaw);

  // Helper CRC32
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let c = (crc ^ buf[i]) & 0xff;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crc = (crc >>> 8) ^ c;
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type, data) {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const newIdatChunk = makeChunk('IDAT', newIdatData);
  const result = Buffer.concat([...beforeIdat, newIdatChunk, ...afterIdat]);
  fs.writeFileSync(outputPath, result);
  console.log('Recolored PNG written to', outputPath);
}

// Acácias blue: #192ec5 -> R: 25, G: 46, B: 197
recolorPng('public/images/icon-raw.png', 'public/images/icon-blue.png', 25, 46, 197);
