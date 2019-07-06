"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toml_1 = __importDefault(require("toml"));
const fs_1 = require("lol/js/node/fs");
const fs_2 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const command_1 = require("./command");
const parameters_1 = require("./parameters");
function fetch_commands() {
    const paths = [
        parameters_1.Parameters.get('process').get('--wk.commands'),
        path_1.default.join(process.cwd(), 'Commands.toml'),
        path_1.default.join(process.cwd(), 'commands.toml')
    ];
    for (let i = 0; i < paths.length; i++) {
        const file = paths[i];
        if (fs_1.isFile(file)) {
            const content = fs_2.default.readFileSync(file, "utf-8");
            return toml_1.default.parse(content);
        }
    }
    return null;
}
function main() {
    command_1.Command.init();
    const file = fetch_commands();
    if (!file) {
        console.log(`No Command.toml found`);
        return;
    }
    Object.keys(file.commands).forEach((name) => {
        const command = file.commands[name];
        if (typeof command == 'string') {
            command_1.Command.create(name, command);
        }
        else {
            const c = command_1.Command.create(name, command.command);
            if (command.cwd)
                c.cwd(command.cwd);
        }
    });
    command_1.Command.execute();
}
main();
