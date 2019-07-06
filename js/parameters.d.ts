import { ParametersUtils } from "./parameters-utils";
export declare class Parameters {
    private _parameters;
    constructor(_parameters: string[]);
    get(parameter: string): string | boolean;
    has(parameter: string): boolean;
    indexOf(parameter: string): number;
    atIndex(index: number): string;
    clone(): string[];
    private static _parameters;
    static Utils: typeof ParametersUtils;
    static register(name: string, parameters: string | string[]): Parameters;
    static get(name: string): Parameters;
    static has(name: string): boolean;
}
