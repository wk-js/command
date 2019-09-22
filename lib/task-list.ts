import { Task } from "./task";
import { execute } from "./utils";
import * as Path from 'path';
import * as Log from './log';

export class TaskList {

  private _tasks: Record<string, Task> = {}

  static create() {
    return new TaskList()
  }

  register(name: string, task: string, edit?: (task: Task) => void) {
    this._tasks[name] = Task.create(task)
    if (typeof edit == 'function') {
      edit(this._tasks[name])
    }
    return this._tasks[name]
  }

  description() {
    return Object.keys(this._tasks).map((name) => {
      return {
        name,
        ...this._tasks[name].toLiteral()
      }
    })
  }

  async parallel(...names: string[]) {
    const tasks = []

    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      tasks.push(this.run(name))
    }

    return Promise.all(tasks)
  }

  async serie(...names: string[]) {
    const tasks = []

    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      tasks.push(await this.run(name))
    }

    return tasks
  }

  async run(name: string, edit?: (task: Task) => void) {
    if (!this._tasks[name]) {
      Log.warn(`Task with name "${name}" not found`)
      return new Promise<[number, string]>((resolve) => resolve([0, ""]))
    }

    let command = this._tasks[name]

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