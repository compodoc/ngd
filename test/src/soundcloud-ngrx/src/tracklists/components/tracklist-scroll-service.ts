import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/never';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';

import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Selector } from 'src/core';
import { Tracklist } from '../models/tracklist';
import { TracklistService } from '../tracklist-service';


interface ScrollData {
  windowInnerHeight: number;
  windowPageYOffset: number;
  bodyScrollHeight: number;
}


@Injectable()
export class TracklistScrollService {
  private infiniteScroll$: Observable<any>;
  private scrollData$: Observable<ScrollData>;


  constructor(private tracklist: TracklistService, private zone: NgZone) {
    this.scrollData$ = Observable
      .fromEvent(window, 'scroll')
      .debounceTime(100)
      .let(this.getScrollData());

    const checkPosition$ = this.scrollData$
      .filter((data: ScrollData) => {
        return data.windowInnerHeight + data.windowPageYOffset >= data.bodyScrollHeight - data.windowInnerHeight;
      });

    const pause$ = Observable.never();

    this.infiniteScroll$ = tracklist.tracklist$
      .map(({isPending, hasNextPage}: Tracklist) => isPending || !hasNextPage)
      .switchMap(pause => pause ? pause$ : checkPosition$)
      .do(() => this.zone.run(() => this.tracklist.loadNextTracks()));
  }


  infinite(cancel$?: Observable<any>): Subscription {
    return this.infiniteScroll$
      .takeUntil(cancel$)
      .subscribe();
  }

  private getScrollData(): Selector<UIEvent,ScrollData> {
    return event$ => event$
      .map(event => {
        const { body, defaultView } = event.target as HTMLDocument;
        return {
          windowInnerHeight: defaultView.innerHeight,
          windowPageYOffset: defaultView.pageYOffset,
          bodyScrollHeight: body.scrollHeight
        };
      });
  }
}
