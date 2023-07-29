<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { setIcon } from "obsidian";

    export let iconName;
    export let idx: number;
    let iconRef;
    const dispatch = createEventDispatcher();

    onMount(() => {
        setIcon(iconRef, iconName);
    })

    function handleClick() {
        iconClick({
            icon: iconName,
            type: "lucide",
        })
    }

    function iconClick(icon) {
        dispatch('iconClick', icon);
    }
</script>

<span role="button" tabindex={idx} class="metadata-style-icon-picker-icon" bind:this={iconRef}
      on:click={()=>handleClick()}
      on:keypress={()=>handleClick()}></span>

<style></style>
