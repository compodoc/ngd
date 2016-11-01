import { Map, Record } from 'immutable';
import { Tracklist } from './models/tracklist';


export interface TracklistCursor extends Map<string,number> {
  currentTrackId: number;
  nextTrackId: number;
  previousTrackId: number;
}

export const TracklistCursorRecord = Record({
  currentTrackId: null,
  nextTrackId: null,
  previousTrackId: null
});


export function getTracklistCursor(trackId: number, {trackIds}: Tracklist): TracklistCursor {
  let index = trackIds.indexOf(trackId);
  let nextTrackId = null;
  let previousTrackId = null;

  if (index !== -1) {
    if (index < trackIds.size - 1) {
      nextTrackId = trackIds.get(index + 1);
    }

    if (index > 0) {
      previousTrackId = trackIds.get(index - 1);
    }
  }

  return new TracklistCursorRecord({
    currentTrackId: trackId,
    nextTrackId,
    previousTrackId
  }) as TracklistCursor;
}
