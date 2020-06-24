import { Command, WKOptions } from './types';
export declare function parse(cmd: string): {
    wk: WKOptions;
    variables: Record<string, string | boolean>;
};
export declare function render(cmd: string): Command;
