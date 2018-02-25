"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var ngd_core_1 = require("@compodoc/ngd-core");
var dot_template_1 = require("./dot.template");
var fs = require('fs-extra');
var Viz = require('viz.js');
var cleanDot = false;
var cleanSvg = false;
var appName = require('../../../package.json').name;
// http://www.graphviz.org/Documentation/dotguide.pdf
var DotEngine = /** @class */ (function () {
    function DotEngine(options) {
        // http://www.graphviz.org/doc/info/shapes.html
        this.template = dot_template_1.DOT_TEMPLATE;
        this.cwd = process.cwd();
        this.files = {
            component: null
        };
        this.paths = {
            dot: null,
            json: null,
            png: null,
            svg: null,
            html: null
        };
        this.options = {};
        var baseDir = "./" + appName + "/";
        this.options = {
            name: "" + appName,
            output: options.output,
            displayLegend: options.displayLegend,
            outputFormats: options.outputFormats,
            dot: {
                shapeModules: 'component',
                shapeProviders: 'ellipse',
                shapeDirectives: 'cds',
                //http://www.graphviz.org/doc/info/colors.html
                colorScheme: 'set312'
            }
        };
        if (options.output) {
            if (typeof this.options.output !== 'string') {
                ngd_core_1.logger.fatal('Option "output" has been provided but it is not a valid name.');
                process.exit(1);
            }
        }
        this.paths = {
            dot: path.join(this.options.output, '/dependencies.dot'),
            json: path.join(this.options.output, '/dependencies.json'),
            svg: path.join(this.options.output, '/dependencies.svg'),
            png: path.join(this.options.output, '/dependencies.png'),
            html: path.join(this.options.output, '/dependencies.html')
        };
        if (typeof options.silent !== 'undefined') {
            ngd_core_1.logger.silent = options.silent;
        }
    }
    DotEngine.prototype.updateOutput = function (output) {
        this.paths = {
            dot: path.join(output, '/dependencies.dot'),
            json: path.join(output, '/dependencies.json'),
            svg: path.join(output, '/dependencies.svg'),
            png: path.join(output, '/dependencies.png'),
            html: path.join(output, '/dependencies.html')
        };
    };
    DotEngine.prototype.generateGraph = function (deps) {
        var _this = this;
        var template = this.preprocessTemplates(this.options);
        var generators = [];
        // Handle svg dependency with dot, and html with svg
        if (this.options.outputFormats.indexOf('dot') > -1 && this.options.outputFormats.indexOf('svg') === -1 && this.options.outputFormats.indexOf('html') === -1) {
            generators.push(this.generateDot(template, deps));
        }
        if (this.options.outputFormats.indexOf('svg') > -1 && this.options.outputFormats.indexOf('html') === -1) {
            generators.push(this.generateDot(template, deps).then(function (_) { return _this.generateSVG(); }));
            if (this.options.outputFormats.indexOf('svg') > -1 && this.options.outputFormats.indexOf('dot') === -1) {
                cleanDot = true;
            }
        }
        if (this.options.outputFormats.indexOf('json') > -1) {
            generators.push(this.generateJSON(deps));
        }
        if (this.options.outputFormats.indexOf('html') > -1) {
            generators.push(this.generateDot(template, deps).then(function (_) { return _this.generateSVG(); }).then(function (_) { return _this.generateHTML(); }));
            if (this.options.outputFormats.indexOf('html') > -1 && this.options.outputFormats.indexOf('svg') === -1) {
                cleanSvg = true;
            }
            if (this.options.outputFormats.indexOf('html') > -1 && this.options.outputFormats.indexOf('dot') === -1) {
                cleanDot = true;
            }
        }
        // todo(WCH): disable PNG creation due to some errors with phantomjs
        /*
         if (this.options.outputFormats.indexOf('png') > -1) {
         generators.push(this.generatePNG());
         }
         */
        return Promise.all(generators).then(function (_) { return _this.cleanGeneratedFiles(); });
    };
    DotEngine.prototype.cleanGeneratedFiles = function () {
        var removeFile = function (path) {
            return new Promise(function (resolve, reject) {
                fs.unlink(path, function (error) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
        };
        var cleaners = [];
        if (cleanDot) {
            cleaners.push(removeFile(this.paths.dot));
        }
        if (cleanSvg) {
            cleaners.push(removeFile(this.paths.svg));
        }
        return Promise.all(cleaners);
    };
    DotEngine.prototype.preprocessTemplates = function (options) {
        var doT = require('dot');
        var result;
        if (options.displayLegend === 'true' || options.displayLegend === true) {
            result = this.template.replace(/###legend###/g, dot_template_1.LEGEND);
        }
        else {
            result = this.template.replace(/###legend###/g, '""');
        }
        return doT.template(result.replace(/###scheme###/g, options.dot.colorScheme));
    };
    DotEngine.prototype.generateJSON = function (deps) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fs.outputFile(_this.paths.json, JSON.stringify(deps, null, 2), function (error) {
                if (error) {
                    reject(error);
                }
                ngd_core_1.logger.info('creating JSON', _this.paths.json);
                resolve(_this.paths.json);
            });
        });
    };
    // @not-used
    DotEngine.prototype.escape = function (deps) {
        var _this = this;
        return deps.map(function (d) {
            for (var prop in d) {
                if (d.hasOwnProperty(prop)) {
                    var a = d[prop];
                    console.log(a);
                    if (Array.isArray(a)) {
                        return _this.escape(a);
                    }
                    else if (typeof a === 'string') {
                        a = a.replace(/"/g, '\"');
                        a = a.replace(/'/g, "\'");
                        a = a.replace(/\{/g, "\{");
                        a = a.replace(/\)/g, "\)");
                    }
                }
            }
            return d;
        });
    };
    DotEngine.prototype.generateDot = function (template, deps) {
        // todo(wch)
        //deps = this.escape(deps);
        var _this = this;
        return new Promise(function (resolve, reject) {
            fs.outputFile(_this.paths.dot, template({
                modules: deps
            }), function (error) {
                if (error) {
                    reject(error);
                }
                if (cleanDot === false) {
                    ngd_core_1.logger.info('creating DOT', _this.paths.dot);
                }
                resolve(_this.paths.dot);
            });
        });
    };
    DotEngine.prototype.generateSVG = function () {
        var _this = this;
        var vizSvg = Viz(fs.readFileSync(this.paths.dot).toString(), {
            format: 'svg',
            engine: 'dot'
        }, { totalMemory: 32 * 1024 * 1024 });
        return new Promise(function (resolve, reject) {
            fs.outputFile(_this.paths.svg, vizSvg, function (error) {
                if (error) {
                    reject(error);
                }
                if (cleanSvg === false) {
                    ngd_core_1.logger.info('creating SVG', _this.paths.svg);
                }
                resolve(_this.paths.svg);
            });
        });
    };
    DotEngine.prototype.generateHTML = function () {
        var _this = this;
        var svgContent = fs.readFileSync(this.paths.svg).toString();
        var cssContent = "\n\t\t\t<style>\n\t\t\t\t.edge {\n\t\t\t\t\ttransition: opacity 0.5s;\n\t\t\t\t\topacity:0.2;\n\t\t\t\t}\n\t\t\t\t.node {\n\t\t\t\t\ttransition: transform 0.1s;\n\t\t\t\t\ttransform-origin: center center;\n\t\t\t\t}\n\t\t\t\t.node:hover {\n\t\t\t\t\ttransform: scale(1.03);\n\t\t\t\t}\n\t\t\t\t.node:hover + .edge {\n\t\t\t\t\topacity:1;\n\t\t\t\t}\n\t\t\t</style>";
        var htmlContent = "\n\t\t\t\t" + svgContent + "\n\t\t\t";
        return new Promise(function (resolve, reject) {
            fs.outputFile(_this.paths.html, htmlContent, function (error) {
                if (error) {
                    reject(error);
                }
                ngd_core_1.logger.info('creating HTML', _this.paths.html);
                resolve(_this.paths.html);
            });
        });
    };
    DotEngine.prototype.generatePNG = function () {
        var _this = this;
        var svgToPng = require('svg-to-png');
        return new Promise(function (resolve, reject) {
            svgToPng.convert(_this.paths.svg, _this.paths.png).then(function () {
                ngd_core_1.logger.info('creating PNG', this.paths.png);
                resolve(this.paths.image);
            });
        });
    };
    return DotEngine;
}());
exports.DotEngine = DotEngine;
