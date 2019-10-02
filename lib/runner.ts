import { TaskList } from "./task-list";
import { Task } from "./task";
import * as Path from 'path';
import * as Log from './log';
import { execute } from './utils';

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
    let command = this.tasks.find(name)

    if (typeof edit === 'function') {
      command = command.clone()
      edit(command)
    }

    const task = command.toLiteral()

    if (task.dependencies.length > 0) {
      await this.serie(...task.dependencies)
    }

    const env = Object.assign({ FORCE_COLOR: true }, process.env)
    const cmd = task.binPath.length > 0 ? Path.join(task.binPath, task.cmd) : task.cmd
    Log.command(`${cmd} ${task.args.join(' ')}`, task.cwd)

    return execute(cmd, task.args, {
      cwd: task.cwd,
      stdio: "inherit",
      env
    })
  }

}