import { isFile, fetch, readFile } from 'lol/js/node/fs'
import { merge, omit } from 'lol/js/object'
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
  name: string;
  source?: string;
  cwd?: string;
  binPath?: string;
  description?: string;
  visible?: boolean;
  args?: string[];
  dependsOn?: string[];
  conditions?: CommandCondition[];
  variables?: Record<string, string>;
  subcommands?: (string|Command)[]
}

export interface Concurrent {
  commands: string[];
  name: string;
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
    const command = Utils.commandFromString(file.commands[key], key, path)
    if (Array.isArray(command.conditions) && !Utils.conditions(command)) {
      continue
    }

    // Add aliases from commands
    if (command.subcommands) {
      Utils.registerSubcommands(config, command, command.subcommands)
    } else {
      Utils.registerCommand(config, command)
    }
  }

  // Parse concurrents
  for (const key in file.concurrents) {
    const concurrent = Utils.concurrentFromStrings(file.concurrents[key], key, path)
    if (Array.isArray(concurrent.conditions) && !Utils.conditions(concurrent)) {
      continue
    }

    Utils.registerConcurrent(config, concurrent)
  }

  // Load extended files
  if (file.imports != null) {
    for (const e of file.imports) {
      config = merge_config(await load(e), config)
    }
  }

  // Resolve aliases
  if (file.aliases != null) {
    Utils.registerAliases(config, file.aliases)
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
      Utils.registerCommand(current, {
        name,
        command,
        cwd: Path.dirname(path)
      })
    }
  }

  return current
}

export function merge_config(first: Config, ...configs: Config[]) {
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

const Utils = {

  commandFromString(command: string|Command, name: string, source?: string) : Command {
    if (typeof command == 'string') {
      return { command, name, source }
    }

    if (source) command.source = source

    if (!command.name || (typeof command.name == 'string' && command.name.length == 0)) {
      command.name = name
    }

    return command
  },

  concurrentFromStrings(concurrent: string[]|Concurrent, name: string, source?: string) : Concurrent {
    if (Array.isArray(concurrent)) {
      return { commands: concurrent, name, source }
    }

    if (source) concurrent.source = source

    if (!concurrent.name || (typeof concurrent.name == 'string' && concurrent.name.length == 0)) {
      concurrent.name = name
    }

    return concurrent
  },

  registerSubcommands(config: Config, command: Command, subcommands: (string|Command)[]) {
    let i = 0

    for (const _subcommand of subcommands) {
      let subcommand = Utils.commandFromString(_subcommand, i.toString())
      subcommand = Utils.mergeCommands(command, subcommand)
      subcommand.name = command.name + ':' + subcommand.name

      // Register subcommand
      Utils.registerCommand(config, subcommand)
      i++
    }
  },

  registerAliases(config: Config, aliases: FileCommandAlias) {
    for (const key in aliases) {
      let alias = Utils.commandFromString(aliases[key], key)
      const command = config.commands[alias.command] as Command

      if (!command) {
        throw new Error(`Cannot alias "${key}" with "${alias.command}"`)
      }

      // Merge alias to command
      const merged = Utils.mergeCommands(command, alias)
      merged.command = command.command

      // Register alias
      Utils.registerCommand(config, merged)
    }
  },

  registerCommand(config: Config, command: Command) {
    config.commands[command.name] = command
  },

  registerConcurrent(config: Config, concurrent: Concurrent) {
    config.concurrents[concurrent.name] = concurrent
  },

  mergeCommands(...commands: Command[]) {
    let current: Command = { name: "", command: "" }

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      current = merge<Command>(current, command)

      current.args = current.args || []
      current.args = current.args.concat(command.args || [])

      current.dependsOn = current.dependsOn || []
      current.dependsOn = current.dependsOn.concat(command.dependsOn || [])

      current.conditions = current.conditions || []
      current.conditions = current.conditions.concat(command.conditions || [])

      current.subcommands = current.subcommands || []
      current.subcommands = current.subcommands.concat(command.subcommands || [])
    }

    return current
  },

  mergeConcurrents(...commands: Concurrent[]) {
    let merged: Concurrent = { name: "", commands: [] }

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i]
      merge<Concurrent>(merged, cmd)

      merged.commands = merged.commands || []
      merged.commands = merged.commands.concat(cmd.commands || [])

      merged.dependsOn = merged.dependsOn || []
      merged.dependsOn = merged.dependsOn.concat(cmd.dependsOn || [])

      merged.conditions = merged.conditions || []
      merged.conditions = merged.conditions.concat(cmd.conditions || [])
    }

    return merged
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