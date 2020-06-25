"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = require("./yaml");
const task_1 = require("./task");
const context_1 = require("./context");
const WK = __importStar(require("./wk"));
const object_1 = require("lol/js/object");
const child_process_1 = require("child_process");
let VERBOSE = false;
async function main() {
    var _a;
    // Parse ARGV
    const { wk, variables } = WK.parse('wk ' + process.argv.slice(2).join(' '));
    Object.assign(context_1.Context.configs, wk);
    // Resolve
    const argv = (_a = wk.argv) === null || _a === void 0 ? void 0 : _a.split(' ');
    const command = argv === null || argv === void 0 ? void 0 : argv.shift();
    context_1.Context.var("command", command);
    // Parse file
    context_1.Context.envs(process.env);
    const [vars, commands, config, env] = yaml_1.parse_file(wk.commands);
    context_1.Context.vars(vars);
    context_1.Context.envs(env);
    context_1.Context.configs(config);
    const cmds = task_1.format_commands(object_1.flat(commands));
    if (!task_1.exists(command, cmds)) {
        task_1.help2(cmds);
    }
    else {
        const task = task_1.create_task2(command, cmds);
        if (!context_1.Context.config("debug")) {
            console.log(`\n> ${task}\n`);
            child_process_1.spawnSync(task, { shell: true, stdio: 'inherit', env: context_1.Context.envs() });
        }
    }
}
main()
    .catch(e => {
    if (e instanceof Error) {
        console.log(VERBOSE ? e : e.message);
    }
    else {
        console.log(e);
    }
});
