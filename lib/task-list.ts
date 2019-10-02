import { Task } from "./task";

export class TaskList {

  private _tasks: Record<string, Task> = {}

  static create() {
    return new TaskList()
  }

  add(name: string, command: string, edit?: (task: Task) => void) {
    const task = Task.create(command)
    task.name(name)

    if (typeof edit == 'function') {
      edit(task)
    }

    return this._tasks[name] = task
  }

  remove(name: string) {
    delete this._tasks[name]
  }

  clone(name: string, newName: string, edit?: (task: Task) => void) {
    const task = this.find(name)
    const clone = task.clone()

    if (typeof edit == 'function') {
      edit(clone)
    }

    this._tasks[newName] = clone
  }

  find(name: string) {
    let command = this._tasks[name]

    if (!command) {
      throw new Error(`No task with name "${name}" exists`)
    }

    return command
  }

  all() {
    return Object.keys(this._tasks).map((key) => this._tasks[key])
  }

}