import * as chai from 'chai';
const expect = chai.expect;

import { temporaryDir, shell, read } from './helpers';
const tmp = temporaryDir();

describe('In the spread.module.ts file,', () => {

    let command = null;
    let json: any = null;
    before(() => {
        tmp.create()
        command = shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/spread.module.ts'], { cwd: tmp.name });
        // console.log(command.stdout.toString());
        // console.log(command.stderr.toString());
        json = read(`${tmp.name}/documentation/dependencies.json`);
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
