import FilePropertyEnhancerPlugin from "../filePropertyEnhancerIndex";
import { Component, MarkdownView, TFile } from "obsidian";
import MetaManager from "./MetaManager";
import Icon from "./Icon";

export default class Header extends Component {
    plugin: FilePropertyEnhancerPlugin;
    title: string | null;
    icon: string;
    file: TFile;
    view: MarkdownView;
    metaManager: MetaManager;

    private titleDiv: HTMLDivElement;
    private wrap: HTMLElement;

    iconComponent: Icon;

    constructor(plugin: FilePropertyEnhancerPlugin, view: MarkdownView, icon: string) {
        super();
        this.plugin = plugin;
        this.icon = icon;

        this.view = view;
        this.title = view.file?.basename || "";
        this.file = view.file as TFile;
        this.metaManager = plugin.metaManager;
    }

    onload() {
        this.loadWrap();
        this.loadTitle();
        this.wrap.append(this.titleDiv);
        return this.wrap;
    }

    onunload() {
        this.titleDiv.remove();
        this.wrap.remove();
    }

    loadWrap() {
        this.wrap = createEl("div");
        this.wrap.addClass(
            "obsidian-banner-header",
            `title-placement-${this.plugin.settings.banners["titlePlacement"]}`,
        );
        this.wrap.addClass(
            "obsidian-banner-icon",
            `h-${this.plugin.settings.banners["iconHorizontalAlignment"]}`,
            `v-${this.plugin.settings.banners["iconVerticalAlignment"]}`,
        );
        if (this.icon) {
            this.iconComponent = new Icon({
                plugin: this.plugin,
                icon: this.icon,
                view: this.view,
                file: this.file,
            });
            this.wrap.append(this.iconComponent.onload());
        }
    }

    loadTitle() {
        // title
        this.titleDiv = createEl("div");
        this.titleDiv.addClass("obsidian-banner-title", "HyperMD-header-1");
        this.titleDiv.textContent = this.title;
        this.titleDiv.contentEditable = "true";
        this.titleDiv.addEventListener("blur", async (e) => {
            const newTitle = this.titleDiv.textContent;
            if (newTitle !== this.title && newTitle) {
                this.title = newTitle;
                await this.metaManager.upsertBannerData(this.view, this.file, {
                    title: newTitle,
                });
            }
        });

        this.titleDiv.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.titleDiv.blur();
            }
        });

        this.titleDiv.addEventListener("click", (e) => {
            this.titleDiv.focus();
        });
    }
}
