import * as chai from 'chai';
const expect = chai.expect;

import { temporaryDir, shell, shellAsync, exists, read } from './helpers';
const tmp = temporaryDir();

let check = {
    _(type: string, child, expected = true) {
        it(`should${expected ? '' : ' not'} generate a "${type}" file`, () => {
            expect(exists(`${tmp.name}/documentation/dependencies.${type}`)).to.be[`${expected}`];
        });
    },
    json(child, expected = true) {
        this._('json', child, expected);
    },
    dot(child, expected = true) {
        this._('dot', child, expected);
    },
    svg(child, expected = true) {
        this._('svg', child, expected);
    },
    html(child, expected = true) {
        this._('html', child, expected);
    }
}

describe('In the sample files,', () => {

    // before(() => tmp.create());
    // afterEach(() => tmp.clean());

    describe('when no tsconfig.json is found in cwd', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index.js'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('"tsconfig.json" file was not found in the current directory');
        });

        it(`should not create a "documentation" directory`, () => {
            const isFolderExists = exists(`${tmp.name}/documentation`);
            expect(isFolderExists).to.be.false;
        });
    });

    describe('when given a wrong TypeScript file', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/tsconfig.entry.json'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('is not a TypeScript file');
        });

    });

    describe('when given a 404 file', () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/no-file.ts'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should display error message', () => {
            expect(command.stdout.toString()).to.contain('file was not found');
        });

    });

    describe(`when given a file entry (-f),`, () => {

        let command = null;
        before(() => {
            tmp.create();
            command = shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/app.module.ts'], { cwd: tmp.name });
        });
        after(() => tmp.clean());

        check.json(command);
        check.dot(command);
        check.svg(command);
        check.html(command);
    });

    describe(`when given a tsconfig.json (-p) with "files" entry,`, () => {

        let command = null;
        before(() => {
            tmp.create();
            command = shell('node', ['../bin/index.js', '-p', '../test/src/sample-files/tsconfig.entry.json'], { cwd: tmp.name });
        });
        //after(() => tmp.clean());

        check.json(command);
        check.dot(command);
        check.svg(command);
        check.html(command);

    });

    xdescribe(`when given a tsconfig.json (-p) with "exclude" entry,`, () => {

        let command = null;
        beforeEach(() => {
            tmp.create();
            command = shell('node', ['../bin/index.js', '-p', '../test/src/sample-files/tsconfig.exclude.json'], { cwd: tmp.name });
        });
        afterEach(() => tmp.clean());

        it('should not generate foo.module.ts', () => {
            expect(command.stdout.toString()).not.to.contain('');
        });

    });

    describe(`when given a legend configuration (-g),`, () => {

        describe(`if "-g true",`, () => {
            let command = null;
            beforeEach(() => {
                tmp.create();
                command = shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/app.module.ts'], { cwd: tmp.name });
            });
            afterEach(() => tmp.clean());

            it('should generate a legend', () => {
                const content = read(`${tmp.name}/documentation/dependencies.svg`);
                expect(content).to.contain('Legend');
            });
        });

        describe(`if -g is not provided (default),`, () => {
            let command = null;
            beforeEach(() => {
                tmp.create();
                command = shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/app.module.ts', '-g', 'true'], { cwd: tmp.name });
            });
            afterEach(() => tmp.clean());

            it('should generate a legend', () => {
                const content = read(`${tmp.name}/documentation/dependencies.svg`);
                expect(content).to.contain('Legend');
            });
        });

        describe(`if "-g false",`, () => {
            let command = null;
            beforeEach(() => {
                tmp.create();
                command = shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/app.module.ts', '-g', 'false'], { cwd: tmp.name });
            });
            afterEach(() => tmp.clean());

            it('should not generate', () => {
                const content = read(`${tmp.name}/documentation/dependencies.svg`);
                expect(content).not.to.contain('Legend');
            });
        });

    });

    describe(`when given an output formats (-t),`, () => {

        describe(`if "-t html",`, () => {

            let command = null;
            before(() => {
                tmp.create();
                command = shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/app.module.ts', '-t', 'html'], { cwd: tmp.name });
            });
            after(() => tmp.clean());

            check.json(command, false);
            check.dot(command, false);
            check.svg(command, false);
            check.html(command, true);

        });

        describe(`if "-t json",`, () => {

            let command = null;
            before(() => {
                tmp.create();
                command = shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/app.module.ts', '-t', 'json'], { cwd: tmp.name });
            });
            after(() => tmp.clean());

            check.json(command, true);
            check.dot(command, false);
            check.svg(command, false);
            check.html(command, false);

        });

        describe(`if "-t dot",`, () => {

            let command = null;
            before(() => {
                tmp.create();
                command = shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/app.module.ts', '-t', 'dot'], { cwd: tmp.name });
            });
            after(() => tmp.clean());

            check.json(command, false);
            check.dot(command, true);
            check.svg(command, false);
            check.html(command, false);

        });

        describe(`if "-t svg",`, () => {

            let command = null;
            before(() => {
                tmp.create();
                command = shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/app.module.ts', '-t', 'svg'], { cwd: tmp.name });
            });
            after(() => tmp.clean());

            check.json(command, false);
            check.dot(command, false);
            check.svg(command, true);
            check.html(command, false);

        });

    });

});
