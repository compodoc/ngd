/// <reference path="../../typings/_custom.d.ts" />

import { Component, NgFor, ViewEncapsulation } from 'angular2/angular2';

import { ThemeCard } from './theme-card/theme-card';
import { TechnologiesStore, ITechnology } from '../../services/TechnologiesStore';

@Component({
  selector: 'home',
  providers: [ TechnologiesStore ],
  templateUrl: './components/home/home.html',
  directives: [NgFor, ThemeCard],
  encapsulation: ViewEncapsulation.None
})
export class Home {
  
  private themeCards: any[];
  
  constructor(technologiesStore: TechnologiesStore){
    technologiesStore.fetch().then((themes) => {
      this.themeCards = themes;
    });
  }
  
  updateTitle() {
    //console.log(arguments);
  }
  
}
