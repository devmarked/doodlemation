<script lang="ts">
	import type { SavedGeneration } from '$lib/types';
	import {
		getSavedGenerations,
		deleteGeneration,
		clearAllGenerations,
		exportGenerationsAsJSON,
		importGenerationsFromJSON
	} from '$lib/utils/storageManager';
	import Button from '$lib/components/ui/Button.svelte';

	// Props
	interface Props {
		onRestore?: (imageUrl: string, prompt: string) => void;
	}
	let { onRestore }: Props = $props();

	// State
	let generations = $state<SavedGeneration[]>([]);
	let isOpen = $state(false);
	let selectedGeneration = $state<SavedGeneration | null>(null);
	let importError = $state<string | null>(null);
	let isLoading = $state(false);

	// Load generations when component mounts
	$effect(() => {
		if (typeof window !== 'undefined') {
			loadGenerations();
		}
	});

	async function loadGenerations() {
		isLoading = true;
		generations = await getSavedGenerations();
		isLoading = false;
	}

	// Reload generations when opened
	async function handleToggle() {
		isOpen = !isOpen;
		if (isOpen) {
			await loadGenerations();
		}
	}

	async function handleDelete(id: string) {
		if (confirm('Are you sure you want to delete this generation?')) {
			isLoading = true;
			await deleteGeneration(id);
			await loadGenerations();
			isLoading = false;
		}
	}

	async function handleClearAll() {
		if (confirm('Are you sure you want to delete all saved generations?')) {
			isLoading = true;
			await clearAllGenerations();
			generations = [];
			isLoading = false;
		}
	}

	async function handleExport() {
		await exportGenerationsAsJSON();
	}

	async function handleImport(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		try {
			isLoading = true;
			importError = null;
			const count = await importGenerationsFromJSON(file);
			await loadGenerations();
			alert(`Successfully imported ${count} new generation(s)`);
		} catch (error) {
			importError = error instanceof Error ? error.message : 'Failed to import file';
		} finally {
			isLoading = false;
			// Reset input
			input.value = '';
		}
	}

	function handleViewDetails(generation: SavedGeneration) {
		selectedGeneration = generation;
	}

	function handleRestore(generation: SavedGeneration) {
		onRestore?.(generation.imageUrl, generation.prompt);
		isOpen = false;
	}

	function formatDate(isoDate: string): string {
		return new Date(isoDate).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="relative">
	<!-- Toggle Button -->
	<Button onclick={handleToggle} variant="outline">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="mr-2 h-5 w-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		Saved Generations ({generations.length})
	</Button>

	<!-- Modal/Drawer -->
	{#if isOpen}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
			<div class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl">
				<!-- Header -->
				<div class="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
					<div class="flex items-center justify-between">
						<h2 class="text-2xl font-bold text-white">Saved Generations</h2>
						<button
							onclick={() => (isOpen = false)}
							class="text-white transition-colors hover:text-gray-200"
							aria-label="Close"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<!-- Action Buttons -->
					<div class="mt-4 flex flex-wrap gap-2">
						<Button onclick={handleExport} variant="secondary" disabled={generations.length === 0}>
							Export JSON
						</Button>

						<label class="cursor-pointer">
							<Button variant="secondary" disabled={false}>
								Import JSON
							</Button>
							<input
								type="file"
								accept="application/json"
								class="hidden"
								onchange={handleImport}
							/>
						</label>

						<Button
							onclick={handleClearAll}
							variant="outline"
							disabled={generations.length === 0}
						>
							Clear All
						</Button>
					</div>

					{#if importError}
						<p class="mt-2 text-sm text-red-200">{importError}</p>
					{/if}
				</div>

				<!-- Content -->
				<div class="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
					{#if isLoading}
						<div class="flex items-center justify-center py-12">
							<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
						</div>
					{:else if generations.length === 0}
						<div class="py-12 text-center text-gray-500">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mx-auto mb-4 h-16 w-16 text-gray-300"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
								/>
							</svg>
							<p class="text-lg font-medium">No saved generations yet</p>
							<p class="mt-1 text-sm">Generate videos to see them here</p>
						</div>
					{:else}
						<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each generations as generation (generation.id)}
								<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
									<!-- Image Preview -->
									<div class="relative aspect-video overflow-hidden bg-gray-100">
										<img
											src={generation.imageUrl}
											alt="Generation preview"
											class="h-full w-full object-cover"
										/>
									</div>

									<!-- Content -->
									<div class="p-4">
										<p class="mb-2 line-clamp-2 text-sm text-gray-700">
											{generation.prompt}
										</p>
										<p class="text-xs text-gray-500">
											{formatDate(generation.createdAt)}
										</p>
										{#if generation.model || generation.duration || generation.resolution}
											<p class="mt-1 text-xs text-gray-400">
												{generation.model || 'Unknown'} •
												{generation.duration ? `${generation.duration}s` : 'N/A'} •
												{generation.resolution || 'N/A'}
											</p>
										{/if}

										<!-- Actions -->
										<div class="mt-4 flex gap-2">
											<button
												onclick={() => handleViewDetails(generation)}
												class="flex-1 rounded bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
											>
												View
											</button>
											<button
												onclick={() => handleRestore(generation)}
												class="flex-1 rounded bg-green-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-green-700"
											>
												Restore
											</button>
											<button
												onclick={() => handleDelete(generation.id)}
												class="rounded bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700"
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Detail Modal -->
	{#if selectedGeneration}
		<div class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
			<div class="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-6 shadow-2xl">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-xl font-bold text-gray-900">Generation Details</h3>
					<button
						onclick={() => (selectedGeneration = null)}
						class="text-gray-500 transition-colors hover:text-gray-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<!-- Image -->
				<div class="mb-4">
					<h4 class="mb-2 text-sm font-semibold text-gray-700">Original Image</h4>
					<img
						src={selectedGeneration.imageUrl}
						alt="Original"
						class="w-full rounded-lg border border-gray-200"
					/>
				</div>

				<!-- Video -->
				{#if selectedGeneration.videoUrl}
					<div class="mb-4">
						<h4 class="mb-2 text-sm font-semibold text-gray-700">Generated Video</h4>
						<video
							src={selectedGeneration.videoUrl}
							controls
							class="w-full rounded-lg border border-gray-200"
						>
							<track kind="captions" />
						</video>
						<a
							href={selectedGeneration.videoUrl}
							download
							class="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
						>
							Download Video
						</a>
					</div>
				{/if}

				<!-- Prompt -->
				<div class="mb-4">
					<h4 class="mb-2 text-sm font-semibold text-gray-700">Prompt</h4>
					<p class="rounded-lg bg-gray-50 p-3 text-sm text-gray-900">
						{selectedGeneration.prompt}
					</p>
				</div>

				<!-- Metadata -->
				<div>
					<h4 class="mb-2 text-sm font-semibold text-gray-700">Metadata</h4>
					<dl class="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-sm">
						<dt class="font-medium text-gray-600">Created:</dt>
						<dd class="text-gray-900">{formatDate(selectedGeneration.createdAt)}</dd>
						<dt class="font-medium text-gray-600">Model:</dt>
						<dd class="text-gray-900">{selectedGeneration.model || 'Unknown'}</dd>
						<dt class="font-medium text-gray-600">Duration:</dt>
						<dd class="text-gray-900">
							{selectedGeneration.duration ? `${selectedGeneration.duration}s` : 'N/A'}
						</dd>
						<dt class="font-medium text-gray-600">Resolution:</dt>
						<dd class="text-gray-900">{selectedGeneration.resolution || 'N/A'}</dd>
					</dl>
				</div>
			</div>
		</div>
	{/if}
</div>

