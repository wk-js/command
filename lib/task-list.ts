import { Task } from "./task";
import { execute } from "./utils";

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
        ...this._tasks[name].to_literal()
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
      console.log(`Task with name "${name}" not found`)
      return new Promise<[number, string]>((resolve) => resolve([0, ""]))
    }

    let command = this._tasks[name]

    if (typeof edit === 'function') {
      command = command.clone()
      edit(command)
    }

    const task = command.to_literal()

    if (task.dependencies.length > 0) {
      await this.serie(...task.dependencies)
    }

    const env = Object.assign({ FORCE_COLOR: true }, process.env)

    return execute(task.cmd, task.args, {
      cwd: task.cwd,
      env
    })
  }

}