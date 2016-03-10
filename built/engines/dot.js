/// <reference path="../../typings/main.d.ts" />
"use strict";
var path = require('path');
var logger_1 = require('../logger');
var Engine;
(function (Engine) {
    var fs = require('fs-extra');
    var q = require('q');
    var appName = require('../../package.json').name;
    // http://www.graphviz.org/Documentation/dotguide.pdf
    var Dot = (function () {
        function Dot(options) {
            // http://www.graphviz.org/doc/info/shapes.html
            this.template = "\ndigraph dependencies {\n  node[shape=\"ellipse\", style=\"filled\", colorscheme={scheme}];\n\tsplines=ortho;\n\n\t/* Graph orientation */\n  rankdir=BT;\n\n  {{~it.components :cmp}}\n  subgraph \"{{=cmp.name}}\" {\n\n    label=\"{{=cmp.file}}\";\n\n    \"{{=cmp.name}}\" [shape=\"component\"];\n\n    /* providers:start */\n\n    {{~cmp.providers :provider}}\n      \"{{=provider.name}}\" [fillcolor=1, shape=\"ellipse\"];\n      \"{{=provider.name}}\" -> \"{{=cmp.name}}\" /*[label=\"{{=cmp.file}}\"]*/;\n    {{~}}\n\n    /* providers:end */\n\n    /* directives:start */\n\n    node[shape=\"cds\", style=\"filled\", color=5];\n    {{~cmp.directives :directive}}\n      \"{{=directive.name}}\" [];\n      \"{{=directive.name}}\" -> \"{{=cmp.name}}\" /*[label=\"{{=cmp.file}}\"]*/;\n    {{~}}\n\n    /* directives:end */\n\n\t\t/* templateUrl:start */\n\n    node[shape=\"note\", style=\"filled\", color=7];\n    {{~cmp.templateUrl :url}}\n      \"{{=url}}\" [];\n      \"{{=cmp.name}}\" -> \"{{=url}}\" [style=dotted];\n    {{~}}\n\n    /* templateUrl:end */\n\n\t\t/* styleUrls:start */\n\n    node[shape=\"note\", style=\"filled\", color=8];\n    {{~cmp.styleUrls :url}}\n      \"{{=url}}\" [];\n      \"{{=cmp.name}}\" -> \"{{=url}}\" [style=dotted];\n    {{~}}\n\n    /* styleUrls:end */\n\n  }\n  {{~}}\n\n}\n\t\t";
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
            var baseDir = './angular2-dependencies-graph/';
            this.options = {
                name: "" + appName,
                output: baseDir + "/" + appName,
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
            this.createOutputFolders(this.options.output);
        }
        Dot.prototype.generateGraph = function (deps) {
            var _this = this;
            var template = this.preprocessTemplates(this.options.dot);
            return this.generateDot(template, deps)
                .then(function (_) { return _this.generateJSON(deps); })
                .then(function (_) { return _this.generateSVG(); })
                .then(function (_) { return _this.generateHTML(); });
            //.then( _ => this.generatePNG() );
        };
        Dot.prototype.createOutputFolders = function (output) {
            var _this = this;
            Object.keys(output).forEach(function (prop) {
                return fs.mkdirpSync(path.join(_this.cwd, "../../" + output[prop]));
            });
        };
        Dot.prototype.preprocessTemplates = function (options) {
            var doT = require('dot');
            this.template = this.template
                .replace(/\{scheme\}/g, options.colorScheme);
            return doT.template(this.template);
        };
        Dot.prototype.generateJSON = function (deps) {
            var _this = this;
            var d = q.defer();
            fs.outputFile(this.paths.json, JSON.stringify(deps, null, 2), function (error) {
                if (error) {
                    d.reject(error);
                }
                logger_1.logger.info('creating JSON', 'done');
                d.resolve(_this.paths.json);
            });
            return d.promise;
        };
        Dot.prototype.generateDot = function (template, deps) {
            var _this = this;
            logger_1.logger.info('creating DOT', this.paths.dot);
            var d = q.defer();
            fs.outputFile(this.paths.dot, template({
                components: deps
            }), function (error) {
                if (error) {
                    d.reject(error);
                }
                logger_1.logger.info('creating DOT', 'done');
                d.resolve(_this.paths.dot);
            });
            return d.promise;
        };
        Dot.prototype.generateSVG = function () {
            var _this = this;
            logger_1.logger.info('creating SVG', this.paths.svg);
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
                logger_1.logger.info('creating SVG', 'done');
                d.resolve(_this.paths.svg);
            });
            return d.promise;
        };
        Dot.prototype.generateHTML = function () {
            var _this = this;
            logger_1.logger.info('creating HTML', this.paths.html);
            var svgContent = fs.readFileSync(this.paths.svg).toString();
            var d = q.defer();
            fs.outputFile(this.paths.html, svgContent, function (error) {
                if (error) {
                    d.reject(error);
                }
                logger_1.logger.info('creating HTML', 'done');
                d.resolve(_this.paths.html);
            });
            return d.promise;
        };
        Dot.prototype.generatePNG = function () {
            logger_1.logger.info('creating PNG', this.paths.png);
            var svg_to_png = require('svg-to-png');
            var d = q.defer();
            svg_to_png.convert(this.paths.svg, path.join(this.cwd, "" + this.options.output)).then(function () {
                logger_1.logger.info('creating PNG', 'done');
                d.resolve(this.paths.image);
            });
            return d.promise;
        };
        return Dot;
    }());
    Engine.Dot = Dot;
})(Engine = exports.Engine || (exports.Engine = {}));
