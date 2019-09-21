import TOML from "toml";
import { isFile } from "lol/js/node/fs";
import * as Path from "path";
import * as Fs from "fs";
import { parse } from "./utils";
import { TaskList } from "./task-list";

interface ICommand {
  command: string
  cwd?: string
  description?: string
  visible?: boolean
  args?: string[]
  dependsOn?: string[]
}

interface ICommands {
  commands: Record<string, ICommand|string>
}

function fetch_commands(argv: Record<string, string | boolean>) {
  const paths = [
    argv['wk.commands'],
    Path.join(process.cwd(), 'Commands.toml'),
    Path.join(process.cwd(), 'commands.toml'),
    'package.json'
  ]

  for (let i = 0; i < paths.length; i++) {
    const file = paths[i];
    if (typeof file == 'string' && isFile(file)) {
      const content = Fs.readFileSync(file, "utf-8")

      if (file == 'package.json') {
        return JSON.parse(content) as ICommands
      } else {
        return TOML.parse(content) as ICommands
      }
    }
  }

  return null
}


function main() {
  const argv = parse(process.argv.slice(2))

  const file = fetch_commands(argv)
  if (!file || !file.commands) {
    console.log(`No Commands.toml or package.json with "commands" property found`)
    return
  }

  const list = TaskList.create()

  Object.keys(file.commands).forEach((name) => {
    const command = file.commands[name]
    if (typeof command == 'string') {
      list.register(name, command)
    } else {
      const c = list.register(name, command.command)
      if (command.cwd) c.cwd(command.cwd)
      if (command.args) c.args(...command.args)
      if (command.dependsOn) c.dependsOn(...command.dependsOn)
      if (command.description) c.description(command.description)
      if (command.visible) c.visible(command.visible)
    }
  })

  if (typeof argv['0'] == 'string') {
    list.run(argv['0'] as string).catch((e) => {
      console.log(`Task "${argv['0']}" failed.`)
      if (e.code == 'ENOENT') {
        console.log('ERR: No such file or directory')
      } else {
        console.log(e)
      }
    })
  } else {
    console.log(`Tasks availables`)
    list.description().forEach((task) => {
      if (task.visible) {
        if (task.description) {
          console.log("*", task.name, '-', task.description)
        } else {
          console.log("*", task.name)
        }
      }
    })
  }
}

main()