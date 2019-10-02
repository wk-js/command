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
    global?: boolean | string;
    extends?: string[];
    commands: CommandRecord;
    aliases?: CommandAlias;
}
export declare function load(path: string): Record<string, Command>;
export declare function lookup(): CommandRecord;
export declare function create_list(commands: CommandRecord): TaskList;
export declare function list_tasks(list: TaskList, verbose?: boolean): void;
export declare function help(): void;
export declare function pass_args(task: Task, argv: Record<string, string | boolean>): void;
export declare function auto_imports(path?: string): Record<string, Command>;
