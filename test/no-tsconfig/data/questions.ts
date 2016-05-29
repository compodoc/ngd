/// <reference path="../typings/_custom.d.ts" />

import { Chance } from 'chance';

let gimme = (max: Number, definition: Function) => {
	return Array.apply(null, {length: max}).map(definition);
}

let bool = () => chance.bool({likelihood: 50});

export const QUESTIONS = gimme(2, (item, index) => {
	return {
		id: 3,//chance.guid(),
		title: `Question #${index+1} : `,
		description: chance.sentence(25),
		choices: [{
			id: chance.guid(),
			label: chance.word(),
			correct: bool()
		}, {
			id: chance.guid(),
			label: chance.word(),
			correct: bool()
		}, {
			id: chance.guid(),
			label: chance.word(),
			correct: bool()
		}, {
			id: chance.guid(),
			label: chance.word(),
			correct: bool()
		}]
	}
});