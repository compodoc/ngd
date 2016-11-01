"use strict";
var ts = require('typescript');
var fs = require('fs');
var util = require('util');
function d(node) {
    console.log(util.inspect(node, { showHidden: true, depth: 10 }));
}
exports.d = d;
var carriageReturnLineFeed = '\r\n';
var lineFeed = '\n';
// get default new line break
function getNewLineCharacter(options) {
    if (options.newLine === ts.NewLineKind.CarriageReturnLineFeed) {
        return carriageReturnLineFeed;
    }
    else if (options.newLine === ts.NewLineKind.LineFeed) {
        return lineFeed;
    }
    return carriageReturnLineFeed;
}
exports.getNewLineCharacter = getNewLineCharacter;
// Create a compilerHost object to allow the compiler to read and write files
function compilerHost(transpileOptions) {
    var inputFileName = transpileOptions.fileName || (transpileOptions.jsx ? 'module.tsx' : 'module.ts');
    var compilerHost = {
        getSourceFile: function (fileName) {
            if (fileName.lastIndexOf('.ts') !== -1) {
                if (fileName === 'lib.d.ts') {
                    return undefined;
                }
                var libSource = fs.readFileSync(fileName).toString();
                return ts.createSourceFile(fileName, libSource, transpileOptions.target, false);
            }
            return undefined;
        },
        writeFile: function (name, text) { },
        getDefaultLibFileName: function () { return 'lib.d.ts'; },
        useCaseSensitiveFileNames: function () { return false; },
        getCanonicalFileName: function (fileName) { return fileName; },
        getCurrentDirectory: function () { return ''; },
        getNewLine: function () { return '\n'; },
        fileExists: function (fileName) { return fileName === inputFileName; },
        readFile: function () { return ''; },
        directoryExists: function () { return true; },
        getDirectories: function () { return []; }
    };
    return compilerHost;
}
exports.compilerHost = compilerHost;