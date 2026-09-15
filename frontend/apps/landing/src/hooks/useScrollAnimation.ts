import { useEffect, useRef } from 'react';

export function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      element.classList.add('visible');
      return;
    }

    // Safety fallback so content is always readable even if not scrolled
    const timeout = setTimeout(() => {
      element.classList.add('visible');
    }, 400);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add('visible');
            clearTimeout(timeout);
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '50px',
      }
    );

    observer.observe(element);

    return () => {
      clearTimeout(timeout);
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return ref;
}
