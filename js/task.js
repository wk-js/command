"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("lol/js/object");
const template_1 = require("lol/js/string/template");
class Task {
    constructor(_cmd) {
        this._cwd = process.cwd();
        this._name = "task";
        this._args = [];
        this._source = "";
        this._binPath = "";
        this._visible = true;
        this._concurrent = [];
        this._description = "";
        this._dependencies = [];
        this._variables = {};
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
        this._name = command._name;
        this._args = command._args.slice(0);
        this._source = command._source;
        this._dependencies = command._dependencies.slice(0);
        this._binPath = command._binPath;
        this._visible = command._visible;
        this._concurrent = command._concurrent.slice(0);
        this._description = command._description;
        this._variables = object_1.clone(command._variables);
        return this;
    }
    name(_name) {
        this._name = _name;
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
    source(_source) {
        this._source = _source;
        return this;
    }
    visible(_visible) {
        this._visible = _visible;
        return this;
    }
    concurrent(_concurrent) {
        this._concurrent = _concurrent;
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
        this._dependencies.push(...tasks);
        return this;
    }
    variables(variables) {
        this._variables = object_1.merge(this._variables, variables);
        return this;
    }
    toLiteral() {
        return {
            name: template_1.template2(this._name, this._variables),
            cwd: template_1.template2(this._cwd, this._variables),
            cmd: template_1.template2(this._cmd, this._variables),
            source: this._source,
            binPath: template_1.template2(this._binPath, this._variables),
            description: template_1.template2(this._description, this._variables),
            visible: this._visible,
            concurrent: this._concurrent.slice(0).map((item) => template_1.template2(item, this._variables)),
            args: this._args.slice(0).map((item) => template_1.template2(item, this._variables)),
            dependencies: this._dependencies.slice(0).map((item) => template_1.template2(item, this._variables)),
            template: object_1.clone(this._variables)
        };
    }
}
exports.Task = Task;
