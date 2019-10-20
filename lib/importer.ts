import { isFile, fetch, readFile } from 'lol/js/node/fs'
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
  importPackage?: boolean;
  imports?: string[];
  aliases?: FileCommandAlias;
}

export interface Config {
  importGlobals: boolean;
  importPackage: boolean;
  commands: CommandRecord;
  concurrents: ConcurrentRecord;
}

export function default_config(): Config {
  return {
    importGlobals: false,
    importPackage: false,
    commands: {},
    concurrents: {}
  }
}

export async function load(path: string, config?: Config) {
  let current: Config = config || default_config()

  const files = fetch(path)

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    merge_config(current, await _load(file))
  }

  return current
}

export async function load_directory(path: string, config?: Config) {
  const files = fetch([
    Path.join(path, '**/*.toml'),
    Path.join(path, '**/*.json')
  ])

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    config = await load(file, config)
  }

  return config as Config
}

export function lookup(config?: Config) {
  const paths = [
    Path.join(process.cwd(), 'Commands.toml'),
    Path.join(process.cwd(), 'commands.toml'),
    'package.json'
  ]

  for (const p of paths) {
    if (isFile(p)) return load(p, config)
  }

  throw new Error('No commands found.')
}

async function _load(path: string) {
  if (!isFile(path)) {
    throw new Error(`"${path}" is not a file`)
  }

  let file: ConfigFile = { commands: {}, concurrents: {} }
  let config: Config = default_config()
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

  config.importGlobals = typeof file.importGlobals == 'boolean' ? file.importGlobals : false
  config.importPackage = typeof file.importPackage == 'boolean' ? file.importPackage : false

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
      config = merge_config(await load(e), config)
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

export async function load_globals(config?: Config) {
  const global_dir = Path.join(Os.homedir(), '.wk')
  const path = Path.join(global_dir, '**/*.{json,toml}')
  return load(path, config)
}

export async function load_package(path: string, config?: Config) {
  if (!isFile(path)) {
    throw new Error(`This package at path "${path}" does not exist.`)
  }

  let current: Config = config || default_config()
  const file = await readFile(path, { encoding: 'utf-8' })
  const pkg  = JSON.parse(file as string)

  if (pkg.scripts) {
    for (const name in pkg.scripts) {
      const command = pkg.scripts[name]
      current.commands[name] = {
        name,
        command,
        cwd: Path.dirname(path)
      }
    }
  }

  return current
}

export function merge_config(...configs: Config[]) {
  const first = configs.shift() as Config

  for (let i = 0; i < configs.length; i++) {
    if (first.importGlobals != configs[i].importGlobals && configs[i].importGlobals) {
      first.importGlobals = true
    }

    if (first.importPackage != configs[i].importPackage && configs[i].importPackage) {
      first.importPackage = true
    }

    merge<Config>(first.commands, configs[i].commands)
    merge<Config>(first.concurrents, configs[i].concurrents)
  }

  return first
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