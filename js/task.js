"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Task {
    constructor(_cmd) {
        this._cwd = process.cwd();
        this._args = [];
        this._depends = [];
        this._description = "";
        this._visible = true;
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
        return this;
    }
    cwd(_cwd) {
        this._cwd = _cwd;
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
        this._args.push(arg);
        return this;
    }
    args(...args) {
        this._args.push(...args);
        return this;
    }
    dependsOn(...tasks) {
        this._depends.push(...tasks);
        return this;
    }
    to_literal() {
        return {
            cwd: this._cwd,
            cmd: this._cmd,
            description: this._description,
            visible: this._visible,
            args: this._args.slice(0),
            dependencies: this._depends.slice(0),
        };
    }
}
exports.Task = Task;
