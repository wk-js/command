/// <reference types="node" />
import { SpawnOptions } from "child_process";
export interface Parameters {
    a: string[];
    o: Record<string, string | boolean>;
}
export declare function parse(argv: string[]): Record<string, string | boolean>;
export declare function execute(command: string, args: string[], options: SpawnOptions): Promise<[number, string]>;
