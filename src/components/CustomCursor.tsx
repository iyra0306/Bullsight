import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

type CursorVariant = 'default' | 'pointer' | 'magnetic' | 'chart' | 'stock' | 'text';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

interface TrailNode {
  x: number;
  y: number;
}

interface GlowParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  mint: boolean;
}

export const CustomCursor: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>('default');

  const coreRef = useRef<HTMLDivElement | null>(null);
  const reticleRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const variantRef = useRef<CursorVariant>('default');
  const visibleRef = useRef(false);
  const posRef = useRef({
    x: -120,
    y: -120,
    reticleX: -120,
    reticleY: -120,
    vx: 0,
    vy: 0,
    angle: 0,
  });

  const trailRef = useRef<TrailNode[]>([]);
  const particlesRef = useRef<GlowParticle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastSpawnRef = useRef({ x: -120, y: -120 });

  useEffect(() => {
    const checkPointer = () => {
      const finePointer =
        window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        window.innerWidth >= 1024;
      setEnabled(finePointer && !reducedMotion);
    };

    checkPointer();
    window.addEventListener('resize', checkPointer);
    return () => window.removeEventListener('resize', checkPointer);
  }, [reducedMotion]);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('has-custom-cursor');
      particlesRef.current = [];
      ripplesRef.current = [];
      return;
    }

    document.body.classList.add('has-custom-cursor');
    let rafId = 0;
    let rafActive = false;
    let lastTime = performance.now();

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ensureLoopRunning = () => {
      if (!rafActive && !reducedMotion) {
        rafActive = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(animate);
      }
    };

    const handleMove = (e: MouseEvent) => {
      const p = posRef.current;
      p.vx = e.clientX - p.x;
      p.vy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;

      if (!visibleRef.current) {
        p.reticleX = e.clientX;
        p.reticleY = e.clientY;
        lastSpawnRef.current = { x: e.clientX, y: e.clientY };
        trailRef.current = Array.from({ length: 10 }, () => ({
          x: e.clientX,
          y: e.clientY,
        }));
        visibleRef.current = true;
        setVisible(true);
      } else {
        const distSinceSpawn = Math.hypot(
          e.clientX - lastSpawnRef.current.x,
          e.clientY - lastSpawnRef.current.y
        );
        if (distSinceSpawn >= 7) {
          const count = distSinceSpawn > 28 ? 2 : 1;
          for (let i = 0; i < count; i++) {
            const jitterX = (Math.random() - 0.5) * 4;
            const jitterY = (Math.random() - 0.5) * 4;
            const driftScale = 2.2;
            particlesRef.current.push({
              x: e.clientX + jitterX,
              y: e.clientY + jitterY,
              vx: -p.vx * driftScale + (Math.random() - 0.5) * 26,
              vy: -p.vy * driftScale + (Math.random() - 0.5) * 26 - 8,
              size: 1.4 + Math.random() * 1.6,
              life: 1,
              maxLife: 0.3 + Math.random() * 0.16,
              mint: Math.random() > 0.45,
            });
          }
          if (particlesRef.current.length > 52) {
            particlesRef.current.splice(0, particlesRef.current.length - 52);
          }
          lastSpawnRef.current = { x: e.clientX, y: e.clientY };
        }
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        let nextVariant: CursorVariant = 'default';
        const cursorZone = target.closest('[data-cursor]') as HTMLElement | null;

        if (cursorZone) {
          const mode = cursorZone.getAttribute('data-cursor') as CursorVariant;
          nextVariant = mode || 'pointer';
        } else if (
          target.closest(
            'input[type="text"], input[type="email"], input[type="password"], input[type="search"], textarea'
          )
        ) {
          nextVariant = 'text';
        } else if (target.closest('a, button, [role="button"], select, label')) {
          nextVariant = 'pointer';
        }

        if (variantRef.current !== nextVariant) {
          variantRef.current = nextVariant;
          setVariant(nextVariant);
        }
      }

      ensureLoopRunning();
    };

    const handleDown = (e: MouseEvent) => {
      setPressed(true);
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        alpha: 0.65,
      });
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.4;
        const spd = 48 + Math.random() * 64;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: 1.6 + Math.random() * 1.2,
          life: 1,
          maxLife: 0.26 + Math.random() * 0.14,
          mint: i % 2 === 0,
        });
      }
      ensureLoopRunning();
    };

    const handleUp = () => setPressed(false);

    const handleLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    function animate(now: number) {
      const dt = Math.min(Math.max((now - lastTime) / 1000, 0.001), 0.05);
      lastTime = now;

      const p = posRef.current;
      // Frame-rate independent exponential damping for smooth 60Hz/120Hz/144Hz tracking
      const reticleLerp = 1 - Math.exp(-15 * dt);
      p.reticleX += (p.x - p.reticleX) * reticleLerp;
      p.reticleY += (p.y - p.reticleY) * reticleLerp;

      const dx = p.x - p.reticleX;
      const dy = p.y - p.reticleY;
      const distToTarget = Math.hypot(dx, dy);
      const speed = Math.min(distToTarget, 36);
      const stretch = 1 + speed * 0.008;
      const squish = 1 - speed * 0.004;

      if (speed > 0.6) {
        p.angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      }

      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      }

      if (reticleRef.current) {
        const mode = variantRef.current;
        if (mode === 'default' && speed > 1.2) {
          reticleRef.current.style.transform = `translate3d(${p.reticleX}px, ${p.reticleY}px, 0) rotate(${p.angle.toFixed(1)}deg) scale(${stretch.toFixed(3)}, ${squish.toFixed(3)}) rotate(${(-p.angle).toFixed(1)}deg)`;
        } else {
          reticleRef.current.style.transform = `translate3d(${p.reticleX}px, ${p.reticleY}px, 0)`;
        }
      }

      let trailSettled = true;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

          if (visibleRef.current) {
            const trail = trailRef.current;
            const trailLerp = 1 - Math.exp(-28 * dt);
            if (trail.length === 0) {
              for (let i = 0; i < 10; i++) trail.push({ x: p.x, y: p.y });
            } else {
              trail[0].x = p.x;
              trail[0].y = p.y;
              for (let i = 1; i < trail.length; i++) {
                trail[i].x += (trail[i - 1].x - trail[i].x) * trailLerp;
                trail[i].y += (trail[i - 1].y - trail[i].y) * trailLerp;
              }
            }

            // Tapered emerald signal trail
            for (let i = 0; i < trail.length - 1; i++) {
              const a = trail[i];
              const b = trail[i + 1];
              const segLen = Math.hypot(a.x - b.x, a.y - b.y);
              if (segLen < 0.25) continue;
              trailSettled = false;
              const t = 1 - i / trail.length;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(54, 201, 130, ${(t * 0.28).toFixed(3)})`;
              ctx.lineWidth = Math.max(0.7, t * 2.1);
              ctx.lineCap = 'round';
              ctx.stroke();
            }
          }

          // Short-lived emerald glow particles
          const particles = particlesRef.current;
          const drag = Math.exp(-4.5 * dt);
          for (let i = particles.length - 1; i >= 0; i--) {
            const pt = particles[i];
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.vx *= drag;
            pt.vy *= drag;
            pt.life -= dt / pt.maxLife;

            if (pt.life <= 0) {
              particles.splice(i, 1);
              continue;
            }

            const alpha = pt.life * pt.life;
            const glowRadius = pt.size * (2.6 + (1 - pt.life) * 1.4);

            ctx.beginPath();
            ctx.arc(pt.x, pt.y, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(54, 201, 130, ${(alpha * 0.18).toFixed(3)})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size * (0.45 + pt.life * 0.55), 0, Math.PI * 2);
            ctx.fillStyle = pt.mint
              ? `rgba(165, 235, 195, ${(alpha * 0.72).toFixed(3)})`
              : `rgba(54, 201, 130, ${(alpha * 0.68).toFixed(3)})`;
            ctx.fill();
          }

          // Click sonar ripples
          const ripples = ripplesRef.current;
          const rippleDecay = Math.exp(-6.5 * dt);
          for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            r.radius += 135 * dt;
            r.alpha *= rippleDecay;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(165, 235, 195, ${r.alpha.toFixed(3)})`;
            ctx.lineWidth = 1.4;
            ctx.stroke();
            if (r.alpha < 0.03) {
              ripples.splice(i, 1);
            }
          }
        }
      }

      const hasActiveFx =
        particlesRef.current.length > 0 ||
        ripplesRef.current.length > 0 ||
        !trailSettled ||
        distToTarget > 0.15;

      if (hasActiveFx && !reducedMotion) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafActive = false;
      }
    }

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      document.removeEventListener('mouseleave', handleLeave);
      cancelAnimationFrame(rafId);
      rafActive = false;
    };
  }, [enabled, reducedMotion]);

  if (!enabled) return null;

  const isChart = variant === 'chart';
  const isStock = variant === 'stock';
  const isText = variant === 'text';
  const isInteractive = variant === 'pointer' || variant === 'magnetic';

  const boxWidth = pressed
    ? 44
    : isText
    ? 12
    : isInteractive
    ? 40
    : isStock
    ? 42
    : isChart
    ? 38
    : 30;

  const boxHeight = pressed
    ? 44
    : isText
    ? 24
    : isInteractive
    ? 40
    : isStock
    ? 34
    : isChart
    ? 38
    : 30;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      aria-hidden="true"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 150ms ease' }}
    >
      {/* Kinetic Emerald Ribbon Trail & Click Sonar Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />

      {/* Outer Morphing Tactical Reticle */}
      <div
        ref={reticleRef}
        className="fixed top-0 left-0 will-change-transform"
        style={{
          width: `${boxWidth}px`,
          height: `${boxHeight}px`,
          marginLeft: `-${boxWidth / 2}px`,
          marginTop: `-${boxHeight / 2}px`,
          borderRadius: isStock ? '9px' : isInteractive ? '11px' : isText ? '4px' : '9999px',
          backgroundColor: isInteractive
            ? 'rgba(54, 201, 130, 0.08)'
            : isStock
            ? 'rgba(16, 21, 18, 0.55)'
            : 'transparent',
          border:
            isDefaultBorder(variant)
              ? '1px solid rgba(165, 235, 195, 0.36)'
              : isInteractive
              ? '1px solid rgba(54, 201, 130, 0.65)'
              : isStock
              ? '1px solid rgba(54, 201, 130, 0.58)'
              : isChart
              ? '1px dashed rgba(54, 201, 130, 0.65)'
              : 'none',
          boxShadow: isInteractive || isStock
            ? '0 0 20px rgba(54, 201, 130, 0.22)'
            : '0 0 12px rgba(54, 201, 130, 0.1)',
          transition:
            'width 170ms cubic-bezier(0.16, 1, 0.3, 1), height 170ms cubic-bezier(0.16, 1, 0.3, 1), margin 170ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 180ms ease, background-color 180ms ease, border 150ms ease',
        }}
      >
        {/* 4 Corner HUD Brackets for Interactive / Stock / Magnetic */}
        {(isInteractive || isStock) && (
          <>
            <span className="absolute -left-[1px] -top-[1px] h-2 w-2 rounded-tl-[4px] border-l-2 border-t-2 border-[#A5EBC3]" />
            <span className="absolute -right-[1px] -top-[1px] h-2 w-2 rounded-tr-[4px] border-r-2 border-t-2 border-[#A5EBC3]" />
            <span className="absolute -bottom-[1px] -left-[1px] h-2 w-2 rounded-bl-[4px] border-b-2 border-l-2 border-[#A5EBC3]" />
            <span className="absolute -bottom-[1px] -right-[1px] h-2 w-2 rounded-br-[4px] border-b-2 border-r-2 border-[#A5EBC3]" />
          </>
        )}

        {/* Quantitative Crosshair Mode */}
        {isChart && (
          <>
            <span className="absolute left-1/2 -top-2.5 h-2.5 w-px -translate-x-1/2 bg-[#36C982]" />
            <span className="absolute left-1/2 -bottom-2.5 h-2.5 w-px -translate-x-1/2 bg-[#36C982]" />
            <span className="absolute top-1/2 -left-2.5 h-px w-2.5 -translate-y-1/2 bg-[#36C982]" />
            <span className="absolute top-1/2 -right-2.5 h-px w-2.5 -translate-y-1/2 bg-[#36C982]" />
          </>
        )}

        {/* Stock Card Mode: Mini Candlestick Telemetry Emblem */}
        {isStock && (
          <svg
            viewBox="0 0 28 20"
            className="h-full w-full p-1.5 text-[#36C982]"
            fill="none"
          >
            <line x1="6" y1="4" x2="6" y2="16" stroke="#A5EBC3" strokeWidth="1.2" />
            <rect x="4.2" y="7" width="3.6" height="6" rx="0.8" fill="#36C982" />
            <line x1="14" y1="3" x2="14" y2="15" stroke="#A5EBC3" strokeWidth="1.2" />
            <rect x="12.2" y="5.5" width="3.6" height="6.5" rx="0.8" fill="#A5EBC3" />
            <line x1="22" y1="2" x2="22" y2="14" stroke="#A5EBC3" strokeWidth="1.2" />
            <rect x="20.2" y="3.5" width="3.6" height="7" rx="0.8" fill="#36C982" />
          </svg>
        )}
      </div>

      {/* Central Precision Core (Diamond / Caret / Crosshair Dot) */}
      <div
        ref={coreRef}
        className="fixed top-0 left-0 will-change-transform"
        style={{
          width: isText ? '2px' : pressed ? '9px' : '7px',
          height: isText ? '18px' : pressed ? '9px' : '7px',
          marginLeft: isText ? '-1px' : pressed ? '-4.5px' : '-3.5px',
          marginTop: isText ? '-9px' : pressed ? '-4.5px' : '-3.5px',
          borderRadius: isText ? '2px' : '0px',
          transformOrigin: 'center center',
          backgroundColor: isText ? '#36C982' : 'transparent',
          boxShadow: isText ? '0 0 12px rgba(54, 201, 130, 0.9)' : 'none',
          opacity: isStock ? 0 : 1,
          transition: 'width 120ms ease, height 120ms ease, opacity 140ms ease',
        }}
      >
        {!isText && (
          <span
            className="block h-full w-full rotate-45 rounded-[1.5px] bg-[#A5EBC3]"
            style={{
              boxShadow: '0 0 10px rgba(54, 201, 130, 0.95)',
            }}
          />
        )}
      </div>
    </div>
  );
};

function isDefaultBorder(variant: CursorVariant): boolean {
  return variant === 'default';
}
