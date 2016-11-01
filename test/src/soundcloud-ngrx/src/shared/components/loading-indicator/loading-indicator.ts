import { Component } from '@angular/core';


@Component({
  selector: 'loading-indicator',
  styles: [
    require('./loading-indicator.scss')
  ],
  template: `
    <div class="loading-indicator">
      <div class="circle circle--1"></div>
      <div class="circle circle--2"></div>
      <div class="circle circle--3"></div>
    </div>
  `
})
export class LoadingIndicatorComponent {}
