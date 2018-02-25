"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var transformers_1 = require("./transformers");
var ngd_core_1 = require("@compodoc/ngd-core");
var appName = require(path.resolve(process.cwd(), './package.json')).name;
var Engine = /** @class */ (function () {
    function Engine(options) {
        this.cwd = process.cwd();
        this.files = {
            component: null
        };
        this.transformers = [];
        this.options = {};
        var baseDir = "./" + appName + "/";
        this.options = {
            name: "" + appName,
            output: options.output,
            outputFormats: options.outputFormats
        };
        if (options.output) {
            if (typeof this.options.output !== 'string') {
                ngd_core_1.logger.fatal('Option "output" has been provided but it is not a valid name.');
                process.exit(1);
            }
        }
    }
    Engine.prototype.registerTransformers = function (transformer) {
        if (Array.isArray(transformer)) {
            (_a = this.transformers).push.apply(_a, transformer);
        }
        else {
            this.transformers.push(transformer);
        }
        var _a;
    };
    Engine.prototype.transform = function (deps) {
        var _this = this;
        var t = [];
        this.transformers.forEach(function (trans) {
            if (_this.options.outputFormats.indexOf(trans.type) > -1) {
                t.push(trans.transform(deps, _this.options));
            }
        });
        return Promise.all(t);
    };
    return Engine;
}());
exports.Engine = Engine;
var DefaultEngine = /** @class */ (function (_super) {
    __extends(DefaultEngine, _super);
    function DefaultEngine(options) {
        return _super.call(this, options) || this;
    }
    DefaultEngine.prototype.transform = function (deps) {
        _super.prototype.registerTransformers.call(this, [
            new transformers_1.JsonTransformer(),
            new transformers_1.HtmlTransformer()
        ]);
        return _super.prototype.transform.call(this, deps);
    };
    return DefaultEngine;
}(Engine));
exports.DefaultEngine = DefaultEngine;
