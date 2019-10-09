import { SpawnOptions, spawn, ChildProcess } from "child_process";
import { MemoryStream } from 'lol/js/node/memory-stream';
import { Task } from "../task";

export function execute(command: string, args?: string[], options?: SpawnOptions) {
  let stdout: MemoryStream | undefined
  let stderr: MemoryStream | undefined

  if (options && options.stdio === 'pipe') {
    stdout = new MemoryStream()
    stderr = new MemoryStream()
  }

  return {
    stdout,
    stderr,
    promise: new Promise<[number, string, ChildProcess]>((resolve, reject) => {
      const child = spawn(command, args, options)
      if (options && options.stdio === 'pipe') {
        child.stdout.pipe(stdout as MemoryStream)
        child.stderr.pipe(stderr as MemoryStream)
      }
      child.on('error', reject)
      child.on('exit', (code, signal) => {
        resolve([code, signal, child])
      })
    })
  }
}

export function transfert_parameters(task: Task, argv: Record<string, string | boolean>) {
  Object.keys(argv).forEach((key) => {
    if (!key.match(/^wk\./)) {
      if (!isNaN(parseFloat(key)) && typeof argv[key] == 'string') {
        task.arg(argv[key] as string)
      } else if (key.length == 1 && typeof argv[key] == 'boolean') {
        task.arg(`-${key}`)
      } else if (typeof argv[key] == 'boolean') {
        task.arg(`--${key}`)
      } else {
        task.arg(`--${key} ${argv[key]}`)
      }
    }
  })
}