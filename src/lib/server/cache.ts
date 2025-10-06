// LRU Cache implementation for caching API responses

export class LRUCache<K, V> {
	private cache = new Map<K, V>();
	private maxSize: number;

	constructor(maxSize = 100) {
		this.maxSize = maxSize;
	}

	get(key: K): V | undefined {
		const value = this.cache.get(key);
		if (value !== undefined) {
			// Move to end (most recently used)
			this.cache.delete(key);
			this.cache.set(key, value);
		}
		return value;
	}

	set(key: K, value: V): void {
		if (this.cache.has(key)) {
			this.cache.delete(key);
		} else if (this.cache.size >= this.maxSize) {
			// Delete least recently used (first item)
			const firstKey = this.cache.keys().next().value as K;
			if (firstKey !== undefined) {
				this.cache.delete(firstKey);
			}
		}
		this.cache.set(key, value);
	}

	has(key: K): boolean {
		return this.cache.has(key);
	}

	clear(): void {
		this.cache.clear();
	}
}

// Cache for prompt enhancements (stores up to 50 recent prompts)
const promptCache = new LRUCache<string, string>(50);

export async function getCachedEnhancement(prompt: string): Promise<string | undefined> {
	return promptCache.get(prompt);
}

export function setCachedEnhancement(prompt: string, enhanced: string): void {
	promptCache.set(prompt, enhanced);
}

