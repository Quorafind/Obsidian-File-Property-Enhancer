<script lang="ts">
    import { createEventDispatcher, setContext } from "svelte";
    import { writable } from "svelte/store";
    import TabIcon from "./TabIcon.svelte";

    export let activeTabValue: string;
    const items = writable([]);

    const activeTabValueStore = writable(activeTabValue);

    // 创建事件调度器
    const dispatch = createEventDispatcher();

    setContext('items', items);
    setContext('activeTabValue', activeTabValueStore);

    $: activeTabValue = $activeTabValueStore;

    // 新方法，用于更新 activeTabValue 并触发 switch 事件
    function updateActiveTab(itemValue: string) {
        $activeTabValueStore = itemValue;
        dispatch('switch', itemValue);  // 触发 switch 事件并传递 itemValue
    }
</script>

<ul class="metadata-style-tabs">
    {#each $items as item, idx}
        <li class:active={$activeTabValueStore === item.value} class="metadata-style-tab-header">
            <span class="metadata-style-tab-header-container" role="button" tabindex={idx}
                  on:click={() => updateActiveTab(item.value)} on:keypress={()=> updateActiveTab(item.value)}>
                {#if item.icon}
                    <TabIcon icon={item.icon}/>
                {/if}
                <span class="metadata-style-tab-header-content">{item.title}</span>
            </span>
        </li>
    {/each}
</ul>

<slot/>

<style></style>
