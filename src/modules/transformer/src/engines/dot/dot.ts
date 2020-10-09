import * as path from 'path';
import { logger } from '@compodoc/ngd-core';
import { DOT_TEMPLATE, LEGEND } from './dot.template';

export interface IOptions {
    name?: string;
    output?: string;
    displayLegend?: boolean;
    outputFormats?: string;
    silent?: boolean;
    dot?: {
        shapeModules: string;
        shapeProviders: string;
        shapeDirectives: string;
        colorScheme: string;
    };
}

let fs = require('fs-extra');

let cleanDot: boolean = false;
let cleanSvg: boolean = false;

let appName = require('../../../package.json').name;

// http://www.graphviz.org/Documentation/dotguide.pdf
export class DotEngine {
    // http://www.graphviz.org/doc/info/shapes.html
    template = DOT_TEMPLATE;

    cwd = process.cwd();

    files = {
        component: null,
    };

    paths = {
        dot: null,
        json: null,
        png: null,
        svg: null,
        html: null,
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
                colorScheme: 'set312',
            },
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
            html: path.join(this.options.output, '/dependencies.html'),
        };

        if (typeof options.silent !== 'undefined') {
            logger.silent = options.silent;
        }
    }

    updateOutput(output: string) {
        this.paths = {
            dot: path.join(output, '/dependencies.dot'),
            json: path.join(output, '/dependencies.json'),
            svg: path.join(output, '/dependencies.svg'),
            png: path.join(output, '/dependencies.png'),
            html: path.join(output, '/dependencies.html'),
        };
    }

    generateGraph(deps) {
        let template = this.preprocessTemplates(this.options);
        let generators = [];

        // Handle svg dependency with dot, and html with svg
        if (
            this.options.outputFormats.indexOf('dot') > -1 &&
            this.options.outputFormats.indexOf('svg') === -1 &&
            this.options.outputFormats.indexOf('html') === -1
        ) {
            generators.push(this.generateDot(template, deps));
        }

        if (this.options.outputFormats.indexOf('svg') > -1 && this.options.outputFormats.indexOf('html') === -1) {
            generators.push(this.generateDot(template, deps).then((_) => this.generateSVG()));
            if (this.options.outputFormats.indexOf('svg') > -1 && this.options.outputFormats.indexOf('dot') === -1) {
                cleanDot = true;
            }
        }

        if (this.options.outputFormats.indexOf('json') > -1) {
            generators.push(this.generateJSON(deps));
        }

        if (this.options.outputFormats.indexOf('html') > -1) {
            generators.push(
                this.generateDot(template, deps)
                    .then((_) => this.generateSVG())
                    .then((_) => this.generateHTML())
            );
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

        return Promise.all(generators).then((_) => this.cleanGeneratedFiles());
    }

    private cleanGeneratedFiles() {
        let removeFile = (path) => {
            return new Promise((resolve, reject) => {
                fs.unlink(path, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        };
        let cleaners = [];
        if (cleanDot) {
            cleaners.push(removeFile(this.paths.dot));
        }
        if (cleanSvg) {
            cleaners.push(removeFile(this.paths.svg));
        }
        return Promise.all(cleaners);
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
        return new Promise((resolve, reject) => {
            fs.outputFile(this.paths.json, JSON.stringify(deps, null, 2), (error) => {
                if (error) {
                    reject(error);
                }
                logger.info('creating JSON', this.paths.json);
                resolve(this.paths.json);
            });
        });
    }

    // @not-used
    private escape(deps) {
        return deps.map((d) => {
            for (let prop in d) {
                if (d.hasOwnProperty(prop)) {
                    let a = d[prop];
                    console.log(a);

                    if (Array.isArray(a)) {
                        return this.escape(a);
                    } else if (typeof a === 'string') {
                        a = a.replace(/"/g, '"');
                        a = a.replace(/'/g, "'");
                        a = a.replace(/\{/g, '{');
                        a = a.replace(/\)/g, ')');
                    }
                }
            }

            return d;
        });
    }

    private generateDot(template, deps) {
        // todo(wch)
        //deps = this.escape(deps);

        return new Promise((resolve, reject) => {
            fs.outputFile(
                this.paths.dot,
                template({
                    modules: deps,
                }),
                (error) => {
                    if (error) {
                        reject(error);
                    }

                    if (cleanDot === false) {
                        logger.info('creating DOT', this.paths.dot);
                    }

                    resolve(this.paths.dot);
                }
            );
        });
    }

    private generateSVG() {
        const vizRenderStringSync = require('@aduh95/viz.js/sync');
        let vizSvg = vizRenderStringSync(fs.readFileSync(this.paths.dot).toString());
        return new Promise((resolve, reject) => {
            fs.outputFile(this.paths.svg, vizSvg, (error) => {
                if (error) {
                    reject(error);
                }

                if (cleanSvg === false) {
                    logger.info('creating SVG', this.paths.svg);
                }

                resolve(this.paths.svg);
            });
        });
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
        return new Promise((resolve, reject) => {
            fs.outputFile(this.paths.html, htmlContent, (error) => {
                if (error) {
                    reject(error);
                }
                logger.info('creating HTML', this.paths.html);
                resolve(this.paths.html);
            });
        });
    }

    private generatePNG() {
        let svgToPng = require('svg-to-png');
        return new Promise((resolve, reject) => {
            svgToPng.convert(this.paths.svg, this.paths.png).then(function () {
                logger.info('creating PNG', this.paths.png);
                resolve(this.paths.image);
            });
        });
    }
}
