export declare class Command {
    private _command;
    private _cwd;
    private _params;
    constructor(_command: string);
    parse(): void;
    cwd(path: string): void;
    execute(): void;
    private static _commands;
    static init(): void;
    static create(name: string, command: string): Command;
    static execute(name?: string): void;
}
