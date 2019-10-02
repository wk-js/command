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
    importGlobals?: boolean;
    imports?: string[];
    commands: CommandRecord;
    aliases?: CommandAlias;
}
export declare function load(path: string, importGlobal?: boolean): Record<string, Command>;
export declare function load_directory(path: string, importGlobal?: boolean): Record<string, Command>;
export declare function lookup(importGlobal?: boolean): CommandRecord;
export declare function create_list(commands: CommandRecord): TaskList;
export declare function list_tasks(list: TaskList, verbose?: boolean): void;
export declare function help(): void;
export declare function pass_args(task: Task, argv: Record<string, string | boolean>): void;
