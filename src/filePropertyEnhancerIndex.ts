import { MarkdownRenderer, Plugin, setIcon } from 'obsidian';
import { around } from "monkey-around";
import "./styles/custom.css";
import { createModal, getIcon, removeIcon, setPropertyIcon } from "./utils/utils";
import "./styles/styles.scss";
import type { filePropertyEnhancerSettings } from "./filePropertyEnhancerSettings";
import { DEFAULT_SETTINGS } from "./filePropertyEnhancerSettings";
import type { ILeafBanner, MetadataIcon } from "./types/global";

type Modifier = 'Mod' | 'Shift' | 'Alt';

type ShortcutConfig = {
	key: string;
	modifiers: Modifier[];
	noText: string;
	withTextPrefix: string;
	withTextSuffix?: string;
};

const SHORTCUTS: ShortcutConfig[] = [
	{key: 'i', modifiers: ['Mod'], noText: '**', withTextPrefix: '*'},
	{key: 'b', modifiers: ['Mod'], noText: '****', withTextPrefix: '**'},
	{key: 'k', modifiers: ['Mod', 'Shift'], noText: '[]()', withTextPrefix: '[', withTextSuffix: ']()'},
	{key: 'h', modifiers: ['Mod', 'Shift'], noText: '====', withTextPrefix: '=='},
	{key: 'l', modifiers: ['Mod'], noText: '[[]]', withTextPrefix: '[[', withTextSuffix: ']]'},
];

export default class FilePropertyEnhancerPlugin extends Plugin {
	settings!: filePropertyEnhancerSettings;

	// metaManager: MetaManager;

	async onload() {
		await this.loadSettings();
		this.app.workspace.onLayoutReady(() => {
			this.patchFileProperty();
			this.patchFileTextProperty();
			this.patchAllProperties();
		});
	}

	onunload() {

		this.app.workspace.onLayoutReady(() => {
			this.unpatchAllProperties();
			this.unpatchFileProperty();

			console.log("Metadata-Style: metadata editor get unpatched");
		});
	}

