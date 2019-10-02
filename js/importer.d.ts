export declare type CommandRecord = Record<string, Command>;
export declare type CommandAlias = Record<string, string | Command>;
export interface CommandCondition {
    platform?: string;
    arch?: string;
    override?: Command;
    exec?: string;
}
export interface Command {
    command: string;
    name?: string;
    source?: string;
    cwd?: string;
    binPath?: string;
    description?: string;
    visible?: boolean;
    args?: string[];
    dependsOn?: string[];
    conditions?: CommandCondition[];
}
export interface Config {
    importGlobals?: boolean;
    imports?: string[];
    commands: CommandRecord;
    aliases?: CommandAlias;
}
export declare function load(path: string, importGlobal?: boolean): Promise<Record<string, Command>>;
export declare function load_directory(path: string, importGlobal?: boolean): Promise<Record<string, Command>>;
export declare function lookup(importGlobal?: boolean): Promise<CommandRecord>;
