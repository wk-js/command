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
const command = process.argv.slice(2);
const argv = utils_2.parse(command);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let config;
        const importGlobals = typeof argv['wk.global'] == 'boolean' ? argv['wk.global'] : false;
        if (argv['wk.commands']) {
            config = yield importer_1.load(argv['wk.commands'], importGlobals);
        }
        else {
            config = yield importer_1.lookup(importGlobals);
        }
        const runner = new runner_1.Runner(utils_1.create_list(config));
        if (typeof argv['0'] == 'string') {
            const results = runner.run(command.join(" "));
            utils_1.print_results(yield results);
            return results;
        }
        else {
            utils_1.print_help();
            process.stdout.write('\n');
            utils_1.print_tasks(runner.tasks, argv['wk.verbose']);
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
process.on('SIGINT', () => { });
