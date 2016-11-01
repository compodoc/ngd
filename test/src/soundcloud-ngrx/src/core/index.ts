import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { ApiService } from './api';
import { MEDIA_QUERY_PROVIDERS, MediaQueryResults, MediaQueryService } from './media-query';


export { ApiService, MediaQueryResults, MediaQueryService };
export * from './interfaces';


@NgModule({
  imports: [
    HttpModule
  ],
  providers: [
    ApiService,
    MEDIA_QUERY_PROVIDERS
  ]
})
export class CoreModule {}
