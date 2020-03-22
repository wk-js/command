import { Commands, CommandOptions, Task } from "./types";
import { pad } from "lol/js/string";
import { Context } from "./context";
import { Any, get_key } from "./tags";

const ARG_REG = /^arg(\d+|s)$/

export function create_task(name: string, commands: Commands): Task {
  const { references } = Context.current()
  const tasks: string[] = commands[name]
  let Options: CommandOptions = {}

  const items = []

  for (let task of tasks) {
    const type = typeof task

    if (type === 'object') {
      const key = get_key(task)

      if (key === 'None') {
        Options = task as CommandOptions
        continue
      }
    }

    const _task = Any(task)

    if (typeof _task !== 'string') {
      throw `Invalid command "${name}" ${_task}`
    }

    const argv = _task.split(' ')
    if (commands.hasOwnProperty(argv[0])) {
      const ctx = Context.create()

      Object.entries(references)
      .forEach(([key, value]) => {
        if (!(ARG_REG.test(key))) {
          ctx.references[key] = value
        }
      })

      const args = argv.slice(1)
      ctx.references["args"] = args.join(' ')
      ctx.references["caller"] = name
      args.forEach((a, i) => ctx.references[`arg${i+1}`] = a)

      Context.push(ctx)
      const t = create_task(argv[0], commands)
      items.push(t)
      Context.pop()
    } else {
      items.push(_task)
    }
  }

  if (items.length === 1) {
    return {
      Exec: items[0],
      Options,
    }
  }

  if (Options.parallel) {
    return {
      Parallel: items,
      Options,
    }
  }

  return {
    Serie: items,
    Options,
  }
}

export function help(commands: Commands) {
  const lengths: number[] = []
  const desc: Record<string, CommandOptions> = {}
  Object.keys(commands).forEach(key => {
    for (const task of commands[key]) {
      if (typeof task === 'object') {
        if (get_key(task) !== 'None') continue

        const options = task as CommandOptions
        desc[key] = options

        let l = key.length
        if (options.descargs) l += options.descargs.length
        lengths.push(l)

        break
      }
    }
  })

  const margin_left = pad('', 2, ' ')
  const margin_right = 2
  const length = Math.max(...lengths) + margin_right

  console.log('List of commands:')
  Object.keys(commands).forEach(key => {
    if (key[0] == '_') return

    if (desc.hasOwnProperty(key)) {
      const options = desc[key] as CommandOptions
      if (options.descargs) {
        key = `${key} ${options.descargs}`
      }

      if (options.desc) {
        console.log(margin_left, pad(key, length, ' ', true), `# ${options.desc}`)
        return
      }
    }
    console.log(margin_left, key)
  })
}