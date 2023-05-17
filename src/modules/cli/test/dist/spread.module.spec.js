"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const expect = chai.expect;
const helpers_1 = require("./helpers");
const tmp = (0, helpers_1.temporaryDir)();
describe('In the spread.module.ts file,', () => {
    let command = null;
    let json = null;
    before(() => {
        tmp.create();
        command = (0, helpers_1.shell)('node', ['../bin/index.js', '-f', '../test/src/sample-files/spread.module.ts'], { cwd: tmp.name });
        // console.log(command.stdout.toString());
        // console.log(command.stderr.toString());
        json = (0, helpers_1.read)(`${tmp.name}/documentation/dependencies.json`);
        json = JSON.parse(json);
    });
    after(() => tmp.clean());
    it('should not fail on parsing', () => {
        expect(command.stderr.toString()).to.be.empty;
    });
    it('should parse ...[CONST]', () => {
        expect(json[0].providers[0].name).to.be.eq(`...[CONST]`);
    });
    it('should parse ...CONST', () => {
        expect(json[0].providers[1].name).to.be.eq(`...CONST`);
    });
});
