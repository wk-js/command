"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParametersUtils {
    static indexOf(parameters, parameter) {
        var regex = new RegExp(`${parameter}`);
        for (var i = 0; i < parameters.length; i++) {
            if (parameters[i].match(regex) != null) {
                return i;
            }
        }
        return -1;
    }
    static get(parameters, parameter) {
        const index = ParametersUtils.indexOf(parameters, parameter);
        if (index > -1) {
            const io = parameters[index].split(/=/);
            if (io.length == 2)
                return io[1];
            if (typeof parameters[index + 1] == 'string' && !parameters[index + 1].match(/^-/)) {
                return parameters[index + 1];
            }
            return true;
        }
        return false;
    }
    static has(parameters, parameter) {
        return ParametersUtils.indexOf(parameters, parameter);
    }
}
exports.ParametersUtils = ParametersUtils;
