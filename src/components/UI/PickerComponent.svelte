<script lang="ts">
	import Tabs from "./Tabs/Tabs.svelte";
	import TabItem from "./Tabs/TabItem.svelte";
	import EmojiPicker from "./EmojiPicker.svelte";
	import { createEventDispatcher } from "svelte";
	import IconPicker from "./IconPicker.svelte";

	let currentTab = "emoji";
	const dispatch = createEventDispatcher();

	function handleSelect(event) {
		dispatch('select', event.detail);
	}

</script>

<Tabs activeTabValue={currentTab} on:switch={currentTab}>
	<TabItem title="Emoji" icon="smile" value="emoji">
		<EmojiPicker on:emojiSelect={handleSelect}/>
	</TabItem>

	<TabItem title="Lucide" icon="image" value="lucide">
		<IconPicker on:iconSelect={handleSelect}/>
	</TabItem>
</Tabs>

<style></style>
