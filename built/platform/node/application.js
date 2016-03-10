"use strict";
var fs = require('fs');
var path = require('path');
var dot_1 = require('../../engines/dot');
var dependencies_1 = require('../../crawlers/dependencies');
var logger_1 = require('../../logger');
var pkg = require('../../../package.json');
var program = require('commander');
var Application;
(function (Application) {
    program
        .version(pkg.version)
        .option('-f, --file [file]', 'Entry *.ts file')
        .option('-t, --tsconfig [config]', 'A tsconfig.json', './tsconfig.json')
        .option('-l, --files [list]', 'A list of *.ts files')
        .option('-o, --open', 'Open the generated diagram file', true)
        .option('-d, --output [folder]', 'Where to store the generated files', "./documentation/" + pkg.name)
        .parse(process.argv);
    var outputHelp = function () {
        program.outputHelp();
        process.exit(1);
    };
    Application.run = function () {
        var files = [];
        if (program.file) {
            if (!fs.existsSync(program.file) ||
                !fs.existsSync(path.join(process.cwd(), program.file))) {
                logger_1.logger.fatal("\"" + program.file + "\" file wa not found");
                process.exit(1);
            }
            else {
                files = [program.file];
            }
        }
        else if (program.tsconfig) {
            if (!fs.existsSync(program.tsconfig)) {
                logger_1.logger.fatal('"tsconfig.json" file wa not found in the current directory');
                process.exit(1);
            }
            else {
                program.tsconfig = path.join(path.join(process.cwd(), path.dirname(program.tsconfig)), path.basename(program.tsconfig));
                logger_1.logger.info('using tsconfig', program.tsconfig);
                files = require(program.tsconfig).files;
                if (!files) {
                    logger_1.logger.fatal('"tsconfig.json" file does not export a "files" attriute');
                    process.exit(1);
                }
            }
        }
        else if (program.files) {
            logger_1.logger.info('using files', program.files.length, 'file(s) found');
            files = program.files;
        }
        else {
            outputHelp();
        }
        var crawler = new dependencies_1.Crawler.Dependencies(files);
        var deps = crawler.getDependencies();
        if (deps.length <= 0) {
            logger_1.logger.info('No dependencies found');
            process.exit(0);
        }
        var engine = new dot_1.Engine.Dot({
            output: program.output
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
