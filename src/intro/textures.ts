import { TRACED } from './iconPaths';
/* Procedural canvas textures for the 3D intro: cultural icon tiles,
   a gold mandala, and a soft particle sprite. No external images needed. */

const GOLD_STOPS: [number, string][] = [
  [0, '#fff1c7'],
  [0.45, '#e3c88a'],
  [1, '#a8823e'],
];

function goldGradient(ctx: CanvasRenderingContext2D, s: number) {
  const g = ctx.createLinearGradient(0, 0, s, s);
  GOLD_STOPS.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

type IconDraw = (ctx: CanvasRenderingContext2D) => void;

/* Each icon is drawn in a 100×100 box centred at (50,50). */
function tracedIcon(c: CanvasRenderingContext2D, name: string) {
  const t = TRACED[name];
  const k = 96 / Math.max(t.w, t.h);
  c.save();
  c.translate(50 - (t.w * k) / 2, 50 - (t.h * k) / 2);
  c.scale(k, k);
  c.fill(new Path2D(t.d), 'evenodd');
  c.restore();
}

const ICONS: Record<string, IconDraw> = {


  dslr: (c) => {
    c.beginPath();
    c.moveTo(14, 30);
    c.lineTo(36, 30);
    c.lineTo(42, 18);
    c.lineTo(62, 18);
    c.lineTo(68, 30);
    c.lineTo(86, 30);
    c.quadraticCurveTo(94, 30, 94, 38);
    c.lineTo(94, 80);
    c.quadraticCurveTo(94, 88, 86, 88);
    c.lineTo(14, 88);
    c.quadraticCurveTo(6, 88, 6, 80);
    c.lineTo(6, 38);
    c.quadraticCurveTo(6, 30, 14, 30);
    c.closePath();
    c.fill();
    c.fillRect(14, 22, 12, 6); // shutter button
    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    c.arc(52, 58, 22, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(82, 40, 4, 0, Math.PI * 2);
    c.fill();
    c.globalCompositeOperation = 'source-over';
    c.beginPath();
    c.arc(52, 58, 15, 0, Math.PI * 2);
    c.fill();
    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    c.arc(47, 53, 4, 0, Math.PI * 2);
    c.fill();
    c.globalCompositeOperation = 'source-over';
  },
  craft: (c) => {
    // clay pot (matka)
    c.beginPath();
    c.moveTo(32, 14);
    c.lineTo(68, 14);
    c.quadraticCurveTo(72, 14, 72, 19);
    c.quadraticCurveTo(72, 24, 66, 25);
    c.lineTo(63, 31);
    c.bezierCurveTo(96, 40, 98, 84, 66, 94);
    c.lineTo(34, 94);
    c.bezierCurveTo(2, 84, 4, 40, 37, 31);
    c.lineTo(34, 25);
    c.quadraticCurveTo(28, 24, 28, 19);
    c.quadraticCurveTo(28, 14, 32, 14);
    c.closePath();
    c.fill();
    c.globalCompositeOperation = 'destination-out';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(36, 27);
    c.lineTo(64, 27);
    c.stroke();
    c.globalCompositeOperation = 'source-over';
  },
  dancer: (c) => tracedIcon(c, 'dance'),
  heel: (c) => tracedIcon(c, 'fashion'),
  dress: (c) => {
    // hanger hook + dress silhouette
    c.lineWidth = 4;
    c.beginPath();
    c.arc(50, 12, 5, Math.PI, Math.PI * 2.4);
    c.stroke();
    c.beginPath();
    c.moveTo(40, 20);
    c.lineTo(60, 20);
    c.lineTo(64, 42);
    c.quadraticCurveTo(58, 46, 60, 50);
    c.lineTo(84, 90);
    c.lineTo(16, 90);
    c.lineTo(40, 50);
    c.quadraticCurveTo(42, 46, 36, 42);
    c.closePath();
    c.fill();
  },
  camera: (c) => {
    c.beginPath();
    c.moveTo(34, 28);
    c.lineTo(40, 18);
    c.lineTo(60, 18);
    c.lineTo(66, 28);
    c.lineTo(84, 28);
    c.quadraticCurveTo(92, 28, 92, 36);
    c.lineTo(92, 76);
    c.quadraticCurveTo(92, 84, 84, 84);
    c.lineTo(16, 84);
    c.quadraticCurveTo(8, 84, 8, 76);
    c.lineTo(8, 36);
    c.quadraticCurveTo(8, 28, 16, 28);
    c.closePath();
    c.fill();
    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    c.arc(50, 56, 20, 0, Math.PI * 2);
    c.fill();
    c.globalCompositeOperation = 'source-over';
    c.beginPath();
    c.arc(50, 56, 13, 0, Math.PI * 2);
    c.fill();
  },
  book: (c) => {
    c.beginPath();
    c.moveTo(50, 28);
    c.quadraticCurveTo(30, 16, 8, 22);
    c.lineTo(8, 80);
    c.quadraticCurveTo(30, 74, 48, 86);
    c.closePath();
    c.moveTo(52, 86);
    c.quadraticCurveTo(70, 74, 92, 80);
    c.lineTo(92, 22);
    c.quadraticCurveTo(70, 16, 50, 28);
    c.closePath();
    c.fill();
  },
  pot: (c) => {
    c.beginPath();
    c.moveTo(36, 14);
    c.lineTo(64, 14);
    c.lineTo(60, 26);
    c.bezierCurveTo(96, 36, 94, 84, 66, 90);
    c.lineTo(34, 90);
    c.bezierCurveTo(6, 84, 4, 36, 40, 26);
    c.closePath();
    c.fill();
    c.globalCompositeOperation = 'destination-out';
    c.lineWidth = 3.5;
    [48, 60, 72].forEach((y) => {
      c.beginPath();
      c.moveTo(22, y);
      for (let x = 22; x <= 78; x += 7) c.lineTo(x, y + ((x / 7) % 2 ? -4 : 4));
      c.stroke();
    });
    c.globalCompositeOperation = 'source-over';
  },
  mountain: (c) => {
    c.beginPath();
    c.moveTo(4, 88);
    c.lineTo(38, 26);
    c.lineTo(54, 54);
    c.lineTo(66, 38);
    c.lineTo(96, 88);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(38, 12);
    c.lineTo(38, 26);
    c.stroke();
    c.beginPath();
    c.moveTo(38, 10);
    c.lineTo(52, 15);
    c.lineTo(38, 20);
    c.closePath();
    c.fill();
  },
  music: (c) => {
    c.beginPath();
    c.ellipse(30, 72, 11, 8, -0.4, 0, Math.PI * 2);
    c.ellipse(66, 64, 11, 8, -0.4, 0, Math.PI * 2);
    c.fill();
    c.fillRect(38, 22, 6, 50);
    c.fillRect(74, 14, 6, 50);
    c.beginPath();
    c.moveTo(38, 22);
    c.lineTo(80, 12);
    c.lineTo(80, 24);
    c.lineTo(38, 34);
    c.closePath();
    c.fill();
  },
  mask: (c) => {
    c.beginPath();
    c.moveTo(18, 22);
    c.quadraticCurveTo(50, 12, 82, 22);
    c.quadraticCurveTo(86, 70, 50, 88);
    c.quadraticCurveTo(14, 70, 18, 22);
    c.fill();
    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    c.ellipse(36, 42, 8, 5, 0.25, 0, Math.PI * 2);
    c.ellipse(64, 42, 8, 5, -0.25, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 5;
    c.beginPath();
    c.arc(50, 56, 16, 0.15 * Math.PI, 0.85 * Math.PI);
    c.stroke();
    c.globalCompositeOperation = 'source-over';
  },
  diya: (c) => {
    c.beginPath();
    c.moveTo(14, 58);
    c.quadraticCurveTo(50, 98, 86, 58);
    c.quadraticCurveTo(50, 70, 14, 58);
    c.fill();
    c.beginPath();
    c.moveTo(50, 14);
    c.bezierCurveTo(66, 34, 62, 54, 50, 56);
    c.bezierCurveTo(38, 54, 34, 34, 50, 14);
    c.fill();
  },
  palette: (c) => {
    c.beginPath();
    c.moveTo(50, 14);
    c.bezierCurveTo(86, 14, 92, 52, 76, 62);
    c.bezierCurveTo(66, 68, 70, 86, 50, 86);
    c.bezierCurveTo(22, 86, 10, 64, 12, 46);
    c.bezierCurveTo(14, 26, 30, 14, 50, 14);
    c.fill();
    c.globalCompositeOperation = 'destination-out';
    [
      [34, 34],
      [52, 28],
      [68, 38],
      [28, 54],
      [46, 68],
    ].forEach(([x, y]) => {
      c.beginPath();
      c.arc(x, y, 6, 0, Math.PI * 2);
      c.fill();
    });
    c.globalCompositeOperation = 'source-over';
  },
  reel: (c) => {
    c.beginPath();
    c.arc(50, 50, 36, 0, Math.PI * 2);
    c.fill();
    c.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      c.beginPath();
      c.arc(50 + Math.cos(a) * 21, 50 + Math.sin(a) * 21, 8, 0, Math.PI * 2);
      c.fill();
    }
    c.beginPath();
    c.arc(50, 50, 5, 0, Math.PI * 2);
    c.fill();
    c.globalCompositeOperation = 'source-over';
  },
  mic: (c) => {
    roundRect(c, 37, 12, 26, 46, 13);
    c.fill();
    c.lineWidth = 6;
    c.beginPath();
    c.arc(50, 44, 22, 0.05 * Math.PI, 0.95 * Math.PI);
    c.stroke();
    c.fillRect(47, 66, 6, 14);
    roundRect(c, 32, 80, 36, 7, 3);
    c.fill();
  },
  drum: (c) => {
    c.beginPath();
    c.moveTo(12, 34);
    c.quadraticCurveTo(50, 20, 88, 34);
    c.lineTo(88, 66);
    c.quadraticCurveTo(50, 80, 12, 66);
    c.closePath();
    c.fill();
    c.globalCompositeOperation = 'destination-out';
    c.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      const x = 22 + i * 14;
      c.beginPath();
      c.moveTo(x, 34);
      c.lineTo(x + 7, 66);
      c.moveTo(x + 7, 34);
      c.lineTo(x, 66);
      c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
  },
  gamepad: (c) => {
    // controller body with two grips
    c.beginPath();
    c.moveTo(28, 32);
    c.lineTo(72, 32);
    c.bezierCurveTo(88, 32, 94, 50, 92, 66);
    c.bezierCurveTo(90, 80, 78, 82, 70, 72);
    c.lineTo(64, 64);
    c.lineTo(36, 64);
    c.lineTo(30, 72);
    c.bezierCurveTo(22, 82, 10, 80, 8, 66);
    c.bezierCurveTo(6, 50, 12, 32, 28, 32);
    c.closePath();
    c.fill();
    c.globalCompositeOperation = 'destination-out';
    // d-pad
    c.fillRect(22, 45, 16, 5);
    c.fillRect(27.5, 39.5, 5, 16);
    // buttons
    [
      [70, 42],
      [78, 49],
      [62, 49],
      [70, 56],
    ].forEach(([x, y]) => {
      c.beginPath();
      c.arc(x, y, 3.6, 0, Math.PI * 2);
      c.fill();
    });
    c.globalCompositeOperation = 'source-over';
  },
  lotus: (c) => {
    const petal = (rot: number, len: number, w: number) => {
      c.save();
      c.translate(50, 72);
      c.rotate(rot);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(w, -len * 0.55, 0, -len);
      c.quadraticCurveTo(-w, -len * 0.55, 0, 0);
      c.fill();
      c.restore();
    };
    petal(0, 56, 16);
    petal(-0.62, 48, 14);
    petal(0.62, 48, 14);
    petal(-1.2, 38, 11);
    petal(1.2, 38, 11);
    c.fillRect(20, 76, 60, 5);
  },
};

export const ICON_NAMES = ['music', 'gamepad', ...Object.keys(ICONS).filter((k) => k !== 'music' && k !== 'gamepad')];

/** Emerald tile face with a gold double border and a gold icon. */
export function makeTileCanvas(name: string, size = 512) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d')!;
  const bg = c.createRadialGradient(size * 0.35, size * 0.25, size * 0.05, size / 2, size / 2, size * 0.75);
  bg.addColorStop(0, '#1f7a5a');
  bg.addColorStop(0.6, '#0d4634');
  bg.addColorStop(1, '#062419');
  c.fillStyle = bg;
  c.fillRect(0, 0, size, size);

  c.strokeStyle = goldGradient(c, size);
  c.lineWidth = size * 0.018;
  roundRect(c, size * 0.07, size * 0.07, size * 0.86, size * 0.86, size * 0.12);
  c.stroke();
  c.lineWidth = size * 0.006;
  c.setLineDash([size * 0.012, size * 0.018]);
  roundRect(c, size * 0.11, size * 0.11, size * 0.78, size * 0.78, size * 0.09);
  c.stroke();
  c.setLineDash([]);

  // icon on its own layer so destination-out cuts only the icon
  const ic = document.createElement('canvas');
  ic.width = ic.height = size;
  const x = ic.getContext('2d')!;
  x.translate(size * 0.22, size * 0.22);
  x.scale((size * 0.56) / 100, (size * 0.56) / 100);
  x.fillStyle = goldGradient(x, 100);
  x.strokeStyle = x.fillStyle;
  x.lineCap = 'round';
  ICONS[name](x);

  c.shadowColor = 'rgba(255, 214, 140, 0.85)';
  c.shadowBlur = size * 0.05;
  c.drawImage(ic, 0, 0);
  c.shadowBlur = 0;
  return cv;
}

/** Transparent gold mandala used as a halo behind the emblem. */
export function makeMandalaCanvas(size = 1024, glow = false) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d')!;
  if (glow) {
    // soft gold glow around every line
    // warm gold glow (drawn with normal blending, so it stays gold, not white)
    c.shadowColor = 'rgba(232, 170, 60, 1)';
    c.shadowBlur = size * 0.014;
  }
  c.translate(size / 2, size / 2);
  c.strokeStyle = glow ? 'rgba(236, 196, 110, 1)' : 'rgba(227, 200, 138, 0.9)';
  c.fillStyle = glow ? 'rgba(236, 196, 110, 1)' : 'rgba(227, 200, 138, 0.9)';
  const R = size * 0.48;

  const ring = (r: number, w: number, dash?: number[]) => {
    c.lineWidth = w;
    c.setLineDash(dash ?? []);
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI * 2);
    c.stroke();
  };
  ring(R, 2);
  ring(R * 0.96, 1, [4, 10]);
  ring(R * 0.7, 1.5);
  ring(R * 0.66, 1, [2, 6]);
  c.setLineDash([]);

  // outer petals
  for (let i = 0; i < 32; i++) {
    c.save();
    c.rotate((i / 32) * Math.PI * 2);
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(0, -R * 0.72);
    c.quadraticCurveTo(R * 0.07, -R * 0.83, 0, -R * 0.94);
    c.quadraticCurveTo(-R * 0.07, -R * 0.83, 0, -R * 0.72);
    c.stroke();
    c.beginPath();
    c.arc(0, -R * 0.985, 3, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  // inner ring: closed petals, small petals between them, dots and a neat inner circle
  const petal = (r0: number, r1: number, wdt: number) => {
    const mid = (r0 + r1) / 2;
    c.beginPath();
    c.moveTo(0, -r0);
    c.quadraticCurveTo(wdt, -mid, 0, -r1);
    c.quadraticCurveTo(-wdt, -mid, 0, -r0);
    c.stroke();
  };
  for (let i = 0; i < 16; i++) {
    c.save();
    c.rotate((i / 16) * Math.PI * 2);
    c.lineWidth = 1.5;
    petal(R * 0.42, R * 0.64, R * 0.11);
    c.lineWidth = 1;
    petal(R * 0.46, R * 0.59, R * 0.05);
    c.rotate(Math.PI / 16);
    petal(R * 0.47, R * 0.61, R * 0.05);
    c.beginPath();
    c.arc(0, -R * 0.635, 2.5, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  ring(R * 0.4, 1.5);
  ring(R * 0.37, 1, [2, 6]);
  c.setLineDash([]);
  return cv;
}

/** Backdrop for the SURABHI logo: a soft gold glow ring (clear centre) with fine rays outside it. */
export function makeLogoAuraCanvas(size = 1024) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d')!;
  const m = size / 2;
  const R = size / 2;
  // glow ring: clear in the middle so the gap between the paisleys stays green
  const g = c.createRadialGradient(m, m, 0, m, m, R);
  // centre: soft lighter emerald (not an empty dark hole, and not olive)
  const ce = c.createRadialGradient(m, m, 0, m, m, R * 0.5);
  ce.addColorStop(0, 'rgba(70, 170, 125, 0.42)');
  ce.addColorStop(0.7, 'rgba(70, 170, 125, 0.22)');
  ce.addColorStop(1, 'rgba(70, 170, 125, 0)');
  c.fillStyle = ce;
  c.fillRect(0, 0, size, size);
  // gold ring that blends smoothly into the centre (no hard edge)
  g.addColorStop(0, 'rgba(236, 180, 80, 0)');
  g.addColorStop(0.36, 'rgba(236, 180, 80, 0.06)');
  g.addColorStop(0.5, 'rgba(236, 180, 80, 0.3)');
  g.addColorStop(0.72, 'rgba(236, 180, 80, 0.12)');
  g.addColorStop(1, 'rgba(236, 180, 80, 0)');
  c.fillStyle = g;
  c.fillRect(0, 0, size, size);
  // fine rays, starting just outside the logo and fading out
  const rg = c.createRadialGradient(m, m, R * 0.42, m, m, R);
  rg.addColorStop(0, 'rgba(236, 196, 110, 0.55)');
  rg.addColorStop(0.5, 'rgba(236, 196, 110, 0.3)');
  rg.addColorStop(1, 'rgba(236, 196, 110, 0)');
  c.strokeStyle = rg;
  c.lineWidth = size * 0.0018;
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    c.beginPath();
    c.moveTo(m + Math.cos(a) * R * 0.42, m + Math.sin(a) * R * 0.42);
    c.lineTo(m + Math.cos(a) * R, m + Math.sin(a) * R);
    c.stroke();
  }
  return cv;
}

/** Soft round glow sprite for particles. */
export function makeSpriteCanvas(size = 64) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d')!;
  const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,245,210,1)');
  g.addColorStop(0.3, 'rgba(240,205,130,0.8)');
  g.addColorStop(1, 'rgba(240,205,130,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, size, size);
  return cv;
}

