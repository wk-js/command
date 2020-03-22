"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Context {
    constructor() {
        this.references = {};
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
        return new Context();
    }
}
exports.Context = Context;
Context.pool = [];
