export class Task {

  private _cmd: string
  private _cwd: string = process.cwd()
  private _args: string[] = []
  private _depends: string[] = []
  private _description: string = ""
  private _visible: boolean = true

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
    this._args = command._args.slice(0)
    this._depends = command._depends.slice(0)
    return this
  }

  cwd(_cwd: string) {
    this._cwd = _cwd
    return this
  }

  description(_description: string) {
    this._description = _description
    return this
  }

  visible(_visible: boolean) {
    this._visible = _visible
    return this
  }

  arg(arg: string) {
    this._args.push(arg)
    return this
  }

  args(...args: string[]) {
    this._args.push(...args)
    return this
  }

  dependsOn(...tasks: string[]) {
    this._depends.push(...tasks)
    return this
  }

  to_literal() {
    return {
      cwd: this._cwd,
      cmd: this._cmd,
      description: this._description,
      visible: this._visible,
      args: this._args.slice(0),
      dependencies: this._depends.slice(0),
    }
  }

}