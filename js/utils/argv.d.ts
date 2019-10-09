export declare type ARGv = Record<string, string | boolean>;
export declare function parse(argv: string[]): Record<string, string | boolean>;
export declare function filter(argv: ARGv, regex: RegExp, omit?: boolean): Record<string, string | boolean>;
