"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const memory_stream_1 = require("lol/js/node/memory-stream");
function execute(command, args, options) {
    const stdout = new memory_stream_1.MemoryStream(Date.now() + '' + Math.random());
    const stderr = new memory_stream_1.MemoryStream(Date.now() + '' + Math.random());
    const promise = new Promise((resolve, reject) => {
        const cprocess = child_process_1.spawn(command, args, options);
        if (options && options.stdio === 'pipe') {
            cprocess.stdout.pipe(stdout);
            cprocess.stderr.pipe(stderr);
        }
        cprocess.on('error', reject);
        cprocess.on('exit', (code, signal) => {
            resolve([code, signal, cprocess]);
        });
    });
    return { stdout, stderr, promise };
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
