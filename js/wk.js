"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.convert = void 0;
const Parser = __importStar(require("lol/js/object/argv"));
const ALL_REG = /^--(var|env|wk)\./;
const VAR_REG = /^--var\./;
const ENV_REG = /^--env\./;
const CONFIG_REG = /^--wk\./;
const PARAM_REG = /^-{1,2}/;
const EQUAL_REG = /=/;
function convert(o) {
    for (const key in o) {
        const value = o[key];
        if (value === "false") {
            o[key] = false;
        }
        else if (value === "true") {
            o[key] = true;
        }
        else if (typeof value === "string" && !isNaN(parseFloat(value))) {
            o[key] = parseFloat(value);
        }
    }
    return o;
}
exports.convert = convert;
function parse(cmd) {
    const options = {
        commands: 'Commands.yml',
        verbose: false,
        debug: false,
        nocolor: false,
        command: '',
        argv: []
    };
    const variables = {};
    const env = {};
    const argv = cmd.trim().split(' ');
    options.argv = argv.slice(1);
    if (argv[0] !== 'wk')
        return { wk: options, variables, env };
    const wk_args = [];
    const var_args = [];
    const env_args = [];
    const parameters = argv.slice(1);
    let last_index = 0;
    for (let i = 0; i < parameters.length; i++) {
        const arg = parameters[i];
        let [key, value] = arg.split(EQUAL_REG);
        if (ALL_REG.test(key)) {
            if (!value && parameters[i + 1] && !PARAM_REG.test(parameters[i + 1])) {
                value = parameters[i + 1];
                i++;
            }
            let arr = wk_args;
            if (CONFIG_REG.test(key)) {
                key = key.replace(CONFIG_REG, '--');
                arr = wk_args;
            }
            else if (VAR_REG.test(key)) {
                key = key.replace(VAR_REG, '--');
                arr = var_args;
            }
            else if (ENV_REG.test(key)) {
                key = key.replace(ENV_REG, '--');
                arr = env_args;
            }
            if (!value) {
                arr.push(key);
            }
            else {
                arr.push(key, value);
            }
            continue;
        }
        last_index = i;
        break;
    }
    const o = Parser.parse(wk_args);
    const args = parameters.slice(last_index);
    o['command'] = args[0];
    o['argv'] = args;
    return {
        wk: Object.assign(options, o),
        variables: convert(Parser.parse(var_args)),
        env: convert(Parser.parse(env_args)),
    };
}
exports.parse = parse;
