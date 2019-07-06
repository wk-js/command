import { ParametersUtils } from "./parameters-utils";

export class Parameters {

  constructor(private _parameters: string[]) {}

  get(parameter: string) {
    return ParametersUtils.get(this._parameters, parameter)
  }

  has(parameter: string) {
    return ParametersUtils.indexOf(this._parameters, parameter) > -1
  }

  indexOf(parameter: string) {
    return ParametersUtils.indexOf(this._parameters, parameter)
  }

  atIndex(index: number) {
    return this._parameters[index]
  }

  clone() {
    return this._parameters.slice(0)
  }

  private static _parameters: Record<string, Parameters> = {}

  static Utils = ParametersUtils

  static register(name: string, parameters: string|string[]) {
    let params: string[]
    if (typeof parameters == 'string') {
      params = parameters.split(' ')
    } else {
      params = parameters
    }
    return Parameters._parameters[name] = new Parameters(params)
  }

  static get(name: string) {
    return Parameters._parameters[name]
  }

  static has(name: string) {
    return !!Parameters._parameters[name]
  }

}
