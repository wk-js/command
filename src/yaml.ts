import * as YAML from 'js-yaml';
import { readFileSync } from 'fs';
import { TagValue, Commands } from './types';
import * as Tags from './tags'

const TAG_KINDS: ['sequence', 'scalar', 'mapping'] = [ 'sequence', 'scalar', 'mapping' ]
const COMMANDS_REG = /^commands:$/
const VARIABLES_REG = /^variables:$/
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

export function parse_file(path: string): [Record<string, string>, Commands] {
  const content = readFileSync(path, { encoding: 'utf-8' })

  const lines = content.split(LINEBREAK_REG)

  let current_block: string[] = []
  let commands_block: string[] = []
  let variables_block: string[] = []

  lines.forEach(line => {
    if (COMMANDS_REG.test(line)) {
      current_block = commands_block
    } else if (VARIABLES_REG.test(line)) {
      current_block = variables_block
    }

    current_block.push(line)
  })

  const { variables } = parse(variables_block.join('\n'))
  const { commands }  = parse(commands_block.join('\n'), true)
  return [variables, commands]
}