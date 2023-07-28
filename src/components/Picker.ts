import { App, Modal } from "obsidian";
import PickerComponent from './UI/PickerComponent.svelte';

export class PickerModal extends Modal {
	private cb: (emoji: any) => void;
	private picker: PickerComponent;

	constructor(app: App, cb: (emoji: any) => void) {
		super(app);
		this.cb = cb;
	}

	onOpen() {
		this.containerEl.toggleClass("icon-picker-modal", true);
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
