<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { ICON_LIST } from "../../IconList";
    import Icon from "./Icon.svelte";

    let emojiRef;
    const dispatch = createEventDispatcher();

    const iconList = ICON_LIST;

    function select(icon) {
        dispatch('iconSelect', icon.detail);
    }
</script>

<div class="metadata-style-icon-picker">
    <div class="metadata-style-icon-picker-container">
        {#each iconList as icon, idx}
            <Icon iconName={icon} on:iconClick={select}/>
        {/each}
    </div>
</div>

<style></style>