	patchFileProperty() {
		const createIconModal = (property: any) => createModal(this, property);
		const getMetadataIcon = (key: string): MetadataIcon | null => getIcon(this, key);

		const patchPropertyInList = () => {
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
								createIconModal(this).open();
								return;
							}
							next.call(this, ...args);
						},
					renderProperty: (next: any) =>
						async function (this: any, ...args: any) {
							next.apply(this, args);

							const icon = getMetadataIcon(args[0].key || this.entry.key);
							if (icon) {
								setPropertyIcon(this, icon, "file-property");
								return;
							}

							if (this.entry.type === "number") {
								if (!this.valueEl) return;
								if (this.valueEl.children.length > 1) return;
								const plusEl = createDiv({
									cls: "metadata-input-plus-btn",
								});
								const minusEl = createDiv({
									cls: "metadata-input-minus-btn",
								});
								setIcon(plusEl, "plus");
								setIcon(minusEl, "minus");
								this.valueEl.appendChild(plusEl);
								this.valueEl.appendChild(minusEl);

								plusEl.onClickEvent(() => {
									this.handleUpdateValue(this.entry.value + 1);
									this.renderProperty(this.entry, true);
								});
								minusEl.onClickEvent(() => {
									this.handleUpdateValue(this.entry.value - 1);
									this.renderProperty(this.entry, true);
								});
							}

						},
					focusValue: (next: any) =>
						function (this: any, ...args: any) {
							const result = next && next.apply(this, args);
							// Prevent unfocus when changing type of property.
							setTimeout(() => {
								next.apply(this, args);
							}, 30);
							return result;
						}
				})
			);
			editor.leaf?.rebuildView();
			console.log("Metadata-Style: metadata editor get patched");
			return true;
		};
		this.app.workspace.onLayoutReady(() => {
			if (!patchPropertyInList()) {
				const evt = this.app.workspace.on("layout-change", () => {
					patchPropertyInList() && this.app.workspace.offref(evt);
				});
				this.registerEvent(evt);
			}
		});
	}

	patchFileTextProperty() {

		const isModifiersMatched = (evt: KeyboardEvent, modifiers: Modifier[]): boolean => {
			const checks = {
				'Mod': () => evt.ctrlKey || evt.metaKey,
				'Shift': () => evt.shiftKey,
				'Alt': () => evt.altKey
			};

			return modifiers.every(modifier => checks[modifier]());
		};
		const insertTextAtSelection = (text: string) => {
			const selection = window.getSelection();
			if (!selection) return;

			const range = selection.getRangeAt(0);
			range.deleteContents();

			const textNode = document.createTextNode(text);
			range.insertNode(textNode);

			// Move the cursor after the inserted text
			range.setStartAfter(textNode);
			range.setEndAfter(textNode);
			selection.removeAllRanges();
			selection.addRange(range);
		};

		const handleKeyShortcut = (evt: KeyboardEvent, config: ShortcutConfig) => {
			if (evt.key.toLowerCase() !== config.key || !isModifiersMatched(evt, config.modifiers)) return;
			evt.preventDefault();

			const selection = window.getSelection();
			if (!selection) return;

			const selectedText = selection.toString().trim();

			if (selectedText === '') {
				insertTextAtSelection(config.noText);
			} else {
				insertTextAtSelection(`${config.withTextPrefix}${selectedText}${config.withTextSuffix || config.withTextPrefix}`);
			}
		};

		const patchTextPropertyInList = () => {
			const editor = this.app.workspace.activeEditor;
			const propertyList = editor?.metadataEditor?.rendered.filter((property: any) => property.entry.type === "text");

			if (!propertyList?.length) return false;

			const property = propertyList[0];
			if (!property) return false;

			const renderer = property.rendered;

			this.register(
				around(renderer.constructor.prototype, {
					render: (next: any) =>
						async function (this: any, ...args: any) {

							next.apply(this, ...args);
							if (!this.addedEvent) {
								this.addedEvent = true;
								if (!this.inputEl) return;
								// console.log(this.editing, this.value);
								(this.inputEl as HTMLElement)?.onClickEvent(() => {
									if (this.editing) return;
									this.editing = true;
									this.inputEl.toggleClass('is-editing', this.editing);

									this.inputEl.empty();
									this.inputEl.setText(this.value);
								});
								(this.inputEl as HTMLElement).addEventListener('blur', () => {
									this.editing = false;
									this.inputEl.toggleClass('is-editing', this.editing);
									this.render();
								});
								(this.inputEl as HTMLElement).addEventListener('keyup', (evt) => {
									if (!this.editing) return;
									// Support basic markdown shortcuts
									for (const shortcut of SHORTCUTS) {
										handleKeyShortcut(evt, shortcut);
									}
								});

							}
							if (this.editing) return;
							this.inputEl.empty();
							this.inputEl.toggleClass('markdown-rendered', true);
							await MarkdownRenderer.render(
								this.ctx.app,
								this.value,
								this.inputEl,
								this.ctx.metadataEditor.owner.file.path,
								this.ctx.metadataEditor,
							);
						},
					onFocus: (next: any) =>
						function (this: any, ...args: any) {
							// if (this.editing) return;
							next.apply(this, args);
							if (this.editing) return;
							this.editing = true;
							this.inputEl.toggleClass('is-editing', this.editing);

							this.inputEl.empty();
							this.inputEl.setText(this.value);
						}
				})
			);
			editor?.leaf?.rebuildView();
			console.log("Metadata-Style: metadata editor get patched");
			return true;
		};
		this.app.workspace.onLayoutReady(() => {
			if (!patchTextPropertyInList()) {
				const evt = this.app.workspace.on("layout-change", () => {
					patchTextPropertyInList() && this.app.workspace.offref(evt);
				});
				this.registerEvent(evt);
			}
		});
	}

	patchAllProperties() {
		const createIconModal = (property: any) => createModal(this, property);
		const getMetadataIcon = (key: string): MetadataIcon | null => getIcon(this, key);

		const patchProperty = () => {
			const allPropertiesView = this.app.workspace.getLeavesOfType("all-properties")[0]?.view as any;

			if (!allPropertiesView) return false;
			// @ts-ignore
			const treeItem = allPropertiesView.root.vChildren._children?.first();

			if (!treeItem) return false;
			const treeItemConstructor = treeItem.constructor;

			this.register(
				around(treeItemConstructor.prototype, {
					setProperty: (next: any) =>
						function (this: any, ...args: any) {
							next.apply(this, args);
							const icon = getMetadataIcon(this.property.key);
							if (!icon) return;
							const button = setPropertyIcon(this, icon, "all-properties");
							if (!button) return;
							button.onClick(() => createIconModal(this.property));
						},
					onSelfClick: (next: any) =>
						function (this: any, ...args: any) {
							if ((args[0] as PointerEvent).ctrlKey || (args[0] as PointerEvent).metaKey) {
								createIconModal(this).open();
								return;
							}
							next.call(this, ...args);
						}
				})
			);
			allPropertiesView.leaf?.rebuildView();
			console.log("Metadata-Style: all property view get patched");
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

	unpatchAllProperties() {
		const leaf = this.app.workspace.getLeavesOfType("all-properties");
		if (leaf.length === 0) return;
		for (const item of leaf) {
			item.rebuildView();
		}
	}

	unpatchFileProperty() {
		const leaves = this.app.workspace.getLeavesOfType('markdown');
		for (const leaf of leaves) {
			if (leaf.view.currentMode.sourceMode === true) continue;
			const metadataEditor = leaf.view.metadataEditor;
			if (!metadataEditor) continue;
			const propertyList = metadataEditor.rendered;
			if (!propertyList) continue;
			propertyList.forEach((property: any) => {
				const item = property.entry;
				try {
					property.renderProperty(item, true);
				} catch (e) {
					console.log(e);
				}
			});
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


