import * as Parser from 'lol/js/object/argv'
import { WKOptions, DStringBool } from './types'

const ALL_REG = /^--(var|env|wk)\./
const VAR_REG = /^--var\./
const ENV_REG = /^--env\./
const CONFIG_REG = /^--wk\./
const PARAM_REG = /^-{1,2}/
const EQUAL_REG = /=/

export function convert(o: Record<string, string|boolean|number>) {
  for (const key in o) {
    const value = o[key]
    if (value === "false") {
      o[key] = false
    } else if (value === "true") {
      o[key] = true
    } else if (typeof value === "string" && !isNaN(parseFloat(value))) {
      o[key] = parseFloat(value)
    }
  }
  return o
}

export function parse(cmd: string): { wk: WKOptions, variables: DStringBool, env: DStringBool } {
  const options: WKOptions = {
    commands: 'Commands.yml',
    verbose: false,
    debug: false,
    nocolor: false,
    command: '',
    argv: []
  }
  const variables: Record<string, string|boolean> = {}
  const env: Record<string, string|boolean> = {}

  const argv = cmd.trim().split(' ')
  options.argv = argv.slice(1)
  if (argv[0] !== 'wk') return { wk: options, variables, env }

  const wk_args: string[] = []
  const var_args: string[] = []
  const env_args: string[] = []
  const parameters = argv.slice(1)
  let last_index = 0

  for (let i = 0; i < parameters.length; i++) {
    const arg = parameters[i];
    let [key, value] = arg.split(EQUAL_REG)

    if (ALL_REG.test(key)) {
      if (!value && parameters[i+1] && !PARAM_REG.test(parameters[i+1])) {
        value = parameters[i+1] as string
        i++
      }

      let arr = wk_args

      if (CONFIG_REG.test(key)) {
        key = key.replace(CONFIG_REG, '--')
        arr = wk_args
      } else if (VAR_REG.test(key)) {
        key = key.replace(VAR_REG, '--')
        arr = var_args
      } else if (ENV_REG.test(key)) {
        key = key.replace(ENV_REG, '--')
        arr = env_args
      }

      if (!value) { arr.push(key) }
      else { arr.push(key, value) }

      continue
    }

    last_index = i
    break
  }

  const o = Parser.parse(wk_args) as unknown as WKOptions
  const args = parameters.slice(last_index)
  o['command'] = args[0]
  o['argv'] = args

  return {
    wk: Object.assign(options, o),
    variables: convert(Parser.parse(var_args)) as DStringBool,
    env: convert(Parser.parse(env_args)) as DStringBool,
  }
}