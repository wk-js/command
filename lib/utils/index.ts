import { SpawnOptions, spawn, ChildProcess } from "child_process";
import { MemoryStream } from 'lol/js/node/memory-stream';
import { Task } from "../task";

export function execute(command: string, args?: string[], options?: SpawnOptions) {
  const stdout = new MemoryStream(Date.now()+''+Math.random())
  const stderr = new MemoryStream(Date.now()+''+Math.random())
  const promise = new Promise<[number, string, ChildProcess]>((resolve, reject) => {
    const cprocess = spawn(command, args, options)
    if (options && options.stdio === 'pipe') {
      cprocess.stdout.pipe(stdout)
      cprocess.stderr.pipe(stderr)
    }
    cprocess.on('error', reject)
    cprocess.on('exit', (code, signal) => {
      resolve([code, signal, cprocess])
    })
  })

  return { stdout, stderr, promise }
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