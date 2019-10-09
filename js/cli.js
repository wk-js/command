"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./cli/utils");
const utils_2 = require("./utils");
const runner_1 = require("./runner");
const Log = __importStar(require("./log"));
const importer_1 = require("./importer");
function cli({ task, wk, vars }) {
    return __awaiter(this, void 0, void 0, function* () {
        let config;
        const importGlobals = typeof wk.global == 'boolean' ? wk.global : false;
        if (wk.commands) {
            config = yield importer_1.load(wk.commands, importGlobals);
        }
        else {
            config = yield importer_1.lookup(importGlobals);
        }
        const runner = new runner_1.Runner(utils_1.create_list(config, vars));
        if (typeof task['0'] == 'string') {
            const results = runner.run(task['___argv']);
            utils_1.print_results(yield results);
            return results;
        }
        else {
            utils_1.print_help();
            process.stdout.write('\n');
            utils_1.print_tasks(runner.tasks, wk.verbose);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const parsed = utils_2.parse(process.argv.slice(2));
        const wk = utils_2.filter(parsed, /wk\./);
        const task = utils_2.filter(parsed, /(wk|var)\./, true);
        const vars = utils_2.filter(parsed, /var\./);
        Log.silent(wk.silent);
        try {
            yield cli({ wk, task, vars });
        }
        catch (e) {
            if (wk.verbose) {
                Log.err(e);
            }
            else {
                Log.err(e.message);
            }
        }
    });
}
main();
process.on('SIGINT', () => { });
