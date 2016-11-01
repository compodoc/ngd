import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AppState } from 'src/app';
import { ApiService } from 'src/core';
import { getCurrentTracklist, TracklistActions } from 'src/tracklists';
import { getCurrentUser } from './reducers/selectors';
import { UserActions } from './user-actions';


@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private api: ApiService,
    private store$: Store<AppState>,
    private tracklistActions: TracklistActions,
    private userActions: UserActions
  ) {}

  @Effect()
  loadUser$ = this.actions$
    .ofType(UserActions.LOAD_USER)
    .withLatestFrom(this.store$.let(getCurrentUser()), (action, user) => ({
      payload: action.payload,
      user
    }))
    .filter(({user}) => !user || !user.profile)
    .switchMap(({payload}) => this.api.fetchUser(payload.userId)
      .map(data => this.userActions.fetchUserFulfilled(data))
      .catch(error => Observable.of(this.userActions.fetchUserFailed(error)))
    );

  @Effect()
  loadUserLikes$ = this.actions$
    .ofType(UserActions.LOAD_USER_LIKES, TracklistActions.LOAD_FEATURED_TRACKS)
    .withLatestFrom(this.store$.let(getCurrentTracklist()), (action, tracklist) => ({
      payload: action.payload,
      tracklist
    }))
    .filter(({tracklist}) => tracklist.isNew)
    .switchMap(({payload}) => this.api.fetchUserLikes(payload.userId)
      .map(data => this.tracklistActions.fetchTracksFulfilled(data, payload.tracklistId))
      .catch(error => Observable.of(this.tracklistActions.fetchTracksFailed(error)))
    );

  @Effect()
  loadUserTracks$ = this.actions$
    .ofType(UserActions.LOAD_USER_TRACKS)
    .withLatestFrom(this.store$.let(getCurrentTracklist()), (action, tracklist) => ({
      payload: action.payload,
      tracklist
    }))
    .filter(({tracklist}) => tracklist.isNew)
    .switchMap(({payload}) => this.api.fetchUserTracks(payload.userId)
      .map(data => this.tracklistActions.fetchTracksFulfilled(data, payload.tracklistId))
      .catch(error => Observable.of(this.tracklistActions.fetchTracksFailed(error)))
    );
}
