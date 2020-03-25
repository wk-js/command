"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WK_REG = /^--wk\./;
const PARAM_REG = /^-{1,2}/;
const EQUAL_REG = /=/;
function parse(argv) {
    const _argv = [];
    const _wk = {
        commands: 'Commands.yml',
        verbose: false,
        debug: false,
        nocolor: false,
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (WK_REG.test(a)) {
            const parameter = a.replace(WK_REG, '');
            let [key, value] = parameter.split(EQUAL_REG);
            switch (key) {
                case "debug":
                    {
                        _wk.debug = true;
                        break;
                    }
                case "nocolor":
                    {
                        _wk.nocolor = true;
                        break;
                    }
                case "verbose":
                    {
                        _wk.verbose = true;
                        break;
                    }
                case "commands":
                    {
                        if (typeof value !== 'string') {
                            value = argv[i + 1];
                            i++;
                        }
                        _wk.commands = value;
                        break;
                    }
            }
            continue;
        }
        _argv.push(a);
    }
    return [_wk, _argv];
}
exports.parse = parse;
