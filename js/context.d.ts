import { TagValue, WKOptions } from "./types";
export declare class Context {
    variables: Record<string, string | boolean>;
    args: string[];
    private static _global;
    static options: WKOptions;
    private constructor();
    private static pool;
    private static _current?;
    static push(context: Context): Context;
    static pop(): Context | undefined;
    static current(): Context;
    static create(): Context;
    static global(key: string, value?: string | boolean): import("./types").Scalar;
    var(key: string, value?: string | boolean): import("./types").Scalar;
    vars(v?: Record<string, TagValue>): Record<string, import("./types").Scalar>;
}
