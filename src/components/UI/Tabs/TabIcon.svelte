<script lang="ts">
	import { onMount } from "svelte";
	import { setIcon } from "obsidian";

	export let icon = "smile";
	let iconRef;

	onMount(() => {
		setIcon(iconRef, icon);
	})
</script>

<span class="metadata-style-tab-header-icon" bind:this={iconRef}></span>

<style></style>
