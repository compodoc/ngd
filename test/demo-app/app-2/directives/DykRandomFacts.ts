/// <reference path="../_all.ts" />

module DYK {
	'use strict';
		
	export function dykRandomFacts($interval: ng.IIntervalService): ng.IDirective {
		return {
			restrict: 'E',
			scope: false,
			replace: false,
			templateUrl: 'views/dyk-random-facts.html',
			controller: 'FactsController as factsCtrl',
			link: ($scope: IFact, element: JQuery, attributes) => {}
		}
	}
};