import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/withLatestFrom';

import { AppState } from 'src/app';
import { Selector } from 'src/core';
import { getTracklistCursor, getTracklists, getTracks, Track, Tracklist, TracklistCursor } from 'src/tracklists';
import { PlayerState } from './player-state';
import { TimesState } from './times-state';


export function getPlayer(): Selector<AppState,PlayerState> {
  return state$ => state$
    .map(state => state.player)
    .distinctUntilChanged();
}

export function getPlayerTrack(): Selector<AppState,Track> {
  return state$ => state$
    .let(getPlayerTrackId())
    .distinctUntilChanged()
    .withLatestFrom(state$.let(getTracks()),
      (trackId, tracks) => tracks.get(trackId))
    .filter(track => !!track)
    .distinctUntilChanged();
}

export function getPlayerTrackId(): Selector<AppState,number> {
  return state$ => state$
    .map(state => state.player.trackId);
}

export function getPlayerTracklist(): Selector<AppState,Tracklist> {
  return state$ => state$
    .map(state => state.player.tracklistId)
    .combineLatest(state$.let(getTracklists()),
      (tracklistId, tracklists) => tracklists.get(tracklistId))
    .filter(tracklist => tracklist)
    .distinctUntilChanged();
}

export function getPlayerTracklistCursor(distinct: boolean = true): Selector<AppState,TracklistCursor> {
  return state$ => {
    let source$ = state$.let(getPlayerTrackId());
    if (distinct) source$ = source$.distinctUntilChanged();
    return source$.combineLatest(state$.let(getPlayerTracklist()), getTracklistCursor);
  };
}

export function getTimes(): Selector<AppState,TimesState> {
  return state$ => state$
    .map(state => state.times)
    .distinctUntilChanged();
}
