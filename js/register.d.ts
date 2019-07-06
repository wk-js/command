export declare class Parameters {
    private static _parameters;
    static set(name: string, parameters: string | string[]): string[];
    static get(): string[];
}
