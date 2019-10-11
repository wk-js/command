"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_list_1 = require("../task-list");
function create_list(config) {
    const list = task_list_1.TaskList.create();
    Object.keys(config.commands).forEach((name) => {
        const command = config.commands[name];
        const c = list.add(name, command.command);
        c.name(command.name ? command.name : name);
        if (command.cwd)
            c.cwd(command.cwd);
        if (command.args)
            c.args(...command.args);
        if (command.source)
            c.source(command.source);
        if (command.binPath)
            c.binPath(command.binPath);
        if (typeof command.visible == 'boolean')
            c.visible(command.visible);
        if (command.dependsOn)
            c.dependsOn(...command.dependsOn);
        if (command.description)
            c.description(command.description);
        if (command.variables)
            c.variables(command.variables);
    });
    Object.keys(config.concurrents).forEach((name) => {
        const concurrent = config.concurrents[name];
        const c = list.add(name, '[concurrent]');
        c.name(concurrent.name ? concurrent.name : name);
        c.concurrent(concurrent.commands);
        if (concurrent.source)
            c.source(concurrent.source);
        if (typeof concurrent.visible == 'boolean')
            c.visible(concurrent.visible);
        if (concurrent.dependsOn)
            c.dependsOn(...concurrent.dependsOn);
        if (concurrent.description)
            c.description(concurrent.description);
        if (concurrent.variables)
            c.variables(concurrent.variables);
    });
    return list;
}
exports.create_list = create_list;
function extract_wks(argv) {
    const nargv = argv.slice(0);
    const wkargv = [];
    let wkRegex = /^-{1,2}(wk)\./;
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.match(wkRegex)) {
            const index = nargv.indexOf(a);
            if (index == -1)
                continue;
            wkargv.push(...nargv.splice(index, 1));
            if (a.match(/^-{1,2}wk\.commands/) && !a.match(/=/)) {
                nargv.splice(index, 1);
                wkargv.push(...nargv.splice(index, 1));
            }
        }
    }
    return [
        wkargv.map(a => a.replace('wk.', '')),
        nargv
    ];
}
exports.extract_wks = extract_wks;
function extract_vars(argv) {
    const nargv = argv.slice(0);
    const varargv = [];
    let wkRegex = /^-{1,2}(var)\./;
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.match(wkRegex)) {
            const index = nargv.indexOf(a);
            if (index == -1)
                continue;
            varargv.push(...nargv.splice(index, 1));
            if (!a.match(/=/)) {
                varargv.push(...nargv.splice(index, 1));
            }
        }
    }
    return [
        varargv.map(a => a.replace('var.', '')),
        nargv
    ];
}
exports.extract_vars = extract_vars;
