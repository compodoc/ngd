"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var path = require("path");
var ngd_core_1 = require("@compodoc/ngd-core");
var html_dagre_1 = require("./html-dagre");
var HtmlTransformer = (function () {
    function HtmlTransformer() {
        this.type = 'html';
    }
    HtmlTransformer.prototype.transform = function (deps, options) {
        return new Promise(function (resolve, reject) {
            var content = html_dagre_1.html(deps);
            var file = path.join(options.output, '/dependencies.html');
            fs.outputFile(file, content, function (error) {
                if (error) {
                    reject(error);
                }
                ngd_core_1.logger.info('output HTML', file);
                resolve(file);
            });
        });
    };
    return HtmlTransformer;
}());
exports.HtmlTransformer = HtmlTransformer;
