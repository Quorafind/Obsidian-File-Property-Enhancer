<script>
	import {setContext} from "svelte";
	import {writable} from "svelte/store";

	export let activeTabValue;
	const items = writable([]);

	const activeTabValueStore = writable(activeTabValue);

	setContext('items', items);
	setContext('activeTabValue', activeTabValueStore);

	$: activeTabValue = $activeTabValueStore;
</script>

<ul>
	{#each $items as item}
		<li class:active={$activeTabValueStore === item.value}>
            <span role="button" on:click={() => $activeTabValueStore = item.value}>
                {#if item.icon}
                    <i class={item.icon}></i>
                {/if}
				{item.title}
            </span>
		</li>
	{/each}
</ul>

<slot/>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		padding-left: 0;
		margin-bottom: 0;
		list-style: none;
		border-bottom: 1px solid #dee2e6;
	}

	li {
		margin-bottom: -1px;
	}

	span {
		border: 1px solid transparent;
		border-top-left-radius: 0.25rem;
		border-top-right-radius: 0.25rem;
		display: block;
		padding: 0.5rem 1rem;
		cursor: pointer;
	}

	span:hover {
		border-color: #e9ecef #e9ecef #dee2e6;
	}

	li.active > span {
		color: #495057;
		background-color: #fff;
		border-color: #dee2e6 #dee2e6 #fff;
	}
</style>
