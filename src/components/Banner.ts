import { Component, MarkdownView, TFile } from "obsidian";
import clamp from "lodash/clamp";


import FilePropertyEnhancerPlugin from "../filePropertyEnhancerIndex";
import type { IBannerMetadata } from "../types/global";

type MTEvent = MouseEvent | TouchEvent;

interface IDragData {
    x: number | null;
    y: number | null;
    isDragging: boolean;
    vertical: boolean;
}

interface IBanner {
    plugin: FilePropertyEnhancerPlugin;
    bannerData: IBannerMetadata;
    view: MarkdownView;
    filepath: string;
    wrapper: HTMLElement;
    isEmbed: boolean;
}

interface IElementListener<E extends keyof HTMLElementEventMap> {
    target: HTMLElement;
    ev: E;
    func: (listener: HTMLElementEventMap[E]) => any;
}

type ElListener = IElementListener<keyof HTMLElementEventMap>;

// Get current mouse position of event
const getMousePos = (e: MTEvent) => {
    const {clientX, clientY} =
        e instanceof MouseEvent ? e : e.targetTouches[0];
    return {x: clientX, y: clientY};
};

// Begin image drag (and if a modifier key is required, only do so when pressed)
const handleDragStart = (
    e: MTEvent,
    dragData: IDragData,
    isModHeld: boolean,
) => {
    if (!isModHeld && e instanceof MouseEvent) {
        return;
    }
    const {x, y} = getMousePos(e);
    const {clientHeight, clientWidth, naturalHeight, naturalWidth} =
        e.target as HTMLImageElement;
    dragData.x = x;
    dragData.y = y;
    dragData.isDragging = true;
    dragData.vertical =
        naturalHeight / naturalWidth >= clientHeight / clientWidth;
};

// Dragging image
// TODO: See if it's possible to rework drag so that it's consistent to the image's dimensions
const handleDragMove = (e: MTEvent, dragData: IDragData) => {
    if (!dragData.isDragging) {
        return;
    }

    // Calculate delta and update current mouse position
    const img = e.target as HTMLImageElement;
    const {x, y} = getMousePos(e);
    if (!dragData.x || !dragData.y) return;

    const delta = {
        x: ((dragData.x - x) / img.clientWidth) * 30,
        y: ((dragData.y - y) / img.clientHeight) * 30,
    };
    dragData.x = x;
    dragData.y = y;

    const [currentX, currentY] = img.style.objectPosition
        .split(" ")
        .map((n) => parseFloat(n));

    // Update object position styling depending on banner dimensions
    if (dragData.vertical) {
        const newY = clamp(currentY + delta.y, 0, 100);
        img.style.objectPosition = `${currentX}% ${newY}%`;
    } else {
        const newX = clamp(currentX + delta.x, 0, 100);
        img.style.objectPosition = `${newX}% ${currentY}%`;
    }
};

// Finish image drag
const handleDragEnd = async (
    img: HTMLImageElement,
    view: MarkdownView,
    path: string,
    dragData: IDragData,
    plugin: FilePropertyEnhancerPlugin,
) => {
    if (!dragData.isDragging) {
        return;
    }
    dragData.isDragging = false;

    // Upsert data to file's frontmatter
    const [x, y] = img.style.objectPosition
        .split(" ")
        .map((n) => Math.round(parseFloat(n) * 1000) / 100000);
    await plugin.metaManager.upsertBannerData(
        view,
        path,
        dragData.vertical ? {y} : {x},
    );
};

// Helper to get the URL path to the image file
const parseSource = (
    plugin: FilePropertyEnhancerPlugin,
    src: string,
    filepath: string,
): string => {
    // Internal embed link format - "![[<link>]]"
    if (/^\!\[\[.+\]\]$/.test(src)) {
        const link = src.slice(3, -2);
        const file = plugin.app.metadataCache.getFirstLinkpathDest(
            link,
            filepath,
        );
        return file ? plugin.app.vault.getResourcePath(file) : link;
    }

    // Absolute paths, relative paths, & URLs
    const path = src?.startsWith("/") ? src.slice(1) : src;
    const file = plugin.app.vault.getAbstractFileByPath(path);
    return file instanceof TFile ? plugin.app.vault.getResourcePath(file) : src;
};

class Banner extends Component {
    private plugin: FilePropertyEnhancerPlugin;
    private bannerData: IBannerMetadata;
    private view: MarkdownView;
    private filepath: string;
    private wrapper: HTMLElement;
    private isEmbed: boolean = false;
    private listeners: ElListener[] = [];

