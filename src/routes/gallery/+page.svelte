<script lang="ts">
	import type { PageData } from './$types';
	import MasonryGrid from '$lib/components/MasonryGrid.svelte';
	
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Examples - DoodleMation</title>
	<meta name="description" content="Browse amazing AI-generated video animations created with DoodleMation" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<main class="flex-1">
		<!-- Hero Section -->
		<section class="border-b border-gray-100 bg-gradient-to-b from-violet-50 to-white py-12 md:py-16">
			<div class="container mx-auto max-w-6xl px-4 text-center">
				<h1 class="mb-4 text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
					<span class="text-violet-700">Gallery</span>
				</h1>
				<p class="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
					Explore stunning animated videos created by our community. Hover over any image to see it come to life!
				</p>
				<div class="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
					<div class="flex items-center gap-2">
						<svg class="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
						</svg>
						<span>{data.generations.length} generations</span>
					</div>
					<div class="flex items-center gap-2">
						<svg class="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
						<span>Hover to play</span>
					</div>
				</div>
			</div>
		</section>
		
		<!-- Gallery Section -->
		<section class="py-8 md:py-12">
			{#if data.generations.length > 0}
				<div class="container mx-auto max-w-7xl">
					<MasonryGrid generations={data.generations} />
				</div>
			{:else}
				<div class="container mx-auto max-w-6xl px-4 py-16 text-center">
					<div class="mx-auto max-w-md">
						<svg class="mx-auto mb-6 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
						<h2 class="mb-3 text-2xl font-bold text-gray-900">No examples yet</h2>
						<p class="mb-6 text-gray-600">
							Be the first to create an amazing AI-generated video animation!
						</p>
						<a 
							href="/" 
							class="inline-flex items-center justify-center rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-700"
						>
							Create your first video
							<svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</a>
					</div>
				</div>
			{/if}
		</section>
	</main>
</div>

