"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.help2 = exports.create_task = exports.create_task2 = exports.format_commands = exports.exists = exports.find = void 0;
const string_1 = require("lol/js/string");
const context_1 = require("./context");
const template_1 = require("lol/js/string/template");
const ARG_REG = /^arg(\d+|s)$/;
function _TEMPLATE_ESCAPE_REGEX(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
const VAR_REG_OPTIONS = {
    open: '${wk:',
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
    const default_reg = /:_?default$/;
    const cmds = {};
    for (const key in commands) {
        let k = key.replace(/\./g, ':');
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
    const { variables, args } = context_1.Context.current();
    command = template_1.template2(command, variables);
    command = `${command} ${args.join(' ')}`;
    return command;
}
exports.create_task2 = create_task2;
function create_task(name, commands) {
    return null;
    // const command = commands[name]
    // let options: CommandOptions = { name }
    // let task: string
    // if (Array.isArray(command)) {
    //   task = command[0]
    //   options = command[1]
    //   options.name = name
    //   let env: Record<string, string|boolean> = {}
    //   if (options.env) {
    //     Object.entries(options.env).forEach(([key, value]) => {
    //       env[key] = Scalar(value)
    //     })
    //   }
    //   options.env = env
    // } else {
    //   task = command
    // }
    // const ctx = Context.current()
    // if (options.variables) {
    //   ctx.vars(options.variables)
    // }
    // let exec = (()=>{
    //   if (typeof task === "string") {
    //     return Any({ Sub: task })
    //   }
    //   return Any(task)
    // })()
    // if (typeof exec !== 'string') {
    //   throw `Invalid command "${name}" ${exec}`
    // }
    // exec = [ exec, ...ctx.args ].join(' ')
    // const argv = exec.split(' ')
    // const name0 = argv.filter(a => !!a)[1]
    // if (argv[0].trim() === "wk" && commands[name0] && name0 !== name) {
    //   const ctx = Context.create()
    //   ctx._variables['wk::caller'] = name
    //   ctx.args = argv.slice(argv.indexOf(name0)+1)
    //   Context.push(ctx)
    //   const variant = create_task(name0, commands)
    //   Context.pop()
    //   return variant
    // }
    // return {
    //   Exec: exec,
    //   Options: options
    // }
    // // const items = []
    // // for (let task of tasks) {
    // //   const type = typeof task
    // //   if (type === 'object') {
    // //     const key = get_key(task)
    // //     if (key === 'None') {
    // //       Options = task as CommandOptions
    // //       Options.name = name
    // //       let env: Record<string, string|boolean> = {}
    // //       if (Options.env) {
    // //         Object.entries(Options.env).forEach(([key, value]) => {
    // //           env[key] = Scalar(value)
    // //         })
    // //       }
    // //       Options.env = env
    // //       continue
    // //     }
    // //   }
    // //   const _task = Any(task)
    // //   if (typeof _task !== 'string') {
    // //     throw `Invalid command "${name}" ${_task}`
    // //   }
    // //   const argv = _task.split(' ')
    // //   if (commands.hasOwnProperty(argv[0])) {
    // //     const ctx = Context.create()
    // //     Object.entries(references)
    // //     .forEach(([key, value]) => {
    // //       if (!(ARG_REG.test(key))) {
    // //         ctx.references[key] = value
    // //       }
    // //     })
    // //     const args = argv.slice(1)
    // //     ctx.references["args"] = args.join(' ')
    // //     ctx.references["caller"] = name
    // //     args.forEach((a, i) => ctx.references[`arg${i+1}`] = a)
    // //     Context.push(ctx)
    // //     const t = create_task(argv[0], commands)
    // //     items.push(t)
    // //     Context.pop()
    // //   } else {
    // //     items.push(_task)
    // //   }
    // // }
    // // if (items.length === 1) {
    // //   return {
    // //     Exec: items[0],
    // //     Options,
    // //   }
    // // }
    // // if (Options.parallel) {
    // //   return {
    // //     Parallel: items,
    // //     Options,
    // //   }
    // // }
    // // return {
    // //   Serie: items,
    // //   Options,
    // // }
}
exports.create_task = create_task;
function help2(commands) {
    const ignored = new Set();
    Object.keys(commands).forEach(key => {
        if (key.split(':').some(k => /^_/.test(k))) {
            ignored.add(key);
        }
        if (key.split(':').some(k => /^_?default/.test(k))) {
            ignored.add(key);
            if (/:_default$/.test(key)) {
                ignored.add(key.replace(/:_default$/, ''));
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
function help(commands) {
    const lengths = [];
    const desc = {};
    Object.keys(commands).forEach(key => {
        if (key[0] === '_')
            return;
        // for (const task of commands[key]) {
        //   if (typeof task === 'object') {
        //     if (get_key(task) !== 'None') continue
        //     const options = task as CommandOptions
        //     desc[key] = options
        //     let l = key.length
        //     if (options.descargs) l += options.descargs.length
        //     lengths.push(l)
        //     break
        //   }
        // }
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
