/// <reference path="../typings/node/node.d.ts" />
import * as path from 'path';
import {App} from './application';

App.run({
	
	// has more precedence than "files"
	//tsconfig: require('../tsconfig.json'),
	
	// optional
	//files: [path.join(__dirname, '../test/demo-app/app-1/app.ts')],
	
	// launch/view generated file
	open: false
	
});