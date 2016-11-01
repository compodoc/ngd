import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromEventPattern';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishReplay';
import '@ngrx/core/add/operator/enterZone';

import { Inject, Injectable, NgZone, OpaqueToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MediaQueryResults, MediaQueryRule, MediaQueryUpdate } from './interfaces';
import { getMedia } from './utils';


export const MEDIA_QUERY_RULES = new OpaqueToken('MEDIA_QUERY_RULES');


@Injectable()
export class MediaQueryService {
  matches$: Observable<MediaQueryResults>;

  constructor(@Inject(MEDIA_QUERY_RULES) rules: MediaQueryRule[], zone: NgZone) {
    this.matches$ = Observable
      .combineLatest(...this.getMqlObservables(rules))
      .debounceTime(5)
      .map(this.getResults)
      .enterZone(zone)
      .publishReplay(1)
      .refCount();
  }

  private getMqlObservables(rules: MediaQueryRule[]): any[] {
    return rules.map(rule => {
      const mediaQueryList = window.matchMedia(getMedia(rule));
      return Observable.fromEventPattern(
        (handler: MediaQueryListListener) => {
          handler(mediaQueryList);
          mediaQueryList.addListener(handler);
        },
        (handler: MediaQueryListListener) => mediaQueryList.removeListener(handler),
        (mql: MediaQueryList) => ({mql, rule})
      );
    });
  }

  private getResults(updates: MediaQueryUpdate[]): MediaQueryResults {
    return updates.reduce((acc, cur) => {
      acc[cur.rule.id] = cur.mql.matches;
      return acc;
    }, {} as MediaQueryResults);
  }
}
