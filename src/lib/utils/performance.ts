// Performance tracking utilities

export function measurePerformance(name: string) {
	const start = performance.now();

	return {
		end: () => {
			const duration = performance.now() - start;
			console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);

			// Send to analytics service (placeholder)
			if (typeof window !== 'undefined') {
				// Example: analytics.track('performance', { name, duration });
			}

			return duration;
		}
	};
}

export function trackWebVitals() {
	if (typeof window === 'undefined') return;

	// Track LCP (Largest Contentful Paint)
	if ('PerformanceObserver' in window) {
		try {
			const lcpObserver = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const lastEntry = entries[entries.length - 1] as any;
				console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
			});
			lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
		} catch (e) {
			// Observer not supported
		}
	}
}

