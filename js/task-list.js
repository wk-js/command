"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("./task");
class TaskList {
    constructor() {
        this._tasks = {};
    }
    static create() {
        return new TaskList();
    }
    add(name, command, edit) {
        const task = task_1.Task.create(command);
        task.name(name);
        if (typeof edit == 'function') {
            edit(task);
        }
        return this._tasks[name] = task;
    }
    remove(name) {
        delete this._tasks[name];
    }
    clone(name, newName, edit) {
        const task = this.find(name);
        const clone = task.clone();
        if (typeof edit == 'function') {
            edit(clone);
        }
        this._tasks[newName] = clone;
    }
    find(name) {
        let command = this._tasks[name];
        if (!command) {
            throw new Error(`No task with name "${name}" exists`);
        }
        return command;
    }
    all() {
        return Object.keys(this._tasks).map((key) => this._tasks[key]);
    }
}
exports.TaskList = TaskList;