/** Tall emerald card: gold frame, big glowing icon, label underneath. */
export function drawCardCanvas(
  cv: HTMLCanvasElement,
  logo: HTMLImageElement | null,
  shape: 'rect' | 'circle',
  label: string,
  tint = '#1d7a58',
  plate?: string,
  fill = false,
  backdrop = false,
  plateRim?: string,
  zoom?: number,
) {
  const W = 512;
  const H = 768;
  cv.width = W;
  cv.height = H;
  const c = cv.getContext('2d')!;
  const bg = c.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, tint);
  bg.addColorStop(0.6, tint);
  bg.addColorStop(1, '#0a0806');
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);
  // subtle dot grid
  c.fillStyle = 'rgba(255,255,255,0.08)';
  for (let y = 40; y < H; y += 28) for (let x = 40; x < W; x += 28) c.fillRect(x, y, 2.5, 2.5);
  const shade = c.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, 'rgba(255,255,255,0.18)');
  shade.addColorStop(0.5, 'rgba(255,255,255,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.35)');
  const bg2 = shade;
  c.fillStyle = bg2;
  c.fillRect(0, 0, W, H);
  // soft light pool behind the icon
  const pool = c.createRadialGradient(W / 2, H * 0.4, 10, W / 2, H * 0.4, W * 0.55);
  pool.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
  pool.addColorStop(1, 'rgba(255, 220, 150, 0)');
  c.fillStyle = pool;
  c.fillRect(0, 0, W, H);

  c.strokeStyle = goldGradient(c, W);
  c.lineWidth = 10;
  roundRect(c, 26, 26, W - 52, H - 52, 46);
  c.stroke();
  c.lineWidth = 3;
  c.setLineDash([6, 9]);
  roundRect(c, 50, 50, W - 100, H - 100, 30);
  c.stroke();
  c.setLineDash([]);
  // little corner diamonds
  c.fillStyle = goldGradient(c, W);
  [[W / 2, 26], [W / 2, H - 26]].forEach(([x, y]) => {
    c.beginPath();
    c.moveTo(x, y - 14);
    c.lineTo(x + 14, y);
    c.lineTo(x, y + 14);
    c.lineTo(x - 14, y);
    c.closePath();
    c.fill();
  });

  // the event's logo, framed: a gold circle or a gold rectangle
  const cx = W / 2;
  const cy = H * 0.4;
  const gold = goldGradient(c, W);
  if (shape === 'circle') {
    const r = W * 0.31;
    c.save();
    c.shadowColor = 'rgba(0,0,0,0.4)';
    c.shadowBlur = 14;
    c.shadowOffsetY = 5;
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    if (plate && plateRim) {
      // plate shaded from the logo's own background colour at the centre to its edge colour at the rim
      const pg = c.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
      pg.addColorStop(0, plate);
      pg.addColorStop(1, plateRim);
      c.fillStyle = pg;
    } else {
      c.fillStyle = plate ?? '#120d08';
    }
    c.fill();
    c.restore();
    if (logo) {
      c.save();
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.clip();
      // a round logo fills the circle; any other logo sits inside it with breathing room
      // (wide wordmarks get more width, since the circle is roomier across the middle)
      const wide = logo.naturalHeight / logo.naturalWidth < 0.45;
      const box = fill ? r * 2 : r * (zoom ?? (wide ? 1.75 : 1.45));
      const k = Math.min(box / logo.naturalWidth, box / logo.naturalHeight);
      const w = logo.naturalWidth * k;
      const h = logo.naturalHeight * k;
      if (backdrop) {
        // feather the logo's rectangular edges so it melts into the backdrop
        const f = document.createElement('canvas');
        f.width = Math.ceil(w);
        f.height = Math.ceil(h);
        const fc = f.getContext('2d')!;
        fc.drawImage(logo, 0, 0, w, h);
        fc.globalCompositeOperation = 'destination-in';
        const e = Math.min(w, h) * 0.12;
        const gx = fc.createLinearGradient(0, 0, w, 0);
        gx.addColorStop(0, 'rgba(0,0,0,0)');
        gx.addColorStop(e / w, '#000');
        gx.addColorStop(1 - e / w, '#000');
        gx.addColorStop(1, 'rgba(0,0,0,0)');
        fc.fillStyle = gx;
        fc.fillRect(0, 0, w, h);
        const gy = fc.createLinearGradient(0, 0, 0, h);
        gy.addColorStop(0, 'rgba(0,0,0,0)');
        gy.addColorStop(e / h, '#000');
        gy.addColorStop(1 - e / h, '#000');
        gy.addColorStop(1, 'rgba(0,0,0,0)');
        fc.fillStyle = gy;
        fc.fillRect(0, 0, w, h);
        c.drawImage(f, cx - w / 2, cy - h / 2);
      } else {
        c.drawImage(logo, cx - w / 2, cy - h / 2, w, h);
      }
      c.restore();
    }
    c.strokeStyle = gold;
    c.lineWidth = 7;
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    c.stroke();
  } else {
    const maxW = W * 0.74;
    const maxH = H * 0.36;
    let w = maxW;
    let h = maxW * 0.5;
    if (logo) {
      const k = Math.min(maxW / logo.naturalWidth, maxH / logo.naturalHeight);
      w = logo.naturalWidth * k;
      h = logo.naturalHeight * k;
    }
    const pad = 14;
    const bx = cx - w / 2 - pad;
    const by = cy - h / 2 - pad;
    const bw = w + pad * 2;
    const bh = h + pad * 2;
    c.save();
    c.shadowColor = 'rgba(0,0,0,0.4)';
    c.shadowBlur = 14;
    c.shadowOffsetY = 5;
    roundRect(c, bx, by, bw, bh, 12);
    c.fillStyle = 'rgba(8, 6, 4, 0.55)';
    c.fill();
    c.restore();
    if (logo) {
      c.save();
      roundRect(c, bx, by, bw, bh, 12);
      c.clip();
      c.drawImage(logo, cx - w / 2, cy - h / 2, w, h);
      c.restore();
    }
    c.strokeStyle = gold;
    c.lineWidth = 6;
    roundRect(c, bx, by, bw, bh, 12);
    c.stroke();
  }

  // divider + label
  c.strokeStyle = goldGradient(c, W);
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(W * 0.3, H * 0.72);
  c.lineTo(W * 0.7, H * 0.72);
  c.stroke();
  c.fillStyle = goldGradient(c, W);
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  (c as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '5px';
  let fs = 54;
  c.font = `${fs}px Heavitas, "Arial Black", sans-serif`;
  while (c.measureText(label.toUpperCase()).width > W - 130 && fs > 24) {
    fs -= 2;
    c.font = `${fs}px Heavitas, "Arial Black", sans-serif`;
  }
  c.fillStyle = '#fff6e0';
  c.shadowColor = 'rgba(0,0,0,0.45)';
  c.shadowBlur = 8;
  c.fillText(label.toUpperCase(), W / 2, H * 0.8);
  c.shadowBlur = 0;
  return cv;
}

