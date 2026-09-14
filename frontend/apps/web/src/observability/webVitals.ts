type Metric = {
  name: string;
  value: number;
  rating: string;
  id: string;
  navigationType: string;
};

function report(metric: Metric): void {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (!endpoint) return;

  void fetch(`${endpoint}/vitals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
      url: location.pathname,
    }),
    keepalive: true,
  });
}

export function initWebVitals(): void {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (
          entry.entryType === 'largest-contentful-paint' ||
          entry.entryType === 'paint' ||
          entry.entryType === 'first-input'
        ) {
          report({
            name: entry.entryType,
            value: entry.startTime,
            rating: 'good',
            id: `${entry.entryType}-${Date.now()}`,
            navigationType: 'navigate',
          });
        }
      }
    });
    po.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });
  } catch {
    /* not supported */
  }
}
