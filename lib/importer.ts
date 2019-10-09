import { isFile, fetch } from 'lol/js/node/fs'
import { merge } from 'lol/js/object'
import * as Path from 'path'
import * as Fs from 'fs'
import TOML from "toml";
import * as Os from 'os';

export type CommandRecord = Record<string, Command>
export type ConcurrentRecord = Record<string, string[]>
export type CommandAlias = Record<string, string|Command>

export interface CommandCondition {
  platform?: string
  arch?: string,
  override?: Command
}

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
  conditions?: CommandCondition[]
  variables?: Record<string, string>
}

export interface ConfigFile {
  commands: CommandRecord
  concurrents: ConcurrentRecord
  importGlobals?: boolean
  imports?: string[]
  aliases?: CommandAlias
}

export interface Config {
  commands: CommandRecord
  concurrents: ConcurrentRecord
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

  return { commands: cmds, concurrents: cnts }
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

  return { commands: cmds, concurrents: cnts }
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
  let config: ConfigFile = { commands: {}, concurrents: {} }
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

  importGlobals = typeof config.importGlobals == 'boolean' ? config.importGlobals && importGlobals : false

  // Auto import global tasks
  if (importGlobals) {
    const global_dir = Path.join(Os.homedir(), '.wk')
    config.commands = merge(await load(Path.join(global_dir, '**/*.{json,toml}'), false), config.commands)
  }

  for (const key in config.commands) {
    let command = config.commands[key];

    // Replace string to literal
    if (typeof command == 'string') {
      config.commands[key] = { command }
    }

    // Set source file
    config.commands[key].source = path

    // Apply condition
    if (Array.isArray(config.commands[key].conditions)) {
      const conditions = config.commands[key].conditions as CommandCondition[]

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
          config.commands[key] = merge(config.commands[key], condition.override)
        }
      }

      if (!valid) delete config.commands[key]
    }
  }

  // Load extended files
  if (config.imports != null) {
    for (const e of config.imports) {
      const imp = await load(e, importGlobals)
      config.commands = merge(imp.commands, config.commands)
      config.concurrents = merge(imp.concurrents, config.concurrents)
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

  const commands = config.commands
  const concurrents = config.concurrents

  return { commands, concurrents }
}