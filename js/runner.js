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
const task_list_1 = require("./task-list");
const Path = __importStar(require("path"));
const Log = __importStar(require("./log"));
const utils_1 = require("./utils");
class Runner {
    constructor(tasks = new task_list_1.TaskList) {
        this.tasks = tasks;
    }
    static create(tasks) {
        return new Runner(tasks);
    }
    parallel(...tasks) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (let i = 0; i < tasks.length; i++) {
                results.push(this.run(tasks[i]));
            }
            return Promise.all(results);
        });
    }
    serie(...tasks) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (let i = 0; i < tasks.length; i++) {
                results.push(yield this.run(tasks[i]));
            }
            return results;
        });
    }
    run(name, edit) {
        return __awaiter(this, void 0, void 0, function* () {
            let command = this.tasks.find(name);
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
exports.Runner = Runner;
