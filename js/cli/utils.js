"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const task_list_1 = require("../task-list");
const Log = __importStar(require("../log"));
function create_list(commands) {
    const list = task_list_1.TaskList.create();
    Object.keys(commands).forEach((name) => {
        const command = commands[name];
        const c = list.add(name, command.command);
        if (command.cwd)
            c.cwd(command.cwd);
        if (command.name)
            c.name(command.name);
        if (command.args)
            c.args(...command.args);
        if (command.source)
            c.source(command.source);
        if (command.binPath)
            c.binPath(command.binPath);
        if (typeof command.visible == 'boolean')
            c.visible(command.visible);
        if (command.dependsOn)
            c.dependsOn(...command.dependsOn);
        if (command.description)
            c.description(command.description);
    });
    return list;
}
exports.create_list = create_list;
function list_tasks(list, verbose = false) {
    console.log('Task availables');
    const tasks = list.all()
        .map(t => t.toLiteral())
        .filter(t => verbose ? verbose : t.visible)
        .map(t => {
        let description = verbose ? `(From "${t.source}")` : "";
        description = verbose && !t.visible ? `[Hidden]` : "";
        if (t.description)
            description = `${t.description} ${description}`;
        return [t.name, description];
    });
    Log.list(tasks);
}
exports.list_tasks = list_tasks;
function help() {
    console.log('Parameters availables');
    Log.list([
        ['--wk.commands=[PATH]', 'Set commands file path'],
        ['--wk.noglobal', 'Do not import global tasks'],
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
