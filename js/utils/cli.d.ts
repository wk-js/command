import { TaskList } from '../task-list';
import { Config } from '../importer';
export interface WKOptions {
    log: string | boolean;
    commands?: string;
}
export declare function create_list(config: Config): TaskList;
export declare function extract_wks(argv: string[]): [string[], string[]];
export declare function extract_vars(argv: string[]): [string[], string[]];
