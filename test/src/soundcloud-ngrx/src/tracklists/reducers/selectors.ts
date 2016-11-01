import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/withLatestFrom';

import { List } from 'immutable';
import { AppState } from 'src/app';
import { TRACKS_PER_PAGE } from 'src/constants';
import { Selector } from 'src/core';
import { Tracklist } from '../models/tracklist';
import { Track } from '../models/track';
import { TracklistsState } from './tracklists-reducer';
import { TracksState } from './tracks-reducer';


export function getTracklists(): Selector<AppState,TracklistsState> {
  return state$ => state$
    .map(state => state.tracklists)
    .distinctUntilChanged();
}

export function getTracks(): Selector<AppState,TracksState> {
  return state$ => state$
    .map(state => state.tracks)
    .distinctUntilChanged();
}

export function getCurrentTracklist(): Selector<AppState,Tracklist> {
  return state$ => state$
    .let(getTracklists())
    .map(tracklists => tracklists.get(tracklists.get('currentTracklistId')))
    .filter(tracklist => tracklist)
    .distinctUntilChanged();
}

export function getTracksForCurrentTracklist(): Selector<AppState,List<Track>> {
  return state$ => state$
    .let(getCurrentTracklist())
    .distinctUntilChanged((previous, next) => {
      return previous.currentPage === next.currentPage &&
             previous.trackIds === next.trackIds;
    })
    .withLatestFrom(state$.let(getTracks()), (tracklist, tracks) => {
      return tracklist.trackIds
        .slice(0, tracklist.currentPage * TRACKS_PER_PAGE)
        .map(id => tracks.get(id)) as List<Track>;
    });
}
