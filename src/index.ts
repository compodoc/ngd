/// <reference path="../typings/node/node.d.ts" />
import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import * as lib from './lib';

let fileNames = [
	//'/Users/wchegham/Sandbox/dev/ng2-dyk/src/app/components/Fact.ts',
	//'/Users/wchegham/Sandbox/dev/ng2-dyk/src/app/components/LoadingIndicator.ts'
	path.join(__dirname, '../test/test.ts')
];

let deps = lib.getDependencies(
	ts.createProgram(fileNames, {
		target: ts.ScriptTarget.ES5, 
		module: ts.ModuleKind.CommonJS
	})
);

var templates = lib.preprocessTemplates({
  shapeModules: "component",
  shapeFactories: "ellipse",
  shapeDirectives: "cds",
  colorScheme: "paired12"
});

lib.generateGraph(templates, deps);