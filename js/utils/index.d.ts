/// <reference types="node" />
import { SpawnOptions, ChildProcess } from "child_process";
import { MemoryStream } from 'lol/js/node/memory-stream';
import { Task } from "../task";
export declare function execute(command: string, args?: string[], options?: SpawnOptions): {
    stdout: MemoryStream | undefined;
    stderr: MemoryStream | undefined;
    promise: Promise<[number, string, ChildProcess]>;
};
export declare function transfert_parameters(task: Task, argv: Record<string, string | boolean>): void;
