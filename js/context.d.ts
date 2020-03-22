export declare class Context {
    references: Record<string, string | boolean>;
    private constructor();
    private static pool;
    private static _current?;
    static push(context: Context): Context;
    static pop(): Context | undefined;
    static current(): Context;
    static create(): Context;
}
