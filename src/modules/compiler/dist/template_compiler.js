"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compiler_1 = require("@angular/compiler");
var TemplateCompiler = (function () {
    function TemplateCompiler() {
    }
    TemplateCompiler.getTemplateAst = function (htmlTemplate) {
        var parser = new compiler_1.HtmlParser();
        var ast = parser.parse(htmlTemplate, '');
        return jsonifyNodes(ast.rootNodes);
    };
    return TemplateCompiler;
}());
exports.TemplateCompiler = TemplateCompiler;
var JsonVisitor = (function () {
    function JsonVisitor() {
    }
    JsonVisitor.prototype.visitElement = function (element, context) {
        var metadata = {
            selector: element.name,
            name: element.name
        };
        if (element.attrs.length > 0) {
            var _a = this._visitAll(element.attrs), name_1 = _a.name, value = _a.value;
            metadata.attrs = element.attrs.map(function (attr) {
                return {
                    name: attr.name,
                    value: attr.value
                };
            });
        }
        if (compiler_1.getHtmlTagDefinition(element.name).isVoid) {
            return metadata;
        }
        if (element.children.length > 0) {
            var ast = this._visitAll(element.children);
            if (ast) {
                metadata.declarations = ast;
            }
        }
        return metadata;
    };
    JsonVisitor.prototype.visitAttribute = function (attribute, context) { };
    JsonVisitor.prototype.visitText = function (text, context) { };
    JsonVisitor.prototype.visitComment = function (comment, context) { };
    JsonVisitor.prototype.visitExpansion = function (expansion, context) { };
    JsonVisitor.prototype.visitExpansionCase = function (expansionCase, context) { };
    JsonVisitor.prototype._visitAll = function (nodes) {
        var _this = this;
        if (nodes.length == 0) {
            return [];
        }
        return nodes.map(function (a) { return a.visit(_this, null); });
    };
    return JsonVisitor;
}());
var jsonVisitor = new JsonVisitor();
function jsonifyNodes(nodes) {
    return nodes.map(function (node) { return node.visit(jsonVisitor, null); });
}
