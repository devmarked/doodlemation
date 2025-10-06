<script lang="ts">
	import Button from './ui/Button.svelte';
	
	interface Props {
		onGetStarted?: () => void;
	}
	
	let { onGetStarted }: Props = $props();
	
	function handleGetStarted() {
		onGetStarted?.();
		// Scroll to main content
		const mainContent = document.getElementById('main-content');
		mainContent?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<section class="relative overflow-hidden bg-violet-50 py-12 md:py-20">
	<div class="container relative mx-auto max-w-4xl px-4">
		<div class="text-center">
			<h1 class="mb-6 text-4xl font-semibold leading-tight text-gray-900 md:text-5xl lg:text-6xl">
				Discover <span class="text-violet-700">the magic</span> of 
				<span class="text-violet-700">animated storytelling</span>
			</h1>
			
			<p class="mb-8 text-base text-gray-600 md:text-lg lg:text-xl">
				From static images to mesmerizing animations, our AI-powered platform transforms your photos into dynamic videos. Create stunning visual stories with just a prompt and watch your imagination come to life.
			</p>
			
			<Button variant="primary" onclick={handleGetStarted} class="rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl">
				Let's get started
			</Button>


		</div>
	</div>
</section>


