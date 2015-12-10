/// <reference path="typings/_custom.d.ts" />

import { provide, bootstrap } from 'angular2/angular2';
import { QUESTIONS } from './data/questions';
import { ROUTER_PROVIDERS, HashLocationStrategy, LocationStrategy } from 'angular2/router';
import { Devfest } from './app';

bootstrap(Devfest, [
	ROUTER_PROVIDERS, 
	provide(Array, {useValue: QUESTIONS}),
	provide(LocationStrategy, {useClass: HashLocationStrategy})
]);