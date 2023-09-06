/// <reference types="svelte" />

import Banner from "../components/Banner";
import Header from "../components/Header";

type IconType = "emoji" | "lucide";

interface MetadataIcon {
	name: string;
	icon: string;
	type: IconType;
}

export interface IBannerMetadata {
	src: string;
	x: number;
	y: number;
	icon: string;
	lock: boolean;
	title: string;
}

type BannerMetadataKey = keyof IBannerMetadata;

export interface ILeafBanner {
	leafID: string;
	filePath: string;
	banner: Banner;
	header: Header;
}
