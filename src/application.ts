/// <reference path="../typings/main.d.ts"/>
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import {Engine} from './engines/dot';
import {Crawler} from './crawlers/dependencies';
import {logger} from './logger';

export namespace App {

	export let run = (options: any) => {

		let files = [];
		if(options.file) {
			if(
				!fs.existsSync(options.file) ||
				!fs.existsSync(path.join(process.cwd(), options.file))
			) {
				logger.fatal(`"${ options.file }" file wa not found`);
				logger.fatal('abort');
				process.exit(1);
			}
			else {
				files = [options.file];
			}
		}
		else if(options.tsconfig) {

			if(!fs.existsSync(options.tsconfig)) {
				logger.fatal('"tsconfig.json" file wa not found in the current directory');
				logger.fatal('abort');
				process.exit(1);
			}
			else {
				options.tsconfig = path.join(
					path.join(process.cwd(), path.dirname(options.tsconfig)),
					path.basename(options.tsconfig)
				);
				logger.info('using tsconfig', options.tsconfig);
				files = require(options.tsconfig).files;

				if(!files) {
					logger.fatal('"tsconfig.json" file does not export a "files" attriutes');
					logger.fatal('abort');
					process.exit(1);
				}
			}

		}
		else if (options.files) {
			logger.info('using files', options.files.length, 'file(s) found');

			files = options.files;
		}
		else {
			logger.fatal('No files to crawl. I need a "tsconfig.json" file or a at least a list of "files"');
			logger.fatal('abort');
			process.exit(1);
		}


		let crawler = new Crawler.Dependencies(
			files //.map( file => path.resolve(__dirname, '../', file))
		);

		let deps = crawler.getDependencies();

		if(deps.length <= 0) {
			logger.info('No dependencies found. See ya');
			process.exit(0);
		}

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
