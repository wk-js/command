"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parameters_1 = require("./parameters");
const child_process_1 = __importDefault(require("child_process"));
class Command {
    constructor(_command) {
        this._command = _command;
        this._cwd = process.cwd();
        this._params = [];
        this.parse();
    }
    parse() {
        const p = parameters_1.Parameters.get('process');
        const cwd = p.get('--wk.cwd');
        if (typeof cwd == 'string')
            this.cwd(cwd);
        let params = p.clone().slice(1); // Task name
        // Remove cwd
        let index = parameters_1.Parameters.Utils.indexOf(params, '--wk.cwd');
        if (index > -1)
            params.splice(index, 2);
        // Remove commands
        index = parameters_1.Parameters.Utils.indexOf(params, '--wk.commands');
        if (index > -1)
            params.splice(index, 2);
        this._params = this._params.concat(params);
    }
    cwd(path) {
        this._cwd = path;
    }
    execute() {
        let parameters = this._command.split(' ');
        parameters = parameters.concat(this._params);
        const cmd = parameters.shift();
        const env = Object.assign({ FORCE_COLOR: true }, process.env);
        const ps = child_process_1.default.spawnSync(cmd, parameters, {
            cwd: this._cwd,
            stdio: "inherit",
            env
        });
        if (ps.error)
            console.log(ps.error);
    }
    static init() {
        if (!parameters_1.Parameters.has('process'))
            parameters_1.Parameters.register('process', process.argv.slice(2));
    }
    static create(name, command) {
        return this._commands[name] = new Command(command);
    }
    static execute(name) {
        if (!name) {
            const p = parameters_1.Parameters.get('process');
            const task = p.atIndex(0);
            if (!task || task.match(/^-+/)) {
                console.log(`No command given`);
                return;
            }
            name = task;
        }
        if (!this._commands[name]) {
            console.log(`Command with name "${name}" does not exist.`);
            return;
        }
        Command._commands[name].execute();
    }
}
Command._commands = {};
exports.Command = Command;
