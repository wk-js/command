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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("lol/js/node/fs");
const object_1 = require("lol/js/object");
const Path = __importStar(require("path"));
const Fs = __importStar(require("fs"));
const toml_1 = __importDefault(require("toml"));
const Os = __importStar(require("os"));
function load(path, importGlobal = true) {
    return __awaiter(this, void 0, void 0, function* () {
        let commands = {};
        const files = fs_1.fetch(path);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            commands = object_1.merge(commands, yield _load(file, importGlobal));
        }
        return commands;
    });
}
exports.load = load;
function load_directory(path, importGlobal = true) {
    return __awaiter(this, void 0, void 0, function* () {
        let commands = {};
        const files = fs_1.fetch([
            Path.join(path, '**/*.toml'),
            Path.join(path, '**/*.json')
        ]);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            commands = object_1.merge(commands, yield load(file, importGlobal));
        }
        return commands;
    });
}
exports.load_directory = load_directory;
function lookup(importGlobal = true) {
    const paths = [
        Path.join(process.cwd(), 'Commands.toml'),
        Path.join(process.cwd(), 'commands.toml'),
        'package.json'
    ];
    for (const p of paths) {
        if (fs_1.isFile(p))
            return load(p, importGlobal);
    }
    throw new Error('No commands found.');
}
exports.lookup = lookup;
function _load(path, importGlobals = true) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = { commands: {} };
        if (!fs_1.isFile(path)) {
            throw new Error(`"${path}" is not a file`);
        }
        const content = Fs.readFileSync(path, 'utf-8');
        try {
            if (Path.extname(path) == '.toml') {
                config = toml_1.default.parse(content);
            }
            else if (Path.extname(path) == '.json') {
                config = JSON.parse(content);
            }
        }
        catch (e) {
            throw new Error(`Cannot parse "${path}"`);
        }
        importGlobals = typeof config.importGlobals == 'boolean' ? config.importGlobals && importGlobals : importGlobals;
        // Auto import global tasks
        if (importGlobals) {
            const global_dir = Path.join(Os.homedir(), '.wk');
            config.commands = object_1.merge(yield load(Path.join(global_dir, '**/*.{json,toml}'), false), config.commands);
        }
        for (const key in config.commands) {
            let command = config.commands[key];
            // Replace string to literal
            if (typeof command == 'string') {
                config.commands[key] = { command };
            }
            // Set source file
            config.commands[key].source = path;
            // Apply condition
            if (Array.isArray(config.commands[key].conditions)) {
                const conditions = config.commands[key].conditions;
                const platform = Os.platform();
                const arch = Os.arch();
                let valid = false;
                for (let index = 0; index < conditions.length; index++) {
                    const condition = conditions[index];
                    if (typeof condition.platform == 'string' && condition.platform != platform) {
                        continue;
                    }
                    if (typeof condition.arch == 'string' && condition.arch != arch) {
                        continue;
                    }
                    valid = true;
                    if (condition.override != null) {
                        config.commands[key] = object_1.merge(config.commands[key], condition.override);
                    }
                }
                if (!valid)
                    delete config.commands[key];
            }
        }
        // Load extended files
        if (config.imports != null) {
            for (const e of config.imports) {
                // config.commands = merge(load(e), config.commands)
                config.commands = object_1.merge(yield load(e, importGlobals), config.commands);
            }
        }
        // Resolve aliases
        if (config.aliases != null) {
            for (const key in config.aliases) {
                let alias = config.aliases[key];
                if (typeof alias == 'string') {
                    alias = { command: alias };
                }
                let al = alias;
                const command = config.commands[al.command];
                if (!command) {
                    throw new Error(`Cannot alias "${key}" with "${al.command}"`);
                }
                const all = object_1.merge({}, command, al);
                all.name = key;
                all.command = command.command;
                all.args = al.args || all.args;
                config.commands[key] = all;
            }
        }
        return config.commands;
    });
}
