<script lang="ts">
    import Tabs from "./Tabs/Tabs.svelte";
    import TabItem from "./Tabs/TabItem.svelte";
    import EmojiPicker from "./Picker/EmojiPicker.svelte";
    import IconPicker from "./Picker/IconPicker.svelte";
    import { createEventDispatcher } from "svelte";

    let currentTab = "emoji";
    const dispatch = createEventDispatcher();

    function handleSelect(event: any) {
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
