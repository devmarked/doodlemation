<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary' | 'outline';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		onclick?: () => void;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		children?: any;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		onclick,
		type = 'button',
		class: customClass = '',
		children
	}: Props = $props();

	const variantClasses = {
		primary: 'bg-violet-700 text-white hover:bg-violet-800 disabled:bg-violet-300 shadow-md hover:shadow-lg',
		secondary: 'bg-white text-violet-700 hover:bg-violet-50 disabled:bg-gray-100 disabled:text-gray-400 shadow-md',
		outline:
			'border-2 border-violet-700 text-violet-700 hover:bg-violet-50 disabled:border-violet-300 disabled:text-violet-300'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};
</script>

<button
	{type}
	class="inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed {variantClasses[
		variant
	]} {sizeClasses[size]} {customClass}"
	{disabled}
	onclick={onclick}
>
	{#if loading}
		<span class="inline-flex items-center gap-2">
			<svg
				class="h-4 w-4 animate-spin"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle
					class="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			Loading...
		</span>
	{:else}
		{@render children?.()}
	{/if}
</button>

