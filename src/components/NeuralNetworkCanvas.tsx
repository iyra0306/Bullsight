import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface NeuralNetworkCanvasProps {
  drivers: { name: string; weight: number; impact: 'Positive' | 'Negative' | 'Neutral' }[];
  confidence: number;
}

export const NeuralNetworkCanvas: React.FC<NeuralNetworkCanvasProps> = ({
  drivers,
  confidence,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let phase = 0;

    const layers = [4, 6, 5, 3];

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 540;
      const h = canvas.clientHeight || 260;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const padX = 56;
      const padY = 28;
      const usableW = w - padX * 2;
      const usableH = h - padY * 2;

      const nodeCoords: { x: number; y: number; layer: number; idx: number }[][] = [];

      layers.forEach((count, lIdx) => {
        const x = padX + (lIdx / (layers.length - 1)) * usableW;
        const col: { x: number; y: number; layer: number; idx: number }[] = [];
        for (let i = 0; i < count; i++) {
          const y =
            count === 1
              ? padY + usableH / 2
              : padY + (i / (count - 1)) * usableH;
          col.push({ x, y, layer: lIdx, idx: i });
        }
        nodeCoords.push(col);
      });

      // Connections
      for (let l = 0; l < nodeCoords.length - 1; l++) {
        const curr = nodeCoords[l];
        const next = nodeCoords[l + 1];
        for (let i = 0; i < curr.length; i++) {
          for (let j = 0; j < next.length; j++) {
            const a = curr[i];
            const b = next[j];
            const signal = Math.sin(phase * 1.4 + i * 0.9 + j * 0.7 + l) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(54, 201, 130, ${(0.08 + signal * 0.22).toFixed(3)})`;
            ctx.lineWidth = 0.8 + signal * 0.9;
            ctx.stroke();

            // Traveling impulse dot on selected active paths
            if (!reducedMotion && (i + j + l) % 3 === 0) {
              const t = (phase * 0.45 + (i * 0.23 + j * 0.17 + l * 0.31)) % 1;
              const px = a.x + (b.x - a.x) * t;
              const py = a.y + (b.y - a.y) * t;
              ctx.beginPath();
              ctx.arc(px, py, 2.1, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(165, 235, 195, 0.85)';
              ctx.fill();
            }
          }
        }
      }

      // Nodes
      nodeCoords.forEach((col, lIdx) => {
        col.forEach((node, idx) => {
          const pulse = reducedMotion
            ? 0.5
            : Math.sin(phase * 2 + lIdx + idx * 0.8) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5.5 + pulse * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = '#18211C';
          ctx.fill();
          ctx.lineWidth = 1.8;
          ctx.strokeStyle = lIdx === layers.length - 1 && idx === 0 ? '#A5EBC3' : '#36C982';
          ctx.stroke();
        });
      });

      ctx.restore();

      if (!reducedMotion) {
        phase += 0.025;
        rafId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(rafId);
  }, [reducedMotion, drivers, confidence]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-black/10 bg-[#141C17] p-4 dark:border-white/8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#91A197]">
        <span>Feature Signal Topology (Illustrative Visualization)</span>
        <span className="font-mono-num text-[#A5EBC3]">
          Illustrative Confidence Index: {confidence}%
        </span>
      </div>
      <canvas ref={canvasRef} className="h-[240px] w-full" />
      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/8 pt-3 sm:grid-cols-4">
        {drivers.map((d) => (
          <div key={d.name} className="min-w-0">
            <div className="truncate text-[11px] text-[#91A197]">{d.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 font-mono-num text-xs font-semibold text-[#E8F0EA]">
              <span>{d.weight}%</span>
              <span
                className={
                  d.impact === 'Positive'
                    ? 'text-[#36C982]'
                    : d.impact === 'Negative'
                    ? 'text-[#EF6461]'
                    : 'text-[#E5B869]'
                }
              >
                {d.impact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
