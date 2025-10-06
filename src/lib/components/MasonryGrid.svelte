<script lang="ts">
	import type { SavedGeneration } from '$lib/types';
	
	interface Props {
		generations: SavedGeneration[];
	}
	
	let { generations }: Props = $props();
	
	// Track which video is being hovered
	let hoveredId = $state<string | null>(null);
	
	// Store video element references
	let videoRefs = new Map<string, HTMLVideoElement>();
	
	function handleMouseEnter(id: string) {
		hoveredId = id;
		const video = videoRefs.get(id);
		if (video) {
			video.currentTime = 0;
			video.play().catch(err => console.error('Video play failed:', err));
		}
	}
	
	function handleMouseLeave() {
		if (hoveredId) {
			const video = videoRefs.get(hoveredId);
			if (video) {
				video.pause();
				video.currentTime = 0;
			}
		}
		hoveredId = null;
	}
	
	function setVideoRef(node: HTMLVideoElement, id: string) {
		videoRefs.set(id, node);
		
		return {
			destroy() {
				videoRefs.delete(id);
			}
		};
	}
	
	async function handleDownload(videoUrl: string, prompt: string) {
		try {
			// Fetch the video
			const response = await fetch(videoUrl);
			const blob = await response.blob();
			
			// Create a download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			
			// Generate filename from prompt (sanitized)
			const filename = `doodlemation-${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '-').toLowerCase()}.mp4`;
			link.download = filename;
			
			// Trigger download
			document.body.appendChild(link);
			link.click();
			
			// Cleanup
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Download failed:', error);
			// Fallback: open in new tab
			window.open(videoUrl, '_blank');
		}
	}
</script>

<div class="masonry-grid">
	{#each generations as generation (generation.id)}
		<div 
			class="masonry-item group relative overflow-hidden rounded-lg bg-gray-100 shadow-md transition-all duration-300 hover:shadow-xl"
			role="button"
			tabindex="0"
			onmouseenter={() => handleMouseEnter(generation.id)}
			onmouseleave={handleMouseLeave}
		>
			<!-- Image (always visible) -->
			<img 
				src={generation.imageUrl} 
				alt={generation.prompt}
				class="h-full w-full object-cover transition-opacity duration-300"
				class:opacity-0={hoveredId === generation.id}
				loading="lazy"
			/>
			
			<!-- Video (visible on hover) -->
			<video 
				use:setVideoRef={generation.id}
				src={generation.videoUrl}
				class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300"
				class:opacity-100={hoveredId === generation.id}
				loop
				muted
				playsinline
				preload="metadata"
			></video>
			
			<!-- Download button (top right) -->
			<button
				onclick={(e) => {
					e.stopPropagation();
					handleDownload(generation.videoUrl, generation.prompt);
				}}
				class="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110 group-hover:opacity-100"
				aria-label="Download video"
				title="Download video"
			>
				<svg class="h-5 w-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
				</svg>
			</button>
			
			<!-- Overlay with prompt -->
			<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
				<div class="absolute bottom-0 left-0 right-0 p-4">
					<p class="text-sm font-medium text-white line-clamp-2">
						{generation.prompt}
					</p>
					<div class="mt-2 flex flex-wrap gap-2 text-xs text-white/80">
						{#if generation.model}
							<span class="rounded-full bg-white/20 px-2 py-1">{generation.model}</span>
						{/if}
						{#if generation.duration}
							<span class="rounded-full bg-white/20 px-2 py-1">{generation.duration}s</span>
						{/if}
						{#if generation.resolution}
							<span class="rounded-full bg-white/20 px-2 py-1">{generation.resolution}</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.masonry-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
		padding: 1rem;
	}
	
	@media (min-width: 768px) {
		.masonry-grid {
			grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
			gap: 2rem;
			padding: 2rem;
		}
	}
	
	@media (min-width: 1024px) {
		.masonry-grid {
			grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		}
	}
	
	.masonry-item {
		position: relative;
		aspect-ratio: 9 / 16;
		cursor: pointer;
	}
	
	/* Stagger animation for grid items */
	.masonry-item {
		animation: fadeIn 0.5s ease-out;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	/* Line clamp utility for prompt text */
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>

