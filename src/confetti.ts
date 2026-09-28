// Lightweight confetti burst on a shared full-screen canvas.

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  s: number;
  c: string;
  r: number;
  vr: number;
  life: number;
}

let canvas: HTMLCanvasElement | null = null;
let cctx: CanvasRenderingContext2D | null = null;
let parts: Particle[] = [];
let running = false;

const COLORS = ['#6C4CE0', '#FFB627', '#22A06B', '#E5484D', '#9A80FF'];

function ensureCanvas(): void {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:50';
  document.body.appendChild(canvas);
  cctx = canvas.getContext('2d');
  const resize = () => {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);
}

function tick(): void {
  if (!canvas || !cctx) return;
  cctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.r += p.vr;
    p.life--;
    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate(p.r);
    cctx.fillStyle = p.c;
    cctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
    cctx.restore();
    if (p.life <= 0 || p.y > canvas.height + 40) parts.splice(i, 1);
  }
  if (parts.length) {
    requestAnimationFrame(tick);
  } else {
    running = false;
    cctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

export function fireConfetti(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ensureCanvas();
  const w = window.innerWidth;
  const h = window.innerHeight;
  for (let i = 0; i < 70; i++) {
    parts.push({
      x: w / 2,
      y: h * 0.35,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -11 - 3,
      g: 0.4 + Math.random() * 0.2,
      s: 6 + Math.random() * 7,
      c: COLORS[i % COLORS.length],
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
      life: 60 + Math.random() * 30,
    });
  }
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
}
