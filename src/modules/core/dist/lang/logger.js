"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
var c = require('ansi-colors');
var pkg = require('../../package.json');
var fancyLog = require('fancy-log');
var LEVEL;
(function (LEVEL) {
    LEVEL[LEVEL["INFO"] = 0] = "INFO";
    LEVEL[LEVEL["WARN"] = 1] = "WARN";
    LEVEL[LEVEL["DEBUG"] = 2] = "DEBUG";
    LEVEL[LEVEL["FATAL"] = 3] = "FATAL";
    LEVEL[LEVEL["ERROR"] = 4] = "ERROR";
})(LEVEL || (LEVEL = {}));
var Logger = /** @class */ (function () {
    function Logger() {
        this.name = pkg.name;
        this.version = pkg.version;
        this.logger = fancyLog;
        this.silent = false;
    }
    Logger.prototype.setVerbose = function (level) {
        this.silent = level;
    };
    Logger.prototype.title = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.silent == false) {
            this.logger(c.cyan.apply(c, args));
        }
    };
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.silent == false) {
            this.logger(this.format.apply(this, __spreadArrays([LEVEL.INFO], args)));
        }
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.silent == false) {
            this.logger(this.format.apply(this, __spreadArrays([LEVEL.WARN], args)));
        }
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.silent == false) {
            this.logger(this.format.apply(this, __spreadArrays([LEVEL.FATAL], args)));
        }
    };
    Logger.prototype.fatal = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.silent == false) {
            this.error.apply(this, args);
        }
    };
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.silent == false) {
            this.logger(this.format.apply(this, __spreadArrays([LEVEL.DEBUG], args)));
        }
    };
    Logger.prototype.trace = function (error, file) {
        this.fatal('Ouch', file);
        this.fatal('', error);
        this.warn('ignoring', file);
        this.warn('see error', '');
        console.trace(error);
    };
    Logger.prototype.format = function (level) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var pad = function (s, l, c) {
            if (c === void 0) { c = ''; }
            return s + Array(Math.max(0, l - s.length + 1)).join(c);
        };
        var msg = args.join(' ');
        if (args.length > 1) {
            msg = pad(args.shift(), 13, ' ') + ": " + args.join(' ');
        }
        switch (level) {
            case LEVEL.INFO:
                msg = c.green(msg);
                break;
            case LEVEL.WARN:
                msg = c.yellow(msg);
                break;
            case LEVEL.DEBUG:
                msg = c.gray(msg);
                break;
            case LEVEL.ERROR:
            case LEVEL.FATAL:
                msg = c.red(msg);
                break;
        }
        return [
            msg
        ].join('');
    };
    return Logger;
}());
exports.Logger = Logger;
exports.logger = new Logger();
