import { merge, deep_clone } from "lol/js/object"
import { TagValue, WKOptions } from "./types"
import { Any } from "./tags"

export class Context {

  static _env: Record<string, string> = {}
  static _variables: Record<string, string|boolean> = {}
  static _config: WKOptions = {
    commands: 'Commands.yml',
    debug: false,
    nocolor: false,
    verbose: false,
  }

  static export() {
    return deep_clone<{
      variables: Record<string, string|boolean>,
      config: WKOptions
    }>({
      variables: this._variables,
      config: this._config,
      env: this._env,
    })
  }

  static env(key: string, value?: string) {
    if (value) {
      this._env[key] = value
    }
    return this._env[key]
  }

  static envs(v?: Record<string, string|undefined>) {
    if (v) {
      merge(this._env, v)
    }
    return this._env
  }

  static var(key: string, value?: string|boolean) {
    if (value) {
      this._variables[key] = value
    }
    return this._variables[key]
  }

  static vars(v?: Record<string, TagValue>) {
    if (v) {
      const vv: Record<string, string|boolean> = {}
      for (const key in v) {
        vv[key] = Any(v[key]) as string | boolean
      }
      merge(this._variables, vv)
    }
    return this._variables
  }

  static config<K extends keyof WKOptions>(key: K, value?: WKOptions[K]) {
    if (value) {
      this._config[key] = value
    }
    return this._config[key]
  }

  static configs(v?: Partial<WKOptions>) {
    if (v) {
      const vv: Record<string, string|boolean> = {}
      Object.entries(v).forEach(([key, value]) => {
        vv[key] = Any(value as any) as string | boolean
      })
      merge(this._config, vv)
    }
    return this._config
  }

}