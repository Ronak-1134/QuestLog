// ── Image lazy loader with IntersectionObserver ───────────────────────────
export const lazyLoadImage = (img) => {
  if (!img || img.dataset.loaded) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      const src = img.dataset.src;
      if (src) {
        img.src = src;
        img.onload  = () => { img.dataset.loaded = true; observer.unobserve(img); };
        img.onerror = () => observer.unobserve(img);
      }
    },
    { rootMargin: '200px' }
  );

  observer.observe(img);
  return () => observer.disconnect();
};

// ── RAF-throttled callback ─────────────────────────────────────────────────
export const rafThrottle = (fn) => {
  let raf = null;
  return (...args) => {
    if (raf) return;
    raf = requestAnimationFrame(() => { fn(...args); raf = null; });
  };
};

// ── Measure Web Vitals ─────────────────────────────────────────────────────
export const measureVitals = () => {
  if (typeof window === 'undefined') return;

  // LCP
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lcp     = entries[entries.length - 1];
    console.debug('[LCP]', Math.round(lcp.startTime), 'ms');
  }).observe({ type: 'largest-contentful-paint', buffered: true });

  // CLS
  let clsScore = 0;
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (!e.hadRecentInput) clsScore += e.value;
    }
    console.debug('[CLS]', clsScore.toFixed(4));
  }).observe({ type: 'layout-shift', buffered: true });

  // FID / INP
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      console.debug('[INP]', Math.round(e.processingStart - e.startTime), 'ms');
    }
  }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
};

// ── Preload critical assets ────────────────────────────────────────────────
export const preloadFont = (href) => {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = Object.assign(document.createElement('link'), {
    rel:  'preload',
    as:   'font',
    type: 'font/woff2',
    href,
    crossOrigin: 'anonymous',
  });
  document.head.appendChild(link);
};

// ── Idle callback queue ────────────────────────────────────────────────────
export const whenIdle = (fn) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(fn, { timeout: 2000 });
  } else {
    setTimeout(fn, 200);
  }
};