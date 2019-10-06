export class Task {

  private _cmd: string
  private _cwd: string = process.cwd()
  private _name: string = "task"
  private _args: string[] = []
  private _source: string = ""
  private _depends: string[] = []
  private _binPath: string = ""
  private _visible: boolean = true
  private _concurrent: boolean = false
  private _description: string = ""

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
    this._depends = command._depends.slice(0)
    this._binPath = command._binPath
    this._visible = command._visible
    this._concurrent = command._concurrent
    this._description = command._description
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
    this._depends.push(...tasks)
    return this
  }

  toLiteral() {
    return {
      name: this._name,
      cwd: this._cwd,
      cmd: this._cmd,
      source: this._source,
      binPath: this._binPath,
      description: this._description,
      visible: this._visible,
      concurrent: this._concurrent,
      args: this._args.slice(0),
      dependencies: this._depends.slice(0),
    }
  }

}