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
const object_1 = require("lol/js/object");
function isCommand(s) {
    return s && !s.match(/^-{1,2}/);
}
exports.isCommand = isCommand;
function create_list(config, argv) {
    const list = task_list_1.TaskList.create();
    Object.keys(config.commands).forEach((name) => {
        const command = config.commands[name];
        const c = list.add(name, command.command);
        c.name(command.name ? command.name : name);
        if (command.cwd)
            c.cwd(command.cwd);
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
        if (command.variables)
            c.variables(object_1.merge(command.variables, argv));
    });
    Object.keys(config.concurrents).forEach((name) => {
        const command = config.concurrents[name];
        const c = list.add(name, '[concurrent]');
        c.name(name);
        c.concurrent(true);
        c.dependsOn(...command);
        c.variables(object_1.clone(argv));
    });
    return list;
}
exports.create_list = create_list;
function print_tasks(list, verbose = false) {
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
exports.print_tasks = print_tasks;
function print_help() {
    console.log('Parameters availables');
    Log.list([
        ['--wk.commands=[PATH]', 'Set commands file path'],
        ['--wk.global', 'Import global tasks. Can accept "false" to disable'],
        ['--wk.verbose', 'Display error stack']
    ]);
}
exports.print_help = print_help;
function print_results(results) {
    if (Log.silent())
        return;
    process.stdout.write('\n');
    Log.list(results.map(r => {
        return [r.taskName, r.success];
    }), 'success');
}
exports.print_results = print_results;
