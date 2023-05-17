"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
var path = require("path");
var ts = require("typescript");
var ngd_core_1 = require("@compodoc/ngd-core");
var utils_1 = require("./utils");
var Compiler = /** @class */ (function () {
    function Compiler(files, options) {
        this.__cache = {};
        this.__nsModule = {};
        this.unknown = '???';
        this.files = files;
        var transpileOptions = {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            tsconfigDirectory: options.tsconfigDirectory,
        };
        this.program = ts.createProgram(this.files, transpileOptions, (0, ngd_core_1.compilerHost)(transpileOptions));
        // silent this instance of the logger
        ngd_core_1.logger.setVerbose(options.silent);
    }
    Compiler.prototype.getDependencies = function () {
        var _this = this;
        var deps = [];
        var sourceFiles = this.program.getSourceFiles() || [];
        sourceFiles.map(function (file) {
            var filePath = file.fileName;
            if (path.extname(filePath) === '.ts') {
                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    ngd_core_1.logger.info('parsing', filePath);
                    try {
                        _this.getSourceFileDecorators(file, deps);
                    }
                    catch (e) {
                        ngd_core_1.logger.trace(e, file.fileName);
                    }
                }
            }
            return deps;
        });
        return deps;
    };
    Compiler.prototype.getSourceFileDecorators = function (srcFile, outputSymbols) {
        var _this = this;
        ts.forEachChild(srcFile, function (node) {
            (0, utils_1.getNodeDecorators)(node);
            var decorators = (0, utils_1.getNodeDecorators)(node) || [];
            if ((0, utils_1.nodeHasDecorator)(node)) {
                var visitNode = function (visitedNode, index) {
                    var name = _this.getSymboleName(node);
                    var deps = {};
                    var metadata = decorators[decorators.length - 1];
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
                            __raw: props,
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
                            __raw: props,
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
                decorators.filter(filterByDecorators).forEach(visitNode);
            }
            else {
                // process.stdout.write('.');
            }
        });
    };
    Compiler.prototype.debug = function (deps) {
        ngd_core_1.logger.debug('debug', "".concat(deps.name, ":"));
        ['imports', 'exports', 'declarations', 'providers', 'bootstrap'].forEach(function (symbols) {
            if (deps[symbols] && deps[symbols].length > 0) {
                ngd_core_1.logger.debug('', "- ".concat(symbols, ":"));
                deps[symbols]
                    .map(function (i) { return i.name; })
                    .forEach(function (d) {
                    ngd_core_1.logger.debug('', "\t- ".concat(d));
                });
            }
        });
    };
    Compiler.prototype.isComponent = function (metadata) {
        return metadata.expression.expression.text === 'Component';
    };
    Compiler.prototype.isModule = function (metadata) {
        return metadata.expression.expression.text === 'NgModule';
    };
    Compiler.prototype.getSymboleName = function (node) {
        return node.name.text;
    };
    Compiler.prototype.getComponentSelector = function (props) {
        return this.getSymbolDeps(props, 'selector').pop();
    };
    Compiler.prototype.getModuleProviders = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'providers').map(function (providerName) {
            return _this.parseDeepIndentifier(providerName);
        });
    };
    Compiler.prototype.findProps = function (visitedNode) {
        return visitedNode.expression.arguments.pop().properties;
    };
    Compiler.prototype.getModuleDeclations = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'declarations').map(function (name) {
            var component = _this.findComponentSelectorByName(name);
            if (component) {
                return component;
            }
            return _this.parseDeepIndentifier(name);
        });
    };
    Compiler.prototype.getModuleImports = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'imports').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Compiler.prototype.getModuleExports = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'exports').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Compiler.prototype.getModuleBootstrap = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'bootstrap').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Compiler.prototype.getComponentProviders = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'providers').map(function (name) {
            return _this.parseDeepIndentifier(name);
        });
    };
    Compiler.prototype.getComponentDirectives = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'directives').map(function (name) {
            var identifier = _this.parseDeepIndentifier(name);
            identifier.selector = _this.findComponentSelectorByName(name);
            identifier.label = '';
            return identifier;
        });
    };
    Compiler.prototype.parseDeepIndentifier = function (name) {
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
                name: name,
            };
        }
        return {
            name: name,
        };
    };
    Compiler.prototype.getComponentTemplateUrl = function (props) {
        return this.sanitizeUrls(this.getSymbolDeps(props, 'templateUrl'));
    };
    Compiler.prototype.getComponentStyleUrls = function (props) {
        return this.sanitizeUrls(this.getSymbolDeps(props, 'styleUrls'));
    };
    Compiler.prototype.sanitizeUrls = function (urls) {
        return urls.map(function (url) { return url.replace('./', ''); });
    };
    Compiler.prototype.getSymbolDeps = function (props, type) {
        var _this = this;
        var deps = props.filter(function (node) {
            return node.name.text === type;
        });
        var parseSymbolText = function (text) {
            if (text.indexOf('/') !== -1) {
                text = text.split('/').pop();
            }
            return [text];
        };
        var buildIdentifierName = function (node, name) {
            if (name === void 0) { name = ''; }
            if (node.expression) {
                name = name ? ".".concat(name) : name;
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
                            nodeName = "[".concat(nodeName, "]");
                        }
                    }
                }
                if (node.kind === ts.SyntaxKind.SpreadElement) {
                    return "...".concat(nodeName);
                }
                return "".concat(buildIdentifierName(node.expression, nodeName)).concat(name);
            }
            return "".concat(node.text, ".").concat(name);
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
                    identifier = "'".concat(identifier, "'");
                }
                // lambda function (i.e useFactory)
                if (prop.initializer.body) {
                    var params = (prop.initializer.parameters || []).map(function (params) { return params.name.text; });
                    identifier = "(".concat(params.join(', '), ") => {}");
                }
                // factory deps array
                else if (prop.initializer.elements) {
                    var elements = (prop.initializer.elements || []).map(function (n) {
                        if (n.kind === ts.SyntaxKind.StringLiteral) {
                            return "'".concat(n.text, "'");
                        }
                        return n.text;
                    });
                    identifier = "[".concat(elements.join(', '), "]");
                }
                _providerProps.push([
                    // i.e provide
                    prop.name.text,
                    // i.e OpaqueToken or 'StringToken'
                    identifier,
                ].join(': '));
            });
            return "{ ".concat(_providerProps.join(', '), " }");
        };
        var parseSymbolElements = function (o) {
            // parse expressions such as: AngularFireModule.initializeApp(firebaseConfig)
            if (o.arguments) {
                var className = buildIdentifierName(o.expression);
                // function arguments could be really complexe. There are so
                // many use cases that we can't handle. Just print "args" to indicate
                // that we have arguments.
                var functionArgs = o.arguments.length > 0 ? 'args' : '';
                var text = "".concat(className, "(").concat(functionArgs, ")");
                return text;
            }
            // parse expressions such as: Shared.Module
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
                return [identifier];
            }
            else if (node.initializer.elements) {
                return node.initializer.elements.map(parseSymbolElements);
            }
        };
        return deps.map(parseSymbols).pop() || [];
    };
    Compiler.prototype.findComponentSelectorByName = function (name) {
        return this.__cache[name];
    };
    return Compiler;
}());
exports.Compiler = Compiler;
