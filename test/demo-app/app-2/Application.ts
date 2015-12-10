/// <reference path="_all.ts" />

/**
 * The main DYK app module.
 *
 * @type {angular.Module}
 * @author Wassim CHEGHAM <maneki.nekko@gmail.com>
 * @version 2.0.0
 */
module DYK {
    'use strict';

    var dyk = angular.module('didYouKnow', ['ngResource'])
        .service('FactsService', FactsService)
        .controller('FactsController', FactsController)
        .directive('dykRandomFacts', dykRandomFacts)
        .directive('dykTimer', dykTimer)
};