"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var ts = require("typescript");
var ngd_core_1 = require("@compodoc/ngd-core");
var template_compiler_1 = require("./template_compiler");
var Compiler = (function () {
    function Compiler(files, options) {
        this.cachedSymboles = new Map();
        this.nsModule = {};
        this.depth = 1;
        this.includeRawProps = false;
        this.UNKNWON_PARAMS = '???';
        this.ANALYZED_DECORATORS = /(NgModule|Component|Directive|Pipe)/;
        this.DIRECTIVE_DECORATORS = ['Component', 'Directive'];
        this.MODULE_DECORATOR = 'NgModule';
        this.files = files;
        var transpileOptions = {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS,
            tsconfigDirectory: options.tsconfigDirectory
        };
        this.program = ts.createProgram(this.files, transpileOptions, ngd_core_1.compilerHost(transpileOptions));
    }
    Compiler.prototype.getDependencies = function () {
        var _this = this;
        var deps = [];
        this.depth = 1;
        var sourceFiles = this.program.getSourceFiles() || [];
        sourceFiles.map(function (file) {
            var filePath = file.fileName;
            if (path.extname(filePath) === '.ts') {
                if (filePath.lastIndexOf('.d.ts') === -1 && filePath.lastIndexOf('spec.ts') === -1) {
                    ngd_core_1.logger.info('parsing', filePath);
                    try {
                        _this.visitAll(file, deps);
                    }
                    catch (e) {
                        ngd_core_1.logger.trace(e, file.fileName);
                    }
                }
            }
            return deps;
        });
        // do one last pass to update all declarations definition
        deps = this.updateDeclarations(deps);
        return deps;
    };
    Compiler.prototype.visitAll = function (srcFile, outputSymbols) {
        var _this = this;
        ts.forEachChild(srcFile, function (node) {
            if (node.decorators) {
                var visitNode = function (visitedNode, index) {
                    var name = _this.getSymboleName(node);
                    var file = srcFile.fileName.split('/').splice(-3).join('/');
                    var fileName = srcFile.fileName;
                    var id = _this.uuid();
                    var moduleDeps = {};
                    var directivesDeps = {};
                    var metadata = node.decorators.pop();
                    var props = _this.findProps(visitedNode);
                    var type = _this.getSymbolType(metadata);
                    var __level = _this.depth;
                    // pre-cache
                    if (!_this.cachedSymboles.has(name)) {
                        _this.cachedSymboles.set(name, {
                            name: name,
                            id: id,
                            type: type
                        });
                    }
                    if (_this.isModule(metadata)) {
                        moduleDeps = {
                            name: name,
                            id: id,
                            file: file,
                            type: type,
                            fileName: fileName,
                            __level: __level,
                            providers: _this.getModuleProviders(props),
                            declarations: _this.getModuleDeclations(props),
                            imports: _this.getModuleImports(props),
                            exports: _this.getModuleExports(props),
                            bootstrap: _this.getModuleBootstrap(props),
                        };
                        if (_this.includeRawProps) {
                            moduleDeps.__raw = props;
                        }
                        // post-cache
                        _this.cachedSymboles.set(name, moduleDeps);
                        // we only push modules to output
                        outputSymbols.push(moduleDeps);
                        _this.debug(moduleDeps);
                    }
                    else if (_this.isDirective(metadata)) {
                        directivesDeps = {
                            name: name,
                            id: id,
                            file: file,
                            type: type,
                            fileName: fileName,
                            __level: __level,
                            selector: _this.getComponentSelector(props),
                            providers: _this.getComponentProviders(props),
                            templateUrl: _this.getComponentTemplateUrl(props),
                            template: _this.getComponentTemplate(props),
                            declarations: [],
                            styleUrls: _this.getComponentStyleUrls(props),
                        };
                        if (_this.includeRawProps) {
                            directivesDeps.__raw = props;
                        }
                        // post-cache
                        _this.cachedSymboles.set(name, directivesDeps);
                    }
                    _this.depth++;
                };
                var filterByDecorators = function (node) {
                    if (node.expression && node.expression.expression) {
                        return _this.ANALYZED_DECORATORS.test(node.expression.expression.text);
                    }
                    return false;
                };
                node.decorators
                    .filter(filterByDecorators)
                    .forEach(visitNode);
            }
            else {
                // logger.debug('skip', `non-metadata`);
            }
        });
    };
    Compiler.prototype.uuid = function () {
        var uuid = '', i, random;
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
            if (i == 8 || i == 12 || i == 16 || i == 20) {
                uuid += '-';
            }
            uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    };
    Compiler.prototype.updateDeclarations = function (outputSymbols) {
        var _this = this;
        Array.from(this.cachedSymboles.keys()).map(function (directiveName) {
            var directive = _this.cachedSymboles.get(directiveName);
            if (directive.type === 'component') {
                outputSymbols = _this.updateDirectiveDeclarationsInModules(outputSymbols, directive);
            }
        });
        outputSymbols.map(function (moduleSymbol) {
            return moduleSymbol.declarations.map(function (directiveSymbol) {
                return directiveSymbol.declarations = _this.getComponentChildren(directiveSymbol);
            });
        });
        return outputSymbols;
    };
    Compiler.prototype.debug = function (deps) {
        ngd_core_1.logger.debug('debug', deps.name + ":");
        [
            'imports', 'exports', 'declarations', 'providers', 'bootstrap'
        ].forEach(function (symbols) {
            if (deps[symbols] && deps[symbols].length > 0) {
                ngd_core_1.logger.debug('', "- " + symbols + ":");
                deps[symbols].map(function (i) { return i.name; }).forEach(function (d) {
                    ngd_core_1.logger.debug('', "\t- " + d);
                });
            }
        });
    };
    Compiler.prototype.isDirective = function (metadata) {
        var text = metadata.expression.expression.text;
        return this.DIRECTIVE_DECORATORS.indexOf(text) >= 0;
    };
    Compiler.prototype.getSymbolType = function (metadata) {
        return metadata.expression.expression.text.toLowerCase();
    };
    Compiler.prototype.isModule = function (metadata) {
        return metadata.expression.expression.text === this.MODULE_DECORATOR;
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
            var symbol = _this.parseDeepIndentifier(providerName);
            symbol.type = 'provider';
            return symbol;
        });
    };
    Compiler.prototype.findProps = function (visitedNode) {
        return visitedNode.expression.arguments.pop().properties;
    };
    Compiler.prototype.updateDirectiveDeclarationsInModules = function (modules, directiveMetadata) {
        return modules.map(function (module) {
            var moduleDeclarations = module.declarations;
            for (var index = 0; index < moduleDeclarations.length; index++) {
                if (moduleDeclarations[index].name === directiveMetadata.name) {
                    // clone directiveMetadata
                    for (var prop in directiveMetadata) {
                        if (directiveMetadata.hasOwnProperty(prop)) {
                            moduleDeclarations[index][prop] = directiveMetadata[prop];
                        }
                    }
                    break;
                }
            }
            module.declarations = moduleDeclarations;
            return module;
        });
    };
    Compiler.prototype.getModuleDeclations = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'declarations').map(function (name) {
            var component = _this.getDirectiveMetadataByName(name);
            if (component) {
                return component;
            }
            var symbol = _this.parseDeepIndentifier(name);
            var type = 'pipe';
            if (_this.getComponentTemplate(props) || _this.getComponentTemplateUrl(props)) {
                type = 'component';
            }
            symbol.type = type;
            return symbol;
        });
    };
    Compiler.prototype.getModuleImports = function (props) {
        var _this = this;
        return this.getSymbolDeps(props, 'imports').map(function (name) {
            var symbol = _this.parseDeepIndentifier(name);
            symbol.type = 'module';
            return symbol;
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
            var symbol = _this.parseDeepIndentifier(name);
            symbol.type = 'provider';
            return symbol;
        });
    };
    Compiler.prototype.parseDeepIndentifier = function (name) {
        var nsModule = name.split('.');
        if (nsModule.length > 1) {
            // cache deps with the same namespace (i.e Shared.*)
            if (this.nsModule[nsModule[0]]) {
                this.nsModule[nsModule[0]].push(name);
            }
            else {
                this.nsModule[nsModule[0]] = [name];
            }
            return {
                ns: nsModule[0],
                name: name,
                id: this.uuid(),
                __level: this.depth
            };
        }
        var id = this.uuid();
        if (this.cachedSymboles.has(name)) {
            // don't generate a new "id"
            // get "id" from previously stored module
            id = this.cachedSymboles.get(name).id;
        }
        return {
            name: name,
            id: id,
            __level: this.depth
        };
    };
    Compiler.prototype.getComponentTemplateUrl = function (props) {
        return this.sanitizeUrls(this.getSymbolDeps(props, 'templateUrl'));
    };
    Compiler.prototype.getComponentTemplate = function (props) {
        return this.getSymbolDeps(props, 'template').pop();
    };
    Compiler.prototype.getComponentChildren = function (metadata) {
        var _this = this;
        var content = metadata.template;
        if (content === undefined) {
            // handle Pipes
            if (metadata.fileName) {
                var dirname_1 = path.dirname(metadata.fileName);
                content = metadata.templateUrl.map(function (templateUrl) {
                    templateUrl = path.resolve(dirname_1, templateUrl);
                    return fs.readFileSync(templateUrl, 'utf-8').toString();
                }).pop();
            }
        }
        if (content) {
            var ast = template_compiler_1.TemplateCompiler.getTemplateAst(content);
            var astOutput = new Map();
            var reVisit_1 = function (ast, astOutput) {
                if (ast) {
                    ast.map(function (metadata) {
                        if (metadata && metadata.selector) {
                            var directiveMetadata = _this.getDirectiveMetadataBySelector(metadata.selector);
                            if (directiveMetadata) {
                                directiveMetadata.__level = _this.depth + 1;
                                astOutput.set(directiveMetadata.name, directiveMetadata);
                            }
                            return reVisit_1(metadata.declarations, astOutput);
                        }
                        return metadata;
                    }).filter(function (node) { return node !== null; });
                }
            };
            reVisit_1(ast, astOutput);
            return Array.from(astOutput.values());
        }
        return [];
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
            if (type !== 'template') {
                if (text.indexOf('/') !== -1) {
                    text = text.split('/').pop();
                }
            }
            return [
                text
            ];
        };
        var buildIdentifierName = function (node, name) {
            if (name === void 0) { name = ''; }
            if (node.expression) {
                name = name ? "." + name : name;
                var nodeName = _this.UNKNWON_PARAMS;
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
                if (node.kind === ts.SyntaxKind.SpreadElement) {
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
    Compiler.prototype.getDirectiveMetadataByName = function (name) {
        return this.cachedSymboles.get(name);
    };
    Compiler.prototype.getDirectiveMetadataBySelector = function (selector) {
        return Array.from(this.cachedSymboles.values()).filter(function (s) { return s.selector === selector; }).pop();
    };
    return Compiler;
}());
exports.Compiler = Compiler;
