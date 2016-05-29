/// <reference path="../typings/_custom.d.ts" />

import { Chance } from 'chance';

export const THEMES = (() => {
	
	return [{
		"slug": "typescript",
		"title": "TypeScript",
		"logo": "images/typescript.png",
		"description": chance.sentence(25)
	}, {
		"slug": "ecma",
		"title": "ECMAScript 6",
		"logo": "images/js.jpg",
		"description": chance.sentence(25)
	}, {
		"slug": "ng2",
		"title": "Angular 2",
		"logo": "images/angular2.jpg",
		"description": chance.sentence(25)
	}, {
		"slug": "react",
		"title": "React",
		"logo": "images/react.svg",
		"description": chance.sentence(25)
	}];
	
})();