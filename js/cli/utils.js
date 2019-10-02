"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("lol/js/node/fs");
const object_1 = require("lol/js/object");
const Path = __importStar(require("path"));
const Fs = __importStar(require("fs"));
const toml_1 = __importDefault(require("toml"));
const task_list_1 = require("../task-list");
const Log = __importStar(require("../log"));
function load(path) {
    let config = { commands: {} };
    if (!fs_1.isFile(path)) {
        throw new Error(`"${path}" is not a file`);
    }
    const content = Fs.readFileSync(path, 'utf-8');
    try {
        if (Path.extname(path) == '.toml') {
            config = toml_1.default.parse(content);
        }
        else if (Path.extname(path) == '.json') {
            config = JSON.parse(content);
        }
    }
    catch (e) {
        throw new Error(`Cannot parse "${path}"`);
    }
    if (config.extends != null) {
        for (const e of config.extends) {
            config.commands = object_1.merge(load(e), config.commands);
        }
    }
    return config.commands;
}
exports.load = load;
function lookup() {
    const paths = [
        Path.join(process.cwd(), 'Commands.toml'),
        Path.join(process.cwd(), 'commands.toml'),
        'package.json'
    ];
    for (const p of paths) {
        if (fs_1.isFile(p))
            return load(p);
    }
    throw new Error('No commands found.');
}
exports.lookup = lookup;
function create_list(commands) {
    const list = task_list_1.TaskList.create();
    Object.keys(commands).forEach((name) => {
        const command = commands[name];
        if (typeof command == 'string') {
            list.add(name, command);
        }
        else {
            const c = list.add(name, command.command);
            if (command.cwd)
                c.cwd(command.cwd);
            if (command.args)
                c.args(...command.args);
            if (command.binPath)
                c.binPath(command.binPath);
            if (command.visible)
                c.visible(command.visible);
            if (command.dependsOn)
                c.dependsOn(...command.dependsOn);
            if (command.description)
                c.description(command.description);
        }
    });
    return list;
}
exports.create_list = create_list;
function list_tasks(list) {
    console.log('Task availables');
    const tasks = list.all()
        .map(t => t.toLiteral())
        .filter(t => t.visible)
        .map(t => {
        if (t.description) {
            return [t.name, t.description];
        }
        else {
            return t.name;
        }
    });
    Log.list(tasks);
}
exports.list_tasks = list_tasks;
function help() {
    console.log('Parameters availables');
    Log.list([
        ['--wk.commands=[PATH]', 'Set commands file path'],
        ['--wk.verbose', 'Display error stack']
    ]);
}
exports.help = help;
function pass_args(task, argv) {
    Object.keys(argv).forEach((key) => {
        if (!key.match(/^wk\./)) {
            if (!isNaN(parseFloat(key))) {
                if (argv[key] != argv['0'])
                    task.arg(argv[key]);
            }
            else if (key.length == 1 && typeof argv[key] == 'boolean') {
                task.arg(`-${key}`);
            }
            else if (typeof argv[key] == 'boolean') {
                task.arg(`--${key}`);
            }
            else {
                task.arg(`--${key} ${argv[key]}`);
            }
        }
    });
}
exports.pass_args = pass_args;
