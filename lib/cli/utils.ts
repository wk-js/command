import { TaskList } from '../task-list';
import * as Log from '../log';
import { Task } from '../task';
import { CommandRecord } from '../importer';

export function create_list(commands: CommandRecord) {
  const list = TaskList.create()

  Object.keys(commands).forEach((name) => {
    const command = commands[name]
    const c = list.add(name, command.command)
    if (command.cwd) c.cwd(command.cwd)
    if (command.name) c.name(command.name)
    if (command.args) c.args(...command.args)
    if (command.source) c.source(command.source)
    if (command.binPath) c.binPath(command.binPath)
    if (typeof command.visible == 'boolean') c.visible(command.visible)
    if (command.dependsOn) c.dependsOn(...command.dependsOn)
    if (command.description) c.description(command.description)
  })

  return list
}

export function list_tasks(list: TaskList, verbose = false) {
  console.log('Task availables')
  const tasks: (string | [string, string])[] = list.all()
    .map(t => t.toLiteral())
    .filter(t => verbose ? verbose : t.visible)
    .map(t => {
      let description = verbose ? `(From "${t.source}")` : ""
      description = verbose && !t.visible ? `[Hidden]` : ""
      if (t.description) description = `${t.description} ${description}`
      return [t.name, description]
    })
  Log.list(tasks)
}

export function help() {
  console.log('Parameters availables')
  Log.list([
    ['--wk.commands=[PATH]', 'Set commands file path'],
    ['--wk.noglobal', 'Do not import global tasks'],
    ['--wk.verbose', 'Display error stack']
  ])
}

export function pass_args(task: Task, argv: Record<string, string | boolean>) {
  Object.keys(argv).forEach((key) => {
    if (!key.match(/^wk\./)) {
      if (!isNaN(parseFloat(key))) {
        if (argv[key] != argv['0']) task.arg(argv[key] as string)
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