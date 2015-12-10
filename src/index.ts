/// <reference path="../typings/node/node.d.ts" />
import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import * as lib from './lib';

let fileNames = [
	path.join(__dirname, '../test/demo-app/app-1/app.ts')
];

let deps = lib.getDependencies(
	ts.createProgram(fileNames, {
		target: ts.ScriptTarget.ES5, 
		module: ts.ModuleKind.CommonJS
	})
);

var templates = lib.preprocessTemplates({
  shapeModules: "component",
  shapeProviders: "ellipse",
  shapeDirectives: "cds",
  colorScheme: "paired12"
});

lib.generateGraph(templates, deps);