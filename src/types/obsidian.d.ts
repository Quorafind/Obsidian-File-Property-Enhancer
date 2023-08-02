// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as obsidian from 'obsidian';
import type { WorkspaceLeaf } from "obsidian";

declare module "obsidian" {
    interface MarkdownFileInfo {
        leaf: WorkspaceLeaf;
        metadataEditor: MetadataEditor;
    }

    interface View {
        currentMode: any;
        metadataEditor: MetadataEditor;
    }

    interface MetadataEditor {
        rendered: Property[];
        setCollapse: (collapse: boolean) => void;
        collapsed: boolean;
    }

    interface Property {
        entry: any;
        iconEl: HTMLElement;
        typeInfo: {
            inferred: any;
            expected: any;
        };
    }

    interface TreeItem {
        property: any;
        iconEl: HTMLElement;
    }


    interface WorkspaceLeaf {
        rebuildView: () => void;
    }

    interface App {
        metadataTypeManager: { trigger: (event: string, ...args: any[]) => void; }
    }

}
