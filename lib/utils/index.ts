import { SpawnOptions, spawn, ChildProcess } from "child_process";

export function execute(command: string, args?: string[], options?: SpawnOptions) {
  const child = spawn(command, args, options)

  return {
    child,
    promise() {
      return new Promise<[number, string, ChildProcess]>((resolve, reject) => {
        child.on('error', reject)
        child.on('exit', (code, signal) => {
          resolve([code, signal, child])
        })
      })
    }
  }
}