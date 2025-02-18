declare module "~plugins" {
    const plugins: Record<string, import("./utils/types").Plugin>;
    export default plugins;
    export const PluginMeta: Record<
        string,
        {
            folderName: string;
            userPlugin: boolean;
        }
    >;
}

declare module "*.css";
