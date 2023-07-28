<script lang="ts">
	import Tabs from "./Tabs/Tabs.svelte";
	import TabItem from "./Tabs/TabItem.svelte";
	import EmojiPicker from "./EmojiPicker.svelte";

	let emojiRef;
	let currentTab = "emoji";

</script>

<Tabs activeTabValue={currentTab}>
	<TabItem title="General Data" value="emoji">
		<EmojiPicker/>
	</TabItem>

	<TabItem title="Invoice" icon="ti ti-receipt" value="lucide">
		Content for Invoice tab...
	</TabItem>
</Tabs>

<style></style>
