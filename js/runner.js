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
            const args = name.split(/\s/);
            let command = this.tasks.find(args.shift());
            if (args.length > 0) {
                command = command.clone();
                utils_1.transfert_parameters(command, utils_1.parse(args));
            }
            if (typeof edit === 'function') {
                command = command.clone();
                edit(command);
            }
            const task = command.toLiteral();
            let results = [];
            if (task.concurrent) {
                if (task.dependencies.length > 0) {
                    const res0 = yield this.parallel(...task.dependencies);
                    results = results.concat(...res0);
                }
                return results;
            }
            if (task.dependencies.length > 0) {
                const res1 = yield this.serie(...task.dependencies);
                results = results.concat(...res1);
            }
            const env = Object.assign({ FORCE_COLOR: true }, process.env);
            const cmd = task.binPath.length > 0 ? Path.join(task.binPath, task.cmd) : task.cmd;
            Log.command(`${cmd} ${task.args.join(' ')}`, task.cwd);
            const [code] = yield utils_1.execute(cmd, task.args, {
                cwd: task.cwd,
                stdio: "inherit",
                shell: true,
                env
            }).promise;
            results.push({
                success: code == 0,
                taskName: task.name
            });
            return results;
        });
    }
}
exports.Runner = Runner;
