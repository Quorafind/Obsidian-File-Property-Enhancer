<script lang="ts">
    import { afterUpdate, createEventDispatcher, onMount } from "svelte";
    import { setIcon, setTooltip } from "obsidian";

    export let iconName: string;
    export let idx: number;
    let iconRef: HTMLSpanElement;
    const dispatch = createEventDispatcher();

    let prevIconName: string;

    onMount(() => {
        setIcon(iconRef, iconName);
        setTooltip(iconRef, iconName);
        prevIconName = iconName;
    });

    afterUpdate(() => {
        if (prevIconName !== iconName) {
            setIcon(iconRef, iconName);
            setTooltip(iconRef, iconName);
            prevIconName = iconName;
        }
    });

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

<span role="button" tabindex={idx} class="file-property-enhancer-icon" bind:this={iconRef}
      on:click={()=>handleClick()}
      on:keypress={()=>handleClick()}></span>

<style></style>
