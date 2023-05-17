import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { DotEngine } from '@compodoc/ngd-transformer';
import { Compiler } from '@compodoc/ngd-compiler';
import { logger } from '@compodoc/ngd-core';

let pkg = require('../package.json');
let program = require('commander');
let cwd = process.cwd();

export namespace Application {
    program
        .version(pkg.version)
        .option('-f, --file <file>', 'Entry *.ts file')
        .option('-p, --tsconfig <config>', 'A tsconfig.json (default: ./tsconfig.json)', './tsconfig.json')
        .option('-o, --open', 'Open the generated HTML diagram file', false)
        .option('-g, --display-legend <display-legend>', 'Display the legend of graph default(true)', true)
        .option('-s, --silent', "In silent mode, log messages aren't logged in the console", false)
        .option('-t, --output-formats <output-formats>', 'Output formats (default: html,svg,dot,json)', `html,svg,dot,json`)
        .option('-d, --output <folder>', 'Where to store the generated files (default: ./documentation)', `./documentation/`)
        .parse(process.argv);

    let outputHelp = () => {
        program.outputHelp();
        process.exit(0);
    };

    export let run = () => {
        program.silent = program.silent || false;
        logger.setVerbose(program.silent);

        const options = program.opts();

        let output = '';

        let files = [];
        if (options.file) {
            if (!fs.existsSync(options.file) || !fs.existsSync(path.join(process.cwd(), options.file))) {
                logger.fatal(`"${options.file}" file was not found`);
                process.exit(1);
            } else if (path.extname(options.file) !== '.ts') {
                logger.fatal(`"${options.file}" is not a TypeScript file`);
                process.exit(1);
            } else {
                logger.info('using entry', options.file);

                files = [options.file];
            }
        } else if (options.tsconfig) {
            if (!fs.existsSync(options.tsconfig)) {
                logger.fatal('"tsconfig.json" file was not found in the current directory');
                process.exit(1);
            } else {
                options.tsconfig = path.join(path.join(process.cwd(), path.dirname(options.tsconfig)), path.basename(options.tsconfig));
                logger.info('using tsconfig', options.tsconfig);
                files = require(options.tsconfig).files;

                // use the current directory of tsconfig.json as a working directory
                cwd = options.tsconfig.split(path.sep).slice(0, -1).join(path.sep);

                if (!files) {
                    let exclude = require(options.tsconfig).exclude || [];

                    const walk = (dir) => {
                        let results = [];
                        let list = fs.readdirSync(dir);
                        list.forEach((file) => {
                            if (exclude.indexOf(file) < 0) {
                                file = path.join(dir, file);
                                let stat = fs.statSync(file);
                                if (stat && stat.isDirectory()) {
                                    results = results.concat(walk(file));
                                } else if (/(spec|\.d)\.ts/.test(file)) {
                                    logger.debug('ignoring', file);
                                } else if (path.extname(file) === '.ts') {
                                    logger.debug('including', file);
                                    results.push(file);
                                }
                            }
                        });
                        return results;
                    };

                    files = walk(cwd || '.');
                }
            }
        } else {
            outputHelp();
        }

        if (path.isAbsolute(options.output)) {
            output = options.output;
        } else {
            output = path.resolve(process.cwd(), options.output);
        }

        let compiler = new Compiler(files, {
            tsconfigDirectory: cwd,
            silent: program.silent,
        });

        let deps = compiler.getDependencies();

        if (deps.length <= 0) {
            logger.warn('no deps', 'May be you should consider providing another entry file. See -h');
            logger.info('Done');
            process.exit(0);
        }

        let engine = new DotEngine({
            output: output,
            displayLegend: options.displayLegend,
            outputFormats: options.outputFormats.split(','),
        });
        engine
            .generateGraph(deps)
            .then((file) => {
                /*
        if (options.open === true) {
          logger.info('openning file ', file);
          let open = require("opener");
          open(file);
        }
        */
            })
            .catch((e) => logger.error(e))
            .then((_) => logger.info('done'));
    };
}
