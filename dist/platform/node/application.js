"use strict";
var fs = require('fs');
var path = require('path');
var dot_1 = require('./engines/dot');
var dependencies_1 = require('./crawlers/dependencies');
var logger_1 = require('../../logger');
var pkg = require('../../../package.json');
var program = require('commander');
var Application;
(function (Application) {
    program
        .version(pkg.version)
        .option('-f, --file <file>', 'Entry *.ts file')
        .option('-p, --tsconfig <config>', 'A tsconfig.json (default: ./tsconfig.json)', './tsconfig.json')
        .option('-o, --open', 'Open the generated HTML diagram file', false)
        .option('-g, --display-legend <display-legend>', 'Display the legend of graph default(true)', true)
        .option('-s, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
        .option('-t, --output-formats <output-formats>', 'Output formats (default: html,svg,dot,json)', "html,svg,dot,json")
        .option('-d, --output <folder>', 'Where to store the generated files (default: ./documentation)', "./documentation/")
        .parse(process.argv);
    var outputHelp = function () {
        program.outputHelp();
        process.exit(1);
    };
    Application.run = function () {
        if (program.silent) {
            logger_1.logger.silent = false;
        }
        var files = [];
        if (program.file) {
            if (!fs.existsSync(program.file) ||
                !fs.existsSync(path.join(process.cwd(), program.file))) {
                logger_1.logger.fatal("\"" + program.file + "\" file was not found");
                process.exit(1);
            }
            else if (path.extname(program.file) !== '.ts') {
                logger_1.logger.fatal("\"" + program.file + "\" is not a TypeScript file");
                process.exit(1);
            }
            else {
                logger_1.logger.info('using entry', program.file);
                files = [program.file];
            }
        }
        else if (program.tsconfig) {
            if (!fs.existsSync(program.tsconfig)) {
                logger_1.logger.fatal('"tsconfig.json" file was not found in the current directory');
                process.exit(1);
            }
            else {
                program.tsconfig = path.join(path.join(process.cwd(), path.dirname(program.tsconfig)), path.basename(program.tsconfig));
                logger_1.logger.info('using tsconfig', program.tsconfig);
                files = require(program.tsconfig).files;
                if (!files) {
                    var exclude_1 = require(program.tsconfig).exclude || [];
                    var walk = function (dir) {
                        var results = [];
                        var list = fs.readdirSync(dir);
                        list.forEach(function (file) {
                            if (exclude_1.indexOf(file) < 0) {
                                file = path.join(dir, file);
                                var stat = fs.statSync(file);
                                if (stat && stat.isDirectory()) {
                                    results = results.concat(walk(file));
                                }
                                else if (/(spec|\.d)\.ts/.test(file)) {
                                    logger_1.logger.debug('ignoring', file);
                                }
                                else if (path.extname(file) === '.ts') {
                                    logger_1.logger.debug('including', file);
                                    results.push(file);
                                }
                            }
                        });
                        return results;
                    };
                    var cwd = program.tsconfig.replace('/tsconfig.json', '');
                    files = walk(cwd || '.');
                }
            }
        }
        else {
            outputHelp();
        }
        // logger.info('including files', JSON.stringify(files));
        var crawler = new dependencies_1.Crawler.Dependencies(files);
        var deps = crawler.getDependencies();
        if (deps.length <= 0) {
            logger_1.logger.warn('no deps', 'May be you should consider providing another entry file. See -h');
            logger_1.logger.info('Done');
            process.exit(0);
        }
        var engine = new dot_1.Engine.Dot({
            output: program.output,
            displayLegend: program.displayLegend,
            outputFormats: program.outputFormats.split(',')
        });
        engine
            .generateGraph(deps)
            .then(function (file) {
            /*
            if (program.open === true) {
              logger.info('openning file ', file);
              let open = require("opener");
              open(file);
            }
            */
        })
            .catch(function (e) { return logger_1.logger.error(e); })
            .finally(function (_) { return logger_1.logger.info('done'); });
    };
})(Application = exports.Application || (exports.Application = {}));
