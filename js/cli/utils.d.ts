import { TaskList } from '../task-list';
import { Config } from '../importer';
import { RunnerResult } from '../runner';
export declare function isCommand(s?: string): boolean | "" | undefined;
export declare function create_list(config: Config, argv: Record<string, string | boolean>): TaskList;
export declare function print_tasks(list: TaskList, verbose?: boolean): void;
export declare function print_help(): void;
export declare function print_results(results: RunnerResult[]): void;
