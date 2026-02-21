import { useRef, useState, useEffect } from 'react';

const ROOT_MARGIN = '0px 0px -40px 0px'; // trigger when 40px from bottom of viewport

export function ScrollReveal({
  children,
  className = '',
  fadeOnly = false,
}: {
  children: React.ReactNode;
  className?: string;
  fadeOnly?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { rootMargin: ROOT_MARGIN, threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal-content ${inView ? 'in-view' : ''} ${fadeOnly ? 'scroll-reveal-fade' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
