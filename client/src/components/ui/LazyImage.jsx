import { useState, useRef, useEffect } from 'react';
import { cn }                          from '@/lib/utils.js';

export const LazyImage = ({
  src,
  alt       = '',
  className,
  skeleton  = true,
  onLoad,
  ...props
}) => {
  const [loaded,  setLoaded]  = useState(false);
  const [errored, setErrored] = useState(false);
  const [visible, setVisible] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Skeleton */}
      {skeleton && !loaded && !errored && (
        <div className="absolute inset-0 bg-[var(--color-surface-2)] animate-pulse" />
      )}

      {/* Image */}
      {visible && !errored && (
        <img
          src={src}
          alt={alt}
          onLoad={() => { setLoaded(true); onLoad?.(); }}
          onError={() => setErrored(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}

      {errored && (
        <div className="absolute inset-0 bg-[var(--color-surface-2)]
                        flex items-center justify-center">
          <span className="text-2xs font-mono text-[var(--color-muted)]">
            {alt || '—'}
          </span>
        </div>
      )}
    </div>
  );
};