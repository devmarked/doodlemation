<script lang="ts">
	import Button from './ui/Button.svelte';
	
	let mobileMenuOpen = $state(false);
	let allPagesOpen = $state(false);
</script>

<header class="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
	<div class="container mx-auto max-w-6xl px-4">
		<div class="flex h-16 items-center justify-between md:h-20">
			<!-- Logo -->
			<a href="/" class="text-2xl font-bold text-gray-900 md:text-3xl">
				doodle<span class="text-violet-700">mation</span>
			</a>

			<!-- Desktop Navigation -->
			<nav class="hidden items-center gap-8 md:flex">
				<a href="/" class="text-sm font-medium text-gray-700 hover:text-gray-900">Home</a>
				<a href="/gallery" class="text-sm font-medium text-gray-700 hover:text-gray-900">Gallery</a>
			</nav>

			<!-- Right side: CTA -->
			<div class="hidden items-center gap-4 md:flex">
				<div class="relative">
					<svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
					<span class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-violet-700 text-xs font-semibold text-white">
						0
					</span>
				</div>
				<Button variant="primary" onclick={() => {}}>
					Contact us
					<svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</Button>
			</div>

			<!-- Mobile menu button -->
			<button 
				class="md:hidden" 
				onclick={() => mobileMenuOpen = !mobileMenuOpen}
				aria-label="Toggle menu"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{#if mobileMenuOpen}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="border-t border-gray-100 pb-4 pt-2 md:hidden">
				<nav class="flex flex-col gap-2">
					<a href="/" class="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Home</a>
					<a href="/examples" class="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Examples</a>
					<a href="#features" class="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Features</a>
					<a href="#about" class="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">About</a>
					<a href="/saved" class="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Saved Generations</a>
					<Button variant="primary" onclick={() => {}} class="mt-2">
						Contact us
					</Button>
				</nav>
			</div>
		{/if}
	</div>
</header>

