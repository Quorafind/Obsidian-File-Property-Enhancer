<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { ICON_LIST } from "../../../IconList";
    import Icon from "./IconRenderer.svelte";
    import { prepareFuzzySearch } from "obsidian";
    import type { SearchResult } from "obsidian";

    let emojiRef;
    const dispatch = createEventDispatcher();

    let searchTerm: string = "";
    let filteredIconList = [...ICON_LIST];

    function select(icon: any) {
        dispatch('iconSelect', icon.detail);
    }

    function search() {
        if (searchTerm) {
            const fuzzy = prepareFuzzySearch(searchTerm.toLowerCase());

            filteredIconList = filteredIconList = ICON_LIST.filter(icon => {
                const result: SearchResult | null = fuzzy(icon);
                if (!result) {
                    return false;
                }
                if (result.score * -1 > 0.02) {
                    return false;
                }
                return true;
            });
        } else {
            filteredIconList = filteredIconList = [...ICON_LIST];
        }
    }
</script>

<div class="file-property-enhancer-icon-picker">
    <div class="icon-picker-search-container">
        <input class="icon-picker-search" type="search" bind:value={searchTerm} on:input={search}
               placeholder="Search for an icon..."/>
        <span class="icon loupe flex"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path
                d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"></path></svg></span>
    </div>
    <div class="file-property-enhancer-icon-picker-container">
        {#each filteredIconList as icon, idx}
            <Icon idx={idx} iconName={icon} on:iconClick={select}/>
        {/each}
    </div>
</div>

<style></style>
