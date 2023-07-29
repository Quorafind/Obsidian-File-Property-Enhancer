<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { setIcon } from "obsidian";

    export let iconName;
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

    function iconClick(icon: any) {
        dispatch('iconClick', icon);
    }
</script>

<span class="metadata-style-icon-picker-icon" bind:this={iconRef} on:click={()=>handleClick()}
      on:keypress={()=>handleClick()}></span>

<style></style>
