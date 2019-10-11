import { RunnerResult } from "../runner"
import { TaskList } from "../task-list"
import * as Log from '../log'
import chalk from "chalk";

export function command(command: string, cwd: string) {
  if (Log.level() < Log.Level.LIGHT) return
  console.log(chalk.grey('> From'), cwd);
  console.log(chalk.grey('> Running'), command);
  process.stdout.write('\n')
}

export function warn(...args: any[]) {
  if (Log.level() < Log.Level.LIGHT) return
  console.log(chalk.yellow('[warn]'), ...args);
}

export function err(e: Error) {
  if (Log.level() == Log.Level.FULL) {
    console.log(chalk.red('[err]'), e);
  } else {
    console.log(chalk.red('[err]'), e.message);
  }
}

export function tasks(list: TaskList) {
  const verbose = Log.level() == Log.Level.FULL
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
    ['--wk.global', 'Import global tasks. Can accept "false" to disable'],
    ['--wk.log=0|1|2|3', `Log level (Current: ${Log.level()})`]
  ])
}

export function helpAndTasks(list: TaskList) {
  if (Log.level() == Log.Level.SILENT) return
  help()
  process.stdout.write('\n')
  tasks(list)
}

export function results(results: RunnerResult[]) {
  if (Log.level() < Log.Level.FULL) return
  process.stdout.write('\n')
  Log.list(results.map(r => {
    return [ r.taskName, r.success ]
  }), 'success')
}