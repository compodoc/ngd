/// <reference path="typings/_custom.d.ts" />

import { Component, ViewEncapsulation } from 'angular2/angular2';
import { RouteConfig, Router, Location } from 'angular2/router';

import { Toolbar } from './components/toolbar/toolbar';
import { QuestionsStore } from './services/QuestionsStore';
import { APP_ROUTES } from './routes.config';

@Component({
  selector: 'devfest',
  template: '<toolbar></toolbar>' ,
  directives: [ Toolbar ],
  providers: [ QuestionsStore ],
  encapsulation: ViewEncapsulation.None
})
@RouteConfig(APP_ROUTES)
export class Devfest {
  constructor(router: Router, location: Location) {
    router.navigate(['/Home']);
  }
}