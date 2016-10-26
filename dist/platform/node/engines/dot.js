"use strict";
var path = require('path');
var logger_1 = require('../../../logger');
var dot_template_1 = require('./dot.template');
var Engine;
(function (Engine) {
    var fs = require('fs-extra');
    var q = require('q');
    var appName = require('../../../../package.json').name;
    // http://www.graphviz.org/Documentation/dotguide.pdf
    var Dot = (function () {
        function Dot(options) {
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
                output: baseDir + "/" + appName,
                displayLegend: options.displayLegend,
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
                    logger_1.logger.fatal('Option "output" has been provided but it is not a valid name.');
                    process.exit(1);
                }
                this.options.output = options.output;
            }
            this.paths = {
                dot: path.join(this.cwd, this.options.output + "/dependencies.dot"),
                json: path.join(this.cwd, this.options.output + "/dependencies.json"),
                svg: path.join(this.cwd, this.options.output + "/dependencies.svg"),
                png: path.join(this.cwd, this.options.output + "/dependencies.png"),
                html: path.join(this.cwd, this.options.output + "/dependencies.html")
            };
        }
        Dot.prototype.generateGraph = function (deps) {
            var _this = this;
            var template = this.preprocessTemplates(this.options);
            return this.generateDot(template, deps)
                .then(function (_) { return _this.generateJSON(deps); })
                .then(function (_) { return _this.generateSVG(); })
                .then(function (_) { return _this.generateHTML(); });
            // todo(WCH): disabling SVG to PNG due to some errors with phantomjs
            //.then( _ => this.generatePNG() );
        };
        Dot.prototype.preprocessTemplates = function (options) {
            var doT = require('dot');
            var _result;
            if (options.displayLegend === 'true' || options.displayLegend) {
                _result = this.template.replace(/###legend###/g, dot_template_1.LEGEND);
            }
            else {
                _result = this.template.replace(/###legend###/g, '""');
            }
            return doT.template(_result.replace(/###scheme###/g, options.dot.colorScheme));
        };
        Dot.prototype.generateJSON = function (deps) {
            var _this = this;
            var d = q.defer();
            fs.outputFile(this.paths.json, JSON.stringify(deps, null, 2), function (error) {
                if (error) {
                    d.reject(error);
                }
                logger_1.logger.info('creating JSON', _this.paths.json);
                d.resolve(_this.paths.json);
            });
            return d.promise;
        };
        Dot.prototype.generateDot = function (template, deps) {
            var _this = this;
            var d = q.defer();
            fs.outputFile(this.paths.dot, template({
                modules: deps
            }), function (error) {
                if (error) {
                    d.reject(error);
                }
                logger_1.logger.info('creating DOT', _this.paths.dot);
                d.resolve(_this.paths.dot);
            });
            return d.promise;
        };
        Dot.prototype.generateSVG = function () {
            var _this = this;
            var Viz = require('viz.js');
            var viz_svg = Viz(fs.readFileSync(this.paths.dot).toString(), {
                format: 'svg',
                engine: 'dot'
            });
            var d = q.defer();
            fs.outputFile(this.paths.svg, viz_svg, function (error) {
                if (error) {
                    d.reject(error);
                }
                logger_1.logger.info('creating SVG', _this.paths.svg);
                d.resolve(_this.paths.svg);
            });
            return d.promise;
        };
        Dot.prototype.generateHTML = function () {
            var _this = this;
            var svgContent = fs.readFileSync(this.paths.svg).toString();
            var cssContent = "\n\t\t\t<style>\n\t\t\t\t.edge {\n\t\t\t\t\ttransition: opacity 0.5s;\n\t\t\t\t\topacity:0.2;\n\t\t\t\t}\n\t\t\t\t.node {\n\t\t\t\t\ttransition: transform 0.1s;\n\t\t\t\t\ttransform-origin: center center;\n\t\t\t\t}\n\t\t\t\t.node:hover {\n\t\t\t\t\ttransform: scale(1.03);\n\t\t\t\t}\n\t\t\t\t.node:hover + .edge {\n\t\t\t\t\topacity:1;\n\t\t\t\t}\n\t\t\t</style>";
            var htmlContent = "\n\t\t\t\t" + svgContent + "\n\t\t\t";
            var d = q.defer();
            fs.outputFile(this.paths.html, htmlContent, function (error) {
                if (error) {
                    d.reject(error);
                }
                logger_1.logger.info('creating HTML', _this.paths.html);
                d.resolve(_this.paths.html);
            });
            return d.promise;
        };
        Dot.prototype.generatePNG = function () {
            var svg_to_png = require('svg-to-png');
            var d = q.defer();
            svg_to_png.convert(this.paths.svg, path.join(this.cwd, "" + this.options.output)).then(function () {
                logger_1.logger.info('creating PNG', this.paths.png);
                d.resolve(this.paths.image);
            });
            return d.promise;
        };
        return Dot;
    }());
    Engine.Dot = Dot;
})(Engine = exports.Engine || (exports.Engine = {}));
