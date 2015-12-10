/// <reference path="../_all.ts" />

module DYK {
	'use strict';

	export class FactsController {
		
		public static $inject = ['$scope', 'FactsService'];
		private fact: IFactModel;
			
		constructor(private $scope: ng.IScope,  private facts: IFactsService){
		 	this.fact = null;			 
		 	this.$scope.$on('fact.update', (evt, newFact: IFactModel) => this.fact = newFact );
		}
	}

}