    private messageBox: HTMLElement;
    private img: HTMLImageElement;
    private dragData: IDragData = {
        x: null,
        y: null,
        isDragging: false,
        vertical: true,
    };

    constructor({
                    plugin,
                    bannerData,
                    view,
                    filepath,
                    wrapper,
                    isEmbed = false,
                }: IBanner) {
        super();
        this.plugin = plugin;
        this.bannerData = bannerData;
        this.view = view;
        this.filepath = filepath;
        this.wrapper = wrapper;
        this.isEmbed = isEmbed;
    }

    public onload(): [HTMLElement[]] {
        const {src, x = 0.5, y = 0.5, lock} = this.bannerData;

        const canDrag = !this.isEmbed && !lock;

        this.initMessage();
        const {messageBox} = this.initImage(canDrag, {
            src,
            x,
            y,
        });

        return [[messageBox, this.img]];
    }

    onunload() {
        super.onunload();
        this.listeners.forEach(({target, ev, func}) =>
            target.removeEventListener(ev, func),
        );
    }

    initMessage() {
        this.messageBox = createEl("div", {
            cls: "banner-message",
        });
        const spinnerEl = this.messageBox.createEl("div", {
            cls: "spinner",
        });
        spinnerEl.createEl("div", {cls: "bounce1"});
        spinnerEl.createEl("div", {cls: "bounce2"});
        spinnerEl.createEl("div", {cls: "bounce3"});
    }

    initImage(
        canDrag: boolean,
        {
            src,
            x,
            y,
        }: {
            src: string;
            x: number;
            y: number;
        },
    ) {
        const clampedX = clamp(x, 0, 1);
        const clampedY = clamp(y, 0, 1);
        this.img = createEl("img", {
            cls: "banner-image full-width",
            attr: {
                src: parseSource(this.plugin, src, this.filepath),
                draggable: false,
                style: `object-position: ${clampedX * 100}% ${
                    clampedY * 100
                }%;`,
            },
        });
        this.img.onload = () => this.wrapper.toggleClass("loaded", true);
        this.img.onerror = () => {
            this.messageBox.innerHTML = `<p>Error loading banner image! Is the <code>${this.plugin.settings.banners["frontmatterField"]}</code> field valid?</p>`;
            this.wrapper.toggleClass("error", true);
        };

        const body = document.querySelector("body");
        if (canDrag && body) {
            this.img.toggleClass(
                "draggable",
                this.plugin.settings.banners.bannerDragModifier === "none" ||
                this.plugin.settings.banners.holdingDragModKey,
            );

            // Image drag
            const imgDragStart = (e: MTEvent) =>
                handleDragStart(
                    e,
                    this.dragData,
                    this.plugin.settings.banners.holdingDragModKey,
                );
            const imgDragMove = (e: MTEvent) =>
                handleDragMove(e, this.dragData);
            const imgDragEnd = (e: MTEvent) => {
                handleDragEnd(
                    this.img,
                    this.view,
                    this.filepath,
                    this.dragData,
                    this.plugin,
                );
            };
            this.listeners.push(
                {target: this.img, ev: "mousedown", func: imgDragStart},
                {target: this.img, ev: "mousemove", func: imgDragMove},
                {target: body, ev: "mouseup", func: imgDragEnd},
                {target: body, ev: "mouseleave", func: imgDragEnd},
                {
                    target: this.img,
                    ev: "click",
                    func: (e: MTEvent) => e.stopPropagation(),
                },
            );

            // Only allow dragging in mobile when desired from settings
            if (this.plugin.settings.banners.allowMobileDrag && body) {
                this.listeners.push(
                    {target: this.img, ev: "touchstart", func: imgDragStart},
                    {target: this.img, ev: "touchmove", func: imgDragMove},
                    {target: body, ev: "touchend", func: imgDragEnd},
                    {
                        target: this.img,
                        ev: "click",
                        func: (e: MTEvent) => e.stopPropagation(),
                    },
                );
            }
        }

        this.listeners.forEach(({target, ev, func}) =>
            target.addEventListener(ev, func),
        );
        const removeListeners = () =>
            this.listeners.forEach(({target, ev, func}) =>
                target.removeEventListener(ev, func),
            );

        return {
            messageBox: this.messageBox,
            removeListeners,
        };
    }

    initChangeControls() {
    }
}

export default Banner;