/** Card back: deep emerald with a gold mandala medallion. */
export function makeCardBackCanvas() {
  const W = 512;
  const H = 768;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const c = cv.getContext('2d')!;
  const bg = c.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, H * 0.6);
  bg.addColorStop(0, '#125c43');
  bg.addColorStop(1, '#03150e');
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);
  const m = makeMandalaCanvas(512);
  c.globalAlpha = 0.95;
  c.drawImage(m, (W - 440) / 2, (H - 440) / 2, 440, 440);
  c.globalAlpha = 1;
  c.strokeStyle = goldGradient(c, W);
  c.lineWidth = 10;
  roundRect(c, 26, 26, W - 52, H - 52, 46);
  c.stroke();
  return cv;
}

export type LogoBackdropStyle = 'spotlight' | 'rangoli';

/**
 * Full-screen backdrop behind the SURABHI lockup (emblem + wordmark).
 * Drawn in world units: the lockup's centre is the canvas centre.
 *  pw, ph : plane size in world units
 *  topY   : distance (world units) from the lockup centre up to the top of the screen
 */
export function makeLogoBackdropCanvas(style: LogoBackdropStyle, pw: number, ph: number, topY: number) {
  const ppu = Math.min(150, 2048 / Math.max(pw, ph)); // pixels per world unit
  const cv = document.createElement('canvas');
  cv.width = Math.round(pw * ppu);
  cv.height = Math.round(ph * ppu);
  const c = cv.getContext('2d')!;
  const cx = cv.width / 2;
  const cy = cv.height / 2;
  const U = (v: number) => v * ppu; // world units -> px
  const ellipseGrad = (rx: number, ry: number, stops: [number, string][]) => {
    c.save();
    c.translate(cx, cy);
    c.scale(1, ry / rx);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, U(rx));
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    c.fillStyle = g;
    c.fillRect(-cv.width, -cv.height * (rx / ry), cv.width * 2, cv.height * 2 * (rx / ry));
    c.restore();
  };

  if (style === 'spotlight') {
    // 1) dim the stage around the beam
    c.fillStyle = 'rgba(2, 18, 12, 0.5)';
    c.fillRect(0, 0, cv.width, cv.height);
    // 2) the beam: from the top of the screen down to a lit floor under the wordmark
    const floorY = cy + U(2.75);
    const topPx = cy - U(topY + 0.6);
    const layers = 22;
    for (let i = 0; i < layers; i++) {
      const k = i / (layers - 1); // 0 = widest/softest, 1 = core
      const wTop = U(0.55 + (1 - k) * 0.75);
      const wBot = U(2.2 + (1 - k) * 1.6);
      const g = c.createLinearGradient(0, topPx, 0, floorY);
      g.addColorStop(0, 'rgba(255, 238, 196, 0.05)');
      g.addColorStop(0.75, 'rgba(255, 238, 196, 0.035)');
      g.addColorStop(1, 'rgba(255, 238, 196, 0.012)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(cx - wTop, topPx);
      c.lineTo(cx + wTop, topPx);
      c.lineTo(cx + wBot, floorY);
      c.lineTo(cx - wBot, floorY);
      c.closePath();
      c.fill();
    }
    // 3) lit floor ellipse
    c.save();
    c.translate(cx, floorY);
    c.scale(1, 0.14);
    const fg = c.createRadialGradient(0, 0, 0, 0, 0, U(2.6));
    fg.addColorStop(0, 'rgba(255, 228, 160, 0.75)');
    fg.addColorStop(0.6, 'rgba(255, 228, 160, 0.4)');
    fg.addColorStop(1, 'rgba(255, 228, 160, 0)');
    c.fillStyle = fg;
    c.beginPath();
    c.arc(0, 0, U(2.6), 0, Math.PI * 2);
    c.fill();
    c.restore();
    c.save();
    c.translate(cx, floorY);
    c.scale(1, 0.14);
    c.strokeStyle = 'rgba(236, 196, 110, 0.75)';
    c.shadowColor = 'rgba(232, 170, 60, 1)';
    c.shadowBlur = U(0.08);
    c.lineWidth = U(0.012) / 0.14 * 0.14 * 1.6;
    c.beginPath();
    c.arc(0, 0, U(2.3), 0, Math.PI * 2);
    c.stroke();
    c.restore();
    // 4) dust motes inside the beam
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 160; i++) {
      const y = topPx + rnd() * (floorY - topPx);
      const k = (y - topPx) / (floorY - topPx);
      const half = U(0.6) + k * U(2.3);
      const x = cx + (rnd() * 2 - 1) * half;
      const r = U(0.008 + rnd() * 0.018);
      c.fillStyle = `rgba(236, 196, 110, ${0.3 + rnd() * 0.5})`;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
  } else {
    // rangoli / kolam: gold dot grid + nested diamonds, clear around the lockup
    const step = 0.42;
    c.fillStyle = 'rgba(236, 196, 110, 0.85)';
    const nx = Math.ceil(pw / step / 2) + 1;
    const ny = Math.ceil(ph / step / 2) + 1;
    for (let gy = -ny; gy <= ny; gy++) {
      for (let gx = -nx; gx <= nx; gx++) {
        if ((gx + gy) % 2 !== 0) continue;
        const x = cx + U(gx * step);
        const y = cy + U(gy * step);
        const r = U(0.022);
        // tiny diamond dot, like a kolam pulli
        c.beginPath();
        c.moveTo(x, y - r * 1.3);
        c.lineTo(x + r, y);
        c.lineTo(x, y + r * 1.3);
        c.lineTo(x - r, y);
        c.closePath();
        c.fill();
      }
    }
    c.strokeStyle = 'rgba(236, 196, 110, 0.45)';
    c.lineWidth = Math.max(1, U(0.009));
    for (let r = 1.7; r < Math.max(pw, ph); r += 0.85) {
      c.beginPath();
      c.moveTo(cx, cy - U(r));
      c.lineTo(cx + U(r), cy);
      c.lineTo(cx, cy + U(r));
      c.lineTo(cx - U(r), cy);
      c.closePath();
      c.stroke();
    }
    // clear the pattern around the lockup (soft oval) ...
    c.globalCompositeOperation = 'destination-out';
    ellipseGrad(2.75, 3.0, [
      [0, 'rgba(0,0,0,1)'],
      [0.62, 'rgba(0,0,0,1)'],
      [1, 'rgba(0,0,0,0)'],
    ]);
    // ... and fade it out toward the screen edges
    c.globalCompositeOperation = 'destination-in';
    ellipseGrad(Math.max(pw, ph) * 0.48, Math.max(pw, ph) * 0.4, [
      [0, 'rgba(0,0,0,1)'],
      [0.55, 'rgba(0,0,0,0.9)'],
      [1, 'rgba(0,0,0,0.15)'],
    ]);
    c.globalCompositeOperation = 'source-over';
    // soft lit emerald centre behind the lockup
    ellipseGrad(2.9, 3.2, [
      [0, 'rgba(70, 170, 125, 0.4)'],
      [0.7, 'rgba(70, 170, 125, 0.16)'],
      [1, 'rgba(70, 170, 125, 0)'],
    ]);
  }
  return cv;
}