import { Parameters } from "./parameters";
import ChildProcess from "child_process"
import Path from "path"

export class Command {

  private _cwd = process.cwd()
  private _params: string[] = []

  constructor(private _command: string) {
    this.parse()
  }

  parse() {
    const p = Parameters.get('process')
    const cwd = p.get('--wk.cwd')
    if (typeof cwd == 'string') this.cwd(cwd)

    let params = p.clone().slice(1) // Task name

    // Remove cwd
    let index = Parameters.Utils.indexOf(params, '--wk.cwd')
    if (index > -1) params.splice(index, 2)

    // Remove commands
    index = Parameters.Utils.indexOf(params, '--wk.commands')
    if (index > -1) params.splice(index, 2)

    this._params = this._params.concat(params)
  }

  cwd(path: string) {
    this._cwd = path
  }

  execute() {
    let parameters = this._command.split(' ')
    parameters = parameters.concat(this._params)

    const cmd = parameters.shift() as string
    const env = Object.assign({ FORCE_COLOR: true }, process.env)

    const ps = ChildProcess.spawnSync(cmd, parameters, {
      cwd: this._cwd,
      stdio: "inherit",
      env
    })

    if (ps.error) console.log(ps.error)
  }

  private static _commands: Record<string, Command> = {}

  static init() {
    if (!Parameters.has('process')) Parameters.register('process', process.argv.slice(2))
  }

  static create(name: string, command: string) {
    return this._commands[name] = new Command(command)
  }

  static execute(name?: string) {
    if (!name) {
      const p = Parameters.get('process')
      const task = p.atIndex(0)
      if (!task || task.match(/^-+/)) {
        console.log(`No command given`)
      }

      name = task
    }

    if (!this._commands[name]) {
      console.log(`Command with name "${name}" does not exist.`)
      return
    }

    Command._commands[name].execute()
  }

}