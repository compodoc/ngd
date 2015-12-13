/// <reference path="../../typings/tsd.d.ts" />

import * as path from 'path';
import {logger} from '../logger';

interface IOptions {
	name?: string;
	output?: {
		dot: string,
		image: string,
		html: string
	};
	dot?: {
		shapeModules: string
		shapeProviders: string
		shapeDirectives: string
		colorScheme: string
	};
}

export namespace Engine {

	let fs = require('fs-extra');
	let q = require('q');
	
	
	let appName = require('../../package.json').shortName;
	
	export class Dot {
		
		files = {
			component: null
		};
		
		options: IOptions = {};
		
		constructor() {
			let tpl = path.resolve(__dirname + '/../../templates/component.def');
			if(fs.existsSync(tpl) === false) {
				logger.fatal(`Uh oh! The file "component.def" is missing from "${ path.resolve(__dirname, '../../', './templates/') }"`);
				logger.fatal(`abort.`)
				process.exit(1);
			}
			
			this.files = {
				component: fs.readFileSync(tpl)
			}
			this.options = {
				name: `${ appName }`,
				output: {
					dot: path.resolve(__dirname, '../../', `./${ appName }/dot`),
					image: path.resolve(__dirname, '../../', `./${ appName }/png`),
					html: path.resolve(__dirname, '../../', `./${ appName }/html`)
				},
				dot: {
					shapeModules: 'component',
					shapeProviders: 'ellipse',
					shapeDirectives: 'cds',
					colorScheme: 'paired12'
				}
			};
		}
		
		generateGraph(deps) {
			logger.info('starting process...');
			
			let template = this.preprocessTemplates(this.options.dot);
			
			return this.generateDot(template, deps)
			.then( _ => this.generateSVG() )
			.then( _ => this.generateHTML() );
			//.then( _ => this.generatePNG() );
		}
		
		private preprocessTemplates(options?) {
			logger.info('processing templates...');
			
			let doT = require('dot');
			
			['component'].forEach((file) => {
				this.files[file] = this.files[file].toString()
					.replace(/\{1\}/g, options.shapeModules)
					.replace(/\{2\}/g, options.shapeProviders)
					.replace(/\{3\}/g, options.shapeDirectives)
					.replace(/\{scheme\}/g, options.colorScheme);
				});
			
			return doT.template(this.files.component.toString());
		}
		
		private generateDot(template, deps) {
			let dotFile = `${ this.options.output.dot }/${ this.options.name }.dot`;
			logger.info('generating DOT...', dotFile);
			
			let d = q.defer();
			fs.outputFile(
				dotFile, 
				template({
					components: deps
				}),
				(error) => {
					if(error) {
						d.reject(error);
					}
					logger.info('generating DOT...', 'done');
					d.resolve(dotFile);
				}
			);
			
			return d.promise;
		}
		
		private generateSVG() {
			let svgFile = `${ this.options.output.image }/${ this.options.name }.svg`;
			logger.info('generating SVG from DOT...', svgFile);
			
			let Viz = require('viz.js');
			let viz_svg = Viz(
				fs.readFileSync(`${ this.options.output.dot }/${ this.options.name }.dot`).toString(),
				{ 
					format: 'svg', 
					engine: 'dot' 
				});
				
			let d = q.defer();		
			fs.outputFile(
				svgFile, 
				viz_svg,
				(error) => {
					if(error) {
						d.reject(error);
					}
					logger.info('generating SVG from DOT...', 'done');
					d.resolve(svgFile);
				}
			);
			return d.promise;
		}
		
		private generateHTML() {
			let htmlFile = `${ this.options.output.html }/${ this.options.name }.html`;
			logger.info('generating HTML from SVG...', htmlFile);
			
			let svgContent = fs.readFileSync(`${ this.options.output.image }/${ this.options.name }.svg`).toString();
			//let html = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1">${ svg }</svg>`;
			let d = q.defer();		
			fs.outputFile(
				htmlFile, 
				svgContent,
				(error) => {
					if(error) {
						d.reject(error);
					}
					logger.info('generating HTML from SVG...', 'done');
					d.resolve(htmlFile);
				}
			);
			return d.promise;
		}
		
		private generatePNG() {
			let pngFile = `${ this.options.output.dot }/${ this.options.name }.png`;
			logger.info('generating PNG from SVG...', pngFile);
			
			let svg_to_png = require('svg-to-png');
			let d = q.defer();
			svg_to_png.convert(
				`${ this.options.output.image }/${ this.options.name }.svg`, 
				pngFile
			).then( function(){
				logger.info('generating PNG from SVG...', 'done');
				d.resolve(pngFile);
			});
			return d.promise;
		}
		
	}
	
}
