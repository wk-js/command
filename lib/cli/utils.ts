import { isFile } from 'lol/js/node/fs'
import { merge } from 'lol/js/object'
import * as Path from 'path'
import * as Fs from 'fs'
import TOML from "toml";
import { TaskList } from '../task-list';
import * as Log from '../log';
import { Task } from '../task';

export type CommandRecord = Record<string, Command|string>

export interface Command {
  command: string
  cwd?: string
  binPath?: string
  description?: string
  visible?: boolean
  args?: string[]
  dependsOn?: string[]
}

export interface Config {
  extends?: string[]
  commands: CommandRecord
}

export function load(path: string) : CommandRecord {
  let config: Config = { commands: {} }
  if (!isFile(path)) {
    throw new Error(`"${path}" is not a file`)
  }

  const content = Fs.readFileSync(path, 'utf-8')

  try {
    if (Path.extname(path) == '.toml') {
      config = TOML.parse(content)
    } else if (Path.extname(path) == '.json') {
      config = JSON.parse(content)
    }
  } catch (e) {
    throw new Error(`Cannot parse "${path}"`)
  }

  if (config.extends != null) {
    for (const e of config.extends) {
      config.commands = merge(load(e), config.commands)
    }
  }

  return config.commands
}

export function lookup() : CommandRecord {
  const paths = [
    Path.join(process.cwd(), 'Commands.toml'),
    Path.join(process.cwd(), 'commands.toml'),
    'package.json'
  ]

  for (const p of paths) {
    if (isFile(p)) return load(p)
  }

  throw new Error('No commands found.')
}

export function create_list(commands: CommandRecord) {
  const list = TaskList.create()

  Object.keys(commands).forEach((name) => {
    const command = commands[name]
    if (typeof command == 'string') {
      list.add(name, command)
    } else {
      const c = list.add(name, command.command)
      if (command.cwd) c.cwd(command.cwd)
      if (command.args) c.args(...command.args)
      if (command.binPath) c.binPath(command.binPath)
      if (command.visible) c.visible(command.visible)
      if (command.dependsOn) c.dependsOn(...command.dependsOn)
      if (command.description) c.description(command.description)
    }
  })

  return list
}

export function list_tasks(list: TaskList) {
  console.log('Task availables')
  const tasks: (string | [string, string])[] = list.all()
  .map(t => t.toLiteral())
  .filter(t => t.visible)
  .map(t => {
    if (t.description) {
      return [t.name, t.description]
    } else {
      return t.name
    }
  })
  Log.list(tasks)
}

export function help() {
  console.log('Parameters availables')
  Log.list([
    ['--wk.commands=[PATH]', 'Set commands file path'],
    ['--wk.verbose', 'Display error stack']
  ])
}

export function pass_args(task: Task, argv: Record<string, string|boolean>) {
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