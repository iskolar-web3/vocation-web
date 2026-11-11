import type { CSSProperties, ReactNode } from 'react';
import { useRevealOnce } from '../../lib/motion';

/** M15: fades and rises once when 15% enters the viewport. Landing only. */
export function Reveal({
  className,
  delay,
  children,
  labelledBy,
}: {
  className?: string;
  delay?: number;
  children: ReactNode;
  labelledBy?: string;
}) {
  const ref = useRevealOnce<HTMLElement>();
  return (
    <section
      ref={ref}
      className={`reveal ${className ?? ''}`}
      aria-labelledby={labelledBy}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </section>
  );
}
