import { TaskList } from '../task-list';
import { Config } from '../importer';
import { sort } from 'lol/js/array'

export interface WKOptions {
  log: string | boolean;
  commands?: string;
}

export function create_list(config: Config) {
  const list = TaskList.create()

  sort(Object.keys(config.commands)).forEach((name) => {
    const command = config.commands[name]
    const c = list.add(name, command.command)
    c.name(command.name ? command.name : name)
    if (command.cwd) c.cwd(command.cwd)
    if (command.args) c.args(...command.args)
    if (command.source) c.source(command.source)
    if (command.binPath) c.binPath(command.binPath)
    if (typeof command.visible == 'boolean') c.visible(command.visible)
    if (command.dependsOn) c.dependsOn(...command.dependsOn)
    if (command.description) c.description(command.description)
    if (command.variables) c.variables(command.variables)
  })

  sort(Object.keys(config.concurrents)).forEach((name) => {
    const concurrent = config.concurrents[name]
    const c = list.add(name, '[concurrent]')

    c.name(concurrent.name ? concurrent.name : name)
    c.concurrent(concurrent.commands)
    if (concurrent.source) c.source(concurrent.source)
    if (typeof concurrent.visible == 'boolean') c.visible(concurrent.visible)
    if (concurrent.dependsOn) c.dependsOn(...concurrent.dependsOn)
    if (concurrent.description) c.description(concurrent.description)
    if (concurrent.variables) c.variables(concurrent.variables)
  })

  return list
}

export function extract_wks(argv: string[]) : [string[], string[]] {
  const nargv = argv.slice(0)
  const wkargv: string[] = []
  let wkRegex = /^-{1,2}(wk)\./

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];

    if (a.match(wkRegex)) {
      const index = nargv.indexOf(a)
      if (index == -1) continue

      wkargv.push(...nargv.splice(index, 1))

      if (a.match(/^-{1,2}wk\.commands/) && !a.match(/=/)) {
        nargv.splice(index, 1)
        wkargv.push(...nargv.splice(index, 1))
      }
    }
  }

  return [
    wkargv.map(a => a.replace('wk.', '')),
    nargv
  ]
}

export function extract_vars(argv: string[]) : [string[], string[]] {
  const nargv = argv.slice(0)
  const varargv: string[] = []
  let wkRegex = /^-{1,2}(var)\./

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];

    if (a.match(wkRegex)) {
      const index = nargv.indexOf(a)
      if (index == -1) continue

      varargv.push(...nargv.splice(index, 1))

      if (!a.match(/=/)) {
        varargv.push(...nargv.splice(index, 1))
      }
    }
  }

  return [
    varargv.map(a => a.replace('var.', '')),
    nargv
  ]
}