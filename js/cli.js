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
const cli_1 = require("./utils/cli");
const argv_1 = require("./utils/argv");
const runner_1 = require("./runner");
const Log = __importStar(require("./log"));
const Print = __importStar(require("./utils/print"));
const importer_1 = require("./importer");
function cli({ task, wk }) {
    return __awaiter(this, void 0, void 0, function* () {
        let config;
        const importGlobals = typeof wk.global == 'boolean' ? wk.global : false;
        if (wk.commands) {
            config = yield importer_1.load(wk.commands, importGlobals);
        }
        else {
            config = yield importer_1.lookup(importGlobals);
        }
        const runner = new runner_1.Runner(cli_1.create_list(config));
        if (typeof task['0'] == 'string') {
            const results = runner.run(task['___argv']);
            Print.results(yield results);
            return results;
        }
        else {
            Print.helpAndTasks(runner.tasks);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const [wks, argv] = cli_1.extract_wks(process.argv.slice(2));
        const wk = argv_1.parse(wks);
        const task = argv_1.parse(argv);
        if (typeof wk.log === 'boolean') {
            Log.level(2 /* FULL */);
        }
        else if (!isNaN(parseInt(wk.log))) {
            Log.level(parseInt(wk.log));
        }
        try {
            yield cli({ wk, task });
        }
        catch (e) {
            Print.err(e);
        }
    });
}
main();
process.on('SIGINT', () => { });
