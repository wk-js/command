import { TaskList } from "./task-list";
import { Task } from "./task";
export interface RunnerResult {
    success: boolean;
    taskName: string;
}
export declare class Runner {
    tasks: TaskList;
    constructor(tasks?: TaskList);
    static create(tasks?: TaskList): Runner;
    parallel(...tasks: string[]): Promise<RunnerResult[][]>;
    serie(...tasks: string[]): Promise<RunnerResult[][]>;
    run(name: string, edit?: (task: Task) => void): Promise<RunnerResult[]>;
}
