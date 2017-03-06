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
var fs = require("fs");
var ts = require("typescript");
var compiler_1 = require("./compiler");
var ngast = require('ngast');
var NgAst = (function (_super) {
    __extends(NgAst, _super);
    function NgAst(files, options) {
        var _this = _super.call(this, files, options) || this;
        _this.files = files;
        _this.resourceResolver = {
            get: function (url) {
                return new Promise(function (resolve, reject) {
                    fs.readFile(url, 'utf-8', function (err, content) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(content);
                        }
                    });
                });
            },
            getSync: function (url) {
                return fs.readFileSync(url).toString();
            }
        };
        _this.program = _this.createProgramFromTsConfig(options.tsconfig);
        return _this;
    }
    NgAst.prototype.getDependencies = function () {
        var contextSymbols = new ngast.ContextSymbols(this.program, this.resourceResolver);
        // console.log('getModules::', contextSymbols.getModules().pop());
        fs.writeFileSync('./xxxxxxxxx.json', JSON.stringify(contextSymbols.getDirectives() /*.map( d => d._symbol.name )*/, null, 2));
        // @todo we should return this type
        // {
        //   name,
        //   file: srcFile.fileName.split('/').splice(-3).join('/'),
        //   providers: this.getModuleProviders(props),
        //   declarations: this.getModuleDeclations(props),
        //   imports: this.getModuleImports(props),
        //   exports: this.getModuleExports(props),
        //   bootstrap: this.getModuleBootstrap(props),
        //   __raw: props
        // };
        return [];
    };
    NgAst.prototype.normalizeOptions = function (options, configFilePath) {
        options.genDir = options.basePath = options.baseUrl;
        options.configFilePath = configFilePath;
    };
    NgAst.prototype.createProgramFromTsConfig = function (configFile, overrideFiles) {
        if (overrideFiles === void 0) { overrideFiles = undefined; }
        var projectDirectory = path.dirname(configFile);
        var config = ts.readConfigFile(configFile, ts.sys.readFile).config;
        // Any because of different APIs in TypeScript 2.1 and 2.0
        var parseConfigHost = {
            fileExists: fs.existsSync,
            readDirectory: ts.sys.readDirectory,
            readFile: function (file) { return fs.readFileSync(file, 'utf8'); },
            useCaseSensitiveFileNames: true,
        };
        var parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, projectDirectory);
        parsed.options.baseUrl = parsed.options.baseUrl || projectDirectory;
        this.normalizeOptions(parsed.options, configFile);
        var host = ts.createCompilerHost(parsed.options, true);
        var program = ts.createProgram(overrideFiles || parsed.fileNames, parsed.options, host);
        return program;
    };
    return NgAst;
}(compiler_1.Compiler));
exports.NgAst = NgAst;
//# sourceMappingURL=ngast.js.map