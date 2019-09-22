"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const toml_1 = __importDefault(require("toml"));
const Path = __importStar(require("path"));
const Fs = __importStar(require("fs"));
const utils_1 = require("./utils");
const task_list_1 = require("./task-list");
const Log = __importStar(require("./log"));
function isFile(path) {
    try {
        var stat = Fs.statSync(path);
        if (!stat.isFile())
            throw 'Not a file';
    }
    catch (e) {
        return false;
    }
    return true;
}
function fetch_commands(argv) {
    const paths = [
        argv['wk.commands'],
        Path.join(process.cwd(), 'Commands.toml'),
        Path.join(process.cwd(), 'commands.toml'),
        'package.json'
    ];
    for (let i = 0; i < paths.length; i++) {
        const file = paths[i];
        if (typeof file == 'string' && isFile(file)) {
            const content = Fs.readFileSync(file, "utf-8");
            if (file == 'package.json') {
                return JSON.parse(content);
            }
            else {
                return toml_1.default.parse(content);
            }
        }
    }
    return null;
}
function main() {
    const argv = utils_1.parse(process.argv.slice(2));
    const file = fetch_commands(argv);
    if (!file || !file.commands) {
        Log.warn(`No commands found. One of them is required:`);
        Log.list([
            `Commands.toml with "commands" property`,
            `package.json with "commands" property`,
            `"--wk.commands=MY_PATH" in arguments`
        ]);
        return;
    }
    const list = task_list_1.TaskList.create();
    Object.keys(file.commands).forEach((name) => {
        const command = file.commands[name];
        if (typeof command == 'string') {
            list.register(name, command);
        }
        else {
            const c = list.register(name, command.command);
            if (command.cwd)
                c.cwd(command.cwd);
            if (command.args)
                c.args(...command.args);
            if (command.binPath)
                c.binPath(command.binPath);
            if (command.visible)
                c.visible(command.visible);
            if (command.dependsOn)
                c.dependsOn(...command.dependsOn);
            if (command.description)
                c.description(command.description);
        }
    });
    if (typeof argv['0'] == 'string') {
        list.run(argv['0'], (task) => {
            Object.keys(argv).forEach((key) => {
                if (!key.match(/wk\./)) {
                    if (!isNaN(parseFloat(key))) {
                        if (argv[key] != argv['0'])
                            task.arg(argv[key]);
                    }
                    else if (key.length == 1 && typeof argv[key] == 'boolean') {
                        task.arg(`-${key}`);
                    }
                    else if (typeof argv[key] == 'boolean') {
                        task.arg(`--${key}`);
                    }
                    else {
                        task.arg(`--${key} ${argv[key]}`);
                    }
                }
            });
        })
            .catch((e) => {
            Log.err(`Task "${argv['0']}" failed.`);
            if (e.code == 'ENOENT') {
                Log.err('ERR: No such file or directory');
            }
            Log.err(e);
        });
    }
    else {
        console.log(`Tasks availables`);
        const tasks = [];
        list.description().forEach((task) => {
            if (task.visible) {
                if (task.description) {
                    tasks.push([task.name, task.description]);
                }
                else {
                    tasks.push(task.name);
                }
            }
        });
        Log.list(tasks);
    }
}
main();
