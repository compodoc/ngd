import * as ts from 'typescript';

export function nodeHasDecorator(node: any) {
    let result = false;

    const nodeModifiers = node.modifiers; // ts.getModifiers(node);

    if (nodeModifiers && nodeModifiers.length > 0) {
        nodeModifiers.forEach((nodeModifier) => {
            if (nodeModifier.kind === ts.SyntaxKind.Decorator) {
                result = true;
            }
        });
    }

    return result;
}

export function getNodeDecorators(node: any) {
    let result = [];

    const nodeModifiers = node.modifiers; // ts.getModifiers(node);

    if (nodeModifiers && nodeModifiers.length > 0) {
        nodeModifiers.forEach((nodeModifier) => {
            if (nodeModifier.kind === ts.SyntaxKind.Decorator) {
                result.push(nodeModifier);
            }
        });
    }

    return result;
}
