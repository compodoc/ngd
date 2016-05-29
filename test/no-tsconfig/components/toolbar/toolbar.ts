/// <reference path="../../typings/_custom.d.ts" />

import { Component, EventEmitter } from 'angular2/angular2';
import { Router, RouterOutlet, RouterLink } from 'angular2/router';
import { FixScrolling } from './fix-scrolling';

@Component({
  selector: 'toolbar',
  host: {
    '(^updatetitle)': 'onUpdateTitle()'
  },
  templateUrl: 'components/toolbar/toolbar.html',
  directives: [ RouterOutlet, RouterLink, FixScrolling ]  
})
export class Toolbar {
  
  private title: string = 'Angular 2 Quiz App';
  private router: Router;
  
  constructor(router: Router) {
    this.router = router;
  }
  
  onUpdateTitle(title: string) {
    debugger;
    this.title = title; 
  }
  
}
