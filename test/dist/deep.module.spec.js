"use strict";
const chai = require('chai');
const expect = chai.expect;
const helpers_1 = require('./helpers');
const tmp = helpers_1.temporaryDir();
describe('In the deep.module.ts file,', () => {
    let command = null;
    let json = null;
    before(() => {
        tmp.create();
        command = helpers_1.shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/deep.module.ts'], { cwd: tmp.name });
        json = helpers_1.read(`${tmp.name}/documentation/dependencies.json`);
        json = JSON.parse(json);
    });
    after(() => tmp.clean());
    it('should not fail on parsing', () => {
        expect(command.stderr.toString()).to.be.empty;
    });
    it('should detect dots in module names', () => {
        expect(json[0].imports[0].name).to.be.eq('RouterModule.forRoot(args)');
    });
    it('should detect arguments in module configuration', () => {
        expect(json[0].imports[1].name).to.be.eq('StoreModule.provideStore(args)');
    });
    it('should detect deep dots in module names (level 1)', () => {
        expect(json[0].imports[3].name).to.be.eq('HomeModule.yolo1()');
    });
    it('should detect deep dots in module names (level 2)', () => {
        expect(json[0].imports[4].name).to.be.eq('HomeModule.bar.yolo2()');
    });
    it('should detect deep dots in module names (level 3)', () => {
        expect(json[0].imports[5].name).to.be.eq('HomeModule.foo.bar.yolo3(args)');
    });
});
