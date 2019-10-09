"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_list_1 = require("../task-list");
const object_1 = require("lol/js/object");
function create_list(config, argv) {
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
            c.variables(object_1.merge(command.variables, argv));
    });
    Object.keys(config.concurrents).forEach((name) => {
        const command = config.concurrents[name];
        const c = list.add(name, '[concurrent]');
        c.name(name);
        c.concurrent(true);
        c.dependsOn(...command);
        c.variables(object_1.clone(argv));
    });
    return list;
}
exports.create_list = create_list;
