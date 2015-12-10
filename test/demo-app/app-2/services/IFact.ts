/// <reference path="../_all.ts" />

module DYK {
	'use strict';
	
	export interface IFact extends ng.IScope {
		fact: {
			category: string,
			label: string
		}
		
		data: Array<{
			text: string,
			facts: string[]
		}>
		
		width: number
	}
	
}