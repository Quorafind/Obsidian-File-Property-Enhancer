import { MarkdownView, WorkspaceLeaf } from "obsidian";

export const removeBanners = (leaf: WorkspaceLeaf) => {
	const bannerEl = (leaf.view as MarkdownView).contentEl.querySelector(
		".obsidian-banner",
	);
	const bannerHeaderEl = (leaf.view as MarkdownView).contentEl.querySelector(
		".obsidian-banner-header",
	);
	if (bannerEl) bannerEl.remove();
	if (bannerHeaderEl) bannerHeaderEl.remove();
};
