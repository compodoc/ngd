import { NgModule } from '@angular/core';
const CONST = [];

@NgModule({
  providers: [
    ...[CONST],
    ...CONST
  ]
})
export class AppModule { }
