"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
function parse(argv) {
    const parameters = {};
    let key = '';
    let keyRegex = /^-{1,2}/;
    let index = 0;
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg.match(keyRegex)) {
            key = arg.replace(keyRegex, '');
            const next = argv[i + 1];
            if (next && !next.match(keyRegex)) {
                parameters[key] = next;
                i++;
            }
            else {
                parameters[key] = true;
            }
            continue;
        }
        else {
            parameters[index] = arg;
            index++;
        }
    }
    return parameters;
}
exports.parse = parse;
function execute(command, args, options) {
    return new Promise((resolve, reject) => {
        const ps = child_process_1.spawn(command, args, {
            shell: true,
            stdio: "inherit"
        });
        ps.on('error', reject);
        ps.on('exit', (code, signal) => {
            resolve([code, signal]);
        });
    });
}
exports.execute = execute;
