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
    type?: "main";
    args?: string[];
    dependsOn?: string[];
    conditions?: CommandCondition[];
    variables?: Record<string, string>;
    aliases?: (string | Command)[];
}
export interface Concurrent {
    commands: string[];
    name?: string;
    source?: string;
    description?: string;
    visible?: boolean;
    type?: "main";
    dependsOn?: string[];
    conditions?: CommandCondition[];
    variables?: Record<string, string>;
}
export interface ConfigFile {
    commands: FileCommandRecord;
    concurrents: FileConcurrentRecord;
    importGlobals?: boolean;
    importPackage?: boolean;
    imports?: string[];
    aliases?: FileCommandAlias;
}
export interface Config {
    importGlobals: boolean;
    importPackage: boolean;
    commands: CommandRecord;
    concurrents: ConcurrentRecord;
}
export declare function default_config(): Config;
export declare function load(path: string, config?: Config): Promise<Config>;
export declare function load_directory(path: string, config?: Config): Promise<Config>;
export declare function lookup(config?: Config): Promise<Config>;
export declare function load_globals(config?: Config): Promise<Config>;
export declare function load_package(path: string, config?: Config): Promise<Config>;
export declare function merge_config(...configs: Config[]): Config;
