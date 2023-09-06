// eslint-disable-next-line @typescript-eslint/no-unused-vars
import "obsidian";
import { BannersIconUpdateEvt } from "../utils/define";
import { IBannerMetadata } from "./global";
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
        rendered: any;
    }

    interface TreeItem {
        property: any;
        iconEl: HTMLElement;
    }


    interface WorkspaceLeaf {
        rebuildView: () => void;
        id: string;
    }

    interface Workspace {
        on(
            name: "banners-update",
            cb: (leaf: WorkspaceLeaf, data: Partial<IBannerMetadata>) => any,
        ): EventRef;

        trigger(
            name: typeof BannersIconUpdateEvt,
            leaf: WorkspaceLeaf,
            data: Partial<IBannerMetadata>,
        ): void;
    }

    interface App {
        metadataTypeManager: { trigger: (event: string, ...args: any[]) => void; }
    }

}
