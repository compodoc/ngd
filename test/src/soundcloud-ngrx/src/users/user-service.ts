import 'rxjs/add/operator/let';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AppState } from 'src/app';
import { User } from './models/user';
import { getCurrentUser } from './reducers/selectors';
import { UserActions } from './user-actions';


@Injectable()
export class UserService {
  currentUser$: Observable<User>;

  constructor(private actions: UserActions, private store$: Store<AppState>) {
    this.currentUser$ = store$.let(getCurrentUser());
  }

  loadResource(userId: number|string, resource: string): void {
    switch (resource) {
      case 'likes':
        this.loadUserLikes(userId);
        break;

      case 'tracks':
        this.loadUserTracks(userId);
        break;
    }
  }

  loadUser(userId: number|string): void {
    this.store$.dispatch(
      this.actions.loadUser(userId)
    );
  }

  loadUserLikes(userId: number|string): void {
    this.store$.dispatch(
      this.actions.loadUserLikes(userId)
    );
  }

  loadUserTracks(userId: number|string): void {
    this.store$.dispatch(
      this.actions.loadUserTracks(userId)
    );
  }
}
