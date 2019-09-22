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
            const split = arg.split(/=/);
            key = split[0].replace(keyRegex, '');
            if (split[1]) {
                parameters[key] = split[1];
            }
            else if (argv[i + 1] && !argv[i + 1].match(keyRegex)) {
                parameters[key] = argv[i + 1];
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
        const ps = child_process_1.spawn(command, args, options);
        ps.on('error', reject);
        ps.on('exit', (code, signal) => {
            resolve([code, signal]);
        });
    });
}
exports.execute = execute;
