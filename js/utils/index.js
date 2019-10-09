"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const memory_stream_1 = require("lol/js/node/memory-stream");
function execute(command, args, options) {
    let stdout;
    let stderr;
    if (options && options.stdio === 'pipe') {
        stdout = new memory_stream_1.MemoryStream();
        stderr = new memory_stream_1.MemoryStream();
    }
    return {
        stdout,
        stderr,
        promise: new Promise((resolve, reject) => {
            const child = child_process_1.spawn(command, args, options);
            if (options && options.stdio === 'pipe') {
                child.stdout.pipe(stdout);
                child.stderr.pipe(stderr);
            }
            child.on('error', reject);
            child.on('exit', (code, signal) => {
                resolve([code, signal, child]);
            });
        })
    };
}
exports.execute = execute;
function transfert_parameters(task, argv) {
    Object.keys(argv).forEach((key) => {
        if (!key.match(/^wk\./)) {
            if (!isNaN(parseFloat(key)) && typeof argv[key] == 'string') {
                task.arg(argv[key]);
            }
            else if (key.length == 1 && typeof argv[key] == 'boolean') {
                task.arg(`-${key}`);
            }
            else if (typeof argv[key] == 'boolean') {
                task.arg(`--${key}`);
            }
            else {
                task.arg(`--${key} ${argv[key]}`);
            }
        }
    });
}
exports.transfert_parameters = transfert_parameters;
