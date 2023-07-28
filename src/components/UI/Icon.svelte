<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { setIcon } from "obsidian";

	export let iconName;
	let iconRef;
	const dispatch = createEventDispatcher();

	onMount(() => {
		setIcon(iconRef, iconName);
	})

	function iconClick(icon) {
		dispatch('iconClick', icon);
	}
</script>

<span class="metadata-style-icon-picker-icon" bind:this={iconRef} on:click={()=>{
	iconClick({
		icon: iconName,
		type: "lucide",
	})
}}></span>

<style></style>
