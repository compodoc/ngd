/// <reference path="../../../../typings/main.d.ts" />

import * as path from 'path';
import {logger} from '../../../logger';

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

	let appName = require('../../../../package.json').name;

	// http://www.graphviz.org/Documentation/dotguide.pdf
	export class Dot {

		// http://www.graphviz.org/doc/info/shapes.html
		template = `
digraph dependencies {
  node[shape="ellipse", style="filled", colorscheme={scheme}];
	splines=ortho;

	/* Graph orientation */
  rankdir=BT;

  {{~it.components :cmp}}
  subgraph "{{=cmp.name}}" {

    label="{{=cmp.file}}";

    "{{=cmp.name}}" [shape="component"];

    /* providers:start */

    {{~cmp.providers :provider}}
      "{{=provider.name}}" [fillcolor=1, shape="ellipse"];
      "{{=provider.name}}" -> "{{=cmp.name}}" /*[label="{{=cmp.file}}"]*/;
    {{~}}

    /* providers:end */

    /* directives:start */

    node[shape="cds", style="filled", color=5];
    {{~cmp.directives :directive}}
      "{{=directive.name}}" [];
      "{{=directive.name}}" -> "{{=cmp.name}}" /*[label="{{=cmp.file}}"]*/;
    {{~}}

    /* directives:end */

		/* templateUrl:start */

    node[shape="note", style="filled", color=7];
    {{~cmp.templateUrl :url}}
      "{{=url}}" [];
      "{{=cmp.name}}" -> "{{=url}}" [style=dotted];
    {{~}}

    /* templateUrl:end */

		/* styleUrls:start */

    node[shape="note", style="filled", color=8];
    {{~cmp.styleUrls :url}}
      "{{=url}}" [];
      "{{=cmp.name}}" -> "{{=url}}" [style=dotted];
    {{~}}

    /* styleUrls:end */

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
			json: null,
			png: null,
			svg: null,
			html: null,
            md: null
		};

		options: IOptions = {};

		constructor(options: IOptions) {

			let baseDir = `./${ appName }/`;

			this.options = {
				name: `${ appName }`,
				output: `${baseDir}/${ appName }`,
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
				html: path.join(this.cwd, `${ this.options.output }/dependencies.html`),
				md: path.join(this.cwd, `${ this.options.output }/dependencies.md`)
			};
		}

		generateGraph(deps) {
			let template = this.preprocessTemplates(this.options.dot);

			return this.generateDot(template, deps)
				.then( _ => this.generateJSON(deps) )
				.then( _ => this.generateSVG() )
				.then( _ => this.generateHTML() )
				.then( _ => this.generateMD() )
				//.then( _ => this.generatePNG() );
		}

		private preprocessTemplates(options?) {
			let doT = require('dot');
			this.template = this.template
					.replace(/\{scheme\}/g, options.colorScheme);
			return doT.template(this.template);
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
					logger.info('creating JSON', 'done');
					d.resolve(this.paths.json);
				}
			);
			return d.promise;
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

		private generateMD() {
			logger.info('creating MD', this.paths.md);

			let svgContent = fs.readFileSync(this.paths.svg).toString();
			let d = q.defer();
			fs.outputFile(
				this.paths.md,
				svgContent,
				(error) => {
					if(error) {
						d.reject(error);
					}
					logger.info('creating MD', 'done');
					d.resolve(this.paths.md);
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
