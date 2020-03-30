"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const YAML = __importStar(require("js-yaml"));
const fs_1 = require("fs");
const Tags = __importStar(require("./tags"));
const object_1 = require("lol/js/object");
const TAG_KINDS = ['sequence', 'scalar', 'mapping'];
const COMMANDS_REG = /^commands:$/;
const VARIABLES_REG = /^variables:$/;
const CONFIG_REG = /^config:$/;
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
        current_block.push(line);
    });
    let variables = {};
    let commands = {};
    let config = {};
    if (variables_block.length > 0) {
        const p0 = parse(variables_block.join('\n'));
        variables = Object.assign(variables, p0.variables);
    }
    if (commands_block.length > 0) {
        const p0 = parse(commands_block.join('\n'), true);
        commands = Object.assign(commands, p0.commands);
    }
    if (config_block.length > 0) {
        const p0 = parse(config_block.join('\n'));
        config = Object.assign(config, object_1.omit(p0.config, 'commands'));
    }
    return [variables, commands, config];
}
exports.parse_file = parse_file;
