import { useEffect, useRef } from 'react';

/** Moves an element at `speed` × scroll for a parallax "moving" effect. */
export function useParallax<T extends HTMLElement>(speed = 0.3) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (el) {
        const rect = el.parentElement?.getBoundingClientRect();
        const offset = rect ? -rect.top : window.scrollY;
        el.style.transform = `translate3d(0, ${offset * speed}px, 0)`;
      }
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);
  return ref;
}
