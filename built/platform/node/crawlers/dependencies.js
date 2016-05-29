var ts = require('typescript');
var logger_1 = require('../../../logger');
var q = require('q');
var Crawler;
(function (Crawler) {
    var Dependencies = (function () {
        function Dependencies(file) {
            this.cache = {};
            this.files = file;
            this.program = ts.createProgram(this.files, {
                target: 1 /* ES5 */,
                module: 1 /* CommonJS */
            });
        }
        Dependencies.prototype.getDependencies = function () {
            var _this = this;
            var deps = [];
            this.program.getSourceFiles().map(function (file) {
                var filePath = file.fileName;
                if (filePath.lastIndexOf('.d.ts') === -1) {
                    logger_1.logger.info('parsing', filePath);
                    _this.getSourceFileDecorators(file, deps);
                }
                else {
                    logger_1.logger.warn('ignoring tsd', filePath);
                }
                return deps;
            });
            return deps;
        };
        Dependencies.prototype.getSourceFileDecorators = function (srcFile, rawDecorators) {
            var _this = this;
            ts.forEachChild(srcFile, function (node) {
                if (node.decorators) {
                    var filterByComponent = function (node) { return /(Component|View)/.test(node.expression.expression.text); };
                    var getComponents = function (node) { return node.expression.arguments.pop(); };
                    var getProps = function (nodes) { return nodes.properties; };
                    var visitNode = function (props, index) {
                        var componentName = _this.getComponentName(node);
                        var component = {
                            selector: _this.getComponentSelector(props),
                            name: componentName,
                            label: '',
                            file: srcFile.fileName.split('/').splice(-3).join('/'),
                            directives: _this.getComponentDirectives(props),
                            providers: _this.getComponentProviders(props),
                            templateUrl: _this.getComponentTemplateUrl(props),
                            styleUrls: _this.getComponentStyleUrls(props)
                        };
                        rawDecorators.push(component);
                        _this.cache[componentName] = component.selector;
                    };
                    node.decorators
                        .filter(filterByComponent)
                        .map(getComponents)
                        .map(getProps)
                        .forEach(visitNode);
                }
                else {
                }
            });
        };
        Dependencies.prototype.getComponentName = function (node) {
            return node.name.text;
        };
        Dependencies.prototype.getComponentSelector = function (props) {
            return this.getComponentDeps(props, 'selector').pop();
        };
        Dependencies.prototype.getComponentProviders = function (props) {
            var _this = this;
            return this.getComponentDeps(props, 'providers').map(function (name) {
                return {
                    name: name,
                    label: '',
                    selector: _this.findComponentSelectorByName(name)
                };
            });
        };
        Dependencies.prototype.getComponentDirectives = function (props) {
            var _this = this;
            return this.getComponentDeps(props, 'directives').map(function (name) {
                return {
                    name: name,
                    label: '',
                    selector: _this.findComponentSelectorByName(name)
                };
            });
        };
        Dependencies.prototype.getComponentTemplateUrl = function (props) {
            return this.getComponentDeps(props, 'templateUrl');
        };
        Dependencies.prototype.getComponentStyleUrls = function (props) {
            return this.getComponentDeps(props, 'styleUrls');
        };
        Dependencies.prototype.getComponentDeps = function (props, type) {
            return props.filter(function (node) {
                return node.name.text === type;
            }).map(function (node) {
                var text = node.initializer.text;
                if (text) {
                    if (text.indexOf('/') !== -1) {
                        text = text.split('/').pop();
                    }
                    return [text];
                }
                return node.initializer.elements.map(function (o) {
                    if (o.arguments) {
                        return o.arguments.shift().text + '*';
                    }
                    return o.text;
                });
            }).pop() || [];
        };
        Dependencies.prototype.findComponentSelectorByName = function (name) {
            return this.cache[name];
        };
        return Dependencies;
    })();
    Crawler.Dependencies = Dependencies;
})(Crawler = exports.Crawler || (exports.Crawler = {}));
