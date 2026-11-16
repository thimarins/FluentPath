// Gera os ícones do app (sem bibliotecas): balão de fala com "F" e ponto de progresso, em degradê azul.
// Saídas em assets/: icon-192.png, icon-512.png (quadrado cheio, "maskable"), favicon-128.png (cantos arredondados),
// fluentpath.ico (16..256 px, para atalho/barra de tarefas do Windows).
const fs = require('fs'), zlib = require('zlib'), path = require('path');
const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = b => { let c = 0xFFFFFFFF; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td)); return Buffer.concat([len, td, cr]); };
function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h); for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
const clamp01 = x => Math.max(0, Math.min(1, x));
const inRR = (u, v, x0, y0, x1, y1, r) => { if (u < x0 || u > x1 || v < y0 || v > y1) return false; const cx = u < x0 + r ? x0 + r : u > x1 - r ? x1 - r : u, cy = v < y0 + r ? y0 + r : v > y1 - r ? y1 - r : v; return Math.hypot(u - cx, v - cy) <= r; };
const inTri = (u, v, a, b, c) => { const s = (p, q, r) => (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1]); const p = [u, v], d1 = s(p, a, b), d2 = s(p, b, c), d3 = s(p, c, a); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
const inRect = (u, v, x0, y0, x1, y1) => u >= x0 && u <= x1 && v >= y0 && v <= y1;
// geometria (0..1)
let BOLD = false; // versão para tamanhos pequenos (<=48 px): balão maior, 'F' mais grosso, sem sombra
const bubble = (u, v, dy = 0) => BOLD ? (inRR(u, v - dy, .08, .12, .92, .70, .16) || inTri(u, v - dy, [.2, .66], [.2, .90], [.46, .66])) : (inRR(u, v - dy, .15, .19, .85, .67, .13) || inTri(u, v - dy, [.25, .63], [.25, .84], [.47, .63]));
const letterF = (u, v) => BOLD ? (inRect(u, v, .27, .21, .43, .61) || inRect(u, v, .27, .21, .73, .34) || inRect(u, v, .27, .39, .65, .50)) : (inRect(u, v, .36, .30, .46, .59) || inRect(u, v, .36, .30, .66, .39) || inRect(u, v, .36, .435, .60, .52));
const dot = (u, v) => BOLD ? Math.hypot(u - .8, v - .2) <= .1 : Math.hypot(u - .8, v - .24) <= .075;
function pixel(u, v, rounded) {
  const inside = rounded ? inRR(u, v, 0, 0, 1, 1, .22) : true; if (!inside) return [0, 0, 0, 0];
  const t = clamp01((u * .7 + v * 1.0) / 1.7); let c = [47 + (106 - 47) * t, 79 + (134 - 79) * t, 208 + (255 - 208) * t];
  const hl = clamp01(1 - Math.hypot(u - .25, v - .12) / .7) * .18; c = c.map(x => x + (255 - x) * hl);              // brilho suave no canto
  if (!BOLD && bubble(u, v, .022)) c = c.map(x => x * .72);                                                                  // sombra do balão
  if (bubble(u, v)) c = [255, 255, 255];
  if (letterF(u, v) && bubble(u, v)) c = [47, 79, 208];
  if (dot(u, v)) c = [255, 122, 69];
  if (Math.hypot(u - .8, v - .24) <= .105 && Math.hypot(u - .8, v - .24) > .075 && bubble(u, v) === false) c = c;   // (sem anel)
  return [c[0], c[1], c[2], 255];
}
function icon(size, rounded) {
  BOLD = size <= 48;
  const S = size <= 64 ? 6 : 3, buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) { const c = pixel((x + (sx + .5) / S) / size, (y + (sy + .5) / S) / size, rounded); r += c[0] * c[3]; g += c[1] * c[3]; b += c[2] * c[3]; a += c[3]; }
    const o = (y * size + x) * 4; if (a > 0) { buf[o] = r / a; buf[o + 1] = g / a; buf[o + 2] = b / a; } buf[o + 3] = a / (S * S);
  }
  return png(size, size, buf);
}
const out = path.join(__dirname, 'assets'); fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'icon-192.png'), icon(192, false)); fs.writeFileSync(path.join(out, 'icon-512.png'), icon(512, false));
fs.writeFileSync(path.join(out, 'favicon-128.png'), icon(128, true));
for (const n of [16, 32, 48, 64, 256]) fs.writeFileSync(path.join(out, 'favicon-' + n + '.png'), icon(n, true));
// .ico com PNGs embutidos (Windows Vista+)
const sizes = [16, 24, 32, 48, 64, 128, 256], imgs = sizes.map(s => icon(s, true));
const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let off = 6 + 16 * sizes.length; const dir = Buffer.alloc(16 * sizes.length);
sizes.forEach((s, i) => { const o = i * 16; dir[o] = s === 256 ? 0 : s; dir[o + 1] = s === 256 ? 0 : s; dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(32, o + 6); dir.writeUInt32LE(imgs[i].length, o + 8); dir.writeUInt32LE(off, o + 12); off += imgs[i].length; });
fs.writeFileSync(path.join(out, 'fluentpath.ico'), Buffer.concat([head, dir, ...imgs]));
console.log('icons ok:', fs.readdirSync(out).join(', '));
