/// <reference path="../typings/node/node.d.ts" />
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import {Engine} from './engines/dot';
import {Crawler} from './crawlers/dependencies';
import {logger} from './logger';

export namespace App {
	
	export let run = (tsconfig: any) => {
			
		let crawler = new Crawler.Dependencies(
			[path.join(__dirname, '../test/demo-app/app-1/app.ts')]
			//tsconfig.files.map( file => path.resolve(__dirname, '../', file))
		);
		let engine = new Engine.Dot();
		
		let deps = crawler.getDependencies();
		engine
			.generateGraph(deps)
			.then( file => {
				let open = require("opener");
				logger.info('openning file ', file);
				open(file);
			})
			.catch( e => logger.error(e) )
			.finally( file => logger.info('done'))
			
	}
}
