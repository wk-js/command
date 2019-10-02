import { TaskList } from '../task-list';
import { Task } from '../task';
export declare type CommandRecord = Record<string, Command>;
export declare type CommandAlias = Record<string, string | Command>;
export interface Command {
    command: string;
    name?: string;
    source?: string;
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
    aliases?: CommandAlias;
}
export declare function load(path: string): CommandRecord;
export declare function lookup(): CommandRecord;
export declare function create_list(commands: CommandRecord): TaskList;
export declare function list_tasks(list: TaskList, display_source?: boolean): void;
export declare function help(): void;
export declare function pass_args(task: Task, argv: Record<string, string | boolean>): void;
