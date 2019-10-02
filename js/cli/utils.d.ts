import { TaskList } from '../task-list';
import { Task } from '../task';
export declare type CommandRecord = Record<string, Command | string>;
export interface Command {
    command: string;
    cwd?: string;
    binPath?: string;
    description?: string;
    visible?: boolean;
    args?: string[];
    dependsOn?: string[];
}
export interface Config {
    extends?: string[];
    commands: CommandRecord;
}
export declare function load(path: string): CommandRecord;
export declare function lookup(): CommandRecord;
export declare function create_list(commands: CommandRecord): TaskList;
export declare function list_tasks(list: TaskList): void;
export declare function help(): void;
export declare function pass_args(task: Task, argv: Record<string, string | boolean>): void;
