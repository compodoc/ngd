"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodeDecorators = exports.nodeHasDecorator = void 0;
var ts = require("typescript");
function nodeHasDecorator(node) {
    var result = false;
    var nodeModifiers = node.modifiers; // ts.getModifiers(node);
    if (nodeModifiers && nodeModifiers.length > 0) {
        nodeModifiers.forEach(function (nodeModifier) {
            if (nodeModifier.kind === ts.SyntaxKind.Decorator) {
                result = true;
            }
        });
    }
    return result;
}
exports.nodeHasDecorator = nodeHasDecorator;
function getNodeDecorators(node) {
    var result = [];
    var nodeModifiers = node.modifiers; // ts.getModifiers(node);
    if (nodeModifiers && nodeModifiers.length > 0) {
        nodeModifiers.forEach(function (nodeModifier) {
            if (nodeModifier.kind === ts.SyntaxKind.Decorator) {
                result.push(nodeModifier);
            }
        });
    }
    return result;
}
exports.getNodeDecorators = getNodeDecorators;
