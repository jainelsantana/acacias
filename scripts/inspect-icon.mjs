import fs from 'fs';

const buf = fs.readFileSync('public/images/icon-raw.png');
console.log('PNG magic:', buf.subarray(0, 8).toString('hex'));
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
const bitDepth = buf[24];
const colorType = buf[25];
console.log({ width, height, bitDepth, colorType, size: buf.length });
