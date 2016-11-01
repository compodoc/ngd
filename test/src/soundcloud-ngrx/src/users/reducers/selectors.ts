import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';

import { AppState } from 'src/app';
import { Selector } from 'src/core';
import { User } from '../models/user';
import { UsersState } from './users-reducer';


export function getCurrentUser(): Selector<AppState,User> {
  return state$ => state$
    .let(getUsers())
    .map(users => users.get(users.get('currentUserId')))
    .distinctUntilChanged();
}

export function getUsers(): Selector<AppState,UsersState> {
  return state$ => state$
    .map(state => state.users)
    .distinctUntilChanged();
}
