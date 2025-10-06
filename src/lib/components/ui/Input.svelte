<script lang="ts">
	interface Props {
		value?: string;
		placeholder?: string;
		type?: string;
		disabled?: boolean;
		error?: string;
		label?: string;
		id?: string;
	}

	let { value = $bindable(''), placeholder, type = 'text', disabled, error, label, id }: Props =
		$props();
</script>

<div class="flex flex-col gap-1">
	{#if label}
		<label for={id} class="text-sm font-medium text-gray-700">
			{label}
		</label>
	{/if}
	<input
		{id}
		{type}
		bind:value
		{placeholder}
		{disabled}
		class="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed {error
			? 'border-red-500'
			: ''}"
	/>
	{#if error}
		<p class="text-sm text-red-600">{error}</p>
	{/if}
</div>

