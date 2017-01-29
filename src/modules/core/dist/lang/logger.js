"use strict";
var gutil = require('gulp-util');
var c = gutil.colors;
var pkg = require('../../package.json');
var LEVEL;
(function (LEVEL) {
    LEVEL[LEVEL["INFO"] = 0] = "INFO";
    LEVEL[LEVEL["WARN"] = 1] = "WARN";
    LEVEL[LEVEL["DEBUG"] = 2] = "DEBUG";
    LEVEL[LEVEL["FATAL"] = 3] = "FATAL";
    LEVEL[LEVEL["ERROR"] = 4] = "ERROR";
})(LEVEL || (LEVEL = {}));
var Logger = (function () {
    function Logger() {
        this.name = pkg.name;
        this.version = pkg.version;
        this.logger = gutil.log;
        this.silent = true;
    }
    Logger.prototype.title = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(c.cyan.apply(c, args));
    };
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.INFO].concat(args)));
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.WARN].concat(args)));
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.FATAL].concat(args)));
    };
    Logger.prototype.fatal = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.error.apply(this, args);
    };
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (!this.silent)
            return;
        this.logger(this.format.apply(this, [LEVEL.DEBUG].concat(args)));
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
