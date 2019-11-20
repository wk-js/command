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
            merge_config(current, yield _load(file));
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
            const command = Utils.commandFromString(file.commands[key], key, path);
            if (Array.isArray(command.conditions) && !Utils.conditions(command)) {
                continue;
            }
            // Add aliases from commands
            if (command.subcommands) {
                Utils.registerSubcommands(config, command, command.subcommands);
            }
            else {
                Utils.registerCommand(config, command);
            }
        }
        // Parse concurrents
        for (const key in file.concurrents) {
            const concurrent = Utils.concurrentFromStrings(file.concurrents[key], key, path);
            if (Array.isArray(concurrent.conditions) && !Utils.conditions(concurrent)) {
                continue;
            }
            Utils.registerConcurrent(config, concurrent);
        }
        // Load extended files
        if (file.imports != null) {
            for (const e of file.imports) {
                config = merge_config(yield load(e), config);
            }
        }
        // Resolve aliases
        if (file.aliases != null) {
            Utils.registerAliases(config, file.aliases);
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
                Utils.registerCommand(current, {
                    name,
                    command,
                    cwd: Path.dirname(path)
                });
            }
        }
        return current;
    });
}
exports.load_package = load_package;
function merge_config(first, ...configs) {
    for (let i = 0; i < configs.length; i++) {
        if (first.importGlobals != configs[i].importGlobals && configs[i].importGlobals) {
            first.importGlobals = true;
        }
        if (first.importPackage != configs[i].importPackage && configs[i].importPackage) {
            first.importPackage = true;
        }
        object_1.merge(first.commands, object_1.clone(configs[i].commands));
        object_1.merge(first.concurrents, object_1.clone(configs[i].concurrents));
    }
    return first;
}
exports.merge_config = merge_config;
const Utils = {
    commandFromString(command, name, source) {
        let cmd;
        if (typeof command == 'string') {
            cmd = { command, name };
        }
        else {
            cmd = command;
        }
        // Set source
        if (source) {
            cmd.source = source;
        }
        // Set name
        if (!cmd.name || (typeof cmd.name == 'string' && cmd.name.length == 0)) {
            cmd.name = name;
        }
        // Split commands with args
        if (cmd.command) {
            const args = cmd.command.split(/\s/);
            cmd.command = args.shift();
            cmd.args = cmd.args || [];
            cmd.args.unshift(...args);
        }
        return cmd;
    },
    concurrentFromStrings(concurrent, name, source) {
        if (Array.isArray(concurrent)) {
            return { commands: concurrent, name, source };
        }
        if (source)
            concurrent.source = source;
        if (!concurrent.name || (typeof concurrent.name == 'string' && concurrent.name.length == 0)) {
            concurrent.name = name;
        }
        return concurrent;
    },
    registerSubcommands(config, command, subcommands) {
        let i = 0;
        for (const _subcommand of subcommands) {
            let subcommand = Utils.commandFromString(_subcommand, i.toString());
            subcommand = Utils.mergeCommands(command, subcommand);
            // subcommand.name = command.name + ':' + subcommand.name
            // Register subcommand
            Utils.registerCommand(config, subcommand);
            i++;
        }
    },
    registerAliases(config, aliases) {
        for (const key in aliases) {
            let alias = Utils.commandFromString(aliases[key], key);
            const command = config.commands[alias.command];
            if (!command) {
                throw new Error(`Cannot alias "${key}" with "${alias.command}"`);
            }
            // Merge alias to command
            const merged = Utils.mergeCommands(command, alias);
            merged.command = command.command;
            // Register alias
            Utils.registerCommand(config, merged);
        }
    },
    registerCommand(config, command) {
        config.commands[command.name] = command;
    },
    registerConcurrent(config, concurrent) {
        config.concurrents[concurrent.name] = concurrent;
    },
    mergeCommands(...commands) {
        let current = { name: "", command: "" };
        for (let i = 0; i < commands.length; i++) {
            current = object_1.merge(current, object_1.clone(commands[i]));
        }
        return current;
    },
    mergeConcurrents(...concurrents) {
        let merged = { name: "", commands: [] };
        for (let i = 0; i < concurrents.length; i++) {
            object_1.merge(merged, object_1.clone(concurrents[i]));
        }
        return merged;
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
                c = object_1.merge(c, object_1.clone(condition.override));
            }
        }
        return valid;
    }
};
