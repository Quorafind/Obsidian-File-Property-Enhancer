import type { MetadataIcon } from "./types/global";

type StyleOption = "solid" | "gradient";
export type BannerDragModOption = "none" | "shift" | "ctrl" | "alt" | "meta";
type IconHorizontalOption = "left" | "center" | "right" | "custom";
type IconVerticalOption = "above" | "center" | "below" | "custom";
type TitlePlacementOption = "below-icon" | "next-to-icon";

export interface filePropertyEnhancerSettings {
	iconList: MetadataIcon[];
	banners: {
		height: number | null;
		style: StyleOption;
		holdingDragModKey: boolean;
		frontmatterField: string;
		bannerDragModifier: BannerDragModOption;
		iconHorizontalAlignment: IconHorizontalOption;
		iconHorizontalTransform: string | null;
		iconVerticalAlignment: IconVerticalOption;
		iconVerticalTransform: string | null;
		useTwemoji: boolean;
		showInInternalEmbed: boolean;
		showInPreviewEmbed: boolean;
		internalEmbedHeight: number | null;
		previewEmbedHeight: number | null;
		showPreviewInLocalModal: boolean;
		localSuggestionsLimit: number | null;
		bannersFolder: string | null;
		allowMobileDrag: boolean;
		titlePlacement: TitlePlacementOption;
	}
}

export const DEFAULT_SETTINGS: filePropertyEnhancerSettings = {
	iconList: [],
	banners: {
		height: 320,
		bannerDragModifier: "alt",
		holdingDragModKey: false,
		style: "solid",
		showInInternalEmbed: true,
		showInPreviewEmbed: true,
		iconHorizontalAlignment: "left",
		iconVerticalAlignment: "center",
		useTwemoji: false,
		showPreviewInLocalModal: true,
		allowMobileDrag: false,
		titlePlacement: "below-icon",
		internalEmbedHeight: 200,
		previewEmbedHeight: 120,
		frontmatterField: "banner",
		iconHorizontalTransform: "0px",
		iconVerticalTransform: "0px",
		localSuggestionsLimit: 10,
		bannersFolder: "/",
	}
};
