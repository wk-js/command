"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const object_1 = require("lol/js/object");
const tags_1 = require("./tags");
class Context {
    constructor() {
        this.variables = {};
        this.args = [];
    }
    static push(context) {
        if (Context._current)
            Context.pool.push(Context._current);
        return Context._current = context;
    }
    static pop() {
        const current = Context._current;
        const refs = Context.pool.pop();
        Context._current = refs;
        return current;
    }
    static current() {
        if (!Context._current) {
            throw 'No current context';
        }
        return Context._current;
    }
    static create() {
        const c = new Context();
        c.variables = object_1.deep_clone(Context._global);
        return c;
    }
    static global(key, value) {
        if (value) {
            Context._global[key] = value;
        }
        return Context._global[key];
    }
    var(key, value) {
        if (value) {
            this.variables[key] = value;
        }
        return this.variables[key];
    }
    vars(v) {
        if (v) {
            const vv = {};
            for (const key in v) {
                vv[key] = tags_1.Any(v[key]);
            }
            object_1.merge(this.variables, vv);
        }
        return this.variables;
    }
}
exports.Context = Context;
Context._global = {};
Context.options = {
    commands: 'Commands.yml',
    debug: false,
    nocolor: false,
    verbose: false,
};
Context.pool = [];
