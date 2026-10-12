import { useEffect, useRef } from 'react';

/** Adds `is-visible` when the element enters the viewport. Children with
 *  `.stagger` get incremental delays for a cascading motion. */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll<HTMLElement>('.stagger').forEach((c, i) => {
      c.style.transitionDelay = `${i * 90}ms`;
    });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}
