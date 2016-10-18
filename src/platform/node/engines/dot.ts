import * as path from 'path';
import {logger} from '../../../logger';
import {DOT_TEMPLATE} from './dot.template';

interface IOptions {
	name?: string;
	output?: string;
	outputFormats?: string;
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

	let appName = require('../../../../package.json').name;

	// http://www.graphviz.org/Documentation/dotguide.pdf
	export class Dot {

		// http://www.graphviz.org/doc/info/shapes.html
		template = DOT_TEMPLATE;

		cwd = process.cwd();

		files = {
			component: null
		};

		paths = {
			dot: null,
			json: null,
			png: null,
			svg: null,
			html: null
		};

		options: IOptions = {};

		constructor(options: IOptions) {

			let baseDir = `./${ appName }/`;

			this.options = {
				name: `${ appName }`,
				output: `${baseDir}/${ appName }`,
				outputFormats: options.outputFormats,
				dot: {
					shapeModules: 'component',
					shapeProviders: 'ellipse',
					shapeDirectives: 'cds',

					//http://www.graphviz.org/doc/info/colors.html
					colorScheme: 'set312'
				}
			};

			if(options.output) {

				if(typeof this.options.output !== 'string') {
					logger.fatal('Option "output" has been provided but it is not a valid name.');
					process.exit(1);
				}

				this.options.output = options.output;
			}

			this.paths = {
				dot: path.join(this.cwd, `${ this.options.output }/dependencies.dot`),
				json: path.join(this.cwd, `${ this.options.output }/dependencies.json`),
				svg: path.join(this.cwd, `${ this.options.output }/dependencies.svg`),
				png: path.join(this.cwd, `${ this.options.output }/dependencies.png`),
				html: path.join(this.cwd, `${ this.options.output }/dependencies.html`)
			};
		}

		generateGraph(deps) {
			let template = this.preprocessTemplates(this.options.dot),
				generators = [];

			for (let entry of this.options.outputFormats) {
			    switch (entry) {
					case 'html':
						generators.push(this.generateHTML())
						break;
					case 'svg':
						generators.push(this.generateSVG())
						break;
					case 'json':
						generators.push(this.generateJSON(deps))
						break;
					case 'png':
						generators.push(this.generatePNG())
						break;
					case 'dot':
						generators.push(this.generateDot(template, deps))
						break;
				}
			}

			return q.all(generators);
		}

		private preprocessTemplates(options?) {
			let doT = require('dot');
			return doT.template(this.template.replace(/###scheme###/g, options.colorScheme));
		}

		private generateJSON(deps) {
			let d = q.defer();
			fs.outputFile(
				this.paths.json,
				JSON.stringify(deps, null, 2),
				(error) => {
					if(error) {
						d.reject(error);
					}
					logger.info('creating JSON', this.paths.json);
					d.resolve(this.paths.json);
				}
			);
			return d.promise;
		}

		private generateDot(template, deps) {
			let d = q.defer();
			fs.outputFile(
				this.paths.dot,
				template({
					modules: deps
				}),
				(error) => {
					if(error) {
						d.reject(error);
					}
					logger.info('creating DOT', this.paths.dot);
					d.resolve(this.paths.dot);
				}
			);

			return d.promise;
		}

		private generateSVG() {
			let Viz = require('viz.js');
			let viz_svg = Viz(
				fs.readFileSync(this.paths.dot).toString(), {
					format: 'svg',
					engine: 'dot'
				});

			let d = q.defer();
			fs.outputFile(
				this.paths.svg,
				viz_svg,
				(error) => {
					if(error) {
						d.reject(error);
					}
					logger.info('creating SVG', this.paths.svg);
					d.resolve(this.paths.svg);
				}
			);
			return d.promise;
		}

		private generateHTML() {
			let svgContent = fs.readFileSync(this.paths.svg).toString();
			let cssContent = `
			<style>
				.edge {
					transition: opacity 0.5s;
					opacity:0.2;
				}
				.node {
					transition: transform 0.1s;
					transform-origin: center center;
				}
				.node:hover {
					transform: scale(1.03);
				}
				.node:hover + .edge {
					opacity:1;
				}
			</style>`;
			let htmlContent = `
				${svgContent}
			`;
			let d = q.defer();
			fs.outputFile(
				this.paths.html,
				htmlContent,
				(error) => {
					if(error) {
						d.reject(error);
					}
					logger.info('creating HTML', this.paths.html);
					d.resolve(this.paths.html);
				}
			);
			return d.promise;
		}

		private generatePNG() {
			let svg_to_png = require('svg-to-png');
			let d = q.defer();
			svg_to_png.convert(
				this.paths.svg,
				path.join(this.cwd, `${ this.options.output }`)
			).then( function(){
				logger.info('creating PNG', this.paths.png);
				d.resolve(this.paths.image);
			});
			return d.promise;
		}

	}

}
