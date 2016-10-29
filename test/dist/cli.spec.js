"use strict";
const chai = require('chai');
const expect = chai.expect;
const helpers_1 = require('./helpers');
const tmp = helpers_1.temporaryDir();
describe('CLI', () => {
    let runHelp = null;
    before(() => {
        tmp.create();
        runHelp = helpers_1.shell('node', ['./bin/index.js', '-h']);
    });
    after(() => tmp.clean());
    it(`should display correct version ${helpers_1.pkg.version}`, () => {
        let runVersion = helpers_1.shell('node', ['./bin/index.js', '-V']);
        expect(runVersion.stdout.toString()).to.contain(helpers_1.pkg.version);
    });
    it(`should display help message`, () => {
        expect(runHelp.stdout.toString()).to.contain('Usage: index [options]');
    });
    describe('should display options in help', () => {
        it(`-f`, () => {
            expect(runHelp.stdout.toString()).to.contain('-f, --file <file>');
            expect(runHelp.stdout.toString()).to.contain('Entry *.ts file');
        });
        it(`-p`, () => {
            expect(runHelp.stdout.toString()).to.contain('-p, --tsconfig <config>');
            expect(runHelp.stdout.toString()).to.contain('A tsconfig.json (default: ./tsconfig.json)');
        });
        it(`-o`, () => {
            expect(runHelp.stdout.toString()).to.contain('-o, --open');
            expect(runHelp.stdout.toString()).to.contain('Open the generated HTML diagram file');
        });
        it(`-g`, () => {
            expect(runHelp.stdout.toString()).to.contain('-g, --display-legend <display-legend>');
            expect(runHelp.stdout.toString()).to.contain('Display the legend of graph default(true)');
        });
        it(`-s`, () => {
            expect(runHelp.stdout.toString()).to.contain('-s, --silent');
            expect(runHelp.stdout.toString()).to.contain("In silent mode, log messages aren't logged in the console");
        });
        it(`-t`, () => {
            expect(runHelp.stdout.toString()).to.contain('-t, --output-formats <output-formats>');
            expect(runHelp.stdout.toString()).to.contain('Output formats (default: html,svg,dot,json)');
        });
        it(`-d`, () => {
            expect(runHelp.stdout.toString()).to.contain('-d, --output <folder>');
            expect(runHelp.stdout.toString()).to.contain('Where to store the generated files (default: ./documentation)');
        });
    });
});
