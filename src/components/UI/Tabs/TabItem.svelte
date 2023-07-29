<script lang="ts">
    import { getContext, onMount } from "svelte";

    export let title = "";
    export let icon = "";
    export let value = Symbol();

    const items: any = getContext("items");
    const activeTabValue: any = getContext("activeTabValue");

    onMount(() => {
        if (!$activeTabValue) {
            $activeTabValue = value;
        }

        const item = {title, value, icon};
        $items = [...$items, item];
        return () => {
            $items = $items.splice($items.indexOf(item), 1);
        };
    });

</script>

{#if $activeTabValue === value}
    <slot/>
{/if}
