"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("./task");
const utils_1 = require("./utils");
class TaskList {
    constructor() {
        this._tasks = {};
    }
    static create() {
        return new TaskList();
    }
    register(name, task, edit) {
        this._tasks[name] = task_1.Task.create(task);
        if (typeof edit == 'function') {
            edit(this._tasks[name]);
        }
        return this._tasks[name];
    }
    description() {
        return Object.keys(this._tasks).map((name) => {
            return Object.assign({ name }, this._tasks[name].to_literal());
        });
    }
    parallel(...names) {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = [];
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                tasks.push(this.run(name));
            }
            return Promise.all(tasks);
        });
    }
    serie(...names) {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = [];
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                tasks.push(yield this.run(name));
            }
            return tasks;
        });
    }
    run(name, edit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._tasks[name]) {
                console.log(`Task with name "${name}" not found`);
                return new Promise((resolve) => resolve([0, ""]));
            }
            let command = this._tasks[name];
            if (typeof edit === 'function') {
                command = command.clone();
                edit(command);
            }
            const task = command.to_literal();
            if (task.dependencies.length > 0) {
                yield this.serie(...task.dependencies);
            }
            const env = Object.assign({ FORCE_COLOR: true }, process.env);
            return utils_1.execute(task.cmd, task.args, {
                cwd: task.cwd,
                env
            });
        });
    }
}
exports.TaskList = TaskList;
