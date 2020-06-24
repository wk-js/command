import { deep_clone, merge } from "lol/js/object"
import { TagValue, WKOptions } from "./types"
import { Any } from "./tags"

export class Context {

  variables: Record<string, string|boolean> = {}
  args: string[] = []
  private static _global: Record<string, string|boolean> = {}
  static options: WKOptions = {
    commands: 'Commands.yml',
    debug: false,
    nocolor: false,
    verbose: false,
  }

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
    const c = new Context()
    c.variables = deep_clone(Context._global)
    return c
  }

  static global(key: string, value?: string|boolean) {
    if (value) {
      Context._global[key] = value
    }
    return Context._global[key]
  }

  var(key: string, value?: string|boolean) {
    if (value) {
      this.variables[key] = value
    }
    return this.variables[key]
  }

  vars(v?: Record<string, TagValue>) {
    if (v) {
      const vv: Record<string, string|boolean> = {}
      for (const key in v) {
        vv[key] = Any(v[key]) as string | boolean
      }
      merge(this.variables, vv)
    }
    return this.variables
  }

}