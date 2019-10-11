/// <reference types="node" />
import { SpawnOptions, ChildProcess } from "child_process";
export declare function execute(command: string, args?: string[], options?: SpawnOptions): {
    child: ChildProcess;
    promise(): Promise<[number, string, ChildProcess]>;
};
