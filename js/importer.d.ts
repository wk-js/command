export declare type FileCommandRecord = Record<string, string | Command>;
export declare type FileConcurrentRecord = Record<string, string[] | Concurrent>;
export declare type FileCommandAlias = Record<string, string | Command>;
export declare type CommandRecord = Record<string, Command>;
export declare type ConcurrentRecord = Record<string, Concurrent>;
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
export interface Concurrent {
    commands: string[];
    name?: string;
    source?: string;
    description?: string;
    visible?: boolean;
    dependsOn?: string[];
    conditions?: CommandCondition[];
    variables?: Record<string, string>;
}
export interface ConfigFile {
    commands: FileCommandRecord;
    concurrents: FileConcurrentRecord;
    importGlobals?: boolean;
    imports?: string[];
    aliases?: FileCommandAlias;
}
export interface Config {
    commands: CommandRecord;
    concurrents: ConcurrentRecord;
}
export declare function load(path: string, importGlobals?: boolean): Promise<Config>;
export declare function load_directory(path: string, importGlobals?: boolean): Promise<Config>;
export declare function lookup(importGlobals?: boolean): Promise<Config>;
