import { CommandOptions, Task, TaskSerie, TaskParallel, TaskExec } from "./types";
import { ExecOptions, exec } from 'lol/js/node/exec';
import { join } from 'path';
import { Context } from "./context";

export async function run(task: Task | string, options: CommandOptions = {}): Promise<void> {
  if (typeof task === 'string') {
    if (task.length === 0) return

    const ctx = Context.current()
    const opts: ExecOptions = { color: true, stdio: 'inherit', cwd: './' }
    if (options.cwd) opts.cwd = options.cwd
    console.log('>', ctx.references['WK::Command'], join(process.cwd(), opts.cwd as string))
    console.log('>', task, '\n')

    if (ctx.references['WK::Debug'] !== 'true') {
      await exec(task, opts).promise()
    }
  } else if (task.hasOwnProperty('Exec')) {
    const { Exec, Options } = (task as TaskExec)
    await run(Exec, Options)
  } else if (task.hasOwnProperty('Serie')) {
    await serie(task as TaskSerie)
  } else if (task.hasOwnProperty('Parallel')) {
    await parallel(task as TaskParallel)
  }
}

export async function serie(task: TaskSerie) {
  for (let i = 0; i < task.Serie.length; i++) {
    await run(task.Serie[i])
  }
}

export async function parallel(task: TaskParallel) {
  const promises: Promise<any>[] = []
  for (let i = 0; i < task.Parallel.length; i++) {
    promises.push(run(task.Parallel[i]))
  }

  return Promise.all(promises)
}
