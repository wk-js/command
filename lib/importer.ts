import { isFile, fetch } from 'lol/js/node/fs'
import { merge } from 'lol/js/object'
import * as Path from 'path'
import * as Fs from 'fs'
import TOML from "toml";
import * as Os from 'os';

export type FileCommandRecord = Record<string, string|Command>
export type FileConcurrentRecord = Record<string, string[]|Concurrent>
export type FileCommandAlias = Record<string, string|Command>
export type CommandRecord = Record<string, Command>
export type ConcurrentRecord = Record<string, Concurrent>

export interface CommandCondition {
  platform?: string;
  arch?: string;
  override?: Command;
}

export interface Command {
  command: string;
  name?: string;
  source?: string;
  cwd?: string;
  binPath?: string;
  description?: string;
  visible?: boolean;
  args?: string[];
  dependsOn?: string[];
  conditions?: CommandCondition[];
  variables?: Record<string, string>;
}

export interface Concurrent {
  commands: string[];
  name?: string;
  source?: string;
  description?: string;
  visible?: boolean;
  dependsOn?: string[];
  conditions?: CommandCondition[];
  variables?: Record<string, string>;
}

export interface ConfigFile {
  commands: FileCommandRecord;
  concurrents: FileConcurrentRecord;
  importGlobals?: boolean;
  imports?: string[];
  aliases?: FileCommandAlias;
}

export interface Config {
  commands: CommandRecord;
  concurrents: ConcurrentRecord;
}

export async function load(path: string, importGlobals = false) {
  let cmds: CommandRecord = {}
  let cnts: ConcurrentRecord = {}

  const files = fetch(path)

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const { commands, concurrents } = await _load(file, importGlobals)
    cmds = merge(cmds, commands)
    cnts = merge(cnts, concurrents)
  }

  return { commands: cmds, concurrents: cnts } as Config
}

export async function load_directory(path: string, importGlobals = false) {
  let cmds: CommandRecord = {}
  let cnts: ConcurrentRecord = {}

  const files = fetch([
    Path.join(path, '**/*.toml'),
    Path.join(path, '**/*.json')
  ])

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const { commands, concurrents } = await _load(file, importGlobals)
    cmds = merge(cmds, commands)
    cnts = merge(cnts, concurrents)
  }

  return { commands: cmds, concurrents: cnts } as Config
}

export function lookup(importGlobals = false) {
  const paths = [
    Path.join(process.cwd(), 'Commands.toml'),
    Path.join(process.cwd(), 'commands.toml'),
    'package.json'
  ]

  for (const p of paths) {
    if (isFile(p)) return load(p, importGlobals)
  }

  throw new Error('No commands found.')
}

async function _load(path: string, importGlobals = false) {
  if (!isFile(path)) {
    throw new Error(`"${path}" is not a file`)
  }

  let file: ConfigFile = { commands: {}, concurrents: {} }
  let config: Config = { commands: {}, concurrents: {} }
  const content = Fs.readFileSync(path, 'utf-8')

  try {
    if (Path.extname(path) == '.toml') {
      file = TOML.parse(content)
    } else if (Path.extname(path) == '.json') {
      file = JSON.parse(content)
    }
  } catch (e) {
    throw new Error(`Cannot parse "${path}"`)
  }

  importGlobals = typeof file.importGlobals == 'boolean' ? file.importGlobals && importGlobals : false

  // Auto import global tasks
  if (importGlobals) {
    const global_dir = Path.join(Os.homedir(), '.wk')
    file.commands = merge(await load(Path.join(global_dir, '**/*.{json,toml}'), false), file.commands)
  }

  // Parse commands
  for (const key in file.commands) {
    const command = Parser.commandFromString(file.commands[key])
    Parser.source(command, path)
    if (Array.isArray(command.conditions) && !Parser.conditions(command)) {
      continue
    }
    config.commands[key] = command
  }

  // Parse concurrents
  for (const key in file.concurrents) {
    const concurrent = Parser.concurrentFromStrings(file.concurrents[key])
    Parser.source(concurrent, path)
    if (Array.isArray(concurrent.conditions) && !Parser.conditions(concurrent)) {
      continue
    }
    config.concurrents[key] = concurrent
  }

  // Load extended files
  if (file.imports != null) {
    for (const e of file.imports) {
      const imp = await load(e, importGlobals)
      config.commands = merge(imp.commands, config.commands)
      config.concurrents = merge(imp.concurrents, config.concurrents)
    }
  }

  // Resolve aliases
  if (file.aliases != null) {
    for (const key in file.aliases) {
      let alias = Parser.commandFromString(file.aliases[key])
      const command = config.commands[alias.command] as Command

      if (!command) {
        throw new Error(`Cannot alias "${key}" with "${alias.command}"`)
      }

      const all = merge({}, command, alias) as Command
      all.name = alias.name || key
      all.command = command.command
      all.args = alias.args || all.args
      config.commands[key] = all
    }
  }

  return config
}

const Parser = {

  commandFromString(command: string|Command) : Command {
    if (typeof command == 'string') {
      return { command }
    }
    return command
  },

  concurrentFromStrings(commands: string[]|Concurrent) : Concurrent {
    if (Array.isArray(commands)) {
      return { commands }
    }
    return commands
  },

  source(c: Command|Concurrent, source: string) {
    c.source = source
  },

  conditions(c: Command|Concurrent) {
    const conditions = c.conditions as CommandCondition[]

    const platform = Os.platform()
    const arch = Os.arch()

    let valid = false

    for (let index = 0; index < conditions.length; index++) {
      const condition = conditions[index]

      if (typeof condition.platform == 'string' && condition.platform != platform) {
        continue
      }

      if (typeof condition.arch == 'string' && condition.arch != arch) {
        continue
      }

      valid = true
      if (condition.override != null) {
        c = merge(c, condition.override)
      }
    }

    return valid
  }

}