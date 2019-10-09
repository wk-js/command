"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const memory_stream_1 = require("lol/js/node/memory-stream");
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
    Object.defineProperty(parameters, '___argv', {
        enumerable: false,
        writable: false,
        configurable: false,
        value: argv.join(' ')
    });
    return parameters;
}
exports.parse = parse;
function filter(argv, regex, omit = false) {
    const argv_arr = [];
    const parameters = {};
    Object.keys(argv)
        .forEach(key => {
        if ((omit && !key.match(regex)) || (!omit && key.match(regex))) {
            const new_key = key.replace(regex, '');
            parameters[new_key] = argv[key];
            if (isNaN(parseInt(key))) {
                argv_arr.push(`--${new_key}=${argv[key]}`);
            }
            else {
                argv_arr.push(argv[key]);
            }
        }
    });
    Object.defineProperty(parameters, '___argv', {
        enumerable: false,
        writable: false,
        configurable: false,
        value: argv_arr.join(' ')
    });
    return parameters;
}
exports.filter = filter;
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
