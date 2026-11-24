import { useCallback, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

export function useMagnetic(strength = 0.25) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const reducedMotion = useReducedMotion();

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reducedMotion || !ref.current) return;
      if (window.matchMedia('(pointer: coarse)').matches) return;
      const rect = ref.current.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
      const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
      ref.current.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
    },
    [reducedMotion, strength]
  );

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate3d(0px, 0px, 0)';
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
