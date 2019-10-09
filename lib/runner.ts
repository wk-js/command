import { TaskList } from "./task-list";
import { Task } from "./task";
import * as Path from 'path';
import * as Print from './utils/print';
import { execute, transfert_parameters } from './utils';
import { parse } from './utils/argv';
import { extract_vars } from "./utils/cli";

export interface RunnerResult {
  success: boolean,
  taskName: string
}

export class Runner {

  constructor(public tasks: TaskList = new TaskList) {}

  static create(tasks?: TaskList) {
    return new Runner(tasks)
  }

  async parallel(...tasks: string[]) {
    const results = []

    for (let i = 0; i < tasks.length; i++) {
      results.push( this.run(tasks[i]) )
    }

    return Promise.all(results)
  }

  async serie(...tasks: string[]) {
    const results = []

    for (let i = 0; i < tasks.length; i++) {
      results.push(await this.run(tasks[i]))
    }

    return results
  }

  async run(name: string, edit?: (task: Task) => void) {
    const args = name.split(/\s/)
    let command = this.tasks.find(args.shift() as string)

    if (args.length > 0) {
      command = command.clone()

      const [ vars, targv ] = extract_vars(args)
      command.args(...targv)
      command.variables(parse(vars) as Record<string, string>)
    }

    if (typeof edit === 'function') {
      command = command.clone()
      edit(command)
    }

    const task = command.toLiteral()

    let results: RunnerResult[] = []

    if (task.concurrent) {
      if (task.dependencies.length > 0) {
        const res0 = await this.parallel(...task.dependencies)
        results = results.concat(...res0)
      }

      return results
    }

    if (task.dependencies.length > 0) {
      const res1 = await this.serie(...task.dependencies)
      results = results.concat(...res1)
    }

    const env = Object.assign({ FORCE_COLOR: true }, process.env)
    const cmd = task.binPath.length > 0 ? Path.join(task.binPath, task.cmd) : task.cmd
    Print.command(`${cmd} ${task.args.join(' ')}`, task.cwd)

    const [code, signal] = await execute(cmd, task.args, {
      cwd: task.cwd,
      stdio: "inherit",
      shell: true,
      env
    }).promise

    results.push({
      success: code == 0 || signal == 'SIGINT',
      taskName: task.name
    })

    return results
  }

}