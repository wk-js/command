import { WKOptions, DStringBool } from './types';
export declare function convert(o: Record<string, string | boolean | number>): Record<string, string | number | boolean>;
export declare function parse(cmd: string): {
    wk: WKOptions;
    variables: DStringBool;
    env: DStringBool;
};
