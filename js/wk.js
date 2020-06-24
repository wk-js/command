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
exports.render = exports.parse = void 0;
const Parser = __importStar(require("lol/js/object/argv"));
const WK_REG = /^--wk:/;
const EXCEPTION_REG = /^--wk$/;
const EQUAL_REG = /=/;
function is_exception(arg) {
    return EXCEPTION_REG.test(arg);
}
function parse(cmd) {
    const options = {
        commands: 'Commands.yml',
        verbose: false,
        debug: false,
        nocolor: false,
    };
    const variables = {};
    const argv = cmd.trim().split(' ');
    if (argv[0] !== 'wk')
        return { wk: options, variables };
    const args = [];
    const parameters = argv.slice(1);
    let last_index = 0;
    for (let i = 0; i < parameters.length; i++) {
        const arg = parameters[i];
        let [key, value] = arg.split(EQUAL_REG);
        if (is_exception(key)) {
            if (!value && parameters[i + 1] && !WK_REG.test(parameters[i + 1])) {
                value = parameters[i + 1];
                i++;
            }
            args.push(`--wk::${value}`);
            continue;
        }
        if (!WK_REG.test(key)) {
            last_index = i;
            break;
        }
        key = key.replace(WK_REG, '--');
        if (!value && parameters[i + 1] && !WK_REG.test(parameters[i + 1])) {
            value = parameters[i + 1];
            i++;
        }
        if (!value) {
            args.push(key);
        }
        else {
            args.push(key, value);
        }
    }
    const o = Parser.parse(args);
    o['wk::argv'] = parameters.slice(last_index).join(' ').trim();
    const reg = /^wk::/;
    for (let key in o) {
        const value = o[key];
        if (reg.test(key)) {
            key = key.replace(reg, '');
            // @ts-ignore
            options[key] = value;
            continue;
        }
        if (value === "true") {
            variables[key] = true;
        }
        else if (value === "false") {
            variables[key] = false;
        }
        else {
            variables[key] = o[key];
        }
    }
    return {
        wk: options,
        variables,
    };
}
exports.parse = parse;
function render(cmd) {
    const { wk, variables } = parse(cmd);
    let command = [`wk`];
    if (wk.command)
        command.push(wk.command);
    if (wk.argv)
        command.push(wk.argv);
    return [
        command.join(' '),
        {
            variables
        }
    ];
}
exports.render = render;
