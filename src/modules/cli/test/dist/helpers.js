"use strict";
exports.shell = require('child_process').spawnSync;
exports.shellAsync = require('child_process').spawn;
exports.fs = require('fs');
exports.path = require('path');
exports.pkg = require('../../package.json');
function read(file) {
    return exports.fs.readFileSync(file).toString();
}
exports.read = read;
function exists(file) {
    return exports.fs.existsSync(file);
}
exports.exists = exists;
function temporaryDir() {
    let name = '.tmp-angular2-dependencies-graph-test';
    let cleanUp = (name) => {
        if (exports.fs.existsSync(name)) {
            exports.fs.readdirSync(name).forEach((file) => {
                var curdir = exports.path.join(name, file);
                if (exports.fs.statSync(curdir).isDirectory()) {
                    cleanUp(curdir);
                }
                else {
                    exports.fs.unlinkSync(curdir);
                }
            });
            exports.fs.rmdirSync(name);
        }
    };
    return {
        name,
        create() {
            if (!exports.fs.existsSync(name)) {
                exports.fs.mkdirSync(name);
            }
        },
        clean() {
            cleanUp(name);
        }
    };
}
exports.temporaryDir = temporaryDir;
