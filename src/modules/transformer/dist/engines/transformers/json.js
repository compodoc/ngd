"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var path = require("path");
var ngd_core_1 = require("@compodoc/ngd-core");
var JsonTransformer = (function () {
    function JsonTransformer() {
        this.type = 'json';
    }
    JsonTransformer.prototype.transform = function (deps, options) {
        return new Promise(function (resolve, reject) {
            var content = JSON.stringify(deps, null, 2);
            var file = path.join(options.output, '/dependencies.json');
            fs.outputFile(file, content, function (error) {
                if (error) {
                    reject(error);
                }
                ngd_core_1.logger.info('output JSON', file);
                resolve(file);
            });
        });
    };
    return JsonTransformer;
}());
exports.JsonTransformer = JsonTransformer;
