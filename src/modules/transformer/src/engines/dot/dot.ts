import * as path from 'path';
import { logger } from '@compodoc/ngd-core';
import { DOT_TEMPLATE, LEGEND } from './dot.template';

export interface IOptions {
	name?: string;
	output?: string;
	displayLegend?: boolean;
	outputFormats?: string;
	dot?: {
		shapeModules: string
		shapeProviders: string
		shapeDirectives: string
		colorScheme: string
	};
}

let fs = require('fs-extra');
let q = require('q');
let Viz = require('viz.js');
let cleanDot: boolean = false;
let cleanSvg: boolean = false;

let appName = require('../../../package.json').name;

// http://www.graphviz.org/Documentation/dotguide.pdf
export class DotEngine {

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

    let baseDir = `./${appName}/`;

    this.options = {
      name: `${appName}`,
      output: options.output,
      displayLegend: options.displayLegend,
      outputFormats: options.outputFormats,
      dot: {
        shapeModules: 'component',
        shapeProviders: 'ellipse',
        shapeDirectives: 'cds',

        //http://www.graphviz.org/doc/info/colors.html
        colorScheme: 'set312'
      }
    };

    if (options.output) {

      if (typeof this.options.output !== 'string') {
        logger.fatal('Option "output" has been provided but it is not a valid name.');
        process.exit(1);
      }
    }

    this.paths = {
      dot: path.join(this.options.output, '/dependencies.dot'),
      json: path.join(this.options.output, '/dependencies.json'),
      svg: path.join(this.options.output, '/dependencies.svg'),
      png: path.join(this.options.output, '/dependencies.png'),
      html: path.join(this.options.output, '/dependencies.html')
    };
  }

  generateGraph(deps) {
    let template = this.preprocessTemplates(this.options);
    let generators = [];

    // Handle svg dependency with dot, and html with svg
    if (this.options.outputFormats.indexOf('dot') > -1 && this.options.outputFormats.indexOf('svg') === -1 && this.options.outputFormats.indexOf('html') === -1) {
      generators.push(this.generateDot(template, deps));
    }

    if (this.options.outputFormats.indexOf('svg') > -1 && this.options.outputFormats.indexOf('html') === -1) {
      generators.push(this.generateDot(template, deps).then(_ => this.generateSVG()));
      if (this.options.outputFormats.indexOf('svg') > -1 && this.options.outputFormats.indexOf('dot') === -1) {
        cleanDot = true;
      }
    }

    if (this.options.outputFormats.indexOf('json') > -1) {
      generators.push(this.generateJSON(deps));
    }

    if (this.options.outputFormats.indexOf('html') > -1) {
      generators.push(this.generateDot(template, deps).then(_ => this.generateSVG()).then(_ => this.generateHTML()));
      if (this.options.outputFormats.indexOf('html') > -1 && this.options.outputFormats.indexOf('svg') === -1) {
        cleanSvg = true;
      }
      if (this.options.outputFormats.indexOf('html') > -1 && this.options.outputFormats.indexOf('dot') === -1) {
        cleanDot = true;
      }
    }



    // todo(WCH): disable PNG creation due to some errors with phantomjs
    /*
     if (this.options.outputFormats.indexOf('png') > -1) {
     generators.push(this.generatePNG());
     }
     */

    return q.all(generators).then(_ => this.cleanGeneratedFiles());
  }

  private cleanGeneratedFiles() {
    let d = q.defer();
    let removeFile = (path) => {
      let p = q.defer();
      fs.unlink(path, (error) => {
        if (error) {
          p.reject(error);
        } else {
          p.resolve();
        }
      });
      return p.promise;
    };
    let cleaners = [];
    if (cleanDot) {
      cleaners.push(removeFile(this.paths.dot));
    }
    if (cleanSvg) {
      cleaners.push(removeFile(this.paths.svg));
    }
    return q.all(cleaners);
  }

  private preprocessTemplates(options?) {
    let doT = require('dot');
    let result;
    if (options.displayLegend === 'true' || options.displayLegend === true) {
      result = this.template.replace(/###legend###/g, LEGEND);
    } else {
      result = this.template.replace(/###legend###/g, '""');
    }
    return doT.template(result.replace(/###scheme###/g, options.dot.colorScheme));
  }

  private generateJSON(deps) {
    let d = q.defer();
    fs.outputFile(
      this.paths.json,
      JSON.stringify(deps, null, 2),
      (error) => {
        if (error) {
          d.reject(error);
        }
        logger.info('creating JSON', this.paths.json);
        d.resolve(this.paths.json);
      }
    );
    return d.promise;
  }

  // @not-used
  private escape(deps) {
    return deps.map(d => {
      for (let prop in d) {
        if (d.hasOwnProperty(prop)) {
          let a = d[prop];
          console.log(a);

          if (Array.isArray(a)) {
            return this.escape(a);
          }
          else if (typeof a === 'string') {
            a = a.replace(/"/g, '\"');
            a = a.replace(/'/g, "\'");
            a = a.replace(/\{/g, "\{");
            a = a.replace(/\)/g, "\)");
          }
        }
      }

      return d;
    });
  }

  private generateDot(template, deps) {

    // todo(wch)
    //deps = this.escape(deps);

    let d = q.defer();
    fs.outputFile(
      this.paths.dot,
      template({
        modules: deps
      }),
      (error) => {
        if (error) {
          d.reject(error);
        }

        if (cleanDot === false) {
          logger.info('creating DOT', this.paths.dot);
        }

        d.resolve(this.paths.dot);
      }
    );

    return d.promise;
  }

  private generateSVG() {
    let vizSvg = Viz(
      fs.readFileSync(this.paths.dot).toString(), {
        format: 'svg',
        engine: 'dot'
      });

    let d = q.defer();
    fs.outputFile(
      this.paths.svg,
      vizSvg,
      (error) => {
        if (error) {
          d.reject(error);
        }

        if (cleanSvg === false) {
          logger.info('creating SVG', this.paths.svg);
        }

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
        if (error) {
          d.reject(error);
        }
        logger.info('creating HTML', this.paths.html);
        d.resolve(this.paths.html);
      }
    );
    return d.promise;
  }

  private generatePNG() {
    let svgToPng = require('svg-to-png');
    let d = q.defer();
    svgToPng.convert(
      this.paths.svg,
      this.paths.png
    ).then(function () {
      logger.info('creating PNG', this.paths.png);
      d.resolve(this.paths.image);
    });
    return d.promise;
  }

}
