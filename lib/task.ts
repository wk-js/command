import { clone, merge } from "lol/js/object"
import { template2 } from "lol/js/string/template"

export class Task {

  private _cmd: string
  private _cwd: string = process.cwd()
  private _name: string = "task"
  private _args: string[] = []
  private _source: string = ""
  private _binPath: string = ""
  private _visible: boolean = true
  private _concurrent: boolean = false
  private _description: string = ""
  private _dependencies: string[] = []
  private _variables: Record<string, string> = {}

  constructor(_cmd: string) {
    const args = _cmd.split(/\s/)
    this._cmd = args.shift() as string
    this._args.push(...args)
  }

  static create(command: string) {
    return new Task(command)
  }

  clone() {
    const command = new Task(this._cmd)
    return command.copy(this)
  }

  copy(command: Task) {
    this._cmd = command._cmd
    this._cwd = command._cwd
    this._name = command._name
    this._args = command._args.slice(0)
    this._source = command._source
    this._dependencies = command._dependencies.slice(0)
    this._binPath = command._binPath
    this._visible = command._visible
    this._concurrent = command._concurrent
    this._description = command._description
    this._variables = clone(command._variables)
    return this
  }

  name(_name: string) {
    this._name = _name
    return this
  }

  cwd(_cwd: string) {
    this._cwd = _cwd
    return this
  }

  binPath(_binPath: string) {
    this._binPath = _binPath
    return this
  }

  description(_description: string) {
    this._description = _description
    return this
  }

  source(_source: string) {
    this._source = _source
    return this
  }

  visible(_visible: boolean) {
    this._visible = _visible
    return this
  }

  concurrent(_concurrent: boolean) {
    this._concurrent = _concurrent
    return this
  }

  arg(arg: string) {
    const args = arg.split(/\s/)
    this._args.push(...args)
    return this
  }

  args(...args: string[]) {
    for (let i = 0; i < args.length; i++) {
      const _args = args[i].split(/\s/)
      this._args.push(..._args)
    }
    return this
  }

  dependsOn(...tasks: string[]) {
    this._dependencies.push(...tasks)
    return this
  }

  variables(variables: Record<string, string>) {
    this._variables = merge(this._variables, variables)
    return this
  }

  toLiteral() {
    return {
      name: template2(this._name, this._variables),
      cwd: template2(this._cwd, this._variables),
      cmd: template2(this._cmd, this._variables),
      source: this._source,
      binPath: template2(this._binPath, this._variables),
      description: template2(this._description, this._variables),
      visible: this._visible,
      concurrent: this._concurrent,
      args: this._args.slice(0).map((item) => template2(item, this._variables)),
      dependencies: this._dependencies.slice(0).map((item) => template2(item, this._variables)),
      template: clone(this._variables)
    }
  }

}