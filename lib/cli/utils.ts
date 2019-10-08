import { TaskList } from '../task-list';
import * as Log from '../log';
import { Config } from '../importer';
import { RunnerResult } from '../runner';
import { merge, clone } from 'lol/js/object';

export function isCommand(s?: string) {
  return s && !s.match(/^-{1,2}/)
}

export function create_list(config: Config, argv: Record<string, string|boolean>) {
  const list = TaskList.create()

  Object.keys(config.commands).forEach((name) => {
    const command = config.commands[name]
    const c = list.add(name, command.command)
    c.name(command.name ? command.name : name)
    if (command.cwd) c.cwd(command.cwd)
    if (command.args) c.args(...command.args)
    if (command.source) c.source(command.source)
    if (command.binPath) c.binPath(command.binPath)
    if (typeof command.visible == 'boolean') c.visible(command.visible)
    if (command.dependsOn) c.dependsOn(...command.dependsOn)
    if (command.description) c.description(command.description)
    if (command.variables) c.variables(merge(command.variables, argv))
  })

  Object.keys(config.concurrents).forEach((name) => {
    const command = config.concurrents[name]
    const c = list.add(name, '[concurrent]')

    c.name(name)
    c.concurrent(true)
    c.dependsOn(...command)
    c.variables(clone(argv))
  })

  return list
}

export function print_tasks(list: TaskList, verbose = false) {
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

export function print_help() {
  console.log('Parameters availables')
  Log.list([
    ['--wk.commands=[PATH]', 'Set commands file path'],
    ['--wk.global', 'Import global tasks. Can accept "false" to disable'],
    ['--wk.verbose', 'Display error stack']
  ])
}

export function print_results(results: RunnerResult[]) {
  if (Log.silent()) return
  process.stdout.write('\n')
  Log.list(results.map(r => {
    return [ r.taskName, r.success ]
  }), 'success')
}