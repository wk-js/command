import * as YAML from 'js-yaml';
import { Commands, WKOptions } from './types';
export declare function create_schema(json?: boolean): YAML.Schema;
export declare function parse(content: string, json?: boolean): any;
export declare function parse_file(path: string): [Record<string, string>, Commands, Partial<WKOptions>, Record<string, string>];
