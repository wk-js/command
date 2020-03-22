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
const TAG_KINDS = ['sequence', 'scalar', 'mapping'];
const COMMANDS_REG = /^commands:$/;
const VARIABLES_REG = /^variables:$/;
const LINEBREAK_REG = /\n/;
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
    lines.forEach(line => {
        if (COMMANDS_REG.test(line)) {
            current_block = commands_block;
        }
        else if (VARIABLES_REG.test(line)) {
            current_block = variables_block;
        }
        current_block.push(line);
    });
    const { variables } = parse(variables_block.join('\n'));
    const { commands } = parse(commands_block.join('\n'), true);
    return [variables, commands];
}
exports.parse_file = parse_file;
