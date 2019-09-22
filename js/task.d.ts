export declare class Task {
    private _cmd;
    private _cwd;
    private _args;
    private _depends;
    private _binPath;
    private _visible;
    private _description;
    constructor(_cmd: string);
    static create(command: string): Task;
    clone(): Task;
    copy(command: Task): this;
    cwd(_cwd: string): this;
    binPath(_binPath: string): this;
    description(_description: string): this;
    visible(_visible: boolean): this;
    arg(arg: string): this;
    args(...args: string[]): this;
    dependsOn(...tasks: string[]): this;
    toLiteral(): {
        cwd: string;
        cmd: string;
        binPath: string;
        description: string;
        visible: boolean;
        args: string[];
        dependencies: string[];
    };
}
