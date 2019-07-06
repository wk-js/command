"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Parameters {
    static set(name, parameters) {
        let params;
        if (typeof parameters == 'string') {
            params = parameters.split(' ');
        }
        else {
            params = parameters;
        }
        return Parameters._parameters[name] = params;
    }
    static get() {
        return Parameters._parameters[name];
    }
}
Parameters._parameters = {};
exports.Parameters = Parameters;
