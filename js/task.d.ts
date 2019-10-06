export declare class Task {
    private _cmd;
    private _cwd;
    private _name;
    private _args;
    private _source;
    private _depends;
    private _binPath;
    private _visible;
    private _concurrent;
    private _description;
    constructor(_cmd: string);
    static create(command: string): Task;
    clone(): Task;
    copy(command: Task): this;
    name(_name: string): this;
    cwd(_cwd: string): this;
    binPath(_binPath: string): this;
    description(_description: string): this;
    source(_source: string): this;
    visible(_visible: boolean): this;
    concurrent(_concurrent: boolean): this;
    arg(arg: string): this;
    args(...args: string[]): this;
    dependsOn(...tasks: string[]): this;
    toLiteral(): {
        name: string;
        cwd: string;
        cmd: string;
        source: string;
        binPath: string;
        description: string;
        visible: boolean;
        concurrent: boolean;
        args: string[];
        dependencies: string[];
    };
}
