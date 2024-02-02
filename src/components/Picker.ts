import { App, ExtraButtonComponent, Modal } from "obsidian";
import PickerComponent from './UI/PickerComponent.svelte';
import type FilePropertyEnhancerPlugin from "../filePropertyEnhancerIndex";
import { removeIcon } from "../utils/utils";

export class PickerModal extends Modal {
	private cb: (emoji: any) => void;
	private picker: PickerComponent;
	private plugin: FilePropertyEnhancerPlugin;
	private property: any;

	constructor(plugin: FilePropertyEnhancerPlugin, app: App, property: any, cb: (emoji: any) => void) {
		super(app);
		this.cb = cb;
		this.plugin = plugin;
		this.property = property;
	}

	onOpen() {
		this.containerEl.toggleClass("icon-picker-modal", true);
		const buttonEl = createEl('div', {cls: 'icon-delete-btn'});
		// Insert the button into the modal the first child of the contentEl
		new ExtraButtonComponent(buttonEl).setIcon('trash').onClick(async () => {
			await removeIcon(this.plugin, this.property);
			this.close();
		});
		this.modalEl.insertBefore(buttonEl, this.modalEl.firstChild);
		this.picker = new PickerComponent({
			target: (this as any).contentEl, props: {}
		});
		this.picker.$on('select', (e: any) => {
			this.select(e.detail);
		});
	}


	select(emoji: any) {
		this.cb(emoji);
		this.close();
	}

	onClose() {
		this.picker.$destroy();
	}
}
