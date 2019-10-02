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
const argv = utils_2.parse(process.argv.slice(2));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let commands;
        const importGlobals = typeof argv['wk.noglobal'] == 'boolean' ? !argv['wk.noglobal'] : true;
        if (argv['wk.commands']) {
            commands = yield importer_1.load(argv['wk.commands'], importGlobals);
        }
        else {
            commands = yield importer_1.lookup(importGlobals);
        }
        const runner = new runner_1.Runner(utils_1.create_list(commands));
        if (typeof argv['0'] == 'string') {
            return runner.run(argv['0'], (task) => {
                utils_1.pass_args(task, argv);
            });
        }
        else {
            utils_1.help();
            process.stdout.write('\n');
            utils_1.list_tasks(runner.tasks, argv['wk.verbose']);
        }
    });
}
main()
    .catch((e) => {
    if (argv['wk.verbose']) {
        Log.err(e);
    }
    else {
        Log.err(e.message);
    }
});
