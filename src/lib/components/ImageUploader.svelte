<script lang="ts">
	import { compressImage, validateImageFile } from '$lib/utils/imageCompression';
	import Button from './ui/Button.svelte';
	import ErrorMessage from './ui/ErrorMessage.svelte';
	import Spinner from './ui/Spinner.svelte';

	interface Props {
		onUpload: (url: string, file: File) => void;
	}

	let { onUpload }: Props = $props();

	let isDragging = $state(false);
	let isUploading = $state(false);
	let error = $state<string | null>(null);
	let uploadedFile = $state<{ name: string; size: number; preview: string } | null>(null);
	let fileInput: HTMLInputElement;

	async function handleFile(file: File) {
		error = null;
		let previewUrl: string | null = null;

		// Validate file
		const validation = validateImageFile(file);
		if (!validation.valid) {
			error = validation.error || 'Invalid file';
			return;
		}

		try {
			isUploading = true;

			// Create preview
			previewUrl = URL.createObjectURL(file);

			// Compress image
			const compressed = await compressImage(file);
			const compressedFile = new File([compressed], file.name, { type: 'image/jpeg' });

			// Upload to server
			const formData = new FormData();
			formData.append('file', compressedFile);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Upload failed');
			}

			const data = await response.json();
			uploadedFile = { name: file.name, size: file.size, preview: previewUrl };
			onUpload(data.url, compressedFile);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to upload image';
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
			uploadedFile = null;
		} finally {
			isUploading = false;
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const file = e.dataTransfer?.files[0];
		if (file) {
			handleFile(file);
		}
	}

	function handleFileInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			handleFile(file);
		}
	}
</script>

<div class="flex flex-col gap-6 rounded-xl border-4 border-violet-700 bg-violet-50 p-6">
	<!-- Step Header -->
	<div class="flex items-center gap-3">
		<div class="flex h-10 w-10 items-center justify-center rounded-full bg-violet-700 text-lg font-bold text-white">
			1
		</div>
		<h2 class="text-2xl font-bold text-violet-900">Upload Image</h2>
	</div>

	{#if error}
		<ErrorMessage message={error} onRetry={() => (error = null)} />
	{/if}

	<div
		role="button"
		tabindex="0"
		class="relative rounded-lg border-2 border-dashed transition-colors {isDragging
			? 'border-violet-700 bg-violet-100'
			: 'border-violet-400 bg-white'}"
		ondragover={(e) => {
			e.preventDefault();
			isDragging = true;
		}}
		ondragleave={() => (isDragging = false)}
		ondrop={handleDrop}
	>
		{#if isUploading}
			<div class="flex flex-col items-center justify-center gap-4 py-12">
				<Spinner size="lg" />
				<p class="text-violet-800">Compressing and uploading...</p>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center gap-4 p-12">
				<svg
					class="h-16 w-16 text-violet-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
					/>
				</svg>
				<div class="text-center">
					<p class="text-lg font-medium text-violet-900">Drop your image here</p>
					<p class="text-sm text-violet-700">or click to browse</p>
				</div>
				<Button onclick={() => fileInput.click()}>Choose File</Button>
				<p class="text-xs text-violet-600">Supports: JPEG, PNG, WebP (max 10MB)</p>
				
				{#if uploadedFile}
					<div class="mt-2 flex items-center gap-3 rounded-md border border-violet-300 bg-violet-100 px-3 py-2">
						<svg class="h-5 w-5 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<div class="flex-1 text-sm">
							<p class="font-medium text-violet-900">{uploadedFile.name}</p>
							<p class="text-violet-700">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
						</div>
						<img 
							src={uploadedFile.preview} 
							alt="Preview" 
							class="h-12 w-12 flex-shrink-0 rounded border-2 border-violet-300 object-cover"
						/>
						<button
							aria-label="Remove uploaded image"
							onclick={() => {
								if (uploadedFile?.preview) {
									URL.revokeObjectURL(uploadedFile.preview);
								}
								uploadedFile = null;
								error = null;
							}}
							class="flex-shrink-0 text-violet-600 hover:text-violet-900"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/if}
			</div>
		{/if}

		<input
			bind:this={fileInput}
			type="file"
			accept="image/jpeg,image/png,image/webp"
			onchange={handleFileInput}
			class="hidden"
		/>
	</div>
</div>

