"use strict";
var path = require('path');
var util = require('util');
var ts = require('typescript');
var logger_1 = require('../../../logger');
var q = require('q');
var d = function (node) {
    console.log(util.inspect(node, { showHidden: true, depth: 10 }));
};
var Crawler;
(function (Crawler) {
    var Dependencies = (function () {
        function Dependencies(file) {
            this.__cache = {};
            this.__nsModule = {};
            this.files = file;
            this.program = ts.createProgram(this.files, {
                target: ts.ScriptTarget.ES5,
                module: ts.ModuleKind.CommonJS
            });
        }
        Dependencies.prototype.getDependencies = function () {
            var _this = this;
            var deps = [];
            var sourceFiles = this.program.getSourceFiles() || [];
            sourceFiles.map(function (file) {
                var filePath = file.fileName;
                if (path.extname(filePath) === '.ts') {
                    if (filePath.lastIndexOf('.d.ts') === -1) {
                        logger_1.logger.info('parsing', filePath);
                        try {
                            _this.getSourceFileDecorators(file, deps);
                        }
                        catch (e) {
                            logger_1.logger.fatal('Ouch', filePath);
                            logger_1.logger.fatal('', e);
                            logger_1.logger.warn('ignoring', filePath);
                            logger_1.logger.warn('see error', '');
                            console.trace(e);
                        }
                    }
                }
                return deps;
            });
            return deps;
        };
        Dependencies.prototype.getSourceFileDecorators = function (srcFile, outputSymbols) {
            var _this = this;
            ts.forEachChild(srcFile, function (node) {
                if (node.decorators) {
                    var visitNode = function (visitedNode, index) {
                        var name = _this.getSymboleName(node);
                        var deps = {};
                        var metadata = node.decorators.pop();
                        var props = visitedNode.expression.arguments.pop().properties;
                        if (_this.isModule(metadata)) {
                            deps = {
                                name: name,
                                file: srcFile.fileName.split('/').splice(-3).join('/'),
                                providers: _this.getModuleProviders(props),
                                declarations: _this.getModuleDeclations(props),
                                imports: _this.getModuleImports(props),
                                exports: _this.getModuleExports(props),
                                bootstrap: _this.getModuleBootstrap(props),
                                __raw: props
                            };
                            outputSymbols.push(deps);
                        }
                        else if (_this.isComponent(metadata)) {
                            deps = {
                                name: name,
                                file: srcFile.fileName.split('/').splice(-3).join('/'),
                                selector: _this.getComponentSelector(props),
                                providers: _this.getComponentProviders(props),
                                templateUrl: _this.getComponentTemplateUrl(props),
                                styleUrls: _this.getComponentStyleUrls(props),
                                __raw: props
                            };
                        }
                        _this.debug(deps);
                        _this.__cache[name] = deps;
                    };
                    var filterByDecorators = function (node) { return /(NgModule|Component)/.test(node.expression.expression.text); };
                    node.decorators
                        .filter(filterByDecorators)
                        .forEach(visitNode);
                }
                else {
                }
            });
        };
        Dependencies.prototype.debug = function (deps) {
            logger_1.logger.debug('debug', deps.name + ":");
            [
                'imports', 'exports', 'declarations', 'providers', 'bootstrap'
            ].forEach(function (symbols) {
                if (deps[symbols] && deps[symbols].length > 0) {
                    logger_1.logger.debug('', "- " + symbols + ":");
                    deps[symbols].map(function (i) { return i.name; }).forEach(function (d) {
                        logger_1.logger.debug('', "\t- " + d);
                    });
                }
            });
        };
        Dependencies.prototype.isComponent = function (metadata) {
            return metadata.expression.expression.text === 'Component';
        };
        Dependencies.prototype.isModule = function (metadata) {
            return metadata.expression.expression.text === 'NgModule';
        };
        Dependencies.prototype.getSymboleName = function (node) {
            return node.name.text;
        };
        Dependencies.prototype.getComponentSelector = function (props) {
            return this.getSymbolDeps(props, 'selector').pop();
        };
        Dependencies.prototype.getModuleProviders = function (props) {
            var _this = this;
            return this.getSymbolDeps(props, 'providers').map(function (name) {
                return _this.parseDeepIndentifier(name);
            });
        };
        Dependencies.prototype.getModuleDeclations = function (props) {
            var _this = this;
            return this.getSymbolDeps(props, 'declarations').map(function (name) {
                var component = _this.findComponentSelectorByName(name);
                if (component) {
                    return component;
                }
                return _this.parseDeepIndentifier(name);
            });
        };
        Dependencies.prototype.getModuleImports = function (props) {
            var _this = this;
            return this.getSymbolDeps(props, 'imports').map(function (name) {
                return _this.parseDeepIndentifier(name);
            });
        };
        Dependencies.prototype.getModuleExports = function (props) {
            var _this = this;
            return this.getSymbolDeps(props, 'exports').map(function (name) {
                return _this.parseDeepIndentifier(name);
            });
        };
        Dependencies.prototype.getModuleBootstrap = function (props) {
            var _this = this;
            return this.getSymbolDeps(props, 'bootstrap').map(function (name) {
                return _this.parseDeepIndentifier(name);
            });
        };
        Dependencies.prototype.getComponentProviders = function (props) {
            var _this = this;
            return this.getSymbolDeps(props, 'providers').map(function (name) {
                return _this.parseDeepIndentifier(name);
            });
        };
        Dependencies.prototype.getComponentDirectives = function (props) {
            var _this = this;
            return this.getSymbolDeps(props, 'directives').map(function (name) {
                var identifier = _this.parseDeepIndentifier(name);
                identifier.selector = _this.findComponentSelectorByName(name);
                identifier.label = '';
                return identifier;
            });
        };
        Dependencies.prototype.parseDeepIndentifier = function (name) {
            var nsModule = name.split('.');
            if (nsModule.length > 1) {
                // cache deps with the same namespace (Shared.*)
                if (this.__nsModule[nsModule[0]]) {
                    this.__nsModule[nsModule[0]].push(name);
                }
                else {
                    this.__nsModule[nsModule[0]] = [name];
                }
                return {
                    ns: nsModule[0],
                    name: name
                };
            }
            return {
                name: name
            };
        };
        Dependencies.prototype.getComponentTemplateUrl = function (props) {
            return this.sanitizeUrls(this.getSymbolDeps(props, 'templateUrl'));
        };
        Dependencies.prototype.getComponentStyleUrls = function (props) {
            return this.sanitizeUrls(this.getSymbolDeps(props, 'styleUrls'));
        };
        Dependencies.prototype.sanitizeUrls = function (urls) {
            return urls.map(function (url) { return url.replace('./', ''); });
        };
        Dependencies.prototype.getSymbolDeps = function (props, type) {
            var deps = props.filter(function (node) {
                return node.name.text === type;
            });
            var parseSymbolText = function (text) {
                if (text.indexOf('/') !== -1) {
                    text = text.split('/').pop();
                }
                return [
                    text
                ];
            };
            var buildIdentifierName = function (node, name) {
                if (name === void 0) { name = ''; }
                if (node.expression) {
                    name = name ? "." + name : name;
                    return "" + buildIdentifierName(node.expression, node.name.text) + name;
                }
                return node.text + "." + name;
            };
            var parseSymbolElements = function (o) {
                // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
                if (o.arguments) {
                    var className = o.expression.expression.text;
                    var functionName = o.expression.name.text;
                    // function arguments could be really complexe. There are so
                    // many use cases that we can't handle. Just print "..." to indicate
                    // that we have arguments.
                    //
                    // let functionArgs = o.arguments.map(arg => arg.text).join(',');
                    var functionArgs = o.arguments.length > 0 ? 'args' : '';
                    var text = className + "." + functionName + "(" + functionArgs + ")";
                    return text;
                }
                else if (o.expression) {
                    var identifier = buildIdentifierName(o);
                    return identifier;
                }
                return o.text;
            };
            var parseSymbols = function (node) {
                var text = node.initializer.text;
                if (text) {
                    return parseSymbolText(text);
                }
                else if (node.initializer.expression) {
                    var identifier = parseSymbolElements(node.initializer);
                    return [
                        identifier
                    ];
                }
                else if (node.initializer.elements) {
                    return node.initializer.elements.map(parseSymbolElements);
                }
            };
            return deps.map(parseSymbols).pop() || [];
        };
        Dependencies.prototype.findComponentSelectorByName = function (name) {
            return this.__cache[name];
        };
        return Dependencies;
    }());
    Crawler.Dependencies = Dependencies;
})(Crawler = exports.Crawler || (exports.Crawler = {}));
