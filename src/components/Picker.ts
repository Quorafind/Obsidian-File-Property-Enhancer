import { App, Modal } from "obsidian";
import PickerComponent from './UI/PickerComponent.svelte';

export class PickerModal extends Modal {
	private cb: (emoji: any) => void;

	constructor(app: App, cb: (emoji: any) => void) {
		super(app);
		this.cb = cb;
	}

	onOpen() {
		const picker = new PickerComponent({
			target: (this as any).contentEl, props: {}
		});
		picker.$on('select', (e: any) => {
			this.select(e.detail);
		});
	}


	select(emoji: any) {
		this.cb(emoji);
		this.close();
	}
}
