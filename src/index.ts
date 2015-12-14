/// <reference path="../typings/node/node.d.ts" />
import * as path from 'path';
import {App} from './application';

App.run({
	
	// has more precedence than "tsconfig"
	file: process.argv[2],
	
	// has more precedence than "files"
	tsconfig: path.join(process.cwd(), '/tsconfig.json'),
	
	// last option to provide a list of ts files
	//files: [path.join(process.cwd(), '/test/demo-app/app-1/app.ts')],
	
	// launch/view generated file (in browser or OS specific)
	open: true,
	
	//output: {}
	
});