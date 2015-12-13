/// <reference path="../typings/node/node.d.ts" />
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import {Engine} from './engine';

let fileNames = [
	path.join(__dirname, '../test/demo-app/app-1/app.ts')
].forEach( (file) => {
	
	let g = new graph(); 
	
	graph
		.getDependencies(file)
		.then(graph.generateGraph);
	
})