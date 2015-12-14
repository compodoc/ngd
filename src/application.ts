/// <reference path="../typings/node/node.d.ts" />
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import {Engine} from './engines/dot';
import {Crawler} from './crawlers/dependencies';
import {logger} from './logger';

export namespace App {
	
	export let run = (options: any) => {
			
		let files = [];
		if(options.tsconfig && options.tsconfig.files) {
			files = options.tsconfig.files;
		}
		else if (options.files) {
			files = options.files;
		}
		else {
			logger.fatal('No files to crawl. I need a "tsconfig.json" file or a at least a list of "files"');
			logger.fatal('abort');
			process.exit(1);
		}
			
		let crawler = new Crawler.Dependencies(
			files.map( file => path.resolve(__dirname, '../', file))
		);
		let deps = crawler.getDependencies();
		
		let engine = new Engine.Dot({
			output: options.output
		});
		engine
			.generateGraph(deps)
			.then( file => {
				
				if (options.open === true) {
					logger.info('openning file ', file);
					let open = require("opener");
					open(file);
				}
			})
			.catch( e => logger.error(e) )
			.finally( _ => logger.info('done'))
			
	}
}
