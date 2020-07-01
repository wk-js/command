import * as YAML from 'js-yaml';
import { FileCommands, WKConfig } from './types';
export declare function create_schema(json?: boolean): YAML.Schema;
export declare function parse(content: string, json?: boolean): any;
export declare function parse_file(path: string): {
    variables: Record<string, string>;
    commands: FileCommands;
    config: Partial<WKConfig>;
    env: Record<string, string>;
};
