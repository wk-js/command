import { isFile, fetch } from 'lol/js/node/fs'
import { merge } from 'lol/js/object'
import * as Path from 'path'
import * as Fs from 'fs'
import TOML from "toml";
import { TaskList } from '../task-list';
import * as Log from '../log';
import { Task } from '../task';
import * as Os from 'os';

export type CommandRecord = Record<string, Command>
export type CommandAlias = Record<string, string|Command>

export interface Command {
  command: string
  name?: string
  source?: string
  cwd?: string
  binPath?: string
  description?: string
  visible?: boolean
  args?: string[]
  dependsOn?: string[]
}

export interface Config {
  importGlobals?: boolean
  imports?: string[]
  commands: CommandRecord
  aliases?: CommandAlias
}

function _load(path: string, importGlobals = true): CommandRecord {
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

  importGlobals = typeof config.importGlobals == 'boolean' ? config.importGlobals && importGlobals : importGlobals

  // Auto import global tasks
  if (importGlobals) {
    const global_dir = Path.join(Os.homedir(), '.wk')
    config.commands = merge(load(Path.join(global_dir, '**/*.{json,toml}'), false), config.commands)
  }

  // Replace string to literal
  for (const key in config.commands) {
    let command = config.commands[key];
    if (typeof command == 'string') {
      config.commands[key] = { command }
    }

    config.commands[key].source = path
  }

  // Load extended files
  if (config.imports != null) {
    for (const e of config.imports) {
      // config.commands = merge(load(e), config.commands)
      config.commands = merge(load(e, importGlobals), config.commands)
    }
  }

  // Resolve aliases
  if (config.aliases != null) {
    for (const key in config.aliases) {
      let alias = config.aliases[key]

      if (typeof alias == 'string') {
        alias = { command: alias }
      }

      let al = alias as Command
      const command = config.commands[al.command]

      if (!command) {
        throw new Error(`Cannot alias "${key}" with "${al.command}"`)
      }

      const all = merge({}, command, al) as Command
      all.name = key
      all.command = command.command
      all.args = al.args || all.args
      config.commands[key] = all
    }
  }

  return config.commands
}

export function load(path: string, importGlobal = true) {
  let commands: CommandRecord = {}
  fetch(path)
  .forEach((file) => {
    commands = merge(commands, _load(file, importGlobal))
  })
  return commands
}

export function load_directory(path: string, importGlobal = true) {
  let commands: CommandRecord = {}
  fetch([
    Path.join(path, '**/*.toml'),
    Path.join(path, '**/*.json')
  ]).forEach((file) => {
    commands = merge(commands, load(file, importGlobal))
  })
  return commands
}

export function lookup(importGlobal = true): CommandRecord {
  const paths = [
    Path.join(process.cwd(), 'Commands.toml'),
    Path.join(process.cwd(), 'commands.toml'),
    'package.json'
  ]

  for (const p of paths) {
    if (isFile(p)) return load(p, importGlobal)
  }

  throw new Error('No commands found.')
}

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