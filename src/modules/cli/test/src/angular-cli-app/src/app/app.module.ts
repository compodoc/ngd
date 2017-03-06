import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { D1Directive } from './d1.directive';
import { D2Directive } from './d2.directive';
import { D3Directive } from './d3.directive';
import { P1Pipe } from './p1.pipe';
import { P2Pipe } from './p2.pipe';
import { P3Pipe } from './p3.pipe';

@NgModule({
  declarations: [
    AppComponent,
    D1Directive,
    D2Directive,
    D3Directive,
    P1Pipe,
    P2Pipe,
    P3Pipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
