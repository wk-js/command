"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const string_1 = require("lol/js/string");
let _silent = false;
function silent(_muted = _silent) {
    return _silent = _muted;
}
exports.silent = silent;
function command(command, cwd) {
    if (_silent)
        return;
    console.log(chalk_1.default.grey('> From'), cwd);
    console.log(chalk_1.default.grey('> Running'), command);
    console.log("");
    console.log("");
}
exports.command = command;
function warn(...args) {
    console.log(chalk_1.default.yellow('[warn]'), ...args);
}
exports.warn = warn;
function err(...args) {
    console.log(chalk_1.default.red('[err]'), ...args);
}
exports.err = err;
function list(args, type = 'default') {
    let length = 0;
    let gap = 3;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (Array.isArray(arg)) {
            if (arg[0].length > length)
                length = arg[0].length;
        }
        else {
            if (arg.length > length)
                length = arg.length;
        }
    }
    length += gap;
    for (let j = 0; j < args.length; j++) {
        const arg = args[j];
        let str = chalk_1.default.grey('*') + ' ';
        if (Array.isArray(arg)) {
            str += string_1.pad(arg[0], length, ' ', true);
            if (type == 'default') {
                str += chalk_1.default.grey(arg[1]);
            }
            else if (type == 'success') {
                str += arg[1] ? chalk_1.default.green('Success') : chalk_1.default.red('Failed');
            }
        }
        else {
            str += arg;
        }
        console.log(str);
    }
}
exports.list = list;
