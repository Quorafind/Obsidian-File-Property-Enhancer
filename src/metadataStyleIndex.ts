import { ExtraButtonComponent, Plugin } from 'obsidian';
import { around } from "monkey-around";
import { PickerModal } from "./components/Picker";
import "./styles/custom.css";

type IconType = "emoji" | "lucide";

interface MetadataIcon {
	name: string;
	icon: string;
	type: IconType;
}

interface metadataStyleSettings {
	iconList: MetadataIcon[];
}

const DEFAULT_SETTINGS: metadataStyleSettings = {
	iconList: []
}

export default class MetadataStylePlugin extends Plugin {
	settings: metadataStyleSettings;

	async onload() {
		await this.loadSettings();

		this.patchMetadata();
	}

	onunload() {

	}

	patchMetadata() {
		const createModal = (property: any) => {
			return new PickerModal(this.app, (selected) => {
				const icon = {
					name: property.entry.key,
					icon: selected.emoji ? selected.emoji.native : selected.icon,
					type: selected.type as IconType,
				}
				saveIconToList(icon);
				this.app.metadataTypeManager.trigger("changed", property.entry.key);
			});
		}

		const saveIconToList = (icon: MetadataIcon) => {
			// Check if have same name in icon list;
			const index = this.settings.iconList.findIndex((item) => item.name === icon.name);
			if (index !== -1) {
				this.settings.iconList[index] = icon;
			} else {
				this.settings.iconList.push(icon);
			}
			this.saveSettings();
		}

		const getIcon = (key: string): MetadataIcon | null => {
			const index = this.settings.iconList.findIndex((item) => item.name === key);
			if (index !== -1) {
				return this.settings.iconList[index];
			} else {
				return null;
			}
		}

		const createIconBase = (property: any) => {
			property.iconEl.empty();
			const spanEl = property.iconEl.createSpan();

			const button = new ExtraButtonComponent(spanEl);
			button.setTooltip(`Current Type: ${property.typeInfo.inferred.type}`);
			button.extraSettingsEl.toggleClass(["setting-editor-extra-setting-button"], false);
			button.extraSettingsEl.toggleClass(["metadata-style-icon"], true);
			return button;
		}

		const renderEmojiIcon = (property: any, icon: MetadataIcon) => {
			const button = createIconBase(property);
			button.extraSettingsEl.empty();
			button.extraSettingsEl.createSpan({text: icon.icon})
		}

		const renderLucideIcon = (property: any, icon: MetadataIcon) => {
			const button = createIconBase(property);
			button.setIcon(icon.icon);
		}

		const patchProperty = () => {
			const editor = this.app.workspace.activeEditor;

			if (!editor) return false;
			const property = editor.metadataEditor.rendered.first();

			if (!property) return false;
			const propertyCON = property.constructor;

			this.register(
				around(propertyCON.prototype, {
					showPropertyMenu: (next: any) =>
						function (this: any, ...args: any) {
							if ((args[0] as PointerEvent).ctrlKey || (args[0] as PointerEvent).metaKey) {
								const picker = createModal(this);
								picker.open();
								return;
							}
							next.call(this, ...args);
						},
					renderProperty: (next: any) =>
						function (this: any, ...args: any) {
							next.apply(this, args);
							const icon = getIcon(this.entry.key);
							if (icon && icon.type === "emoji") {
								renderEmojiIcon(this, icon);
							} else if (icon && icon.type === "lucide") {
								renderLucideIcon(this, icon);
							}
						},
					// Prevent focus on input when click on icon
					focusValue: (next: any) =>
						function (this: any, ...args: any) {
							const result = next && next.apply(this, args);
							setTimeout(() => {
								next.apply(this, args);
							}, 30)
							return result;
						}
				})
			);
			editor.leaf?.rebuildView();
			console.log("Metadata-Style: metadata editor get patched");
			return true;
		};
		this.app.workspace.onLayoutReady(() => {
			if (!patchProperty()) {
				const evt = this.app.workspace.on("layout-change", () => {
					patchProperty() && this.app.workspace.offref(evt);
				});
				this.registerEvent(evt);
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
