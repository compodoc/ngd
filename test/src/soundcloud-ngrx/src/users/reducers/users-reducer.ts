import { Action, ActionReducer } from '@ngrx/store';
import { Map } from 'immutable';
import { TracklistActions } from 'src/tracklists';
import { createUser } from '../models/user';
import { UserActions } from '../user-actions';


export type UsersState = Map<any,any>;

export const initialState: UsersState = Map<any,any>({
  currentUserId: null
});


export const usersReducer: ActionReducer<UsersState> = (state: UsersState = initialState, {payload, type}: Action) => {
  switch (type) {
    case TracklistActions.FETCH_TRACKS_FULFILLED:
      return state.withMutations(users => {
        payload.collection.forEach(track => {
          if (!users.has(track.user.id)) {
            users.set(track.user.id, createUser(track.user));
          }
        });
      });

    case UserActions.FETCH_USER_FULFILLED:
      return state.withMutations(users => {
        const { user } = payload;
        if (!users.has(user.id) || !users.get(user.id).profile) {
          users.set(user.id, createUser(user, true));
        }
      });

    case UserActions.LOAD_USER:
      return state.set('currentUserId', payload.userId);

    default:
      return state;
  }
};
