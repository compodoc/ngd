import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { Engine } from './engines/dot';
import { Crawler } from './compiler/walker';
import { logger } from '../../logger';

let pkg = require('../../../package.json');
let program = require('commander');
let cwd = process.cwd();

export namespace Application {

  program
    .version(pkg.version)
    .option('-f, --file <file>', 'Entry *.ts file')
    .option('-p, --tsconfig <config>', 'A tsconfig.json (default: ./tsconfig.json)', './tsconfig.json')
    .option('-o, --open', 'Open the generated HTML diagram file', false)
    .option('-g, --display-legend <display-legend>', 'Display the legend of graph default(true)', true)
    .option('-s, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
    .option('-t, --output-formats <output-formats>', 'Output formats (default: html,svg,dot,json)', `html,svg,dot,json`)
    .option('-d, --output <folder>', 'Where to store the generated files (default: ./documentation)', `./documentation/`)
    .parse(process.argv);

  let outputHelp = () => {
    program.outputHelp()
    process.exit(1);
  }

  export let run = () => {

    if (program.silent) {
      logger.silent = false;
    }

    let files = [];
    if (program.file) {
      if (
        !fs.existsSync(program.file) ||
        !fs.existsSync(path.join(process.cwd(), program.file))
      ) {
        logger.fatal(`"${program.file}" file was not found`);
        process.exit(1);
      }
      else if (path.extname(program.file) !== '.ts') {
        logger.fatal(`"${program.file}" is not a TypeScript file`);
        process.exit(1);
      }
      else {
        logger.info('using entry', program.file);

        files = [program.file];
      }
    }
    else if (program.tsconfig) {

      if (!fs.existsSync(program.tsconfig)) {
        logger.fatal('"tsconfig.json" file was not found in the current directory');
        process.exit(1);
      }
      else {
        program.tsconfig = path.join(
          path.join(process.cwd(), path.dirname(program.tsconfig)),
          path.basename(program.tsconfig)
        );
        logger.info('using tsconfig', program.tsconfig);
        files = require(program.tsconfig).files;

        // use the current directory of tsconfig.json as a working directory
        cwd = program.tsconfig.split(path.sep).slice(0, -1).join(path.sep);

        if (!files) {
          let exclude = require(program.tsconfig).exclude || [];

          var walk = (dir) => {
            let results = [];
            let list = fs.readdirSync(dir);
            list.forEach((file) => {
              if (exclude.indexOf(file) < 0) {
                file = path.join(dir, file);
                let stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                  results = results.concat(walk(file));
                }
                else if (/(spec|\.d)\.ts/.test(file)) {
                  logger.debug('ignoring', file);
                }
                else if (path.extname(file) === '.ts') {
                  logger.debug('including', file);
                  results.push(file);
                }
              }
            });
            return results;
          };

          files = walk( cwd || '.' );
        }

      }

    }
    else {
      outputHelp()
    }

    if (path.isAbsolute(program.output)) {
      program.output = program.output;
    }
    else {
      program.output = path.resolve(process.cwd(), program.output);
    }

    let crawler = new Crawler.Dependencies(
      files, {
        tsconfigDirectory: cwd
      }
    );

    let deps = crawler.getDependencies();

    if (deps.length <= 0) {
      logger.warn('no deps', 'May be you should consider providing another entry file. See -h');
      logger.info('Done');
      process.exit(0);
    }

    let engine = new Engine.Dot({
      output: program.output,
      displayLegend: program.displayLegend,
      outputFormats: program.outputFormats.split(',')
    });
    engine
      .generateGraph(deps)
      .then(file => {

        /*
        if (program.open === true) {
          logger.info('openning file ', file);
          let open = require("opener");
          open(file);
        }
        */

      })
      .catch(e => logger.error(e))
      .finally(_ => logger.info('done'))

  }
}
