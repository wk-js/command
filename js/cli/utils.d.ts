import { TaskList } from '../task-list';
import { Task } from '../task';
import { CommandRecord } from '../importer';
export declare function create_list(commands: CommandRecord): TaskList;
export declare function list_tasks(list: TaskList, verbose?: boolean): void;
export declare function help(): void;
export declare function pass_args(task: Task, argv: Record<string, string | boolean>): void;
