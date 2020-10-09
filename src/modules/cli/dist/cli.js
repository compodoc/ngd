"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
var fs = require("fs");
var path = require("path");
var ngd_transformer_1 = require("@compodoc/ngd-transformer");
var ngd_compiler_1 = require("@compodoc/ngd-compiler");
var ngd_core_1 = require("@compodoc/ngd-core");
var pkg = require('../package.json');
var program = require('commander');
var cwd = process.cwd();
var Application;
(function (Application) {
    program
        .version(pkg.version)
        .option('-f, --file <file>', 'Entry *.ts file')
        .option('-p, --tsconfig <config>', 'A tsconfig.json (default: ./tsconfig.json)', './tsconfig.json')
        .option('-o, --open', 'Open the generated HTML diagram file', false)
        .option('-g, --display-legend <display-legend>', 'Display the legend of graph default(true)', true)
        .option('-s, --silent', "In silent mode, log messages aren't logged in the console", false)
        .option('-t, --output-formats <output-formats>', 'Output formats (default: html,svg,dot,json)', "html,svg,dot,json")
        .option('-d, --output <folder>', 'Where to store the generated files (default: ./documentation)', "./documentation/")
        .parse(process.argv);
    var outputHelp = function () {
        program.outputHelp();
        process.exit(0);
    };
    Application.run = function () {
        program.silent = program.silent || false;
        ngd_core_1.logger.setVerbose(program.silent);
        var files = [];
        if (program.file) {
            if (!fs.existsSync(program.file) || !fs.existsSync(path.join(process.cwd(), program.file))) {
                ngd_core_1.logger.fatal("\"" + program.file + "\" file was not found");
                process.exit(1);
            }
            else if (path.extname(program.file) !== '.ts') {
                ngd_core_1.logger.fatal("\"" + program.file + "\" is not a TypeScript file");
                process.exit(1);
            }
            else {
                ngd_core_1.logger.info('using entry', program.file);
                files = [program.file];
            }
        }
        else if (program.tsconfig) {
            if (!fs.existsSync(program.tsconfig)) {
                ngd_core_1.logger.fatal('"tsconfig.json" file was not found in the current directory');
                process.exit(1);
            }
            else {
                program.tsconfig = path.join(path.join(process.cwd(), path.dirname(program.tsconfig)), path.basename(program.tsconfig));
                ngd_core_1.logger.info('using tsconfig', program.tsconfig);
                files = require(program.tsconfig).files;
                // use the current directory of tsconfig.json as a working directory
                cwd = program.tsconfig.split(path.sep).slice(0, -1).join(path.sep);
                if (!files) {
                    var exclude_1 = require(program.tsconfig).exclude || [];
                    var walk_1 = function (dir) {
                        var results = [];
                        var list = fs.readdirSync(dir);
                        list.forEach(function (file) {
                            if (exclude_1.indexOf(file) < 0) {
                                file = path.join(dir, file);
                                var stat = fs.statSync(file);
                                if (stat && stat.isDirectory()) {
                                    results = results.concat(walk_1(file));
                                }
                                else if (/(spec|\.d)\.ts/.test(file)) {
                                    ngd_core_1.logger.debug('ignoring', file);
                                }
                                else if (path.extname(file) === '.ts') {
                                    ngd_core_1.logger.debug('including', file);
                                    results.push(file);
                                }
                            }
                        });
                        return results;
                    };
                    files = walk_1(cwd || '.');
                }
            }
        }
        else {
            outputHelp();
        }
        if (path.isAbsolute(program.output)) {
            program.output = program.output;
        }
        else {
            program.output = path.resolve(process.cwd(), program.output);
        }
        var compiler = new ngd_compiler_1.Compiler(files, {
            tsconfigDirectory: cwd,
            silent: program.silent,
        });
        var deps = compiler.getDependencies();
        if (deps.length <= 0) {
            ngd_core_1.logger.warn('no deps', 'May be you should consider providing another entry file. See -h');
            ngd_core_1.logger.info('Done');
            process.exit(0);
        }
        var engine = new ngd_transformer_1.DotEngine({
            output: program.output,
            displayLegend: program.displayLegend,
            outputFormats: program.outputFormats.split(','),
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
            .catch(function (e) { return ngd_core_1.logger.error(e); })
            .then(function (_) { return ngd_core_1.logger.info('done'); });
    };
})(Application = exports.Application || (exports.Application = {}));
