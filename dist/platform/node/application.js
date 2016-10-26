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
        .option('-f, --file [file]', 'Entry *.ts file')
        .option('-p, --tsconfig [config]', 'A tsconfig.json (default: ./tsconfig.json)', './tsconfig.json')
        .option('-l, --files [list]', 'A list of *.ts files')
        .option('-o, --open', 'Open the generated HTML diagram file', false)
        .option('-g, --display-legend [display-legend]', 'Display the legend of graph default(true)', true)
        .option('-s, --silent', 'In silent mode, log messages aren\'t logged in the console', false)
        .option('-d, --output [folder]', 'Where to store the generated files (default: ./documentation)', "./documentation/")
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
            logger_1.logger.info('using entry', program.file);
            if (!fs.existsSync(program.file) ||
                !fs.existsSync(path.join(process.cwd(), program.file))) {
                logger_1.logger.fatal("\"" + program.file + "\" file was not found");
                process.exit(1);
            }
            else {
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
                                    logger_1.logger.warn('ignoring', file);
                                }
                                else if (path.extname(file) === '.ts') {
                                    logger_1.logger.info('including', file);
                                    results.push(file);
                                }
                            }
                        });
                        return results;
                    };
                    files = walk('.');
                }
                // normalize paths
                files = files.map(function (file) {
                    return path.join(path.dirname(program.tsconfig), file);
                });
            }
        }
        else if (program.files) {
            logger_1.logger.info('using files', program.files.length, 'file(s) found');
            files = program.files;
        }
        else {
            outputHelp();
        }
        // logger.info('including files', JSON.stringify(files));
        var crawler = new dependencies_1.Crawler.Dependencies(files);
        var deps = crawler.getDependencies();
        if (deps.length <= 0) {
            logger_1.logger.info('Could not figure out a dependencies graph. May be you should consider providing an entry file: ngd -f src/main.ts');
            logger_1.logger.info('Done');
            process.exit(0);
        }
        var engine = new dot_1.Engine.Dot({
            output: program.output,
            displayLegend: program.displayLegend
        });
        engine
            .generateGraph(deps)
            .then(function (file) {
            if (program.open === true) {
                logger_1.logger.info('openning file ', file);
                var open_1 = require("opener");
                open_1(file);
            }
        })
            .catch(function (e) { return logger_1.logger.error(e); })
            .finally(function (_) { return logger_1.logger.info('done'); });
    };
})(Application = exports.Application || (exports.Application = {}));
