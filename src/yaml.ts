import * as YAML from 'js-yaml';
import { readFileSync } from 'fs';
import { TagValue, Commands, WKOptions } from './types';
import * as Tags from './tags'
import { omit } from 'lol/js/object'

const TAG_KINDS: ['sequence', 'scalar', 'mapping'] = [ 'sequence', 'scalar', 'mapping' ]
const COMMANDS_REG = /^commands:$/
const VARIABLES_REG = /^variables:$/
const CONFIG_REG = /^config:$/
const LINEBREAK_REG = /\n/

export function create_schema(json = false) {
  const explicit: YAML.Type[] = []
  Tags.TAGS.forEach(tag => {
    TAG_KINDS.forEach(kind => {
      explicit.push(new YAML.Type(`!${tag}`, {
        kind,
        construct: (data: any) => {
          return json ?
          { [tag]: data } :
          Tags.Any({ [tag]: data } as TagValue)
        },
        predicate: (data: any) => {
          return Tags.has_key(data, tag)
        },
        represent: (data: any) => {
          return Tags.Any(data[tag])
        },
      }))
    })
  })

  return new YAML.Schema({
    include: [YAML.CORE_SCHEMA],
    implicit: [],
    explicit
  })
}

export function parse(content: string, json = false) {
  const schema = create_schema(json)
  return YAML.safeLoad(content, { schema })
}

export function parse_file(path: string): [Record<string, string>, Commands, Partial<WKOptions>] {
  const content = readFileSync(path, { encoding: 'utf-8' })

  const lines = content.split(LINEBREAK_REG)

  let current_block: string[] = []
  let commands_block: string[] = []
  let variables_block: string[] = []
  let config_block: string[] = []

  lines.forEach(line => {
    if (COMMANDS_REG.test(line)) {
      current_block = commands_block
    } else if (VARIABLES_REG.test(line)) {
      current_block = variables_block
    } else if (CONFIG_REG.test(line)) {
      current_block = config_block
    }

    current_block.push(line)
  })

  let variables: Record<string, string> = {}
  let commands: Commands = {}
  let config: Partial<WKOptions> = {}

  if (variables_block.length > 0) {
    const p0 = parse(variables_block.join('\n'))
    variables = Object.assign(variables, p0.variables)
  }

  if (commands_block.length > 0) {
    const p0 = parse(commands_block.join('\n'), true)
    commands = Object.assign(commands, p0.commands)
  }

  if (config_block.length > 0) {
    const p0 = parse(config_block.join('\n'))
    config = Object.assign(config, omit(p0.config, 'commands'))
  }

  return [variables, commands, config]
}