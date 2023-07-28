import { ExtraButtonComponent, Plugin } from 'obsidian';
import { around } from "monkey-around";
import { PickerModal } from "./components/Picker";

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
		this.patchFilePropertyView();
		this.patchAllPropertyView();
	}

	onunload() {

	}

	patchMetadata() {
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

		const renderIcon = (property: any, icon: MetadataIcon) => {
			property.iconEl.empty();
			const spanEl = property.iconEl.createSpan();

			const button = new ExtraButtonComponent(spanEl);
			button.setTooltip(`Current Type: ${property.typeInfo.inferred.type}`);
			button.extraSettingsEl.empty();
			button.extraSettingsEl.createSpan().innerText = icon.icon;
			button.extraSettingsEl.toggleClass(["setting-editor-extra-setting-button"], false);
			button.extraSettingsEl.toggleClass(["metadata-style-icon"], true);
		}

		const patchProperty = () => {
			const editor = this.app.workspace.activeEditor;

			if (!editor) return false;
			const property = editor.metadataEditor.rendered.first();

			if (!property) return false;
			const propertyCON = property.constructor;

			console.log(property);

			this.register(
				around(propertyCON.prototype, {
					showPropertyMenu: (next) =>
						function (...args: any) {
							if ((args[0] as PointerEvent).ctrlKey) {
								const picker = new PickerModal(app, (emoji) => {
									const icon = {
										name: this.entry.key,
										icon: emoji.native,
										type: "emoji" as IconType,
									}
									renderIcon(this, icon);
									saveIconToList(icon);
								});
								picker.open();
								return;
							}
							next.call(this, ...args);
						},
					renderProperty: (next) =>
						function (...args: any) {
							next.apply(this, args);
							setTimeout(() => {
								console.log(args);
								const icon = getIcon(this.entry.key);
								if (icon && icon.type === "emoji") {
									renderIcon(this, icon);
								}
							}, 0);
						},
					focusValue: (next) =>
						function (...args: any) {
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

	patchFilePropertyView() {
	}

	patchAllPropertyView() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
