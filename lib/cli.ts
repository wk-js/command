import TOML from "toml";
import { isFile } from "lol/js/node/fs"
import Fs from "fs";
import Path from "path"
import { Command } from "./command";
import { Parameters } from "./parameters";

interface ICommand {
  cwd?: string
  command: string
}

interface ICommands {
  commands: Record<string, ICommand|string>
}

function fetch_commands() {
  const paths = [
    Parameters.get('process').get('--wk.commands') as string,
    Path.join(process.cwd(), 'Commands.toml'),
    Path.join(process.cwd(), 'commands.toml')
  ]

  for (let i = 0; i < paths.length; i++) {
    const file = paths[i];
    if (isFile(file)) {
      const content = Fs.readFileSync(file, "utf-8")
      return TOML.parse(content) as ICommands
    }
  }

  return null
}

function main() {
  Command.init()

  const file = fetch_commands()
  if (!file) {
    console.log(`No Command.toml found`)
    return
  }

  Object.keys(file.commands).forEach((name) => {
    const command = file.commands[name]
    if (typeof command == 'string') {
      Command.create(name, command)
    } else {
      const c = Command.create(name, command.command)
      if (command.cwd) c.cwd(command.cwd)
    }
  })

  Command.execute()
}

main()