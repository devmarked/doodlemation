<script lang="ts">
	import { debounce } from '$lib/utils/debounce';
	import Button from './ui/Button.svelte';
	import ErrorMessage from './ui/ErrorMessage.svelte';

	interface Props {
		disabled?: boolean;
		onPromptReady: (prompt: string) => void;
	}

	let { disabled = false, onPromptReady }: Props = $props();

	let imageDescription = $state('');
	let animationDetails = $state('');
	let generatedPrompt = $state('');
	let isGenerating = $state(false);
	let error = $state<string | null>(null);
	let showGenerated = $state(false);

	const imageDescValid = $derived(imageDescription.trim().length >= 5);
	const animationValid = $derived(animationDetails.trim().length >= 10);
	const isValid = $derived(imageDescValid); // Only imageDescription is required
	const charCount = $derived(generatedPrompt.length);

	async function generatePrompt() {
		if (!isValid) return;

		error = null;
		isGenerating = true;

		try {
			const response = await fetch('/api/prompt', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					imageDescription: imageDescription.trim(),
					animationDetails: animationDetails.trim()
				})
			});

			if (!response.ok) {
				throw new Error('Failed to generate prompt');
			}

			const data = await response.json();
			generatedPrompt = data.enhanced;
			showGenerated = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to generate prompt';
		} finally {
			isGenerating = false;
		}
	}

	function usePrompt() {
		if (generatedPrompt.trim()) {
			onPromptReady(generatedPrompt);
		}
	}
</script>

<div class="flex flex-col gap-6 rounded-xl border-4 border-amber-300 bg-amber-50 p-6">
	<!-- Step Header -->
	<div class="flex items-center gap-3">
		<div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-300 text-lg font-bold text-amber-900">
			2
		</div>
		<h2 class="text-2xl font-bold text-amber-900">Describe Animation</h2>
	</div>

	{#if error}
		<ErrorMessage message={error} onRetry={generatePrompt} />
	{/if}

	{#if !showGenerated}
		<!-- Input fields for prompt generation -->
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<label for="imageDescription" class="text-sm font-medium text-amber-900">
					What did you draw?
				</label>
				<input
					id="imageDescription"
					type="text"
					bind:value={imageDescription}
					{disabled}
					placeholder="Example: A golden retriever sitting on a beach"
					class="rounded-lg border-2 border-amber-400 bg-white p-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
				/>
				{#if imageDescription.length > 0 && !imageDescValid}
					<span class="text-xs text-orange-700">Minimum 5 characters</span>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label for="animationDetails" class="text-sm font-medium text-amber-900">
					Describe the motion and details you want to see <span class="text-amber-600">(optional)</span>
				</label>
				<textarea
					id="animationDetails"
					bind:value={animationDetails}
					{disabled}
					placeholder="Example: The dog's tail should wag excitedly, waves gently rolling in the background, sunset lighting with warm golden hues (leave blank for creative suggestions)"
					rows="3"
					class="rounded-lg border-2 border-amber-400 bg-white p-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
				></textarea>
				{#if animationDetails.length > 0 && !animationValid}
					<span class="text-xs text-orange-700">Minimum 10 characters if provided</span>
				{/if}
			</div>
		</div>

		<Button
			onclick={generatePrompt}
			disabled={!isValid || disabled || isGenerating}
			loading={isGenerating}
			variant="primary"
		>
			Generate Prompt
		</Button>
	{/if}

	{#if showGenerated}
		<!-- Generated prompt editor -->
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<label for="generatedPrompt" class="text-sm font-medium text-amber-900">
					Generated Prompt (editable)
				</label>
				<button
					onclick={() => {
						showGenerated = false;
						generatedPrompt = '';
					}}
					class="text-xs text-amber-700 hover:text-amber-900 underline"
				>
					Start over
				</button>
			</div>
			<textarea
				id="generatedPrompt"
				bind:value={generatedPrompt}
				{disabled}
				rows="8"
				class="rounded-lg border-2 border-amber-400 bg-white p-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
			></textarea>
			<div class="flex items-center justify-between text-sm">
				<span class="text-amber-800">{charCount} characters</span>
				<span class="text-amber-800">
					{#if charCount < 10}
						<span class="text-orange-700 font-medium">Too short</span>
					{:else}
						<span class="text-green-700 font-medium">✓ Valid</span>
					{/if}
				</span>
			</div>
		</div>

		<Button
			onclick={usePrompt}
			disabled={charCount < 10 || disabled}
			variant="primary"
		>
			Use This Prompt
		</Button>
	{/if}
</div>

