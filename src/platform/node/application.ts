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
      .option('-p, --tsconfig [config]', 'A tsconfig.json (default: ./tsconfig.json)', './tsconfig.json')
      .option('-l, --files [list]', 'A list of *.ts files')
      .option('-o, --open', 'Open the generated HTML diagram file', false)
      .option('-d, --output [folder]', 'Where to store the generated files (default: ./documentation)', `./documentation/`)
      .parse(process.argv);

  let outputHelp = () => {
    program.outputHelp()
    process.exit(1);
  }

  export let run = () => {

    let files = [];
    if(program.file) {
      logger.info('using entry', program.file);
      if(
        !fs.existsSync(program.file) ||
        !fs.existsSync(path.join(process.cwd(), program.file))
      ) {
        logger.fatal(`"${ program.file }" file was not found`);
        process.exit(1);
      }
      else {
        files = [program.file];
      }
    }
    else if(program.tsconfig) {

      if(!fs.existsSync(program.tsconfig)) {
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

        if(!files) {
          let exclude = require(program.tsconfig).exclude || [];

          var walk = (dir) => {
            let results = [];
            let list = fs.readdirSync(dir);
            list.forEach( (file) => {
              if (exclude.indexOf(file) < 0) {
                file = path.join(dir, file);
                let stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                  results = results.concat(walk(file));
                }
                else if(/(spec|\.d)\.ts/.test(file)) {
                  logger.warn('ignoring', file);
                }
                else if (path.extname(file) === '.ts') {
                  logger.info('including', file);
                  results.push(file);
                }
              }
            });
            return results;
          };

          files = walk('.');
        }

        // normalize paths
        files = files.map( (file) => {
          return path.join(path.dirname(program.tsconfig), file);
        });
      }

    }
    else if (program.files) {
      logger.info('using files', program.files.length, 'file(s) found');
      files = program.files;
    }
    else {
      outputHelp()
    }

    // logger.info('including files', JSON.stringify(files));

    let crawler = new Crawler.Dependencies(
      files
    );

    let deps = crawler.getDependencies();

    if(deps.length <= 0) {
      logger.info('Could not figure out a dependencies graph. May be you should consider providing an entry file: ngd -f src/main.ts');
      logger.info('Done');
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
