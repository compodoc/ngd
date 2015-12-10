/// <reference path="../typings/_custom.d.ts" />

export class LifeCyclesHooks {
	
  // Lifecyles methods
  onInit(...args) {
    console.log('>> OnInit', args);
  }
  onDestroy(...args) {
    console.log('>> OnDestroy', args);
  }
  doCheck(...args) {
    console.log('>> DoCheck', args);
  }
  onChanges(...args) {
    console.log('>> OnChanges', args);
  }
  afterContentInit(...args) {
    console.log('>> AfterContentInit', args);
  }
  afterContentChecked(...args) {
    console.log('>> AfterContentChecked', args);
  }
  afterViewInit(...args) {
    console.log('>> AfterViewInit', args);
  }
  afterViewChecked(...args) {
    console.log('>> AfterViewChecked', args);
  }
  
}