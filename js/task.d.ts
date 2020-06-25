import { Commands2 } from "./types";
export declare function find(name: string, commands: Commands2): string;
export declare function exists(name: string, commands: Commands2): boolean;
export declare function format_commands(commands: Commands2): Record<string, string>;
export declare function create_task2(name: string, commands: Commands2): string;
export declare function help2(commands: Record<string, string>): void;
