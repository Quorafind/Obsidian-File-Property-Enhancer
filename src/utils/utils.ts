import { PickerModal } from "../components/Picker";
import { ExtraButtonComponent } from "obsidian";
import FilePropertyEnhancerPlugin from "../filePropertyEnhancerIndex";
import type { IconType, MetadataIcon } from "../types/global";

type IconRenderType = "file-property" | "all-properties";

export const createModal = (context: FilePropertyEnhancerPlugin, property: any) => {
	return new PickerModal(context, context.app, property, async (selected) => {
		console.log(property);
		const icon = {
			name: property?.entry?.key || property?.property.key,
			icon: selected.emoji ? selected.emoji.native : selected.icon,
			type: selected.type as IconType,
		};
		await saveIcon(context, icon);
		setPropertyIcon(property, icon, "file-property");
		context.app.metadataTypeManager.trigger("changed", property?.entry?.key || property?.property.key);
	});
};

export const removeIcon = async (context: FilePropertyEnhancerPlugin, property: any) => {
	const icon = getIcon(context, property?.entry?.key || property?.property.key);
	if (icon) {
		const index = context.settings.iconList.findIndex((item) => item.name === icon.name);
		if (index !== -1) {
			context.settings.iconList.splice(index, 1);
			await context.saveSettings();
		}
	}
	console.log(property);
	property.iconEl.empty();
	property.renderProperty(property.entry, true);
};

export const setPropertyIcon = (property: any, icon: MetadataIcon, renderedType: IconRenderType) => {
	switch (icon.type) {
		case "emoji":
			return renderEmojiIcon(property, icon, renderedType);
		case "lucide":
			return renderLucideIcon(property, icon, renderedType);
	}
};

export const saveIcon = async (context: FilePropertyEnhancerPlugin, icon: MetadataIcon) => {
	const index = context.settings.iconList.findIndex((item) => item.name === icon.name);
	if (index !== -1) {
		context.settings.iconList[index] = icon;
	} else {
		context.settings.iconList.push(icon);
	}
	await context.saveSettings();
};

export const getIcon = (context: FilePropertyEnhancerPlugin, key: string): MetadataIcon | null => {
	const index = context.settings.iconList.findIndex((item) => item.name === key);
	if (index !== -1) {
		return context.settings.iconList[index];
	} else {
		return null;
	}
};

export const renderEmojiIcon = (property: any, icon: MetadataIcon, type: IconRenderType) => {
	const button = createIconBase(property, type);
	button.extraSettingsEl.empty();
	button.extraSettingsEl.createSpan({text: icon.icon});
	return button;
};

export const renderLucideIcon = (property: any, icon: MetadataIcon, type: IconRenderType) => {
	const button = createIconBase(property, type);
	button.setIcon(icon.icon);
	return button;
};

export const createIconBase = (property: any, type: IconRenderType) => {
	property.iconEl.empty();

	const button = new ExtraButtonComponent(property.iconEl.createSpan());
	button.setTooltip(`Current Type: ${type === "file-property" ? property?.typeInfo?.inferred.type : property?.property?.type}`);
	button.extraSettingsEl.toggleClass(["setting-editor-extra-setting-button"], false);
	button.extraSettingsEl.toggleClass(["metadata-style-icon"], true);

	return button;
};
