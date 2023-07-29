<script lang="ts">
    import { Picker } from "emoji-mart";
    import data from "@emoji-mart/data";
    import { createEventDispatcher, onMount } from "svelte";

    let emojiRef: HTMLDivElement;
    const dispatch = createEventDispatcher();

    onMount(() => {
        const emojiPicker = new Picker({
            data: data,
            onEmojiSelect: select,
        });
        emojiRef.append(emojiPicker as unknown as Node);
    })

    function select(emoji: any) {
        dispatch('emojiSelect', {
            emoji: emoji,
            type: "emoji"
        });
    }
</script>

<div bind:this={emojiRef}></div>

<style></style>
