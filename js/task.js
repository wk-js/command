"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Task {
    constructor(_cmd) {
        this._cwd = process.cwd();
        this._args = [];
        this._depends = [];
        this._binPath = "";
        this._visible = true;
        this._description = "";
        const args = _cmd.split(/\s/);
        this._cmd = args.shift();
        this._args.push(...args);
    }
    static create(command) {
        return new Task(command);
    }
    clone() {
        const command = new Task(this._cmd);
        return command.copy(this);
    }
    copy(command) {
        this._cmd = command._cmd;
        this._cwd = command._cwd;
        this._args = command._args.slice(0);
        this._depends = command._depends.slice(0);
        this._binPath = command._binPath;
        this._visible = command._visible;
        this._description = command._description;
        return this;
    }
    cwd(_cwd) {
        this._cwd = _cwd;
        return this;
    }
    binPath(_binPath) {
        this._binPath = _binPath;
        return this;
    }
    description(_description) {
        this._description = _description;
        return this;
    }
    visible(_visible) {
        this._visible = _visible;
        return this;
    }
    arg(arg) {
        const args = arg.split(/\s/);
        this._args.push(...args);
        return this;
    }
    args(...args) {
        for (let i = 0; i < args.length; i++) {
            const _args = args[i].split(/\s/);
            this._args.push(..._args);
        }
        return this;
    }
    dependsOn(...tasks) {
        this._depends.push(...tasks);
        return this;
    }
    toLiteral() {
        return {
            cwd: this._cwd,
            cmd: this._cmd,
            binPath: this._binPath,
            description: this._description,
            visible: this._visible,
            args: this._args.slice(0),
            dependencies: this._depends.slice(0),
        };
    }
}
exports.Task = Task;
