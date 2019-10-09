import { RunnerResult } from "../runner";
import { TaskList } from "../task-list";
export declare function command(command: string, cwd: string): void;
export declare function warn(...args: any[]): void;
export declare function err(e: Error): void;
export declare function tasks(list: TaskList): void;
export declare function help(): void;
export declare function helpAndTasks(list: TaskList): void;
export declare function results(results: RunnerResult[]): void;
