"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const string_1 = require("lol/js/string");
const context_1 = require("./context");
const tags_1 = require("./tags");
const ARG_REG = /^arg(\d+|s)$/;
function create_task(name, commands) {
    const { references } = context_1.Context.current();
    const tasks = commands[name];
    let Options = { name };
    const items = [];
    for (let task of tasks) {
        const type = typeof task;
        if (type === 'object') {
            const key = tags_1.get_key(task);
            if (key === 'None') {
                Options = task;
                Options.name = name;
                continue;
            }
        }
        const _task = tags_1.Any(task);
        if (typeof _task !== 'string') {
            throw `Invalid command "${name}" ${_task}`;
        }
        const argv = _task.split(' ');
        if (commands.hasOwnProperty(argv[0])) {
            const ctx = context_1.Context.create();
            Object.entries(references)
                .forEach(([key, value]) => {
                if (!(ARG_REG.test(key))) {
                    ctx.references[key] = value;
                }
            });
            const args = argv.slice(1);
            ctx.references["args"] = args.join(' ');
            ctx.references["caller"] = name;
            args.forEach((a, i) => ctx.references[`arg${i + 1}`] = a);
            context_1.Context.push(ctx);
            const t = create_task(argv[0], commands);
            items.push(t);
            context_1.Context.pop();
        }
        else {
            items.push(_task);
        }
    }
    if (items.length === 1) {
        return {
            Exec: items[0],
            Options,
        };
    }
    if (Options.parallel) {
        return {
            Parallel: items,
            Options,
        };
    }
    return {
        Serie: items,
        Options,
    };
}
exports.create_task = create_task;
function help(commands) {
    const lengths = [];
    const desc = {};
    Object.keys(commands).forEach(key => {
        for (const task of commands[key]) {
            if (typeof task === 'object') {
                if (tags_1.get_key(task) !== 'None')
                    continue;
                const options = task;
                desc[key] = options;
                let l = key.length;
                if (options.descargs)
                    l += options.descargs.length;
                lengths.push(l);
                break;
            }
        }
    });
    const margin_left = string_1.pad('', 2, ' ');
    const margin_right = 2;
    const length = Math.max(...lengths) + margin_right;
    console.log('List of commands:');
    Object.keys(commands).forEach(key => {
        if (key[0] == '_')
            return;
        if (desc.hasOwnProperty(key)) {
            const options = desc[key];
            if (options.descargs) {
                key = `${key} ${options.descargs}`;
            }
            if (options.desc) {
                console.log(margin_left, string_1.pad(key, length, ' ', true), `# ${options.desc}`);
                return;
            }
        }
        console.log(margin_left, key);
    });
}
exports.help = help;
