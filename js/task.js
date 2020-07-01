"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.parse = exports.format_commands = exports.split_commands = exports.exists = exports.find = void 0;
const context_1 = require("./context");
const template_1 = require("lol/js/string/template");
const object_1 = require("lol/js/object");
function _TEMPLATE_ESCAPE_REGEX(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
const COMMAND_REG_OPTIONS = {
    open: '${commands.',
    body: '[a-z@$#-_?!]+',
    close: '}',
};
const TREE_REG_OPTIONS = {
    open: '${tree.',
    body: '[a-z@$#-_?!]+',
    close: '}',
};
const COMMAND_REG = new RegExp(_TEMPLATE_ESCAPE_REGEX(COMMAND_REG_OPTIONS.open) + COMMAND_REG_OPTIONS.body + _TEMPLATE_ESCAPE_REGEX(COMMAND_REG_OPTIONS.close));
const TREE_REG = new RegExp(_TEMPLATE_ESCAPE_REGEX(TREE_REG_OPTIONS.open) + TREE_REG_OPTIONS.body + _TEMPLATE_ESCAPE_REGEX(TREE_REG_OPTIONS.close));
function find(name, commands) {
    return commands[name] || commands[`${name}.default`] || commands[`${name}._default`];
}
exports.find = find;
function exists(name, commands) {
    return !!find(name, commands);
}
exports.exists = exists;
function replace_stars(command, tree) {
    const reg = new RegExp(_TEMPLATE_ESCAPE_REGEX(COMMAND_REG_OPTIONS.open) + COMMAND_REG_OPTIONS.body + _TEMPLATE_ESCAPE_REGEX(COMMAND_REG_OPTIONS.close), 'g');
    const matches = command.match(reg);
    if (matches) {
        for (let match of matches) {
            const original = match;
            match = match.slice(COMMAND_REG_OPTIONS.open.length).slice(0, -COMMAND_REG_OPTIONS.close.length);
            match = match.split('.').map((cmd, index) => {
                if (cmd === "*" && tree[index]) {
                    return tree[index];
                }
                return cmd;
            }).join('.');
            match = COMMAND_REG_OPTIONS.open + match + COMMAND_REG_OPTIONS.close;
            command = command.replace(new RegExp(_TEMPLATE_ESCAPE_REGEX(original), 'g'), match);
        }
    }
    return command;
}
function split_commands(commands, tree = []) {
    const c = {};
    for (const [name, command] of Object.entries(commands)) {
        for (const subname of name.split('|')) {
            const key = subname;
            if (typeof command === "string") {
                tree.push(key);
                let cmd = replace_stars(command, tree);
                cmd = visit(tree.join('.'), cmd, TREE_REG, TREE_REG_OPTIONS, object_1.flat(tree));
                c[key] = cmd;
                tree.pop();
            }
            else {
                tree.push(key);
                c[key] = split_commands(command, tree);
                tree.pop();
            }
        }
    }
    return c;
}
exports.split_commands = split_commands;
function format_commands(commands) {
    const c = object_1.flat(split_commands(commands));
    const default_reg = /._?default$/;
    const cmds = {};
    for (const key in c) {
        let k = key.replace(/\./g, '.');
        cmds[k] = c[key];
        if (default_reg.test(k)) {
            k = k.replace(default_reg, '');
            cmds[k] = c[key];
        }
    }
    return cmds;
}
exports.format_commands = format_commands;
function visit(name, command, regex, options, data) {
    const visited = new Set();
    while (true) {
        if (regex.test(command)) {
            if (visited.has(command))
                throw `[wk] Task loop from "${name}"`;
            visited.add(command);
            command = template_1.template2(command, data, options);
        }
        else {
            break;
        }
    }
    return command;
}
function parse(name, commands) {
    let command = find(name, commands);
    command = visit(name, command, COMMAND_REG, COMMAND_REG_OPTIONS, commands);
    command = template_1.template2(command, object_1.flat(context_1.Context.export()));
    // command = `${command} ${args.join(' ')}`
    return command;
}
exports.parse = parse;
function help(commands) {
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
exports.help = help;
