export declare class Task {
    private _cmd;
    private _cwd;
    private _args;
    private _depends;
    private _description;
    private _visible;
    constructor(_cmd: string);
    static create(command: string): Task;
    clone(): Task;
    copy(command: Task): this;
    cwd(_cwd: string): this;
    description(_description: string): this;
    visible(_visible: boolean): this;
    arg(arg: string): this;
    args(...args: string[]): this;
    dependsOn(...tasks: string[]): this;
    to_literal(): {
        cwd: string;
        cmd: string;
        description: string;
        visible: boolean;
        args: string[];
        dependencies: string[];
    };
}
