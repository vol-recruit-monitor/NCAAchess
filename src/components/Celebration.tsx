import { useEffect, useRef } from 'react';

/**
 * Checkmate celebration: fireworks bursting in the winning team's colors
 * while fans rush the field from the stands. Canvas overlay covering the
 * board column; runs ~7 seconds and then calls onDone.
 */
export function Celebration({ colors, onDone }: { colors: string[]; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = parent.clientWidth;
    const H = parent.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const palette = [...colors, '#ffffff', '#ffd75e'];
    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
      size: number;
    }
    interface Fan {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      phase: number;
      skin: string;
    }
    const sparks: Spark[] = [];
    const fans: Fan[] = [];
    const skins = ['#f2c9a0', '#c68642', '#8d5524', '#ffdbac'];

    const burst = () => {
      const bx = W * (0.15 + Math.random() * 0.7);
      const by = H * (0.08 + Math.random() * 0.4);
      const color = palette[Math.floor(Math.random() * palette.length)];
      const count = 42 + Math.floor(Math.random() * 22);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
        const speed = 1.4 + Math.random() * 3;
        sparks.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color,
          size: 1.4 + Math.random() * 1.6,
        });
      }
    };

    let raf = 0;
    let lastBurst = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, W, H);

      // Fireworks for the first ~4.5s
      if (t < 4.5 && now - lastBurst > 360) {
        burst();
        lastBurst = now;
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.045; // gravity
        s.vx *= 0.985;
        s.life -= 0.013;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Field rush: fans pour in from the top (the stands) after ~0.8s
      if (t > 0.8 && t < 4.2 && fans.length < 110) {
        for (let i = 0; i < 4; i++) {
          fans.push({
            x: Math.random() * W,
            y: -6 - Math.random() * 40,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 1.3 + Math.random() * 1.8,
            color: colors[Math.floor(Math.random() * colors.length)] ?? '#ffffff',
            phase: Math.random() * Math.PI * 2,
            skin: skins[Math.floor(Math.random() * skins.length)],
          });
        }
      }
      for (const f of fans) {
        f.y += f.vy;
        f.x += f.vx + Math.sin(f.phase + t * 7) * 0.5;
        if (f.y > H + 10) continue;
        const bob = Math.sin(f.phase + t * 12) * 0.8;
        // body
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y + bob, 2.6, 3.4, 0, 0, Math.PI * 2);
        ctx.fill();
        // head
        ctx.fillStyle = f.skin;
        ctx.beginPath();
        ctx.arc(f.x, f.y - 4 + bob, 1.9, 0, Math.PI * 2);
        ctx.fill();
        // arms up!
        ctx.strokeStyle = f.skin;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(f.x - 2.4, f.y - 1 + bob);
        ctx.lineTo(f.x - 4, f.y - 6 + bob);
        ctx.moveTo(f.x + 2.4, f.y - 1 + bob);
        ctx.lineTo(f.x + 4, f.y - 6 + bob);
        ctx.stroke();
      }

      if (t < 7) {
        raf = requestAnimationFrame(tick);
      } else {
        onDoneRef.current();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [colors]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-40" />;
}
