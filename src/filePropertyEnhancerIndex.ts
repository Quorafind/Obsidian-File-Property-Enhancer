import { Plugin } from 'obsidian';
import { around } from "monkey-around";
import "./styles/custom.css";
import { createModal, getIcon, setIcon } from "./utils/utils";

interface filePropertyEnhancerSettings {
    iconList: MetadataIcon[];
}

const DEFAULT_SETTINGS: filePropertyEnhancerSettings = {
    iconList: []
}

export default class FilePropertyEnhancerPlugin extends Plugin {
    settings: filePropertyEnhancerSettings;

    async onload() {
        await this.loadSettings();
        this.registerCommands();
        this.app.workspace.onLayoutReady(() => {
            this.patchFileProperty();
            this.patchAllProperties();
        })
    }

    onunload() {

        this.app.workspace.onLayoutReady(() => {
            this.unpatchAllProperties();
            this.unpatchFileProperty();

            console.log("Metadata-Style: metadata editor get unpatched");
        })
    }

    registerCommands() {
        this.addCommand({
            id: "fold-unfold-file-property",
            name: "Fold/Unfold Current File Property",
            checkCallback: (checking: boolean) => {
                // Conditions to check
                const activeEditor = this.app.workspace.activeEditor;
                if (activeEditor) {
                    // If checking is true, we're simply "checking" if the command can be run.
                    // If checking is false, then we want to actually perform the operation.
                    if (!checking) {
                        const metadataEditor = activeEditor.metadataEditor;
                        if (metadataEditor) {
                            metadataEditor.setCollapse(!metadataEditor.collapsed);
                        }
                    }

                    // This command will only show up in Command Palette when the check function returns true
                    return true;
                }
            }
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
                        function (this: any, ...args: any) {
                            next.apply(this, args);

                            const icon = getMetadataIcon(args[0].key || this.entry.key);
                            if (!icon) return;
                            setIcon(this, icon, "file-property");
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
                            const button = setIcon(this, icon, "all-properties");
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


