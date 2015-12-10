/// <reference path="../_all.ts" />

module DYK {
	'use strict';

	var fact: any;		

	export class FactsService implements IFactsService {

		public static $inject = ['$resource', '$rootScope'];
		
		private facts: ng.resource.IResourceClass<ng.resource.IResource<IFact>>;
		private cache: ng.resource.IResource<IFact>;
		public fact: IFactModel;
		
		constructor(private $resource: ng.resource.IResourceService, private $rootScope: ng.IRootScopeService) {
			this.fact = null;
			this.facts = $resource(DYK.Config.DATA_URL);
			this.cache = this.facts.get();
			this.randomize();
		}
		
		private broadcast(fact: IFactModel) {
			this.$rootScope.$broadcast('fact.update', fact);
		}
		
		randomize() {
			this.cache.$promise.then( (response) => {
				let dataCount = response.data.length;
				let randomData = Math.random()*dataCount | 0;
				let ffact = response.data[randomData] || response.data[0];
				let factsCount = ffact.facts.length
				let randomFact = Math.random()*factsCount | 0;
				
				this.broadcast({
					category: ffact.text,
					label: ffact.facts[randomFact] || ffact.facts[0]
				});
			});
		}
	}
}