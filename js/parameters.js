"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parameters_utils_1 = require("./parameters-utils");
class Parameters {
    constructor(_parameters) {
        this._parameters = _parameters;
    }
    get(parameter) {
        return parameters_utils_1.ParametersUtils.get(this._parameters, parameter);
    }
    has(parameter) {
        return parameters_utils_1.ParametersUtils.indexOf(this._parameters, parameter) > -1;
    }
    indexOf(parameter) {
        return parameters_utils_1.ParametersUtils.indexOf(this._parameters, parameter);
    }
    atIndex(index) {
        return this._parameters[index];
    }
    clone() {
        return this._parameters.slice(0);
    }
    static register(name, parameters) {
        let params;
        if (typeof parameters == 'string') {
            params = parameters.split(' ');
        }
        else {
            params = parameters;
        }
        return Parameters._parameters[name] = new Parameters(params);
    }
    static get(name) {
        return Parameters._parameters[name];
    }
    static has(name) {
        return !!Parameters._parameters[name];
    }
}
Parameters._parameters = {};
Parameters.Utils = parameters_utils_1.ParametersUtils;
exports.Parameters = Parameters;
