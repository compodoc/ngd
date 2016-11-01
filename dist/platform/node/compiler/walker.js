"use strict";
var path = require('path');
var ts = require('typescript');
var utilities_1 = require('../../../utilities');
var logger_1 = require('../../../logger');
var q = require('q');
var Crawler;
(function (Crawler) {
    var Dependencies = (function () {
        function Dependencies(files, options) {
            this.__cache = {};
            this.__nsModule = {};
            this.unknown = '???';
            this.files = files;
            var transpileOptions = {
                target: ts.ScriptTarget.ES5,
                module: ts.ModuleKind.CommonJS,
                tsconfigDirectory: options.tsconfigDirectory
            };
            this.program = ts.createProgram(this.files, transpileOptions, utilities_1.compilerHost(transpileOptions));
        }
        Dependencies.prototype.getDependencies = function () {
            var _this = this;
            var deps = [];
            var sourceFiles = this.program.getSourceFiles() || [];
            sourceFiles.map(function (file) {
                var filePath = file.fileName;
                if (path.extname(filePath) === '.ts') {
                    if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                        logger_1.logger.info('parsing', filePath);
                        try {
                            _this.getSourceFileDecorators(file, deps);
                        }
                        catch (e) {
                            logger_1.logger.trace(e, file.fileName);
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
                        var props = _this.findProps(visitedNode);
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
                    var filterByDecorators = function (node) {
                        if (node.expression && node.expression.expression) {
                            return /(NgModule|Component)/.test(node.expression.expression.text);
                        }
                        return false;
                    };
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
            return this.getSymbolDeps(props, 'providers').map(function (providerName) {
                return _this.parseDeepIndentifier(providerName);
            });
        };
        Dependencies.prototype.findProps = function (visitedNode) {
            return visitedNode.expression.arguments.pop().properties;
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
                // cache deps with the same namespace (i.e Shared.*)
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
            var _this = this;
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
                    var nodeName = _this.unknown;
                    if (node.name) {
                        nodeName = node.name.text;
                    }
                    else if (node.text) {
                        nodeName = node.text;
                    }
                    else if (node.expression) {
                        if (node.expression.text) {
                            nodeName = node.expression.text;
                        }
                        else if (node.expression.elements) {
                            if (node.expression.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                                nodeName = node.expression.elements.map(function (el) { return el.text; }).join(', ');
                                nodeName = "[" + nodeName + "]";
                            }
                        }
                    }
                    if (node.kind === ts.SyntaxKind.SpreadElementExpression) {
                        return "..." + nodeName;
                    }
                    return "" + buildIdentifierName(node.expression, nodeName) + name;
                }
                return node.text + "." + name;
            };
            var parseProviderConfiguration = function (o) {
                // parse expressions such as: 
                // { provide: APP_BASE_HREF, useValue: '/' },
                // or
                // { provide: 'Date', useFactory: (d1, d2) => new Date(), deps: ['d1', 'd2'] }
                var _genProviderName = [];
                var _providerProps = [];
                (o.properties || []).forEach(function (prop) {
                    var identifier = prop.initializer.text;
                    if (prop.initializer.kind === ts.SyntaxKind.StringLiteral) {
                        identifier = "'" + identifier + "'";
                    }
                    // lambda function (i.e useFactory)
                    if (prop.initializer.body) {
                        var params = (prop.initializer.parameters || []).map(function (params) { return params.name.text; });
                        identifier = "(" + params.join(', ') + ") => {}";
                    }
                    else if (prop.initializer.elements) {
                        var elements = (prop.initializer.elements || []).map(function (n) {
                            if (n.kind === ts.SyntaxKind.StringLiteral) {
                                return "'" + n.text + "'";
                            }
                            return n.text;
                        });
                        identifier = "[" + elements.join(', ') + "]";
                    }
                    _providerProps.push([
                        // i.e provide
                        prop.name.text,
                        // i.e OpaqueToken or 'StringToken'
                        identifier
                    ].join(': '));
                });
                return "{ " + _providerProps.join(', ') + " }";
            };
            var parseSymbolElements = function (o) {
                // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
                if (o.arguments) {
                    var className = buildIdentifierName(o.expression);
                    // function arguments could be really complexe. There are so
                    // many use cases that we can't handle. Just print "args" to indicate
                    // that we have arguments.
                    var functionArgs = o.arguments.length > 0 ? 'args' : '';
                    var text = className + "(" + functionArgs + ")";
                    return text;
                }
                else if (o.expression) {
                    var identifier = buildIdentifierName(o);
                    return identifier;
                }
                return o.text ? o.text : parseProviderConfiguration(o);
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
