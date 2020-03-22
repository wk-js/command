"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const template_1 = require("lol/js/string/template");
const context_1 = require("./context");
const SCALAR_REG = /string|boolean|number/i;
exports.TAGS = [
    // Value
    'If',
    'Ref',
    'Select',
    'Split',
    'Sub',
    'Exec',
    // Condition
    'Equals',
    'DeepEquals',
    'And',
    'Or',
    'Not',
    'Empty',
];
function validate(value, message, type) {
    let valid = true;
    if (type) {
        if (type === 'array') {
            valid = valid && Array.isArray(value);
        }
        else {
            valid = valid && (typeof value === type);
        }
    }
    valid = valid && (value !== undefined && value !== null);
    if (!valid)
        throw message;
}
exports.validate = validate;
function get_key(data) {
    const keys = Object.keys(data);
    if (keys.length === 1 && exports.TAGS.indexOf(keys[0]) > -1) {
        const k = keys[0];
        return k;
    }
    return 'None';
}
exports.get_key = get_key;
function has_key(data, key) {
    return data !== null && typeof data === 'object' && Object.keys(data).length === 1 && data.hasOwnProperty(key);
}
exports.has_key = has_key;
function Any(data) {
    if (typeof data !== 'object') {
        if (SCALAR_REG.test(typeof data))
            return data;
        return '';
    }
    if (Array.isArray(data)) {
        return data.map(d => Scalar(d));
    }
    const key = get_key(data);
    switch (key) {
        case "If":
        case "Ref":
        case "Select":
        case "Sub":
        case "Equals":
        case "DeepEquals":
        case "And":
        case "Or":
        case "Not":
        case "Empty":
            {
                return Scalar(data);
            }
        case "Split": {
            return Sequence(data);
        }
    }
    return '';
}
exports.Any = Any;
function Scalar(data) {
    if (typeof data !== 'object') {
        if (SCALAR_REG.test(typeof data))
            return data;
        return '';
    }
    const key = get_key(data);
    switch (key) {
        case "If":
        case "Ref":
        case "Select":
        case "Sub":
            {
                return Value(data);
            }
        case "Equals":
        case "DeepEquals":
        case "And":
        case "Or":
        case "Not":
        case "Empty":
            {
                return Condition(data);
            }
    }
    return '';
}
exports.Scalar = Scalar;
function Sequence(data) {
    if (typeof data !== 'object') {
        if (SCALAR_REG.test(typeof data))
            return [data];
        return [];
    }
    const key = get_key(data);
    switch (key) {
        case "Split":
            {
                return Split(data);
            }
    }
    return [];
}
exports.Sequence = Sequence;
function Split({ Split: [delimiter, value] }) {
    validate(delimiter, '[!Split] Invalid delimiter');
    validate(value, '[!Split] Invalid value');
    const d = Scalar(delimiter);
    const v = Scalar(value);
    validate(d, '[!Split] Invalid delimiter', 'string');
    validate(v, '[!Split] Invalid value', 'string');
    return v.split(d);
}
exports.Split = Split;
function Value(data) {
    const key = get_key(data);
    switch (key) {
        case "If": {
            return If(data);
        }
        case "Ref": {
            return Ref(data);
        }
        case "Select": {
            return Select(data);
        }
        case "Sub": {
            return Sub(data);
        }
    }
    return '';
}
exports.Value = Value;
function If({ If: [condition, v0, v1] }) {
    validate(condition, '[!If] Invalid condition');
    validate(v0, '[!If] Invalid then');
    validate(v1, '[!If] Invalid else');
    if (Scalar(condition)) {
        return Scalar(v0);
    }
    return Scalar(v1);
}
exports.If = If;
function Ref({ Ref }) {
    validate(Ref, '[!Ref] Invalid reference key', 'string');
    const { references } = context_1.Context.current();
    const value = references[Ref];
    // validate(value, `[!Ref] Reference ${Ref} does not exist`)
    return value || '';
}
exports.Ref = Ref;
function Select({ Select: [index, values] }) {
    validate(index, '[!Select] Invalid index', 'number');
    validate(index, '[!Select] Invalid values', 'array');
    const value = values[index];
    validate(value, '[!Select] Index out of bounds');
    return Scalar(value);
}
exports.Select = Select;
function Sub({ Sub }) {
    const { references } = context_1.Context.current();
    if (Array.isArray(Sub)) {
        validate(Sub[0], `[!Sub] Invalid value "${Sub[0]}"`);
        validate(Sub[1], '[!Sub] Invalid map', 'object');
        const str = Scalar(Sub[0]);
        const vars = {};
        for (const key in Sub[1]) {
            if (Sub[1].hasOwnProperty(key)) {
                const value = Sub[1][key];
                vars[key] = Scalar(value);
            }
        }
        validate(str, `[!Sub] Invalid value "${str}"`, 'string');
        return template_1.template2(str, Object.assign({}, references, vars));
    }
    validate(Sub, `[!Sub] Invalid value "${Sub}"`);
    const str = Scalar(Sub);
    validate(str, `[!Sub] Invalid value "${str}"`, 'string');
    return template_1.template2(str, references);
}
exports.Sub = Sub;
function Condition(data) {
    const key = Object.keys(data)[0];
    switch (key) {
        case "Equals": {
            return Equals(data);
        }
        case "DeepEquals": {
            return DeepEquals(data);
        }
        case "And": {
            return And(data);
        }
        case "Or": {
            return Or(data);
        }
        case "Not": {
            return Not(data);
        }
        case "Empty": {
            return Empty(data);
        }
    }
    return false;
}
exports.Condition = Condition;
function Equals({ Equals: [v0, v1] }) {
    validate(v0, '[!Equals] Invalid v0');
    validate(v1, '[!Equals] Invalid v1');
    return Any(v0) === Any(v1);
}
exports.Equals = Equals;
function DeepEquals({ DeepEquals: [v0, v1] }) {
    validate(v0, '[!DeepEquals] Invalid v0');
    validate(v1, '[!DeepEquals] Invalid v1');
    return JSON.stringify(Any(v0)) === JSON.stringify(Any(v1));
}
exports.DeepEquals = DeepEquals;
function And({ And }) {
    validate(And, '[!And] Invalid array', 'array');
    for (const condition of And) {
        validate(And, '[!And] Invalid condition');
        if (!Scalar(condition))
            return false;
    }
    return true;
}
exports.And = And;
function Or({ Or }) {
    validate(Or, '[!Or] Invalid array', 'array');
    for (const condition of Or) {
        validate(Or, '[!Or] Invalid condition');
        if (Scalar(condition))
            return true;
    }
    return false;
}
exports.Or = Or;
function Not({ Not }) {
    validate(Or, '[!Not] Invalid value');
    const b = Scalar(Not);
    return !b;
}
exports.Not = Not;
function Empty({ Empty }) {
    validate(Empty, '[!Empty] Invalid value', 'array');
    const value = Scalar(Empty[0]);
    if (typeof value === 'string' || Array.isArray(value)) {
        return value.length === 0;
    }
    throw `[!Empty] Invalid value to check "${value}"`;
}
exports.Empty = Empty;
