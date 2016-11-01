import { Action, ActionReducer } from '@ngrx/store';
import { PlayerActions } from '../player-actions';
import { TimesState, TimesStateRecord } from './times-state';


export const initialState: TimesState = new TimesStateRecord() as TimesState;


export const timesReducer: ActionReducer<TimesState> = (state: TimesState = initialState, {payload, type}: Action) => {
  switch (type) {
    case PlayerActions.AUDIO_ENDED:
    case PlayerActions.PLAY_SELECTED_TRACK:
      return new TimesStateRecord() as TimesState;

    case PlayerActions.AUDIO_TIME_UPDATED:
      return state.merge(payload) as TimesState;

    default:
      return state;
  }
};
