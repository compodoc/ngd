import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { List } from 'immutable';
import { Observable } from 'rxjs/Observable';
import { MediaQueryResults } from 'src/core';
import { PlayerState, TimesState } from 'src/player';
import { Tracklist } from '../models/tracklist';
import { Track } from '../models/track';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tracklist-items',
  styles: [
    require('./tracklist-items.scss')
  ],
  template: `
    <div *ngIf="media && tracklist" class="g-row g-cont tracklist-items" [ngClass]="{'has-line-clamp': hasLineClamp}">
      <track-card
        *ngFor="let track of tracks | async"
        class="g-col"
        [ngClass]="{'sm-2/4 md-1/3 lg-1/4': !media.large || layout === 'compact'}"
        [compact]="!media.large || layout === 'compact'"
        [isPlaying]="track.id === player.trackId && player.isPlaying"
        [isSelected]="track.id === player.trackId"
        [times]="times"
        [track]="track"
        (pause)="pause.emit()"
        (play)="track.id === player.trackId ? play.emit() : select.emit({trackId: track.id, tracklistId: tracklist.id})"
        (seek)="seek.emit($event)"></track-card>
    </div>

    <loading-indicator *ngIf="tracklist.isPending || tracklist.hasNextPage"></loading-indicator>
  `
})
export class TracklistItemsComponent {
  @Input() layout: string;
  @Input() media: MediaQueryResults;
  @Input() player: PlayerState;
  @Input() times: Observable<TimesState>;
  @Input() tracklist: Tracklist;
  @Input() tracks: Observable<List<Track>>;

  @Output() pause = new EventEmitter(false);
  @Output() play = new EventEmitter(false);
  @Output() seek = new EventEmitter(false);
  @Output() select = new EventEmitter(false);

  get hasLineClamp(): boolean {
    return '-webkit-line-clamp' in document.body.style;
  }
}
