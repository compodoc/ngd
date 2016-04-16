/// <reference path="../../../typings/main.d.ts"/>
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import {Engine} from './engines/dot';
import {Crawler} from './crawlers/dependencies';
import {logger} from '../../logger';

let pkg = require('../../../package.json');
let program = require('commander');

export namespace Application {

  program
    .version(pkg.version)
      .option('-f, --file [file]', 'Entry *.ts file')
      .option('-t, --tsconfig [config]', 'A tsconfig.json', './tsconfig.json')
      .option('-l, --files [list]', 'A list of *.ts files')
      .option('-o, --open', 'Open the generated diagram file', true)
      .option('-d, --output [folder]', 'Where to store the generated files', `./documentation/${pkg.name}`)
      .parse(process.argv);

  let outputHelp = () => {
    program.outputHelp()
    process.exit(1);
  }

  export let run = () => {

    let files = [];
    if(program.file) {
      if(
        !fs.existsSync(program.file) ||
        !fs.existsSync(path.join(process.cwd(), program.file))
      ) {
        logger.fatal(`"${ program.file }" file wa not found`);
        process.exit(1);
      }
      else {
        files = [program.file];
      }
    }
    else if(program.tsconfig) {

      if(!fs.existsSync(program.tsconfig)) {
        logger.fatal('"tsconfig.json" file wa not found in the current directory');
        process.exit(1);
      }
      else {
        program.tsconfig = path.join(
          path.join(process.cwd(), path.dirname(program.tsconfig)),
          path.basename(program.tsconfig)
        );
        logger.info('using tsconfig', program.tsconfig);
        files = require(program.tsconfig).files;

        if(!files) {
          let exclude = [];
          exclude = require(program.tsconfig).exclude;

          var walk = function(dir) {
            var results = [];
            var list = fs.readdirSync(dir);
            list.forEach(function(file) {
              if (exclude.indexOf(file) < 0) {
                file = dir + '/' + file;
                var stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                  results = results.concat(walk(file));
                }
                else if (path.extname(file) === '.ts') {
                  results.push(file);
                }
              }
            });
            return results;
          };

          files = walk('.');
        }
      }

    }
    else if (program.files) {
      logger.info('using files', program.files.length, 'file(s) found');
      files = program.files;
    }
    else {
      outputHelp()
    }

    let crawler = new Crawler.Dependencies(
      files
    );

    let deps = crawler.getDependencies();

    if(deps.length <= 0) {
      logger.info('No dependencies found');
      process.exit(0);
    }

    let engine = new Engine.Dot({
      output: program.output
    });
    engine
      .generateGraph(deps)
      .then( file => {

        if (program.open === true) {
          logger.info('openning file ', file);
          let open = require("opener");
          open(file);
        }

      })
      .catch( e => logger.error(e) )
      .finally( _ => logger.info('done'))

  }
}
