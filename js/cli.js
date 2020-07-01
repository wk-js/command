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
const Task = __importStar(require("./task"));
const context_1 = require("./context");
const WK = __importStar(require("./wk"));
const child_process_1 = require("child_process");
let VERBOSE = false;
async function main() {
    // Parse ARGV
    const argv = WK.parse(process.argv.slice(2));
    // Apply configuration
    context_1.Context.configs(argv.wk);
    // Merge environment variables
    context_1.Context.envs(Object.assign(Object.assign({}, process.env), argv.env));
    // Parse file
    const file = yaml_1.parse_file(argv.wk.commands);
    // Apply file variables, environment and config
    context_1.Context.vars(file.variables);
    context_1.Context.envs(file.env);
    context_1.Context.configs(file.config);
    // Merge variables from argv
    context_1.Context.vars(argv.variables);
    // Format commands
    const commands = Task.format_commands(file.commands);
    if (!Task.exists(argv.wk.command, commands)) {
        Task.help(commands);
    }
    else {
        const task = Task.parse(argv.wk.command, commands);
        console.log(`\n> ${task}\n`);
        if (!context_1.Context.config("debug")) {
            child_process_1.spawnSync(task, {
                shell: true,
                stdio: 'inherit',
                env: context_1.Context.envs()
            });
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
