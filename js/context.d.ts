import { TagValue, WKConfig, WKOptions, DScalar, DStringBool } from "./types";
export declare class Context {
    static _env: DStringBool;
    static _variables: DStringBool;
    static _config: WKOptions;
    static export(): {
        variables: Record<string, string | boolean>;
        config: WKConfig;
    };
    static env(key: string, value?: string): string | boolean;
    static envs(v?: DScalar): Record<string, string | boolean>;
    static var(key: string, value?: string | boolean): string | boolean;
    static vars(v?: Record<string, TagValue>): Record<string, string | boolean>;
    static config<K extends keyof WKOptions>(key: K, value?: WKOptions[K]): WKOptions[K];
    static configs(v?: Partial<WKOptions>): WKOptions;
}
