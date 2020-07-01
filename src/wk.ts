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

export function parse(argv: string[]): { wk: WKOptions, variables: DStringBool, env: DStringBool } {
  const wk_args: string[] = []
  const var_args: string[] = []
  const env_args: string[] = []
  let last_index = 0

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    let [key, value] = arg.split(EQUAL_REG)

    if (ALL_REG.test(key)) {
      if (!value && argv[i+1] && !PARAM_REG.test(argv[i+1])) {
        value = argv[i+1] as string
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
  const args = argv.slice(last_index)
  o['command'] = args[0]
  o['argv'] = args

  return {
    wk: Object.assign({
      commands: 'Commands.yml',
      verbose: false,
      debug: false,
      nocolor: false,
      command: '',
      argv: []
    }, o),
    variables: convert(Parser.parse(var_args)) as DStringBool,
    env: convert(Parser.parse(env_args)) as DStringBool,
  }
}