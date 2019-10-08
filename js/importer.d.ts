export declare type CommandRecord = Record<string, Command>;
export declare type ConcurrentRecord = Record<string, string[]>;
export declare type CommandAlias = Record<string, string | Command>;
export interface CommandCondition {
    platform?: string;
    arch?: string;
    override?: Command;
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
    variables?: Record<string, string>;
}
export interface ConfigFile {
    commands: CommandRecord;
    concurrents: ConcurrentRecord;
    importGlobals?: boolean;
    imports?: string[];
    aliases?: CommandAlias;
}
export interface Config {
    commands: CommandRecord;
    concurrents: ConcurrentRecord;
}
export declare function load(path: string, importGlobals?: boolean): Promise<{
    commands: Record<string, Command>;
    concurrents: Record<string, string[]>;
}>;
export declare function load_directory(path: string, importGlobals?: boolean): Promise<{
    commands: Record<string, Command>;
    concurrents: Record<string, string[]>;
}>;
export declare function lookup(importGlobals?: boolean): Promise<{
    commands: Record<string, Command>;
    concurrents: Record<string, string[]>;
}>;
