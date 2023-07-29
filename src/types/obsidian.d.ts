// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as obsidian from 'obsidian';
import type { WorkspaceLeaf } from "obsidian";

declare module "obsidian" {
	interface MarkdownFileInfo {
		leaf: WorkspaceLeaf;
		metadataEditor: any;
	}

	interface WorkspaceLeaf {
		rebuildView: () => void;
	}

	interface App {
		metadataTypeManager: { trigger: (event: string, ...args: any[]) => void; }
	}

}
