import * as Parser from 'lol/js/object/argv'
import { omit, expose } from 'lol/js/object'
import { Command, WKOptions } from './types'

const WK_REG = /^--wk:/
const EXCEPTION_REG = /^--wk$/
const EQUAL_REG = /=/

function is_exception(arg: string) {
  return EXCEPTION_REG.test(arg)
}

export function parse(cmd: string): { wk: WKOptions, variables: Record<string, string|boolean> } {
  const options: WKOptions = {
    commands: 'Commands.yml',
    verbose: false,
    debug: false,
    nocolor: false,
  }
  const variables: Record<string, string|boolean> = {}

  const argv = cmd.trim().split(' ')
  if (argv[0] !== 'wk') return { wk: options, variables }

  const args: string[] = []
  const parameters = argv.slice(1)
  let last_index = 0

  for (let i = 0; i < parameters.length; i++) {
    const arg = parameters[i];
    let [key, value] = arg.split(EQUAL_REG)

    if (is_exception(key)) {
      if (!value && parameters[i+1] && !WK_REG.test(parameters[i+1])) {
        value = parameters[i+1] as string
        i++
      }
      args.push(`--wk::${value}`)
      continue
    }

    if (!WK_REG.test(key)) {
      last_index = i
      break
    }

    key = key.replace(WK_REG, '--')

    if (!value && parameters[i+1] && !WK_REG.test(parameters[i+1])) {
      value = parameters[i+1] as string
      i++
    }

    if (!value) { args.push(key) }
    else { args.push(key, value) }
  }

  const o = Parser.parse(args)
  o['wk::argv'] = parameters.slice(last_index).join(' ').trim()

  const reg = /^wk::/
  for (let key in o) {
    const value = o[key]

    if (reg.test(key)) {
      key = key.replace(reg, '')
      // @ts-ignore
      options[key] = value
      continue
    }

    if (value === "true") {
      variables[key] = true
    } else if (value === "false") {
      variables[key] = false
    } else {
      variables[key] = o[key]
    }
  }

  return {
    wk: options,
    variables,
  }
}

export function render(cmd: string): Command {
  const { wk, variables } = parse(cmd)

  let command = [`wk`]
  if (wk.command) command.push(wk.command)
  if (wk.argv) command.push(wk.argv)

  return [
    command.join(' '),
    {
      variables
    }
  ]
}