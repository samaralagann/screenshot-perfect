import { useEffect, useRef } from "react";

const COLORS = ["#D9B56D", "#F3D58A", "#C98791", "#F7A1B5", "#FF8A7A", "#B07CD8", "#E85D8A", "#FFE4A8"];

type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; s: number; trail?: boolean; glitter?: boolean };
type R = { x: number; y: number; vx: number; vy: number; ty: number; c: string; kind: string; size: number };

/** Canvas fireworks. `intensity` scales launch rate; `finale` enables the grand finale sequence. */
export function Fireworks({ intensity = 1, finale = false, onFinale }: { intensity?: number; finale?: boolean; onFinale?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cb = useRef(onFinale);
  cb.current = onFinale;

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 640;
    const cap = mobile ? 900 : 2200;
    let w = 0, h = 0, raf = 0, visible = false, t0 = 0, finaleDone = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const ps: P[] = [];
    const rs: R[] = [];
    const pick = () => COLORS[(Math.random() * COLORS.length) | 0]!;

    const launch = (kind?: string, x?: number) => {
      const sx = x ?? w * (0.1 + Math.random() * 0.8);
      const ty = h * (0.15 + Math.random() * 0.3);
      rs.push({ x: sx, y: h, vx: (Math.random() - 0.5) * 3, vy: -(h / 55 + Math.random() * 4), ty, c: pick(), kind: kind ?? (Math.random() < 0.18 ? "heart" : Math.random() < 0.5 ? "ring" : "burst"), size: mobile ? 0.7 : 1 });
    };
    const add = (p: P) => { if (ps.length < cap) ps.push(p); };
    const heartPts = (n: number) => Array.from({ length: n }, (_, i) => {
      const t = (i / n) * Math.PI * 2;
      return [16 * Math.sin(t) ** 3, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))] as [number, number];
    });
    const explode = (x: number, y: number, kind: string, c: string, scale = 1) => {
      if (kind === "heart" || kind === "double" || kind === "giant") {
        const n = kind === "giant" ? 220 : 90;
        const k = (kind === "giant" ? 0.55 : 0.28) * scale;
        const offs = kind === "double" ? [-60 * scale, 60 * scale] : [0];
        offs.forEach((o, j) => heartPts(n).forEach(([hx, hy]) =>
          add({ x: x + o, y, vx: hx * k, vy: hy * k, life: 0, max: kind === "giant" ? 140 : 90, c: kind === "giant" ? (Math.random() < 0.7 ? "#E9C46A" : "#FFE4A8") : j ? "#F7A1B5" : c, s: 2.2, glitter: kind === "giant" })));
        return;
      }
      const n = (kind === "ring" ? 80 : 120) * (mobile ? 0.6 : 1);
      const sp = (kind === "ring" ? 5 : 6) * scale;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const v = kind === "ring" ? sp : sp * Math.random();
        add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 70 + Math.random() * 40, c: Math.random() < 0.8 ? c : "#FFE4A8", s: 2, glitter: Math.random() < 0.3 });
      }
      if (Math.random() < 0.6) for (let i = 0; i < 40; i++) {
        const a = Math.random() * Math.PI * 2, v = Math.random() * 2.5;
        add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 60, c: pick(), s: 1.5 });
      }
    };

    let acc = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      if (!t0) t0 = t;
      const el = (t - t0) / 1000;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      acc += 0.035 * intensity * (mobile ? 0.7 : 1);
      while (acc > 1) { acc--; launch(); if (Math.random() < 0.35) launch(); }

      if (finale && !finaleDone && el > 9) {
        finaleDone = true;
        for (let i = 0; i < (mobile ? 8 : 14); i++) setTimeout(() => launch(i % 4 === 0 ? "double" : undefined, (w * (i + 0.5)) / 14 * 1 + (mobile ? 0 : 0)), i * 120);
        setTimeout(() => explode(w / 2, h * 0.38, "giant", "#E9C46A", Math.min(w, h) / 500 + 0.4), 2600);
        setTimeout(() => cb.current?.(), 4200);
      }

      // Ground firecrackers: rapid pops with flashes along the bottom
      if (Math.random() < 0.12 * intensity) {
        const gx = w * Math.random(), gy = h - 10 - Math.random() * 30;
        ctx.globalAlpha = 0.5; ctx.fillStyle = "#FFE4A8";
        ctx.beginPath(); ctx.arc(gx, gy, 14 + Math.random() * 10, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
        for (let k = 0; k < 18; k++) {
          const a = -Math.PI * Math.random(), v = 1.5 + Math.random() * 4;
          add({ x: gx, y: gy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 25 + Math.random() * 20, c: Math.random() < 0.5 ? "#FF8A7A" : "#F3D58A", s: 1.6, glitter: true });
        }
      }
      for (let i = rs.length - 1; i >= 0; i--) {
        const r = rs[i]!;
        r.x += r.vx; r.y += r.vy; r.vy += 0.12;
        add({ x: r.x, y: r.y, vx: (Math.random() - 0.5) * 0.6, vy: Math.random() * 0.8, life: 0, max: 30, c: r.c, s: 1.6, trail: true });
        if (r.y <= r.ty || r.vy >= -1) { explode(r.x, r.y, r.kind, r.c, r.size); rs.splice(i, 1); }
      }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]!;
        p.life++; p.x += p.vx; p.y += p.vy;
        p.vx *= 0.97; p.vy = p.vy * 0.97 + (p.trail ? 0.02 : 0.06);
        const a = 1 - p.life / p.max;
        if (a <= 0) { ps.splice(i, 1); continue; }
        ctx.globalAlpha = p.glitter ? a * (0.5 + Math.random() * 0.5) : a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * (p.trail ? a : 1), 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const io = new IntersectionObserver((es) => { visible = !!es[0]?.isIntersecting; });
    io.observe(cv);
    if (reduce) {
      visible = false;
      if (finale) cb.current?.();
    } else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", resize); };
  }, [intensity, finale]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}
