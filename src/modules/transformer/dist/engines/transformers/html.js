"use strict";
var path = require("path");
var ngd_core_1 = require("@compodoc/ngd-core");
var HtmlTransformer = (function () {
    function HtmlTransformer() {
        this.type = 'html';
    }
    HtmlTransformer.prototype.transform = function (deps, options) {
        return new Promise(function (resolve, reject) {
            var content = JSON.stringify(deps, null, 2);
            var file = path.join(options.output, '/dependencies.html');
            ngd_core_1.logger.info('creating HTML', file);
            return resolve();
        });
    };
    return HtmlTransformer;
}());
exports.HtmlTransformer = HtmlTransformer;
