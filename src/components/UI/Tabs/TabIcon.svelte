<script lang="ts">
    import { onMount } from "svelte";
    import { setIcon } from "obsidian";

    export let icon = "smile";
    let iconRef: HTMLSpanElement;

    onMount(() => {
        setIcon(iconRef, icon);
    })
</script>

<span class="file-property-enhancer-tab-header-icon" bind:this={iconRef}></span>

<style></style>
