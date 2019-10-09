import { TaskList } from '../task-list';
import { Config } from '../importer';
export interface WKOptions {
    global: boolean;
    log: string | boolean;
    commands?: string;
}
export declare function create_list(config: Config, argv: Record<string, string | boolean>): TaskList;
