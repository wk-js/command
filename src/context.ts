export class Context {

  references: Record<string, string|boolean> = {}

  private constructor() {}

  private static pool: Context[] = []
  private static _current?: Context

  static push(context: Context) {
    if (Context._current) Context.pool.push(Context._current)
    return Context._current = context
  }

  static pop() {
    const current = Context._current
    const refs = Context.pool.pop()
    Context._current = refs
    return current
  }

  static current() {
    if (!Context._current) {
      throw 'No current context'
    }
    return Context._current
  }

  static create() {
    return new Context()
  }

}