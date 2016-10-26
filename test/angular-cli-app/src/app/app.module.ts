import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { FooDirective } from './shared/foo.directive';

@NgModule({
  declarations: [
    AppComponent,
    'Component1'
    'Component2',
    'Component3',
    'Component4',
    FooDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    'ModuleProvider1'
    'ModuleProvider2',
    'ModuleProvider3',
    'ModuleProvider4'
  ],
  exports: [
    'Component2',
    'Component3',
    'Component4'
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
