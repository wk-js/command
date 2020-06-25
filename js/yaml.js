"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_file = exports.parse = exports.create_schema = void 0;
const YAML = __importStar(require("js-yaml"));
const fs_1 = require("fs");
const Tags = __importStar(require("./tags"));
const object_1 = require("lol/js/object");
const TAG_KINDS = ['sequence', 'scalar', 'mapping'];
const COMMANDS_REG = /^commands:$/;
const VARIABLES_REG = /^variables:$/;
const CONFIG_REG = /^config:$/;
const ENV_REG = /^env:$/;
const LINEBREAK_REG = /\n|\r\n/;
function create_schema(json = false) {
    const explicit = [];
    Tags.TAGS.forEach(tag => {
        TAG_KINDS.forEach(kind => {
            explicit.push(new YAML.Type(`!${tag}`, {
                kind,
                construct: (data) => {
                    return json ?
                        { [tag]: data } :
                        Tags.Any({ [tag]: data });
                },
                predicate: (data) => {
                    return Tags.has_key(data, tag);
                },
                represent: (data) => {
                    return Tags.Any(data[tag]);
                },
            }));
        });
    });
    return new YAML.Schema({
        include: [YAML.CORE_SCHEMA],
        implicit: [],
        explicit
    });
}
exports.create_schema = create_schema;
function parse(content, json = false) {
    const schema = create_schema(json);
    return YAML.safeLoad(content, { schema });
}
exports.parse = parse;
function parse_file(path) {
    const content = fs_1.readFileSync(path, { encoding: 'utf-8' });
    const lines = content.split(LINEBREAK_REG);
    let current_block = [];
    let commands_block = [];
    let variables_block = [];
    let config_block = [];
    let env_block = [];
    lines.forEach(line => {
        if (COMMANDS_REG.test(line)) {
            current_block = commands_block;
        }
        else if (VARIABLES_REG.test(line)) {
            current_block = variables_block;
        }
        else if (CONFIG_REG.test(line)) {
            current_block = config_block;
        }
        else if (ENV_REG.test(line)) {
            current_block = env_block;
        }
        current_block.push(line);
    });
    let variables = {};
    let commands = {};
    let config = {};
    let env = {};
    if (variables_block.length > 0) {
        const p0 = parse(variables_block.join('\n'));
        variables = Object.assign(variables, p0.variables);
    }
    if (env_block.length > 0) {
        const p0 = parse(env_block.join('\n'));
        env = Object.assign(env, p0.env);
    }
    if (commands_block.length > 0) {
        const p0 = parse(commands_block.join('\n'), true);
        commands = Object.assign(commands, p0.commands);
    }
    if (config_block.length > 0) {
        const p0 = parse(config_block.join('\n'));
        config = Object.assign(config, object_1.omit(p0.config, 'commands'));
    }
    return [variables, commands, config, env];
}
exports.parse_file = parse_file;
