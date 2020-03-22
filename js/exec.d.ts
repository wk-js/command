import { CommandOptions, Task, TaskSerie, TaskParallel } from "./types";
export declare function run(task: Task | string, options?: CommandOptions): Promise<void>;
export declare function serie(task: TaskSerie): Promise<void>;
export declare function parallel(task: TaskParallel): Promise<any[]>;
