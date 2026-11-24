import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  decimals = 2,
  prefix = '',
  suffix = '',
  durationMs = 650,
  className = '',
}) => {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState<number>(value);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    const startValue = display;
    const delta = value - startValue;
    if (Math.abs(delta) < 0.0001) {
      setDisplay(value);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Cubic ease out
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(startValue + delta * eased);
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplay(value);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reducedMotion, durationMs]);

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
