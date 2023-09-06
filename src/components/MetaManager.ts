import {
    type CachedMetadata,
    MarkdownView,
    MetadataCache,
    TFile,
    Vault,
    WorkspaceLeaf,
} from "obsidian";
import FilePropertyEnhancerPlugin from "../filePropertyEnhancerIndex";
import type { BannerMetadataKey, IBannerMetadata } from "../types/global";

const ALL_BANNER_KEYS: BannerMetadataKey[] = ["src", "x", "y", "icon", "lock"];

export default class MetaManager {
    plugin: FilePropertyEnhancerPlugin;
    metadata: MetadataCache;
    vault: Vault;
    leaf: WorkspaceLeaf;
    baseName: string;

    constructor(plugin: FilePropertyEnhancerPlugin) {
        this.plugin = plugin;
        this.metadata = plugin.app.metadataCache;
        this.vault = plugin.app.vault;

        this.baseName = this.plugin.settings.banners["frontmatterField"];
    }

    // Update active leaf
    updateLeaf(leaf: WorkspaceLeaf) {
        this.leaf = leaf;
    }

    // Get banner metadata from frontmatter
    getBannerData(
        frontmatter: Record<string, string | number | boolean>,
    ): IBannerMetadata | null {
        if (!frontmatter) {
            return null;
        }

        const fieldName = this.plugin.settings.banners["frontmatterField"];
        const {
            [fieldName]: src,
            [`${fieldName}_x`]: x,
            [`${fieldName}_y`]: y,
            [`${fieldName}_icon`]: icon,
            [`${fieldName}_lock`]: lock,
            [`${fieldName}_title`]: title,
        } = frontmatter;
        return {
            src: src as string,
            x: this.parseBannerPos(x as string | number) || 0,
            y: this.parseBannerPos(y as string | number) || 0,
            icon: icon as string,
            lock: typeof lock === "boolean" ? lock : lock === "true",
            title: title as string,
        };
    }

    // Get banner metadata from a given file
    getBannerDataFromFile(file: TFile): IBannerMetadata | null {
        if (!file) {
            return null;
        }
        const {frontmatter} = this.metadata.getFileCache(
            file,
        ) as CachedMetadata;
        if (!frontmatter) return null;
        return this.getBannerData(frontmatter);
    }

    // Upsert banner data into a file's frontmatter
    async upsertBannerData(
        view: MarkdownView,
        fileOrPath: TFile | string,
        data: Partial<IBannerMetadata>,
    ) {
        const file =
            fileOrPath instanceof TFile
                ? fileOrPath
                : this.getFileByPath(fileOrPath);
        if (!file) {
            return;
        }

        // Get banner data based on the designated prefix for banner data fields
        const {src, x, y, icon, lock, title} = data;

        const trueFields: Partial<IBannerMetadata> = {
            ...(src !== undefined && {[this.baseName]: src}),
            ...(x !== undefined && {[`${this.baseName}_x`]: x}),
            ...(y !== undefined && {[`${this.baseName}_y`]: y}),
            ...(icon !== undefined && {[`${this.baseName}_icon`]: icon}),
            ...(lock !== undefined && {[`${this.baseName}_lock`]: lock}),
            ...(title !== undefined && {[`${this.baseName}_title`]: title}),
        };

        const fieldsArr = Object.keys(trueFields) as Array<
            keyof IBannerMetadata
        >;
        for (const key of fieldsArr) {
            await this.changeBannersDataInFrontmatter(
                key,
                trueFields[key],
                file,
                view,
            );
        }
    }

    // Remove banner data from a file's frontmatter
    async removeBannerData(
        file: TFile,
        targetFieldOrFields:
            | BannerMetadataKey
            | BannerMetadataKey[] = ALL_BANNER_KEYS,
    ) {
        const targetFields = Array.isArray(targetFieldOrFields)
            ? targetFieldOrFields
            : [targetFieldOrFields];

        // Get the true fields to target
        const srcIndex = targetFields.indexOf("src");
        if (srcIndex > -1) {
            targetFields.splice(srcIndex, 1, "" as BannerMetadataKey);
        }
        const base = this.plugin.settings.banners["frontmatterField"];
        const trueFields = targetFields.map(
            (suffix) => `${base}${suffix ? `_${suffix}` : ""}`,
        );

        // If there's no (relevant) YAML to remove, stop here
        const {
            // @ts-ignore
            frontmatter: {position, ...fields},
        } = this.metadata.getFileCache(file) as CachedMetadata;
        const frontmatterKeys = Object.keys(fields ?? {});
        if (!fields || !trueFields.some((f) => frontmatterKeys.includes(f))) {
            return;
        }

        // Remove the relevant YAML fields
        for (const field of trueFields) {
            await this.deleteBannersDataInFrontmatter(field, file);
        }
    }

    // Get file based on a path string
    getFileByPath(path: string): TFile | null {
        const file = this.vault.getAbstractFileByPath(path);
        return file instanceof TFile ? file : null;
    }

    async changeBannersDataInFrontmatter(
        key: string,
        value: string | number | boolean | undefined,
        fileRef: TFile,
        view: MarkdownView,
    ) {
        if (value === undefined) return;
        await this.plugin.app.fileManager.processFrontMatter(
            fileRef,
            (frontmatter) => {
                frontmatter[key] = value;
                return;
            },
        );
        this.plugin.app.workspace.trigger("banners-update", view.leaf, {
            [key.replace(`${this.baseName}_`, "")]: value,
        });
    }

    async deleteBannersDataInFrontmatter(key: string, fileRef: TFile) {
        await this.plugin.app.fileManager.processFrontMatter(
            fileRef,
            (frontmatter) => {
                let target = frontmatter[key] ?? "";
                if (target !== "") {
                    delete frontmatter[key];
                    return;
                }
            },
        );
    }

    // Parse banner position
    parseBannerPos(val: number | string): number | undefined {
        if (val === undefined) {
            return undefined;
        }
        return typeof val === "number" ? val : parseFloat(val);
    }

    // Format into valid YAML fields
    formatYamlFields(
        fields: Array<keyof IBannerMetadata>,
        data: Partial<IBannerMetadata>,
    ): string[] {
        return fields
            .map((key) => [key, `${data[key]}`])
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, val]) => `${key}: ${val}`);
    }
}
