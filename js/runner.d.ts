import { TaskList } from "./task-list";
import { Task } from "./task";
export declare class Runner {
    tasks: TaskList;
    constructor(tasks?: TaskList);
    static create(tasks?: TaskList): Runner;
    parallel(...tasks: string[]): Promise<[number, string][]>;
    serie(...tasks: string[]): Promise<[number, string][]>;
    run(name: string, edit?: (task: Task) => void): Promise<[number, string]>;
}
