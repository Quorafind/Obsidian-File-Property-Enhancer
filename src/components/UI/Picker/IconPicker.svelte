<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { ICON_LIST } from "../../../IconList";
    import Icon from "./IconRenderer.svelte";

    let emojiRef;
    const dispatch = createEventDispatcher();

    const iconList = ICON_LIST;

    function select(icon: any) {
        dispatch('iconSelect', icon.detail);
    }
</script>

<div class="file-property-enhancer-icon-picker">
    <div class="file-property-enhancer-icon-picker-container">
        {#each iconList as icon, idx}
            <Icon idx={idx} iconName={icon} on:iconClick={select}/>
        {/each}
    </div>
</div>

<style></style>
