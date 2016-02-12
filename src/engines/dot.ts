/// <reference path="../../typings/tsd.d.ts" />

import * as path from 'path';
import {logger} from '../logger';

interface IOptions {
	name?: string;
	output?: string;
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

		// http://www.graphviz.org/doc/info/shapes.html
		template = `
digraph dependencies {
  node[shape="ellipse", style="filled", colorscheme={scheme}];

  rankdir=TB;
  {{~it.components :cmp}}
  subgraph {{=cmp.name}} {

    label="{{=cmp.file}}";

    "{{=cmp.name}}" [shape="component"];

    /* providers:start */

    {{~cmp.providers :provider}}
      "{{=provider}}" [label="{{=provider}}", fillcolor=1, shape="ellipse"];
      "{{=cmp.name}}" -> "{{=provider}}";
    {{~}}

    /* providers:end */

    /* directives:start */

    node[shape="cds", style="filled", color=5];
    {{~cmp.directives :directive}}
      "{{=directive}}" [];
      "{{=cmp.name}}" -> "{{=directive}}";
    {{~}}

    /* directives:end */

		/* templateUrl:start */

    node[shape="note", style="filled", color=7];
    {{~cmp.templateUrl :url}}
      "{{=url}}" [];
      "{{=cmp.name}}" -> "{{=url}}";
    {{~}}

    /* templateUrl:end */

  }
  {{~}}

}
		`;

		cwd = process.cwd();

		files = {
			component: null
		};

		paths = {
			dot: null,
			png: null,
			svg: null,
			html: null
		};

		options: IOptions = {};

		constructor(options: IOptions) {

			this.options = {
				name: `${ appName }`,
				output: `/samples/${ appName }`,
				dot: {
					shapeModules: 'component',
					shapeProviders: 'ellipse',
					shapeDirectives: 'cds',

					//http://www.graphviz.org/doc/info/colors.html
					colorScheme: 'set312'
				}
			};

			if(options.output) {

				if(!this.options.output) {
					logger.fatal('Option "output" has been provided but the "dot" folder was not specified');
					process.exit(1);
				}
				else if(!this.options.output) {
					logger.fatal('Option "output" has been provided but the "image" folder was not specified');
					process.exit(1);
				}
				else if(!this.options.output) {
					logger.fatal('Option "output" has been provided but the "html" folder was not specified');
					process.exit(1);
				}

				this.options.output = options.output;
			}

			this.paths = {
				dot: path.join(this.cwd, `${ this.options.output }/${ this.options.name }.dot`),
				svg: path.join(this.cwd, `${ this.options.output }/${ this.options.name }.svg`),
				png: path.join(this.cwd, `${ this.options.output }/${ this.options.name }.png`),
				html: path.join(this.cwd, `${ this.options.output }/${ this.options.name }.html`)
			};
			this.createOutputFolders(this.options.output);
		}

		generateGraph(deps) {
			let template = this.preprocessTemplates(this.options.dot);

			return this.generateDot(template, deps)
				.then( _ => this.generateSVG() )
				.then( _ => this.generateHTML() )
				//.then( _ => this.generatePNG() );
		}

		private createOutputFolders(output) {
			Object.keys(output).forEach( (prop) => {
				return fs.mkdirpSync(path.join(this.cwd, `../../${ output[prop] }`));
			});
		}

		private preprocessTemplates(options?) {
			let doT = require('dot');
			this.template = this.template
					.replace(/\{1\}/g, options.shapeModules)
					.replace(/\{2\}/g, options.shapeProviders)
					.replace(/\{3\}/g, options.shapeDirectives)
					.replace(/\{scheme\}/g, options.colorScheme);
			return doT.template(this.template);
		}

		private generateDot(template, deps) {
			logger.info('creating DOT', this.paths.dot);

			let d = q.defer();
			fs.outputFile(
				this.paths.dot,
				template({
					components: deps
				}),
				(error) => {
					if(error) {
						d.reject(error);
					}
					logger.info('creating DOT', 'done');
					d.resolve(this.paths.dot);
				}
			);

			return d.promise;
		}

		private generateSVG() {
			logger.info('creating SVG', this.paths.svg);

			let Viz = require('viz.js');
			let viz_svg = Viz(
				fs.readFileSync(this.paths.dot).toString(),
				{
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
					logger.info('creating SVG', 'done');
					d.resolve(this.paths.svg);
				}
			);
			return d.promise;
		}

		private generateHTML() {
			logger.info('creating HTML', this.paths.html);

			let svgContent = fs.readFileSync(this.paths.svg).toString();
			let d = q.defer();
			fs.outputFile(
				this.paths.html,
				svgContent,
				(error) => {
					if(error) {
						d.reject(error);
					}
					logger.info('creating HTML', 'done');
					d.resolve(this.paths.html);
				}
			);
			return d.promise;
		}

		private generatePNG() {
			logger.info('creating PNG', this.paths.png);

			let svg_to_png = require('svg-to-png');
			let d = q.defer();
			svg_to_png.convert(
				this.paths.svg,
				path.join(this.cwd, `${ this.options.output }`)
			).then( function(){
				logger.info('creating PNG', 'done');
				d.resolve(this.paths.image);
			});
			return d.promise;
		}

	}

}
