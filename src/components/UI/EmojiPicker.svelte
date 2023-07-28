<script lang="ts">
	import { Picker } from "emoji-mart";
	import data from "@emoji-mart/data";
	import { onMount } from "svelte";

	let emojiRef;

	onMount(() => {
		console.log(data);
		const emojiPicker = new Picker({
			data: data,
			onEmojiSelect: select,
		});
		emojiRef.append(emojiPicker);
	})

	function select(emoji) {
		console.log(emoji);
	}
</script>

<div bind:this={emojiRef}></div>

<style></style>
