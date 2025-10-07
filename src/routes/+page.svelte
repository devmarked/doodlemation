<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import ImageUploader from '$lib/components/ImageUploader.svelte';
	import PromptEditor from '$lib/components/PromptEditor.svelte';
	import VideoPreview from '$lib/components/VideoPreview.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import type { VideoGenerationResult, GenerationStatus } from '$lib/types';
	import { measurePerformance } from '$lib/utils/performance';
	import { saveGeneration } from '$lib/utils/storageManager';

	// Application state
	let uploadedImageUrl = $state<string | null>(null);
	let uploadedImageFile = $state<File | null>(null);
	let selectedPrompt = $state<string | null>(null);
	let generationStatus = $state<GenerationStatus>('idle');
	let videoResult = $state<VideoGenerationResult | null>(null);
	let error = $state<string | null>(null);
	let currentPredictionId = $state<string | null>(null);

	// Derived states
	const canGenerate = $derived(
		uploadedImageUrl && selectedPrompt && generationStatus !== 'processing'
	);
	const showVideoPreview = $derived(
		generationStatus === 'complete' && videoResult?.videoUrl && videoResult !== null
	);

	function handleImageUpload(url: string, file: File) {
		uploadedImageUrl = url;
		uploadedImageFile = file;
		console.log('Image uploaded:', url);
	}

	function handlePromptReady(prompt: string) {
		selectedPrompt = prompt;
		console.log('Prompt ready:', prompt);
	}

	function handleRestore(imageUrl: string, prompt: string) {
		uploadedImageUrl = imageUrl;
		selectedPrompt = prompt;
		generationStatus = 'idle';
		videoResult = null;
		error = null;
	}

	async function pollPredictionStatus(predictionId: string) {
		const maxAttempts = 120; // 120 attempts = 10 minutes max (5 second intervals)
		let attempts = 0;

		while (attempts < maxAttempts) {
			try {
				const response = await fetch(`/api/status/${predictionId}`);
				
				if (!response.ok) {
					throw new Error('Failed to check status');
				}

				const data = await response.json();
				console.log('Status check:', data);

				if (data.status === 'succeeded' && data.videoUrl) {
					// Video generation complete!
					return {
						success: true,
						videoUrl: data.videoUrl,
						predictionId: data.predictionId
					};
				} else if (data.status === 'failed' || data.status === 'canceled') {
					throw new Error(data.error || 'Video generation failed');
				}

				// Still processing, wait 5 seconds before next check
				await new Promise(resolve => setTimeout(resolve, 5000));
				attempts++;
			} catch (err) {
				console.error('Status check error:', err);
				throw err;
			}
		}

		throw new Error('Video generation timed out');
	}

	async function generateVideo() {
		if (!uploadedImageUrl || !selectedPrompt) return;

		error = null;
		generationStatus = 'processing';
		const perf = measurePerformance('video-generation');

		try {
			// Start video generation (returns prediction ID immediately)
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					imageUrl: uploadedImageUrl,
					prompt: selectedPrompt,
					duration: 6, // 6 seconds for testing
					resolution: '512p', // 512p for testing
					promptOptimizer: false // Disable prompt optimizer (we use ChatGPT)
				})
			});

			if (!response.ok) {
				throw new Error('Failed to start video generation');
			}

			const data = await response.json();
			console.log('Generation started:', data);

			if (!data.success || !data.predictionId) {
				throw new Error('Failed to start video generation');
			}

			currentPredictionId = data.predictionId;

			// Poll for completion
			const result = await pollPredictionStatus(data.predictionId);

			videoResult = {
				success: true,
				videoUrl: result.videoUrl,
				predictionId: result.predictionId,
				model: 'minimax/hailuo-02'
			};
			generationStatus = 'complete';

			// Auto-save the generation
			if (uploadedImageUrl && selectedPrompt && result.videoUrl) {
				saveGeneration(
					uploadedImageUrl,
					result.videoUrl,
					selectedPrompt,
					data.model || 'minimax/hailuo-02',
					data.duration,
					data.resolution
				);
			}

			perf.end();
		} catch (err) {
			console.error('Generation error:', err);
			error = err instanceof Error ? err.message : 'Failed to generate video';
			generationStatus = 'failed';
		}
	}

	function resetAndStartOver() {
		uploadedImageUrl = null;
		uploadedImageFile = null;
		selectedPrompt = null;
		generationStatus = 'idle';
		videoResult = null;
		error = null;
		currentPredictionId = null;
	}
</script>

<svelte:head>
	<title>DoodleMation - Transform Images into Animated Videos</title>
	<meta
		name="description"
		content="Upload an image and create stunning animated videos using AI"
	/>
</svelte:head>

<!-- Hero Section -->
<Hero />

<!-- Main Application Content -->
<div id="main-content" class="min-h-screen bg-violet-50 py-12">
	<div class="container mx-auto max-w-6xl px-4">
		<!-- Error Message -->
		{#if error}
			<div class="mb-6">
				<ErrorMessage message={error} onRetry={() => (error = null)} />
			</div>
		{/if}

		<!-- Main Content -->
		{#if generationStatus === 'processing'}
			<div class="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 p-12">
				<div class="flex flex-col items-center justify-center gap-6">
					<Spinner size="lg" />
					<h2 class="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent animate-pulse">
						✨ Generating Your Video... ✨
					</h2>
					
					<!-- Fun looping video -->
					<div class="my-4 overflow-hidden rounded-xl">
						<video
							autoplay
							loop
							muted
							playsinline
							class="h-auto w-full max-w-sm"
							src="https://zecemnsmhxacyhbcofzm.supabase.co/storage/v1/object/public/user-videos/anonymous/1759747680302-generated.mp4"
						>
							<track kind="captions" />
						</video>
					</div>
					
					<p class="text-center text-lg text-gray-700">
						🎬 Hang tight! Your masterpiece is being crafted...
						<br />
						<span class="text-sm text-gray-500">This usually takes 1-2 minutes</span>
					</p>
					
					<div class="mt-2 w-full max-w-md">
						<div class="h-2 w-full overflow-hidden rounded-full bg-violet-200">
							<div class="h-full animate-pulse bg-gradient-to-r from-violet-600 to-purple-600" style="width: 60%"></div>
						</div>
					</div>
				</div>
			</div>
		{:else if showVideoPreview && videoResult}
			<div class="rounded-2xl bg-white p-8">
				<VideoPreview result={videoResult} />
				<div class="mt-6 text-center">
					<Button onclick={resetAndStartOver} variant="outline">
						Create Another Animation
					</Button>
				</div>
			</div>
		{:else}
			<div class="mx-auto max-w-3xl space-y-6">
				<!-- Step 1: Upload Image -->
				<ImageUploader onUpload={handleImageUpload} />

				<!-- Step 2: Describe Animation -->
				<PromptEditor disabled={!uploadedImageUrl} onPromptReady={handlePromptReady} />

				<!-- Generate Button -->
				{#if selectedPrompt}
					<div class="flex flex-col gap-6 rounded-xl border-4 border-green-400 bg-green-50 p-6">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-400 text-lg font-bold text-green-900">
								✓
							</div>
							<h2 class="text-2xl font-bold text-green-900">Ready to Generate!</h2>
						</div>
						<p class="text-sm text-green-800">
							<span class="font-medium">Your prompt:</span> "{selectedPrompt.length > 100 ? selectedPrompt.substring(0, 100) + '...' : selectedPrompt}"
						</p>
						<Button
							onclick={generateVideo}
							disabled={!canGenerate}
							loading={false}
							variant="primary"
						>
							Generate Video
						</Button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
