import { Commands2, FileCommands } from "./types";
import { Context } from "./context";
import { template2 } from "lol/js/string/template";
import { flat } from "lol/js/object";

function _TEMPLATE_ESCAPE_REGEX(str: string) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

const COMMAND_REG_OPTIONS = {
  open: '${commands.',
  body: '[a-z@$#-_?!]+',
  close: '}',
}
const TREE_REG_OPTIONS = {
  open: '${tree.',
  body: '[a-z@$#-_?!]+',
  close: '}',
}

const COMMAND_REG = new RegExp(_TEMPLATE_ESCAPE_REGEX(COMMAND_REG_OPTIONS.open) + COMMAND_REG_OPTIONS.body +_TEMPLATE_ESCAPE_REGEX(COMMAND_REG_OPTIONS.close))
const TREE_REG = new RegExp(_TEMPLATE_ESCAPE_REGEX(TREE_REG_OPTIONS.open) + TREE_REG_OPTIONS.body +_TEMPLATE_ESCAPE_REGEX(TREE_REG_OPTIONS.close))

export function find(name: string, commands: Commands2) {
  return commands[name] || commands[`${name}.default`] || commands[`${name}._default`]
}

export function exists(name: string, commands: Commands2) {
  return !!find(name, commands)
}

function replace_stars(command: string, tree: string[]) {
  const reg = new RegExp(_TEMPLATE_ESCAPE_REGEX(COMMAND_REG_OPTIONS.open) + COMMAND_REG_OPTIONS.body +_TEMPLATE_ESCAPE_REGEX(COMMAND_REG_OPTIONS.close), 'g')

  const matches = command.match(reg)
  if (matches) {
    for (let match of matches) {
      const original = match
      match = match.slice(COMMAND_REG_OPTIONS.open.length).slice(0, -COMMAND_REG_OPTIONS.close.length)
      match = match.split('.').map((cmd, index) => {
        if (cmd === "*" && tree[index]) {
          return tree[index]
        }
        return cmd
      }).join('.')
      match = COMMAND_REG_OPTIONS.open + match + COMMAND_REG_OPTIONS.close
      command = command.replace(new RegExp(_TEMPLATE_ESCAPE_REGEX(original), 'g'), match)
    }
  }

  return command
}

export function split_commands(commands: FileCommands, tree: string[] = []) {
  const c: FileCommands = {}

  for (const [name, command] of Object.entries(commands)) {
    for (const subname of name.split('|')) {
      const key = subname
      if (typeof command === "string") {
        tree.push(key)
        let cmd = replace_stars(command, tree)
        cmd = visit(tree.join('.'), cmd, TREE_REG, TREE_REG_OPTIONS, flat(tree))
        c[key] = cmd
        tree.pop()
      } else {
        tree.push(key)
        c[key] = split_commands(command, tree)
        tree.pop()
      }
    }
  }

  return c
}

export function format_commands(commands: FileCommands) {
  const c = flat(split_commands(commands))

  const default_reg = /._?default$/
  const cmds: Record<string, string> = {}
  for (const key in c) {
    let k = key.replace(/\./g, '.')
    cmds[k] = c[key]

    if (default_reg.test(k)) {
      k = k.replace(default_reg, '')
      cmds[k] = c[key]
    }
  }

  return cmds
}

function visit(name: string, command: string, regex: RegExp, options: typeof COMMAND_REG_OPTIONS, data: any) {
  const visited = new Set<string>()

  while (true) {
    if (regex.test(command)) {
      if (visited.has(command)) throw `[wk] Task loop from "${name}"`
      visited.add(command)
      command = template2(command, data, options)
    } else { break }
  }

  return command
}

export function parse(name: string, commands: Commands2) {
  let command = find(name, commands)

  command = visit(name, command, COMMAND_REG, COMMAND_REG_OPTIONS, commands)
  command = template2(command, flat(Context.export()))
  // command = `${command} ${args.join(' ')}`

  return command
}

export function help(commands: Record<string, string>) {
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
