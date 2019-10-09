import { TaskList } from '../task-list';
import { Config } from '../importer';
import { merge, clone } from 'lol/js/object';

export interface WKOptions {
  global: boolean;
  log: string | boolean;
  commands?: string;
}

export function create_list(config: Config, argv: Record<string, string|boolean>) {
  const list = TaskList.create()

  Object.keys(config.commands).forEach((name) => {
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
    if (command.variables) c.variables(merge(command.variables, argv))
  })

  Object.keys(config.concurrents).forEach((name) => {
    const command = config.concurrents[name]
    const c = list.add(name, '[concurrent]')

    c.name(name)
    c.concurrent(true)
    c.dependsOn(...command)
    c.variables(clone(argv))
  })

  return list
}