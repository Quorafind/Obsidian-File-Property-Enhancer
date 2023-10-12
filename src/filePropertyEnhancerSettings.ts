import type { MetadataIcon } from "./types/global";

export interface filePropertyEnhancerSettings {
	iconList: MetadataIcon[];
}

export const DEFAULT_SETTINGS: filePropertyEnhancerSettings = {
	iconList: [],
};
