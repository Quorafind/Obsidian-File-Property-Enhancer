import { Component, MarkdownView, TFile } from "obsidian";

import FilePropertyEnhancerPlugin from "../filePropertyEnhancerIndex";
import { DEFAULT_SETTINGS } from "../filePropertyEnhancerSettings";
import { PickerModal } from "./Picker";

interface IIcon {
    plugin: FilePropertyEnhancerPlugin;
    icon: string;
    view: MarkdownView;
    file: TFile;
}

const getIconTransform = (plugin: FilePropertyEnhancerPlugin): string | null => {
    const {iconHorizontalAlignment, iconVerticalAlignment} = plugin.settings.banners;
    const {iconHorizontalTransform: dH, iconVerticalTransform: dV} =
        DEFAULT_SETTINGS.banners;
    const h =
        iconHorizontalAlignment === "custom"
            ? plugin.settings.banners["iconHorizontalTransform"]
            : dH;
    const v =
        iconVerticalAlignment === "custom"
            ? plugin.settings.banners["iconVerticalTransform"]
            : dV;
    return h !== dH || v !== dV ? `translate(${h}, ${v})` : null;
};

class Icon extends Component {
    private plugin: FilePropertyEnhancerPlugin;
    private icon: string;
    private view: MarkdownView;
    private file: TFile;

    private iconBox: HTMLDivElement;

    constructor({plugin, icon, view, file}: IIcon) {
        super();
        this.plugin = plugin;
        this.icon = icon;
        this.view = view;
        this.file = file;
    }

    onload() {
        super.onload();

        const text = this.icon[0];

        this.iconBox = createEl("div", {
            cls: "icon-box",
            attr: {
                style: getIconTransform(this.plugin) ?? "",
            },
            text: text,
        });

        this.iconBox.onclick = async (e) => {
            const pickerModal = new PickerModal(this.plugin.app, async (selected) => {
                await this.plugin.metaManager.upsertBannerData(this.view, this.file, {
                    icon: selected.emoji ? selected.emoji.native : selected.icon,
                });
            });
            pickerModal.open();
            e.stopPropagation();
        };

        return this.iconBox;
    }

    updateIcon(icon: string) {
        this.icon = icon;
        this.iconBox.innerText = this.icon;
    }
}

export default Icon;
