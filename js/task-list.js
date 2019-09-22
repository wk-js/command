"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("./task");
const utils_1 = require("./utils");
const Path = __importStar(require("path"));
const Log = __importStar(require("./log"));
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
            return Object.assign({ name }, this._tasks[name].toLiteral());
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
                Log.warn(`Task with name "${name}" not found`);
                return new Promise((resolve) => resolve([0, ""]));
            }
            let command = this._tasks[name];
            if (typeof edit === 'function') {
                command = command.clone();
                edit(command);
            }
            const task = command.toLiteral();
            if (task.dependencies.length > 0) {
                yield this.serie(...task.dependencies);
            }
            const env = Object.assign({ FORCE_COLOR: true }, process.env);
            const cmd = task.binPath.length > 0 ? Path.join(task.binPath, task.cmd) : task.cmd;
            Log.command(`${cmd} ${task.args.join(' ')}`, task.cwd);
            return utils_1.execute(cmd, task.args, {
                cwd: task.cwd,
                stdio: "inherit",
                env
            });
        });
    }
}
exports.TaskList = TaskList;
