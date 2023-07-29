/// <reference types="svelte" />

type IconType = "emoji" | "lucide";

interface MetadataIcon {
	name: string;
	icon: string;
	type: IconType;
}
