<script lang="ts">
	import type { VideoGenerationResult } from '$lib/types';
	import Button from './ui/Button.svelte';

	interface Props {
		result: VideoGenerationResult;
	}

	let { result }: Props = $props();

	function downloadVideo() {
		if (!result.videoUrl) return;

		const link = document.createElement('a');
		link.href = result.videoUrl;
		link.download = `animation-${Date.now()}.mp4`;
		link.click();
	}

	function shareVideo() {
		if (!result.videoUrl) return;

		if (navigator.share) {
			navigator.share({
				title: 'My DoodleMation Video',
				text: 'Check out this animated video I created!',
				url: result.videoUrl
			});
		} else {
			// Fallback: copy to clipboard
			navigator.clipboard.writeText(result.videoUrl);
			alert('Link copied to clipboard!');
		}
	}
</script>

<div class="flex flex-col gap-6 rounded-xl border-4 border-teal-300 bg-teal-50 p-6">
	<!-- Step Header -->
	<div class="flex items-center gap-3">
		<div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-300 text-lg font-bold text-teal-900">
			3
		</div>
		<h2 class="text-2xl font-bold text-teal-900">Your Animation</h2>
	</div>

	{#if result.videoUrl}
		<div class="overflow-hidden rounded-lg border-2 border-teal-400 bg-black">
			<video controls class="w-full" src={result.videoUrl}>
				<track kind="captions" />
			</video>
		</div>

		<div class="flex flex-wrap gap-2">
			<Button onclick={downloadVideo}>
				<svg
					class="mr-2 h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
					/>
				</svg>
				Download
			</Button>
			<Button onclick={shareVideo} variant="secondary">
				<svg
					class="mr-2 h-5 w-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
					/>
				</svg>
				Share
			</Button>
		</div>

		{#if result.duration || result.model}
			<div class="rounded-lg border-2 border-teal-400 bg-white p-3 text-sm text-teal-900">
				<div class="grid grid-cols-2 gap-2">
					{#if result.duration}
						<div>
							<span class="font-medium">Duration:</span>
							{result.duration}s
						</div>
					{/if}
					{#if result.model}
						<div>
							<span class="font-medium">Model:</span>
							{result.model}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	{:else}
		<div class="flex items-center justify-center rounded-lg border-2 border-dashed border-teal-400 bg-white p-12">
			<p class="text-teal-700">Your video will appear here</p>
		</div>
	{/if}
</div>

