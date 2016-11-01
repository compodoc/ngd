import 'rxjs/add/operator/let';
import 'rxjs/add/operator/pluck';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { PLAYER_INITIAL_VOLUME } from 'src/constants';
import { AppState } from 'src/app';
import { Track, TracklistCursor } from 'src/tracklists';
import { PlayerState } from './reducers/player-state';
import { getPlayer, getPlayerTrack, getPlayerTracklistCursor, getTimes } from './reducers/selectors';
import { TimesState } from './reducers/times-state';
import { AudioService } from './audio-service';
import { AudioSource } from './audio-source';
import { PlayerActions } from './player-actions';
import { playerStorage } from './player-storage';


@Injectable()
export class PlayerService extends AudioService {
  currentTime$: Observable<number>;
  cursor$: Observable<TracklistCursor>;
  player$: Observable<PlayerState>;
  times$: Observable<TimesState>;
  track$: Observable<Track>;


  constructor(private actions: PlayerActions, audio: AudioSource, private store$: Store<AppState>) {
    super(actions, audio);

    this.events$.subscribe(action => store$.dispatch(action));
    this.volume = playerStorage.volume || PLAYER_INITIAL_VOLUME;

    this.cursor$ = store$.let(getPlayerTracklistCursor());
    this.player$ = store$.let(getPlayer());

    this.track$ = store$.let(getPlayerTrack());
    this.track$.subscribe(track => this.play(track.streamUrl));

    this.times$ = store$.let(getTimes());
    this.currentTime$ = this.times$.pluck<number>('currentTime');
  }


  select({trackId, tracklistId}: {trackId: number, tracklistId: string}): void {
    this.store$.dispatch(
      this.actions.playSelectedTrack(trackId, tracklistId)
    );
  }
}
