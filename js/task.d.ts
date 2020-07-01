import { Commands2, FileCommands } from "./types";
export declare function find(name: string, commands: Commands2): string;
export declare function exists(name: string, commands: Commands2): boolean;
export declare function split_commands(commands: FileCommands, tree?: string[]): FileCommands;
export declare function format_commands(commands: FileCommands): Record<string, string>;
export declare function parse(name: string, commands: Commands2): string;
export declare function help(commands: Record<string, string>): void;
