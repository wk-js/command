import { Commands, CommandOptions, Task, TaskExec, Commands2, Command2 } from "./types";
import { pad } from "lol/js/string";
import { Context } from "./context";
import { Any, get_key, Scalar } from "./tags";
import { template2 } from "lol/js/string/template";
import { deflat, flat } from "lol/js/object";

const ARG_REG = /^arg(\d+|s)$/

function _TEMPLATE_ESCAPE_REGEX(str: string) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

const VAR_REG_OPTIONS = {
  open: '${commands.',
  body: '[a-z@$#-_?!]+',
  close: '}',
}

const VAR_REG = new RegExp(_TEMPLATE_ESCAPE_REGEX(VAR_REG_OPTIONS.open) + VAR_REG_OPTIONS.body +_TEMPLATE_ESCAPE_REGEX(VAR_REG_OPTIONS.close))

export function find(name: string, commands: Commands2) {
  return commands[name] || commands[`${name}.default`] || commands[`${name}._default`]
}

export function exists(name: string, commands: Commands2) {
  return !!find(name, commands)
}

export function format_commands(commands: Commands2) {
  const default_reg = /._?default$/
  const cmds: Record<string, string> = {}
  for (const key in commands) {
    let k = key.replace(/\./g, '.')
    cmds[k] = commands[key]

    if (default_reg.test(k)) {
      k = k.replace(default_reg, '')
      cmds[k] = commands[key]
    }
  }
  return cmds
}

export function create_task2(name: string, commands: Commands2) {
  let command = find(name, commands)
  const visited = new Set<string>()

  while (true) {
    if (VAR_REG.test(command)) {
      if (visited.has(command)) throw `[wk] Task loop from "${name}"`
      visited.add(command)
      command = template2(command, commands, VAR_REG_OPTIONS)
    } else { break }
  }

  command = template2(command, flat(Context.export()))
  // command = `${command} ${args.join(' ')}`

  return command
}

export function help2(commands: Record<string, string>) {
  const ignored = new Set<string>()
  Object.keys(commands).forEach(key => {
    if (key.split('.').some(k => /^_/.test(k))) {
      ignored.add(key)
    }
    if (key.split('.').some(k => /^_?default/.test(k))) {
      ignored.add(key)
      if (/:_default$/.test(key)) {
        ignored.add(key.replace(/._default$/, ''))
      }
    }
  })

  const margin_left = "".padStart(2, " ")

  console.log('List of commands:')
  Object.keys(commands).forEach(key => {
    if (ignored.has(key)) return
    console.log(margin_left, key)
  })
}
