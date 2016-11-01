"use strict";
const chai = require('chai');
const expect = chai.expect;
const helpers_1 = require('./helpers');
const tmp = helpers_1.temporaryDir();
describe('In the soundcloud-ngrx app,', () => {
    let command = null;
    let json = null;
    let topLevelModules = [];
    before(() => {
        tmp.create();
        //command = shell('node', ['../bin/index.js', '-f', '../test/src/soundcloud-ngrx/src/main.ts'], { cwd: tmp.name });
        command = helpers_1.shell('node', ['../bin/index.js', '-p', '../test/src/soundcloud-ngrx/tsconfig.json'], { cwd: tmp.name });
        // console.log(command.stdout.toString());
        // console.log(command.stderr.toString());
        json = helpers_1.read(`${tmp.name}/documentation/dependencies.json`);
        json = JSON.parse(json);
        topLevelModules = json.map(m => m.name);
    });
    after(() => tmp.clean());
    it('should not fail on parsing', () => {
        expect(command.stderr.toString()).to.be.empty;
    });
    [
        'AppModule',
        'CoreModule',
        'HomeModule',
        'PlayerModule',
        'SearchModule',
        'SharedModule',
        'TracklistsModule',
        'UsersModule',
    ].forEach((m) => {
        it(`should generate top level module: ${m}`, () => {
            expect(topLevelModules).to.contains(m);
        });
    });
});
