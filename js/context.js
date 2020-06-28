"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const object_1 = require("lol/js/object");
const tags_1 = require("./tags");
class Context {
    static export() {
        return object_1.deep_clone({
            variables: this._variables,
            config: this._config,
            env: this._env,
        });
    }
    static env(key, value) {
        if (value) {
            this._env[key] = value;
        }
        return this._env[key];
    }
    static envs(v) {
        if (v) {
            object_1.merge(this._env, v);
        }
        return this._env;
    }
    static var(key, value) {
        if (value) {
            this._variables[key] = value;
        }
        return this._variables[key];
    }
    static vars(v) {
        if (v) {
            const vv = {};
            for (const key in v) {
                vv[key] = tags_1.Any(v[key]);
            }
            object_1.merge(this._variables, vv);
        }
        return this._variables;
    }
    static config(key, value) {
        if (value) {
            this._config[key] = value;
        }
        return this._config[key];
    }
    static configs(v) {
        if (v) {
            const vv = {};
            Object.entries(v).forEach(([key, value]) => {
                vv[key] = tags_1.Any(value);
            });
            object_1.merge(this._config, vv);
        }
        return this._config;
    }
}
exports.Context = Context;
Context._env = {};
Context._variables = {};
Context._config = {
    commands: 'Commands.yml',
    debug: false,
    nocolor: false,
    verbose: false,
    command: '',
    argv: [],
};
