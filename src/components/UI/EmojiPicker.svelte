<script lang="ts">
    import { Picker } from "emoji-mart";
    import data from "@emoji-mart/data";
    import { createEventDispatcher, onMount } from "svelte";

    let emojiRef;
    const dispatch = createEventDispatcher();

    onMount(() => {
        const emojiPicker = new Picker({
            data: data,
            onEmojiSelect: select,
        });
        emojiRef.append(emojiPicker);
    })

    function select(emoji) {
        dispatch('emojiSelect', {
            emoji: emoji,
            type: "emoji"
        });
    }
</script>

<div bind:this={emojiRef}></div>

<style></style>
