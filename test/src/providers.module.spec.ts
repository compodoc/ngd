import * as chai from 'chai';
const expect = chai.expect;

import { temporaryDir, shell, read } from './helpers';
const tmp = temporaryDir();

describe('In the providers.module.ts file,', () => {

    let command = null;
    let json: any = null;
    before(() => {
        tmp.create()
        command = shell('node', ['../bin/index.js', '-f', '../test/src/sample-files/providers.module.ts'], { cwd: tmp.name });
        // console.log(command.stdout.toString());
        // console.log(command.stderr.toString());
        json = read(`${tmp.name}/documentation/dependencies.json`);
        json = JSON.parse(json);
    });
    after(() => tmp.clean());


    it('should not fail on parsing', () => {
        expect(command.stderr.toString()).to.be.empty;
    });

    it('should parse "useValue" ', () => {
        expect(json[0].providers[0].name).to.be.eq(`{ provide: APP_BASE_HREF, useValue: '/' }`);
    });

    it('should parse "useClass" ', () => {
        expect(json[0].providers[1].name).to.be.eq(`{ provide: APP_BASE_HREF, useClass: 'FooService' }`);
    });

    it('should parse "useExisting" ', () => {
        expect(json[0].providers[2].name).to.be.eq(`{ provide: APP_BASE_HREF, useExisting: 'BarService' }`);
    });

    it('should parse "useFactory" ', () => {
        expect(json[0].providers[3].name).to.be.eq(`{ provide: 'Date', useFactory: (d1, d2) => {}, deps: ['d1', APP_BASE_HREF] }`);
    });

});
