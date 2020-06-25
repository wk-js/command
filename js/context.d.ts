import { TagValue, WKOptions } from "./types";
export declare class Context {
    static _env: Record<string, string>;
    static _variables: Record<string, string | boolean>;
    static _config: WKOptions;
    static export(): {
        variables: Record<string, string | boolean>;
        config: WKOptions;
    };
    static env(key: string, value?: string): string;
    static envs(v?: Record<string, string | undefined>): Record<string, string>;
    static var(key: string, value?: string | boolean): string | boolean;
    static vars(v?: Record<string, TagValue>): Record<string, string | boolean>;
    static config<K extends keyof WKOptions>(key: K, value?: WKOptions[K]): WKOptions[K];
    static configs(v?: Partial<WKOptions>): WKOptions;
}
