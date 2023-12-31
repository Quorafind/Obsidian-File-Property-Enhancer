import { PickerModal } from "../components/Picker";
import { ExtraButtonComponent } from "obsidian";
import FilePropertyEnhancerPlugin from "../filePropertyEnhancerIndex";
import type { IconType, MetadataIcon } from "../types/global";

type IconRenderType = "file-property" | "all-properties";

export const createModal = (context: FilePropertyEnhancerPlugin, property: any) => {
	return new PickerModal(context.app, async (selected) => {
		const icon = {
			name: property?.entry?.key || property?.property.key,
			icon: selected.emoji ? selected.emoji.native : selected.icon,
			type: selected.type as IconType,
		}
		await saveIcon(context, icon);
		context.app.metadataTypeManager.trigger("changed", property?.entry?.key || property?.property.key);
	});
}

export const setPropertyIcon = (property: any, icon: MetadataIcon, renderedType: IconRenderType) => {
	switch (icon.type) {
		case "emoji":
			return renderEmojiIcon(property, icon, renderedType);
		case "lucide":
			return renderLucideIcon(property, icon, renderedType);
	}
}

export const saveIcon = async (context: FilePropertyEnhancerPlugin, icon: MetadataIcon) => {
	const index = context.settings.iconList.findIndex((item) => item.name === icon.name);
	if (index !== -1) {
		context.settings.iconList[index] = icon;
	} else {
		context.settings.iconList.push(icon);
	}
	await context.saveSettings();
}

export const getIcon = (context: FilePropertyEnhancerPlugin, key: string): MetadataIcon | null => {
	const index = context.settings.iconList.findIndex((item) => item.name === key);
	if (index !== -1) {
		return context.settings.iconList[index];
	} else {
		return null;
	}
}

export const renderEmojiIcon = (property: any, icon: MetadataIcon, type: IconRenderType) => {
	const button = createIconBase(property, type);
	button.extraSettingsEl.empty();
	button.extraSettingsEl.createSpan({text: icon.icon})
	return button;
}

export const renderLucideIcon = (property: any, icon: MetadataIcon, type: IconRenderType) => {
	const button = createIconBase(property, type);
	button.setIcon(icon.icon);
	return button;
}

export const createIconBase = (property: any, type: IconRenderType) => {
	property.iconEl.empty();

	const button = new ExtraButtonComponent(property.iconEl.createSpan());
	button.setTooltip(`Current Type: ${type === "file-property" ? property?.typeInfo?.inferred.type : property?.property?.type}`);
	button.extraSettingsEl.toggleClass(["setting-editor-extra-setting-button"], false);
	button.extraSettingsEl.toggleClass(["metadata-style-icon"], true);

	return button;
}
