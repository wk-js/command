"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parallel = exports.serie = exports.run = void 0;
const exec_1 = require("lol/js/node/exec");
const path_1 = require("path");
const context_1 = require("./context");
async function run(task, options = {}) {
    if (typeof task === 'string') {
        if (task.length === 0)
            return;
        const ctx = context_1.Context.export();
        const opts = { color: !ctx.variables['WK::NoColor'], stdio: 'inherit', cwd: './' };
        if (options.cwd)
            opts.cwd = options.cwd;
        if (options.env) {
            opts.env = options.env;
            opts.extendEnv = true;
        }
        console.log('>', options.name, path_1.join(process.cwd(), opts.cwd));
        console.log('>', task, '\n');
        if (!ctx.variables['WK::Debug']) {
            await exec_1.exec(task, opts).promise();
        }
    }
    else if (task.hasOwnProperty('Exec')) {
        const { Exec, Options } = task;
        await run(Exec, Options);
    }
    else if (task.hasOwnProperty('Serie')) {
        await serie(task);
    }
    else if (task.hasOwnProperty('Parallel')) {
        await parallel(task);
    }
}
exports.run = run;
async function serie(task) {
    for (let i = 0; i < task.Serie.length; i++) {
        await run(task.Serie[i], { name: task.Options.name });
    }
}
exports.serie = serie;
async function parallel(task) {
    const promises = [];
    for (let i = 0; i < task.Parallel.length; i++) {
        promises.push(run(task.Parallel[i], { name: task.Options.name }));
    }
    return Promise.all(promises);
}
exports.parallel = parallel;
