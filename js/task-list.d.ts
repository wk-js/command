import { Task } from "./task";
export declare class TaskList {
    private _tasks;
    static create(): TaskList;
    add(name: string, command: string, edit?: (task: Task) => void): Task;
    remove(name: string): void;
    clone(name: string, newName: string, edit?: (task: Task) => void): void;
    find(name: string): Task;
    all(): Task[];
}
