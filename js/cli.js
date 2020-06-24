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
let VERBOSE = false;
// function getOptions(): [WKOptions, string[]] {
//   let _wk_argv: string[] = []
//   let _argv = process.argv.slice(2)
//   let [wk0, tmp] = parse(process.argv.slice(2))
//   const index = _argv.indexOf(tmp[0])
//   if (tmp[0] && index > -1) {
//     _wk_argv = _argv.splice(0, index)
//     let [wk1] = parse(_wk_argv)
//     return [wk1, _argv]
//   }
//   return [wk0, []]
// }
// function setOptions(options: WKOptions) {
//   Context.global("wk::verbose", options.verbose)
//   Context.global("wk::debug", options.debug)
//   Context.global("wk::nocolor", options.nocolor)
//   Context.global("wk::commandpath", join(process.cwd(), options.commands))
// }
async function main() {
    var _a;
    // Parse ARGV
    const { wk, variables } = WK.parse('wk ' + process.argv.slice(2).join(' '));
    Object.assign(context_1.Context.options, wk);
    // Resolve
    const argv = (_a = wk.argv) === null || _a === void 0 ? void 0 : _a.split(' ');
    const command = argv === null || argv === void 0 ? void 0 : argv.shift();
    context_1.Context.global("WK::Command", command);
    // Parse file
    Object.keys(process.env).forEach(k => context_1.Context.global(k, process.env[k]));
    context_1.Context.push(context_1.Context.create());
    const [global, commands, config] = yaml_1.parse_file(wk.commands);
    context_1.Context.pop();
    Object.keys(global).forEach(k => context_1.Context.global(k, global[k]));
    Object.assign(context_1.Context.options, config);
    const cmds = task_1.format_commands(object_1.flat(commands));
    if (!task_1.exists(command, cmds)) {
        task_1.help2(cmds);
    }
    else {
        const ctx = context_1.Context.create();
        ctx.args = argv || [];
        Object.keys(variables).forEach(k => ctx.var(k, variables[k]));
        context_1.Context.push(ctx);
        const task = task_1.create_task2(command, cmds);
        console.log(task);
        context_1.Context.pop();
        //   console.log(WK.render(task.Exec as string))
    }
    // let [options, argv] = getOptions()
    // const path = options.commands
    // VERBOSE = !!options.verbose
    // Context.global("wk::command", argv.shift())
    // argv.forEach((a,i) => Context.global(`wk::arg${i}`, a))
    // setOptions(options)
    // Context.push(Context.create())
    // const [variables, commands, config] = parse_file(path)
    // setOptions(Object.assign(options, config))
    // Object.keys(variables).forEach(k => Context.global(k, variables[k]))
    // Context.pop()
    // if (!Context.global("wk::command") || !commands[Context.global("wk::command") as string]) {
    //   help(commands)
    // } else {
    //   const ctx = Context.create()
    //   ctx.args = argv
    //   // ctx.merge_variables(variables)
    //   Context.push(ctx)
    //   const task = create_task(Context.global("wk::command") as string, commands)
    //   Context.pop()
    //   // @ts-ignore
    //   console.log(WK.parse(task.Exec));
    // //   await run(task)
    // }
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
