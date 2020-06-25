"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help2 = exports.create_task2 = exports.format_commands = exports.exists = exports.find = void 0;
const context_1 = require("./context");
const template_1 = require("lol/js/string/template");
const object_1 = require("lol/js/object");
const ARG_REG = /^arg(\d+|s)$/;
function _TEMPLATE_ESCAPE_REGEX(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
const VAR_REG_OPTIONS = {
    open: '${commands.',
    body: '[a-z@$#-_?!]+',
    close: '}',
};
const VAR_REG = new RegExp(_TEMPLATE_ESCAPE_REGEX(VAR_REG_OPTIONS.open) + VAR_REG_OPTIONS.body + _TEMPLATE_ESCAPE_REGEX(VAR_REG_OPTIONS.close));
function find(name, commands) {
    return commands[name] || commands[`${name}.default`] || commands[`${name}._default`];
}
exports.find = find;
function exists(name, commands) {
    return !!find(name, commands);
}
exports.exists = exists;
function format_commands(commands) {
    const default_reg = /._?default$/;
    const cmds = {};
    for (const key in commands) {
        let k = key.replace(/\./g, '.');
        cmds[k] = commands[key];
        if (default_reg.test(k)) {
            k = k.replace(default_reg, '');
            cmds[k] = commands[key];
        }
    }
    return cmds;
}
exports.format_commands = format_commands;
function create_task2(name, commands) {
    let command = find(name, commands);
    const visited = new Set();
    while (true) {
        if (VAR_REG.test(command)) {
            if (visited.has(command))
                throw `[wk] Task loop from "${name}"`;
            visited.add(command);
            command = template_1.template2(command, commands, VAR_REG_OPTIONS);
        }
        else {
            break;
        }
    }
    command = template_1.template2(command, object_1.flat(context_1.Context.export()));
    // command = `${command} ${args.join(' ')}`
    return command;
}
exports.create_task2 = create_task2;
function help2(commands) {
    const ignored = new Set();
    Object.keys(commands).forEach(key => {
        if (key.split('.').some(k => /^_/.test(k))) {
            ignored.add(key);
        }
        if (key.split('.').some(k => /^_?default/.test(k))) {
            ignored.add(key);
            if (/:_default$/.test(key)) {
                ignored.add(key.replace(/._default$/, ''));
            }
        }
    });
    const margin_left = "".padStart(2, " ");
    console.log('List of commands:');
    Object.keys(commands).forEach(key => {
        if (ignored.has(key))
            return;
        console.log(margin_left, key);
    });
}
exports.help2 = help2;
