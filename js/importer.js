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
function default_config() {
    return {
        importGlobals: false,
        importPackage: false,
        commands: {},
        concurrents: {}
    };
}
exports.default_config = default_config;
function load(path, config) {
    return __awaiter(this, void 0, void 0, function* () {
        let current = config || default_config();
        const files = fs_1.fetch(path);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            merge_config(yield _load(file), current);
        }
        return current;
    });
}
exports.load = load;
function load_directory(path, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = fs_1.fetch([
            Path.join(path, '**/*.toml'),
            Path.join(path, '**/*.json')
        ]);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            config = yield load(file, config);
        }
        return config;
    });
}
exports.load_directory = load_directory;
function lookup(config) {
    const paths = [
        Path.join(process.cwd(), 'Commands.toml'),
        Path.join(process.cwd(), 'commands.toml'),
        'package.json'
    ];
    for (const p of paths) {
        if (fs_1.isFile(p))
            return load(p, config);
    }
    throw new Error('No commands found.');
}
exports.lookup = lookup;
function _load(path) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.isFile(path)) {
            throw new Error(`"${path}" is not a file`);
        }
        let file = { commands: {}, concurrents: {} };
        let config = default_config();
        const content = Fs.readFileSync(path, 'utf-8');
        try {
            if (Path.extname(path) == '.toml') {
                file = toml_1.default.parse(content);
            }
            else if (Path.extname(path) == '.json') {
                file = JSON.parse(content);
            }
        }
        catch (e) {
            throw new Error(`Cannot parse "${path}"`);
        }
        config.importGlobals = typeof file.importGlobals == 'boolean' ? file.importGlobals : false;
        config.importPackage = typeof file.importPackage == 'boolean' ? file.importPackage : false;
        // Parse commands
        for (const key in file.commands) {
            const command = Parser.commandFromString(file.commands[key]);
            Parser.source(command, path);
            if (Array.isArray(command.conditions) && !Parser.conditions(command)) {
                continue;
            }
            config.commands[key] = command;
        }
        // Parse concurrents
        for (const key in file.concurrents) {
            const concurrent = Parser.concurrentFromStrings(file.concurrents[key]);
            Parser.source(concurrent, path);
            if (Array.isArray(concurrent.conditions) && !Parser.conditions(concurrent)) {
                continue;
            }
            config.concurrents[key] = concurrent;
        }
        // Load extended files
        if (file.imports != null) {
            for (const e of file.imports) {
                yield load(e, config);
            }
        }
        // Resolve aliases
        if (file.aliases != null) {
            for (const key in file.aliases) {
                let alias = Parser.commandFromString(file.aliases[key]);
                const command = config.commands[alias.command];
                if (!command) {
                    throw new Error(`Cannot alias "${key}" with "${alias.command}"`);
                }
                const all = object_1.merge({}, command, alias);
                all.name = alias.name || key;
                all.command = command.command;
                all.args = alias.args || all.args;
                config.commands[key] = all;
            }
        }
        return config;
    });
}
function load_globals(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const global_dir = Path.join(Os.homedir(), '.wk');
        const path = Path.join(global_dir, '**/*.{json,toml}');
        return load(path, config);
    });
}
exports.load_globals = load_globals;
function load_package(path, config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.isFile(path)) {
            throw new Error(`This package at path "${path}" does not exist.`);
        }
        let current = config || default_config();
        const file = yield fs_1.readFile(path, { encoding: 'utf-8' });
        const pkg = JSON.parse(file);
        if (pkg.scripts) {
            for (const name in pkg.scripts) {
                const command = pkg.scripts[name];
                current.commands[name] = {
                    name,
                    command,
                    cwd: Path.dirname(path)
                };
            }
        }
        return current;
    });
}
exports.load_package = load_package;
function merge_config(...configs) {
    const first = configs.shift();
    for (let i = 0; i < configs.length; i++) {
        if (first.importGlobals != configs[i].importGlobals && configs[i].importGlobals) {
            first.importGlobals = true;
        }
        if (first.importPackage != configs[i].importPackage && configs[i].importPackage) {
            first.importPackage = true;
        }
        object_1.merge(first.commands, configs[i].commands);
        object_1.merge(first.concurrents, configs[i].concurrents);
    }
    return first;
}
exports.merge_config = merge_config;
const Parser = {
    commandFromString(command) {
        if (typeof command == 'string') {
            return { command };
        }
        return command;
    },
    concurrentFromStrings(commands) {
        if (Array.isArray(commands)) {
            return { commands };
        }
        return commands;
    },
    source(c, source) {
        c.source = source;
    },
    conditions(c) {
        const conditions = c.conditions;
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
                c = object_1.merge(c, condition.override);
            }
        }
        return valid;
    }
};
