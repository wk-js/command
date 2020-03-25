"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = require("./yaml");
const task_1 = require("./task");
const exec_1 = require("./exec");
const context_1 = require("./context");
const argv_1 = require("./argv");
const path_1 = require("path");
let VERBOSE = false;
function getOptions() {
    let _wk_argv = [];
    let _argv = process.argv.slice(2);
    let [wk0, tmp] = argv_1.parse(process.argv.slice(2));
    const index = _argv.indexOf(tmp[0]);
    if (tmp[0] && index > -1) {
        _wk_argv = _argv.splice(0, index);
        let [wk1] = argv_1.parse(_wk_argv);
        return [wk1, _argv];
    }
    return [wk0, []];
}
function setOptions(refs, options) {
    refs["WK::Verbose"] = options.verbose;
    refs["WK::Debug"] = options.debug;
    refs["WK::NoColor"] = options.nocolor;
    refs["WK::CommandPath"] = path_1.join(process.cwd(), options.commands);
}
async function main() {
    let [options, argv] = getOptions();
    const path = options.commands;
    VERBOSE = !!options.verbose;
    let refs = Object.assign({}, process.env);
    refs["WK::Command"] = argv.shift() || '';
    refs["WK::Args"] = argv.join(' ');
    setOptions(refs, options);
    argv.forEach((a, i) => refs[`WK::Arg${i + 1}`] = a);
    const ctx = context_1.Context.create();
    ctx.references = refs;
    context_1.Context.push(ctx);
    const [variables, commands, config] = yaml_1.parse_file(path);
    setOptions(refs, Object.assign(options, config));
    if (!refs["WK::Command"] || !commands[refs["WK::Command"]]) {
        task_1.help(commands);
    }
    else {
        refs['command'] = refs["WK::Command"];
        refs["args"] = refs["WK::Args"];
        argv.forEach((a, i) => refs[`arg${i + 1}`] = a);
        ctx.references = Object.assign(refs, variables);
        const task = task_1.create_task(refs["WK::Command"], commands);
        await exec_1.run(task);
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
