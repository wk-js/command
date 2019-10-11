"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
function execute(command, args, options) {
    const child = child_process_1.spawn(command, args, options);
    return {
        child,
        promise() {
            return new Promise((resolve, reject) => {
                child.on('error', reject);
                child.on('exit', (code, signal) => {
                    resolve([code, signal, child]);
                });
            });
        }
    };
}
exports.execute = execute;
