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
const Log = __importStar(require("../log"));
const chalk_1 = __importDefault(require("chalk"));
const array_1 = require("lol/js/array");
function command(command, cwd) {
    if (Log.level() < 2 /* LIGHT */)
        return;
    console.log(chalk_1.default.grey('> From'), cwd);
    console.log(chalk_1.default.grey('> Running'), command);
    process.stdout.write('\n');
}
exports.command = command;
function warn(...args) {
    if (Log.level() < 2 /* LIGHT */)
        return;
    console.log(chalk_1.default.yellow('[warn]'), ...args);
}
exports.warn = warn;
function err(e) {
    if (Log.level() == 3 /* FULL */) {
        console.log(chalk_1.default.red('[err]'), e);
    }
    else {
        console.log(chalk_1.default.red('[err]'), e.message);
    }
}
exports.err = err;
function tasks(list) {
    const verbose = Log.level() == 3 /* FULL */;
    console.log('Task availables');
    let tasks = list.all()
        .map(t => t.toLiteral())
        .filter(t => verbose ? verbose : t.visible)
        .map(t => {
        let description = verbose ? `(From "${t.source}")` : "";
        description = verbose && !t.visible ? `[Hidden]` : "";
        if (t.description)
            description = `${t.description} ${description}`;
        return [t.name, description];
    });
    tasks = array_1.sortByKey(tasks, "0");
    Log.list(tasks);
}
exports.tasks = tasks;
function help() {
    console.log('Parameters availables');
    Log.list([
        ['--wk.commands=[PATH]', 'Set commands file path'],
        ['--wk.global', 'Import global tasks. Can accept "false" to disable'],
        ['--wk.log=0|1|2|3', `Log level (Current: ${Log.level()})`]
    ]);
}
exports.help = help;
function helpAndTasks(list) {
    if (Log.level() == 0 /* SILENT */)
        return;
    help();
    process.stdout.write('\n');
    tasks(list);
}
exports.helpAndTasks = helpAndTasks;
function results(results) {
    if (Log.level() < 3 /* FULL */)
        return;
    process.stdout.write('\n');
    Log.list(results.map(r => {
        return [r.taskName, r.success];
    }), 'success');
}
exports.results = results;
