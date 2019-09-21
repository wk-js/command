import { Task } from "./task";
export declare class TaskList {
    private _tasks;
    static create(): TaskList;
    register(name: string, task: string, edit?: (task: Task) => void): Task;
    description(): {
        cwd: string;
        cmd: string;
        description: string;
        visible: boolean;
        args: string[];
        dependencies: string[];
        name: string;
    }[];
    parallel(...names: string[]): Promise<[number, string][]>;
    serie(...names: string[]): Promise<[number, string][]>;
    run(name: string, edit?: (task: Task) => void): Promise<[number, string]>;
}
